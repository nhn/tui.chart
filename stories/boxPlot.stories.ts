import BoxPlotChart from '@src/charts/boxPlotChart';
import { BudgetDataForBoxPlot } from './data';
import { BaseOptions, BoxPlotSeriesData } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';

export default {
  title: 'chart|BoxPlot',
};

function createChart(data: BoxPlotSeriesData, customOptions?: BaseOptions) {
  const el = document.createElement('div');
  const options = deepMergedCopy(
    {
      chart: {
        width: 900,
        height: 540,
        title: 'Monthly Revenue',
      },
    },
    customOptions || {}
  );
  const { width, height } = options.chart;

  el.style.outline = '1px solid red';
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;

  const chart = new BoxPlotChart({ el, data, options });

  return { el, chart };
}

export const basic = () => {
  const { el } = createChart(BudgetDataForBoxPlot);

  return el;
};

export const selectable = () => {
  const { el } = createChart(BudgetDataForBoxPlot, {
    series: {
      selectable: true,
    },
  });

  return el;
};
