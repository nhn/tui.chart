import { AreaChartOptions } from '@t/options';
import AreaSeries from '@src/component/areaSeries';
import Store from '@src/store/store';
import EventEmitter from '@src/eventEmitter';

let areaSeries;
const seriesData = [
  { name: 'han', data: [1, 2] },
  { name: 'cho', data: [4, 5] }
];

const chartState = {
  chart: { width: 100, height: 100 },
  layout: {
    xAxis: { x: 10, y: 80, width: 80, height: 10 },
    yAxis: { x: 10, y: 10, width: 10, height: 80 },
    plot: { width: 80, height: 80, x: 10, y: 80 }
  },
  series: {
    area: {
      data: seriesData,
      seriesCount: seriesData.length,
      seriesGroupCount: seriesData[0].data.length
    }
  },
  scale: {
    yAxis: {
      limit: {
        min: 1,
        max: 5
      }
    }
  },
  axes: {
    xAxis: {
      pointOnColumn: true
    }
  },
  options: {
    series: {}
  },
  theme: {
    series: {
      colors: ['#aaaaaa', '#bbbbbb']
    }
  },
  categories: ['A', 'B']
};

beforeEach(() => {
  areaSeries = new AreaSeries({
    store: {} as Store<AreaChartOptions>,
    eventBus: new EventEmitter()
  });

  areaSeries.render(chartState);
});

const result = {
  rect: { width: 80, height: 80, x: 10, y: 80 },
  linePointsModel: [
    {
      color: '#aaaaaa',
      lineWidth: 6,
      points: [
        { x: 20, y: 80 },
        { x: 60, y: 60 }
      ],
      seriesIndex: 0,
      type: 'linePoints'
    },
    {
      color: '#bbbbbb',
      lineWidth: 6,
      points: [
        { x: 20, y: 20 },
        { x: 60, y: 0 }
      ],
      seriesIndex: 1,
      type: 'linePoints'
    }
  ],
  responders: [
    {
      color: '#aaaaaa',
      data: { category: 'A', color: '#aaaaaa', label: 'han', value: 1 },
      radius: 7,
      seriesIndex: 0,
      style: ['default', 'hover'],
      type: 'circle',
      x: 20,
      y: 80
    },
    {
      color: '#aaaaaa',
      data: { category: 'B', color: '#aaaaaa', label: 'han', value: 2 },
      radius: 7,
      seriesIndex: 0,
      style: ['default', 'hover'],
      type: 'circle',
      x: 60,
      y: 60
    },
    {
      color: '#bbbbbb',
      data: { category: 'A', color: '#bbbbbb', label: 'cho', value: 4 },
      radius: 7,
      seriesIndex: 1,
      style: ['default', 'hover'],
      type: 'circle',
      x: 20,
      y: 20
    },
    {
      color: '#bbbbbb',
      data: { category: 'B', color: '#bbbbbb', label: 'cho', value: 5 },
      radius: 7,
      seriesIndex: 1,
      style: ['default', 'hover'],
      type: 'circle',
      x: 60,
      y: 0
    }
  ],
  models: [
    { height: 80, type: 'clipRectArea', width: 0, x: 0, y: 0 },
    {
      bottomYPoint: 80,
      color: 'rgba(0, 0, 0, 0)',
      fillColor: '#aaaaaa',
      lineWidth: 0,
      points: [
        { x: 20, y: 80 },
        { x: 60, y: 60 }
      ],
      seriesIndex: 0,
      type: 'areaPoints'
    },
    {
      bottomYPoint: 80,
      color: 'rgba(0, 0, 0, 0)',
      fillColor: '#bbbbbb',
      lineWidth: 0,
      points: [
        { x: 20, y: 20 },
        { x: 60, y: 0 }
      ],
      seriesIndex: 1,
      type: 'areaPoints'
    }
  ]
};

['rect', 'linePoints', 'responders', 'models'].forEach(modelName => {
  it(`should make ${modelName} properly when calling render`, () => {
    expect(areaSeries[modelName]).toEqual(result[modelName]);
  });
});

it('add line points model and circle model when hover above line point', () => {
  const clearLinePointsModel = jest.spyOn(areaSeries, 'clearLinePointsModel');
  const applyAreaOpacity = jest.spyOn(areaSeries, 'applyAreaOpacity');
  const responder = result.responders[1];

  areaSeries.onMousemove({ responders: [responder] });

  expect(clearLinePointsModel).not.toHaveBeenCalled();

  expect(applyAreaOpacity).toHaveBeenCalledWith(0.5);

  expect(areaSeries.models.filter(model => model.type === 'linePoints')).toEqual([
    result.linePointsModel[0]
  ]);

  expect(areaSeries.models.filter(model => model.type === 'circle')).toEqual([responder]);
});

it('remove line points model and circle model when mousemove after hover above line point', () => {
  const clearLinePointsModel = jest.spyOn(areaSeries, 'clearLinePointsModel');
  const responder = result.responders[1];
  areaSeries.onMousemove({ responders: [responder] });

  areaSeries.onMousemove({ responders: [] });
  expect(clearLinePointsModel).toHaveBeenCalled();

  expect(areaSeries.models.length).toEqual(result.models.length);
});
