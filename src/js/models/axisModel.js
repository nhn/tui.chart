/**
 * @fileoverview AxisModel is model for management of axis data.
 *               Axis data used to draw the axis area.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var Model = require('./model.js');

var AXIS_TYPE_VALUE = 'value',
    AXIS_TYPE_LABEL = 'label',
    DEFAULT_TICK_COUNT = 5;

var apc = Array.prototype.concat,
    AxisModel;

/**
 * @classdesc AxisModel is model for management of axis data.
 * @class
 * @augments Model
 */
AxisModel = ne.util.defineClass(Model, {
    /**
     * Constructor
     * @param {{label:array, values: [array]}} data labels or values
     * @param {object} options chart options
     */
    init: function(data, options) {
        options = options || {};

        this.options = options;

        /**
         * Axis title
         * @type {string}
         */
        this.title = options.title || '';

        /**
         * Axis labels
         * @type {array}
         */
        this.labels = [];

        /**
         * Axis tick count
         * @type {number}
         */
        this.tickCount = DEFAULT_TICK_COUNT;

        /**
         * Axis tick scale
         * @type {{min: number, max: number}
         */
        this.scale = null;

        /**
         * Axis type
         * @type {string}
         */
        this.axisType = null;

        /**
         * Is vertical?
         * @type {boolean}
         */
        this.isVertical = false;

        if (data) {
            this._setData(data);
        }
    },

    /**
     * Set axis data.
     * @param {{label:array, values: [array]}} data labels or values
     * @private
     */
    _setData: function(data) {
        if (data.labels) {
            this._setLabelAxisData(data.labels);
        } else if (data.values) {
            this._setValueAxisData(data.values, data.formatFns);
        }
    },

    /**
     * Set label type axis data.
     * @param {array} labels labels
     * @private
     */
    _setLabelAxisData: function(labels) {
        this.axisType = AXIS_TYPE_LABEL;
        this.labels = labels;
        this.tickCount = labels.length + 1;
    },

    /**
     * Set value type axis data.
     * @param {array.array} groupValues chart values
     * @private
     */
    _setValueAxisData: function(groupValues, formatFns) {
        var options = this.options,
            values = apc.apply([], groupValues), // flatten array
            min = ne.util.min(values),
            max = ne.util.max(values),
            scale = this._calculateScale(min, max, options.min),
            step = this.getScaleStep(scale, this.tickCount),
            labels = ne.util.range(scale.min, scale.max + 1, step);

        labels = this._formatLabels(labels, formatFns);
        this.axisType = AXIS_TYPE_VALUE;
        this.labels = labels;
        this.scale = scale;
    },

    /**
     * Calculate scale from chart min, max data.
     * http://peltiertech.com/how-excel-calculates-automatic-chart-axis-limits/
     * @param {number} min min chart min value
     * @param {number} max max chart max value
     * @param {number} minValue optional min value
     * @returns {{min: number, max: number}} scale axis scale
     * @private
     */
    _calculateScale: function(min, max, minValue) {
        var scale = {},
            iodValue = (max - min) / 20; // increase or decrease the value;
        scale.max = max + iodValue;

        if (!ne.util.isUndefined(minValue)) {
            if (minValue > min) {
                throw new Error('Option minValue can not be smaller than min.');
            }
            scale.min = minValue;
        } else if (max / 6 > min) {
            scale.min = 0;
        } else {
            scale.min = min - iodValue;
        }

        return scale;
    },

    /**
     * Format labels.
     * @param {array} labels labels
     * @param {array} formatFns format functions
     * @returns {array} labels
     * @private
     */
    _formatLabels: function(labels, formatFns) {
        var result = ne.util.map(labels, function(label) {
            var fns = apc.apply([label], formatFns);
            return ne.util.reduce(fns, function(stored, fn) {
                return fn(stored);
            });
        });
        return result;
    },

    /**
     * Make labels from scale.
     * @param {object} scale axis scale
     * @param {number} step step between max and min
     * @returns {array} labels
     * @private
     */
    _makeLabelsFromScale: function(scale, step) {
        var labels = ne.util.range(scale.min, scale.max + 1, step);
        return labels;
    },

    /**
     * Is label axis?
     * @returns {boolean} label axised
     */
    isLabelAxis: function() {
        return this.axisType === AXIS_TYPE_LABEL;
    },

    /**
     * Is value axis?
     * @returns {boolean} value axised
     */
    isValueAxis: function() {
        return this.axisType === AXIS_TYPE_VALUE;
    },

    /**
     * Change vertical state
     * @param {boolean} isVertical is vertical
     */
    changeVerticalState: function(isVertical) {
        this.isVertical = isVertical;
    },

    /**
     * Get valid tick count
     * @returns {number} tick count
     */
    getValidTickCount: function() {
        var validTickCount = this.isValueAxis() ? this.tickCount : 0;
        return validTickCount;
    }
});

module.exports = AxisModel;