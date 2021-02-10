import { PolygonModel, CircleModel } from './series';
import { LineModel } from './axis';

export type RadialPlotModelType = PolygonModel[] | CircleModel[] | ArcModel[];

export type RadialPlotModels = {
  plot: RadialPlotModelType;
  line: LineModel[];
};
