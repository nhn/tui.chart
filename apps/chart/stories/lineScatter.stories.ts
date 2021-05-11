import LineScatterChart from '@src/charts/lineScatterChart';
import { LineScatterData, LineScatterChartOptions } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { efficiencyAndExpensesData } from './data';
import { withKnobs } from '@storybook/addon-knobs';
import '@src/css/chart.css';
import { createResponsiveChart } from './util';

export default {
  title: 'chart/LineScatter',
  decorators: [withKnobs],
};

const width = 1000;
const height = 500;
const defaultOptions: LineScatterChartOptions = {
  chart: {
    width,
    height,
  },
  series: {},
  tooltip: {},
  plot: {},
};

function createChart(data: LineScatterData, customOptions: LineScatterChartOptions = {}) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions);

  el.style.width = `${options.chart?.width}px`;
  el.style.height = `${options.chart?.height}px`;

  const chart = new LineScatterChart({ el, data, options });

  return { el, chart };
}

export const basic = () => {
  const { el } = createChart(efficiencyAndExpensesData, {
    chart: { title: 'Efficiency vs Expenses' },
  });

  return el;
};

export const basicWithOptions = () => {
  const { el } = createChart(efficiencyAndExpensesData, {
    chart: { title: 'Efficiency vs Expenses' },
    series: {
      line: {
        showDot: true,
        spline: true,
      },
      selectable: true,
      dataLabels: { visible: true },
    },
  });

  return el;
};

export const secondaryYAxis = () => {
  const { el } = createChart(efficiencyAndExpensesData, {
    chart: { title: 'Efficiency vs Expenses' },
    yAxis: [
      { title: 'Efficiency', chartType: 'scatter' },
      { title: 'Expenses', chartType: 'line' },
    ],
  });

  return el;
};

export const responsive = () => {
  return createResponsiveChart<LineScatterData, LineScatterChartOptions>(
    LineScatterChart,
    efficiencyAndExpensesData,
    {
      chart: {
        title: 'Efficiency vs Expenses',
        width: 'auto',
        height: 'auto',
      },
      yAxis: [{ title: 'Efficiency' }, { title: 'Expenses' }],
    }
  );
};

export const noData = () => {
  const data = {
    series: {
      scatter: [],
      line: [],
    },
    categories: [],
  };
  const { el } = createChart(data);

  return el;
};
