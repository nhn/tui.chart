import treemapSeriesData from '@src/store/treemapSeriesData';

import { ChartState, TreemapSeriesData } from '@t/store/store';
import Store from '@src/store/store';
import { TreemapChartOptions, TreemapSeriesType } from '@t/options';

const data = [
  {
    label: 'A',
    children: [
      {
        label: 'B',
        data: 1,
      },
      {
        label: 'C',
        data: 1,
      },
    ],
  },
  {
    label: 'D',
    data: 2,
  },
] as TreemapSeriesType[];

describe('treemapSeriesData Store', () => {
  it('B', () => {
    const state = {
      series: {
        treemap: {
          data,
        },
      },
      theme: {
        series: {
          colors: ['#00a9ff', '#ffb840'],
        },
      },
      treemapSeries: [] as TreemapSeriesData[],
    } as ChartState<TreemapChartOptions>;

    const store = { state } as Store<TreemapChartOptions>;
    treemapSeriesData.action!.setTreemapSeriesData(store);

    expect(state.treemapSeries).toEqual([
      {
        color: '#00a9ff',
        data: 1,
        depth: 1,
        hasChild: false,
        id: '__TOAST_UI_TREEMAP_0_0',
        indexes: [0, 0],
        label: 'B',
        opacity: 0.1,
        parentId: '__TOAST_UI_TREEMAP_0',
        ratio: 0.5,
      },
      {
        color: '#00a9ff',
        data: 1,
        depth: 1,
        hasChild: false,
        id: '__TOAST_UI_TREEMAP_0_1',
        indexes: [0, 1],
        label: 'C',
        opacity: 0.15,
        parentId: '__TOAST_UI_TREEMAP_0',
        ratio: 0.5,
      },
      {
        color: '#00a9ff',
        data: 2,
        depth: 0,
        hasChild: true,
        id: '__TOAST_UI_TREEMAP_0',
        indexes: [0],
        label: 'A',
        opacity: 0,
        parentId: '__TOAST_UI_TREEMAP_ROOT',
        ratio: 0.5,
      },
      {
        color: '#ffb840',
        data: 2,
        depth: 0,
        hasChild: false,
        id: '__TOAST_UI_TREEMAP_1',
        indexes: [1],
        label: 'D',
        opacity: 0,
        parentId: '__TOAST_UI_TREEMAP_ROOT',
        ratio: 0.5,
      },
    ]);
  });
});
