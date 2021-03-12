import scale from '@src/store/scale';
import Store from '@src/store/store';
import { BarChartOptions, RadarChartOptions, RadialBarChartOptions } from '@t/options';
import { ChartState, DataRange, InitStoreState } from '@t/store/store';

const data = [
  { name: 'han', data: [1, 2, 3] },
  { name: 'cho', data: [4, 5, 6] },
];

describe('Scale Store', () => {
  it('should properly calculated according to the data', () => {
    const state = {
      layout: { plot: { width: 800, height: 500 } },
      series: { bar: { data } },
      stackSeries: {},
      scale: {},
      dataRange: { xAxis: { min: 1, max: 6 } } as DataRange,
    } as ChartState<BarChartOptions>;

    const initStoreState = { series: { bar: data } } as InitStoreState<BarChartOptions>;

    const store = { state, initStoreState } as Store<BarChartOptions>;
    scale.action!.setScale(store);

    expect(state.scale).toEqual({
      xAxis: { limit: { max: 7, min: 0 }, stepSize: 1, stepCount: 6 },
    });
  });

  it('When using percent stack, the scale is calculated as a percent value', () => {
    const state = {
      layout: { plot: { width: 800, height: 500 } },
      series: { bar: { data } },
      stackSeries: {
        bar: {
          stack: {
            type: 'percent',
            connector: true,
          },
        },
      },
      scale: {},
      dataRange: { xAxis: { min: 1, max: 6 } } as DataRange,
    } as ChartState<BarChartOptions>;

    const initStoreState = { series: { bar: data } } as InitStoreState<BarChartOptions>;

    const store = { state, initStoreState } as Store<BarChartOptions>;
    scale.action!.setScale(store);

    expect(state.scale).toEqual({
      xAxis: { limit: { max: 100, min: 0 }, stepSize: 25, stepCount: 5 },
    });
  });

  it('"options.scale.min" Options are properly applied to scale state', () => {
    const state = {
      layout: { plot: { width: 800, height: 500 } },
      series: { bar: { data } },
      stackSeries: {},
      scale: {},
      dataRange: { xAxis: { min: 1, max: 6 } } as DataRange,
      options: { xAxis: { scale: { min: -5 } } },
    } as ChartState<BarChartOptions>;

    const initStoreState = { series: { bar: data } } as InitStoreState<BarChartOptions>;

    const store = { state, initStoreState } as Store<BarChartOptions>;
    scale.action!.setScale(store);

    expect(state.scale).toEqual({
      xAxis: { limit: { max: 7, min: -5 }, stepSize: 1, stepCount: 11 },
    });
  });

  it('"options.scale.max" Options are properly applied to scale state', () => {
    const state = {
      layout: { plot: { width: 800, height: 500 } },
      series: { bar: { data } },
      stackSeries: {},
      scale: {},
      dataRange: { xAxis: { min: 1, max: 6 } } as DataRange,
      options: { xAxis: { scale: { max: 10 } } },
    } as ChartState<BarChartOptions>;

    const initStoreState = { series: { bar: data } } as InitStoreState<BarChartOptions>;

    const store = { state, initStoreState } as Store<BarChartOptions>;
    scale.action!.setScale(store);

    expect(state.scale).toEqual({
      xAxis: { limit: { max: 10, min: 0 }, stepSize: 1, stepCount: 10 },
    });
  });

  it('"options.scale.stepSize" Options are properly applied to scale state', () => {
    const state = {
      layout: { plot: { width: 800, height: 500 } },
      series: { bar: { data } },
      stackSeries: {},
      scale: {},
      dataRange: { xAxis: { min: 1, max: 6 } } as DataRange,
      options: { xAxis: { scale: { stepSize: 5 } } },
    } as ChartState<BarChartOptions>;

    const initStoreState = { series: { bar: data } } as InitStoreState<BarChartOptions>;

    const store = { state, initStoreState } as Store<BarChartOptions>;
    scale.action!.setScale(store);

    expect(state.scale).toEqual({
      xAxis: { limit: { max: 10, min: 0 }, stepSize: 5, stepCount: 2 },
    });
  });

  it('should set verticalAxis, when having a radar chart', () => {
    const state = {
      layout: { plot: { width: 800, height: 800 } },
      series: { radar: { data } },
      stackSeries: {},
      scale: {},
      dataRange: { verticalAxis: { min: 1, max: 6 } } as DataRange,
      options: { verticalAxis: { scale: { stepSize: 5 } } },
    } as ChartState<RadarChartOptions>;

    const initStoreState = { series: { bar: data } } as InitStoreState<BarChartOptions>;

    const store = { state, initStoreState } as Store<BarChartOptions>;
    scale.action!.setScale(store);

    expect(state.scale).toEqual({
      verticalAxis: { limit: { max: 10, min: 0 }, stepSize: 5, stepCount: 2 },
    });
  });

  it('should set circularAxis, when having a radialBar chart', () => {
    const state = {
      layout: { plot: { width: 800, height: 800 } },
      series: { radialBar: { data } },
      stackSeries: {},
      scale: {},
      dataRange: { circularAxis: { min: 1, max: 6 } } as DataRange,
      options: { circularAxis: { scale: { stepSize: 5 } } },
    } as ChartState<RadialBarChartOptions>;

    const initStoreState = { series: { bar: data } } as InitStoreState<BarChartOptions>;

    const store = { state, initStoreState } as Store<BarChartOptions>;
    scale.action!.setScale(store);

    expect(state.scale).toEqual({
      circularAxis: { limit: { max: 10, min: 0 }, stepSize: 5, stepCount: 2 },
    });
  });
});
