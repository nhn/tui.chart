import {
  StoreModule,
  ChartType,
  StackSeriesData,
  StackDataType,
  StackData,
  StackGroupData,
  Options,
  BoxType
} from '@t/store/store';
import { isBoxSeries } from '@src/component/boxSeries';
import {
  StackType,
  StackOptionType,
  StackInfo,
  Connector,
  BoxSeriesType,
  BoxSeriesDataType
} from '@t/options';
import { pickProperty, isObject } from '@src/helpers/utils';

type SeriesRawData = BoxSeriesType<BoxSeriesDataType>[];

export function pickStackOption(options: Options): StackOptionType {
  return pickProperty(options, ['series', 'stack']) as StackOptionType;
}

function makeStackData(seriesData: SeriesRawData): StackData {
  const seriesCount = seriesData.length;
  const groupCountLengths = seriesData.map(({ data }) => data.length);
  const seriesGroupCount = Math.max(...groupCountLengths);
  const stackData: StackData = [];

  for (let i = 0; i < seriesGroupCount; i += 1) {
    const stackValues: number[] = [];

    for (let j = 0; j < seriesCount; j += 1) {
      stackValues.push((seriesData[j].data[i] as number) || 0);
    }

    stackData[i] = {
      values: stackValues,
      sum: stackValues.reduce((a, b) => a + b, 0)
    };
  }

  return stackData;
}

function makeStackGroupData(seriesData: SeriesRawData): StackGroupData {
  const stackData: StackGroupData = {};
  const stackGroupIds = [...new Set(seriesData.map(({ stackGroup }) => stackGroup))] as string[];

  stackGroupIds.forEach(groupId => {
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
    width: 1
  } as Connector;

  const defaultStackOption = {
    type: 'normal',
    connector: false
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
  return seriesRawData.some(rawData => rawData.hasOwnProperty('stackGroup'));
}

function getStackDataValues(stackData: StackDataType, stackType: StackType) {
  if (stackType === 'percent') {
    return [0, 100];
  }

  let values: number[] = [];

  if (Array.isArray(stackData)) {
    values = [0, ...stackData.map(({ sum }) => sum)];
  } else {
    for (const groupId in stackData) {
      if (Object.prototype.hasOwnProperty.call(stackData, groupId)) {
        const sums = stackData[groupId].map(({ sum }) => sum);
        values = [0, ...values, ...sums];
      }
    }
  }

  return values;
}

const stackSeriesData: StoreModule = {
  name: 'stackSeriesData',
  state: () => ({
    stackSeries: {}
  }),
  initialize(state, options) {
    const { series, stackSeries } = state;

    Object.keys(series).forEach(seriesName => {
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
      const { series, stackSeries } = state;
      const newStackSeries = {};

      Object.keys(series).forEach(seriesName => {
        const seriesData = series[seriesName];
        const { data, seriesCount, seriesGroupCount } = seriesData;
        const { stack } = stackSeries[seriesName];

        if (stack) {
          const stackData = hasStackGrouped(data) ? makeStackGroupData(data) : makeStackData(data);
          const stackType = stack.type;

          newStackSeries[seriesName] = {
            data,
            seriesCount,
            seriesGroupCount,
            stackData,
            dataValues: getStackDataValues(stackData, stackType)
          } as StackSeriesData<BoxType>;
        }

        this.extend(state.stackSeries, newStackSeries);
      });
    }
  },
  observe: {
    updateStackSeriesData() {
      this.dispatch('setStackSeriesData');
    }
  }
};

export default stackSeriesData;
