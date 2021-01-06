import options from '@src/store/options';
import { StateFunc } from '@t/store/store';
import Store from '@src/store/store';
import { BarChartOptions } from '@t/options';

describe('options Store', () => {
  it('should set original options', () => {
    const optionsStateFunc = options.state as StateFunc;

    expect(optionsStateFunc({ series: {}, options: {} })).toEqual({
      originalOptions: {},
      options: {},
    });
  });

  it('should set responsive options', () => {
    const state = {
      legend: { visible: true, width: 20, align: 'right' },
      chart: { width: 200, height: 200 },
      series: { bar: {} },
      options: {
        exportMenu: { visible: true },
        xAxis: { title: 'xAxisTitle' },
        responsive: {
          rules: [
            {
              condition: function ({ width: w }) {
                return w <= 400;
              },
              options: {
                exportMenu: {
                  visible: false,
                },

                xAxis: { title: '' },
              },
            },
          ],
        },
      } as BarChartOptions,
      originalOptions: {
        exportMenu: { visible: true },
        xAxis: { title: 'xAxisTitle' },
        responsive: {
          rules: [
            {
              condition: function ({ width: w }) {
                return w <= 400;
              },
              options: {
                exportMenu: {
                  visible: false,
                },
                xAxis: { title: '' },
              },
            },
          ],
        },
      } as BarChartOptions,
    };

    const store = { state } as Store<BarChartOptions>;

    options.action!.setOptions(store);

    expect(state.options.exportMenu).toEqual({ visible: false });
    expect(state.options.xAxis).toEqual({ title: '' });
  });

  it('should merge options, if multiple conditions are satisfied among the rules', () => {
    const state = {
      legend: { visible: true, width: 20, align: 'right' },
      chart: { width: 200, height: 200 },
      series: { bar: {} },
      options: {
        legend: { visible: true },
        responsive: {
          rules: [
            {
              condition: function ({ width: w }) {
                return w <= 600;
              },
              options: {
                legend: {
                  align: 'bottom',
                },
              },
            },
            {
              condition: function ({ width: w }) {
                return w <= 400;
              },
              options: {
                legend: {
                  visible: false,
                },
              },
            },
          ],
        },
      } as BarChartOptions,
      originalOptions: {
        legend: { visible: true },
        responsive: {
          rules: [
            {
              condition: function ({ width: w }) {
                return w <= 600;
              },
              options: {
                legend: {
                  align: 'bottom',
                },
              },
            },
            {
              condition: function ({ width: w }) {
                return w <= 400;
              },
              options: {
                legend: {
                  visible: false,
                },
              },
            },
          ],
        },
      } as BarChartOptions,
    };

    const store = { state } as Store<BarChartOptions>;

    options.action!.setOptions(store);

    expect(state.options.legend).toEqual({ visible: false, align: 'bottom' });
  });
});
