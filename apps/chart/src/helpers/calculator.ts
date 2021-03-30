import { ValueEdge, LabelAxisData } from '@t/store/store';
import { range, isInteger, isString, isNumber, isNull } from '@src/helpers/utils';
import { BezierPoint, Point } from '@t/options';
import { DEFAULT_LABEL_TEXT } from '@src/brushes/label';
import { TICK_SIZE } from '@src/brushes/axis';

const LINE_HEIGHT_NORMAL = 1.2;

const ctx = document.createElement('canvas').getContext('2d')!;

export function getTextWidth(text: string, font: string = DEFAULT_LABEL_TEXT) {
  ctx.font = font;

  return Math.ceil(ctx.measureText(text).width);
}

/*
 * Calculate height of canvas text
 * https://developer.mozilla.org/en-US/docs/Web/API/TextMetrics
 * */
export function getTextHeight(text: string, font: string = DEFAULT_LABEL_TEXT) {
  ctx.font = font;
  const { actualBoundingBoxAscent, actualBoundingBoxDescent } = ctx.measureText(text);
  const validActualBoundingBox =
    isNumber(actualBoundingBoxAscent) && isNumber(actualBoundingBoxDescent);

  return validActualBoundingBox
    ? Math.ceil(Math.abs(actualBoundingBoxAscent) + Math.abs(actualBoundingBoxDescent)) + 1
    : getFontHeight(font);
}

export function getFontHeight(font: string = DEFAULT_LABEL_TEXT) {
  const fontSize = font.match(/\d+(?=px)/);

  return parseInt(String(Number(fontSize) * LINE_HEIGHT_NORMAL), 10);
}

export function getAxisLabelAnchorPoint(labelHeight: number) {
  return crispPixel(TICK_SIZE * 2 + labelHeight / 2);
}

function getDecimalLength(value: string | number) {
  return String(value).split('.')[1]?.length ?? 0;
}

function findMultipleNum(...args: (string | number)[]) {
  const underPointLens = args.map((value) => getDecimalLength(value));
  const underPointLen = Math.max(...underPointLens);

  return 10 ** underPointLen;
}

export function add(a: number, b: number) {
  const multipleNum = findMultipleNum(a, b);

  return (a * multipleNum + b * multipleNum) / multipleNum;
}

export function multiply(a: number, b: number) {
  const multipleNum = findMultipleNum(a, b);

  return (a * multipleNum * (b * multipleNum)) / (multipleNum * multipleNum);
}

export function divide(a: number, b: number) {
  const multipleNum = findMultipleNum(a, b);

  return (a * multipleNum) / (b * multipleNum);
}

export function sum(values: number[]) {
  const copyArr = values.slice();
  copyArr.unshift(0);

  return copyArr.reduce((base, value) => add(parseFloat(String(base)), parseFloat(String(value))));
}

export function divisors(value: number) {
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

export function makeLabelsFromLimit(limit: ValueEdge, stepSize: number, isDateType?: boolean) {
  const multipleNum = findMultipleNum(stepSize);
  const min = Math.round(limit.min * multipleNum);
  const max = Math.round(limit.max * multipleNum);
  const labels = range(min, max + 1, stepSize * multipleNum);

  return labels.map((label) => {
    return String(isDateType ? new Date(label) : label / multipleNum);
  });
}

export function makeTickPixelPositions(
  size: number,
  count: number,
  additionalPosition = 0,
  remainLastBlockIntervalPosition = 0
): number[] {
  let positions: number[] = [];

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

export function setSplineControlPoint(points: (BezierPoint | null)[]) {
  for (let i = 0, pointsSize = points.length, prev = points[0]; i < pointsSize; i += 1) {
    const point = points[i];
    if (isNull(point)) {
      prev = points[i + 1];
      continue;
    }

    const next = points[Math.min(i + 1, pointsSize - 1) % pointsSize];
    if (prev && next) {
      point.controlPoint = getControlPoints(prev, point, next);
    }

    prev = point;
  }
}

export function getValueRatio(value: number, { min, max }: ValueEdge) {
  if (max === min) {
    return 0;
  }

  return (value - min) / (max - min);
}

export function getDistance(point1: Point, point2: Point) {
  return Math.sqrt((point2.x - point1.x) ** 2 + (point2.y - point1.y) ** 2);
}

export function getMaxLengthLabelWidth(labels: string[]) {
  const maxLengthLabel = labels.reduce((acc, cur) => (acc.length > cur.length ? acc : cur), '');

  return getTextWidth(maxLengthLabel);
}

export function getXPosition(
  axisData: LabelAxisData,
  offsetSize: number,
  value: number | string | Date,
  dataIndex: number
) {
  const { pointOnColumn, tickDistance, labelRange } = axisData;
  let x;

  if (labelRange) {
    const xValue = isString(value) ? Number(new Date(value)) : Number(value);
    const xValueRatio = getValueRatio(xValue, labelRange);
    x = xValueRatio * offsetSize;
  } else {
    x = tickDistance * dataIndex + (pointOnColumn ? tickDistance / 2 : 0);
  }

  return x;
}
