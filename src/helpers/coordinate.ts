import { CoordinateDataType } from '@t/options';
import { first, isNumber, isObject } from '@src/helpers/utils';
import { SeriesState } from '@t/store/store';

export function getCoordinateValue(datum: number | CoordinateDataType) {
  if (isNumber(datum)) {
    return datum;
  }

  return Array.isArray(datum) ? datum[1] : datum.y;
}

export function getCoordinateLabel(datum: CoordinateDataType) {
  // @TODO: string일 경우 처리 필요(date)
  return Array.isArray(datum) ? Number(datum[0]) : datum.x;
}

export function getCoordinateDataIndex(
  datum: number | CoordinateDataType,
  categories: string[],
  dataIndex: number
) {
  if (isNumber(datum)) {
    return dataIndex;
  }

  const value = Array.isArray(datum) ? datum[0] : datum.x;

  return categories.findIndex(category => category === String(value));
}

function isLineCoordinateSeries(series: SeriesState) {
  if (!series.line) {
    return false;
  }
  const firstData = first(series.line[0].data);

  return firstData && (Array.isArray(firstData) || isObject(firstData));
}

export function isCoordinateSeries(series: SeriesState) {
  return isLineCoordinateSeries(series) || series.scatter || series.bubble;
}
