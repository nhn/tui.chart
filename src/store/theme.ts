import { ChartType, Options, RawSeries, StoreModule } from '@t/store/store';
import { deepMergedCopy, includes, omit } from '@src/helpers/utils';
import { getNestedPieChartAliasNames, hasNestedPieSeries } from '@src/helpers/pieSeries';
import { NestedPieSeriesType } from '@t/options';

export const DEFAULT_LINE_SERIES_WIDTH = 2;
export const DEFAULT_LINE_SERIES_DOT_RADIUS = 3;
export const DEFAULT_LINE_SERIES_HOVER_DOT_RADIUS = DEFAULT_LINE_SERIES_DOT_RADIUS + 2;

const defaultTheme = {
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
      '#64e38b',
      '#e3b664',
      '#fB826e',
      '#64e3C2',
      '#f66efb',
      '#e3cd64',
      '#82e364',
      '#8570ff',
      '#e39e64',
      '#fa5643',
      '#7a4b46',
      '#81b1c7',
      '#257a6c',
      '#58527a',
      '#fbb0b0',
      '#c7c7c7',
    ],
    startColor: '#ffe98a',
    endColor: '#d74177',
    lineWidth: DEFAULT_LINE_SERIES_WIDTH,
    dashSegments: [],
    select: {
      dot: {
        radius: DEFAULT_LINE_SERIES_HOVER_DOT_RADIUS,
        borderWidth: 2,
        borderColor: '#fff',
      },
      areaOpacity: 0.06,
      // @TODO: 이름 확인 한 번 조절 해보자
      restSeries: {
        areaOpacity: 0.06,
      },
    },
    hover: {
      dot: {
        radius: DEFAULT_LINE_SERIES_HOVER_DOT_RADIUS,
        borderWidth: 2,
        borderColor: '#fff',
      },
    },
    dot: {
      radius: DEFAULT_LINE_SERIES_DOT_RADIUS,
    },
    areaOpacity: 0.3,
  },
  chart: {
    title: {
      fontSize: 11,
      fontFamily: 'Arial',
      fontWeight: '500',
    },
  },
};

const SERIES_USING_COLOR_RANGE = ['treemap', 'heatmap'];

function getSeriesTheme(seriesName: ChartType) {
  let defaultSeriesTheme: SeriesTheme = omit(defaultTheme.series, 'colors');

  if (!includes(SERIES_USING_COLOR_RANGE, seriesName)) {
    defaultSeriesTheme = omit(defaultSeriesTheme, 'startColor', 'endColor');
  }

  return defaultSeriesTheme;
}

function getDefaultTheme(series: RawSeries): Theme {
  const theme = omit(defaultTheme, 'series') as Theme;
  theme.series = {} as SeriesThemeMap;
  const seriesNames = Object.keys(series) as ChartType[];

  return seriesNames.reduce<Theme>((acc, seriesName) => {
    return {
      ...acc,
      series: {
        ...acc.series,
        [seriesName]: getSeriesTheme(seriesName),
      },
    };
  }, theme);
}

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

function getThemeOptionsWithSeriesName(
  options: Options,
  series: RawSeries,
  commonSeriesOptions: SeriesTheme,
  isNestedPieChart: boolean
): Theme {
  const theme = options?.theme;

  if (!theme?.series) {
    return {} as Theme;
  }

  const seriesTheme = { series: {} } as Theme;
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
    ...(commonSeriesOptions?.colors ?? []),
    ...defaultTheme.series.colors,
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
    getDefaultTheme(series),
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
