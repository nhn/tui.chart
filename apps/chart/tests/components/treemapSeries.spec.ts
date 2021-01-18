import { AreaChartOptions } from '@t/options';
import TreemapSeries from '@src/component/treemapSeries';
import Store from '@src/store/store';
import EventEmitter from '@src/eventEmitter';
import { deepMergedCopy } from '@src/helpers/utils';
import { TREEMAP_ROOT_ID } from '@src/store/treemapSeriesData';

let treemapSeries;

function getChartState(seriesData, options?: any) {
  return deepMergedCopy(
    {
      chart: { width: 210, height: 100 },
      theme: {
        series: {
          treemap: {
            colors: ['#00a9ff', '#ffb840'],
            startColor: '#00a9ff',
            endColor: '#ffb840',
          },
        },
      },
      colorValueScale: {
        limit: {
          min: 1,
          max: 2,
        },
        stepSize: 1,
        stepCount: 2,
      },
      layout: {
        plot: { width: 210, height: 100, x: 0, y: 0 },
      },
      series: {
        treemap: {
          data: seriesData,
          seriesCount: seriesData.length,
          seriesGroupCount: 0,
        },
      },
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
      ],
      options: {
        series: {},
      },
      dataLabels: {
        visible: false,
      },
      treemapZoomId: {
        cur: TREEMAP_ROOT_ID,
        prev: TREEMAP_ROOT_ID,
      },
    },
    { ...options }
  );
}

describe('basic', () => {
  beforeEach(() => {
    const seriesData = [
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
    ];

    treemapSeries = new TreemapSeries({
      store: {} as Store<AreaChartOptions>,
      eventBus: new EventEmitter(),
    });

    treemapSeries.render(getChartState(seriesData));
  });

  const result = {
    rect: { width: 210, height: 100, x: 0, y: 0 },
    responders: [
      {
        color: '#00a9ff',
        data: { color: '#00a9ff', label: 'A', value: 2 },
        depth: 0,
        hasChild: true,
        height: 100,
        id: '__TOAST_UI_TREEMAP_0',
        indexes: [0],
        label: 'A',
        opacity: 0,
        parentId: '__TOAST_UI_TREEMAP_ROOT',
        ratio: 0.5,
        style: ['shadow'],
        thickness: 4,
        type: 'rect',
        width: 105,
        x: 0,
        y: 0,
      },
      {
        color: '#ffb840',
        data: { color: '#ffb840', label: 'D', value: 2 },
        depth: 0,
        hasChild: false,
        height: 100,
        id: '__TOAST_UI_TREEMAP_1',
        indexes: [1],
        label: 'D',
        opacity: 0,
        parentId: '__TOAST_UI_TREEMAP_ROOT',
        ratio: 0.5,
        style: ['shadow'],
        thickness: 4,
        type: 'rect',
        width: 105,
        x: 105,
        y: 0,
      },
      {
        color: '#00a9ff',
        data: { color: '#00a9ff', label: 'C', value: 2 },
        depth: 1,
        hasChild: false,
        height: 100,
        id: '__TOAST_UI_TREEMAP_0_1',
        indexes: [0, 1],
        label: 'C',
        opacity: 0.15,
        parentId: '__TOAST_UI_TREEMAP_0',
        ratio: 0.5,
        style: ['shadow'],
        thickness: 4,
        type: 'rect',
        width: 70,
        x: 0,
        y: 0,
      },
      {
        color: '#00a9ff',
        data: { color: '#00a9ff', label: 'B', value: 1 },
        depth: 1,
        hasChild: false,
        height: 100,
        id: '__TOAST_UI_TREEMAP_0_0',
        indexes: [0, 0],
        label: 'B',
        opacity: 0.1,
        parentId: '__TOAST_UI_TREEMAP_0',
        ratio: 0.5,
        style: ['shadow'],
        thickness: 4,
        type: 'rect',
        width: 35,
        x: 70,
        y: 0,
      },
    ],
    models: {
      layer: [
        {
          color: 'rgba(0, 0, 0, 0)',
          data: 2,
          depth: 0,
          hasChild: true,
          height: 100,
          id: '__TOAST_UI_TREEMAP_0',
          indexes: [0],
          label: 'A',
          opacity: 0,
          parentId: '__TOAST_UI_TREEMAP_ROOT',
          ratio: 0.5,
          type: 'rect',
          width: 105,
          x: 0,
          y: 0,
        },
        {
          color: 'rgba(0, 0, 0, 0)',
          data: 2,
          depth: 0,
          hasChild: false,
          height: 100,
          id: '__TOAST_UI_TREEMAP_1',
          indexes: [1],
          label: 'D',
          opacity: 0,
          parentId: '__TOAST_UI_TREEMAP_ROOT',
          ratio: 0.5,
          type: 'rect',
          width: 105,
          x: 105,
          y: 0,
        },
        {
          color: 'rgba(0, 0, 0, 0.15)',
          data: 2,
          depth: 1,
          hasChild: false,
          height: 100,
          id: '__TOAST_UI_TREEMAP_0_1',
          indexes: [0, 1],
          label: 'C',
          opacity: 0.15,
          parentId: '__TOAST_UI_TREEMAP_0',
          ratio: 0.5,
          type: 'rect',
          width: 70,
          x: 0,
          y: 0,
        },
        {
          color: 'rgba(0, 0, 0, 0.1)',
          data: 1,
          depth: 1,
          hasChild: false,
          height: 100,
          id: '__TOAST_UI_TREEMAP_0_0',
          indexes: [0, 0],
          label: 'B',
          opacity: 0.1,
          parentId: '__TOAST_UI_TREEMAP_0',
          ratio: 0.5,
          type: 'rect',
          width: 35,
          x: 70,
          y: 0,
        },
      ],
      series: [
        {
          color: '#00a9ff',
          data: 2,
          depth: 0,
          hasChild: true,
          height: 100,
          id: '__TOAST_UI_TREEMAP_0',
          indexes: [0],
          label: 'A',
          opacity: 0,
          parentId: '__TOAST_UI_TREEMAP_ROOT',
          ratio: 0.5,
          type: 'rect',
          width: 105,
          x: 0,
          y: 0,
        },
        {
          color: '#ffb840',
          data: 2,
          depth: 0,
          hasChild: false,
          height: 100,
          id: '__TOAST_UI_TREEMAP_1',
          indexes: [1],
          label: 'D',
          opacity: 0,
          parentId: '__TOAST_UI_TREEMAP_ROOT',
          ratio: 0.5,
          type: 'rect',
          width: 105,
          x: 105,
          y: 0,
        },
        {
          color: '#00a9ff',
          data: 2,
          depth: 1,
          hasChild: false,
          height: 100,
          id: '__TOAST_UI_TREEMAP_0_1',
          indexes: [0, 1],
          label: 'C',
          opacity: 0.15,
          parentId: '__TOAST_UI_TREEMAP_0',
          ratio: 0.5,
          type: 'rect',
          width: 70,
          x: 0,
          y: 0,
        },
        {
          color: '#00a9ff',
          data: 1,
          depth: 1,
          hasChild: false,
          height: 100,
          id: '__TOAST_UI_TREEMAP_0_0',
          indexes: [0, 0],
          label: 'B',
          opacity: 0.1,
          parentId: '__TOAST_UI_TREEMAP_0',
          ratio: 0.5,
          type: 'rect',
          width: 35,
          x: 70,
          y: 0,
        },
      ],
    },
  };

  ['rect', 'responders', 'models'].forEach((modelName) => {
    it(`should make ${modelName} properly when calling render`, () => {
      expect(treemapSeries[modelName]).toEqual(result[modelName]);
    });
  });
});

