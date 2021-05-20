import { getFirstValidValue, isNull, includes } from "../helpers/utils";
import { extend } from "./store";
import { getAxisName, isLabelAxisOnYAxis, getValueAxisNames, getYAxisOption, hasSecondaryYAxis, } from "../helpers/axes";
import { getCoordinateYValue, isCoordinateSeries } from "../helpers/coordinate";
import { isRangeValue } from "../helpers/range";
import { AxisType } from "../component/axis";
export function getLimitSafely(baseValues, isXAxis = false) {
    const limit = {
        min: Math.min(...baseValues),
        max: Math.max(...baseValues),
    };
    if (baseValues.length === 1) {
        const [firstValue] = baseValues;
        if (isXAxis) {
            limit.min = firstValue;
            limit.max = firstValue;
        }
        else if (firstValue > 0) {
            limit.min = 0;
        }
        else if (firstValue === 0) {
            limit.max = 10;
        }
        else {
            limit.max = 0;
        }
    }
    else if (limit.min === 0 && limit.max === 0) {
        limit.max = 10;
    }
    else if (limit.min === limit.max) {
        limit.min -= limit.min / 10;
        limit.max += limit.max / 10;
    }
    return limit;
}
function initDataRange(accDataRangeValue, curDataRangeValue, axisName) {
    var _a, _b, _c, _d;
    const defaultDataRange = {
        min: Number.MAX_SAFE_INTEGER,
        max: Number.MIN_SAFE_INTEGER,
    };
    return {
        min: Math.min(curDataRangeValue[axisName].min, (_b = (_a = accDataRangeValue[axisName]) === null || _a === void 0 ? void 0 : _a.min, (_b !== null && _b !== void 0 ? _b : defaultDataRange.min))),
        max: Math.max(curDataRangeValue[axisName].max, (_d = (_c = accDataRangeValue[axisName]) === null || _c === void 0 ? void 0 : _c.max, (_d !== null && _d !== void 0 ? _d : defaultDataRange.max))),
    };
}
function getTotalDataRange(seriesDataRange) {
    return Object.values(seriesDataRange).reduce((acc, cur) => {
        if (cur.xAxis) {
            acc.xAxis = initDataRange(acc, cur, 'xAxis');
        }
        if (cur.yAxis) {
            acc.yAxis = initDataRange(acc, cur, 'yAxis');
        }
        if (cur.secondaryYAxis) {
            acc.secondaryYAxis = initDataRange(acc, cur, 'secondaryYAxis');
        }
        if (cur.circularAxis) {
            acc.circularAxis = initDataRange(acc, cur, 'circularAxis');
        }
        if (cur.verticalAxis) {
            acc.verticalAxis = initDataRange(acc, cur, 'verticalAxis');
        }
        return acc;
    }, {});
}
function setSeriesDataRange({ options, seriesName, values, valueAxisName, seriesDataRange, }) {
    var _a;
    let axisNames;
    if (includes([AxisType.X, AxisType.CIRCULAR, AxisType.VERTICAL], valueAxisName)) {
        axisNames = [valueAxisName];
    }
    else {
        const optionsUsingYAxis = options;
        const { secondaryYAxis } = getYAxisOption(optionsUsingYAxis);
        axisNames =
            hasSecondaryYAxis(optionsUsingYAxis) && ((_a = secondaryYAxis) === null || _a === void 0 ? void 0 : _a.chartType)
                ? [secondaryYAxis.chartType === seriesName ? 'secondaryYAxis' : 'yAxis']
                : getValueAxisNames(optionsUsingYAxis, valueAxisName);
    }
    axisNames.forEach((axisName) => {
        seriesDataRange[seriesName][axisName] = getLimitSafely([...new Set(values)]);
    });
    return seriesDataRange;
}
function getBoxPlotValues(series, seriesName) {
    return series[seriesName].data.flatMap(({ data, outliers = [] }) => [
        ...((data !== null && data !== void 0 ? data : [])).flatMap((datum) => datum),
        ...((outliers !== null && outliers !== void 0 ? outliers : [])).flatMap((datum) => datum),
    ]);
}
function getBulletValues(series, seriesName) {
    return series[seriesName].data.flatMap(({ data, markers, ranges }) => [
        data,
        ...((markers !== null && markers !== void 0 ? markers : [])).flatMap((datum) => datum),
        ...((ranges !== null && ranges !== void 0 ? ranges : [])).flatMap((range) => range),
    ]);
}
function getCoordinateDataValues(values, categories, hasDateValue) {
    const yAxisValues = values
        .filter((value) => !isNull(value))
        .map((value) => getCoordinateYValue(value));
    const xAxisValues = categories.map((value) => hasDateValue ? Number(new Date(value)) : Number(value));
    return { xAxisValues, yAxisValues };
}
const dataRange = {
    name: 'dataRange',
    state: () => ({
        dataRange: {},
    }),
    action: {
        setDataRange({ state, initStoreState }) {
            const { series, disabledSeries, stackSeries, categories, options } = state;
            const seriesDataRange = {};
            const labelAxisOnYAxis = isLabelAxisOnYAxis({ series, options, categories });
            const { labelAxisName, valueAxisName } = getAxisName(labelAxisOnYAxis, series);
            Object.keys(series).forEach((seriesName) => {
                var _a, _b;
                seriesDataRange[seriesName] = {};
                let values = series[seriesName].data.flatMap(({ data, name }) => disabledSeries.includes(name) ? [] : data);
                const firstExistValue = getFirstValidValue(values);
                if (isCoordinateSeries(initStoreState.series)) {
                    const hasDateValue = !!((_a = options.xAxis) === null || _a === void 0 ? void 0 : _a.date);
                    const { yAxisValues, xAxisValues } = getCoordinateDataValues(values, categories, hasDateValue);
                    values = yAxisValues;
                    seriesDataRange[seriesName][labelAxisName] = getLimitSafely([...xAxisValues], true);
                }
                else if (!series[seriesName].data.length) {
                    values = [];
                }
                else if (isRangeValue(firstExistValue)) {
                    values = values.reduce((arr, value) => {
                        if (isNull(value)) {
                            return arr;
                        }
                        return Array.isArray(value) ? [...arr, ...value] : [...value];
                    }, []);
                }
                else if (stackSeries && ((_b = stackSeries[seriesName]) === null || _b === void 0 ? void 0 : _b.stack)) {
                    values = stackSeries[seriesName].dataRangeValues;
                }
                else if (seriesName === 'boxPlot') {
                    values = getBoxPlotValues(series, seriesName);
                }
                else if (seriesName === 'bullet') {
                    values = getBulletValues(series, seriesName);
                }
                if (includes(['bar', 'column', 'radar', 'bullet'], seriesName)) {
                    values.push(0);
                }
                setSeriesDataRange({
                    options,
                    seriesName,
                    values,
                    valueAxisName,
                    seriesDataRange,
                });
            });
            const newDataRange = getTotalDataRange(seriesDataRange);
            extend(state.dataRange, newDataRange);
        },
    },
    observe: {
        updateDataRange() {
            this.dispatch('setDataRange');
        },
    },
};
export default dataRange;
