/**
 * @fileoverview Scatter chart series component.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import Series from './series';
import CoordinateTypeSeriesBase from './coordinateTypeSeriesBase';
import chartConst from '../../const';

class ScatterChartSeries extends Series {
  /**
   * Scatter chart series component.
   * @constructs ScatterChartSeries
   * @private
   * @extends Series
   */
  constructor(...args) {
    super(...args);
    /**
     * previous clicked index.
     * @type {?number}
     */
    this.prevClickedIndex = null;
  }

  /**
   * Make bound for scatter chart.
   * @param {{x: number, y: number, r: number}} ratioMap - ratio map
   * @returns {{left: number, top: number, radius: number}}
   * @private
   */
  _makeBound(ratioMap) {
    const { dimension, position: basePosition } = this.layout;

    return {
      left: basePosition.left + ratioMap.x * dimension.width,
      top: dimension.height - ratioMap.y * dimension.height + basePosition.top,
      radius: chartConst.SCATTER_RADIUS
    };
  }

  /**
   * Make bounds for scatter chart.
   * @returns {Array.<Array.<{left: number, top: number, radius: number}>>} positions
   * @private
   */
  _makeBounds() {
    const seriesDataModel = this._getSeriesDataModel();

    return seriesDataModel.map(seriesGroup =>
      seriesGroup.map(seriesItem => {
        const hasRatioMap = seriesItem && seriesItem.ratioMap;

        return hasRatioMap ? this._makeBound(seriesItem.ratioMap) : null;
      })
    );
  }
}

CoordinateTypeSeriesBase.mixin(ScatterChartSeries);

/**
 * scatterSeriesFactory
 * @param {object} params chart options
 * @returns {object} scatter series instance
 * @ignore
 */
export default function scatterSeriesFactory(params) {
  params.libType = params.chartOptions.libType;
  params.chartType = 'scatter';
  params.chartBackground = params.chartTheme.chart.background;

  return new ScatterChartSeries(params);
}

scatterSeriesFactory.componentType = 'series';
scatterSeriesFactory.ScatterChartSeries = ScatterChartSeries;
