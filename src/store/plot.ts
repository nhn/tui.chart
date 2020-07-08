import { StoreModule, PlotLine, PlotBand } from '@t/store/store';
import { extend } from '@src/store/store';

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
      const { options } = state;
      const plotLines = options.plot?.lines || [];
      const plotBands = options.plot?.bands || [];
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
