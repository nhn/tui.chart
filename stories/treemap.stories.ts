import { TreeMapSeriesData } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { usedDiskSpaceData } from './data';
import { boolean, withKnobs } from '@storybook/addon-knobs';

export default {
  title: 'chart|treeMap',
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

function createChart(data: TreeMapSeriesData, customOptions?: Record<string, any>) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions || {});

  el.style.outline = '1px solid red';
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;

  // const chart = new LineChart({ el, data, options });

  return { el, chart };
}

export const basic = () => {
  const { el } = createChart(usedDiskSpaceData, {
    xAxis: { pointOnColumn: boolean('pointOnColumn', false) },
  });

  return el;
};
