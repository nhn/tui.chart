import nestedPieSeriesData from '@src/store/nestedPieSeriesData';
import { InitStoreState } from '@t/store/store';
import Store from '@src/store/store';
import { PieDonutChartOptions } from '@t/options';

describe('NestedPieSeriesData store', () => {
  describe('setNestedPieSeriesData', () => {
    const theme = {
      series: {
        colors: ['#aaaaaa', '#bbbbbb', '#cccccc', '#dddddd'],
      },
    };

    it('should make nested pie series data', () => {
      const state = {
        series: {
          pieDonut: {
            data: [
              {
                name: 'pie1',
                data: [
                  { name: 'han', data: 50 },
                  { name: 'cho', data: 50 },
                ],
                rawData: [
                  { name: 'han', data: 50 },
                  { name: 'cho', data: 50 },
                ],
                color: '#aaaaaa',
              },
              {
                name: 'pie2',
                data: [
                  { name: 'kim', data: 60 },
                  { name: 'lee', data: 40 },
                ],
                rawData: [
                  { name: 'kim', data: 60 },
                  { name: 'lee', data: 40 },
                ],
                color: '#bbbbbb',
              },
            ],
          },
        },
        options: {},
        theme,
        nestedPieSeries: {},
        disabledSeries: [],
      } as any;

      const initStoreState = {
        series: {
          pieDonut: [
            {
              name: 'pie1',
              data: [
                { name: 'han', data: 50 },
                { name: 'cho', data: 50 },
              ],
            },
            {
              name: 'pie2',
              data: [
                { name: 'kim', data: 60 },
                { name: 'lee', data: 40 },
              ],
            },
          ],
        },
        options: {},
      } as InitStoreState<PieDonutChartOptions>;

      const store = { state, initStoreState } as Store<PieDonutChartOptions>;
      nestedPieSeriesData.action!.setNestedPieSeriesData(store);

      expect(state.nestedPieSeries).toEqual({
        pie1: {
          data: [
            {
              color: '#aaaaaa',
              data: 50,
              name: 'han',
              rootParent: 'han',
            },
            {
              color: '#bbbbbb',
              data: 50,
              name: 'cho',
              rootParent: 'cho',
            },
          ],
        },
        pie2: {
          data: [
            {
              color: '#cccccc',
              data: 60,
              name: 'kim',
              rootParent: 'kim',
            },
            {
              color: '#dddddd',
              data: 40,
              name: 'lee',
              rootParent: 'lee',
            },
          ],
        },
      });
    });

    it('should make nested pie series data for using grouped option', () => {
      const state = {
        series: {
          pieDonut: {
            data: [
              {
                name: 'pie1',
                data: [
                  { name: 'han', data: 50 },
                  { name: 'cho', data: 50 },
                ],
                rawData: [
                  { name: 'han', data: 50 },
                  { name: 'cho', data: 50 },
                ],
                color: '#aaaaaa',
              },
              {
                name: 'pie2',
                data: [
                  { name: 'han1', parent: 'han', data: 30 },
                  { name: 'han2', parent: 'han', data: 20 },
                  { name: 'cho1', parent: 'cho', data: 40 },
                  { name: 'cho2', parent: 'cho', data: 10 },
                ],
                rawData: [
                  { name: 'han1', parent: 'han', data: 30 },
                  { name: 'han2', parent: 'han', data: 20 },
                  { name: 'cho1', parent: 'cho', data: 40 },
                  { name: 'cho2', parent: 'cho', data: 10 },
                ],
                color: '#bbbbbb',
              },
            ],
          },
        },
        theme,
        nestedPieSeries: {},
        disabledSeries: [],
      } as any;

      const initStoreState = {
        series: {
          pieDonut: [
            {
              name: 'pie1',
              data: [
                { name: 'han', data: 50 },
                { name: 'cho', data: 50 },
              ],
            },
            {
              name: 'pie2',
              data: [
                { name: 'han1', parent: 'han', data: 30 },
                { name: 'han2', parent: 'han', data: 20 },
                { name: 'cho1', parent: 'cho', data: 40 },
                { name: 'cho2', parent: 'cho', data: 10 },
              ],
            },
          ],
        },
        options: {},
      } as InitStoreState<PieDonutChartOptions>;

      const store = { state, initStoreState } as Store<PieDonutChartOptions>;
      nestedPieSeriesData.action!.setNestedPieSeriesData(store);

      expect(state.nestedPieSeries).toEqual({
        pie1: {
          data: [
            {
              color: '#aaaaaa',
              data: 50,
              name: 'han',
              rootParent: 'han',
            },
            {
              color: '#bbbbbb',
              data: 50,
              name: 'cho',
              rootParent: 'cho',
            },
          ],
        },
        pie2: {
          data: [
            { name: 'han1', parent: 'han', data: 30, color: '#aaaaaa', rootParent: 'han' },
            { name: 'han2', parent: 'han', data: 20, color: '#aaaaaa', rootParent: 'han' },
            { name: 'cho1', parent: 'cho', data: 40, color: '#bbbbbb', rootParent: 'cho' },
            { name: 'cho2', parent: 'cho', data: 10, color: '#bbbbbb', rootParent: 'cho' },
          ],
        },
      });
    });
  });
});
