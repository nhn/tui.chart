import ColumnChart from '@src/charts/columnChart';
import {
  budgetData,
  temperatureRangeData,
  negativeBudgetData,
  budgetDataNegativeOnly,
} from './data';
import { BarChartOptions } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';

export default {
  title: 'chart.Column.MinMax',
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

  const chart = new ColumnChart({
    el,
    data,
    options,
  });

  return { el, chart };
}

export const positiveOnly = () => {
  const { el } = createChart(budgetData, {
    ...defaultOptions,
    yAxis: {
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
    yAxis: {
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
    yAxis: {
      scale: {
        min: -8000,
        max: 12000,
        stepSize: 2000,
      },
    },
  });

  return el;
};

export const positiveStack = () => {
  const { el } = createChart(budgetData, {
    ...defaultOptions,
    yAxis: {
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
    yAxis: {
      scale: {
        min: -8000,
        max: -3500,
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
    yAxis: {
      scale: {
        min: -4,
        max: 24,
      },
    },
  });

  return el;
};
