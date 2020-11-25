import { StoreModule, RawSeries, Series, Options, Categories, ChartType } from '@t/store/store';
import { extend } from '@src/store/store';
import { deepCopy, getFirstValidValue, isNumber, isUndefined, range } from '@src/helpers/utils';
import { HeatmapCategoriesType, LineTypeSeriesOptions, RangeDataType } from '@t/options';
import { makeRawCategories } from '@src/store/category';
import { getCoordinateXValue, isCoordinateSeries } from '@src/helpers/coordinate';
import { isZooming } from '@src/helpers/range';

function initRange(series: RawSeries, categories?: Categories): RangeDataType<number> | undefined {
  const rawCategoriesLength = categories
    ? (categories as string[]).length
    : Object.keys(makeRawCategories(series, categories)).length;

  return [0, rawCategoriesLength - 1];
}

function initZoomRange(series: RawSeries, options: Options, categories?: Categories) {
  if (!(series.line || series.area) || !(options.series as LineTypeSeriesOptions)?.zoomable) {
    return;
  }

  return initRange(series, categories);
}

function initShiftRange(series: RawSeries, options: Options, categories?: Categories) {
  if (!(series.line || series.area) || !(options.series as LineTypeSeriesOptions)?.shift) {
    return;
  }

  return initRange(series, categories);
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

function isCoordinateTypeSeries(series: Series, chartType?: ChartType) {
  return (
    isCoordinateSeries(series) &&
    (isUndefined(chartType) || chartType === 'line' || chartType === 'scatter')
  );
}

const seriesData: StoreModule = {
  name: 'seriesData',
  state: ({ series, categories, options }) => ({
    rawCategories: makeRawCategories(series, categories),
    series: {
      ...series,
    } as Series,
    zoomRange: initZoomRange(series, options, categories),
    shiftRange: initShiftRange(series, options, categories),
    disabledSeries: [],
  }),
  action: {
    setSeriesData({ state, initStoreState }) {
      const rawSeries = deepCopy(initStoreState.series);
      const { disabledSeries, theme, zoomRange, rawCategories } = state;
      const newSeriesData = {};

      Object.keys(rawSeries).forEach((seriesName) => {
        const { colors, iconTypes } = theme.series![seriesName];
        let originSeriesData = rawSeries[seriesName].map((m, idx) => ({
          ...m,
          rawData: m.data,
          data: getDataInRange(m.data, rawCategories, seriesName, zoomRange),
          color: colors ? colors[idx] : '',
        }));

        if (seriesName === 'scatter') {
          originSeriesData = originSeriesData.map((m, idx) => ({
            ...m,
            iconType: iconTypes ? iconTypes[idx] : 'circle',
          }));
        }

        const seriesCount = originSeriesData.length;
        const seriesGroupCount = originSeriesData[0]?.data?.length ?? 0;

        const data = originSeriesData.filter(({ name }) => !disabledSeries.includes(name));

        newSeriesData[seriesName] = {
          seriesCount,
          seriesGroupCount,
          data,
          colors,
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
    addData({ state, initStoreState }, { data, category, chartType }) {
      const { series } = initStoreState;
      let { categories } = initStoreState;
      categories = series.heatmap ? (categories as HeatmapCategoriesType).x : categories;
      const coordinateChart = isCoordinateTypeSeries(state.series, chartType);

      if (category && Array.isArray(categories)) {
        const isExist = categories.some((c) => c === category);
        if (!isExist) {
          categories.push(category);

          if (Array.isArray(state.shiftRange)) {
            const [start, end] = state.shiftRange;
            state.shiftRange = [start + 1, end + 1];
          }
        }
      }

      if (chartType) {
        series[chartType].forEach((datum, idx) => {
          datum.data.push(data[idx]);
        });
      } else {
        const [seriesName] = Object.keys(initStoreState.series);

        series[seriesName].forEach((datum, idx) => {
          datum.data.push(data[idx]);
        });
      }

      this.notify(state, 'series');
      this.notify(state, 'rawCategories');
      if (Array.isArray(state.zoomRange)) {
        this.dispatch('resetZoom');
      }

      if (coordinateChart) {
        this.dispatch('updateCategoryForCoordinateData');
      }
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
    viewRange: ({ zoomRange, shiftRange }) => {
      return zoomRange || shiftRange;
    },
  },
};

export default seriesData;
