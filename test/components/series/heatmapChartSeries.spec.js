/**
 * @fileoverview test for HeatmapChartSeries
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import snippet from 'tui-code-snippet';
import heatmapSeriesFactory from '../../../src/js/components/series/heatmapChartSeries.js';

describe('HeatmapChartSeries', () => {
  let series;

  beforeEach(() => {
    series = new heatmapSeriesFactory.HeatmapChartSeries({
      chartType: 'heatmap',
      theme: {},
      eventBus: new snippet.CustomEvents()
    });
  });

  describe('_makeBound()', () => {
    it('should make bonds using block dimension and x, y position.', () => {
      series.layout = {
        dimension: {
          height: 200
        },
        position: {
          top: 0,
          left: 0
        }
      };

      const actual = series._makeBound(30, 30, 0, 1);

      expect(actual.end).toEqual({
        left: 0,
        top: 140,
        width: 30,
        height: 30
      });
    });
  });
});
