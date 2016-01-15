/**
 * @fileoverview Bar chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase'),
    chartConst = require('../const'),
    axisTypeMixer = require('./axisTypeMixer'),
    barTypeMixer = require('./barTypeMixer'),
    axisDataMaker = require('../helpers/axisDataMaker'),
    Series = require('../series/barChartSeries');

var BarChart = tui.util.defineClass(ChartBase, /** @lends BarChart.prototype */ {
    /**
     * Bar chart.
     * @constructs BarChart
     * @extends ChartBase
     * @mixes axisTypeMixer
     * @param {Array.<Array>} rawData raw data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(rawData, theme, options) {
        /**
         * className
         * @type {string}
         */
        this.className = 'tui-bar-chart';

        /**
         * Whether has right y axis or not.
         * @type {boolean}
         */
        this.hasRightYAxis = false;

        options.series = options.series || {};

        if (options.series.diverging) {
            rawData.series = this._makeRawSeriesDataForDiverging(rawData.series, options.series.stacked);
            options.series.stacked = options.series.stacked || chartConst.STACKED_NORMAL_TYPE;
            this.hasRightYAxis = options.yAxis && tui.util.isArray(options.yAxis) && options.yAxis.length > 1;
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
     * Make axes data
     * @param {object} bounds chart bounds
     * @returns {object} axes data
     * @private
     */
    _makeAxesData: function(bounds) {
        var options = this.options,
            xAxisData = axisDataMaker.makeValueAxisData({
                values: this.dataProcessor.getGroupValues(),
                seriesDimension: bounds.series.dimension,
                stackedOption: options.series.stacked || '',
                divergingOption: options.series.diverging,
                chartType: options.chartType,
                formatFunctions: this.dataProcessor.getFormatFunctions(),
                options: options.xAxis
            }),
            yAxisData = axisDataMaker.makeLabelAxisData({
                labels: this.dataProcessor.getCategories(),
                isVertical: true
            }),
            axesData = {
                xAxis: xAxisData,
                yAxis: yAxisData
            };

        if (this.hasRightYAxis) {
            axesData.rightYAxis = tui.util.extend({
                isPositionRight: true
            }, JSON.parse(JSON.stringify(yAxisData)));
        }

        return axesData;
    },

    /**
     * Add components
     * @param {string} chartType chart type
     * @private
     */
    _addComponents: function(chartType) {
        var axes = ['yAxis', 'xAxis'];

        if (this.hasRightYAxis) {
            axes.push('rightYAxis');
        }
        this._addComponentsForAxisType({
            axes: axes,
            chartType: chartType,
            serieses: [
                {
                    name: 'barSeries',
                    SeriesClass: Series
                }
            ]
        });
    },

    /**
     * Render
     * @returns {HTMLElement} chart element
     */
    render: function() {
        var boundParams;

        if (this.hasRightYAxis) {
            boundParams = {
                optionChartTypes: ['bar', 'bar']
            };
        }

        return ChartBase.prototype.render.call(this, boundParams);
    },

    /**
     * Resize
     * @param {object} dimension dimension
     *      @param {number} dimension.width width
     *      @param {number} dimension.height height
     */
    resize: function(dimension) {
        var boundParams;

        if (this.hasRightYAxis) {
            boundParams = {
                optionChartTypes: ['bar', 'bar']
            };
        }

        ChartBase.prototype.resize.call(this, dimension, boundParams);
    },

    /**
     * On change selected legend.
     * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
     */
    onChangeCheckedLegends: function(checkedLegends) {
        var boundParams;

        if (this.hasRightYAxis) {
            boundParams = {
                optionChartTypes: ['bar', 'bar']
            };
        }

        ChartBase.prototype.onChangeCheckedLegends.call(this, checkedLegends, null, boundParams);
    }
});

axisTypeMixer.mixin(BarChart);
barTypeMixer.mixin(BarChart);

module.exports = BarChart;
