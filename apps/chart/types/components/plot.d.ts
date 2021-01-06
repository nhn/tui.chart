import { LineModel } from '@t/components/axis';
import { RectModel } from '@t/components/series';

export type PlotModels = {
  plot: Array<LineModel | RectModel>;
  line: LineModel[];
  band: RectModel[];
};
