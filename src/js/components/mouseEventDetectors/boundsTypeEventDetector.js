/**
 * @fileoverview BoundsTypeEventDetector is mouse event detector for bounds type charts
 *                                                                              like bar, column, heatmap, treemap.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import EventDetectorBase from './mouseEventDetectorBase';
import chartConst from '../../const';
import predicate from '../../helpers/predicate';
import dom from '../../helpers/domHandler';

class BoundsTypeEventDetector extends EventDetectorBase {
  /**
   * BoundsTypeEventDetector is mouse event detector for bounds type charts like bar, column, heatmap, treemap.
   * @constructs BoundsTypeEventDetector
   * @private
   * @extends EventDetectorBase
   */
  constructor(...args) {
    super(...args);

    /**
     * previous found data
     * @type {null | object}
     */
    this.prevFoundData = null;

    /**
     * history array for treemap chart.
     * @type {array}
     */
    this.zoomHistory = [-1];

    /**
     * button for zoom history back
     * @type {null | HTMLElement}
     */
    this.historyBackBtn = null;
  }

  /**
   * Attach to event bus.
   * @private
   * @override
   */
  _attachToEventBus() {
    EventDetectorBase.prototype._attachToEventBus.call(this);

    this.eventBus.on('afterZoom', this.onAfterZoom, this);
  }

  /**
   * Show tooltip.
   * @param {object} foundData - model data
   * @private
   */
  _showTooltip(foundData) {
    this.eventBus.fire('showTooltip', foundData);
    this.prevFoundData = foundData;
  }

  /**
   * Hide tooltip.
   * @param {{silent: {boolean}}} [options] - options for hiding a tooltip
   * @private
   */
  _hideTooltip(options) {
    this.eventBus.fire('hideTooltip', this.prevFoundData, options);
    this.prevFoundData = null;
    this.styleCursor(false);
  }

  /**
   * Style css cursor.
   * @param {boolean} hasChild - whether has child or not
   */
  styleCursor(hasChild) {
    const container = this.mouseEventDetectorContainer;
    if (hasChild) {
      container.style.cursor = 'pointer';
    } else {
      container.style.cursor = 'default';
    }
  }

  /**
   * On mousemove.
   * @param {MouseEvent} e - mouse event
   * @private
   * @override
   */
  _onMousemove({ clientX, clientY }) {
    const layerPosition = this._calculateLayerPosition(clientX, clientY);
    const foundData = this._findDataFromBoundsCoordinateModel(layerPosition);

    if (!this._isChangedSelectData(this.prevFoundData, foundData)) {
      return;
    }

    if (this.prevFoundData) {
      this._hideTooltip();
    }

    this.prevFoundData = foundData;

    if (!foundData) {
      return;
    }

    if (predicate.isTreemapChart(this.chartType)) {
      const seriesItem = this._getSeriesItemByIndexes(foundData.indexes);
      this.styleCursor(seriesItem.hasChild);
    } else if (predicate.isBulletChart(this.chartType)) {
      foundData.mousePosition = {
        left: clientX,
        top: clientY
      };
    }
    this._showTooltip(foundData);
  }

  /**
   * Zoom history back.
   * @private
   */
  _zoomHistoryBack() {
    const index = this.zoomHistory[this.zoomHistory.length - 2];

    this.zoomHistory.pop();
    this.eventBus.fire('zoom', index);

    if (this.zoomHistory.length === 1) {
      this.mouseEventDetectorContainer.removeChild(this.historyBackBtn);
      this.historyBackBtn = null;
    }
  }

  /**
   * Get seriesItem by indexes
   * @param {{groupIndex: number, index: number}} indexes - indexes
   * @returns {SeriesItem}
   * @private
   */
  _getSeriesItemByIndexes(indexes) {
    const seriesDataModel = this.dataProcessor.getSeriesDataModel(chartConst.CHART_TYPE_TREEMAP);

    return seriesDataModel.getSeriesItem(indexes.groupIndex, indexes.index, true);
  }

  /**
   * On mousemove.
   * @param {MouseEvent} e - mouse event
   * @private
   * @override
   */
  _onClick(e) {
    const target = e.target || e.srcElement;

    EventDetectorBase.prototype._onClick.call(this, e);

    if (!predicate.isTreemapChart(this.chartType)) {
      return;
    }

    if (dom.hasClass(target, chartConst.CLASS_NAME_RESET_ZOOM_BTN)) {
      this._hideTooltip();
      this._zoomHistoryBack();

      return;
    }

    const layerPosition = this._calculateLayerPosition(e.clientX, e.clientY);
    const foundData = this._findDataFromBoundsCoordinateModel(layerPosition);

    if (foundData) {
      const seriesItem = this._getSeriesItemByIndexes(foundData.indexes);

      if (!seriesItem.hasChild) {
        return;
      }

      this._hideTooltip();
      this.eventBus.fire('zoom', foundData.indexes.index);
    }
  }

  /**
   * On mouseout.
   * @override
   */
  _onMouseout({ clientX, clientY }) {
    // do not cache getBoundingClientRect() - if not, it will cause error when chart location changed
    const bound = this.mouseEventDetectorContainer.getBoundingClientRect();
    const { left, right, top, bottom } = bound;

    if (left <= clientX && top <= clientY && right >= clientX && bottom >= clientY) {
      return;
    }

    if (this.prevFoundData) {
      this._hideTooltip();
    }

    this.prevFoundData = null;
  }

  /**
   * On after zoom.
   * @param {number} index - index of target seriesItem
   */
  onAfterZoom(index) {
    if (!this.historyBackBtn) {
      this.historyBackBtn = dom.create('DIV', chartConst.CLASS_NAME_RESET_ZOOM_BTN);
      dom.append(this.mouseEventDetectorContainer, this.historyBackBtn);
    }

    if (this.zoomHistory[this.zoomHistory.length - 1] !== index) {
      this.zoomHistory.push(index);
    }
  }

  /**
   * Find data by indexes.
   * @param {{index: {number}, seriesIndex: {number}}} indexes - indexe of series item displaying a tooltip
   * @param {number} [indexes.outlierIndex] - index of outlier of boxplot series, it only exists in boxplot chart
   * @returns {object} - series item data
   */
  findDataByIndexes(indexes) {
    return this.boundsBaseCoordinateModel.findDataByIndexes(indexes);
  }
}

/**
 * boundsTypeEventDetectorFactory
 * @param {object} params chart options
 * @returns {object} event detect instance
 * @ignore
 */
export default function boundsTypeEventDetectorFactory(params) {
  return new BoundsTypeEventDetector(params);
}

boundsTypeEventDetectorFactory.componentType = 'mouseEventDetector';
