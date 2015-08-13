/**
 * @fileoverview LineChart
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var AxisTypeBase = require('./axisTypeBase.js'),
    renderUtil = require('../helpers/renderUtil.js'),
    dataConverter = require('../helpers/dataConverter.js'),
    boundsMaker = require('../helpers/boundsMaker.js'),
    axisDataMaker = require('../helpers/axisDataMaker.js'),
    Series = require('../series/LineChartSeries.js');

var LineChart = ne.util.defineClass(AxisTypeBase, /** @lends LineChart.prototype */ {
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

        this.className = 'ne-line-chart';

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
            seriesData: {
                values: renderUtil.arrayPivot(convertData.values),
                formattedValues: renderUtil.arrayPivot(convertData.formattedValues),
                scale: vAxisData.scale
            },
            axisScale: vAxisData.scale,
            isVertical: true,
            options: options
        });
    },

    /**
     * Attach custom event
     * @private
     */
    _attachCustomEvent: function() {
        var tooltip = this.componentMap.tooltip,
            series = this.componentMap.series;
        tooltip.on('showDot', series.onShowDot, series);
        tooltip.on('hideDot', series.onHideDot, series);
        AxisTypeBase.prototype._attachCustomEvent.apply(this);
    }
});

module.exports = LineChart;