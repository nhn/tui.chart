import { rgbToHEX } from '@src/helpers/color';
import { ValueEdge } from '@t/store/store';
import { isString, isUndefined } from '@src/helpers/utils';

export type RGB = [number, number, number];

export function makeDistances(startRGB: RGB, endRGB: RGB) {
  return startRGB.map((value, index) => endRGB[index] - value);
}

export function getColorRatio(limit: ValueEdge, value?: number) {
  if (isUndefined(value)) {
    return;
  }
  const divNumber = Math.abs(limit.max - limit.min);
  const subNumber = Math.max(0, limit.min);

  return divNumber ? (value - subNumber) / divNumber : 0;
}

export function getSpectrumColor(ratio: number, distances: RGB, startRGB: RGB) {
  const rgbColor = startRGB.map(
    (start, index) => start + parseInt(String(distances[index] * ratio), 10)
  ) as RGB;

  const color = rgbToHEX(...rgbColor);

  return isString(color) ? color : '';
}
