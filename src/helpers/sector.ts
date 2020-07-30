import { Point } from '@t/options';
import { SectorModel } from '@t/components/series';
import { pick } from '@src/helpers/utils';

type RadialAnchor = 'start' | 'center' | 'end';
type RadialPositionParam = {
  anchor: RadialAnchor;
  x: number;
  y: number;
  innerRadius: number;
  radius: number;
  startDegree: number;
  endDegree: number;
  rangeStartAngle: number;
};

export function makeAnchorPositionParam(anchor: RadialAnchor, model: SectorModel) {
  return {
    anchor,
    ...pick(
      model,
      'x',
      'y',
      'radius',
      'innerRadius',
      'startDegree',
      'endDegree',
      'rangeStartAngle'
    ),
  };
}

export function calculateDegreeToRadian(degree: number, rangeStartAngle = -90) {
  let result = 0;

  if (degree % 360 === 0) {
    result = (Math.PI / 180) * rangeStartAngle;
  } else if (degree >= 0 && degree < 360) {
    result = (Math.PI / 180) * (degree + rangeStartAngle);
  }

  return result;
}

export function calculateRadianToDegree(radian: number, rangeStartAngle = -90) {
  return ((radian * 180) / Math.PI - rangeStartAngle + 360) % 360;
}

export function getRadialAnchorPosition(param: RadialPositionParam): Point {
  const { anchor, x, y, innerRadius, radius, startDegree, endDegree, rangeStartAngle } = param;
  const degree = startDegree + (endDegree - startDegree) / 2;
  const radian = calculateDegreeToRadian(degree, rangeStartAngle);
  const r = anchor === 'center' ? (radius - innerRadius) / 2 + innerRadius : radius;

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
