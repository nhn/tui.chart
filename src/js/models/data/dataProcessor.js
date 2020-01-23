/**
 * @fileoverview DataProcessor process rawData.
 * rawData.categories --> categories
 * rawData.series --> SeriesDataModel, legendLabels, legendData
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import chartConst from '../../const';
import DataProcessorBase from './dataProcessorBase';

import SeriesDataModel from '../data/seriesDataModel';
import SeriesDataModelForBoxplot from '../data/seriesDataModelForBoxplot';
import SeriesDataModelForBullet from '../data/seriesDataModelForBullet';
import SeriesDataModelForTreemap from '../data/seriesDataModelForTreemap';
import SeriesGroup from './seriesGroup';
import rawDataHandler from '../../models/data/rawDataHandler';
import predicate from '../../helpers/predicate';
import renderUtil from '../../helpers/renderUtil';
import calculator from '../../helpers/calculator';
import objectUtil from '../../helpers/objectUtil';
import snippet from 'tui-code-snippet';

const { isUndefined } = snippet;

/*
 * Raw series datum.
 * @typedef {{name: ?string, data: Array.<number>, stack: ?string}} rawSeriesDatum
 */

/*
 * Raw series data.
 * @typedef {Array.<rawSeriesDatum>} rawSeriesData
 */

/*
 * Raw data by user.
 * @typedef {{
 *      categories: ?Array.<string>,
 *      series: (rawSeriesData|{line: ?rawSeriesData, column: ?rawSeriesData})
 * }} rawData
 */

/*
 * SeriesDataModel is base model for drawing graph of chart series area,
 *      and create from rawSeriesData by user,
 * SeriesDataModel.groups has SeriesGroups.
 */

/*
 * SeriesGroup is a element of SeriesDataModel.groups.
 * SeriesGroup.items has SeriesItem.
 */

class DataProcessor extends DataProcessorBase {
  /**
   * Data processor.
   * @constructs DataProcessor
   * @private
   * @param {rawData} rawData raw data
   * @param {string} chartType chart type
   * @param {object} options options
   * @param {Array.<string>} seriesTypes chart types
   */
  constructor(rawData, chartType, options, seriesTypes) {
    super();
    /**
     * original raw data.
     * @type {{categories: ?Array.<string>, series: Array.<object>}}
     */
    this.originalRawData = objectUtil.deepCopy(rawData);

    /**
     * chart type
     * @type {string}
     */
    this.chartType = chartType;

    /**
     * chart options
     * @type {Object}
     */
    this.options = options;

    /**
     * seriesTypes is sorted chart types for rendering series area of combo chart.
     * @type {Array.<string>}
     */
    this.seriesTypes = seriesTypes;

    /**
     * legend data for rendering legend of group tooltip
     * @type {Array.<{chartType: string, label: string}>}
     */
    this.originalLegendData = null;

    /**
     * select legend index
     * @type {number}
     */
    this.selectLegendIndex = null;

    /**
     * dynamic data array for adding data.
     * @type {Array.<{category: string | number, values: Array.<number>}>}
     */
    this.dynamicData = [];

    this.defaultValues = [0, 500];

    this.initData(rawData);
    this.initZoomedRawData();
    this.baseInit();

    if (this.isLineCoordinateType()) {
      this.integratedXAxisData = this._integrateXAxisData();
    }
  }

  /**
   * make integrated X Axis Data for coordinate chart
   * @returns {array} integratedXAxisData
   */
  _integrateXAxisData() {
    const seriesData = this.rawData.series.line;
    const options = this.options.xAxis || {};
    let integratedXAxisData = [];
    let isDateTime = false;

    if (snippet.isArray(options)) {
      isDateTime = options.filter(option => option.type && predicate.isDatetimeType(option.type));
    } else {
      isDateTime = options.type && predicate.isDatetimeType(options.type);
    }

    seriesData.forEach(seriesDatum => {
      seriesDatum.data.forEach(data => {
        integratedXAxisData.push(data[0]);
      });
    });

    integratedXAxisData = [...new Set(integratedXAxisData)];

    if (isDateTime) {
      integratedXAxisData = integratedXAxisData.map(data => new Date(data));
    }

    return integratedXAxisData.sort((a, b) => a - b);
  }

  /**
   * Get original raw data.
   * @returns {rawData} raw data
   */
  getOriginalRawData() {
    return objectUtil.deepCopy(this.originalRawData);
  }

  /**
   * Get current data.
   * @returns {*|null}
   */
  getCurrentData() {
    let { zoomedRawData } = this;

    if (zoomedRawData) {
      zoomedRawData = objectUtil.deepCopy(zoomedRawData);
    } else {
      zoomedRawData = this.getOriginalRawData();
    }

    return zoomedRawData;
  }

  /**
   * Filter seriesData by index range.
   * @param {Array.<{data: Array}>} seriesData - series data
   * @param {number} startIndex - start index
   * @param {number} endIndex - end index
   * @returns {Array.<Array.<object>>}
   * @private
   */
  _filterSeriesDataByIndexRange(seriesData, startIndex, endIndex) {
    const series = [...seriesData];

    series.forEach(seriesDatum => {
      seriesDatum.data = seriesDatum.data.slice(startIndex, endIndex + 1);
    });

    return series;
  }

