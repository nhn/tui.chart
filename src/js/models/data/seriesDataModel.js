/**
 * @fileoverview SeriesDataModel is base model for drawing graph of chart series area,
 *                  and create from rawSeriesData by user,
 * SeriesDataModel.groups has SeriesGroups.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

/*
 * Raw series datum.
 * @typedef {{name: ?string, data: Array.<number>, stack: ?string}} rawSeriesDatum
 */

/*
 * Raw series data.
 * @typedef {Array.<rawSeriesDatum>} rawSeriesData
 */

/*
 * Groups.
 * @typedef {Array.<SeriesGroup>} groups
 */

/*
 * SeriesGroup is a element of SeriesDataModel.groups.
 * SeriesGroup.items has SeriesItem.
 */

/*
 * SeriesItem is a element of SeriesGroup.items.
 * SeriesItem has processed terminal data like value, ratio, etc.
 */

import SeriesGroup from './seriesGroup';
import SeriesItem from './seriesItem';
import SeriesItemForCoordinateType from './seriesItemForCoordinateType';
import predicate from '../../helpers/predicate';
import calculator from '../../helpers/calculator';
import arrayUtil from '../../helpers/arrayUtil';
import snippet from 'tui-code-snippet';

const { concat } = Array.prototype;

class SeriesDataModel {
  /**
   * SeriesDataModel is base model for drawing graph of chart series area,
   *      and create from rawSeriesData by user.
   * SeriesDataModel.groups has SeriesGroups.
   * @constructs SeriesDataModel
   * @private
   * @param {rawSeriesData} rawSeriesData - raw series data
   * @param {string} chartType - chart type
   * @param {object} options - options
   * @param {Array.<function>} formatFunctions - format functions
   * @param {boolean} isCoordinateType - whether coordinate type or not
   * @private
   */
  constructor(rawSeriesData, chartType, options, formatFunctions, isCoordinateType) {
    /**
     * chart type
     * @type {string}
     */
    this.chartType = chartType;

    /**
     * chart options
     * @type {Object}
     */
    this.options = options || {};

    /**
     * functions for formatting
     * @type {Array.<function>}
     */
    this.formatFunctions = formatFunctions;

    /**
     * rawData.series
     * @type {rawSeriesData}
     */
    this.rawSeriesData = rawSeriesData || [];

    /**
     * whether coordinate type or not
     * @type {boolean}
     */
    this.isCoordinateType = isCoordinateType;

    /**
     * baseGroups is base data for making SeriesGroups.
     * SeriesGroups is made by pivoted baseGroups, lf line type chart.
     * @type {Array.Array<SeriesItem>}
     */
    this.baseGroups = null;

    /**
     * groups has SeriesGroups.
     * @type {Array.<SeriesGroup>}
     */
    this.groups = null;

    this.options.series = this.options.series || {};

    /**
     * whether diverging chart or not.
     * @type {boolean}
     */
    this.isDivergingChart = predicate.isDivergingChart(chartType, this.options.series.diverging);

    /**
     * map of values by value type like value, x, y, r.
     * @type {object.<string, Array.<number>>}
     */
    this.valuesMap = {};

    this._removeRangeValue();
  }

  /**
   * Remove range value of item, if has stackType option.
   * @private
   */
  _removeRangeValue() {
    const seriesOption = snippet.pick(this.options, 'series') || {};
    const allowRange =
      predicate.isAllowRangeData(this.chartType) &&
      !predicate.isValidStackOption(seriesOption.stackType) &&
      !seriesOption.spline;

    if (allowRange || this.isCoordinateType) {
      return;
    }

    Object.values(this.rawSeriesData).forEach(rawItem => {
      if (!snippet.isArray(rawItem.data)) {
        return;
      }
      rawItem.data.forEach((value, index) => {
        if (snippet.isExisty(value)) {
          [rawItem.data[index]] = concat.apply(value);
        }
      });
    });
  }

