import { includes, isUndefined } from "./utils";
export function getActiveSeriesMap(legend) {
    return legend.data.reduce((acc, { active, label }) => (Object.assign(Object.assign({}, acc), { [label]: active })), {});
}
export function showCircleLegend(options) {
    var _a, _b, _c;
    return _c = (_b = (_a = options) === null || _a === void 0 ? void 0 : _a.circleLegend) === null || _b === void 0 ? void 0 : _b.visible, (_c !== null && _c !== void 0 ? _c : true);
}
export function showLegend(options, series) {
    var _a, _b, _c;
    if (series.gauge ||
        (series.treemap && !((_a = options.series) === null || _a === void 0 ? void 0 : _a.useColorValue))) {
        return false;
    }
    return isUndefined((_b = options.legend) === null || _b === void 0 ? void 0 : _b.visible) ? true : !!((_c = options.legend) === null || _c === void 0 ? void 0 : _c.visible);
}
export function showCheckbox(options) {
    var _a, _b;
    return isUndefined((_a = options.legend) === null || _a === void 0 ? void 0 : _a.showCheckbox) ? true : !!((_b = options.legend) === null || _b === void 0 ? void 0 : _b.showCheckbox);
}
// @TODO: Need to manage with chart type constant/Enum
function useRectIcon(type) {
    return includes(['bar', 'column', 'area', 'pie', 'boxPlot', 'bullet', 'radialBar'], type);
}
function useCircleIcon(type) {
    return includes(['bubble', 'scatter'], type);
}
function useLineIcon(type) {
    return includes(['line', 'radar'], type);
}
export function getIconType(type) {
    let iconType = 'spectrum';
    if (useCircleIcon(type)) {
        iconType = 'circle';
    }
    else if (useRectIcon(type)) {
        iconType = 'rect';
    }
    else if (useLineIcon(type)) {
        iconType = 'line';
    }
    return iconType;
}
export function getLegendAlign(options) {
    var _a, _b;
    return _b = (_a = options.legend) === null || _a === void 0 ? void 0 : _a.align, (_b !== null && _b !== void 0 ? _b : 'right');
}
