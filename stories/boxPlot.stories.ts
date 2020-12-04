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

export const theme = () => {
  const { el } = createChart(BudgetDataForBoxPlot, {
    series: {
      selectable: true,
    },
    theme: {
      series: {
        colors: ['#EE4266', '#FFD23F'],
        barWidth: 40,
        barWidthRatios: {
          barRatio: 1,
          minMaxBarRatio: 0.8,
        },
        dot: {
          radius: 5,
          borderWidth: 3,
          borderColor: '#000000',
          useSeriesColor: true,
        },
        rect: {
          borderWidth: 2,
          borderColor: '#000000',
        },
        line: {
          whisker: {
            lineWidth: 2,
            color: '#000000',
          },
          maximum: {
            lineWidth: 2,
            color: '#000000',
          },
          minimum: {
            lineWidth: 2,
            color: '#000000',
          },
          median: {
            lineWidth: 2,
            color: '#000000',
          },
        },
        hover: {
          color: '#96D6ED',
          rect: { borderColor: '#00ff00', borderWidth: 2 },
          dot: { radius: 6 },
          shadowColor: 'rgba(0, 0, 0, 0.7)',
          shadowOffsetX: 4,
          shadowOffsetY: 4,
          shadowBlur: 6,
          line: {
            whisker: {
              lineWidth: 2,
              color: '#00ff00',
            },
            maximum: {
              lineWidth: 2,
              color: '#00ff00',
            },
            minimum: {
              lineWidth: 2,
              color: '#00ff00',
            },
            median: {
              lineWidth: 2,
              color: '#00ff00',
            },
          },
        },
        select: {
          color: '#73C8E7',
          rect: { borderColor: '#0000ff', borderWidth: 4 },
          dot: { radius: 6 },
          shadowColor: 'rgba(0, 0, 0, 0)',
          shadowOffsetX: 4,
          shadowOffsetY: 4,
          shadowBlur: 6,
          line: {
            whisker: {
              lineWidth: 2,
              color: '#0000ff',
            },
            maximum: {
              lineWidth: 2,
              color: '#0000ff',
            },
            minimum: {
              lineWidth: 2,
              color: '#0000ff',
            },
            median: {
              lineWidth: 2,
              color: '#0000ff',
            },
          },
          areaOpacity: 1,
          restSeries: {
            areaOpacity: 0.5,
          },
        },
      },
    },
  });

  return el;
};
