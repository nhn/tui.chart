'use strict';

var testsContext;

require('es5-shim');

testsContext = require.context('.', true, /spec.js$/);
testsContext.keys().forEach(testsContext);
