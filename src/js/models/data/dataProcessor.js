/**
 * @fileoverview DataProcessor process rawData.
 * rawData.categories --> categories
 * rawData.series --> SeriesDataModel, legendLabels, legendData
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../../const');
var DataProcessorBase = require('./dataProcessorBase');
var SeriesDataModel = require('../data/seriesDataModel');
var SeriesDataModelForBoxplot = require('../data/seriesDataModelForBoxplot');
var SeriesDataModelForBullet = require('../data/seriesDataModelForBullet');
var SeriesDataModelForTreemap = require('../data/seriesDataModelForTreemap');
var SeriesGroup = require('./seriesGroup');
var rawDataHandler = require('../../models/data/rawDataHandler');
var predicate = require('../../helpers/predicate');
var renderUtil = require('../../helpers/renderUtil');
var calculator = require('../../helpers/calculator');
var objectUtil = require('../../helpers/objectUtil');
var snippet = require('tui-code-snippet');

var concat = Array.prototype.concat;

var isUndefined = snippet.isUndefined;

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

var DataProcessor = snippet.defineClass(DataProcessorBase, /** @lends DataProcessor.prototype */{
    /**
     * Data processor.
     * @constructs DataProcessor
     * @private
     * @param {rawData} rawData raw data
     * @param {string} chartType chart type
     * @param {object} options options
     * @param {Array.<string>} seriesTypes chart types
     */
    init: function(rawData, chartType, options, seriesTypes) {
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
    },

    /**
     * Get original raw data.
     * @returns {rawData} raw data
     */
    getOriginalRawData: function() {
        return objectUtil.deepCopy(this.originalRawData);
    },

    /**
     * Get zoomed raw data.
     * @returns {*|null}
     */
    getZoomedRawData: function() {
        var zoomedRawData = this.zoomedRawData;

        if (zoomedRawData) {
            zoomedRawData = objectUtil.deepCopy(zoomedRawData);
        } else {
            zoomedRawData = this.getOriginalRawData();
        }

        return zoomedRawData;
    },

    /**
     * Filter seriesData by index range.
     * @param {Array.<{data: Array}>} seriesData - series data
     * @param {number} startIndex - start index
     * @param {number} endIndex - end index
     * @returns {Array.<Array.<object>>}
     * @private
     */
    _filterSeriesDataByIndexRange: function(seriesData, startIndex, endIndex) {
        snippet.forEachArray(seriesData, function(seriesDatum) {
            seriesDatum.data = seriesDatum.data.slice(startIndex, endIndex + 1);
        });

        return seriesData;
    },

    /**
     * Filter raw data by index range.
     * @param {{series: Array.<object>, categories: Array.<string>}} rawData - raw data
     * @param {Array.<number>} indexRange - index range for zoom
     * @returns {*}
     * @private
     */
    _filterRawDataByIndexRange: function(rawData, indexRange) {
        var self = this;
        var startIndex = indexRange[0];
        var endIndex = indexRange[1];

        snippet.forEach(rawData.series, function(seriesDataSet, seriesType) {
            rawData.series[seriesType] = self._filterSeriesDataByIndexRange(seriesDataSet, startIndex, endIndex);
        });

        if (rawData.categories) {
            rawData.categories = rawData.categories.slice(startIndex, endIndex + 1);
        }

        return rawData;
    },

    /**
     * Update raw data for zoom
     * @param {Array.<number>} indexRange - index range for zoom
     */
    updateRawDataForZoom: function(indexRange) {
        var rawData = this.getRawData();
        var zoomedRawData = this.getZoomedRawData();

        this.zoomedRawData = this._filterRawDataByIndexRange(zoomedRawData, indexRange);
        rawData = this._filterRawDataByIndexRange(rawData, indexRange);
        this.initData(rawData);
    },

    /**
     * Init zoomed raw data.
     */
    initZoomedRawData: function() {
        this.zoomedRawData = null;
    },

    /**
     * Initialize data.
     * @param {rawData} rawData raw data
     */
    initData: function(rawData) {
        /**
         * raw data
         * @type {rawData}
         */
        this.rawData = rawData;

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
    },

    /**
     * Get raw data.
     * @returns {rawData}
     */
    getRawData: function() {
        return this.rawData;
    },

    /**
     * Find chart type from series name.
     * @param {string} seriesType - series name
     * @returns {*}
     */
    findChartType: function(seriesType) {
        return rawDataHandler.findChartType(this.rawData.seriesAlias, seriesType);
    },

    /**
     * Escape categories.
     * @param {Array.<string, number>} categories - cetegories
     * @returns {*|Array.<Object>|Array}
     * @private
     */
    _escapeCategories: function(categories) {
        return snippet.map(categories, function(category) {
            return snippet.encodeHTMLEntity(String(category));
        });
    },

    /**
     * Map categories.
     * @param {Array.<string | number>} categories - categories
     * @param {string} [axisName] - axis name like 'x' or 'y'
     * @returns {Array.<string | number>}
     * @private
     */
    _mapCategories: function(categories, axisName) {
        var axisType = axisName + 'Axis';
        var options = this.options[axisType] || {};
        var isDateTime = false;

        if (snippet.isArray(options)) {
            isDateTime = snippet.filter(options, function(option) {
                return option.type && predicate.isDatetimeType(option.type);
            });
        } else {
            isDateTime = options.type && predicate.isDatetimeType(options.type);
        }
        if (isDateTime) {
            categories = snippet.map(categories, function(value) {
                var date = this.chageDatetypeToTimestamp(value);

                return date;
            }, this);
        } else {
            categories = this._escapeCategories(categories);
        }

        this.categoriesIsDateTime[axisName] = isDateTime;

        return categories;
    },

    /**
     * Process categories.
     * @param {string} type - category type (x or y)
     * @returns {null | Array.<string>} processed categories
     * @private
     */
    _processCategories: function(type) {
        var rawCategories = this.rawData.categories;
        var categoriesMap = {};

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
    },

    /**
     * Get Categories
     * @param {boolean} isVertical - whether vertical or not
     * @returns {Array.<string>}}
     */
    getCategories: function(isVertical) {
        var type = isVertical ? 'y' : 'x';
        var foundCategories = [];

        if (!this.categoriesMap) {
            this.categoriesMap = this._processCategories(type);
        }

        if (snippet.isExisty(isVertical)) {
            foundCategories = this.categoriesMap[type] || [];
        } else {
            snippet.forEach(this.categoriesMap, function(categories) {
                foundCategories = categories;

                return false;
            });
        }

        return foundCategories;
    },

    /**
     * Get Category date type
     * @param {boolean} isVertical - whether vertical or not
     * @returns {boolean}
     */
    getCategorieDateType: function(isVertical) {
        var type = isVertical ? 'y' : 'x';

        return this.categoriesIsDateTime[type];
    },

    /**
     * value to timestamp of datetype category
     * @param {string} dateTypeValue - datetype category value
     * @returns {boolean}
     */
    chageDatetypeToTimestamp: function(dateTypeValue) {
        var date = new Date(dateTypeValue);
        if (!(date.getTime() > 0)) {
            date = new Date(parseInt(dateTypeValue, 10));
        }

        return date.getTime() || dateTypeValue;
    },

    /**
     * Get category count.
     * @param {boolean} isVertical - whether vertical or not
     * @returns {*}
     */
    getCategoryCount: function(isVertical) {
        var categories = this.getCategories(isVertical);

        return categories ? categories.length : 0;
    },

    /**
     * Whether has categories or not.
     * @param {boolean} isVertical - whether vertical or not
     * @returns {boolean}
     */
    hasCategories: function(isVertical) {
        return !!this.getCategoryCount(isVertical);
    },

    /**
     * Whether count of x data grater than count of y data.
     * @param {string} chartType - chart type
     * @returns {boolean}
     */
    isXCountGreaterThanYCount: function(chartType) {
        var seriesDataModel = this.getSeriesDataModel(chartType);

        return seriesDataModel.isXCountGreaterThanYCount();
    },

    /**
     * Whether has x value or not.
     * @param {string} chartType - chart type
     * @returns {boolean}
     */
    hasXValue: function(chartType) {
        var hasVerticalCategory = this.isXCountGreaterThanYCount(chartType);

        return !this.hasCategories(hasVerticalCategory) || hasVerticalCategory;
    },

    /**
     * Whether has y value or not.
     * @param {string} chartType - chart type
     * @returns {boolean}
     */
    hasYValue: function(chartType) {
        var hasVerticalCategory = this.isXCountGreaterThanYCount(chartType);

        return !this.hasCategories(hasVerticalCategory) || !hasVerticalCategory;
    },

    /**
     * Get category.
     * @param {number} index index
     * @param {boolean} isVertical - whether vertical or not
     * @returns {string} category
     */
    getCategory: function(index, isVertical) {
        return this.getCategories(isVertical)[index];
    },

    /**
     * Find category index by value
     * @param {string} value - category value
     * @returns {null|number}
     */
    findCategoryIndex: function(value) {
        var categories = this.getCategories();
        var isDateType = this.getCategorieDateType();
        var foundIndex = null;

        snippet.forEachArray(categories, function(category, index) {
            if (isDateType) {
                value = this.chageDatetypeToTimestamp(value);
            }

            if (category === value) {
                foundIndex = index;
            }

            return snippet.isNull(foundIndex);
        }, this);

        return foundIndex;
    },

    /**
     * @param {string} value - category
     * @returns {number} - found: category index, not found: -1
     */
    findAbsoluteCategoryIndex: function(value) {
        var originalCategories = this.originalRawData ? this.originalRawData.categories : null;
        var index = -1;

        if (!originalCategories) {
            return index;
        }

        snippet.forEach(originalCategories, function(category, categoryIndex) {
            var found = category === value;
            if (found) {
                index = categoryIndex;
            }

            return !found;
        });

        return index;
    },

    /**
     * Get tooltip category.
     * @param {number} categoryIndex - category index
     * @param {boolean} isVertical - whether vertical category or not
     * @returns {string}
     * @private
     */
    _getTooltipCategory: function(categoryIndex, isVertical) {
        var category = this.getCategory(categoryIndex, isVertical);
        var axisType = isVertical ? 'yAxis' : 'xAxis';
        var axisOption = this.options[axisType] || {};
        var tooltipOption = this.options.tooltip || {};

        if (predicate.isDatetimeType(tooltipOption.type)) {
            category = renderUtil.formatDate(category, tooltipOption.dateFormat);
        } else if (predicate.isDatetimeType(axisOption.type)) {
            category = renderUtil.formatDate(category, axisOption.dateFormat);
        }

        return category;
    },

    /**
     * Make category for tooltip.
     * @param {number} categoryIndex - category index
     * @param {number} oppositeIndex - opposite index
     * @param {boolean} isVerticalChart - whether vertical chart or not
     * @returns {string}
     */
    makeTooltipCategory: function(categoryIndex, oppositeIndex, isVerticalChart) {
        var isVertical = !isVerticalChart;
        var category = this._getTooltipCategory(categoryIndex, isVertical);
        var categoryCount = this.getCategoryCount(!isVertical);

        if (categoryCount) {
            category += ', ' + this._getTooltipCategory(categoryCount - oppositeIndex - 1, !isVertical);
        }

        return category;
    },

    /**
     * Get stacks from raw series data.
     * @param {string} seriesType seriesType to count stacks
     * @returns {Array.<string>}
     */
    getStacks: function(seriesType) {
        if (!this.stacks) {
            this.stacks = rawDataHandler.pickStacks(this.rawData.series[seriesType]);
        }

        return this.stacks;
    },

    /**
     * Get stack count.
     * @param {string} seriesType - series type
     * @returns {Number}
     */
    getStackCount: function(seriesType) {
        return this.getStacks(seriesType).length;
    },

    /**
     * Find stack index from stack list by stack value.
     * @param {string} stack stack
     * @returns {number}
     */
    findStackIndex: function(stack) {
        return snippet.inArray(stack, this.getStacks());
    },

    /**
     * Whether coordinate type or not.
     * @returns {boolean}
     */
    isCoordinateType: function() {
        var chartType = this.chartType;
        var coordinateType = this.coordinateType;

        if (!snippet.isExisty(coordinateType)) {
            coordinateType = predicate.isCoordinateTypeChart(chartType);
            coordinateType = coordinateType || predicate.isLineScatterComboChart(chartType, this.seriesTypes);
            coordinateType = coordinateType || (predicate.isLineTypeChart(chartType) && !this.hasCategories());
            this.coordinateType = coordinateType;
        }

        return coordinateType;
    },

    /**
     * Get SeriesDataModel.
     * @param {string} seriesType - series name
     * @returns {SeriesDataModel}
     */
    getSeriesDataModel: function(seriesType) {
        var rawSeriesData, chartType, SeriesDataModelClass;

        if (!this.seriesDataModelMap[seriesType]) {
            chartType = this.findChartType(seriesType);
            rawSeriesData = this.rawData.series[seriesType];

            if (predicate.isBoxplotChart(this.chartType)) {
                SeriesDataModelClass = SeriesDataModelForBoxplot;
            } else if (predicate.isTreemapChart(this.chartType)) {
                SeriesDataModelClass = SeriesDataModelForTreemap;
            } else if (predicate.isBulletChart(this.chartType)) {
                SeriesDataModelClass = SeriesDataModelForBullet;
            } else {
                SeriesDataModelClass = SeriesDataModel;
            }

            this.seriesDataModelMap[seriesType] = new SeriesDataModelClass(rawSeriesData, chartType,
                this.options, this.getFormatFunctions(), this.isCoordinateType());
        }

        return this.seriesDataModelMap[seriesType];
    },

    /**
     * Get group count.
     * @param {string} chartType chart type
     * @returns {number}
     */
    getGroupCount: function(chartType) {
        return this.getSeriesDataModel(chartType).getGroupCount();
    },

    /**
     * Push category.
     * @param {string} category - category
     * @private
     */
    _pushCategory: function(category) {
        if (this.rawData.categories) {
            this.rawData.categories.push(category);
            this.originalRawData.categories.push(category);
        }
    },

    /**
     * Shift category.
     * @private
     */
    _shiftCategory: function() {
        if (this.rawData.categories) {
            this.rawData.categories.shift();
            this.originalRawData.categories.shift();
        }
    },

    /**
     * Find raw series datum by name.
     * @param {string} name - legend name
     * @param {string} [seriesType] - series name
     * @returns {object}
     * @private
     */
    _findRawSeriesDatumByName: function(name, seriesType) {
        var foundSeriesDatum = null;
        var seriesData = this.rawData.series[seriesType];

        snippet.forEachArray(seriesData, function(seriesDatum) {
            var isEqual = seriesDatum.name === name;

            if (isEqual) {
                foundSeriesDatum = seriesDatum;
            }

            return !isEqual;
        });

        return foundSeriesDatum;
    },

    /**
     * Push value to data property of series.
     * @param {{name: string, data: Array}} seriesDatum - series datum
     * @param {Array.<number>|{x: number, y: number, r: number}|number} value - value
     * @param {string} seriesType - sereis name
     * @private
     */
    _pushValue: function(seriesDatum, value, seriesType) {
        var rawSeriesDatum = this._findRawSeriesDatumByName(seriesDatum.name, seriesType);

        seriesDatum.data.push(value);

        if (rawSeriesDatum) {
            rawSeriesDatum.data.push(value);
        }
    },

    /**
     * Push values to series of originalRawData and series of rawData.
     * @param {Array.<{name: string, data: Array}>} seriesData - series data
     * @param {Array} values - values
     * @param {string} [seriesType] - series name
     * @private
     */
    _pushValues: function(seriesData, values, seriesType) {
        var self = this;

        snippet.forEachArray(seriesData, function(seriesDatum, index) {
            self._pushValue(seriesDatum, values[index], seriesType);
        });
    },

    /**
     * Push series data.
     * @param {Array.<number>} values - values
     * @private
     */
    _pushSeriesData: function(values) {
        var self = this;
        var temp;

        if (this.chartType !== 'combo' && snippet.isArray(values)) {
            temp = values;
            values = {};
            values[this.chartType] = temp;
        }

        snippet.forEach(this.originalRawData.series, function(seriesData, seriesType) {
            self._pushValues(seriesData, values[seriesType], seriesType);
        });
    },

    /**
     * Shift values.
     * @param {Array.<{name: string, data: Array}>} seriesData - series data
     * @param {string} seriesType - series name
     * @private
     */
    _shiftValues: function(seriesData, seriesType) {
        var self = this;

        snippet.forEachArray(seriesData, function(seriesDatum) {
            var rawSeriesDatum = self._findRawSeriesDatumByName(seriesDatum.name, seriesType);

            seriesDatum.data.shift();
            if (rawSeriesDatum) {
                rawSeriesDatum.data.shift();
            }
        });
    },

    /**
     * Shift series data.
     * @private
     */
    _shiftSeriesData: function() {
        var self = this;

        snippet.forEach(this.originalRawData.series, function(seriesData, seriesType) {
            self._shiftValues(seriesData, seriesType);
        });
    },

    /**
     * Add dynamic data.
     * @param {string} category - category
     * @param {Array.<number>} values - values
     */
    addDynamicData: function(category, values) {
        this.dynamicData.push({
            category: category,
            values: values
        });
    },

    /**
     * Push dynamic data.
     * @param {{category: string, values: Array.<number>}} data - adding data
     * @private
     */
    _pushDynamicData: function(data) {
        this._pushCategory(data.category);
        this._pushSeriesData(data.values);
    },

    /**
     * Push dynamic data for coordinate type.
     * @param {object.<string, Array.<number>|object.<string, number>>} data - adding data
     * @private
     */
    _pushDynamicDataForCoordinateType: function(data) {
        var self = this;
        snippet.forEachArray(this.originalRawData.series, function(seriesDatum) {
            self._pushValue(seriesDatum, data[seriesDatum.name]);
        });
    },

    /**
     * Add data from dynamic data.
     * @returns {boolean}
     */
    addDataFromDynamicData: function() {
        var datum = this.dynamicData.shift();

        if (datum) {
            if (this.isCoordinateType()) {
                this._pushDynamicDataForCoordinateType(datum.values);
            } else {
                this._pushDynamicData(datum);
            }

            this.initData(this.rawData);
        }

        return !!datum;
    },

    /**
     * Shift data.
     */
    shiftData: function() {
        this._shiftCategory();
        this._shiftSeriesData();

        this.initData(this.rawData);
    },

    /**
     * Add data from remain dynamic data.
     * @param {boolean} shiftingOption - whether has shifting option or not.
     */
    addDataFromRemainDynamicData: function(shiftingOption) {
        var self = this;
        var dynamicData = this.dynamicData;

        this.dynamicData = [];

        snippet.forEach(dynamicData, function(datum) {
            self._pushCategory(datum.category);
            self._pushSeriesData(datum.values);
            if (shiftingOption) {
                self._shiftCategory();
                self._shiftSeriesData();
            }
        });

        this.initData(this.rawData);
    },

    /**
     * Traverse all SeriesDataModel by seriesTypes, and executes iteratee function.
     * @param {function} iteratee iteratee function
     * @private
     */
    _eachByAllSeriesDataModel: function(iteratee) {
        var self = this,
            seriesTypes = this.seriesTypes || [this.chartType];

        snippet.forEachArray(seriesTypes, function(chartType) {
            return iteratee(self.getSeriesDataModel(chartType), chartType);
        });
    },

    /**
     * Whether valid all SeriesDataModel or not.
     * @returns {boolean}
     */
    isValidAllSeriesDataModel: function() {
        var isValid = true;

        this._eachByAllSeriesDataModel(function(seriesDataModel) {
            isValid = !!seriesDataModel.getGroupCount();

            return isValid;
        });

        return isValid;
    },

    /**
     * Make SeriesGroups.
     * @returns {Array.<SeriesGroup>}
     * @private
     */
    _makeSeriesGroups: function() {
        var joinedGroups = [],
            seriesGroups;

        this._eachByAllSeriesDataModel(function(seriesDataModel) {
            seriesDataModel.each(function(seriesGroup, index) {
                if (!joinedGroups[index]) {
                    joinedGroups[index] = [];
                }
                joinedGroups[index] = joinedGroups[index].concat(seriesGroup.items);
            });
        });

        seriesGroups = snippet.map(joinedGroups, function(items) {
            return new SeriesGroup(items);
        });

        return seriesGroups;
    },

    /**
     * Get SeriesGroups.
     * @returns {Array.<SeriesGroup>}
     */
    getSeriesGroups: function() {
        if (!this.seriesGroups) {
            this.seriesGroups = this._makeSeriesGroups();
        }

        return this.seriesGroups;
    },

    /**
     * Get value.
     * @param {number} groupIndex group index
     * @param {number} index index
     * @param {?string} chartType chart type
     * @returns {number} value
     */
    getValue: function(groupIndex, index, chartType) {
        return this.getSeriesDataModel(chartType).getValue(groupIndex, index);
    },

    /**
     * Get fallback datetime values
     * @returns {number[]} milliseconds
     */
    getDefaultDatetimeValues: function() {
        var hour = 60 * 60 * 1000;
        var now = Date.now();

        return [now - hour, now];
    },

    /**
     * Return boolean value of whether seriesData empty or not
     * @param {string} chartType Type string of chart
     * @returns {boolean}
     */
    isSeriesDataEmpty: function(chartType) {
        var rawData = this.rawData;
        var seriesNotExist = rawData && !rawData.series;

        return (
            !rawData
            || seriesNotExist
            || (!(rawData.series[chartType])
                || (rawData.series[chartType] && !(rawData.series[chartType].length)))
        );
    },

    /**
     * Return boolean value of whether axis limit option empty or not
     * @param {string} axisType Type string of axis
     * @returns {boolean}
     */
    isLimitOptionsEmpty: function(axisType) {
        var axisOption = this.options[axisType] || {};

        return isUndefined(axisOption.min) && isUndefined(axisOption.max);
    },

    /**
     * Return boolean value of whether axis limit option empty or not
     * @param {string} axisType Type string of axis
     * @returns {boolean}
     */
    isLimitOptionsInsufficient: function(axisType) {
        var axisOption = this.options[axisType] || {};

        return isUndefined(axisOption.min) || isUndefined(axisOption.max);
    },

    /**
     * Create values that picked value from SeriesItems of specific SeriesDataModel.
     * @param {?string} chartType - type of chart
     * @param {?string} valueType - type of value like value, x, y, r.
     * @param {?string} axisName - name of axis value 'xAxis' 'yAxis'
     * @returns {Array.<number>}
     * @private
     */
    _createValues: function(chartType, valueType, axisName) {
        var values, plotValues;
        var options = this.options;
        var plotOptions = options.plot;
        var axisOption = options[axisName] || {};
        var type = axisOption.type;
        var isEmptyRawData = this.isSeriesDataEmpty(chartType);
        var isEmptyLimitOptions = this.isLimitOptionsEmpty(axisName);

        var isInsufficientLimitOptions = this.isLimitOptionsInsufficient(axisName);
        var isLineOrAreaChart = (predicate.isLineChart(chartType) || predicate.isAreaChart(chartType)
            || predicate.isLineAreaComboChart(chartType, this.seriesTypes));
        var valueCandidate = this.defaultValues;

        if (predicate.isComboChart(chartType)) {
            values = [];
            this._eachByAllSeriesDataModel(function(seriesDataModel) {
                values = values.concat(seriesDataModel.getValues(valueType));
            });
        } else if (isEmptyRawData && isInsufficientLimitOptions) {
            if (!isEmptyLimitOptions && isInsufficientLimitOptions) {
                valueCandidate = valueCandidate.concat([(axisOption.min || axisOption.max)]);
            }

            if (valueType === 'x' && type === 'datetime') {
                values = this.getDefaultDatetimeValues();

                if (isLineOrAreaChart && plotOptions) {
                    plotValues = this.getValuesFromPlotOptions(plotOptions, type);
                    values = values.concat(plotValues);
                }
            } else {
                values = valueCandidate;
            }
        } else {
            values = this.getSeriesDataModel(chartType).getValues(valueType);
        }

        return values;
    },

    /**
     * Get values of plot lines, and bands if it exist
     * @param {{lines: Array.<object>, bands: Array.<object>}} plotOptions plot options
     * @param {string} [axisType] axis value type 'value' 'datetime'
     * @returns {Array.<number>}
     */
    getValuesFromPlotOptions: function(plotOptions, axisType) {
        var values = [];

        if (plotOptions.lines) {
            snippet.forEach(plotOptions.lines, function(line) {
                values.push(axisType !== 'datetime' ? line.value : new Date(line.value));
            });
        }

        if (plotOptions.bands) {
            snippet.forEach(plotOptions.bands, function(line) {
                var ranges = snippet.map(line.range, function(range) {
                    return axisType !== 'datetime' ? range : new Date(range);
                });

                values = values.concat(ranges);
            });
        }

        return values;
    },

    /**
     * Get values from valuesMap.
     * @param {?string} chartType - type of chart
     * @param {?string} valueType - type of value like value, x, y, r.
     * @param {?string} axisType - type of axis value 'value', 'datetime'
     * @returns {Array.<number>}
     */
    getValues: function(chartType, valueType, axisType) {
        var mapKey;

        // chartType = chartType || chartConst.DUMMY_KEY;
        mapKey = chartType + valueType;

        if (!this.valuesMap[mapKey]) {
            this.valuesMap[mapKey] = this._createValues(chartType, valueType, axisType);
        }

        return this.valuesMap[mapKey];
    },

    /**
     * Traverse SeriesGroup of all SeriesDataModel, and executes iteratee function.
     * @param {function} iteratee iteratee function
     * @param {boolean} [isPivot] - whether pivot or not
     */
    eachBySeriesGroup: function(iteratee, isPivot) {
        this._eachByAllSeriesDataModel(function(seriesDataModel, chartType) {
            seriesDataModel.each(function(seriesGroup, groupIndex) {
                iteratee(seriesGroup, groupIndex, chartType);
            }, isPivot);
        });
    },

    /**
     * Pick legend label.
     * @param {object} item item
     * @returns {string} label
     * @private
     */
    _pickLegendLabel: function(item) {
        return item.name ? snippet.encodeHTMLEntity(item.name) : null;
    },

    /**
     * Pick legend visibility.
     * @param {object} item item
     * @returns {boolean}
     * @private
     */
    _isVisibleLegend: function(item) {
        var visibility = true;
        if (snippet.isExisty(item.visible) && item.visible === false) {
            visibility = false;
        }

        return visibility;
    },

    /**
     * Pick legend labels or visibilities from raw data.
     * @param {string} dataType data type of picking values
     * @returns {string[]|boolean[]} labels or visibilities
     * @private
     */
    _pickLegendData: function(dataType) {
        var seriesData = this.rawData.series;
        var result = {};
        var pickerMethod;

        if (dataType === 'visibility') {
            pickerMethod = this._isVisibleLegend;
        } else if (dataType === 'label') {
            pickerMethod = this._pickLegendLabel;
        }

        if (pickerMethod) {
            snippet.forEach(seriesData, function(seriesDatum, seriesType) {
                result[seriesType] = snippet.map(seriesDatum, pickerMethod);
            });

            result = snippet.filter(result, snippet.isExisty);
        }

        return result;
    },

    /**
     * Get legend labels.
     * @param {?string} chartType chart type
     * @returns {Array.<string> | {column: ?Array.<string>, line: ?Array.<string>}} legend labels
     */
    getLegendLabels: function(chartType) {
        if (!this.legendLabels) {
            this.legendLabels = this._pickLegendData('label');
        }

        return this.legendLabels[chartType] || this.legendLabels;
    },

    /**
     * Get legend visibility.
     * @param {?string} chartType chart type
     * @returns {Array.<string> | {column: ?Array.<string>, line: ?Array.<string>}} legend labels
     */
    getLegendVisibility: function(chartType) {
        if (!this.legendVisibilities) {
            this.legendVisibilities = this._pickLegendData('visibility');
        }

        return this.legendVisibilities[chartType] || this.legendVisibilities;
    },

    /**
     * Make legend data.
     * @returns {Array} labels
     * @private
     */
    _makeLegendData: function() {
        var legendLabels = this.getLegendLabels(this.chartType);
        var seriesTypes = this.seriesTypes || [this.chartType];
        var legendLabelsMap, legendData;
        var legendVisibilities = this.getLegendVisibility();

        if (snippet.isArray(legendLabels)) {
            legendLabelsMap = [this.chartType];
            legendLabelsMap[this.chartType] = legendLabels;
        } else {
            seriesTypes = this.seriesTypes;
            legendLabelsMap = legendLabels;
        }

        legendData = snippet.map(seriesTypes, function(chartType) {
            return snippet.map(legendLabelsMap[chartType], function(label, index) {
                var is2DArray = snippet.isArray(legendVisibilities[chartType]);

                return {
                    chartType: chartType,
                    label: label,
                    visible: is2DArray ? legendVisibilities[chartType][index] : legendVisibilities[index]
                };
            });
        });

        return concat.apply([], legendData);
    },

    /**
     * Get legend data.
     * @returns {Array.<{chartType: string, label: string}>} legend data
     */
    getLegendData: function() {
        if (!this.legendData) {
            this.legendData = this._makeLegendData();
        }

        if (!this.originalLegendData) {
            this.originalLegendData = this.legendData;
        }

        return this.legendData;
    },

    /**
     * get original legend data.
     * @returns {Array.<{chartType: string, label: string}>}
     */
    getOriginalLegendData: function() {
        return this.originalLegendData;
    },

    /**
     * Get legend item.
     * @param {number} index index
     * @returns {{chartType: string, label: string}} legend data
     */
    getLegendItem: function(index) {
        return this.getLegendData()[index];
    },

    /**
     * Get first label of SeriesItem.
     * @param {?string} chartType chartType
     * @returns {string} formatted value
     */
    getFirstItemLabel: function(chartType) {
        return this.getSeriesDataModel(chartType).getFirstItemLabel();
    },

    /**
     * Add data ratios of pie chart.
     * @param {string} chartType - type of chart.
     */
    addDataRatiosOfPieChart: function(chartType) {
        this.getSeriesDataModel(chartType).addDataRatiosOfPieChart();
    },

    /**
     * Add data ratios for chart of coordinate type.
     * @param {string} chartType - type of chart.
     * @param {{x: {min: number, max: number}, y: {min: number, max: number}}} limitMap - limit map
     * @param {boolean} [hasRadius] - whether has radius or not
     */
    addDataRatiosForCoordinateType: function(chartType, limitMap, hasRadius) {
        if (predicate.isLineTypeChart(chartType)) {
            this._addStartValueToAllSeriesItem(limitMap.yAxis, chartType);
        }
        this.getSeriesDataModel(chartType).addDataRatiosForCoordinateType(limitMap, hasRadius);
    },

    /**
     * Add start value to all series item.
     * @param {{min: number, max: number}} limit - limit
     * @param {string} chartType - chart type
     * @private
     */
    _addStartValueToAllSeriesItem: function(limit, chartType) {
        var start = 0;

        if (limit.min >= 0) {
            start = limit.min;
        } else if (limit.max <= 0) {
            start = limit.max;
        }

        this.getSeriesDataModel(chartType).addStartValueToAllSeriesItem(start);
    },

    /**
     * Register percent values.
     * @param {{min: number, max: number}} limit axis limit
     * @param {string} stackType stackType option
     * @param {string} chartType chart type
     */
    addDataRatios: function(limit, stackType, chartType) {
        var seriesDataModel = this.getSeriesDataModel(chartType);

        this._addStartValueToAllSeriesItem(limit, chartType);
        seriesDataModel.addDataRatios(limit, stackType);
    },

    /**
     * Add data ratios for treemap chart.
     * @param {{min: number, max: number}} limit - limit
     * @param {string} chartType - chart type
     */
    addDataRatiosForTreemapChart: function(limit, chartType) {
        this.getSeriesDataModel(chartType).addDataRatios(limit);
    },

    /**
     * Create base values for normal stackType chart.
     * @param {string} chartType - chart type
     * @returns {Array.<number>}
     * @private
     */
    _createBaseValuesForNormalStackedChart: function(chartType) {
        var seriesDataModel = this.getSeriesDataModel(chartType);
        var baseValues = [];

        seriesDataModel.each(function(seriesGroup) {
            var valuesMap = seriesGroup._makeValuesMapPerStack();

            snippet.forEach(valuesMap, function(values) {
                var plusSum = calculator.sumPlusValues(values);
                var minusSum = calculator.sumMinusValues(values);
                baseValues = baseValues.concat([plusSum, minusSum]);
            });
        });

        return baseValues;
    },

    /**
     * Create base values for calculating limit
     * @param {string} chartType - chart type
     * @param {boolean} isSingleYAxis = whether single y axis or not
     * @param {string} stackType - stack type
     * @param {string} valueType - value type
     * @param {string} axisType - value type
     * @returns {Array.<number>}
     */
    createBaseValuesForLimit: function(chartType, isSingleYAxis, stackType, valueType, axisType) {
        var baseValues;

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
    },

    /**
     * Find overflow item than graph area
     * @param {string} chartType - chart type
     * @param {string} valueType - value type
     * @returns {{minItem: SeriesItem, maxItem: SeriesItem}}
     */
    findOverflowItem: function(chartType, valueType) {
        var seriesDataModel = this.getSeriesDataModel(chartType);
        var maxRadiusValue = seriesDataModel.getMaxValue('r');
        var isBiggerRatioThanHalfRatio = function(seriesItem) {
            return (seriesItem.r / maxRadiusValue) > chartConst.HALF_RATIO;
        };

        return {
            minItem: seriesDataModel.findMinSeriesItem(valueType, isBiggerRatioThanHalfRatio),
            maxItem: seriesDataModel.findMaxSeriesItem(valueType, isBiggerRatioThanHalfRatio)
        };
    },

    /**
     * Register color and opacity data of tooltip icon
     * @param {Array.<Array.<object>>} colors - color and opacities setGraphColors
     * @ignore
     */
    setGraphColors: function(colors) {
        this.graphColors = colors;
    },

    /**
     * Get color and opacity data of tooltip data
     * @returns {Array.<Array.<object>>} - color and opacities set
     * @ignore
     */
    getGraphColors: function() {
        return this.graphColors;
    }
});

module.exports = DataProcessor;
