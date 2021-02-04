import { AxisType } from "../component/axis";
import { getAxisTheme, makeFormattedCategory, getViewAxisLabels, makeRotationData, getRotatableOption, hasAxesLayoutChanged, makeTitleOption, getMaxLabelSize, getLabelXMargin, } from "../helpers/axes";
import { getAxisLabelAnchorPoint } from "../helpers/calculator";
import { getTitleFontString } from "../helpers/style";
function getHeatmapAxisData(stateProp, axisType) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    const { categories, axisSize, options, theme } = stateProp;
    const isLabelAxis = axisType === AxisType.X;
    const axisName = isLabelAxis ? 'x' : 'y';
    const formatter = (_c = (_b = (_a = options[axisType]) === null || _a === void 0 ? void 0 : _a.label) === null || _b === void 0 ? void 0 : _b.formatter, (_c !== null && _c !== void 0 ? _c : ((value) => value)));
    const labelsBeforeFormatting = makeFormattedCategory(categories[axisName], (_d = options[axisType]) === null || _d === void 0 ? void 0 : _d.date);
    const labels = labelsBeforeFormatting.map((label, index) => formatter(label, { index, labels: labelsBeforeFormatting, axisName: axisType }));
    const tickIntervalCount = labels.length;
    const tickDistance = tickIntervalCount ? axisSize / tickIntervalCount : axisSize;
    const labelDistance = axisSize / tickIntervalCount;
    const pointOnColumn = true;
    const tickCount = tickIntervalCount + 1;
    const tickInterval = (_g = (_f = (_e = options[axisType]) === null || _e === void 0 ? void 0 : _e.tick) === null || _f === void 0 ? void 0 : _f.interval, (_g !== null && _g !== void 0 ? _g : 1));
    const labelInterval = (_k = (_j = (_h = options[axisType]) === null || _h === void 0 ? void 0 : _h.label) === null || _j === void 0 ? void 0 : _j.interval, (_k !== null && _k !== void 0 ? _k : 1));
    const viewLabels = getViewAxisLabels({
        labels,
        pointOnColumn,
        tickDistance,
        tickCount,
        tickInterval,
        labelInterval,
    }, axisSize);
    const labelXMargin = getLabelXMargin(axisType, options);
    const { maxLabelWidth, maxLabelHeight } = getMaxLabelSize(labels, labelXMargin, getTitleFontString(theme.label));
    const axisData = {
        labels,
        viewLabels,
        pointOnColumn,
        isLabelAxis,
        tickCount,
        tickDistance,
        labelDistance,
        tickInterval,
        labelInterval,
        title: makeTitleOption((_l = options.xAxis) === null || _l === void 0 ? void 0 : _l.title),
        maxLabelWidth,
        maxLabelHeight,
    };
    if (axisType === AxisType.X) {
        const labelMargin = (_p = (_o = (_m = options.xAxis) === null || _m === void 0 ? void 0 : _m.label) === null || _o === void 0 ? void 0 : _o.margin, (_p !== null && _p !== void 0 ? _p : 0));
        const offsetY = getAxisLabelAnchorPoint(maxLabelHeight) + labelMargin;
        const distance = axisSize / viewLabels.length;
        const rotationData = makeRotationData(maxLabelWidth, maxLabelHeight, distance, getRotatableOption(options));
        const { needRotateLabel, rotationHeight } = rotationData;
        const maxHeight = (needRotateLabel ? rotationHeight : maxLabelHeight) + offsetY;
        return Object.assign(Object.assign(Object.assign({}, axisData), rotationData), { maxHeight,
            offsetY });
    }
    return axisData;
}
const axes = {
    name: 'axes',
    state: () => {
        return {
            axes: {
                xAxis: {},
                yAxis: {},
            },
        };
    },
    action: {
        setAxesData({ state }) {
            const { layout, theme } = state;
            const { width, height } = layout.plot;
            const categories = state.categories;
            const options = state.options;
            const xAxisData = getHeatmapAxisData({ axisSize: width, categories, options, theme: getAxisTheme(theme, AxisType.X) }, AxisType.X);
            const yAxisData = getHeatmapAxisData({ axisSize: height, categories, options, theme: getAxisTheme(theme, AxisType.X) }, AxisType.Y);
            const axesState = { xAxis: xAxisData, yAxis: yAxisData };
            if (hasAxesLayoutChanged(state.axes, axesState)) {
                this.notify(state, 'layout');
            }
            state.axes = axesState;
        },
    },
    computed: {},
    observe: {
        updateAxes() {
            this.dispatch('setAxesData');
        },
    },
};
export default axes;
