import { HeatmapSeriesData, SeriesDataType, HeatmapChartOptions } from '@t/options';
import { deepMergedCopy, range } from '@src/helpers/utils';
import {
  contributionsData,
  temperatureAverageDataForHeatmap,
  temperatureAverageDataForHeatmapWithNull,
} from './data';
import { withKnobs } from '@storybook/addon-knobs';
import HeatmapChart from '@src/charts/heatmapChart';
import '@src/css/chart.css';
import { createResponsiveChart } from './util';

export default {
  title: 'chart/Heatmap',
  decorators: [withKnobs],
};

const width = 800;
const height = 450;
const defaultOptions: HeatmapChartOptions = {
  chart: {
    width,
    height,
    title: '24-hr Average Temperature',
  },
  xAxis: {
    title: 'Month',
  },
  yAxis: {
    title: 'City',
  },
  series: {},
  tooltip: {
    formatter: (value: SeriesDataType) => `${value}°C`,
  },
  plot: {},
  legend: {
    align: 'bottom',
  },
};

function createChart(data: HeatmapSeriesData, customOptions: HeatmapChartOptions = {}) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions);

  el.style.width = `${options.chart?.width}px`;
  el.style.height = `${options.chart?.height}px`;

  const chart = new HeatmapChart({ el, data, options });

  return { el, chart };
}

export const basic = () => {
  const { el } = createChart(temperatureAverageDataForHeatmap, {
    legend: { align: 'right' },
  });

  return el;
};

export const basicWithNullData = () => {
  const { el } = createChart(temperatureAverageDataForHeatmapWithNull, {
    series: {
      dataLabels: {
        visible: true,
      },
    },
  });

  return el;
};

export const liveUpdate = () => {
  const data = {
    categories: {
      x: ['1', '2', '3', '4', '5', '6', '7'],
      y: ['A', 'B', 'C'],
    },
    series: [
      [-3.5, -1.1, 4.0, 11.3, 17.5, 21.5, 24.9],
      [3.8, 5.6, 7.0, 9.1, 12.4, 15.3, 17.5],
      [22.1, 22.0, 20.9, 18.3, 15.2, 12.8, 11.8],
    ],
  };

  const { el, chart } = createChart(data, {
    series: { shift: true },
  });

  let index = 8;
  const intervalId = setInterval(() => {
    const random = range(0, 3).map(() => Math.round(Math.random() * 50));
    chart.addData(random, index.toString());
    if (index === 15) {
      clearInterval(intervalId);
    }
    index += 1;
  }, 3000);

  return el;
};

export const dataLabels = () => {
  const { el } = createChart(temperatureAverageDataForHeatmap, {
    series: {
      dataLabels: {
        visible: true,
      },
    },
  });

  return el;
};

export const selectable = () => {
  const { el } = createChart(temperatureAverageDataForHeatmap, {
    series: {
      selectable: true,
    },
  });

  return el;
};

export const datetimeCategory = () => {
  const { el } = createChart(contributionsData, {
    xAxis: {
      date: { format: 'yyyy-MM' },
    },
    tooltip: {
      formatter: (value: SeriesDataType) => `${value} commit`,
    },
  });

  return el;
};

export const responsive = () => {
  return createResponsiveChart<HeatmapSeriesData, HeatmapChartOptions>(
    HeatmapChart,
    temperatureAverageDataForHeatmap,
    {
      chart: {
        title: '24-hr Average Temperature',
        width: 'auto',
        height: 'auto',
      },
      legend: { align: 'right' },
    }
  );
};

export const theme = () => {
  const { el } = createChart(temperatureAverageDataForHeatmap, {
    series: {
      selectable: true,
      dataLabels: { visible: true },
    },
    theme: {
      series: {
        startColor: '#F3FFE3',
        endColor: '#FF9CEE',
        borderWidth: 3,
        borderColor: '#ffffff',
        select: {
          color: '#fdfd96',
          borderWidth: 2,
          borderColor: '#80CEE1',
        },
        hover: {
          color: '#FFB144',
          borderWidth: 5,
          borderColor: '#CAE7C1',
        },
      },
    },
  });

  return el;
};

export const dataLabelsWithTheme = () => {
  const { el } = createChart(temperatureAverageDataForHeatmap, {
    series: {
      dataLabels: { visible: true },
    },
    theme: {
      series: {
        dataLabels: {
          fontFamily: 'monaco',
          fontSize: 9,
          fontWeight: '600',
          useSeriesColor: true,
          textBubble: {
            visible: true,
            backgroundColor: '#333333',
            paddingX: 1,
            paddingY: 1,
            borderRadius: 5,
          },
        },
      },
    },
  } as HeatmapChartOptions);

  return el;
};

export const rotatable = () => {
  const { el } = createChart(temperatureAverageDataForHeatmap, {
    chart: { title: '24-hr Average Temperature', width: 400, height: 300 },
    xAxis: {
      label: {
        rotatable: true,
      },
    },
    legend: { align: 'right' },
  });

  return el;
};

export const noData = () => {
  const data = {
    series: [],
    categories: {
      x: [],
      y: [],
    },
  };
  const { el } = createChart(data);

  return el;
};
