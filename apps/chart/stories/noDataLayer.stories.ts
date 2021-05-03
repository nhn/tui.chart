import AreaChart from '@src/charts/areaChart';
import { AreaChartOptions, AreaSeriesData } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import '@src/css/chart.css';

export default {
  title: 'chart/No data layer',
};

const width = 1000;
const height = 500;
const defaultOptions: AreaChartOptions = {
  chart: {
    width,
    height,
  },
};

function createChart(data: AreaSeriesData, customOptions: AreaChartOptions = {}) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions);

  el.style.width = `${options.chart?.width}px`;
  el.style.height = `${options.chart?.height}px`;

  const chart = new AreaChart({ el, data, options });

  return { el, chart };
}

export const basic = () => {
  const data = {
    categories: [],
    series: [],
  };

  const { el } = createChart(data, {
    chart: { title: 'Average Temperature' },
    xAxis: { title: { text: 'Month' } },
    yAxis: { title: 'Temperature (Celsius)' },
  });

  return el;
};

export const customNoDataText = () => {
  const data = {
    categories: [],
    series: [],
  };

  const { el } = createChart(data, {
    chart: { title: 'Average Temperature' },
    xAxis: { title: { text: 'Month' } },
    yAxis: { title: 'Temperature (Celsius)' },
    lang: {
      noData: 'No Data!!😭😭',
    },
  });

  return el;
};

export const theme = () => {
  const data = {
    categories: [],
    series: [],
  };

  const { el } = createChart(data, {
    chart: { title: 'Average Temperature' },
    xAxis: { title: { text: 'Month' } },
    yAxis: { title: 'Temperature (Celsius)' },
    theme: {
      noData: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#e33',
        fontFamily: 'monaco',
      },
    },
  });

  return el;
};
