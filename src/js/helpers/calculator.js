/**
 * @fileoverview calculator.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const');

/**
 * Calculator.
 * @module calculator
 */
var calculator = {
    /**
     * Calculate limit from chart min, max data.
     *  - http://peltiertech.com/how-excel-calculates-automatic-chart-axis-limits/
     * @memberOf module:calculator
     * @param {number} min min minimum value of user data
     * @param {number} max max maximum value of user data
     * @param {number} tickCount tick count
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
            limit.min = 0 + saveMin;
        } else {
            limit.min = min - iodValue + saveMin;
        }
        return limit;
    },

    /**
     * Normalize number.
     * @memberOf module:calculator
     * @param {number} value target value
     * @returns {number} normalized number
     */
    normalizeAxisNumber: function(value) {
        var standard = 0,
            flag = 1,
            normalized, mod;

        if (value === 0) {
            return value;
        } else if (value < 0) {
            flag = -1;
        }

        value *= flag;

        tui.util.forEachArray(chartConst.AXIS_STANDARD_MULTIPLE_NUMS, function(num) {
            if (value < num) {
                if (num > 1) {
                    standard = num;
                }
                return false;
            } else if (num === chartConst.AXIS_LAST_STANDARD_MULTIPLE_NUM) {
                standard = num;
            }
        });

        if (standard < 1) {
            normalized = this.normalizeAxisNumber(value * 10) * 0.1;
        } else {
            mod = tui.util.mod(value, standard);
            normalized = tui.util.addition(value, (mod > 0 ? standard - mod : 0));
        }

        normalized *= flag;

        return normalized;
    },

    /**
     * Make tick positions of pixel type.
     * @memberOf module:calculator
     * @param {number} size area width or height
     * @param {number} count tick count
     * @returns {Array.<number>} positions
     */
    makeTickPixelPositions: function(size, count) {
        var positions = [],
            pxLimit, pxStep;

        if (count > 0) {
            pxLimit = {min: 0, max: size - 1};
            pxStep = this.calculateStepFromLimit(pxLimit, count);
            positions = tui.util.map(tui.util.range(0, size, pxStep), function(position) {
                return Math.round(position);
            });
            positions[positions.length - 1] = size - 1;
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
        var multipleNum = tui.util.findMultipleNum(step),
            min = limit.min * multipleNum,
            max = limit.max * multipleNum,
            labels = tui.util.range(min, max + 1, step * multipleNum);
        labels = tui.util.map(labels, function(label) {
            return label / multipleNum;
        });
        return labels;
    },

    /**
     * Calculate step from limit.
     * @memberOf module:calculator
     * @param {{min: number, max: number}} limit axis limit
     * @param {number} count value count
     * @returns {number} step
     */
    calculateStepFromLimit: function(limit, count) {
        return (limit.max - limit.min) / (count - 1);
    },

    /**
     * Calculate adjacent.
     * @param {number} degree degree
     * @param {number} hypotenuse hypotenuse
     * @returns {number} adjacent
     *
     *   H : Hypotenuse
     *   A : Adjacent
     *   O : Opposite
     *   D : Degree
     *
     *        /|
     *       / |
     *    H /  | O
     *     /   |
     *    /\ D |
     *    -----
     *       A
     */
    calculateAdjacent: function(degree, hypotenuse) {
        return Math.cos(degree * chartConst.RAD) * hypotenuse;
    },

    /**
     * Calculate opposite.
     * @param {number} degree degree
     * @param {number} hypotenuse hypotenuse
     * @returns {number} opposite
     */
    calculateOpposite: function(degree, hypotenuse) {
        return Math.sin(degree * chartConst.RAD) * hypotenuse;
    },

    /**
     * Sum plus values.
     * @param {Array.<number>} values values
     * @returns {number} sum
     */
    sumPlusValues: function(values) {
        var plusValues = tui.util.filter(values, function(value) {
            return value > 0;
        });
        return tui.util.sum(plusValues);
    },

    /**
     * Sum minus values.
     * @param {Array.<number>} values values
     * @returns {number} sum
     */
    sumMinusValues: function(values) {
        var minusValues = tui.util.filter(values, function(value) {
            return value < 0;
        });
        return tui.util.sum(minusValues);
    }
};

module.exports = calculator;
