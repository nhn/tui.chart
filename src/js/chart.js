/**
 * @fileoverview chart.js is entry point of Application Chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */
'use strict';

var chartConst = require('./const.js'),
    state = require('./helpers/state.js'),
    chartFactory = require('./factories/chartFactory.js'),
    pluginFactory = require('./factories/pluginFactory.js'),
    themeFactory = require('./factories/themeFactory.js');

var DEFAULT_THEME_NAME = 'default';

var _createChart;

require('./code-snippet-util.js');
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
 *   yAxis: {
 *     title: string,
 *     min: number
 *   },
 *   xAxis: {
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
    var themeName, theme, chart;
    options = options || {};
    themeName = options.theme || DEFAULT_THEME_NAME;
    theme = themeFactory.get(themeName);

    chart = chartFactory.get(options.chartType, data, theme, options);
    container.appendChild(chart.render());
    chart.animateChart();

    return chart;
};

/**
 * Bar chart creator.
 * @memberOf ne.application.chart
 * @param {HTMLElement} container chart container
 * @param {object} data chart data
 *      @param {array.<string>} data.categories categories
 *      @param {array.<array>} data.series series data
 * @param {object} options chart options
 *      @param {object} options.chart chart options
 *          @param {number} options.chart.width chart width
 *          @param {number} options.chart.height chart height
 *          @param {string} options.chart.title chart title
 *          @param {string} options.chart.format value format
 *      @param {object} options.yAxis options of vertical axis
 *          @param {string} options.yAxis.title title of vertical axis
 *      @param {object} options.xAxis options of horizontal axis
 *          @param {string} options.xAxis.title title of horizontal axis
 *          @param {number} options.xAxis.min minimal value of horizontal axis
 *          @param {number} options.xAxis.max maximum value of horizontal axis
 *      @param {object} options.series options of series
 *          @param {string} options.series.stacked stacked type
 *          @param {boolean} options.series.showLabel whether show label or not
 *      @param {object} options.tooltip options of tooltip
 *          @param {string} options.tooltip.suffix suffix of tooltip
 *          @param {string} options.tooltip.template template of tooltip
 *          @param {string} options.tooltip.position tooltip position type
 *          @param {object} options.tooltip.addPosition add position
 *              @param {number} options.tooltip.addPosition.left add left position
 *              @param {number} options.tooltip.addPosition.top add top position
 *      @param {string} options.theme theme name
 *      @param {string} options.libType graph library type
 * @returns {object} bar chart
 * @example
 * var container = document.getElementById('container-id'),
 *     data = {
 *       categories: ['cate1', 'cate2', 'cate3'],
 *       series: [
 *         {
 *           name: 'Legend1',
 *           data: [20, 30, 50]
 *         },
 *         {
 *           name: 'Legend2',
 *           data: [40, 40, 60]
 *         },
 *         {
 *           name: 'Legend3',
 *           data: [60, 50, 10]
 *         },
 *         {
 *           name: 'Legend4',
 *           data: [80, 10, 70]
 *         }
 *       ]
 *     },
 *     options = {
 *       chart: {
 *         title: 'Bar Chart'
 *       },
 *       yAxis: {
 *         title: 'Y Axis'
 *       },
 *       xAxis: {
 *         title: 'X Axis'
 *       }
 *     };
 * ne.application.chart.barChart(container, data, options);
 */
ne.application.chart.barChart = function(container, data, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_BAR;
    return _createChart(container, data, options);
};

