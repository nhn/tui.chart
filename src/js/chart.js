/**
 * @fileoverview chart.js is entry point of Toast UI Chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('./const');
var chartFactory = require('./factories/chartFactory');
var pluginFactory = require('./factories/pluginFactory');
var themeManager = require('./themes/themeManager');
var mapManager = require('./factories/mapManager');
var objectUtil = require('./helpers/objectUtil');
var seriesDataImporter = require('./helpers/seriesDataImporter');
var drawingToolPicker = require('./helpers/drawingToolPicker');

require('./polyfill');
require('./charts/chartsRegistration');
require('./themes/defaultThemesRegistration');

/**
 * Raw series datum.
 * @typedef {{name: ?string, data: Array.<number>, stack: ?string}} rawSeriesDatum
 * @private
 */

/**
 * Raw series data.
 * @typedef {Array.<rawSeriesDatum>} rawSeriesData
 * @private
 */

/**
 * Raw data.
 * @typedef {{
 *      categories: ?Array.<string>,
 *      series: (rawSeriesData|{line: ?rawSeriesData, column: ?rawSeriesData})
 * }} rawData
 * @private
 */

/**
 * Create chart.
 * @param {HTMLElement} container container
 * @param {({
 *        series: (object|Array),
 *        categories: Array
 *   }|{
 *        table: ({
 *          elementId: string
 *        }|{
 *          element: HTMLElement
 *        })
 *   })} rawData - raw data object or data container table element or table's id
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
 * @param {string} chartType - chart type
 * @returns {object} chart instance.
 * @private
 * @ignore
 */
function _createChart(container, rawData, options, chartType) {
    var theme, chart, temp;

    if (!rawData) {
        rawData = {};
    }

    if (rawData.table) {
        rawData = seriesDataImporter.makeDataWithTable(rawData.table);
    }

    if (!rawData.series) {
        rawData.series = [];
    }

    rawData = objectUtil.deepCopy(rawData);

    if (chartType !== 'combo') {
        temp = rawData.series;
        rawData.series = {};
        rawData.series[chartType] = temp;
    }

    options = options ? objectUtil.deepCopy(options) : {};
    options.chartType = chartType;
    options.theme = options.theme || chartConst.DEFAULT_THEME_NAME;
    theme = themeManager.get(options.theme, chartType, rawData.series);

    chart = chartFactory.get(options.chartType, rawData, theme, options);

    chart.render(container);
    chart.animateChart();

    return chart;
}

/**
 * Bar chart creator.
 * @memberof module:chart
 * @memberof tui.chart
 * @param {HTMLElement} container - chart container
 * @param {rawData} rawData - raw data
 *      @param {Array.<string>} rawData.categories - categories
 *      @param {Array.<Array>} rawData.series - series data
 * @param {object} options - chart options
 *      @param {object} options.chart - base options for chart
 *          @param {number} options.chart.width - chart width
 *          @param {number} options.chart.height - chart height
 *          @param {string | object} options.chart.title - title text or title object
 *              @param {string} options.chart.title.text - title text
 *              @param {number} options.chart.title.offsetX - title offset x
 *              @param {number} options.chart.title.offsetY - title offset y
 *          @param {string | function} options.chart.format - formatter for value
 *      @param {object} options.yAxis - options for y axis component
 *          @param {string | object} options.yAxis.title - title text or title object
 *              @param {string} options.yAxis.title.text - title text
 *              @param {number} options.yAxis.title.offsetX - title offset x
 *              @param {number} options.yAxis.title.offsetY - title offset y
 *          @param {number} options.yAxis.labelMargin - label margin for y axis
 *          @param {string} options.yAxis.align - align option for center y axis
 *          @param {boolean} options.yAxis.rotateTitle - whether rotate title or not (default: true)
 *          @param {string} options.yAxis.type - type of axis
 *          @param {string} options.yAxis.dateFormat - date format
 *      @param {object} options.xAxis - options for x axis component
 *          @param {string | object} options.xAxis.title - title text or title object
 *              @param {string} options.xAxis.title.text - title text
 *              @param {number} options.xAxis.title.offsetX - title offset x
 *              @param {number} options.xAxis.title.offsetY - title offset y
 *          @param {number} options.xAxis.labelMargin - label margin for x axis
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
 *          @param {object} options.tooltip.offsetX - tooltip offset x
 *          @param {object} options.tooltip.offsetY - tooltip offset y
 *          @param {object} options.tooltip.position - (deprecated) relative position
 *              @param {number} options.tooltip.position.left - position left
 *              @param {number} options.tooltip.position.top - position top
 *          @param {boolean} options.tooltip.grouped - whether group tooltip or not
 *      @param {object} options.legend - options for legend component
 *          @param {string} options.legend.align - align option for legend (top|bottom|left)
 *          @param {boolean} options.legend.showCheckbox - whether show checkbox or not (default: true)
 *          @param {boolean} options.legend.visible - whether visible or not (default: true)
 *          @param {number} options.legend.maxWidth - legend name display max width
 *      @param {object} options.plot - options for plot component
 *          @param {boolean} options.plot.showLine - whether show line or not (default: true)
 *      @param {string} options.theme - theme name
 *      @param {string} options.libType - type of graph library
 * @returns {object} bar chart
 * @api
 * @example
 * var chart = tui.chart; // or require('tui-chart');
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
 * chart.barChart(container, rawData, options);
 */
function barChart(container, rawData, options) {
    return _createChart(container, rawData, options, chartConst.CHART_TYPE_BAR);
}

