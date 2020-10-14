import { StoreModule, RawSeries, Series, Options, Categories } from '@t/store/store';
import { extend } from '@src/store/store';
import { deepCopy, getFirstValidValue, isNumber, isUndefined, range } from '@src/helpers/utils';
import { LineTypeSeriesOptions, RangeDataType } from '@t/options';
import { makeRawCategories } from '@src/store/category';
import { getCoordinateXValue } from '@src/helpers/coordinate';
import { isZooming } from '@src/helpers/range';

function initZoomRange(
  series: RawSeries,
  options: Options,
  categories?: Categories
): RangeDataType<number> | undefined {
  if (!(series.line || series.area) || !(options.series as LineTypeSeriesOptions)?.zoomable) {
    return;
  }

  const rawCategoriesLength = categories
    ? (categories as string[]).length
    : Object.keys(makeRawCategories(series, categories)).length;

  return [0, rawCategoriesLength - 1];
}

function getCoordinateDataRange(data, rawCategories: string[], zoomRange: RangeDataType<number>) {
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
  rawCategories: Categories,
  chartType: string,
  zoomRange?: RangeDataType<number>
) {
  if (!zoomRange) {
    return data;
  }

  let [startIdx, endIdx] = zoomRange;
  const isCoordinateChart = chartType !== 'area' && !isNumber(getFirstValidValue(data));

  if (isCoordinateChart) {
    [startIdx, endIdx] = getCoordinateDataRange(data, rawCategories as string[], zoomRange);
  } else {
    startIdx = startIdx > 1 ? startIdx - 1 : startIdx;
    endIdx = endIdx < (rawCategories as string[]).length - 1 ? endIdx + 1 : endIdx;
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

      Object.keys(rawSeries).forEach((seriesName) => {
        const { colors } = theme.series![seriesName];
        const originSeriesData = rawSeries[seriesName].map((m, idx) => ({
          ...m,
          rawData: m.data,
          data: getDataInRange(m.data, rawCategories, seriesName, zoomRange),
          color: colors ? colors[idx] : '',
        }));

        const seriesCount = originSeriesData.length;
        const seriesGroupCount = originSeriesData[0]?.data?.length ?? 0;

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

      if (state.series.bullet) {
        const index = (state.categories as string[]).findIndex((seriesName) => seriesName === name);
        (state.categories as string[]).splice(index, 1);

        this.notify(state, 'axes');
      }
    },
    enableSeries({ state }, name: string) {
      const index = state.disabledSeries.findIndex((disabled) => disabled === name);
      state.disabledSeries.splice(index, 1);
      this.notify(state, 'disabledSeries');

      if (state.series.bullet) {
        state.categories = state.series.bullet.data.map(({ name: seriesName }) => seriesName);
        this.notify(state, 'axes');
      }
    },
    zoom({ state }, rangeCategories: string[]) {
      const rawCategories = state.rawCategories as string[];

      state.zoomRange = rangeCategories.map((rangeCategory) =>
        rawCategories.findIndex((category) => category === rangeCategory)
      ) as RangeDataType<number>;

      this.notify(state, 'zoomRange');
    },
    resetZoom({ state, initStoreState }) {
      const { series, options } = initStoreState;
      const rawCategories = state.rawCategories as string[];

      state.zoomRange = initZoomRange(series, options, rawCategories);

      this.notify(state, 'zoomRange');
    },
  },
  observe: {
    updateSeriesData() {
      this.dispatch('setSeriesData');
    },
  },
  computed: {
    isLineTypeSeriesZooming: ({ zoomRange, rawCategories }) => {
      return isZooming(rawCategories as string[], zoomRange);
    },
  },
};

export default seriesData;
