'use strict';

var ScaleMaker = require('./scaleMaker');
var axisDataMaker = require('./axisDataMaker');
var predicate = require('../helpers/predicate');

var ScaleModel = tui.util.defineClass(/** @lends ScaleModel.prototype */{
    /**
     * ScaleModel is scale model for scale data and axis data.
     * @param {object} params - parameters
     * @constructs ScaleModel
     */
    init: function(params) {
        this.chartType = params.chartType;
        this.seriesNames = params.seriesNames;
        this.dataProcessor = params.dataProcessor;
        this.boundsMaker = params.boundsMaker;
        this.options = params.options;
        this.theme = params.theme;
        this.hasRightYAxis = !!params.hasRightYAxis;
        this.prevValidLabelCount = null;

        this.initScaleData();
        this.initForAutoTickInterval();
    },

    /**
     * Initialize scale data.
     * @param {?number} addedDataCount - increased added count by dynamic adding data
     */
    initScaleData: function(addedDataCount) {
        this.scaleMap = {};
        this.axisDataMap = null;
        this.addedDataCount = addedDataCount || 0;
    },

    /**
     * Initialize for auto tick interval.
     */
    initForAutoTickInterval: function() {
        this.prevUpdatedData = null;
        this.firstTickCount = null;
    },

    /**
     * Pick limt option.
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
     * Create scale.
     * @param {object} axisOptions - axis options
     * @param {{chartType: string, areaType: string}} typeMap - type map
     * @param {?object} additionalParams - additional parameters
     * @returns {object}
     * @private
     */
    _createScale: function(axisOptions, typeMap, additionalParams) {
        var seriesOptions = this.options.series;
        var chartType = typeMap.chartType || this.chartType;
        seriesOptions = seriesOptions[chartType] || seriesOptions;

        return new ScaleMaker(tui.util.extend({
            dataProcessor: this.dataProcessor,
            boundsMaker: this.boundsMaker,
            stackType: seriesOptions.stackType,
            diverging: seriesOptions.diverging,
            axisOptions: axisOptions,
            limitOption: this._pickLimitOption(axisOptions),
            type: axisOptions.type,
            dateFormat: axisOptions.dateFormat,
            isVertical: typeMap.areaType !== 'xAxis',
            areaType: typeMap.areaType,
            valueType: typeMap.valueType,
            chartType: chartType
        }, additionalParams));
    },

    /**
     * Create value type axis data.
     * @param {ScaleMaker} scaleData - scale data
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
        var labels = scaleData.getFormattedScaleValues();
        var tickCount = labels.length;
        var limit = scaleData.getLimit();
        var step = scaleData.getStep();
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
            tui.util.extend(axisData, additional);
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
        var aligned = predicate.isLineTypeChart(this.chartType, this.seriesNames);
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
        var scaleMap = this.scaleMap;
        var options = this.options;
        var theme = this.theme;
        var dataMap = {};

        dataMap.xAxis = this._createAxisData(scaleMap.xAxis, options.xAxis, theme.xAxis.label);
        dataMap.yAxis = this._createAxisData(scaleMap.yAxis, options.yAxis, theme.yAxis.label, true);

        if (this.hasRightYAxis) {
            dataMap.rightYAxis = this._createAxisData(scaleMap.rightYAxis, null, theme.yAxis.label, true, true);
            dataMap.rightYAxis.aligned = dataMap.xAxis.aligned;
        }

        if (scaleMap.legend) {
            dataMap.legend = this._createAxisData(scaleMap.legend);
        }

        return dataMap;
    },

    /**
     * Add scale.
     * @param {string} axisName - axis name
     * @param {options} axisOptions - axis options
     * @param {{chartType: string, areaType: string}} typeMap - type map
     * @param {object} additionalParams - additional parameters
     */
    addScale: function(axisName, axisOptions, typeMap, additionalParams) {
        typeMap = typeMap || {};
        typeMap.areaType = typeMap.areaType || axisName;
        this.scaleMap[axisName] = this._createScale(axisOptions, typeMap, additionalParams);
    },

    /**
     * Get scale map.
     * @returns {object}
     */
    getScaleMap: function() {
        return this.scaleMap;
    },

    /**
     * Get axis data map.
     * @returns {object}
     */
    getAxisDataMap: function() {
        if (!this.axisDataMap) {
            this.axisDataMap = this._createAxesData();
        }

        return this.axisDataMap;
    },

    /**
     * Get axis data.
     * @param {string} axisName - axis name like xAxis, yAxis
     * @returns {object}
     */
    getAxisData: function(axisName) {
        return this.getAxisDataMap()[axisName];
    },

    /**
     * Update x axis data for auto tick interval.
     * @param {?boolean} addingDataMode - whether adding data mode or not
     */
    updateXAxisDataForAutoTickInterval: function(addingDataMode) {
        var shiftingOption = this.options.series.shifting;
        var xAxisData = this.getAxisData('xAxis');
        var seriesWidth = this.boundsMaker.getDimension('series').width;
        var prevData = this.prevUpdatedData;
        var addedCount = this.addedDataCount;

        if (shiftingOption || !prevData) {
            axisDataMaker.updateLabelAxisDataForAutoTickInterval(xAxisData, seriesWidth, addedCount, addingDataMode);
        } else {
            axisDataMaker.updateLabelAxisDataForStackingDynamicData(xAxisData, prevData, this.firstTickCount);
        }

        this.prevUpdatedData = xAxisData;

        if (!this.firstTickCount) {
            this.firstTickCount = xAxisData.tickCount;
        }
    },

    /**
     * Update x axis data for label.
     * @param {?boolean} addingDataMode - whether adding data mode or not
     */
    updateXAxisDataForLabel: function(addingDataMode) {
        var axisData = this.getAxisData('xAxis');
        var labels = axisData.labels;
        var dimensionMap = this.boundsMaker.getDimensionMap(['series', 'yAxis']);
        var seriesWidth = dimensionMap.series.width;
        var aligned = axisData.aligned;
        var theme = this.theme.xAxis.label;
        var validLabels, validLabelCount, additionalData;

        if (addingDataMode) {
            labels = labels.slice(0, labels.length - 1);
        }

        validLabels = tui.util.filter(labels, function(label) {
            return !!label;
        });

        if (!tui.util.isNull(this.prevValidLabelCount)) {
            validLabelCount = this.prevValidLabelCount;
        } else {
            validLabelCount = validLabels.length;
        }

        if (axisData.options.rotateLabel === false) {
            additionalData = axisDataMaker.makeAdditionalDataForMultilineLabels(
                labels, validLabelCount, theme, aligned, seriesWidth
            );
        } else {
            additionalData = axisDataMaker.makeAdditionalDataForRotatedLabels(
                validLabels, validLabelCount, theme, aligned, dimensionMap
            );
        }

        this.prevValidLabelCount = validLabelCount;

        tui.util.extend(axisData, additionalData);
    }
});

module.exports = ScaleModel;
