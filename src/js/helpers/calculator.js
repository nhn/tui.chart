/**
 * @fileoverview calculator.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var snippet = require('tui-code-snippet');
var arrayUtil = require('./arrayUtil');
var PERCENT_DIVISOR = 100;

/**
 * Calculator.
 * @module calculator
 * @private */
var calculator = {
    /**
     * Calculate limit from chart min, max data.
     *  - http://peltiertech.com/how-excel-calculates-automatic-chart-axis-limits/
     * @memberOf module:calculator
     * @param {number} min min minimum value of user data
     * @param {number} max max maximum value of user data
     * @returns {{min: number, max: number}} limit axis limit
     */
    calculateLimit: function(min, max) {
        var saveMin = 0,
            limit = {},
            iodValue; // increase or decrease value;

        if (min < 0) {
            saveMin = min;
            max -= min;
            min = 0;
        }

        iodValue = (max - min) / 20;
        limit.max = max + iodValue + saveMin;

        if (max / 6 > min) {
            limit.min = saveMin;
        } else {
            limit.min = min - iodValue + saveMin;
        }

        return limit;
    },

    /**
     * Make tick positions of pixel type.
     * @memberOf module:calculator
     * @param {number} size area width or height
     * @param {number} count tick count
     * @param {?number} additionalPosition additional position
     * @returns {Array.<number>} positions
     */
    makeTickPixelPositions: function(size, count, additionalPosition) {
        var positions = [];

        additionalPosition = additionalPosition || 0;

        if (count > 0) {
            positions = snippet.map(snippet.range(0, count), function(index) {
                var ratio = index === 0 ? 0 : (index / (count - 1));

                return (ratio * size) + additionalPosition;
            });
            positions[positions.length - 1] -= 1;
        }

        return positions;
    },

    /**
     * Make labels from limit.
     * @memberOf module:calculator
     * @param {{min: number, max: number}} limit axis limit
     * @param {number} step step between max and min
     * @returns {string[]} labels
     * @private
     */
    makeLabelsFromLimit: function(limit, step) {
        var multipleNum = calculator.findMultipleNum(step);
        var min = Math.round(limit.min * multipleNum);
        var max = Math.round(limit.max * multipleNum);
        var labels = snippet.range(min, max + 1, step * multipleNum);

        return snippet.map(labels, function(label) {
            return label / multipleNum;
        });
    },

    /**
     * Calculate step from limit.
     * @memberOf module:calculator
     * @param {{min: number, max: number}} limit axis limit
     * @param {number} count value count
     * @returns {number} step
     */
    calculateStepFromLimit: function(limit, count) {
        return calculator.divide(calculator.subtract(limit.max, limit.min), (count - 1));
    },

    /**
     * Sum plus values.
     * @param {Array.<number>} values values
     * @returns {number} sum
     */
    sumPlusValues: function(values) {
        var plusValues = snippet.filter(values, function(value) {
            return value > 0;
        });

        return calculator.sum(plusValues);
    },

    /**
     * Sum minus values.
     * @param {Array.<number>} values values
     * @returns {number} sum
     */
    sumMinusValues: function(values) {
        var minusValues = snippet.filter(values, function(value) {
            return value < 0;
        });

        return calculator.sum(minusValues);
    },

    /**
     * Make percentage value.
     * @param {number} value - value
     * @param {number} totalValue - total value
     * @returns {number}
     */
    makePercentageValue: function(value, totalValue) {
        return value / totalValue * PERCENT_DIVISOR;
    },

    /**
     * Calculate ratio for making bound.
     * @param {number} value - value
     * @param {number} divNumber - number for division
     * @param {number} subNumber - number for subtraction
     * @param {number} baseRatio - base ratio
     * @returns {number}
     */
    calculateRatio: function(value, divNumber, subNumber, baseRatio) {
        return ((value - subNumber) / divNumber) * baseRatio;
    }
};

/**
 * Get length after decimal point.
 * @memberOf module:calculator
 * @param {string | number} value target value
 * @returns {number} result length
 */
var getDecimalLength = function(value) {
    var valueArr = String(value).split('.');

    return valueArr.length === 2 ? valueArr[1].length : 0;
};

/**
 * Find multiple num.
 * @memberOf module:calculator
 * @param {...Array} target values
 * @returns {number} multiple num
 */
var findMultipleNum = function() {
    var args = [].slice.call(arguments);
    var underPointLens = snippet.map(args, function(value) {
        return calculator.getDecimalLength(value);
    });
    var underPointLen = arrayUtil.max(underPointLens);

    return Math.pow(10, underPointLen);
};

/**
 * Modulo operation for floating point operation.
 * @memberOf module:calculator
 * @param {number} target target values
 * @param {number} modNum mod num
 * @returns {number} result mod
 */
var mod = function(target, modNum) {
    var multipleNum = calculator.findMultipleNum(modNum);
    var result;

    if (multipleNum === 1) {
        result = target % modNum;
    } else {
        result = ((target * multipleNum) % (modNum * multipleNum)) / multipleNum;
    }

    return result;
};

/**
 * 'add' is function for add operation to floating point.
 * @memberOf module:calculator
 * @param {number} a target a
 * @param {number} b target b
 * @returns {number}
 */
var add = function(a, b) {
    var multipleNum = calculator.findMultipleNum(a, b);

    return ((a * multipleNum) + (b * multipleNum)) / multipleNum;
};

/**
 * 'subtract' is function for subtract operation to floating point.
 * @memberOf module:calculator
 * @param {number} a target a
 * @param {number} b target b
 * @returns {number}
 */
var subtract = function(a, b) {
    var multipleNum = calculator.findMultipleNum(a, b);

    return ((a * multipleNum) - (b * multipleNum)) / multipleNum;
};

/**
 * 'multiply' is function for multiply operation to floating point.
 * @param {number} a target a
 * @param {number} b target b
 * @returns {number}
 */
var multiply = function(a, b) {
    var multipleNum = calculator.findMultipleNum(a, b);

    return ((a * multipleNum) * (b * multipleNum)) / (multipleNum * multipleNum);
};

/**
 * 'divide' is function for divide operation to floating point.
 * @memberOf module:calculator
 * @param {number} a target a
 * @param {number} b target b
 * @returns {number}
 */
var divide = function(a, b) {
    var multipleNum = calculator.findMultipleNum(a, b);

    return (a * multipleNum) / (b * multipleNum);
};

/**
 * Sum.
 * @memberOf module:calculator
 * @param {Array.<number>} values target values
 * @returns {number} result value
 */
var sum = function(values) {
    var copyArr = values.slice();
    copyArr.unshift(0);

    return snippet.reduce(copyArr, function(base, value) {
        return calculator.add(parseFloat(base), parseFloat(value));
    });
};

calculator.getDecimalLength = getDecimalLength;
calculator.findMultipleNum = findMultipleNum;
calculator.mod = mod;
calculator.add = add;
calculator.subtract = subtract;
calculator.multiply = multiply;
calculator.divide = divide;
calculator.sum = sum;

module.exports = calculator;
