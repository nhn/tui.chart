/**
 * @fileoverview Bar chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase'),
    axisTypeMixer = require('./axisTypeMixer'),
    axisDataMaker = require('../helpers/axisDataMaker'),
    Series = require('../series/barChartSeries');

var BarChart = tui.util.defineClass(ChartBase, /** @lends BarChart.prototype */ {
    /**
     * Bar chart.
     * @constructs BarChart
     * @extends ChartBase
     * @mixes axisTypeMixer
     * @param {array.<array>} rawData raw data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(rawData, theme, options) {
        /**
         * className
         * @type {string}
         */
        this.className = 'tui-bar-chart';

        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options,
            hasAxes: true
        });

        this._addComponents(this.processedData, options.chartType);
    },

    /**
     * To make axes data
     * @param {object} processedData processed data
     * @param {object} bounds chart bounds
     * @param {object} options chart options
     * @returns {object} axes data
     * @private
     */
    _makeAxesData: function(processedData, bounds, options) {
        var xAxisData = axisDataMaker.makeValueAxisData({
                values: processedData.values,
                seriesDimension: bounds.series.dimension,
                stacked: options.series && options.series.stacked || '',
                chartType: options.chartType,
                formatFunctions: processedData.formatFunctions,
                options: options.xAxis
            }),
            yAxisData = axisDataMaker.makeLabelAxisData({
                labels: processedData.labels,
                isVertical: true
            });

        return {
            xAxis: xAxisData,
            yAxis: yAxisData
        };
    },

    /**
     * Add components
     * @param {object} processedData processed data
     * @param {string} chartType chart type
     * @private
     */
    _addComponents: function(processedData, chartType) {
        var seriesData = {
            allowNegativeTooltip: true,
            data: {
                values: processedData.values,
                formattedValues: processedData.formattedValues,
                formatFunctions: processedData.formatFunctions,
                joinLegendLabels: processedData.joinLegendLabels
            }
        };

        this._addComponentsForAxisType({
            processedData: processedData,
            axes: ['yAxis', 'xAxis'],
            chartType: chartType,
            serieses: [
                {
                    name: 'series',
                    SeriesClass: Series,
                    data: seriesData
                }
            ]
        });
    }
});

axisTypeMixer.mixin(BarChart);

module.exports = BarChart;
