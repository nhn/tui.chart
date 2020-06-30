import dataLabels, { PointDataLabel, RectDataLabel } from '@src/store/dataLabels';

import Store from '@src/store/store';
import { LineChartOptions, BarChartOptions } from '@t/options';
import { ChartState } from '@t/store/store';
import { DataLabel } from '@t/components/dataLabels';

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
      dataLabels: [] as DataLabel[],
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

    dataLabels.action!.appendDataLabels(store, pointDataLabels);

    expect(state.dataLabels).toEqual([
      {
        style: {
          color: '#333333',
          font: 'normal 11px Arial',
          textStrokeColor: 'rgba(255, 255, 255, 0.5)',
        },
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
      dataLabels: [] as DataLabel[],
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

    dataLabels.action!.appendDataLabels(store, rectDataLabels);

    expect(state.dataLabels).toEqual([
      {
        style: {
          color: '#ff0000',
          font: '500 12px Arial',
          textStrokeColor: '#ffffff',
        },
        text: '1000',
        textAlign: 'left',
        textBaseline: 'middle',
        x: 106,
        y: 26,
      },
    ]);
  });
});
