/**
 * @fileoverview Bar chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series.js'),
    seriesTemplate = require('./seriesTemplate.js'),
    renderUtil = require('../helpers/renderUtil.js');

var HIDDEN_WIDTH = 1,
    LABEL_FONT_SIZE = 12,
    PLUS_PADDING = 5,
    MINUS_PADDING = 3;

var BarChartSeries = ne.util.defineClass(Series, /** @lends Series.prototype */ {
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
     * To make bounds of bar chart.
     * @param {{width: number, height:number}} dimension bar chart dimension
     * @param {number} hiddenWidth hidden width
     * @returns {array.<array.<object>>} bounds
     */
    _makeBounds: function(dimension, hiddenWidth) {
        hiddenWidth = hiddenWidth || (renderUtil.isIE8() ? 0 : HIDDEN_WIDTH);
        if (!this.options.stacked) {
            return this._makeNormalBarBounds(dimension, hiddenWidth);
        } else {
            return this._makeStackedBarBounds(dimension, hiddenWidth);
        }
    },

    /**
     * To make add data.
     * @returns {object} add data
     */
    makeAddData: function() {
        return {
            groupBounds: this._makeBounds(this.bound.dimension)
        };
    },

    /**
     * To make bounds of normal bar chart.
     * @param {{width: number, height:number}} dimension bar chart dimension
     * @param {number} hiddenWidth hidden width
     * @returns {array.<array.<object>>} bounds
     * @private
     */
    _makeNormalBarBounds: function(dimension, hiddenWidth) {
        var groupValues = this.percentValues,
            groupHeight = (dimension.height / groupValues.length),
            barHeight = groupHeight / (groupValues[0].length + 1),
            scaleDistance = this.getScaleDistanceFromZeroPoint(dimension.width, this.data.scale),
            bounds = ne.util.map(groupValues, function(values, groupIndex) {
                var paddingTop = (groupHeight * groupIndex) + (barHeight / 2) + hiddenWidth;
                return ne.util.map(values, function (value, index) {
                    var top = paddingTop + (barHeight * index),
                        startLeft = -HIDDEN_WIDTH,
                        endLeft = startLeft,
                        barWidth = value * dimension.width;
                    if (value < 0) {
                        barWidth *= -1;
                        startLeft += scaleDistance.toMin;
                        endLeft += scaleDistance.toMin - barWidth;
                    } else {
                        startLeft += scaleDistance.toMin;
                        endLeft += scaleDistance.toMin;
                    }

                    return {
                        start: {
                            top: top,
                            left: startLeft,
                            width: 0,
                            height: barHeight
                        },
                        end: {
                            top: top,
                            left: endLeft,
                            width: barWidth,
                            height: barHeight
                        }
                    };
                }, this);
            });
        return bounds;
    },

    /**
     * To make bounds of stacked bar chart.
     * @param {{width: number, height:number}} dimension bar chart dimension
     * @param {number} hiddenWidth hidden width
     * @returns {array.<array.<object>>} bounds
     * @private
     */
    _makeStackedBarBounds: function(dimension, hiddenWidth) {
        var groupValues = this.percentValues,
            groupHeight = (dimension.height / groupValues.length),
            barHeight = groupHeight / 2,
            bounds = ne.util.map(groupValues, function (values, groupIndex) {
                var paddingTop = (groupHeight * groupIndex) + (barHeight / 2) + hiddenWidth,
                    left = -HIDDEN_WIDTH;
                return ne.util.map(values, function (value) {
                    if (value < 0) {
                        return;
                    }
                    var width = value * dimension.width,
                        bound = {
                            start: {
                                top: paddingTop,
                                left: -HIDDEN_WIDTH,
                                width: 0,
                                height: barHeight
                            },
                            end: {
                                top: paddingTop,
                                left: left,
                                width: width,
                                height: barHeight
                            }
                        };
                    left = left + width;
                    return bound;
                }, this);
            });
        return bounds;
    },

    /**
     * Render normal series label.
     * @param {object} params parameters
     *      @param {HTMLElement} params.container container
     *      @param {array<array>} params.groupBounds group bounds
     *      @param {array<array>} params.formattedValues formatted values
     * @returns {HTMLElement} series label area
     * @private
     */
    _renderNormalSeriesLabel: function(params) {
        var groupBounds = params.groupBounds,
            formattedValues = params.formattedValues,
            html;
        html = ne.util.map(params.values, function(values, groupIndex) {
            return ne.util.map(values, function(value, index) {
                var bound = groupBounds[groupIndex][index].end,
                    formattedValue = formattedValues[groupIndex][index],
                    labelWidth = renderUtil.getRenderedLabelWidth(formattedValue, {
                        fontSize: LABEL_FONT_SIZE
                    }),
                    left = value >= 0 ? bound.left + bound.width + PLUS_PADDING : bound.left - labelWidth - MINUS_PADDING,
                    labelHtml = this._makeSeriesLabelHtml({
                        left: left,
                        top: bound.top + (bound.height - LABEL_FONT_SIZE) / 2
                    }, formattedValue, groupIndex, index);
                return labelHtml;
            }, this).join('');
        }, this).join('');

        params.container.innerHTML = seriesTemplate.TPL_SERIES_LABEL_AREA({
            html: html
        });

        return params.container.firstChild;
    },


    /**
     * Render stacked series label.
     * @param {object} params parameters
     *      @param {HTMLElement} params.container container
     *      @param {array<array>} params.groupBounds group bounds
     *      @param {array<array>} params.formattedValues formatted values
     * @returns {HTMLElement} series label area
     * @private
     */
    _renderStackedSeriesLabel: function(params) {
        var groupBounds = params.groupBounds,
            formattedValues = params.formattedValues,
            html;
        html = ne.util.map(params.values, function(values, groupIndex) {
            var total = 0,
                labelHtmls, lastLeft, lastTop;
            labelHtmls = ne.util.map(values, function(value, index) {
                var bound, formattedValue, labelWidth, left, top, labelHtml;

                if (value < 0) {
                    return '';
                }

                bound = groupBounds[groupIndex][index].end;
                formattedValue = formattedValues[groupIndex][index];
                labelWidth = renderUtil.getRenderedLabelWidth(formattedValue, {
                    fontSize: LABEL_FONT_SIZE
                });
                left = bound.left + (bound.width - labelWidth) / 2;
                top = bound.top + (bound.height - LABEL_FONT_SIZE) / 2;

                labelHtml = this._makeSeriesLabelHtml({
                    left: left,
                    top: top
                }, formattedValue, groupIndex, index);
                lastLeft = bound.left + bound.width;
                lastTop = top;
                total += value;
                return labelHtml;
            }, this);

            if (this.options.stacked === 'normal') {
                labelHtmls.push(this._makeSeriesLabelHtml({
                    left: lastLeft + PLUS_PADDING,
                    top: lastTop
                }, total, -1, -1))
            }
            return labelHtmls.join('');
        }, this).join('');

        params.container.innerHTML = seriesTemplate.TPL_SERIES_LABEL_AREA({
            html: html
        });

        return params.container.firstChild;
    },

    /**
     * Render series label.
     * @param {object} params parameters
     *      @param {HTMLElement} params.container container
     *      @param {array<array>} params.groupBounds group bounds
     *      @param {array<array>} params.formattedValues formatted values
     * @returns {HTMLElement} series label area
     * @private
     */
    _renderSeriesLabel: function(params) {
        var elSeriesLabelArea;
        if (this.options.stacked) {
            elSeriesLabelArea = this._renderStackedSeriesLabel(params);
        } else {
            elSeriesLabelArea = this._renderNormalSeriesLabel(params);
        }

        // bound 정보를 얻어올 때 사용
        this.groupBounds = params.groupBounds;
        return elSeriesLabelArea;
    },

    /**
     * Get bound.
     * @param {number} groupIndex group index
     * @param {number} index index
     * @returns {left: number, top: number}
     * @private
     */
    _getBound: function(groupIndex, index) {
        if (groupIndex === -1 || index === -1) {
            return null;
        }
        return this.groupBounds[groupIndex][index].end;
    }
});

module.exports = BarChartSeries;
