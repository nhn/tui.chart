var _ = require('underscore'),
    charts = {};

module.exports = {
    get: function(type, data, options) {
        if (charts[type]) {
            var chart = new charts[type](_.extend({data: data}, options));
            return chart;
        } else {
            throw new Error(type + '차트는 존재하지 않습니다.');
        }
    },
    register: function(type, ChartClass) {
        charts[type] = ChartClass;
    }
};