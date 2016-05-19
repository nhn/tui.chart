/**
 * @fileoverview  Chart factory play role register chart.
 *                Also, you can get chart from this factory.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';
var chartConst = require('../const');
var predicate = require('../helpers/predicate');

var charts = {};
var factory = {
    /**
     * Find key for getting chart.
     * @param {string} chartType - type of chart
     * @param {object.<string, Array>} rawSeriesData - raw series data
     * @returns {string}
     * @private
     */
    _findKey: function(chartType, rawSeriesData) {
        var key = null;

        if (predicate.isComboChart(chartType)) {
            if (rawSeriesData[chartConst.CHART_TYPE_COLUMN] && rawSeriesData[chartConst.CHART_TYPE_LINE]) {
                key = chartConst.CHART_TYPE_COLUMN_LINE_COMBO;
            } else if (rawSeriesData[chartConst.CHART_TYPE_PIE] && rawSeriesData[chartConst.CHART_TYPE_DONUT]) {
                key = chartConst.CHART_TYPE_PIE_DONUT_COMBO;
            }
        } else {
            key = chartType;
        }

        return key;
    },

    /**
     * Get chart instance.
     * @param {string} chartType chart type
     * @param {object} rawData chart data
     * @param {object} theme chart options
     * @param {object} options chart options
     * @returns {object} chart instance;
     */
    get: function(chartType, rawData, theme, options) {
        var key = this._findKey(chartType, rawData.series);
        var Chart = charts[key];
        var chart;

        if (!Chart) {
            throw new Error('Not exist ' + chartType + ' chart.');
        }

        chart = new Chart(rawData, theme, options);

        return chart;
    },

    /**
     * Register chart.
     * @param {string} chartType char type
     * @param {class} ChartClass chart class
     */
    register: function(chartType, ChartClass) {
        charts[chartType] = ChartClass;
    }
};

module.exports = factory;
