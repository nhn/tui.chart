# karma-jasmine

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/karma-runner/karma-jasmine)
 [![npm version](https://img.shields.io/npm/v/karma-jasmine.svg?style=flat-square)](https://www.npmjs.com/package/karma-jasmine) [![npm downloads](https://img.shields.io/npm/dm/karma-jasmine.svg?style=flat-square)](https://www.npmjs.com/package/karma-jasmine)

[![Build Status](https://img.shields.io/travis/karma-runner/karma-jasmine/master.svg?style=flat-square)](https://travis-ci.org/karma-runner/karma-jasmine) [![Dependency Status](https://img.shields.io/david/karma-runner/karma-jasmine.svg?style=flat-square)](https://david-dm.org/karma-runner/karma-jasmine) [![devDependency Status](https://img.shields.io/david/dev/karma-runner/karma-jasmine.svg?style=flat-square)](https://david-dm.org/karma-runner/karma-jasmine#info=devDependencies)

> Adapter for the [Jasmine](http://jasmine.github.io/) testing framework.


## Installation

### Jasmine 1.3 ([docs](http://jasmine.github.io/1.3/introduction.html))

The easiest way is to run

```bash
$ npm install karma-jasmine@0.1.0 --save-dev
```


### Jasmine 2.0 ([docs](http://jasmine.github.io/2.0/introduction.html))

The easiest way is run

```bash
$ npm install karma-jasmine --save-dev
```

__Note:__
Since `karma-jasmine 0.3.0` the jasmine library is no longer bundled with `karma-jasmine` and you have to install it on your own. You can simply do it by:

```bash
$ npm install jasmine-core --save-dev
```

## Configuration

```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],

    files: [
      '*.js'
    ]
  })
}
```

If you want to run only some tests matching a given pattern you can do this in the following way

```bash
$ karma start &
$ karma run -- --grep=<pattern>
```

or

```js
module.exports = function(config) {
  config.set({
    ...
    client: {
      args: ['--grep', '<pattern>'],
      ...
    }
  })
}
```

If you want to pass configuration options directly to jasmine you can do this in the following way

```js
module.exports = function(config) {
  config.set({
    client: {
      jasmine: {
        random: true,
        seed: '4321',
        stopOnFailure: true,
        failFast: true
      }
    }
  })
}
```

----

For more information on Karma see the [homepage].


[homepage]: http://karma-runner.github.com
