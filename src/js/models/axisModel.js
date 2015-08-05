/**
 * @fileoverview AxisModel is model for management of axis data.
 *               Axis data used for draw the axis area.
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
     * Axis data used for draw the axis area.
     * @constructs AxisModel
     * @extends Model
     * @param {{labels:array.<string>, values: array.<array.<number>>}} data labels or values
     * @param {{title: string, min: number}} options axis options
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
         * Whether vertical or not.
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
            this._setValueAxisData(data.values, data.chartDimension, data.formatFunctions);
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
     * @param {{width:number, height:number}} chartDimension chart dimension
     * @param {array.<function>} formatFunctions format functions
     * @private
     */
    _setValueAxisData: function(groupValues, chartDimension, formatFunctions) {
        var options = this.options,
            values = apc.apply([], groupValues), // flatten array
            min = ne.util.min(values),
            max = ne.util.max(values),
            tickInfo = this._getTickInfo(min, max, chartDimension, options.min);

        this.tickCount = tickInfo.tickCount;
        this.labels = this._formatLabels(tickInfo.labels, formatFunctions);
        this.scale = tickInfo.scale;
        this.axisType = AXIS_TYPE_VALUE;
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
     * Correct tick info.
     * @param {number} userMin user min
     * @param {number} userMax user max
     * @param {{tickCount: number, scale: object}} tickInfo tick info
     * @param {number} step step of increase axis
     * @param {number} optionMin option min
     * @returns {{tickCount: number, scale: object, labels: array}} corrected tick info
     * @private
     */
    _correctTickInfo: function(userMin, userMax, tickInfo, step, optionMin) {
        var ticks = ne.util.range(1, tickInfo.tickCount),
            tickMax = tickInfo.scale.max,
            tickMin = tickInfo.scale.min,
            scale;

        ne.util.forEachArray(ticks, function(tickIndex) {
            var curMax = tickMax - (step * tickIndex),
                curMin = tickMin + (step * tickIndex);

            if (userMax >= curMax && userMin <= curMin) {
                return false;
            }

            if (userMax < curMax) {
                tickInfo.scale.max = curMax;
            }

            if (ne.util.isUndefined(optionMin) && userMin > curMin) {
                tickInfo.scale.min = curMin;
            }
        });

        scale = tickInfo.scale;
        tickInfo.labels = ne.util.range(scale.min, scale.max + step, step);
        tickInfo.scale.max = tickInfo.labels[tickInfo.labels.length - 1];
        tickInfo.tickCount = tickInfo.labels.length;

        return tickInfo;
    },

    /**
     * Get candidates about tick info.
     * @param {number} min minimum value of user data
     * @param {number} max maximum value of user data
     * @param {array.<number>} tickCounts tick counts
     * @param {number} optionMin optional min value
     * @returns {array} candidates about tick info
     * @private
     */
    _getTickInfoCandidates: function(min, max, tickCounts, optionMin) {
        var isMinus = false,
            tmp, candidates;

        if (min < 0 && max <= 0) {
            isMinus = true;
            tmp = min;
            min = -max;
            max = -tmp;
        }

        candidates = ne.util.map(tickCounts, function(tickCount) {
            var scale = this._calculateScale(min, max, tickCount, optionMin),
                step = this.getScaleStep(scale, tickCount),
                tickInfo;

            if (isMinus) {
                tmp = scale.min;
                scale.min = -scale.max;
                scale.max = -tmp;
            } else if (min < 0) {
                scale.max += (step - (Math.abs(scale.max) % step));
                scale.min -= (step + (scale.min % step));
                tickCount += 1;
            }
            tickInfo = {tickCount: tickCount, scale: scale, step: step};
            tickInfo = this._correctTickInfo(min, max, tickInfo, step, optionMin);
            return tickInfo;
        }, this);

        return candidates;
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
        var diffMax = Math.abs(scale.max - max),
            diffMin = Math.abs(min - scale.min),
            diffMinMax = Math.abs(diffMax - diffMin);
        return diffMax + diffMin + diffMinMax;
    },

    /**
     * Select tick info.
     * @param {number} min minimum value of user data
     * @param {number} max maximum value of user data
     * @param {array.<object>} candidates tick info candidates
     * @returns {{scale: {min: number, max: number}, tickCount: number, step: number, labels: array.<number>}} selected tick info
     * @private
     */
    _selectTickInfo: function(min, max, candidates) {
        var tickInfo = candidates[0],
            rest = candidates.slice(1),
            minValue = this._getComparingValue(tickInfo.scale, min, max);

        ne.util.forEachArray(rest, function(info) {
            var compareValue = this._getComparingValue(info.scale, min, max);
            if (minValue > compareValue) {
                tickInfo = info;
                minValue = compareValue;
            }
        }, this);

        return tickInfo;
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
            candidates = this._getTickInfoCandidates(min, max, tickCounts, optionMin),
            tickInfo = this._selectTickInfo(min, max, candidates);
        return tickInfo;
    },

    /**
     * Multiple scale.
     * @param {{min: number, max: number}} scale target scale
     * @param {number} num multiple number
     * @returns {{max: number, min: number}} multiplied scale
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
     * @param {{min: number, max: number}} scale target scale
     * @param {number} num divide number
     * @returns {{max: number, min: number}} divided scale
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
     * @param {{min: number, max: number}} scale target scale
     * @param {number} tickCount tick count
     * @param {number} userMin minimum value of user data
     * @param {number} userMax maximum value of user data
     * @returns {{max: number, min: number}} corrected scale
     * @private
     */
    _correctScale: function(scale, tickCount, userMin, userMax) {
        var max = scale.max,
            min = scale.min,
            baseMax = ne.util.max([Math.abs(min), Math.abs(max)]),
            divideCount = tickCount - 1,
            modNumber = divideCount * 5,
            diff, addMax, newScale;
        if (baseMax < 1) {
            newScale = this._correctScale(this._multipleScale(scale, 10), tickCount, userMin, userMax);
            scale = this._divideScale(newScale, 10);
            return scale;
        }
        if (baseMax < modNumber) {
            if (min % 1 === 0) {
                min += min < 0 ? 0.1 : -0.1;
            }
            scale.min = Math.floor(min);
        } else if (baseMax >= modNumber) {
            if (userMin <= 0 && min % 5 === 0) {
                scale.min -= 5;
            } else {
                scale.min = min - (min % 5);
            }
        }
        diff = max - scale.min;
        if (baseMax < modNumber) {
            addMax = diff === 0 ? 0 : divideCount - (diff % divideCount);
        } else {
            addMax = diff === 0 ? 0 : modNumber - (diff % modNumber);
        }

        scale.max = scale.max + addMax;
        return scale;
    },

    /**
     * Calculate scale from chart min, max data.
     * @param {number} min min minimum value of user data
     * @param {number} max max maximum value of user data
     * @param {number} tickCount tick count
     * @param {number} optionMin optional min value
     * @returns {{min: number, max: number}} scale axis scale
     * @private
     */
    _calculateScale: function(min, max, tickCount, optionMin) {
        var userMin = min,
            userMax = max,
            saveMin = 0,
            scale = {},
            iodValue; // increase or decrease value;

        if (min < 0) {
            saveMin = min;
            max -= min;
            min = 0;
        }

        iodValue = (max - min) / 20;
        scale.max = max + iodValue;

        if (!ne.util.isUndefined(optionMin)) {
            if (optionMin > min) {
                throw new Error('Option minValue can not be smaller than min.');
            }
            scale.min = optionMin;
        } else if (max / 6 > min) {
            scale.min = 0;
        } else {
            scale.min = min - iodValue;
        }

        scale = this._correctScale(scale, tickCount, userMin, userMax);

        scale.max += saveMin;
        scale.min += saveMin;

        return scale;
    },

    /**
     * Format labels.
     * @param {string[]} labels target labels
     * @param {function[]} formatFunctions format functions
     * @returns {string[]} formatted labels
     * @private
     */
    _formatLabels: function(labels, formatFunctions) {
        var result;
        if (!formatFunctions || !formatFunctions.length) {
            return labels;
        }
        result = ne.util.map(labels, function(label) {
            var fns = apc.apply([label], formatFunctions);
            return ne.util.reduce(fns, function(stored, fn) {
                return fn(stored);
            });
        });
        return result;
    },

    /**
     * To make labels from scale.
     * @param {{min: number, max: number}} scale axis scale
     * @param {number} step step between max and min
     * @returns {string[]} labels
     * @private
     */
    _makeLabelsFromScale: function(scale, step) {
        var labels = ne.util.range(scale.min, scale.max + 1, step);
        return labels;
    },

    /**
     * Whether label axis or not.
     * @returns {boolean} result boolean
     */
    isLabelAxis: function() {
        return this.axisType === AXIS_TYPE_LABEL;
    },

    /**
     * Whether value axis or not.
     * @returns {boolean} result boolean
     */
    isValueAxis: function() {
        return this.axisType === AXIS_TYPE_VALUE;
    },

    /**
     * Change vertical state
     * @param {boolean} isVertical whether vertical or not
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