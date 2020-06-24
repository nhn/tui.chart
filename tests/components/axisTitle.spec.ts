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
        style: ['axisTitle', { textAlign: 'left' }],
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
        style: ['axisTitle', { textAlign: 'left' }],
        text: 'yAxisTitle',
        type: 'label',
        x: 100,
        y: 100,
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
        style: ['axisTitle', { textAlign: 'right' }],
        text: 'xAxisTitle',
        type: 'label',
        x: 50,
        y: 50,
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
        style: ['axisTitle', { textAlign: 'right' }],
        text: 'xAxisTitle',
        type: 'label',
        x: 150,
        y: 150,
      },
    ]);
  });
});
