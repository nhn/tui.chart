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
     *      @param {Array.<number>} params.values converted values
     *      @param {BoundsMaker} params.boundsMaker bounds maker
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

        /**
         * TooltipBase base data.
         * @type {Array.<Array.<object>>}
         */
        this.data = [];

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
     * @private
     * @abstract
     */
    _makeTooltipData: function() {},

    /**
     * Render tooltip component.
     * @returns {HTMLElement} tooltip element
     */
    render: function() {
        var el = dom.create('DIV', this.className);

        this.data = this._makeTooltipData();

        renderUtil.renderPosition(el, this.boundsMaker.getPosition('tooltip'));

        this.tooltipContainer = el;

        return el;
    },

    /**
     * Rerender.
     */
    rerender: function() {
        this.data = this._makeTooltipData();
        if (this.positionModel) {
            this.positionModel.updateBound(this.boundsMaker.getBound('tooltip'));
        }
    },

    /**
     * Resize tooltip component.
     * @override
     */
    resize: function() {
        renderUtil.renderPosition(this.tooltipContainer, this.boundsMaker.getPosition('tooltip'));
        if (this.positionModel) {
            this.positionModel.updateBound(this.boundsMaker.getBound('tooltip'));
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

        if (!predicate.isMousePositionChart(params.chartType) && tooltipElement.offsetWidth) {
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
