import AreaChart from '@src/charts/areaChart';
import { AreaChartOptions, AreaSeriesData, BaseChartOptions } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { avgTemperatureData, budgetData, temperatureRangeData } from './data';
import { withKnobs, boolean, number, radios } from '@storybook/addon-knobs';

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

function createChart(
  data: AreaSeriesData,
  customOptions: AreaChartOptions = {},
  responsive = false
) {
  const el = document.createElement('div');
  const options = responsive ? customOptions : deepMergedCopy(defaultOptions, customOptions);

  el.style.outline = '1px solid red';
  el.style.width = responsive ? '90vw' : `${options.chart?.width}px`;
  el.style.height = responsive ? '90vh' : `${options.chart?.height}px`;

  const chart = new AreaChart({ el, data, options });

  return { el, chart };
}

export const basic = () => {
  const { el } = createChart(avgTemperatureData, {
    chart: { title: 'Average Temperature' } as BaseChartOptions,
    xAxis: { pointOnColumn: boolean('pointOnColumn', false), title: { text: 'Month' } },
    yAxis: { title: 'Temperature (Celsius)' },
  });

  return el;
};

export const basicSpline = () => {
  const { el } = createChart(avgTemperatureData, {
    chart: { title: 'Average Temperature' } as BaseChartOptions,
    xAxis: { pointOnColumn: boolean('pointOnColumn', false), title: { text: 'Month' } },
    yAxis: { title: 'Temperature (Celsius)' },
    series: { spline: true },
  });

  return el;
};

export const basicWithShowDot = () => {
  const { el } = createChart(avgTemperatureData, {
    chart: { title: 'Average Temperature' } as BaseChartOptions,
    xAxis: { pointOnColumn: boolean('pointOnColumn', false), title: { text: 'Month' } },
    yAxis: { title: 'Temperature (Celsius)' },
    series: { showDot: true },
  });

  return el;
};

export const basicWithEventDetectType = () => {
  const { el } = createChart(avgTemperatureData, {
    chart: { title: 'Average Temperature' } as BaseChartOptions,
    xAxis: { pointOnColumn: boolean('pointOnColumn', false), title: { text: 'Month' } },
    yAxis: { title: 'Temperature (Celsius)' },
    series: {
      eventDetectType: radios(
        'eventDetectType',
        { near: 'near', nearest: 'nearest', grouped: 'grouped' },
        'nearest'
      ),
    },
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
    series: { eventDetectType: 'grouped' },
  });

  return el;
};

export const rangeSpline = () => {
  const { el } = createChart(temperatureRangeData as AreaSeriesData, {
    chart: { title: 'Temperature Range' } as BaseChartOptions,
    xAxis: {
      title: { text: 'Temperature (Celsius)' },
    },
    yAxis: { title: 'Month' },
    series: { spline: true },
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

export const normalStackSpline = () => {
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
      spline: true,
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

export const selectable = () => {
  const { el } = createChart(avgTemperatureData, {
    chart: { title: 'Average Temperature' } as BaseChartOptions,
    xAxis: { title: { text: 'Month' } },
    yAxis: { title: 'Temperature (Celsius)' },
    series: { selectable: true, eventDetectType: 'near' },
  });

  return el;
};

export const lineWidth = () => {
  const { el } = createChart(avgTemperatureData, {
    chart: { title: 'Average Temperature' } as BaseChartOptions,
    xAxis: { pointOnColumn: boolean('pointOnColumn', false), title: { text: 'Month' } },
    yAxis: { title: 'Temperature (Celsius)' },
    series: {
      lineWidth: number('line width', 3, {
        range: true,
        min: 1,
        max: 10,
        step: 1,
      }),
    },
  });

  return el;
};

export const secondaryYAxis = () => {
  const { el } = createChart(avgTemperatureData, {
    yAxis: [
      {
        title: 'Temperature (Celsius)',
      },
      {
        title: 'Percent (%)',
        scale: {
          min: 0,
          max: 100,
        },
      },
    ],
  });

  return el;
};

export const responsive = () => {
  const { el } = createChart(
    avgTemperatureData,
    {
      chart: { title: 'Average Temperature' },
      responsive: {
        animation: { duration: 300 },
      },
    },
    true
  );

  return el;
};
