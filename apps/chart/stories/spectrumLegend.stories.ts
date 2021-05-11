import { SeriesDataType, TreemapSeriesData } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { populationDensityData } from './data';
import { withKnobs } from '@storybook/addon-knobs';
import TreemapChart from '@src/charts/treemapChart';
import '@src/css/chart.css';

export default {
  title: 'chart/Spectrum Legend',
  decorators: [withKnobs],
};

const width = 1000;
const height = 500;
const defaultOptions = {
  chart: {
    width,
    height,
  },
  xAxis: {},
  yAxis: {},
  series: {},
  tooltip: {},
  plot: {},
};

function createChart(data: TreemapSeriesData, customOptions?: Record<string, any>) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions || {});

  el.style.width = `${width}px`;
  el.style.height = `${height}px`;

  const chart = new TreemapChart({ el, data, options });

  return { el, chart };
}

export const topAlign = () => {
  const { el } = createChart(populationDensityData, {
    chart: { title: 'Population density of World' },
    series: {
      useColorValue: true,
      dataLabels: {
        visible: true,
        useTreemapLeaf: true,
      },
    },
    tooltip: { formatter: (value: SeriesDataType) => `${value}㎢` },
    legend: {
      align: 'top',
    },
  });

  return el;
};

export const bottomAlign = () => {
  const { el } = createChart(populationDensityData, {
    chart: { title: 'Population density of World' },
    series: {
      useColorValue: true,
      dataLabels: {
        visible: true,
        useTreemapLeaf: true,
      },
    },
    tooltip: { formatter: (value: SeriesDataType) => `${value}㎢` },
    legend: {
      align: 'bottom',
    },
  });

  return el;
};

export const rightAlign = () => {
  const { el } = createChart(populationDensityData, {
    chart: { title: 'Population density of World' },
    series: {
      useColorValue: true,
      dataLabels: {
        visible: true,
        useTreemapLeaf: true,
      },
    },
    tooltip: { formatter: (value: SeriesDataType) => `${value}㎢` },
    legend: {
      align: 'right',
    },
  });

  return el;
};

export const leftAlign = () => {
  const { el } = createChart(populationDensityData, {
    chart: { title: 'Population density of World' },
    series: {
      useColorValue: true,
      dataLabels: {
        visible: true,
        useTreemapLeaf: true,
      },
    },
    tooltip: { formatter: (value: SeriesDataType) => `${value}㎢` },
    legend: {
      align: 'left',
    },
  });

  return el;
};
