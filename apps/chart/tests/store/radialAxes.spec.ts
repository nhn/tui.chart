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
        labels: ['A', 'B'],
        axisSize: 45,
        centerX: 55,
        centerY: 55,
        totalAngle: 360,
        drawingStartAngle: 0,
        clockwise: true,
        degree: 180,
        tickInterval: 2,
        labelInterval: 2,
        labelMargin: 0,
        maxLabelWidth: 10,
        maxLabelHeight: 10,
        outerRadius: 45,
        startAngle: 0,
        endAngle: 360,
        innerRadius: 0,
        isSemiCircular: false,
      },
      verticalAxis: {
        labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        tickDistance: 4.5,
        axisSize: 45,
        centerX: 55,
        centerY: 55,
        pointOnColumn: false,
        labelInterval: 2,
        labelMargin: 0,
        labelAlign: 'center',
        maxLabelWidth: 10,
        maxLabelHeight: 10,
        radiusRanges: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45],
        innerRadius: 0,
        outerRadius: 45,
        startAngle: 0,
        endAngle: 360,
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
        labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        axisSize: 65,
        centerX: 100,
        centerY: 100,
        totalAngle: 360,
        drawingStartAngle: 0,
        clockwise: true,
        degree: 36,
        tickInterval: 1,
        labelInterval: 1,
        labelMargin: 25,
        maxLabelWidth: 35,
        maxLabelHeight: 10,
        outerRadius: 65,
        startAngle: 0,
        endAngle: 360,
        innerRadius: 0,
        isSemiCircular: false,
      },
      verticalAxis: {
        labels: ['A', 'B'],
        tickDistance: 32.5,
        axisSize: 65,
        centerX: 100,
        centerY: 100,
        pointOnColumn: true,
        labelInterval: 1,
        labelMargin: 5,
        labelAlign: 'right',
        maxLabelWidth: 15,
        maxLabelHeight: 10,
        radiusRanges: [65, 32.5],
        innerRadius: 0,
        outerRadius: 65,
        startAngle: 0,
        endAngle: 360,
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
        labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        axisSize: 65,
        centerX: 100,
        centerY: 100,
        totalAngle: 180,
        drawingStartAngle: 90,
        clockwise: true,
        degree: 20,
        tickInterval: 1,
        labelInterval: 1,
        labelMargin: 25,
        maxLabelWidth: 35,
        maxLabelHeight: 10,
        outerRadius: 65,
        startAngle: 90,
        endAngle: 270,
        innerRadius: 0,
        isSemiCircular: false,
      },
      verticalAxis: {
        labels: ['A', 'B'],
        tickDistance: 32.5,
        axisSize: 65,
        centerX: 100,
        centerY: 100,
        pointOnColumn: true,
        labelInterval: 1,
        labelMargin: 5,
        labelAlign: 'right',
        maxLabelWidth: 15,
        maxLabelHeight: 10,
        radiusRanges: [65, 32.5],
        innerRadius: 0,
        outerRadius: 65,
        startAngle: 90,
        endAngle: 270,
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
    expect(state.radialAxes.verticalAxis!.labelAlign).toBe('left');
  });
});
