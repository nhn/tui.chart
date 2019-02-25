# karma-sourcemap-loader

> Preprocessor that locates and loads existing source maps.

## Why

When you use karma not in isolation but as part of a build process (e.g. using grunt
or gulp) it is often the case that the compilation/transpilation is done on a previous
step of the process and not handled by karma preprocessors. In these cases source maps
don't get loaded by karma and you lose the advantages of having them.

## How it works

This plug-in supports both inline and external source maps.

Inline source maps are located by searching "sourceMappingURL=" inside the javascript
file, both plain text and base64-encoded maps are supported.

External source maps are located by appending ".map" to the javascript file name.
So if for example you have Hello.js, the preprocessor will try to load source map from
Hello.js.map.

## Installation

Just add `karma-sourcemap-loader` as a devDependency in your `package.json`.
```json
{
  "devDependencies": {
    "karma-sourcemap-loader": "~0.3"
  }
}
```

Or issue the following command:
```bash
npm install karma-sourcemap-loader --save-dev
```

## Configuration

The code below shows a sample configuration of the preprocessor.
```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    preprocessors: {
      '**/*.js': ['sourcemap']
    }
  });
};
```