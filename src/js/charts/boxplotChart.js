/**
 * @fileoverview Boxplot chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var rawDataHandler = require('../models/data/rawDataHandler');
var snippet = require('tui-code-snippet');

var BoxplotChart = snippet.defineClass(ChartBase, /** @lends BoxplotChart.prototype */ {
    /**
     * className
     * @type {string}
     */
    className: 'tui-boxplot-chart',

    /**
     * Boxplot chart.
     * @constructs BoxplotChart
     * @extends ChartBase
     * @mixes axisTypeMixer
     * @param {Array.<Array>} rawData raw data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(rawData, theme, options) {
        rawDataHandler.appendOutliersToSeriesData(rawData);

        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options,
            hasAxes: true,
            isVertical: true
        });
    },

    /**
     * Add components
     * @override
     */
    addComponents: function() {
        this.componentManager.register('title', 'title');
        this.componentManager.register('plot', 'plot');
        this.componentManager.register('legend', 'legend');

        this.componentManager.register('boxplotSeries', 'boxplotSeries');

        this.componentManager.register('yAxis', 'axis');
        this.componentManager.register('xAxis', 'axis');

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
            yAxis: true
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
                optionChartTypes: ['boxplot', 'boxplot']
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

module.exports = BoxplotChart;
