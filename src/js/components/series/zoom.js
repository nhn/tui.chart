/**
 * @fileoverview Zoom component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var snippet = require('tui-code-snippet');
var IS_MSIE_VERSION_LTE_THAN_8 = snippet.browser.msie && snippet.browser.version <= 8;

var seriesTemplate = require('./seriesTemplate');
var chartConst = require('../../const');
var dom = require('../../helpers/domHandler');
var renderUtil = require('../../helpers/renderUtil');
var eventListener = require('../../helpers/eventListener');

var Zoom = snippet.defineClass(/** @lends Zoom.prototype */{
    /**
     * zoom component className
     * @type {string}
     */
    className: 'tui-chart-zoom-area',
    /**
     * Zoom component.
     * @param {{eventBus: object}} params - parameters
     * @constructs Zoom
     * @private
     */
    init: function(params) {
        /**
         * event bus for transmitting message
         * @type {object}
         */
        this.eventBus = params.eventBus;

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

        this.drawingType = chartConst.COMPONENT_TYPE_DOM;

        this._attachToEventBus();
    },

    /**
     * Attach to event bus.
     * @private
     */
    _attachToEventBus: function() {
        this.eventBus.on('wheel', this.onWheel, this);
    },

    /**
     * Render.
     * @param {{positionMap: {series: {left: number, top: number}}}} data - data for rendering
     * @returns {HTMLElement} zoom container
     */
    render: function(data) {
        var container;

        if (!IS_MSIE_VERSION_LTE_THAN_8) {
            container = dom.create('DIV', this.className);

            container.innerHTML += seriesTemplate.ZOOM_BUTTONS;
            renderUtil.renderPosition(container, data.positionMap.series);
            this._attachEvent(container);
        }

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
        this.eventBus.fire('zoomMap', magn, position);
    },

    /**
     * On click.
     * @param {MouseEvent} e mouse event
     * @returns {?boolean} prevent default for ie
     * @private
     */
    _onClick: function(e) {
        var target = e.target || e.srcElement;
        var btnElement = this._findBtnElement(target);
        var zoomDirection = btnElement.getAttribute('data-magn');
        var magn = this._calculateMagn(zoomDirection);

        if (magn > 5) {
            this.magn = 5;
        } else if (magn < 1) {
            this.magn = 1;
        } else if (magn >= 1) {
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
     * Calculate magnification from zoomDirection.
     * @param {number} zoomDirection zoomDirection (positive is zoomIn)
     * @returns {number} magnification
     * @private
     */
    _calculateMagn: function(zoomDirection) {
        if (zoomDirection > 0) {
            this.magn += 0.1;
        } else if (zoomDirection < 0) {
            this.magn -= 0.1;
        }

        return this.magn;
    },

    /**
     * On wheel.
     * @param {number} wheelDelta wheelDelta
     * @param {{left: number, top: number}} position mouse position
     */
    onWheel: function(wheelDelta, position) {
        var magn = this._calculateMagn(wheelDelta);

        if (magn > 5) {
            this.magn = 5;
        } else if (magn < 1) {
            this.magn = 1;
        } else if (magn >= 1) {
            this._zoom(magn, position);
        }
    }
});

function zoomFactory(params) {
    return new Zoom(params);
}

zoomFactory.componentType = 'zoom';

module.exports = zoomFactory;
