import Plot from '@src/component/plot';
import Store from '@src/store/store';
import EventEmitter from '@src/eventEmitter';
import { deepMergedCopy } from '@src/helpers/utils';
import { Options } from '@t/store/store';

let plot;

const seriesData = [
  { name: 'han', data: [1, 2], color: '#aaaaaa' },
  { name: 'cho', data: [4, 5], color: '#bbbbbb' },
];

const chartState = {
  chart: { width: 100, height: 100 },
  layout: {
    xAxis: { x: 10, y: 80, width: 80, height: 10 },
    yAxis: { x: 10, y: 10, width: 10, height: 80 },
    plot: { width: 80, height: 80, x: 10, y: 80 },
  },
  axes: {
    xAxis: {
      labels: [0, 5],
      tickCount: 2,
      tickDistance: 40,
    },
    yAxis: {
      pointOnColumn: true,
      tickDistance: 40,
      tickCount: 2,
    },
  },
  series: {
    bar: {
      data: seriesData,
      seriesCount: seriesData.length,
      seriesGroupCount: seriesData[0].data.length,
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
  plot: { visible: true },
  categories: ['A', 'B'],
  theme: {
    plot: {
      lineColor: 'rgba(0, 0, 0, 0.05)',
      vertical: {
        lineColor: 'rgba(0, 0, 0, 0.05)',
      },
      horizontal: {
        lineColor: 'rgba(0, 0, 0, 0.05)',
      },
      backgroundColor: '#ffffff',
    },
  },
};

describe('plot grid lines', () => {
  beforeEach(() => {
    plot = new Plot({
      store: {} as Store<Options>,
      eventBus: new EventEmitter(),
    });
  });

  it('should be drawn depending on the tick of the axis', () => {
    plot.render(chartState);

    const result = [
      {
        type: 'rect',
        x: 0,
        y: 0,
        width: 80,
        height: 80,
        color: '#ffffff',
      },
      {
        type: 'line',
        x: 0.5,
        x2: 80.5,
        y: 0.5,
        y2: 0.5,
        strokeStyle: 'rgba(0, 0, 0, 0.05)',
        dashSegments: [],
        lineWidth: 1,
      },
      {
        type: 'line',
        x: 0.5,
        x2: 80.5,
        y: 80.5,
        y2: 80.5,
        strokeStyle: 'rgba(0, 0, 0, 0.05)',
        dashSegments: [],
        lineWidth: 1,
      },
      {
        type: 'line',
        x: 0.5,
        x2: 0.5,
        y: 0.5,
        y2: 80.5,
        strokeStyle: 'rgba(0, 0, 0, 0.05)',
        dashSegments: [],
        lineWidth: 1,
      },
      {
        type: 'line',
        x: 80.5,
        x2: 80.5,
        y: 0.5,
        y2: 80.5,
        strokeStyle: 'rgba(0, 0, 0, 0.05)',
        dashSegments: [],
        lineWidth: 1,
      },
    ];

    expect(plot.models.plot).toEqual(result);
  });

  it('should be drawn on both sides, when using the center y-axis', () => {
    plot.render(
      deepMergedCopy(chartState, {
        axes: {
          centerYAxis: {
            xAxisHalfSize: 35,
            secondStartX: 45,
            yAxisLabelAnchorPoint: 5,
            yAxisHeight: 80,
          },
        },
      })
    );

    const result = [
      {
        type: 'rect',
        x: 0,
        y: 0,
        width: 80,
        height: 80,
        color: '#ffffff',
      },

      {
        type: 'line',
        x: 0.5,
        x2: 0.5,
        y: 0.5,
        y2: 80.5,
        strokeStyle: 'rgba(0, 0, 0, 0.05)',
        dashSegments: [],
        lineWidth: 1,
      },

      {
        type: 'line',
        x: 35.5,
        x2: 35.5,
        y: 0.5,
        y2: 80.5,
        strokeStyle: 'rgba(0, 0, 0, 0.05)',
        dashSegments: [],
        lineWidth: 1,
      },
      {
        type: 'line',
        x: 45.5,
        x2: 45.5,
        y: 0.5,
        y2: 80.5,
        strokeStyle: 'rgba(0, 0, 0, 0.05)',
        dashSegments: [],
        lineWidth: 1,
      },
      {
        type: 'line',
        x: 80.5,
        x2: 80.5,
        y: 0.5,
        y2: 80.5,
        strokeStyle: 'rgba(0, 0, 0, 0.05)',
        dashSegments: [],
        lineWidth: 1,
      },
      {
        type: 'line',
        x: 0.5,
        x2: 35.5,
        y: 0.5,
        y2: 0.5,
        strokeStyle: 'rgba(0, 0, 0, 0.05)',
        dashSegments: [],
        lineWidth: 1,
      },
      {
        type: 'line',
        x: 0.5,
        x2: 35.5,
        y: 80.5,
        y2: 80.5,
        strokeStyle: 'rgba(0, 0, 0, 0.05)',
        dashSegments: [],
        lineWidth: 1,
      },
      {
        type: 'line',
        x: 45.5,
        x2: 80.5,
        y: 0.5,
        y2: 0.5,
        strokeStyle: 'rgba(0, 0, 0, 0.05)',
        dashSegments: [],
        lineWidth: 1,
      },
      {
        type: 'line',
        x: 45.5,
        x2: 80.5,
        y: 80.5,
        y2: 80.5,
        strokeStyle: 'rgba(0, 0, 0, 0.05)',
        dashSegments: [],
        lineWidth: 1,
      },
    ];
    expect(plot.models.plot).toEqual(result);
  });
});

describe('plot options', () => {
  const data = [];
  const state = {
    chart: { width: 100, height: 100 },
    layout: {
      xAxis: { x: 10, y: 80, width: 80, height: 10 },
      yAxis: { x: 10, y: 10, width: 10, height: 80 },
      plot: { width: 80, height: 80, x: 10, y: 10 },
    },
    series: {
      line: {
        data: data,
        seriesCount: 0,
        seriesGroupCount: 0,
      },
    },
    axes: {
      xAxis: {
        labels: ['0', '1', '2', '3', '4', '5'],
        tickCount: 6,
        tickDistance: 16,
        labelDistance: 16,
      },
      yAxis: {
        labels: ['0', '1', '2', '3', '4', '5'],
        tickCount: 6,
        tickDistance: 16,
        labelDistance: 16,
      },
    },
    plot: {},
    options: {
      series: {},
    },
    legend: {
      data: [
        { label: 'han', active: true, checked: true },
        { label: 'cho', active: true, checked: true },
      ],
    },
    categories: ['0', '1', '2', '3', '4', '5'],
    theme: {
      plot: {
        lineColor: 'rgba(0, 0, 0, 0.05)',
        vertical: {
          lineColor: 'rgba(0, 0, 0, 0.05)',
        },
        horizontal: {
          lineColor: 'rgba(0, 0, 0, 0.05)',
        },
        backgroundColor: '#ffffff',
      },
    },
  };

  beforeEach(() => {
    plot = new Plot({
      store: {} as Store<Options>,
      eventBus: new EventEmitter(),
    });
  });

  it('should render rect models for bands', () => {
    plot.render(
      deepMergedCopy(state, {
        plot: {
          bands: [
            {
              range: [1, 2],
              color: 'rgba(33, 33, 33, 0.2)',
            },
          ],
        },
        options: {
          plot: {
            bands: [
              {
                range: [1, 2],
                color: 'rgba(33, 33, 33, 0.2)',
              },
            ],
          },
        },
      })
    );

    expect(plot.models.band).toEqual([
      {
        type: 'rect',
        color: 'rgba(33, 33, 33, 0.2)',
        height: 80,
        width: 16,
        x: 16.5,
        y: 0.5,
      },
    ]);
  });

  it('should render line models for lines', () => {
    plot.render(
      deepMergedCopy(state, {
        plot: {
          lines: [
            {
              value: 4,
              color: '#ff0000',
              vertical: true,
            },
          ],
        },
        options: {
          plot: {
            lines: [
              {
                value: 4,
                color: '#ff0000',
              },
            ],
          },
        },
      })
    );

    expect(plot.models.line).toEqual([
      {
        type: 'line',
        x: 64.5,
        y: 0.5,
        x2: 64.5,
        y2: 80.5,
        strokeStyle: '#ff0000',
        dashSegments: [],
        lineWidth: 1,
      },
    ]);
  });
});
