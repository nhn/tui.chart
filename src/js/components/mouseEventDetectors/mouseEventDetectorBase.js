/**
 * @fileoverview MouseEventDetectorBase is base class for mouse event detector components.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var TickBaseCoordinateModel = require('./tickBaseCoordinateModel');
var BoundsBaseCoordinateModel = require('./boundsBaseCoordinateModel');
var chartConst = require('../../const');
var eventListener = require('../../helpers/eventListener');
var predicate = require('../../helpers/predicate');
var dom = require('../../helpers/domHandler');
var renderUtil = require('../../helpers/renderUtil');
var snippet = require('tui-code-snippet');

var MouseEventDetectorBase = snippet.defineClass(/** @lends MouseEventDetectorBase.prototype */ {
    /**
     * MouseEventDetectorBase is base class for mouse event detector components.
     * @constructs MouseEventDetectorBase
     * @private
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
         * @type {boolean}
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

        this.drawingType = chartConst.COMPONENT_TYPE_DOM;
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
        var renderingBound = renderUtil.expandBound(this.layout);

        return renderingBound;
    },

    /**
     * Render event handle layer area.
     * @param {HTMLElement} mouseEventDetectorContainer - container element for mouse event detector
     * @param {number} tickCount - tick count
     * @private
     */
    _renderMouseEventDetectorArea: function(mouseEventDetectorContainer, tickCount) {
        var dimension = this.layout.dimension;
        var renderingBound, tbcm;

        this.dimension = dimension;
        tbcm = new TickBaseCoordinateModel(this.layout, tickCount, this.chartType, this.isVertical, this.chartTypes);
        this.tickBaseCoordinateModel = tbcm;
        renderingBound = this._getRenderingBound();
        renderUtil.renderDimension(mouseEventDetectorContainer, renderingBound.dimension);
        renderUtil.renderPosition(mouseEventDetectorContainer, renderingBound.position);
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
     * Render for mouseEventDetector component.
     * @param {object} data - bounds data and tick count
     * @returns {HTMLElement} container for mouse event detector
     */
    render: function(data) {
        var container = data.paper;
        var tickCount;
        this.positionMap = data.positionMap;

        dom.addClass(container, 'tui-chart-series-custom-event-area');

        if (data.axisDataMap.xAxis) {
            tickCount = this._pickTickCount(data.axisDataMap);
        }

        this._setDataForRendering(data);
        this._renderMouseEventDetectorArea(container, tickCount);
        this.attachEvent(container);
        this.mouseEventDetectorContainer = container;

        this.transparentChild = this._createTransparentChild();
        dom.append(container, this.transparentChild);

        return container;
    },

    /**
     * Create a transparent element
     * @param {string} height - value of css heigth property
     * @returns {HTMLElement} transparent element
     * @private
     */
    _createTransparentChild: function() {
        var child = document.createElement('DIV');
        var style = child.style;

        style.backgroundColor = '#fff';
        style.height = renderUtil.getStyle(this.mouseEventDetectorContainer).height;
        renderUtil.setOpacity(child, 0);

        return child;
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
        var bound = this.mouseEventDetectorContainer.getBoundingClientRect();
        var seriesPosition = this.positionMap.series;
        var expandSize = this.expandSize;
        var layerPosition = {};
        var maxLeft, minLeft;

        checkLimit = snippet.isUndefined(checkLimit) ? true : checkLimit;

        if (checkLimit) {
            maxLeft = bound.right - expandSize;
            minLeft = bound.left + expandSize;
            clientX = Math.min(Math.max(clientX, minLeft), maxLeft);
        }

        layerPosition.x = clientX - bound.left + seriesPosition.left - chartConst.CHART_PADDING;

        if (!snippet.isUndefined(clientY)) {
            layerPosition.y = clientY - bound.top + seriesPosition.top - chartConst.CHART_PADDING;
        }

        return layerPosition;
    },

    /**
     * Create BoundsBaseCoordinateModel from seriesItemBoundsData for mouse event detector.
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
     * Rerender mouse event detector component.
     * @param {object} data - bounds data and tick count
     */
    rerender: function(data) {
        var tickCount;

        if (data.axisDataMap.xAxis) {
            tickCount = this._pickTickCount(data.axisDataMap);
        }

        this.selectedData = null;
        this._setDataForRendering(data);
        this._renderMouseEventDetectorArea(this.mouseEventDetectorContainer, tickCount);

        this.transparentChild.style.height = renderUtil.getStyle(this.mouseEventDetectorContainer).height;
    },

    /**
     * Rerender, when resizing chart.
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
            groupIndex = this.tickBaseCoordinateModel.findIndex(this.isVertical ? layerX : layerY);
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
     * hide tooltip
     * @private
     * @abstract
     */
    _hideTooltip: function() {},

    /**
     * When mouse event happens,
     * hide MouseEventDetector container so that detect event of series elements
     * and send mouse position data to series component
     * @param {string} eventType - mouse event detector type
     * @param {MouseEvent} e - mouse event
     * @private
     */
    _onMouseEvent: function(eventType, e) {
        dom.addClass(this.mouseEventDetectorContainer, 'hide');
        this.eventBus.fire(eventType + 'Series', {
            left: e.clientX,
            top: e.clientY
        });
        dom.removeClass(this.mouseEventDetectorContainer, 'hide');
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
     * Call 'selectSeries' event, when changed found position data.
     * And call 'unselectSeries' event, when not changed found position data.
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
     * Store client position, when occur mouse move event.
     * @param {MouseEvent} e - mouse event
     * @abstract
     * @private
     */
    _onMousemove: function() {},

    /**
     * Abstract mouseout handler
     * @abstract
     * @private
     */
    _onMouseout: function() {},

    /**
     * Attach mouse event.
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
    },

    /**
     * find data by indexes
     * @abstract
     */
    findDataByIndexes: function() {},

    /**
     * Set prevClientPosition by MouseEvent
     * @param {?MouseEvent} event - mouse event
     */
    _setPrevClientPosition: function(event) {
        if (!event) {
            this.prevClientPosition = null;
        } else {
            this.prevClientPosition = {
                x: event.clientX,
                y: event.clientY
            };
        }
    }
});

snippet.CustomEvents.mixin(MouseEventDetectorBase);

module.exports = MouseEventDetectorBase;
