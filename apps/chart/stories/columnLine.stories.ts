import ColumnLineChart from '@src/charts/columnLineChart';
import { ColumnLineChartOptions, ColumnLineData } from '@t/options';
import { deepMergedCopy, range } from '@src/helpers/utils';
import { temperatureAverageData } from './data';
import '@src/css/chart.css';
import { createResponsiveChart } from './util';

export default {
  title: 'chart/ColumnLine',
};

const defaultOptions: ColumnLineChartOptions = {
  chart: {
    width: 1000,
    height: 500,
    title: '24-hr Average Temperature',
  },
  yAxis: { title: 'Temperature (Celsius)' },
  xAxis: { title: 'Month' },
};

function createChart(data: ColumnLineData, customOptions: ColumnLineChartOptions = {}) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions);

  el.style.width = `${options.chart?.width}px`;
  el.style.height = `${options.chart?.height}px`;

  const chart = new ColumnLineChart({
    el,
    data,
    options,
  });

  return { el, chart };
}
export const basic = () => {
  const { el } = createChart(temperatureAverageData);

  return el;
};

export const liveUpdate = () => {
  const data = {
    categories: ['1', '2', '3', '4', '5'],
    series: {
      column: [
        {
          name: 'A',
          data: [10, 17, 22, 10, 40],
        },
        {
          name: 'B',
          data: [9.9, 16.0, 21.2, 24.2, 23.2],
        },
        {
          name: 'C',
          data: [18.3, 15.2, 12.8, 11.8, 13.0],
        },
        {
          name: 'D',
          data: [4.4, 12.2, 16.3, 18.5, 16.7],
        },
      ],
      line: [
        {
          name: 'E',
          data: [11, 40.1, 24.8, 30.7, 19.5],
        },
      ],
    },
  };

  const { el, chart } = createChart(data, {
    series: {
      shift: true,
    },
  });

  let idx = 6;
  const intervalId = setInterval(() => {
    const randomData = range(0, 4).map(() => Math.round(Math.random() * 100));
    chart.addData(randomData, idx.toString(), 'column');
    chart.addData([randomData[0]], idx.toString(), 'line');
    if (idx === 20) {
      clearInterval(intervalId);
    }
    idx += 1;
  }, 2500);

  return el;
};

export const selectableGrouped = () => {
  const { el } = createChart(temperatureAverageData, {
    series: {
      selectable: true,
    },
  });

  return el;
};

export const selectablePoint = () => {
  const { el } = createChart(temperatureAverageData, {
    series: {
      selectable: true,
      eventDetectType: 'point',
    },
  });

  return el;
};

export const dataLabels = () => {
  const { el } = createChart(temperatureAverageData, {
    series: {
      column: {
        dataLabels: {
          visible: false,
        },
      },
      line: {
        dataLabels: {
          visible: true,
        },
      },
    },
  });

  return el;
};

export const secondaryYAxis = () => {
  const { el } = createChart(temperatureAverageData, {
    yAxis: [
      {
        title: 'Temperature (Celsius)',
        chartType: 'column',
      },
      {
        title: 'Average',
        chartType: 'line',
      },
    ],
  });

  return el;
};
export const responsive = () => {
  return createResponsiveChart<ColumnLineData, ColumnLineChartOptions>(
    ColumnLineChart,
    temperatureAverageData,
    {
      chart: {
        title: '24-hr Average Temperature',
        width: 'auto',
        height: 'auto',
      },
      yAxis: [{ title: 'Temperature (Celsius)' }, { title: 'Average' }],
      xAxis: { title: 'Month' },
    }
  );
};

export const theme = () => {
  const { el } = createChart(temperatureAverageData, {
    series: {
      line: {
        showDot: true,
      },
      selectable: true,
    },
    theme: {
      series: {
        colors: ['#70d6ff', '#ff70a6', '#ff9770', '#ffd670', '#bfe000'],
        column: {
          barWidth: 18,
          hover: {
            color: '#00ff00',
            groupedRect: {
              color: '#F0DCBC',
              opacity: 0.5,
            },
          },
          select: {
            color: '#0000ff',
            borderColor: '#000000',
            borderWidth: 3,
            shadowColor: 'rgba(0, 0, 0, 0.7)',
            shadowOffsetX: 4,
            shadowOffsetY: 4,
            shadowBlur: 6,
            groupedRect: {
              color: '#74521A',
              opacity: 0.2,
            },
            restSeries: {
              areaOpacity: 0.5,
            },
            areaOpacity: 0.8,
          },
        },
        line: {
          select: {
            dot: {
              color: '#ff416d',
              radius: 6,
              borderColor: '#00b5a1',
              borderWidth: 2,
            },
          },
          hover: {
            dot: {
              color: '#00ffff',
              radius: 6,
              borderColor: '#0859c6',
              borderWidth: 2,
            },
          },
          dot: {
            radius: 6,
            borderColor: '#ffff00',
            borderWidth: 2,
          },
        },
      },
    },
  });

  return el;
};

export const noData = () => {
  const data = {
    categories: [],
    series: {
      line: [],
      column: [],
    },
  };
  const { el } = createChart(data);

  return el;
};
