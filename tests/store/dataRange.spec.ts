import Store from '@src/store/store';
import { LineChartOptions } from '@t/options';
import { ChartState } from '@t/store/store';
import dataRange from '@src/store/dataRange';
import { deepMergedCopy } from '@src/helpers/utils';

describe('dataRange Store module', () => {
  const state = {
    series: {
      line: {
        data: [
          { name: 'han', data: [1, 4] },
          { name: 'cho', data: [5, 2] },
        ],
      },
    },
    disabledSeries: [] as string[],
    rawCategories: ['A', 'B'],
    categories: ['A', 'B'],
    options: {},
    dataRange: {},
  } as ChartState<LineChartOptions>;

  describe('setDataRange', () => {
    it('normal', () => {
      const store = { state } as Store<LineChartOptions>;
      dataRange.action!.setDataRange(store);

      expect(state.dataRange).toEqual({
        line: { yAxis: { max: 5, min: 1 } },
      });
    });

    it('should set min, max value properly using coordinate type value', () => {
      const data = deepMergedCopy(state, {
        series: {
          line: {
            data: [
              {
                name: 'han',
                data: [
                  { x: 1, y: 1 },
                  { x: 2, y: 4 },
                ],
              },
              {
                name: 'cho',
                data: [
                  { x: 1, y: 5 },
                  { x: 3, y: 2 },
                ],
              },
            ],
          },
        },
        rawCategories: ['1', '2', '3'],
        categories: ['1', '2', '3'],
      });
      const store = { state: data } as Store<LineChartOptions>;
      dataRange.action!.setDataRange(store);

      expect(state.dataRange).toEqual({
        line: { yAxis: { max: 5, min: 1 }, xAxis: { max: 3, min: 1 } },
      });
    });

    it('should set ms min, max value properly using coordinate datetime type xAxis value', () => {
      const data = deepMergedCopy(state, {
        series: {
          line: {
            data: [
              {
                name: 'han',
                data: [
                  ['2020/08/02', 1],
                  ['2020/08/03', 4],
                ],
              },
              {
                name: 'cho',
                data: [
                  ['2020/08/02', 5],
                  ['2020/08/04', 2],
                ],
              },
            ],
          },
        },
        rawCategories: ['2020/08/02', '2020/08/03', '2020/08/04'],
        categories: ['2020/08/02', '2020/08/03', '2020/08/04'],
        options: {
          xAxis: {
            date: true,
          },
        },
      });
      const store = { state: data } as Store<LineChartOptions>;
      dataRange.action!.setDataRange(store);

      expect(state.dataRange).toEqual({
        line: {
          yAxis: { max: 5, min: 1 },
          xAxis: { max: Number(new Date('2020/08/04')), min: Number(new Date('2020/08/02')) },
        },
      });
    });
  });
});
