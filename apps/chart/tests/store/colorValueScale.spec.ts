import colorValueScale from '@src/store/colorValueScale';
import Store from '@src/store/store';
import { BaseOptions, TreemapChartOptions } from '@t/options';
import { ChartState, HeatmapSeriesData } from '@t/store/store';

describe('Treemap Scale Store', () => {
  const data = [
    {
      label: 'A',
      children: [
        {
          label: 'B',
          data: 1,
          colorValue: 1,
        },
        {
          label: 'C',
          data: 1,
          colorValue: 1,
        },
      ],
    },
    {
      label: 'D',
      data: 2,
      colorValue: 2,
    },
  ];

  it('should properly calculated according to the data', () => {
    const state = {
      layout: { plot: { width: 800, height: 500 } },
      series: { treemap: { data } },
      legend: {
        useSpectrumLegend: true,
      },
      colorValueScale: {},
      treemapSeries: [
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
          colorValue: 1,
        },
        {
          color: '#00a9ff',
          data: 2,
          depth: 1,
          hasChild: false,
          id: '__TOAST_UI_TREEMAP_0_1',
          indexes: [0, 1],
          label: 'C',
          opacity: 0.15,
          parentId: '__TOAST_UI_TREEMAP_0',
          ratio: 0.5,
          colorValue: 1,
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
          colorValue: 2,
        },
      ],
    } as ChartState<TreemapChartOptions>;

    const store = { state } as Store<TreemapChartOptions>;
    colorValueScale.action!.setColorValueScale(store);

    expect(state.colorValueScale).toEqual({
      limit: { max: 2, min: 0 },
      stepSize: 1,
      stepCount: 2,
    });
  });
});

describe('heatmap Scale Store', () => {
  const data = [
    { data: [1, 2], yCategory: 'A' },
    { data: [3, 4], yCategory: 'B' },
  ];

  const heatmapSeries: HeatmapSeriesData[] = [
    [
      { category: { x: 'A', y: 'A' }, colorValue: 1, indexes: [0, 0] },
      { category: { x: 'B', y: 'A' }, colorValue: 2, indexes: [0, 1] },
    ],
    [
      { category: { x: 'A', y: 'B' }, colorValue: 3, indexes: [1, 0] },
      { category: { x: 'B', y: 'B' }, colorValue: 4, indexes: [0, 0] },
    ],
  ];

  it('should properly calculated according to the data', () => {
    const state = {
      layout: { plot: { width: 800, height: 500 } },
      series: { heatmap: { data } },
      heatmapSeries,
      legend: {
        useSpectrumLegend: true,
      },
      colorValueScale: {},
    } as ChartState<BaseOptions>;

    const store = { state } as Store<TreemapChartOptions>;
    colorValueScale.action!.setColorValueScale(store);

    expect(state.colorValueScale).toEqual({
      limit: { max: 4, min: 0 },
      stepSize: 1,
      stepCount: 4,
    });
  });
});
