/**
 * @fileoverview Column chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase'),
    chartConst = require('../const'),
    axisTypeMixer = require('./axisTypeMixer'),
    barTypeMixer = require('./barTypeMixer'),
    axisDataMaker = require('../helpers/axisDataMaker'),
    Series = require('../series/columnChartSeries');

var ColumnChart = tui.util.defineClass(ChartBase, /** @lends ColumnChart.prototype */ {
    /**
     * Column chart.
     * @constructs ColumnChart
     * @extends ChartBase
     * @mixes axisTypeMixer
     * @mixes verticalTypeMixer
     * @param {Array.<Array>} rawData raw data
     * @param {object} theme chart theme
     * @param {object} options chart options
     * @param {object} initedData initialized data from combo chart
     */
    init: function(rawData, theme, options) {
        /**
         * className
         * @type {string}
         */
        this.className = 'tui-column-chart';

        options.series = options.series || {};

        if (options.series.diverging) {
            rawData.series = this._makeRawSeriesDataForDiverging(rawData.series, options.series.stacked);
            options.series.stacked = options.series.stacked || chartConst.STACKED_NORMAL_TYPE;
        }

        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options,
            hasAxes: true,
            isVertical: true
        });

        this._addComponents(options.chartType);
    },

    /**
     * Make axes data
     * @returns {object} axes data
     * @private
     */
    _makeAxesData: function() {
        var options = this.options,
            xAxisData = axisDataMaker.makeLabelAxisData({
                labels: this.dataProcessor.getCategories(),
                options: options.xAxis
            }),
            yAxisData = axisDataMaker.makeValueAxisData({
                values: this.dataProcessor.getGroupValues(),
                seriesDimension: {
                    height: this.boundsMaker.makeSeriesHeight()
                },
                stackedOption: options.series.stacked || '',
                divergingOption: options.series.diverging,
                chartType: options.chartType,
                formatFunctions: this.dataProcessor.getFormatFunctions(),
                options: options.yAxis,
                isVertical: true
            });

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
                    name: 'xAxis',
                    isLabel: true
                }
            ],
            chartType: chartType,
            serieses: [
                {
                    name: 'columnSeries',
                    SeriesClass: Series,
                    data: {
                        allowNegativeTooltip: true
                    }
                }
            ]
        });
    }
});

axisTypeMixer.mixin(ColumnChart);
barTypeMixer.mixin(ColumnChart);

module.exports = ColumnChart;
