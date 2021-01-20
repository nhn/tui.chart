import { ScatterChartOptions } from '@t/options';
import Store from '@src/store/store';
import EventEmitter from '@src/eventEmitter';
import ScatterSeries from '@src/component/scatterSeries';
import { deepMergedCopy } from '@src/helpers/utils';

let scatterSeries;

describe('basic', () => {
  const seriesData = [
    {
      name: 'nameA',
      data: [
        { x: 10, y: 20 },
        { x: 15, y: 20 },
      ],
      color: '#aaaaaa',
    },
    {
      name: 'nameB',
      data: [{ x: 20, y: 10 }],
      color: '#bbbbbb',
    },
  ];

  const chartState = {
    chart: { width: 300, height: 300 },
    layout: {
      xAxis: { x: 10, y: 280, width: 280, height: 10 },
      yAxis: { x: 10, y: 10, width: 10, height: 280 },
      plot: { width: 280, height: 280, x: 10, y: 80 },
    },
    series: {
      scatter: {
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
    theme: {
      series: {
        scatter: {
          size: 12,
          borderWidth: 1,
          borderColor: 'rgba(0, 0, 0, 0)',
          fillColor: 'rgba(0, 0, 0, 0)',
          select: {},
          hover: {},
        },
      },
    },
  };

  beforeEach(() => {
    scatterSeries = new ScatterSeries({
      store: {} as Store<ScatterChartOptions>,
      eventBus: new EventEmitter(),
    });

    scatterSeries.render(chartState);
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
        borderColor: 'rgba(170, 170, 170, 1)',
        color: 'rgba(0, 0, 0, 0)',
        radius: 6,
        size: 12,
        seriesIndex: 0,
        style: [{ strokeStyle: 'rgba(170, 170, 170, 1)', lineWidth: 1 }],
        type: 'circle',
        x: 0,
        y: 0,
        detectionSize: 0,
        borderWidth: 1,
        fillColor: 'rgba(0, 0, 0, 0)',
        data: {
          color: '#aaaaaa',
          label: 'nameA',
          value: { x: 10, y: 20 },
        },
        name: 'nameA',
        index: 0,
      },
      {
        fillColor: 'rgba(0, 0, 0, 0)',
        borderColor: 'rgba(170, 170, 170, 1)',
        borderWidth: 1,
        color: 'rgba(0, 0, 0, 0)',
        radius: 6,
        size: 12,
        seriesIndex: 0,
        style: [{ strokeStyle: 'rgba(170, 170, 170, 1)', lineWidth: 1 }],
        type: 'circle',
        x: 140,
        y: 0,
        detectionSize: 0,
        data: {
          color: '#aaaaaa',
          label: 'nameA',
          value: { x: 15, y: 20 },
        },
        name: 'nameA',
        index: 1,
      },
      {
        fillColor: 'rgba(0, 0, 0, 0)',
        borderColor: 'rgba(187, 187, 187, 1)',
        borderWidth: 1,
        color: 'rgba(0, 0, 0, 0)',
        radius: 6,
        size: 12,
        seriesIndex: 1,
        style: [{ strokeStyle: 'rgba(187, 187, 187, 1)', lineWidth: 1 }],
        type: 'circle',
        x: 280,
        y: 280,
        detectionSize: 0,
        data: {
          color: '#bbbbbb',
          label: 'nameB',
          value: { x: 20, y: 10 },
        },
        name: 'nameB',
        index: 0,
      },
    ],
    models: {
      series: [
        {
          borderWidth: 1,
          fillColor: 'rgba(0, 0, 0, 0)',
          borderColor: 'rgba(170, 170, 170, 1)',
          size: 12,
          seriesIndex: 0,
          index: 0,
          type: 'scatterSeries',
          x: 0,
          y: 0,
          name: 'nameA',
        },
        {
          borderWidth: 1,
          fillColor: 'rgba(0, 0, 0, 0)',
          borderColor: 'rgba(170, 170, 170, 1)',
          size: 12,
          seriesIndex: 0,
          index: 1,
          type: 'scatterSeries',
          x: 140,
          y: 0,
          name: 'nameA',
        },
        {
          borderWidth: 1,
          fillColor: 'rgba(0, 0, 0, 0)',
          borderColor: 'rgba(187, 187, 187, 1)',
          size: 12,
          seriesIndex: 1,
          index: 0,
          type: 'scatterSeries',
          x: 280,
          y: 280,
          name: 'nameB',
        },
      ],
    },
  };

  ['rect', 'responders', 'models'].forEach((modelName) => {
    it(`should make ${modelName} properly when calling render`, () => {
      expect(scatterSeries[modelName]).toEqual(result[modelName]);
    });
  });

  it('should register closest responder to the mouse', () => {
    const closestResponder = result.responders[0];
    const distantResponder = result.responders[1];

    const responders = [closestResponder, distantResponder];
    scatterSeries.onMousemove({ responders, mousePosition: { x: 10, y: 80 } });
    expect(scatterSeries.activatedResponders).toEqual([closestResponder]);
  });

  it('should apply transparency when legend active false', () => {
    scatterSeries = new ScatterSeries({
      store: {} as Store<ScatterChartOptions>,
      eventBus: new EventEmitter(),
    });

    scatterSeries.render(
      deepMergedCopy(chartState, {
        legend: {
          data: [
            { label: 'nameA', active: true, checked: true },
            { label: 'nameB', active: false, checked: true },
          ],
        },
      })
    );

    expect(scatterSeries.drawModels.series[2].borderColor).toEqual('rgba(187, 187, 187, 0.3)');
  });
});
