import { extend } from "./store";
import { getAxisName, getSizeKey, isLabelAxisOnYAxis, getYAxisOption, getValueAxisNames, } from "../helpers/axes";
import { calculateCoordinateScale, calculateScaleForCoordinateLineType, getStackScaleData, } from "../scale/coordinateScaleCalculator";
import { calculateDatetimeScale } from "../scale/datetimeScaleCalculator";
import { isCoordinateSeries } from "../helpers/coordinate";
import { hasPercentStackSeries } from "./stackSeriesData";
import { isExist } from "../helpers/utils";
function getLabelScaleData(state, labelAxisOnYAxis, scaleOptions, labelAxisName) {
    var _a;
    const { dataRange, layout, series, options } = state;
    const categories = state.categories;
    const rawCategories = state.rawCategories;
    const { labelSizeKey } = getSizeKey(labelAxisOnYAxis);
    const dateTypeLabel = isExist((_a = options.xAxis) === null || _a === void 0 ? void 0 : _a.date);
    const labelOptions = {
        dataRange: dataRange[labelAxisName],
        offsetSize: layout.plot[labelSizeKey],
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
function getValueScaleData(state, labelAxisOnYAxis, scaleOptions, valueAxisName) {
    const { dataRange, layout, series, stackSeries } = state;
    const { valueSizeKey } = getSizeKey(labelAxisOnYAxis);
    let result;
    if (hasPercentStackSeries(stackSeries)) {
        Object.keys(series).forEach((seriesName) => {
            result = getStackScaleData(stackSeries[seriesName].scaleType);
        });
    }
    else if (isCoordinateSeries(series)) {
        const valueOptions = {
            dataRange: dataRange[valueAxisName],
            offsetSize: layout.plot[valueSizeKey],
            scaleOption: scaleOptions[valueAxisName],
        };
        result = calculateCoordinateScale(valueOptions);
    }
    else {
        result = calculateCoordinateScale({
            dataRange: dataRange[valueAxisName],
            offsetSize: layout.plot[valueSizeKey],
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
        setScale({ state }) {
            var _a, _b, _c, _d;
            const { series, options } = state;
            const labelAxisOnYAxis = isLabelAxisOnYAxis(series, options);
            const { labelAxisName, valueAxisName } = getAxisName(labelAxisOnYAxis);
            const { yAxis, secondaryYAxis } = getYAxisOption(options);
            const scaleData = {};
            const scaleOptions = {
                xAxis: (_b = (_a = options) === null || _a === void 0 ? void 0 : _a.xAxis) === null || _b === void 0 ? void 0 : _b.scale,
                yAxis: (_c = yAxis) === null || _c === void 0 ? void 0 : _c.scale,
            };
            if (secondaryYAxis) {
                scaleOptions.secondaryYAxis = (_d = secondaryYAxis) === null || _d === void 0 ? void 0 : _d.scale;
            }
            getValueAxisNames(options, valueAxisName).forEach((axisName) => {
                scaleData[axisName] = getValueScaleData(state, labelAxisOnYAxis, scaleOptions, axisName);
            });
            if (isCoordinateSeries(series)) {
                scaleData[labelAxisName] = getLabelScaleData(state, labelAxisOnYAxis, scaleOptions, labelAxisName);
            }
            extend(state.scale, scaleData);
        },
    },
    observe: {
        updateScale() {
            this.dispatch('setScale');
        },
    },
};
export default scale;
