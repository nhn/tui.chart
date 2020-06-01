import { AreaChartOptions } from '@t/options';
import Store from '@src/store/store';
import EventEmitter from '@src/eventEmitter';
import BubbleSeries from '@src/component/bubbleSeries';

let bubbleSeries;
const seriesData = [
  {
    name: 'nameA',
    data: [
      { x: 10, y: 20, r: 100, label: 'A' },
      { x: 15, y: 20, r: 200, label: 'B' },
    ],
  },
  {
    name: 'nameB',
    data: [{ x: 20, y: 10, r: 30, label: 'C' }],
  },
];

const chartState = {
  chart: { width: 300, height: 300 },
  layout: {
    xAxis: { x: 10, y: 280, width: 280, height: 10 },
    yAxis: { x: 10, y: 10, width: 10, height: 280 },
    plot: { width: 280, height: 280, x: 10, y: 80 },
  },
  series: {
    bubble: {
      data: seriesData,
      seriesCount: seriesData.length,
      seriesGroupCount: seriesData[0].data.length,
    },
  },
  scale: {
    xAxis: {
      limit: {
        min: 10,
        max: 20,
      },
    },
    yAxis: {
      limit: {
        min: 10,
        max: 20,
      },
    },
  },
  axes: {
    xAxis: {
      tickDistance: 56,
      tickCount: 5,
    },
    yAxis: {
      tickDistance: 56,
      tickCount: 5,
    },
  },
  options: {
    series: {},
  },
  theme: {
    series: {
      colors: ['#aaaaaa', '#bbbbbb'],
    },
  },
};

beforeEach(() => {
  bubbleSeries = new BubbleSeries({
    store: {} as Store<AreaChartOptions>,
    eventBus: new EventEmitter(),
  });

  bubbleSeries.render(chartState);
});

const result = {
  rect: {
    height: 280,
    width: 280,
    x: 10,
    y: 80,
  },
  responders: [
    {
      color: 'rgba(170, 170, 170, 0.85)',
      radius: 29,
      seriesIndex: 0,
      style: ['default', 'hover', { lineWidth: 2 }],
      type: 'circle',
      x: 0,
      y: 0,
      detectionRadius: 0,
      data: {
        category: undefined, // eslint-disable-line no-undefined
        color: '#aaaaaa',
        label: 'nameA',
        value: 20,
      },
    },
    {
      color: 'rgba(170, 170, 170, 0.85)',
      radius: 57,
      seriesIndex: 0,
      style: ['default', 'hover', { lineWidth: 2 }],
      type: 'circle',
      x: 140,
      y: 0,
      detectionRadius: 0,
      data: {
        category: undefined, // eslint-disable-line no-undefined
        color: '#aaaaaa',
        label: 'nameA',
        value: 20,
      },
    },
    {
      color: 'rgba(187, 187, 187, 0.85)',
      radius: 9.4,
      seriesIndex: 1,
      style: ['default', 'hover', { lineWidth: 2 }],
      type: 'circle',
      x: 280,
      y: 280,
      detectionRadius: 0,
      data: {
        category: undefined, // eslint-disable-line no-undefined
        color: '#bbbbbb',
        label: 'nameB',
        value: 10,
      },
    },
  ],
  models: [
    { height: 280, type: 'clipRectArea', width: 0, x: 0, y: 0 },
    {
      color: 'rgba(170, 170, 170, 0.7)',
      radius: 28,
      seriesIndex: 0,
      style: ['default', { strokeStyle: 'rgba(170, 170, 170, 0.3)' }],
      type: 'circle',
      x: 0,
      y: 0,
    },
    {
      color: 'rgba(170, 170, 170, 0.7)',
      radius: 56,
      seriesIndex: 0,
      style: ['default', { strokeStyle: 'rgba(170, 170, 170, 0.3)' }],
      type: 'circle',
      x: 140,
      y: 0,
    },
    {
      color: 'rgba(187, 187, 187, 0.7)',
      radius: 8.4,
      seriesIndex: 1,
      style: ['default', { strokeStyle: 'rgba(187, 187, 187, 0.3)' }],
      type: 'circle',
      x: 280,
      y: 280,
    },
  ],
};

['rect', 'responders', 'models'].forEach((modelName) => {
  it(`should make ${modelName} properly when calling render`, () => {
    expect(bubbleSeries[modelName]).toEqual(result[modelName]);
  });
});

it('should register closest responder to the mouse', () => {
  const closestResponder = result.responders[0];
  const distantResponder = result.responders[1];

  const responders = [closestResponder, distantResponder];
  bubbleSeries.onMousemove({ responders, mousePosition: { x: 10, y: 80 } });
  expect(bubbleSeries.activatedResponders).toEqual([closestResponder]);
});
