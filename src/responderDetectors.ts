import { Point, Rect } from '@t/options';
import {
  PathRectModel,
  RectModel,
  CircleResponderModel,
  SectorResponderModel,
} from '@t/components/series';
import { isUndefined } from '@src/helpers/utils';
import { calculateRadianToDegree, withinRadian } from '@src/helpers/sector';

type DetectorType = 'circle' | 'rect' | 'sector';

type ResponderDetectors = {
  [key in DetectorType]: Function;
};

export const responderDetectors: ResponderDetectors = {
  circle: (mousePosition: Point, model: CircleResponderModel, componentRect: Rect) => {
    const { x, y } = mousePosition;
    const { x: modelX, y: modelY, radius, detectionRadius } = model;
    const { x: compX, y: compY } = componentRect;

    const radiusAdjustment = isUndefined(detectionRadius) ? 10 : detectionRadius;

    return (
      (x - (modelX + compX)) ** 2 + (y - (modelY + compY)) ** 2 < (radius + radiusAdjustment) ** 2
    );
  },
  rect: (
    mousePosition: Point,
    model: PathRectModel | RectModel,
    componentRect: Rect = { x: 0, y: 0, width: 0, height: 0 }
  ) => {
    const { x, y } = mousePosition;
    const { x: modelX, y: modelY, width, height } = model;
    const { x: compX, y: compY } = componentRect;

    return (
      x >= modelX + compX &&
      x <= modelX + compX + width &&
      y >= modelY + compY &&
      y <= modelY + compY + height
    );
  },
  sector: (
    mousePosition: Point,
    model: SectorResponderModel,
    componentRect: Rect = { x: 0, y: 0, width: 0, height: 0 }
  ) => {
    const { x, y } = mousePosition;
    const {
      x: modelX,
      y: modelY,
      radius: { outer, inner },
      degree: { start, end },
      drawingStartAngle,
      clockwise,
    } = model;
    const { x: compX, y: compY } = componentRect;
    const xPos = x - (modelX + compX);
    const yPos = y - (modelY + compY);
    const insideOuterRadius = xPos ** 2 + yPos ** 2 < outer ** 2;
    const outsideInnerRadius = xPos ** 2 + yPos ** 2 > inner ** 2;
    const withinRadius = insideOuterRadius && outsideInnerRadius;
    const detectionDegree = calculateRadianToDegree(Math.atan2(yPos, xPos), drawingStartAngle);

    return withinRadius && withinRadian(clockwise, start, end, detectionDegree);
  },
};
