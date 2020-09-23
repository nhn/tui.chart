import { PieDonutChartOptions, PieDonutSeriesData } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { browserUsageData2, groupedBrowserUsageData } from './data';
import PieDonutChart from '@src/charts/pieDonutChart';

export default {
  title: 'chart|PieDonut',
};

function createChart(data: PieDonutSeriesData, customOptions?: PieDonutChartOptions) {
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
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;

  const chart = new PieDonutChart({ el, data, options });

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
  } as PieDonutChartOptions);

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
      selectable: true,
    },
  } as PieDonutChartOptions);

  return el;
};
