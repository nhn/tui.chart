import { PieDonutChartOptions, PieDonutSeriesData } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { annualBrowserUsageData, annualGroupedBrowserUsageData } from './data';
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
  const { el } = createChart(annualBrowserUsageData, {
    series: {
      pie1: {
        radiusRange: {
          inner: 0,
          outer: '50%',
        },
      },
      pie3: {
        radiusRange: {
          inner: '80%',
          outer: '100%',
        },
      },
      pie2: {
        radiusRange: {
          inner: '55%',
          outer: '75%',
        },
      },
    },
    legend: { visible: true },
  });

  return el;
};

export const grouped = () => {
  const { el } = createChart(annualGroupedBrowserUsageData, {
    series: {
      grouped: true,
      pie1: {
        radiusRange: {
          inner: 0,
          outer: '50%',
        },
      },
      pie2: {
        radiusRange: {
          inner: '55%',
          outer: '75%',
        },
      },
      pie3: {
        radiusRange: {
          inner: '80%',
          outer: '100%',
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
  } as PieDonutChartOptions);

  return el;
};

export const dataLabels = () => {
  const { el } = createChart(annualBrowserUsageData, {
    series: {
      pie1: {
        radiusRange: {
          inner: 0,
          outer: '50%',
        },
      },
      pie2: {
        radiusRange: {
          inner: '55%',
          outer: '75%',
        },
        dataLabels: {
          visible: true,
          pieSeriesName: {
            visible: false,
          },
        },
      },
      pie3: {
        radiusRange: {
          inner: '80%',
          outer: '100%',
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
  });

  return el;
};

export const selectable = () => {
  const { el } = createChart(annualBrowserUsageData, {
    series: {
      pie1: {
        radiusRange: {
          inner: 0,
          outer: '50%',
        },
      },
      pie2: {
        radiusRange: {
          inner: '55%',
          outer: '75%',
        },
      },
      pie3: {
        radiusRange: {
          inner: '80%',
          outer: '100%',
        },
      },
      selectable: true,
    },
  } as PieDonutChartOptions);

  return el;
};
