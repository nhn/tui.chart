/**
 * @fileoverview Bar chart.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import ChartBase from './chartBase';
import chartConst from '../const';
import rawDataHandler from '../models/data/rawDataHandler';
import predicate from '../helpers/predicate';

/** Class representing a point. */
class BarChart extends ChartBase {
  /**
   * Bar chart.
   * @constructs BarChart
   * @extends ChartBase
   * @mixes axisTypeMixer
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
      hasAxes: true
    });

    /**
     * className
     * @type {string}
     */
    this.className = 'tui-bar-chart';

    this._updateOptionsRelatedDiverging();
  }

  /**
   * Update options related diverging option.
   * @private
   */
  _updateOptionsRelatedDiverging() {
    const options = this.options; // eslint-disable-line

    options.series = options.series || {};
    if (options.series.diverging) {
      options.yAxis = options.yAxis || {};
      options.xAxis = options.xAxis || {};
      options.plot = options.plot || {};

      options.series.stackType = options.series.stackType || chartConst.NORMAL_STACK_TYPE;

      const isCenter = predicate.isYAxisAlignCenter(this.hasRightYAxis, options.yAxis.align);

      options.yAxis.isCenter = isCenter;
      options.xAxis.divided = isCenter;
      options.series.divided = isCenter;
      options.plot.divided = isCenter;
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

    this.componentManager.register('barSeries', 'barSeries');

    this.componentManager.register('yAxis', 'axis');
    this.componentManager.register('xAxis', 'axis');

    if (this.hasRightYAxis) {
      this.componentManager.register('rightYAxis', 'axis');
    }

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
      xAxis: true
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
        optionChartTypes: ['bar', 'bar']
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

export default BarChart;
