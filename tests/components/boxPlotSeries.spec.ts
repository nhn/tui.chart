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
          type: 'rect',
          color: 'rgba(170, 170, 170, 1)',
          name: 'han',
          x: 15,
          y: 60,
          width: 27.5,
          height: 20,
        },
        {
          type: 'line',
          lineWidth: 1,
          strokeStyle: 'rgba(170, 170, 170, 1)',
          x: 28.75,
          y: 90,
          x2: 28.75,
          y2: 50,
          name: 'han',
        },
        {
          type: 'line',
          lineWidth: 1,
          strokeStyle: 'rgba(170, 170, 170, 1)',
          x: 21.875,
          y: 50,
          x2: 35.625,
          y2: 50,
          name: 'han',
        },
        {
          type: 'line',
          lineWidth: 1,
          strokeStyle: 'rgba(170, 170, 170, 1)',
          x: 21.875,
          y: 90,
          x2: 35.625,
          y2: 90,
          name: 'han',
        },
        {
          type: 'line',
          lineWidth: 1,
          strokeStyle: '#ffffff',
          x: 15,
          y: 70,
          x2: 42.5,
          y2: 70,
          name: 'han',
        },
        {
          type: 'circle',
          color: '#ffffff',
          name: 'han',
          x: 28.75,
          y: 0,
          radius: 4,
          style: [{ strokeStyle: 'rgba(170, 170, 170, 1)', lineWidth: 2 }],
          index: 0,
        },
        {
          type: 'rect',
          color: 'rgba(187, 187, 187, 1)',
          name: 'cho',
          x: 57.5,
          y: 20,
          width: 27.5,
          height: 40,
        },
        {
          type: 'line',
          lineWidth: 1,
          strokeStyle: 'rgba(187, 187, 187, 1)',
          x: 71.25,
          y: 80,
          x2: 71.25,
          y2: 0,
          name: 'cho',
        },
        {
          type: 'line',
          lineWidth: 1,
          strokeStyle: 'rgba(187, 187, 187, 1)',
          x: 64.375,
          y: 0,
          x2: 78.125,
          y2: 0,
          name: 'cho',
        },
        {
          type: 'line',
          lineWidth: 1,
          strokeStyle: 'rgba(187, 187, 187, 1)',
          x: 64.375,
          y: 80,
          x2: 78.125,
          y2: 80,
          name: 'cho',
        },
        {
          type: 'line',
          lineWidth: 1,
          strokeStyle: '#ffffff',
          x: 57.5,
          y: 40,
          x2: 85,
          y2: 40,
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
          x: 15,
          y: 60,
          width: 27.5,
          height: 20,
          style: ['shadow'],
          thickness: 4,
        },
        median: { x: 15, y: 70, x2: 42.5, y2: 70, detectionSize: 3 },
        whisker: { x: 28.75, y: 90, x2: 28.75, y2: 50, detectionSize: 3 },
        minimum: { x: 21.875, y: 90, x2: 35.625, y2: 90, detectionSize: 3 },
        maximum: { x: 21.875, y: 50, x2: 35.625, y2: 50, detectionSize: 3 },
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
        style: [{ strokeStyle: 'rgba(170, 170, 170, 1)', lineWidth: 2 }],
        color: 'rgba(170, 170, 170, 1)',
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
          x: 57.5,
          y: 20,
          width: 27.5,
          height: 40,
          style: ['shadow'],
          thickness: 4,
        },
        median: { x: 57.5, y: 40, x2: 85, y2: 40, detectionSize: 3 },
        whisker: { x: 71.25, y: 80, x2: 71.25, y2: 0, detectionSize: 3 },
        minimum: { x: 64.375, y: 80, x2: 78.125, y2: 80, detectionSize: 3 },
        maximum: { x: 64.375, y: 0, x2: 78.125, y2: 0, detectionSize: 3 },
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
