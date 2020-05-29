import Store from '@src/store/store';
import { BaseOptions } from '@t/options';

describe('Store', () => {
  let store: Store<BaseOptions>;

  describe('Computed', () => {
    beforeEach(() => {
      store = new Store({
        chart: {
          width: 1,
          height: 2,
        },
        categories: [],
        series: {},
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
      store = new Store({
        chart: {
          width: 1,
          height: 2,
        },
        categories: [],
        series: {},
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
      store = new Store({
        chart: {
          width: 1,
          height: 2,
        },
        categories: [],
        series: {},
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

  // @TODO: name, state 타입에 맞춰 재작성 필요
  // describe('Module', () => {
  //   it('should set a module', () => {
  //     store = new Store();
  //
  //     let obData = 0;
  //     const watchFunc = jest.fn();
  //
  //     store.setModule({
  //       name: 'layout',
  //       state: {
  //         myModule: {
  //           data: 1
  //         }
  //       },
  //       action: {
  //         myAction: ({ state }, num) => {
  //           state.myModule.data = num;
  //         }
  //       },
  //       observe: {
  //         myObserve: ({ myModule }) => {
  //           obData = myModule.data;
  //         }
  //       },
  //       watch: {
  //         'state.data': watchFunc
  //       },
  //       computed: {
  //         dataCount: ({ myModule }) => {
  //           return myModule.data + 10;
  //         }
  //       }
  //     });
  //
  //     expect(obData).toEqual(1);
  //     store.dispatch('myAction', 5);
  //     store.dispatch('myAction', 2);
  //     expect(obData).toEqual(2);
  //     expect(store.computed.dataCount).toEqual(12);
  //     expect(watchFunc.call.length).toEqual(1);
  //   });
  // });

  describe('Action', () => {
    beforeEach(() => {
      store = new Store({
        chart: {
          width: 1,
          height: 2,
        },
        categories: [],
        series: {},
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

  it('should make state correctly', () => {
    store = new Store({
      chart: {
        width: 1,
        height: 1,
      },
      categories: [],
      series: {},
    });

    expect(store.state.chart.width).toEqual(1);
  });
  it('should make state observable to 2nd depth', () => {});

  it('should notify observable dependencies by name path', () => {
    store = new Store({
      chart: {
        width: 1,
        height: 1,
      },
      categories: [],
      series: {},
    });

    let makeMyData = 0;

    store.observe(({ chart }) => {
      makeMyData += chart.width;
    });

    store.notifyByPath('state.chart.width');

    expect(makeMyData).toEqual(2);
  });

  it('should notify observable dependencies', () => {
    store = new Store({
      chart: {
        width: 1,
        height: 1,
      },
      categories: [],
      series: {},
    });

    let makeMyData = 0;

    store.observe(({ chart }) => {
      makeMyData += chart.width;
    });

    store.notify(store.state.chart, 'width');

    expect(makeMyData).toEqual(2);
  });

  it('should make categories with coordinate data', () => {
    store = new Store({
      chart: {
        width: 1,
        height: 1,
      },
      series: {
        line: [
          {
            name: 'test',
            data: [
              { x: 10, y: 5 },
              { x: 1, y: 2 },
              { x: 3, y: 5 },
            ],
          },
        ],
      },
    });

    expect(store.state.categories).toEqual(['1', '3', '10']);

    store = new Store({
      chart: {
        width: 1,
        height: 1,
      },
      series: {
        line: [
          {
            name: 'test',
            data: [
              [10, 5],
              [1, 2],
              [3, 5],
            ],
          },
        ],
      },
    });

    expect(store.state.categories).toEqual(['1', '3', '10']);
  });
});
