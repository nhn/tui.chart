/**
 * @fileoverview Column chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase'),
    axisTypeMixer = require('./axisTypeMixer'),
    verticalTypeMixer = require('./verticalTypeMixer'),
    Series = require('../series/columnChartSeries');

var ColumnChart = tui.util.defineClass(ChartBase, /** @lends ColumnChart.prototype */ {
    /**
     * Column chart.
     * @constructs ColumnChart
     * @extends ChartBase
     * @mixes axisTypeMixer
     * @mixes verticalTypeMixer
     * @param {array.<array>} userData chart data
     * @param {object} theme chart theme
     * @param {object} options chart options
     * @param {object} initedData initialized data from combo chart
     */
    init: function(userData, theme, options) {
        /**
         * className
         * @type {string}
         */
        this.className = 'tui-column-chart';

        ChartBase.call(this, {
            userData: userData,
            theme: theme,
            options: options,
            hasAxes: true,
            isVertical: true
        });

        this._addComponents(this.convertedData, options.chartType);
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
                formatFunctions: convertedData.formatFunctions,
                joinLegendLabels: convertedData.joinLegendLabels
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

axisTypeMixer.mixin(ColumnChart);
verticalTypeMixer.mixin(ColumnChart);

module.exports = ColumnChart;
