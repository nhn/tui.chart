import RadialBarSeries from '@src/component/radialBarSeries';
import Store from '@src/store/store';
import EventEmitter from '@src/eventEmitter';
import { deepMergedCopy } from '@src/helpers/utils';
import { Options } from '@t/store/store';

let radialBarSeries;

const seriesData = [
  { name: 'han', data: [1, 1], color: '#aaaaaa' },
  { name: 'cho', data: [2, 2], color: '#bbbbbb' },
];

const chartState = {
  chart: { width: 200, height: 200 },
  layout: {
    plot: { width: 200, height: 200, x: 0, y: 0 },
  },
  scale: { circularAxis: { limit: { min: 0, max: 3 }, stepSize: 1, stepCount: 1 } },
  series: {
    radialBar: {
      data: seriesData,
    },
  },
  stackSeries: {
    radialBar: {
      data: seriesData,
      seriesCount: seriesData.length,
      seriesGroupCount: seriesData[0].data.length,
      stack: {
        type: 'normal',
        connector: false,
      },
      stackData: [
        { values: [1, 1], sum: 2, total: { negative: 0, positive: 2 } },
        { values: [2, 2], sum: 4, total: { negative: 0, positive: 4 } },
      ],
    },
  },
  radialAxes: {
    verticalAxis: {
      axisSize: 50,
      centerX: 100,
      centerY: 100,
      tickDistance: 10,
      pointOnColumn: true,
      label: {
        labels: ['A', 'B'],
        maxWidth: 30,
        maxHeight: 15,
        interval: 1,
        margin: 0,
        align: 'right',
      },
      radius: {
        ranges: [50, 25],
        inner: 0,
        outer: 50,
      },
      angle: {
        start: 0,
        end: 360,
      },
    },
    circularAxis: {
      axisSize: 50,
      centerX: 100,
      centerY: 100,
      tickInterval: 1,
      clockwise: true,
      label: {
        labels: ['0', '1', '2', '3'],
        maxWidth: 20,
        maxHeight: 15,
        interval: 1,
        margin: 25,
      },
      angle: {
        central: 120,
        total: 360,

        drawingStart: 0,
        start: 0,
        end: 360,
      },
    },
  },
  categories: ['A', 'B'],
  options: {},
  legend: {
    data: [
      { label: 'han', active: true, checked: true },
      { label: 'cho', active: true, checked: true },
    ],
  },
  theme: {
    series: {
      radialBar: {
        areaOpacity: 1,
        colors: ['#aaaaaa', '#bbbbbb'],
        strokeStyle: '#fff',
        hover: {},
        select: {},
      },
    },
  },
};

