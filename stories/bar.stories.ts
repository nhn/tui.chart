import BarChart from '@src/charts/barChart';
import {
  budgetData,
  temperatureRangeData,
  budgetDataForStack,
  budgetDataForGroupStack,
  negativeBudgetData,
  budgetDataForDiverging
} from './data';
import { BarChartOptions } from '@t/options';

export default {
  title: 'chart|Bar'
};

const width = 800;
const height = 500;
const defaultOptions: BarChartOptions = {
  chart: {
    width,
    height,
    title: 'Monthly Revenue'
  }
};

function createChart(data, options: BarChartOptions = defaultOptions) {
  const el = document.createElement('div');

  el.style.outline = '1px solid red';
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;

  const chart = new BarChart({
    el,
    data,
    options
  });

  return { el, chart };
}

export const basic = () => {
  const { el } = createChart(budgetData);

  return el;
};

export const range = () => {
  const { el } = createChart(temperatureRangeData);

  return el;
};

export const normalStack = () => {
  const { el } = createChart(budgetDataForStack, {
    ...defaultOptions,
    series: {
      stack: {
        type: 'normal'
      }
    }
  });

  return el;
};

export const percentStack = () => {
  const { el } = createChart(budgetDataForStack, {
    ...defaultOptions,
    series: {
      stack: {
        type: 'percent'
      }
    }
  });

  return el;
};

export const groupStack = () => {
  const { el } = createChart(budgetDataForGroupStack, {
    ...defaultOptions,
    series: {
      stack: true
    }
  });

  return el;
};

export const defaultConnector = () => {
  const { el } = createChart(budgetDataForStack, {
    ...defaultOptions,
    series: {
      stack: {
        type: 'normal',
        connector: true
      }
    }
  });

  return el;
};

export const styledConnector = () => {
  const { el } = createChart(budgetDataForStack, {
    ...defaultOptions,
    series: {
      stack: {
        type: 'normal',
        connector: {
          type: 'dashed',
          color: '#031f4b',
          width: 2
        }
      }
    }
  });

  return el;
};

export const negative = () => {
  const { el } = createChart(negativeBudgetData, {
    ...defaultOptions
  });

  return el;
};

export const diverging = () => {
  const { el } = createChart(budgetDataForDiverging, {
    ...defaultOptions,
    series: {
      diverging: true
    }
  });

  return el;
};
