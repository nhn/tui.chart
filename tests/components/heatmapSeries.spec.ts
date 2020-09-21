import { BaseOptions } from '@t/options';
import HeatmapSeries from '@src/component/heatmapSeries';
import Store from '@src/store/store';
import EventEmitter from '@src/eventEmitter';
import { deepMergedCopy } from '@src/helpers/utils';

let heatmapSeries;

function getChartState(seriesData, options?: any) {
  return deepMergedCopy(
    {
      chart: { width: 210, height: 100 },
      theme: {
        series: {
          colors: ['#00a9ff', '#ffb840'],
          startColor: '#00a9ff',
          endColor: '#ffb840',
        },
      },
      axes: {
        yAxis: { tickDistance: 40 },
        xAxis: { tickDistance: 40 },
      },
      colorValueScale: {
        limit: { max: 4, min: 0 },
        stepSize: 1,
        stepCount: 4,
      },
      layout: {
        plot: { width: 210, height: 100, x: 0, y: 0 },
      },
      categories: {
        x: ['A', 'B'],
        y: ['A', 'B'],
      },
      rawCategories: {
        x: ['A', 'B'],
        y: ['A', 'B'],
      },
      series: {
        heatmap: {
          data: seriesData,
          seriesCount: seriesData.length,
          seriesGroupCount: 0,
        },
      },
      heatmapSeries: [
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
      ],
      options: {
        series: {},
      },
      dataLabels: {
        visible: false,
      },
    },
    { ...options }
  );
}

describe('basic', () => {
  beforeEach(() => {
    const seriesData = [
      { data: [1, 2], yCategory: 'A' },
      { data: [3, 4], yCategory: 'B' },
    ];

    heatmapSeries = new HeatmapSeries({
      store: {} as Store<BaseOptions>,
      eventBus: new EventEmitter(),
    });

    heatmapSeries.render(getChartState(seriesData));
  });

  const result = {
    rect: { width: 210, height: 100, x: 0, y: 0 },
    responders: [
      {
        color: '#3facd0',
        colorRatio: 0.25,
        colorValue: 1,
        data: {
          color: '#3facd0',
          colorRatio: 0.25,
          colorValue: 1,
          height: 40,
          label: 'A, A',
          name: 'A, A',
          thickness: 0,
          type: 'rect',
          value: 1,
          width: 40,
          x: 0,
          y: 0,
        },
        height: 40,
        name: 'A, A',
        style: ['shadow'],
        thickness: 4,
        type: 'rect',
        width: 40,
        x: 0,
        y: 0,
      },
      {
        color: '#7fb0a0',
        colorRatio: 0.5,
        colorValue: 2,
        data: {
          color: '#7fb0a0',
          colorRatio: 0.5,
          colorValue: 2,
          height: 40,
          label: 'B, A',
          name: 'B, A',
          thickness: 0,
          type: 'rect',
          value: 2,
          width: 40,
          x: 40,
          y: 0,
        },
        height: 40,
        name: 'B, A',
        style: ['shadow'],
        thickness: 4,
        type: 'rect',
        width: 40,
        x: 40,
        y: 0,
      },
      {
        color: '#bfb470',
        colorRatio: 0.75,
        colorValue: 3,
        data: {
          color: '#bfb470',
          colorRatio: 0.75,
          colorValue: 3,
          height: 40,
          label: 'A, B',
          name: 'A, B',
          thickness: 0,
          type: 'rect',
          value: 3,
          width: 40,
          x: 0,
          y: 40,
        },
        height: 40,
        name: 'A, B',
        style: ['shadow'],
        thickness: 4,
        type: 'rect',
        width: 40,
        x: 0,
        y: 40,
      },
      {
        color: '#ffb840',
        colorRatio: 1,
        colorValue: 4,
        data: {
          color: '#ffb840',
          colorRatio: 1,
          colorValue: 4,
          height: 40,
          label: 'B, B',
          name: 'B, B',
          thickness: 0,
          type: 'rect',
          value: 4,
          width: 40,
          x: 40,
          y: 40,
        },
        height: 40,
        name: 'B, B',
        style: ['shadow'],
        thickness: 4,
        type: 'rect',
        width: 40,
        x: 40,
        y: 40,
      },
    ],
    models: [
      {
        color: '#3facd0',
        colorRatio: 0.25,
        colorValue: 1,
        height: 40,
        name: 'A, A',
        thickness: 0,
        type: 'rect',
        width: 40,
        x: 0,
        y: 0,
      },
      {
        color: '#7fb0a0',
        colorRatio: 0.5,
        colorValue: 2,
        height: 40,
        name: 'B, A',
        thickness: 0,
        type: 'rect',
        width: 40,
        x: 40,
        y: 0,
      },
      {
        color: '#bfb470',
        colorRatio: 0.75,
        colorValue: 3,
        height: 40,
        name: 'A, B',
        thickness: 0,
        type: 'rect',
        width: 40,
        x: 0,
        y: 40,
      },
      {
        color: '#ffb840',
        colorRatio: 1,
        colorValue: 4,
        height: 40,
        name: 'B, B',
        thickness: 0,
        type: 'rect',
        width: 40,
        x: 40,
        y: 40,
      },
    ],
  };

  ['rect', 'responders', 'models'].forEach((modelName) => {
    it(`should make ${modelName} properly when calling render`, () => {
      expect(heatmapSeries[modelName]).toEqual(result[modelName]);
    });
  });
});