describe('radialBar series', () => {
  beforeEach(() => {
    radialBarSeries = new RadialBarSeries({
      store: {} as Store<Options>,
      eventBus: new EventEmitter(),
    });

    radialBarSeries.render(chartState);
  });

  const models = {
    A: [
      {
        type: 'sector',
        name: 'han',
        color: 'rgba(170, 170, 170, 1)',
        x: 100,
        y: 100,
        degree: { start: 0, end: 90 },
        radius: { inner: 30, outer: 45 },
        value: 1,
        style: [{ strokeStyle: '#fff' }],
        clockwise: true,
        drawingStartAngle: -90,
        totalAngle: 360,
        index: 0,
        seriesColor: '#aaaaaa',
        seriesIndex: 0,
      },
      {
        type: 'sector',
        name: 'cho',
        color: 'rgba(187, 187, 187, 1)',
        x: 100,
        y: 100,
        degree: { start: 90, end: 180 },
        radius: { inner: 30, outer: 45 },
        value: 1,
        style: [{ strokeStyle: '#fff' }],
        clockwise: true,
        drawingStartAngle: -90,
        totalAngle: 360,
        index: 0,
        seriesColor: '#bbbbbb',
        seriesIndex: 1,
      },
    ],
    B: [
      {
        type: 'sector',
        name: 'han',
        color: 'rgba(170, 170, 170, 1)',
        x: 100,
        y: 100,
        degree: { start: 0, end: 180 },
        radius: { inner: 5, outer: 20 },
        value: 2,
        style: [{ strokeStyle: '#fff' }],
        clockwise: true,
        drawingStartAngle: -90,
        totalAngle: 360,
        index: 1,
        seriesColor: '#aaaaaa',
        seriesIndex: 0,
      },
      {
        type: 'sector',
        name: 'cho',
        color: 'rgba(187, 187, 187, 1)',
        x: 100,
        y: 100,
        degree: { start: 180, end: 360 },
        radius: { inner: 5, outer: 20 },
        value: 2,
        style: [{ strokeStyle: '#fff' }],
        clockwise: true,
        drawingStartAngle: -90,
        totalAngle: 360,
        index: 1,
        seriesColor: '#bbbbbb',
        seriesIndex: 1,
      },
    ],
  };

  const responders = [
    {
      type: 'sector',
      name: 'han',
      color: 'rgba(170, 170, 170, 1)',
      x: 100,
      y: 100,
      degree: { start: 0, end: 90 },
      radius: { inner: 30, outer: 45 },
      value: 1,
      style: [{ strokeStyle: '#fff' }],
      clockwise: true,
      drawingStartAngle: -90,
      totalAngle: 360,
      index: 0,
      seriesColor: '#aaaaaa',
      seriesIndex: 0,
      data: {
        label: 'han',
        color: '#aaaaaa',
        value: 1,
        category: 'A',
      },
    },
    {
      type: 'sector',
      name: 'cho',
      color: 'rgba(187, 187, 187, 1)',
      x: 100,
      y: 100,
      degree: { start: 90, end: 180 },
      radius: { inner: 30, outer: 45 },
      value: 1,
      style: [{ strokeStyle: '#fff' }],
      clockwise: true,
      drawingStartAngle: -90,
      totalAngle: 360,
      index: 0,
      seriesColor: '#bbbbbb',
      seriesIndex: 1,
      data: {
        label: 'cho',
        color: '#bbbbbb',
        value: 1,
        category: 'A',
      },
    },
    {
      type: 'sector',
      name: 'han',
      color: 'rgba(170, 170, 170, 1)',
      x: 100,
      y: 100,
      degree: { start: 0, end: 180 },
      radius: { inner: 5, outer: 20 },
      value: 2,
      style: [{ strokeStyle: '#fff' }],
      clockwise: true,
      drawingStartAngle: -90,
      totalAngle: 360,
      index: 1,
      seriesColor: '#aaaaaa',
      seriesIndex: 0,
      data: {
        label: 'han',
        color: '#aaaaaa',
        value: 2,
        category: 'B',
      },
    },
    {
      type: 'sector',
      name: 'cho',
      color: 'rgba(187, 187, 187, 1)',
      x: 100,
      y: 100,
      degree: { start: 180, end: 360 },
      radius: { inner: 5, outer: 20 },
      value: 2,
      style: [{ strokeStyle: '#fff' }],
      clockwise: true,
      drawingStartAngle: -90,
      totalAngle: 360,
      index: 1,
      seriesColor: '#bbbbbb',
      seriesIndex: 1,
      data: {
        label: 'cho',
        color: '#bbbbbb',
        value: 2,
        category: 'B',
      },
    },
  ];

  it('should make models properly when calling render', () => {
    expect(radialBarSeries.models).toEqual(models);
  });

  it('should make responders properly when calling render', () => {
    expect(radialBarSeries.responders).toEqual(responders);
  });
});

describe('radar series using null data', () => {
  beforeEach(() => {
    radialBarSeries = new RadialBarSeries({
      store: {} as Store<Options>,
      eventBus: new EventEmitter(),
    });

    radialBarSeries.render(
      deepMergedCopy(chartState, {
        series: {
          radialBar: {
            data: [
              { name: 'han', data: [null, 1], color: '#aaaaaa' },
              { name: 'cho', data: [2, null], color: '#bbbbbb' },
            ],
          },
        },
        stackSeries: {
          radialBar: {
            data: seriesData,
            seriesCount: seriesData.length,
            seriesGroupCount: seriesData[0].data.length,
            stack: {
              type: 'normal',
              connector: false,
            },
            stackData: [
              { values: [null, 1], sum: 1, total: { negative: 0, positive: 1 } },
              { values: [2, null], sum: 2, total: { negative: 0, positive: 2 } },
            ],
          },
        },
      })
    );
  });

  const modelsWithNull = {
    A: [
      {
        type: 'sector',
        name: 'cho',
        color: 'rgba(187, 187, 187, 1)',
        x: 100,
        y: 100,
        degree: { start: 0, end: 90 },
        radius: { inner: 30, outer: 45 },
        value: 1,
        style: [{ strokeStyle: '#fff' }],
        clockwise: true,
        drawingStartAngle: -90,
        totalAngle: 360,
        index: 0,
        seriesColor: '#bbbbbb',
        seriesIndex: 1,
      },
    ],
    B: [
      {
        type: 'sector',
        name: 'han',
        color: 'rgba(170, 170, 170, 1)',
        x: 100,
        y: 100,
        degree: { start: 0, end: 180 },
        radius: { inner: 5, outer: 20 },
        value: 2,
        style: [{ strokeStyle: '#fff' }],
        clockwise: true,
        drawingStartAngle: -90,
        totalAngle: 360,
        index: 1,
        seriesColor: '#aaaaaa',
        seriesIndex: 0,
      },
    ],
  };

  it('should make model properly when calling render with null data', () => {
    expect(radialBarSeries.models).toEqual(modelsWithNull);
  });
});
