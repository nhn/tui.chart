/**
 * @fileoverview chart.js is entry point of Toast UI Chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('./const');
var chartFactory = require('./factories/chartFactory');
var pluginFactory = require('./factories/pluginFactory');
var themeFactory = require('./factories/themeFactory');
var mapFactory = require('./factories/mapFactory');

var _createChart;

require('./polyfill');
require('./code-snippet-util');
require('./registerCharts');
require('./registerThemes');

/**
 * Raw series datum.
 * @typedef {{name: ?string, data: Array.<number>, stack: ?string}} rawSeriesDatum
 */

/**
 * Raw series data.
 * @typedef {Array.<rawSeriesDatum>} rawSeriesData
 */

/**
 * Raw data.
 * @typedef {{
 *      categories: ?Array.<string>,
 *      series: (rawSeriesData|{line: ?rawSeriesData, column: ?rawSeriesData})
 * }} rawData
 */

/**
 * NHN Entertainment Toast UI Chart.
 * @namespace tui.chart
 */
tui.util.defineNamespace('tui.chart');

/**
 * Create chart.
 * @param {HTMLElement} container container
 * @param {rawData} rawData - raw data
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
 *     title: string,
 *     min: number
 *   },
 *   tooltip: {
 *     suffix: string,
 *     template: function
 *   },
 *   theme: string
 * }} options - chart options
 * @returns {object} chart instance.
 * @private
 * @ignore
 */
_createChart = function(container, rawData, options) {
    var themeName, theme, chart;

    rawData = JSON.parse(JSON.stringify(rawData));
    options = options ? tui.util.deepCopy(options) : {};
    themeName = options.theme || chartConst.DEFAULT_THEME_NAME;
    theme = themeFactory.get(themeName);

    chart = chartFactory.get(options.chartType, rawData, theme, options);
    container.appendChild(chart.render());
    chart.animateChart();

    return chart;
};

/**
 * Bar chart creator.
 * @memberOf tui.chart
 * @param {HTMLElement} container - chart container
 * @param {rawData} rawData - raw data
 *      @param {Array.<string>} rawData.categories - categories
 *      @param {Array.<Array>} rawData.series - series data
 * @param {object} options - chart options
 *      @param {object} options.chart - base options for chart
 *          @param {number} options.chart.width - chart width
 *          @param {number} options.chart.height - chart height
 *          @param {string} options.chart.title - chart title
 *          @param {string | function} options.chart.format - formatter for value
 *      @param {object} options.yAxis - options for y axis component
 *          @param {string} options.yAxis.title - title for y axis
 *          @param {string} options.yAxis.align - align option for center y axis
 *          @param {boolean} options.yAxis.rotateTitle - whether rotate title or not (default: true)
 *      @param {object} options.xAxis - options for x axis component
 *          @param {string} options.xAxis.title - title for x axis
 *          @param {number} options.xAxis.min - minimum value for x axis
 *          @param {number} options.xAxis.max - maximum value for x axis
 *      @param {object} options.series - options for series component
 *          @param {string} options.series.stackType - type of stack
 *          @param {boolean} options.series.showLabel - whether show label or not
 *          @param {number} options.series.barWidth - bar width
 *          @param {boolean} options.series.allowSelect - whether allow select or not
 *          @param {boolean} options.series.diverging - whether diverging or not
 *      @param {object} options.tooltip - options for tooltip component
 *          @param {string} options.tooltip.suffix - suffix for tooltip
 *          @param {function} [options.tooltip.template] - template for tooltip
 *          @param {string} options.tooltip.align - align option for tooltip
 *          @param {object} options.tooltip.position - relative position
 *              @param {number} options.tooltip.position.left - position left
 *              @param {number} options.tooltip.position.top - position top
 *          @param {boolean} options.tooltip.grouped - whether group tooltip or not
 *      @param {object} options.legend - options for legend component
 *          @param {string} options.legend.align - align option for legend (top|bottom|left)
 *          @param {boolean} options.legend.showCheckbox - whether show checkbox or not (default: true)
 *          @param {boolean} options.legend.visible - whether visible or not (default: true)
 *      @param {object} options.plot - options for plot component
 *          @param {boolean} options.plot.showLine - whether show line or not (default: true)
 *      @param {string} options.theme - theme name
 *      @param {string} options.libType - type of graph library
 * @returns {object} bar chart
 * @api
 * @example
 * var container = document.getElementById('container-id'),
 *     rawData = {
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
 * tui.chart.barChart(container, rawData, options);
 */
tui.chart.barChart = function(container, rawData, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_BAR;
    return _createChart(container, rawData, options);
};

