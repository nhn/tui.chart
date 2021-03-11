import { calculateDegreeToRadian, getRadialPosition, getValidDegree } from '@src/helpers/sector';
import { ClockHandModel } from '@t/components/series';
import { circle } from './basic';
import { polygon } from './polygon';

function getClockHandPoints(model: ClockHandModel) {
  const { x, y, x2, y2, degree, baseLine } = model;
  const halfBaseLine = baseLine / 2;
  let startPoint, endPoint;
  if (x === x2) {
    // x = a;
    startPoint = { x: x - halfBaseLine, y };
    endPoint = { x: x + halfBaseLine, y };
  } else if (y === y2) {
    // y = a;
    startPoint = { x, y: y - halfBaseLine };
    endPoint = { x, y: y + halfBaseLine };
  } else {
    startPoint = getRadialPosition(
      x,
      y,
      halfBaseLine,
      calculateDegreeToRadian(getValidDegree(degree + 90))
    );
    endPoint = getRadialPosition(
      x,
      y,
      halfBaseLine,
      calculateDegreeToRadian(getValidDegree(degree - 90))
    );
  }

  return [startPoint, { x: x2, y: y2 }, endPoint];
}

export function clockHand(ctx: CanvasRenderingContext2D, model: ClockHandModel) {
  const {
    color,
    x,
    y,
    pin: { color: pinColor, borderColor, borderWidth, radius },
  } = model;

  circle(ctx, {
    type: 'circle',
    x,
    y,
    radius,
    color: pinColor,
    borderWidth,
    borderColor,
  });

  polygon(ctx, {
    type: 'polygon',
    color,
    lineWidth: 1,
    fillColor: color,
    points: getClockHandPoints(model),
  });
}
