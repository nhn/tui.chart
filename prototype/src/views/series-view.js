var Backbone = require('backbone'),
    _ = require('underscore'),
    pluginFactory = require('../plugin-factory.js'),
    SeriesView;

SeriesView = Backbone.View.extend({
    className: 'series-area',
    initialize: function(options) {
        var libType = options.libType || 'RAPHAEL',
            chartType = options.chartType,
            plugin = pluginFactory.get(libType),
            renderer = plugin.renderer[chartType];

        if (renderer) {
            this.model = options.model;
            this.renderer = renderer;
        } else {
            throw new Error(this.chartType + '는 존재하지 않습니다.');
        }
    },

    mouseoverSeries: function(pos, index) {
        console.log('in', index, pos);
    },

    mouseoutSeries: function(index) {
        console.log('out', index);
    },

    render: function(size) {
        var mouseoverSeries = _.bind(this.mouseoverSeries, this),
            mouseoutSeries = _.bind(this.mouseoutSeries, this),
            pixelValues, data;

        this.model.makePixelValues(size.height);

        pixelValues = this.model.getPixelValues();
        data = _.extend({
            markers: this.model.get('values'),
            values: pixelValues
        }, size);

        this.renderer(this.$el, data, mouseoverSeries,  mouseoutSeries);
        this.$el.css(size);
        return this.$el;
    }
});

module.exports = SeriesView;