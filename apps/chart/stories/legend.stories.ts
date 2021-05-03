import { BubbleChartOptions, BubbleSeriesData } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { lifeExpectancyPerGDPData, circleLegendOverlapData } from './data';
import BubbleChart from '@src/charts/bubbleChart';
import '@src/css/chart.css';
import { radios } from '@storybook/addon-knobs';

export default {
  title: 'chart/Legend',
};

const width = 1000;
const height = 500;
const defaultOptions = {
  chart: {
    width,
    height,
  },
};

function createChart(data: BubbleSeriesData, customOptions?: BubbleChartOptions) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions || {});

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

export const legendItemOverlap = () => {
  const { el } = createChart(circleLegendOverlapData, {
    legend: {
      align: radios(
        'align',
        { bottom: 'bottom', top: 'top', left: 'left', right: 'right' },
        'right'
      ),
    },
  });

  return el;
};

export const legendEllipsis = () => {
  const { el } = createChart(circleLegendOverlapData, {
    legend: {
      item: {
        width: 70,
        overflow: 'ellipsis',
      },
    },
  });

  return el;
};
