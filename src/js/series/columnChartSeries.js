/**
 * @fileoverview Column chart series component.
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

var ColumnChartSeries = tui.util.defineClass(Series, /** @lends ColumnChartSeries.prototype */ {
    /**
     * Column chart series component.
     * @constructs ColumnChartSeries
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
     * Make start end tops.
     * @param {number} endTop end top
     * @param {number} endHeight end height
     * @param {number} value value
     * @param {boolean} isMinus whether minus or not
     * @returns {{startTop: number, endTop: number}} start end tops
     * @private
     */
    _makeStartEndTops: function(endTop, endHeight, value) {
        var startTop;

        if (value < 0) {
            startTop = endTop;
        } else {
            startTop = endTop;
            endTop -= endHeight;
        }

        return {
            startTop: startTop,
            endTop: endTop
        };
    },

    /**
     * Make bound of column chart.
     * @param {object} params parameters
     *      @param {{left: number, width: number}} params.baseBound base bound
     *      @param {number} params.startTop start top
     *      @param {number} params.endTop end top
     *      @param {number} params.endHeight end height
     * @returns {{
     *      start: {left: number, top: number, width: number, height: number},
     *      end: {left: number, top: number, width: number, height: number}
     * }} column chart bound
     * @private
     */
    _makeColumnChartBound: function(params) {
        return {
            start: tui.util.extend({
                top: params.startTop,
                height: 0
            }, params.baseBound),
            end: tui.util.extend({
                top: params.endTop,
                height: params.endHeight
            }, params.baseBound)
        };
    },

    /**
     * Make normal column chart bound.
     * @param {{
     *      dimension: {width: number, height: number},
     *      groupValues: Array.<Array.<number>>,
     *      groupSize: number, barSize: number, step: number,
     *      distanceToMin: number, isMinus: boolean
     * }} baseInfo base info
     * @param {number} value value
     * @param {number} paddingLeft padding left
     * @param {number} index index
     * @returns {{
     *      start: {left: number, top: number, width: number, height: number},
     *      end: {left: number, top: number, width: number, height: number}
     * }} column chart bound
     * @private
     */
    _makeNormalColumnChartBound: function(baseInfo, value, paddingLeft, index) {
        var endHeight, endTop, startEndTops, bound;

        endHeight = Math.abs(value * baseInfo.dimension.height);
        endTop = (baseInfo.isMinus ? 0 : (baseInfo.distance.toMax || baseInfo.dimension.height)) + chartConst.SERIES_EXPAND_SIZE;
        startEndTops = this._makeStartEndTops(endTop, endHeight, value);
        bound = this._makeColumnChartBound(tui.util.extend({
            baseBound: {
                left: paddingLeft + (baseInfo.step * index) + chartConst.SERIES_EXPAND_SIZE,
                width: baseInfo.barSize
            },
            endHeight: endHeight
        }, startEndTops));

        return bound;
    },

    /**
     * Make bounds of normal column chart.
     * @param {{width: number, height:number}} dimension column chart dimension
     * @returns {Array.<Array.<object>>} bounds
     * @private
     */
    _makeNormalColumnChartBounds: function(dimension) {
        var baseInfo = this._makeBaseInfoForNormalChartBounds(dimension, 'height', 'width'),
            bounds = this._makeNormalBounds(baseInfo, tui.util.bind(this._makeNormalColumnChartBound, this));

        return bounds;
    },

    /**
     * Make bounds of stacked column chart.
     * @param {{width: number, height:number}} dimension column chart dimension
     * @returns {Array.<Array.<object>>} bounds
     * @private
     */
    _makeStackedColumnChartBounds: function(dimension) {
        var that = this,
            baseInfo = this._makeBaseInfoForStackedChartBounds(dimension, 'height'),
            bounds = this._makeStackedBounds(dimension, baseInfo, function(baseBound, endSize, endPosition) {
                return that._makeColumnChartBound({
                    baseBound: baseBound,
                    startTop: baseInfo.distance.toMax + chartConst.SERIES_EXPAND_SIZE,
                    endTop: baseInfo.distance.toMax - endSize - endPosition,
                    endHeight: endSize
                });
            });

        return bounds;
    },

    /**
     * Make bounds of column chart.
     * @param {{width: number, height:number}} dimension column chart dimension
     * @returns {Array.<Array.<object>>} bounds
     * @private
     */
    _makeBounds: function(dimension) {
        var bounds;

        if (predicate.isValidStackedOption(this.options.stacked)) {
            bounds = this._makeStackedColumnChartBounds(dimension);
        } else {
            bounds = this._makeNormalColumnChartBounds(dimension);
        }

        return bounds;
    },

    /**
     * Make series rendering position
     * @param {obeject} params parameters
     *      @param {number} params.value value
     *      @param {{left: number, top: number, width:number, width:number, height: number}} params.bound bound
     *      @param {string} params.formattedValue formatted value
     *      @param {number} params.labelHeight label height
     * @returns {{left: number, top: number}} rendering position
     */
    makeSeriesRenderingPosition: function(params) {
        var labelWidth = renderUtil.getRenderedLabelWidth(params.formattedValue, this.theme.label),
            bound = params.bound,
            top = bound.top,
            left = bound.left + (bound.width - labelWidth) / 2;

        if (params.value >= 0) {
            top -= params.labelHeight + chartConst.SERIES_LABEL_PADDING;
        } else {
            top += bound.height + chartConst.SERIES_LABEL_PADDING;
        }

        return {
            left: left,
            top: top
        };
    },

    /**
     * Calculate sum label left position.
     * @param {{left: number, top: number}} bound bound
     * @param {string} formattedSum formatted sum.
     * @returns {number} left position value
     * @private
     */
    _calculateSumLabelLeftPosition: function(bound, formattedSum) {
        var labelWidth = renderUtil.getRenderedLabelWidth(formattedSum, this.theme.label);
        return bound.left + ((bound.width - labelWidth + chartConst.TEXT_PADDING) / 2);
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
                left: this._calculateSumLabelLeftPosition(bound, formattedSum),
                top: bound.top - labelHeight - chartConst.SERIES_LABEL_PADDING
            }, formattedSum, -1, -1);
        }

        return html;
    },

    /**
     * Make minus sum label html.
     * @param {Array.<number>} values values
     * @param {{left: number, top: number}} bound bound
     * @returns {string} plus minus label html
     * @private
     */
    _makeMinusSumLabelHtml: function(values, bound) {
        var sum, formattedSum,
            html = '';

        if (bound) {
            sum = calculator.sumMinusValues(values);

            if (this.options.diverging) {
                sum = Math.abs(sum);
            }

            formattedSum = renderUtil.formatValue(sum, this.dataProcessor.getFormatFunctions());
            html = this._makeSeriesLabelHtml({
                left: this._calculateSumLabelLeftPosition(bound, formattedSum),
                top: bound.top + bound.height + chartConst.SERIES_LABEL_PADDING
            }, formattedSum, -1, -1);
        }

        return html;
    }
});

BarTypeSeriesBase.mixin(ColumnChartSeries);

module.exports = ColumnChartSeries;
