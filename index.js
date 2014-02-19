'use strict';

var path = require('path'),
    caller = require('caller'),
    concat = require('concat-stream'),
    JSONStream = require('JSONStream'),
    stream = require('readable-stream');



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
                return stream;
            }

            stream = JSONStream.stringifyObject();
            setImmediate(function () {
                stream.write(['foo', obj]);
                stream.end();
            });

            return stream;
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

            return read;
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



exports.dust = function (onload) {
    var basedir, dust, renderer;

    basedir = path.dirname(caller());
    dust = require('./lib/dustjs');
    renderer = dust(basedir, onload);

    return create(renderer);
};


exports.html = function (onload) {

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

};



exports.create = create;