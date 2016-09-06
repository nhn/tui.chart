/**
 * @fileoverview Map chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var mapFactory = require('../factories/mapFactory');
var chartConst = require('../const');
var MapChartMapModel = require('./mapChartMapModel');
var ColorSpectrum = require('./colorSpectrum');
var MapChartDataProcessor = require('../dataModels/mapChartDataProcessor');
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

        this._addComponents(options);
    },

    /**
     * Add components
     * @param {object} options chart options
     * @private
     */
    _addComponents: function(options) {
        var seriesTheme = this.theme.series;
        var colorSpectrum = new ColorSpectrum(seriesTheme.startColor, seriesTheme.endColor);
        var mapModel = new MapChartMapModel(this.dataProcessor, this.options.map);

        options.legend = options.legend || {};

        this.componentManager.register('legend', Legend, {
            colorSpectrum: colorSpectrum
        });

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
     * Add scale data for x legend.
     * @private
     * @override
     */
    _addScaleDataForLegend: function() {
        this.scaleModel.addScale('legend', {}, {
            chartType: this.chartType
        }, {
            valueCount: chartConst.SPECTRUM_LEGEND_TICK_COUNT
        });
    },

    /**
     * Add data ratios.
     * @private
     * @override
     */
    _addDataRatios: function() {
        var axisData = this.scaleModel.getAxisDataMap().legend;

        this.dataProcessor.addDataRatios(axisData.limit);
    },

    /**
     * Attach custom evnet.
     * @private
     * @override
     */
    _attachCustomEvent: function() {
        var customEvent = this.componentManager.get('customEvent'),
            mapSeries = this.componentManager.get('mapSeries'),
            legend = this.componentManager.get('legend'),
            tooltip = this.componentManager.get('tooltip'),
            zoom = this.componentManager.get('zoom');

        customEvent.on({
            clickMapSeries: mapSeries.onClickSeries,
            moveMapSeries: mapSeries.onMoveSeries,
            dragStartMapSeries: mapSeries.onDragStartSeries,
            dragMapSeries: mapSeries.onDragSeries,
            dragEndMapSeries: mapSeries.onDragEndSeries,
            wheel: tui.util.bind(zoom.onWheel, zoom)
        }, mapSeries);

        mapSeries.on({
            showWedge: legend.onShowWedge,
            hideWedge: legend.onHideWedge
        }, legend);

        mapSeries.on({
            showTooltip: tooltip.onShow,
            hideTooltip: tooltip.onHide,
            showTooltipContainer: tooltip.onShowTooltipContainer,
            hideTooltipContainer: tooltip.onHideTooltipContainer
        }, tooltip);

        zoom.on('zoom', mapSeries.onZoom, mapSeries, mapSeries);
    }
});

module.exports = MapChart;
