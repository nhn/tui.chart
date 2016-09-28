/**
 * @fileoverview Heatmap chart is a graphical representation of data where the individual values contained
 *                      in a matrix are represented as colors.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var ColorSpectrum = require('./colorSpectrum');
var Series = require('../series/heatmapChartSeries');
var chartConst = require('../const');
var axisTypeMixer = require('./axisTypeMixer');
var Legend = require('../legends/spectrumLegend');

var HeatmapChart = tui.util.defineClass(ChartBase, /** @lends HeatmapChart.prototype */ {
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
        var seriesTheme = this.theme.series;
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
                LegendClass: Legend,
                additionalParams: {
                    colorSpectrum: colorSpectrum
                }
            },
            series: [
                {
                    name: 'heatmapSeries',
                    SeriesClass: Series,
                    data: {
                        colorSpectrum: colorSpectrum
                    }
                }
            ],
            tooltip: true,
            customEvent: true
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
    }
});

tui.util.extend(HeatmapChart.prototype, axisTypeMixer);

/**
 * Add data ratios for rendering graph.
 * @private
 * @override
 */
HeatmapChart.prototype._addDataRatios = function(limitMap) {
    this.dataProcessor.addDataRatios(limitMap.legend, null, this.chartType);
};

/**
 * Attach custom event between components.
 * @private
 * @override
 */
HeatmapChart.prototype._attachCustomEvent = function() {
    var customEvent = this.componentManager.get('customEvent');
    var heatmapSeries = this.componentManager.get('heatmapSeries');
    var legend = this.componentManager.get('legend');

    axisTypeMixer._attachCustomEvent.call(this);

    customEvent.on('showTooltip', heatmapSeries.onShowTooltip, heatmapSeries);

    if (legend) {
        customEvent.on('hideTooltip', legend.onHideWedge, legend);
        heatmapSeries.on('showWedge', legend.onShowWedge, legend);
    }
};

module.exports = HeatmapChart;
