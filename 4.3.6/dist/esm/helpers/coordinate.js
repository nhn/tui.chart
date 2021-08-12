import { getFirstValidValue, isNumber, isObject, last } from "./utils";
export function getCoordinateYValue(datum) {
    if (isNumber(datum)) {
        return datum;
    }
    return Array.isArray(datum) ? datum[1] : datum.y;
}
export function getCoordinateXValue(datum) {
    return Array.isArray(datum) ? datum[0] : datum.x;
}
export function isValueAfterLastCategory(value, categories) {
    const category = last(categories);
    if (!category) {
        return false;
    }
    return isNumber(value) ? value >= Number(category) : new Date(value) >= new Date(category);
}
export function getCoordinateDataIndex(datum, categories, dataIndex, startIndex) {
    if (isNumber(datum)) {
        return dataIndex - startIndex;
    }
    const value = getCoordinateXValue(datum);
    let index = categories.findIndex((category) => category === String(value));
    if (index === -1 && isValueAfterLastCategory(value, categories)) {
        index = categories.length;
    }
    return index;
}
function isLineCoordinateSeries(series) {
    var _a;
    if (!series.line) {
        return false;
    }
    const firstData = getFirstValidValue((_a = series.line[0]) === null || _a === void 0 ? void 0 : _a.data);
    return firstData && (Array.isArray(firstData) || isObject(firstData));
}
export function isCoordinateSeries(series) {
    return isLineCoordinateSeries(series) || !!series.scatter || !!series.bubble;
}
export function isModelExistingInRect(rect, point) {
    const { height, width } = rect;
    const { x, y } = point;
    return x >= 0 && x <= width && y >= 0 && y <= height;
}
export function isMouseInRect(rect, mousePosition) {
    const { x, y, width, height } = rect;
    return (mousePosition.x >= x &&
        mousePosition.x <= x + width &&
        mousePosition.y >= y &&
        mousePosition.y <= y + height);
}
