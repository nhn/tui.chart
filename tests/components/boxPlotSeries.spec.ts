import BoxPlotSeries from '@src/component/boxPlotSeries';
import Store from '@src/store/store';
import EventEmitter from '@src/eventEmitter';
import { Options } from '@t/store/store';

let boxPlotSeries;

const seriesData = [
  {
    name: 'han',
    data: [[1, 2, 3, 4, 5]],
    outliers: [[0, 10]],
    color: '#aaaaaa',
  },
  {
    name: 'cho',
    data: [[2, 4, 6, 8, 10]],
    outliers: [],
    color: '#bbbbbb',
  },
];

const chartState = {
  chart: { width: 120, height: 120 },
  layout: {
    xAxis: { x: 10, y: 80, width: 80, height: 10 },
    yAxis: { x: 10, y: 10, width: 10, height: 80 },
    plot: { width: 100, height: 100, x: 10, y: 10 },
  },
  scale: { yAxis: { limit: { min: 0, max: 10 }, stepSize: 1, stepCount: 1 } },
  series: {
    boxPlot: {
      data: seriesData,
    },
  },
  axes: {
    xAxis: {
      pointOnColumn: true,
      tickDistance: 100,
    },
  },
  categories: ['A'],
  options: {},
  legend: {
    data: [
      { label: 'han', active: true, checked: true },
      { label: 'cho', active: true, checked: true },
    ],
  },
  theme: {
    series: {
      boxPlot: {
        areaOpacity: 1,
        barWidthRatios: {
          barRatio: 1,
          minMaxBarRatio: 0.5,
        },
        markerLineWidth: 1,
        dot: {
          color: '#ffffff',
          radius: 4,
          borderWidth: 2,
          useSeriesColor: false,
        },
        rect: { borderWidth: 0 },
        line: {
          whisker: { lineWidth: 1 },
          maximum: { lineWidth: 1 },
          minimum: { lineWidth: 1 },
          median: { lineWidth: 1, color: '#ffffff' },
        },
        hover: {
          shadowColor: 'rgba(0, 0, 0, 0.3)',
          shadowOffsetX: 2,
          shadowOffsetY: 2,
          shadowBlur: 6,
          rect: { borderWidth: 4, borderColor: '#ffffff' },
          dot: {
            radius: 4,
            borderWidth: 0,
            useSeriesColor: true,
          },
          line: {
            whisker: { lineWidth: 1 },
            maximum: { lineWidth: 1 },
            minimum: { lineWidth: 1 },
            median: { lineWidth: 1, color: '#ffffff' },
          },
        },
        select: {
          shadowColor: 'rgba(0, 0, 0, 0.3)',
          shadowOffsetX: 2,
          shadowOffsetY: 2,
          shadowBlur: 6,
          rect: { borderWidth: 4, borderColor: '#ffffff' },
          dot: {
            radius: 4,
            borderWidth: 2,
            useSeriesColor: true,
          },
          line: {
            whisker: { lineWidth: 1 },
            maximum: { lineWidth: 1 },
            minimum: { lineWidth: 1 },
            median: { lineWidth: 1, color: '#ffffff' },
          },
          restSeries: {
            areaOpacity: 0.2,
          },
          areaOpacity: 1,
        },
      },
    },
  },
};

