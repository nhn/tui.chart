/**
 * @fileoverview Axis Data Maker
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    predicate = require('./predicate'),
    calculator = require('./calculator'),
    renderUtil = require('./renderUtil');

var abs = Math.abs,
    concat = Array.prototype.concat;

/**
 * Axis data maker.
 * @module axisDataMaker
 */
var axisDataMaker = {
    /**
     * Make labels.
     * @param {Array.<string>} labels labels
     * @param {number} labelInterval label interval
     * @returns {Array.<string>} labels
     * @private
     */
    _makeLabels: function(labels, labelInterval) {
        var lastIndex;
        if (!labelInterval) {
            return labels;
        }

        lastIndex = labels.length - 1;
        return tui.util.map(labels, function(label, index) {
            if (index > 0 && index < lastIndex && (index % labelInterval) > 0) {
                label = chartConst.EMPTY_AXIS_LABEL;
            }
            return label;
        });
    },

    /**
     * Make data about label axis.
     * @memberOf module:axisDataMaker
     * @param {object} params parameters
     *      @param {Array.<string>} labels chart labels
     *      @param {boolean} isVertical whether vertical or not
     * @returns {{
     *      labels: Array.<string>,
     *      tickCount: number,
     *      validTickCount: number,
     *      isLabelAxis: boolean,
     *      isVertical: boolean
     * }} axis data
     */
    makeLabelAxisData: function(params) {
        var tickCount = params.labels.length,
            options = params.options || {};

        if (!params.aligned) {
            tickCount += 1;
        }

        return {
            labels: this._makeLabels(params.labels, options.labelInterval),
            tickCount: tickCount,
            validTickCount: 0,
            isLabelAxis: true,
            isVertical: !!params.isVertical,
            aligned: !!params.aligned
        };
    },

    /**
     * Make data about value axis.
     * @memberOf module:axisDataMaker
     * @param {object} params parameters
     *      @param {Array.<Array.<number>>} params.values chart values
     *      @param {{width:number, height:number}} params.seriesDimension series dimension
     *      @param {Array.<function>} params.formatFunctions format functions
     *      @param {string} params.stacked stacked option
     *      @param {string} params.options axis options
     * @returns {{
     *      labels: Array.<string>,
     *      tickCount: number,
     *      validTickCount: number,
     *      isLabelAxis: boolean,
     *      limit: {min: number, max: number},
     *      isVertical: boolean
     * }} axis data
     */
    makeValueAxisData: function(params) {
        var options = params.options || {},
            isVertical = !!params.isVertical,
            isPositionRight = !!params.isPositionRight,
            isAllowedStackedOption = predicate.isAllowedStackedOption(params.chartType),
            formatFunctions = params.formatFunctions,
            minusSum, tickInfo;

        if (isAllowedStackedOption && predicate.isPercentStacked(params.stackedOption)) {
            minusSum = calculator.sumMinusValues(concat.apply([], params.values));
            if (minusSum < 0) {
                tickInfo = params.divergingOption ? chartConst.DIVERGENT_PERCENT_STACKED_TICK_INFO
                    : chartConst.NEGATIVE_PERCENT_STACKED_TICK_INFO;
            } else {
                tickInfo = chartConst.PERCENT_STACKED_TICK_INFO;
            }
            formatFunctions = [function(value) {
                return value + '%';
            }];
        } else {
            tickInfo = this._getTickInfo({
                values: this._makeBaseValues(params.values, isAllowedStackedOption, params.stackedOption),
                seriesDimension: params.seriesDimension,
                isVertical: isVertical,
                isPositionRight: isPositionRight,
                chartType: params.chartType,
                divergingOption: params.divergingOption,
                tickCount: params.tickCount
            }, options);
        }

        return {
            labels: this.formatLabels(tickInfo.labels, formatFunctions),
            tickCount: tickInfo.tickCount,
            validTickCount: tickInfo.tickCount,
            limit: tickInfo.limit,
            step: tickInfo.step,
            isVertical: isVertical,
            isPositionRight: isPositionRight,
            aligned: !!params.aligned
        };
    },

    /**
     * Make base values.
     * @memberOf module:axisDataMaker
     * @param {Array.<number>} groupValues group values
     * @param {boolean} isAllowedStackedOption whether allowed stacked option or not.
     * @param {string} stacked stacked option.
     * @returns {Array.<number>} base values
     * @private
     */
    _makeBaseValues: function(groupValues, isAllowedStackedOption, stacked) {
        if (isAllowedStackedOption && predicate.isNormalStacked(stacked)) {
            groupValues = tui.util.map(groupValues, function(values) {
                var plusSum = calculator.sumPlusValues(values),
                    minusSum = calculator.sumMinusValues(values);
                return [plusSum, minusSum];
            }, this);
        }
        return concat.apply([], groupValues);
    },

    /**
     * Get base size for get candidate tick counts.
     * @memberOf module:axisDataMaker
     * @param {{width: number, height: number}} dimension chat dimension
     * @param {boolean} isVertical whether vertical or not
     * @returns {number} base size
     * @private
     */
    _getBaseSize: function(dimension, isVertical) {
        var baseSize;

        if (isVertical) {
            baseSize = dimension.height;
        } else {
            baseSize = dimension.width;
        }

        return baseSize;
    },

    /**
     * Get candidate tick counts.
     * @memberOf module:axisDataMaker
     * @param {{width: number, height: number}} chartDimension chat dimension
     * @param {boolean} isVertical whether vertical or not
     * @returns {Array.<number>} tick counts
     * @private
     */
    _getCandidateTickCounts: function(chartDimension, isVertical) {
        var baseSize = this._getBaseSize(chartDimension, isVertical),
            start = tui.util.max([3, parseInt(baseSize / chartConst.MAX_PIXEL_TYPE_STEP_SIZE, 10)]),
            end = tui.util.max([start, parseInt(baseSize / chartConst.MIN_PIXEL_TYPE_STEP_SIZE, 10)]) + 1,
            tickCounts = tui.util.range(start, end);
        return tickCounts;
    },

    /**
     * Get comparing value.
     * @memberOf module:axisDataMaker
     * @param {number} min minimum value of user data
     * @param {number} max maximum value of user data
     * @param {{limit: {min: number, max: number}, step: number}} tickInfo tick info
     * @returns {number} comparing value
     * @private
     */
    _getComparingValue: function(min, max, tickInfo) {
        var diffMax = abs(tickInfo.limit.max - max),
            diffMin = abs(min - tickInfo.limit.min),
            weight = Math.pow(10, tui.util.lengthAfterPoint(tickInfo.step));
        return (diffMax + diffMin) * weight;
    },

    /**
     * Select tick info.
     * @memberOf module:axisDataMaker
     * @param {number} min minimum value of user data
     * @param {number} max maximum value of user data
     * @param {Array.<object>} candidates tick info candidates
     * @returns {{limit: {min: number, max: number}, tickCount: number, step: number, labels: Array.<number>}} selected tick info
     * @private
     */
    _selectTickInfo: function(min, max, candidates) {
        var getComparingValue = tui.util.bind(this._getComparingValue, this, min, max),
            tickInfo = tui.util.min(candidates, getComparingValue);
        return tickInfo;
    },

    /**
     * Make limit for diverging option.
     * @param {number} min min value
     * @param {max} max max value
     * @returns {{min: number, max: number}} limit
     * @private
     */
    _makeLimitForDivergingOption: function(min, max) {
        var newMax = Math.max(Math.abs(min), Math.abs(max));

        return {
            min: -newMax,
            max: newMax
        };
    },

    /**
     * Get tick count and limit.
     * @memberOf module:axisDataMaker
     * @param {object} params parameters
     *      @param {number} params.values base values
     *      @param {{width: number, height: number}} params.seriesDimension chat dimension
     *      @param {boolean} params.isVertical whether vertical or not
     *      @param {string} params.chartType chat type
     * @param {{min: number, max:number}} options axis options
     * @returns {{tickCount: number, limit: object}} tick info
     * @private
     */
    _getTickInfo: function(params, options) {
        var min = tui.util.min(params.values),
            max = tui.util.max(params.values),
            changedLimit, intTypeInfo, tickCounts, candidates, tickInfo;

        if (min === 0 && max === 0) {
            max = 5;
        }

        if (params.divergingOption) {
            delete options.min;
            changedLimit = this._makeLimitForDivergingOption(min, max);
            min = changedLimit.min;
            max = changedLimit.max;
        }

        // 01. min, max, options 정보를 정수형으로 변경
        intTypeInfo = this._makeIntegerTypeInfo(min, max, options);

        // 02. tick count 후보군 얻기
        tickCounts = params.tickCount ? [params.tickCount] : this._getCandidateTickCounts(params.seriesDimension, params.isVertical);

        // 03. tick info 후보군 계산
        candidates = this._getCandidateTickInfos({
            min: intTypeInfo.min,
            max: intTypeInfo.max,
            tickCounts: tickCounts,
            chartType: params.chartType
        }, intTypeInfo.options);

        // 04. tick info 후보군 중 하나 선택
        tickInfo = this._selectTickInfo(intTypeInfo.min, intTypeInfo.max, candidates);

        // 05. 정수형으로 변경했던 tick info를 원래 형태로 변경
        tickInfo = this._revertOriginalTypeTickInfo(tickInfo, intTypeInfo.divideNum);

        if (params.divergingOption) {
            tickInfo.labels = tui.util.map(tickInfo.labels, Math.abs);
        }
        return tickInfo;
    },

    /**
     * Make integer type info
     * @memberOf module:axisDataMaker
     * @param {number} min minimum value of user data
     * @param {number} max maximum value of user data
     * @param {{min: number, max: number}} options axis options
     * @returns {{min: number, max: number, options: {min: number, max: number}, divideNum: number}} integer type info
     * @private
     */
    _makeIntegerTypeInfo: function(min, max, options) {
        var multipleNum, changedOptions;

        if (abs(min) >= 1 || abs(max) >= 1) {
            return {
                min: min,
                max: max,
                options: options,
                divideNum: 1
            };
        }

        multipleNum = tui.util.findMultipleNum(min, max);
        changedOptions = {};

        if (!tui.util.isUndefined(options.min)) {
            changedOptions.min = options.min * multipleNum;
        }

        if (!tui.util.isUndefined(options.max)) {
            changedOptions.max = options.max * multipleNum;
        }

        return {
            min: min * multipleNum,
            max: max * multipleNum,
            options: changedOptions,
            divideNum: multipleNum
        };
    },

    /**
     * Revert tick info to original type.
     * @memberOf module:axisDataMaker
     * @param {{step: number, limit: {min: number, max: number}, labels: Array.<number>}} tickInfo tick info
     * @param {number} divideNum divide num
     * @returns {{step: number, limit: {min: number, max: number}, labels: Array.<number>}} divided tick info
     * @private
     */
    _revertOriginalTypeTickInfo: function(tickInfo, divideNum) {
        if (divideNum === 1) {
            return tickInfo;
        }

        tickInfo.step = tui.util.division(tickInfo.step, divideNum);
        tickInfo.limit.min = tui.util.division(tickInfo.limit.min, divideNum);
        tickInfo.limit.max = tui.util.division(tickInfo.limit.max, divideNum);
        tickInfo.labels = tui.util.map(tickInfo.labels, function(label) {
            return tui.util.division(label, divideNum);
        });

        return tickInfo;
    },

    /**
     * Normalize step.
     * @memberOf module:axisDataMaker
     * @param {number} step original step
     * @returns {number} normalized step
     * @private
     */
    _normalizeStep: function(step) {
        return calculator.normalizeAxisNumber(step);
    },

    /**
     * Minimize tick limit.
     * @memberOf module:axisDataMaker
     * @param {object} params parameters
     *      @param {number} params.userMin user min
     *      @param {number} params.userMax user max
     *      @param {{tickCount: number, limit: object}} params.tickInfo tick info
     *      @param {{min: number, max:number}} params.options axis options
     * @returns {{tickCount: number, limit: object, labels: Array}} corrected tick info
     * @private
     */
    _minimizeTickLimit: function(params) {
        var tickInfo = params.tickInfo,
            ticks = tui.util.range(1, tickInfo.tickCount),
            options = params.options,
            step = tickInfo.step,
            limit = tickInfo.limit,
            tickMax = limit.max,
            tickMin = limit.min,
            isUndefinedMin = tui.util.isUndefined(options.min),
            isUndefinedMax = tui.util.isUndefined(options.max),
            labels;

        tui.util.forEachArray(ticks, function(tickIndex) {
            var curStep = (step * tickIndex),
                curMin = tickMin + curStep,
                curMax = tickMax - curStep;

            // 더이상 변경이 필요 없을 경우
            if (params.userMin <= curMin && params.userMax >= curMax) {
                return false;
            }

            // min 값에 변경 여유가 있을 경우
            if ((isUndefinedMin && params.userMin > curMin) ||
                (!isUndefinedMin && options.min >= curMin)) {
                limit.min = curMin;
            }

            // max 값에 변경 여유가 있을 경우
            if ((isUndefinedMin && params.userMax < curMax) ||
                (!isUndefinedMax && options.max <= curMax)) {
                limit.max = curMax;
            }
        });

        labels = calculator.makeLabelsFromLimit(limit, step);
        tickInfo.labels = labels;
        tickInfo.step = step;
        tickInfo.tickCount = labels.length;
        return tickInfo;
    },

    /**
     * Divide tick step.
     * @memberOf module:axisDataMaker
     * @param {{limit: {min: number, max: number}, tickCount: number, step: number, labels: Array.<number>}} tickInfo tick info
     * @param {number} orgTickCount original tickCount
     * @returns {{limit: {min: number, max: number}, tickCount: number, step: number, labels: Array.<number>}} tick info
     * @private
     */
    _divideTickStep: function(tickInfo, orgTickCount) {
        var step = tickInfo.step,
            limit = tickInfo.limit,
            tickCount = tickInfo.tickCount;
        // step 2의 배수 이면서 변경된 tickCount의 두배수-1이 tickCount보다 orgTickCount와 차이가 덜나거나 같으면 step을 반으로 변경한다.
        if ((step % 2 === 0) &&
            abs(orgTickCount - ((tickCount * 2) - 1)) <= abs(orgTickCount - tickCount)) {
            step = step / 2;
            tickInfo.labels = calculator.makeLabelsFromLimit(limit, step);
            tickInfo.tickCount = tickInfo.labels.length;
            tickInfo.step = step;
        }
        return tickInfo;
    },

    /**
     * Make tick info
     * @memberOf module:axisDataMaker
     * @param {object} params parameters
     *      @param {number} params.tickCount tick count
     *      @param {number} params.min limit min
     *      @param {number} params.max limit max
     *      @param {number} params.userMin minimum value of user data
     *      @param {number} params.userMax maximum value of user data
     *      @param {boolean} params.isMinus whether limit is minus or not
     *      @param {string} params.chartType chart type
     *      @param {{min: number, max: number}} params.options axis options
     * @returns {{
     *      limit: {min: number, max: number},
     *      tickCount: number,
     *      step: number,
     *      labels: Array.<number>
     * }} tick info
     * @private
     */
    _makeTickInfo: function(params) {
        var limit = params.limit,
            step, tickInfo;

        // 01. 기본 limit 정보로 step 얻기
        step = calculator.calculateStepFromLimit(limit, params.tickCount);

        // 02. step 정규화 시키기 (ex: 0.3 --> 0.5, 7 --> 10)
        step = this._normalizeStep(step);

        // 03. limit 정규화 시키기
        limit = this.normalizeLimit(limit, step, params.tickCount);

        // 04. line차트의 경우 사용자의 min값이 limit의 min값과 같을 경우, min값을 1 step 감소 시킴
        limit.min = this._addMinPadding({
            min: limit.min,
            step: step,
            userMin: params.userMin,
            minOption: params.options.min,
            chartType: params.chartType
        });

        // 04. 사용자의 max값이 scael max와 같을 경우, max값을 1 step 증가 시킴
        limit.max = this._addMaxPadding({
            max: limit.max,
            step: step,
            userMax: params.userMax,
            maxOption: params.options.max,
            chartType: params.chartType
        });

        // 05. axis limit이 사용자 min, max와 거리가 멀 경우 조절
        tickInfo = this._minimizeTickLimit({
            userMin: params.userMin,
            userMax: params.userMax,
            tickInfo: {limit: limit, step: step, tickCount: params.tickCount},
            options: params.options
        });

        tickInfo = this._divideTickStep(tickInfo, params.tickCount);
        return tickInfo;
    },

    /**
     * Add limit min padding.
     * @memberOf module:axisDataMaker
     * @param {object} params parameters
     *      @prams {number} params.min limit min
     *      @param {number} params.userMin minimum value of user data
     *      @param {number} params.minOption min option
     *      @param {number} params.step tick step
     * @returns {number} limit min
     * @private
     */
    _addMinPadding: function(params) {
        var min = params.min;

        if ((!predicate.isLineChart(params.chartType) && params.userMin >= 0) || !tui.util.isUndefined(params.minOption)) {
            return min;
        }
        // normalize된 limit min값이 user min값과 같을 경우 step 감소
        if (params.min === params.userMin) {
            min -= params.step;
        }
        return min;
    },

    /**
     * Add limit max padding.
     * @memberOf module:axisDataMaker
     * @param {object} params parameters
     *      @prams {number} params.max limit max
     *      @param {number} params.userMax maximum value of user data
     *      @param {number} params.maxOption max option
     *      @param {number} params.step tick step
     * @returns {number} limit max
     * @private
     */
    _addMaxPadding: function(params) {
        var max = params.max;

        if ((!predicate.isLineChart(params.chartType) && params.userMax <= 0) || !tui.util.isUndefined(params.maxOption)) {
            return max;
        }

        // normalize된 limit max값이 user max값과 같을 경우 step 증가
        if (tui.util.isUndefined(params.maxOption) && (params.max === params.userMax)) {
            max += params.step;
        }
        return max;
    },

    /**
     * Normalize min.
     * @memberOf module:axisDataMaker
     * @param {number} min original min
     * @param {number} step tick step
     * @returns {number} normalized min
     * @private
     */
    _normalizeMin: function(min, step) {
        var mod = tui.util.mod(min, step),
            normalized;

        if (mod === 0) {
            normalized = min;
        } else {
            normalized = tui.util.subtraction(min, (min >= 0 ? mod : step + mod));
        }
        return normalized;
    },

    /**
     * Make normalized max.
     * @memberOf module:axisDataMaker
     * @param {{min: number, max: number}} limit limit
     * @param {number} step tick step
     * @param {number} tickCount tick count
     * @returns {number} normalized max
     * @private
     */
    _makeNormalizedMax: function(limit, step, tickCount) {
        var minMaxDiff = tui.util.multiplication(step, tickCount - 1),
            normalizedMax = tui.util.addition(limit.min, minMaxDiff),
            maxDiff = limit.max - normalizedMax,
            modDiff, divideDiff;
        // normalize된 max값이 원래의 max값 보다 작을 경우 step을 증가시켜 큰 값으로 만들기
        if (maxDiff > 0) {
            modDiff = maxDiff % step;
            divideDiff = Math.floor(maxDiff / step);
            normalizedMax += step * (modDiff > 0 ? divideDiff + 1 : divideDiff);
        }
        return normalizedMax;
    },

    /**
     * Normalize limit.
     * @memberOf module:axisDataMaker
     * @param {{min: number, max: number}} limit base limit
     * @param {number} step tick step
     * @param {number} tickCount tick count
     * @returns {{min: number, max: number}} normalized limit
     * @private
     */
    normalizeLimit: function(limit, step, tickCount) {
        limit.min = this._normalizeMin(limit.min, step);
        limit.max = this._makeNormalizedMax(limit, step, tickCount);
        return limit;
    },

    /**
     * Get candidates about tick info.
     * @memberOf module:axisDataMaker
     * @param {object} params parameters
     *      @param {number} params.min minimum value of user data
     *      @param {number} params.max maximum value of user data
     *      @param {Array.<number>} params.tickCounts tick counts
     *      @param {string} params.chartType chart type
     * @param {{min: number, max:number}} options axis options
     * @returns {Array} candidates about tick info
     * @private
     */
    _getCandidateTickInfos: function(params, options) {
        var userMin = params.min,
            userMax = params.max,
            min = params.min,
            max = params.max,
            limit, candidates;

        // min, max만으로 기본 limit 얻기
        limit = this._makeBaseLimit(min, max, options);

        candidates = tui.util.map(params.tickCounts, function(tickCount) {
            return this._makeTickInfo({
                tickCount: tickCount,
                limit: tui.util.extend({}, limit),
                userMin: userMin,
                userMax: userMax,
                chartType: params.chartType,
                options: options
            });
        }, this);
        return candidates;
    },

    /**
     * Make base limit
     * @memberOf module:axisDataMaker
     * @param {number} min minimum value of user data
     * @param {number} max maximum value of user data
     * @param {{min: number, max: number}} options axis options
     * @returns {{min: number, max: number}} base limit
     * @private
     */
    _makeBaseLimit: function(min, max, options) {
        var isMinus = false,
            tmpMin, limit;

        if (min === max) {
            if (min > 0) {
                min = 0;
            } else {
                max = 0;
            }

            return {
                min: min,
                max: max
            };
        }

        if (min < 0 && max <= 0) {
            isMinus = true;
            tmpMin = min;
            min = -max;
            max = -tmpMin;
        }

        limit = calculator.calculateLimit(min, max);

        if (isMinus) {
            tmpMin = limit.min;
            limit.min = -limit.max;
            limit.max = -tmpMin;
        }

        limit.min = !tui.util.isUndefined(options.min) ? options.min : limit.min;
        limit.max = !tui.util.isUndefined(options.max) ? options.max : limit.max;

        return limit;
    },

    /**
     * Format labels.
     * @memberOf module:axisDataMaker
     * @param {string[]} labels target labels
     * @param {function[]} formatFunctions format functions
     * @returns {string[]} formatted labels
     */
    formatLabels: function(labels, formatFunctions) {
        var result;
        if (!formatFunctions || !formatFunctions.length) {
            return labels;
        }
        result = tui.util.map(labels, function(label) {
            return renderUtil.formatValue(label, formatFunctions);
        });
        return result;
    }
};

module.exports = axisDataMaker;
