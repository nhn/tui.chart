import { PieChartOptions } from '@t/options';
import PieSeries from '@src/component/pieSeries';
import Store from '@src/store/store';
import EventEmitter from '@src/eventEmitter';
import { deepMergedCopy } from '@src/helpers/utils';

let pieSeries;
const colors = ['#00a9ff', '#ffb840'];

const seriesData = [
  {
    name: 'A',
    data: 50,
  },
  {
    name: 'B',
    data: 50,
  },
];

const chartState = {
  chart: { width: 110, height: 110 },
  layout: {
    plot: { width: 100, height: 100, x: 10, y: 10 },
  },
  series: {
    pie: {
      data: seriesData.map((m, idx) => ({ ...m, color: colors[idx] })),
    },
  },
  options: {
    series: {},
  },
  legend: {
    data: [
      { label: 'A', active: true, checked: true },
      { label: 'B', active: true, checked: true },
    ],
  },
  categories: ['Browser'],
  dataLabels: {
    visible: false,
  },
  theme: {
    series: {
      pie: {
        areaOpacity: 1,
        strokeStyle: 'rgba(0, 0, 0, 0)',
        lineWidth: 0,
        hover: {
          lineWidth: 5,
          strokeStyle: '#ffffff',
          shadowColor: '#cccccc',
          shadowBlur: 5,
        },
        select: {
          lineWidth: 5,
          strokeStyle: '#ffffff',
          shadowColor: '#cccccc',
          shadowBlur: 5,
          restSeries: {
            areaOpacity: 0.3,
          },
          areaOpacity: 1,
        },
        dataLabels: {
          fontFamily: 'Arial',
          fontSize: 11,
          fontWeight: 400,
          color: '#333333',
          pieSeriesName: {
            fontFamily: 'Arial',
            fontSize: 11,
            fontWeight: 400,
            color: '#333333',
          },
        },
      },
    },
  },
};

