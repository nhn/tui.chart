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
var arrayUtil = require('../../helpers/arrayUtil');
var coordinateScaleCalculator = require('./coordinateScaleCalculator.js');

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
     * Calculate date time scale.
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
    _calculateDatetimeScale: function(baseValues, baseSize, chartType, options) {
        var dataLimit = {
            min: arrayUtil.min(baseValues),
            max: arrayUtil.max(baseValues)
        };
        var datetimeInfo, scale;

        datetimeInfo = this._makeDatetimeInfo(dataLimit, baseValues.length);
        dataLimit = datetimeInfo.dataLimit;

        if (dataLimit.min === 0 && dataLimit.max === 0) {
            dataLimit.max = 5;
        }

        if (predicate.isDivergingChart(chartType, options.diverging)) {
            dataLimit = this._makeLimitForDivergingOption(dataLimit);
        }

        scale = coordinateScaleCalculator({
            min: dataLimit.min,
            max: dataLimit.max,
            offsetSize: baseSize
        });

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
    _calculatePercentStackedScale: function(baseValues, chartType, diverging) {
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

    _calculateCoordinateScale: function(baseValues, baseSize, overflowItem, isDiverging) {
        var scaleData = coordinateScaleCalculator({
            min: arrayUtil.min(baseValues),
            max: arrayUtil.max(baseValues),
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

        if (predicate.isPercentStackChart(chartType, options.stackType)) {
            scaleData = this._calculatePercentStackedScale(baseValues, chartType, options.diverging);
        } else if (predicate.isDatetimeType(options.type)) {
            scaleData = this._calculateDatetimeScale(baseValues, baseSize, chartType, options);
        } else {
            scaleData = this._calculateCoordinateScale(baseValues, baseSize, options.overflowItem,
                                                       predicate.isDivergingChart(chartType, options.diverging));
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
