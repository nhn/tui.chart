import { RectModel, CircleModel } from './series';
import { BubbleLabelModel, LabelModel, LineModel } from './axis';

type RadialAxisModels = {
  dot: RectModel[];
  verticalAxisLabel: BubbleLabelModel[];
  circularAxisLabel: LabelModel[];
  line: ArcModel[] | CircleModel[];
  tick: LineModel[];
};

type ArcModel = {
  type: 'arc';
  x: number;
  y: number;
  angle: { start: number; end: number };
  borderWidth: number;
  borderColor: string;
  drawingStartAngle: number;
  radius: number;
  clockwise: boolean;
};
