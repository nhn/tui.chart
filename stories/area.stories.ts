import AreaChart from '@src/charts/areaChart';
import { AreaChartOptions, AreaSeriesData, BaseChartOptions } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { avgTemperatureData, budgetData, temperatureRangeData } from './data';
import { withKnobs, boolean } from '@storybook/addon-knobs';

export default {
  title: 'chart|Area',
  decorators: [withKnobs],
};

const width = 1000;
const height = 500;
const defaultOptions = {
  chart: {
    width,
    height,
  },
  yAxis: {},
  xAxis: {},
  series: {},
  tooltip: {},
  plot: {},
};

function createChart(data: AreaSeriesData, customOptions?: AreaChartOptions) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions || {});

  el.style.outline = '1px solid red';
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;

  const chart = new AreaChart({ el, data, options });

  return { el, chart };
}

export const basic = () => {
  const { el } = createChart(avgTemperatureData, {
    chart: { title: 'Average Temperature' } as BaseChartOptions,
    xAxis: { pointOnColumn: boolean('pointOnColumn', false), title: { text: 'Month' } },
    yAxis: { title: 'Temperature (Celsius)' },
    series: { spline: boolean('spline', false) },
  });

  return el;
};

export const basicWithShowDot = () => {
  const { el } = createChart(avgTemperatureData, {
    chart: { title: 'Average Temperature' } as BaseChartOptions,
    xAxis: { pointOnColumn: boolean('pointOnColumn', false), title: { text: 'Month' } },
    yAxis: { title: 'Temperature (Celsius)' },
    series: { spline: boolean('spline', false), showDot: true },
  });

  return el;
};

export const dataLabels = () => {
  const { el } = createChart(avgTemperatureData, {
    series: {
      dataLabels: {
        visible: true,
      },
    },
    legend: {
      align: 'bottom',
    },
  });

  return el;
};

export const range = () => {
  const { el } = createChart(temperatureRangeData as AreaSeriesData, {
    chart: { title: 'Temperature Range' } as BaseChartOptions,
    xAxis: {
      title: { text: 'Temperature (Celsius)' },
    },
    yAxis: { title: 'Month' },
  });

  return el;
};

export const normalStack = () => {
  const { el } = createChart(budgetData, {
    chart: { title: 'Monthly Revenue' } as BaseChartOptions,
    xAxis: {
      title: { text: 'Month' },
    },
    yAxis: { title: 'Amount' },
    series: {
      stack: {
        type: 'normal',
      },
    },
  });

  return el;
};

export const percentStack = () => {
  const { el } = createChart(budgetData, {
    chart: { title: 'Monthly Revenue' } as BaseChartOptions,
    xAxis: {
      title: { text: 'Month' },
    },
    yAxis: { title: 'Amount' },
    series: {
      stack: {
        type: 'percent',
      },
    },
  });

  return el;
};

export const zoomable = () => {
  const { el } = createChart(avgTemperatureData, {
    series: {
      zoomable: true,
      dataLabels: {
        visible: true,
      },
    },
    xAxis: {
      pointOnColumn: false,
    },
  });

  return el;
};