  /**
   * Filter raw data by index range.
   * @param {{series: Array.<object>, categories: Array.<string>}} rawData - raw data
   * @param {Array.<number>} indexRange - index range for zoom
   * @returns {*}
   * @private
   */
  _filterRawDataByIndexRange(rawData, indexRange) {
    const [startIndex, endIndex] = indexRange;
    const data = Object.assign({}, rawData);

    Object.entries(data.series).forEach(([seriesType, seriesDataSet]) => {
      data.series[seriesType] = this._filterSeriesDataByIndexRange(
        seriesDataSet,
        startIndex,
        endIndex
      );
    });

    if (data.categories) {
      data.categories = data.categories.slice(startIndex, endIndex + 1);
    }

    return data;
  }

  /**
   * Filter seriesData by value.
   * @param {Array.<{data: Array}>} seriesData - series data
   * @param {number} minValue - minimum value
   * @param {number} maxValue - maximum value
   * @returns {Array.<Array.<object>>}
   * @private
   */
  _filterSeriesDataByValue(seriesData, minValue, maxValue) {
    const isDatetime = predicate.isDatetimeType(this.options.xAxis.type);
    const series = [...seriesData];

    series.forEach(seriesDatum => {
      seriesDatum.data = seriesDatum.data.filter(data => {
        const xAxisValue = isDatetime ? new Date(data[0]) : data[0];

        return xAxisValue >= minValue && xAxisValue <= maxValue;
      });
    });

    return series;
  }

  /**
   * Filter raw data by value.
   * @param {{series: Array.<object>, categories: Array.<string>}} rawData - raw data
   * @param {Array.<number>} valueRange - value range for zoom
   * @returns {*}
   * @private
   */
  _filterRawDataByValue(rawData, valueRange) {
    const [minValue, maxValue] = valueRange;
    const data = Object.assign({}, rawData);

    Object.entries(data.series).forEach(([seriesType, seriesDataSet]) => {
      data.series[seriesType] = this._filterSeriesDataByValue(seriesDataSet, minValue, maxValue);
    });

    return data;
  }

  /**
   * Update raw data for zoom
   * @param {Array.<number>} range - index or value range for zoom
   */
  updateRawDataForZoom(range) {
    const currentData = this.getCurrentData();
    let rawData = this.getRawData();

    const getZoomedRawData = this.isLineCoordinateType()
      ? this._filterRawDataByValue.bind(this)
      : this._filterRawDataByIndexRange.bind(this);

    this.zoomedRawData = getZoomedRawData(currentData, range);
    rawData = getZoomedRawData(rawData, range);

    this.initData(rawData);
  }

  /**
   * Init zoomed raw data.
   */
  initZoomedRawData() {
    this.zoomedRawData = null;
  }

  /**
   * Initialize data.
   * @param {rawData} rawData raw data
   * @param {boolean} originalChange whether the original has changed
   */
  initData(rawData, originalChange = false) {
    /**
     * raw data
     * @type {rawData}
     */
    this.rawData = rawData;

    if (originalChange) {
      this.originalRawData = objectUtil.deepCopy(rawData);
      this.originalLegendData = null;
    }

    /**
     * categoriesMap
     * @type {null|object}
     */
    this.categoriesMap = null;

    /**
     * categories isDatetype true or false
     * @type {null|object}
     */
    this.categoriesIsDateTime = {};

    /**
     * stacks
     * @type {Array.<number>}
     */
    this.stacks = null;

    /**
     * seriesDataModel map
     * @type {object.<string, SeriesDataModel>}
     */
    this.seriesDataModelMap = {};

    /**
     * legendVisiblities
     * @type {{column: Array.<string>, line: Array.<string> | Array.<string>}}
     */
    this.legendVisibilities = null;

    /**
     * zoomed raw data
     * @type {object} zoomed raw data
     */
    this.zoomedRawData = null;

    /**
     * SeriesGroups
     * @type {Array.<SeriesGroup>}
     */
    this.seriesGroups = null;

    /**
     * map of values of SeriesItems
     * @type {Object.<string, Array.<number>>}
     */
    this.valuesMap = {};

    /**
     * legend labels for rendering legend area
     * @type {{column: Array.<string>, line: Array.<string> | Array.<string>}}
     */
    this.legendLabels = null;

    /**
     * legend data for rendering legend
     * @type {Array.<{chartType: string, label: string}>}
     */
    this.legendData = null;

    /**
     * multiline categories
     * @type {Array.<string>}
     */
    this.multilineCategories = null;

    /**
     * whether coordinate type data or not
     * @type {null|boolean}
     */
    this.coordinateType = null;

    /**
     * whether line chart with coordinate data or not
     * @type {null|boolean}
     */
    this.lineCoordinateType = null;
  }

  /**
   * Get raw data.
   * @returns {rawData}
   */
  getRawData() {
    return this.rawData;
  }

  /**
   * Find chart type from series name.
   * @param {string} seriesType - series name
   * @returns {*}
   */
  findChartType(seriesType) {
    return rawDataHandler.findChartType(this.rawData.seriesAlias, seriesType);
  }

  /**
   * Escape categories.
   * @param {Array.<string, number>} categories - cetegories
   * @returns {*|Array.<Object>|Array}
   * @private
   */
  _escapeCategories(categories) {
    return categories.map(category => snippet.encodeHTMLEntity(String(category)));
  }

