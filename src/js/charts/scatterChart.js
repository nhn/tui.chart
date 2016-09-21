/**
 * @fileoverview Scatter chart is a type of plot or mathematical diagram using Cartesian coordinates
 *                  to display values for typically two variables for a set of data.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
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
     * Scatter chart is a type of plot or mathematical diagram using Cartesian coordinates
     *  to display values for typically two variables for a set of data.
     * @constructs ScatterChart
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

        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options,
            hasAxes: true
        });

        this._addComponents(options.chartType);
    },

    /**
     * Add scale data for y axis.
     * @private
     * @override
     */
    _addScaleDataForYAxis: function() {
        this.scaleModel.addScale('yAxis', this.options.yAxis, {
            valueType: 'y'
        });
    },

    /**
     * Add scale data for x axis.
     * @private
     * @override
     */
    _addScaleDataForXAxis: function() {
        this.scaleModel.addScale('xAxis', this.options.xAxis, {
            valueType: 'x'
        });
    },

    /**
     * Add components
     * @param {string} chartType chart type
     * @private
     */
    _addComponents: function(chartType) {
        this._addComponentsForAxisType({
            chartType: chartType,
            axis: [
                {
                    name: 'yAxis',
                    isVertical: true
                },
                {
                    name: 'xAxis'
                }
            ],
            series: [
                {
                    name: 'scatterSeries',
                    SeriesClass: Series
                }
            ],
            plot: true
        });
    }
});

tui.util.extend(ScatterChart.prototype, axisTypeMixer);

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
