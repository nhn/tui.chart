import { LabelModel } from './axis';
import { RectModel, PolygonModel, CircleModel } from './series';

export type RadarPlotModelType = PolygonModel[] | CircleModel[];

export type RadarPlotModels = {
  plot: RadarPlotModelType;
  dot: RectModel[];
  label: LabelModel[];
};
