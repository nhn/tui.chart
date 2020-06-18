import { ScatterChartOptions } from '@t/options';
import Store from '@src/store/store';
import EventEmitter from '@src/eventEmitter';
import ScatterSeries from '@src/component/scatterSeries';
import { deepMergedCopy } from '@src/helpers/utils';

let scatterSeries;
const seriesData = [
  {
    name: 'nameA',
    data: [
      { x: 10, y: 20 },
      { x: 15, y: 20 },
    ],
    color: '#aaaaaa',
  },
  {
    name: 'nameB',
    data: [{ x: 20, y: 10 }],
    color: '#bbbbbb',
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
    scatter: {
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
  legend: {
    data: [
      { label: 'nameA', active: true, checked: true },
      { label: 'nameB', active: true, checked: true },
    ],
  },
};

beforeEach(() => {
  scatterSeries = new ScatterSeries({
    store: {} as Store<ScatterChartOptions>,
    eventBus: new EventEmitter(),
  });

  scatterSeries.render(chartState);
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
      color: 'rgba(170, 170, 170, 1)',
      radius: 7,
      seriesIndex: 0,
      style: ['default', 'hover'],
      type: 'circle',
      x: 0,
      y: 0,
      detectionRadius: 0,
      data: {
        color: '#aaaaaa',
        label: 'nameA',
        value: { x: 10, y: 20 },
      },
    },
    {
      color: 'rgba(170, 170, 170, 1)',
      radius: 7,
      seriesIndex: 0,
      style: ['default', 'hover'],
      type: 'circle',
      x: 140,
      y: 0,
      detectionRadius: 0,
      data: {
        color: '#aaaaaa',
        label: 'nameA',
        value: { x: 15, y: 20 },
      },
    },
    {
      color: 'rgba(187, 187, 187, 1)',
      radius: 7,
      seriesIndex: 1,
      style: ['default', 'hover'],
      type: 'circle',
      x: 280,
      y: 280,
      detectionRadius: 0,
      data: {
        color: '#bbbbbb',
        label: 'nameB',
        value: { x: 20, y: 10 },
      },
    },
  ],
  models: {
    series: [
      {
        color: 'rgba(170, 170, 170, 0.9)',
        radius: 7,
        seriesIndex: 0,
        style: ['default'],
        type: 'circle',
        x: 0,
        y: 0,
      },
      {
        color: 'rgba(170, 170, 170, 0.9)',
        radius: 7,
        seriesIndex: 0,
        style: ['default'],
        type: 'circle',
        x: 140,
        y: 0,
      },
      {
        color: 'rgba(187, 187, 187, 0.9)',
        radius: 7,
        seriesIndex: 1,
        style: ['default'],
        type: 'circle',
        x: 280,
        y: 280,
      },
    ],
    hoveredSeries: [],
  },
};

['rect', 'responders', 'models'].forEach((modelName) => {
  it(`should make ${modelName} properly when calling render`, () => {
    expect(scatterSeries[modelName]).toEqual(result[modelName]);
  });
});

it('should register closest responder to the mouse', () => {
  const closestResponder = result.responders[0];
  const distantResponder = result.responders[1];

  const responders = [closestResponder, distantResponder];
  scatterSeries.onMousemove({ responders, mousePosition: { x: 10, y: 80 } });
  expect(scatterSeries.activatedResponders).toEqual([closestResponder]);
});

it('should apply transparency when legend active false', () => {
  scatterSeries = new ScatterSeries({
    store: {} as Store<ScatterChartOptions>,
    eventBus: new EventEmitter(),
  });

  scatterSeries.render(
    deepMergedCopy(chartState, {
      legend: {
        data: [
          { label: 'nameA', active: true, checked: true },
          { label: 'nameB', active: false, checked: true },
        ],
      },
    })
  );

  expect(scatterSeries.drawModels.series[2].color).toEqual('rgba(187, 187, 187, 0.3)');
});
