# cpy [![Build Status](https://travis-ci.org/sindresorhus/cpy.svg?branch=master)](https://travis-ci.org/sindresorhus/cpy)

> Copy files


## Why

- Fast by using streams.
- Resilient by using [graceful-fs](https://github.com/isaacs/node-graceful-fs).
- User-friendly by accepting [globs](https://github.com/sindresorhus/globby#globbing-patterns) and creating non-existant destination directories.
- User-friendly error messages.


## Install

```
$ npm install --save cpy
```


## Usage

```js
const cpy = require('cpy');

cpy(['src/*.png', '!src/goat.png'], 'dist').then(() => {
	console.log('files copied');
});
```


## API

### cpy(files, destination, [options])

#### files

Type: `array`

Files to copy.

#### destination

Type: `string`

Destination directory.

#### options

Type: `object`

Options are passed to [cp-file](https://github.com/sindresorhus/cp-file#options) and [glob](https://github.com/isaacs/node-glob#options).

##### cwd

Type: `string`  
Default: `process.cwd()`

Working directory to find source files.

##### parents

Type: `boolean`  
Default: `false`

Preserve path structure.

##### rename

Type: `string`

Filename used to rename every file in `files`.


## Related

- [cpy-cli](https://github.com/sindresorhus/cpy-cli) - CLI for this module
- [cp-file](https://github.com/sindresorhus/cp-file) - Copy a single file


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
