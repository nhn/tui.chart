import LineChart from '@src/charts/lineChart';
import { LineSeriesData } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import {
  budgetData,
  tupleCoordinateData,
  temperatureData,
  coordinateData,
  randomData
} from './data';
import { boolean, number, withKnobs } from '@storybook/addon-knobs';

export default {
  title: 'chart|Line',
  decorators: [withKnobs]
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
  const { el } = createChart(temperatureData, {
    xAxis: { pointOnColumn: boolean('pointOnColumn', false) }
  });

  return el;
};

export const spline = () => {
  const { el } = createChart(budgetData, {
    series: { spline: boolean('spline', true) }
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

// @TODO: date 데이터 처리 이후 활성 필요
// export const coordinateDatetime = () => {
//   const { el } = createChart(datetimeCoordinateData as LineSeriesData, {
//     xAxis: { pointOnColumn: true, type: 'datetime' }
//   });
//
//   return el;
// };

export const tickInterval = () => {
  const xAxisOptions = {
    tick: {
      interval: number('tickInterval', 2, { range: true, min: 1, max: 20, step: 1 })
    }
  };

  const { el } = createChart(randomData(50), { xAxis: xAxisOptions });

  return el;
};

export const labelInterval = () => {
  const xAxisOptions = {
    label: {
      interval: number('labelInterval', 2, { range: true, min: 1, max: 20, step: 1 })
    }
  };

  const { el } = createChart(randomData(50), { xAxis: xAxisOptions });

  return el;
};

export const scale = () => {
  const { el } = createChart(budgetData, {
    yAxis: {
      scale: {
        min: number('min', -1000, { range: true, min: -5000, max: 14000, step: 1000 }),
        max: number('max', 10000, { range: true, min: -5000, max: 14000, step: 1000 }),
        stepSize: number('scale', 1500, { range: true, min: 100, max: 14000, step: 100 })
      }
    },
    series: { spline: true }
  });

  return el;
};
