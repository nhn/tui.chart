/**
 * @fileoverview Implement function that calculate coordinate scale data
 * @author Sungho Kim
 */

import snippet from 'tui-code-snippet';

/**
 * The reference values to normailze value
 * @private
 * @type {Array.<number>}
 */
const SNAP_VALUES = [1, 2, 5, 10];

/**
 * Default step pixel size
 * @private
 * @type {number}
 */
const DEFAULT_PIXELS_PER_STEP = 88;

/**
 * Get digits of number
 * @param {number} number number
 * @returns {number}
 * @private
 * @example
 * this.getDigits(2145) == 1000
 */
function getDigits(number) {
  const logNumberDividedLN10 = number === 0 ? 1 : Math.log(Math.abs(number)) / Math.LN10;

  return Math.pow(10, Math.floor(logNumberDividedLN10));
}

/**
 * Select value within SNAP_VALUES that most close with given value
 * @param {number} number number
 * @private
 * @returns {number}
 */
function getSnappedNumber(number) {
  let snapNumber;

  for (let i = 0, t = SNAP_VALUES.length; i < t; i += 1) {
    snapNumber = SNAP_VALUES[i];
    const guideValue = (snapNumber + (SNAP_VALUES[i + 1] || snapNumber)) / 2;

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
  const placeNumber = getDigits(step);
  const simplifiedStepValue = step / placeNumber;

  return getSnappedNumber(simplifiedStepValue) * placeNumber;
}

/**
 * Get normailzed limit values
 * @param {number} min min
 * @param {number} max max
 * @param {number} step step
 * @param {number} [showLabel] showLabel option
 * @private
 * @returns {{
 *     min: number,
 *     max: number
 * }}
 * max = 155 and step = 10 ---> max = 160
 */
function getNormalizedLimit(min, max, step, showLabel) {
  const minNumber = Math.min(getDigits(max), getDigits(step));
  const placeNumber = minNumber > 1 ? 1 : 1 / minNumber;
  const fixedStep = step * placeNumber;
  const noExtraMax = max;
  let isNotEnoughSize = false;

  // ceil max value step digits
  max = (Math.ceil((max * placeNumber) / fixedStep) * fixedStep) / placeNumber;
  isNotEnoughSize = fixedStep / 2 > max - noExtraMax;

  if (showLabel && isNotEnoughSize) {
    max += fixedStep;
  }

  if (min > step) {
    // floor min value to multiples of step
    min = (Math.floor((min * placeNumber) / fixedStep) * fixedStep) / placeNumber;
  } else if (min < 0) {
    min = -(Math.ceil((Math.abs(min) * placeNumber) / fixedStep) * fixedStep) / placeNumber;
  } else {
    // 0 when min value is positive and smaller than step
    min = 0;
  }

  return {
    min,
    max
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
  const multiplier = 1 / Math.min(getDigits(limitSize), getDigits(step));

  return Math.ceil((limitSize * multiplier) / (step * multiplier));
}

/**
 * Get normalized scale data
 * @param {object} scale scale
 * @param {number} [showLabel] showLabel option
 * @private
 * @returns {object}
 * @ignore
 */
function getNormalizedScale(scale, showLabel) {
  const step = getNormalizedStep(scale.step);
  const edge = getNormalizedLimit(scale.limit.min, scale.limit.max, step, showLabel);
  const limitSize = Math.abs(edge.max - edge.min);
  const stepCount = getNormalizedStepCount(limitSize, step);

  return {
    limit: {
      min: edge.min,
      max: edge.max
    },
    step,
    stepCount
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
  const limitSize = Math.abs(max - min);
  const valuePerPixel = limitSize / offsetSize;

  if (!stepCount) {
    stepCount = Math.ceil(offsetSize / DEFAULT_PIXELS_PER_STEP);
  }

  const pixelsPerStep = offsetSize / stepCount;
  let step = valuePerPixel * pixelsPerStep;

  if (snippet.isNumber(minimumStepSize) && step < minimumStepSize) {
    step = minimumStepSize;
    stepCount = limitSize / step;
  }

  return {
    limit: {
      min,
      max
    },
    step,
    stepCount
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
  const { min, max, offsetSize, stepCount, minimumStepSize, showLabel } = options;
  let scale = getRoughScale(min, max, offsetSize, stepCount, minimumStepSize);

  scale = getNormalizedScale(scale, showLabel);

  return scale;
}

export default coordinateScaleCalculator;
