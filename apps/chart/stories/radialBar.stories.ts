import RadialBarChart from '@src/charts/radialBarChart';
import { budgetData, budgetData2WithNull } from './data';
import { deepMergedCopy } from '@src/helpers/utils';
import '@src/css/chart.css';
import { RadialBarChartOptions } from '@t/options';
import { withKnobs, radios } from '@storybook/addon-knobs';

export default {
  title: 'chart.RadialBar',
  decorators: [withKnobs],
};
const width = 700;
const height = 700;
const defaultOptions: RadialBarChartOptions = {
  chart: {
    width,
    height,
    title: 'Monthly Revenue',
  },
};

function createChart(data, customOptions: Record<string, any> = {}) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions);

  el.style.width = options.chart?.width === 'auto' ? '90vw' : `${options.chart?.width}px`;
  el.style.height = options.chart?.height === 'auto' ? '90vh' : `${options.chart?.height}px`;

  const chart = new RadialBarChart({
    el,
    data,
    options,
  });

  return { el, chart };
}

export const basic = () => {
  const { el } = createChart(budgetData);

  return el;
};

export const basicWithNull = () => {
  const { el } = createChart(budgetData2WithNull);

  return el;
};

export const selectable = () => {
  const { el } = createChart(budgetData, {
    series: {
      selectable: true,
      eventDetectType: radios('eventDetectType', { point: 'point', grouped: 'grouped' }, 'point'),
    },
  });

  return el;
};

export const dataLabels = () => {
  const { el } = createChart(budgetData, {
    series: {
      dataLabels: {
        visible: true,
        anchor: radios('anchor', { start: 'start', center: 'center', end: 'end' }, 'start'),
      },
    },
  });

  return el;
};

export const theme = () => {
  const { el } = createChart(budgetData, {
    xAxis: {
      label: {
        margin: 15,
      },
    },
    theme: {
      series: {
        barWidth: 20,
        colors: ['#ef476f', '#ffd166', '#06d6a0', '#118ab2'],
      },
      yAxis: {
        label: {
          color: '#fff',
          textBubble: {
            visible: true,
            borderRadius: 5,
            backgroundColor: 'rgba(7, 59, 76, 1)',
            paddingX: 2,
            paddingY: 2,
          },
        },
      },
      radialAxis: {
        strokeStyle: 'rgba(7, 59, 76, 0.05)',
        dotColor: 'rgba(7, 59, 76, 0.5)',
        label: {
          color: '#073b4c',
        },
      },
    },
  });

  return el;
};

export const themeWithDataLabels = () => {
  const { el } = createChart(budgetData, {
    series: {
      dataLabels: {
        visible: true,
        anchor: radios('anchor', { start: 'start', center: 'center', end: 'end' }, 'start'),
      },
    },
    theme: {
      series: {
        dataLabels: {
          fontSize: 10,
          useSeriesColor: true,
          textBubble: {
            visible: true,
            borderRadius: 5,
          },
        },
      },
    },
  });

  return el;
};

// @TODO: clockwise, angleRange 고려
