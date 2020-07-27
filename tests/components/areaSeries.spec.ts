import { AreaChartOptions } from '@t/options';
import AreaSeries from '@src/component/areaSeries';
import Store from '@src/store/store';
import EventEmitter from '@src/eventEmitter';
import { deepMergedCopy } from '@src/helpers/utils';

let areaSeries;

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
      area: {
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
    areaSeries = new AreaSeries({
      store: {} as Store<AreaChartOptions>,
      eventBus: new EventEmitter(),
    });

    areaSeries.render(chartState);
  });

  const result = {
    rect: { width: 80, height: 80, x: 10, y: 80 },
    linePointsModel: [
      {
        color: 'rgba(170, 170, 170, 1)',
        lineWidth: 3,
        points: [
          { value: 1, x: 20, y: 80 },
          { value: 2, x: 60, y: 60 },
        ],
        name: 'han',
        seriesIndex: 0,
        type: 'linePoints',
      },
      {
        color: 'rgba(187, 187, 187, 1)',
        lineWidth: 3,
        points: [
          { value: 4, x: 20, y: 20 },
          { value: 5, x: 60, y: 0 },
        ],
        name: 'cho',
        seriesIndex: 1,
        type: 'linePoints',
      },
    ],
    responders: [
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
    models: {
      rect: [{ height: 80, type: 'clipRectArea', width: 80, x: 0, y: 0 }],
      series: [
        {
          color: 'rgba(0, 0, 0, 0)',
          fillColor: 'rgba(170, 170, 170, 1)',
          lineWidth: 0,
          name: 'han',
          points: [
            { value: 1, x: 20, y: 80 },
            { value: 2, x: 60, y: 60 },
            { x: 60, y: 80 },
            { x: 20, y: 80 },
          ],
          seriesIndex: 0,
          type: 'areaPoints',
        },
        {
          color: 'rgba(0, 0, 0, 0)',
          fillColor: 'rgba(187, 187, 187, 1)',
          lineWidth: 0,
          name: 'cho',
          points: [
            { value: 4, x: 20, y: 20 },
            { value: 5, x: 60, y: 0 },
            { x: 60, y: 80 },
            { x: 20, y: 80 },
          ],
          seriesIndex: 1,
          type: 'areaPoints',
        },
      ],
      dot: [],
    },
    drawModels: {
      rect: [{ height: 80, type: 'clipRectArea', width: 0, x: 0, y: 0 }],
      series: [
        {
          color: 'rgba(0, 0, 0, 0)',
          fillColor: 'rgba(170, 170, 170, 1)',
          lineWidth: 0,
          name: 'han',
          points: [
            { value: 1, x: 20, y: 80 },
            { value: 2, x: 60, y: 60 },
            { x: 60, y: 80 },
            { x: 20, y: 80 },
          ],
          seriesIndex: 0,
          type: 'areaPoints',
        },
        {
          color: 'rgba(0, 0, 0, 0)',
          fillColor: 'rgba(187, 187, 187, 1)',
          lineWidth: 0,
          name: 'cho',
          points: [
            { value: 4, x: 20, y: 20 },
            { value: 5, x: 60, y: 0 },
            { x: 60, y: 80 },
            { x: 20, y: 80 },
          ],
          seriesIndex: 1,
          type: 'areaPoints',
        },
      ],
      dot: [],
    },
  };

  ['rect', 'linePointsModel', 'responders', 'models'].forEach((modelName) => {
    it(`should make ${modelName} properly when calling render`, () => {
      expect(areaSeries[modelName]).toEqual(result[modelName]);
    });
  });

  it('add line points model and circle model when hover above line point', () => {
    const applyAreaOpacity = jest.spyOn(areaSeries, 'applyAreaOpacity');
    const responder = result.responders[1];

    areaSeries.onMousemove({ responders: [responder] });

    expect(applyAreaOpacity).toHaveBeenCalledWith(0.2);
  });

  it('remove line points model and circle model when mousemove after hover above line point', () => {
    const responder = result.responders[1];
    areaSeries.onMousemove({ responders: [responder] });

    areaSeries.onMousemove({ responders: [] });

    expect(areaSeries.drawModels).toEqual(result.drawModels);
  });

  it('should apply transparency when legend active false', () => {
    areaSeries = new AreaSeries({
      store: {} as Store<AreaChartOptions>,
      eventBus: new EventEmitter(),
    });

    areaSeries.render(
      deepMergedCopy(chartState, {
        legend: {
          data: [
            { label: 'han', active: true, checked: true },
            { label: 'cho', active: false, checked: true },
          ],
        },
      })
    );

    expect(areaSeries.drawModels.series[1].fillColor).toEqual('rgba(187, 187, 187, 0.2)');
  });
});

