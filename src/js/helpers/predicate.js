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
     * Whether column chart or not.
     * @memberOf module:predicate
     * @param {string} chartType chart type
     * @returns {boolean} result boolean
     */
    isColumnChart: function(chartType) {
        return chartType === chartConst.CHART_TYPE_COLUMN;
    },

    /**
     * Whether bar type chart or not.
     * @memberOf module:predicate
     * @param {string} chartType chart type
     * @returns {boolean} result boolean
     */
    isBarTypeChart: function(chartType) {
        return this.isBarChart(chartType) || this.isColumnChart(chartType);
    },

    /**
     * Whether combo chart or not.
     * @memberOf module:predicate
     * @param {string} chartType chart type
     * @returns {boolean} result boolean
     */
    isComboChart: function(chartType) {
        return chartType === chartConst.CHART_TYPE_COMBO;
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
     * Whether area chart or not.
     * @memberOf module:predicate
     * @param {string} chartType chart type
     * @returns {boolean} result boolean
     */
    isAreaChart: function(chartType) {
        return chartType === chartConst.CHART_TYPE_AREA;
    },

    /**
     * Whether line type chart or not.
     * @memberOf module:predicate
     * @param {string} chartType chart type
     * @returns {boolean} result boolean
     */
    isLineTypeChart: function(chartType) {
        return this.isLineChart(chartType) || this.isAreaChart(chartType);
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
     * Whether map chart or not.
     * @memberOf module:predicate
     * @param {string} chartType chart type
     * @returns {boolean} result boolean
     */
    isMapChart: function(chartType) {
        return chartType === chartConst.CHART_TYPE_MAP;
    },

    /**
     * Whether mouse position chart or not.
     * @param {string} chartType chart type
     * @returns {boolean} result boolean
     */
    isMousePositionChart: function(chartType) {
        return this.isPieChart(chartType) || this.isMapChart(chartType);
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
        return align === chartConst.LEGEND_ALIGN_CENTER;
    },

    /**
     * Whether left legend align or not.
     * @memberOf module:predicate
     * @param {string} align legend type
     * @returns {boolean} result boolean
     */
    isLeftLegendAlign: function(align) {
        return align === chartConst.LEGEND_ALIGN_LEFT;
    },

    /**
     * Whether top legend align or not.
     * @memberOf module:predicate
     * @param {string} align legend type
     * @returns {boolean} result boolean
     */
    isTopLegendAlign: function(align) {
        return align === chartConst.LEGEND_ALIGN_TOP;
    },

    /**
     * Whether bottom legend align or not.
     * @memberOf module:predicate
     * @param {string} align legend type
     * @returns {boolean} result boolean
     */
    isBottomLegendAlign: function(align) {
        return align === chartConst.LEGEND_ALIGN_BOTTOM;
    },

    /**
     * Whether horizontal legend align or not.
     * @param {string} align align
     * @returns {boolean} result boolean
     */
    isHorizontalLegend: function(align) {
        return this.isTopLegendAlign(align) || this.isBottomLegendAlign(align);
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
    },

    /**
     * Whether allowed stacked option or not.
     * @param {string} chartType chart type
     * @returns {boolean} result boolean
     */
    isAllowedStackedOption: function(chartType) {
        return this.isBarChart(chartType) || this.isColumnChart(chartType) || this.isAreaChart(chartType);
    },

    /**
     * Whether normal stacked or not.
     * @param {boolean} stacked stacked option
     * @returns {boolean} result boolean
     */
    isNormalStacked: function(stacked) {
        return stacked === chartConst.STACKED_NORMAL_TYPE;
    },

    /**
     * Whether percent stacked or not.
     * @param {boolean} stacked stacked option
     * @returns {boolean} result boolean
     */
    isPercentStacked: function(stacked) {
        return stacked === chartConst.STACKED_PERCENT_TYPE;
    },

    /**
     * Whether valid stacked option or not.
     * @param {boolean} stacked stacked option
     * @returns {boolean} result boolean
     */
    isValidStackedOption: function(stacked) {
        return stacked && (this.isNormalStacked(stacked) || this.isPercentStacked(stacked));
    }
};

module.exports = predicate;
