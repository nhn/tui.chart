import { RawSeries } from '@t/store/store';
import { Theme } from '@t/theme';
import { getNestedPieChartAliasNames } from '@src/helpers/pieSeries';

export const DEFAULT_LINE_SERIES_WIDTH = 2;
export const DEFAULT_LINE_SERIES_DOT_RADIUS = 3;
export const DEFAULT_LINE_SERIES_HOVER_DOT_RADIUS = DEFAULT_LINE_SERIES_DOT_RADIUS + 2;
const DEFAULT_AREA_OPACITY = 0.3;
const DEFAULT_AREA_SELECTED_SERIES_OPACITY = DEFAULT_AREA_OPACITY;
const DEFAULT_AREA_UNSELECTED_SERIES_OPACITY = 0.06;

export const radarDefault = {
  LINE_WIDTH: 2,
  DOT_RADIUS: 3,
  HOVER_DOT_RADIUS: 4,
  SELECTED_SERIES_OPACITY: 0.3,
  UNSELECTED_SERIES_OPACITY: 0.05,
};

export const boxDefault = {
  HOVER_THICKNESS: 4,
  BOX_HOVER: {
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffsetX: 2,
    shadowOffsetY: 2,
    shadowBlur: 6,
  },
};

const boxplotDefault = {
  OUTLIER_RADIUS: 4,
  OUTLIER_BORDER_WIDTH: 2,
  LINE_TYPE: {
    whisker: { lineWidth: 1 },
    maximum: { lineWidth: 1 },
    minimum: { lineWidth: 1 },
    median: { lineWidth: 1, color: '#ffffff' },
  },
};

export const DEFAULT_BULLET_RANGE_OPACITY = [0.5, 0.3, 0.1];
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

export const axisTitleTheme = {
  fontSize: 11,
  fontFamily: 'Arial',
  fontWeight: 700,
  color: '#bbbbbb',
};

const axisLabelTheme = {
  fontSize: 11,
  fontFamily: 'Arial',
  fontWeight: 'normal',
  color: '#333333',
};

export const defaultTheme = {
  chart: {
    fontFamily: 'Arial',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Arial',
    fontWeight: 100,
    color: '#333333',
  },
  yAxis: {
    title: { ...axisTitleTheme },
    label: { ...axisLabelTheme },
    width: 1,
    color: '#333333',
  },
  xAxis: {
    title: { ...axisTitleTheme },
    label: { ...axisLabelTheme },
    width: 1,
    color: '#333333',
  },
  legend: {
    label: {
      color: '#333333',
      fontSize: 11,
      fontWeight: 'normal',
      fontFamily: 'Arial',
    },
  },
  tooltip: {
    background: 'rgba(85, 85, 85, 0.95)',
    borderColor: 'rgba(255, 255, 255, 0)',
    borderWidth: 0,
    borderRadius: 3,
    borderStyle: 'solid',
    body: {
      fontSize: 12,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'normal',
      color: '#ffffff',
    },
    header: {
      fontSize: 13,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      color: '#ffffff',
    },
  },
  plot: {
    lineColor: 'rgba(0, 0, 0, 0.05)',
    backgroundColor: '#ffffff',
  },
  exportMenu: {
    button: {
      backgroundColor: '#f4f4f4',
      borderRadius: 5,
      borderWidth: 1,
      borderColor: '#f4f4f4',
      color: '#555555',
      xIconLineWidth: 2,
    },
    panel: {
      borderWidth: 1,
      borderRadius: 0,
      borderColor: '#bab9ba',
      header: {
        fontFamily: 'Arial',
        color: '#333333',
        fontSize: 11,
        fontWeight: 400,
        backgroundColor: '#f4f4f4',
      },
      body: {
        fontFamily: 'Arial',
        color: '#333333',
        fontSize: 11,
        fontWeight: 400,
        backgroundColor: '#ffffff',
      },
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
          borderWidth: boxDefault.HOVER_THICKNESS,
          borderColor: '#ffffff',
        },
        select: {
          borderWidth: boxDefault.HOVER_THICKNESS,
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
        areaOpacity: radarDefault.SELECTED_SERIES_OPACITY,
        hover: {
          dot: {
            radius: radarDefault.HOVER_DOT_RADIUS,
            borderColor: '#ffffff',
            borderWidth: 2,
          },
        },
        select: {
          dot: {
            radius: radarDefault.HOVER_DOT_RADIUS,
            borderColor: '#ffffff',
            borderWidth: 2,
          },
          restSeries: {
            areaOpacity: radarDefault.UNSELECTED_SERIES_OPACITY,
          },
          areaOpacity: radarDefault.SELECTED_SERIES_OPACITY,
        },
        dot: {
          radius: radarDefault.DOT_RADIUS,
        },
      };
    case 'bar':
    case 'column':
      return {
        areaOpacity: 1,
        hover: {
          ...boxDefault.BOX_HOVER,
          borderWidth: boxDefault.HOVER_THICKNESS,
          borderColor: '#ffffff',
          groupedRect: {
            color: '#000000',
            opacity: 0.05,
          },
        },
        select: {
          ...boxDefault.BOX_HOVER,
          borderWidth: boxDefault.HOVER_THICKNESS,
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
          color: 'rgba(51, 85, 139, 0.3)',
          lineWidth: 1,
          dashSegments: [],
        },
      };
    case 'bullet':
      return {
        areaOpacity: 1,
        barWidthRatios: {
          rangeRatio: 1,
          bulletRatio: 0.5,
          markerRatio: 0.8,
        },
        markerLineWidth: 1,
        borderWidth: 0,
        borderColor: 'rgba(255, 255, 255, 0)',
        hover: {
          ...boxDefault.BOX_HOVER,
          borderWidth: boxDefault.HOVER_THICKNESS,
          borderColor: '#ffffff',
        },
        select: {
          ...boxDefault.BOX_HOVER,
          borderWidth: boxDefault.HOVER_THICKNESS,
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
        barWidthRatios: {
          barRatio: 1,
          minMaxBarRatio: 0.5,
        },
        markerLineWidth: 1,
        dot: {
          color: '#ffffff',
          radius: boxplotDefault.OUTLIER_RADIUS,
          borderWidth: boxplotDefault.OUTLIER_BORDER_WIDTH,
          useSeriesColor: false,
        },
        rect: { borderWidth: 0 },
        line: { ...boxplotDefault.LINE_TYPE },
        hover: {
          ...boxDefault.BOX_HOVER,
          rect: { borderWidth: boxDefault.HOVER_THICKNESS, borderColor: '#ffffff' },
          dot: {
            radius: boxplotDefault.OUTLIER_RADIUS,
            borderWidth: 0,
            useSeriesColor: true,
          },
          line: { ...boxplotDefault.LINE_TYPE },
        },
        select: {
          ...boxDefault.BOX_HOVER,
          rect: { borderWidth: boxDefault.HOVER_THICKNESS, borderColor: '#ffffff' },
          dot: {
            radius: boxplotDefault.OUTLIER_RADIUS,
            borderWidth: boxplotDefault.OUTLIER_BORDER_WIDTH,
            useSeriesColor: true,
          },
          line: { ...boxplotDefault.LINE_TYPE },
          restSeries: {
            areaOpacity: 0.2,
          },
          areaOpacity: 1,
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
