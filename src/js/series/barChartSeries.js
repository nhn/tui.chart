/**
 * @fileoverview Bar chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series.js'),
    BarTypeSeriesBase = require('./barTypeSeriesBase.js'),
    chartConst = require('../const.js'),
    renderUtil = require('../helpers/renderUtil.js');

var BarChartSeries = ne.util.defineClass(Series, /** @lends BarChartSeries.prototype */ {
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
     * To make bound of bar chart.
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
            start: ne.util.extend({
                left: params.startLeft,
                width: 0
            }, params.baseBound),
            end: ne.util.extend({
                left: params.endLeft,
                width: params.endWidth
            }, params.baseBound)
        };
    },

    /**
     * To make bounds of normal bar chart.
     * @param {{width: number, height:number}} dimension bar chart dimension
     * @returns {array.<array.<object>>} bounds
     * @private
     */
    _makeNormalBarChartBounds: function(dimension) {
        var groupValues, groupHeight, barHeight, scaleDistance, bounds;

        groupValues = this.percentValues;
        groupHeight = (dimension.height / groupValues.length);
        barHeight = groupHeight / (groupValues[0].length + 1);
        scaleDistance = this.getScaleDistanceFromZeroPoint(dimension.width, this.data.scale);
        bounds = ne.util.map(groupValues, function(values, groupIndex) {
            var paddingTop = (groupHeight * groupIndex) + (barHeight / 2);
            return ne.util.map(values, function (value, index) {
                var startLeft, endWidth, bound, baseBound;

                startLeft = scaleDistance.toMin + chartConst.SERIES_EXPAND_SIZE;
                endWidth = Math.abs(value * dimension.width);
                baseBound = {
                    top: paddingTop + (barHeight * index),
                    height: barHeight
                };
                bound = this._makeBarChartBound({
                    baseBound: baseBound,
                    startLeft: startLeft,
                    endLeft: startLeft + (value < 0 ? -endWidth : 0),
                    endWidth: endWidth
                });

                return bound;
            }, this);
        }, this);

        return bounds;
    },

    /**
     * To make bounds of stacked bar chart.
     * @param {{width: number, height:number}} dimension bar chart dimension
     * @returns {array.<array.<object>>} bounds
     * @private
     */
    _makeStackedBarChartBounds: function(dimension) {
        var groupValues, groupHeight, barHeight, bounds;

        groupValues = this.percentValues;
        groupHeight = (dimension.height / groupValues.length);
        barHeight = groupHeight / 2;
        bounds = ne.util.map(groupValues, function (values, groupIndex) {
            var paddingTop = (groupHeight * groupIndex) + (barHeight / 2),
                endLeft = chartConst.SERIES_EXPAND_SIZE;
            return ne.util.map(values, function (value) {
                var endWidth, baseBound, bound;

                if (value < 0) {
                    return null;
                }

                endWidth = value * dimension.width;
                baseBound = {
                    top: paddingTop,
                    height: barHeight
                };
                bound = this._makeBarChartBound({
                    baseBound: baseBound,
                    startLeft: chartConst.SERIES_EXPAND_SIZE,
                    endLeft: endLeft,
                    endWidth: endWidth
                });
                endLeft = endLeft + endWidth;

                return bound;
            }, this);
        }, this);
        return bounds;
    },


    /**
     * To make bounds of bar chart.
     * @param {{width: number, height:number}} dimension bar chart dimension
     * @returns {array.<array.<object>>} bounds
     * @private
     */
    _makeBounds: function(dimension) {
        if (!this.options.stacked) {
            return this._makeNormalBarChartBounds(dimension);
        } else {
            return this._makeStackedBarChartBounds(dimension);
        }
    },

    /**
     * To make series rendering position
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
     * To make sum label html.
     * @param {object} params parameters
     *      @param {array.<number>} params.values values
     *      @param {array.<function>} params.formatFunctions formatting functions
     *      @param {{left: number, top: number}} params.bound bound
     *      @param {number} params.labelHeight label height
     * @returns {string} sum label html
     */
    makeSumLabelHtml: function(params) {
        var sum = this.makeSumValues(params.values, params.formatFunctions),
            bound = params.bound,
            labelHeight = renderUtil.getRenderedLabelHeight(sum, this.theme.label),
            top = bound.top + ((bound.height - labelHeight + chartConst.TEXT_PADDING) / 2),
            left = bound.left + bound.width + chartConst.SERIES_LABEL_PADDING;

        return this._makeSeriesLabelHtml({
            left: left,
            top: top
        }, sum, -1, -1);
    }
});

BarTypeSeriesBase.mixin(BarChartSeries);

module.exports = BarChartSeries;
