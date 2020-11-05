import { NestedPieChartOptions, NestedPieSeriesData } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { browserUsageData2, groupedBrowserUsageData } from './data';
import NestedPieChart from '@src/charts/nestedPieChart';
import { NestedPieChartThemeOptions } from '@t/theme';

export default {
  title: 'chart|NestedPie',
};

function createChart(
  data: NestedPieSeriesData,
  customOptions: NestedPieChartOptions = {},
  responsive = false
) {
  const el = document.createElement('div');
  const options = responsive
    ? customOptions
    : deepMergedCopy(
        {
          chart: {
            width: 660,
            height: 560,
            title: 'Usage share of web browsers',
          },
        },
        customOptions || {}
      );

  el.style.outline = '1px solid red';
  el.style.width = responsive ? '90vw' : `${options.chart?.width}px`;
  el.style.height = responsive ? '90vh' : `${options.chart?.height}px`;

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

export const theme = () => {
  const themeOptions: NestedPieChartThemeOptions = {
    series: {
      lineWidth: 2,
      strokeStyle: '#cccccc',
      browsers: {
        colors: ['#eef4c4', '#77543f', '#b7c72e', '#5b9aa0', '#30076f', '#622569'],
      },
      versions: {
        colors: [
          '#cddbda',
          '#efd1d1',
          '#ea005e',
          '#fece2f',
          '#fc6104',
          '#dd2429',
          '#ebc7ff',
          '#fece2f',
          '#dd2429',
          '#ff8d3a',
          '#fc6104',
          '#5ac18e',
          '#8570ff',
        ],
      },
    },
  };

  const { el } = createChart(browserUsageData2, {
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
    },
    theme: themeOptions,
  } as NestedPieChartOptions);

  return el;
};

export const groupedTheme = () => {
  const themeOptions: NestedPieChartThemeOptions = {
    series: {
      colors: ['#eef4c4', '#77543f', '#b7c72e', '#5b9aa0', '#30076f', '#622569', '#f75294'],
      lineWidth: 2,
      strokeStyle: '#cccccc',
      browsers: {
        hover: { colors: ['#6D9B46'] },
      },
      versions: {
        hover: { colors: ['#3A9278'] },
      },
    },
  };

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
    },
    theme: themeOptions,
  } as NestedPieChartOptions);

  return el;
};
