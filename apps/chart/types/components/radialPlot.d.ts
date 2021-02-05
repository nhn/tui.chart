import { PolygonModel, CircleModel } from './series';
import { LineModel } from './axis';

export type RadarPlotModelType = PolygonModel[] | CircleModel[];

export type RadarPlotModels = {
  plot: RadarPlotModelType;
  line: LineModel[];
};
