/**
 * @fileoverview AxisModel is model for management of axis data.
 *               Axis data used for draw the axis area.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Model = require('./model.js'),
    chartConst = require('../const.js');

var AXIS_TYPE_VALUE = 'value',
    AXIS_TYPE_LABEL = 'label',
    DEFAULT_TICK_COUNT = 5,
    MIN_PIXEL_STEP_SIZE = 40,
    MAX_PIXEL_STEP_SIZE = 60,
    CHART_TITLE_HEIGHT = 80,
    VERTICAL_AXIS_WIDTH = 90,
    LEGEND_WIDTH = 90,
    AXIS_STANDARD_MULTIPLE_NUMS = [1, 2, 5, 10],
    PERCENT_STACKED_TICK_INFO = {
        scale: {
            min: 0,
            max: 100
        },
        tickCount: 5,
        labels: [0, 25, 50, 75, 100]
    };

var apc = Array.prototype.concat,
    abs = Math.abs,
    AxisModel;

AxisModel = ne.util.defineClass(Model, /** @lends AxisModel.prototype */ {
    /**
     * AxisModel is model for management of axis data.
     * Axis data used for draw the axis area.
     * @constructs AxisModel
     * @extends Model
     * @param {{labels:array.<string>, values: array.<array.<number>>}} data labels or values
     * @param {{title: string, min: number, max: number}} options axis options
     */
    init: function(data, options) {
        options = options || {};

        /**
         * Axis options
         * @type {{title: string, min: number, max: number}}
         */
        this.options = options;

        /**
         * Chart type
         * @type {string}
         */
        this.chartType = '';

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
     * @param {object} data axis setting data.
     *      @param {array.<array.<number>>} data.groupValues chart values
     *      @param {array.<string>} data.labels chart labels
     *      @param {{width:number, height:number}} data.chartDimension chart dimension
     *      @param {array.<function>} data.formatFunctions format functions
     *      @param {string} data.stacked stacked option
     * @private
     */
    _setData: function(data) {
        this.isVertical = data.isVertical;
        this.chartType = data.chartType;
        if (data.labels) {
            this._setLabelAxisData(data.labels);
        } else if (data.values) {
            this._setValueAxisData(data);
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
     * @param {object} data axis setting data.
     *      @param {array.<array.<number>>} data.groupValues chart values
     *      @param {{width:number, height:number}} data.chartDimension chart dimension
     *      @param {array.<function>} data.formatFunctions format functions
     *      @param {string} data.stacked stacked option
     * @private
     */
    _setValueAxisData: function(data) {
        var options = this.options,
            values, min, max, tickInfo;

        if (data.stacked === 'percent') {
            tickInfo = PERCENT_STACKED_TICK_INFO;
            data.formatFunctions = [];
        } else {
            values = this._makeValues(data.values, data.stacked);
            min = ne.util.min(values);
            max = ne.util.max(values);
            tickInfo = this._getTickInfo({
                min: min,
                max: max,
                chartDimension: data.chartDimension
            }, options);
        }

        this.tickCount = tickInfo.tickCount;
        this.labels = this._formatLabels(tickInfo.labels, data.formatFunctions);
        this.scale = tickInfo.scale;
        this.axisType = AXIS_TYPE_VALUE;
    },

    /**
     * To make values.
     * @param {array.<number>} groupValues group values
     * @param {boolean} stacked whether stacked or not.
     * @returns {array.<number>} values
     * @private
     */
    _makeValues: function(groupValues, stacked) {
        var flattenValues = apc.apply([], groupValues); // flatten array
        if (stacked === chartConst.STACKED_NORMAL_TYPE) {
            flattenValues = flattenValues.concat(ne.util.map(groupValues, function(values) {
                var plusValues = ne.util.filter(values, function(value) {
                    return value > 0;
                });
                return ne.util.sum(plusValues);
            }));
        }
        return flattenValues;
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
     * @param {{width: number, height: number}} chartDimension chat dimension
     * @returns {array.<number>} tick counts
     * @private
     */
    _getCandidateTickCounts: function(chartDimension) {
        var baseSize = this._getBaseSize(chartDimension),
            start = parseInt(baseSize / MAX_PIXEL_STEP_SIZE, 10),
            end = parseInt(baseSize / MIN_PIXEL_STEP_SIZE, 10) + 1,
            tickCounts = ne.util.range(start, end);
        return tickCounts;
    },

    /**
     * Get comparing value.
     * @param {{scale: {min: number, max: number}, step: number}} tickInfo tick info
     * @param {number} min minimum value of user data
     * @param {number} max maximum value of user data
     * @returns {number} comparing value
     * @private
     */
    _getComparingValue: function(tickInfo, min, max) {
        var diffMax = abs(tickInfo.scale.max - max),
            diffMin = abs(min - tickInfo.scale.min),
            weight = Math.pow(10, ne.util.lengthAfterPoint(tickInfo.step));
        return (diffMax + diffMin) * weight;
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
            minValue = this._getComparingValue(tickInfo, min, max);

        ne.util.forEachArray(rest, function(info) {
            var compareValue = this._getComparingValue(info, min, max);
            if (minValue > compareValue) {
                tickInfo = info;
                minValue = compareValue;
            }
        }, this);
        return tickInfo;
    },

    /**
     * Get tick count and scale.
     * @param {object} data params
     *      @param {number} data.min minimum value of user data
     *      @param {number} data.max maximum value of user data
     *      @param {{width: number, height: number}} data.chartDimension chat dimension
     * @param {{min: number, max:number}} options axis options
     * @returns {{tickCount: number, scale: object}} tick info
     * @private
     */
    _getTickInfo: function(data, options) {
        var intTypeInfo = this._makeIntegerTypeInfo(data.min, data.max, options),
            tickCounts = this._getCandidateTickCounts(data.chartDimension),
            candidates = this._getTickInfoCandidates({
                min: intTypeInfo.min,
                max: intTypeInfo.max,
                tickCounts: tickCounts
            }, intTypeInfo.options),
            tickInfo = this._selectTickInfo(intTypeInfo.min, intTypeInfo.max, candidates);
        tickInfo = this._makeOriginalTypeTickInfo(tickInfo, intTypeInfo.divideNum);
        return tickInfo;
    },

    /**
     * To make integer type info
     * @param {number} min minimum value of user data
     * @param {number} max maximum value of user data
     * @param {{min: number, max: number}} options axis options
     * @returns {{min: number, max: number, options: {min: number, max: number}, divideNum: number}} integer type info
     * @private
     */
    _makeIntegerTypeInfo: function(min, max, options) {
        var multipleNum, changeOptions;

        if (abs(min) >= 1 || abs(max) >= 1) {
            return {
                min: min,
                max: max,
                options: options,
                divideNum: 1
            };
        }

        multipleNum = ne.util.findMultipleNum(min, max);
        changeOptions = {};

        if (options.min) {
            changeOptions.min = options.min * multipleNum;
        }

        if (options.max) {
            changeOptions.max = options.max * multipleNum;
        }

        return {
            min: min * multipleNum,
            max: max * multipleNum,
            options: changeOptions,
            divideNum: multipleNum
        };
    },

    /**
     * To make tick info to original type.
     * @param {{step: number, scale: {min: number, max: number}, labels: array.<number>}} tickInfo tick info
     * @param {number} divideNum divide num
     * @returns {{step: number, scale: {min: number, max: number}, labels: array.<number>}} divided tick info
     * @private
     */
    _makeOriginalTypeTickInfo: function(tickInfo, divideNum) {
        if (divideNum === 1) {
            return tickInfo;
        }

        tickInfo.step = ne.util.division(tickInfo.step, divideNum);
        tickInfo.scale.min = ne.util.division(tickInfo.scale.min, divideNum);
        tickInfo.scale.max = ne.util.division(tickInfo.scale.max, divideNum);
        tickInfo.labels = ne.util.map(tickInfo.labels, function(label) {
            return ne.util.division(label, divideNum);
        });

        return tickInfo;
    },

    /**
     * Normalize step.
     * @param {number} step original step
     * @returns {number} normalized step
     * @private
     */
    _normalizeStep: function(step) {
        var standard = 0,
            normalized, mod;

        if (step === 0) {
            return step;
        }

        ne.util.forEachArray(AXIS_STANDARD_MULTIPLE_NUMS, function(num) {
            if (step < num) {
                if (num > 1) {
                    standard = num;
                }
                return false;
            } else if (num === 10) {
                standard = 10;
            }
        });

        if (standard < 1) {
            normalized = this._normalizeStep(step * 10) * 0.1;
        } else {
            mod = ne.util.mod(step, standard);
            normalized = ne.util.addition(step, (mod > 0 ? standard - mod : 0));
        }
        return normalized;
    },

    /**
     * Normalize min.
     * @param {number} min original min
     * @param {number} step tick step
     * @returns {number} normalized min
     * @private
     */
    _normalizeMin: function(min, step) {
        var mod = ne.util.mod(min, step),
            normalized;

        if (mod === 0) {
            normalized = min;
        } else {
            normalized = ne.util.subtraction(min, (min >= 0 ? mod : step + mod));
        }
        return normalized;
    },

    /**
     * Calculate scale from chart min, max data.
     *  - http://peltiertech.com/how-excel-calculates-automatic-chart-axis-limits/
     * @param {number} min min minimum value of user data
     * @param {number} max max maximum value of user data
     * @param {number} tickCount tick count
     * @returns {{min: number, max: number}} scale axis scale
     * @private
     */
    _calculateScale: function(min, max) {
        var saveMin = 0,
            scale = {},
            iodValue; // increase or decrease value;

        if (min < 0) {
            saveMin = min;
            max -= min;
            min = 0;
        }

        iodValue = (max - min) / 20;
        scale.max = max + iodValue + saveMin;

        if (max / 6 > min) {
            scale.min = 0 + saveMin;
        } else {
            scale.min = min - iodValue + saveMin;
        }
        return scale;
    },

    /**
     * To minimize tick scale.
     * @param {number} userMin user min
     * @param {number} userMax user max
     * @param {{tickCount: number, scale: object}} tickInfo tick info
     * @param {{min: number, max:number}} options axis options
     * @returns {{tickCount: number, scale: object, labels: array}} corrected tick info
     * @private
     */
    _minimizeTickScale: function(userMin, userMax, tickInfo, options) {
        var ticks = ne.util.range(1, tickInfo.tickCount),
            step = tickInfo.step,
            scale = tickInfo.scale,
            tickMax = scale.max,
            tickMin = scale.min,
            isUndefinedMin = ne.util.isUndefined(options.min),
            isUndefinedMax = ne.util.isUndefined(options.max),
            labels;
        ne.util.forEachArray(ticks, function(tickIndex) {
            var curStep = (step * tickIndex),
                curMin = tickMin + curStep,
                curMax = tickMax - curStep;
            if (userMin <= curMin && userMax >= curMax) {
                return false;
            }

            if ((isUndefinedMin && userMin > curMin) ||
                (!isUndefinedMin && options.min >= curMin)) {
                scale.min = curMin;
            }

            if ((isUndefinedMin && userMax < curMax) ||
                (!isUndefinedMax && options.max <= curMax)) {
                scale.max = curMax;
            }
        });

        labels = this._makeLabelsFromScale(scale, step);
        tickInfo.labels = labels;
        tickInfo.step = step;
        tickInfo.tickCount = labels.length;
        return tickInfo;
    },

    /**
     * To divide tick step.
     * @param {{scale: {min: number, max: number}, tickCount: number, step: number, labels: array.<number>}} tickInfo tick info
     * @param {number} orgTickCount original tickCount
     * @returns {{scale: {min: number, max: number}, tickCount: number, step: number, labels: array.<number>}} tick info
     * @private
     */
    _divideTickStep: function(tickInfo, orgTickCount) {
        var step = tickInfo.step,
            scale = tickInfo.scale,
            tickCount = tickInfo.tickCount;
        if (step % 2 === 0 && (tickCount % 2) &&
            abs(orgTickCount - (tickCount * 2)) < abs(orgTickCount - tickCount)) {
            step = step / 2;
            tickInfo.labels = this._makeLabelsFromScale(scale, step);
            tickInfo.tickCount = tickInfo.labels.length;
            tickInfo.step = step;
        }
        return tickInfo;
    },

    /**
     * To make tick info
     * @param {number} tickCount tick count
     * @param {number} min scale min
     * @param {number} max scale max
     * @param {number} userMin minimum value of user data
     * @param {number} userMax maximum value of user data
     * @param {boolean} isMinus whether scale is minus or not
     * @param {{min: number, max: number}} options axis options
     * @returns {{scale: {min: number, max: number}, tickCount: number, step: number, labels: array.<number>}} tick info
     * @private
     */
    _makeTickInfo: function(tickCount, min, max, userMin, userMax, isMinus, options) {
        var scale = this._calculateScale(min, max),
            isLineChart = this.chartType === chartConst.CHART_TYPE_LINE,
            tmpMin, orgScaleMax, tmpStep, step, multipleNum, tickInfo,
            diffMax, modDiff, divideDiff;

        if (isMinus) {
            tmpMin = scale.min;
            scale.min = -scale.max;
            scale.max = -tmpMin;
        }

        scale.min = options.min || scale.min;
        scale.max = options.max || scale.max;

        orgScaleMax = scale.max;

        tmpStep = this.getScaleStep(scale, tickCount);
        step = this._normalizeStep(tmpStep);
        scale.min = this._normalizeMin(scale.min, step);
        multipleNum = ne.util.findMultipleNum(step);
        scale.max = ((scale.min * multipleNum) + (step * multipleNum * (tickCount - 1))) / multipleNum;

        diffMax = orgScaleMax - scale.max;
        if (diffMax > 0) {
            modDiff = diffMax % step;
            divideDiff = Math.floor(diffMax / step);
            scale.max += step * (modDiff > 0 ? divideDiff + 1 : divideDiff);
        }

        if (ne.util.isUndefined(options.max) && (scale.max === userMax)) {
            scale.max += step;
        }

        if ((isLineChart || userMin > 0) &&
            ne.util.isUndefined(options.min) && (scale.min === userMin)) {
            scale.min -= step;
        }

        tickInfo = {scale: scale, step: step, tickCount: tickCount};
        tickInfo = this._minimizeTickScale(userMin, userMax, tickInfo, options);
        tickInfo = this._divideTickStep(tickInfo, tickCount);

        return tickInfo;
    },

    /**
     * Get candidates about tick info.
     * @param {object} data params
     *      @param {number} data.min minimum value of user data
     *      @param {number} data.max maximum value of user data
     *      @param {array.<number>} data.tickCounts tick counts
     * @param {{min: number, max:number}} options axis options
     * @returns {array} candidates about tick info
     * @private
     */
    _getTickInfoCandidates: function(data, options) {
        var userMin = data.min,
            userMax = data.max,
            min = data.min,
            max = data.max,
            isMinus = false,
            tmpMin, candidates;

        if (min < 0 && max <= 0) {
            isMinus = true;
            tmpMin = min;
            min = -max;
            max = -tmpMin;
        }

        candidates = ne.util.map(data.tickCounts, function(tickCount) {
            return this._makeTickInfo(tickCount, min, max, userMin, userMax, isMinus, options);
        }, this);

        return candidates;
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
        var multipleNum = ne.util.findMultipleNum(step),
            min = scale.min * multipleNum,
            max = scale.max * multipleNum,
            labels = ne.util.range(min, max + 1, step * multipleNum);
        labels = ne.util.map(labels, function(label) {
            return label / multipleNum;
        });
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