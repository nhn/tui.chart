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
    },

    /**
     * Render event handle layer area
     * @param {HTMLElement} customEventContainer custom event container element
     * @param {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound bound of event handler layer
     * @param {object} data rendering data
     * @private
     */
    _renderCustomEventArea: function(customEventContainer, bound, data) {
        var expandedBound;
        this.bound = bound;
        this.tickBaseDataModel = new TickBaseDataModel(bound.dimension, data.tickCount, this.chartType, this.isVertical);
        expandedBound = renderUtil.expandBound(bound);
        renderUtil.renderDimension(customEventContainer, expandedBound.dimension);
        renderUtil.renderPosition(customEventContainer, expandedBound.position);
    },

    /**
     * Render event handle layer component.
     * @param {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound bound of event handler layer
     * @param {object} data rendering data
     * @return {HTMLElement} coordinate area
     */
    render: function(bound, data) {
        var el = dom.create('DIV', 'tui-chart-series-custom-event-area');

        this._renderCustomEventArea(el, bound, data);
        this.attachEvent(el);
        this.customEventContainer = el;
        return el;
    },

    /**
     * Initialize data of custom event
     * @param {array.<object>} seriesInfos series infos
     */
    initCustomEventData: function(seriesInfos) {
        this.pointTypeDataModel = new PointTypeDataModel(seriesInfos);
    },

    /**
     * Resize event handle layer component.
     * @param {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound bound for resizable
     * @param {{tickCount: number}} data data
     */
    resize: function(bound, data) {
        this._renderCustomEventArea(this.customEventContainer, bound, data);
    },

    reRender: function(bound, data) {
        this.resize(bound, data);
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
        eventListener.bindEvent('mousemove', el, tui.util.bind(this._onMousemove, this));
        eventListener.bindEvent('mouseout', el, tui.util.bind(this._onMouseout, this));
    }
});

tui.util.CustomEvents.mixin(CustomEventBase);

module.exports = CustomEventBase;
