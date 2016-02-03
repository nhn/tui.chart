/**
 * @fileoverview PieChartCustomEvent is event handle layer for pie chart tooltip.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var CustomEventBase = require('./customEventBase'),
    renderUtil = require('../helpers/renderUtil');

var PieChartCustomEvent = tui.util.defineClass(CustomEventBase, /** @lends PieChartCustomEvent.prototype */ {
    /**
     * PieChartCustomEvent is event handle layer for pie chart tooltip.
     * @constructs PieChartCustomEvent
     * @param {object} params parameters
     *      @param {BoundsMaker} params.boundsMaker bounds maker instance
     *      @param {string} parmas.chartType chart type
     * @extends CustomEventBase
     */
    init: function(params) {
        this.boundsMaker = params.boundsMaker;
        this.chartType = params.chartType;
    },
    /**
     * Render event handle layer area
     * @param {HTMLElement} customEventContainer custom event container element
     * @param {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound bound of event handler layer
     * @private
     */
    _renderCustomEventArea: function(customEventContainer) {
        var bound = this.boundsMaker.getBound('customEvent');
        renderUtil.renderDimension(customEventContainer, bound.dimension);
        renderUtil.renderPosition(customEventContainer, bound.position);
    },

    /**
     * Initialize data of custom event
     * @override
     */
    initCustomEventData: function() {},

    /**
     * On click.
     * @param {mouseevent} e mouse event
     * @private
     * @override
     */
    _onClick: function(e) {
        this._onMouseEvent('click', e);
    },

    /**
     * On mouse move.
     * @param {mouseevent} e mouse event
     * @private
     * @override
     */
    _onMousemove: function(e) {
        this._onMouseEvent('move', e);
    }
});

tui.util.CustomEvents.mixin(PieChartCustomEvent);

module.exports = PieChartCustomEvent;
