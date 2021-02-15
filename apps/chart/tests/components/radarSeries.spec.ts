import RadarSeries from '@src/component/radarSeries';
import Store from '@src/store/store';
import EventEmitter from '@src/eventEmitter';
import { deepMergedCopy } from '@src/helpers/utils';
import { Options } from '@t/store/store';

let radarSeries;

const seriesData = [
  { name: 'han', data: [1, 2, 3, 4], color: '#aaaaaa' },
  { name: 'cho', data: [2, 1, 1, 3], color: '#bbbbbb' },
];

const chartState = {
  chart: { width: 200, height: 200 },
  layout: {
    plot: { width: 200, height: 200, x: 0, y: 0 },
  },
  scale: { verticalAxis: { limit: { min: 0, max: 5 }, stepSize: 1, stepCount: 1 } },
  series: {
    radar: {
      data: seriesData,
    },
  },
  radialAxes: {
    verticalAxis: {
      labels: ['0', '1', '2', '3', '4', '5'],
      axisSize: 50,
      centerX: 100,
      centerY: 100,
      maxLabelWidth: 30,
      maxLabelHeight: 15,
      labelInterval: 1,
      labelMargin: 0,
      tickDistance: 25,
      radiusRanges: [10, 20, 30, 40, 50],
      pointOnColumn: false,
      innerRadius: 0,
      outerRadius: 50,
      labelAlign: 'center',
    },
    circularAxis: {
      labels: ['A', 'B', 'C', 'D'],
      axisSize: 50,
      centerX: 100,
      centerY: 100,
      maxLabelWidth: 20,
      maxLabelHeight: 15,
      labelInterval: 1,
      labelMargin: 25,
      degree: 90,
      tickInterval: 1,
      totalAngle: 360,
      drawingStartAngle: 0,
      clockwise: true,
    },
  },
  categories: ['A', 'B', 'C', 'D'],
  options: {},
  legend: {
    data: [
      { label: 'han', active: true, checked: true },
      { label: 'cho', active: true, checked: true },
    ],
  },
  theme: {
    series: {
      radar: {
        areaOpacity: 0.3,
        colors: ['#aaaaaa', '#bbbbbb'],
        dot: {
          radius: 3,
        },
        hover: {
          dot: {
            radius: 4,
            borderWidth: 2,
          },
        },
        select: {
          dot: {
            radius: 4,
            borderWidth: 2,
          },
        },
      },
    },
  },
};

