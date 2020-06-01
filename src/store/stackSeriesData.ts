import {
  StoreModule,
  ChartType,
  StackSeriesData,
  StackDataType,
  StackData,
  StackGroupData,
  Options,
  BoxType,
  StackDataValues,
  Stack,
} from '@t/store/store';
import { isBoxSeries } from '@src/component/boxSeries';
import {
  StackType,
  StackOptionType,
  StackInfo,
  Connector,
  BoxSeriesType,
  BoxSeriesDataType,
  BoxSeriesOptions,
} from '@t/options';
import { pickProperty, isObject } from '@src/helpers/utils';
import { extend } from '@src/store/store';

type SeriesRawData = BoxSeriesType<BoxSeriesDataType>[];

export type StackSeries = {
  [key in BoxType]?: StackSeriesData<key>;
};

function isPercentStack(stack?: Stack) {
  return stack && stack.type === 'percent';
}

export function hasPercentStackSeries(stackSeries: StackSeries) {
  if (!stackSeries) {
    return false;
  }

  return Object.keys(stackSeries).some((seriesName) =>
    isPercentStack(stackSeries[seriesName as BoxType]?.stack)
  );
}

export function pickStackOption(options: Options): StackOptionType {
  return pickProperty(options, ['series', 'stack']) as StackOptionType;
}

function makeStackData(seriesData: SeriesRawData): StackDataValues {
  const seriesCount = seriesData.length;
  const groupCountLengths = seriesData.map(({ data }) => data.length);
  const seriesGroupCount = Math.max(...groupCountLengths);
  const stackData: StackDataValues = [];

  for (let i = 0; i < seriesGroupCount; i += 1) {
    const stackValues: number[] = [];

    for (let j = 0; j < seriesCount; j += 1) {
      stackValues.push((seriesData[j].data[i] as number) || 0);
    }

    stackData[i] = {
      values: stackValues,
      sum: stackValues.reduce((a, b) => a + b, 0),
      total: {
        positive: stackValues.filter((value) => value >= 0).reduce((a, b) => a + b, 0),
        negative: stackValues.filter((value) => value < 0).reduce((a, b) => a + b, 0),
      },
    } as StackData;
  }

  return stackData;
}

function makeStackGroupData(seriesData: SeriesRawData): StackGroupData {
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

  const defaultConnector = {
    type: 'solid',
    color: 'rgba(51, 85, 139, 0.3)',
    width: 1,
  } as Connector;

  const defaultStackOption = {
    type: 'normal',
    connector: false,
  } as StackInfo;

  if (isStackObject(stackOption)) {
    if (stackOption.connector) {
      stackOption.connector = (isConnectorObject(stackOption.connector)
        ? { ...defaultConnector, ...stackOption.connector }
        : defaultConnector) as Required<Connector>;
    }

    return { ...defaultStackOption, ...stackOption } as Required<StackInfo>;
  }

  return defaultStackOption as Required<StackInfo>;
}

function isStackObject(stackOption: StackOptionType): stackOption is StackInfo {
  return isObject(stackOption);
}

function isConnectorObject(connector: boolean | Connector): connector is Connector {
  return isObject(connector);
}

function hasStackGrouped(seriesRawData: SeriesRawData): boolean {
  return seriesRawData.some((rawData) => rawData.hasOwnProperty('stackGroup'));
}

function getStackDataValues(stackData: StackDataType) {
  /*
  if (stackType === 'percent') {
    return [0, 100];
  }
  */

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

function getScaleType(
  grouped: boolean,
  stackData: StackDataType,
  stackType: StackType,
  diverging: boolean
) {
  if (grouped) {
    let stackDataValues: StackDataValues = [];

    Object.keys(stackData as StackGroupData).forEach((groupId) => {
      stackDataValues = [...stackDataValues, ...stackData[groupId]];
    });

    stackData = stackDataValues;
  }

  const hasNegativeValue = (stackData as StackDataValues)
    .map(({ total }) => total.negative)
    .some((total) => total < 0);
  const hasPositiveValue = (stackData as StackDataValues)
    .map(({ total }) => total.positive)
    .some((total) => total >= 0);

  if (stackType === 'percent') {
    if (diverging) {
      return 'divergingPercentStack';
    }

    if (hasNegativeValue && hasPositiveValue) {
      return 'dualPercentStack';
    }

    if (!hasNegativeValue && hasPositiveValue) {
      return 'percentStack';
    }

    if (hasNegativeValue && !hasPositiveValue) {
      return 'minusPercentStack';
    }
  }
}

const stackSeriesData: StoreModule = {
  name: 'stackSeriesData',
  state: () => ({
    stackSeries: {},
  }),
  initialize(state, options) {
    const { series, stackSeries } = state;

    Object.keys(series).forEach((seriesName) => {
      const stackOption = pickStackOption(options);

      if (stackOption && isBoxSeries(seriesName as ChartType)) {
        if (!stackSeries[seriesName]) {
          stackSeries[seriesName] = {} as StackSeriesData<BoxType>;
        }

        stackSeries[seriesName].stack = initializeStack(stackOption);
      }
    });
  },
  action: {
    setStackSeriesData({ state }) {
      const { series, stackSeries, options } = state;
      const newStackSeries = {};

      Object.keys(series).forEach((seriesName) => {
        const seriesData = series[seriesName];
        const { data, seriesCount, seriesGroupCount } = seriesData;
        const { stack } = stackSeries[seriesName] || {};
        const diverging = !!(options.series as BoxSeriesOptions)?.diverging;

        if (stack) {
          const grouped = hasStackGrouped(data);
          const stackData = grouped ? makeStackGroupData(data) : makeStackData(data);
          const stackType = stack.type;
          const dataValues = getStackDataValues(stackData);

          newStackSeries[seriesName] = {
            data,
            seriesCount,
            seriesGroupCount,
            stackData,
            dataValues,
            scaleType: getScaleType(grouped, stackData, stackType, diverging),
          } as StackSeriesData<BoxType>;
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
