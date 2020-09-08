import dataLabels, { PointDataLabel, RectDataLabel } from '@src/store/dataLabels';

import Store from '@src/store/store';
import { LineChartOptions, BarChartOptions } from '@t/options';
import { ChartState } from '@t/store/store';

describe('Data Labels Store module', () => {
  it('should create data label of point type', () => {
    const state = {
      options: {
        series: {
          dataLabels: {
            visible: true,
          },
        },
      },
      series: {
        line: {},
      },
      dataLabels: {},
    } as ChartState<LineChartOptions>;

    const store = { state } as Store<LineChartOptions>;

    const pointDataLabels: PointDataLabel[] = [
      {
        type: 'point',
        value: 3.5,
        x: 5,
        y: 10,
      },
    ];

    dataLabels.action!.appendDataLabels(store, { data: pointDataLabels, name: 'line' });

    expect(state.dataLabels.line!.data).toEqual([
      {
        type: 'point',
        text: '3.5',
        textAlign: 'center',
        textBaseline: 'middle',
        x: 5,
        y: 10,
      },
    ]);
  });

  it('should change label style with style options', () => {
    const state = {
      options: {
        series: {
          dataLabels: {
            visible: true,
            style: {
              font: '500 12px Arial',
              color: '#ff0000',
              textStrokeColor: '#ffffff',
            },
          },
        },
      },
      series: {
        bar: {},
      },
      dataLabels: {},
    } as ChartState<BarChartOptions>;

    const store = { state } as Store<BarChartOptions>;

    const rectDataLabels: RectDataLabel[] = [
      {
        type: 'rect',
        value: 1000,
        direction: 'right',
        x: 5,
        y: 5,
        width: 100,
        height: 50,
        plot: {
          x: 4,
          y: 4,
          size: 120,
        },
      },
    ];

    dataLabels.action!.appendDataLabels(store, { data: rectDataLabels, name: 'bar' });

    expect(state.dataLabels.bar!.data).toEqual([
      {
        type: 'rect',
        text: '1000',
        textAlign: 'left',
        textBaseline: 'middle',
        x: 106,
        y: 26,
      },
    ]);
  });
});
