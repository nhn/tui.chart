/**
 * @fileoverview SeriesItem is a element of SeriesGroup.items.
 * SeriesItem has processed terminal data like value, ratio, etc.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    renderUtil = require('../helpers/renderUtil');

var SeriesItem = tui.util.defineClass(/** @lends SeriesItem.prototype */{
    /**
     * SeriesItem is a element of SeriesGroup.items.
     * SeriesItem has processed terminal data like value, ratio, etc.
     * @constructs SeriesItem
     * @param {number} value - value
     * @param {?string} stack - stack
     * @param {?Array.<function>} formatFunctions - format functions
     */
    init: function(value, stack, formatFunctions) {
        /**
         * for group stack option.
         * @type {string}
         */
        this.stack = stack || chartConst.DEFAULT_STACK;

        /**
         * format functions
         * @type {Array.<function>}
         */
        this.formatFunctions = formatFunctions;

        /**
         * whether range item or not
         * @type {boolean}
         */
        this.isRange = false;

        /**
         * value of item
         * @type {number}
         */
        this.value = null;

        /**
         * label
         * @type {string}
         */
        this.label = null;

        /**
         * ratio of value about distance of limit
         * @type {number}
         */
        this.ratio = null;

        /**
         * end value of item.
         * @type {number}
         */
        this.end = null;

        /**
         * end label
         * @type {number}
         */
        this.endLabel = null;

        /**
         * ratio of end value
         * @type {number}
         */
        this.endRatio = null;

        /**
         * start value of item.
         * @type {number}
         */
        this.start = null;

        /**
         * start label
         * @type {number}
         */
        this.startLabel = null;

        /**
         * ratio of start value
         * @type {number}
         */
        this.startRatio = null;

        /**
         * distance of start ratio and end ratio
         * @type {null}
         */
        this.ratioDistance = null;

        this._initValues(value);
    },

    /**
     * Initialize values of item.
     * @param {number} value - value
     * @private
     */
    _initValues: function(value) {
        var values = this._createValues(value),
            hasStart = values.length > 1;

        this.value = this.end = values[0];
        this.label = this.endLabel = renderUtil.formatValue(this.value, this.formatFunctions);

        if (hasStart) {
            this.addStart(values[1], true);
            this._updateFormattedValueforRange();
            this.isRange = true;
        }
    },

    /**
     * Crete sorted values.
     * @param {Array.<number>|number} value value
     * @returns {Array.<number>}
     * @private
     */
    _createValues: function(value) {
        var values = tui.util.map([].concat(value), parseFloat);

        values = values.sort(function(a, b) {
            if (a < 0 && b < 0) {
                return a - b;
            }

            return b - a;
        });

        return values;
    },

    /**
     * Add start.
     * @param {number} value - value
     * @private
     */
    addStart: function(value) {
        if (!tui.util.isNull(this.start)) {
            return;
        }

        this.start = value;
        this.startLabel = renderUtil.formatValue(value, this.formatFunctions);
    },

    /**
     * Update formatted value for range.
     * @private
     */
    _updateFormattedValueforRange: function() {
        this.label = this.startLabel + ' ~ ' + this.endLabel;
    },

    /**
     * Calculate ratio for making bound.
     * @param {number} value - value
     * @param {number} divNumber - number for division
     * @param {number} subNumber - number for subtraction
     * @param {number} baseRatio - base ratio
     * @returns {number}
     * @private
     */
    _calculateRatio: function(value, divNumber, subNumber, baseRatio) {
        return ((value - subNumber) / divNumber) * baseRatio;
    },

    /**
     * Add ratio.
     * @param {number} divNumber - number for division
     * @param {?number} subNumber - number for subtraction
     * @param {?number} baseRatio - base ratio
     */
    addRatio: function(divNumber, subNumber, baseRatio) {
        divNumber = divNumber || 1;
        baseRatio = baseRatio || 1;
        subNumber = subNumber || 0;

        this.ratio = this.endRatio = this._calculateRatio(this.value, divNumber, subNumber, baseRatio);

        if (!tui.util.isNull(this.start)) {
            this.startRatio = this._calculateRatio(this.start, divNumber, subNumber, baseRatio);
            this.ratioDistance = Math.abs(this.endRatio - this.startRatio);
        }
    }
});

module.exports = SeriesItem;
