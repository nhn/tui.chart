/**
 * @fileoverview ChartModel is parent of all of chart model.
 *               This model provides a method to convert the data.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Model = require('./model.js'),
    chartConst = require('../const.js');

var ChartModel = ne.util.defineClass(Model, /** @lends ChartModel.prototype */ {
    /**
     * ChartModel is parent of all of chart model.
     * This model provides a method to convert the data.
     * @constructs ChartModel
     * @extends Model
     * @param {array.<array>} data user chart data
     * @param {{
     *   chart: {
     *     width: number,
     *     height: number,
     *     title: string,
     *     format: string
     *   },
     *   vAxis: {
     *     title: string,
     *     min: number
     *   },
     *   hAxis: {
     *     title: string,
     *     min: number
     *   },
     *   tooltip: {
     *     suffix: string,
     *     template: string
     *   },
     *   theme: string
     * }} options chart options
     */
    init: function(data, options) {
        var chartOptions;
        options = options || {};
        chartOptions = options.chart || {};

        /**
         * options
         * @type {object}
         */
        this.options = options;

        /**
         * Chart dimension
         * @type {{width: number, height: number}}
        */
        this.dimension = {
            width: chartConst.CHART_DEFAULT_WIDTH,
            height: chartConst.CHART_DEFAULT_HEIGHT
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
     * Set data.
     * @private
     */
    _setData: function() {
        throw new Error('Please implement the setData.');
    },

    /**
     * Pick values from axis data.
     * @param {array.<array>} axisData axis data
     * @returns {string[]} values
     */
    pickValues: function(axisData) {
        var result = ne.util.map(axisData, function(items) {
            return items.slice(1);
        });
        return this.arrayPivot(result);
    },

    /**
     * Pick legend labels from axis data.
     * @param {array.<array>} axisData axis data
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
     * @param {function[]} formatFunctions format functions
     * @returns {string[]} formatted values
     */
    formatValues: function(groupValues, formatFunctions) {
        var result = ne.util.map(groupValues, function(values) {
            return ne.util.map(values, function(value) {
                var fns = [value].concat(formatFunctions);
                return ne.util.reduce(fns, function(stored, fn) {
                    return fn(stored);
                });
            });
        });
        return result;
    }
});

module.exports = ChartModel;
