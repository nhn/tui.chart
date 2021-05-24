import layout from '@src/store/layout';
import Store from '@src/store/store';
import { ChartState } from '@t/store';

it('should create a layout properly by combining each state', () => {
  const state = {
    chart: { width: 800, height: 800 },
    legend: { visible: true, width: 150, height: 50, align: 'bottom' },
    layout: {},
  };

  const store = { state } as Store;
  layout.action!.setLayout(store);

  expect(state.layout).toEqual({
    chart: {
      height: 800,
      width: 800,
      x: 0,
      y: 0,
    },
    legend: {
      height: 50,
      width: 150,
      x: 325,
      y: 750,
    },
    map: {
      height: 750,
      width: 800,
      x: 0,
      y: 50,
    },
    title: {
      height: 50,
      width: 737,
      x: 0,
      y: 0,
    },
    zoomButton: {
      height: 50,
      width: 63,
      x: 737,
      y: 0,
    },
  });
});

describe('x, y positions change according to the legend align', () => {
  const commonState = {
    chart: { width: 800, height: 800 },
    layout: {},
  };

  it('top', () => {
    const state = {
      ...commonState,
      legend: { visible: true, width: 150, height: 50, align: 'top' },
    } as ChartState;

    const store = { state } as Store;
    layout.action!.setLayout(store);

    expect(state.layout.legend).toEqual({
      x: 325,
      y: 50,
      height: 50,
      width: 150,
    });
  });

  it('bottom', () => {
    const state = {
      ...commonState,
      legend: { visible: true, width: 150, height: 50, align: 'bottom' },
    } as ChartState;

    const store = { state } as Store;
    layout.action!.setLayout(store);

    expect(state.layout.legend).toEqual({
      x: 325,
      y: 750,
      height: 50,
      width: 150,
    });
  });

  it('left', () => {
    const state = {
      ...commonState,
      legend: { visible: true, width: 50, height: 150, align: 'left' },
    } as ChartState;

    const store = { state } as Store;
    layout.action!.setLayout(store);

    expect(state.layout.legend).toEqual({
      x: 0,
      y: 325,
      height: 150,
      width: 50,
    });
  });

  it('right', () => {
    const state = {
      ...commonState,
      legend: { visible: true, width: 50, height: 150, align: 'right' },
    } as ChartState;
    const store = { state } as Store;
    layout.action!.setLayout(store);

    expect(state.layout.legend).toEqual({
      x: 750,
      y: 325,
      height: 150,
      width: 50,
    });
  });
});
