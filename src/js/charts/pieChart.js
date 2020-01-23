/**
 * @fileoverview Pie chart.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import ChartBase from './chartBase';
import chartConst from '../const';

/** Class representing a point. */
class PieChart extends ChartBase {
  /**
   * Pie chart.
   * @constructs PieChart
   * @extends ChartBase
   * @param {Array.<Array>} rawData raw data
   * @param {object} theme chart theme
   * @param {object} options chart options
   */
  constructor(rawData, theme, options) {
    options.tooltip = options.tooltip || {};

    if (!options.tooltip.align) {
      options.tooltip.align = chartConst.TOOLTIP_DEFAULT_ALIGN_OPTION;
    }

    super({
      rawData,
      theme,
      options
    });

    /**
     * className
     * @type {string}
     */
    this.className = 'tui-pie-chart';
  }

  /**
   * Add components
   * @override
   */
  addComponents() {
    this.componentManager.register('title', 'title');
    this.componentManager.register('legend', 'legend');

    this.componentManager.register('pieSeries', 'pieSeries');

    this.componentManager.register('chartExportMenu', 'chartExportMenu');
    this.componentManager.register('tooltip', 'tooltip');
    this.componentManager.register('mouseEventDetector', 'mouseEventDetector');
  }

  /**
   * Add data ratios.
   * @override
   */
  addDataRatios() {
    this.dataProcessor.addDataRatiosOfPieChart(this.chartType);
  }
}

export default PieChart;
