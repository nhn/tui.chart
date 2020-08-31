/**
 * operation for floating point operation.
 */
import { Options, ValueEdge } from '@t/store/store';
import * as arrayUtil from '@src/helpers/arrayUtil';
import { range, isInteger } from '@src/helpers/utils';
import { BezierPoint, Point } from '@t/options';
import { formatDate, getDateFormat } from '@src/helpers/formatDate';
import { DEFAULT_LABEL_TEXT } from '@src/brushes/label';

function getDecimalLength(value: string | number) {
  const valueArr = String(value).split('.');

  return valueArr[1]?.length ?? 0;
}
function findMultipleNum(...args: (string | number)[]) {
  const underPointLens = args.map((value) => getDecimalLength(value));
  const underPointLen = arrayUtil.max(underPointLens);

  return 10 ** underPointLen;
}
function mod(target: number, modNum: number) {
  const multipleNum = findMultipleNum(modNum);

  return multipleNum === 1
    ? target % modNum
    : ((target * multipleNum) % (modNum * multipleNum)) / multipleNum;
}
export function add(a: number, b: number) {
  const multipleNum = findMultipleNum(a, b);

  return (a * multipleNum + b * multipleNum) / multipleNum;
}
function subtract(a: number, b: number) {
  const multipleNum = findMultipleNum(a, b);

  return (a * multipleNum - b * multipleNum) / multipleNum;
}
export function multiply(a: number, b: number) {
  const multipleNum = findMultipleNum(a, b);

  return (a * multipleNum * (b * multipleNum)) / (multipleNum * multipleNum);
}
export function divide(a: number, b: number) {
  const multipleNum = findMultipleNum(a, b);

  return (a * multipleNum) / (b * multipleNum);
}
function sum(values: number[]) {
  const copyArr = values.slice();
  copyArr.unshift(0);

  return copyArr.reduce((base, value) => add(parseFloat(String(base)), parseFloat(String(value))));
}

function divisors(value: number) {
  const result: number[] = [];
  for (let a = 2, b; a * a <= value; a += 1) {
    if (value % a === 0) {
      b = value / a;
      result.push(a);
      if (b !== a) {
        result.push(b);
      }
    }
  }

  return result.sort((prev, next) => prev - next);
}

export function makeLabelsFromLimit(limit: ValueEdge, stepSize: number, options?: Options) {
  const multipleNum = findMultipleNum(stepSize);
  const min = Math.round(limit.min * multipleNum);
  const max = Math.round(limit.max * multipleNum);
  const labels = range(min, max + 1, stepSize * multipleNum);
  const format = getDateFormat(options);

  return labels.map((label) => {
    return format ? formatDate(format, new Date(label)) : String(label / multipleNum);
  });
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
    positions = range(0, count).map((index) => {
      const ratio = index === 0 ? 0 : index / (count - 1);

      return ratio * size + additionalPosition;
    });
  }

  if (remainLastBlockIntervalPosition) {
    positions.push(remainLastBlockIntervalPosition);
  }

  return positions;
}

export function crispPixel(pixel: number, thickness = 1) {
  const halfThickness = thickness / 2;

  return thickness % 2
    ? (isInteger(pixel) ? pixel : Math.round(pixel - halfThickness)) + halfThickness
    : Math.round(pixel);
}

function getControlPoints(prev: BezierPoint, cur: BezierPoint, next: BezierPoint) {
  // http://scaledinnovation.com/analytics/splines/aboutSplines.html
  const TENSION = 0.333;
  const { x: x0, y: y0 } = prev;
  const { x: x1, y: y1 } = cur;
  const { x: x2, y: y2 } = next;

  const d12 = getDistance(next, cur);
  const d01 = getDistance(cur, prev);

  const fa = (TENSION * d01) / (d01 + d12) || 0; // scaling factor for triangle Ta
  const fb = (TENSION * d12) / (d01 + d12) || 0; // ditto for Tb, simplifies to fb=t-fa

  return {
    prev: {
      x: x1 - fa * (x2 - x0), // x2-x0 is the width of triangle T
      y: y1 - fa * (y2 - y0), // y2-y0 is the height of T
    },
    next: { x: x1 + fb * (x2 - x0), y: y1 + fb * (y2 - y0) },
  };
}

export function setSplineControlPoint(points: BezierPoint[]) {
  for (let i = 0, pointsSize = points.length, prev = points[0]; i < pointsSize; i += 1) {
    const point = points[i];

    point.controlPoint = getControlPoints(
      prev,
      point,
      points[Math.min(i + 1, pointsSize - 1) % pointsSize]
    );

    prev = point;
  }
}

export function getValueRatio(value: number, { min, max }: ValueEdge) {
  return (value - min) / (max - min);
}

export function getDistance(point1: Point, point2: Point) {
  return Math.sqrt((point2.x - point1.x) ** 2 + (point2.y - point1.y) ** 2);
}

export function getTextWidth(text: string, font: string = DEFAULT_LABEL_TEXT) {
  const ctx = document.createElement('canvas').getContext('2d')!;
  ctx.font = font;

  return Math.ceil(ctx.measureText(text).width);
}

export function getTextHeight(font: string = DEFAULT_LABEL_TEXT) {
  const ctx = document.createElement('canvas').getContext('2d')!;
  ctx.font = font;
  const matches = ctx.font.match(/\d+/);

  return parseInt(String(Number(matches) * 1.2), 10);
}
