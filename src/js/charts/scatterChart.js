/**
 * @fileoverview Scatter chart is a type of plot or mathematical diagram using Cartesian coordinates
 *                  to display values for typically two variables for a set of data.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import ChartBase from './chartBase';
import chartConst from '../const';

/** Class representing a point. */
class ScatterChart extends ChartBase {
  /**
   * Scatter chart is a type of plot or mathematical diagram using Cartesian coordinates
   *  to display values for typically two variables for a set of data.
   * @constructs ScatterChart
   * @extends ChartBase
   * @mixes axisTypeMixer
   * @param {Array.<Array>} rawData raw data
   * @param {object} theme chart theme
   * @param {object} options chart options
   */
  constructor(rawData, theme, options) {
    options.tooltip = options.tooltip || {};

    if (!options.tooltip.align) {
      options.tooltip.align = chartConst.TOOLTIP_DEFAULT_ALIGN_OPTION;
    }

    options.tooltip.grouped = false;

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
    this.className = 'tui-scatter-chart';
  }

  /**
   * Get scale option.
   * @returns {{xAxis: {valueType: string}, yAxis: {valueType: string}}}
   * @override
   */
  getScaleOption() {
    return {
      xAxis: {
        valueType: 'x'
      },
      yAxis: {
        valueType: 'y'
      }
    };
  }

  /**
   * Add components
   * @override
   */
  addComponents() {
    this.componentManager.register('title', 'title');
    this.componentManager.register('plot', 'plot');
    this.componentManager.register('legend', 'legend');

    this.componentManager.register('scatterSeries', 'scatterSeries');

    this.componentManager.register('yAxis', 'axis');
    this.componentManager.register('xAxis', 'axis');

    this.componentManager.register('chartExportMenu', 'chartExportMenu');
    this.componentManager.register('tooltip', 'tooltip');
    this.componentManager.register('mouseEventDetector', 'mouseEventDetector');
  }

  /**
   * Add data ratios.
   * @override
   */
  addDataRatios(limitMap) {
    this.dataProcessor.addDataRatiosForCoordinateType(this.chartType, limitMap, false);
  }
}

export default ScatterChart;
