import ColumnChart from '@src/charts/columnChart';
import {
  budgetData,
  temperatureRangeData,
  budgetDataForStack,
  budgetDataForGroupStack
} from './data';
import { ColumnChartOptions } from '@t/options';
import { withKnobs, radios, number, color, select } from '@storybook/addon-knobs';

export default {
  title: 'chart|Column',
  decorators: [withKnobs]
};

const width = 800;
const height = 500;
const defaultOptions = {
  chart: {
    width,
    height,
    title: 'Monthly Revenue',
    format: '1,000'
  },
  yAxis: {
    title: 'Amount',
    min: 0,
    max: 9000,
    suffix: '$'
  },
  xAxis: {
    title: 'Month'
  },
  series: {
    showLabel: true
  }
};

function createChart(data, options: ColumnChartOptions = defaultOptions) {
  const el = document.createElement('div');

  el.style.outline = '1px solid red';
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;

  const chart = new ColumnChart({
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

export const stack = () => {
  const data = select(
    'data type',
    {
      default: budgetDataForStack,
      stackGroup: budgetDataForGroupStack
    },
    budgetDataForStack
  );

  const stackType = radios('type', { normal: 'normal', percent: 'percent' }, 'normal');
  const { el } = createChart(data, {
    ...defaultOptions,
    series: {
      stack: {
        type: stackType
      }
    }
  });

  return el;
};

export const connectorStack = () => {
  const data = select(
    'data type',
    {
      default: budgetDataForStack,
      stackGroup: budgetDataForGroupStack
    },
    budgetDataForStack
  );
  const lineType = radios('connector.type', { solid: 'solid', dashed: 'dashed' }, 'solid');
  const lineColor = color('connector.color', 'rgba(51, 85, 139, 0.3)');
  const lineWidth = number('connector.width', 1, { range: true, min: 1, max: 5, step: 1 });
  const { el } = createChart(data, {
    ...defaultOptions,
    series: {
      stack: {
        type: 'normal',
        connector: {
          type: lineType,
          color: lineColor,
          width: lineWidth
        }
      }
    }
  });

  return el;
};
