/**
 * @fileoverview  Circle legend component render a legend in the form of overlapping circles
 *                  by representative radius values.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../../const');
var calculator = require('../../helpers/calculator');
var renderUtil = require('../../helpers/renderUtil');
var pluginFactory = require('../../factories/pluginFactory');
var snippet = require('tui-code-snippet');

var CircleLegend = snippet.defineClass(/** @lends CircleLegend.prototype */ {
    /**
     * ratios for rendering circle
     * @type {Array.<number>}
     */
    circleRatios: [1, 0.5, 0.25],
    /**
     * Circle legend component render a legend in the form of overlapping circles by representative radius values.
     * @constructs CircleLegend
     * @private
     * @param {object} params parameters
     *      @param {?string} params.libType - library type for graph rendering
     *      @param {string} params.chartType - chart type
     *      @param {DataProcessor} params.dataProcessor - DataProcessor
     *      @param {string} params.baseFontFamily - base fontFamily of chart
     */
    init: function(params) {
        var libType = params.libType;

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

        this.drawingType = chartConst.COMPONENT_TYPE_RAPHAEL;
    },

    /**
     * Format label.
     * @param {number} label - label
     * @param {number} decimalLength - decimal length
     * @returns {string}
     * @private
     */
    _formatLabel: function(label, decimalLength) {
        var formatFunctions = this.dataProcessor.getFormatFunctions();
        var formattedLabel;

        if (decimalLength === 0) {
            formattedLabel = String(parseInt(label, 10));
        } else {
            formattedLabel = renderUtil.formatToDecimal(String(label), decimalLength);
        }

        return renderUtil.formatValue({
            value: formattedLabel,
            formatFunctions: formatFunctions,
            chartType: this.chartType,
            areaType: 'circleLegend',
            valueType: 'r'
        });
    },

    /**
     * Make label html.
     * @returns {Array.<string>}
     * @private
     */
    _makeLabels: function() {
        var self = this;
        var maxValueRadius = this.dataProcessor.getMaxValue(this.chartType, 'r');
        var decimalLength = calculator.getDecimalLength(maxValueRadius);

        return snippet.map(this.circleRatios, function(ratio) {
            return self._formatLabel(maxValueRadius * ratio, decimalLength);
        });
    },

    /**
     * Render for circle legend area.
     * @param {object} paper paper object
     * @returns {Array.<object>}
     * @private
     */
    _render: function(paper) {
        return this.graphRenderer.render(paper, this.layout, this.maxRadius, this.circleRatios, this._makeLabels());
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
     */
    render: function(data) {
        this._setDataForRendering(data);
        this.circleLegendSet = this._render(data.paper);
    },

    /**
     * Rerender.
     * @param {object} data - bounds data
     */
    rerender: function(data) {
        this.circleLegendSet.remove();

        this._setDataForRendering(data);
        this.circleLegendSet = this._render(data.paper);
    },

    /**
     * Resize.
     * @param {object} data - bounds data
     */
    resize: function(data) {
        this.rerender(data);
    }
});

/**
 * Factory for CircleLegend
 * @param {object} params parameter
 * @returns {object|null}
 * @ignore
 */
function circleLegendFactory(params) {
    var chartType = params.chartOptions.chartType;
    var chartTheme = params.chartTheme;
    var visibleOption = snippet.pick(params.chartOptions, 'circleLegend', 'visible');
    var circleLegend = null;
    var isLegendVisible;

    if (snippet.isUndefined(visibleOption)) {
        isLegendVisible = true;
    } else {
        isLegendVisible = visibleOption;
    }

    if (isLegendVisible) {
        params.chartType = chartType;
        params.baseFontFamily = chartTheme.chart.fontFamily;

        circleLegend = new CircleLegend(params);
    }

    return circleLegend;
}

circleLegendFactory.componentType = 'legend';
circleLegendFactory.CircleLegend = CircleLegend;

module.exports = circleLegendFactory;
