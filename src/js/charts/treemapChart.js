/**
 * @fileoverview Treemap chart is graphical representation of hierarchical data by using rectangles.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var ColorSpectrum = require('./colorSpectrum');
var Series = require('../components/series/treemapChartSeries');
var Tooltip = require('../components/tooltips/tooltip');
var Legend = require('../components/legends/spectrumLegend');
var BoundsTypeCustomEvent = require('../components/customEvents//boundsTypeCustomEvent');

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
        //options.series = options.series || {};
        options.tooltip = options.tooltip || {};
        options.tooltip.grouped = false;

        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options,
            hasAxes: false,
            isVertical: true
        });
    },

    /**
     * Add components.
     * @private
     */
    _addComponents: function() {
        var seriesTheme = this.theme.series[this.chartType];
        var useColorValue = this.options.series.useColorValue;
        var colorSpectrum = useColorValue ? (new ColorSpectrum(seriesTheme.startColor, seriesTheme.endColor)) : null;

        this.componentManager.register('series', Series, {
            chartBackground: this.theme.chart.background,
            chartType: this.chartType,
            colorSpectrum: colorSpectrum
        });

        // TODO
        this.componentManager.register('tooltip', Tooltip, tui.util.extend({
            labelTheme: tui.util.pick(this.theme, 'series', 'label')
        }, this._makeTooltipData()));

        if (useColorValue && this.options.legend.visible) {
            this.componentManager.register('legend', Legend, {
                chartType: this.chartType,
                colorSpectrum: colorSpectrum
            });
        }

        this.componentManager.register('customEvent', BoundsTypeCustomEvent, {
            chartType: this.chartType,
            isVertical: this.isVertical
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
     * Add data ratios to dataProcessor for rendering graph.
     * @private
     * @override
     */
    _addDataRatios: function(limitMap) {
        this.dataProcessor.addDataRatiosForTreemapChart(limitMap.legend, this.chartType);
    },

    /**
     * On zoom.
     * @param {number} index - index of target seriesItem
     */
    onZoom: function(index) {
        this.componentManager.render('zoom', null, {
            index: index
        });
    }
});

module.exports = TreemapChart;
