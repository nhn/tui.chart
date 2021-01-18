import AxisTitle from '@src/component/axisTitle';
import Store from '@src/store/store';
import { LineChartOptions } from '@t/options';
import EventEmitter from '@src/eventEmitter';
import { deepMergedCopy } from '@src/helpers/utils';

let title;

const chartState = {
  axes: {
    xAxis: { title: { text: 'xAxisTitle', offsetX: 0, offsetY: 0 } },
    yAxis: { title: { text: 'yAxisTitle', offsetX: 0, offsetY: 0 } },
  },
  layout: {
    yAxisTitle: { x: 100, y: 100, height: 100, width: 100 },
    xAxisTitle: { x: 50, y: 50, height: 50, width: 50 },
  },
  theme: {
    yAxis: {
      title: {
        fontSize: 11,
        fontFamily: 'Arial',
        fontWeight: 700,
        color: '#bbbbbb',
      },
    },
    xAxis: {
      title: {
        fontSize: 11,
        fontFamily: 'Arial',
        fontWeight: 700,
        color: '#bbbbbb',
      },
    },
  },
};

describe('yAxisTitle', () => {
  beforeEach(() => {
    title = new AxisTitle({
      store: {} as Store<LineChartOptions>,
      eventBus: new EventEmitter(),
    });

    title.initialize({ name: 'yAxis' });
  });

  it('render model', () => {
    title.render(chartState);

    expect(title.models).toEqual([
      {
        style: ['axisTitle', { textAlign: 'left', fillStyle: '#bbbbbb', font: '700 11px Arial' }],
        text: 'yAxisTitle',
        type: 'label',
        x: 0,
        y: 0,
      },
    ]);
  });

  it('should return x, y start position applied offsetX, offsetY', () => {
    const state = deepMergedCopy(chartState, {
      axes: { yAxis: { title: { offsetX: 100, offsetY: 100 } } },
    });
    title.render(state);

    expect(title.models).toEqual([
      {
        style: ['axisTitle', { textAlign: 'left', fillStyle: '#bbbbbb', font: '700 11px Arial' }],
        text: 'yAxisTitle',
        type: 'label',
        x: 100,
        y: 100,
      },
    ]);
  });

  it('should be center alignment, when using the center y-axis', () => {
    const state = deepMergedCopy(chartState, {
      axes: { centerYAxis: {} },
    });
    title.render(state);

    expect(title.models).toEqual([
      {
        style: ['axisTitle', { textAlign: 'center', fillStyle: '#bbbbbb', font: '700 11px Arial' }],
        text: 'yAxisTitle',
        type: 'label',
        x: 0,
        y: 0,
      },
    ]);
  });

  it('should render to the right side, when using secondary Y Axis', () => {
    title.initialize({ name: 'secondaryYAxis' });

    const state = deepMergedCopy(chartState, {
      axes: {
        secondaryYAxis: {
          title: { text: 'secondaryYAxisTitle', offsetX: 0, offsetY: 0 },
        },
      },
      layout: {
        yAxisTitle: { x: 0, y: 0, height: 100, width: 50 },
        secondaryYAxisTitle: { x: 50, y: 0, height: 100, width: 50 },
      },
      yAxis: {
        title: {
          fontSize: 11,
          fontFamily: 'Arial',
          fontWeight: 700,
          color: '#bbbbbb',
        },
      },
      xAxis: {
        title: {
          fontSize: 11,
          fontFamily: 'Arial',
          fontWeight: 700,
          color: '#bbbbbb',
        },
      },
    });
    title.render(state);

    expect(title.models).toEqual([
      {
        style: ['axisTitle', { textAlign: 'right', fillStyle: '#bbbbbb', font: '700 11px Arial' }],
        text: 'secondaryYAxisTitle',
        type: 'label',
        x: 50,
        y: 0,
      },
    ]);
  });
});

describe('xAxisTitle', () => {
  beforeEach(() => {
    title = new AxisTitle({
      store: {} as Store<LineChartOptions>,
      eventBus: new EventEmitter(),
    });

    title.initialize({ name: 'xAxis' });
  });

  it('render model', () => {
    title.render(chartState);

    expect(title.models).toEqual([
      {
        style: ['axisTitle', { textAlign: 'right', fillStyle: '#bbbbbb', font: '700 11px Arial' }],
        text: 'xAxisTitle',
        type: 'label',
        x: 50,
        y: 0,
      },
    ]);
  });

  it('should return x, y start position applied offsetX, offsetY', () => {
    const state = deepMergedCopy(chartState, {
      axes: { xAxis: { title: { offsetX: 100, offsetY: 100 } } },
    });
    title.render(state);

    expect(title.models).toEqual([
      {
        style: ['axisTitle', { textAlign: 'right', fillStyle: '#bbbbbb', font: '700 11px Arial' }],
        text: 'xAxisTitle',
        type: 'label',
        x: 150,
        y: 100,
      },
    ]);
  });
});