describe('range', () => {
  const rangeData = [
    {
      name: 'han',
      data: [
        [1, 2],
        [3, 5],
      ],
      rawData: [
        [1, 2],
        [3, 5],
      ],
      color: '#aaaaaa',
    },
  ];

  const chartState = {
    chart: { width: 100, height: 100 },
    layout: {
      xAxis: { x: 10, y: 80, width: 80, height: 10 },
      yAxis: { x: 10, y: 10, width: 10, height: 80 },
      plot: { width: 80, height: 80, x: 10, y: 80 },
    },
    series: {
      area: {
        data: rangeData,
        seriesCount: rangeData.length,
        seriesGroupCount: rangeData[0].data.length,
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
        pointOnColumn: false,
        tickDistance: 40,
      },
    },
    options: {
      series: {},
    },
    legend: {
      data: [{ label: 'han', active: true, checked: true }],
    },
    categories: ['A', 'B'],
    dataLabels: {
      visible: false,
    },
  };

  beforeEach(() => {
    areaSeries = new AreaSeries({
      store: {} as Store<AreaChartOptions>,
      eventBus: new EventEmitter(),
    });

    areaSeries.render(chartState);
  });

  const result = {
    rect: { width: 80, height: 80, x: 10, y: 80 },
    linePointsModel: [
      {
        color: 'rgba(170, 170, 170, 1)',
        lineWidth: 3,
        name: 'han',
        points: [
          { value: 2, x: 0, y: 60 },
          { value: 5, x: 40, y: 0 },
        ],
        seriesIndex: 0,
        type: 'linePoints',
      },
      {
        color: 'rgba(170, 170, 170, 1)',
        lineWidth: 3,
        name: 'han',
        points: [
          { value: 1, x: 0, y: 80 },
          { value: 3, x: 40, y: 40 },
        ],
        seriesIndex: 0,
        type: 'linePoints',
      },
    ],
    responders: [
      {
        color: 'rgba(170, 170, 170, 1)',
        data: { category: 'A', color: '#aaaaaa', label: 'han', value: '1 ~ 2' },
        radius: 7,
        index: 0,
        seriesIndex: 0,
        style: ['default', 'hover'],
        type: 'circle',
        x: 0,
        y: 60,
        name: 'han',
      },
      {
        color: 'rgba(170, 170, 170, 1)',
        data: { category: 'B', color: '#aaaaaa', label: 'han', value: '3 ~ 5' },
        radius: 7,
        index: 1,
        seriesIndex: 0,
        style: ['default', 'hover'],
        type: 'circle',
        x: 40,
        y: 0,
        name: 'han',
      },
      {
        color: 'rgba(170, 170, 170, 1)',
        data: { category: 'A', color: '#aaaaaa', label: 'han', value: '1 ~ 2' },
        radius: 7,
        index: 0,
        seriesIndex: 0,
        style: ['default', 'hover'],
        type: 'circle',
        x: 0,
        y: 80,
        name: 'han',
      },
      {
        color: 'rgba(170, 170, 170, 1)',
        data: { category: 'B', color: '#aaaaaa', label: 'han', value: '3 ~ 5' },
        radius: 7,
        index: 1,
        seriesIndex: 0,
        style: ['default', 'hover'],
        type: 'circle',
        x: 40,
        y: 40,
        name: 'han',
      },
    ],
    models: {
      rect: [{ height: 80, type: 'clipRectArea', width: 80, x: 0, y: 0 }],
      series: [
        {
          color: 'rgba(0, 0, 0, 0)',
          fillColor: 'rgba(170, 170, 170, 1)',
          lineWidth: 0,
          name: 'han',
          points: [
            { value: 2, x: 0, y: 60 },
            { value: 5, x: 40, y: 0 },
            { value: 3, x: 40, y: 40 },
            { value: 1, x: 0, y: 80 },
          ],
          seriesIndex: 0,
          type: 'areaPoints',
        },
      ],
      dot: [],
    },
  };

  ['rect', 'linePointsModel', 'responders', 'models'].forEach((modelName) => {
    it(`should make ${modelName} properly when calling render`, () => {
      expect(areaSeries[modelName]).toEqual(result[modelName]);
    });
  });
});

