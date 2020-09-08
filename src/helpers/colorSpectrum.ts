import { rgbToHEX } from '@src/helpers/color';
import { ValueEdge } from '@t/store/store';

type RGB = [number, number, number];

export function makeDistances(startRGB: RGB, endRGB: RGB) {
  return startRGB.map((value, index) => endRGB[index] - value);
}

export function getColor(ratio: number, distances: RGB, startRGB: RGB) {
  const rgbColor = startRGB.map(
    (start, index) => start + parseInt(String(distances[index] * ratio), 10)
  ) as RGB;

  return rgbToHEX(...rgbColor);
}

function makeSubtractionValue(limit: ValueEdge) {
  const allowMinusPointRender = true;
  let subValue = 0;

  if (allowMinusPointRender || limit.min >= 0) {
    subValue = limit.min;
  }

  return subValue;
}
