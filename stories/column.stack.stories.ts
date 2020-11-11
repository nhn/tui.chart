import ColumnChart from '@src/charts/columnChart';
import { budgetData, budgetDataForStack, negativeBudgetData, lossData } from './data';
import { ColumnChartOptions } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { withKnobs, radios } from '@storybook/addon-knobs';

export default {
  title: 'chart.Column.Stack',
  decorators: [withKnobs],
};

const width = 1000;
const height = 500;
const defaultOptions: ColumnChartOptions = {
  chart: {
    width,
    height,
    title: 'Monthly Revenue',
  },
};

function createChart(data, customOptions?: ColumnChartOptions) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions || {});

  el.style.outline = '1px solid red';
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;

  const chart = new ColumnChart({
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
    yAxis: {
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
    yAxis: {
      scale: {
        min: -8000,
        max: -3500,
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
    yAxis: {
      scale: {
        min: -8000,
        max: 12000,
        stepSize: 2000,
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
    series: {
      stack: true,
      dataLabels: {
        visible: true,
        anchor: 'center',
        stackTotal: {
          visible: true,
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
        hover: {
          borderColor: '#73C8E7',
          borderWidth: 0,
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
          borderColor: '#000000',
          borderWidth: 10,
          shadowColor: 'rgba(0, 0, 0, 0)',
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          shadowBlur: 0,
          shadow: false,
          groupedRect: {
            color: '#74521A',
            opacity: 0.2,
          },
        },
        connector: {
          borderStyle: 'dashed',
          borderColor: '#031f4b',
          borderWidth: 2,
        },
      },
    },
  });

  return el;
};
