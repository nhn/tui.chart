import LineScatterChart from '@src/charts/lineScatterChart';
import { LineScatterData } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { efficiencyAndExpensesData } from './data';
import { withKnobs } from '@storybook/addon-knobs';
import '@src/css/chart.css';

export default {
  title: 'chart|LineScatter',
  decorators: [withKnobs],
};

const width = 1000;
const height = 500;
const defaultOptions = {
  chart: {
    width,
    height,
  },
  series: {},
  tooltip: {},
  plot: {},
};

function createChart(
  data: LineScatterData,
  customOptions: Record<string, any> = {},
  responsive = false
) {
  const el = document.createElement('div');
  const options = responsive ? customOptions : deepMergedCopy(defaultOptions, customOptions);

  el.style.outline = '1px solid red';
  el.style.width = responsive ? '90vw' : `${options.chart?.width}px`;
  el.style.height = responsive ? '90vh' : `${options.chart?.height}px`;

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
  const { el } = createChart(
    efficiencyAndExpensesData,
    {
      chart: { title: 'Efficiency vs Expenses' },
      yAxis: [{ title: 'Efficiency' }, { title: 'Expenses' }],
    },
    true
  );

  return el;
};
