# viewstream

Experiments in streaming view rendering engine/abstraction.
TODO: Support for additional view renderers/templating engines.

```javascript
var http = require('http');
var viewstream = require('viewstream');


var renderer = viewstream.dust(function (name, context, cb) {
    cb(null, 'Hello, {name}!');
});

http.createServer(function onrequest(req, res) {
    res.statusCode = 200;
    renderer.render('name', { name: 'Erik' }).pipe(res);
}).listen(8000);
```

## API
### dust([options], onload)

* `onload` (*Function*) - The function used for loading templates. Signature: `function (name, context, callback)`.

```javascript
var viewstream = require('viewstream'),
    engine = viewstream.dust(onload);

engine.render('index', { name: 'world' }).pipe(res);
```

### html([options], onload)

* `onload` (*Function*) - The function used for loading templates. Signature: `function (name, context, callback)`.

```javascript
var viewstream = require('viewstream'),
    engine = viewstream.html(onload);

engine.json({ name: 'world' }).pipe(res);
```


## Engine API

### render(name, context)


### json(obj)


### jsonp(obj)


### binary(Buffer|String)


### send(stuff)
