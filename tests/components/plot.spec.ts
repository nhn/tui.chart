import Plot from '@src/component/plot';
import Store from '@src/store/store';
import EventEmitter from '@src/eventEmitter';
import { deepMergedCopy } from '@src/helpers/utils';
import { Options } from '@t/store/store';

let plot;

const seriesData = [
  { name: 'han', data: [1, 2], color: '#aaaaaa' },
  { name: 'cho', data: [4, 5], color: '#bbbbbb' },
];

const chartState = {
  chart: { width: 100, height: 100 },
  layout: {
    xAxis: { x: 10, y: 80, width: 80, height: 10 },
    yAxis: { x: 10, y: 10, width: 10, height: 80 },
    plot: { width: 80, height: 80, x: 10, y: 80 },
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
      tickCount: 2,
    },
  },
  series: {
    bar: {
      data: seriesData,
      seriesCount: seriesData.length,
      seriesGroupCount: seriesData[0].data.length,
    },
  },
  options: {
    series: {},
  },
  legend: {
    data: [
      { label: 'han', active: true, checked: true },
      { label: 'cho', active: true, checked: true },
    ],
  },
  categories: ['A', 'B'],
};

describe('plot grid lines', () => {
  beforeEach(() => {
    plot = new Plot({
      store: {} as Store<Options>,
      eventBus: new EventEmitter(),
    });
  });

  it('should be drawwn depending on the tick of the axis', () => {
    plot.render(chartState);

    const result = [
      {
        strokeStyle: 'rgba(0, 0, 0, 0.05)',
        type: 'line',
        x: 0.5,
        x2: 80.5,
        y: 0.5,
        y2: 0.5,
      },
      {
        strokeStyle: 'rgba(0, 0, 0, 0.05)',
        type: 'line',
        x: 0.5,
        x2: 80.5,
        y: 80.5,
        y2: 80.5,
      },
      {
        strokeStyle: 'rgba(0, 0, 0, 0.05)',
        type: 'line',
        x: 0.5,
        x2: 0.5,
        y: 0.5,
        y2: 80.5,
      },
      {
        strokeStyle: 'rgba(0, 0, 0, 0.05)',
        type: 'line',
        x: 80.5,
        x2: 80.5,
        y: 0.5,
        y2: 80.5,
      },
    ];

    expect(plot.models.plot).toEqual(result);
  });

  it('should be drawn on both sides, when using the center Y-axis', () => {
    plot.render(
      deepMergedCopy(chartState, {
        yCenterAxis: {
          visible: true,
          xAxisHalfSize: 35,
          secondStartX: 45,
          yAxisLabelAnchorPoint: 5,
          yAxisHeight: 80,
        },
      })
    );

    const result = [
      {
        strokeStyle: 'rgba(0, 0, 0, 0.05)',
        type: 'line',
        x: 0.5,
        x2: 0.5,
        y: 0.5,
        y2: 80.5,
      },
      {
        strokeStyle: 'rgba(0, 0, 0, 0.05)',
        type: 'line',
        x: 35.5,
        x2: 35.5,
        y: 0.5,
        y2: 80.5,
      },
      {
        strokeStyle: 'rgba(0, 0, 0, 0.05)',
        type: 'line',
        x: 45.5,
        x2: 45.5,
        y: 0.5,
        y2: 80.5,
      },
      {
        strokeStyle: 'rgba(0, 0, 0, 0.05)',
        type: 'line',
        x: 80.5,
        x2: 80.5,
        y: 0.5,
        y2: 80.5,
      },
      {
        strokeStyle: 'rgba(0, 0, 0, 0.05)',
        type: 'line',
        x: 0.5,
        x2: 35.5,
        y: 0.5,
        y2: 0.5,
      },
      {
        strokeStyle: 'rgba(0, 0, 0, 0.05)',
        type: 'line',
        x: 0.5,
        x2: 35.5,
        y: 80.5,
        y2: 80.5,
      },
      {
        strokeStyle: 'rgba(0, 0, 0, 0.05)',
        type: 'line',
        x: 45.5,
        x2: 80.5,
        y: 0.5,
        y2: 0.5,
      },
      {
        strokeStyle: 'rgba(0, 0, 0, 0.05)',
        type: 'line',
        x: 45.5,
        x2: 80.5,
        y: 80.5,
        y2: 80.5,
      },
    ];
    expect(plot.models.plot).toEqual(result);
  });
});
