/**
 * @fileoverview  Chart factory play role register chart.
 *                Also, you can get chart from this factory.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const');
var rawDataHandler = require('../models/data/rawDataHandler');
var predicate = require('../helpers/predicate');

var charts = {};
var factory = {
    /**
     * Find key for getting chart.
     * @param {string} chartType - type of chart
     * @param {{seriesAlias: ?object, series: object.<string, Array>}} rawData - raw data
     * @returns {string}
     * @private
     */
    _findKey: function(chartType, rawData) {
        var key = null;
        var chartTypeMap;

        if (predicate.isComboChart(chartType)) {
            chartTypeMap = rawDataHandler.getChartTypeMap(rawData);

            if (chartTypeMap[chartConst.CHART_TYPE_COLUMN] && chartTypeMap[chartConst.CHART_TYPE_LINE]) {
                key = chartConst.CHART_TYPE_COLUMN_LINE_COMBO;
            } else if (chartTypeMap[chartConst.CHART_TYPE_LINE] && chartTypeMap[chartConst.CHART_TYPE_SCATTER]) {
                key = chartConst.CHART_TYPE_LINE_SCATTER_COMBO;
            } else if (chartTypeMap[chartConst.CHART_TYPE_AREA] && chartTypeMap[chartConst.CHART_TYPE_LINE]) {
                key = chartConst.CHART_TYPE_LINE_AREA_COMBO;
            } else if (chartTypeMap[chartConst.CHART_TYPE_PIE]) {
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
        var key = this._findKey(chartType, rawData);
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
