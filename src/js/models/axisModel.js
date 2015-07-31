/**
 * @fileoverview AxisModel is model for management of axis data.
 *               Axis data used to draw the axis area.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Model = require('./model.js');

var AXIS_TYPE_VALUE = 'value',
    AXIS_TYPE_LABEL = 'label',
    DEFAULT_TICK_COUNT = 5,
    MIN_PIXEL_STEP_SIZE = 40,
    MAX_PIXEL_STEP_SIZE = 60,
    CHART_TITLE_HEIGHT = 80,
    VERTICAL_AXIS_WIDTH = 90,
    LEGEND_WIDTH = 90;

var apc = Array.prototype.concat,
    AxisModel;

AxisModel = ne.util.defineClass(Model, /** @lends AxisModel.prototype */ {
    /**
     * AxisModel is model for management of axis data.
     * Axis data used to draw the axis area.
     * @constructs AxisModel
     * @extends Model
     * @param {{labels:array.<string>, values: array.<array.<number>>}} data labels or values
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
         * @type {string[]}
         */
        this.labels = [];

        /**
         * Axis tick count
         * @type {number}
         */
        this.tickCount = DEFAULT_TICK_COUNT;

        /**
         * Axis tick scale
         * @type {{min: number, max: number}}
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
     * @param {{labels:array.<string>, values: array.<array.<number>>}} data labels or values
     * @private
     */
    _setData: function(data) {
        this.isVertical = data.isVertical;
        if (data.labels) {
            this._setLabelAxisData(data.labels);
        } else if (data.values) {
            this._setValueAxisData(data.values, data.chartDimension, data.formatFns);
        }
    },

    /**
     * Set label type axis data.
     * @param {string[]} labels labels
     * @private
     */
    _setLabelAxisData: function(labels) {
        this.axisType = AXIS_TYPE_LABEL;
        this.labels = labels;
        this.tickCount = labels.length + 1;
    },

    /**
     * Set value type axis data.
     * @param {array.<array.<number>>} groupValues chart values
     * @param {object} chartDimension chart dimension
     * @param {array.<function>} formatFns format functions
     * @private
     */
    _setValueAxisData: function(groupValues, chartDimension, formatFns) {
        var options = this.options,
            values = apc.apply([], groupValues), // flatten array
            min = ne.util.min(values),
            max = ne.util.max(values),
            tickInfo = this._getTickInfo(min, max, chartDimension, options.min),
            step = this.getScaleStep(tickInfo.scale, tickInfo.tickCount),
            scale, labels;

        tickInfo = this._correctTickInfo(max, tickInfo, step);

        scale = tickInfo.scale;
        this.tickCount = tickInfo.tickCount;

        labels = ne.util.range(scale.min, scale.max, step);
        labels.push(scale.max);
        labels = this._formatLabels(labels, formatFns);
        this.axisType = AXIS_TYPE_VALUE;
        this.labels = labels;
        this.scale = scale;
    },

    /**
     * Correct tick info.
     * @param {number} userMax user max
     * @param {{tickCount: number, scale: object}} tickInfo tick info
     * @param {number} step step
     * @returns {{tickCount: number, scale: object}} tick info
     * @private
     */
    _correctTickInfo: function(userMax, tickInfo, step) {
        var ticks = ne.util.range(1, tickInfo.tickCount),
            tickMax = tickInfo.scale.max;

        ne.util.forEachArray(ticks, function(tickIndex) {
            var curMax = tickMax - (step * tickIndex);
            if (userMax >= curMax) {
                return false;
            }
            tickInfo.tickCount -= 1;
            tickInfo.scale.max = curMax;
        });

        return tickInfo;
    },

    /**
     * Get base size for get candidate tick counts.
     * @param {{width: number, height: number}} dimension chat dimension
     * @returns {number} base size
     * @private
     */
    _getBaseSize: function(dimension) {
        var baseSize;
        if (this.isVertical) {
            baseSize = dimension.height - CHART_TITLE_HEIGHT;
        } else {
            baseSize = dimension.width - VERTICAL_AXIS_WIDTH - LEGEND_WIDTH;
        }
        return baseSize;
    },

    /**
     * Get candidate tick counts.
     * @param {number} baseSize base size
     * @returns {array.<number>} tick counts
     * @private
     */
    _getCandidateTickCounts: function(baseSize) {
        var start = parseInt(baseSize / MAX_PIXEL_STEP_SIZE, 10),
            end = parseInt(baseSize / MIN_PIXEL_STEP_SIZE, 10) + 1,
            tickCounts = ne.util.range(start, end);
        return tickCounts;
    },

    /**
     * Get comparing value.
     * @param {{min: number, max: number}} scale scale
     * @param {number} min minimum value of user data
     * @param {number} max maximum value of user data
     * @returns {number} comparing value
     * @private
     */
    _getComparingValue: function(scale, min, max) {
        var diffMax = scale.max - max,
            diffMin = min - scale.min,
            diffMinMax = Math.abs(diffMax - diffMin);
        return diffMax + diffMin + diffMinMax;
    },

    /**
     * Get tick count and scale.
     * @param {number} min minimum value of user data
     * @param {number} max maximum value of user data
     * @param {{width: number, height: number}} chartDimension chat dimension
     * @param {number} optionMin option.min
     * @returns {{tickCount: number, scale: object}} tick info
     * @private
     */
    _getTickInfo: function(min, max, chartDimension, optionMin) {
        var baseSize = this._getBaseSize(chartDimension),
            tickCounts = this._getCandidateTickCounts(baseSize),
            candidates = ne.util.map(tickCounts, function(tickCount) {
                var scale = this._calculateScale(min, max, tickCount, optionMin);
                return {tickCount: tickCount, scale: scale};
            }, this),
            result = candidates[0],
            rest = candidates.slice(1),
            minValue = this._getComparingValue(result.scale, min, max);

        ne.util.forEachArray(rest, function(info) {
            var compareValue = this._getComparingValue(info.scale, min, max);
            if (minValue > compareValue) {
                result = info;
                minValue = compareValue;
            }
        }, this);
        return result;
    },

    /**
     * Multiple scale.
     * @param {{min: number, max: number}} scale scale
     * @param {number} num multiple number
     * @returns {{max: number, min: number}} scale
     * @private
     */
    _multipleScale: function(scale, num) {
        return {
            max: scale.max * num,
            min: scale.min * num
        };
    },

    /**
     * Divide scale
     * @param {{min: number, max: number}} scale scale
     * @param {number} num divide number
     * @returns {{max: number, min: number}} scale
     * @private
     */
    _divideScale: function(scale, num) {
        return {
            max: scale.max / num,
            min: scale.min / num
        };
    },

    /**
     * Correct scale.
     * @param {{min: number, max: number}} scale scale
     * @param {number} tickCount tick count
     * @returns {{max: number, min: number}} scale
     * @private
     */
    _correctScale: function(scale, tickCount) {
        var max = scale.max,
            min = scale.min,
            divideCount = tickCount - 1,
            modNumber = divideCount * 5,
            diff, addMax, newScale;
        if (max < 1) {
            newScale = this._correctScale(this._multipleScale(scale, 10), tickCount);
            scale = this._divideScale(newScale, 10);

            return scale;
        }

        if (max < modNumber) {
            scale.min = parseInt(scale.min, 10);
        } else if (max >= modNumber && min % 5 > 0) {
            scale.min = ne.util.max([min - (min % 5), 0]);
        }

        diff = max - scale.min;
        if (max < modNumber) {
            addMax = diff === 0 ? 0 : divideCount - (diff % divideCount);
        } else {
            addMax = diff === 0 ? 0 : modNumber - (diff % modNumber);
        }

        scale.max = scale.max + addMax;

        return scale;
    },

    /**
     * Calculate scale from chart min, max data.
     * http://peltiertech.com/how-excel-calculates-automatic-chart-axis-limits/
     * @param {number} min min chart min value
     * @param {number} max max chart max value
     * @param {number} tickCount tick count
     * @param {number} minValue optional min value
     * @returns {{min: number, max: number}} scale axis scale
     * @private
     */
    _calculateScale: function(min, max, tickCount, minValue) {
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

        scale = this._correctScale(scale, tickCount, min, max);
        return scale;
    },

    /**
     * Format labels.
     * @param {string[]} labels labels
     * @param {function[]} formatFns format functions
     * @returns {string[]} labels
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
     * @returns {string[]} labels
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