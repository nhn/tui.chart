import BarChart from '@src/charts/barChart';
import { lossDataForGroupStack, genderAgeGroupData } from './data';
import { BarChartOptions, BarTypeYAxisOptions } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { withKnobs, boolean } from '@storybook/addon-knobs';

export default {
  title: 'chart.Bar.GroupStack',
  decorators: [withKnobs],
};

const width = 1000;
const height = 800;
const defaultOptions: BarChartOptions = {
  chart: {
    title: 'Population Distribution',
    width,
    height,
  },
};

function createChart(data, customOptions?: BarChartOptions) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions || {});

  el.style.outline = '1px solid red';
  el.style.width = `${options?.chart?.width}px`;
  el.style.height = `${options?.chart?.height}px`;

  const chart = new BarChart({
    el,
    data,
    options,
  });

  return { el, chart };
}

export const positive = () => {
  const { el } = createChart(genderAgeGroupData, {
    series: {
      stack: true,
    },
  });

  return el;
};

export const negative = () => {
  const { el } = createChart(lossDataForGroupStack, {
    chart: {
      width,
      height: 500,
      title: 'Monthly Revenue',
    },
    series: {
      stack: true,
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

  const { el } = createChart(genderAgeGroupData, {
    chart: {
      width,
      height: 500,
      title: 'Population Distribution',
    },
    yAxis,
    series: {
      stack: true,
      diverging: true,
    },
  });

  return el;
};

export const dataLabels = () => {
  const { el } = createChart(genderAgeGroupData, {
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
