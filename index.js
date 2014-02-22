'use strict';

var path = require('path');
var caller = require('caller');
var concat = require('concat-stream');
var JSONStream = require('JSONStream');
var stream = require('readable-stream');
var json = require('./lib/wrapper/json');
var jsonp = require('./lib/wrapper/jsonp');



function create(renderer) {

    return {

        render: function (name, context, cb) {
            context = context || {};
            return renderer.render(name, context, cb);
        },

        json: function (name, obj) {
            var stream;

            if (Array.isArray(obj)) {

                stream = JSONStream.stringify();
                setImmediate(function () {
                    stream.write(obj);
                    stream.end();
                });

            } else {

                stream = JSONStream.stringifyObject();
                setImmediate(function () {
                    stream.write([name, obj]);
                    stream.end();
                });

            }

            return json.wrap(stream);
        },

        jsonp: function (callback, obj) {
            var chunks, read;

            chunks = [ callback, '(', JSON.stringify(obj), ')' ];
            read = new stream.Readable();
            read._read = function () {
                while (chunks.length) {
                    if (!this.push(chunks.shift())) {
                        return;
                    }
                }
                this.push(null);
            };

            return jsonp.wrap(read);
        },

        binary: function (buffer) {
            var idx, read;

            if (!Buffer.isBuffer(buffer)) {
                return buffer;
            }

            idx = 0;
            read = new stream.Readable();
            read._read = function (size) {
                size = Math.min(size, buffer.length - idx);

                while (idx < buffer.length) {
                    if (!this.push(buffer.slice(idx, idx + size))) {
                        return;
                    }
                    idx += size;
                }

                this.push(null);
            };

            return read;
        },

        send: function (obj) {
            throw new Error('Not impemented.');
        }

    };

}


function defaults(fn) {
    return function (options, onload) {
        if (typeof options === 'function') {
            onload = options;
            options = {};
        }

        options.basedir = options.basedir || path.dirname(caller());
        return fn(options, onload);
    };
}


exports.dust = defaults(function dust(options, onload) {
    var dust, renderer;

    dust = require('./lib/dustjs');
    renderer = dust(options, onload);

    return create(renderer);
});


exports.html = defaults(function html(options, onload) {

    return create({

        render: function (name, context, cb) {
            var written, read, dest;

            written = false;
            read = new stream.Readable();
            read._read = function (size) {
                var self = this;

                onload(name, context, function (err, data) {
                    if (err) {
                        self.emit('error', err);
                        return;
                    }

                    if (written) {
                        self.push(null);
                        return;
                    }

                    self.push(data);
                    written = true;
                });
            };

            if (typeof cb === 'function') {
                dest = concat({ encoding: 'string' }, cb.bind(null, null));
                read.on('error', cb).pipe(dest);
                return undefined;
            }

            return read;
        }

    });

});



exports.create = create;