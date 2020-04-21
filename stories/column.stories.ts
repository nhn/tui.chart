import ColumnChart from '@src/charts/columnChart';
import { budgetData, temperatureRangeData } from './data';

export default {
  title: 'Column'
};

function createChart(data) {
  const el = document.createElement('div');
  const width = 800;
  const height = 500;
  const options = {
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
