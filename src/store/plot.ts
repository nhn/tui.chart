import { StoreModule, PlotLine } from '@t/store/store';
import { isLabelAxisOnYAxis, isBoxTypeChart } from '@src/helpers/axes';
import { extend } from '@src/store/store';
import { BoxSeriesOptions } from '@t/options';

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

      if (isBoxTypeChart(series) && !(options.series as BoxSeriesOptions)?.diverging) {
        lines.push({ value: 0, color: 'rgba(0, 0, 0, 0.5)', vertical: isLabelAxisOnYAxis(series) });
      }

      extend(state.plot, { lines });
    }
  },
  observe: {
    updatePlot() {
      this.dispatch('setPlot');
    }
  }
};

export default plot;
