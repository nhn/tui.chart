import { RangeDataType, BoxSeriesDataType } from '@t/options';
import { getFirstValidValue } from '@src/helpers/utils';
import { TooltipDataValue } from '@t/components/tooltip';

export function isRangeValue<T>(value: unknown): value is RangeDataType<T> {
  return Array.isArray(value) && value.length === 2;
}

export function isRangeData(data?: BoxSeriesDataType[] | TooltipDataValue) {
  return Array.isArray(data) && isRangeValue(getFirstValidValue(data));
}

export function isZooming(categories: string[], zoomRange?: RangeDataType<number>) {
  return !!(zoomRange && (zoomRange[0] !== 0 || zoomRange[1] !== categories.length - 1));
}

export function getDataInRange<T>(data: T[], range?: RangeDataType<number>) {
  if (!range) {
    return data;
  }

  return data.slice(range[0], range[1] + 1);
}
