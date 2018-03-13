/**
 * @fileoverview scaleMaker calculates the limit and step into values of processed data and returns it.
 * @auth NHN Ent.
 *       FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var predicate = require('../../helpers/predicate');
var calculator = require('../../helpers/calculator');
var renderUtil = require('../../helpers/renderUtil');
var snippet = require('tui-code-snippet');

var abs = Math.abs;

/**
 * Format scale data labels
 * @module scaleLabelFormatter
 * @private
 */
var scaleLabelFormatter = {
    /**
     * Get functions for formatting value.
     * @param {string} chartType - chart type
     * @param {string} stackType - stack type
     * @param {?Array.<function>} formatFunctions - format functions
     * @returns {Array.<function>}
     * @private
     */
    _getFormatFunctions: function(chartType, stackType, formatFunctions) {
        if (predicate.isPercentStackChart(chartType, stackType)) {
            formatFunctions = [function(value) {
                return value + '%';
            }];
        }

        return formatFunctions;
    },

    /**
     * Create scale values.
     * @param {{limit: {min: number, max: number}, step: number}} scale - scale data
     * @param {string} chartType - chart type
     * @param {boolean} diverging - diverging option
     * @returns {Array.<number>}
     * @private
     */
    _createScaleValues: function(scale, chartType, diverging) {
        var values = calculator.makeLabelsFromLimit(scale.limit, scale.step);

        return predicate.isDivergingChart(chartType, diverging) ? snippet.map(values, abs) : values;
    },

    /**
     * Create formatted scale values.
     * @param {{limit: {min: number, max: number}, step: number}} scale - scale data
     * @param {{
     *      chartType: string,
     *      areaType: string,
     *      valueType: string
     * }} typeMap - type map
     * @param {{
     *      type: string,
     *      stackType: string,
     *      diverging: boolean,
     *      dateFormat: ?string
     * }} options - options
     * @param {?Array.<function>} formatFunctions - format functions
     * @returns {Array.<string|number>|*}
     */
    createFormattedLabels: function(scale, typeMap, options, formatFunctions) {
        var chartType = typeMap.chartType;
        var areaType = typeMap.areaType;
        var valueType = typeMap.valueType;
        var values = this._createScaleValues(scale, chartType, options.diverging);
        var formattedValues;

        if (predicate.isDatetimeType(options.type)) {
            formattedValues = renderUtil.formatDates(values, options.dateFormat);
        } else {
            formatFunctions = this._getFormatFunctions(chartType, options.stackType, formatFunctions);
            formattedValues = renderUtil.formatValues(values, formatFunctions, chartType, areaType, valueType);
        }

        return formattedValues;
    }
};

module.exports = scaleLabelFormatter;
