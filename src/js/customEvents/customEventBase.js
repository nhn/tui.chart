/**
 * @fileoverview CustomEventBase is base class for event handle layers.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var TickBaseCoordinateModel = require('./tickBaseCoordinateModel');
var BoundsBaseCoordinateModel = require('./boundsBaseCoordinateModel');
var chartConst = require('../const');
var eventListener = require('../helpers/eventListener');
var predicate = require('../helpers/predicate');
var dom = require('../helpers/domHandler');
var renderUtil = require('../helpers/renderUtil');

var CustomEventBase = tui.util.defineClass(/** @lends CustomEventBase.prototype */ {
    /**
     * CustomEventBase is base class for custom event components.
     * @constructs CustomEventBase
     * @param {object} params parameters
     *      @param {string} params.chartType - chart type
     *      @param {Array.<string>} params.chartTypes - chart types
     *      @param {boolean} params.isVertical - whether vertical or not
     *      @param {DataProcessor} params.dataProcessor - DataProcessor instance
     *      @param {boolean} params.allowSelect - whether has allowSelect option or not
     */
    init: function(params) {
        var isLineTypeChart;

        /**
         * type of chart
         * @type {string}
         */
        this.chartType = params.chartType;

        /**
         * chartTypes is available in combo chart
         * @type {Array.<string>}
         */
        this.chartTypes = params.chartTypes;

        /**
         * whether vertical or not
         * @type {boolean}
         */
        this.isVertical = params.isVertical;

        /**
         * data processor
         * @type {DataProcessor}
         */
        this.dataProcessor = params.dataProcessor;

        /**
         * whether allow select series or not
         */
        this.allowSelect = params.allowSelect;

        /**
         * layout bounds information for this components
         * @type {null|{dimension:{width:number, height:number}, position:{left:number, top:number}}}
         */
        this.layout = null;

        /**
         * selected series item.
         * @type {null | object}
         */
        this.selectedData = null;

        /**
         * previous client position of mouse event (clientX, clientY)
         * @type {null | object}
         */
        this.prevClientPosition = null;

        /**
         * previous found data
         * @type {null | object}
         */
        this.prevFoundData = null;


        isLineTypeChart = predicate.isLineTypeChart(this.chartType, this.chartTypes);

        /**
         * expand size
         * @type {number}
         */
        this.expandSize = isLineTypeChart ? chartConst.SERIES_EXPAND_SIZE : 0;

        /**
         * container bound
         * @type {null | {left: number, top: number, right: number, bottom: number}}
         */
        this.containerBound = null;
    },

    /**
     * Get bound for rendering.
     * @returns {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }}
     * @private
     */
    _getRenderingBound: function() {
        var renderingBound = this.layout;

        if (predicate.isLineTypeChart(this.chartType, this.chartTypes)) {
            renderingBound = renderUtil.expandBound(renderingBound);
        }

        return renderingBound;
    },

    /**
     * Render event handle layer area.
     * @param {HTMLElement} customEventContainer - container element for custom event
     * @param {number} tickCount - tick count
     * @private
     */
    _renderCustomEventArea: function(customEventContainer, tickCount) {
        var dimension = this.layout.dimension;
        var renderingBound, tbcm;

        this.dimension = dimension;
        tbcm = new TickBaseCoordinateModel(dimension, tickCount, this.chartType, this.isVertical, this.chartTypes);
        this.tickBaseCoordinateModel = tbcm;
        renderingBound = this._getRenderingBound();
        renderUtil.renderDimension(customEventContainer, renderingBound.dimension);
        renderUtil.renderPosition(customEventContainer, renderingBound.position);
    },

    /**
     * Set data for rendering.
     * @param {{
     *      layout: {
     *          dimension: {width: number, height: number},
     *          position: {left: number, top: number}
     *      }
     * }} data - bounds data
     * @private
     */
    _setDataForRendering: function(data) {
        this.layout = data.layout;
    },

    /**
     * Render for customEvent component.
     * @param {object} data - bounds data and tick count
     * @returns {HTMLElement} container for custom event
     */
    render: function(data) {
        var container = dom.create('DIV', 'tui-chart-series-custom-event-area');

        this._setDataForRendering(data);
        this._renderCustomEventArea(container, data.tickCount);
        this.attachEvent(container);
        this.customEventContainer = container;

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
     * @returns {{x: number, y: ?number}}
     * @private
     */
    _calculateLayerPosition: function(clientX, clientY, checkLimit) {
        var bound = this._getContainerBound();
        var layerPosition = {};
        var expandSize = this.expandSize;
        var maxLeft, minLeft;

        checkLimit = tui.util.isUndefined(checkLimit) ? true : checkLimit;

        if (checkLimit) {
            maxLeft = bound.right + expandSize;
            minLeft = bound.left - expandSize;
            clientX = Math.min(Math.max(clientX, minLeft), maxLeft);
        }

        layerPosition.x = clientX - bound.left;

        if (!tui.util.isUndefined(clientY)) {
            layerPosition.y = clientY - bound.top;
        }

        return layerPosition;
    },

    /**
     * Create BoundsBaseCoordinateModel from seriesBounds for custom event.
     * @param {Array.<object>} seriesBounds - series bounds
     */
    initCustomEventData: function(seriesBounds) {
        this.boundsBaseCoordinateModel = new BoundsBaseCoordinateModel(seriesBounds);
    },

    /**
     * Rerender for customEvent component.
     * @param {object} data - bounds data and tick count
     */
    rerender: function(data) {
        this.selectedData = null;
        this._setDataForRendering(data);
        this._renderCustomEventArea(this.customEventContainer, data.tickCount);
    },

    /**
     * Resize for customEvent component.
     * @param {object} data - bounds data and tick count
     */
    resize: function(data) {
        this.containerBound = null;
        this.rerender(data);
    },

    /**
     * Whether changed select data or not.
     * @param {object} prev - previous data
     * @param {object} cur - current data
     * @returns {boolean}
     * @private
     */
    _isChangedSelectData: function(prev, cur) {
        return !prev || !cur || prev.chartType !== cur.chartType ||
            prev.indexes.groupIndex !== cur.indexes.groupIndex || prev.indexes.index !== cur.indexes.index;
    },

    /**
     * Find coordinate data from boundsCoordinateModel.
     * @param {{x: number, y: number}} layerPosition - layer position
     * @returns {object}
     * @private
     */
    _findDataFromBoundsCoordinateModel: function(layerPosition) {
        var layerX = layerPosition.x;
        var layerY = layerPosition.y;
        var groupIndex;

        if (predicate.isTreemapChart(this.chartType)) {
            groupIndex = 0;
        } else {
            layerY += chartConst.SERIES_EXPAND_SIZE;
            groupIndex = this.tickBaseCoordinateModel.findIndex(this.isVertical ? layerX : layerY);
            layerX += chartConst.SERIES_EXPAND_SIZE;
        }

        return this.boundsBaseCoordinateModel.findData(groupIndex, layerX, layerY);
    },

    /**
     * Unselect selected data.
     * @private
     */
    _unselectSelectedData: function() {
        var eventName = renderUtil.makeCustomEventName('unselect', this.selectedData.chartType, 'series');
        this.fire(eventName, this.selectedData);
        this.selectedData = null;
    },

    /**
     * Find data.
     * @param {number} clientX - clientX
     * @param {number} clientY - clientY
     * @returns {object}
     * @private
     */
    _findData: function(clientX, clientY) {
        var layerPosition = this._calculateLayerPosition(clientX, clientY);

        return this._findDataFromBoundsCoordinateModel(layerPosition);
    },

    /**
     * Show tooltip
     * @private
     * @abstract
     */
    _showTooltip: function() {},

    /**
     * Animate for adding data.
     */
    animateForAddingData: function() {
        var foundData, isMoving;

        if (!this.prevClientPosition) {
            return;
        }

        foundData = this._findData(this.prevClientPosition.x, this.prevClientPosition.y);

        if (foundData) {
            isMoving = this.prevFoundData && (this.prevFoundData.indexes.groupIndex === foundData.indexes.groupIndex);
            this._showTooltip(foundData, isMoving);
        }

        this.prevFoundData = foundData;
    },

    /**
     * On mouse event.
     * @param {string} eventType - custom event type
     * @param {MouseEvent} e - mouse event
     * @private
     */
    _onMouseEvent: function(eventType, e) {
        var eventName = renderUtil.makeCustomEventName(eventType, this.chartType, 'series');

        dom.addClass(this.customEventContainer, 'hide');
        this.fire(eventName, {
            left: e.clientX,
            top: e.clientY
        });
        dom.removeClass(this.customEventContainer, 'hide');
    },

    /**
     * On click
     * @param {MouseEvent} e - mouse event
     * @private
     */
    _onClick: function(e) {
        var foundData = this._findData(e.clientX, e.clientY);

        if (!this._isChangedSelectData(this.selectedData, foundData)) {
            this._unselectSelectedData();
        } else if (foundData) {
            if (this.selectedData) {
                this._unselectSelectedData();
            }

            this.fire(renderUtil.makeCustomEventName('select', foundData.chartType, 'series'), foundData);

            if (this.allowSelect) {
                this.selectedData = foundData;
            }
        }
    },

    /**
     * On mouse down
     * @private
     * @abstract
     */
    _onMousedown: function() {},

    /**
     * On mouse up
     * @private
     * @abstract
     */
    _onMouseup: function() {},

    /**
     * On mouse move
     * @param {MouseEvent} e - mouse event
     * @private
     */
    _onMousemove: function(e) {
        this.prevClientPosition = {
            x: e.clientX,
            y: e.clientY
        };
    },

    /**
     * On mouse out
     * @private
     */
    _onMouseout: function() {
        this.prevClientPosition = null;
        this.prevFoundData = null;
    },

    /**
     * Attach event
     * @param {HTMLElement} target - target element
     */
    attachEvent: function(target) {
        eventListener.on(target, {
            click: this._onClick,
            mousedown: this._onMousedown,
            mouseup: this._onMouseup,
            mousemove: this._onMousemove,
            mouseout: this._onMouseout
        }, this);
    }
});

tui.util.CustomEvents.mixin(CustomEventBase);

module.exports = CustomEventBase;
