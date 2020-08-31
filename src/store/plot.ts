import { StoreModule, Options } from '@t/store/store';
import { LineChartOptions, AreaChartOptions, PlotLine, PlotBand, PlotRange } from '@t/options';
import { extend } from './store';
import { getDateFormat, formatDate } from '@src/helpers/formatDate';

function makeFormattedLabel(label: number | string, options: Options) {
  const format = getDateFormat(options);

  return format ? (formatDate(format, new Date(label)) as string) : label;
}

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

      const lineAreaOptions = options as LineChartOptions | AreaChartOptions;

      const plotLines = lineAreaOptions?.plot?.lines ?? [];
      const plotBands = lineAreaOptions?.plot?.bands ?? [];

      const lines: PlotLine[] = plotLines.map(({ color, value }) => ({
        value: makeFormattedLabel(value, options),
        color,
        vertical: true,
      }));

      const bands: PlotBand[] = plotBands.map(({ color, range }) => ({
        range: range.map((rangeData) => makeFormattedLabel(rangeData, options)) as PlotRange,
        color,
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
