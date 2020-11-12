import { BubbleChartOptions, BubbleSeriesData } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { lifeExpectancyPerGDPData } from './data';
import BubbleChart from '@src/charts/bubbleChart';
import '@src/css/chart.css';

export default {
  title: 'chart|CircleLegend',
};

const width = 1000;
const height = 500;
const defaultOptions = {
  chart: {
    width,
    height,
  },
  yAxis: {},
  xAxis: {},
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

export const circleLegendWithTopLegend = () => {
  const { el } = createChart(lifeExpectancyPerGDPData, {
    legend: {
      align: 'top',
      visible: true,
    },
  });

  return el;
};

export const circleLegendWithBottomLegend = () => {
  const { el } = createChart(lifeExpectancyPerGDPData, {
    legend: {
      align: 'bottom',
      visible: true,
    },
  });

  return el;
};

export const circleLegendWithLeftLegend = () => {
  const { el } = createChart(lifeExpectancyPerGDPData, {
    legend: {
      align: 'left',
    },
  });

  return el;
};

export const circleLegendWithRightLegend = () => {
  const { el } = createChart(lifeExpectancyPerGDPData, {
    legend: {
      align: 'right',
    },
  });

  return el;
};

export const circleLegendWithoutLegend = () => {
  const { el } = createChart(lifeExpectancyPerGDPData, {
    legend: {
      visible: false,
    },
  });

  return el;
};
