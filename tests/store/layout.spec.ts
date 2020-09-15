import layout from '@src/store/layout';
import { BarChartOptions, ColumnLineChartOptions, ColumnLineChartSeriesOptions } from '@t/options';
import Store from '@src/store/store';

const props = [
  'exportMenu',
  'title',
  'yAxisTitle',
  'yAxis',
  'xAxis',
  'xAxisTitle',
  'legend',
  'circleLegend',
  'plot',
];

describe('default layout', () => {
  const state = {
    legend: { visible: true, width: 20, align: 'right' },
    circleLegend: { radius: 0, visible: false, width: 0 },
    chart: { width: 200, height: 200 },
    series: { bar: {} },
    axes: {
      xAxis: {},
      yAxis: {
        labels: ['a', 'b', 'c', 'd'],
      },
    },
    layout: { yAxis: {}, xAxis: {}, plot: {} },
    options: { exportMenu: { visible: false } },
  };

  const store = { state } as Store<BarChartOptions>;
  layout.action!.setLayout(store);

  const result = {
    exportMenu: { height: 0, width: 0, x: 0, y: 0 },
    title: { x: 10, y: 15, width: 0, height: 0 },
    yAxisTitle: { width: 160, height: 0, x: 10, y: 15 },
    yAxis: { x: 10, y: 15, width: 11, height: 124 },
    xAxis: { x: 21, y: 139, width: 149, height: 20 },
    xAxisTitle: { x: 21, y: 159, width: 0, height: 0 },
    legend: { x: 180, y: 24, width: 20, height: 104 },
    circleLegend: { height: 124, width: 0, x: 180, y: 15 },
    plot: { x: 21, y: 15, width: 149, height: 124 },
  };

  props.forEach((prop) => {
    it(`should set ${prop} rect`, () => {
      expect(state.layout[prop]).toEqual(result[prop]);
    });
  });
});

describe('axis size option', () => {
  it('should set yAxis size option', () => {
    const state = {
      legend: { visible: true, width: 20, align: 'right' },
      circleLegend: { radius: 0, visible: false, width: 0 },
      chart: { width: 200, height: 200 },
      series: { bar: {} },
      axes: {
        xAxis: {},
        yAxis: {
          labels: ['a', 'b', 'c', 'd'],
        },
      },
      layout: { yAxis: {}, xAxis: {}, plot: {} },
      options: {
        exportMenu: { visible: false },
        yAxis: { width: 50, height: 100 },
      },
    };

    const store = { state } as Store<BarChartOptions>;

    layout.action!.setLayout(store);

    expect(state.layout.yAxis).toEqual({
      x: 10,
      y: 15,
      width: 50,
      height: 100,
    });
  });

  it('should set xAxis size option', () => {
    const state = {
      legend: { visible: true, width: 20, align: 'right' },
      circleLegend: { radius: 0, visible: false, width: 0 },
      chart: { width: 200, height: 200 },
      series: { bar: {} },
      axes: {
        xAxis: {},
        yAxis: {
          labels: ['a', 'b', 'c', 'd'],
        },
      },
      layout: { yAxis: {}, xAxis: {}, plot: {} },
      options: {
        exportMenu: { visible: false },
        xAxis: { width: 130, height: 100 },
      },
    };

    const store = { state } as Store<BarChartOptions>;

    layout.action!.setLayout(store);

    expect(state.layout.xAxis).toEqual({
      x: 21,
      y: 59,
      width: 130,
      height: 100,
    });
  });

  describe('using secondaryYAxis size option', () => {
    const state = {
      legend: { visible: true, width: 20, align: 'right' },
      circleLegend: { radius: 0, visible: false, width: 0 },
      chart: { width: 200, height: 200 },
      series: { column: {}, line: {} },
      axes: {
        xAxis: { labels: ['a', 'b', 'c', 'd'] },
        yAxis: {
          labels: ['1', '2', '3', '4', '5'],
        },
        secondaryYAxis: {
          labels: ['2', '4', '6', '8', '10'],
        },
      },
      layout: { yAxis: {}, xAxis: {}, plot: {}, secondaryYAxis: {}, secondaryYAxisTitle: {} },
      options: {
        exportMenu: { visible: false },
        yAxis: [
          { width: 25, height: 120, chartType: 'column' },
          { width: 20, height: 120, chartType: 'line' },
        ],
      } as ColumnLineChartSeriesOptions,
    };

    const store = { state } as Store<ColumnLineChartOptions>;

    layout.action!.setLayout(store);

    const result = {
      yAxis: { x: 10, y: 15, width: 25, height: 120 },
      secondaryYAxisTitle: { x: 90, y: 15, width: 80, height: 0 },
      secondaryYAxis: { x: 150, y: 15, width: 20, height: 120 },
    };

    ['yAxis', 'secondaryYAxisTitle', 'secondaryYAxis'].forEach((propName) => {
      it(`should set ${propName} rect`, () => {
        expect(state.layout[propName]).toEqual(result[propName]);
      });
    });
  });
});

describe('only plot size option', () => {
  const state = {
    legend: { visible: true, width: 20, align: 'right' },
    circleLegend: { radius: 0, visible: false, width: 0 },
    chart: { width: 200, height: 200 },
    series: { bar: {} },
    axes: {
      xAxis: {},
      yAxis: {
        labels: ['a', 'b', 'c', 'd'],
      },
    },
    layout: { yAxis: {}, xAxis: {}, plot: {} },
    options: {
      exportMenu: { visible: false },
      plot: { width: 150, height: 150 },
    } as BarChartOptions,
  };

  const store = { state } as Store<BarChartOptions>;

  layout.action!.setLayout(store);

  const result = {
    yAxis: { x: 10, y: 15, width: 11, height: 150 },
    xAxis: { x: 21, y: 165, width: 149, height: 20 },
    plot: { x: 21, y: 15, width: 150, height: 150 },
    secondaryYAxis: { x: 170, y: 15, width: 0, height: 150 },
  };

  ['yAxis', 'xAxis', 'plot', 'secondaryYAxis'].forEach((prop) => {
    it(`should set ${prop} rect for plot size`, () => {
      expect(state.layout[prop]).toEqual(result[prop]);
    });
  });
});
