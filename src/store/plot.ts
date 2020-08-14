import { StoreModule } from '@t/store/store';

const plot: StoreModule = {
  name: 'plot',
  state: () => ({
    plot: {
      lines: [],
      bands: [],
    },
  }),
  action: {
    setPlot() {
      // @TODO : lines, bands 옵션 처리 필요
      /*
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
      */
    },
  },
  observe: {
    updatePlot() {
      this.dispatch('setPlot');
    },
  },
};

export default plot;
