import axes from '@src/store/axes';
import Store from '@src/store/store';
import { LineChartOptions, BarChartOptions, ColumnChartOptions } from '@t/options';
import { ChartState, Scale, StateFunc, Options, InitStoreState } from '@t/store/store';
import { deepMergedCopy } from '@src/helpers/utils';
import * as Calculator from '@src/helpers/calculator';

const notify = () => {};

const fontTheme = {
  fontSize: 11,
  fontFamily: 'Arial',
  fontWeight: 'normal',
  color: '#333333',
};

describe('Axes Store module', () => {
  const axesStateFunc = axes.state as StateFunc;

  describe('state', () => {
    it('could use with options', () => {
      const data = [
        { name: 'han', data: [1, 4] },
        { name: 'cho', data: [5, 2] },
      ];

      const state = {
        chart: { width: 120, height: 120 },
        layout: {
          plot: { width: 100, height: 150, x: 30, y: 10 },
          yAxis: { x: 10, y: 10, width: 10, height: 80 },
          xAxis: { x: 10, y: 10, width: 80, height: 10 },
        },
        scale: { yAxis: { limit: { min: 0, max: 5 }, stepSize: 1, stepCount: 1 } } as Scale,
        series: { line: { data } },
        axes: {
          xAxis: {},
          yAxis: {},
        },
        categories: ['A', 'B'],
        options: {
          xAxis: { tick: { interval: 2 }, label: { interval: 3 } },
          yAxis: { tick: { interval: 4 }, label: { interval: 5 } },
        },
        theme: {
          xAxis: { title: { ...fontTheme }, label: { ...fontTheme } },
          yAxis: { title: { ...fontTheme }, label: { ...fontTheme } },
        },
      } as ChartState<LineChartOptions>;

      jest.spyOn(Calculator, 'getTextWidth').mockReturnValue(11);
      jest.spyOn(Calculator, 'getTextHeight').mockReturnValue(11);

      const initStoreState = { series: { line: data } } as InitStoreState<LineChartOptions>;

      const store = { state, initStoreState } as Store<Options>;
      axes.action!.setAxesData.call({ notify }, store);

      expect(state.axes).toEqual({
        xAxis: {
          isLabelAxis: true,
          labelDistance: 100,
          labelInterval: 3,
          labels: ['A', 'B'],
          viewLabels: [{ text: 'A', offsetPos: 0 }],
          pointOnColumn: false,
          tickCount: 2,
          rectResponderCount: 2,
          tickDistance: 100,
          tickInterval: 2,
          maxLabelWidth: 11,
          maxLabelHeight: 11,
          maxHeight: 26.5,
          offsetY: 15.5,
          needRotateLabel: false,
          radian: 0,
          rotationHeight: 11,
        },
        yAxis: {
          isLabelAxis: false,
          labelInterval: 5,
          labels: ['0', '1', '2', '3', '4', '5'],
          viewLabels: [
            { text: '5', offsetPos: 0 },
            { text: '0', offsetPos: 150 },
          ],
          pointOnColumn: false,
          tickCount: 6,
          tickDistance: 25,
          tickInterval: 4,
          zeroPosition: 150,
          maxLabelWidth: 11,
          maxLabelHeight: 11,
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
          xAxis: {},
          yAxis: {},
          centerYAxis: {},
        },
      });
    });
  });

  it('should be setAxesData with state values', () => {
    const data = [
      { name: 'han', data: [1, 4] },
      { name: 'cho', data: [5, 2] },
    ];

    const state = {
      chart: { width: 120, height: 120 },
      layout: {
        plot: { width: 100, height: 150, x: 30, y: 10 },
        yAxis: { x: 10, y: 10, width: 10, height: 80 },
        xAxis: { x: 10, y: 10, width: 80, height: 10 },
      },
      scale: { yAxis: { limit: { min: 0, max: 5 }, stepSize: 1, stepCount: 1 } } as Scale,
      series: { line: { data } },
      axes: {
        xAxis: {},
        yAxis: {},
      },
      categories: ['A', 'B'],
      options: {},
      theme: {
        xAxis: { title: { ...fontTheme }, label: { ...fontTheme } },
        yAxis: { title: { ...fontTheme }, label: { ...fontTheme } },
      },
    } as ChartState<LineChartOptions>;

    const initStoreState = { series: { line: data } } as InitStoreState<LineChartOptions>;

    const store = { state, initStoreState } as Store<LineChartOptions>;
    axes.action!.setAxesData.call({ notify }, store);

    expect(state.axes).toEqual({
      xAxis: {
        isLabelAxis: true,
        labels: ['A', 'B'],
        viewLabels: [
          { text: 'A', offsetPos: 0 },
          { text: 'B', offsetPos: 100 },
        ],
        pointOnColumn: false,
        tickCount: 2,
        tickDistance: 100,
        labelDistance: 100,
        labelInterval: 1,
        rectResponderCount: 2,
        tickInterval: 1,
        maxLabelWidth: 11,
        maxLabelHeight: 11,
        maxHeight: 26.5,
        offsetY: 15.5,
        needRotateLabel: false,
        radian: 0,
        rotationHeight: 11,
      },
      yAxis: {
        isLabelAxis: false,
        labels: ['0', '1', '2', '3', '4', '5'],
        viewLabels: [
          { text: '5', offsetPos: 0 },
          { text: '4', offsetPos: 30 },
          { text: '3', offsetPos: 60 },
          { text: '2', offsetPos: 90 },
          { text: '1', offsetPos: 120 },
          { text: '0', offsetPos: 150 },
        ],
        pointOnColumn: false,
        tickCount: 6,
        tickDistance: 25,
        zeroPosition: 150,
        labelInterval: 1,
        tickInterval: 1,
        maxLabelWidth: 11,
        maxLabelHeight: 11,
      },
    });
  });

  it('should be make properly datetime category label', () => {
    const data = [
      { name: 'han', data: [1, 4] },
      { name: 'cho', data: [5, 2] },
    ];

    const state = {
      chart: { width: 120, height: 120 },
      layout: {
        plot: { width: 100, height: 150, x: 30, y: 10 },
        yAxis: { x: 10, y: 10, width: 10, height: 80 },
        xAxis: { x: 10, y: 10, width: 80, height: 10 },
      },
      scale: { yAxis: { limit: { min: 0, max: 5 }, stepSize: 1, stepCount: 1 } } as Scale,
      series: { line: { data } },
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
      theme: {
        xAxis: { title: { ...fontTheme }, label: { ...fontTheme } },
        yAxis: { title: { ...fontTheme }, label: { ...fontTheme } },
      },
    } as ChartState<LineChartOptions>;

    const initStoreState = { series: { line: data } } as InitStoreState<LineChartOptions>;

    const store = { state, initStoreState } as Store<LineChartOptions>;
    axes.action!.setAxesData.call({ notify }, store);

    expect(state.axes.xAxis.labels).toEqual(['20-08-08', '20-08-09']);
  });
});

