import { extend } from "./store";
import { pickProperty, isObject, sum } from "../helpers/utils";
export function isPercentStack(stack) {
    var _a;
    return !!(((_a = stack) === null || _a === void 0 ? void 0 : _a.type) === 'percent');
}
export function isGroupStack(rawData) {
    return !Array.isArray(rawData);
}
export function hasPercentStackSeries(stackSeries) {
    if (!stackSeries) {
        return false;
    }
    return Object.keys(stackSeries).some((seriesName) => isPercentStack(stackSeries[seriesName].stack));
}
export function pickStackOption(options) {
    return (pickProperty(options, ['series', 'stack']) ||
        pickProperty(options, ['series', 'column', 'stack']) ||
        pickProperty(options, ['series', 'area', 'stack']));
}
function makeStackData(seriesData) {
    const seriesCount = seriesData.length;
    const groupCountLengths = seriesData.map(({ rawData }) => rawData.length);
    const seriesGroupCount = Math.max(...groupCountLengths);
    const stackData = [];
    for (let i = 0; i < seriesGroupCount; i += 1) {
        const stackValues = [];
        for (let j = 0; j < seriesCount; j += 1) {
            stackValues.push(seriesData[j].rawData[i]);
        }
        stackData[i] = {
            values: stackValues,
            sum: sum(stackValues),
            total: {
                positive: sum(stackValues.filter((value) => value >= 0)),
                negative: sum(stackValues.filter((value) => value < 0)),
            },
        };
    }
    return stackData;
}
function makeStackGroupData(seriesData) {
    const stackData = {};
    const stackGroupIds = [...new Set(seriesData.map(({ stackGroup }) => stackGroup))];
    stackGroupIds.forEach((groupId) => {
        const filtered = seriesData.filter(({ stackGroup }) => groupId === stackGroup);
        stackData[groupId] = makeStackData(filtered);
    });
    return stackData;
}
function initializeStack(stackOption) {
    if (!stackOption) {
        return;
    }
    const defaultStackOption = {
        type: 'normal',
        connector: false,
    };
    if (isStackObject(stackOption)) {
        return Object.assign(Object.assign({}, defaultStackOption), stackOption);
    }
    return defaultStackOption;
}
function isStackObject(stackOption) {
    return isObject(stackOption);
}
function hasStackGrouped(seriesRawData) {
    return seriesRawData.some((rawData) => rawData.hasOwnProperty('stackGroup'));
}
function getStackDataRangeValues(stackData) {
    let values = [];
    if (Array.isArray(stackData)) {
        values = [0, ...getSumValues(stackData)];
    }
    else {
        for (const groupId in stackData) {
            if (Object.prototype.hasOwnProperty.call(stackData, groupId)) {
                values = [0, ...values, ...getSumValues(stackData[groupId])];
            }
        }
    }
    return values;
}
function getSumValues(stackData) {
    const positiveSum = stackData.map(({ total }) => total.positive);
    const negativeSum = stackData.map(({ total }) => total.negative);
    return [...negativeSum, ...positiveSum];
}
function getStackDataValues(stackData) {
    if (!isGroupStack(stackData)) {
        return stackData;
    }
    let stackDataValues = [];
    if (isGroupStack(stackData)) {
        Object.keys(stackData).forEach((groupId) => {
            stackDataValues = [...stackDataValues, ...stackData[groupId]];
        });
    }
    return stackDataValues;
}
function checkIfNegativeAndPositiveValues(stackData) {
    return {
        hasNegative: stackData.map(({ total }) => total.negative).some((total) => total < 0),
        hasPositive: stackData.map(({ total }) => total.positive).some((total) => total >= 0),
    };
}
function getScaleType(stackData, stackType, diverging) {
    const { hasPositive, hasNegative } = checkIfNegativeAndPositiveValues(stackData);
    if (stackType === 'percent') {
        if (diverging) {
            return 'divergingPercentStack';
        }
        if (hasNegative && hasPositive) {
            return 'dualPercentStack';
        }
        if (!hasNegative && hasPositive) {
            return 'percentStack';
        }
        if (hasNegative && !hasPositive) {
            return 'minusPercentStack';
        }
    }
}
function initStackSeries(series, options) {
    const stackSeries = {};
    Object.keys(series).forEach((seriesName) => {
        const chartType = seriesName;
        const stackOption = pickStackOption(options);
        if (stackOption) {
            if (!stackSeries[chartType]) {
                stackSeries[chartType] = {};
            }
            stackSeries[chartType].stack = initializeStack(stackOption);
        }
        else if (seriesName === 'radialBar') {
            stackSeries[seriesName] = { stack: true };
        }
    });
    return stackSeries;
}
const stackSeriesData = {
    name: 'stackSeriesData',
    state: ({ series, options }) => ({
        stackSeries: initStackSeries(series, options),
    }),
    action: {
        setStackSeriesData({ state }) {
            const { series, stackSeries, options } = state;
            const stackOption = pickStackOption(options);
            const newStackSeries = {};
            Object.keys(series).forEach((seriesName) => {
                var _a, _b;
                const seriesData = series[seriesName];
                const { data, seriesCount, seriesGroupCount } = seriesData;
                const isRadialBar = seriesName === 'radialBar';
                if (stackOption) {
                    if (!stackSeries[seriesName]) {
                        stackSeries[seriesName] = {};
                    }
                    stackSeries[seriesName].stack = initializeStack(stackOption);
                }
                else if (!isRadialBar) {
                    stackSeries[seriesName] = null;
                    delete stackSeries[seriesName];
                }
                const { stack } = stackSeries[seriesName] || {};
                const diverging = !!((_a = options.series) === null || _a === void 0 ? void 0 : _a.diverging);
                if (stack) {
                    const stackData = hasStackGrouped(data) ? makeStackGroupData(data) : makeStackData(data);
                    const stackType = (_b = stack.type, (_b !== null && _b !== void 0 ? _b : 'normal'));
                    const dataRangeValues = getStackDataRangeValues(stackData);
                    newStackSeries[seriesName] = {
                        data,
                        seriesCount,
                        seriesGroupCount,
                        stackData,
                        dataRangeValues,
                        scaleType: getScaleType(getStackDataValues(stackData), stackType, diverging),
                    };
                    state.stackSeries[seriesName].stackData = stackData;
                }
                extend(state.stackSeries, newStackSeries);
            });
        },
    },
    observe: {
        updateStackSeriesData() {
            this.dispatch('setStackSeriesData');
        },
    },
};
export default stackSeriesData;
