import LineChart from '@src/charts/lineChart';
import { LineSeriesData } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import {
  tupleCoordinateData,
  temperatureData,
  coordinateData,
  randomData,
  temperatureData2,
  datetimeCoordinateData,
  temperatureDataWithDateObject,
} from './data';
import { boolean, number, withKnobs } from '@storybook/addon-knobs';

export default {
  title: 'chart|Line',
  decorators: [withKnobs],
};

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
  const { el } = createChart(temperatureData, {
    xAxis: { pointOnColumn: boolean('pointOnColumn', false) },
  });

  return el;
};

export const basicWithDateOptions = () => {
  const { el } = createChart(temperatureData, {
    xAxis: {
      pointOnColumn: true,
      date: {
        format: 'YY-MM-DD',
      },
    },
  });

  return el;
};

export const basicWithDateTypeData = () => {
  const { el } = createChart(temperatureDataWithDateObject, {
    xAxis: {
      pointOnColumn: true,
      date: {
        format: 'YY-MM-DD',
      },
    },
  });

  return el;
};

export const basicWithShowDot = () => {
  const { el } = createChart(temperatureData, {
    xAxis: { pointOnColumn: true },
    series: { showDot: true },
  });

  return el;
};

export const spline = () => {
  const { el } = createChart(temperatureData2, {
    series: { spline: boolean('spline', true) },
  });

  return el;
};

export const coordinate = () => {
  const { el } = createChart(coordinateData, {
    chart: { title: 'Concurrent user' },
    xAxis: { pointOnColumn: true, title: 'minute' },
    yAxis: { title: 'users' },
  });

  return el;
};

export const tupleCoordinate = () => {
  const { el } = createChart(tupleCoordinateData as LineSeriesData, {
    chart: { title: 'Concurrent user' },
    xAxis: { pointOnColumn: true, title: 'minute' },
    yAxis: { title: 'users' },
  });

  return el;
};

export const coordinateDatetime = () => {
  const { el } = createChart(datetimeCoordinateData as LineSeriesData, {
    xAxis: { pointOnColumn: true, date: true },
  });

  return el;
};

export const tickInterval = () => {
  const options = {
    chart: { title: 'Label Interval' },
    xAxis: {
      title: 'x axis data',
      tick: {
        interval: number('tickInterval', 2, {
          range: true,
          min: 1,
          max: 20,
          step: 1,
        }),
      },
    },
    yAxis: { title: 'y axis data' },
  };

  const { el } = createChart(randomData(50), options);

  return el;
};

export const labelInterval = () => {
  const options = {
    chart: { title: 'Label Interval' },
    xAxis: {
      title: 'x axis data',
      label: {
        interval: number('labelInterval', 2, {
          range: true,
          min: 1,
          max: 20,
          step: 1,
        }),
      },
    },
    yAxis: { title: 'y axis data' },
  };

  const { el } = createChart(randomData(50), options);

  return el;
};

export const scale = () => {
  const { el } = createChart(temperatureData2, {
    yAxis: {
      scale: {
        min: number('min', -1000, {
          range: true,
          min: -5000,
          max: 14000,
          step: 1000,
        }),
        max: number('max', 10000, {
          range: true,
          min: -5000,
          max: 14000,
          step: 1000,
        }),
        stepSize: number('scale', 1500, {
          range: true,
          min: 100,
          max: 14000,
          step: 100,
        }),
      },
    },
    series: { spline: true },
  });

  return el;
};

export const dataLabels = () => {
  const { el } = createChart(temperatureData, {
    series: {
      dataLabels: {
        visible: true,
      },
    },
    xAxis: { pointOnColumn: true },
  });

  return el;
};

export const zoomable = () => {
  const { el } = createChart(randomData(30), {
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

export const coordinateZoomable = () => {
  const { el } = createChart(coordinateData, {
    chart: { title: 'Concurrent user' },
    xAxis: { pointOnColumn: true, title: 'minute' },
    yAxis: { title: 'users' },
    series: { zoomable: true },
  });

  return el;
};