  /**
   * Create base groups.
   * Base groups is two-dimensional array by seriesItems.
   * @returns {Array.<Array.<(SeriesItem | SeriesItemForCoordinateType)>>}
   * @private
   */
  _createBaseGroups() {
    const { chartType, formatFunctions, isDivergingChart, isCoordinateType } = this;
    const xAxisOption = this.options.xAxis;
    const isPieChart = predicate.isPieChart(this.chartType);
    const hasRawDatumAsArray =
      predicate.isHeatmapChart(this.chartType) || predicate.isTreemapChart(this.chartType);
    let sortValues, SeriesItemClass;

    if (isCoordinateType) {
      SeriesItemClass = SeriesItemForCoordinateType;
      sortValues = function(items) {
        items.sort((a, b) => a.x - b.x);
      };
    } else {
      SeriesItemClass = SeriesItem;
      sortValues = function() {};
    }

    return this.rawSeriesData.map(rawDatum => {
      let stack, data, legendName;

      data = snippet.isArray(rawDatum) ? rawDatum : [].concat(rawDatum.data);

      if (!hasRawDatumAsArray) {
        ({ stack } = rawDatum);
      }
      if (rawDatum.name) {
        legendName = rawDatum.name;
      }

      if (isCoordinateType || isPieChart) {
        data = snippet.filter(data, snippet.isExisty);
      }

      const items = data.map(
        (datum, index) =>
          new SeriesItemClass({
            datum,
            chartType,
            formatFunctions,
            index,
            legendName,
            stack,
            isDivergingChart,
            xAxisType: xAxisOption.type,
            dateFormat: xAxisOption.dateFormat
          })
      );
      sortValues(items);

      return items;
    });
  }

  /**
   * Get base groups.
   * @returns {Array.Array.<SeriesItem>}
   * @private
   */
  _getBaseGroups() {
    if (!this.baseGroups) {
      this.baseGroups = this._createBaseGroups();
    }

    return this.baseGroups;
  }

  /**
   * Create SeriesGroups from rawData.series.
   * @param {boolean} isPivot - whether pivot or not.
   * @returns {Array.<SeriesGroup>}
   * @private
   */
  _createSeriesGroupsFromRawData(isPivot) {
    let baseGroups = this._getBaseGroups();

    if (isPivot) {
      baseGroups = arrayUtil.pivot(baseGroups);
    }

    return baseGroups.map(items => new SeriesGroup(items));
  }

  /**
   * Get SeriesGroups.
   * @returns {(Array.<SeriesGroup>|object)}
   * @private
   */
  _getSeriesGroups() {
    if (!this.groups) {
      this.groups = this._createSeriesGroupsFromRawData(true);
    }

    return this.groups;
  }

  /**
   * Get group count.
   * @returns {Number}
   */
  getGroupCount() {
    return this._getSeriesGroups().length;
  }

  /**
   * Get pivot groups.
   * @returns {(Array.<SeriesGroup>|object)}
   */
  _getPivotGroups() {
    if (!this.pivotGroups) {
      this.pivotGroups = this._createSeriesGroupsFromRawData();
    }

    return this.pivotGroups;
  }

  /**
   * Get SeriesGroup.
   * @param {number} index - index
   * @param {boolean} [isPivot] - whether pivot or not
   * @returns {SeriesGroup}
   */
  getSeriesGroup(index, isPivot) {
    return isPivot ? this._getPivotGroups()[index] : this._getSeriesGroups()[index];
  }

  /**
   * Get first SeriesGroup.
   * @param {boolean} [isPivot] - whether pivot or not
   * @returns {SeriesGroup}
   */
  getFirstSeriesGroup(isPivot) {
    return this.getSeriesGroup(0, isPivot);
  }

  /**
   * Get first label of SeriesItem.
   * @returns {string} formatted value
   */
  getFirstItemLabel() {
    return this.getFirstSeriesGroup().getFirstSeriesItem().label;
  }

  /**
   * Get series item.
   * @param {number} groupIndex - index of series groups
   * @param {number} index - index of series items
   * @param {boolean} [isPivot] - whether pivot or not
   * @returns {SeriesItem}
   */
  getSeriesItem(groupIndex, index, isPivot) {
    return this.getSeriesGroup(groupIndex, isPivot).getSeriesItem(index);
  }

  /**
   * Get first series item.
   * @returns {SeriesItem}
   */
  getFirstSeriesItem() {
    return this.getSeriesItem(0, 0);
  }

  /**
   * Get value.
   * @param {number} groupIndex - index of series groups
   * @param {number} index - index of series items
   * @returns {number} value
   */
  getValue(groupIndex, index) {
    return this.getSeriesItem(groupIndex, index).value;
  }

  /**
   * Get minimum value.
   * @param {string} valueType - value type like value, x, y, r.
   * @returns {number}
   */
  getMinValue(valueType) {
    return arrayUtil.min(this.getValues(valueType));
  }

