import { NestedPieChartOptions, NestedPieSeriesData } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import {
  browserUsageData2,
  groupedBrowserUsageData,
  browserUsageData2WithNull,
  groupedBrowserUsageDataWithNull,
} from './data';
import NestedPieChart from '@src/charts/nestedPieChart';
import { NestedPieChartThemeOptions } from '@t/theme';
import '@src/css/chart.css';
import { createResponsiveChart } from './util';

export default {
  title: 'chart/Nested Pie',
};

function createChart(data: NestedPieSeriesData, customOptions: NestedPieChartOptions = {}) {
  const el = document.createElement('div');
  const options = deepMergedCopy(
    {
      chart: {
        width: 660,
        height: 560,
        title: 'Usage share of web browsers',
      },
    } as NestedPieChartOptions,
    customOptions || {}
  );

  el.style.width = `${options.chart?.width}px`;
  el.style.height = `${options.chart?.height}px`;

  const chart = new NestedPieChart({ el, data, options });

  return { el, chart };
}

export const basic = () => {
  const { el } = createChart(browserUsageData2, {
    series: {
      browsers: {
        radiusRange: {
          inner: '20%',
          outer: '50%',
        },
      },
      versions: {
        radiusRange: {
          inner: '55%',
          outer: '85%',
        },
      },
    },
  });

  return el;
};

export const basicWithNullData = () => {
  const { el } = createChart(browserUsageData2WithNull, {
    series: {
      browsers: {
        radiusRange: {
          inner: '20%',
          outer: '50%',
        },
      },
      versions: {
        radiusRange: {
          inner: '55%',
          outer: '85%',
        },
      },
      dataLabels: {
        visible: true,
        pieSeriesName: { visible: false },
      },
      clockwise: false,
    },
  } as NestedPieChartOptions);

  return el;
};

export const grouped = () => {
  const { el } = createChart(groupedBrowserUsageData, {
    series: {
      browsers: {
        radiusRange: {
          inner: '20%',
          outer: '50%',
        },
      },
      versions: {
        radiusRange: {
          inner: '55%',
          outer: '85%',
        },
      },
    },
  });

  return el;
};

export const groupedWithNullData = () => {
  const { el } = createChart(groupedBrowserUsageDataWithNull, {
    series: {
      browsers: {
        radiusRange: {
          inner: '20%',
          outer: '50%',
        },
      },
      versions: {
        radiusRange: {
          inner: '55%',
          outer: '85%',
        },
      },
    },
  });

  return el;
};

export const dataLabels = () => {
  const { el } = createChart(groupedBrowserUsageData, {
    series: {
      browsers: {
        radiusRange: {
          inner: '20%',
          outer: '50%',
        },
        dataLabels: {
          visible: true,
          pieSeriesName: {
            visible: false,
          },
        },
      },
      versions: {
        radiusRange: {
          inner: '55%',
          outer: '85%',
        },
        dataLabels: {
          visible: true,
          anchor: 'outer',
          pieSeriesName: {
            visible: false,
            anchor: 'outer',
          },
        },
      },
    },
  });

  return el;
};

export const selectable = () => {
  const { el } = createChart(groupedBrowserUsageData, {
    series: {
      browsers: {
        radiusRange: {
          inner: '30%',
          outer: '60%',
        },
      },
      versions: {
        radiusRange: {
          inner: '70%',
          outer: '100%',
        },
      },
      selectable: true,
    },
  } as NestedPieChartOptions);

  return el;
};

export const responsive = () => {
  return createResponsiveChart<NestedPieSeriesData, NestedPieChartOptions>(
    NestedPieChart,
    groupedBrowserUsageData,
    {
      chart: {
        title: 'Usage share of web browsers',
        width: 'auto',
        height: 'auto',
      },
    }
  );
};

