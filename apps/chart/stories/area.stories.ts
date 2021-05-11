import AreaChart from '@src/charts/areaChart';
import { AreaChartOptions, AreaSeriesData } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import {
  avgTemperatureData,
  avgTemperatureDataWithNull,
  budgetData,
  temperatureRangeData,
  temperatureRangeDataWithNull,
} from './data';
import { withKnobs, boolean, radios } from '@storybook/addon-knobs';
import '@src/css/chart.css';
import { createResponsiveChart } from './util';

export default {
  title: 'chart/Area',
  decorators: [withKnobs],
};

const width = 1000;
const height = 500;
const defaultOptions: AreaChartOptions = {
  chart: {
    width,
    height,
  },
  yAxis: {},
  xAxis: {},
  series: {},
  tooltip: {},
  plot: {},
};

function createChart(data: AreaSeriesData, customOptions: AreaChartOptions = {}) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions);

  el.style.width = `${options.chart?.width}px`;
  el.style.height = `${options.chart?.height}px`;

  const chart = new AreaChart({ el, data, options });

  return { el, chart };
}

export const basic = () => {
  const { el } = createChart(avgTemperatureData, {
    chart: { title: 'Average Temperature' },
    xAxis: { pointOnColumn: boolean('pointOnColumn', false), title: { text: 'Month' } },
    yAxis: { title: 'Temperature (Celsius)' },
    series: { eventDetectType: 'grouped' },
  });

  return el;
};

export const basicWithNullData = () => {
  const { el } = createChart(avgTemperatureDataWithNull, {
    chart: { title: 'Average Temperature' },
    xAxis: { pointOnColumn: boolean('pointOnColumn', false), title: { text: 'Month' } },
    yAxis: { title: 'Temperature (Celsius)' },
    series: {
      showDot: true,
      stack: {
        type: 'normal',
      },
      spline: true,
      dataLabels: {
        visible: true,
      },
    },
  });

  return el;
};

export const liveUpdate = () => {
  const data = {
    categories: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    series: [
      {
        name: 'A',
        data: [10, 100, 50, 40, 70, 55, 33, 70, 90, 110],
      },
      {
        name: 'B',
        data: [60, 40, 10, 33, 70, 90, 100, 17, 40, 80],
      },
    ],
  };

  const { el, chart } = createChart(data, {
    chart: { title: 'Average Temperature' },
    xAxis: { pointOnColumn: boolean('pointOnColumn', false), title: { text: 'Month' } },
    yAxis: { title: 'Temperature (Celsius)' },
    series: { shift: true },
  });

  let index = 11;
  const intervalId = setInterval(() => {
    const random = Math.round(Math.random() * 100);
    const random2 = Math.round(Math.random() * 100);
    chart.addData([random, random2], index.toString());
    index += 1;
    if (index === 30) {
      clearInterval(intervalId);
    }
  }, 1500);

  return el;
};

export const basicSpline = () => {
  const { el } = createChart(avgTemperatureData, {
    chart: { title: 'Average Temperature' },
    xAxis: { pointOnColumn: boolean('pointOnColumn', false), title: { text: 'Month' } },
    yAxis: { title: 'Temperature (Celsius)' },
    series: { spline: true },
  });

  return el;
};

export const basicWithShowDot = () => {
  const { el } = createChart(avgTemperatureData, {
    chart: { title: 'Average Temperature' },
    xAxis: { pointOnColumn: boolean('pointOnColumn', false), title: { text: 'Month' } },
    yAxis: { title: 'Temperature (Celsius)' },
    series: { showDot: true },
  });

  return el;
};

export const basicWithEventDetectType = () => {
  const { el } = createChart(avgTemperatureData, {
    chart: { title: 'Average Temperature' },
    xAxis: { pointOnColumn: boolean('pointOnColumn', false), title: { text: 'Month' } },
    yAxis: { title: 'Temperature (Celsius)' },
    series: {
      eventDetectType: radios(
        'eventDetectType',
        { near: 'near', nearest: 'nearest', grouped: 'grouped' },
        'nearest'
      ),
    },
  });

  return el;
};

export const dataLabels = () => {
  const { el } = createChart(avgTemperatureData, {
    series: {
      dataLabels: {
        visible: true,
      },
    },
  });

  return el;
};

export const range = () => {
  const { el } = createChart(temperatureRangeData as AreaSeriesData, {
    chart: { title: 'Temperature Range' },
    xAxis: {
      title: { text: 'Temperature (Celsius)' },
    },
    yAxis: { title: 'Month' },
    series: { eventDetectType: 'grouped' },
  });

  return el;
};

export const rangeWithNullData = () => {
  const { el } = createChart(temperatureRangeDataWithNull as AreaSeriesData, {
    chart: { title: 'Temperature Range' },
    xAxis: {
      title: { text: 'Temperature (Celsius)' },
    },
    yAxis: { title: 'Month' },
    series: { eventDetectType: 'grouped', showDot: true, dataLabels: { visible: true } },
  });

  return el;
};

