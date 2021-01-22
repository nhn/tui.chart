import { BubbleChartOptions } from '@t/options';
import Store from '@src/store/store';
import EventEmitter from '@src/eventEmitter';
import BubbleSeries from '@src/component/bubbleSeries';
import { deepMergedCopy } from '@src/helpers/utils';

let bubbleSeries;

describe('basic', () => {
  const seriesData = [
    {
      name: 'nameA',
      data: [
        { x: 10, y: 20, r: 100, label: 'A' },
        { x: 15, y: 20, r: 200, label: 'B' },
      ],
      color: '#aaaaaa',
    },
    {
      name: 'nameB',
      data: [{ x: 20, y: 10, r: 30, label: 'C' }],
      color: '#bbbbbb',
    },
  ];

  const chartState = {
    chart: { width: 300, height: 300 },
    layout: {
      xAxis: { x: 10, y: 280, width: 280, height: 10 },
      yAxis: { x: 10, y: 10, width: 10, height: 280 },
      plot: { width: 280, height: 280, x: 10, y: 80 },
      legend: { width: 30, height: 280, x: 290, y: 10 },
    },
    series: {
      bubble: {
        data: seriesData,
        seriesCount: seriesData.length,
        seriesGroupCount: seriesData[0].data.length,
      },
    },
    scale: {
      xAxis: {
        limit: {
          min: 10,
          max: 20,
        },
      },
      yAxis: {
        limit: {
          min: 10,
          max: 20,
        },
      },
    },
    axes: {
      xAxis: {
        tickDistance: 56,
        tickCount: 5,
      },
      yAxis: {
        tickDistance: 56,
        tickCount: 5,
      },
    },
    options: {
      series: {},
    },
    legend: {
      data: [
        { label: 'nameA', active: true, checked: true },
        { label: 'nameB', active: true, checked: true },
      ],
    },
    circleLegend: {
      radius: 15,
      visible: true,
    },
    theme: {
      series: {
        bubble: {
          borderWidth: 0,
          borderColor: 'rgba(0, 0, 0, 0)',
          select: {},
          hover: {},
        },
      },
    },
  };

  beforeEach(() => {
    bubbleSeries = new BubbleSeries({
      store: {} as Store<BubbleChartOptions>,
      eventBus: new EventEmitter(),
    });

    bubbleSeries.render(chartState);
  });

  const result = {
    rect: {
      height: 280,
      width: 280,
      x: 10,
      y: 80,
    },
    responders: [
      {
        borderWidth: 0,
        borderColor: 'rgba(0, 0, 0, 0)',
        color: 'rgba(170, 170, 170, 0.85)',
        radius: 8.5,
        seriesIndex: 0,
        style: ['default'],
        type: 'circle',
        x: 0,
        y: 0,
        detectionSize: 0,
        data: {
          color: '#aaaaaa',
          label: 'nameA/A',
          value: { x: 10, y: 20, r: 100 },
        },
        name: 'nameA',
        index: 0,
      },
      {
        borderWidth: 0,
        borderColor: 'rgba(0, 0, 0, 0)',
        color: 'rgba(170, 170, 170, 0.85)',
        radius: 16,
        seriesIndex: 0,
        style: ['default'],
        type: 'circle',
        x: 140,
        y: 0,
        detectionSize: 0,
        data: {
          color: '#aaaaaa',
          label: 'nameA/B',
          value: { x: 15, y: 20, r: 200 },
        },
        name: 'nameA',
        index: 1,
      },
      {
        borderWidth: 0,
        borderColor: 'rgba(0, 0, 0, 0)',
        color: 'rgba(187, 187, 187, 0.85)',
        radius: 3.25,
        seriesIndex: 1,
        style: ['default'],
        type: 'circle',
        x: 280,
        y: 280,
        detectionSize: 0,
        data: {
          color: '#bbbbbb',
          label: 'nameB/C',
          value: { x: 20, y: 10, r: 30 },
        },
        name: 'nameB',
        index: 2,
      },
    ],
    models: {
      series: [
        {
          borderWidth: 0,
          borderColor: 'rgba(0, 0, 0, 0)',
          color: 'rgba(170, 170, 170, 0.8)',
          radius: 7.5,
          seriesIndex: 0,
          style: ['default'],
          type: 'circle',
          x: 0,
          y: 0,
          name: 'nameA',
        },
        {
          borderWidth: 0,
          borderColor: 'rgba(0, 0, 0, 0)',
          color: 'rgba(170, 170, 170, 0.8)',
          radius: 15,
          seriesIndex: 0,
          style: ['default'],
          type: 'circle',
          x: 140,
          y: 0,
          name: 'nameA',
        },
        {
          borderWidth: 0,
          borderColor: 'rgba(0, 0, 0, 0)',
          color: 'rgba(187, 187, 187, 0.8)',
          radius: 2.25,
          seriesIndex: 1,
          style: ['default'],
          type: 'circle',
          x: 280,
          y: 280,
          name: 'nameB',
        },
      ],
    },
  };

  ['rect', 'responders', 'models'].forEach((modelName) => {
    it(`should make ${modelName} properly when calling render`, () => {
      expect(bubbleSeries[modelName]).toEqual(result[modelName]);
    });
  });

  it('should register closest responder to the mouse', () => {
    const [closestResponder, distantResponder] = result.responders;

    const responders = [closestResponder, distantResponder];
    bubbleSeries.onMousemove({ responders, mousePosition: { x: 10, y: 80 } });
    expect(bubbleSeries.activatedResponders).toEqual([closestResponder]);
  });

  it('should apply transparency when legend active false', () => {
    bubbleSeries = new BubbleSeries({
      store: {} as Store<BubbleChartOptions>,
      eventBus: new EventEmitter(),
    });

    bubbleSeries.render(chartState);

    bubbleSeries.render(
      deepMergedCopy(chartState, {
        legend: {
          data: [
            { label: 'nameA', active: true, checked: true },
            { label: 'nameB', active: false, checked: true },
          ],
        },
      })
    );

    expect(bubbleSeries.models.series[2].color).toEqual('rgba(187, 187, 187, 0.1)');
  });
});

