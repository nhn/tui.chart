/**
 * @fileoverview SeriesDataModel has SeriesGroups.
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
 * @typedef {Array.<SeriesGroup>} groups
 */

var SeriesGroup = require('./seriesGroup'),
    SeriesItem = require('./seriesItem'),
    chartConst = require('../const'),
    predicate = require('../helpers/predicate'),
    calculator = require('../helpers/calculator');

var concat = Array.prototype.concat;

var SeriesDataModel = tui.util.defineClass(/** @lends SeriesDataModel.prototype */{
    /**
     * Item group.
     * @constructs SeriesDataModel
     * @param {rawSeriesData} rawSeriesData raw series data
     * @param {object} options options
     * @param {Array.<function>} formatFunctions format functions
     */
    init: function(rawSeriesData, options, formatFunctions) {
        /**
         * chart options
         * @type {Object}
         */
        this.options = options || {};

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

        this._removeRangeValueIfStackedOption();
    },

    /**
     * Remove range value of item.
     * @param {rawSeriesData} rawSeriesData - rawData.series
     * @private
     */
    _removeRangeValue: function(rawSeriesData) {
        tui.util.forEachArray(rawSeriesData, function(legendData) {
            if (!tui.util.isArray(legendData.data)) {
                return;
            }
            tui.util.forEachArray(legendData.data, function(value, index) {
                legendData.data[index] = concat.apply(value)[0];
            });
        });
    },

    /**
     * Remove range value of item, if has stacked option.
     * @private
     */
    _removeRangeValueIfStackedOption: function() {
        var self = this,
            stackedOption = tui.util.pick(this.options, 'series', 'stacked'),
            rawSeriesData = this.rawSeriesData;

        if (!predicate.isValidStackedOption(stackedOption)) {
            return;
        }

        //if (tui.util.isArray(rawSeriesData)) {
            this._removeRangeValue(rawSeriesData);
        //} else {
        //    tui.util.forEach(rawSeriesData, function(groupData) {
        //        self._removeRangeValue(groupData);
        //    });
        //}
    },

    /**
     * Create base groups.
     * @param {rawSeriesData} rawSeriesData - rawData.series
     * @returns {Array.<Array.<SeriesItem>>}
     * @private
     */
    _createBaseGroups: function(rawSeriesData) {
        var self = this;

        return tui.util.map(rawSeriesData, function(rawDatum) {
            return tui.util.map(concat.apply(rawDatum.data), function(value) {
                return new SeriesItem(value, rawDatum.stack, self.formatFunctions);
            });
        });
    },

    /**
     * Get base groups.
     * @param {rawSeriesData} rawSeriesData - rawData.series
     * @param {string} chartType - chartType
     * @returns {Array.<Array.<SeriesItem>>}
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
     * @returns {Array.<SeriesGroup>}
     * @private
     */
    createArrayTypeGroupsFromRawData: function(rawSeriesData, chartType, isPivot) {
        var groups = this.getBaseGroups(rawSeriesData, chartType);

        if (isPivot) {
            groups = tui.util.pivot(groups);
        }

        return tui.util.map(groups, function(items) {
            return new SeriesGroup(items);
        });
    },

    /**
     * Create groups from rawData.series.
     * @param {boolean} isPivot - whether pivot or not.
     * @returns {Array.<SeriesGroup>}
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
     * Get SeriesGroups.
     * @param {?string} chartType - chart type
     * @returns {(Array.<SeriesGroup>|object)}
     * @private
     */
    _getSeriesGroups: function(chartType) {
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
        return this._getSeriesGroups(chartType).length;
    },

    /**
     * Whether valid all group or not.
     * @returns {boolean}
     */
    isValidAllGroup: function() {
        var groupMap = this._getSeriesGroups(),
            isValid = true;

        if (!tui.util.isArray(groupMap)) {
            tui.util.forEach(groupMap, function(groups) {
                isValid = !!groups.length;
                return isValid;
            });
        }

        return isValid;
    },

    /**
     * Get pivot groups.
     * @param {string} chartType - chart type
     * @returns {(Array.<SeriesGroup>|object)}
     */
    getPivotGroups: function(chartType) {
        if (!this.pivotGroups) {
            this.pivotGroups = this._createGroupsFromRawData();
        }

        return this.pivotGroups[chartType] || this.pivotGroups;
    },

    /**
     * Get SeriesGroup.
     * @param {number} index - index
     * @param {string} chartType - chart type
     * @returns {SeriesGroup}
     */
    getSeriesGroup: function(index, chartType) {
        return this._getSeriesGroups(chartType)[index];
    },

    /**
     * Get first SeriesGroup.
     * @param {string} chartType - chart type
     * @returns {SeriesGroup}
     */
    getFirstSeriesGroup: function(chartType) {
        return this.getSeriesGroup(0, chartType);
    },

    /**
     * Get series item.
     * @param {number} groupIndex - index of series groups
     * @param {number} index - index of series items
     * @param {string} chartType - chart type
     * @returns {SeriesItem}
     */
    getSeriesItem: function(groupIndex, index, chartType) {
        return this.getSeriesGroup(groupIndex, chartType).getSeriesItem(index);
    },

    /**
     * Get first series item.
     * @param {string} chartType - chart type
     * @returns {SeriesItem}
     */
    getFirstSeriesItem: function(chartType) {
        return this.getSeriesItem(0, 0, chartType);
    },

    /**
     * Get value.
     * @param {number} groupIndex - index of series groups
     * @param {number} index - index of series items
     * @param {?string} chartType - chart type
     * @returns {number} value
     */
    getValue: function(groupIndex, index, chartType) {
        return this.getSeriesItem(groupIndex, index, chartType).value;
    },

    /**
     * Make flattening values.
     * @param {?string} chartType - chart type
     * @returns {Array.<number>}
     * @private
     */
    _makeValues: function(chartType) {
        var values = this.map(function(seriesGroup) {
            return seriesGroup.getValues();
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
     * Make whole series groups.
     * @returns {groups}
     * @private
     */
    _makeWholeSeriesGroups: function() {
        var wholeSeriesGroups = [];

        this.each(function(seriesGroup, index) {
            if (!wholeSeriesGroups[index]) {
                wholeSeriesGroups[index] = [];
            }
            wholeSeriesGroups[index] = wholeSeriesGroups[index].concat(seriesGroup.items);
        });

        wholeSeriesGroups = tui.util.map(wholeSeriesGroups, function(items) {
            return new SeriesGroup(items);
        });

        return wholeSeriesGroups;
    },

    /**
     * Get whole groups.
     * @returns {groups}
     */
    getWholeSeriesGroups: function() {
        if (!this.wholeSeriesGroups) {
            this.wholeSeriesGroups = this._makeWholeSeriesGroups();
        }

        return this.wholeSeriesGroups;
    },

    /**
     * Make whole values.
     * @returns {Array.<number>}
     * @private
     */
    _makeWholeValues: function() {
        var wholeValues = [];

        this.each(function(seriesGroup) {
            wholeValues = wholeValues.concat(seriesGroup.pluck('value'));
        });

        return wholeValues;
    },

    /**
     * Get whole values.
     * @returns {Array.<number>}
     */
    getWholeValues: function() {
        if (!this.wholeValues) {
            this.wholeValues = this._makeWholeValues();
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

        this.each(function(seriesGroup) {
            seriesGroup.addRatios(distance);
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

        this.each(function(seriesGroup) {
            seriesGroup.addRatiosWhenPercentStacked(baseRatio);
        }, chartType);
    },

    /**
     * Add ratios, when has diverging stacked option.
     * @param {string} chartType - chart type
     * @private
     */
    _addRatiosWhenDivergingStacked: function(chartType) {
        this.each(function(seriesGroup) {
            var values = seriesGroup.pluck('value'),
                plusSum = calculator.sumPlusValues(values),
                minusSum = Math.abs(calculator.sumMinusValues(values));

            seriesGroup.addRatiosWhenDivergingStacked(plusSum, minusSum);
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

        this.each(function(seriesGroup) {
            seriesGroup.addRatios(distance, subValue);
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

        this.each(function(seriesGroup) {
            var sum = tui.util.sum(seriesGroup.pluck('value'));

            seriesGroup.addRatios(sum);
        }, chartType);
    },

    /**
     * Add start to all series item.
     * @param {number} start - start value
     * @param {string} chartType - chart type
     */
    addStartValueToAllSeriesItem: function(start, chartType) {
        this.each(function(seriesGroup) {
            seriesGroup.addStartValueToAllSeriesItem(start);
        }, chartType);
    },

    /**
     * Traverse groups and executes iteratee function.
     * @param {function} iteratee - iteratee function
     * @param {string} chartType - chart type
     * @param {boolean} isPivot - whether pivot or not
     */
    each: function(iteratee, chartType, isPivot) {
        var groups = isPivot ? this.getPivotGroups(chartType) : this._getSeriesGroups(chartType),
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

module.exports = SeriesDataModel;
