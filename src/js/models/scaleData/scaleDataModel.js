'use strict';

var scaleDataMaker = require('./scaleDataMaker');
var scaleLabelFormatter = require('./scaleLabelFormatter');
var axisDataMaker = require('./axisDataMaker');
var predicate = require('../../helpers/predicate');
var renderUtil = require('../../helpers/renderUtil');
var snippet = require('tui-code-snippet');

var ScaleDataModel = snippet.defineClass(/** @lends ScaleDataModel.prototype */{
    /**
     * ScaleDataModel is scale model for scale data and axis data.
     * @param {object} params - parameters
     * @constructs ScaleDataModel
     * @private
     */
    init: function(params) {
        this.chartType = params.chartType;
        this.seriesTypes = params.seriesTypes;
        this.dataProcessor = params.dataProcessor;
        this.boundsModel = params.boundsModel;
        this.options = params.options;
        this.theme = params.theme;
        this.hasRightYAxis = !!params.hasRightYAxis;
        this.prevValidLabelCount = null;

        this.initScaleData(params.addedDataCount);
        this.initForAutoTickInterval();
    },

    /**
     * Initialize scale data.
     * @param {?number} addedDataCount - increased added count by dynamic adding data
     */
    initScaleData: function(addedDataCount) {
        this.scaleDataMap = {};
        this.axisDataMap = {};
        this.addedDataCount = addedDataCount;
    },

    /**
     * Initialize for auto tick interval.
     */
    initForAutoTickInterval: function() {
        this.firstTickCount = null;
    },

    /**
     * Pick limit option.
     * @param {{min: ?number, max: ?number}} axisOptions - axis options
     * @returns {{min: ?number, max: ?number}}
     * @private
     */
    _pickLimitOption: function(axisOptions) {
        axisOptions = axisOptions || {};

        return {
            min: axisOptions.min,
            max: axisOptions.max
        };
    },

    /**
     * Create base scale data.
     * @param {{
     *      chartType: string,
     *      areaType: string,
     *      valueType: string
     * }} typeMap - type map
     * @param {{
     *      type: string,
     *      stackType: string,
     *      diverging: boolean
     * }} baseOptions - base options
     * @param {object} axisOptions - axis options
     * @param {object} additionalOptions - additional options
     * @returns {{limit: {min: number, max: number}, step: number}}
     * @private
     */
    _createBaseScaleData: function(typeMap, baseOptions, axisOptions, additionalOptions) {
        var chartType = typeMap.chartType;
        var isVertical = typeMap.areaType !== 'xAxis';
        var baseValues = this.dataProcessor.createBaseValuesForLimit(
            chartType, additionalOptions.isSingleYAxis, baseOptions.stackType, typeMap.valueType, typeMap.areaType);
        var baseSize = this.boundsModel.getBaseSizeForLimit(isVertical);
        var options = snippet.extend(baseOptions, {
            isVertical: isVertical,
            limitOption: this._pickLimitOption(axisOptions),
            tickCounts: additionalOptions.tickCounts
        });

        if (predicate.isBubbleChart(chartType)) {
            options.overflowItem = this.dataProcessor.findOverflowItem(chartType, typeMap.valueType);
        }

        return scaleDataMaker.makeScaleData(baseValues, baseSize, chartType, options);
    },

    /**
     * Create scale labels.
     * @param {{limit: {min: number, max: number}, step: number}} baseScaleData - base scale data
     * @param {{
     *      chartType: string,
     *      areaType: string,
     *      valueType: string
     * }} typeMap - type map
     * @param {{
     *      type: string,
     *      stackType: string,
     *      diverging: boolean
     * }} baseOptions - base options
     * @param {string} dateFormat - date format
     * @returns {Array.<string>}
     * @private
     */
    _createScaleLabels: function(baseScaleData, typeMap, baseOptions, dateFormat) {
        var formatFunctions = this.dataProcessor.getFormatFunctions();
        var options = snippet.extend(baseOptions, {
            dateFormat: dateFormat
        });

        return scaleLabelFormatter.createFormattedLabels(baseScaleData, typeMap, options, formatFunctions);
    },

    /**
     * Create scale.
     * @param {object} axisOptions - axis options
     * @param {{chartType: string, areaType: string, valueType: string}} typeMap - type map
     * @param {?object} additionalOptions - additional options
     * @returns {object}
     * @private
     */
    _createScaleData: function(axisOptions, typeMap, additionalOptions) {
        var seriesOptions = this.options.series;
        var chartType = typeMap.chartType || this.chartType;
        var baseOptions, baseScaleData;

        typeMap.chartType = chartType;
        seriesOptions = seriesOptions[chartType] || seriesOptions;
        baseOptions = {
            stackType: additionalOptions.stackType || seriesOptions.stackType,
            diverging: seriesOptions.diverging,
            type: axisOptions.type
        };
        baseScaleData = this._createBaseScaleData(typeMap, baseOptions, axisOptions, additionalOptions);

        return snippet.extend(baseScaleData, {
            labels: this._createScaleLabels(baseScaleData, typeMap, baseOptions, axisOptions.dateFormat),
            axisOptions: axisOptions
        });
    },

    /**
     * Create value type axis data.
     * @param {{labels: Array.<string>, limit: {min: number, max: number}, step: number}} scaleData - scale data
     * @param {object} labelTheme - label theme
     * @param {boolean} aligned - aligned tick and label
     * @param {boolean} isVertical - whether vertical or not
     * @param {boolean} isPositionRight - whether right position or not
     * @returns {{
     *      labels: Array.<string>,
     *      tickCount: number,
     *      validTickCount: number,
     *      isLabelAxis: boolean,
     *      limit: {min: number, max: number},
     *      isVertical: boolean
     * }}
     * @private
     */
    _createValueAxisData: function(scaleData, labelTheme, aligned, isVertical, isPositionRight) {
        var hasCategories = this.dataProcessor.hasCategories();
        var isCoordinateLineType = !isVertical && !hasCategories && aligned;
        var labels = scaleData.labels;
        var limit = scaleData.limit;
        var step = scaleData.step;
        var tickCount = labels.length;
        var values, additional;

        var axisData = axisDataMaker.makeValueAxisData({
            labels: labels,
            tickCount: labels.length,
            limit: limit,
            step: step,
            options: scaleData.axisOptions,
            labelTheme: labelTheme,
            isVertical: !!isVertical,
            isPositionRight: !!isPositionRight,
            aligned: aligned
        });

        if (isCoordinateLineType) {
            values = this.dataProcessor.getValues(this.chartType, 'x');
            additional = axisDataMaker.makeAdditionalDataForCoordinateLineType(labels, values, limit, step, tickCount);
            snippet.extend(axisData, additional);
        }

        return axisData;
    },

    /**
     * Create label type axis data.
     * @param {object} axisOptions - options for axis
     * @param {object} labelTheme - label theme
     * @param {boolean} aligned - aligned tick and label
     * @param {boolean} isVertical - whether vertical or not
     * @param {boolean} isPositionRight - whether right position or not
     * @returns {{
     *      labels: Array.<string>,
     *      tickCount: number,
     *      validTickCount: number,
     *      isLabelAxis: boolean,
     *      options: object,
     *      isVertical: boolean,
     *      isPositionRight: boolean,
     *      aligned: boolean
     * }}
     * @private
     */
    _createLabelAxisData: function(axisOptions, labelTheme, aligned, isVertical, isPositionRight) {
        return axisDataMaker.makeLabelAxisData({
            labels: this.dataProcessor.getCategories(isVertical),
            options: axisOptions,
            labelTheme: labelTheme,
            isVertical: !!isVertical,
            isPositionRight: !!isPositionRight,
            aligned: aligned,
            addedDataCount: this.options.series.shifting ? this.addedDataCount : 0
        });
    },

    /**
     * Create axis data.
     * @param {object} scaleData - scale data
     * @param {object} axisOptions - axis options
     * @param {object} labelTheme - them for label
     * @param {boolean} isVertical - whether vertical or not
     * @param {boolean} isPositionRight - whether right position or not
     * @returns {object}
     * @private
     */
    _createAxisData: function(scaleData, axisOptions, labelTheme, isVertical, isPositionRight) {
        var aligned = predicate.isLineTypeChart(this.chartType, this.seriesTypes) && !axisOptions.pointOnColumn;
        var axisData;

        if (scaleData) {
            axisData = this._createValueAxisData(scaleData, labelTheme, aligned, isVertical, isPositionRight);
        } else {
            axisData = this._createLabelAxisData(axisOptions, labelTheme, aligned, isVertical, isPositionRight);
        }

        return axisData;
    },

    /**
     * Create axes data.
     * @returns {object.<string, object>}
     * @private
     */
    _createAxesData: function() {
        var scaleDataMap = this.scaleDataMap;
        var options = this.options;
        var theme = this.theme;
        var yAxisOptions = snippet.isArray(options.yAxis) ? options.yAxis : [options.yAxis];
        var dataMap = {};

        dataMap.xAxis = this._createAxisData(scaleDataMap.xAxis, options.xAxis, theme.xAxis.label);
        dataMap.yAxis = this._createAxisData(scaleDataMap.yAxis, yAxisOptions[0], theme.yAxis.label, true);

        if (this.hasRightYAxis) {
            dataMap.rightYAxis = this._createAxisData(
                scaleDataMap.rightYAxis, yAxisOptions[1], theme.yAxis.label, true, true
            );
            dataMap.rightYAxis.aligned = dataMap.xAxis.aligned;
        }

        return dataMap;
    },

    /**
     * Add scale.
     * @param {string} axisName - axis name
     * @param {options} axisOptions - axis options
     * @param {{chartType: string, areaType: string}} typeMap - type map
     * @param {object} additionalOptions - additional parameters
     */
    addScale: function(axisName, axisOptions, typeMap, additionalOptions) {
        typeMap = typeMap || {};
        additionalOptions = additionalOptions || {};
        typeMap.areaType = typeMap.areaType || axisName;
        typeMap.chartType = additionalOptions.chartType || typeMap.chartType;

        this.scaleDataMap[axisName] = this._createScaleData(axisOptions, typeMap, additionalOptions);
    },

    /**
     * Set axis data map.
     */
    setAxisDataMap: function() {
        this.axisDataMap = this._createAxesData();
    },

    /**
     * Update x axis data for auto tick interval.
     * @param {object} prevXAxisData - previous xAxis data
     * @param {?boolean} addingDataMode - whether adding data mode or not
     */
    updateXAxisDataForAutoTickInterval: function(prevXAxisData, addingDataMode) {
        var shiftingOption = this.options.series.shifting;
        var zoomableOption = this.options.series.zoomable;
        var xAxisData = this.axisDataMap.xAxis;
        var seriesWidth = this.boundsModel.getDimension('series').width;
        var addedCount = this.addedDataCount;

        if (shiftingOption || !prevXAxisData || zoomableOption) {
            axisDataMaker.updateLabelAxisDataForAutoTickInterval(xAxisData, seriesWidth, addedCount, addingDataMode);
        } else {
            axisDataMaker.updateLabelAxisDataForStackingDynamicData(xAxisData, prevXAxisData, this.firstTickCount);
        }

        if (!this.firstTickCount) {
            this.firstTickCount = xAxisData.tickCount;
        }
    },

    /**
     * Update x axis data for label.
     * @param {?boolean} addingDataMode - whether adding data mode or not
     */
    updateXAxisDataForLabel: function(addingDataMode) {
        var axisData = this.axisDataMap.xAxis;
        var labels = axisData.labels;
        var dimensionMap = this.boundsModel.getDimensionMap(['series', 'yAxis', 'chart']);
        var isLabelAxis = axisData.isLabelAxis;
        var theme = this.theme.xAxis.label;
        var validLabels, validLabelCount, additionalData;

        if (addingDataMode) {
            labels = labels.slice(0, labels.length - 1);
        }

        labels = renderUtil.addPrefixSuffix(labels, this.options.xAxis.prefix, this.options.xAxis.suffix);

        validLabels = snippet.filter(labels, function(label) {
            return !!label;
        });

        if (!snippet.isNull(this.prevValidLabelCount)) {
            validLabelCount = this.prevValidLabelCount;
        } else {
            validLabelCount = validLabels.length;
        }

        if (this.options.yAxis.isCenter) {
            validLabelCount += 1;
            dimensionMap.yAxis.width = 0;
        }

        if (axisData.options.rotateLabel === false) {
            additionalData = axisDataMaker.makeAdditionalDataForMultilineLabels(
                labels, validLabelCount, theme, isLabelAxis, dimensionMap
            );
        } else {
            additionalData = axisDataMaker.makeAdditionalDataForRotatedLabels(
                validLabels, validLabelCount, theme, isLabelAxis, dimensionMap
            );
        }

        this.prevValidLabelCount = validLabelCount;

        snippet.extend(axisData, additionalData);
    },

    /**
     * Find limit from limitMap by seriesIndex
     * @param {object} limitMap - limit map
     * @param {number} seriesIndex - series index
     * @param {boolean} isVertical - whether vertical or not
     * @returns {boolean}
     * @private
     */
    _findLimit: function(limitMap, seriesIndex, isVertical) {
        var limit;

        if (seriesIndex === 0) {
            limit = isVertical ? limitMap.yAxis : limitMap.xAxis;
        } else {
            limit = limitMap.rightYAxis ? limitMap.rightYAxis : limitMap.yAxis;
        }

        return limit;
    },

    /**
     * Make limit map.
     * @param {Array.<string>} seriesTypes - series types like bar, column, line, area
     * @param {boolean} isVertical - whether vertical or not
     * @returns {{
     *      xAxis: ?{min: number, max: number},
     *      yAxis: ?{min: number, max: number},
     *      rightYAxis: ?{min: number, max: number},
     *      legend: ?{min: number, max: number},
     *      bar: ?{min: number, max: number}
     * }}
     * @private
     */
    makeLimitMap: function(seriesTypes, isVertical) {
        var self = this;
        var scaleDataMap = this.scaleDataMap;
        var limitMap = {};

        if (scaleDataMap.xAxis) {
            limitMap.xAxis = scaleDataMap.xAxis.limit;
        }

        if (scaleDataMap.yAxis) {
            limitMap.yAxis = scaleDataMap.yAxis.limit;
        }

        if (scaleDataMap.rightYAxis) {
            limitMap.rightYAxis = scaleDataMap.rightYAxis.limit;
        }

        if (scaleDataMap.legend) {
            limitMap.legend = scaleDataMap.legend.limit;
        }

        snippet.forEachArray(seriesTypes, function(seriesType, index) {
            limitMap[seriesType] = self._findLimit(limitMap, index, isVertical);
        });

        return limitMap;
    }
});

module.exports = ScaleDataModel;
