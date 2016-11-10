/**
 * @fileoverview Map chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var mapManager = require('../factories/mapManager');
var MapChartMapModel = require('./mapChartMapModel');
var ColorSpectrum = require('./colorSpectrum');
var MapChartDataProcessor = require('../models/data/mapChartDataProcessor');
var Series = require('../components/series/mapChartSeries');
var Zoom = require('../components/series/zoom');
var Legend = require('../components/legends/spectrumLegend');
var MapChartTooltip = require('../components/tooltips/mapChartTooltip');
var mapChartEventDetector = require('../components/mouseEventDetectors/mapChartEventDetector');

var MapChart = tui.util.defineClass(ChartBase, /** @lends MapChart.prototype */ {
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
     * @private
     */
    _addComponents: function() {
        var options = this.options;
        var seriesTheme = this.theme.series[this.chartType];
        var colorSpectrum = new ColorSpectrum(seriesTheme.startColor, seriesTheme.endColor);
        var mapModel = new MapChartMapModel(this.dataProcessor, this.options.map);

        options.legend = options.legend || {};

        if (options.legend.visible) {
            this.componentManager.register('legend', Legend, {
                colorSpectrum: colorSpectrum
            });
        }

        this.componentManager.register('tooltip', MapChartTooltip, tui.util.extend({
            mapModel: mapModel
        }, this._makeTooltipData()));

        this.componentManager.register('mapSeries', Series, {
            libType: options.libType,
            chartType: options.chartType,
            componentType: 'series',
            mapModel: mapModel,
            colorSpectrum: colorSpectrum
        });

        this.componentManager.register('zoom', Zoom);

        this.componentManager.register('mouseEventDetector', mapChartEventDetector, {
            chartType: this.chartType
        });
    },

    /**
     * Get scale option.
     * @returns {{legend: boolean}}
     * @private
     * @override
     */
    _getScaleOption: function() {
        return {
            legend: true
        };
    },

    /**
     * Add data ratios.
     * @private
     * @override
     */
    _addDataRatios: function(limitMap) {
        this.dataProcessor.addDataRatios(limitMap.legend);
    }
});

module.exports = MapChart;
