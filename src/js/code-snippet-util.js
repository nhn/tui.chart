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
        condition = function(item) {
            return item;
        };
    }
    result = arr[0];
    minValue = condition.call(context, result);
    rest = arr.slice(1);
    tui.util.forEachArray(rest, function(item) {
        var compareValue = condition.call(context, item);
        if (compareValue < minValue) {
            minValue = compareValue;
            result = item;
        }
    });
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
        condition = function(item) {
            return item;
        };
    }
    result = arr[0];
    maxValue = condition.call(context, result);
    rest = arr.slice(1);
    tui.util.forEachArray(rest, function(item) {
        var compareValue = condition.call(context, item);
        if (compareValue > maxValue) {
            maxValue = compareValue;
            result = item;
        }
    });
    return result;
};

/**
 * Whether one of them is true or not.
 * @param {Array} arr target array
 * @param {function} condition condition function
 * @param {?object} context target context
 * @returns {boolean} result boolean
 */
var any = function(arr, condition, context) {
    var result = false;
    tui.util.forEachArray(arr, function(item, index) {
        if (condition.call(context, item, index, arr)) {
            result = true;
            return false;
        }
    });
    return result;
};

/**
 * All of them is true or not.
 * @param {Array} arr target array
 * @param {function} condition condition function
 * @param {[object]} context target context
 * @returns {boolean} result boolean
 */
var all = function(arr, condition, context) {
    var result = true;
    tui.util.forEachArray(arr, function(item, index) {
        if (!condition.call(context, item, index, arr)) {
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
    tui.util.forEachArray(arr2d, function(arr) {
        tui.util.forEachArray(arr, function(value, index) {
            if (!result[index]) {
                result[index] = [];
            }
            result[index].push(value);
        });
    });
    return result;
};

/**
 * Get after point length.
 * @param {string | number} value target value
 * @returns {number} result length
 */
var lengthAfterPoint = function(value) {
    var valueArr = (value + '').split('.');
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
            return tui.util.lengthAfterPoint(value);
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


var properCase = function(str) {
    return str.substring(0, 1).toUpperCase() + str.substring(1);
};

tui.util.min = min;
tui.util.max = max;
tui.util.any = any;
tui.util.all = all;
tui.util.unique = unique;
tui.util.pivot = pivot;
tui.util.lengthAfterPoint = lengthAfterPoint;
tui.util.mod = mod;
tui.util.findMultipleNum = findMultipleNum;
tui.util.addition = addition;
tui.util.subtraction = subtraction;
tui.util.multiplication = multiplication;
tui.util.division = division;
tui.util.sum = sum;
tui.util.properCase = properCase;

var aps = Array.prototype.slice;

/**
 * Creates a debounced function that delays invoking fn until after delay milliseconds has elapsed
 * since the last time the debouced function was invoked.
 * @param {function} fn The function to debounce.
 * @param {number} [delay=0] The number of milliseconds to delay
 * @memberof tui.util
 * @returns {function} debounced function.
 * @example
 *
 * function someMethodToInvokeDebounced() {}
 *
 * var debounced = tui.util.debounce(someMethodToInvokeDebounced, 300);
 *
 * // invoke repeatedly
 * debounced();
 * debounced();
 * debounced();
 * debounced();
 * debounced();
 * debounced();    // last invoke of debounced()
 *
 * // invoke someMethodToInvokeDebounced() after 300 milliseconds.
 */
function debounce(fn, delay) {
    var timer,
        args;

    /* istanbul ignore next */
    delay = delay || 0;

    function debounced() {
        args = aps.call(arguments);

        window.clearTimeout(timer);
        timer = window.setTimeout(function() {
            fn.apply(null, args);
        }, delay);
    }

    return debounced;
}

/**
 * Creates a throttled function that only invokes fn at most once per every interval milliseconds.
 *
 * You can use this throttle short time repeatedly invoking functions. (e.g MouseMove, Resize ...)
 *
 * if you need reuse throttled method. you must remove slugs (e.g. flag variable) related with throttling.
 * @param {function} fn function to throttle
 * @param {number} [interval=0] the number of milliseconds to throttle invocations to.
 * @memberof tui.util
 * @returns {function} throttled function
 * @example
 *
 * function someMethodToInvokeThrottled() {}
 *
 * var throttled = tui.util.throttle(someMethodToInvokeThrottled, 300);
 *
 * // invoke repeatedly
 * throttled();    // invoke (leading)
 * throttled();
 * throttled();    // invoke (near 300 milliseconds)
 * throttled();
 * throttled();
 * throttled();    // invoke (near 600 milliseconds)
 * // ...
 * // invoke (trailing)
 *
 * // if you need reuse throttled method. then invoke reset()
 * throttled.reset();
 */
function throttle(fn, interval) {
    var base,
        _timestamp = tui.util.timestamp,
        debounced,
        isLeading = true,
        stamp,
        args,
        tick = function(_args) {
            fn.apply(null, _args);
            base = null;
        };

    /* istanbul ignore next */
    interval = interval || 0;

    debounced = tui.util.debounce(tick, interval);

    function throttled() {
        args = aps.call(arguments);

        if (isLeading) {
            tick(args);
            isLeading = false;
            return;
        }

        stamp = _timestamp();

        base = base || stamp;

        debounced(args);

        if ((stamp - base) >= interval) {
            tick(args);
        }
    }

    function reset() {
        isLeading = true;
        base = null;
    }

    throttled.reset = reset;
    return throttled;
}

tui.util.debounce = debounce;
tui.util.throttle = throttle;
