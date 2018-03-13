/**
 * @fileoverview Line and Area Combo chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var rawDataHandler = require('../models/data/rawDataHandler');
var predicate = require('../helpers/predicate');
var validTypeMakerForYAxisOptions = require('./validTypeMakerForYAxisOptions');
var DynamicDataHelper = require('./dynamicDataHelper');
var snippet = require('tui-code-snippet');

var LineAreaComboChart = snippet.defineClass(ChartBase, /** @lends LineAreaComboChart.prototype */ {
    /**
     * className
     * @type {string}
     */
    className: 'tui-combo-chart',
    /**
     * Line and Area Combo chart.
     * @constructs LineAreaComboChart
     * @extends ChartBase
     * @param {Array.<Array>} rawData - raw data
     * @param {object} theme - chart theme
     * @param {object} options - chart options
     */
    init: function(rawData, theme, options) {
        var typeData = validTypeMakerForYAxisOptions({
            rawSeriesData: rawData.series,
            yAxisOptions: options.yAxis
        });

        /**
         * chart types
         * @type {Object}
         */
        this.chartTypes = typeData.chartTypes;

        /**
         * series types
         * @type {Object|Array.<T>}
         */
        this.seriesTypes = typeData.seriesTypes;

        /**
         * yAxis options
         * @type {object}
         */
        this.yAxisOptions = this._makeYAxisOptions(this.chartTypes, options.yAxis);

        /**
         * whether has right y axis or not
         * @type {boolean}
         */
        this.hasRightYAxis = snippet.isArray(options.yAxis) && options.yAxis.length > 1;

        options.tooltip = options.tooltip || {};
        options.tooltip.grouped = true;

        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options,
            hasAxes: true,
            isVertical: true
        });

        this._dynamicDataHelper = new DynamicDataHelper(this);
    },

    /**
     * On change selected legend.
     * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
     */
    onChangeCheckedLegends: function(checkedLegends) {
        var zoomedRawData = this.dataProcessor.getZoomedRawData();
        var rawData = rawDataHandler.filterCheckedRawData(zoomedRawData, checkedLegends);
        var typeData = validTypeMakerForYAxisOptions({
            rawSeriesData: rawData.series,
            yAxisOptions: this.options.yAxis
        });

        this._dynamicDataHelper.reset();
        this._dynamicDataHelper.changeCheckedLegends(checkedLegends, rawData, typeData);
    },
    /**
     * Add components
     * @override
     */
    addComponents: function() {
        this.componentManager.register('title', 'title');
        this.componentManager.register('plot', 'plot');
        this.componentManager.register('legend', 'legend');

        this.componentManager.register('areaSeries', 'areaSeries');
        this.componentManager.register('lineSeries', 'lineSeries');

        this.componentManager.register('xAxis', 'axis');
        this.componentManager.register('yAxis', 'axis');

        if (this.hasRightYAxis) {
            this.componentManager.register('rightYAxis', 'axis');
        }

        this.componentManager.register('chartExportMenu', 'chartExportMenu');
        this.componentManager.register('tooltip', 'tooltip');
        this.componentManager.register('mouseEventDetector', 'mouseEventDetector');
    },
    /**
     * Get scale option.
     * @returns {{
     *      yAxis: {options: object, areaType: string, chartType: string, additionalParams: object},
     *      rightYAxis: {options: object, areaType: string, chartType: string, additionalParams: object}
     * }}
     * @override
     */
    getScaleOption: function() {
        var scaleOption = {
            yAxis: this._makeYAxisScaleOption('yAxis', this.chartTypes[0], !this.hasRightYAxis)
        };

        if (this.hasRightYAxis) {
            scaleOption.rightYAxis = this._makeYAxisScaleOption('rightYAxis', this.chartTypes[1]);
        }

        return scaleOption;
    },
    /**
     * Make y axis scale option.
     * @param {string} name - component name
     * @param {string} chartType - chart type
     * @param {boolean} isSingleYAxis - whether single y axis or not
     * @returns {{options: object, areaType: string, chartType: string, additionalParams: object}}
     * @private
     * from verticalTypeComboMixer
     */
    _makeYAxisScaleOption: function(name, chartType, isSingleYAxis) {
        var yAxisOption = this.yAxisOptions[chartType];
        var additionalOptions = {
            isSingleYAxis: !!isSingleYAxis
        };

        if (isSingleYAxis && this.options.series) {
            this._setAdditionalOptions(additionalOptions);
        }

        return {
            options: yAxisOption,
            areaType: 'yAxis',
            chartType: chartType,
            additionalOptions: additionalOptions
        };
    },
    /**
     * Make yAxis options.
     * @param {Array.<string>} chartTypes chart types
     * @param {?object} yAxisOptions yAxis options
     * @returns {{column: ?object, line: ?object}} options map
     * @private
     * from verticalTypeComboMixer
     */
    _makeYAxisOptions: function(chartTypes, yAxisOptions) {
        var options = {};
        yAxisOptions = yAxisOptions || {};
        snippet.forEachArray(chartTypes, function(chartType, index) {
            options[chartType] = yAxisOptions[index] || yAxisOptions;
        });

        return options;
    },
    /**
     * Add data.
     * @param {string} category - category
     * @param {Array} values - values
     */
    addData: function(category, values) {
        this._dynamicDataHelper.addData(category, values);
    },
    /**
     * Set additional parameter for making y axis scale option.
     * @param {{isSingleYAxis: boolean}} additionalOptions - additional options
     * @private
     * from verticalTypeComboMixer
     */
    _setAdditionalOptions: function(additionalOptions) {
        var dataProcessor = this.dataProcessor;

        snippet.forEach(this.options.series, function(seriesOption, seriesType) {
            var chartType;

            if (!seriesOption.stackType) {
                return;
            }

            chartType = dataProcessor.findChartType(seriesType);

            if (!predicate.isAllowedStackOption(chartType)) {
                return;
            }

            additionalOptions.chartType = chartType;
            additionalOptions.stackType = seriesOption.stackType;
        });
    },
    /**
     * Add data ratios.
     * @override
     */
    addDataRatios: function(limitMap) {
        var self = this;
        var chartTypes = this.chartTypes || [this.chartType];
        var seriesOption = this.options.series || {};
        var addDataRatio;

        if (this.dataProcessor.isCoordinateType()) {
            addDataRatio = function(chartType) {
                self.dataProcessor.addDataRatiosForCoordinateType(chartType, limitMap, false);
            };
        } else {
            addDataRatio = function(chartType) {
                var stackType = (seriesOption[chartType] || seriesOption).stackType;

                self.dataProcessor.addDataRatios(limitMap[chartType], stackType, chartType);
            };
        }

        snippet.forEachArray(chartTypes, addDataRatio);
    },
    /**
     * Render for zoom.
     * from chart/zoomMixer
     * @param {boolean} isResetZoom - whether reset zoom or not
     * @private
     */
    _renderForZoom: function(isResetZoom) {
        var boundsAndScale = this.readyForRender();

        this.componentManager.render('zoom', boundsAndScale, {
            isResetZoom: isResetZoom
        });
    },

    /**
     * On zoom.
     * nnfrom chart/zoomMixer
     * @param {Array.<number>} indexRange - index range for zoom
     * @override
     */
    onZoom: function(indexRange) {
        this._dynamicDataHelper.pauseAnimation();
        this.dataProcessor.updateRawDataForZoom(indexRange);
        this._renderForZoom(false);
    },

    /**
     * On reset zoom.
     * from chart/zoomMixer
     * @override
     */
    onResetZoom: function() {
        var rawData = this.dataProcessor.getOriginalRawData();

        if (this._dynamicDataHelper.checkedLegends) {
            rawData = rawDataHandler.filterCheckedRawData(rawData, this._dynamicDataHelper.checkedLegends);
        }

        this.dataProcessor.initData(rawData);
        this.dataProcessor.initZoomedRawData();
        this.dataProcessor.addDataFromRemainDynamicData(snippet.pick(this.options.series, 'shifting'));
        this._renderForZoom(true);
        this._dynamicDataHelper.restartAnimation();
    }
});

module.exports = LineAreaComboChart;
