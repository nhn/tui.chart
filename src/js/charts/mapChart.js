/**
 * @fileoverview Map chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase'),
    chartConst = require('../const'),
    MapChartDataProcessor = require('../helpers/mapChartDataProcessor'),
    axisDataMaker = require('../helpers/axisDataMaker'),
    renderUtil = require('../helpers/renderUtil'),
    MapChartColorModel = require('./mapChartColorModel'),
    Series = require('../series/mapChartSeries'),
    Legend = require('../legends/mapChartLegend'),
    mapChartCustomEvent = require('../customEvents/mapChartCustomEvent')

var MapChart = tui.util.defineClass(ChartBase, /** @lends MapChart.prototype */ {
    /**
     * Column chart.
     * @constructs MapChart
     * @extends ChartBase
     * @param {Array.<Array>} rawData raw data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(rawData, theme, options) {
        this.className = 'tui-map-chart';

        options.tooltip = options.tooltip || {};
        options.legend = options.legend || {};

        if (!options.tooltip.align) {
            options.tooltip.align = chartConst.TOOLTIP_DEFAULT_ALIGN_OPTION;
        }

        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options,
            DataProcessor: MapChartDataProcessor
        });

        this._addComponents(theme.chart.background, options);
    },

    /**
     * Add components
     * @param {object} chartBackground chart background
     * @param {object} options chart options
     * @private
     */
    _addComponents: function(chartBackground, options) {
        var legendAlign, isPieLegendType;
        options.legend = options.legend || {};
        legendAlign = options.legend && options.legend.align;

        this.component.register('legend', Legend);
        this.component.register('mapSeries', Series, {
            libType: options.libType,
            chartType: options.chartType,
            componentType: 'series',
            chartBackground: chartBackground,
            userEvent: this.userEvent,
            legendAlign: isPieLegendType && !options.legend.hidden ? legendAlign : null
        });
    },

    /**
     * Add custom event component.
     * @private
     */
    _addCustomEventComponent: function() {
        this.component.register('customEvent', mapChartCustomEvent, {
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
     * @return {object} data for rendering
     * @private
     * @override
     */
    _makeRenderingData: function(axesData) {
        var colorModel = new MapChartColorModel('#EEEEFF', '#0000ff');

        return {
            legend: {
                colorModel: colorModel,
                axesData: axesData
            },
            mapSeries: {
                colorModel: colorModel,
                map: this.options.map
            }
        };
    },

    /**
     * Attach custom evnet.
     * @private
     * @override
     */
    _attachCustomEvent: function() {
        var customEvent = this.component.get('customEvent'),
            mapSeries = this.component.get('mapSeries');

        ChartBase.prototype._attachCustomEvent.call(this);

        customEvent.on('clickMapSeries', mapSeries.onClickSeries, mapSeries);
        customEvent.on('moveMapSeries', mapSeries.onMoveSeries, mapSeries);
        customEvent.on('dragStartMapSeries', mapSeries.onDragStartSeries, mapSeries);
        customEvent.on('dragMapSeries', mapSeries.onDragSeries, mapSeries);
        customEvent.on('dragEndMapSeries', mapSeries.onDragEndSeries, mapSeries);
    }
});

module.exports = MapChart;
