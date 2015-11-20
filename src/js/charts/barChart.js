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
     * @param {array.<array>} userData chart data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(userData, theme, options) {
        /**
         * className
         * @type {string}
         */
        this.className = 'tui-bar-chart';

        ChartBase.call(this, {
            userData: userData,
            theme: theme,
            options: options,
            hasAxes: true
        });

        this._addComponents(this.convertedData, options.chartType);
    },

    /**
     * To make axes data
     * @param {object} convertedData converted data
     * @param {object} bounds chart bounds
     * @param {object} options chart options
     * @returns {object} axes data
     * @private
     */
    _makeAxesData: function(convertedData, bounds, options) {
        var xAxisData = axisDataMaker.makeValueAxisData({
                values: convertedData.values,
                seriesDimension: bounds.series.dimension,
                stacked: options.series && options.series.stacked || '',
                chartType: options.chartType,
                formatFunctions: convertedData.formatFunctions,
                options: options.xAxis
            }),
            yAxisData = axisDataMaker.makeLabelAxisData({
                labels: convertedData.labels,
                isVertical: true
            });
        yAxisData.aligned = xAxisData.aligned;

        return {
            xAxis: xAxisData,
            yAxis: yAxisData
        };
    },

    /**
     * Add components
     * @param {object} convertedData converted data
     * @param {string} chartType chart type
     * @private
     */
    _addComponents: function(convertedData, chartType) {
        var seriesData = {
            allowNegativeTooltip: true,
            data: {
                values: convertedData.values,
                formattedValues: convertedData.formattedValues,
                formatFunctions: convertedData.formatFunctions
            }
        };

        this.addComponentsForAxisType({
            convertedData: convertedData,
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