/**
 * Column chart creator.
 * @memberof module:chart
 * @memberof tui.chart
 * @param {HTMLElement} container - chart container
 * @param {rawData} rawData - raw data
 *      @param {Array.<string>} rawData.categories - categories
 *      @param {Array.<Array>} rawData.series - series data
 * @param {object} options - chart options
 *      @param {object} options.chart - base options for chart
 *          @param {number} options.chart.width - chart width
 *          @param {number} options.chart.height - chart height
 *          @param {string | object} options.chart.title - title text or title object
 *              @param {string} options.chart.title.text - title text
 *              @param {number} options.chart.title.offsetX - title offset x
 *              @param {number} options.chart.title.offsetY - title offset y
 *          @param {string | function} options.chart.format - formatter for value
 *      @param {object} options.yAxis - options for y axis component
 *          @param {string | object} options.yAxis.title - title text or title object
 *              @param {string} options.yAxis.title.text - title text
 *              @param {number} options.yAxis.title.offsetX - title offset x
 *              @param {number} options.yAxis.title.offsetY - title offset y
 *          @param {number} options.yAxis.labelMargin - label margin for y axis
 *          @param {number} options.yAxis.min - minimum value for y axis
 *          @param {number} options.yAxis.max - maximum value for y axis
 *          @param {boolean} options.yAxis.rotateTitle - whether rotate title or not (default: true)
 *      @param {object} options.xAxis - options for x axis component
 *          @param {string | object} options.xAxis.title - title text or title object
 *              @param {string} options.xAxis.title.text - title text
 *              @param {number} options.xAxis.title.offsetX - title offset x
 *              @param {number} options.xAxis.title.offsetY - title offset y
 *          @param {number} options.xAxis.labelMargin - label margin for x axis
 *          @param {number} options.xAxis.labelInterval - label interval for x axis
 *          @param {boolean} options.xAxis.rotateLabel - whether rotate label or not (default: true)
 *          @param {string} options.xAxis.type - type of axis
 *          @param {string} options.xAxis.dateFormat - date format
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
 *          @param {object} options.tooltip.offsetX - tooltip offset x
 *          @param {object} options.tooltip.offsetY - tooltip offset y
 *          @param {object} options.tooltip.position - (deprecated) relative position
 *              @param {number} options.tooltip.position.left - position left
 *              @param {number} options.tooltip.position.top - position top
 *          @param {boolean} options.tooltip.grouped - whether group tooltip or not
 *      @param {object} options.legend - options for legend component
 *          @param {string} options.legend.align - align option for legend (top|bottom|left)
 *          @param {boolean} options.legend.showCheckbox - whether show checkbox or not (default: true)
 *          @param {boolean} options.legend.visible - whether visible or not (default: true)
 *          @param {number} options.legend.maxWidth - legend name display max width
 *      @param {object} options.plot - options for plot component
 *          @param {boolean} options.plot.showLine - whether show line or not (default: true)
 *      @param {string} options.theme - theme name
 *      @param {string} options.libType - type of graph library
 *      @param {object} options.chartExportMenu - options for exporting
 *          @param {string} options.chartExportMenu.filename - export file name
 * @returns {object} column chart
 * @api
 * @example
 * var chart = tui.chart; // or require('tui-chart');
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
 * chart.columnChart(container, rawData, options);
 */
function columnChart(container, rawData, options) {
    return _createChart(container, rawData, options, chartConst.CHART_TYPE_COLUMN);
}

/**
 * Line chart creator.
 * @memberof module:chart
 * @memberof tui.chart
 * @param {HTMLElement} container - chart container
 * @param {rawData} rawData - raw data
 *      @param {?Array.<string>} rawData.categories - categories
 *      @param {Array.<Array>} rawData.series - series data
 * @param {object} options - chart options
 *      @param {object} options.chart - base options for chart
 *          @param {number} options.chart.width - chart width
 *          @param {number} options.chart.height - chart height
 *          @param {string | object} options.chart.title - title text or title object
 *              @param {string} options.chart.title.text - title text
 *              @param {number} options.chart.title.offsetX - title offset x
 *              @param {number} options.chart.title.offsetY - title offset y
 *          @param {string | function} options.chart.format - formatter for value
 *      @param {object} options.yAxis - options for y axis component
 *          @param {string | object} options.yAxis.title - title text or title object
 *              @param {string} options.yAxis.title.text - title text
 *              @param {number} options.yAxis.title.offsetX - title offset x
 *              @param {number} options.yAxis.title.offsetY - title offset y
 *          @param {number} options.yAxis.labelMargin - label margin for y axis
 *          @param {number} options.yAxis.min - minimum value for y axis
 *          @param {number} options.yAxis.max - maximum value for y axis
 *          @param {boolean} options.yAxis.rotateTitle - whether rotate title or not (default: true)
 *      @param {object} options.xAxis - options for x axis component
 *          @param {string | object} options.xAxis.title - title text or title object
 *              @param {string} options.xAxis.title.text - title text
 *              @param {number} options.xAxis.title.offsetX - title offset x
 *              @param {number} options.xAxis.title.offsetY - title offset y
 *          @param {number} options.xAxis.labelMargin - label margin for x axis
 *          @param {number} options.xAxis.labelInterval - label interval for x axis
 *          @param {string} options.xAxis.tickInterval - tick interval for x axis
 *          @param {boolean} options.xAxis.rotateLabel - whether rotate label or not (default: true)
 *          @param {string} options.xAxis.type - type of axis
 *          @param {string} options.xAxis.dateFormat - date format
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
 *          @param {object} options.tooltip.offsetX - tooltip offset x
 *          @param {object} options.tooltip.offsetY - tooltip offset y
 *          @param {object} options.tooltip.position - (deprecated) relative position
 *              @param {number} options.tooltip.position.left - position left
 *              @param {number} options.tooltip.position.top - position top
 *          @param {boolean} options.tooltip.grouped - whether group tooltip or not
 *      @param {object} options.legend - options for legend component
 *          @param {string} options.legend.align - align option for legend (top|bottom|left)
 *          @param {boolean} options.legend.showCheckbox - whether show checkbox or not (default: true)
 *          @param {boolean} options.legend.visible - whether visible or not (default: true)
 *          @param {number} options.legend.maxWidth - legend name display max width
 *      @param {object} options.plot - options for plot component
 *          @param {boolean} options.plot.showLine - whether show line or not (default: true)
 *          @param {Array} options.plot.bands - plot bands
 *              @param {Array.<string|number|date>} options.plot.bands.range - value range for matching
 *              @param {string} options.plot.bands.color - band color
 *              @param {number} options.plot.bands.opacity - band opacity
 *          @param {Array} options.plot.lines - plot lines
 *              @param {(string|number|date)} options.plot.lines.value - value for matching
 *              @param {string} options.plot.lines.color - band color
 *              @param {number} options.plot.lines.opacity - band opacity
 *          @param {Array.<{value: (string|number|date), color: ?string, opacity: ?string}>} options.plot.lines
 *                  - plot lines
 *      @param {string} options.theme - theme name
 *      @param {string} options.libType - type of graph library
 *      @param {object} options.chartExportMenu - options for exporting
 *          @param {string} options.chartExportMenu.filename - export file name
 * @returns {object} bar chart
 * @api
 * @example
 * var chart = tui.chart; // or require('tui-chart');
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
 * chart.lineChart(container, rawData, options);
 */
