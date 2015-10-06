/**
 * @fileoverview Line chart
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase'),
    AxisTypeBase = require('./axisTypeBase'),
    VerticalTypeBase = require('./verticalTypeBase'),
    calculator = require('../helpers/calculator'),
    Series = require('../series/lineChartSeries');

var LineChart = ne.util.defineClass(ChartBase, /** @lends LineChart.prototype */ {
    /**
     * Line chart.
     * @constructs LineChart
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
            axesData;

        this.className = 'ne-line-chart';

        ChartBase.call(this, bounds, theme, options, initedData);

        axesData = this._makeAxesData(convertData, bounds, options, initedData);
        this._addComponents(convertData, axesData, options);
    },

    /**
     * Add components
     * @param {object} convertData converted data
     * @param {object} axesData axes data
     * @param {object} options chart options
     * @private
     */
    _addComponents: function(convertData, axesData) {
        var plotData, seriesData;

        plotData = this.makePlotData(convertData.plotData, axesData);
        seriesData = {
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
            Series: Series,
            seriesData: seriesData,
            aligned: axesData.xAxis && axesData.xAxis.aligned
        });
    }
});

AxisTypeBase.mixin(LineChart);
VerticalTypeBase.mixin(LineChart);

module.exports = LineChart;