/**
 * Column chart creator.
 * @memberOf tui.chart
 * @param {HTMLElement} container - chart container
 * @param {rawData} rawData - raw data
 *      @param {Array.<string>} rawData.categories - categories
 *      @param {Array.<Array>} rawData.series - series data
 * @param {object} options - chart options
 *      @param {object} options.chart - base options for chart
 *          @param {number} options.chart.width - chart width
 *          @param {number} options.chart.height - chart height
 *          @param {string} options.chart.title - chart title
 *          @param {string | function} options.chart.format - formatter for value
 *      @param {object} options.yAxis - options for y axis component
 *          @param {string} options.yAxis.title - title for y axis
 *          @param {number} options.yAxis.min - minimum value for y axis
 *          @param {number} options.yAxis.max - maximum value for y axis
 *          @param {boolean} options.yAxis.rotateTitle - whether rotate title or not (default: true)
 *      @param {object} options.xAxis - options for x axis component
 *          @param {string} options.xAxis.title - title for x axis
 *          @param {number} options.xAxis.labelInterval - label interval for x axis
 *          @param {boolean} options.xAxis.rotateLabel - whether rotate label or not (default: true)
 *      @param {object} options.series - options for series component
 *          @param {string} options.series.stackType - type of stack
 *          @param {boolean} options.series.showLabel - whether show label or not
 *          @param {number} options.series.barWidth - bar width
 *          @param {boolean} options.series.allowSelect - whether allow select or not
 *          @param {boolean} options.series.diverging - whether diverging or not
 *      @param {object} options.tooltip - options for tooltip component
 *          @param {string} options.tooltip.suffix - suffix for tooltip
 *          @param {function} [options.tooltip.template] - template for tooltip
 *          @param {string} options.tooltip.align - align option for tooltip
 *          @param {object} options.tooltip.position - relative position
 *              @param {number} options.tooltip.position.left - position left
 *              @param {number} options.tooltip.position.top - position top
 *          @param {boolean} options.tooltip.grouped - whether group tooltip or not
 *      @param {object} options.legend - options for legend component
 *          @param {string} options.legend.align - align option for legend (top|bottom|left)
 *          @param {boolean} options.legend.showCheckbox - whether show checkbox or not (default: true)
 *          @param {boolean} options.legend.visible - whether visible or not (default: true)
 *      @param {object} options.plot - options for plot component
 *          @param {boolean} options.plot.showLine - whether show line or not (default: true)
 *      @param {string} options.theme - theme name
 *      @param {string} options.libType - type of graph library
 * @returns {object} column chart
 * @api
 * @example
 * var container = document.getElementById('container-id'),
 *     rawData = {
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
 * tui.chart.columnChart(container, rawData, options);
 */
tui.chart.columnChart = function(container, rawData, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_COLUMN;
    return _createChart(container, rawData, options);
};

/**
 * Line chart creator.
 * @memberOf tui.chart
 * @param {HTMLElement} container - chart container
 * @param {rawData} rawData - raw data
 *      @param {Array.<string>} rawData.categories - categories
 *      @param {Array.<Array>} rawData.series - series data
 * @param {object} options - chart options
 *      @param {object} options.chart - base options for chart
 *          @param {number} options.chart.width - chart width
 *          @param {number} options.chart.height - chart height
 *          @param {string} options.chart.title - chart title
 *          @param {string | function} options.chart.format - formatter for value
 *      @param {object} options.yAxis - options for y axis component
 *          @param {string} options.yAxis.title - title for y axis
 *          @param {number} options.yAxis.min - minimum value for y axis
 *          @param {number} options.yAxis.max - maximum value for y axis
 *          @param {boolean} options.yAxis.rotateTitle - whether rotate title or not (default: true)
 *      @param {object} options.xAxis - options for x axis component
 *          @param {string} options.xAxis.title - title for x axis
 *          @param {number} options.xAxis.labelInterval - label interval for x axis
 *          @param {string} options.xAxis.tickInterval - tick interval for x axis
 *          @param {boolean} options.xAxis.rotateLabel - whether rotate label or not (default: true)
 *      @param {object} options.series - options for series component
 *          @param {boolean} options.series.showDot - whether show dot or not
 *          @param {boolean} options.series.showLabel - whether show label or not
 *          @param {boolean} options.series.allowSelect - whether allow select or not
 *          @param {boolean} options.series.spline - whether spline or not
 *          @param {boolean} options.series.zoomable - whether zoomable or not
 *          @param {boolean} options.series.shifting - whether shifting or not
 *      @param {object} options.tooltip - options for tooltip component
 *          @param {string} options.tooltip.suffix - suffix for tooltip
 *          @param {function} [options.tooltip.template] - template for tooltip
 *          @param {string} options.tooltip.align - align option for tooltip
 *          @param {object} options.tooltip.position - relative position
 *              @param {number} options.tooltip.position.left - position left
 *              @param {number} options.tooltip.position.top - position top
 *          @param {boolean} options.tooltip.grouped - whether group tooltip or not
 *      @param {object} options.legend - options for legend component
 *          @param {string} options.legend.align - align option for legend (top|bottom|left)
 *          @param {boolean} options.legend.showCheckbox - whether show checkbox or not (default: true)
 *          @param {boolean} options.legend.visible - whether visible or not (default: true)
 *      @param {object} options.plot - options for plot component
 *          @param {boolean} options.plot.showLine - whether show line or not (default: true)
 *      @param {string} options.theme - theme name
 *      @param {string} options.libType - type of graph library
 * @returns {object} bar chart
 * @api
 * @example
 * var container = document.getElementById('container-id'),
 *     rawData = {
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
 *         showDot: true
 *       }
 *     };
 * tui.chart.lineChart(container, rawData, options);
 */
