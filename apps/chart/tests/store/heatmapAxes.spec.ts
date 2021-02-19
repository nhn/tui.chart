import heatmapAxes from '@src/store/heatmapAxes';

import Store from '@src/store/store';
import { HeatmapChartOptions } from '@t/options';
import { ChartState, Options } from '@t/store/store';
import * as Calculator from '@src/helpers/calculator';

const notify = () => {};

const fontTheme = {
  fontSize: 11,
  fontFamily: 'Arial',
  fontWeight: 'normal',
  color: '#333333',
};

describe('HeatmapAxes Store module state', () => {
  it('should create heatmap axes properly by calling setAxesData', () => {
    const state = {
      chart: { width: 200, height: 200 },
      layout: {
        plot: { width: 200, height: 200, x: 30, y: 10 },
        yAxis: { x: 10, y: 10, width: 10, height: 180 },
        xAxis: { x: 10, y: 10, width: 180, height: 10 },
      },
      axes: {
        xAxis: {},
        yAxis: {},
      },
      categories: { x: ['A', 'B'], y: ['a', 'b', 'c', 'd'] },
      options: {
        xAxis: { tick: { interval: 1 }, label: { interval: 1 } },
        yAxis: { tick: { interval: 1 }, label: { interval: 1 } },
      },
      theme: {
        xAxis: { title: { ...fontTheme }, label: { ...fontTheme } },
        yAxis: { title: { ...fontTheme }, label: { ...fontTheme } },
      },
    } as ChartState<HeatmapChartOptions>;

    jest.spyOn(Calculator, 'getTextWidth').mockReturnValue(11);
    jest.spyOn(Calculator, 'getTextHeight').mockReturnValue(11);

    const store = { state } as Store<Options>;
    heatmapAxes.action!.setAxesData.call({ notify }, store);

    expect(state.axes).toEqual({
      xAxis: {
        isLabelAxis: true,
        labelDistance: 100,
        labelInterval: 1,
        labels: ['A', 'B'],
        viewLabels: [
          { text: 'A', offsetPos: 50 },
          { text: 'B', offsetPos: 150 },
        ],
        pointOnColumn: true,
        tickCount: 3,
        tickDistance: 100,
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
        labelInterval: 1,
        labelDistance: 50,
        labels: ['a', 'b', 'c', 'd'],
        viewLabels: [
          { text: 'a', offsetPos: 25 },
          { text: 'b', offsetPos: 75 },
          { text: 'c', offsetPos: 125 },
          { text: 'd', offsetPos: 175 },
        ],
        pointOnColumn: true,
        tickCount: 5,
        tickDistance: 50,
        tickInterval: 1,
        maxLabelWidth: 11,
        maxLabelHeight: 11,
      },
    });
  });
});
