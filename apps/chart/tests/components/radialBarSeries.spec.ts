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
  scale: { xAxis: { limit: { min: 0, max: 3 }, stepSize: 1, stepCount: 1 } },
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
    yAxis: {
      labels: ['A', 'B'],
      axisSize: 50,
      centerX: 100,
      centerY: 100,
      maxLabelWidth: 30,
      maxLabelHeight: 15,
      labelInterval: 1,
      labelMargin: 0,
      tickDistance: 10,
      radiusRanges: [50, 25],
      pointOnColumn: true,
      innerRadius: 0,
      outerRadius: 50,
      labelAlign: 'right',
    },
    radialAxis: {
      labels: ['0', '1', '2', '3'],
      axisSize: 50,
      centerX: 100,
      centerY: 100,
      maxLabelWidth: 20,
      maxLabelHeight: 15,
      labelInterval: 1,
      labelMargin: 25,
      degree: 120,
      tickInterval: 1,
      totalAngle: 360,
      drawingStartAngle: 0,
      clockwise: true,
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
        categoryIndex: 0,
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
        categoryIndex: 0,
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
        categoryIndex: 1,
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
        categoryIndex: 1,
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
      categoryIndex: 0,
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
      categoryIndex: 0,
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
      categoryIndex: 1,
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
      categoryIndex: 1,
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
        categoryIndex: 0,
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
        categoryIndex: 1,
        seriesColor: '#aaaaaa',
        seriesIndex: 0,
      },
    ],
  };

  it('should make model properly when calling render with null data', () => {
    expect(radialBarSeries.models).toEqual(modelsWithNull);
  });
});
