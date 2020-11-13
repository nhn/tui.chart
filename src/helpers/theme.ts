import { RawSeries } from '@t/store/store';
import { BOX_HOVER_THICKNESS } from '@src/helpers/boxStyle';
import { Theme } from '@t/theme';
import { getNestedPieChartAliasNames } from '@src/helpers/pieSeries';

export const DEFAULT_LINE_SERIES_WIDTH = 2;
export const DEFAULT_LINE_SERIES_DOT_RADIUS = 3;
export const DEFAULT_LINE_SERIES_HOVER_DOT_RADIUS = DEFAULT_LINE_SERIES_DOT_RADIUS + 2;
const DEFAULT_AREA_OPACITY = 0.3;
const DEFAULT_AREA_SELECTED_SERIES_OPACITY = DEFAULT_AREA_OPACITY;
const DEFAULT_AREA_UNSELECTED_SERIES_OPACITY = 0.06;
const DEFAULT_RADAR_SERIES_DOT_RADIUS = 3;
const DEFAULT_RADAR_SERIES_HOVER_DOT_RADIUS = DEFAULT_RADAR_SERIES_DOT_RADIUS + 1;
const DEFAULT_RADAR_SELECTED_SERIES_OPACITY = DEFAULT_AREA_OPACITY;
const DEFAULT_RADAR_UNSELECTED_SERIES_OPACITY = 0.05;
const DEFAULT_PIE_LINE_WIDTH = 5;

export const defaultSeriesTheme = {
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
  borderWidth: 0,
  borderColor: '#ffffff',
  select: {
    dot: {
      radius: DEFAULT_LINE_SERIES_HOVER_DOT_RADIUS,
      borderWidth: 2,
      borderColor: '#fff',
    },
    areaOpacity: DEFAULT_AREA_SELECTED_SERIES_OPACITY,
    restSeries: {
      areaOpacity: DEFAULT_AREA_UNSELECTED_SERIES_OPACITY,
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
  areaOpacity: DEFAULT_AREA_OPACITY,
};

const defaultTheme = {
  chart: {
    title: {
      fontSize: 11,
      fontFamily: 'Arial',
      fontWeight: '500',
    },
  },
};

// eslint-disable-next-line complexity
function getSeriesTheme(seriesName: string, isNestedPieChart = false) {
  const lineTypeSeriesTheme = {
    lineWidth: defaultSeriesTheme.lineWidth,
    dashSegments: defaultSeriesTheme.dashSegments,
    select: { dot: defaultSeriesTheme.select.dot },
    hover: { dot: defaultSeriesTheme.hover.dot },
    dot: defaultSeriesTheme.dot,
  };

  const transparentColor = 'rgba(255, 255, 255, 0)';

  switch (seriesName) {
    case 'line':
      return lineTypeSeriesTheme;
    case 'area':
      return {
        ...lineTypeSeriesTheme,
        select: {
          ...lineTypeSeriesTheme.select,
          areaOpacity: DEFAULT_AREA_SELECTED_SERIES_OPACITY,
          restSeries: defaultSeriesTheme.select.restSeries,
        },
        areaOpacity: DEFAULT_AREA_OPACITY,
      };
    case 'treemap':
    case 'heatmap':
      return {
        startColor: defaultSeriesTheme.startColor,
        endColor: defaultSeriesTheme.endColor,
        borderWidth: 0,
        borderColor: '#ffffff',
        hover: {
          borderWidth: BOX_HOVER_THICKNESS,
          borderColor: '#ffffff',
        },
        select: {
          borderWidth: BOX_HOVER_THICKNESS,
          borderColor: '#ffffff',
        },
      };
    case 'scatter':
      return {
        size: 12,
        borderWidth: 1.5,
        fillColor: transparentColor,
        select: {
          fillColor: 'rgba(255, 255, 255, 1)',
        },
        hover: {
          fillColor: 'rgba(255, 255, 255, 1)',
        },
      };
    case 'bubble':
      return {
        borderWidth: 0,
        borderColor: transparentColor,
        select: {},
        hover: {},
      };
    case 'radar':
      return {
        areaOpacity: DEFAULT_RADAR_SELECTED_SERIES_OPACITY,
        hover: {
          dot: {
            radius: DEFAULT_RADAR_SERIES_HOVER_DOT_RADIUS,
            borderColor: '#ffffff',
            borderWidth: 2,
          },
        },
        select: {
          dot: {
            radius: DEFAULT_RADAR_SERIES_HOVER_DOT_RADIUS,
            borderColor: '#ffffff',
            borderWidth: 2,
          },
          restSeries: {
            areaOpacity: DEFAULT_RADAR_UNSELECTED_SERIES_OPACITY,
          },
          areaOpacity: DEFAULT_RADAR_SELECTED_SERIES_OPACITY,
        },
        dot: {
          radius: DEFAULT_RADAR_SERIES_DOT_RADIUS,
        },
      };
    case 'pie':
      return {
        areaOpacity: 1,
        strokeStyle: isNestedPieChart ? '#ffffff' : 'rgba(255, 255, 255, 0)',
        lineWidth: isNestedPieChart ? 1 : 0,
        hover: {
          lineWidth: DEFAULT_PIE_LINE_WIDTH,
          strokeStyle: '#ffffff',
          shadowColor: '#cccccc',
          shadowBlur: 5,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
        },
        select: {
          lineWidth: DEFAULT_PIE_LINE_WIDTH,
          strokeStyle: '#ffffff',
          shadowColor: '#cccccc',
          shadowBlur: 5,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          restSeries: {
            areaOpacity: 0.3,
          },
          areaOpacity: 1,
        },
      };
    default:
      return {};
  }
}

export function getDefaultTheme(series: RawSeries, isNestedPieChart = false): Theme {
  const result = Object.keys(series).reduce<Theme>(
    (acc, seriesName) => ({
      ...acc,
      series: {
        ...acc.series,
        [seriesName]: getSeriesTheme(seriesName, isNestedPieChart),
      },
    }),
    defaultTheme as Theme
  );

  if (isNestedPieChart) {
    const aliasNames = getNestedPieChartAliasNames(series);

    result.series.pie = aliasNames.reduce(
      (acc, cur) => ({
        ...acc,
        [cur]: getSeriesTheme('pie', isNestedPieChart),
      }),
      {}
    );
  }

  return result;
}
