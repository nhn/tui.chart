import { AxisType } from "../component/axis";
import { getAxisTheme, getViewAxisLabels, makeRotationData, getRotatableOption, hasAxesLayoutChanged, makeTitleOption, getMaxLabelSize, getLabelXMargin, getLabelsAppliedFormatter, isDateType, } from "../helpers/axes";
import { getAxisLabelAnchorPoint } from "../helpers/calculator";
import { getTitleFontString } from "../helpers/style";
function getHeatmapAxisData(stateProp, axisType) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    const { categories, axisSize, axisLayout, options, theme } = stateProp;
    const isLabelAxis = axisType === AxisType.X;
    const axisName = isLabelAxis ? 'x' : 'y';
    const dateType = isDateType(options, axisType);
    const labels = getLabelsAppliedFormatter(categories[axisName], options, dateType, axisType);
    const tickIntervalCount = labels.length;
    const tickDistance = tickIntervalCount ? axisSize / tickIntervalCount : axisSize;
    const labelDistance = axisSize / tickIntervalCount;
    const pointOnColumn = true;
    const tickCount = tickIntervalCount + 1;
    const tickInterval = (_c = (_b = (_a = options[axisType]) === null || _a === void 0 ? void 0 : _a.tick) === null || _b === void 0 ? void 0 : _b.interval, (_c !== null && _c !== void 0 ? _c : 1));
    const labelInterval = (_f = (_e = (_d = options[axisType]) === null || _d === void 0 ? void 0 : _d.label) === null || _e === void 0 ? void 0 : _e.interval, (_f !== null && _f !== void 0 ? _f : 1));
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
        title: makeTitleOption((_g = options[axisType]) === null || _g === void 0 ? void 0 : _g.title),
        maxLabelWidth,
        maxLabelHeight,
    };
    if (axisType === AxisType.X) {
        const labelMargin = (_k = (_j = (_h = options.xAxis) === null || _h === void 0 ? void 0 : _h.label) === null || _j === void 0 ? void 0 : _j.margin, (_k !== null && _k !== void 0 ? _k : 0));
        const offsetY = getAxisLabelAnchorPoint(maxLabelHeight) + labelMargin;
        const distance = axisSize / viewLabels.length;
        const rotationData = makeRotationData(maxLabelWidth, maxLabelHeight, distance, getRotatableOption(options), axisLayout);
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
            const xAxisData = getHeatmapAxisData({
                axisSize: width,
                categories,
                options,
                theme: getAxisTheme(theme, AxisType.X),
                axisLayout: layout[AxisType.X],
            }, AxisType.X);
            const yAxisData = getHeatmapAxisData({
                axisSize: height,
                categories,
                options,
                theme: getAxisTheme(theme, AxisType.Y),
            }, AxisType.Y);
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
