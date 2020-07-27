import { BoxSeriesDataType, RangeDataType } from '@t/options';
import { getFirstValidValue, isNumber } from '@src/helpers/utils';

export function isRangeValue(value: unknown): value is RangeDataType {
  return Array.isArray(value) && value.length === 2 && isNumber(value[0]) && isNumber(value[1]);
}

export function isRangeData(data?: BoxSeriesDataType[]): data is RangeDataType[] {
  return Array.isArray(data) && !!data.length && isRangeValue(getFirstValidValue(data));
}
