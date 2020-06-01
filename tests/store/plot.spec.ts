import plot from '@src/store/plot';

import Store from '@src/store/store';
import { BarChartOptions, LineChartOptions } from '@t/options';
import { ChartState, Scale, PlotLine } from '@t/store/store';

describe('Plot Store', () => {
  it('should add a zero line, if it is a box type chart and has a negative value', () => {
    const state = {
      chart: { width: 120, height: 120 },
      layout: { plot: { width: 100, height: 150, x: 30, y: 10 } },
      scale: { xAxis: { limit: { min: 0, max: 5 }, stepSize: 1, stepCount: 1 } } as Scale,
      series: {
        bar: {
          data: [
            { name: 'han', data: [-1, -2, 0] },
            { name: 'cho', data: [1, 2, -3] },
          ],
        },
      },
      axes: {
        xAxis: {
          labels: ['-3', '-2', '-1', '0', '1', '2', '3'],
        },
        yAxis: {},
      },
      categories: ['A', 'B'],
      options: {},
      plot: {},
    } as ChartState<BarChartOptions>;

    const store = { state } as Store<BarChartOptions>;
    plot.action!.setPlot(store);

    const zeroLine: PlotLine = {
      color: 'rgba(0, 0, 0, 0.5)',
      value: 0,
      vertical: true,
    };
    expect(store.state.plot.lines).toMatchObject([zeroLine]);
  });

  it('should not be added zero line, if it is not a box type chart', () => {
    const state = {
      chart: { width: 120, height: 120 },
      layout: { plot: { width: 100, height: 150, x: 30, y: 10 } },
      scale: { xAxis: { limit: { min: 0, max: 5 }, stepSize: 1, stepCount: 1 } } as Scale,
      series: {
        line: {
          data: [
            { name: 'han', data: [-1, -2, 0] },
            { name: 'cho', data: [1, 2, -3] },
          ],
        },
      },
      axes: {
        xAxis: {},
        yAxis: {
          labels: ['-3', '-2', '-1', '0', '1', '2', '3'],
        },
      },
      categories: ['A', 'B'],
      options: {},
      plot: {},
    } as ChartState<LineChartOptions>;

    const store = { state } as Store<LineChartOptions>;
    plot.action!.setPlot(store);

    expect(store.state.plot.lines).toMatchObject([]);
  });
});
