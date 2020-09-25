import { NestedPieChartOptions, NestedPieSeriesData } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { browserUsageData2, groupedBrowserUsageData } from './data';
import NestedPieChart from '@src/charts/nestedPieChart';

export default {
  title: 'chart|NestedPie',
};

function createChart(
  data: NestedPieSeriesData,
  customOptions?: NestedPieChartOptions,
  reactive = false
) {
  const el = document.createElement('div');
  const options = deepMergedCopy(
    {
      chart: {
        width: 660,
        height: 560,
        title: 'Usage share of web browsers',
      },
      legend: {
        visible: false,
      },
    },
    customOptions || {}
  );
  const { width, height } = options.chart;

  el.style.outline = '1px solid red';
  el.style.width = reactive ? '90vw' : `${width}px`;
  el.style.height = reactive ? '90vw' : `${height}px`;

  const chart = new NestedPieChart({ el, data, options });

  return { el, chart };
}

export const basic = () => {
  const { el } = createChart(browserUsageData2, {
    series: {
      browsers: {
        radiusRange: {
          inner: '20%',
          outer: '50%',
        },
      },
      versions: {
        radiusRange: {
          inner: '55%',
          outer: '85%',
        },
      },
    },
    legend: { visible: true },
  });

  return el;
};

export const grouped = () => {
  const { el } = createChart(groupedBrowserUsageData, {
    series: {
      browsers: {
        radiusRange: {
          inner: '20%',
          outer: '50%',
        },
      },
      versions: {
        radiusRange: {
          inner: '55%',
          outer: '85%',
        },
      },
    },
    legend: { visible: true },
  } as NestedPieChartOptions);

  return el;
};

export const dataLabels = () => {
  const { el } = createChart(groupedBrowserUsageData, {
    series: {
      browsers: {
        radiusRange: {
          inner: '20%',
          outer: '50%',
        },
        dataLabels: {
          visible: true,
          pieSeriesName: {
            visible: false,
          },
        },
      },
      versions: {
        radiusRange: {
          inner: '55%',
          outer: '85%',
        },
        dataLabels: {
          visible: true,
          pieSeriesName: {
            visible: true,
            anchor: 'outer',
          },
        },
      },
    },
    legend: { visible: true },
  });

  return el;
};

export const selectable = () => {
  const { el } = createChart(groupedBrowserUsageData, {
    series: {
      browsers: {
        radiusRange: {
          inner: '30%',
          outer: '60%',
        },
      },
      versions: {
        radiusRange: {
          inner: '70%',
          outer: '100%',
        },
      },
      selectable: true,
    },
  } as NestedPieChartOptions);

  return el;
};

export const responsive = () => {
  const { el } = createChart(
    groupedBrowserUsageData,
    {
      chart: {
        title: 'Usage share of web browsers',
      },
    },
    true
  );

  return el;
};
