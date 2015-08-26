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
 *         ['Legend1', 20, 30, 50],
 *         ['Legend2', 40, 40, 60],
 *         ['Legend3', 60, 50, 10],
 *         ['Legend4', 80, 10, 70]
 *       ]
 *     },
 *     options = {
 *       chart: {
 *         title: 'Bar Chart'
 *       },
 *       yAxis: {
 *         title: 'Vertical Axis'
 *       },
 *       xAxis: {
 *         title: 'Horizontal Axis'
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
 *         ['Legend1', 20, 30, 50],
 *         ['Legend2', 40, 40, 60],
 *         ['Legend3', 60, 50, 10],
 *         ['Legend4', 80, 10, 70]
 *       ]
 *     },
 *     options = {
 *       chart: {
 *         title: 'Column Chart'
 *       },
 *       yAxis: {
 *         title: 'Vertical Axis'
 *       },
 *       xAxis: {
 *         title: 'Horizontal Axis'
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
 *         ['Legend1', 20, 30, 50],
 *         ['Legend2', 40, 40, 60],
 *         ['Legend3', 60, 50, 10],
 *         ['Legend4', 80, 10, 70]
 *       ]
 *     },
 *     options = {
 *       chart: {
 *         title: 'Line Chart'
 *       },
 *       yAxis: {
 *         title: 'Vertical Axis'
 *       },
 *       xAxis: {
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
 *       series: [
 *         column: [
*            ['Legend1', 20, 30, 50],
 *           ['Legend2', 40, 40, 60],
 *           ['Legend3', 60, 50, 10],
 *           ['Legend4', 80, 10, 70]
 *         ],
 *         line: [
 *           ['Legend2_1', 1, 2, 3]
 *         ]
 *       ]
 *     },
 *     options = {
 *       chart: {
 *         title: 'Line Chart'
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
 *         title: 'Horizontal Axis'
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
 *         ['Legend1', 20],
 *         ['Legend2', 40],
 *         ['Legend3', 60],
 *         ['Legend4', 80]
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
     * * @constructs BarChart
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
     * * @constructs ColumnChart
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
     * * @constructs ComboChart
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
     * * @constructs LineChart
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
                    options: options.xAxis,
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
     * @param {number} step original step
     * @returns {number} normalized step
     * @private
     */
    _normalizeStep: function(step) {
        return calculator.normalizeAxisNumber(step);
    },

    /**
     * To minimize tick scale.
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
     * To make normalized max
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
     * To normalize scale
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
     * Get Rendered Labels Max Size(width or height)
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
     * Get width about y right axis
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

var calculator = {
    /**
     * Calculate scale from chart min, max data.
     *  - http://peltiertech.com/how-excel-calculates-automatic-chart-axis-limits/
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
     * @param {{min: number, max: number}} scale axis scale
     * @param {number} count value count
     * @returns {number} scale step
     */
    getScaleStep: function(scale, count) {
        return (scale.max - scale.min) / (count - 1);
    },

    /**
     * Array pivot.
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
     * @param {array} items items
     * @returns {array} picked value
     * @private
     */
    _pickValue: function(items) {
        return [].concat(items.data);
    },

    /**
     * Pick values from axis data.
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

    _pickLegendLabel: function(items) {
        return items.name;
    },

    /**
     * Pick legend labels from axis data.
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
     * @param {string} format format
     * @returns {boolean} result boolean
     * @private
     */
    _isZeroFill: function(format) {
        return format.length > 2 && format.charAt(0) === '0';
    },

    /**
     * Whether decimal format or not.
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
     * @param {string} format format
     * @returns {boolean} result boolean
     * @private
     */
    _isComma: function(format) {
        return format.indexOf(',') === format.split('.')[0].length - 4;
    },

    /**
     * Format zero fill.
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
 * @fileoverview RenderUtil.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var dom = require('./domHandler'),
    chartConst = require('./../const.js');

var browser = ne.util.browser,
    isIE8 = browser.msie && browser.version === 8;

var renderUtil = {
    /**
     * Concat string
     * @params {...string} target strings
     * @returns {string} concat string
     */
    concatStr: function() {
        return String.prototype.concat.apply('', arguments);
    },

    /**
     * To make cssText for font.
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
     * @param {string} label label
     * @param {{fontSize: number, fontFamily: string, color: string}} theme label theme
     * @returns {number} height
     */
    getRenderedLabelHeight: function(label, theme) {
        var labelHeight = this._getRenderedLabelSize(label, theme, 'offsetHeight');
        return labelHeight;
    },

    /**
     * Renderer dimension
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
     * Render position(top, right)
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

var HIDDEN_WIDTH = 1;

var Raphael = window.Raphael,
    browser = ne.util.browser;

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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXhlcy9heGlzLmpzIiwic3JjL2pzL2F4ZXMvYXhpc1RlbXBsYXRlLmpzIiwic3JjL2pzL2NoYXJ0LmpzIiwic3JjL2pzL2NoYXJ0cy9heGlzVHlwZUJhc2UuanMiLCJzcmMvanMvY2hhcnRzL2JhckNoYXJ0LmpzIiwic3JjL2pzL2NoYXJ0cy9jaGFydEJhc2UuanMiLCJzcmMvanMvY2hhcnRzL2NvbHVtbkNoYXJ0LmpzIiwic3JjL2pzL2NoYXJ0cy9jb21ib0NoYXJ0LmpzIiwic3JjL2pzL2NoYXJ0cy9saW5lQ2hhcnQuanMiLCJzcmMvanMvY2hhcnRzL3BpZUNoYXJ0LmpzIiwic3JjL2pzL2NvZGUtc25pcHBldC11dGlsLmpzIiwic3JjL2pzL2NvbnN0LmpzIiwic3JjL2pzL2ZhY3Rvcmllcy9jaGFydEZhY3RvcnkuanMiLCJzcmMvanMvZmFjdG9yaWVzL3BsdWdpbkZhY3RvcnkuanMiLCJzcmMvanMvZmFjdG9yaWVzL3RoZW1lRmFjdG9yeS5qcyIsInNyYy9qcy9oZWxwZXJzL2F4aXNEYXRhTWFrZXIuanMiLCJzcmMvanMvaGVscGVycy9ib3VuZHNNYWtlci5qcyIsInNyYy9qcy9oZWxwZXJzL2NhbGN1bGF0b3IuanMiLCJzcmMvanMvaGVscGVycy9kYXRhQ29udmVydGVyLmpzIiwic3JjL2pzL2hlbHBlcnMvZG9tSGFuZGxlci5qcyIsInNyYy9qcy9oZWxwZXJzL2V2ZW50TGlzdGVuZXIuanMiLCJzcmMvanMvaGVscGVycy9yZW5kZXJVdGlsLmpzIiwic3JjL2pzL2hlbHBlcnMvdGVtcGxhdGVNYWtlci5qcyIsInNyYy9qcy9sZWdlbmRzL2xlZ2VuZC5qcyIsInNyYy9qcy9sZWdlbmRzL2xlZ2VuZFRlbXBsYXRlLmpzIiwic3JjL2pzL3Bsb3RzL3Bsb3QuanMiLCJzcmMvanMvcGxvdHMvcGxvdFRlbXBsYXRlLmpzIiwic3JjL2pzL3BsdWdpbnMvcGx1Z2luUmFwaGFlbC5qcyIsInNyYy9qcy9wbHVnaW5zL3JhcGhhZWxCYXJDaGFydC5qcyIsInNyYy9qcy9wbHVnaW5zL3JhcGhhZWxMaW5lQ2hhcnQuanMiLCJzcmMvanMvcGx1Z2lucy9yYXBoYWVsUGllQ2hhcnQuanMiLCJzcmMvanMvcmVnaXN0ZXJDaGFydHMuanMiLCJzcmMvanMvcmVnaXN0ZXJUaGVtZXMuanMiLCJzcmMvanMvc2VyaWVzL2JhckNoYXJ0U2VyaWVzLmpzIiwic3JjL2pzL3Nlcmllcy9jb2x1bW5DaGFydFNlcmllcy5qcyIsInNyYy9qcy9zZXJpZXMvbGluZUNoYXJ0U2VyaWVzLmpzIiwic3JjL2pzL3Nlcmllcy9waWVDaGFydFNlcmllcy5qcyIsInNyYy9qcy9zZXJpZXMvc2VyaWVzLmpzIiwic3JjL2pzL3RoZW1lcy9kZWZhdWx0VGhlbWUuanMiLCJzcmMvanMvdG9vbHRpcHMvdG9vbHRpcC5qcyIsInNyYy9qcy90b29sdGlwcy90b29sdGlwVGVtcGxhdGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3ZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0V0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbFBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbG1CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeGJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2VkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25ZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgIEF4aXMgY29tcG9uZW50LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZG9tID0gcmVxdWlyZSgnLi4vaGVscGVycy9kb21IYW5kbGVyLmpzJyksXG4gICAgY2FsY3VsYXRvciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvY2FsY3VsYXRvci5qcycpLFxuICAgIHJlbmRlclV0aWwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3JlbmRlclV0aWwuanMnKSxcbiAgICBheGlzVGVtcGxhdGUgPSByZXF1aXJlKCcuL2F4aXNUZW1wbGF0ZS5qcycpO1xuXG52YXIgVElUTEVfQVJFQV9XSURUSF9QQURESU5HID0gMjAsXG4gICAgVl9MQUJFTF9SSUdIVF9QQURESU5HID0gMTA7XG5cbnZhciBBeGlzID0gbmUudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIEF4aXMucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBBeGlzIGNvbXBvbmVudC5cbiAgICAgKiBAY29uc3RydWN0cyBBeGlzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge3tcbiAgICAgKiAgICAgICAgICBsYWJlbHM6IGFycmF5LjxzdHJpbmc+LFxuICAgICAqICAgICAgICAgIHRpY2tDb3VudDogbnVtYmVyLFxuICAgICAqICAgICAgICAgIGlzTGFiZWxBeGlzOiBib29sZWFuLFxuICAgICAqICAgICAgICAgIGlzVmVydGljYWw6IGJvb2xlYW5cbiAgICAgKiAgICAgIH19IHBhcmFtcy5kYXRhIGF4aXMgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5ib3VuZCBheGlzIGJvdW5kXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIGF4aXMgdGhlbWVcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMub3B0aW9ucyBheGlzIG9wdGlvbnNcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgbmUudXRpbC5leHRlbmQodGhpcywgcGFyYW1zKTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEF4aXMgdmlldyBjbGFzc05hbWVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2xhc3NOYW1lID0gJ25lLWNoYXJ0LWF4aXMtYXJlYSc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBheGlzLlxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gYXhpcyBhcmVhIGJhc2UgZWxlbWVudFxuICAgICAqL1xuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBkYXRhID0gdGhpcy5kYXRhLFxuICAgICAgICAgICAgdGhlbWUgPSB0aGlzLnRoZW1lLFxuICAgICAgICAgICAgaXNWZXJ0aWNhbCA9ICEhZGF0YS5pc1ZlcnRpY2FsLFxuICAgICAgICAgICAgaXNQb3NpdGlvblJpZ2h0ID0gZGF0YS5pc1Bvc2l0aW9uUmlnaHQsXG4gICAgICAgICAgICBvcHRpb25zID0gdGhpcy5vcHRpb25zLFxuICAgICAgICAgICAgYm91bmQgPSB0aGlzLmJvdW5kLFxuICAgICAgICAgICAgZGltZW5zaW9uID0gYm91bmQuZGltZW5zaW9uLFxuICAgICAgICAgICAgc2l6ZSA9IGlzVmVydGljYWwgPyBkaW1lbnNpb24uaGVpZ2h0IDogZGltZW5zaW9uLndpZHRoLFxuICAgICAgICAgICAgZWwgPSBkb20uY3JlYXRlKCdESVYnLCB0aGlzLmNsYXNzTmFtZSksXG4gICAgICAgICAgICBlbFRpdGxlQXJlYSA9IHRoaXMuX3JlbmRlclRpdGxlQXJlYSh7XG4gICAgICAgICAgICAgICAgdGl0bGU6IG9wdGlvbnMudGl0bGUsXG4gICAgICAgICAgICAgICAgdGhlbWU6IHRoZW1lLnRpdGxlLFxuICAgICAgICAgICAgICAgIGlzVmVydGljYWw6IGlzVmVydGljYWwsXG4gICAgICAgICAgICAgICAgaXNQb3NpdGlvblJpZ2h0OiBpc1Bvc2l0aW9uUmlnaHQsXG4gICAgICAgICAgICAgICAgc2l6ZTogc2l6ZVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBlbFRpY2tBcmVhID0gdGhpcy5fcmVuZGVyVGlja0FyZWEoc2l6ZSksXG4gICAgICAgICAgICBlbExhYmVsQXJlYSA9IHRoaXMuX3JlbmRlckxhYmVsQXJlYShzaXplLCBkaW1lbnNpb24ud2lkdGgpO1xuICAgICAgICByZW5kZXJVdGlsLnJlbmRlckRpbWVuc2lvbihlbCwgZGltZW5zaW9uKTtcbiAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJQb3NpdGlvbihlbCwgYm91bmQucG9zaXRpb24pO1xuICAgICAgICBkb20uYWRkQ2xhc3MoZWwsIGlzVmVydGljYWwgPyAndmVydGljYWwnIDogJ2hvcml6b250YWwnKTtcbiAgICAgICAgZG9tLmFkZENsYXNzKGVsLCBpc1Bvc2l0aW9uUmlnaHQgPyAncmlnaHQnIDogJycpO1xuICAgICAgICBkb20uYXBwZW5kKGVsLCBbZWxUaXRsZUFyZWEsIGVsVGlja0FyZWEsIGVsTGFiZWxBcmVhXSk7XG5cbiAgICAgICAgcmV0dXJuIGVsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUaXRsZSBhcmVhIHJlbmRlcmVyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLnRpdGxlIGF4aXMgdGl0bGVcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgdGl0bGUgdGhlbWVcbiAgICAgKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gcGFyYW1zLmlzVmVydGljYWwgaXMgdmVydGljYWw/XG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnNpemUgKHdpZHRoIG9yIGhlaWdodClcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHRpdGxlIGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJUaXRsZUFyZWE6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgZWxUaXRsZUFyZWEgPSByZW5kZXJVdGlsLnJlbmRlclRpdGxlKHBhcmFtcy50aXRsZSwgcGFyYW1zLnRoZW1lLCAnbmUtY2hhcnQtdGl0bGUtYXJlYScpLFxuICAgICAgICAgICAgY3NzVGV4dHMgPSBbXTtcblxuICAgICAgICBpZiAoZWxUaXRsZUFyZWEgJiYgcGFyYW1zLmlzVmVydGljYWwpIHtcbiAgICAgICAgICAgIGNzc1RleHRzID0gW1xuICAgICAgICAgICAgICAgIHJlbmRlclV0aWwuY29uY2F0U3RyKCd3aWR0aDonLCBwYXJhbXMuc2l6ZSwgJ3B4JylcbiAgICAgICAgICAgIF07XG4gICAgICAgICAgICBpZiAocGFyYW1zLmlzUG9zaXRpb25SaWdodCkge1xuICAgICAgICAgICAgICAgIGNzc1RleHRzLnB1c2gocmVuZGVyVXRpbC5jb25jYXRTdHIoJ3JpZ2h0OicsIC1wYXJhbXMuc2l6ZSwgJ3B4JykpO1xuICAgICAgICAgICAgICAgIGNzc1RleHRzLnB1c2gocmVuZGVyVXRpbC5jb25jYXRTdHIoJ3RvcDonLCAwLCAncHgnKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNzc1RleHRzLnB1c2gocmVuZGVyVXRpbC5jb25jYXRTdHIoJ2xlZnQ6JywgMCwgJ3B4JykpO1xuICAgICAgICAgICAgICAgIGlmICghcmVuZGVyVXRpbC5pc0lFOCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNzc1RleHRzLnB1c2gocmVuZGVyVXRpbC5jb25jYXRTdHIoJ3RvcDonLCBwYXJhbXMuc2l6ZSwgJ3B4JykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZWxUaXRsZUFyZWEuc3R5bGUuY3NzVGV4dCArPSAnOycgKyBjc3NUZXh0cy5qb2luKCc7Jyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVsVGl0bGVBcmVhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZWRuZXIgdGljayBhcmVhLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzaXplIHNpemUgb3IgaGVpZ2h0XG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSB0aWNrIGFyZWEgZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlclRpY2tBcmVhOiBmdW5jdGlvbihzaXplKSB7XG4gICAgICAgIHZhciBkYXRhID0gdGhpcy5kYXRhLFxuICAgICAgICAgICAgdGlja0NvdW50ID0gZGF0YS50aWNrQ291bnQsXG4gICAgICAgICAgICB0aWNrQ29sb3IgPSB0aGlzLnRoZW1lLnRpY2tDb2xvcixcbiAgICAgICAgICAgIHBvc2l0aW9ucyA9IGNhbGN1bGF0b3IubWFrZVBpeGVsUG9zaXRpb25zKHNpemUsIHRpY2tDb3VudCksXG4gICAgICAgICAgICBlbFRpY2tBcmVhID0gZG9tLmNyZWF0ZSgnRElWJywgJ25lLWNoYXJ0LXRpY2stYXJlYScpLFxuICAgICAgICAgICAgaXNWZXJ0aWNhbCA9IGRhdGEuaXNWZXJ0aWNhbCxcbiAgICAgICAgICAgIHBvc1R5cGUgPSBpc1ZlcnRpY2FsID8gJ2JvdHRvbScgOiAnbGVmdCcsXG4gICAgICAgICAgICBib3JkZXJDb2xvclR5cGUgPSBpc1ZlcnRpY2FsID8gKGRhdGEuaXNQb3NpdGlvblJpZ2h0ID8gJ2JvcmRlckxlZnRDb2xvcicgOiAnYm9yZGVyUmlnaHRDb2xvcicpIDogJ2JvcmRlclRvcENvbG9yJyxcbiAgICAgICAgICAgIHRlbXBsYXRlID0gYXhpc1RlbXBsYXRlLlRQTF9BWElTX1RJQ0ssXG4gICAgICAgICAgICB0aWNrc0h0bWwgPSBuZS51dGlsLm1hcChwb3NpdGlvbnMsIGZ1bmN0aW9uKHBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNzc1RleHQgPSBbXG4gICAgICAgICAgICAgICAgICAgIHJlbmRlclV0aWwuY29uY2F0U3RyKCdiYWNrZ3JvdW5kLWNvbG9yOicsIHRpY2tDb2xvciksXG4gICAgICAgICAgICAgICAgICAgIHJlbmRlclV0aWwuY29uY2F0U3RyKHBvc1R5cGUsICc6ICcsIHBvc2l0aW9uLCAncHgnKVxuICAgICAgICAgICAgICAgIF0uam9pbignOycpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZSh7Y3NzVGV4dDogY3NzVGV4dH0pO1xuICAgICAgICAgICAgfSwgdGhpcykuam9pbignJyk7XG5cbiAgICAgICAgZWxUaWNrQXJlYS5pbm5lckhUTUwgPSB0aWNrc0h0bWw7XG4gICAgICAgIGVsVGlja0FyZWEuc3R5bGVbYm9yZGVyQ29sb3JUeXBlXSA9IHRpY2tDb2xvcjtcblxuICAgICAgICByZXR1cm4gZWxUaWNrQXJlYTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGxhYmVsIGFyZWEuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHNpemUgbGFiZWwgYXJlYSBzaXplXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGF4aXNXaWR0aCBheGlzIGFyZWEgd2lkdGhcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IGxhYmVsIGFyZWEgZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlckxhYmVsQXJlYTogZnVuY3Rpb24oc2l6ZSwgYXhpc1dpZHRoKSB7XG4gICAgICAgIHZhciBkYXRhID0gdGhpcy5kYXRhLFxuICAgICAgICAgICAgdGhlbWUgPSB0aGlzLnRoZW1lLFxuICAgICAgICAgICAgcG9zaXRpb25zID0gY2FsY3VsYXRvci5tYWtlUGl4ZWxQb3NpdGlvbnMoc2l6ZSwgZGF0YS50aWNrQ291bnQpLFxuICAgICAgICAgICAgbGFiZWxXaWR0aCA9IHBvc2l0aW9uc1sxXSAtIHBvc2l0aW9uc1swXSxcbiAgICAgICAgICAgIGxhYmVscyA9IGRhdGEubGFiZWxzLFxuICAgICAgICAgICAgaXNWZXJ0aWNhbCA9IGRhdGEuaXNWZXJ0aWNhbCxcbiAgICAgICAgICAgIGlzTGFiZWxBeGlzID0gZGF0YS5pc0xhYmVsQXhpcyxcbiAgICAgICAgICAgIHBvc1R5cGUgPSAnbGVmdCcsXG4gICAgICAgICAgICBjc3NUZXh0cyA9IHRoaXMuX21ha2VMYWJlbENzc1RleHRzKHtcbiAgICAgICAgICAgICAgICBpc1ZlcnRpY2FsOiBpc1ZlcnRpY2FsLFxuICAgICAgICAgICAgICAgIGlzTGFiZWxBeGlzOiBpc0xhYmVsQXhpcyxcbiAgICAgICAgICAgICAgICBsYWJlbFdpZHRoOiBsYWJlbFdpZHRoXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGVsTGFiZWxBcmVhID0gZG9tLmNyZWF0ZSgnRElWJywgJ25lLWNoYXJ0LWxhYmVsLWFyZWEnKSxcbiAgICAgICAgICAgIGFyZWFDc3NUZXh0ID0gcmVuZGVyVXRpbC5tYWtlRm9udENzc1RleHQodGhlbWUubGFiZWwpLFxuICAgICAgICAgICAgbGFiZWxzSHRtbCwgdGl0bGVBcmVhV2lkdGg7XG5cbiAgICAgICAgaWYgKGlzVmVydGljYWwpIHtcbiAgICAgICAgICAgIHBvc1R5cGUgPSBpc0xhYmVsQXhpcyA/ICd0b3AnIDogJ2JvdHRvbSc7XG4gICAgICAgICAgICB0aXRsZUFyZWFXaWR0aCA9IHRoaXMuX2dldFJlbmRlcmVkVGl0bGVIZWlnaHQoKSArIFRJVExFX0FSRUFfV0lEVEhfUEFERElORztcbiAgICAgICAgICAgIGFyZWFDc3NUZXh0ICs9ICc7d2lkdGg6JyArIChheGlzV2lkdGggLSB0aXRsZUFyZWFXaWR0aCArIFZfTEFCRUxfUklHSFRfUEFERElORykgKyAncHgnO1xuICAgICAgICB9XG5cbiAgICAgICAgcG9zaXRpb25zLmxlbmd0aCA9IGxhYmVscy5sZW5ndGg7XG5cbiAgICAgICAgbGFiZWxzSHRtbCA9IHRoaXMuX21ha2VMYWJlbHNIdG1sKHtcbiAgICAgICAgICAgIHBvc2l0aW9uczogcG9zaXRpb25zLFxuICAgICAgICAgICAgbGFiZWxzOiBsYWJlbHMsXG4gICAgICAgICAgICBwb3NUeXBlOiBwb3NUeXBlLFxuICAgICAgICAgICAgY3NzVGV4dHM6IGNzc1RleHRzXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGVsTGFiZWxBcmVhLmlubmVySFRNTCA9IGxhYmVsc0h0bWw7XG4gICAgICAgIGVsTGFiZWxBcmVhLnN0eWxlLmNzc1RleHQgPSBhcmVhQ3NzVGV4dDtcblxuICAgICAgICB0aGlzLl9jaGFuZ2VMYWJlbEFyZWFQb3NpdGlvbih7XG4gICAgICAgICAgICBlbExhYmVsQXJlYTogZWxMYWJlbEFyZWEsXG4gICAgICAgICAgICBpc1ZlcnRpY2FsOiBpc1ZlcnRpY2FsLFxuICAgICAgICAgICAgaXNMYWJlbEF4aXM6IGlzTGFiZWxBeGlzLFxuICAgICAgICAgICAgdGhlbWU6IHRoZW1lLmxhYmVsLFxuICAgICAgICAgICAgbGFiZWxXaWR0aDogbGFiZWxXaWR0aFxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gZWxMYWJlbEFyZWE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBoZWlnaHQgb2YgdGl0bGUgYXJlYSA7XG4gICAgICogQHJldHVybnMge251bWJlcn0gaGVpZ2h0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0UmVuZGVyZWRUaXRsZUhlaWdodDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB0aXRsZSA9IHRoaXMub3B0aW9ucy50aXRsZSxcbiAgICAgICAgICAgIHRoZW1lID0gdGhpcy50aGVtZS50aXRsZSxcbiAgICAgICAgICAgIHJlc3VsdCA9IHRpdGxlID8gcmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsSGVpZ2h0KHRpdGxlLCB0aGVtZSkgOiAwO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGNzc1RleHRzIG9mIGxhYmVsLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyXG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5pc1ZlcnRpY2FsIHdoZXRoZXIgdmVydGljYWwgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5pc0xhYmVsQXhpcyB3aGV0aGVyIGxhYmVsIGF4aXMgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmxhYmVsV2lkdGggbGFiZWwgd2lkdGggb3IgaGVpZ2h0XG4gICAgICogQHJldHVybnMge3N0cmluZ1tdfSBjc3NUZXh0c1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VMYWJlbENzc1RleHRzOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGNzc1RleHRzID0gW107XG5cbiAgICAgICAgaWYgKHBhcmFtcy5pc1ZlcnRpY2FsICYmIHBhcmFtcy5pc0xhYmVsQXhpcykge1xuICAgICAgICAgICAgY3NzVGV4dHMucHVzaChyZW5kZXJVdGlsLmNvbmNhdFN0cignaGVpZ2h0OicsIHBhcmFtcy5sYWJlbFdpZHRoLCAncHgnKSk7XG4gICAgICAgICAgICBjc3NUZXh0cy5wdXNoKHJlbmRlclV0aWwuY29uY2F0U3RyKCdsaW5lLWhlaWdodDonLCBwYXJhbXMubGFiZWxXaWR0aCwgJ3B4JykpO1xuICAgICAgICB9IGVsc2UgaWYgKCFwYXJhbXMuaXNWZXJ0aWNhbCkge1xuICAgICAgICAgICAgY3NzVGV4dHMucHVzaChyZW5kZXJVdGlsLmNvbmNhdFN0cignd2lkdGg6JywgcGFyYW1zLmxhYmVsV2lkdGgsICdweCcpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjc3NUZXh0cztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBodG1sIG9mIGxhYmVsLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48b2JqZWN0Pn0gcGFyYW1zLnBvc2l0aW9ucyBsYWJlbCBwb3NpdGlvbiBhcnJheVxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmdbXX0gcGFyYW1zLmxhYmVscyBsYWJlbCBhcnJheVxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5wb3NUeXBlIHBvc2l0aW9uIHR5cGUgKGxlZnQgb3IgYm90dG9tKVxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmdbXX0gcGFyYW1zLmNzc1RleHRzIGNzcyBhcnJheVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGh0bWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlTGFiZWxzSHRtbDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciB0ZW1wbGF0ZSA9IGF4aXNUZW1wbGF0ZS5UUExfQVhJU19MQUJFTCxcbiAgICAgICAgICAgIGxhYmVsc0h0bWwgPSBuZS51dGlsLm1hcChwYXJhbXMucG9zaXRpb25zLCBmdW5jdGlvbihwb3NpdGlvbiwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgbGFiZWxDc3NUZXh0cyA9IHBhcmFtcy5jc3NUZXh0cy5zbGljZSgpLFxuICAgICAgICAgICAgICAgICAgICBodG1sO1xuXG4gICAgICAgICAgICAgICAgbGFiZWxDc3NUZXh0cy5wdXNoKHJlbmRlclV0aWwuY29uY2F0U3RyKHBhcmFtcy5wb3NUeXBlLCAnOicsIHBvc2l0aW9uLCAncHgnKSk7XG4gICAgICAgICAgICAgICAgaHRtbCA9IHRlbXBsYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgY3NzVGV4dDogbGFiZWxDc3NUZXh0cy5qb2luKCc7JyksXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiBwYXJhbXMubGFiZWxzW2luZGV4XVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBodG1sO1xuICAgICAgICAgICAgfSwgdGhpcykuam9pbignJyk7XG5cbiAgICAgICAgcmV0dXJuIGxhYmVsc0h0bWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoYW5nZSBwb3NpdGlvbiBvZiBsYWJlbCBhcmVhLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyXG4gICAgICogICAgICBAcGFyYW0ge0hUTUxFbGVtZW50fSBwYXJhbXMuZWxMYWJlbEFyZWEgbGFiZWwgYXJlYSBlbGVtZW50XG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5pc1ZlcnRpY2FsIHdoZXRoZXIgdmVydGljYWwgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5pc0xhYmVsQXhpcyB3aGV0aGVyIGxhYmVsIGF4aXMgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge3tmb250U2l6ZTogbnVtYmVyLCBmb250RmFtaWx5OiBzdHJpbmcsIGNvbG9yOiBzdHJpbmd9fSBwYXJhbXMudGhlbWUgbGFiZWwgdGhlbWVcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubGFiZWxXaWR0aCBsYWJlbCB3aWR0aCBvciBoZWlnaHRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jaGFuZ2VMYWJlbEFyZWFQb3NpdGlvbjogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBsYWJlbEhlaWdodDtcblxuICAgICAgICBpZiAocGFyYW1zLmlzTGFiZWxBeGlzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGFyYW1zLmlzVmVydGljYWwpIHtcbiAgICAgICAgICAgIGxhYmVsSGVpZ2h0ID0gcmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsSGVpZ2h0KCdBQkMnLCBwYXJhbXMudGhlbWUpO1xuICAgICAgICAgICAgcGFyYW1zLmVsTGFiZWxBcmVhLnN0eWxlLnRvcCA9IHJlbmRlclV0aWwuY29uY2F0U3RyKHBhcnNlSW50KGxhYmVsSGVpZ2h0IC8gMiwgMTApLCAncHgnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBhcmFtcy5lbExhYmVsQXJlYS5zdHlsZS5sZWZ0ID0gcmVuZGVyVXRpbC5jb25jYXRTdHIoJy0nLCBwYXJzZUludChwYXJhbXMubGFiZWxXaWR0aCAvIDIsIDEwKSwgJ3B4Jyk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBeGlzO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFRoaXMgaXMgdGVtcGxhdGVzIG9yIGF4aXMgdmlldy5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbnZhciB0ZW1wbGF0ZU1ha2VyID0gcmVxdWlyZSgnLi4vaGVscGVycy90ZW1wbGF0ZU1ha2VyLmpzJyk7XG5cbnZhciB0YWdzID0ge1xuICAgIEhUTUxfQVhJU19USUNLOiAnPGRpdiBjbGFzcz1cIm5lLWNoYXJ0LXRpY2tcIiBzdHlsZT1cInt7IGNzc1RleHQgfX1cIj48L2Rpdj4nLFxuICAgIEhUTUxfQVhJU19MQUJFTDogJzxkaXYgY2xhc3M9XCJuZS1jaGFydC1sYWJlbFwiIHN0eWxlPVwie3sgY3NzVGV4dCB9fVwiPnt7IGxhYmVsIH19PC9kaXY+J1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgVFBMX0FYSVNfVElDSzogdGVtcGxhdGVNYWtlci50ZW1wbGF0ZSh0YWdzLkhUTUxfQVhJU19USUNLKSxcbiAgICBUUExfQVhJU19MQUJFTDogdGVtcGxhdGVNYWtlci50ZW1wbGF0ZSh0YWdzLkhUTUxfQVhJU19MQUJFTClcbn07XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgY2hhcnQuanMgaXMgZW50cnkgcG9pbnQgb2YgQXBwbGljYXRpb24gQ2hhcnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4vY29uc3QuanMnKSxcbiAgICBjaGFydEZhY3RvcnkgPSByZXF1aXJlKCcuL2ZhY3Rvcmllcy9jaGFydEZhY3RvcnkuanMnKSxcbiAgICBwbHVnaW5GYWN0b3J5ID0gcmVxdWlyZSgnLi9mYWN0b3JpZXMvcGx1Z2luRmFjdG9yeS5qcycpLFxuICAgIHRoZW1lRmFjdG9yeSA9IHJlcXVpcmUoJy4vZmFjdG9yaWVzL3RoZW1lRmFjdG9yeS5qcycpO1xuXG52YXIgREVGQVVMVF9USEVNRV9OQU1FID0gJ2RlZmF1bHQnO1xuXG52YXIgX2NyZWF0ZUNoYXJ0O1xuXG5yZXF1aXJlKCcuL2NvZGUtc25pcHBldC11dGlsLmpzJyk7XG5yZXF1aXJlKCcuL3JlZ2lzdGVyQ2hhcnRzLmpzJyk7XG5yZXF1aXJlKCcuL3JlZ2lzdGVyVGhlbWVzLmpzJyk7XG5cbi8qKlxuICogTkhOIEVudGVydGFpbm1lbnQgQXBwbGljYXRpb24gQ2hhcnQuXG4gKiBAbmFtZXNwYWNlIG5lLmFwcGxpY2F0aW9uLmNoYXJ0XG4gKi9cbm5lLnV0aWwuZGVmaW5lTmFtZXNwYWNlKCduZS5hcHBsaWNhdGlvbi5jaGFydCcpO1xuXG4vKipcbiAqIENyZWF0ZSBjaGFydC5cbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciBjb250YWluZXJcbiAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gZGF0YSBjaGFydCBkYXRhXG4gKiBAcGFyYW0ge3tcbiAqICAgY2hhcnQ6IHtcbiAqICAgICB3aWR0aDogbnVtYmVyLFxuICogICAgIGhlaWdodDogbnVtYmVyLFxuICogICAgIHRpdGxlOiBzdHJpbmcsXG4gKiAgICAgZm9ybWF0OiBzdHJpbmdcbiAqICAgfSxcbiAqICAgeUF4aXM6IHtcbiAqICAgICB0aXRsZTogc3RyaW5nLFxuICogICAgIG1pbjogbnVtYmVyXG4gKiAgIH0sXG4gKiAgIHhBeGlzOiB7XG4gKiAgICAgdGl0bGU6IHN0cmlnLFxuICogICAgIG1pbjogbnVtYmVyXG4gKiAgIH0sXG4gKiAgIHRvb2x0aXA6IHtcbiAqICAgICBzdWZmaXg6IHN0cmluZyxcbiAqICAgICB0ZW1wbGF0ZTogc3RyaW5nXG4gKiAgIH0sXG4gKiAgIHRoZW1lOiBzdHJpbmdcbiAqIH19IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICogQHJldHVybnMge29iamVjdH0gY2hhcnQgaW5zdGFuY2UuXG4gKiBAcHJpdmF0ZVxuICogQGlnbm9yZVxuICovXG5fY3JlYXRlQ2hhcnQgPSBmdW5jdGlvbihjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpIHtcbiAgICB2YXIgdGhlbWVOYW1lLCB0aGVtZSwgY2hhcnQ7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdGhlbWVOYW1lID0gb3B0aW9ucy50aGVtZSB8fCBERUZBVUxUX1RIRU1FX05BTUU7XG4gICAgdGhlbWUgPSB0aGVtZUZhY3RvcnkuZ2V0KHRoZW1lTmFtZSk7XG5cbiAgICBjaGFydCA9IGNoYXJ0RmFjdG9yeS5nZXQob3B0aW9ucy5jaGFydFR5cGUsIGRhdGEsIHRoZW1lLCBvcHRpb25zKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoY2hhcnQucmVuZGVyKCkpO1xuXG4gICAgcmV0dXJuIGNoYXJ0O1xufTtcblxuLyoqXG4gKiBCYXIgY2hhcnQgY3JlYXRvci5cbiAqIEBtZW1iZXJPZiBuZS5hcHBsaWNhdGlvbi5jaGFydFxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNoYXJ0IGNvbnRhaW5lclxuICogQHBhcmFtIHtvYmplY3R9IGRhdGEgY2hhcnQgZGF0YVxuICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBkYXRhLmNhdGVnb3JpZXMgY2F0ZWdvcmllc1xuICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IGRhdGEuc2VyaWVzIHNlcmllcyBkYXRhXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLmNoYXJ0IGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LndpZHRoIGNoYXJ0IHdpZHRoXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5jaGFydC5oZWlnaHQgY2hhcnQgaGVpZ2h0XG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC50aXRsZSBjaGFydCB0aXRsZVxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuY2hhcnQuZm9ybWF0IHZhbHVlIGZvcm1hdFxuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy55QXhpcyBvcHRpb25zIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnlBeGlzLnRpdGxlIHRpdGxlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMueEF4aXMgb3B0aW9ucyBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnhBeGlzLnRpdGxlIHRpdGxlIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMueEF4aXMubWluIG1pbmltYWwgdmFsdWUgb2YgaG9yaXpvbnRhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy54QXhpcy5tYXggbWF4aW11bSB2YWx1ZSBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuc2VyaWVzIG9wdGlvbnMgb2Ygc2VyaWVzXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5zZXJpZXMuc3RhY2tlZCBzdGFja2VkIHR5cGVcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMudG9vbHRpcCBvcHRpb25zIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAuc3VmZml4IHN1ZmZpeCBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnRlbXBsYXRlIHRlbXBsYXRlIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAucG9zaXRpb24gdG9vbHRpcCBwb3NpdGlvbiB0eXBlXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uIGFkZCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24ubGVmdCBhZGQgbGVmdCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24udG9wIGFkZCB0b3AgcG9zaXRpb25cbiAqICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudGhlbWUgdGhlbWUgbmFtZVxuICogICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5saWJUeXBlIGdyYXBoIGxpYnJhcnkgdHlwZVxuICogQHJldHVybnMge29iamVjdH0gYmFyIGNoYXJ0XG4gKiBAZXhhbXBsZVxuICogdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWluZXItaWQnKSxcbiAqICAgICBkYXRhID0ge1xuICogICAgICAgY2F0ZWdvcmllczogWydjYXRlMScsICdjYXRlMicsICdjYXRlMyddLFxuICogICAgICAgc2VyaWVzOiBbXG4gKiAgICAgICAgIFsnTGVnZW5kMScsIDIwLCAzMCwgNTBdLFxuICogICAgICAgICBbJ0xlZ2VuZDInLCA0MCwgNDAsIDYwXSxcbiAqICAgICAgICAgWydMZWdlbmQzJywgNjAsIDUwLCAxMF0sXG4gKiAgICAgICAgIFsnTGVnZW5kNCcsIDgwLCAxMCwgNzBdXG4gKiAgICAgICBdXG4gKiAgICAgfSxcbiAqICAgICBvcHRpb25zID0ge1xuICogICAgICAgY2hhcnQ6IHtcbiAqICAgICAgICAgdGl0bGU6ICdCYXIgQ2hhcnQnXG4gKiAgICAgICB9LFxuICogICAgICAgeUF4aXM6IHtcbiAqICAgICAgICAgdGl0bGU6ICdWZXJ0aWNhbCBBeGlzJ1xuICogICAgICAgfSxcbiAqICAgICAgIHhBeGlzOiB7XG4gKiAgICAgICAgIHRpdGxlOiAnSG9yaXpvbnRhbCBBeGlzJ1xuICogICAgICAgfVxuICogICAgIH07XG4gKiBuZS5hcHBsaWNhdGlvbi5jaGFydC5iYXJDaGFydChjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpO1xuICovXG5uZS5hcHBsaWNhdGlvbi5jaGFydC5iYXJDaGFydCA9IGZ1bmN0aW9uKGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIG9wdGlvbnMuY2hhcnRUeXBlID0gY2hhcnRDb25zdC5DSEFSVF9UWVBFX0JBUjtcbiAgICByZXR1cm4gX2NyZWF0ZUNoYXJ0KGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucyk7XG59O1xuXG4vKipcbiAqIENvbHVtbiBjaGFydCBjcmVhdG9yLlxuICogQG1lbWJlck9mIG5lLmFwcGxpY2F0aW9uLmNoYXJ0XG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY2hhcnQgY29udGFpbmVyXG4gKiBAcGFyYW0ge29iamVjdH0gZGF0YSBjaGFydCBkYXRhXG4gKiAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGRhdGEuY2F0ZWdvcmllcyBjYXRlZ29yaWVzXG4gKiAgICAgIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gZGF0YS5zZXJpZXMgc2VyaWVzIGRhdGFcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuY2hhcnQgY2hhcnQgb3B0aW9uc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMuY2hhcnQud2lkdGggY2hhcnQgd2lkdGhcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LmhlaWdodCBjaGFydCBoZWlnaHRcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmNoYXJ0LnRpdGxlIGNoYXJ0IHRpdGxlXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC5mb3JtYXQgdmFsdWUgZm9ybWF0XG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnlBeGlzIG9wdGlvbnMgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMueUF4aXMudGl0bGUgdGl0bGUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMueUF4aXMubWluIG1pbmltYWwgdmFsdWUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMueUF4aXMubWF4IG1heGltdW0gdmFsdWUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy54QXhpcyBvcHRpb25zIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMueEF4aXMudGl0bGUgdGl0bGUgb2YgaG9yaXpvbnRhbCBheGlzXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnNlcmllcyBvcHRpb25zIG9mIHNlcmllc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuc2VyaWVzLnN0YWNrZWQgc3RhY2tlZCB0eXBlXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnRvb2x0aXAgb3B0aW9ucyBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnN1ZmZpeCBzdWZmaXggb2YgdG9vbHRpcFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC50ZW1wbGF0ZSB0ZW1wbGF0ZSBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnBvc2l0aW9uIHRvb2x0aXAgcG9zaXRpb24gdHlwZVxuICogICAgICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMudG9vbHRpcC5hZGRQb3NpdGlvbiBhZGQgcG9zaXRpb25cbiAqICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uLmxlZnQgYWRkIGxlZnQgcG9zaXRpb25cbiAqICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uLnRvcCBhZGQgdG9wIHBvc2l0aW9uXG4gKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRoZW1lIHRoZW1lIG5hbWVcbiAqICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMubGliVHlwZSBncmFwaCBsaWJyYXJ5IHR5cGVcbiAqIEByZXR1cm5zIHtvYmplY3R9IGNvbHVtbiBjaGFydFxuICogQGV4YW1wbGVcbiAqIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFpbmVyLWlkJyksXG4gKiAgICAgZGF0YSA9IHtcbiAqICAgICAgIGNhdGVnb3JpZXM6IFsnY2F0ZTEnLCAnY2F0ZTInLCAnY2F0ZTMnXSxcbiAqICAgICAgIHNlcmllczogW1xuICogICAgICAgICBbJ0xlZ2VuZDEnLCAyMCwgMzAsIDUwXSxcbiAqICAgICAgICAgWydMZWdlbmQyJywgNDAsIDQwLCA2MF0sXG4gKiAgICAgICAgIFsnTGVnZW5kMycsIDYwLCA1MCwgMTBdLFxuICogICAgICAgICBbJ0xlZ2VuZDQnLCA4MCwgMTAsIDcwXVxuICogICAgICAgXVxuICogICAgIH0sXG4gKiAgICAgb3B0aW9ucyA9IHtcbiAqICAgICAgIGNoYXJ0OiB7XG4gKiAgICAgICAgIHRpdGxlOiAnQ29sdW1uIENoYXJ0J1xuICogICAgICAgfSxcbiAqICAgICAgIHlBeGlzOiB7XG4gKiAgICAgICAgIHRpdGxlOiAnVmVydGljYWwgQXhpcydcbiAqICAgICAgIH0sXG4gKiAgICAgICB4QXhpczoge1xuICogICAgICAgICB0aXRsZTogJ0hvcml6b250YWwgQXhpcydcbiAqICAgICAgIH1cbiAqICAgICB9O1xuICogbmUuYXBwbGljYXRpb24uY2hhcnQuY29sdW1uQ2hhcnQoY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKTtcbiAqL1xubmUuYXBwbGljYXRpb24uY2hhcnQuY29sdW1uQ2hhcnQgPSBmdW5jdGlvbihjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICBvcHRpb25zLmNoYXJ0VHlwZSA9IGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9DT0xVTU47XG4gICAgcmV0dXJuIF9jcmVhdGVDaGFydChjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpO1xufTtcblxuLyoqXG4gKiBMaW5lIGNoYXJ0IGNyZWF0b3IuXG4gKiBAbWVtYmVyT2YgbmUuYXBwbGljYXRpb24uY2hhcnRcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciBjaGFydCBjb250YWluZXJcbiAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhIGNoYXJ0IGRhdGFcbiAqICAgICAgQHBhcmFtIHthcnJheS48c3RyaW5nPn0gZGF0YS5jYXRlZ29yaWVzIGNhdGVnb3JpZXNcbiAqICAgICAgQHBhcmFtIHthcnJheS48YXJyYXk+fSBkYXRhLnNlcmllcyBzZXJpZXMgZGF0YVxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5jaGFydCBjaGFydCBvcHRpb25zXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5jaGFydC53aWR0aCBjaGFydCB3aWR0aFxuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMuY2hhcnQuaGVpZ2h0IGNoYXJ0IGhlaWdodFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuY2hhcnQudGl0bGUgY2hhcnQgdGl0bGVcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmNoYXJ0LmZvcm1hdCB2YWx1ZSBmb3JtYXRcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMueUF4aXMgb3B0aW9ucyBvZiB2ZXJ0aWNhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy55QXhpcy50aXRsZSB0aXRsZSBvZiB2ZXJ0aWNhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy55QXhpcy5taW4gbWluaW1hbCB2YWx1ZSBvZiB2ZXJ0aWNhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy55QXhpcy5tYXggbWF4aW11bSB2YWx1ZSBvZiB2ZXJ0aWNhbCBheGlzXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnhBeGlzIG9wdGlvbnMgb2YgaG9yaXpvbnRhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy54QXhpcy50aXRsZSB0aXRsZSBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuc2VyaWVzIG9wdGlvbnMgb2Ygc2VyaWVzXG4gKiAgICAgICAgICBAcGFyYW0ge2Jvb2xlYW59IG9wdGlvbnMuc2VyaWVzLmhhc0RvdCB3aGV0aGVyIGhhcyBkb3Qgb3Igbm90XG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnRvb2x0aXAgb3B0aW9ucyBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnN1ZmZpeCBzdWZmaXggb2YgdG9vbHRpcFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC50ZW1wbGF0ZSB0ZW1wbGF0ZSBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnBvc2l0aW9uIHRvb2x0aXAgcG9zaXRpb24gdHlwZVxuICogICAgICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMudG9vbHRpcC5hZGRQb3NpdGlvbiBhZGQgcG9zaXRpb25cbiAqICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uLmxlZnQgYWRkIGxlZnQgcG9zaXRpb25cbiAqICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uLnRvcCBhZGQgdG9wIHBvc2l0aW9uXG4gKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRoZW1lIHRoZW1lIG5hbWVcbiAqICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMubGliVHlwZSBncmFwaCBsaWJyYXJ5IHR5cGVcbiAqIEByZXR1cm5zIHtvYmplY3R9IGJhciBjaGFydFxuICogQGV4YW1wbGVcbiAqIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFpbmVyLWlkJyksXG4gKiAgICAgZGF0YSA9IHtcbiAqICAgICAgIGNhdGVnb3JpZXM6IFsnY2F0ZTEnLCAnY2F0ZTInLCAnY2F0ZTMnXSxcbiAqICAgICAgIHNlcmllczogW1xuICogICAgICAgICBbJ0xlZ2VuZDEnLCAyMCwgMzAsIDUwXSxcbiAqICAgICAgICAgWydMZWdlbmQyJywgNDAsIDQwLCA2MF0sXG4gKiAgICAgICAgIFsnTGVnZW5kMycsIDYwLCA1MCwgMTBdLFxuICogICAgICAgICBbJ0xlZ2VuZDQnLCA4MCwgMTAsIDcwXVxuICogICAgICAgXVxuICogICAgIH0sXG4gKiAgICAgb3B0aW9ucyA9IHtcbiAqICAgICAgIGNoYXJ0OiB7XG4gKiAgICAgICAgIHRpdGxlOiAnTGluZSBDaGFydCdcbiAqICAgICAgIH0sXG4gKiAgICAgICB5QXhpczoge1xuICogICAgICAgICB0aXRsZTogJ1ZlcnRpY2FsIEF4aXMnXG4gKiAgICAgICB9LFxuICogICAgICAgeEF4aXM6IHtcbiAqICAgICAgICAgdGl0bGU6ICdIb3Jpem9udGFsIEF4aXMnXG4gKiAgICAgICB9LFxuICogICAgICAgc2VyaWVzOiB7XG4gKiAgICAgICAgIGhhc0RvdDogdHJ1ZVxuICogICAgICAgfVxuICogICAgIH07XG4gKiBuZS5hcHBsaWNhdGlvbi5jaGFydC5saW5lQ2hhcnQoY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKTtcbiAqL1xubmUuYXBwbGljYXRpb24uY2hhcnQubGluZUNoYXJ0ID0gZnVuY3Rpb24oY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgb3B0aW9ucy5jaGFydFR5cGUgPSBjaGFydENvbnN0LkNIQVJUX1RZUEVfTElORTtcbiAgICByZXR1cm4gX2NyZWF0ZUNoYXJ0KGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucyk7XG59O1xuXG4vKipcbiAqIENvbWJvIGNoYXJ0IGNyZWF0b3IuXG4gKiBAbWVtYmVyT2YgbmUuYXBwbGljYXRpb24uY2hhcnRcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciBjaGFydCBjb250YWluZXJcbiAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhIGNoYXJ0IGRhdGFcbiAqICAgICAgQHBhcmFtIHthcnJheS48c3RyaW5nPn0gZGF0YS5jYXRlZ29yaWVzIGNhdGVnb3JpZXNcbiAqICAgICAgQHBhcmFtIHthcnJheS48YXJyYXk+fSBkYXRhLnNlcmllcyBzZXJpZXMgZGF0YVxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5jaGFydCBjaGFydCBvcHRpb25zXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5jaGFydC53aWR0aCBjaGFydCB3aWR0aFxuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMuY2hhcnQuaGVpZ2h0IGNoYXJ0IGhlaWdodFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuY2hhcnQudGl0bGUgY2hhcnQgdGl0bGVcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmNoYXJ0LmZvcm1hdCB2YWx1ZSBmb3JtYXRcbiAqICAgICAgQHBhcmFtIHtvYmplY3RbXX0gb3B0aW9ucy55QXhpcyBvcHRpb25zIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnlBeGlzW10udGl0bGUgdGl0bGUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMueUF4aXNbXS5taW4gbWluaW1hbCB2YWx1ZSBvZiB2ZXJ0aWNhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy55QXhpc1tdLm1heCBtYXhpbXVtIHZhbHVlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMueEF4aXMgb3B0aW9ucyBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnhBeGlzLnRpdGxlIHRpdGxlIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMueEF4aXMubWluIG1pbmltYWwgdmFsdWUgb2YgaG9yaXpvbnRhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy54QXhpcy5tYXggbWF4aW11bSB2YWx1ZSBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuc2VyaWVzIG9wdGlvbnMgb2Ygc2VyaWVzXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5zZXJpZXMuY29sdW1uIG9wdGlvbnMgb2YgY29sdW1uIHNlcmllc1xuICogICAgICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnNlcmllcy5jb2x1bW4uc3RhY2tlZCBzdGFja2VkIHR5cGVcbiAqICAgICAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnNlcmllcy5saW5lIG9wdGlvbnMgb2YgbGluZSBzZXJpZXNcbiAqICAgICAgICAgICAgICBAcGFyYW0ge2Jvb2xlYW59IG9wdGlvbnMuc2VyaWVzLmxpbmUuaGFzRG90IHdoZXRoZXIgaGFzIGRvdCBvciBub3RcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMudG9vbHRpcCBvcHRpb25zIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnRvb2x0aXAuY29sdW1uIG9wdGlvbnMgb2YgY29sdW1uIHRvb2x0aXBcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLmNvbHVtbi5zdWZmaXggc3VmZml4IG9mIHRvb2x0aXBcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLmNvbHVtbi50ZW1wbGF0ZSB0ZW1wbGF0ZSBvZiB0b29sdGlwXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC5jb2x1bW4ucG9zaXRpb24gdG9vbHRpcCBwb3NpdGlvbiB0eXBlXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMudG9vbHRpcC5jb2x1bW4uYWRkUG9zaXRpb24gYWRkIHBvc2l0aW9uXG4gKiAgICAgICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuY29sdW1uLmFkZFBvc2l0aW9uLmxlZnQgYWRkIGxlZnQgcG9zaXRpb25cbiAqICAgICAgICAgICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMudG9vbHRpcC5jb2x1bW4uYWRkUG9zaXRpb24udG9wIGFkZCB0b3AgcG9zaXRpb25cbiAqICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudGhlbWUgdGhlbWUgbmFtZVxuICogICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5saWJUeXBlIGdyYXBoIGxpYnJhcnkgdHlwZVxuICogQHJldHVybnMge29iamVjdH0gYmFyIGNoYXJ0XG4gKiBAZXhhbXBsZVxuICogdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWluZXItaWQnKSxcbiAqICAgICBkYXRhID0ge1xuICogICAgICAgY2F0ZWdvcmllczogWydjYXRlMScsICdjYXRlMicsICdjYXRlMyddLFxuICogICAgICAgc2VyaWVzOiBbXG4gKiAgICAgICAgIGNvbHVtbjogW1xuKiAgICAgICAgICAgIFsnTGVnZW5kMScsIDIwLCAzMCwgNTBdLFxuICogICAgICAgICAgIFsnTGVnZW5kMicsIDQwLCA0MCwgNjBdLFxuICogICAgICAgICAgIFsnTGVnZW5kMycsIDYwLCA1MCwgMTBdLFxuICogICAgICAgICAgIFsnTGVnZW5kNCcsIDgwLCAxMCwgNzBdXG4gKiAgICAgICAgIF0sXG4gKiAgICAgICAgIGxpbmU6IFtcbiAqICAgICAgICAgICBbJ0xlZ2VuZDJfMScsIDEsIDIsIDNdXG4gKiAgICAgICAgIF1cbiAqICAgICAgIF1cbiAqICAgICB9LFxuICogICAgIG9wdGlvbnMgPSB7XG4gKiAgICAgICBjaGFydDoge1xuICogICAgICAgICB0aXRsZTogJ0xpbmUgQ2hhcnQnXG4gKiAgICAgICB9LFxuICogICAgICAgeUF4aXM6W1xuICogICAgICAgICB7XG4gKiAgICAgICAgICAgdGl0bGU6ICdZIEF4aXMnLFxuICogICAgICAgICAgIGNoYXJ0VHlwZTogJ2xpbmUnXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICB0aXRsZTogJ1kgUmlnaHQgQXhpcydcbiAqICAgICAgICAgfVxuICogICAgICAgXSxcbiAqICAgICAgIHhBeGlzOiB7XG4gKiAgICAgICAgIHRpdGxlOiAnSG9yaXpvbnRhbCBBeGlzJ1xuICogICAgICAgfSxcbiAqICAgICAgIHNlcmllczoge1xuICogICAgICAgICBoYXNEb3Q6IHRydWVcbiAqICAgICAgIH1cbiAqICAgICB9O1xuICogbmUuYXBwbGljYXRpb24uY2hhcnQuY29tYm9DaGFydChjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpO1xuICovXG5uZS5hcHBsaWNhdGlvbi5jaGFydC5jb21ib0NoYXJ0ID0gZnVuY3Rpb24oY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgb3B0aW9ucy5jaGFydFR5cGUgPSBjaGFydENvbnN0LkNIQVJUX1RZUEVfQ09NQk87XG4gICAgcmV0dXJuIF9jcmVhdGVDaGFydChjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpO1xufTtcblxuLyoqXG4gKiBQaWUgY2hhcnQgY3JlYXRvci5cbiAqIEBtZW1iZXJPZiBuZS5hcHBsaWNhdGlvbi5jaGFydFxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNoYXJ0IGNvbnRhaW5lclxuICogQHBhcmFtIHtvYmplY3R9IGRhdGEgY2hhcnQgZGF0YVxuICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IGRhdGEuc2VyaWVzIHNlcmllcyBkYXRhXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLmNoYXJ0IGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LndpZHRoIGNoYXJ0IHdpZHRoXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5jaGFydC5oZWlnaHQgY2hhcnQgaGVpZ2h0XG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC50aXRsZSBjaGFydCB0aXRsZVxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuY2hhcnQuZm9ybWF0IHZhbHVlIGZvcm1hdFxuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy50b29sdGlwIG9wdGlvbnMgb2YgdG9vbHRpcFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC5zdWZmaXggc3VmZml4IG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAudGVtcGxhdGUgdGVtcGxhdGUgb2YgdG9vbHRpcFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC5wb3NpdGlvbiB0b29sdGlwIHBvc2l0aW9uIHR5cGVcbiAqICAgICAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24gYWRkIHBvc2l0aW9uXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMudG9vbHRpcC5hZGRQb3NpdGlvbi5sZWZ0IGFkZCBsZWZ0IHBvc2l0aW9uXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMudG9vbHRpcC5hZGRQb3NpdGlvbi50b3AgYWRkIHRvcCBwb3NpdGlvblxuICogICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50aGVtZSB0aGVtZSBuYW1lXG4gKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmxpYlR5cGUgZ3JhcGggbGlicmFyeSB0eXBlXG4gKiBAcmV0dXJucyB7b2JqZWN0fSBiYXIgY2hhcnRcbiAqIEBleGFtcGxlXG4gKiB2YXIgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhaW5lci1pZCcpLFxuICogICAgIGRhdGEgPSB7XG4gKiAgICAgICBzZXJpZXM6IFtcbiAqICAgICAgICAgWydMZWdlbmQxJywgMjBdLFxuICogICAgICAgICBbJ0xlZ2VuZDInLCA0MF0sXG4gKiAgICAgICAgIFsnTGVnZW5kMycsIDYwXSxcbiAqICAgICAgICAgWydMZWdlbmQ0JywgODBdXG4gKiAgICAgICBdXG4gKiAgICAgfSxcbiAqICAgICBvcHRpb25zID0ge1xuICogICAgICAgY2hhcnQ6IHtcbiAqICAgICAgICAgdGl0bGU6ICdQaWUgQ2hhcnQnXG4gKiAgICAgICB9XG4gKiAgICAgfTtcbiAqIG5lLmFwcGxpY2F0aW9uLmNoYXJ0LnBpZUNoYXJ0KGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucyk7XG4gKi9cbm5lLmFwcGxpY2F0aW9uLmNoYXJ0LnBpZUNoYXJ0ID0gZnVuY3Rpb24oY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgb3B0aW9ucy5jaGFydFR5cGUgPSBjaGFydENvbnN0LkNIQVJUX1RZUEVfUElFO1xuICAgIHJldHVybiBfY3JlYXRlQ2hhcnQoY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKTtcbn07XG5cbi8qKlxuICogUmVnaXN0ZXIgdGhlbWUuXG4gKiBAbWVtYmVyT2YgbmUuYXBwbGljYXRpb24uY2hhcnRcbiAqIEBwYXJhbSB7c3RyaW5nfSB0aGVtZU5hbWUgdGhlbWUgbmFtZVxuICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIGFwcGxpY2F0aW9uIGNoYXJ0IHRoZW1lXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSB0aGVtZS5jaGFydCBjaGFydCB0aGVtZVxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLmNoYXJ0LmZvbnRGYW1pbHkgZm9udCBmYW1pbHkgb2YgY2hhcnRcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS5jaGFydC5iYWNrZ3JvdW5kIGJhY2tncm91bmQgb2YgY2hhcnRcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IHRoZW1lLnRpdGxlIGNoYXJ0IHRoZW1lXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gdGhlbWUudGl0bGUuZm9udFNpemUgZm9udCBzaXplIG9mIGNoYXJ0IHRpdGxlXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUudGl0bGUuZm9udEZhbWlseSBmb250IGZhbWlseSBvZiBjaGFydCB0aXRsZVxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnRpdGxlLmNvbG9yIGZvbnQgY29sb3Igb2YgY2hhcnQgdGl0bGVcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS50aXRsZS5iYWNrZ3JvdW5kIGJhY2tncm91bmQgb2YgY2hhcnQgdGl0bGVcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IHRoZW1lLnlBeGlzIHRoZW1lIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7b2JqZWN0fSB0aGVtZS55QXhpcy50aXRsZSB0aGVtZSBvZiB2ZXJ0aWNhbCBheGlzIHRpdGxlXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IHRoZW1lLnlBeGlzLnRpdGxlLmZvbnRTaXplIGZvbnQgc2l6ZSBvZiB2ZXJ0aWNhbCBheGlzIHRpdGxlXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnlBeGlzLnRpdGxlLmZvbnRGYW1pbHkgZm9udCBmYW1pbHkgb2YgdmVydGljYWwgYXhpcyB0aXRsZVxuICogICAgICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS55QXhpcy50aXRsZS5jb2xvciBmb250IGNvbG9yIG9mIHZlcnRpY2FsIGF4aXMgdGl0bGVcbiAqICAgICAgICAgIEBwYXJhbSB7b2JqZWN0fSB0aGVtZS55QXhpcy5sYWJlbCB0aGVtZSBvZiB2ZXJ0aWNhbCBheGlzIGxhYmVsXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IHRoZW1lLnlBeGlzLmxhYmVsLmZvbnRTaXplIGZvbnQgc2l6ZSBvZiB2ZXJ0aWNhbCBheGlzIGxhYmVsXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnlBeGlzLmxhYmVsLmZvbnRGYW1pbHkgZm9udCBmYW1pbHkgb2YgdmVydGljYWwgYXhpcyBsYWJlbFxuICogICAgICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS55QXhpcy5sYWJlbC5jb2xvciBmb250IGNvbG9yIG9mIHZlcnRpY2FsIGF4aXMgbGFiZWxcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS55QXhpcy50aWNrY29sb3IgY29sb3Igb2YgdmVydGljYWwgYXhpcyB0aWNrXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSB0aGVtZS54QXhpcyB0aGVtZSBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7b2JqZWN0fSB0aGVtZS54QXhpcy50aXRsZSB0aGVtZSBvZiBob3Jpem9udGFsIGF4aXMgdGl0bGVcbiAqICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gdGhlbWUueEF4aXMudGl0bGUuZm9udFNpemUgZm9udCBzaXplIG9mIGhvcml6b250YWwgYXhpcyB0aXRsZVxuICogICAgICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS54QXhpcy50aXRsZS5mb250RmFtaWx5IGZvbnQgZmFtaWx5IG9mIGhvcml6b250YWwgYXhpcyB0aXRsZVxuICogICAgICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS54QXhpcy50aXRsZS5jb2xvciBmb250IGNvbG9yIG9mIGhvcml6b250YWwgYXhpcyB0aXRsZVxuICogICAgICAgICAgQHBhcmFtIHtvYmplY3R9IHRoZW1lLnhBeGlzLmxhYmVsIHRoZW1lIG9mIGhvcml6b250YWwgYXhpcyBsYWJlbFxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSB0aGVtZS54QXhpcy5sYWJlbC5mb250U2l6ZSBmb250IHNpemUgb2YgaG9yaXpvbnRhbCBheGlzIGxhYmVsXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnhBeGlzLmxhYmVsLmZvbnRGYW1pbHkgZm9udCBmYW1pbHkgb2YgaG9yaXpvbnRhbCBheGlzIGxhYmVsXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnhBeGlzLmxhYmVsLmNvbG9yIGZvbnQgY29sb3Igb2YgaG9yaXpvbnRhbCBheGlzIGxhYmVsXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUueEF4aXMudGlja2NvbG9yIGNvbG9yIG9mIGhvcml6b250YWwgYXhpcyB0aWNrXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSB0aGVtZS5wbG90IHBsb3QgdGhlbWVcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS5wbG90LmxpbmVDb2xvciBwbG90IGxpbmUgY29sb3JcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS5wbG90LmJhY2tncm91bmQgcGxvdCBiYWNrZ3JvdW5kXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSB0aGVtZS5zZXJpZXMgc2VyaWVzIHRoZW1lXG4gKiAgICAgICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSB0aGVtZS5zZXJpZXMuY29sb3JzIHNlcmllcyBjb2xvcnNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS5zZXJpZXMuYm9yZGVyQ29sb3Igc2VyaWVzIGJvcmRlciBjb2xvclxuICogICAgICBAcGFyYW0ge29iamVjdH0gdGhlbWUubGVnZW5kIGxlZ2VuZCB0aGVtZVxuICogICAgICAgICAgQHBhcmFtIHtvYmplY3R9IHRoZW1lLmxlZ2VuZC5sYWJlbCB0aGVtZSBvZiBsZWdlbmQgbGFiZWxcbiAqICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gdGhlbWUubGVnZW5kLmxhYmVsLmZvbnRTaXplIGZvbnQgc2l6ZSBvZiBsZWdlbmQgbGFiZWxcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUubGVnZW5kLmxhYmVsLmZvbnRGYW1pbHkgZm9udCBmYW1pbHkgb2YgbGVnZW5kIGxhYmVsXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLmxlZ2VuZC5sYWJlbC5jb2xvciBmb250IGNvbG9yIG9mIGxlZ2VuZCBsYWJlbFxuICogQGV4YW1wbGVcbiAqIHZhciB0aGVtZSA9IHtcbiAqICAgeUF4aXM6IHtcbiAqICAgICB0aWNrQ29sb3I6ICcjY2NiZDlhJyxcbiAqICAgICAgIHRpdGxlOiB7XG4gKiAgICAgICAgIGNvbG9yOiAnIzMzMzMzMydcbiAqICAgICAgIH0sXG4gKiAgICAgICBsYWJlbDoge1xuICogICAgICAgICBjb2xvcjogJyM2ZjQ5MWQnXG4gKiAgICAgICB9XG4gKiAgICAgfSxcbiAqICAgICB4QXhpczoge1xuICogICAgICAgdGlja0NvbG9yOiAnI2NjYmQ5YScsXG4gKiAgICAgICB0aXRsZToge1xuICogICAgICAgICBjb2xvcjogJyMzMzMzMzMnXG4gKiAgICAgICB9LFxuICogICAgICAgbGFiZWw6IHtcbiAqICAgICAgICAgY29sb3I6ICcjNmY0OTFkJ1xuICogICAgICAgfVxuICogICAgIH0sXG4gKiAgICAgcGxvdDoge1xuICogICAgICAgbGluZUNvbG9yOiAnI2U1ZGJjNCcsXG4gKiAgICAgICBiYWNrZ3JvdW5kOiAnI2Y2ZjFlNSdcbiAqICAgICB9LFxuICogICAgIHNlcmllczoge1xuICogICAgICAgY29sb3JzOiBbJyM0MGFiYjQnLCAnI2U3OGEzMScsICcjYzFjNDUyJywgJyM3OTUyMjQnLCAnI2Y1ZjVmNSddLFxuICogICAgICAgYm9yZGVyQ29sb3I6ICcjOGU2NTM1J1xuICogICAgIH0sXG4gKiAgICAgbGVnZW5kOiB7XG4gKiAgICAgICBsYWJlbDoge1xuICogICAgICAgICBjb2xvcjogJyM2ZjQ5MWQnXG4gKiAgICAgICB9XG4gKiAgICAgfVxuICogICB9O1xuICogY2hhcnQucmVnaXN0ZXJUaGVtZSgnbmV3VGhlbWUnLCB0aGVtZSk7XG4gKi9cbm5lLmFwcGxpY2F0aW9uLmNoYXJ0LnJlZ2lzdGVyVGhlbWUgPSBmdW5jdGlvbih0aGVtZU5hbWUsIHRoZW1lKSB7XG4gICAgdGhlbWVGYWN0b3J5LnJlZ2lzdGVyKHRoZW1lTmFtZSwgdGhlbWUpO1xufTtcblxuLyoqXG4gKiBSZWdpc3RlciBncmFwaCBwbHVnaW4uXG4gKiBAbWVtYmVyT2YgbmUuYXBwbGljYXRpb24uY2hhcnRcbiAqIEBwYXJhbSB7c3RyaW5nfSBsaWJUeXBlIHR5cGUgb2YgZ3JhcGggbGlicmFyeVxuICogQHBhcmFtIHtvYmplY3R9IHBsdWdpbiBwbHVnaW4gdG8gY29udHJvbCBsaWJyYXJ5XG4gKiBAZXhhbXBsZVxuICogdmFyIHBsdWdpblJhcGhhZWwgPSB7XG4gKiAgIGJhcjogZnVuY3Rpb24oKSB7fSAvLyBSZW5kZXIgY2xhc3NcbiAqIH07XG4gKiBuZS5hcHBsaWNhdGlvbi5jaGFydC5yZWdpc3RlclBsdWdpbigncmFwaGFlbCcsIHBsdWdpblJhcGhhZWwpO1xuICovXG5uZS5hcHBsaWNhdGlvbi5jaGFydC5yZWdpc3RlclBsdWdpbiA9IGZ1bmN0aW9uKGxpYlR5cGUsIHBsdWdpbikge1xuICAgIHBsdWdpbkZhY3RvcnkucmVnaXN0ZXIobGliVHlwZSwgcGx1Z2luKTtcbn07XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgQXhpc0Jhc2VcbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIENoYXJ0QmFzZSA9IHJlcXVpcmUoJy4vY2hhcnRCYXNlLmpzJyksXG4gICAgQXhpcyA9IHJlcXVpcmUoJy4uL2F4ZXMvYXhpcy5qcycpLFxuICAgIFBsb3QgPSByZXF1aXJlKCcuLi9wbG90cy9wbG90LmpzJyksXG4gICAgTGVnZW5kID0gcmVxdWlyZSgnLi4vbGVnZW5kcy9sZWdlbmQuanMnKSxcbiAgICBUb29sdGlwID0gcmVxdWlyZSgnLi4vdG9vbHRpcHMvdG9vbHRpcC5qcycpO1xuXG52YXIgQXhpc1R5cGVCYXNlID0gbmUudXRpbC5kZWZpbmVDbGFzcyhDaGFydEJhc2UsIC8qKiBAbGVuZHMgQXhpc1R5cGVCYXNlLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogQXhpcyB0eXBlIGNoYXJ0IGJhc2VcbiAgICAgKiBAY29uc3RydWN0cyBBeGlzVHlwZUJhc2VcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICAgIENoYXJ0QmFzZS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIGF4aXMgY29tcG9uZW50c1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5jb3ZlcnREYXRhIGNvbnZlcnRlZCBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmF4ZXMgYXhlcyBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnBsb3REYXRhIHBsb3QgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHtmdW5jdGlvbn0gcGFyYW1zLlNlcmllcyBzZXJpZXMgY2xhc3NcbiAgICAgKi9cbiAgICBhZGRBeGlzQ29tcG9uZW50czogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBjb252ZXJ0RGF0YSA9IHBhcmFtcy5jb252ZXJ0RGF0YTtcblxuICAgICAgICBpZiAocGFyYW1zLnBsb3REYXRhKSB7XG4gICAgICAgICAgICB0aGlzLmFkZENvbXBvbmVudCgncGxvdCcsIFBsb3QsIHBhcmFtcy5wbG90RGF0YSk7XG4gICAgICAgIH1cblxuICAgICAgICBuZS51dGlsLmZvckVhY2gocGFyYW1zLmF4ZXMsIGZ1bmN0aW9uKGRhdGEsIG5hbWUpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KG5hbWUsIEF4aXMsIHtcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgaWYgKGNvbnZlcnREYXRhLmpvaW5MZWdlbmRMYWJlbHMpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KCdsZWdlbmQnLCBMZWdlbmQsIHtcbiAgICAgICAgICAgICAgICBqb2luTGVnZW5kTGFiZWxzOiBjb252ZXJ0RGF0YS5qb2luTGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgICAgIGxlZ2VuZExhYmVsczogY29udmVydERhdGEubGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgICAgIGNoYXJ0VHlwZTogcGFyYW1zLmNoYXJ0VHlwZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmFkZENvbXBvbmVudCgndG9vbHRpcCcsIFRvb2x0aXAsIHtcbiAgICAgICAgICAgIHZhbHVlczogY29udmVydERhdGEuZm9ybWF0dGVkVmFsdWVzLFxuICAgICAgICAgICAgbGFiZWxzOiBjb252ZXJ0RGF0YS5sYWJlbHMsXG4gICAgICAgICAgICBsZWdlbmRMYWJlbHM6IGNvbnZlcnREYXRhLmxlZ2VuZExhYmVscyxcbiAgICAgICAgICAgIHByZWZpeDogdGhpcy50b29sdGlwUHJlZml4XG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEF4aXNUeXBlQmFzZTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBCYXIgY2hhcnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBBeGlzVHlwZUJhc2UgPSByZXF1aXJlKCcuL2F4aXNUeXBlQmFzZS5qcycpLFxuICAgIGF4aXNEYXRhTWFrZXIgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2F4aXNEYXRhTWFrZXIuanMnKSxcbiAgICBTZXJpZXMgPSByZXF1aXJlKCcuLi9zZXJpZXMvYmFyQ2hhcnRTZXJpZXMuanMnKTtcblxudmFyIEJhckNoYXJ0ID0gbmUudXRpbC5kZWZpbmVDbGFzcyhBeGlzVHlwZUJhc2UsIC8qKiBAbGVuZHMgQmFyQ2hhcnQucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBCYXIgY2hhcnQuXG4gICAgICogKiBAY29uc3RydWN0cyBCYXJDaGFydFxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gdXNlckRhdGEgY2hhcnQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBjaGFydCB0aGVtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbih1c2VyRGF0YSwgdGhlbWUsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIGJhc2VEYXRhID0gdGhpcy5tYWtlQmFzZURhdGEodXNlckRhdGEsIHRoZW1lLCBvcHRpb25zLCB7XG4gICAgICAgICAgICAgICAgaGFzQXhlczogdHJ1ZVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBjb252ZXJ0RGF0YSA9IGJhc2VEYXRhLmNvbnZlcnREYXRhLFxuICAgICAgICAgICAgYm91bmRzID0gYmFzZURhdGEuYm91bmRzLFxuICAgICAgICAgICAgYXhpc0RhdGE7XG5cbiAgICAgICAgdGhpcy5jbGFzc05hbWUgPSAnbmUtYmFyLWNoYXJ0JztcblxuICAgICAgICBBeGlzVHlwZUJhc2UuY2FsbCh0aGlzLCBib3VuZHMsIHRoZW1lLCBvcHRpb25zKTtcblxuICAgICAgICBheGlzRGF0YSA9IHRoaXMuX21ha2VBeGVzRGF0YShjb252ZXJ0RGF0YSwgYm91bmRzLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5fYWRkQ29tcG9uZW50cyhjb252ZXJ0RGF0YSwgYXhpc0RhdGEsIG9wdGlvbnMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGF4ZXMgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb252ZXJ0RGF0YSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBib3VuZHMgY2hhcnQgYm91bmRzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IGF4ZXMgZGF0YVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VBeGVzRGF0YTogZnVuY3Rpb24oY29udmVydERhdGEsIGJvdW5kcywgb3B0aW9ucykge1xuICAgICAgICB2YXIgYXhlc0RhdGEgPSB7XG4gICAgICAgICAgICB5QXhpczogYXhpc0RhdGFNYWtlci5tYWtlTGFiZWxBeGlzRGF0YSh7XG4gICAgICAgICAgICAgICAgbGFiZWxzOiBjb252ZXJ0RGF0YS5sYWJlbHMsXG4gICAgICAgICAgICAgICAgaXNWZXJ0aWNhbDogdHJ1ZVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICB4QXhpczogYXhpc0RhdGFNYWtlci5tYWtlVmFsdWVBeGlzRGF0YSh7XG4gICAgICAgICAgICAgICAgdmFsdWVzOiBjb252ZXJ0RGF0YS52YWx1ZXMsXG4gICAgICAgICAgICAgICAgc2VyaWVzRGltZW5zaW9uOiBib3VuZHMuc2VyaWVzLmRpbWVuc2lvbixcbiAgICAgICAgICAgICAgICBzdGFja2VkOiBvcHRpb25zLnNlcmllcyAmJiBvcHRpb25zLnNlcmllcy5zdGFja2VkIHx8ICcnLFxuICAgICAgICAgICAgICAgIGNoYXJ0VHlwZTogb3B0aW9ucy5jaGFydFR5cGUsXG4gICAgICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zOiBjb252ZXJ0RGF0YS5mb3JtYXRGdW5jdGlvbnMsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogb3B0aW9ucy54QXhpc1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGF4ZXNEYXRhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgY29tcG9uZW50c1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb252ZXJ0RGF0YSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBheGVzRGF0YSBheGVzIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYWRkQ29tcG9uZW50czogZnVuY3Rpb24oY29udmVydERhdGEsIGF4ZXNEYXRhLCBvcHRpb25zKSB7XG4gICAgICAgIHRoaXMuYWRkQXhpc0NvbXBvbmVudHMoe1xuICAgICAgICAgICAgY29udmVydERhdGE6IGNvbnZlcnREYXRhLFxuICAgICAgICAgICAgYXhlczogYXhlc0RhdGEsXG4gICAgICAgICAgICBwbG90RGF0YToge1xuICAgICAgICAgICAgICAgIHZUaWNrQ291bnQ6IGF4ZXNEYXRhLnlBeGlzLnZhbGlkVGlja0NvdW50LFxuICAgICAgICAgICAgICAgIGhUaWNrQ291bnQ6IGF4ZXNEYXRhLnhBeGlzLnZhbGlkVGlja0NvdW50XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2hhcnRUeXBlOiBvcHRpb25zLmNoYXJ0VHlwZVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmFkZENvbXBvbmVudCgnc2VyaWVzJywgU2VyaWVzLCB7XG4gICAgICAgICAgICBsaWJUeXBlOiBvcHRpb25zLmxpYlR5cGUsXG4gICAgICAgICAgICBjaGFydFR5cGU6IG9wdGlvbnMuY2hhcnRUeXBlLFxuICAgICAgICAgICAgdG9vbHRpcFByZWZpeDogdGhpcy50b29sdGlwUHJlZml4LFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIHZhbHVlczogY29udmVydERhdGEudmFsdWVzLFxuICAgICAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlczogY29udmVydERhdGEuZm9ybWF0dGVkVmFsdWVzLFxuICAgICAgICAgICAgICAgIHNjYWxlOiBheGVzRGF0YS54QXhpcy5zY2FsZVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBCYXJDaGFydDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBDaGFydEJhc2VcbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGRvbSA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZG9tSGFuZGxlci5qcycpLFxuICAgIHJlbmRlclV0aWwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3JlbmRlclV0aWwuanMnKSxcbiAgICBkYXRhQ29udmVydGVyID0gcmVxdWlyZSgnLi4vaGVscGVycy9kYXRhQ29udmVydGVyLmpzJyksXG4gICAgYm91bmRzTWFrZXIgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2JvdW5kc01ha2VyLmpzJyk7XG5cbnZhciBUT09MVElQX1BSRUZJWCA9ICduZS1jaGFydC10b29sdGlwLSc7XG5cbnZhciBDaGFydEJhc2UgPSBuZS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgQ2hhcnRCYXNlLnByb3RvdHlwZSAqLyB7XG4gICAgdG9vbHRpcFByZWZpeDogVE9PTFRJUF9QUkVGSVggKyAobmV3IERhdGUoKSkuZ2V0VGltZSgpICsgJy0nLFxuXG4gICAgLyoqXG4gICAgICogQ2hhcnQgYmFzZS5cbiAgICAgKiBAY29uc3RydWN0cyBDaGFydEJhc2VcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYm91bmRzIGNoYXJ0IGJvdW5kc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBjaGFydCB0aGVtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gaW5pdGVkRGF0YSBpbml0aWFsaXplZCBkYXRhIGZyb20gY29tYm8gY2hhcnRcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihib3VuZHMsIHRoZW1lLCBvcHRpb25zLCBpbml0ZWREYXRhKSB7XG4gICAgICAgIHRoaXMuY29tcG9uZW50cyA9IFtdO1xuICAgICAgICB0aGlzLmNvbXBvbmVudE1hcCA9IHt9O1xuICAgICAgICB0aGlzLmJvdW5kcyA9IGJvdW5kcztcbiAgICAgICAgdGhpcy50aGVtZSA9IHRoZW1lO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgICAgICBpZiAoaW5pdGVkRGF0YSAmJiBpbml0ZWREYXRhLnByZWZpeCkge1xuICAgICAgICAgICAgdGhpcy50b29sdGlwUHJlZml4ICs9IGluaXRlZERhdGEucHJlZml4O1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYmFlcyBkYXRhLlxuICAgICAqIEBwYXJhbSB7YXJyYXkgfCBvYmplY3R9IHVzZXJEYXRhIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBjaGFydCB0aGVtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYm91bmRQYXJhbXMgYWRkIGJvdW5kIHBhcmFtc1xuICAgICAqIEByZXR1cm5zIHt7Y29udmVydERhdGE6IG9iamVjdCwgYm91bmRzOiBvYmplY3R9fSBiYXNlIGRhdGFcbiAgICAgKi9cbiAgICBtYWtlQmFzZURhdGE6IGZ1bmN0aW9uKHVzZXJEYXRhLCB0aGVtZSwgb3B0aW9ucywgYm91bmRQYXJhbXMpIHtcbiAgICAgICAgdmFyIGNvbnZlcnREYXRhID0gZGF0YUNvbnZlcnRlci5jb252ZXJ0KHVzZXJEYXRhLCBvcHRpb25zLmNoYXJ0LCBvcHRpb25zLmNoYXJ0VHlwZSwgYm91bmRQYXJhbXMgJiYgYm91bmRQYXJhbXMueUF4aXNDaGFydFR5cGVzKSxcbiAgICAgICAgICAgIGJvdW5kcyA9IGJvdW5kc01ha2VyLm1ha2UobmUudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgICAgIGNvbnZlcnREYXRhOiBjb252ZXJ0RGF0YSxcbiAgICAgICAgICAgICAgICB0aGVtZTogdGhlbWUsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgICAgICAgICAgfSwgYm91bmRQYXJhbXMpKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY29udmVydERhdGE6IGNvbnZlcnREYXRhLFxuICAgICAgICAgICAgYm91bmRzOiBib3VuZHNcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIGNvbXBvbmVudC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBjb21wb25lbnQgbmFtZVxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IENvbXBvbmVudCBjb21wb25lbnQgZnVuY3Rpb25cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKi9cbiAgICBhZGRDb21wb25lbnQ6IGZ1bmN0aW9uKG5hbWUsIENvbXBvbmVudCwgcGFyYW1zKSB7XG4gICAgICAgIHZhciBib3VuZCA9IHRoaXMuYm91bmRzW25hbWVdLFxuICAgICAgICAgICAgdGhlbWUgPSB0aGlzLnRoZW1lW25hbWVdLFxuICAgICAgICAgICAgb3B0aW9ucyA9IHRoaXMub3B0aW9uc1tuYW1lXSxcbiAgICAgICAgICAgIGluZGV4ID0gcGFyYW1zLmluZGV4IHx8IDAsXG4gICAgICAgICAgICBjb21tb25QYXJhbXMgPSB7fSxcbiAgICAgICAgICAgIGNvbXBvbmVudDtcblxuICAgICAgICBjb21tb25QYXJhbXMuYm91bmQgPSBuZS51dGlsLmlzQXJyYXkoYm91bmQpID8gYm91bmRbaW5kZXhdIDogYm91bmQ7XG4gICAgICAgIGNvbW1vblBhcmFtcy50aGVtZSA9IG5lLnV0aWwuaXNBcnJheSh0aGVtZSkgPyB0aGVtZVtpbmRleF0gOiB0aGVtZTtcbiAgICAgICAgY29tbW9uUGFyYW1zLm9wdGlvbnMgPSBuZS51dGlsLmlzQXJyYXkob3B0aW9ucykgPyBvcHRpb25zW2luZGV4XSA6IG9wdGlvbnMgfHwge307XG5cbiAgICAgICAgcGFyYW1zID0gbmUudXRpbC5leHRlbmQoY29tbW9uUGFyYW1zLCBwYXJhbXMpO1xuICAgICAgICBjb21wb25lbnQgPSBuZXcgQ29tcG9uZW50KHBhcmFtcyk7XG4gICAgICAgIHRoaXMuY29tcG9uZW50cy5wdXNoKGNvbXBvbmVudCk7XG4gICAgICAgIHRoaXMuY29tcG9uZW50TWFwW25hbWVdID0gY29tcG9uZW50O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgY2hhcnQuXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgY2hhcnQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciBvYmplY3QgZm9yIGdyYXBoIGRyYXdpbmdcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IGNoYXJ0IGVsZW1lbnRcbiAgICAgKi9cbiAgICByZW5kZXI6IGZ1bmN0aW9uKGVsLCBwYXBlcikge1xuICAgICAgICBpZiAoIWVsKSB7XG4gICAgICAgICAgICBlbCA9IGRvbS5jcmVhdGUoJ0RJVicsIHRoaXMuY2xhc3NOYW1lKTtcblxuICAgICAgICAgICAgZG9tLmFkZENsYXNzKGVsLCAnbmUtY2hhcnQnKTtcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlclRpdGxlKGVsKTtcbiAgICAgICAgICAgIHJlbmRlclV0aWwucmVuZGVyRGltZW5zaW9uKGVsLCB0aGlzLmJvdW5kcy5jaGFydC5kaW1lbnNpb24pO1xuICAgICAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJCYWNrZ3JvdW5kKGVsLCB0aGlzLnRoZW1lLmNoYXJ0LmJhY2tncm91bmQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fcmVuZGVyQ29tcG9uZW50cyhlbCwgdGhpcy5jb21wb25lbnRzLCBwYXBlcik7XG4gICAgICAgIHRoaXMuX2F0dGFjaEN1c3RvbUV2ZW50KCk7XG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIHRpdGxlLlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyVGl0bGU6IGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgIHZhciBjaGFydE9wdGlvbnMgPSB0aGlzLm9wdGlvbnMuY2hhcnQgfHwge30sXG4gICAgICAgICAgICBlbFRpdGxlID0gcmVuZGVyVXRpbC5yZW5kZXJUaXRsZShjaGFydE9wdGlvbnMudGl0bGUsIHRoaXMudGhlbWUudGl0bGUsICduZS1jaGFydC10aXRsZScpO1xuICAgICAgICBkb20uYXBwZW5kKGVsLCBlbFRpdGxlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGNvbXBvbmVudHMuXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNvbnRhaW5lciBlbGVtZW50XG4gICAgICogQHBhcmFtIHthcnJheS48b2JqZWN0Pn0gY29tcG9uZW50cyBjb21wb25lbnRzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIG9iamVjdCBmb3IgZ3JhcGggZHJhd2luZ1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlckNvbXBvbmVudHM6IGZ1bmN0aW9uKGNvbnRhaW5lciwgY29tcG9uZW50cywgcGFwZXIpIHtcbiAgICAgICAgdmFyIGVsZW1lbnRzID0gbmUudXRpbC5tYXAoY29tcG9uZW50cywgZnVuY3Rpb24oY29tcG9uZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gY29tcG9uZW50LnJlbmRlcihwYXBlcik7XG4gICAgICAgIH0pO1xuICAgICAgICBkb20uYXBwZW5kKGNvbnRhaW5lciwgZWxlbWVudHMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgcGFwZXIuXG4gICAgICogQHJldHVybnMge29iamVjdH0gcGFwZXJcbiAgICAgKi9cbiAgICBnZXRQYXBlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZXJpZXMgPSB0aGlzLmNvbXBvbmVudE1hcC5zZXJpZXMsXG4gICAgICAgICAgICBwYXBlcjtcblxuICAgICAgICBpZiAoc2VyaWVzKSB7XG4gICAgICAgICAgICBwYXBlciA9IHNlcmllcy5nZXRQYXBlcigpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhcGVyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggY3VzdG9tIGV2ZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYXR0YWNoQ3VzdG9tRXZlbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdG9vbHRpcCA9IHRoaXMuY29tcG9uZW50TWFwLnRvb2x0aXAsXG4gICAgICAgICAgICBzZXJpZXMgPSB0aGlzLmNvbXBvbmVudE1hcC5zZXJpZXM7XG4gICAgICAgIGlmICghdG9vbHRpcCB8fCAhc2VyaWVzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc2VyaWVzLm9uKCdzaG93VG9vbHRpcCcsIHRvb2x0aXAub25TaG93LCB0b29sdGlwKTtcbiAgICAgICAgc2VyaWVzLm9uKCdoaWRlVG9vbHRpcCcsIHRvb2x0aXAub25IaWRlLCB0b29sdGlwKTtcblxuICAgICAgICBpZiAoIXNlcmllcy5vblNob3dBbmltYXRpb24pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRvb2x0aXAub24oJ3Nob3dBbmltYXRpb24nLCBzZXJpZXMub25TaG93QW5pbWF0aW9uLCBzZXJpZXMpO1xuICAgICAgICB0b29sdGlwLm9uKCdoaWRlQW5pbWF0aW9uJywgc2VyaWVzLm9uSGlkZUFuaW1hdGlvbiwgc2VyaWVzKTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBDaGFydEJhc2U7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgQ29sdW1uIGNoYXJ0LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQXhpc1R5cGVCYXNlID0gcmVxdWlyZSgnLi9heGlzVHlwZUJhc2UuanMnKSxcbiAgICBheGlzRGF0YU1ha2VyID0gcmVxdWlyZSgnLi4vaGVscGVycy9heGlzRGF0YU1ha2VyLmpzJyksXG4gICAgU2VyaWVzID0gcmVxdWlyZSgnLi4vc2VyaWVzL2NvbHVtbkNoYXJ0U2VyaWVzLmpzJyk7XG5cbnZhciBDb2x1bW5DaGFydCA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoQXhpc1R5cGVCYXNlLCAvKiogQGxlbmRzIENvbHVtbkNoYXJ0LnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogQ29sdW1uIGNoYXJ0LlxuICAgICAqICogQGNvbnN0cnVjdHMgQ29sdW1uQ2hhcnRcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheT59IHVzZXJEYXRhIGNoYXJ0IGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgY2hhcnQgdGhlbWVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGluaXRlZERhdGEgaW5pdGlhbGl6ZWQgZGF0YSBmcm9tIGNvbWJvIGNoYXJ0XG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24odXNlckRhdGEsIHRoZW1lLCBvcHRpb25zLCBpbml0ZWREYXRhKSB7XG4gICAgICAgIHZhciBiYXNlRGF0YSA9IGluaXRlZERhdGEgfHwgdGhpcy5tYWtlQmFzZURhdGEodXNlckRhdGEsIHRoZW1lLCBvcHRpb25zLCB7XG4gICAgICAgICAgICAgICAgaXNWZXJ0aWNhbDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBoYXNBeGVzOiB0cnVlXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGNvbnZlcnREYXRhID0gYmFzZURhdGEuY29udmVydERhdGEsXG4gICAgICAgICAgICBib3VuZHMgPSBiYXNlRGF0YS5ib3VuZHMsXG4gICAgICAgICAgICBheGlzRGF0YTtcblxuICAgICAgICB0aGlzLmNsYXNzTmFtZSA9ICduZS1jb2x1bW4tY2hhcnQnO1xuXG4gICAgICAgIEF4aXNUeXBlQmFzZS5jYWxsKHRoaXMsIGJvdW5kcywgdGhlbWUsIG9wdGlvbnMsIGluaXRlZERhdGEpO1xuXG4gICAgICAgIGF4aXNEYXRhID0gdGhpcy5fbWFrZUF4ZXNEYXRhKGNvbnZlcnREYXRhLCBib3VuZHMsIG9wdGlvbnMsIGluaXRlZERhdGEpO1xuICAgICAgICB0aGlzLl9hZGRDb21wb25lbnRzKGNvbnZlcnREYXRhLCBheGlzRGF0YSwgb3B0aW9ucyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYXhlcyBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGNvbnZlcnREYXRhIGNvbnZlcnRlZCBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGJvdW5kcyBjaGFydCBib3VuZHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGluaXRlZERhdGEgaW5pdGlhbGl6ZWQgZGF0YSBmcm9tIGNvbWJvIGNoYXJ0XG4gICAgICogQHJldHVybnMge29iamVjdH0gYXhlcyBkYXRhXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUF4ZXNEYXRhOiBmdW5jdGlvbihjb252ZXJ0RGF0YSwgYm91bmRzLCBvcHRpb25zLCBpbml0ZWREYXRhKSB7XG4gICAgICAgIHZhciBheGVzRGF0YSA9IHt9O1xuICAgICAgICBpZiAoaW5pdGVkRGF0YSkge1xuICAgICAgICAgICAgYXhlc0RhdGEgPSBpbml0ZWREYXRhLmF4ZXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBheGVzRGF0YSA9IHtcbiAgICAgICAgICAgICAgICB5QXhpczogYXhpc0RhdGFNYWtlci5tYWtlVmFsdWVBeGlzRGF0YSh7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlczogY29udmVydERhdGEudmFsdWVzLFxuICAgICAgICAgICAgICAgICAgICBzZXJpZXNEaW1lbnNpb246IGJvdW5kcy5zZXJpZXMuZGltZW5zaW9uLFxuICAgICAgICAgICAgICAgICAgICBzdGFja2VkOiBvcHRpb25zLnNlcmllcyAmJiBvcHRpb25zLnNlcmllcy5zdGFja2VkIHx8ICcnLFxuICAgICAgICAgICAgICAgICAgICBjaGFydFR5cGU6IG9wdGlvbnMuY2hhcnRUeXBlLFxuICAgICAgICAgICAgICAgICAgICBmb3JtYXRGdW5jdGlvbnM6IGNvbnZlcnREYXRhLmZvcm1hdEZ1bmN0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogb3B0aW9ucy55QXhpcyxcbiAgICAgICAgICAgICAgICAgICAgaXNWZXJ0aWNhbDogdHJ1ZVxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIHhBeGlzOiBheGlzRGF0YU1ha2VyLm1ha2VMYWJlbEF4aXNEYXRhKHtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxzOiBjb252ZXJ0RGF0YS5sYWJlbHNcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXhlc0RhdGE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZCBjb21wb25lbnRzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGNvbnZlcnREYXRhIGNvbnZlcnRlZCBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGF4ZXNEYXRhIGF4ZXMgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hZGRDb21wb25lbnRzOiBmdW5jdGlvbihjb252ZXJ0RGF0YSwgYXhlc0RhdGEsIG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5hZGRBeGlzQ29tcG9uZW50cyh7XG4gICAgICAgICAgICBjb252ZXJ0RGF0YTogY29udmVydERhdGEsXG4gICAgICAgICAgICBheGVzOiBheGVzRGF0YSxcbiAgICAgICAgICAgIHBsb3REYXRhOiAhbmUudXRpbC5pc1VuZGVmaW5lZChjb252ZXJ0RGF0YS5wbG90RGF0YSkgPyBjb252ZXJ0RGF0YS5wbG90RGF0YSA6IHtcbiAgICAgICAgICAgICAgICB2VGlja0NvdW50OiBheGVzRGF0YS55QXhpcy52YWxpZFRpY2tDb3VudCxcbiAgICAgICAgICAgICAgICBoVGlja0NvdW50OiBheGVzRGF0YS54QXhpcy52YWxpZFRpY2tDb3VudFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNoYXJ0VHlwZTogb3B0aW9ucy5jaGFydFR5cGVcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5hZGRDb21wb25lbnQoJ3NlcmllcycsIFNlcmllcywge1xuICAgICAgICAgICAgbGliVHlwZTogb3B0aW9ucy5saWJUeXBlLFxuICAgICAgICAgICAgY2hhcnRUeXBlOiBvcHRpb25zLmNoYXJ0VHlwZSxcbiAgICAgICAgICAgIHRvb2x0aXBQcmVmaXg6IHRoaXMudG9vbHRpcFByZWZpeCxcbiAgICAgICAgICAgIGlzUG9pbnRQb3NpdGlvbjogdHJ1ZSxcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICB2YWx1ZXM6IGNvbnZlcnREYXRhLnZhbHVlcyxcbiAgICAgICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXM6IGNvbnZlcnREYXRhLmZvcm1hdHRlZFZhbHVlcyxcbiAgICAgICAgICAgICAgICBzY2FsZTogYXhlc0RhdGEueUF4aXMuc2NhbGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29sdW1uQ2hhcnQ7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgQ29tYm8gY2hhcnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBjYWxjdWxhdG9yID0gcmVxdWlyZSgnLi4vaGVscGVycy9jYWxjdWxhdG9yLmpzJyksXG4gICAgQ2hhcnRCYXNlID0gcmVxdWlyZSgnLi9jaGFydEJhc2UuanMnKSxcbiAgICBheGlzRGF0YU1ha2VyID0gcmVxdWlyZSgnLi4vaGVscGVycy9heGlzRGF0YU1ha2VyLmpzJyksXG4gICAgZGVmYXVsdFRoZW1lID0gcmVxdWlyZSgnLi4vdGhlbWVzL2RlZmF1bHRUaGVtZS5qcycpLFxuICAgIENvbHVtbkNoYXJ0ID0gcmVxdWlyZSgnLi9jb2x1bW5DaGFydCcpLFxuICAgIExpbmVDaGFydCA9IHJlcXVpcmUoJy4vbGluZUNoYXJ0Jyk7XG5cbnZhciBDb21ib0NoYXJ0ID0gbmUudXRpbC5kZWZpbmVDbGFzcyhDaGFydEJhc2UsIC8qKiBAbGVuZHMgQ29tYm9DaGFydC5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIENvbWJvIGNoYXJ0LlxuICAgICAqICogQGNvbnN0cnVjdHMgQ29tYm9DaGFydFxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gdXNlckRhdGEgY2hhcnQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBjaGFydCB0aGVtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbih1c2VyRGF0YSwgdGhlbWUsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIHNlcmllc0NoYXJ0VHlwZXMgPSBuZS51dGlsLmtleXModXNlckRhdGEuc2VyaWVzKS5zb3J0KCksXG4gICAgICAgICAgICB5QXhpc0NoYXJ0VHlwZXMgPSB0aGlzLl9nZXRZQXhpc0NoYXJ0VHlwZXMoc2VyaWVzQ2hhcnRUeXBlcywgb3B0aW9ucy55QXhpcyksXG4gICAgICAgICAgICBjaGFydFR5cGVzID0geUF4aXNDaGFydFR5cGVzLmxlbmd0aCA/IHlBeGlzQ2hhcnRUeXBlcyA6IHNlcmllc0NoYXJ0VHlwZXMsXG4gICAgICAgICAgICBpc09uZVlBeGlzID0gIXlBeGlzQ2hhcnRUeXBlcy5sZW5ndGgsXG4gICAgICAgICAgICBiYXNlRGF0YSA9IHRoaXMubWFrZUJhc2VEYXRhKHVzZXJEYXRhLCB0aGVtZSwgb3B0aW9ucywge1xuICAgICAgICAgICAgICAgIGlzVmVydGljYWw6IHRydWUsXG4gICAgICAgICAgICAgICAgaGFzQXhlczogdHJ1ZSxcbiAgICAgICAgICAgICAgICB5QXhpc0NoYXJ0VHlwZXM6IHlBeGlzQ2hhcnRUeXBlc1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBjb252ZXJ0RGF0YSA9IGJhc2VEYXRhLmNvbnZlcnREYXRhLFxuICAgICAgICAgICAgYm91bmRzID0gYmFzZURhdGEuYm91bmRzLFxuICAgICAgICAgICAgc2VyaWVzRGltZW5zaW9uID0gYm91bmRzLnNlcmllcy5kaW1lbnNpb24sXG4gICAgICAgICAgICBheGVzRGF0YSA9IHt9LFxuICAgICAgICAgICAgYmFzZUF4ZXNEYXRhID0ge30sXG4gICAgICAgICAgICB5QXhpc1BhcmFtcztcblxuICAgICAgICB0aGlzLmNsYXNzTmFtZSA9ICduZS1jb21iby1jaGFydCc7XG5cbiAgICAgICAgeUF4aXNQYXJhbXMgPSB7XG4gICAgICAgICAgICBjb252ZXJ0RGF0YTogY29udmVydERhdGEsXG4gICAgICAgICAgICBzZXJpZXNEaW1lbnNpb246IHNlcmllc0RpbWVuc2lvbixcbiAgICAgICAgICAgIGNoYXJ0VHlwZXM6IGNoYXJ0VHlwZXMsXG4gICAgICAgICAgICBpc09uZVlBeGlzOiBpc09uZVlBeGlzLFxuICAgICAgICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgICAgICB9O1xuXG4gICAgICAgIENoYXJ0QmFzZS5jYWxsKHRoaXMsIGJvdW5kcywgdGhlbWUsIG9wdGlvbnMpO1xuXG4gICAgICAgIGJhc2VBeGVzRGF0YS55QXhpcyA9IHRoaXMuX21ha2VZQXhpc0RhdGEobmUudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgaW5kZXg6IDBcbiAgICAgICAgfSwgeUF4aXNQYXJhbXMpKTtcblxuICAgICAgICBiYXNlQXhlc0RhdGEueEF4aXMgPSBheGlzRGF0YU1ha2VyLm1ha2VMYWJlbEF4aXNEYXRhKHtcbiAgICAgICAgICAgIGxhYmVsczogY29udmVydERhdGEubGFiZWxzXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGF4ZXNEYXRhID0gdGhpcy5fbWFrZUF4ZXNEYXRhKGJhc2VBeGVzRGF0YSwgeUF4aXNQYXJhbXMpO1xuXG4gICAgICAgIHRoaXMuX2luc3RhbGxDaGFydHMoe1xuICAgICAgICAgICAgdXNlckRhdGE6IHVzZXJEYXRhLFxuICAgICAgICAgICAgdGhlbWU6IHRoZW1lLFxuICAgICAgICAgICAgb3B0aW9uczogb3B0aW9ucyxcbiAgICAgICAgICAgIGJhc2VEYXRhOiBiYXNlRGF0YSxcbiAgICAgICAgICAgIGJhc2VBeGVzRGF0YTogYmFzZUF4ZXNEYXRhLFxuICAgICAgICAgICAgYXhlc0RhdGE6IGF4ZXNEYXRhLFxuICAgICAgICAgICAgc2VyaWVzQ2hhcnRUeXBlczogc2VyaWVzQ2hhcnRUeXBlcyxcbiAgICAgICAgICAgIGNoYXJ0VHlwZXM6IGNoYXJ0VHlwZXNcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB5IGF4aXMgY2hhcnQgdHlwZXMuXG4gICAgICogQHBhcmFtIHthcnJheS48c3RyaW5nPn0gY2hhcnRUeXBlcyBjaGFydCB0eXBlc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB5QXhpc09wdGlvbnMgeSBheGlzIG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPHN0cmluZz59IGNoYXJ0IHR5cGVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0WUF4aXNDaGFydFR5cGVzOiBmdW5jdGlvbihjaGFydFR5cGVzLCB5QXhpc09wdGlvbnMpIHtcbiAgICAgICAgdmFyIHJlc3VsdENoYXJ0VHlwZXMgPSBjaGFydFR5cGVzLnNsaWNlKCksXG4gICAgICAgICAgICBpc1JldmVyc2UgPSBmYWxzZSxcbiAgICAgICAgICAgIG9wdGlvbkNoYXJ0VHlwZXM7XG5cbiAgICAgICAgeUF4aXNPcHRpb25zID0geUF4aXNPcHRpb25zID8gW10uY29uY2F0KHlBeGlzT3B0aW9ucykgOiBbXTtcblxuICAgICAgICBpZiAoeUF4aXNPcHRpb25zLmxlbmd0aCA9PT0gMSAmJiAheUF4aXNPcHRpb25zWzBdLmNoYXJ0VHlwZSkge1xuICAgICAgICAgICAgcmVzdWx0Q2hhcnRUeXBlcyA9IFtdO1xuICAgICAgICB9IGVsc2UgaWYgKHlBeGlzT3B0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgICAgIG9wdGlvbkNoYXJ0VHlwZXMgPSBuZS51dGlsLm1hcCh5QXhpc09wdGlvbnMsIGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb24uY2hhcnRUeXBlO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KG9wdGlvbkNoYXJ0VHlwZXMsIGZ1bmN0aW9uKGNoYXJ0VHlwZSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICBpc1JldmVyc2UgPSBpc1JldmVyc2UgfHwgKGNoYXJ0VHlwZSAmJiByZXN1bHRDaGFydFR5cGVzW2luZGV4XSAhPT0gY2hhcnRUeXBlIHx8IGZhbHNlKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAoaXNSZXZlcnNlKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0Q2hhcnRUeXBlcy5yZXZlcnNlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0Q2hhcnRUeXBlcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSB5IGF4aXMgZGF0YS5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuaW5kZXggY2hhcnQgaW5kZXhcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuY29udmVydERhdGEgY29udmVydGVkIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gcGFyYW1zLnNlcmllc0RpbWVuc2lvbiBzZXJpZXMgZGltZW5zaW9uXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBjaGFydFR5cGVzIGNoYXJ0IHR5cGVcbiAgICAgKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gaXNPbmVZQXhpcyB3aGV0aGVyIG9uZSBzZXJpZXMgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gYWRkUGFyYW1zIGFkZCBwYXJhbXNcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSB5IGF4aXMgZGF0YVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VZQXhpc0RhdGE6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgY29udmVydERhdGEgPSBwYXJhbXMuY29udmVydERhdGEsXG4gICAgICAgICAgICBpbmRleCA9IHBhcmFtcy5pbmRleCxcbiAgICAgICAgICAgIGNoYXJ0VHlwZSA9IHBhcmFtcy5jaGFydFR5cGVzW2luZGV4XSxcbiAgICAgICAgICAgIG9wdGlvbnMgPSBwYXJhbXMub3B0aW9ucyxcbiAgICAgICAgICAgIHlBeGlzVmFsdWVzLCB5QXhpc09wdGlvbnMsIHNlcmllc09wdGlvbjtcblxuICAgICAgICBpZiAocGFyYW1zLmlzT25lWUF4aXMpIHtcbiAgICAgICAgICAgIHlBeGlzVmFsdWVzID0gY29udmVydERhdGEuam9pblZhbHVlcztcbiAgICAgICAgICAgIHlBeGlzT3B0aW9ucyA9IFtvcHRpb25zLnlBeGlzXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHlBeGlzVmFsdWVzID0gY29udmVydERhdGEudmFsdWVzW2NoYXJ0VHlwZV07XG4gICAgICAgICAgICB5QXhpc09wdGlvbnMgPSBvcHRpb25zLnlBeGlzIHx8IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgc2VyaWVzT3B0aW9uID0gb3B0aW9ucy5zZXJpZXMgJiYgb3B0aW9ucy5zZXJpZXNbY2hhcnRUeXBlXSB8fCBvcHRpb25zLnNlcmllcztcblxuICAgICAgICByZXR1cm4gYXhpc0RhdGFNYWtlci5tYWtlVmFsdWVBeGlzRGF0YShuZS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICB2YWx1ZXM6IHlBeGlzVmFsdWVzLFxuICAgICAgICAgICAgc3RhY2tlZDogc2VyaWVzT3B0aW9uICYmIHNlcmllc09wdGlvbi5zdGFja2VkIHx8ICcnLFxuICAgICAgICAgICAgb3B0aW9uczogeUF4aXNPcHRpb25zW2luZGV4XSxcbiAgICAgICAgICAgIGNoYXJ0VHlwZTogY2hhcnRUeXBlLFxuICAgICAgICAgICAgc2VyaWVzRGltZW5zaW9uOiBwYXJhbXMuc2VyaWVzRGltZW5zaW9uLFxuICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zOiBjb252ZXJ0RGF0YS5mb3JtYXRGdW5jdGlvbnMsXG4gICAgICAgICAgICBpc1ZlcnRpY2FsOiB0cnVlXG4gICAgICAgIH0sIHBhcmFtcy5hZGRQYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBheGVzIGRhdGEuXG4gICAgICogQHBhcmFtIHt7eUF4aXM6IG9iamVjdCwgeEF4aXM6IG9iamVjdH19IGJhc2VBeGVzRGF0YSBiYXNlIGF4ZXMgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB5QXhpc1BhcmFtcyB5IGF4aXMgcGFyYW1zXG4gICAgICogQHJldHVybnMge29iamVjdH0gYXhlcyBkYXRhXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUF4ZXNEYXRhOiBmdW5jdGlvbihiYXNlQXhlc0RhdGEsIHlBeGlzUGFyYW1zKSB7XG4gICAgICAgIHZhciB5QXhpc0RhdGEgPSBiYXNlQXhlc0RhdGEueUF4aXMsXG4gICAgICAgICAgICBjaGFydFR5cGVzID0geUF4aXNQYXJhbXMuY2hhcnRUeXBlcyxcbiAgICAgICAgICAgIGF4ZXNEYXRhID0ge30sXG4gICAgICAgICAgICB5ckF4aXNEYXRhO1xuICAgICAgICBpZiAoIXlBeGlzUGFyYW1zLmlzT25lWUF4aXMpIHtcbiAgICAgICAgICAgIHlyQXhpc0RhdGEgPSB0aGlzLl9tYWtlWUF4aXNEYXRhKG5lLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICBpbmRleDogMSxcbiAgICAgICAgICAgICAgICBhZGRQYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaXNQb3NpdGlvblJpZ2h0OiB0cnVlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgeUF4aXNQYXJhbXMpKTtcbiAgICAgICAgICAgIGlmICh5QXhpc0RhdGEudGlja0NvdW50IDwgeXJBeGlzRGF0YS50aWNrQ291bnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbmNyZWFzZVlBeGlzU2NhbGVNYXgoeXJBeGlzRGF0YSwgeUF4aXNEYXRhKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoeUF4aXNEYXRhLnRpY2tDb3VudCA+IHlyQXhpc0RhdGEudGlja0NvdW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5jcmVhc2VZQXhpc1NjYWxlTWF4KHlBeGlzRGF0YSwgeXJBeGlzRGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBheGVzRGF0YVtjaGFydFR5cGVzWzBdXSA9IGJhc2VBeGVzRGF0YTtcbiAgICAgICAgYXhlc0RhdGFbY2hhcnRUeXBlc1sxXV0gPSB7XG4gICAgICAgICAgICB5QXhpczogeXJBeGlzRGF0YSB8fCB5QXhpc0RhdGFcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gYXhlc0RhdGE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2Ugb3JkZXIgaW5mbyBhYm91bmQgY2hhcnQgdHlwZS5cbiAgICAgKiBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBjaGFydFR5cGVzIGNoYXJ0IHR5cGVzXG4gICAgICogQHJldHVybnMge29iamVjdH0gY2hhcnQgb3JkZXIgaW5mb1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VDaGFydFR5cGVPcmRlckluZm86IGZ1bmN0aW9uKGNoYXJ0VHlwZXMpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgICAgICBuZS51dGlsLmZvckVhY2hBcnJheShjaGFydFR5cGVzLCBmdW5jdGlvbihjaGFydFR5cGUsIGluZGV4KSB7XG4gICAgICAgICAgICByZXN1bHRbY2hhcnRUeXBlXSA9IGluZGV4O1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBvcHRpb25zIG1hcFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjaGFydFR5cGVzIGNoYXJ0IHR5cGVzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcmRlckluZm8gY2hhcnQgb3JkZXJcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBvcHRpb25zIG1hcFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VPcHRpb25zTWFwOiBmdW5jdGlvbihjaGFydFR5cGVzLCBvcHRpb25zLCBvcmRlckluZm8pIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgICAgICBuZS51dGlsLmZvckVhY2hBcnJheShjaGFydFR5cGVzLCBmdW5jdGlvbihjaGFydFR5cGUpIHtcbiAgICAgICAgICAgIHZhciBjaGFydE9wdGlvbnMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9wdGlvbnMpKSxcbiAgICAgICAgICAgICAgICBpbmRleCA9IG9yZGVySW5mb1tjaGFydFR5cGVdO1xuXG4gICAgICAgICAgICBpZiAoY2hhcnRPcHRpb25zLnlBeGlzICYmIGNoYXJ0T3B0aW9ucy55QXhpc1tpbmRleF0pIHtcbiAgICAgICAgICAgICAgICBjaGFydE9wdGlvbnMueUF4aXMgPSBjaGFydE9wdGlvbnMueUF4aXNbaW5kZXhdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoY2hhcnRPcHRpb25zLnNlcmllcyAmJiBjaGFydE9wdGlvbnMuc2VyaWVzW2NoYXJ0VHlwZV0pIHtcbiAgICAgICAgICAgICAgICBjaGFydE9wdGlvbnMuc2VyaWVzID0gY2hhcnRPcHRpb25zLnNlcmllc1tjaGFydFR5cGVdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoY2hhcnRPcHRpb25zLnRvb2x0aXAgJiYgY2hhcnRPcHRpb25zLnRvb2x0aXBbY2hhcnRUeXBlXSkge1xuICAgICAgICAgICAgICAgIGNoYXJ0T3B0aW9ucy50b29sdGlwID0gY2hhcnRPcHRpb25zLnRvb2x0aXBbY2hhcnRUeXBlXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNoYXJ0T3B0aW9ucy5jaGFydFR5cGUgPSBjaGFydFR5cGU7XG4gICAgICAgICAgICByZXN1bHRbY2hhcnRUeXBlXSA9IGNoYXJ0T3B0aW9ucztcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgdGhlbWUgbWFwXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGNoYXJ0VHlwZXMgY2hhcnQgdHlwZXNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgY2hhcnQgdGhlbWVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gbGVnZW5kTGFiZWxzIGxlZ2VuZCBsYWJlbHNcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSB0aGVtZSBtYXBcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlVGhlbWVNYXA6IGZ1bmN0aW9uKGNoYXJ0VHlwZXMsIHRoZW1lLCBsZWdlbmRMYWJlbHMpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHt9LFxuICAgICAgICAgICAgY29sb3JDb3VudCA9IDA7XG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KGNoYXJ0VHlwZXMsIGZ1bmN0aW9uKGNoYXJ0VHlwZSkge1xuICAgICAgICAgICAgdmFyIGNoYXJ0VGhlbWUgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoZW1lKSksXG4gICAgICAgICAgICAgICAgcmVtb3ZlZENvbG9ycztcblxuICAgICAgICAgICAgaWYgKGNoYXJ0VGhlbWUueUF4aXNbY2hhcnRUeXBlXSkge1xuICAgICAgICAgICAgICAgIGNoYXJ0VGhlbWUueUF4aXMgPSBjaGFydFRoZW1lLnlBeGlzW2NoYXJ0VHlwZV07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFjaGFydFRoZW1lLnlBeGlzLnRpdGxlKSB7XG4gICAgICAgICAgICAgICAgY2hhcnRUaGVtZS55QXhpcyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZGVmYXVsdFRoZW1lLnlBeGlzKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChjaGFydFRoZW1lLnNlcmllc1tjaGFydFR5cGVdKSB7XG4gICAgICAgICAgICAgICAgY2hhcnRUaGVtZS5zZXJpZXMgPSBjaGFydFRoZW1lLnNlcmllc1tjaGFydFR5cGVdO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghY2hhcnRUaGVtZS5zZXJpZXMuY29sb3JzKSB7XG4gICAgICAgICAgICAgICAgY2hhcnRUaGVtZS5zZXJpZXMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGRlZmF1bHRUaGVtZS5zZXJpZXMpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVtb3ZlZENvbG9ycyA9IGNoYXJ0VGhlbWUuc2VyaWVzLmNvbG9ycy5zcGxpY2UoMCwgY29sb3JDb3VudCk7XG4gICAgICAgICAgICAgICAgY2hhcnRUaGVtZS5zZXJpZXMuY29sb3JzID0gY2hhcnRUaGVtZS5zZXJpZXMuY29sb3JzLmNvbmNhdChyZW1vdmVkQ29sb3JzKTtcbiAgICAgICAgICAgICAgICBjb2xvckNvdW50ICs9IGxlZ2VuZExhYmVsc1tjaGFydFR5cGVdLmxlbmd0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdFtjaGFydFR5cGVdID0gY2hhcnRUaGVtZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEluY3JlYXNlIHkgYXhpcyBzY2FsZSBtYXguXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGZyb21EYXRhIGZyb20gdGljayBpbmZvXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRvRGF0YSB0byB0aWNrIGluZm9cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pbmNyZWFzZVlBeGlzU2NhbGVNYXg6IGZ1bmN0aW9uKGZyb21EYXRhLCB0b0RhdGEpIHtcbiAgICAgICAgdmFyIGRpZmYgPSBmcm9tRGF0YS50aWNrQ291bnQgLSB0b0RhdGEudGlja0NvdW50O1xuICAgICAgICB0b0RhdGEuc2NhbGUubWF4ICs9IHRvRGF0YS5zdGVwICogZGlmZjtcbiAgICAgICAgdG9EYXRhLmxhYmVscyA9IGNhbGN1bGF0b3IubWFrZUxhYmVsc0Zyb21TY2FsZSh0b0RhdGEuc2NhbGUsIHRvRGF0YS5zdGVwKTtcbiAgICAgICAgdG9EYXRhLnRpY2tDb3VudCA9IGZyb21EYXRhLnRpY2tDb3VudDtcbiAgICAgICAgdG9EYXRhLnZhbGlkVGlja0NvdW50ID0gZnJvbURhdGEudGlja0NvdW50O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnN0YWxsIGNoYXJ0cy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudXNlckRhdGEgdXNlciBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmJhc2VEYXRhIGNoYXJ0IGJhc2UgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBjaGFydCB0aGVtZVxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5vcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiAgICAgIEBwYXJhbSB7e3lBeGlzOiBvYmplY3QsIHhBeGlzOiBvYmplY3R9fSBwYXJhbXMuYmFzZUF4ZXNEYXRhIGJhc2UgYXhlcyBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmF4ZXNEYXRhIGF4ZXMgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48c3RyaW5nPn0gcGFyYW1zLnNlcmllc0NoYXJ0VHlwZXMgc2VyaWVzIGNoYXJ0IHR5cGVzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBwYXJhbXMuY2hhcnRUeXBlcyBjaGFydCB0eXBlc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2luc3RhbGxDaGFydHM6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgY2hhcnRDbGFzc2VzID0ge1xuICAgICAgICAgICAgICAgIGNvbHVtbjogQ29sdW1uQ2hhcnQsXG4gICAgICAgICAgICAgICAgbGluZTogTGluZUNoYXJ0XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYmFzZURhdGEgPSBwYXJhbXMuYmFzZURhdGEsXG4gICAgICAgICAgICBjb252ZXJ0RGF0YSA9IGJhc2VEYXRhLmNvbnZlcnREYXRhLFxuICAgICAgICAgICAgZm9ybWF0dGVkVmFsdWVzID0gY29udmVydERhdGEuZm9ybWF0dGVkVmFsdWVzLFxuICAgICAgICAgICAgYmFzZUF4ZXNEYXRhID0gcGFyYW1zLmJhc2VBeGVzRGF0YSxcbiAgICAgICAgICAgIGNoYXJ0VHlwZXMgPSBwYXJhbXMuY2hhcnRUeXBlcyxcbiAgICAgICAgICAgIHNlcmllc0NoYXJ0VHlwZXMgPSBwYXJhbXMuc2VyaWVzQ2hhcnRUeXBlcyxcbiAgICAgICAgICAgIG9yZGVySW5mbyA9IHRoaXMuX21ha2VDaGFydFR5cGVPcmRlckluZm8oY2hhcnRUeXBlcyksXG4gICAgICAgICAgICByZW1ha2VPcHRpb25zID0gdGhpcy5fbWFrZU9wdGlvbnNNYXAoY2hhcnRUeXBlcywgcGFyYW1zLm9wdGlvbnMsIG9yZGVySW5mbyksXG4gICAgICAgICAgICByZW1ha2VUaGVtZSA9IHRoaXMuX21ha2VUaGVtZU1hcChzZXJpZXNDaGFydFR5cGVzLCBwYXJhbXMudGhlbWUsIGNvbnZlcnREYXRhLmxlZ2VuZExhYmVscyksXG4gICAgICAgICAgICBwbG90RGF0YSA9IHtcbiAgICAgICAgICAgICAgICB2VGlja0NvdW50OiBiYXNlQXhlc0RhdGEueUF4aXMudmFsaWRUaWNrQ291bnQsXG4gICAgICAgICAgICAgICAgaFRpY2tDb3VudDogYmFzZUF4ZXNEYXRhLnhBeGlzLnZhbGlkVGlja0NvdW50XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgam9pbkxlZ2VuZExhYmVscyA9IGNvbnZlcnREYXRhLmpvaW5MZWdlbmRMYWJlbHM7XG5cbiAgICAgICAgdGhpcy5jaGFydHMgPSBuZS51dGlsLm1hcChzZXJpZXNDaGFydFR5cGVzLCBmdW5jdGlvbihjaGFydFR5cGUpIHtcbiAgICAgICAgICAgIHZhciBsZWdlbmRMYWJlbHMgPSBjb252ZXJ0RGF0YS5sZWdlbmRMYWJlbHNbY2hhcnRUeXBlXSxcbiAgICAgICAgICAgICAgICBheGVzID0gcGFyYW1zLmF4ZXNEYXRhW2NoYXJ0VHlwZV0sXG4gICAgICAgICAgICAgICAgc2VuZE9wdGlvbnMgPSByZW1ha2VPcHRpb25zW2NoYXJ0VHlwZV0sXG4gICAgICAgICAgICAgICAgc2VuZFRoZW1lID0gcmVtYWtlVGhlbWVbY2hhcnRUeXBlXSxcbiAgICAgICAgICAgICAgICBzZW5kQm91bmRzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShiYXNlRGF0YS5ib3VuZHMpKSxcbiAgICAgICAgICAgICAgICBjaGFydDtcblxuICAgICAgICAgICAgaWYgKGF4ZXMgJiYgYXhlcy55QXhpcy5pc1Bvc2l0aW9uUmlnaHQpIHtcbiAgICAgICAgICAgICAgICBzZW5kQm91bmRzLnlBeGlzID0gc2VuZEJvdW5kcy55ckF4aXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjaGFydCA9IG5ldyBjaGFydENsYXNzZXNbY2hhcnRUeXBlXShwYXJhbXMudXNlckRhdGEsIHNlbmRUaGVtZSwgc2VuZE9wdGlvbnMsIHtcbiAgICAgICAgICAgICAgICBjb252ZXJ0RGF0YToge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZXM6IGNvbnZlcnREYXRhLnZhbHVlc1tjaGFydFR5cGVdLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbHM6IGNvbnZlcnREYXRhLmxhYmVscyxcbiAgICAgICAgICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zOiBjb252ZXJ0RGF0YS5mb3JtYXRGdW5jdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlczogZm9ybWF0dGVkVmFsdWVzW2NoYXJ0VHlwZV0sXG4gICAgICAgICAgICAgICAgICAgIGxlZ2VuZExhYmVsczogbGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgICAgICAgICBqb2luTGVnZW5kTGFiZWxzOiBqb2luTGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgICAgICAgICBwbG90RGF0YTogcGxvdERhdGFcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGJvdW5kczogc2VuZEJvdW5kcyxcbiAgICAgICAgICAgICAgICBheGVzOiBheGVzLFxuICAgICAgICAgICAgICAgIHByZWZpeDogY2hhcnRUeXBlICsgJy0nXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHBsb3REYXRhID0gbnVsbDtcbiAgICAgICAgICAgIGpvaW5MZWdlbmRMYWJlbHMgPSBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIGNoYXJ0O1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGNvbWJvIGNoYXJ0LlxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gY29tYm8gY2hhcnQgZWxlbWVudFxuICAgICAqL1xuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBlbCA9IENoYXJ0QmFzZS5wcm90b3R5cGUucmVuZGVyLmNhbGwodGhpcyk7XG4gICAgICAgIHZhciBwYXBlcjtcbiAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkodGhpcy5jaGFydHMsIGZ1bmN0aW9uKGNoYXJ0KSB7XG4gICAgICAgICAgICBjaGFydC5yZW5kZXIoZWwsIHBhcGVyKTtcbiAgICAgICAgICAgIGlmICghcGFwZXIpIHtcbiAgICAgICAgICAgICAgICBwYXBlciA9IGNoYXJ0LmdldFBhcGVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZWw7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29tYm9DaGFydDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBMaW5lIGNoYXJ0XG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBBeGlzVHlwZUJhc2UgPSByZXF1aXJlKCcuL2F4aXNUeXBlQmFzZS5qcycpLFxuICAgIGNhbGN1bGF0b3IgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2NhbGN1bGF0b3IuanMnKSxcbiAgICBheGlzRGF0YU1ha2VyID0gcmVxdWlyZSgnLi4vaGVscGVycy9heGlzRGF0YU1ha2VyLmpzJyksXG4gICAgU2VyaWVzID0gcmVxdWlyZSgnLi4vc2VyaWVzL2xpbmVDaGFydFNlcmllcy5qcycpO1xuXG52YXIgTGluZUNoYXJ0ID0gbmUudXRpbC5kZWZpbmVDbGFzcyhBeGlzVHlwZUJhc2UsIC8qKiBAbGVuZHMgTGluZUNoYXJ0LnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogTGluZSBjaGFydC5cbiAgICAgKiAqIEBjb25zdHJ1Y3RzIExpbmVDaGFydFxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gdXNlckRhdGEgY2hhcnQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBjaGFydCB0aGVtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gaW5pdGVkRGF0YSBpbml0aWFsaXplZCBkYXRhIGZyb20gY29tYm8gY2hhcnRcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbih1c2VyRGF0YSwgdGhlbWUsIG9wdGlvbnMsIGluaXRlZERhdGEpIHtcbiAgICAgICAgdmFyIGJhc2VEYXRhID0gaW5pdGVkRGF0YSB8fCB0aGlzLm1ha2VCYXNlRGF0YSh1c2VyRGF0YSwgdGhlbWUsIG9wdGlvbnMsIHtcbiAgICAgICAgICAgICAgICBpc1ZlcnRpY2FsOiB0cnVlLFxuICAgICAgICAgICAgICAgIGhhc0F4ZXM6IHRydWVcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgY29udmVydERhdGEgPSBiYXNlRGF0YS5jb252ZXJ0RGF0YSxcbiAgICAgICAgICAgIGJvdW5kcyA9IGJhc2VEYXRhLmJvdW5kcyxcbiAgICAgICAgICAgIGF4aXNEYXRhO1xuXG4gICAgICAgIHRoaXMuY2xhc3NOYW1lID0gJ25lLWxpbmUtY2hhcnQnO1xuXG4gICAgICAgIEF4aXNUeXBlQmFzZS5jYWxsKHRoaXMsIGJvdW5kcywgdGhlbWUsIG9wdGlvbnMsIGluaXRlZERhdGEpO1xuXG4gICAgICAgIGF4aXNEYXRhID0gdGhpcy5fbWFrZUF4ZXNEYXRhKGNvbnZlcnREYXRhLCBib3VuZHMsIG9wdGlvbnMsIGluaXRlZERhdGEpO1xuXG4gICAgICAgIHRoaXMuX2FkZENvbXBvbmVudHMoY29udmVydERhdGEsIGF4aXNEYXRhLCBvcHRpb25zKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBheGVzIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udmVydERhdGEgY29udmVydGVkIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYm91bmRzIGNoYXJ0IGJvdW5kc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gaW5pdGVkRGF0YSBpbml0aWFsaXplZCBkYXRhIGZyb20gY29tYm8gY2hhcnRcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBheGVzIGRhdGFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQXhlc0RhdGE6IGZ1bmN0aW9uKGNvbnZlcnREYXRhLCBib3VuZHMsIG9wdGlvbnMsIGluaXRlZERhdGEpIHtcbiAgICAgICAgdmFyIGF4ZXNEYXRhID0ge307XG4gICAgICAgIGlmIChpbml0ZWREYXRhKSB7XG4gICAgICAgICAgICBheGVzRGF0YSA9IGluaXRlZERhdGEuYXhlcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGF4ZXNEYXRhID0ge1xuICAgICAgICAgICAgICAgIHlBeGlzOiBheGlzRGF0YU1ha2VyLm1ha2VWYWx1ZUF4aXNEYXRhKHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzOiBjb252ZXJ0RGF0YS52YWx1ZXMsXG4gICAgICAgICAgICAgICAgICAgIHNlcmllc0RpbWVuc2lvbjogYm91bmRzLnNlcmllcy5kaW1lbnNpb24sXG4gICAgICAgICAgICAgICAgICAgIHN0YWNrZWQ6IG9wdGlvbnMuc2VyaWVzICYmIG9wdGlvbnMuc2VyaWVzLnN0YWNrZWQgfHwgJycsXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0VHlwZTogb3B0aW9ucy5jaGFydFR5cGUsXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdEZ1bmN0aW9uczogY29udmVydERhdGEuZm9ybWF0RnVuY3Rpb25zLFxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zLnhBeGlzLFxuICAgICAgICAgICAgICAgICAgICBpc1ZlcnRpY2FsOiB0cnVlXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgeEF4aXM6IGF4aXNEYXRhTWFrZXIubWFrZUxhYmVsQXhpc0RhdGEoe1xuICAgICAgICAgICAgICAgICAgICBsYWJlbHM6IGNvbnZlcnREYXRhLmxhYmVsc1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBheGVzRGF0YTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIGNvbXBvbmVudHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udmVydERhdGEgY29udmVydGVkIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYXhlc0RhdGEgYXhlcyBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2FkZENvbXBvbmVudHM6IGZ1bmN0aW9uKGNvbnZlcnREYXRhLCBheGVzRGF0YSwgb3B0aW9ucykge1xuICAgICAgICB0aGlzLmFkZEF4aXNDb21wb25lbnRzKHtcbiAgICAgICAgICAgIGNvbnZlcnREYXRhOiBjb252ZXJ0RGF0YSxcbiAgICAgICAgICAgIGF4ZXM6IGF4ZXNEYXRhLFxuICAgICAgICAgICAgcGxvdERhdGE6ICFuZS51dGlsLmlzVW5kZWZpbmVkKGNvbnZlcnREYXRhLnBsb3REYXRhKSA/IGNvbnZlcnREYXRhLnBsb3REYXRhIDoge1xuICAgICAgICAgICAgICAgIHZUaWNrQ291bnQ6IGF4ZXNEYXRhLnlBeGlzLnZhbGlkVGlja0NvdW50LFxuICAgICAgICAgICAgICAgIGhUaWNrQ291bnQ6IGF4ZXNEYXRhLnhBeGlzLnZhbGlkVGlja0NvdW50XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2hhcnRUeXBlOiBvcHRpb25zLmNoYXJ0VHlwZVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmFkZENvbXBvbmVudCgnc2VyaWVzJywgU2VyaWVzLCB7XG4gICAgICAgICAgICBsaWJUeXBlOiBvcHRpb25zLmxpYlR5cGUsXG4gICAgICAgICAgICBjaGFydFR5cGU6IG9wdGlvbnMuY2hhcnRUeXBlLFxuICAgICAgICAgICAgdG9vbHRpcFByZWZpeDogdGhpcy50b29sdGlwUHJlZml4LFxuICAgICAgICAgICAgaXNQb2ludFBvc2l0aW9uOiB0cnVlLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIHZhbHVlczogY2FsY3VsYXRvci5hcnJheVBpdm90KGNvbnZlcnREYXRhLnZhbHVlcyksXG4gICAgICAgICAgICAgICAgZm9ybWF0dGVkVmFsdWVzOiBjYWxjdWxhdG9yLmFycmF5UGl2b3QoY29udmVydERhdGEuZm9ybWF0dGVkVmFsdWVzKSxcbiAgICAgICAgICAgICAgICBzY2FsZTogYXhlc0RhdGEueUF4aXMuc2NhbGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTGluZUNoYXJ0O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFBpZSBjaGFydC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIENoYXJ0QmFzZSA9IHJlcXVpcmUoJy4vY2hhcnRCYXNlLmpzJyksXG4gICAgTGVnZW5kID0gcmVxdWlyZSgnLi4vbGVnZW5kcy9sZWdlbmQuanMnKSxcbiAgICBUb29sdGlwID0gcmVxdWlyZSgnLi4vdG9vbHRpcHMvdG9vbHRpcC5qcycpLFxuICAgIFNlcmllcyA9IHJlcXVpcmUoJy4uL3Nlcmllcy9waWVDaGFydFNlcmllcy5qcycpO1xuXG52YXIgUGllQ2hhcnQgPSBuZS51dGlsLmRlZmluZUNsYXNzKENoYXJ0QmFzZSwgLyoqIEBsZW5kcyBQaWVDaGFydC5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIENvbHVtbiBjaGFydC5cbiAgICAgKiBAY29uc3RydWN0cyBQaWVDaGFydFxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gdXNlckRhdGEgY2hhcnQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBjaGFydCB0aGVtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gaW5pdGVkRGF0YSBpbml0aWFsaXplZCBkYXRhIGZyb20gY29tYm8gY2hhcnRcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbih1c2VyRGF0YSwgdGhlbWUsIG9wdGlvbnMsIGluaXRlZERhdGEpIHtcbiAgICAgICAgdmFyIGJhc2VEYXRhID0gaW5pdGVkRGF0YSB8fCB0aGlzLm1ha2VCYXNlRGF0YSh1c2VyRGF0YSwgdGhlbWUsIG9wdGlvbnMpLFxuICAgICAgICAgICAgY29udmVydERhdGEgPSBiYXNlRGF0YS5jb252ZXJ0RGF0YSxcbiAgICAgICAgICAgIGJvdW5kcyA9IGJhc2VEYXRhLmJvdW5kcztcblxuICAgICAgICB0aGlzLmNsYXNzTmFtZSA9ICduZS1waWUtY2hhcnQnO1xuXG4gICAgICAgIG9wdGlvbnMudG9vbHRpcCA9IG9wdGlvbnMudG9vbHRpcCB8fCB7fTtcblxuICAgICAgICBpZiAoIW9wdGlvbnMudG9vbHRpcC5wb3NpdGlvbikge1xuICAgICAgICAgICAgb3B0aW9ucy50b29sdGlwLnBvc2l0aW9uID0gJ2NlbnRlciBtaWRkbGUnO1xuICAgICAgICB9XG5cbiAgICAgICAgQ2hhcnRCYXNlLmNhbGwodGhpcywgYm91bmRzLCB0aGVtZSwgb3B0aW9ucywgaW5pdGVkRGF0YSk7XG5cbiAgICAgICAgdGhpcy5fYWRkQ29tcG9uZW50cyhjb252ZXJ0RGF0YSwgdGhlbWUuY2hhcnQuYmFja2dyb3VuZCwgb3B0aW9ucyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZCBjb21wb25lbnRzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGNvbnZlcnREYXRhIGNvbnZlcnRlZCBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGNoYXJ0QmFja2dyb3VuZCBjaGFydCDjhaBhY2tncm91bmRcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYWRkQ29tcG9uZW50czogZnVuY3Rpb24oY29udmVydERhdGEsIGNoYXJ0QmFja2dyb3VuZCwgb3B0aW9ucykge1xuICAgICAgICBpZiAoY29udmVydERhdGEuam9pbkxlZ2VuZExhYmVscykge1xuICAgICAgICAgICAgdGhpcy5hZGRDb21wb25lbnQoJ2xlZ2VuZCcsIExlZ2VuZCwge1xuICAgICAgICAgICAgICAgIGpvaW5MZWdlbmRMYWJlbHM6IGNvbnZlcnREYXRhLmpvaW5MZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICAgICAgbGVnZW5kTGFiZWxzOiBjb252ZXJ0RGF0YS5sZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICAgICAgY2hhcnRUeXBlOiBvcHRpb25zLmNoYXJ0VHlwZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmFkZENvbXBvbmVudCgndG9vbHRpcCcsIFRvb2x0aXAsIHtcbiAgICAgICAgICAgIHZhbHVlczogY29udmVydERhdGEuZm9ybWF0dGVkVmFsdWVzLFxuICAgICAgICAgICAgbGFiZWxzOiBjb252ZXJ0RGF0YS5sYWJlbHMsXG4gICAgICAgICAgICBsZWdlbmRMYWJlbHM6IGNvbnZlcnREYXRhLmxlZ2VuZExhYmVscyxcbiAgICAgICAgICAgIHByZWZpeDogdGhpcy50b29sdGlwUHJlZml4XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KCdzZXJpZXMnLCBTZXJpZXMsIHtcbiAgICAgICAgICAgIGxpYlR5cGU6IG9wdGlvbnMubGliVHlwZSxcbiAgICAgICAgICAgIGNoYXJ0VHlwZTogb3B0aW9ucy5jaGFydFR5cGUsXG4gICAgICAgICAgICB0b29sdGlwUHJlZml4OiB0aGlzLnRvb2x0aXBQcmVmaXgsXG4gICAgICAgICAgICBpc1BvaW50UG9zaXRpb246IHRydWUsXG4gICAgICAgICAgICBjaGFydEJhY2tncm91bmQ6IGNoYXJ0QmFja2dyb3VuZCxcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICB2YWx1ZXM6IGNvbnZlcnREYXRhLnZhbHVlcyxcbiAgICAgICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXM6IGNvbnZlcnREYXRhLmZvcm1hdHRlZFZhbHVlc1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBQaWVDaGFydDtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBuZS51dGls7JeQIHJhbmdl6rCAIOy2lOqwgOuQmOq4sCDsoITquYzsp4Ag7J6E7Iuc66GcIOyCrOyaqVxuICogQHBhcmFtIHtudW1iZXJ9IHN0YXJ0IHN0YXJ0XG4gKiBAcGFyYW0ge251bWJlcn0gc3RvcCBzdG9wXG4gKiBAcGFyYW0ge251bWJlcn0gc3RlcCBzdGVwXG4gKiBAcmV0dXJucyB7YXJyYXkuPG51bWJlcj59IHJlc3VsdCBhcnJheVxuICovXG52YXIgcmFuZ2UgPSBmdW5jdGlvbihzdGFydCwgc3RvcCwgc3RlcCkge1xuICAgIHZhciBhcnIgPSBbXSxcbiAgICAgICAgZmxhZztcblxuICAgIGlmIChuZS51dGlsLmlzVW5kZWZpbmVkKHN0b3ApKSB7XG4gICAgICAgIHN0b3AgPSBzdGFydCB8fCAwO1xuICAgICAgICBzdGFydCA9IDA7XG4gICAgfVxuXG4gICAgc3RlcCA9IHN0ZXAgfHwgMTtcbiAgICBmbGFnID0gc3RlcCA8IDAgPyAtMSA6IDE7XG4gICAgc3RvcCAqPSBmbGFnO1xuXG4gICAgd2hpbGUgKHN0YXJ0ICogZmxhZyA8IHN0b3ApIHtcbiAgICAgICAgYXJyLnB1c2goc3RhcnQpO1xuICAgICAgICBzdGFydCArPSBzdGVwO1xuICAgIH1cblxuICAgIHJldHVybiBhcnI7XG59O1xuXG4vKipcbiAqICogbmUudXRpbOyXkCBwbHVja+ydtCDstpTqsIDrkJjquLAg7KCE6rmM7KeAIOyehOyLnOuhnCDsgqzsmqlcbiAqIEBwYXJhbSB7YXJyYXl9IGFyciBhcnJheVxuICogQHBhcmFtIHtzdHJpbmd9IHByb3BlcnR5IHByb3BlcnR5XG4gKiBAcmV0dXJucyB7YXJyYXl9IHJlc3VsdCBhcnJheVxuICovXG52YXIgcGx1Y2sgPSBmdW5jdGlvbihhcnIsIHByb3BlcnR5KSB7XG4gICAgdmFyIHJlc3VsdCA9IG5lLnV0aWwubWFwKGFyciwgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICByZXR1cm4gaXRlbVtwcm9wZXJ0eV07XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogKiBuZS51dGls7JeQIHppcOydtCDstpTqsIDrkJjquLAg7KCE6rmM7KeAIOyehOyLnOuhnCDsgqzsmqlcbiAqIEBwYXJhbXMgey4uLmFycmF5fSBhcnJheVxuICogQHJldHVybnMge2FycmF5fSByZXN1bHQgYXJyYXlcbiAqL1xudmFyIHppcCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcnIyID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSxcbiAgICAgICAgcmVzdWx0ID0gW107XG5cbiAgICBuZS51dGlsLmZvckVhY2goYXJyMiwgZnVuY3Rpb24oYXJyKSB7XG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaChhcnIsIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgICAgaWYgKCFyZXN1bHRbaW5kZXhdKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W2luZGV4XSA9IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0W2luZGV4XS5wdXNoKHZhbHVlKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBQaWNrIG1pbmltdW0gdmFsdWUgZnJvbSB2YWx1ZSBhcnJheS5cbiAqIEBwYXJhbSB7YXJyYXl9IGFyciB2YWx1ZSBhcnJheVxuICogQHBhcmFtIHtmdW5jdGlvbn0gY29uZGl0aW9uIGNvbmRpdGlvbiBmdW5jdGlvblxuICogQHBhcmFtIHtvYmplY3R9IGNvbnRleHQgdGFyZ2V0IGNvbnRleHRcbiAqIEByZXR1cm5zIHsqfSBtaW5pbXVtIHZhbHVlXG4gKi9cbnZhciBtaW4gPSBmdW5jdGlvbihhcnIsIGNvbmRpdGlvbiwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHQsIG1pblZhbHVlLCByZXN0O1xuICAgIGlmICghY29uZGl0aW9uKSB7XG4gICAgICAgIGNvbmRpdGlvbiA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICB9O1xuICAgIH1cbiAgICByZXN1bHQgPSBhcnJbMF07XG4gICAgbWluVmFsdWUgPSBjb25kaXRpb24uY2FsbChjb250ZXh0LCByZXN1bHQpO1xuICAgIHJlc3QgPSBhcnIuc2xpY2UoMSk7XG4gICAgbmUudXRpbC5mb3JFYWNoQXJyYXkocmVzdCwgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICB2YXIgY29tcGFyZVZhbHVlID0gY29uZGl0aW9uLmNhbGwoY29udGV4dCwgaXRlbSk7XG4gICAgICAgIGlmIChjb21wYXJlVmFsdWUgPCBtaW5WYWx1ZSkge1xuICAgICAgICAgICAgbWluVmFsdWUgPSBjb21wYXJlVmFsdWU7XG4gICAgICAgICAgICByZXN1bHQgPSBpdGVtO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogUGljayBtYXhpbXVtIHZhbHVlIGZyb20gdmFsdWUgYXJyYXkuXG4gKiBAcGFyYW0ge2FycmF5fSBhcnIgdmFsdWUgYXJyYXlcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNvbmRpdGlvbiBjb25kaXRpb24gZnVuY3Rpb25cbiAqIEBwYXJhbSB7b2JqZWN0fSBjb250ZXh0IHRhcmdldCBjb250ZXh0XG4gKiBAcmV0dXJucyB7Kn0gbWF4aW11bSB2YWx1ZVxuICovXG52YXIgbWF4ID0gZnVuY3Rpb24oYXJyLCBjb25kaXRpb24sIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0LCBtYXhWYWx1ZSwgcmVzdDtcbiAgICBpZiAoIWNvbmRpdGlvbikge1xuICAgICAgICBjb25kaXRpb24gPSBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgcmVzdWx0ID0gYXJyWzBdO1xuICAgIG1heFZhbHVlID0gY29uZGl0aW9uLmNhbGwoY29udGV4dCwgcmVzdWx0KTtcbiAgICByZXN0ID0gYXJyLnNsaWNlKDEpO1xuICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KHJlc3QsIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgdmFyIGNvbXBhcmVWYWx1ZSA9IGNvbmRpdGlvbi5jYWxsKGNvbnRleHQsIGl0ZW0pO1xuICAgICAgICBpZiAoY29tcGFyZVZhbHVlID4gbWF4VmFsdWUpIHtcbiAgICAgICAgICAgIG1heFZhbHVlID0gY29tcGFyZVZhbHVlO1xuICAgICAgICAgICAgcmVzdWx0ID0gaXRlbTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIFdoZXRoZXIgb25lIG9mIHRoZW0gaXMgdHJ1ZSBvciBub3QuXG4gKiBAcGFyYW0ge2FycmF5fSBhcnIgdGFyZ2V0IGFycmF5XG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjb25kaXRpb24gY29uZGl0aW9uIGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gcmVzdWx0IGJvb2xlYW5cbiAqL1xudmFyIGFueSA9IGZ1bmN0aW9uKGFyciwgY29uZGl0aW9uKSB7XG4gICAgdmFyIHJlc3VsdCA9IGZhbHNlO1xuICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KGFyciwgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICBpZiAoY29uZGl0aW9uKGl0ZW0pKSB7XG4gICAgICAgICAgICByZXN1bHQgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogR2V0IGFmdGVyIHBvaW50IGxlbmd0aC5cbiAqIEBwYXJhbSB7c3RyaW5nIHwgbnVtYmVyfSB2YWx1ZSB0YXJnZXQgdmFsdWVcbiAqIEByZXR1cm5zIHtudW1iZXJ9IHJlc3VsdCBsZW5ndGhcbiAqL1xudmFyIGxlbmd0aEFmdGVyUG9pbnQgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHZhciB2YWx1ZUFyciA9ICh2YWx1ZSArICcnKS5zcGxpdCgnLicpO1xuICAgIHJldHVybiB2YWx1ZUFyci5sZW5ndGggPT09IDIgPyB2YWx1ZUFyclsxXS5sZW5ndGggOiAwO1xufTtcblxuLyoqXG4gKiBGaW5kIG11bHRpcGxlIG51bS5cbiAqIEBwYXJhbSB7Li4uYXJyYXl9IHRhcmdldCB2YWx1ZXNcbiAqIEByZXR1cm5zIHtudW1iZXJ9IG11bHRpcGxlIG51bVxuICovXG52YXIgZmluZE11bHRpcGxlTnVtID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cyksXG4gICAgICAgIHVuZGVyUG9pbnRMZW5zID0gbmUudXRpbC5tYXAoYXJncywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiBuZS51dGlsLmxlbmd0aEFmdGVyUG9pbnQodmFsdWUpO1xuICAgICAgICB9KSxcbiAgICAgICAgdW5kZXJQb2ludExlbiA9IG5lLnV0aWwubWF4KHVuZGVyUG9pbnRMZW5zKSxcbiAgICAgICAgbXVsdGlwbGVOdW0gPSBNYXRoLnBvdygxMCwgdW5kZXJQb2ludExlbik7XG4gICAgcmV0dXJuIG11bHRpcGxlTnVtO1xufTtcblxuLyoqXG4gKiBNb2R1bG8gb3BlcmF0aW9uIGZvciBmbG9hdGluZyBwb2ludCBvcGVyYXRpb24uXG4gKiBAcGFyYW0ge251bWJlcn0gdGFyZ2V0IHRhcmdldCB2YWx1ZXNcbiAqIEBwYXJhbSB7bnVtYmVyfSBtb2ROdW0gbW9kIG51bVxuICogQHJldHVybnMge251bWJlcn0gcmVzdWx0IG1vZFxuICovXG52YXIgbW9kID0gZnVuY3Rpb24odGFyZ2V0LCBtb2ROdW0pIHtcbiAgICB2YXIgbXVsdGlwbGVOdW0gPSBuZS51dGlsLmZpbmRNdWx0aXBsZU51bShtb2ROdW0pO1xuICAgIHJldHVybiAoKHRhcmdldCAqIG11bHRpcGxlTnVtKSAlIChtb2ROdW0gKiBtdWx0aXBsZU51bSkpIC8gbXVsdGlwbGVOdW07XG59O1xuXG4vKipcbiAqIEFkZGl0aW9uIGZvciBmbG9hdGluZyBwb2ludCBvcGVyYXRpb24uXG4gKiBAcGFyYW0ge251bWJlcn0gYSB0YXJnZXQgYVxuICogQHBhcmFtIHtudW1iZXJ9IGIgdGFyZ2V0IGJcbiAqIEByZXR1cm5zIHtudW1iZXJ9IGFkZGl0aW9uIHJlc3VsdFxuICovXG52YXIgYWRkaXRpb24gPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgdmFyIG11bHRpcGxlTnVtID0gZmluZE11bHRpcGxlTnVtKGEsIGIpO1xuICAgIHJldHVybiAoKGEgKiBtdWx0aXBsZU51bSkgKyAoYiAqIG11bHRpcGxlTnVtKSkgLyBtdWx0aXBsZU51bTtcbn07XG5cbi8qKlxuICogU3VidHJhY3Rpb24gZm9yIGZsb2F0aW5nIHBvaW50IG9wZXJhdGlvbi5cbiAqIEBwYXJhbSB7bnVtYmVyfSBhIHRhcmdldCBhXG4gKiBAcGFyYW0ge251bWJlcn0gYiB0YXJnZXQgYlxuICogQHJldHVybnMge251bWJlcn0gc3VidHJhY3Rpb24gcmVzdWx0XG4gKi9cbnZhciBzdWJ0cmFjdGlvbiA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICB2YXIgbXVsdGlwbGVOdW0gPSBmaW5kTXVsdGlwbGVOdW0oYSwgYik7XG4gICAgcmV0dXJuICgoYSAqIG11bHRpcGxlTnVtKSAtIChiICogbXVsdGlwbGVOdW0pKSAvIG11bHRpcGxlTnVtO1xufTtcblxuLyoqXG4gKiBNdWx0aXBsaWNhdGlvbiBmb3IgZmxvYXRpbmcgcG9pbnQgb3BlcmF0aW9uLlxuICogQHBhcmFtIHtudW1iZXJ9IGEgdGFyZ2V0IGFcbiAqIEBwYXJhbSB7bnVtYmVyfSBiIHRhcmdldCBiXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBtdWx0aXBsaWNhdGlvbiByZXN1bHRcbiAqL1xudmFyIG11bHRpcGxpY2F0aW9uID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHZhciBtdWx0aXBsZU51bSA9IGZpbmRNdWx0aXBsZU51bShhLCBiKTtcbiAgICByZXR1cm4gKChhICogbXVsdGlwbGVOdW0pICogKGIgKiBtdWx0aXBsZU51bSkpIC8gKG11bHRpcGxlTnVtICogbXVsdGlwbGVOdW0pO1xufTtcblxuLyoqXG4gKiBEaXZpc2lvbiBmb3IgZmxvYXRpbmcgcG9pbnQgb3BlcmF0aW9uLlxuICogQHBhcmFtIHtudW1iZXJ9IGEgdGFyZ2V0IGFcbiAqIEBwYXJhbSB7bnVtYmVyfSBiIHRhcmdldCBiXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBkaXZpc2lvbiByZXN1bHRcbiAqL1xudmFyIGRpdmlzaW9uID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHZhciBtdWx0aXBsZU51bSA9IGZpbmRNdWx0aXBsZU51bShhLCBiKTtcbiAgICByZXR1cm4gKGEgKiBtdWx0aXBsZU51bSkgLyAoYiAqIG11bHRpcGxlTnVtKTtcbn07XG5cbi8qKlxuICogU3VtLlxuICogQHBhcmFtIHthcnJheS48bnVtYmVyPn0gdmFsdWVzIHRhcmdldCB2YWx1ZXNcbiAqIEByZXR1cm5zIHtudW1iZXJ9IHJlc3VsdCB2YWx1ZVxuICovXG52YXIgc3VtID0gZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgdmFyIGNvcHlBcnIgPSB2YWx1ZXMuc2xpY2UoKTtcbiAgICBjb3B5QXJyLnVuc2hpZnQoMCk7XG4gICAgcmV0dXJuIG5lLnV0aWwucmVkdWNlKGNvcHlBcnIsIGZ1bmN0aW9uKGJhc2UsIGFkZCkge1xuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChiYXNlKSArIHBhcnNlRmxvYXQoYWRkKTtcbiAgICB9KTtcbn07XG5cbm5lLnV0aWwucmFuZ2UgPSByYW5nZTtcbm5lLnV0aWwucGx1Y2sgPSBwbHVjaztcbm5lLnV0aWwuemlwID0gemlwO1xubmUudXRpbC5taW4gPSBtaW47XG5uZS51dGlsLm1heCA9IG1heDtcbm5lLnV0aWwuYW55ID0gYW55O1xubmUudXRpbC5sZW5ndGhBZnRlclBvaW50ID0gbGVuZ3RoQWZ0ZXJQb2ludDtcbm5lLnV0aWwubW9kID0gbW9kO1xubmUudXRpbC5maW5kTXVsdGlwbGVOdW0gPSBmaW5kTXVsdGlwbGVOdW07XG5uZS51dGlsLmFkZGl0aW9uID0gYWRkaXRpb247XG5uZS51dGlsLnN1YnRyYWN0aW9uID0gc3VidHJhY3Rpb247XG5uZS51dGlsLm11bHRpcGxpY2F0aW9uID0gbXVsdGlwbGljYXRpb247XG5uZS51dGlsLmRpdmlzaW9uID0gZGl2aXNpb247XG5uZS51dGlsLnN1bSA9IHN1bTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBjaGFydCBjb25zdFxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgQ0hBUlRfREVGQVVMVF9XSURUSDogNTAwLFxuICAgIENIQVJUX0RFRkFVTFRfSEVJR0hUOiA0MDAsXG4gICAgSElEREVOX1dJRFRIOiAxLFxuICAgIERFRkFVTFRfVElUTEVfRk9OVF9TSVpFOiAxNCxcbiAgICBERUZBVUxUX0FYSVNfVElUTEVfRk9OVF9TSVpFOiAxMCxcbiAgICBERUZBVUxUX0xBQkVMX0ZPTlRfU0laRTogMTIsXG4gICAgREVGQVVMVF9QTFVHSU46ICdyYXBoYWVsJyxcbiAgICBERUZBVUxUX1RJQ0tfQ09MT1I6ICdibGFjaycsXG4gICAgREVGQVVMVF9USEVNRV9OQU1FOiAnZGVmYXVsdCcsXG4gICAgU1RBQ0tFRF9OT1JNQUxfVFlQRTogJ25vcm1hbCcsXG4gICAgU1RBQ0tFRF9QRVJDRU5UX1RZUEU6ICdwZXJjZW50JyxcbiAgICBDSEFSVF9UWVBFX0JBUjogJ2JhcicsXG4gICAgQ0hBUlRfVFlQRV9DT0xVTU46ICdjb2x1bW4nLFxuICAgIENIQVJUX1RZUEVfTElORTogJ2xpbmUnLFxuICAgIENIQVJUX1RZUEVfQ09NQk86ICdjb21ibycsXG4gICAgQ0hBUlRfVFlQRV9QSUU6ICdwaWUnLFxuICAgIFlBWElTX1BST1BTOiBbJ3RpY2tDb2xvcicsICd0aXRsZScsICdsYWJlbCddLFxuICAgIFNFUklFU19QUk9QUzogWydjb2xvcnMnLCAnYm9yZGVyQ29sb3InLCAnc2luZ2xlQ29sb3JzJ11cbn07XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgIENoYXJ0IGZhY3RvcnkgcGxheSByb2xlIHJlZ2lzdGVyIGNoYXJ0LlxuICogICAgICAgICAgICAgICAgQWxzbywgeW91IGNhbiBnZXQgY2hhcnQgZnJvbSB0aGlzIGZhY3RvcnkuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBjaGFydHMgPSB7fSxcbiAgICBmYWN0b3J5ID0ge1xuICAgICAgICAvKipcbiAgICAgICAgICogR2V0IGNoYXJ0IGluc3RhbmNlLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY2hhcnRUeXBlIGNoYXJ0IHR5cGVcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGRhdGEgY2hhcnQgZGF0YVxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICAgICAqIEByZXR1cm5zIHtvYmplY3R9IGNoYXJ0IGluc3RhbmNlO1xuICAgICAgICAgKi9cbiAgICAgICAgZ2V0OiBmdW5jdGlvbihjaGFydFR5cGUsIGRhdGEsIHRoZW1lLCBvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgQ2hhcnQgPSBjaGFydHNbY2hhcnRUeXBlXSxcbiAgICAgICAgICAgICAgICBjaGFydDtcblxuICAgICAgICAgICAgaWYgKCFDaGFydCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGV4aXN0ICcgKyBjaGFydFR5cGUgKyAnIGNoYXJ0LicpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjaGFydCA9IG5ldyBDaGFydChkYXRhLCB0aGVtZSwgb3B0aW9ucyk7XG5cbiAgICAgICAgICAgIHJldHVybiBjaGFydDtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVnaXN0ZXIgY2hhcnQuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjaGFydFR5cGUgY2hhciB0eXBlXG4gICAgICAgICAqIEBwYXJhbSB7Y2xhc3N9IENoYXJ0Q2xhc3MgY2hhcnQgY2xhc3NcbiAgICAgICAgICovXG4gICAgICAgIHJlZ2lzdGVyOiBmdW5jdGlvbihjaGFydFR5cGUsIENoYXJ0Q2xhc3MpIHtcbiAgICAgICAgICAgIGNoYXJ0c1tjaGFydFR5cGVdID0gQ2hhcnRDbGFzcztcbiAgICAgICAgfVxuICAgIH07XG5cbm1vZHVsZS5leHBvcnRzID0gZmFjdG9yeTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyAgUGx1Z2luIGZhY3RvcnkgcGxheSByb2xlIHJlZ2lzdGVyIHJlbmRlcmluZyBwbHVnaW4uXG4gKiAgICAgICAgICAgICAgICBBbHNvLCB5b3UgY2FuIGdldCBwbHVnaW4gZnJvbSB0aGlzIGZhY3RvcnkuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBwbHVnaW5zID0ge30sXG4gICAgZmFjdG9yeSA9IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdldCBncmFwaCByZW5kZXJlci5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGxpYlR5cGUgdHlwZSBvZiBncmFwaCBsaWJyYXJ5XG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjaGFydFR5cGUgY2hhcnQgdHlwZVxuICAgICAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSByZW5kZXJlciBpbnN0YW5jZVxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0OiBmdW5jdGlvbihsaWJUeXBlLCBjaGFydFR5cGUpIHtcbiAgICAgICAgICAgIHZhciBwbHVnaW4gPSBwbHVnaW5zW2xpYlR5cGVdLFxuICAgICAgICAgICAgICAgIFJlbmRlcmVyLCByZW5kZXJlcjtcblxuICAgICAgICAgICAgaWYgKCFwbHVnaW4pIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBleGlzdCAnICsgbGliVHlwZSArICcgcGx1Z2luLicpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBSZW5kZXJlciA9IHBsdWdpbltjaGFydFR5cGVdO1xuICAgICAgICAgICAgaWYgKCFSZW5kZXJlcikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGV4aXN0ICcgKyBjaGFydFR5cGUgKyAnIGNoYXJ0IHJlbmRlcmVyLicpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZW5kZXJlciA9IG5ldyBSZW5kZXJlcigpO1xuXG4gICAgICAgICAgICByZXR1cm4gcmVuZGVyZXI7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQbHVnaW4gcmVnaXN0ZXIuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBsaWJUeXBlIHR5cGUgb2YgZ3JhcGggbGlicmFyeVxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcGx1Z2luIHBsdWdpbiB0byBjb250cm9sIGxpYnJhcnlcbiAgICAgICAgICovXG4gICAgICAgIHJlZ2lzdGVyOiBmdW5jdGlvbihsaWJUeXBlLCBwbHVnaW4pIHtcbiAgICAgICAgICAgIHBsdWdpbnNbbGliVHlwZV0gPSBwbHVnaW47XG4gICAgICAgIH1cbiAgICB9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnk7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgIFRoZW1lIGZhY3RvcnkgcGxheSByb2xlIHJlZ2lzdGVyIHRoZW1lLlxuICogICAgICAgICAgICAgICAgQWxzbywgeW91IGNhbiBnZXQgdGhlbWUgZnJvbSB0aGlzIGZhY3RvcnkuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBjaGFydENvbnN0ID0gcmVxdWlyZSgnLi4vY29uc3QuanMnKSxcbiAgICBkZWZhdWx0VGhlbWUgPSByZXF1aXJlKCcuLi90aGVtZXMvZGVmYXVsdFRoZW1lLmpzJyk7XG5cbnZhciB0aGVtZXMgPSB7fTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgLyoqXG4gICAgICogR2V0IHRoZW1lLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0aGVtZU5hbWUgdGhlbWUgbmFtZVxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHRoZW1lIG9iamVjdFxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24odGhlbWVOYW1lKSB7XG4gICAgICAgIHZhciB0aGVtZSA9IHRoZW1lc1t0aGVtZU5hbWVdO1xuXG4gICAgICAgIGlmICghdGhlbWUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGV4aXN0ICcgKyB0aGVtZU5hbWUgKyAnIHRoZW1lLicpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoZW1lO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUaGVtZSByZWdpc3Rlci5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGhlbWVOYW1lIHRoZW1lIG5hbWVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgdGhlbWVcbiAgICAgKi9cbiAgICByZWdpc3RlcjogZnVuY3Rpb24odGhlbWVOYW1lLCB0aGVtZSkge1xuICAgICAgICB0aGVtZSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhlbWUpKTtcbiAgICAgICAgaWYgKHRoZW1lTmFtZSAhPT0gY2hhcnRDb25zdC5ERUZBVUxUX1RIRU1FX05BTUUpIHtcbiAgICAgICAgICAgIHRoZW1lID0gdGhpcy5faW5pdFRoZW1lKHRoZW1lKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9pbmhlcml0VGhlbWVQcm9wZXJ0eSh0aGVtZSk7XG4gICAgICAgIHRoZW1lc1t0aGVtZU5hbWVdID0gdGhlbWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEluaXQgdGhlbWUuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIHRoZW1lXG4gICAgICogQHJldHVybnMge29iamVjdH0gdGhlbWVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBpZ25vcmVcbiAgICAgKi9cbiAgICBfaW5pdFRoZW1lOiBmdW5jdGlvbih0aGVtZSkge1xuICAgICAgICB2YXIgY2xvbmVUaGVtZSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZGVmYXVsdFRoZW1lKSksXG4gICAgICAgICAgICBuZXdUaGVtZTtcblxuICAgICAgICB0aGlzLl9jb25jYXREZWZhdWx0Q29sb3JzKHRoZW1lLCBjbG9uZVRoZW1lLnNlcmllcy5jb2xvcnMpXG4gICAgICAgIG5ld1RoZW1lID0gdGhpcy5fZXh0ZW5kVGhlbWUodGhlbWUsIGNsb25lVGhlbWUpO1xuXG4gICAgICAgIG5ld1RoZW1lID0gdGhpcy5fY29weVByb3BlcnR5KHtcbiAgICAgICAgICAgIHByb3BOYW1lOiAneUF4aXMnLFxuICAgICAgICAgICAgZnJvbVRoZW1lOiB0aGVtZSxcbiAgICAgICAgICAgIHRvVGhlbWU6IG5ld1RoZW1lLFxuICAgICAgICAgICAgcmVqZWN0UHJvcHM6IGNoYXJ0Q29uc3QuWUFYSVNfUFJPUFNcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbmV3VGhlbWUgPSB0aGlzLl9jb3B5UHJvcGVydHkoe1xuICAgICAgICAgICAgcHJvcE5hbWU6ICdzZXJpZXMnLFxuICAgICAgICAgICAgZnJvbVRoZW1lOiB0aGVtZSxcbiAgICAgICAgICAgIHRvVGhlbWU6IG5ld1RoZW1lLFxuICAgICAgICAgICAgcmVqZWN0UHJvcHM6IGNoYXJ0Q29uc3QuU0VSSUVTX1BST1BTXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gbmV3VGhlbWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZpbHRlciBjaGFydCB0eXBlcy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGFyZ2V0IHRhcmdldCBjaGFydHNcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSByZWplY3RQcm9wcyByZWplY3QgcHJvcGVydHlcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBmaWx0ZXJlZCBjaGFydHMuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZmlsdGVyQ2hhcnRUeXBlczogZnVuY3Rpb24odGFyZ2V0LCByZWplY3RQcm9wcykge1xuICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICBpZiAoIXRhcmdldCkge1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVzdWx0ID0gbmUudXRpbC5maWx0ZXIodGFyZ2V0LCBmdW5jdGlvbihpdGVtLCBuYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gbmUudXRpbC5pbkFycmF5KG5hbWUsIHJlamVjdFByb3BzKSA9PT0gLTE7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDb25jYXQgY29sb3JzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSB0aGVtZVxuICAgICAqIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IHNlcmllc0NvbG9ycyBzZXJpZXMgY29sb3JzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY29uY2F0Q29sb3JzOiBmdW5jdGlvbih0aGVtZSwgc2VyaWVzQ29sb3JzKSB7XG4gICAgICAgIGlmICh0aGVtZS5jb2xvcnMpIHtcbiAgICAgICAgICAgIHRoZW1lLmNvbG9ycyA9IHRoZW1lLmNvbG9ycy5jb25jYXQoc2VyaWVzQ29sb3JzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGVtZS5zaW5nbGVDb2xvcnMpIHtcbiAgICAgICAgICAgIHRoZW1lLnNpbmdsZUNvbG9ycyA9IHRoZW1lLnNpbmdsZUNvbG9ycy5jb25jYXQoc2VyaWVzQ29sb3JzKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDb25jYXQgZGVmYXVsdCBjb2xvcnMuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIHRoZW1lXG4gICAgICogQHBhcmFtIHthcnJheS48c3RyaW5nPn0gc2VyaWVzQ29sb3JzIHNlcmllcyBjb2xvcnNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jb25jYXREZWZhdWx0Q29sb3JzOiBmdW5jdGlvbih0aGVtZSwgc2VyaWVzQ29sb3JzKSB7XG4gICAgICAgIHZhciBjaGFydFR5cGVzO1xuXG4gICAgICAgIGlmICghdGhlbWUuc2VyaWVzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjaGFydFR5cGVzID0gdGhpcy5fZmlsdGVyQ2hhcnRUeXBlcyh0aGVtZS5zZXJpZXMsIGNoYXJ0Q29uc3QuU0VSSUVTX1BST1BTKTtcblxuICAgICAgICBpZiAoIW5lLnV0aWwua2V5cyhjaGFydFR5cGVzKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMuX2NvbmNhdENvbG9ycyh0aGVtZS5zZXJpZXMsIHNlcmllc0NvbG9ycyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZS51dGlsLmZvckVhY2goY2hhcnRUeXBlcywgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NvbmNhdENvbG9ycyhpdGVtLCBzZXJpZXNDb2xvcnMpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXh0ZW5kIHRoZW1lXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGZyb20gZnJvbSB0aGVtZSBwcm9wZXJ0eVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0byB0byB0aGVtZSBwcm9wZXJ0eVxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHJlc3VsdCBwcm9wZXJ0eVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2V4dGVuZFRoZW1lOiBmdW5jdGlvbihmcm9tLCB0bykge1xuICAgICAgICBuZS51dGlsLmZvckVhY2godG8sIGZ1bmN0aW9uKGl0ZW0sIGtleSkge1xuICAgICAgICAgICAgdmFyIGZyb21JdGVtID0gZnJvbVtrZXldO1xuICAgICAgICAgICAgaWYgKCFmcm9tSXRlbSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG5lLnV0aWwuaXNBcnJheShmcm9tSXRlbSkpIHtcbiAgICAgICAgICAgICAgICB0b1trZXldID0gZnJvbUl0ZW0uc2xpY2UoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobmUudXRpbC5pc09iamVjdChmcm9tSXRlbSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9leHRlbmRUaGVtZShmcm9tSXRlbSwgaXRlbSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRvW2tleV0gPSBmcm9tSXRlbTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgcmV0dXJuIHRvO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDb3B5IHByb3BlcnR5LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5wcm9wTmFtZSBwcm9wZXJ0eSBuYW1lXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmZyb21UaGVtZSBmcm9tIHByb3BlcnR5XG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRvVGhlbWUgdHAgcHJvcGVydHlcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IHBhcmFtcy5yZWplY3RQcm9wcyByZWplY3QgcHJvcGVydHkgbmFtZVxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IGNvcGllZCBwcm9wZXJ0eVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NvcHlQcm9wZXJ0eTogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBjaGFydFR5cGVzO1xuXG4gICAgICAgIGlmICghcGFyYW1zLnRvVGhlbWVbcGFyYW1zLnByb3BOYW1lXSkge1xuICAgICAgICAgICAgcmV0dXJuIHBhcmFtcy50b1RoZW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgY2hhcnRUeXBlcyA9IHRoaXMuX2ZpbHRlckNoYXJ0VHlwZXMocGFyYW1zLmZyb21UaGVtZVtwYXJhbXMucHJvcE5hbWVdLCBwYXJhbXMucmVqZWN0UHJvcHMpO1xuICAgICAgICBpZiAobmUudXRpbC5rZXlzKGNoYXJ0VHlwZXMpLmxlbmd0aCkge1xuICAgICAgICAgICAgbmUudXRpbC5mb3JFYWNoKGNoYXJ0VHlwZXMsIGZ1bmN0aW9uKGl0ZW0sIGtleSkge1xuICAgICAgICAgICAgICAgIHZhciBjbG9uZVRoZW1lID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShkZWZhdWx0VGhlbWVbcGFyYW1zLnByb3BOYW1lXSkpO1xuICAgICAgICAgICAgICAgIHBhcmFtcy5mcm9tVGhlbWVbcGFyYW1zLnByb3BOYW1lXVtrZXldID0gdGhpcy5fZXh0ZW5kVGhlbWUoaXRlbSwgY2xvbmVUaGVtZSk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICAgICAgcGFyYW1zLnRvVGhlbWVbcGFyYW1zLnByb3BOYW1lXSA9IHBhcmFtcy5mcm9tVGhlbWVbcGFyYW1zLnByb3BOYW1lXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXJhbXMudG9UaGVtZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29weSBjb2xvciBpbmZvIHRvIGxlZ2VuZFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBzZXJpZXNUaGVtZSBzZXJpZXMgdGhlbWVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gbGVnZW5kVGhlbWUgbGVnZW5kIHRoZW1lXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY29weUNvbG9ySW5mb1RvTGVnZW5kOiBmdW5jdGlvbihzZXJpZXNUaGVtZSwgbGVnZW5kVGhlbWUpIHtcbiAgICAgICAgaWYgKHNlcmllc1RoZW1lLnNpbmdsZUNvbG9ycykge1xuICAgICAgICAgICAgbGVnZW5kVGhlbWUuc2luZ2xlQ29sb3JzID0gc2VyaWVzVGhlbWUuc2luZ2xlQ29sb3JzO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzZXJpZXNUaGVtZS5ib3JkZXJDb2xvcikge1xuICAgICAgICAgICAgbGVnZW5kVGhlbWUuYm9yZGVyQ29sb3IgPSBzZXJpZXNUaGVtZS5ib3JkZXJDb2xvcjtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBpbmhlcml0IHRoZW1lIHByb3BlcnR5LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSB0aGVtZVxuICAgICAqIEBwcml2YXRlXG4gICAgICogQGlnbm9yZVxuICAgICAqL1xuICAgIF9pbmhlcml0VGhlbWVQcm9wZXJ0eTogZnVuY3Rpb24odGhlbWUpIHtcbiAgICAgICAgdmFyIGJhc2VGb250ID0gdGhlbWUuY2hhcnQuZm9udEZhbWlseSxcbiAgICAgICAgICAgIGl0ZW1zID0gW1xuICAgICAgICAgICAgICAgIHRoZW1lLnRpdGxlLFxuICAgICAgICAgICAgICAgIHRoZW1lLnhBeGlzLnRpdGxlLFxuICAgICAgICAgICAgICAgIHRoZW1lLnhBeGlzLmxhYmVsLFxuICAgICAgICAgICAgICAgIHRoZW1lLmxlZ2VuZC5sYWJlbFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIHlBeGlzQ2hhcnRUeXBlcyA9IHRoaXMuX2ZpbHRlckNoYXJ0VHlwZXModGhlbWUueUF4aXMsIGNoYXJ0Q29uc3QuWUFYSVNfUFJPUFMpLFxuICAgICAgICAgICAgc2VyaWVzQ2hhcnRUeXBlcyA9IHRoaXMuX2ZpbHRlckNoYXJ0VHlwZXModGhlbWUuc2VyaWVzLCBjaGFydENvbnN0LlNFUklFU19QUk9QUyk7XG5cbiAgICAgICAgaWYgKCFuZS51dGlsLmtleXMoeUF4aXNDaGFydFR5cGVzKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGl0ZW1zLnB1c2godGhlbWUueUF4aXMudGl0bGUpO1xuICAgICAgICAgICAgaXRlbXMucHVzaCh0aGVtZS55QXhpcy5sYWJlbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZS51dGlsLmZvckVhY2goeUF4aXNDaGFydFR5cGVzLCBmdW5jdGlvbih5QXhpc1RoZW1lKSB7XG4gICAgICAgICAgICAgICAgaXRlbXMucHVzaCh5QXhpc1RoZW1lLnRpdGxlKTtcbiAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKHlBeGlzVGhlbWUubGFiZWwpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBuZS51dGlsLmZvckVhY2hBcnJheShpdGVtcywgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgaWYgKCFpdGVtLmZvbnRGYW1pbHkpIHtcbiAgICAgICAgICAgICAgICBpdGVtLmZvbnRGYW1pbHkgPSBiYXNlRm9udDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKCFuZS51dGlsLmtleXMoc2VyaWVzQ2hhcnRUeXBlcykubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGVtZS5sZWdlbmQuY29sb3JzID0gdGhlbWUuc2VyaWVzLmNvbG9ycztcbiAgICAgICAgICAgIHRoaXMuX2NvcHlDb2xvckluZm9Ub0xlZ2VuZCh0aGVtZS5zZXJpZXMsIHRoZW1lLmxlZ2VuZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZS51dGlsLmZvckVhY2goc2VyaWVzQ2hhcnRUeXBlcywgZnVuY3Rpb24oaXRlbSwgY2hhcnRUeXBlKSB7XG4gICAgICAgICAgICAgICAgdGhlbWUubGVnZW5kW2NoYXJ0VHlwZV0gPSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbG9yczogaXRlbS5jb2xvcnMgfHwgdGhlbWUubGVnZW5kLmNvbG9yc1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy5fY29weUNvbG9ySW5mb1RvTGVnZW5kKGl0ZW0sIHRoZW1lLmxlZ2VuZFtjaGFydFR5cGVdKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhlbWUubGVnZW5kLmNvbG9ycztcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9XG4gICAgfVxufTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBBeGlzIERhdGEgTWFrZXJcbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuLi9jb25zdC5qcycpLFxuICAgIGNhbGN1bGF0b3IgPSByZXF1aXJlKCcuL2NhbGN1bGF0b3IuanMnKTtcblxudmFyIE1JTl9QSVhFTF9TVEVQX1NJWkUgPSA0MCxcbiAgICBNQVhfUElYRUxfU1RFUF9TSVpFID0gNjAsXG4gICAgUEVSQ0VOVF9TVEFDS0VEX1RJQ0tfSU5GTyA9IHtcbiAgICAgICAgc2NhbGU6IHtcbiAgICAgICAgICAgIG1pbjogMCxcbiAgICAgICAgICAgIG1heDogMTAwXG4gICAgICAgIH0sXG4gICAgICAgIHN0ZXA6IDI1LFxuICAgICAgICB0aWNrQ291bnQ6IDUsXG4gICAgICAgIGxhYmVsczogWzAsIDI1LCA1MCwgNzUsIDEwMF1cbiAgICB9O1xuXG52YXIgYWJzID0gTWF0aC5hYnMsXG4gICAgY29uY2F0ID0gQXJyYXkucHJvdG90eXBlLmNvbmNhdDtcbi8qKlxuICogQXhpcyBkYXRhIG1ha2VyLlxuICogQG1vZHVsZSBheGlzRGF0YU1ha2VyXG4gKi9cbnZhciBheGlzRGF0YU1ha2VyID0ge1xuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgZGF0YSBhYm91dCBsYWJlbCBheGlzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48c3RyaW5nPn0gbGFiZWxzIGNoYXJ0IGxhYmVsc1xuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBpc1ZlcnRpY2FsIHdoZXRoZXIgdmVydGljYWwgb3Igbm90XG4gICAgICogQHJldHVybnMge3tcbiAgICAgKiAgICAgIGxhYmVsczogYXJyYXkuPHN0cmluZz4sXG4gICAgICogICAgICB0aWNrQ291bnQ6IG51bWJlcixcbiAgICAgKiAgICAgIHZhbGlkVGlja0NvdW50OiBudW1iZXIsXG4gICAgICogICAgICBpc0xhYmVsQXhpczogYm9vbGVhbixcbiAgICAgKiAgICAgIGlzVmVydGljYWw6IGJvb2xlYW5cbiAgICAgKiB9fSBheGlzIGRhdGFcbiAgICAgKi9cbiAgICBtYWtlTGFiZWxBeGlzRGF0YTogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsYWJlbHM6IHBhcmFtcy5sYWJlbHMsXG4gICAgICAgICAgICB0aWNrQ291bnQ6IHBhcmFtcy5sYWJlbHMubGVuZ3RoICsgMSxcbiAgICAgICAgICAgIHZhbGlkVGlja0NvdW50OiAwLFxuICAgICAgICAgICAgaXNMYWJlbEF4aXM6IHRydWUsXG4gICAgICAgICAgICBpc1ZlcnRpY2FsOiAhIXBhcmFtcy5pc1ZlcnRpY2FsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgZGF0YSBhYm91dCB2YWx1ZSBheGlzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48YXJyYXkuPG51bWJlcj4+fSBwYXJhbXMudmFsdWVzIGNoYXJ0IHZhbHVlc1xuICAgICAqICAgICAgQHBhcmFtIHt7d2lkdGg6bnVtYmVyLCBoZWlnaHQ6bnVtYmVyfX0gcGFyYW1zLnNlcmllc0RpbWVuc2lvbiBzZXJpZXMgZGltZW5zaW9uXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxmdW5jdGlvbj59IHBhcmFtcy5mb3JtYXRGdW5jdGlvbnMgZm9ybWF0IGZ1bmN0aW9uc1xuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5zdGFja2VkIHN0YWNrZWQgb3B0aW9uXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLm9wdGlvbnMgYXhpcyBvcHRpb25zXG4gICAgICogQHJldHVybnMge3tcbiAgICAgKiAgICAgIGxhYmVsczogYXJyYXkuPHN0cmluZz4sXG4gICAgICogICAgICB0aWNrQ291bnQ6IG51bWJlcixcbiAgICAgKiAgICAgIHZhbGlkVGlja0NvdW50OiBudW1iZXIsXG4gICAgICogICAgICBpc0xhYmVsQXhpczogYm9vbGVhbixcbiAgICAgKiAgICAgIHNjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfSxcbiAgICAgKiAgICAgIGlzVmVydGljYWw6IGJvb2xlYW5cbiAgICAgKiB9fSBheGlzIGRhdGFcbiAgICAgKi9cbiAgICBtYWtlVmFsdWVBeGlzRGF0YTogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBvcHRpb25zID0gcGFyYW1zLm9wdGlvbnMgfHwge30sXG4gICAgICAgICAgICBpc1ZlcnRpY2FsID0gISFwYXJhbXMuaXNWZXJ0aWNhbCxcbiAgICAgICAgICAgIGlzUG9zaXRpb25SaWdodCA9ICEhcGFyYW1zLmlzUG9zaXRpb25SaWdodCxcbiAgICAgICAgICAgIGZvcm1hdEZ1bmN0aW9ucyA9IHBhcmFtcy5mb3JtYXRGdW5jdGlvbnMsXG4gICAgICAgICAgICB0aWNrSW5mbztcbiAgICAgICAgaWYgKHBhcmFtcy5zdGFja2VkID09PSAncGVyY2VudCcpIHtcbiAgICAgICAgICAgIHRpY2tJbmZvID0gUEVSQ0VOVF9TVEFDS0VEX1RJQ0tfSU5GTztcbiAgICAgICAgICAgIGZvcm1hdEZ1bmN0aW9ucyA9IFtdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGlja0luZm8gPSB0aGlzLl9nZXRUaWNrSW5mbyh7XG4gICAgICAgICAgICAgICAgdmFsdWVzOiB0aGlzLl9tYWtlQmFzZVZhbHVlcyhwYXJhbXMudmFsdWVzLCBwYXJhbXMuc3RhY2tlZCksXG4gICAgICAgICAgICAgICAgc2VyaWVzRGltZW5zaW9uOiBwYXJhbXMuc2VyaWVzRGltZW5zaW9uLFxuICAgICAgICAgICAgICAgIGlzVmVydGljYWw6IGlzVmVydGljYWwsXG4gICAgICAgICAgICAgICAgaXNQb3NpdGlvblJpZ2h0OiBpc1Bvc2l0aW9uUmlnaHQsXG4gICAgICAgICAgICAgICAgY2hhcnRUeXBlOiBwYXJhbXMuY2hhcnRUeXBlXG4gICAgICAgICAgICB9LCBvcHRpb25zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsYWJlbHM6IHRoaXMuX2Zvcm1hdExhYmVscyh0aWNrSW5mby5sYWJlbHMsIGZvcm1hdEZ1bmN0aW9ucyksXG4gICAgICAgICAgICB0aWNrQ291bnQ6IHRpY2tJbmZvLnRpY2tDb3VudCxcbiAgICAgICAgICAgIHZhbGlkVGlja0NvdW50OiB0aWNrSW5mby50aWNrQ291bnQsXG4gICAgICAgICAgICBzY2FsZTogdGlja0luZm8uc2NhbGUsXG4gICAgICAgICAgICBzdGVwOiB0aWNrSW5mby5zdGVwLFxuICAgICAgICAgICAgaXNWZXJ0aWNhbDogaXNWZXJ0aWNhbCxcbiAgICAgICAgICAgIGlzUG9zaXRpb25SaWdodDogaXNQb3NpdGlvblJpZ2h0XG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYmFzZSB2YWx1ZXMuXG4gICAgICogQHBhcmFtIHthcnJheS48bnVtYmVyPn0gZ3JvdXBWYWx1ZXMgZ3JvdXAgdmFsdWVzXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHN0YWNrZWQgc3RhY2tlZCBvcHRpb24uXG4gICAgICogQHJldHVybnMge2FycmF5LjxudW1iZXI+fSBiYXNlIHZhbHVlc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VCYXNlVmFsdWVzOiBmdW5jdGlvbihncm91cFZhbHVlcywgc3RhY2tlZCkge1xuICAgICAgICB2YXIgYmFzZVZhbHVlcyA9IGNvbmNhdC5hcHBseShbXSwgZ3JvdXBWYWx1ZXMpOyAvLyBmbGF0dGVuIGFycmF5XG4gICAgICAgIGlmIChzdGFja2VkID09PSBjaGFydENvbnN0LlNUQUNLRURfTk9STUFMX1RZUEUpIHtcbiAgICAgICAgICAgIGJhc2VWYWx1ZXMgPSBiYXNlVmFsdWVzLmNvbmNhdChuZS51dGlsLm1hcChncm91cFZhbHVlcywgZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBsdXNWYWx1ZXMgPSBuZS51dGlsLmZpbHRlcih2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSA+IDA7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwuc3VtKHBsdXNWYWx1ZXMpO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBiYXNlVmFsdWVzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgYmFzZSBzaXplIGZvciBnZXQgY2FuZGlkYXRlIHRpY2sgY291bnRzLlxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gZGltZW5zaW9uIGNoYXQgZGltZW5zaW9uXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpc1ZlcnRpY2FsIHdoZXRoZXIgdmVydGljYWwgb3Igbm90XG4gICAgICogQHJldHVybnMge251bWJlcn0gYmFzZSBzaXplXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0QmFzZVNpemU6IGZ1bmN0aW9uKGRpbWVuc2lvbiwgaXNWZXJ0aWNhbCkge1xuICAgICAgICB2YXIgYmFzZVNpemU7XG4gICAgICAgIGlmIChpc1ZlcnRpY2FsKSB7XG4gICAgICAgICAgICBiYXNlU2l6ZSA9IGRpbWVuc2lvbi5oZWlnaHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBiYXNlU2l6ZSA9IGRpbWVuc2lvbi53aWR0aDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYmFzZVNpemU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjYW5kaWRhdGUgdGljayBjb3VudHMuXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBjaGFydERpbWVuc2lvbiBjaGF0IGRpbWVuc2lvblxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNWZXJ0aWNhbCB3aGV0aGVyIHZlcnRpY2FsIG9yIG5vdFxuICAgICAqIEByZXR1cm5zIHthcnJheS48bnVtYmVyPn0gdGljayBjb3VudHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRDYW5kaWRhdGVUaWNrQ291bnRzOiBmdW5jdGlvbihjaGFydERpbWVuc2lvbiwgaXNWZXJ0aWNhbCkge1xuICAgICAgICB2YXIgYmFzZVNpemUgPSB0aGlzLl9nZXRCYXNlU2l6ZShjaGFydERpbWVuc2lvbiwgaXNWZXJ0aWNhbCksXG4gICAgICAgICAgICBzdGFydCA9IHBhcnNlSW50KGJhc2VTaXplIC8gTUFYX1BJWEVMX1NURVBfU0laRSwgMTApLFxuICAgICAgICAgICAgZW5kID0gcGFyc2VJbnQoYmFzZVNpemUgLyBNSU5fUElYRUxfU1RFUF9TSVpFLCAxMCkgKyAxLFxuICAgICAgICAgICAgdGlja0NvdW50cyA9IG5lLnV0aWwucmFuZ2Uoc3RhcnQsIGVuZCk7XG4gICAgICAgIHJldHVybiB0aWNrQ291bnRzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgY29tcGFyaW5nIHZhbHVlLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtaW4gbWluaW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWF4IG1heGltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogQHBhcmFtIHt7c2NhbGU6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9LCBzdGVwOiBudW1iZXJ9fSB0aWNrSW5mbyB0aWNrIGluZm9cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBjb21wYXJpbmcgdmFsdWVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRDb21wYXJpbmdWYWx1ZTogZnVuY3Rpb24obWluLCBtYXgsIHRpY2tJbmZvKSB7XG4gICAgICAgIHZhciBkaWZmTWF4ID0gYWJzKHRpY2tJbmZvLnNjYWxlLm1heCAtIG1heCksXG4gICAgICAgICAgICBkaWZmTWluID0gYWJzKG1pbiAtIHRpY2tJbmZvLnNjYWxlLm1pbiksXG4gICAgICAgICAgICB3ZWlnaHQgPSBNYXRoLnBvdygxMCwgbmUudXRpbC5sZW5ndGhBZnRlclBvaW50KHRpY2tJbmZvLnN0ZXApKTtcbiAgICAgICAgcmV0dXJuIChkaWZmTWF4ICsgZGlmZk1pbikgKiB3ZWlnaHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNlbGVjdCB0aWNrIGluZm8uXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1pbiBtaW5pbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtYXggbWF4aW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxvYmplY3Q+fSBjYW5kaWRhdGVzIHRpY2sgaW5mbyBjYW5kaWRhdGVzXG4gICAgICogQHJldHVybnMge3tzY2FsZToge21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn0sIHRpY2tDb3VudDogbnVtYmVyLCBzdGVwOiBudW1iZXIsIGxhYmVsczogYXJyYXkuPG51bWJlcj59fSBzZWxlY3RlZCB0aWNrIGluZm9cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZWxlY3RUaWNrSW5mbzogZnVuY3Rpb24obWluLCBtYXgsIGNhbmRpZGF0ZXMpIHtcbiAgICAgICAgdmFyIGdldENvbXBhcmluZ1ZhbHVlID0gbmUudXRpbC5iaW5kKHRoaXMuX2dldENvbXBhcmluZ1ZhbHVlLCB0aGlzLCBtaW4sIG1heCksXG4gICAgICAgICAgICB0aWNrSW5mbyA9IG5lLnV0aWwubWluKGNhbmRpZGF0ZXMsIGdldENvbXBhcmluZ1ZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHRpY2tJbmZvO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGljayBjb3VudCBhbmQgc2NhbGUuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnZhbHVlcyBiYXNlIHZhbHVlc1xuICAgICAqICAgICAgQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBwYXJhbXMuc2VyaWVzRGltZW5zaW9uIGNoYXQgZGltZW5zaW9uXG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5pc1ZlcnRpY2FsIHdoZXRoZXIgdmVydGljYWwgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLmNoYXJ0VHlwZSBjaGF0IHR5cGVcbiAgICAgKiBAcGFyYW0ge3ttaW46IG51bWJlciwgbWF4Om51bWJlcn19IG9wdGlvbnMgYXhpcyBvcHRpb25zXG4gICAgICogQHJldHVybnMge3t0aWNrQ291bnQ6IG51bWJlciwgc2NhbGU6IG9iamVjdH19IHRpY2sgaW5mb1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFRpY2tJbmZvOiBmdW5jdGlvbihwYXJhbXMsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIG1pbiA9IG5lLnV0aWwubWluKHBhcmFtcy52YWx1ZXMpLFxuICAgICAgICAgICAgbWF4ID0gbmUudXRpbC5tYXgocGFyYW1zLnZhbHVlcyksXG4gICAgICAgICAgICBpbnRUeXBlSW5mbywgdGlja0NvdW50cywgY2FuZGlkYXRlcywgdGlja0luZm87XG4gICAgICAgIC8vIDAxLiBtaW4sIG1heCwgb3B0aW9ucyDsoJXrs7Trpbwg7KCV7IiY7ZiV7Jy866GcIOuzgOqyvVxuICAgICAgICBpbnRUeXBlSW5mbyA9IHRoaXMuX21ha2VJbnRlZ2VyVHlwZUluZm8obWluLCBtYXgsIG9wdGlvbnMpO1xuXG4gICAgICAgIC8vIDAyLiB0aWNrIGNvdW50IO2bhOuztOq1sCDslrvquLBcbiAgICAgICAgdGlja0NvdW50cyA9IHBhcmFtcy50aWNrQ291bnQgPyBbcGFyYW1zLnRpY2tDb3VudF0gOiB0aGlzLl9nZXRDYW5kaWRhdGVUaWNrQ291bnRzKHBhcmFtcy5zZXJpZXNEaW1lbnNpb24sIHBhcmFtcy5pc1ZlcnRpY2FsKTtcblxuICAgICAgICAvLyAwMy4gdGljayBpbmZvIO2bhOuztOq1sCDqs4TsgrBcbiAgICAgICAgY2FuZGlkYXRlcyA9IHRoaXMuX2dldENhbmRpZGF0ZVRpY2tJbmZvcyh7XG4gICAgICAgICAgICBtaW46IGludFR5cGVJbmZvLm1pbixcbiAgICAgICAgICAgIG1heDogaW50VHlwZUluZm8ubWF4LFxuICAgICAgICAgICAgdGlja0NvdW50czogdGlja0NvdW50cyxcbiAgICAgICAgICAgIGNoYXJ0VHlwZTogcGFyYW1zLmNoYXJ0VHlwZVxuICAgICAgICB9LCBpbnRUeXBlSW5mby5vcHRpb25zKTtcblxuICAgICAgICAvLyAwNC4gdGljayBpbmZvIO2bhOuztOq1sCDspJEg7ZWY64KYIOyEoO2DnVxuICAgICAgICB0aWNrSW5mbyA9IHRoaXMuX3NlbGVjdFRpY2tJbmZvKGludFR5cGVJbmZvLm1pbiwgaW50VHlwZUluZm8ubWF4LCBjYW5kaWRhdGVzKTtcblxuICAgICAgICAvLyAwNS4g7KCV7IiY7ZiV7Jy866GcIOuzgOqyve2WiOuNmCB0aWNrIGluZm/rpbwg7JuQ656YIO2Yle2DnOuhnCDrs4Dqsr1cbiAgICAgICAgdGlja0luZm8gPSB0aGlzLl9yZXZlcnRPcmlnaW5hbFR5cGVUaWNrSW5mbyh0aWNrSW5mbywgaW50VHlwZUluZm8uZGl2aWRlTnVtKTtcbiAgICAgICAgcmV0dXJuIHRpY2tJbmZvO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGludGVnZXIgdHlwZSBpbmZvXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1pbiBtaW5pbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtYXggbWF4aW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiBAcGFyYW0ge3ttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fSBvcHRpb25zIGF4aXMgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHt7bWluOiBudW1iZXIsIG1heDogbnVtYmVyLCBvcHRpb25zOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfSwgZGl2aWRlTnVtOiBudW1iZXJ9fSBpbnRlZ2VyIHR5cGUgaW5mb1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VJbnRlZ2VyVHlwZUluZm86IGZ1bmN0aW9uKG1pbiwgbWF4LCBvcHRpb25zKSB7XG4gICAgICAgIHZhciBtdWx0aXBsZU51bSwgY2hhbmdlZE9wdGlvbnM7XG5cbiAgICAgICAgaWYgKGFicyhtaW4pID49IDEgfHwgYWJzKG1heCkgPj0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBtaW46IG1pbixcbiAgICAgICAgICAgICAgICBtYXg6IG1heCxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zLFxuICAgICAgICAgICAgICAgIGRpdmlkZU51bTogMVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIG11bHRpcGxlTnVtID0gbmUudXRpbC5maW5kTXVsdGlwbGVOdW0obWluLCBtYXgpO1xuICAgICAgICBjaGFuZ2VkT3B0aW9ucyA9IHt9O1xuXG4gICAgICAgIGlmIChvcHRpb25zLm1pbikge1xuICAgICAgICAgICAgY2hhbmdlZE9wdGlvbnMubWluID0gb3B0aW9ucy5taW4gKiBtdWx0aXBsZU51bTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvcHRpb25zLm1heCkge1xuICAgICAgICAgICAgY2hhbmdlZE9wdGlvbnMubWF4ID0gb3B0aW9ucy5tYXggKiBtdWx0aXBsZU51bTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBtaW46IG1pbiAqIG11bHRpcGxlTnVtLFxuICAgICAgICAgICAgbWF4OiBtYXggKiBtdWx0aXBsZU51bSxcbiAgICAgICAgICAgIG9wdGlvbnM6IGNoYW5nZWRPcHRpb25zLFxuICAgICAgICAgICAgZGl2aWRlTnVtOiBtdWx0aXBsZU51bVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXZlcnQgdGljayBpbmZvIHRvIG9yaWdpbmFsIHR5cGUuXG4gICAgICogQHBhcmFtIHt7c3RlcDogbnVtYmVyLCBzY2FsZToge21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn0sIGxhYmVsczogYXJyYXkuPG51bWJlcj59fSB0aWNrSW5mbyB0aWNrIGluZm9cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZGl2aWRlTnVtIGRpdmlkZSBudW1cbiAgICAgKiBAcmV0dXJucyB7e3N0ZXA6IG51bWJlciwgc2NhbGU6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9LCBsYWJlbHM6IGFycmF5LjxudW1iZXI+fX0gZGl2aWRlZCB0aWNrIGluZm9cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZXZlcnRPcmlnaW5hbFR5cGVUaWNrSW5mbzogZnVuY3Rpb24odGlja0luZm8sIGRpdmlkZU51bSkge1xuICAgICAgICBpZiAoZGl2aWRlTnVtID09PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gdGlja0luZm87XG4gICAgICAgIH1cblxuICAgICAgICB0aWNrSW5mby5zdGVwID0gbmUudXRpbC5kaXZpc2lvbih0aWNrSW5mby5zdGVwLCBkaXZpZGVOdW0pO1xuICAgICAgICB0aWNrSW5mby5zY2FsZS5taW4gPSBuZS51dGlsLmRpdmlzaW9uKHRpY2tJbmZvLnNjYWxlLm1pbiwgZGl2aWRlTnVtKTtcbiAgICAgICAgdGlja0luZm8uc2NhbGUubWF4ID0gbmUudXRpbC5kaXZpc2lvbih0aWNrSW5mby5zY2FsZS5tYXgsIGRpdmlkZU51bSk7XG4gICAgICAgIHRpY2tJbmZvLmxhYmVscyA9IG5lLnV0aWwubWFwKHRpY2tJbmZvLmxhYmVscywgZnVuY3Rpb24obGFiZWwpIHtcbiAgICAgICAgICAgIHJldHVybiBuZS51dGlsLmRpdmlzaW9uKGxhYmVsLCBkaXZpZGVOdW0pO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdGlja0luZm87XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE5vcm1hbGl6ZSBzdGVwLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdGVwIG9yaWdpbmFsIHN0ZXBcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBub3JtYWxpemVkIHN0ZXBcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9ub3JtYWxpemVTdGVwOiBmdW5jdGlvbihzdGVwKSB7XG4gICAgICAgIHJldHVybiBjYWxjdWxhdG9yLm5vcm1hbGl6ZUF4aXNOdW1iZXIoc3RlcCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1pbmltaXplIHRpY2sgc2NhbGUuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnVzZXJNaW4gdXNlciBtaW5cbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMudXNlck1heCB1c2VyIG1heFxuICAgICAqICAgICAgQHBhcmFtIHt7dGlja0NvdW50OiBudW1iZXIsIHNjYWxlOiBvYmplY3R9fSBwYXJhbXMudGlja0luZm8gdGljayBpbmZvXG4gICAgICogICAgICBAcGFyYW0ge3ttaW46IG51bWJlciwgbWF4Om51bWJlcn19IHBhcmFtcy5vcHRpb25zIGF4aXMgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHt7dGlja0NvdW50OiBudW1iZXIsIHNjYWxlOiBvYmplY3QsIGxhYmVsczogYXJyYXl9fSBjb3JyZWN0ZWQgdGljayBpbmZvXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWluaW1pemVUaWNrU2NhbGU6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgdGlja0luZm8gPSBwYXJhbXMudGlja0luZm8sXG4gICAgICAgICAgICB0aWNrcyA9IG5lLnV0aWwucmFuZ2UoMSwgdGlja0luZm8udGlja0NvdW50KSxcbiAgICAgICAgICAgIG9wdGlvbnMgPSBwYXJhbXMub3B0aW9ucyxcbiAgICAgICAgICAgIHN0ZXAgPSB0aWNrSW5mby5zdGVwLFxuICAgICAgICAgICAgc2NhbGUgPSB0aWNrSW5mby5zY2FsZSxcbiAgICAgICAgICAgIHRpY2tNYXggPSBzY2FsZS5tYXgsXG4gICAgICAgICAgICB0aWNrTWluID0gc2NhbGUubWluLFxuICAgICAgICAgICAgaXNVbmRlZmluZWRNaW4gPSBuZS51dGlsLmlzVW5kZWZpbmVkKG9wdGlvbnMubWluKSxcbiAgICAgICAgICAgIGlzVW5kZWZpbmVkTWF4ID0gbmUudXRpbC5pc1VuZGVmaW5lZChvcHRpb25zLm1heCksXG4gICAgICAgICAgICBsYWJlbHM7XG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KHRpY2tzLCBmdW5jdGlvbih0aWNrSW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBjdXJTdGVwID0gKHN0ZXAgKiB0aWNrSW5kZXgpLFxuICAgICAgICAgICAgICAgIGN1ck1pbiA9IHRpY2tNaW4gKyBjdXJTdGVwLFxuICAgICAgICAgICAgICAgIGN1ck1heCA9IHRpY2tNYXggLSBjdXJTdGVwO1xuXG4gICAgICAgICAgICAvLyDrjZTsnbTsg4Eg67OA6rK97J20IO2VhOyalCDsl4bsnYQg6rK97JqwXG4gICAgICAgICAgICBpZiAocGFyYW1zLnVzZXJNaW4gPD0gY3VyTWluICYmIHBhcmFtcy51c2VyTWF4ID49IGN1ck1heCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gbWluIOqwkuyXkCDrs4Dqsr0g7Jes7Jyg6rCAIOyeiOydhCDqsr3smrBcbiAgICAgICAgICAgIGlmICgoaXNVbmRlZmluZWRNaW4gJiYgcGFyYW1zLnVzZXJNaW4gPiBjdXJNaW4pIHx8XG4gICAgICAgICAgICAgICAgKCFpc1VuZGVmaW5lZE1pbiAmJiBvcHRpb25zLm1pbiA+PSBjdXJNaW4pKSB7XG4gICAgICAgICAgICAgICAgc2NhbGUubWluID0gY3VyTWluO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBtYXgg6rCS7JeQIOuzgOqyvSDsl6zsnKDqsIAg7J6I7J2EIOqyveyasFxuICAgICAgICAgICAgaWYgKChpc1VuZGVmaW5lZE1pbiAmJiBwYXJhbXMudXNlck1heCA8IGN1ck1heCkgfHxcbiAgICAgICAgICAgICAgICAoIWlzVW5kZWZpbmVkTWF4ICYmIG9wdGlvbnMubWF4IDw9IGN1ck1heCkpIHtcbiAgICAgICAgICAgICAgICBzY2FsZS5tYXggPSBjdXJNYXg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxhYmVscyA9IGNhbGN1bGF0b3IubWFrZUxhYmVsc0Zyb21TY2FsZShzY2FsZSwgc3RlcCk7XG4gICAgICAgIHRpY2tJbmZvLmxhYmVscyA9IGxhYmVscztcbiAgICAgICAgdGlja0luZm8uc3RlcCA9IHN0ZXA7XG4gICAgICAgIHRpY2tJbmZvLnRpY2tDb3VudCA9IGxhYmVscy5sZW5ndGg7XG4gICAgICAgIHJldHVybiB0aWNrSW5mbztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gZGl2aWRlIHRpY2sgc3RlcC5cbiAgICAgKiBAcGFyYW0ge3tzY2FsZToge21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn0sIHRpY2tDb3VudDogbnVtYmVyLCBzdGVwOiBudW1iZXIsIGxhYmVsczogYXJyYXkuPG51bWJlcj59fSB0aWNrSW5mbyB0aWNrIGluZm9cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gb3JnVGlja0NvdW50IG9yaWdpbmFsIHRpY2tDb3VudFxuICAgICAqIEByZXR1cm5zIHt7c2NhbGU6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9LCB0aWNrQ291bnQ6IG51bWJlciwgc3RlcDogbnVtYmVyLCBsYWJlbHM6IGFycmF5LjxudW1iZXI+fX0gdGljayBpbmZvXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZGl2aWRlVGlja1N0ZXA6IGZ1bmN0aW9uKHRpY2tJbmZvLCBvcmdUaWNrQ291bnQpIHtcbiAgICAgICAgdmFyIHN0ZXAgPSB0aWNrSW5mby5zdGVwLFxuICAgICAgICAgICAgc2NhbGUgPSB0aWNrSW5mby5zY2FsZSxcbiAgICAgICAgICAgIHRpY2tDb3VudCA9IHRpY2tJbmZvLnRpY2tDb3VudDtcbiAgICAgICAgLy8gc3RlcCAy7J2YIOuwsOyImCDsnbTrqbTshJwg67OA6rK965CcIHRpY2tDb3VudOydmCDrkZDrsLDsiJgtMeydtCB0aWNrQ291bnTrs7Tri6Qgb3JnVGlja0NvdW507JmAIOywqOydtOqwgCDrjZzrgpjqsbDrgpgg6rCZ7Jy866m0IHN0ZXDsnYQg67CY7Jy866GcIOuzgOqyve2VnOuLpC5cbiAgICAgICAgaWYgKChzdGVwICUgMiA9PT0gMCkgJiZcbiAgICAgICAgICAgIGFicyhvcmdUaWNrQ291bnQgLSAoKHRpY2tDb3VudCAqIDIpIC0gMSkpIDw9IGFicyhvcmdUaWNrQ291bnQgLSB0aWNrQ291bnQpKSB7XG4gICAgICAgICAgICBzdGVwID0gc3RlcCAvIDI7XG4gICAgICAgICAgICB0aWNrSW5mby5sYWJlbHMgPSBjYWxjdWxhdG9yLm1ha2VMYWJlbHNGcm9tU2NhbGUoc2NhbGUsIHN0ZXApO1xuICAgICAgICAgICAgdGlja0luZm8udGlja0NvdW50ID0gdGlja0luZm8ubGFiZWxzLmxlbmd0aDtcbiAgICAgICAgICAgIHRpY2tJbmZvLnN0ZXAgPSBzdGVwO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aWNrSW5mbztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSB0aWNrIGluZm9cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMudGlja0NvdW50IHRpY2sgY291bnRcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubWluIHNjYWxlIG1pblxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5tYXggc2NhbGUgbWF4XG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnVzZXJNaW4gbWluaW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMudXNlck1heCBtYXhpbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaXNNaW51cyB3aGV0aGVyIHNjYWxlIGlzIG1pbnVzIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5jaGFydFR5cGUgY2hhcnQgdHlwZVxuICAgICAqICAgICAgQHBhcmFtIHt7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX0gcGFyYW1zLm9wdGlvbnMgYXhpcyBvcHRpb25zXG4gICAgICogQHJldHVybnMge3tcbiAgICAgKiAgICAgIHNjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfSxcbiAgICAgKiAgICAgIHRpY2tDb3VudDogbnVtYmVyLFxuICAgICAqICAgICAgc3RlcDogbnVtYmVyLFxuICAgICAqICAgICAgbGFiZWxzOiBhcnJheS48bnVtYmVyPlxuICAgICAqIH19IHRpY2sgaW5mb1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VUaWNrSW5mbzogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBzY2FsZSA9IHBhcmFtcy5zY2FsZSxcbiAgICAgICAgICAgIHN0ZXAsIHRpY2tJbmZvO1xuXG4gICAgICAgIC8vIDAxLiDquLDrs7ggc2NhbGUg7KCV67O066GcIHN0ZXAg7Ja76riwXG4gICAgICAgIHN0ZXAgPSBjYWxjdWxhdG9yLmdldFNjYWxlU3RlcChzY2FsZSwgcGFyYW1zLnRpY2tDb3VudCk7XG5cbiAgICAgICAgLy8gMDIuIHN0ZXAg7J2867CY7ZmUIOyLnO2CpOq4sCAoZXg6IDAuMyAtLT4gMC41LCA3IC0tPiAxMClcbiAgICAgICAgc3RlcCA9IHRoaXMuX25vcm1hbGl6ZVN0ZXAoc3RlcCk7XG5cbiAgICAgICAgLy8gMDMuIHNjYWxlIOydvOuwmO2ZlCDsi5ztgqTquLBcbiAgICAgICAgc2NhbGUgPSB0aGlzLl9ub3JtYWxpemVTY2FsZShzY2FsZSwgc3RlcCwgcGFyYW1zLnRpY2tDb3VudCk7XG5cbiAgICAgICAgLy8gMDQuIGxpbmXssKjtirjsnZgg6rK97JqwIOyCrOyaqeyekOydmCBtaW7qsJLsnbQgc2NhbGXsnZggbWlu6rCS6rO8IOqwmeydhCDqsr3smrAsIG1pbuqwkuydhCAxIHN0ZXAg6rCQ7IaMIOyLnO2CtFxuICAgICAgICBzY2FsZS5taW4gPSB0aGlzLl9hZGRNaW5QYWRkaW5nKHtcbiAgICAgICAgICAgIG1pbjogc2NhbGUubWluLFxuICAgICAgICAgICAgc3RlcDogc3RlcCxcbiAgICAgICAgICAgIHVzZXJNaW46IHBhcmFtcy51c2VyTWluLFxuICAgICAgICAgICAgbWluT3B0aW9uOiBwYXJhbXMub3B0aW9ucy5taW4sXG4gICAgICAgICAgICBjaGFydFR5cGU6IHBhcmFtcy5jaGFydFR5cGVcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gMDUuIOyCrOyaqeyekOydmCBtYXjqsJLsnbQgc2NhZWwgbWF47JmAIOqwmeydhCDqsr3smrAsIG1heOqwkuydhCAxIHN0ZXAg7Kad6rCAIOyLnO2CtFxuICAgICAgICBzY2FsZS5tYXggPSB0aGlzLl9hZGRNYXhQYWRkaW5nKHtcbiAgICAgICAgICAgIG1heDogc2NhbGUubWF4LFxuICAgICAgICAgICAgc3RlcDogc3RlcCxcbiAgICAgICAgICAgIHVzZXJNYXg6IHBhcmFtcy51c2VyTWF4LFxuICAgICAgICAgICAgbWF4T3B0aW9uOiBwYXJhbXMub3B0aW9ucy5tYXhcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gMDYuIGF4aXMgc2NhbGXsnbQg7IKs7Jqp7J6QIG1pbiwgbWF47JmAIOqxsOumrOqwgCDrqYAg6rK97JqwIOyhsOygiFxuICAgICAgICB0aWNrSW5mbyA9IHRoaXMuX21pbmltaXplVGlja1NjYWxlKHtcbiAgICAgICAgICAgIHVzZXJNaW46IHBhcmFtcy51c2VyTWluLFxuICAgICAgICAgICAgdXNlck1heDogcGFyYW1zLnVzZXJNYXgsXG4gICAgICAgICAgICB0aWNrSW5mbzoge3NjYWxlOiBzY2FsZSwgc3RlcDogc3RlcCwgdGlja0NvdW50OiBwYXJhbXMudGlja0NvdW50fSxcbiAgICAgICAgICAgIG9wdGlvbnM6IHBhcmFtcy5vcHRpb25zXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRpY2tJbmZvID0gdGhpcy5fZGl2aWRlVGlja1N0ZXAodGlja0luZm8sIHBhcmFtcy50aWNrQ291bnQpO1xuICAgICAgICByZXR1cm4gdGlja0luZm87XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZCBzY2FsZSBtaW4gcGFkZGluZy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwcmFtcyB7bnVtYmVyfSBwYXJhbXMubWluIHNjYWxlIG1pblxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy51c2VyTWluIG1pbmltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLm1pbk9wdGlvbiBtaW4gb3B0aW9uXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnN0ZXAgdGljayBzdGVwXG4gICAgICogQHJldHVybnMge251bWJlcn0gc2NhbGUgbWluXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYWRkTWluUGFkZGluZzogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBtaW4gPSBwYXJhbXMubWluO1xuXG4gICAgICAgIGlmIChwYXJhbXMuY2hhcnRUeXBlICE9PSBjaGFydENvbnN0LkNIQVJUX1RZUEVfTElORSB8fCAhbmUudXRpbC5pc1VuZGVmaW5lZChwYXJhbXMubWluT3B0aW9uKSkge1xuICAgICAgICAgICAgcmV0dXJuIG1pbjtcbiAgICAgICAgfVxuICAgICAgICAvLyBub3JtYWxpemXrkJwgc2NhbGUgbWlu6rCS7J20IHVzZXIgbWlu6rCS6rO8IOqwmeydhCDqsr3smrAgc3RlcCDqsJDshoxcbiAgICAgICAgaWYgKHBhcmFtcy5taW4gPT09IHBhcmFtcy51c2VyTWluKSB7XG4gICAgICAgICAgICBtaW4gLT0gcGFyYW1zLnN0ZXA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1pbjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIHNjYWxlIG1heCBwYWRkaW5nLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHByYW1zIHtudW1iZXJ9IHBhcmFtcy5tYXggc2NhbGUgbWF4XG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnVzZXJNYXggbWF4aW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubWF4T3B0aW9uIG1heCBvcHRpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuc3RlcCB0aWNrIHN0ZXBcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBzY2FsZSBtYXhcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hZGRNYXhQYWRkaW5nOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIG1heCA9IHBhcmFtcy5tYXg7XG4gICAgICAgIC8vIG5vcm1hbGl6ZeuQnCBzY2FsZSBtYXjqsJLsnbQgdXNlciBtYXjqsJLqs7wg6rCZ7J2EIOqyveyasCBzdGVwIOymneqwgFxuICAgICAgICBpZiAobmUudXRpbC5pc1VuZGVmaW5lZChwYXJhbXMubWF4T3B0aW9uKSAmJiAocGFyYW1zLm1heCA9PT0gcGFyYW1zLnVzZXJNYXgpKSB7XG4gICAgICAgICAgICBtYXggKz0gcGFyYW1zLnN0ZXA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1heDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbm9ybWFsaXplIG1pbi5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWluIG9yaWdpbmFsIG1pblxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdGVwIHRpY2sgc3RlcFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IG5vcm1hbGl6ZWQgbWluXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbm9ybWFsaXplTWluOiBmdW5jdGlvbihtaW4sIHN0ZXApIHtcbiAgICAgICAgdmFyIG1vZCA9IG5lLnV0aWwubW9kKG1pbiwgc3RlcCksXG4gICAgICAgICAgICBub3JtYWxpemVkO1xuXG4gICAgICAgIGlmIChtb2QgPT09IDApIHtcbiAgICAgICAgICAgIG5vcm1hbGl6ZWQgPSBtaW47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBub3JtYWxpemVkID0gbmUudXRpbC5zdWJ0cmFjdGlvbihtaW4sIChtaW4gPj0gMCA/IG1vZCA6IHN0ZXAgKyBtb2QpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbm9ybWFsaXplZDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBub3JtYWxpemVkIG1heFxuICAgICAqIEBwYXJhbSB7e21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19IHNjYWxlIHNjYWxlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHN0ZXAgdGljayBzdGVwXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHRpY2tDb3VudCB0aWNrIGNvdW50XG4gICAgICogQHJldHVybnMge251bWJlcn0gbm9ybWFsaXplZCBtYXhcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlTm9ybWFsaXplZE1heDogZnVuY3Rpb24oc2NhbGUsIHN0ZXAsIHRpY2tDb3VudCkge1xuICAgICAgICB2YXIgbWluTWF4RGlmZiA9IG5lLnV0aWwubXVsdGlwbGljYXRpb24oc3RlcCwgdGlja0NvdW50IC0gMSksXG4gICAgICAgICAgICBub3JtYWxpemVkTWF4ID0gbmUudXRpbC5hZGRpdGlvbihzY2FsZS5taW4sIG1pbk1heERpZmYpLFxuICAgICAgICAgICAgbWF4RGlmZiA9IHNjYWxlLm1heCAtIG5vcm1hbGl6ZWRNYXgsXG4gICAgICAgICAgICBtb2REaWZmLCBkaXZpZGVEaWZmO1xuICAgICAgICAvLyBub3JtYWxpemXrkJwgbWF46rCS7J20IOybkOuemOydmCBtYXjqsJIg67O064ukIOyekeydhCDqsr3smrAgc3RlcOydhCDspp3qsIDsi5zsvJwg7YGwIOqwkuycvOuhnCDrp4zrk6TquLBcbiAgICAgICAgaWYgKG1heERpZmYgPiAwKSB7XG4gICAgICAgICAgICBtb2REaWZmID0gbWF4RGlmZiAlIHN0ZXA7XG4gICAgICAgICAgICBkaXZpZGVEaWZmID0gTWF0aC5mbG9vcihtYXhEaWZmIC8gc3RlcCk7XG4gICAgICAgICAgICBub3JtYWxpemVkTWF4ICs9IHN0ZXAgKiAobW9kRGlmZiA+IDAgPyBkaXZpZGVEaWZmICsgMSA6IGRpdmlkZURpZmYpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBub3JtYWxpemVkTWF4O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBub3JtYWxpemUgc2NhbGVcbiAgICAgKiBAcGFyYW0ge3ttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fSBzY2FsZSBiYXNlIHNjYWxlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHN0ZXAgdGljayBzdGVwXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHRpY2tDb3VudCB0aWNrIGNvdW50XG4gICAgICogQHJldHVybnMge3ttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fSBub3JtYWxpemVkIHNjYWxlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbm9ybWFsaXplU2NhbGU6IGZ1bmN0aW9uKHNjYWxlLCBzdGVwLCB0aWNrQ291bnQpIHtcbiAgICAgICAgc2NhbGUubWluID0gdGhpcy5fbm9ybWFsaXplTWluKHNjYWxlLm1pbiwgc3RlcCk7XG4gICAgICAgIHNjYWxlLm1heCA9IHRoaXMuX21ha2VOb3JtYWxpemVkTWF4KHNjYWxlLCBzdGVwLCB0aWNrQ291bnQpO1xuICAgICAgICByZXR1cm4gc2NhbGU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjYW5kaWRhdGVzIGFib3V0IHRpY2sgaW5mby5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubWluIG1pbmltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLm1heCBtYXhpbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48bnVtYmVyPn0gcGFyYW1zLnRpY2tDb3VudHMgdGljayBjb3VudHNcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMuY2hhcnRUeXBlIGNoYXJ0IHR5cGVcbiAgICAgKiBAcGFyYW0ge3ttaW46IG51bWJlciwgbWF4Om51bWJlcn19IG9wdGlvbnMgYXhpcyBvcHRpb25zXG4gICAgICogQHJldHVybnMge2FycmF5fSBjYW5kaWRhdGVzIGFib3V0IHRpY2sgaW5mb1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldENhbmRpZGF0ZVRpY2tJbmZvczogZnVuY3Rpb24ocGFyYW1zLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciB1c2VyTWluID0gcGFyYW1zLm1pbixcbiAgICAgICAgICAgIHVzZXJNYXggPSBwYXJhbXMubWF4LFxuICAgICAgICAgICAgbWluID0gcGFyYW1zLm1pbixcbiAgICAgICAgICAgIG1heCA9IHBhcmFtcy5tYXgsXG4gICAgICAgICAgICBzY2FsZSwgY2FuZGlkYXRlcztcblxuICAgICAgICAvLyBtaW4sIG1heOunjOycvOuhnCDquLDrs7ggc2NhbGUg7Ja76riwXG4gICAgICAgIHNjYWxlID0gdGhpcy5fbWFrZUJhc2VTY2FsZShtaW4sIG1heCwgb3B0aW9ucyk7XG5cbiAgICAgICAgY2FuZGlkYXRlcyA9IG5lLnV0aWwubWFwKHBhcmFtcy50aWNrQ291bnRzLCBmdW5jdGlvbih0aWNrQ291bnQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9tYWtlVGlja0luZm8oe1xuICAgICAgICAgICAgICAgIHRpY2tDb3VudDogdGlja0NvdW50LFxuICAgICAgICAgICAgICAgIHNjYWxlOiBuZS51dGlsLmV4dGVuZCh7fSwgc2NhbGUpLFxuICAgICAgICAgICAgICAgIHVzZXJNaW46IHVzZXJNaW4sXG4gICAgICAgICAgICAgICAgdXNlck1heDogdXNlck1heCxcbiAgICAgICAgICAgICAgICBjaGFydFR5cGU6IHBhcmFtcy5jaGFydFR5cGUsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgICByZXR1cm4gY2FuZGlkYXRlcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBiYXNlIHNjYWxlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1pbiBtaW5pbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtYXggbWF4aW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiBAcGFyYW0ge3ttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fSBvcHRpb25zIGF4aXMgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHt7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX0gYmFzZSBzY2FsZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VCYXNlU2NhbGU6IGZ1bmN0aW9uKG1pbiwgbWF4LCBvcHRpb25zKSB7XG4gICAgICAgIHZhciBpc01pbnVzID0gZmFsc2UsXG4gICAgICAgICAgICB0bXBNaW4sIHNjYWxlO1xuXG4gICAgICAgIGlmIChtaW4gPCAwICYmIG1heCA8PSAwKSB7XG4gICAgICAgICAgICBpc01pbnVzID0gdHJ1ZTtcbiAgICAgICAgICAgIHRtcE1pbiA9IG1pbjtcbiAgICAgICAgICAgIG1pbiA9IC1tYXg7XG4gICAgICAgICAgICBtYXggPSAtdG1wTWluO1xuICAgICAgICB9XG5cbiAgICAgICAgc2NhbGUgPSBjYWxjdWxhdG9yLmNhbGN1bGF0ZVNjYWxlKG1pbiwgbWF4KTtcblxuICAgICAgICBpZiAoaXNNaW51cykge1xuICAgICAgICAgICAgdG1wTWluID0gc2NhbGUubWluO1xuICAgICAgICAgICAgc2NhbGUubWluID0gLXNjYWxlLm1heDtcbiAgICAgICAgICAgIHNjYWxlLm1heCA9IC10bXBNaW47XG4gICAgICAgIH1cblxuICAgICAgICBzY2FsZS5taW4gPSBvcHRpb25zLm1pbiB8fCBzY2FsZS5taW47XG4gICAgICAgIHNjYWxlLm1heCA9IG9wdGlvbnMubWF4IHx8IHNjYWxlLm1heDtcblxuICAgICAgICByZXR1cm4gc2NhbGU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZvcm1hdCBsYWJlbHMuXG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gbGFiZWxzIHRhcmdldCBsYWJlbHNcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uW119IGZvcm1hdEZ1bmN0aW9ucyBmb3JtYXQgZnVuY3Rpb25zXG4gICAgICogQHJldHVybnMge3N0cmluZ1tdfSBmb3JtYXR0ZWQgbGFiZWxzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZm9ybWF0TGFiZWxzOiBmdW5jdGlvbihsYWJlbHMsIGZvcm1hdEZ1bmN0aW9ucykge1xuICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICBpZiAoIWZvcm1hdEZ1bmN0aW9ucyB8fCAhZm9ybWF0RnVuY3Rpb25zLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIGxhYmVscztcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQgPSBuZS51dGlsLm1hcChsYWJlbHMsIGZ1bmN0aW9uKGxhYmVsKSB7XG4gICAgICAgICAgICB2YXIgZm5zID0gY29uY2F0LmFwcGx5KFtsYWJlbF0sIGZvcm1hdEZ1bmN0aW9ucyk7XG4gICAgICAgICAgICByZXR1cm4gbmUudXRpbC5yZWR1Y2UoZm5zLCBmdW5jdGlvbihzdG9yZWQsIGZuKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZuKHN0b3JlZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBheGlzRGF0YU1ha2VyO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEJvdW5kcyBtYWtlci5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGNhbGN1bGF0b3IgPSByZXF1aXJlKCcuL2NhbGN1bGF0b3IuanMnKSxcbiAgICByZW5kZXJVdGlsID0gcmVxdWlyZSgnLi9yZW5kZXJVdGlsLmpzJyk7XG5cbnZhciBDSEFSVF9QQURESU5HID0gMTAsXG4gICAgVElUTEVfQUREX1BBRERJTkcgPSAyMCxcbiAgICBMRUdFTkRfQVJFQV9QQURESU5HID0gMTAsXG4gICAgTEVHRU5EX1JFQ1RfV0lEVEggPSAxMixcbiAgICBMRUdFTkRfTEFCRUxfUEFERElOR19MRUZUID0gNSxcbiAgICBBWElTX0xBQkVMX1BBRERJTkcgPSA3LFxuICAgIEhJRERFTl9XSURUSCA9IDE7XG5cbnZhciBjb25jYXQgPSBBcnJheS5wcm90b3R5cGUuY29uY2F0O1xuXG4vKipcbiAqIEJvdW5kcyBtYWtlci5cbiAqIEBtb2R1bGUgYm91bmRzTWFrZXJcbiAqL1xudmFyIGJvdW5kc01ha2VyID0ge1xuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYm91bmRzIGFib3V0IGNoYXJ0IGNvbXBvbmVudHMuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmNvbnZlcnREYXRhIGNvbnZlcnRlZCBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIGNoYXJ0IHRoZW1lXG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5pc1ZlcnRpY2FsIHdoZXRoZXIgdmVydGljYWwgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHt7XG4gICAgICogICBwbG90OiB7XG4gICAgICogICAgIGRpbWVuc2lvbjoge3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfSxcbiAgICAgKiAgICAgcG9zaXRpb246IHt0b3A6IG51bWJlciwgcmlnaHQ6IG51bWJlcn1cbiAgICAgKiAgIH0sXG4gICAgICogICB5QXhpczoge1xuICAgICAqICAgICBkaW1lbnNpb246IHt3aWR0aDogKG51bWJlciksIGhlaWdodDogbnVtYmVyfSxcbiAgICAgKiAgICAgcG9zaXRpb246IHt0b3A6IG51bWJlcn1cbiAgICAgKiAgIH0sXG4gICAgICogICB4QXhpczoge1xuICAgICAqICAgICBkaW1lbnNpb246IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IChudW1iZXIpfSxcbiAgICAgKiAgICAgcG9zaXRpb246IHtyaWdodDogbnVtYmVyfVxuICAgICAqICAgfSxcbiAgICAgKiAgIHNlcmllczoge1xuICAgICAqICAgICBkaW1lbnNpb246IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn0sXG4gICAgICogICAgIHBvc2l0aW9uOiB7dG9wOiBudW1iZXIsIHJpZ2h0OiBudW1iZXJ9XG4gICAgICogICB9LFxuICAgICAqICAgbGVnZW5kOiB7XG4gICAgICogICAgIHBvc2l0aW9uOiB7dG9wOiBudW1iZXJ9XG4gICAgICogICB9LFxuICAgICAqICAgdG9vbHRpcDoge1xuICAgICAqICAgICBkaW1lbnNpb246IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn0sXG4gICAgICogICAgIHBvc2l0aW9uOiB7dG9wOiBudW1iZXIsIGxlZnQ6IG51bWJlcn1cbiAgICAgKiAgIH1cbiAgICAgKiB9fSBib3VuZHNcbiAgICAgKi9cbiAgICBtYWtlOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGRpbWVuc2lvbnMgPSB0aGlzLl9nZXRDb21wb25lbnRzRGltZW5zaW9ucyhwYXJhbXMpLFxuICAgICAgICAgICAgeUF4aXNXaWR0aCA9IGRpbWVuc2lvbnMueUF4aXMud2lkdGgsXG4gICAgICAgICAgICB0b3AgPSBkaW1lbnNpb25zLnRpdGxlLmhlaWdodCArIENIQVJUX1BBRERJTkcsXG4gICAgICAgICAgICByaWdodCA9IGRpbWVuc2lvbnMubGVnZW5kLndpZHRoICsgZGltZW5zaW9ucy55ckF4aXMud2lkdGggKyBDSEFSVF9QQURESU5HLFxuICAgICAgICAgICAgYXhlc0JvdW5kcyA9IHRoaXMuX21ha2VBeGVzQm91bmRzKHtcbiAgICAgICAgICAgICAgICBoYXNBeGVzOiBwYXJhbXMuaGFzQXhlcyxcbiAgICAgICAgICAgICAgICB5QXhpc0NoYXJ0VHlwZXM6IHBhcmFtcy55QXhpc0NoYXJ0VHlwZXMsXG4gICAgICAgICAgICAgICAgZGltZW5zaW9uczogZGltZW5zaW9ucyxcbiAgICAgICAgICAgICAgICB0b3A6IHRvcCxcbiAgICAgICAgICAgICAgICByaWdodDogcmlnaHRcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgYm91bmRzID0gbmUudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgICAgIGNoYXJ0OiB7XG4gICAgICAgICAgICAgICAgICAgIGRpbWVuc2lvbjogZGltZW5zaW9ucy5jaGFydFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc2VyaWVzOiB7XG4gICAgICAgICAgICAgICAgICAgIGRpbWVuc2lvbjogZGltZW5zaW9ucy5zZXJpZXMsXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3A6IHRvcCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJpZ2h0OiByaWdodFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBsZWdlbmQ6IHtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogZGltZW5zaW9ucy50aXRsZS5oZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiB5QXhpc1dpZHRoICsgZGltZW5zaW9ucy5wbG90LndpZHRoICsgZGltZW5zaW9ucy55ckF4aXMud2lkdGggKyBDSEFSVF9QQURESU5HXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRvb2x0aXA6IHtcbiAgICAgICAgICAgICAgICAgICAgZGltZW5zaW9uOiBkaW1lbnNpb25zLnRvb2x0aXAsXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3A6IHRvcCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6IHlBeGlzV2lkdGggKyBDSEFSVF9QQURESU5HXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCBheGVzQm91bmRzKTtcbiAgICAgICAgcmV0dXJuIGJvdW5kcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IG1heCBsYWJlbCBvZiB2YWx1ZSBheGlzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb252ZXJ0RGF0YSBjb252ZXJ0IGRhdGFcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBjaGFydFR5cGVzIGNoYXJ0IHR5cGVzXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IGNoYXJ0IHR5cGUgaW5kZXhcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfHN0cmluZ30gbWF4IGxhYmVsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0VmFsdWVBeGlzTWF4TGFiZWw6IGZ1bmN0aW9uKGNvbnZlcnREYXRhLCBjaGFydFR5cGVzLCBpbmRleCkge1xuICAgICAgICB2YXIgY2hhcnRUeXBlID0gY2hhcnRUeXBlcyAmJiBjaGFydFR5cGVzW2luZGV4IHx8IDBdIHx8ICcnLFxuICAgICAgICAgICAgdmFsdWVzID0gY2hhcnRUeXBlICYmIGNvbnZlcnREYXRhLnZhbHVlc1tjaGFydFR5cGVdID8gY29udmVydERhdGEudmFsdWVzW2NoYXJ0VHlwZV0gOiBjb252ZXJ0RGF0YS5qb2luVmFsdWVzLFxuICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zID0gY29udmVydERhdGEuZm9ybWF0RnVuY3Rpb25zLFxuICAgICAgICAgICAgZmxhdHRlblZhbHVlcyA9IGNvbmNhdC5hcHBseShbXSwgdmFsdWVzKSxcbiAgICAgICAgICAgIG1pbiA9IG5lLnV0aWwubWluKGZsYXR0ZW5WYWx1ZXMpLFxuICAgICAgICAgICAgbWF4ID0gbmUudXRpbC5tYXgoZmxhdHRlblZhbHVlcyksXG4gICAgICAgICAgICBzY2FsZSA9IGNhbGN1bGF0b3IuY2FsY3VsYXRlU2NhbGUobWluLCBtYXgpLFxuICAgICAgICAgICAgbWluTGFiZWwgPSBjYWxjdWxhdG9yLm5vcm1hbGl6ZUF4aXNOdW1iZXIoc2NhbGUubWluKSxcbiAgICAgICAgICAgIG1heExhYmVsID0gY2FsY3VsYXRvci5ub3JtYWxpemVBeGlzTnVtYmVyKHNjYWxlLm1heCksXG4gICAgICAgICAgICBmbnMgPSBmb3JtYXRGdW5jdGlvbnMgJiYgZm9ybWF0RnVuY3Rpb25zLnNsaWNlKCkgfHwgW107XG4gICAgICAgIG1heExhYmVsID0gKG1pbkxhYmVsICsgJycpLmxlbmd0aCA+IChtYXhMYWJlbCArICcnKS5sZW5ndGggPyBtaW5MYWJlbCA6IG1heExhYmVsO1xuICAgICAgICBmbnMudW5zaGlmdChtYXhMYWJlbCk7XG4gICAgICAgIG1heExhYmVsID0gbmUudXRpbC5yZWR1Y2UoZm5zLCBmdW5jdGlvbihzdG9yZWQsIGZuKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4oc3RvcmVkKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBtYXhMYWJlbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IFJlbmRlcmVkIExhYmVscyBNYXggU2l6ZSh3aWR0aCBvciBoZWlnaHQpXG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gbGFiZWxzIGxhYmVsc1xuICAgICAqIEBwYXJhbSB7e2ZvbnRTaXplOiBudW1iZXIsIGZvbnRGYW1pbHk6IHN0cmluZywgY29sb3I6IHN0cmluZ319IHRoZW1lIGxhYmVsIHRoZW1lXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gaXRlcmF0ZWUgaXRlcmF0ZWVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBtYXggc2l6ZSAod2lkdGggb3IgaGVpZ2h0KVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFJlbmRlcmVkTGFiZWxzTWF4U2l6ZTogZnVuY3Rpb24obGFiZWxzLCB0aGVtZSwgaXRlcmF0ZWUpIHtcbiAgICAgICAgdmFyIHNpemVzID0gbmUudXRpbC5tYXAobGFiZWxzLCBmdW5jdGlvbihsYWJlbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpdGVyYXRlZShsYWJlbCwgdGhlbWUpO1xuICAgICAgICAgICAgfSwgdGhpcyksXG4gICAgICAgICAgICBtYXhTaXplID0gbmUudXRpbC5tYXgoc2l6ZXMpO1xuICAgICAgICByZXR1cm4gbWF4U2l6ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHJlbmRlcmVkIGxhYmVscyBtYXggd2lkdGguXG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gbGFiZWxzIGxhYmVsc1xuICAgICAqIEBwYXJhbSB7e2ZvbnRTaXplOiBudW1iZXIsIGZvbnRGYW1pbHk6IHN0cmluZywgY29sb3I6IHN0cmluZ319IHRoZW1lIGxhYmVsIHRoZW1lXG4gICAgICogQHJldHVybnMge251bWJlcn0gbWF4IHdpZHRoXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0UmVuZGVyZWRMYWJlbHNNYXhXaWR0aDogZnVuY3Rpb24obGFiZWxzLCB0aGVtZSkge1xuICAgICAgICB2YXIgaXRlcmF0ZWUgPSBuZS51dGlsLmJpbmQocmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsV2lkdGgsIHJlbmRlclV0aWwpLFxuICAgICAgICAgICAgbWF4V2lkdGggPSB0aGlzLl9nZXRSZW5kZXJlZExhYmVsc01heFNpemUobGFiZWxzLCB0aGVtZSwgaXRlcmF0ZWUpO1xuICAgICAgICByZXR1cm4gbWF4V2lkdGg7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCByZW5kZXJlZCBsYWJlbHMgbWF4IGhlaWdodC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBsYWJlbHMgbGFiZWxzXG4gICAgICogQHBhcmFtIHt7Zm9udFNpemU6IG51bWJlciwgZm9udEZhbWlseTogc3RyaW5nLCBjb2xvcjogc3RyaW5nfX0gdGhlbWUgbGFiZWwgdGhlbWVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBtYXggaGVpZ2h0XG4gICAgICovXG4gICAgX2dldFJlbmRlcmVkTGFiZWxzTWF4SGVpZ2h0OiBmdW5jdGlvbihsYWJlbHMsIHRoZW1lKSB7XG4gICAgICAgIHZhciBpdGVyYXRlZSA9IG5lLnV0aWwuYmluZChyZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxIZWlnaHQsIHJlbmRlclV0aWwpLFxuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5fZ2V0UmVuZGVyZWRMYWJlbHNNYXhTaXplKGxhYmVscywgdGhlbWUsIGl0ZXJhdGVlKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHdpZHRoIG9mIHZlcnRpY2FsIGF4aXMgYXJlYS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGl0bGUgYXhpcyB0aXRsZSxcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBsYWJlbHMgYXhpcyBsYWJlbHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgYXhpcyB0aGVtZVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IHdpZHRoXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0VmVydGljYWxBeGlzV2lkdGg6IGZ1bmN0aW9uKHRpdGxlLCBsYWJlbHMsIHRoZW1lKSB7XG4gICAgICAgIHZhciB0aXRsZUFyZWFXaWR0aCA9IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodCh0aXRsZSwgdGhlbWUudGl0bGUpICsgVElUTEVfQUREX1BBRERJTkcsXG4gICAgICAgICAgICB3aWR0aCA9IHRoaXMuX2dldFJlbmRlcmVkTGFiZWxzTWF4V2lkdGgobGFiZWxzLCB0aGVtZS5sYWJlbCkgKyB0aXRsZUFyZWFXaWR0aCArIEFYSVNfTEFCRUxfUEFERElORztcbiAgICAgICAgcmV0dXJuIHdpZHRoO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgaGVpZ2h0IG9mIGhvcml6b250YWwgYXhpcyBhcmVhLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0aXRsZSBheGlzIHRpdGxlLFxuICAgICAqIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGxhYmVscyBheGlzIGxhYmVsc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBheGlzIHRoZW1lXG4gICAgICogQHJldHVybnMge251bWJlcn0gaGVpZ2h0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0SG9yaXpvbnRhbEF4aXNIZWlnaHQ6IGZ1bmN0aW9uKHRpdGxlLCBsYWJlbHMsIHRoZW1lKSB7XG4gICAgICAgIHZhciB0aXRsZUFyZWFIZWlnaHQgPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxIZWlnaHQodGl0bGUsIHRoZW1lLnRpdGxlKSArIFRJVExFX0FERF9QQURESU5HLFxuICAgICAgICAgICAgaGVpZ2h0ID0gdGhpcy5fZ2V0UmVuZGVyZWRMYWJlbHNNYXhIZWlnaHQobGFiZWxzLCB0aGVtZS5sYWJlbCkgKyB0aXRsZUFyZWFIZWlnaHQ7XG4gICAgICAgIHJldHVybiBoZWlnaHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB3aWR0aCBhYm91dCB5IHJpZ2h0IGF4aXNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IHBhcmFtcy55QXhpc0NoYXJ0VHlwZXMgY2hhcnQgdHlwZXNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgY2hhcnQgdGhlbWVcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMub3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogQHJldHVybnMge251bWJlcn0geSByaWdodCBheGlzIHdpZHRoXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0WVJBeGlzV2lkdGg6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgeUF4aXNDaGFydFR5cGVzID0gcGFyYW1zLnlBeGlzQ2hhcnRUeXBlcyB8fCBbXSxcbiAgICAgICAgICAgIHJpZ2h0WUF4aXNXaWR0aCA9IDAsXG4gICAgICAgICAgICB5QXhpc1RoZW1lcywgeUF4aXNUaGVtZSwgeUF4aXNPcHRpb25zLCBpbmRleCwgbGFiZWxzLCB0aXRsZTtcbiAgICAgICAgaW5kZXggPSB5QXhpc0NoYXJ0VHlwZXMubGVuZ3RoIC0gMTtcbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgIHlBeGlzVGhlbWVzID0gW10uY29uY2F0KHBhcmFtcy50aGVtZS55QXhpcyk7XG4gICAgICAgICAgICB5QXhpc09wdGlvbnMgPSBbXS5jb25jYXQocGFyYW1zLm9wdGlvbnMueUF4aXMpO1xuICAgICAgICAgICAgdGl0bGUgPSB5QXhpc09wdGlvbnNbaW5kZXhdICYmIHlBeGlzT3B0aW9uc1tpbmRleF0udGl0bGU7XG4gICAgICAgICAgICBsYWJlbHMgPSBbdGhpcy5fZ2V0VmFsdWVBeGlzTWF4TGFiZWwocGFyYW1zLmNvbnZlcnREYXRhLCB5QXhpc0NoYXJ0VHlwZXMsIGluZGV4KV07XG4gICAgICAgICAgICB5QXhpc1RoZW1lID0geUF4aXNUaGVtZXMubGVuZ3RoID09PSAxID8geUF4aXNUaGVtZXNbMF0gOiB5QXhpc1RoZW1lc1tpbmRleF07XG4gICAgICAgICAgICByaWdodFlBeGlzV2lkdGggPSB0aGlzLl9nZXRWZXJ0aWNhbEF4aXNXaWR0aCh0aXRsZSwgbGFiZWxzLCB5QXhpc1RoZW1lKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmlnaHRZQXhpc1dpZHRoO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGF4ZXMgZGltZW5zaW9uLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5jb252ZXJ0RGF0YSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBjaGFydCB0aGVtZVxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaXNWZXJ0aWNhbCB3aGV0aGVyIHZlcnRpY2FsIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5vcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7e1xuICAgICAqICAgICAgeUF4aXM6IHt3aWR0aDogbnVtYmVyfSxcbiAgICAgKiAgICAgIHlyQXhpczoge3dpZHRoOiBudW1iZXJ9LFxuICAgICAqICAgICAgeEF4aXM6IHtoZWlnaHQ6IG51bWJlcn1cbiAgICAgKiB9fSBheGVzIGRpbWVuc2lvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VBeGVzRGltZW5zaW9uOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIHRoZW1lLCBvcHRpb25zLCBjb252ZXJ0RGF0YSwgeUF4aXNDaGFydFR5cGVzLFxuICAgICAgICAgICAgeUF4aXNUaXRsZSwgeEF4aXNUaXRsZSwgbWF4TGFiZWwsIHZMYWJlbHMsIGhMYWJlbHMsXG4gICAgICAgICAgICB5QXhpc1dpZHRoLCB4QXhpc0hlaWdodCwgeXJBeGlzV2lkdGg7XG4gICAgICAgIGlmICghcGFyYW1zLmhhc0F4ZXMpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgeUF4aXM6IHtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDBcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHlyQXhpczoge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogMFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgeEF4aXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAwXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoZW1lID0gcGFyYW1zLnRoZW1lO1xuICAgICAgICBvcHRpb25zID0gcGFyYW1zLm9wdGlvbnM7XG4gICAgICAgIGNvbnZlcnREYXRhID0gcGFyYW1zLmNvbnZlcnREYXRhO1xuICAgICAgICB5QXhpc0NoYXJ0VHlwZXMgPSBwYXJhbXMueUF4aXNDaGFydFR5cGVzO1xuICAgICAgICB5QXhpc1RpdGxlID0gb3B0aW9ucy55QXhpcyAmJiBvcHRpb25zLnlBeGlzLnRpdGxlO1xuICAgICAgICB4QXhpc1RpdGxlID0gb3B0aW9ucy54QXhpcyAmJiBvcHRpb25zLnhBeGlzLnRpdGxlO1xuICAgICAgICBtYXhMYWJlbCA9IHRoaXMuX2dldFZhbHVlQXhpc01heExhYmVsKGNvbnZlcnREYXRhLCB5QXhpc0NoYXJ0VHlwZXMpO1xuICAgICAgICB2TGFiZWxzID0gcGFyYW1zLmlzVmVydGljYWwgPyBbbWF4TGFiZWxdIDogY29udmVydERhdGEubGFiZWxzO1xuICAgICAgICBoTGFiZWxzID0gcGFyYW1zLmlzVmVydGljYWwgPyBjb252ZXJ0RGF0YS5sYWJlbHMgOiBbbWF4TGFiZWxdO1xuICAgICAgICB5QXhpc1dpZHRoID0gdGhpcy5fZ2V0VmVydGljYWxBeGlzV2lkdGgoeUF4aXNUaXRsZSwgdkxhYmVscywgdGhlbWUueUF4aXMpO1xuICAgICAgICB4QXhpc0hlaWdodCA9IHRoaXMuX2dldEhvcml6b250YWxBeGlzSGVpZ2h0KHhBeGlzVGl0bGUsIGhMYWJlbHMsIHRoZW1lLnhBeGlzKTtcbiAgICAgICAgeXJBeGlzV2lkdGggPSB0aGlzLl9nZXRZUkF4aXNXaWR0aCh7XG4gICAgICAgICAgICBjb252ZXJ0RGF0YTogY29udmVydERhdGEsXG4gICAgICAgICAgICB5QXhpc0NoYXJ0VHlwZXM6IHlBeGlzQ2hhcnRUeXBlcyxcbiAgICAgICAgICAgIHRoZW1lOiB0aGVtZSxcbiAgICAgICAgICAgIG9wdGlvbnM6IG9wdGlvbnNcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHlBeGlzOiB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IHlBeGlzV2lkdGhcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB5ckF4aXM6IHtcbiAgICAgICAgICAgICAgICB3aWR0aDogeXJBeGlzV2lkdGhcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB4QXhpczoge1xuICAgICAgICAgICAgICAgIGhlaWdodDogeEF4aXNIZWlnaHRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHdpZHRoIG9mIGxlZ2VuZCBhcmVhLlxuICAgICAqIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGpvaW5MZWdlbmRMYWJlbHMgbGVnZW5kIGxhYmVsc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBsYWJlbFRoZW1lIGxhYmVsIHRoZW1lXG4gICAgICogQHJldHVybnMge251bWJlcn0gd2lkdGhcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRMZWdlbmRBcmVhV2lkdGg6IGZ1bmN0aW9uKGpvaW5MZWdlbmRMYWJlbHMsIGxhYmVsVGhlbWUpIHtcbiAgICAgICAgdmFyIGxlZ2VuZExhYmVscyA9IG5lLnV0aWwubWFwKGpvaW5MZWdlbmRMYWJlbHMsIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaXRlbS5sYWJlbDtcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgbWF4TGFiZWxXaWR0aCA9IHRoaXMuX2dldFJlbmRlcmVkTGFiZWxzTWF4V2lkdGgobGVnZW5kTGFiZWxzLCBsYWJlbFRoZW1lKSxcbiAgICAgICAgICAgIGxlZ2VuZFdpZHRoID0gbWF4TGFiZWxXaWR0aCArIExFR0VORF9SRUNUX1dJRFRIICtcbiAgICAgICAgICAgICAgICBMRUdFTkRfTEFCRUxfUEFERElOR19MRUZUICsgKExFR0VORF9BUkVBX1BBRERJTkcgKiAyKTtcbiAgICAgICAgcmV0dXJuIGxlZ2VuZFdpZHRoO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHNlcmllcyBkaW1lbnNpb24uXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IHBhcmFtcy5jaGFydERpbWVuc2lvbiBjaGFydCBkaW1lbnNpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7e1xuICAgICAqICAgICAgICAgIHlBeGlzOiB7d2lkdGg6IG51bWJlciwgaGVpZ2h0Om51bWJlcn0sXG4gICAgICogICAgICAgICAgeEF4aXM6IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6bnVtYmVyfSxcbiAgICAgKiAgICAgICAgICB5ckF4aXM6IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6bnVtYmVyfVxuICAgICAqICAgICAgfX0gcGFyYW1zLmF4ZXNEaW1lbnNpb24gYXhlcyBkaW1lbnNpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubGVnZW5kV2lkdGggbGVnZW5kIHdpZHRoXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnRpdGxlSGVpZ2h0IHRpdGxlIGhlaWdodFxuICAgICAqIEByZXR1cm5zIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBzZXJpZXMgZGltZW5zaW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVNlcmllc0RpbWVuc2lvbjogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBheGVzRGltZW5zaW9uID0gcGFyYW1zLmF4ZXNEaW1lbnNpb24sXG4gICAgICAgICAgICByaWdodEFyZWFXaWR0aCA9IHBhcmFtcy5sZWdlbmRXaWR0aCArIGF4ZXNEaW1lbnNpb24ueXJBeGlzLndpZHRoLFxuICAgICAgICAgICAgd2lkdGggPSBwYXJhbXMuY2hhcnREaW1lbnNpb24ud2lkdGggLSAoQ0hBUlRfUEFERElORyAqIDIpIC0gYXhlc0RpbWVuc2lvbi55QXhpcy53aWR0aCAtIHJpZ2h0QXJlYVdpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0ID0gcGFyYW1zLmNoYXJ0RGltZW5zaW9uLmhlaWdodCAtIChDSEFSVF9QQURESU5HICogMikgLSBwYXJhbXMudGl0bGVIZWlnaHQgLSBheGVzRGltZW5zaW9uLnhBeGlzLmhlaWdodDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogaGVpZ2h0XG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjb21wb25lbnRzIGRpbWVuc2lvblxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5jb252ZXJ0RGF0YSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBjaGFydCB0aGVtZVxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaXNWZXJ0aWNhbCB3aGV0aGVyIHZlcnRpY2FsIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5vcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBjb21wb25lbnRzIGRpbWVuc2lvbnNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRDb21wb25lbnRzRGltZW5zaW9uczogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciB0aGVtZSA9IHBhcmFtcy50aGVtZSxcbiAgICAgICAgICAgIG9wdGlvbnMgPSBwYXJhbXMub3B0aW9ucyxcbiAgICAgICAgICAgIGNvbnZlcnREYXRhID0gcGFyYW1zLmNvbnZlcnREYXRhLFxuICAgICAgICAgICAgY2hhcnRPcHRpb25zID0gb3B0aW9ucy5jaGFydCB8fCB7fSxcbiAgICAgICAgICAgIGNoYXJ0RGltZW5zaW9uID0ge1xuICAgICAgICAgICAgICAgIHdpZHRoOiBjaGFydE9wdGlvbnMud2lkdGggfHwgNTAwLFxuICAgICAgICAgICAgICAgIGhlaWdodDogY2hhcnRPcHRpb25zLmhlaWdodCB8fCA0MDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBheGVzRGltZW5zaW9uLCB0aXRsZUhlaWdodCwgbGVnZW5kV2lkdGgsIHNlcmllc0RpbWVuc2lvbiwgZGltZW5zaW9ucztcblxuICAgICAgICBheGVzRGltZW5zaW9uID0gdGhpcy5fbWFrZUF4ZXNEaW1lbnNpb24ocGFyYW1zKTtcbiAgICAgICAgdGl0bGVIZWlnaHQgPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxIZWlnaHQoY2hhcnRPcHRpb25zLnRpdGxlLCB0aGVtZS50aXRsZSkgKyBUSVRMRV9BRERfUEFERElORztcbiAgICAgICAgbGVnZW5kV2lkdGggPSB0aGlzLl9nZXRMZWdlbmRBcmVhV2lkdGgoY29udmVydERhdGEuam9pbkxlZ2VuZExhYmVscywgdGhlbWUubGVnZW5kLmxhYmVsKTtcbiAgICAgICAgc2VyaWVzRGltZW5zaW9uID0gdGhpcy5fbWFrZVNlcmllc0RpbWVuc2lvbih7XG4gICAgICAgICAgICBjaGFydERpbWVuc2lvbjogY2hhcnREaW1lbnNpb24sXG4gICAgICAgICAgICBheGVzRGltZW5zaW9uOiBheGVzRGltZW5zaW9uLFxuICAgICAgICAgICAgbGVnZW5kV2lkdGg6IGxlZ2VuZFdpZHRoLFxuICAgICAgICAgICAgdGl0bGVIZWlnaHQ6IHRpdGxlSGVpZ2h0XG4gICAgICAgIH0pO1xuICAgICAgICBkaW1lbnNpb25zID0gbmUudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgY2hhcnQ6IGNoYXJ0RGltZW5zaW9uLFxuICAgICAgICAgICAgdGl0bGU6IHtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IHRpdGxlSGVpZ2h0XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGxvdDogc2VyaWVzRGltZW5zaW9uLFxuICAgICAgICAgICAgc2VyaWVzOiBzZXJpZXNEaW1lbnNpb24sXG4gICAgICAgICAgICBsZWdlbmQ6IHtcbiAgICAgICAgICAgICAgICB3aWR0aDogbGVnZW5kV2lkdGhcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0b29sdGlwOiBzZXJpZXNEaW1lbnNpb25cbiAgICAgICAgfSwgYXhlc0RpbWVuc2lvbik7XG4gICAgICAgIHJldHVybiBkaW1lbnNpb25zO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGF4ZXMgYm91bmRzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaGFzQXhlcyB3aGV0aGVyIGhhcyBheGVkIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48c3RyaW5nPn0gcGFyYW1zLnlBeGlzQ2hhcnRUeXBlcyB5IGF4aXMgY2hhcnQgdHlwZXNcbiAgICAgKiAgICAgIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gcGFyYW1zLmRpbWVuc2lvbiBjaGFydCBkaW1lbnNpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMudG9wIHRvcCBwb3NpdGlvblxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5yaWdodCByaWdodCBwb3NpdGlvblxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IGF4ZXMgYm91bmRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUF4ZXNCb3VuZHM6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgYm91bmRzLCBkaW1lbnNpb25zLCB5QXhpc0NoYXJ0VHlwZXMsIHRvcCwgcmlnaHQ7XG5cbiAgICAgICAgaWYgKCFwYXJhbXMuaGFzQXhlcykge1xuICAgICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICB9XG5cbiAgICAgICAgZGltZW5zaW9ucyA9IHBhcmFtcy5kaW1lbnNpb25zO1xuICAgICAgICB5QXhpc0NoYXJ0VHlwZXMgPSBwYXJhbXMueUF4aXNDaGFydFR5cGVzO1xuICAgICAgICB0b3AgPSBwYXJhbXMudG9wO1xuICAgICAgICByaWdodCA9IHBhcmFtcy5yaWdodDtcbiAgICAgICAgYm91bmRzID0ge1xuICAgICAgICAgICAgcGxvdDoge1xuICAgICAgICAgICAgICAgIGRpbWVuc2lvbjogZGltZW5zaW9ucy5wbG90LFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgIHRvcDogdG9wLFxuICAgICAgICAgICAgICAgICAgICByaWdodDogcmlnaHRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgeUF4aXM6IHtcbiAgICAgICAgICAgICAgICBkaW1lbnNpb246IHtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGRpbWVuc2lvbnMueUF4aXMud2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogZGltZW5zaW9ucy5wbG90LmhlaWdodFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgdG9wOiB0b3AsXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IENIQVJUX1BBRERJTkcgKyBISURERU5fV0lEVEhcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgeEF4aXM6IHtcbiAgICAgICAgICAgICAgICBkaW1lbnNpb246IHtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGRpbWVuc2lvbnMucGxvdC53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBkaW1lbnNpb25zLnhBeGlzLmhlaWdodFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgdG9wOiB0b3AgKyBkaW1lbnNpb25zLnBsb3QuaGVpZ2h0IC0gSElEREVOX1dJRFRILFxuICAgICAgICAgICAgICAgICAgICByaWdodDogcmlnaHRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHlBeGlzQ2hhcnRUeXBlcyAmJiB5QXhpc0NoYXJ0VHlwZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBib3VuZHMueXJBeGlzID0ge1xuICAgICAgICAgICAgICAgIGRpbWVuc2lvbjoge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogZGltZW5zaW9ucy55ckF4aXMud2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogZGltZW5zaW9ucy5wbG90LmhlaWdodFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgdG9wOiB0b3AsXG4gICAgICAgICAgICAgICAgICAgIHJpZ2h0OiBkaW1lbnNpb25zLmxlZ2VuZC53aWR0aCArIENIQVJUX1BBRERJTkcgKyBISURERU5fV0lEVEhcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGJvdW5kcztcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGJvdW5kc01ha2VyO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IGNhbGN1bGF0b3IuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBBWElTX1NUQU5EQVJEX01VTFRJUExFX05VTVMgPSBbMSwgMiwgNSwgMTBdO1xuXG52YXIgY2FsY3VsYXRvciA9IHtcbiAgICAvKipcbiAgICAgKiBDYWxjdWxhdGUgc2NhbGUgZnJvbSBjaGFydCBtaW4sIG1heCBkYXRhLlxuICAgICAqICAtIGh0dHA6Ly9wZWx0aWVydGVjaC5jb20vaG93LWV4Y2VsLWNhbGN1bGF0ZXMtYXV0b21hdGljLWNoYXJ0LWF4aXMtbGltaXRzL1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtaW4gbWluIG1pbmltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1heCBtYXggbWF4aW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdGlja0NvdW50IHRpY2sgY291bnRcbiAgICAgKiBAcmV0dXJucyB7e21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19IHNjYWxlIGF4aXMgc2NhbGVcbiAgICAgKi9cbiAgICBjYWxjdWxhdGVTY2FsZTogZnVuY3Rpb24obWluLCBtYXgpIHtcbiAgICAgICAgdmFyIHNhdmVNaW4gPSAwLFxuICAgICAgICAgICAgc2NhbGUgPSB7fSxcbiAgICAgICAgICAgIGlvZFZhbHVlOyAvLyBpbmNyZWFzZSBvciBkZWNyZWFzZSB2YWx1ZTtcblxuICAgICAgICBpZiAobWluIDwgMCkge1xuICAgICAgICAgICAgc2F2ZU1pbiA9IG1pbjtcbiAgICAgICAgICAgIG1heCAtPSBtaW47XG4gICAgICAgICAgICBtaW4gPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgaW9kVmFsdWUgPSAobWF4IC0gbWluKSAvIDIwO1xuICAgICAgICBzY2FsZS5tYXggPSBtYXggKyBpb2RWYWx1ZSArIHNhdmVNaW47XG5cbiAgICAgICAgaWYgKG1heCAvIDYgPiBtaW4pIHtcbiAgICAgICAgICAgIHNjYWxlLm1pbiA9IDAgKyBzYXZlTWluO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2NhbGUubWluID0gbWluIC0gaW9kVmFsdWUgKyBzYXZlTWluO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzY2FsZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbm9ybWFsaXplIG51bWJlci5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgdGFyZ2V0IHZhbHVlXG4gICAgICogQHJldHVybnMge251bWJlcn0gbm9ybWFsaXplZCBudW1iZXJcbiAgICAgKi9cbiAgICBub3JtYWxpemVBeGlzTnVtYmVyOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICB2YXIgc3RhbmRhcmQgPSAwLFxuICAgICAgICAgICAgZmxhZyA9IDEsXG4gICAgICAgICAgICBub3JtYWxpemVkLCBtb2Q7XG5cbiAgICAgICAgaWYgKHZhbHVlID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH0gZWxzZSBpZiAodmFsdWUgPCAwKSB7XG4gICAgICAgICAgICBmbGFnID0gLTE7XG4gICAgICAgIH1cblxuICAgICAgICB2YWx1ZSAqPSBmbGFnO1xuXG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KEFYSVNfU1RBTkRBUkRfTVVMVElQTEVfTlVNUywgZnVuY3Rpb24obnVtKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgPCBudW0pIHtcbiAgICAgICAgICAgICAgICBpZiAobnVtID4gMSkge1xuICAgICAgICAgICAgICAgICAgICBzdGFuZGFyZCA9IG51bTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChudW0gPT09IDEwKSB7XG4gICAgICAgICAgICAgICAgc3RhbmRhcmQgPSAxMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHN0YW5kYXJkIDwgMSkge1xuICAgICAgICAgICAgbm9ybWFsaXplZCA9IHRoaXMubm9ybWFsaXplQXhpc051bWJlcih2YWx1ZSAqIDEwKSAqIDAuMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1vZCA9IG5lLnV0aWwubW9kKHZhbHVlLCBzdGFuZGFyZCk7XG4gICAgICAgICAgICBub3JtYWxpemVkID0gbmUudXRpbC5hZGRpdGlvbih2YWx1ZSwgKG1vZCA+IDAgPyBzdGFuZGFyZCAtIG1vZCA6IDApKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBub3JtYWxpemVkICo9IGZsYWc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIE1ha2UgdGljayBwb3NpdGlvbnMgb2YgcGl4ZWwgdHlwZS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc2l6ZSBhcmVhIHdpZHRoIG9yIGhlaWdodFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjb3VudCB0aWNrIGNvdW50XG4gICAgICogQHJldHVybnMge2FycmF5LjxudW1iZXI+fSBwb3NpdGlvbnNcbiAgICAgKi9cbiAgICBtYWtlUGl4ZWxQb3NpdGlvbnM6IGZ1bmN0aW9uKHNpemUsIGNvdW50KSB7XG4gICAgICAgIHZhciBwb3NpdGlvbnMgPSBbXSxcbiAgICAgICAgICAgIHB4U2NhbGUsIHB4U3RlcDtcblxuICAgICAgICBpZiAoY291bnQgPiAwKSB7XG4gICAgICAgICAgICBweFNjYWxlID0ge21pbjogMCwgbWF4OiBzaXplIC0gMX07XG4gICAgICAgICAgICBweFN0ZXAgPSB0aGlzLmdldFNjYWxlU3RlcChweFNjYWxlLCBjb3VudCk7XG4gICAgICAgICAgICBwb3NpdGlvbnMgPSBuZS51dGlsLm1hcChuZS51dGlsLnJhbmdlKDAsIHNpemUsIHB4U3RlcCksIGZ1bmN0aW9uKHBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdGgucm91bmQocG9zaXRpb24pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBwb3NpdGlvbnNbcG9zaXRpb25zLmxlbmd0aCAtIDFdID0gc2l6ZSAtIDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBvc2l0aW9ucztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBsYWJlbHMgZnJvbSBzY2FsZS5cbiAgICAgKiBAcGFyYW0ge3ttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fSBzY2FsZSBheGlzIHNjYWxlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHN0ZXAgc3RlcCBiZXR3ZWVuIG1heCBhbmQgbWluXG4gICAgICogQHJldHVybnMge3N0cmluZ1tdfSBsYWJlbHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIG1ha2VMYWJlbHNGcm9tU2NhbGU6IGZ1bmN0aW9uKHNjYWxlLCBzdGVwKSB7XG4gICAgICAgIHZhciBtdWx0aXBsZU51bSA9IG5lLnV0aWwuZmluZE11bHRpcGxlTnVtKHN0ZXApLFxuICAgICAgICAgICAgbWluID0gc2NhbGUubWluICogbXVsdGlwbGVOdW0sXG4gICAgICAgICAgICBtYXggPSBzY2FsZS5tYXggKiBtdWx0aXBsZU51bSxcbiAgICAgICAgICAgIGxhYmVscyA9IG5lLnV0aWwucmFuZ2UobWluLCBtYXggKyAxLCBzdGVwICogbXVsdGlwbGVOdW0pO1xuICAgICAgICBsYWJlbHMgPSBuZS51dGlsLm1hcChsYWJlbHMsIGZ1bmN0aW9uKGxhYmVsKSB7XG4gICAgICAgICAgICByZXR1cm4gbGFiZWwgLyBtdWx0aXBsZU51bTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBsYWJlbHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBzY2FsZSBzdGVwLlxuICAgICAqIEBwYXJhbSB7e21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19IHNjYWxlIGF4aXMgc2NhbGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gY291bnQgdmFsdWUgY291bnRcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBzY2FsZSBzdGVwXG4gICAgICovXG4gICAgZ2V0U2NhbGVTdGVwOiBmdW5jdGlvbihzY2FsZSwgY291bnQpIHtcbiAgICAgICAgcmV0dXJuIChzY2FsZS5tYXggLSBzY2FsZS5taW4pIC8gKGNvdW50IC0gMSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFycmF5IHBpdm90LlxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gYXJyMmQgdGFyZ2V0IDJkIGFycmF5XG4gICAgICogQHJldHVybnMge2FycmF5LjxhcnJheT59IHBpdm90ZWQgMmQgYXJyYXlcbiAgICAgKi9cbiAgICBhcnJheVBpdm90OiBmdW5jdGlvbihhcnIyZCkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KGFycjJkLCBmdW5jdGlvbihhcnIpIHtcbiAgICAgICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KGFyciwgZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgaWYgKCFyZXN1bHRbaW5kZXhdKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFtpbmRleF0gPSBbXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVzdWx0W2luZGV4XS5wdXNoKHZhbHVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNhbGN1bGF0b3I7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgRGF0YSBjb252ZXJ0ZXIuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBjYWxjdWxhdG9yID0gcmVxdWlyZSgnLi9jYWxjdWxhdG9yLmpzJyk7XG5cbnZhciBjb25jYXQgPSBBcnJheS5wcm90b3R5cGUuY29uY2F0O1xuXG4vKipcbiAqIERhdGEgY29udmVydGVyLlxuICogQG1vZHVsZSBkYXRhQ29udmVydGVyXG4gKi9cbnZhciBkYXRhQ29udmVydGVyID0ge1xuICAgIC8qKlxuICAgICAqIENvbnZlcnQgdXNlciBkYXRhLlxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gdXNlckRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY2hhcnRPcHRpb25zIGNoYXJ0IG9wdGlvblxuICAgICAqIEByZXR1cm5zIHt7XG4gICAgICogICAgICBsYWJlbHM6IGFycmF5LjxzdHJpbmc+LFxuICAgICAqICAgICAgdmFsdWVzOiBhcnJheS48bnVtYmVyPixcbiAgICAgKiAgICAgIGxlZ2VuZExhYmVsczogYXJyYXkuPHN0cmluZz4sXG4gICAgICogICAgICBmb3JtYXRGdW5jdGlvbnM6IGFycmF5LjxmdW5jdGlvbj4sXG4gICAgICogICAgICBmb3JtYXR0ZWRWYWx1ZXM6IGFycmF5LjxzdHJpbmc+XG4gICAgICogfX0gY29udmVydGVkIGRhdGFcbiAgICAgKi9cbiAgICBjb252ZXJ0OiBmdW5jdGlvbih1c2VyRGF0YSwgY2hhcnRPcHRpb25zLCBjaGFydFR5cGUpIHtcbiAgICAgICAgdmFyIGxhYmVscyA9IHVzZXJEYXRhLmNhdGVnb3JpZXMsXG4gICAgICAgICAgICBzZXJpZXNEYXRhID0gdXNlckRhdGEuc2VyaWVzLFxuICAgICAgICAgICAgdmFsdWVzID0gdGhpcy5fcGlja1ZhbHVlcyhzZXJpZXNEYXRhKSxcbiAgICAgICAgICAgIGpvaW5WYWx1ZXMgPSB0aGlzLl9qb2luVmFsdWVzKHZhbHVlcyksXG4gICAgICAgICAgICBsZWdlbmRMYWJlbHMgPSB0aGlzLl9waWNrTGVnZW5kTGFiZWxzKHNlcmllc0RhdGEpLFxuICAgICAgICAgICAgam9pbkxlZ2VuZExhYmVscyA9IHRoaXMuX2pvaW5MZWdlbmRMYWJlbHMobGVnZW5kTGFiZWxzLCBjaGFydFR5cGUpLFxuICAgICAgICAgICAgZm9ybWF0ID0gY2hhcnRPcHRpb25zICYmIGNoYXJ0T3B0aW9ucy5mb3JtYXQgfHwgJycsXG4gICAgICAgICAgICBmb3JtYXRGdW5jdGlvbnMgPSB0aGlzLl9maW5kRm9ybWF0RnVuY3Rpb25zKGZvcm1hdCksXG4gICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXMgPSBmb3JtYXQgPyB0aGlzLl9mb3JtYXRWYWx1ZXModmFsdWVzLCBmb3JtYXRGdW5jdGlvbnMpIDogdmFsdWVzO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbGFiZWxzOiBsYWJlbHMsXG4gICAgICAgICAgICB2YWx1ZXM6IHZhbHVlcyxcbiAgICAgICAgICAgIGpvaW5WYWx1ZXM6IGpvaW5WYWx1ZXMsXG4gICAgICAgICAgICBsZWdlbmRMYWJlbHM6IGxlZ2VuZExhYmVscyxcbiAgICAgICAgICAgIGpvaW5MZWdlbmRMYWJlbHM6IGpvaW5MZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICBmb3JtYXRGdW5jdGlvbnM6IGZvcm1hdEZ1bmN0aW9ucyxcbiAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlczogZm9ybWF0dGVkVmFsdWVzXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNlcGFyYXRlIGxhYmVsLlxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5LjxhcnJheT4+fSB1c2VyRGF0YSB1c2VyIGRhdGFcbiAgICAgKiBAcmV0dXJucyB7e2xhYmVsczogKGFycmF5LjxzdHJpbmc+KSwgc291cmNlRGF0YTogYXJyYXkuPGFycmF5LjxhcnJheT4+fX0gcmVzdWx0IGRhdGFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXBhcmF0ZUxhYmVsOiBmdW5jdGlvbih1c2VyRGF0YSkge1xuICAgICAgICB2YXIgbGFiZWxzID0gdXNlckRhdGFbMF0ucG9wKCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsYWJlbHM6IGxhYmVscyxcbiAgICAgICAgICAgIHNvdXJjZURhdGE6IHVzZXJEYXRhXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFBpY2sgdmFsdWUuXG4gICAgICogQHBhcmFtIHthcnJheX0gaXRlbXMgaXRlbXNcbiAgICAgKiBAcmV0dXJucyB7YXJyYXl9IHBpY2tlZCB2YWx1ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3BpY2tWYWx1ZTogZnVuY3Rpb24oaXRlbXMpIHtcbiAgICAgICAgcmV0dXJuIFtdLmNvbmNhdChpdGVtcy5kYXRhKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUGljayB2YWx1ZXMgZnJvbSBheGlzIGRhdGEuXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXk+fSBzZXJpZXNEYXRhIHNlcmllcyBkYXRhXG4gICAgICogQHJldHVybnMge3N0cmluZ1tdfSB2YWx1ZXNcbiAgICAgKi9cbiAgICBfcGlja1ZhbHVlczogZnVuY3Rpb24oc2VyaWVzRGF0YSkge1xuICAgICAgICB2YXIgdmFsdWVzLCByZXN1bHQ7XG4gICAgICAgIGlmIChuZS51dGlsLmlzQXJyYXkoc2VyaWVzRGF0YSkpIHtcbiAgICAgICAgICAgIHZhbHVlcyA9IG5lLnV0aWwubWFwKHNlcmllc0RhdGEsIHRoaXMuX3BpY2tWYWx1ZSwgdGhpcyk7XG4gICAgICAgICAgICByZXN1bHQgPSBjYWxjdWxhdG9yLmFycmF5UGl2b3QodmFsdWVzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHt9O1xuICAgICAgICAgICAgbmUudXRpbC5mb3JFYWNoKHNlcmllc0RhdGEsIGZ1bmN0aW9uKGdyb3VwVmFsdWVzLCB0eXBlKSB7XG4gICAgICAgICAgICAgICAgdmFsdWVzID0gbmUudXRpbC5tYXAoZ3JvdXBWYWx1ZXMsIHRoaXMuX3BpY2tWYWx1ZSwgdGhpcyk7XG4gICAgICAgICAgICAgICAgcmVzdWx0W3R5cGVdID0gY2FsY3VsYXRvci5hcnJheVBpdm90KHZhbHVlcyk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBfam9pblZhbHVlczogZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgIHZhciBqb2luVmFsdWVzO1xuXG4gICAgICAgIGlmIChuZS51dGlsLmlzQXJyYXkodmFsdWVzKSkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlcztcbiAgICAgICAgfVxuXG4gICAgICAgIGpvaW5WYWx1ZXMgPSBuZS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uKGdyb3VwVmFsdWVzKSB7XG4gICAgICAgICAgICByZXR1cm4gZ3JvdXBWYWx1ZXM7XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIHJldHVybiBjb25jYXQuYXBwbHkoW10sIGpvaW5WYWx1ZXMpO1xuICAgIH0sXG5cbiAgICBfcGlja0xlZ2VuZExhYmVsOiBmdW5jdGlvbihpdGVtcykge1xuICAgICAgICByZXR1cm4gaXRlbXMubmFtZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUGljayBsZWdlbmQgbGFiZWxzIGZyb20gYXhpcyBkYXRhLlxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gc2VyaWVzRGF0YSBzZXJpZXMgZGF0YVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmdbXX0gbGFiZWxzXG4gICAgICovXG4gICAgX3BpY2tMZWdlbmRMYWJlbHM6IGZ1bmN0aW9uKHNlcmllc0RhdGEpIHtcbiAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgaWYgKG5lLnV0aWwuaXNBcnJheShzZXJpZXNEYXRhKSkge1xuICAgICAgICAgICAgcmVzdWx0ID0gbmUudXRpbC5tYXAoc2VyaWVzRGF0YSwgdGhpcy5fcGlja0xlZ2VuZExhYmVsLCB0aGlzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHt9O1xuICAgICAgICAgICAgbmUudXRpbC5mb3JFYWNoKHNlcmllc0RhdGEsIGZ1bmN0aW9uKGdyb3VwVmFsdWVzLCB0eXBlKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W3R5cGVdID0gbmUudXRpbC5tYXAoZ3JvdXBWYWx1ZXMsIHRoaXMuX3BpY2tMZWdlbmRMYWJlbCwgdGhpcyk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBfam9pbkxlZ2VuZExhYmVsczogZnVuY3Rpb24obGVnZW5kTGFiZWxzLCBjaGFydFR5cGUpIHtcbiAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgaWYgKG5lLnV0aWwuaXNBcnJheShsZWdlbmRMYWJlbHMpKSB7XG4gICAgICAgICAgICByZXN1bHQgPSBuZS51dGlsLm1hcChsZWdlbmRMYWJlbHMsIGZ1bmN0aW9uKGxhYmVsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgY2hhcnRUeXBlOiBjaGFydFR5cGUsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiBsYWJlbFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IG5lLnV0aWwubWFwKGxlZ2VuZExhYmVscywgZnVuY3Rpb24obGFiZWxzLCBfY2hhcnRUeXBlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwubWFwKGxhYmVscywgZnVuY3Rpb24obGFiZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0VHlwZTogX2NoYXJ0VHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBsYWJlbFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgICAgICByZXN1bHQgPSBjb25jYXQuYXBwbHkoW10sIHJlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gZm9ybWF0IGdyb3VwIHZhbHVlcy5cbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheT59IGdyb3VwVmFsdWVzIGdyb3VwIHZhbHVlc1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb25bXX0gZm9ybWF0RnVuY3Rpb25zIGZvcm1hdCBmdW5jdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nW119IGZvcm1hdHRlZCB2YWx1ZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9mb3JtYXRHcm91cFZhbHVlczogZnVuY3Rpb24oZ3JvdXBWYWx1ZXMsIGZvcm1hdEZ1bmN0aW9ucykge1xuICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAoZ3JvdXBWYWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICB2YXIgZm5zID0gW3ZhbHVlXS5jb25jYXQoZm9ybWF0RnVuY3Rpb25zKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmUudXRpbC5yZWR1Y2UoZm5zLCBmdW5jdGlvbihzdG9yZWQsIGZuKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmbihzdG9yZWQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBmb3JtYXQgY29udmVydGVkIHZhbHVlcy5cbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheT59IGNoYXJ0VmFsdWVzIGNoYXJ0IHZhbHVlc1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb25bXX0gZm9ybWF0RnVuY3Rpb25zIGZvcm1hdCBmdW5jdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nW119IGZvcm1hdHRlZCB2YWx1ZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9mb3JtYXRWYWx1ZXM6IGZ1bmN0aW9uKGNoYXJ0VmFsdWVzLCBmb3JtYXRGdW5jdGlvbnMpIHtcbiAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgaWYgKG5lLnV0aWwuaXNBcnJheShjaGFydFZhbHVlcykpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuX2Zvcm1hdEdyb3VwVmFsdWVzKGNoYXJ0VmFsdWVzLCBmb3JtYXRGdW5jdGlvbnMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0ID0ge307XG4gICAgICAgICAgICBuZS51dGlsLmZvckVhY2goY2hhcnRWYWx1ZXMsIGZ1bmN0aW9uKGdyb3VwVmFsdWVzLCBjaGFydFR5cGUpIHtcbiAgICAgICAgICAgICAgICByZXN1bHRbY2hhcnRUeXBlXSA9IHRoaXMuX2Zvcm1hdEdyb3VwVmFsdWVzKGdyb3VwVmFsdWVzLCBmb3JtYXRGdW5jdGlvbnMpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUGljayBtYXggbGVuZ3RoIHVuZGVyIHBvaW50LlxuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IHZhbHVlcyBjaGFydCB2YWx1ZXNcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBtYXggbGVuZ3RoIHVuZGVyIHBvaW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcGlja01heExlblVuZGVyUG9pbnQ6IGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICB2YXIgbWF4ID0gMDtcblxuICAgICAgICBuZS51dGlsLmZvckVhY2hBcnJheSh2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgbGVuID0gbmUudXRpbC5sZW5ndGhBZnRlclBvaW50KHZhbHVlKTtcbiAgICAgICAgICAgIGlmIChsZW4gPiBtYXgpIHtcbiAgICAgICAgICAgICAgICBtYXggPSBsZW47XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIHJldHVybiBtYXg7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgemVybyBmaWxsIGZvcm1hdCBvciBub3QuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZvcm1hdCBmb3JtYXRcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gcmVzdWx0IGJvb2xlYW5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc1plcm9GaWxsOiBmdW5jdGlvbihmb3JtYXQpIHtcbiAgICAgICAgcmV0dXJuIGZvcm1hdC5sZW5ndGggPiAyICYmIGZvcm1hdC5jaGFyQXQoMCkgPT09ICcwJztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciBkZWNpbWFsIGZvcm1hdCBvciBub3QuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZvcm1hdCBmb3JtYXRcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gcmVzdWx0IGJvb2xlYW5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc0RlY2ltYWw6IGZ1bmN0aW9uKGZvcm1hdCkge1xuICAgICAgICB2YXIgaW5kZXhPZiA9IGZvcm1hdC5pbmRleE9mKCcuJyk7XG4gICAgICAgIHJldHVybiBpbmRleE9mID4gLTEgJiYgaW5kZXhPZiA8IGZvcm1hdC5sZW5ndGggLSAxO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIGNvbW1hIGZvcm1hdCBvciBub3QuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZvcm1hdCBmb3JtYXRcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gcmVzdWx0IGJvb2xlYW5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc0NvbW1hOiBmdW5jdGlvbihmb3JtYXQpIHtcbiAgICAgICAgcmV0dXJuIGZvcm1hdC5pbmRleE9mKCcsJykgPT09IGZvcm1hdC5zcGxpdCgnLicpWzBdLmxlbmd0aCAtIDQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZvcm1hdCB6ZXJvIGZpbGwuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGxlbiBsZW5ndGggb2YgcmVzdWx0XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlIHRhcmdldCB2YWx1ZVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGZvcm1hdHRlZCB2YWx1ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2Zvcm1hdFplcm9GaWxsOiBmdW5jdGlvbihsZW4sIHZhbHVlKSB7XG4gICAgICAgIHZhciB6ZXJvID0gJzAnO1xuXG4gICAgICAgIHZhbHVlICs9ICcnO1xuXG4gICAgICAgIGlmICh2YWx1ZS5sZW5ndGggPj0gbGVuKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICB3aGlsZSAodmFsdWUubGVuZ3RoIDwgbGVuKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHplcm8gKyB2YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRm9ybWF0IERlY2ltYWwuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGxlbiBsZW5ndGggb2YgdW5kZXIgZGVjaW1hbCBwb2ludFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSB0YXJnZXQgdmFsdWVcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBmb3JtYXR0ZWQgdmFsdWVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9mb3JtYXREZWNpbWFsOiBmdW5jdGlvbihsZW4sIHZhbHVlKSB7XG4gICAgICAgIHZhciBwb3c7XG5cbiAgICAgICAgaWYgKGxlbiA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIE1hdGgucm91bmQodmFsdWUsIDEwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHBvdyA9IE1hdGgucG93KDEwLCBsZW4pO1xuICAgICAgICB2YWx1ZSA9IE1hdGgucm91bmQodmFsdWUgKiBwb3cpIC8gcG93O1xuICAgICAgICB2YWx1ZSA9IHBhcnNlRmxvYXQodmFsdWUpLnRvRml4ZWQobGVuKTtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGb3JtYXQgQ29tbWEuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlIHRhcmdldCB2YWx1ZVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGZvcm1hdHRlZCB2YWx1ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2Zvcm1hdENvbW1hOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICB2YXIgY29tbWEgPSAnLCcsXG4gICAgICAgICAgICB1bmRlclBvaW50VmFsdWUgPSAnJyxcbiAgICAgICAgICAgIHZhbHVlcztcblxuICAgICAgICB2YWx1ZSArPSAnJztcblxuICAgICAgICBpZiAodmFsdWUuaW5kZXhPZignLicpID4gLTEpIHtcbiAgICAgICAgICAgIHZhbHVlcyA9IHZhbHVlLnNwbGl0KCcuJyk7XG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlc1swXTtcbiAgICAgICAgICAgIHVuZGVyUG9pbnRWYWx1ZSA9ICcuJyArIHZhbHVlc1sxXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh2YWx1ZS5sZW5ndGggPCA0KSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUgKyB1bmRlclBvaW50VmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICB2YWx1ZXMgPSAodmFsdWUpLnNwbGl0KCcnKS5yZXZlcnNlKCk7XG4gICAgICAgIHZhbHVlcyA9IG5lLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24oY2hhciwgaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBbY2hhcl07XG4gICAgICAgICAgICBpZiAoKGluZGV4ICsgMSkgJSAzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goY29tbWEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGNvbmNhdC5hcHBseShbXSwgdmFsdWVzKS5yZXZlcnNlKCkuam9pbignJykgKyB1bmRlclBvaW50VmFsdWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZpbmQgZm9ybWF0IGZ1bmN0aW9ucy5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZm9ybWF0IGZvcm1hdFxuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IHZhbHVlcyBjaGFydCB2YWx1ZXNcbiAgICAgKiBAcmV0dXJucyB7ZnVuY3Rpb25bXX0gZnVuY3Rpb25zXG4gICAgICovXG4gICAgX2ZpbmRGb3JtYXRGdW5jdGlvbnM6IGZ1bmN0aW9uKGZvcm1hdCkge1xuICAgICAgICB2YXIgZnVuY3MgPSBbXSxcbiAgICAgICAgICAgIGxlbjtcblxuICAgICAgICBpZiAoIWZvcm1hdCkge1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2lzRGVjaW1hbChmb3JtYXQpKSB7XG4gICAgICAgICAgICBsZW4gPSB0aGlzLl9waWNrTWF4TGVuVW5kZXJQb2ludChbZm9ybWF0XSk7XG4gICAgICAgICAgICBmdW5jcyA9IFtuZS51dGlsLmJpbmQodGhpcy5fZm9ybWF0RGVjaW1hbCwgdGhpcywgbGVuKV07XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5faXNaZXJvRmlsbChmb3JtYXQpKSB7XG4gICAgICAgICAgICBsZW4gPSBmb3JtYXQubGVuZ3RoO1xuICAgICAgICAgICAgZnVuY3MgPSBbbmUudXRpbC5iaW5kKHRoaXMuX2Zvcm1hdFplcm9GaWxsLCB0aGlzLCBsZW4pXTtcbiAgICAgICAgICAgIHJldHVybiBmdW5jcztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9pc0NvbW1hKGZvcm1hdCkpIHtcbiAgICAgICAgICAgIGZ1bmNzLnB1c2godGhpcy5fZm9ybWF0Q29tbWEpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZ1bmNzO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZGF0YUNvbnZlcnRlcjtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBET00gSGFuZGxlci5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBET00gSGFuZGxlci5cbiAqIEBtb2R1bGUgZG9tSGFuZGxlclxuICovXG52YXIgZG9tSGFuZGxlciA9IHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgZWxlbWVudC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRvbUhhbmRsZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGFnIGh0bWwgdGFnXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5ld0NsYXNzIGNsYXNzIG5hbWVcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IGNyZWF0ZWQgZWxlbWVudFxuICAgICAqL1xuICAgIGNyZWF0ZTogZnVuY3Rpb24odGFnLCBuZXdDbGFzcykge1xuICAgICAgICB2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZyk7XG5cbiAgICAgICAgaWYgKG5ld0NsYXNzKSB7XG4gICAgICAgICAgICB0aGlzLmFkZENsYXNzKGVsLCBuZXdDbGFzcyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjbGFzcyBuYW1lcy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRvbUhhbmRsZXJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqIEByZXR1cm5zIHthcnJheX0gbmFtZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRDbGFzc05hbWVzOiBmdW5jdGlvbihlbCkge1xuICAgICAgICB2YXIgY2xhc3NOYW1lID0gZWwuY2xhc3NOYW1lID8gZWwuY2xhc3NOYW1lIDogJycsXG4gICAgICAgICAgICBjbGFzc05hbWVzID0gY2xhc3NOYW1lID8gY2xhc3NOYW1lLnNwbGl0KCcgJykgOiBbXTtcbiAgICAgICAgcmV0dXJuIGNsYXNzTmFtZXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZCBjc3MgY2xhc3MgdG8gdGFyZ2V0IGVsZW1lbnQuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkb21IYW5kbGVyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmV3Q2xhc3MgYWRkIGNsYXNzIG5hbWVcbiAgICAgKi9cbiAgICBhZGRDbGFzczogZnVuY3Rpb24oZWwsIG5ld0NsYXNzKSB7XG4gICAgICAgIHZhciBjbGFzc05hbWVzID0gdGhpcy5fZ2V0Q2xhc3NOYW1lcyhlbCksXG4gICAgICAgICAgICBpbmRleCA9IG5lLnV0aWwuaW5BcnJheShuZXdDbGFzcywgY2xhc3NOYW1lcyk7XG5cbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNsYXNzTmFtZXMucHVzaChuZXdDbGFzcyk7XG4gICAgICAgIGVsLmNsYXNzTmFtZSA9IGNsYXNzTmFtZXMuam9pbignICcpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgY3NzIGNsYXNzIGZyb20gdGFyZ2V0IGVsZW1lbnQuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkb21IYW5kbGVyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcm1DbGFzcyByZW1vdmUgY2xhc3MgbmFtZVxuICAgICAqL1xuICAgIHJlbW92ZUNsYXNzOiBmdW5jdGlvbihlbCwgcm1DbGFzcykge1xuICAgICAgICB2YXIgY2xhc3NOYW1lcyA9IHRoaXMuX2dldENsYXNzTmFtZXMoZWwpLFxuICAgICAgICAgICAgaW5kZXggPSBuZS51dGlsLmluQXJyYXkocm1DbGFzcywgY2xhc3NOYW1lcyk7XG5cbiAgICAgICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY2xhc3NOYW1lcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICBlbC5jbGFzc05hbWUgPSBjbGFzc05hbWVzLmpvaW4oJyAnKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciBjbGFzcyBleGlzdCBvciBub3QuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkb21IYW5kbGVyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZmluZENsYXNzIHRhcmdldCBjc3MgY2xhc3NcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gaGFzIGNsYXNzXG4gICAgICovXG4gICAgaGFzQ2xhc3M6IGZ1bmN0aW9uKGVsLCBmaW5kQ2xhc3MpIHtcbiAgICAgICAgdmFyIGNsYXNzTmFtZXMgPSB0aGlzLl9nZXRDbGFzc05hbWVzKGVsKSxcbiAgICAgICAgICAgIGluZGV4ID0gbmUudXRpbC5pbkFycmF5KGZpbmRDbGFzcywgY2xhc3NOYW1lcyk7XG4gICAgICAgIHJldHVybiBpbmRleCA+IC0xO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGaW5kIHBhcmVudCBieSBjbGFzcyBuYW1lLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZG9tSGFuZGxlclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNsYXNzTmFtZSB0YXJnZXQgY3NzIGNsYXNzXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGxhc3RDbGFzcyBsYXN0IGNzcyBjbGFzc1xuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gcmVzdWx0IGVsZW1lbnRcbiAgICAgKi9cbiAgICBmaW5kUGFyZW50QnlDbGFzczogZnVuY3Rpb24oZWwsIGNsYXNzTmFtZSwgbGFzdENsYXNzKSB7XG4gICAgICAgIHZhciBwYXJlbnQgPSBlbC5wYXJlbnROb2RlO1xuICAgICAgICBpZiAoIXBhcmVudCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5oYXNDbGFzcyhwYXJlbnQsIGNsYXNzTmFtZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBwYXJlbnQ7XG4gICAgICAgIH0gZWxzZSBpZiAocGFyZW50Lm5vZGVOYW1lID09PSAnQk9EWScgfHwgdGhpcy5oYXNDbGFzcyhwYXJlbnQsIGxhc3RDbGFzcykpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmluZFBhcmVudEJ5Q2xhc3MocGFyZW50LCBjbGFzc05hbWUsIGxhc3RDbGFzcyk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXBwZW5kIGNoaWxkIGVsZW1lbnQuXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNvbnRhaW5lciBlbGVtZW50XG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY2hpbGRyZW4gY2hpbGQgZWxlbWVudFxuICAgICAqL1xuICAgIGFwcGVuZDogZnVuY3Rpb24oY29udGFpbmVyLCBjaGlsZHJlbikge1xuICAgICAgICBpZiAoIWNvbnRhaW5lciB8fCAhY2hpbGRyZW4pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjaGlsZHJlbiA9IG5lLnV0aWwuaXNBcnJheShjaGlsZHJlbikgPyBjaGlsZHJlbiA6IFtjaGlsZHJlbl07XG5cbiAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkoY2hpbGRyZW4sIGZ1bmN0aW9uKGNoaWxkKSB7XG4gICAgICAgICAgICBpZiAoIWNoaWxkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGNoaWxkKTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBkb21IYW5kbGVyO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEV2ZW50IGxpc3RlbmVyLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEV2ZW50IGxpc3RlbmVyLlxuICogQG1vZHVsZSBldmVudExpc3RlbmVyXG4gKi9cbnZhciBldmVudExpc3RlbmVyID0ge1xuICAgIC8qKlxuICAgICAqIEV2ZW50IGxpc3RlbmVyIGZvciBJRS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmV2ZW50TGlzdGVuZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lIGV2ZW50IG5hbWVcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYXR0YWNoRXZlbnQ6IGZ1bmN0aW9uIChldmVudE5hbWUsIGVsLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09IFwib2JqZWN0XCIgJiYgY2FsbGJhY2suaGFuZGxlRXZlbnQpIHtcbiAgICAgICAgICAgIGVsLmF0dGFjaEV2ZW50KFwib25cIiArIGV2ZW50TmFtZSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrLmhhbmRsZUV2ZW50LmNhbGwoY2FsbGJhY2spO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbC5hdHRhY2hFdmVudChcIm9uXCIgKyBldmVudE5hbWUsIGNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFdmVudCBsaXN0ZW5lciBmb3Igb3RoZXIgYnJvd3NlcnMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpldmVudExpc3RlbmVyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZSBldmVudCBuYW1lXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayBjYWxsYmFjayBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2FkZEV2ZW50TGlzdGVuZXI6IGZ1bmN0aW9uIChldmVudE5hbWUsIGVsLCBjYWxsYmFjaykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGNhbGxiYWNrKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PSBcIm9iamVjdFwiICYmIGNhbGxiYWNrLmhhbmRsZUV2ZW50KSB7XG4gICAgICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5oYW5kbGVFdmVudC5jYWxsKGNhbGxiYWNrLCBldmVudCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEJpbmQgZXZlbnQgZnVuY3Rpb24uXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpldmVudExpc3RlbmVyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZSBldmVudCBuYW1lXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayBjYWxsYmFjayBmdW5jdGlvblxuICAgICAqL1xuICAgIGJpbmRFdmVudDogZnVuY3Rpb24gKGV2ZW50TmFtZSwgZWwsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBiaW5kRXZlbnQ7XG4gICAgICAgIGlmIChcImFkZEV2ZW50TGlzdGVuZXJcIiBpbiBlbCkge1xuICAgICAgICAgICAgYmluZEV2ZW50ID0gdGhpcy5fYWRkRXZlbnRMaXN0ZW5lcjtcbiAgICAgICAgfSBlbHNlIGlmIChcImF0dGFjaEV2ZW50XCIgaW4gZWwpIHtcbiAgICAgICAgICAgIGJpbmRFdmVudCA9IHRoaXMuX2F0dGFjaEV2ZW50O1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYmluZEV2ZW50ID0gYmluZEV2ZW50O1xuICAgICAgICBiaW5kRXZlbnQoZXZlbnROYW1lLCBlbCwgY2FsbGJhY2spO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXZlbnRMaXN0ZW5lcjtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBSZW5kZXJVdGlsLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZG9tID0gcmVxdWlyZSgnLi9kb21IYW5kbGVyJyksXG4gICAgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4vLi4vY29uc3QuanMnKTtcblxudmFyIGJyb3dzZXIgPSBuZS51dGlsLmJyb3dzZXIsXG4gICAgaXNJRTggPSBicm93c2VyLm1zaWUgJiYgYnJvd3Nlci52ZXJzaW9uID09PSA4O1xuXG52YXIgcmVuZGVyVXRpbCA9IHtcbiAgICAvKipcbiAgICAgKiBDb25jYXQgc3RyaW5nXG4gICAgICogQHBhcmFtcyB7Li4uc3RyaW5nfSB0YXJnZXQgc3RyaW5nc1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGNvbmNhdCBzdHJpbmdcbiAgICAgKi9cbiAgICBjb25jYXRTdHI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gU3RyaW5nLnByb3RvdHlwZS5jb25jYXQuYXBwbHkoJycsIGFyZ3VtZW50cyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgY3NzVGV4dCBmb3IgZm9udC5cbiAgICAgKiBAcGFyYW0ge3tmb250U2l6ZTogbnVtYmVyLCBmb250RmFtaWx5OiBzdHJpbmcsIGNvbG9yOiBzdHJpbmd9fSB0aGVtZSBmb250IHRoZW1lXG4gICAgICogQHJldHVybnMge3N0cmluZ30gY3NzVGV4dFxuICAgICAqL1xuICAgIG1ha2VGb250Q3NzVGV4dDogZnVuY3Rpb24odGhlbWUpIHtcbiAgICAgICAgdmFyIGNzc1RleHRzID0gW107XG5cbiAgICAgICAgaWYgKCF0aGVtZSkge1xuICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoZW1lLmZvbnRTaXplKSB7XG4gICAgICAgICAgICBjc3NUZXh0cy5wdXNoKHRoaXMuY29uY2F0U3RyKCdmb250LXNpemU6JywgdGhlbWUuZm9udFNpemUsICdweCcpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGVtZS5mb250RmFtaWx5KSB7XG4gICAgICAgICAgICBjc3NUZXh0cy5wdXNoKHRoaXMuY29uY2F0U3RyKCdmb250LWZhbWlseTonLCB0aGVtZS5mb250RmFtaWx5KSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhlbWUuY29sb3IpIHtcbiAgICAgICAgICAgIGNzc1RleHRzLnB1c2godGhpcy5jb25jYXRTdHIoJ2NvbG9yOicsIHRoZW1lLmNvbG9yKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY3NzVGV4dHMuam9pbignOycpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgZWxlbWVudCBmb3Igc2l6ZSBjaGVjay5cbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jcmVhdGVTaXplQ2hlY2tFbDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBlbERpdiA9IGRvbS5jcmVhdGUoJ0RJVicpLFxuICAgICAgICAgICAgZWxTcGFuID0gZG9tLmNyZWF0ZSgnU1BBTicpO1xuXG4gICAgICAgIGVsRGl2LmFwcGVuZENoaWxkKGVsU3Bhbik7XG4gICAgICAgIGVsRGl2LnN0eWxlLmNzc1RleHQgPSAncG9zaXRpb246cmVsYXRpdmU7dG9wOjEwMDAwcHg7bGVmdDoxMDAwMHB4O2xpbmUtaGVpZ2h0OjEnO1xuICAgICAgICByZXR1cm4gZWxEaXY7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCByZW5kZXJlZCBsYWJlbCBzaXplICh3aWR0aCBvciBoZWlnaHQpLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBsYWJlbCBsYWJlbFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSB0aGVtZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwcm9wZXJ0eSBlbGVtZW50IHByb3BlcnR5XG4gICAgICogQHJldHVybnMge251bWJlcn0gc2l6ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFJlbmRlcmVkTGFiZWxTaXplOiBmdW5jdGlvbihsYWJlbCwgdGhlbWUsIHByb3BlcnR5KSB7XG4gICAgICAgIHZhciBlbERpdiA9IHRoaXMuX2NyZWF0ZVNpemVDaGVja0VsKCksXG4gICAgICAgICAgICBlbFNwYW4gPSBlbERpdi5maXJzdENoaWxkLFxuICAgICAgICAgICAgbGFiZWxTaXplO1xuXG4gICAgICAgIHRoZW1lID0gdGhlbWUgfHwge307XG4gICAgICAgIGVsU3Bhbi5pbm5lckhUTUwgPSBsYWJlbDtcbiAgICAgICAgZWxTcGFuLnN0eWxlLmZvbnRTaXplID0gKHRoZW1lLmZvbnRTaXplIHx8IGNoYXJ0Q29uc3QuREVGQVVMVF9MQUJFTF9GT05UX1NJWkUpICsgJ3B4JztcblxuICAgICAgICBpZiAodGhlbWUuZm9udEZhbWlseSkge1xuICAgICAgICAgICAgZWxTcGFuLnN0eWxlLmZvbnRGYW1pbHkgPSB0aGVtZS5mb250RmFtaWx5O1xuICAgICAgICB9XG5cbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChlbERpdik7XG4gICAgICAgIGxhYmVsU2l6ZSA9IGVsU3Bhbltwcm9wZXJ0eV07XG4gICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoZWxEaXYpO1xuICAgICAgICByZXR1cm4gbGFiZWxTaXplO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgcmVuZGVyZWQgbGFiZWwgd2lkdGguXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGxhYmVsIGxhYmVsXG4gICAgICogQHBhcmFtIHt7Zm9udFNpemU6IG51bWJlciwgZm9udEZhbWlseTogc3RyaW5nLCBjb2xvcjogc3RyaW5nfX0gdGhlbWUgbGFiZWwgdGhlbWVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSB3aWR0aFxuICAgICAqL1xuICAgIGdldFJlbmRlcmVkTGFiZWxXaWR0aDogZnVuY3Rpb24obGFiZWwsIHRoZW1lKSB7XG4gICAgICAgIHZhciBsYWJlbFdpZHRoID0gdGhpcy5fZ2V0UmVuZGVyZWRMYWJlbFNpemUobGFiZWwsIHRoZW1lLCAnb2Zmc2V0V2lkdGgnKTtcbiAgICAgICAgcmV0dXJuIGxhYmVsV2lkdGg7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCByZW5kZXJlZCBsYWJlbCBoZWlnaHQuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGxhYmVsIGxhYmVsXG4gICAgICogQHBhcmFtIHt7Zm9udFNpemU6IG51bWJlciwgZm9udEZhbWlseTogc3RyaW5nLCBjb2xvcjogc3RyaW5nfX0gdGhlbWUgbGFiZWwgdGhlbWVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBoZWlnaHRcbiAgICAgKi9cbiAgICBnZXRSZW5kZXJlZExhYmVsSGVpZ2h0OiBmdW5jdGlvbihsYWJlbCwgdGhlbWUpIHtcbiAgICAgICAgdmFyIGxhYmVsSGVpZ2h0ID0gdGhpcy5fZ2V0UmVuZGVyZWRMYWJlbFNpemUobGFiZWwsIHRoZW1lLCAnb2Zmc2V0SGVpZ2h0Jyk7XG4gICAgICAgIHJldHVybiBsYWJlbEhlaWdodDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyZXIgZGltZW5zaW9uXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGRpbWVuc2lvbiBkaW1lbnNpb25cbiAgICAgKi9cbiAgICByZW5kZXJEaW1lbnNpb246IGZ1bmN0aW9uKGVsLCBkaW1lbnNpb24pIHtcbiAgICAgICAgZWwuc3R5bGUuY3NzVGV4dCA9IFtcbiAgICAgICAgICAgIHRoaXMuY29uY2F0U3RyKCd3aWR0aDonLCBkaW1lbnNpb24ud2lkdGgsICdweCcpLFxuICAgICAgICAgICAgdGhpcy5jb25jYXRTdHIoJ2hlaWdodDonLCBkaW1lbnNpb24uaGVpZ2h0LCAncHgnKVxuICAgICAgICBdLmpvaW4oJzsnKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIHBvc2l0aW9uKHRvcCwgcmlnaHQpXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3t0b3A6IG51bWJlciwgbGVmdDogbnVtYmVyLCByaWdodDogbnVtYmVyfX0gcG9zaXRpb24gcG9zaXRpb25cbiAgICAgKi9cbiAgICByZW5kZXJQb3NpdGlvbjogZnVuY3Rpb24oZWwsIHBvc2l0aW9uKSB7XG4gICAgICAgIGlmIChuZS51dGlsLmlzVW5kZWZpbmVkKHBvc2l0aW9uKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBvc2l0aW9uLnRvcCkge1xuICAgICAgICAgICAgZWwuc3R5bGUudG9wID0gcG9zaXRpb24udG9wICsgJ3B4JztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwb3NpdGlvbi5sZWZ0KSB7XG4gICAgICAgICAgICBlbC5zdHlsZS5sZWZ0ID0gcG9zaXRpb24ubGVmdCArICdweCc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocG9zaXRpb24ucmlnaHQpIHtcbiAgICAgICAgICAgIGVsLnN0eWxlLnJpZ2h0ID0gcG9zaXRpb24ucmlnaHQgKyAncHgnO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBiYWNrZ3JvdW5kLlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGJhY2tncm91bmQgYmFja2dyb3VuZCBvcHRpb25cbiAgICAgKi9cbiAgICByZW5kZXJCYWNrZ3JvdW5kOiBmdW5jdGlvbihlbCwgYmFja2dyb3VuZCkge1xuICAgICAgICBpZiAoIWJhY2tncm91bmQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGVsLnN0eWxlLmJhY2tncm91bmQgPSBiYWNrZ3JvdW5kO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgdGl0bGUuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRpdGxlIHRpdGxlXG4gICAgICogQHBhcmFtIHt7Zm9udFNpemU6IG51bWJlciwgY29sb3I6IHN0cmluZywgYmFja2dyb3VuZDogc3RyaW5nfX0gdGhlbWUgdGl0bGUgdGhlbWVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY2xhc3NOYW1lIGNzcyBjbGFzcyBuYW1lXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSB0aXRsZSBlbGVtZW50XG4gICAgICovXG4gICAgcmVuZGVyVGl0bGU6IGZ1bmN0aW9uKHRpdGxlLCB0aGVtZSwgY2xhc3NOYW1lKSB7XG4gICAgICAgIHZhciBlbFRpdGxlLCBjc3NUZXh0O1xuXG4gICAgICAgIGlmICghdGl0bGUpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgZWxUaXRsZSA9IGRvbS5jcmVhdGUoJ0RJVicsIGNsYXNzTmFtZSk7XG4gICAgICAgIGVsVGl0bGUuaW5uZXJIVE1MID0gdGl0bGU7XG5cbiAgICAgICAgY3NzVGV4dCA9IHJlbmRlclV0aWwubWFrZUZvbnRDc3NUZXh0KHRoZW1lKTtcblxuICAgICAgICBpZiAodGhlbWUuYmFja2dyb3VuZCkge1xuICAgICAgICAgICAgY3NzVGV4dCArPSAnOycgKyB0aGlzLmNvbmNhdFN0cignYmFja2dyb3VuZDonLCB0aGVtZS5iYWNrZ3JvdW5kKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGVsVGl0bGUuc3R5bGUuY3NzVGV4dCA9IGNzc1RleHQ7XG5cbiAgICAgICAgcmV0dXJuIGVsVGl0bGU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgSUU4IG9yIG5vdC5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gcmVzdWx0IGJvb2xlYW5cbiAgICAgKi9cbiAgICBpc0lFODogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBpc0lFODtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlbmRlclV0aWw7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgVGhpcyBpcyB0ZW1wbGF0ZSBtYWtlci5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgLyoqXG4gICAgICogVGhpcyBpcyB0ZW1wbGF0ZSBtYWtlci5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaHRtbCBodG1sXG4gICAgICogQHJldHVybnMge2Z1bmN0aW9ufSB0ZW1wbGF0ZSBmdW5jdGlvblxuICAgICAqIEBlYXhtcGxlXG4gICAgICpcbiAgICAgKiAgIHZhciB0ZW1wbGF0ZSA9IHRlbXBsYXRlTWFrZXIudGVtcGxhdGUoJzxzcGFuPnt7IG5hbWUgfX08L3NwYW4+JyksXG4gICAgICogICAgICAgcmVzdWx0ID0gdGVtcGxhdGUoe25hbWU6ICdKb2huJyk7XG4gICAgICogICBjb25zb2xlLmxvZyhyZXN1bHQpOyAvLyA8c3Bhbj5Kb2huPC9zcGFuPlxuICAgICAqXG4gICAgICovXG4gICAgdGVtcGxhdGU6IGZ1bmN0aW9uIChodG1sKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGh0bWw7XG4gICAgICAgICAgICBuZS51dGlsLmZvckVhY2goZGF0YSwgZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVnRXhwID0gbmV3IFJlZ0V4cCgne3tcXFxccyonICsga2V5ICsgJ1xcXFxzKn19JywgJ2cnKTtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShyZWdFeHAsIHZhbHVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfTtcbiAgICB9XG59O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3ICBMZWdlbmQgY29tcG9uZW50LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4uL2NvbnN0LmpzJyksXG4gICAgZG9tID0gcmVxdWlyZSgnLi4vaGVscGVycy9kb21IYW5kbGVyLmpzJyksXG4gICAgcmVuZGVyVXRpbCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvcmVuZGVyVXRpbC5qcycpLFxuICAgIGRlZmF1bHRUaGVtZSA9IHJlcXVpcmUoJy4uL3RoZW1lcy9kZWZhdWx0VGhlbWUuanMnKSxcbiAgICBsZWdlbmRUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vLi4vbGVnZW5kcy9sZWdlbmRUZW1wbGF0ZS5qcycpO1xuXG52YXIgTEVHRU5EX1JFQ1RfV0lEVEggPSAxMixcbiAgICBMQUJFTF9QQURESU5HX1RPUCA9IDIsXG4gICAgTElORV9NQVJHSU5fVE9QID0gNTtcblxudmFyIExlZ2VuZCA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBMZWdlbmQucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBMZWdlbmQgY29tcG9uZW50LlxuICAgICAqIEBjb25zdHJ1Y3RzIExlZ2VuZFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5sZWdlbmRMYWJlbHMgbGVnZW5kIGxhYmVsc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5ib3VuZCBheGlzIGJvdW5kXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIGF4aXMgdGhlbWVcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgbmUudXRpbC5leHRlbmQodGhpcywgcGFyYW1zKTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIExlZ2VuZCB2aWV3IGNsYXNzTmFtZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jbGFzc05hbWUgPSAnbmUtY2hhcnQtbGVnZW5kLWFyZWEnO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgbGVnZW5kLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBib3VuZCBwbG90IGJvdW5kXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSBsZWdlbmQgZWxlbWVudFxuICAgICAqL1xuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBlbCA9IGRvbS5jcmVhdGUoJ0RJVicsIHRoaXMuY2xhc3NOYW1lKTtcbiAgICAgICAgZWwuaW5uZXJIVE1MID0gdGhpcy5fbWFrZUxlZ2VuZEh0bWwoKTtcbiAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJQb3NpdGlvbihlbCwgdGhpcy5ib3VuZC5wb3NpdGlvbik7XG4gICAgICAgIHRoaXMuX3JlbmRlckxhYmVsVGhlbWUoZWwsIHRoaXMudGhlbWUubGFiZWwpO1xuXG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHRoZW1lIHRvIGxlZ2VuZCBsYWJlbHNcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxvYmplY3Q+fSBsYWJlbHMgbGFiZWxzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIGxlZ2VuZCB0aGVtZVxuICAgICAqIEByZXR1cm5zIHthcnJheS48b2JqZWN0Pn0gbGFiZWxzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0VGhlbWVUb0xhYmVsczogZnVuY3Rpb24obGFiZWxzLCB0aGVtZSkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gbmUudXRpbC5tYXAobGFiZWxzLCBmdW5jdGlvbihpdGVtLCBpbmRleCkge1xuICAgICAgICAgICAgdmFyIGl0ZW1UaGVtZSA9IHtcbiAgICAgICAgICAgICAgICBjb2xvcjogdGhlbWUuY29sb3JzW2luZGV4XVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKHRoZW1lLnNpbmdsZUNvbG9ycykge1xuICAgICAgICAgICAgICAgIGl0ZW1UaGVtZS5zaW5nbGVDb2xvciA9IHRoZW1lLnNpbmdsZUNvbG9yc1tpbmRleF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhlbWUuYm9yZGVyQ29sb3IpIHtcbiAgICAgICAgICAgICAgICBpdGVtVGhlbWUuYm9yZGVyQ29sb3IgPSB0aGVtZS5ib3JkZXJDb2xvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGl0ZW0udGhlbWUgPSBpdGVtVGhlbWU7XG4gICAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBsZWdlbmQgbGFiZWxzLlxuICAgICAqIEByZXR1cm5zIHthcnJheS48b2JqZWN0Pn0gbGVnZW5kIGxhYmVscy5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlTGVnZW5kTGFiZWxzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNoYXJ0VHlwZSA9IHRoaXMuY2hhcnRUeXBlLFxuICAgICAgICAgICAgbGVnZW5kTGFiZWxzID0gdGhpcy5sZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICBqb2luTGVnZW5kTGFiZWxzID0gdGhpcy5qb2luTGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgbGFiZWxMZW4gPSBsZWdlbmRMYWJlbHMubGVuZ3RoLFxuICAgICAgICAgICAgdGhlbWUgPSB0aGlzLnRoZW1lLFxuICAgICAgICAgICAgY2hhcnRMZWdlbmRUaGVtZSA9IG5lLnV0aWwuZmlsdGVyKHRoZW1lLCBmdW5jdGlvbihpdGVtLCBuYW1lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwuaW5BcnJheShuYW1lLCBjaGFydENvbnN0LlNFUklFU19QUk9QUykgPT09IC0xICYmIG5hbWUgIT09ICdsYWJlbCc7XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGNoYXJ0VHlwZXMgPSBuZS51dGlsLmtleXMoY2hhcnRMZWdlbmRUaGVtZSksXG4gICAgICAgICAgICBkZWZhdWx0TGVnZW5kVGhlbWUgPSB7XG4gICAgICAgICAgICAgICAgY29sb3JzOiBkZWZhdWx0VGhlbWUuc2VyaWVzLmNvbG9yc1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNoYXJ0VGhlbWUsIHJlc3VsdDtcblxuICAgICAgICBpZiAoIWNoYXJ0VHlwZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9zZXRUaGVtZVRvTGFiZWxzKGpvaW5MZWdlbmRMYWJlbHMsIHRoZW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNoYXJ0VGhlbWUgPSB0aGVtZVtjaGFydFR5cGVdIHx8IGRlZmF1bHRMZWdlbmRUaGVtZTtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuX3NldFRoZW1lVG9MYWJlbHMoam9pbkxlZ2VuZExhYmVscy5zbGljZSgwLCBsYWJlbExlbiksIGNoYXJ0VGhlbWUpO1xuICAgICAgICAgICAgY2hhcnRUaGVtZSA9IHRoZW1lW25lLnV0aWwuZmlsdGVyKGNoYXJ0VHlwZXMsIGZ1bmN0aW9uKHByb3BOYW1lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb3BOYW1lICE9PSBjaGFydFR5cGU7XG4gICAgICAgICAgICB9KVswXV0gfHwgZGVmYXVsdExlZ2VuZFRoZW1lO1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdCh0aGlzLl9zZXRUaGVtZVRvTGFiZWxzKGpvaW5MZWdlbmRMYWJlbHMuc2xpY2UobGFiZWxMZW4pLCBjaGFydFRoZW1lKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBsZWdlbmQgaHRtbC5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBsZWdlbmQgaHRtbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VMZWdlbmRIdG1sOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGxhYmVscyA9IHRoaXMuX21ha2VMZWdlbmRMYWJlbHMoKSxcbiAgICAgICAgICAgIHRlbXBsYXRlID0gbGVnZW5kVGVtcGxhdGUuVFBMX0xFR0VORCxcbiAgICAgICAgICAgIGxhYmVsSGVpZ2h0ID0gcmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsSGVpZ2h0KGxhYmVsc1swXS5sYWJlbCwgbGFiZWxzWzBdLnRoZW1lKSArIChMQUJFTF9QQURESU5HX1RPUCAqIDIpLFxuICAgICAgICAgICAgYmFzZU1hcmdpblRvcCA9IHBhcnNlSW50KChsYWJlbEhlaWdodCAtIExFR0VORF9SRUNUX1dJRFRIKSAvIDIsIDEwKSAtIDEsXG4gICAgICAgICAgICBodG1sID0gbmUudXRpbC5tYXAobGFiZWxzLCBmdW5jdGlvbihsYWJlbCwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgYm9yZGVyQ3NzVGV4dCA9IGxhYmVsLmJvcmRlckNvbG9yID8gcmVuZGVyVXRpbC5jb25jYXRTdHIoJztib3JkZXI6MXB4IHNvbGlkICcsIGxhYmVsLmJvcmRlckNvbG9yKSA6ICcnLFxuICAgICAgICAgICAgICAgICAgICByZWN0TWFyZ2luLCBtYXJnaW5Ub3AsIGRhdGE7XG4gICAgICAgICAgICAgICAgaWYgKGxhYmVsLmNoYXJ0VHlwZSA9PT0gJ2xpbmUnKSB7XG4gICAgICAgICAgICAgICAgICAgIG1hcmdpblRvcCA9IGJhc2VNYXJnaW5Ub3AgKyBMSU5FX01BUkdJTl9UT1A7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luVG9wID0gYmFzZU1hcmdpblRvcDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVjdE1hcmdpbiA9IHJlbmRlclV0aWwuY29uY2F0U3RyKCc7bWFyZ2luLXRvcDonLCBtYXJnaW5Ub3AsICdweCcpO1xuXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgY3NzVGV4dDogcmVuZGVyVXRpbC5jb25jYXRTdHIoJ2JhY2tncm91bmQtY29sb3I6JywgbGFiZWwudGhlbWUuc2luZ2xlQ29sb3IgfHwgbGFiZWwudGhlbWUuY29sb3IsIGJvcmRlckNzc1RleHQsIHJlY3RNYXJnaW4pLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IGxhYmVsSGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICBjaGFydFR5cGU6IGxhYmVsLmNoYXJ0VHlwZSB8fCAncmVjdCcsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiBsYWJlbC5sYWJlbFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRlbXBsYXRlKGRhdGEpO1xuICAgICAgICAgICAgfSwgdGhpcykuam9pbignJyk7XG4gICAgICAgIHJldHVybiBodG1sO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgY3NzIHN0eWxlIG9mIGxhYmVsIGFyZWEuXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgbGFiZWwgYXJlYSBlbGVtZW50XG4gICAgICogQHBhcmFtIHt7Zm9udFNpemU6bnVtYmVyLCBmb250RmFtaWx5OiBzdHJpbmcsIGNvbG9yOiBzdHJpbmd9fSB0aGVtZSBsYWJlbCB0aGVtZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlckxhYmVsVGhlbWU6IGZ1bmN0aW9uKGVsLCB0aGVtZSkge1xuICAgICAgICB2YXIgY3NzVGV4dCA9IHJlbmRlclV0aWwubWFrZUZvbnRDc3NUZXh0KHRoZW1lKTtcbiAgICAgICAgZWwuc3R5bGUuY3NzVGV4dCArPSAnOycgKyBjc3NUZXh0O1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IExlZ2VuZDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBUaGlzIGlzIHRlbXBsYXRlcyBvZiBsZWdlbmQgdmlldy5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbnZhciB0ZW1wbGF0ZU1ha2VyID0gcmVxdWlyZSgnLi4vaGVscGVycy90ZW1wbGF0ZU1ha2VyLmpzJyk7XG5cbnZhciB0YWdzID0ge1xuICAgIEhUTUxfTEVHRU5EOiAnPGRpdiBjbGFzcz1cIm5lLWNoYXJ0LWxlZ2VuZFwiPicgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cIm5lLWNoYXJ0LWxlZ2VuZC1yZWN0IHt7IGNoYXJ0VHlwZSB9fVwiIHN0eWxlPVwie3sgY3NzVGV4dCB9fVwiPjwvZGl2PicgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cIm5lLWNoYXJ0LWxlZ2VuZC1sYWJlbFwiIHN0eWxlPVwiaGVpZ2h0Ont7IGhlaWdodCB9fXB4XCI+e3sgbGFiZWwgfX08L2Rpdj48L2Rpdj4nXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBUUExfTEVHRU5EOiB0ZW1wbGF0ZU1ha2VyLnRlbXBsYXRlKHRhZ3MuSFRNTF9MRUdFTkQpXG59O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFBsb3QgY29tcG9uZW50LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZG9tID0gcmVxdWlyZSgnLi4vaGVscGVycy9kb21IYW5kbGVyLmpzJyksXG4gICAgY2FsY3VsYXRvciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvY2FsY3VsYXRvci5qcycpLFxuICAgIHJlbmRlclV0aWwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3JlbmRlclV0aWwuanMnKSxcbiAgICBwbG90VGVtcGxhdGUgPSByZXF1aXJlKCcuL3Bsb3RUZW1wbGF0ZS5qcycpO1xuXG52YXIgUGxvdCA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBQbG90LnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogUGxvdCBjb21wb25lbnQuXG4gICAgICogQGNvbnN0cnVjdHMgUGxvdFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy52VGlja0NvdW50IHZlcnRpY2FsIHRpY2sgY291bnRcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuaFRpY2tDb3VudCBob3Jpem9udGFsIHRpY2sgY291bnRcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuYm91bmQgYXhpcyBib3VuZFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBheGlzIHRoZW1lXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIG5lLnV0aWwuZXh0ZW5kKHRoaXMsIHBhcmFtcyk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQbG90IHZpZXcgY2xhc3NOYW1lXG4gICAgICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNsYXNzTmFtZSA9ICduZS1jaGFydC1wbG90LWFyZWEnO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgcGxvdC5cbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgdG9wOiBudW1iZXIsIHJpZ2h0OiBudW1iZXJ9fSBib3VuZCBwbG90IGFyZWEgYm91bmRcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHBsb3QgZWxlbWVudFxuICAgICAqL1xuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBlbCA9IGRvbS5jcmVhdGUoJ0RJVicsIHRoaXMuY2xhc3NOYW1lKSxcbiAgICAgICAgICAgIGJvdW5kID0gdGhpcy5ib3VuZDtcbiAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJEaW1lbnNpb24oZWwsIGJvdW5kLmRpbWVuc2lvbik7XG4gICAgICAgIHJlbmRlclV0aWwucmVuZGVyUG9zaXRpb24oZWwsIGJvdW5kLnBvc2l0aW9uKTtcbiAgICAgICAgdGhpcy5fcmVuZGVyTGluZXMoZWwsIGJvdW5kLmRpbWVuc2lvbik7XG5cbiAgICAgICAgcmV0dXJuIGVsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgcGxvdCBsaW5lcy5cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCBlbGVtZW50XG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBkaW1lbnNpb24gcGxvdCBhcmVhIGRpbWVuc2lvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlckxpbmVzOiBmdW5jdGlvbihlbCwgZGltZW5zaW9uKSB7XG4gICAgICAgIHZhciBoUG9zaXRpb25zID0gdGhpcy5tYWtlSG9yaXpvbnRhbFBpeGVsUG9zaXRpb25zKGRpbWVuc2lvbi53aWR0aCksXG4gICAgICAgICAgICB2UG9zaXRpb25zID0gdGhpcy5tYWtlVmVydGljYWxQaXhlbFBvc2l0aW9ucyhkaW1lbnNpb24uaGVpZ2h0KSxcbiAgICAgICAgICAgIHRoZW1lID0gdGhpcy50aGVtZSxcbiAgICAgICAgICAgIGxpbmVIdG1sID0gJyc7XG5cbiAgICAgICAgbGluZUh0bWwgKz0gdGhpcy5fbWFrZUxpbmVIdG1sKHtcbiAgICAgICAgICAgIHBvc2l0aW9uczogaFBvc2l0aW9ucyxcbiAgICAgICAgICAgIHNpemU6IGRpbWVuc2lvbi5oZWlnaHQsXG4gICAgICAgICAgICBjbGFzc05hbWU6ICd2ZXJ0aWNhbCcsXG4gICAgICAgICAgICBwb3NpdGlvblR5cGU6ICdsZWZ0JyxcbiAgICAgICAgICAgIHNpemVUeXBlOiAnaGVpZ2h0JyxcbiAgICAgICAgICAgIGxpbmVDb2xvcjogdGhlbWUubGluZUNvbG9yXG4gICAgICAgIH0pO1xuICAgICAgICBsaW5lSHRtbCArPSB0aGlzLl9tYWtlTGluZUh0bWwoe1xuICAgICAgICAgICAgcG9zaXRpb25zOiB2UG9zaXRpb25zLFxuICAgICAgICAgICAgc2l6ZTogZGltZW5zaW9uLndpZHRoLFxuICAgICAgICAgICAgY2xhc3NOYW1lOiAnaG9yaXpvbnRhbCcsXG4gICAgICAgICAgICBwb3NpdGlvblR5cGU6ICdib3R0b20nLFxuICAgICAgICAgICAgc2l6ZVR5cGU6ICd3aWR0aCcsXG4gICAgICAgICAgICBsaW5lQ29sb3I6IHRoZW1lLmxpbmVDb2xvclxuICAgICAgICB9KTtcblxuICAgICAgICBlbC5pbm5lckhUTUwgPSBsaW5lSHRtbDtcblxuICAgICAgICByZW5kZXJVdGlsLnJlbmRlckJhY2tncm91bmQoZWwsIHRoZW1lLmJhY2tncm91bmQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGh0bWwgb2YgcGxvdCBsaW5lLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48b2JqZWN0Pn0gcGFyYW1zLnBvc2l0aW9ucyBwb3NpdGlvbnNcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuc2l6ZSB3aWR0aCBvciBoZWlnaHRcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMuY2xhc3NOYW1lIGxpbmUgY2xhc3NOYW1lXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLnBvc2l0aW9uVHlwZSBwb3NpdGlvbiB0eXBlIChsZWZ0IG9yIGJvdHRvbSlcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMuc2l6ZVR5cGUgc2l6ZSB0eXBlIChzaXplIG9yIGhlaWdodClcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMubGluZUNvbG9yIGxpbmUgY29sb3JcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBodG1sXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUxpbmVIdG1sOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIHRlbXBsYXRlID0gcGxvdFRlbXBsYXRlLlRQTF9QTE9UX0xJTkUsXG4gICAgICAgICAgICBsaW5lSHRtbCA9IG5lLnV0aWwubWFwKHBhcmFtcy5wb3NpdGlvbnMsIGZ1bmN0aW9uKHBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNzc1RleHRzID0gW1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyVXRpbC5jb25jYXRTdHIocGFyYW1zLnBvc2l0aW9uVHlwZSwgJzonLCBwb3NpdGlvbiwgJ3B4JyksXG4gICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJVdGlsLmNvbmNhdFN0cihwYXJhbXMuc2l6ZVR5cGUsICc6JywgcGFyYW1zLnNpemUsICdweCcpXG4gICAgICAgICAgICAgICAgICAgIF0sIGRhdGE7XG5cbiAgICAgICAgICAgICAgICBpZiAocGFyYW1zLmxpbmVDb2xvcikge1xuICAgICAgICAgICAgICAgICAgICBjc3NUZXh0cy5wdXNoKHJlbmRlclV0aWwuY29uY2F0U3RyKCdiYWNrZ3JvdW5kLWNvbG9yOicsIHBhcmFtcy5saW5lQ29sb3IpKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBkYXRhID0ge2NsYXNzTmFtZTogcGFyYW1zLmNsYXNzTmFtZSwgY3NzVGV4dDogY3NzVGV4dHMuam9pbignOycpfTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGVtcGxhdGUoZGF0YSk7XG4gICAgICAgICAgICB9LCB0aGlzKS5qb2luKCcnKTtcbiAgICAgICAgcmV0dXJuIGxpbmVIdG1sO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHBpeGVsIHZhbHVlIG9mIHZlcnRpY2FsIHBvc2l0aW9uc1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgcGxvdCBoZWlnaHRcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPG51bWJlcj59IHBvc2l0aW9uc1xuICAgICAqL1xuICAgIG1ha2VWZXJ0aWNhbFBpeGVsUG9zaXRpb25zOiBmdW5jdGlvbihoZWlnaHQpIHtcbiAgICAgICAgdmFyIHBvc2l0aW9ucyA9IGNhbGN1bGF0b3IubWFrZVBpeGVsUG9zaXRpb25zKGhlaWdodCwgdGhpcy52VGlja0NvdW50KTtcbiAgICAgICAgcG9zaXRpb25zLnNoaWZ0KCk7XG4gICAgICAgIHJldHVybiBwb3NpdGlvbnM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgcGl4ZWwgdmFsdWUgb2YgaG9yaXpvbnRhbCBwb3NpdGlvbnMuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoIHBsb3Qgd2lkdGhcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPG51bWJlcj59IHBvc2l0aW9uc1xuICAgICAqL1xuICAgIG1ha2VIb3Jpem9udGFsUGl4ZWxQb3NpdGlvbnM6IGZ1bmN0aW9uKHdpZHRoKSB7XG4gICAgICAgIHZhciBwb3NpdGlvbnMgPSBjYWxjdWxhdG9yLm1ha2VQaXhlbFBvc2l0aW9ucyh3aWR0aCwgdGhpcy5oVGlja0NvdW50KTtcbiAgICAgICAgcG9zaXRpb25zLnNoaWZ0KCk7XG4gICAgICAgIHJldHVybiBwb3NpdGlvbnM7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUGxvdDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBUaGlzIGlzIHRlbXBsYXRlcyBvZiBwbG90IHZpZXcgLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxudmFyIHRlbXBsYXRlTWFrZXIgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3RlbXBsYXRlTWFrZXIuanMnKTtcblxudmFyIHRhZ3MgPSB7XG4gICAgSFRNTF9QTE9UX0xJTkU6ICc8ZGl2IGNsYXNzPVwibmUtY2hhcnQtcGxvdC1saW5lIHt7IGNsYXNzTmFtZSB9fVwiIHN0eWxlPVwie3sgY3NzVGV4dCB9fVwiPjwvZGl2Pidcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIFRQTF9QTE9UX0xJTkU6IHRlbXBsYXRlTWFrZXIudGVtcGxhdGUodGFncy5IVE1MX1BMT1RfTElORSlcbn07XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgUmFwaGFlbCByZW5kZXIgcGx1Z2luLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQmFyQ2hhcnQgPSByZXF1aXJlKCcuL3JhcGhhZWxCYXJDaGFydC5qcycpLFxuICAgIExpbmVDaGFydCA9IHJlcXVpcmUoJy4vcmFwaGFlbExpbmVDaGFydC5qcycpLFxuICAgIFBpZUNoYXJ0ID0gcmVxdWlyZSgnLi9yYXBoYWVsUGllQ2hhcnQuanMnKTtcblxudmFyIHBsdWdpbk5hbWUgPSAncmFwaGFlbCcsXG4gICAgcGx1Z2luUmFwaGFlbDtcblxucGx1Z2luUmFwaGFlbCA9IHtcbiAgICBiYXI6IEJhckNoYXJ0LFxuICAgIGNvbHVtbjogQmFyQ2hhcnQsXG4gICAgbGluZTogTGluZUNoYXJ0LFxuICAgIHBpZTogUGllQ2hhcnRcbn07XG5cbm5lLmFwcGxpY2F0aW9uLmNoYXJ0LnJlZ2lzdGVyUGx1Z2luKHBsdWdpbk5hbWUsIHBsdWdpblJhcGhhZWwpO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFJhcGhhZWwgYmFyIGNoYXJ0IHJlbmRlcmVyLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgSElEREVOX1dJRFRIID0gMTtcblxudmFyIFJhcGhhZWwgPSB3aW5kb3cuUmFwaGFlbCxcbiAgICBicm93c2VyID0gbmUudXRpbC5icm93c2VyO1xuXG4vKipcbiAqIEBjbGFzc2Rlc2MgUmFwaGFlbEJhckNoYXJ0IGlzIGdyYXBoIHJlbmRlcmVyLlxuICogQGNsYXNzIFJhcGhhZWxCYXJDaGFydFxuICovXG52YXIgUmFwaGFlbEJhckNoYXJ0ID0gbmUudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIFJhcGhhZWxCYXJDaGFydC5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIFJlbmRlciBmdW5jdGlvbiBvZiBiYXIgY2hhcnRcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciBjb250YWluZXIgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7e3NpemU6IG9iamVjdCwgbW9kZWw6IG9iamVjdCwgb3B0aW9uczogb2JqZWN0LCB0b29sdGlwUG9zaXRpb246IHN0cmluZ319IGRhdGEgY2hhcnQgZGF0YVxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGluQ2FsbGJhY2sgbW91c2VvdmVyIGNhbGxiYWNrXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gb3V0Q2FsbGJhY2sgbW91c2VvdXQgY2FsbGJhY2tcbiAgICAgKiBAcmV0dXJuIHtvYmplY3R9IHBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKi9cbiAgICByZW5kZXI6IGZ1bmN0aW9uKHBhcGVyLCBjb250YWluZXIsIGRhdGEsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKSB7XG4gICAgICAgIHZhciBncm91cEJvdW5kcyA9IGRhdGEuZ3JvdXBCb3VuZHMsXG4gICAgICAgICAgICBkaW1lbnNpb24gPSBkYXRhLmRpbWVuc2lvbjtcblxuICAgICAgICBpZiAoIWdyb3VwQm91bmRzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXBhcGVyKSB7XG4gICAgICAgICAgICBwYXBlciA9IFJhcGhhZWwoY29udGFpbmVyLCBkaW1lbnNpb24ud2lkdGgsIGRpbWVuc2lvbi5oZWlnaHQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3JlbmRlckJhcnMocGFwZXIsIGRhdGEudGhlbWUsIGdyb3VwQm91bmRzLCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjayk7XG5cbiAgICAgICAgcmV0dXJuIHBhcGVyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgYmFycy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqIEBwYXJhbSB7e2NvbG9yczogc3RyaW5nW10sIHNpbmdsZUNvbG9yczogc3RyaW5nW10sIGJvcmRlckNvbG9yOiBzdHJpbmd9fSB0aGVtZSBiYXIgY2hhcnQgdGhlbWVcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheS48e2xlZnQ6IG51bWJlciwgdG9wOm51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9Pj59IGdyb3VwQm91bmRzIGJvdW5kc1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGluQ2FsbGJhY2sgaW4gY2FsbGJhY2tcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvdXRDYWxsYmFjayBvdXQgY2FsbGJhY2tcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJCYXJzOiBmdW5jdGlvbihwYXBlciwgdGhlbWUsIGdyb3VwQm91bmRzLCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjaykge1xuICAgICAgICB2YXIgc2luZ2xlQ29sb3JzID0gKGdyb3VwQm91bmRzWzBdLmxlbmd0aCA9PT0gMSkgJiYgdGhlbWUuc2luZ2xlQ29sb3JzIHx8IFtdLFxuICAgICAgICAgICAgY29sb3JzID0gdGhlbWUuY29sb3JzLFxuICAgICAgICAgICAgYm9yZGVyQ29sb3IgPSB0aGVtZS5ib3JkZXJDb2xvciB8fCAnbm9uZSc7XG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KGdyb3VwQm91bmRzLCBmdW5jdGlvbihib3VuZHMsIGdyb3VwSW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBzaW5nbGVDb2xvciA9IHNpbmdsZUNvbG9yc1tncm91cEluZGV4XTtcbiAgICAgICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KGJvdW5kcywgZnVuY3Rpb24oYm91bmQsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdmFyIGNvbG9yID0gc2luZ2xlQ29sb3IgfHwgY29sb3JzW2luZGV4XSxcbiAgICAgICAgICAgICAgICAgICAgaWQgPSBncm91cEluZGV4ICsgJy0nICsgaW5kZXgsXG4gICAgICAgICAgICAgICAgICAgIHJlY3QgPSB0aGlzLl9yZW5kZXJCYXIocGFwZXIsIGNvbG9yLCBib3JkZXJDb2xvciwgYm91bmQpO1xuICAgICAgICAgICAgICAgIGlmIChyZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2JpbmRIb3ZlckV2ZW50KHJlY3QsIGJvdW5kLCBpZCwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIHJlY3RcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb2xvciBzZXJpZXMgY29sb3JcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gYm9yZGVyQ29sb3Igc2VyaWVzIGJvcmRlckNvbG9yXG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBib3VuZCBib3VuZFxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IGJhciByZWN0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyQmFyOiBmdW5jdGlvbihwYXBlciwgY29sb3IsIGJvcmRlckNvbG9yLCBib3VuZCkge1xuICAgICAgICBpZiAoYm91bmQud2lkdGggPCAwIHx8IGJvdW5kLmhlaWdodCA8IDApIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHZhciByZWN0ID0gcGFwZXIucmVjdChib3VuZC5sZWZ0LCBib3VuZC50b3AsIGJvdW5kLndpZHRoLCBib3VuZC5oZWlnaHQpO1xuICAgICAgICByZWN0LmF0dHIoe1xuICAgICAgICAgICAgZmlsbDogY29sb3IsXG4gICAgICAgICAgICBzdHJva2U6IGJvcmRlckNvbG9yXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiByZWN0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBCaW5kIGhvdmVyIGV2ZW50LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSByZWN0IHJhcGhhZWwgcmVjdFxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gYm91bmQgYm91bmRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgdG9vbHRpcCBpZFxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGluQ2FsbGJhY2sgaW4gY2FsbGJhY2tcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvdXRDYWxsYmFjayBvdXQgY2FsbGJhY2tcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9iaW5kSG92ZXJFdmVudDogZnVuY3Rpb24ocmVjdCwgYm91bmQsIGlkLCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjaykge1xuICAgICAgICByZWN0LmhvdmVyKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaW5DYWxsYmFjayhib3VuZCwgaWQpO1xuICAgICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIG91dENhbGxiYWNrKGlkKTtcbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmFwaGFlbEJhckNoYXJ0O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFJhcGhhZWwgbGluZSBjaGFydCByZW5kZXJlci5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJhcGhhZWwgPSB3aW5kb3cuUmFwaGFlbCxcbiAgICBERUZBVUxUX0RPVF9XSURUSCA9IDQsXG4gICAgSE9WRVJfRE9UX1dJRFRIID0gNTtcblxuLyoqXG4gKiBAY2xhc3NkZXNjIFJhcGhhZWxMaW5lQ2hhcnRzIGlzIGdyYXBoIHJlbmRlcmVyLlxuICogQGNsYXNzIFJhcGhhZWxMaW5lQ2hhcnRcbiAqL1xudmFyIFJhcGhhZWxMaW5lQ2hhcnQgPSBuZS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgUmFwaGFlbExpbmVDaGFydC5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIFJlbmRlciBmdW5jdGlvbiBvciBsaW5lIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNvbnRhaW5lclxuICAgICAqIEBwYXJhbSB7e2dyb3VwUG9zaXRpb25zOiBhcnJheS48YXJyYXk+LCBkaW1lbnNpb246IG9iamVjdCwgdGhlbWU6IG9iamVjdCwgb3B0aW9uczogb2JqZWN0fX0gZGF0YSByZW5kZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGluQ2FsbGJhY2sgaW4gY2FsbGJhY2tcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvdXRDYWxsYmFjayBvdXQgY2FsbGJhY2tcbiAgICAgKiBAcmV0dXJuIHtvYmplY3R9IHBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKi9cbiAgICByZW5kZXI6IGZ1bmN0aW9uKHBhcGVyLCBjb250YWluZXIsIGRhdGEsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKSB7XG4gICAgICAgIHZhciBkaW1lbnNpb24gPSBkYXRhLmRpbWVuc2lvbixcbiAgICAgICAgICAgIGdyb3VwUG9zaXRpb25zID0gZGF0YS5ncm91cFBvc2l0aW9ucyxcbiAgICAgICAgICAgIHRoZW1lID0gZGF0YS50aGVtZSxcbiAgICAgICAgICAgIGNvbG9ycyA9IHRoZW1lLmNvbG9ycyxcbiAgICAgICAgICAgIG9wYWNpdHkgPSBkYXRhLm9wdGlvbnMuaGFzRG90ID8gMSA6IDAsXG4gICAgICAgICAgICBncm91cFBhdGhzID0gdGhpcy5fZ2V0TGluZXNQYXRoKGdyb3VwUG9zaXRpb25zKSxcbiAgICAgICAgICAgIGJvcmRlclN0eWxlID0gdGhpcy5fbWFrZUJvcmRlclN0eWxlKHRoZW1lLmJvcmRlckNvbG9yLCBvcGFjaXR5KSxcbiAgICAgICAgICAgIG91dERvdFN0eWxlID0gdGhpcy5fbWFrZU91dERvdFN0eWxlKG9wYWNpdHksIGJvcmRlclN0eWxlKSxcbiAgICAgICAgICAgIGdyb3VwRG90cztcblxuICAgICAgICBpZiAoIXBhcGVyKSB7XG4gICAgICAgICAgICBwYXBlciA9IFJhcGhhZWwoY29udGFpbmVyLCBkaW1lbnNpb24ud2lkdGgsIGRpbWVuc2lvbi5oZWlnaHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fcmVuZGVyTGluZXMocGFwZXIsIGdyb3VwUGF0aHMsIGNvbG9ycyk7XG4gICAgICAgIGdyb3VwRG90cyA9IHRoaXMuX3JlbmRlckRvdHMocGFwZXIsIGdyb3VwUG9zaXRpb25zLCBjb2xvcnMsIG9wYWNpdHksIGJvcmRlclN0eWxlKTtcblxuICAgICAgICB0aGlzLm91dERvdFN0eWxlID0gb3V0RG90U3R5bGU7XG4gICAgICAgIHRoaXMuZ3JvdXBEb3RzID0gZ3JvdXBEb3RzO1xuXG4gICAgICAgIHRoaXMuX2F0dGFjaEV2ZW50KGdyb3VwRG90cywgZ3JvdXBQb3NpdGlvbnMsIG91dERvdFN0eWxlLCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjayk7XG5cbiAgICAgICAgcmV0dXJuIHBhcGVyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGJvcmRlciBzdHlsZS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gYm9yZGVyQ29sb3IgYm9yZGVyIGNvbG9yXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG9wYWNpdHkgb3BhY2l0eVxuICAgICAqIEByZXR1cm5zIHt7c3Ryb2tlOiBzdHJpbmcsIHN0cm9rZS13aWR0aDogbnVtYmVyLCBzdHJpa2Utb3BhY2l0eTogbnVtYmVyfX0gYm9yZGVyIHN0eWxlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUJvcmRlclN0eWxlOiBmdW5jdGlvbihib3JkZXJDb2xvciwgb3BhY2l0eSkge1xuICAgICAgICB2YXIgYm9yZGVyU3R5bGU7XG4gICAgICAgIGlmIChib3JkZXJDb2xvcikge1xuICAgICAgICAgICAgYm9yZGVyU3R5bGUgPSB7XG4gICAgICAgICAgICAgICAgJ3N0cm9rZSc6IGJvcmRlckNvbG9yLFxuICAgICAgICAgICAgICAgICdzdHJva2Utd2lkdGgnOiAxLFxuICAgICAgICAgICAgICAgICdzdHJva2Utb3BhY2l0eSc6IG9wYWNpdHlcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJvcmRlclN0eWxlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGRvdCBzdHlsZSBmb3IgbW91c2VvdXQgZXZlbnQuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG9wYWNpdHkgb3BhY2l0eVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBib3JkZXJTdHlsZSBib3JkZXIgc3R5bGVcbiAgICAgKiBAcmV0dXJucyB7e2ZpbGwtb3BhY2l0eTogbnVtYmVyLCBzdHJva2Utb3BhY2l0eTogbnVtYmVyLCByOiBudW1iZXJ9fSBzdHlsZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VPdXREb3RTdHlsZTogZnVuY3Rpb24ob3BhY2l0eSwgYm9yZGVyU3R5bGUpIHtcbiAgICAgICAgdmFyIG91dERvdFN0eWxlID0ge1xuICAgICAgICAgICAgJ2ZpbGwtb3BhY2l0eSc6IG9wYWNpdHksXG4gICAgICAgICAgICAnc3Ryb2tlLW9wYWNpdHknOiAwLFxuICAgICAgICAgICAgcjogNFxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChib3JkZXJTdHlsZSkge1xuICAgICAgICAgICAgbmUudXRpbC5leHRlbmQob3V0RG90U3R5bGUsIGJvcmRlclN0eWxlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBvdXREb3RTdHlsZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGRvdC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBhZXJcbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gcG9zaXRpb24gZG90IHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbG9yIGRvdCBjb2xvclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBvcGFjaXR5IG9wYWNpdHlcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYm9yZGVyU3R5bGUgYm9yZGVyIHN0eWxlXG4gICAgICogQHJldHVybnMge29iamVjdH0gcmFwaGFlbCBkb3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJEb3Q6IGZ1bmN0aW9uKHBhcGVyLCBwb3NpdGlvbiwgY29sb3IsIG9wYWNpdHksIGJvcmRlclN0eWxlKSB7XG4gICAgICAgIHZhciBkb3QgPSBwYXBlci5jaXJjbGUocG9zaXRpb24ubGVmdCwgcG9zaXRpb24udG9wLCBERUZBVUxUX0RPVF9XSURUSCksXG4gICAgICAgICAgICBkb3RTdHlsZSA9IHtcbiAgICAgICAgICAgICAgICBmaWxsOiBjb2xvcixcbiAgICAgICAgICAgICAgICAnZmlsbC1vcGFjaXR5Jzogb3BhY2l0eSxcbiAgICAgICAgICAgICAgICAnc3Ryb2tlLW9wYWNpdHknOiAwXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIGlmIChib3JkZXJTdHlsZSkge1xuICAgICAgICAgICAgbmUudXRpbC5leHRlbmQoZG90U3R5bGUsIGJvcmRlclN0eWxlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRvdC5hdHRyKGRvdFN0eWxlKTtcblxuICAgICAgICByZXR1cm4gZG90O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgZG90cy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gZ3JvdXBQb3NpdGlvbnMgcG9zaXRpb25zXG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gY29sb3JzIGNvbG9yc1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBvcGFjaXR5IG9wYWNpdHlcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYm9yZGVyU3R5bGUgYm9yZGVyIHN0eWxlXG4gICAgICogQHJldHVybnMge2FycmF5LjxvYmplY3Q+fSBkb3RzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyRG90czogZnVuY3Rpb24ocGFwZXIsIGdyb3VwUG9zaXRpb25zLCBjb2xvcnMsIG9wYWNpdHksIGJvcmRlclN0eWxlKSB7XG4gICAgICAgIHZhciBkb3RzID0gbmUudXRpbC5tYXAoZ3JvdXBQb3NpdGlvbnMsIGZ1bmN0aW9uKHBvc2l0aW9ucywgZ3JvdXBJbmRleCkge1xuICAgICAgICAgICAgdmFyIGNvbG9yID0gY29sb3JzW2dyb3VwSW5kZXhdO1xuICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwubWFwKHBvc2l0aW9ucywgZnVuY3Rpb24ocG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgZG90ID0gdGhpcy5fcmVuZGVyRG90KHBhcGVyLCBwb3NpdGlvbiwgY29sb3IsIG9wYWNpdHksIGJvcmRlclN0eWxlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZG90O1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIHJldHVybiBkb3RzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGxpbmUgcGF0aC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZnggZnJvbSB4XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGZ5IGZyb20geVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB0eCB0byB4XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHR5IHRvIHlcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGggd2lkdGhcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBwYXRoXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUxpbmVQYXRoOiBmdW5jdGlvbihmeCwgZnksIHR4LCB0eSwgd2lkdGgpIHtcbiAgICAgICAgdmFyIGZyb21Qb2ludCA9IFtmeCwgZnldO1xuICAgICAgICB2YXIgdG9Qb2ludCA9IFt0eCwgdHldO1xuXG4gICAgICAgIHdpZHRoID0gd2lkdGggfHwgMTtcblxuICAgICAgICBpZiAoZnJvbVBvaW50WzBdID09PSB0b1BvaW50WzBdKSB7XG4gICAgICAgICAgICBmcm9tUG9pbnRbMF0gPSB0b1BvaW50WzBdID0gTWF0aC5yb3VuZChmcm9tUG9pbnRbMF0pIC0gKHdpZHRoICUgMiAvIDIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChmcm9tUG9pbnRbMV0gPT09IHRvUG9pbnRbMV0pIHtcbiAgICAgICAgICAgIGZyb21Qb2ludFsxXSA9IHRvUG9pbnRbMV0gPSBNYXRoLnJvdW5kKGZyb21Qb2ludFsxXSkgKyAod2lkdGggJSAyIC8gMik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gJ00nICsgZnJvbVBvaW50LmpvaW4oJyAnKSArICdMJyArIHRvUG9pbnQuam9pbignICcpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgY2VudGVyIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IGZyb21Qb3MgZnJvbSBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSB0b1BvcyB0byBwb3NpdGlvblxuICAgICAqIEByZXR1cm5zIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IHBvc2l0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0Q2VudGVyOiBmdW5jdGlvbihmcm9tUG9zLCB0b1Bvcykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbGVmdDogKGZyb21Qb3MubGVmdCArIHRvUG9zLmxlZnQpIC8gMixcbiAgICAgICAgICAgIHRvcDogKGZyb21Qb3MudG9wICsgdG9Qb3MudG9wKSAvIDJcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGxpbmVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIGxpbmUgcGF0aFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb2xvciBsaW5lIGNvbG9yXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHN0cm9rZVdpZHRoIHN0cm9rZSB3aWR0aFxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHJhcGhhZWwgbGluZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlckxpbmU6IGZ1bmN0aW9uKHBhcGVyLCBwYXRoLCBjb2xvciwgc3Ryb2tlV2lkdGgpIHtcbiAgICAgICAgdmFyIGxpbmUgPSBwYXBlci5wYXRoKFtwYXRoXSksXG4gICAgICAgICAgICBzdHJva2VTdHlsZSA9IHtcbiAgICAgICAgICAgICAgICBzdHJva2U6IGNvbG9yLFxuICAgICAgICAgICAgICAgICdzdHJva2Utd2lkdGgnOiBzdHJva2VXaWR0aCB8fCAyXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIGlmIChjb2xvciA9PT0gJ3RyYW5zcGFyZW50Jykge1xuICAgICAgICAgICAgc3Ryb2tlU3R5bGUuc3Ryb2tlID0gJyNmZmYnO1xuICAgICAgICAgICAgc3Ryb2tlU3R5bGVbJ3N0cm9rZS1vcGFjaXR5J10gPSAwO1xuICAgICAgICB9XG4gICAgICAgIGxpbmUuYXR0cihzdHJva2VTdHlsZSk7XG5cbiAgICAgICAgcmV0dXJuIGxpbmU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBiYWNrZ3JvdW5kIGxpbmVzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXkuPHN0cmluZz4+fSBncm91cFBhdGhzIHBhdGhzXG4gICAgICogQHJldHVybnMge2FycmF5LjxhcnJheS48b2JqZWN0Pj59IGxpbmVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyQmdMaW5lczogZnVuY3Rpb24ocGFwZXIsIGdyb3VwUGF0aHMpIHtcbiAgICAgICAgdmFyIGdyb3VwTGluZXMgPSB0aGlzLl9yZW5kZXJMaW5lcyhwYXBlciwgZ3JvdXBQYXRocywgW10sIDEwKTtcbiAgICAgICAgcmV0dXJuIGdyb3VwTGluZXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBsaW5lcy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5LjxzdHJpbmc+Pn0gZ3JvdXBQYXRocyBwYXRoc1xuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IGNvbG9ycyBsaW5lIGNvbG9yc1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdHJva2VXaWR0aCBzdHJva2Ugd2lkdGhcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gbGluZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJMaW5lczogZnVuY3Rpb24ocGFwZXIsIGdyb3VwUGF0aHMsIGNvbG9ycywgc3Ryb2tlV2lkdGgpIHtcbiAgICAgICAgdmFyIGdyb3VwTGluZXMgPSBuZS51dGlsLm1hcChncm91cFBhdGhzLCBmdW5jdGlvbihwYXRocywgZ3JvdXBJbmRleCkge1xuICAgICAgICAgICAgdmFyIGNvbG9yID0gY29sb3JzW2dyb3VwSW5kZXhdIHx8ICd0cmFuc3BhcmVudCc7XG4gICAgICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAocGF0aHMsIGZ1bmN0aW9uKHBhdGgpIHtcbiAgICAgICAgICAgICAgICB2YXIgZmlyc3RMaW5lID0gdGhpcy5fcmVuZGVyTGluZShwYXBlciwgcGF0aFswXSwgY29sb3IsIHN0cm9rZVdpZHRoKSxcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kTGluZSA9IHRoaXMuX3JlbmRlckxpbmUocGFwZXIsIHBhdGhbMV0sIGNvbG9yLCBzdHJva2VXaWR0aCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtmaXJzdExpbmUsIHNlY29uZExpbmVdO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIHJldHVybiBncm91cExpbmVzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgbGluZXMgcGF0aC5cbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheS48b2JqZWN0Pj59IGdyb3VwUG9zaXRpb25zIHBvc2l0aW9uc1xuICAgICAqIEByZXR1cm5zIHthcnJheS48YXJyYXkuPHN0cmluZz4+fSBwYXRoc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldExpbmVzUGF0aDogZnVuY3Rpb24oZ3JvdXBQb3NpdGlvbnMpIHtcbiAgICAgICAgdmFyIGdyb3VwUGF0aHMgPSBuZS51dGlsLm1hcChncm91cFBvc2l0aW9ucywgZnVuY3Rpb24ocG9zaXRpb25zKSB7XG4gICAgICAgICAgICB2YXIgZnJvbVBvcyA9IHBvc2l0aW9uc1swXSxcbiAgICAgICAgICAgICAgICByZXN0ID0gcG9zaXRpb25zLnNsaWNlKDEpO1xuICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwubWFwKHJlc3QsIGZ1bmN0aW9uKHBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNlbnRlclBvcyA9IHRoaXMuX2dldENlbnRlcihmcm9tUG9zLCBwb3NpdGlvbiksXG4gICAgICAgICAgICAgICAgICAgIGZpcnN0UGF0aCA9IHRoaXMuX21ha2VMaW5lUGF0aChmcm9tUG9zLmxlZnQsIGZyb21Qb3MudG9wLCBjZW50ZXJQb3MubGVmdCwgY2VudGVyUG9zLnRvcCksXG4gICAgICAgICAgICAgICAgICAgIHNlY29uZFBhdGggPSB0aGlzLl9tYWtlTGluZVBhdGgoY2VudGVyUG9zLmxlZnQsIGNlbnRlclBvcy50b3AsIHBvc2l0aW9uLmxlZnQsIHBvc2l0aW9uLnRvcCk7XG4gICAgICAgICAgICAgICAgZnJvbVBvcyA9IHBvc2l0aW9uO1xuICAgICAgICAgICAgICAgIHJldHVybiBbZmlyc3RQYXRoLCBzZWNvbmRQYXRoXTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIGdyb3VwUGF0aHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJpbmQgaG92ZXIgZXZlbnQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRhcmdldCByYXBoYWVsIGl0ZW1cbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gcG9zaXRpb24gcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgaWRcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBpbkNhbGxiYWNrIGluIGNhbGxiYWNrXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gb3V0Q2FsbGJhY2sgb3V0IGNhbGxiYWNrXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYmluZEhvdmVyRXZlbnQ6IGZ1bmN0aW9uKHRhcmdldCwgcG9zaXRpb24sIGlkLCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjaykge1xuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgIHRhcmdldC5ob3ZlcihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoYXQuc2hvd2VkSWQgPSBpZDtcbiAgICAgICAgICAgIGluQ2FsbGJhY2socG9zaXRpb24sIGlkKTtcbiAgICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBvdXRDYWxsYmFjayhpZCk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggZXZlbnQuXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXkuPG9iamVjdD4+fSBncm91cERvdHMgZG90c1xuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gZ3JvdXBQb3NpdGlvbnMgcG9zaXRpb25zXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG91dERvdFN0eWxlIGRvdCBzdHlsZVxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGluQ2FsbGJhY2sgaW4gY2FsbGJhY2tcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvdXRDYWxsYmFjayBvdXQgY2FsbGJhY2tcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hdHRhY2hFdmVudDogZnVuY3Rpb24oZ3JvdXBEb3RzLCBncm91cFBvc2l0aW9ucywgb3V0RG90U3R5bGUsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKSB7XG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaChncm91cERvdHMsIGZ1bmN0aW9uKGRvdHMsIGdyb3VwSW5kZXgpIHtcbiAgICAgICAgICAgIG5lLnV0aWwuZm9yRWFjaChkb3RzLCBmdW5jdGlvbihkb3QsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdmFyIHBvc2l0aW9uID0gZ3JvdXBQb3NpdGlvbnNbZ3JvdXBJbmRleF1baW5kZXhdLFxuICAgICAgICAgICAgICAgICAgICBpZCA9IGluZGV4ICsgJy0nICsgZ3JvdXBJbmRleDtcbiAgICAgICAgICAgICAgICAgICAgLy9wcmV2SW5kZXgsIHByZXZEb3QsIHByZXZQb3NpdG9uLCBwcmV2SWQsIGJnTGluZXMsIGxpbmVzO1xuICAgICAgICAgICAgICAgIHRoaXMuX2JpbmRIb3ZlckV2ZW50KGRvdCwgcG9zaXRpb24sIGlkLCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgLy9pZiAoaW5kZXggPiAwKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgcHJldkluZGV4ID0gaW5kZXggLSAxO1xuICAgICAgICAgICAgICAgIC8vICAgIHByZXZEb3QgPSBzY29wZVtwcmV2SW5kZXhdO1xuICAgICAgICAgICAgICAgIC8vICAgIHByZXZQb3NpdG9uID0gZ3JvdXBQb3NpdGlvbnNbZ3JvdXBJbmRleF1bcHJldkluZGV4XTtcbiAgICAgICAgICAgICAgICAvLyAgICBwcmV2SWQgPSBwcmV2SW5kZXggKyAnLScgKyBncm91cEluZGV4O1xuICAgICAgICAgICAgICAgIC8vICAgIC8vYmdMaW5lcyA9IGdyb3VwQmdMaW5lc1tncm91cEluZGV4XVtwcmV2SW5kZXhdO1xuICAgICAgICAgICAgICAgIC8vICAgIGxpbmVzID0gZ3JvdXBMaW5lc1tncm91cEluZGV4XVtwcmV2SW5kZXhdO1xuICAgICAgICAgICAgICAgIC8vICAgIHRoaXMuX2JpbmRIb3ZlckV2ZW50KGJnTGluZXNbMF0sIHByZXZEb3QsIG91dERvdFN0eWxlLCBwcmV2UG9zaXRvbiwgcHJldklkLCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgLy8gICAgdGhpcy5fYmluZEhvdmVyRXZlbnQoYmdMaW5lc1sxXSwgZG90LCBvdXREb3RTdHlsZSwgcG9zaXRpb24sIGlkLCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgLy8gICAgdGhpcy5fYmluZEhvdmVyRXZlbnQobGluZXNbMF0sIHByZXZEb3QsIG91dERvdFN0eWxlLCBwcmV2UG9zaXRvbiwgcHJldklkLCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgLy8gICAgdGhpcy5fYmluZEhvdmVyRXZlbnQobGluZXNbMV0sIGRvdCwgb3V0RG90U3R5bGUsIHBvc2l0aW9uLCBpZCwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIC8vfVxuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTaG93IGFuaW1hdGlvbi5cbiAgICAgKiBAcGFyYW0ge3tncm91cEluZGV4OiBudW1iZXIsIGluZGV4Om51bWJlcn19IGRhdGEgc2hvdyBpbmZvXG4gICAgICovXG4gICAgc2hvd0FuaW1hdGlvbjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgaW5kZXggPSBkYXRhLmdyb3VwSW5kZXgsIC8vIExpbmUgY2hhcnQgaGFzIHBpdm90IHZhbHVlcy5cbiAgICAgICAgICAgIGdyb3VwSW5kZXggPSBkYXRhLmluZGV4LFxuICAgICAgICAgICAgZG90ID0gdGhpcy5ncm91cERvdHNbZ3JvdXBJbmRleF1baW5kZXhdO1xuXG4gICAgICAgIGRvdC5hdHRyKHtcbiAgICAgICAgICAgICdmaWxsLW9wYWNpdHknOiAxLFxuICAgICAgICAgICAgJ3N0cm9rZS1vcGFjaXR5JzogMC4zLFxuICAgICAgICAgICAgJ3N0cm9rZS13aWR0aCc6IDMsXG4gICAgICAgICAgICByOiBIT1ZFUl9ET1RfV0lEVEhcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhpZGUgYW5pbWF0aW9uLlxuICAgICAqIEBwYXJhbSB7e2dyb3VwSW5kZXg6IG51bWJlciwgaW5kZXg6bnVtYmVyfX0gZGF0YSBoaWRlIGluZm9cbiAgICAgKi9cbiAgICBoaWRlQW5pbWF0aW9uOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBpbmRleCA9IGRhdGEuZ3JvdXBJbmRleCwgLy8gTGluZSBjaGFydCBoYXMgcGl2b3QgdmFsdWVzLlxuICAgICAgICAgICAgZ3JvdXBJbmRleCA9IGRhdGEuaW5kZXgsXG4gICAgICAgICAgICBkb3QgPSB0aGlzLmdyb3VwRG90c1tncm91cEluZGV4XVtpbmRleF07XG5cbiAgICAgICAgZG90LmF0dHIodGhpcy5vdXREb3RTdHlsZSk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmFwaGFlbExpbmVDaGFydDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBSYXBoYWVsIHBpZSBjaGFydCByZW5kZXJlci5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJhcGhhZWwgPSB3aW5kb3cuUmFwaGFlbCxcbiAgICBSQUQgPSBNYXRoLlBJIC8gMTgwLFxuICAgIEFOSU1BVElPTl9USU1FID0gNTAwO1xuXG4vKipcbiAqIEBjbGFzc2Rlc2MgUmFwaGFlbFBpZUNoYXJ0cyBpcyBncmFwaCByZW5kZXJlci5cbiAqIEBjbGFzcyBSYXBoYWVsUGllQ2hhcnRcbiAqL1xudmFyIFJhcGhhZWxQaWVDaGFydCA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBSYXBoYWVsUGllQ2hhcnQucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBSZW5kZXIgZnVuY3Rpb24gb3IgbGluZSBjaGFydC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciBjb250YWluZXJcbiAgICAgKiBAcGFyYW0ge3twZXJjZW50VmFsdWVzOiBhcnJheS48bnVtYmVyPiwgY2lyY2xlQm91bmRzOiB7Y3g6IG51bWJlciwgY3k6IG51bWJlciwgcjogbnVtYmVyfSwgZGltZW5zaW9uOiBvYmplY3QsIHRoZW1lOiBvYmplY3QsIG9wdGlvbnM6IG9iamVjdH19IGRhdGEgcmVuZGVyIGRhdGFcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBpbkNhbGxiYWNrIGluIGNhbGxiYWNrXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gb3V0Q2FsbGJhY2sgb3V0IGNhbGxiYWNrXG4gICAgICogQHJldHVybiB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICovXG4gICAgcmVuZGVyOiBmdW5jdGlvbihwYXBlciwgY29udGFpbmVyLCBkYXRhLCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjaykge1xuICAgICAgICB2YXIgZGltZW5zaW9uID0gZGF0YS5kaW1lbnNpb247XG4gICAgICAgIGlmICghcGFwZXIpIHtcbiAgICAgICAgICAgIHBhcGVyID0gUmFwaGFlbChjb250YWluZXIsIGRpbWVuc2lvbi53aWR0aCwgZGltZW5zaW9uLmhlaWdodCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fcmVuZGVyUGllKHBhcGVyLCBkYXRhLCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjayk7XG5cbiAgICAgICAgcmV0dXJuIHBhcGVyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgc2VjdG9yXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKiAgICAgIEBwYXJhbSB7e2N4OiBudW1iZXIsIGN5OiBudW1iZXIsIHI6bnVtYmVyfX0gcGFyYW1zLmNpcmNsZUJvdW5kcyBjaXJjbGUgYm91bmRzXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnN0YXJ0QW5nbGUgc3RhcnQgYW5nbGVcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuZW5kQW5nbGUgZW5kIGFuZ2xlXG4gICAgICogICAgICBAcGFyYW0ge3tmaWxsOiBzdHJpbmcsIHN0cm9rZTogc3RyaW5nLCBzdHJpa2Utd2lkdGg6IHN0cmluZ319IHBhcmFtcy5hdHRycyBhdHRyc1xuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHJhcGhhZWwgb2JqZWN0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyU2VjdG9yOiBmdW5jdGlvbiAocGFyYW1zKSB7XG4gICAgICAgIHZhciBjeCA9IHBhcmFtcy5jaXJjbGVCb3VuZHMuY3gsXG4gICAgICAgICAgICBjeSA9IHBhcmFtcy5jaXJjbGVCb3VuZHMuY3ksXG4gICAgICAgICAgICByID0gcGFyYW1zLmNpcmNsZUJvdW5kcy5yLFxuICAgICAgICAgICAgeDEgPSBjeCArIHIgKiBNYXRoLmNvcygtcGFyYW1zLnN0YXJ0QW5nbGUgKiBSQUQpLFxuICAgICAgICAgICAgeDIgPSBjeCArIHIgKiBNYXRoLmNvcygtcGFyYW1zLmVuZEFuZ2xlICogUkFEKSxcbiAgICAgICAgICAgIHkxID0gY3kgKyByICogTWF0aC5zaW4oLXBhcmFtcy5zdGFydEFuZ2xlICogUkFEKSxcbiAgICAgICAgICAgIHkyID0gY3kgKyByICogTWF0aC5zaW4oLXBhcmFtcy5lbmRBbmdsZSAqIFJBRCksXG4gICAgICAgICAgICBwYXRoUGFyYW0gPSBbXCJNXCIsIGN4LCBjeSwgXCJMXCIsIHgxLCB5MSwgXCJBXCIsIHIsIHIsIDAsICsocGFyYW1zLmVuZEFuZ2xlIC0gcGFyYW1zLnN0YXJ0QW5nbGUgPiAxODApLCAwLCB4MiwgeTIsIFwielwiXTtcbiAgICAgICAgcmV0dXJuIHBhcmFtcy5wYXBlci5wYXRoKHBhdGhQYXJhbSkuYXR0cihwYXJhbXMuYXR0cnMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgcGllIGdyYXBoLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICogQHBhcmFtIHt7cGVyY2VudFZhbHVlczogYXJyYXkuPG51bWJlcj4sIGNpcmNsZUJvdW5kczoge2N4OiBudW1iZXIsIGN5OiBudW1iZXIsIHI6IG51bWJlcn0sIGRpbWVuc2lvbjogb2JqZWN0LCB0aGVtZTogb2JqZWN0LCBvcHRpb25zOiBvYmplY3R9fSBkYXRhIHJlbmRlciBkYXRhXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gaW5DYWxsYmFjayBpbiBjYWxsYmFja1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG91dENhbGxiYWNrIG91dCBjYWxsYmFja1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlclBpZTogZnVuY3Rpb24ocGFwZXIsIGRhdGEsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKSB7XG4gICAgICAgIHZhciBwZXJjZW50VmFsdWVzID0gZGF0YS5wZXJjZW50VmFsdWVzWzBdLFxuICAgICAgICAgICAgY2lyY2xlQm91bmRzID0gZGF0YS5jaXJjbGVCb3VuZHMsXG4gICAgICAgICAgICBjb2xvcnMgPSBkYXRhLnRoZW1lLmNvbG9ycyxcbiAgICAgICAgICAgIGNoYXJ0QmFja2dyb3VuZCA9IGRhdGEuY2hhcnRCYWNrZ3JvdW5kLFxuICAgICAgICAgICAgY3ggPSBjaXJjbGVCb3VuZHMuY3gsXG4gICAgICAgICAgICBjeSA9IGNpcmNsZUJvdW5kcy5jeSxcbiAgICAgICAgICAgIHIgPSBjaXJjbGVCb3VuZHMucixcbiAgICAgICAgICAgIGFuZ2xlID0gMCxcbiAgICAgICAgICAgIGRlbHRhID0gMTAsXG4gICAgICAgICAgICBjaGFydCA9IHBhcGVyLnNldCgpO1xuXG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KHBlcmNlbnRWYWx1ZXMsIGZ1bmN0aW9uKHBlcmNlbnRWYWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBhbmdsZVBsdXMgPSAzNjAgKiBwZXJjZW50VmFsdWUsXG4gICAgICAgICAgICAgICAgcG9wQW5nbGUgPSBhbmdsZSArIChhbmdsZVBsdXMgLyAyKSxcbiAgICAgICAgICAgICAgICBjb2xvciA9IGNvbG9yc1tpbmRleF0sXG4gICAgICAgICAgICAgICAgcCA9IHRoaXMuX3JlbmRlclNlY3Rvcih7XG4gICAgICAgICAgICAgICAgICAgIHBhcGVyOiBwYXBlcixcbiAgICAgICAgICAgICAgICAgICAgY2lyY2xlQm91bmRzOiBjaXJjbGVCb3VuZHMsXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0QW5nbGU6IGFuZ2xlLFxuICAgICAgICAgICAgICAgICAgICBlbmRBbmdsZTogYW5nbGUgKyBhbmdsZVBsdXMsXG4gICAgICAgICAgICAgICAgICAgIGF0dHJzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxsOiBcIjkwLVwiICsgY29sb3IgKyBcIi1cIiArIGNvbG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3Ryb2tlOiBjaGFydEJhY2tncm91bmQsXG4gICAgICAgICAgICAgICAgICAgICAgICAnc3Ryb2tlLXdpZHRoJzogMVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgcG9zaXRpb24gPSB7XG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IGN4ICsgKHIgKyBkZWx0YSkgKiBNYXRoLmNvcygtcG9wQW5nbGUgKiBSQUQpLFxuICAgICAgICAgICAgICAgICAgICB0b3A6IGN5ICsgKHIgKyBkZWx0YSkgKiBNYXRoLnNpbigtcG9wQW5nbGUgKiBSQUQpXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5fYmluZEhvdmVyRXZlbnQoe1xuICAgICAgICAgICAgICAgIHRhcmdldDogcCxcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogcG9zaXRpb24sXG4gICAgICAgICAgICAgICAgaWQ6ICcwLScgKyBpbmRleCxcbiAgICAgICAgICAgICAgICBpbkNhbGxiYWNrOiBpbkNhbGxiYWNrLFxuICAgICAgICAgICAgICAgIG91dENhbGxiYWNrOiBvdXRDYWxsYmFja1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjaGFydC5wdXNoKHApO1xuICAgICAgICAgICAgYW5nbGUgKz0gYW5nbGVQbHVzO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICB0aGlzLmNpcmNsZUJvdW5kcyA9IGNpcmNsZUJvdW5kcztcbiAgICAgICAgdGhpcy5jaGFydCA9IGNoYXJ0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBCaW5kIGhvdmVyIGV2ZW50LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50YXJnZXQgcmFwaGFlbCBpdGVtXG4gICAgICogICAgICBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gcGFyYW1zLnBvc2l0aW9uIHBvc2l0aW9uXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLmlkIGlkXG4gICAgICogICAgICBAcGFyYW0ge2Z1bmN0aW9ufSBwYXJhbXMuaW5DYWxsYmFjayBpbiBjYWxsYmFja1xuICAgICAqICAgICAgQHBhcmFtIHtmdW5jdGlvbn0gcGFyYW1zLm91dENhbGxiYWNrIG91dCBjYWxsYmFja1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2JpbmRIb3ZlckV2ZW50OiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICBwYXJhbXMudGFyZ2V0Lm1vdXNlb3ZlcihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGF0LnNob3dlZElkID0gcGFyYW1zLmlkO1xuICAgICAgICAgICAgcGFyYW1zLmluQ2FsbGJhY2socGFyYW1zLnBvc2l0aW9uLCBwYXJhbXMuaWQpO1xuICAgICAgICB9KS5tb3VzZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBwYXJhbXMub3V0Q2FsbGJhY2socGFyYW1zLmlkKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNob3cgYW5pbWF0aW9uLlxuICAgICAqIEBwYXJhbSB7e2dyb3VwSW5kZXg6IG51bWJlciwgaW5kZXg6bnVtYmVyfX0gZGF0YSBzaG93IGluZm9cbiAgICAgKi9cbiAgICBzaG93QW5pbWF0aW9uOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciB0YXJnZXQgPSB0aGlzLmNoYXJ0W2RhdGEuaW5kZXhdLFxuICAgICAgICAgICAgY3ggPSB0aGlzLmNpcmNsZUJvdW5kcy5jeCxcbiAgICAgICAgICAgIGN5ID0gdGhpcy5jaXJjbGVCb3VuZHMuY3k7XG4gICAgICAgIHRhcmdldC5zdG9wKCkuYW5pbWF0ZSh7dHJhbnNmb3JtOiBcInMxLjEgMS4xIFwiICsgY3ggKyBcIiBcIiArIGN5fSwgQU5JTUFUSU9OX1RJTUUsIFwiZWxhc3RpY1wiKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSGlkZSBhbmltYXRpb24uXG4gICAgICogQHBhcmFtIHt7Z3JvdXBJbmRleDogbnVtYmVyLCBpbmRleDpudW1iZXJ9fSBkYXRhIGhpZGUgaW5mb1xuICAgICAqL1xuICAgIGhpZGVBbmltYXRpb246IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIHRhcmdldCA9IHRoaXMuY2hhcnRbZGF0YS5pbmRleF07XG4gICAgICAgIHRhcmdldC5zdG9wKCkuYW5pbWF0ZSh7dHJhbnNmb3JtOiBcIlwifSwgQU5JTUFUSU9OX1RJTUUsIFwiZWxhc3RpY1wiKTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSYXBoYWVsUGllQ2hhcnQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjaGFydENvbnN0ID0gcmVxdWlyZSgnLi9jb25zdC5qcycpLFxuICAgIGNoYXJ0RmFjdG9yeSA9IHJlcXVpcmUoJy4vZmFjdG9yaWVzL2NoYXJ0RmFjdG9yeS5qcycpLFxuICAgIEJhckNoYXJ0ID0gcmVxdWlyZSgnLi9jaGFydHMvYmFyQ2hhcnQuanMnKSxcbiAgICBDb2x1bW5DaGFydCA9IHJlcXVpcmUoJy4vY2hhcnRzL2NvbHVtbkNoYXJ0LmpzJyksXG4gICAgTGluZUNoYXJ0ID0gcmVxdWlyZSgnLi9jaGFydHMvbGluZUNoYXJ0LmpzJyksXG4gICAgQ29tYm9DaGFydCA9IHJlcXVpcmUoJy4vY2hhcnRzL2NvbWJvQ2hhcnQuanMnKSxcbiAgICBQaWVDaGFydCA9IHJlcXVpcmUoJy4vY2hhcnRzL3BpZUNoYXJ0LmpzJyk7XG5cbmNoYXJ0RmFjdG9yeS5yZWdpc3RlcihjaGFydENvbnN0LkNIQVJUX1RZUEVfQkFSLCBCYXJDaGFydCk7XG5jaGFydEZhY3RvcnkucmVnaXN0ZXIoY2hhcnRDb25zdC5DSEFSVF9UWVBFX0NPTFVNTiwgQ29sdW1uQ2hhcnQpO1xuY2hhcnRGYWN0b3J5LnJlZ2lzdGVyKGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9MSU5FLCBMaW5lQ2hhcnQpO1xuY2hhcnRGYWN0b3J5LnJlZ2lzdGVyKGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9DT01CTywgQ29tYm9DaGFydCk7XG5jaGFydEZhY3RvcnkucmVnaXN0ZXIoY2hhcnRDb25zdC5DSEFSVF9UWVBFX1BJRSwgUGllQ2hhcnQpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4vY29uc3QuanMnKSxcbiAgICB0aGVtZUZhY3RvcnkgPSByZXF1aXJlKCcuL2ZhY3Rvcmllcy90aGVtZUZhY3RvcnkuanMnKSxcbiAgICBkZWZhdWx0VGhlbWUgPSByZXF1aXJlKCcuL3RoZW1lcy9kZWZhdWx0VGhlbWUuanMnKTtcblxudGhlbWVGYWN0b3J5LnJlZ2lzdGVyKGNoYXJ0Q29uc3QuREVGQVVMVF9USEVNRV9OQU1FLCBkZWZhdWx0VGhlbWUpO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEJhciBjaGFydCBzZXJpZXMgY29tcG9uZW50LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU2VyaWVzID0gcmVxdWlyZSgnLi9zZXJpZXMuanMnKSxcbiAgICByZW5kZXJVdGlsID0gcmVxdWlyZSgnLi4vaGVscGVycy9yZW5kZXJVdGlsLmpzJyk7XG5cbnZhciBISURERU5fV0lEVEggPSAxO1xuXG52YXIgQmFyQ2hhcnRTZXJpZXMgPSBuZS51dGlsLmRlZmluZUNsYXNzKFNlcmllcywgLyoqIEBsZW5kcyBTZXJpZXMucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBCYXIgY2hhcnQgc2VyaWVzIGNvbXBvbmVudC5cbiAgICAgKiBAY29uc3RydWN0cyBCYXJDaGFydFNlcmllc1xuICAgICAqIEBleHRlbmRzIFNlcmllc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5tb2RlbCBzZXJpZXMgbW9kZWxcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMub3B0aW9ucyBzZXJpZXMgb3B0aW9uc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBzZXJpZXMgdGhlbWVcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgU2VyaWVzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYm91bmRzIG9mIGJhciBjaGFydC5cbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6bnVtYmVyfX0gZGltZW5zaW9uIGJhciBjaGFydCBkaW1lbnNpb25cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaGlkZGVuV2lkdGggaGlkZGVuIHdpZHRoXG4gICAgICogQHJldHVybnMge2FycmF5LjxhcnJheS48b2JqZWN0Pj59IGJvdW5kc1xuICAgICAqL1xuICAgIF9tYWtlQm91bmRzOiBmdW5jdGlvbihkaW1lbnNpb24sIGhpZGRlbldpZHRoKSB7XG4gICAgICAgIGhpZGRlbldpZHRoID0gaGlkZGVuV2lkdGggfHwgKHJlbmRlclV0aWwuaXNJRTgoKSA/IDAgOiBISURERU5fV0lEVEgpO1xuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5zdGFja2VkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbWFrZU5vcm1hbEJhckJvdW5kcyhkaW1lbnNpb24sIGhpZGRlbldpZHRoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9tYWtlU3RhY2tlZEJhckJvdW5kcyhkaW1lbnNpb24sIGhpZGRlbldpZHRoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGJvdW5kcyBvZiBub3JtYWwgYmFyIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDpudW1iZXJ9fSBkaW1lbnNpb24gYmFyIGNoYXJ0IGRpbWVuc2lvblxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBoaWRkZW5XaWR0aCBoaWRkZW4gd2lkdGhcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gYm91bmRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZU5vcm1hbEJhckJvdW5kczogZnVuY3Rpb24oZGltZW5zaW9uLCBoaWRkZW5XaWR0aCkge1xuICAgICAgICB2YXIgZ3JvdXBWYWx1ZXMgPSB0aGlzLnBlcmNlbnRWYWx1ZXMsXG4gICAgICAgICAgICBncm91cEhlaWdodCA9IChkaW1lbnNpb24uaGVpZ2h0IC8gZ3JvdXBWYWx1ZXMubGVuZ3RoKSxcbiAgICAgICAgICAgIGJhckhlaWdodCA9IGdyb3VwSGVpZ2h0IC8gKGdyb3VwVmFsdWVzWzBdLmxlbmd0aCArIDEpLFxuICAgICAgICAgICAgYm91bmRzID0gbmUudXRpbC5tYXAoZ3JvdXBWYWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcywgZ3JvdXBJbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciBwYWRkaW5nVG9wID0gKGdyb3VwSGVpZ2h0ICogZ3JvdXBJbmRleCkgKyAoYmFySGVpZ2h0IC8gMikgKyBoaWRkZW5XaWR0aDtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbiAodmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3A6IHBhZGRpbmdUb3AgKyAoYmFySGVpZ2h0ICogaW5kZXgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogLUhJRERFTl9XSURUSCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiB2YWx1ZSAqIGRpbWVuc2lvbi53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogYmFySGVpZ2h0XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGJvdW5kcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBib3VuZHMgb2Ygc3RhY2tlZCBiYXIgY2hhcnQuXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0Om51bWJlcn19IGRpbWVuc2lvbiBiYXIgY2hhcnQgZGltZW5zaW9uXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGhpZGRlbldpZHRoIGhpZGRlbiB3aWR0aFxuICAgICAqIEByZXR1cm5zIHthcnJheS48YXJyYXkuPG9iamVjdD4+fSBib3VuZHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlU3RhY2tlZEJhckJvdW5kczogZnVuY3Rpb24oZGltZW5zaW9uLCBoaWRkZW5XaWR0aCkge1xuICAgICAgICB2YXIgZ3JvdXBWYWx1ZXMgPSB0aGlzLnBlcmNlbnRWYWx1ZXMsXG4gICAgICAgICAgICBncm91cEhlaWdodCA9IChkaW1lbnNpb24uaGVpZ2h0IC8gZ3JvdXBWYWx1ZXMubGVuZ3RoKSxcbiAgICAgICAgICAgIGJhckhlaWdodCA9IGdyb3VwSGVpZ2h0IC8gMixcbiAgICAgICAgICAgIGJvdW5kcyA9IG5lLnV0aWwubWFwKGdyb3VwVmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMsIGdyb3VwSW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFkZGluZ1RvcCA9IChncm91cEhlaWdodCAqIGdyb3VwSW5kZXgpICsgKGJhckhlaWdodCAvIDIpICsgaGlkZGVuV2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIGxlZnQgPSAtSElEREVOX1dJRFRIO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgd2lkdGggPSB2YWx1ZSAqIGRpbWVuc2lvbi53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvdW5kID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogcGFkZGluZ1RvcCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiBsZWZ0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IGJhckhlaWdodFxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgbGVmdCA9IGxlZnQgKyB3aWR0aDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJvdW5kO1xuICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBib3VuZHM7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmFyQ2hhcnRTZXJpZXM7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgQ29sdW1uIGNoYXJ0IHNlcmllcyBjb21wb25lbnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTZXJpZXMgPSByZXF1aXJlKCcuL3Nlcmllcy5qcycpO1xuXG52YXIgSElEREVOX1dJRFRIID0gMTtcblxudmFyIENvbHVtbkNoYXJ0U2VyaWVzID0gbmUudXRpbC5kZWZpbmVDbGFzcyhTZXJpZXMsIC8qKiBAbGVuZHMgU2VyaWVzLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogQ29sdW1uIGNoYXJ0IHNlcmllcyBjb21wb25lbnQuXG4gICAgICogQGNvbnN0cnVjdHMgQ29sdW1uQ2hhcnRTZXJpZXNcbiAgICAgKiBAZXh0ZW5kcyBTZXJpZXNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMubW9kZWwgc2VyaWVzIG1vZGVsXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgc2VyaWVzIG9wdGlvbnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgc2VyaWVzIHRoZW1lXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIFNlcmllcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGJvdW5kcyBvZiBjb2x1bW4gY2hhcnQuXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0Om51bWJlcn19IGRpbWVuc2lvbiBjb2x1bW4gY2hhcnQgZGltZW5zaW9uXG4gICAgICogQHJldHVybnMge2FycmF5LjxhcnJheS48b2JqZWN0Pj59IGJvdW5kc1xuICAgICAqL1xuICAgIF9tYWtlQm91bmRzOiBmdW5jdGlvbihkaW1lbnNpb24pIHtcbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuc3RhY2tlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21ha2VOb3JtYWxDb2x1bW5Cb3VuZHMoZGltZW5zaW9uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9tYWtlU3RhY2tlZENvbHVtbkJvdW5kcyhkaW1lbnNpb24pO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYm91bmRzIG9mIG5vcm1hbCBjb2x1bW4gY2hhcnQuXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0Om51bWJlcn19IGRpbWVuc2lvbiBjb2x1bW4gY2hhcnQgZGltZW5zaW9uXG4gICAgICogQHJldHVybnMge2FycmF5LjxhcnJheS48b2JqZWN0Pj59IGJvdW5kc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VOb3JtYWxDb2x1bW5Cb3VuZHM6IGZ1bmN0aW9uKGRpbWVuc2lvbikge1xuICAgICAgICB2YXIgZ3JvdXBWYWx1ZXMgPSB0aGlzLnBlcmNlbnRWYWx1ZXMsXG4gICAgICAgICAgICBncm91cFdpZHRoID0gKGRpbWVuc2lvbi53aWR0aCAvIGdyb3VwVmFsdWVzLmxlbmd0aCksXG4gICAgICAgICAgICBiYXJXaWR0aCA9IGdyb3VwV2lkdGggLyAoZ3JvdXBWYWx1ZXNbMF0ubGVuZ3RoICsgMSksXG4gICAgICAgICAgICBib3VuZHMgPSBuZS51dGlsLm1hcChncm91cFZhbHVlcywgZnVuY3Rpb24odmFsdWVzLCBncm91cEluZGV4KSB7XG4gICAgICAgICAgICAgICAgdmFyIHBhZGRpbmdMZWZ0ID0gKGdyb3VwV2lkdGggKiBncm91cEluZGV4KSArIChiYXJXaWR0aCAvIDIpO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJhckhlaWdodCA9IHZhbHVlICogZGltZW5zaW9uLmhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogZGltZW5zaW9uLmhlaWdodCAtIGJhckhlaWdodCArIEhJRERFTl9XSURUSCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6IHBhZGRpbmdMZWZ0ICsgKGJhcldpZHRoICogaW5kZXgpIC0gSElEREVOX1dJRFRILFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGJhcldpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBiYXJIZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gYm91bmRzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGJvdW5kcyBvZiBzdGFja2VkIGNvbHVtbiBjaGFydC5cbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6bnVtYmVyfX0gZGltZW5zaW9uIGNvbHVtbiBjaGFydCBkaW1lbnNpb25cbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gYm91bmRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVN0YWNrZWRDb2x1bW5Cb3VuZHM6IGZ1bmN0aW9uKGRpbWVuc2lvbikge1xuICAgICAgICB2YXIgZ3JvdXBWYWx1ZXMgPSB0aGlzLnBlcmNlbnRWYWx1ZXMsXG4gICAgICAgICAgICBncm91cFdpZHRoID0gKGRpbWVuc2lvbi53aWR0aCAvIGdyb3VwVmFsdWVzLmxlbmd0aCksXG4gICAgICAgICAgICBiYXJXaWR0aCA9IGdyb3VwV2lkdGggLyAyLFxuICAgICAgICAgICAgYm91bmRzID0gbmUudXRpbC5tYXAoZ3JvdXBWYWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcywgZ3JvdXBJbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciBwYWRkaW5nTGVmdCA9IChncm91cFdpZHRoICogZ3JvdXBJbmRleCkgKyAoYmFyV2lkdGggLyAyKSxcbiAgICAgICAgICAgICAgICAgICAgdG9wID0gMDtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGhlaWdodCA9IHZhbHVlICogZGltZW5zaW9uLmhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvdW5kID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogZGltZW5zaW9uLmhlaWdodCAtIGhlaWdodCAtIHRvcCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiBwYWRkaW5nTGVmdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogYmFyV2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBoZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIHRvcCArPSBoZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBib3VuZDtcbiAgICAgICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gYm91bmRzO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbHVtbkNoYXJ0U2VyaWVzO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IExpbmUgY2hhcnQgc2VyaWVzIGNvbXBvbmVudC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFNlcmllcyA9IHJlcXVpcmUoJy4vc2VyaWVzLmpzJyk7XG5cbnZhciBMaW5lQ2hhcnRTZXJpZXMgPSBuZS51dGlsLmRlZmluZUNsYXNzKFNlcmllcywgLyoqIEBsZW5kcyBTZXJpZXMucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBMaW5lIGNoYXJ0IHNlcmllcyBjb21wb25lbnQuXG4gICAgICogQGNvbnN0cnVjdHMgTGluZUNoYXJ0U2VyaWVzXG4gICAgICogQGV4dGVuZHMgU2VyaWVzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm1vZGVsIHNlcmllcyBtb2RlbFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5vcHRpb25zIHNlcmllcyBvcHRpb25zXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIHNlcmllcyB0aGVtZVxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBTZXJpZXMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBwb3NpdGlvbnMgb2YgbGluZSBjaGFydC5cbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6bnVuYmVyfX0gZGltZW5zaW9uIGxpbmUgY2hhcnQgZGltZW5zaW9uXG4gICAgICogQHJldHVybnMge2FycmF5LjxhcnJheS48b2JqZWN0Pj59IHBvc2l0aW9uc1xuICAgICAqL1xuICAgIF9tYWtlUG9zaXRpb25zOiBmdW5jdGlvbihkaW1lbnNpb24pIHtcbiAgICAgICAgdmFyIGdyb3VwVmFsdWVzID0gdGhpcy5wZXJjZW50VmFsdWVzLFxuICAgICAgICAgICAgd2lkdGggPSBkaW1lbnNpb24ud2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQgPSBkaW1lbnNpb24uaGVpZ2h0LFxuICAgICAgICAgICAgc3RlcCA9IHdpZHRoIC8gZ3JvdXBWYWx1ZXNbMF0ubGVuZ3RoLFxuICAgICAgICAgICAgc3RhcnQgPSBzdGVwIC8gMixcbiAgICAgICAgICAgIHJlc3VsdCA9IG5lLnV0aWwubWFwKGdyb3VwVmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6IHN0YXJ0ICsgKHN0ZXAgKiBpbmRleCksXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3A6IGhlaWdodCAtICh2YWx1ZSAqIGhlaWdodClcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IExpbmVDaGFydFNlcmllcztcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBQaWUgY2hhcnQgc2VyaWVzIGNvbXBvbmVudC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFNlcmllcyA9IHJlcXVpcmUoJy4vc2VyaWVzLmpzJyk7XG5cbnZhciBQaWVDaGFydFNlcmllcyA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoU2VyaWVzLCAvKiogQGxlbmRzIFNlcmllcy5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIExpbmUgY2hhcnQgc2VyaWVzIGNvbXBvbmVudC5cbiAgICAgKiBAY29uc3RydWN0cyBQaWVDaGFydFNlcmllc1xuICAgICAqIEBleHRlbmRzIFNlcmllc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5tb2RlbCBzZXJpZXMgbW9kZWxcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMub3B0aW9ucyBzZXJpZXMgb3B0aW9uc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBzZXJpZXMgdGhlbWVcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgU2VyaWVzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgcGVyY2VudCB2YWx1ZS5cbiAgICAgKiBAcGFyYW0ge3t2YWx1ZXM6IGFycmF5LCBzY2FsZToge21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19fSBkYXRhIHNlcmllcyBkYXRhXG4gICAgICogQHJldHVybnMge2FycmF5LjxhcnJheS48bnVtYmVyPj59IHBlcmNlbnQgdmFsdWVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVBlcmNlbnRWYWx1ZXM6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IG5lLnV0aWwubWFwKGRhdGEudmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgICAgIHZhciBzdW0gPSBuZS51dGlsLnN1bSh2YWx1ZXMpO1xuICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgLyBzdW07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgY2lyY2xlIGJvdW5kc1xuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDpudW1iZXJ9fSBkaW1lbnNpb24gY2hhcnQgZGltZW5zaW9uXG4gICAgICogQHJldHVybnMge3tjeDogbnVtYmVyLCBjeTogbnVtYmVyLCByOiBudW1iZXJ9fSBjaXJjbGUgYm91bmRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUNpcmNsZUJvdW5kczogZnVuY3Rpb24oZGltZW5zaW9uKSB7XG4gICAgICAgIHZhciB3aWR0aCA9IGRpbWVuc2lvbi53aWR0aCxcbiAgICAgICAgICAgIGhlaWdodCA9IGRpbWVuc2lvbi5oZWlnaHQsXG4gICAgICAgICAgICBzdGRTaXplID0gbmUudXRpbC5tdWx0aXBsaWNhdGlvbihuZS51dGlsLm1pbihbd2lkdGgsIGhlaWdodF0pLCAwLjgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY3g6IG5lLnV0aWwuZGl2aXNpb24od2lkdGgsIDIpLFxuICAgICAgICAgICAgY3k6IG5lLnV0aWwuZGl2aXNpb24oaGVpZ2h0LCAyKSxcbiAgICAgICAgICAgIHI6IG5lLnV0aWwuZGl2aXNpb24oc3RkU2l6ZSwgMilcbiAgICAgICAgfTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBQaWVDaGFydFNlcmllcztcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBTZXJpZXMgYmFzZSBjb21wb25lbnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBjaGFydENvbnN0ID0gcmVxdWlyZSgnLi4vY29uc3QuanMnKSxcbiAgICByZW5kZXJVdGlsID0gcmVxdWlyZSgnLi4vaGVscGVycy9yZW5kZXJVdGlsLmpzJyksXG4gICAgZG9tID0gcmVxdWlyZSgnLi4vaGVscGVycy9kb21IYW5kbGVyLmpzJyksXG4gICAgcGx1Z2luRmFjdG9yeSA9IHJlcXVpcmUoJy4uL2ZhY3Rvcmllcy9wbHVnaW5GYWN0b3J5LmpzJyk7XG5cbnZhciBISURERU5fV0lEVEggPSAxO1xuXG52YXIgU2VyaWVzID0gbmUudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIFNlcmllcy5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIFNlcmllcyBiYXNlIGNvbXBvbmVudC5cbiAgICAgKiBAY29uc3RydWN0cyBTZXJpZXNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMubW9kZWwgc2VyaWVzIG1vZGVsXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgc2VyaWVzIG9wdGlvbnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgc2VyaWVzIHRoZW1lXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBsaWJUeXBlO1xuXG4gICAgICAgIG5lLnV0aWwuZXh0ZW5kKHRoaXMsIHBhcmFtcyk7XG4gICAgICAgIGxpYlR5cGUgPSBwYXJhbXMubGliVHlwZSB8fCBjaGFydENvbnN0LkRFRkFVTFRfUExVR0lOO1xuICAgICAgICB0aGlzLnBlcmNlbnRWYWx1ZXMgPSB0aGlzLl9tYWtlUGVyY2VudFZhbHVlcyhwYXJhbXMuZGF0YSwgcGFyYW1zLm9wdGlvbnMuc3RhY2tlZCk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHcmFwaCByZW5kZXJlclxuICAgICAgICAgKiBAdHlwZSB7b2JqZWN0fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5ncmFwaFJlbmRlcmVyID0gcGx1Z2luRmFjdG9yeS5nZXQobGliVHlwZSwgcGFyYW1zLmNoYXJ0VHlwZSk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNlcmllcyB2aWV3IGNsYXNzTmFtZVxuICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jbGFzc05hbWUgPSAnbmUtY2hhcnQtc2VyaWVzLWFyZWEnO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTaG93IHRvb2x0aXAgKG1vdXNlb3ZlciBjYWxsYmFjaykuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHByZWZpeCB0b29sdGlwIGlkIHByZWZpeFxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNWZXJ0aWNhbCB3aGV0aGVyIHZlcnRpY2FsIG9yIG5vdFxuICAgICAqIEBwYXJhbSB7e3RvcDpudW1iZXIsIGxlZnQ6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBib3VuZCBncmFwaCBib3VuZCBpbmZvcm1hdGlvblxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpZCB0b29sdGlwIGlkXG4gICAgICovXG4gICAgc2hvd1Rvb2x0aXA6IGZ1bmN0aW9uKHByZWZpeCwgaXNQb2ludFBvc2l0aW9uLCBib3VuZCwgaWQpIHtcbiAgICAgICAgdGhpcy5maXJlKCdzaG93VG9vbHRpcCcsIHtcbiAgICAgICAgICAgIGlkOiBwcmVmaXggKyBpZCxcbiAgICAgICAgICAgIGlzUG9pbnRQb3NpdGlvbjogaXNQb2ludFBvc2l0aW9uLFxuICAgICAgICAgICAgYm91bmQ6IGJvdW5kXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBIaWRlIHRvb2x0aXAgKG1vdXNlb3V0IGNhbGxiYWNrKS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcHJlZml4IHRvb2x0aXAgaWQgcHJlZml4XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGlkIHRvb2x0aXAgaWRcbiAgICAgKi9cbiAgICBoaWRlVG9vbHRpcDogZnVuY3Rpb24ocHJlZml4LCBpZCkge1xuICAgICAgICB0aGlzLmZpcmUoJ2hpZGVUb29sdGlwJywge1xuICAgICAgICAgICAgaWQ6IHByZWZpeCArIGlkXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgc2VyaWVzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciBvYmplY3QgZm9yIGdyYXBoIGRyYXdpbmdcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHNlcmllcyBlbGVtZW50XG4gICAgICovXG4gICAgcmVuZGVyOiBmdW5jdGlvbihwYXBlcikge1xuICAgICAgICB2YXIgZWwgPSBkb20uY3JlYXRlKCdESVYnLCB0aGlzLmNsYXNzTmFtZSksXG4gICAgICAgICAgICB0b29sdGlwUHJlZml4ID0gdGhpcy50b29sdGlwUHJlZml4LFxuICAgICAgICAgICAgYm91bmQgPSB0aGlzLmJvdW5kLFxuICAgICAgICAgICAgaXNQb2ludFBvc2l0aW9uID0gISF0aGlzLmlzUG9pbnRQb3NpdGlvbixcbiAgICAgICAgICAgIGRpbWVuc2lvbiA9IGJvdW5kLmRpbWVuc2lvbixcbiAgICAgICAgICAgIHBvc2l0aW9uID0gYm91bmQucG9zaXRpb24sXG4gICAgICAgICAgICBpbkNhbGxiYWNrID0gbmUudXRpbC5iaW5kKHRoaXMuc2hvd1Rvb2x0aXAsIHRoaXMsIHRvb2x0aXBQcmVmaXgsIGlzUG9pbnRQb3NpdGlvbiksXG4gICAgICAgICAgICBvdXRDYWxsYmFjayA9IG5lLnV0aWwuYmluZCh0aGlzLmhpZGVUb29sdGlwLCB0aGlzLCB0b29sdGlwUHJlZml4KSxcbiAgICAgICAgICAgIGhpZGRlbldpZHRoID0gcmVuZGVyVXRpbC5pc0lFOCgpID8gMCA6IEhJRERFTl9XSURUSCxcbiAgICAgICAgICAgIGRhdGE7XG5cbiAgICAgICAgaWYgKCFwYXBlcikge1xuICAgICAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJEaW1lbnNpb24oZWwsIGRpbWVuc2lvbik7XG5cbiAgICAgICAgICAgIHBvc2l0aW9uLnRvcCA9IHBvc2l0aW9uLnRvcCArIChpc1BvaW50UG9zaXRpb24gPyAtSElEREVOX1dJRFRIIDogLTEpO1xuICAgICAgICAgICAgcG9zaXRpb24ucmlnaHQgPSBwb3NpdGlvbi5yaWdodCArIChpc1BvaW50UG9zaXRpb24gPyAtKEhJRERFTl9XSURUSCAqIDIpIDogLWhpZGRlbldpZHRoKTtcblxuICAgICAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJQb3NpdGlvbihlbCwgcG9zaXRpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgZGF0YSA9IHtcbiAgICAgICAgICAgIGRpbWVuc2lvbjogZGltZW5zaW9uLFxuICAgICAgICAgICAgdGhlbWU6IHRoaXMudGhlbWUsXG4gICAgICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnNcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAodGhpcy5fbWFrZUJvdW5kcykge1xuICAgICAgICAgICAgZGF0YS5ncm91cEJvdW5kcyA9IHRoaXMuX21ha2VCb3VuZHMoZGltZW5zaW9uKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9tYWtlUG9zaXRpb25zKSB7XG4gICAgICAgICAgICBkYXRhLmdyb3VwUG9zaXRpb25zID0gdGhpcy5fbWFrZVBvc2l0aW9ucyhkaW1lbnNpb24pO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX21ha2VDaXJjbGVCb3VuZHMpIHtcbiAgICAgICAgICAgIGRhdGEucGVyY2VudFZhbHVlcyA9IHRoaXMucGVyY2VudFZhbHVlcztcbiAgICAgICAgICAgIGRhdGEuZm9ybWF0dGVkVmFsdWVzID0gdGhpcy5kYXRhLmZvcm1hdHRlZFZhbHVlcztcbiAgICAgICAgICAgIGRhdGEuY2hhcnRCYWNrZ3JvdW5kID0gdGhpcy5jaGFydEJhY2tncm91bmQ7XG4gICAgICAgICAgICBkYXRhLmNpcmNsZUJvdW5kcyA9IHRoaXMuX21ha2VDaXJjbGVCb3VuZHMoZGltZW5zaW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucGFwZXIgPSB0aGlzLmdyYXBoUmVuZGVyZXIucmVuZGVyKHBhcGVyLCBlbCwgZGF0YSwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spO1xuICAgICAgICByZXR1cm4gZWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBwYXBlci5cbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBvYmplY3QgZm9yIGdyYXBoIGRyYXdpbmdcbiAgICAgKi9cbiAgICBnZXRQYXBlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcGVyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHBlcmNlbnQgdmFsdWUuXG4gICAgICogQHBhcmFtIHt7dmFsdWVzOiBhcnJheSwgc2NhbGU6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fX0gZGF0YSBzZXJpZXMgZGF0YVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzdGFja2VkIHN0YWNrZWQgb3B0aW9uXG4gICAgICogQHJldHVybnMge2FycmF5LjxhcnJheS48bnVtYmVyPj59IHBlcmNlbnQgdmFsdWVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVBlcmNlbnRWYWx1ZXM6IGZ1bmN0aW9uKGRhdGEsIHN0YWNrZWQpIHtcbiAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgaWYgKHN0YWNrZWQgPT09IGNoYXJ0Q29uc3QuU1RBQ0tFRF9OT1JNQUxfVFlQRSkge1xuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5fbWFrZU5vcm1hbFN0YWNrZWRQZXJjZW50VmFsdWVzKGRhdGEpO1xuICAgICAgICB9IGVsc2UgaWYgKHN0YWNrZWQgPT09IGNoYXJ0Q29uc3QuU1RBQ0tFRF9QRVJDRU5UX1RZUEUpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuX21ha2VQZXJjZW50U3RhY2tlZFBlcmNlbnRWYWx1ZXMoZGF0YSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9tYWtlTm9ybWFsUGVyY2VudFZhbHVlcyhkYXRhKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgcGVyY2VudCB2YWx1ZXMgYWJvdXQgbm9ybWFsIHN0YWNrZWQgb3B0aW9uLlxuICAgICAqIEBwYXJhbSB7e3ZhbHVlczogYXJyYXksIHNjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX19IGRhdGEgc2VyaWVzIGRhdGFcbiAgICAgKiBAcmV0dXJucyB7YXJyYXl9IHBlcmNlbnQgdmFsdWVzIGFib3V0IG5vcm1hbCBzdGFja2VkIG9wdGlvbi5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlTm9ybWFsU3RhY2tlZFBlcmNlbnRWYWx1ZXM6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIG1pbiA9IGRhdGEuc2NhbGUubWluLFxuICAgICAgICAgICAgbWF4ID0gZGF0YS5zY2FsZS5tYXgsXG4gICAgICAgICAgICBkaXN0YW5jZSA9IG1heCAtIG1pbixcbiAgICAgICAgICAgIHBlcmNlbnRWYWx1ZXMgPSBuZS51dGlsLm1hcChkYXRhLnZhbHVlcywgZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBsdXNWYWx1ZXMgPSBuZS51dGlsLmZpbHRlcih2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgPiAwO1xuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgc3VtID0gbmUudXRpbC5zdW0ocGx1c1ZhbHVlcyksXG4gICAgICAgICAgICAgICAgICAgIGdyb3VwUGVyY2VudCA9IChzdW0gLSBtaW4pIC8gZGlzdGFuY2U7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGdyb3VwUGVyY2VudCAqICh2YWx1ZSAvIHN1bSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHBlcmNlbnRWYWx1ZXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgcGVyY2VudCB2YWx1ZXMgYWJvdXQgcGVyY2VudCBzdGFja2VkIG9wdGlvbi5cbiAgICAgKiBAcGFyYW0ge3t2YWx1ZXM6IGFycmF5LCBzY2FsZToge21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19fSBkYXRhIHNlcmllcyBkYXRhXG4gICAgICogQHJldHVybnMge2FycmF5fSBwZXJjZW50IHZhbHVlcyBhYm91dCBwZXJjZW50IHN0YWNrZWQgb3B0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVBlcmNlbnRTdGFja2VkUGVyY2VudFZhbHVlczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgcGVyY2VudFZhbHVlcyA9IG5lLnV0aWwubWFwKGRhdGEudmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgICAgIHZhciBwbHVzVmFsdWVzID0gbmUudXRpbC5maWx0ZXIodmFsdWVzLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgPiAwO1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIHN1bSA9IG5lLnV0aWwuc3VtKHBsdXNWYWx1ZXMpO1xuICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgLyBzdW07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBwZXJjZW50VmFsdWVzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIG5vcm1hbCBwZXJjZW50IHZhbHVlLlxuICAgICAqIEBwYXJhbSB7e3ZhbHVlczogYXJyYXksIHNjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX19IGRhdGEgc2VyaWVzIGRhdGFcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxudW1iZXI+Pn0gcGVyY2VudCB2YWx1ZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlTm9ybWFsUGVyY2VudFZhbHVlczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgbWluID0gZGF0YS5zY2FsZS5taW4sXG4gICAgICAgICAgICBtYXggPSBkYXRhLnNjYWxlLm1heCxcbiAgICAgICAgICAgIGRpc3RhbmNlID0gbWF4IC0gbWluLFxuICAgICAgICAgICAgcGVyY2VudFZhbHVlcyA9IG5lLnV0aWwubWFwKGRhdGEudmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKHZhbHVlIC0gbWluKSAvIGRpc3RhbmNlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBwZXJjZW50VmFsdWVzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxsIHNob3dEb3QgZnVuY3Rpb24gb2YgZ3JhcGhSZW5kZXJlci5cbiAgICAgKiBAcGFyYW0ge3tncm91cEluZGV4OiBudW1iZXIsIGluZGV4OiBudW1iZXJ9fSBkYXRhIGRhdGFcbiAgICAgKi9cbiAgICBvblNob3dBbmltYXRpb246IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgaWYgKCF0aGlzLmdyYXBoUmVuZGVyZXIuc2hvd0FuaW1hdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ3JhcGhSZW5kZXJlci5zaG93QW5pbWF0aW9uLmNhbGwodGhpcy5ncmFwaFJlbmRlcmVyLCBkYXRhKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsbCBoaWRlRG90IGZ1bmN0aW9uIG9mIGdyYXBoUmVuZGVyZXIuXG4gICAgICogQHBhcmFtIHt7Z3JvdXBJbmRleDogbnVtYmVyLCBpbmRleDogbnVtYmVyfX0gZGF0YSBkYXRhXG4gICAgICovXG4gICAgb25IaWRlQW5pbWF0aW9uOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIGlmICghdGhpcy5ncmFwaFJlbmRlcmVyLmhpZGVBbmltYXRpb24pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmdyYXBoUmVuZGVyZXIuaGlkZUFuaW1hdGlvbi5jYWxsKHRoaXMuZ3JhcGhSZW5kZXJlciwgZGF0YSk7XG4gICAgfVxufSk7XG5cbm5lLnV0aWwuQ3VzdG9tRXZlbnRzLm1peGluKFNlcmllcyk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2VyaWVzO1xuIiwidmFyIERFRkFVTFRfQ09MT1IgPSAnIzAwMDAwMCcsXG4gICAgREVGQVVMVF9CQUNLR1JPVU5EID0gJyNmZmZmZmYnLFxuICAgIEVNUFRZX0ZPTlQgPSAnJyxcbiAgICBERUZBVUxUX0FYSVMgPSB7XG4gICAgICAgIHRpY2tDb2xvcjogREVGQVVMVF9DT0xPUixcbiAgICAgICAgdGl0bGU6IHtcbiAgICAgICAgICAgIGZvbnRTaXplOiAxMixcbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IEVNUFRZX0ZPTlQsXG4gICAgICAgICAgICBjb2xvcjogREVGQVVMVF9DT0xPUlxuICAgICAgICB9LFxuICAgICAgICBsYWJlbDoge1xuICAgICAgICAgICAgZm9udFNpemU6IDEyLFxuICAgICAgICAgICAgZm9udEZhbWlseTogRU1QVFlfRk9OVCxcbiAgICAgICAgICAgIGNvbG9yOiBERUZBVUxUX0NPTE9SXG4gICAgICAgIH1cbiAgICB9O1xuXG52YXIgZGVmYXVsdFRoZW1lID0ge1xuICAgIGNoYXJ0OiB7XG4gICAgICAgIGJhY2tncm91bmQ6IERFRkFVTFRfQkFDS0dST1VORCxcbiAgICAgICAgZm9udEZhbWlseTogJ1ZlcmRhbmEnXG4gICAgfSxcbiAgICB0aXRsZToge1xuICAgICAgICBmb250U2l6ZTogMTgsXG4gICAgICAgIGZvbnRGYW1pbHk6IEVNUFRZX0ZPTlQsXG4gICAgICAgIGNvbG9yOiBERUZBVUxUX0NPTE9SXG4gICAgfSxcbiAgICB5QXhpczogREVGQVVMVF9BWElTLFxuICAgIHhBeGlzOiBERUZBVUxUX0FYSVMsXG4gICAgcGxvdDoge1xuICAgICAgICBsaW5lQ29sb3I6ICcjZGRkZGRkJyxcbiAgICAgICAgYmFja2dyb3VuZDogJyNmZmZmZmYnXG4gICAgfSxcbiAgICBzZXJpZXM6IHtcbiAgICAgICAgY29sb3JzOiBbJyNhYzQxNDInLCAnI2QyODQ0NScsICcjZjRiZjc1JywgJyM5MGE5NTknLCAnIzc1YjVhYScsICcjNmE5ZmI1JywgJyNhYTc1OWYnLCAnIzhmNTUzNiddXG4gICAgfSxcbiAgICBsZWdlbmQ6IHtcbiAgICAgICAgbGFiZWw6IHtcbiAgICAgICAgICAgIGZvbnRTaXplOiAxMixcbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IEVNUFRZX0ZPTlQsXG4gICAgICAgICAgICBjb2xvcjogREVGQVVMVF9DT0xPUlxuICAgICAgICB9XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBkZWZhdWx0VGhlbWU7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgVG9vbHRpcCBjb21wb25lbnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBkb20gPSByZXF1aXJlKCcuLi9oZWxwZXJzL2RvbUhhbmRsZXIuanMnKSxcbiAgICByZW5kZXJVdGlsID0gcmVxdWlyZSgnLi4vaGVscGVycy9yZW5kZXJVdGlsLmpzJyksXG4gICAgZXZlbnQgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2V2ZW50TGlzdGVuZXIuanMnKSxcbiAgICB0ZW1wbGF0ZU1ha2VyID0gcmVxdWlyZSgnLi4vaGVscGVycy90ZW1wbGF0ZU1ha2VyLmpzJyksXG4gICAgdG9vbHRpcFRlbXBsYXRlID0gcmVxdWlyZSgnLi90b29sdGlwVGVtcGxhdGUuanMnKTtcblxudmFyIFRPT0xUSVBfR0FQID0gNSxcbiAgICBISURERU5fV0lEVEggPSAxLFxuICAgIFRPT0xUSVBfQ0xBU1NfTkFNRSA9ICduZS1jaGFydC10b29sdGlwJyxcbiAgICBISURFX0RFTEFZID0gMDtcblxudmFyIGNvbmNhdCA9IEFycmF5LnByb3RvdHlwZS5jb25jYXQ7XG5cbnZhciBUb29sdGlwID0gbmUudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIFRvb2x0aXAucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBUb29sdGlwIGNvbXBvbmVudC5cbiAgICAgKiBAY29uc3RydWN0cyBUb29sdGlwXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxudW1iZXI+fSBwYXJhbXMudmFsdWVzIGNvbnZlcnRlZCB2YWx1ZXNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXl9IHBhcmFtcy5sYWJlbHMgbGFiZWxzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5fSBwYXJhbXMubGVnZW5kTGFiZWxzIGxlZ2VuZCBsYWJlbHNcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwcmVmaXggdG9vbHRpcCBwcmVmaXhcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuYm91bmQgYXhpcyBib3VuZFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBheGlzIHRoZW1lXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIG5lLnV0aWwuZXh0ZW5kKHRoaXMsIHBhcmFtcyk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUb29sdGlwIHZpZXcgY2xhc3NOYW1lXG4gICAgICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNsYXNzTmFtZSA9ICduZS1jaGFydC10b29sdGlwLWFyZWEnO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgdG9vbHRpcC5cbiAgICAgKiBAcGFyYW0ge3twb3NpdGlvbjogb2JqZWN0fX0gYm91bmQgdG9vbHRpcCBib3VuZFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwcmVmaXggdG9vbHRpcCBpZCBwcmVmaXhcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHRvb2x0aXAgZWxlbWVudFxuICAgICAqL1xuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBlbCA9IGRvbS5jcmVhdGUoJ0RJVicsIHRoaXMuY2xhc3NOYW1lKSxcbiAgICAgICAgICAgIGJvdW5kID0gdGhpcy5ib3VuZDtcblxuICAgICAgICByZW5kZXJVdGlsLnJlbmRlclBvc2l0aW9uKGVsLCBib3VuZC5wb3NpdGlvbik7XG4gICAgICAgIGVsLmlubmVySFRNTCA9IHRoaXMuX21ha2VUb29sdGlwc0h0bWwoKTtcblxuICAgICAgICB0aGlzLmF0dGFjaEV2ZW50KGVsKTtcbiAgICAgICAgcmV0dXJuIGVsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHRvb2x0aXAgZGF0YS5cbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPG9iamVjdD59IHRvb2x0aXAgZGF0YVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VUb29sdGlwRGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBsYWJlbHMgPSB0aGlzLmxhYmVscyxcbiAgICAgICAgICAgIGdyb3VwVmFsdWVzID0gdGhpcy52YWx1ZXMsXG4gICAgICAgICAgICBsZWdlbmRMYWJlbHMgPSB0aGlzLmxlZ2VuZExhYmVscyxcbiAgICAgICAgICAgIHRvb2x0aXBEYXRhID0gbmUudXRpbC5tYXAoZ3JvdXBWYWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcywgZ3JvdXBJbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciBpdGVtcyA9IG5lLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpdGVtID0ge3ZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZ2VuZExhYmVsOiBsZWdlbmRMYWJlbHNbaW5kZXhdLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGdyb3VwSW5kZXggKyAnLScgKyBpbmRleFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBpZiAobGFiZWxzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmxhYmVsID0gbGFiZWxzW2dyb3VwSW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW1zO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBjb25jYXQuYXBwbHkoW10sIHRvb2x0aXBEYXRhKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBodG1sIG9mIHRvb2x0aXAuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGRhdGEgdG9vbHRpcCBkYXRhXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHByZWZpeCB0b29sdGlwIGlkIHByZWZpeFxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGh0bWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlVG9vbHRpcHNIdG1sOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnMsXG4gICAgICAgICAgICBwcmVmaXggPSB0aGlzLnByZWZpeCxcbiAgICAgICAgICAgIGRhdGEgPSB0aGlzLl9tYWtlVG9vbHRpcERhdGEoKSxcbiAgICAgICAgICAgIG9wdGlvblRlbXBsYXRlID0gb3B0aW9ucy50ZW1wbGF0ZSA/IG9wdGlvbnMudGVtcGxhdGUgOiAnJyxcbiAgICAgICAgICAgIHRwbE91dGVyID0gdG9vbHRpcFRlbXBsYXRlLlRQTF9UT09MVElQLFxuICAgICAgICAgICAgdHBsVG9vbHRpcCA9IG9wdGlvblRlbXBsYXRlID8gdGVtcGxhdGVNYWtlci50ZW1wbGF0ZShvcHRpb25UZW1wbGF0ZSkgOiB0b29sdGlwVGVtcGxhdGUuVFBMX0RFRkFVTFRfVEVNUExBVEUsXG4gICAgICAgICAgICBzdWZmaXggPSBvcHRpb25zLnN1ZmZpeCA/ICcmbmJzcDsnICsgb3B0aW9ucy5zdWZmaXggOiAnJyxcbiAgICAgICAgICAgIGh0bWwgPSBuZS51dGlsLm1hcChkYXRhLCBmdW5jdGlvbih0b29sdGlwRGF0YSkge1xuICAgICAgICAgICAgICAgIHZhciBpZCA9IHByZWZpeCArIHRvb2x0aXBEYXRhLmlkLFxuICAgICAgICAgICAgICAgICAgICB0b29sdGlwSHRtbDtcblxuICAgICAgICAgICAgICAgIHRvb2x0aXBEYXRhID0gbmUudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJycsXG4gICAgICAgICAgICAgICAgICAgIGxlZ2VuZExhYmVsOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICcnLFxuICAgICAgICAgICAgICAgICAgICBzdWZmaXg6IHN1ZmZpeFxuICAgICAgICAgICAgICAgIH0sIHRvb2x0aXBEYXRhKTtcbiAgICAgICAgICAgICAgICB0b29sdGlwSHRtbCA9IHRwbFRvb2x0aXAodG9vbHRpcERhdGEpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cGxPdXRlcih7XG4gICAgICAgICAgICAgICAgICAgIGlkOiBpZCxcbiAgICAgICAgICAgICAgICAgICAgaHRtbDogdG9vbHRpcEh0bWxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sIHRoaXMpLmpvaW4oJycpO1xuICAgICAgICByZXR1cm4gaHRtbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGluZGV4IGZyb20gaWRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgdG9vbHRpcCBpZFxuICAgICAqIEByZXR1cm5zIHthcnJheS48bnVtYmVyPn0gaW5kZXhlc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldEluZGV4RnJvbUlkOiBmdW5jdGlvbihpZCkge1xuICAgICAgICB2YXIgaWRzID0gaWQuc3BsaXQoJy0nKSxcbiAgICAgICAgICAgIHNsaWNlSW5kZXggPSBpZHMubGVuZ3RoIC0gMjtcbiAgICAgICAgcmV0dXJuIGlkcy5zbGljZShzbGljZUluZGV4KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmlyZSBjdXN0b20gZXZlbnQgc2hvd0FuaW1hdGlvbi5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgdG9vbHRpcCBpZFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2ZpcmVTaG93QW5pbWF0aW9uOiBmdW5jdGlvbihpZCkge1xuICAgICAgICB2YXIgaW5kZXhlcyA9IHRoaXMuX2dldEluZGV4RnJvbUlkKGlkKTtcbiAgICAgICAgdGhpcy5maXJlKCdzaG93QW5pbWF0aW9uJywge1xuICAgICAgICAgICAgZ3JvdXBJbmRleDogaW5kZXhlc1swXSxcbiAgICAgICAgICAgIGluZGV4OiBpbmRleGVzWzFdXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGaXJlIGN1c3RvbSBldmVudCBoaWRlQW5pbWF0aW9uLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpZCB0b29sdGlwIGlkXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZmlyZUhpZGVBbmltYXRpb246IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdfZmlyZUhpZGVBbmltYXRpb24nKTtcbiAgICAgICAgdmFyIGluZGV4ZXMgPSB0aGlzLl9nZXRJbmRleEZyb21JZChpZCk7XG4gICAgICAgIHRoaXMuZmlyZSgnaGlkZUFuaW1hdGlvbicsIHtcbiAgICAgICAgICAgIGdyb3VwSW5kZXg6IGluZGV4ZXNbMF0sXG4gICAgICAgICAgICBpbmRleDogaW5kZXhlc1sxXVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogT24gbW91c2VvdmVyIGV2ZW50IGhhbmRsZXIgZm9yIHRvb2x0aXAgYXJlYVxuICAgICAqIEBwYXJhbSB7TW91c2VFdmVudH0gZSBtb3VzZSBldmVudFxuICAgICAqL1xuICAgIG9uTW91c2VvdmVyOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciBlbFRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudCxcbiAgICAgICAgICAgIGlkO1xuXG4gICAgICAgIGlmICghZG9tLmhhc0NsYXNzKGVsVGFyZ2V0LCBUT09MVElQX0NMQVNTX05BTUUpKSB7XG4gICAgICAgICAgICBlbFRhcmdldCA9IGRvbS5maW5kUGFyZW50QnlDbGFzcyhlbFRhcmdldCwgVE9PTFRJUF9DTEFTU19OQU1FKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2hvd2VkSWQgPSBpZCA9IGVsVGFyZ2V0LmlkO1xuICAgICAgICB0aGlzLl9maXJlU2hvd0FuaW1hdGlvbihpZCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE9uIG1vdXNlb3V0IGV2ZW50IGhhbmRsZXIgZm9yIHRvb2x0aXAgYXJlYVxuICAgICAqIEBwYXJhbSB7TW91c2VFdmVudH0gZSBtb3VzZSBldmVudFxuICAgICAqL1xuICAgIG9uTW91c2VvdXQ6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIGVsVGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50LFxuICAgICAgICAgICAgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICBpbmRleGVzO1xuXG4gICAgICAgIGlmICghZG9tLmhhc0NsYXNzKGVsVGFyZ2V0LCBUT09MVElQX0NMQVNTX05BTUUpKSB7XG4gICAgICAgICAgICBlbFRhcmdldCA9IGRvbS5maW5kUGFyZW50QnlDbGFzcyhlbFRhcmdldCwgVE9PTFRJUF9DTEFTU19OQU1FKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGluZGV4ZXMgPSB0aGlzLl9nZXRJbmRleEZyb21JZChlbFRhcmdldC5pZCk7XG5cbiAgICAgICAgdGhpcy5faGlkZVRvb2x0aXAoZWxUYXJnZXQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhhdC5maXJlKCdoaWRlQW5pbWF0aW9uJywge1xuICAgICAgICAgICAgICAgIGdyb3VwSW5kZXg6IGluZGV4ZXNbMF0sXG4gICAgICAgICAgICAgICAgaW5kZXg6IGluZGV4ZXNbMV1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlIHRvb2x0aXAgcG9pbnQgcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7e2JvdW5kOiBvYmplY3R9fSBwYXJhbXMuZGF0YSBncmFwaCBpbmZvcm1hdGlvblxuICAgICAqICAgICAgQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBwYXJhbXMuZGltZW5zaW9uIHRvb2x0aXAgZGltZW5zaW9uXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLnBvc2l0aW9uT3B0aW9uIHBvc2l0aW9uIG9wdGlvbiAoZXg6ICdsZWZ0IHRvcCcpXG4gICAgICogQHJldHVybnMge3t0b3A6IG51bWJlciwgbGVmdDogbnVtYmVyfX0gcG9zaXRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jYWxjdWxhdGVQb2ludFBvc2l0aW9uOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGJvdW5kID0gcGFyYW1zLmRhdGEuYm91bmQsXG4gICAgICAgICAgICBtaW51c1dpZHRoID0gcGFyYW1zLmRpbWVuc2lvbi53aWR0aCAtIChib3VuZC53aWR0aCB8fCAwKSxcbiAgICAgICAgICAgIGxpbmVHYXAgPSBib3VuZC53aWR0aCA/IDAgOiBUT09MVElQX0dBUCxcbiAgICAgICAgICAgIHBvc2l0aW9uT3B0aW9uID0gcGFyYW1zLnBvc2l0aW9uT3B0aW9uIHx8ICcnLFxuICAgICAgICAgICAgdG9vbHRpcEhlaWdodCA9IHBhcmFtcy5kaW1lbnNpb24uaGVpZ2h0LFxuICAgICAgICAgICAgcmVzdWx0ID0ge307XG5cbiAgICAgICAgcmVzdWx0LmxlZnQgPSBib3VuZC5sZWZ0ICsgKEhJRERFTl9XSURUSCAqIDIpO1xuICAgICAgICByZXN1bHQudG9wID0gYm91bmQudG9wIC0gdG9vbHRpcEhlaWdodDtcblxuICAgICAgICBpZiAocG9zaXRpb25PcHRpb24uaW5kZXhPZignbGVmdCcpID4gLTEpIHtcbiAgICAgICAgICAgIHJlc3VsdC5sZWZ0IC09IG1pbnVzV2lkdGggKyBsaW5lR2FwO1xuICAgICAgICB9IGVsc2UgaWYgKHBvc2l0aW9uT3B0aW9uLmluZGV4T2YoJ2NlbnRlcicpID4gLTEpIHtcbiAgICAgICAgICAgIHJlc3VsdC5sZWZ0IC09IG1pbnVzV2lkdGggLyAyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0LmxlZnQgKz0gbGluZUdhcDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwb3NpdGlvbk9wdGlvbi5pbmRleE9mKCdib3R0b20nKSA+IC0xKSB7XG4gICAgICAgICAgICByZXN1bHQudG9wICs9IHRvb2x0aXBIZWlnaHQgLSBISURERU5fV0lEVEggKyBsaW5lR2FwO1xuICAgICAgICB9IGVsc2UgaWYgKHBvc2l0aW9uT3B0aW9uLmluZGV4T2YoJ21pZGRsZScpID4gLTEpIHtcbiAgICAgICAgICAgIHJlc3VsdC50b3AgKz0gdG9vbHRpcEhlaWdodCAvIDI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQudG9wIC09IFRPT0xUSVBfR0FQICsgSElEREVOX1dJRFRIO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlIHRvb2x0aXAgcmVjdCBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHt7Ym91bmQ6IG9iamVjdH19IHBhcmFtcy5kYXRhIGdyYXBoIGluZm9ybWF0aW9uXG4gICAgICogICAgICBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IHBhcmFtcy5kaW1lbnNpb24gdG9vbHRpcCBkaW1lbnNpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMucG9zaXRpb25PcHRpb24gcG9zaXRpb24gb3B0aW9uIChleDogJ2xlZnQgdG9wJylcbiAgICAgKiBAcmV0dXJucyB7e3RvcDogbnVtYmVyLCBsZWZ0OiBudW1iZXJ9fSBwb3NpdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NhbGN1bGF0ZVJlY3RQb3NpdGlvbjogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBib3VuZCA9IHBhcmFtcy5kYXRhLmJvdW5kLFxuICAgICAgICAgICAgbWludXNIZWlnaHQgPSBwYXJhbXMuZGltZW5zaW9uLmhlaWdodCAtIChib3VuZC5oZWlnaHQgfHwgMCksXG4gICAgICAgICAgICBwb3NpdGlvbk9wdGlvbiA9IHBhcmFtcy5wb3NpdGlvbk9wdGlvbiB8fCAnJyxcbiAgICAgICAgICAgIHRvb2x0aXBXaWR0aCA9IHBhcmFtcy5kaW1lbnNpb24ud2lkdGgsXG4gICAgICAgICAgICByZXN1bHQgPSB7fTtcblxuICAgICAgICByZXN1bHQubGVmdCA9IGJvdW5kLmxlZnQgKyBib3VuZC53aWR0aDtcbiAgICAgICAgcmVzdWx0LnRvcCA9IGJvdW5kLnRvcDtcbiAgICAgICAgaWYgKHBvc2l0aW9uT3B0aW9uLmluZGV4T2YoJ2xlZnQnKSA+IC0xKSB7XG4gICAgICAgICAgICByZXN1bHQubGVmdCAtPSB0b29sdGlwV2lkdGg7XG4gICAgICAgIH0gZWxzZSBpZiAocG9zaXRpb25PcHRpb24uaW5kZXhPZignY2VudGVyJykgPiAtMSkge1xuICAgICAgICAgICAgcmVzdWx0LmxlZnQgLT0gdG9vbHRpcFdpZHRoIC8gMjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdC5sZWZ0ICs9IFRPT0xUSVBfR0FQO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBvc2l0aW9uT3B0aW9uLmluZGV4T2YoJ3RvcCcpID4gLTEpIHtcbiAgICAgICAgICAgIHJlc3VsdC50b3AgLT0gbWludXNIZWlnaHQgKyBISURERU5fV0lEVEg7XG4gICAgICAgIH0gZWxzZSBpZiAocG9zaXRpb25PcHRpb24uaW5kZXhPZignbWlkZGxlJykgPiAtMSkge1xuICAgICAgICAgICAgcmVzdWx0LnRvcCAtPSBtaW51c0hlaWdodCAvIDI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQudG9wIC09IEhJRERFTl9XSURUSCAqIDI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlIHRvb2x0aXAgcG9zaXRpb24uXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge3tib3VuZDogb2JqZWN0LCBpc1BvaW50UG9zaXRpb246IGJvb2xlYW59fSBwYXJhbXMuZGF0YSBncmFwaCBpbmZvcm1hdGlvblxuICAgICAqICAgICAgQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBwYXJhbXMuZGltZW5zaW9uIHRvb2x0aXAgZGltZW5zaW9uXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLnBvc2l0aW9uT3B0aW9uIHBvc2l0aW9uIG9wdGlvbiAoZXg6ICdsZWZ0IHRvcCcpXG4gICAgICogQHJldHVybnMge3t0b3A6IG51bWJlciwgbGVmdDogbnVtYmVyfX0gcG9zaXRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jYWxjdWxhdGVQb3NpdGlvbjogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICAgICAgaWYgKHBhcmFtcy5kYXRhLmlzUG9pbnRQb3NpdGlvbikge1xuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5fY2FsY3VsYXRlUG9pbnRQb3NpdGlvbihwYXJhbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5fY2FsY3VsYXRlUmVjdFBvc2l0aW9uKHBhcmFtcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb25TaG93IGlzIGNhbGxiYWNrIG9mIGN1c3RvbSBldmVudCBzaG93VG9vbHRpcCBmb3IgU2VyaWVzVmlldy5cbiAgICAgKiBAcGFyYW0ge3tpZDogc3RyaW5nLCBib3VuZDogb2JqZWN0fX0gZGF0YSB0b29sdGlwIGRhdGFcbiAgICAgKi9cbiAgICBvblNob3c6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIGVsVG9vbHRpcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGRhdGEuaWQpLFxuICAgICAgICAgICAgYWRkUG9zaXRpb24gPSBuZS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgbGVmdDogMCxcbiAgICAgICAgICAgICAgICB0b3A6IDBcbiAgICAgICAgICAgIH0sIHRoaXMub3B0aW9ucy5hZGRQb3NpdGlvbiksXG4gICAgICAgICAgICBwb3NpdGlvbk9wdGlvbiA9IHRoaXMub3B0aW9ucy5wb3NpdGlvbiB8fCAnJyxcbiAgICAgICAgICAgIHBvc2l0aW9uO1xuXG4gICAgICAgIGlmICh0aGlzLnNob3dlZElkKSB7XG4gICAgICAgICAgICBkb20ucmVtb3ZlQ2xhc3MoZWxUb29sdGlwLCAnc2hvdycpO1xuICAgICAgICAgICAgdGhpcy5fZmlyZUhpZGVBbmltYXRpb24odGhpcy5zaG93ZWRJZCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNob3dlZElkID0gZGF0YS5pZDtcbiAgICAgICAgZG9tLmFkZENsYXNzKGVsVG9vbHRpcCwgJ3Nob3cnKTtcblxuICAgICAgICBwb3NpdGlvbiA9IHRoaXMuX2NhbGN1bGF0ZVBvc2l0aW9uKHtcbiAgICAgICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgICAgICBkaW1lbnNpb246IHtcbiAgICAgICAgICAgICAgICB3aWR0aDogZWxUb29sdGlwLm9mZnNldFdpZHRoLFxuICAgICAgICAgICAgICAgIGhlaWdodDogZWxUb29sdGlwLm9mZnNldEhlaWdodFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBvc2l0aW9uT3B0aW9uOiBwb3NpdGlvbk9wdGlvbiB8fCAnJ1xuICAgICAgICB9KTtcblxuICAgICAgICBlbFRvb2x0aXAuc3R5bGUuY3NzVGV4dCA9IFtcbiAgICAgICAgICAgIHJlbmRlclV0aWwuY29uY2F0U3RyKCdsZWZ0OicsIHBvc2l0aW9uLmxlZnQgKyBhZGRQb3NpdGlvbi5sZWZ0LCAncHgnKSxcbiAgICAgICAgICAgIHJlbmRlclV0aWwuY29uY2F0U3RyKCd0b3A6JywgcG9zaXRpb24udG9wICsgYWRkUG9zaXRpb24udG9wLCAncHgnKVxuICAgICAgICBdLmpvaW4oJzsnKTtcblxuICAgICAgICB0aGlzLl9maXJlU2hvd0FuaW1hdGlvbihkYXRhLmlkKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb25IaWRlIGlzIGNhbGxiYWNrIG9mIGN1c3RvbSBldmVudCBoaWRlVG9vbHRpcCBmb3IgU2VyaWVzVmlld1xuICAgICAqIEBwYXJhbSB7e2lkOiBzdHJpbmd9fSBkYXRhIHRvb2x0aXAgZGF0YVxuICAgICAqL1xuICAgIG9uSGlkZTogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgZWxUb29sdGlwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZGF0YS5pZCksXG4gICAgICAgICAgICB0aGF0ID0gdGhpcztcblxuICAgICAgICB0aGlzLl9oaWRlVG9vbHRpcChlbFRvb2x0aXAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGluZGV4ZXMgPSB0aGF0Ll9nZXRJbmRleEZyb21JZChkYXRhLmlkKTtcblxuICAgICAgICAgICAgdGhhdC5maXJlKCdoaWRlQW5pbWF0aW9uJywge1xuICAgICAgICAgICAgICAgIGdyb3VwSW5kZXg6IGluZGV4ZXNbMF0sXG4gICAgICAgICAgICAgICAgaW5kZXg6IGluZGV4ZXNbMV1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBkYXRhID0gbnVsbDtcbiAgICAgICAgICAgIGVsVG9vbHRpcCA9IG51bGw7XG4gICAgICAgICAgICB0aGF0ID0gbnVsbDtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhpZGUgdG9vbHRpcC5cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbFRvb2x0aXAgdG9vbHRpcCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgY2FsbGJhY2tcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9oaWRlVG9vbHRpcDogZnVuY3Rpb24oZWxUb29sdGlwLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgIGRlbGV0ZSB0aGlzLnNob3dlZElkO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHRoYXQuc2hvd2VkSWQgPT09IGVsVG9vbHRpcC5pZCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZG9tLnJlbW92ZUNsYXNzKGVsVG9vbHRpcCwgJ3Nob3cnKTtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoYXQgPSBudWxsO1xuICAgICAgICB9LCBISURFX0RFTEFZKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGV2ZW50XG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKi9cbiAgICBhdHRhY2hFdmVudDogZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgZXZlbnQuYmluZEV2ZW50KCdtb3VzZW92ZXInLCBlbCwgbmUudXRpbC5iaW5kKHRoaXMub25Nb3VzZW92ZXIsIHRoaXMpKTtcbiAgICAgICAgZXZlbnQuYmluZEV2ZW50KCdtb3VzZW91dCcsIGVsLCBuZS51dGlsLmJpbmQodGhpcy5vbk1vdXNlb3V0LCB0aGlzKSk7XG4gICAgfVxufSk7XG5cbm5lLnV0aWwuQ3VzdG9tRXZlbnRzLm1peGluKFRvb2x0aXApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRvb2x0aXA7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgVGhpcyBpcyB0ZW1wbGF0ZXMgb2YgdG9vbHRpcCB2aWV3LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxudmFyIHRlbXBsYXRlTWFrZXIgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3RlbXBsYXRlTWFrZXIuanMnKTtcblxudmFyIHRhZ3MgPSB7XG4gICAgSFRNTF9UT09MVElQOiAnPGRpdiBjbGFzcz1cIm5lLWNoYXJ0LXRvb2x0aXBcIiBpZD1cInt7IGlkIH19XCI+e3sgaHRtbCB9fTwvZGl2PicsXG4gICAgSFRNTF9ERUZBVUxUX1RFTVBMQVRFOiAnPGRpdiBjbGFzcz1cIm5lLWNoYXJ0LWRlZmF1bHQtdG9vbHRpcFwiPicgK1xuICAgICAgICAnPGRpdj57eyBsYWJlbCB9fTwvZGl2PicgK1xuICAgICAgICAnPGRpdj4nICtcbiAgICAgICAgICAgICc8c3Bhbj57eyBsZWdlbmRMYWJlbCB9fTwvc3Bhbj46JyArXG4gICAgICAgICAgICAnJm5ic3A7PHNwYW4+e3sgdmFsdWUgfX08L3NwYW4+JyArXG4gICAgICAgICAgICAnPHNwYW4+e3sgc3VmZml4IH19PC9zcGFuPicgK1xuICAgICAgICAnPC9kaXY+JyArXG4gICAgJzwvZGl2Pidcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIFRQTF9UT09MVElQOiB0ZW1wbGF0ZU1ha2VyLnRlbXBsYXRlKHRhZ3MuSFRNTF9UT09MVElQKSxcbiAgICBUUExfREVGQVVMVF9URU1QTEFURTogdGVtcGxhdGVNYWtlci50ZW1wbGF0ZSh0YWdzLkhUTUxfREVGQVVMVF9URU1QTEFURSlcbn07XG4iXX0=
