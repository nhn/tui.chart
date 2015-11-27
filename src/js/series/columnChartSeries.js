/**
 * @fileoverview Column chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series'),
    BarTypeSeriesBase = require('./barTypeSeriesBase'),
    chartConst = require('../const'),
    renderUtil = require('../helpers/renderUtil');

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
     * To make start end tops.
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
     * To make bound of column chart.
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
     * To make normal column chart bound.
     * @param {{
     *      dimension: {width: number, height: number},
     *      groupValues: array.<array.<number>>,
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
        endTop = baseInfo.isMinus ? 0 : baseInfo.dimension.height - baseInfo.distanceToMin;
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
     * To make bounds of normal column chart.
     * @param {{width: number, height:number}} dimension column chart dimension
     * @returns {array.<array.<object>>} bounds
     * @private
     */
    _makeNormalColumnChartBounds: function(dimension) {
        var baseInfo = this.makeBaseInfoForNormalChartBounds(dimension, 'height', 'width'),
            bounds;

        bounds = tui.util.map(baseInfo.groupValues, function(values, groupIndex) {
            var paddingLeft = (baseInfo.groupSize * groupIndex) + baseInfo.additionPadding;
            return tui.util.map(values, function (value, index) {
                return this._makeNormalColumnChartBound(baseInfo, value, paddingLeft, index);
            }, this);
        }, this);

        return bounds;
    },

    /**
     * To make bounds of stacked column chart.
     * @param {{width: number, height:number}} dimension column chart dimension
     * @returns {array.<array.<object>>} bounds
     * @private
     */
    _makeStackedColumnChartBounds: function(dimension) {
        var groupValues, groupWidth, barWidth,
            optionWidth, additionPadding, bounds;

        groupValues = this.percentValues;
        groupWidth = (dimension.width / groupValues.length);
        barWidth = groupWidth / 2;
        optionWidth = this._makeOptionSize(barWidth, this.options.barWidth);
        additionPadding = this._makeAdditionPadding(barWidth, optionWidth, 1);
        barWidth = optionWidth || barWidth;
        bounds = tui.util.map(groupValues, function(values, groupIndex) {
            var paddingLeft = (groupWidth * groupIndex) + additionPadding + chartConst.SERIES_EXPAND_SIZE,
                top = 0;
            return tui.util.map(values, function (value) {
                var endHeight, baseBound, bound;
                if (value < 0) {
                    return null;
                }

                endHeight = value * dimension.height;
                baseBound = {
                    left: paddingLeft,
                    width: barWidth
                };
                bound = this._makeColumnChartBound({
                    baseBound: baseBound,
                    startTop: dimension.height,
                    endTop: dimension.height - endHeight - top,
                    endHeight: endHeight
                });

                top += endHeight;
                return bound;
            }, this);
        }, this);
        return bounds;
    },

    /**
     * To make bounds of column chart.
     * @param {{width: number, height:number}} dimension column chart dimension
     * @returns {array.<array.<object>>} bounds
     * @private
     */
    _makeBounds: function(dimension) {
        if (!this.options.stacked) {
            return this._makeNormalColumnChartBounds(dimension);
        } else {
            return this._makeStackedColumnChartBounds(dimension);
        }
    },

    /**
     * To make series rendering position
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
            labelWidth = renderUtil.getRenderedLabelWidth(sum, this.theme.label),
            left = bound.left + ((bound.width - labelWidth + chartConst.TEXT_PADDING) / 2),
            top = bound.top - params.labelHeight - chartConst.SERIES_LABEL_PADDING;

        return this.makeSeriesLabelHtml({
            left: left,
            top: top
        }, sum, -1, -1);
    }
});

BarTypeSeriesBase.mixin(ColumnChartSeries);

module.exports = ColumnChartSeries;
