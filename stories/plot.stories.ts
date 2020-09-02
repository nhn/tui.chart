import LineChart from '@src/charts/lineChart';
import { LineSeriesData } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { coordinateData, randomData, datetimeCoordinateData } from './data';
import { boolean, withKnobs } from '@storybook/addon-knobs';

const width = 1000;
const height = 500;
const defaultOptions = {
  chart: {
    width,
    height,
    title: '24-hr Average Temperature',
  },
  xAxis: { title: 'Month' },
  yAxis: { title: 'Amount' },
  series: {},
  tooltip: {},
  plot: {},
};

export default {
  title: 'chart|Plot',
  decorators: [withKnobs],
};

function createChart(data: LineSeriesData, customOptions?: Record<string, any>) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions || {});

  el.style.outline = '1px solid red';
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;

  const chart = new LineChart({ el, data, options });

  return { el, chart };
}

export const basic = () => {
  const { el } = createChart(randomData(24), {
    plot: {
      showLine: boolean('showLine', true),
      bands: [
        {
          range: [3, 8],
          color: '#ff5722',
          opacity: 0.2,
        },
      ],
      lines: [
        {
          value: 20,
          color: '#fa2828',
        },
      ],
    },
  });

  return el;
};

export const withoutSeriesData = () => {
  const data = {
    categories: [
      '01/01/2020',
      '02/01/2020',
      '03/01/2020',
      '04/01/2020',
      '05/01/2020',
      '06/01/2020',
      '07/01/2020',
      '08/01/2020',
      '09/01/2020',
      '10/01/2020',
      '11/01/2020',
      '12/01/2020',
    ],
    series: [],
  };

  const { el } = createChart(data, {
    yAxis: { title: 'Temperature (Celsius)', scale: { min: 0, max: 600 } },
    chart: { title: 'Concurrent user' },
    xAxis: { title: 'Month', type: 'datetime', date: { format: 'MMM' } },
    plot: {
      lines: [
        {
          value: '05/01/2020',
          color: '#ff5a46',
        },
        {
          value: '08/01/2020',
          color: '#00a9ff',
        },
      ],
      bands: [
        {
          range: ['04/01/2020', '06/01/2020'],
          color: '#ffb840',
          opacity: 0.15,
        },
        {
          range: ['07/01/2020', '09/01/2020'],
          color: '#ef4a5d',
          opacity: 0.15,
        },
        {
          range: ['10/01/2020', '12/01/2029'],
          color: '#19bc9c',
          opacity: 0.15,
        },
        {
          range: ['01/01/2020', '03/01/2020'],
          color: '#4b96e6',
          opacity: 0.15,
        },
      ],
    },
  });

  return el;
};

export const coordinate = () => {
  const { el } = createChart(coordinateData, {
    chart: { title: 'Concurrent user' },
    xAxis: { title: 'minute' },
    yAxis: { title: 'users' },
    plot: {
      bands: [
        {
          range: [3, 8],
          color: '#cccccc',
          opacity: 0.2,
        },
      ],
      lines: [
        {
          value: 10,
          color: '#fa2828',
        },
      ],
    },
  });

  return el;
};

export const dateTimeCoordinate = () => {
  const { el } = createChart(datetimeCoordinateData as LineSeriesData, {
    chart: { title: 'Concurrent user' },
    xAxis: { title: 'minute', date: { format: 'hh:mm:ss' } },
    yAxis: { title: 'users' },
    series: { zoomable: true },
    plot: {
      lines: [
        {
          value: '08/22/2020 10:20:00',
          color: '#fa2828',
        },
      ],
      bands: [
        {
          range: [
            ['08/22/2020 10:35:00', '08/22/2020 10:45:00'],
            ['08/22/2020 10:40:00', '08/22/2020 10:55:00'],
          ],
          color: '#00bcd4',
          opacity: 0.2,
        },
        {
          range: [['08/22/2020 10:05:00', '08/22/2020 10:15:00']],
          color: '#ff5722',
          opacity: 0.1,
        },
      ],
    },
  });

  return el;
};

export const mergeOverlappingRanges = () => {
  const { el } = createChart(datetimeCoordinateData as LineSeriesData, {
    yAxis: { title: 'users' },
    chart: { title: 'Concurrent user' },
    xAxis: { title: 'minute', date: { format: 'hh:mm:ss' } },
    plot: {
      bands: [
        {
          range: [
            ['08/22/2020 10:35:00', '08/22/2020 10:45:00'],
            ['08/22/2020 10:40:00', '08/22/2020 10:55:00'],
          ],
          color: '#00bcd4',
          opacity: 0.2,
          mergeOverlappingRanges: boolean('mergeOverlappingRanges', true),
        },
      ],
    },
  });

  return el;
};
