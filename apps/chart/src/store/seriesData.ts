import {
  StoreModule,
  RawSeries,
  Series,
  Options,
  Categories,
  ChartType,
  ChartSeriesMap,
} from '@t/store/store';
import {
  HeatmapCategoriesType,
  HeatmapSeriesDataType,
  LineTypeSeriesOptions,
  RangeDataType,
  SeriesDataInput,
  TreemapSeriesType,
} from '@t/options';
import {
  deepCopy,
  getFirstValidValue,
  includes,
  isBoolean,
  isNumber,
  isUndefined,
  range,
} from '@src/helpers/utils';
import { makeRawCategories } from '@src/store/category';
import { getCoordinateXValue, isCoordinateSeries } from '@src/helpers/coordinate';
import { isZooming } from '@src/helpers/range';
import { message } from '@src/message';
import { hasNestedPieSeries } from '@src/helpers/pieSeries';
import { extend } from '@src/store/store';

function initRange(series: RawSeries, categories?: Categories): RangeDataType<number> {
  let rawCategoriesLength;

  if (categories) {
    rawCategoriesLength = Array.isArray(categories) ? categories.length : categories.x.length;
  } else {
    rawCategoriesLength = Object.keys(makeRawCategories(series, categories)).length;
  }

  return [0, rawCategoriesLength - 1];
}

function initZoomRange(series: RawSeries, options: Options, categories?: Categories) {
  if (!(series.line || series.area) || !(options.series as LineTypeSeriesOptions)?.zoomable) {
    return;
  }

  return initRange(series, categories);
}