function lineChart(container, rawData, options) {
    return _createChart(container, rawData, options, chartConst.CHART_TYPE_LINE);
}

/**
 * Area chart creator.
 * @memberof module:chart
 * @memberof tui.chart
 * @param {HTMLElement} container - chart container
 * @param {rawData} rawData - raw data
 *      @param {?Array.<string>} rawData.categories - categories
 *      @param {Array.<Array>} rawData.series - series data
 * @param {object} options - chart options
 *      @param {object} options.chart - base options for chart
 *          @param {number} options.chart.width - chart width
 *          @param {number} options.chart.height - chart height
 *          @param {string | object} options.chart.title - title text or title object
 *              @param {string} options.chart.title.text - title text
 *              @param {number} options.chart.title.offsetX - title offset x
 *              @param {number} options.chart.title.offsetY - title offset y
 *          @param {string | function} options.chart.format - formatter for value
 *      @param {object} options.yAxis - options for y axis component
 *          @param {string | object} options.yAxis.title - title text or title object
 *              @param {string} options.yAxis.title.text - title text
 *              @param {number} options.yAxis.title.offsetX - title offset x
 *              @param {number} options.yAxis.title.offsetY - title offset y
 *          @param {number} options.yAxis.labelMargin - label margin for y axis
 *          @param {number} options.yAxis.min - minimum value for y axis
 *          @param {number} options.yAxis.max - maximum value for y axis
 *          @param {boolean} options.yAxis.rotateTitle - whether rotate title or not (default: true)
 *      @param {object} options.xAxis - options for x axis component
 *          @param {string | object} options.xAxis.title - title text or title object
 *              @param {string} options.xAxis.title.text - title text
 *              @param {number} options.xAxis.title.offsetX - title offset x
 *              @param {number} options.xAxis.title.offsetY - title offset y
 *          @param {number} options.xAxis.labelMargin - label margin for x axis
 *          @param {number} options.xAxis.labelInterval - label interval for x axis
 *          @param {boolean} options.xAxis.rotateLabel - whether rotate label or not (default: true)
 *          @param {string} options.xAxis.tickInterval - tick interval for x axis
 *          @param {string} options.xAxis.type - type of axis
 *          @param {string} options.xAxis.dateFormat - date format
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
 *          @param {object} options.tooltip.offsetX - tooltip offset x
 *          @param {object} options.tooltip.offsetY - tooltip offset y
 *          @param {object} options.tooltip.position - (deprecated) relative position
 *              @param {number} options.tooltip.position.left - position left
 *              @param {number} options.tooltip.position.top - position top
 *          @param {boolean} options.tooltip.grouped - whether group tooltip or not
 *      @param {object} options.legend - options for legend component
 *          @param {string} options.legend.align - align option for legend (top|bottom|left)
 *          @param {boolean} options.legend.showCheckbox - whether show checkbox or not (default: true)
 *          @param {boolean} options.legend.visible - whether visible or not (default: true)
 *          @param {number} options.legend.maxWidth - legend name display max width
 *      @param {object} options.plot - options for plot component
 *          @param {boolean} options.plot.showLine - whether show line or not (default: true)
 *          @param {Array} options.plot.bands - plot bands
 *              @param {Array.<string|number|date>} options.plot.bands.range - value range for matching
 *              @param {string} options.plot.bands.color - band color
 *              @param {number} options.plot.bands.opacity - band opacity
 *          @param {Array} options.plot.lines - plot lines
 *              @param {(string|number|date)} options.plot.lines.value - value for matching
 *              @param {string} options.plot.lines.color - band color
 *              @param {number} options.plot.lines.opacity - band opacity
 *      @param {string} options.theme - theme name
 *      @param {string} options.libType - type of graph library
 *      @param {object} options.chartExportMenu - options for exporting
 *          @param {string} options.chartExportMenu.filename - export file name
 * @returns {object} bar chart
 * @api
 * @example
 * var chart = tui.chart; // or require('tui-chart');
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
 * chart.areaChart(container, rawData, options);
 */
function areaChart(container, rawData, options) {
    return _createChart(container, rawData, options, chartConst.CHART_TYPE_AREA);
}

/**
 * Bubble chart creator.
 * @memberof module:chart
 * @memberof tui.chart
 * @param {HTMLElement} container - chart container
 * @param {rawData} rawData - raw data
 *      @param {Array.<string>} rawData.categories - categories
 *      @param {Array.<Array>} rawData.series - series data
 * @param {object} options - chart options
 *      @param {object} options.chart - base options for chart
 *          @param {number} options.chart.width - chart width
 *          @param {number} options.chart.height - chart height
 *          @param {string | object} options.chart.title - title text or title object
 *              @param {string} options.chart.title.text - title text
 *              @param {number} options.chart.title.offsetX - title offset x
 *              @param {number} options.chart.title.offsetY - title offset y
 *          @param {string | function} options.chart.format - formatter for value
 *      @param {object} options.yAxis - options for y axis component
 *          @param {string | object} options.yAxis.title - title text or title object
 *              @param {string} options.yAxis.title.text - title text
 *              @param {number} options.yAxis.title.offsetX - title offset x
 *              @param {number} options.yAxis.title.offsetY - title offset y
 *          @param {number} options.yAxis.labelMargin - label margin for y axis
 *          @param {number} options.yAxis.min - minimum value for y axis
 *          @param {number} options.yAxis.max - maximum value for y axis
 *          @param {boolean} options.yAxis.rotateTitle - whether rotate title or not (default: true)
 *      @param {object} options.xAxis - options for x axis component
 *          @param {string | object} options.xAxis.title - title text or title object
 *              @param {string} options.xAxis.title.text - title text
 *              @param {number} options.xAxis.title.offsetX - title offset x
 *              @param {number} options.xAxis.title.offsetY - title offset y
 *          @param {number} options.xAxis.labelMargin - label margin for x axis
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
 *          @param {object} options.tooltip.offsetX - tooltip offset x
 *          @param {object} options.tooltip.offsetY - tooltip offset y
 *          @param {object} options.tooltip.position - (deprecated) relative position
 *              @param {number} options.tooltip.position.left - position left
 *              @param {number} options.tooltip.position.top - position top
 *      @param {object} options.legend - options for legend component
 *          @param {string} options.legend.align - align option for legend (top|bottom|left)
 *          @param {boolean} options.legend.showCheckbox - whether show checkbox or not (default: true)
 *          @param {boolean} options.legend.visible - whether visible or not (default: true)
 *          @param {number} options.legend.maxWidth - legend name display max width
 *      @param {object} options.circleLegend - options for circleLegend
 *          @param {boolean} options.circleLegend.visible - whether visible or not (default: true)
 *      @param {object} options.plot - options for plot component
 *          @param {boolean} options.plot.showLine - whether show line or not (default: true)
 *      @param {string} options.theme - theme name
 *      @param {string} options.libType - type of graph library
 *      @param {object} options.chartExportMenu - options for exporting
 *          @param {string} options.chartExportMenu.filename - export file name
 * @returns {object} bubble chart
 * @api
 * @example
 * var chart = tui.chart; // or require('tui-chart');
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
 * chart.bubbleChart(container, rawData, options);
 */
