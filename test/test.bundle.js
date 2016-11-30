/* eslint-disable */
require('es5-shim');

var componentsContext = require.context('../src/js', true, /.+\.js?$/);
var testsContext = require.context('.', true, /spec.js$/);

componentsContext.keys().forEach(componentsContext);
testsContext.keys().forEach(testsContext);
