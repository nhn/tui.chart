import LineChart from '@src/charts/lineChart';
import { LineSeriesData, LineChartOptions, LineTypeEventDetectType } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import {
  tupleCoordinateData,
  temperatureData,
  coordinateData,
  randomData,
  temperatureData2,
  concurrentUsers,
  temperatureDataWithNull,
  datetimeCoordinateData,
} from './data';
import { boolean, number, radios, withKnobs } from '@storybook/addon-knobs';
import '@src/css/chart.css';
import { createResponsiveChart } from './util';

export default {
  title: 'chart/Line',
  decorators: [withKnobs],
};

const width = 1000;
const height = 500;
const defaultOptions: LineChartOptions = {
  chart: {
    width,
    height,
    title: '24-hr Average Temperature',
  },
  xAxis: { title: 'Month' },
  yAxis: { title: 'Amount' },
  series: {},
  tooltip: {},
  plot: {},
};

function createChart(data: LineSeriesData, customOptions: LineChartOptions = {}) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions);

  el.style.width = `${options.chart?.width}px`;
  el.style.height = `${options.chart?.height}px`;

  const chart = new LineChart({ el, data, options });

  return { el, chart };
}

export const basic = () => {
  const { el } = createChart(temperatureData, {
    xAxis: { pointOnColumn: boolean('pointOnColumn', false) },
  });

  return el;
};

export const basicWithNullData = () => {
  const { el } = createChart(temperatureDataWithNull, {
    xAxis: { pointOnColumn: boolean('pointOnColumn', false) },
    series: {
      spline: true,
      showDot: true,
      dataLabels: {
        visible: true,
      },
    },
  });

  return el;
};

export const basicWithDateOptions = () => {
  const { el } = createChart(temperatureData, {
    xAxis: {
      pointOnColumn: true,
      date: {
        format: 'YY-MM-DD',
      },
    },
  });

  return el;
};

export const basicWithShowDot = () => {
  const { el } = createChart(temperatureData, {
    xAxis: { pointOnColumn: true },
    series: { showDot: true },
  });

  return el;
};

