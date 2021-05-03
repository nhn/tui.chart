import { deepMergedCopy } from '@src/helpers/utils';
import { BarChartOptions, PieChartOptions } from '@t/options';
import BarChart from '@src/charts/barChart';
import { budgetData, genderAgeData, browserUsageData } from './data';
import PieChart from '@src/charts/pieChart';
import '@src/css/chart.css';

export default {
  title: 'chart/Layout',
};

const defaultOptions = {
  chart: {
    width: 1000,
    height: 500,
    title: 'Monthly Revenue',
  },
};

function createChart(type, data, customOptions?: BarChartOptions | PieChartOptions) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions || {});

  el.style.width = `${options.chart.width}px`;
  el.style.height = `${options.chart.height}px`;

  const param = { el, data, options };

  return { el, chart: type === 'pie' ? new PieChart(param) : new BarChart(param) };
}

export const yAxis = () => {
  const { el } = createChart('bar', budgetData, {
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
  const { el } = createChart('bar', budgetData, {
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
  const { el } = createChart('bar', budgetData, {
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
  const { el } = createChart('bar', genderAgeData, {
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

export const plot = () => {
  const { el } = createChart('pie', browserUsageData, {
    chart: {
      width: 660,
      height: 560,
      title: 'Usage share of web browsers',
    },
    plot: {
      width: 400,
      height: 400,
    },
  });

  return el;
};
