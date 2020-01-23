/**
 * @fileoverview data processor base.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import arrayUtil from '../../helpers/arrayUtil';
import renderUtil from '../../helpers/renderUtil';
import calculator from '../../helpers/calculator';
import snippet from 'tui-code-snippet';

/**
 * @classdesc data processor base.
 * @class DataProcessorBase
 * @private
 */
class DataProcessorBase {
  /**
   * Initialize.
   */
  baseInit() {
    /**
     * functions for formatting
     * @type {Array.<function>}
     */
    this.formatFunctions = null;
  }

  /**
   * Get values.
   * @abstract
   * @returns {Array}
   */
  getValues() {}

  /**
   * Get current  Data.
   * @abstract
   * @returns {Array}
   */
  getCurrentData() {}

  /**
   * Get max value.
   * @param {?string} chartType - type of chart
   * @param {?string} valueType - type of value like value, x, y, r
   * @returns {number}
   */
  getMaxValue(chartType, valueType) {
    return arrayUtil.max(this.getValues(chartType, valueType));
  }

  /**
   * Get max value.
   * @param {?string} chartType - type of chart
   * @param {?string} valueType - type of value like value, x, y, r
   * @returns {number}
   */
  getMinValue(chartType, valueType) {
    return arrayUtil.min(this.getValues(chartType, valueType));
  }

  /**
   * Get formatted max value.
   * @param {?string} chartType - type of chart
   * @param {?string} areaType - type of area like circleLegend
   * @param {?string} valueType - type of value like value, x, y, r
   * @returns {string | number}
   */
  getFormattedMaxValue(chartType, areaType, valueType) {
    const maxValue = this.getMaxValue(chartType, valueType);
    const formatFunctions = this.getFormatFunctions();

    return renderUtil.formatValue({
      value: maxValue,
      formatFunctions,
      chartType,
      areaType,
      valueType
    });
  }

  /**
   * Get formatted max value.
   * @param {?string} chartType - type of chart
   * @param {?string} areaType - type of area like circleLegend
   * @param {?string} valueType - type of value like value, x, y, r
   * @returns {string | number}
   */
  getFormattedMinValue(chartType, areaType, valueType) {
    const maxValue = this.getMinValue(chartType, valueType);
    const formatFunctions = this.getFormatFunctions();

    return renderUtil.formatValue({
      value: maxValue,
      formatFunctions,
      chartType,
      areaType,
      valueType
    });
  }

  /**
   * Pick max length under point.
   * @param {string[]} values chart values
   * @returns {number} max length under point
   * @private
   */
  _pickMaxLenUnderPoint(values) {
    let max = 0;

    values.forEach(value => {
      const len = calculator.getDecimalLength(value);
      if (len > max) {
        max = len;
      }
    });

    return max;
  }

  /**
   * Whether zero fill format or not.
   * @param {string} format format
   * @returns {boolean} result boolean
   * @private
   */
  _isZeroFill(format) {
    return format.length > 2 && format.charAt(0) === '0';
  }

  /**
   * Whether decimal format or not.
   * @param {string} format format
   * @returns {boolean} result boolean
   * @private
   */
  _isDecimal(format) {
    const indexOf = format.indexOf('.');

    return indexOf > -1 && indexOf < format.length - 1;
  }

  /**
   * Whether comma format or not.
   * @param {string} format format
   * @returns {boolean} result boolean
   * @private
   */
  _isComma(format) {
    return format.indexOf(',') > -1;
  }

  /**
   * Format to zero fill.
   * @param {number} len length of result
   * @param {string} value target value
   * @returns {string} formatted value
   * @private
   */
  _formatToZeroFill(len, value) {
    const isMinus = value < 0;

    value = renderUtil.formatToZeroFill(Math.abs(value), len);

    return (isMinus ? '-' : '') + value;
  }

  /**
   * Format to Decimal.
   * @param {number} len length of under decimal point
   * @param {string} value target value
   * @returns {string} formatted value
   * @private
   */
  _formatToDecimal(len, value) {
    return renderUtil.formatToDecimal(value, len);
  }

  /**
   * Find simple type format functions.
   * @param {string} format - simple format
   * @returns {Array.<function>}
   * @private
   */
  _findSimpleTypeFormatFunctions(format) {
    let funcs = [];
    let len;

    if (this._isDecimal(format)) {
      len = this._pickMaxLenUnderPoint([format]);
      funcs = [snippet.bind(this._formatToDecimal, this, len)];
    } else if (this._isZeroFill(format)) {
      len = format.length;
      funcs = [snippet.bind(this._formatToZeroFill, this, len)];

      return funcs;
    }

    if (this._isComma(format)) {
      funcs.push(renderUtil.formatToComma);
    }

    return funcs;
  }

  /**
   * Find format functions.
   * @returns {function[]} functions
   * @private
   */
  _findFormatFunctions() {
    const format = snippet.pick(this.options, 'chart', 'format');
    let funcs = [];

    if (snippet.isFunction(format)) {
      funcs = [format];
    } else if (snippet.isString(format)) {
      funcs = this._findSimpleTypeFormatFunctions(format);
    }

    return funcs;
  }

  /**
   * Get format functions.
   * @returns {Array.<function>} functions
   */
  getFormatFunctions() {
    if (!this.formatFunctions) {
      this.formatFunctions = this._findFormatFunctions();
    }

    return this.formatFunctions;
  }
}

export default DataProcessorBase;
