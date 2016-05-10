/**
 * @fileoverview DataProcessor process rawData.
 * rawData.categories --> categories
 * rawData.series --> SeriesDataModel, legendLabels, legendData
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    SeriesDataModel = require('../dataModels/seriesDataModel'),
    SeriesGroup = require('./seriesGroup'),
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
 * Raw data by user.
 * @typedef {{
 *      categories: ?Array.<string>,
 *      series: (rawSeriesData|{line: ?rawSeriesData, column: ?rawSeriesData})
 * }} rawData
 */

/**
 * SeriesDataModel is base model for drawing graph of chart series area,
 *      and create from rawSeriesData by user,
 * SeriesDataModel.groups has SeriesGroups.
 */

/**
 * SeriesGroup is a element of SeriesDataModel.groups.
 * SeriesGroup.items has SeriesItem.
 */

var DataProcessor = tui.util.defineClass(/** @lends DataProcessor.prototype */{
    /**
     * Data processor.
     * @constructs DataProcessor
     * @param {rawData} rawData raw data
     * @param {string} chartType chart type
     * @param {object} options options
     * @param {Array.<string>} seriesChartTypes chart types
     */
    init: function(rawData, chartType, options, seriesChartTypes) {
        var seriesOption = options.series || {};

        /**
         * original raw data.
         * @type {{categories: ?Array.<string>, series: Array.<object>}}
         */
        this.originalRawData = rawData;

        /**
         * chart type
         * @type {string}
         */
        this.chartType = chartType;

        /**
         * chart options
         * @type {Object}
         */
        this.options = options;

        /**
         * seriesChartTypes is sorted chart types for rendering series area of combo chart.
         * @type {Array.<string>}
         */
        this.seriesChartTypes = seriesChartTypes;

        /**
         * diverging option
         * @type {boolean}
         */
        this.divergingOption = predicate.isBarTypeChart(options.chartType) && seriesOption.diverging;

        /**
         * legend data for rendering legend of group tooltip
         * @type {Array.<{chartType: string, label: string}>}
         */
        this.originalLegendData = null;

        this.initData(rawData);
    },

    /**
     * Get original raw data.
     * @returns {rawData} raw data
     */
    getOriginalRawData: function() {
        return this.originalRawData;
    },

    /**
     * Initialize data.
     * @param {rawData} rawData raw data
     */
    initData: function(rawData) {
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
         * seriesDataModel map
         * @type {object.<string, SeriesDataModel>}
         */
        this.seriesDataModelMap = {};

        /**
         * SeriesGroups
         * @type {Array.<SeriesGroup>}
         */
        this.seriesGroups = null;

        /**
         * map of values of SeriesItems
         * @type {Object.<string, Array.<number>>}
         */
        this.valuesMap = {};

        /**
         * legend labels for rendering legend area
         * @type {{column: Array.<string>, line: Array.<string> | Array.<string>}}
         */
        this.legendLabels = null;

        /**
         * legend data for rendering legend
         * @type {Array.<{chartType: string, label: string}>}
         */
        this.legendData = null;

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
     * @returns {Array.<string>} processed categories
     * @private
     */
    _processCategories: function() {
        return tui.util.map(this.rawData.categories, tui.util.encodeHTMLEntity);
    },

    /**
     * Get Categories
     * @returns {Array.<string>}}
     */
    getCategories: function() {
        if (!this.categories) {
            this.categories = this._processCategories();
        }

        return this.categories;
    },

    /**
     * Whether has categories or not.
     * @returns {boolean}
     */
    hasCategories: function() {
        return !!this.getCategories().length;
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
     * Get SeriesDataModel.
     * @param {string} chartType - chart type
     * @returns {SeriesDataModel}
     */
    getSeriesDataModel: function(chartType) {
        var rawSeriesData;

        if (!this.seriesDataModelMap[chartType]) {
            rawSeriesData = this.rawData.series[chartType] || this.rawData.series;
            this.seriesDataModelMap[chartType] = new SeriesDataModel(rawSeriesData, chartType,
                this.options, this.getFormatFunctions());
        }

        return this.seriesDataModelMap[chartType];
    },

    /**
     * Get group count.
     * @param {string} chartType chart type
     * @returns {number}
     */
    getGroupCount: function(chartType) {
        return this.getSeriesDataModel(chartType).getGroupCount();
    },

    /**
     * Traverse all SeriesDataModel by seriesChartTypes, and executes iteratee function.
     * @param {function} iteratee iteratee function
     * @private
     */
    _eachByAllSeriesDataModel: function(iteratee) {
        var self = this,
            seriesChartTypes = this.seriesChartTypes || [this.chartType];

        tui.util.forEachArray(seriesChartTypes, function(chartType) {
            return iteratee(self.getSeriesDataModel(chartType), chartType);
        });
    },

    /**
     * Whether valid all SeriesDataModel or not.
     * @returns {boolean}
     */
    isValidAllSeriesDataModel: function() {
        var isValid = true;

        this._eachByAllSeriesDataModel(function(seriesDataModel) {
            isValid = !!seriesDataModel.getGroupCount();

            return isValid;
        });

        return isValid;
    },

    /**
     * Make SeriesGroups.
     * @returns {Array.<SeriesGroup>}
     * @private
     */
    _makeSeriesGroups: function() {
        var joinedGroups = [],
            seriesGroups;

        this._eachByAllSeriesDataModel(function(seriesDataModel) {
            seriesDataModel.each(function(seriesGroup, index) {
                if (!joinedGroups[index]) {
                    joinedGroups[index] = [];
                }
                joinedGroups[index] = joinedGroups[index].concat(seriesGroup.items);
            });
        });

        seriesGroups = tui.util.map(joinedGroups, function(items) {
            return new SeriesGroup(items);
        });

        return seriesGroups;
    },

    /**
     * Get SeriesGroups.
     * @returns {Array.<SeriesGroup>}
     */
    getSeriesGroups: function() {
        if (!this.seriesGroups) {
            this.seriesGroups = this._makeSeriesGroups();
        }
        return this.seriesGroups;
    },

    /**
     * Get value.
     * @param {number} groupIndex group index
     * @param {number} index index
     * @param {?string} chartType chart type
     * @returns {number} value
     */
    getValue: function(groupIndex, index, chartType) {
        return this.getSeriesDataModel(chartType).getValue(groupIndex, index);
    },

    /**
     * Create values that picked value from SeriesItems of specific SeriesDataModel.
     * @param {?string} chartType - type of chart
     * @param {?string} valueType - type of value like value, x, y, r.
     * @returns {Array.<number>}
     * @private
     */
    _createValues: function(chartType, valueType) {
        var values;

        if (chartType === chartConst.DUMMY_KEY) {
            values = [];
            this._eachByAllSeriesDataModel(function(seriesDataModel) {
                values = values.concat(seriesDataModel.getValues(valueType));
            });
        } else {
            values = this.getSeriesDataModel(chartType).getValues(valueType);
        }
        return values;
    },

    /**
     * Get values from valuesMap.
     * @param {?string} chartType - type of chart
     * @param {?string} valueType - type of value like value, x, y, r.
     * @returns {Array.<number>}
     */
    getValues: function(chartType, valueType) {
        var mapKey;

        chartType = chartType || chartConst.DUMMY_KEY;

        mapKey = chartType + valueType;

        if (!this.valuesMap[mapKey]) {
            this.valuesMap[mapKey] = this._createValues(chartType, valueType);
        }

        return this.valuesMap[mapKey];
    },

    /**
     * Get max value.
     * @param {?string} chartType - type of chart
     * @param {?string} valueType - type of value like value, x, y, r
     * @returns {number}
     */
    getMaxValue: function(chartType, valueType) {
        return tui.util.max(this.getValues(chartType, valueType));
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

        return renderUtil.formatValue(maxValue, formatFunctions, areaType, valueType);
    },

    /**
     * Traverse SeriesGroup of all SeriesDataModel, and executes iteratee function.
     * @param {function} iteratee iteratee function
     */
    eachBySeriesGroup: function(iteratee) {
        this._eachByAllSeriesDataModel(function(seriesDataModel, chartType) {
            seriesDataModel.each(function(seriesGroup, groupIndex) {
                iteratee(seriesGroup, groupIndex, chartType);
            });
        });
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
     * Make legend data.
     * @returns {Array} labels
     * @private
     */
    _makeLegendData: function() {
        var legendLabels = this.getLegendLabels(),
            seriesChartTypes = this.seriesChartTypes || [this.chartType],
            legendLabelsMap, legendData;

        if (tui.util.isArray(legendLabels)) {
            legendLabelsMap = [this.chartType];
            legendLabelsMap[this.chartType] = legendLabels;
        } else {
            seriesChartTypes = this.seriesChartTypes;
            legendLabelsMap = legendLabels;
        }

        legendData = tui.util.map(seriesChartTypes, function(chartType) {
            return tui.util.map(legendLabelsMap[chartType], function(label) {
                return {
                    chartType: chartType,
                    label: label
                };
            });
        });

        return concat.apply([], legendData);
    },

    /**
     * Get legend data.
     * @returns {Array.<{chartType: string, label: string}>} legend data
     */
    getLegendData: function() {
        if (!this.legendData) {
            this.legendData = this._makeLegendData();
        }

        if (!this.originalLegendData) {
            this.originalLegendData = this.legendData;
        }

        return this.legendData;
    },

    /**
     * get original legend data.
     * @returns {Array.<{chartType: string, label: string}>}
     */
    getOriginalLegendData: function() {
        return this.originalLegendData;
    },

    /**
     * Get legend item.
     * @param {number} index index
     * @returns {{chartType: string, label: string}} legend data
     */
    getLegendItem: function(index) {
        return this.getLegendData()[index];
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
     * Get first label of SeriesItem.
     * @param {?string} chartType chartType
     * @returns {string} formatted value
     */
    getFirstItemLabel: function(chartType) {
        return this.getSeriesDataModel(chartType).getFirstItemLabel();
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
            var len = tui.util.getDecimalLength(value);
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
            funcs = [tui.util.bind(this._formatToDecimal, this, len)];
        } else if (this._isZeroFill(format)) {
            len = format.length;
            funcs = [tui.util.bind(this._formatToZeroFill, this, len)];
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
        var format = tui.util.pick(this.options, 'chart', 'format');
        var funcs = [];

        if (tui.util.isFunction(format)) {
            funcs = [format];
        } else if (tui.util.isString(format)) {
            funcs = this._findSimpleTypeFormatFunctions(format);
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
        var words = String(category).split(/\s+/),
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
     * @param {Array.<(number | string)>} xAxisLabels labels of xAxis
     * @returns {Array} multiline categories
     */
    getMultilineCategories: function(limitWidth, theme, xAxisLabels) {
        var self = this;

        if (!this.multilineCategories) {
            this.multilineCategories = tui.util.map(xAxisLabels, function(category) {
                return self._makeMultilineCategory(category, limitWidth, theme);
            });
        }

        return this.multilineCategories;
    },

    /**
     * Add data ratios of pie chart.
     * @param {string} chartType - type of chart.
     */
    addDataRatiosOfPieChart: function(chartType) {
        this.getSeriesDataModel(chartType).addDataRatiosOfPieChart();
    },

    /**
     * Add data ratios for chart of coordinate type.
     * @param {string} chartType - type of chart.
     * @param {{x: {min: number, max: number}, y: {min: number, max: number}}} limitMap - limit map
     * @param {boolean} [hasRadius] - whether has radius or not
     */
    addDataRatiosForCoordinateType: function(chartType, limitMap, hasRadius) {
        this.getSeriesDataModel(chartType).addDataRatiosForCoordinateType(limitMap, hasRadius);
    },

    /**
     * Add start value to all series item.
     * @param {{min: number, max: number}} limit - limit
     * @param {string} chartType - chart type
     * @private
     */
    _addStartValueToAllSeriesItem: function(limit, chartType) {
        var start = 0;

        if (limit.min >= 0) {
            start = limit.min;
        } else if (limit.max <= 0) {
            start = limit.max;
        }

        this.getSeriesDataModel(chartType).addStartValueToAllSeriesItem(start);
    },

    /**
     * Register percent values.
     * @param {{min: number, max: number}} limit axis limit
     * @param {string} stacked stacked option
     * @param {string} chartType chart type
     * @private
     */
    addDataRatios: function(limit, stacked, chartType) {
        var seriesDataModel = this.getSeriesDataModel(chartType);

        this._addStartValueToAllSeriesItem(limit, chartType);
        seriesDataModel.addDataRatios(limit, stacked);
    }
});

module.exports = DataProcessor;
