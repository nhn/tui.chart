import { BoxSeriesDataType, RangeDataType } from '@t/options';
import { getFirstExistValue } from '@src/helpers/utils';

export function isRangeValue(value: BoxSeriesDataType): value is RangeDataType {
  return Array.isArray(value);
}

export function isRangeData(data: BoxSeriesDataType[]): data is RangeDataType[] {
  return !!data.length && isRangeValue(getFirstExistValue(data));
}
