import { Point, Rect } from '../types/options';
import { PathRectModel, CircleModel } from '../types/components/series';

type DetectorType = 'circle' | 'rect';

type ResponderDetectors = {
  [key in DetectorType]: Function;
};

export const responderDetectors: ResponderDetectors = {
  circle: (mousePosition: Point, model: CircleModel, componentRect: Rect) => {
    const { x, y, radius } = model;

    const radiusAdjustment = 10;

    return (
      Math.pow(mousePosition.x - (x + componentRect.x), 2) +
        Math.pow(mousePosition.y - (y + componentRect.y), 2) <
      Math.pow(radius + radiusAdjustment, 2)
    );
  },
  rect: (mousePosition: Point, model: PathRectModel) => {
    const { x, y, width, height } = model;

    return (
      mousePosition.x >= x &&
      mousePosition.x <= x + width &&
      mousePosition.y >= y &&
      mousePosition.y <= y + height
    );
  }
};
