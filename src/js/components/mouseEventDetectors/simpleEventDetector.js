/**
 * @fileoverview SimpleEventDetector is event handle layer for simply sending clientX, clientY.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var MouseEventDetectorBase = require('./mouseEventDetectorBase');
var renderUtil = require('../../helpers/renderUtil');

var SimpleEventDetector = tui.util.defineClass(MouseEventDetectorBase, /** @lends SimpleEventDetector.prototype */ {
    /**
     * SimpleEventDetector is event handle layer for simply sending clientX, clientY.
     * @constructs SimpleEventDetector
     * @param {object} params parameters
     *      @param {string} params.chartType - chart type
     * @extends MouseEventDetectorBase
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
     * Render mouse event detector area
     * @param {HTMLElement} mouseEventDetectorContainer - container element for mouse event detector
     * @private
     */
    _renderMouseEventDetectorArea: function(mouseEventDetectorContainer) {
        renderUtil.renderDimension(mouseEventDetectorContainer, this.layout.dimension);
        renderUtil.renderPosition(mouseEventDetectorContainer, this.layout.position);
    },

    /**
     * Initialize data of mouse event detector
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

module.exports = SimpleEventDetector;
