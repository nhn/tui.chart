/**
 * @fileoverview TooltipBase is base class of tooltip components.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    dom = require('../helpers/domHandler'),
    predicate = require('../helpers/predicate'),
    renderUtil = require('../helpers/renderUtil');

var TooltipBase = tui.util.defineClass(/** @lends TooltipBase.prototype */ {
    /**
     * TooltipBase is base class of tooltip components.
     * @constructs TooltipBase
     * @param {object} params parameters
     *      @param {array.<number>} params.values converted values
     *      @param {object} params.bound axis bound
     *      @param {object} params.theme axis theme
     */
    init: function(params) {
        tui.util.extend(this, params);
        /**
         * className
         * @type {string}
         */
        this.className = 'tui-chart-tooltip-area';

        /**
         * Tooltip container.
         * @type {HTMLElement}
         */
        this.tooltipContainer = null;

        /**
         * TooltipBase base data.
         * @type {array.<array.<object>>}
         */
        this.data = this.makeTooltipData();

        /**
         * Tooltip suffix.
         * @type {string}
         */
        this.suffix = this.options.suffix ? '&nbsp;' + this.options.suffix : '';

        /**
         * Tooltip template function.
         * @type {function}
         */
        this.templateFunc = this.options.template || tui.util.bind(this._makeTooltipHtml, this);

        /**
         * Tooltip animation time.
         * @type {number}
         */
        this.animationTime = predicate.isPieChart(params.chartType) ? chartConst.TOOLTIP_PIE_ANIMATION_TIME : chartConst.TOOLTIP_ANIMATION_TIME;

        this._setDefaultTooltipPositionOption();
        this._saveOriginalPositionOptions();
    },

    /**
     * Make tooltip html.
     * @private
     * @abstract
     */
    _makeTooltipHtml: function() {},

    /**
     * Set default align option of tooltip.
     * @private
     * @abstract
     */
    _setDefaultTooltipPositionOption: function() {},

    /**
     * Save position options.
     * @private
     */
    _saveOriginalPositionOptions: function() {
        this.orgPositionOptions = {
            align: this.options.align,
            position: this.options.position
        };
    },

    /**
     * Make tooltip data.
     * @abstract
     */
    makeTooltipData: function() {},

    /**
     * Render tooltip component.
     * @param {{position: object}} bound tooltip bound
     * @param {?{seriesPosition: {left: number, top: number}}} data rendering data
     * @returns {HTMLElement} tooltip element
     */
    render: function(bound, data) {
        var el = dom.create('DIV', this.className);

        renderUtil.renderPosition(el, bound.position);

        this.bound = bound;
        this.chartDimension = data.chartDimension;
        this.tooltipContainer = el;

        return el;
    },

    /**
     * Rerender.
     * @param {{position: object}} bound tooltip bound
     * @param {?{seriesPosition: {left: number, top: number}}} data rendering data
     */
    rerender: function(bound, data) {
        this.bound = bound;
        tui.util.extend(this, data);
        this.data = this.makeTooltipData();
        if (this.positionModel) {
            this.positionModel.updateBound(bound);
        }
    },

    /**
     * Resize tooltip component.
     * @param {{position: object}} bound tooltip bound
     * @param {{chartDimension: object}} data data for resize
     * @override
     */
    resize: function(bound, data) {
        this.bound = bound;
        this.chartDimension = data.chartDimension;
        renderUtil.renderPosition(this.tooltipContainer, bound.position);
        if (this.positionModel) {
            this.positionModel.updateBound(bound);
        }
    },

    /**
     * Get tooltip element.
     * @returns {HTMLElement} tooltip element
     * @private
     */
    _getTooltipElement: function() {
        var tooltipElement;

        if (!this.tooltipElement) {
            this.tooltipElement = tooltipElement = dom.create('DIV', 'tui-chart-tooltip');
            dom.append(this.tooltipContainer, tooltipElement);
        }

        return this.tooltipElement;
    },

    /**
     * onShow is callback of custom event showTooltip for SeriesView.
     * @param {object} params coordinate event parameters
     */
    onShow: function(params) {
        var tooltipElement = this._getTooltipElement(),
            prevPosition;

        if (tooltipElement.offsetWidth) {
            prevPosition = {
                left: tooltipElement.offsetLeft,
                top: tooltipElement.offsetTop
            };
        }

        this.showTooltip(tooltipElement, params, prevPosition);
    },

    /**
     * Get tooltip dimension
     * @param {HTMLElement} tooltipElement tooltip element
     * @returns {{width: number, height: number}} rendered tooltip dimension
     */
    getTooltipDimension: function(tooltipElement) {
        return {
            width: tooltipElement.offsetWidth,
            height: tooltipElement.offsetHeight
        };
    },

    /**
     * Move to Position.
     * @param {HTMLElement} tooltipElement tooltip element
     * @param {{left: number, top: number}} position position
     * @param {{left: number, top: number}} prevPosition prev position
     */
    moveToPosition: function(tooltipElement, position, prevPosition) {
        if (prevPosition) {
            this._slideTooltip(tooltipElement, prevPosition, position);
        } else {
            renderUtil.renderPosition(tooltipElement, position);
        }
    },

    /**
     * Slide tooltip
     * @param {HTMLElement} tooltipElement tooltip element
     * @param {{left: number, top: number}} prevPosition prev position
     * @param {{left: number, top: number}} position position
     * @private
     */
    _slideTooltip: function(tooltipElement, prevPosition, position) {
        var moveTop = position.top - prevPosition.top,
            moveLeft = position.left - prevPosition.left;

        renderUtil.cancelAnimation(this.slidingAnimation);

        this.slidingAnimation = renderUtil.startAnimation(this.animationTime, function(ratio) {
            var left = moveLeft * ratio,
                top = moveTop * ratio;
            tooltipElement.style.left = (prevPosition.left + left) + 'px';
            tooltipElement.style.top = (prevPosition.top + top) + 'px';
        });
    },

    /**
     * onHide is callback of custom event hideTooltip for SeriesView
     * @param {number} index index
     */
    onHide: function(index) {
        var tooltipElement = this._getTooltipElement();

        this.hideTooltip(tooltipElement, index);
    },

    /**
     * Get hider.
     * @param {HTMLElement} element element
     * @returns {object} effect object
     * @private
     */
    _getHider: function(element) {
        if (!this.hider) {
            this.hider = new tui.component.Effects.Fade({
                element: element,
                duration: 50
            });
        }

        return this.hider;
    },

    /**
     * Hide animation.
     * @param {HTMLElement} tooltipElement tooltip element
     */
    hideAnimation: function(tooltipElement) {
        dom.removeClass(tooltipElement, 'show');
        tooltipElement.style.cssText = '';
        return;
        var that = this;
        this.activeHider = this._getHider(tooltipElement);
        this.activeHider.action({
            start: 1,
            end: 0,
            complete: function() {
                dom.removeClass(tooltipElement, 'show');
                tooltipElement.style.cssText = '';
                delete that.activeHider;
            }
        });
    },

    /**
     * Set tooltip align option.
     * @param {string} align align
     */
    setAlign: function(align) {
        this.options.align = align;
        if (this.positionModel) {
            this.positionModel.updateOptions(this.options);
        }
    },

    /**
     * Set position option.
     * @param {{left: number, top: number}} position moving position
     */
    setPosition: function(position) {
        this.options.position = tui.util.extend({}, this.options.position, position);
        if (this.positionModel) {
            this.positionModel.updateOptions(this.options);
        }
    },

    /**
     * Reset tooltip align option.
     */
    resetAlign: function() {
        var align = this.orgPositionOptions.align;

        this.options.align = align;
        if (this.positionModel) {
            this.positionModel.updateOptions(this.options);
        }
    },

    /**
     * Reset tooltip position.
     */
    resetPosition: function() {
        var position = this.orgPositionOptions.position;

        this.options.position = position;
        if (this.positionModel) {
            this.positionModel.updateOptions(this.options);
        }
    }
});

tui.util.CustomEvents.mixin(TooltipBase);

module.exports = TooltipBase;
