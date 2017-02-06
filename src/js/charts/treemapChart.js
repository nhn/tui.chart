/**
 * @fileoverview Treemap chart is graphical representation of hierarchical data by using rectangles.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var ColorSpectrum = require('./colorSpectrum');

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
        // options.series = options.series || {};
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
        var options = this.options;
        var seriesTheme = this.theme.series[this.chartType];
        var useColorValue = options.series.useColorValue;
        var colorSpectrum = useColorValue ? (new ColorSpectrum(seriesTheme.startColor, seriesTheme.endColor)) : null;

        if (options.chart && options.chart.title) {
            this._addTitleComponent(options.chart.title);
        }

        this._addChartExportMenuComponent();

        this.componentManager.register('series', {
            chartBackground: this.theme.chart.background,
            chartType: this.chartType,
            classType: 'treemapSeries',
            colorSpectrum: colorSpectrum
        });

        this.componentManager.register('tooltip', tui.util.extend({
            labelTheme: tui.util.pick(this.theme, 'series', 'label')
        }, this._makeTooltipData()));

        if (useColorValue && options.legend.visible) {
            this.componentManager.register('legend', {
                chartType: this.chartType,
                classType: 'spectrumLegend',
                colorSpectrum: colorSpectrum
            });
        }

        this.componentManager.register('mouseEventDetector', {
            chartType: this.chartType,
            classType: 'boundsTypeEventDetector',
            isVertical: this.isVertical
        });
    },

    _addTitleComponent: function(options) {
        this.componentManager.register('title', {
            dataProcessor: this.dataProcessor,
            libType: options.libType,
            text: options.text,
            theme: this.theme.title || {},
            classType: 'title'
        });
    },

    /**
     * Add chartExportMenu component.
     * @private
     */
    _addChartExportMenuComponent: function() {
        var chartOption = this.options.chart;
        var chartTitle = chartOption && chartOption.title ? chartOption.title.text : 'chart';

        this.componentManager.register('chartExportMenu', {
            chartTitle: chartTitle,
            chartType: this.chartType,
            classType: 'chartExportMenu'
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
