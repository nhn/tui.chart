import {
  Categories,
  DefaultCategories,
  Options,
  RawSeries,
  StoreModule,
  ChartSeries,
  BoxType,
} from '@t/store/store';
import { deepMergedCopy, omit } from '@src/helpers/utils';
import {
  getNestedPieChartAliasNames,
  hasNestedPieSeries,
  hasOuterDataLabel,
  hasOuterPieSeriesName,
} from '@src/helpers/pieSeries';
import { NestedPieSeriesType } from '@t/options';
import { makeAxisTitleTheme, defaultSeriesTheme, getDefaultTheme } from '@src/helpers/theme';
import {
  AxisTheme,
  ComboChartSeriesTheme,
  HeatmapChartSeriesTheme,
  PieChartSeriesTheme,
  SeriesTheme,
  Theme,
  CheckAnchorPieSeries,
} from '@t/theme';

function getCommonSeriesOptions(
  options: Options,
  series: RawSeries,
  isNestedPieChart: boolean
): SeriesTheme {
  const theme = options?.theme;
  if (!theme?.series) {
    return {} as SeriesTheme;
  }

  const seriesNames = isNestedPieChart ? getNestedPieChartAliasNames(series) : Object.keys(series);

  return seriesNames.reduce<SeriesTheme>(
    (acc, seriesName) => {
      delete acc[seriesName];

      return acc;
    },
    { ...theme.series }
  );
}

function getThemeAppliedSecondaryYAxis(options: Options) {
  const theme = { ...options.theme } as Theme;

  if (!Array.isArray(theme.yAxis)) {
    return theme;
  }

  const axisTitleTheme = makeAxisTitleTheme(options?.theme?.chart?.fontFamily);
  const yAxis = (theme.yAxis as AxisTheme[]).map((yAxisTheme) =>
    deepMergedCopy({ title: { ...axisTitleTheme } }, { ...yAxisTheme })
  );

  return {
    ...theme,
    yAxis,
  };
}

function getThemeOptionsWithSeriesName(
  options: Options,
  series: RawSeries,
  commonSeriesOptions: SeriesTheme,
  isNestedPieChart: boolean
): Theme {
  const theme = getThemeAppliedSecondaryYAxis(options);
  if (!theme?.series) {
    return { ...theme } as Theme;
  }

  const seriesTheme = { ...theme, series: {} } as Theme;
  const seriesNames = Object.keys(series);
  const isComboChart = seriesNames.length > 1;

  if (isNestedPieChart) {
    const aliasNames = getNestedPieChartAliasNames(series);
    seriesTheme.series = {
      pie: aliasNames.reduce(
        (acc, aliasName) => ({
          ...acc,
          [aliasName]: deepMergedCopy(
            theme.series?.[aliasName],
            omit(commonSeriesOptions as PieChartSeriesTheme, 'colors')
          ),
        }),
        {}
      ),
    };
  } else if (isComboChart) {
    seriesTheme.series = {
      ...seriesNames.reduce(
        (acc, seriesName) => ({
          ...acc,
          [seriesName]: deepMergedCopy(
            theme.series?.[seriesName],
            omit(commonSeriesOptions as ComboChartSeriesTheme, 'colors')
          ),
        }),
        {}
      ),
    };
  } else {
    seriesTheme.series = {
      [seriesNames[0]]: theme.series,
    };
  }

  return seriesTheme;
}

function setColors(
  theme: Theme,
  series: RawSeries,
  commonSeriesOptions: Exclude<SeriesTheme, HeatmapChartSeriesTheme>,
  isNestedPieChart: boolean,
  categories: DefaultCategories
) {
  let index = 0;
  const commonColorsOption = [
    ...((commonSeriesOptions?.colors as string[]) ?? []),
    ...defaultSeriesTheme.colors,
  ];
  const themeNames = isNestedPieChart ? getNestedPieChartAliasNames(series) : Object.keys(series);
  themeNames.forEach((name, idx) => {
    const themeSeries = series[name] || [];
    const filteredSeries = themeSeries.filter(
      <T extends ChartSeries, K extends BoxType>(chartSeries: T[K]) => chartSeries.colorByCategories
    );
    const hasColorByCategories = filteredSeries.length > 0;
    let size;

    if (isNestedPieChart) {
      size = (series.pie as NestedPieSeriesType[])[idx].data.length;
    } else if (hasColorByCategories) {
      const rejectedSeries = themeSeries.filter(
        <T extends ChartSeries, K extends BoxType>(chartSeries: T[K]) =>
          !chartSeries.colorByCategories
      );
      size = rejectedSeries.length + categories.length;
    } else {
      size = series[name].length;
    }

    const target = isNestedPieChart ? theme.series.pie! : theme.series;

    if (!target[name]?.colors) {
      target![name] = {
        ...target![name],
        colors: commonColorsOption.slice(index, index + size),
      };
      index += size;
    }
  });
}

function setPlot(theme: Theme) {
  ['vertical', 'horizontal'].reduce((acc, cur) => {
    if (!acc[cur]) {
      acc[cur] = { lineColor: acc.lineColor };
    }

    return acc;
  }, theme.plot);
}

function checkAnchorPieSeriesOption(options: Options, series: RawSeries, alias: string) {
  return {
    hasOuterAnchor: !!series.pie && options?.series?.[alias]?.dataLabels?.anchor === 'outer',
    hasOuterAnchorPieSeriesName:
      !!series.pie && options?.series?.[alias]?.dataLabels?.pieSeriesName?.anchor === 'outer',
  };
}

function getTheme(options: Options, series: RawSeries, categories?: Categories): Theme {
  const isNestedPieChart = hasNestedPieSeries(series);
  const commonSeriesOptions: SeriesTheme = getCommonSeriesOptions(
    options,
    series,
    isNestedPieChart
  );

  let pieSeriesOuterAnchors: CheckAnchorPieSeries | Record<string, CheckAnchorPieSeries> = {
    hasOuterAnchor: hasOuterDataLabel(options, series),
    hasOuterAnchorPieSeriesName: hasOuterPieSeriesName(options, series),
  };

  if (isNestedPieChart) {
    const aliasNames = getNestedPieChartAliasNames(series);

    pieSeriesOuterAnchors = aliasNames.reduce(
      (acc, cur) => ({
        ...acc,
        [cur]: checkAnchorPieSeriesOption(options, series, cur),
      }),
      {}
    );
  }
  const globalFontFamily = options?.theme?.chart?.fontFamily;
  const theme = deepMergedCopy(
    getDefaultTheme(series, pieSeriesOuterAnchors, globalFontFamily, isNestedPieChart),
    getThemeOptionsWithSeriesName(options, series, commonSeriesOptions, isNestedPieChart)
  );

  if (!series.heatmap) {
    setColors(
      theme,
      series,
      commonSeriesOptions,
      isNestedPieChart,
      categories as DefaultCategories
    );
  }

  setPlot(theme);

  return theme;
}

const theme: StoreModule = {
  name: 'theme',
  state: ({ options, series, categories }) => ({
    theme: getTheme(options, series, categories),
  }),
  action: {
    initThemeState({ state, initStoreState }) {
      state.theme = getTheme(state.options, initStoreState.series, initStoreState.categories);
    },
  },
  observe: {
    updateTheme() {
      this.dispatch('initThemeState');
    },
  },
};

export default theme;
