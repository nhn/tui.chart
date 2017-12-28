/**
 * @fileoverview Bar chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var chartConst = require('../const');
var rawDataHandler = require('../models/data/rawDataHandler');
var predicate = require('../helpers/predicate');
var snippet = require('tui-code-snippet');

var BarChart = snippet.defineClass(ChartBase, /** @lends BarChart.prototype */ {
    /**
     * className
     * @type {string}
     */
    className: 'tui-bar-chart',
    /**
     * Bar chart.
     * @constructs BarChart
     * @extends ChartBase
     * @mixes axisTypeMixer
     * @param {Array.<Array>} rawData raw data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(rawData, theme, options) {
        rawDataHandler.updateRawSeriesDataByOptions(rawData, options.series);
        this._updateOptionsRelatedDiverging(options);

        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options,
            hasAxes: true
        });
    },

    /**
     * Update options related diverging option.
     * @param {object} options - options
     * @private
     */
    _updateOptionsRelatedDiverging: function(options) {
        var isCenter;

        options.series = options.series || {};

        /**
         * Whether has right y axis or not.
         * @type {boolean}
         */
        this.hasRightYAxis = false;

        if (options.series.diverging) {
            options.yAxis = options.yAxis || {};
            options.xAxis = options.xAxis || {};
            options.plot = options.plot || {};

            options.series.stackType = options.series.stackType || chartConst.NORMAL_STACK_TYPE;
            this.hasRightYAxis = snippet.isArray(options.yAxis) && options.yAxis.length > 1;

            isCenter = predicate.isYAxisAlignCenter(this.hasRightYAxis, options.yAxis.align);

            options.yAxis.isCenter = isCenter;
            options.xAxis.divided = isCenter;
            options.series.divided = isCenter;
            options.plot.divided = isCenter;
        }
    },

    /**
     * Add components
     * @override
     */
    addComponents: function() {
        this.componentManager.register('title', 'title');
        this.componentManager.register('plot', 'plot');
        this.componentManager.register('legend', 'legend');

        this.componentManager.register('barSeries', 'barSeries');

        this.componentManager.register('yAxis', 'axis');
        this.componentManager.register('xAxis', 'axis');

        if (this.hasRightYAxis) {
            this.componentManager.register('rightYAxis', 'axis');
        }

        this.componentManager.register('chartExportMenu', 'chartExportMenu');
        this.componentManager.register('tooltip', 'tooltip');
        this.componentManager.register('mouseEventDetector', 'mouseEventDetector');
    },

    /**
     * Get scale option.
     * @returns {{xAxis: boolean}}
     * @override
     */
    getScaleOption: function() {
        return {
            xAxis: true
        };
    },

    /**
     * On change selected legend.
     * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
     */
    onChangeCheckedLegends: function(checkedLegends) {
        var boundParams;

        if (this.hasRightYAxis) {
            boundParams = {
                optionChartTypes: ['bar', 'bar']
            };
        }
        ChartBase.prototype.onChangeCheckedLegends.call(this, checkedLegends, null, boundParams);
    },
    /**
     * Add data ratios.
     * @override
     * modified from axisTypeMixer
     */
    addDataRatios: function(limitMap) {
        var seriesOption = this.options.series || {};
        var chartType = this.chartType;
        var stackType = (seriesOption[chartType] || seriesOption).stackType;

        this.dataProcessor.addDataRatios(limitMap[chartType], stackType, chartType);
    }
});

module.exports = BarChart;
