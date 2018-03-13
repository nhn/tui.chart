/**
 * @fileoverview Implement function that calculate coordinate scale data
 * @author Sungho Kim
 */

'use strict';

var snippet = require('tui-code-snippet');

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
    var logNumberDividedLN10 = number === 0 ? 1 : (Math.log(Math.abs(number)) / Math.LN10);

    return Math.pow(10, Math.floor(logNumberDividedLN10));
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
 * @returns {{
 *     min: number,
 *     max: number
 * }}
 * max = 155 and step = 10 ---> max = 160
 */
function getNormalizedLimit(min, max, step) {
    var minNumber = Math.min(getDigits(max), getDigits(step));
    var placeNumber = minNumber > 1 ? 1 : (1 / minNumber);
    var fixedStep = (step * placeNumber);

    // ceil max value step digits
    max = Math.ceil((max * placeNumber) / fixedStep) * fixedStep / placeNumber;

    if (min > step) {
        // floor min value to multiples of step
        min = Math.floor((min * placeNumber) / fixedStep) * fixedStep / placeNumber;
    } else if (min < 0) {
        min = -(Math.ceil((Math.abs(min) * placeNumber) / fixedStep) * fixedStep) / placeNumber;
    } else {
        // 0 when min value is positive and smaller than step
        min = 0;
    }

    return {
        min: min,
        max: max
    };
}

/**
 * Get normalized step count for floating point calculate error
 * @param {number} limitSize limit size of chart min max distance
 * @param {number} step step distance
 * @returns {number}
 * @ignore
 */
function getNormalizedStepCount(limitSize, step) {
    var multiplier = 1 / Math.min(getDigits(limitSize), getDigits(step));

    return Math.ceil((limitSize * multiplier) / (step * multiplier));
}

/**
 * Get normalized scale data
 * @param {object} scale scale
 * @private
 * @returns {object}
 * @ignore
 */
function getNormalizedScale(scale) {
    var step = getNormalizedStep(scale.step);
    var edge = getNormalizedLimit(scale.limit.min, scale.limit.max, step);
    var limitSize = Math.abs(edge.max - edge.min);
    var stepCount = getNormalizedStepCount(limitSize, step);

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
 * @param {object} [minimumStepSize] for ensure minimum step size
 * @private
 * @returns {object} scale data
 */
function getRoughScale(min, max, offsetSize, stepCount, minimumStepSize) {
    var limitSize = Math.abs(max - min);
    var valuePerPixel = limitSize / offsetSize;
    var pixelsPerStep, step;

    if (!stepCount) {
        stepCount = Math.ceil(offsetSize / DEFAULT_PIXELS_PER_STEP);
    }

    pixelsPerStep = offsetSize / stepCount;

    step = valuePerPixel * pixelsPerStep;

    if (snippet.isNumber(minimumStepSize) && step < minimumStepSize) {
        step = minimumStepSize;
        stepCount = limitSize / step;
    }

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
 * @param {object} options optionsPP
 * @param {object} options.min min value
 * @param {object} options.max max value
 * @param {object} options.offsetSize offset pixel size of screen that needs scale
 * @param {object} [options.stepCount] if need fixed step count
 * @param {object} [options.minimumStepSize] for ensure minimum step size
 * @returns {object}
 * @ignore
 */
function coordinateScaleCalculator(options) {
    var min = options.min;
    var max = options.max;
    var offsetSize = options.offsetSize;
    var stepCount = options.stepCount;
    var minimumStepSize = options.minimumStepSize;

    var scale = getRoughScale(min, max, offsetSize, stepCount, minimumStepSize);
    scale = getNormalizedScale(scale);

    return scale;
}

module.exports = coordinateScaleCalculator;
