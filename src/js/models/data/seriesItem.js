/**
 * @fileoverview SeriesItem is a element of SeriesGroup.items.
 * SeriesItem has processed terminal data like value, ratio, etc.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../../const');
var renderUtil = require('../../helpers/renderUtil');
var calculator = require('../../helpers/calculator');
var predicate = require('../../helpers/predicate');
var snippet = require('tui-code-snippet');

var SeriesItem = snippet.defineClass(/** @lends SeriesItem.prototype */{
    /**
     * SeriesItem is a element of SeriesGroup.items.
     * SeriesItem has processed terminal data like value, ratio, etc.
     * @constructs SeriesItem
     * @private
     * @param {object} params - parameters
     *      @param {number} params.datum - value
     *      @param {string} params.chartType - type of chart
     *      @param {?Array.<function>} params.formatFunctions - format functions
     *      @param {number} params.index - raw data index
     *      @param {?string} params.stack - stack
     */
    init: function(params) {
        /**
         * type of chart
         * @type {string}
         */
        this.chartType = params.chartType;

        /**
         * for group stack option.
         * @type {string}
         */
        this.stack = params.stack || chartConst.DEFAULT_STACK;

        /**
         * whether diverging chart or not
         * @type {boolean}
         */
        this.isDivergingChart = params.isDivergingChart;

        /**
         * format functions
         * @type {Array.<function>}
         */
        this.formatFunctions = params.formatFunctions;

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

        if (predicate.isBulletChart(this.chartType)) {
            /**
             * @type {string}
             */
            this.type = params.type;
        }

        /**
         * series legend name
         * @type {string}
         */
        this.legendName = params.legendName;

        this._initValues(params.datum, params.index);
    },

    /**
     * Initialize values of item.
     * @param {number|Array.<number>} rawValue - raw value
     * @param {number} index - raw data index
     * @private
     */
    _initValues: function(rawValue, index) {
        var values = this._createValues(rawValue);
        var areaType = 'makingSeriesLabel';
        var hasStart = values.length > 1;
        var value = values[0];

        this.value = this.end = value;
        this.index = index;

        if (this.isDivergingChart) {
            value = Math.abs(value);
        }

        if (snippet.isNull(value)) {
            this.label = '';
        } else {
            this.label = renderUtil.formatValue({
                value: value,
                formatFunctions: this.formatFunctions,
                chartType: this.chartType,
                areaType: areaType,
                legendName: this.legendName
            });
        }

        this.endLabel = this.label;

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
        var values = snippet.map([].concat(value), function(newValue) {
            return snippet.isNull(newValue) ? null : parseFloat(newValue);
        });

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
     * @ignore
     */
    addStart: function(value) {
        if (!snippet.isNull(this.start)) {
            return;
        }

        this.start = value;
        this.startLabel = renderUtil.formatValue({
            value: value,
            formatFunctions: this.formatFunctions,
            chartType: this.chartType,
            areaType: 'series',
            legendName: this.legendName
        });
    },

    /**
     * Update formatted value for range.
     * @private
     */
    _updateFormattedValueforRange: function() {
        this.label = this.startLabel + ' ~ ' + this.endLabel;
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

        this.ratio = this.endRatio = calculator.calculateRatio(this.value, divNumber, subNumber, baseRatio);

        if (snippet.isExisty(this.start)) {
            this.startRatio = calculator.calculateRatio(this.start, divNumber, subNumber, baseRatio);
            this.ratioDistance = Math.abs(this.endRatio - this.startRatio);
        }
    },

    /**
     * Get formatted value for tooltip.
     * @param {string} valueType - value type
     * @returns {string}
     * @private
     */
    _getFormattedValueForTooltip: function(valueType) {
        return renderUtil.formatValue({
            value: this[valueType],
            formatFunctions: this.formatFunctions,
            chartType: this.chartType,
            areaType: 'tooltip',
            valueType: valueType,
            legendName: this.legendName
        });
    },

    /**
     * Pick value map for tooltip.
     * @returns {{value: number, start: ?number, end: ?number}}
     */
    pickValueMapForTooltip: function() {
        var valueMap = {
            value: this._getFormattedValueForTooltip('value'),
            ratio: this.ratio
        };

        if (snippet.isExisty(this.start)) {
            valueMap.start = this._getFormattedValueForTooltip('start');
            valueMap.end = this._getFormattedValueForTooltip('end');
            valueMap.startRatio = this.startRatio;
            valueMap.endRatio = this.endRatio;
        }

        return valueMap;
    }
});

module.exports = SeriesItem;