  /**
   * Map categories.
   * @param {Array.<string | number>} categories - categories
   * @param {string} [axisName] - axis name like 'x' or 'y'
   * @returns {Array.<string | number>}
   * @private
   */
  _mapCategories(categories, axisName) {
    const axisType = `${axisName}Axis`;
    const options = this.options[axisType] || {};
    let isDateTime = false;

    if (snippet.isArray(options)) {
      isDateTime = options.filter(option => option.type && predicate.isDatetimeType(option.type));
    } else {
      isDateTime = options.type && predicate.isDatetimeType(options.type);
    }
    if (isDateTime) {
      categories = categories.map(value => this.chageDatetypeToTimestamp(value));
    } else {
      categories = this._escapeCategories(categories);
    }
    this.categoriesIsDateTime[axisName] = isDateTime;

    return categories;
  }

  /**
   * Process categories.
   * @param {string} type - category type (x or y)
   * @returns {null | Array.<string>} processed categories
   * @private
   */
  _processCategories(type) {
    const rawCategories = this.rawData.categories;
    const categoriesMap = {};

    if (snippet.isArray(rawCategories)) {
      categoriesMap[type] = this._mapCategories(rawCategories, type);
    } else if (rawCategories) {
      if (rawCategories.x) {
        categoriesMap.x = this._mapCategories(rawCategories.x, 'x');
      }

      if (rawCategories.y) {
        categoriesMap.y = this._mapCategories(rawCategories.y, 'y').reverse();
      }
    }

    return categoriesMap;
  }

  /**
   * Get Categories
   * @param {boolean} isVertical - whether vertical or not
   * @returns {Array.<string>}}
   */
  getCategories(isVertical) {
    const type = isVertical ? 'y' : 'x';
    let foundCategories = [];

    if (!this.categoriesMap) {
      this.categoriesMap = this._processCategories(type);
    }

    if (snippet.isExisty(isVertical)) {
      foundCategories = this.categoriesMap[type] || [];
    } else {
      Object.values(this.categoriesMap).every(categories => {
        foundCategories = categories;

        return false;
      });
    }

    return foundCategories;
  }

  /**
   * Get Category date type
   * @param {boolean} isVertical - whether vertical or not
   * @returns {boolean}
   */
  getCategorieDateType(isVertical) {
    const type = isVertical ? 'y' : 'x';

    return this.categoriesIsDateTime[type];
  }

  /**
   * value to timestamp of datetype category
   * @param {string} dateTypeValue - datetype category value
   * @returns {boolean}
   */
  chageDatetypeToTimestamp(dateTypeValue) {
    let date = new Date(dateTypeValue);
    if (!(date.getTime() > 0)) {
      date = new Date(parseInt(dateTypeValue, 10));
    }

    return date.getTime() || dateTypeValue;
  }

  /**
   * Get category count.
   * @param {boolean} isVertical - whether vertical or not
   * @returns {*}
   */
  getCategoryCount(isVertical) {
    const categories = this.getCategories(isVertical);

    return categories ? categories.length : 0;
  }

  /**
   * Whether has categories or not.
   * @param {boolean} isVertical - whether vertical or not
   * @returns {boolean}
   */
  hasCategories(isVertical) {
    return !!this.getCategoryCount(isVertical);
  }

  /**
   * Whether count of x data grater than count of y data.
   * @param {string} chartType - chart type
   * @returns {boolean}
   */
  isXCountGreaterThanYCount(chartType) {
    const seriesDataModel = this.getSeriesDataModel(chartType);

    return seriesDataModel.isXCountGreaterThanYCount();
  }

  /**
   * Whether has x value or not.
   * @param {string} chartType - chart type
   * @returns {boolean}
   */
  hasXValue(chartType) {
    const hasVerticalCategory = this.isXCountGreaterThanYCount(chartType);

    return !this.hasCategories(hasVerticalCategory) || hasVerticalCategory;
  }

  /**
   * Whether has y value or not.
   * @param {string} chartType - chart type
   * @returns {boolean}
   */
  hasYValue(chartType) {
    const hasVerticalCategory = this.isXCountGreaterThanYCount(chartType);

    return !this.hasCategories(hasVerticalCategory) || !hasVerticalCategory;
  }

  /**
   * Get category.
   * @param {number} index index
   * @param {boolean} isVertical - whether vertical or not
   * @returns {string} category
   */
  getCategory(index, isVertical) {
    return this.getCategories(isVertical)[index];
  }

  /**
   * Find category index by value
   * @param {string} value - category value
   * @returns {null|number}
   */
  findCategoryIndex(value) {
    const categories = this.getCategories();
    const isDateType = this.getCategorieDateType();
    let foundIndex = null;

    categories.forEach((category, index) => {
      if (isDateType) {
        value = this.chageDatetypeToTimestamp(value);
      }

      if (category === value) {
        foundIndex = index;
      }

      return snippet.isNull(foundIndex);
    });

    return foundIndex;
  }

