/**
 * @fileoverview Implement function that  caculate coordinate scale data
 * @author Sungho Kim
 */

'use strict';

/**
 * The reference values to normailze value
 * @type number[]
 */
var SNAP_VALUES = [1, 2, 5, 10];

/**
 * Default tick pixel size
 * @type {number}
 */
var DEFAULT_PIXELS_PER_TICK = 88;

/**
 * Get rough(not normalized) scale data
 * @param {number} min min
 * @param {number} max max
 * @param {number} offsetSize offset size
 * @param {number} stepCount tick count
 * @returns {object} scale data
 */
function getRoughScale(min, max, offsetSize, stepCount) {
    var edgeSize = Math.abs(max - min);
    var valuePerPixel = edgeSize / offsetSize;
    var pixelsPerTick, step;

    if (!stepCount) {
        stepCount = Math.ceil(offsetSize / DEFAULT_PIXELS_PER_TICK);
    }

    pixelsPerTick = offsetSize / stepCount;

    step = valuePerPixel * pixelsPerTick;

    return {
        limit: {
            min: min,
            max: max
        },
        step: step,
        stepCount: stepCount
    };
}

/**
 * Get digit place number
 * @param {Number} number number
 * @returns {Number}
 * @example
 * this.getPlaceNumber(2145) == 1000
 */
function getPlaceNumber(number) {
    var logNumberDevidedLN10 = Math.log(number) / Math.LN10;

    return Math.pow(10, Math.floor(logNumberDevidedLN10));
}

/**
 * Select value within SNAP_VALUES that most close with given value
 * @Param {Number} number number
 * @returns {Number}
 */
function getSnappedNumber(number) {
    var guideValue, snapNumber, i, t;

    for (i = 0, t = SNAP_VALUES.length; i < t; i += 1) {
        guideValue = (SNAP_VALUES[i] + (SNAP_VALUES[i + 1] || SNAP_VALUES[i])) / 2;

        if (number <= guideValue) {
            snapNumber = SNAP_VALUES[i];
            break;
        }
    }

    return snapNumber;
}

/**
 * Get normalized tick value
 * @param {number} step step
 * @returns {number}
 */
function getNormalizedTickValue(step) {
    var placeNumber = getPlaceNumber(step);
    var simplifiedStepValue = step / placeNumber;

    return getSnappedNumber(simplifiedStepValue) * placeNumber;
}

/**
 * Get normailzed edge values
 * @param {number} min min
 * @param {number} max max
 * @param {number} step step
 * @returns {number}
 * max = 155 and step = 10 ?? ---> max = 160
 */
function getNormalizeEdges(min, max, step) {
    // max의 tickValue자릿수 이하 올림
    max = Math.ceil(max / step) * step;

    if (min > step) {
        // 최소값을 tickValue의 배수로 조정
        min = step * Math.floor(min / step);
    } else if (min < 0) {
        min = -(Math.ceil(Math.abs(min) / step) * step);
    } else {
        // min값이 양수이고 tickValue보다 작으면 0으로 설정
        min = 0;
    }

    return {
        min: min,
        max: max
    };
}

/**
 * Get normalized scale data
 * @param {object} scale scale
 * @returns {object}
 */
function getNormalizedScale(scale) {
    var step = getNormalizedTickValue(scale.step);
    var edge = getNormalizeEdges(scale.limit.min, scale.limit.max, step);
    var stepCount = scale.stepCount;

    return {
        limit: {
            min: edge.min,
            max: edge.max
        },
        step: step,
        stepCount: stepCount
    };
}

/**
 * Calculate coordinate scale
 * @param {object} options options
 * @param {object} options.min min value
 * @param {object} options.max max value
 * @param {object} options.offsetSize offset pixel size of screen that needs scale
 * @param {object} [options.stepCount] if need fixed tick count
 * @returns {object}
 */
function coordinateScaleCalculator(options) {
    var min = options.min;
    var max = options.max;
    var offsetSize = options.offsetSize;
    var stepCount = options.stepCount;

    var scale = getRoughScale(min, max, offsetSize, stepCount);
    scale = getNormalizedScale(scale);

    return scale;
}

module.exports = coordinateScaleCalculator;
