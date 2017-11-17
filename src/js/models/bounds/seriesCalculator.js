/**
 * @fileoverview Calculator for series.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../../const');
var predicate = require('../../helpers/predicate');

/**
 * Calculator for series.
 * @module seriesCalculator
 * @private */
var seriesCalculator = {
    /**
     * Calculate width.
     * @param {{
     *      chart: {width: number},
     *      yAxis: {width: number},
     *      legend: {width: number},
     *      rightYAxis: ?{width: number}
     * }} dimensionMap - dimension map
     * @param {{align: ?string, visible: boolean}} legendOptions - legend options
     * @returns {number} series width
     */
    calculateWidth: function(dimensionMap, legendOptions) {
        var chartWidth = dimensionMap.chart.width;
        var yAxisAreaWidth = dimensionMap.yAxis.width + dimensionMap.rightYAxis.width;
        var legendDimension = dimensionMap.legend;
        var legendWidth = 0;

        if (predicate.isVerticalLegend(legendOptions.align) && legendOptions.visible) {
            legendWidth = legendDimension ? legendDimension.width : 0;
        }

        return chartWidth - (chartConst.CHART_PADDING * 2) - yAxisAreaWidth - legendWidth;
    },

    /**
     * Calculate height.
     * @param {{
     *      chart: {height: number},
     *      title: {height: number},
     *      legend: {height: number},
     *      xAxis: {height: number}
     * }} dimensionMap - dimension map
     * @param {{align: ?string, visible: boolean}} legendOptions - legend options
     * @returns {number} series height
     */
    calculateHeight: function(dimensionMap, legendOptions) {
        var chartHeight = dimensionMap.chart.height;
        var titleOrExportMenuHeight = Math.max(dimensionMap.title.height, dimensionMap.chartExportMenu.height);
        var legendHeight, bottomAreaWidth;

        if (predicate.isHorizontalLegend(legendOptions.align) && legendOptions.visible) {
            legendHeight = dimensionMap.legend.height;
        } else {
            legendHeight = 0;
        }

        bottomAreaWidth = legendHeight + dimensionMap.xAxis.height;

        return chartHeight - (chartConst.CHART_PADDING * 2) - titleOrExportMenuHeight - bottomAreaWidth;
    }
};

module.exports = seriesCalculator;
