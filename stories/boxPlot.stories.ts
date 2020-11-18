import BoxPlotChart from '@src/charts/boxPlotChart';
import { BudgetDataForBoxPlot } from './data';
import { BoxPlotSeriesData, BoxPlotChartOptions } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { withKnobs, radios } from '@storybook/addon-knobs';
import '@src/css/chart.css';

export default {
  title: 'chart|BoxPlot',
  decorators: [withKnobs],
};

function createChart(
  data: BoxPlotSeriesData,
  customOptions: BoxPlotChartOptions = {},
  responsive = false
) {
  const el = document.createElement('div');
  const options = responsive
    ? customOptions
    : deepMergedCopy(
        {
          chart: {
            width: 900,
            height: 540,
            title: 'Monthly Revenue',
          },
        },
        customOptions || {}
      );

  el.style.outline = '1px solid red';
  el.style.width = responsive ? '90vw' : `${options.chart?.width}px`;
  el.style.height = responsive ? '90vh' : `${options.chart?.height}px`;

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

export const eventDetectType = () => {
  const { el } = createChart(BudgetDataForBoxPlot, {
    series: {
      selectable: true,
      eventDetectType: radios('eventDetectType', { point: 'point', grouped: 'grouped' }, 'grouped'),
    },
  });

  return el;
};

export const responsive = () => {
  const { el } = createChart(BudgetDataForBoxPlot, { chart: { title: 'Monthly Revenue' } }, true);

  return el;
};
