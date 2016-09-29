/**
 * @fileoverview Map chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var mapFactory = require('../factories/mapFactory');
var MapChartMapModel = require('./mapChartMapModel');
var ColorSpectrum = require('./colorSpectrum');
var MapChartDataProcessor = require('../models/data/mapChartDataProcessor');
var Series = require('../series/mapChartSeries');
var Zoom = require('../series/zoom');
var Legend = require('../legends/spectrumLegend');
var MapChartTooltip = require('../tooltips/mapChartTooltip');
var mapChartCustomEvent = require('../customEvents/mapChartCustomEvent');

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

        options.map = mapFactory.get(options.map);
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
     * Add components
     * @param {object} options chart options
     * @private
     */
    _addComponents: function() {
        var options = this.options;
        var seriesTheme = this.theme.series;
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
            userEvent: this.userEvent,
            mapModel: mapModel,
            colorSpectrum: colorSpectrum
        });

        this.componentManager.register('zoom', Zoom);

        this.componentManager.register('customEvent', mapChartCustomEvent, {
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
