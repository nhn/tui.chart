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
    hAxis: null,
    vAxis: null,
    legend: null,
    plot: null,
    series: null,
    bars: 'vertical',

    init: function(options) {

    },

    setData: function(data) {
        var seriesData = this.pickSeriesData(data),
            labels = this.pickLabels(seriesData),
            values = this.pickValues(seriesData),
            legendLabels = this.pickLegendLabels(data[0]),
            labelAxis = new AxisModel({data: {labels: labels}}),
            valueAxis = new AxisModel({data: {values: values}}),
            colors = this.pickColors(legendLabels.length);

        if (this.bars === 'vertical') {
            this.hAxis = labelAxis;
            this.vAxis = valueAxis;
        } else {
            this.hAxis = valueAxis;
            this.vAxis = labelAxis;
        }

        this.plot = new PlotModel({
            data:{
                vTickCount: this.vAxis.getTickCount(),
                hTickCount: this.hAxis.getTickCount()
            }
        });

        this.legend = new LegendModel({
            data: {
                labels: legendLabels,
                colors: colors
            }
        });

        this.series = new SeriesModel({
            data: {
                values: values,
                scale: valueAxis.getScale(),
                colors: colors
            }
        });
    },

    /**
     * picked series data from user initial data
     * series data is pairs of label and value​
     * @param {object} data user initial data
     * @return {object} series data;
     */
    pickSeriesData: function(data) {
        var titleArr = data[0],
            seriesData = aps.call(data);

        seriesData.shift();

        if (this.hasStyleOption(titleArr)) {
            seriesData = ne.util.map(seriesData, function(items) {
                items = aps.call(items);
                items.length = items.length - 1;
                return items;
            });
        }

        return seriesData;
    },

    /**
     * picked labels from seriesData
     * @param {object} seriesData
     * @returns {array}
     */
    pickLabels: function(seriesData) {
        var arr = ne.util.map(seriesData, function(items) {
            return items[0];
        });
        return arr;
    },

    pickValues: function(seriesData) {
        var arr2d = ne.util.map(seriesData, function(items) {
            var values = aps.call(items);
            values.shift();
            return values;
        });
        return arr2d;
    },

    hasStyleOption: function(arr) {
        var lastItem = arr[arr.length-1];
        return typeof lastItem === 'object';
    },

    pickLegendLabels: function(titleArr) {
        var hasOption = this.hasStyleOption(titleArr),
            last = hasOption ? titleArr.length - 1 : -1,
            arr = ne.util.filter(titleArr, function(label, index) {
                return index !== 0 && index !== last;
            });
        return arr;
    }
});

module.exports = BarChartModel;
