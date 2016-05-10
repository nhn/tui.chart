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
     * Whether bubble chart or not.
     * @memberOf module:predicate
     * @param {string} chartType chart type
     * @returns {boolean} result boolean
     */
    isBubbleChart: function(chartType) {
        return chartType === chartConst.CHART_TYPE_BUBBLE;
    },

    /**
     * Whether scatter chart or not.
     * @memberOf module:predicate
     * @param {string} chartType - chart type
     * @returns {boolean}
     */
    isScatterChart: function(chartType) {
        return chartType === chartConst.CHART_TYPE_SCATTER;
    },

    /**
     * Whether pie chart or not.
     * @memberOf module:predicate
     * @param {string} chartType - chart type
     * @returns {boolean}
     */
    isPieChart: function(chartType) {
        return chartType === chartConst.CHART_TYPE_PIE;
    },

    /**
     * Whether donut chart or not.
     * @memberOf module:predicate
     * @param {string} chartType -chart type
     * @returns {boolean}
     */
    isDonutChart: function(chartType) {
        return chartType === chartConst.CHART_TYPE_DONUT;
    },

    /**
     * Whether pie type chart or not.
     * @param {string} chartType - chart type
     * @returns {boolean}
     */
    isPieTypeChart: function(chartType) {
        return this.isPieChart(chartType) || this.isDonutChart(chartType);
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
     * Whether coordinate type chart or not.
     * @memberOf module:predicate
     * @param {string} chartType - chart type
     * @returns {boolean}
     */
    isCoordinateTypeChart: function(chartType) {
        return this.isBubbleChart(chartType) || this.isScatterChart(chartType);
    },

    /**
     * Whether allow rendering for minus point in area of series.
     * @memberOf module:predicate
     * @param {string} chartType - chart type
     * @returns {boolean}
     */
    allowMinusPointRender: function(chartType) {
        return this.isLineTypeChart(chartType) || this.isCoordinateTypeChart(chartType);
    },

    /**
     * Whether mouse position chart or not.
     * @memberOf module:predicate
     * @param {string} chartType chart type
     * @returns {boolean} result boolean
     */
    isMousePositionChart: function(chartType) {
        return this.isPieTypeChart(chartType) || this.isMapChart(chartType) || this.isCoordinateTypeChart(chartType);
    },

    /**
     * Whether align of legend is outer or not.
     * @memberOf module:predicate
     * @param {string} align legend type
     * @returns {boolean} result boolean
     */
    isLegendAlignOuter: function(align) {
        return align === chartConst.LEGEND_ALIGN_OUTER;
    },

    /**
     * Whether align of legend is center or not.
     * @memberOf module:predicate
     * @param {string} align legend type
     * @returns {boolean} result boolean
     */
    isLegendAlignCenter: function(align) {
        return align === chartConst.LEGEND_ALIGN_CENTER;
    },

    /**
     * Whether align of legend is left or not.
     * @memberOf module:predicate
     * @param {string} align legend type
     * @returns {boolean} result boolean
     */
    isLegendAlignLeft: function(align) {
        return align === chartConst.LEGEND_ALIGN_LEFT;
    },

    /**
     * Whether align of legend is top or not.
     * @memberOf module:predicate
     * @param {string} align legend type
     * @returns {boolean} result boolean
     */
    isLegendAlignTop: function(align) {
        return align === chartConst.LEGEND_ALIGN_TOP;
    },

    /**
     * Whether align of legend is bottom or not.
     * @memberOf module:predicate
     * @param {string} align legend type
     * @returns {boolean} result boolean
     */
    isLegendAlignBottom: function(align) {
        return align === chartConst.LEGEND_ALIGN_BOTTOM;
    },

    /**
     * Whether horizontal legend align or not.
     * @memberOf module:predicate
     * @param {string} align align
     * @returns {boolean} result boolean
     */
    isHorizontalLegend: function(align) {
        return this.isLegendAlignTop(align) || this.isLegendAlignBottom(align);
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
            result = this.isLegendAlignOuter(align) || this.isLegendAlignCenter(align);
        }
        return result;
    },

    /**
     * Whether allowed stacked option or not.
     * @memberOf module:predicate
     * @param {string} chartType chart type
     * @returns {boolean} result boolean
     */
    isAllowedStackedOption: function(chartType) {
        return this.isBarChart(chartType) || this.isColumnChart(chartType) || this.isAreaChart(chartType);
    },

    /**
     * Whether normal stacked or not.
     * @memberOf module:predicate
     * @param {boolean} stacked stacked option
     * @returns {boolean} result boolean
     */
    isNormalStacked: function(stacked) {
        return stacked === chartConst.STACKED_NORMAL_TYPE;
    },

    /**
     * Whether percent stacked or not.
     * @memberOf module:predicate
     * @param {boolean} stacked stacked option
     * @returns {boolean} result boolean
     */
    isPercentStacked: function(stacked) {
        return stacked === chartConst.STACKED_PERCENT_TYPE;
    },

    /**
     * Whether valid stacked option or not.
     * @memberOf module:predicate
     * @param {boolean} stacked stacked option
     * @returns {boolean} result boolean
     */
    isValidStackedOption: function(stacked) {
        return stacked && (this.isNormalStacked(stacked) || this.isPercentStacked(stacked));
    },

    /**
     * Whether allow range data or not.
     * @param {string} chartType - chart type
     * @returns {boolean}
     */
    isAllowRangeData: function(chartType) {
        return this.isBarTypeChart(chartType) || this.isAreaChart(chartType);
    },

    /**
     * Whether align of yAxis is center or not.
     * @memberOf module:predicate
     * @param {boolean} hasRightYAxis whether has right yAxis.
     * @param {string} alignOption align option of yAxis.
     * @returns {boolean} whether align center or not.
     */
    isYAxisAlignCenter: function(hasRightYAxis, alignOption) {
        return !hasRightYAxis && (alignOption === chartConst.YAXIS_ALIGN_CENTER);
    },

    /**
     * Whether minus limit or not.
     * @param {{min: number, max: number}} limit limit
     * @returns {boolean}
     */
    isMinusLimit: function(limit) {
        return limit.min <= 0 && limit.max <= 0;
    },

    /**
     * Whether options.hidden is true or not.
     * @param {object} [options] - options
     * @returns {boolean}
     */
    isHidden: function(options) {
        return !!tui.util.pick(options, 'hidden');
    }
};

module.exports = predicate;
