import RadarChart from '@src/charts/radarChart';
import { RadarSeriesData, RadarChartOptions } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { budgetData2 } from './data';

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

function createChart(
  data: RadarSeriesData,
  customOptions: RadarChartOptions = {},
  responsive = false
) {
  const el = document.createElement('div');
  const options = responsive ? customOptions : deepMergedCopy(defaultOptions, customOptions || {});

  el.style.outline = '1px solid red';
  el.style.width = responsive ? '90vw' : `${options.chart?.width}px`;
  el.style.height = responsive ? '90vh' : `${options.chart?.height}px`;

  const chart = new RadarChart({ el, data, options });

  return { el, chart };
}

export const basci = () => {
  const { el } = createChart(budgetData2, {
    legend: {
      visible: true,
      align: 'bottom',
    },
  });

  return el;
};

export const usingCirclePlot = () => {
  const { el } = createChart(budgetData2, {
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

export const showDot = () => {
  const { el } = createChart(budgetData2, {
    series: {
      showDot: true,
    },
    legend: {
      visible: true,
      align: 'bottom',
    },
  });

  return el;
};

export const showArea = () => {
  const { el } = createChart(budgetData2, {
    series: {
      showArea: true,
    },
    legend: {
      visible: true,
      align: 'bottom',
    },
  });

  return el;
};

export const selectable = () => {
  const { el } = createChart(budgetData2, {
    series: {
      selectable: true,
    },
  });

  return el;
};

export const responsive = () => {
  const { el } = createChart(budgetData2, { chart: { title: 'Annual Incomes' } }, true);

  return el;
};

export const labelInterval = () => {
  const { el } = createChart(budgetData2, {
    legend: {
      visible: true,
      align: 'bottom',
    },
    yAxis: {
      scale: {
        max: 10000,
        stepSize: 1000,
      },
      label: { interval: 2 },
    },
  });

  return el;
};
