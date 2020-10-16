import BarChart from '@src/charts/barChart';
import { lossDataForGroupStack, genderAgeGroupData } from './data';
import { BarChartOptions } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';

export default {
  title: 'chart.Bar.GroupStack',
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
  const { el } = createChart(genderAgeGroupData, {
    chart: {
      width,
      height: 500,
      title: 'Population Distribution',
    },
    yAxis: {
      title: 'Age Group',
    },
    series: {
      stack: true,
      diverging: true,
    },
  });

  return el;
};

export const centerYAxis = () => {
  const { el } = createChart(genderAgeGroupData, {
    chart: {
      width,
      height: 500,
      title: 'Population Distribution',
    },
    yAxis: {
      title: 'Age Group',
      align: 'center',
    },
    xAxis: {
      label: {
        interval: 4,
      },
    },
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
