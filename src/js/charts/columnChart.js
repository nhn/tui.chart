/**
 * @fileoverview Column chart.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import ChartBase from './chartBase';
import chartConst from '../const';
import rawDataHandler from '../models/data/rawDataHandler';

/** Class representing a point. */
class ColumnChart extends ChartBase {
  /**
   * Column chart.
   * @constructs ColumnChart
   * @extends ChartBase
   * @mixes axisTypeMixer
   * @mixes verticalTypeMixer
   * @param {Array.<Array>} rawData raw data
   * @param {object} theme chart theme
   * @param {object} options chart options
   */
  constructor(rawData, theme, options) {
    rawDataHandler.updateRawSeriesDataByOptions(rawData, options.series);
    super({
      rawData,
      theme,
      options,
      hasAxes: true,
      isVertical: true
    });

    this._updateOptionsRelatedDiverging(options);

    /**
     * className
     * @type {string}
     */
    this.className = 'tui-column-chart';
  }

  /**
   * Update options related diverging option.
   * @param {object} options - options
   * @private
   */
  _updateOptionsRelatedDiverging(options) {
    options.series = options.series || {};

    if (options.series.diverging) {
      options.series.stackType = options.series.stackType || chartConst.NORMAL_STACK_TYPE;
    }
  }

  /**
   * Add components
   * @override
   */
  addComponents() {
    this.componentManager.register('title', 'title');
    this.componentManager.register('plot', 'plot');
    this.componentManager.register('legend', 'legend');

    this.componentManager.register('columnSeries', 'columnSeries');

    this.componentManager.register('yAxis', 'axis');
    this.componentManager.register('xAxis', 'axis');

    this.componentManager.register('chartExportMenu', 'chartExportMenu');
    this.componentManager.register('tooltip', 'tooltip');
    this.componentManager.register('mouseEventDetector', 'mouseEventDetector');
  }

  /**
   * Get scale option.
   * @returns {{yAxis: boolean}}
   * @override
   */
  getScaleOption() {
    return {
      yAxis: true
    };
  }

  /**
   * Add data ratios.
   * modified from axisTypeMixer
   * @override
   */
  addDataRatios(limitMap) {
    const { series: seriesOption = {} } = this.options;
    const { chartType } = this;
    const { stackType } = seriesOption[chartType] || seriesOption;

    this.dataProcessor.addDataRatios(limitMap[chartType], stackType, chartType);
  }
}

export default ColumnChart;