function bubbleChart(container, rawData, options) {
    return _createChart(container, rawData, options, chartConst.CHART_TYPE_BUBBLE);
}

/**
 * Scatter chart creator.
 * @memberof module:chart
 * @memberof tui.chart
 * @param {HTMLElement} container - chart container
 * @param {rawData} rawData - raw data
 *      @param {Array.<string>} rawData.categories - categories
 *      @param {Array.<Array>} rawData.series - series data
 * @param {object} options - chart options
 *      @param {object} options.chart - base options for chart
 *          @param {number} options.chart.width - chart width
 *          @param {number} options.chart.height - chart height
 *          @param {string | object} options.chart.title - title text or title object
 *              @param {string} options.chart.title.text - title text
 *              @param {number} options.chart.title.offsetX - title offset x
 *              @param {number} options.chart.title.offsetY - title offset y
 *          @param {string | function} options.chart.format - formatter for value
 *      @param {object} options.yAxis - options for y axis component
 *          @param {string | object} options.yAxis.title - title text or title object
 *              @param {string} options.yAxis.title.text - title text
 *              @param {number} options.yAxis.title.offsetX - title offset x
 *              @param {number} options.yAxis.title.offsetY - title offset y
 *          @param {number} options.yAxis.labelMargin - label margin for y axis
 *          @param {number} options.yAxis.min - minimum value for y axis
 *          @param {number} options.yAxis.max - maximum value for y axis
 *          @param {boolean} options.yAxis.rotateTitle - whether rotate title or not (default: true)
 *      @param {object} options.xAxis - options for x axis component
 *          @param {string | object} options.xAxis.title - title text or title object
 *              @param {string} options.xAxis.title.text - title text
 *              @param {number} options.xAxis.title.offsetX - title offset x
 *              @param {number} options.xAxis.title.offsetY - title offset y
 *          @param {number} options.xAxis.labelMargin - label margin for x axis
 *          @param {number} options.xAxis.min - minimum value for y axis
 *          @param {number} options.xAxis.max - maximum value for y axis
 *      @param {object} options.series - options for series component
 *          @param {boolean} options.series.showLabel - whether show label or not
 *          @param {boolean} options.series.allowSelect - whether allow select or not
 *      @param {object} options.tooltip - options for tooltip component
 *          @param {string} options.tooltip.suffix - suffix for tooltip
 *          @param {function} [options.tooltip.template] - template for tooltip
 *          @param {string} options.tooltip.align - align option for tooltip
 *          @param {object} options.tooltip.offsetX - tooltip offset x
 *          @param {object} options.tooltip.offsetY - tooltip offset y
 *          @param {object} options.tooltip.position - (deprecated) relative position
 *              @param {number} options.tooltip.position.left - position left
 *              @param {number} options.tooltip.position.top - position top
 *      @param {object} options.legend - options for legend component
 *          @param {string} options.legend.align - align option for legend (top|bottom|left)
 *          @param {boolean} options.legend.showCheckbox - whether show checkbox or not (default: true)
 *          @param {boolean} options.legend.visible - whether visible or not (default: true)
 *          @param {number} options.legend.maxWidth - legend name display max width
 *      @param {object} options.plot - options for plot component
 *          @param {boolean} options.plot.showLine - whether show line or not (default: true)
 *      @param {string} options.theme - theme name
 *      @param {string} options.libType - type of graph library
 *      @param {object} options.chartExportMenu - options for exporting
 *          @param {string} options.chartExportMenu.filename - export file name
 * @returns {object} scatter chart
 * @api
 * @example
 * var chart = tui.chart; // or require('tui-chart');
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
 * chart.scatterChart(container, rawData, options);
 */
function scatterChart(container, rawData, options) {
    return _createChart(container, rawData, options, chartConst.CHART_TYPE_SCATTER);
}

