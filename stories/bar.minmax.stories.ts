import BarChart from '@src/charts/barChart';
import {
  budgetData,
  temperatureRangeData,
  negativeBudgetData,
  budgetDataNegativeOnly,
} from './data';
import { BarChartOptions } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';

export default {
  title: 'chart.Bar.MinMax',
};

const width = 1000;
const height = 500;
const defaultOptions: BarChartOptions = {
  chart: {
    width,
    height,
  },
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

export const positiveOnly = () => {
  const { el } = createChart(budgetData, {
    ...defaultOptions,
    xAxis: {
      scale: {
        min: 1000,
        max: 8000,
      },
    },
  });

  return el;
};

export const negativeOnly = () => {
  const { el } = createChart(budgetDataNegativeOnly, {
    ...defaultOptions,
    xAxis: {
      scale: {
        min: -8000,
        max: -1000,
      },
    },
  });

  return el;
};

export const stack = () => {
  const { el } = createChart(negativeBudgetData, {
    series: {
      stack: true,
    },
    xAxis: {
      scale: {
        min: -8000,
        max: 12000,
      },
    },
  });

  return el;
};

export const positiveStack = () => {
  const { el } = createChart(budgetData, {
    ...defaultOptions,
    xAxis: {
      scale: {
        min: 3500,
        max: 8000,
      },
    },
    series: {
      stack: true,
    },
  });

  return el;
};

export const negativeStack = () => {
  const { el } = createChart(budgetDataNegativeOnly, {
    ...defaultOptions,
    xAxis: {
      scale: {
        min: -8000,
        max: -1000,
      },
    },
    series: {
      stack: true,
    },
  });

  return el;
};

export const range = () => {
  const { el } = createChart(temperatureRangeData, {
    ...defaultOptions,
    xAxis: {
      scale: {
        min: -4,
        max: 24,
      },
    },
  });

  return el;
};
