/**
 * @fileoverview Zoom component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var seriesTemplate = require('./seriesTemplate'),
    chartConst = require('../const'),
    dom = require('../helpers/domHandler'),
    renderUtil = require('../helpers/renderUtil'),
    eventListener = require('../helpers/eventListener');

var Zoom = tui.util.defineClass(/** @lends Zoom.prototype */{
    /**
     * Zoom component.
     * @param {object} params parameters
     *      @param {BoundsMaker} params.boundsMaker bounds maker
     * @constructs Zoom
     */
    init: function(params) {
        this.className = 'tui-chart-zoom-area';

        /**
         * Bounds maker
         * @type {BoundsMaker}
         */
        this.boundsMaker = params.boundsMaker;

        /**
         * Magnification.
         * @type {number}
         */
        this.magn = 1;

        /**
         * Stacked wheelDelta.
         * @type {number}
         */
        this.stackedWheelDelta = 0;
    },

    /**
     * Render.
     * @returns {HTMLElement} zoom container
     */
    render: function() {
        var container = dom.create('DIV', this.className);

        container.innerHTML += seriesTemplate.ZOOM_BUTTONS;
        renderUtil.renderPosition(container, this.boundsMaker.getPosition('series'));
        this._attachEvent(container);

        return container;
    },

    /**
     * Find button element.
     * @param {HTMLElement} target target element.
     * @returns {?HTMLElement} button element
     * @private
     */
    _findBtnElement: function(target) {
        var btnClassName = 'tui-chart-zoom-btn',
            btnElement = target;

        if (!dom.hasClass(target, btnClassName)) {
            btnElement = dom.findParentByClass(target, btnClassName);
        }

        return btnElement;
    },

    /**
     * Zoom
     * @param {number} magn magnification
     * @param {?{left: number, top: number}} position mouse position
     * @private
     */
    _zoom: function(magn, position) {
        var changedMagn = Math.min(Math.max(1, this.magn * magn), chartConst.MAX_ZOOM_MAGN);

        if (changedMagn !== this.magn) {
            this.magn = changedMagn;
            this.fire('zoom', this.magn, position);
        }
    },

    /**
     * On click.
     * @param {MouseEvent} e mouse event
     * @returns {?boolean} prevent default for ie
     * @private
     */
    _onClick: function(e) {
        var target = e.target || e.srcElement,
            btnElement = this._findBtnElement(target),
            magn;

        if (btnElement) {
            magn = parseFloat(btnElement.getAttribute('data-magn'));
            this._zoom(magn);
        }

        if (e.preventDefault) {
            e.preventDefault();
        }

        return false;
    },

    /**
     * Attach event.
     * @param {HTMLElement} target target element
     * @private
     */
    _attachEvent: function(target) {
        eventListener.on(target, 'click', this._onClick, this);
    },

    /**
     * Calculate magnification from wheelDelta.
     * @param {number} wheelDelta wheelDelta
     * @returns {number} magnification
     * @private
     */
    _calculateMagn: function(wheelDelta) {
        var tick = parseInt(wheelDelta / chartConst.WHEEL_TICK, 10),
            magn;

        if (tick > 0) {
            magn = Math.pow(2, tick);
        } else {
            magn = Math.pow(0.5, Math.abs(tick));
        }

        return magn;
    },

    /**
     * On wheel.
     * @param {number} wheelDelta wheelDelta
     * @param {{left: number, top: number}} position mouse position
     */
    onWheel: function(wheelDelta, position) {
        var magn;

        if (Math.abs(wheelDelta) < chartConst.WHEEL_TICK) {
            this.stackedWheelDelta += wheelDelta;
        } else {
            this.stackedWheelDelta = wheelDelta;
        }

        if (Math.abs(this.stackedWheelDelta) < chartConst.WHEEL_TICK) {
            return;
        }

        magn = this._calculateMagn(this.stackedWheelDelta);

        this._zoom(magn, position);

        this.stackedWheelDelta = this.stackedWheelDelta % chartConst.WHEEL_TICK;
    }
});

tui.util.CustomEvents.mixin(Zoom);

module.exports = Zoom;
