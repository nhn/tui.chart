import BarChart from '@src/charts/barChart';
import {
  budgetData,
  temperatureRangeData,
  budgetDataForStack,
  budgetDataForGroupStack,
  negativeBudgetData,
  budgetDataForDiverging,
  lossDataForGroupStack,
} from './data';
import { BarChartOptions, BaseChartOptions } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';

export default {
  title: 'chart|Bar',
};

const width = 1000;
const height = 500;
const defaultOptions: BarChartOptions = {
  chart: {
    width,
    height,
    title: 'Monthly Revenue',
  },
  xAxis: { title: 'Amount' },
  yAxis: { title: 'Month' },
};

function createChart(data, customOptions?: BarChartOptions) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions || {});

  el.style.outline = '1px solid red';
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;

  const chart = new BarChart({
    el,
    data,
    options,
  });

  return { el, chart };
}

export const basic = () => {
  const { el } = createChart(budgetData, {
    chart: { title: 'Monthly Revenue' } as BaseChartOptions,
    xAxis: { title: 'Amount' },
    yAxis: { title: 'Month' },
  });

  return el;
};

export const negative = () => {
  const { el } = createChart(negativeBudgetData);

  return el;
};

export const range = () => {
  const { el } = createChart(temperatureRangeData);

  return el;
};

export const normalStack = () => {
  const { el } = createChart(budgetDataForStack, {
    series: {
      stack: {
        type: 'normal',
      },
    },
  });

  return el;
};

export const percentStack = () => {
  const { el } = createChart(budgetDataForStack, {
    series: {
      stack: {
        type: 'percent',
      },
    },
  });

  return el;
};

export const negativeStack = () => {
  const { el } = createChart(negativeBudgetData, {
    series: {
      stack: true,
    },
  });

  return el;
};

export const negativePercentStack = () => {
  const { el } = createChart(negativeBudgetData, {
    series: {
      stack: {
        type: 'percent',
      },
    },
  });

  return el;
};

export const groupStack = () => {
  const { el } = createChart(budgetDataForGroupStack, {
    series: {
      stack: true,
    },
  });

  return el;
};

export const negativeGroupStack = () => {
  const { el } = createChart(lossDataForGroupStack, {
    series: {
      stack: true,
    },
  });

  return el;
};

export const defaultConnector = () => {
  const { el } = createChart(budgetDataForStack, {
    series: {
      stack: {
        type: 'normal',
        connector: true,
      },
    },
  });

  return el;
};

export const styledConnector = () => {
  const { el } = createChart(budgetDataForStack, {
    series: {
      stack: {
        type: 'normal',
        connector: {
          type: 'dashed',
          color: '#031f4b',
          width: 2,
        },
      },
    },
  });

  return el;
};

export const diverging = () => {
  const { el } = createChart(budgetDataForDiverging, {
    series: {
      diverging: true,
    },
  });

  return el;
};

export const divergingGroupStack = () => {
  const { el } = createChart(budgetDataForGroupStack, {
    series: {
      diverging: true,
      stack: {
        type: 'normal',
        connector: true,
      },
    },
  });

  return el;
};