  /**
   * @param {string} value - category
   * @returns {number} - found: category index, not found: -1
   */
  findAbsoluteCategoryIndex(value) {
    const originalCategories = this.originalRawData ? this.originalRawData.categories : null;
    let index = -1;

    if (!originalCategories) {
      return index;
    }

    originalCategories.forEach((category, categoryIndex) => {
      const found = category === value;
      if (found) {
        index = categoryIndex;
      }

      return !found;
    });

    return index;
  }

  /**
   * Get tooltip category.
   * @param {number} categoryIndex - category index
   * @param {boolean} isVertical - whether vertical category or not
   * @returns {string}
   * @private
   */
  _getTooltipCategory(categoryIndex, isVertical) {
    let category = this.getCategory(categoryIndex, isVertical);
    const axisType = isVertical ? 'yAxis' : 'xAxis';
    const axisOption = this.options[axisType] || {};
    const tooltipOption = this.options.tooltip || {};

    if (predicate.isDatetimeType(tooltipOption.type)) {
      category = renderUtil.formatDate(category, tooltipOption.dateFormat);
    } else if (predicate.isDatetimeType(axisOption.type)) {
      category = renderUtil.formatDate(category, axisOption.dateFormat);
    }

    return category;
  }

  /**
   * Make category for tooltip.
   * @param {number} categoryIndex - category index
   * @param {number} oppositeIndex - opposite index
   * @param {boolean} isVerticalChart - whether vertical chart or not
   * @returns {string}
   */
  makeTooltipCategory(categoryIndex, oppositeIndex, isVerticalChart) {
    const isVertical = !isVerticalChart;
    let category = this._getTooltipCategory(categoryIndex, isVertical);
    const categoryCount = this.getCategoryCount(!isVertical);

    if (categoryCount) {
      category += `, ${this._getTooltipCategory(categoryCount - oppositeIndex - 1, !isVertical)}`;
    }

    return category;
  }

  /**
   * Get stacks from raw series data.
   * @param {string} seriesType seriesType to count stacks
   * @returns {Array.<string>}
   */
  getStacks(seriesType) {
    if (!this.stacks) {
      this.stacks = rawDataHandler.pickStacks(this.rawData.series[seriesType]);
    }

    return this.stacks;
  }

  /**
   * Get stack count.
   * @param {string} seriesType - series type
   * @returns {Number}
   */
  getStackCount(seriesType) {
    return this.getStacks(seriesType).length;
  }

  /**
   * Find stack index from stack list by stack value.
   * @param {string} stack stack
   * @returns {number}
   */
  findStackIndex(stack) {
    return snippet.inArray(stack, this.getStacks());
  }

  /**
   * Whether line chart with coordinate data or not.
   * @returns {boolean}
   */
  isLineCoordinateType() {
    let { lineCoordinateType } = this;

    if (!snippet.isExisty(lineCoordinateType)) {
      const { chartType } = this;
      lineCoordinateType = predicate.isLineTypeChart(chartType) && !this.hasCategories();
      this.lineCoordinateType = lineCoordinateType;
    }

    return lineCoordinateType;
  }

  /**
   * Whether coordinate type or not.
   * @returns {boolean}
   */
  isCoordinateType() {
    let { coordinateType } = this;

    if (!snippet.isExisty(coordinateType)) {
      const { chartType } = this;

      coordinateType = predicate.isCoordinateTypeChart(chartType);
      coordinateType =
        coordinateType || predicate.isLineScatterComboChart(chartType, this.seriesTypes);
      coordinateType =
        coordinateType || (predicate.isLineTypeChart(chartType) && !this.hasCategories());
      this.coordinateType = coordinateType;
    }

    return coordinateType;
  }

  /**
   * Get SeriesDataModel.
   * @param {string} seriesType - series name
   * @returns {SeriesDataModel}
   */
  getSeriesDataModel(seriesType) {
    if (!this.seriesDataModelMap[seriesType]) {
      const chartType = this.findChartType(seriesType);
      const rawSeriesData = this.rawData.series[seriesType];
      let SeriesDataModelClass;

      if (predicate.isBoxplotChart(this.chartType)) {
        SeriesDataModelClass = SeriesDataModelForBoxplot;
      } else if (predicate.isTreemapChart(this.chartType)) {
        SeriesDataModelClass = SeriesDataModelForTreemap;
      } else if (predicate.isBulletChart(this.chartType)) {
        SeriesDataModelClass = SeriesDataModelForBullet;
      } else {
        SeriesDataModelClass = SeriesDataModel;
      }

      this.seriesDataModelMap[seriesType] = new SeriesDataModelClass(
        rawSeriesData,
        chartType,
        this.options,
        this.getFormatFunctions(),
        this.isCoordinateType()
      );
    }

    return this.seriesDataModelMap[seriesType];
  }

  /**
   * Get chart option
   * @param {string} optionType option category
   * @returns {object}
   */
  getOption(optionType) {
    return this.options[optionType];
  }

  /**
   * Get group count.
   * @param {string} chartType chart type
   * @returns {number}
   */
  getGroupCount(chartType) {
    return this.getSeriesDataModel(chartType).getGroupCount();
  }

  /**
   * Push category.
   * @param {string} category - category
   * @private
   */
  _pushCategory(category) {
    if (this.rawData.categories) {
      this.rawData.categories.push(category);
      this.originalRawData.categories.push(category);
    }
  }

