/**
 * @fileoverview Area chart
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var DynamicDataHelper = require('./dynamicDataHelper');
var rawDataHandler = require('../models/data/rawDataHandler');
var Series = require('../components/series/areaChartSeries');
var snippet = require('tui-code-snippet');

var AreaChart = snippet.defineClass(ChartBase, /** @lends AreaChart.prototype */ {
    /**
     * className
     * @type {string}
     */
    className: 'tui-area-chart',

    /**
     * Series class
     * @type {function}
     */
    Series: Series,

    /**
     * Area chart.
     * @constructs AreaChart
     * @extends ChartBase
     * @param {Array.<Array>} rawData - raw data
     * @param {object} theme - chart theme
     * @param {object} options - chart options
     * @mixes axisTypeMixer
     * @mixes lineTypeMixer
     */
    init: function(rawData, theme, options) {
        rawDataHandler.removeSeriesStack(rawData.series);
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
     * Add components
     * @override
     */
    addComponents: function() {
        this.componentManager.register('title', 'title');
        this.componentManager.register('plot', 'plot');
        this.componentManager.register('legend', 'legend');

        this.componentManager.register('areaSeries', 'areaSeries');

        this.componentManager.register('xAxis', 'axis');
        this.componentManager.register('yAxis', 'axis');

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

        if (this.dataProcessor.isCoordinateType()) {
            scaleOption.xAxis = {
                valueType: 'x'
            };
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

module.exports = AreaChart;
