import axes from '@src/store/axes';
import layout from '@src/store/layout';
import scale from '@src/store/scale';
import dataRange from '@src/store/dataRange';

import Store from '@src/store/store';
import { BarChartOptions, LineChartOptions } from '@t/options';

const data = [
  { name: 'han', data: [1, 2, 3, 4, 5, 6] },
  { name: 'cho', data: [4, 5, 6, 7, 8, 9] }
];

describe('LineChart Axes Store', () => {
  it('should be initialized with default values', () => {
    const store = new Store<LineChartOptions>({
      chart: { height: 100, width: 500 },
      options: {
        xAxis: {
          pointOnColumn: true,
          tick: { interval: 2 },
          label: { interval: 2 }
        },
        yAxis: {
          tick: { interval: 2 },
          label: { interval: 2 }
        }
      },
      categories: ['1', '2', '3', '4', '5', '6'],
      series: { line: data }
    });

    store.setModule(layout);
    store.setModule(dataRange);
    store.setModule(scale);
    store.setModule(axes);

    expect(store.state.axes).toMatchObject({
      xAxis: {
        isLabelAxis: true,
        labels: ['1', '2', '3', '4', '5', '6'],
        pointOnColumn: true,
        tickCount: 7,
        tickDistance: 70,
        labelInterval: 2,
        tickInterval: 2
      },
      yAxis: {
        isLabelAxis: false,
        labels: ['0', '10'],
        pointOnColumn: false,
        tickCount: 2,
        tickDistance: 23,
        labelInterval: 2,
        tickInterval: 2
      }
    });
  });
});

describe('pointOnColumn state is properly created', () => {
  it('[bar chart] xAxis.pointOnColumn: false, yAxis.pointOnColumn: true', () => {
    const store = new Store<BarChartOptions>({
      chart: { height: 100, width: 500 },
      options: {
        xAxis: {},
        yAxis: {}
      },
      series: { bar: data }
    });

    store.setModule(layout);
    store.setModule(dataRange);
    store.setModule(scale);
    store.setModule(axes);

    expect(store.state.axes).toMatchObject({
      xAxis: { pointOnColumn: false },
      yAxis: { pointOnColumn: true }
    });
  });

  it('[column chart] xAxis.pointOnColumn: true, yAxis.pointOnColumn: false', () => {
    const store = new Store<BarChartOptions>({
      chart: { height: 100, width: 500 },
      options: {
        xAxis: {},
        yAxis: {}
      },
      series: { column: data }
    });

    store.setModule(layout);
    store.setModule(dataRange);
    store.setModule(scale);
    store.setModule(axes);

    expect(store.state.axes).toMatchObject({
      xAxis: { pointOnColumn: true },
      yAxis: { pointOnColumn: false }
    });
  });
});
