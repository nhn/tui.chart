var Backbone = require('backbone'),
    _ = require('underscore'),
    SeriesModel;

SeriesModel = Backbone.Model.extend({
    defaults: {
        labels: [],
        values: [],
        vMinMaxTick: {},
        hMinMaxTick: {}
    },

    initialize: function(data) {
        this.setData(data);
    },

    setData: function(data) {
        this.set('labels', data.labels);
        this.set('values', data.values);
        this.set('vMinMaxTick', data.vMinMaxTick);
        this.set('hMinMaxTick', data.hMinMaxTick);
        console.log('series', this.toJSON());
    },

    toPixel: function() {

    }
});

module.exports = SeriesModel;