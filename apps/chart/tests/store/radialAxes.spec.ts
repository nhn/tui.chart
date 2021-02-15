import radialAxes from '@src/store/radialAxes';
import Store from '@src/store/store';
import { ChartState, Scale } from '@t/store/store';
import { RadarChartOptions } from '@t/options';
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
});
