/**
 * @fileoverview test for MapChartSeries
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import snippet from 'tui-code-snippet';
import boxPlotChartSeriesFactory from '../../../src/js/components/series/boxPlotChartSeries.js';

describe('BoxPlotChartSeries', () => {
  describe('init()', () => {
    it('showLabel option should not be allowed.', () => {
      const series = new boxPlotChartSeriesFactory.BoxplotChartSeries({
        chartType: 'boxplot',
        options: {
          showLabel: true
        },
        eventBus: new snippet.CustomEvents()
      });

      expect(series.supportSeriesLable).toBe(false);
    });
  });
});
