/**
 * @fileoverview  Mixer for zoom event of area type mouse event detector.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import MouseEventDetectorBase from './mouseEventDetectorBase';
import chartConst from '../../const';
import dom from '../../helpers/domHandler';
import predicate from '../../helpers/predicate';
import arrayUtil from '../../helpers/arrayUtil';
import renderUtil from '../../helpers/renderUtil';
import eventListener from '../../helpers/eventListener';
import snippet from 'tui-code-snippet';

/**
 * Mixer for zoom event of area type mouse event detector.
 * @mixin
 * @private */
export default {
  /**
   * Initialize for zoom.
   * @param {boolean} zoomable - whether zoomable or not
   * @private
   */
  _initForZoom(zoomable) {
    /**
     * whether zoomable or not
     * @type {boolean}
     */
    this.zoomable = zoomable;

    /**
     * drag start index.
     * @type {null | object}
     */
    this.dragStartIndexes = null;

    /**
     * start client position(clientX, clientY) of mouse event.
     * @type {null | {x: number, y: number}}
     */
    this.startClientPosition = null;

    /**
     * start layerX position
     * @type {null | number}
     */
    this.startLayerX = null;

    /**
     * drag selection element
     * @type {null | HTMLElement}
     */
    this.dragSelectionElement = null;

    /**
     * container bound
     * @type {null | {left: number, right: number, top: number}}
     */
    this.containerBound = null;

    /**
     * whether show tooltip after zoom or not.
     * @type {boolean}
     */
    this.isShowTooltipAfterZoom = false;

    /**
     * whether after mouseup or not.
     * @type {boolean}
     */
    this.afterMouseup = false;

    /**
     * previouse distance of range
     * @type {null | number}
     */
    this.prevDistanceOfRange = null;

    /**
     * whether reverse move or not.
     * @type {null | number}
     */
    this.reverseMove = null;

    /**
     * reset zoom button element.
     * @type {null | HTMLElement}
     */
    this.resetZoomBtn = null;
  },

  /**
   * preset zoom data before rerender.
   */
  presetBeforeRerender() {
    if (this.resetZoomBtn) {
      this.mouseEventDetectorContainer.removeChild(this.resetZoomBtn);
      this.resetZoomBtn = null;
    }
    this._hideTooltip();
    this.prevDistanceOfRange = null;
  },

  /**
   * Show tooltip after zoom.
   * @private
   */
  _showTooltipAfterZoom() {
    const { isShowTooltipAfterZoom } = this;
    let lastDataBeforeZoom;

    this.isShowTooltipAfterZoom = false;

    if (!isShowTooltipAfterZoom || !this.dragStartIndexes) {
      return;
    }

    if (this.reverseMove) {
      lastDataBeforeZoom = this._getFirstData(this.dragStartIndexes.index);
    } else {
      lastDataBeforeZoom = this._getLastData(this.dragEndIndexes.index);
    }

    if (lastDataBeforeZoom) {
      this._showTooltip(lastDataBeforeZoom);
    }
  },

  /**
   * Update dimension for drag selection element.
   * @param {HTMLElement} selectionElement - drag selection element
   * @private
   */
  _updateDimensionForDragSelection(selectionElement) {
    renderUtil.renderDimension(selectionElement, {
      height: this.layout.dimension.height
    });
  },

  /**
   * Render drag selection.
   * @returns {HTMLElement}
   * @private
   */
  _renderDragSelection() {
    const selectionElement = dom.create('DIV', 'tui-chart-drag-selection');

    this._updateDimensionForDragSelection(selectionElement);

    return selectionElement;
  },

  /**
   * Render.
   * @param {object} data - data for rendering
   * @returns {HTMLElement}
   * @override
   */
  render(data) {
    const container = MouseEventDetectorBase.prototype.render.call(this, data);
    const selectionElement = this._renderDragSelection();

    dom.append(container, selectionElement);
    this.dragSelectionElement = selectionElement;

    return container;
  },

  /**
   * Resize.
   * @param {{tickCount: number}} data - data for resizing
   * @override
   */
  resize(data) {
    this.containerBound = null;
    MouseEventDetectorBase.prototype.resize.call(this, data);
    this._updateDimensionForDragSelection(this.dragSelectionElement);
  },

  /**
   * On click
   * @private
   * @override
   */
  _onClick() {},

  /**
   * Whether after drag mouseup or not.
   * @returns {boolean}
   * @private
   */
  _isAfterDragMouseup() {
    const { afterMouseup } = this;

    if (afterMouseup) {
      this.afterMouseup = false;
    }

    return afterMouseup;
  },

  /**
   * Bind drag event for zoom.
   * @param {HTMLElement} target - target element
   * @private
   */
  _bindDragEvent(target) {
    if (target.setCapture) {
      target.setCapture();
    }

    eventListener.on(document, 'mousemove', this._onDrag, this);
    eventListener.off(this.mouseEventDetectorContainer, 'mouseup', this._onMouseup, this);
    eventListener.on(document, 'mouseup', this._onMouseupAfterDrag, this);
  },

  /**
   * Unbind drag event for zoom.
   * @private
   */
  _unbindDragEvent() {
    if (this.downTarget && this.downTarget.releaseCapture) {
      this.downTarget.releaseCapture();
    }

    eventListener.off(document, 'mousemove', this._onDrag, this);
    eventListener.off(document, 'mouseup', this._onMouseupAfterDrag, this);
    eventListener.on(this.mouseEventDetectorContainer, 'mouseup', this._onMouseup, this);
  },

  /**
   * On mouse down.
   * @param {MouseEvent} e - mouse event
   * @private
   * @override
   */
  _onMousedown(e) {
    if (!this.zoomable) {
      return;
    }

    const target = e.target || e.srcElement;

    this.startClientPosition = {
      x: e.clientX,
      y: e.clientY
    };

    this.startLayerX = this._calculateLayerPosition(e.clientX).x;
    this.downTarget = target;

    this._bindDragEvent(target);
  },

  /**
   * Show drag selection.
   * @param {number} clientX - clientX
   * @private
   */
  _showDragSelection(clientX) {
    const { left: eventContainerLeft } = this.mouseEventDetectorContainer.getBoundingClientRect();
    const layerX = this._calculateLayerPosition(clientX).x;
    const clientPos = this.startClientPosition;
    const diffArea = eventContainerLeft - (clientPos.x - this.startLayerX);
    const left = Math.min(layerX, this.startLayerX) - diffArea;
    const width = Math.abs(layerX - this.startLayerX);
    const element = this.dragSelectionElement;

    element.style.left = `${left}px`;
    element.style.width = `${width}px`;

    dom.addClass(element, 'show');
  },

  /**
   * Hide drag selection.
   * @private
   */
  _hideDragSelection() {
    dom.removeClass(this.dragSelectionElement, 'show');
  },

  /**
   * On mouse drag.
   * @param {MouseEvent} e - mouse event
   * @private
   */
  _onDrag(e) {
    const clientPos = this.startClientPosition;
    const target = e.target || e.srcElement;

    if (clientPos) {
      const dataForZoomable = this._findDataForZoomable(clientPos.x, clientPos.y);

      if (!dom.hasClass(target, chartConst.CLASS_NAME_RESET_ZOOM_BTN)) {
        if (snippet.isNull(this.dragStartIndexes)) {
          this.dragStartIndexes = dataForZoomable ? dataForZoomable.indexes : {};
        } else {
          this._showDragSelection(e.clientX);
        }
      }
    }
  },

  /**
   * Adjust index range for ensure three indexes.
   * @param {Array.<{startIndex: number, endIndex: number}>} indexRange - index range
   * @returns {object} startIndex, endIndex
   * @private
   */
  _changeIndexToHaveMinimumIndexes([startIndex, endIndex]) {
    const distanceOfRange = endIndex - startIndex;

    if (distanceOfRange === 0) {
      if (startIndex === 0) {
        endIndex += 2;
      } else {
        startIndex -= 1;
        endIndex += 1;
      }
    } else if (distanceOfRange === 1) {
      if (startIndex === 0) {
        endIndex += 1;
      } else {
        startIndex -= 1;
      }
    }

    return {
      startIndex,
      endIndex
    };
  },

  /**
   * Adjust index range for ensure three indexes.
   * @param {number} startIndex - start index
   * @param {number} endIndex - end index
   * @returns {Array.<number>}
   * @private
   */
  _adjustIndexRange(startIndex, endIndex) {
    const indexRange = [startIndex, endIndex].sort((a, b) => a - b);

    return this._changeIndexToHaveMinimumIndexes(indexRange);
  },

  /**
   * Fire zoom mouse event detector.
   * @private
   */
  _fireZoom() {
    if (this.dataProcessor.isLineCoordinateType()) {
      this._fireZoomUsingValue(this.dragStartIndexes, this.dragEndIndexes);
    } else {
      this._fireZoomUsingIndex(this.dragStartIndexes.groupIndex, this.dragEndIndexes.groupIndex);
    }
  },

  /**
   * Fire zoom mouse event detector using Index.
   * @param {number} startIndex - start index
   * @param {number} endIndex - end index
   * @private
   */
  _fireZoomUsingIndex(startIndex, endIndex) {
    const reverseMove = startIndex > endIndex;
    const { startIndex: adjustedStartIndex, endIndex: adjustedEndIndex } = this._adjustIndexRange(
      startIndex,
      endIndex
    );
    const distanceOfRange = adjustedEndIndex - adjustedStartIndex;

    if (this.prevDistanceOfRange === distanceOfRange) {
      return;
    }

    this.prevDistanceOfRange = distanceOfRange;
    this.reverseMove = reverseMove;
    this.eventBus.fire('zoom', [adjustedStartIndex, adjustedEndIndex]);
  },

  /**
   * Adjust value range for ensure three indexes.
   * @param {number} startValue - start index
   * @param {number} endValue - end index
   * @returns {Array.<number>}
   * @private
   */
  _adjustValueRange(startValue, endValue) {
    let startValueIndex, endValueIndex;
    const {
      integratedXAxisData,
      options: { xAxis: xAxisOptions }
    } = this.dataProcessor;
    const isDatetime = predicate.isDatetimeType(xAxisOptions.type);

    if (isDatetime) {
      startValueIndex = arrayUtil.findIndexFromDateTypeArray(
        integratedXAxisData,
        new Date(startValue)
      );
      endValueIndex = arrayUtil.findIndexFromDateTypeArray(integratedXAxisData, new Date(endValue));
    } else {
      startValueIndex = integratedXAxisData.indexOf(startValue);
      endValueIndex = integratedXAxisData.indexOf(endValue);
    }

    const indexRange = [startValueIndex, endValueIndex].sort((a, b) => a - b);
    const { startIndex, endIndex } = this._changeIndexToHaveMinimumIndexes(indexRange);

    return [integratedXAxisData[startIndex], integratedXAxisData[endIndex]];
  },

  /**
   * Fire zoom mouse event detector for coordinateChart.
   * @param {object} startIndexes - start index
   * @param {object} endIndexes - end index
   * @private
   */
  _fireZoomUsingValue(startIndexes, endIndexes) {
    const { index: startIndex, groupIndex: startGroupIndex } = startIndexes;
    const { index: endIndex, groupIndex: endGroupIndex } = endIndexes;
    const seriesData = this.dataProcessor.rawData.series.line;
    const [startValue] = seriesData[startIndex].data[startGroupIndex];
    const [endValue] = seriesData[endIndex].data[endGroupIndex];
    const valueRange = this._adjustValueRange(startValue, endValue);

    this.eventBus.fire('zoom', valueRange);
  },

  /**
   * Set flag about whether show tooltip after zoom or not.
   * @param {number} clientX - clientX of mouse event
   * @param {number} clientY - clientY of mouse event
   * @private
   */
  _setIsShowTooltipAfterZoomFlag(clientX, clientY) {
    const layerX = this._calculateLayerPosition(clientX, clientY, false).x;
    const limitLayerX = this._calculateLayerPosition(clientX, clientY).x;

    this.isShowTooltipAfterZoom = layerX === limitLayerX;
  },

  /**
   * On mouseup after drag event.
   * @param {MouseEvent} e - mouse event
   * @private
   */
  _onMouseupAfterDrag(e) {
    // @TODO: define zoomable policy, when there is no data
    // To find dragEndIndex for zoom, data should not be null.
    // To avoid zooming avoid zooming with no data, check dragStartIndexes first
    // Becault chart without data returns invalid dragStartIndexes
    const foundedDragEndData = this._findDataForZoomable(e.clientX, e.clientY);

    this._unbindDragEvent();

    if (snippet.isNull(this.dragStartIndexes)) {
      const target = e.target || e.srcElement;
      if (dom.hasClass(target, chartConst.CLASS_NAME_RESET_ZOOM_BTN)) {
        this._hideTooltip();
        this.prevDistanceOfRange = null;
        this.eventBus.fire('resetZoom');
      } else {
        MouseEventDetectorBase.prototype._onClick.call(this, e);
      }
    } else if (this.dragStartIndexes && foundedDragEndData) {
      this.dragEndIndexes = foundedDragEndData.indexes;
      this._setIsShowTooltipAfterZoomFlag(e.clientX, e.clientY);
      this._hideDragSelection();
      this._fireZoom();
    } else {
      this._setIsShowTooltipAfterZoomFlag(e.clientX, e.clientY);
      this._hideDragSelection();
    }

    this.startClientPosition = null;
    this.dragStartIndexes = null;
    this.startLayerX = null;
    this.afterMouseup = true;
  },

  /**
   * Render reset zoom button element.
   * @returns {HTMLElement}
   * @private
   */
  _renderResetZoomBtn() {
    const resetBtn = dom.create('DIV', chartConst.CLASS_NAME_RESET_ZOOM_BTN);

    return resetBtn;
  },

  /**
   * Zoom.
   * @param {object} data - data for rendering
   */
  zoom(data) {
    this.prevFoundData = null;
    this.rerender(data);
    this._updateDimensionForDragSelection(this.dragSelectionElement);

    if (!this.resetZoomBtn) {
      this.resetZoomBtn = this._renderResetZoomBtn();
      dom.append(this.mouseEventDetectorContainer, this.resetZoomBtn);
    } else if (data.isResetZoom) {
      this.mouseEventDetectorContainer.removeChild(this.resetZoomBtn);
      this.resetZoomBtn = null;
    }
  }
};
