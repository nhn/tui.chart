import LineChart from '@src/charts/lineChart';
import { LineSeriesData } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { splineData, basicData } from './data';

export default {
  title: 'Line'
};

function createChart(data: LineSeriesData, customOptions?: Record<string, any>) {
  const el = document.createElement('div');
  const width = 1000;
  const height = 500;

  const options = deepMergedCopy(
    {
      chart: {
        width,
        height
      },
      yAxis: {},
      xAxis: {},
      series: {},
      tooltip: {},
      plot: {
        bands: [
          {
            range: ['03/01/2016', '05/01/2016'],
            color: 'gray',
            opacity: 0.2
          }
        ],
        lines: [
          {
            value: '03/01/2016',
            color: '#fa2828'
          }
        ]
      }
    },
    customOptions || {}
  );

  el.style.outline = '1px solid red';
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;

  const chart = new LineChart({ el, data, options });

  return { el, chart };
}

export const basic = () => {
  const { el } = createChart(basicData, { xAxis: { pointOnColumn: true } });

  return el;
};

export const spline = () => {
  const { el } = createChart(splineData, {
    series: { spline: true },
    xAxis: { pointOnColumn: true }
  });

  return el;
};
