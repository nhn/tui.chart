import RadialAxis from '@src/component/radialAxis';
import Store from '@src/store/store';
import EventEmitter from '@src/eventEmitter';
import { Options } from '@t/store/store';
import { deepMergedCopy } from '@src/helpers/utils';
import { calculateDegreeToRadian } from '@src/helpers/sector';

let radialAxis;

const seriesData = [
  { name: 'han', data: [1, 2, 3, 4], color: '#aaaaaa' },
  { name: 'cho', data: [2, 1, 1, 3], color: '#bbbbbb' },
];

const chartState = {
  chart: { width: 200, height: 200 },
  layout: {
    plot: { width: 200, height: 200, x: 0, y: 0 },
  },
  scale: { yAxis: { limit: { min: 0, max: 5 }, stepSize: 1, stepCount: 1 } },
  series: {
    radar: {
      data: seriesData,
    },
  },
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
      startAngle: 0,
      endAngle: 360,
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
      outerRadius: 50,
      startAngle: 0,
      endAngle: 360,
    },
  },
  categories: ['A', 'B', 'C', 'D'],
  options: {},
  legend: {
    data: [
      { label: 'han', active: true, checked: true },
      { label: 'cho', active: true, checked: true },
    ],
  },
  theme: {
    circularAxis: {
      dotColor: 'rgba(0, 0, 0, 0.5)',
      lineWidth: 1,
      strokeStyle: 'rgba(0, 0, 0, 0.05)',
      label: { fontSize: 11, fontFamily: 'Arial', fontWeight: 'normal', color: '#333333' },
    },
    verticalAxis: {
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
    },
  },
};

describe('Radar Axis', () => {
  beforeEach(() => {
    radialAxis = new RadialAxis({
      store: {} as Store<Options>,
      eventBus: new EventEmitter(),
    });

    radialAxis.render(chartState);
  });

  const result = {
    dot: [
      {
        type: 'rect',
        color: 'rgba(0, 0, 0, 0.5)',
        width: 4,
        height: 4,
        x: 98,
        y: 48,
      },
      {
        type: 'rect',
        color: 'rgba(0, 0, 0, 0.5)',
        width: 4,
        height: 4,
        x: 148,
        y: 98,
      },
      {
        type: 'rect',
        color: 'rgba(0, 0, 0, 0.5)',
        width: 4,
        height: 4,
        x: 98,
        y: 148,
      },
      {
        type: 'rect',
        color: 'rgba(0, 0, 0, 0.5)',
        width: 4,
        height: 4,
        x: 48,
        y: 98,
      },
    ],
    circularAxisLabel: [
      {
        type: 'label',
        style: [{ fillStyle: '#333333', font: 'normal 11px Arial', textAlign: 'center' }],
        text: 'A',
        x: 100,
        y: 25,
      },
      {
        type: 'label',
        style: [{ fillStyle: '#333333', font: 'normal 11px Arial', textAlign: 'left' }],
        text: 'B',
        x: 175,
        y: 100,
      },
      {
        type: 'label',
        style: [{ fillStyle: '#333333', font: 'normal 11px Arial', textAlign: 'center' }],
        text: 'C',
        x: 100,
        y: 175,
      },
      {
        type: 'label',
        style: [{ fillStyle: '#333333', font: 'normal 11px Arial', textAlign: 'right' }],
        text: 'D',
        x: 25,
        y: 100,
      },
    ],
    verticalAxisLabel: [
      {
        type: 'bubbleLabel',
        radian: 0,
        rotationPosition: {
          x: 100,
          y: 80,
        },
        bubble: {
          x: 78,
          y: 70.5,
          width: 44,
          height: 19,
          radius: 7,
          fill: '#f3f3f3',
          align: 'center',
          lineWidth: 1,
          strokeStyle: 'rgba(0, 0, 0, 0)',
          style: null,
        },
        label: {
          text: '1',
          x: 100,
          y: 80,
          style: [
            {
              font: 'normal 11px Arial',
              fillStyle: '#333333',
              textAlign: 'center',
              textBaseline: 'middle',
            },
          ],
        },
      },
      {
        type: 'bubbleLabel',
        radian: 0,
        rotationPosition: {
          x: 100,
          y: 70,
        },
        bubble: {
          x: 78,
          y: 60.5,
          width: 44,
          height: 19,
          radius: 7,
          fill: '#f3f3f3',
          align: 'center',
          lineWidth: 1,
          strokeStyle: 'rgba(0, 0, 0, 0)',
          style: null,
        },
        label: {
          text: '2',
          x: 100,
          y: 70,
          style: [
            {
              font: 'normal 11px Arial',
              fillStyle: '#333333',
              textAlign: 'center',
              textBaseline: 'middle',
            },
          ],
        },
      },
      {
        type: 'bubbleLabel',
        radian: 0,
        rotationPosition: {
          x: 100,
          y: 60,
        },
        bubble: {
          x: 78,
          y: 50.5,
          width: 44,
          height: 19,
          radius: 7,
          fill: '#f3f3f3',
          align: 'center',
          lineWidth: 1,
          strokeStyle: 'rgba(0, 0, 0, 0)',
          style: null,
        },
        label: {
          text: '3',
          x: 100,
          y: 60,
          style: [
            {
              font: 'normal 11px Arial',
              fillStyle: '#333333',
              textAlign: 'center',
              textBaseline: 'middle',
            },
          ],
        },
      },
    ],
  };

  ['dot', 'circularAxisLabel', 'verticalAxisLabel'].forEach((modelName) => {
    it(`should make ${modelName} properly when calling render`, () => {
      expect(radialAxis.models[modelName]).toEqual(result[modelName]);
    });
  });
});

