/**
 * @fileoverview util for object
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import snippet from 'tui-code-snippet';

/**
 * Deep copy.
 * @memberOf module:objectUtil
 * @param {object|Array|*} origin - original data
 * @returns {*}
 */
const deepCopy = function(origin) {
  let clone;

  if (snippet.isArray(origin)) {
    clone = [];
    origin.forEach((value, index) => {
      clone[index] = deepCopy(value);
    });
  } else if (snippet.isFunction(origin) || snippet.isDate(origin)) {
    clone = origin;
  } else if (snippet.isObject(origin)) {
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
