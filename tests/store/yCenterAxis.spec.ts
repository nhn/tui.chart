import yCenterAxis from '@src/store/yCenterAxis';
import layout from '@src/store/layout';
import { StateFunc, ChartState } from '@t/store/store';
import { BarChartOptions } from '@t/options';
import Store from '@src/store/store';

const data = [
  { name: 'han', data: [1, 2, 3], color: '#aaaaaa' },
  { name: 'cho', data: [4, 5, 6], color: '#bbbbbb' },
];

describe('Y Center Axis Store module', () => {
  const stateFunc = yCenterAxis.state as StateFunc;

  it('should only have default falsy value of visible property', () => {
    expect(stateFunc({ series: {}, options: {} })).toEqual({
      yCenterAxis: {
        visible: false,
      },
    });
  });

  it("should be stored the values, when diverging is enabled and y-axis alignment is 'center' on bar series", () => {
    expect(
      stateFunc({
        series: { bar: { ...data } },
        options: { yAxis: { align: 'center' }, series: { diverging: true } },
      })
    ).toEqual({
      yCenterAxis: {
        visible: true,
      },
    });
  });

  it('should dispatch layout action, if visible is trushy', () => {
    const dispatch = jest.fn();

    stateFunc({
      series: { bar: { ...data } },
      options: { yAxis: { align: 'center' }, series: { diverging: true } },
    });

    const state = {
      layout: {
        xAxis: { x: 10, y: 10, width: 80, height: 10 },
        yAxis: { x: 10, y: 10, width: 10, height: 80 },
      },
      yCenterAxis: {
        visible: true,
      },
    } as ChartState<BarChartOptions>;

    const store = { state } as Store<BarChartOptions>;

    jest.useFakeTimers();

    yCenterAxis.action!.setYCenterAxis.call({ dispatch }, store);

    jest.advanceTimersByTime(0);

    jest.clearAllTimers();

    expect(dispatch.mock.calls[0]).toEqual(['setLayout']);
  });

  it('should calculate values for rending center y-aixs', () => {
    const dispatch = jest.fn();

    stateFunc({
      series: { bar: { ...data } },
      options: { yAxis: { align: 'center' }, series: { diverging: true } },
    });

    const state = {
      layout: {
        xAxis: { x: 10, y: 10, width: 80, height: 10 },
        yAxis: { x: 10, y: 10, width: 10, height: 80 },
      },
      yCenterAxis: {
        visible: true,
      },
    } as ChartState<BarChartOptions>;

    const store = { state } as Store<BarChartOptions>;

    yCenterAxis.action!.setYCenterAxis.call({ dispatch }, store);

    expect(store.state.yCenterAxis).toEqual({
      visible: true,
      xAxisHalfSize: 35,
      secondStartX: 45,
      yAxisLabelAnchorPoint: 5,
      yAxisHeight: 80,
    });
  });
});
