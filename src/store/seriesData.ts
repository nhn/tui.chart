import { StoreModule, RawSeries, Series, Options } from '@t/store/store';
import { extend } from '@src/store/store';
import { deepCopy, getFirstValidValue, isNumber, isUndefined, range } from '@src/helpers/utils';
import { LineTypeSeriesOptions, RangeDataType } from '@t/options';
import { makeRawCategories } from '@src/store/category';
import { getCoordinateXValue } from '@src/helpers/coordinate';

function initZoomRange(
  series: RawSeries,
  options: Options,
  categories?: string[]
): RangeDataType | undefined {
  if (!(options.series as LineTypeSeriesOptions)?.zoomable) {
    return;
  }

  const rawCategoriesLength = categories
    ? categories.length
    : Object.keys(makeRawCategories(series, categories)).length;

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
  } else {
    startIdx = startIdx > 1 ? startIdx - 1 : startIdx;
    endIdx = endIdx < rawCategories.length - 1 ? endIdx + 1 : endIdx;
  }

  return data.slice(startIdx, endIdx + 1);
}

const seriesData: StoreModule = {
  name: 'seriesData',
  state: ({ series, categories, options }) => ({
    rawCategories: makeRawCategories(series, categories),
    series: {
      ...series,
    } as Series,
    zoomRange: initZoomRange(series, options, categories),
    disabledSeries: [],
  }),
  action: {
    setSeriesData({ state, initStoreState }) {
      const rawSeries = deepCopy(initStoreState.series);
      const { disabledSeries, theme, zoomRange, rawCategories } = state;
      const newSeriesData = {};
      const { colors } = theme.series;
      let colorIdx = 0;

      Object.keys(rawSeries).forEach((seriesName) => {
        const originSeriesData = rawSeries[seriesName].map((m) => {
          colorIdx += 1;

          return {
            ...m,
            rawData: m.data,
            data: getDataInRange(m.data, rawCategories, seriesName, zoomRange),
            color: colors[colorIdx - 1],
          };
        });

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
      const { series, options } = initStoreState;
      const { rawCategories } = state;

      state.zoomRange = initZoomRange(series, options, rawCategories);

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
