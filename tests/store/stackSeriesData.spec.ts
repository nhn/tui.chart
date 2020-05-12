import seriesData from '@src/store/seriesData';
import stackSeriesData from '@src/store/stackSeriesData';

import Store from '@src/store/store';
import { BarChartOptions } from '@t/options';

const data = [
  { name: 'han', data: [1, 2, 3] },
  { name: 'cho', data: [4, 5, 6] }
];

describe('StackSeriesData Store', () => {
  let store: Store<BarChartOptions>;

  describe('Initialize', () => {
    it('should be initialized with default values, if the stack option is true only', () => {
      store = new Store({
        options: {
          series: {
            stack: true
          }
        },
        series: {
          bar: data
        }
      });

      store.setModule(seriesData);
      store.setModule(stackSeriesData);

      expect(store.state.stackSeries.bar!.stack).toEqual({
        type: 'normal',
        connector: false
      });
    });

    it('should reset the connector to default value, if the connector is true only', () => {
      store = new Store({
        options: {
          series: {
            stack: {
              type: 'normal',
              connector: true
            }
          }
        },
        series: {
          bar: data
        }
      });

      store.setModule(seriesData);
      store.setModule(stackSeriesData);

      expect(store.state.stackSeries.bar!.stack).toEqual({
        type: 'normal',
        connector: {
          type: 'solid',
          color: 'rgba(51, 85, 139, 0.3)',
          width: 1
        }
      });
    });

    it('should be extended from the connector default, if the connector type is object', () => {
      store = new Store({
        options: {
          series: {
            stack: {
              type: 'percent',
              connector: {
                type: 'dashed',
                color: '#ff0000'
              }
            }
          }
        },
        series: {
          bar: data
        }
      });

      store.setModule(seriesData);
      store.setModule(stackSeriesData);

      expect(store.state.stackSeries.bar!.stack).toEqual({
        type: 'percent',
        connector: {
          type: 'dashed',
          color: '#ff0000',
          width: 1
        }
      });
    });
  });

  describe('StackData', () => {
    it('makeStackData', () => {
      store = new Store({
        options: {
          series: {
            stack: true
          }
        },
        series: {
          bar: data
        }
      });

      store.setModule(seriesData);
      store.setModule(stackSeriesData);

      expect(store.state.stackSeries.bar!.stackData).toEqual([
        {
          values: [1, 4],
          sum: 5
        },
        {
          values: [2, 5],
          sum: 7
        },
        {
          values: [3, 6],
          sum: 9
        }
      ]);
    });

    it('makeStackGroupData', () => {
      store = new Store({
        options: {
          series: {
            stack: {
              type: 'normal'
            }
          }
        },
        series: {
          bar: [
            {
              name: 'test1',
              data: [1, 2, 3],
              stackGroup: 'A'
            },
            {
              name: 'test2',
              data: [2, 4, 6],
              stackGroup: 'B'
            },
            {
              name: 'test3',
              data: [3, 4, 5],
              stackGroup: 'A'
            },
            {
              name: 'test4',
              data: [4, 1, 1],
              stackGroup: 'B'
            }
          ]
        }
      });

      store.setModule(seriesData);
      store.setModule(stackSeriesData);

      expect(store.state.stackSeries.bar!.stackData).toEqual({
        A: [
          { values: [1, 3], sum: 4 },
          { values: [2, 4], sum: 6 },
          { values: [3, 5], sum: 8 }
        ],
        B: [
          { values: [2, 4], sum: 6 },
          { values: [4, 1], sum: 5 },
          { values: [6, 1], sum: 7 }
        ]
      });
    });
  });
});
