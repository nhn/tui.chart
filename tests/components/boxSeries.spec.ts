import BoxSeries from '@src/component/boxSeries';
import Store from '@src/store/store';
import EventEmitter from '@src/eventEmitter';
import { BarChartOptions } from '@t/options';

let boxSeries;
const seriesData = [
  { name: 'han', data: [1, 2] },
  { name: 'cho', data: [4, 5] },
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
  theme: {
    series: {
      colors: ['#aaaaaa', '#bbbbbb'],
    },
  },
  categories: ['A', 'B'],
  options: {},
};

const result = [
  {
    type: 'rect',
    color: '#aaaaaa',
    width: 16,
    height: 5,
    x: 5,
    y: 19,
  },
  {
    type: 'rect',
    color: '#aaaaaa',
    width: 32,
    height: 5,
    x: 5,
    y: 59,
  },
  {
    type: 'rect',
    color: '#bbbbbb',
    width: 64,
    height: 5,
    x: 5,
    y: 24,
  },
  {
    type: 'rect',
    color: '#bbbbbb',
    width: 80,
    height: 5,
    x: 5,
    y: 64,
  },
];

const respondersResult = [
  {
    type: 'rect',
    color: '#aaaaaa',
    x: 5,
    y: 19,
    width: 16,
    height: 5,
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
    y: 59,
    width: 32,
    height: 5,
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
    height: 5,
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
    height: 5,
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
