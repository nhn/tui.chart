/**
 * @fileoverview AreaTypeEventDetector is mouse event detector for line type chart.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import MouseEventDetectorBase from './mouseEventDetectorBase';
import zoomMixer from './zoomMixer';
import AreaTypeDataModel from './areaTypeDataModel';
import snippet from 'tui-code-snippet';

class AreaTypeEventDetector extends MouseEventDetectorBase {
  /**
   * AreaTypeEventDetector is mouse event detector for line type chart.
   * @param {object} params parameters
   * @constructs AreaTypeEventDetector
   * @private
   * @extends MouseEventDetectorBase
   */
  constructor(params) {
    super(params);

    /**
     * previous found data
     * @type {null | object}
     */
    this.prevFoundData = null;

    /**
     * previous client position of mouse event (clientX, clientY)
     * @type {null | object}
     */
    this.prevClientPosition = null;

    /**
     * whether zoomable or not
     * @type {boolean}
     */
    this.zoomable = params.zoomable;

    if (this.zoomable) {
      snippet.extend(this, zoomMixer);
      this._initForZoom(params.zoomable);
    }
  }

  /**
   * Animate for adding data.
   */
  animateForAddingData() {
    if (!this.prevClientPosition) {
      return;
    }

    const foundData = this._findData(this.prevClientPosition.x, this.prevClientPosition.y);

    if (foundData) {
      const isMatchedIndex = this.prevFoundData.indexes.groupIndex === foundData.indexes.groupIndex;
      const isMoving = this.prevFoundData && isMatchedIndex;
      this._showTooltip(foundData, isMoving);
    }

    this.prevFoundData = foundData;
  }

  /**
   * Create areaTypeDataModel from seriesItemBoundsData for mouse event detector.
   * @param {Array.<object>} seriesItemBoundsDatum - series item bounds datum
   * @override
   */
  onReceiveSeriesData(seriesItemBoundsDatum) {
    const { seriesCount } = this;
    let { seriesItemBoundsData } = this;

    if (seriesItemBoundsData.length === seriesCount) {
      seriesItemBoundsData = [];
    }

    seriesItemBoundsData.push(seriesItemBoundsDatum);

    if (seriesItemBoundsData.length === seriesCount) {
      this.dataModel = new AreaTypeDataModel(seriesItemBoundsData);
    }

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
   * @override
   */
  _findData(clientX, clientY) {
    const layerPosition = this._calculateLayerPosition(clientX, clientY);
    const { selectLegendIndex } = this.dataProcessor;
    const isCoordinateTypeChart = this.dataProcessor.isCoordinateType();

    return this.dataModel.findData(layerPosition, selectLegendIndex, {
      distanceLimit: this.dataModel.leftStepLength,
      isCoordinateTypeChart
    });
  }

  /**
   * Find data by client position for zoomable
   * @param {number} clientX - clientX
   * @param {number} clientY - clientY
   * @returns {object}
   * @private
   */
  _findDataForZoomable(clientX, clientY) {
    const layerPosition = this._calculateLayerPosition(clientX, clientY);

    return this.dataModel.findData(layerPosition);
  }

  /**
   * Get first model data.
   * @param {number} index - index
   * @returns {object}
   * @private
   */
  _getFirstData(index) {
    return this.dataModel.getFirstData(index);
  }

  /**
   * Get last model data.
   * @param {number} index - index
   * @returns {object}
   * @private
   */
  _getLastData(index) {
    return this.dataModel.getLastData(index);
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
   * @param {{silent: {boolean}}} [options] - options for hiding tooltip
   * @private
   */
  _hideTooltip(options) {
    this.eventBus.fire('hideTooltip', this.prevFoundData, options);
    this.prevFoundData = null;
  }

  /**
   * On mousemove.
   * @param {MouseEvent} e - mouse event
   * @private
   * @override
   */
  _onMousemove(e) {
    let dragMouseupResult;

    this._setPrevClientPosition(e);
    const foundData = this._findData(e.clientX, e.clientY);

    if (this.zoomable) {
      dragMouseupResult = this._isAfterDragMouseup();
    }

    if (dragMouseupResult || !this._isChangedSelectData(this.prevFoundData, foundData)) {
      return;
    }

    if (foundData) {
      this._showTooltip(foundData);
    } else if (this.prevFoundData) {
      this._hideTooltip();
    }

    this.prevFoundData = foundData;
  }

  /**
   * On mouseout.
   * @private
   * @override
   */
  _onMouseout() {
    if (this.prevFoundData) {
      this._hideTooltip();
    }

    this.prevClientPosition = null;
    this.prevFoundData = null;
  }

  /**
   * find data by indexes
   * @param {{index: {number}, seriesIndex: {number}}} indexes - index of series item displaying a tooltip
   * @returns {object} - series item data
   */
  findDataByIndexes(indexes) {
    return this.dataModel.findDataByIndexes(indexes);
  }

  /**
   * Set prevClientPosition by MouseEvent
   * @param {?MouseEvent} event - mouse event
   * @private
   */
  _setPrevClientPosition(event) {
    if (!event) {
      this.prevClientPosition = null;
    } else {
      this.prevClientPosition = {
        x: event.clientX,
        y: event.clientY
      };
    }
  }
}

/**
 * areaTypeEventDetectorFactory
 * @param {object} params chart options
 * @returns {object} area type event detector instance
 * @ignore
 */
export default function areaTypeEventDetectorFactory(params) {
  return new AreaTypeEventDetector(params);
}

areaTypeEventDetectorFactory.componentType = 'mouseEventDetector';
