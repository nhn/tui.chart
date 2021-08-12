import { getPercentageValue, isString, isNull } from "./utils";
import { DEGREE_NEGATIVE_90, DEGREE_90, DEGREE_180, DEGREE_NEGATIVE_180, DEGREE_360, DEGREE_0, } from "./sector";
const semiCircleCenterYRatio = {
    COUNTER_CLOCKWISE: 0.1,
    CLOCKWISE: 1,
};
export function hasClockwiseSemiCircle(clockwise, startAngle, endAngle) {
    return (clockwise &&
        ((startAngle >= DEGREE_NEGATIVE_90 && endAngle <= DEGREE_90) ||
            (startAngle >= DEGREE_90 && endAngle <= DEGREE_180)));
}
export function hasCounterClockwiseSemiCircle(clockwise, startAngle, endAngle) {
    return (!clockwise &&
        ((startAngle >= DEGREE_NEGATIVE_180 && endAngle <= DEGREE_90) ||
            (startAngle <= DEGREE_90 && endAngle >= DEGREE_NEGATIVE_90)));
}
export function getRadius(defaultRadius, radius) {
    return isString(radius)
        ? Number(((defaultRadius * getPercentageValue(radius)) / 100).toFixed(2))
        : radius;
}
export function getTotalAngle(clockwise, startAngle, endAngle) {
    const diffAngle = endAngle - startAngle;
    const absDiff = Math.abs(diffAngle);
    const needSubstractAngle = (diffAngle > DEGREE_0 && absDiff !== DEGREE_360 && !clockwise) ||
        (diffAngle < DEGREE_0 && absDiff !== DEGREE_360 && clockwise);
    return needSubstractAngle ? DEGREE_360 - absDiff : absDiff;
}
export function isSemiCircle(clockwise, startAngle, endAngle) {
    return (getTotalAngle(clockwise, startAngle, endAngle) <= DEGREE_180 &&
        (hasClockwiseSemiCircle(clockwise, startAngle, endAngle) ||
            hasCounterClockwiseSemiCircle(clockwise, startAngle, endAngle)));
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
    var _a;
    return !!(series.pie && Array.isArray((_a = series.pie[0]) === null || _a === void 0 ? void 0 : _a.data));
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
