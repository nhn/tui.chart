import BulletChart from '@src/charts/bulletChart';
import { BulletSeriesData, BulletChartOptions } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { budgetDataForBullet } from './data';

const budgetData = budgetDataForBullet as BulletSeriesData;

export default {
  title: 'chart|Bullet',
};

const defaultOptions = {
  chart: {
    width: 1160,
    height: 500,
    title: 'Monthly Revenue',
  },
};

function createChart(
  data: BulletSeriesData,
  customOptions: BulletChartOptions = {},
  responsive = false
) {
  const el = document.createElement('div');
  const options = responsive ? customOptions : deepMergedCopy(defaultOptions, customOptions);

  el.style.outline = '1px solid red';
  el.style.width = responsive ? '90vw' : `${options.chart?.width}px`;
  el.style.height = responsive ? '90vh' : `${options.chart?.height}px`;

  const chart = new BulletChart({ el, data, options });

  return { el, chart };
}

export const basic = () => {
  const { el } = createChart(budgetData);

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

export const responsive = () => {
  const { el } = createChart(budgetData, { chart: { title: 'Monthly Revenue' } }, true);

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
