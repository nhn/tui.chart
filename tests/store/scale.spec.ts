import scale from '@src/store/scale';
import Store from '@src/store/store';
import { BarChartOptions } from '@t/options';
import { ChartState, DataRange, Layout } from '@t/store/store';

const data = [
  { name: 'han', data: [1, 2, 3] },
  { name: 'cho', data: [4, 5, 6] }
];

describe('Scale Store', () => {
  it('should properly calculated according to the data', () => {
    const state = {
      layout: { plot: { width: 800, height: 500 } } as Layout,
      series: { bar: { data } },
      stackSeries: {},
      scale: {},
      dataRange: { bar: { min: 1, max: 6 } } as DataRange
    } as ChartState<BarChartOptions>;

    const store = { state } as Store<BarChartOptions>;
    scale.action!.setScale(store);

    expect(state.scale).toEqual({
      xAxis: { limit: { max: 6.5, min: 0.5 }, step: 0.5, stepCount: 10 }
    });
  });

  it('When using percent stack, the scale is calculated as a percent value', () => {
    const state = {
      layout: { plot: { width: 800, height: 500 } } as Layout,
      series: { bar: { data } },
      stackSeries: {
        bar: {
          stack: {
            type: 'percent',
            connector: { type: 'solid', color: 'rgba(51, 85, 139, 0,3)', width: 1 }
          }
        }
      },
      scale: {},
      dataRange: { bar: { min: 1, max: 6 } } as DataRange
    } as ChartState<BarChartOptions>;

    const store = { state } as Store<BarChartOptions>;
    scale.action!.setScale(store);

    expect(state.scale).toEqual({
      xAxis: { limit: { max: 100, min: 0 }, step: 25, stepCount: 5 }
    });
  });

  it('"options.scale.min" Options are properly applied to scale state', () => {
    const state = {
      layout: { plot: { width: 800, height: 500 } } as Layout,
      series: { bar: { data } },
      stackSeries: {},
      scale: {},
      dataRange: { bar: { min: 1, max: 6 } } as DataRange,
      options: { xAxis: { scale: { min: -5 } } }
    } as ChartState<BarChartOptions>;

    const store = { state } as Store<BarChartOptions>;
    scale.action!.setScale(store);

    expect(state.scale).toEqual({
      xAxis: { limit: { max: 7, min: -5 }, step: 1, stepCount: 11 }
    });
  });

  it('"options.scale.max" Options are properly applied to scale state.', () => {
    const state = {
      layout: { plot: { width: 800, height: 500 } } as Layout,
      series: { bar: { data } },
      stackSeries: {},
      scale: {},
      dataRange: { bar: { min: 1, max: 6 } } as DataRange,
      options: { xAxis: { scale: { max: 10 } } }
    } as ChartState<BarChartOptions>;

    const store = { state } as Store<BarChartOptions>;
    scale.action!.setScale(store);

    expect(state.scale).toEqual({
      xAxis: { limit: { max: 10, min: 0 }, step: 1, stepCount: 10 }
    });
  });
});
