/**
 * @fileoverview Data converter.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var calculator = require('./calculator.js');

var concat = Array.prototype.concat;

/**
 * Data converter.
 * @module dataConverter
 */
var dataConverter = {
    /**
     * Convert user data.
     * @memberOf module:dataConverter
     * @param {array.<array>} userData user data
     * @param {object} chartOptions chart option
     * @param {string} chartType chart type
     * @returns {{
     *      labels: array.<string>,
     *      values: array.<number>,
     *      legendLabels: array.<string>,
     *      formatFunctions: array.<function>,
     *      formattedValues: array.<string>
     * }} converted data
     */
    convert: function(userData, chartOptions, chartType) {
        var labels = userData.categories,
            seriesData = userData.series,
            values = this._pickValues(seriesData),
            joinValues = this._joinValues(values),
            legendLabels = this._pickLegendLabels(seriesData),
            joinLegendLabels = this._joinLegendLabels(legendLabels, chartType),
            format = chartOptions && chartOptions.format || '',
            formatFunctions = this._findFormatFunctions(format),
            formattedValues = format ? this._formatValues(values, formatFunctions) : values;
        return {
            labels: labels,
            values: values,
            joinValues: joinValues,
            legendLabels: legendLabels,
            joinLegendLabels: joinLegendLabels,
            formatFunctions: formatFunctions,
            formattedValues: formattedValues
        };
    },

    /**
     * Separate label.
     * @memberOf module:dataConverter
     * @param {array.<array.<array>>} userData user data
     * @returns {{labels: (array.<string>), sourceData: array.<array.<array>>}} result data
     * @private
     */
    _separateLabel: function(userData) {
        var labels = userData[0].pop();
        return {
            labels: labels,
            sourceData: userData
        };
    },

    /**
     * Pick value.
     * @memberOf module:dataConverter
     * @param {array} items items
     * @returns {array} picked value
     * @private
     */
    _pickValue: function(items) {
        return ne.util.map([].concat(items.data), parseFloat);
    },

    /**
     * Pick values from axis data.
     * @memberOf module:dataConverter
     * @param {array.<array>} seriesData series data
     * @returns {string[]} values
     */
    _pickValues: function(seriesData) {
        var values, result;
        if (ne.util.isArray(seriesData)) {
            values = ne.util.map(seriesData, this._pickValue, this);
            result = calculator.arrayPivot(values);
        } else {
            result = {};
            ne.util.forEach(seriesData, function(groupValues, type) {
                values = ne.util.map(groupValues, this._pickValue, this);
                result[type] = calculator.arrayPivot(values);
            }, this);
        }
        return result;
    },

    /**
     * Join values.
     * @memberOf module:dataConverter
     * @param {array.<array>} values values
     * @returns {array.<number>} join values
     * @private
     */
    _joinValues: function(values) {
        var joinValues;

        if (ne.util.isArray(values)) {
            return values;
        }

        joinValues = ne.util.map(values, function(groupValues) {
            return groupValues;
        }, this);

        return concat.apply([], joinValues);
    },

    /**
     * Pick legend label.
     * @memberOf module:dataConverter
     * @param {object} item item
     * @returns {string} label
     * @private
     */
    _pickLegendLabel: function(item) {
        return item.name;
    },

    /**
     * Pick legend labels from axis data.
     * @memberOf module:dataConverter
     * @param {array.<array>} seriesData series data
     * @returns {string[]} labels
     */
    _pickLegendLabels: function(seriesData) {
        var result;
        if (ne.util.isArray(seriesData)) {
            result = ne.util.map(seriesData, this._pickLegendLabel, this);
        } else {
            result = {};
            ne.util.forEach(seriesData, function(groupValues, type) {
                result[type] = ne.util.map(groupValues, this._pickLegendLabel, this);
            }, this);
        }
        return result;
    },

    /**
     * Join legend labels.
     * @memberOf module:dataConverter
     * @param {array} legendLabels legend labels
     * @param {string} chartType chart type
     * @returns {array} labels
     * @private
     */
    _joinLegendLabels: function(legendLabels, chartType) {
        var result;
        if (ne.util.isArray(legendLabels)) {
            result = ne.util.map(legendLabels, function(label) {
                return {
                    chartType: chartType,
                    label: label
                };
            });
        } else {
            result = ne.util.map(legendLabels, function(labels, _chartType) {
                return ne.util.map(labels, function(label) {
                    return {
                        chartType: _chartType,
                        label: label
                    };
                });
            }, this);
            result = concat.apply([], result);
        }
        return result;
    },

    /**
     * To format group values.
     * @memberOf module:dataConverter
     * @param {array.<array>} groupValues group values
     * @param {function[]} formatFunctions format functions
     * @returns {string[]} formatted values
     * @private
     */
    _formatGroupValues: function(groupValues, formatFunctions) {
        return ne.util.map(groupValues, function(values) {
            return ne.util.map(values, function(value) {
                var fns = [value].concat(formatFunctions);
                return ne.util.reduce(fns, function(stored, fn) {
                    return fn(stored);
                });
            });
        });
    },

    /**
     * To format converted values.
     * @memberOf module:dataConverter
     * @param {array.<array>} chartValues chart values
     * @param {function[]} formatFunctions format functions
     * @returns {string[]} formatted values
     * @private
     */
    _formatValues: function(chartValues, formatFunctions) {
        var result;
        if (ne.util.isArray(chartValues)) {
            result = this._formatGroupValues(chartValues, formatFunctions);
        } else {
            result = {};
            ne.util.forEach(chartValues, function(groupValues, chartType) {
                result[chartType] = this._formatGroupValues(groupValues, formatFunctions);
            }, this);
        }
        return result;
    },

    /**
     * Pick max length under point.
     * @memberOf module:dataConverter
     * @param {string[]} values chart values
     * @returns {number} max length under point
     * @private
     */
    _pickMaxLenUnderPoint: function(values) {
        var max = 0;

        ne.util.forEachArray(values, function(value) {
            var len = ne.util.lengthAfterPoint(value);
            if (len > max) {
                max = len;
            }
        }, this);

        return max;
    },

    /**
     * Whether zero fill format or not.
     * @memberOf module:dataConverter
     * @param {string} format format
     * @returns {boolean} result boolean
     * @private
     */
    _isZeroFill: function(format) {
        return format.length > 2 && format.charAt(0) === '0';
    },

    /**
     * Whether decimal format or not.
     * @memberOf module:dataConverter
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
     * @memberOf module:dataConverter
     * @param {string} format format
     * @returns {boolean} result boolean
     * @private
     */
    _isComma: function(format) {
        return format.indexOf(',') === format.split('.')[0].length - 4;
    },

    /**
     * Format zero fill.
     * @memberOf module:dataConverter
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
     * @memberOf module:dataConverter
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
     * @memberOf module:dataConverter
     * @param {string} value target value
     * @returns {string} formatted value
     * @private
     */
    _formatComma: function(value) {
        var comma = ',',
            underPointValue = '',
            values;

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
        values = ne.util.map(values, function(char, index) {
            var result = [char];
            if ((index + 1) % 3 === 0) {
                result.push(comma);
            }
            return result;
        });

        return concat.apply([], values).reverse().join('') + underPointValue;
    },

    /**
     * Find format functions.
     * @memberOf module:dataConverter
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
            funcs = [ne.util.bind(this._formatDecimal, this, len)];
        } else if (this._isZeroFill(format)) {
            len = format.length;
            funcs = [ne.util.bind(this._formatZeroFill, this, len)];
            return funcs;
        }

        if (this._isComma(format)) {
            funcs.push(this._formatComma);
        }

        return funcs;
    }
};

module.exports = dataConverter;
