/**
 * @fileoverview Treemap chart is graphical representation of hierarchical data by using rectangles.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var ColorSpectrum = require('./colorSpectrum');
var Series = require('../series/treemapChartSeries');
var Tooltip = require('../tooltips/tooltip');
var Legend = require('../legends/spectrumLegend');
var BoundsTypeCustomEvent = require('../customEvents/boundsTypeCustomEvent');

var TreemapChart = tui.util.defineClass(ChartBase, /** @lends TreemapChart.prototype */ {
    /**
     * className
     * @type {string}
     */
    className: 'tui-treemap-chart',
    /**
     * Treemap chart is graphical representation of hierarchical data by using rectangles.
     * @constructs TreemapChart
     * @extends ChartBase
     * @param {Array.<Array>} rawData raw data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(rawData, theme, options) {
        options.series = options.series || {};
        options.tooltip = options.tooltip || {};
        options.tooltip.grouped = false;

        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options,
            hasAxes: false,
            isVertical: true
        });

        /**
         * scale option for making scale data
         * @type {{legend: boolean}}
         */
        this.scaleOption = {
            legend: true
        };

        /**
         * scale information like limit, step for rendering legend
         * @type {{limit: {min: number, max: number}, step: number}}
         */
        this.lengedScale = null;

        this._addComponents(options.chartType);
    },

    /**
     * Add components.
     * @private
     */
    _addComponents: function() {
        var seriesTheme = this.theme.series;
        var useColorValue = this.options.series.useColorValue;
        var colorSpectrum = useColorValue ? (new ColorSpectrum(seriesTheme.startColor, seriesTheme.endColor)) : null;

        this.componentManager.register('series', Series, {
            chartBackground: this.theme.chart.background,
            chartType: this.chartType,
            userEvent: this.userEvent,
            colorSpectrum: colorSpectrum
        });

        this.componentManager.register('tooltip', Tooltip, tui.util.extend({
            labelTheme: tui.util.pick(this.theme, 'series', 'label')
        }, this._makeTooltipData()));

        if (useColorValue) {
            this.componentManager.register('legend', Legend, {
                chartType: this.chartType,
                userEvent: this.userEvent,
                colorSpectrum: colorSpectrum
            });
        }

        this.componentManager.register('customEvent', BoundsTypeCustomEvent, {
            chartType: this.chartType,
            isVertical: this.isVertical
        });
    },

    /**
     * Add data ratios to dataProcessor for rendering graph.
     * @private
     * @override
     */
    _addDataRatios: function(limitMap) {
        this.dataProcessor.addDataRatiosForTreemapChart(limitMap.legend, this.chartType);
    },

    /**
     * Attach custom event.
     * @private
     * @override
     */
    _attachCustomEvent: function() {
        var series = this.componentManager.get('series');
        var customEvent = this.componentManager.get('customEvent');
        var tooltip = this.componentManager.get('tooltip');
        var legend = this.componentManager.get('legend');

        ChartBase.prototype._attachCustomEvent.call(this);

        customEvent.on('selectTreemapSeries', series.onSelectSeries, series);
        customEvent.on('showTooltip', tooltip.onShow, tooltip);
        customEvent.on('hideTooltip', tooltip.onHide, tooltip);

        tooltip.on('showTreemapAnimation', series.onShowAnimation, series);
        tooltip.on('hideTreemapAnimation', series.onHideAnimation, series);

        series.on('afterZoom', customEvent.onAfterZoom, customEvent);

        if (legend) {
            customEvent.on('showTooltip', series.onShowTooltip, series);
            customEvent.on('hideTooltip', legend.onHideWedge, legend);

            series.on('showWedge', legend.onShowWedge, legend);
        }
    },

    /**
     * On zoom.
     * @param {number} index - index of target seriesItem
     */
    onZoom: function(index) {
        this.componentManager.render('zoom', {
            'series': {
                index: index
            }
        });
        this._sendSeriesData();
    }
});

module.exports = TreemapChart;
