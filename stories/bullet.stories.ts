import BulletChart from '@src/charts/bulletChart';
import { BulletSeriesData, BulletChartOptions } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { budgetDataForBullet } from './data';

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

function createChart(data: BulletSeriesData, customOptions?: BulletChartOptions) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions || {});

  el.style.outline = '1px solid red';
  el.style.width = `${options.chart.width}px`;
  el.style.height = `${options.chart.height}px`;

  const chart = new BulletChart({ el, data, options });

  return { el, chart };
}

export const basic = () => {
  const { el } = createChart(budgetDataForBullet as BulletSeriesData);

  return el;
};

export const vertical = () => {
  const { el } = createChart(budgetDataForBullet as BulletSeriesData, {
    series: {
      vertical: true,
    },
  });

  return el;
};

export const dataLabels = () => {
  const { el } = createChart(budgetDataForBullet as BulletSeriesData, {
    series: {
      dataLabels: {
        visible: true,
      },
    },
  });

  return el;
};
