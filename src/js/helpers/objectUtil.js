/**
 * @fileoverview util for object
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var snippet = require('tui-code-snippet');

/**
 * Deep copy.
 * @memberOf module:objectUtil
 * @param {object|Array|*} origin - original data
 * @returns {*}
 */
var deepCopy = function(origin) {
    var clone;

    if (snippet.isArray(origin)) {
        clone = [];
        snippet.forEachArray(origin, function(value, index) {
            clone[index] = deepCopy(value);
        });
    } else if (snippet.isFunction(origin) || snippet.isDate(origin)) {
        clone = origin;
    } else if (snippet.isObject(origin)) {
        clone = {};
        snippet.forEach(origin, function(value, key) {
            clone[key] = deepCopy(value);
        });
    } else {
        clone = origin;
    }

    return clone;
};

/**
 * util for object
 * @module objectUtil
 * @private */
var objectUtil = {
    deepCopy: deepCopy
};

module.exports = objectUtil;
