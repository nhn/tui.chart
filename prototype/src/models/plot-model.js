var Backbone = require('backbone'),
    _ = require('underscore'),
    PlotModel;

PlotModel = Backbone.Model.extend({
    defaults: {
        vTickCount: 0,
        hTickCount: 0
    },

    initialize: function(data) {
        this.setData(data);
    },

    setData: function(data) {
        this.set('vTickCount', data.vTickCount);
        this.set('hTickCount', data.hTickCount);
        console.log('plot', this.toJSON());
    },

    toPixel: function() {

    }
});

module.exports = PlotModel;