  /**
   * Shift category.
   * @private
   */
  _shiftCategory() {
    if (this.rawData.categories) {
      this.rawData.categories.shift();
      this.originalRawData.categories.shift();
    }
  }

  /**
   * Find raw series datum by name.
   * @param {string} name - legend name
   * @param {string} [seriesType] - series name
   * @returns {object}
   * @private
   */
  _findRawSeriesDatumByName(name, seriesType) {
    const seriesData = this.rawData.series[seriesType];
    let foundSeriesDatum = null;

    seriesData.forEach(seriesDatum => {
      const isEqual = seriesDatum.name === name;
      if (isEqual) {
        foundSeriesDatum = seriesDatum;
      }

      return !isEqual;
    });

    return foundSeriesDatum;
  }

  /**
   * Push value to data property of series.
   * @param {{name: string, data: Array}} seriesDatum - series datum
   * @param {Array.<number>|{x: number, y: number, r: number}|number} value - value
   * @param {string} seriesType - sereis name
   * @private
   */
  _pushValue(seriesDatum, value, seriesType) {
    const rawSeriesDatum = this._findRawSeriesDatumByName(seriesDatum.name, seriesType);

    seriesDatum.data.push(value);

    if (rawSeriesDatum) {
      rawSeriesDatum.data.push(value);
    }
  }

  /**
   * Push values to series of originalRawData and series of rawData.
   * @param {Array.<{name: string, data: Array}>} seriesData - series data
   * @param {Array} values - values
   * @param {string} [seriesType] - series name
   * @private
   */
  _pushValues(seriesData, values, seriesType) {
    seriesData.forEach((seriesDatum, index) => {
      this._pushValue(seriesDatum, values[index], seriesType);
    });
  }

  /**
   * Push series data.
   * @param {Array.<number>} values - values
   * @private
   */
  _pushSeriesData(values) {
    if (this.chartType !== 'combo' && snippet.isArray(values)) {
      const temp = values;
      values = {};
      values[this.chartType] = temp;
    }

    Object.entries(this.originalRawData.series).forEach(([seriesType, seriesData]) => {
      this._pushValues(seriesData, values[seriesType], seriesType);
    });
  }

  /**
   * Shift values.
   * @param {Array.<{name: string, data: Array}>} seriesData - series data
   * @param {string} seriesType - series name
   * @private
   */
  _shiftValues(seriesData, seriesType) {
    seriesData.forEach(seriesDatum => {
      const rawSeriesDatum = this._findRawSeriesDatumByName(seriesDatum.name, seriesType);

      seriesDatum.data.shift();
      if (rawSeriesDatum) {
        rawSeriesDatum.data.shift();
      }
    });
  }

  /**
   * Shift series data.
   * @private
   */
  _shiftSeriesData() {
    Object.entries(this.originalRawData.series).forEach(([seriesType, seriesData]) => {
      this._shiftValues(seriesData, seriesType);
    });
  }

  /**
   * Add dynamic data.
   * @param {string} category - category
   * @param {Array.<number>} values - values
   */
  addDynamicData(category, values) {
    this.dynamicData.push({
      category,
      values
    });
  }

  /**
   * Push dynamic data.
   * @param {{category: string, values: Array.<number>}} data - adding data
   * @private
   */
  _pushDynamicData(data) {
    this._pushCategory(data.category);
    this._pushSeriesData(data.values);
  }

  /**
   * Push dynamic data for coordinate type.
   * @param {object.<string, Array.<number>|object.<string, number>>} data - adding data
   * @private
   */
  _pushDynamicDataForCoordinateType(data) {
    Object.values(this.originalRawData.series).forEach(seriesDatum => {
      this._pushValue(seriesDatum, data[seriesDatum.name]);
    });
  }

  /**
   * Add data from dynamic data.
   * @returns {boolean}
   */
  addDataFromDynamicData() {
    const datum = this.dynamicData.shift();

    if (datum) {
      if (this.isCoordinateType()) {
        this._pushDynamicDataForCoordinateType(datum.values);
      } else {
        this._pushDynamicData(datum);
      }

      this.initData(this.rawData);
    }

    return !!datum;
  }

  /**
   * Shift data.
   */
  shiftData() {
    this._shiftCategory();
    this._shiftSeriesData();

    this.initData(this.rawData);
  }

  /**
   * Add data from remain dynamic data.
   * @param {boolean} shiftingOption - whether has shifting option or not.
   */
  addDataFromRemainDynamicData(shiftingOption) {
    const { dynamicData } = this;
    this.dynamicData = [];

    dynamicData.forEach(datum => {
      this._pushCategory(datum.category);
      this._pushSeriesData(datum.values);
      if (shiftingOption) {
        this._shiftCategory();
        this._shiftSeriesData();
      }
    });

    this.initData(this.rawData);
  }

  /**
   * Traverse all SeriesDataModel by seriesTypes, and executes iteratee function.
   * @param {function} iteratee iteratee function
   * @private
   */
  _eachByAllSeriesDataModel(iteratee) {
    const seriesTypes = this.seriesTypes || [this.chartType];

    seriesTypes.forEach(chartType => iteratee(this.getSeriesDataModel(chartType), chartType));
  }

