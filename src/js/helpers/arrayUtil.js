/**
 * @fileoverview Util for array.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import snippet from 'tui-code-snippet';

/**
 * Pick minimum value from value array.
 * @memberOf module:arrayUtil
 * @param {Array} arr value array
 * @param {?function} condition condition function
 * @param {?object} context target context
 * @returns {*} minimum value
 */
function min(arr, condition, context) {
  let result;

  if (!condition) {
    result = Math.min(...arr);
  } else {
    [result] = arr;
    const rest = arr.slice(1);
    let minValue = condition.call(context, result, 0);

    rest.forEach((item, index) => {
      const compareValue = condition.call(context, item, index + 1);
      if (compareValue < minValue) {
        minValue = compareValue;
        result = item;
      }
    });
  }

  return result;
}

/**
 * Pick maximum value from value array.
 * @memberOf module:arrayUtil
 * @param {Array} arr value array
 * @param {?function} [condition] condition function
 * @param {?object} [context] target context
 * @returns {*} maximum value
 */
function max(arr, condition, context) {
  let result;

  if (!condition) {
    result = Math.max(...arr);
  } else {
    [result] = arr;
    const rest = arr.slice(1);
    let maxValue = condition.call(context, result, 0);
    snippet.forEachArray(rest, (item, index) => {
      const compareValue = condition.call(context, item, index + 1);
      if (compareValue > maxValue) {
        maxValue = compareValue;
        result = item;
      }
    });
  }

  return result;
}

/**
 * Whether one of them is true or not.
 * @memberOf module:arrayUtil
 * @param {Array} collection target collection
 * @param {function} condition condition function
 * @param {?object} context target context
 * @returns {boolean} result boolean
 */
function any(collection, condition, context) {
  let result = false;
  snippet.forEach(collection, (item, key) => {
    if (condition.call(context, item, key, collection)) {
      result = true;
    }

    return !result;
  });

  return result;
}

/**
 * All of them is true or not.
 * @memberOf module:arrayUtil
 * @param {Array} collection target collection
 * @param {function} condition condition function
 * @param {?object} context target context
 * @returns {boolean} result boolean
 */
function all(collection, condition, context) {
  let result = !!(collection || []).length;
  snippet.forEach(collection, (item, key) => {
    if (!condition.call(context, item, key, collection)) {
      result = false;
    }

    return result !== false;
  });

  return result;
}

/**
 * Make unique values.
 * @memberOf module:arrayUtil
 * @param {Array} arr target array
 * @param {?boolean} sorted whether sorted or not.
 * @param {?function} iteratee iteratee function
 * @param {?object} context target context
 * @returns {Array} unique values
 */
function unique(arr, sorted, iteratee, context) {
  const result = [];

  if (!snippet.isBoolean(sorted)) {
    context = iteratee;
    iteratee = sorted;
    sorted = false;
  }

  iteratee =
    iteratee ||
    function(value) {
      return value;
    };

  if (sorted) {
    let prevValue;
    snippet.forEachArray(arr, (value, index) => {
      value = iteratee.call(context, value, index, arr);
      if (!index || prevValue !== value) {
        result.push(value);
      }
      prevValue = value;
    });
  } else {
    snippet.forEachArray(arr, (value, index) => {
      value = iteratee.call(context, value, index, arr);
      if (snippet.inArray(value, result) === -1) {
        result.push(value);
      }
    });
  }

  return result;
}

/**
 * Array pivot.
 * @memberOf module:arrayUtil
 * @param {Array.<Array>} arr2d target 2d array
 * @returns {Array.<Array>} pivoted 2d array
 */
function pivot(arr2d) {
  const result = [];
  const len = max(arr2d.map(arr => arr.length));

  arr2d.forEach(arr => {
    for (let index = 0; index < len; index += 1) {
      if (!result[index]) {
        result[index] = [];
      }
      result[index].push(arr[index]);
    }
  });

  return result;
}

/**
 * find index from date type array
 * @memberOf module:arrayUtil
 * @param {Array} dateArray date type value array
 * @param {Date} date target date
 * @returns {number} index
 */
function findIndexFromDateTypeArray(dateArray, date) {
  const dateValue = Number(date);
  let foundIndex = -1;

  for (const [idx, value] of dateArray.entries()) {
    if (Number(value) === dateValue) {
      foundIndex = idx;
      break;
    }
  }

  return foundIndex;
}

export default {
  min,
  max,
  any,
  all,
  unique,
  pivot,
  findIndexFromDateTypeArray
};