/**
 * Heatmap chart creator.
 * @memberof module:chart
 * @memberof tui.chart
 * @param {HTMLElement} container - chart container
 * @param {rawData} rawData - raw data
 *      @param {{x: Array.<string | number>, y: Array.<string | number>}} rawData.categories - categories
 *      @param {Array.<Array.<number>>} rawData.series - series data
 * @param {object} options - chart options
 *      @param {object} options.chart - base options for chart
 *          @param {number} options.chart.width - chart width
 *          @param {number} options.chart.height - chart height
 *          @param {string | object} options.chart.title - title text or title object
 *              @param {string} options.chart.title.text - title text
 *              @param {number} options.chart.title.offsetX - title offset x
 *              @param {number} options.chart.title.offsetY - title offset y
 *          @param {string | function} options.chart.format - formatter for value
 *      @param {object} options.yAxis - options for y axis component
 *          @param {string | object} options.yAxis.title - title text or title object
 *              @param {string} options.yAxis.title.text - title text
 *              @param {number} options.yAxis.title.offsetX - title offset x
 *              @param {number} options.yAxis.title.offsetY - title offset y
 *          @param {number} options.yAxis.labelMargin - label margin for y axis
 *          @param {boolean} options.yAxis.rotateTitle - whether rotate title or not (default: true)
 *      @param {object} options.xAxis - options for x axis component
 *          @param {string | object} options.xAxis.title - title text or title object
 *              @param {string} options.xAxis.title.text - title text
 *              @param {number} options.xAxis.title.offsetX - title offset x
 *              @param {number} options.xAxis.title.offsetY - title offset y
 *          @param {number} options.xAxis.labelMargin - label margin for x axis
 *      @param {object} options.series - options for series component
 *          @param {boolean} options.series.showLabel - whether show label or not
 *      @param {object} options.tooltip - options for tooltip component
 *          @param {string} options.tooltip.suffix - suffix for tooltip
 *          @param {function} [options.tooltip.template] - template for tooltip
 *          @param {string} options.tooltip.align - align option for tooltip
 *          @param {object} options.tooltip.offsetX - tooltip offset x
 *          @param {object} options.tooltip.offsetY - tooltip offset y
 *          @param {object} options.tooltip.position - (deprecated) relative position
 *              @param {number} options.tooltip.position.left - position left
 *              @param {number} options.tooltip.position.top - position top
 *      @param {object} options.legend - options for legend component
 *          @param {string} options.legend.align - align option for legend (top|bottom|left)
 *          @param {boolean} options.legend.visible - whether visible or not (default: true)
 *          @param {number} options.legend.maxWidth - legend name display max width
 *      @param {string} options.theme - theme name
 *      @param {string} options.libType - type of graph library
 *      @param {object} options.chartExportMenu - options for exporting
 *          @param {string} options.chartExportMenu.filename - export file name
 * @returns {object} scatter chart
 * @api
 * @example
 * var chart = tui.chart; // or require('tui-chart');
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
 * chart.heatmapChart(container, rawData, options);
 */
function heatmapChart(container, rawData, options) {
    return _createChart(container, rawData, options, chartConst.CHART_TYPE_HEATMAP);
}

/**
 * Treemap chart creator.
 * @memberof module:chart
 * @memberof tui.chart
 * @param {HTMLElement} container - chart container
 * @param {rawData} rawData - raw data
 *      @param {Array.<Array.<object>>} rawData.series - series data
 * @param {object} options - chart options
 *      @param {object} options.chart - base options for chart
 *          @param {number} options.chart.width - chart width
 *          @param {number} options.chart.height - chart height
 *          @param {string | object} options.chart.title - title text or title object
 *              @param {string} options.chart.title.text - title text
 *              @param {number} options.chart.title.offsetX - title offset x
 *              @param {number} options.chart.title.offsetY - title offset y
 *          @param {string | function} options.chart.format - formatter for value
 *      @param {object} options.series - options for series component
 *          @param {boolean} options.series.showLabel - whether show label or not
 *          @param {boolean} options.series.useColorValue - whether use colorValue or not
 *          @param {boolean} options.series.zoomable - whether zoomable or not
 *          @param {boolean} options.series.useLeafLabel - whether use leaf label or not
 *      @param {object} options.tooltip - options for tooltip component
 *          @param {string} options.tooltip.suffix - suffix for tooltip
 *          @param {function} [options.tooltip.template] - template for tooltip
 *          @param {object} options.tooltip.offsetX - tooltip offset x
 *          @param {object} options.tooltip.offsetY - tooltip offset y
 *          @param {object} options.tooltip.position - (deprecated) relative position
 *              @param {number} options.tooltip.position.left - position left
 *              @param {number} options.tooltip.position.top - position top
 *      @param {object} options.legend - options for legend component
 *          @param {string} options.legend.align - align option for legend (top|bottom|left)
 *          @param {boolean} options.legend.visible - whether visible or not (default: true)
 *          @param {number} options.legend.maxWidth - legend name display max width
 *      @param {string} options.theme - theme name
 *      @param {string} options.libType - type of graph library
 *      @param {object} options.chartExportMenu - options for exporting
 *          @param {string} options.chartExportMenu.filename - export file name
 * @returns {object} scatter chart
 * @api
 * @example
 * var chart = tui.chart; // or require('tui-chart');
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
 * chart.treemapChart(container, rawData, options);
 */
function treemapChart(container, rawData, options) {
    return _createChart(container, rawData, options, chartConst.CHART_TYPE_TREEMAP);
}