  /**
   * Whether valid all SeriesDataModel or not.
   * @returns {boolean}
   */
  isValidAllSeriesDataModel() {
    let isValid = true;

    this._eachByAllSeriesDataModel(seriesDataModel => {
      isValid = !!seriesDataModel.getGroupCount();
    });

    return isValid;
  }

  /**
   * Make SeriesGroups.
   * @returns {Array.<SeriesGroup>}
   * @private
   */
  _makeSeriesGroups() {
    const joinedGroups = [];

    this._eachByAllSeriesDataModel(seriesDataModel => {
      seriesDataModel.each((seriesGroup, index) => {
        if (!joinedGroups[index]) {
          joinedGroups[index] = [];
        }
        joinedGroups[index] = joinedGroups[index].concat(seriesGroup.items);
      });
    });

    const seriesGroups = joinedGroups.map(items => new SeriesGroup(items));

    return seriesGroups;
  }

  /**
   * Get SeriesGroups.
   * @returns {Array.<SeriesGroup>}
   */
  getSeriesGroups() {
    if (!this.seriesGroups) {
      this.seriesGroups = this._makeSeriesGroups();
    }

    return this.seriesGroups;
  }

  /**
   * Get value.
   * @param {number} groupIndex group index
   * @param {number} index index
   * @param {?string} chartType chart type
   * @returns {number} value
   */
  getValue(groupIndex, index, chartType) {
    return this.getSeriesDataModel(chartType).getValue(groupIndex, index);
  }

  /**
   * Get fallback datetime values
   * @returns {number[]} milliseconds
   */
  getDefaultDatetimeValues() {
    const hour = 60 * 60 * 1000;
    const now = Date.now();

    return [now - hour, now];
  }

  /**
   * Return boolean value of whether seriesData empty or not
   * @param {string} chartType Type string of chart
   * @returns {boolean}
   */
  isSeriesDataEmpty(chartType) {
    const { rawData } = this;
    const seriesNotExist = rawData && !rawData.series;

    return (
      !rawData ||
      seriesNotExist ||
      !rawData.series[chartType] ||
      (rawData.series[chartType] && !rawData.series[chartType].length)
    );
  }

  /**
   * Return boolean value of whether axis limit option empty or not
   * @param {string} axisType Type string of axis
   * @returns {boolean}
   */
  isLimitOptionsEmpty(axisType) {
    const axisOption = this.options[axisType] || {};

    return isUndefined(axisOption.min) && isUndefined(axisOption.max);
  }

  /**
   * Return boolean value of whether axis limit option empty or not
   * @param {string} axisType Type string of axis
   * @returns {boolean}
   */
  isLimitOptionsInsufficient(axisType) {
    const axisOption = this.options[axisType] || {};

    return isUndefined(axisOption.min) || isUndefined(axisOption.max);
  }

  /**
   * Create values that picked value from SeriesItems of specific SeriesDataModel.
   * @param {?string} chartType - type of chart
   * @param {?string} valueType - type of value like value, x, y, r.
   * @param {?string} axisName - name of axis value 'xAxis' 'yAxis'
   * @returns {Array.<number>}
   * @private
   */
  _createValues(chartType, valueType, axisName) {
    let values;
    const { options } = this;
    const plotOptions = options.plot;
    const axisOption = options[axisName] || {};
    const { type } = axisOption;
    const isEmptyRawData = this.isSeriesDataEmpty(chartType);
    const isEmptyLimitOptions = this.isLimitOptionsEmpty(axisName);
    const isInsufficientLimitOptions = this.isLimitOptionsInsufficient(axisName);
    const isLineOrAreaChart =
      predicate.isLineChart(chartType) ||
      predicate.isAreaChart(chartType) ||
      predicate.isLineAreaComboChart(chartType, this.seriesTypes);
    let valueCandidate = this.defaultValues;

    if (predicate.isComboChart(chartType)) {
      values = [];
      this._eachByAllSeriesDataModel(seriesDataModel => {
        values = values.concat(seriesDataModel.getValues(valueType));
      });
    } else if (isEmptyRawData && isInsufficientLimitOptions) {
      if (!isEmptyLimitOptions && isInsufficientLimitOptions) {
        valueCandidate = valueCandidate.concat([axisOption.min || axisOption.max]);
      }

      if (valueType === 'x' && type === 'datetime') {
        values = this.getDefaultDatetimeValues();

        if (isLineOrAreaChart && plotOptions) {
          const plotValues = this.getValuesFromPlotOptions(plotOptions, type);
          values = values.concat(plotValues);
        }
      } else {
        values = valueCandidate;
      }
    } else {
      values = this.getSeriesDataModel(chartType).getValues(valueType);
    }

    return values;
  }

  /**
   * Get values of plot lines, and bands if it exist
   * @param {{lines: Array.<object>, bands: Array.<object>}} plotOptions plot options
   * @param {string} [axisType] axis value type 'value' 'datetime'
   * @returns {Array.<number>}
   */
  getValuesFromPlotOptions(plotOptions, axisType) {
    let values = [];

    if (plotOptions.lines) {
      plotOptions.lines.forEach(line => {
        values.push(axisType !== 'datetime' ? line.value : new Date(line.value));
      });
    }

    if (plotOptions.bands) {
      plotOptions.bands.forEach(line => {
        const ranges = line.range.map(range => (axisType !== 'datetime' ? range : new Date(range)));

        values = values.concat(ranges);
      });
    }

    return values;
  }

