import root from '@src/store/root';
import { StateFunc } from '@t/store';

it('should apply chart options to chart store', () => {
  const state = (root.state as StateFunc)({
    options: { chart: { width: 800, height: 800 } },
    data: [],
  });

  expect(state.chart).toEqual({
    height: 800,
    width: 800,
  });
});
