import LineChart from '@src/charts/lineChart';
import { LineSeriesData } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { coordinateData, randomData, datetimeCoordinateData, temperatureData } from './data';
import { boolean, withKnobs } from '@storybook/addon-knobs';
import '@src/css/chart.css';

const width = 1000;
const height = 500;
const defaultOptions = {
  chart: {
    width,
    height,
    title: 'Concurrent User',
  },
  xAxis: { title: 'hours' },
  yAxis: { title: 'users' },
  series: {},
  tooltip: {},
  plot: {},
};

export default {
  title: 'chart/Plot',
  decorators: [withKnobs],
};

function createChart(data: LineSeriesData, customOptions?: Record<string, any>) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions || {});

  el.style.width = `${width}px`;
  el.style.height = `${height}px`;

  const chart = new LineChart({ el, data, options });

  return { el, chart };
}

export const visible = () => {
  const { el } = createChart(randomData(24), {
    plot: {
      visible: boolean('visible', false),
    },
  });

  return el;
};

export const basic = () => {
  const { el } = createChart(randomData(24), {
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
          value: 12,
          color: '#fa2828',
        },
      ],
    },
  });

  return el;
};

export const coordinate = () => {
  const { el } = createChart(coordinateData, {
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

export const datetimeCoordinate = () => {
  const { el } = createChart(datetimeCoordinateData as LineSeriesData, {
    xAxis: { title: 'minute', date: { format: 'hh:mm:ss' } },
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

export const categoryRanges = () => {
  const { el } = createChart(temperatureData, {
    series: {
      zoomable: true,
    },
    plot: {
      bands: [
        {
          range: [
            ['04/01/2020', '06/01/2020'],
            ['03/01/2020', '05/01/2020'],
          ],
          color: '#cccccc',
          opacity: 0.2,
          mergeOverlappingRanges: true,
        },
      ],
      lines: [
        {
          value: '11/01/2020',
          color: '#fa2828',
        },
      ],
    },
  });

  return el;
};