tui.chart.lineChart = function(container, rawData, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_LINE;
    return _createChart(container, rawData, options);
};

/**
 * Area chart creator.
 * @memberOf tui.chart
 * @param {HTMLElement} container - chart container
 * @param {rawData} rawData - raw data
 *      @param {Array.<string>} rawData.categories - categories
 *      @param {Array.<Array>} rawData.series - series data
 * @param {object} options - chart options
 *      @param {object} options.chart - base options for chart
 *          @param {number} options.chart.width - chart width
 *          @param {number} options.chart.height - chart height
 *          @param {string} options.chart.title - chart title
 *          @param {string | function} options.chart.format - formatter for value
 *      @param {object} options.yAxis - options for y axis component
 *          @param {string} options.yAxis.title - title for y axis
 *          @param {number} options.yAxis.min - minimum value for y axis
 *          @param {number} options.yAxis.max - maximum value for y axis
 *          @param {boolean} options.yAxis.rotateTitle - whether rotate title or not (default: true)
 *      @param {object} options.xAxis - options for x axis component
 *          @param {string} options.xAxis.title - title for x axis
 *          @param {number} options.xAxis.labelInterval - label interval for x axis
 *          @param {boolean} options.xAxis.rotateLabel - whether rotate label or not (default: true)
 *          @param {string} options.xAxis.tickInterval - tick interval for x axis
 *      @param {object} options.series - options for series component
 *          @param {boolean} options.series.showDot - whether show dot or not
 *          @param {boolean} options.series.showLabel - whether show label or not
 *          @param {boolean} options.series.allowSelect - whether allow select or not
 *          @param {boolean} options.series.spline - whether spline or not
 *          @param {boolean} options.series.zoomable - whether zoomable or not
 *          @param {boolean} options.series.shifting - whether shifting or not
 *      @param {object} options.tooltip - options for tooltip component
 *          @param {string} options.tooltip.suffix - suffix for tooltip
 *          @param {function} [options.tooltip.template] - template for tooltip
 *          @param {string} options.tooltip.align - align option for tooltip
 *          @param {object} options.tooltip.position - relative position
 *              @param {number} options.tooltip.position.left - position left
 *              @param {number} options.tooltip.position.top - position top
 *          @param {boolean} options.tooltip.grouped - whether group tooltip or not
 *      @param {object} options.legend - options for legend component
 *          @param {string} options.legend.align - align option for legend (top|bottom|left)
 *          @param {boolean} options.legend.showCheckbox - whether show checkbox or not (default: true)
 *          @param {boolean} options.legend.visible - whether visible or not (default: true)
 *      @param {object} options.plot - options for plot component
 *          @param {boolean} options.plot.showLine - whether show line or not (default: true)
 *      @param {string} options.theme - theme name
 *      @param {string} options.libType - type of graph library
 * @returns {object} bar chart
 * @api
 * @example
 * var container = document.getElementById('container-id'),
 *     rawData = {
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
 * tui.chart.areaChart(container, rawData, options);
 */
tui.chart.areaChart = function(container, rawData, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_AREA;
    return _createChart(container, rawData, options);
};

