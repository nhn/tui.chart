import Title from '@src/component/title';
import Store from '@src/store/store';
import { LineChartOptions } from '@t/options';
import EventEmitter from '@src/eventEmitter';
import { deepMergedCopy } from '@src/helpers/utils';

let title;

const chartState = {
  options: {
    chart: {
      title: { text: 'hey', align: 'left' },
    },
  },
  layout: {
    title: {
      x: 0,
      y: 0,
      height: 100,
      width: 100,
    },
  },
  theme: {
    title: {
      fontSize: 18,
      fontFamily: 'Arial',
      fontWeight: 200,
      color: '#333333',
    },
  },
};

describe('Title', () => {
  const alignResult = {
    center: {
      style: ['title', { fillStyle: '#333333', font: '200 18px Arial' }],
      text: 'hey',
      type: 'label',
      x: 48.5,
      y: 0,
    },
    right: {
      style: ['title', { fillStyle: '#333333', font: '200 18px Arial' }],
      text: 'hey',
      type: 'label',
      x: 97,
      y: 0,
    },
    left: {
      style: ['title', { fillStyle: '#333333', font: '200 18px Arial' }],
      text: 'hey',
      type: 'label',
      x: 0,
      y: 0,
    },
  };

  beforeEach(() => {
    title = new Title({
      store: {} as Store<LineChartOptions>,
      eventBus: new EventEmitter(),
    });
  });

  Object.keys(alignResult).forEach((align) => {
    it(`get different title start point followed align: ${align}`, () => {
      const state = deepMergedCopy(chartState, { options: { chart: { title: { align } } } });
      title.render(state);

      expect(title.models).toEqual([alignResult[align]]);
    });
  });

  it('should return x, y start position applied offsetX, offsetY', () => {
    const state = deepMergedCopy(chartState, {
      options: { chart: { title: { offsetX: 100, offsetY: 100 } } },
    });
    title.render(state);

    expect(title.models).toEqual([
      {
        style: ['title', { fillStyle: '#333333', font: '200 18px Arial' }],
        text: 'hey',
        type: 'label',
        x: 100,
        y: 100,
      },
    ]);
  });
});
