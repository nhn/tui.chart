import { BubbleChartOptions } from '@t/options';
import Store from '@src/store/store';
import EventEmitter from '@src/eventEmitter';
import CircleLegend from '@src/component/circleLegend';

let circleLegend;
const seriesData = [
  {
    name: 'nameA',
    data: [
      { x: 10, y: 20, r: 100, label: 'A' },
      { x: 15, y: 20, r: 200, label: 'B' },
    ],
  },
  {
    name: 'nameB',
    data: [{ x: 20, y: 10, r: 30, label: 'C' }],
  },
];

const chartState = {
  chart: { width: 350, height: 350 },
  layout: {
    plot: { width: 280, height: 280, x: 10, y: 80 },
    legend: { width: 35, height: 280, x: 300, y: 280 },
  },
  series: {
    bubble: {
      data: seriesData,
      seriesCount: seriesData.length,
      seriesGroupCount: seriesData[0].data.length,
    },
  },
  scale: {},
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
    circleLegend: {
      visible: true,
    },
  },
  theme: {
    series: {
      colors: ['#aaaaaa', '#bbbbbb'],
    },
  },
};

const models = {
  circleLegend: [{ radius: 17.5, type: 'circleLegend', value: 200, x: 17.5, y: 262.5 }],
};

it('should make models properly when calling render', () => {
  circleLegend = new CircleLegend({
    store: {} as Store<BubbleChartOptions>,
    eventBus: new EventEmitter(),
  });

  circleLegend.render(chartState);

  expect(circleLegend.models).toEqual(models);
});

it('should not make models when circleLegend.visible is false', () => {
  chartState.options.circleLegend.visible = false;

  circleLegend = new CircleLegend({
    store: {} as Store<BubbleChartOptions>,
    eventBus: new EventEmitter(),
  });

  circleLegend.render(chartState);

  expect(circleLegend.models).toEqual({ circleLegend: [] });
});
