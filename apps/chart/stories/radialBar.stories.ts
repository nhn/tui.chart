import RadialBarChart from '@src/charts/radialBarChart';
import { olympicMedalData, olympicMedalDataWithNull } from './data';
import { deepMergedCopy } from '@src/helpers/utils';
import '@src/css/chart.css';
import { RadialBarChartOptions } from '@t/options';
import { withKnobs, radios } from '@storybook/addon-knobs';

export default {
  title: 'chart.RadialBar',
  decorators: [withKnobs],
};
const width = 700;
const height = 700;
const defaultOptions: RadialBarChartOptions = {
  chart: {
    width,
    height,
    title: 'Winter Olympic medals per existing country (TOP 5)',
  },
};

function createChart(data, customOptions: Record<string, any> = {}) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions);

  el.style.width = options.chart?.width === 'auto' ? '90vw' : `${options.chart?.width}px`;
  el.style.height = options.chart?.height === 'auto' ? '90vh' : `${options.chart?.height}px`;

  const chart = new RadialBarChart({
    el,
    data,
    options,
  });

  return { el, chart };
}

export const basic = () => {
  const { el } = createChart(olympicMedalData);

  return el;
};

export const basicWithNull = () => {
  const { el } = createChart(olympicMedalDataWithNull);

  return el;
};

export const counterClockwise = () => {
  const { el } = createChart(olympicMedalData, {
    series: {
      clockwise: false,
    },
  });

  return el;
};

export const radiusRange = () => {
  const { el } = createChart(olympicMedalData, {
    series: {
      radiusRange: {
        inner: 50,
        outer: '90%',
      },
    },
  });

  return el;
};

export const reponsive = () => {
  const { el } = createChart(olympicMedalData, {
    chart: { width: 'auto', height: 'auto' },
    responsive: {
      rules: [
        {
          condition: ({ width: w }) => {
            return w < 400;
          },
          options: {
            legend: { visible: false },
          },
        },
      ],
    },
  });

  return el;
};

export const selectable = () => {
  const { el } = createChart(olympicMedalData, {
    series: {
      selectable: true,
      eventDetectType: radios('eventDetectType', { point: 'point', grouped: 'grouped' }, 'point'),
    },
  });

  return el;
};

export const dataLabels = () => {
  const { el } = createChart(olympicMedalData, {
    series: {
      dataLabels: {
        visible: true,
        anchor: radios('anchor', { start: 'start', center: 'center', end: 'end' }, 'start'),
      },
    },
  });

  return el;
};

export const theme = () => {
  const { el } = createChart(olympicMedalData, {
    yAxis: {
      label: { margin: 10 },
    },
    radialAxis: {
      label: { margin: 10 },
    },
    theme: {
      series: {
        barWidth: 20,
        colors: ['#ffd700', '#c0c0c0', '#cd7f32'],
        hover: {
          color: '#ff0000',
          groupedSector: {
            color: '#ff0000',
            opacity: 0.3,
          },
        },
      },
      yAxis: {
        label: {
          color: '#fff',
          align: 'center',
          textBubble: {
            visible: true,
            borderRadius: 5,
            backgroundColor: 'rgba(7, 59, 76, 1)',
            paddingX: 5,
            paddingY: 4,
          },
        },
      },
      radialAxis: {
        strokeStyle: 'rgba(7, 59, 76, 0.3)',
        dotColor: 'rgba(7, 59, 76, 0.8)',
        label: {
          color: '#073b4c',
        },
      },
    },
  });

  return el;
};

export const themeWithDataLabels = () => {
  const { el } = createChart(olympicMedalData, {
    series: {
      dataLabels: {
        visible: true,
        anchor: radios('anchor', { start: 'start', center: 'center', end: 'end' }, 'start'),
      },
    },
    theme: {
      series: {
        dataLabels: {
          fontFamily: 'monaco',
          fontSize: 12,
          fontWeight: 600,
          useSeriesColor: true,
          lineWidth: 2,
          textStrokeColor: '#ffffff',
          shadowColor: '#ffffff',
          shadowBlur: 6,
        },
      },
    },
  });

  return el;
};
