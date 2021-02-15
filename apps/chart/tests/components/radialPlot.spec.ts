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
      labels: ['0', '1', '2', '3', '4', '5'],
      axisSize: 50,
      centerX: 100,
      centerY: 100,
      maxLabelWidth: 30,
      maxLabelHeight: 15,
      labelInterval: 1,
      labelMargin: 0,
      tickDistance: 25,
      radiusRanges: [10, 20, 30, 40, 50],
      pointOnColumn: false,
      innerRadius: 0,
      outerRadius: 50,
      labelAlign: 'center',
    },
    circularAxis: {
      labels: ['A', 'B', 'C', 'D'],
      axisSize: 50,
      centerX: 100,
      centerY: 100,
      maxLabelWidth: 20,
      maxLabelHeight: 15,
      labelInterval: 1,
      labelMargin: 25,
      degree: 90,
      tickInterval: 1,
      totalAngle: 360,
      drawingStartAngle: 0,
      clockwise: true,
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
          style: [
            {
              lineWidth: 1,
              strokeStyle: 'rgba(0, 0, 0, 0.05)',
            },
          ],
          radius: 10,
          x: 100,
          y: 100,
        },
        {
          type: 'circle',
          color: 'rgba(0, 0, 0, 0)',
          style: [
            {
              lineWidth: 1,
              strokeStyle: 'rgba(0, 0, 0, 0.05)',
            },
          ],
          radius: 20,
          x: 100,
          y: 100,
        },
        {
          type: 'circle',
          color: 'rgba(0, 0, 0, 0)',
          style: [
            {
              lineWidth: 1,
              strokeStyle: 'rgba(0, 0, 0, 0.05)',
            },
          ],
          radius: 30,
          x: 100,
          y: 100,
        },
        {
          type: 'circle',
          color: 'rgba(0, 0, 0, 0)',
          style: [
            {
              lineWidth: 1,
              strokeStyle: 'rgba(0, 0, 0, 0.05)',
            },
          ],
          radius: 40,
          x: 100,
          y: 100,
        },
        {
          type: 'circle',
          color: 'rgba(0, 0, 0, 0)',
          style: [
            {
              lineWidth: 1,
              strokeStyle: 'rgba(0, 0, 0, 0.05)',
            },
          ],
          radius: 50,
          x: 100,
          y: 100,
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
          labels: ['A', 'B', 'C', 'D'],
          axisSize: 50,
          centerX: 100,
          centerY: 100,
          maxLabelWidth: 30,
          maxLabelHeight: 15,
          labelInterval: 1,
          labelMargin: 5,
          tickDistance: 10,
          radiusRanges: [50, 40, 30, 20, 10],
          pointOnColumn: true,
          innerRadius: 0,
          outerRadius: 50,
          labelAlign: 'center',
        },
        circularAxis: {
          labels: ['0', '1', '2', '3', '4', '5'],
          axisSize: 50,
          centerX: 100,
          centerY: 100,
          maxLabelWidth: 20,
          maxLabelHeight: 15,
          labelInterval: 1,
          labelMargin: 25,
          degree: 72,
          tickInterval: 1,
          totalAngle: 360,
          drawingStartAngle: 0,
          clockwise: true,
        },
      })
    );
  });

  const result = {
    plot: [
      {
        type: 'circle',
        color: 'rgba(0, 0, 0, 0)',
        style: [
          {
            lineWidth: 1,
            strokeStyle: 'rgba(0, 0, 0, 0.05)',
          },
        ],
        radius: 10,
        x: 100,
        y: 100,
      },
      {
        type: 'circle',
        color: 'rgba(0, 0, 0, 0)',
        style: [
          {
            lineWidth: 1,
            strokeStyle: 'rgba(0, 0, 0, 0.05)',
          },
        ],
        radius: 20,
        x: 100,
        y: 100,
      },
      {
        type: 'circle',
        color: 'rgba(0, 0, 0, 0)',
        style: [
          {
            lineWidth: 1,
            strokeStyle: 'rgba(0, 0, 0, 0.05)',
          },
        ],
        radius: 30,
        x: 100,
        y: 100,
      },
      {
        type: 'circle',
        color: 'rgba(0, 0, 0, 0)',
        style: [
          {
            lineWidth: 1,
            strokeStyle: 'rgba(0, 0, 0, 0.05)',
          },
        ],
        radius: 40,
        x: 100,
        y: 100,
      },
      {
        type: 'circle',
        color: 'rgba(0, 0, 0, 0)',
        style: [
          {
            lineWidth: 1,
            strokeStyle: 'rgba(0, 0, 0, 0.05)',
          },
        ],
        radius: 50,
        x: 100,
        y: 100,
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
