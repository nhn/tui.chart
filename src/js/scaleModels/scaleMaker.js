/**
 * @fileoverview ScaleMaker calculates the limit and step into values of processed data and returns it.
 * @auth NHN Ent.
 *       FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const');
var predicate = require('../helpers/predicate');
var calculator = require('../helpers/calculator');
var renderUtil = require('../helpers/renderUtil');

var abs = Math.abs;

var ScaleMaker = tui.util.defineClass(/** @lends ScaleMaker.prototype */{
    /**
     * ScaleMaker calculates the limit and step into values of processed data and returns it.
     * @param {object} params parameters
     * @constructs ScaleMaker
     */
    init: function(params) {
        /**
         * Data processor
         * @type {DataProcessor}
         */
        this.dataProcessor = params.dataProcessor;

        /**
         * Bounds maker
         * @type {BoundsMaker}
         */
        this.boundsMaker = params.boundsMaker;

        /**
         * stackType option
         * @type {?string}
         */
        this.stackType = params.stackType;

        /**
         * diverging option
         * @type {?boolean}
         */
        this.diverging = params.diverging;

        /**
         * limit option
         * @type {?{min: number, max: number}}
         */
        this.limitOption = params.limitOption;

        this.axisOptions = params.axisOptions;

        /**
         * axis type
         * @type {?string}
         */
        this.type = params.type;

        /**
         * date format
         * @type {?string}
         */
        this.dateFormat = params.dateFormat;

        /**
         * Chart type
         * @type {string}
         */
        this.chartType = params.chartType;

        /**
         * type of value like value, x, y, r
         * @type {string}
         */
        this.valueType = params.valueType;

        /**
         * type of area like yAxis, xAxis
         * @type {string}
         */
        this.areaType = params.areaType;

        /**
         * Whether vertical type or not.
         * @type {boolean}
         */
        this.isVertical = !!params.isVertical;

        /**
         * Whether single yAxis or not.
         * @type {boolean}
         */
        this.isSingleYAxis = !!params.isSingleYAxis;
        /**
         * Count of scale values.
         * @type {number}
         */
        this.valueCounts = params.valueCount ? [params.valueCount] : null;

        /**
         * Axis scale
         * @type {{limit: {min: number, max: number}, step: number}}
         */
        this.scale = null;

        /**
         * Formatted scale values.
         * @type {Array.<string | number>}
         */
        this.formattedValues = null;
    },

    /**
     * Get scale.
     * @returns {{limit: {min: number, max: number}, step: number}}
     * @private
     */
    _getScale: function() {
        if (!this.scale) {
            this.scale = this._makeScale();
        }

        return this.scale;
    },

    /**
     * Get limit.
     * @returns {{min: number, max: number}}
     */
    getLimit: function() {
        return this._getScale().limit;
    },

    /**
     * Get step.
     * @returns {number}
     */
    getStep: function() {
        return this._getScale().step;
    },

    /**
     * Whether percent stack chart or not.
     * @returns {boolean}
     * @private
     */
    _isPercentStackChart: function() {
        var isAllowedStackOption = predicate.isAllowedStackOption(this.chartType),
            isPercentStack = predicate.isPercentStack(this.stackType);

        return isAllowedStackOption && isPercentStack;
    },

    /**
     * Whether normal stack chart or not.
     * @returns {boolean}
     * @private
     */
    _isNormalStackChart: function() {
        var isAllowedStackOption = predicate.isAllowedStackOption(this.chartType),
            isNormalStack = predicate.isNormalStack(this.stackType);

        return isAllowedStackOption && isNormalStack;
    },

    /**
     * Whether diverging chart or not.
     * @returns {boolean|*}
     * @private
     */
    _isDivergingChart: function() {
        return this.diverging && predicate.isBarTypeChart(this.chartType);
    },

    /**
     * Get functions for formatting value.
     * @returns {Array.<function>}
     * @private
     */
    _getFormatFunctions: function() {
        var formatFunctions;

        if (this._isPercentStackChart()) {
            formatFunctions = [function(value) {
                return value + '%';
            }];
        } else {
            formatFunctions = this.dataProcessor.getFormatFunctions();
        }

        return formatFunctions;
    },

    /**
     * Get scale values.
     * @returns {Array.<number>}
     * @private
     */
    _getScaleValues: function() {
        var scale = this._getScale(),
            values = calculator.makeLabelsFromLimit(scale.limit, scale.step);

        return this._isDivergingChart() ? tui.util.map(values, abs) : values;
    },

    /**
     * Get formatted scale values.
     * @returns {Array.<string|number>|*}
     */
    getFormattedScaleValues: function() {
        var chartType = this.chartType;
        var areaType = this.areaType;
        var valueType = this.valueType;
        var values, formatFunctions;

        if (!this.formattedValues) {
            values = this._getScaleValues();

            if (predicate.isDatetimeType(this.type)) {
                this.formattedValues = renderUtil.formatDates(values, this.dateFormat);
            } else {
                formatFunctions = this._getFormatFunctions();
                this.formattedValues = renderUtil.formatValues(values, formatFunctions, chartType, areaType, valueType);
            }
        }

        return this.formattedValues;
    },

    /**
     * Make base values of normal stackType chart.
     * @returns {Array.<number>}
     * @private
     */
    _makeBaseValuesForNormalStackedChart: function() {
        var seriesDataModel = this.dataProcessor.getSeriesDataModel(this.chartType);
        var baseValues = [];

        seriesDataModel.each(function(seriesGroup) {
            var valuesMap = seriesGroup._makeValuesMapPerStack();

            tui.util.forEach(valuesMap, function(values) {
                var plusSum = calculator.sumPlusValues(values);
                var minusSum = calculator.sumMinusValues(values);
                baseValues = baseValues.concat([plusSum, minusSum]);
            });
        });

        return baseValues;
    },

    /**
     * Make base values for making axis scale.
     * @returns {Array.<number>} base values
     * @private
     */
    _makeBaseValues: function() {
        var baseValues;

        if (this.isSingleYAxis) {
            baseValues = this.dataProcessor.getValues();
            if (this._isNormalStackChart()) {
                baseValues = baseValues.concat(this._makeBaseValuesForNormalStackedChart());
            }
        } else if (predicate.isTreemapChart(this.chartType)) {
            baseValues = this.dataProcessor.getValues(this.chartType, 'colorValue');
        } else if (predicate.isMapChart(this.chartType)) {
            baseValues = this.dataProcessor.getValues();
        } else if (this._isNormalStackChart()) {
            baseValues = this._makeBaseValuesForNormalStackedChart();
        } else {
            baseValues = this.dataProcessor.getValues(this.chartType, this.valueType);
        }

        return baseValues;
    },

    /**
     * Get base size for calculation candidate value counts.
     * @returns {number} base size
     * @private
     */
    _getBaseSize: function() {
        var baseSize;

        if (this.isVertical) {
            baseSize = this.boundsMaker.calculateSeriesHeight();
        } else {
            baseSize = this.boundsMaker.calculateSeriesWidth();
        }

        return baseSize;
    },

    /**
     * Get candidate counts of value.
     * @memberOf module:axisDataMaker
     * @returns {Array.<number>} value counts
     * @private
     */
    _getCandidateCountsOfValue: function() {
        var minStart = 3,
            valueCounts, baseSize, start, end;

        baseSize = this._getBaseSize();
        start = Math.max(minStart, parseInt(baseSize / chartConst.MAX_PIXEL_TYPE_STEP_SIZE, 10));
        end = Math.max(start, parseInt(baseSize / chartConst.MIN_PIXEL_TYPE_STEP_SIZE, 10)) + 1;
        valueCounts = tui.util.range(start, end);

        return valueCounts;
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
     * @param {{min: number, max: number}} limit limit
     * @returns {{
     *      limit: {min: number, max: number},
     *      options: {min: number, max: number},
     *      divideNum: number
     * }} integer type info
     * @private
     */
    _makeIntegerTypeScale: function(limit) {
        var options = this.limitOption || {},
            min = limit.min,
            max = limit.max,
            multipleNum, changedOptions;

        if (abs(min) >= 1 || abs(max) >= 1) {
            return {
                limit: limit,
                options: options,
                divisionNumber: 1
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
            limit: {
                min: min * multipleNum,
                max: max * multipleNum
            },
            options: changedOptions,
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
     * @param {{min: number, max: number}} options axis options
     * @returns {{min: number, max: number}} base limit
     * @private
     */
    _makeBaseLimit: function(dataLimit, options) {
        var isMinusLimit = predicate.isMinusLimit(dataLimit),
            min = dataLimit.min,
            max = dataLimit.max,
            baseLimit, tmpMin;

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

            baseLimit.min = tui.util.isUndefined(options.min) ? baseLimit.min : options.min;
            baseLimit.max = tui.util.isUndefined(options.max) ? baseLimit.max : options.max;
        }

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
            normalized = tui.util.subtraction(min, (min >= 0 ? mod : step + mod));
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
        var minMaxDiff = tui.util.multiplication(step, valueCount - 1);
        var normalizedMax = tui.util.addition(limit.min, minMaxDiff);
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
     * @param {number} min base min
     * @param {number} dataMin minimum value of user data
     * @param {number} step scale step
     * @param {?number} optionMin min option
     * @returns {number} changed min
     * @private
     */
    _decreaseMinByStep: function(min, dataMin, step, optionMin) {
        var isLineChart = predicate.isLineChart(this.chartType);
        var isAreaChartX = predicate.isAreaChart(this.chartType) && !this.isVertical;
        var isMinusDataMin = dataMin < 0;
        var isUndefinedMinOption = tui.util.isUndefined(optionMin);
        var isSame = (min === dataMin);

        if ((isLineChart || isAreaChartX || isMinusDataMin) && isUndefinedMinOption && isSame) {
            min -= step;
        }

        return min;
    },

    /**
     * Increase maximum value by step value,
     *  when chart type is line or dataMin is plus, options is undefined, maximum values(max, dataMax) are same.
     * @param {number} max base max
     * @param {number} dataMax maximum value of user data
     * @param {number} step scale step
     * @param {?number} optionMax max option
     * @returns {number} changed max
     * @private
     */
    _increaseMaxByStep: function(max, dataMax, step, optionMax) {
        var isLineChart = predicate.isLineChart(this.chartType),
            isPlusDataMax = dataMax > 0,
            isUndefinedMaxOption = tui.util.isUndefined(optionMax),
            isSame = (max === dataMax);

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
     * @private
     */
    _adjustLimitForBubbleChart: function(limit, step) {
        var valueType = this.valueType;
        var seriesDataModel = this.dataProcessor.getSeriesDataModel(this.chartType);
        var maxRadiusValue = seriesDataModel.getMaxValue('r');
        var isBiggerRatioThanHalfRatio = function(seriesItem) {
            return (seriesItem.r / maxRadiusValue) > chartConst.HALF_RATIO;
        };
        var foundMinItem = seriesDataModel.findMinSeriesItem(valueType, isBiggerRatioThanHalfRatio);
        var foundMaxItem = seriesDataModel.findMaxSeriesItem(valueType, isBiggerRatioThanHalfRatio);

        if (foundMinItem) {
            limit.min -= step;
        }

        if (foundMaxItem) {
            limit.max += step;
        }
    },

    /**
     * Make candidate axis scale.
     * @param {{min: number, max: number}} baseLimit base limit
     * @param {{min: number, max: number}} dataLimit limit of user data
     * @param {number} valueCount value count
     * @param {{min: number, max:number}} options limit options of axis
     * @returns {{
     *      limit: {min: number, max: number},
     *      step: number
     * }} scale
     * @private
     */
    _makeCandidateScale: function(baseLimit, dataLimit, valueCount, options) {
        var limit = tui.util.extend({}, baseLimit);
        var step;

        // 01. 기본 limit 정보로 step 얻기
        step = calculator.calculateStepFromLimit(limit, valueCount);

        // 02. step 정규화 시키기 (ex: 0.3 --> 0.5, 7 --> 10)
        step = calculator.normalizeAxisNumber(step);

        // 03. limit 정규화 시키기
        limit = this._normalizeLimit(limit, step, valueCount);

        // 04. line차트의 경우 사용자의 min값이 limit의 min값과 같을 경우, min값을 1 step 감소 시킴
        limit.min = this._decreaseMinByStep(limit.min, dataLimit.min, step, options.min);

        // 04. 사용자의 max값이 scale max와 같을 경우, max값을 1 step 증가 시킴
        limit.max = this._increaseMaxByStep(limit.max, dataLimit.max, step, options.max);

        // 05. axis limit이 사용자 min, max와 거리가 멀 경우 조절
        limit = this._minimizeScaleLimit(limit, dataLimit, step, valueCount, options);

        // 06. 조건에 따라 step값을 반으로 나눔
        step = this._divideScaleStep(limit, step, valueCount);

        if (predicate.isBubbleChart(this.chartType)) {
            this._adjustLimitForBubbleChart(limit, step);
        }

        return {
            limit: limit,
            step: step,
            valueCount: abs(limit.max - limit.min) / step
        };
    },

    /**
     * Make candidates about axis scale.
     * @param {{
     *      limit: {min: number, max: number},
     *      options: {min: number, max: number},
     *      divisionNumber: number
     * }} integerTypeScale - integer type axis scale
     * @param {Array.<number>} valueCounts - candidate counts of value
     * @returns {Array.<{limit:{min: number, max: number}, stpe: number}>} - candidates scale
     * @private
     */
    _makeCandidateScales: function(integerTypeScale, valueCounts) {
        var self = this;
        var dataLimit = integerTypeScale.limit;
        var options = integerTypeScale.options;
        var baseLimit = this._makeBaseLimit(dataLimit, options);

        return tui.util.map(valueCounts, function(valueCount) {
            return self._makeCandidateScale(baseLimit, dataLimit, valueCount, options);
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
        var diffCount = Math.max(abs(valueCounts[index] - candidateScale.valueCount), 1);
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

        scale.step = tui.util.division(scale.step, divisionNumber);
        scale.limit.min = tui.util.division(scale.limit.min, divisionNumber);
        scale.limit.max = tui.util.division(scale.limit.max, divisionNumber);

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
        var minDate = tui.util.division(dataLimit.min, divisionNumber);
        var maxDate = tui.util.division(dataLimit.max, divisionNumber);
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

        scale.step = tui.util.multiplication(scale.step, divisionNumber);
        limit.min = tui.util.multiplication(tui.util.addition(limit.min, minDate), divisionNumber);
        limit.max = tui.util.multiplication(tui.util.addition(limit.max, minDate), divisionNumber);

        return scale;
    },

    /**
     * Calculate scale.
     * @returns {{limit: {min: number, max: number}, step: number}}
     * @private
     */
    _calculateScale: function() {
        var baseValues = this._makeBaseValues();
        var dataLimit = {
            min: tui.util.min(baseValues),
            max: tui.util.max(baseValues)
        };
        var datetimeInfo, integerTypeScale, valueCounts, candidates, scale;

        if (predicate.isDatetimeType(this.type)) {
            datetimeInfo = this._makeDatetimeInfo(dataLimit, baseValues.length);
            dataLimit = datetimeInfo.dataLimit;
        }

        if (dataLimit.min === 0 && dataLimit.max === 0) {
            dataLimit.max = 5;
        }

        if (this._isDivergingChart()) {
            dataLimit = this._makeLimitForDivergingOption(dataLimit);
        }

        // 01. limit, options 정보를 정수형으로 변경
        integerTypeScale = this._makeIntegerTypeScale(dataLimit);

        // 02. value count 후보군 얻기
        valueCounts = this.valueCounts || this._getCandidateCountsOfValue();

        // 03. axis scale 후보군 얻기
        candidates = this._makeCandidateScales(integerTypeScale, valueCounts);

        // 04. axis scale 후보군 중 하나 선택
        scale = this._selectAxisScale(integerTypeScale.limit, candidates, valueCounts);

        // 05. 정수형으로 변경했던 scale를 원래 형태로 변경
        scale = this._restoreNumberState(scale, integerTypeScale.divisionNumber);

        if (predicate.isDatetimeType(this.type)) {
            scale = this._restoreScaleToDatetimeType(scale, datetimeInfo.minDate, datetimeInfo.divisionNumber);
        }

        return scale;
    },

    /**
     * Get values for sum.
     * @returns {Array.<number>}
     * @private
     */
    _getValuesForSum: function() {
        var values;

        if (this.isSingleYAxis) {
            values = this.dataProcessor.getValues();
        } else {
            values = this.dataProcessor.getValues(this.chartType);
        }

        return values;
    },

    /**
     * Calculate minus sum about group values.
     * @returns {number}
     * @private
     */
    _calculateMinusSum: function() {
        var values = this._getValuesForSum();

        return calculator.sumMinusValues(values);
    },

    /**
     * Calculate plus sum about group values.
     * @returns {number}
     * @private
     */
    _calculatePlusSum: function() {
        var values = this._getValuesForSum();

        return calculator.sumPlusValues(values);
    },

    /**
     * Get percent stackType scale.
     * @returns {{limit: {min:number, max:number}, step: number}}
     * @private
     */
    _getPercentStackedScale: function() {
        var scale;

        if (this._calculateMinusSum() === 0) {
            scale = chartConst.PERCENT_STACKED_AXIS_SCALE;
        } else if (this._calculatePlusSum() === 0) {
            scale = chartConst.MINUS_PERCENT_STACKED_AXIS_SCALE;
        } else if (this._isDivergingChart()) {
            scale = chartConst.DIVERGING_PERCENT_STACKED_AXIS_SCALE;
        } else {
            scale = chartConst.DUAL_PERCENT_STACKED_AXIS_SCALE;
        }

        return scale;
    },

    /**
     * Make scale.
     * @returns {{limit: {min:number, max:number}, step: number}}
     * @private
     */
    _makeScale: function() {
        var scale;

        if (this._isPercentStackChart()) {
            scale = this._getPercentStackedScale();
        } else {
            scale = this._calculateScale();
        }

        return scale;
    }
});

module.exports = ScaleMaker;
