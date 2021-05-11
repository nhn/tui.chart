import BarChart from '@src/charts/barChart';
import { lossDataForGroupStack, genderAgeGroupData } from './data';
import { BarChartOptions, BoxSeriesData } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { withKnobs, radios } from '@storybook/addon-knobs';

import '@src/css/chart.css';
import { createResponsiveChart } from './util';

export default {
  title: 'chart/Bar/Group Stack',
  decorators: [withKnobs],
};

const width = 1000;
const height = 800;
const defaultOptions: BarChartOptions = {
  chart: {
    title: 'Population Distribution',
    width,
    height,
  },
};

function createChart(data: BoxSeriesData, customOptions?: BarChartOptions) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions || {});

  el.style.width = `${options?.chart?.width}px`;
  el.style.height = `${options?.chart?.height}px`;

  const chart = new BarChart({
    el,
    data,
    options,
  });

  return { el, chart };
}

export const positive = () => {
  const { el } = createChart(genderAgeGroupData, {
    series: {
      stack: true,
    },
  });

  return el;
};

export const selectable = () => {
  const { el } = createChart(genderAgeGroupData, {
    series: {
      stack: true,
      selectable: true,
    },
  });

  return el;
};

export const negative = () => {
  const { el } = createChart(lossDataForGroupStack, {
    chart: {
      width,
      height: 500,
      title: 'Monthly Revenue',
    },
    series: {
      stack: true,
    },
  });

  return el;
};

export const diverging = () => {
  const { el } = createChart(genderAgeGroupData, {
    chart: {
      width,
      height: 500,
      title: 'Population Distribution',
    },
    yAxis: {
      title: 'Age Group',
    },
    series: {
      stack: true,
      diverging: true,
    },
  });

  return el;
};

export const centerYAxis = () => {
  const { el } = createChart(genderAgeGroupData, {
    chart: {
      width,
      height: 500,
      title: 'Population Distribution',
    },
    yAxis: { title: 'Age Group', align: 'center' },
    xAxis: { label: { interval: 4 } },
    series: { stack: true, diverging: true },
  });

  return el;
};

export const dataLabels = () => {
  const { el } = createChart(genderAgeGroupData, {
    series: {
      stack: true,
      dataLabels: { visible: true },
    },
  });

  return el;
};

export const theme = () => {
  const { el } = createChart(genderAgeGroupData, {
    series: {
      stack: true,
      selectable: true,
      eventDetectType: radios('eventDetectType', { point: 'point', grouped: 'grouped' }, 'grouped'),
    },
    theme: {
      series: {
        colors: ['#EDAE49', '#D1495B', '#00798C', '#30638E'],
        barWidth: 15,
        areaOpacity: 1,
        hover: {
          color: '#00ff00',
          borderColor: '#73C8E7',
          borderWidth: 4,
          shadowColor: 'rgba(0, 0, 0, 0.7)',
          shadowOffsetX: 4,
          shadowOffsetY: 4,
          shadowBlur: 6,
          groupedRect: {
            color: '#F0DCBC',
            opacity: 0.5,
          },
        },
        select: {
          color: '#0000ff',
          borderColor: '#000000',
          borderWidth: 4,
          shadowColor: 'rgba(0, 0, 0, 0)',
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          shadowBlur: 0,
          groupedRect: {
            color: '#74521A',
            opacity: 0.2,
          },
          restSeries: {
            areaOpacity: 0.5,
          },
          areaOpacity: 0.8,
        },
        connector: {
          color: '#031f4b',
          lineWidth: 2,
          dashSegments: [5, 10],
        },
      },
    },
  });

  return el;
};

export const responsive = () => {
  return createResponsiveChart<BoxSeriesData, BarChartOptions>(BarChart, genderAgeGroupData, {
    chart: {
      title: 'Population Distribution',
      width: 'auto',
      height: 'auto',
    },
    series: {
      stack: true,
    },
  });
};
