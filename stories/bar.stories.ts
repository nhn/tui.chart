import BarChart from '@src/charts/barChart';
import {
  budgetData,
  temperatureRangeData,
  negativeBudgetData,
  lossData,
  genderAgeData,
} from './data';
import { BarChartOptions, BarTypeYAxisOptions } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { withKnobs, radios, boolean } from '@storybook/addon-knobs';

export default {
  title: 'chart.Bar.General',
  decorators: [withKnobs],
};

const width = 1000;
const height = 500;
const defaultOptions: BarChartOptions = {
  chart: {
    width,
    height,
    title: 'Monthly Revenue',
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

export const positive = () => {
  const { el } = createChart(budgetData);

  return el;
};

export const positiveWithMinMax = () => {
  const { el } = createChart(budgetData, {
    xAxis: {
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
    xAxis: {
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
    xAxis: {
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
    xAxis: {
      scale: {
        min: -4,
        max: 24,
      },
    },
  });

  return el;
};

export const diverging = () => {
  const centerYAxisMode = boolean('Center Y Axis', false);
  const yAxis: BarTypeYAxisOptions = {
    title: 'Age Group',
  };

  if (centerYAxisMode) {
    yAxis.align = 'center';
  }

  const { el } = createChart(genderAgeData, {
    yAxis,
    xAxis: {
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
