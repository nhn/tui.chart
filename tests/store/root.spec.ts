import root from '@src/store/root';
import { StateFunc } from '@t/store/store';

describe('Root store', () => {
  describe('state', () => {
    it('could make default states', () => {
      const state = (root.state as StateFunc)({ options: {} } as any);

      expect(state).toEqual({
        chart: { width: 0, height: 0 },
        container: {},
        usingContainerSize: { height: false, width: false },
      });
    });

    it('should make states chart option', () => {
      const state = (root.state as StateFunc)({
        options: { chart: { width: 1, height: 2 } },
      } as any);

      expect(state.chart).toEqual({ width: 1, height: 2 });
    });
  });

  describe('action', () => {
    describe('initChartSize', () => {
      it('should setup chart size if container has attached', () => {
        const dispatch = jest.fn();

        root.action!.initChartSize.call(
          { dispatch },
          { state: { chart: { width: 0, height: 0 } } } as any,
          {
            parentNode: {},
            offsetWidth: 1,
            offsetHeight: 2,
          }
        );

        expect(dispatch.mock.calls[0]).toEqual(['setChartSize', { width: 1, height: 2 }]);
      });

      it('could be wait one frame expect for container has been attached to get chart size', () => {
        const dispatch = jest.fn();

        jest.useFakeTimers();

        root.action!.initChartSize.call(
          { dispatch },
          { state: { chart: { width: 0, height: 0 } } } as any,
          {
            parentNode: null,
            offsetWidth: 1,
            offsetHeight: 2,
          }
        );

        jest.advanceTimersByTime(0);

        jest.clearAllTimers();

        expect(dispatch.mock.calls[0]).toEqual(['setChartSize', { width: 1, height: 2 }]);
      });
    });
  });
});
