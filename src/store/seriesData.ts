import { StoreModule, RawSeries, Series, Options } from '@t/store/store';
import { extend } from '@src/store/store';
import { deepCopy, getFirstValidValue, isNumber, sortSeries } from '@src/helpers/utils';
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

function getInitSeriesRange(
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

function getStartIdx(data, rawCategories: string[], zoomRange: RangeDataType) {
  return getDataIndex(data, rawCategories, zoomRange, false);
}

function getEndIdx(data, rawCategories: string[], zoomRange: RangeDataType) {
  return getDataIndex(data, rawCategories, zoomRange, true);
}

function getDataIndex(data, rawCategories: string[], zoomRange: RangeDataType, isEnd: boolean) {
  const [start, end] = zoomRange;
  const startIdx = isEnd ? rawCategories.length - 1 : start - 1;
  const endIdx = isEnd ? end : 0;

  for (let i = startIdx; i >= endIdx; i -= 1) {
    const category = rawCategories[i];
    const idx = data.findIndex((datum) => getCoordinateXValue(datum).toString() === category);

    if (idx !== -1) {
      return idx;
    }
  }

  const boundaryCategory = isEnd ? rawCategories[end] : rawCategories[start];

  return data.findIndex((datum) => getCoordinateXValue(datum).toString() === boundaryCategory);
}

function getDataInRange(data, rawCategories: string[], zoomRange?: RangeDataType) {
  if (!zoomRange) {
    return data;
  }

  const [start, end] = zoomRange;

  if (isNumber(getFirstValidValue(data))) {
    return data.slice(start, end + 1);
  }

  const startIdx = getStartIdx(data, rawCategories, zoomRange);
  const endIdx = getEndIdx(data, rawCategories, zoomRange);

  return data.slice(startIdx, endIdx + 1);
}

const seriesData: StoreModule = {
  name: 'seriesData',
  state: ({ series, categories, options }) => ({
    rawCategories: makeRawCategories(series, categories),
    series: makeInitSeries(series),
    zoomRange: getInitSeriesRange(series, options, categories),
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
          data: getDataInRange(m.data, rawCategories, zoomRange),
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
    zoom({ state }, rangeCategory: string[]) {
      const { rawCategories } = state;

      state.zoomRange = rangeCategory.map((o) =>
        rawCategories.findIndex((category) => category === o)
      ) as RangeDataType;

      this.notify(state, 'zoomRange');
    },
    resetZoom({ state, initStoreState }) {
      const { categories, series, options } = initStoreState;
      state.zoomRange = getInitSeriesRange(series, options, categories);

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
