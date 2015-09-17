/**
 * @fileoverview Column chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series.js'),
    seriesTemplate = require('./seriesTemplate.js'),
    chartConst = require('../const.js'),
    renderUtil = require('../helpers/renderUtil.js');

var ColumnChartSeries = ne.util.defineClass(Series, /** @lends Series.prototype */ {
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
     * To make bounds of column chart.
     * @param {{width: number, height:number}} dimension column chart dimension
     * @returns {array.<array.<object>>} bounds
     */
    _makeBounds: function(dimension) {
        if (!this.options.stacked) {
            return this._makeNormalColumnBounds(dimension);
        } else {
            return this._makeStackedColumnBounds(dimension);
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
     * To make bounds of normal column chart.
     * @param {{width: number, height:number}} dimension column chart dimension
     * @returns {array.<array.<object>>} bounds
     * @private
     */
    _makeNormalColumnBounds: function(dimension) {
        var groupValues = this.percentValues,
            groupWidth = (dimension.width / groupValues.length),
            barWidth = groupWidth / (groupValues[0].length + 1),
            isMinus = this.data.scale.min < 0 && this.data.scale.max <= 0,
            scaleDistance = this.getScaleDistanceFromZeroPoint(dimension.height, this.data.scale),
            bounds = ne.util.map(groupValues, function(values, groupIndex) {
                var paddingLeft = (groupWidth * groupIndex) + (barWidth / 2);
                return ne.util.map(values, function (value, index) {
                    var barHeight = value * dimension.height,
                        endTop = dimension.height - barHeight + chartConst.HIDDEN_WIDTH,
                        startTop = endTop + barHeight,
                        left = paddingLeft + (barWidth * index) - chartConst.HIDDEN_WIDTH;

                    if (isMinus) {
                        barHeight *= -1;
                        startTop = 0;
                        endTop = 0;
                    } else if (value < 0) {
                        barHeight *= -1;
                        startTop = endTop = dimension.height - scaleDistance.toMin;
                    } else {
                        startTop -= scaleDistance.toMin;
                        endTop -= scaleDistance.toMin;
                    }

                    return {
                        start: {
                            top: startTop,
                            left: left,
                            width: barWidth,
                            height: 0
                        },
                        end: {
                            top: endTop,
                            left: left,
                            width: barWidth,
                            height: barHeight
                        }
                    };
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
    _makeStackedColumnBounds: function(dimension) {
        var groupValues = this.percentValues,
            groupWidth = (dimension.width / groupValues.length),
            barWidth = groupWidth / 2,
            bounds = ne.util.map(groupValues, function(values, groupIndex) {
                var paddingLeft = (groupWidth * groupIndex) + (barWidth / 2),
                    top = 0;
                return ne.util.map(values, function (value) {
                    if (value < 0) {
                        return;
                    }
                    var height = value * dimension.height,
                        bound = {
                            start: {
                                top: dimension.height,
                                left: paddingLeft,
                                width: barWidth,
                                height: 0
                            },
                            end: {
                                top: dimension.height - height - top,
                                left: paddingLeft,
                                width: barWidth,
                                height: height
                            }
                        };
                    top += height;
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
            labelHeight = renderUtil.getRenderedLabelHeight(formattedValues[0][0], {
                fontSize: chartConst.DEFAULT_LABEL_FONT_SIZE
            }),
            html;
        html = ne.util.map(params.values, function(values, groupIndex) {
            return ne.util.map(values, function(value, index) {
                var bound = groupBounds[groupIndex][index].end,
                    formattedValue = formattedValues[groupIndex][index],
                    labelWidth = renderUtil.getRenderedLabelWidth(formattedValue, {
                        fontSize: chartConst.DEFAULT_LABEL_FONT_SIZE
                    }),
                    top = bound.top,
                    labelHtml;

                if (value >= 0) {
                    top -= labelHeight + chartConst.SERIES_LABEL_PADDING;
                } else {
                    top += bound.height + chartConst.SERIES_LABEL_PADDING;
                }

                labelHtml = this._makeSeriesLabelHtml({
                    left: bound.left + (bound.width - labelWidth) / 2,
                    top: top
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
            formatFunctions = params.formatFunctions || [],
            html;
        html = ne.util.map(params.values, function(values, groupIndex) {
            var total = 0,
                labelHeight = renderUtil.getRenderedLabelHeight(formattedValues[0][0], {
                    fontSize: chartConst.DEFAULT_LABEL_FONT_SIZE
                }),
                labelHtmls, lastLeft, lastTop, fns, totalLabelWidth;
            labelHtmls = ne.util.map(values, function(value, index) {
                var bound, formattedValue, labelWidth, left, top, labelHtml;

                if (value < 0) {
                    return '';
                }

                bound = groupBounds[groupIndex][index].end;
                formattedValue = formattedValues[groupIndex][index];
                labelWidth = renderUtil.getRenderedLabelWidth(formattedValue, {
                    fontSize: chartConst.DEFAULT_LABEL_FONT_SIZE
                });
                left = bound.left + (bound.width - labelWidth + chartConst.TEXT_PADDING) / 2;
                top = bound.top + (bound.height - labelHeight + chartConst.TEXT_PADDING) / 2;
                labelHtml = this._makeSeriesLabelHtml({
                    left: left,
                    top: top
                }, formattedValue, groupIndex, index);
                lastLeft = bound.left + (bound.width / 2);
                lastTop = bound.top;
                total += value;
                return labelHtml;
            }, this);

            if (this.options.stacked === 'normal') {
                fns = [total].concat(formatFunctions);
                total = ne.util.reduce(fns, function(stored, fn) {
                    return fn(stored);
                });
                totalLabelWidth = renderUtil.getRenderedLabelWidth(total, {
                    fontSize: chartConst.DEFAULT_LABEL_FONT_SIZE
                });

                labelHtmls.push(this._makeSeriesLabelHtml({
                    left: lastLeft - (totalLabelWidth - chartConst.TEXT_PADDING) / 2,
                    top: lastTop - labelHeight - chartConst.SERIES_LABEL_PADDING
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

module.exports = ColumnChartSeries;
