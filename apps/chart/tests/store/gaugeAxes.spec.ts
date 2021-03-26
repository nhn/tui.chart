import gaugeAxes from '@src/store/gaugeAxes';
import Store from '@src/store/store';
import { ChartState, Scale } from '@t/store/store';
import { GaugeChartOptions } from '@t/options';
import * as Calculator from '@src/helpers/calculator';
import { deepMergedCopy } from '@src/helpers/utils';

const notify = () => {};

const fontTheme = {
  fontSize: 11,
  fontFamily: 'Arial',
  fontWeight: 'normal',
  color: '#333333',
};

const chartState = {
  chart: { width: 250, height: 250 },
  layout: {
    xAxis: { width: 200, height: 0, x: 10, y: 200 },
    plot: { width: 200, height: 200, x: 10, y: 10 },
  },
  scale: { circularAxis: { limit: { min: 0, max: 75 }, stepSize: 25, stepCount: 4 } } as Scale,
  series: {
    gauge: {
      data: [{ name: 'cho', data: [50] }],
    },
  },
  categories: [] as string[],
  options: {},
  radialAxes: {
    circularAxis: {},
  },
  theme: {
    circularAxis: { label: { ...fontTheme } },
    series: {
      gauge: {
        areaOpacity: 1,
        colors: ['#aaaaaa'],
        clockHand: { baseLine: 4 },
        pin: { radius: 5, borderWidth: 5 },
        solid: {
          lineWidth: 1,
          strokeStyle: 'rgba(0, 0, 0, 0)',
          backgroundSolid: { color: 'rgba(0, 0, 0, 0.1)' },
        },
        dataLabels: {},
        hover: {},
        select: {},
      },
    },
  },
} as ChartState<GaugeChartOptions>;

describe('Gauge Axes Store module', () => {
  it('should set gauge axes', () => {
    const state = deepMergedCopy(chartState, {});

    jest.spyOn(Calculator, 'getTextWidth').mockReturnValue(10);
    jest.spyOn(Calculator, 'getTextHeight').mockReturnValue(10);

    const store = { state } as Store<GaugeChartOptions>;
    gaugeAxes.action!.setCircularAxisData.call({ notify }, store);

    expect(state.radialAxes.circularAxis).toEqual({
      axisSize: 75,
      centerX: 100,
      centerY: 100,
      clockwise: true,
      tickInterval: 1,
      label: {
        labels: ['0', '25', '50', '75'],
        interval: 1,
        margin: 15,
        maxWidth: 25,
        maxHeight: 10,
      },
      angle: {
        total: 360,
        drawingStart: 0,
        central: 90,
        start: 0,
        end: 360,
      },
      radius: { outer: 65, inner: 0 },
      band: { margin: 10, width: 0 },
      solidData: {
        visible: false,
        radiusRange: { inner: 23.5, outer: 30 },
        barWidth: 6.5,
        clockHand: false,
      },
      maxClockHandSize: 30,
    });
  });

  it('should set gauge axes with using angle ranges', () => {
    const state = deepMergedCopy(chartState, {
      options: {
        series: {
          angleRange: { start: 90, end: 270 },
        },
      },
    });

    const store = { state } as Store<GaugeChartOptions>;
    gaugeAxes.action!.setCircularAxisData.call({ notify }, store);

    expect(state.radialAxes.circularAxis.angle.start).toBe(90);
    expect(state.radialAxes.circularAxis.angle.end).toBe(270);
  });

  it('should set gauge axes with using solid', () => {
    const state = deepMergedCopy(chartState, {
      options: {
        series: {
          solid: true,
        },
      },
    });

    const store = { state } as Store<GaugeChartOptions>;
    gaugeAxes.action!.setCircularAxisData.call({ notify }, store);

    expect(state.radialAxes.circularAxis.solidData).toEqual({
      visible: true,
      radiusRange: { inner: 23.5, outer: 30 },
      barWidth: 6.5,
      clockHand: false,
    });
  });

  it('should set sgauge axes with using solid with clock hand', () => {
    const state = deepMergedCopy(chartState, {
      options: {
        series: {
          solid: { clockHand: true },
        },
      },
    });

    const store = { state } as Store<GaugeChartOptions>;
    gaugeAxes.action!.setCircularAxisData.call({ notify }, store);

    expect(state.radialAxes.circularAxis.solidData!.clockHand).toBe(true);
  });
});
