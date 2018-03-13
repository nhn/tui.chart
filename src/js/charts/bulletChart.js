/**
 * @fileoverview Bullet chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var rawDataHandler = require('../models/data/rawDataHandler');
var snippet = require('tui-code-snippet');

var BulletChart = snippet.defineClass(ChartBase, /** @lends BulletChart.prototype */ {
    /**
     * className
     * @type {string}
     */
    className: 'tui-bullet-chart',

    /**
     * Bullet chart.
     * @constructs BulletChart
     * @extends ChartBase
     * @mixes axisTypeMixer
     * @param {Array.<Array>} rawData raw data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(rawData, theme, options) {
        var isVertical = !!options.series.vertical;

        rawDataHandler._makeRawSeriesDataForBulletChart(rawData);

        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options,
            hasAxes: true,
            isVertical: isVertical
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

        this.componentManager.register('bulletSeries', 'bulletSeries');

        this.componentManager.register('yAxis', 'axis');
        this.componentManager.register('xAxis', 'axis');

        this.componentManager.register('chartExportMenu', 'chartExportMenu', {chartType: 'bullet'});
        this.componentManager.register('tooltip', 'tooltip');
        this.componentManager.register('mouseEventDetector', 'mouseEventDetector');
    },

    /**
     * Get scale option.
     * @returns {{xAxis: boolean}}
     * @override
     */
    getScaleOption: function() {
        if (this.isVertical) {
            return {
                yAxis: true
            };
        }

        return {
            xAxis: true
        };
    },

    /**
     * Add data ratios.
     * @override
     * modified from axisTypeMixer
     */
    addDataRatios: function(limitMap) {
        var chartType = this.chartType;

        this.dataProcessor.addDataRatios(limitMap[chartType], null, chartType);
    }
});

module.exports = BulletChart;
