/**
 * @fileoverview AreaTypeCustomEvent is event handle layer for line type chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var CustomEventBase = require('./customEventBase');
var AreaTypeDataModel = require('./areaTypeDataModel');
var chartConst = require('../const');
var eventListener = require('../helpers/eventListener');
var dom = require('../helpers/domHandler');

var AreaTypeCustomEvent = tui.util.defineClass(CustomEventBase, /** @lends AreaTypeCustomEvent.prototype */ {
    /**
     * AreaTypeCustomEvent is custom event for line type chart.
     * @param {object} params parameters
     * @constructs AreaTypeCustomEvent
     * @extends CustomEventBase
     */
    init: function(params) {
        CustomEventBase.call(this, params);

        /**
         * previous found data
         * @type {null | object}
         */
        this.prevFoundData = null;

        /**
         * drag start data.
         * @type {null | object}
         */
        this.dragStartData = null;

        /**
         * start layerX
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
    },

    /**
     * Initialize data of custom event
     * @param {Array.<object>} seriesInfos series infos
     * @override
     */
    initCustomEventData: function(seriesInfos) {
        var seriesInfo = seriesInfos[0];
        this.dataModel = new AreaTypeDataModel(seriesInfo);
        CustomEventBase.prototype.initCustomEventData.call(this, seriesInfos);
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
     * @returns {{x: number, y: ?number}}
     * @private
     */
    _calculateLayerPosition: function(clientX, clientY) {
        var bound = this._getContainerBound();
        var maxLeft = bound.right - chartConst.SERIES_EXPAND_SIZE;
        var minLeft = bound.left + chartConst.SERIES_EXPAND_SIZE;
        var layerPosition = {
            x: Math.min(Math.max(clientX, minLeft), maxLeft) - chartConst.SERIES_EXPAND_SIZE - bound.left
        };

        if (!tui.util.isUndefined(clientY)) {
            layerPosition.y = clientY - bound.top;
        }

        return layerPosition;
    },

    /**
     * Find data by client position.
     * @param {number} clientX - clientX
     * @param {number} clientY - clientY
     * @returns {object}
     * @private
     */
    _findData: function(clientX, clientY) {
        var layerPosition = this._calculateLayerPosition(clientX, clientY);
        var groupIndex = this.tickBaseCoordinateModel.findIndex(layerPosition.x);

        return this.dataModel.findData(groupIndex, layerPosition.y);
    },

    /**
     * Render drag selection.
     * @returns {HTMLElement}
     * @private
     */
    _renderDragSelection: function() {
        var selectionElement = dom.create('DIV', 'tui-chart-selection');
        var height = this.boundsMaker.getDimension('customEvent').height;

        selectionElement.style.height = height + 'px';

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

        this.dragSelectionElement = selectionElement;
        dom.append(container, selectionElement);

        return container;
    },

    /**
     * Resize.
     * @param {{tickCount: number}} data - data for resizing
     * @override
     */
    resize: function(data) {
        this.containerBound = null;
        CustomEventBase.prototype.resize.call(this, data);
    },

    /**
     * On click.
     * @private
     * @override
     */
    _onClick: function() {},

    /**
     * On mouse down.
     * @param {MouseEvent} e - mouse event
     * @private
     * @override
     */
    _onMousedown: function(e) {
        var target = e.target || e.srcElement;
        var layerX = this._calculateLayerPosition(e.clientX).x;

        this.startLayerX = layerX;
        this.downTarget = target;

        if (target.setCapture) {
            target.setCapture();
        }

        eventListener.off(this.customEventContainer, 'mousemove', this._onMousemove, this);
        eventListener.on(document, 'mousemove', this._onDrag, this);
        eventListener.off(this.customEventContainer, 'mouseup', this._onMouseup, this);
        eventListener.on(document, 'mouseup', this._onMouseup, this);
    },

    /**
     * On mousemove.
     * @param {MouseEvent} e - mouse event
     * @private
     * @override
     */
    _onMousemove: function(e) {
        var foundData = this._findData(e.clientX, e.clientY);

        if (!this._isChangedSelectData(this.prevFoundData, foundData)) {
            return;
        }

        if (foundData) {
            this.fire('showTooltip', foundData);
        } else if (this.prevFoundData) {
            this.fire('hideTooltip', this.prevFoundData);
        }
        this.prevFoundData = foundData;
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
        if (!this.dragStartData) {
            this.dragStartData = this._findData(e.clientX, e.clientY);
            this.fire('hideTooltip', this.prevFoundData);
        } else {
            this._showDragSelection(e.clientX);
        }
    },

    /**
     * On mouse up.
     * @param {MouseEvent} e - mouse event
     * @private
     */
    _onMouseup: function(e) {
        var dragEndData;

        if (this.downTarget.releaseCapture) {
            this.downTarget.releaseCapture();
        }

        eventListener.off(document, 'mousemove', this._onDrag, this);
        eventListener.on(this.customEventContainer, 'mousemove', this._onMousemove, this);
        eventListener.off(document, 'mouseup', this._onMouseup, this);
        eventListener.on(this.customEventContainer, 'mouseup', this._onMouseup, this);

        this._hideDragSelection();
        this.dragStartData = null;
        this.startLayerX = null;

        if (this.dragStartData) {
            dragEndData = this._findData(e.clientX, e.clientY);
        } else {
            CustomEventBase.prototype._onClick.call(this, e);
        }
    },

    /**
     * On mouseout.
     * @private
     * @override
     */
    _onMouseout: function() {
        if (this.prevFoundData) {
            this.fire('hideTooltip', this.prevFoundData);
            this.prevFoundData = null;
        }
    }
});

module.exports = AreaTypeCustomEvent;
