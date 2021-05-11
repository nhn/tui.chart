import { SeriesDataType, TreemapSeriesData, TreemapChartOptions } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { populationDensityData, usedDiskSpaceData, usedDiskSpaceDataWithNull } from './data';
import { withKnobs } from '@storybook/addon-knobs';
import TreemapChart from '@src/charts/treemapChart';
import '@src/css/chart.css';
import { createResponsiveChart } from './util';

export default {
  title: 'chart/Treemap',
  decorators: [withKnobs],
};

const width = 1000;
const height = 500;
const defaultOptions: TreemapChartOptions = {
  chart: {
    width,
    height,
  },
  xAxis: {},
  series: {},
  tooltip: {},
  plot: {},
};

function createChart(data: TreemapSeriesData, customOptions: TreemapChartOptions = {}) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions);

  el.style.width = `${options.chart?.width}px`;
  el.style.height = `${options.chart?.height}px`;

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

export const basicWithNullData = () => {
  const { el } = createChart(usedDiskSpaceDataWithNull, {
    chart: { title: 'Used disk space' },
    tooltip: { formatter: (value: SeriesDataType) => `${value}GB` },
    series: {
      dataLabels: {
        visible: true,
      },
    },
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

export const zoom = () => {
  const { el } = createChart(usedDiskSpaceData, {
    series: {
      dataLabels: {
        visible: true,
      },
      zoomable: true,
    },
    chart: { title: 'Used disk space' },
    tooltip: { formatter: (value: SeriesDataType) => `${value}GB` },
  });

  return el;
};

export const colorValueZoom = () => {
  const { el } = createChart(populationDensityData, {
    chart: { title: 'Population density of World' },
    series: {
      useColorValue: true,
      dataLabels: {
        visible: true,
        useTreemapLeaf: false,
      },
      zoomable: true,
    },
    tooltip: { formatter: (value: SeriesDataType) => `${value}㎢` },
    legend: {
      align: 'top',
    },
  });

  return el;
};

export const selectable = () => {
  const { el } = createChart(usedDiskSpaceData, {
    series: {
      dataLabels: {
        visible: true,
      },
      zoomable: true,
      selectable: true,
    },
    chart: { title: 'Used disk space' },
    tooltip: { formatter: (value: SeriesDataType) => `${value}GB` },
  });

  return el;
};

export const responsive = () => {
  return createResponsiveChart<TreemapSeriesData, TreemapChartOptions>(
    TreemapChart,
    usedDiskSpaceData,
    {
      chart: {
        title: 'Used disk space',
        width: 'auto',
        height: 'auto',
      },
    }
  );
};

export const theme = () => {
  const { el } = createChart(populationDensityData, {
    chart: { title: 'Population density of World' },
    tooltip: { formatter: (value: SeriesDataType) => `${value}㎢` },
    legend: {
      align: 'top',
    },
    series: {
      useColorValue: true,
      selectable: true,
      dataLabels: { visible: true },
    },
    theme: {
      series: {
        startColor: '#F3FFE3',
        endColor: '#FF9CEE',
        borderWidth: 3,
        borderColor: '#ddd',
        select: {
          color: '#fdfd96',
          borderWidth: 2,
          borderColor: '#80CEE1',
        },
        hover: {
          color: '#FFB144',
          borderWidth: 5,
          borderColor: '#CAE7C1',
        },
      },
    },
  });

  return el;
};

export const dataLabelsWithTheme = () => {
  const { el } = createChart(populationDensityData, {
    series: {
      dataLabels: { visible: true },
    },
    theme: {
      series: {
        dataLabels: {
          fontFamily: 'monaco',
          fontSize: 16,
          fontWeight: '800',
          useSeriesColor: true,
          lineWidth: 3,
          textStrokeColor: '#ffffff',
          shadowColor: '#ffffff',
          shadowBlur: 10,
        },
      },
    },
  });

  return el;
};

export const noData = () => {
  const data = {
    series: [],
  };
  const { el } = createChart(data);

  return el;
};
