import { BoxSeriesDataType, RangeDataType } from '@t/options';

export function isRangeValue(value: BoxSeriesDataType): value is RangeDataType {
  return Array.isArray(value);
}

export function isRangeData(
  data: BoxSeriesDataType[]
): data is RangeDataType[] {
  return !!data.length && isRangeValue(data[0]);
}
