import AreaChart from '@src/charts/areaChart';
import { AreaChartOptions, AreaSeriesData, BaseChartOptions } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { avgTemperatureData } from './data';
import { withKnobs, boolean } from '@storybook/addon-knobs';

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

export const axisTitle = () => {
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
      },
      yAxis: [
        {
          title: {
            fontFamily: 'Impact',
            fontSize: 15,
            fontWeight: 400,
            color: '#03C03C',
          },
        },
        {
          title: {
            fontFamily: 'Comic Sans MS',
            fontSize: 13,
            fontWeight: 600,
            color: '#00a9ff',
          },
        },
      ],
    },
  });

  return el;
};
