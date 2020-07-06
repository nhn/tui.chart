import { StoreModule, PlotLine } from '@t/store/store';
import { extend } from '@src/store/store';

const plot: StoreModule = {
  name: 'plot',
  state: () => ({
    plot: {},
  }),
  action: {
    setPlot({ state }) {
      const { options } = state;
      const plotLines = options.plot?.lines || [];
      const lines: PlotLine[] = plotLines.map(({ color, value }) => ({
        value,
        color,
        vertical: true,
      }));

      extend(state.plot, { lines });
    },
  },
  observe: {
    updatePlot() {
      this.dispatch('setPlot');
    },
  },
};

export default plot;
