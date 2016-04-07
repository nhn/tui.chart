/**
 * @fileoverview Items has items(Item instance).
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var SeriesGroup = tui.util.defineClass(/** @lends SeriesGroup.prototype */{
    /**
     * SeriesGroup.
     * @constructs SeriesGroup
     * @param {Array.<SeriesItem>} seriesItems - series items
     */
    init: function(seriesItems) {
        /**
         * items
         * @type {Array.<SeriesItem>}
         */
        this.items = seriesItems;

        /**
         * item vlaues.
         * @type {Array.<number>}
         */
        this.values = null;
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
     * @returns {Item}
     */
    getSeriesItem: function(index) {
        return this.items[index];
    },

    /**
     * Make values of item.
     * @returns {Array.<number>}
     * @private
     */
    _makeValues: function() {
        var values = [];

        this.each(function(item) {
            values.push(item.value);
            if (!tui.util.isNull(item.start)) {
                values.push(item.start);
            }
        });

        return values;
    },

    /**
     * Get
     * @returns {Array}
     */
    getValues: function() {
        if (!this.values) {
            this.values = this._makeValues();
        }

        return this.values;
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
     * Make sum map per stack.
     * @returns {object} sum map
     * @private
     */
    _makeSumMapPerStack: function() {
        var valuesMap = this.getValuesMapPerStack(),
            sumMap = {};

        tui.util.forEach(valuesMap, function(values, key) {
            sumMap[key] = tui.util.sum(tui.util.map(values, function(value) {
                return Math.abs(value);
            }));
        });

        return sumMap;
    },

    /**
     * Get values map per stack.
     * @returns {*|Object}
     */
    getValuesMapPerStack: function() {
        if (!this.valuesMap) {
            this.valuesMap = this._makeValuesMapPerStack();
        }

        return this.valuesMap;
    },

    /**
     * Add start value to all series item.
     * @param {number} start start value
     */
    addStartValueToAllSeriesItem: function(start) {
        this.each(function(item) {
            item.addStart(start);
        });
    },

    /**
     * Add ratios when percent stacked.
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
            item.addRatio(divNumber, subValue);
        });
    },

    /**
     * Traverse items, and executes iteratee function.
     * @param {function} iteratee - iteratee function
     */
    each: function(iteratee) {
        tui.util.forEachArray(this.items, iteratee);
    },

    /**
     * Traverse items, and returns to result of execution about iteratee function.
     * @param {function} iteratee - iteratee function
     * @returns {Array}
     */
    map: function(iteratee) {
        return tui.util.map(this.items, iteratee);
    },

    /**
     * Traverse items and returns to picked result at item.
     * @param {string} key key for pick
     * @returns {Array}
     */
    pluck: function(key) {
        return tui.util.pluck(this.items, key);
    }
});

module.exports = SeriesGroup;
