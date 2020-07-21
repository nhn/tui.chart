import { PieChartOptions } from '@t/options';
import PieSeries from '@src/component/pieSeries';
import Store from '@src/store/store';
import EventEmitter from '@src/eventEmitter';
import { browserUsageData } from '../../stories/data';

let pieSeries;
const colors = ['#00a9ff', '#ffb840', '#ff5a46', '#00bd9f', '#785fff', '#f28b8c'];
const seriesData = browserUsageData.series;
const chartState = {
  chart: { width: 100, height: 100 },
  layout: {
    plot: { width: 90, height: 90, x: 10, y: 10 },
  },
  series: {
    pie: {
      data: seriesData.map((m, idx) => ({ ...m, color: colors[idx] })),
      seriesCount: seriesData.length,
    },
  },
  options: {
    series: {},
  },
  legend: {
    data: [
      { label: 'Chrome', active: true, checked: true },
      { label: 'IE', active: true, checked: true },
      { label: 'Firefox', active: true, checked: true },
      { label: 'Safari', active: true, checked: true },
      { label: 'Opera', active: true, checked: true },
      { label: 'Etc', active: true, checked: true },
    ],
  },
  categories: browserUsageData.categories,
  dataLabels: {
    visible: false,
  },
};

describe('basic', () => {
  beforeEach(() => {
    pieSeries = new PieSeries({
      store: {} as Store<PieChartOptions>,
      eventBus: new EventEmitter(),
    });

    pieSeries.render(chartState);
  });

  it('should be rendered pie series', () => {
    console.log(pieSeries.models);

    const result = {
      series: [
        {
          color: 'rgba(0, 169, 255, 1)',
          endDegree: 165.67199999999997,
          name: 'Chrome',
          radius: 40.5,
          startDegree: 0,
          style: ['default'],
          type: 'sector',
          value: 46.02,
          x: 45,
          y: 45,
        },
        {
          color: 'rgba(255, 184, 64, 1)',
          endDegree: 239.36399999999998,
          name: 'IE',
          radius: 40.5,
          startDegree: 165.67199999999997,
          style: ['default'],
          type: 'sector',
          value: 20.47,
          x: 45,
          y: 45,
        },
        {
          color: 'rgba(255, 90, 70, 1)',
          endDegree: 303.11999999999995,
          name: 'Firefox',
          radius: 40.5,
          startDegree: 239.36399999999998,
          style: ['default'],
          type: 'sector',
          value: 17.71,
          x: 45,
          y: 45,
        },
        {
          color: 'rgba(0, 189, 159, 1)',
          endDegree: 322.73999999999995,
          name: 'Safari',
          radius: 40.5,
          startDegree: 303.11999999999995,
          style: ['default'],
          type: 'sector',
          value: 5.45,
          x: 45,
          y: 45,
        },
        {
          color: 'rgba(120, 95, 255, 1)',
          endDegree: 333.9,
          name: 'Opera',
          radius: 40.5,
          startDegree: 322.73999999999995,
          style: ['default'],
          type: 'sector',
          value: 3.1,
          x: 45,
          y: 45,
        },
        {
          color: 'rgba(242, 139, 140, 1)',
          endDegree: 360,
          name: 'Etc',
          radius: 40.5,
          startDegree: 333.9,
          style: ['default'],
          type: 'sector',
          value: 7.25,
          x: 45,
          y: 45,
        },
      ],
    };

    expect(pieSeries.models).toEqual(result);
  });
});
