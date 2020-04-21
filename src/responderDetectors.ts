import { Point, Rect } from '@t/options';
import { PathRectModel, CircleModel, RectModel } from '@t/components/series';
import { isUndefined } from '@src/helpers/utils';

type DetectorType = 'circle' | 'rect';

type ResponderDetectors = {
  [key in DetectorType]: Function;
};

export const responderDetectors: ResponderDetectors = {
  circle: (mousePosition: Point, model: CircleModel, componentRect: Rect) => {
    const { x, y } = mousePosition;
    const { x: modelX, y: modelY, style, detectionRadius } = model;
    const { x: compX, y: compY } = componentRect;
    const { radius } = style;

    const radiusAdjustment = isUndefined(detectionRadius) ? 10 : detectionRadius;

    return (
      Math.pow(x - (modelX + compX), 2) + Math.pow(y - (modelY + compY), 2) <
      Math.pow(radius + radiusAdjustment, 2)
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
  }
};