describe('with colorValue', () => {
  beforeEach(() => {
    treemapSeries = new TreemapSeries({
      store: {} as Store<AreaChartOptions>,
      eventBus: new EventEmitter(),
    });

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

    treemapSeries.render(
      getChartState(data, {
        options: { series: { useColorValue: true } },
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
      })
    );
  });

  const result = {
    rect: { width: 210, height: 100, x: 0, y: 0 },
    responders: [
      {
        color: '',
        data: { color: '', label: 'A', value: 2 },
        depth: 0,
        hasChild: true,
        height: 100,
        id: '__TOAST_UI_TREEMAP_0',
        indexes: [0],
        label: 'A',
        opacity: 0,
        parentId: '__TOAST_UI_TREEMAP_ROOT',
        ratio: 0.5,
        style: ['shadow'],
        thickness: 4,
        type: 'rect',
        width: 105,
        x: 0,
        y: 0,
      },
      {
        color: '#ffb840',
        data: { color: '#ffb840', label: 'D', value: 2 },
        colorRatio: 1,
        colorValue: 2,
        depth: 0,
        hasChild: false,
        height: 100,
        id: '__TOAST_UI_TREEMAP_1',
        indexes: [1],
        label: 'D',
        opacity: 0,
        parentId: '__TOAST_UI_TREEMAP_ROOT',
        ratio: 0.5,
        style: ['shadow'],
        thickness: 4,
        type: 'rect',
        width: 105,
        x: 105,
        y: 0,
      },
      {
        color: '#00a9ff',
        data: { color: '#00a9ff', label: 'C', value: 2 },
        colorRatio: 0,
        colorValue: 1,
        depth: 1,
        hasChild: false,
        height: 100,
        id: '__TOAST_UI_TREEMAP_0_1',
        indexes: [0, 1],
        label: 'C',
        opacity: 0,
        parentId: '__TOAST_UI_TREEMAP_0',
        ratio: 0.5,
        style: ['shadow'],
        thickness: 4,
        type: 'rect',
        width: 70,
        x: 0,
        y: 0,
      },
      {
        color: '#00a9ff',
        data: { color: '#00a9ff', label: 'B', value: 1 },
        colorRatio: 0,
        colorValue: 1,
        depth: 1,
        hasChild: false,
        height: 100,
        id: '__TOAST_UI_TREEMAP_0_0',
        indexes: [0, 0],
        label: 'B',
        opacity: 0,
        parentId: '__TOAST_UI_TREEMAP_0',
        ratio: 0.5,
        style: ['shadow'],
        thickness: 4,
        type: 'rect',
        width: 35,
        x: 70,
        y: 0,
      },
    ],
    models: {
      layer: [],
      series: [
        {
          color: '',
          data: 2,
          depth: 0,
          hasChild: true,
          height: 100,
          id: '__TOAST_UI_TREEMAP_0',
          indexes: [0],
          label: 'A',
          opacity: 0,
          parentId: '__TOAST_UI_TREEMAP_ROOT',
          ratio: 0.5,
          type: 'rect',
          width: 105,
          x: 0,
          y: 0,
        },
        {
          color: '#ffb840',
          colorValue: 2,
          colorRatio: 1,
          data: 2,
          depth: 0,
          hasChild: false,
          height: 100,
          id: '__TOAST_UI_TREEMAP_1',
          indexes: [1],
          label: 'D',
          opacity: 0,
          parentId: '__TOAST_UI_TREEMAP_ROOT',
          ratio: 0.5,
          type: 'rect',
          width: 105,
          x: 105,
          y: 0,
        },
        {
          color: '#00a9ff',
          data: 2,
          depth: 1,
          colorValue: 1,
          colorRatio: 0,
          hasChild: false,
          height: 100,
          id: '__TOAST_UI_TREEMAP_0_1',
          indexes: [0, 1],
          label: 'C',
          opacity: 0,
          parentId: '__TOAST_UI_TREEMAP_0',
          ratio: 0.5,
          type: 'rect',
          width: 70,
          x: 0,
          y: 0,
        },
        {
          color: '#00a9ff',
          colorRatio: 0,
          colorValue: 1,
          data: 1,
          depth: 1,
          hasChild: false,
          height: 100,
          id: '__TOAST_UI_TREEMAP_0_0',
          indexes: [0, 0],
          label: 'B',
          opacity: 0,
          parentId: '__TOAST_UI_TREEMAP_0',
          ratio: 0.5,
          type: 'rect',
          width: 35,
          x: 70,
          y: 0,
        },
      ],
    },
  };

  ['rect', 'responders', 'models'].forEach((modelName) => {
    it(`should make ${modelName} properly when calling render`, () => {
      expect(treemapSeries[modelName]).toEqual(result[modelName]);
    });
  });
});

