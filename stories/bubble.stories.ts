import { BubbleChartOptions, BubbleSeriesData } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { lifeExpectancyPerGDPData, lifeExpectancyPerGDPDataWithDatetime } from './data';
import BubbleChart from '@src/charts/bubbleChart';

export default {
  title: 'chart|Bubble',
};

const width = 1000;
const height = 500;
const defaultOptions = {
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

function createChart(
  data: BubbleSeriesData,
  customOptions: BubbleChartOptions = {},
  responsive = false
) {
  const el = document.createElement('div');
  const options = responsive ? customOptions : deepMergedCopy(defaultOptions, customOptions);

  el.style.outline = '1px solid red';
  el.style.width = responsive ? '90vw' : `${width}px`;
  el.style.height = responsive ? '90vh' : `${height}px`;

  const chart = new BubbleChart({ el, data, options });

  return { el, chart };
}

export const basic = () => {
  const { el } = createChart(lifeExpectancyPerGDPData);

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
  const { el } = createChart(
    lifeExpectancyPerGDPData,
    {
      chart: { title: 'Life Expectancy per GDP' },
      xAxis: { title: 'GDP' },
      yAxis: { title: 'Expectancy' },
      series: { selectable: true },
      responsive: {
        animation: { duration: 100 },
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
    },
    true
  );

  return el;
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
