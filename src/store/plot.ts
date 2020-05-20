import { StoreModule, PlotLine } from '@t/store/store';
import { hasBoxSeries } from './axes';
import { isLabelAxisOnYAxis } from '@src/helpers/axes';

const plot: StoreModule = {
  name: 'plot',
  state: () => ({
    plot: {}
  }),
  action: {
    setPlot({ state }) {
      const { options, series } = state;
      const plotLines = options.plot?.lines || [];
      const lines: PlotLine[] = plotLines.map(({ color, value }) => ({
        value,
        color,
        vertical: true
      }));

      if (hasBoxSeries(series)) {
        lines.push({ value: 0, color: 'rgba(0, 0, 0, 0.5)', vertical: isLabelAxisOnYAxis(series) });
      }

      this.extend(state.plot, { lines });
    }
  },
  observe: {
    updatePlot() {
      this.dispatch('setPlot');
    }
  }
};

export default plot;
