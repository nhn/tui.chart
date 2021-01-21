import LineChart from '@src/charts/lineChart';
import { HeatmapChartOptions, HeatmapSeriesData, LineSeriesData } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { withKnobs } from '@storybook/addon-knobs';
import '@src/css/chart.css';
import { temperatureAverageDataForHeatmap, temperatureData } from './data';
import HeatmapChart from '@src/charts/heatmapChart';

export default {
  title: 'chart|Axes',
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

  el.style.outline = '1px solid red';
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;

  const chart = new HeatmapChart({ el, data, options });

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
