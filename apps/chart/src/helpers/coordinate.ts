import { CoordinateDataType, Point, Rect } from '@t/options';
import { getFirstValidValue, isNumber, isObject, last } from '@src/helpers/utils';
import { RawSeries, Series } from '@t/store/store';

export function getCoordinateYValue(datum: number | CoordinateDataType) {
  if (isNumber(datum)) {
    return datum;
  }

  return Array.isArray(datum) ? datum[1] : datum.y;
}

export function getCoordinateXValue(datum: CoordinateDataType) {
  return Array.isArray(datum) ? datum[0] : datum.x;
}

export function isValueAfterLastCategory(value: number | string | Date, categories: string[]) {
  const category = last(categories);

  if (!category) {
    return false;
  }

  return isNumber(value) ? value >= Number(category) : new Date(value) >= new Date(category);
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

  if (index === -1 && isValueAfterLastCategory(value, categories)) {
    index = categories.length;
  }

  return index;
}

function isLineCoordinateSeries(series: Series | RawSeries) {
  if (!series.line) {
    return false;
  }

  const firstData = getFirstValidValue(series.line[0]?.data);

  return firstData && (Array.isArray(firstData) || isObject(firstData));
}

export function isCoordinateSeries(series: Series | RawSeries): boolean {
  return isLineCoordinateSeries(series) || !!series.scatter || !!series.bubble;
}

export function isModelExistingInRect(rect: Rect, point: Point) {
  const { height, width } = rect;
  const { x, y } = point;

  return x >= 0 && x <= width && y >= 0 && y <= height;
}

export function isMouseInRect(rect: Rect, mousePosition: Point) {
  const { x, y, width, height } = rect;

  return (
    mousePosition.x >= x &&
    mousePosition.x <= x + width &&
    mousePosition.y >= y &&
    mousePosition.y <= y + height
  );
}
