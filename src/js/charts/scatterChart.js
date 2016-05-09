/**
 * @fileoverview Scatter chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var chartConst = require('../const');
var Series = require('../series/scatterChartSeries');
var axisTypeMixer = require('./axisTypeMixer');
var SimpleCustomEvent = require('../customEvents/simpleCustomEvent');

var ScatterChart = tui.util.defineClass(ChartBase, /** @lends ScatterChart.prototype */ {
    /**
     * className
     * @type {string}
     */
    className: 'tui-scatter-chart',
    /**
     * Scatter chart.
     * @constructs ScatterChart
     * @extends ChartBase
     * @mixes axisTypeMixer
     * @param {Array.<Array>} rawData raw data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(rawData, theme, options) {
        options.tooltip = options.tooltip || {};

        this.axisScaleMakerMap = null;

        if (!options.tooltip.align) {
            options.tooltip.align = chartConst.TOOLTIP_DEFAULT_ALIGN_OPTION;
        }

        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options,
            hasAxes: true
        });

        this._addComponents(options.chartType);
    },

    /**
     * Make map for AxisScaleMaker of axes(xAxis, yAxis).
     * @returns {Object.<string, AxisScaleMaker>}
     * @private
     */
    _makeAxisScaleMakerMap: function() {
        var options = this.options;

        return {
            xAxis: this._createAxisScaleMaker(options.xAxis, 'xAxis', 'x'),
            yAxis: this._createAxisScaleMaker(options.yAxis, 'yAxis', 'y')
        };
    },

    /**
     * Add components
     * @param {string} chartType chart type
     * @private
     */
    _addComponents: function(chartType) {
        this._addComponentsForAxisType({
            axes: [
                {
                    name: 'yAxis'
                },
                {
                    name: 'xAxis'
                }
            ],
            chartType: chartType,
            serieses: [
                {
                    name: 'scatterSeries',
                    SeriesClass: Series
                }
            ]
        });
    }
});

axisTypeMixer.mixin(ScatterChart);

/**
 * Add data ratios.
 * @private
 * @override
 */
ScatterChart.prototype._addDataRatios = function() {
    var scaleMakerMap = this._getAxisScaleMakerMap();

    this.dataProcessor.addDataRatiosForCoordinateType(this.chartType, {
        x: scaleMakerMap.xAxis.getLimit(),
        y: scaleMakerMap.yAxis.getLimit()
    }, false);
};

/**
 * Add custom event component for normal tooltip.
 * @private
 */
ScatterChart.prototype._attachCustomEvent = function() {
    var componentManager = this.componentManager;
    var customEvent = componentManager.get('customEvent');
    var scatterSeries = componentManager.get('scatterSeries');
    var tooltip = componentManager.get('tooltip');

    axisTypeMixer._attachCustomEvent.call(this);

    customEvent.on({
        clickScatterSeries: scatterSeries.onClickSeries,
        moveScatterSeries: scatterSeries.onMoveSeries
    }, scatterSeries);

    scatterSeries.on({
        showTooltip: tooltip.onShow,
        hideTooltip: tooltip.onHide,
        showTooltipContainer: tooltip.onShowTooltipContainer,
        hideTooltipContainer: tooltip.onHideTooltipContainer
    }, tooltip);
};

/**
 * Add custom event component.
 * @private
 */
ScatterChart.prototype._addCustomEventComponent = function() {
    this.componentManager.register('customEvent', SimpleCustomEvent, {
        chartType: this.chartType
    });
};

module.exports = ScatterChart;
