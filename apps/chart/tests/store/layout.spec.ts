import layout from '@src/store/layout';
import {
  BarChartOptions,
  ColumnLineChartOptions,
  ColumnLineChartSeriesOptions,
  LineChartOptions,
} from '@t/options';
import Store from '@src/store/store';

const props = [
  'chart',
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

const defaultTheme = {
  title: {
    fontSize: 18,
    fontFamily: 'Arial',
    fontWeight: 200,
    color: '#333333',
  },
  xAxis: {
    title: {
      fontSize: 11,
      fontFamily: 'Arial',
      fontWeight: 700,
      color: '#bbbbbb',
    },
  },
  yAxis: {
    title: {
      fontSize: 11,
      fontFamily: 'Arial',
      fontWeight: 700,
      color: '#bbbbbb',
    },
  },
  legend: {
    label: {
      fontSize: 11,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      color: '#333333',
    },
  },
};

describe('default layout', () => {
  const state = {
    legend: { visible: true, width: 20, height: 104, align: 'right' },
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
    theme: defaultTheme,
  };

  const store = { state } as Store<BarChartOptions>;
  layout.action!.setLayout(store);

  const result = {
    chart: { x: 0, y: 0, width: 200, height: 200 },
    exportMenu: { height: 0, width: 0, x: 190, y: 15 },
    title: { x: 10, y: 15, width: 0, height: 0 },
    yAxisTitle: { width: 160, height: 0, x: 10, y: 15 },
    yAxis: { x: 10, y: 15, width: 40, height: 124 },
    xAxis: { x: 50, y: 139, width: 120, height: 20 },
    xAxisTitle: { x: 50, y: 159, width: 0, height: 0 },
    legend: { x: 180, y: 24, width: 20, height: 104 },
    circleLegend: { height: 124, width: 0, x: 180, y: 15 },
    plot: { x: 50, y: 15, width: 120, height: 124 },
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
      legend: { visible: true, width: 20, height: 104, align: 'right' },
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
      theme: defaultTheme,
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
      legend: { visible: true, width: 20, height: 104, align: 'right' },
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
      theme: defaultTheme,
    };

    const store = { state } as Store<BarChartOptions>;

    layout.action!.setLayout(store);

    expect(state.layout.xAxis).toEqual({
      x: 50,
      y: 59,
      width: 130,
      height: 100,
    });
  });

  describe('using secondaryYAxis size option', () => {
    const state = {
      legend: { visible: true, width: 20, height: 104, align: 'right' },
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
      theme: defaultTheme,
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
    legend: { visible: true, width: 20, height: 104, align: 'right' },
    circleLegend: { radius: 0, visible: false, width: 0 },
    chart: { width: 200, height: 200 },
    series: { bar: {} },
    axes: {
      xAxis: {},
      yAxis: {
        labels: ['a', 'b', 'c', 'd'],
      },
    },
    theme: defaultTheme,
    layout: { yAxis: {}, xAxis: {}, plot: {} },
    options: {
      exportMenu: { visible: false },
      plot: { width: 150, height: 150 },
    } as BarChartOptions,
  };

  const store = { state } as Store<BarChartOptions>;

  layout.action!.setLayout(store);

  const result = {
    yAxis: { x: 10, y: 15, width: 40, height: 150 },
    xAxis: { x: 50, y: 165, width: 120, height: 20 },
    plot: { x: 50, y: 15, width: 150, height: 150 },
    secondaryYAxis: { x: 170, y: 15, width: 0, height: 150 },
  };

  ['yAxis', 'xAxis', 'plot', 'secondaryYAxis'].forEach((prop) => {
    it(`should set ${prop} rect for plot size`, () => {
      expect(state.layout[prop]).toEqual(result[prop]);
    });
  });
});

describe('with export menu visible options', () => {
  const state = {
    legend: { visible: true, width: 20, height: 104, align: 'right' },
    circleLegend: { radius: 0, visible: false, width: 0 },
    chart: { width: 200, height: 200 },
    series: { bar: {} },
    axes: {
      xAxis: {},
      yAxis: {
        labels: ['a', 'b', 'c', 'd'],
      },
    },
    theme: defaultTheme,
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
    legend: { visible: true, width: 20, height: 104, align: 'right' },
    circleLegend: { radius: 0, visible: false, width: 0 },
    chart: { width: 200, height: 200 },
    series: { bar: {} },
    axes: {
      xAxis: {},
      yAxis: {
        labels: ['a', 'b', 'c', 'd'],
      },
    },
    theme: defaultTheme,
    layout: { yAxis: {}, xAxis: {}, plot: {}, resetButton: {} },
    options: { series: { zoomable: true } },
  };

  const store = { state } as Store<LineChartOptions>;
  layout.action!.setLayout(store);

  it(`should set resetButton rect`, () => {
    expect(state.layout.resetButton).toEqual({ height: 29, width: 24, x: 132, y: 15 });
  });
});

describe("subtract half of the xAxis's maximum label length to secure margin size", () => {
  const state = {
    legend: { visible: true, width: 20, height: 104, align: 'bottom' },
    circleLegend: { radius: 0, visible: false, width: 0 },
    chart: { width: 200, height: 200 },
    series: { bar: {} },
    axes: {
      xAxis: { maxLabelWidth: 50 },
      yAxis: {
        labels: ['a', 'b', 'c', 'd'],
      },
    },
    theme: defaultTheme,
    layout: { yAxis: {}, xAxis: {}, plot: {} },
    options: {},
  };

  const store = { state } as Store<LineChartOptions>;
  layout.action!.setLayout(store);

  it("should set secure margin size for xAxis's width", () => {
    expect(state.layout.xAxis).toEqual({ height: 20, width: 95, x: 50, y: 35 });
  });
});
