# cp-file [![Build Status](https://travis-ci.org/sindresorhus/cp-file.svg?branch=master)](https://travis-ci.org/sindresorhus/cp-file)

> Copy a file

- Fast by using streams in the async version.
- Resilient by using [graceful-fs](https://github.com/isaacs/node-graceful-fs).
- User-friendly by creating non-existent destination directories for you.
- Can be safe by turning off [overwriting](#optionsoverwrite).
- User-friendly errors.


## Install

```
$ npm install --save cp-file
```


## Usage

```js
const cpFile = require('cp-file');

cpFile('src/unicorn.png', 'dist/unicorn.png').then(() => {
	console.log('File copied');
});
```


## API

### cpFile(source, destination, [options])

Returns a `Promise`.

### cpFile.sync(source, destination, [options])

#### source

Type: `string`

File you want to copy.

#### destination

Type: `string`

Where you want the file copied.

#### options

Type: `Object`

##### overwrite

Type: `boolean`<br>
Default: `true`

Overwrite existing file.

### cpFile.on('progress', handler)

Progress reporting. Only available when using the async method.

#### handler(data)

Type: `Function`

##### data

```js
{
	src: String,
	dest: String,
	size: Number,
	written: Number,
	percent: Number
}
```

- `src` and `dest` are absolute paths.
- `size` and `written` are in bytes.
- `percent` is a value between `0` and `1`.

###### Notes

- For empty files, the `progress` event is emitted only once.
- The `.on()` method is available only right after the initial `cpFile()` call. So make sure
you add a `handler` before `.then()`:

```js
cpFile(src, dest).on('progress', data => {
	// ...
}).then(() => {
	// ...
})
```


## Related

See [cpy](https://github.com/sindresorhus/cpy) if you need to copy multiple files or want a CLI.


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
