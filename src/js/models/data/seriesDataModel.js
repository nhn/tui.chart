/**
 * @fileoverview SeriesDataModel is base model for drawing graph of chart series area,
 *                  and create from rawSeriesData by user,
 * SeriesDataModel.groups has SeriesGroups.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

/*
 * Raw series datum.
 * @typedef {{name: ?string, data: Array.<number>, stack: ?string}} rawSeriesDatum
 */

/*
 * Raw series data.
 * @typedef {Array.<rawSeriesDatum>} rawSeriesData
 */

/*
 * Groups.
 * @typedef {Array.<SeriesGroup>} groups
 */

/*
 * SeriesGroup is a element of SeriesDataModel.groups.
 * SeriesGroup.items has SeriesItem.
 */

/*
 * SeriesItem is a element of SeriesGroup.items.
 * SeriesItem has processed terminal data like value, ratio, etc.
 */

var SeriesGroup = require('./seriesGroup');
var SeriesItem = require('./seriesItem');
var SeriesItemForCoordinateType = require('./seriesItemForCoordinateType');
var predicate = require('../../helpers/predicate');
var calculator = require('../../helpers/calculator');
var arrayUtil = require('../../helpers/arrayUtil');
var snippet = require('tui-code-snippet');

var concat = Array.prototype.concat;

