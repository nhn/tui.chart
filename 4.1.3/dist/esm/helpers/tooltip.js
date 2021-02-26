import { isObject } from "./utils";
import { isRangeValue } from "./range";
function isBubblePointType(value) {
    return value.hasOwnProperty('r');
}
export function getValueString(value) {
    let result = '';
    if (isRangeValue(value)) {
        result = `${value[0]} ~ ${value[1]}`;
    }
    else if (isObject(value) && !Array.isArray(value)) {
        result = `(${value.x}, ${value.y})` + (isBubblePointType(value) ? `, r: ${value.r}` : '');
    }
    else {
        result = String(value);
    }
    return result;
}
