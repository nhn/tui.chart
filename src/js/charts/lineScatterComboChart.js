/**
 * @fileoverview Line and Scatter Combo chart.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import ChartBase from './chartBase';
import snippet from 'tui-code-snippet';

/** Class representing a point. */
class LineScatterComboChart extends ChartBase {
  /**
   * Line and Scatter Combo chart.
   * @constructs LineScatterComboChart
   * @extends ChartBase
   * @param {Array.<Array>} rawData - raw data
   * @param {object} theme - chart theme
   * @param {object} options - chart options
   */
  constructor(rawData, theme, options) {
    super({
      rawData,
      theme,
      options,
      chartTypes: ['line', 'scatter'],
      seriesTypes: ['line', 'scatter'],
      hasAxes: true,
      isVertical: true
    });
  }

  /**
   * Get scale option.
   * @returns {{
   *      yAxis: {valueType: string, additionalOptions: {isSingleYAxis: boolean}},
   *      xAxis: {valueType: string}
   * }}
   * @override
   */
  getScaleOption() {
    return {
      yAxis: {
        valueType: 'y'
      },
      xAxis: {
        valueType: 'x'
      }
    };
  }

  /**
   * Add data ratios.
   * @override
   * from axisTypeMixer
   */
  addDataRatios(limitMap) {
    const chartTypes = this.chartTypes || [this.chartType];

    const addDataRatio = chartType => {
      this.dataProcessor.addDataRatiosForCoordinateType(chartType, limitMap, false);
    };

    snippet.forEachArray(chartTypes, addDataRatio);
  }

  /**
   * Add components
   * @override
   */
  addComponents() {
    this.componentManager.register('title', 'title');
    this.componentManager.register('plot', 'plot');
    this.componentManager.register('legend', 'legend');

    this.componentManager.register('lineSeries', 'lineSeries');
    this.componentManager.register('scatterSeries', 'scatterSeries');

    this.componentManager.register('yAxis', 'axis');
    this.componentManager.register('xAxis', 'axis');

    this.componentManager.register('chartExportMenu', 'chartExportMenu');
    this.componentManager.register('tooltip', 'tooltip');
    this.componentManager.register('mouseEventDetector', 'mouseEventDetector');
  }
}

export default LineScatterComboChart;