describe('x Axis stepSize is auto', () => {
  const categories = [
    'aaaaaaa',
    'bbbbbbb',
    'ccccccc',
    'ddddddd',
    'eeeeeee',
    'fffffff',
    'ggggggg',
    'hhhhhhh',
    'iiiiiii',
    'jjjjjjj',
    'kkkkkkk',
    'lllllll',
    'mmmmmmm',
    'nnnnnnn',
    'ooooooo',
    'ppppppp',
    'qqqqqqq',
    'rrrrrrr',
    'sssssss',
    'ttttttt',
  ];

  const data = [
    { name: 'han', data: [1, 4] },
    { name: 'cho', data: [5, 2] },
  ];

  const state = {
    chart: { width: 520, height: 120 },
    layout: {
      plot: { width: 500, height: 150, x: 30, y: 10 },
      yAxis: { x: 10, y: 10, width: 10, height: 80 },
      xAxis: { x: 10, y: 10, width: 480, height: 10 },
    },
    scale: { yAxis: { limit: { min: 0, max: 5 }, stepSize: 1, stepCount: 1 } } as Scale,
    series: { line: { data } },
    axes: {
      xAxis: {},
      yAxis: {},
    },
    rawCategories: categories,
    categories,
    options: {
      xAxis: { scale: { stepSize: 'auto' } },
    },
    theme: {
      xAxis: { title: { ...fontTheme }, label: { ...fontTheme } },
      yAxis: { title: { ...fontTheme }, label: { ...fontTheme } },
    },
  } as ChartState<Options>;

  it('should automatically adjusts the interval according to the width', () => {
    const initStoreState = { series: { line: data } } as InitStoreState<LineChartOptions>;
    const store = { state, initStoreState } as Store<Options>;
    jest.spyOn(Calculator, 'getTextWidth').mockReturnValue(49);
    axes.action!.setAxesData.call({ notify }, store);

    expect(store.state.axes.xAxis).toMatchObject({ tickInterval: 4, labelInterval: 4 });
  });

  it('should ignore auto options when the interval attribute is exist', () => {
    const initStoreState = { series: { line: data } } as InitStoreState<LineChartOptions>;
    const changedState = deepMergedCopy(state, { options: { xAxis: { label: { interval: 3 } } } });
    const store = { state: changedState, initStoreState } as Store<Options>;
    axes.action!.setAxesData.call({ notify }, store);

    expect(store.state.axes.xAxis).toMatchObject({ tickInterval: 1, labelInterval: 3 });
  });
});

