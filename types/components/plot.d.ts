import { LineModel } from '@t/components/axis';
import { RectModel } from '@t/components/series';

export type PlotModels = {
  plot: LineModel[];
  line: LineModel[];
  band: RectModel[];
};
