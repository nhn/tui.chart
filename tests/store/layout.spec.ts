import layout from '@src/store/layout';
import { BarChartOptions, LineChartOptions } from '@t/options';
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
  'resetButton',
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
    exportMenu: { height: 0, width: 0, x: 190, y: 15 },
    title: { x: 10, y: 15, width: 0, height: 0 },
    yAxisTitle: { width: 0, height: 0, x: 10, y: 15 },
    yAxis: { x: 10, y: 15, width: 11, height: 124 },
    xAxis: { x: 21, y: 139, width: 149, height: 20 },
    xAxisTitle: { x: 21, y: 159, width: 0, height: 0 },
    legend: { x: 180, y: 24, width: 20, height: 104 },
    circleLegend: { height: 124, width: 0, x: 180, y: 15 },
    plot: { x: 21, y: 15, width: 149, height: 124 },
    resetButton: { height: 0, width: 0, x: 0, y: 0 },
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
    xAxis: { x: 21, y: 165, width: 150, height: 20 },
    plot: { x: 21, y: 15, width: 150, height: 150 },
  };

  ['yAxis', 'xAxis', 'plot'].forEach((prop) => {
    it(`should set ${prop} rect for plot size`, () => {
      expect(state.layout[prop]).toEqual(result[prop]);
    });
  });
});

describe('with export menu visible options', () => {
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
    options: { exportMenu: { visible: true } },
  };

  const store = { state } as Store<BarChartOptions>;
  layout.action!.setLayout(store);

  const result = {
    exportMenu: { height: 29, width: 24, x: 166, y: 15 },
    title: { x: 10, y: 15, width: 0, height: 29 },
  };

  ['exportMenu', 'title'].forEach((prop) => {
    it(`should set ${prop} rect`, () => {
      expect(state.layout[prop]).toEqual(result[prop]);
    });
  });
});

describe('with reset button visible options', () => {
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
    layout: { yAxis: {}, xAxis: {}, plot: {}, resetButton: {} },
    options: { series: { zoomable: true } },
  };

  const store = { state } as Store<LineChartOptions>;
  layout.action!.setLayout(store);

  it(`should set resetButton rect`, () => {
    expect(state.layout.resetButton).toEqual({ height: 29, width: 24, x: 132, y: 15 });
  });
});
