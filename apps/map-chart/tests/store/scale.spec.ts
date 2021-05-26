import scale from '@src/store/scale';
import { InitStoreState } from '@t/store';
import Store from '@src/store/store';

const commonState = {
  chart: { width: 800, height: 800 },
  scale: {},
};

const initStoreState = {
  data: [
    { code: 'A', data: 100 },
    { code: 'B', data: 30 },
    { code: 'C', data: 50 },
  ],
} as InitStoreState;

describe('scale is determined by the align and size of legend', () => {
  it('should use width, when vertical align is used', () => {
    const state = {
      ...commonState,
      legend: { width: 150, height: 50, align: 'top' },
    };
    const store = { state, initStoreState } as Store;
    scale.action!.setScale(store);

    expect(state.scale).toEqual({
      limit: { min: 20, max: 100 },
      stepCount: 4,
      stepSize: 20,
    });
  });

  it('should use height, when horizontal align is used', () => {
    const state = {
      ...commonState,
      legend: { width: 50, height: 150, align: 'right' },
    };
    const store = { state, initStoreState } as Store;
    scale.action!.setScale(store);

    expect(state.scale).toEqual({
      limit: { min: 20, max: 100 },
      stepCount: 4,
      stepSize: 20,
    });
  });
});
