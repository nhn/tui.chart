import { PlotLine, PlotBand, GaugePlotBand } from '@t/options';
import { isUndefined } from './utils';

export function isExistPlotId<T extends PlotLine | PlotBand | GaugePlotBand>(plots: T[], data: T) {
  return plots.some(
    ({ id: bandId }) => !isUndefined(bandId) && !isUndefined(data.id) && bandId === data.id
  );
}
