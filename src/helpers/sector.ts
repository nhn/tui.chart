import { Point } from '@t/options';
import { SectorModel } from '@t/components/series';
import { pick } from '@src/helpers/utils';

type RadialAnchor = 'start' | 'center' | 'end';
type RadialPositionParam = {
  anchor: RadialAnchor;
  x: number;
  y: number;
  radius: {
    inner: number;
    outer: number;
  };
  degree: {
    start: number;
    end: number;
  };
  drawingStartAngle: number;
};

export function makeAnchorPositionParam(anchor: RadialAnchor, model: SectorModel) {
  return {
    anchor,
    ...pick(model, 'x', 'y', 'radius', 'degree', 'drawingStartAngle'),
  };
}

export function calculateDegreeToRadian(degree: number, drawingStartAngle = -90) {
  let result = 0;

  if (degree % 360 === 0) {
    result = (Math.PI / 180) * drawingStartAngle;
  } else if (degree >= 0 && degree < 360) {
    result = (Math.PI / 180) * (degree + drawingStartAngle);
  }

  return result;
}

export function calculateRadianToDegree(radian: number, drawingStartAngle = -90) {
  return ((radian * 180) / Math.PI - drawingStartAngle + 360) % 360;
}

export function getRadialAnchorPosition(param: RadialPositionParam): Point {
  const {
    anchor,
    x,
    y,
    radius: { inner, outer },
    degree: { start, end },
    drawingStartAngle,
  } = param;
  const halfDegree = start + (end - start) / 2;
  const radian = calculateDegreeToRadian(halfDegree, drawingStartAngle);
  const r = anchor === 'center' ? (outer - inner) / 2 + inner : outer;

  return getRadialPosition(x, y, r, radian);
}

export function getRadialPosition(x: number, y: number, r: number, radian: number) {
  return { x: x + r * Math.cos(radian), y: y + r * Math.sin(radian) };
}

export function withinRadian(
  clockwise: boolean,
  startDegree: number,
  endDegree: number,
  currentDegree: number
) {
  return clockwise
    ? startDegree <= currentDegree && endDegree >= currentDegree
    : startDegree >= currentDegree && endDegree <= currentDegree;
}
