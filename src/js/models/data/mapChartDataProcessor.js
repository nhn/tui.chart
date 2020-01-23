/**
 * @fileoverview Data processor for map chart.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import DataProcessorBase from './dataProcessorBase';
import renderUtil from '../../helpers/renderUtil';
import snippet from 'tui-code-snippet';

/**
 * Raw series data.
 * @typedef {Array.<{code: string, name: ?string, data: number}>} rawSeriesData
 * @private
 */

/**
 * Value map.
 * @typedef {{value: number, label: string, name: ?string}} valueMap
 * @private
 */

class MapChartDataProcessor extends DataProcessorBase {
  /**
   * Data processor for map chart.
   * @param {rawData} rawData raw data
   * @param {string} chartType chart type
   * @param {object} options options
   * @constructs MapChartDataProcessor
   * @private
   * @extends DataProcessor
   */
  constructor(rawData, chartType, options) {
    super();
    /**
     * raw data
     * @type {rawData}
     */
    this.rawData = rawData;

    /**
     * chart options
     * @type {Object}
     */
    this.options = options;
  }

  /**
   * Update raw data.
   * @param {{series: rawSeriesData}} rawData raw data
   */
  initData(rawData) {
    this.rawData = rawData;
    /**
     * value map
     * @type {valueMap}
     */
    this.valueMap = null;
  }

  /**
   * Make value map.
   * @returns {valueMap} value map
   * @private
   */
  _makeValueMap() {
    const rawSeriesData = this.rawData.series.map;
    const valueMap = {};
    const formatFunctions = this._findFormatFunctions();

    rawSeriesData.forEach(datum => {
      const result = {
        value: datum.data,
        label: renderUtil.formatValue({
          value: datum.data,
          formatFunctions,
          chartType: 'map',
          areaType: 'series'
        })
      };

      if (datum.name) {
        result.name = datum.name;
      }

      if (datum.labelCoordinate) {
        result.labelCoordinate = datum.labelCoordinate;
      }

      valueMap[datum.code] = result;
    });

    return valueMap;
  }

  /**
   * Get value map.
   * @returns {number} value
   */
  getValueMap() {
    if (!this.valueMap) {
      this.valueMap = this._makeValueMap();
    }

    return this.valueMap;
  }

  /**
   * Get values.
   * @returns {Array.<number>} picked values.
   */
  getValues() {
    return snippet.pluck(this.getValueMap(), 'value');
  }

  /**
   * Get current data.
   * Map chart does not have zoomed data. So, returns rawData.
   * @returns {*|null}
   */
  getCurrentData() {
    return this.rawData;
  }

  /**
   * Get valueMap datum.
   * @param {string} code map code
   * @returns {{code: string, name: string, label: number,
   *              labelCoordinate: {x: number, y: number}}} valueMap datum
   */
  getValueMapDatum(code) {
    return this.getValueMap()[code];
  }

  /**
   * Add data ratios of map chart.
   * @param {{min: number, max: number}} limit axis limit
   */
  addDataRatios(limit) {
    const { min } = limit;
    const max = limit.max - min;
    const maps = Object.values(this.getValueMap());

    maps.forEach(map => {
      map.ratio = (map.value - min) / max;
    });
  }

  createBaseValuesForLimit() {
    return this.getValues();
  }

  getLegendVisibility() {
    return null;
  }
}

export default MapChartDataProcessor;
