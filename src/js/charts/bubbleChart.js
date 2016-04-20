/**
 * @fileoverview Bubble chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase'),
    Series = require('../series/bubbleChartSeries'),
    axisTypeMixer = require('./axisTypeMixer'),
    axisDataMaker = require('../helpers/axisDataMaker'),
    SimpleCustomEvent = require('../customEvents/simpleCustomEvent');

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
     * Make axes data
     * @param {object} bounds chart bounds
     * @returns {object} axes data
     * @private
     */
    _makeAxesData: function() {
        var scaleMakerMap = this._getAxisScaleMakerMap();
        var categories = this.dataProcessor.getCategories();
        var labelAxisData, xAxisData, yAxisData;

        if (categories.length) {
            labelAxisData = axisDataMaker.makeLabelAxisData({
                labels: categories
            });
        }

        if (scaleMakerMap.xAxis) {
            xAxisData = axisDataMaker.makeValueAxisData({
                axisScaleMaker: scaleMakerMap.xAxis
            });
        } else {
            xAxisData = labelAxisData;
        }

        if (scaleMakerMap.yAxis) {
            yAxisData = axisDataMaker.makeValueAxisData({
                axisScaleMaker: scaleMakerMap.yAxis,
                isVertical: true
            });
        } else {
            yAxisData = labelAxisData;
            yAxisData.isVertical = true;
        }

        return {
            xAxis: xAxisData,
            yAxis: yAxisData
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
BubbleChart.prototype._addCustomEventComponentForNormalTooltip = function() {
    this.componentManager.register('customEvent', SimpleCustomEvent, {
        chartType: this.chartType
    });
};

module.exports = BubbleChart;
