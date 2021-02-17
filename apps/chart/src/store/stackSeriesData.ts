import {
  StoreModule,
  ChartType,
  StackDataType,
  StackGroupData,
  Options,
  StackDataValues,
  Stack,
  StackSeries,
  RawSeries,
} from '@t/store/store';
import {
  BoxSeriesOptions,
  StackType,
  StackOptionType,
  StackInfo,
  BoxSeriesDataType,
  BoxSeriesType,
} from '@t/options';
import { extend } from '@src/store/store';
import { pickProperty, isObject, sum } from '@src/helpers/utils';

type RawSeriesData = BoxSeriesType<BoxSeriesDataType>[];

export function isPercentStack(stack?: Stack): boolean {
  return !!(stack?.type === 'percent');
}

export function isGroupStack(rawData: StackDataType): rawData is StackGroupData {
  return !Array.isArray(rawData);
}

export function hasPercentStackSeries(stackSeries: StackSeries) {
  if (!stackSeries) {
    return false;
  }

  return Object.keys(stackSeries).some((seriesName) =>
    isPercentStack(stackSeries[seriesName].stack)
  );
}

export function pickStackOption(options: Options): StackOptionType {
  return (pickProperty(options, ['series', 'stack']) ||
    pickProperty(options, ['series', 'column', 'stack']) ||
    pickProperty(options, ['series', 'area', 'stack'])) as StackOptionType;
}

function makeStackData(seriesData: RawSeriesData): StackDataValues {
  const seriesCount = seriesData.length;
  const groupCountLengths = seriesData.map(({ rawData }) => rawData.length);
  const seriesGroupCount = Math.max(...groupCountLengths);
  const stackData: StackDataValues = [];

  for (let i = 0; i < seriesGroupCount; i += 1) {
    const stackValues: number[] = [];

    for (let j = 0; j < seriesCount; j += 1) {
      stackValues.push(seriesData[j].rawData[i] as number);
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

function makeStackGroupData(seriesData: RawSeriesData): StackGroupData {
  const stackData: StackGroupData = {};
  const stackGroupIds = [...new Set(seriesData.map(({ stackGroup }) => stackGroup))] as string[];

  stackGroupIds.forEach((groupId) => {
    const filtered = seriesData.filter(({ stackGroup }) => groupId === stackGroup);

    stackData[groupId] = makeStackData(filtered);
  });

  return stackData;
}

function initializeStack(stackOption: StackOptionType): Required<StackInfo> | undefined {
  if (!stackOption) {
    return;
  }

  const defaultStackOption = {
    type: 'normal',
    connector: false,
  } as StackInfo;

  if (isStackObject(stackOption)) {
    return { ...defaultStackOption, ...stackOption } as Required<StackInfo>;
  }

  return defaultStackOption as Required<StackInfo>;
}

function isStackObject(stackOption: StackOptionType): stackOption is StackInfo {
  return isObject(stackOption);
}

function hasStackGrouped(seriesRawData: RawSeriesData): boolean {
  return seriesRawData.some((rawData) => rawData.hasOwnProperty('stackGroup'));
}

function getStackDataRangeValues(stackData: StackDataType) {
  let values: number[] = [];

  if (Array.isArray(stackData)) {
    values = [0, ...getSumValues(stackData)];
  } else {
    for (const groupId in stackData) {
      if (Object.prototype.hasOwnProperty.call(stackData, groupId)) {
        values = [0, ...values, ...getSumValues(stackData[groupId])];
      }
    }
  }

  return values;
}

function getSumValues(stackData: StackDataValues) {
  const positiveSum = stackData.map(({ total }) => total.positive);
  const negativeSum = stackData.map(({ total }) => total.negative);

  return [...negativeSum, ...positiveSum];
}

function getStackDataValues(stackData: StackDataType): StackDataValues {
  if (!isGroupStack(stackData)) {
    return stackData;
  }

  let stackDataValues: StackDataValues = [];

  if (isGroupStack(stackData)) {
    Object.keys(stackData).forEach((groupId) => {
      stackDataValues = [...stackDataValues, ...stackData[groupId]];
    });
  }

  return stackDataValues;
}

function checkIfNegativeAndPositiveValues(stackData: StackDataValues) {
  return {
    hasNegative: stackData.map(({ total }) => total.negative).some((total) => total < 0),
    hasPositive: stackData.map(({ total }) => total.positive).some((total) => total >= 0),
  };
}

function getScaleType(stackData: StackDataValues, stackType: StackType, diverging: boolean) {
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

function initStackSeries(series: RawSeries, options: Options) {
  const stackSeries = {};

  Object.keys(series).forEach((seriesName) => {
    const chartType = seriesName as ChartType;
    const stackOption = pickStackOption(options);

    if (stackOption) {
      if (!stackSeries[chartType]) {
        stackSeries[chartType] = {};
      }

      stackSeries[chartType].stack = initializeStack(stackOption);
    } else if (seriesName === 'radialBar') {
      stackSeries[seriesName] = { stack: true };
    }
  });

  return stackSeries;
}

const stackSeriesData: StoreModule = {
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
        const seriesData = series[seriesName];
        const { data, seriesCount, seriesGroupCount } = seriesData;
        const isRadialBar = seriesName === 'radialBar';

        if (stackOption) {
          if (!stackSeries[seriesName]) {
            stackSeries[seriesName] = {};
          }

          stackSeries[seriesName].stack = initializeStack(stackOption);
        } else if (!isRadialBar) {
          stackSeries[seriesName] = null;
          delete stackSeries[seriesName];
        }

        const { stack } = stackSeries[seriesName] || {};
        const diverging = !!(options.series as BoxSeriesOptions)?.diverging;

        if (stack) {
          const stackData = hasStackGrouped(data) ? makeStackGroupData(data) : makeStackData(data);
          const stackType = stack.type ?? 'normal';
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
