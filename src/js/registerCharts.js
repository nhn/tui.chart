'use strict';

var chartConst = require('./const');
var chartFactory = require('./factories/chartFactory');
var BarChart = require('./charts/barChart');
var ColumnChart = require('./charts/columnChart');
var LineChart = require('./charts/lineChart');
var AreaChart = require('./charts/areaChart');
var ComboChart = require('./charts/comboChart');
var PieChart = require('./charts/pieChart');
var BubbleChart = require('./charts/bubbleChart');
var ScatterChart = require('./charts/scatterChart');
var MapChart = require('./charts/mapChart');

chartFactory.register(chartConst.CHART_TYPE_BAR, BarChart);
chartFactory.register(chartConst.CHART_TYPE_COLUMN, ColumnChart);
chartFactory.register(chartConst.CHART_TYPE_LINE, LineChart);
chartFactory.register(chartConst.CHART_TYPE_AREA, AreaChart);
chartFactory.register(chartConst.CHART_TYPE_COMBO, ComboChart);
chartFactory.register(chartConst.CHART_TYPE_PIE, PieChart);
chartFactory.register(chartConst.CHART_TYPE_DONUT, PieChart);
chartFactory.register(chartConst.CHART_TYPE_BUBBLE, BubbleChart);
chartFactory.register(chartConst.CHART_TYPE_SCATTER, ScatterChart);
chartFactory.register(chartConst.CHART_TYPE_MAP, MapChart);
