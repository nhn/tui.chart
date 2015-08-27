(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * @fileoverview  Axis component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var dom = require('../helpers/domHandler.js'),
    calculator = require('../helpers/calculator.js'),
    renderUtil = require('../helpers/renderUtil.js'),
    axisTemplate = require('./axisTemplate.js');

var TITLE_AREA_WIDTH_PADDING = 20,
    V_LABEL_RIGHT_PADDING = 10;

var Axis = ne.util.defineClass(/** @lends Axis.prototype */ {
    /**
     * Axis component.
     * @constructs Axis
     * @param {object} params parameters
     *      @param {{
     *          labels: array.<string>,
     *          tickCount: number,
     *          isLabelAxis: boolean,
     *          isVertical: boolean
     *      }} params.data axis data
     *      @param {object} params.bound axis bound
     *      @param {object} params.theme axis theme
     *      @param {object} params.options axis options
     */
    init: function(params) {
        ne.util.extend(this, params);
        /**
         * Axis view className
         */
        this.className = 'ne-chart-axis-area';
    },

    /**
     * Render axis.
     * @returns {HTMLElement} axis area base element
     */
    render: function() {
        var data = this.data,
            theme = this.theme,
            isVertical = !!data.isVertical,
            isPositionRight = data.isPositionRight,
            options = this.options,
            bound = this.bound,
            dimension = bound.dimension,
            size = isVertical ? dimension.height : dimension.width,
            el = dom.create('DIV', this.className),
            elTitleArea = this._renderTitleArea({
                title: options.title,
                theme: theme.title,
                isVertical: isVertical,
                isPositionRight: isPositionRight,
                size: size
            }),
            elTickArea = this._renderTickArea(size),
            elLabelArea = this._renderLabelArea(size, dimension.width);
        renderUtil.renderDimension(el, dimension);
        renderUtil.renderPosition(el, bound.position);
        dom.addClass(el, isVertical ? 'vertical' : 'horizontal');
        dom.addClass(el, isPositionRight ? 'right' : '');
        dom.append(el, [elTitleArea, elTickArea, elLabelArea]);

        return el;
    },

    /**
     * Title area renderer
     * @param {object} params parameters
     *      @param {string} params.title axis title
     *      @param {object} params.theme title theme
     *      @param {boolean} params.isVertical is vertical?
     *      @param {number} params.size (width or height)
     * @returns {HTMLElement} title element
     * @private
     */
    _renderTitleArea: function(params) {
        var elTitleArea = renderUtil.renderTitle(params.title, params.theme, 'ne-chart-title-area'),
            cssTexts = [];

        if (elTitleArea && params.isVertical) {
            cssTexts = [
                renderUtil.concatStr('width:', params.size, 'px')
            ];
            if (params.isPositionRight) {
                cssTexts.push(renderUtil.concatStr('right:', -params.size, 'px'));
                cssTexts.push(renderUtil.concatStr('top:', 0, 'px'));
            } else {
                cssTexts.push(renderUtil.concatStr('left:', 0, 'px'));
                if (!renderUtil.isIE8()) {
                    cssTexts.push(renderUtil.concatStr('top:', params.size, 'px'));
                }
            }

            elTitleArea.style.cssText += ';' + cssTexts.join(';');
        }
        return elTitleArea;
    },

    /**
     * Redner tick area.
     * @param {number} size size or height
     * @returns {HTMLElement} tick area element
     * @private
     */
    _renderTickArea: function(size) {
        var data = this.data,
            tickCount = data.tickCount,
            tickColor = this.theme.tickColor,
            positions = calculator.makePixelPositions(size, tickCount),
            elTickArea = dom.create('DIV', 'ne-chart-tick-area'),
            isVertical = data.isVertical,
            posType = isVertical ? 'bottom' : 'left',
            borderColorType = isVertical ? (data.isPositionRight ? 'borderLeftColor' : 'borderRightColor') : 'borderTopColor',
            template = axisTemplate.TPL_AXIS_TICK,
            ticksHtml = ne.util.map(positions, function(position) {
                var cssText = [
                    renderUtil.concatStr('background-color:', tickColor),
                    renderUtil.concatStr(posType, ': ', position, 'px')
                ].join(';');
                return template({cssText: cssText});
            }, this).join('');

        elTickArea.innerHTML = ticksHtml;
        elTickArea.style[borderColorType] = tickColor;

        return elTickArea;
    },

    /**
     * Render label area.
     * @param {number} size label area size
     * @param {number} axisWidth axis area width
     * @returns {HTMLElement} label area element
     * @private
     */
    _renderLabelArea: function(size, axisWidth) {
        var data = this.data,
            theme = this.theme,
            positions = calculator.makePixelPositions(size, data.tickCount),
            labelWidth = positions[1] - positions[0],
            labels = data.labels,
            isVertical = data.isVertical,
            isLabelAxis = data.isLabelAxis,
            posType = 'left',
            cssTexts = this._makeLabelCssTexts({
                isVertical: isVertical,
                isLabelAxis: isLabelAxis,
                labelWidth: labelWidth
            }),
            elLabelArea = dom.create('DIV', 'ne-chart-label-area'),
            areaCssText = renderUtil.makeFontCssText(theme.label),
            labelsHtml, titleAreaWidth;

        if (isVertical) {
            posType = isLabelAxis ? 'top' : 'bottom';
            titleAreaWidth = this._getRenderedTitleHeight() + TITLE_AREA_WIDTH_PADDING;
            areaCssText += ';width:' + (axisWidth - titleAreaWidth + V_LABEL_RIGHT_PADDING) + 'px';
        }

        positions.length = labels.length;

        labelsHtml = this._makeLabelsHtml({
            positions: positions,
            labels: labels,
            posType: posType,
            cssTexts: cssTexts
        });

        elLabelArea.innerHTML = labelsHtml;
        elLabelArea.style.cssText = areaCssText;

        this._changeLabelAreaPosition({
            elLabelArea: elLabelArea,
            isVertical: isVertical,
            isLabelAxis: isLabelAxis,
            theme: theme.label,
            labelWidth: labelWidth
        });

        return elLabelArea;
    },

    /**
     * Get height of title area ;
     * @returns {number} height
     * @private
     */
    _getRenderedTitleHeight: function() {
        var title = this.options.title,
            theme = this.theme.title,
            result = title ? renderUtil.getRenderedLabelHeight(title, theme) : 0;
        return result;
    },

    /**
     * To make cssTexts of label.
     * @param {object} params parameter
     *      @param {boolean} params.isVertical whether vertical or not
     *      @param {boolean} params.isLabelAxis whether label axis or not
     *      @param {number} params.labelWidth label width or height
     * @returns {string[]} cssTexts
     * @private
     */
    _makeLabelCssTexts: function(params) {
        var cssTexts = [];

        if (params.isVertical && params.isLabelAxis) {
            cssTexts.push(renderUtil.concatStr('height:', params.labelWidth, 'px'));
            cssTexts.push(renderUtil.concatStr('line-height:', params.labelWidth, 'px'));
        } else if (!params.isVertical) {
            cssTexts.push(renderUtil.concatStr('width:', params.labelWidth, 'px'));
        }

        return cssTexts;
    },

    /**
     * To make html of label.
     * @param {object} params parameters
     *      @param {array.<object>} params.positions label position array
     *      @param {string[]} params.labels label array
     *      @param {string} params.posType position type (left or bottom)
     *      @param {string[]} params.cssTexts css array
     * @returns {string} html
     * @private
     */
    _makeLabelsHtml: function(params) {
        var template = axisTemplate.TPL_AXIS_LABEL,
            labelsHtml = ne.util.map(params.positions, function(position, index) {
                var labelCssTexts = params.cssTexts.slice(),
                    html;

                labelCssTexts.push(renderUtil.concatStr(params.posType, ':', position, 'px'));
                html = template({
                    cssText: labelCssTexts.join(';'),
                    label: params.labels[index]
                });
                return html;
            }, this).join('');

        return labelsHtml;
    },

    /**
     * Change position of label area.
     * @param {object} params parameter
     *      @param {HTMLElement} params.elLabelArea label area element
     *      @param {boolean} params.isVertical whether vertical or not
     *      @param {boolean} params.isLabelAxis whether label axis or not
     *      @param {{fontSize: number, fontFamily: string, color: string}} params.theme label theme
     *      @param {number} params.labelWidth label width or height
     * @private
     */
    _changeLabelAreaPosition: function(params) {
        var labelHeight;

        if (params.isLabelAxis) {
            return;
        }

        if (params.isVertical) {
            labelHeight = renderUtil.getRenderedLabelHeight('ABC', params.theme);
            params.elLabelArea.style.top = renderUtil.concatStr(parseInt(labelHeight / 2, 10), 'px');
        } else {
            params.elLabelArea.style.left = renderUtil.concatStr('-', parseInt(params.labelWidth / 2, 10), 'px');
        }
    }
});

module.exports = Axis;

},{"../helpers/calculator.js":18,"../helpers/domHandler.js":20,"../helpers/renderUtil.js":22,"./axisTemplate.js":2}],2:[function(require,module,exports){
/**
 * @fileoverview This is templates or axis view.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

var templateMaker = require('../helpers/templateMaker.js');

var tags = {
    HTML_AXIS_TICK: '<div class="ne-chart-tick" style="{{ cssText }}"></div>',
    HTML_AXIS_LABEL: '<div class="ne-chart-label" style="{{ cssText }}">{{ label }}</div>'
};

module.exports = {
    TPL_AXIS_TICK: templateMaker.template(tags.HTML_AXIS_TICK),
    TPL_AXIS_LABEL: templateMaker.template(tags.HTML_AXIS_LABEL)
};

},{"../helpers/templateMaker.js":23}],3:[function(require,module,exports){
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
 *          @param {object} options.series.line options of line series
 *              @param {boolean} options.series.line.hasDot whether has dot or not
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

},{"./code-snippet-util.js":11,"./const.js":12,"./factories/chartFactory.js":13,"./factories/pluginFactory.js":14,"./factories/themeFactory.js":15,"./registerCharts.js":32,"./registerThemes.js":33}],4:[function(require,module,exports){
/**
 * @fileoverview AxisBase
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase.js'),
    Axis = require('../axes/axis.js'),
    Plot = require('../plots/plot.js'),
    Legend = require('../legends/legend.js'),
    Tooltip = require('../tooltips/tooltip.js');

var AxisTypeBase = ne.util.defineClass(ChartBase, /** @lends AxisTypeBase.prototype */ {
    /**
     * Axis type chart base
     * @constructs AxisTypeBase
     * @extends ChartBase
     */
    init: function() {
        var args = [].slice.call(arguments);
        ChartBase.apply(this, args);
    },

    /**
     * Add axis components
     * @param {object} params parameters
     *      @param {object} params.covertData converted data
     *      @param {object} params.axes axes data
     *      @param {object} params.plotData plot data
     *      @param {function} params.Series series class
     */
    addAxisComponents: function(params) {
        var convertData = params.convertData;

        if (params.plotData) {
            this.addComponent('plot', Plot, params.plotData);
        }

        ne.util.forEach(params.axes, function(data, name) {
            this.addComponent(name, Axis, {
                data: data
            });
        }, this);

        if (convertData.joinLegendLabels) {
            this.addComponent('legend', Legend, {
                joinLegendLabels: convertData.joinLegendLabels,
                legendLabels: convertData.legendLabels,
                chartType: params.chartType
            });
        }

        this.addComponent('tooltip', Tooltip, {
            values: convertData.formattedValues,
            labels: convertData.labels,
            legendLabels: convertData.legendLabels,
            prefix: this.tooltipPrefix
        });
    }
});

module.exports = AxisTypeBase;

},{"../axes/axis.js":1,"../legends/legend.js":24,"../plots/plot.js":26,"../tooltips/tooltip.js":40,"./chartBase.js":6}],5:[function(require,module,exports){
/**
 * @fileoverview Bar chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var AxisTypeBase = require('./axisTypeBase.js'),
    axisDataMaker = require('../helpers/axisDataMaker.js'),
    Series = require('../series/barChartSeries.js');

var BarChart = ne.util.defineClass(AxisTypeBase, /** @lends BarChart.prototype */ {
    /**
     * Bar chart.
     * @constructs BarChart
     * @extends AxisTypeBase
     * @param {array.<array>} userData chart data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(userData, theme, options) {
        var baseData = this.makeBaseData(userData, theme, options, {
                hasAxes: true
            }),
            convertData = baseData.convertData,
            bounds = baseData.bounds,
            axisData;

        this.className = 'ne-bar-chart';

        AxisTypeBase.call(this, bounds, theme, options);

        axisData = this._makeAxesData(convertData, bounds, options);
        this._addComponents(convertData, axisData, options);
    },

    /**
     * To make axes data
     * @param {object} convertData converted data
     * @param {object} bounds chart bounds
     * @param {object} options chart options
     * @returns {object} axes data
     * @private
     */
    _makeAxesData: function(convertData, bounds, options) {
        var axesData = {
            yAxis: axisDataMaker.makeLabelAxisData({
                labels: convertData.labels,
                isVertical: true
            }),
            xAxis: axisDataMaker.makeValueAxisData({
                values: convertData.values,
                seriesDimension: bounds.series.dimension,
                stacked: options.series && options.series.stacked || '',
                chartType: options.chartType,
                formatFunctions: convertData.formatFunctions,
                options: options.xAxis
            })
        };
        return axesData;
    },

    /**
     * Add components
     * @param {object} convertData converted data
     * @param {object} axesData axes data
     * @param {object} options chart options
     * @private
     */
    _addComponents: function(convertData, axesData, options) {
        this.addAxisComponents({
            convertData: convertData,
            axes: axesData,
            plotData: {
                vTickCount: axesData.yAxis.validTickCount,
                hTickCount: axesData.xAxis.validTickCount
            },
            chartType: options.chartType
        });

        this.addComponent('series', Series, {
            libType: options.libType,
            chartType: options.chartType,
            tooltipPrefix: this.tooltipPrefix,
            data: {
                values: convertData.values,
                formattedValues: convertData.formattedValues,
                scale: axesData.xAxis.scale
            }
        });
    }
});

module.exports = BarChart;

},{"../helpers/axisDataMaker.js":16,"../series/barChartSeries.js":34,"./axisTypeBase.js":4}],6:[function(require,module,exports){
/**
 * @fileoverview ChartBase
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var dom = require('../helpers/domHandler.js'),
    renderUtil = require('../helpers/renderUtil.js'),
    dataConverter = require('../helpers/dataConverter.js'),
    boundsMaker = require('../helpers/boundsMaker.js');

var TOOLTIP_PREFIX = 'ne-chart-tooltip-';

var ChartBase = ne.util.defineClass(/** @lends ChartBase.prototype */ {
    tooltipPrefix: TOOLTIP_PREFIX + (new Date()).getTime() + '-',

    /**
     * Chart base.
     * @constructs ChartBase
     * @param {object} bounds chart bounds
     * @param {object} theme chart theme
     * @param {object} options chart options
     * @param {object} initedData initialized data from combo chart
     */
    init: function(bounds, theme, options, initedData) {
        this.components = [];
        this.componentMap = {};
        this.bounds = bounds;
        this.theme = theme;
        this.options = options;
        if (initedData && initedData.prefix) {
            this.tooltipPrefix += initedData.prefix;
        }
    },

    /**
     * To make baes data.
     * @param {array | object} userData user data
     * @param {object} theme chart theme
     * @param {object} options chart options
     * @param {object} boundParams add bound params
     * @returns {{convertData: object, bounds: object}} base data
     */
    makeBaseData: function(userData, theme, options, boundParams) {
        var convertData = dataConverter.convert(userData, options.chart, options.chartType, boundParams && boundParams.yAxisChartTypes),
            bounds = boundsMaker.make(ne.util.extend({
                convertData: convertData,
                theme: theme,
                options: options
            }, boundParams));

        return {
            convertData: convertData,
            bounds: bounds
        };
    },

    /**
     * Add component.
     * @param {string} name component name
     * @param {function} Component component function
     * @param {object} params parameters
     */
    addComponent: function(name, Component, params) {
        var bound = this.bounds[name],
            theme = this.theme[name],
            options = this.options[name],
            index = params.index || 0,
            commonParams = {},
            component;

        commonParams.bound = ne.util.isArray(bound) ? bound[index] : bound;
        commonParams.theme = ne.util.isArray(theme) ? theme[index] : theme;
        commonParams.options = ne.util.isArray(options) ? options[index] : options || {};

        params = ne.util.extend(commonParams, params);
        component = new Component(params);
        this.components.push(component);
        this.componentMap[name] = component;
    },

    /**
     * Render chart.
     * @param {HTMLElement} el chart element
     * @param {object} paper object for graph drawing
     * @returns {HTMLElement} chart element
     */
    render: function(el, paper) {
        if (!el) {
            el = dom.create('DIV', this.className);

            dom.addClass(el, 'ne-chart');
            this._renderTitle(el);
            renderUtil.renderDimension(el, this.bounds.chart.dimension);
            renderUtil.renderBackground(el, this.theme.chart.background);
        }

        this._renderComponents(el, this.components, paper);
        this._attachCustomEvent();
        return el;
    },

    /**
     * Render title.
     * @param {HTMLElement} el target element
     * @private
     */
    _renderTitle: function(el) {
        var chartOptions = this.options.chart || {},
            elTitle = renderUtil.renderTitle(chartOptions.title, this.theme.title, 'ne-chart-title');
        dom.append(el, elTitle);
    },

    /**
     * Render components.
     * @param {HTMLElement} container container element
     * @param {array.<object>} components components
     * @param {object} paper object for graph drawing
     * @private
     */
    _renderComponents: function(container, components, paper) {
        var elements = ne.util.map(components, function(component) {
            return component.render(paper);
        });
        dom.append(container, elements);
    },

    /**
     * Get paper.
     * @returns {object} paper
     */
    getPaper: function() {
        var series = this.componentMap.series,
            paper;

        if (series) {
            paper = series.getPaper();
        }

        return paper;
    },

    /**
     * Attach custom event
     * @private
     */
    _attachCustomEvent: function() {
        var tooltip = this.componentMap.tooltip,
            series = this.componentMap.series;
        if (!tooltip || !series) {
            return;
        }
        series.on('showTooltip', tooltip.onShow, tooltip);
        series.on('hideTooltip', tooltip.onHide, tooltip);

        if (!series.onShowAnimation) {
            return;
        }

        tooltip.on('showAnimation', series.onShowAnimation, series);
        tooltip.on('hideAnimation', series.onHideAnimation, series);
    }
});

module.exports = ChartBase;

},{"../helpers/boundsMaker.js":17,"../helpers/dataConverter.js":19,"../helpers/domHandler.js":20,"../helpers/renderUtil.js":22}],7:[function(require,module,exports){
/**
 * @fileoverview Column chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var AxisTypeBase = require('./axisTypeBase.js'),
    axisDataMaker = require('../helpers/axisDataMaker.js'),
    Series = require('../series/columnChartSeries.js');

var ColumnChart = ne.util.defineClass(AxisTypeBase, /** @lends ColumnChart.prototype */ {
    /**
     * Column chart.
     * @constructs ColumnChart
     * @extends AxisTypeBase
     * @param {array.<array>} userData chart data
     * @param {object} theme chart theme
     * @param {object} options chart options
     * @param {object} initedData initialized data from combo chart
     */
    init: function(userData, theme, options, initedData) {
        var baseData = initedData || this.makeBaseData(userData, theme, options, {
                isVertical: true,
                hasAxes: true
            }),
            convertData = baseData.convertData,
            bounds = baseData.bounds,
            axisData;

        this.className = 'ne-column-chart';

        AxisTypeBase.call(this, bounds, theme, options, initedData);

        axisData = this._makeAxesData(convertData, bounds, options, initedData);
        this._addComponents(convertData, axisData, options);
    },

    /**
     * To make axes data
     * @param {object} convertData converted data
     * @param {object} bounds chart bounds
     * @param {object} options chart options
     * @param {object} initedData initialized data from combo chart
     * @returns {object} axes data
     * @private
     */
    _makeAxesData: function(convertData, bounds, options, initedData) {
        var axesData = {};
        if (initedData) {
            axesData = initedData.axes;
        } else {
            axesData = {
                yAxis: axisDataMaker.makeValueAxisData({
                    values: convertData.values,
                    seriesDimension: bounds.series.dimension,
                    stacked: options.series && options.series.stacked || '',
                    chartType: options.chartType,
                    formatFunctions: convertData.formatFunctions,
                    options: options.yAxis,
                    isVertical: true
                }),
                xAxis: axisDataMaker.makeLabelAxisData({
                    labels: convertData.labels
                })
            };
        }
        return axesData;
    },

    /**
     * Add components
     * @param {object} convertData converted data
     * @param {object} axesData axes data
     * @param {object} options chart options
     * @private
     */
    _addComponents: function(convertData, axesData, options) {
        this.addAxisComponents({
            convertData: convertData,
            axes: axesData,
            plotData: !ne.util.isUndefined(convertData.plotData) ? convertData.plotData : {
                vTickCount: axesData.yAxis.validTickCount,
                hTickCount: axesData.xAxis.validTickCount
            },
            chartType: options.chartType
        });

        this.addComponent('series', Series, {
            libType: options.libType,
            chartType: options.chartType,
            tooltipPrefix: this.tooltipPrefix,
            isPointPosition: true,
            data: {
                values: convertData.values,
                formattedValues: convertData.formattedValues,
                scale: axesData.yAxis.scale
            }
        });
    }
});

module.exports = ColumnChart;

},{"../helpers/axisDataMaker.js":16,"../series/columnChartSeries.js":35,"./axisTypeBase.js":4}],8:[function(require,module,exports){
/**
 * @fileoverview Combo chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var calculator = require('../helpers/calculator.js'),
    ChartBase = require('./chartBase.js'),
    axisDataMaker = require('../helpers/axisDataMaker.js'),
    defaultTheme = require('../themes/defaultTheme.js'),
    ColumnChart = require('./columnChart'),
    LineChart = require('./lineChart');

var ComboChart = ne.util.defineClass(ChartBase, /** @lends ComboChart.prototype */ {
    /**
     * Combo chart.
     * @constructs ComboChart
     * @extends ChartBase
     * @param {array.<array>} userData chart data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(userData, theme, options) {
        var seriesChartTypes = ne.util.keys(userData.series).sort(),
            yAxisChartTypes = this._getYAxisChartTypes(seriesChartTypes, options.yAxis),
            chartTypes = yAxisChartTypes.length ? yAxisChartTypes : seriesChartTypes,
            isOneYAxis = !yAxisChartTypes.length,
            baseData = this.makeBaseData(userData, theme, options, {
                isVertical: true,
                hasAxes: true,
                yAxisChartTypes: yAxisChartTypes
            }),
            convertData = baseData.convertData,
            bounds = baseData.bounds,
            seriesDimension = bounds.series.dimension,
            axesData = {},
            baseAxesData = {},
            yAxisParams;

        this.className = 'ne-combo-chart';

        yAxisParams = {
            convertData: convertData,
            seriesDimension: seriesDimension,
            chartTypes: chartTypes,
            isOneYAxis: isOneYAxis,
            options: options
        };

        ChartBase.call(this, bounds, theme, options);

        baseAxesData.yAxis = this._makeYAxisData(ne.util.extend({
            index: 0
        }, yAxisParams));

        baseAxesData.xAxis = axisDataMaker.makeLabelAxisData({
            labels: convertData.labels
        });

        axesData = this._makeAxesData(baseAxesData, yAxisParams);

        this._installCharts({
            userData: userData,
            theme: theme,
            options: options,
            baseData: baseData,
            baseAxesData: baseAxesData,
            axesData: axesData,
            seriesChartTypes: seriesChartTypes,
            chartTypes: chartTypes
        });
    },

    /**
     * Get y axis chart types.
     * @param {array.<string>} chartTypes chart types
     * @param {object} yAxisOptions y axis options
     * @returns {array.<string>} chart types
     * @private
     */
    _getYAxisChartTypes: function(chartTypes, yAxisOptions) {
        var resultChartTypes = chartTypes.slice(),
            isReverse = false,
            optionChartTypes;

        yAxisOptions = yAxisOptions ? [].concat(yAxisOptions) : [];

        if (yAxisOptions.length === 1 && !yAxisOptions[0].chartType) {
            resultChartTypes = [];
        } else if (yAxisOptions.length) {
            optionChartTypes = ne.util.map(yAxisOptions, function(option) {
                return option.chartType;
            });

            ne.util.forEachArray(optionChartTypes, function(chartType, index) {
                isReverse = isReverse || (chartType && resultChartTypes[index] !== chartType || false);
            });

            if (isReverse) {
                resultChartTypes.reverse();
            }
        }

        return resultChartTypes;
    },

    /**
     * To make y axis data.
     * @param {object} params parameters
     *      @param {number} params.index chart index
     *      @param {object} params.convertData converted data
     *      @param {{width: number, height: number}} params.seriesDimension series dimension
     *      @param {array.<string>} chartTypes chart type
     *      @param {boolean} isOneYAxis whether one series or not
     *      @param {object} options chart options
     *      @param {object} addParams add params
     * @returns {object} y axis data
     * @private
     */
    _makeYAxisData: function(params) {
        var convertData = params.convertData,
            index = params.index,
            chartType = params.chartTypes[index],
            options = params.options,
            yAxisValues, yAxisOptions, seriesOption;

        if (params.isOneYAxis) {
            yAxisValues = convertData.joinValues;
            yAxisOptions = [options.yAxis];
        } else {
            yAxisValues = convertData.values[chartType];
            yAxisOptions = options.yAxis || [];
        }

        seriesOption = options.series && options.series[chartType] || options.series;

        return axisDataMaker.makeValueAxisData(ne.util.extend({
            values: yAxisValues,
            stacked: seriesOption && seriesOption.stacked || '',
            options: yAxisOptions[index],
            chartType: chartType,
            seriesDimension: params.seriesDimension,
            formatFunctions: convertData.formatFunctions,
            isVertical: true
        }, params.addParams));
    },

    /**
     * To make axes data.
     * @param {{yAxis: object, xAxis: object}} baseAxesData base axes data
     * @param {object} yAxisParams y axis params
     * @returns {object} axes data
     * @private
     */
    _makeAxesData: function(baseAxesData, yAxisParams) {
        var yAxisData = baseAxesData.yAxis,
            chartTypes = yAxisParams.chartTypes,
            axesData = {},
            yrAxisData;
        if (!yAxisParams.isOneYAxis) {
            yrAxisData = this._makeYAxisData(ne.util.extend({
                index: 1,
                addParams: {
                    isPositionRight: true
                }
            }, yAxisParams));
            if (yAxisData.tickCount < yrAxisData.tickCount) {
                this._increaseYAxisScaleMax(yrAxisData, yAxisData);
            } else if (yAxisData.tickCount > yrAxisData.tickCount) {
                this._increaseYAxisScaleMax(yAxisData, yrAxisData);
            }
        }

        axesData[chartTypes[0]] = baseAxesData;
        axesData[chartTypes[1]] = {
            yAxis: yrAxisData || yAxisData
        };

        return axesData;
    },

    /**
     * To make order info abound chart type.
     * @param {array.<string>} chartTypes chart types
     * @returns {object} chart order info
     * @private
     */
    _makeChartTypeOrderInfo: function(chartTypes) {
        var result = {};
        ne.util.forEachArray(chartTypes, function(chartType, index) {
            result[chartType] = index;
        });
        return result;
    },

    /**
     * To make options map
     * @param {object} chartTypes chart types
     * @param {object} options chart options
     * @param {object} orderInfo chart order
     * @returns {object} options map
     * @private
     */
    _makeOptionsMap: function(chartTypes, options, orderInfo) {
        var result = {};
        ne.util.forEachArray(chartTypes, function(chartType) {
            var chartOptions = JSON.parse(JSON.stringify(options)),
                index = orderInfo[chartType];

            if (chartOptions.yAxis && chartOptions.yAxis[index]) {
                chartOptions.yAxis = chartOptions.yAxis[index];
            }

            if (chartOptions.series && chartOptions.series[chartType]) {
                chartOptions.series = chartOptions.series[chartType];
            }

            if (chartOptions.tooltip && chartOptions.tooltip[chartType]) {
                chartOptions.tooltip = chartOptions.tooltip[chartType];
            }
            chartOptions.chartType = chartType;
            result[chartType] = chartOptions;
        });
        return result;
    },

    /**
     * To make theme map
     * @param {object} chartTypes chart types
     * @param {object} theme chart theme
     * @param {object} legendLabels legend labels
     * @returns {object} theme map
     * @private
     */
    _makeThemeMap: function(chartTypes, theme, legendLabels) {
        var result = {},
            colorCount = 0;
        ne.util.forEachArray(chartTypes, function(chartType) {
            var chartTheme = JSON.parse(JSON.stringify(theme)),
                removedColors;

            if (chartTheme.yAxis[chartType]) {
                chartTheme.yAxis = chartTheme.yAxis[chartType];
            } else if (!chartTheme.yAxis.title) {
                chartTheme.yAxis = JSON.parse(JSON.stringify(defaultTheme.yAxis));
            }

            if (chartTheme.series[chartType]) {
                chartTheme.series = chartTheme.series[chartType];
            } else if (!chartTheme.series.colors) {
                chartTheme.series = JSON.parse(JSON.stringify(defaultTheme.series));
            } else {
                removedColors = chartTheme.series.colors.splice(0, colorCount);
                chartTheme.series.colors = chartTheme.series.colors.concat(removedColors);
                colorCount += legendLabels[chartType].length;
            }
            result[chartType] = chartTheme;
        });
        return result;
    },

    /**
     * Increase y axis scale max.
     * @param {object} fromData from tick info
     * @param {object} toData to tick info
     * @private
     */
    _increaseYAxisScaleMax: function(fromData, toData) {
        var diff = fromData.tickCount - toData.tickCount;
        toData.scale.max += toData.step * diff;
        toData.labels = calculator.makeLabelsFromScale(toData.scale, toData.step);
        toData.tickCount = fromData.tickCount;
        toData.validTickCount = fromData.tickCount;
    },

    /**
     * Install charts.
     * @param {object} params parameters
     *      @param {object} params.userData user data
     *      @param {object} params.baseData chart base data
     *      @param {object} params.theme chart theme
     *      @param {object} params.options chart options
     *      @param {{yAxis: object, xAxis: object}} params.baseAxesData base axes data
     *      @param {object} params.axesData axes data
     *      @param {array.<string>} params.seriesChartTypes series chart types
     *      @param {array.<string>} params.chartTypes chart types
     * @private
     */
    _installCharts: function(params) {
        var chartClasses = {
                column: ColumnChart,
                line: LineChart
            },
            baseData = params.baseData,
            convertData = baseData.convertData,
            formattedValues = convertData.formattedValues,
            baseAxesData = params.baseAxesData,
            chartTypes = params.chartTypes,
            seriesChartTypes = params.seriesChartTypes,
            orderInfo = this._makeChartTypeOrderInfo(chartTypes),
            remakeOptions = this._makeOptionsMap(chartTypes, params.options, orderInfo),
            remakeTheme = this._makeThemeMap(seriesChartTypes, params.theme, convertData.legendLabels),
            plotData = {
                vTickCount: baseAxesData.yAxis.validTickCount,
                hTickCount: baseAxesData.xAxis.validTickCount
            },
            joinLegendLabels = convertData.joinLegendLabels;

        this.charts = ne.util.map(seriesChartTypes, function(chartType) {
            var legendLabels = convertData.legendLabels[chartType],
                axes = params.axesData[chartType],
                sendOptions = remakeOptions[chartType],
                sendTheme = remakeTheme[chartType],
                sendBounds = JSON.parse(JSON.stringify(baseData.bounds)),
                chart;

            if (axes && axes.yAxis.isPositionRight) {
                sendBounds.yAxis = sendBounds.yrAxis;
            }
            chart = new chartClasses[chartType](params.userData, sendTheme, sendOptions, {
                convertData: {
                    values: convertData.values[chartType],
                    labels: convertData.labels,
                    formatFunctions: convertData.formatFunctions,
                    formattedValues: formattedValues[chartType],
                    legendLabels: legendLabels,
                    joinLegendLabels: joinLegendLabels,
                    plotData: plotData
                },
                bounds: sendBounds,
                axes: axes,
                prefix: chartType + '-'
            });
            plotData = null;
            joinLegendLabels = null;
            return chart;
        });
    },

    /**
     * Render combo chart.
     * @returns {HTMLElement} combo chart element
     */
    render: function() {
        var el = ChartBase.prototype.render.call(this);
        var paper;
        ne.util.forEachArray(this.charts, function(chart) {
            chart.render(el, paper);
            if (!paper) {
                paper = chart.getPaper();
            }
        });
        return el;
    }
});

module.exports = ComboChart;

},{"../helpers/axisDataMaker.js":16,"../helpers/calculator.js":18,"../themes/defaultTheme.js":39,"./chartBase.js":6,"./columnChart":7,"./lineChart":9}],9:[function(require,module,exports){
/**
 * @fileoverview Line chart
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var AxisTypeBase = require('./axisTypeBase.js'),
    calculator = require('../helpers/calculator.js'),
    axisDataMaker = require('../helpers/axisDataMaker.js'),
    Series = require('../series/lineChartSeries.js');

var LineChart = ne.util.defineClass(AxisTypeBase, /** @lends LineChart.prototype */ {
    /**
     * Line chart.
     * @constructs LineChart
     * @extends AxisTypeBase
     * @param {array.<array>} userData chart data
     * @param {object} theme chart theme
     * @param {object} options chart options
     * @param {object} initedData initialized data from combo chart
     */
    init: function(userData, theme, options, initedData) {
        var baseData = initedData || this.makeBaseData(userData, theme, options, {
                isVertical: true,
                hasAxes: true
            }),
            convertData = baseData.convertData,
            bounds = baseData.bounds,
            axisData;

        this.className = 'ne-line-chart';

        AxisTypeBase.call(this, bounds, theme, options, initedData);

        axisData = this._makeAxesData(convertData, bounds, options, initedData);
        this._addComponents(convertData, axisData, options);
    },

    /**
     * To make axes data
     * @param {object} convertData converted data
     * @param {object} bounds chart bounds
     * @param {object} options chart options
     * @param {object} initedData initialized data from combo chart
     * @returns {object} axes data
     * @private
     */
    _makeAxesData: function(convertData, bounds, options, initedData) {
        var axesData = {};
        if (initedData) {
            axesData = initedData.axes;
        } else {
            axesData = {
                yAxis: axisDataMaker.makeValueAxisData({
                    values: convertData.values,
                    seriesDimension: bounds.series.dimension,
                    stacked: options.series && options.series.stacked || '',
                    chartType: options.chartType,
                    formatFunctions: convertData.formatFunctions,
                    options: options.yAxis,
                    isVertical: true
                }),
                xAxis: axisDataMaker.makeLabelAxisData({
                    labels: convertData.labels
                })
            };
        }
        return axesData;
    },

    /**
     * Add components
     * @param {object} convertData converted data
     * @param {object} axesData axes data
     * @param {object} options chart options
     * @private
     */
    _addComponents: function(convertData, axesData, options) {
        this.addAxisComponents({
            convertData: convertData,
            axes: axesData,
            plotData: !ne.util.isUndefined(convertData.plotData) ? convertData.plotData : {
                vTickCount: axesData.yAxis.validTickCount,
                hTickCount: axesData.xAxis.validTickCount
            },
            chartType: options.chartType
        });

        this.addComponent('series', Series, {
            libType: options.libType,
            chartType: options.chartType,
            tooltipPrefix: this.tooltipPrefix,
            isPointPosition: true,
            data: {
                values: calculator.arrayPivot(convertData.values),
                formattedValues: calculator.arrayPivot(convertData.formattedValues),
                scale: axesData.yAxis.scale
            }
        });
    }
});

module.exports = LineChart;

},{"../helpers/axisDataMaker.js":16,"../helpers/calculator.js":18,"../series/lineChartSeries.js":36,"./axisTypeBase.js":4}],10:[function(require,module,exports){
/**
 * @fileoverview Pie chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase.js'),
    Legend = require('../legends/legend.js'),
    Tooltip = require('../tooltips/tooltip.js'),
    Series = require('../series/pieChartSeries.js');

var PieChart = ne.util.defineClass(ChartBase, /** @lends PieChart.prototype */ {
    /**
     * Column chart.
     * @constructs PieChart
     * @extends ChartBase
     * @param {array.<array>} userData chart data
     * @param {object} theme chart theme
     * @param {object} options chart options
     * @param {object} initedData initialized data from combo chart
     */
    init: function(userData, theme, options, initedData) {
        var baseData = initedData || this.makeBaseData(userData, theme, options),
            convertData = baseData.convertData,
            bounds = baseData.bounds;

        this.className = 'ne-pie-chart';

        options.tooltip = options.tooltip || {};

        if (!options.tooltip.position) {
            options.tooltip.position = 'center middle';
        }

        ChartBase.call(this, bounds, theme, options, initedData);

        this._addComponents(convertData, theme.chart.background, options);
    },

    /**
     * Add components
     * @param {object} convertData converted data
     * @param {object} chartBackground chart ㅠackground
     * @param {object} options chart options
     * @private
     */
    _addComponents: function(convertData, chartBackground, options) {
        if (convertData.joinLegendLabels) {
            this.addComponent('legend', Legend, {
                joinLegendLabels: convertData.joinLegendLabels,
                legendLabels: convertData.legendLabels,
                chartType: options.chartType
            });
        }

        this.addComponent('tooltip', Tooltip, {
            values: convertData.formattedValues,
            labels: convertData.labels,
            legendLabels: convertData.legendLabels,
            prefix: this.tooltipPrefix
        });

        this.addComponent('series', Series, {
            libType: options.libType,
            chartType: options.chartType,
            tooltipPrefix: this.tooltipPrefix,
            isPointPosition: true,
            chartBackground: chartBackground,
            data: {
                values: convertData.values,
                formattedValues: convertData.formattedValues
            }
        });
    }
});

module.exports = PieChart;

},{"../legends/legend.js":24,"../series/pieChartSeries.js":37,"../tooltips/tooltip.js":40,"./chartBase.js":6}],11:[function(require,module,exports){
'use strict';

/**
 * ne.util에 range가 추가되기 전까지 임시로 사용
 * @param {number} start start
 * @param {number} stop stop
 * @param {number} step step
 * @returns {array.<number>} result array
 */
var range = function(start, stop, step) {
    var arr = [],
        flag;

    if (ne.util.isUndefined(stop)) {
        stop = start || 0;
        start = 0;
    }

    step = step || 1;
    flag = step < 0 ? -1 : 1;
    stop *= flag;

    while (start * flag < stop) {
        arr.push(start);
        start += step;
    }

    return arr;
};

/**
 * * ne.util에 pluck이 추가되기 전까지 임시로 사용
 * @param {array} arr array
 * @param {string} property property
 * @returns {array} result array
 */
var pluck = function(arr, property) {
    var result = ne.util.map(arr, function(item) {
        return item[property];
    });
    return result;
};

/**
 * * ne.util에 zip이 추가되기 전까지 임시로 사용
 * @params {...array} array
 * @returns {array} result array
 */
var zip = function() {
    var arr2 = Array.prototype.slice.call(arguments),
        result = [];

    ne.util.forEach(arr2, function(arr) {
        ne.util.forEach(arr, function(value, index) {
            if (!result[index]) {
                result[index] = [];
            }
            result[index].push(value);
        });
    });

    return result;
};

/**
 * Pick minimum value from value array.
 * @param {array} arr value array
 * @param {function} condition condition function
 * @param {object} context target context
 * @returns {*} minimum value
 */
var min = function(arr, condition, context) {
    var result, minValue, rest;
    if (!condition) {
        condition = function(item) {
            return item;
        };
    }
    result = arr[0];
    minValue = condition.call(context, result);
    rest = arr.slice(1);
    ne.util.forEachArray(rest, function(item) {
        var compareValue = condition.call(context, item);
        if (compareValue < minValue) {
            minValue = compareValue;
            result = item;
        }
    });
    return result;
};

/**
 * Pick maximum value from value array.
 * @param {array} arr value array
 * @param {function} condition condition function
 * @param {object} context target context
 * @returns {*} maximum value
 */
var max = function(arr, condition, context) {
    var result, maxValue, rest;
    if (!condition) {
        condition = function(item) {
            return item;
        };
    }
    result = arr[0];
    maxValue = condition.call(context, result);
    rest = arr.slice(1);
    ne.util.forEachArray(rest, function(item) {
        var compareValue = condition.call(context, item);
        if (compareValue > maxValue) {
            maxValue = compareValue;
            result = item;
        }
    });
    return result;
};

/**
 * Whether one of them is true or not.
 * @param {array} arr target array
 * @param {function} condition condition function
 * @returns {boolean} result boolean
 */
var any = function(arr, condition) {
    var result = false;
    ne.util.forEachArray(arr, function(item) {
        if (condition(item)) {
            result = true;
            return false;
        }
    });
    return result;
};

/**
 * Get after point length.
 * @param {string | number} value target value
 * @returns {number} result length
 */
var lengthAfterPoint = function(value) {
    var valueArr = (value + '').split('.');
    return valueArr.length === 2 ? valueArr[1].length : 0;
};

/**
 * Find multiple num.
 * @param {...array} target values
 * @returns {number} multiple num
 */
var findMultipleNum = function() {
    var args = [].slice.call(arguments),
        underPointLens = ne.util.map(args, function(value) {
            return ne.util.lengthAfterPoint(value);
        }),
        underPointLen = ne.util.max(underPointLens),
        multipleNum = Math.pow(10, underPointLen);
    return multipleNum;
};

/**
 * Modulo operation for floating point operation.
 * @param {number} target target values
 * @param {number} modNum mod num
 * @returns {number} result mod
 */
var mod = function(target, modNum) {
    var multipleNum = ne.util.findMultipleNum(modNum);
    return ((target * multipleNum) % (modNum * multipleNum)) / multipleNum;
};

/**
 * Addition for floating point operation.
 * @param {number} a target a
 * @param {number} b target b
 * @returns {number} addition result
 */
var addition = function(a, b) {
    var multipleNum = findMultipleNum(a, b);
    return ((a * multipleNum) + (b * multipleNum)) / multipleNum;
};

/**
 * Subtraction for floating point operation.
 * @param {number} a target a
 * @param {number} b target b
 * @returns {number} subtraction result
 */
var subtraction = function(a, b) {
    var multipleNum = findMultipleNum(a, b);
    return ((a * multipleNum) - (b * multipleNum)) / multipleNum;
};

/**
 * Multiplication for floating point operation.
 * @param {number} a target a
 * @param {number} b target b
 * @returns {number} multiplication result
 */
var multiplication = function(a, b) {
    var multipleNum = findMultipleNum(a, b);
    return ((a * multipleNum) * (b * multipleNum)) / (multipleNum * multipleNum);
};

/**
 * Division for floating point operation.
 * @param {number} a target a
 * @param {number} b target b
 * @returns {number} division result
 */
var division = function(a, b) {
    var multipleNum = findMultipleNum(a, b);
    return (a * multipleNum) / (b * multipleNum);
};

/**
 * Sum.
 * @param {array.<number>} values target values
 * @returns {number} result value
 */
var sum = function(values) {
    var copyArr = values.slice();
    copyArr.unshift(0);
    return ne.util.reduce(copyArr, function(base, add) {
        return parseFloat(base) + parseFloat(add);
    });
};

ne.util.range = range;
ne.util.pluck = pluck;
ne.util.zip = zip;
ne.util.min = min;
ne.util.max = max;
ne.util.any = any;
ne.util.lengthAfterPoint = lengthAfterPoint;
ne.util.mod = mod;
ne.util.findMultipleNum = findMultipleNum;
ne.util.addition = addition;
ne.util.subtraction = subtraction;
ne.util.multiplication = multiplication;
ne.util.division = division;
ne.util.sum = sum;

},{}],12:[function(require,module,exports){
/**
 * @fileoverview chart const
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

module.exports = {
    CHART_DEFAULT_WIDTH: 500,
    CHART_DEFAULT_HEIGHT: 400,
    HIDDEN_WIDTH: 1,
    DEFAULT_TITLE_FONT_SIZE: 14,
    DEFAULT_AXIS_TITLE_FONT_SIZE: 10,
    DEFAULT_LABEL_FONT_SIZE: 12,
    DEFAULT_PLUGIN: 'raphael',
    DEFAULT_TICK_COLOR: 'black',
    DEFAULT_THEME_NAME: 'default',
    STACKED_NORMAL_TYPE: 'normal',
    STACKED_PERCENT_TYPE: 'percent',
    CHART_TYPE_BAR: 'bar',
    CHART_TYPE_COLUMN: 'column',
    CHART_TYPE_LINE: 'line',
    CHART_TYPE_COMBO: 'combo',
    CHART_TYPE_PIE: 'pie',
    YAXIS_PROPS: ['tickColor', 'title', 'label'],
    SERIES_PROPS: ['colors', 'borderColor', 'singleColors']
};

},{}],13:[function(require,module,exports){
/**
 * @fileoverview  Chart factory play role register chart.
 *                Also, you can get chart from this factory.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var charts = {},
    factory = {
        /**
         * Get chart instance.
         * @param {string} chartType chart type
         * @param {object} data chart data
         * @param {object} options chart options
         * @returns {object} chart instance;
         */
        get: function(chartType, data, theme, options) {
            var Chart = charts[chartType],
                chart;

            if (!Chart) {
                throw new Error('Not exist ' + chartType + ' chart.');
            }

            chart = new Chart(data, theme, options);

            return chart;
        },

        /**
         * Register chart.
         * @param {string} chartType char type
         * @param {class} ChartClass chart class
         */
        register: function(chartType, ChartClass) {
            charts[chartType] = ChartClass;
        }
    };

module.exports = factory;

},{}],14:[function(require,module,exports){
/**
 * @fileoverview  Plugin factory play role register rendering plugin.
 *                Also, you can get plugin from this factory.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var plugins = {},
    factory = {
        /**
         * Get graph renderer.
         * @param {string} libType type of graph library
         * @param {string} chartType chart type
         * @returns {object} renderer instance
         */
        get: function(libType, chartType) {
            var plugin = plugins[libType],
                Renderer, renderer;

            if (!plugin) {
                throw new Error('Not exist ' + libType + ' plugin.');
            }

            Renderer = plugin[chartType];
            if (!Renderer) {
                throw new Error('Not exist ' + chartType + ' chart renderer.');
            }

            renderer = new Renderer();

            return renderer;
        },
        /**
         * Plugin register.
         * @param {string} libType type of graph library
         * @param {object} plugin plugin to control library
         */
        register: function(libType, plugin) {
            plugins[libType] = plugin;
        }
    };

module.exports = factory;

},{}],15:[function(require,module,exports){
/**
 * @fileoverview  Theme factory play role register theme.
 *                Also, you can get theme from this factory.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const.js'),
    defaultTheme = require('../themes/defaultTheme.js');

var themes = {};

module.exports = {
    /**
     * Get theme.
     * @param {string} themeName theme name
     * @returns {object} theme object
     */
    get: function(themeName) {
        var theme = themes[themeName];

        if (!theme) {
            throw new Error('Not exist ' + themeName + ' theme.');
        }

        return theme;
    },

    /**
     * Theme register.
     * @param {string} themeName theme name
     * @param {object} theme theme
     */
    register: function(themeName, theme) {
        theme = JSON.parse(JSON.stringify(theme));
        if (themeName !== chartConst.DEFAULT_THEME_NAME) {
            theme = this._initTheme(theme);
        }
        this._inheritThemeProperty(theme);
        themes[themeName] = theme;
    },

    /**
     * Init theme.
     * @param {object} theme theme
     * @returns {object} theme
     * @private
     * @ignore
     */
    _initTheme: function(theme) {
        var cloneTheme = JSON.parse(JSON.stringify(defaultTheme)),
            newTheme;

        this._concatDefaultColors(theme, cloneTheme.series.colors)
        newTheme = this._extendTheme(theme, cloneTheme);

        newTheme = this._copyProperty({
            propName: 'yAxis',
            fromTheme: theme,
            toTheme: newTheme,
            rejectProps: chartConst.YAXIS_PROPS
        });

        newTheme = this._copyProperty({
            propName: 'series',
            fromTheme: theme,
            toTheme: newTheme,
            rejectProps: chartConst.SERIES_PROPS
        });
        return newTheme;
    },

    /**
     * Filter chart types.
     * @param {object} target target charts
     * @param {array.<string>} rejectProps reject property
     * @returns {Object} filtered charts.
     * @private
     */
    _filterChartTypes: function(target, rejectProps) {
        var result;
        if (!target) {
            return [];
        }

        result = ne.util.filter(target, function(item, name) {
            return ne.util.inArray(name, rejectProps) === -1;
        });
        return result;
    },

    /**
     * Concat colors.
     * @param {object} theme theme
     * @param {array.<string>} seriesColors series colors
     * @private
     */
    _concatColors: function(theme, seriesColors) {
        if (theme.colors) {
            theme.colors = theme.colors.concat(seriesColors);
        }

        if (theme.singleColors) {
            theme.singleColors = theme.singleColors.concat(seriesColors);
        }
    },

    /**
     * Concat default colors.
     * @param {object} theme theme
     * @param {array.<string>} seriesColors series colors
     * @private
     */
    _concatDefaultColors: function(theme, seriesColors) {
        var chartTypes;

        if (!theme.series) {
            return;
        }

        chartTypes = this._filterChartTypes(theme.series, chartConst.SERIES_PROPS);

        if (!ne.util.keys(chartTypes).length) {
            this._concatColors(theme.series, seriesColors);
        } else {
            ne.util.forEach(chartTypes, function(item) {
                this._concatColors(item, seriesColors);
            }, this);
        }
    },

    /**
     * Extend theme
     * @param {object} from from theme property
     * @param {object} to to theme property
     * @returns {object} result property
     * @private
     */
    _extendTheme: function(from, to) {
        ne.util.forEach(to, function(item, key) {
            var fromItem = from[key];
            if (!fromItem) {
                return;
            }

            if (ne.util.isArray(fromItem)) {
                to[key] = fromItem.slice();
            } else if (ne.util.isObject(fromItem)) {
                this._extendTheme(fromItem, item);
            } else {
                to[key] = fromItem;
            }
        }, this);

        return to;
    },

    /**
     * Copy property.
     * @param {object} params parameters
     *      @param {string} params.propName property name
     *      @param {object} params.fromTheme from property
     *      @param {object} params.toTheme tp property
     *      @param {array.<string>} params.rejectProps reject property name
     * @returns {object} copied property
     * @private
     */
    _copyProperty: function(params) {
        var chartTypes;

        if (!params.toTheme[params.propName]) {
            return params.toTheme;
        }

        chartTypes = this._filterChartTypes(params.fromTheme[params.propName], params.rejectProps);
        if (ne.util.keys(chartTypes).length) {
            ne.util.forEach(chartTypes, function(item, key) {
                var cloneTheme = JSON.parse(JSON.stringify(defaultTheme[params.propName]));
                params.fromTheme[params.propName][key] = this._extendTheme(item, cloneTheme);
            }, this);

            params.toTheme[params.propName] = params.fromTheme[params.propName];
        }

        return params.toTheme;
    },

    /**
     * Copy color info to legend
     * @param {object} seriesTheme series theme
     * @param {object} legendTheme legend theme
     * @private
     */
    _copyColorInfoToLegend: function(seriesTheme, legendTheme) {
        if (seriesTheme.singleColors) {
            legendTheme.singleColors = seriesTheme.singleColors;
        }
        if (seriesTheme.borderColor) {
            legendTheme.borderColor = seriesTheme.borderColor;
        }
    },

    /**
     * To inherit theme property.
     * @param {object} theme theme
     * @private
     * @ignore
     */
    _inheritThemeProperty: function(theme) {
        var baseFont = theme.chart.fontFamily,
            items = [
                theme.title,
                theme.xAxis.title,
                theme.xAxis.label,
                theme.legend.label
            ],
            yAxisChartTypes = this._filterChartTypes(theme.yAxis, chartConst.YAXIS_PROPS),
            seriesChartTypes = this._filterChartTypes(theme.series, chartConst.SERIES_PROPS);

        if (!ne.util.keys(yAxisChartTypes).length) {
            items.push(theme.yAxis.title);
            items.push(theme.yAxis.label);
        } else {
            ne.util.forEach(yAxisChartTypes, function(yAxisTheme) {
                items.push(yAxisTheme.title);
                items.push(yAxisTheme.label);
            });
        }

        ne.util.forEachArray(items, function(item) {
            if (!item.fontFamily) {
                item.fontFamily = baseFont;
            }
        });

        if (!ne.util.keys(seriesChartTypes).length) {
            theme.legend.colors = theme.series.colors;
            this._copyColorInfoToLegend(theme.series, theme.legend);
        } else {
            ne.util.forEach(seriesChartTypes, function(item, chartType) {
                theme.legend[chartType] = {
                    colors: item.colors || theme.legend.colors
                };
                this._copyColorInfoToLegend(item, theme.legend[chartType]);
                delete theme.legend.colors;
            }, this);
        }
    }
};

},{"../const.js":12,"../themes/defaultTheme.js":39}],16:[function(require,module,exports){
/**
 * @fileoverview Axis Data Maker
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const.js'),
    calculator = require('./calculator.js');

var MIN_PIXEL_STEP_SIZE = 40,
    MAX_PIXEL_STEP_SIZE = 60,
    PERCENT_STACKED_TICK_INFO = {
        scale: {
            min: 0,
            max: 100
        },
        step: 25,
        tickCount: 5,
        labels: [0, 25, 50, 75, 100]
    };

var abs = Math.abs,
    concat = Array.prototype.concat;

/**
 * Axis data maker.
 * @module axisDataMaker
 */
var axisDataMaker = {
    /**
     * To make data about label axis.
     * @memberOf module:axisDataMaker
     * @param {object} params parameters
     *      @param {array.<string>} labels chart labels
     *      @param {boolean} isVertical whether vertical or not
     * @returns {{
     *      labels: array.<string>,
     *      tickCount: number,
     *      validTickCount: number,
     *      isLabelAxis: boolean,
     *      isVertical: boolean
     * }} axis data
     */
    makeLabelAxisData: function(params) {
        return {
            labels: params.labels,
            tickCount: params.labels.length + 1,
            validTickCount: 0,
            isLabelAxis: true,
            isVertical: !!params.isVertical
        };
    },

    /**
     * To make data about value axis.
     * @memberOf module:axisDataMaker
     * @param {object} params parameters
     *      @param {array.<array.<number>>} params.values chart values
     *      @param {{width:number, height:number}} params.seriesDimension series dimension
     *      @param {array.<function>} params.formatFunctions format functions
     *      @param {string} params.stacked stacked option
     *      @param {string} params.options axis options
     * @returns {{
     *      labels: array.<string>,
     *      tickCount: number,
     *      validTickCount: number,
     *      isLabelAxis: boolean,
     *      scale: {min: number, max: number},
     *      isVertical: boolean
     * }} axis data
     */
    makeValueAxisData: function(params) {
        var options = params.options || {},
            isVertical = !!params.isVertical,
            isPositionRight = !!params.isPositionRight,
            formatFunctions = params.formatFunctions,
            tickInfo;
        if (params.stacked === 'percent') {
            tickInfo = PERCENT_STACKED_TICK_INFO;
            formatFunctions = [];
        } else {
            tickInfo = this._getTickInfo({
                values: this._makeBaseValues(params.values, params.stacked),
                seriesDimension: params.seriesDimension,
                isVertical: isVertical,
                isPositionRight: isPositionRight,
                chartType: params.chartType
            }, options);
        }

        return {
            labels: this._formatLabels(tickInfo.labels, formatFunctions),
            tickCount: tickInfo.tickCount,
            validTickCount: tickInfo.tickCount,
            scale: tickInfo.scale,
            step: tickInfo.step,
            isVertical: isVertical,
            isPositionRight: isPositionRight
        };
    },

    /**
     * To make base values.
     * @memberOf module:axisDataMaker
     * @param {array.<number>} groupValues group values
     * @param {string} stacked stacked option.
     * @returns {array.<number>} base values
     * @private
     */
    _makeBaseValues: function(groupValues, stacked) {
        var baseValues = concat.apply([], groupValues); // flatten array
        if (stacked === chartConst.STACKED_NORMAL_TYPE) {
            baseValues = baseValues.concat(ne.util.map(groupValues, function(values) {
                var plusValues = ne.util.filter(values, function(value) {
                    return value > 0;
                });
                return ne.util.sum(plusValues);
            }));
        }
        return baseValues;
    },

    /**
     * Get base size for get candidate tick counts.
     * @memberOf module:axisDataMaker
     * @param {{width: number, height: number}} dimension chat dimension
     * @param {boolean} isVertical whether vertical or not
     * @returns {number} base size
     * @private
     */
    _getBaseSize: function(dimension, isVertical) {
        var baseSize;
        if (isVertical) {
            baseSize = dimension.height;
        } else {
            baseSize = dimension.width;
        }
        return baseSize;
    },

    /**
     * Get candidate tick counts.
     * @memberOf module:axisDataMaker
     * @param {{width: number, height: number}} chartDimension chat dimension
     * @param {boolean} isVertical whether vertical or not
     * @returns {array.<number>} tick counts
     * @private
     */
    _getCandidateTickCounts: function(chartDimension, isVertical) {
        var baseSize = this._getBaseSize(chartDimension, isVertical),
            start = parseInt(baseSize / MAX_PIXEL_STEP_SIZE, 10),
            end = parseInt(baseSize / MIN_PIXEL_STEP_SIZE, 10) + 1,
            tickCounts = ne.util.range(start, end);
        return tickCounts;
    },

    /**
     * Get comparing value.
     * @memberOf module:axisDataMaker
     * @param {number} min minimum value of user data
     * @param {number} max maximum value of user data
     * @param {{scale: {min: number, max: number}, step: number}} tickInfo tick info
     * @returns {number} comparing value
     * @private
     */
    _getComparingValue: function(min, max, tickInfo) {
        var diffMax = abs(tickInfo.scale.max - max),
            diffMin = abs(min - tickInfo.scale.min),
            weight = Math.pow(10, ne.util.lengthAfterPoint(tickInfo.step));
        return (diffMax + diffMin) * weight;
    },

    /**
     * Select tick info.
     * @memberOf module:axisDataMaker
     * @param {number} min minimum value of user data
     * @param {number} max maximum value of user data
     * @param {array.<object>} candidates tick info candidates
     * @returns {{scale: {min: number, max: number}, tickCount: number, step: number, labels: array.<number>}} selected tick info
     * @private
     */
    _selectTickInfo: function(min, max, candidates) {
        var getComparingValue = ne.util.bind(this._getComparingValue, this, min, max),
            tickInfo = ne.util.min(candidates, getComparingValue);
        return tickInfo;
    },

    /**
     * Get tick count and scale.
     * @memberOf module:axisDataMaker
     * @param {object} params parameters
     *      @param {number} params.values base values
     *      @param {{width: number, height: number}} params.seriesDimension chat dimension
     *      @param {boolean} params.isVertical whether vertical or not
     *      @param {string} params.chartType chat type
     * @param {{min: number, max:number}} options axis options
     * @returns {{tickCount: number, scale: object}} tick info
     * @private
     */
    _getTickInfo: function(params, options) {
        var min = ne.util.min(params.values),
            max = ne.util.max(params.values),
            intTypeInfo, tickCounts, candidates, tickInfo;
        // 01. min, max, options 정보를 정수형으로 변경
        intTypeInfo = this._makeIntegerTypeInfo(min, max, options);

        // 02. tick count 후보군 얻기
        tickCounts = params.tickCount ? [params.tickCount] : this._getCandidateTickCounts(params.seriesDimension, params.isVertical);

        // 03. tick info 후보군 계산
        candidates = this._getCandidateTickInfos({
            min: intTypeInfo.min,
            max: intTypeInfo.max,
            tickCounts: tickCounts,
            chartType: params.chartType
        }, intTypeInfo.options);

        // 04. tick info 후보군 중 하나 선택
        tickInfo = this._selectTickInfo(intTypeInfo.min, intTypeInfo.max, candidates);

        // 05. 정수형으로 변경했던 tick info를 원래 형태로 변경
        tickInfo = this._revertOriginalTypeTickInfo(tickInfo, intTypeInfo.divideNum);
        return tickInfo;
    },

    /**
     * To make integer type info
     * @memberOf module:axisDataMaker
     * @param {number} min minimum value of user data
     * @param {number} max maximum value of user data
     * @param {{min: number, max: number}} options axis options
     * @returns {{min: number, max: number, options: {min: number, max: number}, divideNum: number}} integer type info
     * @private
     */
    _makeIntegerTypeInfo: function(min, max, options) {
        var multipleNum, changedOptions;

        if (abs(min) >= 1 || abs(max) >= 1) {
            return {
                min: min,
                max: max,
                options: options,
                divideNum: 1
            };
        }

        multipleNum = ne.util.findMultipleNum(min, max);
        changedOptions = {};

        if (options.min) {
            changedOptions.min = options.min * multipleNum;
        }

        if (options.max) {
            changedOptions.max = options.max * multipleNum;
        }

        return {
            min: min * multipleNum,
            max: max * multipleNum,
            options: changedOptions,
            divideNum: multipleNum
        };
    },

    /**
     * Revert tick info to original type.
     * @memberOf module:axisDataMaker
     * @param {{step: number, scale: {min: number, max: number}, labels: array.<number>}} tickInfo tick info
     * @param {number} divideNum divide num
     * @returns {{step: number, scale: {min: number, max: number}, labels: array.<number>}} divided tick info
     * @private
     */
    _revertOriginalTypeTickInfo: function(tickInfo, divideNum) {
        if (divideNum === 1) {
            return tickInfo;
        }

        tickInfo.step = ne.util.division(tickInfo.step, divideNum);
        tickInfo.scale.min = ne.util.division(tickInfo.scale.min, divideNum);
        tickInfo.scale.max = ne.util.division(tickInfo.scale.max, divideNum);
        tickInfo.labels = ne.util.map(tickInfo.labels, function(label) {
            return ne.util.division(label, divideNum);
        });

        return tickInfo;
    },

    /**
     * Normalize step.
     * @memberOf module:axisDataMaker
     * @param {number} step original step
     * @returns {number} normalized step
     * @private
     */
    _normalizeStep: function(step) {
        return calculator.normalizeAxisNumber(step);
    },

    /**
     * To minimize tick scale.
     * @memberOf module:axisDataMaker
     * @param {object} params parameters
     *      @param {number} params.userMin user min
     *      @param {number} params.userMax user max
     *      @param {{tickCount: number, scale: object}} params.tickInfo tick info
     *      @param {{min: number, max:number}} params.options axis options
     * @returns {{tickCount: number, scale: object, labels: array}} corrected tick info
     * @private
     */
    _minimizeTickScale: function(params) {
        var tickInfo = params.tickInfo,
            ticks = ne.util.range(1, tickInfo.tickCount),
            options = params.options,
            step = tickInfo.step,
            scale = tickInfo.scale,
            tickMax = scale.max,
            tickMin = scale.min,
            isUndefinedMin = ne.util.isUndefined(options.min),
            isUndefinedMax = ne.util.isUndefined(options.max),
            labels;
        ne.util.forEachArray(ticks, function(tickIndex) {
            var curStep = (step * tickIndex),
                curMin = tickMin + curStep,
                curMax = tickMax - curStep;

            // 더이상 변경이 필요 없을 경우
            if (params.userMin <= curMin && params.userMax >= curMax) {
                return false;
            }

            // min 값에 변경 여유가 있을 경우
            if ((isUndefinedMin && params.userMin > curMin) ||
                (!isUndefinedMin && options.min >= curMin)) {
                scale.min = curMin;
            }

            // max 값에 변경 여유가 있을 경우
            if ((isUndefinedMin && params.userMax < curMax) ||
                (!isUndefinedMax && options.max <= curMax)) {
                scale.max = curMax;
            }
        });

        labels = calculator.makeLabelsFromScale(scale, step);
        tickInfo.labels = labels;
        tickInfo.step = step;
        tickInfo.tickCount = labels.length;
        return tickInfo;
    },

    /**
     * To divide tick step.
     * @memberOf module:axisDataMaker
     * @param {{scale: {min: number, max: number}, tickCount: number, step: number, labels: array.<number>}} tickInfo tick info
     * @param {number} orgTickCount original tickCount
     * @returns {{scale: {min: number, max: number}, tickCount: number, step: number, labels: array.<number>}} tick info
     * @private
     */
    _divideTickStep: function(tickInfo, orgTickCount) {
        var step = tickInfo.step,
            scale = tickInfo.scale,
            tickCount = tickInfo.tickCount;
        // step 2의 배수 이면서 변경된 tickCount의 두배수-1이 tickCount보다 orgTickCount와 차이가 덜나거나 같으면 step을 반으로 변경한다.
        if ((step % 2 === 0) &&
            abs(orgTickCount - ((tickCount * 2) - 1)) <= abs(orgTickCount - tickCount)) {
            step = step / 2;
            tickInfo.labels = calculator.makeLabelsFromScale(scale, step);
            tickInfo.tickCount = tickInfo.labels.length;
            tickInfo.step = step;
        }
        return tickInfo;
    },

    /**
     * To make tick info
     * @memberOf module:axisDataMaker
     * @param {object} params parameters
     *      @param {number} params.tickCount tick count
     *      @param {number} params.min scale min
     *      @param {number} params.max scale max
     *      @param {number} params.userMin minimum value of user data
     *      @param {number} params.userMax maximum value of user data
     *      @param {boolean} params.isMinus whether scale is minus or not
     *      @param {string} params.chartType chart type
     *      @param {{min: number, max: number}} params.options axis options
     * @returns {{
     *      scale: {min: number, max: number},
     *      tickCount: number,
     *      step: number,
     *      labels: array.<number>
     * }} tick info
     * @private
     */
    _makeTickInfo: function(params) {
        var scale = params.scale,
            step, tickInfo;

        // 01. 기본 scale 정보로 step 얻기
        step = calculator.getScaleStep(scale, params.tickCount);

        // 02. step 일반화 시키기 (ex: 0.3 --> 0.5, 7 --> 10)
        step = this._normalizeStep(step);

        // 03. scale 일반화 시키기
        scale = this._normalizeScale(scale, step, params.tickCount);

        // 04. line차트의 경우 사용자의 min값이 scale의 min값과 같을 경우, min값을 1 step 감소 시킴
        scale.min = this._addMinPadding({
            min: scale.min,
            step: step,
            userMin: params.userMin,
            minOption: params.options.min,
            chartType: params.chartType
        });

        // 05. 사용자의 max값이 scael max와 같을 경우, max값을 1 step 증가 시킴
        scale.max = this._addMaxPadding({
            max: scale.max,
            step: step,
            userMax: params.userMax,
            maxOption: params.options.max
        });

        // 06. axis scale이 사용자 min, max와 거리가 멀 경우 조절
        tickInfo = this._minimizeTickScale({
            userMin: params.userMin,
            userMax: params.userMax,
            tickInfo: {scale: scale, step: step, tickCount: params.tickCount},
            options: params.options
        });

        tickInfo = this._divideTickStep(tickInfo, params.tickCount);
        return tickInfo;
    },

    /**
     * Add scale min padding.
     * @memberOf module:axisDataMaker
     * @param {object} params parameters
     *      @prams {number} params.min scale min
     *      @param {number} params.userMin minimum value of user data
     *      @param {number} params.minOption min option
     *      @param {number} params.step tick step
     * @returns {number} scale min
     * @private
     */
    _addMinPadding: function(params) {
        var min = params.min;

        if (params.chartType !== chartConst.CHART_TYPE_LINE || !ne.util.isUndefined(params.minOption)) {
            return min;
        }
        // normalize된 scale min값이 user min값과 같을 경우 step 감소
        if (params.min === params.userMin) {
            min -= params.step;
        }
        return min;
    },

    /**
     * Add scale max padding.
     * @memberOf module:axisDataMaker
     * @param {object} params parameters
     *      @prams {number} params.max scale max
     *      @param {number} params.userMax maximum value of user data
     *      @param {number} params.maxOption max option
     *      @param {number} params.step tick step
     * @returns {number} scale max
     * @private
     */
    _addMaxPadding: function(params) {
        var max = params.max;
        // normalize된 scale max값이 user max값과 같을 경우 step 증가
        if (ne.util.isUndefined(params.maxOption) && (params.max === params.userMax)) {
            max += params.step;
        }
        return max;
    },

    /**
     * To normalize min.
     * @memberOf module:axisDataMaker
     * @param {number} min original min
     * @param {number} step tick step
     * @returns {number} normalized min
     * @private
     */
    _normalizeMin: function(min, step) {
        var mod = ne.util.mod(min, step),
            normalized;

        if (mod === 0) {
            normalized = min;
        } else {
            normalized = ne.util.subtraction(min, (min >= 0 ? mod : step + mod));
        }
        return normalized;
    },

    /**
     * To make normalized max.
     * @memberOf module:axisDataMaker
     * @param {{min: number, max: number}} scale scale
     * @param {number} step tick step
     * @param {number} tickCount tick count
     * @returns {number} normalized max
     * @private
     */
    _makeNormalizedMax: function(scale, step, tickCount) {
        var minMaxDiff = ne.util.multiplication(step, tickCount - 1),
            normalizedMax = ne.util.addition(scale.min, minMaxDiff),
            maxDiff = scale.max - normalizedMax,
            modDiff, divideDiff;
        // normalize된 max값이 원래의 max값 보다 작을 경우 step을 증가시켜 큰 값으로 만들기
        if (maxDiff > 0) {
            modDiff = maxDiff % step;
            divideDiff = Math.floor(maxDiff / step);
            normalizedMax += step * (modDiff > 0 ? divideDiff + 1 : divideDiff);
        }
        return normalizedMax;
    },

    /**
     * To normalize scale.
     * @memberOf module:axisDataMaker
     * @param {{min: number, max: number}} scale base scale
     * @param {number} step tick step
     * @param {number} tickCount tick count
     * @returns {{min: number, max: number}} normalized scale
     * @private
     */
    _normalizeScale: function(scale, step, tickCount) {
        scale.min = this._normalizeMin(scale.min, step);
        scale.max = this._makeNormalizedMax(scale, step, tickCount);
        return scale;
    },

    /**
     * Get candidates about tick info.
     * @memberOf module:axisDataMaker
     * @param {object} params parameters
     *      @param {number} params.min minimum value of user data
     *      @param {number} params.max maximum value of user data
     *      @param {array.<number>} params.tickCounts tick counts
     *      @param {string} params.chartType chart type
     * @param {{min: number, max:number}} options axis options
     * @returns {array} candidates about tick info
     * @private
     */
    _getCandidateTickInfos: function(params, options) {
        var userMin = params.min,
            userMax = params.max,
            min = params.min,
            max = params.max,
            scale, candidates;

        // min, max만으로 기본 scale 얻기
        scale = this._makeBaseScale(min, max, options);

        candidates = ne.util.map(params.tickCounts, function(tickCount) {
            return this._makeTickInfo({
                tickCount: tickCount,
                scale: ne.util.extend({}, scale),
                userMin: userMin,
                userMax: userMax,
                chartType: params.chartType,
                options: options
            });
        }, this);
        return candidates;
    },

    /**
     * To make base scale
     * @memberOf module:axisDataMaker
     * @param {number} min minimum value of user data
     * @param {number} max maximum value of user data
     * @param {{min: number, max: number}} options axis options
     * @returns {{min: number, max: number}} base scale
     * @private
     */
    _makeBaseScale: function(min, max, options) {
        var isMinus = false,
            tmpMin, scale;

        if (min < 0 && max <= 0) {
            isMinus = true;
            tmpMin = min;
            min = -max;
            max = -tmpMin;
        }

        scale = calculator.calculateScale(min, max);

        if (isMinus) {
            tmpMin = scale.min;
            scale.min = -scale.max;
            scale.max = -tmpMin;
        }

        scale.min = options.min || scale.min;
        scale.max = options.max || scale.max;

        return scale;
    },

    /**
     * Format labels.
     * @memberOf module:axisDataMaker
     * @param {string[]} labels target labels
     * @param {function[]} formatFunctions format functions
     * @returns {string[]} formatted labels
     * @private
     */
    _formatLabels: function(labels, formatFunctions) {
        var result;
        if (!formatFunctions || !formatFunctions.length) {
            return labels;
        }
        result = ne.util.map(labels, function(label) {
            var fns = concat.apply([label], formatFunctions);
            return ne.util.reduce(fns, function(stored, fn) {
                return fn(stored);
            });
        });
        return result;
    }
};

module.exports = axisDataMaker;

},{"../const.js":12,"./calculator.js":18}],17:[function(require,module,exports){
/**
 * @fileoverview Bounds maker.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var calculator = require('./calculator.js'),
    renderUtil = require('./renderUtil.js');

var CHART_PADDING = 10,
    TITLE_ADD_PADDING = 20,
    LEGEND_AREA_PADDING = 10,
    LEGEND_RECT_WIDTH = 12,
    LEGEND_LABEL_PADDING_LEFT = 5,
    AXIS_LABEL_PADDING = 7,
    HIDDEN_WIDTH = 1;

var concat = Array.prototype.concat;

/**
 * Bounds maker.
 * @module boundsMaker
 */
var boundsMaker = {
    /**
     * To make bounds about chart components.
     * @memberOf module:boundsMaker
     * @param {object} params parameters
     *      @param {object} params.convertData converted data
     *      @param {object} params.theme chart theme
     *      @param {boolean} params.isVertical whether vertical or not
     *      @param {object} params.options chart options
     * @returns {{
     *   plot: {
     *     dimension: {width: number, height: number},
     *     position: {top: number, right: number}
     *   },
     *   yAxis: {
     *     dimension: {width: (number), height: number},
     *     position: {top: number}
     *   },
     *   xAxis: {
     *     dimension: {width: number, height: (number)},
     *     position: {right: number}
     *   },
     *   series: {
     *     dimension: {width: number, height: number},
     *     position: {top: number, right: number}
     *   },
     *   legend: {
     *     position: {top: number}
     *   },
     *   tooltip: {
     *     dimension: {width: number, height: number},
     *     position: {top: number, left: number}
     *   }
     * }} bounds
     */
    make: function(params) {
        var dimensions = this._getComponentsDimensions(params),
            yAxisWidth = dimensions.yAxis.width,
            top = dimensions.title.height + CHART_PADDING,
            right = dimensions.legend.width + dimensions.yrAxis.width + CHART_PADDING,
            axesBounds = this._makeAxesBounds({
                hasAxes: params.hasAxes,
                yAxisChartTypes: params.yAxisChartTypes,
                dimensions: dimensions,
                top: top,
                right: right
            }),
            bounds = ne.util.extend({
                chart: {
                    dimension: dimensions.chart
                },
                series: {
                    dimension: dimensions.series,
                    position: {
                        top: top,
                        right: right
                    }
                },
                legend: {
                    position: {
                        top: dimensions.title.height,
                        left: yAxisWidth + dimensions.plot.width + dimensions.yrAxis.width + CHART_PADDING
                    }
                },
                tooltip: {
                    dimension: dimensions.tooltip,
                    position: {
                        top: top,
                        left: yAxisWidth + CHART_PADDING
                    }
                }
            }, axesBounds);
        return bounds;
    },

    /**
     * Get max label of value axis.
     * @memberOf module:boundsMaker
     * @param {object} convertData convert data
     * @param {array.<string>} chartTypes chart types
     * @param {number} index chart type index
     * @returns {number|string} max label
     * @private
     */
    _getValueAxisMaxLabel: function(convertData, chartTypes, index) {
        var chartType = chartTypes && chartTypes[index || 0] || '',
            values = chartType && convertData.values[chartType] ? convertData.values[chartType] : convertData.joinValues,
            formatFunctions = convertData.formatFunctions,
            flattenValues = concat.apply([], values),
            min = ne.util.min(flattenValues),
            max = ne.util.max(flattenValues),
            scale = calculator.calculateScale(min, max),
            minLabel = calculator.normalizeAxisNumber(scale.min),
            maxLabel = calculator.normalizeAxisNumber(scale.max),
            fns = formatFunctions && formatFunctions.slice() || [];
        maxLabel = (minLabel + '').length > (maxLabel + '').length ? minLabel : maxLabel;
        fns.unshift(maxLabel);
        maxLabel = ne.util.reduce(fns, function(stored, fn) {
            return fn(stored);
        });
        return maxLabel;
    },

    /**
     * Get Rendered Labels Max Size(width or height).
     * @memberOf module:boundsMaker
     * @param {string[]} labels labels
     * @param {{fontSize: number, fontFamily: string, color: string}} theme label theme
     * @param {function} iteratee iteratee
     * @returns {number} max size (width or height)
     * @private
     */
    _getRenderedLabelsMaxSize: function(labels, theme, iteratee) {
        var sizes = ne.util.map(labels, function(label) {
                return iteratee(label, theme);
            }, this),
            maxSize = ne.util.max(sizes);
        return maxSize;
    },

    /**
     * Get rendered labels max width.
     * @memberOf module:boundsMaker
     * @param {string[]} labels labels
     * @param {{fontSize: number, fontFamily: string, color: string}} theme label theme
     * @returns {number} max width
     * @private
     */
    _getRenderedLabelsMaxWidth: function(labels, theme) {
        var iteratee = ne.util.bind(renderUtil.getRenderedLabelWidth, renderUtil),
            maxWidth = this._getRenderedLabelsMaxSize(labels, theme, iteratee);
        return maxWidth;
    },

    /**
     * Get rendered labels max height.
     * @memberOf module:boundsMaker
     * @param {string[]} labels labels
     * @param {{fontSize: number, fontFamily: string, color: string}} theme label theme
     * @returns {number} max height
     */
    _getRenderedLabelsMaxHeight: function(labels, theme) {
        var iteratee = ne.util.bind(renderUtil.getRenderedLabelHeight, renderUtil),
            result = this._getRenderedLabelsMaxSize(labels, theme, iteratee);
        return result;
    },

    /**
     * Get width of vertical axis area.
     * @memberOf module:boundsMaker
     * @param {string} title axis title,
     * @param {array.<string>} labels axis labels
     * @param {object} theme axis theme
     * @returns {number} width
     * @private
     */
    _getVerticalAxisWidth: function(title, labels, theme) {
        var titleAreaWidth = renderUtil.getRenderedLabelHeight(title, theme.title) + TITLE_ADD_PADDING,
            width = this._getRenderedLabelsMaxWidth(labels, theme.label) + titleAreaWidth + AXIS_LABEL_PADDING;
        return width;
    },

    /**
     * Get height of horizontal axis area.
     * @memberOf module:boundsMaker
     * @param {string} title axis title,
     * @param {array.<string>} labels axis labels
     * @param {object} theme axis theme
     * @returns {number} height
     * @private
     */
    _getHorizontalAxisHeight: function(title, labels, theme) {
        var titleAreaHeight = renderUtil.getRenderedLabelHeight(title, theme.title) + TITLE_ADD_PADDING,
            height = this._getRenderedLabelsMaxHeight(labels, theme.label) + titleAreaHeight;
        return height;
    },

    /**
     * Get width about y right axis.
     * @memberOf module:boundsMaker
     * @param {object} params parameters
     *      @param {array.<string>} params.yAxisChartTypes chart types
     *      @param {object} params.theme chart theme
     *      @param {object} params.options chart options
     * @returns {number} y right axis width
     * @private
     */
    _getYRAxisWidth: function(params) {
        var yAxisChartTypes = params.yAxisChartTypes || [],
            rightYAxisWidth = 0,
            yAxisThemes, yAxisTheme, yAxisOptions, index, labels, title;
        index = yAxisChartTypes.length - 1;
        if (index > -1) {
            yAxisThemes = [].concat(params.theme.yAxis);
            yAxisOptions = [].concat(params.options.yAxis);
            title = yAxisOptions[index] && yAxisOptions[index].title;
            labels = [this._getValueAxisMaxLabel(params.convertData, yAxisChartTypes, index)];
            yAxisTheme = yAxisThemes.length === 1 ? yAxisThemes[0] : yAxisThemes[index];
            rightYAxisWidth = this._getVerticalAxisWidth(title, labels, yAxisTheme);
        }
        return rightYAxisWidth;
    },

    /**
     * To make axes dimension.
     * @memberOf module:boundsMaker
     * @param {object} params parameters
     *      @param {object} params.convertData converted data
     *      @param {object} params.theme chart theme
     *      @param {boolean} params.isVertical whether vertical or not
     *      @param {object} params.options chart options
     * @returns {{
     *      yAxis: {width: number},
     *      yrAxis: {width: number},
     *      xAxis: {height: number}
     * }} axes dimension
     * @private
     */
    _makeAxesDimension: function(params) {
        var theme, options, convertData, yAxisChartTypes,
            yAxisTitle, xAxisTitle, maxLabel, vLabels, hLabels,
            yAxisWidth, xAxisHeight, yrAxisWidth;
        if (!params.hasAxes) {
            return {
                yAxis: {
                    width: 0
                },
                yrAxis: {
                    width: 0
                },
                xAxis: {
                    height: 0
                }
            };
        }

        theme = params.theme;
        options = params.options;
        convertData = params.convertData;
        yAxisChartTypes = params.yAxisChartTypes;
        yAxisTitle = options.yAxis && options.yAxis.title;
        xAxisTitle = options.xAxis && options.xAxis.title;
        maxLabel = this._getValueAxisMaxLabel(convertData, yAxisChartTypes);
        vLabels = params.isVertical ? [maxLabel] : convertData.labels;
        hLabels = params.isVertical ? convertData.labels : [maxLabel];
        yAxisWidth = this._getVerticalAxisWidth(yAxisTitle, vLabels, theme.yAxis);
        xAxisHeight = this._getHorizontalAxisHeight(xAxisTitle, hLabels, theme.xAxis);
        yrAxisWidth = this._getYRAxisWidth({
            convertData: convertData,
            yAxisChartTypes: yAxisChartTypes,
            theme: theme,
            options: options
        });

        return {
            yAxis: {
                width: yAxisWidth
            },
            yrAxis: {
                width: yrAxisWidth
            },
            xAxis: {
                height: xAxisHeight
            }
        };
    },

    /**
     * Get width of legend area.
     * @memberOf module:boundsMaker
     * @param {array.<string>} joinLegendLabels legend labels
     * @param {object} labelTheme label theme
     * @returns {number} width
     * @private
     */
    _getLegendAreaWidth: function(joinLegendLabels, labelTheme) {
        var legendLabels = ne.util.map(joinLegendLabels, function(item) {
                return item.label;
            }),
            maxLabelWidth = this._getRenderedLabelsMaxWidth(legendLabels, labelTheme),
            legendWidth = maxLabelWidth + LEGEND_RECT_WIDTH +
                LEGEND_LABEL_PADDING_LEFT + (LEGEND_AREA_PADDING * 2);
        return legendWidth;
    },

    /**
     * To make series dimension.
     * @memberOf module:boundsMaker
     * @param {object} params parameters
     *      @param {{width: number, height: number}} params.chartDimension chart dimension
     *      @param {{
     *          yAxis: {width: number, height:number},
     *          xAxis: {width: number, height:number},
     *          yrAxis: {width: number, height:number}
     *      }} params.axesDimension axes dimension
     *      @param {number} params.legendWidth legend width
     *      @param {number} params.titleHeight title height
     * @returns {{width: number, height: number}} series dimension
     * @private
     */
    _makeSeriesDimension: function(params) {
        var axesDimension = params.axesDimension,
            rightAreaWidth = params.legendWidth + axesDimension.yrAxis.width,
            width = params.chartDimension.width - (CHART_PADDING * 2) - axesDimension.yAxis.width - rightAreaWidth,
            height = params.chartDimension.height - (CHART_PADDING * 2) - params.titleHeight - axesDimension.xAxis.height;
        return {
            width: width,
            height: height
        };
    },

    /**
     * Get components dimension
     * @memberOf module:boundsMaker
     * @param {object} params parameters
     *      @param {object} params.convertData converted data
     *      @param {object} params.theme chart theme
     *      @param {boolean} params.isVertical whether vertical or not
     *      @param {object} params.options chart options
     * @returns {Object} components dimensions
     * @private
     */
    _getComponentsDimensions: function(params) {
        var theme = params.theme,
            options = params.options,
            convertData = params.convertData,
            chartOptions = options.chart || {},
            chartDimension = {
                width: chartOptions.width || 500,
                height: chartOptions.height || 400
            },
            axesDimension, titleHeight, legendWidth, seriesDimension, dimensions;

        axesDimension = this._makeAxesDimension(params);
        titleHeight = renderUtil.getRenderedLabelHeight(chartOptions.title, theme.title) + TITLE_ADD_PADDING;
        legendWidth = this._getLegendAreaWidth(convertData.joinLegendLabels, theme.legend.label);
        seriesDimension = this._makeSeriesDimension({
            chartDimension: chartDimension,
            axesDimension: axesDimension,
            legendWidth: legendWidth,
            titleHeight: titleHeight
        });
        dimensions = ne.util.extend({
            chart: chartDimension,
            title: {
                height: titleHeight
            },
            plot: seriesDimension,
            series: seriesDimension,
            legend: {
                width: legendWidth
            },
            tooltip: seriesDimension
        }, axesDimension);
        return dimensions;
    },

    /**
     * To make axes bounds.
     * @memberOf module:boundsMaker
     * @param {object} params parameters
     *      @param {boolean} params.hasAxes whether has axed or not
     *      @param {array.<string>} params.yAxisChartTypes y axis chart types
     *      @param {{width: number, height: number}} params.dimension chart dimension
     *      @param {number} params.top top position
     *      @param {number} params.right right position
     * @returns {object} axes bounds
     * @private
     */
    _makeAxesBounds: function(params) {
        var bounds, dimensions, yAxisChartTypes, top, right;

        if (!params.hasAxes) {
            return {};
        }

        dimensions = params.dimensions;
        yAxisChartTypes = params.yAxisChartTypes;
        top = params.top;
        right = params.right;
        bounds = {
            plot: {
                dimension: dimensions.plot,
                position: {
                    top: top,
                    right: right
                }
            },
            yAxis: {
                dimension: {
                    width: dimensions.yAxis.width,
                    height: dimensions.plot.height
                },
                position: {
                    top: top,
                    left: CHART_PADDING + HIDDEN_WIDTH
                }
            },
            xAxis: {
                dimension: {
                    width: dimensions.plot.width,
                    height: dimensions.xAxis.height
                },
                position: {
                    top: top + dimensions.plot.height - HIDDEN_WIDTH,
                    right: right
                }
            }
        };

        if (yAxisChartTypes && yAxisChartTypes.length) {
            bounds.yrAxis = {
                dimension: {
                    width: dimensions.yrAxis.width,
                    height: dimensions.plot.height
                },
                position: {
                    top: top,
                    right: dimensions.legend.width + CHART_PADDING + HIDDEN_WIDTH
                }
            };
        }

        return bounds;
    }
};

module.exports = boundsMaker;

},{"./calculator.js":18,"./renderUtil.js":22}],18:[function(require,module,exports){
/**
 * @fileoverview calculator.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var AXIS_STANDARD_MULTIPLE_NUMS = [1, 2, 5, 10];

/**
 * Calculator.
 * @module calculator
 */
var calculator = {
    /**
     * Calculate scale from chart min, max data.
     *  - http://peltiertech.com/how-excel-calculates-automatic-chart-axis-limits/
     * @memberOf module:calculator
     * @param {number} min min minimum value of user data
     * @param {number} max max maximum value of user data
     * @param {number} tickCount tick count
     * @returns {{min: number, max: number}} scale axis scale
     */
    calculateScale: function(min, max) {
        var saveMin = 0,
            scale = {},
            iodValue; // increase or decrease value;

        if (min < 0) {
            saveMin = min;
            max -= min;
            min = 0;
        }

        iodValue = (max - min) / 20;
        scale.max = max + iodValue + saveMin;

        if (max / 6 > min) {
            scale.min = 0 + saveMin;
        } else {
            scale.min = min - iodValue + saveMin;
        }
        return scale;
    },

    /**
     * To normalize number.
     * @memberOf module:calculator
     * @param {number} value target value
     * @returns {number} normalized number
     */
    normalizeAxisNumber: function(value) {
        var standard = 0,
            flag = 1,
            normalized, mod;

        if (value === 0) {
            return value;
        } else if (value < 0) {
            flag = -1;
        }

        value *= flag;

        ne.util.forEachArray(AXIS_STANDARD_MULTIPLE_NUMS, function(num) {
            if (value < num) {
                if (num > 1) {
                    standard = num;
                }
                return false;
            } else if (num === 10) {
                standard = 10;
            }
        });

        if (standard < 1) {
            normalized = this.normalizeAxisNumber(value * 10) * 0.1;
        } else {
            mod = ne.util.mod(value, standard);
            normalized = ne.util.addition(value, (mod > 0 ? standard - mod : 0));
        }

        return normalized *= flag;
    },

    /**
     * To Make tick positions of pixel type.
     * @memberOf module:calculator
     * @param {number} size area width or height
     * @param {number} count tick count
     * @returns {array.<number>} positions
     */
    makePixelPositions: function(size, count) {
        var positions = [],
            pxScale, pxStep;

        if (count > 0) {
            pxScale = {min: 0, max: size - 1};
            pxStep = this.getScaleStep(pxScale, count);
            positions = ne.util.map(ne.util.range(0, size, pxStep), function(position) {
                return Math.round(position);
            });
            positions[positions.length - 1] = size - 1;
        }
        return positions;
    },

    /**
     * To make labels from scale.
     * @memberOf module:calculator
     * @param {{min: number, max: number}} scale axis scale
     * @param {number} step step between max and min
     * @returns {string[]} labels
     * @private
     */
    makeLabelsFromScale: function(scale, step) {
        var multipleNum = ne.util.findMultipleNum(step),
            min = scale.min * multipleNum,
            max = scale.max * multipleNum,
            labels = ne.util.range(min, max + 1, step * multipleNum);
        labels = ne.util.map(labels, function(label) {
            return label / multipleNum;
        });
        return labels;
    },

    /**
     * Get scale step.
     * @memberOf module:calculator
     * @param {{min: number, max: number}} scale axis scale
     * @param {number} count value count
     * @returns {number} scale step
     */
    getScaleStep: function(scale, count) {
        return (scale.max - scale.min) / (count - 1);
    },

    /**
     * Array pivot.
     * @memberOf module:calculator
     * @param {array.<array>} arr2d target 2d array
     * @returns {array.<array>} pivoted 2d array
     */
    arrayPivot: function(arr2d) {
        var result = [];
        ne.util.forEachArray(arr2d, function(arr) {
            ne.util.forEachArray(arr, function(value, index) {
                if (!result[index]) {
                    result[index] = [];
                }
                result[index].push(value);
            });
        });
        return result;
    }
};

module.exports = calculator;

},{}],19:[function(require,module,exports){
/**
 * @fileoverview Data converter.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var calculator = require('./calculator.js');

var concat = Array.prototype.concat;

/**
 * Data converter.
 * @module dataConverter
 */
var dataConverter = {
    /**
     * Convert user data.
     * @memberOf module:dataConverter
     * @param {array.<array>} userData
     * @param {object} chartOptions chart option
     * @returns {{
     *      labels: array.<string>,
     *      values: array.<number>,
     *      legendLabels: array.<string>,
     *      formatFunctions: array.<function>,
     *      formattedValues: array.<string>
     * }} converted data
     */
    convert: function(userData, chartOptions, chartType) {
        var labels = userData.categories,
            seriesData = userData.series,
            values = this._pickValues(seriesData),
            joinValues = this._joinValues(values),
            legendLabels = this._pickLegendLabels(seriesData),
            joinLegendLabels = this._joinLegendLabels(legendLabels, chartType),
            format = chartOptions && chartOptions.format || '',
            formatFunctions = this._findFormatFunctions(format),
            formattedValues = format ? this._formatValues(values, formatFunctions) : values;
        return {
            labels: labels,
            values: values,
            joinValues: joinValues,
            legendLabels: legendLabels,
            joinLegendLabels: joinLegendLabels,
            formatFunctions: formatFunctions,
            formattedValues: formattedValues
        };
    },

    /**
     * Separate label.
     * @memberOf module:dataConverter
     * @param {array.<array.<array>>} userData user data
     * @returns {{labels: (array.<string>), sourceData: array.<array.<array>>}} result data
     * @private
     */
    _separateLabel: function(userData) {
        var labels = userData[0].pop();
        return {
            labels: labels,
            sourceData: userData
        };
    },

    /**
     * Pick value.
     * @memberOf module:dataConverter
     * @param {array} items items
     * @returns {array} picked value
     * @private
     */
    _pickValue: function(items) {
        return [].concat(items.data);
    },

    /**
     * Pick values from axis data.
     * @memberOf module:dataConverter
     * @param {array.<array>} seriesData series data
     * @returns {string[]} values
     */
    _pickValues: function(seriesData) {
        var values, result;
        if (ne.util.isArray(seriesData)) {
            values = ne.util.map(seriesData, this._pickValue, this);
            result = calculator.arrayPivot(values);
        } else {
            result = {};
            ne.util.forEach(seriesData, function(groupValues, type) {
                values = ne.util.map(groupValues, this._pickValue, this);
                result[type] = calculator.arrayPivot(values);
            }, this);
        }
        return result;
    },

    /**
     * Join values.
     * @memberOf module:dataConverter
     * @param {array.<array>} values values
     * @returns {array.<number>} join values
     * @private
     */
    _joinValues: function(values) {
        var joinValues;

        if (ne.util.isArray(values)) {
            return values;
        }

        joinValues = ne.util.map(values, function(groupValues) {
            return groupValues;
        }, this);

        return concat.apply([], joinValues);
    },

    /**
     * Pick legend label.
     * @memberOf module:dataConverter
     * @param {object} item item
     * @returns {string} label
     * @private
     */
    _pickLegendLabel: function(item) {
        return item.name;
    },

    /**
     * Pick legend labels from axis data.
     * @memberOf module:dataConverter
     * @param {array.<array>} seriesData series data
     * @returns {string[]} labels
     */
    _pickLegendLabels: function(seriesData) {
        var result;
        if (ne.util.isArray(seriesData)) {
            result = ne.util.map(seriesData, this._pickLegendLabel, this);
        } else {
            result = {};
            ne.util.forEach(seriesData, function(groupValues, type) {
                result[type] = ne.util.map(groupValues, this._pickLegendLabel, this);
            }, this);
        }
        return result;
    },

    /**
     * Join legend labels.
     * @memberOf module:dataConverter
     * @param {array} legendLabels legend labels
     * @param {string} chartType chart type
     * @returns {array} labels
     * @private
     */
    _joinLegendLabels: function(legendLabels, chartType) {
        var result;
        if (ne.util.isArray(legendLabels)) {
            result = ne.util.map(legendLabels, function(label) {
                return {
                    chartType: chartType,
                    label: label
                };
            });
        } else {
            result = ne.util.map(legendLabels, function(labels, _chartType) {
                return ne.util.map(labels, function(label) {
                    return {
                        chartType: _chartType,
                        label: label
                    };
                });
            }, this);
            result = concat.apply([], result);
        }
        return result;
    },

    /**
     * To format group values.
     * @memberOf module:dataConverter
     * @param {array.<array>} groupValues group values
     * @param {function[]} formatFunctions format functions
     * @returns {string[]} formatted values
     * @private
     */
    _formatGroupValues: function(groupValues, formatFunctions) {
        return ne.util.map(groupValues, function(values) {
            return ne.util.map(values, function(value) {
                var fns = [value].concat(formatFunctions);
                return ne.util.reduce(fns, function(stored, fn) {
                    return fn(stored);
                });
            });
        });
    },

    /**
     * To format converted values.
     * @memberOf module:dataConverter
     * @param {array.<array>} chartValues chart values
     * @param {function[]} formatFunctions format functions
     * @returns {string[]} formatted values
     * @private
     */
    _formatValues: function(chartValues, formatFunctions) {
        var result;
        if (ne.util.isArray(chartValues)) {
            result = this._formatGroupValues(chartValues, formatFunctions);
        } else {
            result = {};
            ne.util.forEach(chartValues, function(groupValues, chartType) {
                result[chartType] = this._formatGroupValues(groupValues, formatFunctions);
            }, this);
        }
        return result;
    },

    /**
     * Pick max length under point.
     * @memberOf module:dataConverter
     * @param {string[]} values chart values
     * @returns {number} max length under point
     * @private
     */
    _pickMaxLenUnderPoint: function(values) {
        var max = 0;

        ne.util.forEachArray(values, function(value) {
            var len = ne.util.lengthAfterPoint(value);
            if (len > max) {
                max = len;
            }
        }, this);

        return max;
    },

    /**
     * Whether zero fill format or not.
     * @memberOf module:dataConverter
     * @param {string} format format
     * @returns {boolean} result boolean
     * @private
     */
    _isZeroFill: function(format) {
        return format.length > 2 && format.charAt(0) === '0';
    },

    /**
     * Whether decimal format or not.
     * @memberOf module:dataConverter
     * @param {string} format format
     * @returns {boolean} result boolean
     * @private
     */
    _isDecimal: function(format) {
        var indexOf = format.indexOf('.');
        return indexOf > -1 && indexOf < format.length - 1;
    },

    /**
     * Whether comma format or not.
     * @memberOf module:dataConverter
     * @param {string} format format
     * @returns {boolean} result boolean
     * @private
     */
    _isComma: function(format) {
        return format.indexOf(',') === format.split('.')[0].length - 4;
    },

    /**
     * Format zero fill.
     * @memberOf module:dataConverter
     * @param {number} len length of result
     * @param {string} value target value
     * @returns {string} formatted value
     * @private
     */
    _formatZeroFill: function(len, value) {
        var zero = '0';

        value += '';

        if (value.length >= len) {
            return value;
        }

        while (value.length < len) {
            value = zero + value;
        }

        return value;
    },

    /**
     * Format Decimal.
     * @memberOf module:dataConverter
     * @param {number} len length of under decimal point
     * @param {string} value target value
     * @returns {string} formatted value
     * @private
     */
    _formatDecimal: function(len, value) {
        var pow;

        if (len === 0) {
            return Math.round(value, 10);
        }

        pow = Math.pow(10, len);
        value = Math.round(value * pow) / pow;
        value = parseFloat(value).toFixed(len);
        return value;
    },

    /**
     * Format Comma.
     * @memberOf module:dataConverter
     * @param {string} value target value
     * @returns {string} formatted value
     * @private
     */
    _formatComma: function(value) {
        var comma = ',',
            underPointValue = '',
            values;

        value += '';

        if (value.indexOf('.') > -1) {
            values = value.split('.');
            value = values[0];
            underPointValue = '.' + values[1];
        }

        if (value.length < 4) {
            return value + underPointValue;
        }

        values = (value).split('').reverse();
        values = ne.util.map(values, function(char, index) {
            var result = [char];
            if ((index + 1) % 3 === 0) {
                result.push(comma);
            }
            return result;
        });

        return concat.apply([], values).reverse().join('') + underPointValue;
    },

    /**
     * Find format functions.
     * @memberOf module:dataConverter
     * @param {string} format format
     * @param {string[]} values chart values
     * @returns {function[]} functions
     */
    _findFormatFunctions: function(format) {
        var funcs = [],
            len;

        if (!format) {
            return [];
        }

        if (this._isDecimal(format)) {
            len = this._pickMaxLenUnderPoint([format]);
            funcs = [ne.util.bind(this._formatDecimal, this, len)];
        } else if (this._isZeroFill(format)) {
            len = format.length;
            funcs = [ne.util.bind(this._formatZeroFill, this, len)];
            return funcs;
        }

        if (this._isComma(format)) {
            funcs.push(this._formatComma);
        }

        return funcs;
    }
};

module.exports = dataConverter;

},{"./calculator.js":18}],20:[function(require,module,exports){
/**
 * @fileoverview DOM Handler.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

/**
 * DOM Handler.
 * @module domHandler
 */
var domHandler = {
    /**
     * Create element.
     * @memberOf module:domHandler
     * @param {string} tag html tag
     * @param {string} newClass class name
     * @returns {HTMLElement} created element
     */
    create: function(tag, newClass) {
        var el = document.createElement(tag);

        if (newClass) {
            this.addClass(el, newClass);
        }

        return el;
    },

    /**
     * Get class names.
     * @memberOf module:domHandler
     * @param {HTMLElement} el target element
     * @returns {array} names
     * @private
     */
    _getClassNames: function(el) {
        var className = el.className ? el.className : '',
            classNames = className ? className.split(' ') : [];
        return classNames;
    },

    /**
     * Add css class to target element.
     * @memberOf module:domHandler
     * @param {HTMLElement} el target element
     * @param {string} newClass add class name
     */
    addClass: function(el, newClass) {
        var classNames = this._getClassNames(el),
            index = ne.util.inArray(newClass, classNames);

        if (index > -1) {
            return;
        }

        classNames.push(newClass);
        el.className = classNames.join(' ');
    },

    /**
     * Remove css class from target element.
     * @memberOf module:domHandler
     * @param {HTMLElement} el target element
     * @param {string} rmClass remove class name
     */
    removeClass: function(el, rmClass) {
        var classNames = this._getClassNames(el),
            index = ne.util.inArray(rmClass, classNames);

        if (index === -1) {
            return;
        }

        classNames.splice(index, 1);
        el.className = classNames.join(' ');
    },

    /**
     * Whether class exist or not.
     * @memberOf module:domHandler
     * @param {HTMLElement} el target element
     * @param {string} findClass target css class
     * @returns {boolean} has class
     */
    hasClass: function(el, findClass) {
        var classNames = this._getClassNames(el),
            index = ne.util.inArray(findClass, classNames);
        return index > -1;
    },

    /**
     * Find parent by class name.
     * @memberOf module:domHandler
     * @param {HTMLElement} el target element
     * @param {string} className target css class
     * @param {string} lastClass last css class
     * @returns {HTMLElement} result element
     */
    findParentByClass: function(el, className, lastClass) {
        var parent = el.parentNode;
        if (!parent) {
            return null;
        } else if (this.hasClass(parent, className)) {
            return parent;
        } else if (parent.nodeName === 'BODY' || this.hasClass(parent, lastClass)) {
            return null;
        } else {
            return this.findParentByClass(parent, className, lastClass);
        }
    },

    /**
     * Append child element.
     * @memberOf module:domHandler
     * @param {HTMLElement} container container element
     * @param {HTMLElement} children child element
     */
    append: function(container, children) {
        if (!container || !children) {
            return;
        }
        children = ne.util.isArray(children) ? children : [children];

        ne.util.forEachArray(children, function(child) {
            if (!child) {
                return;
            }
            container.appendChild(child);
        }, this);
    }
};

module.exports = domHandler;

},{}],21:[function(require,module,exports){
/**
 * @fileoverview Event listener.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

/**
 * Event listener.
 * @module eventListener
 */
var eventListener = {
    /**
     * Event listener for IE.
     * @memberOf module:eventListener
     * @param {string} eventName event name
     * @param {HTMLElement} el target element
     * @param {function} callback callback function
     * @private
     */
    _attachEvent: function (eventName, el, callback) {
        if (typeof callback == "object" && callback.handleEvent) {
            el.attachEvent("on" + eventName, function () {
                callback.handleEvent.call(callback);
            });
        } else {
            el.attachEvent("on" + eventName, callback);
        }
    },

    /**
     * Event listener for other browsers.
     * @memberOf module:eventListener
     * @param {string} eventName event name
     * @param {HTMLElement} el target element
     * @param {function} callback callback function
     * @private
     */
    _addEventListener: function (eventName, el, callback) {
        try {
            el.addEventListener(eventName, callback);
        } catch (e) {
            if (typeof callback == "object" && callback.handleEvent) {
                el.addEventListener(eventName, function (event) {
                    callback.handleEvent.call(callback, event);
                });
            } else {
                throw e;
            }
        }
    },
    /**
     * Bind event function.
     * @memberOf module:eventListener
     * @param {string} eventName event name
     * @param {HTMLElement} el target element
     * @param {function} callback callback function
     */
    bindEvent: function (eventName, el, callback) {
        var bindEvent;
        if ("addEventListener" in el) {
            bindEvent = this._addEventListener;
        } else if ("attachEvent" in el) {
            bindEvent = this._attachEvent;
        }
        this.bindEvent = bindEvent;
        bindEvent(eventName, el, callback);
    }
};

module.exports = eventListener;

},{}],22:[function(require,module,exports){
/**
 * @fileoverview Util for rendering.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var dom = require('./domHandler'),
    chartConst = require('./../const.js');

var browser = ne.util.browser,
    isIE8 = browser.msie && browser.version === 8;

/**
 * Util for rendering.
 * @module renderUtil
 */
var renderUtil = {
    /**
     * Concat string.
     * @memberOf module:renderUtil
     * @params {...string} target strings
     * @returns {string} concat string
     */
    concatStr: function() {
        return String.prototype.concat.apply('', arguments);
    },

    /**
     * To make cssText for font.
     * @memberOf module:renderUtil
     * @param {{fontSize: number, fontFamily: string, color: string}} theme font theme
     * @returns {string} cssText
     */
    makeFontCssText: function(theme) {
        var cssTexts = [];

        if (!theme) {
            return '';
        }

        if (theme.fontSize) {
            cssTexts.push(this.concatStr('font-size:', theme.fontSize, 'px'));
        }

        if (theme.fontFamily) {
            cssTexts.push(this.concatStr('font-family:', theme.fontFamily));
        }

        if (theme.color) {
            cssTexts.push(this.concatStr('color:', theme.color));
        }

        return cssTexts.join(';');
    },

    /**
     * Create element for size check.
     * @memberOf module:renderUtil
     * @returns {HTMLElement} element
     * @private
     */
    _createSizeCheckEl: function() {
        var elDiv = dom.create('DIV'),
            elSpan = dom.create('SPAN');

        elDiv.appendChild(elSpan);
        elDiv.style.cssText = 'position:relative;top:10000px;left:10000px;line-height:1';
        return elDiv;
    },

    /**
     * Get rendered label size (width or height).
     * @memberOf module:renderUtil
     * @param {string} label label
     * @param {object} theme theme
     * @param {string} property element property
     * @returns {number} size
     * @private
     */
    _getRenderedLabelSize: function(label, theme, property) {
        var elDiv = this._createSizeCheckEl(),
            elSpan = elDiv.firstChild,
            labelSize;

        theme = theme || {};
        elSpan.innerHTML = label;
        elSpan.style.fontSize = (theme.fontSize || chartConst.DEFAULT_LABEL_FONT_SIZE) + 'px';

        if (theme.fontFamily) {
            elSpan.style.fontFamily = theme.fontFamily;
        }

        document.body.appendChild(elDiv);
        labelSize = elSpan[property];
        document.body.removeChild(elDiv);
        return labelSize;
    },

    /**
     * Get rendered label width.
     * @memberOf module:renderUtil
     * @param {string} label label
     * @param {{fontSize: number, fontFamily: string, color: string}} theme label theme
     * @returns {number} width
     */
    getRenderedLabelWidth: function(label, theme) {
        var labelWidth = this._getRenderedLabelSize(label, theme, 'offsetWidth');
        return labelWidth;
    },

    /**
     * Get rendered label height.
     * @memberOf module:renderUtil
     * @param {string} label label
     * @param {{fontSize: number, fontFamily: string, color: string}} theme label theme
     * @returns {number} height
     */
    getRenderedLabelHeight: function(label, theme) {
        var labelHeight = this._getRenderedLabelSize(label, theme, 'offsetHeight');
        return labelHeight;
    },

    /**
     * Render dimension.
     * @memberOf module:renderUtil
     * @param {HTMLElement} el target element
     * @param {{width: number, height: number}} dimension dimension
     */
    renderDimension: function(el, dimension) {
        el.style.cssText = [
            this.concatStr('width:', dimension.width, 'px'),
            this.concatStr('height:', dimension.height, 'px')
        ].join(';');
    },

    /**
     * Render position(top, right).
     * @memberOf module:renderUtil
     * @param {HTMLElement} el target element
     * @param {{top: number, left: number, right: number}} position position
     */
    renderPosition: function(el, position) {
        if (ne.util.isUndefined(position)) {
            return;
        }

        if (position.top) {
            el.style.top = position.top + 'px';
        }

        if (position.left) {
            el.style.left = position.left + 'px';
        }

        if (position.right) {
            el.style.right = position.right + 'px';
        }
    },

    /**
     * Render background.
     * @memberOf module:renderUtil
     * @param {HTMLElement} el target element
     * @param {string} background background option
     */
    renderBackground: function(el, background) {
        if (!background) {
            return;
        }

        el.style.background = background;
    },

    /**
     * Render title.
     * @memberOf module:renderUtil
     * @param {string} title title
     * @param {{fontSize: number, color: string, background: string}} theme title theme
     * @param {string} className css class name
     * @returns {HTMLElement} title element
     */
    renderTitle: function(title, theme, className) {
        var elTitle, cssText;

        if (!title) {
            return null;
        }

        elTitle = dom.create('DIV', className);
        elTitle.innerHTML = title;

        cssText = renderUtil.makeFontCssText(theme);

        if (theme.background) {
            cssText += ';' + this.concatStr('background:', theme.background);
        }

        elTitle.style.cssText = cssText;

        return elTitle;
    },

    /**
     * Whether IE8 or not.
     * @memberOf module:renderUtil
     * @returns {boolean} result boolean
     */
    isIE8: function() {
        return isIE8;
    }
};

module.exports = renderUtil;

},{"./../const.js":12,"./domHandler":20}],23:[function(require,module,exports){
/**
 * @fileoverview This is template maker.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

module.exports = {
    /**
     * This is template maker.
     * @param {string} html html
     * @returns {function} template function
     * @eaxmple
     *
     *   var template = templateMaker.template('<span>{{ name }}</span>'),
     *       result = template({name: 'John');
     *   console.log(result); // <span>John</span>
     *
     */
    template: function (html) {
        return function (data) {
            var result = html;
            ne.util.forEach(data, function (value, key) {
                var regExp = new RegExp('{{\\s*' + key + '\\s*}}', 'g');
                result = result.replace(regExp, value);
            });
            return result;
        };
    }
};

},{}],24:[function(require,module,exports){
/**
 * @fileoverview  Legend component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const.js'),
    dom = require('../helpers/domHandler.js'),
    renderUtil = require('../helpers/renderUtil.js'),
    defaultTheme = require('../themes/defaultTheme.js'),
    legendTemplate = require('./../legends/legendTemplate.js');

var LEGEND_RECT_WIDTH = 12,
    LABEL_PADDING_TOP = 2,
    LINE_MARGIN_TOP = 5;

var Legend = ne.util.defineClass(/** @lends Legend.prototype */ {
    /**
     * Legend component.
     * @constructs Legend
     * @param {object} params parameters
     *      @param {number} params.legendLabels legend labels
     *      @param {object} params.bound axis bound
     *      @param {object} params.theme axis theme
     */
    init: function(params) {
        ne.util.extend(this, params);
        /**
         * Legend view className
         */
        this.className = 'ne-chart-legend-area';
    },

    /**
     * Render legend.
     * @param {object} bound plot bound
     * @returns {HTMLElement} legend element
     */
    render: function() {
        var el = dom.create('DIV', this.className);
        el.innerHTML = this._makeLegendHtml();
        renderUtil.renderPosition(el, this.bound.position);
        this._renderLabelTheme(el, this.theme.label);

        return el;
    },

    /**
     * Set theme to legend labels
     * @param {array.<object>} labels labels
     * @param {object} theme legend theme
     * @returns {array.<object>} labels
     * @private
     */
    _setThemeToLabels: function(labels, theme) {
        var result = ne.util.map(labels, function(item, index) {
            var itemTheme = {
                color: theme.colors[index]
            };

            if (theme.singleColors) {
                itemTheme.singleColor = theme.singleColors[index];
            }
            if (theme.borderColor) {
                itemTheme.borderColor = theme.borderColor;
            }
            item.theme = itemTheme;
            return item;
        }, this);

        return result;
    },

    /**
     * To make legend labels.
     * @returns {array.<object>} legend labels.
     * @private
     */
    _makeLegendLabels: function() {
        var chartType = this.chartType,
            legendLabels = this.legendLabels,
            joinLegendLabels = this.joinLegendLabels,
            labelLen = legendLabels.length,
            theme = this.theme,
            chartLegendTheme = ne.util.filter(theme, function(item, name) {
                return ne.util.inArray(name, chartConst.SERIES_PROPS) === -1 && name !== 'label';
            }),
            chartTypes = ne.util.keys(chartLegendTheme),
            defaultLegendTheme = {
                colors: defaultTheme.series.colors
            },
            chartTheme, result;

        if (!chartTypes.length) {
            result = this._setThemeToLabels(joinLegendLabels, theme);
        } else {
            chartTheme = theme[chartType] || defaultLegendTheme;
            result = this._setThemeToLabels(joinLegendLabels.slice(0, labelLen), chartTheme);
            chartTheme = theme[ne.util.filter(chartTypes, function(propName) {
                return propName !== chartType;
            })[0]] || defaultLegendTheme;
            result = result.concat(this._setThemeToLabels(joinLegendLabels.slice(labelLen), chartTheme));
        }
        return result;
    },

    /**
     * To make legend html.
     * @returns {string} legend html
     * @private
     */
    _makeLegendHtml: function() {
        var labels = this._makeLegendLabels(),
            template = legendTemplate.TPL_LEGEND,
            labelHeight = renderUtil.getRenderedLabelHeight(labels[0].label, labels[0].theme) + (LABEL_PADDING_TOP * 2),
            baseMarginTop = parseInt((labelHeight - LEGEND_RECT_WIDTH) / 2, 10) - 1,
            html = ne.util.map(labels, function(label, index) {
                var borderCssText = label.borderColor ? renderUtil.concatStr(';border:1px solid ', label.borderColor) : '',
                    rectMargin, marginTop, data;
                if (label.chartType === 'line') {
                    marginTop = baseMarginTop + LINE_MARGIN_TOP;
                } else {
                    marginTop = baseMarginTop;
                }
                rectMargin = renderUtil.concatStr(';margin-top:', marginTop, 'px');

                data = {
                    cssText: renderUtil.concatStr('background-color:', label.theme.singleColor || label.theme.color, borderCssText, rectMargin),
                    height: labelHeight,
                    chartType: label.chartType || 'rect',
                    label: label.label
                };
                return template(data);
            }, this).join('');
        return html;
    },

    /**
     * Render css style of label area.
     * @param {HTMLElement} el label area element
     * @param {{fontSize:number, fontFamily: string, color: string}} theme label theme
     * @private
     */
    _renderLabelTheme: function(el, theme) {
        var cssText = renderUtil.makeFontCssText(theme);
        el.style.cssText += ';' + cssText;
    }
});

module.exports = Legend;

},{"../const.js":12,"../helpers/domHandler.js":20,"../helpers/renderUtil.js":22,"../themes/defaultTheme.js":39,"./../legends/legendTemplate.js":25}],25:[function(require,module,exports){
/**
 * @fileoverview This is templates of legend view.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

var templateMaker = require('../helpers/templateMaker.js');

var tags = {
    HTML_LEGEND: '<div class="ne-chart-legend">' +
        '<div class="ne-chart-legend-rect {{ chartType }}" style="{{ cssText }}"></div>' +
        '<div class="ne-chart-legend-label" style="height:{{ height }}px">{{ label }}</div></div>'
};

module.exports = {
    TPL_LEGEND: templateMaker.template(tags.HTML_LEGEND)
};

},{"../helpers/templateMaker.js":23}],26:[function(require,module,exports){
/**
 * @fileoverview Plot component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var dom = require('../helpers/domHandler.js'),
    calculator = require('../helpers/calculator.js'),
    renderUtil = require('../helpers/renderUtil.js'),
    plotTemplate = require('./plotTemplate.js');

var Plot = ne.util.defineClass(/** @lends Plot.prototype */ {
    /**
     * Plot component.
     * @constructs Plot
     * @param {object} params parameters
     *      @param {number} params.vTickCount vertical tick count
     *      @param {number} params.hTickCount horizontal tick count
     *      @param {object} params.bound axis bound
     *      @param {object} params.theme axis theme
     */
    init: function(params) {
        ne.util.extend(this, params);
        /**
         * Plot view className
         * @type {string}
         */
        this.className = 'ne-chart-plot-area';
    },

    /**
     * Render plot.
     * @param {{width: number, height: number, top: number, right: number}} bound plot area bound
     * @returns {HTMLElement} plot element
     */
    render: function() {
        var el = dom.create('DIV', this.className),
            bound = this.bound;
        renderUtil.renderDimension(el, bound.dimension);
        renderUtil.renderPosition(el, bound.position);
        this._renderLines(el, bound.dimension);

        return el;
    },

    /**
     * Render plot lines.
     * @param {HTMLElement} el element
     * @param {{width: number, height: number}} dimension plot area dimension
     * @private
     */
    _renderLines: function(el, dimension) {
        var hPositions = this.makeHorizontalPixelPositions(dimension.width),
            vPositions = this.makeVerticalPixelPositions(dimension.height),
            theme = this.theme,
            lineHtml = '';

        lineHtml += this._makeLineHtml({
            positions: hPositions,
            size: dimension.height,
            className: 'vertical',
            positionType: 'left',
            sizeType: 'height',
            lineColor: theme.lineColor
        });
        lineHtml += this._makeLineHtml({
            positions: vPositions,
            size: dimension.width,
            className: 'horizontal',
            positionType: 'bottom',
            sizeType: 'width',
            lineColor: theme.lineColor
        });

        el.innerHTML = lineHtml;

        renderUtil.renderBackground(el, theme.background);
    },

    /**
     * To make html of plot line.
     * @param {object} params parameters
     *      @param {array.<object>} params.positions positions
     *      @param {number} params.size width or height
     *      @param {string} params.className line className
     *      @param {string} params.positionType position type (left or bottom)
     *      @param {string} params.sizeType size type (size or height)
     *      @param {string} params.lineColor line color
     * @returns {string} html
     * @private
     */
    _makeLineHtml: function(params) {
        var template = plotTemplate.TPL_PLOT_LINE,
            lineHtml = ne.util.map(params.positions, function(position) {
                var cssTexts = [
                        renderUtil.concatStr(params.positionType, ':', position, 'px'),
                        renderUtil.concatStr(params.sizeType, ':', params.size, 'px')
                    ], data;

                if (params.lineColor) {
                    cssTexts.push(renderUtil.concatStr('background-color:', params.lineColor));
                }

                data = {className: params.className, cssText: cssTexts.join(';')};
                return template(data);
            }, this).join('');
        return lineHtml;
    },

    /**
     * To make pixel value of vertical positions
     * @param {number} height plot height
     * @returns {array.<number>} positions
     */
    makeVerticalPixelPositions: function(height) {
        var positions = calculator.makePixelPositions(height, this.vTickCount);
        positions.shift();
        return positions;
    },

    /**
     * To make pixel value of horizontal positions.
     * @param {number} width plot width
     * @returns {array.<number>} positions
     */
    makeHorizontalPixelPositions: function(width) {
        var positions = calculator.makePixelPositions(width, this.hTickCount);
        positions.shift();
        return positions;
    }
});

module.exports = Plot;

},{"../helpers/calculator.js":18,"../helpers/domHandler.js":20,"../helpers/renderUtil.js":22,"./plotTemplate.js":27}],27:[function(require,module,exports){
/**
 * @fileoverview This is templates of plot view .
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

var templateMaker = require('../helpers/templateMaker.js');

var tags = {
    HTML_PLOT_LINE: '<div class="ne-chart-plot-line {{ className }}" style="{{ cssText }}"></div>'
};

module.exports = {
    TPL_PLOT_LINE: templateMaker.template(tags.HTML_PLOT_LINE)
};

},{"../helpers/templateMaker.js":23}],28:[function(require,module,exports){
/**
 * @fileoverview Raphael render plugin.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var BarChart = require('./raphaelBarChart.js'),
    LineChart = require('./raphaelLineChart.js'),
    PieChart = require('./raphaelPieChart.js');

var pluginName = 'raphael',
    pluginRaphael;

pluginRaphael = {
    bar: BarChart,
    column: BarChart,
    line: LineChart,
    pie: PieChart
};

ne.application.chart.registerPlugin(pluginName, pluginRaphael);

},{"./raphaelBarChart.js":29,"./raphaelLineChart.js":30,"./raphaelPieChart.js":31}],29:[function(require,module,exports){
/**
 * @fileoverview Raphael bar chart renderer.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Raphael = window.Raphael;

/**
 * @classdesc RaphaelBarChart is graph renderer.
 * @class RaphaelBarChart
 */
var RaphaelBarChart = ne.util.defineClass(/** @lends RaphaelBarChart.prototype */ {
    /**
     * Render function of bar chart
     * @param {object} paper raphael paper
     * @param {HTMLElement} container container element
     * @param {{size: object, model: object, options: object, tooltipPosition: string}} data chart data
     * @param {function} inCallback mouseover callback
     * @param {function} outCallback mouseout callback
     * @return {object} paper raphael paper
     */
    render: function(paper, container, data, inCallback, outCallback) {
        var groupBounds = data.groupBounds,
            dimension = data.dimension;

        if (!groupBounds) {
            return;
        }

        if (!paper) {
            paper = Raphael(container, dimension.width, dimension.height);
        }
        this._renderBars(paper, data.theme, groupBounds, inCallback, outCallback);

        return paper;
    },

    /**
     * Render bars.
     * @param {object} paper raphael paper
     * @param {{colors: string[], singleColors: string[], borderColor: string}} theme bar chart theme
     * @param {array.<array.<{left: number, top:number, width: number, height: number}>>} groupBounds bounds
     * @param {function} inCallback in callback
     * @param {function} outCallback out callback
     * @private
     */
    _renderBars: function(paper, theme, groupBounds, inCallback, outCallback) {
        var singleColors = (groupBounds[0].length === 1) && theme.singleColors || [],
            colors = theme.colors,
            borderColor = theme.borderColor || 'none';
        ne.util.forEachArray(groupBounds, function(bounds, groupIndex) {
            var singleColor = singleColors[groupIndex];
            ne.util.forEachArray(bounds, function(bound, index) {
                var color = singleColor || colors[index],
                    id = groupIndex + '-' + index,
                    rect = this._renderBar(paper, color, borderColor, bound);
                if (rect) {
                    this._bindHoverEvent(rect, bound, id, inCallback, outCallback);
                }
            }, this);
        }, this);
    },

    /**
     * Render rect
     * @param {object} paper raphael paper
     * @param {string} color series color
     * @param {string} borderColor series borderColor
     * @param {{left: number, top: number, width: number, height: number}} bound bound
     * @returns {object} bar rect
     * @private
     */
    _renderBar: function(paper, color, borderColor, bound) {
        if (bound.width < 0 || bound.height < 0) {
            return null;
        }
        var rect = paper.rect(bound.left, bound.top, bound.width, bound.height);
        rect.attr({
            fill: color,
            stroke: borderColor
        });

        return rect;
    },

    /**
     * Bind hover event.
     * @param {object} rect raphael rect
     * @param {{left: number, top: number, width: number, height: number}} bound bound
     * @param {string} id tooltip id
     * @param {function} inCallback in callback
     * @param {function} outCallback out callback
     * @private
     */
    _bindHoverEvent: function(rect, bound, id, inCallback, outCallback) {
        rect.hover(function() {
            inCallback(bound, id);
        }, function() {
            outCallback(id);
        });
    }
});

module.exports = RaphaelBarChart;

},{}],30:[function(require,module,exports){
/**
 * @fileoverview Raphael line chart renderer.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Raphael = window.Raphael,
    DEFAULT_DOT_WIDTH = 4,
    HOVER_DOT_WIDTH = 5;

/**
 * @classdesc RaphaelLineCharts is graph renderer.
 * @class RaphaelLineChart
 */
var RaphaelLineChart = ne.util.defineClass(/** @lends RaphaelLineChart.prototype */ {
    /**
     * Render function or line chart.
     * @param {object} paper raphael paper
     * @param {HTMLElement} container container
     * @param {{groupPositions: array.<array>, dimension: object, theme: object, options: object}} data render data
     * @param {function} inCallback in callback
     * @param {function} outCallback out callback
     * @return {object} paper raphael paper
     */
    render: function(paper, container, data, inCallback, outCallback) {
        var dimension = data.dimension,
            groupPositions = data.groupPositions,
            theme = data.theme,
            colors = theme.colors,
            opacity = data.options.hasDot ? 1 : 0,
            groupPaths = this._getLinesPath(groupPositions),
            borderStyle = this._makeBorderStyle(theme.borderColor, opacity),
            outDotStyle = this._makeOutDotStyle(opacity, borderStyle),
            groupDots;

        if (!paper) {
            paper = Raphael(container, dimension.width, dimension.height);
        }

        this._renderLines(paper, groupPaths, colors);
        groupDots = this._renderDots(paper, groupPositions, colors, opacity, borderStyle);

        this.outDotStyle = outDotStyle;
        this.groupDots = groupDots;

        this._attachEvent(groupDots, groupPositions, outDotStyle, inCallback, outCallback);

        return paper;
    },

    /**
     * To make border style.
     * @param {string} borderColor border color
     * @param {number} opacity opacity
     * @returns {{stroke: string, stroke-width: number, strike-opacity: number}} border style
     * @private
     */
    _makeBorderStyle: function(borderColor, opacity) {
        var borderStyle;
        if (borderColor) {
            borderStyle = {
                'stroke': borderColor,
                'stroke-width': 1,
                'stroke-opacity': opacity
            };
        }
        return borderStyle;
    },

    /**
     * To make dot style for mouseout event.
     * @param {number} opacity opacity
     * @param {object} borderStyle border style
     * @returns {{fill-opacity: number, stroke-opacity: number, r: number}} style
     * @private
     */
    _makeOutDotStyle: function(opacity, borderStyle) {
        var outDotStyle = {
            'fill-opacity': opacity,
            'stroke-opacity': 0,
            r: 4
        };

        if (borderStyle) {
            ne.util.extend(outDotStyle, borderStyle);
        }

        return outDotStyle;
    },

    /**
     * Render dot.
     * @param {object} paper raphael papaer
     * @param {{left: number, top: number}} position dot position
     * @param {string} color dot color
     * @param {number} opacity opacity
     * @param {object} borderStyle border style
     * @returns {object} raphael dot
     * @private
     */
    _renderDot: function(paper, position, color, opacity, borderStyle) {
        var dot = paper.circle(position.left, position.top, DEFAULT_DOT_WIDTH),
            dotStyle = {
                fill: color,
                'fill-opacity': opacity,
                'stroke-opacity': 0
            };

        if (borderStyle) {
            ne.util.extend(dotStyle, borderStyle);
        }

        dot.attr(dotStyle);

        return dot;
    },

    /**
     * Render dots.
     * @param {object} paper raphael paper
     * @param {array.<array.<object>>} groupPositions positions
     * @param {string[]} colors colors
     * @param {number} opacity opacity
     * @param {object} borderStyle border style
     * @returns {array.<object>} dots
     * @private
     */
    _renderDots: function(paper, groupPositions, colors, opacity, borderStyle) {
        var dots = ne.util.map(groupPositions, function(positions, groupIndex) {
            var color = colors[groupIndex];
            return ne.util.map(positions, function(position) {
                var dot = this._renderDot(paper, position, color, opacity, borderStyle);
                return dot;
            }, this);
        }, this);

        return dots;
    },

    /**
     * To make line path.
     * @param {number} fx from x
     * @param {number} fy from y
     * @param {number} tx to x
     * @param {number} ty to y
     * @param {number} width width
     * @returns {string} path
     * @private
     */
    _makeLinePath: function(fx, fy, tx, ty, width) {
        var fromPoint = [fx, fy];
        var toPoint = [tx, ty];

        width = width || 1;

        if (fromPoint[0] === toPoint[0]) {
            fromPoint[0] = toPoint[0] = Math.round(fromPoint[0]) - (width % 2 / 2);
        }
        if (fromPoint[1] === toPoint[1]) {
            fromPoint[1] = toPoint[1] = Math.round(fromPoint[1]) + (width % 2 / 2);
        }

        return 'M' + fromPoint.join(' ') + 'L' + toPoint.join(' ');
    },

    /**
     * Get center position
     * @param {{left: number, top: number}} fromPos from position
     * @param {{left: number, top: number}} toPos to position
     * @returns {{left: number, top: number}} position
     * @private
     */
    _getCenter: function(fromPos, toPos) {
        return {
            left: (fromPos.left + toPos.left) / 2,
            top: (fromPos.top + toPos.top) / 2
        };
    },

    /**
     * Render line
     * @param {object} paper raphael paper
     * @param {string} path line path
     * @param {string} color line color
     * @param {number} strokeWidth stroke width
     * @returns {object} raphael line
     * @private
     */
    _renderLine: function(paper, path, color, strokeWidth) {
        var line = paper.path([path]),
            strokeStyle = {
                stroke: color,
                'stroke-width': strokeWidth || 2
            };

        if (color === 'transparent') {
            strokeStyle.stroke = '#fff';
            strokeStyle['stroke-opacity'] = 0;
        }
        line.attr(strokeStyle);

        return line;
    },

    /**
     * Render background lines.
     * @param {object} paper raphael paper
     * @param {array.<array.<string>>} groupPaths paths
     * @returns {array.<array.<object>>} lines
     * @private
     */
    _renderBgLines: function(paper, groupPaths) {
        var groupLines = this._renderLines(paper, groupPaths, [], 10);
        return groupLines;
    },

    /**
     * Render lines.
     * @param {object} paper raphael paper
     * @param {array.<array.<string>>} groupPaths paths
     * @param {string[]} colors line colors
     * @param {number} strokeWidth stroke width
     * @returns {array.<array.<object>>} lines
     * @private
     */
    _renderLines: function(paper, groupPaths, colors, strokeWidth) {
        var groupLines = ne.util.map(groupPaths, function(paths, groupIndex) {
            var color = colors[groupIndex] || 'transparent';
            return ne.util.map(paths, function(path) {
                var firstLine = this._renderLine(paper, path[0], color, strokeWidth),
                    secondLine = this._renderLine(paper, path[1], color, strokeWidth);
                return [firstLine, secondLine];
            }, this);
        }, this);

        return groupLines;
    },

    /**
     * Get lines path.
     * @param {array.<array.<object>>} groupPositions positions
     * @returns {array.<array.<string>>} paths
     * @private
     */
    _getLinesPath: function(groupPositions) {
        var groupPaths = ne.util.map(groupPositions, function(positions) {
            var fromPos = positions[0],
                rest = positions.slice(1);
            return ne.util.map(rest, function(position) {
                var centerPos = this._getCenter(fromPos, position),
                    firstPath = this._makeLinePath(fromPos.left, fromPos.top, centerPos.left, centerPos.top),
                    secondPath = this._makeLinePath(centerPos.left, centerPos.top, position.left, position.top);
                fromPos = position;
                return [firstPath, secondPath];
            }, this);
        }, this);
        return groupPaths;
    },

    /**
     * Bind hover event.
     * @param {object} target raphael item
     * @param {{left: number, top: number}} position position
     * @param {string} id id
     * @param {function} inCallback in callback
     * @param {function} outCallback out callback
     * @private
     */
    _bindHoverEvent: function(target, position, id, inCallback, outCallback) {
        var that = this;
        target.hover(function() {
            that.showedId = id;
            inCallback(position, id);
        }, function() {
            outCallback(id);
        });
    },

    /**
     * Attach event.
     * @param {array.<array.<object>>} groupDots dots
     * @param {array.<array.<object>>} groupPositions positions
     * @param {object} outDotStyle dot style
     * @param {function} inCallback in callback
     * @param {function} outCallback out callback
     * @private
     */
    _attachEvent: function(groupDots, groupPositions, outDotStyle, inCallback, outCallback) {
        ne.util.forEach(groupDots, function(dots, groupIndex) {
            ne.util.forEach(dots, function(dot, index) {
                var position = groupPositions[groupIndex][index],
                    id = index + '-' + groupIndex;
                    //prevIndex, prevDot, prevPositon, prevId, bgLines, lines;
                this._bindHoverEvent(dot, position, id, inCallback, outCallback);
                //if (index > 0) {
                //    prevIndex = index - 1;
                //    prevDot = scope[prevIndex];
                //    prevPositon = groupPositions[groupIndex][prevIndex];
                //    prevId = prevIndex + '-' + groupIndex;
                //    //bgLines = groupBgLines[groupIndex][prevIndex];
                //    lines = groupLines[groupIndex][prevIndex];
                //    this._bindHoverEvent(bgLines[0], prevDot, outDotStyle, prevPositon, prevId, inCallback, outCallback);
                //    this._bindHoverEvent(bgLines[1], dot, outDotStyle, position, id, inCallback, outCallback);
                //    this._bindHoverEvent(lines[0], prevDot, outDotStyle, prevPositon, prevId, inCallback, outCallback);
                //    this._bindHoverEvent(lines[1], dot, outDotStyle, position, id, inCallback, outCallback);
                //}
            }, this);
        }, this);
    },

    /**
     * Show animation.
     * @param {{groupIndex: number, index:number}} data show info
     */
    showAnimation: function(data) {
        var index = data.groupIndex, // Line chart has pivot values.
            groupIndex = data.index,
            dot = this.groupDots[groupIndex][index];

        dot.attr({
            'fill-opacity': 1,
            'stroke-opacity': 0.3,
            'stroke-width': 3,
            r: HOVER_DOT_WIDTH
        });
    },

    /**
     * Hide animation.
     * @param {{groupIndex: number, index:number}} data hide info
     */
    hideAnimation: function(data) {
        var index = data.groupIndex, // Line chart has pivot values.
            groupIndex = data.index,
            dot = this.groupDots[groupIndex][index];

        dot.attr(this.outDotStyle);
    }
});

module.exports = RaphaelLineChart;

},{}],31:[function(require,module,exports){
/**
 * @fileoverview Raphael pie chart renderer.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Raphael = window.Raphael,
    RAD = Math.PI / 180,
    ANIMATION_TIME = 500;

/**
 * @classdesc RaphaelPieCharts is graph renderer.
 * @class RaphaelPieChart
 */
var RaphaelPieChart = ne.util.defineClass(/** @lends RaphaelPieChart.prototype */ {
    /**
     * Render function or line chart.
     * @param {object} paper raphael paper
     * @param {HTMLElement} container container
     * @param {{percentValues: array.<number>, circleBounds: {cx: number, cy: number, r: number}, dimension: object, theme: object, options: object}} data render data
     * @param {function} inCallback in callback
     * @param {function} outCallback out callback
     * @return {object} paper raphael paper
     */
    render: function(paper, container, data, inCallback, outCallback) {
        var dimension = data.dimension;
        if (!paper) {
            paper = Raphael(container, dimension.width, dimension.height);
        }
        this._renderPie(paper, data, inCallback, outCallback);

        return paper;
    },

    /**
     * Render sector
     * @param {object} params parameters
     *      @param {object} params.paper raphael paper
     *      @param {{cx: number, cy: number, r:number}} params.circleBounds circle bounds
     *      @param {number} params.startAngle start angle
     *      @param {number} params.endAngle end angle
     *      @param {{fill: string, stroke: string, strike-width: string}} params.attrs attrs
     * @returns {object} raphael object
     * @private
     */
    _renderSector: function (params) {
        var cx = params.circleBounds.cx,
            cy = params.circleBounds.cy,
            r = params.circleBounds.r,
            x1 = cx + r * Math.cos(-params.startAngle * RAD),
            x2 = cx + r * Math.cos(-params.endAngle * RAD),
            y1 = cy + r * Math.sin(-params.startAngle * RAD),
            y2 = cy + r * Math.sin(-params.endAngle * RAD),
            pathParam = ["M", cx, cy, "L", x1, y1, "A", r, r, 0, +(params.endAngle - params.startAngle > 180), 0, x2, y2, "z"];
        return params.paper.path(pathParam).attr(params.attrs);
    },

    /**
     * Render pie graph.
     * @param {object} paper raphael paper
     * @param {{percentValues: array.<number>, circleBounds: {cx: number, cy: number, r: number}, dimension: object, theme: object, options: object}} data render data
     * @param {function} inCallback in callback
     * @param {function} outCallback out callback
     * @private
     */
    _renderPie: function(paper, data, inCallback, outCallback) {
        var percentValues = data.percentValues[0],
            circleBounds = data.circleBounds,
            colors = data.theme.colors,
            chartBackground = data.chartBackground,
            cx = circleBounds.cx,
            cy = circleBounds.cy,
            r = circleBounds.r,
            angle = 0,
            delta = 10,
            chart = paper.set();

        ne.util.forEachArray(percentValues, function(percentValue, index) {
            var anglePlus = 360 * percentValue,
                popAngle = angle + (anglePlus / 2),
                color = colors[index],
                p = this._renderSector({
                    paper: paper,
                    circleBounds: circleBounds,
                    startAngle: angle,
                    endAngle: angle + anglePlus,
                    attrs: {
                        fill: "90-" + color + "-" + color,
                        stroke: chartBackground,
                        'stroke-width': 1
                    }
                }),
                position = {
                    left: cx + (r + delta) * Math.cos(-popAngle * RAD),
                    top: cy + (r + delta) * Math.sin(-popAngle * RAD)
                };

            this._bindHoverEvent({
                target: p,
                position: position,
                id: '0-' + index,
                inCallback: inCallback,
                outCallback: outCallback
            });
            chart.push(p);
            angle += anglePlus;
        }, this);

        this.circleBounds = circleBounds;
        this.chart = chart;
    },

    /**
     * Bind hover event.
     * @param {object} params parameters
     *      @param {object} params.target raphael item
     *      @param {{left: number, top: number}} params.position position
     *      @param {string} params.id id
     *      @param {function} params.inCallback in callback
     *      @param {function} params.outCallback out callback
     * @private
     */
    _bindHoverEvent: function(params) {
        var that = this;
        params.target.mouseover(function () {
            that.showedId = params.id;
            params.inCallback(params.position, params.id);
        }).mouseout(function () {
            params.outCallback(params.id);
        });
    },

    /**
     * Show animation.
     * @param {{groupIndex: number, index:number}} data show info
     */
    showAnimation: function(data) {
        var target = this.chart[data.index],
            cx = this.circleBounds.cx,
            cy = this.circleBounds.cy;
        target.stop().animate({transform: "s1.1 1.1 " + cx + " " + cy}, ANIMATION_TIME, "elastic");
    },

    /**
     * Hide animation.
     * @param {{groupIndex: number, index:number}} data hide info
     */
    hideAnimation: function(data) {
        var target = this.chart[data.index];
        target.stop().animate({transform: ""}, ANIMATION_TIME, "elastic");
    }
});

module.exports = RaphaelPieChart;

},{}],32:[function(require,module,exports){
'use strict';

var chartConst = require('./const.js'),
    chartFactory = require('./factories/chartFactory.js'),
    BarChart = require('./charts/barChart.js'),
    ColumnChart = require('./charts/columnChart.js'),
    LineChart = require('./charts/lineChart.js'),
    ComboChart = require('./charts/comboChart.js'),
    PieChart = require('./charts/pieChart.js');

chartFactory.register(chartConst.CHART_TYPE_BAR, BarChart);
chartFactory.register(chartConst.CHART_TYPE_COLUMN, ColumnChart);
chartFactory.register(chartConst.CHART_TYPE_LINE, LineChart);
chartFactory.register(chartConst.CHART_TYPE_COMBO, ComboChart);
chartFactory.register(chartConst.CHART_TYPE_PIE, PieChart);

},{"./charts/barChart.js":5,"./charts/columnChart.js":7,"./charts/comboChart.js":8,"./charts/lineChart.js":9,"./charts/pieChart.js":10,"./const.js":12,"./factories/chartFactory.js":13}],33:[function(require,module,exports){
'use strict';

var chartConst = require('./const.js'),
    themeFactory = require('./factories/themeFactory.js'),
    defaultTheme = require('./themes/defaultTheme.js');

themeFactory.register(chartConst.DEFAULT_THEME_NAME, defaultTheme);

},{"./const.js":12,"./factories/themeFactory.js":15,"./themes/defaultTheme.js":39}],34:[function(require,module,exports){
/**
 * @fileoverview Bar chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series.js'),
    renderUtil = require('../helpers/renderUtil.js');

var HIDDEN_WIDTH = 1;

var BarChartSeries = ne.util.defineClass(Series, /** @lends Series.prototype */ {
    /**
     * Bar chart series component.
     * @constructs BarChartSeries
     * @extends Series
     * @param {object} params parameters
     *      @param {object} params.model series model
     *      @param {object} params.options series options
     *      @param {object} params.theme series theme
     */
    init: function() {
        Series.apply(this, arguments);
    },

    /**
     * To make bounds of bar chart.
     * @param {{width: number, height:number}} dimension bar chart dimension
     * @param {number} hiddenWidth hidden width
     * @returns {array.<array.<object>>} bounds
     */
    _makeBounds: function(dimension, hiddenWidth) {
        hiddenWidth = hiddenWidth || (renderUtil.isIE8() ? 0 : HIDDEN_WIDTH);
        if (!this.options.stacked) {
            return this._makeNormalBarBounds(dimension, hiddenWidth);
        } else {
            return this._makeStackedBarBounds(dimension, hiddenWidth);
        }
    },

    /**
     * To make bounds of normal bar chart.
     * @param {{width: number, height:number}} dimension bar chart dimension
     * @param {number} hiddenWidth hidden width
     * @returns {array.<array.<object>>} bounds
     * @private
     */
    _makeNormalBarBounds: function(dimension, hiddenWidth) {
        var groupValues = this.percentValues,
            groupHeight = (dimension.height / groupValues.length),
            barHeight = groupHeight / (groupValues[0].length + 1),
            bounds = ne.util.map(groupValues, function(values, groupIndex) {
                var paddingTop = (groupHeight * groupIndex) + (barHeight / 2) + hiddenWidth;
                return ne.util.map(values, function (value, index) {
                    return {
                        top: paddingTop + (barHeight * index),
                        left: -HIDDEN_WIDTH,
                        width: value * dimension.width,
                        height: barHeight
                    };
                }, this);
            });
        return bounds;
    },

    /**
     * To make bounds of stacked bar chart.
     * @param {{width: number, height:number}} dimension bar chart dimension
     * @param {number} hiddenWidth hidden width
     * @returns {array.<array.<object>>} bounds
     * @private
     */
    _makeStackedBarBounds: function(dimension, hiddenWidth) {
        var groupValues = this.percentValues,
            groupHeight = (dimension.height / groupValues.length),
            barHeight = groupHeight / 2,
            bounds = ne.util.map(groupValues, function(values, groupIndex) {
                var paddingTop = (groupHeight * groupIndex) + (barHeight / 2) + hiddenWidth,
                    left = -HIDDEN_WIDTH;
                return ne.util.map(values, function (value) {
                    var width = value * dimension.width,
                        bound = {
                            top: paddingTop,
                            left: left,
                            width: width,
                            height: barHeight
                        };
                    left = left + width;
                    return bound;
                }, this);
            });
        return bounds;
    }
});

module.exports = BarChartSeries;

},{"../helpers/renderUtil.js":22,"./series.js":38}],35:[function(require,module,exports){
/**
 * @fileoverview Column chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series.js');

var HIDDEN_WIDTH = 1;

var ColumnChartSeries = ne.util.defineClass(Series, /** @lends Series.prototype */ {
    /**
     * Column chart series component.
     * @constructs ColumnChartSeries
     * @extends Series
     * @param {object} params parameters
     *      @param {object} params.model series model
     *      @param {object} params.options series options
     *      @param {object} params.theme series theme
     */
    init: function() {
        Series.apply(this, arguments);
    },

    /**
     * To make bounds of column chart.
     * @param {{width: number, height:number}} dimension column chart dimension
     * @returns {array.<array.<object>>} bounds
     */
    _makeBounds: function(dimension) {
        if (!this.options.stacked) {
            return this._makeNormalColumnBounds(dimension);
        } else {
            return this._makeStackedColumnBounds(dimension);
        }
    },

    /**
     * To make bounds of normal column chart.
     * @param {{width: number, height:number}} dimension column chart dimension
     * @returns {array.<array.<object>>} bounds
     * @private
     */
    _makeNormalColumnBounds: function(dimension) {
        var groupValues = this.percentValues,
            groupWidth = (dimension.width / groupValues.length),
            barWidth = groupWidth / (groupValues[0].length + 1),
            bounds = ne.util.map(groupValues, function(values, groupIndex) {
                var paddingLeft = (groupWidth * groupIndex) + (barWidth / 2);
                return ne.util.map(values, function (value, index) {
                    var barHeight = value * dimension.height;
                    return {
                        top: dimension.height - barHeight + HIDDEN_WIDTH,
                        left: paddingLeft + (barWidth * index) - HIDDEN_WIDTH,
                        width: barWidth,
                        height: barHeight
                    };
                }, this);
            });
        return bounds;
    },

    /**
     * To make bounds of stacked column chart.
     * @param {{width: number, height:number}} dimension column chart dimension
     * @returns {array.<array.<object>>} bounds
     * @private
     */
    _makeStackedColumnBounds: function(dimension) {
        var groupValues = this.percentValues,
            groupWidth = (dimension.width / groupValues.length),
            barWidth = groupWidth / 2,
            bounds = ne.util.map(groupValues, function(values, groupIndex) {
                var paddingLeft = (groupWidth * groupIndex) + (barWidth / 2),
                    top = 0;
                return ne.util.map(values, function (value) {
                    var height = value * dimension.height,
                        bound = {
                            top: dimension.height - height - top,
                            left: paddingLeft,
                            width: barWidth,
                            height: height
                        };
                    top += height;
                    return bound;
                }, this);
            });
        return bounds;
    }
});

module.exports = ColumnChartSeries;

},{"./series.js":38}],36:[function(require,module,exports){
/**
 * @fileoverview Line chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series.js');

var LineChartSeries = ne.util.defineClass(Series, /** @lends Series.prototype */ {
    /**
     * Line chart series component.
     * @constructs LineChartSeries
     * @extends Series
     * @param {object} params parameters
     *      @param {object} params.model series model
     *      @param {object} params.options series options
     *      @param {object} params.theme series theme
     */
    init: function() {
        Series.apply(this, arguments);
    },

    /**
     * To make positions of line chart.
     * @param {{width: number, height:nunber}} dimension line chart dimension
     * @returns {array.<array.<object>>} positions
     */
    _makePositions: function(dimension) {
        var groupValues = this.percentValues,
            width = dimension.width,
            height = dimension.height,
            step = width / groupValues[0].length,
            start = step / 2,
            result = ne.util.map(groupValues, function(values) {
                return ne.util.map(values, function(value, index) {
                    return {
                        left: start + (step * index),
                        top: height - (value * height)
                    };
                });
            });
        return result;
    }
});

module.exports = LineChartSeries;

},{"./series.js":38}],37:[function(require,module,exports){
/**
 * @fileoverview Pie chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series.js');

var PieChartSeries = ne.util.defineClass(Series, /** @lends Series.prototype */ {
    /**
     * Line chart series component.
     * @constructs PieChartSeries
     * @extends Series
     * @param {object} params parameters
     *      @param {object} params.model series model
     *      @param {object} params.options series options
     *      @param {object} params.theme series theme
     */
    init: function() {
        Series.apply(this, arguments);
    },

    /**
     * To make percent value.
     * @param {{values: array, scale: {min: number, max: number}}} data series data
     * @returns {array.<array.<number>>} percent values
     * @private
     */
    _makePercentValues: function(data) {
        var result = ne.util.map(data.values, function(values) {
            var sum = ne.util.sum(values);
            return ne.util.map(values, function(value) {
                return value / sum;
            });
        });
        return result;
    },

    /**
     * To make circle bounds
     * @param {{width: number, height:number}} dimension chart dimension
     * @returns {{cx: number, cy: number, r: number}} circle bounds
     * @private
     */
    _makeCircleBounds: function(dimension) {
        var width = dimension.width,
            height = dimension.height,
            stdSize = ne.util.multiplication(ne.util.min([width, height]), 0.8);
        return {
            cx: ne.util.division(width, 2),
            cy: ne.util.division(height, 2),
            r: ne.util.division(stdSize, 2)
        };
    }
});

module.exports = PieChartSeries;

},{"./series.js":38}],38:[function(require,module,exports){
/**
 * @fileoverview Series base component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const.js'),
    renderUtil = require('../helpers/renderUtil.js'),
    dom = require('../helpers/domHandler.js'),
    pluginFactory = require('../factories/pluginFactory.js');

var HIDDEN_WIDTH = 1;

var Series = ne.util.defineClass(/** @lends Series.prototype */ {
    /**
     * Series base component.
     * @constructs Series
     * @param {object} params parameters
     *      @param {object} params.model series model
     *      @param {object} params.options series options
     *      @param {object} params.theme series theme
     */
    init: function(params) {
        var libType;

        ne.util.extend(this, params);
        libType = params.libType || chartConst.DEFAULT_PLUGIN;
        this.percentValues = this._makePercentValues(params.data, params.options.stacked);
        /**
         * Graph renderer
         * @type {object}
         */
        this.graphRenderer = pluginFactory.get(libType, params.chartType);

        /**
         * Series view className
         * @type {string}
         */
        this.className = 'ne-chart-series-area';
    },

    /**
     * Show tooltip (mouseover callback).
     * @param {string} prefix tooltip id prefix
     * @param {boolean} isVertical whether vertical or not
     * @param {{top:number, left: number, width: number, height: number}} bound graph bound information
     * @param {string} id tooltip id
     */
    showTooltip: function(prefix, isPointPosition, bound, id) {
        this.fire('showTooltip', {
            id: prefix + id,
            isPointPosition: isPointPosition,
            bound: bound
        });
    },

    /**
     * Hide tooltip (mouseout callback).
     * @param {string} prefix tooltip id prefix
     * @param {string} id tooltip id
     */
    hideTooltip: function(prefix, id) {
        this.fire('hideTooltip', {
            id: prefix + id
        });
    },

    /**
     * Render series.
     * @param {object} paper object for graph drawing
     * @returns {HTMLElement} series element
     */
    render: function(paper) {
        var el = dom.create('DIV', this.className),
            tooltipPrefix = this.tooltipPrefix,
            bound = this.bound,
            isPointPosition = !!this.isPointPosition,
            dimension = bound.dimension,
            position = bound.position,
            inCallback = ne.util.bind(this.showTooltip, this, tooltipPrefix, isPointPosition),
            outCallback = ne.util.bind(this.hideTooltip, this, tooltipPrefix),
            hiddenWidth = renderUtil.isIE8() ? 0 : HIDDEN_WIDTH,
            data;

        if (!paper) {
            renderUtil.renderDimension(el, dimension);

            position.top = position.top + (isPointPosition ? -HIDDEN_WIDTH : -1);
            position.right = position.right + (isPointPosition ? -(HIDDEN_WIDTH * 2) : -hiddenWidth);

            renderUtil.renderPosition(el, position);
        }

        data = {
            dimension: dimension,
            theme: this.theme,
            options: this.options
        };

        if (this._makeBounds) {
            data.groupBounds = this._makeBounds(dimension);
        } else if (this._makePositions) {
            data.groupPositions = this._makePositions(dimension);
        } else if (this._makeCircleBounds) {
            data.percentValues = this.percentValues;
            data.formattedValues = this.data.formattedValues;
            data.chartBackground = this.chartBackground;
            data.circleBounds = this._makeCircleBounds(dimension);
        }

        this.paper = this.graphRenderer.render(paper, el, data, inCallback, outCallback);
        return el;
    },

    /**
     * Get paper.
     * @returns {object} object for graph drawing
     */
    getPaper: function() {
        return this.paper;
    },

    /**
     * To make percent value.
     * @param {{values: array, scale: {min: number, max: number}}} data series data
     * @param {string} stacked stacked option
     * @returns {array.<array.<number>>} percent values
     * @private
     */
    _makePercentValues: function(data, stacked) {
        var result;
        if (stacked === chartConst.STACKED_NORMAL_TYPE) {
            result = this._makeNormalStackedPercentValues(data);
        } else if (stacked === chartConst.STACKED_PERCENT_TYPE) {
            result = this._makePercentStackedPercentValues(data);
        } else {
            result = this._makeNormalPercentValues(data);
        }

        return result;
    },

    /**
     * To make percent values about normal stacked option.
     * @param {{values: array, scale: {min: number, max: number}}} data series data
     * @returns {array} percent values about normal stacked option.
     * @private
     */
    _makeNormalStackedPercentValues: function(data) {
        var min = data.scale.min,
            max = data.scale.max,
            distance = max - min,
            percentValues = ne.util.map(data.values, function(values) {
                var plusValues = ne.util.filter(values, function(value) {
                        return value > 0;
                    }),
                    sum = ne.util.sum(plusValues),
                    groupPercent = (sum - min) / distance;
                return ne.util.map(values, function(value) {
                    return groupPercent * (value / sum);
                });
            });
        return percentValues;
    },

    /**
     * To make percent values about percent stacked option.
     * @param {{values: array, scale: {min: number, max: number}}} data series data
     * @returns {array} percent values about percent stacked option
     * @private
     */
    _makePercentStackedPercentValues: function(data) {
        var percentValues = ne.util.map(data.values, function(values) {
            var plusValues = ne.util.filter(values, function(value) {
                    return value > 0;
                }),
                sum = ne.util.sum(plusValues);
            return ne.util.map(values, function(value) {
                return value / sum;
            });
        });
        return percentValues;
    },

    /**
     * To make normal percent value.
     * @param {{values: array, scale: {min: number, max: number}}} data series data
     * @returns {array.<array.<number>>} percent values
     * @private
     */
    _makeNormalPercentValues: function(data) {
        var min = data.scale.min,
            max = data.scale.max,
            distance = max - min,
            percentValues = ne.util.map(data.values, function(values) {
                return ne.util.map(values, function(value) {
                    return (value - min) / distance;
                });
            });
        return percentValues;
    },

    /**
     * Call showDot function of graphRenderer.
     * @param {{groupIndex: number, index: number}} data data
     */
    onShowAnimation: function(data) {
        if (!this.graphRenderer.showAnimation) {
            return;
        }
        this.graphRenderer.showAnimation.call(this.graphRenderer, data);
    },

    /**
     * Call hideDot function of graphRenderer.
     * @param {{groupIndex: number, index: number}} data data
     */
    onHideAnimation: function(data) {
        if (!this.graphRenderer.hideAnimation) {
            return;
        }
        this.graphRenderer.hideAnimation.call(this.graphRenderer, data);
    }
});

ne.util.CustomEvents.mixin(Series);

module.exports = Series;

},{"../const.js":12,"../factories/pluginFactory.js":14,"../helpers/domHandler.js":20,"../helpers/renderUtil.js":22}],39:[function(require,module,exports){
var DEFAULT_COLOR = '#000000',
    DEFAULT_BACKGROUND = '#ffffff',
    EMPTY_FONT = '',
    DEFAULT_AXIS = {
        tickColor: DEFAULT_COLOR,
        title: {
            fontSize: 12,
            fontFamily: EMPTY_FONT,
            color: DEFAULT_COLOR
        },
        label: {
            fontSize: 12,
            fontFamily: EMPTY_FONT,
            color: DEFAULT_COLOR
        }
    };

var defaultTheme = {
    chart: {
        background: DEFAULT_BACKGROUND,
        fontFamily: 'Verdana'
    },
    title: {
        fontSize: 18,
        fontFamily: EMPTY_FONT,
        color: DEFAULT_COLOR
    },
    yAxis: DEFAULT_AXIS,
    xAxis: DEFAULT_AXIS,
    plot: {
        lineColor: '#dddddd',
        background: '#ffffff'
    },
    series: {
        colors: ['#ac4142', '#d28445', '#f4bf75', '#90a959', '#75b5aa', '#6a9fb5', '#aa759f', '#8f5536']
    },
    legend: {
        label: {
            fontSize: 12,
            fontFamily: EMPTY_FONT,
            color: DEFAULT_COLOR
        }
    }
};

module.exports = defaultTheme;

},{}],40:[function(require,module,exports){
/**
 * @fileoverview Tooltip component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var dom = require('../helpers/domHandler.js'),
    renderUtil = require('../helpers/renderUtil.js'),
    event = require('../helpers/eventListener.js'),
    templateMaker = require('../helpers/templateMaker.js'),
    tooltipTemplate = require('./tooltipTemplate.js');

var TOOLTIP_GAP = 5,
    HIDDEN_WIDTH = 1,
    TOOLTIP_CLASS_NAME = 'ne-chart-tooltip',
    HIDE_DELAY = 0;

var concat = Array.prototype.concat;

var Tooltip = ne.util.defineClass(/** @lends Tooltip.prototype */ {
    /**
     * Tooltip component.
     * @constructs Tooltip
     * @param {object} params parameters
     *      @param {array.<number>} params.values converted values
     *      @param {array} params.labels labels
     *      @param {array} params.legendLabels legend labels
     *      @param {string} prefix tooltip prefix
     *      @param {object} params.bound axis bound
     *      @param {object} params.theme axis theme
     */
    init: function(params) {
        ne.util.extend(this, params);
        /**
         * Tooltip view className
         * @type {string}
         */
        this.className = 'ne-chart-tooltip-area';
    },

    /**
     * Render tooltip.
     * @param {{position: object}} bound tooltip bound
     * @param {string} prefix tooltip id prefix
     * @returns {HTMLElement} tooltip element
     */
    render: function() {
        var el = dom.create('DIV', this.className),
            bound = this.bound;

        renderUtil.renderPosition(el, bound.position);
        el.innerHTML = this._makeTooltipsHtml();

        this.attachEvent(el);
        return el;
    },

    /**
     * To make tooltip data.
     * @returns {array.<object>} tooltip data
     * @private
     */
    _makeTooltipData: function() {
        var labels = this.labels,
            groupValues = this.values,
            legendLabels = this.legendLabels,
            tooltipData = ne.util.map(groupValues, function(values, groupIndex) {
                var items = ne.util.map(values, function(value, index) {
                    var item = {value: value,
                        legendLabel: legendLabels[index],
                        id: groupIndex + '-' + index
                    };
                    if (labels) {
                        item.label = labels[groupIndex];
                    }
                    return item;
                });

                return items;
            });
        return concat.apply([], tooltipData);
    },

    /**
     * To make html of tooltip.
     * @param {object} data tooltip data
     * @param {string} prefix tooltip id prefix
     * @returns {string} html
     * @private
     */
    _makeTooltipsHtml: function() {
        var options = this.options,
            prefix = this.prefix,
            data = this._makeTooltipData(),
            optionTemplate = options.template ? options.template : '',
            tplOuter = tooltipTemplate.TPL_TOOLTIP,
            tplTooltip = optionTemplate ? templateMaker.template(optionTemplate) : tooltipTemplate.TPL_DEFAULT_TEMPLATE,
            suffix = options.suffix ? '&nbsp;' + options.suffix : '',
            html = ne.util.map(data, function(tooltipData) {
                var id = prefix + tooltipData.id,
                    tooltipHtml;

                tooltipData = ne.util.extend({
                    label: '',
                    legendLabel: '',
                    value: '',
                    suffix: suffix
                }, tooltipData);
                tooltipHtml = tplTooltip(tooltipData);
                return tplOuter({
                    id: id,
                    html: tooltipHtml
                });
            }, this).join('');
        return html;
    },

    /**
     * Get index from id
     * @param {string} id tooltip id
     * @returns {array.<number>} indexes
     * @private
     */
    _getIndexFromId: function(id) {
        var ids = id.split('-'),
            sliceIndex = ids.length - 2;
        return ids.slice(sliceIndex);
    },

    /**
     * Fire custom event showAnimation.
     * @param {string} id tooltip id
     * @private
     */
    _fireShowAnimation: function(id) {
        var indexes = this._getIndexFromId(id);
        this.fire('showAnimation', {
            groupIndex: indexes[0],
            index: indexes[1]
        });
    },

    /**
     * Fire custom event hideAnimation.
     * @param {string} id tooltip id
     * @private
     */
    _fireHideAnimation: function(id) {
        console.log('_fireHideAnimation');
        var indexes = this._getIndexFromId(id);
        this.fire('hideAnimation', {
            groupIndex: indexes[0],
            index: indexes[1]
        });
    },

    /**
     * On mouseover event handler for tooltip area
     * @param {MouseEvent} e mouse event
     */
    onMouseover: function(e) {
        var elTarget = e.target || e.srcElement,
            id;

        if (!dom.hasClass(elTarget, TOOLTIP_CLASS_NAME)) {
            elTarget = dom.findParentByClass(elTarget, TOOLTIP_CLASS_NAME);
        }

        this.showedId = id = elTarget.id;
        this._fireShowAnimation(id);
    },

    /**
     * On mouseout event handler for tooltip area
     * @param {MouseEvent} e mouse event
     */
    onMouseout: function(e) {
        var elTarget = e.target || e.srcElement,
            that = this,
            indexes;

        if (!dom.hasClass(elTarget, TOOLTIP_CLASS_NAME)) {
            elTarget = dom.findParentByClass(elTarget, TOOLTIP_CLASS_NAME);
        }

        indexes = this._getIndexFromId(elTarget.id);

        this._hideTooltip(elTarget, function() {
            that.fire('hideAnimation', {
                groupIndex: indexes[0],
                index: indexes[1]
            });
        });
    },

    /**
     * Calculate tooltip point position
     * @param {object} params parameters
     *      @param {{bound: object}} params.data graph information
     *      @param {{width: number, height: number}} params.dimension tooltip dimension
     *      @param {string} params.positionOption position option (ex: 'left top')
     * @returns {{top: number, left: number}} position
     * @private
     */
    _calculatePointPosition: function(params) {
        var bound = params.data.bound,
            minusWidth = params.dimension.width - (bound.width || 0),
            lineGap = bound.width ? 0 : TOOLTIP_GAP,
            positionOption = params.positionOption || '',
            tooltipHeight = params.dimension.height,
            result = {};

        result.left = bound.left + (HIDDEN_WIDTH * 2);
        result.top = bound.top - tooltipHeight;

        if (positionOption.indexOf('left') > -1) {
            result.left -= minusWidth + lineGap;
        } else if (positionOption.indexOf('center') > -1) {
            result.left -= minusWidth / 2;
        } else {
            result.left += lineGap;
        }

        if (positionOption.indexOf('bottom') > -1) {
            result.top += tooltipHeight - HIDDEN_WIDTH + lineGap;
        } else if (positionOption.indexOf('middle') > -1) {
            result.top += tooltipHeight / 2;
        } else {
            result.top -= TOOLTIP_GAP + HIDDEN_WIDTH;
        }

        return result;
    },

    /**
     * Calculate tooltip rect position
     * @param {object} params parameters
     *      @param {{bound: object}} params.data graph information
     *      @param {{width: number, height: number}} params.dimension tooltip dimension
     *      @param {string} params.positionOption position option (ex: 'left top')
     * @returns {{top: number, left: number}} position
     * @private
     */
    _calculateRectPosition: function(params) {
        var bound = params.data.bound,
            minusHeight = params.dimension.height - (bound.height || 0),
            positionOption = params.positionOption || '',
            tooltipWidth = params.dimension.width,
            result = {};

        result.left = bound.left + bound.width;
        result.top = bound.top;
        if (positionOption.indexOf('left') > -1) {
            result.left -= tooltipWidth;
        } else if (positionOption.indexOf('center') > -1) {
            result.left -= tooltipWidth / 2;
        } else {
            result.left += TOOLTIP_GAP;
        }

        if (positionOption.indexOf('top') > -1) {
            result.top -= minusHeight + HIDDEN_WIDTH;
        } else if (positionOption.indexOf('middle') > -1) {
            result.top -= minusHeight / 2;
        } else {
            result.top -= HIDDEN_WIDTH * 2;
        }
        return result;
    },

    /**
     * Calculate tooltip position.
     * @param {object} params parameters
     *      @param {{bound: object, isPointPosition: boolean}} params.data graph information
     *      @param {{width: number, height: number}} params.dimension tooltip dimension
     *      @param {string} params.positionOption position option (ex: 'left top')
     * @returns {{top: number, left: number}} position
     * @private
     */
    _calculatePosition: function(params) {
        var result = {};
        if (params.data.isPointPosition) {
            result = this._calculatePointPosition(params);
        } else {
            result = this._calculateRectPosition(params);
        }
        return result;
    },

    /**
     * onShow is callback of custom event showTooltip for SeriesView.
     * @param {{id: string, bound: object}} data tooltip data
     */
    onShow: function(data) {
        var elTooltip = document.getElementById(data.id),
            addPosition = ne.util.extend({
                left: 0,
                top: 0
            }, this.options.addPosition),
            positionOption = this.options.position || '',
            position;

        if (this.showedId) {
            dom.removeClass(elTooltip, 'show');
            this._fireHideAnimation(this.showedId);
        }

        this.showedId = data.id;
        dom.addClass(elTooltip, 'show');

        position = this._calculatePosition({
            data: data,
            dimension: {
                width: elTooltip.offsetWidth,
                height: elTooltip.offsetHeight
            },
            positionOption: positionOption || ''
        });

        elTooltip.style.cssText = [
            renderUtil.concatStr('left:', position.left + addPosition.left, 'px'),
            renderUtil.concatStr('top:', position.top + addPosition.top, 'px')
        ].join(';');

        this._fireShowAnimation(data.id);
    },

    /**
     * onHide is callback of custom event hideTooltip for SeriesView
     * @param {{id: string}} data tooltip data
     */
    onHide: function(data) {
        var elTooltip = document.getElementById(data.id),
            that = this;

        this._hideTooltip(elTooltip, function() {
            var indexes = that._getIndexFromId(data.id);

            that.fire('hideAnimation', {
                groupIndex: indexes[0],
                index: indexes[1]
            });

            data = null;
            elTooltip = null;
            that = null;
        });
    },

    /**
     * Hide tooltip.
     * @param {HTMLElement} elTooltip tooltip element
     * @param {function} callback callback
     * @private
     */
    _hideTooltip: function(elTooltip, callback) {
        var that = this;
        delete this.showedId;
        setTimeout(function() {
            if (that.showedId === elTooltip.id) {
                return;
            }

            dom.removeClass(elTooltip, 'show');
            if (callback) {
                callback();
            }

            that = null;
        }, HIDE_DELAY);
    },

    /**
     * Attach event
     * @param {HTMLElement} el target element
     */
    attachEvent: function(el) {
        event.bindEvent('mouseover', el, ne.util.bind(this.onMouseover, this));
        event.bindEvent('mouseout', el, ne.util.bind(this.onMouseout, this));
    }
});

ne.util.CustomEvents.mixin(Tooltip);

module.exports = Tooltip;

},{"../helpers/domHandler.js":20,"../helpers/eventListener.js":21,"../helpers/renderUtil.js":22,"../helpers/templateMaker.js":23,"./tooltipTemplate.js":41}],41:[function(require,module,exports){
/**
 * @fileoverview This is templates of tooltip view.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

var templateMaker = require('../helpers/templateMaker.js');

var tags = {
    HTML_TOOLTIP: '<div class="ne-chart-tooltip" id="{{ id }}">{{ html }}</div>',
    HTML_DEFAULT_TEMPLATE: '<div class="ne-chart-default-tooltip">' +
        '<div>{{ label }}</div>' +
        '<div>' +
            '<span>{{ legendLabel }}</span>:' +
            '&nbsp;<span>{{ value }}</span>' +
            '<span>{{ suffix }}</span>' +
        '</div>' +
    '</div>'
};

module.exports = {
    TPL_TOOLTIP: templateMaker.template(tags.HTML_TOOLTIP),
    TPL_DEFAULT_TEMPLATE: templateMaker.template(tags.HTML_DEFAULT_TEMPLATE)
};

},{"../helpers/templateMaker.js":23}]},{},[3,28])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXhlcy9heGlzLmpzIiwic3JjL2pzL2F4ZXMvYXhpc1RlbXBsYXRlLmpzIiwic3JjL2pzL2NoYXJ0LmpzIiwic3JjL2pzL2NoYXJ0cy9heGlzVHlwZUJhc2UuanMiLCJzcmMvanMvY2hhcnRzL2JhckNoYXJ0LmpzIiwic3JjL2pzL2NoYXJ0cy9jaGFydEJhc2UuanMiLCJzcmMvanMvY2hhcnRzL2NvbHVtbkNoYXJ0LmpzIiwic3JjL2pzL2NoYXJ0cy9jb21ib0NoYXJ0LmpzIiwic3JjL2pzL2NoYXJ0cy9saW5lQ2hhcnQuanMiLCJzcmMvanMvY2hhcnRzL3BpZUNoYXJ0LmpzIiwic3JjL2pzL2NvZGUtc25pcHBldC11dGlsLmpzIiwic3JjL2pzL2NvbnN0LmpzIiwic3JjL2pzL2ZhY3Rvcmllcy9jaGFydEZhY3RvcnkuanMiLCJzcmMvanMvZmFjdG9yaWVzL3BsdWdpbkZhY3RvcnkuanMiLCJzcmMvanMvZmFjdG9yaWVzL3RoZW1lRmFjdG9yeS5qcyIsInNyYy9qcy9oZWxwZXJzL2F4aXNEYXRhTWFrZXIuanMiLCJzcmMvanMvaGVscGVycy9ib3VuZHNNYWtlci5qcyIsInNyYy9qcy9oZWxwZXJzL2NhbGN1bGF0b3IuanMiLCJzcmMvanMvaGVscGVycy9kYXRhQ29udmVydGVyLmpzIiwic3JjL2pzL2hlbHBlcnMvZG9tSGFuZGxlci5qcyIsInNyYy9qcy9oZWxwZXJzL2V2ZW50TGlzdGVuZXIuanMiLCJzcmMvanMvaGVscGVycy9yZW5kZXJVdGlsLmpzIiwic3JjL2pzL2hlbHBlcnMvdGVtcGxhdGVNYWtlci5qcyIsInNyYy9qcy9sZWdlbmRzL2xlZ2VuZC5qcyIsInNyYy9qcy9sZWdlbmRzL2xlZ2VuZFRlbXBsYXRlLmpzIiwic3JjL2pzL3Bsb3RzL3Bsb3QuanMiLCJzcmMvanMvcGxvdHMvcGxvdFRlbXBsYXRlLmpzIiwic3JjL2pzL3BsdWdpbnMvcGx1Z2luUmFwaGFlbC5qcyIsInNyYy9qcy9wbHVnaW5zL3JhcGhhZWxCYXJDaGFydC5qcyIsInNyYy9qcy9wbHVnaW5zL3JhcGhhZWxMaW5lQ2hhcnQuanMiLCJzcmMvanMvcGx1Z2lucy9yYXBoYWVsUGllQ2hhcnQuanMiLCJzcmMvanMvcmVnaXN0ZXJDaGFydHMuanMiLCJzcmMvanMvcmVnaXN0ZXJUaGVtZXMuanMiLCJzcmMvanMvc2VyaWVzL2JhckNoYXJ0U2VyaWVzLmpzIiwic3JjL2pzL3Nlcmllcy9jb2x1bW5DaGFydFNlcmllcy5qcyIsInNyYy9qcy9zZXJpZXMvbGluZUNoYXJ0U2VyaWVzLmpzIiwic3JjL2pzL3Nlcmllcy9waWVDaGFydFNlcmllcy5qcyIsInNyYy9qcy9zZXJpZXMvc2VyaWVzLmpzIiwic3JjL2pzL3RoZW1lcy9kZWZhdWx0VGhlbWUuanMiLCJzcmMvanMvdG9vbHRpcHMvdG9vbHRpcC5qcyIsInNyYy9qcy90b29sdGlwcy90b29sdGlwVGVtcGxhdGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1aEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2V0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDem5CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyY0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbllBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogQGZpbGVvdmVydmlldyAgQXhpcyBjb21wb25lbnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBkb20gPSByZXF1aXJlKCcuLi9oZWxwZXJzL2RvbUhhbmRsZXIuanMnKSxcbiAgICBjYWxjdWxhdG9yID0gcmVxdWlyZSgnLi4vaGVscGVycy9jYWxjdWxhdG9yLmpzJyksXG4gICAgcmVuZGVyVXRpbCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvcmVuZGVyVXRpbC5qcycpLFxuICAgIGF4aXNUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vYXhpc1RlbXBsYXRlLmpzJyk7XG5cbnZhciBUSVRMRV9BUkVBX1dJRFRIX1BBRERJTkcgPSAyMCxcbiAgICBWX0xBQkVMX1JJR0hUX1BBRERJTkcgPSAxMDtcblxudmFyIEF4aXMgPSBuZS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgQXhpcy5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIEF4aXMgY29tcG9uZW50LlxuICAgICAqIEBjb25zdHJ1Y3RzIEF4aXNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7e1xuICAgICAqICAgICAgICAgIGxhYmVsczogYXJyYXkuPHN0cmluZz4sXG4gICAgICogICAgICAgICAgdGlja0NvdW50OiBudW1iZXIsXG4gICAgICogICAgICAgICAgaXNMYWJlbEF4aXM6IGJvb2xlYW4sXG4gICAgICogICAgICAgICAgaXNWZXJ0aWNhbDogYm9vbGVhblxuICAgICAqICAgICAgfX0gcGFyYW1zLmRhdGEgYXhpcyBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmJvdW5kIGF4aXMgYm91bmRcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgYXhpcyB0aGVtZVxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5vcHRpb25zIGF4aXMgb3B0aW9uc1xuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICBuZS51dGlsLmV4dGVuZCh0aGlzLCBwYXJhbXMpO1xuICAgICAgICAvKipcbiAgICAgICAgICogQXhpcyB2aWV3IGNsYXNzTmFtZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jbGFzc05hbWUgPSAnbmUtY2hhcnQtYXhpcy1hcmVhJztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGF4aXMuXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSBheGlzIGFyZWEgYmFzZSBlbGVtZW50XG4gICAgICovXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGRhdGEgPSB0aGlzLmRhdGEsXG4gICAgICAgICAgICB0aGVtZSA9IHRoaXMudGhlbWUsXG4gICAgICAgICAgICBpc1ZlcnRpY2FsID0gISFkYXRhLmlzVmVydGljYWwsXG4gICAgICAgICAgICBpc1Bvc2l0aW9uUmlnaHQgPSBkYXRhLmlzUG9zaXRpb25SaWdodCxcbiAgICAgICAgICAgIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnMsXG4gICAgICAgICAgICBib3VuZCA9IHRoaXMuYm91bmQsXG4gICAgICAgICAgICBkaW1lbnNpb24gPSBib3VuZC5kaW1lbnNpb24sXG4gICAgICAgICAgICBzaXplID0gaXNWZXJ0aWNhbCA/IGRpbWVuc2lvbi5oZWlnaHQgOiBkaW1lbnNpb24ud2lkdGgsXG4gICAgICAgICAgICBlbCA9IGRvbS5jcmVhdGUoJ0RJVicsIHRoaXMuY2xhc3NOYW1lKSxcbiAgICAgICAgICAgIGVsVGl0bGVBcmVhID0gdGhpcy5fcmVuZGVyVGl0bGVBcmVhKHtcbiAgICAgICAgICAgICAgICB0aXRsZTogb3B0aW9ucy50aXRsZSxcbiAgICAgICAgICAgICAgICB0aGVtZTogdGhlbWUudGl0bGUsXG4gICAgICAgICAgICAgICAgaXNWZXJ0aWNhbDogaXNWZXJ0aWNhbCxcbiAgICAgICAgICAgICAgICBpc1Bvc2l0aW9uUmlnaHQ6IGlzUG9zaXRpb25SaWdodCxcbiAgICAgICAgICAgICAgICBzaXplOiBzaXplXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGVsVGlja0FyZWEgPSB0aGlzLl9yZW5kZXJUaWNrQXJlYShzaXplKSxcbiAgICAgICAgICAgIGVsTGFiZWxBcmVhID0gdGhpcy5fcmVuZGVyTGFiZWxBcmVhKHNpemUsIGRpbWVuc2lvbi53aWR0aCk7XG4gICAgICAgIHJlbmRlclV0aWwucmVuZGVyRGltZW5zaW9uKGVsLCBkaW1lbnNpb24pO1xuICAgICAgICByZW5kZXJVdGlsLnJlbmRlclBvc2l0aW9uKGVsLCBib3VuZC5wb3NpdGlvbik7XG4gICAgICAgIGRvbS5hZGRDbGFzcyhlbCwgaXNWZXJ0aWNhbCA/ICd2ZXJ0aWNhbCcgOiAnaG9yaXpvbnRhbCcpO1xuICAgICAgICBkb20uYWRkQ2xhc3MoZWwsIGlzUG9zaXRpb25SaWdodCA/ICdyaWdodCcgOiAnJyk7XG4gICAgICAgIGRvbS5hcHBlbmQoZWwsIFtlbFRpdGxlQXJlYSwgZWxUaWNrQXJlYSwgZWxMYWJlbEFyZWFdKTtcblxuICAgICAgICByZXR1cm4gZWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRpdGxlIGFyZWEgcmVuZGVyZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMudGl0bGUgYXhpcyB0aXRsZVxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSB0aXRsZSB0aGVtZVxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaXNWZXJ0aWNhbCBpcyB2ZXJ0aWNhbD9cbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuc2l6ZSAod2lkdGggb3IgaGVpZ2h0KVxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gdGl0bGUgZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlclRpdGxlQXJlYTogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBlbFRpdGxlQXJlYSA9IHJlbmRlclV0aWwucmVuZGVyVGl0bGUocGFyYW1zLnRpdGxlLCBwYXJhbXMudGhlbWUsICduZS1jaGFydC10aXRsZS1hcmVhJyksXG4gICAgICAgICAgICBjc3NUZXh0cyA9IFtdO1xuXG4gICAgICAgIGlmIChlbFRpdGxlQXJlYSAmJiBwYXJhbXMuaXNWZXJ0aWNhbCkge1xuICAgICAgICAgICAgY3NzVGV4dHMgPSBbXG4gICAgICAgICAgICAgICAgcmVuZGVyVXRpbC5jb25jYXRTdHIoJ3dpZHRoOicsIHBhcmFtcy5zaXplLCAncHgnKVxuICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIGlmIChwYXJhbXMuaXNQb3NpdGlvblJpZ2h0KSB7XG4gICAgICAgICAgICAgICAgY3NzVGV4dHMucHVzaChyZW5kZXJVdGlsLmNvbmNhdFN0cigncmlnaHQ6JywgLXBhcmFtcy5zaXplLCAncHgnKSk7XG4gICAgICAgICAgICAgICAgY3NzVGV4dHMucHVzaChyZW5kZXJVdGlsLmNvbmNhdFN0cigndG9wOicsIDAsICdweCcpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY3NzVGV4dHMucHVzaChyZW5kZXJVdGlsLmNvbmNhdFN0cignbGVmdDonLCAwLCAncHgnKSk7XG4gICAgICAgICAgICAgICAgaWYgKCFyZW5kZXJVdGlsLmlzSUU4KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3NzVGV4dHMucHVzaChyZW5kZXJVdGlsLmNvbmNhdFN0cigndG9wOicsIHBhcmFtcy5zaXplLCAncHgnKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBlbFRpdGxlQXJlYS5zdHlsZS5jc3NUZXh0ICs9ICc7JyArIGNzc1RleHRzLmpvaW4oJzsnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZWxUaXRsZUFyZWE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlZG5lciB0aWNrIGFyZWEuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHNpemUgc2l6ZSBvciBoZWlnaHRcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHRpY2sgYXJlYSBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyVGlja0FyZWE6IGZ1bmN0aW9uKHNpemUpIHtcbiAgICAgICAgdmFyIGRhdGEgPSB0aGlzLmRhdGEsXG4gICAgICAgICAgICB0aWNrQ291bnQgPSBkYXRhLnRpY2tDb3VudCxcbiAgICAgICAgICAgIHRpY2tDb2xvciA9IHRoaXMudGhlbWUudGlja0NvbG9yLFxuICAgICAgICAgICAgcG9zaXRpb25zID0gY2FsY3VsYXRvci5tYWtlUGl4ZWxQb3NpdGlvbnMoc2l6ZSwgdGlja0NvdW50KSxcbiAgICAgICAgICAgIGVsVGlja0FyZWEgPSBkb20uY3JlYXRlKCdESVYnLCAnbmUtY2hhcnQtdGljay1hcmVhJyksXG4gICAgICAgICAgICBpc1ZlcnRpY2FsID0gZGF0YS5pc1ZlcnRpY2FsLFxuICAgICAgICAgICAgcG9zVHlwZSA9IGlzVmVydGljYWwgPyAnYm90dG9tJyA6ICdsZWZ0JyxcbiAgICAgICAgICAgIGJvcmRlckNvbG9yVHlwZSA9IGlzVmVydGljYWwgPyAoZGF0YS5pc1Bvc2l0aW9uUmlnaHQgPyAnYm9yZGVyTGVmdENvbG9yJyA6ICdib3JkZXJSaWdodENvbG9yJykgOiAnYm9yZGVyVG9wQ29sb3InLFxuICAgICAgICAgICAgdGVtcGxhdGUgPSBheGlzVGVtcGxhdGUuVFBMX0FYSVNfVElDSyxcbiAgICAgICAgICAgIHRpY2tzSHRtbCA9IG5lLnV0aWwubWFwKHBvc2l0aW9ucywgZnVuY3Rpb24ocG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgY3NzVGV4dCA9IFtcbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyVXRpbC5jb25jYXRTdHIoJ2JhY2tncm91bmQtY29sb3I6JywgdGlja0NvbG9yKSxcbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyVXRpbC5jb25jYXRTdHIocG9zVHlwZSwgJzogJywgcG9zaXRpb24sICdweCcpXG4gICAgICAgICAgICAgICAgXS5qb2luKCc7Jyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRlbXBsYXRlKHtjc3NUZXh0OiBjc3NUZXh0fSk7XG4gICAgICAgICAgICB9LCB0aGlzKS5qb2luKCcnKTtcblxuICAgICAgICBlbFRpY2tBcmVhLmlubmVySFRNTCA9IHRpY2tzSHRtbDtcbiAgICAgICAgZWxUaWNrQXJlYS5zdHlsZVtib3JkZXJDb2xvclR5cGVdID0gdGlja0NvbG9yO1xuXG4gICAgICAgIHJldHVybiBlbFRpY2tBcmVhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgbGFiZWwgYXJlYS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc2l6ZSBsYWJlbCBhcmVhIHNpemVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYXhpc1dpZHRoIGF4aXMgYXJlYSB3aWR0aFxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gbGFiZWwgYXJlYSBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyTGFiZWxBcmVhOiBmdW5jdGlvbihzaXplLCBheGlzV2lkdGgpIHtcbiAgICAgICAgdmFyIGRhdGEgPSB0aGlzLmRhdGEsXG4gICAgICAgICAgICB0aGVtZSA9IHRoaXMudGhlbWUsXG4gICAgICAgICAgICBwb3NpdGlvbnMgPSBjYWxjdWxhdG9yLm1ha2VQaXhlbFBvc2l0aW9ucyhzaXplLCBkYXRhLnRpY2tDb3VudCksXG4gICAgICAgICAgICBsYWJlbFdpZHRoID0gcG9zaXRpb25zWzFdIC0gcG9zaXRpb25zWzBdLFxuICAgICAgICAgICAgbGFiZWxzID0gZGF0YS5sYWJlbHMsXG4gICAgICAgICAgICBpc1ZlcnRpY2FsID0gZGF0YS5pc1ZlcnRpY2FsLFxuICAgICAgICAgICAgaXNMYWJlbEF4aXMgPSBkYXRhLmlzTGFiZWxBeGlzLFxuICAgICAgICAgICAgcG9zVHlwZSA9ICdsZWZ0JyxcbiAgICAgICAgICAgIGNzc1RleHRzID0gdGhpcy5fbWFrZUxhYmVsQ3NzVGV4dHMoe1xuICAgICAgICAgICAgICAgIGlzVmVydGljYWw6IGlzVmVydGljYWwsXG4gICAgICAgICAgICAgICAgaXNMYWJlbEF4aXM6IGlzTGFiZWxBeGlzLFxuICAgICAgICAgICAgICAgIGxhYmVsV2lkdGg6IGxhYmVsV2lkdGhcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgZWxMYWJlbEFyZWEgPSBkb20uY3JlYXRlKCdESVYnLCAnbmUtY2hhcnQtbGFiZWwtYXJlYScpLFxuICAgICAgICAgICAgYXJlYUNzc1RleHQgPSByZW5kZXJVdGlsLm1ha2VGb250Q3NzVGV4dCh0aGVtZS5sYWJlbCksXG4gICAgICAgICAgICBsYWJlbHNIdG1sLCB0aXRsZUFyZWFXaWR0aDtcblxuICAgICAgICBpZiAoaXNWZXJ0aWNhbCkge1xuICAgICAgICAgICAgcG9zVHlwZSA9IGlzTGFiZWxBeGlzID8gJ3RvcCcgOiAnYm90dG9tJztcbiAgICAgICAgICAgIHRpdGxlQXJlYVdpZHRoID0gdGhpcy5fZ2V0UmVuZGVyZWRUaXRsZUhlaWdodCgpICsgVElUTEVfQVJFQV9XSURUSF9QQURESU5HO1xuICAgICAgICAgICAgYXJlYUNzc1RleHQgKz0gJzt3aWR0aDonICsgKGF4aXNXaWR0aCAtIHRpdGxlQXJlYVdpZHRoICsgVl9MQUJFTF9SSUdIVF9QQURESU5HKSArICdweCc7XG4gICAgICAgIH1cblxuICAgICAgICBwb3NpdGlvbnMubGVuZ3RoID0gbGFiZWxzLmxlbmd0aDtcblxuICAgICAgICBsYWJlbHNIdG1sID0gdGhpcy5fbWFrZUxhYmVsc0h0bWwoe1xuICAgICAgICAgICAgcG9zaXRpb25zOiBwb3NpdGlvbnMsXG4gICAgICAgICAgICBsYWJlbHM6IGxhYmVscyxcbiAgICAgICAgICAgIHBvc1R5cGU6IHBvc1R5cGUsXG4gICAgICAgICAgICBjc3NUZXh0czogY3NzVGV4dHNcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZWxMYWJlbEFyZWEuaW5uZXJIVE1MID0gbGFiZWxzSHRtbDtcbiAgICAgICAgZWxMYWJlbEFyZWEuc3R5bGUuY3NzVGV4dCA9IGFyZWFDc3NUZXh0O1xuXG4gICAgICAgIHRoaXMuX2NoYW5nZUxhYmVsQXJlYVBvc2l0aW9uKHtcbiAgICAgICAgICAgIGVsTGFiZWxBcmVhOiBlbExhYmVsQXJlYSxcbiAgICAgICAgICAgIGlzVmVydGljYWw6IGlzVmVydGljYWwsXG4gICAgICAgICAgICBpc0xhYmVsQXhpczogaXNMYWJlbEF4aXMsXG4gICAgICAgICAgICB0aGVtZTogdGhlbWUubGFiZWwsXG4gICAgICAgICAgICBsYWJlbFdpZHRoOiBsYWJlbFdpZHRoXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBlbExhYmVsQXJlYTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGhlaWdodCBvZiB0aXRsZSBhcmVhIDtcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBoZWlnaHRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRSZW5kZXJlZFRpdGxlSGVpZ2h0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHRpdGxlID0gdGhpcy5vcHRpb25zLnRpdGxlLFxuICAgICAgICAgICAgdGhlbWUgPSB0aGlzLnRoZW1lLnRpdGxlLFxuICAgICAgICAgICAgcmVzdWx0ID0gdGl0bGUgPyByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxIZWlnaHQodGl0bGUsIHRoZW1lKSA6IDA7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgY3NzVGV4dHMgb2YgbGFiZWwuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJcbiAgICAgKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gcGFyYW1zLmlzVmVydGljYWwgd2hldGhlciB2ZXJ0aWNhbCBvciBub3RcbiAgICAgKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gcGFyYW1zLmlzTGFiZWxBeGlzIHdoZXRoZXIgbGFiZWwgYXhpcyBvciBub3RcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubGFiZWxXaWR0aCBsYWJlbCB3aWR0aCBvciBoZWlnaHRcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nW119IGNzc1RleHRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUxhYmVsQ3NzVGV4dHM6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgY3NzVGV4dHMgPSBbXTtcblxuICAgICAgICBpZiAocGFyYW1zLmlzVmVydGljYWwgJiYgcGFyYW1zLmlzTGFiZWxBeGlzKSB7XG4gICAgICAgICAgICBjc3NUZXh0cy5wdXNoKHJlbmRlclV0aWwuY29uY2F0U3RyKCdoZWlnaHQ6JywgcGFyYW1zLmxhYmVsV2lkdGgsICdweCcpKTtcbiAgICAgICAgICAgIGNzc1RleHRzLnB1c2gocmVuZGVyVXRpbC5jb25jYXRTdHIoJ2xpbmUtaGVpZ2h0OicsIHBhcmFtcy5sYWJlbFdpZHRoLCAncHgnKSk7XG4gICAgICAgIH0gZWxzZSBpZiAoIXBhcmFtcy5pc1ZlcnRpY2FsKSB7XG4gICAgICAgICAgICBjc3NUZXh0cy5wdXNoKHJlbmRlclV0aWwuY29uY2F0U3RyKCd3aWR0aDonLCBwYXJhbXMubGFiZWxXaWR0aCwgJ3B4JykpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNzc1RleHRzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGh0bWwgb2YgbGFiZWwuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxvYmplY3Q+fSBwYXJhbXMucG9zaXRpb25zIGxhYmVsIHBvc2l0aW9uIGFycmF5XG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ1tdfSBwYXJhbXMubGFiZWxzIGxhYmVsIGFycmF5XG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLnBvc1R5cGUgcG9zaXRpb24gdHlwZSAobGVmdCBvciBib3R0b20pXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ1tdfSBwYXJhbXMuY3NzVGV4dHMgY3NzIGFycmF5XG4gICAgICogQHJldHVybnMge3N0cmluZ30gaHRtbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VMYWJlbHNIdG1sOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIHRlbXBsYXRlID0gYXhpc1RlbXBsYXRlLlRQTF9BWElTX0xBQkVMLFxuICAgICAgICAgICAgbGFiZWxzSHRtbCA9IG5lLnV0aWwubWFwKHBhcmFtcy5wb3NpdGlvbnMsIGZ1bmN0aW9uKHBvc2l0aW9uLCBpbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciBsYWJlbENzc1RleHRzID0gcGFyYW1zLmNzc1RleHRzLnNsaWNlKCksXG4gICAgICAgICAgICAgICAgICAgIGh0bWw7XG5cbiAgICAgICAgICAgICAgICBsYWJlbENzc1RleHRzLnB1c2gocmVuZGVyVXRpbC5jb25jYXRTdHIocGFyYW1zLnBvc1R5cGUsICc6JywgcG9zaXRpb24sICdweCcpKTtcbiAgICAgICAgICAgICAgICBodG1sID0gdGVtcGxhdGUoe1xuICAgICAgICAgICAgICAgICAgICBjc3NUZXh0OiBsYWJlbENzc1RleHRzLmpvaW4oJzsnKSxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHBhcmFtcy5sYWJlbHNbaW5kZXhdXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgICAgICAgICB9LCB0aGlzKS5qb2luKCcnKTtcblxuICAgICAgICByZXR1cm4gbGFiZWxzSHRtbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hhbmdlIHBvc2l0aW9uIG9mIGxhYmVsIGFyZWEuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJcbiAgICAgKiAgICAgIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHBhcmFtcy5lbExhYmVsQXJlYSBsYWJlbCBhcmVhIGVsZW1lbnRcbiAgICAgKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gcGFyYW1zLmlzVmVydGljYWwgd2hldGhlciB2ZXJ0aWNhbCBvciBub3RcbiAgICAgKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gcGFyYW1zLmlzTGFiZWxBeGlzIHdoZXRoZXIgbGFiZWwgYXhpcyBvciBub3RcbiAgICAgKiAgICAgIEBwYXJhbSB7e2ZvbnRTaXplOiBudW1iZXIsIGZvbnRGYW1pbHk6IHN0cmluZywgY29sb3I6IHN0cmluZ319IHBhcmFtcy50aGVtZSBsYWJlbCB0aGVtZVxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5sYWJlbFdpZHRoIGxhYmVsIHdpZHRoIG9yIGhlaWdodFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NoYW5nZUxhYmVsQXJlYVBvc2l0aW9uOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGxhYmVsSGVpZ2h0O1xuXG4gICAgICAgIGlmIChwYXJhbXMuaXNMYWJlbEF4aXMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYXJhbXMuaXNWZXJ0aWNhbCkge1xuICAgICAgICAgICAgbGFiZWxIZWlnaHQgPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxIZWlnaHQoJ0FCQycsIHBhcmFtcy50aGVtZSk7XG4gICAgICAgICAgICBwYXJhbXMuZWxMYWJlbEFyZWEuc3R5bGUudG9wID0gcmVuZGVyVXRpbC5jb25jYXRTdHIocGFyc2VJbnQobGFiZWxIZWlnaHQgLyAyLCAxMCksICdweCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGFyYW1zLmVsTGFiZWxBcmVhLnN0eWxlLmxlZnQgPSByZW5kZXJVdGlsLmNvbmNhdFN0cignLScsIHBhcnNlSW50KHBhcmFtcy5sYWJlbFdpZHRoIC8gMiwgMTApLCAncHgnKTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEF4aXM7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgVGhpcyBpcyB0ZW1wbGF0ZXMgb3IgYXhpcyB2aWV3LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxudmFyIHRlbXBsYXRlTWFrZXIgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3RlbXBsYXRlTWFrZXIuanMnKTtcblxudmFyIHRhZ3MgPSB7XG4gICAgSFRNTF9BWElTX1RJQ0s6ICc8ZGl2IGNsYXNzPVwibmUtY2hhcnQtdGlja1wiIHN0eWxlPVwie3sgY3NzVGV4dCB9fVwiPjwvZGl2PicsXG4gICAgSFRNTF9BWElTX0xBQkVMOiAnPGRpdiBjbGFzcz1cIm5lLWNoYXJ0LWxhYmVsXCIgc3R5bGU9XCJ7eyBjc3NUZXh0IH19XCI+e3sgbGFiZWwgfX08L2Rpdj4nXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBUUExfQVhJU19USUNLOiB0ZW1wbGF0ZU1ha2VyLnRlbXBsYXRlKHRhZ3MuSFRNTF9BWElTX1RJQ0spLFxuICAgIFRQTF9BWElTX0xBQkVMOiB0ZW1wbGF0ZU1ha2VyLnRlbXBsYXRlKHRhZ3MuSFRNTF9BWElTX0xBQkVMKVxufTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBjaGFydC5qcyBpcyBlbnRyeSBwb2ludCBvZiBBcHBsaWNhdGlvbiBDaGFydC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBjaGFydENvbnN0ID0gcmVxdWlyZSgnLi9jb25zdC5qcycpLFxuICAgIGNoYXJ0RmFjdG9yeSA9IHJlcXVpcmUoJy4vZmFjdG9yaWVzL2NoYXJ0RmFjdG9yeS5qcycpLFxuICAgIHBsdWdpbkZhY3RvcnkgPSByZXF1aXJlKCcuL2ZhY3Rvcmllcy9wbHVnaW5GYWN0b3J5LmpzJyksXG4gICAgdGhlbWVGYWN0b3J5ID0gcmVxdWlyZSgnLi9mYWN0b3JpZXMvdGhlbWVGYWN0b3J5LmpzJyk7XG5cbnZhciBERUZBVUxUX1RIRU1FX05BTUUgPSAnZGVmYXVsdCc7XG5cbnZhciBfY3JlYXRlQ2hhcnQ7XG5cbnJlcXVpcmUoJy4vY29kZS1zbmlwcGV0LXV0aWwuanMnKTtcbnJlcXVpcmUoJy4vcmVnaXN0ZXJDaGFydHMuanMnKTtcbnJlcXVpcmUoJy4vcmVnaXN0ZXJUaGVtZXMuanMnKTtcblxuLyoqXG4gKiBOSE4gRW50ZXJ0YWlubWVudCBBcHBsaWNhdGlvbiBDaGFydC5cbiAqIEBuYW1lc3BhY2UgbmUuYXBwbGljYXRpb24uY2hhcnRcbiAqL1xubmUudXRpbC5kZWZpbmVOYW1lc3BhY2UoJ25lLmFwcGxpY2F0aW9uLmNoYXJ0Jyk7XG5cbi8qKlxuICogQ3JlYXRlIGNoYXJ0LlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNvbnRhaW5lclxuICogQHBhcmFtIHthcnJheS48YXJyYXk+fSBkYXRhIGNoYXJ0IGRhdGFcbiAqIEBwYXJhbSB7e1xuICogICBjaGFydDoge1xuICogICAgIHdpZHRoOiBudW1iZXIsXG4gKiAgICAgaGVpZ2h0OiBudW1iZXIsXG4gKiAgICAgdGl0bGU6IHN0cmluZyxcbiAqICAgICBmb3JtYXQ6IHN0cmluZ1xuICogICB9LFxuICogICB5QXhpczoge1xuICogICAgIHRpdGxlOiBzdHJpbmcsXG4gKiAgICAgbWluOiBudW1iZXJcbiAqICAgfSxcbiAqICAgeEF4aXM6IHtcbiAqICAgICB0aXRsZTogc3RyaWcsXG4gKiAgICAgbWluOiBudW1iZXJcbiAqICAgfSxcbiAqICAgdG9vbHRpcDoge1xuICogICAgIHN1ZmZpeDogc3RyaW5nLFxuICogICAgIHRlbXBsYXRlOiBzdHJpbmdcbiAqICAgfSxcbiAqICAgdGhlbWU6IHN0cmluZ1xuICogfX0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gKiBAcmV0dXJucyB7b2JqZWN0fSBjaGFydCBpbnN0YW5jZS5cbiAqIEBwcml2YXRlXG4gKiBAaWdub3JlXG4gKi9cbl9jcmVhdGVDaGFydCA9IGZ1bmN0aW9uKGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucykge1xuICAgIHZhciB0aGVtZU5hbWUsIHRoZW1lLCBjaGFydDtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB0aGVtZU5hbWUgPSBvcHRpb25zLnRoZW1lIHx8IERFRkFVTFRfVEhFTUVfTkFNRTtcbiAgICB0aGVtZSA9IHRoZW1lRmFjdG9yeS5nZXQodGhlbWVOYW1lKTtcblxuICAgIGNoYXJ0ID0gY2hhcnRGYWN0b3J5LmdldChvcHRpb25zLmNoYXJ0VHlwZSwgZGF0YSwgdGhlbWUsIG9wdGlvbnMpO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChjaGFydC5yZW5kZXIoKSk7XG5cbiAgICByZXR1cm4gY2hhcnQ7XG59O1xuXG4vKipcbiAqIEJhciBjaGFydCBjcmVhdG9yLlxuICogQG1lbWJlck9mIG5lLmFwcGxpY2F0aW9uLmNoYXJ0XG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY2hhcnQgY29udGFpbmVyXG4gKiBAcGFyYW0ge29iamVjdH0gZGF0YSBjaGFydCBkYXRhXG4gKiAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGRhdGEuY2F0ZWdvcmllcyBjYXRlZ29yaWVzXG4gKiAgICAgIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gZGF0YS5zZXJpZXMgc2VyaWVzIGRhdGFcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuY2hhcnQgY2hhcnQgb3B0aW9uc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMuY2hhcnQud2lkdGggY2hhcnQgd2lkdGhcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LmhlaWdodCBjaGFydCBoZWlnaHRcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmNoYXJ0LnRpdGxlIGNoYXJ0IHRpdGxlXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC5mb3JtYXQgdmFsdWUgZm9ybWF0XG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnlBeGlzIG9wdGlvbnMgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMueUF4aXMudGl0bGUgdGl0bGUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy54QXhpcyBvcHRpb25zIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMueEF4aXMudGl0bGUgdGl0bGUgb2YgaG9yaXpvbnRhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy54QXhpcy5taW4gbWluaW1hbCB2YWx1ZSBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnhBeGlzLm1heCBtYXhpbXVtIHZhbHVlIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5zZXJpZXMgb3B0aW9ucyBvZiBzZXJpZXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnNlcmllcy5zdGFja2VkIHN0YWNrZWQgdHlwZVxuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy50b29sdGlwIG9wdGlvbnMgb2YgdG9vbHRpcFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC5zdWZmaXggc3VmZml4IG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAudGVtcGxhdGUgdGVtcGxhdGUgb2YgdG9vbHRpcFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC5wb3NpdGlvbiB0b29sdGlwIHBvc2l0aW9uIHR5cGVcbiAqICAgICAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24gYWRkIHBvc2l0aW9uXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMudG9vbHRpcC5hZGRQb3NpdGlvbi5sZWZ0IGFkZCBsZWZ0IHBvc2l0aW9uXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMudG9vbHRpcC5hZGRQb3NpdGlvbi50b3AgYWRkIHRvcCBwb3NpdGlvblxuICogICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50aGVtZSB0aGVtZSBuYW1lXG4gKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmxpYlR5cGUgZ3JhcGggbGlicmFyeSB0eXBlXG4gKiBAcmV0dXJucyB7b2JqZWN0fSBiYXIgY2hhcnRcbiAqIEBleGFtcGxlXG4gKiB2YXIgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhaW5lci1pZCcpLFxuICogICAgIGRhdGEgPSB7XG4gKiAgICAgICBjYXRlZ29yaWVzOiBbJ2NhdGUxJywgJ2NhdGUyJywgJ2NhdGUzJ10sXG4gKiAgICAgICBzZXJpZXM6IFtcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQxJyxcbiAqICAgICAgICAgICBkYXRhOiBbMjAsIDMwLCA1MF1cbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQyJyxcbiAqICAgICAgICAgICBkYXRhOiBbNDAsIDQwLCA2MF1cbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQzJyxcbiAqICAgICAgICAgICBkYXRhOiBbNjAsIDUwLCAxMF1cbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQ0JyxcbiAqICAgICAgICAgICBkYXRhOiBbODAsIDEwLCA3MF1cbiAqICAgICAgICAgfVxuICogICAgICAgXVxuICogICAgIH0sXG4gKiAgICAgb3B0aW9ucyA9IHtcbiAqICAgICAgIGNoYXJ0OiB7XG4gKiAgICAgICAgIHRpdGxlOiAnQmFyIENoYXJ0J1xuICogICAgICAgfSxcbiAqICAgICAgIHlBeGlzOiB7XG4gKiAgICAgICAgIHRpdGxlOiAnWSBBeGlzJ1xuICogICAgICAgfSxcbiAqICAgICAgIHhBeGlzOiB7XG4gKiAgICAgICAgIHRpdGxlOiAnWCBBeGlzJ1xuICogICAgICAgfVxuICogICAgIH07XG4gKiBuZS5hcHBsaWNhdGlvbi5jaGFydC5iYXJDaGFydChjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpO1xuICovXG5uZS5hcHBsaWNhdGlvbi5jaGFydC5iYXJDaGFydCA9IGZ1bmN0aW9uKGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIG9wdGlvbnMuY2hhcnRUeXBlID0gY2hhcnRDb25zdC5DSEFSVF9UWVBFX0JBUjtcbiAgICByZXR1cm4gX2NyZWF0ZUNoYXJ0KGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucyk7XG59O1xuXG4vKipcbiAqIENvbHVtbiBjaGFydCBjcmVhdG9yLlxuICogQG1lbWJlck9mIG5lLmFwcGxpY2F0aW9uLmNoYXJ0XG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY2hhcnQgY29udGFpbmVyXG4gKiBAcGFyYW0ge29iamVjdH0gZGF0YSBjaGFydCBkYXRhXG4gKiAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGRhdGEuY2F0ZWdvcmllcyBjYXRlZ29yaWVzXG4gKiAgICAgIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gZGF0YS5zZXJpZXMgc2VyaWVzIGRhdGFcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuY2hhcnQgY2hhcnQgb3B0aW9uc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMuY2hhcnQud2lkdGggY2hhcnQgd2lkdGhcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LmhlaWdodCBjaGFydCBoZWlnaHRcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmNoYXJ0LnRpdGxlIGNoYXJ0IHRpdGxlXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC5mb3JtYXQgdmFsdWUgZm9ybWF0XG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnlBeGlzIG9wdGlvbnMgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMueUF4aXMudGl0bGUgdGl0bGUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMueUF4aXMubWluIG1pbmltYWwgdmFsdWUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMueUF4aXMubWF4IG1heGltdW0gdmFsdWUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy54QXhpcyBvcHRpb25zIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMueEF4aXMudGl0bGUgdGl0bGUgb2YgaG9yaXpvbnRhbCBheGlzXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnNlcmllcyBvcHRpb25zIG9mIHNlcmllc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuc2VyaWVzLnN0YWNrZWQgc3RhY2tlZCB0eXBlXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnRvb2x0aXAgb3B0aW9ucyBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnN1ZmZpeCBzdWZmaXggb2YgdG9vbHRpcFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC50ZW1wbGF0ZSB0ZW1wbGF0ZSBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnBvc2l0aW9uIHRvb2x0aXAgcG9zaXRpb24gdHlwZVxuICogICAgICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMudG9vbHRpcC5hZGRQb3NpdGlvbiBhZGQgcG9zaXRpb25cbiAqICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uLmxlZnQgYWRkIGxlZnQgcG9zaXRpb25cbiAqICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uLnRvcCBhZGQgdG9wIHBvc2l0aW9uXG4gKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRoZW1lIHRoZW1lIG5hbWVcbiAqICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMubGliVHlwZSBncmFwaCBsaWJyYXJ5IHR5cGVcbiAqIEByZXR1cm5zIHtvYmplY3R9IGNvbHVtbiBjaGFydFxuICogQGV4YW1wbGVcbiAqIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFpbmVyLWlkJyksXG4gKiAgICAgZGF0YSA9IHtcbiAqICAgICAgIGNhdGVnb3JpZXM6IFsnY2F0ZTEnLCAnY2F0ZTInLCAnY2F0ZTMnXSxcbiAqICAgICAgIHNlcmllczogW1xuICogICAgICAgICB7XG4gKiAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDEnLFxuICogICAgICAgICAgIGRhdGE6IFsyMCwgMzAsIDUwXVxuICogICAgICAgICB9LFxuICogICAgICAgICB7XG4gKiAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDInLFxuICogICAgICAgICAgIGRhdGE6IFs0MCwgNDAsIDYwXVxuICogICAgICAgICB9LFxuICogICAgICAgICB7XG4gKiAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDMnLFxuICogICAgICAgICAgIGRhdGE6IFs2MCwgNTAsIDEwXVxuICogICAgICAgICB9LFxuICogICAgICAgICB7XG4gKiAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDQnLFxuICogICAgICAgICAgIGRhdGE6IFs4MCwgMTAsIDcwXVxuICogICAgICAgICB9XG4gKiAgICAgICBdXG4gKiAgICAgfSxcbiAqICAgICBvcHRpb25zID0ge1xuICogICAgICAgY2hhcnQ6IHtcbiAqICAgICAgICAgdGl0bGU6ICdDb2x1bW4gQ2hhcnQnXG4gKiAgICAgICB9LFxuICogICAgICAgeUF4aXM6IHtcbiAqICAgICAgICAgdGl0bGU6ICdZIEF4aXMnXG4gKiAgICAgICB9LFxuICogICAgICAgeEF4aXM6IHtcbiAqICAgICAgICAgdGl0bGU6ICdYIEF4aXMnXG4gKiAgICAgICB9XG4gKiAgICAgfTtcbiAqIG5lLmFwcGxpY2F0aW9uLmNoYXJ0LmNvbHVtbkNoYXJ0KGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucyk7XG4gKi9cbm5lLmFwcGxpY2F0aW9uLmNoYXJ0LmNvbHVtbkNoYXJ0ID0gZnVuY3Rpb24oY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgb3B0aW9ucy5jaGFydFR5cGUgPSBjaGFydENvbnN0LkNIQVJUX1RZUEVfQ09MVU1OO1xuICAgIHJldHVybiBfY3JlYXRlQ2hhcnQoY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKTtcbn07XG5cbi8qKlxuICogTGluZSBjaGFydCBjcmVhdG9yLlxuICogQG1lbWJlck9mIG5lLmFwcGxpY2F0aW9uLmNoYXJ0XG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY2hhcnQgY29udGFpbmVyXG4gKiBAcGFyYW0ge29iamVjdH0gZGF0YSBjaGFydCBkYXRhXG4gKiAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGRhdGEuY2F0ZWdvcmllcyBjYXRlZ29yaWVzXG4gKiAgICAgIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gZGF0YS5zZXJpZXMgc2VyaWVzIGRhdGFcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuY2hhcnQgY2hhcnQgb3B0aW9uc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMuY2hhcnQud2lkdGggY2hhcnQgd2lkdGhcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LmhlaWdodCBjaGFydCBoZWlnaHRcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmNoYXJ0LnRpdGxlIGNoYXJ0IHRpdGxlXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC5mb3JtYXQgdmFsdWUgZm9ybWF0XG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnlBeGlzIG9wdGlvbnMgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMueUF4aXMudGl0bGUgdGl0bGUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMueUF4aXMubWluIG1pbmltYWwgdmFsdWUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMueUF4aXMubWF4IG1heGltdW0gdmFsdWUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy54QXhpcyBvcHRpb25zIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMueEF4aXMudGl0bGUgdGl0bGUgb2YgaG9yaXpvbnRhbCBheGlzXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnNlcmllcyBvcHRpb25zIG9mIHNlcmllc1xuICogICAgICAgICAgQHBhcmFtIHtib29sZWFufSBvcHRpb25zLnNlcmllcy5oYXNEb3Qgd2hldGhlciBoYXMgZG90IG9yIG5vdFxuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy50b29sdGlwIG9wdGlvbnMgb2YgdG9vbHRpcFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC5zdWZmaXggc3VmZml4IG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAudGVtcGxhdGUgdGVtcGxhdGUgb2YgdG9vbHRpcFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC5wb3NpdGlvbiB0b29sdGlwIHBvc2l0aW9uIHR5cGVcbiAqICAgICAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24gYWRkIHBvc2l0aW9uXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMudG9vbHRpcC5hZGRQb3NpdGlvbi5sZWZ0IGFkZCBsZWZ0IHBvc2l0aW9uXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMudG9vbHRpcC5hZGRQb3NpdGlvbi50b3AgYWRkIHRvcCBwb3NpdGlvblxuICogICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50aGVtZSB0aGVtZSBuYW1lXG4gKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmxpYlR5cGUgZ3JhcGggbGlicmFyeSB0eXBlXG4gKiBAcmV0dXJucyB7b2JqZWN0fSBiYXIgY2hhcnRcbiAqIEBleGFtcGxlXG4gKiB2YXIgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhaW5lci1pZCcpLFxuICogICAgIGRhdGEgPSB7XG4gKiAgICAgICBjYXRlZ29yaWVzOiBbJ2NhdGUxJywgJ2NhdGUyJywgJ2NhdGUzJ10sXG4gKiAgICAgICBzZXJpZXM6IFtcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQxJyxcbiAqICAgICAgICAgICBkYXRhOiBbMjAsIDMwLCA1MF1cbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQyJyxcbiAqICAgICAgICAgICBkYXRhOiBbNDAsIDQwLCA2MF1cbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQzJyxcbiAqICAgICAgICAgICBkYXRhOiBbNjAsIDUwLCAxMF1cbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQ0JyxcbiAqICAgICAgICAgICBkYXRhOiBbODAsIDEwLCA3MF1cbiAqICAgICAgICAgfVxuICogICAgICAgXVxuICogICAgIH0sXG4gKiAgICAgb3B0aW9ucyA9IHtcbiAqICAgICAgIGNoYXJ0OiB7XG4gKiAgICAgICAgIHRpdGxlOiAnTGluZSBDaGFydCdcbiAqICAgICAgIH0sXG4gKiAgICAgICB5QXhpczoge1xuICogICAgICAgICB0aXRsZTogJ1kgQXhpcydcbiAqICAgICAgIH0sXG4gKiAgICAgICB4QXhpczoge1xuICogICAgICAgICB0aXRsZTogJ1ggQXhpcydcbiAqICAgICAgIH0sXG4gKiAgICAgICBzZXJpZXM6IHtcbiAqICAgICAgICAgaGFzRG90OiB0cnVlXG4gKiAgICAgICB9XG4gKiAgICAgfTtcbiAqIG5lLmFwcGxpY2F0aW9uLmNoYXJ0LmxpbmVDaGFydChjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpO1xuICovXG5uZS5hcHBsaWNhdGlvbi5jaGFydC5saW5lQ2hhcnQgPSBmdW5jdGlvbihjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICBvcHRpb25zLmNoYXJ0VHlwZSA9IGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9MSU5FO1xuICAgIHJldHVybiBfY3JlYXRlQ2hhcnQoY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKTtcbn07XG5cbi8qKlxuICogQ29tYm8gY2hhcnQgY3JlYXRvci5cbiAqIEBtZW1iZXJPZiBuZS5hcHBsaWNhdGlvbi5jaGFydFxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNoYXJ0IGNvbnRhaW5lclxuICogQHBhcmFtIHtvYmplY3R9IGRhdGEgY2hhcnQgZGF0YVxuICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBkYXRhLmNhdGVnb3JpZXMgY2F0ZWdvcmllc1xuICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IGRhdGEuc2VyaWVzIHNlcmllcyBkYXRhXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLmNoYXJ0IGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LndpZHRoIGNoYXJ0IHdpZHRoXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5jaGFydC5oZWlnaHQgY2hhcnQgaGVpZ2h0XG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC50aXRsZSBjaGFydCB0aXRsZVxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuY2hhcnQuZm9ybWF0IHZhbHVlIGZvcm1hdFxuICogICAgICBAcGFyYW0ge29iamVjdFtdfSBvcHRpb25zLnlBeGlzIG9wdGlvbnMgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMueUF4aXNbXS50aXRsZSB0aXRsZSBvZiB2ZXJ0aWNhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy55QXhpc1tdLm1pbiBtaW5pbWFsIHZhbHVlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnlBeGlzW10ubWF4IG1heGltdW0gdmFsdWUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy54QXhpcyBvcHRpb25zIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMueEF4aXMudGl0bGUgdGl0bGUgb2YgaG9yaXpvbnRhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy54QXhpcy5taW4gbWluaW1hbCB2YWx1ZSBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnhBeGlzLm1heCBtYXhpbXVtIHZhbHVlIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5zZXJpZXMgb3B0aW9ucyBvZiBzZXJpZXNcbiAqICAgICAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnNlcmllcy5jb2x1bW4gb3B0aW9ucyBvZiBjb2x1bW4gc2VyaWVzXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuc2VyaWVzLmNvbHVtbi5zdGFja2VkIHN0YWNrZWQgdHlwZVxuICogICAgICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuc2VyaWVzLmxpbmUgb3B0aW9ucyBvZiBsaW5lIHNlcmllc1xuICogICAgICAgICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5zZXJpZXMubGluZS5oYXNEb3Qgd2hldGhlciBoYXMgZG90IG9yIG5vdFxuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy50b29sdGlwIG9wdGlvbnMgb2YgdG9vbHRpcFxuICogICAgICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMudG9vbHRpcC5jb2x1bW4gb3B0aW9ucyBvZiBjb2x1bW4gdG9vbHRpcFxuICogICAgICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAuY29sdW1uLnN1ZmZpeCBzdWZmaXggb2YgdG9vbHRpcFxuICogICAgICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAuY29sdW1uLnRlbXBsYXRlIHRlbXBsYXRlIG9mIHRvb2x0aXBcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLmNvbHVtbi5wb3NpdGlvbiB0b29sdGlwIHBvc2l0aW9uIHR5cGVcbiAqICAgICAgICAgICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy50b29sdGlwLmNvbHVtbi5hZGRQb3NpdGlvbiBhZGQgcG9zaXRpb25cbiAqICAgICAgICAgICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMudG9vbHRpcC5jb2x1bW4uYWRkUG9zaXRpb24ubGVmdCBhZGQgbGVmdCBwb3NpdGlvblxuICogICAgICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy50b29sdGlwLmNvbHVtbi5hZGRQb3NpdGlvbi50b3AgYWRkIHRvcCBwb3NpdGlvblxuICogICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50aGVtZSB0aGVtZSBuYW1lXG4gKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmxpYlR5cGUgZ3JhcGggbGlicmFyeSB0eXBlXG4gKiBAcmV0dXJucyB7b2JqZWN0fSBiYXIgY2hhcnRcbiAqIEBleGFtcGxlXG4gKiB2YXIgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhaW5lci1pZCcpLFxuICogICAgIGRhdGEgPSB7XG4gKiAgICAgICBjYXRlZ29yaWVzOiBbJ2NhdGUxJywgJ2NhdGUyJywgJ2NhdGUzJ10sXG4gKiAgICAgICBzZXJpZXM6IHtcbiAqICAgICAgICAgY29sdW1uOiBbXG4gKiAgICAgICAgICAge1xuICogICAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDEnLFxuICogICAgICAgICAgICAgZGF0YTogWzIwLCAzMCwgNTBdXVxuICogICAgICAgICAgIH0sXG4gKiAgICAgICAgICAge1xuICogICAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDInLFxuICogICAgICAgICAgICAgZGF0YTogWzQwLCA0MCwgNjBdXG4gKiAgICAgICAgICAgfSxcbiAqICAgICAgICAgICB7XG4gKiAgICAgICAgICAgICBuYW1lOiAnTGVnZW5kMycsXG4gKiAgICAgICAgICAgICBkYXRhOiBbNjAsIDUwLCAxMF1cbiAqICAgICAgICAgICB9LFxuICogICAgICAgICAgIHtcbiAqICAgICAgICAgICAgIG5hbWU6ICdMZWdlbmQ0JyxcbiAqICAgICAgICAgICAgIGRhdGE6IFs4MCwgMTAsIDcwXVxuICogICAgICAgICAgIH1cbiAqICAgICAgICAgfSxcbiAqICAgICAgICAgbGluZTogW1xuICogICAgICAgICAgIHtcbiAqICAgICAgICAgICAgIG5hbWU6ICdMZWdlbmQ1JyxcbiAqICAgICAgICAgICAgIGRhdGE6IFsxLCAyLCAzXVxuICogICAgICAgICAgIH1cbiAqICAgICAgICAgXVxuICogICAgICAgfVxuICogICAgIH0sXG4gKiAgICAgb3B0aW9ucyA9IHtcbiAqICAgICAgIGNoYXJ0OiB7XG4gKiAgICAgICAgIHRpdGxlOiAnQ29tYm8gQ2hhcnQnXG4gKiAgICAgICB9LFxuICogICAgICAgeUF4aXM6W1xuICogICAgICAgICB7XG4gKiAgICAgICAgICAgdGl0bGU6ICdZIEF4aXMnLFxuICogICAgICAgICAgIGNoYXJ0VHlwZTogJ2xpbmUnXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICB0aXRsZTogJ1kgUmlnaHQgQXhpcydcbiAqICAgICAgICAgfVxuICogICAgICAgXSxcbiAqICAgICAgIHhBeGlzOiB7XG4gKiAgICAgICAgIHRpdGxlOiAnWCBBeGlzJ1xuICogICAgICAgfSxcbiAqICAgICAgIHNlcmllczoge1xuICogICAgICAgICBoYXNEb3Q6IHRydWVcbiAqICAgICAgIH1cbiAqICAgICB9O1xuICogbmUuYXBwbGljYXRpb24uY2hhcnQuY29tYm9DaGFydChjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpO1xuICovXG5uZS5hcHBsaWNhdGlvbi5jaGFydC5jb21ib0NoYXJ0ID0gZnVuY3Rpb24oY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgb3B0aW9ucy5jaGFydFR5cGUgPSBjaGFydENvbnN0LkNIQVJUX1RZUEVfQ09NQk87XG4gICAgcmV0dXJuIF9jcmVhdGVDaGFydChjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpO1xufTtcblxuLyoqXG4gKiBQaWUgY2hhcnQgY3JlYXRvci5cbiAqIEBtZW1iZXJPZiBuZS5hcHBsaWNhdGlvbi5jaGFydFxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNoYXJ0IGNvbnRhaW5lclxuICogQHBhcmFtIHtvYmplY3R9IGRhdGEgY2hhcnQgZGF0YVxuICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IGRhdGEuc2VyaWVzIHNlcmllcyBkYXRhXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLmNoYXJ0IGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LndpZHRoIGNoYXJ0IHdpZHRoXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5jaGFydC5oZWlnaHQgY2hhcnQgaGVpZ2h0XG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC50aXRsZSBjaGFydCB0aXRsZVxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuY2hhcnQuZm9ybWF0IHZhbHVlIGZvcm1hdFxuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy50b29sdGlwIG9wdGlvbnMgb2YgdG9vbHRpcFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC5zdWZmaXggc3VmZml4IG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAudGVtcGxhdGUgdGVtcGxhdGUgb2YgdG9vbHRpcFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC5wb3NpdGlvbiB0b29sdGlwIHBvc2l0aW9uIHR5cGVcbiAqICAgICAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24gYWRkIHBvc2l0aW9uXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMudG9vbHRpcC5hZGRQb3NpdGlvbi5sZWZ0IGFkZCBsZWZ0IHBvc2l0aW9uXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMudG9vbHRpcC5hZGRQb3NpdGlvbi50b3AgYWRkIHRvcCBwb3NpdGlvblxuICogICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50aGVtZSB0aGVtZSBuYW1lXG4gKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmxpYlR5cGUgZ3JhcGggbGlicmFyeSB0eXBlXG4gKiBAcmV0dXJucyB7b2JqZWN0fSBiYXIgY2hhcnRcbiAqIEBleGFtcGxlXG4gKiB2YXIgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhaW5lci1pZCcpLFxuICogICAgIGRhdGEgPSB7XG4gKiAgICAgICBzZXJpZXM6IFtcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQxJyxcbiAqICAgICAgICAgICBkYXRhOiAyMFxuICogICAgICAgICB9LFxuICogICAgICAgICB7XG4gKiAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDInLFxuICogICAgICAgICAgIGRhdGE6IDQwXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMycsXG4gKiAgICAgICAgICAgZGF0YTogNjBcbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQ0JyxcbiAqICAgICAgICAgICBkYXRhOiA4MFxuICogICAgICAgICB9XG4gKiAgICAgICBdXG4gKiAgICAgfSxcbiAqICAgICBvcHRpb25zID0ge1xuICogICAgICAgY2hhcnQ6IHtcbiAqICAgICAgICAgdGl0bGU6ICdQaWUgQ2hhcnQnXG4gKiAgICAgICB9XG4gKiAgICAgfTtcbiAqIG5lLmFwcGxpY2F0aW9uLmNoYXJ0LnBpZUNoYXJ0KGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucyk7XG4gKi9cbm5lLmFwcGxpY2F0aW9uLmNoYXJ0LnBpZUNoYXJ0ID0gZnVuY3Rpb24oY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgb3B0aW9ucy5jaGFydFR5cGUgPSBjaGFydENvbnN0LkNIQVJUX1RZUEVfUElFO1xuICAgIHJldHVybiBfY3JlYXRlQ2hhcnQoY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKTtcbn07XG5cbi8qKlxuICogUmVnaXN0ZXIgdGhlbWUuXG4gKiBAbWVtYmVyT2YgbmUuYXBwbGljYXRpb24uY2hhcnRcbiAqIEBwYXJhbSB7c3RyaW5nfSB0aGVtZU5hbWUgdGhlbWUgbmFtZVxuICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIGFwcGxpY2F0aW9uIGNoYXJ0IHRoZW1lXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSB0aGVtZS5jaGFydCBjaGFydCB0aGVtZVxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLmNoYXJ0LmZvbnRGYW1pbHkgZm9udCBmYW1pbHkgb2YgY2hhcnRcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS5jaGFydC5iYWNrZ3JvdW5kIGJhY2tncm91bmQgb2YgY2hhcnRcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IHRoZW1lLnRpdGxlIGNoYXJ0IHRoZW1lXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gdGhlbWUudGl0bGUuZm9udFNpemUgZm9udCBzaXplIG9mIGNoYXJ0IHRpdGxlXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUudGl0bGUuZm9udEZhbWlseSBmb250IGZhbWlseSBvZiBjaGFydCB0aXRsZVxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnRpdGxlLmNvbG9yIGZvbnQgY29sb3Igb2YgY2hhcnQgdGl0bGVcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS50aXRsZS5iYWNrZ3JvdW5kIGJhY2tncm91bmQgb2YgY2hhcnQgdGl0bGVcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IHRoZW1lLnlBeGlzIHRoZW1lIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7b2JqZWN0fSB0aGVtZS55QXhpcy50aXRsZSB0aGVtZSBvZiB2ZXJ0aWNhbCBheGlzIHRpdGxlXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IHRoZW1lLnlBeGlzLnRpdGxlLmZvbnRTaXplIGZvbnQgc2l6ZSBvZiB2ZXJ0aWNhbCBheGlzIHRpdGxlXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnlBeGlzLnRpdGxlLmZvbnRGYW1pbHkgZm9udCBmYW1pbHkgb2YgdmVydGljYWwgYXhpcyB0aXRsZVxuICogICAgICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS55QXhpcy50aXRsZS5jb2xvciBmb250IGNvbG9yIG9mIHZlcnRpY2FsIGF4aXMgdGl0bGVcbiAqICAgICAgICAgIEBwYXJhbSB7b2JqZWN0fSB0aGVtZS55QXhpcy5sYWJlbCB0aGVtZSBvZiB2ZXJ0aWNhbCBheGlzIGxhYmVsXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IHRoZW1lLnlBeGlzLmxhYmVsLmZvbnRTaXplIGZvbnQgc2l6ZSBvZiB2ZXJ0aWNhbCBheGlzIGxhYmVsXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnlBeGlzLmxhYmVsLmZvbnRGYW1pbHkgZm9udCBmYW1pbHkgb2YgdmVydGljYWwgYXhpcyBsYWJlbFxuICogICAgICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS55QXhpcy5sYWJlbC5jb2xvciBmb250IGNvbG9yIG9mIHZlcnRpY2FsIGF4aXMgbGFiZWxcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS55QXhpcy50aWNrY29sb3IgY29sb3Igb2YgdmVydGljYWwgYXhpcyB0aWNrXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSB0aGVtZS54QXhpcyB0aGVtZSBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7b2JqZWN0fSB0aGVtZS54QXhpcy50aXRsZSB0aGVtZSBvZiBob3Jpem9udGFsIGF4aXMgdGl0bGVcbiAqICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gdGhlbWUueEF4aXMudGl0bGUuZm9udFNpemUgZm9udCBzaXplIG9mIGhvcml6b250YWwgYXhpcyB0aXRsZVxuICogICAgICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS54QXhpcy50aXRsZS5mb250RmFtaWx5IGZvbnQgZmFtaWx5IG9mIGhvcml6b250YWwgYXhpcyB0aXRsZVxuICogICAgICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS54QXhpcy50aXRsZS5jb2xvciBmb250IGNvbG9yIG9mIGhvcml6b250YWwgYXhpcyB0aXRsZVxuICogICAgICAgICAgQHBhcmFtIHtvYmplY3R9IHRoZW1lLnhBeGlzLmxhYmVsIHRoZW1lIG9mIGhvcml6b250YWwgYXhpcyBsYWJlbFxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSB0aGVtZS54QXhpcy5sYWJlbC5mb250U2l6ZSBmb250IHNpemUgb2YgaG9yaXpvbnRhbCBheGlzIGxhYmVsXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnhBeGlzLmxhYmVsLmZvbnRGYW1pbHkgZm9udCBmYW1pbHkgb2YgaG9yaXpvbnRhbCBheGlzIGxhYmVsXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnhBeGlzLmxhYmVsLmNvbG9yIGZvbnQgY29sb3Igb2YgaG9yaXpvbnRhbCBheGlzIGxhYmVsXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUueEF4aXMudGlja2NvbG9yIGNvbG9yIG9mIGhvcml6b250YWwgYXhpcyB0aWNrXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSB0aGVtZS5wbG90IHBsb3QgdGhlbWVcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS5wbG90LmxpbmVDb2xvciBwbG90IGxpbmUgY29sb3JcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS5wbG90LmJhY2tncm91bmQgcGxvdCBiYWNrZ3JvdW5kXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSB0aGVtZS5zZXJpZXMgc2VyaWVzIHRoZW1lXG4gKiAgICAgICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSB0aGVtZS5zZXJpZXMuY29sb3JzIHNlcmllcyBjb2xvcnNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS5zZXJpZXMuYm9yZGVyQ29sb3Igc2VyaWVzIGJvcmRlciBjb2xvclxuICogICAgICBAcGFyYW0ge29iamVjdH0gdGhlbWUubGVnZW5kIGxlZ2VuZCB0aGVtZVxuICogICAgICAgICAgQHBhcmFtIHtvYmplY3R9IHRoZW1lLmxlZ2VuZC5sYWJlbCB0aGVtZSBvZiBsZWdlbmQgbGFiZWxcbiAqICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gdGhlbWUubGVnZW5kLmxhYmVsLmZvbnRTaXplIGZvbnQgc2l6ZSBvZiBsZWdlbmQgbGFiZWxcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUubGVnZW5kLmxhYmVsLmZvbnRGYW1pbHkgZm9udCBmYW1pbHkgb2YgbGVnZW5kIGxhYmVsXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLmxlZ2VuZC5sYWJlbC5jb2xvciBmb250IGNvbG9yIG9mIGxlZ2VuZCBsYWJlbFxuICogQGV4YW1wbGVcbiAqIHZhciB0aGVtZSA9IHtcbiAqICAgeUF4aXM6IHtcbiAqICAgICB0aWNrQ29sb3I6ICcjY2NiZDlhJyxcbiAqICAgICAgIHRpdGxlOiB7XG4gKiAgICAgICAgIGNvbG9yOiAnIzMzMzMzMydcbiAqICAgICAgIH0sXG4gKiAgICAgICBsYWJlbDoge1xuICogICAgICAgICBjb2xvcjogJyM2ZjQ5MWQnXG4gKiAgICAgICB9XG4gKiAgICAgfSxcbiAqICAgICB4QXhpczoge1xuICogICAgICAgdGlja0NvbG9yOiAnI2NjYmQ5YScsXG4gKiAgICAgICB0aXRsZToge1xuICogICAgICAgICBjb2xvcjogJyMzMzMzMzMnXG4gKiAgICAgICB9LFxuICogICAgICAgbGFiZWw6IHtcbiAqICAgICAgICAgY29sb3I6ICcjNmY0OTFkJ1xuICogICAgICAgfVxuICogICAgIH0sXG4gKiAgICAgcGxvdDoge1xuICogICAgICAgbGluZUNvbG9yOiAnI2U1ZGJjNCcsXG4gKiAgICAgICBiYWNrZ3JvdW5kOiAnI2Y2ZjFlNSdcbiAqICAgICB9LFxuICogICAgIHNlcmllczoge1xuICogICAgICAgY29sb3JzOiBbJyM0MGFiYjQnLCAnI2U3OGEzMScsICcjYzFjNDUyJywgJyM3OTUyMjQnLCAnI2Y1ZjVmNSddLFxuICogICAgICAgYm9yZGVyQ29sb3I6ICcjOGU2NTM1J1xuICogICAgIH0sXG4gKiAgICAgbGVnZW5kOiB7XG4gKiAgICAgICBsYWJlbDoge1xuICogICAgICAgICBjb2xvcjogJyM2ZjQ5MWQnXG4gKiAgICAgICB9XG4gKiAgICAgfVxuICogICB9O1xuICogY2hhcnQucmVnaXN0ZXJUaGVtZSgnbmV3VGhlbWUnLCB0aGVtZSk7XG4gKi9cbm5lLmFwcGxpY2F0aW9uLmNoYXJ0LnJlZ2lzdGVyVGhlbWUgPSBmdW5jdGlvbih0aGVtZU5hbWUsIHRoZW1lKSB7XG4gICAgdGhlbWVGYWN0b3J5LnJlZ2lzdGVyKHRoZW1lTmFtZSwgdGhlbWUpO1xufTtcblxuLyoqXG4gKiBSZWdpc3RlciBncmFwaCBwbHVnaW4uXG4gKiBAbWVtYmVyT2YgbmUuYXBwbGljYXRpb24uY2hhcnRcbiAqIEBwYXJhbSB7c3RyaW5nfSBsaWJUeXBlIHR5cGUgb2YgZ3JhcGggbGlicmFyeVxuICogQHBhcmFtIHtvYmplY3R9IHBsdWdpbiBwbHVnaW4gdG8gY29udHJvbCBsaWJyYXJ5XG4gKiBAZXhhbXBsZVxuICogdmFyIHBsdWdpblJhcGhhZWwgPSB7XG4gKiAgIGJhcjogZnVuY3Rpb24oKSB7fSAvLyBSZW5kZXIgY2xhc3NcbiAqIH07XG4gKiBuZS5hcHBsaWNhdGlvbi5jaGFydC5yZWdpc3RlclBsdWdpbigncmFwaGFlbCcsIHBsdWdpblJhcGhhZWwpO1xuICovXG5uZS5hcHBsaWNhdGlvbi5jaGFydC5yZWdpc3RlclBsdWdpbiA9IGZ1bmN0aW9uKGxpYlR5cGUsIHBsdWdpbikge1xuICAgIHBsdWdpbkZhY3RvcnkucmVnaXN0ZXIobGliVHlwZSwgcGx1Z2luKTtcbn07XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgQXhpc0Jhc2VcbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIENoYXJ0QmFzZSA9IHJlcXVpcmUoJy4vY2hhcnRCYXNlLmpzJyksXG4gICAgQXhpcyA9IHJlcXVpcmUoJy4uL2F4ZXMvYXhpcy5qcycpLFxuICAgIFBsb3QgPSByZXF1aXJlKCcuLi9wbG90cy9wbG90LmpzJyksXG4gICAgTGVnZW5kID0gcmVxdWlyZSgnLi4vbGVnZW5kcy9sZWdlbmQuanMnKSxcbiAgICBUb29sdGlwID0gcmVxdWlyZSgnLi4vdG9vbHRpcHMvdG9vbHRpcC5qcycpO1xuXG52YXIgQXhpc1R5cGVCYXNlID0gbmUudXRpbC5kZWZpbmVDbGFzcyhDaGFydEJhc2UsIC8qKiBAbGVuZHMgQXhpc1R5cGVCYXNlLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogQXhpcyB0eXBlIGNoYXJ0IGJhc2VcbiAgICAgKiBAY29uc3RydWN0cyBBeGlzVHlwZUJhc2VcbiAgICAgKiBAZXh0ZW5kcyBDaGFydEJhc2VcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICAgIENoYXJ0QmFzZS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIGF4aXMgY29tcG9uZW50c1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5jb3ZlcnREYXRhIGNvbnZlcnRlZCBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmF4ZXMgYXhlcyBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnBsb3REYXRhIHBsb3QgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHtmdW5jdGlvbn0gcGFyYW1zLlNlcmllcyBzZXJpZXMgY2xhc3NcbiAgICAgKi9cbiAgICBhZGRBeGlzQ29tcG9uZW50czogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBjb252ZXJ0RGF0YSA9IHBhcmFtcy5jb252ZXJ0RGF0YTtcblxuICAgICAgICBpZiAocGFyYW1zLnBsb3REYXRhKSB7XG4gICAgICAgICAgICB0aGlzLmFkZENvbXBvbmVudCgncGxvdCcsIFBsb3QsIHBhcmFtcy5wbG90RGF0YSk7XG4gICAgICAgIH1cblxuICAgICAgICBuZS51dGlsLmZvckVhY2gocGFyYW1zLmF4ZXMsIGZ1bmN0aW9uKGRhdGEsIG5hbWUpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KG5hbWUsIEF4aXMsIHtcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgaWYgKGNvbnZlcnREYXRhLmpvaW5MZWdlbmRMYWJlbHMpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KCdsZWdlbmQnLCBMZWdlbmQsIHtcbiAgICAgICAgICAgICAgICBqb2luTGVnZW5kTGFiZWxzOiBjb252ZXJ0RGF0YS5qb2luTGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgICAgIGxlZ2VuZExhYmVsczogY29udmVydERhdGEubGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgICAgIGNoYXJ0VHlwZTogcGFyYW1zLmNoYXJ0VHlwZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmFkZENvbXBvbmVudCgndG9vbHRpcCcsIFRvb2x0aXAsIHtcbiAgICAgICAgICAgIHZhbHVlczogY29udmVydERhdGEuZm9ybWF0dGVkVmFsdWVzLFxuICAgICAgICAgICAgbGFiZWxzOiBjb252ZXJ0RGF0YS5sYWJlbHMsXG4gICAgICAgICAgICBsZWdlbmRMYWJlbHM6IGNvbnZlcnREYXRhLmxlZ2VuZExhYmVscyxcbiAgICAgICAgICAgIHByZWZpeDogdGhpcy50b29sdGlwUHJlZml4XG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEF4aXNUeXBlQmFzZTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBCYXIgY2hhcnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBBeGlzVHlwZUJhc2UgPSByZXF1aXJlKCcuL2F4aXNUeXBlQmFzZS5qcycpLFxuICAgIGF4aXNEYXRhTWFrZXIgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2F4aXNEYXRhTWFrZXIuanMnKSxcbiAgICBTZXJpZXMgPSByZXF1aXJlKCcuLi9zZXJpZXMvYmFyQ2hhcnRTZXJpZXMuanMnKTtcblxudmFyIEJhckNoYXJ0ID0gbmUudXRpbC5kZWZpbmVDbGFzcyhBeGlzVHlwZUJhc2UsIC8qKiBAbGVuZHMgQmFyQ2hhcnQucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBCYXIgY2hhcnQuXG4gICAgICogQGNvbnN0cnVjdHMgQmFyQ2hhcnRcbiAgICAgKiBAZXh0ZW5kcyBBeGlzVHlwZUJhc2VcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheT59IHVzZXJEYXRhIGNoYXJ0IGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgY2hhcnQgdGhlbWVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24odXNlckRhdGEsIHRoZW1lLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciBiYXNlRGF0YSA9IHRoaXMubWFrZUJhc2VEYXRhKHVzZXJEYXRhLCB0aGVtZSwgb3B0aW9ucywge1xuICAgICAgICAgICAgICAgIGhhc0F4ZXM6IHRydWVcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgY29udmVydERhdGEgPSBiYXNlRGF0YS5jb252ZXJ0RGF0YSxcbiAgICAgICAgICAgIGJvdW5kcyA9IGJhc2VEYXRhLmJvdW5kcyxcbiAgICAgICAgICAgIGF4aXNEYXRhO1xuXG4gICAgICAgIHRoaXMuY2xhc3NOYW1lID0gJ25lLWJhci1jaGFydCc7XG5cbiAgICAgICAgQXhpc1R5cGVCYXNlLmNhbGwodGhpcywgYm91bmRzLCB0aGVtZSwgb3B0aW9ucyk7XG5cbiAgICAgICAgYXhpc0RhdGEgPSB0aGlzLl9tYWtlQXhlc0RhdGEoY29udmVydERhdGEsIGJvdW5kcywgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMuX2FkZENvbXBvbmVudHMoY29udmVydERhdGEsIGF4aXNEYXRhLCBvcHRpb25zKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBheGVzIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udmVydERhdGEgY29udmVydGVkIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYm91bmRzIGNoYXJ0IGJvdW5kc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBheGVzIGRhdGFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQXhlc0RhdGE6IGZ1bmN0aW9uKGNvbnZlcnREYXRhLCBib3VuZHMsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIGF4ZXNEYXRhID0ge1xuICAgICAgICAgICAgeUF4aXM6IGF4aXNEYXRhTWFrZXIubWFrZUxhYmVsQXhpc0RhdGEoe1xuICAgICAgICAgICAgICAgIGxhYmVsczogY29udmVydERhdGEubGFiZWxzLFxuICAgICAgICAgICAgICAgIGlzVmVydGljYWw6IHRydWVcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgeEF4aXM6IGF4aXNEYXRhTWFrZXIubWFrZVZhbHVlQXhpc0RhdGEoe1xuICAgICAgICAgICAgICAgIHZhbHVlczogY29udmVydERhdGEudmFsdWVzLFxuICAgICAgICAgICAgICAgIHNlcmllc0RpbWVuc2lvbjogYm91bmRzLnNlcmllcy5kaW1lbnNpb24sXG4gICAgICAgICAgICAgICAgc3RhY2tlZDogb3B0aW9ucy5zZXJpZXMgJiYgb3B0aW9ucy5zZXJpZXMuc3RhY2tlZCB8fCAnJyxcbiAgICAgICAgICAgICAgICBjaGFydFR5cGU6IG9wdGlvbnMuY2hhcnRUeXBlLFxuICAgICAgICAgICAgICAgIGZvcm1hdEZ1bmN0aW9uczogY29udmVydERhdGEuZm9ybWF0RnVuY3Rpb25zLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IG9wdGlvbnMueEF4aXNcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBheGVzRGF0YTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIGNvbXBvbmVudHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udmVydERhdGEgY29udmVydGVkIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYXhlc0RhdGEgYXhlcyBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2FkZENvbXBvbmVudHM6IGZ1bmN0aW9uKGNvbnZlcnREYXRhLCBheGVzRGF0YSwgb3B0aW9ucykge1xuICAgICAgICB0aGlzLmFkZEF4aXNDb21wb25lbnRzKHtcbiAgICAgICAgICAgIGNvbnZlcnREYXRhOiBjb252ZXJ0RGF0YSxcbiAgICAgICAgICAgIGF4ZXM6IGF4ZXNEYXRhLFxuICAgICAgICAgICAgcGxvdERhdGE6IHtcbiAgICAgICAgICAgICAgICB2VGlja0NvdW50OiBheGVzRGF0YS55QXhpcy52YWxpZFRpY2tDb3VudCxcbiAgICAgICAgICAgICAgICBoVGlja0NvdW50OiBheGVzRGF0YS54QXhpcy52YWxpZFRpY2tDb3VudFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNoYXJ0VHlwZTogb3B0aW9ucy5jaGFydFR5cGVcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5hZGRDb21wb25lbnQoJ3NlcmllcycsIFNlcmllcywge1xuICAgICAgICAgICAgbGliVHlwZTogb3B0aW9ucy5saWJUeXBlLFxuICAgICAgICAgICAgY2hhcnRUeXBlOiBvcHRpb25zLmNoYXJ0VHlwZSxcbiAgICAgICAgICAgIHRvb2x0aXBQcmVmaXg6IHRoaXMudG9vbHRpcFByZWZpeCxcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICB2YWx1ZXM6IGNvbnZlcnREYXRhLnZhbHVlcyxcbiAgICAgICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXM6IGNvbnZlcnREYXRhLmZvcm1hdHRlZFZhbHVlcyxcbiAgICAgICAgICAgICAgICBzY2FsZTogYXhlc0RhdGEueEF4aXMuc2NhbGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmFyQ2hhcnQ7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgQ2hhcnRCYXNlXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBkb20gPSByZXF1aXJlKCcuLi9oZWxwZXJzL2RvbUhhbmRsZXIuanMnKSxcbiAgICByZW5kZXJVdGlsID0gcmVxdWlyZSgnLi4vaGVscGVycy9yZW5kZXJVdGlsLmpzJyksXG4gICAgZGF0YUNvbnZlcnRlciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZGF0YUNvbnZlcnRlci5qcycpLFxuICAgIGJvdW5kc01ha2VyID0gcmVxdWlyZSgnLi4vaGVscGVycy9ib3VuZHNNYWtlci5qcycpO1xuXG52YXIgVE9PTFRJUF9QUkVGSVggPSAnbmUtY2hhcnQtdG9vbHRpcC0nO1xuXG52YXIgQ2hhcnRCYXNlID0gbmUudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIENoYXJ0QmFzZS5wcm90b3R5cGUgKi8ge1xuICAgIHRvb2x0aXBQcmVmaXg6IFRPT0xUSVBfUFJFRklYICsgKG5ldyBEYXRlKCkpLmdldFRpbWUoKSArICctJyxcblxuICAgIC8qKlxuICAgICAqIENoYXJ0IGJhc2UuXG4gICAgICogQGNvbnN0cnVjdHMgQ2hhcnRCYXNlXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGJvdW5kcyBjaGFydCBib3VuZHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgY2hhcnQgdGhlbWVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGluaXRlZERhdGEgaW5pdGlhbGl6ZWQgZGF0YSBmcm9tIGNvbWJvIGNoYXJ0XG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24oYm91bmRzLCB0aGVtZSwgb3B0aW9ucywgaW5pdGVkRGF0YSkge1xuICAgICAgICB0aGlzLmNvbXBvbmVudHMgPSBbXTtcbiAgICAgICAgdGhpcy5jb21wb25lbnRNYXAgPSB7fTtcbiAgICAgICAgdGhpcy5ib3VuZHMgPSBib3VuZHM7XG4gICAgICAgIHRoaXMudGhlbWUgPSB0aGVtZTtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICAgICAgaWYgKGluaXRlZERhdGEgJiYgaW5pdGVkRGF0YS5wcmVmaXgpIHtcbiAgICAgICAgICAgIHRoaXMudG9vbHRpcFByZWZpeCArPSBpbml0ZWREYXRhLnByZWZpeDtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGJhZXMgZGF0YS5cbiAgICAgKiBAcGFyYW0ge2FycmF5IHwgb2JqZWN0fSB1c2VyRGF0YSB1c2VyIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgY2hhcnQgdGhlbWVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGJvdW5kUGFyYW1zIGFkZCBib3VuZCBwYXJhbXNcbiAgICAgKiBAcmV0dXJucyB7e2NvbnZlcnREYXRhOiBvYmplY3QsIGJvdW5kczogb2JqZWN0fX0gYmFzZSBkYXRhXG4gICAgICovXG4gICAgbWFrZUJhc2VEYXRhOiBmdW5jdGlvbih1c2VyRGF0YSwgdGhlbWUsIG9wdGlvbnMsIGJvdW5kUGFyYW1zKSB7XG4gICAgICAgIHZhciBjb252ZXJ0RGF0YSA9IGRhdGFDb252ZXJ0ZXIuY29udmVydCh1c2VyRGF0YSwgb3B0aW9ucy5jaGFydCwgb3B0aW9ucy5jaGFydFR5cGUsIGJvdW5kUGFyYW1zICYmIGJvdW5kUGFyYW1zLnlBeGlzQ2hhcnRUeXBlcyksXG4gICAgICAgICAgICBib3VuZHMgPSBib3VuZHNNYWtlci5tYWtlKG5lLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICBjb252ZXJ0RGF0YTogY29udmVydERhdGEsXG4gICAgICAgICAgICAgICAgdGhlbWU6IHRoZW1lLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IG9wdGlvbnNcbiAgICAgICAgICAgIH0sIGJvdW5kUGFyYW1zKSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNvbnZlcnREYXRhOiBjb252ZXJ0RGF0YSxcbiAgICAgICAgICAgIGJvdW5kczogYm91bmRzXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZCBjb21wb25lbnQuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgY29tcG9uZW50IG5hbWVcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBDb21wb25lbnQgY29tcG9uZW50IGZ1bmN0aW9uXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICovXG4gICAgYWRkQ29tcG9uZW50OiBmdW5jdGlvbihuYW1lLCBDb21wb25lbnQsIHBhcmFtcykge1xuICAgICAgICB2YXIgYm91bmQgPSB0aGlzLmJvdW5kc1tuYW1lXSxcbiAgICAgICAgICAgIHRoZW1lID0gdGhpcy50aGVtZVtuYW1lXSxcbiAgICAgICAgICAgIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnNbbmFtZV0sXG4gICAgICAgICAgICBpbmRleCA9IHBhcmFtcy5pbmRleCB8fCAwLFxuICAgICAgICAgICAgY29tbW9uUGFyYW1zID0ge30sXG4gICAgICAgICAgICBjb21wb25lbnQ7XG5cbiAgICAgICAgY29tbW9uUGFyYW1zLmJvdW5kID0gbmUudXRpbC5pc0FycmF5KGJvdW5kKSA/IGJvdW5kW2luZGV4XSA6IGJvdW5kO1xuICAgICAgICBjb21tb25QYXJhbXMudGhlbWUgPSBuZS51dGlsLmlzQXJyYXkodGhlbWUpID8gdGhlbWVbaW5kZXhdIDogdGhlbWU7XG4gICAgICAgIGNvbW1vblBhcmFtcy5vcHRpb25zID0gbmUudXRpbC5pc0FycmF5KG9wdGlvbnMpID8gb3B0aW9uc1tpbmRleF0gOiBvcHRpb25zIHx8IHt9O1xuXG4gICAgICAgIHBhcmFtcyA9IG5lLnV0aWwuZXh0ZW5kKGNvbW1vblBhcmFtcywgcGFyYW1zKTtcbiAgICAgICAgY29tcG9uZW50ID0gbmV3IENvbXBvbmVudChwYXJhbXMpO1xuICAgICAgICB0aGlzLmNvbXBvbmVudHMucHVzaChjb21wb25lbnQpO1xuICAgICAgICB0aGlzLmNvbXBvbmVudE1hcFtuYW1lXSA9IGNvbXBvbmVudDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIGNoYXJ0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgb2JqZWN0IGZvciBncmFwaCBkcmF3aW5nXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSBjaGFydCBlbGVtZW50XG4gICAgICovXG4gICAgcmVuZGVyOiBmdW5jdGlvbihlbCwgcGFwZXIpIHtcbiAgICAgICAgaWYgKCFlbCkge1xuICAgICAgICAgICAgZWwgPSBkb20uY3JlYXRlKCdESVYnLCB0aGlzLmNsYXNzTmFtZSk7XG5cbiAgICAgICAgICAgIGRvbS5hZGRDbGFzcyhlbCwgJ25lLWNoYXJ0Jyk7XG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJUaXRsZShlbCk7XG4gICAgICAgICAgICByZW5kZXJVdGlsLnJlbmRlckRpbWVuc2lvbihlbCwgdGhpcy5ib3VuZHMuY2hhcnQuZGltZW5zaW9uKTtcbiAgICAgICAgICAgIHJlbmRlclV0aWwucmVuZGVyQmFja2dyb3VuZChlbCwgdGhpcy50aGVtZS5jaGFydC5iYWNrZ3JvdW5kKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3JlbmRlckNvbXBvbmVudHMoZWwsIHRoaXMuY29tcG9uZW50cywgcGFwZXIpO1xuICAgICAgICB0aGlzLl9hdHRhY2hDdXN0b21FdmVudCgpO1xuICAgICAgICByZXR1cm4gZWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciB0aXRsZS5cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlclRpdGxlOiBmdW5jdGlvbihlbCkge1xuICAgICAgICB2YXIgY2hhcnRPcHRpb25zID0gdGhpcy5vcHRpb25zLmNoYXJ0IHx8IHt9LFxuICAgICAgICAgICAgZWxUaXRsZSA9IHJlbmRlclV0aWwucmVuZGVyVGl0bGUoY2hhcnRPcHRpb25zLnRpdGxlLCB0aGlzLnRoZW1lLnRpdGxlLCAnbmUtY2hhcnQtdGl0bGUnKTtcbiAgICAgICAgZG9tLmFwcGVuZChlbCwgZWxUaXRsZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBjb21wb25lbnRzLlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciBjb250YWluZXIgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7YXJyYXkuPG9iamVjdD59IGNvbXBvbmVudHMgY29tcG9uZW50c1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciBvYmplY3QgZm9yIGdyYXBoIGRyYXdpbmdcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJDb21wb25lbnRzOiBmdW5jdGlvbihjb250YWluZXIsIGNvbXBvbmVudHMsIHBhcGVyKSB7XG4gICAgICAgIHZhciBlbGVtZW50cyA9IG5lLnV0aWwubWFwKGNvbXBvbmVudHMsIGZ1bmN0aW9uKGNvbXBvbmVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbXBvbmVudC5yZW5kZXIocGFwZXIpO1xuICAgICAgICB9KTtcbiAgICAgICAgZG9tLmFwcGVuZChjb250YWluZXIsIGVsZW1lbnRzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHBhcGVyLlxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHBhcGVyXG4gICAgICovXG4gICAgZ2V0UGFwZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2VyaWVzID0gdGhpcy5jb21wb25lbnRNYXAuc2VyaWVzLFxuICAgICAgICAgICAgcGFwZXI7XG5cbiAgICAgICAgaWYgKHNlcmllcykge1xuICAgICAgICAgICAgcGFwZXIgPSBzZXJpZXMuZ2V0UGFwZXIoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXBlcjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGN1c3RvbSBldmVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2F0dGFjaEN1c3RvbUV2ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHRvb2x0aXAgPSB0aGlzLmNvbXBvbmVudE1hcC50b29sdGlwLFxuICAgICAgICAgICAgc2VyaWVzID0gdGhpcy5jb21wb25lbnRNYXAuc2VyaWVzO1xuICAgICAgICBpZiAoIXRvb2x0aXAgfHwgIXNlcmllcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHNlcmllcy5vbignc2hvd1Rvb2x0aXAnLCB0b29sdGlwLm9uU2hvdywgdG9vbHRpcCk7XG4gICAgICAgIHNlcmllcy5vbignaGlkZVRvb2x0aXAnLCB0b29sdGlwLm9uSGlkZSwgdG9vbHRpcCk7XG5cbiAgICAgICAgaWYgKCFzZXJpZXMub25TaG93QW5pbWF0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0b29sdGlwLm9uKCdzaG93QW5pbWF0aW9uJywgc2VyaWVzLm9uU2hvd0FuaW1hdGlvbiwgc2VyaWVzKTtcbiAgICAgICAgdG9vbHRpcC5vbignaGlkZUFuaW1hdGlvbicsIHNlcmllcy5vbkhpZGVBbmltYXRpb24sIHNlcmllcyk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2hhcnRCYXNlO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IENvbHVtbiBjaGFydC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIEF4aXNUeXBlQmFzZSA9IHJlcXVpcmUoJy4vYXhpc1R5cGVCYXNlLmpzJyksXG4gICAgYXhpc0RhdGFNYWtlciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvYXhpc0RhdGFNYWtlci5qcycpLFxuICAgIFNlcmllcyA9IHJlcXVpcmUoJy4uL3Nlcmllcy9jb2x1bW5DaGFydFNlcmllcy5qcycpO1xuXG52YXIgQ29sdW1uQ2hhcnQgPSBuZS51dGlsLmRlZmluZUNsYXNzKEF4aXNUeXBlQmFzZSwgLyoqIEBsZW5kcyBDb2x1bW5DaGFydC5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIENvbHVtbiBjaGFydC5cbiAgICAgKiBAY29uc3RydWN0cyBDb2x1bW5DaGFydFxuICAgICAqIEBleHRlbmRzIEF4aXNUeXBlQmFzZVxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gdXNlckRhdGEgY2hhcnQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBjaGFydCB0aGVtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gaW5pdGVkRGF0YSBpbml0aWFsaXplZCBkYXRhIGZyb20gY29tYm8gY2hhcnRcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbih1c2VyRGF0YSwgdGhlbWUsIG9wdGlvbnMsIGluaXRlZERhdGEpIHtcbiAgICAgICAgdmFyIGJhc2VEYXRhID0gaW5pdGVkRGF0YSB8fCB0aGlzLm1ha2VCYXNlRGF0YSh1c2VyRGF0YSwgdGhlbWUsIG9wdGlvbnMsIHtcbiAgICAgICAgICAgICAgICBpc1ZlcnRpY2FsOiB0cnVlLFxuICAgICAgICAgICAgICAgIGhhc0F4ZXM6IHRydWVcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgY29udmVydERhdGEgPSBiYXNlRGF0YS5jb252ZXJ0RGF0YSxcbiAgICAgICAgICAgIGJvdW5kcyA9IGJhc2VEYXRhLmJvdW5kcyxcbiAgICAgICAgICAgIGF4aXNEYXRhO1xuXG4gICAgICAgIHRoaXMuY2xhc3NOYW1lID0gJ25lLWNvbHVtbi1jaGFydCc7XG5cbiAgICAgICAgQXhpc1R5cGVCYXNlLmNhbGwodGhpcywgYm91bmRzLCB0aGVtZSwgb3B0aW9ucywgaW5pdGVkRGF0YSk7XG5cbiAgICAgICAgYXhpc0RhdGEgPSB0aGlzLl9tYWtlQXhlc0RhdGEoY29udmVydERhdGEsIGJvdW5kcywgb3B0aW9ucywgaW5pdGVkRGF0YSk7XG4gICAgICAgIHRoaXMuX2FkZENvbXBvbmVudHMoY29udmVydERhdGEsIGF4aXNEYXRhLCBvcHRpb25zKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBheGVzIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udmVydERhdGEgY29udmVydGVkIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYm91bmRzIGNoYXJ0IGJvdW5kc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gaW5pdGVkRGF0YSBpbml0aWFsaXplZCBkYXRhIGZyb20gY29tYm8gY2hhcnRcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBheGVzIGRhdGFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQXhlc0RhdGE6IGZ1bmN0aW9uKGNvbnZlcnREYXRhLCBib3VuZHMsIG9wdGlvbnMsIGluaXRlZERhdGEpIHtcbiAgICAgICAgdmFyIGF4ZXNEYXRhID0ge307XG4gICAgICAgIGlmIChpbml0ZWREYXRhKSB7XG4gICAgICAgICAgICBheGVzRGF0YSA9IGluaXRlZERhdGEuYXhlcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGF4ZXNEYXRhID0ge1xuICAgICAgICAgICAgICAgIHlBeGlzOiBheGlzRGF0YU1ha2VyLm1ha2VWYWx1ZUF4aXNEYXRhKHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzOiBjb252ZXJ0RGF0YS52YWx1ZXMsXG4gICAgICAgICAgICAgICAgICAgIHNlcmllc0RpbWVuc2lvbjogYm91bmRzLnNlcmllcy5kaW1lbnNpb24sXG4gICAgICAgICAgICAgICAgICAgIHN0YWNrZWQ6IG9wdGlvbnMuc2VyaWVzICYmIG9wdGlvbnMuc2VyaWVzLnN0YWNrZWQgfHwgJycsXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0VHlwZTogb3B0aW9ucy5jaGFydFR5cGUsXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdEZ1bmN0aW9uczogY29udmVydERhdGEuZm9ybWF0RnVuY3Rpb25zLFxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zLnlBeGlzLFxuICAgICAgICAgICAgICAgICAgICBpc1ZlcnRpY2FsOiB0cnVlXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgeEF4aXM6IGF4aXNEYXRhTWFrZXIubWFrZUxhYmVsQXhpc0RhdGEoe1xuICAgICAgICAgICAgICAgICAgICBsYWJlbHM6IGNvbnZlcnREYXRhLmxhYmVsc1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBheGVzRGF0YTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIGNvbXBvbmVudHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udmVydERhdGEgY29udmVydGVkIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYXhlc0RhdGEgYXhlcyBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2FkZENvbXBvbmVudHM6IGZ1bmN0aW9uKGNvbnZlcnREYXRhLCBheGVzRGF0YSwgb3B0aW9ucykge1xuICAgICAgICB0aGlzLmFkZEF4aXNDb21wb25lbnRzKHtcbiAgICAgICAgICAgIGNvbnZlcnREYXRhOiBjb252ZXJ0RGF0YSxcbiAgICAgICAgICAgIGF4ZXM6IGF4ZXNEYXRhLFxuICAgICAgICAgICAgcGxvdERhdGE6ICFuZS51dGlsLmlzVW5kZWZpbmVkKGNvbnZlcnREYXRhLnBsb3REYXRhKSA/IGNvbnZlcnREYXRhLnBsb3REYXRhIDoge1xuICAgICAgICAgICAgICAgIHZUaWNrQ291bnQ6IGF4ZXNEYXRhLnlBeGlzLnZhbGlkVGlja0NvdW50LFxuICAgICAgICAgICAgICAgIGhUaWNrQ291bnQ6IGF4ZXNEYXRhLnhBeGlzLnZhbGlkVGlja0NvdW50XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2hhcnRUeXBlOiBvcHRpb25zLmNoYXJ0VHlwZVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmFkZENvbXBvbmVudCgnc2VyaWVzJywgU2VyaWVzLCB7XG4gICAgICAgICAgICBsaWJUeXBlOiBvcHRpb25zLmxpYlR5cGUsXG4gICAgICAgICAgICBjaGFydFR5cGU6IG9wdGlvbnMuY2hhcnRUeXBlLFxuICAgICAgICAgICAgdG9vbHRpcFByZWZpeDogdGhpcy50b29sdGlwUHJlZml4LFxuICAgICAgICAgICAgaXNQb2ludFBvc2l0aW9uOiB0cnVlLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIHZhbHVlczogY29udmVydERhdGEudmFsdWVzLFxuICAgICAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlczogY29udmVydERhdGEuZm9ybWF0dGVkVmFsdWVzLFxuICAgICAgICAgICAgICAgIHNjYWxlOiBheGVzRGF0YS55QXhpcy5zY2FsZVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb2x1bW5DaGFydDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBDb21ibyBjaGFydC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGNhbGN1bGF0b3IgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2NhbGN1bGF0b3IuanMnKSxcbiAgICBDaGFydEJhc2UgPSByZXF1aXJlKCcuL2NoYXJ0QmFzZS5qcycpLFxuICAgIGF4aXNEYXRhTWFrZXIgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2F4aXNEYXRhTWFrZXIuanMnKSxcbiAgICBkZWZhdWx0VGhlbWUgPSByZXF1aXJlKCcuLi90aGVtZXMvZGVmYXVsdFRoZW1lLmpzJyksXG4gICAgQ29sdW1uQ2hhcnQgPSByZXF1aXJlKCcuL2NvbHVtbkNoYXJ0JyksXG4gICAgTGluZUNoYXJ0ID0gcmVxdWlyZSgnLi9saW5lQ2hhcnQnKTtcblxudmFyIENvbWJvQ2hhcnQgPSBuZS51dGlsLmRlZmluZUNsYXNzKENoYXJ0QmFzZSwgLyoqIEBsZW5kcyBDb21ib0NoYXJ0LnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogQ29tYm8gY2hhcnQuXG4gICAgICogQGNvbnN0cnVjdHMgQ29tYm9DaGFydFxuICAgICAqIEBleHRlbmRzIENoYXJ0QmFzZVxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gdXNlckRhdGEgY2hhcnQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBjaGFydCB0aGVtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbih1c2VyRGF0YSwgdGhlbWUsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIHNlcmllc0NoYXJ0VHlwZXMgPSBuZS51dGlsLmtleXModXNlckRhdGEuc2VyaWVzKS5zb3J0KCksXG4gICAgICAgICAgICB5QXhpc0NoYXJ0VHlwZXMgPSB0aGlzLl9nZXRZQXhpc0NoYXJ0VHlwZXMoc2VyaWVzQ2hhcnRUeXBlcywgb3B0aW9ucy55QXhpcyksXG4gICAgICAgICAgICBjaGFydFR5cGVzID0geUF4aXNDaGFydFR5cGVzLmxlbmd0aCA/IHlBeGlzQ2hhcnRUeXBlcyA6IHNlcmllc0NoYXJ0VHlwZXMsXG4gICAgICAgICAgICBpc09uZVlBeGlzID0gIXlBeGlzQ2hhcnRUeXBlcy5sZW5ndGgsXG4gICAgICAgICAgICBiYXNlRGF0YSA9IHRoaXMubWFrZUJhc2VEYXRhKHVzZXJEYXRhLCB0aGVtZSwgb3B0aW9ucywge1xuICAgICAgICAgICAgICAgIGlzVmVydGljYWw6IHRydWUsXG4gICAgICAgICAgICAgICAgaGFzQXhlczogdHJ1ZSxcbiAgICAgICAgICAgICAgICB5QXhpc0NoYXJ0VHlwZXM6IHlBeGlzQ2hhcnRUeXBlc1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBjb252ZXJ0RGF0YSA9IGJhc2VEYXRhLmNvbnZlcnREYXRhLFxuICAgICAgICAgICAgYm91bmRzID0gYmFzZURhdGEuYm91bmRzLFxuICAgICAgICAgICAgc2VyaWVzRGltZW5zaW9uID0gYm91bmRzLnNlcmllcy5kaW1lbnNpb24sXG4gICAgICAgICAgICBheGVzRGF0YSA9IHt9LFxuICAgICAgICAgICAgYmFzZUF4ZXNEYXRhID0ge30sXG4gICAgICAgICAgICB5QXhpc1BhcmFtcztcblxuICAgICAgICB0aGlzLmNsYXNzTmFtZSA9ICduZS1jb21iby1jaGFydCc7XG5cbiAgICAgICAgeUF4aXNQYXJhbXMgPSB7XG4gICAgICAgICAgICBjb252ZXJ0RGF0YTogY29udmVydERhdGEsXG4gICAgICAgICAgICBzZXJpZXNEaW1lbnNpb246IHNlcmllc0RpbWVuc2lvbixcbiAgICAgICAgICAgIGNoYXJ0VHlwZXM6IGNoYXJ0VHlwZXMsXG4gICAgICAgICAgICBpc09uZVlBeGlzOiBpc09uZVlBeGlzLFxuICAgICAgICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgICAgICB9O1xuXG4gICAgICAgIENoYXJ0QmFzZS5jYWxsKHRoaXMsIGJvdW5kcywgdGhlbWUsIG9wdGlvbnMpO1xuXG4gICAgICAgIGJhc2VBeGVzRGF0YS55QXhpcyA9IHRoaXMuX21ha2VZQXhpc0RhdGEobmUudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgaW5kZXg6IDBcbiAgICAgICAgfSwgeUF4aXNQYXJhbXMpKTtcblxuICAgICAgICBiYXNlQXhlc0RhdGEueEF4aXMgPSBheGlzRGF0YU1ha2VyLm1ha2VMYWJlbEF4aXNEYXRhKHtcbiAgICAgICAgICAgIGxhYmVsczogY29udmVydERhdGEubGFiZWxzXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGF4ZXNEYXRhID0gdGhpcy5fbWFrZUF4ZXNEYXRhKGJhc2VBeGVzRGF0YSwgeUF4aXNQYXJhbXMpO1xuXG4gICAgICAgIHRoaXMuX2luc3RhbGxDaGFydHMoe1xuICAgICAgICAgICAgdXNlckRhdGE6IHVzZXJEYXRhLFxuICAgICAgICAgICAgdGhlbWU6IHRoZW1lLFxuICAgICAgICAgICAgb3B0aW9uczogb3B0aW9ucyxcbiAgICAgICAgICAgIGJhc2VEYXRhOiBiYXNlRGF0YSxcbiAgICAgICAgICAgIGJhc2VBeGVzRGF0YTogYmFzZUF4ZXNEYXRhLFxuICAgICAgICAgICAgYXhlc0RhdGE6IGF4ZXNEYXRhLFxuICAgICAgICAgICAgc2VyaWVzQ2hhcnRUeXBlczogc2VyaWVzQ2hhcnRUeXBlcyxcbiAgICAgICAgICAgIGNoYXJ0VHlwZXM6IGNoYXJ0VHlwZXNcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB5IGF4aXMgY2hhcnQgdHlwZXMuXG4gICAgICogQHBhcmFtIHthcnJheS48c3RyaW5nPn0gY2hhcnRUeXBlcyBjaGFydCB0eXBlc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB5QXhpc09wdGlvbnMgeSBheGlzIG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPHN0cmluZz59IGNoYXJ0IHR5cGVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0WUF4aXNDaGFydFR5cGVzOiBmdW5jdGlvbihjaGFydFR5cGVzLCB5QXhpc09wdGlvbnMpIHtcbiAgICAgICAgdmFyIHJlc3VsdENoYXJ0VHlwZXMgPSBjaGFydFR5cGVzLnNsaWNlKCksXG4gICAgICAgICAgICBpc1JldmVyc2UgPSBmYWxzZSxcbiAgICAgICAgICAgIG9wdGlvbkNoYXJ0VHlwZXM7XG5cbiAgICAgICAgeUF4aXNPcHRpb25zID0geUF4aXNPcHRpb25zID8gW10uY29uY2F0KHlBeGlzT3B0aW9ucykgOiBbXTtcblxuICAgICAgICBpZiAoeUF4aXNPcHRpb25zLmxlbmd0aCA9PT0gMSAmJiAheUF4aXNPcHRpb25zWzBdLmNoYXJ0VHlwZSkge1xuICAgICAgICAgICAgcmVzdWx0Q2hhcnRUeXBlcyA9IFtdO1xuICAgICAgICB9IGVsc2UgaWYgKHlBeGlzT3B0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgICAgIG9wdGlvbkNoYXJ0VHlwZXMgPSBuZS51dGlsLm1hcCh5QXhpc09wdGlvbnMsIGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb24uY2hhcnRUeXBlO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KG9wdGlvbkNoYXJ0VHlwZXMsIGZ1bmN0aW9uKGNoYXJ0VHlwZSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICBpc1JldmVyc2UgPSBpc1JldmVyc2UgfHwgKGNoYXJ0VHlwZSAmJiByZXN1bHRDaGFydFR5cGVzW2luZGV4XSAhPT0gY2hhcnRUeXBlIHx8IGZhbHNlKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAoaXNSZXZlcnNlKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0Q2hhcnRUeXBlcy5yZXZlcnNlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0Q2hhcnRUeXBlcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSB5IGF4aXMgZGF0YS5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuaW5kZXggY2hhcnQgaW5kZXhcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuY29udmVydERhdGEgY29udmVydGVkIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gcGFyYW1zLnNlcmllc0RpbWVuc2lvbiBzZXJpZXMgZGltZW5zaW9uXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBjaGFydFR5cGVzIGNoYXJ0IHR5cGVcbiAgICAgKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gaXNPbmVZQXhpcyB3aGV0aGVyIG9uZSBzZXJpZXMgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gYWRkUGFyYW1zIGFkZCBwYXJhbXNcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSB5IGF4aXMgZGF0YVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VZQXhpc0RhdGE6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgY29udmVydERhdGEgPSBwYXJhbXMuY29udmVydERhdGEsXG4gICAgICAgICAgICBpbmRleCA9IHBhcmFtcy5pbmRleCxcbiAgICAgICAgICAgIGNoYXJ0VHlwZSA9IHBhcmFtcy5jaGFydFR5cGVzW2luZGV4XSxcbiAgICAgICAgICAgIG9wdGlvbnMgPSBwYXJhbXMub3B0aW9ucyxcbiAgICAgICAgICAgIHlBeGlzVmFsdWVzLCB5QXhpc09wdGlvbnMsIHNlcmllc09wdGlvbjtcblxuICAgICAgICBpZiAocGFyYW1zLmlzT25lWUF4aXMpIHtcbiAgICAgICAgICAgIHlBeGlzVmFsdWVzID0gY29udmVydERhdGEuam9pblZhbHVlcztcbiAgICAgICAgICAgIHlBeGlzT3B0aW9ucyA9IFtvcHRpb25zLnlBeGlzXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHlBeGlzVmFsdWVzID0gY29udmVydERhdGEudmFsdWVzW2NoYXJ0VHlwZV07XG4gICAgICAgICAgICB5QXhpc09wdGlvbnMgPSBvcHRpb25zLnlBeGlzIHx8IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgc2VyaWVzT3B0aW9uID0gb3B0aW9ucy5zZXJpZXMgJiYgb3B0aW9ucy5zZXJpZXNbY2hhcnRUeXBlXSB8fCBvcHRpb25zLnNlcmllcztcblxuICAgICAgICByZXR1cm4gYXhpc0RhdGFNYWtlci5tYWtlVmFsdWVBeGlzRGF0YShuZS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICB2YWx1ZXM6IHlBeGlzVmFsdWVzLFxuICAgICAgICAgICAgc3RhY2tlZDogc2VyaWVzT3B0aW9uICYmIHNlcmllc09wdGlvbi5zdGFja2VkIHx8ICcnLFxuICAgICAgICAgICAgb3B0aW9uczogeUF4aXNPcHRpb25zW2luZGV4XSxcbiAgICAgICAgICAgIGNoYXJ0VHlwZTogY2hhcnRUeXBlLFxuICAgICAgICAgICAgc2VyaWVzRGltZW5zaW9uOiBwYXJhbXMuc2VyaWVzRGltZW5zaW9uLFxuICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zOiBjb252ZXJ0RGF0YS5mb3JtYXRGdW5jdGlvbnMsXG4gICAgICAgICAgICBpc1ZlcnRpY2FsOiB0cnVlXG4gICAgICAgIH0sIHBhcmFtcy5hZGRQYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBheGVzIGRhdGEuXG4gICAgICogQHBhcmFtIHt7eUF4aXM6IG9iamVjdCwgeEF4aXM6IG9iamVjdH19IGJhc2VBeGVzRGF0YSBiYXNlIGF4ZXMgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB5QXhpc1BhcmFtcyB5IGF4aXMgcGFyYW1zXG4gICAgICogQHJldHVybnMge29iamVjdH0gYXhlcyBkYXRhXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUF4ZXNEYXRhOiBmdW5jdGlvbihiYXNlQXhlc0RhdGEsIHlBeGlzUGFyYW1zKSB7XG4gICAgICAgIHZhciB5QXhpc0RhdGEgPSBiYXNlQXhlc0RhdGEueUF4aXMsXG4gICAgICAgICAgICBjaGFydFR5cGVzID0geUF4aXNQYXJhbXMuY2hhcnRUeXBlcyxcbiAgICAgICAgICAgIGF4ZXNEYXRhID0ge30sXG4gICAgICAgICAgICB5ckF4aXNEYXRhO1xuICAgICAgICBpZiAoIXlBeGlzUGFyYW1zLmlzT25lWUF4aXMpIHtcbiAgICAgICAgICAgIHlyQXhpc0RhdGEgPSB0aGlzLl9tYWtlWUF4aXNEYXRhKG5lLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICBpbmRleDogMSxcbiAgICAgICAgICAgICAgICBhZGRQYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaXNQb3NpdGlvblJpZ2h0OiB0cnVlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgeUF4aXNQYXJhbXMpKTtcbiAgICAgICAgICAgIGlmICh5QXhpc0RhdGEudGlja0NvdW50IDwgeXJBeGlzRGF0YS50aWNrQ291bnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbmNyZWFzZVlBeGlzU2NhbGVNYXgoeXJBeGlzRGF0YSwgeUF4aXNEYXRhKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoeUF4aXNEYXRhLnRpY2tDb3VudCA+IHlyQXhpc0RhdGEudGlja0NvdW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5jcmVhc2VZQXhpc1NjYWxlTWF4KHlBeGlzRGF0YSwgeXJBeGlzRGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBheGVzRGF0YVtjaGFydFR5cGVzWzBdXSA9IGJhc2VBeGVzRGF0YTtcbiAgICAgICAgYXhlc0RhdGFbY2hhcnRUeXBlc1sxXV0gPSB7XG4gICAgICAgICAgICB5QXhpczogeXJBeGlzRGF0YSB8fCB5QXhpc0RhdGFcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gYXhlc0RhdGE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2Ugb3JkZXIgaW5mbyBhYm91bmQgY2hhcnQgdHlwZS5cbiAgICAgKiBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBjaGFydFR5cGVzIGNoYXJ0IHR5cGVzXG4gICAgICogQHJldHVybnMge29iamVjdH0gY2hhcnQgb3JkZXIgaW5mb1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VDaGFydFR5cGVPcmRlckluZm86IGZ1bmN0aW9uKGNoYXJ0VHlwZXMpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgICAgICBuZS51dGlsLmZvckVhY2hBcnJheShjaGFydFR5cGVzLCBmdW5jdGlvbihjaGFydFR5cGUsIGluZGV4KSB7XG4gICAgICAgICAgICByZXN1bHRbY2hhcnRUeXBlXSA9IGluZGV4O1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBvcHRpb25zIG1hcFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjaGFydFR5cGVzIGNoYXJ0IHR5cGVzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcmRlckluZm8gY2hhcnQgb3JkZXJcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBvcHRpb25zIG1hcFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VPcHRpb25zTWFwOiBmdW5jdGlvbihjaGFydFR5cGVzLCBvcHRpb25zLCBvcmRlckluZm8pIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgICAgICBuZS51dGlsLmZvckVhY2hBcnJheShjaGFydFR5cGVzLCBmdW5jdGlvbihjaGFydFR5cGUpIHtcbiAgICAgICAgICAgIHZhciBjaGFydE9wdGlvbnMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9wdGlvbnMpKSxcbiAgICAgICAgICAgICAgICBpbmRleCA9IG9yZGVySW5mb1tjaGFydFR5cGVdO1xuXG4gICAgICAgICAgICBpZiAoY2hhcnRPcHRpb25zLnlBeGlzICYmIGNoYXJ0T3B0aW9ucy55QXhpc1tpbmRleF0pIHtcbiAgICAgICAgICAgICAgICBjaGFydE9wdGlvbnMueUF4aXMgPSBjaGFydE9wdGlvbnMueUF4aXNbaW5kZXhdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoY2hhcnRPcHRpb25zLnNlcmllcyAmJiBjaGFydE9wdGlvbnMuc2VyaWVzW2NoYXJ0VHlwZV0pIHtcbiAgICAgICAgICAgICAgICBjaGFydE9wdGlvbnMuc2VyaWVzID0gY2hhcnRPcHRpb25zLnNlcmllc1tjaGFydFR5cGVdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoY2hhcnRPcHRpb25zLnRvb2x0aXAgJiYgY2hhcnRPcHRpb25zLnRvb2x0aXBbY2hhcnRUeXBlXSkge1xuICAgICAgICAgICAgICAgIGNoYXJ0T3B0aW9ucy50b29sdGlwID0gY2hhcnRPcHRpb25zLnRvb2x0aXBbY2hhcnRUeXBlXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNoYXJ0T3B0aW9ucy5jaGFydFR5cGUgPSBjaGFydFR5cGU7XG4gICAgICAgICAgICByZXN1bHRbY2hhcnRUeXBlXSA9IGNoYXJ0T3B0aW9ucztcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgdGhlbWUgbWFwXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGNoYXJ0VHlwZXMgY2hhcnQgdHlwZXNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgY2hhcnQgdGhlbWVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gbGVnZW5kTGFiZWxzIGxlZ2VuZCBsYWJlbHNcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSB0aGVtZSBtYXBcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlVGhlbWVNYXA6IGZ1bmN0aW9uKGNoYXJ0VHlwZXMsIHRoZW1lLCBsZWdlbmRMYWJlbHMpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHt9LFxuICAgICAgICAgICAgY29sb3JDb3VudCA9IDA7XG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KGNoYXJ0VHlwZXMsIGZ1bmN0aW9uKGNoYXJ0VHlwZSkge1xuICAgICAgICAgICAgdmFyIGNoYXJ0VGhlbWUgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoZW1lKSksXG4gICAgICAgICAgICAgICAgcmVtb3ZlZENvbG9ycztcblxuICAgICAgICAgICAgaWYgKGNoYXJ0VGhlbWUueUF4aXNbY2hhcnRUeXBlXSkge1xuICAgICAgICAgICAgICAgIGNoYXJ0VGhlbWUueUF4aXMgPSBjaGFydFRoZW1lLnlBeGlzW2NoYXJ0VHlwZV07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFjaGFydFRoZW1lLnlBeGlzLnRpdGxlKSB7XG4gICAgICAgICAgICAgICAgY2hhcnRUaGVtZS55QXhpcyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZGVmYXVsdFRoZW1lLnlBeGlzKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChjaGFydFRoZW1lLnNlcmllc1tjaGFydFR5cGVdKSB7XG4gICAgICAgICAgICAgICAgY2hhcnRUaGVtZS5zZXJpZXMgPSBjaGFydFRoZW1lLnNlcmllc1tjaGFydFR5cGVdO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghY2hhcnRUaGVtZS5zZXJpZXMuY29sb3JzKSB7XG4gICAgICAgICAgICAgICAgY2hhcnRUaGVtZS5zZXJpZXMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGRlZmF1bHRUaGVtZS5zZXJpZXMpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVtb3ZlZENvbG9ycyA9IGNoYXJ0VGhlbWUuc2VyaWVzLmNvbG9ycy5zcGxpY2UoMCwgY29sb3JDb3VudCk7XG4gICAgICAgICAgICAgICAgY2hhcnRUaGVtZS5zZXJpZXMuY29sb3JzID0gY2hhcnRUaGVtZS5zZXJpZXMuY29sb3JzLmNvbmNhdChyZW1vdmVkQ29sb3JzKTtcbiAgICAgICAgICAgICAgICBjb2xvckNvdW50ICs9IGxlZ2VuZExhYmVsc1tjaGFydFR5cGVdLmxlbmd0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdFtjaGFydFR5cGVdID0gY2hhcnRUaGVtZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEluY3JlYXNlIHkgYXhpcyBzY2FsZSBtYXguXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGZyb21EYXRhIGZyb20gdGljayBpbmZvXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRvRGF0YSB0byB0aWNrIGluZm9cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pbmNyZWFzZVlBeGlzU2NhbGVNYXg6IGZ1bmN0aW9uKGZyb21EYXRhLCB0b0RhdGEpIHtcbiAgICAgICAgdmFyIGRpZmYgPSBmcm9tRGF0YS50aWNrQ291bnQgLSB0b0RhdGEudGlja0NvdW50O1xuICAgICAgICB0b0RhdGEuc2NhbGUubWF4ICs9IHRvRGF0YS5zdGVwICogZGlmZjtcbiAgICAgICAgdG9EYXRhLmxhYmVscyA9IGNhbGN1bGF0b3IubWFrZUxhYmVsc0Zyb21TY2FsZSh0b0RhdGEuc2NhbGUsIHRvRGF0YS5zdGVwKTtcbiAgICAgICAgdG9EYXRhLnRpY2tDb3VudCA9IGZyb21EYXRhLnRpY2tDb3VudDtcbiAgICAgICAgdG9EYXRhLnZhbGlkVGlja0NvdW50ID0gZnJvbURhdGEudGlja0NvdW50O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnN0YWxsIGNoYXJ0cy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudXNlckRhdGEgdXNlciBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmJhc2VEYXRhIGNoYXJ0IGJhc2UgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBjaGFydCB0aGVtZVxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5vcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiAgICAgIEBwYXJhbSB7e3lBeGlzOiBvYmplY3QsIHhBeGlzOiBvYmplY3R9fSBwYXJhbXMuYmFzZUF4ZXNEYXRhIGJhc2UgYXhlcyBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmF4ZXNEYXRhIGF4ZXMgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48c3RyaW5nPn0gcGFyYW1zLnNlcmllc0NoYXJ0VHlwZXMgc2VyaWVzIGNoYXJ0IHR5cGVzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBwYXJhbXMuY2hhcnRUeXBlcyBjaGFydCB0eXBlc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2luc3RhbGxDaGFydHM6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgY2hhcnRDbGFzc2VzID0ge1xuICAgICAgICAgICAgICAgIGNvbHVtbjogQ29sdW1uQ2hhcnQsXG4gICAgICAgICAgICAgICAgbGluZTogTGluZUNoYXJ0XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYmFzZURhdGEgPSBwYXJhbXMuYmFzZURhdGEsXG4gICAgICAgICAgICBjb252ZXJ0RGF0YSA9IGJhc2VEYXRhLmNvbnZlcnREYXRhLFxuICAgICAgICAgICAgZm9ybWF0dGVkVmFsdWVzID0gY29udmVydERhdGEuZm9ybWF0dGVkVmFsdWVzLFxuICAgICAgICAgICAgYmFzZUF4ZXNEYXRhID0gcGFyYW1zLmJhc2VBeGVzRGF0YSxcbiAgICAgICAgICAgIGNoYXJ0VHlwZXMgPSBwYXJhbXMuY2hhcnRUeXBlcyxcbiAgICAgICAgICAgIHNlcmllc0NoYXJ0VHlwZXMgPSBwYXJhbXMuc2VyaWVzQ2hhcnRUeXBlcyxcbiAgICAgICAgICAgIG9yZGVySW5mbyA9IHRoaXMuX21ha2VDaGFydFR5cGVPcmRlckluZm8oY2hhcnRUeXBlcyksXG4gICAgICAgICAgICByZW1ha2VPcHRpb25zID0gdGhpcy5fbWFrZU9wdGlvbnNNYXAoY2hhcnRUeXBlcywgcGFyYW1zLm9wdGlvbnMsIG9yZGVySW5mbyksXG4gICAgICAgICAgICByZW1ha2VUaGVtZSA9IHRoaXMuX21ha2VUaGVtZU1hcChzZXJpZXNDaGFydFR5cGVzLCBwYXJhbXMudGhlbWUsIGNvbnZlcnREYXRhLmxlZ2VuZExhYmVscyksXG4gICAgICAgICAgICBwbG90RGF0YSA9IHtcbiAgICAgICAgICAgICAgICB2VGlja0NvdW50OiBiYXNlQXhlc0RhdGEueUF4aXMudmFsaWRUaWNrQ291bnQsXG4gICAgICAgICAgICAgICAgaFRpY2tDb3VudDogYmFzZUF4ZXNEYXRhLnhBeGlzLnZhbGlkVGlja0NvdW50XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgam9pbkxlZ2VuZExhYmVscyA9IGNvbnZlcnREYXRhLmpvaW5MZWdlbmRMYWJlbHM7XG5cbiAgICAgICAgdGhpcy5jaGFydHMgPSBuZS51dGlsLm1hcChzZXJpZXNDaGFydFR5cGVzLCBmdW5jdGlvbihjaGFydFR5cGUpIHtcbiAgICAgICAgICAgIHZhciBsZWdlbmRMYWJlbHMgPSBjb252ZXJ0RGF0YS5sZWdlbmRMYWJlbHNbY2hhcnRUeXBlXSxcbiAgICAgICAgICAgICAgICBheGVzID0gcGFyYW1zLmF4ZXNEYXRhW2NoYXJ0VHlwZV0sXG4gICAgICAgICAgICAgICAgc2VuZE9wdGlvbnMgPSByZW1ha2VPcHRpb25zW2NoYXJ0VHlwZV0sXG4gICAgICAgICAgICAgICAgc2VuZFRoZW1lID0gcmVtYWtlVGhlbWVbY2hhcnRUeXBlXSxcbiAgICAgICAgICAgICAgICBzZW5kQm91bmRzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShiYXNlRGF0YS5ib3VuZHMpKSxcbiAgICAgICAgICAgICAgICBjaGFydDtcblxuICAgICAgICAgICAgaWYgKGF4ZXMgJiYgYXhlcy55QXhpcy5pc1Bvc2l0aW9uUmlnaHQpIHtcbiAgICAgICAgICAgICAgICBzZW5kQm91bmRzLnlBeGlzID0gc2VuZEJvdW5kcy55ckF4aXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjaGFydCA9IG5ldyBjaGFydENsYXNzZXNbY2hhcnRUeXBlXShwYXJhbXMudXNlckRhdGEsIHNlbmRUaGVtZSwgc2VuZE9wdGlvbnMsIHtcbiAgICAgICAgICAgICAgICBjb252ZXJ0RGF0YToge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZXM6IGNvbnZlcnREYXRhLnZhbHVlc1tjaGFydFR5cGVdLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbHM6IGNvbnZlcnREYXRhLmxhYmVscyxcbiAgICAgICAgICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zOiBjb252ZXJ0RGF0YS5mb3JtYXRGdW5jdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlczogZm9ybWF0dGVkVmFsdWVzW2NoYXJ0VHlwZV0sXG4gICAgICAgICAgICAgICAgICAgIGxlZ2VuZExhYmVsczogbGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgICAgICAgICBqb2luTGVnZW5kTGFiZWxzOiBqb2luTGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgICAgICAgICBwbG90RGF0YTogcGxvdERhdGFcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGJvdW5kczogc2VuZEJvdW5kcyxcbiAgICAgICAgICAgICAgICBheGVzOiBheGVzLFxuICAgICAgICAgICAgICAgIHByZWZpeDogY2hhcnRUeXBlICsgJy0nXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHBsb3REYXRhID0gbnVsbDtcbiAgICAgICAgICAgIGpvaW5MZWdlbmRMYWJlbHMgPSBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIGNoYXJ0O1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGNvbWJvIGNoYXJ0LlxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gY29tYm8gY2hhcnQgZWxlbWVudFxuICAgICAqL1xuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBlbCA9IENoYXJ0QmFzZS5wcm90b3R5cGUucmVuZGVyLmNhbGwodGhpcyk7XG4gICAgICAgIHZhciBwYXBlcjtcbiAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkodGhpcy5jaGFydHMsIGZ1bmN0aW9uKGNoYXJ0KSB7XG4gICAgICAgICAgICBjaGFydC5yZW5kZXIoZWwsIHBhcGVyKTtcbiAgICAgICAgICAgIGlmICghcGFwZXIpIHtcbiAgICAgICAgICAgICAgICBwYXBlciA9IGNoYXJ0LmdldFBhcGVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZWw7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29tYm9DaGFydDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBMaW5lIGNoYXJ0XG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBBeGlzVHlwZUJhc2UgPSByZXF1aXJlKCcuL2F4aXNUeXBlQmFzZS5qcycpLFxuICAgIGNhbGN1bGF0b3IgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2NhbGN1bGF0b3IuanMnKSxcbiAgICBheGlzRGF0YU1ha2VyID0gcmVxdWlyZSgnLi4vaGVscGVycy9heGlzRGF0YU1ha2VyLmpzJyksXG4gICAgU2VyaWVzID0gcmVxdWlyZSgnLi4vc2VyaWVzL2xpbmVDaGFydFNlcmllcy5qcycpO1xuXG52YXIgTGluZUNoYXJ0ID0gbmUudXRpbC5kZWZpbmVDbGFzcyhBeGlzVHlwZUJhc2UsIC8qKiBAbGVuZHMgTGluZUNoYXJ0LnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogTGluZSBjaGFydC5cbiAgICAgKiBAY29uc3RydWN0cyBMaW5lQ2hhcnRcbiAgICAgKiBAZXh0ZW5kcyBBeGlzVHlwZUJhc2VcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheT59IHVzZXJEYXRhIGNoYXJ0IGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgY2hhcnQgdGhlbWVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGluaXRlZERhdGEgaW5pdGlhbGl6ZWQgZGF0YSBmcm9tIGNvbWJvIGNoYXJ0XG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24odXNlckRhdGEsIHRoZW1lLCBvcHRpb25zLCBpbml0ZWREYXRhKSB7XG4gICAgICAgIHZhciBiYXNlRGF0YSA9IGluaXRlZERhdGEgfHwgdGhpcy5tYWtlQmFzZURhdGEodXNlckRhdGEsIHRoZW1lLCBvcHRpb25zLCB7XG4gICAgICAgICAgICAgICAgaXNWZXJ0aWNhbDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBoYXNBeGVzOiB0cnVlXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGNvbnZlcnREYXRhID0gYmFzZURhdGEuY29udmVydERhdGEsXG4gICAgICAgICAgICBib3VuZHMgPSBiYXNlRGF0YS5ib3VuZHMsXG4gICAgICAgICAgICBheGlzRGF0YTtcblxuICAgICAgICB0aGlzLmNsYXNzTmFtZSA9ICduZS1saW5lLWNoYXJ0JztcblxuICAgICAgICBBeGlzVHlwZUJhc2UuY2FsbCh0aGlzLCBib3VuZHMsIHRoZW1lLCBvcHRpb25zLCBpbml0ZWREYXRhKTtcblxuICAgICAgICBheGlzRGF0YSA9IHRoaXMuX21ha2VBeGVzRGF0YShjb252ZXJ0RGF0YSwgYm91bmRzLCBvcHRpb25zLCBpbml0ZWREYXRhKTtcbiAgICAgICAgdGhpcy5fYWRkQ29tcG9uZW50cyhjb252ZXJ0RGF0YSwgYXhpc0RhdGEsIG9wdGlvbnMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGF4ZXMgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb252ZXJ0RGF0YSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBib3VuZHMgY2hhcnQgYm91bmRzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBpbml0ZWREYXRhIGluaXRpYWxpemVkIGRhdGEgZnJvbSBjb21ibyBjaGFydFxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IGF4ZXMgZGF0YVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VBeGVzRGF0YTogZnVuY3Rpb24oY29udmVydERhdGEsIGJvdW5kcywgb3B0aW9ucywgaW5pdGVkRGF0YSkge1xuICAgICAgICB2YXIgYXhlc0RhdGEgPSB7fTtcbiAgICAgICAgaWYgKGluaXRlZERhdGEpIHtcbiAgICAgICAgICAgIGF4ZXNEYXRhID0gaW5pdGVkRGF0YS5heGVzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXhlc0RhdGEgPSB7XG4gICAgICAgICAgICAgICAgeUF4aXM6IGF4aXNEYXRhTWFrZXIubWFrZVZhbHVlQXhpc0RhdGEoe1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZXM6IGNvbnZlcnREYXRhLnZhbHVlcyxcbiAgICAgICAgICAgICAgICAgICAgc2VyaWVzRGltZW5zaW9uOiBib3VuZHMuc2VyaWVzLmRpbWVuc2lvbixcbiAgICAgICAgICAgICAgICAgICAgc3RhY2tlZDogb3B0aW9ucy5zZXJpZXMgJiYgb3B0aW9ucy5zZXJpZXMuc3RhY2tlZCB8fCAnJyxcbiAgICAgICAgICAgICAgICAgICAgY2hhcnRUeXBlOiBvcHRpb25zLmNoYXJ0VHlwZSxcbiAgICAgICAgICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zOiBjb252ZXJ0RGF0YS5mb3JtYXRGdW5jdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IG9wdGlvbnMueUF4aXMsXG4gICAgICAgICAgICAgICAgICAgIGlzVmVydGljYWw6IHRydWVcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICB4QXhpczogYXhpc0RhdGFNYWtlci5tYWtlTGFiZWxBeGlzRGF0YSh7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsczogY29udmVydERhdGEubGFiZWxzXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGF4ZXNEYXRhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgY29tcG9uZW50c1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb252ZXJ0RGF0YSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBheGVzRGF0YSBheGVzIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYWRkQ29tcG9uZW50czogZnVuY3Rpb24oY29udmVydERhdGEsIGF4ZXNEYXRhLCBvcHRpb25zKSB7XG4gICAgICAgIHRoaXMuYWRkQXhpc0NvbXBvbmVudHMoe1xuICAgICAgICAgICAgY29udmVydERhdGE6IGNvbnZlcnREYXRhLFxuICAgICAgICAgICAgYXhlczogYXhlc0RhdGEsXG4gICAgICAgICAgICBwbG90RGF0YTogIW5lLnV0aWwuaXNVbmRlZmluZWQoY29udmVydERhdGEucGxvdERhdGEpID8gY29udmVydERhdGEucGxvdERhdGEgOiB7XG4gICAgICAgICAgICAgICAgdlRpY2tDb3VudDogYXhlc0RhdGEueUF4aXMudmFsaWRUaWNrQ291bnQsXG4gICAgICAgICAgICAgICAgaFRpY2tDb3VudDogYXhlc0RhdGEueEF4aXMudmFsaWRUaWNrQ291bnRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjaGFydFR5cGU6IG9wdGlvbnMuY2hhcnRUeXBlXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KCdzZXJpZXMnLCBTZXJpZXMsIHtcbiAgICAgICAgICAgIGxpYlR5cGU6IG9wdGlvbnMubGliVHlwZSxcbiAgICAgICAgICAgIGNoYXJ0VHlwZTogb3B0aW9ucy5jaGFydFR5cGUsXG4gICAgICAgICAgICB0b29sdGlwUHJlZml4OiB0aGlzLnRvb2x0aXBQcmVmaXgsXG4gICAgICAgICAgICBpc1BvaW50UG9zaXRpb246IHRydWUsXG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgdmFsdWVzOiBjYWxjdWxhdG9yLmFycmF5UGl2b3QoY29udmVydERhdGEudmFsdWVzKSxcbiAgICAgICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXM6IGNhbGN1bGF0b3IuYXJyYXlQaXZvdChjb252ZXJ0RGF0YS5mb3JtYXR0ZWRWYWx1ZXMpLFxuICAgICAgICAgICAgICAgIHNjYWxlOiBheGVzRGF0YS55QXhpcy5zY2FsZVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBMaW5lQ2hhcnQ7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgUGllIGNoYXJ0LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ2hhcnRCYXNlID0gcmVxdWlyZSgnLi9jaGFydEJhc2UuanMnKSxcbiAgICBMZWdlbmQgPSByZXF1aXJlKCcuLi9sZWdlbmRzL2xlZ2VuZC5qcycpLFxuICAgIFRvb2x0aXAgPSByZXF1aXJlKCcuLi90b29sdGlwcy90b29sdGlwLmpzJyksXG4gICAgU2VyaWVzID0gcmVxdWlyZSgnLi4vc2VyaWVzL3BpZUNoYXJ0U2VyaWVzLmpzJyk7XG5cbnZhciBQaWVDaGFydCA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoQ2hhcnRCYXNlLCAvKiogQGxlbmRzIFBpZUNoYXJ0LnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogQ29sdW1uIGNoYXJ0LlxuICAgICAqIEBjb25zdHJ1Y3RzIFBpZUNoYXJ0XG4gICAgICogQGV4dGVuZHMgQ2hhcnRCYXNlXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXk+fSB1c2VyRGF0YSBjaGFydCBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIGNoYXJ0IHRoZW1lXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBpbml0ZWREYXRhIGluaXRpYWxpemVkIGRhdGEgZnJvbSBjb21ibyBjaGFydFxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKHVzZXJEYXRhLCB0aGVtZSwgb3B0aW9ucywgaW5pdGVkRGF0YSkge1xuICAgICAgICB2YXIgYmFzZURhdGEgPSBpbml0ZWREYXRhIHx8IHRoaXMubWFrZUJhc2VEYXRhKHVzZXJEYXRhLCB0aGVtZSwgb3B0aW9ucyksXG4gICAgICAgICAgICBjb252ZXJ0RGF0YSA9IGJhc2VEYXRhLmNvbnZlcnREYXRhLFxuICAgICAgICAgICAgYm91bmRzID0gYmFzZURhdGEuYm91bmRzO1xuXG4gICAgICAgIHRoaXMuY2xhc3NOYW1lID0gJ25lLXBpZS1jaGFydCc7XG5cbiAgICAgICAgb3B0aW9ucy50b29sdGlwID0gb3B0aW9ucy50b29sdGlwIHx8IHt9O1xuXG4gICAgICAgIGlmICghb3B0aW9ucy50b29sdGlwLnBvc2l0aW9uKSB7XG4gICAgICAgICAgICBvcHRpb25zLnRvb2x0aXAucG9zaXRpb24gPSAnY2VudGVyIG1pZGRsZSc7XG4gICAgICAgIH1cblxuICAgICAgICBDaGFydEJhc2UuY2FsbCh0aGlzLCBib3VuZHMsIHRoZW1lLCBvcHRpb25zLCBpbml0ZWREYXRhKTtcblxuICAgICAgICB0aGlzLl9hZGRDb21wb25lbnRzKGNvbnZlcnREYXRhLCB0aGVtZS5jaGFydC5iYWNrZ3JvdW5kLCBvcHRpb25zKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIGNvbXBvbmVudHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udmVydERhdGEgY29udmVydGVkIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY2hhcnRCYWNrZ3JvdW5kIGNoYXJ0IOOFoGFja2dyb3VuZFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hZGRDb21wb25lbnRzOiBmdW5jdGlvbihjb252ZXJ0RGF0YSwgY2hhcnRCYWNrZ3JvdW5kLCBvcHRpb25zKSB7XG4gICAgICAgIGlmIChjb252ZXJ0RGF0YS5qb2luTGVnZW5kTGFiZWxzKSB7XG4gICAgICAgICAgICB0aGlzLmFkZENvbXBvbmVudCgnbGVnZW5kJywgTGVnZW5kLCB7XG4gICAgICAgICAgICAgICAgam9pbkxlZ2VuZExhYmVsczogY29udmVydERhdGEuam9pbkxlZ2VuZExhYmVscyxcbiAgICAgICAgICAgICAgICBsZWdlbmRMYWJlbHM6IGNvbnZlcnREYXRhLmxlZ2VuZExhYmVscyxcbiAgICAgICAgICAgICAgICBjaGFydFR5cGU6IG9wdGlvbnMuY2hhcnRUeXBlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KCd0b29sdGlwJywgVG9vbHRpcCwge1xuICAgICAgICAgICAgdmFsdWVzOiBjb252ZXJ0RGF0YS5mb3JtYXR0ZWRWYWx1ZXMsXG4gICAgICAgICAgICBsYWJlbHM6IGNvbnZlcnREYXRhLmxhYmVscyxcbiAgICAgICAgICAgIGxlZ2VuZExhYmVsczogY29udmVydERhdGEubGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgcHJlZml4OiB0aGlzLnRvb2x0aXBQcmVmaXhcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5hZGRDb21wb25lbnQoJ3NlcmllcycsIFNlcmllcywge1xuICAgICAgICAgICAgbGliVHlwZTogb3B0aW9ucy5saWJUeXBlLFxuICAgICAgICAgICAgY2hhcnRUeXBlOiBvcHRpb25zLmNoYXJ0VHlwZSxcbiAgICAgICAgICAgIHRvb2x0aXBQcmVmaXg6IHRoaXMudG9vbHRpcFByZWZpeCxcbiAgICAgICAgICAgIGlzUG9pbnRQb3NpdGlvbjogdHJ1ZSxcbiAgICAgICAgICAgIGNoYXJ0QmFja2dyb3VuZDogY2hhcnRCYWNrZ3JvdW5kLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIHZhbHVlczogY29udmVydERhdGEudmFsdWVzLFxuICAgICAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlczogY29udmVydERhdGEuZm9ybWF0dGVkVmFsdWVzXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBpZUNoYXJ0O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIG5lLnV0aWzsl5AgcmFuZ2XqsIAg7LaU6rCA65CY6riwIOyghOq5jOyngCDsnoTsi5zroZwg7IKs7JqpXG4gKiBAcGFyYW0ge251bWJlcn0gc3RhcnQgc3RhcnRcbiAqIEBwYXJhbSB7bnVtYmVyfSBzdG9wIHN0b3BcbiAqIEBwYXJhbSB7bnVtYmVyfSBzdGVwIHN0ZXBcbiAqIEByZXR1cm5zIHthcnJheS48bnVtYmVyPn0gcmVzdWx0IGFycmF5XG4gKi9cbnZhciByYW5nZSA9IGZ1bmN0aW9uKHN0YXJ0LCBzdG9wLCBzdGVwKSB7XG4gICAgdmFyIGFyciA9IFtdLFxuICAgICAgICBmbGFnO1xuXG4gICAgaWYgKG5lLnV0aWwuaXNVbmRlZmluZWQoc3RvcCkpIHtcbiAgICAgICAgc3RvcCA9IHN0YXJ0IHx8IDA7XG4gICAgICAgIHN0YXJ0ID0gMDtcbiAgICB9XG5cbiAgICBzdGVwID0gc3RlcCB8fCAxO1xuICAgIGZsYWcgPSBzdGVwIDwgMCA/IC0xIDogMTtcbiAgICBzdG9wICo9IGZsYWc7XG5cbiAgICB3aGlsZSAoc3RhcnQgKiBmbGFnIDwgc3RvcCkge1xuICAgICAgICBhcnIucHVzaChzdGFydCk7XG4gICAgICAgIHN0YXJ0ICs9IHN0ZXA7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFycjtcbn07XG5cbi8qKlxuICogKiBuZS51dGls7JeQIHBsdWNr7J20IOy2lOqwgOuQmOq4sCDsoITquYzsp4Ag7J6E7Iuc66GcIOyCrOyaqVxuICogQHBhcmFtIHthcnJheX0gYXJyIGFycmF5XG4gKiBAcGFyYW0ge3N0cmluZ30gcHJvcGVydHkgcHJvcGVydHlcbiAqIEByZXR1cm5zIHthcnJheX0gcmVzdWx0IGFycmF5XG4gKi9cbnZhciBwbHVjayA9IGZ1bmN0aW9uKGFyciwgcHJvcGVydHkpIHtcbiAgICB2YXIgcmVzdWx0ID0gbmUudXRpbC5tYXAoYXJyLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIHJldHVybiBpdGVtW3Byb3BlcnR5XTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiAqIG5lLnV0aWzsl5Agemlw7J20IOy2lOqwgOuQmOq4sCDsoITquYzsp4Ag7J6E7Iuc66GcIOyCrOyaqVxuICogQHBhcmFtcyB7Li4uYXJyYXl9IGFycmF5XG4gKiBAcmV0dXJucyB7YXJyYXl9IHJlc3VsdCBhcnJheVxuICovXG52YXIgemlwID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFycjIgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpLFxuICAgICAgICByZXN1bHQgPSBbXTtcblxuICAgIG5lLnV0aWwuZm9yRWFjaChhcnIyLCBmdW5jdGlvbihhcnIpIHtcbiAgICAgICAgbmUudXRpbC5mb3JFYWNoKGFyciwgZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgICBpZiAoIXJlc3VsdFtpbmRleF0pIHtcbiAgICAgICAgICAgICAgICByZXN1bHRbaW5kZXhdID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXN1bHRbaW5kZXhdLnB1c2godmFsdWUpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIFBpY2sgbWluaW11bSB2YWx1ZSBmcm9tIHZhbHVlIGFycmF5LlxuICogQHBhcmFtIHthcnJheX0gYXJyIHZhbHVlIGFycmF5XG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjb25kaXRpb24gY29uZGl0aW9uIGZ1bmN0aW9uXG4gKiBAcGFyYW0ge29iamVjdH0gY29udGV4dCB0YXJnZXQgY29udGV4dFxuICogQHJldHVybnMgeyp9IG1pbmltdW0gdmFsdWVcbiAqL1xudmFyIG1pbiA9IGZ1bmN0aW9uKGFyciwgY29uZGl0aW9uLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdCwgbWluVmFsdWUsIHJlc3Q7XG4gICAgaWYgKCFjb25kaXRpb24pIHtcbiAgICAgICAgY29uZGl0aW9uID0gZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgIH07XG4gICAgfVxuICAgIHJlc3VsdCA9IGFyclswXTtcbiAgICBtaW5WYWx1ZSA9IGNvbmRpdGlvbi5jYWxsKGNvbnRleHQsIHJlc3VsdCk7XG4gICAgcmVzdCA9IGFyci5zbGljZSgxKTtcbiAgICBuZS51dGlsLmZvckVhY2hBcnJheShyZXN0LCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIHZhciBjb21wYXJlVmFsdWUgPSBjb25kaXRpb24uY2FsbChjb250ZXh0LCBpdGVtKTtcbiAgICAgICAgaWYgKGNvbXBhcmVWYWx1ZSA8IG1pblZhbHVlKSB7XG4gICAgICAgICAgICBtaW5WYWx1ZSA9IGNvbXBhcmVWYWx1ZTtcbiAgICAgICAgICAgIHJlc3VsdCA9IGl0ZW07XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBQaWNrIG1heGltdW0gdmFsdWUgZnJvbSB2YWx1ZSBhcnJheS5cbiAqIEBwYXJhbSB7YXJyYXl9IGFyciB2YWx1ZSBhcnJheVxuICogQHBhcmFtIHtmdW5jdGlvbn0gY29uZGl0aW9uIGNvbmRpdGlvbiBmdW5jdGlvblxuICogQHBhcmFtIHtvYmplY3R9IGNvbnRleHQgdGFyZ2V0IGNvbnRleHRcbiAqIEByZXR1cm5zIHsqfSBtYXhpbXVtIHZhbHVlXG4gKi9cbnZhciBtYXggPSBmdW5jdGlvbihhcnIsIGNvbmRpdGlvbiwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHQsIG1heFZhbHVlLCByZXN0O1xuICAgIGlmICghY29uZGl0aW9uKSB7XG4gICAgICAgIGNvbmRpdGlvbiA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICB9O1xuICAgIH1cbiAgICByZXN1bHQgPSBhcnJbMF07XG4gICAgbWF4VmFsdWUgPSBjb25kaXRpb24uY2FsbChjb250ZXh0LCByZXN1bHQpO1xuICAgIHJlc3QgPSBhcnIuc2xpY2UoMSk7XG4gICAgbmUudXRpbC5mb3JFYWNoQXJyYXkocmVzdCwgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICB2YXIgY29tcGFyZVZhbHVlID0gY29uZGl0aW9uLmNhbGwoY29udGV4dCwgaXRlbSk7XG4gICAgICAgIGlmIChjb21wYXJlVmFsdWUgPiBtYXhWYWx1ZSkge1xuICAgICAgICAgICAgbWF4VmFsdWUgPSBjb21wYXJlVmFsdWU7XG4gICAgICAgICAgICByZXN1bHQgPSBpdGVtO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogV2hldGhlciBvbmUgb2YgdGhlbSBpcyB0cnVlIG9yIG5vdC5cbiAqIEBwYXJhbSB7YXJyYXl9IGFyciB0YXJnZXQgYXJyYXlcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNvbmRpdGlvbiBjb25kaXRpb24gZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtib29sZWFufSByZXN1bHQgYm9vbGVhblxuICovXG52YXIgYW55ID0gZnVuY3Rpb24oYXJyLCBjb25kaXRpb24pIHtcbiAgICB2YXIgcmVzdWx0ID0gZmFsc2U7XG4gICAgbmUudXRpbC5mb3JFYWNoQXJyYXkoYXJyLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIGlmIChjb25kaXRpb24oaXRlbSkpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBHZXQgYWZ0ZXIgcG9pbnQgbGVuZ3RoLlxuICogQHBhcmFtIHtzdHJpbmcgfCBudW1iZXJ9IHZhbHVlIHRhcmdldCB2YWx1ZVxuICogQHJldHVybnMge251bWJlcn0gcmVzdWx0IGxlbmd0aFxuICovXG52YXIgbGVuZ3RoQWZ0ZXJQb2ludCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgdmFyIHZhbHVlQXJyID0gKHZhbHVlICsgJycpLnNwbGl0KCcuJyk7XG4gICAgcmV0dXJuIHZhbHVlQXJyLmxlbmd0aCA9PT0gMiA/IHZhbHVlQXJyWzFdLmxlbmd0aCA6IDA7XG59O1xuXG4vKipcbiAqIEZpbmQgbXVsdGlwbGUgbnVtLlxuICogQHBhcmFtIHsuLi5hcnJheX0gdGFyZ2V0IHZhbHVlc1xuICogQHJldHVybnMge251bWJlcn0gbXVsdGlwbGUgbnVtXG4gKi9cbnZhciBmaW5kTXVsdGlwbGVOdW0gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKSxcbiAgICAgICAgdW5kZXJQb2ludExlbnMgPSBuZS51dGlsLm1hcChhcmdzLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwubGVuZ3RoQWZ0ZXJQb2ludCh2YWx1ZSk7XG4gICAgICAgIH0pLFxuICAgICAgICB1bmRlclBvaW50TGVuID0gbmUudXRpbC5tYXgodW5kZXJQb2ludExlbnMpLFxuICAgICAgICBtdWx0aXBsZU51bSA9IE1hdGgucG93KDEwLCB1bmRlclBvaW50TGVuKTtcbiAgICByZXR1cm4gbXVsdGlwbGVOdW07XG59O1xuXG4vKipcbiAqIE1vZHVsbyBvcGVyYXRpb24gZm9yIGZsb2F0aW5nIHBvaW50IG9wZXJhdGlvbi5cbiAqIEBwYXJhbSB7bnVtYmVyfSB0YXJnZXQgdGFyZ2V0IHZhbHVlc1xuICogQHBhcmFtIHtudW1iZXJ9IG1vZE51bSBtb2QgbnVtXG4gKiBAcmV0dXJucyB7bnVtYmVyfSByZXN1bHQgbW9kXG4gKi9cbnZhciBtb2QgPSBmdW5jdGlvbih0YXJnZXQsIG1vZE51bSkge1xuICAgIHZhciBtdWx0aXBsZU51bSA9IG5lLnV0aWwuZmluZE11bHRpcGxlTnVtKG1vZE51bSk7XG4gICAgcmV0dXJuICgodGFyZ2V0ICogbXVsdGlwbGVOdW0pICUgKG1vZE51bSAqIG11bHRpcGxlTnVtKSkgLyBtdWx0aXBsZU51bTtcbn07XG5cbi8qKlxuICogQWRkaXRpb24gZm9yIGZsb2F0aW5nIHBvaW50IG9wZXJhdGlvbi5cbiAqIEBwYXJhbSB7bnVtYmVyfSBhIHRhcmdldCBhXG4gKiBAcGFyYW0ge251bWJlcn0gYiB0YXJnZXQgYlxuICogQHJldHVybnMge251bWJlcn0gYWRkaXRpb24gcmVzdWx0XG4gKi9cbnZhciBhZGRpdGlvbiA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICB2YXIgbXVsdGlwbGVOdW0gPSBmaW5kTXVsdGlwbGVOdW0oYSwgYik7XG4gICAgcmV0dXJuICgoYSAqIG11bHRpcGxlTnVtKSArIChiICogbXVsdGlwbGVOdW0pKSAvIG11bHRpcGxlTnVtO1xufTtcblxuLyoqXG4gKiBTdWJ0cmFjdGlvbiBmb3IgZmxvYXRpbmcgcG9pbnQgb3BlcmF0aW9uLlxuICogQHBhcmFtIHtudW1iZXJ9IGEgdGFyZ2V0IGFcbiAqIEBwYXJhbSB7bnVtYmVyfSBiIHRhcmdldCBiXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBzdWJ0cmFjdGlvbiByZXN1bHRcbiAqL1xudmFyIHN1YnRyYWN0aW9uID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHZhciBtdWx0aXBsZU51bSA9IGZpbmRNdWx0aXBsZU51bShhLCBiKTtcbiAgICByZXR1cm4gKChhICogbXVsdGlwbGVOdW0pIC0gKGIgKiBtdWx0aXBsZU51bSkpIC8gbXVsdGlwbGVOdW07XG59O1xuXG4vKipcbiAqIE11bHRpcGxpY2F0aW9uIGZvciBmbG9hdGluZyBwb2ludCBvcGVyYXRpb24uXG4gKiBAcGFyYW0ge251bWJlcn0gYSB0YXJnZXQgYVxuICogQHBhcmFtIHtudW1iZXJ9IGIgdGFyZ2V0IGJcbiAqIEByZXR1cm5zIHtudW1iZXJ9IG11bHRpcGxpY2F0aW9uIHJlc3VsdFxuICovXG52YXIgbXVsdGlwbGljYXRpb24gPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgdmFyIG11bHRpcGxlTnVtID0gZmluZE11bHRpcGxlTnVtKGEsIGIpO1xuICAgIHJldHVybiAoKGEgKiBtdWx0aXBsZU51bSkgKiAoYiAqIG11bHRpcGxlTnVtKSkgLyAobXVsdGlwbGVOdW0gKiBtdWx0aXBsZU51bSk7XG59O1xuXG4vKipcbiAqIERpdmlzaW9uIGZvciBmbG9hdGluZyBwb2ludCBvcGVyYXRpb24uXG4gKiBAcGFyYW0ge251bWJlcn0gYSB0YXJnZXQgYVxuICogQHBhcmFtIHtudW1iZXJ9IGIgdGFyZ2V0IGJcbiAqIEByZXR1cm5zIHtudW1iZXJ9IGRpdmlzaW9uIHJlc3VsdFxuICovXG52YXIgZGl2aXNpb24gPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgdmFyIG11bHRpcGxlTnVtID0gZmluZE11bHRpcGxlTnVtKGEsIGIpO1xuICAgIHJldHVybiAoYSAqIG11bHRpcGxlTnVtKSAvIChiICogbXVsdGlwbGVOdW0pO1xufTtcblxuLyoqXG4gKiBTdW0uXG4gKiBAcGFyYW0ge2FycmF5LjxudW1iZXI+fSB2YWx1ZXMgdGFyZ2V0IHZhbHVlc1xuICogQHJldHVybnMge251bWJlcn0gcmVzdWx0IHZhbHVlXG4gKi9cbnZhciBzdW0gPSBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICB2YXIgY29weUFyciA9IHZhbHVlcy5zbGljZSgpO1xuICAgIGNvcHlBcnIudW5zaGlmdCgwKTtcbiAgICByZXR1cm4gbmUudXRpbC5yZWR1Y2UoY29weUFyciwgZnVuY3Rpb24oYmFzZSwgYWRkKSB7XG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KGJhc2UpICsgcGFyc2VGbG9hdChhZGQpO1xuICAgIH0pO1xufTtcblxubmUudXRpbC5yYW5nZSA9IHJhbmdlO1xubmUudXRpbC5wbHVjayA9IHBsdWNrO1xubmUudXRpbC56aXAgPSB6aXA7XG5uZS51dGlsLm1pbiA9IG1pbjtcbm5lLnV0aWwubWF4ID0gbWF4O1xubmUudXRpbC5hbnkgPSBhbnk7XG5uZS51dGlsLmxlbmd0aEFmdGVyUG9pbnQgPSBsZW5ndGhBZnRlclBvaW50O1xubmUudXRpbC5tb2QgPSBtb2Q7XG5uZS51dGlsLmZpbmRNdWx0aXBsZU51bSA9IGZpbmRNdWx0aXBsZU51bTtcbm5lLnV0aWwuYWRkaXRpb24gPSBhZGRpdGlvbjtcbm5lLnV0aWwuc3VidHJhY3Rpb24gPSBzdWJ0cmFjdGlvbjtcbm5lLnV0aWwubXVsdGlwbGljYXRpb24gPSBtdWx0aXBsaWNhdGlvbjtcbm5lLnV0aWwuZGl2aXNpb24gPSBkaXZpc2lvbjtcbm5lLnV0aWwuc3VtID0gc3VtO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IGNoYXJ0IGNvbnN0XG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBDSEFSVF9ERUZBVUxUX1dJRFRIOiA1MDAsXG4gICAgQ0hBUlRfREVGQVVMVF9IRUlHSFQ6IDQwMCxcbiAgICBISURERU5fV0lEVEg6IDEsXG4gICAgREVGQVVMVF9USVRMRV9GT05UX1NJWkU6IDE0LFxuICAgIERFRkFVTFRfQVhJU19USVRMRV9GT05UX1NJWkU6IDEwLFxuICAgIERFRkFVTFRfTEFCRUxfRk9OVF9TSVpFOiAxMixcbiAgICBERUZBVUxUX1BMVUdJTjogJ3JhcGhhZWwnLFxuICAgIERFRkFVTFRfVElDS19DT0xPUjogJ2JsYWNrJyxcbiAgICBERUZBVUxUX1RIRU1FX05BTUU6ICdkZWZhdWx0JyxcbiAgICBTVEFDS0VEX05PUk1BTF9UWVBFOiAnbm9ybWFsJyxcbiAgICBTVEFDS0VEX1BFUkNFTlRfVFlQRTogJ3BlcmNlbnQnLFxuICAgIENIQVJUX1RZUEVfQkFSOiAnYmFyJyxcbiAgICBDSEFSVF9UWVBFX0NPTFVNTjogJ2NvbHVtbicsXG4gICAgQ0hBUlRfVFlQRV9MSU5FOiAnbGluZScsXG4gICAgQ0hBUlRfVFlQRV9DT01CTzogJ2NvbWJvJyxcbiAgICBDSEFSVF9UWVBFX1BJRTogJ3BpZScsXG4gICAgWUFYSVNfUFJPUFM6IFsndGlja0NvbG9yJywgJ3RpdGxlJywgJ2xhYmVsJ10sXG4gICAgU0VSSUVTX1BST1BTOiBbJ2NvbG9ycycsICdib3JkZXJDb2xvcicsICdzaW5nbGVDb2xvcnMnXVxufTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyAgQ2hhcnQgZmFjdG9yeSBwbGF5IHJvbGUgcmVnaXN0ZXIgY2hhcnQuXG4gKiAgICAgICAgICAgICAgICBBbHNvLCB5b3UgY2FuIGdldCBjaGFydCBmcm9tIHRoaXMgZmFjdG9yeS5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGNoYXJ0cyA9IHt9LFxuICAgIGZhY3RvcnkgPSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgY2hhcnQgaW5zdGFuY2UuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjaGFydFR5cGUgY2hhcnQgdHlwZVxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gZGF0YSBjaGFydCBkYXRhXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgICAgICogQHJldHVybnMge29iamVjdH0gY2hhcnQgaW5zdGFuY2U7XG4gICAgICAgICAqL1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKGNoYXJ0VHlwZSwgZGF0YSwgdGhlbWUsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHZhciBDaGFydCA9IGNoYXJ0c1tjaGFydFR5cGVdLFxuICAgICAgICAgICAgICAgIGNoYXJ0O1xuXG4gICAgICAgICAgICBpZiAoIUNoYXJ0KSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgZXhpc3QgJyArIGNoYXJ0VHlwZSArICcgY2hhcnQuJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNoYXJ0ID0gbmV3IENoYXJ0KGRhdGEsIHRoZW1lLCBvcHRpb25zKTtcblxuICAgICAgICAgICAgcmV0dXJuIGNoYXJ0O1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZWdpc3RlciBjaGFydC5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNoYXJ0VHlwZSBjaGFyIHR5cGVcbiAgICAgICAgICogQHBhcmFtIHtjbGFzc30gQ2hhcnRDbGFzcyBjaGFydCBjbGFzc1xuICAgICAgICAgKi9cbiAgICAgICAgcmVnaXN0ZXI6IGZ1bmN0aW9uKGNoYXJ0VHlwZSwgQ2hhcnRDbGFzcykge1xuICAgICAgICAgICAgY2hhcnRzW2NoYXJ0VHlwZV0gPSBDaGFydENsYXNzO1xuICAgICAgICB9XG4gICAgfTtcblxubW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3ICBQbHVnaW4gZmFjdG9yeSBwbGF5IHJvbGUgcmVnaXN0ZXIgcmVuZGVyaW5nIHBsdWdpbi5cbiAqICAgICAgICAgICAgICAgIEFsc28sIHlvdSBjYW4gZ2V0IHBsdWdpbiBmcm9tIHRoaXMgZmFjdG9yeS5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHBsdWdpbnMgPSB7fSxcbiAgICBmYWN0b3J5ID0ge1xuICAgICAgICAvKipcbiAgICAgICAgICogR2V0IGdyYXBoIHJlbmRlcmVyLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gbGliVHlwZSB0eXBlIG9mIGdyYXBoIGxpYnJhcnlcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNoYXJ0VHlwZSBjaGFydCB0eXBlXG4gICAgICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHJlbmRlcmVyIGluc3RhbmNlXG4gICAgICAgICAqL1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKGxpYlR5cGUsIGNoYXJ0VHlwZSkge1xuICAgICAgICAgICAgdmFyIHBsdWdpbiA9IHBsdWdpbnNbbGliVHlwZV0sXG4gICAgICAgICAgICAgICAgUmVuZGVyZXIsIHJlbmRlcmVyO1xuXG4gICAgICAgICAgICBpZiAoIXBsdWdpbikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGV4aXN0ICcgKyBsaWJUeXBlICsgJyBwbHVnaW4uJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIFJlbmRlcmVyID0gcGx1Z2luW2NoYXJ0VHlwZV07XG4gICAgICAgICAgICBpZiAoIVJlbmRlcmVyKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgZXhpc3QgJyArIGNoYXJ0VHlwZSArICcgY2hhcnQgcmVuZGVyZXIuJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlbmRlcmVyID0gbmV3IFJlbmRlcmVyKCk7XG5cbiAgICAgICAgICAgIHJldHVybiByZW5kZXJlcjtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFBsdWdpbiByZWdpc3Rlci5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGxpYlR5cGUgdHlwZSBvZiBncmFwaCBsaWJyYXJ5XG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwbHVnaW4gcGx1Z2luIHRvIGNvbnRyb2wgbGlicmFyeVxuICAgICAgICAgKi9cbiAgICAgICAgcmVnaXN0ZXI6IGZ1bmN0aW9uKGxpYlR5cGUsIHBsdWdpbikge1xuICAgICAgICAgICAgcGx1Z2luc1tsaWJUeXBlXSA9IHBsdWdpbjtcbiAgICAgICAgfVxuICAgIH07XG5cbm1vZHVsZS5leHBvcnRzID0gZmFjdG9yeTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyAgVGhlbWUgZmFjdG9yeSBwbGF5IHJvbGUgcmVnaXN0ZXIgdGhlbWUuXG4gKiAgICAgICAgICAgICAgICBBbHNvLCB5b3UgY2FuIGdldCB0aGVtZSBmcm9tIHRoaXMgZmFjdG9yeS5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuLi9jb25zdC5qcycpLFxuICAgIGRlZmF1bHRUaGVtZSA9IHJlcXVpcmUoJy4uL3RoZW1lcy9kZWZhdWx0VGhlbWUuanMnKTtcblxudmFyIHRoZW1lcyA9IHt9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAvKipcbiAgICAgKiBHZXQgdGhlbWUuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRoZW1lTmFtZSB0aGVtZSBuYW1lXG4gICAgICogQHJldHVybnMge29iamVjdH0gdGhlbWUgb2JqZWN0XG4gICAgICovXG4gICAgZ2V0OiBmdW5jdGlvbih0aGVtZU5hbWUpIHtcbiAgICAgICAgdmFyIHRoZW1lID0gdGhlbWVzW3RoZW1lTmFtZV07XG5cbiAgICAgICAgaWYgKCF0aGVtZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgZXhpc3QgJyArIHRoZW1lTmFtZSArICcgdGhlbWUuJyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhlbWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRoZW1lIHJlZ2lzdGVyLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0aGVtZU5hbWUgdGhlbWUgbmFtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSB0aGVtZVxuICAgICAqL1xuICAgIHJlZ2lzdGVyOiBmdW5jdGlvbih0aGVtZU5hbWUsIHRoZW1lKSB7XG4gICAgICAgIHRoZW1lID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGVtZSkpO1xuICAgICAgICBpZiAodGhlbWVOYW1lICE9PSBjaGFydENvbnN0LkRFRkFVTFRfVEhFTUVfTkFNRSkge1xuICAgICAgICAgICAgdGhlbWUgPSB0aGlzLl9pbml0VGhlbWUodGhlbWUpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2luaGVyaXRUaGVtZVByb3BlcnR5KHRoZW1lKTtcbiAgICAgICAgdGhlbWVzW3RoZW1lTmFtZV0gPSB0aGVtZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW5pdCB0aGVtZS5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgdGhlbWVcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSB0aGVtZVxuICAgICAqIEBwcml2YXRlXG4gICAgICogQGlnbm9yZVxuICAgICAqL1xuICAgIF9pbml0VGhlbWU6IGZ1bmN0aW9uKHRoZW1lKSB7XG4gICAgICAgIHZhciBjbG9uZVRoZW1lID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShkZWZhdWx0VGhlbWUpKSxcbiAgICAgICAgICAgIG5ld1RoZW1lO1xuXG4gICAgICAgIHRoaXMuX2NvbmNhdERlZmF1bHRDb2xvcnModGhlbWUsIGNsb25lVGhlbWUuc2VyaWVzLmNvbG9ycylcbiAgICAgICAgbmV3VGhlbWUgPSB0aGlzLl9leHRlbmRUaGVtZSh0aGVtZSwgY2xvbmVUaGVtZSk7XG5cbiAgICAgICAgbmV3VGhlbWUgPSB0aGlzLl9jb3B5UHJvcGVydHkoe1xuICAgICAgICAgICAgcHJvcE5hbWU6ICd5QXhpcycsXG4gICAgICAgICAgICBmcm9tVGhlbWU6IHRoZW1lLFxuICAgICAgICAgICAgdG9UaGVtZTogbmV3VGhlbWUsXG4gICAgICAgICAgICByZWplY3RQcm9wczogY2hhcnRDb25zdC5ZQVhJU19QUk9QU1xuICAgICAgICB9KTtcblxuICAgICAgICBuZXdUaGVtZSA9IHRoaXMuX2NvcHlQcm9wZXJ0eSh7XG4gICAgICAgICAgICBwcm9wTmFtZTogJ3NlcmllcycsXG4gICAgICAgICAgICBmcm9tVGhlbWU6IHRoZW1lLFxuICAgICAgICAgICAgdG9UaGVtZTogbmV3VGhlbWUsXG4gICAgICAgICAgICByZWplY3RQcm9wczogY2hhcnRDb25zdC5TRVJJRVNfUFJPUFNcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBuZXdUaGVtZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmlsdGVyIGNoYXJ0IHR5cGVzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0YXJnZXQgdGFyZ2V0IGNoYXJ0c1xuICAgICAqIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IHJlamVjdFByb3BzIHJlamVjdCBwcm9wZXJ0eVxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IGZpbHRlcmVkIGNoYXJ0cy5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9maWx0ZXJDaGFydFR5cGVzOiBmdW5jdGlvbih0YXJnZXQsIHJlamVjdFByb3BzKSB7XG4gICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cblxuICAgICAgICByZXN1bHQgPSBuZS51dGlsLmZpbHRlcih0YXJnZXQsIGZ1bmN0aW9uKGl0ZW0sIG5hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBuZS51dGlsLmluQXJyYXkobmFtZSwgcmVqZWN0UHJvcHMpID09PSAtMTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvbmNhdCBjb2xvcnMuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIHRoZW1lXG4gICAgICogQHBhcmFtIHthcnJheS48c3RyaW5nPn0gc2VyaWVzQ29sb3JzIHNlcmllcyBjb2xvcnNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jb25jYXRDb2xvcnM6IGZ1bmN0aW9uKHRoZW1lLCBzZXJpZXNDb2xvcnMpIHtcbiAgICAgICAgaWYgKHRoZW1lLmNvbG9ycykge1xuICAgICAgICAgICAgdGhlbWUuY29sb3JzID0gdGhlbWUuY29sb3JzLmNvbmNhdChzZXJpZXNDb2xvcnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoZW1lLnNpbmdsZUNvbG9ycykge1xuICAgICAgICAgICAgdGhlbWUuc2luZ2xlQ29sb3JzID0gdGhlbWUuc2luZ2xlQ29sb3JzLmNvbmNhdChzZXJpZXNDb2xvcnMpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvbmNhdCBkZWZhdWx0IGNvbG9ycy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgdGhlbWVcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBzZXJpZXNDb2xvcnMgc2VyaWVzIGNvbG9yc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NvbmNhdERlZmF1bHRDb2xvcnM6IGZ1bmN0aW9uKHRoZW1lLCBzZXJpZXNDb2xvcnMpIHtcbiAgICAgICAgdmFyIGNoYXJ0VHlwZXM7XG5cbiAgICAgICAgaWYgKCF0aGVtZS5zZXJpZXMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNoYXJ0VHlwZXMgPSB0aGlzLl9maWx0ZXJDaGFydFR5cGVzKHRoZW1lLnNlcmllcywgY2hhcnRDb25zdC5TRVJJRVNfUFJPUFMpO1xuXG4gICAgICAgIGlmICghbmUudXRpbC5rZXlzKGNoYXJ0VHlwZXMpLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5fY29uY2F0Q29sb3JzKHRoZW1lLnNlcmllcywgc2VyaWVzQ29sb3JzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5lLnV0aWwuZm9yRWFjaChjaGFydFR5cGVzLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY29uY2F0Q29sb3JzKGl0ZW0sIHNlcmllc0NvbG9ycyk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFeHRlbmQgdGhlbWVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZnJvbSBmcm9tIHRoZW1lIHByb3BlcnR5XG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRvIHRvIHRoZW1lIHByb3BlcnR5XG4gICAgICogQHJldHVybnMge29iamVjdH0gcmVzdWx0IHByb3BlcnR5XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZXh0ZW5kVGhlbWU6IGZ1bmN0aW9uKGZyb20sIHRvKSB7XG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaCh0bywgZnVuY3Rpb24oaXRlbSwga2V5KSB7XG4gICAgICAgICAgICB2YXIgZnJvbUl0ZW0gPSBmcm9tW2tleV07XG4gICAgICAgICAgICBpZiAoIWZyb21JdGVtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobmUudXRpbC5pc0FycmF5KGZyb21JdGVtKSkge1xuICAgICAgICAgICAgICAgIHRvW2tleV0gPSBmcm9tSXRlbS5zbGljZSgpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChuZS51dGlsLmlzT2JqZWN0KGZyb21JdGVtKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2V4dGVuZFRoZW1lKGZyb21JdGVtLCBpdGVtKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdG9ba2V5XSA9IGZyb21JdGVtO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICByZXR1cm4gdG87XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvcHkgcHJvcGVydHkuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLnByb3BOYW1lIHByb3BlcnR5IG5hbWVcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuZnJvbVRoZW1lIGZyb20gcHJvcGVydHlcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudG9UaGVtZSB0cCBwcm9wZXJ0eVxuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48c3RyaW5nPn0gcGFyYW1zLnJlamVjdFByb3BzIHJlamVjdCBwcm9wZXJ0eSBuYW1lXG4gICAgICogQHJldHVybnMge29iamVjdH0gY29waWVkIHByb3BlcnR5XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY29weVByb3BlcnR5OiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGNoYXJ0VHlwZXM7XG5cbiAgICAgICAgaWYgKCFwYXJhbXMudG9UaGVtZVtwYXJhbXMucHJvcE5hbWVdKSB7XG4gICAgICAgICAgICByZXR1cm4gcGFyYW1zLnRvVGhlbWU7XG4gICAgICAgIH1cblxuICAgICAgICBjaGFydFR5cGVzID0gdGhpcy5fZmlsdGVyQ2hhcnRUeXBlcyhwYXJhbXMuZnJvbVRoZW1lW3BhcmFtcy5wcm9wTmFtZV0sIHBhcmFtcy5yZWplY3RQcm9wcyk7XG4gICAgICAgIGlmIChuZS51dGlsLmtleXMoY2hhcnRUeXBlcykubGVuZ3RoKSB7XG4gICAgICAgICAgICBuZS51dGlsLmZvckVhY2goY2hhcnRUeXBlcywgZnVuY3Rpb24oaXRlbSwga2V5KSB7XG4gICAgICAgICAgICAgICAgdmFyIGNsb25lVGhlbWUgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGRlZmF1bHRUaGVtZVtwYXJhbXMucHJvcE5hbWVdKSk7XG4gICAgICAgICAgICAgICAgcGFyYW1zLmZyb21UaGVtZVtwYXJhbXMucHJvcE5hbWVdW2tleV0gPSB0aGlzLl9leHRlbmRUaGVtZShpdGVtLCBjbG9uZVRoZW1lKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgICAgICBwYXJhbXMudG9UaGVtZVtwYXJhbXMucHJvcE5hbWVdID0gcGFyYW1zLmZyb21UaGVtZVtwYXJhbXMucHJvcE5hbWVdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhcmFtcy50b1RoZW1lO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDb3B5IGNvbG9yIGluZm8gdG8gbGVnZW5kXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHNlcmllc1RoZW1lIHNlcmllcyB0aGVtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBsZWdlbmRUaGVtZSBsZWdlbmQgdGhlbWVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jb3B5Q29sb3JJbmZvVG9MZWdlbmQ6IGZ1bmN0aW9uKHNlcmllc1RoZW1lLCBsZWdlbmRUaGVtZSkge1xuICAgICAgICBpZiAoc2VyaWVzVGhlbWUuc2luZ2xlQ29sb3JzKSB7XG4gICAgICAgICAgICBsZWdlbmRUaGVtZS5zaW5nbGVDb2xvcnMgPSBzZXJpZXNUaGVtZS5zaW5nbGVDb2xvcnM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNlcmllc1RoZW1lLmJvcmRlckNvbG9yKSB7XG4gICAgICAgICAgICBsZWdlbmRUaGVtZS5ib3JkZXJDb2xvciA9IHNlcmllc1RoZW1lLmJvcmRlckNvbG9yO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIGluaGVyaXQgdGhlbWUgcHJvcGVydHkuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIHRoZW1lXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAaWdub3JlXG4gICAgICovXG4gICAgX2luaGVyaXRUaGVtZVByb3BlcnR5OiBmdW5jdGlvbih0aGVtZSkge1xuICAgICAgICB2YXIgYmFzZUZvbnQgPSB0aGVtZS5jaGFydC5mb250RmFtaWx5LFxuICAgICAgICAgICAgaXRlbXMgPSBbXG4gICAgICAgICAgICAgICAgdGhlbWUudGl0bGUsXG4gICAgICAgICAgICAgICAgdGhlbWUueEF4aXMudGl0bGUsXG4gICAgICAgICAgICAgICAgdGhlbWUueEF4aXMubGFiZWwsXG4gICAgICAgICAgICAgICAgdGhlbWUubGVnZW5kLmxhYmVsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgeUF4aXNDaGFydFR5cGVzID0gdGhpcy5fZmlsdGVyQ2hhcnRUeXBlcyh0aGVtZS55QXhpcywgY2hhcnRDb25zdC5ZQVhJU19QUk9QUyksXG4gICAgICAgICAgICBzZXJpZXNDaGFydFR5cGVzID0gdGhpcy5fZmlsdGVyQ2hhcnRUeXBlcyh0aGVtZS5zZXJpZXMsIGNoYXJ0Q29uc3QuU0VSSUVTX1BST1BTKTtcblxuICAgICAgICBpZiAoIW5lLnV0aWwua2V5cyh5QXhpc0NoYXJ0VHlwZXMpLmxlbmd0aCkge1xuICAgICAgICAgICAgaXRlbXMucHVzaCh0aGVtZS55QXhpcy50aXRsZSk7XG4gICAgICAgICAgICBpdGVtcy5wdXNoKHRoZW1lLnlBeGlzLmxhYmVsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5lLnV0aWwuZm9yRWFjaCh5QXhpc0NoYXJ0VHlwZXMsIGZ1bmN0aW9uKHlBeGlzVGhlbWUpIHtcbiAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKHlBeGlzVGhlbWUudGl0bGUpO1xuICAgICAgICAgICAgICAgIGl0ZW1zLnB1c2goeUF4aXNUaGVtZS5sYWJlbCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KGl0ZW1zLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICBpZiAoIWl0ZW0uZm9udEZhbWlseSkge1xuICAgICAgICAgICAgICAgIGl0ZW0uZm9udEZhbWlseSA9IGJhc2VGb250O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoIW5lLnV0aWwua2V5cyhzZXJpZXNDaGFydFR5cGVzKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoZW1lLmxlZ2VuZC5jb2xvcnMgPSB0aGVtZS5zZXJpZXMuY29sb3JzO1xuICAgICAgICAgICAgdGhpcy5fY29weUNvbG9ySW5mb1RvTGVnZW5kKHRoZW1lLnNlcmllcywgdGhlbWUubGVnZW5kKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5lLnV0aWwuZm9yRWFjaChzZXJpZXNDaGFydFR5cGVzLCBmdW5jdGlvbihpdGVtLCBjaGFydFR5cGUpIHtcbiAgICAgICAgICAgICAgICB0aGVtZS5sZWdlbmRbY2hhcnRUeXBlXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgY29sb3JzOiBpdGVtLmNvbG9ycyB8fCB0aGVtZS5sZWdlbmQuY29sb3JzXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLl9jb3B5Q29sb3JJbmZvVG9MZWdlbmQoaXRlbSwgdGhlbWUubGVnZW5kW2NoYXJ0VHlwZV0pO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGVtZS5sZWdlbmQuY29sb3JzO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEF4aXMgRGF0YSBNYWtlclxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4uL2NvbnN0LmpzJyksXG4gICAgY2FsY3VsYXRvciA9IHJlcXVpcmUoJy4vY2FsY3VsYXRvci5qcycpO1xuXG52YXIgTUlOX1BJWEVMX1NURVBfU0laRSA9IDQwLFxuICAgIE1BWF9QSVhFTF9TVEVQX1NJWkUgPSA2MCxcbiAgICBQRVJDRU5UX1NUQUNLRURfVElDS19JTkZPID0ge1xuICAgICAgICBzY2FsZToge1xuICAgICAgICAgICAgbWluOiAwLFxuICAgICAgICAgICAgbWF4OiAxMDBcbiAgICAgICAgfSxcbiAgICAgICAgc3RlcDogMjUsXG4gICAgICAgIHRpY2tDb3VudDogNSxcbiAgICAgICAgbGFiZWxzOiBbMCwgMjUsIDUwLCA3NSwgMTAwXVxuICAgIH07XG5cbnZhciBhYnMgPSBNYXRoLmFicyxcbiAgICBjb25jYXQgPSBBcnJheS5wcm90b3R5cGUuY29uY2F0O1xuXG4vKipcbiAqIEF4aXMgZGF0YSBtYWtlci5cbiAqIEBtb2R1bGUgYXhpc0RhdGFNYWtlclxuICovXG52YXIgYXhpc0RhdGFNYWtlciA9IHtcbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGRhdGEgYWJvdXQgbGFiZWwgYXhpcy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGxhYmVscyBjaGFydCBsYWJlbHNcbiAgICAgKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gaXNWZXJ0aWNhbCB3aGV0aGVyIHZlcnRpY2FsIG9yIG5vdFxuICAgICAqIEByZXR1cm5zIHt7XG4gICAgICogICAgICBsYWJlbHM6IGFycmF5LjxzdHJpbmc+LFxuICAgICAqICAgICAgdGlja0NvdW50OiBudW1iZXIsXG4gICAgICogICAgICB2YWxpZFRpY2tDb3VudDogbnVtYmVyLFxuICAgICAqICAgICAgaXNMYWJlbEF4aXM6IGJvb2xlYW4sXG4gICAgICogICAgICBpc1ZlcnRpY2FsOiBib29sZWFuXG4gICAgICogfX0gYXhpcyBkYXRhXG4gICAgICovXG4gICAgbWFrZUxhYmVsQXhpc0RhdGE6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbGFiZWxzOiBwYXJhbXMubGFiZWxzLFxuICAgICAgICAgICAgdGlja0NvdW50OiBwYXJhbXMubGFiZWxzLmxlbmd0aCArIDEsXG4gICAgICAgICAgICB2YWxpZFRpY2tDb3VudDogMCxcbiAgICAgICAgICAgIGlzTGFiZWxBeGlzOiB0cnVlLFxuICAgICAgICAgICAgaXNWZXJ0aWNhbDogISFwYXJhbXMuaXNWZXJ0aWNhbFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGRhdGEgYWJvdXQgdmFsdWUgYXhpcy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPGFycmF5LjxudW1iZXI+Pn0gcGFyYW1zLnZhbHVlcyBjaGFydCB2YWx1ZXNcbiAgICAgKiAgICAgIEBwYXJhbSB7e3dpZHRoOm51bWJlciwgaGVpZ2h0Om51bWJlcn19IHBhcmFtcy5zZXJpZXNEaW1lbnNpb24gc2VyaWVzIGRpbWVuc2lvblxuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48ZnVuY3Rpb24+fSBwYXJhbXMuZm9ybWF0RnVuY3Rpb25zIGZvcm1hdCBmdW5jdGlvbnNcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMuc3RhY2tlZCBzdGFja2VkIG9wdGlvblxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5vcHRpb25zIGF4aXMgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHt7XG4gICAgICogICAgICBsYWJlbHM6IGFycmF5LjxzdHJpbmc+LFxuICAgICAqICAgICAgdGlja0NvdW50OiBudW1iZXIsXG4gICAgICogICAgICB2YWxpZFRpY2tDb3VudDogbnVtYmVyLFxuICAgICAqICAgICAgaXNMYWJlbEF4aXM6IGJvb2xlYW4sXG4gICAgICogICAgICBzY2FsZToge21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn0sXG4gICAgICogICAgICBpc1ZlcnRpY2FsOiBib29sZWFuXG4gICAgICogfX0gYXhpcyBkYXRhXG4gICAgICovXG4gICAgbWFrZVZhbHVlQXhpc0RhdGE6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgb3B0aW9ucyA9IHBhcmFtcy5vcHRpb25zIHx8IHt9LFxuICAgICAgICAgICAgaXNWZXJ0aWNhbCA9ICEhcGFyYW1zLmlzVmVydGljYWwsXG4gICAgICAgICAgICBpc1Bvc2l0aW9uUmlnaHQgPSAhIXBhcmFtcy5pc1Bvc2l0aW9uUmlnaHQsXG4gICAgICAgICAgICBmb3JtYXRGdW5jdGlvbnMgPSBwYXJhbXMuZm9ybWF0RnVuY3Rpb25zLFxuICAgICAgICAgICAgdGlja0luZm87XG4gICAgICAgIGlmIChwYXJhbXMuc3RhY2tlZCA9PT0gJ3BlcmNlbnQnKSB7XG4gICAgICAgICAgICB0aWNrSW5mbyA9IFBFUkNFTlRfU1RBQ0tFRF9USUNLX0lORk87XG4gICAgICAgICAgICBmb3JtYXRGdW5jdGlvbnMgPSBbXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRpY2tJbmZvID0gdGhpcy5fZ2V0VGlja0luZm8oe1xuICAgICAgICAgICAgICAgIHZhbHVlczogdGhpcy5fbWFrZUJhc2VWYWx1ZXMocGFyYW1zLnZhbHVlcywgcGFyYW1zLnN0YWNrZWQpLFxuICAgICAgICAgICAgICAgIHNlcmllc0RpbWVuc2lvbjogcGFyYW1zLnNlcmllc0RpbWVuc2lvbixcbiAgICAgICAgICAgICAgICBpc1ZlcnRpY2FsOiBpc1ZlcnRpY2FsLFxuICAgICAgICAgICAgICAgIGlzUG9zaXRpb25SaWdodDogaXNQb3NpdGlvblJpZ2h0LFxuICAgICAgICAgICAgICAgIGNoYXJ0VHlwZTogcGFyYW1zLmNoYXJ0VHlwZVxuICAgICAgICAgICAgfSwgb3B0aW9ucyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbGFiZWxzOiB0aGlzLl9mb3JtYXRMYWJlbHModGlja0luZm8ubGFiZWxzLCBmb3JtYXRGdW5jdGlvbnMpLFxuICAgICAgICAgICAgdGlja0NvdW50OiB0aWNrSW5mby50aWNrQ291bnQsXG4gICAgICAgICAgICB2YWxpZFRpY2tDb3VudDogdGlja0luZm8udGlja0NvdW50LFxuICAgICAgICAgICAgc2NhbGU6IHRpY2tJbmZvLnNjYWxlLFxuICAgICAgICAgICAgc3RlcDogdGlja0luZm8uc3RlcCxcbiAgICAgICAgICAgIGlzVmVydGljYWw6IGlzVmVydGljYWwsXG4gICAgICAgICAgICBpc1Bvc2l0aW9uUmlnaHQ6IGlzUG9zaXRpb25SaWdodFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGJhc2UgdmFsdWVzLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7YXJyYXkuPG51bWJlcj59IGdyb3VwVmFsdWVzIGdyb3VwIHZhbHVlc1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzdGFja2VkIHN0YWNrZWQgb3B0aW9uLlxuICAgICAqIEByZXR1cm5zIHthcnJheS48bnVtYmVyPn0gYmFzZSB2YWx1ZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQmFzZVZhbHVlczogZnVuY3Rpb24oZ3JvdXBWYWx1ZXMsIHN0YWNrZWQpIHtcbiAgICAgICAgdmFyIGJhc2VWYWx1ZXMgPSBjb25jYXQuYXBwbHkoW10sIGdyb3VwVmFsdWVzKTsgLy8gZmxhdHRlbiBhcnJheVxuICAgICAgICBpZiAoc3RhY2tlZCA9PT0gY2hhcnRDb25zdC5TVEFDS0VEX05PUk1BTF9UWVBFKSB7XG4gICAgICAgICAgICBiYXNlVmFsdWVzID0gYmFzZVZhbHVlcy5jb25jYXQobmUudXRpbC5tYXAoZ3JvdXBWYWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICAgICAgICAgIHZhciBwbHVzVmFsdWVzID0gbmUudXRpbC5maWx0ZXIodmFsdWVzLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgPiAwO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZS51dGlsLnN1bShwbHVzVmFsdWVzKTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYmFzZVZhbHVlcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGJhc2Ugc2l6ZSBmb3IgZ2V0IGNhbmRpZGF0ZSB0aWNrIGNvdW50cy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGRpbWVuc2lvbiBjaGF0IGRpbWVuc2lvblxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNWZXJ0aWNhbCB3aGV0aGVyIHZlcnRpY2FsIG9yIG5vdFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IGJhc2Ugc2l6ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldEJhc2VTaXplOiBmdW5jdGlvbihkaW1lbnNpb24sIGlzVmVydGljYWwpIHtcbiAgICAgICAgdmFyIGJhc2VTaXplO1xuICAgICAgICBpZiAoaXNWZXJ0aWNhbCkge1xuICAgICAgICAgICAgYmFzZVNpemUgPSBkaW1lbnNpb24uaGVpZ2h0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYmFzZVNpemUgPSBkaW1lbnNpb24ud2lkdGg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJhc2VTaXplO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgY2FuZGlkYXRlIHRpY2sgY291bnRzLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gY2hhcnREaW1lbnNpb24gY2hhdCBkaW1lbnNpb25cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzVmVydGljYWwgd2hldGhlciB2ZXJ0aWNhbCBvciBub3RcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPG51bWJlcj59IHRpY2sgY291bnRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0Q2FuZGlkYXRlVGlja0NvdW50czogZnVuY3Rpb24oY2hhcnREaW1lbnNpb24sIGlzVmVydGljYWwpIHtcbiAgICAgICAgdmFyIGJhc2VTaXplID0gdGhpcy5fZ2V0QmFzZVNpemUoY2hhcnREaW1lbnNpb24sIGlzVmVydGljYWwpLFxuICAgICAgICAgICAgc3RhcnQgPSBwYXJzZUludChiYXNlU2l6ZSAvIE1BWF9QSVhFTF9TVEVQX1NJWkUsIDEwKSxcbiAgICAgICAgICAgIGVuZCA9IHBhcnNlSW50KGJhc2VTaXplIC8gTUlOX1BJWEVMX1NURVBfU0laRSwgMTApICsgMSxcbiAgICAgICAgICAgIHRpY2tDb3VudHMgPSBuZS51dGlsLnJhbmdlKHN0YXJ0LCBlbmQpO1xuICAgICAgICByZXR1cm4gdGlja0NvdW50cztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNvbXBhcmluZyB2YWx1ZS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWluIG1pbmltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1heCBtYXhpbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7e3NjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfSwgc3RlcDogbnVtYmVyfX0gdGlja0luZm8gdGljayBpbmZvXG4gICAgICogQHJldHVybnMge251bWJlcn0gY29tcGFyaW5nIHZhbHVlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0Q29tcGFyaW5nVmFsdWU6IGZ1bmN0aW9uKG1pbiwgbWF4LCB0aWNrSW5mbykge1xuICAgICAgICB2YXIgZGlmZk1heCA9IGFicyh0aWNrSW5mby5zY2FsZS5tYXggLSBtYXgpLFxuICAgICAgICAgICAgZGlmZk1pbiA9IGFicyhtaW4gLSB0aWNrSW5mby5zY2FsZS5taW4pLFxuICAgICAgICAgICAgd2VpZ2h0ID0gTWF0aC5wb3coMTAsIG5lLnV0aWwubGVuZ3RoQWZ0ZXJQb2ludCh0aWNrSW5mby5zdGVwKSk7XG4gICAgICAgIHJldHVybiAoZGlmZk1heCArIGRpZmZNaW4pICogd2VpZ2h0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZWxlY3QgdGljayBpbmZvLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtaW4gbWluaW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWF4IG1heGltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogQHBhcmFtIHthcnJheS48b2JqZWN0Pn0gY2FuZGlkYXRlcyB0aWNrIGluZm8gY2FuZGlkYXRlc1xuICAgICAqIEByZXR1cm5zIHt7c2NhbGU6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9LCB0aWNrQ291bnQ6IG51bWJlciwgc3RlcDogbnVtYmVyLCBsYWJlbHM6IGFycmF5LjxudW1iZXI+fX0gc2VsZWN0ZWQgdGljayBpbmZvXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2VsZWN0VGlja0luZm86IGZ1bmN0aW9uKG1pbiwgbWF4LCBjYW5kaWRhdGVzKSB7XG4gICAgICAgIHZhciBnZXRDb21wYXJpbmdWYWx1ZSA9IG5lLnV0aWwuYmluZCh0aGlzLl9nZXRDb21wYXJpbmdWYWx1ZSwgdGhpcywgbWluLCBtYXgpLFxuICAgICAgICAgICAgdGlja0luZm8gPSBuZS51dGlsLm1pbihjYW5kaWRhdGVzLCBnZXRDb21wYXJpbmdWYWx1ZSk7XG4gICAgICAgIHJldHVybiB0aWNrSW5mbztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHRpY2sgY291bnQgYW5kIHNjYWxlLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy52YWx1ZXMgYmFzZSB2YWx1ZXNcbiAgICAgKiAgICAgIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gcGFyYW1zLnNlcmllc0RpbWVuc2lvbiBjaGF0IGRpbWVuc2lvblxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaXNWZXJ0aWNhbCB3aGV0aGVyIHZlcnRpY2FsIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5jaGFydFR5cGUgY2hhdCB0eXBlXG4gICAgICogQHBhcmFtIHt7bWluOiBudW1iZXIsIG1heDpudW1iZXJ9fSBvcHRpb25zIGF4aXMgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHt7dGlja0NvdW50OiBudW1iZXIsIHNjYWxlOiBvYmplY3R9fSB0aWNrIGluZm9cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRUaWNrSW5mbzogZnVuY3Rpb24ocGFyYW1zLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciBtaW4gPSBuZS51dGlsLm1pbihwYXJhbXMudmFsdWVzKSxcbiAgICAgICAgICAgIG1heCA9IG5lLnV0aWwubWF4KHBhcmFtcy52YWx1ZXMpLFxuICAgICAgICAgICAgaW50VHlwZUluZm8sIHRpY2tDb3VudHMsIGNhbmRpZGF0ZXMsIHRpY2tJbmZvO1xuICAgICAgICAvLyAwMS4gbWluLCBtYXgsIG9wdGlvbnMg7KCV67O066W8IOygleyImO2YleycvOuhnCDrs4Dqsr1cbiAgICAgICAgaW50VHlwZUluZm8gPSB0aGlzLl9tYWtlSW50ZWdlclR5cGVJbmZvKG1pbiwgbWF4LCBvcHRpb25zKTtcblxuICAgICAgICAvLyAwMi4gdGljayBjb3VudCDtm4Trs7TqtbAg7Ja76riwXG4gICAgICAgIHRpY2tDb3VudHMgPSBwYXJhbXMudGlja0NvdW50ID8gW3BhcmFtcy50aWNrQ291bnRdIDogdGhpcy5fZ2V0Q2FuZGlkYXRlVGlja0NvdW50cyhwYXJhbXMuc2VyaWVzRGltZW5zaW9uLCBwYXJhbXMuaXNWZXJ0aWNhbCk7XG5cbiAgICAgICAgLy8gMDMuIHRpY2sgaW5mbyDtm4Trs7TqtbAg6rOE7IKwXG4gICAgICAgIGNhbmRpZGF0ZXMgPSB0aGlzLl9nZXRDYW5kaWRhdGVUaWNrSW5mb3Moe1xuICAgICAgICAgICAgbWluOiBpbnRUeXBlSW5mby5taW4sXG4gICAgICAgICAgICBtYXg6IGludFR5cGVJbmZvLm1heCxcbiAgICAgICAgICAgIHRpY2tDb3VudHM6IHRpY2tDb3VudHMsXG4gICAgICAgICAgICBjaGFydFR5cGU6IHBhcmFtcy5jaGFydFR5cGVcbiAgICAgICAgfSwgaW50VHlwZUluZm8ub3B0aW9ucyk7XG5cbiAgICAgICAgLy8gMDQuIHRpY2sgaW5mbyDtm4Trs7TqtbAg7KSRIO2VmOuCmCDshKDtg51cbiAgICAgICAgdGlja0luZm8gPSB0aGlzLl9zZWxlY3RUaWNrSW5mbyhpbnRUeXBlSW5mby5taW4sIGludFR5cGVJbmZvLm1heCwgY2FuZGlkYXRlcyk7XG5cbiAgICAgICAgLy8gMDUuIOygleyImO2YleycvOuhnCDrs4Dqsr3tlojrjZggdGljayBpbmZv66W8IOybkOuemCDtmJXtg5zroZwg67OA6rK9XG4gICAgICAgIHRpY2tJbmZvID0gdGhpcy5fcmV2ZXJ0T3JpZ2luYWxUeXBlVGlja0luZm8odGlja0luZm8sIGludFR5cGVJbmZvLmRpdmlkZU51bSk7XG4gICAgICAgIHJldHVybiB0aWNrSW5mbztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBpbnRlZ2VyIHR5cGUgaW5mb1xuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtaW4gbWluaW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWF4IG1heGltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogQHBhcmFtIHt7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX0gb3B0aW9ucyBheGlzIG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7e21pbjogbnVtYmVyLCBtYXg6IG51bWJlciwgb3B0aW9uczoge21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn0sIGRpdmlkZU51bTogbnVtYmVyfX0gaW50ZWdlciB0eXBlIGluZm9cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlSW50ZWdlclR5cGVJbmZvOiBmdW5jdGlvbihtaW4sIG1heCwgb3B0aW9ucykge1xuICAgICAgICB2YXIgbXVsdGlwbGVOdW0sIGNoYW5nZWRPcHRpb25zO1xuXG4gICAgICAgIGlmIChhYnMobWluKSA+PSAxIHx8IGFicyhtYXgpID49IDEpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgbWluOiBtaW4sXG4gICAgICAgICAgICAgICAgbWF4OiBtYXgsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogb3B0aW9ucyxcbiAgICAgICAgICAgICAgICBkaXZpZGVOdW06IDFcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICBtdWx0aXBsZU51bSA9IG5lLnV0aWwuZmluZE11bHRpcGxlTnVtKG1pbiwgbWF4KTtcbiAgICAgICAgY2hhbmdlZE9wdGlvbnMgPSB7fTtcblxuICAgICAgICBpZiAob3B0aW9ucy5taW4pIHtcbiAgICAgICAgICAgIGNoYW5nZWRPcHRpb25zLm1pbiA9IG9wdGlvbnMubWluICogbXVsdGlwbGVOdW07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob3B0aW9ucy5tYXgpIHtcbiAgICAgICAgICAgIGNoYW5nZWRPcHRpb25zLm1heCA9IG9wdGlvbnMubWF4ICogbXVsdGlwbGVOdW07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbWluOiBtaW4gKiBtdWx0aXBsZU51bSxcbiAgICAgICAgICAgIG1heDogbWF4ICogbXVsdGlwbGVOdW0sXG4gICAgICAgICAgICBvcHRpb25zOiBjaGFuZ2VkT3B0aW9ucyxcbiAgICAgICAgICAgIGRpdmlkZU51bTogbXVsdGlwbGVOdW1cbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV2ZXJ0IHRpY2sgaW5mbyB0byBvcmlnaW5hbCB0eXBlLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7e3N0ZXA6IG51bWJlciwgc2NhbGU6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9LCBsYWJlbHM6IGFycmF5LjxudW1iZXI+fX0gdGlja0luZm8gdGljayBpbmZvXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGRpdmlkZU51bSBkaXZpZGUgbnVtXG4gICAgICogQHJldHVybnMge3tzdGVwOiBudW1iZXIsIHNjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfSwgbGFiZWxzOiBhcnJheS48bnVtYmVyPn19IGRpdmlkZWQgdGljayBpbmZvXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmV2ZXJ0T3JpZ2luYWxUeXBlVGlja0luZm86IGZ1bmN0aW9uKHRpY2tJbmZvLCBkaXZpZGVOdW0pIHtcbiAgICAgICAgaWYgKGRpdmlkZU51bSA9PT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIHRpY2tJbmZvO1xuICAgICAgICB9XG5cbiAgICAgICAgdGlja0luZm8uc3RlcCA9IG5lLnV0aWwuZGl2aXNpb24odGlja0luZm8uc3RlcCwgZGl2aWRlTnVtKTtcbiAgICAgICAgdGlja0luZm8uc2NhbGUubWluID0gbmUudXRpbC5kaXZpc2lvbih0aWNrSW5mby5zY2FsZS5taW4sIGRpdmlkZU51bSk7XG4gICAgICAgIHRpY2tJbmZvLnNjYWxlLm1heCA9IG5lLnV0aWwuZGl2aXNpb24odGlja0luZm8uc2NhbGUubWF4LCBkaXZpZGVOdW0pO1xuICAgICAgICB0aWNrSW5mby5sYWJlbHMgPSBuZS51dGlsLm1hcCh0aWNrSW5mby5sYWJlbHMsIGZ1bmN0aW9uKGxhYmVsKSB7XG4gICAgICAgICAgICByZXR1cm4gbmUudXRpbC5kaXZpc2lvbihsYWJlbCwgZGl2aWRlTnVtKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHRpY2tJbmZvO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBOb3JtYWxpemUgc3RlcC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3RlcCBvcmlnaW5hbCBzdGVwXG4gICAgICogQHJldHVybnMge251bWJlcn0gbm9ybWFsaXplZCBzdGVwXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbm9ybWFsaXplU3RlcDogZnVuY3Rpb24oc3RlcCkge1xuICAgICAgICByZXR1cm4gY2FsY3VsYXRvci5ub3JtYWxpemVBeGlzTnVtYmVyKHN0ZXApO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtaW5pbWl6ZSB0aWNrIHNjYWxlLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy51c2VyTWluIHVzZXIgbWluXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnVzZXJNYXggdXNlciBtYXhcbiAgICAgKiAgICAgIEBwYXJhbSB7e3RpY2tDb3VudDogbnVtYmVyLCBzY2FsZTogb2JqZWN0fX0gcGFyYW1zLnRpY2tJbmZvIHRpY2sgaW5mb1xuICAgICAqICAgICAgQHBhcmFtIHt7bWluOiBudW1iZXIsIG1heDpudW1iZXJ9fSBwYXJhbXMub3B0aW9ucyBheGlzIG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7e3RpY2tDb3VudDogbnVtYmVyLCBzY2FsZTogb2JqZWN0LCBsYWJlbHM6IGFycmF5fX0gY29ycmVjdGVkIHRpY2sgaW5mb1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21pbmltaXplVGlja1NjYWxlOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIHRpY2tJbmZvID0gcGFyYW1zLnRpY2tJbmZvLFxuICAgICAgICAgICAgdGlja3MgPSBuZS51dGlsLnJhbmdlKDEsIHRpY2tJbmZvLnRpY2tDb3VudCksXG4gICAgICAgICAgICBvcHRpb25zID0gcGFyYW1zLm9wdGlvbnMsXG4gICAgICAgICAgICBzdGVwID0gdGlja0luZm8uc3RlcCxcbiAgICAgICAgICAgIHNjYWxlID0gdGlja0luZm8uc2NhbGUsXG4gICAgICAgICAgICB0aWNrTWF4ID0gc2NhbGUubWF4LFxuICAgICAgICAgICAgdGlja01pbiA9IHNjYWxlLm1pbixcbiAgICAgICAgICAgIGlzVW5kZWZpbmVkTWluID0gbmUudXRpbC5pc1VuZGVmaW5lZChvcHRpb25zLm1pbiksXG4gICAgICAgICAgICBpc1VuZGVmaW5lZE1heCA9IG5lLnV0aWwuaXNVbmRlZmluZWQob3B0aW9ucy5tYXgpLFxuICAgICAgICAgICAgbGFiZWxzO1xuICAgICAgICBuZS51dGlsLmZvckVhY2hBcnJheSh0aWNrcywgZnVuY3Rpb24odGlja0luZGV4KSB7XG4gICAgICAgICAgICB2YXIgY3VyU3RlcCA9IChzdGVwICogdGlja0luZGV4KSxcbiAgICAgICAgICAgICAgICBjdXJNaW4gPSB0aWNrTWluICsgY3VyU3RlcCxcbiAgICAgICAgICAgICAgICBjdXJNYXggPSB0aWNrTWF4IC0gY3VyU3RlcDtcblxuICAgICAgICAgICAgLy8g642U7J207IOBIOuzgOqyveydtCDtlYTsmpQg7JeG7J2EIOqyveyasFxuICAgICAgICAgICAgaWYgKHBhcmFtcy51c2VyTWluIDw9IGN1ck1pbiAmJiBwYXJhbXMudXNlck1heCA+PSBjdXJNYXgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIG1pbiDqsJLsl5Ag67OA6rK9IOyXrOycoOqwgCDsnojsnYQg6rK97JqwXG4gICAgICAgICAgICBpZiAoKGlzVW5kZWZpbmVkTWluICYmIHBhcmFtcy51c2VyTWluID4gY3VyTWluKSB8fFxuICAgICAgICAgICAgICAgICghaXNVbmRlZmluZWRNaW4gJiYgb3B0aW9ucy5taW4gPj0gY3VyTWluKSkge1xuICAgICAgICAgICAgICAgIHNjYWxlLm1pbiA9IGN1ck1pbjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gbWF4IOqwkuyXkCDrs4Dqsr0g7Jes7Jyg6rCAIOyeiOydhCDqsr3smrBcbiAgICAgICAgICAgIGlmICgoaXNVbmRlZmluZWRNaW4gJiYgcGFyYW1zLnVzZXJNYXggPCBjdXJNYXgpIHx8XG4gICAgICAgICAgICAgICAgKCFpc1VuZGVmaW5lZE1heCAmJiBvcHRpb25zLm1heCA8PSBjdXJNYXgpKSB7XG4gICAgICAgICAgICAgICAgc2NhbGUubWF4ID0gY3VyTWF4O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBsYWJlbHMgPSBjYWxjdWxhdG9yLm1ha2VMYWJlbHNGcm9tU2NhbGUoc2NhbGUsIHN0ZXApO1xuICAgICAgICB0aWNrSW5mby5sYWJlbHMgPSBsYWJlbHM7XG4gICAgICAgIHRpY2tJbmZvLnN0ZXAgPSBzdGVwO1xuICAgICAgICB0aWNrSW5mby50aWNrQ291bnQgPSBsYWJlbHMubGVuZ3RoO1xuICAgICAgICByZXR1cm4gdGlja0luZm87XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIGRpdmlkZSB0aWNrIHN0ZXAuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHt7c2NhbGU6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9LCB0aWNrQ291bnQ6IG51bWJlciwgc3RlcDogbnVtYmVyLCBsYWJlbHM6IGFycmF5LjxudW1iZXI+fX0gdGlja0luZm8gdGljayBpbmZvXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG9yZ1RpY2tDb3VudCBvcmlnaW5hbCB0aWNrQ291bnRcbiAgICAgKiBAcmV0dXJucyB7e3NjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfSwgdGlja0NvdW50OiBudW1iZXIsIHN0ZXA6IG51bWJlciwgbGFiZWxzOiBhcnJheS48bnVtYmVyPn19IHRpY2sgaW5mb1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2RpdmlkZVRpY2tTdGVwOiBmdW5jdGlvbih0aWNrSW5mbywgb3JnVGlja0NvdW50KSB7XG4gICAgICAgIHZhciBzdGVwID0gdGlja0luZm8uc3RlcCxcbiAgICAgICAgICAgIHNjYWxlID0gdGlja0luZm8uc2NhbGUsXG4gICAgICAgICAgICB0aWNrQ291bnQgPSB0aWNrSW5mby50aWNrQ291bnQ7XG4gICAgICAgIC8vIHN0ZXAgMuydmCDrsLDsiJgg7J2066m07IScIOuzgOqyveuQnCB0aWNrQ291bnTsnZgg65GQ67Cw7IiYLTHsnbQgdGlja0NvdW5067O064ukIG9yZ1RpY2tDb3VudOyZgCDssKjsnbTqsIAg642c64KY6rGw64KYIOqwmeycvOuptCBzdGVw7J2EIOuwmOycvOuhnCDrs4Dqsr3tlZzri6QuXG4gICAgICAgIGlmICgoc3RlcCAlIDIgPT09IDApICYmXG4gICAgICAgICAgICBhYnMob3JnVGlja0NvdW50IC0gKCh0aWNrQ291bnQgKiAyKSAtIDEpKSA8PSBhYnMob3JnVGlja0NvdW50IC0gdGlja0NvdW50KSkge1xuICAgICAgICAgICAgc3RlcCA9IHN0ZXAgLyAyO1xuICAgICAgICAgICAgdGlja0luZm8ubGFiZWxzID0gY2FsY3VsYXRvci5tYWtlTGFiZWxzRnJvbVNjYWxlKHNjYWxlLCBzdGVwKTtcbiAgICAgICAgICAgIHRpY2tJbmZvLnRpY2tDb3VudCA9IHRpY2tJbmZvLmxhYmVscy5sZW5ndGg7XG4gICAgICAgICAgICB0aWNrSW5mby5zdGVwID0gc3RlcDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGlja0luZm87XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgdGljayBpbmZvXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnRpY2tDb3VudCB0aWNrIGNvdW50XG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLm1pbiBzY2FsZSBtaW5cbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubWF4IHNjYWxlIG1heFxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy51c2VyTWluIG1pbmltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnVzZXJNYXggbWF4aW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gcGFyYW1zLmlzTWludXMgd2hldGhlciBzY2FsZSBpcyBtaW51cyBvciBub3RcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMuY2hhcnRUeXBlIGNoYXJ0IHR5cGVcbiAgICAgKiAgICAgIEBwYXJhbSB7e21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19IHBhcmFtcy5vcHRpb25zIGF4aXMgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHt7XG4gICAgICogICAgICBzY2FsZToge21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn0sXG4gICAgICogICAgICB0aWNrQ291bnQ6IG51bWJlcixcbiAgICAgKiAgICAgIHN0ZXA6IG51bWJlcixcbiAgICAgKiAgICAgIGxhYmVsczogYXJyYXkuPG51bWJlcj5cbiAgICAgKiB9fSB0aWNrIGluZm9cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlVGlja0luZm86IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgc2NhbGUgPSBwYXJhbXMuc2NhbGUsXG4gICAgICAgICAgICBzdGVwLCB0aWNrSW5mbztcblxuICAgICAgICAvLyAwMS4g6riw67O4IHNjYWxlIOygleuztOuhnCBzdGVwIOyWu+q4sFxuICAgICAgICBzdGVwID0gY2FsY3VsYXRvci5nZXRTY2FsZVN0ZXAoc2NhbGUsIHBhcmFtcy50aWNrQ291bnQpO1xuXG4gICAgICAgIC8vIDAyLiBzdGVwIOydvOuwmO2ZlCDsi5ztgqTquLAgKGV4OiAwLjMgLS0+IDAuNSwgNyAtLT4gMTApXG4gICAgICAgIHN0ZXAgPSB0aGlzLl9ub3JtYWxpemVTdGVwKHN0ZXApO1xuXG4gICAgICAgIC8vIDAzLiBzY2FsZSDsnbzrsJjtmZQg7Iuc7YKk6riwXG4gICAgICAgIHNjYWxlID0gdGhpcy5fbm9ybWFsaXplU2NhbGUoc2NhbGUsIHN0ZXAsIHBhcmFtcy50aWNrQ291bnQpO1xuXG4gICAgICAgIC8vIDA0LiBsaW5l7LCo7Yq47J2YIOqyveyasCDsgqzsmqnsnpDsnZggbWlu6rCS7J20IHNjYWxl7J2YIG1pbuqwkuqzvCDqsJnsnYQg6rK97JqwLCBtaW7qsJLsnYQgMSBzdGVwIOqwkOyGjCDsi5ztgrRcbiAgICAgICAgc2NhbGUubWluID0gdGhpcy5fYWRkTWluUGFkZGluZyh7XG4gICAgICAgICAgICBtaW46IHNjYWxlLm1pbixcbiAgICAgICAgICAgIHN0ZXA6IHN0ZXAsXG4gICAgICAgICAgICB1c2VyTWluOiBwYXJhbXMudXNlck1pbixcbiAgICAgICAgICAgIG1pbk9wdGlvbjogcGFyYW1zLm9wdGlvbnMubWluLFxuICAgICAgICAgICAgY2hhcnRUeXBlOiBwYXJhbXMuY2hhcnRUeXBlXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIDA1LiDsgqzsmqnsnpDsnZggbWF46rCS7J20IHNjYWVsIG1heOyZgCDqsJnsnYQg6rK97JqwLCBtYXjqsJLsnYQgMSBzdGVwIOymneqwgCDsi5ztgrRcbiAgICAgICAgc2NhbGUubWF4ID0gdGhpcy5fYWRkTWF4UGFkZGluZyh7XG4gICAgICAgICAgICBtYXg6IHNjYWxlLm1heCxcbiAgICAgICAgICAgIHN0ZXA6IHN0ZXAsXG4gICAgICAgICAgICB1c2VyTWF4OiBwYXJhbXMudXNlck1heCxcbiAgICAgICAgICAgIG1heE9wdGlvbjogcGFyYW1zLm9wdGlvbnMubWF4XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIDA2LiBheGlzIHNjYWxl7J20IOyCrOyaqeyekCBtaW4sIG1heOyZgCDqsbDrpqzqsIAg66mAIOqyveyasCDsobDsoIhcbiAgICAgICAgdGlja0luZm8gPSB0aGlzLl9taW5pbWl6ZVRpY2tTY2FsZSh7XG4gICAgICAgICAgICB1c2VyTWluOiBwYXJhbXMudXNlck1pbixcbiAgICAgICAgICAgIHVzZXJNYXg6IHBhcmFtcy51c2VyTWF4LFxuICAgICAgICAgICAgdGlja0luZm86IHtzY2FsZTogc2NhbGUsIHN0ZXA6IHN0ZXAsIHRpY2tDb3VudDogcGFyYW1zLnRpY2tDb3VudH0sXG4gICAgICAgICAgICBvcHRpb25zOiBwYXJhbXMub3B0aW9uc1xuICAgICAgICB9KTtcblxuICAgICAgICB0aWNrSW5mbyA9IHRoaXMuX2RpdmlkZVRpY2tTdGVwKHRpY2tJbmZvLCBwYXJhbXMudGlja0NvdW50KTtcbiAgICAgICAgcmV0dXJuIHRpY2tJbmZvO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgc2NhbGUgbWluIHBhZGRpbmcuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcHJhbXMge251bWJlcn0gcGFyYW1zLm1pbiBzY2FsZSBtaW5cbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMudXNlck1pbiBtaW5pbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5taW5PcHRpb24gbWluIG9wdGlvblxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5zdGVwIHRpY2sgc3RlcFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IHNjYWxlIG1pblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2FkZE1pblBhZGRpbmc6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgbWluID0gcGFyYW1zLm1pbjtcblxuICAgICAgICBpZiAocGFyYW1zLmNoYXJ0VHlwZSAhPT0gY2hhcnRDb25zdC5DSEFSVF9UWVBFX0xJTkUgfHwgIW5lLnV0aWwuaXNVbmRlZmluZWQocGFyYW1zLm1pbk9wdGlvbikpIHtcbiAgICAgICAgICAgIHJldHVybiBtaW47XG4gICAgICAgIH1cbiAgICAgICAgLy8gbm9ybWFsaXpl65CcIHNjYWxlIG1pbuqwkuydtCB1c2VyIG1pbuqwkuqzvCDqsJnsnYQg6rK97JqwIHN0ZXAg6rCQ7IaMXG4gICAgICAgIGlmIChwYXJhbXMubWluID09PSBwYXJhbXMudXNlck1pbikge1xuICAgICAgICAgICAgbWluIC09IHBhcmFtcy5zdGVwO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtaW47XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZCBzY2FsZSBtYXggcGFkZGluZy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwcmFtcyB7bnVtYmVyfSBwYXJhbXMubWF4IHNjYWxlIG1heFxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy51c2VyTWF4IG1heGltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLm1heE9wdGlvbiBtYXggb3B0aW9uXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnN0ZXAgdGljayBzdGVwXG4gICAgICogQHJldHVybnMge251bWJlcn0gc2NhbGUgbWF4XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYWRkTWF4UGFkZGluZzogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBtYXggPSBwYXJhbXMubWF4O1xuICAgICAgICAvLyBub3JtYWxpemXrkJwgc2NhbGUgbWF46rCS7J20IHVzZXIgbWF46rCS6rO8IOqwmeydhCDqsr3smrAgc3RlcCDspp3qsIBcbiAgICAgICAgaWYgKG5lLnV0aWwuaXNVbmRlZmluZWQocGFyYW1zLm1heE9wdGlvbikgJiYgKHBhcmFtcy5tYXggPT09IHBhcmFtcy51c2VyTWF4KSkge1xuICAgICAgICAgICAgbWF4ICs9IHBhcmFtcy5zdGVwO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXg7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG5vcm1hbGl6ZSBtaW4uXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1pbiBvcmlnaW5hbCBtaW5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3RlcCB0aWNrIHN0ZXBcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBub3JtYWxpemVkIG1pblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX25vcm1hbGl6ZU1pbjogZnVuY3Rpb24obWluLCBzdGVwKSB7XG4gICAgICAgIHZhciBtb2QgPSBuZS51dGlsLm1vZChtaW4sIHN0ZXApLFxuICAgICAgICAgICAgbm9ybWFsaXplZDtcblxuICAgICAgICBpZiAobW9kID09PSAwKSB7XG4gICAgICAgICAgICBub3JtYWxpemVkID0gbWluO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbm9ybWFsaXplZCA9IG5lLnV0aWwuc3VidHJhY3Rpb24obWluLCAobWluID49IDAgPyBtb2QgOiBzdGVwICsgbW9kKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5vcm1hbGl6ZWQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2Ugbm9ybWFsaXplZCBtYXguXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHt7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX0gc2NhbGUgc2NhbGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3RlcCB0aWNrIHN0ZXBcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdGlja0NvdW50IHRpY2sgY291bnRcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBub3JtYWxpemVkIG1heFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VOb3JtYWxpemVkTWF4OiBmdW5jdGlvbihzY2FsZSwgc3RlcCwgdGlja0NvdW50KSB7XG4gICAgICAgIHZhciBtaW5NYXhEaWZmID0gbmUudXRpbC5tdWx0aXBsaWNhdGlvbihzdGVwLCB0aWNrQ291bnQgLSAxKSxcbiAgICAgICAgICAgIG5vcm1hbGl6ZWRNYXggPSBuZS51dGlsLmFkZGl0aW9uKHNjYWxlLm1pbiwgbWluTWF4RGlmZiksXG4gICAgICAgICAgICBtYXhEaWZmID0gc2NhbGUubWF4IC0gbm9ybWFsaXplZE1heCxcbiAgICAgICAgICAgIG1vZERpZmYsIGRpdmlkZURpZmY7XG4gICAgICAgIC8vIG5vcm1hbGl6ZeuQnCBtYXjqsJLsnbQg7JuQ656Y7J2YIG1heOqwkiDrs7Tri6Qg7J6R7J2EIOqyveyasCBzdGVw7J2EIOymneqwgOyLnOy8nCDtgbAg6rCS7Jy866GcIOunjOuTpOq4sFxuICAgICAgICBpZiAobWF4RGlmZiA+IDApIHtcbiAgICAgICAgICAgIG1vZERpZmYgPSBtYXhEaWZmICUgc3RlcDtcbiAgICAgICAgICAgIGRpdmlkZURpZmYgPSBNYXRoLmZsb29yKG1heERpZmYgLyBzdGVwKTtcbiAgICAgICAgICAgIG5vcm1hbGl6ZWRNYXggKz0gc3RlcCAqIChtb2REaWZmID4gMCA/IGRpdmlkZURpZmYgKyAxIDogZGl2aWRlRGlmZik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5vcm1hbGl6ZWRNYXg7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG5vcm1hbGl6ZSBzY2FsZS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge3ttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fSBzY2FsZSBiYXNlIHNjYWxlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHN0ZXAgdGljayBzdGVwXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHRpY2tDb3VudCB0aWNrIGNvdW50XG4gICAgICogQHJldHVybnMge3ttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fSBub3JtYWxpemVkIHNjYWxlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbm9ybWFsaXplU2NhbGU6IGZ1bmN0aW9uKHNjYWxlLCBzdGVwLCB0aWNrQ291bnQpIHtcbiAgICAgICAgc2NhbGUubWluID0gdGhpcy5fbm9ybWFsaXplTWluKHNjYWxlLm1pbiwgc3RlcCk7XG4gICAgICAgIHNjYWxlLm1heCA9IHRoaXMuX21ha2VOb3JtYWxpemVkTWF4KHNjYWxlLCBzdGVwLCB0aWNrQ291bnQpO1xuICAgICAgICByZXR1cm4gc2NhbGU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjYW5kaWRhdGVzIGFib3V0IHRpY2sgaW5mby5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubWluIG1pbmltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLm1heCBtYXhpbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48bnVtYmVyPn0gcGFyYW1zLnRpY2tDb3VudHMgdGljayBjb3VudHNcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMuY2hhcnRUeXBlIGNoYXJ0IHR5cGVcbiAgICAgKiBAcGFyYW0ge3ttaW46IG51bWJlciwgbWF4Om51bWJlcn19IG9wdGlvbnMgYXhpcyBvcHRpb25zXG4gICAgICogQHJldHVybnMge2FycmF5fSBjYW5kaWRhdGVzIGFib3V0IHRpY2sgaW5mb1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldENhbmRpZGF0ZVRpY2tJbmZvczogZnVuY3Rpb24ocGFyYW1zLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciB1c2VyTWluID0gcGFyYW1zLm1pbixcbiAgICAgICAgICAgIHVzZXJNYXggPSBwYXJhbXMubWF4LFxuICAgICAgICAgICAgbWluID0gcGFyYW1zLm1pbixcbiAgICAgICAgICAgIG1heCA9IHBhcmFtcy5tYXgsXG4gICAgICAgICAgICBzY2FsZSwgY2FuZGlkYXRlcztcblxuICAgICAgICAvLyBtaW4sIG1heOunjOycvOuhnCDquLDrs7ggc2NhbGUg7Ja76riwXG4gICAgICAgIHNjYWxlID0gdGhpcy5fbWFrZUJhc2VTY2FsZShtaW4sIG1heCwgb3B0aW9ucyk7XG5cbiAgICAgICAgY2FuZGlkYXRlcyA9IG5lLnV0aWwubWFwKHBhcmFtcy50aWNrQ291bnRzLCBmdW5jdGlvbih0aWNrQ291bnQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9tYWtlVGlja0luZm8oe1xuICAgICAgICAgICAgICAgIHRpY2tDb3VudDogdGlja0NvdW50LFxuICAgICAgICAgICAgICAgIHNjYWxlOiBuZS51dGlsLmV4dGVuZCh7fSwgc2NhbGUpLFxuICAgICAgICAgICAgICAgIHVzZXJNaW46IHVzZXJNaW4sXG4gICAgICAgICAgICAgICAgdXNlck1heDogdXNlck1heCxcbiAgICAgICAgICAgICAgICBjaGFydFR5cGU6IHBhcmFtcy5jaGFydFR5cGUsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgICByZXR1cm4gY2FuZGlkYXRlcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBiYXNlIHNjYWxlXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1pbiBtaW5pbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtYXggbWF4aW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiBAcGFyYW0ge3ttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fSBvcHRpb25zIGF4aXMgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHt7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX0gYmFzZSBzY2FsZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VCYXNlU2NhbGU6IGZ1bmN0aW9uKG1pbiwgbWF4LCBvcHRpb25zKSB7XG4gICAgICAgIHZhciBpc01pbnVzID0gZmFsc2UsXG4gICAgICAgICAgICB0bXBNaW4sIHNjYWxlO1xuXG4gICAgICAgIGlmIChtaW4gPCAwICYmIG1heCA8PSAwKSB7XG4gICAgICAgICAgICBpc01pbnVzID0gdHJ1ZTtcbiAgICAgICAgICAgIHRtcE1pbiA9IG1pbjtcbiAgICAgICAgICAgIG1pbiA9IC1tYXg7XG4gICAgICAgICAgICBtYXggPSAtdG1wTWluO1xuICAgICAgICB9XG5cbiAgICAgICAgc2NhbGUgPSBjYWxjdWxhdG9yLmNhbGN1bGF0ZVNjYWxlKG1pbiwgbWF4KTtcblxuICAgICAgICBpZiAoaXNNaW51cykge1xuICAgICAgICAgICAgdG1wTWluID0gc2NhbGUubWluO1xuICAgICAgICAgICAgc2NhbGUubWluID0gLXNjYWxlLm1heDtcbiAgICAgICAgICAgIHNjYWxlLm1heCA9IC10bXBNaW47XG4gICAgICAgIH1cblxuICAgICAgICBzY2FsZS5taW4gPSBvcHRpb25zLm1pbiB8fCBzY2FsZS5taW47XG4gICAgICAgIHNjYWxlLm1heCA9IG9wdGlvbnMubWF4IHx8IHNjYWxlLm1heDtcblxuICAgICAgICByZXR1cm4gc2NhbGU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZvcm1hdCBsYWJlbHMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gbGFiZWxzIHRhcmdldCBsYWJlbHNcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uW119IGZvcm1hdEZ1bmN0aW9ucyBmb3JtYXQgZnVuY3Rpb25zXG4gICAgICogQHJldHVybnMge3N0cmluZ1tdfSBmb3JtYXR0ZWQgbGFiZWxzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZm9ybWF0TGFiZWxzOiBmdW5jdGlvbihsYWJlbHMsIGZvcm1hdEZ1bmN0aW9ucykge1xuICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICBpZiAoIWZvcm1hdEZ1bmN0aW9ucyB8fCAhZm9ybWF0RnVuY3Rpb25zLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIGxhYmVscztcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQgPSBuZS51dGlsLm1hcChsYWJlbHMsIGZ1bmN0aW9uKGxhYmVsKSB7XG4gICAgICAgICAgICB2YXIgZm5zID0gY29uY2F0LmFwcGx5KFtsYWJlbF0sIGZvcm1hdEZ1bmN0aW9ucyk7XG4gICAgICAgICAgICByZXR1cm4gbmUudXRpbC5yZWR1Y2UoZm5zLCBmdW5jdGlvbihzdG9yZWQsIGZuKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZuKHN0b3JlZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBheGlzRGF0YU1ha2VyO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEJvdW5kcyBtYWtlci5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGNhbGN1bGF0b3IgPSByZXF1aXJlKCcuL2NhbGN1bGF0b3IuanMnKSxcbiAgICByZW5kZXJVdGlsID0gcmVxdWlyZSgnLi9yZW5kZXJVdGlsLmpzJyk7XG5cbnZhciBDSEFSVF9QQURESU5HID0gMTAsXG4gICAgVElUTEVfQUREX1BBRERJTkcgPSAyMCxcbiAgICBMRUdFTkRfQVJFQV9QQURESU5HID0gMTAsXG4gICAgTEVHRU5EX1JFQ1RfV0lEVEggPSAxMixcbiAgICBMRUdFTkRfTEFCRUxfUEFERElOR19MRUZUID0gNSxcbiAgICBBWElTX0xBQkVMX1BBRERJTkcgPSA3LFxuICAgIEhJRERFTl9XSURUSCA9IDE7XG5cbnZhciBjb25jYXQgPSBBcnJheS5wcm90b3R5cGUuY29uY2F0O1xuXG4vKipcbiAqIEJvdW5kcyBtYWtlci5cbiAqIEBtb2R1bGUgYm91bmRzTWFrZXJcbiAqL1xudmFyIGJvdW5kc01ha2VyID0ge1xuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYm91bmRzIGFib3V0IGNoYXJ0IGNvbXBvbmVudHMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpib3VuZHNNYWtlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5jb252ZXJ0RGF0YSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBjaGFydCB0aGVtZVxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaXNWZXJ0aWNhbCB3aGV0aGVyIHZlcnRpY2FsIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5vcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7e1xuICAgICAqICAgcGxvdDoge1xuICAgICAqICAgICBkaW1lbnNpb246IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn0sXG4gICAgICogICAgIHBvc2l0aW9uOiB7dG9wOiBudW1iZXIsIHJpZ2h0OiBudW1iZXJ9XG4gICAgICogICB9LFxuICAgICAqICAgeUF4aXM6IHtcbiAgICAgKiAgICAgZGltZW5zaW9uOiB7d2lkdGg6IChudW1iZXIpLCBoZWlnaHQ6IG51bWJlcn0sXG4gICAgICogICAgIHBvc2l0aW9uOiB7dG9wOiBudW1iZXJ9XG4gICAgICogICB9LFxuICAgICAqICAgeEF4aXM6IHtcbiAgICAgKiAgICAgZGltZW5zaW9uOiB7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiAobnVtYmVyKX0sXG4gICAgICogICAgIHBvc2l0aW9uOiB7cmlnaHQ6IG51bWJlcn1cbiAgICAgKiAgIH0sXG4gICAgICogICBzZXJpZXM6IHtcbiAgICAgKiAgICAgZGltZW5zaW9uOiB7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9LFxuICAgICAqICAgICBwb3NpdGlvbjoge3RvcDogbnVtYmVyLCByaWdodDogbnVtYmVyfVxuICAgICAqICAgfSxcbiAgICAgKiAgIGxlZ2VuZDoge1xuICAgICAqICAgICBwb3NpdGlvbjoge3RvcDogbnVtYmVyfVxuICAgICAqICAgfSxcbiAgICAgKiAgIHRvb2x0aXA6IHtcbiAgICAgKiAgICAgZGltZW5zaW9uOiB7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9LFxuICAgICAqICAgICBwb3NpdGlvbjoge3RvcDogbnVtYmVyLCBsZWZ0OiBudW1iZXJ9XG4gICAgICogICB9XG4gICAgICogfX0gYm91bmRzXG4gICAgICovXG4gICAgbWFrZTogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBkaW1lbnNpb25zID0gdGhpcy5fZ2V0Q29tcG9uZW50c0RpbWVuc2lvbnMocGFyYW1zKSxcbiAgICAgICAgICAgIHlBeGlzV2lkdGggPSBkaW1lbnNpb25zLnlBeGlzLndpZHRoLFxuICAgICAgICAgICAgdG9wID0gZGltZW5zaW9ucy50aXRsZS5oZWlnaHQgKyBDSEFSVF9QQURESU5HLFxuICAgICAgICAgICAgcmlnaHQgPSBkaW1lbnNpb25zLmxlZ2VuZC53aWR0aCArIGRpbWVuc2lvbnMueXJBeGlzLndpZHRoICsgQ0hBUlRfUEFERElORyxcbiAgICAgICAgICAgIGF4ZXNCb3VuZHMgPSB0aGlzLl9tYWtlQXhlc0JvdW5kcyh7XG4gICAgICAgICAgICAgICAgaGFzQXhlczogcGFyYW1zLmhhc0F4ZXMsXG4gICAgICAgICAgICAgICAgeUF4aXNDaGFydFR5cGVzOiBwYXJhbXMueUF4aXNDaGFydFR5cGVzLFxuICAgICAgICAgICAgICAgIGRpbWVuc2lvbnM6IGRpbWVuc2lvbnMsXG4gICAgICAgICAgICAgICAgdG9wOiB0b3AsXG4gICAgICAgICAgICAgICAgcmlnaHQ6IHJpZ2h0XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGJvdW5kcyA9IG5lLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICBjaGFydDoge1xuICAgICAgICAgICAgICAgICAgICBkaW1lbnNpb246IGRpbWVuc2lvbnMuY2hhcnRcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNlcmllczoge1xuICAgICAgICAgICAgICAgICAgICBkaW1lbnNpb246IGRpbWVuc2lvbnMuc2VyaWVzLFxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiB0b3AsXG4gICAgICAgICAgICAgICAgICAgICAgICByaWdodDogcmlnaHRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbGVnZW5kOiB7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3A6IGRpbWVuc2lvbnMudGl0bGUuaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogeUF4aXNXaWR0aCArIGRpbWVuc2lvbnMucGxvdC53aWR0aCArIGRpbWVuc2lvbnMueXJBeGlzLndpZHRoICsgQ0hBUlRfUEFERElOR1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0b29sdGlwOiB7XG4gICAgICAgICAgICAgICAgICAgIGRpbWVuc2lvbjogZGltZW5zaW9ucy50b29sdGlwLFxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiB0b3AsXG4gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiB5QXhpc1dpZHRoICsgQ0hBUlRfUEFERElOR1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgYXhlc0JvdW5kcyk7XG4gICAgICAgIHJldHVybiBib3VuZHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBtYXggbGFiZWwgb2YgdmFsdWUgYXhpcy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmJvdW5kc01ha2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGNvbnZlcnREYXRhIGNvbnZlcnQgZGF0YVxuICAgICAqIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGNoYXJ0VHlwZXMgY2hhcnQgdHlwZXNcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggY2hhcnQgdHlwZSBpbmRleFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ8c3RyaW5nfSBtYXggbGFiZWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRWYWx1ZUF4aXNNYXhMYWJlbDogZnVuY3Rpb24oY29udmVydERhdGEsIGNoYXJ0VHlwZXMsIGluZGV4KSB7XG4gICAgICAgIHZhciBjaGFydFR5cGUgPSBjaGFydFR5cGVzICYmIGNoYXJ0VHlwZXNbaW5kZXggfHwgMF0gfHwgJycsXG4gICAgICAgICAgICB2YWx1ZXMgPSBjaGFydFR5cGUgJiYgY29udmVydERhdGEudmFsdWVzW2NoYXJ0VHlwZV0gPyBjb252ZXJ0RGF0YS52YWx1ZXNbY2hhcnRUeXBlXSA6IGNvbnZlcnREYXRhLmpvaW5WYWx1ZXMsXG4gICAgICAgICAgICBmb3JtYXRGdW5jdGlvbnMgPSBjb252ZXJ0RGF0YS5mb3JtYXRGdW5jdGlvbnMsXG4gICAgICAgICAgICBmbGF0dGVuVmFsdWVzID0gY29uY2F0LmFwcGx5KFtdLCB2YWx1ZXMpLFxuICAgICAgICAgICAgbWluID0gbmUudXRpbC5taW4oZmxhdHRlblZhbHVlcyksXG4gICAgICAgICAgICBtYXggPSBuZS51dGlsLm1heChmbGF0dGVuVmFsdWVzKSxcbiAgICAgICAgICAgIHNjYWxlID0gY2FsY3VsYXRvci5jYWxjdWxhdGVTY2FsZShtaW4sIG1heCksXG4gICAgICAgICAgICBtaW5MYWJlbCA9IGNhbGN1bGF0b3Iubm9ybWFsaXplQXhpc051bWJlcihzY2FsZS5taW4pLFxuICAgICAgICAgICAgbWF4TGFiZWwgPSBjYWxjdWxhdG9yLm5vcm1hbGl6ZUF4aXNOdW1iZXIoc2NhbGUubWF4KSxcbiAgICAgICAgICAgIGZucyA9IGZvcm1hdEZ1bmN0aW9ucyAmJiBmb3JtYXRGdW5jdGlvbnMuc2xpY2UoKSB8fCBbXTtcbiAgICAgICAgbWF4TGFiZWwgPSAobWluTGFiZWwgKyAnJykubGVuZ3RoID4gKG1heExhYmVsICsgJycpLmxlbmd0aCA/IG1pbkxhYmVsIDogbWF4TGFiZWw7XG4gICAgICAgIGZucy51bnNoaWZ0KG1heExhYmVsKTtcbiAgICAgICAgbWF4TGFiZWwgPSBuZS51dGlsLnJlZHVjZShmbnMsIGZ1bmN0aW9uKHN0b3JlZCwgZm4pIHtcbiAgICAgICAgICAgIHJldHVybiBmbihzdG9yZWQpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIG1heExhYmVsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgUmVuZGVyZWQgTGFiZWxzIE1heCBTaXplKHdpZHRoIG9yIGhlaWdodCkuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpib3VuZHNNYWtlclxuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IGxhYmVscyBsYWJlbHNcbiAgICAgKiBAcGFyYW0ge3tmb250U2l6ZTogbnVtYmVyLCBmb250RmFtaWx5OiBzdHJpbmcsIGNvbG9yOiBzdHJpbmd9fSB0aGVtZSBsYWJlbCB0aGVtZVxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGl0ZXJhdGVlIGl0ZXJhdGVlXG4gICAgICogQHJldHVybnMge251bWJlcn0gbWF4IHNpemUgKHdpZHRoIG9yIGhlaWdodClcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRSZW5kZXJlZExhYmVsc01heFNpemU6IGZ1bmN0aW9uKGxhYmVscywgdGhlbWUsIGl0ZXJhdGVlKSB7XG4gICAgICAgIHZhciBzaXplcyA9IG5lLnV0aWwubWFwKGxhYmVscywgZnVuY3Rpb24obGFiZWwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaXRlcmF0ZWUobGFiZWwsIHRoZW1lKTtcbiAgICAgICAgICAgIH0sIHRoaXMpLFxuICAgICAgICAgICAgbWF4U2l6ZSA9IG5lLnV0aWwubWF4KHNpemVzKTtcbiAgICAgICAgcmV0dXJuIG1heFNpemU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCByZW5kZXJlZCBsYWJlbHMgbWF4IHdpZHRoLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Ym91bmRzTWFrZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBsYWJlbHMgbGFiZWxzXG4gICAgICogQHBhcmFtIHt7Zm9udFNpemU6IG51bWJlciwgZm9udEZhbWlseTogc3RyaW5nLCBjb2xvcjogc3RyaW5nfX0gdGhlbWUgbGFiZWwgdGhlbWVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBtYXggd2lkdGhcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRSZW5kZXJlZExhYmVsc01heFdpZHRoOiBmdW5jdGlvbihsYWJlbHMsIHRoZW1lKSB7XG4gICAgICAgIHZhciBpdGVyYXRlZSA9IG5lLnV0aWwuYmluZChyZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxXaWR0aCwgcmVuZGVyVXRpbCksXG4gICAgICAgICAgICBtYXhXaWR0aCA9IHRoaXMuX2dldFJlbmRlcmVkTGFiZWxzTWF4U2l6ZShsYWJlbHMsIHRoZW1lLCBpdGVyYXRlZSk7XG4gICAgICAgIHJldHVybiBtYXhXaWR0aDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHJlbmRlcmVkIGxhYmVscyBtYXggaGVpZ2h0LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Ym91bmRzTWFrZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBsYWJlbHMgbGFiZWxzXG4gICAgICogQHBhcmFtIHt7Zm9udFNpemU6IG51bWJlciwgZm9udEZhbWlseTogc3RyaW5nLCBjb2xvcjogc3RyaW5nfX0gdGhlbWUgbGFiZWwgdGhlbWVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBtYXggaGVpZ2h0XG4gICAgICovXG4gICAgX2dldFJlbmRlcmVkTGFiZWxzTWF4SGVpZ2h0OiBmdW5jdGlvbihsYWJlbHMsIHRoZW1lKSB7XG4gICAgICAgIHZhciBpdGVyYXRlZSA9IG5lLnV0aWwuYmluZChyZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxIZWlnaHQsIHJlbmRlclV0aWwpLFxuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5fZ2V0UmVuZGVyZWRMYWJlbHNNYXhTaXplKGxhYmVscywgdGhlbWUsIGl0ZXJhdGVlKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHdpZHRoIG9mIHZlcnRpY2FsIGF4aXMgYXJlYS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmJvdW5kc01ha2VyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRpdGxlIGF4aXMgdGl0bGUsXG4gICAgICogQHBhcmFtIHthcnJheS48c3RyaW5nPn0gbGFiZWxzIGF4aXMgbGFiZWxzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIGF4aXMgdGhlbWVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSB3aWR0aFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFZlcnRpY2FsQXhpc1dpZHRoOiBmdW5jdGlvbih0aXRsZSwgbGFiZWxzLCB0aGVtZSkge1xuICAgICAgICB2YXIgdGl0bGVBcmVhV2lkdGggPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxIZWlnaHQodGl0bGUsIHRoZW1lLnRpdGxlKSArIFRJVExFX0FERF9QQURESU5HLFxuICAgICAgICAgICAgd2lkdGggPSB0aGlzLl9nZXRSZW5kZXJlZExhYmVsc01heFdpZHRoKGxhYmVscywgdGhlbWUubGFiZWwpICsgdGl0bGVBcmVhV2lkdGggKyBBWElTX0xBQkVMX1BBRERJTkc7XG4gICAgICAgIHJldHVybiB3aWR0aDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGhlaWdodCBvZiBob3Jpem9udGFsIGF4aXMgYXJlYS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmJvdW5kc01ha2VyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRpdGxlIGF4aXMgdGl0bGUsXG4gICAgICogQHBhcmFtIHthcnJheS48c3RyaW5nPn0gbGFiZWxzIGF4aXMgbGFiZWxzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIGF4aXMgdGhlbWVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBoZWlnaHRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRIb3Jpem9udGFsQXhpc0hlaWdodDogZnVuY3Rpb24odGl0bGUsIGxhYmVscywgdGhlbWUpIHtcbiAgICAgICAgdmFyIHRpdGxlQXJlYUhlaWdodCA9IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodCh0aXRsZSwgdGhlbWUudGl0bGUpICsgVElUTEVfQUREX1BBRERJTkcsXG4gICAgICAgICAgICBoZWlnaHQgPSB0aGlzLl9nZXRSZW5kZXJlZExhYmVsc01heEhlaWdodChsYWJlbHMsIHRoZW1lLmxhYmVsKSArIHRpdGxlQXJlYUhlaWdodDtcbiAgICAgICAgcmV0dXJuIGhlaWdodDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHdpZHRoIGFib3V0IHkgcmlnaHQgYXhpcy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmJvdW5kc01ha2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBwYXJhbXMueUF4aXNDaGFydFR5cGVzIGNoYXJ0IHR5cGVzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIGNoYXJ0IHRoZW1lXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IHkgcmlnaHQgYXhpcyB3aWR0aFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFlSQXhpc1dpZHRoOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIHlBeGlzQ2hhcnRUeXBlcyA9IHBhcmFtcy55QXhpc0NoYXJ0VHlwZXMgfHwgW10sXG4gICAgICAgICAgICByaWdodFlBeGlzV2lkdGggPSAwLFxuICAgICAgICAgICAgeUF4aXNUaGVtZXMsIHlBeGlzVGhlbWUsIHlBeGlzT3B0aW9ucywgaW5kZXgsIGxhYmVscywgdGl0bGU7XG4gICAgICAgIGluZGV4ID0geUF4aXNDaGFydFR5cGVzLmxlbmd0aCAtIDE7XG4gICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgICB5QXhpc1RoZW1lcyA9IFtdLmNvbmNhdChwYXJhbXMudGhlbWUueUF4aXMpO1xuICAgICAgICAgICAgeUF4aXNPcHRpb25zID0gW10uY29uY2F0KHBhcmFtcy5vcHRpb25zLnlBeGlzKTtcbiAgICAgICAgICAgIHRpdGxlID0geUF4aXNPcHRpb25zW2luZGV4XSAmJiB5QXhpc09wdGlvbnNbaW5kZXhdLnRpdGxlO1xuICAgICAgICAgICAgbGFiZWxzID0gW3RoaXMuX2dldFZhbHVlQXhpc01heExhYmVsKHBhcmFtcy5jb252ZXJ0RGF0YSwgeUF4aXNDaGFydFR5cGVzLCBpbmRleCldO1xuICAgICAgICAgICAgeUF4aXNUaGVtZSA9IHlBeGlzVGhlbWVzLmxlbmd0aCA9PT0gMSA/IHlBeGlzVGhlbWVzWzBdIDogeUF4aXNUaGVtZXNbaW5kZXhdO1xuICAgICAgICAgICAgcmlnaHRZQXhpc1dpZHRoID0gdGhpcy5fZ2V0VmVydGljYWxBeGlzV2lkdGgodGl0bGUsIGxhYmVscywgeUF4aXNUaGVtZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJpZ2h0WUF4aXNXaWR0aDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBheGVzIGRpbWVuc2lvbi5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmJvdW5kc01ha2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmNvbnZlcnREYXRhIGNvbnZlcnRlZCBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIGNoYXJ0IHRoZW1lXG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5pc1ZlcnRpY2FsIHdoZXRoZXIgdmVydGljYWwgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHt7XG4gICAgICogICAgICB5QXhpczoge3dpZHRoOiBudW1iZXJ9LFxuICAgICAqICAgICAgeXJBeGlzOiB7d2lkdGg6IG51bWJlcn0sXG4gICAgICogICAgICB4QXhpczoge2hlaWdodDogbnVtYmVyfVxuICAgICAqIH19IGF4ZXMgZGltZW5zaW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUF4ZXNEaW1lbnNpb246IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgdGhlbWUsIG9wdGlvbnMsIGNvbnZlcnREYXRhLCB5QXhpc0NoYXJ0VHlwZXMsXG4gICAgICAgICAgICB5QXhpc1RpdGxlLCB4QXhpc1RpdGxlLCBtYXhMYWJlbCwgdkxhYmVscywgaExhYmVscyxcbiAgICAgICAgICAgIHlBeGlzV2lkdGgsIHhBeGlzSGVpZ2h0LCB5ckF4aXNXaWR0aDtcbiAgICAgICAgaWYgKCFwYXJhbXMuaGFzQXhlcykge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB5QXhpczoge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogMFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgeXJBeGlzOiB7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAwXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB4QXhpczoge1xuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IDBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgdGhlbWUgPSBwYXJhbXMudGhlbWU7XG4gICAgICAgIG9wdGlvbnMgPSBwYXJhbXMub3B0aW9ucztcbiAgICAgICAgY29udmVydERhdGEgPSBwYXJhbXMuY29udmVydERhdGE7XG4gICAgICAgIHlBeGlzQ2hhcnRUeXBlcyA9IHBhcmFtcy55QXhpc0NoYXJ0VHlwZXM7XG4gICAgICAgIHlBeGlzVGl0bGUgPSBvcHRpb25zLnlBeGlzICYmIG9wdGlvbnMueUF4aXMudGl0bGU7XG4gICAgICAgIHhBeGlzVGl0bGUgPSBvcHRpb25zLnhBeGlzICYmIG9wdGlvbnMueEF4aXMudGl0bGU7XG4gICAgICAgIG1heExhYmVsID0gdGhpcy5fZ2V0VmFsdWVBeGlzTWF4TGFiZWwoY29udmVydERhdGEsIHlBeGlzQ2hhcnRUeXBlcyk7XG4gICAgICAgIHZMYWJlbHMgPSBwYXJhbXMuaXNWZXJ0aWNhbCA/IFttYXhMYWJlbF0gOiBjb252ZXJ0RGF0YS5sYWJlbHM7XG4gICAgICAgIGhMYWJlbHMgPSBwYXJhbXMuaXNWZXJ0aWNhbCA/IGNvbnZlcnREYXRhLmxhYmVscyA6IFttYXhMYWJlbF07XG4gICAgICAgIHlBeGlzV2lkdGggPSB0aGlzLl9nZXRWZXJ0aWNhbEF4aXNXaWR0aCh5QXhpc1RpdGxlLCB2TGFiZWxzLCB0aGVtZS55QXhpcyk7XG4gICAgICAgIHhBeGlzSGVpZ2h0ID0gdGhpcy5fZ2V0SG9yaXpvbnRhbEF4aXNIZWlnaHQoeEF4aXNUaXRsZSwgaExhYmVscywgdGhlbWUueEF4aXMpO1xuICAgICAgICB5ckF4aXNXaWR0aCA9IHRoaXMuX2dldFlSQXhpc1dpZHRoKHtcbiAgICAgICAgICAgIGNvbnZlcnREYXRhOiBjb252ZXJ0RGF0YSxcbiAgICAgICAgICAgIHlBeGlzQ2hhcnRUeXBlczogeUF4aXNDaGFydFR5cGVzLFxuICAgICAgICAgICAgdGhlbWU6IHRoZW1lLFxuICAgICAgICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeUF4aXM6IHtcbiAgICAgICAgICAgICAgICB3aWR0aDogeUF4aXNXaWR0aFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHlyQXhpczoge1xuICAgICAgICAgICAgICAgIHdpZHRoOiB5ckF4aXNXaWR0aFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHhBeGlzOiB7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiB4QXhpc0hlaWdodFxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgd2lkdGggb2YgbGVnZW5kIGFyZWEuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpib3VuZHNNYWtlclxuICAgICAqIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGpvaW5MZWdlbmRMYWJlbHMgbGVnZW5kIGxhYmVsc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBsYWJlbFRoZW1lIGxhYmVsIHRoZW1lXG4gICAgICogQHJldHVybnMge251bWJlcn0gd2lkdGhcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRMZWdlbmRBcmVhV2lkdGg6IGZ1bmN0aW9uKGpvaW5MZWdlbmRMYWJlbHMsIGxhYmVsVGhlbWUpIHtcbiAgICAgICAgdmFyIGxlZ2VuZExhYmVscyA9IG5lLnV0aWwubWFwKGpvaW5MZWdlbmRMYWJlbHMsIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaXRlbS5sYWJlbDtcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgbWF4TGFiZWxXaWR0aCA9IHRoaXMuX2dldFJlbmRlcmVkTGFiZWxzTWF4V2lkdGgobGVnZW5kTGFiZWxzLCBsYWJlbFRoZW1lKSxcbiAgICAgICAgICAgIGxlZ2VuZFdpZHRoID0gbWF4TGFiZWxXaWR0aCArIExFR0VORF9SRUNUX1dJRFRIICtcbiAgICAgICAgICAgICAgICBMRUdFTkRfTEFCRUxfUEFERElOR19MRUZUICsgKExFR0VORF9BUkVBX1BBRERJTkcgKiAyKTtcbiAgICAgICAgcmV0dXJuIGxlZ2VuZFdpZHRoO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHNlcmllcyBkaW1lbnNpb24uXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpib3VuZHNNYWtlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBwYXJhbXMuY2hhcnREaW1lbnNpb24gY2hhcnQgZGltZW5zaW9uXG4gICAgICogICAgICBAcGFyYW0ge3tcbiAgICAgKiAgICAgICAgICB5QXhpczoge3dpZHRoOiBudW1iZXIsIGhlaWdodDpudW1iZXJ9LFxuICAgICAqICAgICAgICAgIHhBeGlzOiB7d2lkdGg6IG51bWJlciwgaGVpZ2h0Om51bWJlcn0sXG4gICAgICogICAgICAgICAgeXJBeGlzOiB7d2lkdGg6IG51bWJlciwgaGVpZ2h0Om51bWJlcn1cbiAgICAgKiAgICAgIH19IHBhcmFtcy5heGVzRGltZW5zaW9uIGF4ZXMgZGltZW5zaW9uXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmxlZ2VuZFdpZHRoIGxlZ2VuZCB3aWR0aFxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy50aXRsZUhlaWdodCB0aXRsZSBoZWlnaHRcbiAgICAgKiBAcmV0dXJucyB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gc2VyaWVzIGRpbWVuc2lvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VTZXJpZXNEaW1lbnNpb246IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgYXhlc0RpbWVuc2lvbiA9IHBhcmFtcy5heGVzRGltZW5zaW9uLFxuICAgICAgICAgICAgcmlnaHRBcmVhV2lkdGggPSBwYXJhbXMubGVnZW5kV2lkdGggKyBheGVzRGltZW5zaW9uLnlyQXhpcy53aWR0aCxcbiAgICAgICAgICAgIHdpZHRoID0gcGFyYW1zLmNoYXJ0RGltZW5zaW9uLndpZHRoIC0gKENIQVJUX1BBRERJTkcgKiAyKSAtIGF4ZXNEaW1lbnNpb24ueUF4aXMud2lkdGggLSByaWdodEFyZWFXaWR0aCxcbiAgICAgICAgICAgIGhlaWdodCA9IHBhcmFtcy5jaGFydERpbWVuc2lvbi5oZWlnaHQgLSAoQ0hBUlRfUEFERElORyAqIDIpIC0gcGFyYW1zLnRpdGxlSGVpZ2h0IC0gYXhlc0RpbWVuc2lvbi54QXhpcy5oZWlnaHQ7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB3aWR0aDogd2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IGhlaWdodFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgY29tcG9uZW50cyBkaW1lbnNpb25cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmJvdW5kc01ha2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmNvbnZlcnREYXRhIGNvbnZlcnRlZCBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIGNoYXJ0IHRoZW1lXG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5pc1ZlcnRpY2FsIHdoZXRoZXIgdmVydGljYWwgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IGNvbXBvbmVudHMgZGltZW5zaW9uc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldENvbXBvbmVudHNEaW1lbnNpb25zOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIHRoZW1lID0gcGFyYW1zLnRoZW1lLFxuICAgICAgICAgICAgb3B0aW9ucyA9IHBhcmFtcy5vcHRpb25zLFxuICAgICAgICAgICAgY29udmVydERhdGEgPSBwYXJhbXMuY29udmVydERhdGEsXG4gICAgICAgICAgICBjaGFydE9wdGlvbnMgPSBvcHRpb25zLmNoYXJ0IHx8IHt9LFxuICAgICAgICAgICAgY2hhcnREaW1lbnNpb24gPSB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IGNoYXJ0T3B0aW9ucy53aWR0aCB8fCA1MDAsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBjaGFydE9wdGlvbnMuaGVpZ2h0IHx8IDQwMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGF4ZXNEaW1lbnNpb24sIHRpdGxlSGVpZ2h0LCBsZWdlbmRXaWR0aCwgc2VyaWVzRGltZW5zaW9uLCBkaW1lbnNpb25zO1xuXG4gICAgICAgIGF4ZXNEaW1lbnNpb24gPSB0aGlzLl9tYWtlQXhlc0RpbWVuc2lvbihwYXJhbXMpO1xuICAgICAgICB0aXRsZUhlaWdodCA9IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodChjaGFydE9wdGlvbnMudGl0bGUsIHRoZW1lLnRpdGxlKSArIFRJVExFX0FERF9QQURESU5HO1xuICAgICAgICBsZWdlbmRXaWR0aCA9IHRoaXMuX2dldExlZ2VuZEFyZWFXaWR0aChjb252ZXJ0RGF0YS5qb2luTGVnZW5kTGFiZWxzLCB0aGVtZS5sZWdlbmQubGFiZWwpO1xuICAgICAgICBzZXJpZXNEaW1lbnNpb24gPSB0aGlzLl9tYWtlU2VyaWVzRGltZW5zaW9uKHtcbiAgICAgICAgICAgIGNoYXJ0RGltZW5zaW9uOiBjaGFydERpbWVuc2lvbixcbiAgICAgICAgICAgIGF4ZXNEaW1lbnNpb246IGF4ZXNEaW1lbnNpb24sXG4gICAgICAgICAgICBsZWdlbmRXaWR0aDogbGVnZW5kV2lkdGgsXG4gICAgICAgICAgICB0aXRsZUhlaWdodDogdGl0bGVIZWlnaHRcbiAgICAgICAgfSk7XG4gICAgICAgIGRpbWVuc2lvbnMgPSBuZS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICBjaGFydDogY2hhcnREaW1lbnNpb24sXG4gICAgICAgICAgICB0aXRsZToge1xuICAgICAgICAgICAgICAgIGhlaWdodDogdGl0bGVIZWlnaHRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwbG90OiBzZXJpZXNEaW1lbnNpb24sXG4gICAgICAgICAgICBzZXJpZXM6IHNlcmllc0RpbWVuc2lvbixcbiAgICAgICAgICAgIGxlZ2VuZDoge1xuICAgICAgICAgICAgICAgIHdpZHRoOiBsZWdlbmRXaWR0aFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRvb2x0aXA6IHNlcmllc0RpbWVuc2lvblxuICAgICAgICB9LCBheGVzRGltZW5zaW9uKTtcbiAgICAgICAgcmV0dXJuIGRpbWVuc2lvbnM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYXhlcyBib3VuZHMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpib3VuZHNNYWtlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaGFzQXhlcyB3aGV0aGVyIGhhcyBheGVkIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48c3RyaW5nPn0gcGFyYW1zLnlBeGlzQ2hhcnRUeXBlcyB5IGF4aXMgY2hhcnQgdHlwZXNcbiAgICAgKiAgICAgIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gcGFyYW1zLmRpbWVuc2lvbiBjaGFydCBkaW1lbnNpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMudG9wIHRvcCBwb3NpdGlvblxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5yaWdodCByaWdodCBwb3NpdGlvblxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IGF4ZXMgYm91bmRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUF4ZXNCb3VuZHM6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgYm91bmRzLCBkaW1lbnNpb25zLCB5QXhpc0NoYXJ0VHlwZXMsIHRvcCwgcmlnaHQ7XG5cbiAgICAgICAgaWYgKCFwYXJhbXMuaGFzQXhlcykge1xuICAgICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICB9XG5cbiAgICAgICAgZGltZW5zaW9ucyA9IHBhcmFtcy5kaW1lbnNpb25zO1xuICAgICAgICB5QXhpc0NoYXJ0VHlwZXMgPSBwYXJhbXMueUF4aXNDaGFydFR5cGVzO1xuICAgICAgICB0b3AgPSBwYXJhbXMudG9wO1xuICAgICAgICByaWdodCA9IHBhcmFtcy5yaWdodDtcbiAgICAgICAgYm91bmRzID0ge1xuICAgICAgICAgICAgcGxvdDoge1xuICAgICAgICAgICAgICAgIGRpbWVuc2lvbjogZGltZW5zaW9ucy5wbG90LFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgIHRvcDogdG9wLFxuICAgICAgICAgICAgICAgICAgICByaWdodDogcmlnaHRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgeUF4aXM6IHtcbiAgICAgICAgICAgICAgICBkaW1lbnNpb246IHtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGRpbWVuc2lvbnMueUF4aXMud2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogZGltZW5zaW9ucy5wbG90LmhlaWdodFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgdG9wOiB0b3AsXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IENIQVJUX1BBRERJTkcgKyBISURERU5fV0lEVEhcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgeEF4aXM6IHtcbiAgICAgICAgICAgICAgICBkaW1lbnNpb246IHtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGRpbWVuc2lvbnMucGxvdC53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBkaW1lbnNpb25zLnhBeGlzLmhlaWdodFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgdG9wOiB0b3AgKyBkaW1lbnNpb25zLnBsb3QuaGVpZ2h0IC0gSElEREVOX1dJRFRILFxuICAgICAgICAgICAgICAgICAgICByaWdodDogcmlnaHRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHlBeGlzQ2hhcnRUeXBlcyAmJiB5QXhpc0NoYXJ0VHlwZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBib3VuZHMueXJBeGlzID0ge1xuICAgICAgICAgICAgICAgIGRpbWVuc2lvbjoge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogZGltZW5zaW9ucy55ckF4aXMud2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogZGltZW5zaW9ucy5wbG90LmhlaWdodFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgdG9wOiB0b3AsXG4gICAgICAgICAgICAgICAgICAgIHJpZ2h0OiBkaW1lbnNpb25zLmxlZ2VuZC53aWR0aCArIENIQVJUX1BBRERJTkcgKyBISURERU5fV0lEVEhcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGJvdW5kcztcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGJvdW5kc01ha2VyO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IGNhbGN1bGF0b3IuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBBWElTX1NUQU5EQVJEX01VTFRJUExFX05VTVMgPSBbMSwgMiwgNSwgMTBdO1xuXG4vKipcbiAqIENhbGN1bGF0b3IuXG4gKiBAbW9kdWxlIGNhbGN1bGF0b3JcbiAqL1xudmFyIGNhbGN1bGF0b3IgPSB7XG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlIHNjYWxlIGZyb20gY2hhcnQgbWluLCBtYXggZGF0YS5cbiAgICAgKiAgLSBodHRwOi8vcGVsdGllcnRlY2guY29tL2hvdy1leGNlbC1jYWxjdWxhdGVzLWF1dG9tYXRpYy1jaGFydC1heGlzLWxpbWl0cy9cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmNhbGN1bGF0b3JcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWluIG1pbiBtaW5pbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtYXggbWF4IG1heGltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHRpY2tDb3VudCB0aWNrIGNvdW50XG4gICAgICogQHJldHVybnMge3ttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fSBzY2FsZSBheGlzIHNjYWxlXG4gICAgICovXG4gICAgY2FsY3VsYXRlU2NhbGU6IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XG4gICAgICAgIHZhciBzYXZlTWluID0gMCxcbiAgICAgICAgICAgIHNjYWxlID0ge30sXG4gICAgICAgICAgICBpb2RWYWx1ZTsgLy8gaW5jcmVhc2Ugb3IgZGVjcmVhc2UgdmFsdWU7XG5cbiAgICAgICAgaWYgKG1pbiA8IDApIHtcbiAgICAgICAgICAgIHNhdmVNaW4gPSBtaW47XG4gICAgICAgICAgICBtYXggLT0gbWluO1xuICAgICAgICAgICAgbWluID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlvZFZhbHVlID0gKG1heCAtIG1pbikgLyAyMDtcbiAgICAgICAgc2NhbGUubWF4ID0gbWF4ICsgaW9kVmFsdWUgKyBzYXZlTWluO1xuXG4gICAgICAgIGlmIChtYXggLyA2ID4gbWluKSB7XG4gICAgICAgICAgICBzY2FsZS5taW4gPSAwICsgc2F2ZU1pbjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNjYWxlLm1pbiA9IG1pbiAtIGlvZFZhbHVlICsgc2F2ZU1pbjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2NhbGU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG5vcm1hbGl6ZSBudW1iZXIuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpjYWxjdWxhdG9yXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIHRhcmdldCB2YWx1ZVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IG5vcm1hbGl6ZWQgbnVtYmVyXG4gICAgICovXG4gICAgbm9ybWFsaXplQXhpc051bWJlcjogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgdmFyIHN0YW5kYXJkID0gMCxcbiAgICAgICAgICAgIGZsYWcgPSAxLFxuICAgICAgICAgICAgbm9ybWFsaXplZCwgbW9kO1xuXG4gICAgICAgIGlmICh2YWx1ZSA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9IGVsc2UgaWYgKHZhbHVlIDwgMCkge1xuICAgICAgICAgICAgZmxhZyA9IC0xO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFsdWUgKj0gZmxhZztcblxuICAgICAgICBuZS51dGlsLmZvckVhY2hBcnJheShBWElTX1NUQU5EQVJEX01VTFRJUExFX05VTVMsIGZ1bmN0aW9uKG51bSkge1xuICAgICAgICAgICAgaWYgKHZhbHVlIDwgbnVtKSB7XG4gICAgICAgICAgICAgICAgaWYgKG51bSA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhbmRhcmQgPSBudW07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobnVtID09PSAxMCkge1xuICAgICAgICAgICAgICAgIHN0YW5kYXJkID0gMTA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChzdGFuZGFyZCA8IDEpIHtcbiAgICAgICAgICAgIG5vcm1hbGl6ZWQgPSB0aGlzLm5vcm1hbGl6ZUF4aXNOdW1iZXIodmFsdWUgKiAxMCkgKiAwLjE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtb2QgPSBuZS51dGlsLm1vZCh2YWx1ZSwgc3RhbmRhcmQpO1xuICAgICAgICAgICAgbm9ybWFsaXplZCA9IG5lLnV0aWwuYWRkaXRpb24odmFsdWUsIChtb2QgPiAwID8gc3RhbmRhcmQgLSBtb2QgOiAwKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbm9ybWFsaXplZCAqPSBmbGFnO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBNYWtlIHRpY2sgcG9zaXRpb25zIG9mIHBpeGVsIHR5cGUuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpjYWxjdWxhdG9yXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHNpemUgYXJlYSB3aWR0aCBvciBoZWlnaHRcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gY291bnQgdGljayBjb3VudFxuICAgICAqIEByZXR1cm5zIHthcnJheS48bnVtYmVyPn0gcG9zaXRpb25zXG4gICAgICovXG4gICAgbWFrZVBpeGVsUG9zaXRpb25zOiBmdW5jdGlvbihzaXplLCBjb3VudCkge1xuICAgICAgICB2YXIgcG9zaXRpb25zID0gW10sXG4gICAgICAgICAgICBweFNjYWxlLCBweFN0ZXA7XG5cbiAgICAgICAgaWYgKGNvdW50ID4gMCkge1xuICAgICAgICAgICAgcHhTY2FsZSA9IHttaW46IDAsIG1heDogc2l6ZSAtIDF9O1xuICAgICAgICAgICAgcHhTdGVwID0gdGhpcy5nZXRTY2FsZVN0ZXAocHhTY2FsZSwgY291bnQpO1xuICAgICAgICAgICAgcG9zaXRpb25zID0gbmUudXRpbC5tYXAobmUudXRpbC5yYW5nZSgwLCBzaXplLCBweFN0ZXApLCBmdW5jdGlvbihwb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLnJvdW5kKHBvc2l0aW9uKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcG9zaXRpb25zW3Bvc2l0aW9ucy5sZW5ndGggLSAxXSA9IHNpemUgLSAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwb3NpdGlvbnM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgbGFiZWxzIGZyb20gc2NhbGUuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpjYWxjdWxhdG9yXG4gICAgICogQHBhcmFtIHt7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX0gc2NhbGUgYXhpcyBzY2FsZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdGVwIHN0ZXAgYmV0d2VlbiBtYXggYW5kIG1pblxuICAgICAqIEByZXR1cm5zIHtzdHJpbmdbXX0gbGFiZWxzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBtYWtlTGFiZWxzRnJvbVNjYWxlOiBmdW5jdGlvbihzY2FsZSwgc3RlcCkge1xuICAgICAgICB2YXIgbXVsdGlwbGVOdW0gPSBuZS51dGlsLmZpbmRNdWx0aXBsZU51bShzdGVwKSxcbiAgICAgICAgICAgIG1pbiA9IHNjYWxlLm1pbiAqIG11bHRpcGxlTnVtLFxuICAgICAgICAgICAgbWF4ID0gc2NhbGUubWF4ICogbXVsdGlwbGVOdW0sXG4gICAgICAgICAgICBsYWJlbHMgPSBuZS51dGlsLnJhbmdlKG1pbiwgbWF4ICsgMSwgc3RlcCAqIG11bHRpcGxlTnVtKTtcbiAgICAgICAgbGFiZWxzID0gbmUudXRpbC5tYXAobGFiZWxzLCBmdW5jdGlvbihsYWJlbCkge1xuICAgICAgICAgICAgcmV0dXJuIGxhYmVsIC8gbXVsdGlwbGVOdW07XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gbGFiZWxzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgc2NhbGUgc3RlcC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmNhbGN1bGF0b3JcbiAgICAgKiBAcGFyYW0ge3ttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fSBzY2FsZSBheGlzIHNjYWxlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGNvdW50IHZhbHVlIGNvdW50XG4gICAgICogQHJldHVybnMge251bWJlcn0gc2NhbGUgc3RlcFxuICAgICAqL1xuICAgIGdldFNjYWxlU3RlcDogZnVuY3Rpb24oc2NhbGUsIGNvdW50KSB7XG4gICAgICAgIHJldHVybiAoc2NhbGUubWF4IC0gc2NhbGUubWluKSAvIChjb3VudCAtIDEpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBcnJheSBwaXZvdC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmNhbGN1bGF0b3JcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheT59IGFycjJkIHRhcmdldCAyZCBhcnJheVxuICAgICAqIEByZXR1cm5zIHthcnJheS48YXJyYXk+fSBwaXZvdGVkIDJkIGFycmF5XG4gICAgICovXG4gICAgYXJyYXlQaXZvdDogZnVuY3Rpb24oYXJyMmQpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgICBuZS51dGlsLmZvckVhY2hBcnJheShhcnIyZCwgZnVuY3Rpb24oYXJyKSB7XG4gICAgICAgICAgICBuZS51dGlsLmZvckVhY2hBcnJheShhcnIsIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgICAgICAgIGlmICghcmVzdWx0W2luZGV4XSkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRbaW5kZXhdID0gW107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlc3VsdFtpbmRleF0ucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBjYWxjdWxhdG9yO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IERhdGEgY29udmVydGVyLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2FsY3VsYXRvciA9IHJlcXVpcmUoJy4vY2FsY3VsYXRvci5qcycpO1xuXG52YXIgY29uY2F0ID0gQXJyYXkucHJvdG90eXBlLmNvbmNhdDtcblxuLyoqXG4gKiBEYXRhIGNvbnZlcnRlci5cbiAqIEBtb2R1bGUgZGF0YUNvbnZlcnRlclxuICovXG52YXIgZGF0YUNvbnZlcnRlciA9IHtcbiAgICAvKipcbiAgICAgKiBDb252ZXJ0IHVzZXIgZGF0YS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheT59IHVzZXJEYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGNoYXJ0T3B0aW9ucyBjaGFydCBvcHRpb25cbiAgICAgKiBAcmV0dXJucyB7e1xuICAgICAqICAgICAgbGFiZWxzOiBhcnJheS48c3RyaW5nPixcbiAgICAgKiAgICAgIHZhbHVlczogYXJyYXkuPG51bWJlcj4sXG4gICAgICogICAgICBsZWdlbmRMYWJlbHM6IGFycmF5LjxzdHJpbmc+LFxuICAgICAqICAgICAgZm9ybWF0RnVuY3Rpb25zOiBhcnJheS48ZnVuY3Rpb24+LFxuICAgICAqICAgICAgZm9ybWF0dGVkVmFsdWVzOiBhcnJheS48c3RyaW5nPlxuICAgICAqIH19IGNvbnZlcnRlZCBkYXRhXG4gICAgICovXG4gICAgY29udmVydDogZnVuY3Rpb24odXNlckRhdGEsIGNoYXJ0T3B0aW9ucywgY2hhcnRUeXBlKSB7XG4gICAgICAgIHZhciBsYWJlbHMgPSB1c2VyRGF0YS5jYXRlZ29yaWVzLFxuICAgICAgICAgICAgc2VyaWVzRGF0YSA9IHVzZXJEYXRhLnNlcmllcyxcbiAgICAgICAgICAgIHZhbHVlcyA9IHRoaXMuX3BpY2tWYWx1ZXMoc2VyaWVzRGF0YSksXG4gICAgICAgICAgICBqb2luVmFsdWVzID0gdGhpcy5fam9pblZhbHVlcyh2YWx1ZXMpLFxuICAgICAgICAgICAgbGVnZW5kTGFiZWxzID0gdGhpcy5fcGlja0xlZ2VuZExhYmVscyhzZXJpZXNEYXRhKSxcbiAgICAgICAgICAgIGpvaW5MZWdlbmRMYWJlbHMgPSB0aGlzLl9qb2luTGVnZW5kTGFiZWxzKGxlZ2VuZExhYmVscywgY2hhcnRUeXBlKSxcbiAgICAgICAgICAgIGZvcm1hdCA9IGNoYXJ0T3B0aW9ucyAmJiBjaGFydE9wdGlvbnMuZm9ybWF0IHx8ICcnLFxuICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zID0gdGhpcy5fZmluZEZvcm1hdEZ1bmN0aW9ucyhmb3JtYXQpLFxuICAgICAgICAgICAgZm9ybWF0dGVkVmFsdWVzID0gZm9ybWF0ID8gdGhpcy5fZm9ybWF0VmFsdWVzKHZhbHVlcywgZm9ybWF0RnVuY3Rpb25zKSA6IHZhbHVlcztcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxhYmVsczogbGFiZWxzLFxuICAgICAgICAgICAgdmFsdWVzOiB2YWx1ZXMsXG4gICAgICAgICAgICBqb2luVmFsdWVzOiBqb2luVmFsdWVzLFxuICAgICAgICAgICAgbGVnZW5kTGFiZWxzOiBsZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICBqb2luTGVnZW5kTGFiZWxzOiBqb2luTGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zOiBmb3JtYXRGdW5jdGlvbnMsXG4gICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXM6IGZvcm1hdHRlZFZhbHVlc1xuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXBhcmF0ZSBsYWJlbC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheS48YXJyYXk+Pn0gdXNlckRhdGEgdXNlciBkYXRhXG4gICAgICogQHJldHVybnMge3tsYWJlbHM6IChhcnJheS48c3RyaW5nPiksIHNvdXJjZURhdGE6IGFycmF5LjxhcnJheS48YXJyYXk+Pn19IHJlc3VsdCBkYXRhXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2VwYXJhdGVMYWJlbDogZnVuY3Rpb24odXNlckRhdGEpIHtcbiAgICAgICAgdmFyIGxhYmVscyA9IHVzZXJEYXRhWzBdLnBvcCgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbGFiZWxzOiBsYWJlbHMsXG4gICAgICAgICAgICBzb3VyY2VEYXRhOiB1c2VyRGF0YVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBQaWNrIHZhbHVlLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7YXJyYXl9IGl0ZW1zIGl0ZW1zXG4gICAgICogQHJldHVybnMge2FycmF5fSBwaWNrZWQgdmFsdWVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9waWNrVmFsdWU6IGZ1bmN0aW9uKGl0ZW1zKSB7XG4gICAgICAgIHJldHVybiBbXS5jb25jYXQoaXRlbXMuZGF0YSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFBpY2sgdmFsdWVzIGZyb20gYXhpcyBkYXRhLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gc2VyaWVzRGF0YSBzZXJpZXMgZGF0YVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmdbXX0gdmFsdWVzXG4gICAgICovXG4gICAgX3BpY2tWYWx1ZXM6IGZ1bmN0aW9uKHNlcmllc0RhdGEpIHtcbiAgICAgICAgdmFyIHZhbHVlcywgcmVzdWx0O1xuICAgICAgICBpZiAobmUudXRpbC5pc0FycmF5KHNlcmllc0RhdGEpKSB7XG4gICAgICAgICAgICB2YWx1ZXMgPSBuZS51dGlsLm1hcChzZXJpZXNEYXRhLCB0aGlzLl9waWNrVmFsdWUsIHRoaXMpO1xuICAgICAgICAgICAgcmVzdWx0ID0gY2FsY3VsYXRvci5hcnJheVBpdm90KHZhbHVlcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQgPSB7fTtcbiAgICAgICAgICAgIG5lLnV0aWwuZm9yRWFjaChzZXJpZXNEYXRhLCBmdW5jdGlvbihncm91cFZhbHVlcywgdHlwZSkge1xuICAgICAgICAgICAgICAgIHZhbHVlcyA9IG5lLnV0aWwubWFwKGdyb3VwVmFsdWVzLCB0aGlzLl9waWNrVmFsdWUsIHRoaXMpO1xuICAgICAgICAgICAgICAgIHJlc3VsdFt0eXBlXSA9IGNhbGN1bGF0b3IuYXJyYXlQaXZvdCh2YWx1ZXMpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSm9pbiB2YWx1ZXMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXk+fSB2YWx1ZXMgdmFsdWVzXG4gICAgICogQHJldHVybnMge2FycmF5LjxudW1iZXI+fSBqb2luIHZhbHVlc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2pvaW5WYWx1ZXM6IGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICB2YXIgam9pblZhbHVlcztcblxuICAgICAgICBpZiAobmUudXRpbC5pc0FycmF5KHZhbHVlcykpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZXM7XG4gICAgICAgIH1cblxuICAgICAgICBqb2luVmFsdWVzID0gbmUudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbihncm91cFZhbHVlcykge1xuICAgICAgICAgICAgcmV0dXJuIGdyb3VwVmFsdWVzO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICByZXR1cm4gY29uY2F0LmFwcGx5KFtdLCBqb2luVmFsdWVzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUGljayBsZWdlbmQgbGFiZWwuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGl0ZW0gaXRlbVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGxhYmVsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcGlja0xlZ2VuZExhYmVsOiBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIHJldHVybiBpdGVtLm5hbWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFBpY2sgbGVnZW5kIGxhYmVscyBmcm9tIGF4aXMgZGF0YS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheT59IHNlcmllc0RhdGEgc2VyaWVzIGRhdGFcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nW119IGxhYmVsc1xuICAgICAqL1xuICAgIF9waWNrTGVnZW5kTGFiZWxzOiBmdW5jdGlvbihzZXJpZXNEYXRhKSB7XG4gICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgIGlmIChuZS51dGlsLmlzQXJyYXkoc2VyaWVzRGF0YSkpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IG5lLnV0aWwubWFwKHNlcmllc0RhdGEsIHRoaXMuX3BpY2tMZWdlbmRMYWJlbCwgdGhpcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQgPSB7fTtcbiAgICAgICAgICAgIG5lLnV0aWwuZm9yRWFjaChzZXJpZXNEYXRhLCBmdW5jdGlvbihncm91cFZhbHVlcywgdHlwZSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdFt0eXBlXSA9IG5lLnV0aWwubWFwKGdyb3VwVmFsdWVzLCB0aGlzLl9waWNrTGVnZW5kTGFiZWwsIHRoaXMpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSm9pbiBsZWdlbmQgbGFiZWxzLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7YXJyYXl9IGxlZ2VuZExhYmVscyBsZWdlbmQgbGFiZWxzXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNoYXJ0VHlwZSBjaGFydCB0eXBlXG4gICAgICogQHJldHVybnMge2FycmF5fSBsYWJlbHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9qb2luTGVnZW5kTGFiZWxzOiBmdW5jdGlvbihsZWdlbmRMYWJlbHMsIGNoYXJ0VHlwZSkge1xuICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICBpZiAobmUudXRpbC5pc0FycmF5KGxlZ2VuZExhYmVscykpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IG5lLnV0aWwubWFwKGxlZ2VuZExhYmVscywgZnVuY3Rpb24obGFiZWwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBjaGFydFR5cGU6IGNoYXJ0VHlwZSxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGxhYmVsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0ID0gbmUudXRpbC5tYXAobGVnZW5kTGFiZWxzLCBmdW5jdGlvbihsYWJlbHMsIF9jaGFydFR5cGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAobGFiZWxzLCBmdW5jdGlvbihsYWJlbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnRUeXBlOiBfY2hhcnRUeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGxhYmVsXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgICAgIHJlc3VsdCA9IGNvbmNhdC5hcHBseShbXSwgcmVzdWx0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBmb3JtYXQgZ3JvdXAgdmFsdWVzLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gZ3JvdXBWYWx1ZXMgZ3JvdXAgdmFsdWVzXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbltdfSBmb3JtYXRGdW5jdGlvbnMgZm9ybWF0IGZ1bmN0aW9uc1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmdbXX0gZm9ybWF0dGVkIHZhbHVlc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2Zvcm1hdEdyb3VwVmFsdWVzOiBmdW5jdGlvbihncm91cFZhbHVlcywgZm9ybWF0RnVuY3Rpb25zKSB7XG4gICAgICAgIHJldHVybiBuZS51dGlsLm1hcChncm91cFZhbHVlcywgZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHZhciBmbnMgPSBbdmFsdWVdLmNvbmNhdChmb3JtYXRGdW5jdGlvbnMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZS51dGlsLnJlZHVjZShmbnMsIGZ1bmN0aW9uKHN0b3JlZCwgZm4pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZuKHN0b3JlZCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIGZvcm1hdCBjb252ZXJ0ZWQgdmFsdWVzLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gY2hhcnRWYWx1ZXMgY2hhcnQgdmFsdWVzXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbltdfSBmb3JtYXRGdW5jdGlvbnMgZm9ybWF0IGZ1bmN0aW9uc1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmdbXX0gZm9ybWF0dGVkIHZhbHVlc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2Zvcm1hdFZhbHVlczogZnVuY3Rpb24oY2hhcnRWYWx1ZXMsIGZvcm1hdEZ1bmN0aW9ucykge1xuICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICBpZiAobmUudXRpbC5pc0FycmF5KGNoYXJ0VmFsdWVzKSkge1xuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5fZm9ybWF0R3JvdXBWYWx1ZXMoY2hhcnRWYWx1ZXMsIGZvcm1hdEZ1bmN0aW9ucyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQgPSB7fTtcbiAgICAgICAgICAgIG5lLnV0aWwuZm9yRWFjaChjaGFydFZhbHVlcywgZnVuY3Rpb24oZ3JvdXBWYWx1ZXMsIGNoYXJ0VHlwZSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdFtjaGFydFR5cGVdID0gdGhpcy5fZm9ybWF0R3JvdXBWYWx1ZXMoZ3JvdXBWYWx1ZXMsIGZvcm1hdEZ1bmN0aW9ucyk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBQaWNrIG1heCBsZW5ndGggdW5kZXIgcG9pbnQuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gdmFsdWVzIGNoYXJ0IHZhbHVlc1xuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IG1heCBsZW5ndGggdW5kZXIgcG9pbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9waWNrTWF4TGVuVW5kZXJQb2ludDogZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgIHZhciBtYXggPSAwO1xuXG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KHZhbHVlcywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBsZW4gPSBuZS51dGlsLmxlbmd0aEFmdGVyUG9pbnQodmFsdWUpO1xuICAgICAgICAgICAgaWYgKGxlbiA+IG1heCkge1xuICAgICAgICAgICAgICAgIG1heCA9IGxlbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgcmV0dXJuIG1heDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB6ZXJvIGZpbGwgZm9ybWF0IG9yIG5vdC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZm9ybWF0IGZvcm1hdFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSByZXN1bHQgYm9vbGVhblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2lzWmVyb0ZpbGw6IGZ1bmN0aW9uKGZvcm1hdCkge1xuICAgICAgICByZXR1cm4gZm9ybWF0Lmxlbmd0aCA+IDIgJiYgZm9ybWF0LmNoYXJBdCgwKSA9PT0gJzAnO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIGRlY2ltYWwgZm9ybWF0IG9yIG5vdC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZm9ybWF0IGZvcm1hdFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSByZXN1bHQgYm9vbGVhblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2lzRGVjaW1hbDogZnVuY3Rpb24oZm9ybWF0KSB7XG4gICAgICAgIHZhciBpbmRleE9mID0gZm9ybWF0LmluZGV4T2YoJy4nKTtcbiAgICAgICAgcmV0dXJuIGluZGV4T2YgPiAtMSAmJiBpbmRleE9mIDwgZm9ybWF0Lmxlbmd0aCAtIDE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgY29tbWEgZm9ybWF0IG9yIG5vdC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZm9ybWF0IGZvcm1hdFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSByZXN1bHQgYm9vbGVhblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2lzQ29tbWE6IGZ1bmN0aW9uKGZvcm1hdCkge1xuICAgICAgICByZXR1cm4gZm9ybWF0LmluZGV4T2YoJywnKSA9PT0gZm9ybWF0LnNwbGl0KCcuJylbMF0ubGVuZ3RoIC0gNDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRm9ybWF0IHplcm8gZmlsbC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbGVuIGxlbmd0aCBvZiByZXN1bHRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWUgdGFyZ2V0IHZhbHVlXG4gICAgICogQHJldHVybnMge3N0cmluZ30gZm9ybWF0dGVkIHZhbHVlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZm9ybWF0WmVyb0ZpbGw6IGZ1bmN0aW9uKGxlbiwgdmFsdWUpIHtcbiAgICAgICAgdmFyIHplcm8gPSAnMCc7XG5cbiAgICAgICAgdmFsdWUgKz0gJyc7XG5cbiAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA+PSBsZW4pIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHdoaWxlICh2YWx1ZS5sZW5ndGggPCBsZW4pIHtcbiAgICAgICAgICAgIHZhbHVlID0gemVybyArIHZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGb3JtYXQgRGVjaW1hbC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbGVuIGxlbmd0aCBvZiB1bmRlciBkZWNpbWFsIHBvaW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlIHRhcmdldCB2YWx1ZVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGZvcm1hdHRlZCB2YWx1ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2Zvcm1hdERlY2ltYWw6IGZ1bmN0aW9uKGxlbiwgdmFsdWUpIHtcbiAgICAgICAgdmFyIHBvdztcblxuICAgICAgICBpZiAobGVuID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5yb3VuZCh2YWx1ZSwgMTApO1xuICAgICAgICB9XG5cbiAgICAgICAgcG93ID0gTWF0aC5wb3coMTAsIGxlbik7XG4gICAgICAgIHZhbHVlID0gTWF0aC5yb3VuZCh2YWx1ZSAqIHBvdykgLyBwb3c7XG4gICAgICAgIHZhbHVlID0gcGFyc2VGbG9hdCh2YWx1ZSkudG9GaXhlZChsZW4pO1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZvcm1hdCBDb21tYS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWUgdGFyZ2V0IHZhbHVlXG4gICAgICogQHJldHVybnMge3N0cmluZ30gZm9ybWF0dGVkIHZhbHVlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZm9ybWF0Q29tbWE6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHZhciBjb21tYSA9ICcsJyxcbiAgICAgICAgICAgIHVuZGVyUG9pbnRWYWx1ZSA9ICcnLFxuICAgICAgICAgICAgdmFsdWVzO1xuXG4gICAgICAgIHZhbHVlICs9ICcnO1xuXG4gICAgICAgIGlmICh2YWx1ZS5pbmRleE9mKCcuJykgPiAtMSkge1xuICAgICAgICAgICAgdmFsdWVzID0gdmFsdWUuc3BsaXQoJy4nKTtcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWVzWzBdO1xuICAgICAgICAgICAgdW5kZXJQb2ludFZhbHVlID0gJy4nICsgdmFsdWVzWzFdO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA8IDQpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZSArIHVuZGVyUG9pbnRWYWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhbHVlcyA9ICh2YWx1ZSkuc3BsaXQoJycpLnJldmVyc2UoKTtcbiAgICAgICAgdmFsdWVzID0gbmUudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbihjaGFyLCBpbmRleCkge1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IFtjaGFyXTtcbiAgICAgICAgICAgIGlmICgoaW5kZXggKyAxKSAlIDMgPT09IDApIHtcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChjb21tYSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gY29uY2F0LmFwcGx5KFtdLCB2YWx1ZXMpLnJldmVyc2UoKS5qb2luKCcnKSArIHVuZGVyUG9pbnRWYWx1ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmluZCBmb3JtYXQgZnVuY3Rpb25zLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmb3JtYXQgZm9ybWF0XG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gdmFsdWVzIGNoYXJ0IHZhbHVlc1xuICAgICAqIEByZXR1cm5zIHtmdW5jdGlvbltdfSBmdW5jdGlvbnNcbiAgICAgKi9cbiAgICBfZmluZEZvcm1hdEZ1bmN0aW9uczogZnVuY3Rpb24oZm9ybWF0KSB7XG4gICAgICAgIHZhciBmdW5jcyA9IFtdLFxuICAgICAgICAgICAgbGVuO1xuXG4gICAgICAgIGlmICghZm9ybWF0KSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5faXNEZWNpbWFsKGZvcm1hdCkpIHtcbiAgICAgICAgICAgIGxlbiA9IHRoaXMuX3BpY2tNYXhMZW5VbmRlclBvaW50KFtmb3JtYXRdKTtcbiAgICAgICAgICAgIGZ1bmNzID0gW25lLnV0aWwuYmluZCh0aGlzLl9mb3JtYXREZWNpbWFsLCB0aGlzLCBsZW4pXTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9pc1plcm9GaWxsKGZvcm1hdCkpIHtcbiAgICAgICAgICAgIGxlbiA9IGZvcm1hdC5sZW5ndGg7XG4gICAgICAgICAgICBmdW5jcyA9IFtuZS51dGlsLmJpbmQodGhpcy5fZm9ybWF0WmVyb0ZpbGwsIHRoaXMsIGxlbildO1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmNzO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2lzQ29tbWEoZm9ybWF0KSkge1xuICAgICAgICAgICAgZnVuY3MucHVzaCh0aGlzLl9mb3JtYXRDb21tYSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZnVuY3M7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBkYXRhQ29udmVydGVyO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IERPTSBIYW5kbGVyLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIERPTSBIYW5kbGVyLlxuICogQG1vZHVsZSBkb21IYW5kbGVyXG4gKi9cbnZhciBkb21IYW5kbGVyID0ge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZSBlbGVtZW50LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZG9tSGFuZGxlclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0YWcgaHRtbCB0YWdcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmV3Q2xhc3MgY2xhc3MgbmFtZVxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gY3JlYXRlZCBlbGVtZW50XG4gICAgICovXG4gICAgY3JlYXRlOiBmdW5jdGlvbih0YWcsIG5ld0NsYXNzKSB7XG4gICAgICAgIHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnKTtcblxuICAgICAgICBpZiAobmV3Q2xhc3MpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkQ2xhc3MoZWwsIG5ld0NsYXNzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNsYXNzIG5hbWVzLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZG9tSGFuZGxlclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHJldHVybnMge2FycmF5fSBuYW1lc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldENsYXNzTmFtZXM6IGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgIHZhciBjbGFzc05hbWUgPSBlbC5jbGFzc05hbWUgPyBlbC5jbGFzc05hbWUgOiAnJyxcbiAgICAgICAgICAgIGNsYXNzTmFtZXMgPSBjbGFzc05hbWUgPyBjbGFzc05hbWUuc3BsaXQoJyAnKSA6IFtdO1xuICAgICAgICByZXR1cm4gY2xhc3NOYW1lcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIGNzcyBjbGFzcyB0byB0YXJnZXQgZWxlbWVudC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRvbUhhbmRsZXJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuZXdDbGFzcyBhZGQgY2xhc3MgbmFtZVxuICAgICAqL1xuICAgIGFkZENsYXNzOiBmdW5jdGlvbihlbCwgbmV3Q2xhc3MpIHtcbiAgICAgICAgdmFyIGNsYXNzTmFtZXMgPSB0aGlzLl9nZXRDbGFzc05hbWVzKGVsKSxcbiAgICAgICAgICAgIGluZGV4ID0gbmUudXRpbC5pbkFycmF5KG5ld0NsYXNzLCBjbGFzc05hbWVzKTtcblxuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY2xhc3NOYW1lcy5wdXNoKG5ld0NsYXNzKTtcbiAgICAgICAgZWwuY2xhc3NOYW1lID0gY2xhc3NOYW1lcy5qb2luKCcgJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBjc3MgY2xhc3MgZnJvbSB0YXJnZXQgZWxlbWVudC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRvbUhhbmRsZXJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBybUNsYXNzIHJlbW92ZSBjbGFzcyBuYW1lXG4gICAgICovXG4gICAgcmVtb3ZlQ2xhc3M6IGZ1bmN0aW9uKGVsLCBybUNsYXNzKSB7XG4gICAgICAgIHZhciBjbGFzc05hbWVzID0gdGhpcy5fZ2V0Q2xhc3NOYW1lcyhlbCksXG4gICAgICAgICAgICBpbmRleCA9IG5lLnV0aWwuaW5BcnJheShybUNsYXNzLCBjbGFzc05hbWVzKTtcblxuICAgICAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjbGFzc05hbWVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIGVsLmNsYXNzTmFtZSA9IGNsYXNzTmFtZXMuam9pbignICcpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIGNsYXNzIGV4aXN0IG9yIG5vdC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRvbUhhbmRsZXJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmaW5kQ2xhc3MgdGFyZ2V0IGNzcyBjbGFzc1xuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBoYXMgY2xhc3NcbiAgICAgKi9cbiAgICBoYXNDbGFzczogZnVuY3Rpb24oZWwsIGZpbmRDbGFzcykge1xuICAgICAgICB2YXIgY2xhc3NOYW1lcyA9IHRoaXMuX2dldENsYXNzTmFtZXMoZWwpLFxuICAgICAgICAgICAgaW5kZXggPSBuZS51dGlsLmluQXJyYXkoZmluZENsYXNzLCBjbGFzc05hbWVzKTtcbiAgICAgICAgcmV0dXJuIGluZGV4ID4gLTE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZpbmQgcGFyZW50IGJ5IGNsYXNzIG5hbWUuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkb21IYW5kbGVyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY2xhc3NOYW1lIHRhcmdldCBjc3MgY2xhc3NcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbGFzdENsYXNzIGxhc3QgY3NzIGNsYXNzXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSByZXN1bHQgZWxlbWVudFxuICAgICAqL1xuICAgIGZpbmRQYXJlbnRCeUNsYXNzOiBmdW5jdGlvbihlbCwgY2xhc3NOYW1lLCBsYXN0Q2xhc3MpIHtcbiAgICAgICAgdmFyIHBhcmVudCA9IGVsLnBhcmVudE5vZGU7XG4gICAgICAgIGlmICghcGFyZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmhhc0NsYXNzKHBhcmVudCwgY2xhc3NOYW1lKSkge1xuICAgICAgICAgICAgcmV0dXJuIHBhcmVudDtcbiAgICAgICAgfSBlbHNlIGlmIChwYXJlbnQubm9kZU5hbWUgPT09ICdCT0RZJyB8fCB0aGlzLmhhc0NsYXNzKHBhcmVudCwgbGFzdENsYXNzKSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5maW5kUGFyZW50QnlDbGFzcyhwYXJlbnQsIGNsYXNzTmFtZSwgbGFzdENsYXNzKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBcHBlbmQgY2hpbGQgZWxlbWVudC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRvbUhhbmRsZXJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY29udGFpbmVyIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjaGlsZHJlbiBjaGlsZCBlbGVtZW50XG4gICAgICovXG4gICAgYXBwZW5kOiBmdW5jdGlvbihjb250YWluZXIsIGNoaWxkcmVuKSB7XG4gICAgICAgIGlmICghY29udGFpbmVyIHx8ICFjaGlsZHJlbikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNoaWxkcmVuID0gbmUudXRpbC5pc0FycmF5KGNoaWxkcmVuKSA/IGNoaWxkcmVuIDogW2NoaWxkcmVuXTtcblxuICAgICAgICBuZS51dGlsLmZvckVhY2hBcnJheShjaGlsZHJlbiwgZnVuY3Rpb24oY2hpbGQpIHtcbiAgICAgICAgICAgIGlmICghY2hpbGQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoY2hpbGQpO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRvbUhhbmRsZXI7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgRXZlbnQgbGlzdGVuZXIuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogRXZlbnQgbGlzdGVuZXIuXG4gKiBAbW9kdWxlIGV2ZW50TGlzdGVuZXJcbiAqL1xudmFyIGV2ZW50TGlzdGVuZXIgPSB7XG4gICAgLyoqXG4gICAgICogRXZlbnQgbGlzdGVuZXIgZm9yIElFLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZXZlbnRMaXN0ZW5lclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudE5hbWUgZXZlbnQgbmFtZVxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hdHRhY2hFdmVudDogZnVuY3Rpb24gKGV2ZW50TmFtZSwgZWwsIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT0gXCJvYmplY3RcIiAmJiBjYWxsYmFjay5oYW5kbGVFdmVudCkge1xuICAgICAgICAgICAgZWwuYXR0YWNoRXZlbnQoXCJvblwiICsgZXZlbnROYW1lLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2suaGFuZGxlRXZlbnQuY2FsbChjYWxsYmFjayk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsLmF0dGFjaEV2ZW50KFwib25cIiArIGV2ZW50TmFtZSwgY2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV2ZW50IGxpc3RlbmVyIGZvciBvdGhlciBicm93c2Vycy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmV2ZW50TGlzdGVuZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lIGV2ZW50IG5hbWVcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYWRkRXZlbnRMaXN0ZW5lcjogZnVuY3Rpb24gKGV2ZW50TmFtZSwgZWwsIGNhbGxiYWNrKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgY2FsbGJhY2spO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09IFwib2JqZWN0XCIgJiYgY2FsbGJhY2suaGFuZGxlRXZlbnQpIHtcbiAgICAgICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmhhbmRsZUV2ZW50LmNhbGwoY2FsbGJhY2ssIGV2ZW50KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogQmluZCBldmVudCBmdW5jdGlvbi5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmV2ZW50TGlzdGVuZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lIGV2ZW50IG5hbWVcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgICovXG4gICAgYmluZEV2ZW50OiBmdW5jdGlvbiAoZXZlbnROYW1lLCBlbCwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGJpbmRFdmVudDtcbiAgICAgICAgaWYgKFwiYWRkRXZlbnRMaXN0ZW5lclwiIGluIGVsKSB7XG4gICAgICAgICAgICBiaW5kRXZlbnQgPSB0aGlzLl9hZGRFdmVudExpc3RlbmVyO1xuICAgICAgICB9IGVsc2UgaWYgKFwiYXR0YWNoRXZlbnRcIiBpbiBlbCkge1xuICAgICAgICAgICAgYmluZEV2ZW50ID0gdGhpcy5fYXR0YWNoRXZlbnQ7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5iaW5kRXZlbnQgPSBiaW5kRXZlbnQ7XG4gICAgICAgIGJpbmRFdmVudChldmVudE5hbWUsIGVsLCBjYWxsYmFjayk7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBldmVudExpc3RlbmVyO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFV0aWwgZm9yIHJlbmRlcmluZy5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGRvbSA9IHJlcXVpcmUoJy4vZG9tSGFuZGxlcicpLFxuICAgIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuLy4uL2NvbnN0LmpzJyk7XG5cbnZhciBicm93c2VyID0gbmUudXRpbC5icm93c2VyLFxuICAgIGlzSUU4ID0gYnJvd3Nlci5tc2llICYmIGJyb3dzZXIudmVyc2lvbiA9PT0gODtcblxuLyoqXG4gKiBVdGlsIGZvciByZW5kZXJpbmcuXG4gKiBAbW9kdWxlIHJlbmRlclV0aWxcbiAqL1xudmFyIHJlbmRlclV0aWwgPSB7XG4gICAgLyoqXG4gICAgICogQ29uY2F0IHN0cmluZy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOnJlbmRlclV0aWxcbiAgICAgKiBAcGFyYW1zIHsuLi5zdHJpbmd9IHRhcmdldCBzdHJpbmdzXG4gICAgICogQHJldHVybnMge3N0cmluZ30gY29uY2F0IHN0cmluZ1xuICAgICAqL1xuICAgIGNvbmNhdFN0cjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBTdHJpbmcucHJvdG90eXBlLmNvbmNhdC5hcHBseSgnJywgYXJndW1lbnRzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBjc3NUZXh0IGZvciBmb250LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6cmVuZGVyVXRpbFxuICAgICAqIEBwYXJhbSB7e2ZvbnRTaXplOiBudW1iZXIsIGZvbnRGYW1pbHk6IHN0cmluZywgY29sb3I6IHN0cmluZ319IHRoZW1lIGZvbnQgdGhlbWVcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBjc3NUZXh0XG4gICAgICovXG4gICAgbWFrZUZvbnRDc3NUZXh0OiBmdW5jdGlvbih0aGVtZSkge1xuICAgICAgICB2YXIgY3NzVGV4dHMgPSBbXTtcblxuICAgICAgICBpZiAoIXRoZW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhlbWUuZm9udFNpemUpIHtcbiAgICAgICAgICAgIGNzc1RleHRzLnB1c2godGhpcy5jb25jYXRTdHIoJ2ZvbnQtc2l6ZTonLCB0aGVtZS5mb250U2l6ZSwgJ3B4JykpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoZW1lLmZvbnRGYW1pbHkpIHtcbiAgICAgICAgICAgIGNzc1RleHRzLnB1c2godGhpcy5jb25jYXRTdHIoJ2ZvbnQtZmFtaWx5OicsIHRoZW1lLmZvbnRGYW1pbHkpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGVtZS5jb2xvcikge1xuICAgICAgICAgICAgY3NzVGV4dHMucHVzaCh0aGlzLmNvbmNhdFN0cignY29sb3I6JywgdGhlbWUuY29sb3IpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjc3NUZXh0cy5qb2luKCc7Jyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBlbGVtZW50IGZvciBzaXplIGNoZWNrLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6cmVuZGVyVXRpbFxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NyZWF0ZVNpemVDaGVja0VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGVsRGl2ID0gZG9tLmNyZWF0ZSgnRElWJyksXG4gICAgICAgICAgICBlbFNwYW4gPSBkb20uY3JlYXRlKCdTUEFOJyk7XG5cbiAgICAgICAgZWxEaXYuYXBwZW5kQ2hpbGQoZWxTcGFuKTtcbiAgICAgICAgZWxEaXYuc3R5bGUuY3NzVGV4dCA9ICdwb3NpdGlvbjpyZWxhdGl2ZTt0b3A6MTAwMDBweDtsZWZ0OjEwMDAwcHg7bGluZS1oZWlnaHQ6MSc7XG4gICAgICAgIHJldHVybiBlbERpdjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHJlbmRlcmVkIGxhYmVsIHNpemUgKHdpZHRoIG9yIGhlaWdodCkuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpyZW5kZXJVdGlsXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGxhYmVsIGxhYmVsXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIHRoZW1lXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHByb3BlcnR5IGVsZW1lbnQgcHJvcGVydHlcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBzaXplXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0UmVuZGVyZWRMYWJlbFNpemU6IGZ1bmN0aW9uKGxhYmVsLCB0aGVtZSwgcHJvcGVydHkpIHtcbiAgICAgICAgdmFyIGVsRGl2ID0gdGhpcy5fY3JlYXRlU2l6ZUNoZWNrRWwoKSxcbiAgICAgICAgICAgIGVsU3BhbiA9IGVsRGl2LmZpcnN0Q2hpbGQsXG4gICAgICAgICAgICBsYWJlbFNpemU7XG5cbiAgICAgICAgdGhlbWUgPSB0aGVtZSB8fCB7fTtcbiAgICAgICAgZWxTcGFuLmlubmVySFRNTCA9IGxhYmVsO1xuICAgICAgICBlbFNwYW4uc3R5bGUuZm9udFNpemUgPSAodGhlbWUuZm9udFNpemUgfHwgY2hhcnRDb25zdC5ERUZBVUxUX0xBQkVMX0ZPTlRfU0laRSkgKyAncHgnO1xuXG4gICAgICAgIGlmICh0aGVtZS5mb250RmFtaWx5KSB7XG4gICAgICAgICAgICBlbFNwYW4uc3R5bGUuZm9udEZhbWlseSA9IHRoZW1lLmZvbnRGYW1pbHk7XG4gICAgICAgIH1cblxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGVsRGl2KTtcbiAgICAgICAgbGFiZWxTaXplID0gZWxTcGFuW3Byb3BlcnR5XTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChlbERpdik7XG4gICAgICAgIHJldHVybiBsYWJlbFNpemU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCByZW5kZXJlZCBsYWJlbCB3aWR0aC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOnJlbmRlclV0aWxcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbGFiZWwgbGFiZWxcbiAgICAgKiBAcGFyYW0ge3tmb250U2l6ZTogbnVtYmVyLCBmb250RmFtaWx5OiBzdHJpbmcsIGNvbG9yOiBzdHJpbmd9fSB0aGVtZSBsYWJlbCB0aGVtZVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IHdpZHRoXG4gICAgICovXG4gICAgZ2V0UmVuZGVyZWRMYWJlbFdpZHRoOiBmdW5jdGlvbihsYWJlbCwgdGhlbWUpIHtcbiAgICAgICAgdmFyIGxhYmVsV2lkdGggPSB0aGlzLl9nZXRSZW5kZXJlZExhYmVsU2l6ZShsYWJlbCwgdGhlbWUsICdvZmZzZXRXaWR0aCcpO1xuICAgICAgICByZXR1cm4gbGFiZWxXaWR0aDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHJlbmRlcmVkIGxhYmVsIGhlaWdodC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOnJlbmRlclV0aWxcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbGFiZWwgbGFiZWxcbiAgICAgKiBAcGFyYW0ge3tmb250U2l6ZTogbnVtYmVyLCBmb250RmFtaWx5OiBzdHJpbmcsIGNvbG9yOiBzdHJpbmd9fSB0aGVtZSBsYWJlbCB0aGVtZVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IGhlaWdodFxuICAgICAqL1xuICAgIGdldFJlbmRlcmVkTGFiZWxIZWlnaHQ6IGZ1bmN0aW9uKGxhYmVsLCB0aGVtZSkge1xuICAgICAgICB2YXIgbGFiZWxIZWlnaHQgPSB0aGlzLl9nZXRSZW5kZXJlZExhYmVsU2l6ZShsYWJlbCwgdGhlbWUsICdvZmZzZXRIZWlnaHQnKTtcbiAgICAgICAgcmV0dXJuIGxhYmVsSGVpZ2h0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgZGltZW5zaW9uLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6cmVuZGVyVXRpbFxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBkaW1lbnNpb24gZGltZW5zaW9uXG4gICAgICovXG4gICAgcmVuZGVyRGltZW5zaW9uOiBmdW5jdGlvbihlbCwgZGltZW5zaW9uKSB7XG4gICAgICAgIGVsLnN0eWxlLmNzc1RleHQgPSBbXG4gICAgICAgICAgICB0aGlzLmNvbmNhdFN0cignd2lkdGg6JywgZGltZW5zaW9uLndpZHRoLCAncHgnKSxcbiAgICAgICAgICAgIHRoaXMuY29uY2F0U3RyKCdoZWlnaHQ6JywgZGltZW5zaW9uLmhlaWdodCwgJ3B4JylcbiAgICAgICAgXS5qb2luKCc7Jyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBwb3NpdGlvbih0b3AsIHJpZ2h0KS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOnJlbmRlclV0aWxcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7e3RvcDogbnVtYmVyLCBsZWZ0OiBudW1iZXIsIHJpZ2h0OiBudW1iZXJ9fSBwb3NpdGlvbiBwb3NpdGlvblxuICAgICAqL1xuICAgIHJlbmRlclBvc2l0aW9uOiBmdW5jdGlvbihlbCwgcG9zaXRpb24pIHtcbiAgICAgICAgaWYgKG5lLnV0aWwuaXNVbmRlZmluZWQocG9zaXRpb24pKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocG9zaXRpb24udG9wKSB7XG4gICAgICAgICAgICBlbC5zdHlsZS50b3AgPSBwb3NpdGlvbi50b3AgKyAncHgnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBvc2l0aW9uLmxlZnQpIHtcbiAgICAgICAgICAgIGVsLnN0eWxlLmxlZnQgPSBwb3NpdGlvbi5sZWZ0ICsgJ3B4JztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwb3NpdGlvbi5yaWdodCkge1xuICAgICAgICAgICAgZWwuc3R5bGUucmlnaHQgPSBwb3NpdGlvbi5yaWdodCArICdweCc7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGJhY2tncm91bmQuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpyZW5kZXJVdGlsXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gYmFja2dyb3VuZCBiYWNrZ3JvdW5kIG9wdGlvblxuICAgICAqL1xuICAgIHJlbmRlckJhY2tncm91bmQ6IGZ1bmN0aW9uKGVsLCBiYWNrZ3JvdW5kKSB7XG4gICAgICAgIGlmICghYmFja2dyb3VuZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZWwuc3R5bGUuYmFja2dyb3VuZCA9IGJhY2tncm91bmQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciB0aXRsZS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOnJlbmRlclV0aWxcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGl0bGUgdGl0bGVcbiAgICAgKiBAcGFyYW0ge3tmb250U2l6ZTogbnVtYmVyLCBjb2xvcjogc3RyaW5nLCBiYWNrZ3JvdW5kOiBzdHJpbmd9fSB0aGVtZSB0aXRsZSB0aGVtZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjbGFzc05hbWUgY3NzIGNsYXNzIG5hbWVcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHRpdGxlIGVsZW1lbnRcbiAgICAgKi9cbiAgICByZW5kZXJUaXRsZTogZnVuY3Rpb24odGl0bGUsIHRoZW1lLCBjbGFzc05hbWUpIHtcbiAgICAgICAgdmFyIGVsVGl0bGUsIGNzc1RleHQ7XG5cbiAgICAgICAgaWYgKCF0aXRsZSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBlbFRpdGxlID0gZG9tLmNyZWF0ZSgnRElWJywgY2xhc3NOYW1lKTtcbiAgICAgICAgZWxUaXRsZS5pbm5lckhUTUwgPSB0aXRsZTtcblxuICAgICAgICBjc3NUZXh0ID0gcmVuZGVyVXRpbC5tYWtlRm9udENzc1RleHQodGhlbWUpO1xuXG4gICAgICAgIGlmICh0aGVtZS5iYWNrZ3JvdW5kKSB7XG4gICAgICAgICAgICBjc3NUZXh0ICs9ICc7JyArIHRoaXMuY29uY2F0U3RyKCdiYWNrZ3JvdW5kOicsIHRoZW1lLmJhY2tncm91bmQpO1xuICAgICAgICB9XG5cbiAgICAgICAgZWxUaXRsZS5zdHlsZS5jc3NUZXh0ID0gY3NzVGV4dDtcblxuICAgICAgICByZXR1cm4gZWxUaXRsZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciBJRTggb3Igbm90LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6cmVuZGVyVXRpbFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSByZXN1bHQgYm9vbGVhblxuICAgICAqL1xuICAgIGlzSUU4OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGlzSUU4O1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gcmVuZGVyVXRpbDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBUaGlzIGlzIHRlbXBsYXRlIG1ha2VyLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAvKipcbiAgICAgKiBUaGlzIGlzIHRlbXBsYXRlIG1ha2VyLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBodG1sIGh0bWxcbiAgICAgKiBAcmV0dXJucyB7ZnVuY3Rpb259IHRlbXBsYXRlIGZ1bmN0aW9uXG4gICAgICogQGVheG1wbGVcbiAgICAgKlxuICAgICAqICAgdmFyIHRlbXBsYXRlID0gdGVtcGxhdGVNYWtlci50ZW1wbGF0ZSgnPHNwYW4+e3sgbmFtZSB9fTwvc3Bhbj4nKSxcbiAgICAgKiAgICAgICByZXN1bHQgPSB0ZW1wbGF0ZSh7bmFtZTogJ0pvaG4nKTtcbiAgICAgKiAgIGNvbnNvbGUubG9nKHJlc3VsdCk7IC8vIDxzcGFuPkpvaG48L3NwYW4+XG4gICAgICpcbiAgICAgKi9cbiAgICB0ZW1wbGF0ZTogZnVuY3Rpb24gKGh0bWwpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gaHRtbDtcbiAgICAgICAgICAgIG5lLnV0aWwuZm9yRWFjaChkYXRhLCBmdW5jdGlvbiAodmFsdWUsIGtleSkge1xuICAgICAgICAgICAgICAgIHZhciByZWdFeHAgPSBuZXcgUmVnRXhwKCd7e1xcXFxzKicgKyBrZXkgKyAnXFxcXHMqfX0nLCAnZycpO1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKHJlZ0V4cCwgdmFsdWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9O1xuICAgIH1cbn07XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgIExlZ2VuZCBjb21wb25lbnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBjaGFydENvbnN0ID0gcmVxdWlyZSgnLi4vY29uc3QuanMnKSxcbiAgICBkb20gPSByZXF1aXJlKCcuLi9oZWxwZXJzL2RvbUhhbmRsZXIuanMnKSxcbiAgICByZW5kZXJVdGlsID0gcmVxdWlyZSgnLi4vaGVscGVycy9yZW5kZXJVdGlsLmpzJyksXG4gICAgZGVmYXVsdFRoZW1lID0gcmVxdWlyZSgnLi4vdGhlbWVzL2RlZmF1bHRUaGVtZS5qcycpLFxuICAgIGxlZ2VuZFRlbXBsYXRlID0gcmVxdWlyZSgnLi8uLi9sZWdlbmRzL2xlZ2VuZFRlbXBsYXRlLmpzJyk7XG5cbnZhciBMRUdFTkRfUkVDVF9XSURUSCA9IDEyLFxuICAgIExBQkVMX1BBRERJTkdfVE9QID0gMixcbiAgICBMSU5FX01BUkdJTl9UT1AgPSA1O1xuXG52YXIgTGVnZW5kID0gbmUudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIExlZ2VuZC5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIExlZ2VuZCBjb21wb25lbnQuXG4gICAgICogQGNvbnN0cnVjdHMgTGVnZW5kXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmxlZ2VuZExhYmVscyBsZWdlbmQgbGFiZWxzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmJvdW5kIGF4aXMgYm91bmRcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgYXhpcyB0aGVtZVxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICBuZS51dGlsLmV4dGVuZCh0aGlzLCBwYXJhbXMpO1xuICAgICAgICAvKipcbiAgICAgICAgICogTGVnZW5kIHZpZXcgY2xhc3NOYW1lXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNsYXNzTmFtZSA9ICduZS1jaGFydC1sZWdlbmQtYXJlYSc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBsZWdlbmQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGJvdW5kIHBsb3QgYm91bmRcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IGxlZ2VuZCBlbGVtZW50XG4gICAgICovXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGVsID0gZG9tLmNyZWF0ZSgnRElWJywgdGhpcy5jbGFzc05hbWUpO1xuICAgICAgICBlbC5pbm5lckhUTUwgPSB0aGlzLl9tYWtlTGVnZW5kSHRtbCgpO1xuICAgICAgICByZW5kZXJVdGlsLnJlbmRlclBvc2l0aW9uKGVsLCB0aGlzLmJvdW5kLnBvc2l0aW9uKTtcbiAgICAgICAgdGhpcy5fcmVuZGVyTGFiZWxUaGVtZShlbCwgdGhpcy50aGVtZS5sYWJlbCk7XG5cbiAgICAgICAgcmV0dXJuIGVsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlbWUgdG8gbGVnZW5kIGxhYmVsc1xuICAgICAqIEBwYXJhbSB7YXJyYXkuPG9iamVjdD59IGxhYmVscyBsYWJlbHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgbGVnZW5kIHRoZW1lXG4gICAgICogQHJldHVybnMge2FycmF5LjxvYmplY3Q+fSBsYWJlbHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRUaGVtZVRvTGFiZWxzOiBmdW5jdGlvbihsYWJlbHMsIHRoZW1lKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBuZS51dGlsLm1hcChsYWJlbHMsIGZ1bmN0aW9uKGl0ZW0sIGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgaXRlbVRoZW1lID0ge1xuICAgICAgICAgICAgICAgIGNvbG9yOiB0aGVtZS5jb2xvcnNbaW5kZXhdXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpZiAodGhlbWUuc2luZ2xlQ29sb3JzKSB7XG4gICAgICAgICAgICAgICAgaXRlbVRoZW1lLnNpbmdsZUNvbG9yID0gdGhlbWUuc2luZ2xlQ29sb3JzW2luZGV4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGVtZS5ib3JkZXJDb2xvcikge1xuICAgICAgICAgICAgICAgIGl0ZW1UaGVtZS5ib3JkZXJDb2xvciA9IHRoZW1lLmJvcmRlckNvbG9yO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaXRlbS50aGVtZSA9IGl0ZW1UaGVtZTtcbiAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGxlZ2VuZCBsYWJlbHMuXG4gICAgICogQHJldHVybnMge2FycmF5LjxvYmplY3Q+fSBsZWdlbmQgbGFiZWxzLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VMZWdlbmRMYWJlbHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY2hhcnRUeXBlID0gdGhpcy5jaGFydFR5cGUsXG4gICAgICAgICAgICBsZWdlbmRMYWJlbHMgPSB0aGlzLmxlZ2VuZExhYmVscyxcbiAgICAgICAgICAgIGpvaW5MZWdlbmRMYWJlbHMgPSB0aGlzLmpvaW5MZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICBsYWJlbExlbiA9IGxlZ2VuZExhYmVscy5sZW5ndGgsXG4gICAgICAgICAgICB0aGVtZSA9IHRoaXMudGhlbWUsXG4gICAgICAgICAgICBjaGFydExlZ2VuZFRoZW1lID0gbmUudXRpbC5maWx0ZXIodGhlbWUsIGZ1bmN0aW9uKGl0ZW0sIG5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmUudXRpbC5pbkFycmF5KG5hbWUsIGNoYXJ0Q29uc3QuU0VSSUVTX1BST1BTKSA9PT0gLTEgJiYgbmFtZSAhPT0gJ2xhYmVsJztcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgY2hhcnRUeXBlcyA9IG5lLnV0aWwua2V5cyhjaGFydExlZ2VuZFRoZW1lKSxcbiAgICAgICAgICAgIGRlZmF1bHRMZWdlbmRUaGVtZSA9IHtcbiAgICAgICAgICAgICAgICBjb2xvcnM6IGRlZmF1bHRUaGVtZS5zZXJpZXMuY29sb3JzXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2hhcnRUaGVtZSwgcmVzdWx0O1xuXG4gICAgICAgIGlmICghY2hhcnRUeXBlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuX3NldFRoZW1lVG9MYWJlbHMoam9pbkxlZ2VuZExhYmVscywgdGhlbWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2hhcnRUaGVtZSA9IHRoZW1lW2NoYXJ0VHlwZV0gfHwgZGVmYXVsdExlZ2VuZFRoZW1lO1xuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5fc2V0VGhlbWVUb0xhYmVscyhqb2luTGVnZW5kTGFiZWxzLnNsaWNlKDAsIGxhYmVsTGVuKSwgY2hhcnRUaGVtZSk7XG4gICAgICAgICAgICBjaGFydFRoZW1lID0gdGhlbWVbbmUudXRpbC5maWx0ZXIoY2hhcnRUeXBlcywgZnVuY3Rpb24ocHJvcE5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvcE5hbWUgIT09IGNoYXJ0VHlwZTtcbiAgICAgICAgICAgIH0pWzBdXSB8fCBkZWZhdWx0TGVnZW5kVGhlbWU7XG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KHRoaXMuX3NldFRoZW1lVG9MYWJlbHMoam9pbkxlZ2VuZExhYmVscy5zbGljZShsYWJlbExlbiksIGNoYXJ0VGhlbWUpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGxlZ2VuZCBodG1sLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGxlZ2VuZCBodG1sXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUxlZ2VuZEh0bWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbGFiZWxzID0gdGhpcy5fbWFrZUxlZ2VuZExhYmVscygpLFxuICAgICAgICAgICAgdGVtcGxhdGUgPSBsZWdlbmRUZW1wbGF0ZS5UUExfTEVHRU5ELFxuICAgICAgICAgICAgbGFiZWxIZWlnaHQgPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxIZWlnaHQobGFiZWxzWzBdLmxhYmVsLCBsYWJlbHNbMF0udGhlbWUpICsgKExBQkVMX1BBRERJTkdfVE9QICogMiksXG4gICAgICAgICAgICBiYXNlTWFyZ2luVG9wID0gcGFyc2VJbnQoKGxhYmVsSGVpZ2h0IC0gTEVHRU5EX1JFQ1RfV0lEVEgpIC8gMiwgMTApIC0gMSxcbiAgICAgICAgICAgIGh0bWwgPSBuZS51dGlsLm1hcChsYWJlbHMsIGZ1bmN0aW9uKGxhYmVsLCBpbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciBib3JkZXJDc3NUZXh0ID0gbGFiZWwuYm9yZGVyQ29sb3IgPyByZW5kZXJVdGlsLmNvbmNhdFN0cignO2JvcmRlcjoxcHggc29saWQgJywgbGFiZWwuYm9yZGVyQ29sb3IpIDogJycsXG4gICAgICAgICAgICAgICAgICAgIHJlY3RNYXJnaW4sIG1hcmdpblRvcCwgZGF0YTtcbiAgICAgICAgICAgICAgICBpZiAobGFiZWwuY2hhcnRUeXBlID09PSAnbGluZScpIHtcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luVG9wID0gYmFzZU1hcmdpblRvcCArIExJTkVfTUFSR0lOX1RPUDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBtYXJnaW5Ub3AgPSBiYXNlTWFyZ2luVG9wO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZWN0TWFyZ2luID0gcmVuZGVyVXRpbC5jb25jYXRTdHIoJzttYXJnaW4tdG9wOicsIG1hcmdpblRvcCwgJ3B4Jyk7XG5cbiAgICAgICAgICAgICAgICBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICBjc3NUZXh0OiByZW5kZXJVdGlsLmNvbmNhdFN0cignYmFja2dyb3VuZC1jb2xvcjonLCBsYWJlbC50aGVtZS5zaW5nbGVDb2xvciB8fCBsYWJlbC50aGVtZS5jb2xvciwgYm9yZGVyQ3NzVGV4dCwgcmVjdE1hcmdpbiksXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogbGFiZWxIZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0VHlwZTogbGFiZWwuY2hhcnRUeXBlIHx8ICdyZWN0JyxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGxhYmVsLmxhYmVsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGVtcGxhdGUoZGF0YSk7XG4gICAgICAgICAgICB9LCB0aGlzKS5qb2luKCcnKTtcbiAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBjc3Mgc3R5bGUgb2YgbGFiZWwgYXJlYS5cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCBsYWJlbCBhcmVhIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3tmb250U2l6ZTpudW1iZXIsIGZvbnRGYW1pbHk6IHN0cmluZywgY29sb3I6IHN0cmluZ319IHRoZW1lIGxhYmVsIHRoZW1lXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyTGFiZWxUaGVtZTogZnVuY3Rpb24oZWwsIHRoZW1lKSB7XG4gICAgICAgIHZhciBjc3NUZXh0ID0gcmVuZGVyVXRpbC5tYWtlRm9udENzc1RleHQodGhlbWUpO1xuICAgICAgICBlbC5zdHlsZS5jc3NUZXh0ICs9ICc7JyArIGNzc1RleHQ7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTGVnZW5kO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFRoaXMgaXMgdGVtcGxhdGVzIG9mIGxlZ2VuZCB2aWV3LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxudmFyIHRlbXBsYXRlTWFrZXIgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3RlbXBsYXRlTWFrZXIuanMnKTtcblxudmFyIHRhZ3MgPSB7XG4gICAgSFRNTF9MRUdFTkQ6ICc8ZGl2IGNsYXNzPVwibmUtY2hhcnQtbGVnZW5kXCI+JyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwibmUtY2hhcnQtbGVnZW5kLXJlY3Qge3sgY2hhcnRUeXBlIH19XCIgc3R5bGU9XCJ7eyBjc3NUZXh0IH19XCI+PC9kaXY+JyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwibmUtY2hhcnQtbGVnZW5kLWxhYmVsXCIgc3R5bGU9XCJoZWlnaHQ6e3sgaGVpZ2h0IH19cHhcIj57eyBsYWJlbCB9fTwvZGl2PjwvZGl2Pidcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIFRQTF9MRUdFTkQ6IHRlbXBsYXRlTWFrZXIudGVtcGxhdGUodGFncy5IVE1MX0xFR0VORClcbn07XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgUGxvdCBjb21wb25lbnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBkb20gPSByZXF1aXJlKCcuLi9oZWxwZXJzL2RvbUhhbmRsZXIuanMnKSxcbiAgICBjYWxjdWxhdG9yID0gcmVxdWlyZSgnLi4vaGVscGVycy9jYWxjdWxhdG9yLmpzJyksXG4gICAgcmVuZGVyVXRpbCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvcmVuZGVyVXRpbC5qcycpLFxuICAgIHBsb3RUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vcGxvdFRlbXBsYXRlLmpzJyk7XG5cbnZhciBQbG90ID0gbmUudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIFBsb3QucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBQbG90IGNvbXBvbmVudC5cbiAgICAgKiBAY29uc3RydWN0cyBQbG90XG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnZUaWNrQ291bnQgdmVydGljYWwgdGljayBjb3VudFxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5oVGlja0NvdW50IGhvcml6b250YWwgdGljayBjb3VudFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5ib3VuZCBheGlzIGJvdW5kXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIGF4aXMgdGhlbWVcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgbmUudXRpbC5leHRlbmQodGhpcywgcGFyYW1zKTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFBsb3QgdmlldyBjbGFzc05hbWVcbiAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2xhc3NOYW1lID0gJ25lLWNoYXJ0LXBsb3QtYXJlYSc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBwbG90LlxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCB0b3A6IG51bWJlciwgcmlnaHQ6IG51bWJlcn19IGJvdW5kIHBsb3QgYXJlYSBib3VuZFxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gcGxvdCBlbGVtZW50XG4gICAgICovXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGVsID0gZG9tLmNyZWF0ZSgnRElWJywgdGhpcy5jbGFzc05hbWUpLFxuICAgICAgICAgICAgYm91bmQgPSB0aGlzLmJvdW5kO1xuICAgICAgICByZW5kZXJVdGlsLnJlbmRlckRpbWVuc2lvbihlbCwgYm91bmQuZGltZW5zaW9uKTtcbiAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJQb3NpdGlvbihlbCwgYm91bmQucG9zaXRpb24pO1xuICAgICAgICB0aGlzLl9yZW5kZXJMaW5lcyhlbCwgYm91bmQuZGltZW5zaW9uKTtcblxuICAgICAgICByZXR1cm4gZWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBwbG90IGxpbmVzLlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGRpbWVuc2lvbiBwbG90IGFyZWEgZGltZW5zaW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyTGluZXM6IGZ1bmN0aW9uKGVsLCBkaW1lbnNpb24pIHtcbiAgICAgICAgdmFyIGhQb3NpdGlvbnMgPSB0aGlzLm1ha2VIb3Jpem9udGFsUGl4ZWxQb3NpdGlvbnMoZGltZW5zaW9uLndpZHRoKSxcbiAgICAgICAgICAgIHZQb3NpdGlvbnMgPSB0aGlzLm1ha2VWZXJ0aWNhbFBpeGVsUG9zaXRpb25zKGRpbWVuc2lvbi5oZWlnaHQpLFxuICAgICAgICAgICAgdGhlbWUgPSB0aGlzLnRoZW1lLFxuICAgICAgICAgICAgbGluZUh0bWwgPSAnJztcblxuICAgICAgICBsaW5lSHRtbCArPSB0aGlzLl9tYWtlTGluZUh0bWwoe1xuICAgICAgICAgICAgcG9zaXRpb25zOiBoUG9zaXRpb25zLFxuICAgICAgICAgICAgc2l6ZTogZGltZW5zaW9uLmhlaWdodCxcbiAgICAgICAgICAgIGNsYXNzTmFtZTogJ3ZlcnRpY2FsJyxcbiAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogJ2xlZnQnLFxuICAgICAgICAgICAgc2l6ZVR5cGU6ICdoZWlnaHQnLFxuICAgICAgICAgICAgbGluZUNvbG9yOiB0aGVtZS5saW5lQ29sb3JcbiAgICAgICAgfSk7XG4gICAgICAgIGxpbmVIdG1sICs9IHRoaXMuX21ha2VMaW5lSHRtbCh7XG4gICAgICAgICAgICBwb3NpdGlvbnM6IHZQb3NpdGlvbnMsXG4gICAgICAgICAgICBzaXplOiBkaW1lbnNpb24ud2lkdGgsXG4gICAgICAgICAgICBjbGFzc05hbWU6ICdob3Jpem9udGFsJyxcbiAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogJ2JvdHRvbScsXG4gICAgICAgICAgICBzaXplVHlwZTogJ3dpZHRoJyxcbiAgICAgICAgICAgIGxpbmVDb2xvcjogdGhlbWUubGluZUNvbG9yXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGVsLmlubmVySFRNTCA9IGxpbmVIdG1sO1xuXG4gICAgICAgIHJlbmRlclV0aWwucmVuZGVyQmFja2dyb3VuZChlbCwgdGhlbWUuYmFja2dyb3VuZCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgaHRtbCBvZiBwbG90IGxpbmUuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxvYmplY3Q+fSBwYXJhbXMucG9zaXRpb25zIHBvc2l0aW9uc1xuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5zaXplIHdpZHRoIG9yIGhlaWdodFxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5jbGFzc05hbWUgbGluZSBjbGFzc05hbWVcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMucG9zaXRpb25UeXBlIHBvc2l0aW9uIHR5cGUgKGxlZnQgb3IgYm90dG9tKVxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5zaXplVHlwZSBzaXplIHR5cGUgKHNpemUgb3IgaGVpZ2h0KVxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5saW5lQ29sb3IgbGluZSBjb2xvclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGh0bWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlTGluZUh0bWw6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgdGVtcGxhdGUgPSBwbG90VGVtcGxhdGUuVFBMX1BMT1RfTElORSxcbiAgICAgICAgICAgIGxpbmVIdG1sID0gbmUudXRpbC5tYXAocGFyYW1zLnBvc2l0aW9ucywgZnVuY3Rpb24ocG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgY3NzVGV4dHMgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJVdGlsLmNvbmNhdFN0cihwYXJhbXMucG9zaXRpb25UeXBlLCAnOicsIHBvc2l0aW9uLCAncHgnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlclV0aWwuY29uY2F0U3RyKHBhcmFtcy5zaXplVHlwZSwgJzonLCBwYXJhbXMuc2l6ZSwgJ3B4JylcbiAgICAgICAgICAgICAgICAgICAgXSwgZGF0YTtcblxuICAgICAgICAgICAgICAgIGlmIChwYXJhbXMubGluZUNvbG9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGNzc1RleHRzLnB1c2gocmVuZGVyVXRpbC5jb25jYXRTdHIoJ2JhY2tncm91bmQtY29sb3I6JywgcGFyYW1zLmxpbmVDb2xvcikpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGRhdGEgPSB7Y2xhc3NOYW1lOiBwYXJhbXMuY2xhc3NOYW1lLCBjc3NUZXh0OiBjc3NUZXh0cy5qb2luKCc7Jyl9O1xuICAgICAgICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZShkYXRhKTtcbiAgICAgICAgICAgIH0sIHRoaXMpLmpvaW4oJycpO1xuICAgICAgICByZXR1cm4gbGluZUh0bWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgcGl4ZWwgdmFsdWUgb2YgdmVydGljYWwgcG9zaXRpb25zXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodCBwbG90IGhlaWdodFxuICAgICAqIEByZXR1cm5zIHthcnJheS48bnVtYmVyPn0gcG9zaXRpb25zXG4gICAgICovXG4gICAgbWFrZVZlcnRpY2FsUGl4ZWxQb3NpdGlvbnM6IGZ1bmN0aW9uKGhlaWdodCkge1xuICAgICAgICB2YXIgcG9zaXRpb25zID0gY2FsY3VsYXRvci5tYWtlUGl4ZWxQb3NpdGlvbnMoaGVpZ2h0LCB0aGlzLnZUaWNrQ291bnQpO1xuICAgICAgICBwb3NpdGlvbnMuc2hpZnQoKTtcbiAgICAgICAgcmV0dXJuIHBvc2l0aW9ucztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBwaXhlbCB2YWx1ZSBvZiBob3Jpem9udGFsIHBvc2l0aW9ucy5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGggcGxvdCB3aWR0aFxuICAgICAqIEByZXR1cm5zIHthcnJheS48bnVtYmVyPn0gcG9zaXRpb25zXG4gICAgICovXG4gICAgbWFrZUhvcml6b250YWxQaXhlbFBvc2l0aW9uczogZnVuY3Rpb24od2lkdGgpIHtcbiAgICAgICAgdmFyIHBvc2l0aW9ucyA9IGNhbGN1bGF0b3IubWFrZVBpeGVsUG9zaXRpb25zKHdpZHRoLCB0aGlzLmhUaWNrQ291bnQpO1xuICAgICAgICBwb3NpdGlvbnMuc2hpZnQoKTtcbiAgICAgICAgcmV0dXJuIHBvc2l0aW9ucztcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBQbG90O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFRoaXMgaXMgdGVtcGxhdGVzIG9mIHBsb3QgdmlldyAuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG52YXIgdGVtcGxhdGVNYWtlciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvdGVtcGxhdGVNYWtlci5qcycpO1xuXG52YXIgdGFncyA9IHtcbiAgICBIVE1MX1BMT1RfTElORTogJzxkaXYgY2xhc3M9XCJuZS1jaGFydC1wbG90LWxpbmUge3sgY2xhc3NOYW1lIH19XCIgc3R5bGU9XCJ7eyBjc3NUZXh0IH19XCI+PC9kaXY+J1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgVFBMX1BMT1RfTElORTogdGVtcGxhdGVNYWtlci50ZW1wbGF0ZSh0YWdzLkhUTUxfUExPVF9MSU5FKVxufTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBSYXBoYWVsIHJlbmRlciBwbHVnaW4uXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBCYXJDaGFydCA9IHJlcXVpcmUoJy4vcmFwaGFlbEJhckNoYXJ0LmpzJyksXG4gICAgTGluZUNoYXJ0ID0gcmVxdWlyZSgnLi9yYXBoYWVsTGluZUNoYXJ0LmpzJyksXG4gICAgUGllQ2hhcnQgPSByZXF1aXJlKCcuL3JhcGhhZWxQaWVDaGFydC5qcycpO1xuXG52YXIgcGx1Z2luTmFtZSA9ICdyYXBoYWVsJyxcbiAgICBwbHVnaW5SYXBoYWVsO1xuXG5wbHVnaW5SYXBoYWVsID0ge1xuICAgIGJhcjogQmFyQ2hhcnQsXG4gICAgY29sdW1uOiBCYXJDaGFydCxcbiAgICBsaW5lOiBMaW5lQ2hhcnQsXG4gICAgcGllOiBQaWVDaGFydFxufTtcblxubmUuYXBwbGljYXRpb24uY2hhcnQucmVnaXN0ZXJQbHVnaW4ocGx1Z2luTmFtZSwgcGx1Z2luUmFwaGFlbCk7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgUmFwaGFlbCBiYXIgY2hhcnQgcmVuZGVyZXIuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSYXBoYWVsID0gd2luZG93LlJhcGhhZWw7XG5cbi8qKlxuICogQGNsYXNzZGVzYyBSYXBoYWVsQmFyQ2hhcnQgaXMgZ3JhcGggcmVuZGVyZXIuXG4gKiBAY2xhc3MgUmFwaGFlbEJhckNoYXJ0XG4gKi9cbnZhciBSYXBoYWVsQmFyQ2hhcnQgPSBuZS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgUmFwaGFlbEJhckNoYXJ0LnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogUmVuZGVyIGZ1bmN0aW9uIG9mIGJhciBjaGFydFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNvbnRhaW5lciBlbGVtZW50XG4gICAgICogQHBhcmFtIHt7c2l6ZTogb2JqZWN0LCBtb2RlbDogb2JqZWN0LCBvcHRpb25zOiBvYmplY3QsIHRvb2x0aXBQb3NpdGlvbjogc3RyaW5nfX0gZGF0YSBjaGFydCBkYXRhXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gaW5DYWxsYmFjayBtb3VzZW92ZXIgY2FsbGJhY2tcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvdXRDYWxsYmFjayBtb3VzZW91dCBjYWxsYmFja1xuICAgICAqIEByZXR1cm4ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqL1xuICAgIHJlbmRlcjogZnVuY3Rpb24ocGFwZXIsIGNvbnRhaW5lciwgZGF0YSwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGdyb3VwQm91bmRzID0gZGF0YS5ncm91cEJvdW5kcyxcbiAgICAgICAgICAgIGRpbWVuc2lvbiA9IGRhdGEuZGltZW5zaW9uO1xuXG4gICAgICAgIGlmICghZ3JvdXBCb3VuZHMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghcGFwZXIpIHtcbiAgICAgICAgICAgIHBhcGVyID0gUmFwaGFlbChjb250YWluZXIsIGRpbWVuc2lvbi53aWR0aCwgZGltZW5zaW9uLmhlaWdodCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fcmVuZGVyQmFycyhwYXBlciwgZGF0YS50aGVtZSwgZ3JvdXBCb3VuZHMsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKTtcblxuICAgICAgICByZXR1cm4gcGFwZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBiYXJzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICogQHBhcmFtIHt7Y29sb3JzOiBzdHJpbmdbXSwgc2luZ2xlQ29sb3JzOiBzdHJpbmdbXSwgYm9yZGVyQ29sb3I6IHN0cmluZ319IHRoZW1lIGJhciBjaGFydCB0aGVtZVxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Ljx7bGVmdDogbnVtYmVyLCB0b3A6bnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn0+Pn0gZ3JvdXBCb3VuZHMgYm91bmRzXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gaW5DYWxsYmFjayBpbiBjYWxsYmFja1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG91dENhbGxiYWNrIG91dCBjYWxsYmFja1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlckJhcnM6IGZ1bmN0aW9uKHBhcGVyLCB0aGVtZSwgZ3JvdXBCb3VuZHMsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKSB7XG4gICAgICAgIHZhciBzaW5nbGVDb2xvcnMgPSAoZ3JvdXBCb3VuZHNbMF0ubGVuZ3RoID09PSAxKSAmJiB0aGVtZS5zaW5nbGVDb2xvcnMgfHwgW10sXG4gICAgICAgICAgICBjb2xvcnMgPSB0aGVtZS5jb2xvcnMsXG4gICAgICAgICAgICBib3JkZXJDb2xvciA9IHRoZW1lLmJvcmRlckNvbG9yIHx8ICdub25lJztcbiAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkoZ3JvdXBCb3VuZHMsIGZ1bmN0aW9uKGJvdW5kcywgZ3JvdXBJbmRleCkge1xuICAgICAgICAgICAgdmFyIHNpbmdsZUNvbG9yID0gc2luZ2xlQ29sb3JzW2dyb3VwSW5kZXhdO1xuICAgICAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkoYm91bmRzLCBmdW5jdGlvbihib3VuZCwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29sb3IgPSBzaW5nbGVDb2xvciB8fCBjb2xvcnNbaW5kZXhdLFxuICAgICAgICAgICAgICAgICAgICBpZCA9IGdyb3VwSW5kZXggKyAnLScgKyBpbmRleCxcbiAgICAgICAgICAgICAgICAgICAgcmVjdCA9IHRoaXMuX3JlbmRlckJhcihwYXBlciwgY29sb3IsIGJvcmRlckNvbG9yLCBib3VuZCk7XG4gICAgICAgICAgICAgICAgaWYgKHJlY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYmluZEhvdmVyRXZlbnQocmVjdCwgYm91bmQsIGlkLCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgcmVjdFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbG9yIHNlcmllcyBjb2xvclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBib3JkZXJDb2xvciBzZXJpZXMgYm9yZGVyQ29sb3JcbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGJvdW5kIGJvdW5kXG4gICAgICogQHJldHVybnMge29iamVjdH0gYmFyIHJlY3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJCYXI6IGZ1bmN0aW9uKHBhcGVyLCBjb2xvciwgYm9yZGVyQ29sb3IsIGJvdW5kKSB7XG4gICAgICAgIGlmIChib3VuZC53aWR0aCA8IDAgfHwgYm91bmQuaGVpZ2h0IDwgMCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJlY3QgPSBwYXBlci5yZWN0KGJvdW5kLmxlZnQsIGJvdW5kLnRvcCwgYm91bmQud2lkdGgsIGJvdW5kLmhlaWdodCk7XG4gICAgICAgIHJlY3QuYXR0cih7XG4gICAgICAgICAgICBmaWxsOiBjb2xvcixcbiAgICAgICAgICAgIHN0cm9rZTogYm9yZGVyQ29sb3JcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHJlY3Q7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJpbmQgaG92ZXIgZXZlbnQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHJlY3QgcmFwaGFlbCByZWN0XG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBib3VuZCBib3VuZFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpZCB0b29sdGlwIGlkXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gaW5DYWxsYmFjayBpbiBjYWxsYmFja1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG91dENhbGxiYWNrIG91dCBjYWxsYmFja1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2JpbmRIb3ZlckV2ZW50OiBmdW5jdGlvbihyZWN0LCBib3VuZCwgaWQsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKSB7XG4gICAgICAgIHJlY3QuaG92ZXIoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpbkNhbGxiYWNrKGJvdW5kLCBpZCk7XG4gICAgICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgb3V0Q2FsbGJhY2soaWQpO1xuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSYXBoYWVsQmFyQ2hhcnQ7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgUmFwaGFlbCBsaW5lIGNoYXJ0IHJlbmRlcmVyLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmFwaGFlbCA9IHdpbmRvdy5SYXBoYWVsLFxuICAgIERFRkFVTFRfRE9UX1dJRFRIID0gNCxcbiAgICBIT1ZFUl9ET1RfV0lEVEggPSA1O1xuXG4vKipcbiAqIEBjbGFzc2Rlc2MgUmFwaGFlbExpbmVDaGFydHMgaXMgZ3JhcGggcmVuZGVyZXIuXG4gKiBAY2xhc3MgUmFwaGFlbExpbmVDaGFydFxuICovXG52YXIgUmFwaGFlbExpbmVDaGFydCA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBSYXBoYWVsTGluZUNoYXJ0LnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogUmVuZGVyIGZ1bmN0aW9uIG9yIGxpbmUgY2hhcnQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY29udGFpbmVyXG4gICAgICogQHBhcmFtIHt7Z3JvdXBQb3NpdGlvbnM6IGFycmF5LjxhcnJheT4sIGRpbWVuc2lvbjogb2JqZWN0LCB0aGVtZTogb2JqZWN0LCBvcHRpb25zOiBvYmplY3R9fSBkYXRhIHJlbmRlciBkYXRhXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gaW5DYWxsYmFjayBpbiBjYWxsYmFja1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG91dENhbGxiYWNrIG91dCBjYWxsYmFja1xuICAgICAqIEByZXR1cm4ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqL1xuICAgIHJlbmRlcjogZnVuY3Rpb24ocGFwZXIsIGNvbnRhaW5lciwgZGF0YSwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGRpbWVuc2lvbiA9IGRhdGEuZGltZW5zaW9uLFxuICAgICAgICAgICAgZ3JvdXBQb3NpdGlvbnMgPSBkYXRhLmdyb3VwUG9zaXRpb25zLFxuICAgICAgICAgICAgdGhlbWUgPSBkYXRhLnRoZW1lLFxuICAgICAgICAgICAgY29sb3JzID0gdGhlbWUuY29sb3JzLFxuICAgICAgICAgICAgb3BhY2l0eSA9IGRhdGEub3B0aW9ucy5oYXNEb3QgPyAxIDogMCxcbiAgICAgICAgICAgIGdyb3VwUGF0aHMgPSB0aGlzLl9nZXRMaW5lc1BhdGgoZ3JvdXBQb3NpdGlvbnMpLFxuICAgICAgICAgICAgYm9yZGVyU3R5bGUgPSB0aGlzLl9tYWtlQm9yZGVyU3R5bGUodGhlbWUuYm9yZGVyQ29sb3IsIG9wYWNpdHkpLFxuICAgICAgICAgICAgb3V0RG90U3R5bGUgPSB0aGlzLl9tYWtlT3V0RG90U3R5bGUob3BhY2l0eSwgYm9yZGVyU3R5bGUpLFxuICAgICAgICAgICAgZ3JvdXBEb3RzO1xuXG4gICAgICAgIGlmICghcGFwZXIpIHtcbiAgICAgICAgICAgIHBhcGVyID0gUmFwaGFlbChjb250YWluZXIsIGRpbWVuc2lvbi53aWR0aCwgZGltZW5zaW9uLmhlaWdodCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9yZW5kZXJMaW5lcyhwYXBlciwgZ3JvdXBQYXRocywgY29sb3JzKTtcbiAgICAgICAgZ3JvdXBEb3RzID0gdGhpcy5fcmVuZGVyRG90cyhwYXBlciwgZ3JvdXBQb3NpdGlvbnMsIGNvbG9ycywgb3BhY2l0eSwgYm9yZGVyU3R5bGUpO1xuXG4gICAgICAgIHRoaXMub3V0RG90U3R5bGUgPSBvdXREb3RTdHlsZTtcbiAgICAgICAgdGhpcy5ncm91cERvdHMgPSBncm91cERvdHM7XG5cbiAgICAgICAgdGhpcy5fYXR0YWNoRXZlbnQoZ3JvdXBEb3RzLCBncm91cFBvc2l0aW9ucywgb3V0RG90U3R5bGUsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKTtcblxuICAgICAgICByZXR1cm4gcGFwZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYm9yZGVyIHN0eWxlLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBib3JkZXJDb2xvciBib3JkZXIgY29sb3JcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gb3BhY2l0eSBvcGFjaXR5XG4gICAgICogQHJldHVybnMge3tzdHJva2U6IHN0cmluZywgc3Ryb2tlLXdpZHRoOiBudW1iZXIsIHN0cmlrZS1vcGFjaXR5OiBudW1iZXJ9fSBib3JkZXIgc3R5bGVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQm9yZGVyU3R5bGU6IGZ1bmN0aW9uKGJvcmRlckNvbG9yLCBvcGFjaXR5KSB7XG4gICAgICAgIHZhciBib3JkZXJTdHlsZTtcbiAgICAgICAgaWYgKGJvcmRlckNvbG9yKSB7XG4gICAgICAgICAgICBib3JkZXJTdHlsZSA9IHtcbiAgICAgICAgICAgICAgICAnc3Ryb2tlJzogYm9yZGVyQ29sb3IsXG4gICAgICAgICAgICAgICAgJ3N0cm9rZS13aWR0aCc6IDEsXG4gICAgICAgICAgICAgICAgJ3N0cm9rZS1vcGFjaXR5Jzogb3BhY2l0eVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYm9yZGVyU3R5bGU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgZG90IHN0eWxlIGZvciBtb3VzZW91dCBldmVudC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gb3BhY2l0eSBvcGFjaXR5XG4gICAgICogQHBhcmFtIHtvYmplY3R9IGJvcmRlclN0eWxlIGJvcmRlciBzdHlsZVxuICAgICAqIEByZXR1cm5zIHt7ZmlsbC1vcGFjaXR5OiBudW1iZXIsIHN0cm9rZS1vcGFjaXR5OiBudW1iZXIsIHI6IG51bWJlcn19IHN0eWxlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZU91dERvdFN0eWxlOiBmdW5jdGlvbihvcGFjaXR5LCBib3JkZXJTdHlsZSkge1xuICAgICAgICB2YXIgb3V0RG90U3R5bGUgPSB7XG4gICAgICAgICAgICAnZmlsbC1vcGFjaXR5Jzogb3BhY2l0eSxcbiAgICAgICAgICAgICdzdHJva2Utb3BhY2l0eSc6IDAsXG4gICAgICAgICAgICByOiA0XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKGJvcmRlclN0eWxlKSB7XG4gICAgICAgICAgICBuZS51dGlsLmV4dGVuZChvdXREb3RTdHlsZSwgYm9yZGVyU3R5bGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG91dERvdFN0eWxlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgZG90LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGFlclxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBwb3NpdGlvbiBkb3QgcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29sb3IgZG90IGNvbG9yXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG9wYWNpdHkgb3BhY2l0eVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBib3JkZXJTdHlsZSBib3JkZXIgc3R5bGVcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSByYXBoYWVsIGRvdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlckRvdDogZnVuY3Rpb24ocGFwZXIsIHBvc2l0aW9uLCBjb2xvciwgb3BhY2l0eSwgYm9yZGVyU3R5bGUpIHtcbiAgICAgICAgdmFyIGRvdCA9IHBhcGVyLmNpcmNsZShwb3NpdGlvbi5sZWZ0LCBwb3NpdGlvbi50b3AsIERFRkFVTFRfRE9UX1dJRFRIKSxcbiAgICAgICAgICAgIGRvdFN0eWxlID0ge1xuICAgICAgICAgICAgICAgIGZpbGw6IGNvbG9yLFxuICAgICAgICAgICAgICAgICdmaWxsLW9wYWNpdHknOiBvcGFjaXR5LFxuICAgICAgICAgICAgICAgICdzdHJva2Utb3BhY2l0eSc6IDBcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgaWYgKGJvcmRlclN0eWxlKSB7XG4gICAgICAgICAgICBuZS51dGlsLmV4dGVuZChkb3RTdHlsZSwgYm9yZGVyU3R5bGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgZG90LmF0dHIoZG90U3R5bGUpO1xuXG4gICAgICAgIHJldHVybiBkb3Q7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBkb3RzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXkuPG9iamVjdD4+fSBncm91cFBvc2l0aW9ucyBwb3NpdGlvbnNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBjb2xvcnMgY29sb3JzXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG9wYWNpdHkgb3BhY2l0eVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBib3JkZXJTdHlsZSBib3JkZXIgc3R5bGVcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPG9iamVjdD59IGRvdHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJEb3RzOiBmdW5jdGlvbihwYXBlciwgZ3JvdXBQb3NpdGlvbnMsIGNvbG9ycywgb3BhY2l0eSwgYm9yZGVyU3R5bGUpIHtcbiAgICAgICAgdmFyIGRvdHMgPSBuZS51dGlsLm1hcChncm91cFBvc2l0aW9ucywgZnVuY3Rpb24ocG9zaXRpb25zLCBncm91cEluZGV4KSB7XG4gICAgICAgICAgICB2YXIgY29sb3IgPSBjb2xvcnNbZ3JvdXBJbmRleF07XG4gICAgICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAocG9zaXRpb25zLCBmdW5jdGlvbihwb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIHZhciBkb3QgPSB0aGlzLl9yZW5kZXJEb3QocGFwZXIsIHBvc2l0aW9uLCBjb2xvciwgb3BhY2l0eSwgYm9yZGVyU3R5bGUpO1xuICAgICAgICAgICAgICAgIHJldHVybiBkb3Q7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgcmV0dXJuIGRvdHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgbGluZSBwYXRoLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBmeCBmcm9tIHhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZnkgZnJvbSB5XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHR4IHRvIHhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdHkgdG8geVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aCB3aWR0aFxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IHBhdGhcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlTGluZVBhdGg6IGZ1bmN0aW9uKGZ4LCBmeSwgdHgsIHR5LCB3aWR0aCkge1xuICAgICAgICB2YXIgZnJvbVBvaW50ID0gW2Z4LCBmeV07XG4gICAgICAgIHZhciB0b1BvaW50ID0gW3R4LCB0eV07XG5cbiAgICAgICAgd2lkdGggPSB3aWR0aCB8fCAxO1xuXG4gICAgICAgIGlmIChmcm9tUG9pbnRbMF0gPT09IHRvUG9pbnRbMF0pIHtcbiAgICAgICAgICAgIGZyb21Qb2ludFswXSA9IHRvUG9pbnRbMF0gPSBNYXRoLnJvdW5kKGZyb21Qb2ludFswXSkgLSAod2lkdGggJSAyIC8gMik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZyb21Qb2ludFsxXSA9PT0gdG9Qb2ludFsxXSkge1xuICAgICAgICAgICAgZnJvbVBvaW50WzFdID0gdG9Qb2ludFsxXSA9IE1hdGgucm91bmQoZnJvbVBvaW50WzFdKSArICh3aWR0aCAlIDIgLyAyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAnTScgKyBmcm9tUG9pbnQuam9pbignICcpICsgJ0wnICsgdG9Qb2ludC5qb2luKCcgJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjZW50ZXIgcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gZnJvbVBvcyBmcm9tIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IHRvUG9zIHRvIHBvc2l0aW9uXG4gICAgICogQHJldHVybnMge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gcG9zaXRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRDZW50ZXI6IGZ1bmN0aW9uKGZyb21Qb3MsIHRvUG9zKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsZWZ0OiAoZnJvbVBvcy5sZWZ0ICsgdG9Qb3MubGVmdCkgLyAyLFxuICAgICAgICAgICAgdG9wOiAoZnJvbVBvcy50b3AgKyB0b1Bvcy50b3ApIC8gMlxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgbGluZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGggbGluZSBwYXRoXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbG9yIGxpbmUgY29sb3JcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3Ryb2tlV2lkdGggc3Ryb2tlIHdpZHRoXG4gICAgICogQHJldHVybnMge29iamVjdH0gcmFwaGFlbCBsaW5lXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyTGluZTogZnVuY3Rpb24ocGFwZXIsIHBhdGgsIGNvbG9yLCBzdHJva2VXaWR0aCkge1xuICAgICAgICB2YXIgbGluZSA9IHBhcGVyLnBhdGgoW3BhdGhdKSxcbiAgICAgICAgICAgIHN0cm9rZVN0eWxlID0ge1xuICAgICAgICAgICAgICAgIHN0cm9rZTogY29sb3IsXG4gICAgICAgICAgICAgICAgJ3N0cm9rZS13aWR0aCc6IHN0cm9rZVdpZHRoIHx8IDJcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgaWYgKGNvbG9yID09PSAndHJhbnNwYXJlbnQnKSB7XG4gICAgICAgICAgICBzdHJva2VTdHlsZS5zdHJva2UgPSAnI2ZmZic7XG4gICAgICAgICAgICBzdHJva2VTdHlsZVsnc3Ryb2tlLW9wYWNpdHknXSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgbGluZS5hdHRyKHN0cm9rZVN0eWxlKTtcblxuICAgICAgICByZXR1cm4gbGluZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGJhY2tncm91bmQgbGluZXMuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheS48c3RyaW5nPj59IGdyb3VwUGF0aHMgcGF0aHNcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gbGluZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJCZ0xpbmVzOiBmdW5jdGlvbihwYXBlciwgZ3JvdXBQYXRocykge1xuICAgICAgICB2YXIgZ3JvdXBMaW5lcyA9IHRoaXMuX3JlbmRlckxpbmVzKHBhcGVyLCBncm91cFBhdGhzLCBbXSwgMTApO1xuICAgICAgICByZXR1cm4gZ3JvdXBMaW5lcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGxpbmVzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXkuPHN0cmluZz4+fSBncm91cFBhdGhzIHBhdGhzXG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gY29sb3JzIGxpbmUgY29sb3JzXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHN0cm9rZVdpZHRoIHN0cm9rZSB3aWR0aFxuICAgICAqIEByZXR1cm5zIHthcnJheS48YXJyYXkuPG9iamVjdD4+fSBsaW5lc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlckxpbmVzOiBmdW5jdGlvbihwYXBlciwgZ3JvdXBQYXRocywgY29sb3JzLCBzdHJva2VXaWR0aCkge1xuICAgICAgICB2YXIgZ3JvdXBMaW5lcyA9IG5lLnV0aWwubWFwKGdyb3VwUGF0aHMsIGZ1bmN0aW9uKHBhdGhzLCBncm91cEluZGV4KSB7XG4gICAgICAgICAgICB2YXIgY29sb3IgPSBjb2xvcnNbZ3JvdXBJbmRleF0gfHwgJ3RyYW5zcGFyZW50JztcbiAgICAgICAgICAgIHJldHVybiBuZS51dGlsLm1hcChwYXRocywgZnVuY3Rpb24ocGF0aCkge1xuICAgICAgICAgICAgICAgIHZhciBmaXJzdExpbmUgPSB0aGlzLl9yZW5kZXJMaW5lKHBhcGVyLCBwYXRoWzBdLCBjb2xvciwgc3Ryb2tlV2lkdGgpLFxuICAgICAgICAgICAgICAgICAgICBzZWNvbmRMaW5lID0gdGhpcy5fcmVuZGVyTGluZShwYXBlciwgcGF0aFsxXSwgY29sb3IsIHN0cm9rZVdpZHRoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gW2ZpcnN0TGluZSwgc2Vjb25kTGluZV07XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgcmV0dXJuIGdyb3VwTGluZXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBsaW5lcyBwYXRoLlxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gZ3JvdXBQb3NpdGlvbnMgcG9zaXRpb25zXG4gICAgICogQHJldHVybnMge2FycmF5LjxhcnJheS48c3RyaW5nPj59IHBhdGhzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0TGluZXNQYXRoOiBmdW5jdGlvbihncm91cFBvc2l0aW9ucykge1xuICAgICAgICB2YXIgZ3JvdXBQYXRocyA9IG5lLnV0aWwubWFwKGdyb3VwUG9zaXRpb25zLCBmdW5jdGlvbihwb3NpdGlvbnMpIHtcbiAgICAgICAgICAgIHZhciBmcm9tUG9zID0gcG9zaXRpb25zWzBdLFxuICAgICAgICAgICAgICAgIHJlc3QgPSBwb3NpdGlvbnMuc2xpY2UoMSk7XG4gICAgICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAocmVzdCwgZnVuY3Rpb24ocG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgY2VudGVyUG9zID0gdGhpcy5fZ2V0Q2VudGVyKGZyb21Qb3MsIHBvc2l0aW9uKSxcbiAgICAgICAgICAgICAgICAgICAgZmlyc3RQYXRoID0gdGhpcy5fbWFrZUxpbmVQYXRoKGZyb21Qb3MubGVmdCwgZnJvbVBvcy50b3AsIGNlbnRlclBvcy5sZWZ0LCBjZW50ZXJQb3MudG9wKSxcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kUGF0aCA9IHRoaXMuX21ha2VMaW5lUGF0aChjZW50ZXJQb3MubGVmdCwgY2VudGVyUG9zLnRvcCwgcG9zaXRpb24ubGVmdCwgcG9zaXRpb24udG9wKTtcbiAgICAgICAgICAgICAgICBmcm9tUG9zID0gcG9zaXRpb247XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtmaXJzdFBhdGgsIHNlY29uZFBhdGhdO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgICByZXR1cm4gZ3JvdXBQYXRocztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQmluZCBob3ZlciBldmVudC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGFyZ2V0IHJhcGhhZWwgaXRlbVxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBwb3NpdGlvbiBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpZCBpZFxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGluQ2FsbGJhY2sgaW4gY2FsbGJhY2tcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvdXRDYWxsYmFjayBvdXQgY2FsbGJhY2tcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9iaW5kSG92ZXJFdmVudDogZnVuY3Rpb24odGFyZ2V0LCBwb3NpdGlvbiwgaWQsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKSB7XG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgdGFyZ2V0LmhvdmVyKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhhdC5zaG93ZWRJZCA9IGlkO1xuICAgICAgICAgICAgaW5DYWxsYmFjayhwb3NpdGlvbiwgaWQpO1xuICAgICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIG91dENhbGxiYWNrKGlkKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCBldmVudC5cbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheS48b2JqZWN0Pj59IGdyb3VwRG90cyBkb3RzXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXkuPG9iamVjdD4+fSBncm91cFBvc2l0aW9ucyBwb3NpdGlvbnNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3V0RG90U3R5bGUgZG90IHN0eWxlXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gaW5DYWxsYmFjayBpbiBjYWxsYmFja1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG91dENhbGxiYWNrIG91dCBjYWxsYmFja1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2F0dGFjaEV2ZW50OiBmdW5jdGlvbihncm91cERvdHMsIGdyb3VwUG9zaXRpb25zLCBvdXREb3RTdHlsZSwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spIHtcbiAgICAgICAgbmUudXRpbC5mb3JFYWNoKGdyb3VwRG90cywgZnVuY3Rpb24oZG90cywgZ3JvdXBJbmRleCkge1xuICAgICAgICAgICAgbmUudXRpbC5mb3JFYWNoKGRvdHMsIGZ1bmN0aW9uKGRvdCwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgcG9zaXRpb24gPSBncm91cFBvc2l0aW9uc1tncm91cEluZGV4XVtpbmRleF0sXG4gICAgICAgICAgICAgICAgICAgIGlkID0gaW5kZXggKyAnLScgKyBncm91cEluZGV4O1xuICAgICAgICAgICAgICAgICAgICAvL3ByZXZJbmRleCwgcHJldkRvdCwgcHJldlBvc2l0b24sIHByZXZJZCwgYmdMaW5lcywgbGluZXM7XG4gICAgICAgICAgICAgICAgdGhpcy5fYmluZEhvdmVyRXZlbnQoZG90LCBwb3NpdGlvbiwgaWQsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICAvL2lmIChpbmRleCA+IDApIHtcbiAgICAgICAgICAgICAgICAvLyAgICBwcmV2SW5kZXggPSBpbmRleCAtIDE7XG4gICAgICAgICAgICAgICAgLy8gICAgcHJldkRvdCA9IHNjb3BlW3ByZXZJbmRleF07XG4gICAgICAgICAgICAgICAgLy8gICAgcHJldlBvc2l0b24gPSBncm91cFBvc2l0aW9uc1tncm91cEluZGV4XVtwcmV2SW5kZXhdO1xuICAgICAgICAgICAgICAgIC8vICAgIHByZXZJZCA9IHByZXZJbmRleCArICctJyArIGdyb3VwSW5kZXg7XG4gICAgICAgICAgICAgICAgLy8gICAgLy9iZ0xpbmVzID0gZ3JvdXBCZ0xpbmVzW2dyb3VwSW5kZXhdW3ByZXZJbmRleF07XG4gICAgICAgICAgICAgICAgLy8gICAgbGluZXMgPSBncm91cExpbmVzW2dyb3VwSW5kZXhdW3ByZXZJbmRleF07XG4gICAgICAgICAgICAgICAgLy8gICAgdGhpcy5fYmluZEhvdmVyRXZlbnQoYmdMaW5lc1swXSwgcHJldkRvdCwgb3V0RG90U3R5bGUsIHByZXZQb3NpdG9uLCBwcmV2SWQsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICAvLyAgICB0aGlzLl9iaW5kSG92ZXJFdmVudChiZ0xpbmVzWzFdLCBkb3QsIG91dERvdFN0eWxlLCBwb3NpdGlvbiwgaWQsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICAvLyAgICB0aGlzLl9iaW5kSG92ZXJFdmVudChsaW5lc1swXSwgcHJldkRvdCwgb3V0RG90U3R5bGUsIHByZXZQb3NpdG9uLCBwcmV2SWQsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICAvLyAgICB0aGlzLl9iaW5kSG92ZXJFdmVudChsaW5lc1sxXSwgZG90LCBvdXREb3RTdHlsZSwgcG9zaXRpb24sIGlkLCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgLy99XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNob3cgYW5pbWF0aW9uLlxuICAgICAqIEBwYXJhbSB7e2dyb3VwSW5kZXg6IG51bWJlciwgaW5kZXg6bnVtYmVyfX0gZGF0YSBzaG93IGluZm9cbiAgICAgKi9cbiAgICBzaG93QW5pbWF0aW9uOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBpbmRleCA9IGRhdGEuZ3JvdXBJbmRleCwgLy8gTGluZSBjaGFydCBoYXMgcGl2b3QgdmFsdWVzLlxuICAgICAgICAgICAgZ3JvdXBJbmRleCA9IGRhdGEuaW5kZXgsXG4gICAgICAgICAgICBkb3QgPSB0aGlzLmdyb3VwRG90c1tncm91cEluZGV4XVtpbmRleF07XG5cbiAgICAgICAgZG90LmF0dHIoe1xuICAgICAgICAgICAgJ2ZpbGwtb3BhY2l0eSc6IDEsXG4gICAgICAgICAgICAnc3Ryb2tlLW9wYWNpdHknOiAwLjMsXG4gICAgICAgICAgICAnc3Ryb2tlLXdpZHRoJzogMyxcbiAgICAgICAgICAgIHI6IEhPVkVSX0RPVF9XSURUSFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSGlkZSBhbmltYXRpb24uXG4gICAgICogQHBhcmFtIHt7Z3JvdXBJbmRleDogbnVtYmVyLCBpbmRleDpudW1iZXJ9fSBkYXRhIGhpZGUgaW5mb1xuICAgICAqL1xuICAgIGhpZGVBbmltYXRpb246IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gZGF0YS5ncm91cEluZGV4LCAvLyBMaW5lIGNoYXJ0IGhhcyBwaXZvdCB2YWx1ZXMuXG4gICAgICAgICAgICBncm91cEluZGV4ID0gZGF0YS5pbmRleCxcbiAgICAgICAgICAgIGRvdCA9IHRoaXMuZ3JvdXBEb3RzW2dyb3VwSW5kZXhdW2luZGV4XTtcblxuICAgICAgICBkb3QuYXR0cih0aGlzLm91dERvdFN0eWxlKTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSYXBoYWVsTGluZUNoYXJ0O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFJhcGhhZWwgcGllIGNoYXJ0IHJlbmRlcmVyLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmFwaGFlbCA9IHdpbmRvdy5SYXBoYWVsLFxuICAgIFJBRCA9IE1hdGguUEkgLyAxODAsXG4gICAgQU5JTUFUSU9OX1RJTUUgPSA1MDA7XG5cbi8qKlxuICogQGNsYXNzZGVzYyBSYXBoYWVsUGllQ2hhcnRzIGlzIGdyYXBoIHJlbmRlcmVyLlxuICogQGNsYXNzIFJhcGhhZWxQaWVDaGFydFxuICovXG52YXIgUmFwaGFlbFBpZUNoYXJ0ID0gbmUudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIFJhcGhhZWxQaWVDaGFydC5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIFJlbmRlciBmdW5jdGlvbiBvciBsaW5lIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNvbnRhaW5lclxuICAgICAqIEBwYXJhbSB7e3BlcmNlbnRWYWx1ZXM6IGFycmF5LjxudW1iZXI+LCBjaXJjbGVCb3VuZHM6IHtjeDogbnVtYmVyLCBjeTogbnVtYmVyLCByOiBudW1iZXJ9LCBkaW1lbnNpb246IG9iamVjdCwgdGhlbWU6IG9iamVjdCwgb3B0aW9uczogb2JqZWN0fX0gZGF0YSByZW5kZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGluQ2FsbGJhY2sgaW4gY2FsbGJhY2tcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvdXRDYWxsYmFjayBvdXQgY2FsbGJhY2tcbiAgICAgKiBAcmV0dXJuIHtvYmplY3R9IHBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKi9cbiAgICByZW5kZXI6IGZ1bmN0aW9uKHBhcGVyLCBjb250YWluZXIsIGRhdGEsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKSB7XG4gICAgICAgIHZhciBkaW1lbnNpb24gPSBkYXRhLmRpbWVuc2lvbjtcbiAgICAgICAgaWYgKCFwYXBlcikge1xuICAgICAgICAgICAgcGFwZXIgPSBSYXBoYWVsKGNvbnRhaW5lciwgZGltZW5zaW9uLndpZHRoLCBkaW1lbnNpb24uaGVpZ2h0KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9yZW5kZXJQaWUocGFwZXIsIGRhdGEsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKTtcblxuICAgICAgICByZXR1cm4gcGFwZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBzZWN0b3JcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMucGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqICAgICAgQHBhcmFtIHt7Y3g6IG51bWJlciwgY3k6IG51bWJlciwgcjpudW1iZXJ9fSBwYXJhbXMuY2lyY2xlQm91bmRzIGNpcmNsZSBib3VuZHNcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuc3RhcnRBbmdsZSBzdGFydCBhbmdsZVxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5lbmRBbmdsZSBlbmQgYW5nbGVcbiAgICAgKiAgICAgIEBwYXJhbSB7e2ZpbGw6IHN0cmluZywgc3Ryb2tlOiBzdHJpbmcsIHN0cmlrZS13aWR0aDogc3RyaW5nfX0gcGFyYW1zLmF0dHJzIGF0dHJzXG4gICAgICogQHJldHVybnMge29iamVjdH0gcmFwaGFlbCBvYmplY3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJTZWN0b3I6IGZ1bmN0aW9uIChwYXJhbXMpIHtcbiAgICAgICAgdmFyIGN4ID0gcGFyYW1zLmNpcmNsZUJvdW5kcy5jeCxcbiAgICAgICAgICAgIGN5ID0gcGFyYW1zLmNpcmNsZUJvdW5kcy5jeSxcbiAgICAgICAgICAgIHIgPSBwYXJhbXMuY2lyY2xlQm91bmRzLnIsXG4gICAgICAgICAgICB4MSA9IGN4ICsgciAqIE1hdGguY29zKC1wYXJhbXMuc3RhcnRBbmdsZSAqIFJBRCksXG4gICAgICAgICAgICB4MiA9IGN4ICsgciAqIE1hdGguY29zKC1wYXJhbXMuZW5kQW5nbGUgKiBSQUQpLFxuICAgICAgICAgICAgeTEgPSBjeSArIHIgKiBNYXRoLnNpbigtcGFyYW1zLnN0YXJ0QW5nbGUgKiBSQUQpLFxuICAgICAgICAgICAgeTIgPSBjeSArIHIgKiBNYXRoLnNpbigtcGFyYW1zLmVuZEFuZ2xlICogUkFEKSxcbiAgICAgICAgICAgIHBhdGhQYXJhbSA9IFtcIk1cIiwgY3gsIGN5LCBcIkxcIiwgeDEsIHkxLCBcIkFcIiwgciwgciwgMCwgKyhwYXJhbXMuZW5kQW5nbGUgLSBwYXJhbXMuc3RhcnRBbmdsZSA+IDE4MCksIDAsIHgyLCB5MiwgXCJ6XCJdO1xuICAgICAgICByZXR1cm4gcGFyYW1zLnBhcGVyLnBhdGgocGF0aFBhcmFtKS5hdHRyKHBhcmFtcy5hdHRycyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBwaWUgZ3JhcGguXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKiBAcGFyYW0ge3twZXJjZW50VmFsdWVzOiBhcnJheS48bnVtYmVyPiwgY2lyY2xlQm91bmRzOiB7Y3g6IG51bWJlciwgY3k6IG51bWJlciwgcjogbnVtYmVyfSwgZGltZW5zaW9uOiBvYmplY3QsIHRoZW1lOiBvYmplY3QsIG9wdGlvbnM6IG9iamVjdH19IGRhdGEgcmVuZGVyIGRhdGFcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBpbkNhbGxiYWNrIGluIGNhbGxiYWNrXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gb3V0Q2FsbGJhY2sgb3V0IGNhbGxiYWNrXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyUGllOiBmdW5jdGlvbihwYXBlciwgZGF0YSwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHBlcmNlbnRWYWx1ZXMgPSBkYXRhLnBlcmNlbnRWYWx1ZXNbMF0sXG4gICAgICAgICAgICBjaXJjbGVCb3VuZHMgPSBkYXRhLmNpcmNsZUJvdW5kcyxcbiAgICAgICAgICAgIGNvbG9ycyA9IGRhdGEudGhlbWUuY29sb3JzLFxuICAgICAgICAgICAgY2hhcnRCYWNrZ3JvdW5kID0gZGF0YS5jaGFydEJhY2tncm91bmQsXG4gICAgICAgICAgICBjeCA9IGNpcmNsZUJvdW5kcy5jeCxcbiAgICAgICAgICAgIGN5ID0gY2lyY2xlQm91bmRzLmN5LFxuICAgICAgICAgICAgciA9IGNpcmNsZUJvdW5kcy5yLFxuICAgICAgICAgICAgYW5nbGUgPSAwLFxuICAgICAgICAgICAgZGVsdGEgPSAxMCxcbiAgICAgICAgICAgIGNoYXJ0ID0gcGFwZXIuc2V0KCk7XG5cbiAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkocGVyY2VudFZhbHVlcywgZnVuY3Rpb24ocGVyY2VudFZhbHVlLCBpbmRleCkge1xuICAgICAgICAgICAgdmFyIGFuZ2xlUGx1cyA9IDM2MCAqIHBlcmNlbnRWYWx1ZSxcbiAgICAgICAgICAgICAgICBwb3BBbmdsZSA9IGFuZ2xlICsgKGFuZ2xlUGx1cyAvIDIpLFxuICAgICAgICAgICAgICAgIGNvbG9yID0gY29sb3JzW2luZGV4XSxcbiAgICAgICAgICAgICAgICBwID0gdGhpcy5fcmVuZGVyU2VjdG9yKHtcbiAgICAgICAgICAgICAgICAgICAgcGFwZXI6IHBhcGVyLFxuICAgICAgICAgICAgICAgICAgICBjaXJjbGVCb3VuZHM6IGNpcmNsZUJvdW5kcyxcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRBbmdsZTogYW5nbGUsXG4gICAgICAgICAgICAgICAgICAgIGVuZEFuZ2xlOiBhbmdsZSArIGFuZ2xlUGx1cyxcbiAgICAgICAgICAgICAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGw6IFwiOTAtXCIgKyBjb2xvciArIFwiLVwiICsgY29sb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJva2U6IGNoYXJ0QmFja2dyb3VuZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICdzdHJva2Utd2lkdGgnOiAxXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBwb3NpdGlvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogY3ggKyAociArIGRlbHRhKSAqIE1hdGguY29zKC1wb3BBbmdsZSAqIFJBRCksXG4gICAgICAgICAgICAgICAgICAgIHRvcDogY3kgKyAociArIGRlbHRhKSAqIE1hdGguc2luKC1wb3BBbmdsZSAqIFJBRClcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLl9iaW5kSG92ZXJFdmVudCh7XG4gICAgICAgICAgICAgICAgdGFyZ2V0OiBwLFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBwb3NpdGlvbixcbiAgICAgICAgICAgICAgICBpZDogJzAtJyArIGluZGV4LFxuICAgICAgICAgICAgICAgIGluQ2FsbGJhY2s6IGluQ2FsbGJhY2ssXG4gICAgICAgICAgICAgICAgb3V0Q2FsbGJhY2s6IG91dENhbGxiYWNrXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNoYXJ0LnB1c2gocCk7XG4gICAgICAgICAgICBhbmdsZSArPSBhbmdsZVBsdXM7XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIHRoaXMuY2lyY2xlQm91bmRzID0gY2lyY2xlQm91bmRzO1xuICAgICAgICB0aGlzLmNoYXJ0ID0gY2hhcnQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJpbmQgaG92ZXIgZXZlbnQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRhcmdldCByYXBoYWVsIGl0ZW1cbiAgICAgKiAgICAgIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBwYXJhbXMucG9zaXRpb24gcG9zaXRpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMuaWQgaWRcbiAgICAgKiAgICAgIEBwYXJhbSB7ZnVuY3Rpb259IHBhcmFtcy5pbkNhbGxiYWNrIGluIGNhbGxiYWNrXG4gICAgICogICAgICBAcGFyYW0ge2Z1bmN0aW9ufSBwYXJhbXMub3V0Q2FsbGJhY2sgb3V0IGNhbGxiYWNrXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYmluZEhvdmVyRXZlbnQ6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgIHBhcmFtcy50YXJnZXQubW91c2VvdmVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoYXQuc2hvd2VkSWQgPSBwYXJhbXMuaWQ7XG4gICAgICAgICAgICBwYXJhbXMuaW5DYWxsYmFjayhwYXJhbXMucG9zaXRpb24sIHBhcmFtcy5pZCk7XG4gICAgICAgIH0pLm1vdXNlb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHBhcmFtcy5vdXRDYWxsYmFjayhwYXJhbXMuaWQpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2hvdyBhbmltYXRpb24uXG4gICAgICogQHBhcmFtIHt7Z3JvdXBJbmRleDogbnVtYmVyLCBpbmRleDpudW1iZXJ9fSBkYXRhIHNob3cgaW5mb1xuICAgICAqL1xuICAgIHNob3dBbmltYXRpb246IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIHRhcmdldCA9IHRoaXMuY2hhcnRbZGF0YS5pbmRleF0sXG4gICAgICAgICAgICBjeCA9IHRoaXMuY2lyY2xlQm91bmRzLmN4LFxuICAgICAgICAgICAgY3kgPSB0aGlzLmNpcmNsZUJvdW5kcy5jeTtcbiAgICAgICAgdGFyZ2V0LnN0b3AoKS5hbmltYXRlKHt0cmFuc2Zvcm06IFwiczEuMSAxLjEgXCIgKyBjeCArIFwiIFwiICsgY3l9LCBBTklNQVRJT05fVElNRSwgXCJlbGFzdGljXCIpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBIaWRlIGFuaW1hdGlvbi5cbiAgICAgKiBAcGFyYW0ge3tncm91cEluZGV4OiBudW1iZXIsIGluZGV4Om51bWJlcn19IGRhdGEgaGlkZSBpbmZvXG4gICAgICovXG4gICAgaGlkZUFuaW1hdGlvbjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgdGFyZ2V0ID0gdGhpcy5jaGFydFtkYXRhLmluZGV4XTtcbiAgICAgICAgdGFyZ2V0LnN0b3AoKS5hbmltYXRlKHt0cmFuc2Zvcm06IFwiXCJ9LCBBTklNQVRJT05fVElNRSwgXCJlbGFzdGljXCIpO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhcGhhZWxQaWVDaGFydDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuL2NvbnN0LmpzJyksXG4gICAgY2hhcnRGYWN0b3J5ID0gcmVxdWlyZSgnLi9mYWN0b3JpZXMvY2hhcnRGYWN0b3J5LmpzJyksXG4gICAgQmFyQ2hhcnQgPSByZXF1aXJlKCcuL2NoYXJ0cy9iYXJDaGFydC5qcycpLFxuICAgIENvbHVtbkNoYXJ0ID0gcmVxdWlyZSgnLi9jaGFydHMvY29sdW1uQ2hhcnQuanMnKSxcbiAgICBMaW5lQ2hhcnQgPSByZXF1aXJlKCcuL2NoYXJ0cy9saW5lQ2hhcnQuanMnKSxcbiAgICBDb21ib0NoYXJ0ID0gcmVxdWlyZSgnLi9jaGFydHMvY29tYm9DaGFydC5qcycpLFxuICAgIFBpZUNoYXJ0ID0gcmVxdWlyZSgnLi9jaGFydHMvcGllQ2hhcnQuanMnKTtcblxuY2hhcnRGYWN0b3J5LnJlZ2lzdGVyKGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9CQVIsIEJhckNoYXJ0KTtcbmNoYXJ0RmFjdG9yeS5yZWdpc3RlcihjaGFydENvbnN0LkNIQVJUX1RZUEVfQ09MVU1OLCBDb2x1bW5DaGFydCk7XG5jaGFydEZhY3RvcnkucmVnaXN0ZXIoY2hhcnRDb25zdC5DSEFSVF9UWVBFX0xJTkUsIExpbmVDaGFydCk7XG5jaGFydEZhY3RvcnkucmVnaXN0ZXIoY2hhcnRDb25zdC5DSEFSVF9UWVBFX0NPTUJPLCBDb21ib0NoYXJ0KTtcbmNoYXJ0RmFjdG9yeS5yZWdpc3RlcihjaGFydENvbnN0LkNIQVJUX1RZUEVfUElFLCBQaWVDaGFydCk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjaGFydENvbnN0ID0gcmVxdWlyZSgnLi9jb25zdC5qcycpLFxuICAgIHRoZW1lRmFjdG9yeSA9IHJlcXVpcmUoJy4vZmFjdG9yaWVzL3RoZW1lRmFjdG9yeS5qcycpLFxuICAgIGRlZmF1bHRUaGVtZSA9IHJlcXVpcmUoJy4vdGhlbWVzL2RlZmF1bHRUaGVtZS5qcycpO1xuXG50aGVtZUZhY3RvcnkucmVnaXN0ZXIoY2hhcnRDb25zdC5ERUZBVUxUX1RIRU1FX05BTUUsIGRlZmF1bHRUaGVtZSk7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgQmFyIGNoYXJ0IHNlcmllcyBjb21wb25lbnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTZXJpZXMgPSByZXF1aXJlKCcuL3Nlcmllcy5qcycpLFxuICAgIHJlbmRlclV0aWwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3JlbmRlclV0aWwuanMnKTtcblxudmFyIEhJRERFTl9XSURUSCA9IDE7XG5cbnZhciBCYXJDaGFydFNlcmllcyA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoU2VyaWVzLCAvKiogQGxlbmRzIFNlcmllcy5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIEJhciBjaGFydCBzZXJpZXMgY29tcG9uZW50LlxuICAgICAqIEBjb25zdHJ1Y3RzIEJhckNoYXJ0U2VyaWVzXG4gICAgICogQGV4dGVuZHMgU2VyaWVzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm1vZGVsIHNlcmllcyBtb2RlbFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5vcHRpb25zIHNlcmllcyBvcHRpb25zXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIHNlcmllcyB0aGVtZVxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBTZXJpZXMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBib3VuZHMgb2YgYmFyIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDpudW1iZXJ9fSBkaW1lbnNpb24gYmFyIGNoYXJ0IGRpbWVuc2lvblxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBoaWRkZW5XaWR0aCBoaWRkZW4gd2lkdGhcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gYm91bmRzXG4gICAgICovXG4gICAgX21ha2VCb3VuZHM6IGZ1bmN0aW9uKGRpbWVuc2lvbiwgaGlkZGVuV2lkdGgpIHtcbiAgICAgICAgaGlkZGVuV2lkdGggPSBoaWRkZW5XaWR0aCB8fCAocmVuZGVyVXRpbC5pc0lFOCgpID8gMCA6IEhJRERFTl9XSURUSCk7XG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLnN0YWNrZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9tYWtlTm9ybWFsQmFyQm91bmRzKGRpbWVuc2lvbiwgaGlkZGVuV2lkdGgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21ha2VTdGFja2VkQmFyQm91bmRzKGRpbWVuc2lvbiwgaGlkZGVuV2lkdGgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYm91bmRzIG9mIG5vcm1hbCBiYXIgY2hhcnQuXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0Om51bWJlcn19IGRpbWVuc2lvbiBiYXIgY2hhcnQgZGltZW5zaW9uXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGhpZGRlbldpZHRoIGhpZGRlbiB3aWR0aFxuICAgICAqIEByZXR1cm5zIHthcnJheS48YXJyYXkuPG9iamVjdD4+fSBib3VuZHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlTm9ybWFsQmFyQm91bmRzOiBmdW5jdGlvbihkaW1lbnNpb24sIGhpZGRlbldpZHRoKSB7XG4gICAgICAgIHZhciBncm91cFZhbHVlcyA9IHRoaXMucGVyY2VudFZhbHVlcyxcbiAgICAgICAgICAgIGdyb3VwSGVpZ2h0ID0gKGRpbWVuc2lvbi5oZWlnaHQgLyBncm91cFZhbHVlcy5sZW5ndGgpLFxuICAgICAgICAgICAgYmFySGVpZ2h0ID0gZ3JvdXBIZWlnaHQgLyAoZ3JvdXBWYWx1ZXNbMF0ubGVuZ3RoICsgMSksXG4gICAgICAgICAgICBib3VuZHMgPSBuZS51dGlsLm1hcChncm91cFZhbHVlcywgZnVuY3Rpb24odmFsdWVzLCBncm91cEluZGV4KSB7XG4gICAgICAgICAgICAgICAgdmFyIHBhZGRpbmdUb3AgPSAoZ3JvdXBIZWlnaHQgKiBncm91cEluZGV4KSArIChiYXJIZWlnaHQgLyAyKSArIGhpZGRlbldpZHRoO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogcGFkZGluZ1RvcCArIChiYXJIZWlnaHQgKiBpbmRleCksXG4gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiAtSElEREVOX1dJRFRILFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHZhbHVlICogZGltZW5zaW9uLndpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBiYXJIZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gYm91bmRzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGJvdW5kcyBvZiBzdGFja2VkIGJhciBjaGFydC5cbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6bnVtYmVyfX0gZGltZW5zaW9uIGJhciBjaGFydCBkaW1lbnNpb25cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaGlkZGVuV2lkdGggaGlkZGVuIHdpZHRoXG4gICAgICogQHJldHVybnMge2FycmF5LjxhcnJheS48b2JqZWN0Pj59IGJvdW5kc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VTdGFja2VkQmFyQm91bmRzOiBmdW5jdGlvbihkaW1lbnNpb24sIGhpZGRlbldpZHRoKSB7XG4gICAgICAgIHZhciBncm91cFZhbHVlcyA9IHRoaXMucGVyY2VudFZhbHVlcyxcbiAgICAgICAgICAgIGdyb3VwSGVpZ2h0ID0gKGRpbWVuc2lvbi5oZWlnaHQgLyBncm91cFZhbHVlcy5sZW5ndGgpLFxuICAgICAgICAgICAgYmFySGVpZ2h0ID0gZ3JvdXBIZWlnaHQgLyAyLFxuICAgICAgICAgICAgYm91bmRzID0gbmUudXRpbC5tYXAoZ3JvdXBWYWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcywgZ3JvdXBJbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciBwYWRkaW5nVG9wID0gKGdyb3VwSGVpZ2h0ICogZ3JvdXBJbmRleCkgKyAoYmFySGVpZ2h0IC8gMikgKyBoaWRkZW5XaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgbGVmdCA9IC1ISURERU5fV0lEVEg7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB3aWR0aCA9IHZhbHVlICogZGltZW5zaW9uLndpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgYm91bmQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiBwYWRkaW5nVG9wLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6IGxlZnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogYmFySGVpZ2h0XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBsZWZ0ID0gbGVmdCArIHdpZHRoO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYm91bmQ7XG4gICAgICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGJvdW5kcztcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBCYXJDaGFydFNlcmllcztcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBDb2x1bW4gY2hhcnQgc2VyaWVzIGNvbXBvbmVudC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFNlcmllcyA9IHJlcXVpcmUoJy4vc2VyaWVzLmpzJyk7XG5cbnZhciBISURERU5fV0lEVEggPSAxO1xuXG52YXIgQ29sdW1uQ2hhcnRTZXJpZXMgPSBuZS51dGlsLmRlZmluZUNsYXNzKFNlcmllcywgLyoqIEBsZW5kcyBTZXJpZXMucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBDb2x1bW4gY2hhcnQgc2VyaWVzIGNvbXBvbmVudC5cbiAgICAgKiBAY29uc3RydWN0cyBDb2x1bW5DaGFydFNlcmllc1xuICAgICAqIEBleHRlbmRzIFNlcmllc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5tb2RlbCBzZXJpZXMgbW9kZWxcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMub3B0aW9ucyBzZXJpZXMgb3B0aW9uc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBzZXJpZXMgdGhlbWVcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgU2VyaWVzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYm91bmRzIG9mIGNvbHVtbiBjaGFydC5cbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6bnVtYmVyfX0gZGltZW5zaW9uIGNvbHVtbiBjaGFydCBkaW1lbnNpb25cbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gYm91bmRzXG4gICAgICovXG4gICAgX21ha2VCb3VuZHM6IGZ1bmN0aW9uKGRpbWVuc2lvbikge1xuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5zdGFja2VkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbWFrZU5vcm1hbENvbHVtbkJvdW5kcyhkaW1lbnNpb24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21ha2VTdGFja2VkQ29sdW1uQm91bmRzKGRpbWVuc2lvbik7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBib3VuZHMgb2Ygbm9ybWFsIGNvbHVtbiBjaGFydC5cbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6bnVtYmVyfX0gZGltZW5zaW9uIGNvbHVtbiBjaGFydCBkaW1lbnNpb25cbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gYm91bmRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZU5vcm1hbENvbHVtbkJvdW5kczogZnVuY3Rpb24oZGltZW5zaW9uKSB7XG4gICAgICAgIHZhciBncm91cFZhbHVlcyA9IHRoaXMucGVyY2VudFZhbHVlcyxcbiAgICAgICAgICAgIGdyb3VwV2lkdGggPSAoZGltZW5zaW9uLndpZHRoIC8gZ3JvdXBWYWx1ZXMubGVuZ3RoKSxcbiAgICAgICAgICAgIGJhcldpZHRoID0gZ3JvdXBXaWR0aCAvIChncm91cFZhbHVlc1swXS5sZW5ndGggKyAxKSxcbiAgICAgICAgICAgIGJvdW5kcyA9IG5lLnV0aWwubWFwKGdyb3VwVmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMsIGdyb3VwSW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFkZGluZ0xlZnQgPSAoZ3JvdXBXaWR0aCAqIGdyb3VwSW5kZXgpICsgKGJhcldpZHRoIC8gMik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24gKHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYmFySGVpZ2h0ID0gdmFsdWUgKiBkaW1lbnNpb24uaGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiBkaW1lbnNpb24uaGVpZ2h0IC0gYmFySGVpZ2h0ICsgSElEREVOX1dJRFRILFxuICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogcGFkZGluZ0xlZnQgKyAoYmFyV2lkdGggKiBpbmRleCkgLSBISURERU5fV0lEVEgsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogYmFyV2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IGJhckhlaWdodFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBib3VuZHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYm91bmRzIG9mIHN0YWNrZWQgY29sdW1uIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDpudW1iZXJ9fSBkaW1lbnNpb24gY29sdW1uIGNoYXJ0IGRpbWVuc2lvblxuICAgICAqIEByZXR1cm5zIHthcnJheS48YXJyYXkuPG9iamVjdD4+fSBib3VuZHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlU3RhY2tlZENvbHVtbkJvdW5kczogZnVuY3Rpb24oZGltZW5zaW9uKSB7XG4gICAgICAgIHZhciBncm91cFZhbHVlcyA9IHRoaXMucGVyY2VudFZhbHVlcyxcbiAgICAgICAgICAgIGdyb3VwV2lkdGggPSAoZGltZW5zaW9uLndpZHRoIC8gZ3JvdXBWYWx1ZXMubGVuZ3RoKSxcbiAgICAgICAgICAgIGJhcldpZHRoID0gZ3JvdXBXaWR0aCAvIDIsXG4gICAgICAgICAgICBib3VuZHMgPSBuZS51dGlsLm1hcChncm91cFZhbHVlcywgZnVuY3Rpb24odmFsdWVzLCBncm91cEluZGV4KSB7XG4gICAgICAgICAgICAgICAgdmFyIHBhZGRpbmdMZWZ0ID0gKGdyb3VwV2lkdGggKiBncm91cEluZGV4KSArIChiYXJXaWR0aCAvIDIpLFxuICAgICAgICAgICAgICAgICAgICB0b3AgPSAwO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaGVpZ2h0ID0gdmFsdWUgKiBkaW1lbnNpb24uaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICAgICAgYm91bmQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiBkaW1lbnNpb24uaGVpZ2h0IC0gaGVpZ2h0IC0gdG9wLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6IHBhZGRpbmdMZWZ0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiBiYXJXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IGhlaWdodFxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgdG9wICs9IGhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJvdW5kO1xuICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBib3VuZHM7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29sdW1uQ2hhcnRTZXJpZXM7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgTGluZSBjaGFydCBzZXJpZXMgY29tcG9uZW50LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU2VyaWVzID0gcmVxdWlyZSgnLi9zZXJpZXMuanMnKTtcblxudmFyIExpbmVDaGFydFNlcmllcyA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoU2VyaWVzLCAvKiogQGxlbmRzIFNlcmllcy5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIExpbmUgY2hhcnQgc2VyaWVzIGNvbXBvbmVudC5cbiAgICAgKiBAY29uc3RydWN0cyBMaW5lQ2hhcnRTZXJpZXNcbiAgICAgKiBAZXh0ZW5kcyBTZXJpZXNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMubW9kZWwgc2VyaWVzIG1vZGVsXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgc2VyaWVzIG9wdGlvbnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgc2VyaWVzIHRoZW1lXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIFNlcmllcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHBvc2l0aW9ucyBvZiBsaW5lIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDpudW5iZXJ9fSBkaW1lbnNpb24gbGluZSBjaGFydCBkaW1lbnNpb25cbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gcG9zaXRpb25zXG4gICAgICovXG4gICAgX21ha2VQb3NpdGlvbnM6IGZ1bmN0aW9uKGRpbWVuc2lvbikge1xuICAgICAgICB2YXIgZ3JvdXBWYWx1ZXMgPSB0aGlzLnBlcmNlbnRWYWx1ZXMsXG4gICAgICAgICAgICB3aWR0aCA9IGRpbWVuc2lvbi53aWR0aCxcbiAgICAgICAgICAgIGhlaWdodCA9IGRpbWVuc2lvbi5oZWlnaHQsXG4gICAgICAgICAgICBzdGVwID0gd2lkdGggLyBncm91cFZhbHVlc1swXS5sZW5ndGgsXG4gICAgICAgICAgICBzdGFydCA9IHN0ZXAgLyAyLFxuICAgICAgICAgICAgcmVzdWx0ID0gbmUudXRpbC5tYXAoZ3JvdXBWYWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogc3RhcnQgKyAoc3RlcCAqIGluZGV4KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogaGVpZ2h0IC0gKHZhbHVlICogaGVpZ2h0KVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTGluZUNoYXJ0U2VyaWVzO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFBpZSBjaGFydCBzZXJpZXMgY29tcG9uZW50LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU2VyaWVzID0gcmVxdWlyZSgnLi9zZXJpZXMuanMnKTtcblxudmFyIFBpZUNoYXJ0U2VyaWVzID0gbmUudXRpbC5kZWZpbmVDbGFzcyhTZXJpZXMsIC8qKiBAbGVuZHMgU2VyaWVzLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogTGluZSBjaGFydCBzZXJpZXMgY29tcG9uZW50LlxuICAgICAqIEBjb25zdHJ1Y3RzIFBpZUNoYXJ0U2VyaWVzXG4gICAgICogQGV4dGVuZHMgU2VyaWVzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm1vZGVsIHNlcmllcyBtb2RlbFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5vcHRpb25zIHNlcmllcyBvcHRpb25zXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIHNlcmllcyB0aGVtZVxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBTZXJpZXMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBwZXJjZW50IHZhbHVlLlxuICAgICAqIEBwYXJhbSB7e3ZhbHVlczogYXJyYXksIHNjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX19IGRhdGEgc2VyaWVzIGRhdGFcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxudW1iZXI+Pn0gcGVyY2VudCB2YWx1ZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlUGVyY2VudFZhbHVlczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gbmUudXRpbC5tYXAoZGF0YS52YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICAgICAgdmFyIHN1bSA9IG5lLnV0aWwuc3VtKHZhbHVlcyk7XG4gICAgICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSAvIHN1bTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBjaXJjbGUgYm91bmRzXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0Om51bWJlcn19IGRpbWVuc2lvbiBjaGFydCBkaW1lbnNpb25cbiAgICAgKiBAcmV0dXJucyB7e2N4OiBudW1iZXIsIGN5OiBudW1iZXIsIHI6IG51bWJlcn19IGNpcmNsZSBib3VuZHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQ2lyY2xlQm91bmRzOiBmdW5jdGlvbihkaW1lbnNpb24pIHtcbiAgICAgICAgdmFyIHdpZHRoID0gZGltZW5zaW9uLndpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0ID0gZGltZW5zaW9uLmhlaWdodCxcbiAgICAgICAgICAgIHN0ZFNpemUgPSBuZS51dGlsLm11bHRpcGxpY2F0aW9uKG5lLnV0aWwubWluKFt3aWR0aCwgaGVpZ2h0XSksIDAuOCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjeDogbmUudXRpbC5kaXZpc2lvbih3aWR0aCwgMiksXG4gICAgICAgICAgICBjeTogbmUudXRpbC5kaXZpc2lvbihoZWlnaHQsIDIpLFxuICAgICAgICAgICAgcjogbmUudXRpbC5kaXZpc2lvbihzdGRTaXplLCAyKVxuICAgICAgICB9O1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBpZUNoYXJ0U2VyaWVzO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFNlcmllcyBiYXNlIGNvbXBvbmVudC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuLi9jb25zdC5qcycpLFxuICAgIHJlbmRlclV0aWwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3JlbmRlclV0aWwuanMnKSxcbiAgICBkb20gPSByZXF1aXJlKCcuLi9oZWxwZXJzL2RvbUhhbmRsZXIuanMnKSxcbiAgICBwbHVnaW5GYWN0b3J5ID0gcmVxdWlyZSgnLi4vZmFjdG9yaWVzL3BsdWdpbkZhY3RvcnkuanMnKTtcblxudmFyIEhJRERFTl9XSURUSCA9IDE7XG5cbnZhciBTZXJpZXMgPSBuZS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgU2VyaWVzLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogU2VyaWVzIGJhc2UgY29tcG9uZW50LlxuICAgICAqIEBjb25zdHJ1Y3RzIFNlcmllc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5tb2RlbCBzZXJpZXMgbW9kZWxcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMub3B0aW9ucyBzZXJpZXMgb3B0aW9uc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBzZXJpZXMgdGhlbWVcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGxpYlR5cGU7XG5cbiAgICAgICAgbmUudXRpbC5leHRlbmQodGhpcywgcGFyYW1zKTtcbiAgICAgICAgbGliVHlwZSA9IHBhcmFtcy5saWJUeXBlIHx8IGNoYXJ0Q29uc3QuREVGQVVMVF9QTFVHSU47XG4gICAgICAgIHRoaXMucGVyY2VudFZhbHVlcyA9IHRoaXMuX21ha2VQZXJjZW50VmFsdWVzKHBhcmFtcy5kYXRhLCBwYXJhbXMub3B0aW9ucy5zdGFja2VkKTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdyYXBoIHJlbmRlcmVyXG4gICAgICAgICAqIEB0eXBlIHtvYmplY3R9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdyYXBoUmVuZGVyZXIgPSBwbHVnaW5GYWN0b3J5LmdldChsaWJUeXBlLCBwYXJhbXMuY2hhcnRUeXBlKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogU2VyaWVzIHZpZXcgY2xhc3NOYW1lXG4gICAgICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNsYXNzTmFtZSA9ICduZS1jaGFydC1zZXJpZXMtYXJlYSc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNob3cgdG9vbHRpcCAobW91c2VvdmVyIGNhbGxiYWNrKS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcHJlZml4IHRvb2x0aXAgaWQgcHJlZml4XG4gICAgICogQHBhcmFtIHtib29sZWFufSBpc1ZlcnRpY2FsIHdoZXRoZXIgdmVydGljYWwgb3Igbm90XG4gICAgICogQHBhcmFtIHt7dG9wOm51bWJlciwgbGVmdDogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGJvdW5kIGdyYXBoIGJvdW5kIGluZm9ybWF0aW9uXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGlkIHRvb2x0aXAgaWRcbiAgICAgKi9cbiAgICBzaG93VG9vbHRpcDogZnVuY3Rpb24ocHJlZml4LCBpc1BvaW50UG9zaXRpb24sIGJvdW5kLCBpZCkge1xuICAgICAgICB0aGlzLmZpcmUoJ3Nob3dUb29sdGlwJywge1xuICAgICAgICAgICAgaWQ6IHByZWZpeCArIGlkLFxuICAgICAgICAgICAgaXNQb2ludFBvc2l0aW9uOiBpc1BvaW50UG9zaXRpb24sXG4gICAgICAgICAgICBib3VuZDogYm91bmRcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhpZGUgdG9vbHRpcCAobW91c2VvdXQgY2FsbGJhY2spLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwcmVmaXggdG9vbHRpcCBpZCBwcmVmaXhcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgdG9vbHRpcCBpZFxuICAgICAqL1xuICAgIGhpZGVUb29sdGlwOiBmdW5jdGlvbihwcmVmaXgsIGlkKSB7XG4gICAgICAgIHRoaXMuZmlyZSgnaGlkZVRvb2x0aXAnLCB7XG4gICAgICAgICAgICBpZDogcHJlZml4ICsgaWRcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBzZXJpZXMuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIG9iamVjdCBmb3IgZ3JhcGggZHJhd2luZ1xuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gc2VyaWVzIGVsZW1lbnRcbiAgICAgKi9cbiAgICByZW5kZXI6IGZ1bmN0aW9uKHBhcGVyKSB7XG4gICAgICAgIHZhciBlbCA9IGRvbS5jcmVhdGUoJ0RJVicsIHRoaXMuY2xhc3NOYW1lKSxcbiAgICAgICAgICAgIHRvb2x0aXBQcmVmaXggPSB0aGlzLnRvb2x0aXBQcmVmaXgsXG4gICAgICAgICAgICBib3VuZCA9IHRoaXMuYm91bmQsXG4gICAgICAgICAgICBpc1BvaW50UG9zaXRpb24gPSAhIXRoaXMuaXNQb2ludFBvc2l0aW9uLFxuICAgICAgICAgICAgZGltZW5zaW9uID0gYm91bmQuZGltZW5zaW9uLFxuICAgICAgICAgICAgcG9zaXRpb24gPSBib3VuZC5wb3NpdGlvbixcbiAgICAgICAgICAgIGluQ2FsbGJhY2sgPSBuZS51dGlsLmJpbmQodGhpcy5zaG93VG9vbHRpcCwgdGhpcywgdG9vbHRpcFByZWZpeCwgaXNQb2ludFBvc2l0aW9uKSxcbiAgICAgICAgICAgIG91dENhbGxiYWNrID0gbmUudXRpbC5iaW5kKHRoaXMuaGlkZVRvb2x0aXAsIHRoaXMsIHRvb2x0aXBQcmVmaXgpLFxuICAgICAgICAgICAgaGlkZGVuV2lkdGggPSByZW5kZXJVdGlsLmlzSUU4KCkgPyAwIDogSElEREVOX1dJRFRILFxuICAgICAgICAgICAgZGF0YTtcblxuICAgICAgICBpZiAoIXBhcGVyKSB7XG4gICAgICAgICAgICByZW5kZXJVdGlsLnJlbmRlckRpbWVuc2lvbihlbCwgZGltZW5zaW9uKTtcblxuICAgICAgICAgICAgcG9zaXRpb24udG9wID0gcG9zaXRpb24udG9wICsgKGlzUG9pbnRQb3NpdGlvbiA/IC1ISURERU5fV0lEVEggOiAtMSk7XG4gICAgICAgICAgICBwb3NpdGlvbi5yaWdodCA9IHBvc2l0aW9uLnJpZ2h0ICsgKGlzUG9pbnRQb3NpdGlvbiA/IC0oSElEREVOX1dJRFRIICogMikgOiAtaGlkZGVuV2lkdGgpO1xuXG4gICAgICAgICAgICByZW5kZXJVdGlsLnJlbmRlclBvc2l0aW9uKGVsLCBwb3NpdGlvbik7XG4gICAgICAgIH1cblxuICAgICAgICBkYXRhID0ge1xuICAgICAgICAgICAgZGltZW5zaW9uOiBkaW1lbnNpb24sXG4gICAgICAgICAgICB0aGVtZTogdGhpcy50aGVtZSxcbiAgICAgICAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9uc1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmICh0aGlzLl9tYWtlQm91bmRzKSB7XG4gICAgICAgICAgICBkYXRhLmdyb3VwQm91bmRzID0gdGhpcy5fbWFrZUJvdW5kcyhkaW1lbnNpb24pO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX21ha2VQb3NpdGlvbnMpIHtcbiAgICAgICAgICAgIGRhdGEuZ3JvdXBQb3NpdGlvbnMgPSB0aGlzLl9tYWtlUG9zaXRpb25zKGRpbWVuc2lvbik7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fbWFrZUNpcmNsZUJvdW5kcykge1xuICAgICAgICAgICAgZGF0YS5wZXJjZW50VmFsdWVzID0gdGhpcy5wZXJjZW50VmFsdWVzO1xuICAgICAgICAgICAgZGF0YS5mb3JtYXR0ZWRWYWx1ZXMgPSB0aGlzLmRhdGEuZm9ybWF0dGVkVmFsdWVzO1xuICAgICAgICAgICAgZGF0YS5jaGFydEJhY2tncm91bmQgPSB0aGlzLmNoYXJ0QmFja2dyb3VuZDtcbiAgICAgICAgICAgIGRhdGEuY2lyY2xlQm91bmRzID0gdGhpcy5fbWFrZUNpcmNsZUJvdW5kcyhkaW1lbnNpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5wYXBlciA9IHRoaXMuZ3JhcGhSZW5kZXJlci5yZW5kZXIocGFwZXIsIGVsLCBkYXRhLCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjayk7XG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHBhcGVyLlxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IG9iamVjdCBmb3IgZ3JhcGggZHJhd2luZ1xuICAgICAqL1xuICAgIGdldFBhcGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFwZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgcGVyY2VudCB2YWx1ZS5cbiAgICAgKiBAcGFyYW0ge3t2YWx1ZXM6IGFycmF5LCBzY2FsZToge21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19fSBkYXRhIHNlcmllcyBkYXRhXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHN0YWNrZWQgc3RhY2tlZCBvcHRpb25cbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxudW1iZXI+Pn0gcGVyY2VudCB2YWx1ZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlUGVyY2VudFZhbHVlczogZnVuY3Rpb24oZGF0YSwgc3RhY2tlZCkge1xuICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICBpZiAoc3RhY2tlZCA9PT0gY2hhcnRDb25zdC5TVEFDS0VEX05PUk1BTF9UWVBFKSB7XG4gICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9tYWtlTm9ybWFsU3RhY2tlZFBlcmNlbnRWYWx1ZXMoZGF0YSk7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RhY2tlZCA9PT0gY2hhcnRDb25zdC5TVEFDS0VEX1BFUkNFTlRfVFlQRSkge1xuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5fbWFrZVBlcmNlbnRTdGFja2VkUGVyY2VudFZhbHVlcyhkYXRhKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuX21ha2VOb3JtYWxQZXJjZW50VmFsdWVzKGRhdGEpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBwZXJjZW50IHZhbHVlcyBhYm91dCBub3JtYWwgc3RhY2tlZCBvcHRpb24uXG4gICAgICogQHBhcmFtIHt7dmFsdWVzOiBhcnJheSwgc2NhbGU6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fX0gZGF0YSBzZXJpZXMgZGF0YVxuICAgICAqIEByZXR1cm5zIHthcnJheX0gcGVyY2VudCB2YWx1ZXMgYWJvdXQgbm9ybWFsIHN0YWNrZWQgb3B0aW9uLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VOb3JtYWxTdGFja2VkUGVyY2VudFZhbHVlczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgbWluID0gZGF0YS5zY2FsZS5taW4sXG4gICAgICAgICAgICBtYXggPSBkYXRhLnNjYWxlLm1heCxcbiAgICAgICAgICAgIGRpc3RhbmNlID0gbWF4IC0gbWluLFxuICAgICAgICAgICAgcGVyY2VudFZhbHVlcyA9IG5lLnV0aWwubWFwKGRhdGEudmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGx1c1ZhbHVlcyA9IG5lLnV0aWwuZmlsdGVyKHZhbHVlcywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSA+IDA7XG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBzdW0gPSBuZS51dGlsLnN1bShwbHVzVmFsdWVzKSxcbiAgICAgICAgICAgICAgICAgICAgZ3JvdXBQZXJjZW50ID0gKHN1bSAtIG1pbikgLyBkaXN0YW5jZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZ3JvdXBQZXJjZW50ICogKHZhbHVlIC8gc3VtKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcGVyY2VudFZhbHVlcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBwZXJjZW50IHZhbHVlcyBhYm91dCBwZXJjZW50IHN0YWNrZWQgb3B0aW9uLlxuICAgICAqIEBwYXJhbSB7e3ZhbHVlczogYXJyYXksIHNjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX19IGRhdGEgc2VyaWVzIGRhdGFcbiAgICAgKiBAcmV0dXJucyB7YXJyYXl9IHBlcmNlbnQgdmFsdWVzIGFib3V0IHBlcmNlbnQgc3RhY2tlZCBvcHRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlUGVyY2VudFN0YWNrZWRQZXJjZW50VmFsdWVzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBwZXJjZW50VmFsdWVzID0gbmUudXRpbC5tYXAoZGF0YS52YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICAgICAgdmFyIHBsdXNWYWx1ZXMgPSBuZS51dGlsLmZpbHRlcih2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSA+IDA7XG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgc3VtID0gbmUudXRpbC5zdW0ocGx1c1ZhbHVlcyk7XG4gICAgICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSAvIHN1bTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHBlcmNlbnRWYWx1ZXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2Ugbm9ybWFsIHBlcmNlbnQgdmFsdWUuXG4gICAgICogQHBhcmFtIHt7dmFsdWVzOiBhcnJheSwgc2NhbGU6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fX0gZGF0YSBzZXJpZXMgZGF0YVxuICAgICAqIEByZXR1cm5zIHthcnJheS48YXJyYXkuPG51bWJlcj4+fSBwZXJjZW50IHZhbHVlc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VOb3JtYWxQZXJjZW50VmFsdWVzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBtaW4gPSBkYXRhLnNjYWxlLm1pbixcbiAgICAgICAgICAgIG1heCA9IGRhdGEuc2NhbGUubWF4LFxuICAgICAgICAgICAgZGlzdGFuY2UgPSBtYXggLSBtaW4sXG4gICAgICAgICAgICBwZXJjZW50VmFsdWVzID0gbmUudXRpbC5tYXAoZGF0YS52YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAodmFsdWUgLSBtaW4pIC8gZGlzdGFuY2U7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHBlcmNlbnRWYWx1ZXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGwgc2hvd0RvdCBmdW5jdGlvbiBvZiBncmFwaFJlbmRlcmVyLlxuICAgICAqIEBwYXJhbSB7e2dyb3VwSW5kZXg6IG51bWJlciwgaW5kZXg6IG51bWJlcn19IGRhdGEgZGF0YVxuICAgICAqL1xuICAgIG9uU2hvd0FuaW1hdGlvbjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBpZiAoIXRoaXMuZ3JhcGhSZW5kZXJlci5zaG93QW5pbWF0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ncmFwaFJlbmRlcmVyLnNob3dBbmltYXRpb24uY2FsbCh0aGlzLmdyYXBoUmVuZGVyZXIsIGRhdGEpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxsIGhpZGVEb3QgZnVuY3Rpb24gb2YgZ3JhcGhSZW5kZXJlci5cbiAgICAgKiBAcGFyYW0ge3tncm91cEluZGV4OiBudW1iZXIsIGluZGV4OiBudW1iZXJ9fSBkYXRhIGRhdGFcbiAgICAgKi9cbiAgICBvbkhpZGVBbmltYXRpb246IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgaWYgKCF0aGlzLmdyYXBoUmVuZGVyZXIuaGlkZUFuaW1hdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ3JhcGhSZW5kZXJlci5oaWRlQW5pbWF0aW9uLmNhbGwodGhpcy5ncmFwaFJlbmRlcmVyLCBkYXRhKTtcbiAgICB9XG59KTtcblxubmUudXRpbC5DdXN0b21FdmVudHMubWl4aW4oU2VyaWVzKTtcblxubW9kdWxlLmV4cG9ydHMgPSBTZXJpZXM7XG4iLCJ2YXIgREVGQVVMVF9DT0xPUiA9ICcjMDAwMDAwJyxcbiAgICBERUZBVUxUX0JBQ0tHUk9VTkQgPSAnI2ZmZmZmZicsXG4gICAgRU1QVFlfRk9OVCA9ICcnLFxuICAgIERFRkFVTFRfQVhJUyA9IHtcbiAgICAgICAgdGlja0NvbG9yOiBERUZBVUxUX0NPTE9SLFxuICAgICAgICB0aXRsZToge1xuICAgICAgICAgICAgZm9udFNpemU6IDEyLFxuICAgICAgICAgICAgZm9udEZhbWlseTogRU1QVFlfRk9OVCxcbiAgICAgICAgICAgIGNvbG9yOiBERUZBVUxUX0NPTE9SXG4gICAgICAgIH0sXG4gICAgICAgIGxhYmVsOiB7XG4gICAgICAgICAgICBmb250U2l6ZTogMTIsXG4gICAgICAgICAgICBmb250RmFtaWx5OiBFTVBUWV9GT05ULFxuICAgICAgICAgICAgY29sb3I6IERFRkFVTFRfQ09MT1JcbiAgICAgICAgfVxuICAgIH07XG5cbnZhciBkZWZhdWx0VGhlbWUgPSB7XG4gICAgY2hhcnQ6IHtcbiAgICAgICAgYmFja2dyb3VuZDogREVGQVVMVF9CQUNLR1JPVU5ELFxuICAgICAgICBmb250RmFtaWx5OiAnVmVyZGFuYSdcbiAgICB9LFxuICAgIHRpdGxlOiB7XG4gICAgICAgIGZvbnRTaXplOiAxOCxcbiAgICAgICAgZm9udEZhbWlseTogRU1QVFlfRk9OVCxcbiAgICAgICAgY29sb3I6IERFRkFVTFRfQ09MT1JcbiAgICB9LFxuICAgIHlBeGlzOiBERUZBVUxUX0FYSVMsXG4gICAgeEF4aXM6IERFRkFVTFRfQVhJUyxcbiAgICBwbG90OiB7XG4gICAgICAgIGxpbmVDb2xvcjogJyNkZGRkZGQnLFxuICAgICAgICBiYWNrZ3JvdW5kOiAnI2ZmZmZmZidcbiAgICB9LFxuICAgIHNlcmllczoge1xuICAgICAgICBjb2xvcnM6IFsnI2FjNDE0MicsICcjZDI4NDQ1JywgJyNmNGJmNzUnLCAnIzkwYTk1OScsICcjNzViNWFhJywgJyM2YTlmYjUnLCAnI2FhNzU5ZicsICcjOGY1NTM2J11cbiAgICB9LFxuICAgIGxlZ2VuZDoge1xuICAgICAgICBsYWJlbDoge1xuICAgICAgICAgICAgZm9udFNpemU6IDEyLFxuICAgICAgICAgICAgZm9udEZhbWlseTogRU1QVFlfRk9OVCxcbiAgICAgICAgICAgIGNvbG9yOiBERUZBVUxUX0NPTE9SXG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmF1bHRUaGVtZTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBUb29sdGlwIGNvbXBvbmVudC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGRvbSA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZG9tSGFuZGxlci5qcycpLFxuICAgIHJlbmRlclV0aWwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3JlbmRlclV0aWwuanMnKSxcbiAgICBldmVudCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZXZlbnRMaXN0ZW5lci5qcycpLFxuICAgIHRlbXBsYXRlTWFrZXIgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3RlbXBsYXRlTWFrZXIuanMnKSxcbiAgICB0b29sdGlwVGVtcGxhdGUgPSByZXF1aXJlKCcuL3Rvb2x0aXBUZW1wbGF0ZS5qcycpO1xuXG52YXIgVE9PTFRJUF9HQVAgPSA1LFxuICAgIEhJRERFTl9XSURUSCA9IDEsXG4gICAgVE9PTFRJUF9DTEFTU19OQU1FID0gJ25lLWNoYXJ0LXRvb2x0aXAnLFxuICAgIEhJREVfREVMQVkgPSAwO1xuXG52YXIgY29uY2F0ID0gQXJyYXkucHJvdG90eXBlLmNvbmNhdDtcblxudmFyIFRvb2x0aXAgPSBuZS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgVG9vbHRpcC5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIFRvb2x0aXAgY29tcG9uZW50LlxuICAgICAqIEBjb25zdHJ1Y3RzIFRvb2x0aXBcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPG51bWJlcj59IHBhcmFtcy52YWx1ZXMgY29udmVydGVkIHZhbHVlc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheX0gcGFyYW1zLmxhYmVscyBsYWJlbHNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXl9IHBhcmFtcy5sZWdlbmRMYWJlbHMgbGVnZW5kIGxhYmVsc1xuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHByZWZpeCB0b29sdGlwIHByZWZpeFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5ib3VuZCBheGlzIGJvdW5kXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIGF4aXMgdGhlbWVcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgbmUudXRpbC5leHRlbmQodGhpcywgcGFyYW1zKTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRvb2x0aXAgdmlldyBjbGFzc05hbWVcbiAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2xhc3NOYW1lID0gJ25lLWNoYXJ0LXRvb2x0aXAtYXJlYSc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciB0b29sdGlwLlxuICAgICAqIEBwYXJhbSB7e3Bvc2l0aW9uOiBvYmplY3R9fSBib3VuZCB0b29sdGlwIGJvdW5kXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHByZWZpeCB0b29sdGlwIGlkIHByZWZpeFxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gdG9vbHRpcCBlbGVtZW50XG4gICAgICovXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGVsID0gZG9tLmNyZWF0ZSgnRElWJywgdGhpcy5jbGFzc05hbWUpLFxuICAgICAgICAgICAgYm91bmQgPSB0aGlzLmJvdW5kO1xuXG4gICAgICAgIHJlbmRlclV0aWwucmVuZGVyUG9zaXRpb24oZWwsIGJvdW5kLnBvc2l0aW9uKTtcbiAgICAgICAgZWwuaW5uZXJIVE1MID0gdGhpcy5fbWFrZVRvb2x0aXBzSHRtbCgpO1xuXG4gICAgICAgIHRoaXMuYXR0YWNoRXZlbnQoZWwpO1xuICAgICAgICByZXR1cm4gZWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgdG9vbHRpcCBkYXRhLlxuICAgICAqIEByZXR1cm5zIHthcnJheS48b2JqZWN0Pn0gdG9vbHRpcCBkYXRhXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVRvb2x0aXBEYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGxhYmVscyA9IHRoaXMubGFiZWxzLFxuICAgICAgICAgICAgZ3JvdXBWYWx1ZXMgPSB0aGlzLnZhbHVlcyxcbiAgICAgICAgICAgIGxlZ2VuZExhYmVscyA9IHRoaXMubGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgdG9vbHRpcERhdGEgPSBuZS51dGlsLm1hcChncm91cFZhbHVlcywgZnVuY3Rpb24odmFsdWVzLCBncm91cEluZGV4KSB7XG4gICAgICAgICAgICAgICAgdmFyIGl0ZW1zID0gbmUudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSB7dmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGVnZW5kTGFiZWw6IGxlZ2VuZExhYmVsc1tpbmRleF0sXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogZ3JvdXBJbmRleCArICctJyArIGluZGV4XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIGlmIChsYWJlbHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ubGFiZWwgPSBsYWJlbHNbZ3JvdXBJbmRleF07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gaXRlbXM7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGNvbmNhdC5hcHBseShbXSwgdG9vbHRpcERhdGEpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGh0bWwgb2YgdG9vbHRpcC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZGF0YSB0b29sdGlwIGRhdGFcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcHJlZml4IHRvb2x0aXAgaWQgcHJlZml4XG4gICAgICogQHJldHVybnMge3N0cmluZ30gaHRtbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VUb29sdGlwc0h0bWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucyxcbiAgICAgICAgICAgIHByZWZpeCA9IHRoaXMucHJlZml4LFxuICAgICAgICAgICAgZGF0YSA9IHRoaXMuX21ha2VUb29sdGlwRGF0YSgpLFxuICAgICAgICAgICAgb3B0aW9uVGVtcGxhdGUgPSBvcHRpb25zLnRlbXBsYXRlID8gb3B0aW9ucy50ZW1wbGF0ZSA6ICcnLFxuICAgICAgICAgICAgdHBsT3V0ZXIgPSB0b29sdGlwVGVtcGxhdGUuVFBMX1RPT0xUSVAsXG4gICAgICAgICAgICB0cGxUb29sdGlwID0gb3B0aW9uVGVtcGxhdGUgPyB0ZW1wbGF0ZU1ha2VyLnRlbXBsYXRlKG9wdGlvblRlbXBsYXRlKSA6IHRvb2x0aXBUZW1wbGF0ZS5UUExfREVGQVVMVF9URU1QTEFURSxcbiAgICAgICAgICAgIHN1ZmZpeCA9IG9wdGlvbnMuc3VmZml4ID8gJyZuYnNwOycgKyBvcHRpb25zLnN1ZmZpeCA6ICcnLFxuICAgICAgICAgICAgaHRtbCA9IG5lLnV0aWwubWFwKGRhdGEsIGZ1bmN0aW9uKHRvb2x0aXBEYXRhKSB7XG4gICAgICAgICAgICAgICAgdmFyIGlkID0gcHJlZml4ICsgdG9vbHRpcERhdGEuaWQsXG4gICAgICAgICAgICAgICAgICAgIHRvb2x0aXBIdG1sO1xuXG4gICAgICAgICAgICAgICAgdG9vbHRpcERhdGEgPSBuZS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgbGVnZW5kTGFiZWw6ICcnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJycsXG4gICAgICAgICAgICAgICAgICAgIHN1ZmZpeDogc3VmZml4XG4gICAgICAgICAgICAgICAgfSwgdG9vbHRpcERhdGEpO1xuICAgICAgICAgICAgICAgIHRvb2x0aXBIdG1sID0gdHBsVG9vbHRpcCh0b29sdGlwRGF0YSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRwbE91dGVyKHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgICAgICAgICBodG1sOiB0b29sdGlwSHRtbFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSwgdGhpcykuam9pbignJyk7XG4gICAgICAgIHJldHVybiBodG1sO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgaW5kZXggZnJvbSBpZFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpZCB0b29sdGlwIGlkXG4gICAgICogQHJldHVybnMge2FycmF5LjxudW1iZXI+fSBpbmRleGVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0SW5kZXhGcm9tSWQ6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgIHZhciBpZHMgPSBpZC5zcGxpdCgnLScpLFxuICAgICAgICAgICAgc2xpY2VJbmRleCA9IGlkcy5sZW5ndGggLSAyO1xuICAgICAgICByZXR1cm4gaWRzLnNsaWNlKHNsaWNlSW5kZXgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGaXJlIGN1c3RvbSBldmVudCBzaG93QW5pbWF0aW9uLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpZCB0b29sdGlwIGlkXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZmlyZVNob3dBbmltYXRpb246IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgIHZhciBpbmRleGVzID0gdGhpcy5fZ2V0SW5kZXhGcm9tSWQoaWQpO1xuICAgICAgICB0aGlzLmZpcmUoJ3Nob3dBbmltYXRpb24nLCB7XG4gICAgICAgICAgICBncm91cEluZGV4OiBpbmRleGVzWzBdLFxuICAgICAgICAgICAgaW5kZXg6IGluZGV4ZXNbMV1cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZpcmUgY3VzdG9tIGV2ZW50IGhpZGVBbmltYXRpb24uXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGlkIHRvb2x0aXAgaWRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9maXJlSGlkZUFuaW1hdGlvbjogZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ19maXJlSGlkZUFuaW1hdGlvbicpO1xuICAgICAgICB2YXIgaW5kZXhlcyA9IHRoaXMuX2dldEluZGV4RnJvbUlkKGlkKTtcbiAgICAgICAgdGhpcy5maXJlKCdoaWRlQW5pbWF0aW9uJywge1xuICAgICAgICAgICAgZ3JvdXBJbmRleDogaW5kZXhlc1swXSxcbiAgICAgICAgICAgIGluZGV4OiBpbmRleGVzWzFdXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBPbiBtb3VzZW92ZXIgZXZlbnQgaGFuZGxlciBmb3IgdG9vbHRpcCBhcmVhXG4gICAgICogQHBhcmFtIHtNb3VzZUV2ZW50fSBlIG1vdXNlIGV2ZW50XG4gICAgICovXG4gICAgb25Nb3VzZW92ZXI6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIGVsVGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50LFxuICAgICAgICAgICAgaWQ7XG5cbiAgICAgICAgaWYgKCFkb20uaGFzQ2xhc3MoZWxUYXJnZXQsIFRPT0xUSVBfQ0xBU1NfTkFNRSkpIHtcbiAgICAgICAgICAgIGVsVGFyZ2V0ID0gZG9tLmZpbmRQYXJlbnRCeUNsYXNzKGVsVGFyZ2V0LCBUT09MVElQX0NMQVNTX05BTUUpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zaG93ZWRJZCA9IGlkID0gZWxUYXJnZXQuaWQ7XG4gICAgICAgIHRoaXMuX2ZpcmVTaG93QW5pbWF0aW9uKGlkKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogT24gbW91c2VvdXQgZXZlbnQgaGFuZGxlciBmb3IgdG9vbHRpcCBhcmVhXG4gICAgICogQHBhcmFtIHtNb3VzZUV2ZW50fSBlIG1vdXNlIGV2ZW50XG4gICAgICovXG4gICAgb25Nb3VzZW91dDogZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgZWxUYXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQsXG4gICAgICAgICAgICB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgIGluZGV4ZXM7XG5cbiAgICAgICAgaWYgKCFkb20uaGFzQ2xhc3MoZWxUYXJnZXQsIFRPT0xUSVBfQ0xBU1NfTkFNRSkpIHtcbiAgICAgICAgICAgIGVsVGFyZ2V0ID0gZG9tLmZpbmRQYXJlbnRCeUNsYXNzKGVsVGFyZ2V0LCBUT09MVElQX0NMQVNTX05BTUUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaW5kZXhlcyA9IHRoaXMuX2dldEluZGV4RnJvbUlkKGVsVGFyZ2V0LmlkKTtcblxuICAgICAgICB0aGlzLl9oaWRlVG9vbHRpcChlbFRhcmdldCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGF0LmZpcmUoJ2hpZGVBbmltYXRpb24nLCB7XG4gICAgICAgICAgICAgICAgZ3JvdXBJbmRleDogaW5kZXhlc1swXSxcbiAgICAgICAgICAgICAgICBpbmRleDogaW5kZXhlc1sxXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxjdWxhdGUgdG9vbHRpcCBwb2ludCBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHt7Ym91bmQ6IG9iamVjdH19IHBhcmFtcy5kYXRhIGdyYXBoIGluZm9ybWF0aW9uXG4gICAgICogICAgICBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IHBhcmFtcy5kaW1lbnNpb24gdG9vbHRpcCBkaW1lbnNpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMucG9zaXRpb25PcHRpb24gcG9zaXRpb24gb3B0aW9uIChleDogJ2xlZnQgdG9wJylcbiAgICAgKiBAcmV0dXJucyB7e3RvcDogbnVtYmVyLCBsZWZ0OiBudW1iZXJ9fSBwb3NpdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NhbGN1bGF0ZVBvaW50UG9zaXRpb246IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgYm91bmQgPSBwYXJhbXMuZGF0YS5ib3VuZCxcbiAgICAgICAgICAgIG1pbnVzV2lkdGggPSBwYXJhbXMuZGltZW5zaW9uLndpZHRoIC0gKGJvdW5kLndpZHRoIHx8IDApLFxuICAgICAgICAgICAgbGluZUdhcCA9IGJvdW5kLndpZHRoID8gMCA6IFRPT0xUSVBfR0FQLFxuICAgICAgICAgICAgcG9zaXRpb25PcHRpb24gPSBwYXJhbXMucG9zaXRpb25PcHRpb24gfHwgJycsXG4gICAgICAgICAgICB0b29sdGlwSGVpZ2h0ID0gcGFyYW1zLmRpbWVuc2lvbi5oZWlnaHQsXG4gICAgICAgICAgICByZXN1bHQgPSB7fTtcblxuICAgICAgICByZXN1bHQubGVmdCA9IGJvdW5kLmxlZnQgKyAoSElEREVOX1dJRFRIICogMik7XG4gICAgICAgIHJlc3VsdC50b3AgPSBib3VuZC50b3AgLSB0b29sdGlwSGVpZ2h0O1xuXG4gICAgICAgIGlmIChwb3NpdGlvbk9wdGlvbi5pbmRleE9mKCdsZWZ0JykgPiAtMSkge1xuICAgICAgICAgICAgcmVzdWx0LmxlZnQgLT0gbWludXNXaWR0aCArIGxpbmVHYXA7XG4gICAgICAgIH0gZWxzZSBpZiAocG9zaXRpb25PcHRpb24uaW5kZXhPZignY2VudGVyJykgPiAtMSkge1xuICAgICAgICAgICAgcmVzdWx0LmxlZnQgLT0gbWludXNXaWR0aCAvIDI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQubGVmdCArPSBsaW5lR2FwO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBvc2l0aW9uT3B0aW9uLmluZGV4T2YoJ2JvdHRvbScpID4gLTEpIHtcbiAgICAgICAgICAgIHJlc3VsdC50b3AgKz0gdG9vbHRpcEhlaWdodCAtIEhJRERFTl9XSURUSCArIGxpbmVHYXA7XG4gICAgICAgIH0gZWxzZSBpZiAocG9zaXRpb25PcHRpb24uaW5kZXhPZignbWlkZGxlJykgPiAtMSkge1xuICAgICAgICAgICAgcmVzdWx0LnRvcCArPSB0b29sdGlwSGVpZ2h0IC8gMjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdC50b3AgLT0gVE9PTFRJUF9HQVAgKyBISURERU5fV0lEVEg7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxjdWxhdGUgdG9vbHRpcCByZWN0IHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge3tib3VuZDogb2JqZWN0fX0gcGFyYW1zLmRhdGEgZ3JhcGggaW5mb3JtYXRpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gcGFyYW1zLmRpbWVuc2lvbiB0b29sdGlwIGRpbWVuc2lvblxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5wb3NpdGlvbk9wdGlvbiBwb3NpdGlvbiBvcHRpb24gKGV4OiAnbGVmdCB0b3AnKVxuICAgICAqIEByZXR1cm5zIHt7dG9wOiBudW1iZXIsIGxlZnQ6IG51bWJlcn19IHBvc2l0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2FsY3VsYXRlUmVjdFBvc2l0aW9uOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGJvdW5kID0gcGFyYW1zLmRhdGEuYm91bmQsXG4gICAgICAgICAgICBtaW51c0hlaWdodCA9IHBhcmFtcy5kaW1lbnNpb24uaGVpZ2h0IC0gKGJvdW5kLmhlaWdodCB8fCAwKSxcbiAgICAgICAgICAgIHBvc2l0aW9uT3B0aW9uID0gcGFyYW1zLnBvc2l0aW9uT3B0aW9uIHx8ICcnLFxuICAgICAgICAgICAgdG9vbHRpcFdpZHRoID0gcGFyYW1zLmRpbWVuc2lvbi53aWR0aCxcbiAgICAgICAgICAgIHJlc3VsdCA9IHt9O1xuXG4gICAgICAgIHJlc3VsdC5sZWZ0ID0gYm91bmQubGVmdCArIGJvdW5kLndpZHRoO1xuICAgICAgICByZXN1bHQudG9wID0gYm91bmQudG9wO1xuICAgICAgICBpZiAocG9zaXRpb25PcHRpb24uaW5kZXhPZignbGVmdCcpID4gLTEpIHtcbiAgICAgICAgICAgIHJlc3VsdC5sZWZ0IC09IHRvb2x0aXBXaWR0aDtcbiAgICAgICAgfSBlbHNlIGlmIChwb3NpdGlvbk9wdGlvbi5pbmRleE9mKCdjZW50ZXInKSA+IC0xKSB7XG4gICAgICAgICAgICByZXN1bHQubGVmdCAtPSB0b29sdGlwV2lkdGggLyAyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0LmxlZnQgKz0gVE9PTFRJUF9HQVA7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocG9zaXRpb25PcHRpb24uaW5kZXhPZigndG9wJykgPiAtMSkge1xuICAgICAgICAgICAgcmVzdWx0LnRvcCAtPSBtaW51c0hlaWdodCArIEhJRERFTl9XSURUSDtcbiAgICAgICAgfSBlbHNlIGlmIChwb3NpdGlvbk9wdGlvbi5pbmRleE9mKCdtaWRkbGUnKSA+IC0xKSB7XG4gICAgICAgICAgICByZXN1bHQudG9wIC09IG1pbnVzSGVpZ2h0IC8gMjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdC50b3AgLT0gSElEREVOX1dJRFRIICogMjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxjdWxhdGUgdG9vbHRpcCBwb3NpdGlvbi5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7e2JvdW5kOiBvYmplY3QsIGlzUG9pbnRQb3NpdGlvbjogYm9vbGVhbn19IHBhcmFtcy5kYXRhIGdyYXBoIGluZm9ybWF0aW9uXG4gICAgICogICAgICBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IHBhcmFtcy5kaW1lbnNpb24gdG9vbHRpcCBkaW1lbnNpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMucG9zaXRpb25PcHRpb24gcG9zaXRpb24gb3B0aW9uIChleDogJ2xlZnQgdG9wJylcbiAgICAgKiBAcmV0dXJucyB7e3RvcDogbnVtYmVyLCBsZWZ0OiBudW1iZXJ9fSBwb3NpdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NhbGN1bGF0ZVBvc2l0aW9uOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgICAgICBpZiAocGFyYW1zLmRhdGEuaXNQb2ludFBvc2l0aW9uKSB7XG4gICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9jYWxjdWxhdGVQb2ludFBvc2l0aW9uKHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9jYWxjdWxhdGVSZWN0UG9zaXRpb24ocGFyYW1zKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvblNob3cgaXMgY2FsbGJhY2sgb2YgY3VzdG9tIGV2ZW50IHNob3dUb29sdGlwIGZvciBTZXJpZXNWaWV3LlxuICAgICAqIEBwYXJhbSB7e2lkOiBzdHJpbmcsIGJvdW5kOiBvYmplY3R9fSBkYXRhIHRvb2x0aXAgZGF0YVxuICAgICAqL1xuICAgIG9uU2hvdzogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgZWxUb29sdGlwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZGF0YS5pZCksXG4gICAgICAgICAgICBhZGRQb3NpdGlvbiA9IG5lLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgICAgICAgIHRvcDogMFxuICAgICAgICAgICAgfSwgdGhpcy5vcHRpb25zLmFkZFBvc2l0aW9uKSxcbiAgICAgICAgICAgIHBvc2l0aW9uT3B0aW9uID0gdGhpcy5vcHRpb25zLnBvc2l0aW9uIHx8ICcnLFxuICAgICAgICAgICAgcG9zaXRpb247XG5cbiAgICAgICAgaWYgKHRoaXMuc2hvd2VkSWQpIHtcbiAgICAgICAgICAgIGRvbS5yZW1vdmVDbGFzcyhlbFRvb2x0aXAsICdzaG93Jyk7XG4gICAgICAgICAgICB0aGlzLl9maXJlSGlkZUFuaW1hdGlvbih0aGlzLnNob3dlZElkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2hvd2VkSWQgPSBkYXRhLmlkO1xuICAgICAgICBkb20uYWRkQ2xhc3MoZWxUb29sdGlwLCAnc2hvdycpO1xuXG4gICAgICAgIHBvc2l0aW9uID0gdGhpcy5fY2FsY3VsYXRlUG9zaXRpb24oe1xuICAgICAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgICAgIGRpbWVuc2lvbjoge1xuICAgICAgICAgICAgICAgIHdpZHRoOiBlbFRvb2x0aXAub2Zmc2V0V2lkdGgsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBlbFRvb2x0aXAub2Zmc2V0SGVpZ2h0XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcG9zaXRpb25PcHRpb246IHBvc2l0aW9uT3B0aW9uIHx8ICcnXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGVsVG9vbHRpcC5zdHlsZS5jc3NUZXh0ID0gW1xuICAgICAgICAgICAgcmVuZGVyVXRpbC5jb25jYXRTdHIoJ2xlZnQ6JywgcG9zaXRpb24ubGVmdCArIGFkZFBvc2l0aW9uLmxlZnQsICdweCcpLFxuICAgICAgICAgICAgcmVuZGVyVXRpbC5jb25jYXRTdHIoJ3RvcDonLCBwb3NpdGlvbi50b3AgKyBhZGRQb3NpdGlvbi50b3AsICdweCcpXG4gICAgICAgIF0uam9pbignOycpO1xuXG4gICAgICAgIHRoaXMuX2ZpcmVTaG93QW5pbWF0aW9uKGRhdGEuaWQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvbkhpZGUgaXMgY2FsbGJhY2sgb2YgY3VzdG9tIGV2ZW50IGhpZGVUb29sdGlwIGZvciBTZXJpZXNWaWV3XG4gICAgICogQHBhcmFtIHt7aWQ6IHN0cmluZ319IGRhdGEgdG9vbHRpcCBkYXRhXG4gICAgICovXG4gICAgb25IaWRlOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBlbFRvb2x0aXAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChkYXRhLmlkKSxcbiAgICAgICAgICAgIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgIHRoaXMuX2hpZGVUb29sdGlwKGVsVG9vbHRpcCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgaW5kZXhlcyA9IHRoYXQuX2dldEluZGV4RnJvbUlkKGRhdGEuaWQpO1xuXG4gICAgICAgICAgICB0aGF0LmZpcmUoJ2hpZGVBbmltYXRpb24nLCB7XG4gICAgICAgICAgICAgICAgZ3JvdXBJbmRleDogaW5kZXhlc1swXSxcbiAgICAgICAgICAgICAgICBpbmRleDogaW5kZXhlc1sxXVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGRhdGEgPSBudWxsO1xuICAgICAgICAgICAgZWxUb29sdGlwID0gbnVsbDtcbiAgICAgICAgICAgIHRoYXQgPSBudWxsO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSGlkZSB0b29sdGlwLlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsVG9vbHRpcCB0b29sdGlwIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayBjYWxsYmFja1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2hpZGVUb29sdGlwOiBmdW5jdGlvbihlbFRvb2x0aXAsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgZGVsZXRlIHRoaXMuc2hvd2VkSWQ7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAodGhhdC5zaG93ZWRJZCA9PT0gZWxUb29sdGlwLmlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkb20ucmVtb3ZlQ2xhc3MoZWxUb29sdGlwLCAnc2hvdycpO1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhhdCA9IG51bGw7XG4gICAgICAgIH0sIEhJREVfREVMQVkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggZXZlbnRcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqL1xuICAgIGF0dGFjaEV2ZW50OiBmdW5jdGlvbihlbCkge1xuICAgICAgICBldmVudC5iaW5kRXZlbnQoJ21vdXNlb3ZlcicsIGVsLCBuZS51dGlsLmJpbmQodGhpcy5vbk1vdXNlb3ZlciwgdGhpcykpO1xuICAgICAgICBldmVudC5iaW5kRXZlbnQoJ21vdXNlb3V0JywgZWwsIG5lLnV0aWwuYmluZCh0aGlzLm9uTW91c2VvdXQsIHRoaXMpKTtcbiAgICB9XG59KTtcblxubmUudXRpbC5DdXN0b21FdmVudHMubWl4aW4oVG9vbHRpcCk7XG5cbm1vZHVsZS5leHBvcnRzID0gVG9vbHRpcDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBUaGlzIGlzIHRlbXBsYXRlcyBvZiB0b29sdGlwIHZpZXcuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG52YXIgdGVtcGxhdGVNYWtlciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvdGVtcGxhdGVNYWtlci5qcycpO1xuXG52YXIgdGFncyA9IHtcbiAgICBIVE1MX1RPT0xUSVA6ICc8ZGl2IGNsYXNzPVwibmUtY2hhcnQtdG9vbHRpcFwiIGlkPVwie3sgaWQgfX1cIj57eyBodG1sIH19PC9kaXY+JyxcbiAgICBIVE1MX0RFRkFVTFRfVEVNUExBVEU6ICc8ZGl2IGNsYXNzPVwibmUtY2hhcnQtZGVmYXVsdC10b29sdGlwXCI+JyArXG4gICAgICAgICc8ZGl2Pnt7IGxhYmVsIH19PC9kaXY+JyArXG4gICAgICAgICc8ZGl2PicgK1xuICAgICAgICAgICAgJzxzcGFuPnt7IGxlZ2VuZExhYmVsIH19PC9zcGFuPjonICtcbiAgICAgICAgICAgICcmbmJzcDs8c3Bhbj57eyB2YWx1ZSB9fTwvc3Bhbj4nICtcbiAgICAgICAgICAgICc8c3Bhbj57eyBzdWZmaXggfX08L3NwYW4+JyArXG4gICAgICAgICc8L2Rpdj4nICtcbiAgICAnPC9kaXY+J1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgVFBMX1RPT0xUSVA6IHRlbXBsYXRlTWFrZXIudGVtcGxhdGUodGFncy5IVE1MX1RPT0xUSVApLFxuICAgIFRQTF9ERUZBVUxUX1RFTVBMQVRFOiB0ZW1wbGF0ZU1ha2VyLnRlbXBsYXRlKHRhZ3MuSFRNTF9ERUZBVUxUX1RFTVBMQVRFKVxufTtcbiJdfQ==
