import { ScatterChartOptions, ScatterSeriesData } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { genderHeightWeightData } from './data';
import ScatterChart from '@src/charts/scatterChart';

export default {
  title: 'chart|Scatter',
};

const width = 1000;
const height = 500;
const defaultOptions = {
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

function createChart(data: ScatterSeriesData, customOptions?: ScatterChartOptions) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions || {});

  el.style.outline = '1px solid red';
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;

  const chart = new ScatterChart({ el, data, options });

  return { el, chart };
}

export const scatter = () => {
  const { el } = createChart(genderHeightWeightData);

  return el;
};
