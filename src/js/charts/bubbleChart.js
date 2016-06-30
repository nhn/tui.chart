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
var predicate = require('../helpers/predicate');
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
     * Make map for AxisScaleMaker of axes(xAxis, yAxis).
     * @returns {Object.<string, AxisScaleMaker>}
     * @private
     */
    _makeAxisScaleMakerMap: function() {
        var hasCategories = this.dataProcessor.hasCategories();
        var seriesDataModel = this.dataProcessor.getSeriesDataModel(this.chartType);
        var isXCountGreaterThanYCount = seriesDataModel.isXCountGreaterThanYCount();
        var options = this.options;
        var scaleMakerMap = {};

        if (hasCategories) {
            if (isXCountGreaterThanYCount) {
                scaleMakerMap.xAxis = this._createAxisScaleMaker(options.xAxis, 'xAxis', 'x');
            } else {
                scaleMakerMap.yAxis = this._createAxisScaleMaker(options.yAxis, 'yAxis', 'y', null, {
                    isVertical: true
                });
            }
        } else {
            scaleMakerMap.xAxis = this._createAxisScaleMaker(options.xAxis, 'xAxis', 'x');
            scaleMakerMap.yAxis = this._createAxisScaleMaker(options.yAxis, 'yAxis', 'y', null, {
                isVertical: true
            });
        }

        return scaleMakerMap;
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
                    name: 'bubbleSeries',
                    SeriesClass: Series
                }
            ],
            plot: true
        });

        if (this.options.circleLegend.visible) {
            this.componentManager.register('circleLegend', CircleLegend, {
                chartType: chartType,
                baseFontFamily: this.theme.chart.fontFamily
            });
        }
    },

    /**
     * Update width of legend and series of boundsMaker.
     * @param {number} seriesWidth - width of series area
     * @param {number} legendWidth - width of legend area
     * @private
     */
    _updateLegendAndSeriesWidth: function(seriesWidth, legendWidth) {
        var circleLegendWidth = this.boundsMaker.getDimension('circleLegend').width;

        if (predicate.hasVerticalLegendWidth(this.options.legend)) {
            this.boundsMaker.registerBaseDimension('legend', {
                width: circleLegendWidth
            });
        }

        this.boundsMaker.registerBaseDimension('series', {
            width: seriesWidth - (circleLegendWidth - legendWidth)
        });
    },

    /**
     * Update width of legend area by width of circle legend area.
     * @private
     */
    _updateLegendWidthByCircleLegendWidth: function() {
        var boundsMaker = this.boundsMaker;
        var axesData = boundsMaker.getAxesData();
        var circleLegendWidth = boundsMaker.getDimension('circleLegend').width;
        var legendWidth = boundsMaker.getDimension('calculationLegend').width;
        var isXAxisLabel, seriesWidth;

        if (legendWidth >= circleLegendWidth) {
            return;
        }

        isXAxisLabel = axesData.xAxis.isLabel;
        seriesWidth = boundsMaker.getDimension('series').width;

        this._updateLegendAndSeriesWidth(seriesWidth, legendWidth);

        if (!isXAxisLabel) {
            this.axisScaleMakerMap = null;
            this._registerAxesData();
        }
    },

    /**
     * Update dimensions.
     * @private
     * @override
     */
    _updateDimensions: function() {
        if (!this.options.circleLegend.visible) {
            return;
        }

        this.componentManager.get('circleLegend').registerCircleLegendDimension();
        this._updateLegendWidthByCircleLegendWidth();
    }
});

axisTypeMixer.mixin(BubbleChart);

/**
 * Add data ratios.
 * @private
 * @override
 */
BubbleChart.prototype._addDataRatios = function() {
    var scaleMakerMap = this._getAxisScaleMakerMap();
    var limitMap = {};

    if (scaleMakerMap.xAxis) {
        limitMap.x = scaleMakerMap.xAxis.getLimit();
    }

    if (scaleMakerMap.yAxis) {
        limitMap.y = scaleMakerMap.yAxis.getLimit();
    }

    this.dataProcessor.addDataRatiosForCoordinateType(this.chartType, limitMap, true);
};

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
