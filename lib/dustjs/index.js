'use strict';

var vm = require('vm'),
    fs = require('fs'),
    path = require('path'),
    freshy = require('freshy'),
    River = require('./river'),
    concat = require('concat-stream');


function loadHelpers(dust) {
    var helpers, script;
    helpers = require.resolve('dustjs-helpers');
    helpers = fs.readFileSync(helpers, { encoding: 'utf8' });
    script = vm.createScript(helpers);
    script.runInNewContext({ dust: dust });
}



function copy(src, dest) {
    Object.keys(src).forEach(function (key) {
        dest[key]= src[key];
    });
    return dest;
}


function walk(stack, dest) {
    if (stack) {
        stack.head && copy(stack.head, dest);
        walk(stack.tail, dest);
    }
    return dest;
}


function flatten(context) {
    var dest;
    if (typeof context._get !== 'function') {
        return copy(context, {});
    }
    dest = copy(context.global, {});
    return walk(context.stack, dest);
}



module.exports = function (basedir, onload) {
    var dust, patch, context;

    // Get a non-global version of dustjs.
    dust = freshy.freshy('dustjs-linkedin');
    dust.onLoad = function (name, context, cb) {
        onload(name, flatten(context), cb);
    };

    patch = require('dustjs-onload-context');
    patch(dust);

    // Shim the context and loadSource so we reuse the local dust cache and not the global one.
    context = vm.createContext({
        dust: {
            register: function (name, fn) {
                dust.cache[name] = fn;
            }
        }
    });

    dust.loadSource = function loadSource(source, path) {
        return vm.runInContext(source, context, path);
    };

    loadHelpers(dust);

    // Define a component helper to act as our rendering abstraction.
    // Merely requires the specified renderer and delegates rendering
    // of the current component to it.
    dust.helpers.component = function (chunks, context, bodies, params) {
        var renderer = require(path.resolve(basedir, params.renderer));

        context = flatten(context);

        function doRender(chunk) {
            function onRender(err, data) {
                if (err) {
                    chunk.setError(err);
                    return;
                }
                return chunk.write(data).end();
            }

            // turn context into a regular object before
            // handing off to renderer.
            renderer.render(context, onRender);
        }

        return chunks.map(doRender);
    };

    return {

        render: function (name, context, cb) {
            var stream, dest;

            stream = new River(dust.stream(name, context));
            if (typeof cb === 'function') {
                dest = concat({ encoding: 'string' }, cb.bind(null, null));
                stream.on('error', cb).pipe(dest);
                return undefined;
            }

            return stream;
        }

    };
};