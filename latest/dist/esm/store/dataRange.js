import { getFirstValidValue, isNull, includes } from "../helpers/utils";
import { extend } from "./store";
import { getAxisName, isLabelAxisOnYAxis, getValueAxisNames, getYAxisOption, hasSecondaryYAxis, } from "../helpers/axes";
import { getCoordinateYValue, isCoordinateSeries } from "../helpers/coordinate";
import { isRangeValue } from "../helpers/range";
export function getLimitSafely(baseValues) {
    const limit = {
        min: Math.min(...baseValues),
        max: Math.max(...baseValues),
    };
    if (baseValues.length === 1) {
        const [firstValue] = baseValues;
        if (firstValue > 0) {
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
function getTotalDataRange(seriesDataRange) {
    const defaultDataRange = {
        min: Number.MAX_SAFE_INTEGER,
        max: Number.MIN_SAFE_INTEGER,
    };
    return Object.values(seriesDataRange).reduce((acc, cur) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        if (cur.xAxis) {
            acc.xAxis = {
                min: Math.min(cur.xAxis.min, (_b = (_a = acc.xAxis) === null || _a === void 0 ? void 0 : _a.min, (_b !== null && _b !== void 0 ? _b : defaultDataRange.min))),
                max: Math.max(cur.xAxis.max, (_d = (_c = acc.xAxis) === null || _c === void 0 ? void 0 : _c.max, (_d !== null && _d !== void 0 ? _d : defaultDataRange.max))),
            };
        }
        if (cur.yAxis) {
            acc.yAxis = {
                min: Math.min(cur.yAxis.min, (_f = (_e = acc.yAxis) === null || _e === void 0 ? void 0 : _e.min, (_f !== null && _f !== void 0 ? _f : defaultDataRange.min))),
                max: Math.max(cur.yAxis.max, (_h = (_g = acc.yAxis) === null || _g === void 0 ? void 0 : _g.max, (_h !== null && _h !== void 0 ? _h : defaultDataRange.max))),
            };
        }
        if (cur.secondaryYAxis) {
            acc.secondaryYAxis = {
                min: Math.min(cur.secondaryYAxis.min, (_k = (_j = acc.secondaryYAxis) === null || _j === void 0 ? void 0 : _j.min, (_k !== null && _k !== void 0 ? _k : defaultDataRange.min))),
                max: Math.max(cur.secondaryYAxis.max, (_m = (_l = acc.secondaryYAxis) === null || _l === void 0 ? void 0 : _l.max, (_m !== null && _m !== void 0 ? _m : defaultDataRange.max))),
            };
        }
        return acc;
    }, {});
}
function setSeriesDataRange(options, seriesName, values, valueAxisName, seriesDataRange) {
    var _a;
    const { secondaryYAxis } = getYAxisOption(options);
    const axisNames = hasSecondaryYAxis(options) && ((_a = secondaryYAxis) === null || _a === void 0 ? void 0 : _a.chartType)
        ? [secondaryYAxis.chartType === seriesName ? 'secondaryYAxis' : 'yAxis']
        : getValueAxisNames(options, valueAxisName);
    axisNames.forEach((axisName) => {
        seriesDataRange[seriesName][axisName] = getLimitSafely([...new Set(values)]);
    });
    return seriesDataRange;
}
const dataRange = {
    name: 'dataRange',
    state: () => ({
        dataRange: {},
    }),
    action: {
        setDataRange({ state }) {
            var _a, _b;
            const { series, disabledSeries, stackSeries, categories, options } = state;
            const seriesDataRange = {};
            const labelAxisOnYAxis = isLabelAxisOnYAxis(series, options);
            const { labelAxisName, valueAxisName } = getAxisName(labelAxisOnYAxis);
            const hasDateValue = !!((_a = options.xAxis) === null || _a === void 0 ? void 0 : _a.date);
            for (const seriesName in series) {
                if (!series.hasOwnProperty(seriesName)) {
                    continue;
                }
                seriesDataRange[seriesName] = {};
                let values = series[seriesName].data.flatMap(({ data, name }) => disabledSeries.includes(name) ? [] : data);
                const firstExistValue = getFirstValidValue(values);
                if (isCoordinateSeries(series)) {
                    values = values
                        .filter((value) => !isNull(value))
                        .map((value) => getCoordinateYValue(value));
                    const xAxisValues = categories.map((value) => hasDateValue ? Number(new Date(value)) : Number(value));
                    seriesDataRange[seriesName][labelAxisName] = getLimitSafely([...xAxisValues]);
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
                else if (includes(['bar', 'column', 'radar'], seriesName)) {
                    values.push(0);
                }
                else if (seriesName === 'boxPlot') {
                    values = series[seriesName].data.flatMap(({ data, outliers = [] }) => [
                        ...((data !== null && data !== void 0 ? data : [])).flatMap((datum) => datum),
                        ...((outliers !== null && outliers !== void 0 ? outliers : [])).flatMap((datum) => datum),
                    ]);
                }
                else if (seriesName === 'bullet') {
                    values = series[seriesName].data.flatMap(({ data, markers, ranges }) => [
                        data,
                        ...((markers !== null && markers !== void 0 ? markers : [])).flatMap((datum) => datum),
                        ...((ranges !== null && ranges !== void 0 ? ranges : [])).flatMap((range) => range),
                    ]);
                }
                setSeriesDataRange(options, seriesName, values, valueAxisName, seriesDataRange);
            }
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