/**
 * Column chart creator.
 * @memberOf ne.application.chart
 * @param {HTMLElement} container chart container
 * @param {object} data chart data
 *      @param {array.<string>} data.categories categories
 *      @param {array.<array>} data.series series data
 * @param {object} options chart options
 *      @param {object} options.chart chart options
 *          @param {number} options.chart.width chart width
 *          @param {number} options.chart.height chart height
 *          @param {string} options.chart.title chart title
 *          @param {string} options.chart.format value format
 *      @param {object} options.yAxis options of vertical axis
 *          @param {string} options.yAxis.title title of vertical axis
 *          @param {number} options.yAxis.min minimal value of vertical axis
 *          @param {number} options.yAxis.max maximum value of vertical axis
 *      @param {object} options.xAxis options of horizontal axis
 *          @param {string} options.xAxis.title title of horizontal axis
 *      @param {object} options.series options of series
 *          @param {string} options.series.stacked stacked type
 *          @param {boolean} options.series.showLabel whether show label or not
 *      @param {object} options.tooltip options of tooltip
 *          @param {string} options.tooltip.suffix suffix of tooltip
 *          @param {string} options.tooltip.template template of tooltip
 *          @param {string} options.tooltip.position tooltip position type
 *          @param {object} options.tooltip.addPosition add position
 *              @param {number} options.tooltip.addPosition.left add left position
 *              @param {number} options.tooltip.addPosition.top add top position
 *      @param {string} options.theme theme name
 *      @param {string} options.libType graph library type
 * @returns {object} column chart
 * @example
 * var container = document.getElementById('container-id'),
 *     data = {
 *       categories: ['cate1', 'cate2', 'cate3'],
 *       series: [
 *         {
 *           name: 'Legend1',
 *           data: [20, 30, 50]
 *         },
 *         {
 *           name: 'Legend2',
 *           data: [40, 40, 60]
 *         },
 *         {
 *           name: 'Legend3',
 *           data: [60, 50, 10]
 *         },
 *         {
 *           name: 'Legend4',
 *           data: [80, 10, 70]
 *         }
 *       ]
 *     },
 *     options = {
 *       chart: {
 *         title: 'Column Chart'
 *       },
 *       yAxis: {
 *         title: 'Y Axis'
 *       },
 *       xAxis: {
 *         title: 'X Axis'
 *       }
 *     };
 * ne.application.chart.columnChart(container, data, options);
 */
ne.application.chart.columnChart = function(container, data, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_COLUMN;
    return _createChart(container, data, options);
};

/**
 * Line chart creator.
 * @memberOf ne.application.chart
 * @param {HTMLElement} container chart container
 * @param {object} data chart data
 *      @param {array.<string>} data.categories categories
 *      @param {array.<array>} data.series series data
 * @param {object} options chart options
 *      @param {object} options.chart chart options
 *          @param {number} options.chart.width chart width
 *          @param {number} options.chart.height chart height
 *          @param {string} options.chart.title chart title
 *          @param {string} options.chart.format value format
 *      @param {object} options.yAxis options of vertical axis
 *          @param {string} options.yAxis.title title of vertical axis
 *          @param {number} options.yAxis.min minimal value of vertical axis
 *          @param {number} options.yAxis.max maximum value of vertical axis
 *      @param {object} options.xAxis options of horizontal axis
 *          @param {string} options.xAxis.title title of horizontal axis
 *      @param {object} options.series options of series
 *          @param {boolean} options.series.hasDot whether has dot or not
 *          @param {boolean} options.series.showLabel whether show label or not
 *      @param {object} options.tooltip options of tooltip
 *          @param {string} options.tooltip.suffix suffix of tooltip
 *          @param {string} options.tooltip.template template of tooltip
 *          @param {string} options.tooltip.position tooltip position type
 *          @param {object} options.tooltip.addPosition add position
 *              @param {number} options.tooltip.addPosition.left add left position
 *              @param {number} options.tooltip.addPosition.top add top position
 *      @param {string} options.theme theme name
 *      @param {string} options.libType graph library type
 * @returns {object} bar chart
 * @example
 * var container = document.getElementById('container-id'),
 *     data = {
 *       categories: ['cate1', 'cate2', 'cate3'],
 *       series: [
 *         {
 *           name: 'Legend1',
 *           data: [20, 30, 50]
 *         },
 *         {
 *           name: 'Legend2',
 *           data: [40, 40, 60]
 *         },
 *         {
 *           name: 'Legend3',
 *           data: [60, 50, 10]
 *         },
 *         {
 *           name: 'Legend4',
 *           data: [80, 10, 70]
 *         }
 *       ]
 *     },
 *     options = {
 *       chart: {
 *         title: 'Line Chart'
 *       },
 *       yAxis: {
 *         title: 'Y Axis'
 *       },
 *       xAxis: {
 *         title: 'X Axis'
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
 * Area chart creator.
 * @memberOf ne.application.chart
 * @param {HTMLElement} container chart container
 * @param {object} data chart data
 *      @param {array.<string>} data.categories categories
 *      @param {array.<array>} data.series series data
 * @param {object} options chart options
 *      @param {object} options.chart chart options
 *          @param {number} options.chart.width chart width
 *          @param {number} options.chart.height chart height
 *          @param {string} options.chart.title chart title
 *          @param {string} options.chart.format value format
 *      @param {object} options.yAxis options of vertical axis
 *          @param {string} options.yAxis.title title of vertical axis
 *          @param {number} options.yAxis.min minimal value of vertical axis
 *          @param {number} options.yAxis.max maximum value of vertical axis
 *      @param {object} options.xAxis options of horizontal axis
 *          @param {string} options.xAxis.title title of horizontal axis
 *      @param {object} options.series options of series
 *          @param {boolean} options.series.hasDot whether has dot or not
 *          @param {boolean} options.series.showLabel whether show label or not
 *      @param {object} options.tooltip options of tooltip
 *          @param {string} options.tooltip.suffix suffix of tooltip
 *          @param {string} options.tooltip.template template of tooltip
 *          @param {string} options.tooltip.position tooltip position type
 *          @param {object} options.tooltip.addPosition add position
 *              @param {number} options.tooltip.addPosition.left add left position
 *              @param {number} options.tooltip.addPosition.top add top position
 *      @param {string} options.theme theme name
 *      @param {string} options.libType graph library type
 * @returns {object} bar chart
 * @ignore
 * @example
 * var container = document.getElementById('container-id'),
 *     data = {
 *       categories: ['cate1', 'cate2', 'cate3'],
 *       series: [
 *         {
 *           name: 'Legend1',
 *           data: [20, 30, 50]
 *         },
 *         {
 *           name: 'Legend2',
 *           data: [40, 40, 60]
 *         },
 *         {
 *           name: 'Legend3',
 *           data: [60, 50, 10]
 *         },
 *         {
 *           name: 'Legend4',
 *           data: [80, 10, 70]
 *         }
 *       ]
 *     },
 *     options = {
 *       chart: {
 *         title: 'Area Chart'
 *       },
 *       yAxis: {
 *         title: 'Y Axis'
 *       },
 *       xAxis: {
 *         title: 'X Axis'
 *       }
 *     };
 * ne.application.chart.areaChart(container, data, options);
 */
