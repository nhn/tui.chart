/*!
 * time-stamp <https://github.com/jonschlinkert/time-stamp>
 *
 * Copyright (c) 2015-2018, Jon Schlinkert.
 * Released under the MIT License.
 */

'use strict';

/**
 * Parse the given pattern and return a formatted
 * timestamp.
 *
 * @param  {String} `pattern` Date pattern.
 * @param  {Date} `date` Date object.
 * @param  {Bool} `useUTC` Whether or not to use UTC (local timezone is used otherwise)
 * @return {String}
 */

function _getTimestamp(pattern, date, useUTC) {
  if (typeof pattern !== 'string') {
    date = pattern;
    pattern = 'YYYY-MM-DD';
  }

  if (!date) date = new Date();

  function timestamp() {
    var regex = /(?=(YYYY|YY|MM|DD|HH|mm|ss|ms))\1([:\/]*)/;
    var match = regex.exec(pattern);

    if (match) {
      var increment = method(match[1], useUTC);
      var val = '00' + String(date[increment[0]]() + (increment[2] || 0));
      var res = val.slice(-increment[1]) + (match[2] || '');
      pattern = pattern.replace(match[0], res);
      timestamp();
    }
  }

  timestamp(pattern);
  return pattern;
};

function method(key, useUTC) {
  return ({
    YYYY: [useUTC ? 'getUTCFullYear' : 'getFullYear', 4],
    YY: [useUTC ? 'getUTCFullYear' : 'getFullYear', 2],
    // getMonth is zero-based, thus the extra increment field
    MM: [useUTC ? 'getUTCMonth' : 'getMonth', 2, 1],
    DD: [useUTC ? 'getUTCDate' : 'getDate', 2],
    HH: [useUTC ? 'getUTCHours' : 'getHours', 2],
    mm: [useUTC ? 'getUTCMinutes' : 'getMinutes', 2],
    ss: [useUTC ? 'getUTCSeconds' : 'getSeconds', 2],
    ms: [useUTC ? 'getUTCMilliseconds' : 'getMilliseconds', 3]
  })[key];
}

module.exports = function(pattern, date) {
  return _getTimestamp(pattern, date, false);
};

module.exports.utc = function(pattern, date) {
  return _getTimestamp(pattern, date, true);
};
