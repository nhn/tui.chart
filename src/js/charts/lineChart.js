/**
 * @fileoverview Line chart
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var predicate = require('../helpers/predicate');
var DynamicDataHelper = require('./dynamicDataHelper');
var Series = require('../components/series/lineChartSeries');
var rawDataHandler = require('../models/data/rawDataHandler');
var snippet = require('tui-code-snippet');

var LineChart = snippet.defineClass(ChartBase, /** @lends LineChart.prototype */ {
    /**
     * className
     * @type {string}
     */
    className: 'tui-line-chart',

    /**
     * Series class
     * @type {function}
     */
    Series: Series,

    /**
     * Line chart.
     * @param {Array.<Array>} rawData - raw data
     * @param {object} theme - chart theme
     * @param {object} options - chart options
     * @constructs LineChart
     * @extends ChartBase
     * @mixes axisTypeMixer
     * @mixes lineTypeMixer
     */
    init: function(rawData, theme, options) {
        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options,
            hasAxes: true,
            isVertical: true
        });

        if (this.dataProcessor.isCoordinateType()) {
            delete this.options.xAxis.tickInterval;
            this.options.tooltip.grouped = false;
            this.options.series.shifting = false;
        }

        this._dynamicDataHelper = new DynamicDataHelper(this);
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
     * On change checked legend.
     * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
     * @param {?object} rawData rawData
     * @param {?object} boundsParams addition params for calculating bounds
     * @override
     */
    onChangeCheckedLegends: function(checkedLegends, rawData, boundsParams) {
        this._dynamicDataHelper.reset();
        this._dynamicDataHelper.changeCheckedLegends(checkedLegends, rawData, boundsParams);
    },
    /**
     * Add data ratios.
     * @override
     * from axisTypeMixer
     */
    addDataRatios: function(limitMap) {
        var self = this;
        var chartTypes = this.chartTypes || [this.chartType];
        var seriesOption = this.options.series || {};
        var addDataRatio;

        if (this.dataProcessor.isCoordinateType()) {
            addDataRatio = function(chartType) {
                var hasRadius = predicate.isBubbleChart(chartType);
                self.dataProcessor.addDataRatiosForCoordinateType(chartType, limitMap, hasRadius);
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
     * Add components
     * @override
     */
    addComponents: function() {
        this.componentManager.register('title', 'title');
        this.componentManager.register('plot', 'plot');

        this.componentManager.register('lineSeries', 'lineSeries');

        this.componentManager.register('xAxis', 'axis');
        this.componentManager.register('yAxis', 'axis');

        this.componentManager.register('legend', 'legend');

        this.componentManager.register('chartExportMenu', 'chartExportMenu');

        this.componentManager.register('tooltip', 'tooltip');
        this.componentManager.register('mouseEventDetector', 'mouseEventDetector');
    },
    /**
     * Get scale option.
     * from lineTypeMixer
     * @returns {{xAxis: ?{valueType:string}, yAxis: ?(boolean|{valueType:string})}}
     * @override
     */
    getScaleOption: function() {
        var scaleOption = {};
        var xAxisOption = this.options.xAxis;
        var hasDateFormat, isDateTimeTypeXAxis;

        if (this.dataProcessor.isCoordinateType()) {
            isDateTimeTypeXAxis = xAxisOption && xAxisOption.type === 'datetime';
            hasDateFormat = isDateTimeTypeXAxis && snippet.isExisty(xAxisOption.dateFormat);

            scaleOption.xAxis = {
                valueType: 'x'
            };

            if (isDateTimeTypeXAxis) {
                scaleOption.xAxis.type = (xAxisOption || {}).dateTime;
            }

            if (hasDateFormat) {
                scaleOption.xAxis.format = (xAxisOption || {}).dateFormat;
            }

            scaleOption.yAxis = {
                valueType: 'y'
            };
        } else {
            scaleOption.yAxis = true;
        }

        return scaleOption;
    },

    /**
     * Add plot line.
     * @param {{index: number, color: string, id: string}} data - data
     * @override
     * @api
     */
    addPlotLine: function(data) {
        this.componentManager.get('plot').addPlotLine(data);
    },

    /**
     * Add plot band.
     * @param {{range: Array.<number>, color: string, id: string}} data - data
     * @override
     * @api
     */
    addPlotBand: function(data) {
        this.componentManager.get('plot').addPlotBand(data);
    },

    /**
     * Remove plot line.
     * @param {string} id - line id
     * @override
     * @api
     */
    removePlotLine: function(id) {
        this.componentManager.get('plot').removePlotLine(id);
    },

    /**
     * Remove plot band.
     * @param {string} id - band id
     * @override
     * @api
     */
    removePlotBand: function(id) {
        this.componentManager.get('plot').removePlotBand(id);
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

module.exports = LineChart;
