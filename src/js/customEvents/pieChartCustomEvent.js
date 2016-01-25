/**
 * @fileoverview PieChartCustomEvent is event handle layer for pie chart tooltip.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var CustomEventBase = require('./customEventBase'),
    eventListener = require('../helpers/eventListener'),
    dom = require('../helpers/domHandler'),
    renderUtil = require('../helpers/renderUtil');

var PieChartCustomEvent = tui.util.defineClass(CustomEventBase, /** @lends PieChartCustomEvent.prototype */ {
    /**
     * PieChartCustomEvent is event handle layer for pie chart tooltip.
     * @constructs PieChartCustomEvent
     * @extends CustomEventBase
     */
    init: function(params) {
        this.boundsMaker = params.boundsMaker;
    },
    /**
     * Render event handle layer area
     * @param {HTMLElement} customEventContainer custom event container element
     * @param {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound bound of event handler layer
     * @private
     */
    _renderCustomEventArea: function(customEventContainer) {
        var expandedBound = renderUtil.expandBound(this.boundsMaker.getBound('customEvent'));
        renderUtil.renderDimension(customEventContainer, expandedBound.dimension);
        renderUtil.renderPosition(customEventContainer, expandedBound.position);
    },

    /**
     * Initialize data of custom event
     * @override
     */
    initCustomEventData: function() {},

    /**
     * On mouse event.
     * @param {string} eventType custom event type
     * @param {mouseevent} e mouse event
     * @private
     */
    _onMouseEvent: function(eventType, e) {
        dom.addClass(this.customEventContainer, 'hide');
        this.fire(eventType + 'PieSeries', {
            left: e.clientX,
            top: e.clientY
        });
        dom.removeClass(this.customEventContainer, 'hide');
    },

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