  /**
   * Get maximum value.
   * @param {string} valueType - value type like value, x, y, r.
   * @returns {number}
   */
  getMaxValue(valueType) {
    return arrayUtil.max(this.getValues(valueType));
  }

  /**
   * Traverse seriesGroups, and returns to found SeriesItem by result of execution seriesGroup.find with condition.
   * @param {function} condition - condition function
   * @returns {SeriesItem}
   * @private
   */
  _findSeriesItem(condition) {
    let foundItem;

    this.each(seriesGroup => {
      foundItem = seriesGroup.find(condition);

      return !foundItem;
    });

    return foundItem;
  }

  /**
   * Find SeriesItem by value.
   * @param {string} valueType - value type like value, x, y, r.
   * @param {number} value - comparing value
   * @param {function} condition - condition function
   * @returns {SeriesItem}
   * @private
   */
  _findSeriesItemByValue(valueType, value, condition) {
    condition =
      condition ||
      function() {
        return null;
      };

    return this._findSeriesItem(
      seriesItem => seriesItem && seriesItem[valueType] === value && condition(seriesItem)
    );
  }

  /**
   * Find minimum SeriesItem.
   * @param {string} valueType - value type like value, x, y, r.
   * @param {function} condition - condition function
   * @returns {SeriesItem}
   */
  findMinSeriesItem(valueType, condition) {
    const minValue = this.getMinValue(valueType);

    return this._findSeriesItemByValue(valueType, minValue, condition);
  }

  /**
   * Find maximum SeriesItem.
   * @param {string} valueType - value type like value, x, y, r.
   * @param {function} condition - condition function
   * @returns {*|SeriesItem}
   */
  findMaxSeriesItem(valueType, condition) {
    const maxValue = this.getMaxValue(valueType);

    return this._findSeriesItemByValue(valueType, maxValue, condition);
  }

  /**
   * Create values that picked value from SeriesItems of SeriesGroups.
   * @param {?string} valueType - type of value
   * @returns {Array.<number>}
   * @private
   */
  _createValues(valueType) {
    let values = this.map(seriesGroup => seriesGroup.getValues(valueType));

    values = [].concat(...values);

    return values.filter(value => !isNaN(value));
  }

  /**
   * Get values form valuesMap.
   * @param {?string} valueType - type of value
   * @returns {Array.<number>}
   */
  getValues(valueType = 'value') {
    if (!this.valuesMap[valueType]) {
      this.valuesMap[valueType] = this._createValues(valueType);
    }

    return this.valuesMap[valueType];
  }

  /**
   * Whether count of x values greater than count of y values.
   * @returns {boolean}
   */
  isXCountGreaterThanYCount() {
    return this.getValues('x').length > this.getValues('y').length;
  }

  /**
   * Add ratios, when has normal stackType option.
   * @param {{min: number, max: number}} limit - axis limit
   * @private
   */
  _addRatiosWhenNormalStacked(limit) {
    const distance = Math.abs(limit.max - limit.min);

    this.each(seriesGroup => {
      seriesGroup.addRatios(distance);
    });
  }

  /**
   * Calculate base ratio for calculating ratio of item.
   * @returns {number}
   * @private
   */
  _calculateBaseRatio() {
    const values = this.getValues();
    const plusSum = calculator.sumPlusValues(values);
    const minusSum = Math.abs(calculator.sumMinusValues(values));
    const ratio = plusSum > 0 && minusSum > 0 ? 0.5 : 1;

    return ratio;
  }

  /**
   * Add ratios, when has percent stackType option.
   * @private
   */
  _addRatiosWhenPercentStacked() {
    const baseRatio = this._calculateBaseRatio();

    this.each(seriesGroup => {
      seriesGroup.addRatiosWhenPercentStacked(baseRatio);
    });
  }

  /**
   * Add ratios, when has diverging stackType option.
   * @private
   */
  _addRatiosWhenDivergingStacked() {
    this.each(seriesGroup => {
      const values = seriesGroup.pluck('value');
      const plusSum = calculator.sumPlusValues(values);
      const minusSum = Math.abs(calculator.sumMinusValues(values));

      seriesGroup.addRatiosWhenDivergingStacked(plusSum, minusSum);
    });
  }

