import { Point, Rect } from '@t/options';
import { PathRectModel, RectModel, CircleResponderModel } from '@t/components/series';
import { isUndefined } from '@src/helpers/utils';
import { LegendResponderModel } from '@t/components/legend';
import { CHECKBOX_SIZE } from '@src/brushes/legend';

type DetectorType = 'circle' | 'rect' | 'legendCheckbox' | 'legendLabel';

type ResponderDetectors = {
  [key in DetectorType]: Function;
};

export const responderDetectors: ResponderDetectors = {
  legendLabel: (mousePosition: Point, model: LegendResponderModel) => {
    const { x, y } = mousePosition;
    const { x: modelX, y: modelY, width: modelWidth } = model;

    return x >= modelX && x <= modelX + modelWidth! && y >= modelY && y <= modelY + CHECKBOX_SIZE;
  },
  legendCheckbox: (mousePosition: Point, model: LegendResponderModel) => {
    const { x, y } = mousePosition;
    const { x: modelX, y: modelY } = model;

    return x >= modelX && x <= modelX + CHECKBOX_SIZE && y >= modelY && y <= modelY + CHECKBOX_SIZE;
  },
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
};
