/**
 * @fileoverview SeriesGroup is a element of SeriesDataModel.groups.
 * SeriesGroup.items has SeriesItem.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var calculator = require('../../helpers/calculator');
var snippet = require('tui-code-snippet');

var SeriesGroup = snippet.defineClass(/** @lends SeriesGroup.prototype */{
    /**
     * SeriesGroup is a element of SeriesDataModel.groups.
     * SeriesGroup.items has SeriesItem.
     * @constructs SeriesGroup
     * @private
     * @param {Array.<SeriesItem>} seriesItems - series items
     */
    init: function(seriesItems) {
        /**
         * items has SeriesItem
         * @type {Array.<SeriesItem>}
         */
        this.items = seriesItems;

        /**
         * map of values by value type like value, x, y, r.
         * @type {Array.<number>}
         */
        this.valuesMap = {};

        this.valuesMapPerStack = null;
    },

    /**
     * Get series item count.
     * @returns {number}
     */
    getSeriesItemCount: function() {
        return this.items.length;
    },

    /**
     * Get series item.
     * @param {number} index - index of items
     * @returns {SeriesItem}
     */
    getSeriesItem: function(index) {
        return this.items[index];
    },

    /**
     * Get first SeriesItem.
     * @returns {SeriesItem}
     */
    getFirstSeriesItem: function() {
        return this.getSeriesItem(0);
    },

    /**
     * Create values that picked value from SeriesItems.
     * @param {?string} valueType - type of value
     * @returns {Array.<number>}
     * @private
     */
    _createValues: function(valueType) {
        var values = [];

        this.each(function(item) {
            if (!item) {
                return;
            }

            if (snippet.isExisty(item[valueType])) {
                values.push(item[valueType]);
            }
            if (snippet.isExisty(item.start)) {
                values.push(item.start);
            }
        });

        return values;
    },

    /**
     * Get values from valuesMap.
     * @param {?string} valueType - type of value
     * @returns {Array}
     */
    getValues: function(valueType) {
        valueType = valueType || 'value';

        if (!this.valuesMap[valueType]) {
            this.valuesMap[valueType] = this._createValues(valueType);
        }

        return this.valuesMap[valueType];
    },

    /**
     * Make values map per stack.
     * @returns {object}
     * @private
     */
    _makeValuesMapPerStack: function() {
        var valuesMap = {};

        this.each(function(item) {
            if (!valuesMap[item.stack]) {
                valuesMap[item.stack] = [];
            }
            valuesMap[item.stack].push(item.value);
        });

        return valuesMap;
    },

    /**
     * Get values map per stack.
     * @returns {*|Object}
     */
    getValuesMapPerStack: function() {
        if (!this.valuesMapPerStack) {
            this.valuesMapPerStack = this._makeValuesMapPerStack();
        }

        return this.valuesMapPerStack;
    },

    /**
     * Make sum map per stack.
     * @returns {object} sum map
     * @private
     */
    _makeSumMapPerStack: function() {
        var valuesMap = this.getValuesMapPerStack(),
            sumMap = {};

        snippet.forEach(valuesMap, function(values, key) {
            sumMap[key] = calculator.sum(snippet.map(values, function(value) {
                return Math.abs(value);
            }));
        });

        return sumMap;
    },

    /**
     * Add start value to all series item.
     * @param {number} start start value
     */
    addStartValueToAllSeriesItem: function(start) {
        this.each(function(item) {
            if (!item) {
                return;
            }
            item.addStart(start);
        });
    },

    /**
     * Add ratios when percent stackType.
     * @param {number} baseRatio - base ratio
     */
    addRatiosWhenPercentStacked: function(baseRatio) {
        var sumMap = this._makeSumMapPerStack();

        this.each(function(item) {
            var dividingNumber = sumMap[item.stack];

            item.addRatio(dividingNumber, 0, baseRatio);
        });
    },

    /**
     * Add ratios when diverging stacked.
     * @param {number} plusSum - sum of plus number
     * @param {number} minusSum - sum of minus number
     */
    addRatiosWhenDivergingStacked: function(plusSum, minusSum) {
        this.each(function(item) {
            var dividingNumber = (item.value >= 0) ? plusSum : minusSum;

            item.addRatio(dividingNumber, 0, 0.5);
        });
    },

    /**
     * Add ratios.
     * @param {number} divNumber dividing number
     * @param {number} subValue subtraction value
     */
    addRatios: function(divNumber, subValue) {
        this.each(function(item) {
            if (!item) {
                return;
            }
            item.addRatio(divNumber, subValue);
        });
    },

    /**
     * Whether has range data or not.
     * @returns {boolean}
     */
    hasRangeData: function() {
        var hasRangeData = false;

        this.each(function(seriesItem) {
            hasRangeData = seriesItem && seriesItem.isRange;

            return !hasRangeData;
        });

        return hasRangeData;
    },

    /**
     * Traverse items, and executes iteratee function.
     * @param {function} iteratee - iteratee function
     */
    each: function(iteratee) {
        snippet.forEachArray(this.items, iteratee);
    },

    /**
     * Traverse items, and returns to results of execution about iteratee function.
     * @param {function} iteratee - iteratee function
     * @returns {Array}
     */
    map: function(iteratee) {
        return snippet.map(this.items, iteratee);
    },

    /**
     * Traverse items, and returns to picked result at item.
     * @param {string} key key for pick
     * @returns {Array}
     */
    pluck: function(key) {
        var items = snippet.filter(this.items, snippet.isExisty);

        return snippet.pluck(items, key);
    },

    /**
     * Traverse items, and returns to found SeriesItem by condition function.
     * @param {function} condition - condition function
     * @returns {SeriesItem|null}
     */
    find: function(condition) {
        var foundItem;

        this.each(function(seriesItem) {
            if (condition(seriesItem)) {
                foundItem = seriesItem;
            }

            return !foundItem;
        });

        return foundItem || null;
    },

    /**
     * Traverse items, and returns to filter SeriesItems by condition function.
     * @param {function} condition - condition function
     * @returns {Array}
     */
    filter: function(condition) {
        return snippet.filter(this.items, condition);
    }
});

module.exports = SeriesGroup;
