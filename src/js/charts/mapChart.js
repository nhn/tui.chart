/**
 * @fileoverview Map chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase'),
    chartConst = require('../const'),
    MapChartMapModel = require('./mapChartMapModel'),
    MapChartColorModel = require('./mapChartColorModel'),
    MapChartDataProcessor = require('../helpers/mapChartDataProcessor'),
    axisDataMaker = require('../helpers/axisDataMaker'),
    Series = require('../series/mapChartSeries'),
    Zoom = require('../series/zoom'),
    Legend = require('../legends/mapChartLegend'),
    MapChartTooltip = require('../tooltips/mapChartTooltip'),
    mapChartCustomEvent = require('../customEvents/mapChartCustomEvent');

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
        options.legend = options.legend || {};

        this.componentManager.register('legend', Legend);

        this.componentManager.register('tooltip', MapChartTooltip, this._makeTooltipData());

        this.componentManager.register('mapSeries', Series, {
            libType: options.libType,
            chartType: options.chartType,
            componentType: 'series',
            userEvent: this.userEvent
        });
        this.componentManager.register('zoom', Zoom);
    },

    /**
     * Add custom event component.
     * @private
     */
    _addCustomEventComponent: function() {
        this.componentManager.register('customEvent', mapChartCustomEvent, {
            chartType: this.chartType
        });
    },

    /**
     * Make axes data
     * @returns {object} axes data
     * @private
     */
    _makeAxesData: function() {
        return axisDataMaker.makeValueAxisData({
            values: [this.dataProcessor.getValues()],
            seriesDimension: {
                height: this.boundsMaker.getDimension('legend').height
            },
            chartType: this.options.chartType,
            formatFunctions: this.dataProcessor.getFormatFunctions(),
            tickCount: chartConst.MAP_CHART_LEGEND_TICK_COUNT,
            isVertical: true
        });
    },

    /**
     * Update percent values.
     * @param {object} axesData axes data
     * @private
     * @override
     */
    _updatePercentValues: function(axesData) {
        this.dataProcessor.registerPercentValues(axesData.limit);
    },

    /**
     * Make rendering data for map chart.
     * @param {object} axesData axes data
     * @returns {object} data for rendering
     * @private
     * @override
     */
    _makeRenderingData: function(axesData) {
        var seriesTheme = this.theme.series,
            colorModel = new MapChartColorModel(seriesTheme.startColor, seriesTheme.endColor),
            mapModel = new MapChartMapModel(this.dataProcessor, this.options.map);

        return {
            legend: {
                colorModel: colorModel,
                axesData: axesData
            },
            mapSeries: {
                mapModel: mapModel,
                colorModel: colorModel
            },
            tooltip: {
                mapModel: mapModel
            }
        };
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
            dragEndMapSeries: mapSeries.onDragEndSeries
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
