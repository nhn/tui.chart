import RadarChart from '@src/charts/radarChart';
import { RadarSeriesData, RadarChartOptions } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { temperatureData2 } from './data';

export default {
  title: 'chart|Radar',
};

const defaultOptions = {
  chart: {
    width: 700,
    height: 700,
    title: 'Annual Incomes',
  },
};

function createChart(data: RadarSeriesData, customOptions?: RadarChartOptions) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions || {});

  el.style.outline = '1px solid red';
  el.style.width = `${options.chart.width}px`;
  el.style.height = `${options.chart.height}px`;

  const chart = new RadarChart({ el, data, options });

  return { el, chart };
}

export const basic = () => {
  const { el } = createChart(temperatureData2, {
    legend: {
      visible: true,
      align: 'bottom',
    },
  });

  return el;
};

export const usingCirclePlot = () => {
  const { el } = createChart(temperatureData2, {
    plot: {
      type: 'circle',
    },
    legend: {
      visible: true,
      align: 'bottom',
    },
  });

  return el;
};
