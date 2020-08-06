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

function createChart(data: BubbleSeriesData, customOptions?: BubbleChartOptions) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions || {});

  el.style.outline = '1px solid red';
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;

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
