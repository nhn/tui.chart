import GaugeSeries from '@src/component/gaugeSeries';
import Store from '@src/store/store';
import EventEmitter from '@src/eventEmitter';
import { deepMergedCopy } from '@src/helpers/utils';
import { Options } from '@t/store/store';

let gaugeSeries;

const seriesData = [{ name: 'cho', data: [50], color: '#aaaaaa' }];

const chartState = {
  chart: { width: 200, height: 200 },
  layout: {
    plot: { width: 200, height: 200, x: 0, y: 0 },
  },
  scale: { circularAxis: { limit: { min: 0, max: 75 }, stepSize: 25, stepCount: 4 } },
  series: {
    gauge: {
      data: seriesData,
    },
  },
  radialAxes: {
    circularAxis: {
      axisSize: 50,
      centerX: 100,
      centerY: 100,
      tickInterval: 1,
      clockwise: true,
      label: {
        labels: ['0', '25', '50', '75'],
        maxWidth: 20,
        maxHeight: 15,
        interval: 1,
        margin: 25,
      },
      angle: {
        central: 120,

        total: 360,

        drawingStart: 0,

        start: 0,
        end: 360,
      },
      radius: { outer: 50 },
      maxClockHandSize: 40,
      solidData: {
        visible: false,
        radiusRange: { inner: 50, outer: 50 },
        barWidth: 0,
        clockHand: true,
      },
    },
  },
  options: {},
  legend: {
    data: [{ label: 'cho', active: true, checked: true }],
  },
  theme: {
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
        hover: {},
        select: {},
      },
    },
  },
};

describe('gauge series', () => {
  beforeEach(() => {
    gaugeSeries = new GaugeSeries({
      store: {} as Store<Options>,
      eventBus: new EventEmitter(),
    });

    gaugeSeries.render(chartState);
  });

  const result = {
    models: {
      clockHand: [
        {
          type: 'clockHand',
          color: 'rgba(170, 170, 170, 1)',
          name: 'cho',
          value: 50,
          x: 100,
          y: 100,
          x2: 100,
          y2: 140,
          pin: {
            radius: 5,
            color: 'rgba(170, 170, 170, 1)',
            style: [
              {
                strokeStyle: 'rgba(170, 170, 170, 0.1)',
                lineWidth: 10,
              },
            ],
          },
          degree: 180,
          animationDegree: 180,
          baseLine: 4,
          handSize: 40,
          seriesData: [50],
          index: 0,
          seriesIndex: 0,
        },
      ],
      solid: [],
      backgroundSolid: [],
    },
    responders: [
      {
        type: 'clockHand',
        color: 'rgba(170, 170, 170, 1)',
        name: 'cho',
        value: 50,
        x: 100,
        y: 100,
        x2: 100,
        y2: 140,
        pin: {
          radius: 5,
          color: 'rgba(170, 170, 170, 1)',
          style: [
            {
              strokeStyle: 'rgba(170, 170, 170, 0.1)',
              lineWidth: 10,
            },
          ],
        },
        degree: 180,
        animationDegree: 180,
        baseLine: 4,
        handSize: 40,
        seriesData: [50],
        index: 0,
        seriesIndex: 0,
        detectionSize: 7,
        data: {
          color: 'rgba(170, 170, 170, 1)',
          label: 'cho',
          value: 50,
          index: 0,
          seriesIndex: 0,
        },
      },
    ],
  };

  ['models', 'responders'].forEach((modelName) => {
    it(`should make ${modelName} properly when calling render`, () => {
      expect(gaugeSeries[modelName]).toEqual(result[modelName]);
    });
  });
});

describe('solid gauge', () => {
  beforeEach(() => {
    gaugeSeries = new GaugeSeries({
      store: {} as Store<Options>,
      eventBus: new EventEmitter(),
    });
  });

  it('should make solid models', () => {
    gaugeSeries.render(
      deepMergedCopy(chartState, {
        radialAxes: {
          circularAxis: {
            axisSize: 50,
            centerX: 100,
            centerY: 100,
            maxClockHandSize: 30,
            clockwise: true,
            tickInterval: 1,
            label: {
              labels: ['0', '25', '50', '75'],

              maxWidth: 20,
              maxHeight: 15,
              interval: 1,
              margin: 25,
            },
            angle: {
              central: 120,
              total: 360,
              drawingStart: 0,
              start: 0,
              end: 360,
            },
            radius: { outer: 50 },
            solidData: {
              visible: true,
              radiusRange: { inner: 40, outer: 50 },
              barWidth: 10,
              clockHand: true,
            },
          },
        },
        options: {
          series: { solid: true },
        },
      })
    );

    expect(gaugeSeries.models).toEqual({
      clockHand: [
        {
          type: 'clockHand',
          color: 'rgba(170, 170, 170, 1)',
          name: 'cho',
          value: 50,
          x: 100,
          y: 100,
          x2: 100,
          y2: 130,
          pin: {
            radius: 5,
            color: 'rgba(170, 170, 170, 1)',
            style: [{ strokeStyle: 'rgba(170, 170, 170, 0.1)', lineWidth: 10 }],
          },
          degree: 180,
          animationDegree: 180,
          baseLine: 4,
          handSize: 30,
          seriesData: [50],
          index: 0,
          seriesIndex: 0,
        },
      ],
      solid: [
        {
          type: 'sector',
          color: 'rgba(170, 170, 170, 1)',
          x: 100,
          y: 100,
          clockwise: true,
          degree: {
            start: 0,
            end: 180,
          },
          radius: { inner: 40, outer: 50 },
          animationDegree: {
            start: 0,
            end: 180,
          },
          drawingStartAngle: -90,
          index: 0,
          style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }],
          lineWidth: 1,
        },
      ],
      backgroundSolid: [
        {
          type: 'sector',
          color: 'rgba(0, 0, 0, 0.1)',
          x: 100,
          y: 100,
          clockwise: true,
          degree: {
            start: 0,
            end: 360,
          },
          radius: { inner: 40, outer: 50 },
        },
      ],
    });
  });

  it('should empty array for clock hand models when solid.clockHand is false', () => {
    gaugeSeries.render(
      deepMergedCopy(chartState, {
        radialAxes: {
          circularAxis: {
            axisSize: 50,
            centerX: 100,
            centerY: 100,
            tickInterval: 1,
            clockwise: true,
            maxClockHandSize: 30,
            label: {
              labels: ['0', '25', '50', '75'],
              maxWidth: 20,
              maxHeight: 15,
              interval: 1,
              margin: 25,
            },
            angle: {
              central: 120,
              total: 360,
              drawingStart: 0,
              start: 0,
              end: 360,
            },
            radius: { outer: 50 },
            solidData: {
              visible: true,
              radiusRange: { inner: 40, outer: 50 },
              barWidth: 10,
              clockHand: false,
            },
          },
        },
        options: {
          series: { solid: true, clockHand: false },
        },
      })
    );

    expect(gaugeSeries.models.clockHand.length).toBe(0);
  });
});
