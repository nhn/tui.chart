/**
 * @fileoverview chart.js is entry point of Application Chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */
'use strict';

var chartConst = require('./const.js'),
    chartFactory = require('./factories/chartFactory.js'),
    pluginFactory = require('./factories/pluginFactory.js'),
    themeFactory = require('./factories/themeFactory.js');

var DEFAULT_THEME_NAME = 'default';

var _createChart;

require('./util.js');
require('./registerCharts.js');
require('./registerThemes.js');

/**
 * NHN Entertainment Application Chart.
 * @namespace ne.application.chart
 */
ne.util.defineNamespace('ne.application.chart');

/**
 * Create chart.
 * @param {HTMLElement} container container
 * @param {array.<array>} data chart data
 * @param {{
 *   chart: {
 *     width: number,
 *     height: number,
 *     title: string,
 *     format: string
 *   },
 *   vAxis: {
 *     title: string,
 *     min: number
 *   },
 *   hAxis: {
 *     title: strig,
 *     min: number
 *   },
 *   tooltip: {
 *     suffix: string,
 *     template: string
 *   },
 *   theme: string
 * }} options chart options
 * @returns {object} chart instance.
 * @private
 * @ignore
 */
_createChart = function(container, data, options) {
    var theme, chart;

    options = options || {};
    theme = options.theme || DEFAULT_THEME_NAME;
    options.theme = themeFactory.get(theme);

    chart = chartFactory.get(options.chartType, data, options);
    container.appendChild(chart.render());

    return chart;
};

/**
 * Bar chart creator.
 * @memberOf ne.application.chart
 * @param {HTMLElement} container chart container
 * @param {array.<array>} data chart data
 * @param {object} options chart options
 *      @param {object} options.chart chart options
 *          @param {number} options.chart.width chart width
 *          @param {number} options.chart.height chart height
 *          @param {string} options.chart.title chart title
 *          @param {string} options.chart.format value format
 *      @param {object} options.vAxis options of vertical axis
 *          @param {string} options.vAxis.title title of vertical axis
 *          @param {number} options.vAxis.min minimal value of vertical axis
 *      @param {object} options.hAxis options of horizontal axis
 *          @param {string} options.hAxis.title title of horizontal axis
 *          @param {number} options.hAxis.min minimal value of horizontal axis
 *      @param {object} options.tooltip options of tooltip
 *          @param {string} options.tooltip.suffix suffix of tooltip
 *          @param {string} options.tooltip.template template of tooltip
 *      @param {string} options.theme theme name
 *      @param {string} options.libType graph library type
 * @returns {object} bar chart
 * @example
 * var container = document.getElementById('container-id'),
 *     data = [
 *       ['Groups', 'Group1', 'Group2', 'Group3'],
 *       ['Legend1', 20, 30, 50],
 *       ['Legend2', 40, 40, 60],
 *       ['Legend3', 60, 50, 10],
 *       ['Legend4', 80, 10, 70]
 *     ],
 *     options = {
 *       chart: {
 *         title: 'Bar Chart'
 *       },
 *       vAxis: {
 *         title: 'Vertical Axis'
 *       },
 *       hAxis: {
 *         title: 'Horizontal Axis'
 *       }
 *     };
 * ne.application.chart.barChart(container, data, options);
 */
ne.application.chart.barChart = function(container, data, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_BAR;
    options.barType = chartConst.BAR_TYPE_BAR;
    return _createChart(container, data, options);
};

/**
 * Column chart creator.
 * @memberOf ne.application.chart
 * @param {HTMLElement} container chart container
 * @param {array.<array>} data chart data
 * @param {object} options chart options
 *      @param {object} options.chart chart options
 *          @param {number} options.chart.width chart width
 *          @param {number} options.chart.height chart height
 *          @param {string} options.chart.title chart title
 *          @param {string} options.chart.format value format
 *      @param {object} options.vAxis options of vertical axis
 *          @param {string} options.vAxis.title title of vertical axis
 *          @param {number} options.vAxis.min minimal value of vertical axis
 *      @param {object} options.hAxis options of horizontal axis
 *          @param {string} options.hAxis.title title of horizontal axis
 *          @param {number} options.hAxis.min minimal value of horizontal axis
 *      @param {object} options.tooltip options of tooltip
 *          @param {string} options.tooltip.suffix suffix of tooltip
 *          @param {string} options.tooltip.template template of tooltip
 *      @param {string} options.theme theme name
 *      @param {string} options.libType graph library type
 * @returns {object} column chart
 * @example
 * var container = document.getElementById('container-id'),
 *     data = [
 *       ['Groups', 'Group1', 'Group2', 'Group3'],
 *       ['Legend1', 20, 30, 50],
 *       ['Legend2', 40, 40, 60],
 *       ['Legend3', 60, 50, 10],
 *       ['Legend4', 80, 10, 70]
 *     ],
 *     options = {
 *       chart: {
 *         title: 'Column Chart'
 *       },
 *       vAxis: {
 *         title: 'Vertical Axis'
 *       },
 *       hAxis: {
 *         title: 'Horizontal Axis'
 *       }
 *     };
 * ne.application.chart.columnChart(container, data, options);
 */
ne.application.chart.columnChart = function(container, data, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_BAR;
    options.barType = chartConst.BAR_TYPE_COLUMN;
    return _createChart(container, data, options);
};

