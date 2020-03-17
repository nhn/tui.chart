import { ValueEdge } from '../../types/store/store';
import * as arrayUtil from '@src/helpers/arrayUtil';
import { range } from '@src/helpers/utils';

// calculator.js

export const getDecimalLength = (value: string | number) => {
  const valueArr = String(value).split('.');

  return valueArr.length === 2 ? valueArr[1].length : 0;
};

export const findMultipleNum = (...args: number[]) => {
  const underPointLens = args.map(value => getDecimalLength(value));
  const underPointLen = arrayUtil.max(underPointLens);

  return Math.pow(10, underPointLen);
};

export function makeLabelsFromLimit(limit: ValueEdge, step: number) {
  const multipleNum = findMultipleNum(step);
  const min = Math.round(limit.min * multipleNum);
  const max = Math.round(limit.max * multipleNum);
  const labels = range(min, max + 1, step * multipleNum);

  return labels.map(label => label / multipleNum);
}

export function makeTickPixelPositions(
  size: number,
  count: number,
  additionalPosition = 0,
  remainLastBlockIntervalPosition = 0
): number[] {
  let positions: number[] = [];

  additionalPosition = additionalPosition || 0;

  if (count > 0) {
    positions = range(0, count).map(index => {
      const ratio = index === 0 ? 0 : index / (count - 1);

      return ratio * size + additionalPosition;
    });

    // 왜하는지 모르겠음
    // positions[positions.length - 1] -= 1;
  }

  if (remainLastBlockIntervalPosition) {
    positions.push(remainLastBlockIntervalPosition);
  }

  return positions;
}

export function crispPixel(pixel: number, width = 1) {
  const devicePixelRatio = window.devicePixelRatio;
  const halfWidth = width / 2;

  return Math.round((pixel - halfWidth) * devicePixelRatio) / devicePixelRatio + halfWidth;
}
