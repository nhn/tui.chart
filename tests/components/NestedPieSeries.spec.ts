import { NestedPieChartOptions } from '@t/options';
import NestedPieSeries from '@src/component/NestedPieSeries';
import Store from '@src/store/store';
import EventEmitter from '@src/eventEmitter';

let pieSeries;

const seriesData = [
  {
    alias: 'pie1',
    data: [
      { name: 'A', data: 50 },
      { name: 'B', data: 50 },
    ],
  },
  {
    alias: 'pie2',
    data: [
      { name: 'C', data: 60 },
      { name: 'B', data: 40 },
    ],
  },
];

const chartState = {
  chart: { width: 210, height: 210 },
  layout: {
    plot: { width: 200, height: 200, x: 10, y: 10 },
  },
  series: {
    nestedPie: {
      data: seriesData,
    },
  },
  nestedPieSeries: {
    pie1: {
      data: [
        { name: 'A', data: 50, color: '#aaaaaa', rootParentName: 'A' },
        { name: 'B', data: 50, color: '#bbbbbb', rootParentName: 'B' },
      ],
    },
    pie2: {
      data: [
        { name: 'C', data: 60, color: '#cccccc', rootParentName: 'C' },
        { name: 'D', data: 40, color: '#dddddd', rootParentName: 'D' },
      ],
    },
  },
  options: {
    series: {
      pie1: {
        radiusRange: {
          inner: 0,
          outer: '50%',
        },
      },
      pie2: {
        radiusRange: {
          inner: '50%',
          outer: '100%',
        },
      },
    },
  },
  legend: {
    data: [
      { label: 'A', active: true, checked: true },
      { label: 'B', active: true, checked: true },
      { label: 'C', active: true, checked: true },
      { label: 'D', active: true, checked: true },
    ],
  },
  categories: ['Category1', 'Category2'],
  dataLabels: {
    visible: false,
  },
};

describe('basic', () => {
  beforeEach(() => {
    pieSeries = new NestedPieSeries({
      store: {} as Store<NestedPieChartOptions>,
      eventBus: new EventEmitter(),
    });
  });

  it('should render pie donut series', () => {
    pieSeries.render(chartState);

    const result = {
      pie1: [
        {
          color: 'rgba(170, 170, 170, 1)',
          name: 'A',
          radius: {
            inner: 0,
            outer: 45,
          },
          degree: {
            start: 0,
            end: 180,
          },
          style: ['nested'],
          type: 'sector',
          value: 50,
          x: 100,
          y: 100,
          clockwise: true,
          drawingStartAngle: -90,
          totalAngle: 360,
          alias: 'pie1',
        },
        {
          color: 'rgba(187, 187, 187, 1)',
          name: 'B',
          radius: {
            inner: 0,
            outer: 45,
          },
          degree: {
            start: 180,
            end: 360,
          },
          style: ['nested'],
          type: 'sector',
          value: 50,
          x: 100,
          y: 100,
          clockwise: true,
          drawingStartAngle: -90,
          totalAngle: 360,
          alias: 'pie1',
        },
      ],
      pie2: [
        {
          color: 'rgba(204, 204, 204, 1)',
          name: 'C',
          radius: {
            inner: 45,
            outer: 90,
          },
          degree: {
            start: 0,
            end: 216,
          },
          style: ['nested'],
          type: 'sector',
          value: 60,
          x: 100,
          y: 100,
          clockwise: true,
          drawingStartAngle: -90,
          totalAngle: 360,
          alias: 'pie2',
        },
        {
          color: 'rgba(221, 221, 221, 1)',
          name: 'D',
          radius: {
            inner: 45,
            outer: 90,
          },
          degree: {
            start: 216,
            end: 360,
          },
          style: ['nested'],
          type: 'sector',
          value: 40,
          x: 100,
          y: 100,
          clockwise: true,
          drawingStartAngle: -90,
          totalAngle: 360,
          alias: 'pie2',
        },
      ],
      selectedSeries: [],
    };

    const responderResult = [
      {
        type: 'sector',
        color: 'rgba(170, 170, 170, 1)',
        name: 'A',
        radius: {
          inner: 0,
          outer: 45,
        },
        degree: {
          start: 0,
          end: 180,
        },
        value: 50,
        x: 100,
        y: 100,
        clockwise: true,
        drawingStartAngle: -90,
        totalAngle: 360,
        alias: 'pie1',
        style: ['hover'],
        seriesIndex: 0,
        data: { label: 'A', color: '#aaaaaa', value: 50, category: 'Category1' },
      },
      {
        type: 'sector',
        color: 'rgba(187, 187, 187, 1)',
        name: 'B',
        radius: {
          inner: 0,
          outer: 45,
        },
        degree: {
          start: 180,
          end: 360,
        },
        value: 50,
        x: 100,
        y: 100,
        clockwise: true,
        drawingStartAngle: -90,
        totalAngle: 360,
        alias: 'pie1',
        style: ['hover'],
        seriesIndex: 1,
        data: { label: 'B', color: '#bbbbbb', value: 50, category: 'Category1' },
      },
      {
        type: 'sector',
        color: 'rgba(204, 204, 204, 1)',
        name: 'C',
        radius: {
          inner: 45,
          outer: 90,
        },
        degree: {
          start: 0,
          end: 216,
        },
        value: 60,
        x: 100,
        y: 100,
        clockwise: true,
        drawingStartAngle: -90,
        totalAngle: 360,
        alias: 'pie2',
        style: ['hover'],
        seriesIndex: 0,
        data: { label: 'C', color: '#cccccc', value: 60, category: 'Category2' },
      },
      {
        type: 'sector',
        color: 'rgba(221, 221, 221, 1)',
        name: 'D',
        radius: {
          inner: 45,
          outer: 90,
        },
        degree: {
          start: 216,
          end: 360,
        },
        value: 40,
        x: 100,
        y: 100,
        clockwise: true,
        drawingStartAngle: -90,
        totalAngle: 360,
        alias: 'pie2',
        style: ['hover'],
        seriesIndex: 1,
        data: { label: 'D', color: '#dddddd', value: 40, category: 'Category2' },
      },
    ];
    expect(pieSeries.models).toEqual(result);
    expect(pieSeries.responders).toEqual(responderResult);
  });
});
