import { StoreModule, ChartType } from '@t/store/store';
import { pickProperty, isObject } from '@src/helpers/utils';
import { hasStackGrouped, getStackData, getStackGroupData } from '@src/helpers/series';
import { StackInfo } from '@t/options';
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
      const stackOption = pickProperty(options, ['series', 'stack']);
      const defaultStackOption = {
        type: 'normal',
        connector: false
      } as StackInfo;

      if (stackOption && isBoxSeries(seriesName as ChartType)) {
        series[seriesName as BoxType]!.stack = isObject(stackOption)
          ? { ...defaultStackOption, ...stackOption }
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
          newSeriesData[seriesName].stackData = hasStackGrouped(seriesRawData)
            ? getStackGroupData(seriesRawData)
            : getStackData(seriesRawData);
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