describe('Radial Axis', () => {
  beforeEach(() => {
    radialAxis = new RadialAxis({
      store: {} as Store<Options>,
      eventBus: new EventEmitter(),
    });

    radialAxis.render(
      deepMergedCopy(chartState, {
        series: {
          radialBar: {
            data: [
              { name: 'han', data: [1, 2] },
              { name: 'cho', data: [2, 1] },
            ],
          },
        },
        categories: ['A', 'B'],
        radialAxes: {
          verticalAxis: {
            labels: ['A', 'B'],
            axisSize: 50,
            centerX: 100,
            centerY: 100,
            maxLabelWidth: 30,
            maxLabelHeight: 15,
            labelInterval: 1,
            labelMargin: 0,
            tickDistance: 25,
            radiusRanges: [50, 25],
            pointOnColumn: true,
            innerRadius: 0,
            outerRadius: 50,
            labelAlign: 'right',
            startAngle: 0,
            endAngle: 360,
          },
          circularAxis: {
            labels: ['0', '3'],
            axisSize: 50,
            centerX: 100,
            centerY: 100,
            maxLabelWidth: 20,
            maxLabelHeight: 15,
            labelInterval: 1,
            labelMargin: 0,
            degree: 180,
            tickInterval: 1,
            totalAngle: 360,
            drawingStartAngle: 0,
            clockwise: true,
            startAngle: 0,
            endAngle: 360,
          },
        },
      })
    );
  });

  const result = {
    dot: [
      {
        type: 'rect',
        color: 'rgba(0, 0, 0, 0.5)',
        width: 4,
        height: 4,
        x: 98,
        y: 48,
      },
      {
        type: 'rect',
        color: 'rgba(0, 0, 0, 0.5)',
        width: 4,
        height: 4,
        x: 98,
        y: 148,
      },
    ],
    circularAxisLabel: [
      {
        type: 'label',
        style: [{ fillStyle: '#333333', font: 'normal 11px Arial', textAlign: 'center' }],
        text: '0',
        x: 100,
        y: 50,
      },
      {
        type: 'label',
        style: [{ fillStyle: '#333333', font: 'normal 11px Arial', textAlign: 'center' }],
        text: '3',
        x: 100,
        y: 150,
      },
    ],
    verticalAxisLabel: [
      {
        type: 'bubbleLabel',
        radian: 0,
        rotationPosition: {
          x: 100,
          y: 63,
        },
        bubble: {
          x: 56,
          y: 53.5,
          width: 44,
          height: 19,
          radius: 7,
          fill: '#f3f3f3',
          align: 'right',
          lineWidth: 1,
          strokeStyle: 'rgba(0, 0, 0, 0)',
          style: null,
        },
        label: {
          text: 'A',
          x: 93,
          y: 63,
          style: [
            {
              font: 'normal 11px Arial',
              fillStyle: '#333333',
              textAlign: 'right',
              textBaseline: 'middle',
            },
          ],
        },
      },
      {
        type: 'bubbleLabel',
        radian: 0,
        rotationPosition: {
          x: 100,
          y: 88,
        },
        bubble: {
          x: 56,
          y: 78.5,
          width: 44,
          height: 19,
          radius: 7,
          fill: '#f3f3f3',
          align: 'right',
          lineWidth: 1,
          strokeStyle: 'rgba(0, 0, 0, 0)',
          style: null,
        },
        label: {
          text: 'B',
          x: 93,
          y: 88,
          style: [
            {
              font: 'normal 11px Arial',
              fillStyle: '#333333',
              textAlign: 'right',
              textBaseline: 'middle',
            },
          ],
        },
      },
    ],
  };

  ['dot', 'circularAxisLabel', 'verticalAxisLabel'].forEach((modelName) => {
    it(`should make ${modelName} properly when calling render`, () => {
      expect(radialAxis.models[modelName]).toEqual(result[modelName]);
    });
  });

  it('should make verticalAxisLabel properly with using angleRanges', () => {
    radialAxis.render(
      deepMergedCopy(chartState, {
        series: {
          radialBar: {
            data: [
              { name: 'han', data: [1, 2] },
              { name: 'cho', data: [2, 1] },
            ],
          },
        },
        categories: ['A', 'B'],
        radialAxes: {
          verticalAxis: {
            labels: ['A', 'B'],
            axisSize: 50,
            centerX: 100,
            centerY: 100,
            maxLabelWidth: 30,
            maxLabelHeight: 15,
            labelInterval: 1,
            labelMargin: 0,
            tickDistance: 25,
            radiusRanges: [50, 25],
            pointOnColumn: true,
            innerRadius: 0,
            outerRadius: 50,
            labelAlign: 'right',
            startAngle: 90,
            endAngle: 360,
          },
          circularAxis: {
            labels: ['0', '3'],
            axisSize: 50,
            centerX: 100,
            centerY: 100,
            maxLabelWidth: 20,
            maxLabelHeight: 15,
            labelInterval: 1,
            labelMargin: 0,
            degree: 180,
            tickInterval: 1,
            totalAngle: 270,
            drawingStartAngle: 0,
            clockwise: true,
            startAngle: 90,
            endAngle: 360,
          },
        },
      })
    );

    expect(radialAxis.models.verticalAxisLabel).toEqual([
      {
        type: 'bubbleLabel',
        radian: calculateDegreeToRadian(90, 0),
        rotationPosition: {
          x: 138,
          y: 100,
        },
        bubble: {
          x: 94,
          y: 90.5,
          align: 'right',
          fill: '#f3f3f3',
          height: 19,
          lineWidth: 1,
          radius: 7,
          strokeStyle: 'rgba(0, 0, 0, 0)',
          style: null,
          width: 44,
        },
        label: {
          x: 131,
          y: 100,
          text: 'A',
          style: [
            {
              fillStyle: '#333333',
              font: 'normal 11px Arial',
              textAlign: 'right',
              textBaseline: 'middle',
            },
          ],
        },
      },
      {
        type: 'bubbleLabel',
        radian: calculateDegreeToRadian(90, 0),
        rotationPosition: {
          x: 113,
          y: 100,
        },
        bubble: {
          x: 69,
          y: 90.5,
          align: 'right',
          fill: '#f3f3f3',
          height: 19,
          lineWidth: 1,
          radius: 7,
          strokeStyle: 'rgba(0, 0, 0, 0)',
          style: null,
          width: 44,
        },
        label: {
          x: 106,
          y: 100,
          text: 'B',
          style: [
            {
              fillStyle: '#333333',
              font: 'normal 11px Arial',
              textAlign: 'right',
              textBaseline: 'middle',
            },
          ],
        },
      },
    ]);
  });
});
