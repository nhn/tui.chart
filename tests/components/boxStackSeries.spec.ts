import BoxStackSeries from '@src/component/boxStackSeries';
import Store from '@src/store/store';
import EventEmitter from '@src/eventEmitter';
import { BarChartOptions } from '@t/options';

let stackSeries;
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
  stackSeries: {
    bar: {
      data: seriesData,
      seriesCount: seriesData.length,
      seriesGroupCount: seriesData[0].data.length,
      stack: {
        type: 'normal',
        connector: false,
      },
      stackData: [
        { values: [1, 4], sum: 5, total: { negative: 0, positive: 5 } },
        { values: [2, 5], sum: 7, total: { negative: 0, positive: 7 } },
      ],
    },
  },
  axes: {
    xAxis: {
      labels: [0, 2, 4, 6, 8],
      tickCount: 4,
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
      width: 10,
      height: 10,
      x: 5,
      y: 19,
      value: 1,
    },
    {
      type: 'rect',
      color: '#bbbbbb',
      width: 40,
      height: 10,
      x: 15,
      y: 19,
      value: 4,
    },
    {
      type: 'rect',
      color: '#aaaaaa',
      width: 20,
      height: 10,
      x: 5,
      y: 59,
      value: 2,
    },
    {
      type: 'rect',
      color: '#bbbbbb',
      width: 50,
      height: 10,
      x: 25,
      y: 59,
      value: 5,
    },
  ],
  connector: [],
};

const respondersResult = [
  {
    type: 'rect',
    color: '#aaaaaa',
    x: 5,
    y: 19,
    width: 10,
    height: 10,
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
    color: '#bbbbbb',
    x: 15,
    y: 19,
    width: 40,
    height: 10,
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
    color: '#aaaaaa',
    x: 5,
    y: 59,
    width: 20,
    height: 10,
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
    x: 25,
    y: 59,
    width: 50,
    height: 10,
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
  stackSeries = new BoxStackSeries({
    store: {} as Store<BarChartOptions>,
    eventBus: new EventEmitter(),
  });
});

it('should be set the drawing models for stack series rendering', () => {
  stackSeries.render(chartState);
  const { models, responders } = stackSeries;

  expect(models).toEqual(result);
  expect(responders).toEqual(respondersResult);
});
