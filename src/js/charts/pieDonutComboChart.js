/**
 * @fileoverview Pie and Donut Combo chart.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import ChartBase from './chartBase';
import rawDataHandler from '../models/data/rawDataHandler';
import snippet from 'tui-code-snippet';

/** Class representing a point. */
class PieDonutComboChart extends ChartBase {
  /**
   * Pie and Donut Combo chart.
   * @constructs PieDonutComboChart
   * @extends ChartBase
   * @param {Array.<Array>} rawData raw data
   * @param {object} theme chart theme
   * @param {object} options chart options
   */
  constructor(rawData, theme, options) {
    super({
      rawData,
      theme,
      options,
      seriesTypes: snippet.keys(rawData.series).sort(),
      chartTypes: ['pie', 'pie'],
      isVertical: true
    });

    /**
     * className
     * @type {string}
     */
    this.className = 'tui-combo-chart';
  }

  /**
   * Add components
   * @override
   */
  addComponents() {
    this.componentManager.register('title', 'title');
    this.componentManager.register('legend', 'legend');

    this.componentManager.register('pie1Series', 'pieSeries');
    this.componentManager.register('pie2Series', 'pieSeries');

    this.componentManager.register('chartExportMenu', 'chartExportMenu');
    this.componentManager.register('tooltip', 'tooltip');
    this.componentManager.register('mouseEventDetector', 'mouseEventDetector');
  }

  /**
   * Add data ratios.
   * @override
   */
  addDataRatios() {
    const seriesTypes = this.seriesTypes || [this.chartType];

    seriesTypes.forEach(chartType => {
      this.dataProcessor.addDataRatiosOfPieChart(chartType);
    });
  }

  /**
   * On change selected legend.
   * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
   * @override
   */
  onChangeCheckedLegends(checkedLegends) {
    const originalRawData = this.dataProcessor.getOriginalRawData();
    const rawData = rawDataHandler.filterCheckedRawData(originalRawData, checkedLegends);

    ChartBase.prototype.onChangeCheckedLegends.call(this, checkedLegends, rawData, {
      seriesTypes: this.seriesTypes
    });
  }
}

export default PieDonutComboChart;
