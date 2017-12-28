/**
 * @fileoverview Treemap chart is graphical representation of hierarchical data by using rectangles.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var ColorSpectrum = require('./colorSpectrum');
var snippet = require('tui-code-snippet');

var TreemapChart = snippet.defineClass(ChartBase, /** @lends TreemapChart.prototype */ {
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
     * @override
     */
    addComponents: function() {
        var seriesTheme = this.theme.series[this.chartType];
        var useColorValue = this.options.series.useColorValue;
        var colorSpectrum = useColorValue ? (new ColorSpectrum(seriesTheme.startColor, seriesTheme.endColor)) : null;
        this.componentManager.register('title', 'title');
        this.componentManager.register('treemapSeries', 'treemapSeries', {
            colorSpectrum: colorSpectrum
        });

        if (useColorValue && this.options.legend.visible) {
            this.componentManager.register('legend', 'spectrumLegend', {
                colorSpectrum: colorSpectrum
            });
        }

        this.componentManager.register('tooltip', 'tooltip', snippet.extend({
            labelTheme: snippet.pick(this.theme, 'series', 'label')
        }));

        this.componentManager.register('mouseEventDetector', 'mouseEventDetector');
        this.componentManager.register('chartExportMenu', 'chartExportMenu');
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
     * Add data ratios to dataProcessor for rendering graph.
     * @override
     */
    addDataRatios: function(limitMap) {
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
