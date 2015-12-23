/**
 * @fileoverview Data processor.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var predicate = require('./predicate'),
    renderUtil = require('./renderUtil'),
    calculator = require('./calculator');

var concat = Array.prototype.concat;

/**
 * Raw data.
 * @typedef array.<{name: string, data: array.<number>}> rawSeriesData
 */

var DataProcessor = tui.util.defineClass(/** @lends DataProcessor.prototype */{
    /**
     * Data processor.
     * @constructs DataProcessor
     * @param {{
     *      categories: array.<string>,
     *      series: (rawSeriesData | {line: ?rawSeriesData, column: ?rawSeriesData})
     * }} rawData raw data
     */
    init: function(rawData) {
        this.orgRawData = rawData;
        this.data = null;
    },

    /**
     * Get raw data.
     * @returns {{categories: array.<string>, series: (rawSeriesData|{line: ?rawSeriesData, column: ?rawSeriesData})}} raw data
     */
    getRawData: function() {
        return this.orgRawData;
    },

    /**
     * Process raw data.
     * @param {array.<array>} rawData raw data
     * @param {object} options options
     * @param {array.<string>} seriesChartTypes chart types
     */
    process: function(rawData, options, seriesChartTypes) {
        var chartType = options.chartType,
            categories = this._processCategories(rawData.categories),
            seriesData = rawData.series,
            values = this._pickValues(seriesData),
            wholeValues = this._makeWholeValues(values, seriesChartTypes),
            legendLabels = this._pickLegendLabels(seriesData),
            wholeLegendData = this._makeWholeLegendData(legendLabels, chartType, seriesChartTypes),
            format = options.chart && options.chart.format || '',
            formatFunctions = this._findFormatFunctions(format),
            formattedValues = format ? this._formatValues(values, formatFunctions) : values,
            wholeFormattedValues = this._makeWholeValues(formattedValues, seriesChartTypes);

        this.data = {
            categories: categories,
            values: values,
            wholeValues: wholeValues,
            legendLabels: legendLabels,
            wholeLegendData: wholeLegendData,
            formatFunctions: formatFunctions,
            formattedValues: formattedValues,
            wholeFormattedValues: wholeFormattedValues,
            percentValues: {}
        };
    },

    /**
     * Get Categories
     * @returns {array.<string>}}
     */
    getCategories: function() {
        return this.data.categories;
    },

    /**
     * Get category.
     * @param {number} index index
     * @returns {string} category
     */
    getCategory: function(index) {
        return this.data.categories[index];
    },

    /**
     * Get group values.
     * @param {string} chartType chart type
     * @returns {array.array.<number>} group values
     */
    getGroupValues: function(chartType) {
        return this.data.values[chartType] || this.data.values;
    },

    /**
     * Get value.
     * @param {number} groupIndex group index
     * @param {number} index index
     * @param {? string} chartType chart type
     * @returns {number} value
     */
    getValue: function(groupIndex, index, chartType) {
        var groupValues = this.getGroupValues(chartType);
        return groupValues[groupIndex][index];
    },

    /**
     * Get whole group values.
     * @returns {array.<array.<number>>} gruop values
     */
    getWholeGroupValues: function() {
        return this.data.wholeValues;
    },

    /**
     * Get legend labels.
     * @param {?string} chartType chart type
     * @returns {array.<string> | {column: ?array.<string>, line: ?array.<string>}} legend labels
     */
    getLegendLabels: function(chartType) {
        return this.data.legendLabels[chartType] || this.data.legendLabels;
    },

    /**
     * Get whole legend data.
     * @returns {array.<string>} legend data
     */
    getWholeLegendData: function() {
        return this.data.wholeLegendData;
    },

    /**
     * Set whole legend data.
     * @param {array.<{chartType: string, label: string}>} wholeLegendData legend data
     */
    setWholeLegendData: function(wholeLegendData) {
        this.data.wholeLegendData = wholeLegendData;
    },

    /**
     * Get legend data.
     * @param {number} index index
     * @returns {{chartType: string, label: string}} legend data
     */
    getLegendData: function(index) {
        return this.data.wholeLegendData[index];
    },

    /**
     * Get format functions.
     * @returns {array.<function>} functions
     */
    getFormatFunctions: function() {
        return this.data.formatFunctions;
    },

    /**
     * Get formatted group values
     * @param {string} chartType chart type
     * @returns {array.<string>} group values
     */
    getFormattedGroupValues: function(chartType) {
        return this.data.formattedValues[chartType] || this.data.formattedValues;
    },

    /**
     * Get formatted value.
     * @param {number} groupIndex group index
     * @param {number} index index
     * @param {?string} chartType chartType
     * @returns {string} formatted value
     */
    getFormattedValue: function(groupIndex, index, chartType) {
        var formattedGroupValues = this.getFormattedGroupValues(chartType);
        return formattedGroupValues[groupIndex][index];
    },

    /**
     * Get first formatted vlaue.
     * @param {?string} chartType chartType
     * @returns {string} formatted value
     */
    getFirstFormattedValue: function(chartType) {
        return this.getFormattedValue(0, 0, chartType);
    },

    /**
     * Get whole formatted values.
     * @returns {array.array.<string>} formatted values
     */
    getWholeFormattedValues: function() {
        return this.data.wholeFormattedValues;
    },

    /**
     * Process categories
     * @param {array.<string>} categories categories
     * @returns {array.<string>} processed categories
     * @private
     */
    _processCategories: function(categories) {
        return tui.util.map(categories, tui.util.encodeHTMLEntity);
    },

    /**
     * Pick value.
     * @param {{name: string, data: (array.<number> | number)}} items items
     * @returns {array} picked value
     * @private
     */
    _pickValue: function(items) {
        return tui.util.map([].concat(items.data), parseFloat);
    },

    /**
     * Pick values from axis data.
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
     * Make whole values.
     * @param {array.<array>} groupValues values
     * @param {array.<string>} seriesChartTypes chart types
     * @returns {array.<number>} join values
     * @private
     */
    _makeWholeValues: function(groupValues, seriesChartTypes) {
        var wholeValues = [];

        if (!seriesChartTypes) {
            wholeValues = groupValues;
        } else {
            tui.util.forEachArray(seriesChartTypes, function(_chartType) {
                tui.util.forEach(groupValues[_chartType], function(values, index) {
                    if (!wholeValues[index]) {
                        wholeValues[index] = [];
                    }
                    wholeValues[index] = wholeValues[index].concat(values);
                });
            });
        }

        return wholeValues;
    },

    /**
     * Pick legend label.
     * @param {object} item item
     * @returns {string} label
     * @private
     */
    _pickLegendLabel: function(item) {
        return tui.util.encodeHTMLEntity(item.name);
    },

    /**
     * Pick legend labels from axis data.
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
     * Make whole legend data.
     * @param {array} legendLabels legend labels
     * @param {string} chartType chart type
     * @param {array.<string>} seriesChartTypes chart types
     * @returns {array} labels
     * @private
     */
    _makeWholeLegendData: function(legendLabels, chartType, seriesChartTypes) {
        var wholeLabels;
        if (!seriesChartTypes || !seriesChartTypes.length) {
            wholeLabels = tui.util.map(legendLabels, function(label) {
                return {
                    chartType: chartType,
                    label: label
                };
            });
        } else {
            wholeLabels = [];
            tui.util.forEachArray(seriesChartTypes, function(_chartType) {
                var labels = tui.util.map(legendLabels[_chartType], function(label) {
                    return {
                        chartType: _chartType,
                        label: label
                    };
                });
                wholeLabels = wholeLabels.concat(labels);
            });
        }
        return wholeLabels;
    },

    /**
     * Format group values.
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
        return format.indexOf(',') === format.split('.')[0].length - 4;
    },

    /**
     * Format zero fill.
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

    /**
     * Make multiline category.
     * @param {string} category category
     * @param {number} limitWidth limit width
     * @param {object} theme label theme
     * @returns {string} multiline category
     * @private
     */
    _makeMultilineCategory: function(category, limitWidth, theme) {
        var words = category.split(/\s+/),
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

        return lines.join('<br>');
    },

    /**
     * Get multiline categories.
     * @param {number} limitWidth limit width
     * @param {object} theme label theme
     * @returns {array} multiline categories
     */
    getMultilineCategories: function(limitWidth, theme) {
        if (!this.data.multilineCategories) {
            this.data.multilineCategories = tui.util.map(this.getCategories(), function(category) {
                return this._makeMultilineCategory(category, limitWidth, theme);
            }, this);
        }

        return this.data.multilineCategories;
    },

    /**
     * Make percent value.
     * @param {array.<array.<number>>} groupValues gruop values
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
     * @param {array.<array.<number>>} groupValues gruop values
     * @param {{min: number, max: number}} limit axis limit
     * @returns {array} percent values about normal stacked option.
     * @private
     */
    _makeNormalStackedPercentValues: function(groupValues, limit) {
        var distance = Math.abs(limit.max - limit.min);

        return tui.util.map(groupValues, function(values) {
            return tui.util.map(values, function(value) {
                return value / distance;
            });
        });
    },

    /**
     * Make percent values about percent stacked option.
     * @param {array.<array.<number>>} groupValues gruop values
     * @returns {array} percent values about percent stacked option
     * @private
     */
    _makePercentStackedPercentValues: function(groupValues) {
        var flattenValues = concat.apply([], groupValues),
            plusSum = calculator.sumPlusValues(flattenValues),
            minusSum = Math.abs(calculator.sumMinusValues(flattenValues)),
            ratio = (plusSum > 0 && minusSum > 0) ? 0.5 : 1;

        var percentValues = tui.util.map(groupValues, function(values) {
            var sum = tui.util.sum(tui.util.map(values, function(value) {
                return Math.abs(value);
            }));

            return tui.util.map(values, function(value) {
                return sum === 0 ? 0 : ratio * (value / sum);
            });
        });

        return percentValues;
    },

    /**
     * Make percent value.
     * @param {array.<array.<number>>} groupValues gruop values
     * @param {{min: number, max: number}} limit axis limit
     * @param {boolean} isLineTypeChart whether line type chart or not.
     * @returns {array.<array.<number>>} percent values
     * @private
     */
    _makePercentValues: function(groupValues, limit, isLineTypeChart) {
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
    },

    /**
     * Make percent value.
     * @param {{min: number, max: number}} limit axis limit
     * @param {string} stacked stacked option
     * @param {string} chartType chart type
     * @private
     */
    setPercentValues: function(limit, stacked, chartType) {
        var result,
            groupValues = this.getGroupValues(chartType),
            isAllowedStackedOption = predicate.isAllowedStackedOption(chartType),
            isLineTypeChart = predicate.isLineTypeChart(chartType);

        if (predicate.isPieChart(chartType)) {
            result = this._makePieChartPercentValues(groupValues);
        } else if (isAllowedStackedOption && predicate.isNormalStacked(stacked)) {
            result = this._makeNormalStackedPercentValues(groupValues, limit);
            //if (predicate.isAreaChart(chartType)) {
            //    result = this._makeNormalStackedPercentValuesForAreaChart(groupValues, limit);
            //} else {
            //    result = this._makeNormalStackedPercentValues(groupValues, limit);
            //}
        } else if (isAllowedStackedOption && predicate.isPercentStacked(stacked)) {
            result = this._makePercentStackedPercentValues(groupValues);
        } else {
            result = this._makePercentValues(groupValues, limit, isLineTypeChart);
        }

        this.data.percentValues[chartType] = isLineTypeChart ? tui.util.pivot(result) : result;
    },

    /**
     * Get percent values.
     * @param {string} chartType chart type
     * @returns {array.<array.<number>>} percent values
     */
    getPercentValues: function(chartType) {
        return this.data.percentValues[chartType];
    }
});

module.exports = DataProcessor;
