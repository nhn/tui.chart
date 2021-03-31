import RadialPlot from '@src/component/radialPlot';
import Store from '@src/store/store';
import EventEmitter from '@src/eventEmitter';
import { deepMergedCopy } from '@src/helpers/utils';
import { Options } from '@t/store/store';

let radialPlot;

const seriesData = [
  { name: 'han', data: [1, 2, 3, 4] },
  { name: 'cho', data: [2, 1, 1, 3] },
];

const chartState = {
  chart: { width: 200, height: 200 },
  layout: {
    plot: { width: 200, height: 200, x: 0, y: 0 },
  },
  scale: { yAxis: { limit: { min: 0, max: 5 }, stepSize: 1, stepCount: 1 } },
  radialAxes: {
    verticalAxis: {
      axisSize: 50,
      centerX: 100,
      centerY: 100,
      tickDistance: 25,
      pointOnColumn: false,
      labels: {
        labels: ['0', '1', '2', '3', '4', '5'],
        maxWidth: 30,
        maxHeight: 15,
        interval: 1,
        margin: 0,
        align: 'center',
      },
      angle: { start: 0, end: 360 },
      radius: {
        ranges: [10, 20, 30, 40, 50],
        inner: 0,
        outer: 50,
      },
    },
    circularAxis: {
      axisSize: 50,
      centerX: 100,
      centerY: 100,
      tickInterval: 1,
      clockwise: true,
      label: {
        labels: ['A', 'B', 'C', 'D'],
        maxWidth: 20,
        maxHeight: 15,
        interval: 1,
        margin: 25,
      },
      angle: {
        central: 90,
        total: 360,
        drawingStart: 0,
      },
    },
  },
  categories: ['A', 'B', 'C', 'D'],
  options: {},
  theme: {
    circularAxis: {
      dotColor: 'rgba(0, 0, 0, 0.5)',
      lineWidth: 1,
      strokeStyle: 'rgba(0, 0, 0, 0.05)',
      label: { fontSize: 11, fontFamily: 'Arial', fontWeight: 'normal', color: '#333333' },
    },
    yAxis: {
      color: '#333333',
      width: 1,
      label: {
        fontSize: 11,
        fontFamily: 'Arial',
        fontWeight: 'normal',
        color: '#333333',
        textBubble: {
          backgroundColor: '#f3f3f3',
          borderColor: 'rgba(0, 0, 0, 0)',
          borderRadius: 7,
          borderWidth: 1,
          paddingX: 7,
          paddingY: 2,
          visible: true,
        },
      },
      title: { fontSize: 11, fontFamily: 'Arial', fontWeight: 700, color: '#bbbbbb' },
    },
  },
};

describe('radar chart', () => {
  beforeEach(() => {
    radialPlot = new RadialPlot({
      store: {} as Store<Options>,
      eventBus: new EventEmitter(),
    });
  });

  describe('The type of plot passed as an option', () => {
    it('should be drawn polygons for "spiderweb"', () => {
      radialPlot.render(
        deepMergedCopy(chartState, {
          series: {
            radar: {
              data: seriesData,
            },
          },
        })
      );

      expect(radialPlot.models.plot).toEqual([
        {
          type: 'polygon',
          color: 'rgba(0, 0, 0, 0.05)',
          lineWidth: 1,
          points: [
            { x: 100, y: 90 },
            { x: 110, y: 100 },
            { x: 100, y: 110 },
            { x: 90, y: 100 },
          ],
        },
        {
          type: 'polygon',
          color: 'rgba(0, 0, 0, 0.05)',
          lineWidth: 1,
          points: [
            { x: 100, y: 80 },
            { x: 120, y: 100 },
            { x: 100, y: 120 },
            { x: 80, y: 100 },
          ],
        },
        {
          type: 'polygon',
          color: 'rgba(0, 0, 0, 0.05)',
          lineWidth: 1,
          points: [
            { x: 100, y: 70 },
            { x: 130, y: 100 },
            { x: 100, y: 130 },
            { x: 70, y: 100 },
          ],
        },
        {
          type: 'polygon',
          color: 'rgba(0, 0, 0, 0.05)',
          lineWidth: 1,
          points: [
            { x: 100, y: 60 },
            { x: 140, y: 100 },
            { x: 100, y: 140 },
            { x: 60, y: 100 },
          ],
        },
        {
          type: 'polygon',
          color: 'rgba(0, 0, 0, 0.05)',
          lineWidth: 1,
          points: [
            { x: 100, y: 50 },
            { x: 150, y: 100 },
            { x: 100, y: 150 },
            { x: 50, y: 100 },
          ],
        },
      ]);
    });

    it('should be drawn polygons for "circle"', () => {
      radialPlot.render(
        deepMergedCopy(chartState, {
          series: {
            radar: {
              data: seriesData,
            },
          },
          options: {
            plot: {
              type: 'circle',
            },
          },
        })
      );

      expect(radialPlot.models.plot).toEqual([
        {
          type: 'circle',
          color: 'rgba(0, 0, 0, 0)',
          radius: 10,
          x: 100,
          y: 100,
          borderColor: 'rgba(0, 0, 0, 0.05)',
          borderWidth: 1,
        },
        {
          type: 'circle',
          color: 'rgba(0, 0, 0, 0)',
          radius: 20,
          x: 100,
          y: 100,
          borderColor: 'rgba(0, 0, 0, 0.05)',
          borderWidth: 1,
        },
        {
          type: 'circle',
          color: 'rgba(0, 0, 0, 0)',
          radius: 30,
          x: 100,
          y: 100,
          borderColor: 'rgba(0, 0, 0, 0.05)',
          borderWidth: 1,
        },
        {
          type: 'circle',
          color: 'rgba(0, 0, 0, 0)',
          radius: 40,
          x: 100,
          y: 100,
          borderColor: 'rgba(0, 0, 0, 0.05)',
          borderWidth: 1,
        },
        {
          type: 'circle',
          color: 'rgba(0, 0, 0, 0)',
          radius: 50,
          x: 100,
          y: 100,
          borderColor: 'rgba(0, 0, 0, 0.05)',
          borderWidth: 1,
        },
      ]);
    });
  });

  it('should have empty array for line models', () => {
    radialPlot.render(
      deepMergedCopy(chartState, {
        series: {
          radar: {
            data: seriesData,
          },
        },
      })
    );

    expect(radialPlot.models.line).toEqual([]);
  });
});

