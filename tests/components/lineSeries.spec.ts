import { LineChartOptions } from '@t/options';
import LineSeries from '@src/component/lineSeries';
import Store from '@src/store/store';
import EventEmitter from '@src/eventEmitter';
import { deepMergedCopy } from '@src/helpers/utils';

let lineSeries;

describe('basic', () => {
  const seriesData = [
    { name: 'han', data: [1, 2], rawData: [1, 2], color: '#aaaaaa' },
    { name: 'cho', data: [4, 5], rawData: [4, 5], color: '#bbbbbb' },
  ];

  const chartState = {
    chart: { width: 100, height: 100 },
    layout: {
      xAxis: { x: 10, y: 80, width: 80, height: 10 },
      yAxis: { x: 10, y: 10, width: 10, height: 80 },
      plot: { width: 80, height: 80, x: 10, y: 80 },
    },
    series: {
      line: {
        data: seriesData,
        seriesCount: seriesData.length,
        seriesGroupCount: seriesData[0].data.length,
      },
    },
    scale: {
      yAxis: {
        limit: {
          min: 1,
          max: 5,
        },
      },
    },
    axes: {
      xAxis: {
        pointOnColumn: true,
        tickDistance: 40,
      },
    },
    options: {
      series: {},
    },
    legend: {
      data: [
        { label: 'han', active: true, checked: true },
        { label: 'cho', active: true, checked: true },
      ],
    },
    rawCategories: ['A', 'B'],
    categories: ['A', 'B'],
    dataLabels: {
      visible: false,
    },
  };

  beforeEach(() => {
    lineSeries = new LineSeries({
      store: {} as Store<LineChartOptions>,
      eventBus: new EventEmitter(),
    });

    lineSeries.render(chartState);
  });

  const result = {
    rect: { width: 80, height: 80, x: 10, y: 80 },
    models: {
      rect: [{ height: 80, type: 'clipRectArea', width: 80, x: 0, y: 0 }],
      series: [
        {
          color: 'rgba(170, 170, 170, 1)',
          lineWidth: 3,
          points: [
            { value: 1, x: 20, y: 80 },
            { value: 2, x: 60, y: 60 },
          ],
          seriesIndex: 0,
          type: 'linePoints',
          name: 'han',
        },
        {
          color: 'rgba(187, 187, 187, 1)',
          lineWidth: 3,
          points: [
            { value: 4, x: 20, y: 20 },
            { value: 5, x: 60, y: 0 },
          ],
          seriesIndex: 1,
          type: 'linePoints',
          name: 'cho',
        },
      ],
      dot: [],
      selectedSeries: [],
    },
    drawModels: {
      rect: [{ height: 80, type: 'clipRectArea', width: 0, x: 0, y: 0 }],
      series: [
        {
          color: 'rgba(0, 0, 0, 0)',
          lineWidth: 3,
          points: [
            { value: 1, x: 20, y: 80 },
            { value: 2, x: 60, y: 60 },
            { x: 60, y: 80 },
            { x: 20, y: 80 },
          ],
          seriesIndex: 0,
          type: 'linePoints',
        },
        {
          color: 'rgba(0, 0, 0, 0)',
          lineWidth: 3,
          points: [
            { value: 4, x: 20, y: 20 },
            { value: 5, x: 60, y: 0 },
            { x: 60, y: 80 },
            { x: 20, y: 80 },
          ],
          seriesIndex: 1,
          type: 'linePoints',
        },
      ],
      selectedSeries: [],
    },
  };

  ['rect', 'models'].forEach((modelName) => {
    it(`should make ${modelName} properly when calling render`, () => {
      expect(lineSeries[modelName]).toEqual(result[modelName]);
    });
  });
});

