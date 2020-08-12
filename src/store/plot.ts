import { StoreModule, PlotLine, PlotBand } from '@t/store/store';
import { extend } from '@src/store/store';
import { AreaLinePlotOptions } from '@t/options';

const plot: StoreModule = {
  name: 'plot',
  state: () => ({
    plot: {
      lines: [],
      bands: [],
    },
  }),
  action: {
    setPlot({ state }) {
      const { series, options } = state;

      if (!(series.area || series.line)) {
        return;
      }

      const plotLines = (options.plot as AreaLinePlotOptions)?.lines || [];
      const plotBands = (options.plot as AreaLinePlotOptions)?.bands || [];

      const lines: PlotLine[] = plotLines.map(({ color, value }) => ({
        value,
        color,
        vertical: true,
      }));

      const bands: PlotBand[] = plotBands.map(({ color, range }) => ({
        range,
        color,
        vertical: true,
      }));

      extend(state.plot, { lines, bands });
    },
  },
  observe: {
    updatePlot() {
      this.dispatch('setPlot');
    },
  },
};

export default plot;
