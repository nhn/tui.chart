/**
 * @fileoverview chart.js is entry point of Toast UI Chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */
'use strict';

var chartConst = require('./const'),
    chartFactory = require('./factories/chartFactory'),
    pluginFactory = require('./factories/pluginFactory'),
    themeFactory = require('./factories/themeFactory'),
    mapFactory = require('./factories/mapFactory');

var _createChart;

require('./polyfill');
require('./code-snippet-util');
require('./registerCharts');
require('./registerThemes');

/**
 * NHN Entertainment Toast UI Chart.
 * @namespace tui.chart
 */
tui.util.defineNamespace('tui.chart');

/**
 * Create chart.
 * @param {HTMLElement} container container
 * @param {Array.<Array>} data chart data
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
 *     template: function
 *   },
 *   theme: string
 * }} options chart options
 * @returns {object} chart instance.
 * @private
 * @ignore
 */
_createChart = function(container, data, options) {
    var themeName, theme, chart;
    options = options ? JSON.parse(JSON.stringify(options)) : {};
    themeName = options.theme || chartConst.DEFAULT_THEME_NAME;
    theme = themeFactory.get(themeName);

    chart = chartFactory.get(options.chartType, data, theme, options);
    container.appendChild(chart.render());
    chart.animateChart();

    return chart;
};

/**
 * Bar chart creator.
 * @memberOf tui.chart
 * @param {HTMLElement} container chart container
 * @param {object} data chart data
 *      @param {Array.<string>} data.categories categories
 *      @param {Array.<Array>} data.series series data
 * @param {object} options chart options
 *      @param {object} options.chart chart options
 *          @param {number} options.chart.width chart width
 *          @param {number} options.chart.height chart height
 *          @param {string} options.chart.title chart title
 *          @param {string} options.chart.format value format
 *      @param {object} options.yAxis options of vertical axis
 *          @param {string} options.yAxis.title title of vertical axis
 *          @param {number} options.yAxis.labelInterval label interval of vertical axis
 *      @param {object} options.xAxis options of horizontal axis
 *          @param {string} options.xAxis.title title of horizontal axis
 *          @param {number} options.xAxis.min minimal value of horizontal axis
 *          @param {number} options.xAxis.max maximum value of horizontal axis
 *      @param {object} options.series options of series
 *          @param {string} options.series.stacked stacked type
 *          @param {boolean} options.series.showLabel whether show label or not
 *          @param {number} options.series.barWidth bar width
 *          @param {boolean} options.series.hasSelection whether has selection or not
 *          @param {boolean} options.series.diverging whether diverging or not
 *      @param {object} options.tooltip options of tooltip
 *          @param {string} options.tooltip.suffix suffix of tooltip
 *          @param {function} [options.tooltip.template] template of tooltip
 *          @param {string} options.tooltip.align tooltip align option
 *          @param {object} options.tooltip.position relative position
 *              @param {number} options.tooltip.position.left position left
 *              @param {number} options.tooltip.position.top position top
 *          @param {boolean} options.tooltip.grouped whether group tooltip or not
 *      @param {object} options.legend options of legend
 *          @param {string} options.legend.align legend align (top|bottom|left)
 *          @param {boolean} options.legend.hasCheckbox whether has checkbox or not (default: true)
 *          @param {boolean} options.legend.hidden whether hidden or not
 *      @param {string} options.theme theme name
 *      @param {string} options.libType graph library type
 * @returns {object} bar chart
 * @api
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
 * tui.chart.barChart(container, data, options);
 */
tui.chart.barChart = function(container, data, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_BAR;
    return _createChart(container, data, options);
};

/**
 * Column chart creator.
 * @memberOf tui.chart
 * @param {HTMLElement} container chart container
 * @param {object} data chart data
 *      @param {Array.<string>} data.categories categories
 *      @param {Array.<Array>} data.series series data
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
 *          @param {number} options.xAxis.labelInterval label interval of horizontal axis
 *          @param {boolean} options.xAxis.rotation whether label rotation or not (default: true)
 *      @param {object} options.series options of series
 *          @param {string} options.series.stacked stacked type
 *          @param {boolean} options.series.showLabel whether show label or not
 *          @param {number} options.series.barWidth bar width
 *          @param {boolean} options.series.hasSelection whether has selection or not
 *          @param {boolean} options.series.diverging whether diverging or not
 *      @param {object} options.tooltip options of tooltip
 *          @param {string} options.tooltip.suffix suffix of tooltip
 *          @param {function} [options.tooltip.template] template of tooltip
 *          @param {string} options.tooltip.align tooltip align option
 *          @param {object} options.tooltip.position relative position
 *              @param {number} options.tooltip.position.left position left
 *              @param {number} options.tooltip.position.top position top
 *          @param {boolean} options.tooltip.grouped whether group tooltip or not
 *      @param {object} options.legend options of legend
 *          @param {string} options.legend.align legend align (top|bottom|left)
 *          @param {boolean} options.legend.hasCheckbox whether has checkbox or not (default: true)
 *          @param {boolean} options.legend.hidden whether hidden or not
 *      @param {string} options.theme theme name
 *      @param {string} options.libType graph library type
 * @returns {object} column chart
 * @api
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
 * tui.chart.columnChart(container, data, options);
 */
