/**
 * @fileoverview Util for array.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var snippet = require('tui-code-snippet');

/**
 * Pick minimum value from value array.
 * @memberOf module:arrayUtil
 * @param {Array} arr value array
 * @param {?function} condition condition function
 * @param {?object} context target context
 * @returns {*} minimum value
 */
var min = function(arr, condition, context) {
    var result, minValue, rest;

    if (!condition) {
        result = Math.min.apply(null, arr);
    } else {
        result = arr[0];
        minValue = condition.call(context, result, 0);
        rest = arr.slice(1);
        snippet.forEachArray(rest, function(item, index) {
            var compareValue = condition.call(context, item, index + 1);
            if (compareValue < minValue) {
                minValue = compareValue;
                result = item;
            }
        });
    }

    return result;
};

/**
 * Pick maximum value from value array.
 * @memberOf module:arrayUtil
 * @param {Array} arr value array
 * @param {?function} [condition] condition function
 * @param {?object} [context] target context
 * @returns {*} maximum value
 */
var max = function(arr, condition, context) {
    var result, maxValue, rest;

    if (!condition) {
        result = Math.max.apply(null, arr);
    } else {
        result = arr[0];
        maxValue = condition.call(context, result, 0);
        rest = arr.slice(1);
        snippet.forEachArray(rest, function(item, index) {
            var compareValue = condition.call(context, item, index + 1);
            if (compareValue > maxValue) {
                maxValue = compareValue;
                result = item;
            }
        });
    }

    return result;
};

/**
 * Whether one of them is true or not.
 * @memberOf module:arrayUtil
 * @param {Array} collection target collection
 * @param {function} condition condition function
 * @param {?object} context target context
 * @returns {boolean} result boolean
 */
var any = function(collection, condition, context) {
    var result = false;
    snippet.forEach(collection, function(item, key) {
        if (condition.call(context, item, key, collection)) {
            result = true;
        }

        return !result;
    });

    return result;
};

/**
 * All of them is true or not.
 * @memberOf module:arrayUtil
 * @param {Array} collection target collection
 * @param {function} condition condition function
 * @param {?object} context target context
 * @returns {boolean} result boolean
 */
var all = function(collection, condition, context) {
    var result = !!(collection || []).length;
    snippet.forEach(collection, function(item, key) {
        if (!condition.call(context, item, key, collection)) {
            result = false;
        }

        return result !== false;
    });

    return result;
};

/**
 * Make unique values.
 * @memberOf module:arrayUtil
 * @param {Array} arr target array
 * @param {?boolean} sorted whether sorted or not.
 * @param {?function} iteratee iteratee function
 * @param {?object} context target context
 * @returns {Array} unique values
 */
var unique = function(arr, sorted, iteratee, context) {
    var result = [],
        prevValue;

    if (!snippet.isBoolean(sorted)) {
        context = iteratee;
        iteratee = sorted;
        sorted = false;
    }

    iteratee = iteratee || function(value) {
        return value;
    };

    if (sorted) {
        snippet.forEachArray(arr, function(value, index) {
            value = iteratee.call(context, value, index, arr);
            if (!index || prevValue !== value) {
                result.push(value);
            }
            prevValue = value;
        });
    } else {
        snippet.forEachArray(arr, function(value, index) {
            value = iteratee.call(context, value, index, arr);
            if (snippet.inArray(value, result) === -1) {
                result.push(value);
            }
        });
    }

    return result;
};

/**
 * Array pivot.
 * @memberOf module:arrayUtil
 * @param {Array.<Array>} arr2d target 2d array
 * @returns {Array.<Array>} pivoted 2d array
 */
var pivot = function(arr2d) {
    var result = [];
    var len = max(snippet.map(arr2d, function(arr) {
        return arr.length;
    }));
    var index;

    snippet.forEachArray(arr2d, function(arr) {
        for (index = 0; index < len; index += 1) {
            if (!result[index]) {
                result[index] = [];
            }
            result[index].push(arr[index]);
        }
    });

    return result;
};

var arrayUtil = {
    min: min,
    max: max,
    any: any,
    all: all,
    unique: unique,
    pivot: pivot
};

module.exports = arrayUtil;
