/**
 * @fileoverview Bullet chart.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import ChartBase from './chartBase';
import rawDataHandler from '../models/data/rawDataHandler';

/** Class representing a point. */
class BulletChart extends ChartBase {
  /**
   * Bullet chart.
   * @constructs BulletChart
   * @extends ChartBase
   * @mixes axisTypeMixer
   * @param {Array.<Array>} rawData raw data
   * @param {object} theme chart theme
   * @param {object} options chart options
   */
  constructor(rawData, theme, options) {
    rawDataHandler._makeRawSeriesDataForBulletChart(rawData);

    super({
      rawData,
      theme,
      options,
      hasAxes: true,
      isVertical: !!options.series.vertical
    });

    /**
     * className
     * @type {string}
     */
    this.className = 'tui-bullet-chart';
  }

  /**
   * Add components
   * @override
   */
  addComponents() {
    this.componentManager.register('title', 'title');
    this.componentManager.register('plot', 'plot');
    this.componentManager.register('legend', 'legend');

    this.componentManager.register('bulletSeries', 'bulletSeries');

    this.componentManager.register('yAxis', 'axis');
    this.componentManager.register('xAxis', 'axis');

    this.componentManager.register('chartExportMenu', 'chartExportMenu', { chartType: 'bullet' });
    this.componentManager.register('tooltip', 'tooltip');
    this.componentManager.register('mouseEventDetector', 'mouseEventDetector');
  }

  /**
   * Get scale option.
   * @returns {{xAxis: boolean}}
   * @override
   */
  getScaleOption() {
    if (this.isVertical) {
      return {
        yAxis: true
      };
    }

    return {
      xAxis: true
    };
  }

  /**
   * Add data ratios.
   * modified from axisTypeMixer
   * @override
   */
  addDataRatios(limitMap) {
    this.dataProcessor.addDataRatios(limitMap[this.chartType], null, this.chartType);
  }
}

export default BulletChart;
