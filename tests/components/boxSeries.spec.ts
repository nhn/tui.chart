import BoxSeries from '@src/component/boxSeries';
import Store from '@src/store/store';
import EventEmitter from '@src/eventEmitter';
import { BarChartOptions } from '@t/options';

let boxSeries;
const seriesData = [
  { name: 'han', data: [1, 2] },
  { name: 'cho', data: [4, 5] }
];

const chartState = {
  chart: { width: 120, height: 120 },
  layout: {
    xAxis: { x: 30, y: 90, width: 80, height: 20 },
    yAxis: { x: 10, y: 10, width: 20, height: 80 },
    plot: { width: 80, height: 80, x: 30, y: 10 }
  },
  series: {
    bar: {
      data: seriesData,
      seriesCount: seriesData.length,
      seriesGroupCount: seriesData[0].data.length
    }
  },
  axes: {
    xAxis: {
      labels: [0, 5],
      tickCount: 2,
      validTickCount: 2
    },
    yAxis: {
      pointOnColumn: true,
      validTickCount: 2
    }
  },
  theme: {
    series: {
      colors: ['#aaaaaa', '#bbbbbb']
    }
  },
  categories: ['A', 'B']
};

const result = [
  { type: 'clipRectArea', x: 0, y: 0, width: 80, height: 80 },
  {
    type: 'box',
    color: '#aaaaaa',
    width: 16,
    height: 5,
    x: 0,
    y: 15
  },
  {
    type: 'box',
    color: '#aaaaaa',
    width: 32,
    height: 5,
    x: 0,
    y: 55
  },
  {
    type: 'box',
    color: '#bbbbbb',
    width: 64,
    height: 5,
    x: 0,
    y: 20
  },
  {
    type: 'box',
    color: '#bbbbbb',
    width: 80,
    height: 5,
    x: 0,
    y: 60
  }
];

const respondersResult = [
  {
    type: 'rect',
    color: '#aaaaaa',
    x: 0,
    y: 15,
    width: 16,
    height: 5,
    offsetKey: 'y',
    data: { label: 'han', color: '#aaaaaa', value: 1, category: 'A' }
  },
  {
    type: 'rect',
    color: '#aaaaaa',
    x: 0,
    y: 55,
    width: 32,
    height: 5,
    offsetKey: 'y',
    data: { label: 'han', color: '#aaaaaa', value: 2, category: 'B' }
  },
  {
    type: 'rect',
    color: '#bbbbbb',
    x: 0,
    y: 20,
    width: 64,
    height: 5,
    offsetKey: 'y',
    data: { label: 'cho', color: '#bbbbbb', value: 4, category: 'A' }
  },
  {
    type: 'rect',
    color: '#bbbbbb',
    x: 0,
    y: 60,
    width: 80,
    height: 5,
    offsetKey: 'y',
    data: { label: 'cho', color: '#bbbbbb', value: 5, category: 'B' }
  }
];

beforeEach(() => {
  boxSeries = new BoxSeries({
    store: {} as Store<BarChartOptions>,
    eventBus: new EventEmitter()
  });
});

it('should be set the drawing models for series rendering', () => {
  boxSeries.render(chartState);
  const { models, responders } = boxSeries;

  expect(models).toEqual(result);
  expect(responders).toEqual(respondersResult);
});

it('should be possible to know the value information when the mouse hover the series', () => {
  boxSeries.render(chartState);

  const hoverSeriesResponseData = {
    mousePosition: {
      x: 50,
      y: 33
    },
    responders: [
      {
        type: 'rect',
        color: '#bbbbbb',
        x: 0,
        y: 20,
        width: 64,
        height: 5,
        offsetKey: 'y',
        data: { label: 'cho', color: '#bbbbbb', value: 4, category: 'A' }
      }
    ]
  };

  boxSeries.onMousemove(hoverSeriesResponseData);

  const { activatedResponders } = boxSeries;

  const activatedResult = [
    {
      type: 'rect',
      color: '#bbbbbb',
      x: 0,
      y: 20,
      width: 64,
      height: 5,
      offsetKey: 'y',
      data: { label: 'cho', color: '#bbbbbb', value: 4, category: 'A' }
    }
  ];

  expect(activatedResponders).toEqual(activatedResult);
});

it('should be no active data when the mouse hover non-series', () => {
  boxSeries.render(chartState);

  boxSeries.onMousemove({
    mousePosition: {
      x: 50,
      y: 50
    },
    responders: []
  });

  expect(boxSeries.activatedResponders).toEqual([]);
});