  /**
   * Get values from valuesMap.
   * @param {?string} chartType - type of chart
   * @param {?string} valueType - type of value like value, x, y, r.
   * @param {?string} axisType - type of axis value 'value', 'datetime'
   * @returns {Array.<number>}
   */
  getValues(chartType, valueType, axisType) {
    const mapKey = chartType + valueType;

    if (!this.valuesMap[mapKey]) {
      this.valuesMap[mapKey] = this._createValues(chartType, valueType, axisType);
    }

    return this.valuesMap[mapKey];
  }

  /**
   * Traverse SeriesGroup of all SeriesDataModel, and executes iteratee function.
   * @param {function} iteratee iteratee function
   * @param {boolean} [isPivot] - whether pivot or not
   */
  eachBySeriesGroup(iteratee, isPivot) {
    this._eachByAllSeriesDataModel((seriesDataModel, chartType) => {
      seriesDataModel.each((seriesGroup, groupIndex) => {
        iteratee(seriesGroup, groupIndex, chartType);
      }, isPivot);
    });
  }

  /**
   * Pick legend label.
   * @param {object} item item
   * @returns {string} label
   * @private
   */
  _pickLegendLabel(item) {
    return item.name ? snippet.encodeHTMLEntity(item.name) : null;
  }

  /**
   * Pick legend visibility.
   * @param {object} item item
   * @returns {boolean}
   * @private
   */
  _isVisibleLegend(item) {
    let visibility = true;
    if (snippet.isExisty(item.visible) && item.visible === false) {
      visibility = false;
    }

    return visibility;
  }

  /**
   * Pick legend labels or visibilities from raw data.
   * @param {string} dataType data type of picking values
   * @returns {string[]|boolean[]} labels or visibilities
   * @private
   */
  _pickLegendData(dataType) {
    const seriesData = this.rawData.series;
    let result = {};
    let pickerMethod;

    if (dataType === 'visibility') {
      pickerMethod = this._isVisibleLegend;
    } else if (dataType === 'label') {
      pickerMethod = this._pickLegendLabel;
    }

    if (pickerMethod) {
      Object.entries(seriesData).forEach(([seriesType, seriesDatum]) => {
        result[seriesType] = seriesDatum.map(pickerMethod);
      });

      result = snippet.filter(result, snippet.isExisty);
    }

    return result;
  }

  /**
   * Get legend labels.
   * @param {?string} chartType chart type
   * @returns {Array.<string> | {column: ?Array.<string>, line: ?Array.<string>}} legend labels
   */
  getLegendLabels(chartType) {
    if (!this.legendLabels) {
      this.legendLabels = this._pickLegendData('label');
    }

    return this.legendLabels[chartType] || this.legendLabels;
  }

  /**
   * Get legend visibility.
   * @param {?string} chartType chart type
   * @returns {Array.<string> | {column: ?Array.<string>, line: ?Array.<string>}} legend labels
   */
  getLegendVisibility(chartType) {
    if (!this.legendVisibilities) {
      this.legendVisibilities = this._pickLegendData('visibility');
    }

    return this.legendVisibilities[chartType] || this.legendVisibilities;
  }

  /**
   * Make legend data.
   * @returns {Array} labels
   * @private
   */
  _makeLegendData() {
    const legendLabels = this.getLegendLabels(this.chartType);
    const legendVisibilities = this.getLegendVisibility();
    let seriesTypes = this.seriesTypes || [this.chartType];
    let legendLabelsMap;

    if (snippet.isArray(legendLabels)) {
      legendLabelsMap = [this.chartType];
      legendLabelsMap[this.chartType] = legendLabels;
    } else {
      seriesTypes = this.seriesTypes;
      legendLabelsMap = legendLabels;
    }

    const legendData = seriesTypes.map(chartType =>
      legendLabelsMap[chartType].map((label, index) => {
        const is2DArray = snippet.isArray(legendVisibilities[chartType]);

        return {
          chartType,
          label,
          visible: is2DArray ? legendVisibilities[chartType][index] : legendVisibilities[index]
        };
      })
    );

    return [].concat(...legendData);
  }

  /**
   * Get legend data.
   * @returns {Array.<{chartType: string, label: string}>} legend data
   */
  getLegendData() {
    if (!this.legendData) {
      this.legendData = this._makeLegendData();
    }

    if (!this.originalLegendData) {
      this.originalLegendData = this.legendData;
    }

    return this.legendData;
  }

  /**
   * get original legend data.
   * @returns {Array.<{chartType: string, label: string}>}
   */
  getOriginalLegendData() {
    return this.originalLegendData;
  }

  /**
   * Get legend item.
   * @param {number} index index
   * @returns {{chartType: string, label: string}} legend data
   */
  getLegendItem(index) {
    return this.getLegendData()[index];
  }

  /**
   * Get first label of SeriesItem.
   * @param {?string} chartType chartType
   * @returns {string} formatted value
   */
  getFirstItemLabel(chartType) {
    return this.getSeriesDataModel(chartType).getFirstItemLabel();
  }

  /**
   * Add data ratios of pie chart.
   * @param {string} chartType - type of chart.
   */
  addDataRatiosOfPieChart(chartType) {
    this.getSeriesDataModel(chartType).addDataRatiosOfPieChart();
  }