describe('radial chart', () => {
  beforeEach(() => {
    radialPlot = new RadialPlot({
      store: {} as Store<Options>,
      eventBus: new EventEmitter(),
    });

    radialPlot.render(
      deepMergedCopy(chartState, {
        series: {
          radialBar: {
            data: seriesData,
          },
        },
        verticalAxis: {
          axisSize: 50,
          centerX: 100,
          centerY: 100,
          tickDistance: 10,
          pointOnColumn: true,
          label: {
            labels: ['A', 'B', 'C', 'D'],
            maxWidth: 30,
            maxHeight: 15,
            interval: 1,
            margin: 5,
            align: 'center',
          },
          radius: {
            ranges: [50, 40, 30, 20, 10],
            inner: 0,
            outer: 50,
          },
          angle: { start: 0, end: 360 },
        },
        circularAxis: {
          axisSize: 50,
          centerX: 100,
          centerY: 100,
          clockwise: true,
          labelInterval: 1,
          label: {
            labels: ['0', '1', '2', '3', '4', '5'],
            maxWidth: 20,
            maxHeight: 15,
            margin: 25,
          },
          angle: { central: 72, total: 360, drawingStart: 0 },
        },
      })
    );
  });

  const result = {
    plot: [
      {
        type: 'circle',
        color: 'rgba(0, 0, 0, 0)',
        radius: 10,
        x: 100,
        y: 100,
        borderColor: 'rgba(0, 0, 0, 0.05)',
        borderWidth: 1,
      },
      {
        type: 'circle',
        color: 'rgba(0, 0, 0, 0)',
        radius: 20,
        x: 100,
        y: 100,
        borderColor: 'rgba(0, 0, 0, 0.05)',
        borderWidth: 1,
      },
      {
        type: 'circle',
        color: 'rgba(0, 0, 0, 0)',
        radius: 30,
        x: 100,
        y: 100,
        borderColor: 'rgba(0, 0, 0, 0.05)',
        borderWidth: 1,
      },
      {
        type: 'circle',
        color: 'rgba(0, 0, 0, 0)',
        radius: 40,
        x: 100,
        y: 100,
        borderColor: 'rgba(0, 0, 0, 0.05)',
        borderWidth: 1,
      },
      {
        type: 'circle',
        color: 'rgba(0, 0, 0, 0)',
        radius: 50,
        x: 100,
        y: 100,
        borderColor: 'rgba(0, 0, 0, 0.05)',
        borderWidth: 1,
      },
    ],
    line: [
      {
        type: 'line',
        x: 100,
        y: 100,
        x2: 100,
        y2: 50,
        strokeStyle: 'rgba(0, 0, 0, 0.05)',
        lineWidth: 1,
      },
      {
        type: 'line',
        x: 100,
        y: 100,
        x2: 150,
        y2: 100,
        strokeStyle: 'rgba(0, 0, 0, 0.05)',
        lineWidth: 1,
      },
      {
        type: 'line',
        x: 100,
        y: 100,
        x2: 100,
        y2: 150,
        strokeStyle: 'rgba(0, 0, 0, 0.05)',
        lineWidth: 1,
      },
      {
        type: 'line',
        x: 100,
        y: 100,
        x2: 50,
        y2: 100,
        strokeStyle: 'rgba(0, 0, 0, 0.05)',
        lineWidth: 1,
      },
    ],
  };

  ['plot', 'line'].forEach((modelName) => {
    it(`should make ${modelName} properly when calling render`, () => {
      expect(radialPlot.models[modelName]).toEqual(result[modelName]);
    });
  });
});
