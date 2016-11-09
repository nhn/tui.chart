/**
 * @fileoverview SimpleCustomEvent is event handle layer for simply sending clientX, clientY.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var CustomEventBase = require('./customEventBase');
var renderUtil = require('../../helpers/renderUtil');

var SimpleCustomEvent = tui.util.defineClass(CustomEventBase, /** @lends SimpleCustomEvent.prototype */ {
    /**
     * SimpleCustomEvent is event handle layer for simply sending clientX, clientY.
     * @constructs SimpleCustomEvent
     * @param {object} params parameters
     *      @param {string} params.chartType - chart type
     * @extends CustomEventBase
     */
    init: function(params) {
        /**
         * chart type
         * @type {string}
         */
        this.chartType = params.chartType;

        /**
         * event bus for transmitting message
         * @type {object}
         */
        this.eventBus = params.eventBus;
    },

    /**
     * Render custom event area
     * @param {HTMLElement} customEventContainer - container element for custom event
     * @private
     */
    _renderCustomEventArea: function(customEventContainer) {
        renderUtil.renderDimension(customEventContainer, this.layout.dimension);
        renderUtil.renderPosition(customEventContainer, this.layout.position);
    },

    /**
     * Initialize data of custom event
     * @override
     */
    onReceiveSeriesData: function() {},

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

module.exports = SimpleCustomEvent;