export const theme = () => {
  const themeOptions: NestedPieChartThemeOptions = {
    series: {
      browsers: {
        colors: ['#eef4c4', '#77543f', '#b7c72e', '#5b9aa0', '#30076f', '#622569'],
        lineWidth: 5,
        strokeStyle: '#0000ff',
        hover: {
          color: '#0000ff',
          lineWidth: 5,
          strokeStyle: '#000000',
          shadowColor: 'rgba(0, 0, 0, 0.5)',
          shadowBlur: 10,
        },
      },
      versions: {
        colors: [
          '#cddbda',
          '#efd1d1',
          '#ea005e',
          '#fece2f',
          '#fc6104',
          '#dd2429',
          '#ebc7ff',
          '#fece2f',
          '#dd2429',
          '#ff8d3a',
          '#fc6104',
          '#5ac18e',
          '#8570ff',
        ],
        lineWidth: 2,
        strokeStyle: '#ff0000',
        hover: {
          color: '#ff0000',
          lineWidth: 2,
          strokeStyle: '#000000',
          shadowColor: 'rgba(0, 0, 0, 0.5)',
          shadowBlur: 10,
        },
      },
    },
  };

  const { el } = createChart(browserUsageData2, {
    series: {
      browsers: {
        radiusRange: {
          inner: '30%',
          outer: '60%',
        },
      },
      versions: {
        radiusRange: {
          inner: '70%',
          outer: '100%',
        },
      },
    },
    theme: themeOptions,
  });

  return el;
};

export const groupedTheme = () => {
  const themeOptions: NestedPieChartThemeOptions = {
    series: {
      colors: ['#eef4c4', '#77543f', '#b7c72e', '#5b9aa0', '#30076f', '#622569', '#f75294'],
      lineWidth: 5,
      strokeStyle: '#cccccc',
      browsers: {
        hover: { color: '#6D9B46' },
      },
      versions: {
        hover: { color: '#3A9278' },
      },
    },
  };

  const { el } = createChart(groupedBrowserUsageData, {
    series: {
      browsers: {
        radiusRange: {
          inner: '30%',
          outer: '60%',
        },
      },
      versions: {
        radiusRange: {
          inner: '70%',
          outer: '100%',
        },
      },
    },
    theme: themeOptions,
  });

  return el;
};

export const dataLabelsWithTheme = () => {
  const themeOptions: NestedPieChartThemeOptions = {
    series: {
      browsers: {
        dataLabels: {
          fontFamily: 'fantasy',
          fontSize: 13,
          useSeriesColor: true,
          textBubble: {
            visible: true,
            backgroundColor: '#333333',
            borderRadius: 5,
            borderColor: '#ff0000',
            borderWidth: 3,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            shadowBlur: 0,
            shadowColor: 'rgba(0, 0, 0, 0)',
          },
        },
      },
      versions: {
        dataLabels: {
          fontFamily: 'monaco',
          useSeriesColor: true,
          lineWidth: 2,
          textStrokeColor: '#ffffff',
          shadowColor: '#ffffff',
          shadowBlur: 4,
          callout: {
            lineWidth: 3,
            lineColor: '#f44336',
            useSeriesColor: false,
          },
          pieSeriesName: {
            useSeriesColor: false,
            color: '#f44336',
            fontFamily: 'fantasy',
            fontSize: 13,
            textBubble: {
              visible: true,
              paddingX: 1,
              paddingY: 1,
              backgroundColor: 'rgba(158, 158, 158, 0.3)',
              shadowOffsetX: 0,
              shadowOffsetY: 0,
              shadowBlur: 0,
              shadowColor: 'rgba(0, 0, 0, 0)',
            },
          },
        },
      },
    },
  };
  const { el } = createChart(groupedBrowserUsageData, {
    series: {
      browsers: {
        dataLabels: {
          visible: true,
        },
      },
      versions: {
        dataLabels: {
          visible: true,
          pieSeriesName: { visible: true, anchor: 'outer' },
        },
      },
    },
    theme: themeOptions,
  });

  return el;
};

export const noData = () => {
  const data = {
    series: [],
    categories: [],
  };
  const { el } = createChart(data);

  return el;
};
