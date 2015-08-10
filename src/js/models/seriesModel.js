/**
 * @fileoverview SeriesModel is model for management of series data.
 *               Series data used for draw the series area.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Model = require('./model.js'),
    chartConst = require('../const.js');

var HIDDEN_WIDTH = 1;

var SeriesModel = ne.util.defineClass(Model, /** @lends SeriesModel.prototype */ {
    /**
     * SeriesModel is model for management of series data.
     * Series data used for draw the series area.
     * @constructs SeriesModel
     * @extends Model
     * @param {{
     *   values: array.<array.<number>>,
     *   formatValue: array.<array.<string>>,
     *   scale: {min: number, max: number},
     *   isVertical: boolean
     * }} data series data
     * @param {{hasDot: boolean, stacked: string}} options series options
     */
    init: function(data, options) {
        /**
         * Series options
         * @type {{hasDot: boolean, stacked: string}}
         */
        this.options = options = options || {};
        /**
         * Series makers
         * @type {array.<array>}
         */
        this.markers = [];

        /**
         * Series percent values
         * @type {Array}
         */
        this.percentValues = [];

        /**
         * Axis scale
         * @type {{min: number, max: number}}
         */
        this.tickScale = {};

        /**
         * Series colors
         * @type {Array}
         */
        this.colors = [];

        if (data) {
            this._setData(data);
        }
    },

    /**
     * Set series data.
     * @param {{values: array, scale: object, colors: array}} data series data
     * @private
     */
    _setData: function(data) {
        var stacked;

        if (!data || ne.util.isEmpty(data.values) || !data.scale) {
            throw new Error('Invalid series data.');
        }

        stacked = this.options.stacked;

        this.markers = data.formatValues;

        if (stacked === chartConst.STACKED_NORMAL_TYPE) {
            this.percentValues = this._makeNormalStackedPercentValues(data.values, data.scale);
        } else if (stacked === chartConst.STACKED_PERCENT_TYPE) {
            this.percentValues = this._makePercentStackedPercentValues(data.values, data.scale);
        } else {
            this.percentValues = this._makePercentValues(data.values, data.scale);
        }
        this.isVertical = data.isVertical;
        this.tooltipPosition = data.tooltipPositoin;
    },

    /**
     * Convert two dimensional(2d) values.
     * @param {array.<array>} groupValues target 2d array
     * @param {function} condition convert condition function
     * @returns {array.<array>} 2d array
     * @private
     */
    _convertValues: function(groupValues, condition) {
        var result = ne.util.map(groupValues, function(values) {
            return ne.util.map(values, condition);
        });
        return result;
    },

    /**
     * To make percent values about normal stacked option.
     * @param {array.<array>} groupValues group values
     * @param {{min:number, max:number}} scale min, max scale
     * @returns {array} percent values about normal stacked option.
     * @private
     */
    _makeNormalStackedPercentValues: function(groupValues, scale) {
        var min = scale.min,
            max = scale.max,
            distance = max - min,
            percentValues = ne.util.map(groupValues, function(values) {
                var plusValues = ne.util.filter(values, function(value) {
                    return value > 0;
                });
                var sum = ne.util.sum(plusValues),
                    groupPercent = (sum - min) / distance;
                return ne.util.map(values, function(value) {
                    return groupPercent * (value / sum);
                });
            });
        return percentValues;
    },

    /**
     * To make percent values about percent stacked option.
     * @param {array.<array>} groupValues group values
     * @param {{min:number, max:number}} scale min, max scale
     * @returns {array} percent values about percent stacked option
     * @private
     */
    _makePercentStackedPercentValues: function(groupValues) {
        var percentValues = ne.util.map(groupValues, function(values) {
                var plusValues = ne.util.filter(values, function(value) {
                    return value > 0;
                });
                var sum = ne.util.sum(plusValues);
                return ne.util.map(values, function(value) {
                    return value / sum;
                });
            });
        return percentValues;
    },

    /**
     * To make percent value.
     * @param {array.<array.<number>>} groupValues axis percent values
     * @param {{min:number, max:number}} scale min, max scale
     * @returns {array.<array.<number>>} percent values
     * @private
     */
    _makePercentValues: function(groupValues, scale) {
        var min = scale.min,
            max = scale.max,
            distance = max - min,
            percentValues = this._convertValues(groupValues, function(value) {
                return (value - min) / distance;
            });
        return percentValues;
    },

    /**
     * To make bounds of column chart.
     * @param {{width: number, height:number}} dimension column chart dimension
     * @returns {array.<array.<object>>} bounds
     */
    makeColumnBounds: function(dimension) {
        if (!this.options.stacked) {
            return this.makeNormalColumnBounds(dimension);
        } else {
            return this._makeStackedColumnBounds(dimension);
        }
    },

    /**
     * To make bounds of normal column chart.
     * @param {{width: number, height:number}} dimension column chart dimension
     * @returns {array.<array.<object>>} bounds
     */
    makeNormalColumnBounds: function(dimension) {
        var groupValues = this.percentValues,
            groupWidth = (dimension.width / groupValues.length),
            barWidth = groupWidth / (groupValues[0].length + 1),
            bounds = ne.util.map(groupValues, function(values, groupIndex) {
                var paddingLeft = (groupWidth * groupIndex) + (barWidth / 2);
                return ne.util.map(values, function (value, index) {
                    var barHeight = value * dimension.height;
                    return {
                        top: dimension.height - barHeight + HIDDEN_WIDTH,
                        left: paddingLeft + (barWidth * index),
                        width: barWidth,
                        height: barHeight
                    };
                }, this);
            });
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
                    var height = value * dimension.height,
                        bound = {
                            top: dimension.height - height - top,
                            left: paddingLeft,
                            width: barWidth,
                            height: height
                        };
                    top += height;
                    return bound;
                }, this);
            });
        return bounds;
    },

    /**
     * To make bounds of bar chart.
     * @param {{width: number, height:number}} dimension bar chart dimension
     * @param {number} hiddenWidth hidden width
     * @returns {array.<array.<object>>} bounds
     */
    makeBarBounds: function(dimension, hiddenWidth) {
        if (!this.options.stacked) {
            return this._makeNormalBarBounds(dimension, hiddenWidth);
        } else {
            return this._makeStackedBarBounds(dimension, hiddenWidth);
        }
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
            bounds = ne.util.map(groupValues, function(values, groupIndex) {
                var paddingTop = (groupHeight * groupIndex) + (barHeight / 2) + hiddenWidth;
                return ne.util.map(values, function (value, index) {
                    return {
                        top: paddingTop + (barHeight * index),
                        left: -HIDDEN_WIDTH,
                        width: value * dimension.width,
                        height: barHeight
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
                            top: paddingTop,
                            left: left,
                            width: width,
                            height: barHeight
                        };
                    left = left + width;
                    return bound;
                }, this);
            });
        return bounds;
    },

    /**
     * To make positions of line chart.
     * @param {{width: number, height:nunber}} dimension line chart dimension
     * @returns {array.<array.<object>>} positions
     */
    makeLinePositions: function(dimension) {
        var groupValues = this.percentValues,
            width = dimension.width,
            height = dimension.height,
            step = width / groupValues[0].length,
            start = step / 2,
            result = ne.util.map(groupValues, function(values) {
                return ne.util.map(values, function(value, index) {
                    return {
                        left: start + (step * index),
                        top: height - (value * height)
                    };
                });
            });
        return result;
    }
});

module.exports = SeriesModel;