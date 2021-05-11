import { LineAreaChartOptions, LineAreaData } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { energyUsageData, energyUsageStackData } from './data';
import { withKnobs } from '@storybook/addon-knobs';
import LineAreaChart from '@src/charts/lineAreaChart';
import { LineAreaChartThemeOptions } from '@t/theme';
import '@src/css/chart.css';
import { createResponsiveChart } from './util';

export default {
  title: 'chart/LineArea',
  decorators: [withKnobs],
};

const width = 1000;
const height = 500;
const defaultOptions: LineAreaChartOptions = {
  chart: {
    width,
    height,
    title: 'Energy Usage',
  },
  xAxis: {
    title: 'Month',
    date: { format: 'yy/MM' },
  },
  yAxis: {
    title: 'Energy (kWh)',
  },
  series: {},
  tooltip: {
    formatter: (value) => `${value}kWh`,
  },
  plot: {},
};

function createChart(data: LineAreaData, customOptions: LineAreaChartOptions = {}) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions);

  el.style.width = `${options.chart?.width}px`;
  el.style.height = `${options.chart?.height}px`;

  const chart = new LineAreaChart({ el, data, options });

  return { el, chart };
}

export const basic = () => {
  const { el } = createChart(energyUsageData, {});

  return el;
};

export const basicWithStackArea = () => {
  const { el } = createChart(energyUsageStackData, {
    series: { area: { stack: { type: 'normal' } } },
  });

  return el;
};

export const basicWithOptions = () => {
  const { el } = createChart(energyUsageData, {
    series: {
      line: {
        spline: true,
        dataLabels: { visible: true },
      },
      area: {
        showDot: true,
        dataLabels: { visible: false },
      },
      zoomable: true,
      selectable: true,
    },
  });

  return el;
};

export const secondaryYAxis = () => {
  const { el } = createChart(energyUsageStackData, {
    series: { area: { stack: { type: 'normal' } } },
    yAxis: [
      {
        title: 'Energy (kWh)',
        chartType: 'line',
      },
      {
        title: 'Powered Usage',
        chartType: 'area',
      },
    ],
  });

  return el;
};

export const responsive = () => {
  return createResponsiveChart<LineAreaData, LineAreaChartOptions>(LineAreaChart, energyUsageData, {
    chart: { title: 'Energy Usage', width: 'auto', height: 'auto' },
    yAxis: [
      {
        title: 'Energy (kWh)',
      },
      {
        title: 'Powered Usage',
      },
    ],
    xAxis: {
      title: 'Month',
      date: { format: 'yy/MM' },
    },
  });
};

export const theme = () => {
  const themeOptions: LineAreaChartThemeOptions = {
    series: {
      line: {
        colors: ['#957DAD'],
        hover: {
          dot: {
            radius: 8,
          },
        },
      },
      area: {
        colors: ['#FEE333'],
        areaOpacity: 0.4,
        lineWidth: 5,
      },
    },
  };

  const { el } = createChart(energyUsageData, { theme: themeOptions });

  return el;
};

export const liveUpdate = () => {
  const data = {
    categories: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    series: {
      line: [
        {
          name: 'A',
          data: [10, 100, 50, 40, 70, 55, 33, 70, 90, 110],
        },
      ],
      area: [
        {
          name: 'B',
          data: [60, 40, 10, 33, 70, 90, 100, 17, 40, 80],
        },
      ],
    },
  };

  const { chart, el } = createChart(data, {
    series: { shift: true },
    xAxis: { date: { format: '' } },
  });

  let index = 11;
  const intervalId = setInterval(() => {
    const random = Math.round(Math.random() * 100);
    const random2 = Math.round(Math.random() * 100);
    chart.addData([random], index.toString(), 'area');
    chart.addData([random2], index.toString(), 'line');
    index += 1;
    if (index === 30) {
      clearInterval(intervalId);
    }
  }, 1500);

  return el;
};

export const noData = () => {
  const data = {
    series: {
      line: [],
      area: [],
    },
    categories: [],
  };
  const { el } = createChart(data);

  return el;
};
