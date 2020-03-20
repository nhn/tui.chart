/**
 * @fileoverview GroupTypeEventDetector is mouse event detector for grouped tooltip.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import isNull from 'tui-code-snippet/type/isNull';

import chartConst from '../../const';
import EventDetectorBase from './mouseEventDetectorBase';
import zoomMixer from './zoomMixer';

class GroupTypeEventDetector extends EventDetectorBase {
  /**
   * GroupTypeEventDetector is mouse event detector for grouped tooltip.
   * @param {object} params parameters
   * @constructs GroupTypeEventDetector
   * @private
   * @extends EventDetectorBase
   */
  constructor(params) {
    super(params);

    /**
     * previous index of group data
     * @type {null}
     */
    this.prevIndex = null;

    /**
     * whether zoomable or not
     * @type {boolean}
     */
    this.zoomable = params.zoomable;

    /**
     * type of size
     * @type {string}
     */
    this.sizeType = this.isVertical ? 'height' : 'width';

    /**
     * Place the label between the ticks.
     * @type {boolean}
     */
    this.pointOnColumn = params.pointOnColumn;

    if (this.zoomable) {
      Object.assign(this, zoomMixer);
      this._initForZoom(params.zoomable);
    }
  }

  /**
   * Initialize data of mouse event detector
   * @param {Array.<object>} seriesInfos series infos
   * @override
   */
  initMouseEventDetectorData(seriesInfos) {
    EventDetectorBase.prototype.initMouseEventDetectorData.call(this, seriesInfos);

    if (this.zoomable) {
      this._showTooltipAfterZoom();
    }
  }

  /**
   * Find data by client position.
   * @param {number} clientX - clientX
   * @param {number} clientY - clientY
   * @returns {object}
   * @private
   */
  _findGroupData(clientX, clientY) {
    const layerPosition = this._calculateLayerPosition(clientX, clientY, true);
    let pointValue;

    if (this.isVertical) {
      pointValue = layerPosition.x;
    } else {
      pointValue = layerPosition.y;
    }

    return {
      indexes: {
        groupIndex: this.tickBaseCoordinateModel.findIndex(pointValue)
      }
    };
  }

  /**
   * Find data by client position for zoomable
   * @param {number} clientX - clientX
   * @param {number} clientY - clientY
   * @returns {object}
   * @private
   */
  _findDataForZoomable(clientX, clientY) {
    return this._findGroupData(clientX, clientY);
  }

  /**
   * Get first data.
   * @returns {{indexes: {groupIndex: number}}} - data
   * @private
   */
  _getFirstData() {
    return {
      indexes: {
        groupIndex: 0
      }
    };
  }

  /**
   * Get last data.
   * @returns {{indexes: {groupIndex: number}}} - data
   * @private
   */
  _getLastData() {
    return {
      indexes: {
        groupIndex: this.tickBaseCoordinateModel.getLastIndex()
      }
    };
  }

  /**
   * Whether outer position or not.
   * @param {number} layerX layerX
   * @param {number} layerY layerY
   * @returns {boolean} result boolean
   * @private
   */
  _isOuterPosition(layerX, layerY) {
    const { width, height } = this.dimension;
    const { top, left } = this.layout.position;

    return layerX < left || layerX > left + width || layerY < top || layerY > top + height;
  }

  /**
   * Show tooltip.
   * @param {{indexes: {groupIndex: number}, silent: boolean}} foundData - data
   * @param {boolean} [isMoving] - whether moving or not
   * @private
   */
  _showTooltip(foundData, isMoving) {
    const index = foundData.indexes.groupIndex;
    const positionValue =
      (this.isVertical ? this.layout.position.left : this.layout.position.top) -
      chartConst.CHART_PADDING;
    const tickCoordinateModel = this.tickBaseCoordinateModel.data;
    const tickCoordsModelSize = tickCoordinateModel.length;

    /**
     * Can be called with showTooltip function
     * At this time, the index may be larger than the data size.
     */
    const isValidShowTooltip = this.pointOnColumn
      ? tickCoordsModelSize - 1 > index
      : tickCoordsModelSize > index;

    if (isValidShowTooltip) {
      let tickInterval = 0;

      if (this.pointOnColumn) {
        const [{ min, max }] = tickCoordinateModel;
        tickInterval = max - min;
      }

      this.eventBus.fire('showTooltip', {
        index,
        range: this.tickBaseCoordinateModel.makeRange(index, positionValue),
        size: this.dimension[this.sizeType],
        isVertical: this.isVertical,
        isMoving,
        silent: foundData.silent,
        tickInterval
      });
      this.prevIndex = index;
    }
  }

  /**
   * Hide tooltip
   * @param {{silent: {boolean}}} [options] - options for hiding tooltip
   * @private
   */
  _hideTooltip(options) {
    this.eventBus.fire('hideTooltip', this.prevIndex, options);
    this.prevIndex = null;
  }

  /**
   * If found position data by client position, show tooltip.
   * And if not found, call onMouseout function.
   * @param {MouseEvent} e mouse event object
   * @private
   * @override
   */
  _onMousemove(e) {
    if (this.zoomable && this._isAfterDragMouseup()) {
      return;
    }

    const foundData = this._findGroupData(e.clientX, e.clientY);
    const index = foundData.indexes.groupIndex;

    if (index === -1) {
      this._onMouseout(e);
    } else if (this.prevIndex !== index) {
      this._showTooltip(foundData);
    }
  }

  /**
   * If mouse position gets out mouse event detector area, hide tooltip.
   * @override
   */
  _onMouseout(e) {
    const { x, y } = this._calculateLayerPosition(e.clientX, e.clientY, false);

    if (this._isOuterPosition(x, y) && !isNull(this.prevIndex)) {
      this._hideTooltip();
    }
  }
}

/**
 * groupTypeEventDetectorFactory
 * @param {object} params chart options
 * @returns {object} group type event detector instance
 * @ignore
 */
export default function groupTypeEventDetectorFactory(params) {
  return new GroupTypeEventDetector(params);
}

groupTypeEventDetectorFactory.componentType = 'mouseEventDetector';
