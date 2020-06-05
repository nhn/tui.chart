import { StoreModule, Series } from '@t/store/store';
import { Size } from '@t/options';

import { sortSeries, sortCategories } from '@src/helpers/utils';

function makeCategories(series: Series) {
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

function getSortedSeries(series: Series) {
  const result: Series = {};

  Object.keys(series).forEach((key) => {
    result[key] = series[key].map(({ name, data }) => ({
      name,
      data: data.sort(sortSeries),
    }));
  });

  return result;
}

const root: StoreModule = {
  name: 'root',
  // 파라메터로 data 초기 데이터도 받아야 한다.
  state: ({ series, categories, options }) => ({
    chart: options.chart ?? { width: 0, height: 0 },
    series: series.line ? getSortedSeries(series) : series,
    categories: categories ? categories : makeCategories(series),
    options,
    disabledSeries: [],
    theme: {
      series: {
        colors: [
          '#00a9ff',
          '#ffb840',
          '#ff5a46',
          '#00bd9f',
          '#785fff',
          '#f28b8c',
          '#989486',
          '#516f7d',
          '#29dbe3',
          '#dddddd',
        ],
      },
    },
  }),
  action: {
    setChartSize({ state }, size: Size) {
      state.chart.width = size.width;
      state.chart.height = size.height;
    },
    initChartSize({ state }, containerEl: HTMLElement) {
      if (state.chart.width === 0 || state.chart.height === 0) {
        if (containerEl.parentNode) {
          this.dispatch('setChartSize', {
            width: containerEl.offsetWidth,
            height: containerEl.offsetHeight,
          });
        } else {
          setTimeout(() => {
            this.dispatch('setChartSize', {
              width: containerEl.offsetWidth,
              height: containerEl.offsetHeight,
            });
          }, 0);
        }
      }
    },
  },
};

export default root;
