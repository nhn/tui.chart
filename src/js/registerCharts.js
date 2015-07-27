'use strict';

var chartConst = require('./const.js'),
    chartFactory = require('./factories/chartFactory.js'),
    BarChartView = require('./views/barChartView.js');

chartFactory.register(chartConst.CHART_TYPE_BAR, BarChartView);