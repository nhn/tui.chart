import ColumnChart from '@src/charts/columnChart';
import { budgetData, temperatureRangeData, budgetDataForStack } from './data';
import { ColumnChartOptions } from '@t/options';

export default {
  title: 'Column'
};

const width = 800;
const height = 500;
const defaultOptions = {
  chart: {
    width,
    height,
    title: 'Monthly Revenue',
    format: '1,000'
  },
  yAxis: {
    title: 'Amount',
    min: 0,
    max: 9000,
    suffix: '$'
  },
  xAxis: {
    title: 'Month'
  },
  series: {
    showLabel: true
  }
};

function createChart(data, options: ColumnChartOptions = defaultOptions) {
  const el = document.createElement('div');

  el.style.outline = '1px solid red';
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;

  const chart = new ColumnChart({
    el,
    data,
    options
  });

  return { el, chart };
}

export const basic = () => {
  const { el } = createChart(budgetData);

  return el;
};

export const range = () => {
  const { el } = createChart(temperatureRangeData);

  return el;
};

export const normalStack = () => {
  const { el } = createChart(budgetDataForStack, {
    ...defaultOptions,
    series: {
      stack: true
    }
  });

  return el;
};

export const percentStack = () => {
  const { el } = createChart(budgetDataForStack, {
    ...defaultOptions,
    series: {
      stack: {
        type: 'percent'
      }
    }
  });

  return el;
};
