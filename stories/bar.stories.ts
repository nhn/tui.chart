import BarChart from '@src/charts/barChart';
import { budgetData } from './data';

export default {
  title: 'Bar'
};

function createChart() {
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
      title: 'Month'
    },
    xAxis: {
      title: 'Amount',
      min: 0,
      max: 5000,
      suffix: '$'
    },
    series: {
      showLabel: true
    }
  };

  el.style.outline = '1px solid red';
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;

  const chart = new BarChart({
    el,
    data: budgetData,
    options
  });

  return { el, chart };
}

export const basic = () => {
  const { el } = createChart();

  return el;
};
