import { getInitAxisIntervalData, getMaxLabelSize, isLabelAxisOnYAxis, makeTitleOption, getDefaultRadialAxisData, } from "../helpers/axes";
import { makeLabelsFromLimit, getFontHeight } from "../helpers/calculator";
import { getTitleFontString } from "../helpers/style";
import { DEGREE_360, DEGREE_0 } from "../helpers/sector";
import { isObject, calculateSizeWithPercentString } from "../helpers/utils";
import { RadialAxisType } from "./radialAxes";
import { isExistPlotId } from "../helpers/plot";
const DEFAULT_LABEL_PADDING = 15;
const RANGE_BAR_MARGIN = 10;
const CLOCK_HAND_MARGIN = 10;
export const DATA_LABEL_MARGIN = 30;
function makeSolidData(outerRadius, barWidth, solidOptions) {
    const initialSolidOptions = (solidOptions !== null && solidOptions !== void 0 ? solidOptions : false);
    const solidBarWidth = calculateSizeWithPercentString(outerRadius, barWidth);
    const defaultSolidOptions = {
        visible: true,
        radiusRange: {
            inner: outerRadius - solidBarWidth,
            outer: outerRadius,
        },
        barWidth: solidBarWidth,
        clockHand: false,
    };
    if (!initialSolidOptions) {
        return Object.assign(Object.assign({}, defaultSolidOptions), { visible: false });
    }
    return isObject(initialSolidOptions)
        ? Object.assign(Object.assign({}, defaultSolidOptions), initialSolidOptions) : defaultSolidOptions;
}
function getCircularAxisData({ labels, intervalData, circularAxisLabelMargin, circularAxisLabelFont, defaultAxisData, bandWidth, options, solidBarWidth, }) {
    var _a, _b, _c, _d;
    const { maxLabelWidth, maxLabelHeight } = getMaxLabelSize(labels, circularAxisLabelMargin, circularAxisLabelFont);
    const { totalAngle, axisSize, centerX, centerY, startAngle, endAngle, drawingStartAngle, clockwise, } = defaultAxisData;
    const { tickInterval, labelInterval } = intervalData;
    const outerRadius = axisSize - bandWidth - RANGE_BAR_MARGIN;
    const solidBarWidthValue = (solidBarWidth !== null && solidBarWidth !== void 0 ? solidBarWidth : outerRadius * 0.1);
    const solidData = makeSolidData(outerRadius - circularAxisLabelMargin - maxLabelHeight - (circularAxisLabelMargin - 5), solidBarWidthValue, (_b = (_a = options) === null || _a === void 0 ? void 0 : _a.series) === null || _b === void 0 ? void 0 : _b.solid);
    const centralAngle = totalAngle / (labels.length + (totalAngle < DEGREE_360 ? -1 : DEGREE_0));
    const maxClockHandSize = outerRadius -
        circularAxisLabelMargin -
        maxLabelHeight -
        CLOCK_HAND_MARGIN +
        (solidData.visible ? -solidData.barWidth - CLOCK_HAND_MARGIN : 0);
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
            inner: 0,
            outer: outerRadius,
        },
        angle: {
            start: startAngle,
            end: endAngle,
            total: totalAngle,
            central: centralAngle,
            drawingStart: drawingStartAngle,
        },
        band: {
            width: bandWidth,
            margin: RANGE_BAR_MARGIN,
        },
        tickInterval,
        clockwise,
        maxClockHandSize,
        title: makeTitleOption((_d = (_c = options) === null || _c === void 0 ? void 0 : _c.circularAxis) === null || _d === void 0 ? void 0 : _d.title),
        solidData,
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
    return isLabelOnVerticalAxis ? valueLabels : categoryLabels;
}
function getAxisLabelMargin(options) {
    var _a, _b, _c, _d;
    return _d = (_c = (_b = (_a = options) === null || _a === void 0 ? void 0 : _a.circularAxis) === null || _b === void 0 ? void 0 : _b.label) === null || _c === void 0 ? void 0 : _c.margin, (_d !== null && _d !== void 0 ? _d : DEFAULT_LABEL_PADDING);
}
function hasAxesLayoutChanged(previousAxes, currentAxes) {
    var _a, _b, _c, _d;
    const prevMaxWidth = (_b = (_a = previousAxes) === null || _a === void 0 ? void 0 : _a.label) === null || _b === void 0 ? void 0 : _b.maxWidth;
    const prevMaxHeight = (_d = (_c = previousAxes) === null || _c === void 0 ? void 0 : _c.label) === null || _d === void 0 ? void 0 : _d.maxHeight;
    const curMaxWidth = currentAxes.label.maxWidth;
    const curMaxHeight = currentAxes.label.maxHeight;
    return prevMaxHeight !== curMaxHeight || prevMaxWidth !== curMaxWidth;
}
const axes = {
    name: 'gaugeAxes',
    state: () => ({
        radialAxes: {
            circularAxis: {},
        },
    }),
    action: {
        setCircularAxisData({ state }) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
            const { series, layout, scale } = state;
            const categories = state.categories;
            const { plot } = layout;
            const isLabelOnVerticalAxis = isLabelAxisOnYAxis({ series, categories });
            const options = state.options;
            const theme = state.theme;
            const circularAxisLabelFont = getTitleFontString(theme.circularAxis.label);
            const circularAxisLabelMargin = getAxisLabelMargin(options);
            const circularAxisLabels = getAxisLabels(isLabelOnVerticalAxis, options, categories, scale);
            const { maxLabelWidth, maxLabelHeight } = getMaxLabelSize(circularAxisLabels, circularAxisLabelMargin, circularAxisLabelFont);
            const defaultAxisData = getDefaultRadialAxisData(options, plot, maxLabelWidth, maxLabelHeight, isLabelOnVerticalAxis);
            const dataLabelHeight = getFontHeight(getTitleFontString(theme.series.gauge.dataLabels));
            const dataLabelOffsetY = (_d = (_c = (_b = (_a = options) === null || _a === void 0 ? void 0 : _a.series) === null || _b === void 0 ? void 0 : _b.dataLabels) === null || _c === void 0 ? void 0 : _c.offsetY, (_d !== null && _d !== void 0 ? _d : DATA_LABEL_MARGIN));
            if (defaultAxisData.isSemiCircular) {
                defaultAxisData.centerY =
                    defaultAxisData.centerY - (dataLabelOffsetY > 0 ? dataLabelOffsetY + dataLabelHeight : 0);
                const diffHeight = defaultAxisData.centerY - defaultAxisData.axisSize;
                defaultAxisData.axisSize += diffHeight < 0 ? diffHeight : 0;
            }
            const defualtBandWidth = ((_g = (_f = (_e = options) === null || _e === void 0 ? void 0 : _e.plot) === null || _f === void 0 ? void 0 : _f.bands) === null || _g === void 0 ? void 0 : _g.length) ? defaultAxisData.axisSize / 2 - RANGE_BAR_MARGIN
                : 0;
            const bandWidth = (_k = (_j = (_h = theme.plot) === null || _h === void 0 ? void 0 : _h.bands) === null || _j === void 0 ? void 0 : _j.barWidth, (_k !== null && _k !== void 0 ? _k : defualtBandWidth));
            const circularAxisData = getCircularAxisData({
                labels: circularAxisLabels,
                intervalData: getInitAxisIntervalData(true, {
                    axis: options.circularAxis,
                    categories,
                    layout,
                }),
                defaultAxisData,
                circularAxisLabelMargin,
                circularAxisLabelFont,
                bandWidth,
                options,
                solidBarWidth: (_m = (_l = theme.series.gauge) === null || _l === void 0 ? void 0 : _l.solid) === null || _m === void 0 ? void 0 : _m.barWidth,
            });
            if (hasAxesLayoutChanged((_o = state.radialAxes) === null || _o === void 0 ? void 0 : _o.circularAxis, circularAxisData)) {
                this.notify(state, 'layout');
            }
            state.radialAxes = {
                circularAxis: circularAxisData,
            };
        },
        addGaugePlotBand({ state }, { data }) {
            var _a, _b, _c;
            const bands = (_c = (_b = (_a = state.options) === null || _a === void 0 ? void 0 : _a.plot) === null || _b === void 0 ? void 0 : _b.bands, (_c !== null && _c !== void 0 ? _c : []));
            if (!isExistPlotId(bands, data)) {
                this.dispatch('updateOptions', { options: { plot: { bands: [...bands, data] } } });
            }
        },
        removeGaugePlotBand({ state }, { id }) {
            var _a, _b, _c;
            const bands = (_c = (_b = (_a = state.options) === null || _a === void 0 ? void 0 : _a.plot) === null || _b === void 0 ? void 0 : _b.bands, (_c !== null && _c !== void 0 ? _c : [])).filter(({ id: bandId }) => bandId !== id);
            this.dispatch('updateOptions', { options: { plot: { bands } } });
        },
    },
    observe: {
        updateRadialAxes() {
            this.dispatch('setCircularAxisData');
        },
    },
};
export default axes;
