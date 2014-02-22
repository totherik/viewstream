'use strict';

var util = require('util');
var Readable = require('readable-stream');


function River(stream) {
    River.super_.call(this);

    this._flowing = true;
    this._queue = [];

    var self = this;
    stream.on('data', function () {
        setImmediate(Function.prototype.apply.bind(self._onData, self, arguments));
    });

    stream.on('error', function () {
        setImmediate(Function.prototype.apply.bind(self._onError, self, arguments));
    });

    stream.on('end', function () {
        setImmediate(Function.prototype.apply.bind(self._onEnd, self, arguments));
    });
}


util.inherits(River, Readable);



River.prototype._onData = function (chunk) {
    var flowing, queue;

    this._queue.push(chunk);

    flowing = this._flowing;
    queue = this._queue;

    while (flowing && queue.length) {
        flowing = this.push(queue.shift());
    }

    this._flowing = flowing;
};


River.prototype._onError = function (err) {
    this._flowing = false;
    this._queue = undefined;
    this.emit('error', err);
};


River.prototype._onEnd = function () {
    if (!this._flowing) {
        this._queue.push(null);
        return;
    }

    this._flowing = false;
    this._queue = undefined;
    this.push(null);
};


River.prototype._read = function (size) {
    var chunk, flowing, queue;

    if (!this._queue.length) {
        this._flowing = true;
        return;
    }

    flowing = true;
    queue = this._queue;

    while (flowing && queue.length) {

        chunk = queue.shift();
        if (chunk === null) {
            this._flowing = false;
            this._queue = undefined;
            this.push(null);
            return;
        }

        chunk = new Buffer(chunk, 'utf8');
        if (chunk.length > size) {
            queue.unshift(chunk.slice(size));
            chunk = chunk.slice(0, size);
        }

        flowing = this.push(chunk);

    }

    this._flowing = flowing;
};


module.exports = River;