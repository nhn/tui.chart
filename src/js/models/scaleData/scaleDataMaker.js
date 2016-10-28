/**
 * @fileoverview scaleMaker calculates the limit and step into values of processed data and returns it.
 * @auth NHN Ent.
 *       FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../../const');
var predicate = require('../../helpers/predicate');
var calculator = require('../../helpers/calculator');
var renderUtil = require('../../helpers/renderUtil');

var abs = Math.abs;

/**
 * scaleMaker calculates limit and step into values of processed data and returns it.
 * @module scaleDataMaker
 */
var scaleDataMaker = {
    /**
     * Get candidate counts of value.
     * @memberOf module:axisDataMaker
     * @param {number} baseSize - base size(width or not)
     * @returns {Array.<number>} value counts
     * @private
     */
    _getCandidateCountsOfValue: function(baseSize) {
        var minStart = 3;
        var start = Math.max(minStart, parseInt(baseSize / chartConst.MAX_PIXEL_TYPE_STEP_SIZE, 10));
        var end = Math.max(start, parseInt(baseSize / chartConst.MIN_PIXEL_TYPE_STEP_SIZE, 10)) + 1;

        return tui.util.range(start, end);
    },

    /**
     * Make limit for diverging option.
     * @param {{min: number, max: number}} limit limit
     * @returns {{min: number, max: number}} changed limit
     * @private
     */
    _makeLimitForDivergingOption: function(limit) {
        var newMax = Math.max(abs(limit.min), abs(limit.max));

        return {
            min: -newMax,
            max: newMax
        };
    },

    /**
     * Make integer type scale.
     * @memberOf module:axisDataMaker
     * @param {{min: number, max: number}} limit - limit
     * @param {?{min: ?number, max: ?number}} limitOption - limit option
     * @returns {{
     *      limit: {min: number, max: number},
     *      options: {min: number, max: number},
     *      divideNum: number
     * }} integer type info
     * @private
     */
    _makeIntegerTypeScale: function(limit, limitOption) {
        var min = limit.min;
        var max = limit.max;
        var multipleNum, changedOptions;

        limitOption = limitOption || {};

        if (abs(min) >= 1 || abs(max) >= 1) {
            return {
                limit: limit,
                limitOption: limitOption,
                divisionNumber: 1
            };
        }

        multipleNum = tui.util.findMultipleNum(min, max);
        changedOptions = {};

        if (!tui.util.isUndefined(limitOption.min)) {
            changedOptions.min = limitOption.min * multipleNum;
        }

        if (!tui.util.isUndefined(limitOption.max)) {
            changedOptions.max = limitOption.max * multipleNum;
        }

        return {
            limit: {
                min: min * multipleNum,
                max: max * multipleNum
            },
            limitOption: changedOptions,
            divisionNumber: multipleNum
        };
    },

    /**
     * Make limit if equal min and max.
     * @param {{min: number, max: number}} limit limit
     * @returns {{min: number, max: number}} changed limit
     * @private
     */
    _makeLimitIfEqualMinMax: function(limit) {
        var min = limit.min,
            max = limit.max;

        if (min > 0) {
            min = 0;
        } else if (min < 0) {
            max = 0;
        }

        return {
            min: min,
            max: max
        };
    },

    /**
     * Make base limit
     * @memberOf module:axisDataMaker
     * @param {{min: number, max: number}} dataLimit user limit
     * @param {{min: number, max: number}} limitOption axis options
     * @returns {{min: number, max: number}} base limit
     * @private
     */
    _makeBaseLimit: function(dataLimit, limitOption) {
        var isMinusLimit = predicate.isMinusLimit(dataLimit);
        var min = dataLimit.min;
        var max = dataLimit.max;
        var baseLimit, tmpMin;

        if (min === max) {
            baseLimit = this._makeLimitIfEqualMinMax(dataLimit);
        } else {
            if (isMinusLimit) {
                tmpMin = min;
                min = -max;
                max = -tmpMin;
            }

            baseLimit = calculator.calculateLimit(min, max);

            if (isMinusLimit) {
                tmpMin = baseLimit.min;
                baseLimit.min = -baseLimit.max;
                baseLimit.max = -tmpMin;
            }
        }

        baseLimit.min = tui.util.isUndefined(limitOption.min) ? baseLimit.min : limitOption.min;
        baseLimit.max = tui.util.isUndefined(limitOption.max) ? baseLimit.max : limitOption.max;

        return baseLimit;
    },

    /**
     * Normalize min.
     * @memberOf module:axisDataMaker
     * @param {number} min original min
     * @param {number} step scale step
     * @returns {number} normalized min
     * @private
     */
    _normalizeMin: function(min, step) {
        var mod = tui.util.mod(min, step),
            normalized;

        if (mod === 0) {
            normalized = min;
        } else {
            normalized = tui.util.subtract(min, (min >= 0 ? mod : step + mod));
        }

        return Math.round(normalized);
    },

    /**
     * Make normalized max.
     * @memberOf module:axisDataMaker
     * @param {{min: number, max: number}} limit limit
     * @param {number} step scale step
     * @param {number} valueCount value count
     * @returns {number} normalized max
     * @private
     */
    _makeNormalizedMax: function(limit, step, valueCount) {
        var minMaxDiff = tui.util.multiply(step, valueCount - 1);
        var normalizedMax = tui.util.add(limit.min, minMaxDiff);
        var maxDiff = limit.max - normalizedMax;
        var modDiff, divideDiff;

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
     * @param {{min: number, max: number}} limit base limit
     * @param {number} step scale step
     * @param {number} valueCount value count
     * @returns {{min: number, max: number}} normalized limit
     * @private
     */
    _normalizeLimit: function(limit, step, valueCount) {
        limit.min = this._normalizeMin(limit.min, step);
        limit.max = this._makeNormalizedMax(limit, step, valueCount);

        return limit;
    },

    /**
     * Decrease minimum value by step value,
     *  when chart type is line or dataMin is minus, options is undefined, minimum values(min, dataMin) are same.
     * @param {number} min - limit min
     * @param {number} dataMin - minimum value
     * @param {number} step - scale step
     * @param {string} chartType - chart type
     * @param {?number} optionMin - min option
     * @param {boolean} isVertical - whether vertical or not
     * @returns {number}
     * @private
     */
    _decreaseMinByStep: function(min, dataMin, step, chartType, optionMin, isVertical) {
        /*eslint max-params: [2, 6]*/
        var isLineChart = predicate.isLineChart(chartType);
        var isAreaChartXAxis = predicate.isAreaChart(chartType) && !isVertical;
        var isMinusDataMin = dataMin < 0;
        var isUndefinedMinOption = tui.util.isUndefined(optionMin);
        var isSame = (min === dataMin);

        if ((isLineChart || isAreaChartXAxis || isMinusDataMin) && isUndefinedMinOption && isSame) {
            min -= step;
        }

        return min;
    },

    /**
     * Increase maximum value by step value,
     *  when chart type is line or dataMin is plus, options is undefined, maximum values(max, dataMax) are same.
     * @param {number} max - limit max
     * @param {number} dataMax - maximum value
     * @param {number} step - scale step
     * @param {string} chartType - chart type
     * @param {?number} optionMax - max option
     * @returns {number}
     * @private
     */
    _increaseMaxByStep: function(max, dataMax, step, chartType, optionMax) {
        var isLineChart = predicate.isLineChart(chartType);
        var isPlusDataMax = dataMax > 0;
        var isUndefinedMaxOption = tui.util.isUndefined(optionMax);
        var isSame = (max === dataMax);

        if ((isLineChart || isPlusDataMax) && isUndefinedMaxOption && isSame) {
            max += step;
        }

        return max;
    },

    /**
     * Divide scale step.
     * @param {{min: number, max: number}} limit limit
     * @param {number} step step
     * @param {number} candidateValueCount candidate valueCount
     * @returns {number} scale step
     * @private
     */
    _divideScaleStep: function(limit, step, candidateValueCount) {
        var isEvenStep = ((step % 2) === 0),
            valueCount = calculator.makeLabelsFromLimit(limit, step).length,
            twiceValueCount = (valueCount * 2) - 1,
            diffOrg = abs(candidateValueCount - valueCount),
            diffTwice = abs(candidateValueCount - twiceValueCount);

        // step을 반으로 나누었을 때의 valueCount가 후보로 계산된 candidateValueCount와 인접하면 step을 반으로 나누어 반환합니다.
        if (isEvenStep && diffTwice <= diffOrg) {
            step = step / 2;
        }

        return step;
    },

    /**
     * Minimize scale limit.
     * @param {{min: number, max: number}} limit base limit
     * @param {{min: number, max: number}} dataLimit limit of user data
     * @param {number} step scale step
     * @param {number} valueCount value count
     * @param {{min: number, max:number}} options limit options of axis
     * @returns {{min: number, max: number}} minimized limit
     * @private
     */
    _minimizeScaleLimit: function(limit, dataLimit, step, valueCount, options) {
        var min = limit.max,
            max = limit.min,
            comparisonMin = tui.util.isUndefined(options.min) ? dataLimit.min - 1 : options.min,
            comparisonMax = tui.util.isUndefined(options.max) ? dataLimit.max + 1 : options.max;

        tui.util.forEachArray(tui.util.range(1, valueCount), function(valueIndex) {
            var changingStep = (step * valueIndex),
                changedMin = max + changingStep,
                changedMax = min - changingStep;

            // limit이 dataLimit 범위를 넘어갈 것으로 예상되는 경우에 변경을 중단함
            if (dataLimit.min <= changedMin && dataLimit.max >= changedMax) {
                return false;
            }

            if (comparisonMin >= changedMin) {
                limit.min = changedMin;
            }

            if (comparisonMax <= changedMax) {
                limit.max = changedMax;
            }

            return true;
        });

        return limit;
    },

    /**
     * Adjust limit for bubble chart.
     * @param {{min: number, max: number}} limit - limit
     * @param {number} step - step;
     * @param {object.<string, object>} overflowItem - overflow Item map
     * @private
     */
    _adjustLimitForBubbleChart: function(limit, step, overflowItem) {
        if (overflowItem.minItem) {
            limit.min -= step;
        }

        if (overflowItem.maxItem) {
            limit.max += step;
        }
    },

    /**
     * Make candidate axis scale.
     * @param {{
     *      dataLimit: {min: number, max: number},
     *      baseLimit: {min: number, max: number}
     * }} limitMap - limit map
     * @param {{
     *      isVertical: boolean,
     *      chartType: string,
     *      overflowItem: ?object,
     *      limitOption: ?{min: ?number, max: ?number}
     * }} options - options
     * @param {number} valueCount value count
     * @returns {{
     *      limit: {min: number, max: number},
     *      step: number
     * }} scale
     * @private
     */
    _makeCandidateScale: function(limitMap, options, valueCount) {
        var baseLimit = limitMap.baseLimit;
        var dataLimit = limitMap.dataLimit;
        var limitOption = options.limitOption;
        var isVertical = options.isVertical;
        var chartType = options.chartType;
        var limit = tui.util.extend({}, baseLimit);
        var step;

        // 01. 기본 limit 정보로 step 얻기
        step = calculator.calculateStepFromLimit(limit, valueCount);

        // 02. step 정규화 시키기 (ex: 0.3 --> 0.5, 7 --> 10)
        step = calculator.normalizeAxisNumber(step);

        // 03. limit 정규화 시키기
        limit = this._normalizeLimit(limit, step, valueCount);

        // 04. line차트의 경우 사용자의 min값이 limit의 min값과 같을 경우, min값을 1 step 감소 시킴
        limit.min = this._decreaseMinByStep(limit.min, dataLimit.min, step, chartType, limitOption.min, isVertical);

        // 04. 사용자의 max값이 scale max와 같을 경우, max값을 1 step 증가 시킴
        limit.max = this._increaseMaxByStep(limit.max, dataLimit.max, step, chartType, limitOption.max);

        // 05. axis limit이 사용자 min, max와 거리가 멀 경우 조절
        limit = this._minimizeScaleLimit(limit, dataLimit, step, valueCount, limitOption);

        // 06. 조건에 따라 step값을 반으로 나눔
        step = this._divideScaleStep(limit, step, valueCount);

        if (options.overflowItem) {
            this._adjustLimitForBubbleChart(limit, step, options.overflowItem);
        }

        return {
            limit: limit,
            step: step,
            stepCount: abs(limit.max - limit.min) / step
        };
    },

    /**
     * Make candidates for axis scale.
     * @param {{
     *      limit: {min: number, max: number},
     *      options: {min: number, max: number},
     *      divisionNumber: number
     * }} integerTypeScale - integer type axis scale
     * @param {Array.<number>} valueCounts - candidate counts of value
     * @param {{
     *      isVertical: boolean,
     *      chartType: string,
     *      overflowItem: ?object
     * }} options - options
     * @returns {Array.<{limit:{min: number, max: number}, stpe: number}>}
     * @private
     */
    _makeCandidateScales: function(integerTypeScale, valueCounts, options) {
        var self = this;
        var dataLimit = integerTypeScale.limit;
        var limitOption = integerTypeScale.limitOption;
        var limitMap = {
            dataLimit: dataLimit,
            baseLimit: this._makeBaseLimit(dataLimit, limitOption)
        };

        options.limitOption = limitOption;

        return tui.util.map(valueCounts, function(valueCount) {
            return self._makeCandidateScale(limitMap, options, valueCount);
        });
    },

    /**
     * Get comparing value for selecting axis scale.
     * @param {{min: number, max: number}} baseLimit - limit
     * @param {Array.<number>} valueCounts - candidate counts of value
     * @param {{limit: {min: number, max: number}, step: number}} candidateScale - scale
     * @param {number} index - index
     * @returns {number} comparing value
     * @private
     */
    _getComparingValue: function(baseLimit, valueCounts, candidateScale, index) {
        var diffMax = abs(candidateScale.limit.max - baseLimit.max);
        var diffMin = abs(baseLimit.min - candidateScale.limit.min);
        // 예상 label count와 차이가 많을 수록 후보 제외 가능성이 높음
        var diffCount = Math.max(abs(valueCounts[index] - candidateScale.stepCount), 1);
        // 소수점 이하 길이가 길 수록 후보에서 제외될 가능성이 높음
        var weight = Math.pow(10, tui.util.getDecimalLength(candidateScale.step));

        return (diffMax + diffMin) * diffCount * weight;
    },

    /**
     * Select axis scale.
     * @param {{min: number, max: number}} baseLimit limit
     * @param {Array.<{limit: {min: number, max: number}, step: number}>} candidates scale candidates
     * @param {Array.<number>} valueCounts - label counts
     * @returns {{limit: {min: number, max: number}, step: number}} selected scale
     * @private
     */
    _selectAxisScale: function(baseLimit, candidates, valueCounts) {
        var getComparingValue = tui.util.bind(this._getComparingValue, this, baseLimit, valueCounts);
        var axisScale = tui.util.min(candidates, getComparingValue);

        return axisScale;
    },

    /**
     * Restore number state of scale.
     * @memberOf module:axisDataMaker
     * @param {{limit: {min: number, max: number}, step: number}} scale scale
     * @param {number} divisionNumber divide num
     * @returns {{limit: {min: number, max: number}, step: number}} restored scale
     * @private
     */
    _restoreNumberState: function(scale, divisionNumber) {
        if (divisionNumber === 1) {
            return scale;
        }

        scale.step = tui.util.divide(scale.step, divisionNumber);
        scale.limit.min = tui.util.divide(scale.limit.min, divisionNumber);
        scale.limit.max = tui.util.divide(scale.limit.max, divisionNumber);

        return scale;
    },

    /**
     * millisecond map
     */
    millisecondMap: {
        year: 31536000000,
        month: 2678400000,
        date: 86400000,
        hour: 3600000,
        minute: 60000,
        second: 1000
    },

    /**
     * millisecond types
     */
    millisecondTypes: ['year', 'month', 'date', 'hour', 'minute', 'second'],

    /**
     * Find date type.
     * @param {{min: number, max: number}} dataLimit - data limit
     * @param {number} count - data count
     * @returns {string}
     * @private
     */
    _findDateType: function(dataLimit, count) {
        var diff = dataLimit.max - dataLimit.min;
        var millisecondTypes = this.millisecondTypes;
        var millisecondMap = this.millisecondMap;
        var lastTypeIndex = millisecondTypes.length - 1;
        var foundType;

        if (diff) {
            tui.util.forEachArray(millisecondTypes, function(type, index) {
                var millisecond = millisecondMap[type];
                var dividedCount = Math.floor(diff / millisecond);
                var foundIndex;

                if (dividedCount) {
                    foundIndex = index < lastTypeIndex && (dividedCount < count) ? index + 1 : index;
                    foundType = millisecondTypes[foundIndex];
                }

                return !tui.util.isExisty(foundIndex);
            });
        } else {
            foundType = chartConst.DATE_TYPE_SECOND;
        }

        return foundType;
    },

    /**
     * Make datetime information
     * @param {{min: number, max: number}} dataLimit - data limit
     * @param {number} count - data count
     * @returns {{divisionNumber: number, minDate: number, dataLimit: {min: number, max: number}}}
     * @private
     */
    _makeDatetimeInfo: function(dataLimit, count) {
        var dateType = this._findDateType(dataLimit, count);
        var divisionNumber = this.millisecondMap[dateType];
        var minDate = tui.util.divide(dataLimit.min, divisionNumber);
        var maxDate = tui.util.divide(dataLimit.max, divisionNumber);
        var max = maxDate - minDate;

        return {
            divisionNumber: divisionNumber,
            minDate: minDate,
            dataLimit: {
                min: 0,
                max: max
            }
        };
    },

    /**
     * Restore scale to datetime type.
     * @param {{scale: number, limit:{min: number, max: number}}} scale - scale
     * @param {number} minDate - minimum date
     * @param {number} divisionNumber - division number
     * @returns {{step: number, limit: {min: number, max: number}}}
     * @private
     */
    _restoreScaleToDatetimeType: function(scale, minDate, divisionNumber) {
        var limit = scale.limit;

        scale.step = tui.util.multiply(scale.step, divisionNumber);
        limit.min = tui.util.multiply(tui.util.add(limit.min, minDate), divisionNumber);
        limit.max = tui.util.multiply(tui.util.add(limit.max, minDate), divisionNumber);

        return scale;
    },

    /**
     * Calculate scale.
     * @param {Array.<number>} baseValues - base values for calculating scale data
     * @param {number} baseSize - base size(width or height) for calculating scale data
     * @param {string} chartType - chart type
     * @param {{
     *      type: string,
     *      tickCounts: ?Array.<number>,
     *      limitOption: ?{min: ?number, max: ?number},
     *      diverging: boolean,
     *      isVertical: boolean,
     *      overflowItem: ?object
     * }} options - options
     * @returns {{limit: {min: number, max: number}, step: number}}
     * @private
     */
    _calculateScale: function(baseValues, baseSize, chartType, options) {
        var dataLimit = {
            min: tui.util.min(baseValues),
            max: tui.util.max(baseValues)
        };
        var datetimeInfo, integerTypeScale, tickCounts, candidates, scale;

        if (predicate.isDatetimeType(options.type)) {
            datetimeInfo = this._makeDatetimeInfo(dataLimit, baseValues.length);
            dataLimit = datetimeInfo.dataLimit;
        }

        if (dataLimit.min === 0 && dataLimit.max === 0) {
            dataLimit.max = 5;
        }

        if (predicate.isDivergingChart(chartType, options.diverging)) {
            dataLimit = this._makeLimitForDivergingOption(dataLimit);
        }

        // 01. limit, options 정보를 정수형으로 변경
        integerTypeScale = this._makeIntegerTypeScale(dataLimit, options.limitOption);

        // 02. value count 후보군 얻기
        tickCounts = options.tickCounts || this._getCandidateCountsOfValue(baseSize);

        // 03. axis scale 후보군 얻기
        candidates = this._makeCandidateScales(integerTypeScale, tickCounts, {
            chartType: chartType,
            isVertical: options.isVertical,
            overflowItem: options.overflowItem
        });

        // 04. axis scale 후보군 중 하나 선택
        scale = this._selectAxisScale(integerTypeScale.limit, candidates, tickCounts);

        // 05. 정수형으로 변경했던 scale을 원래 형태로 변경
        scale = this._restoreNumberState(scale, integerTypeScale.divisionNumber);

        if (predicate.isDatetimeType(options.type)) {
            scale = this._restoreScaleToDatetimeType(scale, datetimeInfo.minDate, datetimeInfo.divisionNumber);
        }

        return scale;
    },

    /**
     * Get percent stackType scale.
     * @param {Array.<number>} baseValues - base values
     * @param {string} chartType - chart type
     * @param {boolean} diverging - diverging option
     * @returns {{limit: {min:number, max:number}, step: number}}
     * @private
     */
    _getPercentStackedScale: function(baseValues, chartType, diverging) {
        var scale;

        if (calculator.sumMinusValues(baseValues) === 0) {
            scale = chartConst.PERCENT_STACKED_AXIS_SCALE;
        } else if (calculator.sumPlusValues(baseValues) === 0) {
            scale = chartConst.MINUS_PERCENT_STACKED_AXIS_SCALE;
        } else if (predicate.isDivergingChart(chartType, diverging)) {
            scale = chartConst.DIVERGING_PERCENT_STACKED_AXIS_SCALE;
        } else {
            scale = chartConst.DUAL_PERCENT_STACKED_AXIS_SCALE;
        }

        return scale;
    },

    /**
     * Make scale data.
     * @param {Array.<number>} baseValues - base values for calculating scale data
     * @param {number} baseSize - base size(width or height) for calculating scale data
     * @param {string} chartType - chart type
     * @param {{
     *      type: string,
     *      stackType: string,
     *      diverging: boolean,
     *      isVertical: boolean,
     *      limitOption: ?{min: ?number, max: ?number},
     *      tickCounts: ?Array.<number>
     * }} options - options
     * @returns {{limit: {min:number, max:number}, step: number}}
     */
    makeScaleData: function(baseValues, baseSize, chartType, options) {
        var scaleData;

        if (predicate.isPercentStackChart(chartType, options.stackType)) {
            scaleData = this._getPercentStackedScale(baseValues, chartType, options.diverging);
        } else {
            scaleData = this._calculateScale(baseValues, baseSize, chartType, options);
        }

        return scaleData;
    },

    /**
     * Get functions for formatting value.
     * @param {string} chartType - chart type
     * @param {string} stackType - stack type
     * @param {?Array.<function>} formatFunctions - format functions
     * @returns {Array.<function>}
     * @private
     */
    _getFormatFunctions: function(chartType, stackType, formatFunctions) {
        if (predicate.isPercentStackChart(chartType, stackType)) {
            formatFunctions = [function(value) {
                return value + '%';
            }];
        }

        return formatFunctions;
    },

    /**
     * Create scale values.
     * @param {{limit: {min: number, max: number}, step: number}} scaleData - scale data
     * @param {string} chartType - chart type
     * @param {boolean} diverging - diverging option
     * @returns {Array.<number>}
     * @private
     */
    _createScaleValues: function(scaleData, chartType, diverging) {
        var values = calculator.makeLabelsFromLimit(scaleData.limit, scaleData.step);

        return predicate.isDivergingChart(chartType, diverging) ? tui.util.map(values, abs) : values;
    },

    /**
     * Create formatted scale values.
     * @param {{limit: {min: number, max: number}, step: number}} scaleData - scale data
     * @param {{
     *      chartType: string,
     *      areaType: string,
     *      valueType: string
     * }} typeMap - type map
     * @param {{
     *      type: string,
     *      stackType: string,
     *      diverging: boolean,
     *      dateFormat: ?string
     * }} options - options
     * @param {?Array.<function>} formatFunctions - format functions
     * @returns {Array.<string|number>|*}
     */
    createFormattedLabels: function(scaleData, typeMap, options, formatFunctions) {
        var chartType = typeMap.chartType;
        var areaType = typeMap.areaType;
        var valueType = typeMap.valueType;
        var values = this._createScaleValues(scaleData, chartType, options.diverging);
        var formattedValues;

        if (predicate.isDatetimeType(options.type)) {
            formattedValues = renderUtil.formatDates(values, options.dateFormat);
        } else {
            formatFunctions = this._getFormatFunctions(chartType, options.stackType, formatFunctions);
            formattedValues = renderUtil.formatValues(values, formatFunctions, chartType, areaType, valueType);
        }

        return formattedValues;
    }
};

module.exports = scaleDataMaker;
