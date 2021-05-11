import ColumnChart from '@src/charts/columnChart';
import {
  budgetData,
  temperatureRangeData,
  negativeBudgetData,
  lossData,
  genderAgeData,
  simpleBudgetData,
} from './data';
import { ColumnChartOptions, BoxSeriesData } from '@t/options';
import { deepMergedCopy, range as rangeUtil } from '@src/helpers/utils';
import { withKnobs, radios } from '@storybook/addon-knobs';
import '@src/css/chart.css';
import { createResponsiveChart } from './util';

export default {
  title: 'chart/Column/General',
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

function createChart(data: BoxSeriesData, customOptions: ColumnChartOptions = {}) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions);

  el.style.width = `${options.chart?.width}px`;
  el.style.height = `${options.chart?.height}px`;

  const chart = new ColumnChart({
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

export const liveUpdate = () => {
  const data = {
    categories: ['1', '2', '3', '4', '5', '6', '7'],
    series: [
      {
        name: 'A',
        data: [10, 20, 30, 20, 60, 100, 150],
      },
      {
        name: 'B',
        data: [50, 10, 20, 10, 40, 150, 100],
      },
    ],
  };

  const { el, chart } = createChart(data, {
    series: {
      shift: true,
    },
  });

  let idx = 8;
  const intervalId = setInterval(() => {
    const randomData = rangeUtil(0, 2).map(() => Math.round(Math.random() * 200));
    chart.addData(randomData, idx.toString());
    if (idx === 20) {
      clearInterval(intervalId);
    }
    idx += 1;
  }, 2500);

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
    yAxis: {
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
    yAxis: {
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
    yAxis: {
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
    yAxis: {
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
    series: { dataLabels: { visible: true } },
  });

  return el;
};

export const diverging = () => {
  const { el } = createChart(genderAgeData, {
    xAxis: {
      title: 'Age Group',
    },
    yAxis: {
      label: {
        interval: 2,
      },
    },
    series: {
      diverging: true,
    },
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
    series: {
      dataLabels: {
        visible: true,
        anchor,
      },
    },
  });

  return el;
};

export const responsive = () => {
  return createResponsiveChart<BoxSeriesData, ColumnChartOptions>(ColumnChart, budgetData, {
    chart: {
      title: 'Monthly Revenue',
      width: 'auto',
      height: 'auto',
    },
  });
};

export const theme = () => {
  const { el } = createChart(budgetData, {
    series: {
      selectable: true,
      eventDetectType: radios('eventDetectType', { point: 'point', grouped: 'grouped' }, 'grouped'),
    },
    theme: {
      series: {
        barWidth: 10,
        areaOpacity: 1,
        colors: ['#EDAE49', '#D1495B', '#00798C', '#30638E'],
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
          color: '#ffffff',
          textBubble: {
            visible: true,
            arrow: { visible: true },
            borderRadius: 7,
            borderWidth: 2,
            borderColor: '#e91e63',
            backgroundColor: '#0f73a2',
          },
        },
      },
    },
  });

  return el;
};

export const axisFormatter = () => {
  const { el } = createChart(budgetData, {
    yAxis: { label: { formatter: (value) => `$${value}` } },
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
