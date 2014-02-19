'use strict';

var stream = require('readable-stream');
var concat = require('concat-stream');

module.exports = function raptor(options, onload) {
    var engine, compiler;

    // raptor "installs" itself, so the base raptor module needs to be required
    // prior to requiring templating
    require('raptor');
    engine = require('raptor/templating');
    compiler = require('raptor/templating/compiler');

    return {

        render: function render(name, context, cb) {
            var written, readstream, dest;

            written = false;
            readstream = new stream.Readable();
            readstream._read = function (size) {
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

            if (typeof cb === 'function') {
                dest = concat({ encoding: 'string' }, cb.bind(null, null));
                readstream.on('error', cb).pipe(dest);
                return undefined;
            }

            return readstream;
        }

    };

};