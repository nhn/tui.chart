[![npm][npm]][npm-url]
[![node][node]][node-url]
[![deps][deps]][deps-url]
[![test][test]][test-url]
[![coverage][cover]][cover-url]
[![chat][chat]][chat-url]

<div align="center">
  <a href="https://github.com/webpack/webpack">
    <img width="200" height="200"
      src="https://webpack.js.org/assets/icon-square-big.svg">
  </a>
  <h1>Copy Webpack Plugin</h1>
  <p>Copies individual files or entire directories to the build directory</p>
</div>

<h2 align="center">Install</h2>

```bash
npm i -D copy-webpack-plugin
```

<h2 align="center">Usage</h2>

**webpack.config.js**
```js
const CopyWebpackPlugin = require('copy-webpack-plugin')

const config = {
  plugins: [
    new CopyWebpackPlugin([ ...patterns ], options)
  ]
}
```

> ℹ️ If you want `webpack-dev-server` to write files to the output directory during development, you can force it with the [`write-file-webpack-plugin`](https://github.com/gajus/write-file-webpack-plugin).

### `Patterns`

A simple pattern looks like this

```js
{ from: 'source', to: 'dest' }
```

Or, in case of just a `from` with the default destination, you can also use a `{String}` as shorthand instead of an `{Object}`

```js
'source'
```

|Name|Type|Default|Description|
|:--:|:--:|:-----:|:----------|
|[`from`](#from)|`{String\|Object}`|`undefined`|Globs accept [minimatch options](https://github.com/isaacs/minimatch)|
|[`fromArgs`](#fromArgs)|`{Object}`|`{ cwd: context }`|See the [`node-glob` options](https://github.com/isaacs/node-glob#options) in addition to the ones below|
|[`to`](#to)|`{String\|Object}`|`undefined`|Output root if `from` is file or dir, resolved glob path if `from` is glob|
|[`toType`](#toType)|`{String}`|``|[toType Options](#totype)|
|[`test`](#test)|`{RegExp}`|``|Pattern for extracting elements to be used in `to` templates|
|[`force`](#force)|`{Boolean}`|`false`|Overwrites files already in `compilation.assets` (usually added by other plugins/loaders)|
|[`ignore`](#ignore)|`{Array}`|`[]`|Globs to ignore for this pattern|
|`flatten`|`{Boolean}`|`false`|Removes all directory references and only copies file names.⚠️ If files have the same name, the result is non-deterministic|
|[`transform`](#transform)|`{Function\|Promise}`|`(content, path) => content`|Function or Promise that modifies file contents before copying|
|[`cache`](#cache)|`{Boolean\|Object}`|`false`|Enable `transform` caching. You can use `{ cache: { key: 'my-cache-key' } }` to invalidate the cache|
|[`context`](#context)|`{String}`|`options.context \|\| compiler.options.context`|A path that determines how to interpret the `from` path|

### `from`

**webpack.config.js**
```js
[
  new CopyWebpackPlugin([
    'relative/path/to/file.ext',
    '/absolute/path/to/file.ext',
    'relative/path/to/dir',
    '/absolute/path/to/dir',
    '**/*',
    { glob: '\*\*/\*', dot: true }
  ], options)
]
```

### `to`

**webpack.config.js**
```js
[
  new CopyWebpackPlugin([
    { from: '**/*', to: 'relative/path/to/dest/' },
    { from: '**/*', to: '/absolute/path/to/dest/' }
  ], options)
]
```

### `toType`

|Name|Type|Default|Description|
|:--:|:--:|:-----:|:----------|
|**`'dir'`**|`{String}`|`undefined`|If `from` is directory, `to` has no extension or ends in `'/'`|
|**`'file'`**|`{String}`|`undefined`|If `to` has extension or `from` is file|
|**`'template'`**|`{String}`|`undefined`|If `to` contains [a template pattern](https://github.com/webpack-contrib/file-loader#placeholders)|

#### `'dir'`

**webpack.config.js**
```js
[
  new CopyWebpackPlugin([
    {
      from: 'path/to/file.txt',
      to: 'directory/with/extension.ext',
      toType: 'dir'
    }
  ], options)
]
```

#### `'file'`

**webpack.config.js**
```js
[
  new CopyWebpackPlugin([
    {
      from: 'path/to/file.txt',
      to: 'file/without/extension',
      toType: 'file'
    },
  ], options)
]
```

#### `'template'`

**webpack.config.js**
```js
[
  new CopyWebpackPlugin([
    {
      from: 'src/',
      to: 'dest/[name].[hash].[ext]',
      toType: 'template'
    }
  ], options)
]
```

### `test`

Defines a `{RegExp}` to match some parts of the file path.
These capture groups can be reused in the name property using `[N]` placeholder.
Note that `[0]` will be replaced by the entire path of the file,
whereas `[1]` will contain the first capturing parenthesis of your `{RegExp}`
and so on...

**webpack.config.js**
```js
[
  new CopyWebpackPlugin([
    {
      from: '*/*',
      to: '[1]-[2].[hash].[ext]',
      test: /([^/]+)\/(.+)\.png$/
    }
  ], options)
]
```

### `force`

**webpack.config.js**
```js
[
  new CopyWebpackPlugin([
    { from: 'src/**/*', to: 'dest/', force: true }
  ], options)
]
```

### `ignore`

**webpack.config.js**
```js
[
  new CopyWebpackPlugin([
    { from: 'src/**/*', to: 'dest/', ignore: [ '*.js' ] }
  ], options)
]
```

### `flatten`

**webpack.config.js**
```js
[
  new CopyWebpackPlugin([
    { from: 'src/**/*', to: 'dest/', flatten: true }
  ], options)
]
```

### `transform`

#### `{Function}`

**webpack.config.js**
```js
[
  new CopyWebpackPlugin([
    {
      from: 'src/*.png',
      to: 'dest/',
      transform (content, path) {
        return optimize(content)
      }
    }
  ], options)
]
```

#### `{Promise}`

**webpack.config.js**
```js
[
  new CopyWebpackPlugin([
    {
      from: 'src/*.png',
      to: 'dest/',
      transform (content, path) {
        return Promise.resolve(optimize(content))
      }
  }
  ], options)
]
```

### `cache`

**webpack.config.js**
```js
[
  new CopyWebpackPlugin([
    {
      from: 'src/*.png',
      to: 'dest/',
      transform (content, path) {
        return optimize(content)
      },
      cache: true
    }
  ], options)
]
```

### `context`

**webpack.config.js**
```js
[
  new CopyWebpackPlugin([
    { from: 'src/*.txt', to: 'dest/', context: 'app/' }
  ], options)
]
```

<h2 align="center">Options</h2>

|Name|Type|Default|Description|
|:--:|:--:|:-----:|:----------|
|[`debug`](#debug)|`{String}`|**`'warning'`**|[Debug Options](#debug)|
|[`ignore`](#ignore)|`{Array}`|`[]`|Array of globs to ignore (applied to `from`)|
|[`context`](#context)|`{String}`|`compiler.options.context`|A path that determines how to interpret the `from` path, shared for all patterns|
|[`copyUnmodified`](#copyUnmodified)|`{Boolean}`|`false`|Copies files, regardless of modification when using watch or `webpack-dev-server`. All files are copied on first build, regardless of this option|

### `debug`

|Name|Type|Default|Description|
|:--:|:--:|:-----:|:----------|
|**`'info'`**|`{String\|Boolean}`|`false`|File location and read info|
|**`'debug'`**|`{String}`|`false`|Very detailed debugging info|
|**`'warning'`**|`{String}`|`true`|Only warnings|

#### `'info'`

**webpack.config.js**
```js
[
  new CopyWebpackPlugin(
    [ ...patterns ],
    { debug: 'info' }
  )
]
```

#### `'debug'`

**webpack.config.js**
```js
[
  new CopyWebpackPlugin(
    [ ...patterns ],
    { debug: 'debug' }
  )
]
```

#### `'warning' (default)`

**webpack.config.js**
```js
[
  new CopyWebpackPlugin(
    [ ...patterns ],
    { debug: true }
  )
]
```

### `ignore`

**webpack.config.js**
```js
[
  new CopyWebpackPlugin(
    [ ...patterns ],
    { ignore: [ '*.js', '*.css' ] }
  )
]
```

### `context`

**webpack.config.js**
```js
[
  new CopyWebpackPlugin(
    [ ...patterns ],
    { context: '/app' }
  )
]
```

### `copyUnmodified`

> ℹ️ By default, we only copy **modified** files during a `webpack --watch` or `webpack-dev-server` build. Setting this option to `true` will copy all files.

**webpack.config.js**
```js
[
  new CopyWebpackPlugin(
    [ ...patterns ],
    { copyUnmodified: true }
  )
]
```

<h2 align="center">Maintainers</h2>

<table>
  <tbody>
    <tr>
      <td align="center">
        <a href="https://github.com/bebraw">
          <img width="150" height="150" src="https://github.com/bebraw.png?v=3&s=150">
          </br>
          Juho Vepsäläinen
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/d3viant0ne">
          <img width="150" height="150" src="https://github.com/d3viant0ne.png?v=3&s=150">
          </br>
          Joshua Wiens
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/michael-ciniawsky">
          <img width="150" height="150" src="https://github.com/michael-ciniawsky.png?v=3&s=150">
          </br>
          Michael Ciniawsky
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/evilebottnawi">
          <img width="150" height="150" src="https://github.com/evilebottnawi.png?v=3&s=150">
          </br>
          Alexander Krasnoyarov
        </a>
      </td>
    </tr>
  <tbody>
</table>


[npm]: https://img.shields.io/npm/v/copy-webpack-plugin.svg
[npm-url]: https://npmjs.com/package/copy-webpack-plugin

[node]: https://img.shields.io/node/v/copy-webpack-plugin.svg
[node-url]: https://nodejs.org

[deps]: https://david-dm.org/webpack-contrib/copy-webpack-plugin.svg
[deps-url]: https://david-dm.org/webpack-contrib/copy-webpack-plugin

[test]: https://secure.travis-ci.org/webpack-contrib/copy-webpack-plugin.svg
[test-url]: http://travis-ci.org/webpack-contrib/copy-webpack-plugin

[cover]: https://codecov.io/gh/webpack-contrib/copy-webpack-plugin/branch/master/graph/badge.svg
[cover-url]: https://codecov.io/gh/webpack-contrib/copy-webpack-plugin

[chat]: https://img.shields.io/badge/gitter-webpack%2Fwebpack-brightgreen.svg
[chat-url]: https://gitter.im/webpack/webpack