/**
 * Line chart creator.
 * @memberOf ne.application.chart
 * @param {HTMLElement} container chart container
 * @param {array.<array>} data chart data
 * @param {object} options chart options
 *      @param {object} options.chart chart options
 *          @param {number} options.chart.width chart width
 *          @param {number} options.chart.height chart height
 *          @param {string} options.chart.title chart title
 *          @param {string} options.chart.format value format
 *      @param {object} options.vAxis options of vertical axis
 *          @param {string} options.vAxis.title title of vertical axis
 *          @param {number} options.vAxis.min minimal value of vertical axis
 *      @param {object} options.hAxis options of horizontal axis
 *          @param {string} options.hAxis.title title of horizontal axis
 *          @param {number} options.hAxis.min minimal value of horizontal axis
 *      @param {object} options.series options of series
 *          @param {boolean} options.series.hasDot whether has dot or not
 *      @param {object} options.tooltip options of tooltip
 *          @param {string} options.tooltip.suffix suffix of tooltip
 *          @param {string} options.tooltip.template template of tooltip
 *      @param {string} options.theme theme name
 *      @param {string} options.libType graph library type
 * @returns {object} bar chart
 * @example
 * var container = document.getElementById('container-id'),
 *     data = [
 *       ['Groups', 'Group1', 'Group2', 'Group3'],
 *       ['Legend1', 20, 30, 50],
 *       ['Legend2', 40, 40, 60],
 *       ['Legend3', 60, 50, 10],
 *       ['Legend4', 80, 10, 70]
 *     ],
 *     options = {
 *       chart: {
 *         title: 'Line Chart'
 *       },
 *       vAxis: {
 *         title: 'Vertical Axis'
 *       },
 *       hAxis: {
 *         title: 'Horizontal Axis'
 *       },
 *       series: {
 *         hasDot: true
 *       }
 *     };
 * ne.application.chart.lineChart(container, data, options);
 */
ne.application.chart.lineChart = function(container, data, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_LINE;
    return _createChart(container, data, options);
};

/**
 * Register theme.
 * @memberOf ne.application.chart
 * @param {string} themeName theme name
 * @param {object} theme application chart theme
 *      @param {object} theme.chart chart theme
 *          @param {string} theme.chart.fontFamily font family of chart
 *          @param {string} theme.chart.background background of chart
 *      @param {object} theme.title chart theme
 *          @param {number} theme.title.fontSize font size of chart title
 *          @param {string} theme.title.fontFamily font family of chart title
 *          @param {string} theme.title.color font color of chart title
 *          @param {string} theme.title.background background of chart title
 *      @param {object} theme.vAxis theme of vertical axis
 *          @param {object} theme.vAxis.title theme of vertical axis title
 *              @param {number} theme.vAxis.title.fontSize font size of vertical axis title
 *              @param {string} theme.vAxis.title.fontFamily font family of vertical axis title
 *              @param {string} theme.vAxis.title.color font color of vertical axis title
 *          @param {object} theme.vAxis.label theme of vertical axis label
 *              @param {number} theme.vAxis.label.fontSize font size of vertical axis label
 *              @param {string} theme.vAxis.label.fontFamily font family of vertical axis label
 *              @param {string} theme.vAxis.label.color font color of vertical axis label
 *          @param {string} theme.vAxis.tickcolor color of vertical axis tick
 *      @param {object} theme.hAxis theme of horizontal axis
 *          @param {object} theme.hAxis.title theme of horizontal axis title
 *              @param {number} theme.hAxis.title.fontSize font size of horizontal axis title
 *              @param {string} theme.hAxis.title.fontFamily font family of horizontal axis title
 *              @param {string} theme.hAxis.title.color font color of horizontal axis title
 *          @param {object} theme.hAxis.label theme of horizontal axis label
 *              @param {number} theme.hAxis.label.fontSize font size of horizontal axis label
 *              @param {string} theme.hAxis.label.fontFamily font family of horizontal axis label
 *              @param {string} theme.hAxis.label.color font color of horizontal axis label
 *          @param {string} theme.hAxis.tickcolor color of horizontal axis tick
 *      @param {object} theme.plot plot theme
 *          @param {string} theme.plot.lineColor plot line color
 *          @param {string} theme.plot.background plot background
 *      @param {object} theme.series series theme
 *          @param {array.<string>} theme.series.colors series colors
 *          @param {string} theme.series.borderColor series border color
 *      @param {object} theme.legend legend theme
 *          @param {object} theme.legend.label theme of legend label
 *              @param {number} theme.legend.label.fontSize font size of legend label
 *              @param {string} theme.legend.label.fontFamily font family of legend label
 *              @param {string} theme.legend.label.color font color of legend label
 * @example
 * var theme = {
 *   vAxis: {
 *     tickColor: '#ccbd9a',
 *       title: {
 *         color: '#333333'
 *       },
 *       label: {
 *         color: '#6f491d'
 *       }
 *     },
 *     hAxis: {
 *       tickColor: '#ccbd9a',
 *       title: {
 *         color: '#333333'
 *       },
 *       label: {
 *         color: '#6f491d'
 *       }
 *     },
 *     plot: {
 *       lineColor: '#e5dbc4',
 *       background: '#f6f1e5'
 *     },
 *     series: {
 *       colors: ['#40abb4', '#e78a31', '#c1c452', '#795224', '#f5f5f5'],
 *       borderColor: '#8e6535'
 *     },
 *     legend: {
 *       label: {
 *         color: '#6f491d'
 *       }
 *     }
 *   };
 * chart.registerTheme('newTheme', theme);
 */
ne.application.chart.registerTheme = function(themeName, theme) {
    themeFactory.register(themeName, theme);
};

/**
 * Register graph plugin.
 * @memberOf ne.application.chart
 * @param {string} libType type of graph library
 * @param {object} plugin plugin to control library
 * @example
 * var pluginRaphael = {
 *   bar: function() {} // Render class
 * };
 * ne.application.chart.registerPlugin('raphael', pluginRaphael);
 */
ne.application.chart.registerPlugin = function(libType, plugin) {
    pluginFactory.register(libType, plugin);
};