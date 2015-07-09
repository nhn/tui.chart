/**
 * @fileoverview
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */
'use strict';

var chartFactory = require('./factory/chartFactory.js'),
    pluginFactory = require('./factory/chartFactory.js');

var neChart = ne.util.defineNamespace('ne.application.chart');
require('./views/barChartView.js');

neChart.barChart =  function(container, data, options) {
    var chart = chartFactory.get('Bar', data, options);
    container.appendChild(chart.render());
    return chart;
};

neChart.registPlugin = pluginFactory.register;