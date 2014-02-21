'use strict';

var viewers = require('../');
var http = require('http');


var options, renderer, server;

options = {
    basedir: __dirname,
    helpers: ['dustjs-helpers']
};


renderer = viewers.dust(options, function (name, context, cb) {
    cb(null, 'Hello, {name}!');
});


server = http.createServer(function onrequest(req, res) {
    res.statusCode = 200;
    renderer.render('name', { name: 'Erik' }).pipe(res);
}).listen(8000);
