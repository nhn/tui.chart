import { ValueEdge } from '@t/store/store';
import * as arrayUtil from '@src/helpers/arrayUtil';
import { range, isInteger } from '@src/helpers/utils';

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

export function crispPixel(pixel: number, thickness = 1) {
  const halfThickness = thickness / 2;

  return thickness % 2
    ? (isInteger(pixel) ? pixel : Math.round(pixel - halfThickness)) + halfThickness
    : Math.round(pixel);
}

// export function splineCurve(prev: Point, cur: Point, next: Point) {
//   const TENSION = 0.5;
//   const controlPoint = prev;
//
//   // pointsModel.forEach(value => {
//   //   console.log(value);
//   // });
//   //
//   return { prev: { x: 1, y: 1 }, next: { x: 1, y: 1 } };
// }

// export function splineCurve(prev, cur, next) {
//   // http://scaledinnovation.com/analytics/splines/aboutSplines.html
//
//   const TENSION = 0.333;
//
//   const d01 = Math.sqrt(Math.pow(cur.x - prev.x, 2) + Math.pow(cur.y - prev.y, 2));
//   const d12 = Math.sqrt(Math.pow(next.x - cur.x, 2) + Math.pow(next.y - cur.y, 2));
//
//   let s01 = d01 / (d01 + d12);
//   let s12 = d12 / (d01 + d12);
//
//   // If all points are the same, s01 & s02 will be inf
//   s01 = isNaN(s01) ? 0 : s01;
//   s12 = isNaN(s12) ? 0 : s12;
//
//   const fa = TENSION * s01;
//   const fb = TENSION * s12;
//
//   return {
//     prev: {
//       x: cur.x - fa * (next.x - prev.x),
//       y: cur.y - fa * (next.y - prev.y)
//     },
//     next: {
//       x: cur.x + fb * (next.x - prev.x),
//       y: cur.y + fb * (next.y - prev.y)
//     }
//   };
// }

function getControlPoints({ x: x0, y: y0 }, { x: x1, y: y1 }, { x: x2, y: y2 }) {
  const t = 0.333;

  const d12 = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  const d01 = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
  const fa = (t * d01) / (d01 + d12); // scaling factor for triangle Ta
  const fb = (t * d12) / (d01 + d12); // ditto for Tb, simplifies to fb=t-fa
  const p1x = x1 - fa * (x2 - x0); // x2-x0 is the width of triangle T
  const p1y = y1 - fa * (y2 - y0); // y2-y0 is the height of T
  const p2x = x1 + fb * (x2 - x0);
  const p2y = y1 + fb * (y2 - y0);

  return [p1x, p1y, p2x, p2y];
}

// export function updateSplineCurve(points) {
//   const pointsSize = points.length;
//   let prev = points[0];
//
//   for (let i = 0; i < pointsSize; i += 1) {
//     const point = points[i];
//
//     const controlPoints = splineCurve(
//       prev,
//       point,
//       points[Math.min(i + 1, pointsSize - 1) % pointsSize]
//     );
//
//     point.cppx = controlPoints.prev.x;
//     point.cppy = controlPoints.prev.y;
//     point.cpnx = controlPoints.next.x;
//     point.cpny = controlPoints.next.y;
//     prev = point;
//   }
// }

export function updateSplineCurve(points) {
  const pointsSize = points.length;
  let prev = points[0];

  for (let i = 0; i < pointsSize; i += 1) {
    const point = points[i];

    const controlPoints = getControlPoints(
      prev,
      point,
      points[Math.min(i + 1, pointsSize - 1) % pointsSize]
    );

    point.cppx = controlPoints[0];
    point.cppy = controlPoints[1];
    point.cpnx = controlPoints[2];
    point.cpny = controlPoints[3];
    prev = point;
  }
}
