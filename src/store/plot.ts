import { StoreModule, PlotLine } from '@t/store/store';
import { isLabelAxisOnYAxis, hasBoxTypeSeries } from '@src/helpers/axes';
import { extend } from '@src/store/store';
import { hasNegative } from '@src/helpers/utils';

const plot: StoreModule = {
  name: 'plot',
  state: () => ({
    plot: {},
  }),
  action: {
    setPlot({ state }) {
      const { options, series, axes } = state;
      const plotLines = options.plot?.lines || [];
      const lines: PlotLine[] = plotLines.map(({ color, value }) => ({
        value,
        color,
        vertical: true,
      }));

      if (needZeroLine(series, axes)) {
        lines.push({
          value: 0,
          color: 'rgba(0, 0, 0, 0.5)',
          vertical: isLabelAxisOnYAxis(series),
        });
      }

      extend(state.plot, { lines });
    },
  },
  observe: {
    updatePlot() {
      this.dispatch('setPlot');
    },
  },
};

function needZeroLine(series, axes) {
  if (!hasBoxTypeSeries(series)) {
    return false;
  }

  const valueAxisName = isLabelAxisOnYAxis(series) ? 'xAxis' : 'yAxis';

  return hasNegative(axes[valueAxisName]?.labels);
}

export default plot;
