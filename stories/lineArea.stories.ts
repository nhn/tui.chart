import { LineAreaChartOptions, LineAreaData } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { energyUsageData, energyUsageStackData } from './data';
import { withKnobs } from '@storybook/addon-knobs';
import LineAreaChart from '@src/charts/lineAreaChart';

export default {
  title: 'chart|LineArea',
  decorators: [withKnobs],
};

const width = 1000;
const height = 500;
const defaultOptions = {
  chart: {
    width,
    height,
    title: 'Energy Usage',
  },
  xAxis: {
    title: 'Month',
    date: { format: 'yy/MM' },
  },
  yAxis: {
    title: 'Energy (kWh)',
  },
  series: {},
  tooltip: {
    formatter: (value) => `${value}kWh`,
  },
  plot: {},
};

function createChart(data: LineAreaData, customOptions?: LineAreaChartOptions) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions || {});

  el.style.outline = '1px solid red';
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;

  const chart = new LineAreaChart({ el, data, options });

  return { el, chart };
}

export const basic = () => {
  const { el } = createChart(energyUsageData, {});

  return el;
};

export const basicWithStackArea = () => {
  const { el } = createChart(energyUsageStackData, {
    series: { area: { stack: { type: 'normal' } } },
  });

  return el;
};

export const basicWithOptions = () => {
  const { el } = createChart(energyUsageData, {
    series: {
      line: {
        spline: true,
      },
      area: {},
    },
  });

  return el;
};
