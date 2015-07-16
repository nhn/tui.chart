/**
 * @fileoverview AxisModel is model for management of axis data.
 *               Axis data used to draw the axis area.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var Model = require('./model.js'),
    chartConst = require('../const.js');

var apc = Array.prototype.concat,
    AXIS_TYPE_VALUE = 'value',
    AXIS_TYPE_LABEL = 'label',
    AxisModel;

/**
 * @classdesc AxisModel is model for management of axis data.
 * @class
 * @augments Model
 */
AxisModel = ne.util.defineClass(Model, {
    /**
     * Constructor
     * @param {{label:array, values: [array, ...]} data labels or values
     * @param {object} options chart options
     */
    init: function(data, options) {
        options = options || {};
        /**
         * Axis options
         * @type {object}
         */
        this.options = options || {};

        /**
         * Axis title
         * @type {string}
         */
        this.title = '';

        /**
         * title font size
         * @type {number}
         */
        this.titleFontSize = options.titleFontSize || chartConst.DEFAULT_AXIS_TITLE_FONT_SIZE;

        /**
         * Axis labels
         * @type {array}
         */
        this.labels = [];

        /**
         * label font size
         * @type {number}
         */
        this.labelFontSize = options.fontSize || chartConst.DEFAULT_LABEL_FONT_SIZE

        /**
         * Axis tick count
         * @type {number}
         */
        this.tickCount = 5;

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
     * @param {{label:array, values: [array, ...]} data labels or values
     * @private
     */
    _setData: function(data) {
        if (data.labels) {
            this._setLabelAxisData(data.labels);
        } else if (data.values) {
            this._setValueAxisData(data.values);
        }
    },

    /**
     * Set label type axis data.
     * @param {array} labels labels
     * @private
     */
    _setLabelAxisData: function(labels) {
        var options = this.options;

        this.title = options.title || this.title;
        this.axisType = AXIS_TYPE_LABEL;
        this.labels = labels;
        this.tickCount = labels.length + 1;
    },

    /**
     * Set value type axis data.
     * @param {[array, ...]} arr2d chart values
     * @private
     */
    _setValueAxisData: function(arr2d) {
        var options = this.options,
            arr = apc.apply([], arr2d), // flatten array
            minMax = this._pickMinMax(arr),
            scale = this._calculateScale(minMax.min, minMax.max, options.minValue),
            step = this.getScaleStep(scale, this.tickCount),
            formats = options.format ? [options.format] : arr,
            lenUnderPoint = this._pickMaxLenUnderPoint(formats),
            labels = ne.util.range(scale.min, scale.max + 1, step);

        labels = this._formatLabels(labels, lenUnderPoint);
        this.title = options.title || this.title;
        this.axisType = AXIS_TYPE_VALUE;
        this.labels = labels;
        this.scale = scale;
    },

    /**
     * Pick min and max from chart values
     * @param {[array, ...]} arr2d chart values
     * @returns {{min: number, max: number}}
     * @private
     */
    _pickMinMax: function(arr) {
        arr.sort(function(a, b) {
            return a - b;
        });

        return {min: arr[0], max: arr[arr.length - 1]};
    },

    /**
     * Calculate scale from chart min, max data.
     * http://peltiertech.com/how-excel-calculates-automatic-chart-axis-limits/
     * @param {number} min min chart min value
     * @param {number} max max cahrt max value
     * @params {minValue} optional min value
     * @returns {{min: number, max: number}}
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
            scale.min  = 0;
        } else {
            scale.min = min - iodValue;
        }

        return scale;
    },

    /**
     * Pick max length under point.
     * @param {array} arr chart values
     * @returns {number}
     * @private
     */
    _pickMaxLenUnderPoint: function(arr) {
        var max = 0;

        ne.util.forEachArray(arr, function(value) {
            var valueArr =  (value + '').split('.');
            if (valueArr.length === 2 && valueArr[1].length > max) {
                max = valueArr[1].length;
            }
        });

        return max;
    },

    /**
     * Format labels.
     * @param {array} arr labels
     * @param {number} len length under point
     * @returns {Array}
     * @private
     */
    _formatLabels: function(arr, len) {
        var format, result;
        if (len === 0) {
            format = function(value) {
                return parseInt(value, 10);
            }
        } else {
            format = function(value) {
                return parseFloat(parseFloat(value).toFixed(len));
            };
        }
        result = ne.util.map(arr, format);
        return result;
    },

    /**
     * Make labels from scale.
     * @param {object} scale axis scale
     * @param {number} step step between max and min
     * @returns {array}
     * @private
     */
    _makeLabelsFromScale: function(scale, step) {
        var labels = ne.util.range(scale.min, scale.max + 1, step);
        return labels;
    },

    /**
     * Is label axis?
     * @returns {boolean}
     */
    isLabelAxis: function() {
        return this.axisType === AXIS_TYPE_LABEL;
    },

    /**
     * Is value axis?
     * @returns {boolean}
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
     * @returns {number}
     */
    getValidTickCount: function() {
        var validTickCount = this.isValueAxis() ? this.tickCount : 0;
        return validTickCount;
    }
});

module.exports = AxisModel;