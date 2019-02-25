[npm]: https://img.shields.io/npm/v/karma-webpack.svg
[npm-url]: https://npmjs.com/package/karma-webpack

[deps]: https://david-dm.org/webpack/karma-webpack.svg
[deps-url]: https://david-dm.org/webpack/karma-webpack

[chat]: https://img.shields.io/badge/gitter-webpack%2Fwebpack-brightgreen.svg
[chat-url]: https://gitter.im/webpack/webpack

[test]: http://img.shields.io/travis/webpack/karma-webpack.svg
[test-url]: https://travis-ci.org/webpack/karma-webpack

[cover]: https://codecov.io/gh/webpack/karma-webpack/branch/master/graph/badge.svg
[cover-url]: https://codecov.io/gh/webpack/karma-webpack

[![npm][npm]][npm-url]
[![deps][deps]][deps-url]
[![test][test]][test-url]
[![coverage][cover]][cover-url]
[![chat][chat]][chat-url]

<div align="center">
  <a href='https://github.com/karma-runner/karma'>
    <img width="200" height="200" vspace="20" hspace="25"
      src="https://worldvectorlogo.com/logos/karma.svg">
  </a>
  <a href="https://github.com/webpack/webpack">
    <img width="200" height="200" vspace="40" hspace="25"
      src="https://worldvectorlogo.com/logos/webpack.svg">
  </a>
  <h1>Karma Webpack</h1>
  <p>Use webpack to preprocess files in karma<p>
</div>

<h2 align="center">Install</h2>

```bash
npm i -D karma-webpack
```

<h2 align="center">Usage</h2>

``` javascript
// Karma configuration
module.exports = function(config) {
  config.set({
    // ... normal karma configuration
    files: [
      // all files ending in "_test"
      {pattern: 'test/*_test.js', watched: false},
      {pattern: 'test/**/*_test.js', watched: false}
      // each file acts as entry point for the webpack configuration
    ],

    preprocessors: {
      // add webpack as preprocessor
      'test/*_test.js': ['webpack'],
      'test/**/*_test.js': ['webpack']
    },

    webpack: {
      // karma watches the test entry points
      // (you don't need to specify the entry option)
      // webpack watches dependencies

      // webpack configuration
    },

    webpackMiddleware: {
      // webpack-dev-middleware configuration
      // i. e.
      stats: 'errors-only'
    }
  });
};
```

<h3 align="center">Alternative Usage</h3>

This configuration is more performant, but you cannot run single test anymore (only the complete suite).

The above configuration generates a webpack bundle for each test. For many testcases this can result in many big files. The alterative configuration creates a single bundle with all testcases.

``` javascript
files: [
  // only specify one entry point
  // and require all tests in there
  'test/test_index.js'
],

preprocessors: {
  // add webpack as preprocessor
  'test/test_index.js': ['webpack']
},
```

``` javascript
// test/test_index.js

// require all modules ending in "_test" from the
// current directory and all subdirectories
var testsContext = require.context(".", true, /_test$/);
testsContext.keys().forEach(testsContext);
```

Every test file is required using the [require.context](http://webpack.github.io/docs/context.html#require-context) and compiled with webpack into one test bundle.

<h2 align="center">Source Maps</h2>

You can use the `karma-sourcemap-loader` to get the source maps generated for your test bundle.

```
npm install --save-dev karma-sourcemap-loader
```

And then add it to your preprocessors

``` javascript
preprocessors: {
  'test/test_index.js': ['webpack', 'sourcemap']
}
```

And tell webpack to generate sourcemaps

``` javascript
webpack: {
  // ...
  devtool: 'inline-source-map'
}
```

<h2 align="center">Options</h2>

This is the full list of options you can specify in your Karma config.

### `webpack`

Webpack configuration.

### `webpackMiddleware`

Configuration for webpack-dev-middleware.

### `beforeMiddleware`

`beforeMiddleware` is a webpack option that allows injecting middleware before
karama's own middleware are run. This loader provides a `webpackBlocker`
middleware that will block tests from running until code recompiles. That is,
given this scenario:

1. Have a browser open on the karma debug page (http://localhost:9876/debug.html)
2. Make a code change
3. Refresh

Without the `webpackBlocker` middleware karma will serve files from before
the code change. With the `webpackBlocker` middleware the loader will not serve
the files until the code has finished recompiling.

***Note that the `beforeMiddleware` option is only supported in karma with version >1.0.***

<h2 align="center">Maintainers</h2>

<table>
  <tbody>
    <tr>
      <td align="center">
        <img width="150" height="150"
        src="https://avatars.githubusercontent.com/u/4650931?v=3&s=150">
        </br>
        <a href="https://github.com/MikaAK">Mika Kalathil</a>
      </td>
      <td align="center">
        <img width="150" height="150"
        src="https://avatars.githubusercontent.com/u/8420490?v=3&s=150">
        <a href="https://github.com/d3viant0ne">Joshua Wiens</a>
      </td>
      <td align="center">
        <img width="150" height="150" src="https://avatars.githubusercontent.com/u/1919664?v=3&s=150">
        <a href="https://github.com/goldhand">Will Farley</a>
      </td>
      <td align="center">
        <img width="150" height="150"
        src="https://avatars.githubusercontent.com/u/1307954?v=3&s=150">
        <a href="https://github.com/DanielaValero">Daniela Valero</a>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img width="150" height="150"
        src="https://avatars.githubusercontent.com/u/122108?v=3&s=150">
        <a href="https://github.com/jon301">Jonathan Trang</a>
      </td>
      <td align="center">
        <img width="150" height="150"
        src="https://avatars.githubusercontent.com/u/3285723?v=3&s=150">
        <a href="https://github.com/carlos-">Carlos Morales</a>
      </td>
    </tr>
  <tbody>
</table>

<h2 align="center">LICENSE</h2>

> The MIT License (MIT)

> Copyright (c) 2014 - 2016 Tobias Koppers

> Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

> The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
