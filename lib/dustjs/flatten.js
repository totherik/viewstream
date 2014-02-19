'use strict';


function copy(src, dest) {
    Object.keys(src).forEach(function (key) {
        dest[key]= src[key];
    });
    return dest;
}


function walk(stack, dest) {
    if (stack) {
        if (stack.head) {
            copy(stack.head, dest);
        }
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


module.exports = flatten;