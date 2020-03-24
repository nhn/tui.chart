import { StoreModule } from '@t/store/store';

// seriesDataModel 이 했던것 일부 여기로
const seriesData: StoreModule = {
  name: 'seriesData',
  state: () => ({
    series: {}
  }),
  action: {
    setSeriesData({ state }) {
      const seriesRaw = state.series;
      const disabledSeries = state.disabledSeries;

      const newSeriesData = {};

      Object.keys(seriesRaw).forEach(seriesName => {
        newSeriesData[seriesName] = {
          seriesCount: seriesRaw[seriesName].length,
          seriesGroupCount: seriesRaw[seriesName][0].data.length,
          data: seriesRaw[seriesName].filter(({ name }: any) => !disabledSeries.includes(name))
        };
      });

      this.extend(state.series, newSeriesData);
    },
    disableSeries({ state }, name: string) {
      state.disabledSeries.push(name);
      this.notify(state, 'disabledSeries');
    },
    enableSeries({ state }, name: string) {
      const index = state.disabledSeries.findIndex(disabled => disabled === name);
      state.disabledSeries.splice(index, 1);
      this.notify(state, 'disabledSeries');
    }
  },
  observe: {
    updateSeriesData() {
      this.dispatch('setSeriesData');
    }
  }
};

export default seriesData;
