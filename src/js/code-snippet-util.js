'use strict';

/**
 * Pick minimum value from value array.
 * @param {Array} arr value array
 * @param {?function} condition condition function
 * @param {?object} context target context
 * @returns {*} minimum value
 */
var min = function(arr, condition, context) {
    var result, minValue, rest;

    if (!condition) {
        result =  Math.min.apply(null, arr);
    } else {
        result = arr[0];
        minValue = condition.call(context, result, 0);
        rest = arr.slice(1);
        tui.util.forEachArray(rest, function(item, index) {
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
 * @param {Array} arr value array
 * @param {?function} condition condition function
 * @param {?object} context target context
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
        tui.util.forEachArray(rest, function(item, index) {
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
 * @param {Array} collection target collection
 * @param {function} condition condition function
 * @param {?object} context target context
 * @returns {boolean} result boolean
 */
var any = function(collection, condition, context) {
    var result = false;
    tui.util.forEach(collection, function(item, key) {
        if (condition.call(context, item, key, collection)) {
            result = true;
            return false;
        }
    });
    return result;
};

/**
 * All of them is true or not.
 * @param {Array} collection target collection
 * @param {function} condition condition function
 * @param {[object]} context target context
 * @returns {boolean} result boolean
 */
var all = function(collection, condition, context) {
    var result = !!(collection || []).length;
    tui.util.forEach(collection, function(item, key) {
        if (!condition.call(context, item, key, collection)) {
            result = false;
            return false;
        }
    });
    return result;
};

/**
 * Make unique values.
 * @param {Array} arr target array
 * @param {?boolean} sorted whether sorted or not.
 * @param {?function} iteratee iteratee function
 * @param {?object} context target context
 * @returns {Array} unique values
 */
var unique = function(arr, sorted, iteratee, context) {
    var result = [],
        prevValue;

    if (!tui.util.isBoolean(sorted)) {
        context = iteratee;
        iteratee = sorted;
        sorted = false;
    }

    iteratee = iteratee || function(value) {
        return value;
    };

    if (sorted) {
        tui.util.forEachArray(arr, function (value, index) {
            value = iteratee.call(context, value, index, arr);
            if (!index || prevValue !== value) {
                result.push(value);
            }
            prevValue = value;
        });
    } else {
        tui.util.forEachArray(arr, function(value, index) {
            value = iteratee.call(context, value, index, arr);
            if (tui.util.inArray(value, result) === -1) {
                result.push(value);
            }
        });
    }

    return result;
};

/**
 * Array pivot.
 * @memberOf module:calculator
 * @param {Array.<Array>} arr2d target 2d array
 * @returns {Array.<Array>} pivoted 2d array
 */
var pivot = function(arr2d) {
    var result = [];
    var len = tui.util.max(tui.util.map(arr2d, function(arr) {
        return arr.length;
    }));
    var index;

    tui.util.forEachArray(arr2d, function(arr) {
        for(index = 0; index < len; index += 1) {
            if (!result[index]) {
                result[index] = [];
            }
            result[index].push(arr[index]);
        }
    });
    return result;
};

/**
 * Get length after decimal point.
 * @param {string | number} value target value
 * @returns {number} result length
 */
var getDecimalLength = function(value) {
    var valueArr = String(value).split('.');
    return valueArr.length === 2 ? valueArr[1].length : 0;
};

/**
 * Find multiple num.
 * @param {...Array} target values
 * @returns {number} multiple num
 */
var findMultipleNum = function() {
    var args = [].slice.call(arguments),
        underPointLens = tui.util.map(args, function(value) {
            return tui.util.getDecimalLength(value);
        }),
        underPointLen = tui.util.max(underPointLens),
        multipleNum = Math.pow(10, underPointLen);
    return multipleNum;
};

/**
 * Modulo operation for floating point operation.
 * @param {number} target target values
 * @param {number} modNum mod num
 * @returns {number} result mod
 */
var mod = function(target, modNum) {
    var multipleNum = tui.util.findMultipleNum(modNum);
    return ((target * multipleNum) % (modNum * multipleNum)) / multipleNum;
};

/**
 * Addition for floating point operation.
 * @param {number} a target a
 * @param {number} b target b
 * @returns {number} addition result
 */
var addition = function(a, b) {
    var multipleNum = findMultipleNum(a, b);
    return ((a * multipleNum) + (b * multipleNum)) / multipleNum;
};

/**
 * Subtraction for floating point operation.
 * @param {number} a target a
 * @param {number} b target b
 * @returns {number} subtraction result
 */
var subtraction = function(a, b) {
    var multipleNum = findMultipleNum(a, b);
    return ((a * multipleNum) - (b * multipleNum)) / multipleNum;
};

/**
 * Multiplication for floating point operation.
 * @param {number} a target a
 * @param {number} b target b
 * @returns {number} multiplication result
 */
var multiplication = function(a, b) {
    var multipleNum = findMultipleNum(a, b);
    return ((a * multipleNum) * (b * multipleNum)) / (multipleNum * multipleNum);
};

/**
 * Division for floating point operation.
 * @param {number} a target a
 * @param {number} b target b
 * @returns {number} division result
 */
var division = function(a, b) {
    var multipleNum = findMultipleNum(a, b);
    return (a * multipleNum) / (b * multipleNum);
};

/**
 * Sum.
 * @param {Array.<number>} values target values
 * @returns {number} result value
 */
var sum = function(values) {
    var copyArr = values.slice();
    copyArr.unshift(0);
    return tui.util.reduce(copyArr, function(base, add) {
        return parseFloat(base) + parseFloat(add);
    });
};

/**
 * Proper case.
 * @param {string} value - string value
 * @returns {string}
 */
var properCase = function(value) {
    return value.substring(0, 1).toUpperCase() + value.substring(1);
};

/**
 * Deep copy.
 * @param {object|Array|*} origin - original data
 * @returns {*}
 */
var deepCopy = function(origin) {
    var clone;

    if (tui.util.isArray(origin)) {
        clone = [];
        tui.util.forEachArray(origin, function (value, index) {
            clone[index] = deepCopy(value);
        });
    } else if (tui.util.isFunction(origin)) {
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

tui.util.min = min;
tui.util.max = max;
tui.util.any = any;
tui.util.all = all;
tui.util.unique = unique;
tui.util.pivot = pivot;
tui.util.getDecimalLength = getDecimalLength;
tui.util.mod = mod;
tui.util.findMultipleNum = findMultipleNum;
tui.util.addition = addition;
tui.util.subtraction = subtraction;
tui.util.multiplication = multiplication;
tui.util.division = division;
tui.util.sum = sum;
tui.util.properCase = properCase;
tui.util.deepCopy = deepCopy;
