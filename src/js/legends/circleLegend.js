/**
 * @fileoverview  Circle legend component render a legend in the form of overlapping circles
 *                  by representative radius values.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const');
var dom = require('../helpers/domHandler');
var renderUtil = require('../helpers/renderUtil');
var pluginFactory = require('../factories/pluginFactory');
var legendTemplate = require('./../legends/legendTemplate');

var CircleLegend = tui.util.defineClass(/** @lends CircleLegend.prototype */ {
    /**
     * css className of circle legend
     * @type {string}
     */
    className: 'tui-chart-circle-legend-area',
    /**
     * ratios for rendering circle
     * @type {Array.<number>}
     */
    circleRatios: [1, 0.5, 0.25],
    /**
     * Circle legend component render a legend in the form of overlapping circles by representative radius values.
     * @constructs CircleLegend
     * @param {object} params parameters
     *      @param {?string} params.libType - library type for graph rendering
     *      @param {string} params.chartType - chart type
     *      @param {DataProcessor} params.dataProcessor - DataProcessor
     *      @param {BoundsMaker} params.boundsMaker - BoundsMaker
     *      @param {string} params.baseFontFamily - base fontFamily of chart
     */
    init: function(params) {
        var libType = params.libType || chartConst.DEFAULT_PLUGIN;

        /**
         * chart type
         * @type {string}
         */
        this.chartType = params.chartType;

        /**
         * data processor
         * @type {DataProcessor}
         */
        this.dataProcessor = params.dataProcessor;

        /**
         * bounds maker
         * @type {BoundsMaker}
         */
        this.boundsMaker = params.boundsMaker;

        /**
         * theme for label of circle legend area
         * @type {{fontSize: number, fontFamily: *}}
         */
        this.labelTheme = {
            fontSize: chartConst.CIRCLE_LEGEND_LABEL_FONT_SIZE,
            fontFamily: params.baseFontFamily
        };

        /**
         * Graph renderer
         * @type {object}
         */
        this.graphRenderer = pluginFactory.get(libType, 'circleLegend');
    },

    /**
     * Format label
     * @param {number} label - label
     * @param {number} decimalLength - decimal length
     * @returns {string}
     * @private
     */
    _formatLabel: function(label, decimalLength) {
        var formatFunctions = this.dataProcessor.getFormatFunctions();

        if (decimalLength === 0) {
            label = String(parseInt(label, 10));
        } else {
            label = String(label);
            label = renderUtil.formatToDecimal(label, decimalLength);
        }

        return renderUtil.formatValue(label, formatFunctions, 'circleLegend', 'r');
    },

    /**
     * Make label html.
     * @returns {string}
     * @private
     */
    _makeLabelHtml: function() {
        var self = this;
        var boundsMaker = this.boundsMaker;
        var dimension = boundsMaker.getDimension('circleLegend');
        var halfWidth = dimension.width / 2;
        var maxRadius = boundsMaker.getMaxRadiusForBubbleChart();
        var maxValueRadius = this.dataProcessor.getMaxValue(this.chartType, 'r');
        var decimalLength = tui.util.getDecimalLength(maxValueRadius);
        var labelHeight = renderUtil.getRenderedLabelHeight(maxValueRadius, this.labelTheme);

        return tui.util.map(this.circleRatios, function(ratio) {
            var diameter = maxRadius * ratio * 2;
            var label = self._formatLabel(maxValueRadius * ratio, decimalLength);
            var labelWidth = renderUtil.getRenderedLabelWidth(label, self.labelTheme);
            return legendTemplate.tplCircleLegendLabel({
                left: halfWidth - (labelWidth / 2),
                top: dimension.height - diameter - labelHeight,
                label: label
            });
        }).join('');
    },

    /**
     * Render label area.
     * @private
     */
    _renderLabelArea: function() {
        var labelContainer = dom.create('DIV', 'tui-chart-circle-legend-label-area');

        labelContainer.innerHTML = this._makeLabelHtml();
        this.container.appendChild(labelContainer);
    },

    /**
     * Render for circle legend area.
     * @private
     */
    _render: function() {
        var circleContainer = dom.create('DIV', 'tui-chart-circle-area');
        var boundsMaker = this.boundsMaker;
        var bound = boundsMaker.getBound('circleLegend');
        var maxRadius = boundsMaker.getMaxRadiusForBubbleChart();

        this.container.appendChild(circleContainer);

        this.graphRenderer.render(circleContainer, bound.dimension, maxRadius, this.circleRatios);

        this._renderLabelArea();
        renderUtil.renderPosition(this.container, bound.position);
    },

    /**
     * Render.
     * @returns {HTMLElement}
     */
    render: function() {
        var container = dom.create('DIV', this.className);

        this.container = container;
        this._render();
        return container;
    },

    /**
     * Rerender.
     */
    rerender: function() {
        this.container.innerHTML = null;
        this._render();
    },

    /**
     * Resize.
     */
    resize: function() {
        this.rerender();
    },

    /**
     * Get max width of label for CircleLegend.
     * @returns {number}
     * @private
     */
    _getCircleLegendLabelMaxWidth: function() {
        var maxLabel = this.dataProcessor.getFormattedMaxValue(this.chartType, 'circleLegend', 'r');
        var maxLabelWidth = renderUtil.getRenderedLabelWidth(maxLabel, {
            fontSize: this.labelTheme.fontSize,
            fontFamily: this.labelTheme.fontFamily
        });

        return maxLabelWidth;
    },

    /**
     * Get circle legend width.
     * @returns {number}
     * @private
     */
    _getCircleLegendWidth: function() {
        var maxRadius = this.boundsMaker.getMinimumPixelStepForAxis();
        var maxLabelWidth = this._getCircleLegendLabelMaxWidth();

        return Math.max((maxRadius * 2), maxLabelWidth) + chartConst.CIRCLE_LEGEND_PADDING;
    },

    /**
     * Register dimension of circle legend.
     * @private
     */
    registerCircleLegendDimension: function() {
        var circleLegendWidth = this._getCircleLegendWidth();
        var legendWidth = this.boundsMaker.getDimension('calculationLegend').width || chartConst.MIN_LEGEND_WIDTH;

        circleLegendWidth = Math.min(circleLegendWidth, legendWidth);

        this.boundsMaker.registerBaseDimension('circleLegend', {
            width: circleLegendWidth,
            height: circleLegendWidth
        });
    }
});

module.exports = CircleLegend;
