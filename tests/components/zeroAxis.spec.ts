import ZeroAxis from '@src/component/zeroAxis';
import Store from '@src/store/store';
import EventEmitter from '@src/eventEmitter';
import { BarChartOptions } from '@t/options';

let plotAxis;
const seriesData = [
  { name: 'han', data: [-1, -2, 0] },
  { name: 'cho', data: [1, 2, -3] },
];
const chartState = {
  chart: { width: 120, height: 120 },
  layout: { plot: { width: 100, height: 150, x: 30, y: 10 } },
  scale: { xAxis: { limit: { min: 0, max: 5 }, stepSize: 1, stepCount: 1 } },
  series: {
    bar: {
      data: seriesData,
      seriesCount: seriesData.length,
      seriesGroupCount: seriesData[0].data.length,
    },
  },
  axes: {
    xAxis: {
      zeroPosition: 50,
    },
    yAxis: {},
  },
  categories: ['A', 'B'],
  options: {},
  plot: {},
};
describe('PlotAxis', () => {
  beforeEach(() => {
    plotAxis = new ZeroAxis({
      store: {} as Store<BarChartOptions>,
      eventBus: new EventEmitter(),
    });
  });

  it('should add a zero line, if it is a box type chart and has a negative value', () => {
    plotAxis.render(chartState);

    expect(plotAxis.models).toEqual([
      {
        type: 'line',
        x: 50.5,
        x2: 50.5,
        y: 0.5,
        y2: 150.5,
        strokeStyle: 'rgba(0, 0, 0, 0.5)',
      },
    ]);
  });

  it("shouldn't render the zero line, if there is no negative value on the value axis", () => {
    const state = {
      chart: { width: 120, height: 120 },
      layout: { plot: { width: 100, height: 150, x: 30, y: 10 } },
      scale: { xAxis: { limit: { min: 1, max: 5 }, stepSize: 1, stepCount: 1 } },
      series: {
        bar: {
          data: [
            { name: 'han', data: [1, 2, 3] },
            { name: 'cho', data: [2, 4, 8] },
          ],
        },
      },
      axes: {
        yAxis: {},
        xAxis: {
          tickCount: 9,
          labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8'],
        },
      },
      categories: ['A', 'B'],
      options: {},
      plot: {},
    };

    plotAxis.render(state);

    expect(plotAxis.models).toEqual([]);
  });
});
