import BoxPlotSeries from '@src/component/boxPlotSeries';
import Store from '@src/store/store';
import EventEmitter from '@src/eventEmitter';
import { Options } from '@t/store/store';

let boxPlotSeries;

const seriesData = [
  {
    name: 'han',
    data: [
      [1, 2.5, 3, 5, 7.5],
      [2, 3, 4, 6, 8],
    ],
    outliers: [
      [0, 8],
      [1, 10],
    ],
    color: '#aaaaaa',
  },
  {
    name: 'cho',
    data: [
      [2, 4.5, 6, 9, 10],
      [3, 5, 7.5, 8, 9],
    ],
    outliers: [[1, 10]],
    color: '#bbbbbb',
  },
];

const chartState = {
  chart: { width: 120, height: 120 },
  layout: {
    xAxis: { x: 10, y: 80, width: 80, height: 10 },
    yAxis: { x: 10, y: 10, width: 10, height: 80 },
    plot: { width: 100, height: 100, x: 10, y: 10 },
  },
  scale: { yAxis: { limit: { min: 0, max: 10 }, stepSize: 1, stepCount: 1 } },
  series: {
    boxPlot: {
      data: seriesData,
    },
  },
  axes: {
    xAxis: {
      pointOnColumn: true,
      tickDistance: 40,
    },
  },
  categories: ['A', 'B'],
  options: {},
  legend: {
    data: [
      { label: 'han', active: true, checked: true },
      { label: 'cho', active: true, checked: true },
    ],
  },
};

describe('boxplot series', () => {
  beforeEach(() => {
    boxPlotSeries = new BoxPlotSeries({
      store: {} as Store<Options>,
      eventBus: new EventEmitter(),
    });

    boxPlotSeries.render(chartState);
  });

  const result = {
    models: {},
    responders: {},
  };

  ['models'].forEach((modelName) => {
    it(`should make ${modelName} properly when calling render`, () => {
      expect(boxPlotSeries[modelName]).toEqual(result[modelName]);
    });
  });
});
