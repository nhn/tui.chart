/**
 * @fileoverview data processor base.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var arrayUtil = require('../../helpers/arrayUtil');
var renderUtil = require('../../helpers/renderUtil');
var calculator = require('../../helpers/calculator');
var snippet = require('tui-code-snippet');

/**
 * @classdesc data processor base.
 * @class DataProcessorBase
 * @private
 */
var DataProcessorBase = snippet.defineClass(/** @lends DataProcessorBase.prototype */{
    /**
     * Initialize.
     */
    baseInit: function() {
        /**
         * functions for formatting
         * @type {Array.<function>}
         */
        this.formatFunctions = null;
    },

    /**
     * Get values.
     * @abstract
     * @returns {Array}
     */
    getValues: function() {},

    /**
     * Get max value.
     * @param {?string} chartType - type of chart
     * @param {?string} valueType - type of value like value, x, y, r
     * @returns {number}
     */
    getMaxValue: function(chartType, valueType) {
        return arrayUtil.max(this.getValues(chartType, valueType));
    },

    /**
     * Get formatted max value.
     * @param {?string} chartType - type of chart
     * @param {?string} areaType - type of area like circleLegend
     * @param {?string} valueType - type of value like value, x, y, r
     * @returns {string | number}
     */
    getFormattedMaxValue: function(chartType, areaType, valueType) {
        var maxValue = this.getMaxValue(chartType, valueType);
        var formatFunctions = this.getFormatFunctions();

        return renderUtil.formatValue({
            value: maxValue,
            formatFunctions: formatFunctions,
            chartType: chartType,
            areaType: areaType,
            valueType: valueType
        });
    },

    /**
     * Pick max length under point.
     * @param {string[]} values chart values
     * @returns {number} max length under point
     * @private
     */
    _pickMaxLenUnderPoint: function(values) {
        var max = 0;

        snippet.forEachArray(values, function(value) {
            var len = calculator.getDecimalLength(value);
            if (len > max) {
                max = len;
            }
        });

        return max;
    },

    /**
     * Whether zero fill format or not.
     * @param {string} format format
     * @returns {boolean} result boolean
     * @private
     */
    _isZeroFill: function(format) {
        return format.length > 2 && format.charAt(0) === '0';
    },

    /**
     * Whether decimal format or not.
     * @param {string} format format
     * @returns {boolean} result boolean
     * @private
     */
    _isDecimal: function(format) {
        var indexOf = format.indexOf('.');

        return indexOf > -1 && indexOf < format.length - 1;
    },

    /**
     * Whether comma format or not.
     * @param {string} format format
     * @returns {boolean} result boolean
     * @private
     */
    _isComma: function(format) {
        return format.indexOf(',') > -1;
    },

    /**
     * Format to zero fill.
     * @param {number} len length of result
     * @param {string} value target value
     * @returns {string} formatted value
     * @private
     */
    _formatToZeroFill: function(len, value) {
        var isMinus = value < 0;

        value = renderUtil.formatToZeroFill(Math.abs(value), len);

        return (isMinus ? '-' : '') + value;
    },

    /**
     * Format to Decimal.
     * @param {number} len length of under decimal point
     * @param {string} value target value
     * @returns {string} formatted value
     * @private
     */
    _formatToDecimal: function(len, value) {
        return renderUtil.formatToDecimal(value, len);
    },

    /**
     * Find simple type format functions.
     * @param {string} format - simple format
     * @returns {Array.<function>}
     */
    _findSimpleTypeFormatFunctions: function(format) {
        var funcs = [];
        var len;

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
    },

    /**
     * Find format functions.
     * @returns {function[]} functions
     */
    _findFormatFunctions: function() {
        var format = snippet.pick(this.options, 'chart', 'format');
        var funcs = [];

        if (snippet.isFunction(format)) {
            funcs = [format];
        } else if (snippet.isString(format)) {
            funcs = this._findSimpleTypeFormatFunctions(format);
        }

        return funcs;
    },

    /**
     * Get format functions.
     * @returns {Array.<function>} functions
     */
    getFormatFunctions: function() {
        if (!this.formatFunctions) {
            this.formatFunctions = this._findFormatFunctions();
        }

        return this.formatFunctions;
    }
});

module.exports = DataProcessorBase;
