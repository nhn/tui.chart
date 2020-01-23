/**
 * @fileoverview  Chart factory play role register chart.
 *                Also, you can get chart from this factory.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import chartConst from '../const';
import rawDataHandler from '../models/data/rawDataHandler';
import predicate from '../helpers/predicate';

const charts = {};
export default {
  /**
   * Find key for getting chart.
   * @param {string} chartType - type of chart
   * @param {{seriesAlias: ?object, series: object.<string, Array>}} rawData - raw data
   * @returns {string}
   * @private
   */
  _findKey(chartType, rawData) {
    let key = null;
    if (predicate.isComboChart(chartType)) {
      const chartTypeMap = rawDataHandler.getChartTypeMap(rawData);

      if (chartTypeMap[chartConst.CHART_TYPE_COLUMN] && chartTypeMap[chartConst.CHART_TYPE_LINE]) {
        key = chartConst.CHART_TYPE_COLUMN_LINE_COMBO;
      } else if (
        chartTypeMap[chartConst.CHART_TYPE_LINE] &&
        chartTypeMap[chartConst.CHART_TYPE_SCATTER]
      ) {
        key = chartConst.CHART_TYPE_LINE_SCATTER_COMBO;
      } else if (
        chartTypeMap[chartConst.CHART_TYPE_AREA] &&
        chartTypeMap[chartConst.CHART_TYPE_LINE]
      ) {
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
  get(chartType, rawData, theme, options) {
    const key = this._findKey(chartType, rawData);
    const Chart = charts[key];

    if (!Chart) {
      throw new Error(`Not exist ${chartType} chart.`);
    }

    return new Chart(rawData, theme, options);
  },

  /**
   * Register chart.
   * @param {string} chartType char type
   * @param {class} ChartClass chart class
   */
  register(chartType, ChartClass) {
    charts[chartType] = ChartClass;
  }
};
