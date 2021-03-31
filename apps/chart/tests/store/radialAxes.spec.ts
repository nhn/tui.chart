import radialAxes from '@src/store/radialAxes';
import Store from '@src/store/store';
import { ChartState, Scale } from '@t/store/store';
import { RadarChartOptions, RadialBarChartOptions } from '@t/options';
import * as Calculator from '@src/helpers/calculator';

const notify = () => {};

const fontTheme = {
  fontSize: 11,
  fontFamily: 'Arial',
  fontWeight: 'normal',
  color: '#333333',
};

describe('Axes Store module', () => {
  it('should set radial axes for radar chart', () => {
    const state = {
      chart: { width: 120, height: 120 },
      layout: {
        plot: { width: 110, height: 110, x: 20, y: 10 },
      },
      scale: { verticalAxis: { limit: { min: 0, max: 9 }, stepSize: 1, stepCount: 1 } } as Scale,
      series: {
        radar: {
          data: [
            { name: 'han', data: [1, 3, 5, 7] },
            { name: 'cho', data: [2, 4, 6, 8] },
          ],
        },
      },
      radialAxes: {},
      categories: ['A', 'B'],
      options: {
        circularAxis: { tick: { interval: 2 }, label: { interval: 2, margin: 0 } },
        verticalAxis: { tick: { interval: 2 }, label: { interval: 2 } },
      },
      theme: {
        circularAxis: { label: { ...fontTheme } },
        verticalAxis: { label: { ...fontTheme } },
      },
    } as ChartState<RadarChartOptions>;

    jest.spyOn(Calculator, 'getTextWidth').mockReturnValue(10);
    jest.spyOn(Calculator, 'getTextHeight').mockReturnValue(10);

    const store = { state } as Store<RadarChartOptions>;
    radialAxes.action!.setRadialAxesData.call({ notify }, store);

    expect(state.radialAxes).toEqual({
      circularAxis: {
        axisSize: 45,
        centerX: 55,
        centerY: 55,
        clockwise: true,
        tickInterval: 2,
        label: {
          labels: ['A', 'B'],
          interval: 2,
          margin: 0,
          maxWidth: 10,
          maxHeight: 10,
        },
        angle: {
          total: 360,
          drawingStart: 0,
          central: 180,
          start: 0,
          end: 360,
        },
        radius: { inner: 0, outer: 45 },
      },
      verticalAxis: {
        axisSize: 45,
        centerX: 55,
        centerY: 55,
        tickDistance: 4.5,
        pointOnColumn: false,
        label: {
          labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
          interval: 2,
          margin: 0,
          align: 'center',

          maxWidth: 10,
          maxHeight: 10,
        },

        radius: { ranges: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45], inner: 0, outer: 45 },
        angle: { start: 0, end: 360 },
      },
    });
  });

  it('should set radial axes for radial bar chart', () => {
    const state = {
      chart: { width: 220, height: 220 },
      layout: {
        plot: { width: 200, height: 200, x: 20, y: 10 },
        yAxis: { x: 10, y: 10, width: 10, height: 200 },
        xAxis: { x: 10, y: 10, width: 200, height: 10 },
      },
      scale: { circularAxis: { limit: { min: 0, max: 9 }, stepSize: 1, stepCount: 1 } } as Scale,
      series: {
        radialBar: {
          data: [
            { name: 'han', data: [1, 3, 5, 7] },
            { name: 'cho', data: [2, 4, 6, 8] },
          ],
        },
      },
      radialAxes: {},
      categories: ['A', 'B'],
      options: {},
      theme: {
        circularAxis: { label: { ...fontTheme } },
        verticalAxis: { label: { ...fontTheme } },
      },
    } as ChartState<RadarChartOptions>;

    const store = { state } as Store<RadarChartOptions>;
    radialAxes.action!.setRadialAxesData.call({ notify }, store);

    expect(state.radialAxes).toEqual({
      circularAxis: {
        axisSize: 65,
        centerX: 100,
        centerY: 100,
        clockwise: true,
        tickInterval: 1,
        label: {
          labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
          interval: 1,
          margin: 25,
          maxWidth: 35,
          maxHeight: 10,
        },
        angle: {
          total: 360,
          drawingStart: 0,
          central: 36,
          start: 0,
          end: 360,
        },
        radius: {
          inner: 0,
          outer: 65,
        },
      },
      verticalAxis: {
        tickDistance: 32.5,
        axisSize: 65,
        centerX: 100,
        centerY: 100,
        pointOnColumn: true,
        label: {
          labels: ['A', 'B'],
          interval: 1,
          margin: 5,
          align: 'right',
          maxWidth: 15,
          maxHeight: 10,
        },
        angle: {
          start: 0,
          end: 360,
        },
        radius: {
          ranges: [65, 32.5],
          inner: 0,
          outer: 65,
        },
      },
    });
  });

  it('should set radial axes with using angle ranges', () => {
    const state = {
      chart: { width: 220, height: 220 },
      layout: {
        plot: { width: 200, height: 200, x: 20, y: 10 },
        yAxis: { x: 10, y: 10, width: 10, height: 200 },
        xAxis: { x: 10, y: 10, width: 200, height: 10 },
      },
      scale: { circularAxis: { limit: { min: 0, max: 9 }, stepSize: 1, stepCount: 1 } } as Scale,
      series: {
        radialBar: {
          data: [
            { name: 'han', data: [1, 3, 5, 7] },
            { name: 'cho', data: [2, 4, 6, 8] },
          ],
        },
      },
      radialAxes: {},
      categories: ['A', 'B'],
      options: {
        series: {
          angleRange: { start: 90, end: 270 },
        },
      } as RadialBarChartOptions,
      theme: {
        circularAxis: { label: { ...fontTheme } },
        verticalAxis: { label: { ...fontTheme } },
      },
    } as ChartState<RadarChartOptions>;

    const store = { state } as Store<RadarChartOptions>;
    radialAxes.action!.setRadialAxesData.call({ notify }, store);

    expect(state.radialAxes).toEqual({
      circularAxis: {
        axisSize: 65,
        centerX: 100,
        centerY: 100,
        clockwise: true,
        tickInterval: 1,
        label: {
          labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
          interval: 1,
          margin: 25,
          maxWidth: 35,
          maxHeight: 10,
        },
        angle: {
          total: 180,
          drawingStart: 90,
          central: 20,
          start: 90,
          end: 270,
        },
        radius: {
          outer: 65,
          inner: 0,
        },
      },
      verticalAxis: {
        tickDistance: 32.5,
        axisSize: 65,
        centerX: 100,
        centerY: 100,
        pointOnColumn: true,
        label: {
          labels: ['A', 'B'],
          interval: 1,
          margin: 5,
          align: 'right',
          maxWidth: 15,
          maxHeight: 10,
        },
        angle: {
          start: 90,
          end: 270,
        },
        radius: {
          ranges: [65, 32.5],
          inner: 0,
          outer: 65,
        },
      },
    });
  });

  it('should set left align on vertical axis with using angle ranges and counter clockwise', () => {
    const state = {
      chart: { width: 220, height: 220 },
      layout: {
        plot: { width: 200, height: 200, x: 20, y: 10 },
        yAxis: { x: 10, y: 10, width: 10, height: 200 },
        xAxis: { x: 10, y: 10, width: 200, height: 10 },
      },
      scale: { circularAxis: { limit: { min: 0, max: 9 }, stepSize: 1, stepCount: 1 } } as Scale,
      series: {
        radialBar: {
          data: [
            { name: 'han', data: [1, 3, 5, 7] },
            { name: 'cho', data: [2, 4, 6, 8] },
          ],
        },
      },
      radialAxes: {},
      categories: ['A', 'B'],
      options: {
        series: {
          clockwise: false,
          angleRange: { start: 270, end: 90 },
        },
      } as RadialBarChartOptions,
      theme: {
        circularAxis: { label: { ...fontTheme } },
        verticalAxis: { label: { ...fontTheme } },
      },
    } as ChartState<RadarChartOptions>;

    const store = { state } as Store<RadarChartOptions>;
    radialAxes.action!.setRadialAxesData.call({ notify }, store);

    expect(state.radialAxes.circularAxis.clockwise).toBe(false);
    expect(state.radialAxes.verticalAxis!.label.align).toBe('left');
  });
});
