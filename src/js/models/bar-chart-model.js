/**
 * @fileoverview bar chart model
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var ChartModel = require('./chart-model.js'),
    AxisModel = require('./axis-model.js'),
    PlotModel = require('./plot-model.js'),
    LegendModel = require('./legend-model.js'),
    SeriesModel = require('./series-model.js'),
    aps = Array.prototype.slice,
    BarChartModel;

BarChartModel = ne.util.defineClass(ChartModel, {
    title: '',
    chartArea: '50%',
    hAxis: null,
    vAxis: null,
    legend: null,
    plot: null,
    series: null,
    bars: 'vertical',

    /**
     * constructor
     * @param {object} options
     */
    init: function(data, options) {
        ChartModel.prototype.init.call(this, data, options);
    },

    /**
     * set bar chart data
     * @param {object} data
     */
    setData: function(data) {
        var options = this.options || {},
            axisData = this.pickAxisData(data),
            labels = this.pickLabels(axisData),
            values = this.pickValues(axisData),
            legendLabels = this.pickLegendLabels(data[0]),
            hAxis = new AxisModel({labels: labels}, options.hAxis),
            vAxis = new AxisModel({values: values}, options.vAxis),
            axisScale = vAxis.scale,
            colors = this.pickColors(legendLabels.length);

        this.title = options.title || this.title;
        this.chartArea = options.chartArea || this.chartArea;
        this.bars = options.bars || this.bars;

        if (this.bars === 'vertical') {
            this.hAxis = hAxis;
            this.vAxis = vAxis;
        } else {
            this.hAxis = vAxis;
            this.vAxis = hAxis;
        }

        this.plot = new PlotModel({
            vTickCount: this.vAxis.tickCount,
            hTickCount: this.hAxis.tickCount
        });

        this.legend = new LegendModel({
            labels: legendLabels,
            colors: colors
        });

        this.series = new SeriesModel({
            values: values,
            scale: axisScale,
            colors: colors
        });
    }
});

module.exports = BarChartModel;
