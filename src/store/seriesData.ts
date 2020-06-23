import { StoreModule, SeriesRaw, Series } from '@t/store/store';
import { extend } from '@src/store/store';

import { sortSeries } from '@src/helpers/utils';
import layout from './layout';

function makeInitSeries(series: SeriesRaw) {
  const result: Series = {};

  Object.keys(series).forEach((key) => {
    result[key] = series[key].map((raw: any) => {
      const seriesData = raw;

      if (key === 'line') {
        seriesData.data = raw.data.sort(sortSeries);
      }

      return seriesData;
    });
  });

  return result;
}

const seriesData: StoreModule = {
  name: 'seriesData',
  state: ({ series }) => ({
    series: makeInitSeries(series),
    disabledSeries: [],
  }),
  action: {
    setSeriesData({ state }) {
      const { series, disabledSeries, theme } = state;
      const newSeriesData = {};
      const { colors } = theme.series;

      Object.keys(series).forEach((seriesName) => {
        const originSeriesData = series[seriesName].map((m, idx) => ({ ...m, color: colors[idx] }));
        const seriesCount = originSeriesData.length;
        const seriesGroupCount = originSeriesData[0].data.length;
        const data = originSeriesData.filter(({ name }) => !disabledSeries.includes(name));

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