  /**
   * Make subtraction value for making ratio of no option chart.
   * @param {{min: number, max: number}} limit - limit
   * @returns {number}
   * @private
   */
  _makeSubtractionValue(limit) {
    const allowMinusPointRender = predicate.allowMinusPointRender(this.chartType);
    let subValue = 0;

    if (!allowMinusPointRender && predicate.isMinusLimit(limit)) {
      subValue = limit.max;
    } else if (allowMinusPointRender || limit.min >= 0) {
      subValue = limit.min;
    }

    return subValue;
  }

  /**
   * Add ratios, when has not option.
   * @param {{min: number, max: number}} limit - axis limit
   * @private
   */
  _addRatios(limit) {
    const distance = Math.abs(limit.max - limit.min);
    const subValue = this._makeSubtractionValue(limit);

    this.each(seriesGroup => {
      seriesGroup.addRatios(distance, subValue);
    });
  }

  /**
   * Add data ratios.
   * @param {{min: number, max: number}} limit - axis limit
   * @param {string} stackType - stackType option
   * @private
   */
  addDataRatios(limit, stackType) {
    const isAllowedStackOption = predicate.isAllowedStackOption(this.chartType);

    if (isAllowedStackOption && predicate.isNormalStack(stackType)) {
      this._addRatiosWhenNormalStacked(limit);
    } else if (isAllowedStackOption && predicate.isPercentStack(stackType)) {
      if (this.isDivergingChart) {
        this._addRatiosWhenDivergingStacked();
      } else {
        this._addRatiosWhenPercentStacked();
      }
    } else {
      this._addRatios(limit);
    }
  }

  /**
   * Add data ratios of pie chart.
   */
  addDataRatiosOfPieChart() {
    this.each(seriesGroup => {
      const sum = calculator.sum(seriesGroup.pluck('value'));

      seriesGroup.addRatios(sum);
    });
  }

  /**
   * Add ratios of data for chart of coordinate type.
   * @param {{x: {min: number, max: number}, y: {min: number, max: number}}} limitMap - limit map
   * @param {boolean} [hasRadius] - whether has radius or not
   */
  addDataRatiosForCoordinateType(limitMap, hasRadius) {
    const xLimit = limitMap.xAxis;
    const yLimit = limitMap.yAxis;
    const maxRadius = hasRadius ? arrayUtil.max(this.getValues('r')) : 0;
    let xDistance, xSubValue, yDistance, ySubValue;

    if (xLimit) {
      xDistance = Math.abs(xLimit.max - xLimit.min);
      xSubValue = this._makeSubtractionValue(xLimit);
    }

    if (yLimit) {
      yDistance = Math.abs(yLimit.max - yLimit.min);
      ySubValue = this._makeSubtractionValue(yLimit);
    }

    this.each(seriesGroup => {
      seriesGroup.each(item => {
        if (!item) {
          return;
        }

        item.addRatio('x', xDistance, xSubValue);
        item.addRatio('y', yDistance, ySubValue);
        item.addRatio('r', maxRadius, 0);

        if (snippet.isExisty(item.start)) {
          item.addRatio('start', yDistance, ySubValue);
        }
      });
    });
  }

  /**
   * Add start to all series item.
   * @param {number} start - start value
   */
  addStartValueToAllSeriesItem(start) {
    this.each(seriesGroup => {
      seriesGroup.addStartValueToAllSeriesItem(start);
    });
  }

  /**
   * Whether has range data or not.
   * @returns {boolean}
   */
  hasRangeData() {
    let hasRangeData = false;

    this.each(seriesGroup => {
      hasRangeData = seriesGroup.hasRangeData();

      return !hasRangeData;
    });

    return hasRangeData;
  }

  /**
   * Traverse groups, and executes iteratee function.
   * @param {function} iteratee - iteratee function
   * @param {boolean} isPivot - whether pivot or not
   */
  each(iteratee, isPivot) {
    const groups = isPivot ? this._getPivotGroups() : this._getSeriesGroups();

    groups.forEach((seriesGroup, index) => iteratee(seriesGroup, index));
  }

  /**
   * Traverse groups, and returns to result of execution about iteratee function.
   * @param {function} iteratee - iteratee function
   * @param {boolean} isPivot - whether pivot or not
   * @returns {Array}
   */
  map(iteratee, isPivot) {
    const results = [];

    this.each((seriesGroup, index) => {
      results.push(iteratee(seriesGroup, index));
    }, isPivot);

    return results;
  }
}

export default SeriesDataModel;
