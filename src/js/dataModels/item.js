/**
 * @fileoverview Item.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    renderUtil = require('../helpers/renderUtil');

var Item = tui.util.defineClass(/** @lends Item.prototype */{
    /**
     * Item.
     * @constructs Item
     * @param {number} value - value
     * @param {?string} stack - stack
     * @param {?Array.<function>} formatFunctions - format functions
     */
    init: function(value, stack, formatFunctions) {
        /**
         * stack
         * @type {string}
         */
        this.stack = stack || chartConst.DEFAULT_STACK;

        /**
         * format functions
         * @type {Array.<function>}
         */
        this.formatFunctions = formatFunctions;

        this._setData(value, stack, formatFunctions);
    },

    /**
     * Set data of item.
     * @param {number} value - value
     * @param {?string} stack - stack
     * @param {?Array.<function>} formatFunctions - format functions
     * @private
     */
    _setData: function(value, stack, formatFunctions) {
        var values = this._createValues(value);

        /**
         * whether has start or not.
         * @type {boolean}
         */
        this.hasStart = values.length > 1;

        /**
         * value of item
         * @type {number}
         */
        this.value = this.end = values[0];

        /**
         * formatted value
         * @type {string}
         */
        this.formattedValue = this.formattedEnd = renderUtil.formatValue(this.value, formatFunctions);

        if (this.hasStart) {
            this._updateStart(values[1]);
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
            return b - a;
        });

        return values;
    },

    /**
     * Update start.
     * @param {number} value - value
     * @private
     */
    _updateStart: function(value) {
        this.start = value;
        this.formattedStart = renderUtil.formatValue(value, this.formatFunctions);
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
     * @param {number} subNumber - number for subtraction
     * @param {number} baseRatio - base ratio
     */
    addRatio: function(divNumber, subNumber, baseRatio) {
        divNumber = divNumber || 1;
        baseRatio = baseRatio || 1;
        subNumber = subNumber || 0;

        this.ratio = this.endRatio = this._calculateRatio(this.value, divNumber, subNumber, baseRatio);

        if (this.hasStart) {
            this.startRatio = this._calculateRatio(this.start, divNumber, subNumber, baseRatio);
        }
    }
});

module.exports = Item;
