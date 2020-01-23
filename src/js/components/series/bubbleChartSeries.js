/**
 * @fileoverview Bubble chart series component.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import chartConst from '../../const';
import Series from './series';
import CoordinateTypeSeriesBase from './coordinateTypeSeriesBase';
import snippet from 'tui-code-snippet';

class BubbleChartSeries extends Series {
  /**
   * Bubble chart series component.
   * @constructs BubbleChartSeries
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

    /**
     * max radius for rendering circle graph
     * @type {null|number}
     */
    this.maxRadius = null;

    this.drawingType = chartConst.COMPONENT_TYPE_RAPHAEL;
  }

  /**
   * Calculate step value for label axis.
   * @returns {number}
   * @private
   */
  _calculateStep() {
    const hasVerticalCategory = this.dataProcessor.isXCountGreaterThanYCount(this.chartType);
    let step = 0;

    if (this.dataProcessor.hasCategories(hasVerticalCategory)) {
      const { dimension } = this.layout;
      const len = this.dataProcessor.getCategoryCount(hasVerticalCategory);
      let size;

      if (hasVerticalCategory) {
        size = dimension.height;
      } else {
        size = dimension.width;
      }

      step = size / len;
    }

    return step;
  }

  /**
   * Make bound for bubble chart.
   * @param {{x: number, y: number, r: number}} ratioMap - ratio map
   * @param {number} positionByStep - position value by step
   * @param {number} maxRadius - max radius
   * @returns {{left: number, top: number, radius: number}}
   * @private
   */
  _makeBound(ratioMap, positionByStep, maxRadius) {
    const {
      dimension: { width, height },
      position
    } = this.layout;
    const left = snippet.isExisty(ratioMap.x) ? ratioMap.x * width : positionByStep;
    const top = snippet.isExisty(ratioMap.y) ? ratioMap.y * height : positionByStep;

    return {
      left: position.left + left,
      top: position.top + height - top,
      radius: Math.max(maxRadius * ratioMap.r, 2)
    };
  }

  /**
   * Make bounds for bubble chart.
   * @returns {Array.<Array.<{left: number, top: number, radius: number}>>} positions
   * @private
   */
  _makeBounds() {
    const seriesDataModel = this._getSeriesDataModel();
    const { maxRadius } = this;
    const step = this._calculateStep();
    const start = step ? step / 2 : 0;

    return seriesDataModel.map((seriesGroup, index) => {
      const positionByStep = start + step * index;

      return seriesGroup.map(seriesItem => {
        const hasRationMap = seriesItem && seriesItem.ratioMap;

        return hasRationMap
          ? this._makeBound(seriesItem.ratioMap, positionByStep, maxRadius)
          : null;
      });
    });
  }

  /**
   * Set data for rendering.
   * @param {{
   *      paper: ?object,
   *      limit: {
   *          min: number,
   *          max: number
   *      },
   *      aligned: boolean,
   *      layout: {
   *          dimension: {width: number, height: number},
   *          position: {left: number, top: number}
   *      },
   *      dimensionMap: object,
   *      positionMap: object,
   *      axisDataMap: object,
   *      maxRadius: number
   * }} data - data for rendering
   * @private
   */
  _setDataForRendering(data) {
    this.maxRadius = data.maxRadius;
    Series.prototype._setDataForRendering.call(this, data);
  }
}

CoordinateTypeSeriesBase.mixin(BubbleChartSeries);

/**
 * bubbleSeriesFactory
 * @param {object} params chart options
 * @returns {object} bubble series instance
 * @ignore
 */
export default function bubbleSeriesFactory(params) {
  const {
    chartOptions: { libType },
    chartTheme
  } = params;

  params.libType = libType;
  params.chartType = 'bubble';
  params.chartBackground = chartTheme.chart.background;

  return new BubbleChartSeries(params);
}

bubbleSeriesFactory.componentType = 'series';
bubbleSeriesFactory.BubbleChartSeries = BubbleChartSeries;
