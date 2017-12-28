/**
 * @fileoverview Heatmap chart is a graphical representation of data where the individual values contained
 *                      in a matrix are represented as colors.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var ColorSpectrum = require('./colorSpectrum');
var chartConst = require('../const');
var snippet = require('tui-code-snippet');

var HeatmapChart = snippet.defineClass(ChartBase, /** @lends HeatmapChart.prototype */ {
    /**
     *
     * className
     * @type {string}
     */
    className: 'tui-heatmap-chart',
    /**
     * Heatmap chart is a graphical representation of data where the individual values contained
     *      in a matrix are represented as colors.
     * @constructs HeatmapChart
     * @extends ChartBase
     * @mixes axisTypeMixer
     * @param {Array.<Array>} rawData raw data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(rawData, theme, options) {
        options.tooltip = options.tooltip || {};

        if (!options.tooltip.align) {
            options.tooltip.align = chartConst.TOOLTIP_DEFAULT_ALIGN_OPTION;
        }

        options.tooltip.grouped = false;

        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options,
            hasAxes: true,
            isVertical: true
        });
    },

    /**
     * Add components.
     * @private
     */
    _addComponents: function() {
        var seriesTheme = this.theme.series[this.chartType];
        var colorSpectrum = new ColorSpectrum(seriesTheme.startColor, seriesTheme.endColor);

        this._addComponentsForAxisType({
            axis: [
                {
                    name: 'yAxis',
                    isVertical: true
                },
                {
                    name: 'xAxis'
                }
            ],
            legend: {
                classType: 'spectrumLegend',
                additionalParams: {
                    colorSpectrum: colorSpectrum
                }
            },
            series: [
                {
                    name: 'heatmapSeries',
                    data: {
                        colorSpectrum: colorSpectrum
                    }
                }
            ],
            tooltip: true,
            mouseEventDetector: true
        });
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
        this.dataProcessor.addDataRatios(limitMap.legend, null, this.chartType);
    },

    /**
     * Add components.
     * @override
     * @private
     */
    addComponents: function() {
        var seriesTheme = this.theme.series[this.chartType];
        var colorSpectrum = new ColorSpectrum(seriesTheme.startColor, seriesTheme.endColor);

        this.componentManager.register('title', 'title');
        this.componentManager.register('legend', 'spectrumLegend', {
            colorSpectrum: colorSpectrum
        });

        this.componentManager.register('heatmapSeries', 'heatmapSeries', {
            colorSpectrum: colorSpectrum
        });

        this.componentManager.register('xAxis', 'axis');
        this.componentManager.register('yAxis', 'axis');

        this.componentManager.register('chartExportMenu', 'chartExportMenu');
        this.componentManager.register('tooltip', 'tooltip');
        this.componentManager.register('mouseEventDetector', 'mouseEventDetector');
    }
});

module.exports = HeatmapChart;
