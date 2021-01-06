import nestedPieSeriesData from '@src/store/nestedPieSeriesData';
import { InitStoreState } from '@t/store/store';
import Store from '@src/store/store';
import { NestedPieChartOptions } from '@t/options';

const dispatch = () => {};

describe('NestedPieSeriesData store', () => {
  describe('setNestedPieSeriesData', () => {
    const theme = {
      series: {
        pie: {
          pie1: {
            colors: ['#aaaaaa', '#bbbbbb'],
          },
          pie2: {
            colors: ['#cccccc', '#dddddd'],
          },
        },
      },
    };

    it('should make nested pie series data', () => {
      const state = {
        series: {
          pie: {
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
          pie: [
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
      } as InitStoreState<NestedPieChartOptions>;

      const store = { state, initStoreState } as Store<NestedPieChartOptions>;
      nestedPieSeriesData.action!.setNestedPieSeriesData.call({ dispatch }, store);

      expect(state.nestedPieSeries).toEqual({
        pie1: {
          data: [
            {
              color: '#aaaaaa',
              data: 50,
              name: 'han',
              rootParentName: 'han',
            },
            {
              color: '#bbbbbb',
              data: 50,
              name: 'cho',
              rootParentName: 'cho',
            },
          ],
          colors: ['#aaaaaa', '#bbbbbb'],
        },
        pie2: {
          data: [
            {
              color: '#cccccc',
              data: 60,
              name: 'kim',
              rootParentName: 'kim',
            },
            {
              color: '#dddddd',
              data: 40,
              name: 'lee',
              rootParentName: 'lee',
            },
          ],
          colors: ['#cccccc', '#dddddd'],
        },
      });
    });

    it('should make nested pie series data for using grouped option', () => {
      const state = {
        series: {
          pie: {
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
                  { name: 'han1', parentName: 'han', data: 30 },
                  { name: 'han2', parentName: 'han', data: 20 },
                  { name: 'cho1', parentName: 'cho', data: 40 },
                  { name: 'cho2', parentName: 'cho', data: 10 },
                ],
                rawData: [
                  { name: 'han1', parentName: 'han', data: 30 },
                  { name: 'han2', parentName: 'han', data: 20 },
                  { name: 'cho1', parentName: 'cho', data: 40 },
                  { name: 'cho2', parentName: 'cho', data: 10 },
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
          pie: [
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
                { name: 'han1', parentName: 'han', data: 30 },
                { name: 'han2', parentName: 'han', data: 20 },
                { name: 'cho1', parentName: 'cho', data: 40 },
                { name: 'cho2', parentName: 'cho', data: 10 },
              ],
            },
          ],
        },
        options: {},
      } as InitStoreState<NestedPieChartOptions>;

      const store = { state, initStoreState } as Store<NestedPieChartOptions>;
      nestedPieSeriesData.action!.setNestedPieSeriesData.call({ dispatch }, store);

      expect(state.nestedPieSeries).toEqual({
        pie1: {
          data: [
            {
              color: '#aaaaaa',
              data: 50,
              name: 'han',
              rootParentName: 'han',
            },
            {
              color: '#bbbbbb',
              data: 50,
              name: 'cho',
              rootParentName: 'cho',
            },
          ],
          colors: ['#aaaaaa', '#bbbbbb'],
        },
        pie2: {
          data: [
            { name: 'han1', parentName: 'han', data: 30, color: '#aaaaaa', rootParentName: 'han' },
            { name: 'han2', parentName: 'han', data: 20, color: '#aaaaaa', rootParentName: 'han' },
            { name: 'cho1', parentName: 'cho', data: 40, color: '#bbbbbb', rootParentName: 'cho' },
            { name: 'cho2', parentName: 'cho', data: 10, color: '#bbbbbb', rootParentName: 'cho' },
          ],
          colors: ['#aaaaaa', '#aaaaaa', '#bbbbbb', '#bbbbbb'],
        },
      });
    });
  });
});
