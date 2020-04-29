import { StoreModule } from '@t/store/store';
import { pickProperty, isObject } from '@src/helpers/utils';
import { getStackData } from '@src/helpers/series';
import { StackInfo } from '@t/options';

// seriesDataModel 이 했던것 일부 여기로
const seriesData: StoreModule = {
  name: 'seriesData',
  state: () => ({
    series: {}
  }),
  initialize(options, state) {
    const { series } = state;

    Object.keys(state.series).forEach(seriesName => {
      const stackOption = pickProperty(options, ['series', 'stack']);
      const defaultStackOption = {
        type: 'normal',
        connector: false
      } as StackInfo;
      const isBox = ['column', 'bar'].indexOf(seriesName) > -1;

      if (stackOption && isBox) {
        series[seriesName].stack = isObject(stackOption)
          ? Object.assign({}, defaultStackOption, stackOption)
          : defaultStackOption;
      }
    });
  },
  action: {
    setSeriesData({ state }) {
      const { series, disabledSeries } = state;
      const newSeriesData = {};

      Object.keys(series).forEach(seriesName => {
        const seriesRawData = series[seriesName];
        const seriesCount = seriesRawData.length;
        const seriesGroupCount = seriesRawData[0].data.length;
        const data = seriesRawData.filter(({ name }: any) => !disabledSeries.includes(name));

        newSeriesData[seriesName] = {
          seriesCount,
          seriesGroupCount,
          data
        };

        if (series[seriesName].stack) {
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
