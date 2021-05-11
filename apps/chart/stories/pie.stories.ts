import PieChart from '@src/charts/pieChart';
import { deepMergedCopy } from '@src/helpers/utils';
import { PieSeriesData, PieChartOptions } from '@t/options';
import { browserUsageData, browserUsageDataWithNull } from './data';
import { withKnobs, number } from '@storybook/addon-knobs';
import { PieChartThemeOptions } from '@t/theme';
import '@src/css/chart.css';
import { createResponsiveChart } from './util';

export default {
  title: 'chart/Pie',
  decorators: [withKnobs],
};

function createChart(data: PieSeriesData, customOptions: PieChartOptions = {}) {
  const el = document.createElement('div');
  const options = deepMergedCopy(
    {
      chart: {
        width: 660,
        height: 560,
        title: 'Usage share of web browsers',
      },
    } as PieChartOptions,
    customOptions || {}
  );

  el.style.width = `${options.chart?.width}px`;
  el.style.height = `${options.chart?.height}px`;

  const chart = new PieChart({ el, data, options });

  return { el, chart };
}

export const basic = () => {
  const { el } = createChart(browserUsageData);

  return el;
};

export const basicWithNullData = () => {
  const { el } = createChart(browserUsageDataWithNull, {
    series: {
      dataLabels: {
        visible: true,
      },
      clockwise: false,
    },
  });

  return el;
};

export const dataLabels = () => {
  const { el } = createChart(browserUsageData, {
    series: {
      dataLabels: {
        visible: true,
      },
    },
  });

  return el;
};

export const withCenterSeriesName = () => {
  const { el } = createChart(browserUsageData, {
    series: {
      dataLabels: {
        visible: true,
        pieSeriesName: {
          visible: true,
        },
      },
    },
  });

  return el;
};

export const withOuterSeriesName = () => {
  const { el } = createChart(browserUsageData, {
    series: {
      dataLabels: {
        visible: true,
        pieSeriesName: {
          visible: true,
          anchor: 'outer',
        },
      },
    },
    legend: {
      visible: false,
    },
  });

  return el;
};

export const counterClockwise = () => {
  const { el } = createChart(browserUsageData, {
    series: {
      clockwise: false,
      dataLabels: {
        visible: true,
        pieSeriesName: {
          visible: true,
          anchor: 'outer',
        },
      },
    },
    legend: {
      visible: true,
    },
  });

  return el;
};

export const useRadiusRangeWithPixel = () => {
  const inner = number('radiusRange.inner', 50, {
    range: true,
    min: 0,
    max: 180,
    step: 10,
  });

  const outer = number('radiusRange.outer', 150, {
    range: true,
    min: 100,
    max: 200,
    step: 50,
  });

  const { el } = createChart(browserUsageData, {
    series: {
      radiusRange: {
        inner,
        outer,
      },
    },
  });

  return el;
};

export const donut = () => {
  const { el } = createChart(browserUsageData, {
    series: {
      radiusRange: {
        inner: '40%',
        outer: '100%',
      },
    },
  });

  return el;
};

export const donutWithDataLabels = () => {
  const { el } = createChart(browserUsageData, {
    series: {
      radiusRange: {
        inner: '40%',
        outer: '100%',
      },
      dataLabels: {
        visible: true,
      },
    },
  });

  return el;
};

export const donutWithOuterDataLabels = () => {
  const { el } = createChart(browserUsageData, {
    series: {
      clockwise: false,
      radiusRange: {
        inner: '40%',
        outer: '90%',
      },
      dataLabels: {
        visible: true,
        anchor: 'outer',
        pieSeriesName: {
          visible: true,
          anchor: 'outer',
        },
      },
    },
    legend: {
      visible: false,
    },
  });

  return el;
};

export const donutWithCenterSeriesName = () => {
  const { el } = createChart(browserUsageData, {
    series: {
      radiusRange: {
        inner: '40%',
        outer: '100%',
      },
      dataLabels: {
        visible: true,
        pieSeriesName: {
          visible: true,
        },
      },
    },
    legend: {
      visible: false,
    },
  });

  return el;
};

export const donutWithOuterSeriesName = () => {
  const { el } = createChart(browserUsageData, {
    series: {
      radiusRange: {
        inner: '40%',
        outer: '90%',
      },
      dataLabels: {
        visible: true,
        pieSeriesName: {
          visible: true,
          anchor: 'outer',
        },
      },
    },
    legend: {
      visible: false,
    },
  });

  return el;
};

export const semicircle = () => {
  const { el } = createChart(browserUsageData, {
    chart: {
      width: 660,
      height: 350,
      title: 'Usage share of web browsers',
    },
    series: {
      radiusRange: {
        inner: '40%',
        outer: '100%',
      },
      angleRange: {
        start: -90,
        end: 90,
      },
      dataLabels: {
        visible: true,
        pieSeriesName: {
          visible: true,
          anchor: 'outer',
        },
      },
    },
    legend: {
      align: 'bottom',
      visible: true,
    },
  });

  return el;
};

export const selectable = () => {
  const { el } = createChart(browserUsageData, {
    series: {
      selectable: true,
    },
  });

  return el;
};

export const responsive = () => {
  return createResponsiveChart<PieSeriesData, PieChartOptions>(PieChart, browserUsageData, {
    chart: {
      title: 'Usage share of web browsers',
      width: 'auto',
      height: 'auto',
    },
  });
};

export const theme = () => {
  const themeOptions: PieChartThemeOptions = {
    series: {
      colors: ['#F94144', '#F3722C', '#F8961E', '#F9C74F', '#90BE6D', '#43AA8B', '#577590'],
      lineWidth: 2,
      strokeStyle: '#000000',
      hover: {
        color: '#335F70',
        lineWidth: 2,
        strokeStyle: '#000000',
        shadowColor: 'rgba(0, 0, 0, 0.5)',
        shadowBlur: 10,
      },
      select: {
        color: '#203B46',
        lineWidth: 2,
        strokeStyle: '#000000',
        shadowColor: 'rgba(0, 0, 0, 0.5)',
        shadowBlur: 10,
        restSeries: {
          areaOpacity: 0.5,
        },
        areaOpacity: 1,
      },
      areaOpacity: 1,
    },
  };

  const { el } = createChart(browserUsageData, {
    theme: themeOptions,
    series: { selectable: true },
  });

  return el;
};

export const dataLabelsWithTheme = () => {
  const themeOptions: PieChartThemeOptions = {
    series: {
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
  };
  const { el } = createChart(browserUsageData, {
    series: {
      dataLabels: { visible: true, pieSeriesName: { visible: true, anchor: 'outer' } },
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
  const { el } = createChart(data, {});

  return el;
};