describe('basic', () => {
  beforeEach(() => {
    pieSeries = new PieSeries({
      store: {} as Store<PieChartOptions>,
      eventBus: new EventEmitter(),
    });
  });

  it('should render pie series', () => {
    pieSeries.render(chartState);

    const result = {
      series: [
        {
          color: 'rgba(0, 169, 255, 1)',
          name: 'A',
          radius: { inner: 0, outer: 50 },
          degree: { start: 0, end: 180 },
          style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }],
          type: 'sector',
          value: 50,
          x: 50,
          y: 50,
          clockwise: true,
          drawingStartAngle: -90,
          totalAngle: 360,
          percentValue: 50,
          lineWidth: 0,
        },
        {
          color: 'rgba(255, 184, 64, 1)',
          name: 'B',
          radius: { inner: 0, outer: 50 },
          degree: { start: 180, end: 360 },
          style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }],
          type: 'sector',
          value: 50,
          x: 50,
          y: 50,
          clockwise: true,
          drawingStartAngle: -90,
          totalAngle: 360,
          percentValue: 50,
          lineWidth: 0,
        },
      ],
    };

    const responderResult = [
      {
        type: 'sector',
        name: 'A',
        color: 'rgba(0, 169, 255, 1)',
        x: 50,
        y: 50,
        radius: { inner: 0, outer: 50 },
        degree: { start: 0, end: 180 },
        value: 50,
        clockwise: true,
        drawingStartAngle: -90,
        style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }],
        seriesIndex: 0,
        data: {
          label: 'A',
          color: '#00a9ff',
          value: 50,
          category: 'Browser',
          percentValue: 50,
          templateType: 'pie',
        },
        totalAngle: 360,
        percentValue: 50,
        lineWidth: 0,
      },
      {
        type: 'sector',
        name: 'B',
        color: 'rgba(255, 184, 64, 1)',
        x: 50,
        y: 50,
        radius: { inner: 0, outer: 50 },
        degree: { start: 180, end: 360 },
        value: 50,
        clockwise: true,
        drawingStartAngle: -90,
        style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }],
        seriesIndex: 1,
        data: {
          label: 'B',
          color: '#ffb840',
          value: 50,
          category: 'Browser',
          percentValue: 50,
          templateType: 'pie',
        },
        totalAngle: 360,
        percentValue: 50,
        lineWidth: 0,
      },
    ];
    expect(pieSeries.models).toEqual(result);
    expect(pieSeries.responders).toEqual(responderResult);
  });

  it('should be drawn counterclockwise, if clockwise is a false', () => {
    pieSeries.render(
      deepMergedCopy(chartState, {
        options: {
          series: {
            clockwise: false,
          },
        },
      })
    );

    const result = [
      {
        clockwise: false,
        color: 'rgba(0, 169, 255, 1)',
        name: 'A',
        drawingStartAngle: -90,
        radius: { inner: 0, outer: 50 },
        degree: { start: 360, end: 180 },
        style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }],
        type: 'sector',
        value: 50,
        x: 50,
        y: 50,
        totalAngle: 360,
        percentValue: 50,
        lineWidth: 0,
      },
      {
        clockwise: false,
        color: 'rgba(255, 184, 64, 1)',
        name: 'B',
        drawingStartAngle: -90,
        radius: { inner: 0, outer: 50 },
        degree: { start: 180, end: 0 },
        style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }],
        type: 'sector',
        value: 50,
        x: 50,
        y: 50,
        totalAngle: 360,
        percentValue: 50,
        lineWidth: 0,
      },
    ];

    expect(pieSeries.models.series).toEqual(result);
  });

  it('should not make a model of null data', () => {
    pieSeries.render(
      deepMergedCopy(chartState, {
        series: {
          pie: {
            data: [
              { name: 'A', data: 50, color: '#cccccc' },
              { name: 'B', data: null, color: '#dddddd' },
              { name: 'C', data: 30, color: '#aaaaaa' },
              { name: 'D', data: 20, color: '#bbbbbb' },
            ],
          },
        },
      })
    );

    const models = [
      {
        color: 'rgba(204, 204, 204, 1)',
        name: 'A',
        radius: { inner: 0, outer: 50 },
        degree: { start: 0, end: 180 },
        style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }],
        type: 'sector',
        value: 50,
        x: 50,
        y: 50,
        clockwise: true,
        drawingStartAngle: -90,
        totalAngle: 360,
        percentValue: 50,
        lineWidth: 0,
      },
      {
        color: 'rgba(170, 170, 170, 1)',
        name: 'C',
        radius: { inner: 0, outer: 50 },
        degree: { start: 180, end: 288 },
        style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }],
        type: 'sector',
        value: 30,
        x: 50,
        y: 50,
        clockwise: true,
        drawingStartAngle: -90,
        totalAngle: 360,
        percentValue: 30,
        lineWidth: 0,
      },
      {
        color: 'rgba(187, 187, 187, 1)',
        name: 'D',
        radius: { inner: 0, outer: 50 },
        degree: { start: 288, end: 360 },
        style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }],
        type: 'sector',
        value: 20,
        x: 50,
        y: 50,
        clockwise: true,
        drawingStartAngle: -90,
        totalAngle: 360,
        percentValue: 20,
        lineWidth: 0,
      },
    ];

    expect(pieSeries.models.series).toEqual(models);
  });

  it('should not make a model of zero value data', () => {
    pieSeries.render(
      deepMergedCopy(chartState, {
        series: {
          pie: {
            data: [
              { name: 'A', data: 50, color: '#aaa' },
              { name: 'B', data: 0, color: '#bbb' },
            ],
          },
        },
      })
    );

    const models = [
      {
        color: 'rgba(170, 170, 170, 1)',
        name: 'A',
        radius: { inner: 0, outer: 50 },
        degree: { start: 0, end: 360 },
        style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }],
        type: 'sector',
        value: 50,
        x: 50,
        y: 50,
        clockwise: true,
        drawingStartAngle: -90,
        totalAngle: 360,
        percentValue: 100,
        lineWidth: 0,
      },
    ];

    expect(pieSeries.models.series).toEqual(models);
  });
});

