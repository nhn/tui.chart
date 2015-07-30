/**
 * @fileoverview SeriesModel is model for management of series data.
 *               Series data used to draw the series area.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Model = require('./model.js');

var HIDDEN_WIDTH = 1;

var SeriesModel = ne.util.defineClass(Model, /** @lends SeriesModel.prototype */ {
    /**
     * SeriesModel is model for management of series data.
     * Series data used to draw the series area.
     * @constructs SeriesModel
     * @extends Model
     * @param {object} data series data
     * @param {object} options options
     */
    init: function(data, options) {
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
        if (!data || ne.util.isEmpty(data.values) || !data.scale) {
            throw new Error('Invalid series data.');
        }

        this.markers = data.formatValues;
        this.percentValues = this._makePercentValues(data.values, data.scale);
        this.isVertical = data.isVertical;
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
     * Make to percent value.
     * @param {array.<array.<number>>} values values
     * @param {{min:number, max:number}} scale min, max scale
     * @returns {array.<array.<number>>} percent values
     * @private
     */
    _makePercentValues: function(values, scale) {
        var min = scale.min,
            max = scale.max,
            percentValues = this._convertValues(values, function(value) {
                return (value - min) / (max - min);
            });
        return percentValues;
    },

    /**
     * Make column chart bounds.
     * @param {{width: number, height:nunber}} dimension dimension
     * @returns {array.<array.<object>>} bounds
     */
    makeColumnBounds: function(dimension) {
        var groupValues = this.percentValues,
            maxBarWidth = (dimension.width / groupValues.length),
            barWidth = parseInt(maxBarWidth / (groupValues[0].length + 1), 10),
            bounds = ne.util.map(groupValues, function(values, groupIndex) {
                var paddingLeft = (maxBarWidth * groupIndex) + (barWidth / 2);
                return ne.util.map(values, function (value, index) {
                    var barHeight = parseInt(value * dimension.height, 10);
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
     * Make bar chart bounds.
     * @param {{width: number, height:nunber}} dimension dimension
     * @param {number} hiddenWidth hidden width
     * @returns {array.<array.<object>>} bounds
     */
    makeBarBounds: function(dimension, hiddenWidth) {
        var groupValues = this.percentValues,
            maxBarHeight = (dimension.height / groupValues.length),
            barHeight = parseInt(maxBarHeight / (groupValues[0].length + 1), 10),
            bounds = ne.util.map(groupValues, function(values, groupIndex) {
                var paddingTop = (maxBarHeight * groupIndex) + (barHeight / 2) + hiddenWidth;
                return ne.util.map(values, function (value, index) {
                    return {
                        top: paddingTop + (barHeight * index),
                        left: -HIDDEN_WIDTH,
                        width: parseInt(value * dimension.width, 10),
                        height: barHeight
                    };
                }, this);
            });
        return bounds;
    },

    /**
     * Make line chart positions.
     * @param {{width: number, height:nunber}} dimension dimension
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