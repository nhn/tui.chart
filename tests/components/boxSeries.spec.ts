import BoxSeries from '@src/component/boxSeries';
import Store from '@src/store/store';
import EventEmitter from '@src/eventEmitter';
import { BarChartOptions } from '@t/options';

let boxSeries;
const seriesData = [
  { name: 'han', data: [1, 2], color: '#aaaaaa' },
  { name: 'cho', data: [4, 5], color: '#bbbbbb' },
];

const chartState = {
  chart: { width: 120, height: 120 },
  layout: {
    xAxis: { x: 30, y: 90, width: 80, height: 20 },
    yAxis: { x: 10, y: 10, width: 20, height: 80 },
    plot: { width: 80, height: 80, x: 30, y: 10 },
  },
  series: {
    bar: {
      data: seriesData,
      seriesCount: seriesData.length,
      seriesGroupCount: seriesData[0].data.length,
    },
  },
  axes: {
    xAxis: {
      labels: [0, 5],
      tickCount: 2,
      tickDistance: 40,
    },
    yAxis: {
      pointOnColumn: true,
      tickDistance: 40,
    },
  },
  categories: ['A', 'B'],
  options: {},
  dataLabels: {
    visible: false,
  },
};

const result = {
  clipRect: [{ type: 'clipRectArea', x: 0, y: 0, width: 90, height: 90 }],
  series: [
    {
      type: 'rect',
      color: '#aaaaaa',
      width: 16,
      height: 8,
      x: 5,
      y: 16,
      value: 1,
    },
    {
      type: 'rect',
      color: '#aaaaaa',
      width: 32,
      height: 8,
      x: 5,
      y: 56,
      value: 2,
    },
    {
      type: 'rect',
      color: '#bbbbbb',
      width: 64,
      height: 8,
      x: 5,
      y: 24,
      value: 4,
    },
    {
      type: 'rect',
      color: '#bbbbbb',
      width: 80,
      height: 8,
      x: 5,
      y: 64,
      value: 5,
    },
  ],
};

const respondersResult = [
  {
    type: 'rect',
    color: '#aaaaaa',
    x: 5,
    y: 16,
    width: 16,
    height: 8,
    style: [
      {
        shadowBlur: 6,
        shadowColor: 'rgba(0, 0, 0, 0.3)',
        shadowOffsetX: 2,
        shadowOffsetY: 2,
      },
    ],
    thickness: 4,
    data: { label: 'han', color: '#aaaaaa', value: 1, category: 'A' },
  },
  {
    type: 'rect',
    color: '#aaaaaa',
    x: 5,
    y: 56,
    width: 32,
    height: 8,
    style: [
      {
        shadowBlur: 6,
        shadowColor: 'rgba(0, 0, 0, 0.3)',
        shadowOffsetX: 2,
        shadowOffsetY: 2,
      },
    ],
    thickness: 4,
    data: { label: 'han', color: '#aaaaaa', value: 2, category: 'B' },
  },
  {
    type: 'rect',
    color: '#bbbbbb',
    x: 5,
    y: 24,
    width: 64,
    height: 8,
    style: [
      {
        shadowBlur: 6,
        shadowColor: 'rgba(0, 0, 0, 0.3)',
        shadowOffsetX: 2,
        shadowOffsetY: 2,
      },
    ],
    thickness: 4,
    data: { label: 'cho', color: '#bbbbbb', value: 4, category: 'A' },
  },
  {
    type: 'rect',
    color: '#bbbbbb',
    x: 5,
    y: 64,
    width: 80,
    height: 8,
    style: [
      {
        shadowBlur: 6,
        shadowColor: 'rgba(0, 0, 0, 0.3)',
        shadowOffsetX: 2,
        shadowOffsetY: 2,
      },
    ],
    thickness: 4,
    data: { label: 'cho', color: '#bbbbbb', value: 5, category: 'B' },
  },
];

beforeEach(() => {
  boxSeries = new BoxSeries({
    store: {} as Store<BarChartOptions>,
    eventBus: new EventEmitter(),
  });

  boxSeries.name = 'bar';
});

it('should be set the drawing models for series rendering', () => {
  boxSeries.render(chartState);
  const { models, responders } = boxSeries;

  expect(models).toEqual(result);
  expect(responders).toEqual(respondersResult);
});