describe('donut', () => {
  beforeEach(() => {
    pieSeries = new PieSeries({
      store: {} as Store<PieChartOptions>,
      eventBus: new EventEmitter(),
    });

    pieSeries.render(
      deepMergedCopy(chartState, {
        options: {
          series: {
            radiusRange: {
              inner: '40%',
              outer: '100%',
            },
          },
        },
      })
    );
  });

  it('should render donut-shaped pie series', () => {
    const result = {
      series: [
        {
          color: 'rgba(0, 169, 255, 1)',
          name: 'A',
          radius: { inner: 20, outer: 50 },
          degree: { start: 0, end: 180 },
          style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }],
          type: 'sector',
          value: 50,
          x: 50,
          y: 50,
          clockwise: true,
          drawingStartAngle: -90,
          totalAngle: 360,
          percentValue: 50,
          lineWidth: 0,
        },
        {
          color: 'rgba(255, 184, 64, 1)',
          name: 'B',
          radius: { inner: 20, outer: 50 },
          degree: { start: 180, end: 360 },
          style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }],
          type: 'sector',
          value: 50,
          x: 50,
          y: 50,
          clockwise: true,
          drawingStartAngle: -90,
          totalAngle: 360,
          percentValue: 50,
          lineWidth: 0,
        },
      ],
    };

    const responderResult = [
      {
        type: 'sector',
        name: 'A',
        color: 'rgba(0, 169, 255, 1)',
        x: 50,
        y: 50,
        radius: { inner: 20, outer: 50 },
        degree: { start: 0, end: 180 },
        value: 50,
        clockwise: true,
        drawingStartAngle: -90,
        style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }],
        seriesIndex: 0,
        data: {
          label: 'A',
          color: '#00a9ff',
          value: 50,
          category: 'Browser',
          percentValue: 50,
          templateType: 'pie',
        },
        totalAngle: 360,
        percentValue: 50,
        lineWidth: 0,
      },
      {
        type: 'sector',
        name: 'B',
        color: 'rgba(255, 184, 64, 1)',
        x: 50,
        y: 50,
        radius: { inner: 20, outer: 50 },
        degree: { start: 180, end: 360 },
        value: 50,
        clockwise: true,
        drawingStartAngle: -90,
        style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }],
        seriesIndex: 1,
        data: {
          label: 'B',
          color: '#ffb840',
          value: 50,
          category: 'Browser',
          percentValue: 50,
          templateType: 'pie',
        },
        totalAngle: 360,
        percentValue: 50,
        lineWidth: 0,
      },
    ];
    expect(pieSeries.models).toEqual(result);
    expect(pieSeries.responders).toEqual(responderResult);
  });

  describe('semi circle', () => {
    beforeEach(() => {
      pieSeries = new PieSeries({
        store: {} as Store<PieChartOptions>,
        eventBus: new EventEmitter(),
      });

      pieSeries.render(
        deepMergedCopy(chartState, {
          options: {
            series: {
              angleRange: {
                start: -90,
                end: 90,
              },
            },
          },
        })
      );
    });

    it('should render semi circle entering start angle and end angle', () => {
      const result = [
        {
          clockwise: true,
          color: 'rgba(0, 169, 255, 1)',
          name: 'A',
          radius: { inner: 0, outer: 50 },
          degree: { start: 0, end: 90 },
          drawingStartAngle: -180,
          style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }],
          type: 'sector',
          value: 50,
          x: 50,
          y: 100,
          totalAngle: 180,
          percentValue: 50,
          lineWidth: 0,
        },
        {
          clockwise: true,
          color: 'rgba(255, 184, 64, 1)',
          name: 'B',
          radius: { inner: 0, outer: 50 },
          degree: { start: 90, end: 180 },
          drawingStartAngle: -180,
          style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }],
          type: 'sector',
          value: 50,
          x: 50,
          y: 100,
          totalAngle: 180,
          percentValue: 50,
          lineWidth: 0,
        },
      ];

      expect(pieSeries.models.series).toEqual(result);
    });
  });
});
