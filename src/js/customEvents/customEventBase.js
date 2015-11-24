/**
 * @fileoverview CustomEventBase is base class for event handle layers.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var eventListener = require('../helpers/eventListener'),
    TickBaseDataModel = require('./tickBaseDataModel'),
    PointTypeDataModel = require('./pointTypeDataModel'),
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
     * To render event handle layer area
     * @param {HTMLElement} elCoordinateArea coordinate area element
     * @param {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound bound of event handler layer
     * @param {object} data rendering data
     * @private
     */
    _renderCoordinateArea: function(elCoordinateArea, bound, data) {
        this.bound = bound;
        this.tickBaseDataModel = new TickBaseDataModel(bound.dimension, data.tickCount, this.chartType, this.isVertical);
        renderUtil.renderDimension(elCoordinateArea, bound.dimension);
        renderUtil.renderPosition(elCoordinateArea, bound.position);
    },

    /**
     * To render event handle layer component.
     * @param {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound bound of event handler layer
     * @param {object} data rendering data
     * @return {HTMLElement} coordinate area
     */
    render: function(bound, data) {
        var el = dom.create('DIV', 'tui-chart-series-coordinate-area');

        this._renderCoordinateArea(el, bound, data);
        this.attachEvent(el);
        this.elCoordinateArea = el;
        return el;
    },

    initCustomEventData: function(seriesInfos) {
        this.pointTypeDataModel = new PointTypeDataModel(seriesInfos);
    },

    /**
     * To resize event handle layer component.
     * @param {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound bound for resizable
     * @param {{tickCount: number}} data data
     */
    resize: function(bound, data) {
        this._renderCoordinateArea(this.elCoordinateArea, bound, data);
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
            prev.indexes.groupIndex !== cur.indexes.index || prev.indexes.index !== cur.indexes.index;
    },

    /**
     * On mouse move
     * @abstract
     */
    onMousemove: function() {},

    /**
     * On mouse out
     * @abstract
     */
    onMouseout: function() {},

    /**
     * Attach event
     * @param {HTMLElement} el target element
     */
    attachEvent: function(el) {
        eventListener.bindEvent('mousemove', el, tui.util.bind(this.onMousemove, this));
        eventListener.bindEvent('mouseout', el, tui.util.bind(this.onMouseout, this));
    }
});

tui.util.CustomEvents.mixin(CustomEventBase);

module.exports = CustomEventBase;
