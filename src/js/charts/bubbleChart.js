/**
 * @fileoverview Bubble chart.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import ChartBase from './chartBase';
import chartConst from '../const';
import snippet from 'tui-code-snippet';

/** Class representing a point. */
class BubbleChart extends ChartBase {
  /**
   * Bubble chart.
   * @constructs BubbleChart
   * @extends ChartBase
   * @mixes axisTypeMixer
   * @param {Array.<Array>} rawData raw data
   * @param {object} theme chart theme
   * @param {object} options chart options
   */
  constructor(rawData, theme, options) {
    options = Object.assign(
      {
        tooltip: {},
        circleLegend: {}
      },
      options
    );

    options.circleLegend = Object.assign(
      {
        visible: true
      },
      options.circleLegend
    );

    options.tooltip = Object.assign(
      {
        align: chartConst.TOOLTIP_DEFAULT_ALIGN_OPTION,
        grouped: false
      },
      options.tooltip
    );

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
    this.className = 'tui-bubble-chart';
  }

  /**
   * Get scale option.
   * @returns {{xAxis: ?{valueType:string}, yAxis: ?{valueType:string}}}
   * @override
   */
  getScaleOption() {
    const scaleOption = {};

    if (this.dataProcessor.hasXValue(this.chartType)) {
      scaleOption.xAxis = {
        valueType: 'x'
      };
    }
    if (this.dataProcessor.hasYValue(this.chartType)) {
      scaleOption.yAxis = {
        valueType: 'y'
      };
    }

    return scaleOption;
  }

  /**
   * Set default options.
   * @param {object} options - options for bubble chart
   * @private
   * @override
   */
  _setDefaultOptions(options) {
    ChartBase.prototype._setDefaultOptions.call(this, options);
    this.options.circleLegend = this.options.circleLegend || {};

    if (snippet.isUndefined(this.options.circleLegend.visible)) {
      this.options.circleLegend.visible = true;
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
    this.componentManager.register('circleLegend', 'circleLegend');

    this.componentManager.register('bubbleSeries', 'bubbleSeries');

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
    this.dataProcessor.addDataRatiosForCoordinateType(this.chartType, limitMap, true);
  }
}

export default BubbleChart;
