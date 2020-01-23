/**
 * @fileoverview calculator.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import snippet from 'tui-code-snippet';
import arrayUtil from './arrayUtil';
const PERCENT_DIVISOR = 100;

/**
 * Calculator.
 * @module calculator
 * @private */
const calculator = {
  /**
   * Calculate limit from chart min, max data.
   *  - http://peltiertech.com/how-excel-calculates-automatic-chart-axis-limits/
   * @memberOf module:calculator
   * @param {number} min min minimum value of user data
   * @param {number} max max maximum value of user data
   * @returns {{min: number, max: number}} limit axis limit
   */
  calculateLimit(min, max) {
    const limit = {};
    let saveMin = 0;

    if (min < 0) {
      saveMin = min;
      max -= min;
      min = 0;
    }

    const iodValue = (max - min) / 20;

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
   * @param {?number} remainLastBlockIntervalPosition remainLastBlockInterval position
   * @returns {Array.<number>} positions
   */
  makeTickPixelPositions(size, count, additionalPosition, remainLastBlockIntervalPosition) {
    let positions = [];

    additionalPosition = additionalPosition || 0;

    if (count > 0) {
      positions = snippet.range(0, count).map(index => {
        const ratio = index === 0 ? 0 : index / (count - 1);

        return ratio * size + additionalPosition;
      });
      positions[positions.length - 1] -= 1;
    }

    if (remainLastBlockIntervalPosition) {
      positions.push(remainLastBlockIntervalPosition);
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
  makeLabelsFromLimit(limit, step) {
    const multipleNum = calculator.findMultipleNum(step);
    const min = Math.round(limit.min * multipleNum);
    const max = Math.round(limit.max * multipleNum);
    const labels = snippet.range(min, max + 1, step * multipleNum);

    return labels.map(label => label / multipleNum);
  },

  /**
   * Calculate step from limit.
   * @memberOf module:calculator
   * @param {{min: number, max: number}} limit axis limit
   * @param {number} count value count
   * @returns {number} step
   */
  calculateStepFromLimit(limit, count) {
    return calculator.divide(calculator.subtract(limit.max, limit.min), count - 1);
  },

  /**
   * Sum plus values.
   * @param {Array.<number>} values values
   * @returns {number} sum
   */
  sumPlusValues(values) {
    const plusValues = snippet.filter(values, value => value > 0);

    return calculator.sum(plusValues);
  },

  /**
   * Sum minus values.
   * @param {Array.<number>} values values
   * @returns {number} sum
   */
  sumMinusValues(values) {
    const minusValues = snippet.filter(values, value => value < 0);

    return calculator.sum(minusValues);
  },

  /**
   * Make percentage value.
   * @param {number} value - value
   * @param {number} totalValue - total value
   * @returns {number}
   */
  makePercentageValue(value, totalValue) {
    return (value / totalValue) * PERCENT_DIVISOR;
  },

  /**
   * Calculate ratio for making bound.
   * @param {number} value - value
   * @param {number} divNumber - number for division
   * @param {number} subNumber - number for subtraction
   * @param {number} baseRatio - base ratio
   * @returns {number}
   */
  calculateRatio(value, divNumber, subNumber, baseRatio) {
    return divNumber ? ((value - subNumber) / divNumber) * baseRatio : 0;
  }
};

/**
 * Get length after decimal point.
 * @memberOf module:calculator
 * @param {string | number} value target value
 * @returns {number} result length
 */
const getDecimalLength = value => {
  const valueArr = String(value).split('.');

  return valueArr.length === 2 ? valueArr[1].length : 0;
};

/**
 * Find multiple num.
 * @memberOf module:calculator
 * @param {...Array} target values
 * @returns {number} multiple num
 */
const findMultipleNum = (...args) => {
  const underPointLens = args.map(value => calculator.getDecimalLength(value));
  const underPointLen = arrayUtil.max(underPointLens);

  return Math.pow(10, underPointLen);
};

/**
 * Modulo operation for floating point operation.
 * @memberOf module:calculator
 * @param {number} target target values
 * @param {number} modNum mod num
 * @returns {number} result mod
 */
const mod = (target, modNum) => {
  const multipleNum = calculator.findMultipleNum(modNum);
  let result;

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
const add = (a, b) => {
  const multipleNum = calculator.findMultipleNum(a, b);

  return (a * multipleNum + b * multipleNum) / multipleNum;
};

/**
 * 'subtract' is function for subtract operation to floating point.
 * @memberOf module:calculator
 * @param {number} a target a
 * @param {number} b target b
 * @returns {number}
 */
const subtract = (a, b) => {
  const multipleNum = calculator.findMultipleNum(a, b);

  return (a * multipleNum - b * multipleNum) / multipleNum;
};

/**
 * 'multiply' is function for multiply operation to floating point.
 * @param {number} a target a
 * @param {number} b target b
 * @returns {number}
 */
const multiply = (a, b) => {
  const multipleNum = calculator.findMultipleNum(a, b);

  return (a * multipleNum * (b * multipleNum)) / (multipleNum * multipleNum);
};

/**
 * 'divide' is function for divide operation to floating point.
 * @memberOf module:calculator
 * @param {number} a target a
 * @param {number} b target b
 * @returns {number}
 */
const divide = (a, b) => {
  const multipleNum = calculator.findMultipleNum(a, b);

  return (a * multipleNum) / (b * multipleNum);
};

/**
 * Sum.
 * @memberOf module:calculator
 * @param {Array.<number>} values target values
 * @returns {number} result value
 */
const sum = values => {
  const copyArr = values.slice();
  copyArr.unshift(0);

  return copyArr.reduce((base, value) => calculator.add(parseFloat(base), parseFloat(value)));
};

/**
 * Obtain the number of divisors.
 * @memberOf module:calculator
 * @param {Array.<number>} value target value
 * @returns {number} result value
 */
const divisors = value => {
  const result = [];
  for (let a = 2, b; a * a <= value; a += 1) {
    if (value % a === 0) {
      b = value / a;
      result.push(a);
      if (b !== a) {
        result.push(b);
      }
    }
  }
  result.sort((prev, next) => prev - next);

  return result;
};

calculator.getDecimalLength = getDecimalLength;
calculator.findMultipleNum = findMultipleNum;
calculator.mod = mod;
calculator.add = add;
calculator.subtract = subtract;
calculator.multiply = multiply;
calculator.divide = divide;
calculator.divisors = divisors;
calculator.sum = sum;

export default calculator;
