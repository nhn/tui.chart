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
  scale: { yAxis: { limit: { min: 1, max: 4 }, stepSize: 1, stepCount: 1 } },
  series: {
    radar: {
      data: seriesData,
    },
  },
  axes: {
    xAxis: {},
    yAxis: {},
    radialAxis: {
      labels: ['1', '2', '3', '4', '5'],
      axisSize: 50,
      centerX: 100,
      centerY: 100,
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
};

describe('Radar Axis', () => {
  beforeEach(() => {
    radialAxis = new RadialAxis({
      store: {} as Store<Options>,
      eventBus: new EventEmitter(),
    });
  });

  it('should be create label models', () => {
    radialAxis.render(chartState);

    expect(radialAxis.models).toEqual([
      {
        type: 'label',
        text: '1',
        style: ['default', { textAlign: 'center' }],
        x: 100,
        y: 90,
      },
      {
        type: 'label',
        text: '2',
        style: ['default', { textAlign: 'center' }],
        x: 100,
        y: 80,
      },
      {
        type: 'label',
        text: '3',
        style: ['default', { textAlign: 'center' }],
        x: 100,
        y: 70,
      },
      {
        type: 'label',
        text: '4',
        style: ['default', { textAlign: 'center' }],
        x: 100,
        y: 60,
      },
    ]);
  });
});
