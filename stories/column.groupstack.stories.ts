import ColumnChart from '@src/charts/columnChart';
import { lossDataForGroupStack, genderAgeGroupData } from './data';
import { ColumnChartOptions } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';

export default {
  title: 'chart.Column.GroupStack',
};

const width = 1000;
const height = 500;
const defaultOptions: ColumnChartOptions = {
  chart: {
    title: 'Population Distribution',
    width,
    height,
  },
};

function createChart(data, customOptions?: ColumnChartOptions) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions || {});

  el.style.outline = '1px solid red';
  el.style.width = `${options?.chart?.width}px`;
  el.style.height = `${options?.chart?.height}px`;

  const chart = new ColumnChart({
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

export const selectable = () => {
  const { el } = createChart(genderAgeGroupData, {
    series: {
      stack: true,
      selectable: true,
    },
  });

  return el;
};

export const negative = () => {
  const { el } = createChart(lossDataForGroupStack, {
    series: {
      stack: true,
    },
  });

  return el;
};

export const diverging = () => {
  const { el } = createChart(genderAgeGroupData, {
    series: {
      stack: true,
      diverging: true,
    },
  });

  return el;
};

export const dataLabels = () => {
  const { el } = createChart(genderAgeGroupData, {
    chart: {
      width: 1500,
      height,
      title: 'Monthly Revenue',
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