/**
 * Bubble chart creator.
 * @memberOf tui.chart
 * @param {HTMLElement} container - chart container
 * @param {rawData} rawData - raw data
 *      @param {Array.<string>} rawData.categories - categories
 *      @param {Array.<Array>} rawData.series - series data
 * @param {object} options - chart options
 *      @param {object} options.chart - base options for chart
 *          @param {number} options.chart.width - chart width
 *          @param {number} options.chart.height - chart height
 *          @param {string} options.chart.title - chart title
 *          @param {string | function} options.chart.format - formatter for value
 *      @param {object} options.yAxis - options for y axis component
 *          @param {string} options.yAxis.title - title for y axis
 *          @param {number} options.yAxis.min - minimum value for y axis
 *          @param {number} options.yAxis.max - maximum value for y axis
 *          @param {boolean} options.yAxis.rotateTitle - whether rotate title or not (default: true)
 *      @param {object} options.xAxis - options for x axis component
 *          @param {string} options.xAxis.title - title for x axis
 *          @param {number} options.xAxis.labelInterval - label interval for x axis
 *          @param {boolean} options.xAxis.rotateLabel - whether rotate label or not (default: true)
 *          @param {number} options.xAxis.min - minimum value for y axis
 *          @param {number} options.xAxis.max - maximum value for y axis
 *      @param {object} options.series - options for series component
 *          @param {boolean} options.series.showLabel - whether show label or not
 *          @param {boolean} options.series.allowSelect - whether allow select or not
 *      @param {object} options.tooltip - options for tooltip component
 *          @param {string} options.tooltip.suffix - suffix for tooltip
 *          @param {function} [options.tooltip.template] - template for tooltip
 *          @param {string} options.tooltip.align - align option for tooltip
 *          @param {object} options.tooltip.position - relative position
 *              @param {number} options.tooltip.position.left - position left
 *              @param {number} options.tooltip.position.top - position top
 *      @param {object} options.legend - options for legend component
 *          @param {string} options.legend.align - align option for legend (top|bottom|left)
 *          @param {boolean} options.legend.showCheckbox - whether show checkbox or not (default: true)
 *          @param {boolean} options.legend.visible - whether visible or not (default: true)
 *      @param {object} options.circleLegend - options for circleLegend
 *          @param {boolean} options.circleLegend.visible - whether visible or not (default: true)
 *      @param {object} options.plot - options for plot component
 *          @param {boolean} options.plot.showLine - whether show line or not (default: true)
 *      @param {string} options.theme - theme name
 *      @param {string} options.libType - type of graph library
 * @returns {object} bubble chart
 * @api
 * @example
 * var container = document.getElementById('container-id'),
 *     rawData = {
 *       series: [
 *         {
 *           name: 'Legend1',
 *           data: [{
 *              x: 10,
 *              y: 20,
 *              r: 15,
 *              label: 'Lable1'
 *           }, {
 *              x: 20,
 *              y: 40,
 *              r: 10,
 *              label: 'Lable2'
 *           }]
 *         },
 *         {
 *           name: 'Legend2',
 *           data: [{
 *              x: 40,
 *              y: 10,
 *              r: 5,
 *              label: 'Lable3'
 *           }, {
 *              x: 30,
 *              y: 40,
 *              r: 8,
 *              label: 'Lable4'
 *           }]
 *         }
 *       ]
 *     },
 *     options = {
 *       chart: {
 *         title: 'Bubble Chart'
 *       },
 *       yAxis: {
 *         title: 'Y Axis'
 *       },
 *       xAxis: {
 *         title: 'X Axis'
 *       }
 *     };
 * tui.chart.bubbleChart(container, rawData, options);
 */
tui.chart.bubbleChart = function(container, rawData, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_BUBBLE;
    return _createChart(container, rawData, options);
};

