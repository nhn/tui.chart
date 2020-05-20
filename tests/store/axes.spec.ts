import axes from '@src/store/axes';

import Store from '@src/store/store';
import { LineChartOptions } from '@t/options';
import { ChartState, Layout, Scale } from '@t/store/store';

describe('LineChart Axes Store', () => {
  it('initialize', () => {
    const state = {
      axes: { xAxis: {}, yAxis: {} }
    } as ChartState<LineChartOptions>;

    axes.initialize!(state, {});

    expect(state.axes).toEqual({
      xAxis: { labelInterval: 1, tickInterval: 1 },
      yAxis: { labelInterval: 1, tickInterval: 1 }
    });
  });

  it('initialize with options', () => {
    const state = {
      axes: { xAxis: {}, yAxis: {} }
    } as ChartState<LineChartOptions>;
    const options = {
      xAxis: { tick: { interval: 2 }, label: { interval: 3 } },
      yAxis: { tick: { interval: 4 }, label: { interval: 5 } }
    } as LineChartOptions;

    axes.initialize!(state, options);

    expect(state.axes).toEqual({
      xAxis: { tickInterval: 2, labelInterval: 3 },
      yAxis: { tickInterval: 4, labelInterval: 5 }
    });
  });

  it('should be setAxesData with state values', () => {
    const state = {
      chart: { width: 120, height: 120 },
      layout: { plot: { width: 100, height: 150, x: 30, y: 10 } } as Layout,
      scale: { yAxis: { limit: { min: 0, max: 5 }, step: 1, stepCount: 1 } } as Scale,
      series: {
        line: {
          data: [
            { name: 'han', data: [1, 4] },
            { name: 'cho', data: [5, 2] }
          ]
        }
      },
      axes: {
        xAxis: {},
        yAxis: {}
      },
      categories: ['A', 'B'],
      options: {}
    } as ChartState<LineChartOptions>;

    const store = { state } as Store<LineChartOptions>;
    axes.action!.setAxesData(store);

    expect(state.axes).toEqual({
      xAxis: {
        isLabelAxis: true,
        labels: ['A', 'B'],
        pointOnColumn: false,
        tickCount: 2,
        tickDistance: 100
      },
      yAxis: {
        isLabelAxis: false,
        labels: ['0', '1', '2', '3', '4', '5'],
        pointOnColumn: false,
        tickCount: 6,
        tickDistance: 25
      }
    });
  });
});

describe('pointOnColumn state is properly created', () => {
  it('[bar chart] xAxis.pointOnColumn: false, yAxis.pointOnColumn: true', () => {
    const state = {
      chart: { width: 120, height: 120 },
      layout: { plot: { width: 100, height: 150, x: 30, y: 10 } } as Layout,
      scale: { xAxis: { limit: { min: 0, max: 5 }, step: 1, stepCount: 1 } } as Scale,
      series: {
        bar: {
          data: [
            { name: 'han', data: [1, 4] },
            { name: 'cho', data: [5, 2] }
          ]
        }
      },
      axes: {
        xAxis: {},
        yAxis: {}
      },
      categories: ['A', 'B'],
      options: {}
    } as ChartState<LineChartOptions>;

    const store = { state } as Store<LineChartOptions>;
    axes.action!.setAxesData(store);

    expect(store.state.axes).toMatchObject({
      xAxis: { pointOnColumn: false },
      yAxis: { pointOnColumn: true }
    });
  });

  it('[column chart] xAxis.pointOnColumn: true, yAxis.pointOnColumn: false', () => {
    const state = {
      chart: { width: 120, height: 120 },
      layout: { plot: { width: 100, height: 150, x: 30, y: 10 } } as Layout,
      scale: { yAxis: { limit: { min: 0, max: 5 }, step: 1, stepCount: 1 } } as Scale,
      series: {
        column: {
          data: [
            { name: 'han', data: [1, 4] },
            { name: 'cho', data: [5, 2] }
          ]
        }
      },
      axes: {
        xAxis: {},
        yAxis: {}
      },
      categories: ['A', 'B'],
      options: {}
    } as ChartState<LineChartOptions>;

    const store = { state } as Store<LineChartOptions>;
    axes.action!.setAxesData(store);

    expect(store.state.axes).toMatchObject({
      xAxis: { pointOnColumn: true },
      yAxis: { pointOnColumn: false }
    });
  });
});
