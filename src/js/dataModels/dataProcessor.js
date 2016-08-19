/**
 * @fileoverview DataProcessor process rawData.
 * rawData.categories --> categories
 * rawData.series --> SeriesDataModel, legendLabels, legendData
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const');
var SeriesDataModel = require('../dataModels/seriesDataModel');
var SeriesDataModelForTreemap = require('../dataModels/seriesDataModelForTreemap');
var SeriesGroup = require('./seriesGroup');
var rawDataHandler = require('../helpers/rawDataHandler');
var predicate = require('../helpers/predicate');
var renderUtil = require('../helpers/renderUtil');

var concat = Array.prototype.concat;

/**
 * Raw series datum.
 * @typedef {{name: ?string, data: Array.<number>, stack: ?string}} rawSeriesDatum
 */

/**
 * Raw series data.
 * @typedef {Array.<rawSeriesDatum>} rawSeriesData
 */

/**
 * Raw data by user.
 * @typedef {{
 *      categories: ?Array.<string>,
 *      series: (rawSeriesData|{line: ?rawSeriesData, column: ?rawSeriesData})
 * }} rawData
 */

/**
 * SeriesDataModel is base model for drawing graph of chart series area,
 *      and create from rawSeriesData by user,
 * SeriesDataModel.groups has SeriesGroups.
 */

/**
 * SeriesGroup is a element of SeriesDataModel.groups.
 * SeriesGroup.items has SeriesItem.
 */