/**
 * Scatter chart creator.
 * @memberOf tui.chart
 * @param {HTMLElement} container - chart container
 * @param {rawData} rawData - raw data
 *      @param {Array.<string>} rawData.categories - categories
 *      @param {Array.<Array>} rawData.series - series data
 * @param {object} options - chart options
 *      @param {object} options.chart - base options for chart
 *          @param {number} options.chart.width - chart width
 *          @param {number} options.chart.height - chart height
 *          @param {string} options.chart.title - chart title
 *          @param {string | function} options.chart.format - formatter for value
 *      @param {object} options.yAxis - options for y axis component
 *          @param {string} options.yAxis.title - title for y axis
 *          @param {number} options.yAxis.min - minimum value for y axis
 *          @param {number} options.yAxis.max - maximum value for y axis
 *          @param {boolean} options.yAxis.rotateTitle - whether rotate title or not (default: true)
 *      @param {object} options.xAxis - options for x axis component
 *          @param {string} options.xAxis.title - title for x axis
 *          @param {number} options.xAxis.min - minimum value for y axis
 *          @param {number} options.xAxis.max - maximum value for y axis
 *      @param {object} options.series - options for series component
 *          @param {boolean} options.series.showLabel - whether show label or not
 *          @param {boolean} options.series.allowSelect - whether allow select or not
 *      @param {object} options.tooltip - options for tooltip component
 *          @param {string} options.tooltip.suffix - suffix for tooltip
 *          @param {function} [options.tooltip.template] - template for tooltip
 *          @param {string} options.tooltip.align - align option for tooltip
 *          @param {object} options.tooltip.position - relative position
 *              @param {number} options.tooltip.position.left - position left
 *              @param {number} options.tooltip.position.top - position top
 *      @param {object} options.legend - options for legend component
 *          @param {string} options.legend.align - align option for legend (top|bottom|left)
 *          @param {boolean} options.legend.showCheckbox - whether show checkbox or not (default: true)
 *          @param {boolean} options.legend.visible - whether visible or not (default: true)
 *      @param {object} options.plot - options for plot component
 *          @param {boolean} options.plot.showLine - whether show line or not (default: true)
 *      @param {string} options.theme - theme name
 *      @param {string} options.libType - type of graph library
 * @returns {object} scatter chart
 * @api
 * @example
 * var container = document.getElementById('container-id'),
 *     rawData = {
 *       series: [
 *         {
 *           name: 'Legend1',
 *           data: [{
 *              x: 10,
 *              y: 20
 *           }, {
 *              x: 20,
 *              y: 40
 *           }]
 *         },
 *         {
 *           name: 'Legend2',
 *           data: [{
 *              x: 40,
 *              y: 10
 *           }, {
 *              x: 30,
 *              y: 40
 *           }]
 *         }
 *       ]
 *     },
 *     options = {
 *       chart: {
 *         title: 'Scatter Chart'
 *       },
 *       yAxis: {
 *         title: 'Y Axis'
 *       },
 *       xAxis: {
 *         title: 'X Axis'
 *       }
 *     };
 * tui.chart.scatterChart(container, rawData, options);
 */
tui.chart.scatterChart = function(container, rawData, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_SCATTER;
    return _createChart(container, rawData, options);
};

/**
 * Heatmap chart creator.
 * @memberOf tui.chart
 * @param {HTMLElement} container - chart container
 * @param {rawData} rawData - raw data
 *      @param {{x: Array.<string | number>, y: Array.<string | number>}} rawData.categories - categories
 *      @param {Array.<Array.<number>>} rawData.series - series data
 * @param {object} options - chart options
 *      @param {object} options.chart - base options for chart
 *          @param {number} options.chart.width - chart width
 *          @param {number} options.chart.height - chart height
 *          @param {string} options.chart.title - chart title
 *          @param {string | function} options.chart.format - formatter for value
 *      @param {object} options.yAxis - options for y axis component
 *          @param {string} options.yAxis.title - title for y axis
 *          @param {boolean} options.yAxis.rotateTitle - whether rotate title or not (default: true)
 *      @param {object} options.xAxis - options for x axis component
 *          @param {string} options.xAxis.title - title for x axis
 *      @param {object} options.series - options for series component
 *          @param {boolean} options.series.showLabel - whether show label or not
 *      @param {object} options.tooltip - options for tooltip component
 *          @param {string} options.tooltip.suffix - suffix for tooltip
 *          @param {function} [options.tooltip.template] - template for tooltip
 *          @param {string} options.tooltip.align - align option for tooltip
 *          @param {object} options.tooltip.position - relative position
 *              @param {number} options.tooltip.position.left - position left
 *              @param {number} options.tooltip.position.top - position top
 *      @param {object} options.legend - options for legend component
 *          @param {string} options.legend.align - align option for legend (top|bottom|left)
 *          @param {boolean} options.legend.visible - whether visible or not (default: true)
 *      @param {string} options.theme - theme name
 *      @param {string} options.libType - type of graph library
 * @returns {object} scatter chart
 * @api
 * @example
 * var container = document.getElementById('container-id'),
 *     rawData = {
 *       categories: {
 *           x: [10, 20, 30, 40, 50],
 *           y: [1, 2, 3, 4, 5, 6]
 *       },
 *       series: [
 *           [10, 20, 30, 40, 50],
 *           [1, 4, 6, 7, 8],
 *           [20, 4, 5, 70, 8],
 *           [100, 40, 30, 80, 30],
 *           [20, 10, 60, 90, 20],
 *           [50, 40, 30, 20, 10]
 *       ]
 *     },
 *     options = {
 *       chart: {
 *         title: 'Heatmap Chart'
 *       },
 *       yAxis: {
 *         title: 'Y Axis'
 *       },
 *       xAxis: {
 *         title: 'X Axis'
 *       }
 *     };
 * tui.chart.heatmapChart(container, rawData, options);
 */
tui.chart.heatmapChart = function(container, rawData, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_HEATMAP;
    return _createChart(container, rawData, options);
};

