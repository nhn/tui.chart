/**
 * @fileoverview Column chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var AxisTypeBase = require('./axisTypeBase.js'),
    dataConverter = require('../helpers/dataConverter.js'),
    boundsMaker = require('../helpers/boundsMaker.js'),
    axisDataMaker = require('../helpers/axisDataMaker.js'),
    Series = require('../series/columnChartSeries.js');

var ColumnChart = ne.util.defineClass(AxisTypeBase, /** @lends ColumnChart.prototype */ {
    /**
     * Column chart.
     * * @constructs ColumnChart
     * @param {array.<array>} userData chart data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(userData, theme, options) {
        var convertData = dataConverter.convert(userData, options.chart),
            bounds = boundsMaker.make({
                convertData: convertData,
                theme: theme,
                isVertical: true,
                options: options
            }),
            yAxisData, xAxisData;

        AxisTypeBase.call(this, bounds, theme, options);

        yAxisData = axisDataMaker.makeValueAxisData({
            values: convertData.values,
            seriesDimension: bounds.series.dimension,
            stacked: options.series && options.series.stacked || '',
            chartType: options.chartType,
            formatFunctions: convertData.formatFunctions,
            options: options.xAxis,
            isVertical: true
        });

        xAxisData = axisDataMaker.makeLabelAxisData({
            labels: convertData.labels
        });

        this.className = 'ne-column-chart';

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
            axisScale: yAxisData.scale,
            isVertical: true,
            options: options
        });
    }
});

module.exports = ColumnChart;