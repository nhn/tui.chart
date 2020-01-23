/**
 * @fileoverview scaleMaker calculates the limit and step into values of processed data and returns it.
 * @auth NHN.
 *       FE Development Lab <dl_javascript@nhn.com>
 */

import chartConst from '../../const';
import predicate from '../../helpers/predicate';
import calculator from '../../helpers/calculator';
import arrayUtil from '../../helpers/arrayUtil';
import coordinateScaleCalculator from './coordinateScaleCalculator.js';
import snippet from 'tui-code-snippet';

/**
 * scaleMaker calculates limit and step into values of processed data and returns it.
 * @module scaleDataMaker
 * @private */
const scaleDataMaker = {
  /**
   * Make limit for diverging option.
   * To balance diverging chart
   * compare absolute value of min, max. and find larger one
   * set min by making the value negative
   * @param {{min: number, max: number}} limit limit
   * @returns {{min: number, max: number}} changed limit
   * @private
   */
  _makeLimitForDivergingOption(limit) {
    const newMax = Math.max(Math.abs(limit.min), Math.abs(limit.max));

    return {
      min: -newMax,
      max: newMax
    };
  },
  /**
   * Adjust limit for bubble chart.
   * @param {{min: number, max: number}} limit - limit
   * @param {number} step - step;
   * @param {{min: boolean, max: boolean}} isOverflowed - overflow Item map
   * @returns {object} limit
   * @private
   */
  _adjustLimitForOverflow(limit, step, isOverflowed) {
    let { min, max } = limit;

    if (isOverflowed.min) {
      min = calculator.subtract(min, step);
    }

    if (isOverflowed.max) {
      max = calculator.add(max, step);
    }

    return {
      min,
      max
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
  _findDateType(dataLimit, count) {
    const diff = dataLimit.max - dataLimit.min;
    const { millisecondTypes, millisecondMap } = this;
    const lastTypeIndex = millisecondTypes.length - 1;
    let foundType;

    if (diff) {
      millisecondTypes.every((type, index) => {
        const millisecond = millisecondMap[type];
        const dividedCount = Math.floor(diff / millisecond);
        let foundIndex;

        if (dividedCount) {
          foundIndex =
            index < lastTypeIndex && dividedCount < 2 && dividedCount < count ? index + 1 : index;
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
  _makeDatetimeInfo(dataLimit, count) {
    const dateType = this._findDateType(dataLimit, count);
    const divisionNumber = this.millisecondMap[dateType];
    const minDate = calculator.divide(dataLimit.min, divisionNumber);
    const maxDate = calculator.divide(dataLimit.max, divisionNumber);
    const max = maxDate - minDate;

    return {
      divisionNumber,
      minDate,
      dataLimit: {
        min: 0,
        max
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
  _restoreScaleToDatetimeType(scale, minDate, divisionNumber) {
    const { limit } = scale;

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
  _getLimitSafely(baseValues) {
    const limit = {
      min: arrayUtil.min(baseValues),
      max: arrayUtil.max(baseValues)
    };

    if (baseValues.length === 1) {
      const [firstValue] = baseValues;

      if (firstValue > 0) {
        limit.min = 0;
      } else if (firstValue === 0) {
        limit.max = 10;
      } else {
        limit.max = 0;
      }
    } else if (limit.min === 0 && limit.max === 0) {
      limit.max = 10;
    } else if (limit.min === limit.max) {
      limit.min -= limit.min / 10;
      limit.max += limit.max / 10;
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
  _calculateDatetimeScale(baseValues, baseSize, isDiverging) {
    const datetimeInfo = this._makeDatetimeInfo(
      this._getLimitSafely(baseValues),
      baseValues.length
    );
    let limit = datetimeInfo.dataLimit;

    if (isDiverging) {
      limit = this._makeLimitForDivergingOption(limit);
    }

    let scale = coordinateScaleCalculator({
      min: limit.min,
      max: limit.max,
      offsetSize: baseSize,
      minimumStepSize: 1
    });

    scale = this._restoreScaleToDatetimeType(
      scale,
      datetimeInfo.minDate,
      datetimeInfo.divisionNumber
    );

    return scale;
  },

  /**
   * Calculate percent stackType scale.
   * @param {Array.<number>} baseValues - base values
   * @param {boolean} isDiverging - is diverging or not
   * @returns {{limit: {min:number, max:number}, step: number}}
   * @private
   */
  _calculatePercentStackedScale(baseValues, isDiverging) {
    let scale;

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
   * @param {object} makeScaleInfos - calculate scale infos
   *     @param {Array.<number>} makeScaleInfos.baseValues - base values
   *     @param {number} makeScaleInfos.baseSize - base size(width or height) for calculating scale data
   *     @param {object} makeScaleInfos.overflowItem - overflow item
   *     @param {boolean} makeScaleInfos.isDiverging - is diverging or not
   *     @param {strint} makeScaleInfos.chartType - chartType
   *     @param {object} makeScaleInfos.options - scale options
   *         @param {{min: ?number, max: ?number}} makeScaleInfos.options.limit - limit options
   * @returns {{limit: {min:number, max:number}, step: number}}
   * @private
   */
  _calculateCoordinateScale(makeScaleInfos) {
    const {
      options: { limitOption = {}, useSpectrumLegend },
      baseSize,
      overflowItem,
      chartType
    } = makeScaleInfos;
    const limit = this._getLimitSafely(makeScaleInfos.baseValues);
    const hasMinOption = snippet.isExisty(limitOption.min);
    const hasMaxOption = snippet.isExisty(limitOption.max);
    let { min, max } = limit;
    let isOverflowed;
    let { stepCount } = makeScaleInfos.options;

    if (hasMinOption) {
      ({ min } = limitOption);
      stepCount = null;
    }

    if (hasMaxOption) {
      ({ max } = limitOption);
      stepCount = null;
    }

    const scaleData = coordinateScaleCalculator({
      min,
      max,
      stepCount,
      offsetSize: baseSize
    });

    if (!useSpectrumLegend) {
      isOverflowed = this._isOverflowed(overflowItem, scaleData, limit, hasMinOption, hasMaxOption);
    }

    if (isOverflowed && !predicate.isMapTypeChart(chartType)) {
      scaleData.limit = this._adjustLimitForOverflow(scaleData.limit, scaleData.step, isOverflowed);
    }

    if (makeScaleInfos.isDiverging) {
      scaleData.limit = this._makeLimitForDivergingOption(scaleData.limit);
    }

    return scaleData;
  },

  _isOverflowed(overflowItem, scaleData, limit, hasMinOption, hasMaxOption) {
    const isBubbleMinOverflowed = !!(overflowItem && overflowItem.minItem);
    const isBubbleMaxOverflowed = !!(overflowItem && overflowItem.maxItem);
    const scaleDataLimit = scaleData.limit;
    const isOverflowedMin =
      isBubbleMinOverflowed ||
      (!hasMinOption && scaleDataLimit.min === limit.min && scaleDataLimit.min !== 0);
    const isOverflowedMax =
      isBubbleMaxOverflowed ||
      (!hasMaxOption && scaleDataLimit.max === limit.max && scaleDataLimit.max !== 0);

    if (!isOverflowedMin && !isOverflowedMax) {
      return null;
    }

    return {
      min: isOverflowedMin,
      max: isOverflowedMax
    };
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
  makeScaleData(baseValues, baseSize, chartType, options) {
    let scaleData;
    const isDiverging = predicate.isDivergingChart(chartType, options.diverging);
    const { overflowItem } = options;

    if (predicate.isPercentStackChart(chartType, options.stackType)) {
      scaleData = this._calculatePercentStackedScale(baseValues, isDiverging);
    } else if (predicate.isDatetimeType(options.type)) {
      scaleData = this._calculateDatetimeScale(baseValues, baseSize, isDiverging);
    } else {
      if (predicate.isRadialChart(chartType)) {
        options.stepCount = Math.floor(baseSize / 100);
      }

      scaleData = this._calculateCoordinateScale({
        baseValues,
        baseSize,
        overflowItem,
        isDiverging,
        chartType,
        options
      });
    }

    return scaleData;
  }
};

export default scaleDataMaker;
