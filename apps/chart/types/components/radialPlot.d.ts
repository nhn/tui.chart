import { PolygonModel, CircleModel, SectorModel } from './series';
import { LineModel } from './axis';
import { ArcModel } from './radialAxis';

export type RadialPlotModelType = PolygonModel[] | CircleModel[] | ArcModel[];

export type RadialPlotModels = {
  plot: RadialPlotModelType;
  line: LineModel[];
  band: SectorModel[];
};
