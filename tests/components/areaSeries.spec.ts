import { AreaChartOptions } from '@t/options';
import AreaSeries from '@src/component/areaSeries';
import Store from '@src/store/store';
import EventEmitter from '@src/eventEmitter';
import { AreaPointsModel, LinePointsModel } from '@t/components/series';

let areaSeries;
const seriesData = [
  { name: 'han', data: [1, 2] },
  { name: 'cho', data: [4, 5] }
];
const limit = {
  min: 1,
  max: 8
};
const tickDistance = 1;
const categories = ['A', 'B'];
const renderOptions = {
  theme: {
    colors: ['#aaa', '#bbb', '#ccc']
  }
};
const linePointsModel = [
  {
    type: 'linePoints',
    color: '#aaa',
    points: [
      { x: 1, y: 0 },
      { x: 2, y: 2 }
    ],
    seriesIndex: 0,
    lineWidth: 6
  }
];
const bottomYPoint = 10;

beforeEach(() => {
  areaSeries = new AreaSeries({
    store: {} as Store<AreaChartOptions>,
    eventBus: new EventEmitter()
  });
});

it('makeLinePointsModel', () => {
  const resultArr = areaSeries.makeLinePointsModel(
    seriesData,
    limit,
    tickDistance,
    renderOptions,
    categories
  );

  expect(resultArr.length).toBe(2);

  resultArr.forEach((result, idx) => {
    expect(result.lineWidth).toBe(6);
    expect(result.seriesIndex).toBe(idx);
    expect(result.type).toBe('linePoints');
    expect(result.points.length).toBe(2);
    expect(result.color).toBe(renderOptions.theme.colors[idx]);
  });
});

it('makeAreaPointsModel', () => {
  const resultArr = areaSeries.makeAreaPointsModel(linePointsModel, bottomYPoint);

  resultArr.forEach(result => {
    expect(result.type).toBe('areaPoints');
    expect(result.color).toBe('rgba(0, 0, 0, 0)');
    expect(result.bottomYPoint).toBe(bottomYPoint);
  });
});

it('makeTooltipData', () => {
  const resultArr = areaSeries.makeTooltipData(seriesData, renderOptions, categories);
  const compVal = [
    { category: 'A', color: '#aaa', label: 'han', value: 1 },
    { category: 'B', color: '#aaa', label: 'han', value: 2 },
    { category: 'A', color: '#bbb', label: 'cho', value: 4 },
    { category: 'B', color: '#bbb', label: 'cho', value: 5 }
  ];
  expect(resultArr).toEqual(compVal);
});

it('makeCircleModel', () => {
  const resultArr = areaSeries.makeCircleModel(linePointsModel);
  const compVal = [
    {
      color: '#aaa',
      radius: 7,
      seriesIndex: 0,
      style: ['default', 'hover'],
      type: 'circle',
      x: 1,
      y: 0
    },
    {
      color: '#aaa',
      radius: 7,
      seriesIndex: 0,
      style: ['default', 'hover'],
      type: 'circle',
      x: 2,
      y: 2
    }
  ];
  expect(resultArr).toEqual(compVal);
});

it('isAreaPointsModel', () => {
  const areaModel = { type: 'areaPoints' } as AreaPointsModel;
  const lineModel = { type: 'linePoints' } as LinePointsModel;

  expect(areaSeries.isAreaPointsModel(areaModel)).toBe(true);
  expect(areaSeries.isAreaPointsModel(lineModel)).toBe(false);
});
