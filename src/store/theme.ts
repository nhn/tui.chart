import { ChartType, Options, RawSeries, StoreModule } from '@t/store/store';
import { deepMergedCopy, includes, omit } from '@src/helpers/utils';

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
  },
  chart: {
    title: {
      fontSize: 11,
      fontFamily: 'Arial',
      fontWeight: '500',
    },
  },
};

function getSeriesTheme(seriesName: ChartType) {
  const defaultSeriesTheme = omit(defaultTheme.series, 'colors');

  if (includes(['line', 'area'], seriesName)) {
    return omit(defaultSeriesTheme, 'startColor', 'endColor');
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

function getCommonSeriesOptions(options: Options, series: RawSeries): SeriesTheme {
  const theme = options?.theme;
  if (!theme?.series) {
    return {} as SeriesTheme;
  }

  const seriesNames = Object.keys(series);

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
  commonSeriesOptions: SeriesTheme
) {
  const theme = options?.theme;
  if (!theme?.series) {
    return {};
  }

  const seriesTheme = { series: {} };
  const seriesNames = Object.keys(series);
  const isComboChart = seriesNames.length > 1; // @TODO: nestedPie 차트 판별 못함

  if (isComboChart) {
    seriesTheme.series = {
      ...seriesNames.reduce(
        (acc, seriesName) => ({
          ...acc,
          [seriesName]: deepMergedCopy(
            theme.series?.[seriesName],
            omit(commonSeriesOptions, 'colors')
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

function setColors(theme, series: RawSeries, commonSeriesOptions: SeriesTheme) {
  let index = 0;
  const commonColorsOption = [
    ...(commonSeriesOptions?.colors ?? []),
    ...defaultTheme.series.colors,
  ];

  console.log(theme);

  Object.keys(series).forEach((seriesName) => {
    const size = series[seriesName].length;
    if (!theme.series[seriesName].colors) {
      theme.series[seriesName].colors = commonColorsOption.slice(index, index + size);
      index += size;
    }
  });
}

function getTheme(options: Options, series: RawSeries): Theme {
  const commonSeriesOptions: SeriesTheme = getCommonSeriesOptions(options, series);

  const theme = deepMergedCopy(
    getDefaultTheme(series),
    getThemeOptionsWithSeriesName(options, series, commonSeriesOptions)
  );

  setColors(theme, series, commonSeriesOptions);

  return theme as Theme;
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
