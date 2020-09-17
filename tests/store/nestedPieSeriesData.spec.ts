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
                alias: 'pie1',
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
                alias: 'pie2',
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
              alias: 'pie1',
              data: [
                { name: 'han', data: 50 },
                { name: 'cho', data: 50 },
              ],
            },
            {
              alias: 'pie2',
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
            },
            {
              color: '#bbbbbb',
              data: 50,
              name: 'cho',
            },
          ],
        },
        pie2: {
          data: [
            {
              color: '#cccccc',
              data: 60,
              name: 'kim',
            },
            {
              color: '#dddddd',
              data: 40,
              name: 'lee',
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
                alias: 'pie1',
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
                alias: 'pie2',
                data: [
                  { name: 'han', data: 60 },
                  { name: 'cho', data: 40 },
                ],
                rawData: [
                  { name: 'han', data: 60 },
                  { name: 'cho', data: 40 },
                ],
                color: '#bbbbbb',
              },
            ],
          },
        },
        options: { series: { grouped: true } },
        theme,
        nestedPieSeries: {},
        disabledSeries: [],
      } as any;

      const initStoreState = {
        series: {
          pieDonut: [
            {
              alias: 'pie1',
              data: [
                { name: 'han', data: 50 },
                { name: 'cho', data: 50 },
              ],
            },
            {
              alias: 'pie2',
              data: [
                { name: 'han', data: 60 },
                { name: 'cho', data: 40 },
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
            },
            {
              color: '#bbbbbb',
              data: 50,
              name: 'cho',
            },
          ],
        },
        pie2: {
          data: [
            {
              color: '#aaaaaa',
              data: 60,
              name: 'han',
            },
            {
              color: '#bbbbbb',
              data: 40,
              name: 'cho',
            },
          ],
        },
      });
    });
  });
});