describe('zoom', () => {
  beforeEach(() => {
    const seriesData = [
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
    ];

    treemapSeries = new TreemapSeries({
      store: {} as Store<AreaChartOptions>,
      eventBus: new EventEmitter(),
    });

    treemapSeries.render(
      getChartState(seriesData, {
        treemapZoomId: {
          cur: '__TOAST_UI_TREEMAP_0',
          prev: TREEMAP_ROOT_ID,
        },
        options: {
          zoomable: true,
        },
      })
    );
  });

  const models = {
    layer: [
      {
        color: 'rgba(0, 0, 0, 0.15)',
        data: 2,
        depth: 1,
        hasChild: false,
        height: 100,
        id: '__TOAST_UI_TREEMAP_0_1',
        indexes: [0, 1],
        label: 'C',
        opacity: 0.15,
        parentId: '__TOAST_UI_TREEMAP_0',
        ratio: 0.5,
        type: 'rect',
        width: 140,
        x: 0,
        y: 0,
      },
      {
        color: 'rgba(0, 0, 0, 0.1)',
        data: 1,
        depth: 1,
        hasChild: false,
        height: 100,
        id: '__TOAST_UI_TREEMAP_0_0',
        indexes: [0, 0],
        label: 'B',
        opacity: 0.1,
        parentId: '__TOAST_UI_TREEMAP_0',
        ratio: 0.5,
        type: 'rect',
        width: 70,
        x: 140,
        y: 0,
      },
    ],
    series: [
      {
        color: '#00a9ff',
        data: 2,
        depth: 1,
        hasChild: false,
        height: 100,
        id: '__TOAST_UI_TREEMAP_0_1',
        indexes: [0, 1],
        label: 'C',
        opacity: 0.15,
        parentId: '__TOAST_UI_TREEMAP_0',
        ratio: 0.5,
        type: 'rect',
        width: 140,
        x: 0,
        y: 0,
      },
      {
        color: '#00a9ff',
        data: 1,
        depth: 1,
        hasChild: false,
        height: 100,
        id: '__TOAST_UI_TREEMAP_0_0',
        indexes: [0, 0],
        label: 'B',
        opacity: 0.1,
        parentId: '__TOAST_UI_TREEMAP_0',
        ratio: 0.5,
        type: 'rect',
        width: 70,
        x: 140,
        y: 0,
      },
    ],
  };

  it(`only the model inside the zoom area is created`, () => {
    expect(treemapSeries.models).toEqual(models);
  });
});

