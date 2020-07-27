import { CoordinateDataType } from '@t/options';
import { first, isNumber, isObject, last } from '@src/helpers/utils';
import { Series } from '@t/store/store';

export function getCoordinateYValue(datum: number | CoordinateDataType) {
  if (isNumber(datum)) {
    return datum;
  }

  return Array.isArray(datum) ? datum[1] : datum.y;
}

export function getCoordinateXValue(datum: CoordinateDataType) {
  // @TODO: string일 경우 처리 필요(date)
  return Array.isArray(datum) ? Number(datum[0]) : datum.x;
}

export function getCoordinateDataIndex(
  datum: number | CoordinateDataType,
  categories: string[],
  dataIndex: number,
  startIndex: number
) {
  if (isNumber(datum)) {
    return dataIndex - startIndex;
  }

  const value = getCoordinateXValue(datum);
  let index = categories.findIndex((category) => category === String(value));

  if (index === -1 && value >= Number(last(categories))) {
    index = categories.length;
  }

  return index;
}

function isLineCoordinateSeries(series: Series) {
  if (!series.line) {
    return false;
  }
  const firstData = first(series.line[0].data);

  return firstData && (Array.isArray(firstData) || isObject(firstData));
}

export function isCoordinateSeries(series: Series) {
  return isLineCoordinateSeries(series) || series.scatter || series.bubble;
}
