'use strict';

var http = require('http');


exports.wrap = function wrap(stream) {

    return Object.create(stream, {
        pipe: {
            value: function pipe(dest) {

                if (dest instanceof http.ServerResponse) {
                    if (!dest.getHeader('content-type')) {
                        dest.setHeader('Content-Type', 'text/javascript');
                    }
                }

                stream.pipe.apply(stream, arguments);

            }
        }
    });

};