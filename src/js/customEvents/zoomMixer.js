/**
 * @fileoverview  Mixer for zoom event of area type custom event.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var CustomEventBase = require('./customEventBase');
var chartConst = require('../const');
var dom = require('../helpers/domHandler');
var renderUtil = require('../helpers/renderUtil');
var eventListener = require('../helpers/eventListener');

/**
 * Mixer for zoom event of area type custom event.
 * @mixin
 */
var zoomMixer = {
    /**
     * Initialize for zoom.
     * @param {boolean} zoomable - whether zoomable or not
     * @private
     */
    _initForZoom: function(zoomable) {
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
     * Show tooltip after zoom.
     * @private
     */
    _showTooltipAfterZoom: function() {
        var isShowTooltipAfterZoom = this.isShowTooltipAfterZoom;
        var lastDataBeforeZoom;

        this.isShowTooltipAfterZoom = false;

        if (!isShowTooltipAfterZoom || !this.dragStartIndexes) {
            return;
        }

        if (this.reverseMove) {
            lastDataBeforeZoom = this._getFirstData(this.dragStartIndexes.index);
        } else {
            lastDataBeforeZoom = this._getLastData(this.dragEndIndexes.index);
        }

        this._showTooltip(lastDataBeforeZoom);
    },

    /**
     * Update dimension for drag selection element.
     * @param {HTMLElement} selectionElement - drag selection element
     * @private
     */
    _updateDimensionForDragSelection: function(selectionElement) {
        renderUtil.renderDimension(selectionElement, {
            height: this.boundsMaker.getDimension('customEvent').height
        });
    },

    /**
     * Render drag selection.
     * @returns {HTMLElement}
     * @private
     */
    _renderDragSelection: function() {
        var selectionElement = dom.create('DIV', 'tui-chart-drag-selection');

        this._updateDimensionForDragSelection(selectionElement);

        return selectionElement;
    },

    /**
     * Render.
     * @param {object} data - data for rendering
     * @returns {HTMLElement}
     * @override
     */
    render: function(data) {
        var container = CustomEventBase.prototype.render.call(this, data);
        var selectionElement = this._renderDragSelection();

        dom.append(container, selectionElement);
        this.dragSelectionElement = selectionElement;

        return container;
    },

    /**
     * Get container bound.
     * @returns {ClientRect}
     * @private
     */
    _getContainerBound: function() {
        if (!this.containerBound) {
            this.containerBound = this.customEventContainer.getBoundingClientRect();
        }

        return this.containerBound;
    },

    /**
     * Calculate layer position by client position.
     * @param {number} clientX - clientX
     * @param {number} [clientY] - clientY
     * @param {boolean} [checkLimit] - whether check limit or not
     * @param {boolean} [isExpanded] - whether expanded or not
     * @returns {{x: number, y: ?number}}
     * @private
     */
    _calculateLayerPosition: function(clientX, clientY, checkLimit, isExpanded) {
        var bound = this._getContainerBound();
        var layerPosition = {};
        var expandSize = (isExpanded === false) ? 0 : chartConst.SERIES_EXPAND_SIZE;
        var maxLeft, minLeft;

        checkLimit = tui.util.isUndefined(checkLimit) ? true : checkLimit;

        if (checkLimit) {
            maxLeft = bound.right - expandSize;
            minLeft = bound.left + expandSize;
            clientX = Math.min(Math.max(clientX, minLeft), maxLeft);
        }

        layerPosition.x = clientX - bound.left;

        if (!tui.util.isUndefined(clientY)) {
            layerPosition.y = clientY - bound.top;
        }

        return layerPosition;
    },

    /**
     * Resize.
     * @param {{tickCount: number}} data - data for resizing
     * @override
     */
    resize: function(data) {
        this.containerBound = null;
        CustomEventBase.prototype.resize.call(this, data);
        this._updateDimensionForDragSelection(this.dragSelectionElement);
    },

    /**
     * On click
     * @private
     * @override
     */
    _onClick: function() {},

    /**
     * Whether after drag mouseup or not.
     * @returns {boolean}
     * @private
     */
    _isAfterDragMouseup: function() {
        var afterMouseup = this.afterMouseup;

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
    _bindDragEvent: function(target) {
        if (target.setCapture) {
            target.setCapture();
        }

        eventListener.on(document, 'mousemove', this._onDrag, this);
        eventListener.off(this.customEventContainer, 'mouseup', this._onMouseup, this);
        eventListener.on(document, 'mouseup', this._onMouseupAfterDrag, this);
    },

    /**
     * Unbind drag event for zoom.
     * @private
     */
    _unbindDragEvent: function() {
        if (this.downTarget && this.downTarget.releaseCapture) {
            this.downTarget.releaseCapture();
        }

        eventListener.off(document, 'mousemove', this._onDrag, this);
        eventListener.off(document, 'mouseup', this._onMouseupAfterDrag, this);
        eventListener.on(this.customEventContainer, 'mouseup', this._onMouseup, this);
    },

    /**
     * On mouse down.
     * @param {MouseEvent} e - mouse event
     * @private
     * @override
     */
    _onMousedown: function(e) {
        var target;

        if (!this.zoomable) {
            return;
        }

        target = e.target || e.srcElement;

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
    _showDragSelection: function(clientX) {
        var layerX = this._calculateLayerPosition(clientX).x;
        var left = Math.min(layerX, this.startLayerX);
        var width = Math.abs(layerX - this.startLayerX);
        var element = this.dragSelectionElement;

        element.style.left = left + chartConst.SERIES_EXPAND_SIZE + 'px';
        element.style.width = width + 'px';

        dom.addClass(element, 'show');
    },

    /**
     * Hide drag selection.
     * @private
     */
    _hideDragSelection: function() {
        dom.removeClass(this.dragSelectionElement, 'show');
    },

    /**
     * On mouse drag.
     * @param {MouseEvent} e - mouse event
     * @private
     */
    _onDrag: function(e) {
        var clientPos = this.startClientPosition;

        if (tui.util.isNull(this.dragStartIndexes)) {
            this.dragStartIndexes = this._findData(clientPos.x, clientPos.y).indexes;
        } else {
            this._showDragSelection(e.clientX);
        }
    },

    /**
     * Adjust index range for ensure three indexes.
     * @param {number} startIndex - start index
     * @param {number} endIndex - end index
     * @returns {Array.<number>}
     * @private
     */
    _adjustIndexRange: function(startIndex, endIndex) {
        var indexRange = [startIndex, endIndex].sort(function(a, b) {
            return a - b;
        });
        var distanceOfRange = indexRange[1] - indexRange[0];

        if (distanceOfRange === 0) {
            if (indexRange[0] === 0) {
                indexRange[1] += 2;
            } else {
                indexRange[0] -= 1;
                indexRange[1] += 1;
            }
        } else if (distanceOfRange === 1) {
            if (indexRange[0] === 0) {
                indexRange[1] += 1;
            } else {
                indexRange[0] -= 1;
            }
        }

        return indexRange;
    },

    /**
     * Fire zoom custom event.
     * @param {number} startIndex - start index
     * @param {number} endIndex - end index
     * @private
     */
    _fireZoom: function(startIndex, endIndex) {
        var reverseMove = startIndex > endIndex;
        var indexRange = this._adjustIndexRange(startIndex, endIndex);
        var distanceOfRange = indexRange[1] - indexRange[0];

        if (this.prevDistanceOfRange === distanceOfRange) {
            return;
        }

        this.prevDistanceOfRange = distanceOfRange;
        this.reverseMove = reverseMove;
        this.fire('zoom', indexRange);
    },

    /**
     * Set flag about whether show tooltip after zoom or not.
     * @param {number} clientX - clientX of mouse event
     * @param {number} clientY - clientY of mouse event
     * @private
     */
    _setIsShowTooltipAfterZoomFlag: function(clientX, clientY) {
        var layerX = this._calculateLayerPosition(clientX, clientY, false).x;
        var limitLayerX = this._calculateLayerPosition(clientX, clientY).x;

        this.isShowTooltipAfterZoom = (layerX === limitLayerX);
    },

    /**
     * On mouseup after drag event.
     * @param {MouseEvent} e - mouse event
     * @private
     */
    _onMouseupAfterDrag: function(e) {
        var target;

        this._unbindDragEvent();

        if (tui.util.isNull(this.dragStartIndexes)) {
            target = e.target || e.srcElement;
            if (dom.hasClass(target, 'tui-chart-reset-zoom-btn')) {
                this._hideTooltip();
                this.fire('resetZoom');
            } else {
                CustomEventBase.prototype._onClick.call(this, e);
            }
        } else {
            this.dragEndIndexes = this._findData(e.clientX, e.clientY).indexes;
            this._setIsShowTooltipAfterZoomFlag(e.clientX, e.clientY);
            this._hideDragSelection();
            this._fireZoom(this.dragStartIndexes.groupIndex, this.dragEndIndexes.groupIndex);
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
    _renderResetZoomBtn: function() {
        var resetBtn = dom.create('DIV', 'tui-chart-reset-zoom-btn');
        resetBtn.innerHTML = 'Reset Zoom';

        return resetBtn;
    },

    /**
     * Zoom.
     * @param {object} data - data for rendering
     */
    zoom: function(data) {
        this.prevFoundData = null;
        this.rerender(data);
        this._updateDimensionForDragSelection(this.dragSelectionElement);

        if (!this.resetZoomBtn) {
            this.resetZoomBtn = this._renderResetZoomBtn();
            dom.append(this.customEventContainer, this.resetZoomBtn);
        } else if (data.isResetZoom) {
            this.customEventContainer.removeChild(this.resetZoomBtn);
            this.resetZoomBtn = null;
        }
    },

    /**
     * Mix in.
     * @param {function} func target function
     * @ignore
     */
    mixin: function(func) {
        tui.util.extend(func.prototype, this);
    }
};

module.exports = zoomMixer;
