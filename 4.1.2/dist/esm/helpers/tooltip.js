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
export function getScrollPosition() {
    var _a, _b;
    return {
        scrollX: (_a = window.scrollX, (_a !== null && _a !== void 0 ? _a : window.pageXOffset)),
        scrollY: (_b = window.scrollY, (_b !== null && _b !== void 0 ? _b : window.pageYOffset)),
    };
}
