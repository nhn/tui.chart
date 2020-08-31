import { deepMergedCopy } from '@src/helpers/utils';
import { BarChartOptions } from '@t/options';
import BarChart from '@src/charts/barChart';
import { budgetData, genderAgeData } from './data';

export default {
  title: 'chart|Layout',
};

const defaultOptions = {
  chart: {
    width: 1000,
    height: 500,
    title: 'Monthly Revenue',
  },
};

function createChart(data, customOptions?: BarChartOptions) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions || {});

  el.style.outline = '1px solid red';
  el.style.width = `${options.chart.width}px`;
  el.style.height = `${options.chart.height}px`;

  const chart = new BarChart({ el, data, options });

  return { el, chart };
}

export const yAxis = () => {
  const { el } = createChart(budgetData, {
    yAxis: {
      width: 100,
      height: 350,
      title: 'Month',
    },
    xAxis: {
      title: 'Amount',
    },
  });

  return el;
};

export const xAxis = () => {
  const { el } = createChart(budgetData, {
    xAxis: {
      width: 700,
      height: 100,
      title: 'Amount',
    },
    yAxis: {
      title: 'Month',
    },
  });

  return el;
};

export const XAndYAxis = () => {
  const { el } = createChart(budgetData, {
    yAxis: {
      width: 100,
      height: 300,
      title: 'Month',
    },
    xAxis: {
      width: 700,
      height: 50,
      title: 'Amount',
    },
  });

  return el;
};

export const centerYAxis = () => {
  const { el } = createChart(genderAgeData, {
    yAxis: {
      title: 'Age Group',
      align: 'center',
      width: 100,
      height: 300,
    },
    xAxis: {
      label: {
        interval: 2,
      },
      width: 700,
      height: 100,
      title: 'People',
    },
    series: {
      diverging: true,
    },
  });

  return el;
};
