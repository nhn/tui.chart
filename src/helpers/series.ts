import { StackData, StackGroupData } from '@t/store/store';

export function getStackData(seriesRawData): StackData {
  const seriesCount = seriesRawData.length;
  const groupCountLengths = seriesRawData.map(({ data }) => data.length);
  const seriesGroupCount = Math.max(...groupCountLengths);
  const stackData: StackData = [];

  for (let i = 0; i < seriesGroupCount; i += 1) {
    const stackValues: number[] = [];

    for (let j = 0; j < seriesCount; j += 1) {
      stackValues.push(seriesRawData[j].data[i] || 0);
    }

    stackData[i] = {
      values: stackValues,
      sum: stackValues.reduce((a, b) => a + b, 0)
    };
  }

  return stackData;
}

export function hasStackGrouped(seriesRawData) {
  return seriesRawData.some(rawData => rawData.hasOwnProperty('stackGroup'));
}

export function getStackGroupData(seriesRawData): StackGroupData {
  const stackData = {};
  const stackGroupIds = [...new Set(seriesRawData.map(({ stackGroup }) => stackGroup))] as string[];

  stackGroupIds.forEach(groupId => {
    const filtered = seriesRawData.filter(({ stackGroup }) => groupId === stackGroup);

    stackData[groupId] = getStackData(filtered);
  });

  return stackData;
}
