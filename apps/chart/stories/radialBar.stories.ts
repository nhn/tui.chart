import RadialBarChart from '@src/charts/radialBarChart';
import { olympicMedalData, olympicMedalDataWithNull } from './data';
import { deepMergedCopy } from '@src/helpers/utils';
import '@src/css/chart.css';
import { RadialBarChartOptions, RadialBarSeriesData } from '@t/options';
import { withKnobs, radios, boolean, number } from '@storybook/addon-knobs';
import { createResponsiveChart } from './util';

export default {
  title: 'chart/RadialBar',
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

function createChart(data: RadialBarSeriesData, customOptions: RadialBarChartOptions = {}) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions);

  el.style.width = `${options.chart?.width}px`;
  el.style.height = `${options.chart?.height}px`;

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

export const angleRange = () => {
  const { el } = createChart(olympicMedalData, {
    series: {
      angleRange: {
        start: 45,
        end: 315,
      },
    },
  });

  return el;
};

export const angleRangeWithCounterClockwise = () => {
  const { el } = createChart(olympicMedalData, {
    series: {
      clockwise: false,
      angleRange: {
        start: 315,
        end: 45,
      },
    },
  });

  return el;
};

export const angleRangeWithDataLabels = () => {
  const { el } = createChart(olympicMedalData, {
    series: {
      angleRange: {
        start: 45,
        end: 315,
      },
      dataLabels: {
        visible: true,
        anchor: radios('anchor', { start: 'start', center: 'center', end: 'end' }, 'start'),
      },
    },
  });

  return el;
};

export const angleRangeWithTheme = () => {
  const { el } = createChart(olympicMedalData, {
    series: {
      angleRange: {
        start: 45,
        end: 315,
      },
      dataLabels: {
        visible: true,
        anchor: radios('anchor', { start: 'start', center: 'center', end: 'end' }, 'start'),
      },
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
        dataLabels: {
          fontFamily: 'monaco',
          fontSize: 10,
          fontWeight: 600,
          color: '#fff',
          textBubble: {
            visible: true,
            backgroundColor: 'rgba(0, 0, 0, 0)',
            paddingX: 5,
            paddingY: 0,
          },
        },
      },
      verticalAxis: {
        label: {
          color: '#fff',
          textBubble: {
            visible: true,
            borderRadius: 5,
            backgroundColor: 'rgba(7, 59, 76, 1)',
            paddingX: 5,
            paddingY: 4,
          },
        },
      },
      circularAxis: {
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

export const responsive = () => {
  return createResponsiveChart<RadialBarSeriesData, RadialBarChartOptions>(
    RadialBarChart,
    olympicMedalData,
    {
      chart: {
        title: 'Winter Olympic medals per existing country (TOP 5)',
        width: 'auto',
        height: 'auto',
      },
      responsive: {
        animation: { duration: 300 },
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
    }
  );
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
      clockwise: boolean('clockwise', true),
      radiusRange: {
        inner: number('radiusRange.inner', 10, {
          range: true,
          min: 0,
          max: 80,
          step: 10,
        }),
        outer: '90%',
      },
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
    verticalAxis: {
      label: { margin: 10 },
    },
    circularAxis: {
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
      verticalAxis: {
        label: {
          color: '#fff',
          textBubble: {
            visible: true,
            borderRadius: 5,
            backgroundColor: 'rgba(7, 59, 76, 1)',
            paddingX: 5,
            paddingY: 4,
          },
        },
      },
      circularAxis: {
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
          textBubble: { visible: true },
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
