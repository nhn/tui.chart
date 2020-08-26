import BulletSeries from '@src/component/bulletSeries';
import Store from '@src/store/store';
import EventEmiiter from '@src/eventEmitter';
import { Options } from '@t/store/store';
import { deepMergedCopy } from '@src/helpers/utils';

let bulletSeries;

const seriesData = [
  {
    name: 'han',
    data: 6,
    markers: [7],
    ranges: [
      [0, 1],
      [1, 4],
      [4, 10],
    ],
    color: '#aaaaaa',
  },
  {
    name: 'cho',
    data: 8,
    markers: [],
    ranges: [
      [0, 2],
      [2, 5],
      [5, 10],
    ],
    color: '#bbbbbb',
  },
];

const chartState = {
  chart: { width: 120, heigh: 120 },
  layout: {
    xAxis: { x: 10, y: 80, width: 80, height: 10 },
    yAxis: { x: 10, y: 10, width: 10, height: 80 },
    plot: { width: 100, height: 100, x: 10, y: 10 },
  },
  scale: {
    xAxis: {
      limit: { min: 0, max: 10 },
      stepSize: 1,
      stepCount: 1,
    },
  },
  series: {
    bullet: {
      data: seriesData,
    },
  },
  axes: {
    yAxis: {
      tickDistance: 50,
    },
    xAxis: {
      zeroPosition: 0,
    },
  },
  options: {},
  legend: {
    data: [
      { label: 'han', active: true, checked: true },
      { label: 'cho', active: true, checked: true },
    ],
  },
  dataLabels: {},
};

