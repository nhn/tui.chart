import heatmapSeriesData from '@src/store/heatmapSeriesData';

import { ChartState, HeatmapSeriesData } from '@t/store/store';
import Store from '@src/store/store';
import { BaseOptions } from '@t/options';

const data = [
  { data: [1, 2], yCategory: 'A' },
  { data: [3, 4], yCategory: 'B' },
];

describe('heatmapSeriesData Store', () => {
  it('setHeatmapSeriesData should be made data for the stack', () => {
    const state = {
      series: {
        heatmap: {
          data,
        },
      },
      theme: {},
      heatmapSeries: [] as HeatmapSeriesData[],
      categories: {
        x: ['A', 'B'],
        y: ['A', 'B'],
      },
      options: {},
    } as ChartState<BaseOptions>;

    const computed: Record<string, any> = {
      viewRange: [0, 1],
    };

    const store = { state, computed } as Store<BaseOptions>;
    heatmapSeriesData.action!.setHeatmapSeriesData(store);

    expect(state.heatmapSeries).toEqual([
      [
        {
          category: {
            x: 'A',
            y: 'A',
          },
          colorValue: 1,
          indexes: [0, 0],
        },
        {
          category: {
            x: 'B',
            y: 'A',
          },
          colorValue: 2,
          indexes: [1, 0],
        },
      ],
      [
        {
          category: {
            x: 'A',
            y: 'B',
          },
          colorValue: 3,
          indexes: [0, 1],
        },
        {
          category: {
            x: 'B',
            y: 'B',
          },
          colorValue: 4,
          indexes: [1, 1],
        },
      ],
    ]);
  });
});
