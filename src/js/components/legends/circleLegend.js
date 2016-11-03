/**
 * @fileoverview  Circle legend component render a legend in the form of overlapping circles
 *                  by representative radius values.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../../const');
var dom = require('../../helpers/domHandler');
var renderUtil = require('../../helpers/renderUtil');
var pluginFactory = require('../../factories/pluginFactory');
var legendTemplate = require('./legendTemplate');

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

        /**
         * layout bounds information for this components
         * @type {null|{dimension:{width:number, height:number}, position:{left:number, top:number}}}
         */
        this.layout = null;

        /**
         * max radius for rendering circle legend
         * @type {null|number}
         */
        this.maxRadius = null;
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

        return renderUtil.formatValue(label, formatFunctions, this.chartType, 'circleLegend', 'r');
    },

    /**
     * Make label html.
     * @returns {string}
     * @private
     */
    _makeLabelHtml: function() {
        var self = this;
        var dimension = this.layout.dimension;
        var halfWidth = dimension.width / 2;
        var maxRadius = this.maxRadius;
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

        this.container.appendChild(circleContainer);

        this.graphRenderer.render(circleContainer, this.layout.dimension, this.maxRadius, this.circleRatios);

        this._renderLabelArea();
        renderUtil.renderPosition(this.container, this.layout.position);
    },

    /**
     * Set data for rendering.
     * @param {{
     *      layout: {
     *          dimension: {width: number, height: number},
     *          position: {left: number, top: number}
     *      },
     *      maxRadius: number
     * }} data - bounds data
     * @private
     */
    _setDataForRendering: function(data) {
        this.layout = data.layout;
        this.maxRadius = data.maxRadius;
    },

    /**
     * Render.
     * @param {object} data - bounds data
     * @returns {HTMLElement}
     */
    render: function(data) {
        var container = dom.create('DIV', this.className);

        this.container = container;
        this._setDataForRendering(data);
        this._render(data);

        return container;
    },

    /**
     * Rerender.
     * @param {object} data - bounds data
     */
    rerender: function(data) {
        this.container.innerHTML = '';
        this._setDataForRendering(data);
        this._render();
    },

    /**
     * Resize.
     * @param {object} data - bounds data
     */
    resize: function(data) {
        this.rerender(data);
    }
});

module.exports = CircleLegend;
