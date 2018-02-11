/**
 * @fileoverview TooltipBase is base class of tooltip components.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var snippet = require('tui-code-snippet');
var chartConst = require('../../const'),
    dom = require('../../helpers/domHandler'),
    predicate = require('../../helpers/predicate'),
    renderUtil = require('../../helpers/renderUtil');

var TooltipBase = snippet.defineClass(/** @lends TooltipBase.prototype */ {
    /**
     * TooltipBase is base class of tooltip components.
     * @constructs TooltipBase
     * @private
     * @param {object} params - parameters
     *      @param {string} params.chartType - chart type
     *      @param {Array.<string>} params.chartTypes - chart types
     *      @param {DataProcessor} params.dataProcessor - DataProcessor instance
     *      @param {object} params.options - tooltip options
     *      @param {object} params.theme - tooltip theme
     *      @param {boolean} params.isVertical - whether vertical or not
     *      @param {object} params.eventBus - snippet.CustomEvents instance
     *      @param {object} params.labelTheme - theme for label
     *      @param {string} params.xAxisType - xAxis type
     *      @param {string} params.dateFormat - date format
     *      @param {object} params.labelFormatter - label formatter function
     */
    init: function(params) {
        var isPieChart = predicate.isPieChart(params.chartType);

        /**
         * Chart type
         * @type {string}
         */
        this.chartType = params.chartType;

        /**
         * Chart types
         * @type {Array.<string>}
         */
        this.chartTypes = params.chartTypes;

        /**
         * Data processor
         * @type {DataProcessor}
         */
        this.dataProcessor = params.dataProcessor;

        /**
         * Options
         * @type {object}
         */
        this.options = params.options;
        this.colors = params.colors;

        /**
         * Theme
         * @type {object}
         */
        this.theme = params.theme;

        /**
         * whether vertical or not
         * @type {boolean}
         */
        this.isVertical = params.isVertical;

        /**
         * event bus for transmitting message
         * @type {object}
         */
        this.eventBus = params.eventBus;

        /**
         * label theme
         * @type {object}
         */
        this.labelTheme = params.labelTheme;

        /**
         * x axis type
         * @type {?string}
         */
        this.xAxisType = params.xAxisType;

        /**
         * dateFormat option for xAxis
         * @type {?string}
         */
        this.dateFormat = params.dateFormat;

        /**
         * tooltip options for each chart
         * @type {?function}
         */
        this.labelFormatter = params.labelFormatter;

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
        this.templateFunc = this.options.template || snippet.bind(this._makeTooltipHtml, this);

        /**
         * Tooltip animation time.
         * @type {number}
         */
        this.animationTime = isPieChart ? chartConst.TOOLTIP_PIE_ANIMATION_TIME : chartConst.TOOLTIP_ANIMATION_TIME;

        /**
         * TooltipBase base data.
         * @type {Array.<Array.<object>>}
         */
        this.data = [];

        /**
         * layout bounds information for this components
         * @type {null|{dimension:{width:number, height:number}, position:{left:number, top:number}}}
         */
        this.layout = null;

        /**
         * dimension map for layout of chart
         * @type {null|object}
         */
        this.dimensionMap = null;

        /**
         * position map for layout of chart
         * @type {null|object}
         */
        this.positionMap = null;

        /**
         * Drawing type
         * @type {string}
         */
        this.drawingType = chartConst.COMPONENT_TYPE_DOM;

        this._setDefaultTooltipPositionOption();
        this._saveOriginalPositionOptions();

        this._attachToEventBus();
    },

    /**
     * Attach to event bus.
     * @private
     */
    _attachToEventBus: function() {
        this.eventBus.on({
            showTooltip: this.onShowTooltip,
            hideTooltip: this.onHideTooltip
        }, this);

        if (this.onShowTooltipContainer) {
            this.eventBus.on({
                showTooltipContainer: this.onShowTooltipContainer,
                hideTooltipContainer: this.onHideTooltipContainer
            }, this);
        }
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
            offset: this.options.offset
        };
    },

    /**
     * Make tooltip data.
     * @private
     * @abstract
     */
    makeTooltipData: function() {},

    /**
     * Set data for rendering.
     * @param {{
     *      layout: {
     *          dimension: {width: number, height: number},
     *          position: {left: number, top: number}
     *      },
     *      dimensionMap: object
     * }} data - bounds data
     * @private
     */
    _setDataForRendering: function(data) {
        this.layout = data.layout;
        this.dimensionMap = data.dimensionMap;
        this.positionMap = data.positionMap;
    },

    /**
     * Render tooltip component.
     * @param {object} data - bounds data
     * @returns {HTMLElement} tooltip element
     */
    render: function(data) {
        var el = data.paper;

        dom.addClass(el, this.className);

        this._setDataForRendering(data);
        this.data = this.makeTooltipData();

        renderUtil.renderPosition(el, this.layout.position);

        this.tooltipContainer = el;

        return el;
    },

    /**
     * Rerender.
     * @param {object} data - bounds data
     */
    rerender: function(data) {
        this.resize(data);
        this.data = this.makeTooltipData();
    },

    /**
     * Resize tooltip component.
     * @param {object} data - bounds data
     * @override
     */
    resize: function(data) {
        this._setDataForRendering(data);

        renderUtil.renderPosition(this.tooltipContainer, this.layout.position);
        if (this.positionModel) {
            this.positionModel.updateBound(this.layout);
        }
    },

    /**
     * Zoom.
     */
    zoom: function() {
        this.data = this.makeTooltipData();
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
     * onShowTooltip is callback of mouse event detector showTooltip for SeriesView.
     * @param {object} params coordinate event parameters
     */
    onShowTooltip: function(params) {
        var tooltipElement = this._getTooltipElement();
        var isScatterCombo = predicate.isComboChart(this.chartType) && predicate.isScatterChart(params.chartType);
        var prevPosition;

        if ((!predicate.isChartToDetectMouseEventOnSeries(params.chartType) || isScatterCombo)
            && tooltipElement.offsetWidth) {
            prevPosition = {
                left: tooltipElement.offsetLeft,
                top: tooltipElement.offsetTop
            };
        }

        this._showTooltip(tooltipElement, params, prevPosition);
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
     * @private
     */
    _moveToPosition: function(tooltipElement, position, prevPosition) {
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
     * onHideTooltip is callback of mouse event detector hideTooltip for SeriesView
     * @param {number|object} prevFound - showing tooltip object in case single tooltip,
     *                                  - showing tooltip index in case group tooltip
     * @param {{silent: {boolean}}} [options] - hide tooltip options
     */
    onHideTooltip: function(prevFound, options) {
        var tooltipElement = this._getTooltipElement();

        this._hideTooltip(tooltipElement, prevFound, options);
    },

    /**
     * Set align option.
     * @param {string} align align
     */
    setAlign: function(align) {
        this.options.align = align;
        if (this.positionModel) {
            this.positionModel.updateOptions(this.options);
        }
    },

    /**
     * Update offset option.
     * @param {{x: number, y: number}} offset - offset
     * @private
     */
    _updateOffsetOption: function(offset) {
        this.options.offset = offset;

        if (this.positionModel) {
            this.positionModel.updateOptions(this.options);
        }
    },

    /**
     * Set offset.
     * @param {{x: number, y: number}} offset - offset
     */
    setOffset: function(offset) {
        var offsetOption = snippet.extend({}, this.options.offset);

        if (snippet.isExisty(offset.x)) {
            offsetOption.x = offset.x;
        }

        if (snippet.isExisty(offset.y)) {
            offsetOption.y = offset.y;
        }

        this._updateOffsetOption(snippet.extend({}, this.options.offset, offsetOption));
    },

    /**
     * Set position option.
     * @param {{left: number, top: number}} position moving position
     * @deprecated
     */
    setPosition: function(position) {
        var offsetOption = snippet.extend({}, this.options.offset);

        if (snippet.isExisty(position.left)) {
            offsetOption.x = position.left;
        }

        if (snippet.isExisty(position.top)) {
            offsetOption.y = position.y;
        }

        this._updateOffsetOption(offsetOption);
    },

    /**
     * Reset align option.
     */
    resetAlign: function() {
        var align = this.orgPositionOptions.align;

        this.options.align = align;

        if (this.positionModel) {
            this.positionModel.updateOptions(this.options);
        }
    },

    /**
     * Reset offset option.
     */
    resetOffset: function() {
        this.options.offset = this.orgPositionOptions.offset;
        this._updateOffsetOption(this.options.offset);
    },

    /**
     * Get category's raw data
     * @param {number} index - index of categories
     * @param {string} format - date format
     * @returns {string} - category's raw data
     */
    getRawCategory: function(index, format) {
        var axis = this.isVertical ? 'x' : 'y';
        var categories = this.dataProcessor.categoriesMap ? this.dataProcessor.categoriesMap[axis] : null;
        var rawCategory = '';

        if (categories) {
            rawCategory = categories[index];
        }

        if (format) {
            rawCategory = renderUtil.formatDate(rawCategory, format);
        }

        return rawCategory;
    }
});

module.exports = TooltipBase;
