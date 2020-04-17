import { CoordinateDataType } from '@t/options';
import { isNumber } from '@src/helpers/utils';

export function getCoordinateValue(datum: number | CoordinateDataType) {
  if (isNumber(datum)) {
    return datum;
  }

  return Array.isArray(datum) ? datum[1] : datum.y;
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
