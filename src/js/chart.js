/**
 * @fileoverview ne chart
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */
'use strict';

var chartFactory = require('./factories/chartFactory.js'),
    pluginFactory = require('./factories/pluginFactory.js'),
    themeFactory = require('./factories/themeFactory.js');

var DEFAULT_THEME_NAME = 'default';

var neChart, createChart;

require('./util.js');
require('./views/barChartView.js');
require('./themes/defaultTheme.js');

neChart = ne.util.defineNamespace('ne.application.chart');
createChart = function(container, chartType, data, options) {
    var theme, chart;

    options = options || {};
    theme = options.theme || DEFAULT_THEME_NAME;
    options.theme = themeFactory.get(theme);

    chart = chartFactory.get(chartType, data, options);
    container.appendChild(chart.render());

    return chart;
};

/**
 * Bar chart creator
 * @param {element} container chart container
 * @param {object} data chart data
 * @param {object} options chart options
 * @returns {object} bar chart
 */
neChart.barChart = function(container, data, options) {
    options = options || {};
    options.chartType = 'bar';
    options.barType = 'bar';
    return createChart(container, 'Bar', data, options);
};

/**
 * Column chart creator
 * @param {element} container chart container
 * @param {object} data chart data
 * @param {object} options chart options
 * @returns {object} column chart
 */
neChart.columnChart = function(container, data, options) {
    options = options || {};
    options.chartType = 'bar';
    options.barType = 'column';
    return createChart(container, 'Bar', data, options);
};

neChart.registPlugin = pluginFactory.register;
neChart.registTheme = themeFactory.register;