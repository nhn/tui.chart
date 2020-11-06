import PieChart from '@src/charts/pieChart';
import { deepMergedCopy } from '@src/helpers/utils';
import { PieSeriesData, PieChartOptions } from '@t/options';
import { browserUsageData } from './data';
import { withKnobs, number } from '@storybook/addon-knobs';
import { PieChartThemeOptions } from '@t/theme';

export default {
  title: 'chart|Pie',
  decorators: [withKnobs],
};

function createChart(data: PieSeriesData, customOptions: PieChartOptions = {}, responsive = false) {
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

  const chart = new PieChart({ el, data, options });

  return { el, chart };
}

export const basic = () => {
  const { el } = createChart(browserUsageData);

  return el;
};

export const dataLabels = () => {
  const { el } = createChart(browserUsageData, {
    series: {
      dataLabels: {
        visible: true,
      },
    },
  });

  return el;
};

export const withCenterSeriesName = () => {
  const { el } = createChart(browserUsageData, {
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
  const { el } = createChart(browserUsageData, {
    series: {
      dataLabels: {
        visible: true,
        pieSeriesName: {
          visible: true,
          anchor: 'outer',
        },
      },
    },
    legend: {
      visible: false,
    },
  });

  return el;
};

export const counterClockwise = () => {
  const { el } = createChart(browserUsageData, {
    series: {
      clockwise: false,
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
    legend: {
      visible: true,
    },
  });

  return el;
};

export const useRadiusRangeWithPixel = () => {
  const inner = number('radiusRange.inner', 50, {
    range: true,
    min: 0,
    max: 180,
    step: 10,
  });

  const outer = number('radiusRange.outer', 150, {
    range: true,
    min: 100,
    max: 200,
    step: 50,
  });

  const { el } = createChart(browserUsageData, {
    series: {
      radiusRange: {
        inner,
        outer,
      },
    },
  });

  return el;
};

export const donut = () => {
  const { el } = createChart(browserUsageData, {
    series: {
      radiusRange: {
        inner: '40%',
        outer: '100%',
      },
    },
  });

  return el;
};

export const donutWithDataLabels = () => {
  const { el } = createChart(browserUsageData, {
    series: {
      radiusRange: {
        inner: '40%',
        outer: '100%',
      },
      dataLabels: {
        visible: true,
      },
    },
  });

  return el;
};

export const donutWithOuterDataLabels = () => {
  const { el } = createChart(browserUsageData, {
    series: {
      clockwise: false,
      radiusRange: {
        inner: '40%',
        outer: '90%',
      },
      dataLabels: {
        visible: true,
        anchor: 'outer',
        pieSeriesName: {
          visible: true,
          anchor: 'outer',
        },
      },
    },
    legend: {
      visible: false,
    },
  });

  return el;
};

export const donutWithCenterSeriesName = () => {
  const { el } = createChart(browserUsageData, {
    series: {
      radiusRange: {
        inner: '40%',
        outer: '100%',
      },
      dataLabels: {
        visible: true,
        pieSeriesName: {
          visible: true,
        },
      },
    },
    legend: {
      visible: false,
    },
  });

  return el;
};

export const donutWithOuterSeriesName = () => {
  const { el } = createChart(browserUsageData, {
    series: {
      radiusRange: {
        inner: '40%',
        outer: '90%',
      },
      dataLabels: {
        visible: true,
        pieSeriesName: {
          visible: true,
          anchor: 'outer',
        },
      },
    },
    legend: {
      visible: false,
    },
  });

  return el;
};

export const semicircle = () => {
  const { el } = createChart(browserUsageData, {
    chart: {
      width: 660,
      height: 350,
      title: 'Usage share of web browsers',
    },
    series: {
      radiusRange: {
        inner: '40%',
        outer: '100%',
      },
      angleRange: {
        start: -90,
        end: 90,
      },
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
    legend: {
      align: 'bottom',
      visible: true,
    },
  });

  return el;
};

export const selectable = () => {
  const { el } = createChart(browserUsageData, {
    series: {
      selectable: true,
    },
  });

  return el;
};

export const responsive = () => {
  const { el } = createChart(
    browserUsageData,
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
  const themeOptions: PieChartThemeOptions = {
    series: {
      colors: [
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
      ],
    },
  };

  const { el } = createChart(browserUsageData, {
    theme: themeOptions,
  });

  return el;
};
