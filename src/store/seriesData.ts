import { StoreModule } from '@t/store/store';
import { getStackData } from '@src/helpers/series';

// seriesDataModel 이 했던것 일부 여기로
const seriesData: StoreModule = {
  name: 'seriesData',
  state: () => ({
    series: {}
  }),
  action: {
    setSeriesData({ state }) {
      const { series: seriesRaw, disabledSeries, ops } = state;
      const newSeriesData = {};

      Object.keys(seriesRaw).forEach(seriesName => {
        const seriesRawData = seriesRaw[seriesName];
        const seriesCount = seriesRawData.length;
        const seriesGroupCount = seriesRawData[0].data.length;
        const data = seriesRawData.filter(({ name }: any) => !disabledSeries.includes(name));

        newSeriesData[seriesName] = {
          seriesCount,
          seriesGroupCount,
          data
        };

        if (ops.stack) {
          newSeriesData[seriesName].stackData = getStackData(seriesRawData);
        }
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
