import { HeatmapSeriesData, SeriesDataType } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { temperatureAverageDataForHeatmap } from './data';
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

function createChart(data: HeatmapSeriesData, customOptions?: Record<string, any>) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions || {});

  el.style.outline = '1px solid red';
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;

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
