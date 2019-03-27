/**
 * @fileoverview SeriesGroup is a element of SeriesDataModel.groups.
 * SeriesGroup.items has SeriesItem.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import calculator from '../../helpers/calculator';
import snippet from 'tui-code-snippet';

class SeriesGroup {
    /**
     * SeriesGroup is a element of SeriesDataModel.groups.
     * SeriesGroup.items has SeriesItem.
     * @constructs SeriesGroup
     * @private
     * @param {Array.<SeriesItem>} seriesItems - series items
     */
    constructor(seriesItems) {
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
    }

    /**
     * Get series item count.
     * @returns {number}
     */
    getSeriesItemCount() {
        return this.items.length;
    }

    /**
     * Get series item.
     * @param {number} index - index of items
     * @returns {SeriesItem}
     */
    getSeriesItem(index) {
        return this.items[index];
    }

    /**
     * Get first SeriesItem.
     * @returns {SeriesItem}
     */
    getFirstSeriesItem() {
        return this.getSeriesItem(0);
    }

    /**
     * Create values that picked value from SeriesItems.
     * @param {?string} valueType - type of value
     * @returns {Array.<number>}
     * @private
     */
    _createValues(valueType) {
        const values = [];

        this.each(item => {
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
    }

    /**
     * Get values from valuesMap.
     * @param {?string} valueType - type of value
     * @returns {Array}
     */
    getValues(valueType) {
        valueType = valueType || 'value';

        if (!this.valuesMap[valueType]) {
            this.valuesMap[valueType] = this._createValues(valueType);
        }

        return this.valuesMap[valueType];
    }

    /**
     * Make values map per stack.
     * @returns {object}
     * @private
     */
    _makeValuesMapPerStack() {
        const valuesMap = {};

        this.each(item => {
            if (!valuesMap[item.stack]) {
                valuesMap[item.stack] = [];
            }
            valuesMap[item.stack].push(item.value);
        });

        return valuesMap;
    }

    /**
     * Get values map per stack.
     * @returns {*|Object}
     */
    getValuesMapPerStack() {
        if (!this.valuesMapPerStack) {
            this.valuesMapPerStack = this._makeValuesMapPerStack();
        }

        return this.valuesMapPerStack;
    }

    /**
     * Make sum map per stack.
     * @returns {object} sum map
     * @private
     */
    _makeSumMapPerStack() {
        const valuesMap = this.getValuesMapPerStack();
        const sumMap = {};

        Object.entries(valuesMap).forEach(([key, values]) => {
            sumMap[key] = calculator.sum(values.map(value => Math.abs(value)));
        });

        return sumMap;
    }

    /**
     * Add start value to all series item.
     * @param {number} start start value
     */
    addStartValueToAllSeriesItem(start) {
        this.each(item => {
            if (!item) {
                return;
            }
            item.addStart(start);
        });
    }

    /**
     * Add ratios when percent stackType.
     * @param {number} baseRatio - base ratio
     */
    addRatiosWhenPercentStacked(baseRatio) {
        const sumMap = this._makeSumMapPerStack();

        this.each(item => {
            const dividingNumber = sumMap[item.stack];

            item.addRatio(dividingNumber, 0, baseRatio);
        });
    }

    /**
     * Add ratios when diverging stacked.
     * @param {number} plusSum - sum of plus number
     * @param {number} minusSum - sum of minus number
     */
    addRatiosWhenDivergingStacked(plusSum, minusSum) {
        this.each(item => {
            const dividingNumber = (item.value >= 0) ? plusSum : minusSum;

            item.addRatio(dividingNumber, 0, 0.5);
        });
    }

    /**
     * Add ratios.
     * @param {number} divNumber dividing number
     * @param {number} subValue subtraction value
     */
    addRatios(divNumber, subValue) {
        this.each(item => {
            if (!item) {
                return;
            }
            item.addRatio(divNumber, subValue);
        });
    }

    /**
     * Whether has range data or not.
     * @returns {boolean}
     */
    hasRangeData() {
        let hasRangeData = false;

        this.each(seriesItem => {
            hasRangeData = seriesItem && seriesItem.isRange;

            return !hasRangeData;
        });

        return hasRangeData;
    }

    /**
     * Traverse items, and executes iteratee function.
     * @param {function} iteratee - iteratee function
     */
    each(iteratee) {
        this.items.forEach(iteratee);
    }

    /**
     * Traverse items, and returns to results of execution about iteratee function.
     * @param {function} iteratee - iteratee function
     * @returns {Array}
     */
    map(iteratee) {
        return this.items.map(iteratee);
    }

    /**
     * Traverse items, and returns to picked result at item.
     * @param {string} key key for pick
     * @returns {Array}
     */
    pluck(key) {
        const items = this.items.filter(snippet.isExisty);

        return snippet.pluck(items, key);
    }

    /**
     * Traverse items, and returns to found SeriesItem by condition function.
     * @param {function} condition - condition function
     * @returns {SeriesItem|null}
     */
    find(condition) {
        let foundItem;

        this.each(seriesItem => {
            if (condition(seriesItem)) {
                foundItem = seriesItem;
            }

            return !foundItem;
        });

        return foundItem || null;
    }

    /**
     * Traverse items, and returns to filter SeriesItems by condition function.
     * @param {function} condition - condition function
     * @returns {Array}
     */
    filter(condition) {
        return this.items.filter(condition);
    }
}

export default SeriesGroup;