tui.chart.columnChart = function(container, data, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_COLUMN;
    return _createChart(container, data, options);
};

/**
 * Line chart creator.
 * @memberOf tui.chart
 * @param {HTMLElement} container chart container
 * @param {object} data chart data
 *      @param {Array.<string>} data.categories categories
 *      @param {Array.<Array>} data.series series data
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
 *          @param {number} options.xAxis.labelInterval label interval of horizontal axis
 *          @param {boolean} options.xAxis.rotation whether label rotation or not (default: true)
 *      @param {object} options.series options of series
 *          @param {boolean} options.series.hasDot whether has dot or not
 *          @param {boolean} options.series.showLabel whether show label or not
 *          @param {boolean} options.series.hasSelection whether has selection or not
 *          @param {boolean} options.series.spline whether spline or not
 *      @param {object} options.tooltip options of tooltip
 *          @param {string} options.tooltip.suffix suffix of tooltip
 *          @param {function} [options.tooltip.template] template of tooltip
 *          @param {string} options.tooltip.align tooltip align option
 *          @param {object} options.tooltip.position relative position
 *              @param {number} options.tooltip.position.left position left
 *              @param {number} options.tooltip.position.top position top
 *          @param {boolean} options.tooltip.grouped whether group tooltip or not
 *      @param {object} options.legend options of legend
 *          @param {string} options.legend.align legend align (top|bottom|left)
 *          @param {boolean} options.legend.hasCheckbox whether has checkbox or not (default: true)
 *          @param {boolean} options.legend.hidden whether hidden or not
 *      @param {string} options.theme theme name
 *      @param {string} options.libType graph library type
 * @returns {object} bar chart
 * @api
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
 * tui.chart.lineChart(container, data, options);
 */
tui.chart.lineChart = function(container, data, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_LINE;
    return _createChart(container, data, options);
};

/**
 * Area chart creator.
 * @memberOf tui.chart
 * @param {HTMLElement} container chart container
 * @param {object} data chart data
 *      @param {Array.<string>} data.categories categories
 *      @param {Array.<Array>} data.series series data
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
 *          @param {number} options.xAxis.labelInterval label interval of horizontal axis
 *          @param {boolean} options.xAxis.rotation whether label rotation or not (default: true)
 *      @param {object} options.series options of series
 *          @param {boolean} options.series.hasDot whether has dot or not
 *          @param {boolean} options.series.showLabel whether show label or not
 *          @param {boolean} options.series.hasSelection whether has selection or not
 *          @param {boolean} options.series.spline whether spline or not
 *      @param {object} options.tooltip options of tooltip
 *          @param {string} options.tooltip.suffix suffix of tooltip
 *          @param {function} [options.tooltip.template] template of tooltip
 *          @param {string} options.tooltip.align tooltip align option
 *          @param {object} options.tooltip.position relative position
 *              @param {number} options.tooltip.position.left position left
 *              @param {number} options.tooltip.position.top position top
 *          @param {boolean} options.tooltip.grouped whether group tooltip or not
 *      @param {object} options.legend options of legend
 *          @param {string} options.legend.align legend align (top|bottom|left)
 *          @param {boolean} options.legend.hasCheckbox whether has checkbox or not (default: true)
 *          @param {boolean} options.legend.hidden whether hidden or not
 *      @param {string} options.theme theme name
 *      @param {string} options.libType graph library type
 * @returns {object} bar chart
 * @api
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
 * tui.chart.areaChart(container, data, options);
 */
tui.chart.areaChart = function(container, data, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_AREA;
    return _createChart(container, data, options);
};

