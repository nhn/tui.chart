/**
 * @fileoverview ColumnChart
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var AxisTypeBase = require('./axisTypeBase.js'),
    dataConverter = require('../helpers/dataConverter.js'),
    boundsMaker = require('../helpers/boundsMaker.js'),
    axisDataMaker = require('../helpers/axisDataMaker.js'),
    Series = require('../series/ColumnChartSeries.js');

var ColumnChart = ne.util.defineClass(AxisTypeBase, /** @lends ColumnChart.prototype */ {
    init: function(userData, theme, options) {
        var convertData = dataConverter.convert(userData, options.chart),
            bounds = boundsMaker.make({
                convertData: convertData,
                theme: theme,
                isVertical: true,
                options: options
            }),
            vAxisData, hAxisData;

        AxisTypeBase.call(this, bounds, theme, options);

        vAxisData = axisDataMaker.makeValueAxisData({
            values: convertData.values,
            seriesDimension: bounds.series.dimension,
            stacked: options.series && options.series.stacked || '',
            chartType: options.chartType,
            formatFunctions: convertData.formatFunctions,
            options: options.hAxis,
            isVertical: true
        });

        hAxisData = axisDataMaker.makeLabelAxisData({
            labels: convertData.labels
        });

        this.className = 'ne-column-chart';

        this.addAxisComponents({
            convertData: convertData,
            axes: {
                vAxis: vAxisData,
                hAxis: hAxisData
            },
            plotData: {
                vTickCount: vAxisData.validTickCount,
                hTickCount: hAxisData.validTickCount
            },
            Series: Series,
            axisScale: vAxisData.scale,
            isVertical: true,
            options: options
        });
    }
});

module.exports = ColumnChart;