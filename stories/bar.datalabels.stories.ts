import BarChart from '@src/charts/barChart';
import { budgetData, negativeBudgetData, lossData, budgetDataForGroupStack } from './data';
import { BarChartOptions } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { withKnobs, radios, boolean } from '@storybook/addon-knobs';

export default {
  title: 'chart.Bar.DataLabels',
  decorators: [withKnobs],
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

export const dataLabels = () => {
  const anchor = radios(
    'anchor',
    { center: 'center', start: 'start', end: 'end', auto: 'auto' },
    'auto'
  );
  const { el } = createChart(negativeBudgetData, {
    xAxis: {
      scale: {
        min: -8000,
        max: 8000,
      },
    },
    series: {
      dataLabels: {
        visible: true,
        anchor,
      },
    },
  });

  return el;
};

export const positiveOnly = () => {
  const { el } = createChart(budgetData, {
    ...defaultOptions,
    series: {
      dataLabels: {
        visible: true,
      },
    },
  });

  return el;
};

export const negativeOnly = () => {
  const { el } = createChart(lossData, {
    ...defaultOptions,
    series: {
      dataLabels: {
        visible: true,
      },
    },
  });

  return el;
};

export const dataLabelsOnStack = () => {
  const anchor = radios('anchor', { center: 'center', start: 'start', end: 'end' }, 'center');
  const showStackTotal = boolean('Show Stack Total', true);
  const { el } = createChart(negativeBudgetData, {
    xAxis: {
      scale: {
        min: -16000,
        max: 16000,
      },
    },
    series: {
      stack: true,
      dataLabels: {
        visible: true,
        anchor,
        stackTotal: {
          visible: showStackTotal,
        },
      },
    },
  });

  return el;
};

export const dataLabelsOnGroupStack = () => {
  const { el } = createChart(budgetDataForGroupStack, {
    xAxis: {
      scale: {
        max: 15000,
      },
    },
    series: {
      stack: true,
      dataLabels: {
        visible: true,
        style: {
          textStrokeColor: 'rgba(255, 255, 255, 0.6)',
        },
      },
    },
  });

  return el;
};
