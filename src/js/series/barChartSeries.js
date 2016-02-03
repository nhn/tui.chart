/**
 * @fileoverview Bar chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series'),
    BarTypeSeriesBase = require('./barTypeSeriesBase'),
    chartConst = require('../const'),
    predicate = require('../helpers/predicate'),
    renderUtil = require('../helpers/renderUtil'),
    calculator = require('../helpers/calculator');

var BarChartSeries = tui.util.defineClass(Series, /** @lends BarChartSeries.prototype */ {
    /**
     * Bar chart series component.
     * @constructs BarChartSeries
     * @extends Series
     * @param {object} params parameters
     *      @param {object} params.model series model
     *      @param {object} params.options series options
     *      @param {object} params.theme series theme
     */
    init: function() {
        Series.apply(this, arguments);
    },

    /**
     * Make bound of bar chart.
     * @param {object} params parameters
     *      @param {{top: number, height: number}} params.baseBound base bound
     *      @param {number} params.startLeft start left
     *      @param {number} params.endLeft end left
     *      @param {number} params.endWidth end width
     * @returns {{
     *      start: {left: number, top: number, width: number, height: number},
     *      end: {left: number, top: number, width: number, height: number}
     * }} column chart bound
     * @private
     */
    _makeBarChartBound: function(params) {
        return {
            start: tui.util.extend({
                left: params.startLeft,
                width: 0
            }, params.baseBound),
            end: tui.util.extend({
                left: params.endLeft,
                width: params.endWidth
            }, params.baseBound)
        };
    },

    /**
     * Make normal bar chart bound.
     * @param {{
     *      dimension: {width: number, height: number},
     *      groupValues: Array.<Array.<number>>,
     *      groupSize: number, barSize: number, step: number,
     *      distanceToMin: number, isMinus: boolean
     * }} baseInfo base info
     * @param {number} value value
     * @param {number} paddingTop padding top
     * @param {number} index index
     * @returns {{
     *      start: {left: number, top: number, width: number, height: number},
     *      end: {left: number, top: number, width: number, height: number}
     * }} column chart bound
     * @private
     */
    _makeNormalBarChartBound: function(baseInfo, value, paddingTop, index) {
        var startLeft, endWidth, bound, baseBound;

        startLeft = baseInfo.distance.toMin + chartConst.SERIES_EXPAND_SIZE;
        endWidth = Math.abs(value * baseInfo.dimension.width);
        baseBound = {
            top: paddingTop + ((baseInfo.step) * index) + chartConst.SERIES_EXPAND_SIZE,
            height: baseInfo.barSize
        };
        bound = this._makeBarChartBound({
            baseBound: baseBound,
            startLeft: startLeft,
            endLeft: startLeft + (value < 0 ? -endWidth : 0),
            endWidth: endWidth
        });

        return bound;
    },

    /**
     * Make bounds of normal bar chart.
     * @param {{width: number, height:number}} dimension bar chart dimension
     * @returns {Array.<Array.<object>>} bounds
     * @private
     */
    _makeNormalBarChartBounds: function(dimension) {
        var baseInfo = this._makeBaseInfoForNormalChartBounds(dimension, 'width', 'height'),
            bounds = this._makeNormalBounds(baseInfo, tui.util.bind(this._makeNormalBarChartBound, this));

        return bounds;
    },

    /**
     * Make bounds of stacked bar chart.
     * @param {{width: number, height:number}} dimension bar chart dimension
     * @returns {Array.<Array.<object>>} bounds
     * @private
     */
    _makeStackedBarChartBounds: function(dimension) {
        var that = this,
            baseInfo = this._makeBaseInfoForStackedChartBounds(dimension, 'width');

        return this._makeStackedBounds(dimension, baseInfo, function(baseBound, endSize, endPosition) {
            return that._makeBarChartBound({
                baseBound: baseBound,
                startLeft: baseInfo.distance.toMin + chartConst.SERIES_EXPAND_SIZE,
                endLeft: baseInfo.distance.toMin + endPosition,
                endWidth: endSize
            });
        });
    },

    /**
     * Make bounds of bar chart.
     * @param {{width: number, height:number}} dimension bar chart dimension
     * @returns {Array.<Array.<object>>} bounds
     * @private
     */
    _makeBounds: function(dimension) {
        var bounds;

        if (predicate.isValidStackedOption(this.options.stacked)) {
            bounds = this._makeStackedBarChartBounds(dimension);
        } else {
            bounds = this._makeNormalBarChartBounds(dimension);
        }

        return bounds;
    },

    /**
     * Make series rendering position
     * @param {obeject} params parameters
     *      @param {number} params.value value
     *      @param {{left: number, top: number, width:number, height: number}} params.bound bound
     *      @param {string} params.formattedValue formatted value
     *      @param {number} params.labelHeight label height
     * @returns {{left: number, top: number}} rendering position
     */
    makeSeriesRenderingPosition: function(params) {
        var labelWidth = renderUtil.getRenderedLabelWidth(params.formattedValue, this.theme.label),
            bound = params.bound,
            left = bound.left,
            top = bound.top + (bound.height - params.labelHeight + chartConst.TEXT_PADDING) / 2;

        if (params.value >= 0) {
            left += bound.width + chartConst.SERIES_LABEL_PADDING;
        } else {
            left -= labelWidth + chartConst.SERIES_LABEL_PADDING;
        }

        return {
            left: left,
            top: top
        };
    },

    /**
     * Calculate sum label top position.
     * @param {{left: number, top: number}} bound bound
     * @param {number} labelHeight label height
     * @returns {number} top position value
     * @private
     */
    _calculateSumLabelTopPosition: function(bound, labelHeight) {
        return bound.top + ((bound.height - labelHeight + chartConst.TEXT_PADDING) / 2);
    },

    /**
     * Make plus sum label html.
     * @param {Array.<number>} values values
     * @param {{left: number, top: number}} bound bound
     * @param {number} labelHeight label height
     * @returns {string} plus sum label html
     * @private
     */
    _makePlusSumLabelHtml: function(values, bound, labelHeight) {
        var sum, formattedSum,
            html = '';

        if (bound) {
            sum = calculator.sumPlusValues(values);
            formattedSum = renderUtil.formatValue(sum, this.dataProcessor.getFormatFunctions());
            html = this._makeSeriesLabelHtml({
                left: bound.left + bound.width + chartConst.SERIES_LABEL_PADDING,
                top: this._calculateSumLabelTopPosition(bound, labelHeight)
            }, formattedSum, -1, -1);
        }

        return html;
    },

    /**
     * Make minus sum label html.
     * @param {Array.<number>} values values
     * @param {{left: number, top: number}} bound bound
     * @param {number} labelHeight label height
     * @returns {string} plus minus label html
     * @private
     */
    _makeMinusSumLabelHtml: function(values, bound, labelHeight) {
        var sum, formattedSum, labelWidth,
            html = '';

        if (bound) {
            sum = calculator.sumMinusValues(values);

            if (this.options.diverging) {
                sum = Math.abs(sum);
            }

            formattedSum = renderUtil.formatValue(sum, this.dataProcessor.getFormatFunctions());
            labelWidth = renderUtil.getRenderedLabelWidth(formattedSum, this.theme.label);
            html = this._makeSeriesLabelHtml({
                left: bound.left - labelWidth - chartConst.SERIES_LABEL_PADDING,
                top: this._calculateSumLabelTopPosition(bound, labelHeight)
            }, formattedSum, -1, -1);
        }

        return html;
    }
});

BarTypeSeriesBase.mixin(BarChartSeries);

module.exports = BarChartSeries;
