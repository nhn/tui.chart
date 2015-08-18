var _ = require('underscore'),
    chartFactory = require('./chart-factory.js'),
    pluginFactory = require('./plugin-factory.js');

require('./views/bar-chart-view.js');

module.exports = {
    barChart: function($container, data, options) {
        var chart = chartFactory.get('Bar', data, options);
        $container.html(chart.render());
        return chart;
    },

    registPlugin : pluginFactory.register
};