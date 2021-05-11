import LineChart from '@src/charts/lineChart';
import { DefaultTooltipTemplate, LineSeriesData, SeriesDataType } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { temperatureData } from './data';
import { number, withKnobs } from '@storybook/addon-knobs';
import { TooltipModel } from '@t/components/tooltip';
import '@src/css/chart.css';

export default {
  title: 'chart/Tooltip',
  decorators: [withKnobs],
};

const width = 1000;
const height = 500;
const defaultOptions = {
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

function createChart(data: LineSeriesData, customOptions?: Record<string, any>) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions || {});

  el.style.width = `${width}px`;
  el.style.height = `${height}px`;

  const chart = new LineChart({ el, data, options });

  return { el, chart };
}

export const customTooltip = () => {
  const { el } = createChart(temperatureData, {
    tooltip: {
      template: (model: TooltipModel, { body }: DefaultTooltipTemplate) => {
        return `
          <div style="display: flex; flex-direction: column; background: black; color: #fff;">
            <p style="padding: 5px; margin: 0; border-bottom: 1px solid #ddd;font-size: 13px; text-align: center">🎊 ${model.category} 🎊</p>
            ${body}
          </div>`;
      },
    },
  });

  return el;
};

export const offset = () => {
  const { el } = createChart(temperatureData, {
    tooltip: {
      offsetX: number('offsetX', 35, {
        range: true,
        min: 0,
        max: 50,
        step: 5,
      }),
      offsetY: number('offsetY', 35, {
        range: true,
        min: 0,
        max: 50,
        step: 5,
      }),
    },
  });

  return el;
};

function getTempIcon(value) {
  const temp = Number(value);
  let icon = '☀️';
  if (temp < 0) {
    icon = '❄️';
  } else if (temp > 25) {
    icon = '🔥';
  }

  return icon;
}

export const formatter = () => {
  const { el } = createChart(temperatureData, {
    tooltip: {
      formatter: (value: SeriesDataType) => `${getTempIcon(value)} ${value} ℃`,
    },
  });

  return el;
};

export const transition = () => {
  const { el } = createChart(temperatureData, {
    tooltip: {
      transition: 'transform 1s ease-in',
    },
  });

  return el;
};
