import LineChart from '@src/charts/lineChart';
import { LineSeriesData } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import {
  budgetData,
  tupleCoordinateData,
  datetimeCoordinateData,
  temperatureData,
  coordinateData
} from './data';

export default {
  title: 'Line'
};

const width = 1000;
const height = 500;
const defaultOptions = {
  chart: {
    width,
    height
  },
  yAxis: {},
  xAxis: {},
  series: {},
  tooltip: {},
  plot: {}
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
  const { el } = createChart(temperatureData, { xAxis: { pointOnColumn: true } });

  return el;
};

export const spline = () => {
  const { el } = createChart(budgetData, {
    series: { spline: true },
    xAxis: { pointOnColumn: true }
  });

  return el;
};

export const coordinate = () => {
  const { el } = createChart(coordinateData, {
    xAxis: { pointOnColumn: true }
  });

  return el;
};

export const tupleCoordinate = () => {
  const { el } = createChart(tupleCoordinateData as LineSeriesData, {
    xAxis: { pointOnColumn: true }
  });

  return el;
};

export const coordinateDatetime = () => {
  const { el } = createChart(datetimeCoordinateData as LineSeriesData, {
    xAxis: { pointOnColumn: true, type: 'datetime' }
  });

  return el;
};