export const basicWithEventDetectType = () => {
  const { el } = createChart(temperatureData, {
    xAxis: { pointOnColumn: boolean('pointOnColumn', false) },
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

export const spline = () => {
  const { el } = createChart(temperatureData2, {
    series: { spline: boolean('spline', true) },
  });

  return el;
};

export const coordinate = () => {
  const { el } = createChart(coordinateData, {
    chart: { title: 'Concurrent user' },
    xAxis: { pointOnColumn: false, title: 'minute' },
    yAxis: { title: 'users' },
  });

  return el;
};

export const tupleCoordinate = () => {
  const { el } = createChart(tupleCoordinateData as LineSeriesData, {
    chart: { title: 'Concurrent user' },
    xAxis: { pointOnColumn: false, title: 'minute' },
    yAxis: { title: 'users' },
  });

  return el;
};

export const datetimeCoordinate = () => {
  const { el } = createChart(datetimeCoordinateData as LineSeriesData, {
    chart: { title: 'Concurrent user' },
    xAxis: {
      title: 'minute',
      pointOnColumn: false,
      date: { format: 'hh:mm:ss' },
    },
  });

  return el;
};

export const datetimeCoordinateLargeData = () => {
  const { el } = createChart(concurrentUsers as LineSeriesData, {
    chart: { title: 'Concurrent user' },
    xAxis: {
      title: 'minute',
      pointOnColumn: false,
      date: { format: 'hh:mm' },
    },
    yAxis: { title: 'users' },
    series: { zoomable: true },
  });

  return el;
};

export const tickInterval = () => {
  const options = {
    chart: { title: 'Label Interval' },
    xAxis: {
      title: 'x axis data',
      tick: {
        interval: number('tickInterval', 2, {
          range: true,
          min: 1,
          max: 20,
          step: 1,
        }),
      },
    },
    yAxis: { title: 'y axis data' },
  };

  const { el } = createChart(randomData(50), options);

  return el;
};

export const labelInterval = () => {
  const options = {
    chart: { title: 'Label Interval' },
    xAxis: {
      title: 'x axis data',
      label: {
        interval: number('labelInterval', 2, {
          range: true,
          min: 1,
          max: 20,
          step: 1,
        }),
      },
    },
    yAxis: { title: 'y axis data' },
  };

  const { el } = createChart(randomData(50), options);

  return el;
};

export const scale = () => {
  const { el } = createChart(temperatureData2, {
    yAxis: {
      scale: {
        min: number('min', -1000, {
          range: true,
          min: -5000,
          max: 14000,
          step: 1000,
        }),
        max: number('max', 10000, {
          range: true,
          min: -5000,
          max: 14000,
          step: 1000,
        }),
        stepSize: number('scale', 1500, {
          range: true,
          min: 100,
          max: 14000,
          step: 100,
        }),
      },
    },
    series: { spline: true },
  });

  return el;
};

export const xAxisStepSizeAuto = () => {
  const { el } = createChart(randomData(100), {
    xAxis: {
      scale: {
        stepSize: 'auto',
      },
    },
  });

  return el;
};

export const dataLabels = () => {
  const { el } = createChart(temperatureData, {
    series: {
      dataLabels: {
        visible: true,
      },
      showDot: true,
    },
    xAxis: { pointOnColumn: true },
  });

  return el;
};

export const zoomable = () => {
  const { el } = createChart(randomData(30), {
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

export const coordinateZoomable = () => {
  const { el } = createChart(coordinateData, {
    chart: { title: 'Concurrent user' },
    xAxis: { pointOnColumn: false, title: 'minute' },
    yAxis: { title: 'users' },
    series: { zoomable: true },
  });

  return el;
};

export const animationDuration = () => {
  const { el } = createChart(temperatureData, {
    chart: {
      animation: {
        duration: number('duration', 700, {
          range: true,
          min: 0,
          max: 3000,
          step: 100,
        }),
      },
    },
    series: {
      zoomable: true,
    },
  });

  return el;
};

export const selectable = () => {
  const { el } = createChart(temperatureData, {
    series: {
      selectable: true,
    },
  });

  return el;
};

export const secondaryYAxis = () => {
  const { el } = createChart(temperatureData, {
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
  return createResponsiveChart<LineSeriesData, LineChartOptions>(LineChart, temperatureData, {
    chart: {
      title: '24-hr Average Temperature',
      width: 'auto',
      height: 'auto',
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
      lineWidth: 3,
      select: {
        dot: {
          color: '#ff416d',
          radius: 6,
          borderColor: '#00b5a1',
          borderWidth: 2,
        },
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
    },
  };

  const { el } = createChart(temperatureData, {
    theme: themeOptions,
    series: {
      selectable: true,
      showDot: true,
    },
    xAxis: {
      pointOnColumn: true,
    },
  });

  return el;
};

export const dataLabelsWithTheme = () => {
  const { el } = createChart(temperatureData, {
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
            paddingY: 3,
            paddingX: 6,
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
    xAxis: { pointOnColumn: boolean('pointOnColumn', false) },
    series: {
      shift: boolean('shift', true),
    },
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

export const syncTooltip = () => {
  const options = {
    chart: { title: 'Sync tooltip', width: 800, height: 300 },
    xAxis: {
      title: 'x axis data',
    },
    yAxis: { title: 'y axis data' },
    series: {
      eventDetectType: 'grouped' as LineTypeEventDetectType,
    },
  };

  const { chart, el } = createChart(randomData(10), options);
  const { chart: chart2, el: el2 } = createChart(randomData(10), options);
  const { chart: chart3, el: el3 } = createChart(randomData(10), options);

  const chartGroupElem = document.createElement('div');
  chartGroupElem.append(el, el2, el3);

  chart.on('hoverSeries', (ev) => {
    const { index, seriesIndex } = ev[0];

    chart2.showTooltip({ index, seriesIndex });
    chart3.showTooltip({ index, seriesIndex });
  });

  chart.on('unhoverSeries', () => {
    chart2.hideTooltip();
    chart3.hideTooltip();
  });

  chart2.on('hoverSeries', (ev) => {
    const { index, seriesIndex } = ev[0];

    chart.showTooltip({ index, seriesIndex });
    chart3.showTooltip({ index, seriesIndex });
  });

  chart2.on('unhoverSeries', () => {
    chart.hideTooltip();
    chart3.hideTooltip();
  });

  chart3.on('hoverSeries', (ev) => {
    const { index, seriesIndex } = ev[0];

    chart.showTooltip({ index, seriesIndex });
    chart2.showTooltip({ index, seriesIndex });
  });

  chart3.on('unhoverSeries', () => {
    chart.hideTooltip();
    chart2.hideTooltip();
  });

  return chartGroupElem;
};

export const rotatable = () => {
  return createResponsiveChart<LineSeriesData, LineChartOptions>(LineChart, temperatureData, {
    chart: {
      title: '24-hr Average Temperature',
      width: 'auto',
      height: 'auto',
    },
    yAxis: { label: { interval: 2 } },
    xAxis: {
      title: { text: 'Month', offsetY: 10 },
      label: {
        rotatable: boolean('rotatable', true),
      },
      scale: {
        stepSize: 1,
      },
    },
    responsive: {
      rules: [
        {
          condition({ width: w }) {
            return w < 600;
          },
          options: {
            legend: {
              visible: false,
            },
          },
        },
        {
          condition({ width: w }) {
            return w < 800;
          },
          options: {
            legend: {
              visible: true,
              align: 'bottom',
            },
          },
        },
      ],
    },
  });
};

export const noData = () => {
  const data = {
    series: [],
    categories: [],
  };
  const { el } = createChart(data);

  return el;
};
