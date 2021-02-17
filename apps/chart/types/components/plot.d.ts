import { LineModel } from '../components/axis';
import { RectModel } from '../components/series';

export type PlotModels = {
  plot: Array<LineModel | RectModel>;
  line: LineModel[];
  band: RectModel[];
};
