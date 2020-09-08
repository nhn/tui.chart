import axes from '@src/store/axes';

import Store from '@src/store/store';
import { LineChartOptions, BarChartOptions, ColumnChartOptions } from '@t/options';
import { ChartState, Scale, StateFunc, Options } from '@t/store/store';

const notify = () => {};

describe('Axes Store module', () => {
  const axesStateFunc = axes.state as StateFunc;

  describe('state', () => {
    it('should make intervals', () => {
      expect(axesStateFunc({ series: {}, options: {} })).toEqual({
        axes: {
          xAxis: { labelInterval: 1, tickInterval: 1 },
          yAxis: { labelInterval: 1, tickInterval: 1 },
        },
      });
    });

    it('could use with options', () => {
      const options = {
        xAxis: { tick: { interval: 2 }, label: { interval: 3 } },
        yAxis: { tick: { interval: 4 }, label: { interval: 5 } },
      } as LineChartOptions;

      expect(axesStateFunc({ series: {}, options })).toEqual({
        axes: {
          xAxis: { tickInterval: 2, labelInterval: 3 },
          yAxis: { tickInterval: 4, labelInterval: 5 },
        },
      });
    });

    it("should be stored the values, when diverging is enabled and y-axis alignment is 'center' on bar series", () => {
      const data = [
        { name: 'han', data: [1, 2, 3], rawData: [1, 2, 3], color: '#aaaaaa' },
        { name: 'cho', data: [4, 5, 6], rawData: [4, 5, 6], color: '#bbbbbb' },
      ];

      const series = { bar: { ...data } };
      const options = {
        yAxis: { align: 'center' },
        series: { diverging: true },
      } as BarChartOptions;

      expect(axesStateFunc({ series, options })).toEqual({
        axes: {
          xAxis: { tickInterval: 1, labelInterval: 1 },
          yAxis: { tickInterval: 1, labelInterval: 1 },
          centerYAxis: {},
        },
      });
    });
  });

  it('should be setAxesData with state values', () => {
    const state = {
      chart: { width: 120, height: 120 },
      layout: {
        plot: { width: 100, height: 150, x: 30, y: 10 },
        yAxis: { x: 10, y: 10, width: 10, height: 80 },
        xAxis: { x: 10, y: 10, width: 80, height: 10 },
      },
      scale: { yAxis: { limit: { min: 0, max: 5 }, stepSize: 1, stepCount: 1 } } as Scale,
      series: {
        line: {
          data: [
            { name: 'han', data: [1, 4] },
            { name: 'cho', data: [5, 2] },
          ],
        },
      },
      axes: {
        xAxis: {},
        yAxis: {},
      },
      categories: ['A', 'B'],
      options: {},
    } as ChartState<LineChartOptions>;

    const store = { state } as Store<LineChartOptions>;
    axes.action!.setAxesData.call({ notify }, store);

    expect(state.axes).toEqual({
      xAxis: {
        isLabelAxis: true,
        labels: ['A', 'B'],
        pointOnColumn: false,
        tickCount: 2,
        tickDistance: 100,
        labelDistance: 100,
      },
      yAxis: {
        isLabelAxis: false,
        labels: ['0', '1', '2', '3', '4', '5'],
        pointOnColumn: false,
        tickCount: 6,
        tickDistance: 25,
        zeroPosition: 150,
      },
    });
  });

  it('should be make properly datetime category label', () => {
    const state = {
      chart: { width: 120, height: 120 },
      layout: {
        plot: { width: 100, height: 150, x: 30, y: 10 },
        yAxis: { x: 10, y: 10, width: 10, height: 80 },
        xAxis: { x: 10, y: 10, width: 80, height: 10 },
      },
      scale: { yAxis: { limit: { min: 0, max: 5 }, stepSize: 1, stepCount: 1 } } as Scale,
      series: {
        line: {
          data: [
            { name: 'han', data: [1, 4] },
            { name: 'cho', data: [5, 2] },
          ],
        },
      },
      axes: {
        xAxis: {},
        yAxis: {},
      },
      categories: ['2020/08/08', '2020/08/09'],
      options: {
        xAxis: {
          date: {
            format: 'yy-MM-DD',
          },
        },
      },
    } as ChartState<LineChartOptions>;

    const store = { state } as Store<LineChartOptions>;
    axes.action!.setAxesData.call({ notify }, store);

    expect(state.axes.xAxis.labels).toEqual(['20-08-08', '20-08-09']);
  });

  describe('when chart has radar series', () => {
    it('should be stored the inital radialAxis property', () => {
      const data = [
        { name: 'han', data: [1, 2, 3], rawData: [1, 2, 3], color: '#aaaaaa' },
        { name: 'cho', data: [4, 5, 6], rawData: [4, 5, 6], color: '#bbbbbb' },
      ];

      const series = { radar: { ...data } };
      const options = {} as Options;

      expect(axesStateFunc({ series, options })).toEqual({
        axes: {
          xAxis: { tickInterval: 1, labelInterval: 1 },
          yAxis: { tickInterval: 1, labelInterval: 1 },
          radialAxis: {},
        },
      });
    });

    it('should be set radar axis data', () => {
      const state = {
        chart: { width: 210, height: 210 },
        layout: {
          plot: { width: 200, height: 200, x: 10, y: 10 },
          yAxis: { x: 10, y: 10, width: 10, height: 10 },
          xAxis: { x: 10, y: 10, width: 10, height: 10 },
        },
        scale: { yAxis: { limit: { min: 1, max: 8 }, stepSize: 1, stepCount: 1 } } as Scale,
        series: {
          radar: {
            data: [
              { name: 'han', data: [1, 3, 5, 7] },
              { name: 'cho', data: [2, 4, 6, 8] },
            ],
          },
        },
        axes: {
          xAxis: {},
          yAxis: {},
          radialAxis: {},
        },
        categories: ['A', 'B', 'C', 'D'],
        options: {},
      } as ChartState<Options>;

      const store = { state } as Store<Options>;
      axes.action!.setAxesData.call({ notify }, store);

      expect(store.state.axes.radialAxis).toMatchObject({
        labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
        axisSize: 50,
        centerX: 100,
        centerY: 100,
      });
    });
  });
});

