import { rgbToHEX } from '@src/helpers/color';
import { ValueEdge } from '@t/store/store';
import { isNull, isString, isUndefined } from '@src/helpers/utils';

export type RGB = [number, number, number];

export function makeDistances(startRGB: RGB, endRGB: RGB) {
  return startRGB.map((value, index) => endRGB[index] - value) as RGB;
}

export function getColorRatio(limit: ValueEdge, value?: number | null) {
  if (isUndefined(value)) {
    return;
  }
  const divNumber = Math.abs(limit.max - limit.min);

  return divNumber && !isNull(value) ? (value - limit.min) / divNumber : 0;
}

export function getSpectrumColor(ratio: number, distances: RGB, startRGB: RGB) {
  const rgbColor = startRGB.map(
    (start, index) => start + parseInt(String(distances[index] * ratio), 10)
  ) as RGB;

  const color = rgbToHEX(...rgbColor);

  return isString(color) ? color : '';
}
