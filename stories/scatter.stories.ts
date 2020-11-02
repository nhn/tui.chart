import { ScatterChartOptions, ScatterSeriesData } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { currentUserCoordinateDatetimeData, genderHeightWeightData } from './data';
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
    title: 'Height vs Weight',
  },
  xAxis: { title: 'Height (cm)' },
  yAxis: { title: 'Weight (kg)' },
  series: {},
  tooltip: {},
  plot: {},
};

function createChart(
  data: ScatterSeriesData,
  customOptions: ScatterChartOptions = {},
  responsive = false
) {
  const el = document.createElement('div');
  const options = responsive ? customOptions : deepMergedCopy(defaultOptions, customOptions);

  el.style.outline = '1px solid red';
  el.style.width = responsive ? '90vw' : `${options.chart?.width}px`;
  el.style.height = responsive ? '90vh' : `${options.chart?.height}px`;

  const chart = new ScatterChart({ el, data, options });

  return { el, chart };
}

export const basic = () => {
  const { el } = createChart(genderHeightWeightData);

  return el;
};

export const datetime = () => {
  const { el } = createChart(currentUserCoordinateDatetimeData, {
    xAxis: { date: { format: 'HH:mm:ss' } },
  });

  return el;
};

export const selectable = () => {
  const { el } = createChart(genderHeightWeightData, { series: { selectable: true } });

  return el;
};

export const responsive = () => {
  const { el } = createChart(
    genderHeightWeightData,
    { chart: { title: 'Height vs Weight' } },
    true
  );

  return el;
};

export const theme = () => {
  const { el } = createChart(currentUserCoordinateDatetimeData, {
    xAxis: { date: { format: 'HH:mm:ss' } },
    series: {
      selectable: true,
    },
    theme: {
      series: {
        colors: [
          '#ff9cee',
          '#9b283c',
          '#d6aaff',
          '#97a2ff',
          '#6eb5ff',
          '#ffabab',
          '#f79aff',
          '#f6a6ff',
        ],
        iconTypes: ['rect', 'triangle', 'pentagon', 'star', 'diamond', 'cross', 'hexagon'],
      },
    },
  });

  return el;
};
