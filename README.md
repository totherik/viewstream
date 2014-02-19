# viewers

A streaming view rendering engine/abstraction.

```javascript
var http = require('http');
var viewstream = require('viewsteam');


var renderer;

renderer = viewstream.dust(function (name, context, cb) {
    cb(null, 'Hello, {name}!');
});

http.createServer(function onrequest(req, res) {
    res.statusCode = 200;
    renderer.render('name', { name: 'Erik' }).pipe(res);
}).listen(8000);
```

## API
### dust(onload)

* `onload` (*Function*) - The function used for loading templates. Signature: `function (name, context, callback)`.

```javascript
var viewstream = require('viewstream'),
    engine = viewstream.dust(onload);

engine.render('index', { name: 'world' }).pipe(res);
```

### html(onload)

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