describe('responders', () => {
  const seriesData = [
    { name: 'han', data: [1, 2], rawData: [1, 2], color: '#aaaaaa' },
    { name: 'cho', data: [4, 5], rawData: [4, 5], color: '#bbbbbb' },
  ];

  const chartState = {
    chart: { width: 100, height: 100 },
    layout: {
      xAxis: { x: 10, y: 80, width: 80, height: 10 },
      yAxis: { x: 10, y: 10, width: 10, height: 80 },
      plot: { width: 80, height: 80, x: 10, y: 80 },
    },
    series: {
      line: {
        data: seriesData,
        seriesCount: seriesData.length,
        seriesGroupCount: seriesData[0].data.length,
      },
    },
    scale: {
      yAxis: {
        limit: {
          min: 1,
          max: 5,
        },
      },
    },
    axes: {
      xAxis: {
        pointOnColumn: true,
        tickDistance: 40,
        tickCount: 2,
      },
    },
    options: {
      series: {},
    },
    legend: {
      data: [
        { label: 'han', active: true, checked: true },
        { label: 'cho', active: true, checked: true },
      ],
    },
    rawCategories: ['A', 'B'],
    categories: ['A', 'B'],
    dataLabels: {
      visible: false,
    },
  };

  beforeEach(() => {
    lineSeries = new LineSeries({
      store: {} as Store<LineChartOptions>,
      eventBus: new EventEmitter(),
    });
  });

  const result = {
    near: [
      {
        color: 'rgba(170, 170, 170, 1)',
        data: { category: 'A', color: '#aaaaaa', label: 'han', value: 1 },
        radius: 7,
        index: 0,
        seriesIndex: 0,
        style: ['default', 'hover'],
        type: 'circle',
        x: 20,
        y: 80,
        name: 'han',
      },
      {
        color: 'rgba(170, 170, 170, 1)',
        data: { category: 'B', color: '#aaaaaa', label: 'han', value: 2 },
        radius: 7,
        index: 1,
        seriesIndex: 0,
        style: ['default', 'hover'],
        type: 'circle',
        x: 60,
        y: 60,
        name: 'han',
      },
      {
        color: 'rgba(187, 187, 187, 1)',
        data: { category: 'A', color: '#bbbbbb', label: 'cho', value: 4 },
        radius: 7,
        index: 0,
        seriesIndex: 1,
        style: ['default', 'hover'],
        type: 'circle',
        x: 20,
        y: 20,
        name: 'cho',
      },
      {
        color: 'rgba(187, 187, 187, 1)',
        data: { category: 'B', color: '#bbbbbb', label: 'cho', value: 5 },
        radius: 7,
        index: 1,
        seriesIndex: 1,
        style: ['default', 'hover'],
        type: 'circle',
        x: 60,
        y: 0,
        name: 'cho',
      },
    ],
    nearest: [
      { height: 80, index: 0, type: 'rect', width: 40, x: 0, y: 0 },
      { height: 80, index: 1, type: 'rect', width: 40, x: 40, y: 0 },
    ],
    grouped: [
      { height: 80, index: 0, type: 'rect', width: 40, x: 0, y: 0 },
      { height: 80, index: 1, type: 'rect', width: 40, x: 40, y: 0 },
    ],
  };

  ['near', 'nearest', 'grouped'].forEach((eventDetectType) => {
    it(`should make responder properly when calling render according to ${eventDetectType} eventDetectType`, () => {
      const state = deepMergedCopy(chartState, { options: { series: { eventDetectType } } });
      lineSeries.render(state);

      expect(lineSeries.responders).toEqual(result[eventDetectType]);
    });
  });
});

