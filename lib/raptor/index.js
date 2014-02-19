'use strict';

var stream = require('readable-stream');

module.exports = function raptor(options, onload) {
    var engine, compiler;

    // raptor "installs" itself, so the base raptor module needs to be required
    // prior to requiring templating
    require('raptor');
    engine = require('raptor/templating');
    compiler = require('raptor/templating/compiler');

    return {

        render: function render(name, context, cb) {
            var written, read;

            written = false;
            read = new stream.Readable();
            read._read = function (size) {
                var self = this;

                onload(name, context, function (err, data) {
                    var output;
                    if (err) {
                        self.emit('error', err);
                        return;
                    }

                    if (written) {
                        self.push(null);
                        return;
                    }

                    eval(compiler.compile(data));
                    output = engine.createContext();
                    engine.render(name, context, output);
                    self.push(output.getOutput());
                    written = true;
                });
            };


            return read;
        }

    };

};