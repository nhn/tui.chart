import { getFirstValidValue } from "./utils";
export function isRangeValue(value) {
    return Array.isArray(value) && value.length === 2;
}
export function isRangeData(data) {
    return Array.isArray(data) && isRangeValue(getFirstValidValue(data));
}
export function isZooming(categories, zoomRange) {
    return !!(zoomRange && (zoomRange[0] !== 0 || zoomRange[1] !== categories.length - 1));
}
export function getDataInRange(data, range) {
    if (!range) {
        return data;
    }
    return data.slice(range[0], range[1] + 1);
}
