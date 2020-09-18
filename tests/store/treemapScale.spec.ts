import colorValueScale from '@src/store/colorValueScale';
import Store from '@src/store/store';
import { TreemapChartOptions } from '@t/options';
import { ChartState } from '@t/store/store';

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

describe('Treemap Scale Store', () => {
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
