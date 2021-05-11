import BoxPlotChart from '@src/charts/boxPlotChart';
import { budgetDataForBoxPlot, budgetDataForBoxPlotWithNull } from './data';
import { BoxPlotSeriesData, BoxPlotChartOptions } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { withKnobs, radios } from '@storybook/addon-knobs';
import '@src/css/chart.css';
import { createResponsiveChart } from './util';

export default {
  title: 'chart/BoxPlot',
  decorators: [withKnobs],
};

function createChart(data: BoxPlotSeriesData, customOptions: BoxPlotChartOptions = {}) {
  const el = document.createElement('div');
  const options = deepMergedCopy(
    {
      chart: {
        width: 900,
        height: 540,
        title: 'Monthly Revenue',
      },
    } as BoxPlotChartOptions,
    customOptions || {}
  );

  el.style.width = `${options.chart?.width}px`;
  el.style.height = `${options.chart?.height}px`;

  const chart = new BoxPlotChart({ el, data, options });

  return { el, chart };
}

export const basic = () => {
  const { el } = createChart(budgetDataForBoxPlot);

  return el;
};

export const basicWithNullData = () => {
  const { el } = createChart(budgetDataForBoxPlotWithNull as BoxPlotSeriesData, {
    series: {
      eventDetectType: radios('eventDetectType', { point: 'point', grouped: 'grouped' }, 'grouped'),
    },
  });

  return el;
};

export const selectable = () => {
  const { el } = createChart(budgetDataForBoxPlot, {
    series: {
      selectable: true,
    },
  });

  return el;
};

export const eventDetectType = () => {
  const { el } = createChart(budgetDataForBoxPlot, {
    series: {
      selectable: true,
      eventDetectType: radios('eventDetectType', { point: 'point', grouped: 'grouped' }, 'grouped'),
    },
  });

  return el;
};

export const responsive = () => {
  return createResponsiveChart<BoxPlotSeriesData, BoxPlotChartOptions>(
    BoxPlotChart,
    budgetDataForBoxPlot,
    {
      chart: {
        title: 'Monthly Revenue',
        width: 'auto',
        height: 'auto',
      },
    }
  );
};

export const theme = () => {
  const { el } = createChart(budgetDataForBoxPlot, {
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

export const noData = () => {
  const data = {
    series: [],
    categories: [],
  };
  const { el } = createChart(data);

  return el;
};
