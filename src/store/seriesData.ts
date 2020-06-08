import { StoreModule, SeriesTypes, SeriesRaw, Series } from '@t/store/store';
import { extend } from '@src/store/store';

import { sortSeries, sortCategories } from '@src/helpers/utils';

function makeCategories(series: SeriesRaw) {
  const categories: Set<string> = new Set();

  Object.keys(series).forEach((key) => {
    series[key].forEach(({ data }) => {
      data.forEach((datum) => {
        categories.add(Array.isArray(datum) ? String(datum[0]) : String(datum.x));
      });
    });
  });

  return Array.from(categories).sort(sortCategories);
}

function makeInitSeries(series: SeriesRaw) {
  const result: Series = {};

  Object.keys(series).forEach((key) => {
    result[key] = series[key].map(({ name, data }) => ({
      name,
      data: key === 'line' ? data.sort(sortSeries) : data,
    }));
  });

  return result;
}

// seriesDataModel 이 했던것 일부 여기로
const seriesData: StoreModule = {
  name: 'seriesData',
  state: ({ series, categories }) => ({
    series: makeInitSeries(series),
    categories: categories ? categories : makeCategories(series),
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
