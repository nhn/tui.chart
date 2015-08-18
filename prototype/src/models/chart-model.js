var Backbone = require('backbone'),
    _ = require('underscore'),
    ChartModel;

ChartModel = Backbone.Model.extend({
    defaults: {
        title: '',
        values: []
    },

    initialize: function(options) {
        this.setData(options.data);
    },

    setData: function() {
        throw new Error('setData를 구현해야 합니다.');
    }
});

module.exports = ChartModel;