var DataProcessor = tui.util.defineClass(/** @lends DataProcessor.prototype */{
    /**
     * Data processor.
     * @constructs DataProcessor
     * @param {rawData} rawData raw data
     * @param {string} chartType chart type
     * @param {object} options options
     * @param {Array.<string>} seriesNames chart types
     */
    init: function(rawData, chartType, options, seriesNames) {
        var seriesOption = options.series || {};

        /**
         * original raw data.
         * @type {{categories: ?Array.<string>, series: Array.<object>}}
         */
        this.originalRawData = JSON.parse(JSON.stringify(rawData));

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
         * seriesNames is sorted chart types for rendering series area of combo chart.
         * @type {Array.<string>}
         */
        this.seriesNames = seriesNames;

        /**
         * diverging option
         * @type {boolean}
         */
        this.divergingOption = predicate.isBarTypeChart(options.chartType) && seriesOption.diverging;

        /**
         * legend data for rendering legend of group tooltip
         * @type {Array.<{chartType: string, label: string}>}
         */
        this.originalLegendData = null;

        /**
         * dynamic data array for adding data.
         * @type {Array.<{category: string | number, values: Array.<number>}>}
         */
        this.dynamicData = [];

        this.initData(rawData);
        this.initZoomedRawData();
    },

    /**
     * Get original raw data.
     * @returns {rawData} raw data
     */
    getOriginalRawData: function() {
        return JSON.parse(JSON.stringify(this.originalRawData));
    },

    /**
     * Get zoomed raw data.
     * @returns {*|null}
     */
    getZoomedRawData: function() {
        var zoomedRawData = this.zoomedRawData;
        if (zoomedRawData) {
            zoomedRawData = JSON.parse(JSON.stringify(zoomedRawData));
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
        tui.util.forEachArray(seriesData, function(seriesDatum) {
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

        if (tui.util.isArray(rawData.series)) {
            rawData.series = this._filterSeriesDataByIndexRange(rawData.series, startIndex, endIndex);
        } else {
            tui.util.forEach(rawData.series, function(seriesDataSet, seriesName) {
                rawData.series[seriesName] = self._filterSeriesDataByIndexRange(seriesDataSet, startIndex, endIndex);
            });
        }

        rawData.categories = rawData.categories.slice(startIndex, endIndex + 1);

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
         * categories
         * @type {Array.<string>}
         */
        this.categoriesMap = null;

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
         * functions for formatting
         * @type {Array.<function>}
         */
        this.formatFunctions = null;

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
     * @param {string} seriesName - series name
     * @returns {*}
     */
    findChartType: function(seriesName) {
        return rawDataHandler.findChartType(this.rawData.seriesAlias, seriesName);
    },

    /**
     * Escape categories
     * @param {Array.<string, number>} categories - cetegories
     * @returns {*|Array.<Object>|Array}
     * @private
     */
    _escapeCategories: function(categories) {
        return tui.util.map(categories, function(category) {
            return tui.util.encodeHTMLEntity(String(category));
        });
    },

    /**
     * Process categories
     * @param {string} type - category type (x or y)
     * @returns {null | Array.<string>} processed categories
     * @private
     */
    _processCategories: function(type) {
        var rawCategories = this.rawData.categories;
        var categoriesMap = {};

        if (tui.util.isArray(rawCategories)) {
            categoriesMap[type] = this._escapeCategories(rawCategories);
        } else if (rawCategories) {
            if (rawCategories.x) {
                categoriesMap.x = this._escapeCategories(rawCategories.x);
            }

            if (rawCategories.y) {
                categoriesMap.y = this._escapeCategories(rawCategories.y).reverse();
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

        if (tui.util.isExisty(isVertical)) {
            foundCategories = this.categoriesMap[type] || [];
        } else {
            tui.util.forEach(this.categoriesMap, function(categories) {
                foundCategories = categories;

                return false;
            });
        }

        return foundCategories;
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
     * Get category.
     * @param {number} index index
     * @param {boolean} isVertical - whether vertical or not
     * @returns {string} category
     */
    getCategory: function(index, isVertical) {
        return this.getCategories(isVertical)[index];
    },

    /**
     * Get category for tooltip.
     * @param {number} firstIndex - index
     * @param {number} oppositeIndex - opposite index
     * @param {boolean} isVerticalChart - whether vertical chart or not
     * @returns {string}
     */
    getTooltipCategory: function(firstIndex, oppositeIndex, isVerticalChart) {
        var isHorizontal = !isVerticalChart;
        var category = this.getCategory(firstIndex, isHorizontal);
        var categoryCount = this.getCategoryCount(!isHorizontal);

        if (categoryCount) {
            category += ', ' + this.getCategory(categoryCount - oppositeIndex - 1, isVerticalChart);
        }

        return category;
    },

    /**
     * Get stacks.
     * @returns {Array.<string>}
     */
    getStacks: function() {
        if (!this.stacks) {
            this.stacks = rawDataHandler.pickStacks(this.rawData.series);
        }

        return this.stacks;
    },

    /**
     * Get stack count.
     * @returns {Number}
     */
    getStackCount: function() {
        return this.getStacks().length;
    },

    /**
     * Find stack index.
     * @param {string} stack stack
     * @returns {number}
     */
    findStackIndex: function(stack) {
        return tui.util.inArray(stack, this.getStacks());
    },

    /**
     * Whether coordinate type or not.
     * @returns {boolean}
     */
    isCoordinateType: function() {
        var coordinateType = this.coordinateType;

        if (!tui.util.isExisty(coordinateType)) {
            coordinateType = predicate.isCoordinateTypeChart(this.chartType);
            coordinateType = coordinateType || (!this.hasCategories() && predicate.isLineTypeChart(this.chartType));
            this.coordinateType = coordinateType;
        }

        return coordinateType;
    },

    /**
     * Get SeriesDataModel.
     * @param {string} seriesName - series name
     * @returns {SeriesDataModel}
     */
    getSeriesDataModel: function(seriesName) {
        var rawSeriesData, chartType, SeriesDataModelClass;

        if (!this.seriesDataModelMap[seriesName]) {
            chartType = this.findChartType(seriesName);
            rawSeriesData = this.rawData.series[seriesName] || this.rawData.series;

            if (predicate.isTreemapChart(this.chartType)) {
                SeriesDataModelClass = SeriesDataModelForTreemap;
            } else {
                SeriesDataModelClass = SeriesDataModel;
            }

            this.seriesDataModelMap[seriesName] = new SeriesDataModelClass(rawSeriesData, chartType,
                this.options, this.getFormatFunctions(), this.isCoordinateType());
        }

        return this.seriesDataModelMap[seriesName];
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
     * @param {string} [seriesName] - series name
     * @returns {object}
     * @private
     */
    _findRawSeriesDatumByName: function(name, seriesName) {
        var foundSeriesDatum = null;
        var seriesData = seriesName ? this.rawData.series[seriesName] : this.rawData.series;

        tui.util.forEachArray(seriesData, function(seriesDatum) {
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
     * @param {string} seriesName - sereis name
     * @private
     */
    _pushValue: function(seriesDatum, value, seriesName) {
        var rawSeriesDatum = this._findRawSeriesDatumByName(seriesDatum.name, seriesName);

        seriesDatum.data.push(value);

        if (rawSeriesDatum) {
            rawSeriesDatum.data.push(value);
        }
    },

    /**
     * Push values to series of originalRawData and series of rawData.
     * @param {Array.<{name: string, data: Array}>} seriesData - series data
     * @param {Array} values - values
     * @param {string} [seriesName] - series name
     * @private
     */
    _pushValues: function(seriesData, values, seriesName) {
        var self = this;

        tui.util.forEachArray(seriesData, function(seriesDatum, index) {
            self._pushValue(seriesDatum, values[index], seriesName);
        });
    },

    /**
     * Push series data.
     * @param {Array.<number>} values - values
     * @private
     */
    _pushSeriesData: function(values) {
        var self = this;

        if (tui.util.isArray(this.originalRawData.series)) {
            this._pushValues(this.originalRawData.series, values);
        } else {
            tui.util.forEach(this.originalRawData.series, function(seriesData, seriesName) {
                self._pushValues(seriesData, values[seriesName], seriesName);
            });
        }
    },

    /**
     * Shift values.
     * @param {Array.<{name: string, data: Array}>} seriesData - series data
     * @param {string} seriesName - series name
     * @private
     */
    _shiftValues: function(seriesData, seriesName) {
        var self = this;

        tui.util.forEachArray(seriesData, function(seriesDatum) {
            var rawSeriesDatum = self._findRawSeriesDatumByName(seriesDatum.name, seriesName);

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

        if (tui.util.isArray(this.originalRawData.series)) {
            this._shiftValues(this.originalRawData.series);
        } else {
            tui.util.forEach(this.originalRawData.series, function(seriesData, seriesName) {
                self._shiftValues(seriesData, seriesName);
            });
        }
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
        tui.util.forEachArray(this.originalRawData.series, function(seriesDatum) {
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

        tui.util.forEach(dynamicData, function(datum) {
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
     * Traverse all SeriesDataModel by seriesNames, and executes iteratee function.
     * @param {function} iteratee iteratee function
     * @private
     */
    _eachByAllSeriesDataModel: function(iteratee) {
        var self = this,
            seriesNames = this.seriesNames || [this.chartType];

        tui.util.forEachArray(seriesNames, function(chartType) {
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

        seriesGroups = tui.util.map(joinedGroups, function(items) {
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
     * Create values that picked value from SeriesItems of specific SeriesDataModel.
     * @param {?string} chartType - type of chart
     * @param {?string} valueType - type of value like value, x, y, r.
     * @returns {Array.<number>}
     * @private
     */
    _createValues: function(chartType, valueType) {
        var values;

        if (chartType === chartConst.DUMMY_KEY) {
            values = [];
            this._eachByAllSeriesDataModel(function(seriesDataModel) {
                values = values.concat(seriesDataModel.getValues(valueType));
            });
        } else {
            values = this.getSeriesDataModel(chartType).getValues(valueType);
        }

        return values;
    },

    /**
     * Get values from valuesMap.
     * @param {?string} chartType - type of chart
     * @param {?string} valueType - type of value like value, x, y, r.
     * @returns {Array.<number>}
     */
    getValues: function(chartType, valueType) {
        var mapKey;

        chartType = chartType || chartConst.DUMMY_KEY;

        mapKey = chartType + valueType;

        if (!this.valuesMap[mapKey]) {
            this.valuesMap[mapKey] = this._createValues(chartType, valueType);
        }

        return this.valuesMap[mapKey];
    },

    /**
     * Get max value.
     * @param {?string} chartType - type of chart
     * @param {?string} valueType - type of value like value, x, y, r
     * @returns {number}
     */
    getMaxValue: function(chartType, valueType) {
        return tui.util.max(this.getValues(chartType, valueType));
    },

    /**
     * Get formatted max value.
     * @param {?string} chartType - type of chart
     * @param {?string} areaType - type of area like circleLegend
     * @param {?string} valueType - type of value like value, x, y, r
     * @returns {string | number}
     */
    getFormattedMaxValue: function(chartType, areaType, valueType) {
        var maxValue = this.getMaxValue(chartType, valueType);
        var formatFunctions = this.getFormatFunctions();

        return renderUtil.formatValue(maxValue, formatFunctions, chartType, areaType, valueType);
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
        return item.name ? tui.util.encodeHTMLEntity(item.name) : null;
    },

    /**
     * Pick legend labels from raw data.
     * @returns {string[]} labels
     */
    _pickLegendLabels: function() {
        var self = this;
        var seriesData = this.rawData.series;
        var legendLabels;

        if (tui.util.isArray(seriesData)) {
            legendLabels = tui.util.map(seriesData, this._pickLegendLabel);
        } else {
            legendLabels = {};
            tui.util.forEach(seriesData, function(seriesDatum, type) {
                legendLabels[type] = tui.util.map(seriesDatum, self._pickLegendLabel);
            });
        }

        legendLabels = tui.util.filter(legendLabels, function(label) {
            return tui.util.isExisty(label);
        });

        return legendLabels;
    },

    /**
     * Get legend labels.
     * @param {?string} chartType chart type
     * @returns {Array.<string> | {column: ?Array.<string>, line: ?Array.<string>}} legend labels
     */
    getLegendLabels: function(chartType) {
        if (!this.legendLabels) {
            this.legendLabels = this._pickLegendLabels();
        }

        return this.legendLabels[chartType] || this.legendLabels;
    },

    /**
     * Make legend data.
     * @returns {Array} labels
     * @private
     */
    _makeLegendData: function() {
        var legendLabels = this.getLegendLabels(),
            seriesNames = this.seriesNames || [this.chartType],
            legendLabelsMap, legendData;

        if (tui.util.isArray(legendLabels)) {
            legendLabelsMap = [this.chartType];
            legendLabelsMap[this.chartType] = legendLabels;
        } else {
            seriesNames = this.seriesNames;
            legendLabelsMap = legendLabels;
        }

        legendData = tui.util.map(seriesNames, function(chartType) {
            return tui.util.map(legendLabelsMap[chartType], function(label) {
                return {
                    chartType: chartType,
                    label: label
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
     * Get format functions.
     * @returns {Array.<function>} functions
     */
    getFormatFunctions: function() {
        if (!this.formatFunctions) {
            this.formatFunctions = this._findFormatFunctions();
        }

        return this.formatFunctions;
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
     * Pick max length under point.
     * @param {string[]} values chart values
     * @returns {number} max length under point
     * @private
     */
    _pickMaxLenUnderPoint: function(values) {
        var max = 0;

        tui.util.forEachArray(values, function(value) {
            var len = tui.util.getDecimalLength(value);
            if (len > max) {
                max = len;
            }
        });

        return max;
    },

    /**
     * Whether zero fill format or not.
     * @param {string} format format
     * @returns {boolean} result boolean
     * @private
     */
    _isZeroFill: function(format) {
        return format.length > 2 && format.charAt(0) === '0';
    },

    /**
     * Whether decimal format or not.
     * @param {string} format format
     * @returns {boolean} result boolean
     * @private
     */
    _isDecimal: function(format) {
        var indexOf = format.indexOf('.');

        return indexOf > -1 && indexOf < format.length - 1;
    },

    /**
     * Whether comma format or not.
     * @param {string} format format
     * @returns {boolean} result boolean
     * @private
     */
    _isComma: function(format) {
        return format.indexOf(',') > -1;
    },

    /**
     * Format to zero fill.
     * @param {number} len length of result
     * @param {string} value target value
     * @returns {string} formatted value
     * @private
     */
    _formatToZeroFill: function(len, value) {
        var isMinus = value < 0;

        value = renderUtil.formatToZeroFill(Math.abs(value), len);

        return (isMinus ? '-' : '') + value;
    },

    /**
     * Format to Decimal.
     * @param {number} len length of under decimal point
     * @param {string} value target value
     * @returns {string} formatted value
     * @private
     */
    _formatToDecimal: function(len, value) {
        return renderUtil.formatToDecimal(value, len);
    },

    /**
     * Find simple type format functions.
     * @param {string} format - simple format
     * @returns {Array.<function>}
     */
    _findSimpleTypeFormatFunctions: function(format) {
        var funcs = [];
        var len;

        if (this._isDecimal(format)) {
            len = this._pickMaxLenUnderPoint([format]);
            funcs = [tui.util.bind(this._formatToDecimal, this, len)];
        } else if (this._isZeroFill(format)) {
            len = format.length;
            funcs = [tui.util.bind(this._formatToZeroFill, this, len)];

            return funcs;
        }

        if (this._isComma(format)) {
            funcs.push(renderUtil.formatToComma);
        }

        return funcs;
    },

    /**
     * Find format functions.
     * @returns {function[]} functions
     */
    _findFormatFunctions: function() {
        var format = tui.util.pick(this.options, 'chart', 'format');
        var funcs = [];

        if (tui.util.isFunction(format)) {
            funcs = [format];
        } else if (tui.util.isString(format)) {
            funcs = this._findSimpleTypeFormatFunctions(format);
        }

        return funcs;
    },

    /**
     * Make multiline category.
     * @param {string} category category
     * @param {number} limitWidth limit width
     * @param {object} theme label theme
     * @returns {string} multiline category
     * @private
     */
    _makeMultilineCategory: function(category, limitWidth, theme) {
        var words = String(category).split(/\s+/),
            lineWords = words[0],
            lines = [];

        tui.util.forEachArray(words.slice(1), function(word) {
            var width = renderUtil.getRenderedLabelWidth(lineWords + ' ' + word, theme);

            if (width > limitWidth) {
                lines.push(lineWords);
                lineWords = word;
            } else {
                lineWords += ' ' + word;
            }
        });

        if (lineWords) {
            lines.push(lineWords);
        }

        return lines.join('<br>');
    },

    /**
     * Get multiline categories.
     * @param {number} limitWidth limit width
     * @param {object} theme label theme
     * @param {Array.<(number | string)>} xAxisLabels labels of xAxis
     * @returns {Array} multiline categories
     */
    getMultilineCategories: function(limitWidth, theme, xAxisLabels) {
        var self = this;

        if (!this.multilineCategories) {
            this.multilineCategories = tui.util.map(xAxisLabels, function(category) {
                return self._makeMultilineCategory(category, limitWidth, theme);
            });
        }

        return this.multilineCategories;
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
            this._addStartValueToAllSeriesItem(limitMap.y, chartType);
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
     * @private
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
    }
});

module.exports = DataProcessor;
