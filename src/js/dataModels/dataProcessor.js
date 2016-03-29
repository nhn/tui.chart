/**
 * @fileoverview Data processor.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ItemGroup = require('../dataModels/itemGroup'),
    predicate = require('../helpers/predicate'),
    rawDataHandler = require('../helpers/rawDataHandler'),
    renderUtil = require('../helpers/renderUtil');

var concat = Array.prototype.concat;

/**
 * Raw series datum.
 * @typedef {{name: ?string, data: Array.<number>, stack: ?string}} rawSeriesDatum
 */

/**
 * Raw series data.
 * @typedef {Array.<rawSeriesDatum>} rawSeriesData
 */

/**
 * Raw data.
 * @typedef {{
 *      categories: ?Array.<string>,
 *      series: (rawSeriesData|{line: ?rawSeriesData, column: ?rawSeriesData})
 * }} rawData
 */

var DataProcessor = tui.util.defineClass(/** @lends DataProcessor.prototype */{
    /**
     * Data processor.
     * @constructs DataProcessor
     * @param {rawData} rawData raw data
     * @param {object} options options
     * @param {Array.<string>} seriesChartTypes chart types
     */
    init: function(rawData, options, seriesChartTypes) {
        var seriesOption = options.series || {};

        /**
         * original raw data.
         * @type {{categories: ?Array.<string>, series: Array.<object>}}
         */
        this.orgRawData = rawData;

        /**
         * chart options
         * @type {Object}
         */
        this.options = options;

        /**
         * series chart types
         * @type {Array.<string>}
         */
        this.seriesChartTypes = seriesChartTypes;

        /**
         * diverging option
         * @type {boolean}
         */
        this.divergingOption = predicate.isBarTypeChart(options.chartType) && seriesOption.diverging;

        this.updateRawData(rawData);
    },

    /**
     * Get raw data.
     * @returns {rawData} raw data
     */
    getRawData: function() {
        return this.orgRawData;
    },

    /**
     * Update raw data.
     * @param {rawData} rawData raw data
     */
    updateRawData: function(rawData) {
        /**
         * raw data
         * @type {rawData}
         */
        this.rawData = rawData;

        /**
         * categories
         * @type {Array.<string>}
         */
        this.categories = null;

        /**
         * stacks
         * @type {Array.<number>}
         */
        this.stacks = null;

        /**
         * Item group
         * @type {ItemGroup}
         */
        this.itemGroup = null;

        /**
         * legend labels
         * @type {{column: Array.<string>, line: Array.<string> | Array.<string>}}
         */
        this.legendLabels = null;

        /**
         * whole legend data
         * @type {Array.<object>}
         */
        this.wholeLegendData = null;

        /**
         * functions for formatting
         * @type {Array.<function>}
         */
        this.formatFunctions = null;

        /**
         * multiline categories
         * @type {Array.<string>}
         */
        this.multilineCategories = null;
    },

    /**
     * Process categories
     * @param {Array.<string>} categories categories
     * @returns {Array.<string>} processed categories
     * @private
     */
    _processCategories: function(categories) {
        return tui.util.map(categories, tui.util.encodeHTMLEntity);
    },

    /**
     * Get Categories
     * @returns {Array.<string>}}
     */
    getCategories: function() {
        if (!this.categories) {
            this.categories = this._processCategories(this.rawData.categories);
        }

        return this.categories;
    },

    /**
     * Get category.
     * @param {number} index index
     * @returns {string} category
     */
    getCategory: function(index) {
        return this.getCategories()[index];
    },

    /**
     * Get stacks.
     * @returns {Array.<string>}
     */
    getStacks: function() {
        if (!this.stacks) {
            this.stacks = rawDataHandler.pickStacks(this.rawData.series);
        }

        return this.stacks;
    },

    /**
     * Get stack count.
     * @returns {Number}
     */
    getStackCount: function() {
        return this.getStacks().length;
    },

    /**
     * Find stack index.
     * @param {string} stack stack
     * @returns {number}
     */
    findStackIndex: function(stack) {
        return tui.util.inArray(stack, this.getStacks());
    },


    /**
     * Get ItemGroup.
     * @returns {ItemGroup}
     */
    getItemGroup: function() {
        if (!this.itemGroup) {
            this.itemGroup = new ItemGroup(this.rawData.series, this.options,
                this.seriesChartTypes, this.getFormatFunctions());
        }

        return this.itemGroup;
    },

    /**
     * Get group count.
     * @param {string} chartType chart type
     * @returns {number}
     */
    getGroupCount: function(chartType) {
        return this.getItemGroup().getGroupCount(chartType);
    },

    /**
     * Whether valid all group or not.
     * @returns {boolean}
     */
    isValidAllGroup: function() {
        return this.getItemGroup().isValidAllGroup();
    },

    /**
     * Get whole group items.
     * @returns {Array.<Items>}
     */
    getWholeGroups: function() {
        return this.getItemGroup().getWholeGroups();
    },

    /**
     * Get value.
     * @param {number} groupIndex group index
     * @param {number} index index
     * @param {?string} chartType chart type
     * @returns {number} value
     */
    getValue: function(groupIndex, index, chartType) {
        return this.getItemGroup().getValue(groupIndex, index, chartType);
    },

    /**
     * Get whole values.
     * @returns {Array.<number>} values
     */
    getWholeValues: function() {
        return this.getItemGroup().getWholeValues();
    },

    /**
     * Get values.
     * @param {string} chartType chart type
     * @returns {Array.<number>}
     */
    getValues: function(chartType) {
        return this.getItemGroup().getValues(chartType);
    },

    /**
     * Get legend labels.
     * @param {?string} chartType chart type
     * @returns {Array.<string> | {column: ?Array.<string>, line: ?Array.<string>}} legend labels
     */
    getLegendLabels: function(chartType) {
        if (!this.legendLabels) {
            this.legendLabels = this._pickLegendLabels();
        }
        return this.legendLabels[chartType] || this.legendLabels;
    },

    /**
     * Get whole legend data.
     * @returns {Array.<string>} legend data
     */
    getWholeLegendData: function() {
        if (!this.wholeLegendData) {
            this.wholeLegendData = this._makeWholeLegendData();
        }
        return this.wholeLegendData;
    },

    /**
     * Set whole legend data.
     * @param {Array.<{chartType: string, label: string}>} wholeLegendData legend data
     */
    setWholeLegendData: function(wholeLegendData) {
        this.wholeLegendData = wholeLegendData;
    },

    /**
     * Get legend data.
     * @param {number} index index
     * @returns {{chartType: string, label: string}} legend data
     */
    getLegendData: function(index) {
        return this.getWholeLegendData()[index];
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
    },

    /**
     * Get first formatted vlaue.
     * @param {?string} chartType chartType
     * @returns {string} formatted value
     */
    getFirstFormattedValue: function(chartType) {
        return this.getItemGroup().getFirstItem(chartType).formattedValue;
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
     * Pick legend labels from raw data.
     * @returns {string[]} labels
     */
    _pickLegendLabels: function() {
        var self = this,
            seriesData = this.rawData.series,
            result;
        if (tui.util.isArray(seriesData)) {
            result = tui.util.map(seriesData, this._pickLegendLabel);
        } else {
            result = {};
            tui.util.forEach(seriesData, function(seriesDatum, type) {
                result[type] = tui.util.map(seriesDatum, self._pickLegendLabel);
            });
        }

        return result;
    },

    /**
     * Make whole legend data.
     * @returns {Array} labels
     * @private
     */
    _makeWholeLegendData: function() {
        var self = this,
            legendLabels = this.getLegendLabels(),
            seriesChartTypes = this.seriesChartTypes,
            wholeLabels;

        if (!seriesChartTypes || !seriesChartTypes.length) {
            wholeLabels = tui.util.map(legendLabels, function(label) {
                return {
                    chartType: self.options.chartType,
                    label: label
                };
            });
        } else {
            wholeLabels = [];
            tui.util.forEachArray(seriesChartTypes, function(chartType) {
                var labels = tui.util.map(legendLabels[chartType], function(label) {
                    return {
                        chartType: chartType,
                        label: label
                    };
                });
                wholeLabels = wholeLabels.concat(labels);
            });
        }

        return wholeLabels;
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
     * Format zero fill.
     * @param {number} len length of result
     * @param {string} value target value
     * @returns {string} formatted value
     * @private
     */
    _formatZeroFill: function(len, value) {
        var zero = '0',
            isMinus = value < 0;

        value = String(Math.abs(value));

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
            return Math.round(value);
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
            betweenLen = 3,
            orgValue = value,
            values, lastIndex, formattedValue;

        value = String(value);

        if (value.indexOf('.') > -1) {
            values = value.split('.');
            value = values[0];
            underPointValue = '.' + values[1];
        }

        if (value.length <= betweenLen) {
            formattedValue = orgValue;
        } else {
            values = (value).split('').reverse();
            lastIndex = values.length - 1;
            values = tui.util.map(values, function(char, index) {
                var result = [char];
                if (index < lastIndex && (index + 1) % betweenLen === 0) {
                    result.push(comma);
                }
                return result;
            });
            formattedValue = concat.apply([], values).reverse().join('') + underPointValue;
        }

        return formattedValue;
    },

    /**
     * Find format functions.
     * @returns {function[]} functions
     */
    _findFormatFunctions: function() {
        var format = tui.util.pick(this.options, 'chart', 'format') || '',
            funcs = [],
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
     * @returns {Array} multiline categories
     */
    getMultilineCategories: function(limitWidth, theme) {
        var self = this;

        if (!this.multilineCategories) {
            this.multilineCategories = tui.util.map(this.getCategories(), function(category) {
                return self._makeMultilineCategory(category, limitWidth, theme);
            });
        }

        return this.multilineCategories;
    },

    /**
     * Make sum map per stack.
     * @param {items} items items
     * @returns {object} sum map
     * @private
     */
    _makeSumMapPerStack: function(items) {
        var sumMap = {};
        tui.util.forEachArray(items, function(item) {
            if (!sumMap[item.stack]) {
                sumMap[item.stack] = 0;
            }

            sumMap[item.stack] += Math.abs(item.value);
        });

        return sumMap;
    },

    /**
     * Add data ratios of pie chart.
     */
    addDataRatiosOfPieChart: function() {
        this.getItemGroup().addDataRatiosOfPieChart();
    },

    /**
     * Register percent values.
     * @param {{min: number, max: number}} limit axis limit
     * @param {string} stacked stacked option
     * @param {string} chartType chart type
     * @private
     */
    addDataRatios: function(limit, stacked, chartType) {
        this.getItemGroup().addDataRatios(limit, stacked, chartType);
    }
});

module.exports = DataProcessor;