describe('pointOnColumn state is properly created', () => {
  it('[bar chart] xAxis.pointOnColumn: false, yAxis.pointOnColumn: true', () => {
    const data = [
      { name: 'han', data: [1, 4] },
      { name: 'cho', data: [5, 2] },
    ];

    const state = {
      chart: { width: 120, height: 120 },
      layout: {
        plot: { width: 100, height: 150, x: 30, y: 10 },
        yAxis: { x: 10, y: 10, width: 10, height: 80 },
        xAxis: { x: 10, y: 10, width: 80, height: 10 },
      },
      scale: { xAxis: { limit: { min: 0, max: 5 }, stepSize: 1, stepCount: 1 } } as Scale,
      series: { bar: { data } },
      axes: {
        xAxis: {},
        yAxis: {},
      },
      categories: ['A', 'B'],
      options: {},
      theme: {
        xAxis: { title: { ...fontTheme }, label: { ...fontTheme } },
        yAxis: { title: { ...fontTheme }, label: { ...fontTheme } },
      },
    } as ChartState<BarChartOptions>;

    const initStoreState = { series: { bar: data } } as InitStoreState<BarChartOptions>;
    const store = { state, initStoreState } as Store<BarChartOptions>;
    axes.action!.setAxesData.call({ notify }, store);

    expect(store.state.axes).toMatchObject({
      xAxis: { pointOnColumn: false },
      yAxis: { pointOnColumn: true },
    });
  });

  it('[column chart] xAxis.pointOnColumn: true, yAxis.pointOnColumn: false', () => {
    const data = [
      { name: 'han', data: [1, 4] },
      { name: 'cho', data: [5, 2] },
    ];

    const state = {
      chart: { width: 120, height: 120 },
      layout: {
        plot: { width: 100, height: 150, x: 30, y: 10 },
        yAxis: { x: 10, y: 10, width: 10, height: 80 },
        xAxis: { x: 10, y: 10, width: 80, height: 10 },
      },
      scale: { yAxis: { limit: { min: 0, max: 5 }, stepSize: 1, stepCount: 1 } } as Scale,
      series: { column: { data } },
      axes: {
        xAxis: {},
        yAxis: {},
      },
      categories: ['A', 'B'],
      options: {},
      theme: {
        xAxis: { title: { ...fontTheme }, label: { ...fontTheme } },
        yAxis: { title: { ...fontTheme }, label: { ...fontTheme } },
      },
    } as ChartState<ColumnChartOptions>;

    const initStoreState = { series: { line: data } } as InitStoreState<BarChartOptions>;
    const store = { state, initStoreState } as Store<ColumnChartOptions>;
    axes.action!.setAxesData.call({ notify }, store);

    expect(store.state.axes).toMatchObject({
      xAxis: { pointOnColumn: true },
      yAxis: { pointOnColumn: false },
    });
  });
});
