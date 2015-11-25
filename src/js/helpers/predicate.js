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
     * @memberOf module:predicate
     * @param {string} chartType chart type
     * @returns {boolean} result boolean
     */
    isBarChart: function(chartType) {
        return chartType === chartConst.CHART_TYPE_BAR;
    },

    /**
     * Whether line chart or not.
     * @memberOf module:predicate
     * @param {string} chartType chart type
     * @returns {boolean} result boolean
     */
    isLineChart: function(chartType) {
        return chartType === chartConst.CHART_TYPE_LINE;
    },

    /**
     * Whether line type chart or not.
     * @memberOf module:predicate
     * @param {string} chartType chart type
     * @returns {boolean} result boolean
     */
    isLineTypeChart: function(chartType) {
        return this.isLineChart(chartType) || chartType === chartConst.CHART_TYPE_AREA;
    },

    /**
     * Whether pie chart or not.
     * @memberOf module:predicate
     * @param {string} chartType chart type
     * @returns {boolean} result boolean
     */
    isPieChart: function(chartType) {
        return chartType === chartConst.CHART_TYPE_PIE;
    },

    /**
     * Whether outer legend align or not.
     * @memberOf module:predicate
     * @param {string} align legend type
     * @returns {boolean} result boolean
     */
    isOuterLegendAlign: function(align) {
        return align === chartConst.LEGEND_ALIGN_OUTER;
    },

    /**
     * Whether center legend align or not.
     * @memberOf module:predicate
     * @param {string} align legend type
     * @returns {boolean} result boolean
     */
    isCenterLegendAlign: function(align) {
        return align === chartConst.LEGEND_TYPE_CENTER;
    },

    /**
     * Whether legend align of pie chart or not.
     * @memberOf module:predicate
     * @param {?string} align chart type
     * @returns {boolean} result boolean
     */
    isPieLegendAlign: function(align) {
        var result = false;
        if (align) {
            result = this.isOuterLegendAlign(align) || this.isCenterLegendAlign(align);
        }
        return result;
    }
};

module.exports = predicate;
