import RadialAxis from '@src/component/radialAxis';
import Store from '@src/store/store';
import EventEmitter from '@src/eventEmitter';
import { Options } from '@t/store/store';

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
    yAxis: {
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
    radialAxis: {
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
    radialAxis: {
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

describe('Radar Axis', () => {
  radialAxis = new RadialAxis({
    store: {} as Store<Options>,
    eventBus: new EventEmitter(),
  });

  radialAxis.render(chartState);

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
    radialAxisLabel: [
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
    yAxisLabel: [
      {
        type: 'bubbleLabel',
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
          style: [],
        },
        label: {
          text: '1',
          x: 100,
          y: 80,
          font: 'normal 11px Arial',
          color: '#333333',
          textAlign: 'center',
        },
      },
      {
        type: 'bubbleLabel',
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
          style: [],
        },
        label: {
          text: '2',
          x: 100,
          y: 70,
          font: 'normal 11px Arial',
          color: '#333333',
          textAlign: 'center',
        },
      },
      {
        type: 'bubbleLabel',
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
          style: [],
        },
        label: {
          text: '3',
          x: 100,
          y: 60,
          font: 'normal 11px Arial',
          color: '#333333',
          textAlign: 'center',
        },
      },
    ],
  };

  ['dot', 'radialAxisLabel', 'yAxisLabel'].forEach((modelName) => {
    it(`should make ${modelName} properly when calling render`, () => {
      expect(radialAxis.models[modelName]).toEqual(result[modelName]);
    });
  });
});
