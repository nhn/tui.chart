import { SeriesDataType, TreemapSeriesData } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { populationDensityData, usedDiskSpaceData } from './data';
import { withKnobs } from '@storybook/addon-knobs';
import TreemapChart from '@src/charts/treemapChart';

export default {
  title: 'chart|Treemap',
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

  el.style.outline = '1px solid red';
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;

  const chart = new TreemapChart({ el, data, options });

  return { el, chart };
}

export const basic = () => {
  const { el } = createChart(usedDiskSpaceData, {
    chart: { title: 'Used disk space' },
    tooltip: { formatter: (value: SeriesDataType) => `${value}GB` },
  });

  return el;
};

export const dataLabels = () => {
  const { el } = createChart(usedDiskSpaceData, {
    chart: { title: 'Used disk space' },
    series: {
      dataLabels: {
        visible: true,
      },
    },
    tooltip: { formatter: (value: SeriesDataType) => `${value}GB` },
  });

  return el;
};

export const useTreemapLeaf = () => {
  const { el } = createChart(usedDiskSpaceData, {
    chart: { title: 'Used disk space' },
    series: {
      dataLabels: {
        visible: true,
        useTreemapLeaf: true,
      },
    },
    tooltip: { formatter: (value: SeriesDataType) => `${value}GB` },
  });

  return el;
};

export const colorValue = () => {
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
