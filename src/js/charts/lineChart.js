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
    Series = require('../series/lineChartSeries'),
    LineTypeCoordinateEventor = require('../eventors/lineTypeCoordinateEventor');

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
            convertedData = baseData.convertedData,
            bounds = baseData.bounds,
            axesData = this._makeAxesData(convertedData, bounds, options, initedData),
            tickCount;

        this.className = 'ne-line-chart';

        ChartBase.call(this, {
            bounds: bounds,
            axesData: axesData,
            theme: theme,
            options: options,
            isVertical: true,
            initedData: initedData
        });

        this.isSubChart = !!initedData;

        if (!this.isSubChart && !this.isGroupedTooltip) {
            tickCount = axesData.xAxis && axesData.xAxis.tickCount || -1;
            this.addComponent('eventor', LineTypeCoordinateEventor, {
                tickCount: tickCount
            });
        }

        this._addComponents(convertedData, axesData, options);
    },

    render: function() {
        if (!this.isSubChart && !this.isGroupedTooltip) {
            this._attachLineTypeCoordinateEvent();
        }
        return ChartBase.prototype.render.apply(this, arguments);
    },

    _attachLineTypeCoordinateEvent: function() {
        var eventor = this.componentMap.eventor,
            series = this.componentMap.series;
        eventor.on('overTickSector', series.onLineTypeOverTickSector, series);
        eventor.on('outTickSector', series.onLineTypeOutTickSector, series);
    },

    /**
     * Add components
     * @param {object} convertedData converted data
     * @param {object} axesData axes data
     * @param {object} options chart options
     * @private
     */
    _addComponents: function(convertedData, axesData) {
        var plotData, seriesData;

        plotData = this.makePlotData(convertedData.plotData, axesData);
        seriesData = {
            data: {
                values: calculator.arrayPivot(convertedData.values),
                formattedValues: calculator.arrayPivot(convertedData.formattedValues),
                scale: axesData.yAxis.scale,
                xTickCount: axesData.xAxis && axesData.xAxis.tickCount || -1
            }
        };
        this.addAxisComponents({
            convertedData: convertedData,
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
