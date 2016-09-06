'use strict';

var ScaleMaker = require('./scaleMaker');
var axisDataMaker = require('./axisDataMaker');
var predicate = require('../helpers/predicate');
var renderUtil = require('../helpers/renderUtil');

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
        this.hasRightYAxis = !!params.hasRightYAxis;

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
        this.multilineXAxisLabels = null;
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
     * Create axis data.
     * @param {object} scaleData - scale data
     * @param {object} axisOptions - axis options
     * @param {boolean} isVertical - whether vertical or not
     * @param {boolean} isPositionRight - whether right position or not
     * @returns {object}
     * @private
     */
    _createAxisData: function(scaleData, axisOptions, isVertical, isPositionRight) {
        var chartType = this.chartType;
        var dataProcessor = this.dataProcessor;
        var aligned = predicate.isLineTypeChart(chartType, this.seriesNames);
        var axisData;

        if (scaleData) {
            axisData = axisDataMaker.makeValueAxisData({
                axisScaleMaker: scaleData,
                dataProcessor: dataProcessor,
                chartType: chartType,
                options: scaleData.axisOptions,
                isVertical: !!isVertical,
                isPositionRight: !!isPositionRight,
                aligned: aligned
            });
        } else {
            axisData = axisDataMaker.makeLabelAxisData({
                labels: dataProcessor.getCategories(isVertical),
                options: axisOptions,
                isVertical: !!isVertical,
                isPositionRight: !!isPositionRight,
                aligned: aligned,
                addedDataCount: this.options.series.shifting ? this.addedDataCount : 0
            });
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
        var dataMap = {};

        dataMap.xAxis = this._createAxisData(scaleMap.xAxis, options.xAxis);
        dataMap.yAxis = this._createAxisData(scaleMap.yAxis, options.yAxis, true);

        if (this.hasRightYAxis) {
            dataMap.rightYAxis = this._createAxisData(scaleMap.rightYAxis, null, true, true);
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
     * Update x axis data.
     */
    updateXAxisData: function() {
        var shiftingOption = this.options.series.shifting;
        var xAxisData = this.getAxisData('xAxis');
        var seriesWidth = this.boundsMaker.getDimension('series').width;
        var prevData = this.prevUpdatedData;

        if (shiftingOption || !prevData) {
            axisDataMaker.updateLabelAxisDataForAutoTickInterval(xAxisData, seriesWidth, this.addedDataCount);
        } else {
            axisDataMaker.updateLabelAxisDataForStackingDynamicData(xAxisData, prevData, this.firstTickCount);
        }

        this.prevUpdatedData = xAxisData;

        if (!this.firstTickCount) {
            this.firstTickCount = xAxisData.tickCount;
        }
    },

    /**
     * Create multiline label.
     * @param {string} label - label
     * @param {number} limitWidth - limit width
     * @param {object} theme - label theme
     * @returns {string}
     * @private
     */
    _createMultilineLabel: function(label, limitWidth, theme) {
        var words = String(label).split(/\s+/);
        var lineWords = words[0];
        var lines = [];

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
     * Get multiline labels for x axis.
     * @param {number} limitWidth - limit width
     * @param {object} theme - theme
     * @returns {null|Array|*}
     */
    getMultilineXAxisLabels: function(limitWidth, theme) {
        var self = this;
        var axesData;

        if (!this.multilineXAxisLabels) {
            axesData = this.getAxisDataMap();
            this.multilineXAxisLabels = tui.util.map(axesData.xAxis.labels, function(label) {
                return self._createMultilineLabel(label, limitWidth, theme);
            });
        }

        return this.multilineXAxisLabels;
    }
});

module.exports = ScaleModel;
