/**
 * @fileoverview util for object
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

/**
 * Deep copy.
 * @memberOf module:objectUtil
 * @param {object|Array|*} origin - original data
 * @returns {*}
 */
var deepCopy = function(origin) {
    var clone;

    if (tui.util.isArray(origin)) {
        clone = [];
        tui.util.forEachArray(origin, function(value, index) {
            clone[index] = deepCopy(value);
        });
    } else if (tui.util.isFunction(origin) || tui.util.isDate(origin)) {
        clone = origin;
    } else if (tui.util.isObject(origin)) {
        clone = {};
        tui.util.forEach(origin, function(value, key) {
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
 */
var objectUtil = {
    deepCopy: deepCopy
};

module.exports = objectUtil;
