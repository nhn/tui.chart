import { RectModel } from './series';
import { BubbleLabelModel, LabelModel } from './axis';

type RadialAxisModels = {
  dot: RectModel[];
  verticalAxisLabel: BubbleLabelModel[];
  circularAxisLabel: LabelModel[];
};

type ArcModel = {
  x: number;
  y: number;
  angle: { start: number; end: number };
  borderWidth: number;
  borderColor: string;
  drawingStartAngle: number;
  radius: number;
  clockwise: boolean;
};
