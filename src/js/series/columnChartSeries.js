/**
 * @fileoverview Column chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series.js'),
    chartConst = require('../const.js'),
    dom = require('../helpers/domHandler.js'),
    renderUtil = require('../helpers/renderUtil.js');

var ColumnChartSeries = ne.util.defineClass(Series, /** @lends ColumnChartSeries.prototype */ {
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
     * @private
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
        var gropuBounds = this._makeBounds(this.bound.dimension);

        this.groupBounds = gropuBounds;

        return {
            groupBounds: gropuBounds
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
                    var height, bound;
                    if (value < 0) {
                        return null;
                    }
                    height = value * dimension.height;
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
     *      @param {array.<array>} params.groupBounds group bounds
     *      @param {array.<array>} params.formattedValues formatted values
     * @returns {HTMLElement} series label area
     * @private
     */
    _renderNormalSeriesLabel: function(params) {
        var groupBounds = params.groupBounds,
            formattedValues = params.formattedValues,
            labelHeight = renderUtil.getRenderedLabelHeight(formattedValues[0][0], this.theme.label),
            elSeriesLabelArea = dom.create('div', 'ne-chart-series-label-area'),
            html;
        html = ne.util.map(params.values, function(values, groupIndex) {
            return ne.util.map(values, function(value, index) {
                var bound = groupBounds[groupIndex][index].end,
                    formattedValue = formattedValues[groupIndex][index],
                    labelWidth = renderUtil.getRenderedLabelWidth(formattedValue, this.theme.label),
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

        elSeriesLabelArea.innerHTML = html;
        params.container.appendChild(elSeriesLabelArea);

        return elSeriesLabelArea;
    },

    /**
     * To make sum label html.
     * @param {object} params parameters
     *      @param {array.<number>} params.values values
     *      @param {array.<function>} params.formatFunctions formatting functions
     *      @param {{left: number, top: number}} params.bound bound
     *      @param {number} params.labelHeight label height
     * @returns {string} sum label html
     * @private
     */
    _makeSumLabelHtml: function(params) {
        var sum = ne.util.sum(params.values),
            fns = [sum].concat(params.formatFunctions),
            bound = params.bound,
            left = bound.left + (bound.width / 2),
            totalLabelWidth;

        sum = ne.util.reduce(fns, function(stored, fn) {
            return fn(stored);
        });

        totalLabelWidth = renderUtil.getRenderedLabelWidth(sum, this.theme.label);

        return this._makeSeriesLabelHtml({
            left: left - (totalLabelWidth - chartConst.TEXT_PADDING) / 2,
            top: bound.top - params.labelHeight - chartConst.SERIES_LABEL_PADDING
        }, sum, -1, -1);
    },

    /**
     * To make stacked labels html.
     * @param {object} params parameters
     *      @param {number} params.groupIndex group index
     *      @param {array.<number>} params.values values,
     *      @param {array.<function>} params.formatFunctions formatting functions,
     *      @param {array.<object>} params.bounds bounds,
     *      @param {array} params.formattedValues formatted values,
     *      @param {number} params.labelHeight label height
     * @returns {string} labels html
     * @private
     */
    _makeStackedLabelsHtml: function(params) {
        var values = params.values,
            bound, htmls;

        htmls = ne.util.map(params.values, function(value, index) {
            var labelWidth, left, top, labelHtml, formattedValue;

            if (value < 0) {
                return '';
            }

            bound = params.bounds[index].end;
            formattedValue = params.formattedValues[index];
            labelWidth = renderUtil.getRenderedLabelWidth(formattedValue, this.theme.label);
            left = bound.left + ((bound.width - labelWidth + chartConst.TEXT_PADDING) / 2);
            top = bound.top + ((bound.height - params.labelHeight + chartConst.TEXT_PADDING) / 2);
            labelHtml = this._makeSeriesLabelHtml({
                left: left,
                top: top
            }, formattedValue, params.groupIndex, index);
            return labelHtml;
        }, this);

        if (this.options.stacked === 'normal') {
            htmls.push(this._makeSumLabelHtml({
                values: values,
                formatFunctions: params.formatFunctions,
                bound: bound,
                labelHeight: params.labelHeight
            }));
        }
        return htmls.join('');
    },

    /**
     * Render stacked series label.
     * @param {object} params parameters
     *      @param {HTMLElement} params.container container
     *      @param {array.<array>} params.groupBounds group bounds
     *      @param {array.<array>} params.formattedValues formatted values
     * @returns {HTMLElement} series label area
     * @private
     */
    _renderStackedSeriesLabel: function(params) {
        var groupBounds = params.groupBounds,
            formattedValues = params.formattedValues,
            formatFunctions = params.formatFunctions || [],
            elSeriesLabelArea = dom.create('div', 'ne-chart-series-label-area'),
            labelHeight = renderUtil.getRenderedLabelHeight(formattedValues[0][0], this.theme.label),
            html;

        html = ne.util.map(params.values, function(values, index) {
            var labelsHtml = this._makeStackedLabelsHtml({
                    groupIndex: index,
                    values: values,
                    formatFunctions: formatFunctions,
                    bounds: groupBounds[index],
                    formattedValues: formattedValues[index],
                    labelHeight: labelHeight
                });
            return labelsHtml;
        }, this).join('');

        elSeriesLabelArea.innerHTML = html;
        params.container.appendChild(elSeriesLabelArea);

        return elSeriesLabelArea;
    },

    /**
     * Render series label.
     * @param {object} params parameters
     *      @param {HTMLElement} params.container container
     *      @param {array.<array>} params.groupBounds group bounds
     *      @param {array.<array>} params.formattedValues formatted values
     * @returns {HTMLElement} series label area
     * @private
     */
    _renderSeriesLabel: function(params) {
        var elSeriesLabelArea;
        if (!this.options.showLabel) {
            return null;
        }

        if (this.options.stacked) {
            elSeriesLabelArea = this._renderStackedSeriesLabel(params);
        } else {
            elSeriesLabelArea = this._renderNormalSeriesLabel(params);
        }
        return elSeriesLabelArea;
    },

    /**
     * Get bound.
     * @param {number} groupIndex group index
     * @param {number} index index
     * @returns {{left: number, top: number}} bound
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
