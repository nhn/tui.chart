/**
 * @fileoverview EventHandleLayerBase is base class for event handle layers.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var event = require('../helpers/eventListener'),
    dom = require('../helpers/domHandler'),
    renderUtil = require('../helpers/renderUtil');

var EventHandleLayerBase = tui.util.defineClass(/** @lends EventHandleLayerBase.prototype */ {
    /**
     * EventHandleLayerBase is base class for event handle layers.
     * @constructs EventHandleLayerBase
     * @param {object} params parameters
     *      @param {{
     *          dimension: {width: number, height: number},
     *          position: {left: number, top: number}
     *      }} params.bound bound
     *      @param {string} params.chartType chart type
     *      @param {boolean} params.isVertical whether vertical or not
     */
    init: function(params) {
        //this.bound = params.bound;
        this.chartType = params.chartType;
        this.isVertical = params.isVertical;
    },

    /**
     * To make coordinate data.
     */
    makeCoordinateData: function() {},

    /**
     * Render.
     * @param {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound bound of event handler layer
     * @param {object} data rendering data
     * @return {HTMLElement} coordinate area
     */
    render: function(bound, data) {
        var elCoordinateArea = dom.create('DIV', 'tui-chart-series-coordinate-area');

        this.bound = bound;
        this.coordinateData = this.makeCoordinateData(bound.dimension, data.tickCount, this.chartType);

        renderUtil.renderDimension(elCoordinateArea, bound.dimension);
        renderUtil.renderPosition(elCoordinateArea, bound.position);

        this.attachEvent(elCoordinateArea);
        return elCoordinateArea;
    },

    /**
     * Find group index.
     * @param {number} pointValue mouse position point value
     * @returns {number} group index
     */
    findIndex: function(pointValue) {
        var foundIndex = -1;
        tui.util.forEachArray(this.coordinateData, function(scale, index) {
            if (scale.min < pointValue && scale.max >= pointValue) {
                foundIndex = index;
                return false;
            }
        });

        return foundIndex;
    },

    /**
     * To make coordinate data abount line type chart.
     * @param {number} width width
     * @param {number} tickCount tick count
     * @returns {array} coordinate data
     */
    makeLineTypeCoordinateData: function(width, tickCount) {
        var tickInterval = width / (tickCount - 1),
            halfInterval = tickInterval / 2;
        return tui.util.map(tui.util.range(0, tickCount), function(index) {
            return {
                min: index * tickInterval - halfInterval,
                max: index * tickInterval + halfInterval
            };
        });
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
        event.bindEvent('mousemove', el, tui.util.bind(this.onMousemove, this));
        event.bindEvent('mouseout', el, tui.util.bind(this.onMouseout, this));
    }
});

tui.util.CustomEvents.mixin(EventHandleLayerBase);

module.exports = EventHandleLayerBase;
