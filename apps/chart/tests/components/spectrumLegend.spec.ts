import SpectrumLegend from '@src/component/spectrumLegend';
import Store from '@src/store/store';
import { LineChartOptions } from '@t/options';
import EventEmitter from '@src/eventEmitter';

let spectrumLegend;

describe('spectrum legend', () => {
  beforeEach(() => {
    spectrumLegend = new SpectrumLegend({
      store: {} as Store<LineChartOptions>,
      eventBus: new EventEmitter(),
    });
  });

  describe('make model properly', () => {
    beforeEach(() => {
      spectrumLegend.render({
        layout: { legend: { x: 10, y: 10, width: 10, height: 80 } },
        axes: {
          yAxis: {
            pointOnColumn: true,
            tickDistance: 40,
            tickInterval: 1,
            labelInterval: 1,
            labels: ['1', '2'],
            tickCount: 2,
            labelDistance: 40,
          },
        },
        legend: {
          visible: true,
          data: [
            {
              active: true,
              chartType: 'treemap',
              checked: true,
              iconType: 'spectrum',
              width: 49,
            },
            {
              active: true,
              chartType: 'treemap',
              checked: true,
              iconType: 'spectrum',
              width: 49,
            },
            {
              active: true,
              chartType: 'treemap',
              checked: true,
              iconType: 'spectrum',
              width: 49,
            },
            {
              active: true,
              chartType: 'treemap',
              checked: true,
              iconType: 'spectrum',
              width: 49,
            },
          ],
        },
        colorValueScale: {
          limit: { max: 2, min: 0 },
          stepSize: 1,
          stepCount: 2,
        },
        treemapSeries: [
          {
            color: '#00a9ff',
            data: 1,
            depth: 1,
            hasChild: false,
            id: '__TOAST_UI_TREEMAP_0_0',
            indexes: [0, 0],
            label: 'B',
            opacity: 0.1,
            parentId: '__TOAST_UI_TREEMAP_0',
            ratio: 0.5,
            colorValue: 1,
          },
          {
            color: '#00a9ff',
            data: 2,
            depth: 1,
            hasChild: false,
            id: '__TOAST_UI_TREEMAP_0_1',
            indexes: [0, 1],
            label: 'C',
            opacity: 0.15,
            parentId: '__TOAST_UI_TREEMAP_0',
            ratio: 0.5,
            colorValue: 1,
          },
          {
            color: '#00a9ff',
            data: 2,
            depth: 0,
            hasChild: true,
            id: '__TOAST_UI_TREEMAP_0',
            indexes: [0],
            label: 'A',
            opacity: 0,
            parentId: '__TOAST_UI_TREEMAP_ROOT',
            ratio: 0.5,
          },
          {
            color: '#ffb840',
            data: 2,
            depth: 0,
            hasChild: false,
            id: '__TOAST_UI_TREEMAP_1',
            indexes: [1],
            label: 'D',
            opacity: 0,
            parentId: '__TOAST_UI_TREEMAP_ROOT',
            ratio: 0.5,
            colorValue: 2,
          },
        ],
        theme: {
          series: {
            treemap: {
              startColor: '00a9ff',
              endColor: '#ffb840',
            },
          },
        },
      });
    });

    it('should make model properly when calling render', () => {
      expect(spectrumLegend.models).toEqual({
        legend: [
          {
            endColor: '#ffb840',
            height: 80,
            labels: ['0', '1', '2'],
            startColor: '00a9ff',
            type: 'spectrumLegend',
            verticalAlign: false,
            width: 10,
            x: 0,
            y: 0,
          },
        ],
        tooltip: [],
      });
    });
  });
});