describe('boxplot series', () => {
  beforeEach(() => {
    boxPlotSeries = new BoxPlotSeries({
      store: {} as Store<Options>,
      eventBus: new EventEmitter(),
    });

    boxPlotSeries.render(chartState);
  });

  const result = {
    models: {
      series: [
        {
          lineWidth: 1,
          name: 'han',
          strokeStyle: 'rgba(170, 170, 170, 1)',
          type: 'line',
          x: 21.5,
          y: 50.5,
          x2: 35.5,
          y2: 50.5,
        },
        {
          lineWidth: 1,
          name: 'han',
          strokeStyle: 'rgba(170, 170, 170, 1)',
          type: 'line',
          x: 21.5,
          y: 90.5,
          x2: 35.5,
          y2: 90.5,
        },
        {
          type: 'rect',
          color: 'rgba(170, 170, 170, 1)',
          name: 'han',
          x: 15,
          y: 60,
          width: 27.5,
          height: 20,
          thickness: 0,
        },
        {
          lineWidth: 1,
          name: 'han',
          strokeStyle: '#ffffff',
          type: 'line',
          x: 15.5,
          y: 70.5,
          x2: 42.5,
          y2: 70.5,
        },
        {
          type: 'line',
          lineWidth: 1,
          strokeStyle: 'rgba(170, 170, 170, 1)',
          x: 28.5,
          y: 50.5,
          x2: 28.5,
          y2: 60,
          name: 'han',
        },
        {
          type: 'line',
          lineWidth: 1,
          strokeStyle: 'rgba(170, 170, 170, 1)',
          x: 28.5,
          y: 90.5,
          x2: 28.5,
          y2: 80.5,
          name: 'han',
        },
        {
          type: 'circle',
          color: '#ffffff',
          name: 'han',
          x: 28.75,
          y: 0,
          radius: 4,
          style: [{ lineWidth: 2, strokeStyle: 'rgba(170, 170, 170, 1)' }],
          index: 0,
        },
        {
          lineWidth: 1,
          name: 'cho',
          strokeStyle: 'rgba(187, 187, 187, 1)',
          type: 'line',
          x: 64.5,
          y: 0.5,
          x2: 78.5,
          y2: 0.5,
        },
        {
          lineWidth: 1,
          name: 'cho',
          strokeStyle: 'rgba(187, 187, 187, 1)',
          type: 'line',
          x: 64.5,
          y: 80.5,
          x2: 78.5,
          y2: 80.5,
        },
        {
          type: 'rect',
          color: 'rgba(187, 187, 187, 1)',
          name: 'cho',
          x: 57.5,
          y: 20,
          width: 27.5,
          height: 40,
          thickness: 0,
        },
        {
          type: 'line',
          lineWidth: 1,
          strokeStyle: '#ffffff',
          x: 57.5,
          y: 40.5,
          x2: 85.5,
          y2: 40.5,
          name: 'cho',
        },
        {
          type: 'line',
          lineWidth: 1,
          strokeStyle: 'rgba(187, 187, 187, 1)',
          x: 71.5,
          y: 0.5,
          x2: 71.5,
          y2: 20,
          name: 'cho',
        },
        {
          type: 'line',
          lineWidth: 1,
          strokeStyle: 'rgba(187, 187, 187, 1)',
          x: 71.5,
          y: 80.5,
          x2: 71.5,
          y2: 60.5,
          name: 'cho',
        },
      ],
    },
    responders: [
      {
        type: 'boxPlot',
        color: 'rgba(170, 170, 170, 1)',
        name: 'han',
        x: 15,
        y: 60,
        rect: {
          type: 'rect',
          x: 15,
          y: 60,
          width: 27.5,
          height: 20,
          thickness: 0,
          color: 'rgba(170, 170, 170, 1)',
        },
        median: {
          type: 'line',
          x: 15.5,
          y: 70.5,
          x2: 42.5,
          y2: 70.5,
          detectionSize: 3,
          lineWidth: 1,
          strokeStyle: '#ffffff',
        },
        lowerWhisker: {
          type: 'line',
          x: 28.5,
          y: 90.5,
          x2: 28.5,
          y2: 80.5,
          detectionSize: 3,
          lineWidth: 1,
          strokeStyle: 'rgba(170, 170, 170, 1)',
        },
        upperWhisker: {
          type: 'line',
          x: 28.5,
          y: 50.5,
          x2: 28.5,
          y2: 60,
          detectionSize: 3,
          lineWidth: 1,
          strokeStyle: 'rgba(170, 170, 170, 1)',
        },
        minimum: {
          type: 'line',
          x: 21.5,
          y: 90.5,
          x2: 35.5,
          y2: 90.5,
          detectionSize: 3,
          lineWidth: 1,
          strokeStyle: 'rgba(170, 170, 170, 1)',
        },
        maximum: {
          type: 'line',
          x: 21.5,
          y: 50.5,
          x2: 35.5,
          y2: 50.5,
          detectionSize: 3,
          lineWidth: 1,
          strokeStyle: 'rgba(170, 170, 170, 1)',
        },
        data: {
          label: 'han',
          color: '#aaaaaa',
          value: [
            {
              title: 'Maximum',
              value: 5,
            },
            {
              title: 'Upper Quartile',
              value: 4,
            },
            {
              title: 'Median',
              value: 3,
            },
            {
              title: 'Lower Quartile',
              value: 2,
            },
            {
              title: 'Minimum',
              value: 1,
            },
          ],
          category: 'A',
          templateType: 'boxPlot',
        },
        index: 0,
      },
      {
        type: 'circle',
        name: 'han',
        x: 28.75,
        y: 0,
        radius: 4,
        style: [{ lineWidth: 2, strokeStyle: 'rgba(170, 170, 170, 1)' }],
        color: 'rgba(255, 255, 255, 1)',
        data: {
          label: 'han',
          color: '#aaaaaa',
          value: [{ title: 'Outlier', value: 10 }],
          category: 'A',
          templateType: 'boxPlot',
        },
        index: 0,
      },
      {
        type: 'boxPlot',
        color: 'rgba(187, 187, 187, 1)',
        name: 'cho',
        x: 57.5,
        y: 20,
        rect: {
          type: 'rect',
          x: 57.5,
          y: 20,
          width: 27.5,
          height: 40,
          thickness: 0,
          color: 'rgba(187, 187, 187, 1)',
        },
        median: {
          type: 'line',
          x: 57.5,
          x2: 85.5,
          y: 40.5,
          y2: 40.5,
          detectionSize: 3,
          lineWidth: 1,
          strokeStyle: '#ffffff',
        },
        upperWhisker: {
          type: 'line',
          x: 71.5,
          y: 0.5,
          x2: 71.5,
          y2: 20,
          detectionSize: 3,
          lineWidth: 1,
          strokeStyle: 'rgba(187, 187, 187, 1)',
        },
        lowerWhisker: {
          type: 'line',
          x: 71.5,
          y: 80.5,
          x2: 71.5,
          y2: 60.5,
          detectionSize: 3,
          lineWidth: 1,
          strokeStyle: 'rgba(187, 187, 187, 1)',
        },
        minimum: {
          type: 'line',
          x: 64.5,
          y: 80.5,
          x2: 78.5,
          y2: 80.5,
          detectionSize: 3,
          lineWidth: 1,
          strokeStyle: 'rgba(187, 187, 187, 1)',
        },
        maximum: {
          type: 'line',
          x: 64.5,
          y: 0.5,
          x2: 78.5,
          y2: 0.5,
          detectionSize: 3,
          lineWidth: 1,
          strokeStyle: 'rgba(187, 187, 187, 1)',
        },
        data: {
          label: 'cho',
          color: '#bbbbbb',
          value: [
            {
              title: 'Maximum',
              value: 10,
            },
            {
              title: 'Upper Quartile',
              value: 8,
            },
            {
              title: 'Median',
              value: 6,
            },
            {
              title: 'Lower Quartile',
              value: 4,
            },
            {
              title: 'Minimum',
              value: 2,
            },
          ],
          category: 'A',
          templateType: 'boxPlot',
        },
        index: 0,
      },
    ],
  };

  ['models', 'responders'].forEach((modelName) => {
    it(`should make ${modelName} properly when calling render`, () => {
      expect(boxPlotSeries[modelName]).toEqual(result[modelName]);
    });
  });
});
