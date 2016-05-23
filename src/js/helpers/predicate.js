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
     * @param {string} chartType - type of chart
     * @returns {boolean}
     */
    isBarChart: function(chartType) {
        return chartType === chartConst.CHART_TYPE_BAR;
    },

    /**
     * Whether column chart or not.
     * @memberOf module:predicate
     * @param {string} chartType - type of chart
     * @returns {boolean}
     */
    isColumnChart: function(chartType) {
        return chartType === chartConst.CHART_TYPE_COLUMN;
    },

    /**
     * Whether bar type chart or not.
     * @memberOf module:predicate
     * @param {string} chartType - type of chart
     * @returns {boolean}
     */
    isBarTypeChart: function(chartType) {
        return predicate.isBarChart(chartType) || predicate.isColumnChart(chartType);
    },

    /**
     * Whether combo chart or not.
     * @memberOf module:predicate
     * @param {string} chartType - type of chart
     * @returns {boolean}
     */
    isComboChart: function(chartType) {
        return chartType === chartConst.CHART_TYPE_COMBO;
    },

    /**
     * Whether pie and donut combo chart or not.
     * @memberOf module:predicate
     * @param {string} chartType - type of chart
     * @param {Array.<string>} subChartTypes - types of chart
     * @returns {boolean}
     */
    isPieDonutComboChart: function(chartType, subChartTypes) {
        var isAllPieType = tui.util.all(subChartTypes, function(subChartType) {
            return predicate.isPieTypeChart(subChartType);
        });
        return predicate.isComboChart(chartType) && isAllPieType;
    },

    /**
     * Whether line chart or not.
     * @memberOf module:predicate
     * @param {string} chartType - type of chart
     * @returns {boolean}
     */
    isLineChart: function(chartType) {
        return chartType === chartConst.CHART_TYPE_LINE;
    },

    /**
     * Whether area chart or not.
     * @memberOf module:predicate
     * @param {string} chartType - type of chart
     * @returns {boolean}
     */
    isAreaChart: function(chartType) {
        return chartType === chartConst.CHART_TYPE_AREA;
    },

    /**
     * Whether line type chart or not.
     * @memberOf module:predicate
     * @param {string} chartType - type of chart
     * @returns {boolean}
     */
    isLineTypeChart: function(chartType) {
        return predicate.isLineChart(chartType) || predicate.isAreaChart(chartType);
    },

    /**
     * Whether bubble chart or not.
     * @memberOf module:predicate
     * @param {string} chartType - type of chart
     * @returns {boolean}
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
     * @memberOf module:predicate
     * @param {string} chartType - chart type
     * @returns {boolean}
     */
    isPieTypeChart: function(chartType) {
        return predicate.isPieChart(chartType) || predicate.isDonutChart(chartType);
    },

    /**
     * Whether map chart or not.
     * @memberOf module:predicate
     * @param {string} chartType - type of chart
     * @returns {boolean}
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
        return predicate.isBubbleChart(chartType) || predicate.isScatterChart(chartType);
    },

    /**
     * Whether allow rendering for minus point in area of series.
     * @memberOf module:predicate
     * @param {string} chartType - chart type
     * @returns {boolean}
     */
    allowMinusPointRender: function(chartType) {
        return predicate.isLineTypeChart(chartType) || predicate.isCoordinateTypeChart(chartType);
    },

    /**
     * Whether mouse position chart or not.
     * @memberOf module:predicate
     * @param {string} chartType - type of chart
     * @returns {boolean}
     */
    isMousePositionChart: function(chartType) {
        return predicate.isPieTypeChart(chartType) || predicate.isMapChart(chartType)
            || predicate.isCoordinateTypeChart(chartType);
    },

    /**
     * Whether align of legend is outer or not.
     * @memberOf module:predicate
     * @param {string} align - align of legend
     * @returns {boolean}
     */
    isLegendAlignOuter: function(align) {
        return align === chartConst.LEGEND_ALIGN_OUTER;
    },

    /**
     * Whether align of legend is center or not.
     * @memberOf module:predicate
     * @param {string} align - align of legend
     * @returns {boolean}
     */
    isLegendAlignCenter: function(align) {
        return align === chartConst.LEGEND_ALIGN_CENTER;
    },

    /**
     * Whether align of legend is left or not.
     * @memberOf module:predicate
     * @param {string} align - align of legend
     * @returns {boolean}
     */
    isLegendAlignLeft: function(align) {
        return align === chartConst.LEGEND_ALIGN_LEFT;
    },

    /**
     * Whether align of legend is top or not.
     * @memberOf module:predicate
     * @param {string} align - align of legend
     * @returns {boolean}
     */
    isLegendAlignTop: function(align) {
        return align === chartConst.LEGEND_ALIGN_TOP;
    },

    /**
     * Whether align of legend is bottom or not.
     * @memberOf module:predicate
     * @param {string} align - align of legend
     * @returns {boolean}
     */
    isLegendAlignBottom: function(align) {
        return align === chartConst.LEGEND_ALIGN_BOTTOM;
    },

    /**
     * Whether horizontal legend align or not.
     * @memberOf module:predicate
     * @param {string} align - align of legend
     * @returns {boolean}
     */
    isHorizontalLegend: function(align) {
        return predicate.isLegendAlignTop(align) || predicate.isLegendAlignBottom(align);
    },

    /**
     * Whether has with for vertical type legend or not.
     * @param {{align: string, hidden: ?boolean}} legendOption - option for legend component
     * @returns {boolean}
     */
    hasVerticalLegendWidth: function(legendOption) {
        legendOption = legendOption || {};

        return !predicate.isHorizontalLegend(legendOption.align) && !predicate.isHidden(legendOption);
    },

    /**
     * Whether legend align of pie chart or not.
     * @memberOf module:predicate
     * @param {?string} align - align of legend
     * @returns {boolean}
     */
    isPieLegendAlign: function(align) {
        var result = false;
        if (align) {
            result = predicate.isLegendAlignOuter(align) || predicate.isLegendAlignCenter(align);
        }
        return result;
    },

    /**
     * Whether allowed stacked option or not.
     * @memberOf module:predicate
     * @param {string} chartType - type of chart
     * @returns {boolean}
     */
    isAllowedStackedOption: function(chartType) {
        return predicate.isBarChart(chartType) || predicate.isColumnChart(chartType)
            || predicate.isAreaChart(chartType);
    },

    /**
     * Whether normal stacked or not.
     * @memberOf module:predicate
     * @param {boolean} stacked - stacked option
     * @returns {boolean}
     */
    isNormalStacked: function(stacked) {
        return stacked === chartConst.STACKED_NORMAL_TYPE;
    },

    /**
     * Whether percent stacked or not.
     * @memberOf module:predicate
     * @param {boolean} stacked - stacked option
     * @returns {boolean}
     */
    isPercentStacked: function(stacked) {
        return stacked === chartConst.STACKED_PERCENT_TYPE;
    },

    /**
     * Whether valid stacked option or not.
     * @memberOf module:predicate
     * @param {boolean} stacked - stacked option
     * @returns {boolean}
     */
    isValidStackedOption: function(stacked) {
        return stacked && (predicate.isNormalStacked(stacked) || predicate.isPercentStacked(stacked));
    },

    /**
     * Whether allow range data or not.
     * @memberOf module:predicate
     * @param {string} chartType - chart type
     * @returns {boolean}
     */
    isAllowRangeData: function(chartType) {
        return predicate.isBarTypeChart(chartType) || predicate.isAreaChart(chartType);
    },

    /**
     * Whether align of yAxis is center or not.
     * @memberOf module:predicate
     * @param {boolean} hasRightYAxis - whether has right yAxis.
     * @param {string} alignOption - align option of yAxis.
     * @returns {boolean} whether - align center or not.
     */
    isYAxisAlignCenter: function(hasRightYAxis, alignOption) {
        return !hasRightYAxis && (alignOption === chartConst.YAXIS_ALIGN_CENTER);
    },

    /**
     * Whether minus limit or not.
     * @memberOf module:predicate
     * @param {{min: number, max: number}} limit - limit
     * @returns {boolean}
     */
    isMinusLimit: function(limit) {
        return limit.min <= 0 && limit.max <= 0;
    },

    /**
     * Whether options.hidden is true or not.
     * @memberOf module:predicate
     * @param {object} [options] - options
     * @returns {boolean}
     */
    isHidden: function(options) {
        return !!tui.util.pick(options, 'hidden');
    }
};

module.exports = predicate;
