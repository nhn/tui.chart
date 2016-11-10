/**
 * @fileoverview MapChartCustomEvent is event handle layer for map chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var CustomEventBase = require('./customEventBase');
var chartConst = require('../../const');
var eventListener = require('../../helpers/eventListener');
var dom = require('../../helpers/domHandler');
var renderUtil = require('../../helpers/renderUtil');

var MapChartCustomEvent = tui.util.defineClass(CustomEventBase, /** @lends MapChartCustomEvent.prototype */ {
    /**
     * MapChartCustomEvent is event handle layer for map chart.
     * @param {object} params parameters
     *      @param {string} params.chartType - chart type
     * @constructs MapChartCustomEvent
     * @extends CustomEventBase
     */
    init: function(params) {
        /**
         * chart type
         * {string}
         *
         */
        this.chartType = params.chartType;

        /**
         * event bus for transmitting message
         * @type {object}
         */
        this.eventBus = params.eventBus;

        /**
         * whether mouse down or not
         * @type {boolean}
         */
        this.isDown = false;
    },

    /**
     * Render event handle layer area
     * @param {HTMLElement} customEventContainer custom event container element
     * @private
     */
    _renderCustomEventArea: function(customEventContainer) {
        renderUtil.renderDimension(customEventContainer, this.layout.dimension);
        renderUtil.renderPosition(customEventContainer, this.layout.position);
    },

    /**
     * On click.
     * @private
     * @override
     */
    _onClick: function() {},

    /**
     * Call 'dragStartMapSeries' event, when occur mouse down event.
     * @param {mouseevent} e mouse event
     * @private
     * @override
     */
    _onMousedown: function(e) {
        this.isDown = true;
        this.eventBus.fire('dragStartMapSeries', {
            left: e.clientX,
            top: e.clientY
        });
    },

    /**
     * Drag end.
     * @private
     */
    _dragEnd: function() {
        this.isDrag = false;
        dom.removeClass(this.customEventContainer, 'drag');
        this.eventBus.fire('dragEndMapSeries');
    },

    /**
     * If drag, call dragEnd function.
     * But if not drag, occur click event.
     * @param {mouseevent} e mouse event
     * @private
     * @override
     */
    _onMouseup: function(e) {
        this.isDown = false;

        if (this.isDrag) {
            this._dragEnd();
        } else {
            this._onMouseEvent('click', e);
        }

        this.isMove = false;
    },

    /**
     * If mouse downed, set drag mode.
     * But if not downed, set move mode.
     * @param {mouseevent} e mouse event
     * @private
     * @override
     */
    _onMousemove: function(e) {
        if (this.isDown) {
            if (!this.isDrag) {
                dom.addClass(this.customEventContainer, 'drag');
            }
            this.isDrag = true;
            this.eventBus.fire('dragMapSeries', {
                left: e.clientX,
                top: e.clientY
            });
        } else {
            this.isMove = true;
            this._onMouseEvent('move', e);
        }
    },

    /**
     * If drag mode, call dragEnd.
     * But if not drag mode, occur move event.
     * @private
     * @override
     */
    _onMouseout: function(e) {
        if (this.isDrag) {
            this._dragEnd();
        } else {
            this._onMouseEvent('move', e);
        }
        this.isDown = false;
    },

    /**
     * On mouse wheel.
     * @param {mouseevent} e mouse event
     * @returns {?boolean}
     * @private
     */
    _onMousewheel: function(e) {
        var wheelDelta = e.wheelDelta || e.detail * chartConst.FF_WHEELDELTA_ADJUSTING_VALUE;

        this.eventBus.fire('wheel', wheelDelta, {
            left: e.clientX,
            top: e.clientY
        });

        if (e.preventDefault) {
            e.preventDefault();
        }

        return false;
    },

    /**
     * Attach event.
     * @param {HTMLElement} target target element
     * @override
     */
    attachEvent: function(target) {
        CustomEventBase.prototype.attachEvent.call(this, target);

        if (tui.util.browser.firefox) {
            eventListener.on(target, 'DOMMouseScroll', this._onMousewheel, this);
        } else {
            eventListener.on(target, 'mousewheel', this._onMousewheel, this);
        }
    }
});

module.exports = MapChartCustomEvent;