var SeriesDataModel = snippet.defineClass(/** @lends SeriesDataModel.prototype */{
    /**
     * SeriesDataModel is base model for drawing graph of chart series area,
     *      and create from rawSeriesData by user.
     * SeriesDataModel.groups has SeriesGroups.
     * @constructs SeriesDataModel
     * @private
     * @param {rawSeriesData} rawSeriesData - raw series data
     * @param {string} chartType - chart type
     * @param {object} options - options
     * @param {Array.<function>} formatFunctions - format functions
     * @param {boolean} isCoordinateType - whether coordinate type or not
     */
    init: function(rawSeriesData, chartType, options, formatFunctions, isCoordinateType) {
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
         * whether coordinate type or not
         * @type {boolean}
         */
        this.isCoordinateType = isCoordinateType;

        /**
         * baseGroups is base data for making SeriesGroups.
         * SeriesGroups is made by pivoted baseGroups, lf line type chart.
         * @type {Array.Array<SeriesItem>}
         */
        this.baseGroups = null;

        /**
         * groups has SeriesGroups.
         * @type {Array.<SeriesGroup>}
         */
        this.groups = null;

        this.options.series = this.options.series || {};

        /**
         * whether diverging chart or not.
         * @type {boolean}
         */
        this.isDivergingChart = predicate.isDivergingChart(chartType, this.options.series.diverging);

        /**
         * map of values by value type like value, x, y, r.
         * @type {object.<string, Array.<number>>}
         */
        this.valuesMap = {};

        this._removeRangeValue();
    },

    /**
     * Remove range value of item, if has stackType option.
     * @private
     */
    _removeRangeValue: function() {
        var seriesOption = snippet.pick(this.options, 'series') || {};
        var allowRange = predicate.isAllowRangeData(this.chartType) &&
                !predicate.isValidStackOption(seriesOption.stackType) && !seriesOption.spline;

        if (allowRange || this.isCoordinateType) {
            return;
        }

        snippet.forEachArray(this.rawSeriesData, function(rawItem) {
            if (!snippet.isArray(rawItem.data)) {
                return;
            }
            snippet.forEachArray(rawItem.data, function(value, index) {
                if (snippet.isExisty(value)) {
                    rawItem.data[index] = concat.apply(value)[0];
                }
            });
        });
    },

    /**
     * Create base groups.
     * Base groups is two-dimensional array by seriesItems.
     * @returns {Array.<Array.<(SeriesItem | SeriesItemForCoordinateType)>>}
     * @private
     */
    _createBaseGroups: function() {
        var chartType = this.chartType;
        var formatFunctions = this.formatFunctions;
        var xAxisOption = this.options.xAxis;
        var isDivergingChart = this.isDivergingChart;
        var isCoordinateType = this.isCoordinateType;
        var isPieChart = predicate.isPieChart(this.chartType);
        var hasRawDatumAsArray = predicate.isHeatmapChart(this.chartType) || predicate.isTreemapChart(this.chartType);
        var sortValues, SeriesItemClass;

        if (isCoordinateType) {
            SeriesItemClass = SeriesItemForCoordinateType;
            sortValues = function(items) {
                items.sort(function(a, b) {
                    return a.x - b.x;
                });
            };
        } else {
            SeriesItemClass = SeriesItem;
            sortValues = function() {};
        }

        return snippet.map(this.rawSeriesData, function(rawDatum) {
            var stack, data, legendName, items;

            data = snippet.isArray(rawDatum) ? rawDatum : [].concat(rawDatum.data);

            if (!hasRawDatumAsArray) {
                stack = rawDatum.stack;
            }
            if (rawDatum.name) {
                legendName = rawDatum.name;
            }

            if (isCoordinateType || isPieChart) {
                data = snippet.filter(data, snippet.isExisty);
            }

            items = snippet.map(data, function(datum, index) {
                return new SeriesItemClass({
                    datum: datum,
                    chartType: chartType,
                    formatFunctions: formatFunctions,
                    index: index,
                    legendName: legendName,
                    stack: stack,
                    isDivergingChart: isDivergingChart,
                    xAxisType: xAxisOption.type,
                    dateFormat: xAxisOption.dateFormat
                });
            });
            sortValues(items);

            return items;
        });
    },

    /**
     * Get base groups.
     * @returns {Array.Array.<SeriesItem>}
     * @private
     */
    _getBaseGroups: function() {
        if (!this.baseGroups) {
            this.baseGroups = this._createBaseGroups();
        }

        return this.baseGroups;
    },

    /**
     * Create SeriesGroups from rawData.series.
     * @param {boolean} isPivot - whether pivot or not.
     * @returns {Array.<SeriesGroup>}
     * @private
     */
    _createSeriesGroupsFromRawData: function(isPivot) {
        var baseGroups = this._getBaseGroups();

        if (isPivot) {
            baseGroups = arrayUtil.pivot(baseGroups);
        }

        return snippet.map(baseGroups, function(items) {
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
            this.groups = this._createSeriesGroupsFromRawData(true);
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
            this.pivotGroups = this._createSeriesGroupsFromRawData();
        }

        return this.pivotGroups;
    },

    /**
     * Get SeriesGroup.
     * @param {number} index - index
     * @param {boolean} [isPivot] - whether pivot or not
     * @returns {SeriesGroup}
     */
    getSeriesGroup: function(index, isPivot) {
        return isPivot ? this._getPivotGroups()[index] : this._getSeriesGroups()[index];
    },

    /**
     * Get first SeriesGroup.
     * @param {boolean} [isPivot] - whether pivot or not
     * @returns {SeriesGroup}
     */
    getFirstSeriesGroup: function(isPivot) {
        return this.getSeriesGroup(0, isPivot);
    },

    /**
     * Get first label of SeriesItem.
     * @returns {string} formatted value
     */
    getFirstItemLabel: function() {
        return this.getFirstSeriesGroup().getFirstSeriesItem().label;
    },

    /**
     * Get series item.
     * @param {number} groupIndex - index of series groups
     * @param {number} index - index of series items
     * @param {boolean} [isPivot] - whether pivot or not
     * @returns {SeriesItem}
     */
    getSeriesItem: function(groupIndex, index, isPivot) {
        return this.getSeriesGroup(groupIndex, isPivot).getSeriesItem(index);
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
     * Get minimum value.
     * @param {string} valueType - value type like value, x, y, r.
     * @returns {number}
     */
    getMinValue: function(valueType) {
        return arrayUtil.min(this.getValues(valueType));
    },

    /**
     * Get maximum value.
     * @param {string} valueType - value type like value, x, y, r.
     * @returns {number}
     */
    getMaxValue: function(valueType) {
        return arrayUtil.max(this.getValues(valueType));
    },

    /**
     * Traverse seriesGroups, and returns to found SeriesItem by result of execution seriesGroup.find with condition.
     * @param {function} condition - condition function
     * @returns {SeriesItem}
     * @private
     */
    _findSeriesItem: function(condition) {
        var foundItem;

        this.each(function(seriesGroup) {
            foundItem = seriesGroup.find(condition);

            return !foundItem;
        });

        return foundItem;
    },

    /**
     * Find SeriesItem by value.
     * @param {string} valueType - value type like value, x, y, r.
     * @param {number} value - comparing value
     * @param {function} condition - condition function
     * @returns {SeriesItem}
     * @private
     */
    _findSeriesItemByValue: function(valueType, value, condition) {
        condition = condition || function() {
            return null;
        };

        return this._findSeriesItem(function(seriesItem) {
            return seriesItem && (seriesItem[valueType] === value) && condition(seriesItem);
        });
    },

    /**
     * Find minimum SeriesItem.
     * @param {string} valueType - value type like value, x, y, r.
     * @param {function} condition - condition function
     * @returns {SeriesItem}
     */
    findMinSeriesItem: function(valueType, condition) {
        var minValue = this.getMinValue(valueType);

        return this._findSeriesItemByValue(valueType, minValue, condition);
    },

    /**
     * Find maximum SeriesItem.
     * @param {string} valueType - value type like value, x, y, r.
     * @param {function} condition - condition function
     * @returns {*|SeriesItem}
     */
    findMaxSeriesItem: function(valueType, condition) {
        var maxValue = this.getMaxValue(valueType);

        return this._findSeriesItemByValue(valueType, maxValue, condition);
    },

    /**
     * Create values that picked value from SeriesItems of SeriesGroups.
     * @param {?string} valueType - type of value
     * @returns {Array.<number>}
     * @private
     */
    _createValues: function(valueType) {
        var values = this.map(function(seriesGroup) {
            return seriesGroup.getValues(valueType);
        });

        values = concat.apply([], values);

        return snippet.filter(values, function(value) {
            return !isNaN(value);
        });
    },

    /**
     * Get values form valuesMap.
     * @param {?string} valueType - type of value
     * @returns {Array.<number>}
     */
    getValues: function(valueType) {
        valueType = valueType || 'value';

        if (!this.valuesMap[valueType]) {
            this.valuesMap[valueType] = this._createValues(valueType);
        }

        return this.valuesMap[valueType];
    },

    /**
     * Whether count of x values greater than count of y values.
     * @returns {boolean}
     */
    isXCountGreaterThanYCount: function() {
        return this.getValues('x').length > this.getValues('y').length;
    },

    /**
     * Add ratios, when has normal stackType option.
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
     * Add ratios, when has percent stackType option.
     * @private
     */
    _addRatiosWhenPercentStacked: function() {
        var baseRatio = this._calculateBaseRatio();

        this.each(function(seriesGroup) {
            seriesGroup.addRatiosWhenPercentStacked(baseRatio);
        });
    },

    /**
     * Add ratios, when has diverging stackType option.
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
        var allowMinusPointRender = predicate.allowMinusPointRender(this.chartType),
            subValue = 0;

        if (!allowMinusPointRender && predicate.isMinusLimit(limit)) {
            subValue = limit.max;
        } else if (allowMinusPointRender || limit.min >= 0) {
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
     * @param {string} stackType - stackType option
     * @private
     */
    addDataRatios: function(limit, stackType) {
        var isAllowedStackOption = predicate.isAllowedStackOption(this.chartType);

        if (isAllowedStackOption && predicate.isNormalStack(stackType)) {
            this._addRatiosWhenNormalStacked(limit);
        } else if (isAllowedStackOption && predicate.isPercentStack(stackType)) {
            if (this.isDivergingChart) {
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
            var sum = calculator.sum(seriesGroup.pluck('value'));

            seriesGroup.addRatios(sum);
        });
    },

    /**
     * Add ratios of data for chart of coordinate type.
     * @param {{x: {min: number, max: number}, y: {min: number, max: number}}} limitMap - limit map
     * @param {boolean} [hasRadius] - whether has radius or not
     */
    addDataRatiosForCoordinateType: function(limitMap, hasRadius) {
        var xLimit = limitMap.xAxis;
        var yLimit = limitMap.yAxis;
        var maxRadius = hasRadius ? arrayUtil.max(this.getValues('r')) : 0;
        var xDistance, xSubValue, yDistance, ySubValue;

        if (xLimit) {
            xDistance = Math.abs(xLimit.max - xLimit.min);
            xSubValue = this._makeSubtractionValue(xLimit);
        }

        if (yLimit) {
            yDistance = Math.abs(yLimit.max - yLimit.min);
            ySubValue = this._makeSubtractionValue(yLimit);
        }

        this.each(function(seriesGroup) {
            seriesGroup.each(function(item) {
                if (!item) {
                    return;
                }

                item.addRatio('x', xDistance, xSubValue);
                item.addRatio('y', yDistance, ySubValue);
                item.addRatio('r', maxRadius, 0);

                if (snippet.isExisty(item.start)) {
                    item.addRatio('start', yDistance, ySubValue);
                }
            });
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
     * Traverse groups, and executes iteratee function.
     * @param {function} iteratee - iteratee function
     * @param {boolean} isPivot - whether pivot or not
     */
    each: function(iteratee, isPivot) {
        var groups = isPivot ? this._getPivotGroups() : this._getSeriesGroups();

        snippet.forEachArray(groups, function(seriesGroup, index) {
            return iteratee(seriesGroup, index);
        });
    },

    /**
     * Traverse groups, and returns to result of execution about iteratee function.
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