/**
 * Combo chart creator.
 * @memberOf tui.chart
 * @param {HTMLElement} container chart container
 * @param {object} data chart data
 *      @param {Array.<string>} data.categories categories
 *      @param {Array.<Array>} data.series series data
 * @param {object} options chart options
 *      @param {object} options.chart chart options
 *          @param {number} options.chart.width chart width
 *          @param {number} options.chart.height chart height
 *          @param {string} options.chart.title chart title
 *          @param {string} options.chart.format value format
 *      @param {object|Array} options.yAxis options of vertical axis
 *          @param {string} options.yAxis.title title of vertical axis
 *          @param {number} options.yAxis.min minimal value of vertical axis
 *          @param {number} options.yAxis.max maximum value of vertical axis
 *      @param {object} options.xAxis options of horizontal axis
 *          @param {string} options.xAxis.title title of horizontal axis
 *          @param {number} options.xAxis.labelInterval label interval of horizontal axis
 *          @param {boolean} options.xAxis.rotation whether label rotation or not (default: true)
 *      @param {object} options.series options of series
 *          @param {object} options.series.column options of column series
 *              @param {string} options.series.column.stacked stacked type
 *              @param {boolean} options.series.column.showLabel whether show label or not
 *              @param {number} options.series.column.barWidth bar width
 *              @param {boolean} options.series.column.hasSelection whether has selection or not
 *          @param {object} options.series.line options of line series
 *              @param {boolean} options.series.line.hasDot whether has dot or not
 *              @param {boolean} options.series.line.showLabel whether show label or not
 *              @param {boolean} options.series.line.hasSelection whether has selection or not
 *              @param {boolean} options.series.line.spline whether spline or not
 *      @param {object} options.tooltip options of tooltip
 *          @param {object} options.tooltip.column options of column tooltip
 *              @param {string} options.tooltip.column.suffix suffix of tooltip
 *              @param {function} [options.tooltip.column.template] template of tooltip
 *              @param {string} options.tooltip.column.align tooltip align option
 *              @param {object} options.tooltip.column.position relative position
 *                  @param {number} options.tooltip.column.position.left position left
 *                  @param {number} options.tooltip.column.position.top position top
 *          @param {boolean} options.tooltip.grouped whether group tooltip or not
 *      @param {object} options.legend options of legend
 *          @param {string} options.legend.align legend align (top|bottom|left)
 *          @param {boolean} options.legend.hasCheckbox whether has checkbox or not (default: true)
 *          @param {boolean} options.legend.hidden whether hidden or not
 *      @param {string} options.theme theme name
 *      @param {string} options.libType graph library type
 * @returns {object} bar chart
 * @api
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
 * tui.chart.comboChart(container, data, options);
 */
tui.chart.comboChart = function(container, data, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_COMBO;
    return _createChart(container, data, options);
};

/**
 * Pie chart creator.
 * @memberOf tui.chart
 * @param {HTMLElement} container chart container
 * @param {object} data chart data
 *      @param {Array.<Array>} data.series series data
 * @param {object} options chart options
 *      @param {object} options.chart chart options
 *          @param {number} options.chart.width chart width
 *          @param {number} options.chart.height chart height
 *          @param {string} options.chart.title chart title
 *          @param {string} options.chart.format value format
 *      @param {object} options.series options of series
 *          @param {boolean} options.series.showLabel whether show label or not
 *          @param {boolean} options.series.hasSelection whether has selection or not
 *      @param {object} options.tooltip options of tooltip
 *          @param {string} options.tooltip.suffix suffix of tooltip
 *          @param {function} [options.tooltip.template] template of tooltip
 *          @param {string} options.tooltip.align tooltip align option
 *          @param {object} options.tooltip.position relative position
 *              @param {number} options.tooltip.position.left position left
 *              @param {number} options.tooltip.position.top position top
 *      @param {object} options.legend options of legend
 *          @param {string} options.legend.align legend align (top|bottom|left|center|outer)
 *          @param {boolean} options.legend.hasCheckbox whether has checkbox or not (default: true)
 *          @param {boolean} options.legend.hidden whether hidden or not
 *      @param {string} options.theme theme name
 *      @param {string} options.libType graph library type
 * @returns {object} bar chart
 * @api
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
 * tui.chart.pieChart(container, data, options);
 */
tui.chart.pieChart = function(container, data, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_PIE;
    return _createChart(container, data, options);
};

/**
 * Map chart creator.
 * @memberOf tui.chart
 * @param {HTMLElement} container chart container
 * @param {object} data chart data
 *      @param {Array.<Array>} data.series series data
 * @param {object} options chart options
 *      @param {object} options.chart chart options
 *          @param {number} options.chart.width chart width
 *          @param {number} options.chart.height chart height
 *          @param {string} options.chart.title chart title
 *          @param {string} options.chart.format value format
 *      @param {object} options.series options of series
 *          @param {boolean} options.series.showLabel whether show label or not
 *      @param {object} options.tooltip options of tooltip
 *          @param {function} [options.tooltip.template] template of tooltip
 *          @param {string} options.tooltip.align tooltip align option
 *          @param {object} options.tooltip.position relative position
 *              @param {number} options.tooltip.position.left position left
 *              @param {number} options.tooltip.position.top position top
 *      @param {object} options.legend options of legend
 *          @param {string} options.legend.align legend align (top|bottom|left|center|outer)
 *      @param {string} options.theme theme name
 *      @param {string} options.map map type
 *      @param {string} options.libType graph library type
 * @returns {object} bar chart
 * @api
 * @example
 * var container = document.getElementById('container-id'),
 *     data = {
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
 * tui.chart.mapChart(container, data, options);
 */
tui.chart.mapChart = function(container, data, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_MAP;
    options.map = mapFactory.get(options.map);

    return _createChart(container, data, options);
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
 * @param {{width: number, height: number}} dimension map dimension
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
