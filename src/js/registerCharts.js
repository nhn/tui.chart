'use strict';

var chartConst = require('./const.js'),
    chartFactory = require('./factories/chartFactory.js'),
    BarChartView = require('./views/barChartView.js'),
    LineChartView = require('./views/lineChartView.js');

chartFactory.register(chartConst.CHART_TYPE_BAR, BarChartView);
chartFactory.register(chartConst.CHART_TYPE_LINE, LineChartView);