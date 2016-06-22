/**
 * @fileoverview CustomEventBase is base class for event handle layers.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var TickBaseCoordinateModel = require('./tickBaseCoordinateModel');
var BoundsBaseCoordinateModel = require('./boundsBaseCoordinateModel');
var chartConst = require('../const');
var eventListener = require('../helpers/eventListener');
var dom = require('../helpers/domHandler');
var renderUtil = require('../helpers/renderUtil');

var CustomEventBase = tui.util.defineClass(/** @lends CustomEventBase.prototype */ {
    /**
     * CustomEventBase is base class for custom event components.
     * @constructs CustomEventBase
     * @param {object} params parameters
     *      @param {{
     *          dimension: {width: number, height: number},
     *          position: {left: number, top: number}
     *      }} params.bound bound
     *      @param {string} params.chartType chart type
     *      @param {boolean} params.isVertical whether vertical or not
     */
    init: function(params) {
        /**
         * type of chart
         * @type {string}
         */
        this.chartType = params.chartType;

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
         * bounds maker
         * @type {BoundsMaker}
         */
        this.boundsMaker = params.boundsMaker;

        /**
         * selected series item.
         * @type {null | object}
         */
        this.selectedData = null;
    },

    /**
     * Render event handle layer area.
     * @param {HTMLElement} customEventContainer - container element for custom event
     * @param {object} data - data for rendering
     * @private
     */
    _renderCustomEventArea: function(customEventContainer, data) {
        var expandedBound, tbcm;

        this.dimension = this.boundsMaker.getDimension('customEvent');
        tbcm = new TickBaseCoordinateModel(this.dimension, data.tickCount, this.chartType, this.isVertical);
        this.tickBaseCoordinateModel = tbcm;
        expandedBound = renderUtil.expandBound(this.boundsMaker.getBound('customEvent'));
        renderUtil.renderDimension(customEventContainer, expandedBound.dimension);
        renderUtil.renderPosition(customEventContainer, expandedBound.position);
    },

    /**
     * Render for customEvent component.
     * @param {object} data - data for rendering
     * @returns {HTMLElement} container for custom event
     */
    render: function(data) {
        var container = dom.create('DIV', 'tui-chart-series-custom-event-area');

        this._renderCustomEventArea(container, data);
        this.attachEvent(container);
        this.customEventContainer = container;
        return container;
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
     * @param {{tickCount: number}} data - data for rerendering
     */
    rerender: function(data) {
        this._renderCustomEventArea(this.customEventContainer, data);
    },

    /**
     * Resize for customEvent component.
     * @param {{tickCount: number}} data - data for resizing
     */
    resize: function(data) {
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
     * @param {HTMLElement} target - target element
     * @param {number} clientX mouse - position x
     * @param {number} clientY mouse - position y
     * @returns {object}
     * @private
     */
    _findDataFromBoundsCoordinateModel: function(target, clientX, clientY) {
        var bound = target.getBoundingClientRect(),
            layerX = clientX - bound.left,
            layerY = clientY - bound.top,
            groupIndex = this.tickBaseCoordinateModel.findIndex(this.isVertical ? layerX : layerY);
        return this.boundsBaseCoordinateModel.findData(groupIndex, layerX + chartConst.SERIES_EXPAND_SIZE, layerY);
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
        var target = e.target || e.srcElement,
            clientX = e.clientX - chartConst.SERIES_EXPAND_SIZE,
            foundData = this._findDataFromBoundsCoordinateModel(target, clientX, e.clientY);
        if (!this._isChangedSelectData(this.selectedData, foundData)) {
            this._unselectSelectedData();
        } else if (foundData) {
            if (this.selectedData) {
                this._unselectSelectedData();
            }
            this.fire(renderUtil.makeCustomEventName('select', foundData.chartType, 'series'), foundData);
            this.selectedData = foundData;
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
     * @private
     * @abstract
     */
    _onMousemove: function() {},

    /**
     * On mouse out
     * @private
     * @abstract
     */
    _onMouseout: function() {},

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
