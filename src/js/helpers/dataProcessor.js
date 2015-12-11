/**
 * @fileoverview Data processor.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var concat = Array.prototype.concat;

/**
 * Data processor.
 * @module dataProcessor
 */
var dataProcessor = {
    /**
     * Process raw data.
     * @memberOf module:dataProcessor
     * @param {array.<array>} rawData raw data
     * @param {object} chartOptions chart option
     * @param {string} chartType chart type
     * @param {array.<string>} seriesChartTypes chart types
     * @returns {{
     *      labels: array.<string>,
     *      values: array.<number>,
     *      legendLabels: array.<string>,
     *      formatFunctions: array.<function>,
     *      formattedValues: array.<string>
     * }} processed data
     */
    process: function(rawData, chartOptions, chartType, seriesChartTypes) {
        var labels = rawData.categories,
            seriesData = rawData.series,
            values = this._pickValues(seriesData),
            joinValues = this._joinValues(values, seriesChartTypes),
            legendLabels = this._pickLegendLabels(seriesData),
            joinLegendLabels = this._joinLegendLabels(legendLabels, chartType, seriesChartTypes),
            format = chartOptions && chartOptions.format || '',
            formatFunctions = this._findFormatFunctions(format),
            formattedValues = format ? this._formatValues(values, formatFunctions) : values,
            joinFormattedValues = this._joinValues(formattedValues, seriesChartTypes);
        return {
            labels: labels,
            values: values,
            joinValues: joinValues,
            legendLabels: legendLabels,
            joinLegendLabels: joinLegendLabels,
            formatFunctions: formatFunctions,
            formattedValues: formattedValues,
            joinFormattedValues: joinFormattedValues
        };
    },

    /**
     * Separate label.
     * @memberOf module:dataProcessor
     * @param {array.<array.<array>>} rawData raw data
     * @returns {{labels: (array.<string>), sourceData: array.<array.<array>>}} result data
     * @private
     */
    _separateLabel: function(rawData) {
        var labels = rawData[0].pop();
        return {
            labels: labels,
            sourceData: rawData
        };
    },

    /**
     * Pick value.
     * @memberOf module:dataProcessor
     * @param {{name: string, data: (array.<number> | number)}} items items
     * @returns {array} picked value
     * @private
     */
    _pickValue: function(items) {
        return tui.util.map([].concat(items.data), parseFloat);
    },

    /**
     * Pick values from axis data.
     * @memberOf module:dataProcessor
     * @param {array.<array>} seriesData series data
     * @returns {string[]} values
     */
    _pickValues: function(seriesData) {
        var values, result;
        if (tui.util.isArray(seriesData)) {
            values = tui.util.map(seriesData, this._pickValue, this);
            result = tui.util.pivot(values);
        } else {
            result = {};
            tui.util.forEach(seriesData, function(groupValues, type) {
                values = tui.util.map(groupValues, this._pickValue, this);
                result[type] = tui.util.pivot(values);
            }, this);
        }
        return result;
    },

    /**
     * Join values.
     * @memberOf module:dataProcessor
     * @param {array.<array>} groupValues values
     * @param {array.<string>} seriesChartTypes chart types
     * @returns {array.<number>} join values
     * @private
     */
    _joinValues: function(groupValues, seriesChartTypes) {
        var joinValues;

        if (!seriesChartTypes) {
            return groupValues;
        }

        joinValues = tui.util.map(groupValues, function(values) {
            return values;
        }, this);

        joinValues = [];
        tui.util.forEachArray(seriesChartTypes, function(_chartType) {
            tui.util.forEach(groupValues[_chartType], function(values, index) {
                if (!joinValues[index]) {
                    joinValues[index] = [];
                }
                joinValues[index] = joinValues[index].concat(values);
            });
        });

        return joinValues;
    },

    /**
     * Pick legend label.
     * @memberOf module:dataProcessor
     * @param {object} item item
     * @returns {string} label
     * @private
     */
    _pickLegendLabel: function(item) {
        return item.name;
    },

    /**
     * Pick legend labels from axis data.
     * @memberOf module:dataProcessor
     * @param {array.<array>} seriesData series data
     * @returns {string[]} labels
     */
    _pickLegendLabels: function(seriesData) {
        var result;
        if (tui.util.isArray(seriesData)) {
            result = tui.util.map(seriesData, this._pickLegendLabel, this);
        } else {
            result = {};
            tui.util.forEach(seriesData, function(groupValues, type) {
                result[type] = tui.util.map(groupValues, this._pickLegendLabel, this);
            }, this);
        }
        return result;
    },

    /**
     * Join legend labels.
     * @memberOf module:dataProcessor
     * @param {array} legendLabels legend labels
     * @param {string} chartType chart type
     * @param {array.<string>} seriesChartTypes chart types
     * @returns {array} labels
     * @private
     */
    _joinLegendLabels: function(legendLabels, chartType, seriesChartTypes) {
        var joinLabels;
        if (!seriesChartTypes || !seriesChartTypes.length) {
            joinLabels = tui.util.map(legendLabels, function(label) {
                return {
                    chartType: chartType,
                    label: label
                };
            });
        } else {
            joinLabels = [];
            tui.util.forEachArray(seriesChartTypes, function(_chartType) {
                var labels = tui.util.map(legendLabels[_chartType], function(label) {
                    return {
                        chartType: _chartType,
                        label: label
                    };
                });
                joinLabels = joinLabels.concat(labels);
            });
        }
        return joinLabels;
    },

    /**
     * Format group values.
     * @memberOf module:dataProcessor
     * @param {array.<array>} groupValues group values
     * @param {function[]} formatFunctions format functions
     * @returns {string[]} formatted values
     * @private
     */
    _formatGroupValues: function(groupValues, formatFunctions) {
        return tui.util.map(groupValues, function(values) {
            return tui.util.map(values, function(value) {
                var fns = [value].concat(formatFunctions);
                return tui.util.reduce(fns, function(stored, fn) {
                    return fn(stored);
                });
            });
        });
    },

    /**
     * Format converted values.
     * @memberOf module:dataProcessor
     * @param {array.<array>} chartValues chart values
     * @param {function[]} formatFunctions format functions
     * @returns {string[]} formatted values
     * @private
     */
    _formatValues: function(chartValues, formatFunctions) {
        var result;
        if (tui.util.isArray(chartValues)) {
            result = this._formatGroupValues(chartValues, formatFunctions);
        } else {
            result = {};
            tui.util.forEach(chartValues, function(groupValues, chartType) {
                result[chartType] = this._formatGroupValues(groupValues, formatFunctions);
            }, this);
        }
        return result;
    },

    /**
     * Pick max length under point.
     * @memberOf module:dataProcessor
     * @param {string[]} values chart values
     * @returns {number} max length under point
     * @private
     */
    _pickMaxLenUnderPoint: function(values) {
        var max = 0;

        tui.util.forEachArray(values, function(value) {
            var len = tui.util.lengthAfterPoint(value);
            if (len > max) {
                max = len;
            }
        }, this);

        return max;
    },

    /**
     * Whether zero fill format or not.
     * @memberOf module:dataProcessor
     * @param {string} format format
     * @returns {boolean} result boolean
     * @private
     */
    _isZeroFill: function(format) {
        return format.length > 2 && format.charAt(0) === '0';
    },

    /**
     * Whether decimal format or not.
     * @memberOf module:dataProcessor
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
     * @memberOf module:dataProcessor
     * @param {string} format format
     * @returns {boolean} result boolean
     * @private
     */
    _isComma: function(format) {
        return format.indexOf(',') === format.split('.')[0].length - 4;
    },

    /**
     * Format zero fill.
     * @memberOf module:dataProcessor
     * @param {number} len length of result
     * @param {string} value target value
     * @returns {string} formatted value
     * @private
     */
    _formatZeroFill: function(len, value) {
        var zero = '0',
            isMinus = value < 0;

        value = Math.abs(value) + '';

        if (value.length >= len) {
            return value;
        }

        while (value.length < len) {
            value = zero + value;
        }

        return (isMinus ? '-' : '') + value;
    },

    /**
     * Format Decimal.
     * @memberOf module:dataProcessor
     * @param {number} len length of under decimal point
     * @param {string} value target value
     * @returns {string} formatted value
     * @private
     */
    _formatDecimal: function(len, value) {
        var pow;

        if (len === 0) {
            return Math.round(value, 10);
        }

        pow = Math.pow(10, len);
        value = Math.round(value * pow) / pow;
        value = parseFloat(value).toFixed(len);
        return value;
    },

    /**
     * Format Comma.
     * @memberOf module:dataProcessor
     * @param {string} value target value
     * @returns {string} formatted value
     * @private
     */
    _formatComma: function(value) {
        var comma = ',',
            underPointValue = '',
            values, lastIndex;

        value += '';

        if (value.indexOf('.') > -1) {
            values = value.split('.');
            value = values[0];
            underPointValue = '.' + values[1];
        }

        if (value.length < 4) {
            return value + underPointValue;
        }

        values = (value).split('').reverse();
        lastIndex = values.length - 1;
        values = tui.util.map(values, function(char, index) {
            var result = [char];
            if (index < lastIndex && (index + 1) % 3 === 0) {
                result.push(comma);
            }
            return result;
        });

        return concat.apply([], values).reverse().join('') + underPointValue;
    },

    /**
     * Find format functions.
     * @memberOf module:dataProcessor
     * @param {string} format format
     * @param {string[]} values chart values
     * @returns {function[]} functions
     */
    _findFormatFunctions: function(format) {
        var funcs = [],
            len;

        if (!format) {
            return [];
        }

        if (this._isDecimal(format)) {
            len = this._pickMaxLenUnderPoint([format]);
            funcs = [tui.util.bind(this._formatDecimal, this, len)];
        } else if (this._isZeroFill(format)) {
            len = format.length;
            funcs = [tui.util.bind(this._formatZeroFill, this, len)];
            return funcs;
        }

        if (this._isComma(format)) {
            funcs.push(this._formatComma);
        }

        return funcs;
    }
};

module.exports = dataProcessor;