export const rangeSpline = () => {
  const { el } = createChart(temperatureRangeData as AreaSeriesData, {
    chart: { title: 'Temperature Range' },
    xAxis: {
      title: { text: 'Temperature (Celsius)' },
    },
    yAxis: { title: 'Month' },
    series: { spline: true },
  });

  return el;
};

export const normalStack = () => {
  const { el } = createChart(budgetData, {
    chart: { title: 'Monthly Revenue' },
    xAxis: {
      title: { text: 'Month' },
    },
    yAxis: { title: 'Amount' },
    series: {
      stack: {
        type: 'normal',
      },
    },
  });

  return el;
};

export const normalStackSpline = () => {
  const { el } = createChart(budgetData, {
    chart: { title: 'Monthly Revenue' },
    xAxis: {
      title: { text: 'Month' },
    },
    yAxis: { title: 'Amount' },
    series: {
      stack: {
        type: 'normal',
      },
      spline: true,
    },
  });

  return el;
};

export const percentStack = () => {
  const { el } = createChart(budgetData, {
    chart: { title: 'Monthly Revenue' },
    xAxis: {
      title: { text: 'Month' },
    },
    yAxis: { title: 'Amount' },
    series: {
      stack: {
        type: 'percent',
      },
    },
  });

  return el;
};

export const zoomable = () => {
  const { el } = createChart(avgTemperatureData, {
    series: {
      zoomable: true,
      dataLabels: {
        visible: true,
      },
    },
    xAxis: {
      pointOnColumn: false,
    },
  });

  return el;
};

export const selectable = () => {
  const { el } = createChart(avgTemperatureData, {
    chart: { title: 'Average Temperature' },
    xAxis: { title: { text: 'Month' } },
    yAxis: { title: 'Temperature (Celsius)' },
    series: { selectable: true, eventDetectType: 'near' },
  });

  return el;
};

export const secondaryYAxis = () => {
  const { el } = createChart(avgTemperatureData, {
    yAxis: [
      {
        title: 'Temperature (Celsius)',
      },
      {
        title: 'Percent (%)',
        scale: {
          min: 0,
          max: 100,
        },
      },
    ],
  });

  return el;
};

export const responsive = () => {
  return createResponsiveChart<AreaSeriesData, AreaChartOptions>(AreaChart, avgTemperatureData, {
    chart: {
      title: 'Average Temperature',
      width: 'auto',
      height: 'auto',
    },
    responsive: {
      animation: { duration: 300 },
    },
  });
};

export const theme = () => {
  const themeOptions = {
    series: {
      colors: [
        '#83b14e',
        '#458a3f',
        '#295ba0',
        '#2a4175',
        '#289399',
        '#289399',
        '#617178',
        '#8a9a9a',
        '#516f7d',
        '#dddddd',
      ],
      dashSegments: [5, 10],
      lineWidth: 1,
      select: {
        dot: {
          color: '#ff416d',
          radius: 6,
          borderColor: '#00b5a1',
          borderWidth: 2,
        },
        restSeries: {
          areaOpacity: 0.01,
        },
        areaOpacity: 0.8,
      },
      hover: {
        dot: {
          color: '#00ffff',
          radius: 6,
          borderColor: '#0859c6',
          borderWidth: 2,
        },
      },
      dot: {
        radius: 6,
        borderColor: '#ffff00',
        borderWidth: 2,
      },
      areaOpacity: 0.4,
    },
  };

  const { el } = createChart(avgTemperatureData, {
    chart: { title: 'Average Temperature' },
    series: {
      selectable: true,
      showDot: true,
    },
    xAxis: { pointOnColumn: false, title: { text: 'Month' } },
    yAxis: { title: 'Temperature (Celsius)' },
    theme: themeOptions,
  });

  return el;
};

export const dataLabelsWithTheme = () => {
  const { el } = createChart(avgTemperatureData, {
    series: {
      dataLabels: { visible: true },
    },
    theme: {
      series: {
        dataLabels: {
          fontFamily: 'monaco',
          fontSize: 13,
          fontWeight: 700,
          useSeriesColor: true,
          lineWidth: 2,
          textStrokeColor: '#000000',
          shadowColor: '#000000',
          shadowBlur: 6,
        },
      },
    },
  });

  return el;
};

export const dataLabelsWithBubbleTheme = () => {
  const { el } = createChart(avgTemperatureData, {
    series: {
      dataLabels: { visible: true, offsetY: -10 },
    },
    theme: {
      series: {
        dataLabels: {
          fontFamily: 'monaco',
          fontSize: 10,
          fontWeight: 300,
          useSeriesColor: true,
          textBubble: {
            visible: true,
            arrow: {
              visible: true,
              width: 5,
              height: 5,
              direction: 'bottom',
            },
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
  const { el } = createChart(data, {});

  return el;
};
