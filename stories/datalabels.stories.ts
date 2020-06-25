import {
  ColumnChartOptions,
  BarChartOptions,
  LineSeriesData,
  AreaSeriesData,
  AreaChartOptions,
} from '@t/options';
import ColumnChart from '@src/charts/columnChart';
import BarChart from '@src/charts/barChart';
import { deepMergedCopy } from '@src/helpers/utils';
import { budgetData, temperatureData, avgTemperatureData } from './data';
import { withKnobs, radios, number } from '@storybook/addon-knobs';
import LineChart from '@src/charts/lineChart';
import AreaChart from '@src/charts/areaChart';

export default {
  title: 'chart|DataLabels',
  decorators: [withKnobs],
};

const width = 1000;
const height = 500;

const boxDefaultOptions: ColumnChartOptions = {
  chart: {
    width,
    height,
  },
};

const lineAndAreaDefaultOptions = {
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

function createBoxChart(
  data,
  boxType: 'bar' | 'column',
  customOptions?: BarChartOptions | ColumnChartOptions
) {
  const el = document.createElement('div');
  const options = deepMergedCopy(boxDefaultOptions, customOptions || {});

  el.style.outline = '1px solid red';
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;

  const props = {
    el,
    data,
    options,
  };

  const chart = boxType === 'bar' ? new BarChart(props) : new ColumnChart(props);

  return { el, chart };
}

function createLineChart(data: LineSeriesData, customOptions?: Record<string, any>) {
  const el = document.createElement('div');
  const options = deepMergedCopy(lineAndAreaDefaultOptions, customOptions || {});

  el.style.outline = '1px solid red';
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;

  const chart = new LineChart({ el, data, options });

  return { el, chart };
}

function createAreaChart(data: AreaSeriesData, customOptions?: AreaChartOptions) {
  const el = document.createElement('div');
  const options = deepMergedCopy(lineAndAreaDefaultOptions, customOptions || {});

  el.style.outline = '1px solid red';
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;

  const chart = new AreaChart({ el, data, options });

  return { el, chart };
}

export const defaultDataLabelsOnBox = () => {
  const boxType = radios('Box Type', { bar: 'bar', column: 'column' }, 'bar');
  const { el } = createBoxChart(budgetData, boxType, {
    series: {
      dataLabels: {
        visible: true,
        style: {
          color: '#795548',
        },
      },
    },
  });

  return el;
};

export const defaultDataLabelsOnStack = () => {
  const boxType = radios('Box Type', { bar: 'bar', column: 'column' }, 'bar');
  const axisName = boxType === 'bar' ? 'xAxis' : 'yAxis';
  const { el } = createBoxChart(budgetData, boxType, {
    [axisName]: {
      scale: {
        max: 16000,
      },
    },
    series: {
      stack: true,
      dataLabels: {
        visible: true,
        style: {
          color: '#00f',
        },
      },
    },
  });

  return el;
};

export const innerDataLabelsOnBox = () => {
  const boxType = radios('Box Type', { bar: 'bar', column: 'column' }, 'bar');
  const anchor = radios('anchor', { center: 'center', start: 'start', end: 'end' }, 'end');
  const align = radios(
    'align',
    {
      start: 'start',
      end: 'end',
      left: 'left',
      right: 'right',
      top: 'top',
      bottom: 'bottom',
      center: 'center',
    },
    'start'
  );
  const offset = number('offset', 0, { range: true, min: 0, max: 10, step: 1 });
  const { el } = createBoxChart(budgetData, boxType, {
    series: {
      dataLabels: {
        visible: true,
        anchor,
        align,
        offset,
        style: {
          color: '#795548',
        },
      },
    },
  });

  return el;
};

export const dataLabelsOnLine = () => {
  const { el } = createLineChart(temperatureData, {
    series: {
      dataLabels: {
        visible: true,
      },
    },
    xAxis: { pointOnColumn: true },
  });

  return el;
};

export const dataLabelsOnArea = () => {
  const { el } = createAreaChart(avgTemperatureData, {
    series: {
      dataLabels: {
        visible: true,
      },
    },
  });

  return el;
};
