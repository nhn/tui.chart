import { getInitAxisIntervalData, getMaxLabelSize, isLabelAxisOnYAxis, getDefaultRadialAxisData, getRadiusInfo, } from "../helpers/axes";
import { makeLabelsFromLimit, makeTickPixelPositions } from "../helpers/calculator";
import { getTitleFontString } from "../helpers/style";
import { DEGREE_360, DEGREE_0 } from "../helpers/sector";
const Y_LABEL_PADDING = 5;
export const RADIAL_LABEL_PADDING = 25;
export var RadialAxisType;
(function (RadialAxisType) {
    RadialAxisType["CIRCULAR"] = "circularAxis";
    RadialAxisType["VERTICAL"] = "verticalAxis";
})(RadialAxisType || (RadialAxisType = {}));
function getYAxisLabelAlign(clockwise = true, isLabelOnVerticalAxis = false) {
    let align = 'center';
    if (isLabelOnVerticalAxis) {
        align = clockwise ? 'right' : 'left';
    }
    return align;
}
function getVerticalAxisData({ labels, pointOnColumn, intervalData, isLabelOnVerticalAxis, verticalAxisLabelMargin, verticalAxisLabelFont, defaultAxisData, radiusData, }) {
    const { clockwise, axisSize, centerX, centerY, startAngle, endAngle } = defaultAxisData;
    const { radiusRanges, innerRadius, outerRadius } = radiusData;
    const { labelInterval } = intervalData;
    /*
    return {
      labels,
      tickDistance: (outerRadius - innerRadius) / labels.length,
      ...pick(defaultAxisData, 'axisSize', 'centerX', 'centerY', 'startAngle', 'endAngle'),
      pointOnColumn,
      radiusRanges,
      innerRadius,
      outerRadius,
      labelInterval,
      labelMargin: verticalAxisLabelMargin,
      labelAlign: getYAxisLabelAlign(clockwise, isLabelOnVerticalAxis),
      ...getMaxLabelSize(labels, verticalAxisLabelMargin, verticalAxisLabelFont),
    };
    */
    const { maxLabelWidth, maxLabelHeight } = getMaxLabelSize(labels, verticalAxisLabelMargin, verticalAxisLabelFont);
    return {
        axisSize,
        centerX,
        centerY,
        label: {
            labels,
            interval: labelInterval,
            margin: verticalAxisLabelMargin,
            maxWidth: maxLabelWidth,
            maxHeight: maxLabelHeight,
            align: getYAxisLabelAlign(clockwise, isLabelOnVerticalAxis),
        },
        radius: {
            inner: innerRadius,
            outer: outerRadius,
            ranges: radiusRanges,
        },
        angle: {
            start: startAngle,
            end: endAngle,
        },
        tickDistance: (outerRadius - innerRadius) / labels.length,
        pointOnColumn,
    };
}
function getCircularAxisData({ labels, intervalData, circularAxisLabelMargin, circularAxisLabelFont, defaultAxisData, radiusData, }) {
    const { maxLabelWidth, maxLabelHeight } = getMaxLabelSize(labels, circularAxisLabelMargin, circularAxisLabelFont);
    const { totalAngle, clockwise, axisSize, centerX, centerY, startAngle, endAngle, drawingStartAngle, } = defaultAxisData;
    const { tickInterval, labelInterval } = intervalData;
    const { innerRadius, outerRadius } = radiusData;
    const centralAngle = totalAngle / (labels.length + (totalAngle < DEGREE_360 ? -1 : DEGREE_0));
    /*
    return {
      labels,
      ...defaultAxisData,
      centralAngle,
      tickInterval,
      labelInterval,
      labelMargin: circularAxisLabelMargin,
      maxLabelWidth,
      maxLabelHeight,
      innerRadius,
      outerRadius,
    };
    */
    return {
        axisSize,
        centerX,
        centerY,
        label: {
            labels,
            interval: labelInterval,
            margin: circularAxisLabelMargin,
            maxWidth: maxLabelWidth,
            maxHeight: maxLabelHeight,
        },
        radius: {
            inner: innerRadius,
            outer: outerRadius,
        },
        angle: {
            start: startAngle,
            end: endAngle,
            total: totalAngle,
            central: centralAngle,
            drawingStart: drawingStartAngle,
        },
        tickInterval,
        clockwise,
    };
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
    name: 'radialAxes',
    state: () => ({
        radialAxes: {},
    }),
    action: {
        setRadialAxesData({ state }) {
            var _a, _b;
            const { series, layout, scale } = state;
            const categories = state.categories;
            const { plot } = layout;
            const isLabelOnVerticalAxis = isLabelAxisOnYAxis({ series, categories });
            const options = state.options;
            const theme = state.theme;
            const circularAxisLabelFont = getTitleFontString(theme.circularAxis.label);
            const verticalAxisLabelFont = getTitleFontString(theme.verticalAxis.label);
            const { verticalAxisLabelMargin, circularAxisLabelMargin } = getAxisLabelMargin(isLabelOnVerticalAxis, options);
            const { radialAxisLabels, yAxisLabels } = getAxisLabels(isLabelOnVerticalAxis, options, categories, scale);
            const { maxLabelWidth, maxLabelHeight } = getMaxLabelSize(radialAxisLabels, circularAxisLabelMargin, circularAxisLabelFont);
            const defaultAxisData = getDefaultRadialAxisData(options, plot, maxLabelWidth, maxLabelHeight + circularAxisLabelMargin, isLabelOnVerticalAxis);
            const { axisSize } = defaultAxisData;
            const radiusData = isLabelOnVerticalAxis
                ? getRadiusInfo(axisSize, (_b = (_a = options) === null || _a === void 0 ? void 0 : _a.series) === null || _b === void 0 ? void 0 : _b.radiusRange, yAxisLabels.length + 1)
                : {
                    radiusRanges: makeTickPixelPositions(axisSize, yAxisLabels.length),
                    innerRadius: 0,
                    outerRadius: axisSize,
                };
            const verticalAxisData = getVerticalAxisData({
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
                radiusData,
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
                    radiusData,
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
