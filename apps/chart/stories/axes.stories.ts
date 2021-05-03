import LineChart from '@src/charts/lineChart';
import {
  HeatmapChartOptions,
  HeatmapSeriesData,
  LineSeriesData,
  RadarChartOptions,
  RadarSeriesData,
  RadialBarChartOptions,
  RadialBarSeriesData,
} from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { withKnobs } from '@storybook/addon-knobs';
import '@src/css/chart.css';
import { budgetData, budgetData2, temperatureAverageDataForHeatmap, temperatureData } from './data';
import HeatmapChart from '@src/charts/heatmapChart';
import BarChart from '@src/charts/barChart';
import RadarChart from '@src/charts/radarChart';
import RadialBarChart from '@src/charts/radialBarChart';

export default {
  title: 'chart/Axes',
  decorators: [withKnobs],
};

const width = 1000;
const height = 500;
const defaultOptions = {
  chart: {
    width,
    height,
    title: '24-hr Average Temperature',
  },
  xAxis: { title: 'Month' },
  yAxis: { title: 'Amount' },
  series: {},
  tooltip: {},
  plot: {},
};

function createChart(data: LineSeriesData, customOptions?: Record<string, any>) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions || {});

  el.style.width = `${width}px`;
  el.style.height = `${height}px`;

  const chart = new LineChart({ el, data, options });

  return { el, chart };
}

function createHeatmapChart(data: HeatmapSeriesData, customOptions: HeatmapChartOptions = {}) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions);

  el.style.width = `${width}px`;
  el.style.height = `${height}px`;

  const chart = new HeatmapChart({ el, data, options });

  return { el, chart };
}

function createBarChart(data, customOptions: Record<string, any> = {}) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions);

  el.style.width = `${options.chart?.width}px`;
  el.style.height = `${options.chart?.height}px`;

  const chart = new BarChart({ el, data, options });

  return { el, chart };
}

function createRadarChart(data: RadarSeriesData, customOptions: RadarChartOptions = {}) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions || {});

  el.style.width = `${options.chart?.width}px`;
  el.style.height = `${options.chart?.height}px`;

  const chart = new RadarChart({ el, data, options });

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

export const normalAxesFormatter = () => {
  const { el } = createChart(temperatureData, {
    xAxis: {
      label: {
        formatter: (value) => {
          const index = Number(value.split('-')[1]);
          const animals = ['🐶', '🐱', '🦊', '🐻'];

          return `${animals[index % animals.length]} ${value}`;
        },
      },
      date: {
        format: 'YY-MM-DD',
      },
    },
    yAxis: {
      label: {
        formatter: (value) => {
          if (value < 0) {
            return `${value} ❄️`;
          }
          if (value > 25) {
            return `${value} 🔥`;
          }

          return `️${value} ☀️`;
        },
      },
    },
  });

  return el;
};

export const secondaryAxesFormatter = () => {
  const { el } = createChart(temperatureData, {
    xAxis: {
      label: {
        formatter: (value) => {
          const index = Number(value.split('-')[1]);
          const animals = ['🐶', '🐱', '🦊', '🐻'];

          return `${animals[index % animals.length]} ${value}`;
        },
        margin: 10,
      },
      date: {
        format: 'YY-MM-DD',
      },
    },
    yAxis: [
      {
        label: {
          formatter: (value) => {
            if (value < 0) {
              return `${value} ❄️`;
            }
            if (value > 25) {
              return `${value} 🔥`;
            }

            return `️${value} ☀️`;
          },
          margin: 20,
        },
      },
      {
        scale: {
          min: 0,
          max: 100,
        },
        label: {
          formatter: (value) => {
            return `️${value} 😐`;
          },
          margin: 30,
        },
      },
    ],
  });

  return el;
};

export const heatmapAxesFormatter = () => {
  const { el } = createHeatmapChart(temperatureAverageDataForHeatmap, {
    xAxis: {
      label: {
        formatter: (value, axisLabelInfo) => {
          const { index } = axisLabelInfo;
          const animals = ['🐶', '🐱', '🦊', '🐻'];

          return `${animals[index % animals.length]} ${value}`;
        },
      },
    },
    yAxis: {
      label: {
        formatter: (value, axisLabelInfo) => {
          const { index } = axisLabelInfo;
          const animals = ['👻', '😻', '🙋‍♂️', '🐉', '🔥'];

          return `${animals[index % animals.length]} ${value}`;
        },
      },
    },
  });

  return el;
};

export const barFormatter = () => {
  const { el } = createBarChart(budgetData, {
    xAxis: { label: { formatter: (value) => `😄${value}` } },
  });

  return el;
};

export const radarFormatter = () => {
  const { el } = createRadarChart(budgetData2, {
    legend: {
      visible: true,
      align: 'bottom',
    },
    verticalAxis: {
      label: {
        interval: 2,
        formatter: (value) => `👻${value}`,
      },
      scale: {
        stepSize: 1000,
      },
    },
  });

  return el;
};

export const radialBarFormatter = () => {
  const { el } = createRadialBarChart(budgetData, {
    verticalAxis: {
      label: {
        formatter: (value) => `👻${value}`,
        interval: 3,
      },
    },
    circularAxis: {
      label: {
        formatter: (value) => `$${value}`,
        interval: 2,
      },
      tick: { interval: 1 },
      scale: {
        stepSize: 1000,
      },
    },
  });

  return el;
};

export const normalAxesLabelMargin = () => {
  const { el } = createChart(temperatureData, {
    xAxis: {
      label: {
        margin: -5,
      },
      date: {
        format: 'YY-MM-DD',
      },
    },
    yAxis: [
      {
        label: {
          margin: 100,
        },
      },
      {
        scale: {
          min: 0,
          max: 100,
        },
        label: {
          margin: 30,
        },
      },
    ],
  });

  return el;
};

export const heatmapAxesLabelMargin = () => {
  const { el } = createHeatmapChart(temperatureAverageDataForHeatmap, {
    xAxis: {
      label: {
        margin: 40,
      },
    },
    yAxis: {
      label: {
        margin: 30,
      },
    },
  });

  return el;
};

export const radialAxesLabelMargin = () => {
  const { el } = createRadialBarChart(budgetData, {
    verticalAxis: { label: { margin: 20 } },
    circularAxis: { label: { margin: 10 } },
  });

  return el;
};
