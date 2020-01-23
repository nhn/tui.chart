/**
 * @fileoverview SeriesItemForCoordinateType is a element of SeriesGroup.items.
 * SeriesItemForCoordinateType has processed terminal data like x, y, r, xRatio, yRatio, rRatio.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import predicate from '../../helpers/predicate';
import renderUtil from '../../helpers/renderUtil';
import snippet from 'tui-code-snippet';

class SeriesItemForCoordinateType {
  /**
   * SeriesItemForCoordinateType is a element of SeriesGroup.items.
   * SeriesItemForCoordinateType has processed terminal data like x, y, r, xRatio, yRatio, rRatio.
   * @constructs SeriesItemForCoordinateType
   * @private
   * @param {object} params - parameters
   *      @param {Array.<number>|{x: number, y:number, r: ?number, label: ?string}} params.datum - raw series datum
   *      @param {string} params.chartType - type of chart
   *      @param {?Array.<function>} params.formatFunctions - format functions
   *      @param {number} params.index - raw data index
   */
  constructor(params) {
    /**
     * type of chart
     * @type {string}
     */
    this.chartType = params.chartType;

    /**
     * format functions
     * @type {Array.<function>}
     */
    this.formatFunctions = params.formatFunctions;

    /**
     * x axis type
     * @type {?string}
     */
    this.xAxisType = params.xAxisType;

    /**
     * date format
     * @type {?string}
     */
    this.dateFormat = params.dateFormat;

    /**
     * ratio map
     * @type {object}
     */
    this.ratioMap = {};

    this._initData(params.datum, params.index);
  }

  /**
     * Initialize data of item.
     @param {Array.<number>|{x: number, y:number, r: ?number, label: ?string}} rawSeriesDatum - raw series datum
     * @param {number} index - raw data index
     * @private
     */
  _initData(rawSeriesDatum, index) {
    let date;

    if (snippet.isArray(rawSeriesDatum)) {
      this.x = rawSeriesDatum[0] || 0;
      this.y = rawSeriesDatum[1] || 0;
      if (predicate.isBubbleChart(this.chartType)) {
        [, , this.r, this.label = ''] = rawSeriesDatum;
      } else {
        [, , this.label = ''] = rawSeriesDatum;
      }
    } else {
      this.x = rawSeriesDatum.x;
      this.y = rawSeriesDatum.y;
      this.r = rawSeriesDatum.r;
      this.label = rawSeriesDatum.label || '';
    }

    if (predicate.isDatetimeType(this.xAxisType)) {
      date = snippet.isDate(this.x) ? this.x : new Date(this.x);
      this.x = date.getTime() || 0;
    }

    this.index = index;

    if (!this.label) {
      if (predicate.isLineTypeChart(this.chartType) && predicate.isDatetimeType(this.xAxisType)) {
        this.label = renderUtil.formatDate(this.x, this.dateFormat);
      } else {
        this.label = renderUtil.formatValue({
          value: this.x,
          formatFunctions: this.formatFunctions,
          chartType: this.chartType,
          areaType: 'series'
        });
      }

      const labelItem = renderUtil.formatValue({
        value: this.y,
        formatFunctions: this.formatFunctions,
        chartType: this.chartType,
        areaType: 'series'
      });

      this.label += `,&nbsp;${labelItem}`;
    }
  }

  /**
   * Add start.
   * @param {number} value - value
   * @private
   */
  addStart(value) {
    this.start = value;
  }

  /**
   * Add ratio.
   * @param {string} valueType - type of value like x, y, r
   * @param {?number} divNumber - number for division
   * @param {?number} subNumber - number for subtraction
   */
  addRatio(valueType, divNumber, subNumber) {
    if (!snippet.isExisty(this.ratioMap[valueType]) && divNumber) {
      this.ratioMap[valueType] = (this[valueType] - subNumber) / divNumber;
    }
  }

  /**
   * Get formatted value for tooltip.
   * @param {string} valueType - value type
   * @returns {string}
   * @private
   */
  _getFormattedValueForTooltip(valueType) {
    const ratio = this.ratioMap[valueType];
    const value = this[valueType];
    const formattedValue = renderUtil.formatValue({
      value,
      formatFunctions: this.formatFunctions,
      chartType: this.chartType,
      areaType: 'tooltip',
      valueType
    });

    return snippet.isNumber(ratio) ? formattedValue : value;
  }

  /**
   * Pick value map for tooltip.
   * @returns {{x: (number | null), y: (number | null), r: (number | null)}}
   */
  pickValueMapForTooltip() {
    const valueMap = {
      x: this._getFormattedValueForTooltip('x'),
      y: this._getFormattedValueForTooltip('y'),
      xRatio: this.ratioMap.x,
      yRatio: this.ratioMap.y
    };

    if (snippet.isExisty(this.r)) {
      valueMap.r = this._getFormattedValueForTooltip('r');
      valueMap.rRatio = this.ratioMap.r;
    }

    return valueMap;
  }
}

export default SeriesItemForCoordinateType;