/**
 * Treemap chart creator.
 * @memberOf tui.chart
 * @param {HTMLElement} container - chart container
 * @param {rawData} rawData - raw data
 *      @param {Array.<Array.<object>>} rawData.series - series data
 * @param {object} options - chart options
 *      @param {object} options.chart - base options for chart
 *          @param {number} options.chart.width - chart width
 *          @param {number} options.chart.height - chart height
 *          @param {string} options.chart.title - chart title
 *          @param {string | function} options.chart.format - formatter for value
 *      @param {object} options.series - options for series component
 *          @param {boolean} options.series.showLabel - whether show label or not
 *      @param {object} options.tooltip - options for tooltip component
 *          @param {string} options.tooltip.suffix - suffix for tooltip
 *          @param {function} [options.tooltip.template] - template for tooltip
 *          @param {object} options.tooltip.position - relative position
 *              @param {number} options.tooltip.position.left - position left
 *              @param {number} options.tooltip.position.top - position top
 *      @param {object} options.legend - options for legend component
 *          @param {string} options.legend.align - align option for legend (top|bottom|left)
 *          @param {boolean} options.legend.visible - whether visible or not (default: true)
 *      @param {string} options.theme - theme name
 *      @param {string} options.libType - type of graph library
 * @returns {object} scatter chart
 * @api
 * @example
 * var container = document.getElementById('container-id'),
 *     rawData = {
 *       series: [
 *          {
 *              label: 'label1',
 *              value: 6
 *          },
 *          {
 *              label: 'label2',
 *              value: 6
 *          },
 *          {
 *              label: 'label3',
 *              value: 4
 *          },
 *          {
 *              label: 'label4',
 *              value: 3
 *          },
 *          {
 *              label: 'label5',
 *              value: 2
 *          },
 *          {
 *              label: 'label6',
 *              value: 2
 *          },
 *          {
 *              label: 'label7',
 *              value: 1
 *          }
 *     ],
 *     options = {
 *       chart: {
 *         title: 'Treemap Chart'
 *       }
 *     };
 * tui.chart.treemapChart(container, rawData, options);
 */
tui.chart.treemapChart = function(container, rawData, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_TREEMAP;
    return _createChart(container, rawData, options);
};

/**
 * Combo chart creator.
 * @memberOf tui.chart
 * @param {HTMLElement} container - chart container
 * @param {rawData} rawData - raw data
 *      @param {Array.<string>} rawData.categories - categories
 *      @param {Array.<Array>} rawData.series - series data
 * @param {object} options - chart options
 *      @param {object} options.chart - base options for chart
 *          @param {number} options.chart.width - chart width
 *          @param {number} options.chart.height - chart height
 *          @param {string} options.chart.title - chart title
 *          @param {string | function} options.chart.format - formatter for value
 *      @param {object|Array} options.yAxis - options for y axis component
 *          @param {string} options.yAxis.title - title for y axis
 *          @param {number} options.yAxis.min - minimum value for y axis
 *          @param {number} options.yAxis.max - maximum value for y axis
 *          @param {boolean} options.yAxis.rotateTitle - whether rotate title or not (default: true)
 *      @param {object} options.xAxis - options for x axis component
 *          @param {string} options.xAxis.title - title for x axis
 *          @param {number} options.xAxis.labelInterval - label interval for x axis
 *          @param {boolean} options.xAxis.rotateLabel - whether rotate label or not (default: true)
 *      @param {object} options.series - options for series component
 *          @param {?object} options.series.column - options for column series component
 *              @param {string} options.series.column.stackType - type of stack
 *              @param {boolean} options.series.column.showLabel - whether show label or not
 *              @param {number} options.series.column.barWidth - bar width
 *              @param {boolean} options.series.column.allowSelect - whether allow select or not
 *          @param {?object} options.series.line - options for line series component
 *              @param {boolean} options.series.line.showDot - whether show dot or not
 *              @param {boolean} options.series.line.showLabel - whether show label or not
 *              @param {boolean} options.series.line.allowSelect - whether allow select or not
 *              @param {boolean} options.series.line.spline - whether spline or not
 *          @param {?object} options.series.area - options for line series component
 *              @param {boolean} options.series.area.showDot - whether show dot or not
 *              @param {boolean} options.series.area.showLabel - whether show label or not
 *              @param {boolean} options.series.area.allowSelect - whether allow select or not
 *              @param {boolean} options.series.area.spline - whether spline or not
 *          @param {?object} options.series.pie - options for pie series component
 *              @param {boolean} options.series.pie.showLabel - whether show label or not
 *              @param {number} options.series.pie.radiusRatio - ratio of radius for pie graph
 *              @param {boolean} options.series.pie.allowSelect - whether allow select or not
 *              @param {boolean} options.series.pie.startAngle - start angle
 *              @param {boolean} options.series.pie.endAngle - end angle
 *          @param {boolean} options.series.showDot - whether show dot or not
 *          @param {boolean} options.series.showLabel - whether show label or not
 *          @param {boolean} options.series.allowSelect - whether allow select or not
 *          @param {boolean} options.series.spline - whether spline or not
 *          @param {boolean} options.series.zoomable - whether zoomable or not
 *          @param {boolean} options.series.shifting - whether shifting or not
 *      @param {object} options.tooltip - options for tooltip component
 *          @param {object} options.tooltip.column - options for column tooltip
 *              @param {string} options.tooltip.column.suffix - suffix for tooltip
 *              @param {function} [options.tooltip.column.template] template of tooltip
 *              @param {string} options.tooltip.column.align - align option for tooltip
 *              @param {object} options.tooltip.column.position - relative position
 *                  @param {number} options.tooltip.column.position.left - position left
 *                  @param {number} options.tooltip.column.position.top - position top
 *          @param {boolean} options.tooltip.grouped - whether group tooltip or not
 *      @param {object} options.legend - options for legend component
 *          @param {string} options.legend.align - align option for legend (top|bottom|left)
 *          @param {boolean} options.legend.showCheckbox - whether show checkbox or not (default: true)
 *          @param {boolean} options.legend.visible - whether visible or not (default: true)
 *      @param {object} options.plot - options for plot component
 *          @param {boolean} options.plot.showLine - whether show line or not (default: true)
 *      @param {string} options.theme - theme name
 *      @param {string} options.libType - type of graph library
 * @returns {object} bar chart
 * @api
 * @example
 * var container = document.getElementById('container-id'),
 *     rawData = {
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
 *         showDot: true
 *       }
 *     };
 * tui.chart.comboChart(container, rawData, options);
 */
