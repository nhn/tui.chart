import ColumnLineChart from '@src/charts/columnLineChart';
import { ColumnChartOptions } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { temperatureAverageData } from './data';
import { boolean, radios, withKnobs } from '@storybook/addon-knobs';

export default {
  title: 'chart.ColumnLine',
  decorators: [withKnobs],
};

const defaultOptions: ColumnChartOptions = {
  chart: {
    width: 1000,
    height: 500,
    title: '24-hr Average Temperature',
  },
  yAxis: { title: 'Temperature (Celsius)' },
  xAxis: { title: 'Month' },
};

function createChart(data, customOptions?: Record<string, any>) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions || {});

  el.style.outline = '1px solid red';
  el.style.width = `${options.chart?.width}px`;
  el.style.height = `${options.chart?.height}px`;

  const chart = new ColumnLineChart({
    el,
    data,
    options,
  });

  return { el, chart };
}
export const basic = () => {
  const { el } = createChart(temperatureAverageData);

  return el;
};

export const selectable = () => {
  const { el } = createChart(temperatureAverageData, {
    series: {
      selectable: true,
    },
  });

  return el;
};

export const dataLabels = () => {
  const { el } = createChart(temperatureAverageData, {
    series: {
      /*
      column: {
        dataLabels: {
          visible: boolean('column - DataLabels', false),
        },
      },
      line: {
        dataLabels: {
          visible: boolean('line - DataLabels', false),
        },
      },
      */
      dataLabels: {
        visible: true,
      },
    },
  });

  return el;
};

export const secondaryYAxis = () => {
  const { el } = createChart(temperatureAverageData, {
    yAxis: [
      {
        title: 'Temperature (Celsius)',
        chartType: 'column',
        labelMargin: 15,
      },
      {
        title: 'Average',
        chartType: 'line',
        labelMargin: 15,
      },
    ],
  });

  return el;
};
