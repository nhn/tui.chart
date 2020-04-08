import ColumnChart from '@src/charts/columnChart';

export default {
  title: 'Column'
};

function createChart(customOptions?: Record<string, any>) {
  const el = document.createElement('div');
  const width = 800;
  const height = 500;
  const data = {
    categories: ['June', 'July', 'Aug', 'Sep', 'Oct', 'Nov'],
    series: [
      {
        name: 'Budget',
        data: [5000, 3000, 5000, 7000, 6000, 4000]
      },
      {
        name: 'Income',
        data: [8000, 1000, 7000, 2000, 5000, 3000]
      },
      {
        name: 'Test',
        data: [6000, 5000, 7000, 1000, 5500, 4000]
      }
    ]
  };
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
  const { el } = createChart();

  return el;
};
