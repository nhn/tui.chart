import { getAxisName, getSizeKey, isLabelAxisOnYAxis, getYAxisOption, getValueAxisNames, isSeriesUsingRadialAxes, } from "../helpers/axes";
import { calculateCoordinateScale, calculateScaleForCoordinateLineType, getStackScaleData, } from "../scale/coordinateScaleCalculator";
import { calculateDatetimeScale } from "../scale/datetimeScaleCalculator";
import { isCoordinateSeries } from "../helpers/coordinate";
import { hasPercentStackSeries } from "./stackSeriesData";
import { isExist } from "../helpers/utils";
const MIN_OFFSET_SIZE = 1;
function getLabelScaleData(state, labelAxisOnYAxis, scaleOptions, labelAxisName) {
    var _a;
    const { dataRange, layout, series, options } = state;
    const categories = state.categories;
    const rawCategories = state.rawCategories;
    const { labelSizeKey } = getSizeKey(labelAxisOnYAxis);
    const dateTypeLabel = isExist((_a = options.xAxis) === null || _a === void 0 ? void 0 : _a.date);
    const labelOptions = {
        dataRange: dataRange[labelAxisName],
        offsetSize: Math.max(layout.plot[labelSizeKey], MIN_OFFSET_SIZE),
        scaleOption: scaleOptions[labelAxisName],
        rawCategoriesSize: rawCategories.length,
    };
    let result;
    if (dataRange[labelAxisName]) {
        result = dateTypeLabel
            ? calculateDatetimeScale(labelOptions)
            : calculateCoordinateScale(labelOptions);
    }
    if (series.line) {
        result = calculateScaleForCoordinateLineType(result, options, categories);
    }
    return result;
}
function getValueScaleData(state, labelAxisOnYAxis, scaleOptions, valueAxisName, isCoordinateTypeChart) {
    const { dataRange, layout, series, stackSeries } = state;
    const { valueSizeKey } = getSizeKey(labelAxisOnYAxis);
    let result;
    if (hasPercentStackSeries(stackSeries)) {
        Object.keys(series).forEach((seriesName) => {
            result = getStackScaleData(stackSeries[seriesName].scaleType);
        });
    }
    else if (isCoordinateTypeChart) {
        const valueOptions = {
            dataRange: dataRange[valueAxisName],
            offsetSize: Math.max(layout.plot[valueSizeKey], MIN_OFFSET_SIZE),
            scaleOption: scaleOptions[valueAxisName],
        };
        result = calculateCoordinateScale(valueOptions);
    }
    else {
        result = calculateCoordinateScale({
            dataRange: dataRange[valueAxisName],
            offsetSize: Math.max(layout.plot[valueSizeKey], MIN_OFFSET_SIZE),
            scaleOption: scaleOptions[valueAxisName],
        });
    }
    return result;
}
const scale = {
    name: 'scale',
    state: () => ({
        scale: {},
    }),
    action: {
        setScale({ state, initStoreState }) {
            var _a, _b, _c, _d, _e, _f;
            const { series, options } = state;
            const labelAxisOnYAxis = isLabelAxisOnYAxis(series, options);
            const { labelAxisName, valueAxisName } = getAxisName(labelAxisOnYAxis, series);
            const { yAxis, secondaryYAxis } = getYAxisOption(options);
            const scaleOptions = isSeriesUsingRadialAxes(series)
                ? { [valueAxisName]: (_b = (_a = options) === null || _a === void 0 ? void 0 : _a[valueAxisName]) === null || _b === void 0 ? void 0 : _b.scale }
                : {
                    xAxis: (_d = (_c = options) === null || _c === void 0 ? void 0 : _c.xAxis) === null || _d === void 0 ? void 0 : _d.scale,
                    yAxis: (_e = yAxis) === null || _e === void 0 ? void 0 : _e.scale,
                };
            const scaleData = {};
            if (secondaryYAxis) {
                scaleOptions.secondaryYAxis = (_f = secondaryYAxis) === null || _f === void 0 ? void 0 : _f.scale;
            }
            const isCoordinateTypeChart = isCoordinateSeries(initStoreState.series);
            getValueAxisNames(options, valueAxisName).forEach((axisName) => {
                scaleData[axisName] = getValueScaleData(state, labelAxisOnYAxis, scaleOptions, axisName, isCoordinateTypeChart);
            });
            if (isCoordinateTypeChart) {
                scaleData[labelAxisName] = getLabelScaleData(state, labelAxisOnYAxis, scaleOptions, labelAxisName);
            }
            state.scale = scaleData;
        },
    },
    observe: {
        updateScale() {
            this.dispatch('setScale');
        },
    },
};
export default scale;
