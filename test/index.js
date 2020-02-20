require('core-js/features/object/create');
require('core-js/features/object/assign');
require('core-js/features/object/entries');
require('core-js/features/object/values');
require('core-js/features/object/keys');

require('core-js/features/array/for-each');
require('core-js/features/array/is-array');
require('core-js/features/array/filter');
require('core-js/features/array/reduce');
require('core-js/features/array/from');
require('core-js/features/array/map');
require('core-js/features/array/fill');

require('core-js/features/json/stringify');
require('core-js/features/function/bind');

const testsContext = require.context('.', true, /spec.js$/);
testsContext.keys().forEach(testsContext);
