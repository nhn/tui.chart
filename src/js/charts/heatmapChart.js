/**
 * @fileoverview Heatmap chart is a graphical representation of data where the individual values contained
 *                      in a matrix are represented as colors.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var ColorModel = require('./mapChartColorModel');
var Series = require('../series/heatmapChartSeries');
var chartConst = require('../const');
var axisTypeMixer = require('./axisTypeMixer');
var axisDataMaker = require('../helpers/axisDataMaker');
var Legend = require('../legends/mapChartLegend');

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

        this._addComponents(options.chartType);
    },

    /**
     * Make map for AxisScaleMaker of axes(xAxis, yAxis).
     * @returns {object}
     * @private
     */
    _makeAxisScaleMakerMap: function() {
        return {
            legend: this._createAxisScaleMaker({}, 'legend', null, this.chartType, {
                valueCount: chartConst.SPECTRUM_LEGEND_TICK_COUNT
            })
        };
    },

    /**
     * Add components.
     * @param {string} chartType chart type
     * @private
     */
    _addComponents: function() {
        this._addComponentsForAxisType({
            axis: [
                {
                    name: 'yAxis',
                    isLabel: true,
                    isVertical: true
                },
                {
                    name: 'xAxis',
                    isLabel: true
                }
            ],
            legend: {
                LegendClass: Legend
            },
            series: [
                {
                    name: 'heatmapSeries',
                    SeriesClass: Series
                }
            ],
            tooltip: true,
            customEvent: true
        });
    }
});

axisTypeMixer.mixin(HeatmapChart);

/**
 * Add data ratios for rendering graph.
 * @private
 * @override
 */
HeatmapChart.prototype._addDataRatios = function() {
    var limit = this._getAxisScaleMakerMap().legend.getLimit();

    this.dataProcessor.addDataRatios(limit, null, this.chartType);
};

/**
 * Make rendering data for delivery to each component.
 * @returns {object}
 * @private
 * @override
 */
HeatmapChart.prototype._makeRenderingData = function() {
    var data = axisTypeMixer._makeRenderingData.call(this);
    var seriesTheme = this.theme.series;
    var colorModel = new ColorModel(seriesTheme.startColor, seriesTheme.endColor);

    data.legend = {
        colorModel: colorModel,
        axesData: axisDataMaker.makeValueAxisData({
            axisScaleMaker: this._getAxisScaleMakerMap().legend,
            isVertical: true
        })
    };
    data.heatmapSeries.colorModel = colorModel;

    return data;
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
    customEvent.on('hideTooltip', legend.onHideWedge, legend);

    heatmapSeries.on('showWedge', legend.onShowWedge, legend);
};

module.exports = HeatmapChart;
