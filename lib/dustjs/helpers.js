'use strict';

var fs = require('fs');
var vm = require('vm');
var path = require('path');
var flatten = require('./flatten');



function load(dust, helper) {
    var helpers, script;
    helpers = require.resolve(helper);
    helpers = fs.readFileSync(helpers, { encoding: 'utf8' });
    script = vm.createScript(helpers);
    script.runInNewContext({ dust: dust });
}


function component(dust, basedir) {
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
}


module.exports = function halp(dust, options) {
    if (Array.isArray(options.helpers)) {
        options.helpers.forEach(load.bind(null, dust));
    }

    component(dust, options.basedir);
    return dust;
};