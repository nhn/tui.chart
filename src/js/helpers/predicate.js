/**
 * @fileoverview Predicate.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const');

/**
 * predicate.
 * @module predicate
 */
var predicate = {
    /**
     * Whether bar chart or not.
     * @param {string} chartType chart type
     * @returns {boolean} result boolean
     */
    isBarChart: function(chartType) {
        return chartType === chartConst.CHART_TYPE_BAR;
    },

    /**
     * Whether line chart or not.
     * @param {string} chartType chart type
     * @returns {boolean} result boolean
     */
    isLineChart: function(chartType) {
        return chartType === chartConst.CHART_TYPE_LINE;
    },

    /**
     * Whether line type chart or not.
     * @param {string} chartType chart type
     * @returns {boolean} result boolean
     */
    isLineTypeChart: function(chartType) {
        return this.isLineChart(chartType) || chartType === chartConst.CHART_TYPE_AREA;
    },

    /**
     * Whether pie chart or not.
     * @param {string} chartType chart type
     * @returns {boolean} result boolean
     */
    isPieChart: function(chartType) {
        return chartType === chartConst.CHART_TYPE_PIE;
    },

    /**
     * Whether outer legend type or not.
     * @param {string} legendType legend type
     * @returns {boolean} result boolean
     */
    isOuterLegendType: function(legendType) {
        return legendType === chartConst.LEGEND_TYPE_OUTER;
    },

    /**
     * Whether center legend type or not.
     * @param {string} legendType legend type
     * @returns {boolean} result boolean
     */
    isCenterLegendType: function(legendType) {
        return legendType === chartConst.LEGEND_TYPE_CENTER;
    },

    /**
     * Whether pie legend type or not.
     * @param {?string} legendType chart type
     * @returns {boolean} result boolean
     */
    isPieLegendType: function(legendType) {
        var result = false;
        if (legendType) {
            result = this.isOuterLegendType(legendType) || this.isCenterLegendType(legendType);
        }
        return result;
    },

    /**
     * Whether hidden legend type or not.
     * @param {string} legendType legend type
     * @returns {boolean} result boolean
     */
    isHiddenLegendType: function(legendType) {
        return legendType === chartConst.LEGEND_TYPE_HIDDEN;
    }
};

module.exports = predicate;
