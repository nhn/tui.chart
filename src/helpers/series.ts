import { StackDataType } from '@src/component/boxSeries';

export function getStackData(seriesRawData): StackDataType {
  const seriesCount = seriesRawData.length;
  const groupCountLengths = seriesRawData.map(({ data: seriesDatas }) => seriesDatas.length);
  const seriesGroupCount = Math.max(...groupCountLengths);
  const stackData: StackDataType = [];

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
