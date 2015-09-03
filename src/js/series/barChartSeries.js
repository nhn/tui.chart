/**
 * @fileoverview Bar chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series.js'),
    renderUtil = require('../helpers/renderUtil.js');

var HIDDEN_WIDTH = 1;

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
            scaleDistance = this.getScaleDistance(dimension.width, this.data.scale),
            bounds = ne.util.map(groupValues, function(values, groupIndex) {
                var paddingTop = (groupHeight * groupIndex) + (barHeight / 2) + hiddenWidth;
                return ne.util.map(values, function (value, index) {
                    var top = paddingTop + (barHeight * index),
                        startLeft = -HIDDEN_WIDTH,
                        endLeft = startLeft,
                        barWidth = value * dimension.width;
                    if (value < 0) {
                        barWidth *= -1;
                        startLeft += dimension.width - scaleDistance.toMin;
                        endLeft += dimension.width - barWidth - scaleDistance.toMin;
                    } else {
                        startLeft += scaleDistance.toMax;
                        endLeft += scaleDistance.toMax;
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
            bounds = ne.util.map(groupValues, function(values, groupIndex) {
                var paddingTop = (groupHeight * groupIndex) + (barHeight / 2) + hiddenWidth,
                    left = -HIDDEN_WIDTH;
                return ne.util.map(values, function (value) {
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
    }
});

module.exports = BarChartSeries;
