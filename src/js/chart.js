/**
 * @fileoverview ne chart
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */
'use strict';

var chartConst = require('./const.js'),
    chartFactory = require('./factories/chartFactory.js'),
    pluginFactory = require('./factories/pluginFactory.js'),
    themeFactory = require('./factories/themeFactory.js');

var DEFAULT_THEME_NAME = 'default';

var neChart, createChart;

require('./util.js');
require('./registerCharts.js');
require('./registerThemes.js');

neChart = ne.util.defineNamespace('ne.application.chart');

/**
 * Create chart.
 * @param {HTMLElement} container container
 * @param {object} data user data
 * @param {object} options chart options
 * @returns {object} chart instance.
 */
createChart = function(container, data, options) {
    var theme, chart;

    options = options || {};
    theme = options.theme || DEFAULT_THEME_NAME;
    options.theme = themeFactory.get(theme);

    chart = chartFactory.get(options.chartType, data, options);
    container.appendChild(chart.render());

    return chart;
};

/**
 * Bar chart creator
 * @param {HTMLElement} container chart container
 * @param {object} data chart data
 * @param {object} options chart options
 * @returns {object} bar chart
 */
neChart.barChart = function(container, data, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_BAR;
    options.barType = chartConst.BAR_TYPE_BAR;
    return createChart(container, data, options);
};

/**
 * Column chart creator
 * @param {HTMLElement} container chart container
 * @param {object} data chart data
 * @param {object} options chart options
 * @returns {object} column chart
 */
neChart.columnChart = function(container, data, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_BAR;
    options.barType = chartConst.BAR_TYPE_COLUMN;
    return createChart(container, data, options);
};

/**
 * Line chart creator
 * @param {HTMLElement} container chart container
 * @param {object} data chart data
 * @param {object} options chart options
 * @returns {object} bar chart
 */
neChart.lineChart = function(container, data, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_LINE;
    return createChart(container, data, options);
};

neChart.registerPlugin = pluginFactory.register;
neChart.registerTheme = themeFactory.register;