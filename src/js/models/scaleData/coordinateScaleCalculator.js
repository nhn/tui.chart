/**
 * @fileoverview Implement function that calculate coordinate scale data
 * @author Sungho Kim
 */

'use strict';

/**
 * The reference values to normailze value
 * @private
 * @type {Array.<number>}
 */
var SNAP_VALUES = [1, 2, 5, 10];

/**
 * Default step pixel size
 * @private
 * @type {number}
 */
var DEFAULT_PIXELS_PER_STEP = 88;

/**
 * Get digits of number
 * @param {number} number number
 * @returns {number}
 * @private
 * @example
 * this.getDigits(2145) == 1000
 */
function getDigits(number) {
    var logNumberDevidedLN10 = Math.log(number) / Math.LN10;

    return Math.pow(10, Math.floor(logNumberDevidedLN10));
}

/**
 * Select value within SNAP_VALUES that most close with given value
 * @param {number} number number
 * @private
 * @returns {number}
 */
function getSnappedNumber(number) {
    var guideValue, snapNumber, i, t;

    for (i = 0, t = SNAP_VALUES.length; i < t; i += 1) {
        snapNumber = SNAP_VALUES[i];
        guideValue = (snapNumber + (SNAP_VALUES[i + 1] || snapNumber)) / 2;

        if (number <= guideValue) {
            break;
        }
    }

    return snapNumber;
}

/**
 * Get normalized step value
 * @param {number} step step
 * @private
 * @returns {number}
 */
function getNormalizedStep(step) {
    var placeNumber = getDigits(step);
    var simplifiedStepValue = step / placeNumber;

    return getSnappedNumber(simplifiedStepValue) * placeNumber;
}

/**
 * Get normailzed limit values
 * @param {number} min min
 * @param {number} max max
 * @param {number} step step
 * @private
 * @returns {number}
 * max = 155 and step = 10 ---> max = 160
 */
function getNormalizedLimit(min, max, step) {
    // max의 step 자릿수 이하 올림
    max = Math.ceil(max / step) * step;

    if (min > step) {
        // 최소값을 step 의 배수로 조정
        min = step * Math.floor(min / step);
    } else if (min < 0) {
        min = -(Math.ceil(Math.abs(min) / step) * step);
    } else {
        // min값이 양수이고 step 보다 작으면 0으로 설정
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
 * @private
 * @returns {object}
 */
function getNormalizedScale(scale) {
    var step = getNormalizedStep(scale.step);
    var edge = getNormalizedLimit(scale.limit.min, scale.limit.max, step);
    var limitSize = Math.abs(edge.max - edge.min);
    var stepCount = limitSize / step;

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
 * Get rough(not normalized) scale data
 * @param {number} min min
 * @param {number} max max
 * @param {number} offsetSize offset size
 * @param {number} stepCount step count
 * @private
 * @returns {object} scale data
 */
function getRoughScale(min, max, offsetSize, stepCount) {
    var limitSize = Math.abs(max - min);
    var valuePerPixel = limitSize / offsetSize;
    var pixelsPerStep, step;

    if (!stepCount) {
        stepCount = Math.ceil(offsetSize / DEFAULT_PIXELS_PER_STEP);
    }

    pixelsPerStep = offsetSize / stepCount;

    step = valuePerPixel * pixelsPerStep;

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
 * Calculate coordinate scale
 * @param {object} options options
 * @param {object} options.min min value
 * @param {object} options.max max value
 * @param {object} options.offsetSize offset pixel size of screen that needs scale
 * @param {object} [options.stepCount] if need fixed step count
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
