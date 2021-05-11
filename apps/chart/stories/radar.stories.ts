import RadarChart from '@src/charts/radarChart';
import { RadarSeriesData, RadarChartOptions } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { budgetData2, budgetData2WithNull } from './data';
import '@src/css/chart.css';
import { createResponsiveChart } from './util';

export default {
  title: 'chart/Radar',
};

const defaultOptions: RadarChartOptions = {
  chart: {
    width: 700,
    height: 700,
    title: 'Annual Incomes',
  },
};

function createChart(data: RadarSeriesData, customOptions: RadarChartOptions = {}) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions || {});

  el.style.width = `${options.chart?.width}px`;
  el.style.height = `${options.chart?.height}px`;

  const chart = new RadarChart({ el, data, options });

  return { el, chart };
}

export const basic = () => {
  const { el } = createChart(budgetData2, {
    legend: {
      visible: true,
      align: 'bottom',
    },
  });

  return el;
};

export const basicWithNullData = () => {
  const { el } = createChart(budgetData2WithNull, {
    series: {
      showDot: true,
      showArea: true,
    },
    legend: {
      visible: true,
      align: 'bottom',
    },
  });

  return el;
};

export const usingCirclePlot = () => {
  const { el } = createChart(budgetData2, {
    plot: {
      type: 'circle',
    },
    legend: {
      visible: true,
      align: 'bottom',
    },
  });

  return el;
};

export const showDot = () => {
  const { el } = createChart(budgetData2, {
    series: {
      showDot: true,
    },
    legend: {
      visible: true,
      align: 'bottom',
    },
  });

  return el;
};

export const showArea = () => {
  const { el } = createChart(budgetData2, {
    series: {
      showArea: true,
    },
    legend: {
      visible: true,
      align: 'bottom',
    },
  });

  return el;
};

export const selectable = () => {
  const { el } = createChart(budgetData2, {
    series: {
      selectable: true,
    },
  });

  return el;
};

export const responsive = () => {
  return createResponsiveChart<RadarSeriesData, RadarChartOptions>(RadarChart, budgetData2, {
    chart: {
      title: 'Annual Incomes',
      width: 'auto',
      height: 'auto',
    },
  });
};

export const labelInterval = () => {
  const { el } = createChart(budgetData2, {
    legend: {
      visible: true,
      align: 'bottom',
    },
    verticalAxis: {
      scale: {
        max: 10000,
        stepSize: 1000,
      },
      label: { interval: 2 },
    },
  });

  return el;
};

export const theme = () => {
  const { el } = createChart(budgetData2, {
    series: {
      showDot: true,
      showArea: true,
      selectable: true,
    },
    theme: {
      series: {
        colors: ['#264653', '#2A9D8F', '#E9C46A', '#F4A261', '#E76F51'],
        lineWidth: 5,
        dashSegments: [10],
        areaOpacity: 0.5,
        dot: {
          radius: 5,
        },
        hover: {
          dot: {
            radius: 6,
            borderWidth: 2,
            borderColor: '#000000',
          },
        },
        select: {
          dot: {
            radius: 6,
            borderWidth: 2,
            borderColor: '#000000',
          },
          restSeries: {
            areaOpacity: 0.01,
          },
          areaOpacity: 1,
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
