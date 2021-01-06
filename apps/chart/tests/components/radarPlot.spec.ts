import RadarPlot from '@src/component/radarPlot';
import Store from '@src/store/store';
import EventEmitter from '@src/eventEmitter';
import { deepMergedCopy } from '@src/helpers/utils';
import { Options } from '@t/store/store';

let radarPlot;

const seriesData = [
  { name: 'han', data: [1, 2, 3, 4] },
  { name: 'cho', data: [2, 1, 1, 3] },
];

const chartState = {
  chart: { width: 200, height: 200 },
  layout: {
    plot: { width: 200, height: 200, x: 0, y: 0 },
  },
  scale: { yAxis: { limit: { min: 0, max: 5 }, stepSize: 1, stepCount: 1 } },
  series: {
    radar: {
      data: seriesData,
    },
  },
  axes: {
    xAxis: {},
    yAxis: {},
    radialAxis: {
      labels: ['0', '1', '2', '3', '4', '5'],
      axisSize: 50,
      centerX: 100,
      centerY: 100,
    },
  },
  categories: ['A', 'B', 'C', 'D'],
  options: {},
};

describe('radar plot', () => {
  beforeEach(() => {
    radarPlot = new RadarPlot({
      store: {} as Store<Options>,
      eventBus: new EventEmitter(),
    });
  });

  describe('The type of plot passed as an option', () => {
    it('should be drawn polygons for "spiderweb"', () => {
      radarPlot.render(chartState);

      expect(radarPlot.models.plot).toEqual([
        {
          type: 'polygon',
          color: 'rgba(0, 0, 0, 0.05)',
          lineWidth: 1,
          points: [
            { x: 100, y: 90 },
            { x: 110, y: 100 },
            { x: 100, y: 110 },
            { x: 90, y: 100 },
          ],
        },
        {
          type: 'polygon',
          color: 'rgba(0, 0, 0, 0.05)',
          lineWidth: 1,
          points: [
            { x: 100, y: 80 },
            { x: 120, y: 100 },
            { x: 100, y: 120 },
            { x: 80, y: 100 },
          ],
        },
        {
          type: 'polygon',
          color: 'rgba(0, 0, 0, 0.05)',
          lineWidth: 1,
          points: [
            { x: 100, y: 70 },
            { x: 130, y: 100 },
            { x: 100, y: 130 },
            { x: 70, y: 100 },
          ],
        },
        {
          type: 'polygon',
          color: 'rgba(0, 0, 0, 0.05)',
          lineWidth: 1,
          points: [
            { x: 100, y: 60 },
            { x: 140, y: 100 },
            { x: 100, y: 140 },
            { x: 60, y: 100 },
          ],
        },
        {
          type: 'polygon',
          color: 'rgba(0, 0, 0, 0.05)',
          lineWidth: 1,
          points: [
            { x: 100, y: 50 },
            { x: 150, y: 100 },
            { x: 100, y: 150 },
            { x: 50, y: 100 },
          ],
        },
      ]);
    });

    it('should be drawn polygons for "circle"', () => {
      radarPlot.render(
        deepMergedCopy(chartState, {
          options: {
            plot: {
              type: 'circle',
            },
          },
        })
      );

      expect(radarPlot.models.plot).toEqual([
        {
          type: 'circle',
          color: 'rgba(0, 0, 0, 0)',
          style: ['plot'],
          radius: 10,
          x: 100,
          y: 100,
        },
        {
          type: 'circle',
          color: 'rgba(0, 0, 0, 0)',
          style: ['plot'],
          radius: 20,
          x: 100,
          y: 100,
        },
        {
          type: 'circle',
          color: 'rgba(0, 0, 0, 0)',
          style: ['plot'],
          radius: 30,
          x: 100,
          y: 100,
        },
        {
          type: 'circle',
          color: 'rgba(0, 0, 0, 0)',
          style: ['plot'],
          radius: 40,
          x: 100,
          y: 100,
        },
        {
          type: 'circle',
          color: 'rgba(0, 0, 0, 0)',
          style: ['plot'],
          radius: 50,
          x: 100,
          y: 100,
        },
      ]);
    });
  });

  it('should have category dot models', () => {
    radarPlot.render(chartState);

    expect(radarPlot.models.dot).toEqual([
      {
        type: 'rect',
        color: 'rgba(0, 0, 0, .5)',
        width: 4,
        height: 4,
        x: 98,
        y: 48,
      },
      {
        type: 'rect',
        color: 'rgba(0, 0, 0, .5)',
        width: 4,
        height: 4,
        x: 148,
        y: 98,
      },
      {
        type: 'rect',
        color: 'rgba(0, 0, 0, .5)',
        width: 4,
        height: 4,
        x: 98,
        y: 148,
      },
      {
        type: 'rect',
        color: 'rgba(0, 0, 0, .5)',
        width: 4,
        height: 4,
        x: 48,
        y: 98,
      },
    ]);
  });

  it('should have category label models', () => {
    radarPlot.render(chartState);

    expect(radarPlot.models.label).toEqual([
      {
        type: 'label',
        style: ['default', { textAlign: 'center' }],
        text: 'A',
        x: 100,
        y: 15,
      },
      {
        type: 'label',
        style: ['default', { textAlign: 'center' }],
        text: 'B',
        x: 185,
        y: 100,
      },
      {
        type: 'label',
        style: ['default', { textAlign: 'center' }],
        text: 'C',
        x: 100,
        y: 185,
      },
      {
        type: 'label',
        style: ['default', { textAlign: 'center' }],
        text: 'D',
        x: 15,
        y: 100,
      },
    ]);
  });
});
