/**
 * @fileoverview Map chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var mapManager = require('../factories/mapManager');
var MapChartMapModel = require('./mapChartMapModel');
var MapChartDataProcessor = require('../models/data/mapChartDataProcessor');
var ColorSpectrum = require('./colorSpectrum');
var snippet = require('tui-code-snippet');

var MapChart = snippet.defineClass(ChartBase, /** @lends MapChart.prototype */ {
    /**
     * Map chart.
     * @constructs MapChart
     * @extends ChartBase
     * @param {Array.<Array>} rawData raw data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(rawData, theme, options) {
        /**
         * class name
         * @type {string}
         */
        this.className = 'tui-map-chart';

        options.map = mapManager.get(options.map);
        options.tooltip = options.tooltip || {};
        options.legend = options.legend || {};

        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options,
            DataProcessor: MapChartDataProcessor
        });
    },

    /**
     * Add components.
     * @override
     * @private
     */
    addComponents: function() {
        var seriesTheme = this.theme.series[this.chartType];
        var mapModel = new MapChartMapModel(this.dataProcessor, this.options.map);
        var colorSpectrum = new ColorSpectrum(seriesTheme.startColor, seriesTheme.endColor);

        this.componentManager.register('mapSeries', 'mapSeries', {
            mapModel: mapModel,
            colorSpectrum: colorSpectrum
        });

        this.componentManager.register('title', 'title');

        this.componentManager.register('legend', 'spectrumLegend', {
            colorSpectrum: colorSpectrum
        });

        this.componentManager.register('tooltip', 'tooltip', {
            mapModel: mapModel
        });

        this.componentManager.register('zoom', 'zoom');
        this.componentManager.register('mouseEventDetector', 'mapChartEventDetector');
    },

    /**
     * Get scale option.
     * @returns {{legend: boolean}}
     * @override
     */
    getScaleOption: function() {
        return {
            legend: true
        };
    },

    /**
     * Add data ratios.
     * @override
     */
    addDataRatios: function(limitMap) {
        this.dataProcessor.addDataRatios(limitMap.legend);
    }
});

module.exports = MapChart;
