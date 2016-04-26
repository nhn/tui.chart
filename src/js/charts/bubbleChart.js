/**
 * @fileoverview Bubble chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var chartConst = require('../const');
var Series = require('../series/bubbleChartSeries');
var CircleLegend = require('../legends/circleLegend');
var axisTypeMixer = require('./axisTypeMixer');
var axisDataMaker = require('../helpers/axisDataMaker');
var predicate = require('../helpers/predicate');
var renderUtil = require('../helpers/renderUtil');
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
     * Pick limit from options
     * @param {{min: number, max: number, title: string}} options - axis options
     * @returns {{min: number, max: number}}
     * @private
     */
    _pickLimitFromOptions: function(options) {
        options = options || {};

        return {
            min: options.min,
            max: options.max
        };
    },

    /**
     * Create AxisScaleMaker for bubble chart.
     * @param {{min: number, max: number, title: string}} options - axis options
     * @param {string} valueType - type of value like x, y, r
     * @returns {AxisScaleMaker}
     * @override
     * @private
     */
    _createAxisScaleMaker: function(options, valueType) {
        var limit = this._pickLimitFromOptions(options);
        var additionalParams = {
            valueType: valueType
        };

        return ChartBase.prototype._createAxisScaleMaker.call(this, limit, additionalParams, this.chartType);
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
                scaleMakerMap.xAxis = this._createAxisScaleMaker(options.xAxis, 'x');
            } else {
                scaleMakerMap.yAxis = this._createAxisScaleMaker(options.yAxis, 'y');
            }
        } else {
            scaleMakerMap.xAxis = this._createAxisScaleMaker(options.xAxis, 'x');
            scaleMakerMap.yAxis = this._createAxisScaleMaker(options.yAxis, 'y');
        }

        return scaleMakerMap;
    },

    /**
     * Get map for AxisScaleMaker of axes(xAxis, yAxis).
     * @returns {Object.<string, AxisScaleMaker>}
     * @private
     */
    _getAxisScaleMakerMap: function() {
        if (!this.axisScaleMakerMap) {
            this.axisScaleMakerMap = this._makeAxisScaleMakerMap();
        }

        return this.axisScaleMakerMap;
    },

    /**
     * Make axis data.
     * @param {AxisScaleMaker} axisScaleMaker - AxisScaleMaker
     * @param {boolean} [isVertical] - whether vertical or not
     * @returns {object}
     * @private
     */
    _makeAxisData: function(axisScaleMaker, isVertical) {
        var axisData;

        if (axisScaleMaker) {
            axisData = axisDataMaker.makeValueAxisData({
                axisScaleMaker: axisScaleMaker,
                isVertical: !!isVertical
            });
        } else {
            axisData = axisDataMaker.makeLabelAxisData({
                labels: this.dataProcessor.getCategories(),
                isVertical: !!isVertical
            });
        }

        return axisData;
    },

    /**
     * Make axes data
     * @returns {object} axes data
     * @private
     */
    _makeAxesData: function() {
        var axisScaleMakerMap = this._getAxisScaleMakerMap();

        return {
            xAxis: this._makeAxisData(axisScaleMakerMap.xAxis),
            yAxis: this._makeAxisData(axisScaleMakerMap.yAxis, true)
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
                    name: 'bubbleSeries',
                    SeriesClass: Series
                }
            ]
        });

        if (!tui.util.pick(this.options, 'circleLegend', 'hidden')) {
            this.componentManager.register('circleLegend', CircleLegend, {
                chartType: chartType,
                baseFontFamily: this.theme.chart.fontFamily
            });
        }
    },

    /**
     * Get width of max label of CircleLegend.
     * @returns {number}
     * @private
     */
    _getMaxCircleLegendLabelWidth: function() {
        var maxLabel = this.dataProcessor.getFormattedMaxValue(this.chartType, 'r');
        var maxLabelWidth = renderUtil.getRenderedLabelWidth(maxLabel, {
            fontSize: chartConst.CIRCLE_LEGEND_LABEL_FONT_SIZE,
            fontFamily: this.theme.chart.fontFamily
        });

        return maxLabelWidth;
    },

    /**
     * Get width of circle legend area.
     * @returns {number}
     * @private
     */
    _getCircleLegendWidth: function() {
        var maxRadius = this.boundsMaker.getMinimumPixelStepForAxis();
        var circleWidth = (maxRadius * 2) + chartConst.CIRCLE_LEGEND_PADDING;
        var maxLabelWidth = this._getMaxCircleLegendLabelWidth();

        return Math.max(circleWidth, maxLabelWidth);
    },

    /**
     * Update width of legend and series of boundsMaker.
     * @param {number} seriesWidth - width of series area
     * @param {number} legendWidth - width of legend area
     * @private
     */
    _updateLegendAndSeriesWidth: function(seriesWidth, legendWidth) {
        var circleLegendWidth = this._getCircleLegendWidth();

        this.boundsMaker.registerBaseDimension('legend', {
            width: circleLegendWidth
        });

        this.boundsMaker.registerBaseDimension('series', {
            width: seriesWidth - (circleLegendWidth - legendWidth)
        });
    },

    /**
     * Update axesData of boundsMaker.
     * @param {boolean} isXAxisLabel - whether xAxis is label type or not.
     * @private
     */
    _updateAxesDataOfBoundsMaker: function(isXAxisLabel) {
        var newAxesData;

        if (isXAxisLabel) {
            return;
        }

        this.axisScaleMakerMap = null;
        newAxesData = this._makeAxesData();
        this.boundsMaker.registerAxesData(newAxesData);
    },

    /**
     * Whether changed max radius or not.
     * @param {boolean} beforeMaxRadius - before max radius
     * @returns {boolean}
     */
    isChangedMaxRadius: function(beforeMaxRadius) {
        var afterMaxRadius = this.boundsMaker.getMinimumPixelStepForAxis();

        return (beforeMaxRadius !== afterMaxRadius);
    },

    /**
     * Update width of legend area by width of circle legend area.
     * @param {{xAxis: object, yAxis: object}} axesData - data for rendering of axis area(x axis and y axis).
     * @private
     */
    _updateLegendWidthByCircleLegendWidth: function(axesData) {
        var boundsMaker = this.boundsMaker;
        var circleLegendWidth = this._getCircleLegendWidth();
        var legendWidth = boundsMaker.getDimension('calculationLegend').width;
        var isXAxisLabel, beforeMaxRadius, seriesWidth;

        if (legendWidth >= circleLegendWidth) {
            return;
        }

        isXAxisLabel = axesData.xAxis.isLabel;
        seriesWidth = boundsMaker.getDimension('series').width;
        beforeMaxRadius = boundsMaker.getMinimumPixelStepForAxis();

        this._updateLegendAndSeriesWidth(seriesWidth, legendWidth);
        this._updateAxesDataOfBoundsMaker(isXAxisLabel);

        if (this.isChangedMaxRadius(beforeMaxRadius)) {
            this._updateLegendAndSeriesWidth(seriesWidth, legendWidth);
            this._updateAxesDataOfBoundsMaker(isXAxisLabel);
        }
    },

    /**
     * Register dimension of circle legend.
     * @private
     */
    _registerCircleLegendDimension: function() {
        var circleLegendWidth = this._getCircleLegendWidth();

        this.boundsMaker.registerBaseDimension('circleLegend', {
            width: circleLegendWidth,
            height: circleLegendWidth
        });
    },

    /**
     * Update dimensions.
     * @param {{xAxis: object, yAxis: object}} axesData - data for rendering of axis area(x axis and y axis).
     * @private
     * @override
     */
    _updateDimensions: function(axesData) {
        if (predicate.isHidden(this.options.circleLegend)) {
            return;
        }

        this._updateLegendWidthByCircleLegendWidth(axesData);
        this._registerCircleLegendDimension();
    },

    /**
     * Rerender.
     * @private
     */
    _rerender: function() {
        this.axisScaleMakerMap = null;
        ChartBase.prototype._rerender.apply(this, arguments);
    }
});

axisTypeMixer.mixin(BubbleChart);

/**
 * Add data ratios.
 * @private
 * @override
 */
BubbleChart.prototype._addDataRatios = function() {
    var scaleMakerMap = this._getAxisScaleMakerMap(),
        limitMap = {};

    if (scaleMakerMap.xAxis) {
        limitMap.x = scaleMakerMap.xAxis.getLimit();
    }

    if (scaleMakerMap.yAxis) {
        limitMap.y = scaleMakerMap.yAxis.getLimit();
    }

    this.dataProcessor.addDataRatiosForCoordinateType(limitMap);
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