describe('stack', () => {
  const stackData = [
    {
      name: 'han',
      data: [1, 2],
      rawData: [1, 2],
      color: '#aaaaaa',
    },
    {
      name: 'cho',
      data: [1, 4],
      rawData: [1, 4],
      color: '#bbbbbb',
    },
  ];

  const chartState = {
    chart: { width: 100, height: 100 },
    layout: {
      xAxis: { x: 10, y: 80, width: 80, height: 10 },
      yAxis: { x: 10, y: 10, width: 10, height: 80 },
      plot: { width: 80, height: 80, x: 10, y: 80 },
    },
    series: {
      area: {
        data: stackData,
        seriesCount: stackData.length,
        seriesGroupCount: stackData[0].data.length,
      },
    },
    stackSeries: {
      area: {
        stack: {
          type: 'normal',
        },
        stackData: [
          { values: [1, 2], sum: 3 },
          { values: [1, 4], sum: 5 },
        ],
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
        pointOnColumn: false,
        tickDistance: 40,
        tickCount: 5,
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
    categories: ['A', 'B'],
    dataLabels: {
      visible: false,
    },
  };

  beforeEach(() => {
    areaSeries = new AreaSeries({
      store: {} as Store<AreaChartOptions>,
      eventBus: new EventEmitter(),
    });

    areaSeries.render(chartState);
  });

  const result = {
    rect: { width: 80, height: 80, x: 10, y: 80 },
    linePointsModel: [
      {
        color: 'rgba(170, 170, 170, 1)',
        lineWidth: 3,
        points: [
          { value: 1, x: 0, y: 80 },
          { value: 2, x: 40, y: 80 },
        ],
        seriesIndex: 0,
        type: 'linePoints',
        name: 'han',
      },
      {
        color: 'rgba(187, 187, 187, 1)',
        lineWidth: 3,
        points: [
          { value: 1, x: 0, y: 40 },
          { value: 4, x: 40, y: 0 },
        ],
        seriesIndex: 1,
        type: 'linePoints',
        name: 'cho',
      },
    ],
    responders: [
      {
        height: 80,
        index: 0,
        type: 'rect',
        width: 20,
        x: 10,
        y: 80,
      },
      {
        height: 80,
        index: 1,
        type: 'rect',
        width: 40,
        x: 30,
        y: 80,
      },
      {
        height: 80,
        index: 2,
        type: 'rect',
        width: 40,
        x: 70,
        y: 80,
      },
      {
        height: 80,
        index: 3,
        type: 'rect',
        width: 40,
        x: 110,
        y: 80,
      },
      {
        height: 80,
        index: 4,
        width: 20,
        type: 'rect',
        x: 150,
        y: 80,
      },
    ],
    models: {
      rect: [{ height: 80, type: 'clipRectArea', width: 80, x: 0, y: 0 }],
      series: [
        {
          color: 'rgba(0, 0, 0, 0)',
          fillColor: 'rgba(170, 170, 170, 1)',
          lineWidth: 0,
          name: 'han',
          points: [
            { value: 1, x: 0, y: 80 },
            { value: 2, x: 40, y: 80 },
            { x: 40, y: 80 },
            { x: 0, y: 80 },
          ],
          seriesIndex: 0,
          type: 'areaPoints',
        },
        {
          color: 'rgba(0, 0, 0, 0)',
          fillColor: 'rgba(187, 187, 187, 1)',
          lineWidth: 0,
          name: 'cho',
          points: [
            { value: 1, x: 0, y: 80 },
            { value: 2, x: 40, y: 80 },
            { value: 4, x: 40, y: 0 },
            { value: 1, x: 0, y: 40 },
          ],
          seriesIndex: 1,
          type: 'areaPoints',
        },
      ],
      dot: [],
    },
  };

  ['rect', 'linePointsModel', 'responders', 'models'].forEach((modelName) => {
    it(`should make ${modelName} properly when calling render`, () => {
      expect(areaSeries[modelName]).toEqual(result[modelName]);
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
      area: {
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
    areaSeries = new AreaSeries({
      store: {} as Store<AreaChartOptions>,
      eventBus: new EventEmitter(),
    });

    areaSeries.render(chartState);
  });

  const result = {
    rect: { width: 80, height: 80, x: 10, y: 80 },
    linePointsModel: [
      {
        color: 'rgba(170, 170, 170, 1)',
        lineWidth: 3,
        points: [
          { value: 2, x: 20, y: 60 },
          { value: 3, x: 60, y: 40 },
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
    models: {
      rect: [{ height: 80, type: 'clipRectArea', width: 80, x: 0, y: 0 }],
      series: [
        {
          color: 'rgba(0, 0, 0, 0)',
          fillColor: 'rgba(170, 170, 170, 1)',
          lineWidth: 0,
          points: [
            { value: 2, x: 20, y: 60 },
            { value: 3, x: 60, y: 40 },
            { x: 60, y: 80 },
            { x: 20, y: 80 },
          ],
          seriesIndex: 0,
          type: 'areaPoints',
          name: 'han',
        },
        {
          color: 'rgba(0, 0, 0, 0)',
          fillColor: 'rgba(187, 187, 187, 1)',
          lineWidth: 0,
          points: [
            { value: 4, x: 20, y: 20 },
            { value: 5, x: 60, y: 0 },
            { x: 60, y: 80 },
            { x: 20, y: 80 },
          ],
          seriesIndex: 1,
          type: 'areaPoints',
          name: 'cho',
        },
      ],
      dot: [],
    },
  };

  ['linePointsModel', 'models'].forEach((modelName) => {
    it(`should make ${modelName} properly when calling render`, () => {
      expect(areaSeries[modelName]).toEqual(result[modelName]);
    });
  });
});

describe('with showDot options', () => {
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
      area: {
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
    categories: ['A', 'B'],
    dataLabels: {
      visible: false,
    },
  };

  beforeEach(() => {
    areaSeries = new AreaSeries({
      store: {} as Store<AreaChartOptions>,
      eventBus: new EventEmitter(),
    });

    areaSeries.render(chartState);
  });

  const result = {
    models: {
      rect: [{ height: 80, type: 'clipRectArea', width: 80, x: 0, y: 0 }],
      series: [
        {
          color: 'rgba(0, 0, 0, 0)',
          fillColor: 'rgba(170, 170, 170, 1)',
          lineWidth: 0,
          name: 'han',
          points: [
            { value: 1, x: 20, y: 80 },
            { value: 2, x: 60, y: 60 },
            { x: 60, y: 80 },
            { x: 20, y: 80 },
          ],
          seriesIndex: 0,
          type: 'areaPoints',
        },
        {
          color: 'rgba(0, 0, 0, 0)',
          fillColor: 'rgba(187, 187, 187, 1)',
          lineWidth: 0,
          name: 'cho',
          points: [
            { value: 4, x: 20, y: 20 },
            { value: 5, x: 60, y: 0 },
            { x: 60, y: 80 },
            { x: 20, y: 80 },
          ],
          seriesIndex: 1,
          type: 'areaPoints',
        },
      ],
      dot: [
        {
          color: 'rgba(170, 170, 170, 1)',
          index: 0,
          name: 'han',
          radius: 6,
          seriesIndex: 0,
          style: ['default'],
          type: 'circle',
          x: 20,
          y: 80,
        },
        {
          color: 'rgba(170, 170, 170, 1)',
          index: 1,
          name: 'han',
          radius: 6,
          seriesIndex: 0,
          style: ['default'],
          type: 'circle',
          x: 60,
          y: 60,
        },
        {
          color: 'rgba(187, 187, 187, 1)',
          index: 0,
          name: 'cho',
          radius: 6,
          seriesIndex: 1,
          style: ['default'],
          type: 'circle',
          x: 20,
          y: 20,
        },
        {
          color: 'rgba(187, 187, 187, 1)',
          index: 1,
          name: 'cho',
          radius: 6,
          seriesIndex: 1,
          style: ['default'],
          type: 'circle',
          x: 60,
          y: 0,
        },
      ],
    },
  };

  it(`should make models properly when calling render`, () => {
    expect(areaSeries.models).toEqual(result.models);
  });
});
