import AreaChart from '@src/charts/areaChart';
import {
  AreaChartOptions,
  AreaSeriesData,
  BaseChartOptions,
  RadialBarSeriesData,
  RadialBarChartOptions,
} from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { avgTemperatureData, olympicMedalData } from './data';
import { withKnobs, boolean, radios } from '@storybook/addon-knobs';
import '@src/css/chart.css';
import RadialBarChart from '@src/charts/radialBarChart';

export default {
  title: 'chart/Common Component Theme',
  decorators: [withKnobs],
};

const width = 1000;
const height = 500;
const defaultOptions = {
  chart: {
    width,
    height,
  },
  yAxis: {},
  xAxis: {},
  series: {},
  tooltip: {},
  plot: {},
};

function createChart(data: AreaSeriesData, customOptions: AreaChartOptions = {}) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions);

  el.style.width = `${options.chart?.width}px`;
  el.style.height = `${options.chart?.height}px`;

  const chart = new AreaChart({ el, data, options });

  return { el, chart };
}

function createRadialBarChart(
  data: RadialBarSeriesData,
  customOptions: RadialBarChartOptions = {}
) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions || {});

  el.style.width = `${options.chart?.width}px`;
  el.style.height = `${options.chart?.height}px`;

  const chart = new RadialBarChart({ el, data, options });

  return { el, chart };
}

export const globalTheme = () => {
  const { el } = createChart(avgTemperatureData, {
    chart: { title: 'Average Temperature', width: 1000 } as BaseChartOptions,
    xAxis: { pointOnColumn: boolean('pointOnColumn', false), title: { text: 'Month' } },
    yAxis: { title: 'Temperature (Celsius)' },
    theme: {
      chart: {
        fontFamily: 'Verdana',
        backgroundColor: 'rgba(9, 206, 115, 0.1)',
      },
      title: {
        fontFamily: 'Comic Sans MS',
      },
    },
  });

  return el;
};

export const title = () => {
  const { el } = createChart(avgTemperatureData, {
    chart: { title: 'Average Temperature' } as BaseChartOptions,
    xAxis: { pointOnColumn: boolean('pointOnColumn', false), title: { text: 'Month' } },
    yAxis: { title: 'Temperature (Celsius)' },
    theme: {
      title: {
        fontFamily: 'Comic Sans MS',
        fontSize: 45,
        fontWeight: 100,
        color: '#ff416d',
      },
    },
  });

  return el;
};

export const axis = () => {
  const { el } = createChart(avgTemperatureData, {
    chart: { title: 'Average Temperature' },
    xAxis: { title: { text: 'Month' } },
    yAxis: [
      {
        title: 'Temperature (Celsius)',
      },
      {
        title: 'Percent (%)',
        scale: {
          min: 0,
          max: 100,
        },
      },
    ],
    theme: {
      xAxis: {
        title: {
          fontFamily: 'Impact',
          fontSize: 15,
          fontWeight: 400,
          color: '#ff416d',
        },
        label: {
          fontFamily: 'fantasy',
          fontSize: 11,
          fontWeight: 700,
          color: '#6EB5FF',
        },
        width: 2,
        color: '#6655EE',
      },
      yAxis: [
        {
          title: {
            fontFamily: 'Impact',
            fontSize: 17,
            fontWeight: 400,
            color: '#03C03C',
          },
          label: {
            fontFamily: 'cursive',
            fontSize: 11,
            fontWeight: 700,
            color: '#6655EE',
          },
          width: 3,
          color: '#88ddEE',
        },
        {
          title: {
            fontFamily: 'Comic Sans MS',
            fontSize: 13,
            fontWeight: 600,
            color: '#00a9ff',
          },
          label: {
            fontFamily: 'cursive',
            fontSize: 11,
            fontWeight: 700,
            color: '#FFABAB',
          },
          width: 3,
          color: '#AFFCCA',
        },
      ],
    },
  });

  return el;
};

export const radialAxes = () => {
  const { el } = createRadialBarChart(olympicMedalData, {
    verticalAxis: {
      label: { margin: 10 },
    },
    circularAxis: {
      label: { margin: 10 },
    },
    theme: {
      series: {
        barWidth: 2,
      },
      verticalAxis: {
        label: {
          color: '#fff',
          textBubble: {
            visible: true,
            borderRadius: 5,
            backgroundColor: 'rgba(7, 59, 76, 1)',
            paddingX: 5,
            paddingY: 4,
          },
        },
      },
      circularAxis: {
        strokeStyle: 'rgba(7, 59, 76, 0.3)',
        dotColor: 'rgba(7, 59, 76, 0.8)',
        label: {
          color: '#073b4c',
        },
      },
    },
  });

  return el;
};

export const legend = () => {
  const { el } = createChart(avgTemperatureData, {
    chart: { title: 'Average Temperature' } as BaseChartOptions,
    xAxis: { title: { text: 'Month' } },
    yAxis: { title: 'Temperature (Celsius)' },
    legend: {
      align: radios('align', { top: 'top', bottom: 'bottom', left: 'left', right: 'right' }, 'top'),
    },
    theme: {
      legend: {
        label: {
          fontFamily: 'cursive',
          fontSize: 15,
          fontWeight: 700,
          color: '#ff416d',
        },
      },
    },
  });

  return el;
};

export const tooltip = () => {
  const { el } = createChart(avgTemperatureData, {
    chart: { title: 'Average Temperature' },
    xAxis: { title: { text: 'Month' } },
    yAxis: [
      {
        title: 'Temperature (Celsius)',
      },
      {
        title: 'Percent (%)',
        scale: {
          min: 0,
          max: 100,
        },
      },
    ],
    theme: {
      tooltip: {
        background: '#80CEE1',
        borderColor: '#3065AC',
        borderWidth: 10,
        borderRadius: 20,
        borderStyle: 'double',
        header: {
          fontSize: 15,
          fontWeight: 700,
          color: '#333333',
          fontFamily: 'monospace',
        },
        body: {
          fontSize: 11,
          fontWeight: 700,
          color: '#a66033',
          fontFamily: 'monospace',
        },
      },
    },
  });

  return el;
};

export const plot = () => {
  const { el } = createChart(avgTemperatureData, {
    theme: {
      plot: {
        vertical: {
          lineColor: 'rgba(60, 80, 180, 0.3)',
          lineWidth: 5,
          dashSegments: [5, 20],
        },
        horizontal: {
          lineColor: 'rgba(0, 0, 0, 0)',
        },
        backgroundColor: 'rgba(60, 80, 180, 0.1)',
      },
    },
  });

  return el;
};

export const exportMenu = () => {
  const { el } = createChart(avgTemperatureData, {
    theme: {
      exportMenu: {
        button: {
          backgroundColor: '#ff0000',
          borderRadius: 5,
          borderWidth: 2,
          borderColor: '#000000',
          xIcon: {
            color: '#ffffff',
            lineWidth: 3,
          },
          dotIcon: {
            color: '#ffffff',
            width: 10,
            height: 3,
            gap: 1,
          },
        },
        panel: {
          borderColor: '#ff0000',
          borderWidth: 2,
          borderRadius: 10,
          header: {
            fontSize: 15,
            fontFamily: 'fantasy',
            color: '#ffeb3b',
            fontWeight: 700,
            backgroundColor: '#673ab7',
          },
          body: {
            fontSize: 12,
            fontFamily: 'fantasy',
            color: '#ff0000',
            fontWeight: '500',
            backgroundColor: '#000000',
          },
        },
      },
    },
  });

  return el;
};
