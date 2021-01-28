import { getPercentageValue, isString, isNull } from "./utils";
const semiCircleCenterYRatio = {
    COUNTER_CLOCKWISE: 0.1,
    CLOCKWISE: 1,
};
const MINIMUM_RADIUS = 10;
export function hasClockwiseSemiCircle(clockwise, startAngle, endAngle) {
    return (clockwise && ((startAngle >= -90 && endAngle <= 90) || (startAngle >= 90 && endAngle <= 180)));
}
export function hasCounterClockwiseSemiCircle(clockwise, startAngle, endAngle) {
    return (!clockwise && ((startAngle >= -180 && endAngle <= 90) || (startAngle <= 90 && endAngle >= -90)));
}
export function getRadius(defaultRadius, radius) {
    return isString(radius)
        ? Number(((defaultRadius * getPercentageValue(radius)) / 100).toFixed(2))
        : radius;
}
export function getTotalAngle(clockwise, startAngle, endAngle) {
    const totalAngle = Math.abs(endAngle - startAngle);
    return totalAngle !== 360 && !clockwise ? 360 - totalAngle : totalAngle;
}
export function isSemiCircle(clockwise, startAngle, endAngle) {
    return (getTotalAngle(clockwise, startAngle, endAngle) <= 180 &&
        (hasClockwiseSemiCircle(clockwise, startAngle, endAngle) ||
            hasCounterClockwiseSemiCircle(clockwise, startAngle, endAngle)));
}
export function getDefaultRadius({ width, height }, isSemiCircular = false, maxDataLabelWidth = 0, maxDataLabelHeight = 0) {
    let result;
    if (isSemiCircular) {
        result = Math.min(width / 2, height) - maxDataLabelHeight;
    }
    else if (width > height) {
        result = height / 2 - maxDataLabelHeight;
    }
    else {
        result = width / 2 - maxDataLabelWidth;
    }
    return Math.max(result, MINIMUM_RADIUS);
}
export function getSemiCircleCenterY(rectHeight, clockwise) {
    return clockwise
        ? rectHeight * semiCircleCenterYRatio.CLOCKWISE
        : rectHeight * semiCircleCenterYRatio.COUNTER_CLOCKWISE;
}
export function makePieTooltipData(seriesRawData, category = '') {
    return seriesRawData
        .filter(({ data }) => !isNull(data))
        .map(({ data, name, color, rootParentName }) => ({
        label: name,
        color: color,
        value: data,
        category,
        rootParentName,
        templateType: 'pie',
    }));
}
export function hasNestedPieSeries(series) {
    return !!(series.pie && Array.isArray(series.pie[0].data));
}
export function getNestedPieChartAliasNames(series) {
    return series.pie.map(({ name }) => name);
}
export function pieTooltipLabelFormatter(percentValue) {
    const percentageString = percentValue.toFixed(2);
    const percent = parseFloat(percentageString);
    const needSlice = percentageString.length > 5;
    return `${needSlice ? parseFloat(percentageString.substr(0, 4)) : String(percent)}%`;
}
export function hasOuterDataLabel(options, series) {
    var _a, _b, _c;
    return !!series.pie && ((_c = (_b = (_a = options) === null || _a === void 0 ? void 0 : _a.series) === null || _b === void 0 ? void 0 : _b.dataLabels) === null || _c === void 0 ? void 0 : _c.anchor) === 'outer';
}
export function hasOuterPieSeriesName(options, series) {
    var _a, _b, _c, _d;
    return (!!series.pie &&
        ((_d = (_c = (_b = (_a = options) === null || _a === void 0 ? void 0 : _a.series) === null || _b === void 0 ? void 0 : _b.dataLabels) === null || _c === void 0 ? void 0 : _c.pieSeriesName) === null || _d === void 0 ? void 0 : _d.anchor) === 'outer');
}
