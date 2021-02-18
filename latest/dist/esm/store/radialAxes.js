import { getInitAxisIntervalData, getMaxLabelSize } from "../helpers/axes";
import { isSemiCircle, getSemiCircleCenterY, getTotalAngle } from "../helpers/pieSeries";
import { makeLabelsFromLimit, makeTickPixelPositions } from "../helpers/calculator";
import { getTitleFontString } from "../helpers/style";
import { calculateSizeWithPercentString, pick } from "../helpers/utils";
import { getDefaultRadius, initSectorOptions, DEGREE_360, DEGREE_0 } from "../helpers/sector";
const Y_LABEL_PADDING = 5;
export const RADIAL_LABEL_PADDING = 25;
export var RadialAxisType;
(function (RadialAxisType) {
    RadialAxisType["CIRCULAR"] = "circularAxis";
    RadialAxisType["VERTICAL"] = "verticalAxis";
})(RadialAxisType || (RadialAxisType = {}));
function getRadiusInfo(axisSize, count, seriesOptions) {
    var _a, _b, _c, _d, _e, _f;
    const innerRadius = calculateSizeWithPercentString(axisSize, (_c = (_b = (_a = seriesOptions) === null || _a === void 0 ? void 0 : _a.radiusRange) === null || _b === void 0 ? void 0 : _b.inner, (_c !== null && _c !== void 0 ? _c : 0)));
    const outerRadius = calculateSizeWithPercentString(axisSize, (_f = (_e = (_d = seriesOptions) === null || _d === void 0 ? void 0 : _d.radiusRange) === null || _e === void 0 ? void 0 : _e.outer, (_f !== null && _f !== void 0 ? _f : axisSize)));
    return {
        radiusRanges: makeTickPixelPositions(outerRadius - innerRadius, count, innerRadius)
            .splice(innerRadius === 0 ? 1 : 0, count)
            .reverse(),
        innerRadius: innerRadius,
        outerRadius: outerRadius,
    };
}
function getDefaultAxisData(options, plot, maxLabelWidth = 0, maxLabelHeight = 0, isLabelOnVerticalAxis = false) {
    var _a;
    let isSemiCircular = false;
    let centerY = plot.height / 2;
    let totalAngle = DEGREE_360;
    let drawingStartAngle = DEGREE_0;
    let clockwiseOption = true;
    let startAngleOption = DEGREE_0;
    let endAngleOption = DEGREE_360;
    if (isLabelOnVerticalAxis) {
        const { startAngle, endAngle, clockwise } = initSectorOptions((_a = options) === null || _a === void 0 ? void 0 : _a.series);
        isSemiCircular = isSemiCircle(clockwise, startAngle, endAngle);
        centerY = isSemiCircular ? getSemiCircleCenterY(plot.height, clockwise) : plot.height / 2;
        totalAngle = getTotalAngle(clockwise, startAngle, endAngle);
        drawingStartAngle = startAngle;
        clockwiseOption = clockwise;
        startAngleOption = startAngle;
        endAngleOption = endAngle;
    }
    return {
        axisSize: getDefaultRadius(plot, isSemiCircular, maxLabelWidth, maxLabelHeight),
        centerX: plot.width / 2,
        centerY,
        totalAngle,
        drawingStartAngle: drawingStartAngle,
        clockwise: clockwiseOption,
        startAngle: startAngleOption,
        endAngle: endAngleOption,
    };
}
function getYAxisLabelAlign(clockwise = true, isLabelOnVerticalAxis = false) {
    let align = 'center';
    if (isLabelOnVerticalAxis) {
        align = clockwise ? 'right' : 'left';
    }
    return align;
}
function getVerticalAxisData({ options, labels, pointOnColumn, intervalData, isLabelOnVerticalAxis, verticalAxisLabelMargin, verticalAxisLabelFont, defaultAxisData, }) {
    var _a;
    const { axisSize, clockwise } = defaultAxisData;
    const { radiusRanges, innerRadius, outerRadius } = isLabelOnVerticalAxis
        ? getRadiusInfo(axisSize, labels.length + 1, (_a = options) === null || _a === void 0 ? void 0 : _a.series)
        : {
            radiusRanges: makeTickPixelPositions(axisSize, labels.length),
            innerRadius: 0,
            outerRadius: axisSize,
        };
    const { labelInterval } = intervalData;
    return Object.assign(Object.assign(Object.assign({ labels, tickDistance: (outerRadius - innerRadius) / labels.length }, pick(defaultAxisData, 'axisSize', 'centerX', 'centerY', 'startAngle', 'endAngle')), { pointOnColumn,
        radiusRanges,
        innerRadius,
        outerRadius,
        labelInterval, labelMargin: verticalAxisLabelMargin, labelAlign: getYAxisLabelAlign(clockwise, isLabelOnVerticalAxis) }), getMaxLabelSize(labels, verticalAxisLabelMargin, verticalAxisLabelFont));
}
function getCircularAxisData({ labels, intervalData, circularAxisLabelMargin, circularAxisLabelFont, defaultAxisData, outerRadius, }) {
    const { maxLabelWidth, maxLabelHeight } = getMaxLabelSize(labels, circularAxisLabelMargin, circularAxisLabelFont);
    const { totalAngle } = defaultAxisData;
    const { tickInterval, labelInterval } = intervalData;
    return Object.assign(Object.assign({ labels }, defaultAxisData), { degree: totalAngle / (labels.length + (totalAngle < DEGREE_360 ? -1 : DEGREE_0)), tickInterval,
        labelInterval, labelMargin: circularAxisLabelMargin, maxLabelWidth,
        maxLabelHeight,
        outerRadius });
}
function makeLabels(options, rawLabels, axisName) {
    var _a, _b, _c;
    const formatter = (_c = (_b = (_a = options[axisName]) === null || _a === void 0 ? void 0 : _a.label) === null || _b === void 0 ? void 0 : _b.formatter, (_c !== null && _c !== void 0 ? _c : ((value) => value)));
    return rawLabels.map((label, index) => formatter(label, { index, labels: rawLabels, axisName }));
}
function getAxisLabels(isLabelOnVerticalAxis, options, categories, scale) {
    const valueAxisName = isLabelOnVerticalAxis
        ? RadialAxisType.CIRCULAR
        : RadialAxisType.VERTICAL;
    const { limit, stepSize } = scale[valueAxisName];
    const valueLabels = makeLabels(options, makeLabelsFromLimit(limit, stepSize), valueAxisName);
    const categoryLabels = makeLabels(options, categories, isLabelOnVerticalAxis ? RadialAxisType.VERTICAL : RadialAxisType.CIRCULAR);
    return {
        radialAxisLabels: isLabelOnVerticalAxis ? valueLabels : categoryLabels,
        yAxisLabels: isLabelOnVerticalAxis ? categoryLabels : valueLabels,
    };
}
function getAxisLabelMargin(isLabelOnVerticalAxis, options) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    return {
        verticalAxisLabelMargin: (_d = (_c = (_b = (_a = options) === null || _a === void 0 ? void 0 : _a.verticalAxis) === null || _b === void 0 ? void 0 : _b.label) === null || _c === void 0 ? void 0 : _c.margin, (_d !== null && _d !== void 0 ? _d : (isLabelOnVerticalAxis ? Y_LABEL_PADDING : 0))),
        circularAxisLabelMargin: (_h = (_g = (_f = (_e = options) === null || _e === void 0 ? void 0 : _e.circularAxis) === null || _f === void 0 ? void 0 : _f.label) === null || _g === void 0 ? void 0 : _g.margin, (_h !== null && _h !== void 0 ? _h : RADIAL_LABEL_PADDING)),
    };
}
const axes = {
    name: 'axes',
    state: () => ({
        radialAxes: {},
    }),
    action: {
        setRadialAxesData({ state }) {
            const { series, layout, scale } = state;
            const { plot } = layout;
            const isLabelOnVerticalAxis = !!series.radialBar;
            const options = state.options;
            const theme = state.theme;
            const categories = state.categories;
            const circularAxisLabelFont = getTitleFontString(theme.circularAxis.label);
            const verticalAxisLabelFont = getTitleFontString(theme.verticalAxis.label);
            const { verticalAxisLabelMargin, circularAxisLabelMargin } = getAxisLabelMargin(isLabelOnVerticalAxis, options);
            const { radialAxisLabels, yAxisLabels } = getAxisLabels(isLabelOnVerticalAxis, options, categories, scale);
            const { maxLabelWidth, maxLabelHeight } = getMaxLabelSize(radialAxisLabels, circularAxisLabelMargin, circularAxisLabelFont);
            const defaultAxisData = getDefaultAxisData(options, plot, maxLabelWidth, maxLabelHeight + circularAxisLabelMargin, isLabelOnVerticalAxis);
            const verticalAxisData = getVerticalAxisData({
                options,
                labels: yAxisLabels,
                pointOnColumn: isLabelOnVerticalAxis,
                isLabelOnVerticalAxis,
                intervalData: getInitAxisIntervalData(isLabelOnVerticalAxis, {
                    axis: options.verticalAxis,
                    categories,
                    layout,
                }),
                verticalAxisLabelMargin,
                verticalAxisLabelFont,
                defaultAxisData,
            });
            state.radialAxes = {
                circularAxis: getCircularAxisData({
                    labels: radialAxisLabels,
                    intervalData: getInitAxisIntervalData(true, {
                        axis: options.circularAxis,
                        categories,
                        layout,
                    }),
                    defaultAxisData,
                    circularAxisLabelMargin,
                    circularAxisLabelFont,
                    outerRadius: verticalAxisData.outerRadius,
                }),
                verticalAxis: verticalAxisData,
            };
        },
    },
    observe: {
        updateRadialAxes() {
            this.dispatch('setRadialAxesData');
        },
    },
};
export default axes;