describe('bullet series', () => {
  beforeEach(() => {
    bulletSeries = new BulletSeries({
      store: {} as Store<Options>,
      eventBus: new EventEmiiter(),
    });

    bulletSeries.render(chartState);
  });

  const result = {
    models: {
      series: [
        {
          type: 'rect',
          modelType: 'range',
          x: 0,
          y: 10,
          width: 10,
          height: 30,
          color: '#666666',
          name: 'han',
        },
        {
          type: 'rect',
          modelType: 'range',
          x: 10,
          y: 10,
          width: 30,
          height: 30,
          color: '#999999',
          name: 'han',
        },
        {
          type: 'rect',
          modelType: 'range',
          x: 40,
          y: 10,
          width: 60,
          height: 30,
          color: '#bbbbbb',
          name: 'han',
        },
        {
          type: 'rect',
          modelType: 'bullet',
          x: 0,
          y: 17.5,
          width: 60,
          height: 15,
          color: 'rgba(170, 170, 170, 1)',
          value: 6,
          name: 'han',
        },
        {
          type: 'rect',
          modelType: 'marker',
          x: 68,
          y: 13,
          width: 4,
          height: 24,
          color: 'rgba(170, 170, 170, 1)',
          value: 7,
          name: 'han',
        },
        {
          type: 'rect',
          modelType: 'range',
          x: 0,
          y: 60,
          width: 20,
          height: 30,
          color: '#666666',
          name: 'cho',
        },
        {
          type: 'rect',
          modelType: 'range',
          x: 20,
          y: 60,
          width: 30,
          height: 30,
          color: '#999999',
          name: 'cho',
        },
        {
          type: 'rect',
          modelType: 'range',
          x: 50,
          y: 60,
          width: 50,
          height: 30,
          color: '#bbbbbb',
          name: 'cho',
        },
        {
          type: 'rect',
          modelType: 'bullet',
          x: 0,
          y: 67.5,
          width: 80,
          height: 15,
          color: 'rgba(187, 187, 187, 1)',
          value: 8,
          name: 'cho',
        },
      ],
      selectedSeries: [],
    },
    responders: [
      {
        type: 'rect',
        modelType: 'range',
        x: 0,
        y: 10,
        width: 10,
        height: 30,
        color: '#666666',
        name: 'han',
        data: { color: '#aaaaaa', label: 'han', value: '0 ~ 1' },
      },
      {
        type: 'rect',
        modelType: 'range',
        x: 10,
        y: 10,
        width: 30,
        height: 30,
        color: '#999999',
        name: 'han',
        data: { color: '#aaaaaa', label: 'han', value: '1 ~ 4' },
      },
      {
        type: 'rect',
        modelType: 'range',
        x: 40,
        y: 10,
        width: 60,
        height: 30,
        color: '#bbbbbb',
        name: 'han',
        data: { color: '#aaaaaa', label: 'han', value: '4 ~ 10' },
      },
      {
        type: 'rect',
        modelType: 'bullet',
        x: 0,
        y: 17.5,
        width: 60,
        height: 15,
        color: 'rgba(170, 170, 170, 1)',
        value: 6,
        name: 'han',
        thickness: 4,
        style: ['shadow'],
        data: { color: '#aaaaaa', label: 'han', value: 6 },
      },
      {
        type: 'rect',
        modelType: 'marker',
        x: 68,
        y: 13,
        width: 4,
        height: 24,
        color: 'rgba(170, 170, 170, 1)',
        value: 7,
        name: 'han',
        data: { color: '#aaaaaa', label: 'han', value: 7 },
      },
      {
        type: 'rect',
        modelType: 'range',
        x: 0,
        y: 60,
        width: 20,
        height: 30,
        color: '#666666',
        name: 'cho',
        data: { color: '#bbbbbb', label: 'cho', value: '0 ~ 2' },
      },
      {
        type: 'rect',
        modelType: 'range',
        x: 20,
        y: 60,
        width: 30,
        height: 30,
        color: '#999999',
        name: 'cho',
        data: { color: '#bbbbbb', label: 'cho', value: '2 ~ 5' },
      },
      {
        type: 'rect',
        modelType: 'range',
        x: 50,
        y: 60,
        width: 50,
        height: 30,
        color: '#bbbbbb',
        name: 'cho',
        data: { color: '#bbbbbb', label: 'cho', value: '5 ~ 10' },
      },
      {
        type: 'rect',
        modelType: 'bullet',
        x: 0,
        y: 67.5,
        width: 80,
        height: 15,
        color: 'rgba(187, 187, 187, 1)',
        value: 8,
        name: 'cho',
        thickness: 4,
        style: ['shadow'],
        data: { color: '#bbbbbb', label: 'cho', value: 8 },
      },
    ],
  };

  ['models', 'responders'].forEach((modelName) => {
    it(`should make ${modelName} properly when calling render`, () => {
      expect(bulletSeries[modelName]).toEqual(result[modelName]);
    });
  });

  it('should be drawn verticaly', () => {
    bulletSeries.render(
      deepMergedCopy(chartState, {
        scale: {
          yAxis: {
            limit: { min: 0, max: 10 },
            stepSize: 1,
            stepCount: 1,
          },
        },
        axes: {
          xAxis: {
            tickDistance: 50,
          },
          yAxis: {
            zeroPosition: 100,
          },
        },
        options: {
          series: {
            vertical: true,
          },
        },
      })
    );

    expect(bulletSeries.models.series).toEqual([
      {
        type: 'rect',
        name: 'han',
        color: '#666666',
        x: 10,
        y: 90,
        width: 30,
        height: 10,
        modelType: 'range',
      },
      {
        type: 'rect',
        name: 'han',
        color: '#999999',
        x: 10,
        y: 60,
        width: 30,
        height: 30,
        modelType: 'range',
      },
      {
        type: 'rect',
        name: 'han',
        color: '#bbbbbb',
        x: 10,
        y: 0,
        width: 30,
        height: 60,
        modelType: 'range',
      },
      {
        type: 'rect',
        name: 'han',
        color: 'rgba(170, 170, 170, 1)',
        x: 17.5,
        y: 40,
        width: 15,
        height: 60,
        modelType: 'bullet',
        value: 6,
      },
      {
        type: 'rect',
        name: 'han',
        color: 'rgba(170, 170, 170, 1)',
        x: 13,
        y: 32,
        width: 24,
        height: 4,
        modelType: 'marker',
        value: 7,
      },
      {
        type: 'rect',
        name: 'cho',
        color: '#666666',
        x: 60,
        y: 80,
        width: 30,
        height: 20,
        modelType: 'range',
      },
      {
        type: 'rect',
        name: 'cho',
        color: '#999999',
        x: 60,
        y: 50,
        width: 30,
        height: 30,
        modelType: 'range',
      },
      {
        type: 'rect',
        name: 'cho',
        color: '#bbbbbb',
        x: 60,
        y: 0,
        width: 30,
        height: 50,
        modelType: 'range',
      },
      {
        type: 'rect',
        name: 'cho',
        color: 'rgba(187, 187, 187, 1)',
        x: 67.5,
        y: 20,
        width: 15,
        height: 80,
        modelType: 'bullet',
        value: 8,
      },
    ]);
  });
});
