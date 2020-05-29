import { StoreModule, SeriesTypes } from '@t/store/store';
import { extend } from '@src/store/store';

// seriesDataModel 이 했던것 일부 여기로
const seriesData: StoreModule = {
  name: 'seriesData',
  state: () => ({
    series: {},
  }),
  action: {
    setSeriesData({ state }) {
      const { series, disabledSeries } = state;
      const newSeriesData = {};

      Object.keys(series).forEach((seriesName) => {
        const originSeriesData = series[seriesName];
        const seriesCount = originSeriesData.length;
        const seriesGroupCount = originSeriesData[0].data.length;
        const data = originSeriesData.filter(
          ({ name }: SeriesTypes) => !disabledSeries.includes(name)
        );

        newSeriesData[seriesName] = {
          seriesCount,
          seriesGroupCount,
          data,
        };
      });

      extend(state.series, newSeriesData);
    },
    disableSeries({ state }, name: string) {
      state.disabledSeries.push(name);
      this.notify(state, 'disabledSeries');
    },
    enableSeries({ state }, name: string) {
      const index = state.disabledSeries.findIndex((disabled) => disabled === name);
      state.disabledSeries.splice(index, 1);
      this.notify(state, 'disabledSeries');
    },
  },
  observe: {
    updateSeriesData() {
      this.dispatch('setSeriesData');
    },
  },
};

export default seriesData;
