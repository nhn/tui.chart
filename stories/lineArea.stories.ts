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

function createChart(
  data: LineAreaData,
  customOptions: LineAreaChartOptions = {},
  responsive = false
) {
  const el = document.createElement('div');
  const options = responsive ? customOptions : deepMergedCopy(defaultOptions, customOptions);

  el.style.outline = '1px solid red';
  el.style.width = responsive ? '90vw' : `${options.chart?.width}px`;
  el.style.height = responsive ? '90vh' : `${options.chart?.height}px`;

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
        dataLabels: { visible: true },
      },
      area: {
        showDot: true,
        dataLabels: { visible: false },
      },
      zoomable: true,
      selectable: true,
    },
  });

  return el;
};

export const secondaryYAxis = () => {
  const { el } = createChart(energyUsageStackData, {
    series: { area: { stack: { type: 'normal' } } },
    yAxis: [
      {
        title: 'Energy (kWh)',
        chartType: 'line',
      },
      {
        title: 'Powered Usage',
        chartType: 'area',
      },
    ],
  });

  return el;
};

export const responsive = () => {
  const { el } = createChart(
    energyUsageData,
    {
      chart: { title: 'Energy Usage' },
      yAxis: [
        {
          title: 'Energy (kWh)',
        },
        {
          title: 'Powered Usage',
        },
      ],
      xAxis: {
        title: 'Month',
        date: { format: 'yy/MM' },
      },
    },
    true
  );

  return el;
};
