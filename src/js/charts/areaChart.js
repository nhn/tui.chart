/**
 * @fileoverview Area chart
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase'),
    AxisTypeBase = require('./axisTypeBase'),
    VerticalTypeBase = require('./verticalTypeBase'),
    calculator = require('../helpers/calculator'),
    Series = require('../series/areaChartSeries');

var AreaChart = ne.util.defineClass(ChartBase, /** @lends AreaChart.prototype */ {
    /**
     * Line chart.
     * @constructs AreaChart
     * @extends ChartBase
     * @mixes AxisTypeBase
     * @mixes VerticalTypeBase
     * @param {array.<array>} userData chart data
     * @param {object} theme chart theme
     * @param {object} options chart options
     * @param {object} initedData initialized data from combo chart
     */
    init: function(userData, theme, options, initedData) {
        var baseData = initedData || this.makeBaseData(userData, theme, options, {
                isVertical: true,
                hasAxes: true
            }),
            convertData = baseData.convertData,
            bounds = baseData.bounds,
            axisData;

        this.className = 'ne-line-area';

        ChartBase.call(this, bounds, theme, options, initedData);

        axisData = this._makeAxesData(convertData, bounds, options, initedData);
        this._addComponents(convertData, axisData, options);
    },

    /**
     * Add components
     * @param {object} convertData converted data
     * @param {object} axesData axes data
     * @param {object} options chart options
     * @private
     */
    _addComponents: function(convertData, axesData, options) {
        var plotData = !ne.util.isUndefined(convertData.plotData) ? convertData.plotData : {
                vTickCount: axesData.yAxis.validTickCount,
                hTickCount: axesData.xAxis.validTickCount
            },
            seriesData = {
                allowNegativeTooltip: true,
                data: {
                    values: calculator.arrayPivot(convertData.values),
                    formattedValues: calculator.arrayPivot(convertData.formattedValues),
                    scale: axesData.yAxis.scale
                }
            };
        this.addAxisComponents({
            convertData: convertData,
            axes: axesData,
            plotData: plotData,
            chartType: options.chartType,
            Series: Series,
            seriesData: seriesData
        });
    }
});

AxisTypeBase.mixin(AreaChart);
VerticalTypeBase.mixin(AreaChart);

module.exports = AreaChart;
