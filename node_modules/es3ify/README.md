# es3ify

Browserify transform to convert quote reserved words in property keys for compatibility with ES3 JavaScript engines like IE8. In addition, trailing commas in array and object literals are removed.

```javascript
// In
var x = {class: 2,};
x.class = [3, 4,];

// Out:
var x = {"class": 2};
x["class"] = [3, 4];
```

Run tests with:

```sh
npm install -g jasmine-node
jasmine-node spec
```
