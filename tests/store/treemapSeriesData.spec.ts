import treemapSeriesData, { TREEMAP_ROOT_ID } from '@src/store/treemapSeriesData';

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
  it('setTreemapSeriesData should be made data for the stack', () => {
    const state = {
      series: {
        treemap: {
          data,
        },
      },
      theme: {
        series: {
          treemap: {
            colors: ['#00a9ff', '#ffb840'],
          },
        },
      },
      treemapSeries: [] as TreemapSeriesData[],
      treemapZoomId: {
        cur: TREEMAP_ROOT_ID,
        prev: TREEMAP_ROOT_ID,
      },
      options: {
        series: {
          useColorValue: false,
        },
      },
    } as ChartState<TreemapChartOptions>;

    const store = { state } as Store<TreemapChartOptions>;
    treemapSeriesData.action!.setTreemapSeriesData(store);

    expect(state.treemapSeries).toEqual([
      {
        data: 1,
        depth: 1,
        hasChild: false,
        id: '__TOAST_UI_TREEMAP_0_0',
        indexes: [0, 0],
        label: 'B',
        parentId: '__TOAST_UI_TREEMAP_0',
        ratio: 0.5,
      },
      {
        data: 1,
        depth: 1,
        hasChild: false,
        id: '__TOAST_UI_TREEMAP_0_1',
        indexes: [0, 1],
        label: 'C',
        parentId: '__TOAST_UI_TREEMAP_0',
        ratio: 0.5,
      },
      {
        data: 2,
        depth: 0,
        hasChild: true,
        id: '__TOAST_UI_TREEMAP_0',
        indexes: [0],
        label: 'A',
        parentId: '__TOAST_UI_TREEMAP_ROOT',
        ratio: 0.5,
      },
      {
        data: 2,
        depth: 0,
        hasChild: false,
        id: '__TOAST_UI_TREEMAP_1',
        indexes: [1],
        label: 'D',
        parentId: '__TOAST_UI_TREEMAP_ROOT',
        ratio: 0.5,
      },
    ]);
  });
});