/**
 * Combo chart creator.
 * @memberof module:chart
 * @memberof tui.chart
 * @param {HTMLElement} container - chart container
 * @param {rawData} rawData - raw data
 *      @param {Array.<string>} rawData.categories - categories
 *      @param {Array.<Array>} rawData.series - series data
 * @param {object} options - chart options
 *      @param {object} options.chart - base options for chart
 *          @param {number} options.chart.width - chart width
 *          @param {number} options.chart.height - chart height
 *          @param {string | object} options.chart.title - title text or title object
 *              @param {string} options.chart.title.text - title text
 *              @param {number} options.chart.title.offsetX - title offset x
 *              @param {number} options.chart.title.offsetY - title offset y
 *          @param {string | function} options.chart.format - formatter for value
 *      @param {object|Array} options.yAxis - options for y axis component
 *          @param {string | object} options.yAxis.title - title text or title object
 *              @param {string} options.yAxis.title.text - title text
 *              @param {number} options.yAxis.title.offsetX - title offset x
 *              @param {number} options.yAxis.title.offsetY - title offset y
 *          @param {number} options.yAxis.labelMargin - label margin for y axis
 *          @param {number} options.yAxis.min - minimum value for y axis
 *          @param {number} options.yAxis.max - maximum value for y axis
 *          @param {boolean} options.yAxis.rotateTitle - whether rotate title or not (default: true)
 *      @param {object} options.xAxis - options for x axis component
 *          @param {string | object} options.xAxis.title - title text or title object
 *              @param {string} options.xAxis.title.text - title text
 *              @param {number} options.xAxis.title.offsetX - title offset x
 *              @param {number} options.xAxis.title.offsetY - title offset y
 *          @param {number} options.xAxis.labelMargin - label margin for x axis
 *          @param {number} options.xAxis.labelInterval - label interval for x axis
 *          @param {boolean} options.xAxis.rotateLabel - whether rotate label or not (default: true)
 *      @param {object} options.series - options for series component
 *          @param {?object} options.series.column - options for column series component
 *              @param {string} options.series.column.stackType - type of stack
 *              @param {boolean} options.series.column.showLabel - whether show label or not
 *              @param {number} options.series.column.barWidth - bar width
 *          @param {?object} options.series.line - options for line series component
 *              @param {boolean} options.series.line.showDot - whether show dot or not
 *              @param {boolean} options.series.line.showLabel - whether show label or not
 *              @param {boolean} options.series.line.spline - whether spline or not
 *          @param {?object} options.series.area - options for line series component
 *              @param {boolean} options.series.area.showDot - whether show dot or not
 *              @param {boolean} options.series.area.showLabel - whether show label or not
 *              @param {boolean} options.series.area.spline - whether spline or not
 *          @param {?object} options.series.pie - options for pie series component
 *              @param {boolean} options.series.pie.showLabel - whether show label or not
 *              @param {number} options.series.pie.radiusRatio - ratio of radius for pie graph
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
 *              @param {number} options.tooltip.column.offsetX - tooltip offset x
 *              @param {number} options.tooltip.column.offsetY - tooltip offset y
 *              @param {object} options.tooltip.column.position - (deprecated) relative position
 *                  @param {number} options.tooltip.position.left - position left
 *                  @param {number} options.tooltip.position.top - position top
 *          @param {boolean} options.tooltip.grouped - whether group tooltip or not
 *      @param {object} options.legend - options for legend component
 *          @param {string} options.legend.align - align option for legend (top|bottom|left)
 *          @param {boolean} options.legend.showCheckbox - whether show checkbox or not (default: true)
 *          @param {boolean} options.legend.visible - whether visible or not (default: true)
 *          @param {number} options.legend.maxWidth - legend name display max width
 *      @param {object} options.plot - options for plot component
 *          @param {boolean} options.plot.showLine - whether show line or not (default: true)
 *          @param {Array} options.plot.bands - plot bands for line & area combo chart
 *              @param {Array.<string|number|date>} options.plot.bands.range - value range for matching
 *              @param {string} options.plot.bands.color - band color
 *              @param {number} options.plot.bands.opacity - band opacity
 *          @param {Array} options.plot.lines - plot lines
 *              @param {(string|number|date)} options.plot.lines.value - value for matching
 *              @param {string} options.plot.lines.color - band color
 *              @param {number} options.plot.lines.opacity - band opacity
 *      @param {string} options.theme - theme name
 *      @param {string} options.libType - type of graph library
 *      @param {object} options.chartExportMenu - options for exporting
 *          @param {string} options.chartExportMenu.filename - export file name
 * @returns {object} bar chart
 * @api
 * @example
 * var chart = tui.chart; // or require('tui-chart');
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
 * chart.comboChart(container, rawData, options);
 */
function comboChart(container, rawData, options) {
    return _createChart(container, rawData, options, chartConst.CHART_TYPE_COMBO);
}

/**
 * Pie chart creator.
 * @memberof module:chart
 * @memberof tui.chart
 * @param {HTMLElement} container - chart container
 * @param {rawData} rawData - raw data
 *      @param {Array.<Array>} rawData.series - series data
 * @param {object} options - chart options
 *      @param {object} options.chart - base options for chart
 *          @param {number} options.chart.width - chart width
 *          @param {number} options.chart.height - chart height
 *          @param {string | object} options.chart.title - title text or title object
 *              @param {string} options.chart.title.text - title text
 *              @param {number} options.chart.title.offsetX - title offset x
 *              @param {number} options.chart.title.offsetY - title offset y
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
 *          @param {object} options.tooltip.offset - tooltip offset
 *              @param {number} options.tooltip.offset.x - offset x
 *              @param {number} options.tooltip.offset.y - offset y
 *          @param {object} options.tooltip.position - (deprecated) relative position
 *              @param {number} options.tooltip.position.left - position left
 *              @param {number} options.tooltip.position.top - position top
 *      @param {object} options.legend - options for legend component
 *          @param {string} options.legend.align - align option for legend (top|bottom|left|center|outer)
 *          @param {boolean} options.legend.showCheckbox - whether show checkbox or not (default: true)
 *          @param {boolean} options.legend.visible - whether visible or not (default: true)
 *          @param {number} options.legend.maxWidth - legend name display max width
 *      @param {string} options.theme - theme name
 *      @param {string} options.libType - type of graph library
 *      @param {object} options.chartExportMenu - options for exporting
 *          @param {string} options.chartExportMenu.filename - export file name
 * @returns {object} bar chart
 * @api
 * @example
 * var chart = tui.chart; // or require('tui-chart');
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
 * chart.pieChart(container, rawData, options);
 */
function pieChart(container, rawData, options) {
    return _createChart(container, rawData, options, chartConst.CHART_TYPE_PIE);
}

/**
 * Map chart creator.
 * @memberof module:chart
 * @memberof tui.chart
 * @param {HTMLElement} container - chart container
 * @param {rawData} rawData chart data
 *      @param {Array.<Array>} rawData.series - series data
 * @param {object} options - chart options
 *      @param {object} options.chart - base options for chart
 *          @param {number} options.chart.width - chart width
 *          @param {number} options.chart.height - chart height
 *          @param {string | object} options.chart.title - title text or title object
 *              @param {string} options.chart.title.text - title text
 *              @param {number} options.chart.title.offsetX - title offset x
 *              @param {number} options.chart.title.offsetY - title offset y
 *          @param {string | function} options.chart.format - formatter for value
 *      @param {object} options.series - options for series component
 *          @param {boolean} options.series.showLabel - whether show label or not
 *      @param {object} options.tooltip - options for tooltip component
 *          @param {string} options.tooltip.suffix - suffix for tooltip
 *          @param {function} [options.tooltip.template] - template for tooltip
 *          @param {string} options.tooltip.align - align option for tooltip
 *          @param {object} options.tooltip.offset - tooltip offset
 *              @param {number} options.tooltip.offset.x - offset x
 *              @param {number} options.tooltip.offset.y - offset y
 *          @param {object} options.tooltip.position - (deprecated) relative position
 *              @param {number} options.tooltip.position.left - position left
 *              @param {number} options.tooltip.position.top - position top
 *      @param {object} options.legend - options for legend component
 *          @param {string} options.legend.align - align option for legend (top|bottom|left|center|outer)
 *      @param {string} options.theme - theme name
 *      @param {string} options.map map type
 *      @param {string} options.libType - type of graph library
 *      @param {object} options.chartExportMenu - options for exporting
 *          @param {string} options.chartExportMenu.filename - export file name
 * @returns {object} bar chart
 * @api
 * @example
 * var chart = tui.chart; // or require('tui-chart');
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
 * chart.mapChart(container, rawData, options);
 */
