/**
 * @fileoverview Zoom component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var seriesTemplate = require('./seriesTemplate'),
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
     * On click.
     * @param {MouseEvent} e mouse event
     * @returns {?boolean} prevent default for ie
     * @private
     */
    _onClick: function(e) {
        var target = e.target || e.srcElement,
            btnElement = this._findBtnElement(target),
            changedMagn = 0,
            magn;

        if (btnElement) {
            magn = parseFloat(btnElement.getAttribute('data-magn'));
            changedMagn = this.magn * magn;
        }

        if (changedMagn >= 1) {
            this.magn = changedMagn;
            this.fire('zoom', this.magn);
        }

        if (e.preventDefault) {
            e.preventDefault();
        } else {
            return false;
        }
    },

    /**
     * Attach event.
     * @param {HTMLElement} container container
     * @private
     */
    _attachEvent: function(container) {
        eventListener.bindEvent('click', container, tui.util.bind(this._onClick, this));
    }
});

tui.util.CustomEvents.mixin(Zoom);

module.exports = Zoom;