describe('radar series', () => {
  beforeEach(() => {
    radarSeries = new RadarSeries({
      store: {} as Store<Options>,
      eventBus: new EventEmitter(),
    });

    radarSeries.render(chartState);
  });

  const models = {
    area: [],
    line: [
      {
        type: 'linePoints',
        color: 'rgba(170, 170, 170, 1)',
        distances: [10, 20, 30, 40],
        lineWidth: 2,
        name: 'han',
        points: [
          { x: 100, y: 90 },
          { x: 120, y: 100 },
          { x: 100, y: 130 },
          { x: 60, y: 100 },
          { x: 100, y: 90 },
        ],
      },
      {
        type: 'linePoints',
        color: 'rgba(187, 187, 187, 1)',
        distances: [20, 10, 10, 30],
        lineWidth: 2,
        name: 'cho',
        points: [
          { x: 100, y: 80 },
          { x: 110, y: 100 },
          { x: 100, y: 110 },
          { x: 70, y: 100 },
          { x: 100, y: 80 },
        ],
      },
    ],
    dot: [],
  };

  const responders = [
    {
      type: 'circle',
      x: 100,
      y: 90,
      radius: 3,
      color: 'rgba(170, 170, 170, 1)',
      seriesIndex: 0,
      data: { label: 'han', color: 'rgba(170, 170, 170, 1)', value: 1, category: 'A' },
      name: 'han',
      index: 0,
      style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }],
      value: 1,
    },
    {
      type: 'circle',
      x: 120,
      y: 100,
      radius: 3,
      color: 'rgba(170, 170, 170, 1)',
      seriesIndex: 0,
      data: { label: 'han', color: 'rgba(170, 170, 170, 1)', value: 2, category: 'B' },
      name: 'han',
      index: 1,
      style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }],
      value: 2,
    },
    {
      type: 'circle',
      x: 100,
      y: 130,
      radius: 3,
      color: 'rgba(170, 170, 170, 1)',
      seriesIndex: 0,
      data: { label: 'han', color: 'rgba(170, 170, 170, 1)', value: 3, category: 'C' },
      name: 'han',
      index: 2,
      style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }],
      value: 3,
    },
    {
      type: 'circle',
      x: 60,
      y: 100,
      radius: 3,
      color: 'rgba(170, 170, 170, 1)',
      seriesIndex: 0,
      data: { label: 'han', color: 'rgba(170, 170, 170, 1)', value: 4, category: 'D' },
      name: 'han',
      index: 3,
      style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }],
      value: 4,
    },
    {
      type: 'circle',
      x: 100,
      y: 80,
      radius: 3,
      color: 'rgba(187, 187, 187, 1)',
      seriesIndex: 1,
      data: { label: 'cho', color: 'rgba(187, 187, 187, 1)', value: 2, category: 'A' },
      name: 'cho',
      index: 0,
      style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }],
      value: 2,
    },
    {
      type: 'circle',
      x: 110,
      y: 100,
      radius: 3,
      color: 'rgba(187, 187, 187, 1)',
      seriesIndex: 1,
      data: { label: 'cho', color: 'rgba(187, 187, 187, 1)', value: 1, category: 'B' },
      name: 'cho',
      index: 1,
      style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }],
      value: 1,
    },
    {
      type: 'circle',
      x: 100,
      y: 110,
      radius: 3,
      color: 'rgba(187, 187, 187, 1)',
      seriesIndex: 1,
      data: { label: 'cho', color: 'rgba(187, 187, 187, 1)', value: 1, category: 'C' },
      name: 'cho',
      index: 2,
      style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }],
      value: 1,
    },
    {
      type: 'circle',
      x: 70,
      y: 100,
      radius: 3,
      color: 'rgba(187, 187, 187, 1)',
      seriesIndex: 1,
      data: { label: 'cho', color: 'rgba(187, 187, 187, 1)', value: 3, category: 'D' },
      name: 'cho',
      index: 3,
      style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }],
      value: 3,
    },
  ];

  ['area', 'line', 'dot'].forEach((modelName) => {
    it(`should make ${modelName} properly when calling render`, () => {
      expect(radarSeries.models[modelName]).toEqual(models[modelName]);
    });
  });

  it('should make responders properly when calling render', () => {
    expect(radarSeries.responders).toEqual(responders);
  });

  it('should render circle models, when "series.showDot" is true', () => {
    radarSeries.render(
      deepMergedCopy(chartState, {
        options: {
          series: {
            showDot: true,
          },
        },
      })
    );

    expect(radarSeries.models.dot).toEqual([
      {
        type: 'circle',
        color: 'rgba(170, 170, 170, 1)',
        radius: 3,
        x: 100,
        y: 90,
        style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }],
        name: 'han',
        index: 0,
        seriesIndex: 0,
        value: 1,
      },
      {
        type: 'circle',
        color: 'rgba(170, 170, 170, 1)',
        radius: 3,
        x: 120,
        y: 100,
        style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }],
        name: 'han',
        index: 1,
        seriesIndex: 0,
        value: 2,
      },
      {
        type: 'circle',
        color: 'rgba(170, 170, 170, 1)',
        radius: 3,
        x: 100,
        y: 130,
        style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }],
        name: 'han',
        index: 2,
        seriesIndex: 0,
        value: 3,
      },
      {
        type: 'circle',
        color: 'rgba(170, 170, 170, 1)',
        radius: 3,
        x: 60,
        y: 100,
        style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }],
        name: 'han',
        index: 3,
        seriesIndex: 0,
        value: 4,
      },
      {
        type: 'circle',
        color: 'rgba(187, 187, 187, 1)',
        radius: 3,
        x: 100,
        y: 80,
        style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }],
        name: 'cho',
        index: 0,
        seriesIndex: 1,
        value: 2,
      },
      {
        type: 'circle',
        color: 'rgba(187, 187, 187, 1)',
        radius: 3,
        x: 110,
        y: 100,
        style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }],
        name: 'cho',
        index: 1,
        seriesIndex: 1,
        value: 1,
      },

      {
        type: 'circle',
        color: 'rgba(187, 187, 187, 1)',
        radius: 3,
        x: 100,
        y: 110,
        style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }],
        name: 'cho',
        index: 2,
        seriesIndex: 1,
        value: 1,
      },
      {
        type: 'circle',
        color: 'rgba(187, 187, 187, 1)',
        radius: 3,
        x: 70,
        y: 100,
        style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }],
        name: 'cho',
        index: 3,
        seriesIndex: 1,
        value: 3,
      },
    ]);
  });

  it('should render area models, when "series.showArea" is true', () => {
    radarSeries.render(
      deepMergedCopy(chartState, {
        options: {
          series: {
            showArea: true,
          },
        },
      })
    );

    expect(radarSeries.models.area).toEqual([
      {
        type: 'areaPoints',
        color: 'rgba(170, 170, 170, 0)',
        fillColor: 'rgba(170, 170, 170, 0.3)',
        distances: [10, 20, 30, 40],
        lineWidth: 0,
        name: 'han',
        points: [
          { x: 100, y: 90 },
          { x: 120, y: 100 },
          { x: 100, y: 130 },
          { x: 60, y: 100 },
          { x: 100, y: 90 },
        ],
      },
      {
        type: 'areaPoints',
        color: 'rgba(187, 187, 187, 0)',
        fillColor: 'rgba(187, 187, 187, 0.3)',
        distances: [20, 10, 10, 30],
        lineWidth: 0,
        name: 'cho',
        points: [
          { x: 100, y: 80 },
          { x: 110, y: 100 },
          { x: 100, y: 110 },
          { x: 70, y: 100 },
          { x: 100, y: 80 },
        ],
      },
    ]);
  });
});

