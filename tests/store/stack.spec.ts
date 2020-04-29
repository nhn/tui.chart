import StackStore from '@src/store/stack';
import Store from '@src/store/store';
import { ColumnChartOptions } from '@t/options';

describe('store/stack', () => {
  let store;
  let initStoreState;

  beforeEach(() => {
    initStoreState = {
      chart: {
        width: 1000,
        height: 600
      },
      series: {
        column: []
      }
    };
  });

  it('should initialize the stack option, If the stack option is entered as a boolean trushy value', () => {
    store = new Store(
      Object.assign(initStoreState, {
        options: {
          series: {
            stack: true
          }
        } as ColumnChartOptions
      })
    );

    store.setModule(StackStore);

    expect(store.state.stack).toEqual({
      use: true,
      option: {
        type: 'normal',
        connector: false
      }
    });
  });

  it('should be set as the entered stack option, if the stack option is an object', () => {
    store = new Store(
      Object.assign(initStoreState, {
        options: {
          series: {
            stack: {
              type: 'percent',
              connector: true
            }
          }
        } as ColumnChartOptions
      })
    );

    store.setModule(StackStore);

    expect(store.state.stack).toEqual({
      use: true,
      option: {
        type: 'percent',
        connector: true
      }
    });
  });

  it('should return false, if the stack option is not used', () => {
    store = new Store(initStoreState);

    store.setModule(StackStore);

    expect(store.state.stack).toEqual({
      use: false,
      option: {}
    });
  });
});
