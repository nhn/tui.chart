/**
 * @fileoverview util for object
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import isArray from 'tui-code-snippet/type/isArray';
import isDate from 'tui-code-snippet/type/isDate';
import isFunction from 'tui-code-snippet/type/isFunction';
import isObject from 'tui-code-snippet/type/isObject';

/**
 * Deep copy.
 * @memberOf module:objectUtil
 * @param {object|Array|*} origin - original data
 * @returns {*}
 */
const deepCopy = function(origin) {
  let clone;

  if (isArray(origin)) {
    clone = [];
    origin.forEach((value, index) => {
      clone[index] = deepCopy(value);
    });
  } else if (isFunction(origin) || isDate(origin)) {
    clone = origin;
  } else if (isObject(origin)) {
    clone = {};

    Object.entries(origin).forEach(([key, value]) => {
      clone[key] = deepCopy(value);
    });
  } else {
    clone = origin;
  }

  return clone;
};

/**
 * util for object
 * @module objectUtil
 * @private */
export default {
  deepCopy
};
