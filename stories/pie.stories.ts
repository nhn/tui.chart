import PieChart from '@src/charts/pieChart';
import { deepMergedCopy } from '@src/helpers/utils';
import { PieSeriesData, PieChartOptions } from '@t/options';
import { browserUsageData } from './data';

export default {
  title: 'chart|Pie',
};

const width = 660;
const height = 560;
const defaultOptions = {
  chart: {
    width,
    height,
    title: 'Usage share of web browsers',
  },
};

function createChart(data: PieSeriesData, customOptions?: PieChartOptions) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions || {});

  el.style.outline = '1px solid red';
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;

  const chart = new PieChart({ el, data, options });

  return { el, chart };
}

export const basic = () => {
  const { el } = createChart(browserUsageData as PieSeriesData);

  return el;
};

export const dataLabels = () => {
  const { el } = createChart(browserUsageData as PieSeriesData, {
    series: {
      dataLabels: {
        visible: true,
      },
    },
  });

  return el;
};

export const withSeriesName = () => {
  const { el } = createChart(browserUsageData as PieSeriesData, {
    series: {
      dataLabels: {
        visible: true,
        pieSeriesName: {
          visible: true,
        },
      },
    },
  });

  return el;
};

export const withOuterSeriesName = () => {
  const { el } = createChart(browserUsageData as PieSeriesData, {
    series: {
      dataLabels: {
        visible: true,
        style: {
          color: '#ffffff',
        },
        pieSeriesName: {
          visible: true,
          anchor: 'outer',
        },
      },
    },
  });

  return el;
};
