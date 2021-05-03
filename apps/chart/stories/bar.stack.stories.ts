import BarChart from '@src/charts/barChart';
import { budgetDataForStack, negativeBudgetData, budgetData, lossData } from './data';
import { BarChartOptions, BoxSeriesData } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { withKnobs, radios } from '@storybook/addon-knobs';
import '@src/css/chart.css';
import { createResponsiveChart } from './util';

export default {
  title: 'chart/Bar/Stack',
  decorators: [withKnobs],
};

const width = 1000;
const height = 500;
const defaultOptions: BarChartOptions = {
  chart: {
    width,
    height,
    title: 'Monthly Revenue',
  },
};

function createChart(data: BoxSeriesData, customOptions?: BarChartOptions) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions || {});

  el.style.width = `${width}px`;
  el.style.height = `${height}px`;

  const chart = new BarChart({
    el,
    data,
    options,
  });

  return { el, chart };
}

export const normal = () => {
  const { el } = createChart(budgetDataForStack, {
    series: {
      stack: {
        type: 'normal',
      },
    },
  });

  return el;
};

export const percent = () => {
  const { el } = createChart(budgetDataForStack, {
    series: {
      stack: {
        type: 'percent',
      },
    },
  });

  return el;
};

export const positiveWithMinMax = () => {
  const { el } = createChart(budgetData, {
    ...defaultOptions,
    xAxis: {
      scale: {
        min: 3500,
        max: 8000,
      },
    },
    series: {
      stack: true,
    },
  });

  return el;
};

export const negativeWithMinMax = () => {
  const { el } = createChart(lossData, {
    ...defaultOptions,
    xAxis: {
      scale: {
        min: -8000,
        max: -1000,
      },
    },
    series: {
      stack: true,
    },
  });

  return el;
};

export const positiveAndNegative = () => {
  const { el } = createChart(negativeBudgetData, {
    series: {
      stack: true,
    },
  });

  return el;
};

export const positiveAndNegativeWithMinMax = () => {
  const { el } = createChart(negativeBudgetData, {
    series: {
      stack: true,
    },
    xAxis: {
      scale: {
        min: -8000,
        max: 12000,
      },
    },
  });

  return el;
};

export const positiveAndNegativePercent = () => {
  const { el } = createChart(negativeBudgetData, {
    series: {
      stack: {
        type: 'percent',
      },
    },
  });

  return el;
};

export const connector = () => {
  const { el } = createChart(budgetDataForStack, {
    series: {
      stack: {
        type: 'normal',
        connector: true,
      },
    },
  });

  return el;
};

export const dataLabels = () => {
  const anchor = radios('anchor', { center: 'center', start: 'start', end: 'end' }, 'center');
  const { el } = createChart(negativeBudgetData, {
    xAxis: {
      scale: {
        min: -16000,
        max: 16000,
      },
    },
    series: {
      stack: true,
      dataLabels: {
        visible: true,
        anchor,
        stackTotal: {
          visible: false,
        },
      },
    },
  });

  return el;
};

export const dataLabelsWithStackTotal = () => {
  const { el } = createChart(negativeBudgetData, {
    xAxis: {
      scale: {
        min: -16000,
        max: 16000,
      },
    },
    series: {
      stack: true,
      dataLabels: {
        visible: true,
        formatter: (value) => `$${value}`,
        anchor: 'center',
        stackTotal: {
          visible: true,
          formatter: (value) => `Total $${value}`,
        },
      },
    },
  });

  return el;
};

export const selectable = () => {
  const { el } = createChart(budgetDataForStack, {
    series: {
      stack: {
        type: 'normal',
      },
      selectable: true,
    },
  });

  return el;
};

export const eventDetectType = () => {
  const { el } = createChart(budgetDataForStack, {
    series: {
      stack: {
        type: 'normal',
      },
      eventDetectType: radios('eventDetectType', { point: 'point', grouped: 'grouped' }, 'grouped'),
    },
  });

  return el;
};

export const theme = () => {
  const { el } = createChart(budgetData, {
    series: {
      stack: {
        type: 'normal',
        connector: true,
      },
      selectable: true,
      eventDetectType: radios('eventDetectType', { point: 'point', grouped: 'grouped' }, 'grouped'),
    },
    theme: {
      series: {
        colors: ['#EDAE49', '#D1495B', '#00798C', '#30638E'],
        barWidth: '50%',
        areaOpacity: 1,
        hover: {
          color: '#00ff00',
          borderColor: '#73C8E7',
          borderWidth: 3,
          shadowColor: 'rgba(0, 0, 0, 0.7)',
          shadowOffsetX: 4,
          shadowOffsetY: 4,
          shadowBlur: 6,
          groupedRect: {
            color: '#F0DCBC',
            opacity: 0.5,
          },
        },
        select: {
          color: '#0000ff',
          borderColor: '#000000',
          borderWidth: 3,
          shadowColor: 'rgba(0, 0, 0, 0)',
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          shadowBlur: 0,
          groupedRect: {
            color: '#74521A',
            opacity: 0.2,
          },
          restSeries: {
            areaOpacity: 0.5,
          },
          areaOpacity: 0.8,
        },
        connector: {
          color: '#031f4b',
          lineWidth: 2,
          dashSegments: [5, 10],
        },
      },
    },
  });

  return el;
};

export const dataLabelsWithTheme = () => {
  const { el } = createChart(budgetData, {
    series: {
      stack: true,
      dataLabels: { visible: true },
    },
    theme: {
      series: {
        dataLabels: {
          fontFamily: 'monaco',
          lineWidth: 2,
          textStrokeColor: '#ffffff',
          shadowColor: '#ffffff',
          shadowBlur: 4,
          stackTotal: {
            fontFamily: 'monaco',
            fontWeight: 14,
            color: '#ffffff',
            textBubble: {
              visible: true,
              paddingY: 6,
              borderWidth: 3,
              borderColor: '#00bcd4',
              borderRadius: 7,
              backgroundColor: '#041367',
              shadowOffsetX: 0,
              shadowOffsetY: 0,
              shadowBlur: 0,
              shadowColor: 'rgba(0, 0, 0, 0)',
            },
          },
        },
      },
    },
  });

  return el;
};

export const responsive = () => {
  return createResponsiveChart<BoxSeriesData, BarChartOptions>(BarChart, budgetData, {
    chart: {
      title: 'Monthly Revenue',
      width: 'auto',
      height: 'auto',
    },
    series: {
      stack: true,
    },
  });
};
