'use strict';

var vm = require('vm');
var freshy = require('freshy');
var River = require('./river');
var halp = require('./helpers');
var flatten = require('./flatten');
var concat = require('concat-stream');
var contextify = require('dustjs-onload-context');


/**
 * Shim for loadSource to use the local dust cache and not the global one.
 * @param dust
 * @returns {loadSource}
 */
function sourceLoader(dust) {
    var context = vm.createContext({
        dust: {
            register: function (name, fn) {
                dust.cache[name] = fn;
            }
        }
    });

    return function loadSource(source, path) {
        return vm.runInContext(source, context, path);
    };
}


/**
 * onLoad wrapper which flattens context to a plain object.
 * @param onload the provided onLoad implementation
 * @returns {onLoad} the function wrapper
 */
function onLoader(onload) {
    return function onLoad(name, context, cb) {
        onload(name, flatten(context), cb);
    };
}


module.exports = function (options, onload) {
    var dust;

    // Get a non-global version of dustjs.
    dust = freshy.freshy('dustjs-linkedin');
    dust.loadSource = sourceLoader(dust);
    dust.onLoad = onLoader(onload);

    contextify(dust);
    halp(dust, options);

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