function initShiftRange(series: RawSeries, options: Options, categories?: Categories) {
  if (
    !(series.line || series.area || series.column || series.heatmap) ||
    !(options.series as LineTypeSeriesOptions)?.shift
  ) {
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

function getSeriesColors(
  colors: string[],
  colorIndex: number,
  size: number,
  isColorByCategories: boolean
) {
  return isColorByCategories ? colors.slice(0, size + 1) : colors[colorIndex % colors.length];
}

function getSeriesDataInRange(
  data,
  rawCategories: Categories,
  chartType: string,
  zoomRange?: RangeDataType<number>
) {
  if (!zoomRange) {
    return data;
  }

  let [startIdx, endIdx] = zoomRange;
  const firstValidValue = getFirstValidValue(data);
  const isCoordinateChart =
    chartType !== 'area' && !isUndefined(firstValidValue) && !isNumber(firstValidValue);

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

function isSeriesAlreadyExist(
  series: Partial<ChartSeriesMap>,
  seriesName: string,
  data: Exclude<SeriesDataInput, TreemapSeriesType | HeatmapSeriesDataType>
) {
  return series[seriesName]!.some(({ label }) => label === data.name);
}

function isTreemapSeriesAlreadyExist(series: Partial<ChartSeriesMap>, data: TreemapSeriesType) {
  return series.treemap!.some(({ label }) => label === data.label);
}

function isHeatmapSeriesAlreadyExist(categories: HeatmapCategoriesType, category: string) {
  return includes((categories as HeatmapCategoriesType).y, category);
}

function initDisabledSeries(series: RawSeries) {
  const nestedPieChart = hasNestedPieSeries(series);
  const disabledSeries: string[] = [];
  if (nestedPieChart) {
    series.pie!.forEach(({ data }) => {
      data.forEach((datum) => {
        if (isBoolean(datum.visible) && !datum.visible) {
          disabledSeries.push(datum.name);
        }
      });
    });
  } else {
    Object.keys(series).forEach((type) => {
      series[type].forEach(({ name, visible }) => {
        if (isBoolean(visible) && !visible) {
          disabledSeries.push(name);
        }
      });
    });
  }

  return disabledSeries;
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
    disabledSeries: initDisabledSeries(series),
  }),
  action: {
    setSeriesData({ state, initStoreState }) {
      const rawSeries = deepCopy(initStoreState.series);
      const { disabledSeries, theme, zoomRange, rawCategories } = state;
      const newSeriesData = {};
      let colorIndex = 0;

      Object.keys(rawSeries).forEach((seriesName) => {
        const { colors, iconTypes } = theme.series![seriesName];

        let originSeriesData = rawSeries[seriesName].map((series) => {
          const isColorByCategories = !!series.colorByCategories;
          const size = isColorByCategories ? (rawCategories as string[]).length : 1;

          const color = colors
            ? getSeriesColors(colors, colorIndex, size, isColorByCategories)
            : '';

          colorIndex += size;

          return {
            ...series,
            rawData: series.data,
            data: getSeriesDataInRange(series.data, rawCategories, seriesName, zoomRange),
            color,
          };
        });

        if (seriesName === 'scatter') {
          originSeriesData = originSeriesData.map((series, idx) => ({
            ...series,
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
        this.dispatch('removeCategoryByName', name);
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
      const coordinateChart = isCoordinateTypeSeries(state.series, chartType);
      let { categories } = initStoreState;
      categories = series.heatmap ? (categories as HeatmapCategoriesType).x : categories;

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
        this.dispatch('initCategory');
      }
    },
    addSeries(
      { state, initStoreState },
      {
        data,
        chartType,
        category,
      }: {
        data: Exclude<SeriesDataInput, HeatmapSeriesDataType | TreemapSeriesType>;
        chartType?: ChartType;
        category?: string;
      }
    ) {
      const { series, categories } = initStoreState;
      const coordinateChart = isCoordinateTypeSeries(state.series, chartType);
      const seriesName = chartType || Object.keys(series)[0];

      const isExist = isSeriesAlreadyExist(series, seriesName, data);

      if (!isExist) {
        series[seriesName].push(data);
        if (Array.isArray(categories) && category) {
          categories.push(category);
        }
      }

      this.dispatch('initThemeState');
      this.dispatch('initLegendState');
      this.notify(state, 'series');

      if (coordinateChart || seriesName === 'bullet') {
        this.dispatch('initCategory');
      }
    },
    addHeatmapSeries(
      { state, initStoreState },
      { data, category }: { data: HeatmapSeriesDataType; category: string }
    ) {
      const { series, categories } = initStoreState;

      const isExist = isHeatmapSeriesAlreadyExist(categories as HeatmapCategoriesType, category);
      if (!isExist) {
        series.heatmap!.push({ data, yCategory: category });
      }

      if (!isExist && category) {
        (categories as HeatmapCategoriesType).y.push(category);
        this.notify(state, 'rawCategories');
      }

      this.notify(state, 'series');
      this.dispatch('initThemeState');
      this.dispatch('initLegendState');
    },
    addTreemapSeries({ state, initStoreState }, { data }) {
      const { series } = initStoreState;

      const isExist = isTreemapSeriesAlreadyExist(series, data);
      if (!isExist) {
        series.treemap!.push(data);
      }

      this.notify(state, 'series');
      this.notify(state, 'treemapSeries');
      this.dispatch('initThemeState');
      this.dispatch('initLegendState');
    },
    setData({ state, initStoreState }, { series, categories }) {
      initStoreState.series = series;
      const isNestedPieChart = hasNestedPieSeries(series);
      if (!isNestedPieChart) {
        state.rawCategories = makeRawCategories(series, categories);
      }

      this.dispatch('initThemeState');
      this.dispatch('initLegendState');
    },
    addOutlier(
      { state, initStoreState },
      { seriesIndex, outliers }: { seriesIndex: number; outliers: number[][] }
    ) {
      const { series } = initStoreState;
      const seriesRawData = series.boxPlot![seriesIndex];

      if (!seriesRawData) {
        throw new Error(message.SERIES_INDEX_ERROR);
      }

      seriesRawData.outliers = [...(seriesRawData.outliers ?? []), ...outliers];

      this.notify(state, 'series');
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