describe('zoom', () => {
  const seriesData = [
    { name: 'han', data: [2], rawData: [1, 2, 3], color: '#aaaaaa' },
    { name: 'cho', data: [4], rawData: [3, 4, 5], color: '#bbbbbb' },
  ];

  const chartState = {
    chart: { width: 100, height: 100 },
    layout: {
      xAxis: { x: 10, y: 80, width: 80, height: 10 },
      yAxis: { x: 10, y: 10, width: 10, height: 80 },
      plot: { width: 80, height: 80, x: 10, y: 80 },
    },
    series: {
      line: {
        data: seriesData,
        seriesCount: seriesData.length,
        seriesGroupCount: seriesData[0].data.length,
      },
    },
    scale: {
      yAxis: {
        limit: {
          min: 1,
          max: 5,
        },
      },
    },
    axes: {
      xAxis: {
        pointOnColumn: true,
        tickDistance: 40,
      },
    },
    options: {
      series: {},
    },
    legend: {
      data: [
        { label: 'han', active: true, checked: true },
        { label: 'cho', active: true, checked: true },
      ],
    },
    rawCategories: ['A', 'B', 'C'],
    categories: ['A', 'B', 'C'],
    dataLabels: {
      visible: false,
    },
    zoomRange: [1, 1],
  };

  beforeEach(() => {
    lineSeries = new LineSeries({
      store: {} as Store<LineChartOptions>,
      eventBus: new EventEmitter(),
    });

    lineSeries.render(chartState);
  });

  const result = {
    models: {
      rect: [{ height: 80, type: 'clipRectArea', width: 80, x: 0, y: 0 }],
      series: [
        {
          color: 'rgba(170, 170, 170, 1)',
          lineWidth: 3,
          points: [
            { value: 1, x: -20, y: 80 },
            { value: 2, x: 20, y: 60 },
            { value: 3, x: 60, y: 40 },
          ],
          seriesIndex: 0,
          name: 'han',
          type: 'linePoints',
        },
        {
          color: 'rgba(187, 187, 187, 1)',
          lineWidth: 3,
          points: [
            { value: 3, x: -20, y: 40 },
            { value: 4, x: 20, y: 20 },
            { value: 5, x: 60, y: 0 },
          ],
          seriesIndex: 1,
          name: 'cho',
          type: 'linePoints',
        },
      ],
      dot: [],
      selectedSeries: [],
    },
  };

  it(`should make models properly when calling render`, () => {
    expect(lineSeries.models).toEqual(result.models);
  });
});

describe('with series options', () => {
  const seriesData = [
    { name: 'han', data: [1, 2], rawData: [1, 2], color: '#aaaaaa' },
    { name: 'cho', data: [4, 5], rawData: [4, 5], color: '#bbbbbb' },
  ];

  const chartState = {
    chart: { width: 100, height: 100 },
    layout: {
      xAxis: { x: 10, y: 80, width: 80, height: 10 },
      yAxis: { x: 10, y: 10, width: 10, height: 80 },
      plot: { width: 80, height: 80, x: 10, y: 80 },
    },
    series: {
      line: {
        data: seriesData,
        seriesCount: seriesData.length,
        seriesGroupCount: seriesData[0].data.length,
      },
    },
    scale: {
      yAxis: {
        limit: {
          min: 1,
          max: 5,
        },
      },
    },
    axes: {
      xAxis: {
        pointOnColumn: true,
        tickDistance: 40,
      },
    },
    options: {
      series: {
        showDot: true,
      },
    },
    legend: {
      data: [
        { label: 'han', active: true, checked: true },
        { label: 'cho', active: true, checked: true },
      ],
    },
    rawCategories: ['A', 'B'],
    categories: ['A', 'B'],
    dataLabels: {
      visible: false,
    },
  };

  beforeEach(() => {
    lineSeries = new LineSeries({
      store: {} as Store<LineChartOptions>,
      eventBus: new EventEmitter(),
    });
  });

  it(`should make models properly when calling render with showDot options`, () => {
    const state = deepMergedCopy(chartState, {
      options: {
        series: {
          showDot: true,
        },
      },
    });
    lineSeries.render(state);
    expect(lineSeries.models.dot).toEqual([
      {
        color: 'rgba(170, 170, 170, 1)',
        radius: 6,
        seriesIndex: 0,
        style: ['default'],
        type: 'circle',
        x: 20,
        y: 80,
        name: 'han',
        index: 0,
      },
      {
        color: 'rgba(170, 170, 170, 1)',
        radius: 6,
        seriesIndex: 0,
        style: ['default'],
        type: 'circle',
        x: 60,
        y: 60,
        name: 'han',
        index: 1,
      },
      {
        color: 'rgba(187, 187, 187, 1)',
        radius: 6,
        seriesIndex: 1,
        style: ['default'],
        type: 'circle',
        x: 20,
        y: 20,
        name: 'cho',
        index: 0,
      },
      {
        color: 'rgba(187, 187, 187, 1)',
        radius: 6,
        seriesIndex: 1,
        style: ['default'],
        type: 'circle',
        x: 60,
        y: 0,
        name: 'cho',
        index: 1,
      },
    ]);
  });

  it(`should make models properly when calling render with lineWidth options`, () => {
    const state = deepMergedCopy(chartState, {
      options: {
        series: {
          lineWidth: 10,
        },
      },
    });
    lineSeries.render(state);
    expect(lineSeries.models.series.map(({ lineWidth }) => lineWidth)).toEqual([10, 10]);
  });
});
