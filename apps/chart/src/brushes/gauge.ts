import {
  calculateDegreeToRadian,
  getRadialPosition,
  calculateValidAngle,
} from '@src/helpers/sector';
import { ClockHandModel } from '@t/components/series';
import { circle } from '@src/brushes/basic';
import { polygon } from '@src/brushes/polygon';

function getClockHandPoints(model: ClockHandModel) {
  const { x, y, x2, y2, degree, baseLine } = model;
  const halfBaseLine = baseLine / 2;
  let startPoint, endPoint;
  if (x === x2) {
    startPoint = { x: x - halfBaseLine, y };
    endPoint = { x: x + halfBaseLine, y };
  } else if (y === y2) {
    startPoint = { x, y: y - halfBaseLine };
    endPoint = { x, y: y + halfBaseLine };
  } else {
    startPoint = getRadialPosition(
      x,
      y,
      halfBaseLine,
      calculateDegreeToRadian(calculateValidAngle(degree + 90))
    );
    endPoint = getRadialPosition(
      x,
      y,
      halfBaseLine,
      calculateDegreeToRadian(calculateValidAngle(degree - 90))
    );
  }

  return [startPoint, { x: x2, y: y2 }, endPoint];
}

export function clockHand(ctx: CanvasRenderingContext2D, model: ClockHandModel) {
  const {
    color,
    x,
    y,
    pin: { color: pinColor, radius, style },
  } = model;

  circle(ctx, {
    type: 'circle',
    x,
    y,
    radius,
    color: pinColor,
    style,
  });

  polygon(ctx, {
    type: 'polygon',
    color,
    lineWidth: 1,
    fillColor: color,
    points: getClockHandPoints(model),
  });
}