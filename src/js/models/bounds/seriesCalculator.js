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
     * @param {number} maxLabelWidth - max label width
     * @returns {number} series width
     */
    calculateWidth: function(dimensionMap, legendOptions, maxLabelWidth) {
        var chartWidth = dimensionMap.chart.width;
        var yAxisAreaWidth = dimensionMap.yAxis.width + dimensionMap.rightYAxis.width;
        var legendDimension = dimensionMap.legend;
        var legendWidth = 0;
        var xAxisLabelPadding = 0;

        if (predicate.isVerticalLegend(legendOptions.align) && legendOptions.visible) {
            legendWidth = legendDimension ? legendDimension.width : 0;
        }

        if (!legendWidth && !dimensionMap.rightYAxis.width && maxLabelWidth) {
            xAxisLabelPadding = maxLabelWidth / 2;
        }

        return chartWidth - (chartConst.CHART_PADDING * 2) - yAxisAreaWidth - legendWidth - xAxisLabelPadding;
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
     * @param {number} yAxisTitleAreaHeight - yAxis title area height
     * @returns {number} series height
     */
    calculateHeight: function(dimensionMap, legendOptions, yAxisTitleAreaHeight) {
        var chartHeight = dimensionMap.chart.height;
        var titleHeight = dimensionMap.title.height;
        var hasTitle = titleHeight > 0;
        var chartExportMenuHeight = dimensionMap.chartExportMenu.height;
        var topAreaHeight = Math.max(dimensionMap.title.height, chartExportMenuHeight);
        var bottomAreaHeight = dimensionMap.xAxis.height;
        var legendHeight = legendOptions.visible ? dimensionMap.legend.height : 0;
        var topLegendHeight = predicate.isLegendAlignTop(legendOptions.align) ? legendHeight : 0;
        var topAreaExceptTitleHeight = Math.max(yAxisTitleAreaHeight, topLegendHeight);

        if (hasTitle) {
            topAreaHeight = titleHeight + Math.max(0, topAreaExceptTitleHeight - chartConst.TITLE_PADDING);
        } else {
            topAreaHeight = Math.max(chartExportMenuHeight, topAreaExceptTitleHeight);
        }

        bottomAreaHeight += (predicate.isLegendAlignBottom(legendOptions.align) ? legendHeight : 0);

        return chartHeight - (chartConst.CHART_PADDING * 2) - topAreaHeight - bottomAreaHeight;
    }
};

module.exports = seriesCalculator;