ne.application.chart.areaChart = function(container, data, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_AREA;
    return _createChart(container, data, options);
};

/**
 * Combo chart creator.
 * @memberOf ne.application.chart
 * @param {HTMLElement} container chart container
 * @param {object} data chart data
 *      @param {array.<string>} data.categories categories
 *      @param {array.<array>} data.series series data
 * @param {object} options chart options
 *      @param {object} options.chart chart options
 *          @param {number} options.chart.width chart width
 *          @param {number} options.chart.height chart height
 *          @param {string} options.chart.title chart title
 *          @param {string} options.chart.format value format
 *      @param {object[]} options.yAxis options of vertical axis
 *          @param {string} options.yAxis[].title title of vertical axis
 *          @param {number} options.yAxis[].min minimal value of vertical axis
 *          @param {number} options.yAxis[].max maximum value of vertical axis
 *      @param {object} options.xAxis options of horizontal axis
 *          @param {string} options.xAxis.title title of horizontal axis
 *          @param {number} options.xAxis.min minimal value of horizontal axis
 *          @param {number} options.xAxis.max maximum value of horizontal axis
 *      @param {object} options.series options of series
 *          @param {object} options.series.column options of column series
 *              @param {string} options.series.column.stacked stacked type
 *              @param {boolean} options.series.column.showLabel whether show label or not
 *          @param {object} options.series.line options of line series
 *              @param {boolean} options.series.line.hasDot whether has dot or not
 *              @param {boolean} options.series.line.showLabel whether show label or not
 *      @param {object} options.tooltip options of tooltip
 *          @param {object} options.tooltip.column options of column tooltip
 *              @param {string} options.tooltip.column.suffix suffix of tooltip
 *              @param {string} options.tooltip.column.template template of tooltip
 *              @param {string} options.tooltip.column.position tooltip position type
 *              @param {object} options.tooltip.column.addPosition add position
 *                  @param {number} options.tooltip.column.addPosition.left add left position
 *                  @param {number} options.tooltip.column.addPosition.top add top position
 *      @param {string} options.theme theme name
 *      @param {string} options.libType graph library type
 * @returns {object} bar chart
 * @example
 * var container = document.getElementById('container-id'),
 *     data = {
 *       categories: ['cate1', 'cate2', 'cate3'],
 *       series: {
 *         column: [
 *           {
 *             name: 'Legend1',
 *             data: [20, 30, 50]]
 *           },
 *           {
 *             name: 'Legend2',
 *             data: [40, 40, 60]
 *           },
 *           {
 *             name: 'Legend3',
 *             data: [60, 50, 10]
 *           },
 *           {
 *             name: 'Legend4',
 *             data: [80, 10, 70]
 *           }
 *         },
 *         line: [
 *           {
 *             name: 'Legend5',
 *             data: [1, 2, 3]
 *           }
 *         ]
 *       }
 *     },
 *     options = {
 *       chart: {
 *         title: 'Combo Chart'
 *       },
 *       yAxis:[
 *         {
 *           title: 'Y Axis',
 *           chartType: 'line'
 *         },
 *         {
 *           title: 'Y Right Axis'
 *         }
 *       ],
 *       xAxis: {
 *         title: 'X Axis'
 *       },
 *       series: {
 *         hasDot: true
 *       }
 *     };
 * ne.application.chart.comboChart(container, data, options);
 */
