import { Point } from '@t/options';

type RadialType = 'start' | 'center' | 'end';
type RadialPositionParam = {
  type: RadialType;
  x: number;
  y: number;
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
  return (radian * 180) / Math.PI + 90;
}

export function getRadialPosition(param: RadialPositionParam): Point {
  const { type, x, y, radius, startDegree, endDegree } = param;
  const degree = startDegree + (endDegree - startDegree) / 2;
  const radian = calculateDegreeToRadian(degree);

  let posX: number = x;
  let posY: number = y;

  if (type === 'center') {
    const halfRadius = radius / 2;
    posX = x + halfRadius * Math.cos(radian);
    posY = y + halfRadius * Math.sin(radian);
  } else if (type === 'end') {
    posX = x + radius * Math.cos(radian);
    posY = y + radius * Math.sin(radian);
  }

  return { x: posX, y: posY };
}
