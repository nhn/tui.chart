import BulletChart from '@src/charts/bulletChart';
import { BulletSeriesData, BulletChartOptions } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import {
  budgetDataForBullet,
  budgetDataForBulletWithNull,
  budgetDataForBulletWithNegative,
} from './data';
import { radios, withKnobs } from '@storybook/addon-knobs';
import '@src/css/chart.css';
import { createResponsiveChart } from './util';

const budgetData = budgetDataForBullet as BulletSeriesData;

export default {
  title: 'chart/Bullet',
  decorators: [withKnobs],
};

const defaultOptions: BulletChartOptions = {
  chart: {
    width: 1160,
    height: 500,
    title: 'Monthly Revenue',
  },
};

function createChart(data: BulletSeriesData, customOptions: BulletChartOptions = {}) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions);

  el.style.width = `${options.chart?.width}px`;
  el.style.height = `${options.chart?.height}px`;

  const chart = new BulletChart({ el, data, options });

  return { el, chart };
}

export const basic = () => {
  const { el } = createChart(budgetData);

  return el;
};

export const basicWithNullData = () => {
  const { el } = createChart(budgetDataForBulletWithNull as BulletSeriesData, {
    series: {
      eventDetectType: radios('eventDetectType', { point: 'point', grouped: 'grouped' }, 'point'),
      dataLabels: { visible: true },
      vertical: true,
    },
    theme: {
      series: {
        rangeColors: [
          'rgba(0, 0, 0, 0.1)',
          'rgba(0, 0, 0, 0.2)',
          'rgba(0, 0, 0, 0.3)',
          'rgba(0, 0, 0, 0.4)',
          'rgba(0, 0, 0, 0.5)',
          'rgba(0, 0, 0, 0.6)',
        ],
      },
    },
  });

  return el;
};

export const basicWithNegativeData = () => {
  const { el } = createChart(budgetDataForBulletWithNegative as BulletSeriesData, {
    series: {
      dataLabels: {
        visible: true,
      },
    },
  });

  return el;
};

export const vertical = () => {
  const { el } = createChart(budgetData, {
    series: {
      vertical: true,
    },
  });

  return el;
};

export const eventDetectType = () => {
  const { el } = createChart(budgetData, {
    series: {
      eventDetectType: radios('eventDetectType', { point: 'point', grouped: 'grouped' }, 'point'),
    },
  });

  return el;
};

export const selecatable = () => {
  const { el } = createChart(budgetData, {
    series: {
      selectable: true,
    },
  });

  return el;
};

export const dataLabels = () => {
  const { el } = createChart(budgetData, {
    series: {
      dataLabels: {
        visible: true,
      },
    },
  });

  return el;
};

export const dataLabelsWithTheme = () => {
  const { el } = createChart(budgetData, {
    series: {
      dataLabels: {
        visible: true,
      },
    },
    theme: {
      series: {
        dataLabels: {
          fontFamily: 'fantasy',
          fontSize: 13,
          fontWeight: 500,
          useSeriesColor: true,
          textBubble: {
            visible: true,
            backgroundColor: '#eeeeee',
            borderWidth: 1,
            borderColor: '#333333',
            borderRadius: 5,
            arrow: { visible: true, width: 4, height: 4 },
          },
          marker: {
            fontFamily: 'fantasy',
            fontSize: 13,
            fontWeight: 600,
            useSeriesColor: false,
            color: '#ffffff',
            textStrokeColor: '#000000',
            shadowColor: '#000000',
            shadowBlur: 6,
            textBubble: { visible: false },
          },
        },
      },
    },
  });

  return el;
};

export const theme = () => {
  const { el } = createChart(budgetData, {
    series: {
      selectable: true,
    },
    theme: {
      series: {
        colors: ['#540D6E', '#EE4266', '#FFD23F', '#3BCEAC'],
        barWidth: 50,
        barWidthRatios: {
          rangeRatio: 1,
          bulletRatio: 0.5,
          markerRatio: 0.8,
        },
        markerLineWidth: 3,
        rangeColors: ['rgba(0, 0, 0, 0.6)', 'rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.2)'],
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 1)',
        hover: {
          borderWidth: 1,
          borderColor: 'rgba(0, 0, 0, 1)',
          shadowColor: 'rgba(0, 0, 0, 0.7)',
          shadowOffsetX: 4,
          shadowOffsetY: 4,
          shadowBlur: 6,
        },
        select: {
          borderColor: '#000000',
          borderWidth: 3,
          shadowColor: 'rgba(0, 0, 0, 0.7)',
          shadowOffsetX: 4,
          shadowOffsetY: 4,
          shadowBlur: 6,
        },
      },
    },
  });

  return el;
};

export const responsive = () => {
  return createResponsiveChart<BulletSeriesData, BulletChartOptions>(BulletChart, budgetData, {
    chart: {
      title: 'Monthly Revenue0',
      width: 'auto',
      height: 'auto',
    },
  });
};

export const noData = () => {
  const data = {
    series: [],
    categories: [],
  };
  const { el } = createChart(data);

  return el;
};
