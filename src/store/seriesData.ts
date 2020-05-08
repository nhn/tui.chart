import { StoreModule, ChartType } from '@t/store/store';
import {
  hasStackGrouped,
  makeStackData,
  makeStackGroupData,
  pickStackOption,
  initializeStack
} from '@src/helpers/series';
import { isBoxSeries, BoxType } from '@src/component/boxSeries';

// seriesDataModel 이 했던것 일부 여기로
const seriesData: StoreModule = {
  name: 'seriesData',
  state: () => ({
    series: {}
  }),
  initialize(state, options) {
    const { series } = state;

    Object.keys(state.series).forEach(seriesName => {
      const stackOption = pickStackOption(options);

      if (stackOption && isBoxSeries(seriesName as ChartType)) {
        series[seriesName as BoxType]!.stack = initializeStack(stackOption);
      }
    });
  },
  action: {
    setSeriesData({ state }) {
      const { series, disabledSeries } = state;
      const newSeriesData = {};

      Object.keys(series).forEach(seriesName => {
        const originSeriesData = series[seriesName];
        const seriesCount = originSeriesData.length;
        const seriesGroupCount = originSeriesData[0].data.length;
        const data = originSeriesData.filter(({ name }: any) => !disabledSeries.includes(name));

        newSeriesData[seriesName] = {
          seriesCount,
          seriesGroupCount,
          data
        };

        if (series[seriesName].stack) {
          newSeriesData[seriesName].stackData = hasStackGrouped(data)
            ? makeStackGroupData(data)
            : makeStackData(data);
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
