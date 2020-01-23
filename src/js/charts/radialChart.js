/**
 * @fileoverview Radial chart.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import ChartBase from './chartBase';
import Series from '../components/series/lineChartSeries';

/** Class representing a point. */
class RadialChart extends ChartBase {
  /**
   * Radial chart.
   * @constructs RadialChart
   * @extends ChartBase
   * @param {Array.<Array>} rawData raw data
   * @param {object} theme chart theme
   * @param {object} options chart options
   */
  constructor(rawData, theme, options) {
    // radial chart doesn't supprot group tooltip
    // should delete this code, when it supports group tooltip
    if (options.tooltip) {
      options.tooltip.grouped = false;
    }

    super({ rawData, theme, options, hasAxes: true, isVertical: true });

    /**
     * className
     * @type {string}
     */
    this.className = 'tui-radial-chart';

    /**
     * Series class
     * @type {function}
     * @ignore
     */
    this.Series = Series;
  }

  /**
   * Add components
   * @override
   */
  addComponents() {
    this.componentManager.register('title', 'title');
    this.componentManager.register('legend', 'legend');
    this.componentManager.register('plot', 'radialPlot');

    this.componentManager.register('radialSeries', 'radialSeries');

    this.componentManager.register('chartExportMenu', 'chartExportMenu');
    this.componentManager.register('tooltip', 'tooltip');
    this.componentManager.register('mouseEventDetector', 'mouseEventDetector');
  }

  /**
   * Add data ratios.
   * @override
   */
  addDataRatios(limitMap) {
    this.dataProcessor.addDataRatios(limitMap[this.chartType], null, this.chartType);
  }

  /**
   * Get scale option.
   * @returns {{xAxis: ?{valueType:string}, yAxis: ?(boolean|{valueType:string})}}
   * @override
   */
  getScaleOption() {
    return {
      yAxis: {}
    };
  }
}

export default RadialChart;
