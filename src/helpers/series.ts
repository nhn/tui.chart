import { StackData, StackGroupData, Options } from '@t/store/store';
import {
  StackOptionType,
  StackInfo,
  Connector,
  BoxSeriesType,
  BoxSeriesDataType
} from '@t/options';
import { pickProperty, isObject } from './utils';

type SeriesRawData = BoxSeriesType<BoxSeriesDataType>[];

export function makeStackData(seriesData: SeriesRawData): StackData {
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

export function hasStackGrouped(seriesRawData: SeriesRawData): boolean {
  return seriesRawData.some(rawData => rawData.hasOwnProperty('stackGroup'));
}

export function makeStackGroupData(seriesData: SeriesRawData): StackGroupData {
  const stackData: StackGroupData = {};
  const stackGroupIds = [...new Set(seriesData.map(({ stackGroup }) => stackGroup))] as string[];

  stackGroupIds.forEach(groupId => {
    const filtered = seriesData.filter(({ stackGroup }) => groupId === stackGroup);

    stackData[groupId] = makeStackData(filtered);
  });

  return stackData;
}

export function pickStackOption(options: Options): StackOptionType {
  return pickProperty(options, ['series', 'stack']) as StackOptionType;
}

export function initializeStack(stackOption: StackOptionType): Required<StackInfo> | undefined {
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