describe('radar series using null data', () => {
  beforeEach(() => {
    radarSeries = new RadarSeries({
      store: {} as Store<Options>,
      eventBus: new EventEmitter(),
    });

    radarSeries.render(
      deepMergedCopy(chartState, {
        series: {
          radar: {
            data: [
              { name: 'han', data: [null, 2, 3, 4], color: '#aaaaaa' },
              { name: 'cho', data: [2, 1, null, 3], color: '#bbbbbb' },
            ],
          },
        },
        options: {
          series: {
            showArea: true,
          },
        },
      })
    );
  });

  const modelsWithNull = {
    area: [
      {
        type: 'areaPoints',
        color: 'rgba(170, 170, 170, 0)',
        fillColor: 'rgba(170, 170, 170, 0.3)',
        distances: [0, 20, 30, 40],
        lineWidth: 0,
        name: 'han',
        points: [
          { x: 100, y: 100 },
          { x: 120, y: 100 },
          { x: 100, y: 130 },
          { x: 60, y: 100 },
        ],
      },
      {
        type: 'areaPoints',
        color: 'rgba(187, 187, 187, 0)',
        fillColor: 'rgba(187, 187, 187, 0.3)',
        distances: [20, 10, 0, 30],
        lineWidth: 0,
        name: 'cho',
        points: [
          { x: 100, y: 80 },
          { x: 110, y: 100 },
          { x: 100, y: 100 },
          { x: 70, y: 100 },
          { x: 100, y: 80 },
        ],
      },
    ],
    line: [
      {
        type: 'linePoints',
        color: 'rgba(170, 170, 170, 1)',
        distances: [0, 20, 30, 40],
        lineWidth: 2,
        name: 'han',
        points: [null, { x: 120, y: 100 }, { x: 100, y: 130 }, { x: 60, y: 100 }],
      },
      {
        type: 'linePoints',
        color: 'rgba(187, 187, 187, 1)',
        distances: [20, 10, 0, 30],
        lineWidth: 2,
        name: 'cho',
        points: [{ x: 100, y: 80 }, { x: 110, y: 100 }, null, { x: 70, y: 100 }, { x: 100, y: 80 }],
      },
    ],
  };

  ['area', 'line'].forEach((modelName) => {
    it(`should make ${modelName} properly when calling render with null data`, () => {
      expect(radarSeries.models[modelName]).toEqual(modelsWithNull[modelName]);
    });
  });
});
