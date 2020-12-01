import seriesData from '@src/store/seriesData';
import { ChartState, InitStoreState, Scale, StateFunc } from '@t/store/store';
import { LineChartOptions, LineSeriesType } from '@t/options';
import Store from '@src/store/store';

describe('SeriesData store', () => {
  describe('state initialize', () => {
    it('init series data', () => {
      const state = (seriesData.state as StateFunc)({
        series: {
          line: [
            { name: 'han', data: [2, 3] },
            { name: 'cho', data: [4, 5] },
          ] as LineSeriesType[],
        },
        categories: ['A', 'B'],
        options: {},
      });

      expect(state.rawCategories).toEqual(['A', 'B']);
      expect(state.series).toEqual({
        line: [
          { data: [2, 3], name: 'han' },
          { data: [4, 5], name: 'cho' },
        ],
      });
      expect(state.zoomRange).toBeUndefined();
      expect(state.disabledSeries).toEqual([]);
    });

    it('init series data with zoom options', () => {
      const state = (seriesData.state as StateFunc)({
        series: {
          line: [
            { name: 'han', data: [2, 3] },
            { name: 'cho', data: [4, 5] },
          ] as LineSeriesType[],
        },
        categories: ['A', 'B'],
        options: {
          series: {
            zoomable: true,
          },
        },
      });

      expect(state.zoomRange).toEqual([0, 1]);
    });
  });

  describe('action', () => {
    it('setSeriesData make series properly after zooming', () => {
      const state = {
        chart: { width: 120, height: 120 },
        layout: {
          plot: { width: 100, height: 150, x: 30, y: 10 },
          yAxis: { x: 10, y: 10, width: 10, height: 80 },
          xAxis: { x: 10, y: 10, width: 80, height: 10 },
        },
        scale: { xAxis: { limit: { min: 0, max: 5 }, stepSize: 1, stepCount: 1 } } as Scale,
        series: {
          line: {
            data: [
              { name: 'han', data: [1, 3, 4], rawData: [1, 3, 5] },
              { name: 'cho', data: [5, 2, 4], rawData: [5, 2, 4] },
            ],
          },
        },
        axes: {
          xAxis: {},
          yAxis: {},
        },
        categories: ['B'],
        rawCategories: ['A', 'B', 'C'],
        options: {},
        zoomRange: [1, 1],
        theme: {
          series: {
            line: {
              colors: ['#aaaaaa', '#bbbbbb'],
            },
          },
        },
        disabledSeries: [] as string[],
      } as ChartState<LineChartOptions>;

      const initStoreState = {
        series: {
          line: [
            { name: 'han', data: [1, 3, 4], rawData: [1, 3, 5], color: '#aaaaaa' },
            { name: 'cho', data: [5, 2, 4], rawData: [5, 2, 4], color: '#bbbbbb' },
          ],
        },
        options: {
          zoomable: true,
        },
      } as InitStoreState<LineChartOptions>;

      const store = { state, initStoreState } as Store<LineChartOptions>;
      seriesData.action!.setSeriesData(store);

      expect(store.state.series).toEqual({
        line: {
          data: [
            {
              color: '#aaaaaa',
              data: [3, 4],
              name: 'han',
              rawData: [1, 3, 4],
            },
            {
              color: '#bbbbbb',
              data: [2, 4],
              name: 'cho',
              rawData: [5, 2, 4],
            },
          ],
          colors: ['#aaaaaa', '#bbbbbb'],
          seriesCount: 2,
          seriesGroupCount: 2,
        },
      });
    });
  });
});
