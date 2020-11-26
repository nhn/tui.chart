import { Options, RawSeries, StoreModule } from '@t/store/store';
import { deepMergedCopy, omit } from '@src/helpers/utils';
import { getNestedPieChartAliasNames, hasNestedPieSeries } from '@src/helpers/pieSeries';
import { NestedPieSeriesType } from '@t/options';
import { axisTitleTheme, defaultSeriesTheme, getDefaultTheme } from '@src/helpers/theme';
import { extend } from '@src/store/store';
import {
  AxisTheme,
  ComboChartSeriesTheme,
  HeatmapChartSeriesTheme,
  PieChartSeriesTheme,
  SeriesTheme,
  Theme,
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

function getTheme(options: Options, series: RawSeries): Theme {
  const isNestedPieChart = hasNestedPieSeries(series);
  const commonSeriesOptions: SeriesTheme = getCommonSeriesOptions(
    options,
    series,
    isNestedPieChart
  );

  const theme = deepMergedCopy(
    getDefaultTheme(series, isNestedPieChart),
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
    initThemeState({ state, initStoreState }) {
      extend(state.theme, getTheme(initStoreState.options, initStoreState.series));
    },
    applyTheme({ state }) {},
  },
  observe: {},
};

export default theme;
