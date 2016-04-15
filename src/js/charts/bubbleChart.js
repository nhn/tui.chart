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
     * Bubble chart.
     * @constructs BubbleChart
     * @extends ChartBase
     * @param {Array.<Array>} rawData raw data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(rawData, theme, options) {
        this.className = 'tui-bubble-chart';

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
     * Make map for whether existy AxisScaleMaker of axes or not.
     * @returns {{xAxis: boolean, yAxis: boolean}}
     * @private
     */
    _makeExistyMapForScaleMakerOfAxes: function() {
        var dataProcessor = this.dataProcessor,
            hasCategories = !!dataProcessor.getCategories().length,
            existyMap = {
                xAxis: true,
                yAxis: true
            },
            xDataCount, yDataCount;

        if (hasCategories) {
            xDataCount = dataProcessor.getValues(this.chartType, 'x').length;
            yDataCount = dataProcessor.getValues(this.chartType, 'y').length;

            if (xDataCount > yDataCount) {
                existyMap.yAxis = false;
            } else {
                existyMap.xAxis = false;
            }
        }

        return existyMap;
    },

    /**
     * Make map for AxisScaleMaker of axes(xAxis, yAxis).
     * @returns {Object.<string, AxisScaleMaker>}
     * @private
     */
    _makeAxisScaleMakerMap: function() {
        var existyMap = this._makeExistyMapForScaleMakerOfAxes(),
            scaleMakerMap = {};

        if (existyMap.xAxis) {
            scaleMakerMap.xAxis = this._createAxisScaleMaker({
                min: this.options.xAxis.min,
                max: this.options.xAxis.max
            }, {
                valueType: 'x'
            });
        }

        if (existyMap.yAxis) {
            scaleMakerMap.yAxis = this._createAxisScaleMaker({
                min: this.options.yAxis.min,
                max: this.options.yAxis.max
            }, {
                valueType: 'y'
            });
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
        var scaleMakerMap = this._getAxisScaleMakerMap(),
            categories = this.dataProcessor.getCategories(),
            labelAxisData, xAxisData, yAxisData;

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
