import { Point, Rect } from '@t/options';
import {
  PathRectModel,
  RectModel,
  CircleResponderModel,
  SectorResponderModel,
  BoxPlotResponderModel,
} from '@t/components/series';
import { isUndefined } from '@src/helpers/utils';
import { calculateRadianToDegree, withinRadian } from '@src/helpers/sector';
import { LineModel } from '@t/components/axis';

type DetectorType = 'circle' | 'rect' | 'sector' | 'boxPlot' | 'line';

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
  line: (
    mousePosition: Point,
    model: LineModel,
    componentRect: Rect = { x: 0, y: 0, width: 0, height: 0 }
  ) => {
    const { x, y } = mousePosition;
    const { x: compX, y: compY } = componentRect;
    const { x: modelX, y: modelY, x2, y2 } = model;

    const numerator = y2 - modelY;
    const denominator = x2 - modelX;
    const detectionDistance = 3;
    let result = false;

    if (numerator === 0) {
      // y = a
      const minX = Math.min(modelX, x2);
      const maxX = Math.max(modelX, x2);

      result =
        x - compX >= minX &&
        x - compX <= maxX &&
        y >= modelY + compY - detectionDistance &&
        y <= modelY + compY + detectionDistance;
    } else if (denominator === 0) {
      // x = a
      const minY = Math.min(modelY, y2);
      const maxY = Math.max(modelY, y2);

      result =
        y - compY >= minY &&
        y - compY <= maxY &&
        x >= modelX + compX - detectionDistance &&
        x <= modelX + compX + detectionDistance;
    } else {
      // y = ax + b
      const slope = numerator / denominator;
      const xPos = x - (modelX + compX);
      const yPos = y - (modelY + compY);

      result = slope * xPos === yPos;
    }

    return result;
  },
  boxPlot: (
    mousePosition: Point,
    model: BoxPlotResponderModel,
    componentRect: Rect = { x: 0, y: 0, width: 0, height: 0 }
  ) => {
    return ['box', 'median', 'minimum', 'maximum', 'whisker'].some((prop) =>
      prop === 'box'
        ? responderDetectors.rect(mousePosition, model[prop], componentRect)
        : responderDetectors.line(mousePosition, model[prop], componentRect)
    );
  },
};