describe('with null data', () => {
  const seriesData = [
    {
      name: 'nameA',
      data: [{ x: 10, y: 20, r: 100, label: 'A' }, null],
      color: '#aaaaaa',
    },
    {
      name: 'nameB',
      data: [{ x: 20, y: 10, r: 30, label: 'C' }],
      color: '#bbbbbb',
    },
  ];

  const chartState = {
    chart: { width: 300, height: 300 },
    layout: {
      xAxis: { x: 10, y: 280, width: 280, height: 10 },
      yAxis: { x: 10, y: 10, width: 10, height: 280 },
      plot: { width: 280, height: 280, x: 10, y: 80 },
      legend: { width: 30, height: 280, x: 290, y: 10 },
    },
    series: {
      bubble: {
        data: seriesData,
        seriesCount: seriesData.length,
        seriesGroupCount: seriesData[0].data.length,
      },
    },
    scale: {
      xAxis: {
        limit: {
          min: 10,
          max: 20,
        },
      },
      yAxis: {
        limit: {
          min: 10,
          max: 20,
        },
      },
    },
    axes: {
      xAxis: {
        tickDistance: 56,
        tickCount: 5,
      },
      yAxis: {
        tickDistance: 56,
        tickCount: 5,
      },
    },
    options: {
      series: {},
    },
    legend: {
      data: [
        { label: 'nameA', active: true, checked: true },
        { label: 'nameB', active: true, checked: true },
      ],
    },
    circleLegend: {
      radius: 15,
      visible: true,
    },
    theme: {
      series: {
        bubble: {
          borderWidth: 0,
          borderColor: 'rgba(0, 0, 0, 0)',
          select: {},
          hover: {},
        },
      },
    },
  };

  const models = {
    series: [
      {
        borderWidth: 0,
        borderColor: 'rgba(0, 0, 0, 0)',
        color: 'rgba(170, 170, 170, 0.8)',
        radius: 15,
        seriesIndex: 0,
        style: ['default'],
        type: 'circle',
        x: 0,
        y: 0,
        name: 'nameA',
      },
      {
        borderWidth: 0,
        borderColor: 'rgba(0, 0, 0, 0)',
        color: 'rgba(187, 187, 187, 0.8)',
        radius: 4.5,
        seriesIndex: 1,
        style: ['default'],
        type: 'circle',
        x: 280,
        y: 280,
        name: 'nameB',
      },
    ],
  };

  it('should make models properly when calling render', () => {
    bubbleSeries = new BubbleSeries({
      store: {} as Store<BubbleChartOptions>,
      eventBus: new EventEmitter(),
    });

    bubbleSeries.render(chartState);

    expect(bubbleSeries.models).toEqual(models);
  });
});
