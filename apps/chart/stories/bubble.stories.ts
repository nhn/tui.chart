import { BubbleChartOptions, BubbleSeriesData } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import {
  lifeExpectancyPerGDPData,
  lifeExpectancyPerGDPDataWithDatetime,
  lifeExpectancyPerGDPDataWithNull,
} from './data';
import BubbleChart from '@src/charts/bubbleChart';
import '@src/css/chart.css';
import { createResponsiveChart } from './util';

export default {
  title: 'chart/Bubble',
};

const width = 1000;
const height = 500;
const defaultOptions: BubbleChartOptions = {
  chart: {
    width,
    height,
    title: 'Life Expectancy per GDP',
  },
  yAxis: {
    title: 'Life Expectancy (years)',
  },
  xAxis: {
    title: 'GDP',
  },
  series: {},
  tooltip: {},
  plot: {},
};

function createChart(data: BubbleSeriesData, customOptions: BubbleChartOptions = {}) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions);

  el.style.width = `${options.chart?.width}px`;
  el.style.height = `${options.chart?.height}px`;

  const chart = new BubbleChart({ el, data, options });

  return { el, chart };
}

export const basic = () => {
  const { el } = createChart(lifeExpectancyPerGDPData);

  return el;
};

export const basicWithNullData = () => {
  const { el } = createChart(lifeExpectancyPerGDPDataWithNull);

  return el;
};

export const datetime = () => {
  const { el } = createChart(lifeExpectancyPerGDPDataWithDatetime, {
    xAxis: { date: { format: 'HH:mm:ss' } },
  });

  return el;
};

export const selectable = () => {
  const { el } = createChart(lifeExpectancyPerGDPData, { series: { selectable: true } });

  return el;
};

export const responsive = () => {
  return createResponsiveChart<BubbleSeriesData, BubbleChartOptions>(
    BubbleChart,
    lifeExpectancyPerGDPData,
    {
      chart: { title: 'Life Expectancy per GDP', width: 'auto', height: 'auto' },
      xAxis: { title: 'GDP' },
      yAxis: { title: 'Expectancy' },
      series: { selectable: true },
      responsive: {
        rules: [
          {
            condition: function ({ width: w }) {
              return w > 500 && w <= 700;
            },
            options: {
              legend: { align: 'bottom' },
              circleLegend: { visible: false },
            },
          },
          {
            condition: function ({ width: w }) {
              return w <= 500;
            },
            options: {
              legend: { visible: false },
              circleLegend: { visible: false },
              exportMenu: { visible: false },
            },
          },
          {
            condition: function ({ height: h }) {
              return h <= 330;
            },
            options: {
              xAxis: { title: '' },
              yAxis: { title: '' },
              circleLegend: { visible: false },
              exportMenu: { visible: false },
            },
          },
        ],
      },
    }
  );
};

export const theme = () => {
  const { el } = createChart(lifeExpectancyPerGDPData, {
    series: {
      selectable: true,
    },
    theme: {
      series: {
        colors: ['#ff9cee', '#9b283c', '#d6aaff', '#97a2ff', '#6eb5ff'],
        borderWidth: 2,
        borderColor: '#fdfd96',
        select: {
          borderWidth: 4,
          borderColor: '#80CEE1',
          color: '#C23B22',
        },
        hover: {
          borderWidth: 4,
          borderColor: '#80CEE1',
          color: '#ff6961',
        },
      },
    },
  });

  return el;
};

export const noData = () => {
  const data = {
    series: [],
    categories: [],
  };
  const { el } = createChart(data);

  return el;
};