describe('with null data', () => {
  beforeEach(() => {
    const chartState = {
      chart: { width: 210, height: 100 },
      theme: {
        series: {
          treemap: {
            colors: ['#00a9ff', '#ffb840'],
            startColor: '#00a9ff',
            endColor: '#ffb840',
          },
        },
      },
      colorValueScale: {
        limit: {
          min: 1,
          max: 2,
        },
        stepSize: 1,
        stepCount: 2,
      },
      layout: {
        plot: { width: 210, height: 100, x: 0, y: 0 },
      },
      series: {
        treemap: {
          data: [
            {
              label: 'A',
              children: [
                {
                  label: 'B',
                  data: 1,
                },
                {
                  label: 'C',
                  data: null,
                },
              ],
            },
            {
              label: 'D',
              data: null,
            },
          ],
        },
      },
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
          ratio: 1,
        },
        {
          color: '#00a9ff',
          data: 1,
          depth: 0,
          hasChild: true,
          id: '__TOAST_UI_TREEMAP_0',
          indexes: [0],
          label: 'A',
          opacity: 0,
          parentId: '__TOAST_UI_TREEMAP_ROOT',
          ratio: 1,
        },
      ],
      options: {
        series: {},
      },
      dataLabels: {
        visible: false,
      },
      treemapZoomId: {
        cur: TREEMAP_ROOT_ID,
        prev: TREEMAP_ROOT_ID,
      },
    };

    treemapSeries = new TreemapSeries({
      store: {} as Store<AreaChartOptions>,
      eventBus: new EventEmitter(),
    });

    treemapSeries.render(chartState);
  });

  const models = {
    layer: [
      {
        color: 'rgba(0, 0, 0, 0)',
        data: 1,
        depth: 0,
        hasChild: true,
        height: 100,
        id: '__TOAST_UI_TREEMAP_0',
        indexes: [0],
        label: 'A',
        opacity: 0,
        parentId: '__TOAST_UI_TREEMAP_ROOT',
        ratio: 1,
        type: 'rect',
        width: 210,
        x: 0,
        y: 0,
      },
      {
        color: 'rgba(0, 0, 0, 0.1)',
        data: 1,
        depth: 1,
        hasChild: false,
        height: 100,
        id: '__TOAST_UI_TREEMAP_0_0',
        indexes: [0, 0],
        label: 'B',
        opacity: 0.1,
        parentId: '__TOAST_UI_TREEMAP_0',
        ratio: 1,
        type: 'rect',
        width: 210,
        x: 0,
        y: 0,
      },
    ],
    series: [
      {
        color: '#00a9ff',
        data: 1,
        depth: 0,
        hasChild: true,
        height: 100,
        id: '__TOAST_UI_TREEMAP_0',
        indexes: [0],
        label: 'A',
        opacity: 0,
        parentId: '__TOAST_UI_TREEMAP_ROOT',
        ratio: 1,
        type: 'rect',
        width: 210,
        x: 0,
        y: 0,
      },
      {
        color: '#00a9ff',
        data: 1,
        depth: 1,
        hasChild: false,
        height: 100,
        id: '__TOAST_UI_TREEMAP_0_0',
        indexes: [0, 0],
        label: 'B',
        opacity: 0.1,
        parentId: '__TOAST_UI_TREEMAP_0',
        ratio: 1,
        type: 'rect',
        width: 210,
        x: 0,
        y: 0,
      },
    ],
  };

  it(`render model properly`, () => {
    expect(treemapSeries.models).toEqual(models);
  });
});
