/**
 * @fileoverview CustomEventBase is base class for event handle layers.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var TickBaseCoordinateModel = require('./tickBaseCoordinateModel');
var BoundsBaseCoordinateModel = require('./boundsBaseCoordinateModel');
var chartConst = require('../../const/');
var eventListener = require('../../helpers/eventListener');
var predicate = require('../../helpers/predicate');
var dom = require('../../helpers/domHandler');
var renderUtil = require('../../helpers/renderUtil');

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
         * event bus for transmitting message
         * @type {object}
         */
        this.eventBus = params.eventBus;

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
         * series item bounds data
         * @type {Array}
         */
        this.seriesItemBoundsData = [];

        /**
         * series count
         * @type {number}
         */
        this.seriesCount = predicate.isComboChart(this.chartType) ? 2 : 1;

        this._attachToEventBus();
    },

    /**
     * Attach to event bus.
     * @private
     */
    _attachToEventBus: function() {
        this.eventBus.on('receiveSeriesData', this.onReceiveSeriesData, this);
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
     * Pick tick count.
     * @param {{xAxis: object, yAxis: object}} axisDataMap - axis data map
     * @returns {number}
     * @private
     */
    _pickTickCount: function(axisDataMap) {
        var tickCount;

        if (this.isVertical) {
            tickCount = axisDataMap.xAxis.eventTickCount || axisDataMap.xAxis.tickCount;
        } else {
            tickCount = axisDataMap.yAxis.tickCount;
        }

        return tickCount;
    },

    /**
     * Render for customEvent component.
     * @param {object} data - bounds data and tick count
     * @returns {HTMLElement} container for custom event
     */
    render: function(data) {
        var container = dom.create('DIV', 'tui-chart-series-custom-event-area');
        var tickCount;

        if (data.axisDataMap.xAxis) {
            tickCount = this._pickTickCount(data.axisDataMap);
        }

        this._setDataForRendering(data);
        this._renderCustomEventArea(container, tickCount);
        this.attachEvent(container);
        this.customEventContainer = container;

        return container;
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
        var bound = this.customEventContainer.getBoundingClientRect();
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
     * @param {{chartType: string, data: object}} seriesItemBoundsDatum - series item bounds datum
     */
    onReceiveSeriesData: function(seriesItemBoundsDatum) {
        var seriesItemBoundsData = this.seriesItemBoundsData;
        var seriesCount = this.seriesCount;

        if (seriesItemBoundsData.length === seriesCount) {
            seriesItemBoundsData = [];
        }

        seriesItemBoundsData.push(seriesItemBoundsDatum);

        if (seriesItemBoundsData.length === seriesCount) {
            this.boundsBaseCoordinateModel = new BoundsBaseCoordinateModel(seriesItemBoundsData);
        }
    },

    /**
     * Rerender for customEvent component.
     * @param {object} data - bounds data and tick count
     */
    rerender: function(data) {
        var tickCount;

        if (data.axisDataMap.xAxis) {
            tickCount = this._pickTickCount(data.axisDataMap);
        }

        this.selectedData = null;
        this._setDataForRendering(data);
        this._renderCustomEventArea(this.customEventContainer, tickCount);
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
        dom.addClass(this.customEventContainer, 'hide');
        this.eventBus.fire(eventType + 'Series', {
            left: e.clientX,
            top: e.clientY
        });
        dom.removeClass(this.customEventContainer, 'hide');
    },

    /**
     * Unselect selected data.
     * @private
     */
    _unselectSelectedData: function() {
        this.eventBus.fire('unselectSeries', this.selectedData);
        this.selectedData = null;
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

            this.eventBus.fire('selectSeries', foundData);
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
