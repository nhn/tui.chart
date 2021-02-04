export function max(arr, condition, context) {
    let result;
    if (!condition) {
        result = Math.max(...arr);
    }
    else {
        [result] = arr;
        const rest = arr.slice(1);
        let maxValue = condition.call(context, result, 0);
        rest.forEach((item, index) => {
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
 * Array pivot.
 * @memberOf module:arrayUtil
 * @param {Array.<Array>} arr2d target 2d array
 * @returns {Array.<Array>} pivoted 2d array
 */
export function pivot(arr2d) {
    const result = [];
    const len = max(arr2d.map((arr) => arr.length));
    arr2d.forEach((arr) => {
        for (let index = 0; index < len; index += 1) {
            if (!result[index]) {
                result[index] = [];
            }
            result[index].push(arr[index]);
        }
    });
    return result;
}
export function isSameArray(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        return false;
    }
    for (let i = 0; i < arr1.length; i += 1) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }
    return true;
}
export function pluck(arr, property) {
    return arr.reduce((acc, cur) => {
        return [...acc, cur[property]];
    }, []);
}
