/**
 * @fileoverview CustomEventBase is base class for event handle layers.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var eventListener = require('../helpers/eventListener'),
    TickBaseDataModel = require('./tickBaseDataModel'),
    PointTypeDataModel = require('./pointTypeDataModel'),
    chartConst = require('../const'),
    dom = require('../helpers/domHandler'),
    renderUtil = require('../helpers/renderUtil');

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
        this.chartType = params.chartType;
        this.isVertical = params.isVertical;
        this.dataProcessor = params.dataProcessor;
        this.boundsMaker = params.boundsMaker;
    },

    /**
     * Render event handle layer area
     * @param {HTMLElement} customEventContainer custom event container element
     * @param {object} data rendering data
     * @private
     */
    _renderCustomEventArea: function(customEventContainer, data) {
        var expandedBound;

        this.dimension = this.boundsMaker.getDimension('customEvent');
        this.tickBaseDataModel = new TickBaseDataModel(this.dimension, data.tickCount, this.chartType, this.isVertical);
        expandedBound = renderUtil.expandBound(this.boundsMaker.getBound('customEvent'));
        renderUtil.renderDimension(customEventContainer, expandedBound.dimension);
        renderUtil.renderPosition(customEventContainer, expandedBound.position);
    },

    /**
     * Render event handle layer component.
     * @param {object} data rendering data
     * @returns {HTMLElement} coordinate area
     */
    render: function(data) {
        var el = dom.create('DIV', 'tui-chart-series-custom-event-area');

        this._renderCustomEventArea(el, data);
        this.attachEvent(el);
        this.customEventContainer = el;
        return el;
    },

    /**
     * Initialize data of custom event
     * @param {Array.<object>} seriesInfos series infos
     */
    initCustomEventData: function(seriesInfos) {
        this.pointTypeDataModel = new PointTypeDataModel(seriesInfos);
    },

    /**
     * Render.
     * @param {{tickCount: number}} data data
     */
    rerender: function(data) {
        this._renderCustomEventArea(this.customEventContainer, data);
    },

    /**
     * Resize event handle layer component.
     * @param {{tickCount: number}} data data
     */
    resize: function(data) {
        this.rerender(data);
    },

    /**
     * Whether changed or not.
     * @param {object} prev previous data
     * @param {object} cur current data
     * @returns {boolean} whether changed or not
     * @private
     */
    _isChanged: function(prev, cur) {
        return !prev || !cur || prev.chartType !== cur.chartType ||
            prev.indexes.groupIndex !== cur.indexes.groupIndex || prev.indexes.index !== cur.indexes.index;
    },

    /**
     * Find point type data.
     * @param {HTMLElement} elTarget target element
     * @param {number} clientX mouse position x
     * @param {number} clientY mouse position y
     * @returns {object} found data
     * @private
     */
    _findPointTypeData: function(elTarget, clientX, clientY) {
        var bound = elTarget.getBoundingClientRect(),
            layerX = clientX - bound.left,
            layerY = clientY - bound.top,
            groupIndex = this.tickBaseDataModel.findIndex(this.isVertical ? layerX : layerY);
        return this.pointTypeDataModel.findData(groupIndex, layerX + chartConst.SERIES_EXPAND_SIZE, layerY);
    },

    /**
     * Unselect selected data.
     * @private
     */
    _unselectSelectedData: function() {
        var eventName = renderUtil.makeCustomEventName('unselect', this.selectedData.chartType, 'series');
        this.fire(eventName, this.selectedData);
        delete this.selectedData;
    },

    /**
     * On mouse event.
     * @param {string} eventType custom event type
     * @param {mouseevent} e mouse event
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
     * @param {mouseevent} e mouse event
     * @private
     */
    _onClick: function(e) {
        var elTarget = e.target || e.srcElement,
            clientX = e.clientX - chartConst.SERIES_EXPAND_SIZE,
            foundData = this._findPointTypeData(elTarget, clientX, e.clientY);
        if (!this._isChanged(this.selectedData, foundData)) {
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
     * @param {HTMLElement} el target element
     */
    attachEvent: function(el) {
        eventListener.bindEvent('click', el, tui.util.bind(this._onClick, this));
        eventListener.bindEvent('mousedown', el, tui.util.bind(this._onMousedown, this));
        eventListener.bindEvent('mouseup', el, tui.util.bind(this._onMouseup, this));
        eventListener.bindEvent('mousemove', el, tui.util.bind(this._onMousemove, this));
        eventListener.bindEvent('mouseout', el, tui.util.bind(this._onMouseout, this));
    }
});

tui.util.CustomEvents.mixin(CustomEventBase);

module.exports = CustomEventBase;
