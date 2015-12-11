/**
 * @fileoverview Data processor.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    predicate = require('./predicate'),
    renderUtil = require('./renderUtil');

var concat = Array.prototype.concat;

/**
 * Data processor.
 * @module DataProcessor
 */
var DataProcessor = tui.util.defineClass(/** @lends DataProcessor.prototype */{
    init: function(rawData) {
        this.orgRawData = rawData;
        this.data = null;
    },

    /**
     * Process raw data.
     * @memberOf module:DataProcessor
     * @param {array.<array>} rawData raw data
     * @param {object} options options
     * @param {string} chartType chart type
     * @param {array.<string>} seriesChartTypes chart types
     */
    process: function(rawData, options, chartType, seriesChartTypes) {
        var labels = this._processCategories(rawData.categories, options.xAxis),
            seriesData = rawData.series,
            values = this._pickValues(seriesData),
            joinValues = this._joinValues(values, seriesChartTypes),
            legendLabels = this._pickLegendLabels(seriesData),
            joinLegendLabels = this._joinLegendLabels(legendLabels, chartType, seriesChartTypes),
            format = options.chart && options.chart.format || '',
            formatFunctions = this._findFormatFunctions(format),
            formattedValues = format ? this._formatValues(values, formatFunctions) : values,
            joinFormattedValues = this._joinValues(formattedValues, seriesChartTypes);

        this.data = {
            labels: labels,
            values: values,
            joinValues: joinValues,
            legendLabels: legendLabels,
            joinLegendLabels: joinLegendLabels,
            formatFunctions: formatFunctions,
            formattedValues: formattedValues,
            joinFormattedValues: joinFormattedValues,
            percentValues: {}
        };
    },

    getRawData: function() {
        return this.orgRawData;
    },

    getData: function() {
        return this.data;
    },

    getCategories: function() {
        return this.data.labels;
    },

    getCategory: function(index) {
        return this.data.labels[index];
    },

    getGroupValues: function(chartType) {
        return this.data.values[chartType] || this.data.values;
    },

    getGroupValue: function(groupIndex, index, chartType) {
        var groupValues = this.getGroupValues(chartType);
        return groupValues[groupIndex][index];
    },

    getFullGroupValues: function() {
        return this.data.joinValues;
    },

    getLegendLabels: function(chartType) {
        return this.data.legendLabels[chartType] || this.data.legendLabels;
    },

    getFullLegendData: function() {
        return this.data.joinLegendLabels;
    },

    setFullLegendData: function(fullLegendData) {
        this.data.joinLegendLabels = fullLegendData;
    },

    getLegendData: function(index) {
        return this.data.joinLegendLabels[index];
    },

    getFormatFunctions: function() {
        return this.data.formatFunctions;
    },

    getFormattedGroupValues: function(chartType) {
        return this.data.formattedValues[chartType] || this.data.formattedValues;
    },

    getFormattedValues: function(index, chartType) {
        var formattedGroupValues = this.getFormattedGroupValues(chartType);
        return formattedGroupValues[index];
    },

    getFormattedValue: function(groupIndex, index, chartType) {
        var formattedGroupValues = this.getFormattedGroupValues(chartType);
        return formattedGroupValues[groupIndex][index];
    },

    getFirstFormattedValue: function(chartType) {
        return this.getFormattedValue(0, 0, chartType);
    },
    getFullFormattedValues: function() {
        return this.data.joinFormattedValues;
    },

    _processCategories: function(categories, xAxisOptions) {
        categories = tui.util.map(categories, function(category) {
            return renderUtil.escape(category);
        });
        return categories;
    },

    /**
     * Separate label.
     * @memberOf module:DataProcessor
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
     * @memberOf module:DataProcessor
     * @param {{name: string, data: (array.<number> | number)}} items items
     * @returns {array} picked value
     * @private
     */
    _pickValue: function(items) {
        return tui.util.map([].concat(items.data), parseFloat);
    },

    /**
     * Pick values from axis data.
     * @memberOf module:DataProcessor
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
     * @memberOf module:DataProcessor
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
     * @memberOf module:DataProcessor
     * @param {object} item item
     * @returns {string} label
     * @private
     */
    _pickLegendLabel: function(item) {
        return renderUtil.escape(item.name);
    },

    /**
     * Pick legend labels from axis data.
     * @memberOf module:DataProcessor
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
     * @memberOf module:DataProcessor
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
     * @memberOf module:DataProcessor
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
     * @memberOf module:DataProcessor
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
     * @memberOf module:DataProcessor
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
     * @memberOf module:DataProcessor
     * @param {string} format format
     * @returns {boolean} result boolean
     * @private
     */
    _isZeroFill: function(format) {
        return format.length > 2 && format.charAt(0) === '0';
    },

    /**
     * Whether decimal format or not.
     * @memberOf module:DataProcessor
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
     * @memberOf module:DataProcessor
     * @param {string} format format
     * @returns {boolean} result boolean
     * @private
     */
    _isComma: function(format) {
        return format.indexOf(',') === format.split('.')[0].length - 4;
    },

    /**
     * Format zero fill.
     * @memberOf module:DataProcessor
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
     * @memberOf module:DataProcessor
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
     * @memberOf module:DataProcessor
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
     * @memberOf module:DataProcessor
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
    },

    _makeMultilineCategory: function(category, limitWidth, theme) {
        var words = category.split(' '),
            lineWords = words[0],
            lines = [];

        tui.util.forEachArray(words.slice(1), function(word) {
            var width = renderUtil.getRenderedLabelWidth(lineWords + ' ' + word, theme);
            if (width > limitWidth) {
                lines.push(lineWords);
                lineWords = word;
            } else {
                lineWords += ' ' + word;
            }
        });

        if (lineWords) {
            lines.push(lineWords);
        }

        return lines.join('</br>');
    },

    getMultilineCategories: function(limitWidth, theme) {
        if (!this.data.multilineCategorie) {
            this.data.multilineCategorie = tui.util.map(this.data.labels, function(category) {
                return this._makeMultilineCategory(category, limitWidth, theme);
            }, this);
        }

        return this.data.multilineCategorie;
    },


    /**
     * Make percent value.
     * @param {{values: array, limit: {min: number, max: number}}} data series data
     * @param {string} stacked stacked option
     * @returns {array.<array.<number>>} percent values
     * @private
     */
    setPercentValues: function(limit, stacked, chartType) {
        var result,
            groupValues = this.getGroupValues(chartType),
            isLineTypeChart = predicate.isLineTypeChart(chartType);

        groupValues = isLineTypeChart ? tui.util.pivot(groupValues) : groupValues;

        if (predicate.isPieChart(chartType)) {
            result = this._makePieChartPercentValues(groupValues);
        } else if (stacked === chartConst.STACKED_NORMAL_TYPE) {
            result = this._makeNormalStackedPercentValues(groupValues, limit);
        } else if (stacked === chartConst.STACKED_PERCENT_TYPE) {
            result = this._makePercentStackedPercentValues();
        } else {
            result = this._makeNormalPercentValues(groupValues, limit, isLineTypeChart);
        }

        this.data.percentValues[chartType] = result;
    },

    getPercentValues: function(chartType) {
        return this.data.percentValues[chartType];
    },

    /**
     * Make percent value.
     * @param {{values: array, limit: {min: number, max: number}}} data series data
     * @returns {array.<array.<number>>} percent values
     * @private
     */
    _makePieChartPercentValues: function(groupValues) {
        var result = tui.util.map(groupValues, function(values) {
            var sum = tui.util.sum(values);

            return tui.util.map(values, function(value) {
                return value / sum;
            });
        });
        return result;
    },

    /**
     * Make percent values about normal stacked option.
     * @param {{values: array, limit: {min: number, max: number}}} data series data
     * @returns {array} percent values about normal stacked option.
     * @private
     */
    _makeNormalStackedPercentValues: function(groupValues, limit) {
        var min = limit.min,
            max = limit.max,
            distance = max - min,
            percentValues = tui.util.map(groupValues, function(values) {
                var plusValues = tui.util.filter(values, function(value) {
                        return value > 0;
                    }),
                    sum = tui.util.sum(plusValues),
                    groupPercent = (sum - min) / distance;
                return tui.util.map(values, function(value) {
                    return value === 0 ? 0 : groupPercent * (value / sum);
                });
            });

        return percentValues;
    },

    /**
     * Make percent values about percent stacked option.
     * @param {{values: array, limit: {min: number, max: number}}} data series data
     * @returns {array} percent values about percent stacked option
     * @private
     */
    _makePercentStackedPercentValues: function(groupValues) {
        var percentValues = tui.util.map(groupValues, function(values) {
            var plusValues = tui.util.filter(values, function(value) {
                    return value > 0;
                }),
                sum = tui.util.sum(plusValues);
            return tui.util.map(values, function(value) {
                return value === 0 ? 0 : value / sum;
            });
        });

        return percentValues;
    },

    /**
     * Make normal percent value.
     * @param {{values: array, limit: {min: number, max: number}}} data series data
     * @returns {array.<array.<number>>} percent values
     * @private
     */
    _makeNormalPercentValues: function(groupValues, limit, isLineTypeChart) {
        var min = limit.min,
            max = limit.max,
            distance = max - min,
            flag = 1,
            subValue = 0,
            percentValues;

        if (!isLineTypeChart && min < 0 && max <= 0) {
            flag = -1;
            subValue = max;
            distance = min - max;
        } else if (isLineTypeChart || min >= 0) {
            subValue = min;
        }

        percentValues = tui.util.map(groupValues, function(values) {
            return tui.util.map(values, function(value) {
                return (value - subValue) * flag / distance;
            });
        });

        return percentValues;
    }
});

module.exports = DataProcessor;