function mapChart(container, rawData, options) {
    return _createChart(container, rawData, options, chartConst.CHART_TYPE_MAP);
}

/**
 * radial chart creator.
 * @memberof module:chart
 * @memberof tui.chart
 * @param {HTMLElement} container - chart container
 * @param {rawData} rawData - raw data
 *      @param {Array.<Array>} rawData.series - series data
 * @param {object} options - chart options
 *      @param {object} options.chart - base options for chart
 *          @param {number} options.chart.width - chart width
 *          @param {number} options.chart.height - chart height
 *          @param {string | object} options.chart.title - title text or title object
 *              @param {string} options.chart.title.text - title text
 *              @param {number} options.chart.title.offsetX - title offset x
 *              @param {number} options.chart.title.offsetY - title offset y
 *          @param {string | function} options.chart.format - formatter for value
 *      @param {object} options.series - options for series component
 *          @param {boolean} options.series.showDot - show dot or not (default: true)
 *          @param {boolean} options.series.showArea - show area or not (default: true)
 *      @param {object} options.plot - options for plot component
 *          @param {boolean} options.plot.type - "spiderweb" or "circle" (default: "spiderweb")
 *      @param {object|Array} options.yAxis - options for y axis component
 *          @param {number} options.yAxis.min - minimum value for y axis
 *          @param {number} options.yAxis.max - maximum value for y axis
 *      @param {object} options.tooltip - options for tooltip component
 *          @param {string} options.tooltip.suffix - suffix for tooltip
 *          @param {function} [options.tooltip.template] - template for tooltip
 *          @param {string} options.tooltip.align - align option for tooltip
 *          @param {object} options.tooltip.offset - tooltip offset
 *              @param {number} options.tooltip.offset.x - offset x
 *              @param {number} options.tooltip.offset.y - offset y
 *          @param {object} options.tooltip.position - (deprecated) relative position
 *              @param {number} options.tooltip.position.left - position left
 *              @param {number} options.tooltip.position.top - position top
 *      @param {object} options.legend - options for legend component
 *          @param {string} options.legend.align - align option for legend (top|bottom|left|center|outer)
 *          @param {boolean} options.legend.showCheckbox - whether show checkbox or not (default: true)
 *          @param {boolean} options.legend.visible - whether visible or not (default: true)
 *          @param {number} options.legend.maxWidth - legend name display max width
 *      @param {string} options.theme - theme name
 *      @param {string} options.libType - type of graph library
 *      @param {object} options.chartExportMenu - options for exporting
 *          @param {string} options.chartExportMenu.filename - export file name
 * @returns {object} bar chart
 * @api
 * @example
 * var chart = tui.chart; // or require('tui-chart');
 * var container = document.getElementById('chart-area'),
 *     rawData = {
 *         categories: ["June", "July", "Aug", "Sep", "Oct", "Nov"],
 *         series: [
 *             {
 *                 name: 'Budget',
 *                 data: [5000, 3000, 5000, 7000, 6000, 4000]
 *             },
 *             {
 *                 name: 'Income',
 *                 data: [8000, 8000, 7000, 2000, 5000, 3000]
 *             },
 *             {
 *                 name: 'Expenses',
 *                 data: [4000, 4000, 6000, 3000, 4000, 5000]
 *             },
 *             {
 *                 name: 'Debt',
 *                 data: [6000, 3000, 3000, 1000, 2000, 4000]
 *             }
 *         ]
 *     },
 *     options = {
 *         chart: {
 *             width: 600,
 *             height: 400
 *         },
 *         series: {
 *             showDot: true,
 *             showArea: true
 *         },
 *         plot: {
 *             type: 'circle'
 *         },
 *         yAxis: {
 *             min: 0,
 *             max: 9000
 *         }
 *     };
 * chart.radialChart(container, rawData, options);
 *
 */
function radialChart(container, rawData, options) {
    return _createChart(container, rawData, options, chartConst.CHART_TYPE_RADIAL);
}

/**
 * Boxplot chart creator.
 * @memberof module:chart
 * @memberof tui.chart
 * @param {HTMLElement} container - chart container
 * @param {rawData} rawData chart data
 * @param {object} options - chart options
 * @returns {object} box plot chart
 * @api
 * @example
 * var chart = tui.chart; // or require('tui-chart');
 * var container = document.getElementById('container-id'),
 * var rawData = {
 *  categories: ['Budget', 'Income', 'Expenses', 'Debt'],
 *  series: [{
 *      name: '2015',
 *      data: [
 *          [1000, 2500, 3714, 5500, 7000],
 *          [1000, 2250, 3142, 4750, 6000]
 *      ],
 *      outliers: [
 *          [0, 14000]
 *      ]
 *  }, {
 *      name: '2016',
 *      data: [
 *          [2000, 4500, 6714, 11500, 13000],
 *          [7000, 9250, 10142, 11750, 12000]
 *      ],
 *      outliers: [
 *          [1, 14000]
 *      ]
 *  }];
 * };
 * var options = {
 *      chart: {
 *          width: 600,
 *          height: 400
 *      },
 *      series: {
 *          showDot: true,
 *          showArea: true
 *      },
 *      plot: {
 *          type: 'circle'
 *      },
 *      yAxis: {
 *          min: 0,
 *          max: 9000
 *      }
 *  };
 * chart.boxplotChart(container, rawData, options);
 */
