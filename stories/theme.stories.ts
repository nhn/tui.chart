import AreaChart from '@src/charts/areaChart';
import { AreaChartOptions, AreaSeriesData, BaseChartOptions } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { avgTemperatureData } from './data';
import { withKnobs, boolean, radios } from '@storybook/addon-knobs';
import '@src/css/chart.css';

export default {
  title: 'chart|common component theme',
  decorators: [withKnobs],
};

const width = 1000;
const height = 500;
const defaultOptions = {
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

function createChart(
  data: AreaSeriesData,
  customOptions: AreaChartOptions = {},
  responsive = false
) {
  const el = document.createElement('div');
  const options = responsive ? customOptions : deepMergedCopy(defaultOptions, customOptions);

  el.style.outline = '1px solid red';
  el.style.width = responsive ? '90vw' : `${options.chart?.width}px`;
  el.style.height = responsive ? '90vh' : `${options.chart?.height}px`;

  const chart = new AreaChart({ el, data, options });

  return { el, chart };
}

export const title = () => {
  const { el } = createChart(avgTemperatureData, {
    chart: { title: 'Average Temperature' } as BaseChartOptions,
    xAxis: { pointOnColumn: boolean('pointOnColumn', false), title: { text: 'Month' } },
    yAxis: { title: 'Temperature (Celsius)' },
    theme: {
      title: {
        fontFamily: 'Comic Sans MS',
        fontSize: 45,
        fontWeight: 100,
        color: '#ff416d',
      },
    },
  });

  return el;
};

export const axis = () => {
  const { el } = createChart(avgTemperatureData, {
    chart: { title: 'Average Temperature' },
    xAxis: { title: { text: 'Month' } },
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
    theme: {
      xAxis: {
        title: {
          fontFamily: 'Impact',
          fontSize: 15,
          fontWeight: 400,
          color: '#ff416d',
        },
        label: {
          fontFamily: 'fantasy',
          fontSize: 11,
          fontWeight: 700,
          color: '#6EB5FF',
        },
        width: 2,
        color: '#6655EE',
      },
      yAxis: [
        {
          title: {
            fontFamily: 'Impact',
            fontSize: 17,
            fontWeight: 400,
            color: '#03C03C',
          },
          label: {
            fontFamily: 'cursive',
            fontSize: 11,
            fontWeight: 700,
            color: '#6655EE',
          },
          width: 3,
          color: '#88ddEE',
        },
        {
          title: {
            fontFamily: 'Comic Sans MS',
            fontSize: 13,
            fontWeight: 600,
            color: '#00a9ff',
          },
          label: {
            fontFamily: 'cursive',
            fontSize: 11,
            fontWeight: 700,
            color: '#FFABAB',
          },
          width: 3,
          color: '#AFFCCA',
        },
      ],
    },
  });

  return el;
};

export const legend = () => {
  const { el } = createChart(avgTemperatureData, {
    chart: { title: 'Average Temperature' } as BaseChartOptions,
    xAxis: { title: { text: 'Month' } },
    yAxis: { title: 'Temperature (Celsius)' },
    legend: {
      align: radios('align', { top: 'top', bottom: 'bottom', left: 'left', right: 'right' }, 'top'),
    },
    theme: {
      legend: {
        label: {
          fontFamily: 'cursive',
          fontSize: 15,
          fontWeight: 700,
          color: '#ff416d',
        },
      },
    },
  });

  return el;
};

export const tooltip = () => {
  const { el } = createChart(avgTemperatureData, {
    chart: { title: 'Average Temperature' },
    xAxis: { title: { text: 'Month' } },
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
    theme: {
      tooltip: {
        background: '#80CEE1',
        borderColor: '#3065AC',
        borderWidth: 10,
        borderRadius: 20,
        borderStyle: 'double',
        header: {
          fontSize: 15,
          fontWeight: 700,
          color: '#333333',
          fontFamily: 'monospace',
        },
        body: {
          fontSize: 11,
          fontWeight: 700,
          color: '#a66033',
          fontFamily: 'monospace',
        },
      },
    },
  });

  return el;
};

export const plot = () => {
  const { el } = createChart(avgTemperatureData, {
    theme: {
      plot: {
        vertical: {
          lineColor: 'rgba(60, 80, 180, 0.3)',
        },
        horizontal: {
          lineColor: 'rgba(0, 0, 0, 0)',
        },
        backgroundColor: 'rgba(60, 80, 180, 0.1)',
      },
    },
  });

  return el;
};

export const exportMenu = () => {
  const { el } = createChart(avgTemperatureData, {
    theme: {
      exportMenu: {
        backgroundColor: '#ff0000',
        borderRadius: 5,
        borderWidth: 2,
        borderColor: '#000000',
        color: '#ffffff',
        xLineWidth: 4,
      },
    },
  });

  return el;
};
