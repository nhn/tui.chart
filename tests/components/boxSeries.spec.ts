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
  legend: {
    data: [
      { label: 'han', active: true, checked: true },
      { label: 'cho', active: true, checked: true },
    ],
  },
};

const result = {
  clipRect: [{ type: 'clipRectArea', x: 0, y: 0, width: 80, height: 80 }],
  series: [
    {
      type: 'rect',
      color: 'rgba(170, 170, 170, 1)',
      width: 16,
      height: 8,
      x: 0,
      y: 12,
      value: 1,
      name: 'han',
    },
    {
      type: 'rect',
      color: 'rgba(170, 170, 170, 1)',
      width: 32,
      height: 8,
      x: 0,
      y: 52,
      value: 2,
      name: 'han',
    },
    {
      type: 'rect',
      color: 'rgba(187, 187, 187, 1)',
      width: 64,
      height: 8,
      x: 0,
      y: 20,
      value: 4,
      name: 'cho',
    },
    {
      type: 'rect',
      color: 'rgba(187, 187, 187, 1)',
      width: 80,
      height: 8,
      x: 0,
      y: 60,
      value: 5,
      name: 'cho',
    },
  ],
};

const respondersResult = [
  {
    type: 'rect',
    color: 'rgba(170, 170, 170, 1)',
    x: 0,
    y: 12,
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
    color: 'rgba(170, 170, 170, 1)',
    x: 0,
    y: 52,
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
    color: 'rgba(187, 187, 187, 1)',
    x: 0,
    y: 20,
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
    color: 'rgba(187, 187, 187, 1)',
    x: 0,
    y: 60,
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
