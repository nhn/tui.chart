/**
 * @fileoverview Bar chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var AxisTypeBase = require('./axisTypeBase.js'),
    dataConverter = require('../helpers/dataConverter.js'),
    boundsMaker = require('../helpers/boundsMaker.js'),
    axisDataMaker = require('../helpers/axisDataMaker.js'),
    Series = require('../series/barChartSeries.js');

var BarChart = ne.util.defineClass(AxisTypeBase, /** @lends BarChart.prototype */ {
    /**
     * Bar chart.
     * * @constructs BarChart
     * @param {array.<array>} userData chart data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(userData, theme, options) {
        var convertData = dataConverter.convert(userData, options.chart),
            bounds = boundsMaker.make({
                convertData: convertData,
                theme: theme,
                options: options
            }),
            yAxisData, xAxisData;

        AxisTypeBase.call(this, bounds, theme, options);

        yAxisData = axisDataMaker.makeLabelAxisData({
            labels: convertData.labels,
            isVertical: true
        });
        xAxisData = axisDataMaker.makeValueAxisData({
            values: convertData.values,
            seriesDimension: bounds.series.dimension,
            stacked: options.series && options.series.stacked || '',
            chartType: options.chartType,
            formatFunctions: convertData.formatFunctions,
            options: options.xAxis
        });

        this.className = 'ne-bar-chart';

        this.addAxisComponents({
            convertData: convertData,
            axes: {
                yAxis: yAxisData,
                xAxis: xAxisData
            },
            plotData: {
                vTickCount: yAxisData.validTickCount,
                hTickCount: xAxisData.validTickCount
            },
            Series: Series,
            axisScale: xAxisData.scale,
            options: options
        });
    }
});

module.exports = BarChart;