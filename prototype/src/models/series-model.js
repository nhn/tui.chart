var Backbone = require('backbone'),
    _ = require('underscore'),
    SeriesModel;

SeriesModel = Backbone.Model.extend({
    defaults: {
        labels: [],
        values: [],
        minMaxTick: {},
        percentValues: [],
        percentMin: 0
    },

    initialize: function(data) {
        this.setData(data);
    },

    setData: function(data) {
        var min = data.minMaxTick.min,
            max = data.minMaxTick.max;

        this.set('labels', data.labels);
        this.set('values', data.values);
        this.set('minMaxTick', data.minMaxTick);
        this.setPercentValues(data.values, min, max);
        this.set('percentMin', !min ? 0 : min/max);
    },

    convertValues: function(valueses, callback) {
        var result = _.map(valueses, function(values) {
            return _.map(values, callback);
        });
        return result;
    },

    setPercentValues: function(values, min, max) {
        var max = max - min,
            percentValues = this.convertValues(values, function(value) {
                return (value - min)/max;
            });
        this.set('percentValues', percentValues);
    },

    makePixelValues: function(size) {
        var values = this.get('percentValues'),
            pixelValues = this.convertValues(values, function(value) {
                return parseInt(value * size);
            });
        this.set('pixelValues', pixelValues);
    },

    getPixelValues: function() {
        return this.get('pixelValues');
    }
});

module.exports = SeriesModel;