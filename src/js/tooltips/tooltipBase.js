/**
 * @fileoverview TooltipBase is base class of tooltip components.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var dom = require('../helpers/domHandler'),
    renderUtil = require('../helpers/renderUtil');

var TooltipBase = tui.util.defineClass(/** @lends TooltipBase.prototype */ {
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


        this.suffix = this.options.suffix ? '&nbsp;' + this.options.suffix : '';

        this._setDefaultTooltipPositionOption();
        this._saveOriginalPositionOptions();
    },

    /**
     * Set default align option of tooltip.
     * @private
     * @abstract
     */
    _setDefaultTooltipPositionOption: function() {},

    /**
     * To save position options.
     * @private
     */
    _saveOriginalPositionOptions: function() {
        this.orgPositionOptions = {
            align: this.options.align,
            position: this.options.position
        };
    },

    /**
     * To make tooltip data.
     * @abstract
     */
    makeTooltipData: function() {},

    /**
     * To render tooltip component.
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
     * To resize tooltip component.
     * @param {{position: object}} bound tooltip bound
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
     * Cancel hide tooltip.
     * @private
     */
    _cancelHide: function() {
        if (!this.activeHider) {
            return;
        }
        clearInterval(this.activeHider.timerId);
        this.activeHider.setOpacity(1);
    },

    /**
     * Cancel slide tooltip.
     * @private
     */
    _cancelSlide: function() {
        if (!this.activeSliders) {
            return;
        }

        tui.util.forEach(this.activeSliders, function(slider) {
            clearInterval(slider.timerId);
        });

        this._completeSlide();
    },

    /**
     * Move to Position.
     * @param {HTMLElement} tooltipElement tooltip element
     * @param {{left: number, top: number}} position position
     * @param {{left: number, top: number}} prevPosition prev position
     */
    moveToPosition: function(tooltipElement, position, prevPosition) {
        if (prevPosition) {
            this._cancelHide();
            this._cancelSlide();
            this._slideTooltip(tooltipElement, prevPosition, position);
        } else {
            renderUtil.renderPosition(tooltipElement, position);
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
            this.slider[type] = new tui.component.Effects.Slide({
                flow: type,
                element: element,
                duration: 100
            });
        }

        return this.slider[type];
    },

    /**
     * Complete slide tooltip.
     * @private
     */
    _completeSlide: function() {
        delete this.activeSliders;
    },

    /**
     * Slide tooltip
     * @param {HTMLElement} tooltipElement tooltip element
     * @param {{left: number, top: number}} prevPosition prev position
     * @param {{left: number, top: number}} position position
     * @private
     */
    _slideTooltip: function(tooltipElement, prevPosition, position) {
        var vSlider = this._getSlider(tooltipElement, 'vertical'),
            hSlider = this._getSlider(tooltipElement, 'horizontal'),
            moveTop = prevPosition.top - position.top,
            moveLeft = prevPosition.left - position.left,
            vDirection = moveTop > 0 ? 'forword' : 'backword',
            hDirection = moveTop > 0 ? 'forword' : 'backword',
            activeSliders = [],
            complate = tui.util.bind(this._completeSlide, this);

        if (moveTop) {
            vSlider.setDistance(moveTop);
            vSlider.action({
                direction: vDirection,
                start: prevPosition.top,
                complete: complate
            });
            activeSliders.push(vSlider);
        }

        if (moveLeft) {
            hSlider.setDistance(moveLeft);
            hSlider.action({
                direction: hDirection,
                start: prevPosition.left,
                complete: complate
            });
            activeSliders.push(vSlider);
        }

        if (activeSliders.length) {
            this.activeSliders = activeSliders;
        }
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
                duration: 100
            });
        }

        return this.hider;
    },

    /**
     * To hide animation.
     * @param {HTMLElement} tooltipElement tooltip element
     */
    hideAnimation: function(tooltipElement) {
        this.activeHider = this._getHider(tooltipElement);
        this.activeHider.action({
            start: 1,
            end: 0,
            complete: function() {
                dom.removeClass(tooltipElement, 'show');
                tooltipElement.style.cssText = '';
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
