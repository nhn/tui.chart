import { RangeDataType, BoxSeriesDataType } from '@t/options';
import { getFirstValidValue } from '@src/helpers/utils';

function isRangeLength<T>(range: T) {
  return Array.isArray(range) && range.length === 2;
}

export function isRangeValue<T>(value: unknown): value is RangeDataType<T> {
  return isRangeLength(value);
}

export function isRangeData(data?: BoxSeriesDataType[]) {
  return isRangeValue(getFirstValidValue(data));
}

export function isZooming(categories: string[], zoomRange?: RangeDataType<number>) {
  return zoomRange && (zoomRange[0] !== 0 || zoomRange[1] !== categories.length - 1);
}
