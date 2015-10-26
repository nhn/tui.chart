/**
 * @fileoverview TooltipBase is base class of tooltip components.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var dom = require('../helpers/domHandler'),
    renderUtil = require('../helpers/renderUtil'),
    tooltipTemplate = require('./tooltipTemplate');

var TooltipBase = ne.util.defineClass(/** @lends TooltipBase.prototype */ {
    /**
     * TooltipBase is base class of tooltip components.
     * @constructs TooltipBase
     * @param {object} params parameters
     *      @param {array.<number>} params.values converted values
     *      @param {array} params.labels labels
     *      @param {array} params.legendLabels legend labels
     *      @param {object} params.bound axis bound
     *      @param {object} params.theme axis theme
     */
    init: function(params) {
        ne.util.extend(this, params);
        /**
         * className
         * @type {string}
         */
        this.className = 'ne-chart-tooltip-area';

        /**
         * TooltipBase container.
         * @type {HTMLElement}
         */
        this.container = null;

        /**
         * TooltipBase base data.
         * @type {array.<array.<object>>}
         */
        this.data = this.makeTooltipData();

        this.suffix = this.options.suffix ? '&nbsp;' + this.options.suffix : '';
    },

    /**
     * To make tooltip data.
     */
    makeTooltipData: function() {},

    /**
     * Get tooltip layout element.
     * @returns {HTMLElement} layout element
     * @private
     */
    _getTooltipLayoutElement: function() {
        var elLayout = document.getElementById(this.chartId);
        if (!elLayout) {
            elLayout = dom.create('DIV', this.className);
            elLayout.id = this.chartId;
        }
        return elLayout;
    },

    /**
     * Render tooltip.
     * @param {{position: object}} bound tooltip bound
     * @returns {HTMLElement} tooltip element
     */
    render: function() {
        var el = this._getTooltipLayoutElement(),
            bound = this.bound;

        renderUtil.renderPosition(el, bound.position);

        this.elLayout = el;

        return el;
    },

    /**
     * Create tooltip element.
     * @returns {HTMLElement} tooltip element
     * @private
     */
    _createTooltipElement: function() {
        if (!this.elLayout.firstChild) {
            this.elLayout.innerHTML = tooltipTemplate.tplTooltip();
        }
        return this.elLayout.firstChild;
    },

    /**
     * Get tooltip element.
     * @returns {HTMLElement} tooltip element
     * @private
     */
    _getTooltipElement: function() {
        if (!this.elTooltip) {
            this.elTooltip = this._createTooltipElement();
        }
        return this.elTooltip;
    },

    /**
     * onShow is callback of custom event showTooltip for SeriesView.
     * @param {object} params coordinate event parameters
     */
    onShow: function(params) {
        var elTooltip = this._getTooltipElement(),
            prevPosition;
        if (elTooltip.offsetWidth) {
            prevPosition = {
                left: elTooltip.offsetLeft,
                top: elTooltip.offsetTop
            };
        }

        this.showTooltip(elTooltip, params, prevPosition);
    },

    /**
     * Get tooltip dimension
     * @param {HTMLElement} elTooltip tooltip element
     * @returns {{width: number, height: number}} rendered tooltip dimension
     */
    getTooltipDimension: function(elTooltip) {
        return {
            width: elTooltip.offsetWidth,
            height: elTooltip.offsetHeight
        };
    },

    /**
     * Move to Position.
     * @param {HTMLElement} elTooltip tooltip element
     * @param {{left: number, top: number}} position position
     * @param {{left: number, top: number}} prevPosition prev position
     */
    moveToPosition: function(elTooltip, position, prevPosition) {
        if (prevPosition) {
            if (this.activeHider) {
                window.clearInterval(this.activeHider.timerId);
                this.activeHider.setOpacity(1);
            }
            this._slideTooltip(elTooltip, prevPosition, position);
        } else {
            renderUtil.renderPosition(elTooltip, position);
        }
    },

    /**
     * Get slider.
     * @param {HTMLElement} element element
     * @param {string} type slide type (horizontal or vertical)
     * @returns {object} effect object
     * @private
     */
    _getSlider: function(element, type) {
        if (!this.slider) {
            this.slider = {};
        }

        if (!this.slider[type]) {
            this.slider[type] = new ne.component.Effects.Slide({
                flow: type,
                element: element,
                duration: 100
            });
        }
        return this.slider[type];
    },

    /**
     * Slide tooltip
     * @param {HTMLElement} elTooltip tooltip element
     * @param {{left: number, top: number}} prevPosition prev position
     * @param {{left: number, top: number}} position position
     * @private
     */
    _slideTooltip: function(elTooltip, prevPosition, position) {
        var vSlider = this._getSlider(elTooltip, 'vertical'),
            hSlider = this._getSlider(elTooltip, 'horizontal'),
            moveTop = prevPosition.top - position.top,
            moveLeft = prevPosition.left - position.left,
            vDirection = moveTop > 0 ? 'forword' : 'backword',
            hDirection = moveTop > 0 ? 'forword' : 'backword';

        if (moveTop) {
            vSlider.setDistance(moveTop);
            vSlider.action({
                direction: vDirection,
                start: prevPosition.top,
                complete: function() {}
            });
        }

        if (moveLeft) {
            hSlider.setDistance(moveLeft);
            hSlider.action({
                direction: hDirection,
                start: prevPosition.left,
                complete: function() {}
            });
        }
    },

    /**
     * onHide is callback of custom event hideTooltip for SeriesView
     * @param {{id: string}} data tooltip data
     */
    onHide: function() {
        var elTooltip = this._getTooltipElement();
        this.hideTooltip(elTooltip);
    },

    /**
     * Get hider.
     * @param {HTMLElement} element element
     * @returns {object} effect object
     * @private
     */
    _getHider: function(element) {
        if (!this.hider) {
            this.hider = new ne.component.Effects.Fade({
                element: element,
                duration: 100
            });
        }

        return this.hider;
    },

    hideAnimation: function(elTooltip) {
        this.activeHider = this._getHider(elTooltip);
        this.activeHider.action({
            start: 1,
            end: 0,
            complete: function() {
                dom.removeClass(elTooltip, 'show');
                elTooltip.style.cssText = '';
            }
        });
    }
});

ne.util.CustomEvents.mixin(TooltipBase);

module.exports = TooltipBase;
