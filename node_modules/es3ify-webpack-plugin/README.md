es3ify-webpack-plugin
=====================

A simple webpack plugin to es3ify your code for old versions of ie, such as ie8.

I am new to webpack and babel. And I need to support ie8, but I didn't find a solution to handle it. [es3ify-loader](https://github.com/sorrycc/es3ify-loader) helped, but it couldn't transform the module in node_modules. So I write the simple plugin to resolve it. Hope it can help you.  

### Usage

```
npm install es3ify-webpack-plugin
```
Then in webpack.config.js

```
var es3ifyPlugin = require('es3ify-webpack-plugin');

plugins: [
  new es3ifyPlugin()
]
```
