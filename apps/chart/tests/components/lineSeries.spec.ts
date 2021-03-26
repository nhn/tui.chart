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
    theme: {
      series: {
        line: {
          colors: ['#aaaaaa', '#bbbbbb'],
          dashSegments: [],
          dot: {
            radius: 3,
          },
          hover: {
            dot: {
              borderWidth: 5,
              radius: 3,
            },
          },
          lineWidth: 2,
          select: {
            dot: {
              borderWidth: 5,
              radius: 3,
            },
          },
        },
      },
    },
  };

  beforeEach(() => {
    lineSeries = new LineSeries({
      store: {} as Store<LineChartOptions>,
      eventBus: new EventEmitter(),
    });

    lineSeries.render(chartState, { viewRange: [0, 1] });
  });

  const result = {
    rect: { width: 80, height: 80, x: 10, y: 80 },
    models: {
      rect: [{ height: 80, type: 'clipRectArea', width: 80, x: 0, y: 0 }],
      series: [
        {
          color: 'rgba(170, 170, 170, 1)',
          lineWidth: 2,
          points: [
            { value: 1, x: 20, y: 80 },
            { value: 2, x: 60, y: 60 },
          ],
          seriesIndex: 0,
          type: 'linePoints',
          name: 'han',
          dashSegments: [],
        },
        {
          color: 'rgba(187, 187, 187, 1)',
          lineWidth: 2,
          points: [
            { value: 4, x: 20, y: 20 },
            { value: 5, x: 60, y: 0 },
          ],
          seriesIndex: 1,
          type: 'linePoints',
          name: 'cho',
          dashSegments: [],
        },
      ],
      dot: [],
    },
    drawModels: {
      rect: [{ height: 80, type: 'clipRectArea', width: 0, x: 0, y: 0 }],
      series: [
        {
          color: 'rgba(0, 0, 0, 0)',
          lineWidth: 2,
          points: [
            { value: 1, x: 20, y: 80 },
            { value: 2, x: 60, y: 60 },
            { x: 60, y: 80 },
            { x: 20, y: 80 },
          ],
          seriesIndex: 0,
          type: 'linePoints',
          dashSegments: [],
        },
        {
          color: 'rgba(0, 0, 0, 0)',
          lineWidth: 2,
          points: [
            { value: 4, x: 20, y: 20 },
            { value: 5, x: 60, y: 0 },
            { x: 60, y: 80 },
            { x: 20, y: 80 },
          ],
          seriesIndex: 1,
          type: 'linePoints',
          dashSegments: [],
        },
      ],
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
        rectResponderCount: 2,
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
    theme: {
      series: {
        line: {
          colors: ['#aaaaaa', '#bbbbbb'],
          dashSegments: [],
          dot: {
            radius: 3,
          },
          hover: {
            dot: {
              borderColor: '#fff',
              borderWidth: 2,
              radius: 5,
            },
          },
          lineWidth: 2,
          select: {
            dot: {
              borderColor: '#fff',
              borderWidth: 2,
              radius: 5,
            },
          },
        },
      },
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
        data: { category: 'A', color: '#aaaaaa', label: 'han', value: 1, index: 0, seriesIndex: 0 },
        radius: 5,
        index: 0,
        seriesIndex: 0,
        style: ['default'],
        type: 'circle',
        x: 20,
        y: 80,
        name: 'han',
        label: 'A',
      },
      {
        color: 'rgba(170, 170, 170, 1)',
        data: { category: 'B', color: '#aaaaaa', label: 'han', value: 2, index: 1, seriesIndex: 0 },
        radius: 5,
        index: 1,
        seriesIndex: 0,
        style: ['default'],
        type: 'circle',
        x: 60,
        y: 60,
        name: 'han',
        label: 'B',
      },
      {
        color: 'rgba(187, 187, 187, 1)',
        data: { category: 'A', color: '#bbbbbb', label: 'cho', value: 4, index: 0, seriesIndex: 1 },
        radius: 5,
        index: 0,
        seriesIndex: 1,
        style: ['default'],
        type: 'circle',
        x: 20,
        y: 20,
        name: 'cho',
        label: 'A',
      },
      {
        color: 'rgba(187, 187, 187, 1)',
        data: { category: 'B', color: '#bbbbbb', label: 'cho', value: 5, index: 1, seriesIndex: 1 },
        radius: 5,
        index: 1,
        seriesIndex: 1,
        style: ['default'],
        type: 'circle',
        x: 60,
        y: 0,
        name: 'cho',
        label: 'B',
      },
    ],
    nearest: [
      { height: 80, index: 0, type: 'rect', width: 40, x: 0, y: 0, label: 'A' },
      { height: 80, index: 1, type: 'rect', width: 40, x: 40, y: 0, label: 'B' },
    ],
    grouped: [
      { height: 80, index: 0, type: 'rect', width: 40, x: 0, y: 0, label: 'A' },
      { height: 80, index: 1, type: 'rect', width: 40, x: 40, y: 0, label: 'B' },
    ],
    point: [
      {
        color: 'rgba(170, 170, 170, 1)',
        data: { category: 'A', color: '#aaaaaa', label: 'han', value: 1, index: 0, seriesIndex: 0 },
        radius: 5,
        index: 0,
        seriesIndex: 0,
        style: ['default'],
        type: 'circle',
        x: 20,
        y: 80,
        name: 'han',
        label: 'A',
        detectionSize: 0,
      },
      {
        color: 'rgba(170, 170, 170, 1)',
        data: { category: 'B', color: '#aaaaaa', label: 'han', value: 2, index: 1, seriesIndex: 0 },
        radius: 5,
        index: 1,
        seriesIndex: 0,
        style: ['default'],
        type: 'circle',
        x: 60,
        y: 60,
        name: 'han',
        label: 'B',
        detectionSize: 0,
      },
      {
        color: 'rgba(187, 187, 187, 1)',
        data: { category: 'A', color: '#bbbbbb', label: 'cho', value: 4, index: 0, seriesIndex: 1 },
        radius: 5,
        index: 0,
        seriesIndex: 1,
        style: ['default'],
        type: 'circle',
        x: 20,
        y: 20,
        name: 'cho',
        label: 'A',
        detectionSize: 0,
      },
      {
        color: 'rgba(187, 187, 187, 1)',
        data: { category: 'B', color: '#bbbbbb', label: 'cho', value: 5, index: 1, seriesIndex: 1 },
        radius: 5,
        index: 1,
        seriesIndex: 1,
        style: ['default'],
        type: 'circle',
        x: 60,
        y: 0,
        name: 'cho',
        label: 'B',
        detectionSize: 0,
      },
    ],
  };

  ['near', 'nearest', 'grouped', 'point'].forEach((eventDetectType) => {
    it(`should make responder properly when calling render according to ${eventDetectType} eventDetectType`, () => {
      const state = deepMergedCopy(chartState, { options: { series: { eventDetectType } } });
      lineSeries.render(state, { viewRange: [0, 1] });

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
    theme: {
      series: {
        line: {
          colors: ['#aaaaaa', '#bbbbbb'],
          dashSegments: [],
          dot: {
            radius: 3,
          },
          hover: {
            dot: {
              borderColor: '#fff',
              borderWidth: 2,
              radius: 5,
            },
          },
          lineWidth: 2,
          select: {
            dot: {
              borderColor: '#fff',
              borderWidth: 2,
              radius: 5,
            },
          },
        },
      },
    },
  };

  beforeEach(() => {
    lineSeries = new LineSeries({
      store: {} as Store<LineChartOptions>,
      eventBus: new EventEmitter(),
    });

    lineSeries.render(chartState, { viewRange: [1, 1] });
  });

  const result = {
    models: {
      rect: [{ height: 80, type: 'clipRectArea', width: 80, x: 0, y: 0 }],
      series: [
        {
          color: 'rgba(170, 170, 170, 1)',
          lineWidth: 2,
          points: [
            { value: 1, x: -20, y: 80 },
            { value: 2, x: 20, y: 60 },
            { value: 3, x: 60, y: 40 },
          ],
          seriesIndex: 0,
          name: 'han',
          type: 'linePoints',
          dashSegments: [],
        },
        {
          color: 'rgba(187, 187, 187, 1)',
          lineWidth: 2,
          points: [
            { value: 3, x: -20, y: 40 },
            { value: 4, x: 20, y: 20 },
            { value: 5, x: 60, y: 0 },
          ],
          seriesIndex: 1,
          name: 'cho',
          type: 'linePoints',
          dashSegments: [],
        },
      ],
      dot: [],
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
    theme: {
      series: {
        line: {
          colors: ['#aaaaaa', '#bbbbbb'],
          dashSegments: [],
          dot: {
            radius: 3,
          },
          hover: {
            dot: {
              borderColor: '#fff',
              borderWidth: 2,
              radius: 5,
            },
          },
          lineWidth: 2,
          select: {
            dot: {
              borderColor: '#fff',
              borderWidth: 2,
              radius: 5,
            },
          },
        },
      },
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
    lineSeries.render(state, { viewRange: [0, 1] });
    expect(lineSeries.models.dot).toEqual([
      {
        color: 'rgba(170, 170, 170, 1)',
        radius: 3,
        seriesIndex: 0,
        style: [{ strokeStyle: 'rgba(170, 170, 170, 1)' }],
        type: 'circle',
        x: 20,
        y: 80,
        name: 'han',
        index: 0,
      },
      {
        color: 'rgba(170, 170, 170, 1)',
        radius: 3,
        seriesIndex: 0,
        style: [{ strokeStyle: 'rgba(170, 170, 170, 1)' }],
        type: 'circle',
        x: 60,
        y: 60,
        name: 'han',
        index: 1,
      },
      {
        color: 'rgba(187, 187, 187, 1)',
        radius: 3,
        seriesIndex: 1,
        style: [{ strokeStyle: 'rgba(187, 187, 187, 1)' }],
        type: 'circle',
        x: 20,
        y: 20,
        name: 'cho',
        index: 0,
      },
      {
        color: 'rgba(187, 187, 187, 1)',
        radius: 3,
        seriesIndex: 1,
        style: [{ strokeStyle: 'rgba(187, 187, 187, 1)' }],
        type: 'circle',
        x: 60,
        y: 0,
        name: 'cho',
        index: 1,
      },
    ]);
  });
});

describe('with null data', () => {
  const seriesData = [{ name: 'han', data: [1, 2, null], rawData: [1, 2, null], color: '#aaaaaa' }];

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
      data: [{ label: 'han', active: true, checked: true }],
    },
    rawCategories: ['A', 'B', 'C'],
    categories: ['A', 'B', 'C'],
    dataLabels: {
      visible: false,
    },
    theme: {
      series: {
        line: {
          colors: ['#aaaaaa', '#bbbbbb'],
          dashSegments: [],
          dot: {
            radius: 3,
          },
          hover: {
            dot: {
              borderColor: '#fff',
              borderWidth: 2,
              radius: 5,
            },
          },
          lineWidth: 2,
          select: {
            dot: {
              borderColor: '#fff',
              borderWidth: 2,
              radius: 5,
            },
          },
        },
      },
    },
  };

  beforeEach(() => {
    lineSeries = new LineSeries({
      store: {} as Store<LineChartOptions>,
      eventBus: new EventEmitter(),
    });

    lineSeries.render(chartState, { viewRange: [0, 2] });
  });

  const result = {
    models: {
      rect: [{ height: 80, type: 'clipRectArea', width: 80, x: 0, y: 0 }],
      series: [
        {
          color: 'rgba(170, 170, 170, 1)',
          lineWidth: 2,
          points: [{ value: 1, x: 20, y: 80 }, { value: 2, x: 60, y: 60 }, null],
          seriesIndex: 0,
          name: 'han',
          type: 'linePoints',
          dashSegments: [],
        },
      ],
      dot: [],
    },
  };

  it(`should make models properly when calling render`, () => {
    expect(lineSeries.models).toEqual(result.models);
  });
});
