# eslint-config-tui

#### ESLint sharable config for TUI components

## Install
```
$ npm install eslint eslint-config-tui --save-dev
```

## Usage
Add `.eslintrc.js` on your project's root directory.
```javascript
// .eslintrc.js
module.exports = {
    'extends': 'tui',
    'rules': {
        // Override rules or Add more rules
    }
};
```
### Support ES6
#### rules and syntax
To Support ES6 rules, use `tui/es6` instead.
```javascript
// .eslintrc.js
module.exports =
    'extends': 'tui/es6' // default rule and ES6 rule
};
```
#### syntax only
By default, ESLint configuration expects ES5 syntax. You can override this setting to enable support for ES6 syntax and new ES6 global variables.
```javascript
// .eslintrc.js
module.exports = {
    'extends': 'tui', // no ES6 rule
    'env': {
        'es6': true
    }
};
```

## Learn more
[JavaScript Style Guide](https://github.com/nhnent/fe.javascript/wiki)

[Configuring ESLint](http://eslint.org/docs/user-guide/configuring)

## License
This software is licensed under the [MIT License](https://github.com/nhnent/tui.eslint.config/blob/master/LICENSE).
