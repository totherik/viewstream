# viewers

A streaming view rendering engine/abstraction.

## API
### dust(onload)

* `onload` (*Function*) - The function used for loading templates. Signature: `function (name, context, callback)`.

```javascript
var viewers = require('viewers'),
    engine = viewers.dust(onload);

engine.render('index', { name: 'world' }).pipe(res);
```

### html(onload)

* `onload` (*Function*) - The function used for loading templates. Signature: `function (name, context, callback)`.

```javascript
var viewers = require('viewers'),
    engine = viewers.html(onload);

engine.json({ name: 'world' }).pipe(res);
```


## Engine API

### render(name, context)


### json(obj)


### jsonp(obj)


### binary(Buffer|String)


### send(stuff)
