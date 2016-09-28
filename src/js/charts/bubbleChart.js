/**
 * @fileoverview Bubble chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var chartConst = require('../const');
var Series = require('../series/bubbleChartSeries');
var CircleLegend = require('../legends/circleLegend');
var axisTypeMixer = require('./axisTypeMixer');
var SimpleCustomEvent = require('../customEvents/simpleCustomEvent');

var BubbleChart = tui.util.defineClass(ChartBase, /** @lends BubbleChart.prototype */ {
    /**
     * className
     * @type {string}
     */
    className: 'tui-bubble-chart',
    /**
     * Bubble chart.
     * @constructs BubbleChart
     * @extends ChartBase
     * @mixes axisTypeMixer
     * @param {Array.<Array>} rawData raw data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(rawData, theme, options) {
        options.tooltip = options.tooltip || {};
        options.circleLegend = options.circleLegend || {};

        if (!options.tooltip.align) {
            options.tooltip.align = chartConst.TOOLTIP_DEFAULT_ALIGN_OPTION;
        }

        if (tui.util.isUndefined(options.circleLegend.visible)) {
            options.circleLegend.visible = true;
        }

        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options,
            hasAxes: true
        });
    },

    /**
     * Get scale option.
     * @returns {{xAxis: ?{valueType:string}, yAxis: ?{valueType:string}}}
     * @private
     * @override
     */
    _getScaleOption: function() {
        var scaleOption = {};

        if (this.dataProcessor.hasXValue(this.chartType)) {
            scaleOption.xAxis = {
                valueType: 'x'
            };
        }
        if (this.dataProcessor.hasYValue(this.chartType)) {
            scaleOption.yAxis = {
                valueType: 'y'
            };
        }

        return scaleOption;
    },

    /**
     * Set default options.
     * @param {object} options - options for bubble chart
     * @private
     * @override
     */
    _setDefaultOptions: function(options) {
        ChartBase.prototype._setDefaultOptions.call(this, options);
        this.options.circleLegend = this.options.circleLegend || {};

        if (tui.util.isUndefined(this.options.circleLegend.visible)) {
            this.options.circleLegend.visible = true;
        }
    },

    /**
     * Add components
     * @private
     */
    _addComponents: function() {
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
            series: [
                {
                    name: 'bubbleSeries',
                    SeriesClass: Series
                }
            ],
            plot: true
        });

        if (this.options.circleLegend.visible) {
            this.componentManager.register('circleLegend', CircleLegend, {
                chartType: this.chartType,
                baseFontFamily: this.theme.chart.fontFamily
            });
        }
    }
});

tui.util.extend(BubbleChart.prototype, axisTypeMixer);

/**
 * Add custom event component for normal tooltip.
 * @private
 */
BubbleChart.prototype._attachCustomEvent = function() {
    var componentManager = this.componentManager;
    var customEvent = componentManager.get('customEvent');
    var bubbleSeries = componentManager.get('bubbleSeries');
    var tooltip = componentManager.get('tooltip');

    axisTypeMixer._attachCustomEvent.call(this);

    customEvent.on({
        clickBubbleSeries: bubbleSeries.onClickSeries,
        moveBubbleSeries: bubbleSeries.onMoveSeries
    }, bubbleSeries);

    bubbleSeries.on({
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
BubbleChart.prototype._addCustomEventComponent = function() {
    this.componentManager.register('customEvent', SimpleCustomEvent, {
        chartType: this.chartType
    });
};

module.exports = BubbleChart;
