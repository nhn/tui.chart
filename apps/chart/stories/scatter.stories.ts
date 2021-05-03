import { ScatterChartOptions, ScatterSeriesData } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import {
  currentUserCoordinate,
  currentUserCoordinateDatetimeData,
  genderHeightWeightData,
  genderHeightWeightDataWithNull,
} from './data';
import ScatterChart from '@src/charts/scatterChart';
import '@src/css/chart.css';
import { createResponsiveChart } from './util';

export default {
  title: 'chart/Scatter',
};

const width = 1000;
const height = 500;
const defaultOptions: ScatterChartOptions = {
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

function createChart(data: ScatterSeriesData, customOptions: ScatterChartOptions = {}) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions);

  el.style.width = `${options.chart?.width}px`;
  el.style.height = `${options.chart?.height}px`;

  const chart = new ScatterChart({ el, data, options });

  return { el, chart };
}

export const basic = () => {
  const { el } = createChart(genderHeightWeightData);

  return el;
};

export const basicWithNullData = () => {
  const { el } = createChart(genderHeightWeightDataWithNull);

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
  return createResponsiveChart<ScatterSeriesData, ScatterChartOptions>(
    ScatterChart,
    genderHeightWeightData,
    {
      chart: {
        title: 'Height vs Weight',
        width: 'auto',
        height: 'auto',
      },
    }
  );
};

export const theme = () => {
  const { el } = createChart(genderHeightWeightData, {
    series: { selectable: true },
    theme: {
      series: {
        size: 8,
        borderWidth: 1,
        select: {
          size: 14,
          borderWidth: 4,
          borderColor: '#FFE662',
          fillColor: '#C23B22',
        },
        hover: {
          size: 14,
          borderWidth: 4,
          borderColor: '#FFE662',
          fillColor: '#ff6961',
        },
      },
    },
  });

  return el;
};

export const iconType = () => {
  const { el } = createChart(currentUserCoordinate, {
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

export const noData = () => {
  const data = {
    series: [],
    categories: [],
  };
  const { el } = createChart(data);

  return el;
};
