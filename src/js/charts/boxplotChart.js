/**
 * @fileoverview Boxplot chart.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import ChartBase from './chartBase';
import rawDataHandler from '../models/data/rawDataHandler';

/** Class representing a point. */
class BoxplotChart extends ChartBase {
  /**
   * Boxplot chart.
   * @constructs BoxplotChart
   * @extends ChartBase
   * @mixes axisTypeMixer
   * @param {Array.<Array>} rawData raw data
   * @param {object} theme chart theme
   * @param {object} options chart options
   */
  constructor(rawData, theme, options) {
    rawDataHandler.appendOutliersToSeriesData(rawData);

    super({
      rawData,
      theme,
      options,
      hasAxes: true,
      isVertical: true
    });

    /**
     * className
     * @type {string}
     */
    this.className = 'tui-boxplot-chart';
  }

  /**
   * Add components
   * @override
   */
  addComponents() {
    this.componentManager.register('title', 'title');
    this.componentManager.register('plot', 'plot');
    this.componentManager.register('legend', 'legend');

    this.componentManager.register('boxplotSeries', 'boxplotSeries');

    this.componentManager.register('yAxis', 'axis');
    this.componentManager.register('xAxis', 'axis');

    this.componentManager.register('chartExportMenu', 'chartExportMenu');
    this.componentManager.register('tooltip', 'tooltip');
    this.componentManager.register('mouseEventDetector', 'mouseEventDetector');
  }

  /**
   * Get scale option.
   * @returns {{xAxis: boolean}}
   * @override
   */
  getScaleOption() {
    return {
      yAxis: true
    };
  }

  /**
   * On change selected legend.
   * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
   * @ignore
   */
  onChangeCheckedLegends(checkedLegends) {
    let boundParams;

    if (this.hasRightYAxis) {
      boundParams = {
        optionChartTypes: ['boxplot', 'boxplot']
      };
    }
    ChartBase.prototype.onChangeCheckedLegends.call(this, checkedLegends, null, boundParams);
  }

  /**
   * Add data ratios.
   * modified from axisTypeMixer
   * @override
   */
  addDataRatios(limitMap) {
    const {
      options: { series: seriesOption = {} },
      chartType
    } = this;
    const { stackType } = seriesOption[chartType] || seriesOption;

    this.dataProcessor.addDataRatios(limitMap[chartType], stackType, chartType);
  }
}

export default BoxplotChart;