ne.application.chart.comboChart = function(container, data, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_COMBO;
    return _createChart(container, data, options);
};

/**
 * Pie chart creator.
 * @memberOf ne.application.chart
 * @param {HTMLElement} container chart container
 * @param {object} data chart data
 *      @param {array.<array>} data.series series data
 * @param {object} options chart options
 *      @param {object} options.chart chart options
 *          @param {number} options.chart.width chart width
 *          @param {number} options.chart.height chart height
 *          @param {string} options.chart.title chart title
 *          @param {string} options.chart.format value format
 *      @param {object} options.series options of series
 *          @param {string} options.series.legendType legend type
 *          @param {boolean} options.series.showLabel whether show label or not
 *      @param {object} options.tooltip options of tooltip
 *          @param {string} options.tooltip.suffix suffix of tooltip
 *          @param {string} options.tooltip.template template of tooltip
 *          @param {string} options.tooltip.position tooltip position type
 *          @param {object} options.tooltip.addPosition add position
 *              @param {number} options.tooltip.addPosition.left add left position
 *              @param {number} options.tooltip.addPosition.top add top position
 *      @param {string} options.theme theme name
 *      @param {string} options.libType graph library type
 * @returns {object} bar chart
 * @example
 * var container = document.getElementById('container-id'),
 *     data = {
 *       series: [
 *         {
 *           name: 'Legend1',
 *           data: 20
 *         },
 *         {
 *           name: 'Legend2',
 *           data: 40
 *         },
 *         {
 *           name: 'Legend3',
 *           data: 60
 *         },
 *         {
 *           name: 'Legend4',
 *           data: 80
 *         }
 *       ]
 *     },
 *     options = {
 *       chart: {
 *         title: 'Pie Chart'
 *       }
 *     };
 * ne.application.chart.pieChart(container, data, options);
 */
ne.application.chart.pieChart = function(container, data, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_PIE;
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
 *      @param {object} theme.yAxis theme of vertical axis
 *          @param {object} theme.yAxis.title theme of vertical axis title
 *              @param {number} theme.yAxis.title.fontSize font size of vertical axis title
 *              @param {string} theme.yAxis.title.fontFamily font family of vertical axis title
 *              @param {string} theme.yAxis.title.color font color of vertical axis title
 *          @param {object} theme.yAxis.label theme of vertical axis label
 *              @param {number} theme.yAxis.label.fontSize font size of vertical axis label
 *              @param {string} theme.yAxis.label.fontFamily font family of vertical axis label
 *              @param {string} theme.yAxis.label.color font color of vertical axis label
 *          @param {string} theme.yAxis.tickcolor color of vertical axis tick
 *      @param {object} theme.xAxis theme of horizontal axis
 *          @param {object} theme.xAxis.title theme of horizontal axis title
 *              @param {number} theme.xAxis.title.fontSize font size of horizontal axis title
 *              @param {string} theme.xAxis.title.fontFamily font family of horizontal axis title
 *              @param {string} theme.xAxis.title.color font color of horizontal axis title
 *          @param {object} theme.xAxis.label theme of horizontal axis label
 *              @param {number} theme.xAxis.label.fontSize font size of horizontal axis label
 *              @param {string} theme.xAxis.label.fontFamily font family of horizontal axis label
 *              @param {string} theme.xAxis.label.color font color of horizontal axis label
 *          @param {string} theme.xAxis.tickcolor color of horizontal axis tick
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
 *   yAxis: {
 *     tickColor: '#ccbd9a',
 *       title: {
 *         color: '#333333'
 *       },
 *       label: {
 *         color: '#6f491d'
 *       }
 *     },
 *     xAxis: {
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
