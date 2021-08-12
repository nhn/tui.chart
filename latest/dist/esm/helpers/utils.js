export function isExist(value) {
    return !isUndefined(value) && !isNull(value);
}
export function isDate(value) {
    return value instanceof Date;
}
export function isUndefined(value) {
    return typeof value === 'undefined';
}
export function isNull(value) {
    return value === null;
}
export function isBoolean(value) {
    return typeof value === 'boolean';
}
export function isNumber(value) {
    return typeof value === 'number';
}
export function isString(value) {
    return typeof value === 'string';
}
export function isInteger(value) {
    return isNumber(value) && isFinite(value) && Math.floor(value) === value;
}
export function isObject(obj) {
    return typeof obj === 'object' && obj !== null;
}
export function isFunction(value) {
    return typeof value === 'function';
}
export function forEach(obj, cb) {
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            cb(obj[key], key);
        }
    }
}
export function forEachArray(arr, iteratee, context = null) {
    for (let index = 0, len = arr.length; index < len; index += 1) {
        if (iteratee.call(context, arr[index], index, arr) === false) {
            break;
        }
    }
}
export function range(start, stop, step) {
    if (isUndefined(stop)) {
        stop = start || 0;
        start = 0;
    }
    step = step || 1;
    const arr = [];
    if (stop) {
        const flag = step < 0 ? -1 : 1;
        stop *= flag;
        for (; start * flag < stop; start += step) {
            arr.push(start);
        }
    }
    return arr;
}
export function toArray(arrayLike) {
    let arr = [];
    try {
        arr = Array.prototype.slice.call(arrayLike);
    }
    catch (e) {
        forEachArray(arrayLike, function (value) {
            arr.push(value);
        });
    }
    return arr;
}
export function includes(arr, searchItem, searchIndex) {
    if (typeof searchIndex === 'number' && arr[searchIndex] !== searchItem) {
        return false;
    }
    for (const item of arr) {
        if (item === searchItem) {
            return true;
        }
    }
    return false;
}
export function pick(obj, ...propNames) {
    const resultMap = {};
    Object.keys(obj).forEach((key) => {
        if (includes(propNames, key)) {
            resultMap[key] = obj[key];
        }
    });
    return resultMap;
}
export function omit(obj, ...propNames) {
    const resultMap = {};
    Object.keys(obj).forEach((key) => {
        if (!includes(propNames, key)) {
            resultMap[key] = obj[key];
        }
    });
    return resultMap;
}
export function pickProperty(target, keys) {
    const { length } = keys;
    if (length) {
        for (let i = 0; i < length; i += 1) {
            if (isUndefined(target) || isNull(target)) {
                return null;
            }
            target = target[keys[i]];
        }
    }
    return target;
}
export function pickPropertyWithMakeup(target, args) {
    const { length } = args;
    if (length) {
        for (let i = 0; i < length; i += 1) {
            if (isUndefined(target[args[i]])) {
                target[args[i]] = {};
            }
            target = target[args[i]];
        }
    }
    return target;
}
export function debounce(fn, delay = 0) {
    let timer;
    function debounced(...args) {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
            fn(...args);
        }, delay);
    }
    return debounced;
}
export function merge(target, ...args) {
    target = target || {};
    args.forEach((obj) => {
        if (!obj) {
            return;
        }
        forEach(obj, (item, key) => {
            if (Object.prototype.toString.call(item) === '[object Object]') {
                target[key] = merge(target[key], item);
            }
            else {
                target[key] = item;
            }
        });
    });
    return target;
}
export function throttle(fn, interval = 0) {
    let base = null;
    let isLeading = true;
    const tick = function (...args) {
        fn(...args);
        base = null;
    };
    let stamp = 0;
    const debounced = debounce(tick, interval);
    function throttled(...args) {
        if (isLeading) {
            tick(...args);
            isLeading = false;
            return;
        }
        stamp = Number(new Date());
        base = base || stamp;
        debounced(args);
        if (stamp - base >= interval) {
            tick(args);
        }
    }
    function reset() {
        // eslint-disable-line require-jsdoc
        isLeading = true;
        base = null;
    }
    throttled.reset = reset;
    return throttled;
}
export function deepMergedCopy(targetObj, obj) {
    const resultObj = Object.assign({}, targetObj);
    Object.keys(obj).forEach((prop) => {
        if (isObject(resultObj[prop])) {
            if (Array.isArray(obj[prop])) {
                resultObj[prop] = deepCopyArray(obj[prop]);
            }
            else if (resultObj.hasOwnProperty(prop)) {
                resultObj[prop] = deepMergedCopy(resultObj[prop], obj[prop]);
            }
            else {
                resultObj[prop] = deepCopy(obj[prop]);
            }
        }
        else {
            resultObj[prop] = obj[prop];
        }
    });
    return resultObj;
}
export function deepCopyArray(items) {
    return items.map((item) => {
        if (isObject(item)) {
            return Array.isArray(item) ? deepCopyArray(item) : deepCopy(item);
        }
        return item;
    });
}
export function deepCopy(obj) {
    const resultObj = {};
    const keys = Object.keys(obj);
    if (!keys.length) {
        return obj;
    }
    keys.forEach((prop) => {
        if (isObject(obj[prop])) {
            resultObj[prop] = Array.isArray(obj[prop]) ? deepCopyArray(obj[prop]) : deepCopy(obj[prop]);
        }
        else {
            resultObj[prop] = obj[prop];
        }
    });
    return resultObj;
}
export function sortCategories(x, y) {
    return isInteger(x) ? Number(x) - Number(y) : new Date(x).getTime() - new Date(y).getTime();
}
export function sortNumber(x, y) {
    return x - y;
}
export function first(items) {
    // eslint-disable-next-line no-undefined
    return items.length ? items[0] : undefined;
}
export function last(items) {
    // eslint-disable-next-line no-undefined
    return items.length ? items[items.length - 1] : undefined;
}
export function hasNegative(values = []) {
    return values.some((value) => Number(value) < 0);
}
export function sum(items) {
    return items.reduce((a, b) => a + b, 0);
}
export function hasPositiveOnly(values) {
    return values.every((value) => Number(value) >= 0);
}
export function hasNegativeOnly(values) {
    return values.every((value) => Number(value) <= 0);
}
export function getFirstValidValue(values) {
    var _a;
    return (_a = values) === null || _a === void 0 ? void 0 : _a.find((value) => value !== null);
}
export function getPercentageValue(text) {
    return Number(text.substr(0, text.length - 1));
}
export function calculateSizeWithPercentString(size, value) {
    return isNumber(value) ? value : Number(((size * getPercentageValue(value)) / 100).toFixed(2));
}
export function getInitialSize(size) {
    return isNumber(size) ? size : 0;
}
export function isAutoValue(value) {
    return value === 'auto';
}
