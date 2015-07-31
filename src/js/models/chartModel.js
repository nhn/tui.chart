/**
 * @fileoverview ChartModel is parent of all of chart model.
 *               This model provides a method to convert the data.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Model = require('./model.js');

var ChartModel = ne.util.defineClass(Model, /** @lends ChartModel.prototype */ {
    /**
     * ChartModel is parent of all of chart model.
     * This model provides a method to convert the data.
     * @constructs ChartModel
     * @extends Model
     * @param {object} data user chart data
     * @param {object} options user options
     */
    init: function(data, options) {
        var chartOptions;
        options = options || {};
        chartOptions = options.chart || {};

        /**
         * Chart options
         * @type {object}
         */
        this.options = options;

        /**
         * Chart dimension
         * @type {{width: number, height: number}}
        */
        this.dimension = {
            width: 500,
            height: 300
        };

        if (chartOptions.width) {
            this.dimension.width = chartOptions.width;
        }

        if (chartOptions.height) {
            this.dimension.height = chartOptions.height;
        }

        /**
         * Chart title
         * @type {string}
         */
        this.title = chartOptions.title || '';

        if (data) {
            this._setData(data);
        }
    },

    /**
     * Please implement the setData.
     * @private
     */
    _setData: function() {
        throw new Error('Please implement the setData.');
    },

    /**
     * Pick axis data from user data.
     * Axis data is pairs of label and value.
     * @param {object} data user data
     * @return {object} axis data;
     */
    pickAxisData: function(data) {
        var titles = data[0],
            axisData = data.slice();

        axisData.shift();

        if (this._hasStyleOption(titles)) {
            axisData = ne.util.map(axisData, function(items) {
                items = items.slice();
                items.length = items.length - 1;
                return items;
            });
        }

        return axisData;
    },

    /**
     * Pick labels.
     * @param {string[]} labels labels
     * @returns {string[]} labels
     */
    pickLabels: function(labels) {
        var hasOption = this._hasStyleOption(labels),
            last = hasOption ? labels.length - 1 : -1,
            result = ne.util.filter(labels, function(label, index) {
                return index !== 0 && index !== last;
            });
        return result;
    },

    /**
     * Pick values from axis data.
     * @param {array.<object>} axisData axis data
     * @returns {string[]} values
     */
    pickValues: function(axisData) {
        var result = ne.util.map(axisData, function(items) {
            var values = items.slice();
            values.shift();
            return values;
        });

        return this.arrayPivot(result);
    },

    /**
     * Has style option?
     * @param {string[]} arr labels
     * @returns {boolean} has style option?
     * @private
     */
    _hasStyleOption: function(arr) {
        var last = arr[arr.length - 1];
        return ne.util.isObject(last) && last.role === 'style';
    },

    /**
     * Pick legend labels from axis data.
     * @param {object} axisData axis data
     * @returns {string[]} labels
     */
    pickLegendLabels: function(axisData) {
        var labels = ne.util.map(axisData, function(items) {
            return items[0];
        });
        return labels;
    },

    /**
     * Format values.
     * @param {array.<array.<number>>} groupValues values
     * @param {function[]} formatFns format functions
     * @returns {string[]} formatted values
     */
    formatValues: function(groupValues, formatFns) {
        var result = ne.util.map(groupValues, function(values) {
            return ne.util.map(values, function(value) {
                var fns = [value].concat(formatFns);
                return ne.util.reduce(fns, function(stored, fn) {
                    return fn(stored);
                });
            });
        });
        return result;
    }
});

module.exports = ChartModel;
