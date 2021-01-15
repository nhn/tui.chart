import { BaseOptions } from '@t/options';
import HeatmapSeries from '@src/component/heatmapSeries';
import Store from '@src/store/store';
import EventEmitter from '@src/eventEmitter';

let heatmapSeries;

describe('basic', () => {
  beforeEach(() => {
    const chartState = {
      chart: { width: 210, height: 100 },
      theme: {
        series: {
          heatmap: {
            colors: ['#00a9ff', '#ffb840'],
            startColor: '#00a9ff',
            endColor: '#ffb840',
            borderWidth: 0,
            borderColor: '#fff',
          },
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
          data: [
            { data: [1, 2], yCategory: 'A' },
            { data: [3, 4], yCategory: 'B' },
          ],
          seriesCount: 2,
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
    };

    heatmapSeries = new HeatmapSeries({
      store: {} as Store<BaseOptions>,
      eventBus: new EventEmitter(),
    });

    heatmapSeries.render(chartState, { viewRange: [0, 1] });
  });

  const result = {
    rect: { width: 210, height: 100, x: 0, y: 0 },
    responders: [
      {
        color: '#3facd0',
        colorRatio: 0.25,
        colorValue: 1,
        borderColor: '#fff',
        data: {
          borderColor: '#fff',
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
          templateType: 'heatmap',
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
        borderColor: '#fff',
        data: {
          borderColor: '#fff',
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
          templateType: 'heatmap',
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
        borderColor: '#fff',
        data: {
          borderColor: '#fff',
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
          templateType: 'heatmap',
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
        borderColor: '#fff',
        data: {
          borderColor: '#fff',
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
          templateType: 'heatmap',
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
    models: {
      series: [
        {
          borderColor: '#fff',
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
          borderColor: '#fff',
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
          borderColor: '#fff',
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
          borderColor: '#fff',
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
    },
  };

  ['rect', 'responders', 'models'].forEach((modelName) => {
    it(`should make ${modelName} properly when calling render`, () => {
      expect(heatmapSeries[modelName]).toEqual(result[modelName]);
    });
  });
});

describe('with null data', () => {
  beforeEach(() => {
    heatmapSeries = new HeatmapSeries({
      store: {} as Store<BaseOptions>,
      eventBus: new EventEmitter(),
    });

    const chartState = {
      chart: { width: 210, height: 100 },
      theme: {
        series: {
          heatmap: {
            colors: ['#00a9ff', '#ffb840'],
            startColor: '#00a9ff',
            endColor: '#ffb840',
            borderWidth: 0,
            borderColor: '#fff',
          },
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
        y: ['A'],
      },
      rawCategories: {
        x: ['A', 'B'],
        y: ['A'],
      },
      series: {
        heatmap: {
          data: [{ data: [null, 2], yCategory: 'A' }],
          seriesCount: 1,
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
            colorValue: null,
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
      ],
      options: {
        series: {},
      },
      dataLabels: {
        visible: false,
      },
    };

    heatmapSeries.render(chartState);
  });

  const result = {
    rect: { width: 210, height: 100, x: 0, y: 0 },
    responders: [
      {
        color: '#7fb0a0',
        colorRatio: 0.5,
        colorValue: 2,
        borderColor: '#fff',
        data: {
          borderColor: '#fff',
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
          templateType: 'heatmap',
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
    ],
    models: {
      series: [
        {
          borderColor: '#fff',
          color: 'rgba(0, 0, 0, 0)',
          colorRatio: 0,
          colorValue: null,
          height: 40,
          name: 'A, A',
          thickness: 0,
          type: 'rect',
          width: 40,
          x: 0,
          y: 0,
        },
        {
          borderColor: '#fff',
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
      ],
    },
  };

  ['rect', 'responders', 'models'].forEach((modelName) => {
    it(`should make ${modelName} properly when calling render`, () => {
      expect(heatmapSeries[modelName]).toEqual(result[modelName]);
    });
  });
});
