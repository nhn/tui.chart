/**
 * @fileoverview test for MapChartSeries
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import CustomEvents from 'tui-code-snippet/customEvents/customEvents';
import boxPlotChartSeriesFactory from '../../../src/js/components/series/boxPlotChartSeries.js';

describe('BoxPlotChartSeries', () => {
  describe('init()', () => {
    it('showLabel option should not be allowed.', () => {
      const series = new boxPlotChartSeriesFactory.BoxplotChartSeries({
        chartType: 'boxplot',
        options: {
          showLabel: true
        },
        eventBus: new CustomEvents()
      });

      expect(series.supportSeriesLable).toBe(false);
    });
  });
});
