/**
 * ne.util에 range가 추가되기 전까지 임시로 사용
 * @param {number} start
 * @param {number} stop
 * @param {number} step
 * @returns {array}
 */
var range = function(start, stop, step) {
    var arr = [],
        flag;

    if (ne.util.isUndefined(stop)) {
        stop = start || 0;
        start = 0;
    }

    step = step || 1;
    flag = step < 0 ? -1 : 1;
    stop *= flag;

    while(start * flag < stop) {
        arr.push(start);
        start += step;
    }

    return arr;
};

/**
 * * ne.util에 pluck이 추가되기 전까지 임시로 사용
 * @param {array} arr
 * @param {string} property
 * @returns {Array}
 */
var pluck = function(arr, property) {
    var result = ne.util.map(arr, function(item) {
        return item[property];
    });
    return result;
};

/**
 * * ne.util에 zip이 추가되기 전까지 임시로 사용
 * @params {...array}
 * @returns {array}
 */
var zip = function() {
    var arr2 = Array.prototype.slice.call(arguments),
        result = [];

    ne.util.forEach(arr2, function(arr) {
        ne.util.forEach(arr, function(value, index) {
            if (!result[index]) {
                result[index] = [];
            }
            result[index].push(value);
        });
    });

    return result;
};

/**
 * Pick min number from number array.
 * @param {array} arr number array
 * @returns {number}
 */
var min = function(arr) {
    var result = arr[0];
    ne.util.forEachArray(arr.slice(1), function(value) {
        if (value < result) {
            result = value;
        }
    });
    return result;
};

/**
 * Pick max number from number array.
 * @param {array} arr number array
 * @returns {number}
 */
var max = function(arr) {
    var result = arr[0];
    ne.util.forEachArray(arr.slice(1), function(value) {
        if (value > result) {
            result = value;
        }
    });
    return result;
};

/**
 * Find index from array.
 * @param {array} arr
 * @param {string|number|object|array} value
 * @returns {number}
 */
var indexOf = function(arr, value) {
    var findIndex;

    if (arr.indexOf) {
        findIndex = function(arr, value) {
            return arr.indexOf(value);
        };
    } else {
        findIndex = function(arr, value) {
            var result = -1;
            ne.util.forEachArray(arr, function(_value, index) {
                if (_value === value) {
                    result = index;
                    return;
                }
            });
            return result;
        }
    }

    indexOf = findIndex;
    return findIndex(arr, value);
};

ne.util.range = range;
ne.util.pluck = pluck;
ne.util.zip = zip;
ne.util.min = min;
ne.util.max = max;
ne.util.indexOf = indexOf;