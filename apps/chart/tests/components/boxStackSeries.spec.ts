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
  scale: { xAxis: { limit: { min: 0, max: 8 }, stepSize: 2, stepCount: 1 } },
  axes: {
    xAxis: {
      labels: [0, 2, 4, 6, 8],
      tickCount: 4,
      tickDistance: 40,
      labelDistance: 40,
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
  series: {
    bar: {},
  },
  theme: {
    series: {
      bar: {
        areaOpacity: 1,
        hover: {
          borderWidth: 4,
          borderColor: '#ffffff',
          shadowColor: 'rgba(0, 0, 0, 0.3)',
          shadowOffsetX: 2,
          shadowOffsetY: 2,
          shadowBlur: 6,
          groupedRect: {
            color: '#000000',
            opacity: 0.05,
          },
        },
        select: {
          borderWidth: 4,
          borderColor: '#ffffff',
          shadowColor: 'rgba(0, 0, 0, 0.3)',
          shadowOffsetX: 2,
          shadowOffsetY: 2,
          shadowBlur: 6,
          groupedRect: {
            color: '#000000',
            opacity: 0.2,
          },
          restSeries: {
            areaOpacity: 0.2,
          },
          areaOpacity: 1,
        },
        connector: {
          color: 'rgba(51, 85, 139, 0.3)',
          lineWidth: 1,
          dashSegments: [5, 5],
        },
      },
    },
  },
};

const result = {
  clipRect: [{ type: 'clipRectArea', x: 0, y: 0, width: 80, height: 80 }],
  series: [
    {
      type: 'rect',
      color: 'rgba(170, 170, 170, 1)',
      width: 10,
      height: 28,
      x: 0,
      y: 6,
      value: 1,
      name: 'han',
      index: 0,
    },
    {
      type: 'rect',
      color: 'rgba(187, 187, 187, 1)',
      width: 40,
      height: 28,
      x: 10,
      y: 6,
      value: 4,
      name: 'cho',
      index: 0,
    },
    {
      type: 'rect',
      color: 'rgba(170, 170, 170, 1)',
      width: 20,
      height: 28,
      x: 0,
      y: 46,
      value: 2,
      name: 'han',
      index: 1,
    },
    {
      type: 'rect',
      color: 'rgba(187, 187, 187, 1)',
      width: 50,
      height: 28,
      x: 20,
      y: 46,
      value: 5,
      name: 'cho',
      index: 1,
    },
  ],
  connector: [],
};

const respondersResult = [
  {
    type: 'rect',
    color: 'rgba(170, 170, 170, 1)',
    x: 0,
    y: 6,
    width: 10,
    height: 28,
    data: { label: 'han', color: '#aaaaaa', value: 1, category: 'A' },
    index: 0,
  },
  {
    type: 'rect',
    color: 'rgba(187, 187, 187, 1)',
    x: 10,
    y: 6,
    width: 40,
    height: 28,
    data: { label: 'cho', color: '#bbbbbb', value: 4, category: 'A' },
    index: 0,
  },
  {
    type: 'rect',
    color: 'rgba(170, 170, 170, 1)',
    x: 0,
    y: 46,
    width: 20,
    height: 28,
    data: { label: 'han', color: '#aaaaaa', value: 2, category: 'B' },
    index: 1,
  },
  {
    type: 'rect',
    color: 'rgba(187, 187, 187, 1)',
    x: 20,
    y: 46,
    width: 50,
    height: 28,
    data: { label: 'cho', color: '#bbbbbb', value: 5, category: 'B' },
    index: 1,
  },
];

beforeEach(() => {
  stackSeries = new BoxStackSeries({
    store: {} as Store<BarChartOptions>,
    eventBus: new EventEmitter(),
  });
  stackSeries.initialize({ name: 'bar' });
});

it('should be set the drawing models for stack series rendering', () => {
  stackSeries.render(chartState, { viewRange: [0, 1] });
  const { models, responders } = stackSeries;

  expect(models).toEqual(result);
  expect(responders).toEqual(respondersResult);
});
