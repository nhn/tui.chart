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
    predicate = require('../helpers/predicate'),
    calculator = require('../helpers/calculator');

var concat = Array.prototype.concat;

var SeriesDataModel = tui.util.defineClass(/** @lends SeriesDataModel.prototype */{
    /**
     * Item group.
     * @constructs SeriesDataModel
     * @param {rawSeriesData} rawSeriesData raw series data
     * @param {string} chartType chart type
     * @param {object} options options
     * @param {Array.<function>} formatFunctions format functions
     */
    init: function(rawSeriesData, chartType, options, formatFunctions) {
        /**
         * chart type
         * @type {string}
         */
        this.chartType = chartType;

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
        this.rawSeriesData = rawSeriesData || [];

        /**
         * base groups
         * @type {Array.Array<SeriesItem>}
         */
        this.baseGroups = null;

        /**
         * groups
         * @type {groups}
         */
        this.groups = null;

        /**
         * all values of groups
         * @type {Array}
         */
        this.values = null;

        this._removeRangeValue();
    },

    /**
     * Remove range value of item, if has stacked option.
     * @private
     */
    _removeRangeValue: function() {
        var seriesOption = tui.util.pick(this.options, 'series') || {};

        if (predicate.isAllowRangeData(this.chartType) &&
            !predicate.isValidStackedOption(seriesOption.stacked) && !seriesOption.spline) {
            return;
        }

        tui.util.forEachArray(this.rawSeriesData, function(rawItem) {
            if (!tui.util.isArray(rawItem.data)) {
                return;
            }
            tui.util.forEachArray(rawItem.data, function(value, index) {
                rawItem.data[index] = concat.apply(value)[0];
            });
        });
    },

    /**
     * Create base groups.
     * @returns {Array.<Array.<SeriesItem>>}
     * @private
     */
    _createBaseGroups: function() {
        var self = this;

        return tui.util.map(this.rawSeriesData, function(rawDatum) {
            return tui.util.map(concat.apply(rawDatum.data), function(value) {
                return new SeriesItem(value, rawDatum.stack, self.formatFunctions);
            });
        });
    },

    /**
     * Get base groups.
     * @returns {Array.Array.<SeriesItem>}
     */
    getBaseGroups: function() {
        if (!this.baseGroups) {
            this.baseGroups = this._createBaseGroups();
        }

        return this.baseGroups;
    },

    /**
     * Create groups from rawData.series.
     * @param {boolean} isPivot - whether pivot or not.
     * @returns {Array.<SeriesGroup>}
     * @private
     */
    _createGroupsFromRawData: function(isPivot) {
        var baseGroups = this.getBaseGroups();

        if (isPivot) {
            baseGroups = tui.util.pivot(baseGroups);
        }

        return tui.util.map(baseGroups, function(items) {
            return new SeriesGroup(items);
        });
    },

    /**
     * Get SeriesGroups.
     * @returns {(Array.<SeriesGroup>|object)}
     * @private
     */
    _getSeriesGroups: function() {
        if (!this.groups) {
            this.groups = this._createGroupsFromRawData(true);
        }

        return this.groups;
    },

    /**
     * Get group count.
     * @returns {Number}
     */
    getGroupCount: function() {
        return this._getSeriesGroups().length;
    },

    /**
     * Get pivot groups.
     * @returns {(Array.<SeriesGroup>|object)}
     */
    _getPivotGroups: function() {
        if (!this.pivotGroups) {
            this.pivotGroups = this._createGroupsFromRawData();
        }

        return this.pivotGroups;
    },

    /**
     * Get SeriesGroup.
     * @param {number} index - index
     * @returns {SeriesGroup}
     */
    getSeriesGroup: function(index) {
        return this._getSeriesGroups()[index];
    },

    /**
     * Get first SeriesGroup.
     * @returns {SeriesGroup}
     */
    getFirstSeriesGroup: function() {
        return this.getSeriesGroup(0);
    },

    getFirstFormattedValue: function() {
        return this.getFirstSeriesGroup().formattedValue;
    },

    /**
     * Get series item.
     * @param {number} groupIndex - index of series groups
     * @param {number} index - index of series items
     * @returns {SeriesItem}
     */
    getSeriesItem: function(groupIndex, index) {
        return this.getSeriesGroup(groupIndex).getSeriesItem(index);
    },

    /**
     * Get first series item.
     * @returns {SeriesItem}
     */
    getFirstSeriesItem: function() {
        return this.getSeriesItem(0, 0);
    },

    /**
     * Get value.
     * @param {number} groupIndex - index of series groups
     * @param {number} index - index of series items
     * @returns {number} value
     */
    getValue: function(groupIndex, index) {
        return this.getSeriesItem(groupIndex, index).value;
    },

    /**
     * Make flattening values.
     * @returns {Array.<number>}
     * @private
     */
    _makeValues: function() {
        var values = this.map(function(seriesGroup) {
            return seriesGroup.getValues();
        });

        return concat.apply([], values);
    },

    /**
     * Get flattening values.
     * @returns {Array.<number>}
     */
    getValues: function() {
        if (!this.values) {
            this.values = this._makeValues();
        }

        return this.values;
    },

    /**
     * Add ratios, when has normal stacked option.
     * @param {{min: number, max: number}} limit - axis limit
     * @private
     */
    _addRatiosWhenNormalStacked: function(limit) {
        var distance = Math.abs(limit.max - limit.min);

        this.each(function(seriesGroup) {
            seriesGroup.addRatios(distance);
        });
    },

    /**
     * Calculate base ratio for calculating ratio of item.
     * @returns {number}
     * @private
     */
    _calculateBaseRatio: function() {
        var values = this.getValues(),
            plusSum = calculator.sumPlusValues(values),
            minusSum = Math.abs(calculator.sumMinusValues(values)),
            ratio = (plusSum > 0 && minusSum > 0) ? 0.5 : 1;

        return ratio;
    },

    /**
     * Add ratios, when has percent stacked option.
     * @private
     */
    _addRatiosWhenPercentStacked: function() {
        var baseRatio = this._calculateBaseRatio();

        this.each(function(seriesGroup) {
            seriesGroup.addRatiosWhenPercentStacked(baseRatio);
        });
    },

    /**
     * Add ratios, when has diverging stacked option.
     * @private
     */
    _addRatiosWhenDivergingStacked: function() {
        this.each(function(seriesGroup) {
            var values = seriesGroup.pluck('value'),
                plusSum = calculator.sumPlusValues(values),
                minusSum = Math.abs(calculator.sumMinusValues(values));

            seriesGroup.addRatiosWhenDivergingStacked(plusSum, minusSum);
        });
    },

    /**
     * Make subtraction value for making ratio of no option chart.
     * @param {{min: number, max: number}} limit - limit
     * @returns {number}
     * @private
     */
    _makeSubtractionValue: function(limit) {
        var isLineTypeChart = predicate.isLineTypeChart(this.chartType),
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
     * @param {{min: number, max: number}} limit - axis limit
     * @private
     */
    _addRatios: function(limit) {
        var distance = Math.abs(limit.max - limit.min),
            subValue = this._makeSubtractionValue(limit);

        this.each(function(seriesGroup) {
            seriesGroup.addRatios(distance, subValue);
        });
    },

    /**
     * Add data ratios.
     * @param {{min: number, max: number}} limit - axis limit
     * @param {string} stacked - stacked option
     * @private
     */
    addDataRatios: function(limit, stacked) {
        var isAllowedStackedOption = predicate.isAllowedStackedOption(this.chartType);

        if (isAllowedStackedOption && predicate.isNormalStacked(stacked)) {
            this._addRatiosWhenNormalStacked(limit);
        } else if (isAllowedStackedOption && predicate.isPercentStacked(stacked)) {
            if (this.divergingOption) {
                this._addRatiosWhenDivergingStacked();
            } else {
                this._addRatiosWhenPercentStacked();
            }
        } else {
            this._addRatios(limit);
        }
    },

    /**
     * Add data ratios of pie chart.
     */
    addDataRatiosOfPieChart: function() {
        this.each(function(seriesGroup) {
            var sum = tui.util.sum(seriesGroup.pluck('value'));

            seriesGroup.addRatios(sum);
        });
    },

    /**
     * Add start to all series item.
     * @param {number} start - start value
     */
    addStartValueToAllSeriesItem: function(start) {
        this.each(function(seriesGroup) {
            seriesGroup.addStartValueToAllSeriesItem(start);
        });
    },

    /**
     * Whether has range data or not.
     * @returns {boolean}
     */
    hasRangeData: function() {
        var hasRangeData = false;

        this.each(function(seriesGroup) {
            hasRangeData = seriesGroup.hasRangeData();
            return !hasRangeData;
        });

        return hasRangeData;
    },

    /**
     * Traverse groups and executes iteratee function.
     * @param {function} iteratee - iteratee function
     * @param {boolean} isPivot - whether pivot or not
     */
    each: function(iteratee, isPivot) {
        var groups = isPivot ? this._getPivotGroups() : this._getSeriesGroups();

        tui.util.forEachArray(groups, function(seriesGroup, index) {
            iteratee(seriesGroup, index);
        });
    },

    /**
     * Traverse groups and returns to result of execution about iteratee function.
     * @param {function} iteratee - iteratee function
     * @param {boolean} isPivot - whether pivot or not
     * @returns {Array}
     */
    map: function(iteratee, isPivot) {
        var results = [];

        this.each(function(seriesGroup, index) {
            results.push(iteratee(seriesGroup, index));
        }, isPivot);

        return results;
    }
});

module.exports = SeriesDataModel;
