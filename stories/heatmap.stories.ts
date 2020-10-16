import { HeatmapSeriesData, SeriesDataType } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { contributionsData, temperatureAverageDataForHeatmap } from './data';
import { withKnobs } from '@storybook/addon-knobs';
import HeatmapChart from '@src/charts/heatmapChart';

export default {
  title: 'chart|Heatmap',
  decorators: [withKnobs],
};

const width = 800;
const height = 450;
const defaultOptions = {
  chart: {
    width,
    height,
    title: '24-hr Average Temperature',
  },
  xAxis: {
    title: 'Month',
  },
  yAxis: {
    title: 'City',
  },
  series: {},
  tooltip: {
    formatter: (value: SeriesDataType) => `${value}°C`,
  },
  plot: {},
  legend: {
    align: 'bottom',
  },
};

function createChart(
  data: HeatmapSeriesData,
  customOptions: Record<string, any> = {},
  responsive = false
) {
  const el = document.createElement('div');
  const options = responsive ? customOptions : deepMergedCopy(defaultOptions, customOptions);

  el.style.outline = '1px solid red';
  el.style.width = responsive ? '90vw' : `${options.chart?.width}px`;
  el.style.height = responsive ? '90vh' : `${options.chart?.height}px`;

  const chart = new HeatmapChart({ el, data, options });

  return { el, chart };
}

export const basic = () => {
  const { el } = createChart(temperatureAverageDataForHeatmap);

  return el;
};

export const dataLabels = () => {
  const { el } = createChart(temperatureAverageDataForHeatmap, {
    series: {
      dataLabels: {
        visible: true,
      },
    },
  });

  return el;
};

export const selectable = () => {
  const { el } = createChart(temperatureAverageDataForHeatmap, {
    series: {
      selectable: true,
    },
  });

  return el;
};

export const datetimeCategory = () => {
  const { el } = createChart(contributionsData, {
    xAxis: {
      date: { format: 'yyyy-MM' },
    },
    tooltip: {
      formatter: (value: SeriesDataType) => `${value} commit`,
    },
  });

  return el;
};

export const theme = () => {
  const { el } = createChart(temperatureAverageDataForHeatmap, {
    theme: {
      series: {
        startColor: '#F3FFE3',
        endColor: '#FF9CEE',
      },
    },
  });

  return el;
};


export const responsive = () => {
  const { el } = createChart(
    temperatureAverageDataForHeatmap,
    { chart: { title: '24-hr Average Temperature' } },
    true
  );

  return el;
};
