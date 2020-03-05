import Chart from '@src/charts/lineChart';

export default {
  title: 'Line'
};

function createChart(customOptions?: Record<string, any>) {
  const el = document.createElement('div');
  const width = 1000;
  const height = 500;
  const categories = [
    '01/01/2016',
    '02/01/2016',
    '03/01/2016',
    '04/01/2016',
    '05/01/2016',
    '06/01/2016',
    '07/01/2016',
    '08/01/2016',
    '09/01/2016',
    '10/01/2016',
    '11/01/2016',
    '12/01/2016'
  ];
  const series = [
    {
      name: 'Seoul',
      data: [-3.5, -1.1, 4.0, 11.3, 17.5, 21.5, 24.9, 25.2, 20.4, 13.9, 6.6, -0.6]
    },
    {
      name: 'Seattle',
      data: [3.8, 5.6, 7.0, 9.1, 12.4, 15.3, 17.5, 17.8, 15.0, 10.6, 6.4, 3.7]
    },
    {
      name: 'Sydney',
      data: [22.1, 22.0, 20.9, 18.3, 15.2, 12.8, 11.8, 13.0, 15.2, 17.6, 19.4, 21.2]
    },
    {
      name: 'Moskva',
      data: [-10.3, -9.1, -4.1, 4.4, 12.2, 16.3, 18.5, 16.7, 10.9, 4.2, -2.0, -7.5]
    },
    {
      name: 'Jungfrau',
      data: [-13.2, -13.7, -13.1, -10.3, -6.1, -3.2, 0.0, -0.1, -1.8, -4.5, -9.0, -10.9]
    }
  ];
  const options = {
    chart: {
      width,
      height,
      title: '24-hr Average Temperature'
    },
    yAxis: {
      title: 'Temperature (Celsius)'
    },
    xAxis: {
      title: 'Month',
      pointOnColumn: true,
      dateFormat: 'MMM',
      tickInterval: 'auto'
    },
    series: {
      showDot: false,
      zoomable: true
    },
    tooltip: {
      suffix: '°C'
    },
    plot: {
      bands: [
        {
          range: ['03/01/2016', '05/01/2016'],
          color: 'gray',
          opacity: 0.2
        }
      ],
      lines: [
        {
          value: '03/01/2016',
          color: '#fa2828'
        }
      ]
    },
    ...customOptions
  };

  el.style.outline = '1px solid red';
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;

  const chart = new Chart({
    el,
    data: {
      categories,
      series
    },
    options
  });

  return { el, chart };
}

export const basic = () => {
  const { el } = createChart();

  return el;
};
