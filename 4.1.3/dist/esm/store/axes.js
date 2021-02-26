import { getAxisName, getSizeKey, hasBoxTypeSeries, isLabelAxisOnYAxis, isPointOnColumn, getYAxisOption, getAxisTheme, getViewAxisLabels, hasAxesLayoutChanged, getRotatableOption, makeFormattedCategory, getMaxLabelSize, makeTitleOption, makeRotationData, getLabelXMargin, getInitAxisIntervalData, } from "../helpers/axes";
import { makeLabelsFromLimit, getAxisLabelAnchorPoint } from "../helpers/calculator";
import { deepMergedCopy, hasNegativeOnly, isNumber, pickProperty } from "../helpers/utils";
import { isZooming } from "../helpers/range";
import { isCoordinateSeries } from "../helpers/coordinate";
import { AxisType } from "../component/axis";
import { getTitleFontString } from "../helpers/style";
export function isCenterYAxis(options, isBar) {
    var _a;
    const diverging = !!pickProperty(options, ['series', 'diverging']);
    const alignCenter = ((_a = options.yAxis) === null || _a === void 0 ? void 0 : _a.align) === 'center';
    return isBar && diverging && alignCenter;
}
function isDivergingBoxSeries(series, options) {
    var _a;
    return hasBoxTypeSeries(series) && !!((_a = options.series) === null || _a === void 0 ? void 0 : _a.diverging);
}
function getZeroPosition(limit, axisSize, labelAxisOnYAxis, isDivergingSeries) {
    const { min, max } = limit;
    const hasZeroValue = min <= 0 && max >= 0;
    if (!hasZeroValue || isDivergingSeries) {
        return null;
    }
    const position = ((0 - min) / (max - min)) * axisSize;
    return labelAxisOnYAxis ? position : axisSize - position;
}
function getAxisFormatter(options, axisName) {
    var _a, _b, _c;
    const axisOptions = Object.assign(Object.assign({}, getYAxisOption(options)), { xAxis: options.xAxis });
    return _c = (_b = (_a = axisOptions[axisName]) === null || _a === void 0 ? void 0 : _a.label) === null || _b === void 0 ? void 0 : _b.formatter, (_c !== null && _c !== void 0 ? _c : ((value) => value));
}
export function getLabelAxisData(stateProp) {
    var _a, _b;
    const { axisSize, categories, series, options, theme, scale, zoomRange, rawCategories, initialAxisData, isCoordinateTypeChart, axisName, } = stateProp;
    const pointOnColumn = isPointOnColumn(series, options);
    const labelsBeforeFormatting = !isZooming(rawCategories, zoomRange) && isCoordinateTypeChart
        ? makeLabelsFromLimit(scale.limit, scale.stepSize, options)
        : makeFormattedCategory(categories, (_b = (_a = options) === null || _a === void 0 ? void 0 : _a.xAxis) === null || _b === void 0 ? void 0 : _b.date);
    const formatter = getAxisFormatter(options, axisName);
    // @TODO: regenerate label when exceeding max width
    const labels = labelsBeforeFormatting.map((label, index) => formatter(label, { index, labels: labelsBeforeFormatting, axisName }));
    const tickIntervalCount = categories.length - (pointOnColumn ? 0 : 1);
    const tickDistance = tickIntervalCount ? axisSize / tickIntervalCount : axisSize;
    const labelDistance = axisSize / (labels.length - (pointOnColumn ? 0 : 1));
    const tickCount = labels.length + (pointOnColumn ? 1 : 0);
    const viewLabels = getViewAxisLabels(Object.assign({ labels,
        pointOnColumn,
        tickDistance,
        tickCount }, initialAxisData), axisSize);
    const axisLabelMargin = getLabelXMargin(axisName, options);
    return Object.assign(Object.assign({ labels,
        viewLabels,
        pointOnColumn,
        labelDistance,
        tickDistance,
        tickCount, isLabelAxis: true }, initialAxisData), getMaxLabelSize(labels, axisLabelMargin, getTitleFontString(theme.label)));
}
function getValueAxisData(stateProp) {
    var _a;
    const { scale, axisSize, series, options, centerYAxis, initialAxisData, theme, labelOnYAxis, axisName, } = stateProp;
    const { limit, stepSize } = scale;
    const size = centerYAxis ? (_a = centerYAxis) === null || _a === void 0 ? void 0 : _a.xAxisHalfSize : axisSize;
    const divergingBoxSeries = isDivergingBoxSeries(series, options);
    const formatter = getAxisFormatter(options, axisName);
    const zeroPosition = getZeroPosition(limit, axisSize, isLabelAxisOnYAxis(series, options), divergingBoxSeries);
    let valueLabels = makeLabelsFromLimit(limit, stepSize);
    if (!centerYAxis && divergingBoxSeries) {
        valueLabels = getDivergingValues(valueLabels);
    }
    const labels = valueLabels.map((label, index) => formatter(label, { index, labels: valueLabels, axisName }));
    const tickDistance = size / Math.max(valueLabels.length, 1);
    const tickCount = valueLabels.length;
    const pointOnColumn = false;
    const viewLabels = getViewAxisLabels(Object.assign({ labels: labelOnYAxis ? labels : [...labels].reverse(), pointOnColumn,
        tickDistance,
        tickCount }, initialAxisData), size);
    const axisLabelMargin = getLabelXMargin(axisName, options);
    const axisData = Object.assign(Object.assign({ labels,
        viewLabels,
        pointOnColumn, isLabelAxis: false, tickCount,
        tickDistance }, initialAxisData), getMaxLabelSize(labels, axisLabelMargin, getTitleFontString(theme.label)));
    if (isNumber(zeroPosition)) {
        axisData.zeroPosition = zeroPosition;
    }
    return axisData;
}
function getDivergingValues(valueLabels) {
    return hasNegativeOnly(valueLabels)
        ? valueLabels.reverse().slice(1).concat(valueLabels)
        : valueLabels.slice(1).reverse().concat(valueLabels);
}
function makeDefaultAxisData(isLabelAxis, params) {
    var _a, _b;
    const axisData = getInitAxisIntervalData(isLabelAxis, params);
    const title = makeTitleOption((_b = (_a = params) === null || _a === void 0 ? void 0 : _a.axis) === null || _b === void 0 ? void 0 : _b.title);
    if (title) {
        axisData.title = title;
    }
    return axisData;
}
function getInitialAxisData(options, labelOnYAxis, categories, layout, isCoordinateTypeChart) {
    var _a, _b, _c;
    const { yAxis, secondaryYAxis } = getYAxisOption(options);
    const shift = (_b = (_a = options) === null || _a === void 0 ? void 0 : _a.series) === null || _b === void 0 ? void 0 : _b.shift;
    return {
        xAxis: makeDefaultAxisData(!labelOnYAxis, {
            categories,
            axis: (_c = options) === null || _c === void 0 ? void 0 : _c.xAxis,
            layout,
            shift,
            isCoordinateTypeChart,
        }),
        yAxis: makeDefaultAxisData(labelOnYAxis, { axis: yAxis }),
        secondaryYAxis: secondaryYAxis
            ? makeDefaultAxisData(labelOnYAxis, { axis: secondaryYAxis })
            : null,
    };
}
function getSecondaryYAxisData({ state, labelOnYAxis, valueAxisSize, labelAxisSize, initialAxisData, isCoordinateTypeChart, }) {
    var _a, _b;
    const { scale, options, series, zoomRange, theme } = state;
    const categories = state.categories;
    const rawCategories = state.rawCategories;
    return labelOnYAxis
        ? getLabelAxisData({
            scale: scale.secondaryYAxis,
            axisSize: labelAxisSize,
            categories: (_b = (_a = getYAxisOption(options).secondaryYAxis) === null || _a === void 0 ? void 0 : _a.categories, (_b !== null && _b !== void 0 ? _b : categories)),
            rawCategories,
            options,
            series,
            theme: getAxisTheme(theme, AxisType.SECONDARY_Y),
            zoomRange,
            initialAxisData,
            isCoordinateTypeChart,
            axisName: AxisType.SECONDARY_Y,
        })
        : getValueAxisData({
            scale: scale.secondaryYAxis,
            axisSize: valueAxisSize,
            options,
            series,
            theme: getAxisTheme(theme, AxisType.SECONDARY_Y),
            centerYAxis: null,
            initialAxisData,
            axisName: AxisType.SECONDARY_Y,
        });
}
function makeXAxisData({ axisData, axisSize, centerYAxis, rotatable, labelMargin = 0 }) {
    const { viewLabels, pointOnColumn, maxLabelWidth, maxLabelHeight } = axisData;
    const offsetY = getAxisLabelAnchorPoint(maxLabelHeight) + labelMargin;
    const size = centerYAxis ? centerYAxis.xAxisHalfSize : axisSize;
    const distance = size / (viewLabels.length - (pointOnColumn ? 0 : 1));
    const rotationData = makeRotationData(maxLabelWidth, maxLabelHeight, distance, rotatable);
    const { needRotateLabel, rotationHeight } = rotationData;
    const maxHeight = (needRotateLabel ? rotationHeight : maxLabelHeight) + offsetY;
    return Object.assign(Object.assign(Object.assign({}, axisData), rotationData), { maxHeight,
        offsetY });
}
function getAxisInfo(labelOnYAxis, plot, series) {
    const { valueAxisName, labelAxisName } = getAxisName(labelOnYAxis, series);
    const { valueSizeKey, labelSizeKey } = getSizeKey(labelOnYAxis);
    const valueAxisSize = plot[valueSizeKey];
    const labelAxisSize = plot[labelSizeKey];
    return { valueAxisName, valueAxisSize, labelAxisName, labelAxisSize };
}
function getCategoriesWithTypes(categories, rawCategories) {
    var _a, _b;
    return {
        categories: (_a = categories, (_a !== null && _a !== void 0 ? _a : [])),
        rawCategories: (_b = rawCategories, (_b !== null && _b !== void 0 ? _b : [])),
    };
}
const axes = {
    name: 'axes',
    state: ({ series, options }) => {
        const { secondaryYAxis } = getYAxisOption(options);
        const axesState = {
            xAxis: {},
            yAxis: {},
        };
        if (isCenterYAxis(options, !!series.bar)) {
            axesState.centerYAxis = {};
        }
        if (secondaryYAxis) {
            axesState.secondaryYAxis = {};
        }
        return {
            axes: axesState,
        };
    },
    action: {
        setAxesData({ state, initStoreState }) {
            var _a, _b;
            const { scale, options, series, layout, zoomRange, theme } = state;
            const { xAxis, yAxis, plot } = layout;
            const isCoordinateTypeChart = isCoordinateSeries(initStoreState.series);
            const labelOnYAxis = isLabelAxisOnYAxis(series, options);
            const { categories, rawCategories } = getCategoriesWithTypes(state.categories, state.rawCategories);
            const { valueAxisName, valueAxisSize, labelAxisName, labelAxisSize } = getAxisInfo(labelOnYAxis, plot, series);
            const hasCenterYAxis = state.axes.centerYAxis;
            const initialAxisData = getInitialAxisData(options, labelOnYAxis, categories, layout, isCoordinateTypeChart);
            const valueAxisData = getValueAxisData({
                scale: scale[valueAxisName],
                axisSize: valueAxisSize,
                options,
                series,
                theme: getAxisTheme(theme, valueAxisName),
                centerYAxis: hasCenterYAxis
                    ? {
                        xAxisHalfSize: (xAxis.width - yAxis.width) / 2,
                    }
                    : null,
                initialAxisData: initialAxisData[valueAxisName],
                labelOnYAxis,
                axisName: valueAxisName,
            });
            const labelAxisData = getLabelAxisData({
                scale: scale[labelAxisName],
                axisSize: labelAxisSize,
                categories,
                rawCategories,
                options,
                series,
                theme: getAxisTheme(theme, labelAxisName),
                zoomRange,
                initialAxisData: initialAxisData[labelAxisName],
                isCoordinateTypeChart,
                labelOnYAxis,
                axisName: labelAxisName,
            });
            let secondaryYAxis, centerYAxis;
            if (state.axes.secondaryYAxis) {
                secondaryYAxis = getSecondaryYAxisData({
                    state,
                    labelOnYAxis,
                    valueAxisSize,
                    labelAxisSize,
                    labelAxisName,
                    valueAxisName,
                    initialAxisData: initialAxisData.secondaryYAxis,
                    isCoordinateTypeChart,
                });
            }
            if (hasCenterYAxis) {
                const xAxisHalfSize = (xAxis.width - yAxis.width) / 2;
                centerYAxis = deepMergedCopy(valueAxisData, {
                    x: xAxis.x + xAxisHalfSize,
                    xAxisHalfSize,
                    secondStartX: (xAxis.width + yAxis.width) / 2,
                    yAxisLabelAnchorPoint: yAxis.width / 2,
                    yAxisHeight: yAxis.height,
                });
            }
            const axesState = {
                xAxis: makeXAxisData({
                    axisData: labelOnYAxis ? valueAxisData : labelAxisData,
                    axisSize: labelOnYAxis ? valueAxisSize : labelAxisSize,
                    centerYAxis,
                    rotatable: getRotatableOption(options),
                    labelMargin: (_b = (_a = options.xAxis) === null || _a === void 0 ? void 0 : _a.label) === null || _b === void 0 ? void 0 : _b.margin,
                }),
                yAxis: labelOnYAxis ? labelAxisData : valueAxisData,
                secondaryYAxis,
                centerYAxis,
            };
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