tui.chart.comboChart = function(container, rawData, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_COMBO;
    return _createChart(container, rawData, options);
};

/**
 * Pie chart creator.
 * @memberOf tui.chart
 * @param {HTMLElement} container - chart container
 * @param {rawData} rawData - raw data
 *      @param {Array.<Array>} rawData.series - series data
 * @param {object} options - chart options
 *      @param {object} options.chart - base options for chart
 *          @param {number} options.chart.width - chart width
 *          @param {number} options.chart.height - chart height
 *          @param {string} options.chart.title - chart title
 *          @param {string | function} options.chart.format - formatter for value
 *      @param {object} options.series - options for series component
 *          @param {boolean} options.series.showLabel - whether show label or not
 *          @param {number} options.series.radiusRatio - ratio of radius for pie graph
 *          @param {boolean} options.series.allowSelect - whether allow select or not
 *          @param {boolean} options.series.startAngle - start angle
 *          @param {boolean} options.series.endAngle - end angle
 *      @param {object} options.tooltip - options for tooltip component
 *          @param {string} options.tooltip.suffix - suffix for tooltip
 *          @param {function} [options.tooltip.template] - template for tooltip
 *          @param {string} options.tooltip.align - align option for tooltip
 *          @param {object} options.tooltip.position - relative position
 *              @param {number} options.tooltip.position.left - position left
 *              @param {number} options.tooltip.position.top - position top
 *      @param {object} options.legend - options for legend component
 *          @param {string} options.legend.align - align option for legend (top|bottom|left|center|outer)
 *          @param {boolean} options.legend.showCheckbox - whether show checkbox or not (default: true)
 *          @param {boolean} options.legend.visible - whether visible or not (default: true)
 *      @param {string} options.theme - theme name
 *      @param {string} options.libType - type of graph library
 * @returns {object} bar chart
 * @api
 * @example
 * var container = document.getElementById('container-id'),
 *     rawData = {
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
 * tui.chart.pieChart(container, rawData, options);
 */
tui.chart.pieChart = function(container, rawData, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_PIE;
    return _createChart(container, rawData, options);
};

