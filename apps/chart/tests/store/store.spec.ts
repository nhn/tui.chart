import Store from '@src/store/store';
import { BaseOptions } from '@t/options';
import { ChartOptions } from '@t/store/store';

describe('Store', () => {
  let store: Store<BaseOptions>;

  describe('Computed', () => {
    beforeEach(() => {
      store = new Store({} as any);

      store.setRootState({
        chart: { width: 1, height: 2 },
      });
    });
    it('should computed property correctly', () => {
      store.setComputed('cdata', ({ chart }) => {
        return chart.width + chart.height;
      });

      expect(store.computed.cdata).toEqual(3);
    });
  });

  describe('Observe', () => {
    beforeEach(() => {
      store = new Store({} as any);

      store.setRootState({
        chart: { width: 1, height: 2 },
      });
    });
    it('should observe observable correctly', () => {
      let cdata;

      store.observe(({ chart }) => {
        cdata = chart.width + chart.height;
      });

      store.state.chart.width = 2;

      expect(cdata).toEqual(4);
    });
    it('could unobserve correctly', () => {
      let cdata;

      const unob = store.observe(({ chart }) => {
        cdata = chart.width + chart.height;
      });

      unob();

      store.state.chart.width = 2;

      expect(cdata).toEqual(3);
    });
  });

  describe('watcher', () => {
    beforeEach(() => {
      store = new Store({} as any);

      store.setRootState({
        chart: { width: 1, height: 2 },
      });
    });
    it('should watcher property correctly', () => {
      let count = 0;

      store.setWatch('state.chart.width', (width) => {
        count += width;
      });

      store.state.chart.width = 2;
      store.state.chart.width = 3;

      expect(count).toEqual(5);
    });

    it('could unwatch correctly', () => {
      let count = 0;

      const unwatch = store.setWatch('state.chart.width', (width) => {
        count += width;
      });

      store.state.chart.width = 2;

      if (unwatch) {
        unwatch();
      }

      store.state.chart.width = 3;

      expect(count).toEqual(2);
    });
  });

  describe('Module', () => {
    it('should set state', () => {
      store = new Store({ series: {}, options: {} });

      store.setModule({
        name: 'layout',
        state: {
          chart: {
            width: 1,
            height: 2,
          },
        },
      });

      expect(store.state.chart.width).toEqual(1);
    });

    it('should set state with state function', () => {
      store = new Store({ series: {}, options: { chart: { width: 10, height: 15 } } });

      store.setModule({
        name: 'layout',
        state: ({ options }) => ({ chart: options.chart as ChartOptions }),
      });

      expect(store.state.chart.width).toEqual(10);
    });

    it('should set a action, observe, watch, computed', () => {
      store = new Store({ series: {}, options: {} });

      let obData = 0;
      const watchFunc = jest.fn();

      store.setModule({
        name: 'layout',
        state: {
          chart: {
            width: 1,
          },
        } as any,
        action: {
          myAction: ({ state }, num) => {
            state.chart.width = num;
          },
        },
        observe: {
          myObserve: ({ chart }) => {
            obData = chart.width;
          },
        },
        watch: {
          'state.data': watchFunc,
        },
        computed: {
          dataCount: ({ chart }) => {
            return chart.width + 10;
          },
        },
      });

      expect(obData).toEqual(1);
      store.dispatch('myAction', 5);
      store.dispatch('myAction', 2);
      expect(obData).toEqual(2);
      expect(store.computed.dataCount).toEqual(12);
      expect(watchFunc.call.length).toEqual(1);
    });
  });

  describe('Action', () => {
    beforeEach(() => {
      store = new Store({} as any);

      store.setRootState({
        chart: { width: 1, height: 2 },
      });
    });

    it('should set action and dispatch', () => {
      store.setAction('chageWidth', ({ state }, amount: number) => {
        state.chart.width = amount;
      });

      store.dispatch('chageWidth', 5);

      expect(store.state.chart.width).toEqual(5);
    });
  });

  it('should make state correctly with setRootState()', () => {
    store = new Store({} as any);

    store.setRootState({
      chart: { width: 1, height: 2 },
    });

    expect(store.state).toEqual({ chart: { width: 1, height: 2 } });
  });

  it('should notify observable dependencies by name path', () => {
    store = new Store({} as any);

    store.setRootState({
      chart: { width: 1, height: 2 },
    });

    let makeMyData = 0;

    store.observe(({ chart }) => {
      makeMyData += chart.width;
    });

    store.notifyByPath('state.chart.width');

    expect(makeMyData).toEqual(2);
  });

  it('should notify observable dependencies', () => {
    store = new Store({} as any);

    store.setRootState({
      chart: { width: 1, height: 2 },
    });

    let makeMyData = 0;

    store.observe(({ chart }) => {
      makeMyData += chart.width;
    });

    store.notify(store.state.chart, 'width');

    expect(makeMyData).toEqual(2);
  });
});
