var _ = require('underscore'),
    ChartModel = require('./chart-model'),
    SeriesModel = require('./series-model'),
    AxisModel = require('./axis-model'),
    PlotModel = require('./plot-model'),
    BarChartModel;

BarChartModel = ChartModel.extend({
    defaults: function() {
        return _.extend(this.constructor.__super__.defaults, {
            labels: [],
            styles: [],
            series: null,
            hAxis: null,
            vAxis: null,
            plot: null
        });
    },

    initialize: function(options) {
        this.constructor.__super__.initialize.call(this, options);
    },

    setData: function(data) {
        var seriesData = this.pickSeriesData(data),
            labels = this.pickLabels(seriesData),
            values = this.pickValues(seriesData),
            vAxis = new AxisModel({values: values}),
            hAxis = new AxisModel({labels: labels}),
            plot = new PlotModel({
                vTickCount: vAxis.getTickCount(),
                hTickCount: hAxis.getTickCount()
            });

        this.set('labels', labels);
        this.set('values', values);
        this.setSeries(labels, values, vAxis.getMinMaxTick(), hAxis.getMinMaxTick());
        this.set('vAxis', vAxis);
        this.set('hAxis', hAxis);
        this.set('plot', plot);
    },

    pickSeriesData: function(data) {
        var seriesData = _.rest(data);
        if (typeof _.last(_.first(data)) === 'object') {
            seriesData = _.map(seriesData, function(items) {
                console.log(items.length);
                items.length = items.length - 1;
                return items;
            });
        }
        return seriesData;
    },

    pickLabels: function(seriesData) {
        var labels = _.map(seriesData, function(items) {
            return _.first(items);
        });
        return labels;
    },

    pickValues: function(seriesData) {
        var values = _.map(seriesData, function(items) {
            return _.rest(items);
        });
        return values;
    },

    setSeries: function(labels, values, vMinMaxTick, hMinMaxTick) {
        var data = {
            labels: labels,
            values: values,
            vMinMaxTick: vMinMaxTick,
            hMinMaxTick: hMinMaxTick
        };
        this.set('series', new SeriesModel(data))
    },

    getVAxis: function() {
        return this.get('vAxis');
    },

    getHAxis: function() {
        return this.get('xAxis');
    }
});

module.exports = BarChartModel;