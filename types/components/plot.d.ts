import { LineModel } from '@t/components/axis';
import { RectModel } from '@t/components/series';
import { ValueOf, ChartOptionsMap } from '@t/store/store';

export type PlotModels = {
  plot: LineModel[];
  line: LineModel[];
  band: RectModel[];
};

type UsingShowLineOptions = ValueOf<Omit<ChartOptionsMap, 'radar' | 'pie'>>;
