var _ = require('underscore'),
    chartFactory = require('./chartFactory.js');

require('./views/bar-chart-view.js');

module.exports = {
    barChart: function($container, data, options) {
        var chart = chartFactory.create('Bar', data, options);
        $container.html(chart.render());
        return chart;
    }
};
