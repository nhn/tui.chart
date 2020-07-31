import { Point } from '@t/options';

type RadialAnchor = 'start' | 'center' | 'end';
type RadialPositionParam = {
  anchor: RadialAnchor;
  x: number;
  y: number;
  innerRadius: number;
  radius: number;
  startDegree: number;
  endDegree: number;
};

export function calculateDegreeToRadian(degree: number) {
  let result = 0;

  if (degree % 360 === 0) {
    result = (Math.PI / 180) * -90;
  } else if (degree >= 0 && degree < 360) {
    result = (Math.PI / 180) * (degree - 90);
  }

  return result;
}

export function calculateRadianToDegree(radian: number) {
  return ((radian * 180) / Math.PI + 90 + 360) % 360;
}

export function getRadialAnchorPosition(param: RadialPositionParam): Point {
  const { anchor, x, y, innerRadius, radius, startDegree, endDegree } = param;
  const degree = startDegree + (endDegree - startDegree) / 2;
  const radian = calculateDegreeToRadian(degree);
  const r = anchor === 'center' ? (radius - innerRadius) / 2 + innerRadius : radius;

  return getRadialPosition(x, y, r, radian);
}

export function getRadialPosition(x: number, y: number, r: number, radian: number) {
  return { x: x + r * Math.cos(radian), y: y + r * Math.sin(radian) };
}
