/**
 * @fileoverview Calculator for series.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../../const');
var predicate = require('../../helpers/predicate');
var renderUtil = require('../../helpers/renderUtil');

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
     * @param {string} chartType - chart type
     * @param {object} seriesTheme - series theme;
     * @returns {number} series height
     */
    calculateHeight: function(dimensionMap, legendOptions, chartType, seriesTheme) {
        var chartHeight = dimensionMap.chart.height;
        var defaultTopAreaHeight = renderUtil.getDefaultSeriesTopAreaHeight(chartType, seriesTheme);
        var topAreaHeight = Math.max(dimensionMap.title.height, dimensionMap.chartExportMenu.height);
        var bottomAreaHeight = dimensionMap.xAxis.height;
        var legendHeight = legendOptions.visible ? dimensionMap.legend.height : 0;
        var legendAlignment = legendOptions.align;

        bottomAreaHeight += (predicate.isLegendAlignBottom(legendAlignment) ? legendHeight : 0);
        topAreaHeight += (predicate.isLegendAlignTop(legendAlignment) ? legendHeight : 0);
        topAreaHeight = topAreaHeight || defaultTopAreaHeight;

        return chartHeight - (chartConst.CHART_PADDING * 2) - topAreaHeight - bottomAreaHeight;
    }
};

module.exports = seriesCalculator;
