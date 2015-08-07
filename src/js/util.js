'use strict';

/**
 * ne.util에 range가 추가되기 전까지 임시로 사용
 * @param {number} start start
 * @param {number} stop stop
 * @param {number} step step
 * @returns {array.<number>} result array
 */
var range = function(start, stop, step) {
    var arr = [],
        flag;

    if (ne.util.isUndefined(stop)) {
        stop = start || 0;
        start = 0;
    }

    step = step || 1;
    flag = step < 0 ? -1 : 1;
    stop *= flag;

    while (start * flag < stop) {
        arr.push(start);
        start += step;
    }

    return arr;
};

/**
 * * ne.util에 pluck이 추가되기 전까지 임시로 사용
 * @param {array} arr array
 * @param {string} property property
 * @returns {array} result array
 */
var pluck = function(arr, property) {
    var result = ne.util.map(arr, function(item) {
        return item[property];
    });
    return result;
};

/**
 * * ne.util에 zip이 추가되기 전까지 임시로 사용
 * @params {...array} array
 * @returns {array} result array
 */
var zip = function() {
    var arr2 = Array.prototype.slice.call(arguments),
        result = [];

    ne.util.forEach(arr2, function(arr) {
        ne.util.forEach(arr, function(value, index) {
            if (!result[index]) {
                result[index] = [];
            }
            result[index].push(value);
        });
    });

    return result;
};

/**
 * Pick min number from number array.
 * @param {array.<number>} arr number array
 * @returns {number} result array
 */
var min = function(arr) {
    var result = Math.min.apply(null, arr);
    return result;
};

/**
 * Pick max number from number array.
 * @param {array.<number>} arr number array
 * @returns {number} result array
 */
var max = function(arr) {
    var result = Math.max.apply(null, arr);
    return result;
};

/**
 * Whether one of them is true or not.
 * @param {array} arr target array
 * @param {function} condition condition function
 * @returns {boolean} result boolean
 */
var any = function(arr, condition) {
    var result = false;
    ne.util.forEachArray(arr, function(item) {
        if (condition(item)) {
            result = true;
            return false;
        }
    });
    return result;
};

/**
 * Get under point length.
 * @param {string | number} value target value
 * @returns {number} result length
 */
var underPointLength = function(value) {
    var valueArr = (value + '').split('.');
    return valueArr.length === 2 ? valueArr[1].length : 0;
};

/**
 * Find multiple num.
 * @param {...array} target values
 * @returns {number} multiple num
 */
var findMultipleNum = function() {
    var underPointLens = ne.util.map(arguments, function(value) {
            return ne.util.underPointLength(value);
        }),
        unerPointLen = ne.util.max(underPointLens),
        multipleNum = Math.pow(10, unerPointLen);
    return multipleNum;
};

/**
 * Modulo operation for floating point operation.
 * @param {number} target target values
 * @param {number} modNum mod num
 * @returns {number} result mod
 */
var mod = function(target, modNum) {
    var multipleNum = ne.util.findMultipleNum(modNum);
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

ne.util.range = range;
ne.util.pluck = pluck;
ne.util.zip = zip;
ne.util.min = min;
ne.util.max = max;
ne.util.any = any;
ne.util.underPointLength = underPointLength;
ne.util.mod = mod;
ne.util.findMultipleNum = findMultipleNum;
ne.util.addition = addition;
ne.util.subtraction = subtraction;
ne.util.multiplication = multiplication;
ne.util.division = division;