describe('pointOnColumn state is properly created', () => {
  it('[bar chart] xAxis.pointOnColumn: false, yAxis.pointOnColumn: true', () => {
    const state = {
      chart: { width: 120, height: 120 },
      layout: {
        plot: { width: 100, height: 150, x: 30, y: 10 },
        yAxis: { x: 10, y: 10, width: 10, height: 80 },
        xAxis: { x: 10, y: 10, width: 80, height: 10 },
      },
      scale: { xAxis: { limit: { min: 0, max: 5 }, stepSize: 1, stepCount: 1 } } as Scale,
      series: {
        bar: {
          data: [
            { name: 'han', data: [1, 4] },
            { name: 'cho', data: [5, 2] },
          ],
        },
      },
      axes: {
        xAxis: {},
        yAxis: {},
      },
      categories: ['A', 'B'],
      options: {},
    } as ChartState<BarChartOptions>;

    const store = { state } as Store<BarChartOptions>;
    axes.action!.setAxesData.call({ notify }, store);

    expect(store.state.axes).toMatchObject({
      xAxis: { pointOnColumn: false },
      yAxis: { pointOnColumn: true },
    });
  });

  it('[column chart] xAxis.pointOnColumn: true, yAxis.pointOnColumn: false', () => {
    const state = {
      chart: { width: 120, height: 120 },
      layout: {
        plot: { width: 100, height: 150, x: 30, y: 10 },
        yAxis: { x: 10, y: 10, width: 10, height: 80 },
        xAxis: { x: 10, y: 10, width: 80, height: 10 },
      },
      scale: { yAxis: { limit: { min: 0, max: 5 }, stepSize: 1, stepCount: 1 } } as Scale,

      series: {
        column: {
          data: [
            { name: 'han', data: [1, 4] },
            { name: 'cho', data: [5, 2] },
          ],
        },
      },
      axes: {
        xAxis: {},
        yAxis: {},
      },
      categories: ['A', 'B'],
      options: {},
    } as ChartState<ColumnChartOptions>;

    const store = { state } as Store<ColumnChartOptions>;
    axes.action!.setAxesData.call({ notify }, store);

    expect(store.state.axes).toMatchObject({
      xAxis: { pointOnColumn: true },
      yAxis: { pointOnColumn: false },
    });
  });
});
