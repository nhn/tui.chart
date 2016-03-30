/**
 * @fileoverview Item group has itemses(Items instance).
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

/**
 * Raw series datum.
 * @typedef {{name: ?string, data: Array.<number>, stack: ?string}} rawSeriesDatum
 */

/**
 * Raw series data.
 * @typedef {Array.<rawSeriesDatum>} rawSeriesData
 */

/**
 * Groups.
 * @typedef {Array.<Items>} groups
 */

var Items = require('./items'),
    Item = require('./item'),
    chartConst = require('../const'),
    predicate = require('../helpers/predicate'),
    calculator = require('../helpers/calculator');

var concat = Array.prototype.concat;

var ItemGroup = tui.util.defineClass(/** @lends ItemGroup.prototype */{
    /**
     * Item group.
     * @constructs ItemGroup
     * @param {rawSeriesData} rawSeriesData raw series data
     * @param {object} options options
     * @param {Array.<string>} seriesChartTypes chart types
     * @param {Array.<function>} formatFunctions format functions
     */
    init: function(rawSeriesData, options, seriesChartTypes, formatFunctions) {
        /**
         * chart options
         * @type {Object}
         */
        this.options = options || {};

        /**
         * series chart types
         * @type {Array.<string>}
         */
        this.seriesChartTypes = seriesChartTypes;

        /**
         * functions for formatting
         * @type {Array.<function>}
         */
        this.formatFunctions = formatFunctions;

        /**
         * rawData.series
         * @type {rawSeriesData}
         */
        this.rawSeriesData = rawSeriesData;

        /**
         * base groups
         * @type {object}
         */
        this.baseGroups = {};

        /**
         * groups
         * @type {groups}
         */
        this.groups = null;

        /**
         * all values of groups
         * @type {object}
         */
        this.values = {};

        this._updateRawSeriesData();
    },

    /**
     * Remove range value of item.
     * @param {rawSeriesData} rawSeriesData - rawData.series
     * @private
     */
    _removeRangeValue: function(rawSeriesData) {
        tui.util.forEachArray(rawSeriesData, function(seriesDatum) {
            if (!tui.util.isArray(seriesDatum.data)) {
                return;
            }
            tui.util.forEachArray(seriesDatum.data, function(value, index) {
                seriesDatum.data[index] = concat.apply(value)[0];
            });
        });
    },

    /**
     * Update data of rawData.series.
     * @private
     */
    _updateRawSeriesData: function() {
        var self = this,
            rawSeriesData = this.rawSeriesData;

        if (!tui.util.pick(this.options, 'series', 'stacked')) {
            return;
        }

        if (tui.util.isArray(rawSeriesData)) {
            this._removeRangeValue(rawSeriesData);
        } else {
            tui.util.forEach(rawSeriesData, function(groupData) {
                self._removeRangeValue(groupData);
            });
        }
    },

    /**
     * Create base groups.
     * @param {rawSeriesData} rawSeriesData - rawData.series
     * @returns {Array.<Array.<Item>>}
     * @private
     */
    _createBaseGroups: function(rawSeriesData) {
        var self = this;

        return tui.util.map(rawSeriesData, function(rawDatum) {
            return tui.util.map(concat.apply(rawDatum.data), function(value) {
                return new Item(value, rawDatum.stack, self.formatFunctions);
            });
        });
    },

    /**
     * Get base groups.
     * @param {rawSeriesData} rawSeriesData - rawData.series
     * @param {string} chartType - chartType
     * @returns {Array.<Array.<Item>>}
     */
    getBaseGroups: function(rawSeriesData, chartType) {
        if (!this.baseGroups[chartType]) {
            this.baseGroups[chartType] = this._createBaseGroups(rawSeriesData);
        }

        return this.baseGroups[chartType];
    },

    /**
     * Create array type groups from rawData.series.
     * @param {rawSeriesData} rawSeriesData - rawData.series
     * @param {string} chartType - chart type
     * @param {boolean} isPivot - whether pivot or not
     * @returns {Array.<Items>}
     * @private
     */
    createArrayTypeGroupsFromRawData: function(rawSeriesData, chartType, isPivot) {
        var groups = this.getBaseGroups(rawSeriesData, chartType);

        if (isPivot) {
            groups = tui.util.pivot(groups);
        }

        return tui.util.map(groups, function(items) {
            return new Items(items);
        });
    },

    /**
     * Create groups from rawData.series.
     * @param {boolean} isPivot - whether pivot or not.
     * @returns {Array.<Items>}
     * @private
     */
    _createGroupsFromRawData: function(isPivot) {
        var self = this,
            rawSeriesData = this.rawSeriesData,
            groups;

        if (tui.util.isArray(rawSeriesData)) {
            groups = this.createArrayTypeGroupsFromRawData(rawSeriesData, chartConst.DUMMY_KEY, isPivot);
        } else {
            groups = {};
            tui.util.forEach(rawSeriesData, function(groupData, type) {
                groups[type] = self.createArrayTypeGroupsFromRawData(groupData, type, isPivot);
            });
        }

        return groups;
    },

    /**
     * Get groups.
     * @param {?string} chartType - chart type
     * @returns {(Array.<Items>|object)}
     */
    getGroups: function(chartType) {
        if (!this.groups) {
            this.groups = this._createGroupsFromRawData(true);
        }

        return this.groups[chartType] || this.groups;
    },

    /**
     * Get group count.
     * @param {string} chartType - chart type
     * @returns {Number}
     */
    getGroupCount: function(chartType) {
        return this.getGroups(chartType).length;
    },

    /**
     * Whether valid all group or not.
     * @returns {boolean}
     */
    isValidAllGroup: function() {
        var groupMap = this.getGroups(),
            isValid = true;

        tui.util.forEach(groupMap, function(groups) {
            if (!groups.length) {
                isValid = false;
            }
            return isValid;
        });

        return isValid;
    },

    /**
     * Get pivot groups.
     * @param {string} chartType - chart type
     * @returns {(Array.<Items>|object)}
     */
    getPivotGroups: function(chartType) {
        if (!this.pivotGroups) {
            this.pivotGroups = this._createGroupsFromRawData();
        }

        return this.pivotGroups[chartType] || this.pivotGroups;
    },

    /**
     * Get items.
     * @param {number} index - index
     * @param {string} chartType - chart type
     * @returns {Items}
     */
    getItems: function(index, chartType) {
        return this.getGroups(chartType)[index];
    },

    /**
     * Get first items.
     * @param {string} chartType - chart type
     * @returns {Items}
     */
    getFirstItems: function(chartType) {
        return this.getItems(0, chartType);
    },

    /**
     * Get item.
     * @param {number} groupIndex - index of groups
     * @param {number} index - index of items
     * @param {string} chartType - chart type
     * @returns {Item}
     */
    getItem: function(groupIndex, index, chartType) {
        return this.getItems(groupIndex, chartType).getItem(index);
    },

    /**
     * Get first item.
     * @param {string} chartType - chart type
     * @returns {Item}
     */
    getFirstItem: function(chartType) {
        return this.getItem(0, 0, chartType);
    },

    /**
     * Get value.
     * @param {number} groupIndex - index of groups
     * @param {number} index - index of items
     * @param {?string} chartType - chart type
     * @returns {number} value
     */
    getValue: function(groupIndex, index, chartType) {
        return this.getItem(groupIndex, index, chartType).value;
    },

    /**
     * Make flattening values.
     * @param {?string} chartType - chart type
     * @returns {Array.<number>}
     * @private
     */
    _makeValues: function(chartType) {
        var values = this.map(function(items) {
            return items.getValues();
        }, chartType);

        return concat.apply([], values);
    },

    /**
     * Get flattening values.
     * @param {?string} chartType - chart type
     * @returns {Array.<number>}
     */
    getValues: function(chartType) {
        if (!this.values[chartType]) {
            this.values[chartType] = this._makeValues(chartType);
        }

        return this.values[chartType];
    },

    /**
     * Make whole groups.
     * @returns {groups}
     * @private
     */
    _makeWholeGroups: function() {
        var wholeGroups = [];

        this.each(function(items, index) {
            if (!wholeGroups[index]) {
                wholeGroups[index] = [];
            }
            wholeGroups[index] = wholeGroups[index].concat(items.items);
        });

        wholeGroups = tui.util.map(wholeGroups, function(items) {
            return new Items(items);
        });

        return wholeGroups;
    },

    /**
     * Get whole groups.
     * @returns {groups}
     */
    getWholeGroups: function() {
        if (!this.wholeGroups) {
            this.wholeGroups = this._makeWholeGroups();
        }

        return this.wholeGroups;
    },

    /**
     * Make whole items.
     * @returns {Items}
     * @private
     */
    _makeWholeItems: function() {
        var wholeItems = [];

        this.each(function(items) {
            wholeItems = wholeItems.concat(items.items);
        });

        return new Items(wholeItems);
    },

    /**
     * Get whole items
     * @returns {Items}
     */
    getWholeItems: function() {
        if (!this.wholeItems) {
            this.wholeItems = this._makeWholeItems();
        }

        return this.wholeItems;
    },

    /**
     * Get whole values.
     * @returns {Array.<number>}
     */
    getWholeValues: function() {
        if (!this.wholeValues) {
            this.wholeValues = this.getWholeItems().pluck('value');
        }

        return this.wholeValues;
    },

    /**
     * Add ratios, when has normal stacked option.
     * @param {string} chartType - chart type
     * @param {{min: number, max: number}} limit - axis limit
     * @private
     */
    _addRatiosWhenNormalStacked: function(chartType, limit) {
        var distance = Math.abs(limit.max - limit.min);

        this.each(function(items) {
            items.addRatios(distance);
        }, chartType);
    },

    /**
     * Calculate base ratio for calculating ratio of item.
     * @param {string} chartType - chart type
     * @returns {number}
     * @private
     */
    _calculateBaseRatio: function(chartType) {
        var values = this.getValues(chartType),
            plusSum = calculator.sumPlusValues(values),
            minusSum = Math.abs(calculator.sumMinusValues(values)),
            ratio = (plusSum > 0 && minusSum > 0) ? 0.5 : 1;

        return ratio;
    },

    /**
     * Add ratios, when has percent stacked option.
     * @param {string} chartType - chart type
     * @private
     */
    _addRatiosWhenPercentStacked: function(chartType) {
        var baseRatio = this._calculateBaseRatio(chartType);

        this.each(function(items) {
            items.addRatiosWhenPercentStacked(baseRatio);
        }, chartType);
    },

    /**
     * Add ratios, when has diverging stacked option.
     * @param {string} chartType - chart type
     * @private
     */
    _addRatiosWhenDivergingStacked: function(chartType) {
        this.each(function(items) {
            var values = items.pluck('value'),
                plusSum = calculator.sumPlusValues(values),
                minusSum = Math.abs(calculator.sumMinusValues(values));

            items.addRatiosWhenDivergingStacked(plusSum, minusSum);
        }, chartType);
    },

    /**
     * Make subtraction value for making ratio of no option chart.
     * @param {string} chartType - chartType
     * @param {{min: number, max: number}} limit - limit
     * @returns {number}
     * @private
     */
    _makeSubtractionValue: function(chartType, limit) {
        var isLineTypeChart = predicate.isLineTypeChart(chartType),
            subValue = 0;

        if (!isLineTypeChart && predicate.isMinusLimit(limit)) {
            subValue = limit.max;
        } else if (isLineTypeChart || limit.min >= 0) {
            subValue = limit.min;
        }

        return subValue;
    },

    /**
     * Add ratios, when has not option.
     * @param {string} chartType - chart type
     * @param {{min: number, max: number}} limit - axis limit
     * @private
     */
    _addRatios: function(chartType, limit) {
        var distance = Math.abs(limit.max - limit.min),
            subValue = this._makeSubtractionValue(chartType, limit);

        this.each(function(items) {
            items.addRatios(distance, subValue);
        }, chartType);
    },

    /**
     * Add data ratios.
     * @param {{min: number, max: number}} limit - axis limit
     * @param {string} stacked - stacked option
     * @param {string} chartType - chart type
     * @private
     */
    addDataRatios: function(limit, stacked, chartType) {
        var isAllowedStackedOption = predicate.isAllowedStackedOption(chartType);

        if (isAllowedStackedOption && predicate.isNormalStacked(stacked)) {
            this._addRatiosWhenNormalStacked(chartType, limit);
        } else if (isAllowedStackedOption && predicate.isPercentStacked(stacked)) {
            if (this.divergingOption) {
                this._addRatiosWhenDivergingStacked(chartType);
            } else {
                this._addRatiosWhenPercentStacked(chartType);
            }
        } else {
            this._addRatios(chartType, limit);
        }
    },

    /**
     * Add data ratios of pie chart.
     */
    addDataRatiosOfPieChart: function() {
        var chartType = chartConst.CHART_TYPE_PIE;

        this.each(function(items) {
            var sum = tui.util.sum(items.pluck('value'));

            items.addRatios(sum);
        }, chartType);
    },

    /**
     * Update start value of item.
     * @param {number} start - start value
     * @param {string} chartType - chart type
     */
    updateItemStart: function(start, chartType) {
        this.each(function(items) {
            items.addStartToAllItem(start);
        }, chartType);
    },

    /**
     * Traverse groups and executes iteratee function.
     * @param {function} iteratee - iteratee function
     * @param {string} chartType - chart type
     * @param {boolean} isPivot - whether pivot or not
     */
    each: function(iteratee, chartType, isPivot) {
        var groups = isPivot ? this.getPivotGroups(chartType) : this.getGroups(chartType),
            groupMap = {};

        if (tui.util.isArray(groups)) {
            groupMap[chartConst.DUMMY_KEY] = groups;
        } else {
            groupMap = groups;
        }


        tui.util.forEach(groupMap, function(_groups, key) {
            key = (key === chartConst.DUMMY_KEY) ? null : key;

            tui.util.forEachArray(_groups, function(items, index) {
                iteratee(items, index, key);
            });
        });
    },

    /**
     * Traverse groups and returns to result of execution about iteratee function.
     * @param {function} iteratee - iteratee function
     * @param {string} chartType - chart type
     * @param {boolean} isPivot - whether pivot or not
     * @returns {Array}
     */
    map: function(iteratee, chartType, isPivot) {
        var results = [];
        this.each(function(items, index, key) {
            results.push(iteratee(items, index, key));
        }, chartType, isPivot);

        return results;
    }
});

module.exports = ItemGroup;