/**
 * Map chart creator.
 * @memberOf tui.chart
 * @param {HTMLElement} container - chart container
 * @param {rawData} rawData chart data
 *      @param {Array.<Array>} rawData.series - series data
 * @param {object} options - chart options
 *      @param {object} options.chart - base options for chart
 *          @param {number} options.chart.width - chart width
 *          @param {number} options.chart.height - chart height
 *          @param {string} options.chart.title - chart title
 *          @param {string | function} options.chart.format - formatter for value
 *      @param {object} options.series - options for series component
 *          @param {boolean} options.series.showLabel - whether show label or not
 *      @param {object} options.tooltip - options for tooltip component
 *          @param {string} options.tooltip.suffix - suffix for tooltip
 *          @param {function} [options.tooltip.template] - template for tooltip
 *          @param {string} options.tooltip.align - align option for tooltip
 *          @param {object} options.tooltip.position - relative position
 *              @param {number} options.tooltip.position.left - position left
 *              @param {number} options.tooltip.position.top - position top
 *      @param {object} options.legend - options for legend component
 *          @param {string} options.legend.align - align option for legend (top|bottom|left|center|outer)
 *      @param {string} options.theme - theme name
 *      @param {string} options.map map type
 *      @param {string} options.libType - type of graph library
 * @returns {object} bar chart
 * @api
 * @example
 * var container = document.getElementById('container-id'),
 *     rawData = {
 *       series: [
 *         {
 *           code: 'KR',
 *           data: 100,
 *           labelCoordinate: {
 *             x: 0.6,
 *             y: 0.7
 *           }
 *         },
 *         {
 *           code: 'JP',
 *           data: 50
 *         }
 *       ]
 *     },
 *     options = {
 *       chart: {
 *         title: 'Map Chart'
 *       },
 *       map: 'world'
 *     };
 * tui.chart.mapChart(container, rawData, options);
 */
tui.chart.mapChart = function(container, rawData, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_MAP;
    options.map = mapFactory.get(options.map);

    return _createChart(container, rawData, options);
};

/**
 * Register theme.
 * @memberOf tui.chart
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
 *          @param {string} theme.yAxis.tickColor color of vertical axis tick
 *      @param {object} theme.xAxis theme of horizontal axis
 *          @param {object} theme.xAxis.title theme of horizontal axis title
 *              @param {number} theme.xAxis.title.fontSize font size of horizontal axis title
 *              @param {string} theme.xAxis.title.fontFamily font family of horizontal axis title
 *              @param {string} theme.xAxis.title.color font color of horizontal axis title
 *          @param {object} theme.xAxis.label theme of horizontal axis label
 *              @param {number} theme.xAxis.label.fontSize font size of horizontal axis label
 *              @param {string} theme.xAxis.label.fontFamily font family of horizontal axis label
 *              @param {string} theme.xAxis.label.color font color of horizontal axis label
 *          @param {string} theme.xAxis.tickColor color of horizontal axis tick
 *      @param {object} theme.plot plot theme
 *          @param {string} theme.plot.lineColor plot line color
 *          @param {string} theme.plot.background plot background
 *      @param {object} theme.series series theme
 *          @param {Array.<string>} theme.series.colors series colors
 *          @param {string} theme.series.borderColor series border color
 *          @param {string} theme.series.selectionColor series selection color
 *          @param {string} theme.series.startColor start color for map chart
 *          @param {string} theme.series.endColor end color for map chart
 *          @param {string} theme.series.overColor end color for map chart
 *      @param {object} theme.legend legend theme
 *          @param {object} theme.legend.label theme of legend label
 *              @param {number} theme.legend.label.fontSize font size of legend label
 *              @param {string} theme.legend.label.fontFamily font family of legend label
 *              @param {string} theme.legend.label.color font color of legend label
 * @api
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
 *       borderColor: '#8e6535',
 *       selectionColor: '#cccccc',
 *       startColor: '#efefef',
 *       endColor: 'blue',
 *       overColor: 'yellow'
 *     },
 *     legend: {
 *       label: {
 *         color: '#6f491d'
 *       }
 *     }
 *   };
 * tui.chart.registerTheme('newTheme', theme);
 */
tui.chart.registerTheme = function(themeName, theme) {
    themeFactory.register(themeName, theme);
};

/**
 * Register map.
 * @param {string} mapName map name
 * @param {Array.<{code: string, name: string, path: string}>} data map data
 * @api
 * @example
 * var data = [
 *   {
 *     code: 'KR',
 *     name: 'South Korea',
 *     path: 'M835.13,346.53L837.55,350.71...',
 *     labelCoordinate: {
 *       x: 0.6,
 *       y: 0.7
 *     }
 *   },
 *   //...
 * ];
 * tui.chart.registerMap('newMap', data);
 */
tui.chart.registerMap = function(mapName, data) {
    mapFactory.register(mapName, data);
};

/**
 * Register graph plugin.
 * @memberOf tui.chart
 * @param {string} libType type of graph library
 * @param {object} plugin plugin to control library
 * @example
 * var pluginRaphael = {
 *   bar: function() {} // Render class
 * };
 * tui.chart.registerPlugin('raphael', pluginRaphael);
 */
tui.chart.registerPlugin = function(libType, plugin) {
    pluginFactory.register(libType, plugin);
};
