/**
 * @fileoverview Column chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var chartConst = require('../const');
var rawDataHandler = require('../models/data/rawDataHandler');
var snippet = require('tui-code-snippet');

var ColumnChart = snippet.defineClass(ChartBase, /** @lends ColumnChart.prototype */ {
    /**
     * className
     * @type {string}
     */
    className: 'tui-column-chart',
    /**
     * Column chart.
     * @constructs ColumnChart
     * @extends ChartBase
     * @mixes axisTypeMixer
     * @mixes verticalTypeMixer
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
            hasAxes: true,
            isVertical: true
        });
    },

    /**
     * Update options related diverging option.
     * @param {object} options - options
     * @private
     */
    _updateOptionsRelatedDiverging: function(options) {
        options.series = options.series || {};

        if (options.series.diverging) {
            options.series.stackType = options.series.stackType || chartConst.NORMAL_STACK_TYPE;
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

        this.componentManager.register('columnSeries', 'columnSeries');

        this.componentManager.register('yAxis', 'axis');
        this.componentManager.register('xAxis', 'axis');

        this.componentManager.register('chartExportMenu', 'chartExportMenu');
        this.componentManager.register('tooltip', 'tooltip');
        this.componentManager.register('mouseEventDetector', 'mouseEventDetector');
    },

    /**
     * Get scale option.
     * @returns {{yAxis: boolean}}
     * @override
     */
    getScaleOption: function() {
        return {
            yAxis: true
        };
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

module.exports = ColumnChart;