  /**
   * Add data ratios for chart of coordinate type.
   * @param {string} chartType - type of chart.
   * @param {{x: {min: number, max: number}, y: {min: number, max: number}}} limitMap - limit map
   * @param {boolean} [hasRadius] - whether has radius or not
   */
  addDataRatiosForCoordinateType(chartType, limitMap, hasRadius) {
    if (predicate.isLineTypeChart(chartType)) {
      this._addStartValueToAllSeriesItem(limitMap.yAxis, chartType);
    }
    this.getSeriesDataModel(chartType).addDataRatiosForCoordinateType(limitMap, hasRadius);
  }

  /**
   * Add start value to all series item.
   * @param {{min: number, max: number}} limit - limit
   * @param {string} chartType - chart type
   * @private
   */
  _addStartValueToAllSeriesItem(limit, chartType) {
    let start = 0;

    if (limit.min >= 0) {
      start = limit.min;
    } else if (limit.max <= 0) {
      start = limit.max;
    }

    this.getSeriesDataModel(chartType).addStartValueToAllSeriesItem(start);
  }

  /**
   * Register percent values.
   * @param {{min: number, max: number}} limit axis limit
   * @param {string} stackType stackType option
   * @param {string} chartType chart type
   */
  addDataRatios(limit, stackType, chartType) {
    const seriesDataModel = this.getSeriesDataModel(chartType);

    this._addStartValueToAllSeriesItem(limit, chartType);
    seriesDataModel.addDataRatios(limit, stackType);
  }

  /**
   * Add data ratios for treemap chart.
   * @param {{min: number, max: number}} limit - limit
   * @param {string} chartType - chart type
   */
  addDataRatiosForTreemapChart(limit, chartType) {
    this.getSeriesDataModel(chartType).addDataRatios(limit);
  }

  /**
   * Create base values for normal stackType chart.
   * @param {string} chartType - chart type
   * @returns {Array.<number>}
   * @private
   */
  _createBaseValuesForNormalStackedChart(chartType) {
    const seriesDataModel = this.getSeriesDataModel(chartType);
    let baseValues = [];

    seriesDataModel.each(seriesGroup => {
      const valuesMap = seriesGroup._makeValuesMapPerStack();

      Object.values(valuesMap).forEach(values => {
        const plusSum = calculator.sumPlusValues(values);
        const minusSum = calculator.sumMinusValues(values);
        baseValues = baseValues.concat([plusSum, minusSum]);
      });
    });

    return baseValues;
  }

  /**
   * Create base values for calculating limit
   * @param {string} chartType - chart type
   * @param {boolean} isSingleYAxis = whether single y axis or not
   * @param {string} stackType - stack type
   * @param {string} valueType - value type
   * @param {string} axisType - value type
   * @returns {Array.<number>}
   */
  createBaseValuesForLimit(chartType, isSingleYAxis, stackType, valueType, axisType) {
    let baseValues;

    if (predicate.isComboChart(this.chartType) && isSingleYAxis) {
      baseValues = this.getValues(this.chartType, valueType);
      if (predicate.isNormalStackChart(chartType, stackType)) {
        baseValues = baseValues.concat(this._createBaseValuesForNormalStackedChart(chartType));
      }
    } else if (predicate.isTreemapChart(chartType)) {
      baseValues = this.getValues(chartType, 'colorValue');
    } else if (predicate.isNormalStackChart(chartType, stackType)) {
      baseValues = this._createBaseValuesForNormalStackedChart(chartType);
    } else {
      baseValues = this.getValues(chartType, valueType, axisType);
    }

    return baseValues;
  }

  /**
   * Find overflow item than graph area
   * @param {string} chartType - chart type
   * @param {string} valueType - value type
   * @returns {{minItem: SeriesItem, maxItem: SeriesItem}}
   */
  findOverflowItem(chartType, valueType) {
    const seriesDataModel = this.getSeriesDataModel(chartType);
    const maxRadiusValue = seriesDataModel.getMaxValue('r');
    const isBiggerRatioThanHalfRatio = function(seriesItem) {
      return seriesItem.r / maxRadiusValue > chartConst.HALF_RATIO;
    };

    return {
      minItem: seriesDataModel.findMinSeriesItem(valueType, isBiggerRatioThanHalfRatio),
      maxItem: seriesDataModel.findMaxSeriesItem(valueType, isBiggerRatioThanHalfRatio)
    };
  }

  /**
   * Register color and opacity data of tooltip icon
   * @param {Array.<Array.<object>>} colors - color and opacities setGraphColors
   * @ignore
   */
  setGraphColors(colors) {
    this.graphColors = colors;
  }

  /**
   * Get color and opacity data of tooltip data
   * @returns {Array.<Array.<object>>} - color and opacities set
   * @ignore
   */
  getGraphColors() {
    return this.graphColors;
  }

  /**
   * Check The donut chart on pie donut combo chart has outer label align option
   * @returns {boolean} - whether donut chart has outer label align option or not
   * @ignore
   */
  isComboDonutShowOuterLabel() {
    const seriesOptions = this.options.series;

    return seriesOptions && seriesOptions.pie2 && seriesOptions.pie2.labelAlign === 'outer';
  }
}

export default DataProcessor;
