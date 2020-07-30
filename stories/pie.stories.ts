import PieChart from '@src/charts/pieChart';
import { deepMergedCopy } from '@src/helpers/utils';
import { PieSeriesData, PieChartOptions } from '@t/options';
import { browserUsageData } from './data';

export default {
  title: 'chart|Pie',
};

function createChart(data: PieSeriesData, customOptions?: PieChartOptions) {
  const el = document.createElement('div');
  const options = deepMergedCopy(
    {
      chart: {
        width: 660,
        height: 560,
        title: 'Usage share of web browsers',
      },
    },
    customOptions || {}
  );
  const { width, height } = options.chart;

  el.style.outline = '1px solid red';
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;

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
      visible: false,
    },
  });

  return el;
};

export const antiClockwise = () => {
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
  });

  return el;
};

export const donut = () => {
  const { el } = createChart(browserUsageData, {
    series: {
      radiusRange: [40, 100],
    },
  });

  return el;
};

export const donutWithDataLabels = () => {
  const { el } = createChart(browserUsageData, {
    series: {
      radiusRange: [40, 100],
      dataLabels: {
        visible: true,
        style: {
          color: '#ffffff',
        },
      },
    },
  });

  return el;
};

export const donutWithCenterSeriesName = () => {
  const { el } = createChart(browserUsageData, {
    series: {
      radiusRange: [40, 100],
      dataLabels: {
        visible: true,
        style: {
          color: '#ffffff',
        },
        pieSeriesName: {
          visible: true,
          style: {
            color: '#ffffff',
          },
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
      radiusRange: [40, 100],
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
      radiusRange: [40, 100],
      startAngle: -90,
      endAngle: 90,
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
