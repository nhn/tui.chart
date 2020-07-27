import { StoreModule, RawSeries, Series, Options } from '@t/store/store';
import { extend } from '@src/store/store';
import {
  deepCopy,
  getFirstValidValue,
  isNumber,
  isUndefined,
  range,
  sortSeries,
} from '@src/helpers/utils';
import { LineTypeSeriesOptions, RangeDataType } from '@t/options';
import { makeRawCategories } from '@src/store/category';
import { getCoordinateXValue } from '@src/helpers/coordinate';

function makeInitSeries(series: RawSeries) {
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

function initZoomRange(
  series: RawSeries,
  options: Options,
  categories?: string[]
): RangeDataType | undefined {
  if (!(options.series as LineTypeSeriesOptions)?.zoomable) {
    return;
  }

  const rawCategoriesLength = Object.keys(makeRawCategories(series, categories)).length;

  return [0, rawCategoriesLength - 1];
}

function getCoordinateDataRange(data, rawCategories: string[], zoomRange: RangeDataType) {
  const [zoomStart, zoomEnd] = zoomRange;
  let start, end;

  range(zoomStart, zoomEnd + 1).forEach((i) => {
    const idx = data.findIndex(
      (datum) => getCoordinateXValue(datum).toString() === rawCategories[i]
    );

    if (idx !== -1) {
      if (isUndefined(start)) {
        start = idx;
      }

      if (!isUndefined(start)) {
        end = Math.max(idx, end ?? 0);
      }
    }
  });

  return [start, end];
}

function getDataInRange(
  data,
  rawCategories: string[],
  chartType: string,
  zoomRange?: RangeDataType
) {
  if (!zoomRange) {
    return data;
  }

  let [startIdx, endIdx] = zoomRange;
  const isCoordinateChart = chartType !== 'area' && !isNumber(getFirstValidValue(data));

  if (isCoordinateChart) {
    [startIdx, endIdx] = getCoordinateDataRange(data, rawCategories, zoomRange);
  }

  return data.slice(startIdx, endIdx + 1);
}

const seriesData: StoreModule = {
  name: 'seriesData',
  state: ({ series, categories, options }) => ({
    rawCategories: makeRawCategories(series, categories),
    series: makeInitSeries(series),
    zoomRange: initZoomRange(series, options, categories),
    disabledSeries: [],
  }),
  action: {
    setSeriesData({ state, initStoreState }) {
      const rawSeries = deepCopy(initStoreState.series);
      const { disabledSeries, theme, zoomRange, rawCategories } = state;
      const newSeriesData = {};
      const { colors } = theme.series;

      Object.keys(rawSeries).forEach((seriesName) => {
        const originSeriesData = rawSeries[seriesName].map((m, idx) => ({
          ...m,
          rawData: m.data,
          data: getDataInRange(m.data, rawCategories, seriesName, zoomRange),
          color: colors[idx],
        }));

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
    zoom({ state }, rangeCategories: string[]) {
      const { rawCategories } = state;

      state.zoomRange = rangeCategories.map((rangeCategory) =>
        rawCategories.findIndex((category) => category === rangeCategory)
      ) as RangeDataType;

      this.notify(state, 'zoomRange');
    },
    resetZoom({ state, initStoreState }) {
      const { categories, series, options } = initStoreState;
      state.zoomRange = initZoomRange(series, options, categories);

      this.notify(state, 'zoomRange');
    },
  },
  observe: {
    updateSeriesData() {
      this.dispatch('setSeriesData');
    },
  },
};

export default seriesData;
