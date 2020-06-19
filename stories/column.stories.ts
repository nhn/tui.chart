import ColumnChart from '@src/charts/columnChart';
import {
  budgetData,
  temperatureRangeData,
  budgetDataForStack,
  budgetDataForGroupStack,
  negativeBudgetData,
  budgetDataForDiverging,
  lossDataForGroupStack,
} from './data';
import { ColumnChartOptions } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { withKnobs, number, radios, boolean, color } from '@storybook/addon-knobs';

export default {
  title: 'chart|Column',
  decorators: [withKnobs],
};

const width = 1000;
const height = 500;
const defaultOptions: ColumnChartOptions = {
  chart: {
    width,
    height,
  },
};

function createChart(data, customOptions?: ColumnChartOptions) {
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

export const basic = () => {
  const { el } = createChart(budgetData);

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

export const dataLabels = () => {
  const visible = boolean('visible', true);
  const anchor = radios('anchor', { center: 'center', start: 'start', end: 'end' }, 'center');
  const align = radios('align', { center: 'center', start: 'start', end: 'end' }, 'center');
  const offset = number('offset', 5, { range: true, min: 0, max: 10, step: 1 });
  const rotation = number('rotation', 5, { range: true, min: 0, max: 10, step: 1 });
  const labelColor = color('label color', '#333333');

  const { el } = createChart(budgetData, {
    series: {
      dataLabels: {
        visible,
        anchor,
        align,
        offset,
        rotation,
        style: {
          color: labelColor,
        },
      },
    },
  });

  return el;
};