function boxplotChart(container, rawData, options) {
    return _createChart(container, rawData, options, chartConst.CHART_TYPE_BOXPLOT);
}

/**
 * Bullet chart creator.
 * @memberof module:chart
 * @memberof tui.chart
 * @param {HTMLElement} container - chart container
 * @param {rawData} rawData chart data
 * @param {object} options - chart options
 * @returns {object} box plot chart
 * @api
 * @example
 * var chart = tui.chart; // or require('tui-chart');
 * var container = document.getElementById('chart-area');
 * var data = {
 *   categories: ['July', 'August'],
 *   series: [{
 *       name: 'Budget',
 *       data: 25,
 *      markers: [28, 2, 15],
 *       ranges: [[-1, 10], [10, 20], [20, 30]]
 *   },{
 *       name: 'Hello',
 *       data: 11,
 *       markers: [20],
 *       ranges: [[0, 8], [8, 15]]
 *   }]
 * };
 * var options = {
 *    chart: {
 *       width: 700,
 *       height: 300,
 *       title: 'Monthly Revenue'
 *   },
 *   series: {
 *       showLabel: true,
 *       vertical: false
 *   }
 * };
 * chart.bulletChart(container, data, options);
 */
function bulletChart(container, rawData, options) {
    return _createChart(container, rawData, options, chartConst.CHART_TYPE_BULLET);
}

/**
 * Register theme.
 * @memberof tui.chart
 * @param {string} themeName - theme name
 * @param {object} theme - application chart theme
 *      @param {object} theme.chart - chart theme
 *          @param {string} theme.chart.fontFamily - font family for chart
 *          @param {string} theme.chart.background - background for chart
 *      @param {object} theme.title - chart title theme
 *          @param {number} theme.title.fontSize - font size
 *          @param {string} theme.title.fontFamily - font family
 *          @param {string} theme.title.fontWeight - font weight
 *          @param {string} theme.title.color - font color
 *          @param {string} theme.title.background - background
 *      @param {object} theme.yAxis - y axis theme
 *          @param {object} theme.yAxis.title - theme for y axis title
 *              @param {number} theme.yAxis.title.fontSize - font size
 *              @param {string} theme.yAxis.title.fontFamily - font family
 *              @param {string} theme.yAxis.title.fontWeight - font weight
 *              @param {string} theme.yAxis.title.color - font color
 *          @param {object} theme.yAxis.label - theme for y axis label
 *              @param {number} theme.yAxis.label.fontSize - font size
 *              @param {string} theme.yAxis.label.fontFamily - font family
 *              @param {string} theme.yAxis.label.fontWeight - font weight
 *              @param {string} theme.yAxis.label.color - font color
 *          @param {string} theme.yAxis.tickColor - color for y axis tick
 *      @param {object} theme.xAxis - theme for x axis
 *          @param {object} theme.xAxis.title - theme for x axis title
 *              @param {number} theme.xAxis.title.fontSize - font size
 *              @param {string} theme.xAxis.title.fontFamily - font family
 *              @param {string} theme.xAxis.title.fontWeight - font weight
 *              @param {string} theme.xAxis.title.color - font color
 *          @param {object} theme.xAxis.label - theme for x axis label
 *              @param {number} theme.xAxis.label.fontSize - font size
 *              @param {string} theme.xAxis.label.fontFamily - font family
 *              @param {string} theme.xAxis.label.fontWeight - font weight
 *              @param {string} theme.xAxis.label.color - font color
 *          @param {string} theme.xAxis.tickColor - color for x axis tick
 *      @param {object} theme.plot - theme for plot
 *          @param {string} theme.plot.lineColor - line color
 *          @param {string} theme.plot.background - background
 *      @param {object} theme.series theme for series
 *          @param {Array.<string>} theme.series.colors - colors
 *          @param {string} theme.series.borderColor - border color
 *          @param {string} theme.series.selectionColor - selection color
 *          @param {string} theme.series.startColor - start color
 *          @param {string} theme.series.endColor - end color
 *          @param {string} theme.series.overColor - over color
 *      @param {object} theme.legend - theme for legend
 *          @param {object} theme.legend.label - theme for legend label
 *              @param {number} theme.legend.label.fontSize - font size
 *              @param {string} theme.legend.label.fontFamily - font family
 *              @param {string} theme.legend.label.fontWeight - font family
 *              @param {string} theme.legend.label.color - font color
 * @api
 * @example
 * var chart = tui.chart; // or require('tui-chart');
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
 * chart.registerTheme('newTheme', theme);
 */
function registerTheme(themeName, theme) {
    themeManager.register(themeName, theme);
}

/**
 * Register map.
 * @memberof tui.chart
 * @param {string} mapName map name
 * @param {Array.<{code: string, name: string, path: string}>} data map data
 * @api
 * @example
 * var chart = tui.chart; // or require('tui-chart');
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
 * chart.registerMap('newMap', data);
 */
function registerMap(mapName, data) {
    mapManager.register(mapName, data);
}

/**
 * Register graph plugin.
 * @memberof tui.chart
 * @param {string} libType type of graph library
 * @param {object} plugin plugin to control library
 * @param {function} getPaperCallback callback function for getting paper
 * @example
 * var chart = tui.chart; // or require('tui-chart');
 * var pluginRaphael = {
 *   bar: function() {} // Render class
 * };
 * tui.chart.registerPlugin('raphael', pluginRaphael);
 */
function registerPlugin(libType, plugin, getPaperCallback) {
    pluginFactory.register(libType, plugin);
    drawingToolPicker.addRendererType(libType, getPaperCallback);
}

module.exports = {
    barChart: barChart,
    columnChart: columnChart,
    lineChart: lineChart,
    areaChart: areaChart,
    bubbleChart: bubbleChart,
    scatterChart: scatterChart,
    heatmapChart: heatmapChart,
    treemapChart: treemapChart,
    comboChart: comboChart,
    pieChart: pieChart,
    mapChart: mapChart,
    radialChart: radialChart,
    boxplotChart: boxplotChart,
    bulletChart: bulletChart,
    registerTheme: registerTheme,
    registerMap: registerMap,
    registerPlugin: registerPlugin
};
