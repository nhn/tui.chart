import { Options, RawSeries, StoreModule } from '@t/store/store';
import { deepMergedCopy, omit } from '@src/helpers/utils';
import {
  getNestedPieChartAliasNames,
  hasNestedPieSeries,
  hasOuterDataLabel,
  hasOuterPieSeriesName,
} from '@src/helpers/pieSeries';
import { NestedPieSeriesType } from '@t/options';
import { axisTitleTheme, defaultSeriesTheme, getDefaultTheme } from '@src/helpers/theme';
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
  isNestedPieChart: boolean
) {
  let index = 0;
  const commonColorsOption = [
    ...((commonSeriesOptions?.colors as string[]) ?? []),
    ...defaultSeriesTheme.colors,
  ];
  const themeNames = isNestedPieChart ? getNestedPieChartAliasNames(series) : Object.keys(series);

  themeNames.forEach((name, idx) => {
    const size = isNestedPieChart
      ? (series.pie as NestedPieSeriesType[])[idx].data.length
      : series[name].length;
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

function checkAnchorPieSeriesOption(options: Options, series: RawSeries, alias: string) {
  return {
    hasOuterAnchor: !!series.pie && options?.series?.[alias]?.dataLabels?.anchor === 'outer',
    hasOuterAnchorPieSeriesName:
      !!series.pie && options?.series?.[alias]?.dataLabels?.pieSeriesName?.anchor === 'outer',
  };
}

function getTheme(options: Options, series: RawSeries): Theme {
  const isNestedPieChart = hasNestedPieSeries(series);
  const commonSeriesOptions: SeriesTheme = getCommonSeriesOptions(
    options,
    series,
    isNestedPieChart
  );

  let checkAnchorPieSeries: CheckAnchorPieSeries | Record<string, CheckAnchorPieSeries> = {
    hasOuterAnchor: hasOuterDataLabel(options, series),
    hasOuterAnchorPieSeriesName: hasOuterPieSeriesName(options, series),
  };

  if (isNestedPieChart) {
    const aliasNames = getNestedPieChartAliasNames(series);

    checkAnchorPieSeries = aliasNames.reduce(
      (acc, cur) => ({
        ...acc,
        [cur]: checkAnchorPieSeriesOption(options, series, cur),
      }),
      {}
    );
  }

  const theme = deepMergedCopy(
    getDefaultTheme(series, checkAnchorPieSeries, isNestedPieChart),
    getThemeOptionsWithSeriesName(options, series, commonSeriesOptions, isNestedPieChart)
  );

  if (!series.heatmap) {
    setColors(theme, series, commonSeriesOptions, isNestedPieChart);
  }

  return theme;
}

const theme: StoreModule = {
  name: 'theme',
  state: ({ options, series }) => ({
    theme: getTheme(options, series),
  }),
  action: {
    setTheme({ state }) {},
    applyTheme({ state }) {},
  },
  observe: {
    updateTheme() {
      this.dispatch('setTheme');
    },
  },
};

export default theme;
