/**
 * @fileoverview Line chart series component.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import Series from './series';
import LineTypeSeriesBase from './lineTypeSeriesBase';

class LineChartSeries extends Series {
  /**
   * Line chart series component.
   * @constructs LineChartSeries
   * @private
   * @extends Series
   * @mixes LineTypeSeriesBase
   * @param {object} params parameters
   *      @param {object} params.model series model
   *      @param {object} params.options series options
   *      @param {object} params.theme series theme
   */
  constructor(...args) {
    super(...args);

    /**
     * object for requestAnimationFrame
     * @type {null | {id: number}}
     */
    this.movingAnimation = null;
  }

  /**
   * Make positions for rendering graph and sending to mouse event detector.
   * @param {number} [seriesWidth] - series width
   * @returns {Array.<Array.<{left: number, top: number}>>} positions
   * @private
   */
  _makePositions(seriesWidth) {
    return this._makeBasicPositions(seriesWidth);
  }

  /**
   * Make series data for rendering graph and sending to mouse event detector.
   * @returns {object} series data
   * @private
   * @override
   */
  _makeSeriesData() {
    const groupPositions = this._makePositions();

    return {
      chartBackground: this.chartBackground,
      groupPositions,
      isAvailable: () => groupPositions && groupPositions.length > 0
    };
  }

  /**
   * Rerender.
   * @param {object} data - data for re-rendering
   * @override
   */
  rerender(data) {
    this._cancelMovingAnimation();

    return Series.prototype.rerender.call(this, data);
  }
}

LineTypeSeriesBase.mixin(LineChartSeries);

/**
 * lineSeriesFactory
 * @param {object} params chart options
 * @returns {object} linechart series instance
 * @ignore
 */
export default function lineSeriesFactory(params) {
  params.libType = params.chartOptions.libType;
  params.chartType = 'line';
  params.chartBackground = params.chartTheme.chart.background;

  return new LineChartSeries(params);
}

lineSeriesFactory.componentType = 'series';
