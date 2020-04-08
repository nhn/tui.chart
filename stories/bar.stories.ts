import BarChart from '@src/charts/barChart';

export default {
  title: 'Bar'
};

function createChart() {
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
    data,
    options
  });

  return { el, chart };
}

export const basic = () => {
  const { el } = createChart();

  return el;
};
