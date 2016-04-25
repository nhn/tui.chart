/**
 * @fileoverview SimpleCustomEvent is event handle layer for simply sending clientX, clientY.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var CustomEventBase = require('./customEventBase'),
    renderUtil = require('../helpers/renderUtil');

var SimpleCustomEvent = tui.util.defineClass(CustomEventBase, /** @lends SimpleCustomEvent.prototype */ {
    /**
     * SimpleCustomEvent is event handle layer for simply sending clientX, clientY.
     * @constructs SimpleCustomEvent
     * @param {object} params parameters
     *      @param {BoundsMaker} params.boundsMaker - bounds maker instance
     *      @param {string} params.chartType - chart type
     * @extends CustomEventBase
     */
    init: function(params) {
        this.boundsMaker = params.boundsMaker;
        this.chartType = params.chartType;
    },

    /**
     * Render event handle layer area
     * @param {HTMLElement} customEventContainer - container element for custom event
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
     * @param {MouseEvent} e - mouse event
     * @private
     * @override
     */
    _onClick: function(e) {
        this._onMouseEvent('click', e);
    },

    /**
     * On mouse move.
     * @param {MouseEvent} e - mouse event
     * @private
     * @override
     */
    _onMousemove: function(e) {
        this._onMouseEvent('move', e);
    },

    /**
     * On mouse out.
     * @param {MouseEvent} e - mouse event
     * @private
     * @override
     */
    _onMouseout: function(e) {
        this._onMouseEvent('move', e);
    }
});

tui.util.CustomEvents.mixin(SimpleCustomEvent);

module.exports = SimpleCustomEvent;
