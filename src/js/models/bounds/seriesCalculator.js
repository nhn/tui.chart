/**
 * @fileoverview Calculator for series.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import chartConst from '../../const';
import predicate from '../../helpers/predicate';

/**
 * Calculator for series.
 * @module seriesCalculator
 * @private */
export default {
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
  calculateWidth(dimensionMap, legendOptions, maxLabelWidth) {
    const {
      chart: { width: chartWidth },
      yAxis,
      rightYAxis,
      legend
    } = dimensionMap;
    const yAxisAreaWidth = yAxis.width + rightYAxis.width;
    const legendDimension = legend;
    let legendWidth = 0;
    let xAxisLabelPadding = 0;

    if (predicate.isVerticalLegend(legendOptions.align) && legendOptions.visible) {
      legendWidth = legendDimension ? legendDimension.width : 0;
    }

    if (!legendWidth && !rightYAxis.width && maxLabelWidth) {
      xAxisLabelPadding = maxLabelWidth / 2;
    }

    return (
      chartWidth - chartConst.CHART_PADDING * 2 - yAxisAreaWidth - legendWidth - xAxisLabelPadding
    );
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
  calculateHeight(dimensionMap, legendOptions, yAxisTitleAreaHeight) {
    const chartHeight = dimensionMap.chart.height;
    const titleHeight = Math.max(dimensionMap.title.height, dimensionMap.chartExportMenu.height);
    const legendHeight = legendOptions.visible ? dimensionMap.legend.height : 0;
    const topLegendHeight = predicate.isLegendAlignTop(legendOptions.align) ? legendHeight : 0;
    const topAreaPadding = Math.max(
      0,
      Math.max(yAxisTitleAreaHeight, topLegendHeight) - chartConst.TITLE_PADDING
    );
    const topAreaHeight = titleHeight + topAreaPadding;
    const bottomLegendHeight = predicate.isLegendAlignBottom(legendOptions.align)
      ? legendHeight
      : 0;
    const bottomAreaHeight = dimensionMap.xAxis.height + bottomLegendHeight;

    return chartHeight - chartConst.CHART_PADDING * 2 - topAreaHeight - bottomAreaHeight;
  }
};
