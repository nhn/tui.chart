import { RawSeries } from '@t/store/store';
import { BOX_HOVER_THICKNESS } from '@src/helpers/boxStyle';
import { Theme } from '@t/theme';

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
export const DEFAULT_BULLET_RANGE_OPACITY = [0.5, 0.3, 0.1];
const DEFAULT_BOX_HOVER = {
  shadowColor: 'rgba(0, 0, 0, 0.3)',
  shadowOffsetX: 2,
  shadowOffsetY: 2,
  shadowBlur: 6,
};
const DEFAULT_BOXPLOT_OUTLIER_RADIUS = 4;
const DEFAULT_BOXPLOT_OUTLIER_BORDER_WIDTH = 2;
const DEFAULT_BOXPLOT_LINE_TYPE = {
  whisker: { lineWidth: 1 },
  maximum: { lineWidth: 1 },
  minimum: { lineWidth: 1 },
  median: { lineWidth: 1, color: '#ffffff' },
};

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
function getSeriesTheme(seriesName: string) {
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
    case 'bar':
    case 'column':
      return {
        areaOpacity: 1,
        hover: {
          ...DEFAULT_BOX_HOVER,
          borderWidth: BOX_HOVER_THICKNESS,
          borderColor: '#ffffff',
          groupedRect: {
            color: '#000000',
            opacity: 0.05,
          },
        },
        select: {
          ...DEFAULT_BOX_HOVER,
          borderWidth: BOX_HOVER_THICKNESS,
          borderColor: '#ffffff',
          groupedRect: {
            color: '#000000',
            opacity: 0.2,
          },
          restSeries: {
            areaOpacity: 0.2,
          },
          areaOpacity: 1,
        },
        connector: {
          borderStyle: 'solid',
          borderColor: 'rgba(51, 85, 139, 0.3)',
          borderWidth: 1,
          dashSegments: [5, 5],
        },
      };
    case 'bullet':
      return {
        areaOpacity: 1,
        barWidthRatios: [1, 0.5, 0.8],
        markerLineWidth: 1,
        hover: {
          ...DEFAULT_BOX_HOVER,
          borderWidth: BOX_HOVER_THICKNESS,
          borderColor: '#ffffff',
        },
        select: {
          ...DEFAULT_BOX_HOVER,
          borderWidth: BOX_HOVER_THICKNESS,
          borderColor: '#ffffff',
          restSeries: {
            areaOpacity: 0.2,
          },
          areaOpacity: 1,
        },
      };
    case 'boxPlot':
      return {
        areaOpacity: 1,
        barWidthRatios: [1, 0.5],
        markerLineWidth: 1,
        dot: {
          color: '#ffffff',
          radius: DEFAULT_BOXPLOT_OUTLIER_RADIUS,
          borderWidth: DEFAULT_BOXPLOT_OUTLIER_BORDER_WIDTH,
          useSeriesColor: false,
        },
        rect: { borderWidth: 0 },
        line: { ...DEFAULT_BOXPLOT_LINE_TYPE },
        hover: {
          ...DEFAULT_BOX_HOVER,
          rect: { borderWidth: BOX_HOVER_THICKNESS, borderColor: '#ffffff' },
          dot: {
            radius: DEFAULT_BOXPLOT_OUTLIER_RADIUS,
            borderWidth: 0,
            useSeriesColor: true,
          },
          line: { ...DEFAULT_BOXPLOT_LINE_TYPE },
        },
        select: {
          ...DEFAULT_BOX_HOVER,
          rect: { borderWidth: BOX_HOVER_THICKNESS, borderColor: '#ffffff' },
          dot: {
            radius: DEFAULT_BOXPLOT_OUTLIER_RADIUS,
            borderWidth: DEFAULT_BOXPLOT_OUTLIER_BORDER_WIDTH,
            useSeriesColor: true,
          },
          line: { ...DEFAULT_BOXPLOT_LINE_TYPE },
          restSeries: {
            areaOpacity: 0.2,
          },
          areaOpacity: 1,
        },
      };
    default:
      return {};
  }
}

export function getDefaultTheme(series: RawSeries): Theme {
  return Object.keys(series).reduce<Theme>(
    (acc, seriesName) => ({
      ...acc,
      series: {
        ...acc.series,
        [seriesName]: getSeriesTheme(seriesName),
      },
    }),
    defaultTheme as Theme
  );
}
