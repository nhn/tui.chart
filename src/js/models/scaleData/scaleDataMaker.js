/**
 * @fileoverview scaleMaker calculates the limit and step into values of processed data and returns it.
 * @auth NHN Ent.
 *       FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../../const');
var predicate = require('../../helpers/predicate');
var calculator = require('../../helpers/calculator');
var arrayUtil = require('../../helpers/arrayUtil');
var coordinateScaleCalculator = require('./coordinateScaleCalculator.js');
var snippet = require('tui-code-snippet');

var abs = Math.abs;

/**
 * scaleMaker calculates limit and step into values of processed data and returns it.
 * @module scaleDataMaker
 * @private */
var scaleDataMaker = {
    /**
     * Make limit for diverging option.
     * 다이버징 차트에서는 min, max의 값을 절대값으로 최대치로 동일하게하고
     * 한쪽만 음수로 처리해서 양쪽의 균형이 맞게 한다.
     * 이렇게 하지 않으면 중심이 한쪽으로 쏠려있다.
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
     * Adjust limit for bubble chart.
     * @param {{min: number, max: number}} limit - limit
     * @param {number} step - step;
     * @param {object.<string, object>} overflowItem - overflow Item map
     * @returns {object} limit
     * @private
     */
    _adjustLimitForBubbleChart: function(limit, step, overflowItem) {
        var min = limit.min;
        var max = limit.max;

        if (overflowItem.minItem) {
            min -= step;
        }

        if (overflowItem.maxItem) {
            max += step;
        }

        return {
            min: min,
            max: max
        };
    },

    /**
     * millisecond map
     */
    millisecondMap: {
        year: 31536000000,
        month: 2678400000,
        week: 604800000,
        date: 86400000,
        hour: 3600000,
        minute: 60000,
        second: 1000
    },

    /**
     * millisecond types
     */
    millisecondTypes: ['year', 'month', 'week', 'date', 'hour', 'minute', 'second'],

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
            snippet.forEachArray(millisecondTypes, function(type, index) {
                var millisecond = millisecondMap[type];
                var dividedCount = Math.floor(diff / millisecond);
                var foundIndex;

                if (dividedCount) {
                    foundIndex = index < lastTypeIndex && dividedCount < 2 && dividedCount < count ? index + 1 : index;
                    foundType = millisecondTypes[foundIndex];
                }

                return !snippet.isExisty(foundIndex);
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
        var minDate = calculator.divide(dataLimit.min, divisionNumber);
        var maxDate = calculator.divide(dataLimit.max, divisionNumber);
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

        scale.step = calculator.multiply(scale.step, divisionNumber);
        limit.min = calculator.multiply(calculator.add(limit.min, minDate), divisionNumber);
        limit.max = calculator.multiply(calculator.add(limit.max, minDate), divisionNumber);

        return scale;
    },

    /**
     * Get limit values safely by limit values are both Zero then set max value to 10 temporary.
     * @param {Array} baseValues base values
     * @returns {{min: number, max: number}}
     */
    _getLimitSafely: function(baseValues) {
        var limit = {
            min: arrayUtil.min(baseValues),
            max: arrayUtil.max(baseValues)
        };
        var firstValue;

        if (baseValues.length === 1) {
            firstValue = baseValues[0];

            if (firstValue > 0) {
                limit.min = 0;
            } else {
                limit.max = 0;
            }
        } else if (limit.min === 0 && limit.max === 0) {
            limit.max = 10;
        } else if (limit.min === limit.max) {
            limit.min -= (limit.min / 10);
            limit.max += (limit.max / 10);
        }

        return limit;
    },

    /**
     * Calculate date time scale.
     * @param {Array.<number>} baseValues - base values for calculating scale data
     * @param {number} baseSize - base size(width or height) for calculating scale data
     * @param {boolean} isDiverging - is diverging or not
     * @returns {{limit: {min: number, max: number}, step: number}}
     * @private
     */
    _calculateDatetimeScale: function(baseValues, baseSize, isDiverging) {
        var datetimeInfo, scale, limit;

        datetimeInfo = this._makeDatetimeInfo(this._getLimitSafely(baseValues), baseValues.length);

        limit = datetimeInfo.dataLimit;

        if (isDiverging) {
            limit = this._makeLimitForDivergingOption(limit);
        }

        scale = coordinateScaleCalculator({
            min: limit.min,
            max: limit.max,
            offsetSize: baseSize,
            minimumStepSize: 1
        });

        scale = this._restoreScaleToDatetimeType(scale, datetimeInfo.minDate, datetimeInfo.divisionNumber);

        return scale;
    },

    /**
     * Calculate percent stackType scale.
     * @param {Array.<number>} baseValues - base values
     * @param {boolean} isDiverging - is diverging or not
     * @returns {{limit: {min:number, max:number}, step: number}}
     * @private
     */
    _calculatePercentStackedScale: function(baseValues, isDiverging) {
        var scale;

        if (calculator.sumMinusValues(baseValues) === 0) {
            scale = chartConst.PERCENT_STACKED_AXIS_SCALE;
        } else if (calculator.sumPlusValues(baseValues) === 0) {
            scale = chartConst.MINUS_PERCENT_STACKED_AXIS_SCALE;
        } else if (isDiverging) {
            scale = chartConst.DIVERGING_PERCENT_STACKED_AXIS_SCALE;
        } else {
            scale = chartConst.DUAL_PERCENT_STACKED_AXIS_SCALE;
        }

        return scale;
    },

    /**
     * Calculate coordinate scale.
     * @param {Array.<number>} baseValues - base values
     * @param {number} baseSize - base size(width or height) for calculating scale data
     * @param {object} overflowItem - overflow item
     * @param {boolean} isDiverging - is diverging or not
     * @param {object} options - scale options
     * @param {{min: ?number, max: ?number}} options.limit - limit options
     * @returns {{limit: {min:number, max:number}, step: number}}
     * @private
     */
    _calculateCoordinateScale: function(baseValues, baseSize, overflowItem, isDiverging, options) {
        var limit = this._getLimitSafely(baseValues);
        var limitOption = options.limitOption;
        var stepCount = options.stepCount;
        var min = limit.min;
        var max = limit.max;
        var scaleData;

        if (limitOption && (limitOption.min || limitOption.max)) {
            stepCount = null;
            min = snippet.isExisty(limitOption.min) ? limitOption.min : min;
            max = snippet.isExisty(limitOption.max) ? limitOption.max : max;
        }

        scaleData = coordinateScaleCalculator({
            min: min,
            max: max,
            stepCount: stepCount,
            offsetSize: baseSize
        });

        if (overflowItem) {
            scaleData.limit = this._adjustLimitForBubbleChart(scaleData.limit, scaleData.step, overflowItem);
        } else if (isDiverging) {
            scaleData.limit = this._makeLimitForDivergingOption(scaleData.limit);
        }

        return scaleData;
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
     * @returns {{limit: {min:number, max:number}, step: number, stepCount: number}}
     */
    makeScaleData: function(baseValues, baseSize, chartType, options) {
        var scaleData;
        var isDiverging = predicate.isDivergingChart(chartType, options.diverging);
        var overflowItem = options.overflowItem;

        if (predicate.isPercentStackChart(chartType, options.stackType)) {
            scaleData = this._calculatePercentStackedScale(baseValues, isDiverging);
        } else if (predicate.isDatetimeType(options.type)) {
            scaleData = this._calculateDatetimeScale(baseValues, baseSize, isDiverging);
        } else {
            if (predicate.isRadialChart(chartType)) {
                options.stepCount = Math.floor(baseSize / 100);
            }

            scaleData = this._calculateCoordinateScale(baseValues, baseSize, overflowItem, isDiverging, options);
        }

        return scaleData;
    }
};

module.exports = scaleDataMaker;
