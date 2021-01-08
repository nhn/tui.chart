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
  chart: { width: 120, height: 120 },
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
  theme: {
    series: {
      bullet: {
        areaOpacity: 1,
        barWidthRatios: {
          rangeRatio: 1,
          bulletRatio: 0.5,
          markerRatio: 0.8,
        },
        markerLineWidth: 1,
        hover: {
          borderWidth: 4,
          borderColor: '#ffffff',
          shadowColor: 'rgba(0, 0, 0, 0.3)',
          shadowOffsetX: 2,
          shadowOffsetY: 2,
          shadowBlur: 6,
        },
        select: {
          borderWidth: 4,
          borderColor: '#ffffff',
          shadowColor: 'rgba(0, 0, 0, 0.3)',
          shadowOffsetX: 2,
          shadowOffsetY: 2,
          shadowBlur: 6,
          restSeries: {
            areaOpacity: 0.2,
          },
          areaOpacity: 1,
        },
      },
    },
  },
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
          color: 'rgba(170, 170, 170, 0.5)',
          name: 'han',
          seriesColor: 'rgba(170, 170, 170, 1)',
          value: [0, 1],
        },
        {
          type: 'rect',
          modelType: 'range',
          x: 10,
          y: 10,
          width: 30,
          height: 30,
          color: 'rgba(170, 170, 170, 0.3)',
          name: 'han',
          seriesColor: 'rgba(170, 170, 170, 1)',
          value: [1, 4],
        },
        {
          type: 'rect',
          modelType: 'range',
          x: 40,
          y: 10,
          width: 60,
          height: 30,
          color: 'rgba(170, 170, 170, 0.1)',
          name: 'han',
          seriesColor: 'rgba(170, 170, 170, 1)',
          value: [4, 10],
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
          seriesColor: 'rgba(170, 170, 170, 1)',
        },
        {
          type: 'line',
          x: 70,
          y: 13,
          x2: 70,
          y2: 37,
          lineWidth: 1,
          strokeStyle: 'rgba(170, 170, 170, 1)',
          value: 7,
          name: 'han',
          seriesColor: 'rgba(170, 170, 170, 1)',
        },
        {
          type: 'rect',
          modelType: 'range',
          x: 0,
          y: 60,
          width: 20,
          height: 30,
          color: 'rgba(187, 187, 187, 0.5)',
          name: 'cho',
          seriesColor: 'rgba(187, 187, 187, 1)',
          value: [0, 2],
        },
        {
          type: 'rect',
          modelType: 'range',
          x: 20,
          y: 60,
          width: 30,
          height: 30,
          color: 'rgba(187, 187, 187, 0.3)',
          name: 'cho',
          seriesColor: 'rgba(187, 187, 187, 1)',
          value: [2, 5],
        },
        {
          type: 'rect',
          modelType: 'range',
          x: 50,
          y: 60,
          width: 50,
          height: 30,
          color: 'rgba(187, 187, 187, 0.1)',
          name: 'cho',
          seriesColor: 'rgba(187, 187, 187, 1)',
          value: [5, 10],
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
          seriesColor: 'rgba(187, 187, 187, 1)',
        },
      ],
    },
    responders: [
      {
        type: 'rect',
        modelType: 'range',
        x: 0,
        y: 10,
        width: 10,
        height: 30,
        color: 'rgba(170, 170, 170, 0.5)',
        name: 'han',
        seriesColor: 'rgba(170, 170, 170, 1)',
        value: [0, 1],
        data: {
          color: 'rgba(170, 170, 170, 1)',
          label: 'han',
          value: [{ title: 'Range', value: [0, 1] }],
          templateType: 'bullet',
        },
      },
      {
        type: 'rect',
        modelType: 'range',
        x: 10,
        y: 10,
        width: 30,
        height: 30,
        color: 'rgba(170, 170, 170, 0.3)',
        name: 'han',
        seriesColor: 'rgba(170, 170, 170, 1)',
        value: [1, 4],
        data: {
          color: '#aaaaaa',
          label: 'han',
          value: [{ title: 'Range', value: [1, 4], color: 'rgba(170, 170, 170, 0.3)' }],
          templateType: 'bullet',
        },
      },
      {
        type: 'rect',
        modelType: 'range',
        x: 40,
        y: 10,
        width: 60,
        height: 30,
        color: 'rgba(170, 170, 170, 0.1)',
        name: 'han',
        seriesColor: 'rgba(170, 170, 170, 1)',
        value: [4, 10],
        data: {
          color: 'rgba(170, 170, 170, 1)',
          label: 'han',
          value: [{ title: 'Range', value: [4, 10], color: 'rgba(170, 170, 170, 0.3)' }],
          templateType: 'bullet',
        },
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
        seriesColor: 'rgba(170, 170, 170, 1)',
        data: {
          color: '#aaaaaa',
          label: 'han',
          value: [
            {
              color: 'rgba(170, 170, 170, 1)',
              title: 'Actual',
              value: [
                {
                  color: 'rgba(170, 170, 170, 1)',
                  title: 'Actual',
                  value: 6,
                },
              ],
            },
          ],
        },
      },
      {
        type: 'line',
        x: 70,
        y: 13,
        x2: 70,
        y2: 37,
        strokeStyle: 'rgba(170, 170, 170, 1)',
        detectionSize: 5,
        lineWidth: 1,
        value: 7,
        name: 'han',
        seriesColor: 'rgba(170, 170, 170, 1)',
        data: {
          color: 'rgba(170, 170, 170, 1)',
          label: 'han',
          value: [{ title: 'Marker', value: 7 }],
          templateType: 'bullet',
        },
      },
      {
        type: 'rect',
        modelType: 'range',
        x: 0,
        y: 60,
        width: 20,
        height: 30,
        color: 'rgba(187, 187, 187, 0.5)',
        name: 'cho',
        seriesColor: 'rgba(187, 187, 187, 1)',
        data: {
          color: 'rgba(187, 187, 187, 1)',
          label: 'cho',
          value: [{ title: 'Range', value: [0, 2], color: 'rgba(187, 187, 187, 0.5)' }],
          templateType: 'bullet',
        },
      },
      {
        type: 'rect',
        modelType: 'range',
        x: 20,
        y: 60,
        width: 30,
        height: 30,
        color: 'rgba(187, 187, 187, 0.3)',
        name: 'cho',
        seriesColor: 'rgba(187, 187, 187, 1)',
        data: {
          color: '#bbbbbb',
          label: 'cho',
          value: [{ title: 'Range', value: [2, 5], color: 'rgba(187, 187, 187, 0.3)' }],
          templateType: 'bullet',
        },
      },
      {
        type: 'rect',
        modelType: 'range',
        x: 50,
        y: 60,
        width: 50,
        height: 30,
        color: 'rgba(187, 187, 187, 0.1)',
        name: 'cho',
        seriesColor: 'rgba(187, 187, 187, 1)',
        value: [5, 10],
        data: {
          color: '#bbbbbb',
          label: 'cho',
          value: [{ title: 'Range', value: [5, 10], color: 'rgba(187, 187, 187, 0.1)' }],
          templateType: 'bullet',
        },
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
        seriesColor: 'rgba(187, 187, 187, 1)',
        data: {
          color: '#bbbbbb',
          label: 'cho',
          value: [
            {
              color: 'rgba(187, 187, 187, 1)',
              title: 'Actual',
              value: 8,
            },
          ],
        },
      },
    ],
  };

  ['models', 'responders'].forEach((modelName) => {
    it(`should make ${modelName} properly when calling render`, () => {
      expect(bulletSeries[modelName]).toEqual(result[modelName]);
    });
  });

  it('should be drawn vertically', () => {
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
        color: 'rgba(170, 170, 170, 0.5)',
        x: 10,
        y: 90,
        width: 30,
        height: 10,
        modelType: 'range',
        seriesColor: 'rgba(170, 170, 170, 1)',
        value: [0, 1],
      },
      {
        type: 'rect',
        name: 'han',
        color: 'rgba(170, 170, 170, 0.3)',
        x: 10,
        y: 60,
        width: 30,
        height: 30,
        modelType: 'range',
        seriesColor: 'rgba(170, 170, 170, 1)',
        value: [1, 4],
      },
      {
        type: 'rect',
        name: 'han',
        color: 'rgba(170, 170, 170, 0.1)',
        x: 10,
        y: 0,
        width: 30,
        height: 60,
        modelType: 'range',
        seriesColor: 'rgba(170, 170, 170, 1)',
        value: [4, 10],
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
        seriesColor: 'rgba(170, 170, 170, 1)',
      },
      {
        type: 'line',
        name: 'han',
        strokeStyle: 'rgba(170, 170, 170, 1)',
        x: 13,
        y: 30,
        x2: 37,
        y2: 30,
        lineWidth: 1,
        value: 7,
        seriesColor: 'rgba(170, 170, 170, 1)',
      },
      {
        type: 'rect',
        name: 'cho',
        color: 'rgba(187, 187, 187, 0.5)',
        x: 60,
        y: 80,
        width: 30,
        height: 20,
        modelType: 'range',
        seriesColor: 'rgba(187, 187, 187, 1)',
        value: [0, 2],
      },
      {
        type: 'rect',
        name: 'cho',
        color: 'rgba(187, 187, 187, 0.3)',
        x: 60,
        y: 50,
        width: 30,
        height: 30,
        modelType: 'range',
        seriesColor: 'rgba(187, 187, 187, 1)',
        value: [2, 5],
      },
      {
        type: 'rect',
        name: 'cho',
        color: 'rgba(187, 187, 187, 0.1)',
        x: 60,
        y: 0,
        width: 30,
        height: 50,
        modelType: 'range',
        seriesColor: 'rgba(187, 187, 187, 1)',
        value: [5, 10],
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
        seriesColor: 'rgba(187, 187, 187, 1)',
      },
    ]);
  });
});
