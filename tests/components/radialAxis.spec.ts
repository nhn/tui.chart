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
  axes: {
    xAxis: {},
    yAxis: {},
    radialAxis: {
      labels: ['0', '1', '2', '3', '4', '5'],
      axisSize: 50,
      centerX: 100,
      centerY: 100,
      maxLabelTextWidth: 20,
      labelTextHeight: 15,
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
        type: 'rectLabel',
        text: '1',
        style: ['rectLabel'],
        x: 100,
        y: 90,
        width: 30,
        height: 17,
        backgroundColor: '#f3f3f3',
        borderRadius: 7,
      },
      {
        type: 'rectLabel',
        text: '2',
        style: ['rectLabel'],
        x: 100,
        y: 80,
        width: 30,
        height: 17,
        backgroundColor: '#f3f3f3',
        borderRadius: 7,
      },
      {
        type: 'rectLabel',
        text: '3',
        style: ['rectLabel'],
        x: 100,
        y: 70,
        width: 30,
        height: 17,
        backgroundColor: '#f3f3f3',
        borderRadius: 7,
      },
      {
        type: 'rectLabel',
        text: '4',
        style: ['rectLabel'],
        x: 100,
        y: 60,
        width: 30,
        height: 17,
        backgroundColor: '#f3f3f3',
        borderRadius: 7,
      },
    ]);
  });
});
