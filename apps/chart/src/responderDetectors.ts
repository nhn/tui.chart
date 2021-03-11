import { Point, Rect } from '@t/options';
import {
  PathRectModel,
  RectModel,
  CircleResponderModel,
  SectorResponderModel,
  BoxPlotResponderModel,
  LineResponderModel,
  ClockHandResponderModel,
} from '@t/components/series';
import { isUndefined } from '@src/helpers/utils';
import { calculateRadianToDegree, withinRadian } from '@src/helpers/sector';

type DetectorType = 'circle' | 'rect' | 'sector' | 'boxPlot' | 'line' | 'clockHand';

type ResponderDetectors = {
  [key in DetectorType]: Function;
};

function withinRotationRect({
  slope,
  yIntercept,
  mouseX,
  mouseY,
  modelX,
  modelX2,
  compX,
  compY,
  detectionSize = 0,
}: {
  slope: number;
  yIntercept: number;
  mouseX: number;
  mouseY: number;
  modelX: number;
  modelX2: number;
  compX: number;
  compY: number;
  detectionSize: number;
}) {
  const posY = slope * mouseX + yIntercept;
  const withinRadius =
    (modelX > modelX2 && mouseX >= compX + modelX2 && mouseX <= compX + modelX) ||
    (modelX < modelX2 && modelX2 <= compX + modelX2 && modelX2 >= compX + modelX);
  const withinDetectionSize =
    posY - detectionSize + compY <= mouseY && mouseY <= posY + detectionSize + compY;

  return withinRadius && withinDetectionSize;
}

export const responderDetectors: ResponderDetectors = {
  circle: (mousePosition: Point, model: CircleResponderModel, componentRect: Rect) => {
    const { x, y } = mousePosition;
    const { x: modelX, y: modelY, radius, detectionSize } = model;
    const { x: compX, y: compY } = componentRect;

    const radiusAdjustment = isUndefined(detectionSize) ? 10 : detectionSize;

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
    model: LineResponderModel,
    componentRect: Rect = { x: 0, y: 0, width: 0, height: 0 }
  ) => {
    const { x, y } = mousePosition;
    const { x: compX, y: compY } = componentRect;
    const { x: modelX, y: modelY, x2, y2, detectionSize = 3 } = model;

    const numerator = y2 - modelY;
    const denominator = x2 - modelX;
    let result = false;

    if (numerator === 0) {
      // y = a
      const minX = Math.min(modelX, x2);
      const maxX = Math.max(modelX, x2);

      result =
        x - compX >= minX &&
        x - compX <= maxX &&
        y >= modelY + compY - detectionSize &&
        y <= modelY + compY + detectionSize;
    } else if (denominator === 0) {
      // x = a
      const minY = Math.min(modelY, y2);
      const maxY = Math.max(modelY, y2);

      result =
        y - compY >= minY &&
        y - compY <= maxY &&
        x >= modelX + compX - detectionSize &&
        x <= modelX + compX + detectionSize;
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
    return ['rect', 'median', 'minimum', 'maximum', 'upperWhisker', 'lowerWhisker'].some((prop) => {
      if (!model[prop]) {
        return false;
      }

      return prop === 'rect'
        ? responderDetectors.rect(mousePosition, model[prop], componentRect)
        : responderDetectors.line(mousePosition, model[prop], componentRect);
    });
  },
  clockHand: (
    mousePosition: Point,
    model: ClockHandResponderModel,
    componentRect: Rect = { x: 0, y: 0, width: 0, height: 0 }
  ) => {
    const { x, y } = mousePosition;
    const { x: compX, y: compY } = componentRect;
    const { x: centerX, y: centerY, x2, y2, detectionSize = 5 } = model;

    const numerator = y2 - centerY;
    const denominator = x2 - centerX;
    let result = false;

    if (numerator === 0) {
      // y = a
      const minX = Math.min(centerX, x2);
      const maxX = Math.max(centerX, x2);

      result =
        x - compX >= minX &&
        x - compX <= maxX &&
        y >= centerY + compY - detectionSize &&
        y <= centerY + compY + detectionSize;
    } else if (denominator === 0) {
      // x = a
      const minY = Math.min(centerY, y2);
      const maxY = Math.max(centerY, y2);

      result =
        y - compY >= minY &&
        y - compY <= maxY &&
        x >= centerX + compX - detectionSize &&
        x <= centerX + compX + detectionSize;
    } else {
      // y = ax + b
      const slope = numerator / denominator;
      const yIntercept = centerY - slope * centerX;

      result = withinRotationRect({
        slope,
        yIntercept,
        mouseX: x,
        mouseY: y,
        modelX: centerX,
        modelX2: x2,
        compX,
        compY,
        detectionSize,
      });
    }

    return result;
  },
};
