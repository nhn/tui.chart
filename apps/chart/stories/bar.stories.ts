import BarChart from '@src/charts/barChart';
import {
  budgetData,
  temperatureRangeData,
  negativeBudgetData,
  lossData,
  genderAgeData,
  simpleBudgetData,
} from './data';
import { BarChartOptions, BoxSeriesData } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { withKnobs, radios } from '@storybook/addon-knobs';
import '@src/css/chart.css';
import { createResponsiveChart } from './util';

export default {
  title: 'chart/Bar/General',
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

function createChart(data: BoxSeriesData, customOptions: BarChartOptions = {}) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions);

  el.style.width = `${options.chart?.width}px`;
  el.style.height = `${options.chart?.height}px`;

  const chart = new BarChart({
    el,
    data,
    options,
  });

  return { el, chart };
}

export const positive = () => {
  const { el } = createChart(budgetData);

  return el;
};

export const selectable = () => {
  const { el } = createChart(budgetData, {
    series: { selectable: true, eventDetectType: 'grouped' },
  });

  return el;
};

export const positiveWithMinMax = () => {
  const { el } = createChart(budgetData, {
    xAxis: {
      scale: {
        min: 1000,
        max: 8000,
      },
    },
  });

  return el;
};

export const negative = () => {
  const { el } = createChart(lossData);

  return el;
};

export const negativeWithMinMax = () => {
  const { el } = createChart(lossData, {
    xAxis: {
      scale: {
        min: -8000,
        max: -1000,
      },
    },
  });

  return el;
};

export const positiveAndNegative = () => {
  const { el } = createChart(negativeBudgetData);

  return el;
};

export const positiveAndNegativeWithMinMax = () => {
  const { el } = createChart(negativeBudgetData, {
    xAxis: {
      scale: {
        min: -6000,
        max: 6000,
      },
    },
  });

  return el;
};

export const range = () => {
  const { el } = createChart(temperatureRangeData as BoxSeriesData);

  return el;
};

export const rangeWithMinMax = () => {
  const { el } = createChart(temperatureRangeData as BoxSeriesData, {
    xAxis: {
      scale: {
        min: -4,
        max: 24,
      },
    },
  });

  return el;
};

export const rangeWithDataLabels = () => {
  const { el } = createChart(temperatureRangeData as BoxSeriesData, {
    chart: { height: 800 },
    series: { dataLabels: { visible: true } },
  });

  return el;
};

export const diverging = () => {
  const { el } = createChart(genderAgeData, {
    yAxis: {
      title: 'Age Group',
    },
    series: {
      diverging: true,
    },
  });

  return el;
};

export const centerYAxis = () => {
  const { el } = createChart(genderAgeData, {
    yAxis: { title: 'Age Group', align: 'center' },
    xAxis: { label: { interval: 2 } },
    series: { diverging: true },
    legend: { width: 80 },
  });

  return el;
};

export const dataLabels = () => {
  const anchor = radios(
    'anchor',
    { center: 'center', start: 'start', end: 'end', auto: 'auto' },
    'auto'
  );
  const { el } = createChart(negativeBudgetData, {
    xAxis: {
      scale: {
        min: -8000,
        max: 8000,
      },
    },
    series: {
      dataLabels: {
        visible: true,
        anchor,
      },
    },
  });

  return el;
};

export const secondaryYAxis = () => {
  const { el } = createChart(budgetData, {
    yAxis: [
      {
        title: 'Month',
      },
      {
        title: 'Secondary Info',
        categories: [
          '06 / 2020',
          '07 / 2020',
          '08 / 2020',
          '09 / 2020',
          '10 / 2020',
          '11 / 2020',
          '12 / 2020',
        ],
      },
    ],
    series: {
      selectable: true,
      eventDetectType: 'grouped',
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
    responsive: {
      animation: { duration: 300 },
      rules: [
        {
          condition: function ({ width: w }) {
            return w <= 600;
          },
          options: {
            legend: {
              align: 'bottom',
            },
          },
        },
        {
          condition: function ({ width: w }) {
            return w <= 400;
          },
          options: {
            legend: {
              visible: false,
            },
            exportMenu: {
              visible: false,
            },
          },
        },
      ],
    },
  });
};

export const theme = () => {
  const { el } = createChart(budgetData, {
    chart: {
      width: 1000,
      height: 800,
    },
    series: {
      selectable: true,
      eventDetectType: radios('eventDetectType', { point: 'point', grouped: 'grouped' }, 'grouped'),
    },
    theme: {
      series: {
        barWidth: 15,
        colors: ['#EDAE49', '#D1495B', '#00798C', '#30638E'],
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
          shadowColor: 'rgba(0, 0, 0, 0.7)',
          shadowOffsetX: 4,
          shadowOffsetY: 4,
          shadowBlur: 6,
          groupedRect: {
            color: '#74521A',
            opacity: 0.2,
          },
          restSeries: {
            areaOpacity: 0.5,
          },
          areaOpacity: 0.8,
        },
      },
    },
  });

  return el;
};

export const dataLabelsWithTheme = () => {
  const { el } = createChart(simpleBudgetData, {
    series: {
      dataLabels: {
        visible: true,
      },
    },
    theme: {
      series: {
        dataLabels: {
          fontFamily: 'Impact',
          fontSize: 13,
          fontWeight: 500,
          color: '#ff416d',
          textBubble: { visible: true, arrow: { visible: true } },
        },
      },
    },
  });

  return el;
};

export const rotatable = () => {
  const { el } = createChart(genderAgeData, {
    yAxis: { title: 'Age Group', align: 'center' },
    xAxis: { title: 'People', label: { interval: 1, rotatable: true }, scale: { stepSize: 50000 } },
    series: { diverging: true },
    legend: { align: 'bottom' },
  });

  return el;
};

export const noData = () => {
  const data = {
    series: [],
    categories: [],
  };
  const { el } = createChart(data, {});

  return el;
};
