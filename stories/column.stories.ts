import ColumnChart from '@src/charts/columnChart';
import {
  budgetData,
  temperatureRangeData,
  negativeBudgetData,
  lossData,
  genderAgeData,
} from './data';
import { ColumnChartOptions } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { withKnobs, radios } from '@storybook/addon-knobs';

export default {
  title: 'chart.Column.General',
  decorators: [withKnobs],
};

const width = 1000;
const height = 500;
const defaultOptions: ColumnChartOptions = {
  chart: {
    width,
    height,
    title: 'Monthly Revenue',
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

export const positive = () => {
  const { el } = createChart(budgetData);

  return el;
};

export const positiveWithMinMax = () => {
  const { el } = createChart(budgetData, {
    yAxis: {
      scale: {
        min: 1000,
        max: 8000,
      },
    },
  });

  return el;
};

export const negative = () => {
  const { el } = createChart(lossData);

  return el;
};

export const negativeWithMinMax = () => {
  const { el } = createChart(lossData, {
    yAxis: {
      scale: {
        min: -8000,
        max: -1000,
      },
    },
  });

  return el;
};

export const both = () => {
  const { el } = createChart(negativeBudgetData);

  return el;
};

export const bothWithMinMax = () => {
  const { el } = createChart(negativeBudgetData, {
    yAxis: {
      scale: {
        min: -6000,
        max: 6000,
      },
    },
  });

  return el;
};

export const range = () => {
  const { el } = createChart(temperatureRangeData);

  return el;
};

export const rangeWithMinMax = () => {
  const { el } = createChart(temperatureRangeData, {
    yAxis: {
      scale: {
        min: -4,
        max: 24,
      },
    },
  });

  return el;
};

export const diverging = () => {
  const { el } = createChart(genderAgeData, {
    xAxis: {
      title: 'Age Group',
    },
    yAxis: {
      label: {
        interval: 2,
      },
    },
    series: {
      diverging: true,
    },
  });

  return el;
};

export const dataLabels = () => {
  const anchor = radios(
    'anchor',
    { center: 'center', start: 'start', end: 'end', auto: 'auto' },
    'auto'
  );
  const { el } = createChart(negativeBudgetData, {
    series: {
      dataLabels: {
        visible: true,
        anchor,
      },
    },
  });

  return el;
};
