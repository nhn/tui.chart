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
 *          @param {number} options.yAxis.min minimal value of vertical axis
 *          @param {number} options.yAxis.max maximum value of vertical axis
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
 *          @param {number} options.xAxis.min minimal value of horizontal axis
 *          @param {number} options.xAxis.max maximum value of horizontal axis
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
            chartTheme,
            result;

        if (!chartTypes.length) {
            result = this._setThemeToLabels(joinLegendLabels, theme);
        } else {
            result = this._setThemeToLabels(joinLegendLabels.slice(0, labelLen), theme[chartType]);
            chartTheme = theme[ne.util.filter(chartTypes, function(propName) {
                return propName !== chartType;
            })[0]];
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

},{"../const.js":12,"../helpers/domHandler.js":20,"../helpers/renderUtil.js":22,"./../legends/legendTemplate.js":25}],25:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXhlcy9heGlzLmpzIiwic3JjL2pzL2F4ZXMvYXhpc1RlbXBsYXRlLmpzIiwic3JjL2pzL2NoYXJ0LmpzIiwic3JjL2pzL2NoYXJ0cy9heGlzVHlwZUJhc2UuanMiLCJzcmMvanMvY2hhcnRzL2JhckNoYXJ0LmpzIiwic3JjL2pzL2NoYXJ0cy9jaGFydEJhc2UuanMiLCJzcmMvanMvY2hhcnRzL2NvbHVtbkNoYXJ0LmpzIiwic3JjL2pzL2NoYXJ0cy9jb21ib0NoYXJ0LmpzIiwic3JjL2pzL2NoYXJ0cy9saW5lQ2hhcnQuanMiLCJzcmMvanMvY2hhcnRzL3BpZUNoYXJ0LmpzIiwic3JjL2pzL2NvZGUtc25pcHBldC11dGlsLmpzIiwic3JjL2pzL2NvbnN0LmpzIiwic3JjL2pzL2ZhY3Rvcmllcy9jaGFydEZhY3RvcnkuanMiLCJzcmMvanMvZmFjdG9yaWVzL3BsdWdpbkZhY3RvcnkuanMiLCJzcmMvanMvZmFjdG9yaWVzL3RoZW1lRmFjdG9yeS5qcyIsInNyYy9qcy9oZWxwZXJzL2F4aXNEYXRhTWFrZXIuanMiLCJzcmMvanMvaGVscGVycy9ib3VuZHNNYWtlci5qcyIsInNyYy9qcy9oZWxwZXJzL2NhbGN1bGF0b3IuanMiLCJzcmMvanMvaGVscGVycy9kYXRhQ29udmVydGVyLmpzIiwic3JjL2pzL2hlbHBlcnMvZG9tSGFuZGxlci5qcyIsInNyYy9qcy9oZWxwZXJzL2V2ZW50TGlzdGVuZXIuanMiLCJzcmMvanMvaGVscGVycy9yZW5kZXJVdGlsLmpzIiwic3JjL2pzL2hlbHBlcnMvdGVtcGxhdGVNYWtlci5qcyIsInNyYy9qcy9sZWdlbmRzL2xlZ2VuZC5qcyIsInNyYy9qcy9sZWdlbmRzL2xlZ2VuZFRlbXBsYXRlLmpzIiwic3JjL2pzL3Bsb3RzL3Bsb3QuanMiLCJzcmMvanMvcGxvdHMvcGxvdFRlbXBsYXRlLmpzIiwic3JjL2pzL3BsdWdpbnMvcGx1Z2luUmFwaGFlbC5qcyIsInNyYy9qcy9wbHVnaW5zL3JhcGhhZWxCYXJDaGFydC5qcyIsInNyYy9qcy9wbHVnaW5zL3JhcGhhZWxMaW5lQ2hhcnQuanMiLCJzcmMvanMvcGx1Z2lucy9yYXBoYWVsUGllQ2hhcnQuanMiLCJzcmMvanMvcmVnaXN0ZXJDaGFydHMuanMiLCJzcmMvanMvcmVnaXN0ZXJUaGVtZXMuanMiLCJzcmMvanMvc2VyaWVzL2JhckNoYXJ0U2VyaWVzLmpzIiwic3JjL2pzL3Nlcmllcy9jb2x1bW5DaGFydFNlcmllcy5qcyIsInNyYy9qcy9zZXJpZXMvbGluZUNoYXJ0U2VyaWVzLmpzIiwic3JjL2pzL3Nlcmllcy9waWVDaGFydFNlcmllcy5qcyIsInNyYy9qcy9zZXJpZXMvc2VyaWVzLmpzIiwic3JjL2pzL3RoZW1lcy9kZWZhdWx0VGhlbWUuanMiLCJzcmMvanMvdG9vbHRpcHMvdG9vbHRpcC5qcyIsInNyYy9qcy90b29sdGlwcy90b29sdGlwVGVtcGxhdGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuZUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0V0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbFBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbG1CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeGJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2VkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25ZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgIEF4aXMgY29tcG9uZW50LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZG9tID0gcmVxdWlyZSgnLi4vaGVscGVycy9kb21IYW5kbGVyLmpzJyksXG4gICAgY2FsY3VsYXRvciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvY2FsY3VsYXRvci5qcycpLFxuICAgIHJlbmRlclV0aWwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3JlbmRlclV0aWwuanMnKSxcbiAgICBheGlzVGVtcGxhdGUgPSByZXF1aXJlKCcuL2F4aXNUZW1wbGF0ZS5qcycpO1xuXG52YXIgVElUTEVfQVJFQV9XSURUSF9QQURESU5HID0gMjAsXG4gICAgVl9MQUJFTF9SSUdIVF9QQURESU5HID0gMTA7XG5cbnZhciBBeGlzID0gbmUudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIEF4aXMucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBBeGlzIGNvbXBvbmVudC5cbiAgICAgKiBAY29uc3RydWN0cyBBeGlzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge3tcbiAgICAgKiAgICAgICAgICBsYWJlbHM6IGFycmF5LjxzdHJpbmc+LFxuICAgICAqICAgICAgICAgIHRpY2tDb3VudDogbnVtYmVyLFxuICAgICAqICAgICAgICAgIGlzTGFiZWxBeGlzOiBib29sZWFuLFxuICAgICAqICAgICAgICAgIGlzVmVydGljYWw6IGJvb2xlYW5cbiAgICAgKiAgICAgIH19IHBhcmFtcy5kYXRhIGF4aXMgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5ib3VuZCBheGlzIGJvdW5kXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIGF4aXMgdGhlbWVcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMub3B0aW9ucyBheGlzIG9wdGlvbnNcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgbmUudXRpbC5leHRlbmQodGhpcywgcGFyYW1zKTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEF4aXMgdmlldyBjbGFzc05hbWVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2xhc3NOYW1lID0gJ25lLWNoYXJ0LWF4aXMtYXJlYSc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBheGlzLlxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gYXhpcyBhcmVhIGJhc2UgZWxlbWVudFxuICAgICAqL1xuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBkYXRhID0gdGhpcy5kYXRhLFxuICAgICAgICAgICAgdGhlbWUgPSB0aGlzLnRoZW1lLFxuICAgICAgICAgICAgaXNWZXJ0aWNhbCA9ICEhZGF0YS5pc1ZlcnRpY2FsLFxuICAgICAgICAgICAgaXNQb3NpdGlvblJpZ2h0ID0gZGF0YS5pc1Bvc2l0aW9uUmlnaHQsXG4gICAgICAgICAgICBvcHRpb25zID0gdGhpcy5vcHRpb25zLFxuICAgICAgICAgICAgYm91bmQgPSB0aGlzLmJvdW5kLFxuICAgICAgICAgICAgZGltZW5zaW9uID0gYm91bmQuZGltZW5zaW9uLFxuICAgICAgICAgICAgc2l6ZSA9IGlzVmVydGljYWwgPyBkaW1lbnNpb24uaGVpZ2h0IDogZGltZW5zaW9uLndpZHRoLFxuICAgICAgICAgICAgZWwgPSBkb20uY3JlYXRlKCdESVYnLCB0aGlzLmNsYXNzTmFtZSksXG4gICAgICAgICAgICBlbFRpdGxlQXJlYSA9IHRoaXMuX3JlbmRlclRpdGxlQXJlYSh7XG4gICAgICAgICAgICAgICAgdGl0bGU6IG9wdGlvbnMudGl0bGUsXG4gICAgICAgICAgICAgICAgdGhlbWU6IHRoZW1lLnRpdGxlLFxuICAgICAgICAgICAgICAgIGlzVmVydGljYWw6IGlzVmVydGljYWwsXG4gICAgICAgICAgICAgICAgaXNQb3NpdGlvblJpZ2h0OiBpc1Bvc2l0aW9uUmlnaHQsXG4gICAgICAgICAgICAgICAgc2l6ZTogc2l6ZVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBlbFRpY2tBcmVhID0gdGhpcy5fcmVuZGVyVGlja0FyZWEoc2l6ZSksXG4gICAgICAgICAgICBlbExhYmVsQXJlYSA9IHRoaXMuX3JlbmRlckxhYmVsQXJlYShzaXplLCBkaW1lbnNpb24ud2lkdGgpO1xuICAgICAgICByZW5kZXJVdGlsLnJlbmRlckRpbWVuc2lvbihlbCwgZGltZW5zaW9uKTtcbiAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJQb3NpdGlvbihlbCwgYm91bmQucG9zaXRpb24pO1xuICAgICAgICBkb20uYWRkQ2xhc3MoZWwsIGlzVmVydGljYWwgPyAndmVydGljYWwnIDogJ2hvcml6b250YWwnKTtcbiAgICAgICAgZG9tLmFkZENsYXNzKGVsLCBpc1Bvc2l0aW9uUmlnaHQgPyAncmlnaHQnIDogJycpO1xuICAgICAgICBkb20uYXBwZW5kKGVsLCBbZWxUaXRsZUFyZWEsIGVsVGlja0FyZWEsIGVsTGFiZWxBcmVhXSk7XG5cbiAgICAgICAgcmV0dXJuIGVsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUaXRsZSBhcmVhIHJlbmRlcmVyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLnRpdGxlIGF4aXMgdGl0bGVcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgdGl0bGUgdGhlbWVcbiAgICAgKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gcGFyYW1zLmlzVmVydGljYWwgaXMgdmVydGljYWw/XG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnNpemUgKHdpZHRoIG9yIGhlaWdodClcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHRpdGxlIGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJUaXRsZUFyZWE6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgZWxUaXRsZUFyZWEgPSByZW5kZXJVdGlsLnJlbmRlclRpdGxlKHBhcmFtcy50aXRsZSwgcGFyYW1zLnRoZW1lLCAnbmUtY2hhcnQtdGl0bGUtYXJlYScpLFxuICAgICAgICAgICAgY3NzVGV4dHMgPSBbXTtcblxuICAgICAgICBpZiAoZWxUaXRsZUFyZWEgJiYgcGFyYW1zLmlzVmVydGljYWwpIHtcbiAgICAgICAgICAgIGNzc1RleHRzID0gW1xuICAgICAgICAgICAgICAgIHJlbmRlclV0aWwuY29uY2F0U3RyKCd3aWR0aDonLCBwYXJhbXMuc2l6ZSwgJ3B4JylcbiAgICAgICAgICAgIF07XG4gICAgICAgICAgICBpZiAocGFyYW1zLmlzUG9zaXRpb25SaWdodCkge1xuICAgICAgICAgICAgICAgIGNzc1RleHRzLnB1c2gocmVuZGVyVXRpbC5jb25jYXRTdHIoJ3JpZ2h0OicsIC1wYXJhbXMuc2l6ZSwgJ3B4JykpO1xuICAgICAgICAgICAgICAgIGNzc1RleHRzLnB1c2gocmVuZGVyVXRpbC5jb25jYXRTdHIoJ3RvcDonLCAwLCAncHgnKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNzc1RleHRzLnB1c2gocmVuZGVyVXRpbC5jb25jYXRTdHIoJ2xlZnQ6JywgMCwgJ3B4JykpO1xuICAgICAgICAgICAgICAgIGlmICghcmVuZGVyVXRpbC5pc0lFOCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNzc1RleHRzLnB1c2gocmVuZGVyVXRpbC5jb25jYXRTdHIoJ3RvcDonLCBwYXJhbXMuc2l6ZSwgJ3B4JykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZWxUaXRsZUFyZWEuc3R5bGUuY3NzVGV4dCArPSAnOycgKyBjc3NUZXh0cy5qb2luKCc7Jyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVsVGl0bGVBcmVhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZWRuZXIgdGljayBhcmVhLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzaXplIHNpemUgb3IgaGVpZ2h0XG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSB0aWNrIGFyZWEgZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlclRpY2tBcmVhOiBmdW5jdGlvbihzaXplKSB7XG4gICAgICAgIHZhciBkYXRhID0gdGhpcy5kYXRhLFxuICAgICAgICAgICAgdGlja0NvdW50ID0gZGF0YS50aWNrQ291bnQsXG4gICAgICAgICAgICB0aWNrQ29sb3IgPSB0aGlzLnRoZW1lLnRpY2tDb2xvcixcbiAgICAgICAgICAgIHBvc2l0aW9ucyA9IGNhbGN1bGF0b3IubWFrZVBpeGVsUG9zaXRpb25zKHNpemUsIHRpY2tDb3VudCksXG4gICAgICAgICAgICBlbFRpY2tBcmVhID0gZG9tLmNyZWF0ZSgnRElWJywgJ25lLWNoYXJ0LXRpY2stYXJlYScpLFxuICAgICAgICAgICAgaXNWZXJ0aWNhbCA9IGRhdGEuaXNWZXJ0aWNhbCxcbiAgICAgICAgICAgIHBvc1R5cGUgPSBpc1ZlcnRpY2FsID8gJ2JvdHRvbScgOiAnbGVmdCcsXG4gICAgICAgICAgICBib3JkZXJDb2xvclR5cGUgPSBpc1ZlcnRpY2FsID8gKGRhdGEuaXNQb3NpdGlvblJpZ2h0ID8gJ2JvcmRlckxlZnRDb2xvcicgOiAnYm9yZGVyUmlnaHRDb2xvcicpIDogJ2JvcmRlclRvcENvbG9yJyxcbiAgICAgICAgICAgIHRlbXBsYXRlID0gYXhpc1RlbXBsYXRlLlRQTF9BWElTX1RJQ0ssXG4gICAgICAgICAgICB0aWNrc0h0bWwgPSBuZS51dGlsLm1hcChwb3NpdGlvbnMsIGZ1bmN0aW9uKHBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNzc1RleHQgPSBbXG4gICAgICAgICAgICAgICAgICAgIHJlbmRlclV0aWwuY29uY2F0U3RyKCdiYWNrZ3JvdW5kLWNvbG9yOicsIHRpY2tDb2xvciksXG4gICAgICAgICAgICAgICAgICAgIHJlbmRlclV0aWwuY29uY2F0U3RyKHBvc1R5cGUsICc6ICcsIHBvc2l0aW9uLCAncHgnKVxuICAgICAgICAgICAgICAgIF0uam9pbignOycpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZSh7Y3NzVGV4dDogY3NzVGV4dH0pO1xuICAgICAgICAgICAgfSwgdGhpcykuam9pbignJyk7XG5cbiAgICAgICAgZWxUaWNrQXJlYS5pbm5lckhUTUwgPSB0aWNrc0h0bWw7XG4gICAgICAgIGVsVGlja0FyZWEuc3R5bGVbYm9yZGVyQ29sb3JUeXBlXSA9IHRpY2tDb2xvcjtcblxuICAgICAgICByZXR1cm4gZWxUaWNrQXJlYTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGxhYmVsIGFyZWEuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHNpemUgbGFiZWwgYXJlYSBzaXplXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGF4aXNXaWR0aCBheGlzIGFyZWEgd2lkdGhcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IGxhYmVsIGFyZWEgZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlckxhYmVsQXJlYTogZnVuY3Rpb24oc2l6ZSwgYXhpc1dpZHRoKSB7XG4gICAgICAgIHZhciBkYXRhID0gdGhpcy5kYXRhLFxuICAgICAgICAgICAgdGhlbWUgPSB0aGlzLnRoZW1lLFxuICAgICAgICAgICAgcG9zaXRpb25zID0gY2FsY3VsYXRvci5tYWtlUGl4ZWxQb3NpdGlvbnMoc2l6ZSwgZGF0YS50aWNrQ291bnQpLFxuICAgICAgICAgICAgbGFiZWxXaWR0aCA9IHBvc2l0aW9uc1sxXSAtIHBvc2l0aW9uc1swXSxcbiAgICAgICAgICAgIGxhYmVscyA9IGRhdGEubGFiZWxzLFxuICAgICAgICAgICAgaXNWZXJ0aWNhbCA9IGRhdGEuaXNWZXJ0aWNhbCxcbiAgICAgICAgICAgIGlzTGFiZWxBeGlzID0gZGF0YS5pc0xhYmVsQXhpcyxcbiAgICAgICAgICAgIHBvc1R5cGUgPSAnbGVmdCcsXG4gICAgICAgICAgICBjc3NUZXh0cyA9IHRoaXMuX21ha2VMYWJlbENzc1RleHRzKHtcbiAgICAgICAgICAgICAgICBpc1ZlcnRpY2FsOiBpc1ZlcnRpY2FsLFxuICAgICAgICAgICAgICAgIGlzTGFiZWxBeGlzOiBpc0xhYmVsQXhpcyxcbiAgICAgICAgICAgICAgICBsYWJlbFdpZHRoOiBsYWJlbFdpZHRoXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGVsTGFiZWxBcmVhID0gZG9tLmNyZWF0ZSgnRElWJywgJ25lLWNoYXJ0LWxhYmVsLWFyZWEnKSxcbiAgICAgICAgICAgIGFyZWFDc3NUZXh0ID0gcmVuZGVyVXRpbC5tYWtlRm9udENzc1RleHQodGhlbWUubGFiZWwpLFxuICAgICAgICAgICAgbGFiZWxzSHRtbCwgdGl0bGVBcmVhV2lkdGg7XG5cbiAgICAgICAgaWYgKGlzVmVydGljYWwpIHtcbiAgICAgICAgICAgIHBvc1R5cGUgPSBpc0xhYmVsQXhpcyA/ICd0b3AnIDogJ2JvdHRvbSc7XG4gICAgICAgICAgICB0aXRsZUFyZWFXaWR0aCA9IHRoaXMuX2dldFJlbmRlcmVkVGl0bGVIZWlnaHQoKSArIFRJVExFX0FSRUFfV0lEVEhfUEFERElORztcbiAgICAgICAgICAgIGFyZWFDc3NUZXh0ICs9ICc7d2lkdGg6JyArIChheGlzV2lkdGggLSB0aXRsZUFyZWFXaWR0aCArIFZfTEFCRUxfUklHSFRfUEFERElORykgKyAncHgnO1xuICAgICAgICB9XG5cbiAgICAgICAgcG9zaXRpb25zLmxlbmd0aCA9IGxhYmVscy5sZW5ndGg7XG5cbiAgICAgICAgbGFiZWxzSHRtbCA9IHRoaXMuX21ha2VMYWJlbHNIdG1sKHtcbiAgICAgICAgICAgIHBvc2l0aW9uczogcG9zaXRpb25zLFxuICAgICAgICAgICAgbGFiZWxzOiBsYWJlbHMsXG4gICAgICAgICAgICBwb3NUeXBlOiBwb3NUeXBlLFxuICAgICAgICAgICAgY3NzVGV4dHM6IGNzc1RleHRzXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGVsTGFiZWxBcmVhLmlubmVySFRNTCA9IGxhYmVsc0h0bWw7XG4gICAgICAgIGVsTGFiZWxBcmVhLnN0eWxlLmNzc1RleHQgPSBhcmVhQ3NzVGV4dDtcblxuICAgICAgICB0aGlzLl9jaGFuZ2VMYWJlbEFyZWFQb3NpdGlvbih7XG4gICAgICAgICAgICBlbExhYmVsQXJlYTogZWxMYWJlbEFyZWEsXG4gICAgICAgICAgICBpc1ZlcnRpY2FsOiBpc1ZlcnRpY2FsLFxuICAgICAgICAgICAgaXNMYWJlbEF4aXM6IGlzTGFiZWxBeGlzLFxuICAgICAgICAgICAgdGhlbWU6IHRoZW1lLmxhYmVsLFxuICAgICAgICAgICAgbGFiZWxXaWR0aDogbGFiZWxXaWR0aFxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gZWxMYWJlbEFyZWE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBoZWlnaHQgb2YgdGl0bGUgYXJlYSA7XG4gICAgICogQHJldHVybnMge251bWJlcn0gaGVpZ2h0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0UmVuZGVyZWRUaXRsZUhlaWdodDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB0aXRsZSA9IHRoaXMub3B0aW9ucy50aXRsZSxcbiAgICAgICAgICAgIHRoZW1lID0gdGhpcy50aGVtZS50aXRsZSxcbiAgICAgICAgICAgIHJlc3VsdCA9IHRpdGxlID8gcmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsSGVpZ2h0KHRpdGxlLCB0aGVtZSkgOiAwO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGNzc1RleHRzIG9mIGxhYmVsLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyXG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5pc1ZlcnRpY2FsIHdoZXRoZXIgdmVydGljYWwgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5pc0xhYmVsQXhpcyB3aGV0aGVyIGxhYmVsIGF4aXMgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmxhYmVsV2lkdGggbGFiZWwgd2lkdGggb3IgaGVpZ2h0XG4gICAgICogQHJldHVybnMge3N0cmluZ1tdfSBjc3NUZXh0c1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VMYWJlbENzc1RleHRzOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGNzc1RleHRzID0gW107XG5cbiAgICAgICAgaWYgKHBhcmFtcy5pc1ZlcnRpY2FsICYmIHBhcmFtcy5pc0xhYmVsQXhpcykge1xuICAgICAgICAgICAgY3NzVGV4dHMucHVzaChyZW5kZXJVdGlsLmNvbmNhdFN0cignaGVpZ2h0OicsIHBhcmFtcy5sYWJlbFdpZHRoLCAncHgnKSk7XG4gICAgICAgICAgICBjc3NUZXh0cy5wdXNoKHJlbmRlclV0aWwuY29uY2F0U3RyKCdsaW5lLWhlaWdodDonLCBwYXJhbXMubGFiZWxXaWR0aCwgJ3B4JykpO1xuICAgICAgICB9IGVsc2UgaWYgKCFwYXJhbXMuaXNWZXJ0aWNhbCkge1xuICAgICAgICAgICAgY3NzVGV4dHMucHVzaChyZW5kZXJVdGlsLmNvbmNhdFN0cignd2lkdGg6JywgcGFyYW1zLmxhYmVsV2lkdGgsICdweCcpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjc3NUZXh0cztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBodG1sIG9mIGxhYmVsLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48b2JqZWN0Pn0gcGFyYW1zLnBvc2l0aW9ucyBsYWJlbCBwb3NpdGlvbiBhcnJheVxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmdbXX0gcGFyYW1zLmxhYmVscyBsYWJlbCBhcnJheVxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5wb3NUeXBlIHBvc2l0aW9uIHR5cGUgKGxlZnQgb3IgYm90dG9tKVxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmdbXX0gcGFyYW1zLmNzc1RleHRzIGNzcyBhcnJheVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGh0bWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlTGFiZWxzSHRtbDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciB0ZW1wbGF0ZSA9IGF4aXNUZW1wbGF0ZS5UUExfQVhJU19MQUJFTCxcbiAgICAgICAgICAgIGxhYmVsc0h0bWwgPSBuZS51dGlsLm1hcChwYXJhbXMucG9zaXRpb25zLCBmdW5jdGlvbihwb3NpdGlvbiwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgbGFiZWxDc3NUZXh0cyA9IHBhcmFtcy5jc3NUZXh0cy5zbGljZSgpLFxuICAgICAgICAgICAgICAgICAgICBodG1sO1xuXG4gICAgICAgICAgICAgICAgbGFiZWxDc3NUZXh0cy5wdXNoKHJlbmRlclV0aWwuY29uY2F0U3RyKHBhcmFtcy5wb3NUeXBlLCAnOicsIHBvc2l0aW9uLCAncHgnKSk7XG4gICAgICAgICAgICAgICAgaHRtbCA9IHRlbXBsYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgY3NzVGV4dDogbGFiZWxDc3NUZXh0cy5qb2luKCc7JyksXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiBwYXJhbXMubGFiZWxzW2luZGV4XVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBodG1sO1xuICAgICAgICAgICAgfSwgdGhpcykuam9pbignJyk7XG5cbiAgICAgICAgcmV0dXJuIGxhYmVsc0h0bWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoYW5nZSBwb3NpdGlvbiBvZiBsYWJlbCBhcmVhLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyXG4gICAgICogICAgICBAcGFyYW0ge0hUTUxFbGVtZW50fSBwYXJhbXMuZWxMYWJlbEFyZWEgbGFiZWwgYXJlYSBlbGVtZW50XG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5pc1ZlcnRpY2FsIHdoZXRoZXIgdmVydGljYWwgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5pc0xhYmVsQXhpcyB3aGV0aGVyIGxhYmVsIGF4aXMgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge3tmb250U2l6ZTogbnVtYmVyLCBmb250RmFtaWx5OiBzdHJpbmcsIGNvbG9yOiBzdHJpbmd9fSBwYXJhbXMudGhlbWUgbGFiZWwgdGhlbWVcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubGFiZWxXaWR0aCBsYWJlbCB3aWR0aCBvciBoZWlnaHRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jaGFuZ2VMYWJlbEFyZWFQb3NpdGlvbjogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBsYWJlbEhlaWdodDtcblxuICAgICAgICBpZiAocGFyYW1zLmlzTGFiZWxBeGlzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGFyYW1zLmlzVmVydGljYWwpIHtcbiAgICAgICAgICAgIGxhYmVsSGVpZ2h0ID0gcmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsSGVpZ2h0KCdBQkMnLCBwYXJhbXMudGhlbWUpO1xuICAgICAgICAgICAgcGFyYW1zLmVsTGFiZWxBcmVhLnN0eWxlLnRvcCA9IHJlbmRlclV0aWwuY29uY2F0U3RyKHBhcnNlSW50KGxhYmVsSGVpZ2h0IC8gMiwgMTApLCAncHgnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBhcmFtcy5lbExhYmVsQXJlYS5zdHlsZS5sZWZ0ID0gcmVuZGVyVXRpbC5jb25jYXRTdHIoJy0nLCBwYXJzZUludChwYXJhbXMubGFiZWxXaWR0aCAvIDIsIDEwKSwgJ3B4Jyk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBeGlzO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFRoaXMgaXMgdGVtcGxhdGVzIG9yIGF4aXMgdmlldy5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbnZhciB0ZW1wbGF0ZU1ha2VyID0gcmVxdWlyZSgnLi4vaGVscGVycy90ZW1wbGF0ZU1ha2VyLmpzJyk7XG5cbnZhciB0YWdzID0ge1xuICAgIEhUTUxfQVhJU19USUNLOiAnPGRpdiBjbGFzcz1cIm5lLWNoYXJ0LXRpY2tcIiBzdHlsZT1cInt7IGNzc1RleHQgfX1cIj48L2Rpdj4nLFxuICAgIEhUTUxfQVhJU19MQUJFTDogJzxkaXYgY2xhc3M9XCJuZS1jaGFydC1sYWJlbFwiIHN0eWxlPVwie3sgY3NzVGV4dCB9fVwiPnt7IGxhYmVsIH19PC9kaXY+J1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgVFBMX0FYSVNfVElDSzogdGVtcGxhdGVNYWtlci50ZW1wbGF0ZSh0YWdzLkhUTUxfQVhJU19USUNLKSxcbiAgICBUUExfQVhJU19MQUJFTDogdGVtcGxhdGVNYWtlci50ZW1wbGF0ZSh0YWdzLkhUTUxfQVhJU19MQUJFTClcbn07XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgY2hhcnQuanMgaXMgZW50cnkgcG9pbnQgb2YgQXBwbGljYXRpb24gQ2hhcnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4vY29uc3QuanMnKSxcbiAgICBjaGFydEZhY3RvcnkgPSByZXF1aXJlKCcuL2ZhY3Rvcmllcy9jaGFydEZhY3RvcnkuanMnKSxcbiAgICBwbHVnaW5GYWN0b3J5ID0gcmVxdWlyZSgnLi9mYWN0b3JpZXMvcGx1Z2luRmFjdG9yeS5qcycpLFxuICAgIHRoZW1lRmFjdG9yeSA9IHJlcXVpcmUoJy4vZmFjdG9yaWVzL3RoZW1lRmFjdG9yeS5qcycpO1xuXG52YXIgREVGQVVMVF9USEVNRV9OQU1FID0gJ2RlZmF1bHQnO1xuXG52YXIgX2NyZWF0ZUNoYXJ0O1xuXG5yZXF1aXJlKCcuL2NvZGUtc25pcHBldC11dGlsLmpzJyk7XG5yZXF1aXJlKCcuL3JlZ2lzdGVyQ2hhcnRzLmpzJyk7XG5yZXF1aXJlKCcuL3JlZ2lzdGVyVGhlbWVzLmpzJyk7XG5cbi8qKlxuICogTkhOIEVudGVydGFpbm1lbnQgQXBwbGljYXRpb24gQ2hhcnQuXG4gKiBAbmFtZXNwYWNlIG5lLmFwcGxpY2F0aW9uLmNoYXJ0XG4gKi9cbm5lLnV0aWwuZGVmaW5lTmFtZXNwYWNlKCduZS5hcHBsaWNhdGlvbi5jaGFydCcpO1xuXG4vKipcbiAqIENyZWF0ZSBjaGFydC5cbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciBjb250YWluZXJcbiAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gZGF0YSBjaGFydCBkYXRhXG4gKiBAcGFyYW0ge3tcbiAqICAgY2hhcnQ6IHtcbiAqICAgICB3aWR0aDogbnVtYmVyLFxuICogICAgIGhlaWdodDogbnVtYmVyLFxuICogICAgIHRpdGxlOiBzdHJpbmcsXG4gKiAgICAgZm9ybWF0OiBzdHJpbmdcbiAqICAgfSxcbiAqICAgeUF4aXM6IHtcbiAqICAgICB0aXRsZTogc3RyaW5nLFxuICogICAgIG1pbjogbnVtYmVyXG4gKiAgIH0sXG4gKiAgIHhBeGlzOiB7XG4gKiAgICAgdGl0bGU6IHN0cmlnLFxuICogICAgIG1pbjogbnVtYmVyXG4gKiAgIH0sXG4gKiAgIHRvb2x0aXA6IHtcbiAqICAgICBzdWZmaXg6IHN0cmluZyxcbiAqICAgICB0ZW1wbGF0ZTogc3RyaW5nXG4gKiAgIH0sXG4gKiAgIHRoZW1lOiBzdHJpbmdcbiAqIH19IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICogQHJldHVybnMge29iamVjdH0gY2hhcnQgaW5zdGFuY2UuXG4gKiBAcHJpdmF0ZVxuICogQGlnbm9yZVxuICovXG5fY3JlYXRlQ2hhcnQgPSBmdW5jdGlvbihjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpIHtcbiAgICB2YXIgdGhlbWVOYW1lLCB0aGVtZSwgY2hhcnQ7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdGhlbWVOYW1lID0gb3B0aW9ucy50aGVtZSB8fCBERUZBVUxUX1RIRU1FX05BTUU7XG4gICAgdGhlbWUgPSB0aGVtZUZhY3RvcnkuZ2V0KHRoZW1lTmFtZSk7XG5cbiAgICBjaGFydCA9IGNoYXJ0RmFjdG9yeS5nZXQob3B0aW9ucy5jaGFydFR5cGUsIGRhdGEsIHRoZW1lLCBvcHRpb25zKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoY2hhcnQucmVuZGVyKCkpO1xuXG4gICAgcmV0dXJuIGNoYXJ0O1xufTtcblxuLyoqXG4gKiBCYXIgY2hhcnQgY3JlYXRvci5cbiAqIEBtZW1iZXJPZiBuZS5hcHBsaWNhdGlvbi5jaGFydFxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNoYXJ0IGNvbnRhaW5lclxuICogQHBhcmFtIHtvYmplY3R9IGRhdGEgY2hhcnQgZGF0YVxuICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBkYXRhLmNhdGVnb3JpZXMgY2F0ZWdvcmllc1xuICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IGRhdGEuc2VyaWVzIHNlcmllcyBkYXRhXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLmNoYXJ0IGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LndpZHRoIGNoYXJ0IHdpZHRoXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5jaGFydC5oZWlnaHQgY2hhcnQgaGVpZ2h0XG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC50aXRsZSBjaGFydCB0aXRsZVxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuY2hhcnQuZm9ybWF0IHZhbHVlIGZvcm1hdFxuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy55QXhpcyBvcHRpb25zIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnlBeGlzLnRpdGxlIHRpdGxlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnlBeGlzLm1pbiBtaW5pbWFsIHZhbHVlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnlBeGlzLm1heCBtYXhpbXVtIHZhbHVlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMueEF4aXMgb3B0aW9ucyBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnhBeGlzLnRpdGxlIHRpdGxlIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMueEF4aXMubWluIG1pbmltYWwgdmFsdWUgb2YgaG9yaXpvbnRhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy54QXhpcy5tYXggbWF4aW11bSB2YWx1ZSBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuc2VyaWVzIG9wdGlvbnMgb2Ygc2VyaWVzXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5zZXJpZXMuc3RhY2tlZCBzdGFja2VkIHR5cGVcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMudG9vbHRpcCBvcHRpb25zIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAuc3VmZml4IHN1ZmZpeCBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnRlbXBsYXRlIHRlbXBsYXRlIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAucG9zaXRpb24gdG9vbHRpcCBwb3NpdGlvbiB0eXBlXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uIGFkZCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24ubGVmdCBhZGQgbGVmdCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24udG9wIGFkZCB0b3AgcG9zaXRpb25cbiAqICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudGhlbWUgdGhlbWUgbmFtZVxuICogICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5saWJUeXBlIGdyYXBoIGxpYnJhcnkgdHlwZVxuICogQHJldHVybnMge29iamVjdH0gYmFyIGNoYXJ0XG4gKiBAZXhhbXBsZVxuICogdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWluZXItaWQnKSxcbiAqICAgICBkYXRhID0ge1xuICogICAgICAgY2F0ZWdvcmllczogWydjYXRlMScsICdjYXRlMicsICdjYXRlMyddLFxuICogICAgICAgc2VyaWVzOiBbXG4gKiAgICAgICAgIFsnTGVnZW5kMScsIDIwLCAzMCwgNTBdLFxuICogICAgICAgICBbJ0xlZ2VuZDInLCA0MCwgNDAsIDYwXSxcbiAqICAgICAgICAgWydMZWdlbmQzJywgNjAsIDUwLCAxMF0sXG4gKiAgICAgICAgIFsnTGVnZW5kNCcsIDgwLCAxMCwgNzBdXG4gKiAgICAgICBdXG4gKiAgICAgfSxcbiAqICAgICBvcHRpb25zID0ge1xuICogICAgICAgY2hhcnQ6IHtcbiAqICAgICAgICAgdGl0bGU6ICdCYXIgQ2hhcnQnXG4gKiAgICAgICB9LFxuICogICAgICAgeUF4aXM6IHtcbiAqICAgICAgICAgdGl0bGU6ICdWZXJ0aWNhbCBBeGlzJ1xuICogICAgICAgfSxcbiAqICAgICAgIHhBeGlzOiB7XG4gKiAgICAgICAgIHRpdGxlOiAnSG9yaXpvbnRhbCBBeGlzJ1xuICogICAgICAgfVxuICogICAgIH07XG4gKiBuZS5hcHBsaWNhdGlvbi5jaGFydC5iYXJDaGFydChjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpO1xuICovXG5uZS5hcHBsaWNhdGlvbi5jaGFydC5iYXJDaGFydCA9IGZ1bmN0aW9uKGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIG9wdGlvbnMuY2hhcnRUeXBlID0gY2hhcnRDb25zdC5DSEFSVF9UWVBFX0JBUjtcbiAgICByZXR1cm4gX2NyZWF0ZUNoYXJ0KGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucyk7XG59O1xuXG4vKipcbiAqIENvbHVtbiBjaGFydCBjcmVhdG9yLlxuICogQG1lbWJlck9mIG5lLmFwcGxpY2F0aW9uLmNoYXJ0XG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY2hhcnQgY29udGFpbmVyXG4gKiBAcGFyYW0ge29iamVjdH0gZGF0YSBjaGFydCBkYXRhXG4gKiAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGRhdGEuY2F0ZWdvcmllcyBjYXRlZ29yaWVzXG4gKiAgICAgIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gZGF0YS5zZXJpZXMgc2VyaWVzIGRhdGFcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuY2hhcnQgY2hhcnQgb3B0aW9uc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMuY2hhcnQud2lkdGggY2hhcnQgd2lkdGhcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LmhlaWdodCBjaGFydCBoZWlnaHRcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmNoYXJ0LnRpdGxlIGNoYXJ0IHRpdGxlXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC5mb3JtYXQgdmFsdWUgZm9ybWF0XG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnlBeGlzIG9wdGlvbnMgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMueUF4aXMudGl0bGUgdGl0bGUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMueUF4aXMubWluIG1pbmltYWwgdmFsdWUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMueUF4aXMubWF4IG1heGltdW0gdmFsdWUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy54QXhpcyBvcHRpb25zIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMueEF4aXMudGl0bGUgdGl0bGUgb2YgaG9yaXpvbnRhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy54QXhpcy5taW4gbWluaW1hbCB2YWx1ZSBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnhBeGlzLm1heCBtYXhpbXVtIHZhbHVlIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5zZXJpZXMgb3B0aW9ucyBvZiBzZXJpZXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnNlcmllcy5zdGFja2VkIHN0YWNrZWQgdHlwZVxuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy50b29sdGlwIG9wdGlvbnMgb2YgdG9vbHRpcFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC5zdWZmaXggc3VmZml4IG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAudGVtcGxhdGUgdGVtcGxhdGUgb2YgdG9vbHRpcFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC5wb3NpdGlvbiB0b29sdGlwIHBvc2l0aW9uIHR5cGVcbiAqICAgICAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24gYWRkIHBvc2l0aW9uXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMudG9vbHRpcC5hZGRQb3NpdGlvbi5sZWZ0IGFkZCBsZWZ0IHBvc2l0aW9uXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMudG9vbHRpcC5hZGRQb3NpdGlvbi50b3AgYWRkIHRvcCBwb3NpdGlvblxuICogICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50aGVtZSB0aGVtZSBuYW1lXG4gKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmxpYlR5cGUgZ3JhcGggbGlicmFyeSB0eXBlXG4gKiBAcmV0dXJucyB7b2JqZWN0fSBjb2x1bW4gY2hhcnRcbiAqIEBleGFtcGxlXG4gKiB2YXIgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhaW5lci1pZCcpLFxuICogICAgIGRhdGEgPSB7XG4gKiAgICAgICBjYXRlZ29yaWVzOiBbJ2NhdGUxJywgJ2NhdGUyJywgJ2NhdGUzJ10sXG4gKiAgICAgICBzZXJpZXM6IFtcbiAqICAgICAgICAgWydMZWdlbmQxJywgMjAsIDMwLCA1MF0sXG4gKiAgICAgICAgIFsnTGVnZW5kMicsIDQwLCA0MCwgNjBdLFxuICogICAgICAgICBbJ0xlZ2VuZDMnLCA2MCwgNTAsIDEwXSxcbiAqICAgICAgICAgWydMZWdlbmQ0JywgODAsIDEwLCA3MF1cbiAqICAgICAgIF1cbiAqICAgICB9LFxuICogICAgIG9wdGlvbnMgPSB7XG4gKiAgICAgICBjaGFydDoge1xuICogICAgICAgICB0aXRsZTogJ0NvbHVtbiBDaGFydCdcbiAqICAgICAgIH0sXG4gKiAgICAgICB5QXhpczoge1xuICogICAgICAgICB0aXRsZTogJ1ZlcnRpY2FsIEF4aXMnXG4gKiAgICAgICB9LFxuICogICAgICAgeEF4aXM6IHtcbiAqICAgICAgICAgdGl0bGU6ICdIb3Jpem9udGFsIEF4aXMnXG4gKiAgICAgICB9XG4gKiAgICAgfTtcbiAqIG5lLmFwcGxpY2F0aW9uLmNoYXJ0LmNvbHVtbkNoYXJ0KGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucyk7XG4gKi9cbm5lLmFwcGxpY2F0aW9uLmNoYXJ0LmNvbHVtbkNoYXJ0ID0gZnVuY3Rpb24oY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgb3B0aW9ucy5jaGFydFR5cGUgPSBjaGFydENvbnN0LkNIQVJUX1RZUEVfQ09MVU1OO1xuICAgIHJldHVybiBfY3JlYXRlQ2hhcnQoY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKTtcbn07XG5cbi8qKlxuICogTGluZSBjaGFydCBjcmVhdG9yLlxuICogQG1lbWJlck9mIG5lLmFwcGxpY2F0aW9uLmNoYXJ0XG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY2hhcnQgY29udGFpbmVyXG4gKiBAcGFyYW0ge29iamVjdH0gZGF0YSBjaGFydCBkYXRhXG4gKiAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGRhdGEuY2F0ZWdvcmllcyBjYXRlZ29yaWVzXG4gKiAgICAgIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gZGF0YS5zZXJpZXMgc2VyaWVzIGRhdGFcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuY2hhcnQgY2hhcnQgb3B0aW9uc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMuY2hhcnQud2lkdGggY2hhcnQgd2lkdGhcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LmhlaWdodCBjaGFydCBoZWlnaHRcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmNoYXJ0LnRpdGxlIGNoYXJ0IHRpdGxlXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC5mb3JtYXQgdmFsdWUgZm9ybWF0XG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnlBeGlzIG9wdGlvbnMgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMueUF4aXMudGl0bGUgdGl0bGUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMueUF4aXMubWluIG1pbmltYWwgdmFsdWUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMueUF4aXMubWF4IG1heGltdW0gdmFsdWUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy54QXhpcyBvcHRpb25zIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMueEF4aXMudGl0bGUgdGl0bGUgb2YgaG9yaXpvbnRhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy54QXhpcy5taW4gbWluaW1hbCB2YWx1ZSBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnhBeGlzLm1heCBtYXhpbXVtIHZhbHVlIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5zZXJpZXMgb3B0aW9ucyBvZiBzZXJpZXNcbiAqICAgICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5zZXJpZXMuaGFzRG90IHdoZXRoZXIgaGFzIGRvdCBvciBub3RcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMudG9vbHRpcCBvcHRpb25zIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAuc3VmZml4IHN1ZmZpeCBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnRlbXBsYXRlIHRlbXBsYXRlIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAucG9zaXRpb24gdG9vbHRpcCBwb3NpdGlvbiB0eXBlXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uIGFkZCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24ubGVmdCBhZGQgbGVmdCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24udG9wIGFkZCB0b3AgcG9zaXRpb25cbiAqICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudGhlbWUgdGhlbWUgbmFtZVxuICogICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5saWJUeXBlIGdyYXBoIGxpYnJhcnkgdHlwZVxuICogQHJldHVybnMge29iamVjdH0gYmFyIGNoYXJ0XG4gKiBAZXhhbXBsZVxuICogdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWluZXItaWQnKSxcbiAqICAgICBkYXRhID0ge1xuICogICAgICAgY2F0ZWdvcmllczogWydjYXRlMScsICdjYXRlMicsICdjYXRlMyddLFxuICogICAgICAgc2VyaWVzOiBbXG4gKiAgICAgICAgIFsnTGVnZW5kMScsIDIwLCAzMCwgNTBdLFxuICogICAgICAgICBbJ0xlZ2VuZDInLCA0MCwgNDAsIDYwXSxcbiAqICAgICAgICAgWydMZWdlbmQzJywgNjAsIDUwLCAxMF0sXG4gKiAgICAgICAgIFsnTGVnZW5kNCcsIDgwLCAxMCwgNzBdXG4gKiAgICAgICBdXG4gKiAgICAgfSxcbiAqICAgICBvcHRpb25zID0ge1xuICogICAgICAgY2hhcnQ6IHtcbiAqICAgICAgICAgdGl0bGU6ICdMaW5lIENoYXJ0J1xuICogICAgICAgfSxcbiAqICAgICAgIHlBeGlzOiB7XG4gKiAgICAgICAgIHRpdGxlOiAnVmVydGljYWwgQXhpcydcbiAqICAgICAgIH0sXG4gKiAgICAgICB4QXhpczoge1xuICogICAgICAgICB0aXRsZTogJ0hvcml6b250YWwgQXhpcydcbiAqICAgICAgIH0sXG4gKiAgICAgICBzZXJpZXM6IHtcbiAqICAgICAgICAgaGFzRG90OiB0cnVlXG4gKiAgICAgICB9XG4gKiAgICAgfTtcbiAqIG5lLmFwcGxpY2F0aW9uLmNoYXJ0LmxpbmVDaGFydChjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpO1xuICovXG5uZS5hcHBsaWNhdGlvbi5jaGFydC5saW5lQ2hhcnQgPSBmdW5jdGlvbihjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICBvcHRpb25zLmNoYXJ0VHlwZSA9IGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9MSU5FO1xuICAgIHJldHVybiBfY3JlYXRlQ2hhcnQoY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKTtcbn07XG5cbi8qKlxuICogQ29tYm8gY2hhcnQgY3JlYXRvci5cbiAqIEBtZW1iZXJPZiBuZS5hcHBsaWNhdGlvbi5jaGFydFxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNoYXJ0IGNvbnRhaW5lclxuICogQHBhcmFtIHtvYmplY3R9IGRhdGEgY2hhcnQgZGF0YVxuICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBkYXRhLmNhdGVnb3JpZXMgY2F0ZWdvcmllc1xuICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IGRhdGEuc2VyaWVzIHNlcmllcyBkYXRhXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLmNoYXJ0IGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LndpZHRoIGNoYXJ0IHdpZHRoXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5jaGFydC5oZWlnaHQgY2hhcnQgaGVpZ2h0XG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC50aXRsZSBjaGFydCB0aXRsZVxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuY2hhcnQuZm9ybWF0IHZhbHVlIGZvcm1hdFxuICogICAgICBAcGFyYW0ge29iamVjdFtdfSBvcHRpb25zLnlBeGlzIG9wdGlvbnMgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMueUF4aXNbXS50aXRsZSB0aXRsZSBvZiB2ZXJ0aWNhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy55QXhpc1tdLm1pbiBtaW5pbWFsIHZhbHVlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnlBeGlzW10ubWF4IG1heGltdW0gdmFsdWUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy54QXhpcyBvcHRpb25zIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMueEF4aXMudGl0bGUgdGl0bGUgb2YgaG9yaXpvbnRhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy54QXhpcy5taW4gbWluaW1hbCB2YWx1ZSBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnhBeGlzLm1heCBtYXhpbXVtIHZhbHVlIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5zZXJpZXMgb3B0aW9ucyBvZiBzZXJpZXNcbiAqICAgICAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnNlcmllcy5jb2x1bW4gb3B0aW9ucyBvZiBjb2x1bW4gc2VyaWVzXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuc2VyaWVzLmNvbHVtbi5zdGFja2VkIHN0YWNrZWQgdHlwZVxuICogICAgICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuc2VyaWVzLmxpbmUgb3B0aW9ucyBvZiBsaW5lIHNlcmllc1xuICogICAgICAgICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5zZXJpZXMubGluZS5oYXNEb3Qgd2hldGhlciBoYXMgZG90IG9yIG5vdFxuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy50b29sdGlwIG9wdGlvbnMgb2YgdG9vbHRpcFxuICogICAgICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMudG9vbHRpcC5jb2x1bW4gb3B0aW9ucyBvZiBjb2x1bW4gdG9vbHRpcFxuICogICAgICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAuY29sdW1uLnN1ZmZpeCBzdWZmaXggb2YgdG9vbHRpcFxuICogICAgICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAuY29sdW1uLnRlbXBsYXRlIHRlbXBsYXRlIG9mIHRvb2x0aXBcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLmNvbHVtbi5wb3NpdGlvbiB0b29sdGlwIHBvc2l0aW9uIHR5cGVcbiAqICAgICAgICAgICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy50b29sdGlwLmNvbHVtbi5hZGRQb3NpdGlvbiBhZGQgcG9zaXRpb25cbiAqICAgICAgICAgICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMudG9vbHRpcC5jb2x1bW4uYWRkUG9zaXRpb24ubGVmdCBhZGQgbGVmdCBwb3NpdGlvblxuICogICAgICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy50b29sdGlwLmNvbHVtbi5hZGRQb3NpdGlvbi50b3AgYWRkIHRvcCBwb3NpdGlvblxuICogICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50aGVtZSB0aGVtZSBuYW1lXG4gKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmxpYlR5cGUgZ3JhcGggbGlicmFyeSB0eXBlXG4gKiBAcmV0dXJucyB7b2JqZWN0fSBiYXIgY2hhcnRcbiAqIEBleGFtcGxlXG4gKiB2YXIgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhaW5lci1pZCcpLFxuICogICAgIGRhdGEgPSB7XG4gKiAgICAgICBjYXRlZ29yaWVzOiBbJ2NhdGUxJywgJ2NhdGUyJywgJ2NhdGUzJ10sXG4gKiAgICAgICBzZXJpZXM6IFtcbiAqICAgICAgICAgY29sdW1uOiBbXG4qICAgICAgICAgICAgWydMZWdlbmQxJywgMjAsIDMwLCA1MF0sXG4gKiAgICAgICAgICAgWydMZWdlbmQyJywgNDAsIDQwLCA2MF0sXG4gKiAgICAgICAgICAgWydMZWdlbmQzJywgNjAsIDUwLCAxMF0sXG4gKiAgICAgICAgICAgWydMZWdlbmQ0JywgODAsIDEwLCA3MF1cbiAqICAgICAgICAgXSxcbiAqICAgICAgICAgbGluZTogW1xuICogICAgICAgICAgIFsnTGVnZW5kMl8xJywgMSwgMiwgM11cbiAqICAgICAgICAgXVxuICogICAgICAgXVxuICogICAgIH0sXG4gKiAgICAgb3B0aW9ucyA9IHtcbiAqICAgICAgIGNoYXJ0OiB7XG4gKiAgICAgICAgIHRpdGxlOiAnTGluZSBDaGFydCdcbiAqICAgICAgIH0sXG4gKiAgICAgICB5QXhpczpbXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICB0aXRsZTogJ1kgQXhpcycsXG4gKiAgICAgICAgICAgY2hhcnRUeXBlOiAnbGluZSdcbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIHRpdGxlOiAnWSBSaWdodCBBeGlzJ1xuICogICAgICAgICB9XG4gKiAgICAgICBdLFxuICogICAgICAgeEF4aXM6IHtcbiAqICAgICAgICAgdGl0bGU6ICdIb3Jpem9udGFsIEF4aXMnXG4gKiAgICAgICB9LFxuICogICAgICAgc2VyaWVzOiB7XG4gKiAgICAgICAgIGhhc0RvdDogdHJ1ZVxuICogICAgICAgfVxuICogICAgIH07XG4gKiBuZS5hcHBsaWNhdGlvbi5jaGFydC5jb21ib0NoYXJ0KGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucyk7XG4gKi9cbm5lLmFwcGxpY2F0aW9uLmNoYXJ0LmNvbWJvQ2hhcnQgPSBmdW5jdGlvbihjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICBvcHRpb25zLmNoYXJ0VHlwZSA9IGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9DT01CTztcbiAgICByZXR1cm4gX2NyZWF0ZUNoYXJ0KGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucyk7XG59O1xuXG4vKipcbiAqIFBpZSBjaGFydCBjcmVhdG9yLlxuICogQG1lbWJlck9mIG5lLmFwcGxpY2F0aW9uLmNoYXJ0XG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY2hhcnQgY29udGFpbmVyXG4gKiBAcGFyYW0ge29iamVjdH0gZGF0YSBjaGFydCBkYXRhXG4gKiAgICAgIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gZGF0YS5zZXJpZXMgc2VyaWVzIGRhdGFcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuY2hhcnQgY2hhcnQgb3B0aW9uc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMuY2hhcnQud2lkdGggY2hhcnQgd2lkdGhcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LmhlaWdodCBjaGFydCBoZWlnaHRcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmNoYXJ0LnRpdGxlIGNoYXJ0IHRpdGxlXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC5mb3JtYXQgdmFsdWUgZm9ybWF0XG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnRvb2x0aXAgb3B0aW9ucyBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnN1ZmZpeCBzdWZmaXggb2YgdG9vbHRpcFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC50ZW1wbGF0ZSB0ZW1wbGF0ZSBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnBvc2l0aW9uIHRvb2x0aXAgcG9zaXRpb24gdHlwZVxuICogICAgICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMudG9vbHRpcC5hZGRQb3NpdGlvbiBhZGQgcG9zaXRpb25cbiAqICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uLmxlZnQgYWRkIGxlZnQgcG9zaXRpb25cbiAqICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uLnRvcCBhZGQgdG9wIHBvc2l0aW9uXG4gKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRoZW1lIHRoZW1lIG5hbWVcbiAqICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMubGliVHlwZSBncmFwaCBsaWJyYXJ5IHR5cGVcbiAqIEByZXR1cm5zIHtvYmplY3R9IGJhciBjaGFydFxuICogQGV4YW1wbGVcbiAqIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFpbmVyLWlkJyksXG4gKiAgICAgZGF0YSA9IHtcbiAqICAgICAgIHNlcmllczogW1xuICogICAgICAgICBbJ0xlZ2VuZDEnLCAyMF0sXG4gKiAgICAgICAgIFsnTGVnZW5kMicsIDQwXSxcbiAqICAgICAgICAgWydMZWdlbmQzJywgNjBdLFxuICogICAgICAgICBbJ0xlZ2VuZDQnLCA4MF1cbiAqICAgICAgIF1cbiAqICAgICB9LFxuICogICAgIG9wdGlvbnMgPSB7XG4gKiAgICAgICBjaGFydDoge1xuICogICAgICAgICB0aXRsZTogJ1BpZSBDaGFydCdcbiAqICAgICAgIH1cbiAqICAgICB9O1xuICogbmUuYXBwbGljYXRpb24uY2hhcnQucGllQ2hhcnQoY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKTtcbiAqL1xubmUuYXBwbGljYXRpb24uY2hhcnQucGllQ2hhcnQgPSBmdW5jdGlvbihjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICBvcHRpb25zLmNoYXJ0VHlwZSA9IGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9QSUU7XG4gICAgcmV0dXJuIF9jcmVhdGVDaGFydChjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpO1xufTtcblxuLyoqXG4gKiBSZWdpc3RlciB0aGVtZS5cbiAqIEBtZW1iZXJPZiBuZS5hcHBsaWNhdGlvbi5jaGFydFxuICogQHBhcmFtIHtzdHJpbmd9IHRoZW1lTmFtZSB0aGVtZSBuYW1lXG4gKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgYXBwbGljYXRpb24gY2hhcnQgdGhlbWVcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IHRoZW1lLmNoYXJ0IGNoYXJ0IHRoZW1lXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUuY2hhcnQuZm9udEZhbWlseSBmb250IGZhbWlseSBvZiBjaGFydFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLmNoYXJ0LmJhY2tncm91bmQgYmFja2dyb3VuZCBvZiBjaGFydFxuICogICAgICBAcGFyYW0ge29iamVjdH0gdGhlbWUudGl0bGUgY2hhcnQgdGhlbWVcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSB0aGVtZS50aXRsZS5mb250U2l6ZSBmb250IHNpemUgb2YgY2hhcnQgdGl0bGVcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS50aXRsZS5mb250RmFtaWx5IGZvbnQgZmFtaWx5IG9mIGNoYXJ0IHRpdGxlXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUudGl0bGUuY29sb3IgZm9udCBjb2xvciBvZiBjaGFydCB0aXRsZVxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnRpdGxlLmJhY2tncm91bmQgYmFja2dyb3VuZCBvZiBjaGFydCB0aXRsZVxuICogICAgICBAcGFyYW0ge29iamVjdH0gdGhlbWUueUF4aXMgdGhlbWUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtvYmplY3R9IHRoZW1lLnlBeGlzLnRpdGxlIHRoZW1lIG9mIHZlcnRpY2FsIGF4aXMgdGl0bGVcbiAqICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gdGhlbWUueUF4aXMudGl0bGUuZm9udFNpemUgZm9udCBzaXplIG9mIHZlcnRpY2FsIGF4aXMgdGl0bGVcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUueUF4aXMudGl0bGUuZm9udEZhbWlseSBmb250IGZhbWlseSBvZiB2ZXJ0aWNhbCBheGlzIHRpdGxlXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnlBeGlzLnRpdGxlLmNvbG9yIGZvbnQgY29sb3Igb2YgdmVydGljYWwgYXhpcyB0aXRsZVxuICogICAgICAgICAgQHBhcmFtIHtvYmplY3R9IHRoZW1lLnlBeGlzLmxhYmVsIHRoZW1lIG9mIHZlcnRpY2FsIGF4aXMgbGFiZWxcbiAqICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gdGhlbWUueUF4aXMubGFiZWwuZm9udFNpemUgZm9udCBzaXplIG9mIHZlcnRpY2FsIGF4aXMgbGFiZWxcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUueUF4aXMubGFiZWwuZm9udEZhbWlseSBmb250IGZhbWlseSBvZiB2ZXJ0aWNhbCBheGlzIGxhYmVsXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnlBeGlzLmxhYmVsLmNvbG9yIGZvbnQgY29sb3Igb2YgdmVydGljYWwgYXhpcyBsYWJlbFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnlBeGlzLnRpY2tjb2xvciBjb2xvciBvZiB2ZXJ0aWNhbCBheGlzIHRpY2tcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IHRoZW1lLnhBeGlzIHRoZW1lIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtvYmplY3R9IHRoZW1lLnhBeGlzLnRpdGxlIHRoZW1lIG9mIGhvcml6b250YWwgYXhpcyB0aXRsZVxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSB0aGVtZS54QXhpcy50aXRsZS5mb250U2l6ZSBmb250IHNpemUgb2YgaG9yaXpvbnRhbCBheGlzIHRpdGxlXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnhBeGlzLnRpdGxlLmZvbnRGYW1pbHkgZm9udCBmYW1pbHkgb2YgaG9yaXpvbnRhbCBheGlzIHRpdGxlXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnhBeGlzLnRpdGxlLmNvbG9yIGZvbnQgY29sb3Igb2YgaG9yaXpvbnRhbCBheGlzIHRpdGxlXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gdGhlbWUueEF4aXMubGFiZWwgdGhlbWUgb2YgaG9yaXpvbnRhbCBheGlzIGxhYmVsXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IHRoZW1lLnhBeGlzLmxhYmVsLmZvbnRTaXplIGZvbnQgc2l6ZSBvZiBob3Jpem9udGFsIGF4aXMgbGFiZWxcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUueEF4aXMubGFiZWwuZm9udEZhbWlseSBmb250IGZhbWlseSBvZiBob3Jpem9udGFsIGF4aXMgbGFiZWxcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUueEF4aXMubGFiZWwuY29sb3IgZm9udCBjb2xvciBvZiBob3Jpem9udGFsIGF4aXMgbGFiZWxcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS54QXhpcy50aWNrY29sb3IgY29sb3Igb2YgaG9yaXpvbnRhbCBheGlzIHRpY2tcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IHRoZW1lLnBsb3QgcGxvdCB0aGVtZVxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnBsb3QubGluZUNvbG9yIHBsb3QgbGluZSBjb2xvclxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnBsb3QuYmFja2dyb3VuZCBwbG90IGJhY2tncm91bmRcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IHRoZW1lLnNlcmllcyBzZXJpZXMgdGhlbWVcbiAqICAgICAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IHRoZW1lLnNlcmllcy5jb2xvcnMgc2VyaWVzIGNvbG9yc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnNlcmllcy5ib3JkZXJDb2xvciBzZXJpZXMgYm9yZGVyIGNvbG9yXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSB0aGVtZS5sZWdlbmQgbGVnZW5kIHRoZW1lXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gdGhlbWUubGVnZW5kLmxhYmVsIHRoZW1lIG9mIGxlZ2VuZCBsYWJlbFxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSB0aGVtZS5sZWdlbmQubGFiZWwuZm9udFNpemUgZm9udCBzaXplIG9mIGxlZ2VuZCBsYWJlbFxuICogICAgICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS5sZWdlbmQubGFiZWwuZm9udEZhbWlseSBmb250IGZhbWlseSBvZiBsZWdlbmQgbGFiZWxcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUubGVnZW5kLmxhYmVsLmNvbG9yIGZvbnQgY29sb3Igb2YgbGVnZW5kIGxhYmVsXG4gKiBAZXhhbXBsZVxuICogdmFyIHRoZW1lID0ge1xuICogICB5QXhpczoge1xuICogICAgIHRpY2tDb2xvcjogJyNjY2JkOWEnLFxuICogICAgICAgdGl0bGU6IHtcbiAqICAgICAgICAgY29sb3I6ICcjMzMzMzMzJ1xuICogICAgICAgfSxcbiAqICAgICAgIGxhYmVsOiB7XG4gKiAgICAgICAgIGNvbG9yOiAnIzZmNDkxZCdcbiAqICAgICAgIH1cbiAqICAgICB9LFxuICogICAgIHhBeGlzOiB7XG4gKiAgICAgICB0aWNrQ29sb3I6ICcjY2NiZDlhJyxcbiAqICAgICAgIHRpdGxlOiB7XG4gKiAgICAgICAgIGNvbG9yOiAnIzMzMzMzMydcbiAqICAgICAgIH0sXG4gKiAgICAgICBsYWJlbDoge1xuICogICAgICAgICBjb2xvcjogJyM2ZjQ5MWQnXG4gKiAgICAgICB9XG4gKiAgICAgfSxcbiAqICAgICBwbG90OiB7XG4gKiAgICAgICBsaW5lQ29sb3I6ICcjZTVkYmM0JyxcbiAqICAgICAgIGJhY2tncm91bmQ6ICcjZjZmMWU1J1xuICogICAgIH0sXG4gKiAgICAgc2VyaWVzOiB7XG4gKiAgICAgICBjb2xvcnM6IFsnIzQwYWJiNCcsICcjZTc4YTMxJywgJyNjMWM0NTInLCAnIzc5NTIyNCcsICcjZjVmNWY1J10sXG4gKiAgICAgICBib3JkZXJDb2xvcjogJyM4ZTY1MzUnXG4gKiAgICAgfSxcbiAqICAgICBsZWdlbmQ6IHtcbiAqICAgICAgIGxhYmVsOiB7XG4gKiAgICAgICAgIGNvbG9yOiAnIzZmNDkxZCdcbiAqICAgICAgIH1cbiAqICAgICB9XG4gKiAgIH07XG4gKiBjaGFydC5yZWdpc3RlclRoZW1lKCduZXdUaGVtZScsIHRoZW1lKTtcbiAqL1xubmUuYXBwbGljYXRpb24uY2hhcnQucmVnaXN0ZXJUaGVtZSA9IGZ1bmN0aW9uKHRoZW1lTmFtZSwgdGhlbWUpIHtcbiAgICB0aGVtZUZhY3RvcnkucmVnaXN0ZXIodGhlbWVOYW1lLCB0aGVtZSk7XG59O1xuXG4vKipcbiAqIFJlZ2lzdGVyIGdyYXBoIHBsdWdpbi5cbiAqIEBtZW1iZXJPZiBuZS5hcHBsaWNhdGlvbi5jaGFydFxuICogQHBhcmFtIHtzdHJpbmd9IGxpYlR5cGUgdHlwZSBvZiBncmFwaCBsaWJyYXJ5XG4gKiBAcGFyYW0ge29iamVjdH0gcGx1Z2luIHBsdWdpbiB0byBjb250cm9sIGxpYnJhcnlcbiAqIEBleGFtcGxlXG4gKiB2YXIgcGx1Z2luUmFwaGFlbCA9IHtcbiAqICAgYmFyOiBmdW5jdGlvbigpIHt9IC8vIFJlbmRlciBjbGFzc1xuICogfTtcbiAqIG5lLmFwcGxpY2F0aW9uLmNoYXJ0LnJlZ2lzdGVyUGx1Z2luKCdyYXBoYWVsJywgcGx1Z2luUmFwaGFlbCk7XG4gKi9cbm5lLmFwcGxpY2F0aW9uLmNoYXJ0LnJlZ2lzdGVyUGx1Z2luID0gZnVuY3Rpb24obGliVHlwZSwgcGx1Z2luKSB7XG4gICAgcGx1Z2luRmFjdG9yeS5yZWdpc3RlcihsaWJUeXBlLCBwbHVnaW4pO1xufTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBBeGlzQmFzZVxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ2hhcnRCYXNlID0gcmVxdWlyZSgnLi9jaGFydEJhc2UuanMnKSxcbiAgICBBeGlzID0gcmVxdWlyZSgnLi4vYXhlcy9heGlzLmpzJyksXG4gICAgUGxvdCA9IHJlcXVpcmUoJy4uL3Bsb3RzL3Bsb3QuanMnKSxcbiAgICBMZWdlbmQgPSByZXF1aXJlKCcuLi9sZWdlbmRzL2xlZ2VuZC5qcycpLFxuICAgIFRvb2x0aXAgPSByZXF1aXJlKCcuLi90b29sdGlwcy90b29sdGlwLmpzJyk7XG5cbnZhciBBeGlzVHlwZUJhc2UgPSBuZS51dGlsLmRlZmluZUNsYXNzKENoYXJ0QmFzZSwgLyoqIEBsZW5kcyBBeGlzVHlwZUJhc2UucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBBeGlzIHR5cGUgY2hhcnQgYmFzZVxuICAgICAqIEBjb25zdHJ1Y3RzIEF4aXNUeXBlQmFzZVxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgICAgQ2hhcnRCYXNlLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgYXhpcyBjb21wb25lbnRzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmNvdmVydERhdGEgY29udmVydGVkIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuYXhlcyBheGVzIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMucGxvdERhdGEgcGxvdCBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge2Z1bmN0aW9ufSBwYXJhbXMuU2VyaWVzIHNlcmllcyBjbGFzc1xuICAgICAqL1xuICAgIGFkZEF4aXNDb21wb25lbnRzOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGNvbnZlcnREYXRhID0gcGFyYW1zLmNvbnZlcnREYXRhO1xuXG4gICAgICAgIGlmIChwYXJhbXMucGxvdERhdGEpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KCdwbG90JywgUGxvdCwgcGFyYW1zLnBsb3REYXRhKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaChwYXJhbXMuYXhlcywgZnVuY3Rpb24oZGF0YSwgbmFtZSkge1xuICAgICAgICAgICAgdGhpcy5hZGRDb21wb25lbnQobmFtZSwgQXhpcywge1xuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGFcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICBpZiAoY29udmVydERhdGEuam9pbkxlZ2VuZExhYmVscykge1xuICAgICAgICAgICAgdGhpcy5hZGRDb21wb25lbnQoJ2xlZ2VuZCcsIExlZ2VuZCwge1xuICAgICAgICAgICAgICAgIGpvaW5MZWdlbmRMYWJlbHM6IGNvbnZlcnREYXRhLmpvaW5MZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICAgICAgbGVnZW5kTGFiZWxzOiBjb252ZXJ0RGF0YS5sZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICAgICAgY2hhcnRUeXBlOiBwYXJhbXMuY2hhcnRUeXBlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KCd0b29sdGlwJywgVG9vbHRpcCwge1xuICAgICAgICAgICAgdmFsdWVzOiBjb252ZXJ0RGF0YS5mb3JtYXR0ZWRWYWx1ZXMsXG4gICAgICAgICAgICBsYWJlbHM6IGNvbnZlcnREYXRhLmxhYmVscyxcbiAgICAgICAgICAgIGxlZ2VuZExhYmVsczogY29udmVydERhdGEubGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgcHJlZml4OiB0aGlzLnRvb2x0aXBQcmVmaXhcbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQXhpc1R5cGVCYXNlO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEJhciBjaGFydC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIEF4aXNUeXBlQmFzZSA9IHJlcXVpcmUoJy4vYXhpc1R5cGVCYXNlLmpzJyksXG4gICAgYXhpc0RhdGFNYWtlciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvYXhpc0RhdGFNYWtlci5qcycpLFxuICAgIFNlcmllcyA9IHJlcXVpcmUoJy4uL3Nlcmllcy9iYXJDaGFydFNlcmllcy5qcycpO1xuXG52YXIgQmFyQ2hhcnQgPSBuZS51dGlsLmRlZmluZUNsYXNzKEF4aXNUeXBlQmFzZSwgLyoqIEBsZW5kcyBCYXJDaGFydC5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIEJhciBjaGFydC5cbiAgICAgKiAqIEBjb25zdHJ1Y3RzIEJhckNoYXJ0XG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXk+fSB1c2VyRGF0YSBjaGFydCBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIGNoYXJ0IHRoZW1lXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKHVzZXJEYXRhLCB0aGVtZSwgb3B0aW9ucykge1xuICAgICAgICB2YXIgYmFzZURhdGEgPSB0aGlzLm1ha2VCYXNlRGF0YSh1c2VyRGF0YSwgdGhlbWUsIG9wdGlvbnMsIHtcbiAgICAgICAgICAgICAgICBoYXNBeGVzOiB0cnVlXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGNvbnZlcnREYXRhID0gYmFzZURhdGEuY29udmVydERhdGEsXG4gICAgICAgICAgICBib3VuZHMgPSBiYXNlRGF0YS5ib3VuZHMsXG4gICAgICAgICAgICBheGlzRGF0YTtcblxuICAgICAgICB0aGlzLmNsYXNzTmFtZSA9ICduZS1iYXItY2hhcnQnO1xuXG4gICAgICAgIEF4aXNUeXBlQmFzZS5jYWxsKHRoaXMsIGJvdW5kcywgdGhlbWUsIG9wdGlvbnMpO1xuXG4gICAgICAgIGF4aXNEYXRhID0gdGhpcy5fbWFrZUF4ZXNEYXRhKGNvbnZlcnREYXRhLCBib3VuZHMsIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLl9hZGRDb21wb25lbnRzKGNvbnZlcnREYXRhLCBheGlzRGF0YSwgb3B0aW9ucyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYXhlcyBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGNvbnZlcnREYXRhIGNvbnZlcnRlZCBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGJvdW5kcyBjaGFydCBib3VuZHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogQHJldHVybnMge29iamVjdH0gYXhlcyBkYXRhXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUF4ZXNEYXRhOiBmdW5jdGlvbihjb252ZXJ0RGF0YSwgYm91bmRzLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciBheGVzRGF0YSA9IHtcbiAgICAgICAgICAgIHlBeGlzOiBheGlzRGF0YU1ha2VyLm1ha2VMYWJlbEF4aXNEYXRhKHtcbiAgICAgICAgICAgICAgICBsYWJlbHM6IGNvbnZlcnREYXRhLmxhYmVscyxcbiAgICAgICAgICAgICAgICBpc1ZlcnRpY2FsOiB0cnVlXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIHhBeGlzOiBheGlzRGF0YU1ha2VyLm1ha2VWYWx1ZUF4aXNEYXRhKHtcbiAgICAgICAgICAgICAgICB2YWx1ZXM6IGNvbnZlcnREYXRhLnZhbHVlcyxcbiAgICAgICAgICAgICAgICBzZXJpZXNEaW1lbnNpb246IGJvdW5kcy5zZXJpZXMuZGltZW5zaW9uLFxuICAgICAgICAgICAgICAgIHN0YWNrZWQ6IG9wdGlvbnMuc2VyaWVzICYmIG9wdGlvbnMuc2VyaWVzLnN0YWNrZWQgfHwgJycsXG4gICAgICAgICAgICAgICAgY2hhcnRUeXBlOiBvcHRpb25zLmNoYXJ0VHlwZSxcbiAgICAgICAgICAgICAgICBmb3JtYXRGdW5jdGlvbnM6IGNvbnZlcnREYXRhLmZvcm1hdEZ1bmN0aW9ucyxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zLnhBeGlzXG4gICAgICAgICAgICB9KVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gYXhlc0RhdGE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZCBjb21wb25lbnRzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGNvbnZlcnREYXRhIGNvbnZlcnRlZCBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGF4ZXNEYXRhIGF4ZXMgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hZGRDb21wb25lbnRzOiBmdW5jdGlvbihjb252ZXJ0RGF0YSwgYXhlc0RhdGEsIG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5hZGRBeGlzQ29tcG9uZW50cyh7XG4gICAgICAgICAgICBjb252ZXJ0RGF0YTogY29udmVydERhdGEsXG4gICAgICAgICAgICBheGVzOiBheGVzRGF0YSxcbiAgICAgICAgICAgIHBsb3REYXRhOiB7XG4gICAgICAgICAgICAgICAgdlRpY2tDb3VudDogYXhlc0RhdGEueUF4aXMudmFsaWRUaWNrQ291bnQsXG4gICAgICAgICAgICAgICAgaFRpY2tDb3VudDogYXhlc0RhdGEueEF4aXMudmFsaWRUaWNrQ291bnRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjaGFydFR5cGU6IG9wdGlvbnMuY2hhcnRUeXBlXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KCdzZXJpZXMnLCBTZXJpZXMsIHtcbiAgICAgICAgICAgIGxpYlR5cGU6IG9wdGlvbnMubGliVHlwZSxcbiAgICAgICAgICAgIGNoYXJ0VHlwZTogb3B0aW9ucy5jaGFydFR5cGUsXG4gICAgICAgICAgICB0b29sdGlwUHJlZml4OiB0aGlzLnRvb2x0aXBQcmVmaXgsXG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgdmFsdWVzOiBjb252ZXJ0RGF0YS52YWx1ZXMsXG4gICAgICAgICAgICAgICAgZm9ybWF0dGVkVmFsdWVzOiBjb252ZXJ0RGF0YS5mb3JtYXR0ZWRWYWx1ZXMsXG4gICAgICAgICAgICAgICAgc2NhbGU6IGF4ZXNEYXRhLnhBeGlzLnNjYWxlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJhckNoYXJ0O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IENoYXJ0QmFzZVxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZG9tID0gcmVxdWlyZSgnLi4vaGVscGVycy9kb21IYW5kbGVyLmpzJyksXG4gICAgcmVuZGVyVXRpbCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvcmVuZGVyVXRpbC5qcycpLFxuICAgIGRhdGFDb252ZXJ0ZXIgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2RhdGFDb252ZXJ0ZXIuanMnKSxcbiAgICBib3VuZHNNYWtlciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvYm91bmRzTWFrZXIuanMnKTtcblxudmFyIFRPT0xUSVBfUFJFRklYID0gJ25lLWNoYXJ0LXRvb2x0aXAtJztcblxudmFyIENoYXJ0QmFzZSA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBDaGFydEJhc2UucHJvdG90eXBlICovIHtcbiAgICB0b29sdGlwUHJlZml4OiBUT09MVElQX1BSRUZJWCArIChuZXcgRGF0ZSgpKS5nZXRUaW1lKCkgKyAnLScsXG5cbiAgICAvKipcbiAgICAgKiBDaGFydCBiYXNlLlxuICAgICAqIEBjb25zdHJ1Y3RzIENoYXJ0QmFzZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBib3VuZHMgY2hhcnQgYm91bmRzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIGNoYXJ0IHRoZW1lXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBpbml0ZWREYXRhIGluaXRpYWxpemVkIGRhdGEgZnJvbSBjb21ibyBjaGFydFxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKGJvdW5kcywgdGhlbWUsIG9wdGlvbnMsIGluaXRlZERhdGEpIHtcbiAgICAgICAgdGhpcy5jb21wb25lbnRzID0gW107XG4gICAgICAgIHRoaXMuY29tcG9uZW50TWFwID0ge307XG4gICAgICAgIHRoaXMuYm91bmRzID0gYm91bmRzO1xuICAgICAgICB0aGlzLnRoZW1lID0gdGhlbWU7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgICAgIGlmIChpbml0ZWREYXRhICYmIGluaXRlZERhdGEucHJlZml4KSB7XG4gICAgICAgICAgICB0aGlzLnRvb2x0aXBQcmVmaXggKz0gaW5pdGVkRGF0YS5wcmVmaXg7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBiYWVzIGRhdGEuXG4gICAgICogQHBhcmFtIHthcnJheSB8IG9iamVjdH0gdXNlckRhdGEgdXNlciBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIGNoYXJ0IHRoZW1lXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBib3VuZFBhcmFtcyBhZGQgYm91bmQgcGFyYW1zXG4gICAgICogQHJldHVybnMge3tjb252ZXJ0RGF0YTogb2JqZWN0LCBib3VuZHM6IG9iamVjdH19IGJhc2UgZGF0YVxuICAgICAqL1xuICAgIG1ha2VCYXNlRGF0YTogZnVuY3Rpb24odXNlckRhdGEsIHRoZW1lLCBvcHRpb25zLCBib3VuZFBhcmFtcykge1xuICAgICAgICB2YXIgY29udmVydERhdGEgPSBkYXRhQ29udmVydGVyLmNvbnZlcnQodXNlckRhdGEsIG9wdGlvbnMuY2hhcnQsIG9wdGlvbnMuY2hhcnRUeXBlLCBib3VuZFBhcmFtcyAmJiBib3VuZFBhcmFtcy55QXhpc0NoYXJ0VHlwZXMpLFxuICAgICAgICAgICAgYm91bmRzID0gYm91bmRzTWFrZXIubWFrZShuZS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgY29udmVydERhdGE6IGNvbnZlcnREYXRhLFxuICAgICAgICAgICAgICAgIHRoZW1lOiB0aGVtZSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zXG4gICAgICAgICAgICB9LCBib3VuZFBhcmFtcykpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjb252ZXJ0RGF0YTogY29udmVydERhdGEsXG4gICAgICAgICAgICBib3VuZHM6IGJvdW5kc1xuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgY29tcG9uZW50LlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIGNvbXBvbmVudCBuYW1lXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gQ29tcG9uZW50IGNvbXBvbmVudCBmdW5jdGlvblxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqL1xuICAgIGFkZENvbXBvbmVudDogZnVuY3Rpb24obmFtZSwgQ29tcG9uZW50LCBwYXJhbXMpIHtcbiAgICAgICAgdmFyIGJvdW5kID0gdGhpcy5ib3VuZHNbbmFtZV0sXG4gICAgICAgICAgICB0aGVtZSA9IHRoaXMudGhlbWVbbmFtZV0sXG4gICAgICAgICAgICBvcHRpb25zID0gdGhpcy5vcHRpb25zW25hbWVdLFxuICAgICAgICAgICAgaW5kZXggPSBwYXJhbXMuaW5kZXggfHwgMCxcbiAgICAgICAgICAgIGNvbW1vblBhcmFtcyA9IHt9LFxuICAgICAgICAgICAgY29tcG9uZW50O1xuXG4gICAgICAgIGNvbW1vblBhcmFtcy5ib3VuZCA9IG5lLnV0aWwuaXNBcnJheShib3VuZCkgPyBib3VuZFtpbmRleF0gOiBib3VuZDtcbiAgICAgICAgY29tbW9uUGFyYW1zLnRoZW1lID0gbmUudXRpbC5pc0FycmF5KHRoZW1lKSA/IHRoZW1lW2luZGV4XSA6IHRoZW1lO1xuICAgICAgICBjb21tb25QYXJhbXMub3B0aW9ucyA9IG5lLnV0aWwuaXNBcnJheShvcHRpb25zKSA/IG9wdGlvbnNbaW5kZXhdIDogb3B0aW9ucyB8fCB7fTtcblxuICAgICAgICBwYXJhbXMgPSBuZS51dGlsLmV4dGVuZChjb21tb25QYXJhbXMsIHBhcmFtcyk7XG4gICAgICAgIGNvbXBvbmVudCA9IG5ldyBDb21wb25lbnQocGFyYW1zKTtcbiAgICAgICAgdGhpcy5jb21wb25lbnRzLnB1c2goY29tcG9uZW50KTtcbiAgICAgICAgdGhpcy5jb21wb25lbnRNYXBbbmFtZV0gPSBjb21wb25lbnQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBjaGFydC5cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCBjaGFydCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIG9iamVjdCBmb3IgZ3JhcGggZHJhd2luZ1xuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gY2hhcnQgZWxlbWVudFxuICAgICAqL1xuICAgIHJlbmRlcjogZnVuY3Rpb24oZWwsIHBhcGVyKSB7XG4gICAgICAgIGlmICghZWwpIHtcbiAgICAgICAgICAgIGVsID0gZG9tLmNyZWF0ZSgnRElWJywgdGhpcy5jbGFzc05hbWUpO1xuXG4gICAgICAgICAgICBkb20uYWRkQ2xhc3MoZWwsICduZS1jaGFydCcpO1xuICAgICAgICAgICAgdGhpcy5fcmVuZGVyVGl0bGUoZWwpO1xuICAgICAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJEaW1lbnNpb24oZWwsIHRoaXMuYm91bmRzLmNoYXJ0LmRpbWVuc2lvbik7XG4gICAgICAgICAgICByZW5kZXJVdGlsLnJlbmRlckJhY2tncm91bmQoZWwsIHRoaXMudGhlbWUuY2hhcnQuYmFja2dyb3VuZCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9yZW5kZXJDb21wb25lbnRzKGVsLCB0aGlzLmNvbXBvbmVudHMsIHBhcGVyKTtcbiAgICAgICAgdGhpcy5fYXR0YWNoQ3VzdG9tRXZlbnQoKTtcbiAgICAgICAgcmV0dXJuIGVsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgdGl0bGUuXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJUaXRsZTogZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgdmFyIGNoYXJ0T3B0aW9ucyA9IHRoaXMub3B0aW9ucy5jaGFydCB8fCB7fSxcbiAgICAgICAgICAgIGVsVGl0bGUgPSByZW5kZXJVdGlsLnJlbmRlclRpdGxlKGNoYXJ0T3B0aW9ucy50aXRsZSwgdGhpcy50aGVtZS50aXRsZSwgJ25lLWNoYXJ0LXRpdGxlJyk7XG4gICAgICAgIGRvbS5hcHBlbmQoZWwsIGVsVGl0bGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgY29tcG9uZW50cy5cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY29udGFpbmVyIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxvYmplY3Q+fSBjb21wb25lbnRzIGNvbXBvbmVudHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgb2JqZWN0IGZvciBncmFwaCBkcmF3aW5nXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyQ29tcG9uZW50czogZnVuY3Rpb24oY29udGFpbmVyLCBjb21wb25lbnRzLCBwYXBlcikge1xuICAgICAgICB2YXIgZWxlbWVudHMgPSBuZS51dGlsLm1hcChjb21wb25lbnRzLCBmdW5jdGlvbihjb21wb25lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBjb21wb25lbnQucmVuZGVyKHBhcGVyKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGRvbS5hcHBlbmQoY29udGFpbmVyLCBlbGVtZW50cyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBwYXBlci5cbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBwYXBlclxuICAgICAqL1xuICAgIGdldFBhcGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlcmllcyA9IHRoaXMuY29tcG9uZW50TWFwLnNlcmllcyxcbiAgICAgICAgICAgIHBhcGVyO1xuXG4gICAgICAgIGlmIChzZXJpZXMpIHtcbiAgICAgICAgICAgIHBhcGVyID0gc2VyaWVzLmdldFBhcGVyKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGFwZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCBjdXN0b20gZXZlbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hdHRhY2hDdXN0b21FdmVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB0b29sdGlwID0gdGhpcy5jb21wb25lbnRNYXAudG9vbHRpcCxcbiAgICAgICAgICAgIHNlcmllcyA9IHRoaXMuY29tcG9uZW50TWFwLnNlcmllcztcbiAgICAgICAgaWYgKCF0b29sdGlwIHx8ICFzZXJpZXMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzZXJpZXMub24oJ3Nob3dUb29sdGlwJywgdG9vbHRpcC5vblNob3csIHRvb2x0aXApO1xuICAgICAgICBzZXJpZXMub24oJ2hpZGVUb29sdGlwJywgdG9vbHRpcC5vbkhpZGUsIHRvb2x0aXApO1xuXG4gICAgICAgIGlmICghc2VyaWVzLm9uU2hvd0FuaW1hdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdG9vbHRpcC5vbignc2hvd0FuaW1hdGlvbicsIHNlcmllcy5vblNob3dBbmltYXRpb24sIHNlcmllcyk7XG4gICAgICAgIHRvb2x0aXAub24oJ2hpZGVBbmltYXRpb24nLCBzZXJpZXMub25IaWRlQW5pbWF0aW9uLCBzZXJpZXMpO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENoYXJ0QmFzZTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBDb2x1bW4gY2hhcnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBBeGlzVHlwZUJhc2UgPSByZXF1aXJlKCcuL2F4aXNUeXBlQmFzZS5qcycpLFxuICAgIGF4aXNEYXRhTWFrZXIgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2F4aXNEYXRhTWFrZXIuanMnKSxcbiAgICBTZXJpZXMgPSByZXF1aXJlKCcuLi9zZXJpZXMvY29sdW1uQ2hhcnRTZXJpZXMuanMnKTtcblxudmFyIENvbHVtbkNoYXJ0ID0gbmUudXRpbC5kZWZpbmVDbGFzcyhBeGlzVHlwZUJhc2UsIC8qKiBAbGVuZHMgQ29sdW1uQ2hhcnQucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBDb2x1bW4gY2hhcnQuXG4gICAgICogKiBAY29uc3RydWN0cyBDb2x1bW5DaGFydFxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gdXNlckRhdGEgY2hhcnQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBjaGFydCB0aGVtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gaW5pdGVkRGF0YSBpbml0aWFsaXplZCBkYXRhIGZyb20gY29tYm8gY2hhcnRcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbih1c2VyRGF0YSwgdGhlbWUsIG9wdGlvbnMsIGluaXRlZERhdGEpIHtcbiAgICAgICAgdmFyIGJhc2VEYXRhID0gaW5pdGVkRGF0YSB8fCB0aGlzLm1ha2VCYXNlRGF0YSh1c2VyRGF0YSwgdGhlbWUsIG9wdGlvbnMsIHtcbiAgICAgICAgICAgICAgICBpc1ZlcnRpY2FsOiB0cnVlLFxuICAgICAgICAgICAgICAgIGhhc0F4ZXM6IHRydWVcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgY29udmVydERhdGEgPSBiYXNlRGF0YS5jb252ZXJ0RGF0YSxcbiAgICAgICAgICAgIGJvdW5kcyA9IGJhc2VEYXRhLmJvdW5kcyxcbiAgICAgICAgICAgIGF4aXNEYXRhO1xuXG4gICAgICAgIHRoaXMuY2xhc3NOYW1lID0gJ25lLWNvbHVtbi1jaGFydCc7XG5cbiAgICAgICAgQXhpc1R5cGVCYXNlLmNhbGwodGhpcywgYm91bmRzLCB0aGVtZSwgb3B0aW9ucywgaW5pdGVkRGF0YSk7XG5cbiAgICAgICAgYXhpc0RhdGEgPSB0aGlzLl9tYWtlQXhlc0RhdGEoY29udmVydERhdGEsIGJvdW5kcywgb3B0aW9ucywgaW5pdGVkRGF0YSk7XG4gICAgICAgIHRoaXMuX2FkZENvbXBvbmVudHMoY29udmVydERhdGEsIGF4aXNEYXRhLCBvcHRpb25zKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBheGVzIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udmVydERhdGEgY29udmVydGVkIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYm91bmRzIGNoYXJ0IGJvdW5kc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gaW5pdGVkRGF0YSBpbml0aWFsaXplZCBkYXRhIGZyb20gY29tYm8gY2hhcnRcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBheGVzIGRhdGFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQXhlc0RhdGE6IGZ1bmN0aW9uKGNvbnZlcnREYXRhLCBib3VuZHMsIG9wdGlvbnMsIGluaXRlZERhdGEpIHtcbiAgICAgICAgdmFyIGF4ZXNEYXRhID0ge307XG4gICAgICAgIGlmIChpbml0ZWREYXRhKSB7XG4gICAgICAgICAgICBheGVzRGF0YSA9IGluaXRlZERhdGEuYXhlcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGF4ZXNEYXRhID0ge1xuICAgICAgICAgICAgICAgIHlBeGlzOiBheGlzRGF0YU1ha2VyLm1ha2VWYWx1ZUF4aXNEYXRhKHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzOiBjb252ZXJ0RGF0YS52YWx1ZXMsXG4gICAgICAgICAgICAgICAgICAgIHNlcmllc0RpbWVuc2lvbjogYm91bmRzLnNlcmllcy5kaW1lbnNpb24sXG4gICAgICAgICAgICAgICAgICAgIHN0YWNrZWQ6IG9wdGlvbnMuc2VyaWVzICYmIG9wdGlvbnMuc2VyaWVzLnN0YWNrZWQgfHwgJycsXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0VHlwZTogb3B0aW9ucy5jaGFydFR5cGUsXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdEZ1bmN0aW9uczogY29udmVydERhdGEuZm9ybWF0RnVuY3Rpb25zLFxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zLnlBeGlzLFxuICAgICAgICAgICAgICAgICAgICBpc1ZlcnRpY2FsOiB0cnVlXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgeEF4aXM6IGF4aXNEYXRhTWFrZXIubWFrZUxhYmVsQXhpc0RhdGEoe1xuICAgICAgICAgICAgICAgICAgICBsYWJlbHM6IGNvbnZlcnREYXRhLmxhYmVsc1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBheGVzRGF0YTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIGNvbXBvbmVudHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udmVydERhdGEgY29udmVydGVkIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYXhlc0RhdGEgYXhlcyBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2FkZENvbXBvbmVudHM6IGZ1bmN0aW9uKGNvbnZlcnREYXRhLCBheGVzRGF0YSwgb3B0aW9ucykge1xuICAgICAgICB0aGlzLmFkZEF4aXNDb21wb25lbnRzKHtcbiAgICAgICAgICAgIGNvbnZlcnREYXRhOiBjb252ZXJ0RGF0YSxcbiAgICAgICAgICAgIGF4ZXM6IGF4ZXNEYXRhLFxuICAgICAgICAgICAgcGxvdERhdGE6ICFuZS51dGlsLmlzVW5kZWZpbmVkKGNvbnZlcnREYXRhLnBsb3REYXRhKSA/IGNvbnZlcnREYXRhLnBsb3REYXRhIDoge1xuICAgICAgICAgICAgICAgIHZUaWNrQ291bnQ6IGF4ZXNEYXRhLnlBeGlzLnZhbGlkVGlja0NvdW50LFxuICAgICAgICAgICAgICAgIGhUaWNrQ291bnQ6IGF4ZXNEYXRhLnhBeGlzLnZhbGlkVGlja0NvdW50XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2hhcnRUeXBlOiBvcHRpb25zLmNoYXJ0VHlwZVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmFkZENvbXBvbmVudCgnc2VyaWVzJywgU2VyaWVzLCB7XG4gICAgICAgICAgICBsaWJUeXBlOiBvcHRpb25zLmxpYlR5cGUsXG4gICAgICAgICAgICBjaGFydFR5cGU6IG9wdGlvbnMuY2hhcnRUeXBlLFxuICAgICAgICAgICAgdG9vbHRpcFByZWZpeDogdGhpcy50b29sdGlwUHJlZml4LFxuICAgICAgICAgICAgaXNQb2ludFBvc2l0aW9uOiB0cnVlLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIHZhbHVlczogY29udmVydERhdGEudmFsdWVzLFxuICAgICAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlczogY29udmVydERhdGEuZm9ybWF0dGVkVmFsdWVzLFxuICAgICAgICAgICAgICAgIHNjYWxlOiBheGVzRGF0YS55QXhpcy5zY2FsZVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb2x1bW5DaGFydDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBDb21ibyBjaGFydC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGNhbGN1bGF0b3IgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2NhbGN1bGF0b3IuanMnKSxcbiAgICBDaGFydEJhc2UgPSByZXF1aXJlKCcuL2NoYXJ0QmFzZS5qcycpLFxuICAgIGF4aXNEYXRhTWFrZXIgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2F4aXNEYXRhTWFrZXIuanMnKSxcbiAgICBkZWZhdWx0VGhlbWUgPSByZXF1aXJlKCcuLi90aGVtZXMvZGVmYXVsdFRoZW1lLmpzJyksXG4gICAgQ29sdW1uQ2hhcnQgPSByZXF1aXJlKCcuL2NvbHVtbkNoYXJ0JyksXG4gICAgTGluZUNoYXJ0ID0gcmVxdWlyZSgnLi9saW5lQ2hhcnQnKTtcblxudmFyIENvbWJvQ2hhcnQgPSBuZS51dGlsLmRlZmluZUNsYXNzKENoYXJ0QmFzZSwgLyoqIEBsZW5kcyBDb21ib0NoYXJ0LnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogQ29tYm8gY2hhcnQuXG4gICAgICogKiBAY29uc3RydWN0cyBDb21ib0NoYXJ0XG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXk+fSB1c2VyRGF0YSBjaGFydCBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIGNoYXJ0IHRoZW1lXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKHVzZXJEYXRhLCB0aGVtZSwgb3B0aW9ucykge1xuICAgICAgICB2YXIgc2VyaWVzQ2hhcnRUeXBlcyA9IG5lLnV0aWwua2V5cyh1c2VyRGF0YS5zZXJpZXMpLnNvcnQoKSxcbiAgICAgICAgICAgIHlBeGlzQ2hhcnRUeXBlcyA9IHRoaXMuX2dldFlBeGlzQ2hhcnRUeXBlcyhzZXJpZXNDaGFydFR5cGVzLCBvcHRpb25zLnlBeGlzKSxcbiAgICAgICAgICAgIGNoYXJ0VHlwZXMgPSB5QXhpc0NoYXJ0VHlwZXMubGVuZ3RoID8geUF4aXNDaGFydFR5cGVzIDogc2VyaWVzQ2hhcnRUeXBlcyxcbiAgICAgICAgICAgIGlzT25lWUF4aXMgPSAheUF4aXNDaGFydFR5cGVzLmxlbmd0aCxcbiAgICAgICAgICAgIGJhc2VEYXRhID0gdGhpcy5tYWtlQmFzZURhdGEodXNlckRhdGEsIHRoZW1lLCBvcHRpb25zLCB7XG4gICAgICAgICAgICAgICAgaXNWZXJ0aWNhbDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBoYXNBeGVzOiB0cnVlLFxuICAgICAgICAgICAgICAgIHlBeGlzQ2hhcnRUeXBlczogeUF4aXNDaGFydFR5cGVzXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGNvbnZlcnREYXRhID0gYmFzZURhdGEuY29udmVydERhdGEsXG4gICAgICAgICAgICBib3VuZHMgPSBiYXNlRGF0YS5ib3VuZHMsXG4gICAgICAgICAgICBzZXJpZXNEaW1lbnNpb24gPSBib3VuZHMuc2VyaWVzLmRpbWVuc2lvbixcbiAgICAgICAgICAgIGF4ZXNEYXRhID0ge30sXG4gICAgICAgICAgICBiYXNlQXhlc0RhdGEgPSB7fSxcbiAgICAgICAgICAgIHlBeGlzUGFyYW1zO1xuXG4gICAgICAgIHRoaXMuY2xhc3NOYW1lID0gJ25lLWNvbWJvLWNoYXJ0JztcblxuICAgICAgICB5QXhpc1BhcmFtcyA9IHtcbiAgICAgICAgICAgIGNvbnZlcnREYXRhOiBjb252ZXJ0RGF0YSxcbiAgICAgICAgICAgIHNlcmllc0RpbWVuc2lvbjogc2VyaWVzRGltZW5zaW9uLFxuICAgICAgICAgICAgY2hhcnRUeXBlczogY2hhcnRUeXBlcyxcbiAgICAgICAgICAgIGlzT25lWUF4aXM6IGlzT25lWUF4aXMsXG4gICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zXG4gICAgICAgIH07XG5cbiAgICAgICAgQ2hhcnRCYXNlLmNhbGwodGhpcywgYm91bmRzLCB0aGVtZSwgb3B0aW9ucyk7XG5cbiAgICAgICAgYmFzZUF4ZXNEYXRhLnlBeGlzID0gdGhpcy5fbWFrZVlBeGlzRGF0YShuZS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICBpbmRleDogMFxuICAgICAgICB9LCB5QXhpc1BhcmFtcykpO1xuXG4gICAgICAgIGJhc2VBeGVzRGF0YS54QXhpcyA9IGF4aXNEYXRhTWFrZXIubWFrZUxhYmVsQXhpc0RhdGEoe1xuICAgICAgICAgICAgbGFiZWxzOiBjb252ZXJ0RGF0YS5sYWJlbHNcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXhlc0RhdGEgPSB0aGlzLl9tYWtlQXhlc0RhdGEoYmFzZUF4ZXNEYXRhLCB5QXhpc1BhcmFtcyk7XG5cbiAgICAgICAgdGhpcy5faW5zdGFsbENoYXJ0cyh7XG4gICAgICAgICAgICB1c2VyRGF0YTogdXNlckRhdGEsXG4gICAgICAgICAgICB0aGVtZTogdGhlbWUsXG4gICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zLFxuICAgICAgICAgICAgYmFzZURhdGE6IGJhc2VEYXRhLFxuICAgICAgICAgICAgYmFzZUF4ZXNEYXRhOiBiYXNlQXhlc0RhdGEsXG4gICAgICAgICAgICBheGVzRGF0YTogYXhlc0RhdGEsXG4gICAgICAgICAgICBzZXJpZXNDaGFydFR5cGVzOiBzZXJpZXNDaGFydFR5cGVzLFxuICAgICAgICAgICAgY2hhcnRUeXBlczogY2hhcnRUeXBlc1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHkgYXhpcyBjaGFydCB0eXBlcy5cbiAgICAgKiBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBjaGFydFR5cGVzIGNoYXJ0IHR5cGVzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHlBeGlzT3B0aW9ucyB5IGF4aXMgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHthcnJheS48c3RyaW5nPn0gY2hhcnQgdHlwZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRZQXhpc0NoYXJ0VHlwZXM6IGZ1bmN0aW9uKGNoYXJ0VHlwZXMsIHlBeGlzT3B0aW9ucykge1xuICAgICAgICB2YXIgcmVzdWx0Q2hhcnRUeXBlcyA9IGNoYXJ0VHlwZXMuc2xpY2UoKSxcbiAgICAgICAgICAgIGlzUmV2ZXJzZSA9IGZhbHNlLFxuICAgICAgICAgICAgb3B0aW9uQ2hhcnRUeXBlcztcblxuICAgICAgICB5QXhpc09wdGlvbnMgPSB5QXhpc09wdGlvbnMgPyBbXS5jb25jYXQoeUF4aXNPcHRpb25zKSA6IFtdO1xuXG4gICAgICAgIGlmICh5QXhpc09wdGlvbnMubGVuZ3RoID09PSAxICYmICF5QXhpc09wdGlvbnNbMF0uY2hhcnRUeXBlKSB7XG4gICAgICAgICAgICByZXN1bHRDaGFydFR5cGVzID0gW107XG4gICAgICAgIH0gZWxzZSBpZiAoeUF4aXNPcHRpb25zLmxlbmd0aCkge1xuICAgICAgICAgICAgb3B0aW9uQ2hhcnRUeXBlcyA9IG5lLnV0aWwubWFwKHlBeGlzT3B0aW9ucywgZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbi5jaGFydFR5cGU7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkob3B0aW9uQ2hhcnRUeXBlcywgZnVuY3Rpb24oY2hhcnRUeXBlLCBpbmRleCkge1xuICAgICAgICAgICAgICAgIGlzUmV2ZXJzZSA9IGlzUmV2ZXJzZSB8fCAoY2hhcnRUeXBlICYmIHJlc3VsdENoYXJ0VHlwZXNbaW5kZXhdICE9PSBjaGFydFR5cGUgfHwgZmFsc2UpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmIChpc1JldmVyc2UpIHtcbiAgICAgICAgICAgICAgICByZXN1bHRDaGFydFR5cGVzLnJldmVyc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHRDaGFydFR5cGVzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHkgYXhpcyBkYXRhLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5pbmRleCBjaGFydCBpbmRleFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5jb252ZXJ0RGF0YSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBwYXJhbXMuc2VyaWVzRGltZW5zaW9uIHNlcmllcyBkaW1lbnNpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGNoYXJ0VHlwZXMgY2hhcnQgdHlwZVxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBpc09uZVlBeGlzIHdoZXRoZXIgb25lIHNlcmllcyBvciBub3RcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBhZGRQYXJhbXMgYWRkIHBhcmFtc1xuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHkgYXhpcyBkYXRhXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVlBeGlzRGF0YTogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBjb252ZXJ0RGF0YSA9IHBhcmFtcy5jb252ZXJ0RGF0YSxcbiAgICAgICAgICAgIGluZGV4ID0gcGFyYW1zLmluZGV4LFxuICAgICAgICAgICAgY2hhcnRUeXBlID0gcGFyYW1zLmNoYXJ0VHlwZXNbaW5kZXhdLFxuICAgICAgICAgICAgb3B0aW9ucyA9IHBhcmFtcy5vcHRpb25zLFxuICAgICAgICAgICAgeUF4aXNWYWx1ZXMsIHlBeGlzT3B0aW9ucywgc2VyaWVzT3B0aW9uO1xuXG4gICAgICAgIGlmIChwYXJhbXMuaXNPbmVZQXhpcykge1xuICAgICAgICAgICAgeUF4aXNWYWx1ZXMgPSBjb252ZXJ0RGF0YS5qb2luVmFsdWVzO1xuICAgICAgICAgICAgeUF4aXNPcHRpb25zID0gW29wdGlvbnMueUF4aXNdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgeUF4aXNWYWx1ZXMgPSBjb252ZXJ0RGF0YS52YWx1ZXNbY2hhcnRUeXBlXTtcbiAgICAgICAgICAgIHlBeGlzT3B0aW9ucyA9IG9wdGlvbnMueUF4aXMgfHwgW107XG4gICAgICAgIH1cblxuICAgICAgICBzZXJpZXNPcHRpb24gPSBvcHRpb25zLnNlcmllcyAmJiBvcHRpb25zLnNlcmllc1tjaGFydFR5cGVdIHx8IG9wdGlvbnMuc2VyaWVzO1xuXG4gICAgICAgIHJldHVybiBheGlzRGF0YU1ha2VyLm1ha2VWYWx1ZUF4aXNEYXRhKG5lLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgIHZhbHVlczogeUF4aXNWYWx1ZXMsXG4gICAgICAgICAgICBzdGFja2VkOiBzZXJpZXNPcHRpb24gJiYgc2VyaWVzT3B0aW9uLnN0YWNrZWQgfHwgJycsXG4gICAgICAgICAgICBvcHRpb25zOiB5QXhpc09wdGlvbnNbaW5kZXhdLFxuICAgICAgICAgICAgY2hhcnRUeXBlOiBjaGFydFR5cGUsXG4gICAgICAgICAgICBzZXJpZXNEaW1lbnNpb246IHBhcmFtcy5zZXJpZXNEaW1lbnNpb24sXG4gICAgICAgICAgICBmb3JtYXRGdW5jdGlvbnM6IGNvbnZlcnREYXRhLmZvcm1hdEZ1bmN0aW9ucyxcbiAgICAgICAgICAgIGlzVmVydGljYWw6IHRydWVcbiAgICAgICAgfSwgcGFyYW1zLmFkZFBhcmFtcykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGF4ZXMgZGF0YS5cbiAgICAgKiBAcGFyYW0ge3t5QXhpczogb2JqZWN0LCB4QXhpczogb2JqZWN0fX0gYmFzZUF4ZXNEYXRhIGJhc2UgYXhlcyBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHlBeGlzUGFyYW1zIHkgYXhpcyBwYXJhbXNcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBheGVzIGRhdGFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQXhlc0RhdGE6IGZ1bmN0aW9uKGJhc2VBeGVzRGF0YSwgeUF4aXNQYXJhbXMpIHtcbiAgICAgICAgdmFyIHlBeGlzRGF0YSA9IGJhc2VBeGVzRGF0YS55QXhpcyxcbiAgICAgICAgICAgIGNoYXJ0VHlwZXMgPSB5QXhpc1BhcmFtcy5jaGFydFR5cGVzLFxuICAgICAgICAgICAgYXhlc0RhdGEgPSB7fSxcbiAgICAgICAgICAgIHlyQXhpc0RhdGE7XG4gICAgICAgIGlmICgheUF4aXNQYXJhbXMuaXNPbmVZQXhpcykge1xuICAgICAgICAgICAgeXJBeGlzRGF0YSA9IHRoaXMuX21ha2VZQXhpc0RhdGEobmUudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgICAgIGluZGV4OiAxLFxuICAgICAgICAgICAgICAgIGFkZFBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICBpc1Bvc2l0aW9uUmlnaHQ6IHRydWVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB5QXhpc1BhcmFtcykpO1xuICAgICAgICAgICAgaWYgKHlBeGlzRGF0YS50aWNrQ291bnQgPCB5ckF4aXNEYXRhLnRpY2tDb3VudCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luY3JlYXNlWUF4aXNTY2FsZU1heCh5ckF4aXNEYXRhLCB5QXhpc0RhdGEpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh5QXhpc0RhdGEudGlja0NvdW50ID4geXJBeGlzRGF0YS50aWNrQ291bnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbmNyZWFzZVlBeGlzU2NhbGVNYXgoeUF4aXNEYXRhLCB5ckF4aXNEYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGF4ZXNEYXRhW2NoYXJ0VHlwZXNbMF1dID0gYmFzZUF4ZXNEYXRhO1xuICAgICAgICBheGVzRGF0YVtjaGFydFR5cGVzWzFdXSA9IHtcbiAgICAgICAgICAgIHlBeGlzOiB5ckF4aXNEYXRhIHx8IHlBeGlzRGF0YVxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBheGVzRGF0YTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBvcmRlciBpbmZvIGFib3VuZCBjaGFydCB0eXBlLlxuICAgICAqIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGNoYXJ0VHlwZXMgY2hhcnQgdHlwZXNcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBjaGFydCBvcmRlciBpbmZvXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUNoYXJ0VHlwZU9yZGVySW5mbzogZnVuY3Rpb24oY2hhcnRUeXBlcykge1xuICAgICAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KGNoYXJ0VHlwZXMsIGZ1bmN0aW9uKGNoYXJ0VHlwZSwgaW5kZXgpIHtcbiAgICAgICAgICAgIHJlc3VsdFtjaGFydFR5cGVdID0gaW5kZXg7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIG9wdGlvbnMgbWFwXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGNoYXJ0VHlwZXMgY2hhcnQgdHlwZXNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9yZGVySW5mbyBjaGFydCBvcmRlclxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IG9wdGlvbnMgbWFwXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZU9wdGlvbnNNYXA6IGZ1bmN0aW9uKGNoYXJ0VHlwZXMsIG9wdGlvbnMsIG9yZGVySW5mbykge1xuICAgICAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KGNoYXJ0VHlwZXMsIGZ1bmN0aW9uKGNoYXJ0VHlwZSkge1xuICAgICAgICAgICAgdmFyIGNoYXJ0T3B0aW9ucyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob3B0aW9ucykpLFxuICAgICAgICAgICAgICAgIGluZGV4ID0gb3JkZXJJbmZvW2NoYXJ0VHlwZV07XG5cbiAgICAgICAgICAgIGlmIChjaGFydE9wdGlvbnMueUF4aXMgJiYgY2hhcnRPcHRpb25zLnlBeGlzW2luZGV4XSkge1xuICAgICAgICAgICAgICAgIGNoYXJ0T3B0aW9ucy55QXhpcyA9IGNoYXJ0T3B0aW9ucy55QXhpc1tpbmRleF07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChjaGFydE9wdGlvbnMuc2VyaWVzICYmIGNoYXJ0T3B0aW9ucy5zZXJpZXNbY2hhcnRUeXBlXSkge1xuICAgICAgICAgICAgICAgIGNoYXJ0T3B0aW9ucy5zZXJpZXMgPSBjaGFydE9wdGlvbnMuc2VyaWVzW2NoYXJ0VHlwZV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChjaGFydE9wdGlvbnMudG9vbHRpcCAmJiBjaGFydE9wdGlvbnMudG9vbHRpcFtjaGFydFR5cGVdKSB7XG4gICAgICAgICAgICAgICAgY2hhcnRPcHRpb25zLnRvb2x0aXAgPSBjaGFydE9wdGlvbnMudG9vbHRpcFtjaGFydFR5cGVdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2hhcnRPcHRpb25zLmNoYXJ0VHlwZSA9IGNoYXJ0VHlwZTtcbiAgICAgICAgICAgIHJlc3VsdFtjaGFydFR5cGVdID0gY2hhcnRPcHRpb25zO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSB0aGVtZSBtYXBcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY2hhcnRUeXBlcyBjaGFydCB0eXBlc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBjaGFydCB0aGVtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBsZWdlbmRMYWJlbHMgbGVnZW5kIGxhYmVsc1xuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHRoZW1lIG1hcFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VUaGVtZU1hcDogZnVuY3Rpb24oY2hhcnRUeXBlcywgdGhlbWUsIGxlZ2VuZExhYmVscykge1xuICAgICAgICB2YXIgcmVzdWx0ID0ge30sXG4gICAgICAgICAgICBjb2xvckNvdW50ID0gMDtcbiAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkoY2hhcnRUeXBlcywgZnVuY3Rpb24oY2hhcnRUeXBlKSB7XG4gICAgICAgICAgICB2YXIgY2hhcnRUaGVtZSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhlbWUpKSxcbiAgICAgICAgICAgICAgICByZW1vdmVkQ29sb3JzO1xuXG4gICAgICAgICAgICBpZiAoY2hhcnRUaGVtZS55QXhpc1tjaGFydFR5cGVdKSB7XG4gICAgICAgICAgICAgICAgY2hhcnRUaGVtZS55QXhpcyA9IGNoYXJ0VGhlbWUueUF4aXNbY2hhcnRUeXBlXTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWNoYXJ0VGhlbWUueUF4aXMudGl0bGUpIHtcbiAgICAgICAgICAgICAgICBjaGFydFRoZW1lLnlBeGlzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShkZWZhdWx0VGhlbWUueUF4aXMpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGNoYXJ0VGhlbWUuc2VyaWVzW2NoYXJ0VHlwZV0pIHtcbiAgICAgICAgICAgICAgICBjaGFydFRoZW1lLnNlcmllcyA9IGNoYXJ0VGhlbWUuc2VyaWVzW2NoYXJ0VHlwZV07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFjaGFydFRoZW1lLnNlcmllcy5jb2xvcnMpIHtcbiAgICAgICAgICAgICAgICBjaGFydFRoZW1lLnNlcmllcyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZGVmYXVsdFRoZW1lLnNlcmllcykpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZW1vdmVkQ29sb3JzID0gY2hhcnRUaGVtZS5zZXJpZXMuY29sb3JzLnNwbGljZSgwLCBjb2xvckNvdW50KTtcbiAgICAgICAgICAgICAgICBjaGFydFRoZW1lLnNlcmllcy5jb2xvcnMgPSBjaGFydFRoZW1lLnNlcmllcy5jb2xvcnMuY29uY2F0KHJlbW92ZWRDb2xvcnMpO1xuICAgICAgICAgICAgICAgIGNvbG9yQ291bnQgKz0gbGVnZW5kTGFiZWxzW2NoYXJ0VHlwZV0ubGVuZ3RoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0W2NoYXJ0VHlwZV0gPSBjaGFydFRoZW1lO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW5jcmVhc2UgeSBheGlzIHNjYWxlIG1heC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZnJvbURhdGEgZnJvbSB0aWNrIGluZm9cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdG9EYXRhIHRvIHRpY2sgaW5mb1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2luY3JlYXNlWUF4aXNTY2FsZU1heDogZnVuY3Rpb24oZnJvbURhdGEsIHRvRGF0YSkge1xuICAgICAgICB2YXIgZGlmZiA9IGZyb21EYXRhLnRpY2tDb3VudCAtIHRvRGF0YS50aWNrQ291bnQ7XG4gICAgICAgIHRvRGF0YS5zY2FsZS5tYXggKz0gdG9EYXRhLnN0ZXAgKiBkaWZmO1xuICAgICAgICB0b0RhdGEubGFiZWxzID0gY2FsY3VsYXRvci5tYWtlTGFiZWxzRnJvbVNjYWxlKHRvRGF0YS5zY2FsZSwgdG9EYXRhLnN0ZXApO1xuICAgICAgICB0b0RhdGEudGlja0NvdW50ID0gZnJvbURhdGEudGlja0NvdW50O1xuICAgICAgICB0b0RhdGEudmFsaWRUaWNrQ291bnQgPSBmcm9tRGF0YS50aWNrQ291bnQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEluc3RhbGwgY2hhcnRzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy51c2VyRGF0YSB1c2VyIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuYmFzZURhdGEgY2hhcnQgYmFzZSBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIGNoYXJ0IHRoZW1lXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqICAgICAgQHBhcmFtIHt7eUF4aXM6IG9iamVjdCwgeEF4aXM6IG9iamVjdH19IHBhcmFtcy5iYXNlQXhlc0RhdGEgYmFzZSBheGVzIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuYXhlc0RhdGEgYXhlcyBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBwYXJhbXMuc2VyaWVzQ2hhcnRUeXBlcyBzZXJpZXMgY2hhcnQgdHlwZXNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IHBhcmFtcy5jaGFydFR5cGVzIGNoYXJ0IHR5cGVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaW5zdGFsbENoYXJ0czogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBjaGFydENsYXNzZXMgPSB7XG4gICAgICAgICAgICAgICAgY29sdW1uOiBDb2x1bW5DaGFydCxcbiAgICAgICAgICAgICAgICBsaW5lOiBMaW5lQ2hhcnRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBiYXNlRGF0YSA9IHBhcmFtcy5iYXNlRGF0YSxcbiAgICAgICAgICAgIGNvbnZlcnREYXRhID0gYmFzZURhdGEuY29udmVydERhdGEsXG4gICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXMgPSBjb252ZXJ0RGF0YS5mb3JtYXR0ZWRWYWx1ZXMsXG4gICAgICAgICAgICBiYXNlQXhlc0RhdGEgPSBwYXJhbXMuYmFzZUF4ZXNEYXRhLFxuICAgICAgICAgICAgY2hhcnRUeXBlcyA9IHBhcmFtcy5jaGFydFR5cGVzLFxuICAgICAgICAgICAgc2VyaWVzQ2hhcnRUeXBlcyA9IHBhcmFtcy5zZXJpZXNDaGFydFR5cGVzLFxuICAgICAgICAgICAgb3JkZXJJbmZvID0gdGhpcy5fbWFrZUNoYXJ0VHlwZU9yZGVySW5mbyhjaGFydFR5cGVzKSxcbiAgICAgICAgICAgIHJlbWFrZU9wdGlvbnMgPSB0aGlzLl9tYWtlT3B0aW9uc01hcChjaGFydFR5cGVzLCBwYXJhbXMub3B0aW9ucywgb3JkZXJJbmZvKSxcbiAgICAgICAgICAgIHJlbWFrZVRoZW1lID0gdGhpcy5fbWFrZVRoZW1lTWFwKHNlcmllc0NoYXJ0VHlwZXMsIHBhcmFtcy50aGVtZSwgY29udmVydERhdGEubGVnZW5kTGFiZWxzKSxcbiAgICAgICAgICAgIHBsb3REYXRhID0ge1xuICAgICAgICAgICAgICAgIHZUaWNrQ291bnQ6IGJhc2VBeGVzRGF0YS55QXhpcy52YWxpZFRpY2tDb3VudCxcbiAgICAgICAgICAgICAgICBoVGlja0NvdW50OiBiYXNlQXhlc0RhdGEueEF4aXMudmFsaWRUaWNrQ291bnRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBqb2luTGVnZW5kTGFiZWxzID0gY29udmVydERhdGEuam9pbkxlZ2VuZExhYmVscztcblxuICAgICAgICB0aGlzLmNoYXJ0cyA9IG5lLnV0aWwubWFwKHNlcmllc0NoYXJ0VHlwZXMsIGZ1bmN0aW9uKGNoYXJ0VHlwZSkge1xuICAgICAgICAgICAgdmFyIGxlZ2VuZExhYmVscyA9IGNvbnZlcnREYXRhLmxlZ2VuZExhYmVsc1tjaGFydFR5cGVdLFxuICAgICAgICAgICAgICAgIGF4ZXMgPSBwYXJhbXMuYXhlc0RhdGFbY2hhcnRUeXBlXSxcbiAgICAgICAgICAgICAgICBzZW5kT3B0aW9ucyA9IHJlbWFrZU9wdGlvbnNbY2hhcnRUeXBlXSxcbiAgICAgICAgICAgICAgICBzZW5kVGhlbWUgPSByZW1ha2VUaGVtZVtjaGFydFR5cGVdLFxuICAgICAgICAgICAgICAgIHNlbmRCb3VuZHMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGJhc2VEYXRhLmJvdW5kcykpLFxuICAgICAgICAgICAgICAgIGNoYXJ0O1xuXG4gICAgICAgICAgICBpZiAoYXhlcyAmJiBheGVzLnlBeGlzLmlzUG9zaXRpb25SaWdodCkge1xuICAgICAgICAgICAgICAgIHNlbmRCb3VuZHMueUF4aXMgPSBzZW5kQm91bmRzLnlyQXhpcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNoYXJ0ID0gbmV3IGNoYXJ0Q2xhc3Nlc1tjaGFydFR5cGVdKHBhcmFtcy51c2VyRGF0YSwgc2VuZFRoZW1lLCBzZW5kT3B0aW9ucywge1xuICAgICAgICAgICAgICAgIGNvbnZlcnREYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlczogY29udmVydERhdGEudmFsdWVzW2NoYXJ0VHlwZV0sXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsczogY29udmVydERhdGEubGFiZWxzLFxuICAgICAgICAgICAgICAgICAgICBmb3JtYXRGdW5jdGlvbnM6IGNvbnZlcnREYXRhLmZvcm1hdEZ1bmN0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgZm9ybWF0dGVkVmFsdWVzOiBmb3JtYXR0ZWRWYWx1ZXNbY2hhcnRUeXBlXSxcbiAgICAgICAgICAgICAgICAgICAgbGVnZW5kTGFiZWxzOiBsZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICAgICAgICAgIGpvaW5MZWdlbmRMYWJlbHM6IGpvaW5MZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICAgICAgICAgIHBsb3REYXRhOiBwbG90RGF0YVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgYm91bmRzOiBzZW5kQm91bmRzLFxuICAgICAgICAgICAgICAgIGF4ZXM6IGF4ZXMsXG4gICAgICAgICAgICAgICAgcHJlZml4OiBjaGFydFR5cGUgKyAnLSdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcGxvdERhdGEgPSBudWxsO1xuICAgICAgICAgICAgam9pbkxlZ2VuZExhYmVscyA9IG51bGw7XG4gICAgICAgICAgICByZXR1cm4gY2hhcnQ7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgY29tYm8gY2hhcnQuXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSBjb21ibyBjaGFydCBlbGVtZW50XG4gICAgICovXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGVsID0gQ2hhcnRCYXNlLnByb3RvdHlwZS5yZW5kZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgdmFyIHBhcGVyO1xuICAgICAgICBuZS51dGlsLmZvckVhY2hBcnJheSh0aGlzLmNoYXJ0cywgZnVuY3Rpb24oY2hhcnQpIHtcbiAgICAgICAgICAgIGNoYXJ0LnJlbmRlcihlbCwgcGFwZXIpO1xuICAgICAgICAgICAgaWYgKCFwYXBlcikge1xuICAgICAgICAgICAgICAgIHBhcGVyID0gY2hhcnQuZ2V0UGFwZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb21ib0NoYXJ0O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IExpbmUgY2hhcnRcbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIEF4aXNUeXBlQmFzZSA9IHJlcXVpcmUoJy4vYXhpc1R5cGVCYXNlLmpzJyksXG4gICAgY2FsY3VsYXRvciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvY2FsY3VsYXRvci5qcycpLFxuICAgIGF4aXNEYXRhTWFrZXIgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2F4aXNEYXRhTWFrZXIuanMnKSxcbiAgICBTZXJpZXMgPSByZXF1aXJlKCcuLi9zZXJpZXMvbGluZUNoYXJ0U2VyaWVzLmpzJyk7XG5cbnZhciBMaW5lQ2hhcnQgPSBuZS51dGlsLmRlZmluZUNsYXNzKEF4aXNUeXBlQmFzZSwgLyoqIEBsZW5kcyBMaW5lQ2hhcnQucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBMaW5lIGNoYXJ0LlxuICAgICAqICogQGNvbnN0cnVjdHMgTGluZUNoYXJ0XG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXk+fSB1c2VyRGF0YSBjaGFydCBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIGNoYXJ0IHRoZW1lXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBpbml0ZWREYXRhIGluaXRpYWxpemVkIGRhdGEgZnJvbSBjb21ibyBjaGFydFxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKHVzZXJEYXRhLCB0aGVtZSwgb3B0aW9ucywgaW5pdGVkRGF0YSkge1xuICAgICAgICB2YXIgYmFzZURhdGEgPSBpbml0ZWREYXRhIHx8IHRoaXMubWFrZUJhc2VEYXRhKHVzZXJEYXRhLCB0aGVtZSwgb3B0aW9ucywge1xuICAgICAgICAgICAgICAgIGlzVmVydGljYWw6IHRydWUsXG4gICAgICAgICAgICAgICAgaGFzQXhlczogdHJ1ZVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBjb252ZXJ0RGF0YSA9IGJhc2VEYXRhLmNvbnZlcnREYXRhLFxuICAgICAgICAgICAgYm91bmRzID0gYmFzZURhdGEuYm91bmRzLFxuICAgICAgICAgICAgYXhpc0RhdGE7XG5cbiAgICAgICAgdGhpcy5jbGFzc05hbWUgPSAnbmUtbGluZS1jaGFydCc7XG5cbiAgICAgICAgQXhpc1R5cGVCYXNlLmNhbGwodGhpcywgYm91bmRzLCB0aGVtZSwgb3B0aW9ucywgaW5pdGVkRGF0YSk7XG5cbiAgICAgICAgYXhpc0RhdGEgPSB0aGlzLl9tYWtlQXhlc0RhdGEoY29udmVydERhdGEsIGJvdW5kcywgb3B0aW9ucywgaW5pdGVkRGF0YSk7XG5cbiAgICAgICAgdGhpcy5fYWRkQ29tcG9uZW50cyhjb252ZXJ0RGF0YSwgYXhpc0RhdGEsIG9wdGlvbnMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGF4ZXMgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb252ZXJ0RGF0YSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBib3VuZHMgY2hhcnQgYm91bmRzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBpbml0ZWREYXRhIGluaXRpYWxpemVkIGRhdGEgZnJvbSBjb21ibyBjaGFydFxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IGF4ZXMgZGF0YVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VBeGVzRGF0YTogZnVuY3Rpb24oY29udmVydERhdGEsIGJvdW5kcywgb3B0aW9ucywgaW5pdGVkRGF0YSkge1xuICAgICAgICB2YXIgYXhlc0RhdGEgPSB7fTtcbiAgICAgICAgaWYgKGluaXRlZERhdGEpIHtcbiAgICAgICAgICAgIGF4ZXNEYXRhID0gaW5pdGVkRGF0YS5heGVzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXhlc0RhdGEgPSB7XG4gICAgICAgICAgICAgICAgeUF4aXM6IGF4aXNEYXRhTWFrZXIubWFrZVZhbHVlQXhpc0RhdGEoe1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZXM6IGNvbnZlcnREYXRhLnZhbHVlcyxcbiAgICAgICAgICAgICAgICAgICAgc2VyaWVzRGltZW5zaW9uOiBib3VuZHMuc2VyaWVzLmRpbWVuc2lvbixcbiAgICAgICAgICAgICAgICAgICAgc3RhY2tlZDogb3B0aW9ucy5zZXJpZXMgJiYgb3B0aW9ucy5zZXJpZXMuc3RhY2tlZCB8fCAnJyxcbiAgICAgICAgICAgICAgICAgICAgY2hhcnRUeXBlOiBvcHRpb25zLmNoYXJ0VHlwZSxcbiAgICAgICAgICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zOiBjb252ZXJ0RGF0YS5mb3JtYXRGdW5jdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IG9wdGlvbnMueEF4aXMsXG4gICAgICAgICAgICAgICAgICAgIGlzVmVydGljYWw6IHRydWVcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICB4QXhpczogYXhpc0RhdGFNYWtlci5tYWtlTGFiZWxBeGlzRGF0YSh7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsczogY29udmVydERhdGEubGFiZWxzXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGF4ZXNEYXRhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgY29tcG9uZW50c1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb252ZXJ0RGF0YSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBheGVzRGF0YSBheGVzIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYWRkQ29tcG9uZW50czogZnVuY3Rpb24oY29udmVydERhdGEsIGF4ZXNEYXRhLCBvcHRpb25zKSB7XG4gICAgICAgIHRoaXMuYWRkQXhpc0NvbXBvbmVudHMoe1xuICAgICAgICAgICAgY29udmVydERhdGE6IGNvbnZlcnREYXRhLFxuICAgICAgICAgICAgYXhlczogYXhlc0RhdGEsXG4gICAgICAgICAgICBwbG90RGF0YTogIW5lLnV0aWwuaXNVbmRlZmluZWQoY29udmVydERhdGEucGxvdERhdGEpID8gY29udmVydERhdGEucGxvdERhdGEgOiB7XG4gICAgICAgICAgICAgICAgdlRpY2tDb3VudDogYXhlc0RhdGEueUF4aXMudmFsaWRUaWNrQ291bnQsXG4gICAgICAgICAgICAgICAgaFRpY2tDb3VudDogYXhlc0RhdGEueEF4aXMudmFsaWRUaWNrQ291bnRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjaGFydFR5cGU6IG9wdGlvbnMuY2hhcnRUeXBlXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KCdzZXJpZXMnLCBTZXJpZXMsIHtcbiAgICAgICAgICAgIGxpYlR5cGU6IG9wdGlvbnMubGliVHlwZSxcbiAgICAgICAgICAgIGNoYXJ0VHlwZTogb3B0aW9ucy5jaGFydFR5cGUsXG4gICAgICAgICAgICB0b29sdGlwUHJlZml4OiB0aGlzLnRvb2x0aXBQcmVmaXgsXG4gICAgICAgICAgICBpc1BvaW50UG9zaXRpb246IHRydWUsXG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgdmFsdWVzOiBjYWxjdWxhdG9yLmFycmF5UGl2b3QoY29udmVydERhdGEudmFsdWVzKSxcbiAgICAgICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXM6IGNhbGN1bGF0b3IuYXJyYXlQaXZvdChjb252ZXJ0RGF0YS5mb3JtYXR0ZWRWYWx1ZXMpLFxuICAgICAgICAgICAgICAgIHNjYWxlOiBheGVzRGF0YS55QXhpcy5zY2FsZVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBMaW5lQ2hhcnQ7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgUGllIGNoYXJ0LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ2hhcnRCYXNlID0gcmVxdWlyZSgnLi9jaGFydEJhc2UuanMnKSxcbiAgICBMZWdlbmQgPSByZXF1aXJlKCcuLi9sZWdlbmRzL2xlZ2VuZC5qcycpLFxuICAgIFRvb2x0aXAgPSByZXF1aXJlKCcuLi90b29sdGlwcy90b29sdGlwLmpzJyksXG4gICAgU2VyaWVzID0gcmVxdWlyZSgnLi4vc2VyaWVzL3BpZUNoYXJ0U2VyaWVzLmpzJyk7XG5cbnZhciBQaWVDaGFydCA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoQ2hhcnRCYXNlLCAvKiogQGxlbmRzIFBpZUNoYXJ0LnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogQ29sdW1uIGNoYXJ0LlxuICAgICAqIEBjb25zdHJ1Y3RzIFBpZUNoYXJ0XG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXk+fSB1c2VyRGF0YSBjaGFydCBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIGNoYXJ0IHRoZW1lXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBpbml0ZWREYXRhIGluaXRpYWxpemVkIGRhdGEgZnJvbSBjb21ibyBjaGFydFxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKHVzZXJEYXRhLCB0aGVtZSwgb3B0aW9ucywgaW5pdGVkRGF0YSkge1xuICAgICAgICB2YXIgYmFzZURhdGEgPSBpbml0ZWREYXRhIHx8IHRoaXMubWFrZUJhc2VEYXRhKHVzZXJEYXRhLCB0aGVtZSwgb3B0aW9ucyksXG4gICAgICAgICAgICBjb252ZXJ0RGF0YSA9IGJhc2VEYXRhLmNvbnZlcnREYXRhLFxuICAgICAgICAgICAgYm91bmRzID0gYmFzZURhdGEuYm91bmRzO1xuXG4gICAgICAgIHRoaXMuY2xhc3NOYW1lID0gJ25lLXBpZS1jaGFydCc7XG5cbiAgICAgICAgb3B0aW9ucy50b29sdGlwID0gb3B0aW9ucy50b29sdGlwIHx8IHt9O1xuXG4gICAgICAgIGlmICghb3B0aW9ucy50b29sdGlwLnBvc2l0aW9uKSB7XG4gICAgICAgICAgICBvcHRpb25zLnRvb2x0aXAucG9zaXRpb24gPSAnY2VudGVyIG1pZGRsZSc7XG4gICAgICAgIH1cblxuICAgICAgICBDaGFydEJhc2UuY2FsbCh0aGlzLCBib3VuZHMsIHRoZW1lLCBvcHRpb25zLCBpbml0ZWREYXRhKTtcblxuICAgICAgICB0aGlzLl9hZGRDb21wb25lbnRzKGNvbnZlcnREYXRhLCB0aGVtZS5jaGFydC5iYWNrZ3JvdW5kLCBvcHRpb25zKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIGNvbXBvbmVudHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udmVydERhdGEgY29udmVydGVkIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY2hhcnRCYWNrZ3JvdW5kIGNoYXJ0IOOFoGFja2dyb3VuZFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hZGRDb21wb25lbnRzOiBmdW5jdGlvbihjb252ZXJ0RGF0YSwgY2hhcnRCYWNrZ3JvdW5kLCBvcHRpb25zKSB7XG4gICAgICAgIGlmIChjb252ZXJ0RGF0YS5qb2luTGVnZW5kTGFiZWxzKSB7XG4gICAgICAgICAgICB0aGlzLmFkZENvbXBvbmVudCgnbGVnZW5kJywgTGVnZW5kLCB7XG4gICAgICAgICAgICAgICAgam9pbkxlZ2VuZExhYmVsczogY29udmVydERhdGEuam9pbkxlZ2VuZExhYmVscyxcbiAgICAgICAgICAgICAgICBsZWdlbmRMYWJlbHM6IGNvbnZlcnREYXRhLmxlZ2VuZExhYmVscyxcbiAgICAgICAgICAgICAgICBjaGFydFR5cGU6IG9wdGlvbnMuY2hhcnRUeXBlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KCd0b29sdGlwJywgVG9vbHRpcCwge1xuICAgICAgICAgICAgdmFsdWVzOiBjb252ZXJ0RGF0YS5mb3JtYXR0ZWRWYWx1ZXMsXG4gICAgICAgICAgICBsYWJlbHM6IGNvbnZlcnREYXRhLmxhYmVscyxcbiAgICAgICAgICAgIGxlZ2VuZExhYmVsczogY29udmVydERhdGEubGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgcHJlZml4OiB0aGlzLnRvb2x0aXBQcmVmaXhcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5hZGRDb21wb25lbnQoJ3NlcmllcycsIFNlcmllcywge1xuICAgICAgICAgICAgbGliVHlwZTogb3B0aW9ucy5saWJUeXBlLFxuICAgICAgICAgICAgY2hhcnRUeXBlOiBvcHRpb25zLmNoYXJ0VHlwZSxcbiAgICAgICAgICAgIHRvb2x0aXBQcmVmaXg6IHRoaXMudG9vbHRpcFByZWZpeCxcbiAgICAgICAgICAgIGlzUG9pbnRQb3NpdGlvbjogdHJ1ZSxcbiAgICAgICAgICAgIGNoYXJ0QmFja2dyb3VuZDogY2hhcnRCYWNrZ3JvdW5kLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIHZhbHVlczogY29udmVydERhdGEudmFsdWVzLFxuICAgICAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlczogY29udmVydERhdGEuZm9ybWF0dGVkVmFsdWVzXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBpZUNoYXJ0O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIG5lLnV0aWzsl5AgcmFuZ2XqsIAg7LaU6rCA65CY6riwIOyghOq5jOyngCDsnoTsi5zroZwg7IKs7JqpXG4gKiBAcGFyYW0ge251bWJlcn0gc3RhcnQgc3RhcnRcbiAqIEBwYXJhbSB7bnVtYmVyfSBzdG9wIHN0b3BcbiAqIEBwYXJhbSB7bnVtYmVyfSBzdGVwIHN0ZXBcbiAqIEByZXR1cm5zIHthcnJheS48bnVtYmVyPn0gcmVzdWx0IGFycmF5XG4gKi9cbnZhciByYW5nZSA9IGZ1bmN0aW9uKHN0YXJ0LCBzdG9wLCBzdGVwKSB7XG4gICAgdmFyIGFyciA9IFtdLFxuICAgICAgICBmbGFnO1xuXG4gICAgaWYgKG5lLnV0aWwuaXNVbmRlZmluZWQoc3RvcCkpIHtcbiAgICAgICAgc3RvcCA9IHN0YXJ0IHx8IDA7XG4gICAgICAgIHN0YXJ0ID0gMDtcbiAgICB9XG5cbiAgICBzdGVwID0gc3RlcCB8fCAxO1xuICAgIGZsYWcgPSBzdGVwIDwgMCA/IC0xIDogMTtcbiAgICBzdG9wICo9IGZsYWc7XG5cbiAgICB3aGlsZSAoc3RhcnQgKiBmbGFnIDwgc3RvcCkge1xuICAgICAgICBhcnIucHVzaChzdGFydCk7XG4gICAgICAgIHN0YXJ0ICs9IHN0ZXA7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFycjtcbn07XG5cbi8qKlxuICogKiBuZS51dGls7JeQIHBsdWNr7J20IOy2lOqwgOuQmOq4sCDsoITquYzsp4Ag7J6E7Iuc66GcIOyCrOyaqVxuICogQHBhcmFtIHthcnJheX0gYXJyIGFycmF5XG4gKiBAcGFyYW0ge3N0cmluZ30gcHJvcGVydHkgcHJvcGVydHlcbiAqIEByZXR1cm5zIHthcnJheX0gcmVzdWx0IGFycmF5XG4gKi9cbnZhciBwbHVjayA9IGZ1bmN0aW9uKGFyciwgcHJvcGVydHkpIHtcbiAgICB2YXIgcmVzdWx0ID0gbmUudXRpbC5tYXAoYXJyLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIHJldHVybiBpdGVtW3Byb3BlcnR5XTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiAqIG5lLnV0aWzsl5Agemlw7J20IOy2lOqwgOuQmOq4sCDsoITquYzsp4Ag7J6E7Iuc66GcIOyCrOyaqVxuICogQHBhcmFtcyB7Li4uYXJyYXl9IGFycmF5XG4gKiBAcmV0dXJucyB7YXJyYXl9IHJlc3VsdCBhcnJheVxuICovXG52YXIgemlwID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFycjIgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpLFxuICAgICAgICByZXN1bHQgPSBbXTtcblxuICAgIG5lLnV0aWwuZm9yRWFjaChhcnIyLCBmdW5jdGlvbihhcnIpIHtcbiAgICAgICAgbmUudXRpbC5mb3JFYWNoKGFyciwgZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgICBpZiAoIXJlc3VsdFtpbmRleF0pIHtcbiAgICAgICAgICAgICAgICByZXN1bHRbaW5kZXhdID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXN1bHRbaW5kZXhdLnB1c2godmFsdWUpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIFBpY2sgbWluaW11bSB2YWx1ZSBmcm9tIHZhbHVlIGFycmF5LlxuICogQHBhcmFtIHthcnJheX0gYXJyIHZhbHVlIGFycmF5XG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjb25kaXRpb24gY29uZGl0aW9uIGZ1bmN0aW9uXG4gKiBAcGFyYW0ge29iamVjdH0gY29udGV4dCB0YXJnZXQgY29udGV4dFxuICogQHJldHVybnMgeyp9IG1pbmltdW0gdmFsdWVcbiAqL1xudmFyIG1pbiA9IGZ1bmN0aW9uKGFyciwgY29uZGl0aW9uLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdCwgbWluVmFsdWUsIHJlc3Q7XG4gICAgaWYgKCFjb25kaXRpb24pIHtcbiAgICAgICAgY29uZGl0aW9uID0gZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgIH07XG4gICAgfVxuICAgIHJlc3VsdCA9IGFyclswXTtcbiAgICBtaW5WYWx1ZSA9IGNvbmRpdGlvbi5jYWxsKGNvbnRleHQsIHJlc3VsdCk7XG4gICAgcmVzdCA9IGFyci5zbGljZSgxKTtcbiAgICBuZS51dGlsLmZvckVhY2hBcnJheShyZXN0LCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIHZhciBjb21wYXJlVmFsdWUgPSBjb25kaXRpb24uY2FsbChjb250ZXh0LCBpdGVtKTtcbiAgICAgICAgaWYgKGNvbXBhcmVWYWx1ZSA8IG1pblZhbHVlKSB7XG4gICAgICAgICAgICBtaW5WYWx1ZSA9IGNvbXBhcmVWYWx1ZTtcbiAgICAgICAgICAgIHJlc3VsdCA9IGl0ZW07XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBQaWNrIG1heGltdW0gdmFsdWUgZnJvbSB2YWx1ZSBhcnJheS5cbiAqIEBwYXJhbSB7YXJyYXl9IGFyciB2YWx1ZSBhcnJheVxuICogQHBhcmFtIHtmdW5jdGlvbn0gY29uZGl0aW9uIGNvbmRpdGlvbiBmdW5jdGlvblxuICogQHBhcmFtIHtvYmplY3R9IGNvbnRleHQgdGFyZ2V0IGNvbnRleHRcbiAqIEByZXR1cm5zIHsqfSBtYXhpbXVtIHZhbHVlXG4gKi9cbnZhciBtYXggPSBmdW5jdGlvbihhcnIsIGNvbmRpdGlvbiwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHQsIG1heFZhbHVlLCByZXN0O1xuICAgIGlmICghY29uZGl0aW9uKSB7XG4gICAgICAgIGNvbmRpdGlvbiA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICB9O1xuICAgIH1cbiAgICByZXN1bHQgPSBhcnJbMF07XG4gICAgbWF4VmFsdWUgPSBjb25kaXRpb24uY2FsbChjb250ZXh0LCByZXN1bHQpO1xuICAgIHJlc3QgPSBhcnIuc2xpY2UoMSk7XG4gICAgbmUudXRpbC5mb3JFYWNoQXJyYXkocmVzdCwgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICB2YXIgY29tcGFyZVZhbHVlID0gY29uZGl0aW9uLmNhbGwoY29udGV4dCwgaXRlbSk7XG4gICAgICAgIGlmIChjb21wYXJlVmFsdWUgPiBtYXhWYWx1ZSkge1xuICAgICAgICAgICAgbWF4VmFsdWUgPSBjb21wYXJlVmFsdWU7XG4gICAgICAgICAgICByZXN1bHQgPSBpdGVtO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogV2hldGhlciBvbmUgb2YgdGhlbSBpcyB0cnVlIG9yIG5vdC5cbiAqIEBwYXJhbSB7YXJyYXl9IGFyciB0YXJnZXQgYXJyYXlcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNvbmRpdGlvbiBjb25kaXRpb24gZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtib29sZWFufSByZXN1bHQgYm9vbGVhblxuICovXG52YXIgYW55ID0gZnVuY3Rpb24oYXJyLCBjb25kaXRpb24pIHtcbiAgICB2YXIgcmVzdWx0ID0gZmFsc2U7XG4gICAgbmUudXRpbC5mb3JFYWNoQXJyYXkoYXJyLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIGlmIChjb25kaXRpb24oaXRlbSkpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBHZXQgYWZ0ZXIgcG9pbnQgbGVuZ3RoLlxuICogQHBhcmFtIHtzdHJpbmcgfCBudW1iZXJ9IHZhbHVlIHRhcmdldCB2YWx1ZVxuICogQHJldHVybnMge251bWJlcn0gcmVzdWx0IGxlbmd0aFxuICovXG52YXIgbGVuZ3RoQWZ0ZXJQb2ludCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgdmFyIHZhbHVlQXJyID0gKHZhbHVlICsgJycpLnNwbGl0KCcuJyk7XG4gICAgcmV0dXJuIHZhbHVlQXJyLmxlbmd0aCA9PT0gMiA/IHZhbHVlQXJyWzFdLmxlbmd0aCA6IDA7XG59O1xuXG4vKipcbiAqIEZpbmQgbXVsdGlwbGUgbnVtLlxuICogQHBhcmFtIHsuLi5hcnJheX0gdGFyZ2V0IHZhbHVlc1xuICogQHJldHVybnMge251bWJlcn0gbXVsdGlwbGUgbnVtXG4gKi9cbnZhciBmaW5kTXVsdGlwbGVOdW0gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKSxcbiAgICAgICAgdW5kZXJQb2ludExlbnMgPSBuZS51dGlsLm1hcChhcmdzLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwubGVuZ3RoQWZ0ZXJQb2ludCh2YWx1ZSk7XG4gICAgICAgIH0pLFxuICAgICAgICB1bmRlclBvaW50TGVuID0gbmUudXRpbC5tYXgodW5kZXJQb2ludExlbnMpLFxuICAgICAgICBtdWx0aXBsZU51bSA9IE1hdGgucG93KDEwLCB1bmRlclBvaW50TGVuKTtcbiAgICByZXR1cm4gbXVsdGlwbGVOdW07XG59O1xuXG4vKipcbiAqIE1vZHVsbyBvcGVyYXRpb24gZm9yIGZsb2F0aW5nIHBvaW50IG9wZXJhdGlvbi5cbiAqIEBwYXJhbSB7bnVtYmVyfSB0YXJnZXQgdGFyZ2V0IHZhbHVlc1xuICogQHBhcmFtIHtudW1iZXJ9IG1vZE51bSBtb2QgbnVtXG4gKiBAcmV0dXJucyB7bnVtYmVyfSByZXN1bHQgbW9kXG4gKi9cbnZhciBtb2QgPSBmdW5jdGlvbih0YXJnZXQsIG1vZE51bSkge1xuICAgIHZhciBtdWx0aXBsZU51bSA9IG5lLnV0aWwuZmluZE11bHRpcGxlTnVtKG1vZE51bSk7XG4gICAgcmV0dXJuICgodGFyZ2V0ICogbXVsdGlwbGVOdW0pICUgKG1vZE51bSAqIG11bHRpcGxlTnVtKSkgLyBtdWx0aXBsZU51bTtcbn07XG5cbi8qKlxuICogQWRkaXRpb24gZm9yIGZsb2F0aW5nIHBvaW50IG9wZXJhdGlvbi5cbiAqIEBwYXJhbSB7bnVtYmVyfSBhIHRhcmdldCBhXG4gKiBAcGFyYW0ge251bWJlcn0gYiB0YXJnZXQgYlxuICogQHJldHVybnMge251bWJlcn0gYWRkaXRpb24gcmVzdWx0XG4gKi9cbnZhciBhZGRpdGlvbiA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICB2YXIgbXVsdGlwbGVOdW0gPSBmaW5kTXVsdGlwbGVOdW0oYSwgYik7XG4gICAgcmV0dXJuICgoYSAqIG11bHRpcGxlTnVtKSArIChiICogbXVsdGlwbGVOdW0pKSAvIG11bHRpcGxlTnVtO1xufTtcblxuLyoqXG4gKiBTdWJ0cmFjdGlvbiBmb3IgZmxvYXRpbmcgcG9pbnQgb3BlcmF0aW9uLlxuICogQHBhcmFtIHtudW1iZXJ9IGEgdGFyZ2V0IGFcbiAqIEBwYXJhbSB7bnVtYmVyfSBiIHRhcmdldCBiXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBzdWJ0cmFjdGlvbiByZXN1bHRcbiAqL1xudmFyIHN1YnRyYWN0aW9uID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHZhciBtdWx0aXBsZU51bSA9IGZpbmRNdWx0aXBsZU51bShhLCBiKTtcbiAgICByZXR1cm4gKChhICogbXVsdGlwbGVOdW0pIC0gKGIgKiBtdWx0aXBsZU51bSkpIC8gbXVsdGlwbGVOdW07XG59O1xuXG4vKipcbiAqIE11bHRpcGxpY2F0aW9uIGZvciBmbG9hdGluZyBwb2ludCBvcGVyYXRpb24uXG4gKiBAcGFyYW0ge251bWJlcn0gYSB0YXJnZXQgYVxuICogQHBhcmFtIHtudW1iZXJ9IGIgdGFyZ2V0IGJcbiAqIEByZXR1cm5zIHtudW1iZXJ9IG11bHRpcGxpY2F0aW9uIHJlc3VsdFxuICovXG52YXIgbXVsdGlwbGljYXRpb24gPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgdmFyIG11bHRpcGxlTnVtID0gZmluZE11bHRpcGxlTnVtKGEsIGIpO1xuICAgIHJldHVybiAoKGEgKiBtdWx0aXBsZU51bSkgKiAoYiAqIG11bHRpcGxlTnVtKSkgLyAobXVsdGlwbGVOdW0gKiBtdWx0aXBsZU51bSk7XG59O1xuXG4vKipcbiAqIERpdmlzaW9uIGZvciBmbG9hdGluZyBwb2ludCBvcGVyYXRpb24uXG4gKiBAcGFyYW0ge251bWJlcn0gYSB0YXJnZXQgYVxuICogQHBhcmFtIHtudW1iZXJ9IGIgdGFyZ2V0IGJcbiAqIEByZXR1cm5zIHtudW1iZXJ9IGRpdmlzaW9uIHJlc3VsdFxuICovXG52YXIgZGl2aXNpb24gPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgdmFyIG11bHRpcGxlTnVtID0gZmluZE11bHRpcGxlTnVtKGEsIGIpO1xuICAgIHJldHVybiAoYSAqIG11bHRpcGxlTnVtKSAvIChiICogbXVsdGlwbGVOdW0pO1xufTtcblxuLyoqXG4gKiBTdW0uXG4gKiBAcGFyYW0ge2FycmF5LjxudW1iZXI+fSB2YWx1ZXMgdGFyZ2V0IHZhbHVlc1xuICogQHJldHVybnMge251bWJlcn0gcmVzdWx0IHZhbHVlXG4gKi9cbnZhciBzdW0gPSBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICB2YXIgY29weUFyciA9IHZhbHVlcy5zbGljZSgpO1xuICAgIGNvcHlBcnIudW5zaGlmdCgwKTtcbiAgICByZXR1cm4gbmUudXRpbC5yZWR1Y2UoY29weUFyciwgZnVuY3Rpb24oYmFzZSwgYWRkKSB7XG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KGJhc2UpICsgcGFyc2VGbG9hdChhZGQpO1xuICAgIH0pO1xufTtcblxubmUudXRpbC5yYW5nZSA9IHJhbmdlO1xubmUudXRpbC5wbHVjayA9IHBsdWNrO1xubmUudXRpbC56aXAgPSB6aXA7XG5uZS51dGlsLm1pbiA9IG1pbjtcbm5lLnV0aWwubWF4ID0gbWF4O1xubmUudXRpbC5hbnkgPSBhbnk7XG5uZS51dGlsLmxlbmd0aEFmdGVyUG9pbnQgPSBsZW5ndGhBZnRlclBvaW50O1xubmUudXRpbC5tb2QgPSBtb2Q7XG5uZS51dGlsLmZpbmRNdWx0aXBsZU51bSA9IGZpbmRNdWx0aXBsZU51bTtcbm5lLnV0aWwuYWRkaXRpb24gPSBhZGRpdGlvbjtcbm5lLnV0aWwuc3VidHJhY3Rpb24gPSBzdWJ0cmFjdGlvbjtcbm5lLnV0aWwubXVsdGlwbGljYXRpb24gPSBtdWx0aXBsaWNhdGlvbjtcbm5lLnV0aWwuZGl2aXNpb24gPSBkaXZpc2lvbjtcbm5lLnV0aWwuc3VtID0gc3VtO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IGNoYXJ0IGNvbnN0XG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBDSEFSVF9ERUZBVUxUX1dJRFRIOiA1MDAsXG4gICAgQ0hBUlRfREVGQVVMVF9IRUlHSFQ6IDQwMCxcbiAgICBISURERU5fV0lEVEg6IDEsXG4gICAgREVGQVVMVF9USVRMRV9GT05UX1NJWkU6IDE0LFxuICAgIERFRkFVTFRfQVhJU19USVRMRV9GT05UX1NJWkU6IDEwLFxuICAgIERFRkFVTFRfTEFCRUxfRk9OVF9TSVpFOiAxMixcbiAgICBERUZBVUxUX1BMVUdJTjogJ3JhcGhhZWwnLFxuICAgIERFRkFVTFRfVElDS19DT0xPUjogJ2JsYWNrJyxcbiAgICBERUZBVUxUX1RIRU1FX05BTUU6ICdkZWZhdWx0JyxcbiAgICBTVEFDS0VEX05PUk1BTF9UWVBFOiAnbm9ybWFsJyxcbiAgICBTVEFDS0VEX1BFUkNFTlRfVFlQRTogJ3BlcmNlbnQnLFxuICAgIENIQVJUX1RZUEVfQkFSOiAnYmFyJyxcbiAgICBDSEFSVF9UWVBFX0NPTFVNTjogJ2NvbHVtbicsXG4gICAgQ0hBUlRfVFlQRV9MSU5FOiAnbGluZScsXG4gICAgQ0hBUlRfVFlQRV9DT01CTzogJ2NvbWJvJyxcbiAgICBDSEFSVF9UWVBFX1BJRTogJ3BpZScsXG4gICAgWUFYSVNfUFJPUFM6IFsndGlja0NvbG9yJywgJ3RpdGxlJywgJ2xhYmVsJ10sXG4gICAgU0VSSUVTX1BST1BTOiBbJ2NvbG9ycycsICdib3JkZXJDb2xvcicsICdzaW5nbGVDb2xvcnMnXVxufTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyAgQ2hhcnQgZmFjdG9yeSBwbGF5IHJvbGUgcmVnaXN0ZXIgY2hhcnQuXG4gKiAgICAgICAgICAgICAgICBBbHNvLCB5b3UgY2FuIGdldCBjaGFydCBmcm9tIHRoaXMgZmFjdG9yeS5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGNoYXJ0cyA9IHt9LFxuICAgIGZhY3RvcnkgPSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgY2hhcnQgaW5zdGFuY2UuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjaGFydFR5cGUgY2hhcnQgdHlwZVxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gZGF0YSBjaGFydCBkYXRhXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgICAgICogQHJldHVybnMge29iamVjdH0gY2hhcnQgaW5zdGFuY2U7XG4gICAgICAgICAqL1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKGNoYXJ0VHlwZSwgZGF0YSwgdGhlbWUsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHZhciBDaGFydCA9IGNoYXJ0c1tjaGFydFR5cGVdLFxuICAgICAgICAgICAgICAgIGNoYXJ0O1xuXG4gICAgICAgICAgICBpZiAoIUNoYXJ0KSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgZXhpc3QgJyArIGNoYXJ0VHlwZSArICcgY2hhcnQuJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNoYXJ0ID0gbmV3IENoYXJ0KGRhdGEsIHRoZW1lLCBvcHRpb25zKTtcblxuICAgICAgICAgICAgcmV0dXJuIGNoYXJ0O1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZWdpc3RlciBjaGFydC5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNoYXJ0VHlwZSBjaGFyIHR5cGVcbiAgICAgICAgICogQHBhcmFtIHtjbGFzc30gQ2hhcnRDbGFzcyBjaGFydCBjbGFzc1xuICAgICAgICAgKi9cbiAgICAgICAgcmVnaXN0ZXI6IGZ1bmN0aW9uKGNoYXJ0VHlwZSwgQ2hhcnRDbGFzcykge1xuICAgICAgICAgICAgY2hhcnRzW2NoYXJ0VHlwZV0gPSBDaGFydENsYXNzO1xuICAgICAgICB9XG4gICAgfTtcblxubW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3ICBQbHVnaW4gZmFjdG9yeSBwbGF5IHJvbGUgcmVnaXN0ZXIgcmVuZGVyaW5nIHBsdWdpbi5cbiAqICAgICAgICAgICAgICAgIEFsc28sIHlvdSBjYW4gZ2V0IHBsdWdpbiBmcm9tIHRoaXMgZmFjdG9yeS5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHBsdWdpbnMgPSB7fSxcbiAgICBmYWN0b3J5ID0ge1xuICAgICAgICAvKipcbiAgICAgICAgICogR2V0IGdyYXBoIHJlbmRlcmVyLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gbGliVHlwZSB0eXBlIG9mIGdyYXBoIGxpYnJhcnlcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNoYXJ0VHlwZSBjaGFydCB0eXBlXG4gICAgICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHJlbmRlcmVyIGluc3RhbmNlXG4gICAgICAgICAqL1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKGxpYlR5cGUsIGNoYXJ0VHlwZSkge1xuICAgICAgICAgICAgdmFyIHBsdWdpbiA9IHBsdWdpbnNbbGliVHlwZV0sXG4gICAgICAgICAgICAgICAgUmVuZGVyZXIsIHJlbmRlcmVyO1xuXG4gICAgICAgICAgICBpZiAoIXBsdWdpbikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGV4aXN0ICcgKyBsaWJUeXBlICsgJyBwbHVnaW4uJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIFJlbmRlcmVyID0gcGx1Z2luW2NoYXJ0VHlwZV07XG4gICAgICAgICAgICBpZiAoIVJlbmRlcmVyKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgZXhpc3QgJyArIGNoYXJ0VHlwZSArICcgY2hhcnQgcmVuZGVyZXIuJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlbmRlcmVyID0gbmV3IFJlbmRlcmVyKCk7XG5cbiAgICAgICAgICAgIHJldHVybiByZW5kZXJlcjtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFBsdWdpbiByZWdpc3Rlci5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGxpYlR5cGUgdHlwZSBvZiBncmFwaCBsaWJyYXJ5XG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwbHVnaW4gcGx1Z2luIHRvIGNvbnRyb2wgbGlicmFyeVxuICAgICAgICAgKi9cbiAgICAgICAgcmVnaXN0ZXI6IGZ1bmN0aW9uKGxpYlR5cGUsIHBsdWdpbikge1xuICAgICAgICAgICAgcGx1Z2luc1tsaWJUeXBlXSA9IHBsdWdpbjtcbiAgICAgICAgfVxuICAgIH07XG5cbm1vZHVsZS5leHBvcnRzID0gZmFjdG9yeTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyAgVGhlbWUgZmFjdG9yeSBwbGF5IHJvbGUgcmVnaXN0ZXIgdGhlbWUuXG4gKiAgICAgICAgICAgICAgICBBbHNvLCB5b3UgY2FuIGdldCB0aGVtZSBmcm9tIHRoaXMgZmFjdG9yeS5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuLi9jb25zdC5qcycpLFxuICAgIGRlZmF1bHRUaGVtZSA9IHJlcXVpcmUoJy4uL3RoZW1lcy9kZWZhdWx0VGhlbWUuanMnKTtcblxudmFyIHRoZW1lcyA9IHt9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAvKipcbiAgICAgKiBHZXQgdGhlbWUuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRoZW1lTmFtZSB0aGVtZSBuYW1lXG4gICAgICogQHJldHVybnMge29iamVjdH0gdGhlbWUgb2JqZWN0XG4gICAgICovXG4gICAgZ2V0OiBmdW5jdGlvbih0aGVtZU5hbWUpIHtcbiAgICAgICAgdmFyIHRoZW1lID0gdGhlbWVzW3RoZW1lTmFtZV07XG5cbiAgICAgICAgaWYgKCF0aGVtZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgZXhpc3QgJyArIHRoZW1lTmFtZSArICcgdGhlbWUuJyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhlbWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRoZW1lIHJlZ2lzdGVyLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0aGVtZU5hbWUgdGhlbWUgbmFtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSB0aGVtZVxuICAgICAqL1xuICAgIHJlZ2lzdGVyOiBmdW5jdGlvbih0aGVtZU5hbWUsIHRoZW1lKSB7XG4gICAgICAgIHRoZW1lID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGVtZSkpO1xuICAgICAgICBpZiAodGhlbWVOYW1lICE9PSBjaGFydENvbnN0LkRFRkFVTFRfVEhFTUVfTkFNRSkge1xuICAgICAgICAgICAgdGhlbWUgPSB0aGlzLl9pbml0VGhlbWUodGhlbWUpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2luaGVyaXRUaGVtZVByb3BlcnR5KHRoZW1lKTtcbiAgICAgICAgdGhlbWVzW3RoZW1lTmFtZV0gPSB0aGVtZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW5pdCB0aGVtZS5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgdGhlbWVcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSB0aGVtZVxuICAgICAqIEBwcml2YXRlXG4gICAgICogQGlnbm9yZVxuICAgICAqL1xuICAgIF9pbml0VGhlbWU6IGZ1bmN0aW9uKHRoZW1lKSB7XG4gICAgICAgIHZhciBjbG9uZVRoZW1lID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShkZWZhdWx0VGhlbWUpKSxcbiAgICAgICAgICAgIG5ld1RoZW1lO1xuXG4gICAgICAgIHRoaXMuX2NvbmNhdERlZmF1bHRDb2xvcnModGhlbWUsIGNsb25lVGhlbWUuc2VyaWVzLmNvbG9ycylcbiAgICAgICAgbmV3VGhlbWUgPSB0aGlzLl9leHRlbmRUaGVtZSh0aGVtZSwgY2xvbmVUaGVtZSk7XG5cbiAgICAgICAgbmV3VGhlbWUgPSB0aGlzLl9jb3B5UHJvcGVydHkoe1xuICAgICAgICAgICAgcHJvcE5hbWU6ICd5QXhpcycsXG4gICAgICAgICAgICBmcm9tVGhlbWU6IHRoZW1lLFxuICAgICAgICAgICAgdG9UaGVtZTogbmV3VGhlbWUsXG4gICAgICAgICAgICByZWplY3RQcm9wczogY2hhcnRDb25zdC5ZQVhJU19QUk9QU1xuICAgICAgICB9KTtcblxuICAgICAgICBuZXdUaGVtZSA9IHRoaXMuX2NvcHlQcm9wZXJ0eSh7XG4gICAgICAgICAgICBwcm9wTmFtZTogJ3NlcmllcycsXG4gICAgICAgICAgICBmcm9tVGhlbWU6IHRoZW1lLFxuICAgICAgICAgICAgdG9UaGVtZTogbmV3VGhlbWUsXG4gICAgICAgICAgICByZWplY3RQcm9wczogY2hhcnRDb25zdC5TRVJJRVNfUFJPUFNcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBuZXdUaGVtZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmlsdGVyIGNoYXJ0IHR5cGVzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0YXJnZXQgdGFyZ2V0IGNoYXJ0c1xuICAgICAqIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IHJlamVjdFByb3BzIHJlamVjdCBwcm9wZXJ0eVxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IGZpbHRlcmVkIGNoYXJ0cy5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9maWx0ZXJDaGFydFR5cGVzOiBmdW5jdGlvbih0YXJnZXQsIHJlamVjdFByb3BzKSB7XG4gICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cblxuICAgICAgICByZXN1bHQgPSBuZS51dGlsLmZpbHRlcih0YXJnZXQsIGZ1bmN0aW9uKGl0ZW0sIG5hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBuZS51dGlsLmluQXJyYXkobmFtZSwgcmVqZWN0UHJvcHMpID09PSAtMTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvbmNhdCBjb2xvcnMuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIHRoZW1lXG4gICAgICogQHBhcmFtIHthcnJheS48c3RyaW5nPn0gc2VyaWVzQ29sb3JzIHNlcmllcyBjb2xvcnNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jb25jYXRDb2xvcnM6IGZ1bmN0aW9uKHRoZW1lLCBzZXJpZXNDb2xvcnMpIHtcbiAgICAgICAgaWYgKHRoZW1lLmNvbG9ycykge1xuICAgICAgICAgICAgdGhlbWUuY29sb3JzID0gdGhlbWUuY29sb3JzLmNvbmNhdChzZXJpZXNDb2xvcnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoZW1lLnNpbmdsZUNvbG9ycykge1xuICAgICAgICAgICAgdGhlbWUuc2luZ2xlQ29sb3JzID0gdGhlbWUuc2luZ2xlQ29sb3JzLmNvbmNhdChzZXJpZXNDb2xvcnMpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvbmNhdCBkZWZhdWx0IGNvbG9ycy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgdGhlbWVcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBzZXJpZXNDb2xvcnMgc2VyaWVzIGNvbG9yc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NvbmNhdERlZmF1bHRDb2xvcnM6IGZ1bmN0aW9uKHRoZW1lLCBzZXJpZXNDb2xvcnMpIHtcbiAgICAgICAgdmFyIGNoYXJ0VHlwZXM7XG5cbiAgICAgICAgaWYgKCF0aGVtZS5zZXJpZXMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNoYXJ0VHlwZXMgPSB0aGlzLl9maWx0ZXJDaGFydFR5cGVzKHRoZW1lLnNlcmllcywgY2hhcnRDb25zdC5TRVJJRVNfUFJPUFMpO1xuXG4gICAgICAgIGlmICghbmUudXRpbC5rZXlzKGNoYXJ0VHlwZXMpLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5fY29uY2F0Q29sb3JzKHRoZW1lLnNlcmllcywgc2VyaWVzQ29sb3JzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5lLnV0aWwuZm9yRWFjaChjaGFydFR5cGVzLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY29uY2F0Q29sb3JzKGl0ZW0sIHNlcmllc0NvbG9ycyk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFeHRlbmQgdGhlbWVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZnJvbSBmcm9tIHRoZW1lIHByb3BlcnR5XG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRvIHRvIHRoZW1lIHByb3BlcnR5XG4gICAgICogQHJldHVybnMge29iamVjdH0gcmVzdWx0IHByb3BlcnR5XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZXh0ZW5kVGhlbWU6IGZ1bmN0aW9uKGZyb20sIHRvKSB7XG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaCh0bywgZnVuY3Rpb24oaXRlbSwga2V5KSB7XG4gICAgICAgICAgICB2YXIgZnJvbUl0ZW0gPSBmcm9tW2tleV07XG4gICAgICAgICAgICBpZiAoIWZyb21JdGVtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobmUudXRpbC5pc0FycmF5KGZyb21JdGVtKSkge1xuICAgICAgICAgICAgICAgIHRvW2tleV0gPSBmcm9tSXRlbS5zbGljZSgpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChuZS51dGlsLmlzT2JqZWN0KGZyb21JdGVtKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2V4dGVuZFRoZW1lKGZyb21JdGVtLCBpdGVtKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdG9ba2V5XSA9IGZyb21JdGVtO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICByZXR1cm4gdG87XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvcHkgcHJvcGVydHkuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLnByb3BOYW1lIHByb3BlcnR5IG5hbWVcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuZnJvbVRoZW1lIGZyb20gcHJvcGVydHlcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudG9UaGVtZSB0cCBwcm9wZXJ0eVxuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48c3RyaW5nPn0gcGFyYW1zLnJlamVjdFByb3BzIHJlamVjdCBwcm9wZXJ0eSBuYW1lXG4gICAgICogQHJldHVybnMge29iamVjdH0gY29waWVkIHByb3BlcnR5XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY29weVByb3BlcnR5OiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGNoYXJ0VHlwZXM7XG5cbiAgICAgICAgaWYgKCFwYXJhbXMudG9UaGVtZVtwYXJhbXMucHJvcE5hbWVdKSB7XG4gICAgICAgICAgICByZXR1cm4gcGFyYW1zLnRvVGhlbWU7XG4gICAgICAgIH1cblxuICAgICAgICBjaGFydFR5cGVzID0gdGhpcy5fZmlsdGVyQ2hhcnRUeXBlcyhwYXJhbXMuZnJvbVRoZW1lW3BhcmFtcy5wcm9wTmFtZV0sIHBhcmFtcy5yZWplY3RQcm9wcyk7XG4gICAgICAgIGlmIChuZS51dGlsLmtleXMoY2hhcnRUeXBlcykubGVuZ3RoKSB7XG4gICAgICAgICAgICBuZS51dGlsLmZvckVhY2goY2hhcnRUeXBlcywgZnVuY3Rpb24oaXRlbSwga2V5KSB7XG4gICAgICAgICAgICAgICAgdmFyIGNsb25lVGhlbWUgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGRlZmF1bHRUaGVtZVtwYXJhbXMucHJvcE5hbWVdKSk7XG4gICAgICAgICAgICAgICAgcGFyYW1zLmZyb21UaGVtZVtwYXJhbXMucHJvcE5hbWVdW2tleV0gPSB0aGlzLl9leHRlbmRUaGVtZShpdGVtLCBjbG9uZVRoZW1lKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgICAgICBwYXJhbXMudG9UaGVtZVtwYXJhbXMucHJvcE5hbWVdID0gcGFyYW1zLmZyb21UaGVtZVtwYXJhbXMucHJvcE5hbWVdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhcmFtcy50b1RoZW1lO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDb3B5IGNvbG9yIGluZm8gdG8gbGVnZW5kXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHNlcmllc1RoZW1lIHNlcmllcyB0aGVtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBsZWdlbmRUaGVtZSBsZWdlbmQgdGhlbWVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jb3B5Q29sb3JJbmZvVG9MZWdlbmQ6IGZ1bmN0aW9uKHNlcmllc1RoZW1lLCBsZWdlbmRUaGVtZSkge1xuICAgICAgICBpZiAoc2VyaWVzVGhlbWUuc2luZ2xlQ29sb3JzKSB7XG4gICAgICAgICAgICBsZWdlbmRUaGVtZS5zaW5nbGVDb2xvcnMgPSBzZXJpZXNUaGVtZS5zaW5nbGVDb2xvcnM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNlcmllc1RoZW1lLmJvcmRlckNvbG9yKSB7XG4gICAgICAgICAgICBsZWdlbmRUaGVtZS5ib3JkZXJDb2xvciA9IHNlcmllc1RoZW1lLmJvcmRlckNvbG9yO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIGluaGVyaXQgdGhlbWUgcHJvcGVydHkuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIHRoZW1lXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAaWdub3JlXG4gICAgICovXG4gICAgX2luaGVyaXRUaGVtZVByb3BlcnR5OiBmdW5jdGlvbih0aGVtZSkge1xuICAgICAgICB2YXIgYmFzZUZvbnQgPSB0aGVtZS5jaGFydC5mb250RmFtaWx5LFxuICAgICAgICAgICAgaXRlbXMgPSBbXG4gICAgICAgICAgICAgICAgdGhlbWUudGl0bGUsXG4gICAgICAgICAgICAgICAgdGhlbWUueEF4aXMudGl0bGUsXG4gICAgICAgICAgICAgICAgdGhlbWUueEF4aXMubGFiZWwsXG4gICAgICAgICAgICAgICAgdGhlbWUubGVnZW5kLmxhYmVsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgeUF4aXNDaGFydFR5cGVzID0gdGhpcy5fZmlsdGVyQ2hhcnRUeXBlcyh0aGVtZS55QXhpcywgY2hhcnRDb25zdC5ZQVhJU19QUk9QUyksXG4gICAgICAgICAgICBzZXJpZXNDaGFydFR5cGVzID0gdGhpcy5fZmlsdGVyQ2hhcnRUeXBlcyh0aGVtZS5zZXJpZXMsIGNoYXJ0Q29uc3QuU0VSSUVTX1BST1BTKTtcblxuICAgICAgICBpZiAoIW5lLnV0aWwua2V5cyh5QXhpc0NoYXJ0VHlwZXMpLmxlbmd0aCkge1xuICAgICAgICAgICAgaXRlbXMucHVzaCh0aGVtZS55QXhpcy50aXRsZSk7XG4gICAgICAgICAgICBpdGVtcy5wdXNoKHRoZW1lLnlBeGlzLmxhYmVsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5lLnV0aWwuZm9yRWFjaCh5QXhpc0NoYXJ0VHlwZXMsIGZ1bmN0aW9uKHlBeGlzVGhlbWUpIHtcbiAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKHlBeGlzVGhlbWUudGl0bGUpO1xuICAgICAgICAgICAgICAgIGl0ZW1zLnB1c2goeUF4aXNUaGVtZS5sYWJlbCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KGl0ZW1zLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICBpZiAoIWl0ZW0uZm9udEZhbWlseSkge1xuICAgICAgICAgICAgICAgIGl0ZW0uZm9udEZhbWlseSA9IGJhc2VGb250O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoIW5lLnV0aWwua2V5cyhzZXJpZXNDaGFydFR5cGVzKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoZW1lLmxlZ2VuZC5jb2xvcnMgPSB0aGVtZS5zZXJpZXMuY29sb3JzO1xuICAgICAgICAgICAgdGhpcy5fY29weUNvbG9ySW5mb1RvTGVnZW5kKHRoZW1lLnNlcmllcywgdGhlbWUubGVnZW5kKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5lLnV0aWwuZm9yRWFjaChzZXJpZXNDaGFydFR5cGVzLCBmdW5jdGlvbihpdGVtLCBjaGFydFR5cGUpIHtcbiAgICAgICAgICAgICAgICB0aGVtZS5sZWdlbmRbY2hhcnRUeXBlXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgY29sb3JzOiBpdGVtLmNvbG9ycyB8fCB0aGVtZS5sZWdlbmQuY29sb3JzXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLl9jb3B5Q29sb3JJbmZvVG9MZWdlbmQoaXRlbSwgdGhlbWUubGVnZW5kW2NoYXJ0VHlwZV0pO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGVtZS5sZWdlbmQuY29sb3JzO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEF4aXMgRGF0YSBNYWtlclxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4uL2NvbnN0LmpzJyksXG4gICAgY2FsY3VsYXRvciA9IHJlcXVpcmUoJy4vY2FsY3VsYXRvci5qcycpO1xuXG52YXIgTUlOX1BJWEVMX1NURVBfU0laRSA9IDQwLFxuICAgIE1BWF9QSVhFTF9TVEVQX1NJWkUgPSA2MCxcbiAgICBQRVJDRU5UX1NUQUNLRURfVElDS19JTkZPID0ge1xuICAgICAgICBzY2FsZToge1xuICAgICAgICAgICAgbWluOiAwLFxuICAgICAgICAgICAgbWF4OiAxMDBcbiAgICAgICAgfSxcbiAgICAgICAgc3RlcDogMjUsXG4gICAgICAgIHRpY2tDb3VudDogNSxcbiAgICAgICAgbGFiZWxzOiBbMCwgMjUsIDUwLCA3NSwgMTAwXVxuICAgIH07XG5cbnZhciBhYnMgPSBNYXRoLmFicyxcbiAgICBjb25jYXQgPSBBcnJheS5wcm90b3R5cGUuY29uY2F0O1xuLyoqXG4gKiBBeGlzIGRhdGEgbWFrZXIuXG4gKiBAbW9kdWxlIGF4aXNEYXRhTWFrZXJcbiAqL1xudmFyIGF4aXNEYXRhTWFrZXIgPSB7XG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBkYXRhIGFib3V0IGxhYmVsIGF4aXMuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBsYWJlbHMgY2hhcnQgbGFiZWxzXG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IGlzVmVydGljYWwgd2hldGhlciB2ZXJ0aWNhbCBvciBub3RcbiAgICAgKiBAcmV0dXJucyB7e1xuICAgICAqICAgICAgbGFiZWxzOiBhcnJheS48c3RyaW5nPixcbiAgICAgKiAgICAgIHRpY2tDb3VudDogbnVtYmVyLFxuICAgICAqICAgICAgdmFsaWRUaWNrQ291bnQ6IG51bWJlcixcbiAgICAgKiAgICAgIGlzTGFiZWxBeGlzOiBib29sZWFuLFxuICAgICAqICAgICAgaXNWZXJ0aWNhbDogYm9vbGVhblxuICAgICAqIH19IGF4aXMgZGF0YVxuICAgICAqL1xuICAgIG1ha2VMYWJlbEF4aXNEYXRhOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxhYmVsczogcGFyYW1zLmxhYmVscyxcbiAgICAgICAgICAgIHRpY2tDb3VudDogcGFyYW1zLmxhYmVscy5sZW5ndGggKyAxLFxuICAgICAgICAgICAgdmFsaWRUaWNrQ291bnQ6IDAsXG4gICAgICAgICAgICBpc0xhYmVsQXhpczogdHJ1ZSxcbiAgICAgICAgICAgIGlzVmVydGljYWw6ICEhcGFyYW1zLmlzVmVydGljYWxcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBkYXRhIGFib3V0IHZhbHVlIGF4aXMuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheS48bnVtYmVyPj59IHBhcmFtcy52YWx1ZXMgY2hhcnQgdmFsdWVzXG4gICAgICogICAgICBAcGFyYW0ge3t3aWR0aDpudW1iZXIsIGhlaWdodDpudW1iZXJ9fSBwYXJhbXMuc2VyaWVzRGltZW5zaW9uIHNlcmllcyBkaW1lbnNpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPGZ1bmN0aW9uPn0gcGFyYW1zLmZvcm1hdEZ1bmN0aW9ucyBmb3JtYXQgZnVuY3Rpb25zXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLnN0YWNrZWQgc3RhY2tlZCBvcHRpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMub3B0aW9ucyBheGlzIG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7e1xuICAgICAqICAgICAgbGFiZWxzOiBhcnJheS48c3RyaW5nPixcbiAgICAgKiAgICAgIHRpY2tDb3VudDogbnVtYmVyLFxuICAgICAqICAgICAgdmFsaWRUaWNrQ291bnQ6IG51bWJlcixcbiAgICAgKiAgICAgIGlzTGFiZWxBeGlzOiBib29sZWFuLFxuICAgICAqICAgICAgc2NhbGU6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9LFxuICAgICAqICAgICAgaXNWZXJ0aWNhbDogYm9vbGVhblxuICAgICAqIH19IGF4aXMgZGF0YVxuICAgICAqL1xuICAgIG1ha2VWYWx1ZUF4aXNEYXRhOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSBwYXJhbXMub3B0aW9ucyB8fCB7fSxcbiAgICAgICAgICAgIGlzVmVydGljYWwgPSAhIXBhcmFtcy5pc1ZlcnRpY2FsLFxuICAgICAgICAgICAgaXNQb3NpdGlvblJpZ2h0ID0gISFwYXJhbXMuaXNQb3NpdGlvblJpZ2h0LFxuICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zID0gcGFyYW1zLmZvcm1hdEZ1bmN0aW9ucyxcbiAgICAgICAgICAgIHRpY2tJbmZvO1xuICAgICAgICBpZiAocGFyYW1zLnN0YWNrZWQgPT09ICdwZXJjZW50Jykge1xuICAgICAgICAgICAgdGlja0luZm8gPSBQRVJDRU5UX1NUQUNLRURfVElDS19JTkZPO1xuICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zID0gW107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aWNrSW5mbyA9IHRoaXMuX2dldFRpY2tJbmZvKHtcbiAgICAgICAgICAgICAgICB2YWx1ZXM6IHRoaXMuX21ha2VCYXNlVmFsdWVzKHBhcmFtcy52YWx1ZXMsIHBhcmFtcy5zdGFja2VkKSxcbiAgICAgICAgICAgICAgICBzZXJpZXNEaW1lbnNpb246IHBhcmFtcy5zZXJpZXNEaW1lbnNpb24sXG4gICAgICAgICAgICAgICAgaXNWZXJ0aWNhbDogaXNWZXJ0aWNhbCxcbiAgICAgICAgICAgICAgICBpc1Bvc2l0aW9uUmlnaHQ6IGlzUG9zaXRpb25SaWdodCxcbiAgICAgICAgICAgICAgICBjaGFydFR5cGU6IHBhcmFtcy5jaGFydFR5cGVcbiAgICAgICAgICAgIH0sIG9wdGlvbnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxhYmVsczogdGhpcy5fZm9ybWF0TGFiZWxzKHRpY2tJbmZvLmxhYmVscywgZm9ybWF0RnVuY3Rpb25zKSxcbiAgICAgICAgICAgIHRpY2tDb3VudDogdGlja0luZm8udGlja0NvdW50LFxuICAgICAgICAgICAgdmFsaWRUaWNrQ291bnQ6IHRpY2tJbmZvLnRpY2tDb3VudCxcbiAgICAgICAgICAgIHNjYWxlOiB0aWNrSW5mby5zY2FsZSxcbiAgICAgICAgICAgIHN0ZXA6IHRpY2tJbmZvLnN0ZXAsXG4gICAgICAgICAgICBpc1ZlcnRpY2FsOiBpc1ZlcnRpY2FsLFxuICAgICAgICAgICAgaXNQb3NpdGlvblJpZ2h0OiBpc1Bvc2l0aW9uUmlnaHRcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBiYXNlIHZhbHVlcy5cbiAgICAgKiBAcGFyYW0ge2FycmF5LjxudW1iZXI+fSBncm91cFZhbHVlcyBncm91cCB2YWx1ZXNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhY2tlZCBzdGFja2VkIG9wdGlvbi5cbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPG51bWJlcj59IGJhc2UgdmFsdWVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUJhc2VWYWx1ZXM6IGZ1bmN0aW9uKGdyb3VwVmFsdWVzLCBzdGFja2VkKSB7XG4gICAgICAgIHZhciBiYXNlVmFsdWVzID0gY29uY2F0LmFwcGx5KFtdLCBncm91cFZhbHVlcyk7IC8vIGZsYXR0ZW4gYXJyYXlcbiAgICAgICAgaWYgKHN0YWNrZWQgPT09IGNoYXJ0Q29uc3QuU1RBQ0tFRF9OT1JNQUxfVFlQRSkge1xuICAgICAgICAgICAgYmFzZVZhbHVlcyA9IGJhc2VWYWx1ZXMuY29uY2F0KG5lLnV0aWwubWFwKGdyb3VwVmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGx1c1ZhbHVlcyA9IG5lLnV0aWwuZmlsdGVyKHZhbHVlcywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlID4gMDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmUudXRpbC5zdW0ocGx1c1ZhbHVlcyk7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJhc2VWYWx1ZXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBiYXNlIHNpemUgZm9yIGdldCBjYW5kaWRhdGUgdGljayBjb3VudHMuXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBkaW1lbnNpb24gY2hhdCBkaW1lbnNpb25cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzVmVydGljYWwgd2hldGhlciB2ZXJ0aWNhbCBvciBub3RcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBiYXNlIHNpemVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRCYXNlU2l6ZTogZnVuY3Rpb24oZGltZW5zaW9uLCBpc1ZlcnRpY2FsKSB7XG4gICAgICAgIHZhciBiYXNlU2l6ZTtcbiAgICAgICAgaWYgKGlzVmVydGljYWwpIHtcbiAgICAgICAgICAgIGJhc2VTaXplID0gZGltZW5zaW9uLmhlaWdodDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJhc2VTaXplID0gZGltZW5zaW9uLndpZHRoO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBiYXNlU2l6ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNhbmRpZGF0ZSB0aWNrIGNvdW50cy5cbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGNoYXJ0RGltZW5zaW9uIGNoYXQgZGltZW5zaW9uXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpc1ZlcnRpY2FsIHdoZXRoZXIgdmVydGljYWwgb3Igbm90XG4gICAgICogQHJldHVybnMge2FycmF5LjxudW1iZXI+fSB0aWNrIGNvdW50c1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldENhbmRpZGF0ZVRpY2tDb3VudHM6IGZ1bmN0aW9uKGNoYXJ0RGltZW5zaW9uLCBpc1ZlcnRpY2FsKSB7XG4gICAgICAgIHZhciBiYXNlU2l6ZSA9IHRoaXMuX2dldEJhc2VTaXplKGNoYXJ0RGltZW5zaW9uLCBpc1ZlcnRpY2FsKSxcbiAgICAgICAgICAgIHN0YXJ0ID0gcGFyc2VJbnQoYmFzZVNpemUgLyBNQVhfUElYRUxfU1RFUF9TSVpFLCAxMCksXG4gICAgICAgICAgICBlbmQgPSBwYXJzZUludChiYXNlU2l6ZSAvIE1JTl9QSVhFTF9TVEVQX1NJWkUsIDEwKSArIDEsXG4gICAgICAgICAgICB0aWNrQ291bnRzID0gbmUudXRpbC5yYW5nZShzdGFydCwgZW5kKTtcbiAgICAgICAgcmV0dXJuIHRpY2tDb3VudHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjb21wYXJpbmcgdmFsdWUuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1pbiBtaW5pbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtYXggbWF4aW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiBAcGFyYW0ge3tzY2FsZToge21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn0sIHN0ZXA6IG51bWJlcn19IHRpY2tJbmZvIHRpY2sgaW5mb1xuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IGNvbXBhcmluZyB2YWx1ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldENvbXBhcmluZ1ZhbHVlOiBmdW5jdGlvbihtaW4sIG1heCwgdGlja0luZm8pIHtcbiAgICAgICAgdmFyIGRpZmZNYXggPSBhYnModGlja0luZm8uc2NhbGUubWF4IC0gbWF4KSxcbiAgICAgICAgICAgIGRpZmZNaW4gPSBhYnMobWluIC0gdGlja0luZm8uc2NhbGUubWluKSxcbiAgICAgICAgICAgIHdlaWdodCA9IE1hdGgucG93KDEwLCBuZS51dGlsLmxlbmd0aEFmdGVyUG9pbnQodGlja0luZm8uc3RlcCkpO1xuICAgICAgICByZXR1cm4gKGRpZmZNYXggKyBkaWZmTWluKSAqIHdlaWdodDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2VsZWN0IHRpY2sgaW5mby5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWluIG1pbmltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1heCBtYXhpbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7YXJyYXkuPG9iamVjdD59IGNhbmRpZGF0ZXMgdGljayBpbmZvIGNhbmRpZGF0ZXNcbiAgICAgKiBAcmV0dXJucyB7e3NjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfSwgdGlja0NvdW50OiBudW1iZXIsIHN0ZXA6IG51bWJlciwgbGFiZWxzOiBhcnJheS48bnVtYmVyPn19IHNlbGVjdGVkIHRpY2sgaW5mb1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NlbGVjdFRpY2tJbmZvOiBmdW5jdGlvbihtaW4sIG1heCwgY2FuZGlkYXRlcykge1xuICAgICAgICB2YXIgZ2V0Q29tcGFyaW5nVmFsdWUgPSBuZS51dGlsLmJpbmQodGhpcy5fZ2V0Q29tcGFyaW5nVmFsdWUsIHRoaXMsIG1pbiwgbWF4KSxcbiAgICAgICAgICAgIHRpY2tJbmZvID0gbmUudXRpbC5taW4oY2FuZGlkYXRlcywgZ2V0Q29tcGFyaW5nVmFsdWUpO1xuICAgICAgICByZXR1cm4gdGlja0luZm87XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB0aWNrIGNvdW50IGFuZCBzY2FsZS5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMudmFsdWVzIGJhc2UgdmFsdWVzXG4gICAgICogICAgICBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IHBhcmFtcy5zZXJpZXNEaW1lbnNpb24gY2hhdCBkaW1lbnNpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gcGFyYW1zLmlzVmVydGljYWwgd2hldGhlciB2ZXJ0aWNhbCBvciBub3RcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMuY2hhcnRUeXBlIGNoYXQgdHlwZVxuICAgICAqIEBwYXJhbSB7e21pbjogbnVtYmVyLCBtYXg6bnVtYmVyfX0gb3B0aW9ucyBheGlzIG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7e3RpY2tDb3VudDogbnVtYmVyLCBzY2FsZTogb2JqZWN0fX0gdGljayBpbmZvXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0VGlja0luZm86IGZ1bmN0aW9uKHBhcmFtcywgb3B0aW9ucykge1xuICAgICAgICB2YXIgbWluID0gbmUudXRpbC5taW4ocGFyYW1zLnZhbHVlcyksXG4gICAgICAgICAgICBtYXggPSBuZS51dGlsLm1heChwYXJhbXMudmFsdWVzKSxcbiAgICAgICAgICAgIGludFR5cGVJbmZvLCB0aWNrQ291bnRzLCBjYW5kaWRhdGVzLCB0aWNrSW5mbztcbiAgICAgICAgLy8gMDEuIG1pbiwgbWF4LCBvcHRpb25zIOygleuztOulvCDsoJXsiJjtmJXsnLzroZwg67OA6rK9XG4gICAgICAgIGludFR5cGVJbmZvID0gdGhpcy5fbWFrZUludGVnZXJUeXBlSW5mbyhtaW4sIG1heCwgb3B0aW9ucyk7XG5cbiAgICAgICAgLy8gMDIuIHRpY2sgY291bnQg7ZuE67O06rWwIOyWu+q4sFxuICAgICAgICB0aWNrQ291bnRzID0gcGFyYW1zLnRpY2tDb3VudCA/IFtwYXJhbXMudGlja0NvdW50XSA6IHRoaXMuX2dldENhbmRpZGF0ZVRpY2tDb3VudHMocGFyYW1zLnNlcmllc0RpbWVuc2lvbiwgcGFyYW1zLmlzVmVydGljYWwpO1xuXG4gICAgICAgIC8vIDAzLiB0aWNrIGluZm8g7ZuE67O06rWwIOqzhOyCsFxuICAgICAgICBjYW5kaWRhdGVzID0gdGhpcy5fZ2V0Q2FuZGlkYXRlVGlja0luZm9zKHtcbiAgICAgICAgICAgIG1pbjogaW50VHlwZUluZm8ubWluLFxuICAgICAgICAgICAgbWF4OiBpbnRUeXBlSW5mby5tYXgsXG4gICAgICAgICAgICB0aWNrQ291bnRzOiB0aWNrQ291bnRzLFxuICAgICAgICAgICAgY2hhcnRUeXBlOiBwYXJhbXMuY2hhcnRUeXBlXG4gICAgICAgIH0sIGludFR5cGVJbmZvLm9wdGlvbnMpO1xuXG4gICAgICAgIC8vIDA0LiB0aWNrIGluZm8g7ZuE67O06rWwIOykkSDtlZjrgpgg7ISg7YOdXG4gICAgICAgIHRpY2tJbmZvID0gdGhpcy5fc2VsZWN0VGlja0luZm8oaW50VHlwZUluZm8ubWluLCBpbnRUeXBlSW5mby5tYXgsIGNhbmRpZGF0ZXMpO1xuXG4gICAgICAgIC8vIDA1LiDsoJXsiJjtmJXsnLzroZwg67OA6rK97ZaI642YIHRpY2sgaW5mb+ulvCDsm5Drnpgg7ZiV7YOc66GcIOuzgOqyvVxuICAgICAgICB0aWNrSW5mbyA9IHRoaXMuX3JldmVydE9yaWdpbmFsVHlwZVRpY2tJbmZvKHRpY2tJbmZvLCBpbnRUeXBlSW5mby5kaXZpZGVOdW0pO1xuICAgICAgICByZXR1cm4gdGlja0luZm87XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgaW50ZWdlciB0eXBlIGluZm9cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWluIG1pbmltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1heCBtYXhpbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7e21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19IG9wdGlvbnMgYXhpcyBvcHRpb25zXG4gICAgICogQHJldHVybnMge3ttaW46IG51bWJlciwgbWF4OiBudW1iZXIsIG9wdGlvbnM6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9LCBkaXZpZGVOdW06IG51bWJlcn19IGludGVnZXIgdHlwZSBpbmZvXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUludGVnZXJUeXBlSW5mbzogZnVuY3Rpb24obWluLCBtYXgsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIG11bHRpcGxlTnVtLCBjaGFuZ2VkT3B0aW9ucztcblxuICAgICAgICBpZiAoYWJzKG1pbikgPj0gMSB8fCBhYnMobWF4KSA+PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG1pbjogbWluLFxuICAgICAgICAgICAgICAgIG1heDogbWF4LFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IG9wdGlvbnMsXG4gICAgICAgICAgICAgICAgZGl2aWRlTnVtOiAxXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgbXVsdGlwbGVOdW0gPSBuZS51dGlsLmZpbmRNdWx0aXBsZU51bShtaW4sIG1heCk7XG4gICAgICAgIGNoYW5nZWRPcHRpb25zID0ge307XG5cbiAgICAgICAgaWYgKG9wdGlvbnMubWluKSB7XG4gICAgICAgICAgICBjaGFuZ2VkT3B0aW9ucy5taW4gPSBvcHRpb25zLm1pbiAqIG11bHRpcGxlTnVtO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9wdGlvbnMubWF4KSB7XG4gICAgICAgICAgICBjaGFuZ2VkT3B0aW9ucy5tYXggPSBvcHRpb25zLm1heCAqIG11bHRpcGxlTnVtO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG1pbjogbWluICogbXVsdGlwbGVOdW0sXG4gICAgICAgICAgICBtYXg6IG1heCAqIG11bHRpcGxlTnVtLFxuICAgICAgICAgICAgb3B0aW9uczogY2hhbmdlZE9wdGlvbnMsXG4gICAgICAgICAgICBkaXZpZGVOdW06IG11bHRpcGxlTnVtXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldmVydCB0aWNrIGluZm8gdG8gb3JpZ2luYWwgdHlwZS5cbiAgICAgKiBAcGFyYW0ge3tzdGVwOiBudW1iZXIsIHNjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfSwgbGFiZWxzOiBhcnJheS48bnVtYmVyPn19IHRpY2tJbmZvIHRpY2sgaW5mb1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBkaXZpZGVOdW0gZGl2aWRlIG51bVxuICAgICAqIEByZXR1cm5zIHt7c3RlcDogbnVtYmVyLCBzY2FsZToge21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn0sIGxhYmVsczogYXJyYXkuPG51bWJlcj59fSBkaXZpZGVkIHRpY2sgaW5mb1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JldmVydE9yaWdpbmFsVHlwZVRpY2tJbmZvOiBmdW5jdGlvbih0aWNrSW5mbywgZGl2aWRlTnVtKSB7XG4gICAgICAgIGlmIChkaXZpZGVOdW0gPT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiB0aWNrSW5mbztcbiAgICAgICAgfVxuXG4gICAgICAgIHRpY2tJbmZvLnN0ZXAgPSBuZS51dGlsLmRpdmlzaW9uKHRpY2tJbmZvLnN0ZXAsIGRpdmlkZU51bSk7XG4gICAgICAgIHRpY2tJbmZvLnNjYWxlLm1pbiA9IG5lLnV0aWwuZGl2aXNpb24odGlja0luZm8uc2NhbGUubWluLCBkaXZpZGVOdW0pO1xuICAgICAgICB0aWNrSW5mby5zY2FsZS5tYXggPSBuZS51dGlsLmRpdmlzaW9uKHRpY2tJbmZvLnNjYWxlLm1heCwgZGl2aWRlTnVtKTtcbiAgICAgICAgdGlja0luZm8ubGFiZWxzID0gbmUudXRpbC5tYXAodGlja0luZm8ubGFiZWxzLCBmdW5jdGlvbihsYWJlbCkge1xuICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwuZGl2aXNpb24obGFiZWwsIGRpdmlkZU51bSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB0aWNrSW5mbztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTm9ybWFsaXplIHN0ZXAuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHN0ZXAgb3JpZ2luYWwgc3RlcFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IG5vcm1hbGl6ZWQgc3RlcFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX25vcm1hbGl6ZVN0ZXA6IGZ1bmN0aW9uKHN0ZXApIHtcbiAgICAgICAgcmV0dXJuIGNhbGN1bGF0b3Iubm9ybWFsaXplQXhpc051bWJlcihzdGVwKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWluaW1pemUgdGljayBzY2FsZS5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMudXNlck1pbiB1c2VyIG1pblxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy51c2VyTWF4IHVzZXIgbWF4XG4gICAgICogICAgICBAcGFyYW0ge3t0aWNrQ291bnQ6IG51bWJlciwgc2NhbGU6IG9iamVjdH19IHBhcmFtcy50aWNrSW5mbyB0aWNrIGluZm9cbiAgICAgKiAgICAgIEBwYXJhbSB7e21pbjogbnVtYmVyLCBtYXg6bnVtYmVyfX0gcGFyYW1zLm9wdGlvbnMgYXhpcyBvcHRpb25zXG4gICAgICogQHJldHVybnMge3t0aWNrQ291bnQ6IG51bWJlciwgc2NhbGU6IG9iamVjdCwgbGFiZWxzOiBhcnJheX19IGNvcnJlY3RlZCB0aWNrIGluZm9cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9taW5pbWl6ZVRpY2tTY2FsZTogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciB0aWNrSW5mbyA9IHBhcmFtcy50aWNrSW5mbyxcbiAgICAgICAgICAgIHRpY2tzID0gbmUudXRpbC5yYW5nZSgxLCB0aWNrSW5mby50aWNrQ291bnQpLFxuICAgICAgICAgICAgb3B0aW9ucyA9IHBhcmFtcy5vcHRpb25zLFxuICAgICAgICAgICAgc3RlcCA9IHRpY2tJbmZvLnN0ZXAsXG4gICAgICAgICAgICBzY2FsZSA9IHRpY2tJbmZvLnNjYWxlLFxuICAgICAgICAgICAgdGlja01heCA9IHNjYWxlLm1heCxcbiAgICAgICAgICAgIHRpY2tNaW4gPSBzY2FsZS5taW4sXG4gICAgICAgICAgICBpc1VuZGVmaW5lZE1pbiA9IG5lLnV0aWwuaXNVbmRlZmluZWQob3B0aW9ucy5taW4pLFxuICAgICAgICAgICAgaXNVbmRlZmluZWRNYXggPSBuZS51dGlsLmlzVW5kZWZpbmVkKG9wdGlvbnMubWF4KSxcbiAgICAgICAgICAgIGxhYmVscztcbiAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkodGlja3MsIGZ1bmN0aW9uKHRpY2tJbmRleCkge1xuICAgICAgICAgICAgdmFyIGN1clN0ZXAgPSAoc3RlcCAqIHRpY2tJbmRleCksXG4gICAgICAgICAgICAgICAgY3VyTWluID0gdGlja01pbiArIGN1clN0ZXAsXG4gICAgICAgICAgICAgICAgY3VyTWF4ID0gdGlja01heCAtIGN1clN0ZXA7XG5cbiAgICAgICAgICAgIC8vIOuNlOydtOyDgSDrs4Dqsr3snbQg7ZWE7JqUIOyXhuydhCDqsr3smrBcbiAgICAgICAgICAgIGlmIChwYXJhbXMudXNlck1pbiA8PSBjdXJNaW4gJiYgcGFyYW1zLnVzZXJNYXggPj0gY3VyTWF4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBtaW4g6rCS7JeQIOuzgOqyvSDsl6zsnKDqsIAg7J6I7J2EIOqyveyasFxuICAgICAgICAgICAgaWYgKChpc1VuZGVmaW5lZE1pbiAmJiBwYXJhbXMudXNlck1pbiA+IGN1ck1pbikgfHxcbiAgICAgICAgICAgICAgICAoIWlzVW5kZWZpbmVkTWluICYmIG9wdGlvbnMubWluID49IGN1ck1pbikpIHtcbiAgICAgICAgICAgICAgICBzY2FsZS5taW4gPSBjdXJNaW47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIG1heCDqsJLsl5Ag67OA6rK9IOyXrOycoOqwgCDsnojsnYQg6rK97JqwXG4gICAgICAgICAgICBpZiAoKGlzVW5kZWZpbmVkTWluICYmIHBhcmFtcy51c2VyTWF4IDwgY3VyTWF4KSB8fFxuICAgICAgICAgICAgICAgICghaXNVbmRlZmluZWRNYXggJiYgb3B0aW9ucy5tYXggPD0gY3VyTWF4KSkge1xuICAgICAgICAgICAgICAgIHNjYWxlLm1heCA9IGN1ck1heDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGFiZWxzID0gY2FsY3VsYXRvci5tYWtlTGFiZWxzRnJvbVNjYWxlKHNjYWxlLCBzdGVwKTtcbiAgICAgICAgdGlja0luZm8ubGFiZWxzID0gbGFiZWxzO1xuICAgICAgICB0aWNrSW5mby5zdGVwID0gc3RlcDtcbiAgICAgICAgdGlja0luZm8udGlja0NvdW50ID0gbGFiZWxzLmxlbmd0aDtcbiAgICAgICAgcmV0dXJuIHRpY2tJbmZvO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBkaXZpZGUgdGljayBzdGVwLlxuICAgICAqIEBwYXJhbSB7e3NjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfSwgdGlja0NvdW50OiBudW1iZXIsIHN0ZXA6IG51bWJlciwgbGFiZWxzOiBhcnJheS48bnVtYmVyPn19IHRpY2tJbmZvIHRpY2sgaW5mb1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBvcmdUaWNrQ291bnQgb3JpZ2luYWwgdGlja0NvdW50XG4gICAgICogQHJldHVybnMge3tzY2FsZToge21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn0sIHRpY2tDb3VudDogbnVtYmVyLCBzdGVwOiBudW1iZXIsIGxhYmVsczogYXJyYXkuPG51bWJlcj59fSB0aWNrIGluZm9cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9kaXZpZGVUaWNrU3RlcDogZnVuY3Rpb24odGlja0luZm8sIG9yZ1RpY2tDb3VudCkge1xuICAgICAgICB2YXIgc3RlcCA9IHRpY2tJbmZvLnN0ZXAsXG4gICAgICAgICAgICBzY2FsZSA9IHRpY2tJbmZvLnNjYWxlLFxuICAgICAgICAgICAgdGlja0NvdW50ID0gdGlja0luZm8udGlja0NvdW50O1xuICAgICAgICAvLyBzdGVwIDLsnZgg67Cw7IiYIOydtOuptOyEnCDrs4Dqsr3rkJwgdGlja0NvdW507J2YIOuRkOuwsOyImC0x7J20IHRpY2tDb3VudOuztOuLpCBvcmdUaWNrQ291bnTsmYAg7LCo7J206rCAIOuNnOuCmOqxsOuCmCDqsJnsnLzrqbQgc3RlcOydhCDrsJjsnLzroZwg67OA6rK97ZWc64ukLlxuICAgICAgICBpZiAoKHN0ZXAgJSAyID09PSAwKSAmJlxuICAgICAgICAgICAgYWJzKG9yZ1RpY2tDb3VudCAtICgodGlja0NvdW50ICogMikgLSAxKSkgPD0gYWJzKG9yZ1RpY2tDb3VudCAtIHRpY2tDb3VudCkpIHtcbiAgICAgICAgICAgIHN0ZXAgPSBzdGVwIC8gMjtcbiAgICAgICAgICAgIHRpY2tJbmZvLmxhYmVscyA9IGNhbGN1bGF0b3IubWFrZUxhYmVsc0Zyb21TY2FsZShzY2FsZSwgc3RlcCk7XG4gICAgICAgICAgICB0aWNrSW5mby50aWNrQ291bnQgPSB0aWNrSW5mby5sYWJlbHMubGVuZ3RoO1xuICAgICAgICAgICAgdGlja0luZm8uc3RlcCA9IHN0ZXA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRpY2tJbmZvO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHRpY2sgaW5mb1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy50aWNrQ291bnQgdGljayBjb3VudFxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5taW4gc2NhbGUgbWluXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLm1heCBzY2FsZSBtYXhcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMudXNlck1pbiBtaW5pbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy51c2VyTWF4IG1heGltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5pc01pbnVzIHdoZXRoZXIgc2NhbGUgaXMgbWludXMgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLmNoYXJ0VHlwZSBjaGFydCB0eXBlXG4gICAgICogICAgICBAcGFyYW0ge3ttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fSBwYXJhbXMub3B0aW9ucyBheGlzIG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7e1xuICAgICAqICAgICAgc2NhbGU6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9LFxuICAgICAqICAgICAgdGlja0NvdW50OiBudW1iZXIsXG4gICAgICogICAgICBzdGVwOiBudW1iZXIsXG4gICAgICogICAgICBsYWJlbHM6IGFycmF5LjxudW1iZXI+XG4gICAgICogfX0gdGljayBpbmZvXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVRpY2tJbmZvOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIHNjYWxlID0gcGFyYW1zLnNjYWxlLFxuICAgICAgICAgICAgc3RlcCwgdGlja0luZm87XG5cbiAgICAgICAgLy8gMDEuIOq4sOuzuCBzY2FsZSDsoJXrs7TroZwgc3RlcCDslrvquLBcbiAgICAgICAgc3RlcCA9IGNhbGN1bGF0b3IuZ2V0U2NhbGVTdGVwKHNjYWxlLCBwYXJhbXMudGlja0NvdW50KTtcblxuICAgICAgICAvLyAwMi4gc3RlcCDsnbzrsJjtmZQg7Iuc7YKk6riwIChleDogMC4zIC0tPiAwLjUsIDcgLS0+IDEwKVxuICAgICAgICBzdGVwID0gdGhpcy5fbm9ybWFsaXplU3RlcChzdGVwKTtcblxuICAgICAgICAvLyAwMy4gc2NhbGUg7J2867CY7ZmUIOyLnO2CpOq4sFxuICAgICAgICBzY2FsZSA9IHRoaXMuX25vcm1hbGl6ZVNjYWxlKHNjYWxlLCBzdGVwLCBwYXJhbXMudGlja0NvdW50KTtcblxuICAgICAgICAvLyAwNC4gbGluZeywqO2KuOydmCDqsr3smrAg7IKs7Jqp7J6Q7J2YIG1pbuqwkuydtCBzY2FsZeydmCBtaW7qsJLqs7wg6rCZ7J2EIOqyveyasCwgbWlu6rCS7J2EIDEgc3RlcCDqsJDshowg7Iuc7YK0XG4gICAgICAgIHNjYWxlLm1pbiA9IHRoaXMuX2FkZE1pblBhZGRpbmcoe1xuICAgICAgICAgICAgbWluOiBzY2FsZS5taW4sXG4gICAgICAgICAgICBzdGVwOiBzdGVwLFxuICAgICAgICAgICAgdXNlck1pbjogcGFyYW1zLnVzZXJNaW4sXG4gICAgICAgICAgICBtaW5PcHRpb246IHBhcmFtcy5vcHRpb25zLm1pbixcbiAgICAgICAgICAgIGNoYXJ0VHlwZTogcGFyYW1zLmNoYXJ0VHlwZVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyAwNS4g7IKs7Jqp7J6Q7J2YIG1heOqwkuydtCBzY2FlbCBtYXjsmYAg6rCZ7J2EIOqyveyasCwgbWF46rCS7J2EIDEgc3RlcCDspp3qsIAg7Iuc7YK0XG4gICAgICAgIHNjYWxlLm1heCA9IHRoaXMuX2FkZE1heFBhZGRpbmcoe1xuICAgICAgICAgICAgbWF4OiBzY2FsZS5tYXgsXG4gICAgICAgICAgICBzdGVwOiBzdGVwLFxuICAgICAgICAgICAgdXNlck1heDogcGFyYW1zLnVzZXJNYXgsXG4gICAgICAgICAgICBtYXhPcHRpb246IHBhcmFtcy5vcHRpb25zLm1heFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyAwNi4gYXhpcyBzY2FsZeydtCDsgqzsmqnsnpAgbWluLCBtYXjsmYAg6rGw66as6rCAIOupgCDqsr3smrAg7KGw7KCIXG4gICAgICAgIHRpY2tJbmZvID0gdGhpcy5fbWluaW1pemVUaWNrU2NhbGUoe1xuICAgICAgICAgICAgdXNlck1pbjogcGFyYW1zLnVzZXJNaW4sXG4gICAgICAgICAgICB1c2VyTWF4OiBwYXJhbXMudXNlck1heCxcbiAgICAgICAgICAgIHRpY2tJbmZvOiB7c2NhbGU6IHNjYWxlLCBzdGVwOiBzdGVwLCB0aWNrQ291bnQ6IHBhcmFtcy50aWNrQ291bnR9LFxuICAgICAgICAgICAgb3B0aW9uczogcGFyYW1zLm9wdGlvbnNcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGlja0luZm8gPSB0aGlzLl9kaXZpZGVUaWNrU3RlcCh0aWNrSW5mbywgcGFyYW1zLnRpY2tDb3VudCk7XG4gICAgICAgIHJldHVybiB0aWNrSW5mbztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIHNjYWxlIG1pbiBwYWRkaW5nLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHByYW1zIHtudW1iZXJ9IHBhcmFtcy5taW4gc2NhbGUgbWluXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnVzZXJNaW4gbWluaW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubWluT3B0aW9uIG1pbiBvcHRpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuc3RlcCB0aWNrIHN0ZXBcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBzY2FsZSBtaW5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hZGRNaW5QYWRkaW5nOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIG1pbiA9IHBhcmFtcy5taW47XG5cbiAgICAgICAgaWYgKHBhcmFtcy5jaGFydFR5cGUgIT09IGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9MSU5FIHx8ICFuZS51dGlsLmlzVW5kZWZpbmVkKHBhcmFtcy5taW5PcHRpb24pKSB7XG4gICAgICAgICAgICByZXR1cm4gbWluO1xuICAgICAgICB9XG4gICAgICAgIC8vIG5vcm1hbGl6ZeuQnCBzY2FsZSBtaW7qsJLsnbQgdXNlciBtaW7qsJLqs7wg6rCZ7J2EIOqyveyasCBzdGVwIOqwkOyGjFxuICAgICAgICBpZiAocGFyYW1zLm1pbiA9PT0gcGFyYW1zLnVzZXJNaW4pIHtcbiAgICAgICAgICAgIG1pbiAtPSBwYXJhbXMuc3RlcDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWluO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgc2NhbGUgbWF4IHBhZGRpbmcuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcHJhbXMge251bWJlcn0gcGFyYW1zLm1heCBzY2FsZSBtYXhcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMudXNlck1heCBtYXhpbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5tYXhPcHRpb24gbWF4IG9wdGlvblxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5zdGVwIHRpY2sgc3RlcFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IHNjYWxlIG1heFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2FkZE1heFBhZGRpbmc6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgbWF4ID0gcGFyYW1zLm1heDtcbiAgICAgICAgLy8gbm9ybWFsaXpl65CcIHNjYWxlIG1heOqwkuydtCB1c2VyIG1heOqwkuqzvCDqsJnsnYQg6rK97JqwIHN0ZXAg7Kad6rCAXG4gICAgICAgIGlmIChuZS51dGlsLmlzVW5kZWZpbmVkKHBhcmFtcy5tYXhPcHRpb24pICYmIChwYXJhbXMubWF4ID09PSBwYXJhbXMudXNlck1heCkpIHtcbiAgICAgICAgICAgIG1heCArPSBwYXJhbXMuc3RlcDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWF4O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBub3JtYWxpemUgbWluLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtaW4gb3JpZ2luYWwgbWluXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHN0ZXAgdGljayBzdGVwXG4gICAgICogQHJldHVybnMge251bWJlcn0gbm9ybWFsaXplZCBtaW5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9ub3JtYWxpemVNaW46IGZ1bmN0aW9uKG1pbiwgc3RlcCkge1xuICAgICAgICB2YXIgbW9kID0gbmUudXRpbC5tb2QobWluLCBzdGVwKSxcbiAgICAgICAgICAgIG5vcm1hbGl6ZWQ7XG5cbiAgICAgICAgaWYgKG1vZCA9PT0gMCkge1xuICAgICAgICAgICAgbm9ybWFsaXplZCA9IG1pbjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5vcm1hbGl6ZWQgPSBuZS51dGlsLnN1YnRyYWN0aW9uKG1pbiwgKG1pbiA+PSAwID8gbW9kIDogc3RlcCArIG1vZCkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBub3JtYWxpemVkO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIG5vcm1hbGl6ZWQgbWF4XG4gICAgICogQHBhcmFtIHt7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX0gc2NhbGUgc2NhbGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3RlcCB0aWNrIHN0ZXBcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdGlja0NvdW50IHRpY2sgY291bnRcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBub3JtYWxpemVkIG1heFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VOb3JtYWxpemVkTWF4OiBmdW5jdGlvbihzY2FsZSwgc3RlcCwgdGlja0NvdW50KSB7XG4gICAgICAgIHZhciBtaW5NYXhEaWZmID0gbmUudXRpbC5tdWx0aXBsaWNhdGlvbihzdGVwLCB0aWNrQ291bnQgLSAxKSxcbiAgICAgICAgICAgIG5vcm1hbGl6ZWRNYXggPSBuZS51dGlsLmFkZGl0aW9uKHNjYWxlLm1pbiwgbWluTWF4RGlmZiksXG4gICAgICAgICAgICBtYXhEaWZmID0gc2NhbGUubWF4IC0gbm9ybWFsaXplZE1heCxcbiAgICAgICAgICAgIG1vZERpZmYsIGRpdmlkZURpZmY7XG4gICAgICAgIC8vIG5vcm1hbGl6ZeuQnCBtYXjqsJLsnbQg7JuQ656Y7J2YIG1heOqwkiDrs7Tri6Qg7J6R7J2EIOqyveyasCBzdGVw7J2EIOymneqwgOyLnOy8nCDtgbAg6rCS7Jy866GcIOunjOuTpOq4sFxuICAgICAgICBpZiAobWF4RGlmZiA+IDApIHtcbiAgICAgICAgICAgIG1vZERpZmYgPSBtYXhEaWZmICUgc3RlcDtcbiAgICAgICAgICAgIGRpdmlkZURpZmYgPSBNYXRoLmZsb29yKG1heERpZmYgLyBzdGVwKTtcbiAgICAgICAgICAgIG5vcm1hbGl6ZWRNYXggKz0gc3RlcCAqIChtb2REaWZmID4gMCA/IGRpdmlkZURpZmYgKyAxIDogZGl2aWRlRGlmZik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5vcm1hbGl6ZWRNYXg7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG5vcm1hbGl6ZSBzY2FsZVxuICAgICAqIEBwYXJhbSB7e21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19IHNjYWxlIGJhc2Ugc2NhbGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3RlcCB0aWNrIHN0ZXBcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdGlja0NvdW50IHRpY2sgY291bnRcbiAgICAgKiBAcmV0dXJucyB7e21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19IG5vcm1hbGl6ZWQgc2NhbGVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9ub3JtYWxpemVTY2FsZTogZnVuY3Rpb24oc2NhbGUsIHN0ZXAsIHRpY2tDb3VudCkge1xuICAgICAgICBzY2FsZS5taW4gPSB0aGlzLl9ub3JtYWxpemVNaW4oc2NhbGUubWluLCBzdGVwKTtcbiAgICAgICAgc2NhbGUubWF4ID0gdGhpcy5fbWFrZU5vcm1hbGl6ZWRNYXgoc2NhbGUsIHN0ZXAsIHRpY2tDb3VudCk7XG4gICAgICAgIHJldHVybiBzY2FsZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNhbmRpZGF0ZXMgYWJvdXQgdGljayBpbmZvLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5taW4gbWluaW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubWF4IG1heGltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxudW1iZXI+fSBwYXJhbXMudGlja0NvdW50cyB0aWNrIGNvdW50c1xuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5jaGFydFR5cGUgY2hhcnQgdHlwZVxuICAgICAqIEBwYXJhbSB7e21pbjogbnVtYmVyLCBtYXg6bnVtYmVyfX0gb3B0aW9ucyBheGlzIG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7YXJyYXl9IGNhbmRpZGF0ZXMgYWJvdXQgdGljayBpbmZvXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0Q2FuZGlkYXRlVGlja0luZm9zOiBmdW5jdGlvbihwYXJhbXMsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIHVzZXJNaW4gPSBwYXJhbXMubWluLFxuICAgICAgICAgICAgdXNlck1heCA9IHBhcmFtcy5tYXgsXG4gICAgICAgICAgICBtaW4gPSBwYXJhbXMubWluLFxuICAgICAgICAgICAgbWF4ID0gcGFyYW1zLm1heCxcbiAgICAgICAgICAgIHNjYWxlLCBjYW5kaWRhdGVzO1xuXG4gICAgICAgIC8vIG1pbiwgbWF466eM7Jy866GcIOq4sOuzuCBzY2FsZSDslrvquLBcbiAgICAgICAgc2NhbGUgPSB0aGlzLl9tYWtlQmFzZVNjYWxlKG1pbiwgbWF4LCBvcHRpb25zKTtcblxuICAgICAgICBjYW5kaWRhdGVzID0gbmUudXRpbC5tYXAocGFyYW1zLnRpY2tDb3VudHMsIGZ1bmN0aW9uKHRpY2tDb3VudCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21ha2VUaWNrSW5mbyh7XG4gICAgICAgICAgICAgICAgdGlja0NvdW50OiB0aWNrQ291bnQsXG4gICAgICAgICAgICAgICAgc2NhbGU6IG5lLnV0aWwuZXh0ZW5kKHt9LCBzY2FsZSksXG4gICAgICAgICAgICAgICAgdXNlck1pbjogdXNlck1pbixcbiAgICAgICAgICAgICAgICB1c2VyTWF4OiB1c2VyTWF4LFxuICAgICAgICAgICAgICAgIGNoYXJ0VHlwZTogcGFyYW1zLmNoYXJ0VHlwZSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIHJldHVybiBjYW5kaWRhdGVzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGJhc2Ugc2NhbGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWluIG1pbmltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1heCBtYXhpbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7e21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19IG9wdGlvbnMgYXhpcyBvcHRpb25zXG4gICAgICogQHJldHVybnMge3ttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fSBiYXNlIHNjYWxlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUJhc2VTY2FsZTogZnVuY3Rpb24obWluLCBtYXgsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIGlzTWludXMgPSBmYWxzZSxcbiAgICAgICAgICAgIHRtcE1pbiwgc2NhbGU7XG5cbiAgICAgICAgaWYgKG1pbiA8IDAgJiYgbWF4IDw9IDApIHtcbiAgICAgICAgICAgIGlzTWludXMgPSB0cnVlO1xuICAgICAgICAgICAgdG1wTWluID0gbWluO1xuICAgICAgICAgICAgbWluID0gLW1heDtcbiAgICAgICAgICAgIG1heCA9IC10bXBNaW47XG4gICAgICAgIH1cblxuICAgICAgICBzY2FsZSA9IGNhbGN1bGF0b3IuY2FsY3VsYXRlU2NhbGUobWluLCBtYXgpO1xuXG4gICAgICAgIGlmIChpc01pbnVzKSB7XG4gICAgICAgICAgICB0bXBNaW4gPSBzY2FsZS5taW47XG4gICAgICAgICAgICBzY2FsZS5taW4gPSAtc2NhbGUubWF4O1xuICAgICAgICAgICAgc2NhbGUubWF4ID0gLXRtcE1pbjtcbiAgICAgICAgfVxuXG4gICAgICAgIHNjYWxlLm1pbiA9IG9wdGlvbnMubWluIHx8IHNjYWxlLm1pbjtcbiAgICAgICAgc2NhbGUubWF4ID0gb3B0aW9ucy5tYXggfHwgc2NhbGUubWF4O1xuXG4gICAgICAgIHJldHVybiBzY2FsZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRm9ybWF0IGxhYmVscy5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBsYWJlbHMgdGFyZ2V0IGxhYmVsc1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb25bXX0gZm9ybWF0RnVuY3Rpb25zIGZvcm1hdCBmdW5jdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nW119IGZvcm1hdHRlZCBsYWJlbHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9mb3JtYXRMYWJlbHM6IGZ1bmN0aW9uKGxhYmVscywgZm9ybWF0RnVuY3Rpb25zKSB7XG4gICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgIGlmICghZm9ybWF0RnVuY3Rpb25zIHx8ICFmb3JtYXRGdW5jdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gbGFiZWxzO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdCA9IG5lLnV0aWwubWFwKGxhYmVscywgZnVuY3Rpb24obGFiZWwpIHtcbiAgICAgICAgICAgIHZhciBmbnMgPSBjb25jYXQuYXBwbHkoW2xhYmVsXSwgZm9ybWF0RnVuY3Rpb25zKTtcbiAgICAgICAgICAgIHJldHVybiBuZS51dGlsLnJlZHVjZShmbnMsIGZ1bmN0aW9uKHN0b3JlZCwgZm4pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZm4oc3RvcmVkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGF4aXNEYXRhTWFrZXI7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgQm91bmRzIG1ha2VyLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2FsY3VsYXRvciA9IHJlcXVpcmUoJy4vY2FsY3VsYXRvci5qcycpLFxuICAgIHJlbmRlclV0aWwgPSByZXF1aXJlKCcuL3JlbmRlclV0aWwuanMnKTtcblxudmFyIENIQVJUX1BBRERJTkcgPSAxMCxcbiAgICBUSVRMRV9BRERfUEFERElORyA9IDIwLFxuICAgIExFR0VORF9BUkVBX1BBRERJTkcgPSAxMCxcbiAgICBMRUdFTkRfUkVDVF9XSURUSCA9IDEyLFxuICAgIExFR0VORF9MQUJFTF9QQURESU5HX0xFRlQgPSA1LFxuICAgIEFYSVNfTEFCRUxfUEFERElORyA9IDcsXG4gICAgSElEREVOX1dJRFRIID0gMTtcblxudmFyIGNvbmNhdCA9IEFycmF5LnByb3RvdHlwZS5jb25jYXQ7XG5cbi8qKlxuICogQm91bmRzIG1ha2VyLlxuICogQG1vZHVsZSBib3VuZHNNYWtlclxuICovXG52YXIgYm91bmRzTWFrZXIgPSB7XG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBib3VuZHMgYWJvdXQgY2hhcnQgY29tcG9uZW50cy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuY29udmVydERhdGEgY29udmVydGVkIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgY2hhcnQgdGhlbWVcbiAgICAgKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gcGFyYW1zLmlzVmVydGljYWwgd2hldGhlciB2ZXJ0aWNhbCBvciBub3RcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMub3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogQHJldHVybnMge3tcbiAgICAgKiAgIHBsb3Q6IHtcbiAgICAgKiAgICAgZGltZW5zaW9uOiB7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9LFxuICAgICAqICAgICBwb3NpdGlvbjoge3RvcDogbnVtYmVyLCByaWdodDogbnVtYmVyfVxuICAgICAqICAgfSxcbiAgICAgKiAgIHlBeGlzOiB7XG4gICAgICogICAgIGRpbWVuc2lvbjoge3dpZHRoOiAobnVtYmVyKSwgaGVpZ2h0OiBudW1iZXJ9LFxuICAgICAqICAgICBwb3NpdGlvbjoge3RvcDogbnVtYmVyfVxuICAgICAqICAgfSxcbiAgICAgKiAgIHhBeGlzOiB7XG4gICAgICogICAgIGRpbWVuc2lvbjoge3dpZHRoOiBudW1iZXIsIGhlaWdodDogKG51bWJlcil9LFxuICAgICAqICAgICBwb3NpdGlvbjoge3JpZ2h0OiBudW1iZXJ9XG4gICAgICogICB9LFxuICAgICAqICAgc2VyaWVzOiB7XG4gICAgICogICAgIGRpbWVuc2lvbjoge3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfSxcbiAgICAgKiAgICAgcG9zaXRpb246IHt0b3A6IG51bWJlciwgcmlnaHQ6IG51bWJlcn1cbiAgICAgKiAgIH0sXG4gICAgICogICBsZWdlbmQ6IHtcbiAgICAgKiAgICAgcG9zaXRpb246IHt0b3A6IG51bWJlcn1cbiAgICAgKiAgIH0sXG4gICAgICogICB0b29sdGlwOiB7XG4gICAgICogICAgIGRpbWVuc2lvbjoge3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfSxcbiAgICAgKiAgICAgcG9zaXRpb246IHt0b3A6IG51bWJlciwgbGVmdDogbnVtYmVyfVxuICAgICAqICAgfVxuICAgICAqIH19IGJvdW5kc1xuICAgICAqL1xuICAgIG1ha2U6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgZGltZW5zaW9ucyA9IHRoaXMuX2dldENvbXBvbmVudHNEaW1lbnNpb25zKHBhcmFtcyksXG4gICAgICAgICAgICB5QXhpc1dpZHRoID0gZGltZW5zaW9ucy55QXhpcy53aWR0aCxcbiAgICAgICAgICAgIHRvcCA9IGRpbWVuc2lvbnMudGl0bGUuaGVpZ2h0ICsgQ0hBUlRfUEFERElORyxcbiAgICAgICAgICAgIHJpZ2h0ID0gZGltZW5zaW9ucy5sZWdlbmQud2lkdGggKyBkaW1lbnNpb25zLnlyQXhpcy53aWR0aCArIENIQVJUX1BBRERJTkcsXG4gICAgICAgICAgICBheGVzQm91bmRzID0gdGhpcy5fbWFrZUF4ZXNCb3VuZHMoe1xuICAgICAgICAgICAgICAgIGhhc0F4ZXM6IHBhcmFtcy5oYXNBeGVzLFxuICAgICAgICAgICAgICAgIHlBeGlzQ2hhcnRUeXBlczogcGFyYW1zLnlBeGlzQ2hhcnRUeXBlcyxcbiAgICAgICAgICAgICAgICBkaW1lbnNpb25zOiBkaW1lbnNpb25zLFxuICAgICAgICAgICAgICAgIHRvcDogdG9wLFxuICAgICAgICAgICAgICAgIHJpZ2h0OiByaWdodFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBib3VuZHMgPSBuZS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgY2hhcnQ6IHtcbiAgICAgICAgICAgICAgICAgICAgZGltZW5zaW9uOiBkaW1lbnNpb25zLmNoYXJ0XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzZXJpZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgZGltZW5zaW9uOiBkaW1lbnNpb25zLnNlcmllcyxcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogdG9wLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmlnaHQ6IHJpZ2h0XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGxlZ2VuZDoge1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiBkaW1lbnNpb25zLnRpdGxlLmhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6IHlBeGlzV2lkdGggKyBkaW1lbnNpb25zLnBsb3Qud2lkdGggKyBkaW1lbnNpb25zLnlyQXhpcy53aWR0aCArIENIQVJUX1BBRERJTkdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdG9vbHRpcDoge1xuICAgICAgICAgICAgICAgICAgICBkaW1lbnNpb246IGRpbWVuc2lvbnMudG9vbHRpcCxcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogdG9wLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogeUF4aXNXaWR0aCArIENIQVJUX1BBRERJTkdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIGF4ZXNCb3VuZHMpO1xuICAgICAgICByZXR1cm4gYm91bmRzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgbWF4IGxhYmVsIG9mIHZhbHVlIGF4aXMuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGNvbnZlcnREYXRhIGNvbnZlcnQgZGF0YVxuICAgICAqIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGNoYXJ0VHlwZXMgY2hhcnQgdHlwZXNcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggY2hhcnQgdHlwZSBpbmRleFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ8c3RyaW5nfSBtYXggbGFiZWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRWYWx1ZUF4aXNNYXhMYWJlbDogZnVuY3Rpb24oY29udmVydERhdGEsIGNoYXJ0VHlwZXMsIGluZGV4KSB7XG4gICAgICAgIHZhciBjaGFydFR5cGUgPSBjaGFydFR5cGVzICYmIGNoYXJ0VHlwZXNbaW5kZXggfHwgMF0gfHwgJycsXG4gICAgICAgICAgICB2YWx1ZXMgPSBjaGFydFR5cGUgJiYgY29udmVydERhdGEudmFsdWVzW2NoYXJ0VHlwZV0gPyBjb252ZXJ0RGF0YS52YWx1ZXNbY2hhcnRUeXBlXSA6IGNvbnZlcnREYXRhLmpvaW5WYWx1ZXMsXG4gICAgICAgICAgICBmb3JtYXRGdW5jdGlvbnMgPSBjb252ZXJ0RGF0YS5mb3JtYXRGdW5jdGlvbnMsXG4gICAgICAgICAgICBmbGF0dGVuVmFsdWVzID0gY29uY2F0LmFwcGx5KFtdLCB2YWx1ZXMpLFxuICAgICAgICAgICAgbWluID0gbmUudXRpbC5taW4oZmxhdHRlblZhbHVlcyksXG4gICAgICAgICAgICBtYXggPSBuZS51dGlsLm1heChmbGF0dGVuVmFsdWVzKSxcbiAgICAgICAgICAgIHNjYWxlID0gY2FsY3VsYXRvci5jYWxjdWxhdGVTY2FsZShtaW4sIG1heCksXG4gICAgICAgICAgICBtaW5MYWJlbCA9IGNhbGN1bGF0b3Iubm9ybWFsaXplQXhpc051bWJlcihzY2FsZS5taW4pLFxuICAgICAgICAgICAgbWF4TGFiZWwgPSBjYWxjdWxhdG9yLm5vcm1hbGl6ZUF4aXNOdW1iZXIoc2NhbGUubWF4KSxcbiAgICAgICAgICAgIGZucyA9IGZvcm1hdEZ1bmN0aW9ucyAmJiBmb3JtYXRGdW5jdGlvbnMuc2xpY2UoKSB8fCBbXTtcbiAgICAgICAgbWF4TGFiZWwgPSAobWluTGFiZWwgKyAnJykubGVuZ3RoID4gKG1heExhYmVsICsgJycpLmxlbmd0aCA/IG1pbkxhYmVsIDogbWF4TGFiZWw7XG4gICAgICAgIGZucy51bnNoaWZ0KG1heExhYmVsKTtcbiAgICAgICAgbWF4TGFiZWwgPSBuZS51dGlsLnJlZHVjZShmbnMsIGZ1bmN0aW9uKHN0b3JlZCwgZm4pIHtcbiAgICAgICAgICAgIHJldHVybiBmbihzdG9yZWQpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIG1heExhYmVsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgUmVuZGVyZWQgTGFiZWxzIE1heCBTaXplKHdpZHRoIG9yIGhlaWdodClcbiAgICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBsYWJlbHMgbGFiZWxzXG4gICAgICogQHBhcmFtIHt7Zm9udFNpemU6IG51bWJlciwgZm9udEZhbWlseTogc3RyaW5nLCBjb2xvcjogc3RyaW5nfX0gdGhlbWUgbGFiZWwgdGhlbWVcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBpdGVyYXRlZSBpdGVyYXRlZVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IG1heCBzaXplICh3aWR0aCBvciBoZWlnaHQpXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0UmVuZGVyZWRMYWJlbHNNYXhTaXplOiBmdW5jdGlvbihsYWJlbHMsIHRoZW1lLCBpdGVyYXRlZSkge1xuICAgICAgICB2YXIgc2l6ZXMgPSBuZS51dGlsLm1hcChsYWJlbHMsIGZ1bmN0aW9uKGxhYmVsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0ZXJhdGVlKGxhYmVsLCB0aGVtZSk7XG4gICAgICAgICAgICB9LCB0aGlzKSxcbiAgICAgICAgICAgIG1heFNpemUgPSBuZS51dGlsLm1heChzaXplcyk7XG4gICAgICAgIHJldHVybiBtYXhTaXplO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgcmVuZGVyZWQgbGFiZWxzIG1heCB3aWR0aC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBsYWJlbHMgbGFiZWxzXG4gICAgICogQHBhcmFtIHt7Zm9udFNpemU6IG51bWJlciwgZm9udEZhbWlseTogc3RyaW5nLCBjb2xvcjogc3RyaW5nfX0gdGhlbWUgbGFiZWwgdGhlbWVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBtYXggd2lkdGhcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRSZW5kZXJlZExhYmVsc01heFdpZHRoOiBmdW5jdGlvbihsYWJlbHMsIHRoZW1lKSB7XG4gICAgICAgIHZhciBpdGVyYXRlZSA9IG5lLnV0aWwuYmluZChyZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxXaWR0aCwgcmVuZGVyVXRpbCksXG4gICAgICAgICAgICBtYXhXaWR0aCA9IHRoaXMuX2dldFJlbmRlcmVkTGFiZWxzTWF4U2l6ZShsYWJlbHMsIHRoZW1lLCBpdGVyYXRlZSk7XG4gICAgICAgIHJldHVybiBtYXhXaWR0aDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHJlbmRlcmVkIGxhYmVscyBtYXggaGVpZ2h0LlxuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IGxhYmVscyBsYWJlbHNcbiAgICAgKiBAcGFyYW0ge3tmb250U2l6ZTogbnVtYmVyLCBmb250RmFtaWx5OiBzdHJpbmcsIGNvbG9yOiBzdHJpbmd9fSB0aGVtZSBsYWJlbCB0aGVtZVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IG1heCBoZWlnaHRcbiAgICAgKi9cbiAgICBfZ2V0UmVuZGVyZWRMYWJlbHNNYXhIZWlnaHQ6IGZ1bmN0aW9uKGxhYmVscywgdGhlbWUpIHtcbiAgICAgICAgdmFyIGl0ZXJhdGVlID0gbmUudXRpbC5iaW5kKHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodCwgcmVuZGVyVXRpbCksXG4gICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9nZXRSZW5kZXJlZExhYmVsc01heFNpemUobGFiZWxzLCB0aGVtZSwgaXRlcmF0ZWUpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgd2lkdGggb2YgdmVydGljYWwgYXhpcyBhcmVhLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0aXRsZSBheGlzIHRpdGxlLFxuICAgICAqIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGxhYmVscyBheGlzIGxhYmVsc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBheGlzIHRoZW1lXG4gICAgICogQHJldHVybnMge251bWJlcn0gd2lkdGhcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRWZXJ0aWNhbEF4aXNXaWR0aDogZnVuY3Rpb24odGl0bGUsIGxhYmVscywgdGhlbWUpIHtcbiAgICAgICAgdmFyIHRpdGxlQXJlYVdpZHRoID0gcmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsSGVpZ2h0KHRpdGxlLCB0aGVtZS50aXRsZSkgKyBUSVRMRV9BRERfUEFERElORyxcbiAgICAgICAgICAgIHdpZHRoID0gdGhpcy5fZ2V0UmVuZGVyZWRMYWJlbHNNYXhXaWR0aChsYWJlbHMsIHRoZW1lLmxhYmVsKSArIHRpdGxlQXJlYVdpZHRoICsgQVhJU19MQUJFTF9QQURESU5HO1xuICAgICAgICByZXR1cm4gd2lkdGg7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBoZWlnaHQgb2YgaG9yaXpvbnRhbCBheGlzIGFyZWEuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRpdGxlIGF4aXMgdGl0bGUsXG4gICAgICogQHBhcmFtIHthcnJheS48c3RyaW5nPn0gbGFiZWxzIGF4aXMgbGFiZWxzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIGF4aXMgdGhlbWVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBoZWlnaHRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRIb3Jpem9udGFsQXhpc0hlaWdodDogZnVuY3Rpb24odGl0bGUsIGxhYmVscywgdGhlbWUpIHtcbiAgICAgICAgdmFyIHRpdGxlQXJlYUhlaWdodCA9IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodCh0aXRsZSwgdGhlbWUudGl0bGUpICsgVElUTEVfQUREX1BBRERJTkcsXG4gICAgICAgICAgICBoZWlnaHQgPSB0aGlzLl9nZXRSZW5kZXJlZExhYmVsc01heEhlaWdodChsYWJlbHMsIHRoZW1lLmxhYmVsKSArIHRpdGxlQXJlYUhlaWdodDtcbiAgICAgICAgcmV0dXJuIGhlaWdodDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHdpZHRoIGFib3V0IHkgcmlnaHQgYXhpc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48c3RyaW5nPn0gcGFyYW1zLnlBeGlzQ2hhcnRUeXBlcyBjaGFydCB0eXBlc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBjaGFydCB0aGVtZVxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5vcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSB5IHJpZ2h0IGF4aXMgd2lkdGhcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRZUkF4aXNXaWR0aDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciB5QXhpc0NoYXJ0VHlwZXMgPSBwYXJhbXMueUF4aXNDaGFydFR5cGVzIHx8IFtdLFxuICAgICAgICAgICAgcmlnaHRZQXhpc1dpZHRoID0gMCxcbiAgICAgICAgICAgIHlBeGlzVGhlbWVzLCB5QXhpc1RoZW1lLCB5QXhpc09wdGlvbnMsIGluZGV4LCBsYWJlbHMsIHRpdGxlO1xuICAgICAgICBpbmRleCA9IHlBeGlzQ2hhcnRUeXBlcy5sZW5ndGggLSAxO1xuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgICAgeUF4aXNUaGVtZXMgPSBbXS5jb25jYXQocGFyYW1zLnRoZW1lLnlBeGlzKTtcbiAgICAgICAgICAgIHlBeGlzT3B0aW9ucyA9IFtdLmNvbmNhdChwYXJhbXMub3B0aW9ucy55QXhpcyk7XG4gICAgICAgICAgICB0aXRsZSA9IHlBeGlzT3B0aW9uc1tpbmRleF0gJiYgeUF4aXNPcHRpb25zW2luZGV4XS50aXRsZTtcbiAgICAgICAgICAgIGxhYmVscyA9IFt0aGlzLl9nZXRWYWx1ZUF4aXNNYXhMYWJlbChwYXJhbXMuY29udmVydERhdGEsIHlBeGlzQ2hhcnRUeXBlcywgaW5kZXgpXTtcbiAgICAgICAgICAgIHlBeGlzVGhlbWUgPSB5QXhpc1RoZW1lcy5sZW5ndGggPT09IDEgPyB5QXhpc1RoZW1lc1swXSA6IHlBeGlzVGhlbWVzW2luZGV4XTtcbiAgICAgICAgICAgIHJpZ2h0WUF4aXNXaWR0aCA9IHRoaXMuX2dldFZlcnRpY2FsQXhpc1dpZHRoKHRpdGxlLCBsYWJlbHMsIHlBeGlzVGhlbWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByaWdodFlBeGlzV2lkdGg7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYXhlcyBkaW1lbnNpb24uXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmNvbnZlcnREYXRhIGNvbnZlcnRlZCBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIGNoYXJ0IHRoZW1lXG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5pc1ZlcnRpY2FsIHdoZXRoZXIgdmVydGljYWwgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHt7XG4gICAgICogICAgICB5QXhpczoge3dpZHRoOiBudW1iZXJ9LFxuICAgICAqICAgICAgeXJBeGlzOiB7d2lkdGg6IG51bWJlcn0sXG4gICAgICogICAgICB4QXhpczoge2hlaWdodDogbnVtYmVyfVxuICAgICAqIH19IGF4ZXMgZGltZW5zaW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUF4ZXNEaW1lbnNpb246IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgdGhlbWUsIG9wdGlvbnMsIGNvbnZlcnREYXRhLCB5QXhpc0NoYXJ0VHlwZXMsXG4gICAgICAgICAgICB5QXhpc1RpdGxlLCB4QXhpc1RpdGxlLCBtYXhMYWJlbCwgdkxhYmVscywgaExhYmVscyxcbiAgICAgICAgICAgIHlBeGlzV2lkdGgsIHhBeGlzSGVpZ2h0LCB5ckF4aXNXaWR0aDtcbiAgICAgICAgaWYgKCFwYXJhbXMuaGFzQXhlcykge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB5QXhpczoge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogMFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgeXJBeGlzOiB7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAwXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB4QXhpczoge1xuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IDBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgdGhlbWUgPSBwYXJhbXMudGhlbWU7XG4gICAgICAgIG9wdGlvbnMgPSBwYXJhbXMub3B0aW9ucztcbiAgICAgICAgY29udmVydERhdGEgPSBwYXJhbXMuY29udmVydERhdGE7XG4gICAgICAgIHlBeGlzQ2hhcnRUeXBlcyA9IHBhcmFtcy55QXhpc0NoYXJ0VHlwZXM7XG4gICAgICAgIHlBeGlzVGl0bGUgPSBvcHRpb25zLnlBeGlzICYmIG9wdGlvbnMueUF4aXMudGl0bGU7XG4gICAgICAgIHhBeGlzVGl0bGUgPSBvcHRpb25zLnhBeGlzICYmIG9wdGlvbnMueEF4aXMudGl0bGU7XG4gICAgICAgIG1heExhYmVsID0gdGhpcy5fZ2V0VmFsdWVBeGlzTWF4TGFiZWwoY29udmVydERhdGEsIHlBeGlzQ2hhcnRUeXBlcyk7XG4gICAgICAgIHZMYWJlbHMgPSBwYXJhbXMuaXNWZXJ0aWNhbCA/IFttYXhMYWJlbF0gOiBjb252ZXJ0RGF0YS5sYWJlbHM7XG4gICAgICAgIGhMYWJlbHMgPSBwYXJhbXMuaXNWZXJ0aWNhbCA/IGNvbnZlcnREYXRhLmxhYmVscyA6IFttYXhMYWJlbF07XG4gICAgICAgIHlBeGlzV2lkdGggPSB0aGlzLl9nZXRWZXJ0aWNhbEF4aXNXaWR0aCh5QXhpc1RpdGxlLCB2TGFiZWxzLCB0aGVtZS55QXhpcyk7XG4gICAgICAgIHhBeGlzSGVpZ2h0ID0gdGhpcy5fZ2V0SG9yaXpvbnRhbEF4aXNIZWlnaHQoeEF4aXNUaXRsZSwgaExhYmVscywgdGhlbWUueEF4aXMpO1xuICAgICAgICB5ckF4aXNXaWR0aCA9IHRoaXMuX2dldFlSQXhpc1dpZHRoKHtcbiAgICAgICAgICAgIGNvbnZlcnREYXRhOiBjb252ZXJ0RGF0YSxcbiAgICAgICAgICAgIHlBeGlzQ2hhcnRUeXBlczogeUF4aXNDaGFydFR5cGVzLFxuICAgICAgICAgICAgdGhlbWU6IHRoZW1lLFxuICAgICAgICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeUF4aXM6IHtcbiAgICAgICAgICAgICAgICB3aWR0aDogeUF4aXNXaWR0aFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHlyQXhpczoge1xuICAgICAgICAgICAgICAgIHdpZHRoOiB5ckF4aXNXaWR0aFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHhBeGlzOiB7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiB4QXhpc0hlaWdodFxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgd2lkdGggb2YgbGVnZW5kIGFyZWEuXG4gICAgICogQHBhcmFtIHthcnJheS48c3RyaW5nPn0gam9pbkxlZ2VuZExhYmVscyBsZWdlbmQgbGFiZWxzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGxhYmVsVGhlbWUgbGFiZWwgdGhlbWVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSB3aWR0aFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldExlZ2VuZEFyZWFXaWR0aDogZnVuY3Rpb24oam9pbkxlZ2VuZExhYmVscywgbGFiZWxUaGVtZSkge1xuICAgICAgICB2YXIgbGVnZW5kTGFiZWxzID0gbmUudXRpbC5tYXAoam9pbkxlZ2VuZExhYmVscywgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpdGVtLmxhYmVsO1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBtYXhMYWJlbFdpZHRoID0gdGhpcy5fZ2V0UmVuZGVyZWRMYWJlbHNNYXhXaWR0aChsZWdlbmRMYWJlbHMsIGxhYmVsVGhlbWUpLFxuICAgICAgICAgICAgbGVnZW5kV2lkdGggPSBtYXhMYWJlbFdpZHRoICsgTEVHRU5EX1JFQ1RfV0lEVEggK1xuICAgICAgICAgICAgICAgIExFR0VORF9MQUJFTF9QQURESU5HX0xFRlQgKyAoTEVHRU5EX0FSRUFfUEFERElORyAqIDIpO1xuICAgICAgICByZXR1cm4gbGVnZW5kV2lkdGg7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2Ugc2VyaWVzIGRpbWVuc2lvbi5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gcGFyYW1zLmNoYXJ0RGltZW5zaW9uIGNoYXJ0IGRpbWVuc2lvblxuICAgICAqICAgICAgQHBhcmFtIHt7XG4gICAgICogICAgICAgICAgeUF4aXM6IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6bnVtYmVyfSxcbiAgICAgKiAgICAgICAgICB4QXhpczoge3dpZHRoOiBudW1iZXIsIGhlaWdodDpudW1iZXJ9LFxuICAgICAqICAgICAgICAgIHlyQXhpczoge3dpZHRoOiBudW1iZXIsIGhlaWdodDpudW1iZXJ9XG4gICAgICogICAgICB9fSBwYXJhbXMuYXhlc0RpbWVuc2lvbiBheGVzIGRpbWVuc2lvblxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5sZWdlbmRXaWR0aCBsZWdlbmQgd2lkdGhcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMudGl0bGVIZWlnaHQgdGl0bGUgaGVpZ2h0XG4gICAgICogQHJldHVybnMge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IHNlcmllcyBkaW1lbnNpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlU2VyaWVzRGltZW5zaW9uOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGF4ZXNEaW1lbnNpb24gPSBwYXJhbXMuYXhlc0RpbWVuc2lvbixcbiAgICAgICAgICAgIHJpZ2h0QXJlYVdpZHRoID0gcGFyYW1zLmxlZ2VuZFdpZHRoICsgYXhlc0RpbWVuc2lvbi55ckF4aXMud2lkdGgsXG4gICAgICAgICAgICB3aWR0aCA9IHBhcmFtcy5jaGFydERpbWVuc2lvbi53aWR0aCAtIChDSEFSVF9QQURESU5HICogMikgLSBheGVzRGltZW5zaW9uLnlBeGlzLndpZHRoIC0gcmlnaHRBcmVhV2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQgPSBwYXJhbXMuY2hhcnREaW1lbnNpb24uaGVpZ2h0IC0gKENIQVJUX1BBRERJTkcgKiAyKSAtIHBhcmFtcy50aXRsZUhlaWdodCAtIGF4ZXNEaW1lbnNpb24ueEF4aXMuaGVpZ2h0O1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBoZWlnaHRcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNvbXBvbmVudHMgZGltZW5zaW9uXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmNvbnZlcnREYXRhIGNvbnZlcnRlZCBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIGNoYXJ0IHRoZW1lXG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5pc1ZlcnRpY2FsIHdoZXRoZXIgdmVydGljYWwgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IGNvbXBvbmVudHMgZGltZW5zaW9uc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldENvbXBvbmVudHNEaW1lbnNpb25zOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIHRoZW1lID0gcGFyYW1zLnRoZW1lLFxuICAgICAgICAgICAgb3B0aW9ucyA9IHBhcmFtcy5vcHRpb25zLFxuICAgICAgICAgICAgY29udmVydERhdGEgPSBwYXJhbXMuY29udmVydERhdGEsXG4gICAgICAgICAgICBjaGFydE9wdGlvbnMgPSBvcHRpb25zLmNoYXJ0IHx8IHt9LFxuICAgICAgICAgICAgY2hhcnREaW1lbnNpb24gPSB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IGNoYXJ0T3B0aW9ucy53aWR0aCB8fCA1MDAsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBjaGFydE9wdGlvbnMuaGVpZ2h0IHx8IDQwMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGF4ZXNEaW1lbnNpb24sIHRpdGxlSGVpZ2h0LCBsZWdlbmRXaWR0aCwgc2VyaWVzRGltZW5zaW9uLCBkaW1lbnNpb25zO1xuXG4gICAgICAgIGF4ZXNEaW1lbnNpb24gPSB0aGlzLl9tYWtlQXhlc0RpbWVuc2lvbihwYXJhbXMpO1xuICAgICAgICB0aXRsZUhlaWdodCA9IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodChjaGFydE9wdGlvbnMudGl0bGUsIHRoZW1lLnRpdGxlKSArIFRJVExFX0FERF9QQURESU5HO1xuICAgICAgICBsZWdlbmRXaWR0aCA9IHRoaXMuX2dldExlZ2VuZEFyZWFXaWR0aChjb252ZXJ0RGF0YS5qb2luTGVnZW5kTGFiZWxzLCB0aGVtZS5sZWdlbmQubGFiZWwpO1xuICAgICAgICBzZXJpZXNEaW1lbnNpb24gPSB0aGlzLl9tYWtlU2VyaWVzRGltZW5zaW9uKHtcbiAgICAgICAgICAgIGNoYXJ0RGltZW5zaW9uOiBjaGFydERpbWVuc2lvbixcbiAgICAgICAgICAgIGF4ZXNEaW1lbnNpb246IGF4ZXNEaW1lbnNpb24sXG4gICAgICAgICAgICBsZWdlbmRXaWR0aDogbGVnZW5kV2lkdGgsXG4gICAgICAgICAgICB0aXRsZUhlaWdodDogdGl0bGVIZWlnaHRcbiAgICAgICAgfSk7XG4gICAgICAgIGRpbWVuc2lvbnMgPSBuZS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICBjaGFydDogY2hhcnREaW1lbnNpb24sXG4gICAgICAgICAgICB0aXRsZToge1xuICAgICAgICAgICAgICAgIGhlaWdodDogdGl0bGVIZWlnaHRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwbG90OiBzZXJpZXNEaW1lbnNpb24sXG4gICAgICAgICAgICBzZXJpZXM6IHNlcmllc0RpbWVuc2lvbixcbiAgICAgICAgICAgIGxlZ2VuZDoge1xuICAgICAgICAgICAgICAgIHdpZHRoOiBsZWdlbmRXaWR0aFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRvb2x0aXA6IHNlcmllc0RpbWVuc2lvblxuICAgICAgICB9LCBheGVzRGltZW5zaW9uKTtcbiAgICAgICAgcmV0dXJuIGRpbWVuc2lvbnM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYXhlcyBib3VuZHMuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5oYXNBeGVzIHdoZXRoZXIgaGFzIGF4ZWQgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBwYXJhbXMueUF4aXNDaGFydFR5cGVzIHkgYXhpcyBjaGFydCB0eXBlc1xuICAgICAqICAgICAgQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBwYXJhbXMuZGltZW5zaW9uIGNoYXJ0IGRpbWVuc2lvblxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy50b3AgdG9wIHBvc2l0aW9uXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnJpZ2h0IHJpZ2h0IHBvc2l0aW9uXG4gICAgICogQHJldHVybnMge29iamVjdH0gYXhlcyBib3VuZHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQXhlc0JvdW5kczogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBib3VuZHMsIGRpbWVuc2lvbnMsIHlBeGlzQ2hhcnRUeXBlcywgdG9wLCByaWdodDtcblxuICAgICAgICBpZiAoIXBhcmFtcy5oYXNBeGVzKSB7XG4gICAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgIH1cblxuICAgICAgICBkaW1lbnNpb25zID0gcGFyYW1zLmRpbWVuc2lvbnM7XG4gICAgICAgIHlBeGlzQ2hhcnRUeXBlcyA9IHBhcmFtcy55QXhpc0NoYXJ0VHlwZXM7XG4gICAgICAgIHRvcCA9IHBhcmFtcy50b3A7XG4gICAgICAgIHJpZ2h0ID0gcGFyYW1zLnJpZ2h0O1xuICAgICAgICBib3VuZHMgPSB7XG4gICAgICAgICAgICBwbG90OiB7XG4gICAgICAgICAgICAgICAgZGltZW5zaW9uOiBkaW1lbnNpb25zLnBsb3QsXG4gICAgICAgICAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgdG9wOiB0b3AsXG4gICAgICAgICAgICAgICAgICAgIHJpZ2h0OiByaWdodFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB5QXhpczoge1xuICAgICAgICAgICAgICAgIGRpbWVuc2lvbjoge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogZGltZW5zaW9ucy55QXhpcy53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBkaW1lbnNpb25zLnBsb3QuaGVpZ2h0XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICB0b3A6IHRvcCxcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogQ0hBUlRfUEFERElORyArIEhJRERFTl9XSURUSFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB4QXhpczoge1xuICAgICAgICAgICAgICAgIGRpbWVuc2lvbjoge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogZGltZW5zaW9ucy5wbG90LndpZHRoLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IGRpbWVuc2lvbnMueEF4aXMuaGVpZ2h0XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICB0b3A6IHRvcCArIGRpbWVuc2lvbnMucGxvdC5oZWlnaHQgLSBISURERU5fV0lEVEgsXG4gICAgICAgICAgICAgICAgICAgIHJpZ2h0OiByaWdodFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoeUF4aXNDaGFydFR5cGVzICYmIHlBeGlzQ2hhcnRUeXBlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGJvdW5kcy55ckF4aXMgPSB7XG4gICAgICAgICAgICAgICAgZGltZW5zaW9uOiB7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiBkaW1lbnNpb25zLnlyQXhpcy53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBkaW1lbnNpb25zLnBsb3QuaGVpZ2h0XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICB0b3A6IHRvcCxcbiAgICAgICAgICAgICAgICAgICAgcmlnaHQ6IGRpbWVuc2lvbnMubGVnZW5kLndpZHRoICsgQ0hBUlRfUEFERElORyArIEhJRERFTl9XSURUSFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYm91bmRzO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gYm91bmRzTWFrZXI7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgY2FsY3VsYXRvci5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIEFYSVNfU1RBTkRBUkRfTVVMVElQTEVfTlVNUyA9IFsxLCAyLCA1LCAxMF07XG5cbnZhciBjYWxjdWxhdG9yID0ge1xuICAgIC8qKlxuICAgICAqIENhbGN1bGF0ZSBzY2FsZSBmcm9tIGNoYXJ0IG1pbiwgbWF4IGRhdGEuXG4gICAgICogIC0gaHR0cDovL3BlbHRpZXJ0ZWNoLmNvbS9ob3ctZXhjZWwtY2FsY3VsYXRlcy1hdXRvbWF0aWMtY2hhcnQtYXhpcy1saW1pdHMvXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1pbiBtaW4gbWluaW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWF4IG1heCBtYXhpbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB0aWNrQ291bnQgdGljayBjb3VudFxuICAgICAqIEByZXR1cm5zIHt7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX0gc2NhbGUgYXhpcyBzY2FsZVxuICAgICAqL1xuICAgIGNhbGN1bGF0ZVNjYWxlOiBmdW5jdGlvbihtaW4sIG1heCkge1xuICAgICAgICB2YXIgc2F2ZU1pbiA9IDAsXG4gICAgICAgICAgICBzY2FsZSA9IHt9LFxuICAgICAgICAgICAgaW9kVmFsdWU7IC8vIGluY3JlYXNlIG9yIGRlY3JlYXNlIHZhbHVlO1xuXG4gICAgICAgIGlmIChtaW4gPCAwKSB7XG4gICAgICAgICAgICBzYXZlTWluID0gbWluO1xuICAgICAgICAgICAgbWF4IC09IG1pbjtcbiAgICAgICAgICAgIG1pbiA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICBpb2RWYWx1ZSA9IChtYXggLSBtaW4pIC8gMjA7XG4gICAgICAgIHNjYWxlLm1heCA9IG1heCArIGlvZFZhbHVlICsgc2F2ZU1pbjtcblxuICAgICAgICBpZiAobWF4IC8gNiA+IG1pbikge1xuICAgICAgICAgICAgc2NhbGUubWluID0gMCArIHNhdmVNaW47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzY2FsZS5taW4gPSBtaW4gLSBpb2RWYWx1ZSArIHNhdmVNaW47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNjYWxlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBub3JtYWxpemUgbnVtYmVyLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSB0YXJnZXQgdmFsdWVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBub3JtYWxpemVkIG51bWJlclxuICAgICAqL1xuICAgIG5vcm1hbGl6ZUF4aXNOdW1iZXI6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHZhciBzdGFuZGFyZCA9IDAsXG4gICAgICAgICAgICBmbGFnID0gMSxcbiAgICAgICAgICAgIG5vcm1hbGl6ZWQsIG1vZDtcblxuICAgICAgICBpZiAodmFsdWUgPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfSBlbHNlIGlmICh2YWx1ZSA8IDApIHtcbiAgICAgICAgICAgIGZsYWcgPSAtMTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhbHVlICo9IGZsYWc7XG5cbiAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkoQVhJU19TVEFOREFSRF9NVUxUSVBMRV9OVU1TLCBmdW5jdGlvbihudW0pIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA8IG51bSkge1xuICAgICAgICAgICAgICAgIGlmIChudW0gPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YW5kYXJkID0gbnVtO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG51bSA9PT0gMTApIHtcbiAgICAgICAgICAgICAgICBzdGFuZGFyZCA9IDEwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoc3RhbmRhcmQgPCAxKSB7XG4gICAgICAgICAgICBub3JtYWxpemVkID0gdGhpcy5ub3JtYWxpemVBeGlzTnVtYmVyKHZhbHVlICogMTApICogMC4xO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbW9kID0gbmUudXRpbC5tb2QodmFsdWUsIHN0YW5kYXJkKTtcbiAgICAgICAgICAgIG5vcm1hbGl6ZWQgPSBuZS51dGlsLmFkZGl0aW9uKHZhbHVlLCAobW9kID4gMCA/IHN0YW5kYXJkIC0gbW9kIDogMCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5vcm1hbGl6ZWQgKj0gZmxhZztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gTWFrZSB0aWNrIHBvc2l0aW9ucyBvZiBwaXhlbCB0eXBlLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzaXplIGFyZWEgd2lkdGggb3IgaGVpZ2h0XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGNvdW50IHRpY2sgY291bnRcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPG51bWJlcj59IHBvc2l0aW9uc1xuICAgICAqL1xuICAgIG1ha2VQaXhlbFBvc2l0aW9uczogZnVuY3Rpb24oc2l6ZSwgY291bnQpIHtcbiAgICAgICAgdmFyIHBvc2l0aW9ucyA9IFtdLFxuICAgICAgICAgICAgcHhTY2FsZSwgcHhTdGVwO1xuXG4gICAgICAgIGlmIChjb3VudCA+IDApIHtcbiAgICAgICAgICAgIHB4U2NhbGUgPSB7bWluOiAwLCBtYXg6IHNpemUgLSAxfTtcbiAgICAgICAgICAgIHB4U3RlcCA9IHRoaXMuZ2V0U2NhbGVTdGVwKHB4U2NhbGUsIGNvdW50KTtcbiAgICAgICAgICAgIHBvc2l0aW9ucyA9IG5lLnV0aWwubWFwKG5lLnV0aWwucmFuZ2UoMCwgc2l6ZSwgcHhTdGVwKSwgZnVuY3Rpb24ocG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWF0aC5yb3VuZChwb3NpdGlvbik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHBvc2l0aW9uc1twb3NpdGlvbnMubGVuZ3RoIC0gMV0gPSBzaXplIC0gMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcG9zaXRpb25zO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGxhYmVscyBmcm9tIHNjYWxlLlxuICAgICAqIEBwYXJhbSB7e21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19IHNjYWxlIGF4aXMgc2NhbGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3RlcCBzdGVwIGJldHdlZW4gbWF4IGFuZCBtaW5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nW119IGxhYmVsc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgbWFrZUxhYmVsc0Zyb21TY2FsZTogZnVuY3Rpb24oc2NhbGUsIHN0ZXApIHtcbiAgICAgICAgdmFyIG11bHRpcGxlTnVtID0gbmUudXRpbC5maW5kTXVsdGlwbGVOdW0oc3RlcCksXG4gICAgICAgICAgICBtaW4gPSBzY2FsZS5taW4gKiBtdWx0aXBsZU51bSxcbiAgICAgICAgICAgIG1heCA9IHNjYWxlLm1heCAqIG11bHRpcGxlTnVtLFxuICAgICAgICAgICAgbGFiZWxzID0gbmUudXRpbC5yYW5nZShtaW4sIG1heCArIDEsIHN0ZXAgKiBtdWx0aXBsZU51bSk7XG4gICAgICAgIGxhYmVscyA9IG5lLnV0aWwubWFwKGxhYmVscywgZnVuY3Rpb24obGFiZWwpIHtcbiAgICAgICAgICAgIHJldHVybiBsYWJlbCAvIG11bHRpcGxlTnVtO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGxhYmVscztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHNjYWxlIHN0ZXAuXG4gICAgICogQHBhcmFtIHt7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX0gc2NhbGUgYXhpcyBzY2FsZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjb3VudCB2YWx1ZSBjb3VudFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IHNjYWxlIHN0ZXBcbiAgICAgKi9cbiAgICBnZXRTY2FsZVN0ZXA6IGZ1bmN0aW9uKHNjYWxlLCBjb3VudCkge1xuICAgICAgICByZXR1cm4gKHNjYWxlLm1heCAtIHNjYWxlLm1pbikgLyAoY291bnQgLSAxKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXJyYXkgcGl2b3QuXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXk+fSBhcnIyZCB0YXJnZXQgMmQgYXJyYXlcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5Pn0gcGl2b3RlZCAyZCBhcnJheVxuICAgICAqL1xuICAgIGFycmF5UGl2b3Q6IGZ1bmN0aW9uKGFycjJkKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkoYXJyMmQsIGZ1bmN0aW9uKGFycikge1xuICAgICAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkoYXJyLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXJlc3VsdFtpbmRleF0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2luZGV4XSA9IFtdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXN1bHRbaW5kZXhdLnB1c2godmFsdWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gY2FsY3VsYXRvcjtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBEYXRhIGNvbnZlcnRlci5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGNhbGN1bGF0b3IgPSByZXF1aXJlKCcuL2NhbGN1bGF0b3IuanMnKTtcblxudmFyIGNvbmNhdCA9IEFycmF5LnByb3RvdHlwZS5jb25jYXQ7XG5cbi8qKlxuICogRGF0YSBjb252ZXJ0ZXIuXG4gKiBAbW9kdWxlIGRhdGFDb252ZXJ0ZXJcbiAqL1xudmFyIGRhdGFDb252ZXJ0ZXIgPSB7XG4gICAgLyoqXG4gICAgICogQ29udmVydCB1c2VyIGRhdGEuXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXk+fSB1c2VyRGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjaGFydE9wdGlvbnMgY2hhcnQgb3B0aW9uXG4gICAgICogQHJldHVybnMge3tcbiAgICAgKiAgICAgIGxhYmVsczogYXJyYXkuPHN0cmluZz4sXG4gICAgICogICAgICB2YWx1ZXM6IGFycmF5LjxudW1iZXI+LFxuICAgICAqICAgICAgbGVnZW5kTGFiZWxzOiBhcnJheS48c3RyaW5nPixcbiAgICAgKiAgICAgIGZvcm1hdEZ1bmN0aW9uczogYXJyYXkuPGZ1bmN0aW9uPixcbiAgICAgKiAgICAgIGZvcm1hdHRlZFZhbHVlczogYXJyYXkuPHN0cmluZz5cbiAgICAgKiB9fSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqL1xuICAgIGNvbnZlcnQ6IGZ1bmN0aW9uKHVzZXJEYXRhLCBjaGFydE9wdGlvbnMsIGNoYXJ0VHlwZSkge1xuICAgICAgICB2YXIgbGFiZWxzID0gdXNlckRhdGEuY2F0ZWdvcmllcyxcbiAgICAgICAgICAgIHNlcmllc0RhdGEgPSB1c2VyRGF0YS5zZXJpZXMsXG4gICAgICAgICAgICB2YWx1ZXMgPSB0aGlzLl9waWNrVmFsdWVzKHNlcmllc0RhdGEpLFxuICAgICAgICAgICAgam9pblZhbHVlcyA9IHRoaXMuX2pvaW5WYWx1ZXModmFsdWVzKSxcbiAgICAgICAgICAgIGxlZ2VuZExhYmVscyA9IHRoaXMuX3BpY2tMZWdlbmRMYWJlbHMoc2VyaWVzRGF0YSksXG4gICAgICAgICAgICBqb2luTGVnZW5kTGFiZWxzID0gdGhpcy5fam9pbkxlZ2VuZExhYmVscyhsZWdlbmRMYWJlbHMsIGNoYXJ0VHlwZSksXG4gICAgICAgICAgICBmb3JtYXQgPSBjaGFydE9wdGlvbnMgJiYgY2hhcnRPcHRpb25zLmZvcm1hdCB8fCAnJyxcbiAgICAgICAgICAgIGZvcm1hdEZ1bmN0aW9ucyA9IHRoaXMuX2ZpbmRGb3JtYXRGdW5jdGlvbnMoZm9ybWF0KSxcbiAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlcyA9IGZvcm1hdCA/IHRoaXMuX2Zvcm1hdFZhbHVlcyh2YWx1ZXMsIGZvcm1hdEZ1bmN0aW9ucykgOiB2YWx1ZXM7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsYWJlbHM6IGxhYmVscyxcbiAgICAgICAgICAgIHZhbHVlczogdmFsdWVzLFxuICAgICAgICAgICAgam9pblZhbHVlczogam9pblZhbHVlcyxcbiAgICAgICAgICAgIGxlZ2VuZExhYmVsczogbGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgam9pbkxlZ2VuZExhYmVsczogam9pbkxlZ2VuZExhYmVscyxcbiAgICAgICAgICAgIGZvcm1hdEZ1bmN0aW9uczogZm9ybWF0RnVuY3Rpb25zLFxuICAgICAgICAgICAgZm9ybWF0dGVkVmFsdWVzOiBmb3JtYXR0ZWRWYWx1ZXNcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2VwYXJhdGUgbGFiZWwuXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXkuPGFycmF5Pj59IHVzZXJEYXRhIHVzZXIgZGF0YVxuICAgICAqIEByZXR1cm5zIHt7bGFiZWxzOiAoYXJyYXkuPHN0cmluZz4pLCBzb3VyY2VEYXRhOiBhcnJheS48YXJyYXkuPGFycmF5Pj59fSByZXN1bHQgZGF0YVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NlcGFyYXRlTGFiZWw6IGZ1bmN0aW9uKHVzZXJEYXRhKSB7XG4gICAgICAgIHZhciBsYWJlbHMgPSB1c2VyRGF0YVswXS5wb3AoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxhYmVsczogbGFiZWxzLFxuICAgICAgICAgICAgc291cmNlRGF0YTogdXNlckRhdGFcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUGljayB2YWx1ZS5cbiAgICAgKiBAcGFyYW0ge2FycmF5fSBpdGVtcyBpdGVtc1xuICAgICAqIEByZXR1cm5zIHthcnJheX0gcGlja2VkIHZhbHVlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcGlja1ZhbHVlOiBmdW5jdGlvbihpdGVtcykge1xuICAgICAgICByZXR1cm4gW10uY29uY2F0KGl0ZW1zLmRhdGEpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBQaWNrIHZhbHVlcyBmcm9tIGF4aXMgZGF0YS5cbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheT59IHNlcmllc0RhdGEgc2VyaWVzIGRhdGFcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nW119IHZhbHVlc1xuICAgICAqL1xuICAgIF9waWNrVmFsdWVzOiBmdW5jdGlvbihzZXJpZXNEYXRhKSB7XG4gICAgICAgIHZhciB2YWx1ZXMsIHJlc3VsdDtcbiAgICAgICAgaWYgKG5lLnV0aWwuaXNBcnJheShzZXJpZXNEYXRhKSkge1xuICAgICAgICAgICAgdmFsdWVzID0gbmUudXRpbC5tYXAoc2VyaWVzRGF0YSwgdGhpcy5fcGlja1ZhbHVlLCB0aGlzKTtcbiAgICAgICAgICAgIHJlc3VsdCA9IGNhbGN1bGF0b3IuYXJyYXlQaXZvdCh2YWx1ZXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0ID0ge307XG4gICAgICAgICAgICBuZS51dGlsLmZvckVhY2goc2VyaWVzRGF0YSwgZnVuY3Rpb24oZ3JvdXBWYWx1ZXMsIHR5cGUpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZXMgPSBuZS51dGlsLm1hcChncm91cFZhbHVlcywgdGhpcy5fcGlja1ZhbHVlLCB0aGlzKTtcbiAgICAgICAgICAgICAgICByZXN1bHRbdHlwZV0gPSBjYWxjdWxhdG9yLmFycmF5UGl2b3QodmFsdWVzKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIF9qb2luVmFsdWVzOiBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgdmFyIGpvaW5WYWx1ZXM7XG5cbiAgICAgICAgaWYgKG5lLnV0aWwuaXNBcnJheSh2YWx1ZXMpKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWVzO1xuICAgICAgICB9XG5cbiAgICAgICAgam9pblZhbHVlcyA9IG5lLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24oZ3JvdXBWYWx1ZXMpIHtcbiAgICAgICAgICAgIHJldHVybiBncm91cFZhbHVlcztcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgcmV0dXJuIGNvbmNhdC5hcHBseShbXSwgam9pblZhbHVlcyk7XG4gICAgfSxcblxuICAgIF9waWNrTGVnZW5kTGFiZWw6IGZ1bmN0aW9uKGl0ZW1zKSB7XG4gICAgICAgIHJldHVybiBpdGVtcy5uYW1lO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBQaWNrIGxlZ2VuZCBsYWJlbHMgZnJvbSBheGlzIGRhdGEuXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXk+fSBzZXJpZXNEYXRhIHNlcmllcyBkYXRhXG4gICAgICogQHJldHVybnMge3N0cmluZ1tdfSBsYWJlbHNcbiAgICAgKi9cbiAgICBfcGlja0xlZ2VuZExhYmVsczogZnVuY3Rpb24oc2VyaWVzRGF0YSkge1xuICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICBpZiAobmUudXRpbC5pc0FycmF5KHNlcmllc0RhdGEpKSB7XG4gICAgICAgICAgICByZXN1bHQgPSBuZS51dGlsLm1hcChzZXJpZXNEYXRhLCB0aGlzLl9waWNrTGVnZW5kTGFiZWwsIHRoaXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0ID0ge307XG4gICAgICAgICAgICBuZS51dGlsLmZvckVhY2goc2VyaWVzRGF0YSwgZnVuY3Rpb24oZ3JvdXBWYWx1ZXMsIHR5cGUpIHtcbiAgICAgICAgICAgICAgICByZXN1bHRbdHlwZV0gPSBuZS51dGlsLm1hcChncm91cFZhbHVlcywgdGhpcy5fcGlja0xlZ2VuZExhYmVsLCB0aGlzKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIF9qb2luTGVnZW5kTGFiZWxzOiBmdW5jdGlvbihsZWdlbmRMYWJlbHMsIGNoYXJ0VHlwZSkge1xuICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICBpZiAobmUudXRpbC5pc0FycmF5KGxlZ2VuZExhYmVscykpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IG5lLnV0aWwubWFwKGxlZ2VuZExhYmVscywgZnVuY3Rpb24obGFiZWwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBjaGFydFR5cGU6IGNoYXJ0VHlwZSxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGxhYmVsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0ID0gbmUudXRpbC5tYXAobGVnZW5kTGFiZWxzLCBmdW5jdGlvbihsYWJlbHMsIF9jaGFydFR5cGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAobGFiZWxzLCBmdW5jdGlvbihsYWJlbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnRUeXBlOiBfY2hhcnRUeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGxhYmVsXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgICAgIHJlc3VsdCA9IGNvbmNhdC5hcHBseShbXSwgcmVzdWx0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBmb3JtYXQgZ3JvdXAgdmFsdWVzLlxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gZ3JvdXBWYWx1ZXMgZ3JvdXAgdmFsdWVzXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbltdfSBmb3JtYXRGdW5jdGlvbnMgZm9ybWF0IGZ1bmN0aW9uc1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmdbXX0gZm9ybWF0dGVkIHZhbHVlc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2Zvcm1hdEdyb3VwVmFsdWVzOiBmdW5jdGlvbihncm91cFZhbHVlcywgZm9ybWF0RnVuY3Rpb25zKSB7XG4gICAgICAgIHJldHVybiBuZS51dGlsLm1hcChncm91cFZhbHVlcywgZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHZhciBmbnMgPSBbdmFsdWVdLmNvbmNhdChmb3JtYXRGdW5jdGlvbnMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZS51dGlsLnJlZHVjZShmbnMsIGZ1bmN0aW9uKHN0b3JlZCwgZm4pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZuKHN0b3JlZCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIGZvcm1hdCBjb252ZXJ0ZWQgdmFsdWVzLlxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gY2hhcnRWYWx1ZXMgY2hhcnQgdmFsdWVzXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbltdfSBmb3JtYXRGdW5jdGlvbnMgZm9ybWF0IGZ1bmN0aW9uc1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmdbXX0gZm9ybWF0dGVkIHZhbHVlc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2Zvcm1hdFZhbHVlczogZnVuY3Rpb24oY2hhcnRWYWx1ZXMsIGZvcm1hdEZ1bmN0aW9ucykge1xuICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICBpZiAobmUudXRpbC5pc0FycmF5KGNoYXJ0VmFsdWVzKSkge1xuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5fZm9ybWF0R3JvdXBWYWx1ZXMoY2hhcnRWYWx1ZXMsIGZvcm1hdEZ1bmN0aW9ucyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQgPSB7fTtcbiAgICAgICAgICAgIG5lLnV0aWwuZm9yRWFjaChjaGFydFZhbHVlcywgZnVuY3Rpb24oZ3JvdXBWYWx1ZXMsIGNoYXJ0VHlwZSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdFtjaGFydFR5cGVdID0gdGhpcy5fZm9ybWF0R3JvdXBWYWx1ZXMoZ3JvdXBWYWx1ZXMsIGZvcm1hdEZ1bmN0aW9ucyk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBQaWNrIG1heCBsZW5ndGggdW5kZXIgcG9pbnQuXG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gdmFsdWVzIGNoYXJ0IHZhbHVlc1xuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IG1heCBsZW5ndGggdW5kZXIgcG9pbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9waWNrTWF4TGVuVW5kZXJQb2ludDogZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgIHZhciBtYXggPSAwO1xuXG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KHZhbHVlcywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBsZW4gPSBuZS51dGlsLmxlbmd0aEFmdGVyUG9pbnQodmFsdWUpO1xuICAgICAgICAgICAgaWYgKGxlbiA+IG1heCkge1xuICAgICAgICAgICAgICAgIG1heCA9IGxlbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgcmV0dXJuIG1heDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB6ZXJvIGZpbGwgZm9ybWF0IG9yIG5vdC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZm9ybWF0IGZvcm1hdFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSByZXN1bHQgYm9vbGVhblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2lzWmVyb0ZpbGw6IGZ1bmN0aW9uKGZvcm1hdCkge1xuICAgICAgICByZXR1cm4gZm9ybWF0Lmxlbmd0aCA+IDIgJiYgZm9ybWF0LmNoYXJBdCgwKSA9PT0gJzAnO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIGRlY2ltYWwgZm9ybWF0IG9yIG5vdC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZm9ybWF0IGZvcm1hdFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSByZXN1bHQgYm9vbGVhblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2lzRGVjaW1hbDogZnVuY3Rpb24oZm9ybWF0KSB7XG4gICAgICAgIHZhciBpbmRleE9mID0gZm9ybWF0LmluZGV4T2YoJy4nKTtcbiAgICAgICAgcmV0dXJuIGluZGV4T2YgPiAtMSAmJiBpbmRleE9mIDwgZm9ybWF0Lmxlbmd0aCAtIDE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgY29tbWEgZm9ybWF0IG9yIG5vdC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZm9ybWF0IGZvcm1hdFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSByZXN1bHQgYm9vbGVhblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2lzQ29tbWE6IGZ1bmN0aW9uKGZvcm1hdCkge1xuICAgICAgICByZXR1cm4gZm9ybWF0LmluZGV4T2YoJywnKSA9PT0gZm9ybWF0LnNwbGl0KCcuJylbMF0ubGVuZ3RoIC0gNDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRm9ybWF0IHplcm8gZmlsbC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbGVuIGxlbmd0aCBvZiByZXN1bHRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWUgdGFyZ2V0IHZhbHVlXG4gICAgICogQHJldHVybnMge3N0cmluZ30gZm9ybWF0dGVkIHZhbHVlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZm9ybWF0WmVyb0ZpbGw6IGZ1bmN0aW9uKGxlbiwgdmFsdWUpIHtcbiAgICAgICAgdmFyIHplcm8gPSAnMCc7XG5cbiAgICAgICAgdmFsdWUgKz0gJyc7XG5cbiAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA+PSBsZW4pIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHdoaWxlICh2YWx1ZS5sZW5ndGggPCBsZW4pIHtcbiAgICAgICAgICAgIHZhbHVlID0gemVybyArIHZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGb3JtYXQgRGVjaW1hbC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbGVuIGxlbmd0aCBvZiB1bmRlciBkZWNpbWFsIHBvaW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlIHRhcmdldCB2YWx1ZVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGZvcm1hdHRlZCB2YWx1ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2Zvcm1hdERlY2ltYWw6IGZ1bmN0aW9uKGxlbiwgdmFsdWUpIHtcbiAgICAgICAgdmFyIHBvdztcblxuICAgICAgICBpZiAobGVuID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5yb3VuZCh2YWx1ZSwgMTApO1xuICAgICAgICB9XG5cbiAgICAgICAgcG93ID0gTWF0aC5wb3coMTAsIGxlbik7XG4gICAgICAgIHZhbHVlID0gTWF0aC5yb3VuZCh2YWx1ZSAqIHBvdykgLyBwb3c7XG4gICAgICAgIHZhbHVlID0gcGFyc2VGbG9hdCh2YWx1ZSkudG9GaXhlZChsZW4pO1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZvcm1hdCBDb21tYS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWUgdGFyZ2V0IHZhbHVlXG4gICAgICogQHJldHVybnMge3N0cmluZ30gZm9ybWF0dGVkIHZhbHVlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZm9ybWF0Q29tbWE6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHZhciBjb21tYSA9ICcsJyxcbiAgICAgICAgICAgIHVuZGVyUG9pbnRWYWx1ZSA9ICcnLFxuICAgICAgICAgICAgdmFsdWVzO1xuXG4gICAgICAgIHZhbHVlICs9ICcnO1xuXG4gICAgICAgIGlmICh2YWx1ZS5pbmRleE9mKCcuJykgPiAtMSkge1xuICAgICAgICAgICAgdmFsdWVzID0gdmFsdWUuc3BsaXQoJy4nKTtcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWVzWzBdO1xuICAgICAgICAgICAgdW5kZXJQb2ludFZhbHVlID0gJy4nICsgdmFsdWVzWzFdO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA8IDQpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZSArIHVuZGVyUG9pbnRWYWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhbHVlcyA9ICh2YWx1ZSkuc3BsaXQoJycpLnJldmVyc2UoKTtcbiAgICAgICAgdmFsdWVzID0gbmUudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbihjaGFyLCBpbmRleCkge1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IFtjaGFyXTtcbiAgICAgICAgICAgIGlmICgoaW5kZXggKyAxKSAlIDMgPT09IDApIHtcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChjb21tYSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gY29uY2F0LmFwcGx5KFtdLCB2YWx1ZXMpLnJldmVyc2UoKS5qb2luKCcnKSArIHVuZGVyUG9pbnRWYWx1ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmluZCBmb3JtYXQgZnVuY3Rpb25zLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmb3JtYXQgZm9ybWF0XG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gdmFsdWVzIGNoYXJ0IHZhbHVlc1xuICAgICAqIEByZXR1cm5zIHtmdW5jdGlvbltdfSBmdW5jdGlvbnNcbiAgICAgKi9cbiAgICBfZmluZEZvcm1hdEZ1bmN0aW9uczogZnVuY3Rpb24oZm9ybWF0KSB7XG4gICAgICAgIHZhciBmdW5jcyA9IFtdLFxuICAgICAgICAgICAgbGVuO1xuXG4gICAgICAgIGlmICghZm9ybWF0KSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5faXNEZWNpbWFsKGZvcm1hdCkpIHtcbiAgICAgICAgICAgIGxlbiA9IHRoaXMuX3BpY2tNYXhMZW5VbmRlclBvaW50KFtmb3JtYXRdKTtcbiAgICAgICAgICAgIGZ1bmNzID0gW25lLnV0aWwuYmluZCh0aGlzLl9mb3JtYXREZWNpbWFsLCB0aGlzLCBsZW4pXTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9pc1plcm9GaWxsKGZvcm1hdCkpIHtcbiAgICAgICAgICAgIGxlbiA9IGZvcm1hdC5sZW5ndGg7XG4gICAgICAgICAgICBmdW5jcyA9IFtuZS51dGlsLmJpbmQodGhpcy5fZm9ybWF0WmVyb0ZpbGwsIHRoaXMsIGxlbildO1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmNzO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2lzQ29tbWEoZm9ybWF0KSkge1xuICAgICAgICAgICAgZnVuY3MucHVzaCh0aGlzLl9mb3JtYXRDb21tYSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZnVuY3M7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBkYXRhQ29udmVydGVyO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IERPTSBIYW5kbGVyLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIERPTSBIYW5kbGVyLlxuICogQG1vZHVsZSBkb21IYW5kbGVyXG4gKi9cbnZhciBkb21IYW5kbGVyID0ge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZSBlbGVtZW50LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZG9tSGFuZGxlclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0YWcgaHRtbCB0YWdcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmV3Q2xhc3MgY2xhc3MgbmFtZVxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gY3JlYXRlZCBlbGVtZW50XG4gICAgICovXG4gICAgY3JlYXRlOiBmdW5jdGlvbih0YWcsIG5ld0NsYXNzKSB7XG4gICAgICAgIHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnKTtcblxuICAgICAgICBpZiAobmV3Q2xhc3MpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkQ2xhc3MoZWwsIG5ld0NsYXNzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNsYXNzIG5hbWVzLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZG9tSGFuZGxlclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHJldHVybnMge2FycmF5fSBuYW1lc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldENsYXNzTmFtZXM6IGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgIHZhciBjbGFzc05hbWUgPSBlbC5jbGFzc05hbWUgPyBlbC5jbGFzc05hbWUgOiAnJyxcbiAgICAgICAgICAgIGNsYXNzTmFtZXMgPSBjbGFzc05hbWUgPyBjbGFzc05hbWUuc3BsaXQoJyAnKSA6IFtdO1xuICAgICAgICByZXR1cm4gY2xhc3NOYW1lcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIGNzcyBjbGFzcyB0byB0YXJnZXQgZWxlbWVudC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRvbUhhbmRsZXJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuZXdDbGFzcyBhZGQgY2xhc3MgbmFtZVxuICAgICAqL1xuICAgIGFkZENsYXNzOiBmdW5jdGlvbihlbCwgbmV3Q2xhc3MpIHtcbiAgICAgICAgdmFyIGNsYXNzTmFtZXMgPSB0aGlzLl9nZXRDbGFzc05hbWVzKGVsKSxcbiAgICAgICAgICAgIGluZGV4ID0gbmUudXRpbC5pbkFycmF5KG5ld0NsYXNzLCBjbGFzc05hbWVzKTtcblxuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY2xhc3NOYW1lcy5wdXNoKG5ld0NsYXNzKTtcbiAgICAgICAgZWwuY2xhc3NOYW1lID0gY2xhc3NOYW1lcy5qb2luKCcgJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBjc3MgY2xhc3MgZnJvbSB0YXJnZXQgZWxlbWVudC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRvbUhhbmRsZXJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBybUNsYXNzIHJlbW92ZSBjbGFzcyBuYW1lXG4gICAgICovXG4gICAgcmVtb3ZlQ2xhc3M6IGZ1bmN0aW9uKGVsLCBybUNsYXNzKSB7XG4gICAgICAgIHZhciBjbGFzc05hbWVzID0gdGhpcy5fZ2V0Q2xhc3NOYW1lcyhlbCksXG4gICAgICAgICAgICBpbmRleCA9IG5lLnV0aWwuaW5BcnJheShybUNsYXNzLCBjbGFzc05hbWVzKTtcblxuICAgICAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjbGFzc05hbWVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIGVsLmNsYXNzTmFtZSA9IGNsYXNzTmFtZXMuam9pbignICcpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIGNsYXNzIGV4aXN0IG9yIG5vdC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRvbUhhbmRsZXJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmaW5kQ2xhc3MgdGFyZ2V0IGNzcyBjbGFzc1xuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBoYXMgY2xhc3NcbiAgICAgKi9cbiAgICBoYXNDbGFzczogZnVuY3Rpb24oZWwsIGZpbmRDbGFzcykge1xuICAgICAgICB2YXIgY2xhc3NOYW1lcyA9IHRoaXMuX2dldENsYXNzTmFtZXMoZWwpLFxuICAgICAgICAgICAgaW5kZXggPSBuZS51dGlsLmluQXJyYXkoZmluZENsYXNzLCBjbGFzc05hbWVzKTtcbiAgICAgICAgcmV0dXJuIGluZGV4ID4gLTE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZpbmQgcGFyZW50IGJ5IGNsYXNzIG5hbWUuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkb21IYW5kbGVyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY2xhc3NOYW1lIHRhcmdldCBjc3MgY2xhc3NcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbGFzdENsYXNzIGxhc3QgY3NzIGNsYXNzXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSByZXN1bHQgZWxlbWVudFxuICAgICAqL1xuICAgIGZpbmRQYXJlbnRCeUNsYXNzOiBmdW5jdGlvbihlbCwgY2xhc3NOYW1lLCBsYXN0Q2xhc3MpIHtcbiAgICAgICAgdmFyIHBhcmVudCA9IGVsLnBhcmVudE5vZGU7XG4gICAgICAgIGlmICghcGFyZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmhhc0NsYXNzKHBhcmVudCwgY2xhc3NOYW1lKSkge1xuICAgICAgICAgICAgcmV0dXJuIHBhcmVudDtcbiAgICAgICAgfSBlbHNlIGlmIChwYXJlbnQubm9kZU5hbWUgPT09ICdCT0RZJyB8fCB0aGlzLmhhc0NsYXNzKHBhcmVudCwgbGFzdENsYXNzKSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5maW5kUGFyZW50QnlDbGFzcyhwYXJlbnQsIGNsYXNzTmFtZSwgbGFzdENsYXNzKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBcHBlbmQgY2hpbGQgZWxlbWVudC5cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY29udGFpbmVyIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjaGlsZHJlbiBjaGlsZCBlbGVtZW50XG4gICAgICovXG4gICAgYXBwZW5kOiBmdW5jdGlvbihjb250YWluZXIsIGNoaWxkcmVuKSB7XG4gICAgICAgIGlmICghY29udGFpbmVyIHx8ICFjaGlsZHJlbikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNoaWxkcmVuID0gbmUudXRpbC5pc0FycmF5KGNoaWxkcmVuKSA/IGNoaWxkcmVuIDogW2NoaWxkcmVuXTtcblxuICAgICAgICBuZS51dGlsLmZvckVhY2hBcnJheShjaGlsZHJlbiwgZnVuY3Rpb24oY2hpbGQpIHtcbiAgICAgICAgICAgIGlmICghY2hpbGQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoY2hpbGQpO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRvbUhhbmRsZXI7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgRXZlbnQgbGlzdGVuZXIuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogRXZlbnQgbGlzdGVuZXIuXG4gKiBAbW9kdWxlIGV2ZW50TGlzdGVuZXJcbiAqL1xudmFyIGV2ZW50TGlzdGVuZXIgPSB7XG4gICAgLyoqXG4gICAgICogRXZlbnQgbGlzdGVuZXIgZm9yIElFLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZXZlbnRMaXN0ZW5lclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudE5hbWUgZXZlbnQgbmFtZVxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hdHRhY2hFdmVudDogZnVuY3Rpb24gKGV2ZW50TmFtZSwgZWwsIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT0gXCJvYmplY3RcIiAmJiBjYWxsYmFjay5oYW5kbGVFdmVudCkge1xuICAgICAgICAgICAgZWwuYXR0YWNoRXZlbnQoXCJvblwiICsgZXZlbnROYW1lLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2suaGFuZGxlRXZlbnQuY2FsbChjYWxsYmFjayk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsLmF0dGFjaEV2ZW50KFwib25cIiArIGV2ZW50TmFtZSwgY2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV2ZW50IGxpc3RlbmVyIGZvciBvdGhlciBicm93c2Vycy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmV2ZW50TGlzdGVuZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lIGV2ZW50IG5hbWVcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYWRkRXZlbnRMaXN0ZW5lcjogZnVuY3Rpb24gKGV2ZW50TmFtZSwgZWwsIGNhbGxiYWNrKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgY2FsbGJhY2spO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09IFwib2JqZWN0XCIgJiYgY2FsbGJhY2suaGFuZGxlRXZlbnQpIHtcbiAgICAgICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmhhbmRsZUV2ZW50LmNhbGwoY2FsbGJhY2ssIGV2ZW50KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogQmluZCBldmVudCBmdW5jdGlvbi5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmV2ZW50TGlzdGVuZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lIGV2ZW50IG5hbWVcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgICovXG4gICAgYmluZEV2ZW50OiBmdW5jdGlvbiAoZXZlbnROYW1lLCBlbCwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGJpbmRFdmVudDtcbiAgICAgICAgaWYgKFwiYWRkRXZlbnRMaXN0ZW5lclwiIGluIGVsKSB7XG4gICAgICAgICAgICBiaW5kRXZlbnQgPSB0aGlzLl9hZGRFdmVudExpc3RlbmVyO1xuICAgICAgICB9IGVsc2UgaWYgKFwiYXR0YWNoRXZlbnRcIiBpbiBlbCkge1xuICAgICAgICAgICAgYmluZEV2ZW50ID0gdGhpcy5fYXR0YWNoRXZlbnQ7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5iaW5kRXZlbnQgPSBiaW5kRXZlbnQ7XG4gICAgICAgIGJpbmRFdmVudChldmVudE5hbWUsIGVsLCBjYWxsYmFjayk7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBldmVudExpc3RlbmVyO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFJlbmRlclV0aWwuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBkb20gPSByZXF1aXJlKCcuL2RvbUhhbmRsZXInKSxcbiAgICBjaGFydENvbnN0ID0gcmVxdWlyZSgnLi8uLi9jb25zdC5qcycpO1xuXG52YXIgYnJvd3NlciA9IG5lLnV0aWwuYnJvd3NlcixcbiAgICBpc0lFOCA9IGJyb3dzZXIubXNpZSAmJiBicm93c2VyLnZlcnNpb24gPT09IDg7XG5cbnZhciByZW5kZXJVdGlsID0ge1xuICAgIC8qKlxuICAgICAqIENvbmNhdCBzdHJpbmdcbiAgICAgKiBAcGFyYW1zIHsuLi5zdHJpbmd9IHRhcmdldCBzdHJpbmdzXG4gICAgICogQHJldHVybnMge3N0cmluZ30gY29uY2F0IHN0cmluZ1xuICAgICAqL1xuICAgIGNvbmNhdFN0cjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBTdHJpbmcucHJvdG90eXBlLmNvbmNhdC5hcHBseSgnJywgYXJndW1lbnRzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBjc3NUZXh0IGZvciBmb250LlxuICAgICAqIEBwYXJhbSB7e2ZvbnRTaXplOiBudW1iZXIsIGZvbnRGYW1pbHk6IHN0cmluZywgY29sb3I6IHN0cmluZ319IHRoZW1lIGZvbnQgdGhlbWVcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBjc3NUZXh0XG4gICAgICovXG4gICAgbWFrZUZvbnRDc3NUZXh0OiBmdW5jdGlvbih0aGVtZSkge1xuICAgICAgICB2YXIgY3NzVGV4dHMgPSBbXTtcblxuICAgICAgICBpZiAoIXRoZW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhlbWUuZm9udFNpemUpIHtcbiAgICAgICAgICAgIGNzc1RleHRzLnB1c2godGhpcy5jb25jYXRTdHIoJ2ZvbnQtc2l6ZTonLCB0aGVtZS5mb250U2l6ZSwgJ3B4JykpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoZW1lLmZvbnRGYW1pbHkpIHtcbiAgICAgICAgICAgIGNzc1RleHRzLnB1c2godGhpcy5jb25jYXRTdHIoJ2ZvbnQtZmFtaWx5OicsIHRoZW1lLmZvbnRGYW1pbHkpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGVtZS5jb2xvcikge1xuICAgICAgICAgICAgY3NzVGV4dHMucHVzaCh0aGlzLmNvbmNhdFN0cignY29sb3I6JywgdGhlbWUuY29sb3IpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjc3NUZXh0cy5qb2luKCc7Jyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBlbGVtZW50IGZvciBzaXplIGNoZWNrLlxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NyZWF0ZVNpemVDaGVja0VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGVsRGl2ID0gZG9tLmNyZWF0ZSgnRElWJyksXG4gICAgICAgICAgICBlbFNwYW4gPSBkb20uY3JlYXRlKCdTUEFOJyk7XG5cbiAgICAgICAgZWxEaXYuYXBwZW5kQ2hpbGQoZWxTcGFuKTtcbiAgICAgICAgZWxEaXYuc3R5bGUuY3NzVGV4dCA9ICdwb3NpdGlvbjpyZWxhdGl2ZTt0b3A6MTAwMDBweDtsZWZ0OjEwMDAwcHg7bGluZS1oZWlnaHQ6MSc7XG4gICAgICAgIHJldHVybiBlbERpdjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHJlbmRlcmVkIGxhYmVsIHNpemUgKHdpZHRoIG9yIGhlaWdodCkuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGxhYmVsIGxhYmVsXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIHRoZW1lXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHByb3BlcnR5IGVsZW1lbnQgcHJvcGVydHlcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBzaXplXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0UmVuZGVyZWRMYWJlbFNpemU6IGZ1bmN0aW9uKGxhYmVsLCB0aGVtZSwgcHJvcGVydHkpIHtcbiAgICAgICAgdmFyIGVsRGl2ID0gdGhpcy5fY3JlYXRlU2l6ZUNoZWNrRWwoKSxcbiAgICAgICAgICAgIGVsU3BhbiA9IGVsRGl2LmZpcnN0Q2hpbGQsXG4gICAgICAgICAgICBsYWJlbFNpemU7XG5cbiAgICAgICAgdGhlbWUgPSB0aGVtZSB8fCB7fTtcbiAgICAgICAgZWxTcGFuLmlubmVySFRNTCA9IGxhYmVsO1xuICAgICAgICBlbFNwYW4uc3R5bGUuZm9udFNpemUgPSAodGhlbWUuZm9udFNpemUgfHwgY2hhcnRDb25zdC5ERUZBVUxUX0xBQkVMX0ZPTlRfU0laRSkgKyAncHgnO1xuXG4gICAgICAgIGlmICh0aGVtZS5mb250RmFtaWx5KSB7XG4gICAgICAgICAgICBlbFNwYW4uc3R5bGUuZm9udEZhbWlseSA9IHRoZW1lLmZvbnRGYW1pbHk7XG4gICAgICAgIH1cblxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGVsRGl2KTtcbiAgICAgICAgbGFiZWxTaXplID0gZWxTcGFuW3Byb3BlcnR5XTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChlbERpdik7XG4gICAgICAgIHJldHVybiBsYWJlbFNpemU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCByZW5kZXJlZCBsYWJlbCB3aWR0aC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbGFiZWwgbGFiZWxcbiAgICAgKiBAcGFyYW0ge3tmb250U2l6ZTogbnVtYmVyLCBmb250RmFtaWx5OiBzdHJpbmcsIGNvbG9yOiBzdHJpbmd9fSB0aGVtZSBsYWJlbCB0aGVtZVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IHdpZHRoXG4gICAgICovXG4gICAgZ2V0UmVuZGVyZWRMYWJlbFdpZHRoOiBmdW5jdGlvbihsYWJlbCwgdGhlbWUpIHtcbiAgICAgICAgdmFyIGxhYmVsV2lkdGggPSB0aGlzLl9nZXRSZW5kZXJlZExhYmVsU2l6ZShsYWJlbCwgdGhlbWUsICdvZmZzZXRXaWR0aCcpO1xuICAgICAgICByZXR1cm4gbGFiZWxXaWR0aDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHJlbmRlcmVkIGxhYmVsIGhlaWdodC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbGFiZWwgbGFiZWxcbiAgICAgKiBAcGFyYW0ge3tmb250U2l6ZTogbnVtYmVyLCBmb250RmFtaWx5OiBzdHJpbmcsIGNvbG9yOiBzdHJpbmd9fSB0aGVtZSBsYWJlbCB0aGVtZVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IGhlaWdodFxuICAgICAqL1xuICAgIGdldFJlbmRlcmVkTGFiZWxIZWlnaHQ6IGZ1bmN0aW9uKGxhYmVsLCB0aGVtZSkge1xuICAgICAgICB2YXIgbGFiZWxIZWlnaHQgPSB0aGlzLl9nZXRSZW5kZXJlZExhYmVsU2l6ZShsYWJlbCwgdGhlbWUsICdvZmZzZXRIZWlnaHQnKTtcbiAgICAgICAgcmV0dXJuIGxhYmVsSGVpZ2h0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXJlciBkaW1lbnNpb25cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gZGltZW5zaW9uIGRpbWVuc2lvblxuICAgICAqL1xuICAgIHJlbmRlckRpbWVuc2lvbjogZnVuY3Rpb24oZWwsIGRpbWVuc2lvbikge1xuICAgICAgICBlbC5zdHlsZS5jc3NUZXh0ID0gW1xuICAgICAgICAgICAgdGhpcy5jb25jYXRTdHIoJ3dpZHRoOicsIGRpbWVuc2lvbi53aWR0aCwgJ3B4JyksXG4gICAgICAgICAgICB0aGlzLmNvbmNhdFN0cignaGVpZ2h0OicsIGRpbWVuc2lvbi5oZWlnaHQsICdweCcpXG4gICAgICAgIF0uam9pbignOycpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgcG9zaXRpb24odG9wLCByaWdodClcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7e3RvcDogbnVtYmVyLCBsZWZ0OiBudW1iZXIsIHJpZ2h0OiBudW1iZXJ9fSBwb3NpdGlvbiBwb3NpdGlvblxuICAgICAqL1xuICAgIHJlbmRlclBvc2l0aW9uOiBmdW5jdGlvbihlbCwgcG9zaXRpb24pIHtcbiAgICAgICAgaWYgKG5lLnV0aWwuaXNVbmRlZmluZWQocG9zaXRpb24pKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocG9zaXRpb24udG9wKSB7XG4gICAgICAgICAgICBlbC5zdHlsZS50b3AgPSBwb3NpdGlvbi50b3AgKyAncHgnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBvc2l0aW9uLmxlZnQpIHtcbiAgICAgICAgICAgIGVsLnN0eWxlLmxlZnQgPSBwb3NpdGlvbi5sZWZ0ICsgJ3B4JztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwb3NpdGlvbi5yaWdodCkge1xuICAgICAgICAgICAgZWwuc3R5bGUucmlnaHQgPSBwb3NpdGlvbi5yaWdodCArICdweCc7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGJhY2tncm91bmQuXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gYmFja2dyb3VuZCBiYWNrZ3JvdW5kIG9wdGlvblxuICAgICAqL1xuICAgIHJlbmRlckJhY2tncm91bmQ6IGZ1bmN0aW9uKGVsLCBiYWNrZ3JvdW5kKSB7XG4gICAgICAgIGlmICghYmFja2dyb3VuZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZWwuc3R5bGUuYmFja2dyb3VuZCA9IGJhY2tncm91bmQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciB0aXRsZS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGl0bGUgdGl0bGVcbiAgICAgKiBAcGFyYW0ge3tmb250U2l6ZTogbnVtYmVyLCBjb2xvcjogc3RyaW5nLCBiYWNrZ3JvdW5kOiBzdHJpbmd9fSB0aGVtZSB0aXRsZSB0aGVtZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjbGFzc05hbWUgY3NzIGNsYXNzIG5hbWVcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHRpdGxlIGVsZW1lbnRcbiAgICAgKi9cbiAgICByZW5kZXJUaXRsZTogZnVuY3Rpb24odGl0bGUsIHRoZW1lLCBjbGFzc05hbWUpIHtcbiAgICAgICAgdmFyIGVsVGl0bGUsIGNzc1RleHQ7XG5cbiAgICAgICAgaWYgKCF0aXRsZSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBlbFRpdGxlID0gZG9tLmNyZWF0ZSgnRElWJywgY2xhc3NOYW1lKTtcbiAgICAgICAgZWxUaXRsZS5pbm5lckhUTUwgPSB0aXRsZTtcblxuICAgICAgICBjc3NUZXh0ID0gcmVuZGVyVXRpbC5tYWtlRm9udENzc1RleHQodGhlbWUpO1xuXG4gICAgICAgIGlmICh0aGVtZS5iYWNrZ3JvdW5kKSB7XG4gICAgICAgICAgICBjc3NUZXh0ICs9ICc7JyArIHRoaXMuY29uY2F0U3RyKCdiYWNrZ3JvdW5kOicsIHRoZW1lLmJhY2tncm91bmQpO1xuICAgICAgICB9XG5cbiAgICAgICAgZWxUaXRsZS5zdHlsZS5jc3NUZXh0ID0gY3NzVGV4dDtcblxuICAgICAgICByZXR1cm4gZWxUaXRsZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciBJRTggb3Igbm90LlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSByZXN1bHQgYm9vbGVhblxuICAgICAqL1xuICAgIGlzSUU4OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGlzSUU4O1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gcmVuZGVyVXRpbDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBUaGlzIGlzIHRlbXBsYXRlIG1ha2VyLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAvKipcbiAgICAgKiBUaGlzIGlzIHRlbXBsYXRlIG1ha2VyLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBodG1sIGh0bWxcbiAgICAgKiBAcmV0dXJucyB7ZnVuY3Rpb259IHRlbXBsYXRlIGZ1bmN0aW9uXG4gICAgICogQGVheG1wbGVcbiAgICAgKlxuICAgICAqICAgdmFyIHRlbXBsYXRlID0gdGVtcGxhdGVNYWtlci50ZW1wbGF0ZSgnPHNwYW4+e3sgbmFtZSB9fTwvc3Bhbj4nKSxcbiAgICAgKiAgICAgICByZXN1bHQgPSB0ZW1wbGF0ZSh7bmFtZTogJ0pvaG4nKTtcbiAgICAgKiAgIGNvbnNvbGUubG9nKHJlc3VsdCk7IC8vIDxzcGFuPkpvaG48L3NwYW4+XG4gICAgICpcbiAgICAgKi9cbiAgICB0ZW1wbGF0ZTogZnVuY3Rpb24gKGh0bWwpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gaHRtbDtcbiAgICAgICAgICAgIG5lLnV0aWwuZm9yRWFjaChkYXRhLCBmdW5jdGlvbiAodmFsdWUsIGtleSkge1xuICAgICAgICAgICAgICAgIHZhciByZWdFeHAgPSBuZXcgUmVnRXhwKCd7e1xcXFxzKicgKyBrZXkgKyAnXFxcXHMqfX0nLCAnZycpO1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKHJlZ0V4cCwgdmFsdWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9O1xuICAgIH1cbn07XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgIExlZ2VuZCBjb21wb25lbnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBjaGFydENvbnN0ID0gcmVxdWlyZSgnLi4vY29uc3QuanMnKSxcbiAgICBkb20gPSByZXF1aXJlKCcuLi9oZWxwZXJzL2RvbUhhbmRsZXIuanMnKSxcbiAgICByZW5kZXJVdGlsID0gcmVxdWlyZSgnLi4vaGVscGVycy9yZW5kZXJVdGlsLmpzJyksXG4gICAgbGVnZW5kVGVtcGxhdGUgPSByZXF1aXJlKCcuLy4uL2xlZ2VuZHMvbGVnZW5kVGVtcGxhdGUuanMnKTtcblxudmFyIExFR0VORF9SRUNUX1dJRFRIID0gMTIsXG4gICAgTEFCRUxfUEFERElOR19UT1AgPSAyLFxuICAgIExJTkVfTUFSR0lOX1RPUCA9IDU7XG5cbnZhciBMZWdlbmQgPSBuZS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgTGVnZW5kLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogTGVnZW5kIGNvbXBvbmVudC5cbiAgICAgKiBAY29uc3RydWN0cyBMZWdlbmRcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubGVnZW5kTGFiZWxzIGxlZ2VuZCBsYWJlbHNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuYm91bmQgYXhpcyBib3VuZFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBheGlzIHRoZW1lXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIG5lLnV0aWwuZXh0ZW5kKHRoaXMsIHBhcmFtcyk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIExlZ2VuZCB2aWV3IGNsYXNzTmFtZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jbGFzc05hbWUgPSAnbmUtY2hhcnQtbGVnZW5kLWFyZWEnO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgbGVnZW5kLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBib3VuZCBwbG90IGJvdW5kXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSBsZWdlbmQgZWxlbWVudFxuICAgICAqL1xuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBlbCA9IGRvbS5jcmVhdGUoJ0RJVicsIHRoaXMuY2xhc3NOYW1lKTtcbiAgICAgICAgZWwuaW5uZXJIVE1MID0gdGhpcy5fbWFrZUxlZ2VuZEh0bWwoKTtcbiAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJQb3NpdGlvbihlbCwgdGhpcy5ib3VuZC5wb3NpdGlvbik7XG4gICAgICAgIHRoaXMuX3JlbmRlckxhYmVsVGhlbWUoZWwsIHRoaXMudGhlbWUubGFiZWwpO1xuXG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHRoZW1lIHRvIGxlZ2VuZCBsYWJlbHNcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxvYmplY3Q+fSBsYWJlbHMgbGFiZWxzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIGxlZ2VuZCB0aGVtZVxuICAgICAqIEByZXR1cm5zIHthcnJheS48b2JqZWN0Pn0gbGFiZWxzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0VGhlbWVUb0xhYmVsczogZnVuY3Rpb24obGFiZWxzLCB0aGVtZSkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gbmUudXRpbC5tYXAobGFiZWxzLCBmdW5jdGlvbihpdGVtLCBpbmRleCkge1xuICAgICAgICAgICAgdmFyIGl0ZW1UaGVtZSA9IHtcbiAgICAgICAgICAgICAgICBjb2xvcjogdGhlbWUuY29sb3JzW2luZGV4XVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKHRoZW1lLnNpbmdsZUNvbG9ycykge1xuICAgICAgICAgICAgICAgIGl0ZW1UaGVtZS5zaW5nbGVDb2xvciA9IHRoZW1lLnNpbmdsZUNvbG9yc1tpbmRleF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhlbWUuYm9yZGVyQ29sb3IpIHtcbiAgICAgICAgICAgICAgICBpdGVtVGhlbWUuYm9yZGVyQ29sb3IgPSB0aGVtZS5ib3JkZXJDb2xvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGl0ZW0udGhlbWUgPSBpdGVtVGhlbWU7XG4gICAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBsZWdlbmQgbGFiZWxzLlxuICAgICAqIEByZXR1cm5zIHthcnJheS48b2JqZWN0Pn0gbGVnZW5kIGxhYmVscy5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlTGVnZW5kTGFiZWxzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNoYXJ0VHlwZSA9IHRoaXMuY2hhcnRUeXBlLFxuICAgICAgICAgICAgbGVnZW5kTGFiZWxzID0gdGhpcy5sZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICBqb2luTGVnZW5kTGFiZWxzID0gdGhpcy5qb2luTGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgbGFiZWxMZW4gPSBsZWdlbmRMYWJlbHMubGVuZ3RoLFxuICAgICAgICAgICAgdGhlbWUgPSB0aGlzLnRoZW1lLFxuICAgICAgICAgICAgY2hhcnRMZWdlbmRUaGVtZSA9IG5lLnV0aWwuZmlsdGVyKHRoZW1lLCBmdW5jdGlvbihpdGVtLCBuYW1lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwuaW5BcnJheShuYW1lLCBjaGFydENvbnN0LlNFUklFU19QUk9QUykgPT09IC0xICYmIG5hbWUgIT09ICdsYWJlbCc7XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGNoYXJ0VHlwZXMgPSBuZS51dGlsLmtleXMoY2hhcnRMZWdlbmRUaGVtZSksXG4gICAgICAgICAgICBjaGFydFRoZW1lLFxuICAgICAgICAgICAgcmVzdWx0O1xuXG4gICAgICAgIGlmICghY2hhcnRUeXBlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuX3NldFRoZW1lVG9MYWJlbHMoam9pbkxlZ2VuZExhYmVscywgdGhlbWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5fc2V0VGhlbWVUb0xhYmVscyhqb2luTGVnZW5kTGFiZWxzLnNsaWNlKDAsIGxhYmVsTGVuKSwgdGhlbWVbY2hhcnRUeXBlXSk7XG4gICAgICAgICAgICBjaGFydFRoZW1lID0gdGhlbWVbbmUudXRpbC5maWx0ZXIoY2hhcnRUeXBlcywgZnVuY3Rpb24ocHJvcE5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvcE5hbWUgIT09IGNoYXJ0VHlwZTtcbiAgICAgICAgICAgIH0pWzBdXTtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQodGhpcy5fc2V0VGhlbWVUb0xhYmVscyhqb2luTGVnZW5kTGFiZWxzLnNsaWNlKGxhYmVsTGVuKSwgY2hhcnRUaGVtZSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgbGVnZW5kIGh0bWwuXG4gICAgICogQHJldHVybnMge3N0cmluZ30gbGVnZW5kIGh0bWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlTGVnZW5kSHRtbDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBsYWJlbHMgPSB0aGlzLl9tYWtlTGVnZW5kTGFiZWxzKCksXG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IGxlZ2VuZFRlbXBsYXRlLlRQTF9MRUdFTkQsXG4gICAgICAgICAgICBsYWJlbEhlaWdodCA9IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodChsYWJlbHNbMF0ubGFiZWwsIGxhYmVsc1swXS50aGVtZSkgKyAoTEFCRUxfUEFERElOR19UT1AgKiAyKSxcbiAgICAgICAgICAgIGJhc2VNYXJnaW5Ub3AgPSBwYXJzZUludCgobGFiZWxIZWlnaHQgLSBMRUdFTkRfUkVDVF9XSURUSCkgLyAyLCAxMCkgLSAxLFxuICAgICAgICAgICAgaHRtbCA9IG5lLnV0aWwubWFwKGxhYmVscywgZnVuY3Rpb24obGFiZWwsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdmFyIGJvcmRlckNzc1RleHQgPSBsYWJlbC5ib3JkZXJDb2xvciA/IHJlbmRlclV0aWwuY29uY2F0U3RyKCc7Ym9yZGVyOjFweCBzb2xpZCAnLCBsYWJlbC5ib3JkZXJDb2xvcikgOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgcmVjdE1hcmdpbiwgbWFyZ2luVG9wLCBkYXRhO1xuICAgICAgICAgICAgICAgIGlmIChsYWJlbC5jaGFydFR5cGUgPT09ICdsaW5lJykge1xuICAgICAgICAgICAgICAgICAgICBtYXJnaW5Ub3AgPSBiYXNlTWFyZ2luVG9wICsgTElORV9NQVJHSU5fVE9QO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG1hcmdpblRvcCA9IGJhc2VNYXJnaW5Ub3A7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlY3RNYXJnaW4gPSByZW5kZXJVdGlsLmNvbmNhdFN0cignO21hcmdpbi10b3A6JywgbWFyZ2luVG9wLCAncHgnKTtcblxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIGNzc1RleHQ6IHJlbmRlclV0aWwuY29uY2F0U3RyKCdiYWNrZ3JvdW5kLWNvbG9yOicsIGxhYmVsLnRoZW1lLnNpbmdsZUNvbG9yIHx8IGxhYmVsLnRoZW1lLmNvbG9yLCBib3JkZXJDc3NUZXh0LCByZWN0TWFyZ2luKSxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBsYWJlbEhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgY2hhcnRUeXBlOiBsYWJlbC5jaGFydFR5cGUgfHwgJ3JlY3QnLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogbGFiZWwubGFiZWxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZShkYXRhKTtcbiAgICAgICAgICAgIH0sIHRoaXMpLmpvaW4oJycpO1xuICAgICAgICByZXR1cm4gaHRtbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGNzcyBzdHlsZSBvZiBsYWJlbCBhcmVhLlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIGxhYmVsIGFyZWEgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7e2ZvbnRTaXplOm51bWJlciwgZm9udEZhbWlseTogc3RyaW5nLCBjb2xvcjogc3RyaW5nfX0gdGhlbWUgbGFiZWwgdGhlbWVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJMYWJlbFRoZW1lOiBmdW5jdGlvbihlbCwgdGhlbWUpIHtcbiAgICAgICAgdmFyIGNzc1RleHQgPSByZW5kZXJVdGlsLm1ha2VGb250Q3NzVGV4dCh0aGVtZSk7XG4gICAgICAgIGVsLnN0eWxlLmNzc1RleHQgKz0gJzsnICsgY3NzVGV4dDtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBMZWdlbmQ7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgVGhpcyBpcyB0ZW1wbGF0ZXMgb2YgbGVnZW5kIHZpZXcuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG52YXIgdGVtcGxhdGVNYWtlciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvdGVtcGxhdGVNYWtlci5qcycpO1xuXG52YXIgdGFncyA9IHtcbiAgICBIVE1MX0xFR0VORDogJzxkaXYgY2xhc3M9XCJuZS1jaGFydC1sZWdlbmRcIj4nICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJuZS1jaGFydC1sZWdlbmQtcmVjdCB7eyBjaGFydFR5cGUgfX1cIiBzdHlsZT1cInt7IGNzc1RleHQgfX1cIj48L2Rpdj4nICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJuZS1jaGFydC1sZWdlbmQtbGFiZWxcIiBzdHlsZT1cImhlaWdodDp7eyBoZWlnaHQgfX1weFwiPnt7IGxhYmVsIH19PC9kaXY+PC9kaXY+J1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgVFBMX0xFR0VORDogdGVtcGxhdGVNYWtlci50ZW1wbGF0ZSh0YWdzLkhUTUxfTEVHRU5EKVxufTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBQbG90IGNvbXBvbmVudC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGRvbSA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZG9tSGFuZGxlci5qcycpLFxuICAgIGNhbGN1bGF0b3IgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2NhbGN1bGF0b3IuanMnKSxcbiAgICByZW5kZXJVdGlsID0gcmVxdWlyZSgnLi4vaGVscGVycy9yZW5kZXJVdGlsLmpzJyksXG4gICAgcGxvdFRlbXBsYXRlID0gcmVxdWlyZSgnLi9wbG90VGVtcGxhdGUuanMnKTtcblxudmFyIFBsb3QgPSBuZS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgUGxvdC5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIFBsb3QgY29tcG9uZW50LlxuICAgICAqIEBjb25zdHJ1Y3RzIFBsb3RcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMudlRpY2tDb3VudCB2ZXJ0aWNhbCB0aWNrIGNvdW50XG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmhUaWNrQ291bnQgaG9yaXpvbnRhbCB0aWNrIGNvdW50XG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmJvdW5kIGF4aXMgYm91bmRcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgYXhpcyB0aGVtZVxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICBuZS51dGlsLmV4dGVuZCh0aGlzLCBwYXJhbXMpO1xuICAgICAgICAvKipcbiAgICAgICAgICogUGxvdCB2aWV3IGNsYXNzTmFtZVxuICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jbGFzc05hbWUgPSAnbmUtY2hhcnQtcGxvdC1hcmVhJztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIHBsb3QuXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIHRvcDogbnVtYmVyLCByaWdodDogbnVtYmVyfX0gYm91bmQgcGxvdCBhcmVhIGJvdW5kXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSBwbG90IGVsZW1lbnRcbiAgICAgKi9cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZWwgPSBkb20uY3JlYXRlKCdESVYnLCB0aGlzLmNsYXNzTmFtZSksXG4gICAgICAgICAgICBib3VuZCA9IHRoaXMuYm91bmQ7XG4gICAgICAgIHJlbmRlclV0aWwucmVuZGVyRGltZW5zaW9uKGVsLCBib3VuZC5kaW1lbnNpb24pO1xuICAgICAgICByZW5kZXJVdGlsLnJlbmRlclBvc2l0aW9uKGVsLCBib3VuZC5wb3NpdGlvbik7XG4gICAgICAgIHRoaXMuX3JlbmRlckxpbmVzKGVsLCBib3VuZC5kaW1lbnNpb24pO1xuXG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIHBsb3QgbGluZXMuXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gZGltZW5zaW9uIHBsb3QgYXJlYSBkaW1lbnNpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJMaW5lczogZnVuY3Rpb24oZWwsIGRpbWVuc2lvbikge1xuICAgICAgICB2YXIgaFBvc2l0aW9ucyA9IHRoaXMubWFrZUhvcml6b250YWxQaXhlbFBvc2l0aW9ucyhkaW1lbnNpb24ud2lkdGgpLFxuICAgICAgICAgICAgdlBvc2l0aW9ucyA9IHRoaXMubWFrZVZlcnRpY2FsUGl4ZWxQb3NpdGlvbnMoZGltZW5zaW9uLmhlaWdodCksXG4gICAgICAgICAgICB0aGVtZSA9IHRoaXMudGhlbWUsXG4gICAgICAgICAgICBsaW5lSHRtbCA9ICcnO1xuXG4gICAgICAgIGxpbmVIdG1sICs9IHRoaXMuX21ha2VMaW5lSHRtbCh7XG4gICAgICAgICAgICBwb3NpdGlvbnM6IGhQb3NpdGlvbnMsXG4gICAgICAgICAgICBzaXplOiBkaW1lbnNpb24uaGVpZ2h0LFxuICAgICAgICAgICAgY2xhc3NOYW1lOiAndmVydGljYWwnLFxuICAgICAgICAgICAgcG9zaXRpb25UeXBlOiAnbGVmdCcsXG4gICAgICAgICAgICBzaXplVHlwZTogJ2hlaWdodCcsXG4gICAgICAgICAgICBsaW5lQ29sb3I6IHRoZW1lLmxpbmVDb2xvclxuICAgICAgICB9KTtcbiAgICAgICAgbGluZUh0bWwgKz0gdGhpcy5fbWFrZUxpbmVIdG1sKHtcbiAgICAgICAgICAgIHBvc2l0aW9uczogdlBvc2l0aW9ucyxcbiAgICAgICAgICAgIHNpemU6IGRpbWVuc2lvbi53aWR0aCxcbiAgICAgICAgICAgIGNsYXNzTmFtZTogJ2hvcml6b250YWwnLFxuICAgICAgICAgICAgcG9zaXRpb25UeXBlOiAnYm90dG9tJyxcbiAgICAgICAgICAgIHNpemVUeXBlOiAnd2lkdGgnLFxuICAgICAgICAgICAgbGluZUNvbG9yOiB0aGVtZS5saW5lQ29sb3JcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZWwuaW5uZXJIVE1MID0gbGluZUh0bWw7XG5cbiAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJCYWNrZ3JvdW5kKGVsLCB0aGVtZS5iYWNrZ3JvdW5kKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBodG1sIG9mIHBsb3QgbGluZS5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPG9iamVjdD59IHBhcmFtcy5wb3NpdGlvbnMgcG9zaXRpb25zXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnNpemUgd2lkdGggb3IgaGVpZ2h0XG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLmNsYXNzTmFtZSBsaW5lIGNsYXNzTmFtZVxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5wb3NpdGlvblR5cGUgcG9zaXRpb24gdHlwZSAobGVmdCBvciBib3R0b20pXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLnNpemVUeXBlIHNpemUgdHlwZSAoc2l6ZSBvciBoZWlnaHQpXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLmxpbmVDb2xvciBsaW5lIGNvbG9yXG4gICAgICogQHJldHVybnMge3N0cmluZ30gaHRtbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VMaW5lSHRtbDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciB0ZW1wbGF0ZSA9IHBsb3RUZW1wbGF0ZS5UUExfUExPVF9MSU5FLFxuICAgICAgICAgICAgbGluZUh0bWwgPSBuZS51dGlsLm1hcChwYXJhbXMucG9zaXRpb25zLCBmdW5jdGlvbihwb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIHZhciBjc3NUZXh0cyA9IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlclV0aWwuY29uY2F0U3RyKHBhcmFtcy5wb3NpdGlvblR5cGUsICc6JywgcG9zaXRpb24sICdweCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyVXRpbC5jb25jYXRTdHIocGFyYW1zLnNpemVUeXBlLCAnOicsIHBhcmFtcy5zaXplLCAncHgnKVxuICAgICAgICAgICAgICAgICAgICBdLCBkYXRhO1xuXG4gICAgICAgICAgICAgICAgaWYgKHBhcmFtcy5saW5lQ29sb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgY3NzVGV4dHMucHVzaChyZW5kZXJVdGlsLmNvbmNhdFN0cignYmFja2dyb3VuZC1jb2xvcjonLCBwYXJhbXMubGluZUNvbG9yKSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtjbGFzc05hbWU6IHBhcmFtcy5jbGFzc05hbWUsIGNzc1RleHQ6IGNzc1RleHRzLmpvaW4oJzsnKX07XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRlbXBsYXRlKGRhdGEpO1xuICAgICAgICAgICAgfSwgdGhpcykuam9pbignJyk7XG4gICAgICAgIHJldHVybiBsaW5lSHRtbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBwaXhlbCB2YWx1ZSBvZiB2ZXJ0aWNhbCBwb3NpdGlvbnNcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0IHBsb3QgaGVpZ2h0XG4gICAgICogQHJldHVybnMge2FycmF5LjxudW1iZXI+fSBwb3NpdGlvbnNcbiAgICAgKi9cbiAgICBtYWtlVmVydGljYWxQaXhlbFBvc2l0aW9uczogZnVuY3Rpb24oaGVpZ2h0KSB7XG4gICAgICAgIHZhciBwb3NpdGlvbnMgPSBjYWxjdWxhdG9yLm1ha2VQaXhlbFBvc2l0aW9ucyhoZWlnaHQsIHRoaXMudlRpY2tDb3VudCk7XG4gICAgICAgIHBvc2l0aW9ucy5zaGlmdCgpO1xuICAgICAgICByZXR1cm4gcG9zaXRpb25zO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHBpeGVsIHZhbHVlIG9mIGhvcml6b250YWwgcG9zaXRpb25zLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aCBwbG90IHdpZHRoXG4gICAgICogQHJldHVybnMge2FycmF5LjxudW1iZXI+fSBwb3NpdGlvbnNcbiAgICAgKi9cbiAgICBtYWtlSG9yaXpvbnRhbFBpeGVsUG9zaXRpb25zOiBmdW5jdGlvbih3aWR0aCkge1xuICAgICAgICB2YXIgcG9zaXRpb25zID0gY2FsY3VsYXRvci5tYWtlUGl4ZWxQb3NpdGlvbnMod2lkdGgsIHRoaXMuaFRpY2tDb3VudCk7XG4gICAgICAgIHBvc2l0aW9ucy5zaGlmdCgpO1xuICAgICAgICByZXR1cm4gcG9zaXRpb25zO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBsb3Q7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgVGhpcyBpcyB0ZW1wbGF0ZXMgb2YgcGxvdCB2aWV3IC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbnZhciB0ZW1wbGF0ZU1ha2VyID0gcmVxdWlyZSgnLi4vaGVscGVycy90ZW1wbGF0ZU1ha2VyLmpzJyk7XG5cbnZhciB0YWdzID0ge1xuICAgIEhUTUxfUExPVF9MSU5FOiAnPGRpdiBjbGFzcz1cIm5lLWNoYXJ0LXBsb3QtbGluZSB7eyBjbGFzc05hbWUgfX1cIiBzdHlsZT1cInt7IGNzc1RleHQgfX1cIj48L2Rpdj4nXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBUUExfUExPVF9MSU5FOiB0ZW1wbGF0ZU1ha2VyLnRlbXBsYXRlKHRhZ3MuSFRNTF9QTE9UX0xJTkUpXG59O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFJhcGhhZWwgcmVuZGVyIHBsdWdpbi5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIEJhckNoYXJ0ID0gcmVxdWlyZSgnLi9yYXBoYWVsQmFyQ2hhcnQuanMnKSxcbiAgICBMaW5lQ2hhcnQgPSByZXF1aXJlKCcuL3JhcGhhZWxMaW5lQ2hhcnQuanMnKSxcbiAgICBQaWVDaGFydCA9IHJlcXVpcmUoJy4vcmFwaGFlbFBpZUNoYXJ0LmpzJyk7XG5cbnZhciBwbHVnaW5OYW1lID0gJ3JhcGhhZWwnLFxuICAgIHBsdWdpblJhcGhhZWw7XG5cbnBsdWdpblJhcGhhZWwgPSB7XG4gICAgYmFyOiBCYXJDaGFydCxcbiAgICBjb2x1bW46IEJhckNoYXJ0LFxuICAgIGxpbmU6IExpbmVDaGFydCxcbiAgICBwaWU6IFBpZUNoYXJ0XG59O1xuXG5uZS5hcHBsaWNhdGlvbi5jaGFydC5yZWdpc3RlclBsdWdpbihwbHVnaW5OYW1lLCBwbHVnaW5SYXBoYWVsKTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBSYXBoYWVsIGJhciBjaGFydCByZW5kZXJlci5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIEhJRERFTl9XSURUSCA9IDE7XG5cbnZhciBSYXBoYWVsID0gd2luZG93LlJhcGhhZWwsXG4gICAgYnJvd3NlciA9IG5lLnV0aWwuYnJvd3NlcjtcblxuLyoqXG4gKiBAY2xhc3NkZXNjIFJhcGhhZWxCYXJDaGFydCBpcyBncmFwaCByZW5kZXJlci5cbiAqIEBjbGFzcyBSYXBoYWVsQmFyQ2hhcnRcbiAqL1xudmFyIFJhcGhhZWxCYXJDaGFydCA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBSYXBoYWVsQmFyQ2hhcnQucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBSZW5kZXIgZnVuY3Rpb24gb2YgYmFyIGNoYXJ0XG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY29udGFpbmVyIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3tzaXplOiBvYmplY3QsIG1vZGVsOiBvYmplY3QsIG9wdGlvbnM6IG9iamVjdCwgdG9vbHRpcFBvc2l0aW9uOiBzdHJpbmd9fSBkYXRhIGNoYXJ0IGRhdGFcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBpbkNhbGxiYWNrIG1vdXNlb3ZlciBjYWxsYmFja1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG91dENhbGxiYWNrIG1vdXNlb3V0IGNhbGxiYWNrXG4gICAgICogQHJldHVybiB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICovXG4gICAgcmVuZGVyOiBmdW5jdGlvbihwYXBlciwgY29udGFpbmVyLCBkYXRhLCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjaykge1xuICAgICAgICB2YXIgZ3JvdXBCb3VuZHMgPSBkYXRhLmdyb3VwQm91bmRzLFxuICAgICAgICAgICAgZGltZW5zaW9uID0gZGF0YS5kaW1lbnNpb247XG5cbiAgICAgICAgaWYgKCFncm91cEJvdW5kcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFwYXBlcikge1xuICAgICAgICAgICAgcGFwZXIgPSBSYXBoYWVsKGNvbnRhaW5lciwgZGltZW5zaW9uLndpZHRoLCBkaW1lbnNpb24uaGVpZ2h0KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9yZW5kZXJCYXJzKHBhcGVyLCBkYXRhLnRoZW1lLCBncm91cEJvdW5kcywgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spO1xuXG4gICAgICAgIHJldHVybiBwYXBlcjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGJhcnMuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKiBAcGFyYW0ge3tjb2xvcnM6IHN0cmluZ1tdLCBzaW5nbGVDb2xvcnM6IHN0cmluZ1tdLCBib3JkZXJDb2xvcjogc3RyaW5nfX0gdGhlbWUgYmFyIGNoYXJ0IHRoZW1lXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXkuPHtsZWZ0OiBudW1iZXIsIHRvcDpudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfT4+fSBncm91cEJvdW5kcyBib3VuZHNcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBpbkNhbGxiYWNrIGluIGNhbGxiYWNrXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gb3V0Q2FsbGJhY2sgb3V0IGNhbGxiYWNrXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyQmFyczogZnVuY3Rpb24ocGFwZXIsIHRoZW1lLCBncm91cEJvdW5kcywgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHNpbmdsZUNvbG9ycyA9IChncm91cEJvdW5kc1swXS5sZW5ndGggPT09IDEpICYmIHRoZW1lLnNpbmdsZUNvbG9ycyB8fCBbXSxcbiAgICAgICAgICAgIGNvbG9ycyA9IHRoZW1lLmNvbG9ycyxcbiAgICAgICAgICAgIGJvcmRlckNvbG9yID0gdGhlbWUuYm9yZGVyQ29sb3IgfHwgJ25vbmUnO1xuICAgICAgICBuZS51dGlsLmZvckVhY2hBcnJheShncm91cEJvdW5kcywgZnVuY3Rpb24oYm91bmRzLCBncm91cEluZGV4KSB7XG4gICAgICAgICAgICB2YXIgc2luZ2xlQ29sb3IgPSBzaW5nbGVDb2xvcnNbZ3JvdXBJbmRleF07XG4gICAgICAgICAgICBuZS51dGlsLmZvckVhY2hBcnJheShib3VuZHMsIGZ1bmN0aW9uKGJvdW5kLCBpbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciBjb2xvciA9IHNpbmdsZUNvbG9yIHx8IGNvbG9yc1tpbmRleF0sXG4gICAgICAgICAgICAgICAgICAgIGlkID0gZ3JvdXBJbmRleCArICctJyArIGluZGV4LFxuICAgICAgICAgICAgICAgICAgICByZWN0ID0gdGhpcy5fcmVuZGVyQmFyKHBhcGVyLCBjb2xvciwgYm9yZGVyQ29sb3IsIGJvdW5kKTtcbiAgICAgICAgICAgICAgICBpZiAocmVjdCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9iaW5kSG92ZXJFdmVudChyZWN0LCBib3VuZCwgaWQsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciByZWN0XG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29sb3Igc2VyaWVzIGNvbG9yXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGJvcmRlckNvbG9yIHNlcmllcyBib3JkZXJDb2xvclxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gYm91bmQgYm91bmRcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBiYXIgcmVjdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlckJhcjogZnVuY3Rpb24ocGFwZXIsIGNvbG9yLCBib3JkZXJDb2xvciwgYm91bmQpIHtcbiAgICAgICAgaWYgKGJvdW5kLndpZHRoIDwgMCB8fCBib3VuZC5oZWlnaHQgPCAwKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcmVjdCA9IHBhcGVyLnJlY3QoYm91bmQubGVmdCwgYm91bmQudG9wLCBib3VuZC53aWR0aCwgYm91bmQuaGVpZ2h0KTtcbiAgICAgICAgcmVjdC5hdHRyKHtcbiAgICAgICAgICAgIGZpbGw6IGNvbG9yLFxuICAgICAgICAgICAgc3Ryb2tlOiBib3JkZXJDb2xvclxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gcmVjdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQmluZCBob3ZlciBldmVudC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcmVjdCByYXBoYWVsIHJlY3RcbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGJvdW5kIGJvdW5kXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGlkIHRvb2x0aXAgaWRcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBpbkNhbGxiYWNrIGluIGNhbGxiYWNrXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gb3V0Q2FsbGJhY2sgb3V0IGNhbGxiYWNrXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYmluZEhvdmVyRXZlbnQ6IGZ1bmN0aW9uKHJlY3QsIGJvdW5kLCBpZCwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spIHtcbiAgICAgICAgcmVjdC5ob3ZlcihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGluQ2FsbGJhY2soYm91bmQsIGlkKTtcbiAgICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBvdXRDYWxsYmFjayhpZCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhcGhhZWxCYXJDaGFydDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBSYXBoYWVsIGxpbmUgY2hhcnQgcmVuZGVyZXIuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSYXBoYWVsID0gd2luZG93LlJhcGhhZWwsXG4gICAgREVGQVVMVF9ET1RfV0lEVEggPSA0LFxuICAgIEhPVkVSX0RPVF9XSURUSCA9IDU7XG5cbi8qKlxuICogQGNsYXNzZGVzYyBSYXBoYWVsTGluZUNoYXJ0cyBpcyBncmFwaCByZW5kZXJlci5cbiAqIEBjbGFzcyBSYXBoYWVsTGluZUNoYXJ0XG4gKi9cbnZhciBSYXBoYWVsTGluZUNoYXJ0ID0gbmUudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIFJhcGhhZWxMaW5lQ2hhcnQucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBSZW5kZXIgZnVuY3Rpb24gb3IgbGluZSBjaGFydC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciBjb250YWluZXJcbiAgICAgKiBAcGFyYW0ge3tncm91cFBvc2l0aW9uczogYXJyYXkuPGFycmF5PiwgZGltZW5zaW9uOiBvYmplY3QsIHRoZW1lOiBvYmplY3QsIG9wdGlvbnM6IG9iamVjdH19IGRhdGEgcmVuZGVyIGRhdGFcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBpbkNhbGxiYWNrIGluIGNhbGxiYWNrXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gb3V0Q2FsbGJhY2sgb3V0IGNhbGxiYWNrXG4gICAgICogQHJldHVybiB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICovXG4gICAgcmVuZGVyOiBmdW5jdGlvbihwYXBlciwgY29udGFpbmVyLCBkYXRhLCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjaykge1xuICAgICAgICB2YXIgZGltZW5zaW9uID0gZGF0YS5kaW1lbnNpb24sXG4gICAgICAgICAgICBncm91cFBvc2l0aW9ucyA9IGRhdGEuZ3JvdXBQb3NpdGlvbnMsXG4gICAgICAgICAgICB0aGVtZSA9IGRhdGEudGhlbWUsXG4gICAgICAgICAgICBjb2xvcnMgPSB0aGVtZS5jb2xvcnMsXG4gICAgICAgICAgICBvcGFjaXR5ID0gZGF0YS5vcHRpb25zLmhhc0RvdCA/IDEgOiAwLFxuICAgICAgICAgICAgZ3JvdXBQYXRocyA9IHRoaXMuX2dldExpbmVzUGF0aChncm91cFBvc2l0aW9ucyksXG4gICAgICAgICAgICBib3JkZXJTdHlsZSA9IHRoaXMuX21ha2VCb3JkZXJTdHlsZSh0aGVtZS5ib3JkZXJDb2xvciwgb3BhY2l0eSksXG4gICAgICAgICAgICBvdXREb3RTdHlsZSA9IHRoaXMuX21ha2VPdXREb3RTdHlsZShvcGFjaXR5LCBib3JkZXJTdHlsZSksXG4gICAgICAgICAgICBncm91cERvdHM7XG5cbiAgICAgICAgaWYgKCFwYXBlcikge1xuICAgICAgICAgICAgcGFwZXIgPSBSYXBoYWVsKGNvbnRhaW5lciwgZGltZW5zaW9uLndpZHRoLCBkaW1lbnNpb24uaGVpZ2h0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3JlbmRlckxpbmVzKHBhcGVyLCBncm91cFBhdGhzLCBjb2xvcnMpO1xuICAgICAgICBncm91cERvdHMgPSB0aGlzLl9yZW5kZXJEb3RzKHBhcGVyLCBncm91cFBvc2l0aW9ucywgY29sb3JzLCBvcGFjaXR5LCBib3JkZXJTdHlsZSk7XG5cbiAgICAgICAgdGhpcy5vdXREb3RTdHlsZSA9IG91dERvdFN0eWxlO1xuICAgICAgICB0aGlzLmdyb3VwRG90cyA9IGdyb3VwRG90cztcblxuICAgICAgICB0aGlzLl9hdHRhY2hFdmVudChncm91cERvdHMsIGdyb3VwUG9zaXRpb25zLCBvdXREb3RTdHlsZSwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spO1xuXG4gICAgICAgIHJldHVybiBwYXBlcjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBib3JkZXIgc3R5bGUuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGJvcmRlckNvbG9yIGJvcmRlciBjb2xvclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBvcGFjaXR5IG9wYWNpdHlcbiAgICAgKiBAcmV0dXJucyB7e3N0cm9rZTogc3RyaW5nLCBzdHJva2Utd2lkdGg6IG51bWJlciwgc3RyaWtlLW9wYWNpdHk6IG51bWJlcn19IGJvcmRlciBzdHlsZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VCb3JkZXJTdHlsZTogZnVuY3Rpb24oYm9yZGVyQ29sb3IsIG9wYWNpdHkpIHtcbiAgICAgICAgdmFyIGJvcmRlclN0eWxlO1xuICAgICAgICBpZiAoYm9yZGVyQ29sb3IpIHtcbiAgICAgICAgICAgIGJvcmRlclN0eWxlID0ge1xuICAgICAgICAgICAgICAgICdzdHJva2UnOiBib3JkZXJDb2xvcixcbiAgICAgICAgICAgICAgICAnc3Ryb2tlLXdpZHRoJzogMSxcbiAgICAgICAgICAgICAgICAnc3Ryb2tlLW9wYWNpdHknOiBvcGFjaXR5XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBib3JkZXJTdHlsZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBkb3Qgc3R5bGUgZm9yIG1vdXNlb3V0IGV2ZW50LlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBvcGFjaXR5IG9wYWNpdHlcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYm9yZGVyU3R5bGUgYm9yZGVyIHN0eWxlXG4gICAgICogQHJldHVybnMge3tmaWxsLW9wYWNpdHk6IG51bWJlciwgc3Ryb2tlLW9wYWNpdHk6IG51bWJlciwgcjogbnVtYmVyfX0gc3R5bGVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlT3V0RG90U3R5bGU6IGZ1bmN0aW9uKG9wYWNpdHksIGJvcmRlclN0eWxlKSB7XG4gICAgICAgIHZhciBvdXREb3RTdHlsZSA9IHtcbiAgICAgICAgICAgICdmaWxsLW9wYWNpdHknOiBvcGFjaXR5LFxuICAgICAgICAgICAgJ3N0cm9rZS1vcGFjaXR5JzogMCxcbiAgICAgICAgICAgIHI6IDRcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoYm9yZGVyU3R5bGUpIHtcbiAgICAgICAgICAgIG5lLnV0aWwuZXh0ZW5kKG91dERvdFN0eWxlLCBib3JkZXJTdHlsZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gb3V0RG90U3R5bGU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBkb3QuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIHJhcGhhZWwgcGFwYWVyXG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IHBvc2l0aW9uIGRvdCBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb2xvciBkb3QgY29sb3JcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gb3BhY2l0eSBvcGFjaXR5XG4gICAgICogQHBhcmFtIHtvYmplY3R9IGJvcmRlclN0eWxlIGJvcmRlciBzdHlsZVxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHJhcGhhZWwgZG90XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyRG90OiBmdW5jdGlvbihwYXBlciwgcG9zaXRpb24sIGNvbG9yLCBvcGFjaXR5LCBib3JkZXJTdHlsZSkge1xuICAgICAgICB2YXIgZG90ID0gcGFwZXIuY2lyY2xlKHBvc2l0aW9uLmxlZnQsIHBvc2l0aW9uLnRvcCwgREVGQVVMVF9ET1RfV0lEVEgpLFxuICAgICAgICAgICAgZG90U3R5bGUgPSB7XG4gICAgICAgICAgICAgICAgZmlsbDogY29sb3IsXG4gICAgICAgICAgICAgICAgJ2ZpbGwtb3BhY2l0eSc6IG9wYWNpdHksXG4gICAgICAgICAgICAgICAgJ3N0cm9rZS1vcGFjaXR5JzogMFxuICAgICAgICAgICAgfTtcblxuICAgICAgICBpZiAoYm9yZGVyU3R5bGUpIHtcbiAgICAgICAgICAgIG5lLnV0aWwuZXh0ZW5kKGRvdFN0eWxlLCBib3JkZXJTdHlsZSk7XG4gICAgICAgIH1cblxuICAgICAgICBkb3QuYXR0cihkb3RTdHlsZSk7XG5cbiAgICAgICAgcmV0dXJuIGRvdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGRvdHMuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheS48b2JqZWN0Pj59IGdyb3VwUG9zaXRpb25zIHBvc2l0aW9uc1xuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IGNvbG9ycyBjb2xvcnNcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gb3BhY2l0eSBvcGFjaXR5XG4gICAgICogQHBhcmFtIHtvYmplY3R9IGJvcmRlclN0eWxlIGJvcmRlciBzdHlsZVxuICAgICAqIEByZXR1cm5zIHthcnJheS48b2JqZWN0Pn0gZG90c1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlckRvdHM6IGZ1bmN0aW9uKHBhcGVyLCBncm91cFBvc2l0aW9ucywgY29sb3JzLCBvcGFjaXR5LCBib3JkZXJTdHlsZSkge1xuICAgICAgICB2YXIgZG90cyA9IG5lLnV0aWwubWFwKGdyb3VwUG9zaXRpb25zLCBmdW5jdGlvbihwb3NpdGlvbnMsIGdyb3VwSW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBjb2xvciA9IGNvbG9yc1tncm91cEluZGV4XTtcbiAgICAgICAgICAgIHJldHVybiBuZS51dGlsLm1hcChwb3NpdGlvbnMsIGZ1bmN0aW9uKHBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRvdCA9IHRoaXMuX3JlbmRlckRvdChwYXBlciwgcG9zaXRpb24sIGNvbG9yLCBvcGFjaXR5LCBib3JkZXJTdHlsZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvdDtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICByZXR1cm4gZG90cztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBsaW5lIHBhdGguXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGZ4IGZyb20geFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBmeSBmcm9tIHlcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdHggdG8geFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB0eSB0byB5XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoIHdpZHRoXG4gICAgICogQHJldHVybnMge3N0cmluZ30gcGF0aFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VMaW5lUGF0aDogZnVuY3Rpb24oZngsIGZ5LCB0eCwgdHksIHdpZHRoKSB7XG4gICAgICAgIHZhciBmcm9tUG9pbnQgPSBbZngsIGZ5XTtcbiAgICAgICAgdmFyIHRvUG9pbnQgPSBbdHgsIHR5XTtcblxuICAgICAgICB3aWR0aCA9IHdpZHRoIHx8IDE7XG5cbiAgICAgICAgaWYgKGZyb21Qb2ludFswXSA9PT0gdG9Qb2ludFswXSkge1xuICAgICAgICAgICAgZnJvbVBvaW50WzBdID0gdG9Qb2ludFswXSA9IE1hdGgucm91bmQoZnJvbVBvaW50WzBdKSAtICh3aWR0aCAlIDIgLyAyKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZnJvbVBvaW50WzFdID09PSB0b1BvaW50WzFdKSB7XG4gICAgICAgICAgICBmcm9tUG9pbnRbMV0gPSB0b1BvaW50WzFdID0gTWF0aC5yb3VuZChmcm9tUG9pbnRbMV0pICsgKHdpZHRoICUgMiAvIDIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICdNJyArIGZyb21Qb2ludC5qb2luKCcgJykgKyAnTCcgKyB0b1BvaW50LmpvaW4oJyAnKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNlbnRlciBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBmcm9tUG9zIGZyb20gcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gdG9Qb3MgdG8gcG9zaXRpb25cbiAgICAgKiBAcmV0dXJucyB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBwb3NpdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldENlbnRlcjogZnVuY3Rpb24oZnJvbVBvcywgdG9Qb3MpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxlZnQ6IChmcm9tUG9zLmxlZnQgKyB0b1Bvcy5sZWZ0KSAvIDIsXG4gICAgICAgICAgICB0b3A6IChmcm9tUG9zLnRvcCArIHRvUG9zLnRvcCkgLyAyXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBsaW5lXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0aCBsaW5lIHBhdGhcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29sb3IgbGluZSBjb2xvclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdHJva2VXaWR0aCBzdHJva2Ugd2lkdGhcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSByYXBoYWVsIGxpbmVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJMaW5lOiBmdW5jdGlvbihwYXBlciwgcGF0aCwgY29sb3IsIHN0cm9rZVdpZHRoKSB7XG4gICAgICAgIHZhciBsaW5lID0gcGFwZXIucGF0aChbcGF0aF0pLFxuICAgICAgICAgICAgc3Ryb2tlU3R5bGUgPSB7XG4gICAgICAgICAgICAgICAgc3Ryb2tlOiBjb2xvcixcbiAgICAgICAgICAgICAgICAnc3Ryb2tlLXdpZHRoJzogc3Ryb2tlV2lkdGggfHwgMlxuICAgICAgICAgICAgfTtcblxuICAgICAgICBpZiAoY29sb3IgPT09ICd0cmFuc3BhcmVudCcpIHtcbiAgICAgICAgICAgIHN0cm9rZVN0eWxlLnN0cm9rZSA9ICcjZmZmJztcbiAgICAgICAgICAgIHN0cm9rZVN0eWxlWydzdHJva2Utb3BhY2l0eSddID0gMDtcbiAgICAgICAgfVxuICAgICAgICBsaW5lLmF0dHIoc3Ryb2tlU3R5bGUpO1xuXG4gICAgICAgIHJldHVybiBsaW5lO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgYmFja2dyb3VuZCBsaW5lcy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5LjxzdHJpbmc+Pn0gZ3JvdXBQYXRocyBwYXRoc1xuICAgICAqIEByZXR1cm5zIHthcnJheS48YXJyYXkuPG9iamVjdD4+fSBsaW5lc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlckJnTGluZXM6IGZ1bmN0aW9uKHBhcGVyLCBncm91cFBhdGhzKSB7XG4gICAgICAgIHZhciBncm91cExpbmVzID0gdGhpcy5fcmVuZGVyTGluZXMocGFwZXIsIGdyb3VwUGF0aHMsIFtdLCAxMCk7XG4gICAgICAgIHJldHVybiBncm91cExpbmVzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgbGluZXMuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheS48c3RyaW5nPj59IGdyb3VwUGF0aHMgcGF0aHNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBjb2xvcnMgbGluZSBjb2xvcnNcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3Ryb2tlV2lkdGggc3Ryb2tlIHdpZHRoXG4gICAgICogQHJldHVybnMge2FycmF5LjxhcnJheS48b2JqZWN0Pj59IGxpbmVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyTGluZXM6IGZ1bmN0aW9uKHBhcGVyLCBncm91cFBhdGhzLCBjb2xvcnMsIHN0cm9rZVdpZHRoKSB7XG4gICAgICAgIHZhciBncm91cExpbmVzID0gbmUudXRpbC5tYXAoZ3JvdXBQYXRocywgZnVuY3Rpb24ocGF0aHMsIGdyb3VwSW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBjb2xvciA9IGNvbG9yc1tncm91cEluZGV4XSB8fCAndHJhbnNwYXJlbnQnO1xuICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwubWFwKHBhdGhzLCBmdW5jdGlvbihwYXRoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGZpcnN0TGluZSA9IHRoaXMuX3JlbmRlckxpbmUocGFwZXIsIHBhdGhbMF0sIGNvbG9yLCBzdHJva2VXaWR0aCksXG4gICAgICAgICAgICAgICAgICAgIHNlY29uZExpbmUgPSB0aGlzLl9yZW5kZXJMaW5lKHBhcGVyLCBwYXRoWzFdLCBjb2xvciwgc3Ryb2tlV2lkdGgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBbZmlyc3RMaW5lLCBzZWNvbmRMaW5lXTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICByZXR1cm4gZ3JvdXBMaW5lcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGxpbmVzIHBhdGguXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXkuPG9iamVjdD4+fSBncm91cFBvc2l0aW9ucyBwb3NpdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxzdHJpbmc+Pn0gcGF0aHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRMaW5lc1BhdGg6IGZ1bmN0aW9uKGdyb3VwUG9zaXRpb25zKSB7XG4gICAgICAgIHZhciBncm91cFBhdGhzID0gbmUudXRpbC5tYXAoZ3JvdXBQb3NpdGlvbnMsIGZ1bmN0aW9uKHBvc2l0aW9ucykge1xuICAgICAgICAgICAgdmFyIGZyb21Qb3MgPSBwb3NpdGlvbnNbMF0sXG4gICAgICAgICAgICAgICAgcmVzdCA9IHBvc2l0aW9ucy5zbGljZSgxKTtcbiAgICAgICAgICAgIHJldHVybiBuZS51dGlsLm1hcChyZXN0LCBmdW5jdGlvbihwb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIHZhciBjZW50ZXJQb3MgPSB0aGlzLl9nZXRDZW50ZXIoZnJvbVBvcywgcG9zaXRpb24pLFxuICAgICAgICAgICAgICAgICAgICBmaXJzdFBhdGggPSB0aGlzLl9tYWtlTGluZVBhdGgoZnJvbVBvcy5sZWZ0LCBmcm9tUG9zLnRvcCwgY2VudGVyUG9zLmxlZnQsIGNlbnRlclBvcy50b3ApLFxuICAgICAgICAgICAgICAgICAgICBzZWNvbmRQYXRoID0gdGhpcy5fbWFrZUxpbmVQYXRoKGNlbnRlclBvcy5sZWZ0LCBjZW50ZXJQb3MudG9wLCBwb3NpdGlvbi5sZWZ0LCBwb3NpdGlvbi50b3ApO1xuICAgICAgICAgICAgICAgIGZyb21Qb3MgPSBwb3NpdGlvbjtcbiAgICAgICAgICAgICAgICByZXR1cm4gW2ZpcnN0UGF0aCwgc2Vjb25kUGF0aF07XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIHJldHVybiBncm91cFBhdGhzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBCaW5kIGhvdmVyIGV2ZW50LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0YXJnZXQgcmFwaGFlbCBpdGVtXG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IHBvc2l0aW9uIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGlkIGlkXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gaW5DYWxsYmFjayBpbiBjYWxsYmFja1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG91dENhbGxiYWNrIG91dCBjYWxsYmFja1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2JpbmRIb3ZlckV2ZW50OiBmdW5jdGlvbih0YXJnZXQsIHBvc2l0aW9uLCBpZCwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICB0YXJnZXQuaG92ZXIoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGF0LnNob3dlZElkID0gaWQ7XG4gICAgICAgICAgICBpbkNhbGxiYWNrKHBvc2l0aW9uLCBpZCk7XG4gICAgICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgb3V0Q2FsbGJhY2soaWQpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGV2ZW50LlxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gZ3JvdXBEb3RzIGRvdHNcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheS48b2JqZWN0Pj59IGdyb3VwUG9zaXRpb25zIHBvc2l0aW9uc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvdXREb3RTdHlsZSBkb3Qgc3R5bGVcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBpbkNhbGxiYWNrIGluIGNhbGxiYWNrXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gb3V0Q2FsbGJhY2sgb3V0IGNhbGxiYWNrXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYXR0YWNoRXZlbnQ6IGZ1bmN0aW9uKGdyb3VwRG90cywgZ3JvdXBQb3NpdGlvbnMsIG91dERvdFN0eWxlLCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjaykge1xuICAgICAgICBuZS51dGlsLmZvckVhY2goZ3JvdXBEb3RzLCBmdW5jdGlvbihkb3RzLCBncm91cEluZGV4KSB7XG4gICAgICAgICAgICBuZS51dGlsLmZvckVhY2goZG90cywgZnVuY3Rpb24oZG90LCBpbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciBwb3NpdGlvbiA9IGdyb3VwUG9zaXRpb25zW2dyb3VwSW5kZXhdW2luZGV4XSxcbiAgICAgICAgICAgICAgICAgICAgaWQgPSBpbmRleCArICctJyArIGdyb3VwSW5kZXg7XG4gICAgICAgICAgICAgICAgICAgIC8vcHJldkluZGV4LCBwcmV2RG90LCBwcmV2UG9zaXRvbiwgcHJldklkLCBiZ0xpbmVzLCBsaW5lcztcbiAgICAgICAgICAgICAgICB0aGlzLl9iaW5kSG92ZXJFdmVudChkb3QsIHBvc2l0aW9uLCBpZCwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIC8vaWYgKGluZGV4ID4gMCkge1xuICAgICAgICAgICAgICAgIC8vICAgIHByZXZJbmRleCA9IGluZGV4IC0gMTtcbiAgICAgICAgICAgICAgICAvLyAgICBwcmV2RG90ID0gc2NvcGVbcHJldkluZGV4XTtcbiAgICAgICAgICAgICAgICAvLyAgICBwcmV2UG9zaXRvbiA9IGdyb3VwUG9zaXRpb25zW2dyb3VwSW5kZXhdW3ByZXZJbmRleF07XG4gICAgICAgICAgICAgICAgLy8gICAgcHJldklkID0gcHJldkluZGV4ICsgJy0nICsgZ3JvdXBJbmRleDtcbiAgICAgICAgICAgICAgICAvLyAgICAvL2JnTGluZXMgPSBncm91cEJnTGluZXNbZ3JvdXBJbmRleF1bcHJldkluZGV4XTtcbiAgICAgICAgICAgICAgICAvLyAgICBsaW5lcyA9IGdyb3VwTGluZXNbZ3JvdXBJbmRleF1bcHJldkluZGV4XTtcbiAgICAgICAgICAgICAgICAvLyAgICB0aGlzLl9iaW5kSG92ZXJFdmVudChiZ0xpbmVzWzBdLCBwcmV2RG90LCBvdXREb3RTdHlsZSwgcHJldlBvc2l0b24sIHByZXZJZCwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIC8vICAgIHRoaXMuX2JpbmRIb3ZlckV2ZW50KGJnTGluZXNbMV0sIGRvdCwgb3V0RG90U3R5bGUsIHBvc2l0aW9uLCBpZCwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIC8vICAgIHRoaXMuX2JpbmRIb3ZlckV2ZW50KGxpbmVzWzBdLCBwcmV2RG90LCBvdXREb3RTdHlsZSwgcHJldlBvc2l0b24sIHByZXZJZCwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIC8vICAgIHRoaXMuX2JpbmRIb3ZlckV2ZW50KGxpbmVzWzFdLCBkb3QsIG91dERvdFN0eWxlLCBwb3NpdGlvbiwgaWQsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICAvL31cbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2hvdyBhbmltYXRpb24uXG4gICAgICogQHBhcmFtIHt7Z3JvdXBJbmRleDogbnVtYmVyLCBpbmRleDpudW1iZXJ9fSBkYXRhIHNob3cgaW5mb1xuICAgICAqL1xuICAgIHNob3dBbmltYXRpb246IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gZGF0YS5ncm91cEluZGV4LCAvLyBMaW5lIGNoYXJ0IGhhcyBwaXZvdCB2YWx1ZXMuXG4gICAgICAgICAgICBncm91cEluZGV4ID0gZGF0YS5pbmRleCxcbiAgICAgICAgICAgIGRvdCA9IHRoaXMuZ3JvdXBEb3RzW2dyb3VwSW5kZXhdW2luZGV4XTtcblxuICAgICAgICBkb3QuYXR0cih7XG4gICAgICAgICAgICAnZmlsbC1vcGFjaXR5JzogMSxcbiAgICAgICAgICAgICdzdHJva2Utb3BhY2l0eSc6IDAuMyxcbiAgICAgICAgICAgICdzdHJva2Utd2lkdGgnOiAzLFxuICAgICAgICAgICAgcjogSE9WRVJfRE9UX1dJRFRIXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBIaWRlIGFuaW1hdGlvbi5cbiAgICAgKiBAcGFyYW0ge3tncm91cEluZGV4OiBudW1iZXIsIGluZGV4Om51bWJlcn19IGRhdGEgaGlkZSBpbmZvXG4gICAgICovXG4gICAgaGlkZUFuaW1hdGlvbjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgaW5kZXggPSBkYXRhLmdyb3VwSW5kZXgsIC8vIExpbmUgY2hhcnQgaGFzIHBpdm90IHZhbHVlcy5cbiAgICAgICAgICAgIGdyb3VwSW5kZXggPSBkYXRhLmluZGV4LFxuICAgICAgICAgICAgZG90ID0gdGhpcy5ncm91cERvdHNbZ3JvdXBJbmRleF1baW5kZXhdO1xuXG4gICAgICAgIGRvdC5hdHRyKHRoaXMub3V0RG90U3R5bGUpO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhcGhhZWxMaW5lQ2hhcnQ7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgUmFwaGFlbCBwaWUgY2hhcnQgcmVuZGVyZXIuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSYXBoYWVsID0gd2luZG93LlJhcGhhZWwsXG4gICAgUkFEID0gTWF0aC5QSSAvIDE4MCxcbiAgICBBTklNQVRJT05fVElNRSA9IDUwMDtcblxuLyoqXG4gKiBAY2xhc3NkZXNjIFJhcGhhZWxQaWVDaGFydHMgaXMgZ3JhcGggcmVuZGVyZXIuXG4gKiBAY2xhc3MgUmFwaGFlbFBpZUNoYXJ0XG4gKi9cbnZhciBSYXBoYWVsUGllQ2hhcnQgPSBuZS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgUmFwaGFlbFBpZUNoYXJ0LnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogUmVuZGVyIGZ1bmN0aW9uIG9yIGxpbmUgY2hhcnQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY29udGFpbmVyXG4gICAgICogQHBhcmFtIHt7cGVyY2VudFZhbHVlczogYXJyYXkuPG51bWJlcj4sIGNpcmNsZUJvdW5kczoge2N4OiBudW1iZXIsIGN5OiBudW1iZXIsIHI6IG51bWJlcn0sIGRpbWVuc2lvbjogb2JqZWN0LCB0aGVtZTogb2JqZWN0LCBvcHRpb25zOiBvYmplY3R9fSBkYXRhIHJlbmRlciBkYXRhXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gaW5DYWxsYmFjayBpbiBjYWxsYmFja1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG91dENhbGxiYWNrIG91dCBjYWxsYmFja1xuICAgICAqIEByZXR1cm4ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqL1xuICAgIHJlbmRlcjogZnVuY3Rpb24ocGFwZXIsIGNvbnRhaW5lciwgZGF0YSwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGRpbWVuc2lvbiA9IGRhdGEuZGltZW5zaW9uO1xuICAgICAgICBpZiAoIXBhcGVyKSB7XG4gICAgICAgICAgICBwYXBlciA9IFJhcGhhZWwoY29udGFpbmVyLCBkaW1lbnNpb24ud2lkdGgsIGRpbWVuc2lvbi5oZWlnaHQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3JlbmRlclBpZShwYXBlciwgZGF0YSwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spO1xuXG4gICAgICAgIHJldHVybiBwYXBlcjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIHNlY3RvclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5wYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICogICAgICBAcGFyYW0ge3tjeDogbnVtYmVyLCBjeTogbnVtYmVyLCByOm51bWJlcn19IHBhcmFtcy5jaXJjbGVCb3VuZHMgY2lyY2xlIGJvdW5kc1xuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5zdGFydEFuZ2xlIHN0YXJ0IGFuZ2xlXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmVuZEFuZ2xlIGVuZCBhbmdsZVxuICAgICAqICAgICAgQHBhcmFtIHt7ZmlsbDogc3RyaW5nLCBzdHJva2U6IHN0cmluZywgc3RyaWtlLXdpZHRoOiBzdHJpbmd9fSBwYXJhbXMuYXR0cnMgYXR0cnNcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSByYXBoYWVsIG9iamVjdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlclNlY3RvcjogZnVuY3Rpb24gKHBhcmFtcykge1xuICAgICAgICB2YXIgY3ggPSBwYXJhbXMuY2lyY2xlQm91bmRzLmN4LFxuICAgICAgICAgICAgY3kgPSBwYXJhbXMuY2lyY2xlQm91bmRzLmN5LFxuICAgICAgICAgICAgciA9IHBhcmFtcy5jaXJjbGVCb3VuZHMucixcbiAgICAgICAgICAgIHgxID0gY3ggKyByICogTWF0aC5jb3MoLXBhcmFtcy5zdGFydEFuZ2xlICogUkFEKSxcbiAgICAgICAgICAgIHgyID0gY3ggKyByICogTWF0aC5jb3MoLXBhcmFtcy5lbmRBbmdsZSAqIFJBRCksXG4gICAgICAgICAgICB5MSA9IGN5ICsgciAqIE1hdGguc2luKC1wYXJhbXMuc3RhcnRBbmdsZSAqIFJBRCksXG4gICAgICAgICAgICB5MiA9IGN5ICsgciAqIE1hdGguc2luKC1wYXJhbXMuZW5kQW5nbGUgKiBSQUQpLFxuICAgICAgICAgICAgcGF0aFBhcmFtID0gW1wiTVwiLCBjeCwgY3ksIFwiTFwiLCB4MSwgeTEsIFwiQVwiLCByLCByLCAwLCArKHBhcmFtcy5lbmRBbmdsZSAtIHBhcmFtcy5zdGFydEFuZ2xlID4gMTgwKSwgMCwgeDIsIHkyLCBcInpcIl07XG4gICAgICAgIHJldHVybiBwYXJhbXMucGFwZXIucGF0aChwYXRoUGFyYW0pLmF0dHIocGFyYW1zLmF0dHJzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIHBpZSBncmFwaC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqIEBwYXJhbSB7e3BlcmNlbnRWYWx1ZXM6IGFycmF5LjxudW1iZXI+LCBjaXJjbGVCb3VuZHM6IHtjeDogbnVtYmVyLCBjeTogbnVtYmVyLCByOiBudW1iZXJ9LCBkaW1lbnNpb246IG9iamVjdCwgdGhlbWU6IG9iamVjdCwgb3B0aW9uczogb2JqZWN0fX0gZGF0YSByZW5kZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGluQ2FsbGJhY2sgaW4gY2FsbGJhY2tcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvdXRDYWxsYmFjayBvdXQgY2FsbGJhY2tcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJQaWU6IGZ1bmN0aW9uKHBhcGVyLCBkYXRhLCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjaykge1xuICAgICAgICB2YXIgcGVyY2VudFZhbHVlcyA9IGRhdGEucGVyY2VudFZhbHVlc1swXSxcbiAgICAgICAgICAgIGNpcmNsZUJvdW5kcyA9IGRhdGEuY2lyY2xlQm91bmRzLFxuICAgICAgICAgICAgY29sb3JzID0gZGF0YS50aGVtZS5jb2xvcnMsXG4gICAgICAgICAgICBjaGFydEJhY2tncm91bmQgPSBkYXRhLmNoYXJ0QmFja2dyb3VuZCxcbiAgICAgICAgICAgIGN4ID0gY2lyY2xlQm91bmRzLmN4LFxuICAgICAgICAgICAgY3kgPSBjaXJjbGVCb3VuZHMuY3ksXG4gICAgICAgICAgICByID0gY2lyY2xlQm91bmRzLnIsXG4gICAgICAgICAgICBhbmdsZSA9IDAsXG4gICAgICAgICAgICBkZWx0YSA9IDEwLFxuICAgICAgICAgICAgY2hhcnQgPSBwYXBlci5zZXQoKTtcblxuICAgICAgICBuZS51dGlsLmZvckVhY2hBcnJheShwZXJjZW50VmFsdWVzLCBmdW5jdGlvbihwZXJjZW50VmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgYW5nbGVQbHVzID0gMzYwICogcGVyY2VudFZhbHVlLFxuICAgICAgICAgICAgICAgIHBvcEFuZ2xlID0gYW5nbGUgKyAoYW5nbGVQbHVzIC8gMiksXG4gICAgICAgICAgICAgICAgY29sb3IgPSBjb2xvcnNbaW5kZXhdLFxuICAgICAgICAgICAgICAgIHAgPSB0aGlzLl9yZW5kZXJTZWN0b3Ioe1xuICAgICAgICAgICAgICAgICAgICBwYXBlcjogcGFwZXIsXG4gICAgICAgICAgICAgICAgICAgIGNpcmNsZUJvdW5kczogY2lyY2xlQm91bmRzLFxuICAgICAgICAgICAgICAgICAgICBzdGFydEFuZ2xlOiBhbmdsZSxcbiAgICAgICAgICAgICAgICAgICAgZW5kQW5nbGU6IGFuZ2xlICsgYW5nbGVQbHVzLFxuICAgICAgICAgICAgICAgICAgICBhdHRyczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsbDogXCI5MC1cIiArIGNvbG9yICsgXCItXCIgKyBjb2xvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cm9rZTogY2hhcnRCYWNrZ3JvdW5kLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3N0cm9rZS13aWR0aCc6IDFcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uID0ge1xuICAgICAgICAgICAgICAgICAgICBsZWZ0OiBjeCArIChyICsgZGVsdGEpICogTWF0aC5jb3MoLXBvcEFuZ2xlICogUkFEKSxcbiAgICAgICAgICAgICAgICAgICAgdG9wOiBjeSArIChyICsgZGVsdGEpICogTWF0aC5zaW4oLXBvcEFuZ2xlICogUkFEKVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuX2JpbmRIb3ZlckV2ZW50KHtcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IHAsXG4gICAgICAgICAgICAgICAgcG9zaXRpb246IHBvc2l0aW9uLFxuICAgICAgICAgICAgICAgIGlkOiAnMC0nICsgaW5kZXgsXG4gICAgICAgICAgICAgICAgaW5DYWxsYmFjazogaW5DYWxsYmFjayxcbiAgICAgICAgICAgICAgICBvdXRDYWxsYmFjazogb3V0Q2FsbGJhY2tcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY2hhcnQucHVzaChwKTtcbiAgICAgICAgICAgIGFuZ2xlICs9IGFuZ2xlUGx1cztcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgdGhpcy5jaXJjbGVCb3VuZHMgPSBjaXJjbGVCb3VuZHM7XG4gICAgICAgIHRoaXMuY2hhcnQgPSBjaGFydDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQmluZCBob3ZlciBldmVudC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGFyZ2V0IHJhcGhhZWwgaXRlbVxuICAgICAqICAgICAgQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IHBhcmFtcy5wb3NpdGlvbiBwb3NpdGlvblxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5pZCBpZFxuICAgICAqICAgICAgQHBhcmFtIHtmdW5jdGlvbn0gcGFyYW1zLmluQ2FsbGJhY2sgaW4gY2FsbGJhY2tcbiAgICAgKiAgICAgIEBwYXJhbSB7ZnVuY3Rpb259IHBhcmFtcy5vdXRDYWxsYmFjayBvdXQgY2FsbGJhY2tcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9iaW5kSG92ZXJFdmVudDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgcGFyYW1zLnRhcmdldC5tb3VzZW92ZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhhdC5zaG93ZWRJZCA9IHBhcmFtcy5pZDtcbiAgICAgICAgICAgIHBhcmFtcy5pbkNhbGxiYWNrKHBhcmFtcy5wb3NpdGlvbiwgcGFyYW1zLmlkKTtcbiAgICAgICAgfSkubW91c2VvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcGFyYW1zLm91dENhbGxiYWNrKHBhcmFtcy5pZCk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTaG93IGFuaW1hdGlvbi5cbiAgICAgKiBAcGFyYW0ge3tncm91cEluZGV4OiBudW1iZXIsIGluZGV4Om51bWJlcn19IGRhdGEgc2hvdyBpbmZvXG4gICAgICovXG4gICAgc2hvd0FuaW1hdGlvbjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgdGFyZ2V0ID0gdGhpcy5jaGFydFtkYXRhLmluZGV4XSxcbiAgICAgICAgICAgIGN4ID0gdGhpcy5jaXJjbGVCb3VuZHMuY3gsXG4gICAgICAgICAgICBjeSA9IHRoaXMuY2lyY2xlQm91bmRzLmN5O1xuICAgICAgICB0YXJnZXQuc3RvcCgpLmFuaW1hdGUoe3RyYW5zZm9ybTogXCJzMS4xIDEuMSBcIiArIGN4ICsgXCIgXCIgKyBjeX0sIEFOSU1BVElPTl9USU1FLCBcImVsYXN0aWNcIik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhpZGUgYW5pbWF0aW9uLlxuICAgICAqIEBwYXJhbSB7e2dyb3VwSW5kZXg6IG51bWJlciwgaW5kZXg6bnVtYmVyfX0gZGF0YSBoaWRlIGluZm9cbiAgICAgKi9cbiAgICBoaWRlQW5pbWF0aW9uOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciB0YXJnZXQgPSB0aGlzLmNoYXJ0W2RhdGEuaW5kZXhdO1xuICAgICAgICB0YXJnZXQuc3RvcCgpLmFuaW1hdGUoe3RyYW5zZm9ybTogXCJcIn0sIEFOSU1BVElPTl9USU1FLCBcImVsYXN0aWNcIik7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmFwaGFlbFBpZUNoYXJ0O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4vY29uc3QuanMnKSxcbiAgICBjaGFydEZhY3RvcnkgPSByZXF1aXJlKCcuL2ZhY3Rvcmllcy9jaGFydEZhY3RvcnkuanMnKSxcbiAgICBCYXJDaGFydCA9IHJlcXVpcmUoJy4vY2hhcnRzL2JhckNoYXJ0LmpzJyksXG4gICAgQ29sdW1uQ2hhcnQgPSByZXF1aXJlKCcuL2NoYXJ0cy9jb2x1bW5DaGFydC5qcycpLFxuICAgIExpbmVDaGFydCA9IHJlcXVpcmUoJy4vY2hhcnRzL2xpbmVDaGFydC5qcycpLFxuICAgIENvbWJvQ2hhcnQgPSByZXF1aXJlKCcuL2NoYXJ0cy9jb21ib0NoYXJ0LmpzJyksXG4gICAgUGllQ2hhcnQgPSByZXF1aXJlKCcuL2NoYXJ0cy9waWVDaGFydC5qcycpO1xuXG5jaGFydEZhY3RvcnkucmVnaXN0ZXIoY2hhcnRDb25zdC5DSEFSVF9UWVBFX0JBUiwgQmFyQ2hhcnQpO1xuY2hhcnRGYWN0b3J5LnJlZ2lzdGVyKGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9DT0xVTU4sIENvbHVtbkNoYXJ0KTtcbmNoYXJ0RmFjdG9yeS5yZWdpc3RlcihjaGFydENvbnN0LkNIQVJUX1RZUEVfTElORSwgTGluZUNoYXJ0KTtcbmNoYXJ0RmFjdG9yeS5yZWdpc3RlcihjaGFydENvbnN0LkNIQVJUX1RZUEVfQ09NQk8sIENvbWJvQ2hhcnQpO1xuY2hhcnRGYWN0b3J5LnJlZ2lzdGVyKGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9QSUUsIFBpZUNoYXJ0KTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuL2NvbnN0LmpzJyksXG4gICAgdGhlbWVGYWN0b3J5ID0gcmVxdWlyZSgnLi9mYWN0b3JpZXMvdGhlbWVGYWN0b3J5LmpzJyksXG4gICAgZGVmYXVsdFRoZW1lID0gcmVxdWlyZSgnLi90aGVtZXMvZGVmYXVsdFRoZW1lLmpzJyk7XG5cbnRoZW1lRmFjdG9yeS5yZWdpc3RlcihjaGFydENvbnN0LkRFRkFVTFRfVEhFTUVfTkFNRSwgZGVmYXVsdFRoZW1lKTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBCYXIgY2hhcnQgc2VyaWVzIGNvbXBvbmVudC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFNlcmllcyA9IHJlcXVpcmUoJy4vc2VyaWVzLmpzJyksXG4gICAgcmVuZGVyVXRpbCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvcmVuZGVyVXRpbC5qcycpO1xuXG52YXIgSElEREVOX1dJRFRIID0gMTtcblxudmFyIEJhckNoYXJ0U2VyaWVzID0gbmUudXRpbC5kZWZpbmVDbGFzcyhTZXJpZXMsIC8qKiBAbGVuZHMgU2VyaWVzLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogQmFyIGNoYXJ0IHNlcmllcyBjb21wb25lbnQuXG4gICAgICogQGNvbnN0cnVjdHMgQmFyQ2hhcnRTZXJpZXNcbiAgICAgKiBAZXh0ZW5kcyBTZXJpZXNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMubW9kZWwgc2VyaWVzIG1vZGVsXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgc2VyaWVzIG9wdGlvbnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgc2VyaWVzIHRoZW1lXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIFNlcmllcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGJvdW5kcyBvZiBiYXIgY2hhcnQuXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0Om51bWJlcn19IGRpbWVuc2lvbiBiYXIgY2hhcnQgZGltZW5zaW9uXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGhpZGRlbldpZHRoIGhpZGRlbiB3aWR0aFxuICAgICAqIEByZXR1cm5zIHthcnJheS48YXJyYXkuPG9iamVjdD4+fSBib3VuZHNcbiAgICAgKi9cbiAgICBfbWFrZUJvdW5kczogZnVuY3Rpb24oZGltZW5zaW9uLCBoaWRkZW5XaWR0aCkge1xuICAgICAgICBoaWRkZW5XaWR0aCA9IGhpZGRlbldpZHRoIHx8IChyZW5kZXJVdGlsLmlzSUU4KCkgPyAwIDogSElEREVOX1dJRFRIKTtcbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuc3RhY2tlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21ha2VOb3JtYWxCYXJCb3VuZHMoZGltZW5zaW9uLCBoaWRkZW5XaWR0aCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbWFrZVN0YWNrZWRCYXJCb3VuZHMoZGltZW5zaW9uLCBoaWRkZW5XaWR0aCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBib3VuZHMgb2Ygbm9ybWFsIGJhciBjaGFydC5cbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6bnVtYmVyfX0gZGltZW5zaW9uIGJhciBjaGFydCBkaW1lbnNpb25cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaGlkZGVuV2lkdGggaGlkZGVuIHdpZHRoXG4gICAgICogQHJldHVybnMge2FycmF5LjxhcnJheS48b2JqZWN0Pj59IGJvdW5kc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VOb3JtYWxCYXJCb3VuZHM6IGZ1bmN0aW9uKGRpbWVuc2lvbiwgaGlkZGVuV2lkdGgpIHtcbiAgICAgICAgdmFyIGdyb3VwVmFsdWVzID0gdGhpcy5wZXJjZW50VmFsdWVzLFxuICAgICAgICAgICAgZ3JvdXBIZWlnaHQgPSAoZGltZW5zaW9uLmhlaWdodCAvIGdyb3VwVmFsdWVzLmxlbmd0aCksXG4gICAgICAgICAgICBiYXJIZWlnaHQgPSBncm91cEhlaWdodCAvIChncm91cFZhbHVlc1swXS5sZW5ndGggKyAxKSxcbiAgICAgICAgICAgIGJvdW5kcyA9IG5lLnV0aWwubWFwKGdyb3VwVmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMsIGdyb3VwSW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFkZGluZ1RvcCA9IChncm91cEhlaWdodCAqIGdyb3VwSW5kZXgpICsgKGJhckhlaWdodCAvIDIpICsgaGlkZGVuV2lkdGg7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24gKHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiBwYWRkaW5nVG9wICsgKGJhckhlaWdodCAqIGluZGV4KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6IC1ISURERU5fV0lEVEgsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogdmFsdWUgKiBkaW1lbnNpb24ud2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IGJhckhlaWdodFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBib3VuZHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYm91bmRzIG9mIHN0YWNrZWQgYmFyIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDpudW1iZXJ9fSBkaW1lbnNpb24gYmFyIGNoYXJ0IGRpbWVuc2lvblxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBoaWRkZW5XaWR0aCBoaWRkZW4gd2lkdGhcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gYm91bmRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVN0YWNrZWRCYXJCb3VuZHM6IGZ1bmN0aW9uKGRpbWVuc2lvbiwgaGlkZGVuV2lkdGgpIHtcbiAgICAgICAgdmFyIGdyb3VwVmFsdWVzID0gdGhpcy5wZXJjZW50VmFsdWVzLFxuICAgICAgICAgICAgZ3JvdXBIZWlnaHQgPSAoZGltZW5zaW9uLmhlaWdodCAvIGdyb3VwVmFsdWVzLmxlbmd0aCksXG4gICAgICAgICAgICBiYXJIZWlnaHQgPSBncm91cEhlaWdodCAvIDIsXG4gICAgICAgICAgICBib3VuZHMgPSBuZS51dGlsLm1hcChncm91cFZhbHVlcywgZnVuY3Rpb24odmFsdWVzLCBncm91cEluZGV4KSB7XG4gICAgICAgICAgICAgICAgdmFyIHBhZGRpbmdUb3AgPSAoZ3JvdXBIZWlnaHQgKiBncm91cEluZGV4KSArIChiYXJIZWlnaHQgLyAyKSArIGhpZGRlbldpZHRoLFxuICAgICAgICAgICAgICAgICAgICBsZWZ0ID0gLUhJRERFTl9XSURUSDtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHdpZHRoID0gdmFsdWUgKiBkaW1lbnNpb24ud2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBib3VuZCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3A6IHBhZGRpbmdUb3AsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogbGVmdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogd2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBiYXJIZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIGxlZnQgPSBsZWZ0ICsgd2lkdGg7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBib3VuZDtcbiAgICAgICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gYm91bmRzO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJhckNoYXJ0U2VyaWVzO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IENvbHVtbiBjaGFydCBzZXJpZXMgY29tcG9uZW50LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU2VyaWVzID0gcmVxdWlyZSgnLi9zZXJpZXMuanMnKTtcblxudmFyIEhJRERFTl9XSURUSCA9IDE7XG5cbnZhciBDb2x1bW5DaGFydFNlcmllcyA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoU2VyaWVzLCAvKiogQGxlbmRzIFNlcmllcy5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIENvbHVtbiBjaGFydCBzZXJpZXMgY29tcG9uZW50LlxuICAgICAqIEBjb25zdHJ1Y3RzIENvbHVtbkNoYXJ0U2VyaWVzXG4gICAgICogQGV4dGVuZHMgU2VyaWVzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm1vZGVsIHNlcmllcyBtb2RlbFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5vcHRpb25zIHNlcmllcyBvcHRpb25zXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIHNlcmllcyB0aGVtZVxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBTZXJpZXMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBib3VuZHMgb2YgY29sdW1uIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDpudW1iZXJ9fSBkaW1lbnNpb24gY29sdW1uIGNoYXJ0IGRpbWVuc2lvblxuICAgICAqIEByZXR1cm5zIHthcnJheS48YXJyYXkuPG9iamVjdD4+fSBib3VuZHNcbiAgICAgKi9cbiAgICBfbWFrZUJvdW5kczogZnVuY3Rpb24oZGltZW5zaW9uKSB7XG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLnN0YWNrZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9tYWtlTm9ybWFsQ29sdW1uQm91bmRzKGRpbWVuc2lvbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbWFrZVN0YWNrZWRDb2x1bW5Cb3VuZHMoZGltZW5zaW9uKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGJvdW5kcyBvZiBub3JtYWwgY29sdW1uIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDpudW1iZXJ9fSBkaW1lbnNpb24gY29sdW1uIGNoYXJ0IGRpbWVuc2lvblxuICAgICAqIEByZXR1cm5zIHthcnJheS48YXJyYXkuPG9iamVjdD4+fSBib3VuZHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlTm9ybWFsQ29sdW1uQm91bmRzOiBmdW5jdGlvbihkaW1lbnNpb24pIHtcbiAgICAgICAgdmFyIGdyb3VwVmFsdWVzID0gdGhpcy5wZXJjZW50VmFsdWVzLFxuICAgICAgICAgICAgZ3JvdXBXaWR0aCA9IChkaW1lbnNpb24ud2lkdGggLyBncm91cFZhbHVlcy5sZW5ndGgpLFxuICAgICAgICAgICAgYmFyV2lkdGggPSBncm91cFdpZHRoIC8gKGdyb3VwVmFsdWVzWzBdLmxlbmd0aCArIDEpLFxuICAgICAgICAgICAgYm91bmRzID0gbmUudXRpbC5tYXAoZ3JvdXBWYWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcywgZ3JvdXBJbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciBwYWRkaW5nTGVmdCA9IChncm91cFdpZHRoICogZ3JvdXBJbmRleCkgKyAoYmFyV2lkdGggLyAyKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbiAodmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBiYXJIZWlnaHQgPSB2YWx1ZSAqIGRpbWVuc2lvbi5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3A6IGRpbWVuc2lvbi5oZWlnaHQgLSBiYXJIZWlnaHQgKyBISURERU5fV0lEVEgsXG4gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiBwYWRkaW5nTGVmdCArIChiYXJXaWR0aCAqIGluZGV4KSAtIEhJRERFTl9XSURUSCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiBiYXJXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogYmFySGVpZ2h0XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGJvdW5kcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBib3VuZHMgb2Ygc3RhY2tlZCBjb2x1bW4gY2hhcnQuXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0Om51bWJlcn19IGRpbWVuc2lvbiBjb2x1bW4gY2hhcnQgZGltZW5zaW9uXG4gICAgICogQHJldHVybnMge2FycmF5LjxhcnJheS48b2JqZWN0Pj59IGJvdW5kc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VTdGFja2VkQ29sdW1uQm91bmRzOiBmdW5jdGlvbihkaW1lbnNpb24pIHtcbiAgICAgICAgdmFyIGdyb3VwVmFsdWVzID0gdGhpcy5wZXJjZW50VmFsdWVzLFxuICAgICAgICAgICAgZ3JvdXBXaWR0aCA9IChkaW1lbnNpb24ud2lkdGggLyBncm91cFZhbHVlcy5sZW5ndGgpLFxuICAgICAgICAgICAgYmFyV2lkdGggPSBncm91cFdpZHRoIC8gMixcbiAgICAgICAgICAgIGJvdW5kcyA9IG5lLnV0aWwubWFwKGdyb3VwVmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMsIGdyb3VwSW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFkZGluZ0xlZnQgPSAoZ3JvdXBXaWR0aCAqIGdyb3VwSW5kZXgpICsgKGJhcldpZHRoIC8gMiksXG4gICAgICAgICAgICAgICAgICAgIHRvcCA9IDA7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBoZWlnaHQgPSB2YWx1ZSAqIGRpbWVuc2lvbi5oZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgICAgICBib3VuZCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3A6IGRpbWVuc2lvbi5oZWlnaHQgLSBoZWlnaHQgLSB0b3AsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogcGFkZGluZ0xlZnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGJhcldpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogaGVpZ2h0XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB0b3AgKz0gaGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYm91bmQ7XG4gICAgICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGJvdW5kcztcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb2x1bW5DaGFydFNlcmllcztcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBMaW5lIGNoYXJ0IHNlcmllcyBjb21wb25lbnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTZXJpZXMgPSByZXF1aXJlKCcuL3Nlcmllcy5qcycpO1xuXG52YXIgTGluZUNoYXJ0U2VyaWVzID0gbmUudXRpbC5kZWZpbmVDbGFzcyhTZXJpZXMsIC8qKiBAbGVuZHMgU2VyaWVzLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogTGluZSBjaGFydCBzZXJpZXMgY29tcG9uZW50LlxuICAgICAqIEBjb25zdHJ1Y3RzIExpbmVDaGFydFNlcmllc1xuICAgICAqIEBleHRlbmRzIFNlcmllc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5tb2RlbCBzZXJpZXMgbW9kZWxcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMub3B0aW9ucyBzZXJpZXMgb3B0aW9uc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBzZXJpZXMgdGhlbWVcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgU2VyaWVzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgcG9zaXRpb25zIG9mIGxpbmUgY2hhcnQuXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0Om51bmJlcn19IGRpbWVuc2lvbiBsaW5lIGNoYXJ0IGRpbWVuc2lvblxuICAgICAqIEByZXR1cm5zIHthcnJheS48YXJyYXkuPG9iamVjdD4+fSBwb3NpdGlvbnNcbiAgICAgKi9cbiAgICBfbWFrZVBvc2l0aW9uczogZnVuY3Rpb24oZGltZW5zaW9uKSB7XG4gICAgICAgIHZhciBncm91cFZhbHVlcyA9IHRoaXMucGVyY2VudFZhbHVlcyxcbiAgICAgICAgICAgIHdpZHRoID0gZGltZW5zaW9uLndpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0ID0gZGltZW5zaW9uLmhlaWdodCxcbiAgICAgICAgICAgIHN0ZXAgPSB3aWR0aCAvIGdyb3VwVmFsdWVzWzBdLmxlbmd0aCxcbiAgICAgICAgICAgIHN0YXJ0ID0gc3RlcCAvIDIsXG4gICAgICAgICAgICByZXN1bHQgPSBuZS51dGlsLm1hcChncm91cFZhbHVlcywgZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiBzdGFydCArIChzdGVwICogaW5kZXgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiBoZWlnaHQgLSAodmFsdWUgKiBoZWlnaHQpXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBMaW5lQ2hhcnRTZXJpZXM7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgUGllIGNoYXJ0IHNlcmllcyBjb21wb25lbnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTZXJpZXMgPSByZXF1aXJlKCcuL3Nlcmllcy5qcycpO1xuXG52YXIgUGllQ2hhcnRTZXJpZXMgPSBuZS51dGlsLmRlZmluZUNsYXNzKFNlcmllcywgLyoqIEBsZW5kcyBTZXJpZXMucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBMaW5lIGNoYXJ0IHNlcmllcyBjb21wb25lbnQuXG4gICAgICogQGNvbnN0cnVjdHMgUGllQ2hhcnRTZXJpZXNcbiAgICAgKiBAZXh0ZW5kcyBTZXJpZXNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMubW9kZWwgc2VyaWVzIG1vZGVsXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgc2VyaWVzIG9wdGlvbnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgc2VyaWVzIHRoZW1lXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIFNlcmllcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHBlcmNlbnQgdmFsdWUuXG4gICAgICogQHBhcmFtIHt7dmFsdWVzOiBhcnJheSwgc2NhbGU6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fX0gZGF0YSBzZXJpZXMgZGF0YVxuICAgICAqIEByZXR1cm5zIHthcnJheS48YXJyYXkuPG51bWJlcj4+fSBwZXJjZW50IHZhbHVlc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VQZXJjZW50VmFsdWVzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBuZS51dGlsLm1hcChkYXRhLnZhbHVlcywgZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgICAgICB2YXIgc3VtID0gbmUudXRpbC5zdW0odmFsdWVzKTtcbiAgICAgICAgICAgIHJldHVybiBuZS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlIC8gc3VtO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGNpcmNsZSBib3VuZHNcbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6bnVtYmVyfX0gZGltZW5zaW9uIGNoYXJ0IGRpbWVuc2lvblxuICAgICAqIEByZXR1cm5zIHt7Y3g6IG51bWJlciwgY3k6IG51bWJlciwgcjogbnVtYmVyfX0gY2lyY2xlIGJvdW5kc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VDaXJjbGVCb3VuZHM6IGZ1bmN0aW9uKGRpbWVuc2lvbikge1xuICAgICAgICB2YXIgd2lkdGggPSBkaW1lbnNpb24ud2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQgPSBkaW1lbnNpb24uaGVpZ2h0LFxuICAgICAgICAgICAgc3RkU2l6ZSA9IG5lLnV0aWwubXVsdGlwbGljYXRpb24obmUudXRpbC5taW4oW3dpZHRoLCBoZWlnaHRdKSwgMC44KTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGN4OiBuZS51dGlsLmRpdmlzaW9uKHdpZHRoLCAyKSxcbiAgICAgICAgICAgIGN5OiBuZS51dGlsLmRpdmlzaW9uKGhlaWdodCwgMiksXG4gICAgICAgICAgICByOiBuZS51dGlsLmRpdmlzaW9uKHN0ZFNpemUsIDIpXG4gICAgICAgIH07XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUGllQ2hhcnRTZXJpZXM7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgU2VyaWVzIGJhc2UgY29tcG9uZW50LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4uL2NvbnN0LmpzJyksXG4gICAgcmVuZGVyVXRpbCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvcmVuZGVyVXRpbC5qcycpLFxuICAgIGRvbSA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZG9tSGFuZGxlci5qcycpLFxuICAgIHBsdWdpbkZhY3RvcnkgPSByZXF1aXJlKCcuLi9mYWN0b3JpZXMvcGx1Z2luRmFjdG9yeS5qcycpO1xuXG52YXIgSElEREVOX1dJRFRIID0gMTtcblxudmFyIFNlcmllcyA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBTZXJpZXMucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBTZXJpZXMgYmFzZSBjb21wb25lbnQuXG4gICAgICogQGNvbnN0cnVjdHMgU2VyaWVzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm1vZGVsIHNlcmllcyBtb2RlbFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5vcHRpb25zIHNlcmllcyBvcHRpb25zXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIHNlcmllcyB0aGVtZVxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgbGliVHlwZTtcblxuICAgICAgICBuZS51dGlsLmV4dGVuZCh0aGlzLCBwYXJhbXMpO1xuICAgICAgICBsaWJUeXBlID0gcGFyYW1zLmxpYlR5cGUgfHwgY2hhcnRDb25zdC5ERUZBVUxUX1BMVUdJTjtcbiAgICAgICAgdGhpcy5wZXJjZW50VmFsdWVzID0gdGhpcy5fbWFrZVBlcmNlbnRWYWx1ZXMocGFyYW1zLmRhdGEsIHBhcmFtcy5vcHRpb25zLnN0YWNrZWQpO1xuICAgICAgICAvKipcbiAgICAgICAgICogR3JhcGggcmVuZGVyZXJcbiAgICAgICAgICogQHR5cGUge29iamVjdH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ3JhcGhSZW5kZXJlciA9IHBsdWdpbkZhY3RvcnkuZ2V0KGxpYlR5cGUsIHBhcmFtcy5jaGFydFR5cGUpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZXJpZXMgdmlldyBjbGFzc05hbWVcbiAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2xhc3NOYW1lID0gJ25lLWNoYXJ0LXNlcmllcy1hcmVhJztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2hvdyB0b29sdGlwIChtb3VzZW92ZXIgY2FsbGJhY2spLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwcmVmaXggdG9vbHRpcCBpZCBwcmVmaXhcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzVmVydGljYWwgd2hldGhlciB2ZXJ0aWNhbCBvciBub3RcbiAgICAgKiBAcGFyYW0ge3t0b3A6bnVtYmVyLCBsZWZ0OiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gYm91bmQgZ3JhcGggYm91bmQgaW5mb3JtYXRpb25cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgdG9vbHRpcCBpZFxuICAgICAqL1xuICAgIHNob3dUb29sdGlwOiBmdW5jdGlvbihwcmVmaXgsIGlzUG9pbnRQb3NpdGlvbiwgYm91bmQsIGlkKSB7XG4gICAgICAgIHRoaXMuZmlyZSgnc2hvd1Rvb2x0aXAnLCB7XG4gICAgICAgICAgICBpZDogcHJlZml4ICsgaWQsXG4gICAgICAgICAgICBpc1BvaW50UG9zaXRpb246IGlzUG9pbnRQb3NpdGlvbixcbiAgICAgICAgICAgIGJvdW5kOiBib3VuZFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSGlkZSB0b29sdGlwIChtb3VzZW91dCBjYWxsYmFjaykuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHByZWZpeCB0b29sdGlwIGlkIHByZWZpeFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpZCB0b29sdGlwIGlkXG4gICAgICovXG4gICAgaGlkZVRvb2x0aXA6IGZ1bmN0aW9uKHByZWZpeCwgaWQpIHtcbiAgICAgICAgdGhpcy5maXJlKCdoaWRlVG9vbHRpcCcsIHtcbiAgICAgICAgICAgIGlkOiBwcmVmaXggKyBpZFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIHNlcmllcy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgb2JqZWN0IGZvciBncmFwaCBkcmF3aW5nXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSBzZXJpZXMgZWxlbWVudFxuICAgICAqL1xuICAgIHJlbmRlcjogZnVuY3Rpb24ocGFwZXIpIHtcbiAgICAgICAgdmFyIGVsID0gZG9tLmNyZWF0ZSgnRElWJywgdGhpcy5jbGFzc05hbWUpLFxuICAgICAgICAgICAgdG9vbHRpcFByZWZpeCA9IHRoaXMudG9vbHRpcFByZWZpeCxcbiAgICAgICAgICAgIGJvdW5kID0gdGhpcy5ib3VuZCxcbiAgICAgICAgICAgIGlzUG9pbnRQb3NpdGlvbiA9ICEhdGhpcy5pc1BvaW50UG9zaXRpb24sXG4gICAgICAgICAgICBkaW1lbnNpb24gPSBib3VuZC5kaW1lbnNpb24sXG4gICAgICAgICAgICBwb3NpdGlvbiA9IGJvdW5kLnBvc2l0aW9uLFxuICAgICAgICAgICAgaW5DYWxsYmFjayA9IG5lLnV0aWwuYmluZCh0aGlzLnNob3dUb29sdGlwLCB0aGlzLCB0b29sdGlwUHJlZml4LCBpc1BvaW50UG9zaXRpb24pLFxuICAgICAgICAgICAgb3V0Q2FsbGJhY2sgPSBuZS51dGlsLmJpbmQodGhpcy5oaWRlVG9vbHRpcCwgdGhpcywgdG9vbHRpcFByZWZpeCksXG4gICAgICAgICAgICBoaWRkZW5XaWR0aCA9IHJlbmRlclV0aWwuaXNJRTgoKSA/IDAgOiBISURERU5fV0lEVEgsXG4gICAgICAgICAgICBkYXRhO1xuXG4gICAgICAgIGlmICghcGFwZXIpIHtcbiAgICAgICAgICAgIHJlbmRlclV0aWwucmVuZGVyRGltZW5zaW9uKGVsLCBkaW1lbnNpb24pO1xuXG4gICAgICAgICAgICBwb3NpdGlvbi50b3AgPSBwb3NpdGlvbi50b3AgKyAoaXNQb2ludFBvc2l0aW9uID8gLUhJRERFTl9XSURUSCA6IC0xKTtcbiAgICAgICAgICAgIHBvc2l0aW9uLnJpZ2h0ID0gcG9zaXRpb24ucmlnaHQgKyAoaXNQb2ludFBvc2l0aW9uID8gLShISURERU5fV0lEVEggKiAyKSA6IC1oaWRkZW5XaWR0aCk7XG5cbiAgICAgICAgICAgIHJlbmRlclV0aWwucmVuZGVyUG9zaXRpb24oZWwsIHBvc2l0aW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRhdGEgPSB7XG4gICAgICAgICAgICBkaW1lbnNpb246IGRpbWVuc2lvbixcbiAgICAgICAgICAgIHRoZW1lOiB0aGlzLnRoZW1lLFxuICAgICAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHRoaXMuX21ha2VCb3VuZHMpIHtcbiAgICAgICAgICAgIGRhdGEuZ3JvdXBCb3VuZHMgPSB0aGlzLl9tYWtlQm91bmRzKGRpbWVuc2lvbik7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fbWFrZVBvc2l0aW9ucykge1xuICAgICAgICAgICAgZGF0YS5ncm91cFBvc2l0aW9ucyA9IHRoaXMuX21ha2VQb3NpdGlvbnMoZGltZW5zaW9uKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9tYWtlQ2lyY2xlQm91bmRzKSB7XG4gICAgICAgICAgICBkYXRhLnBlcmNlbnRWYWx1ZXMgPSB0aGlzLnBlcmNlbnRWYWx1ZXM7XG4gICAgICAgICAgICBkYXRhLmZvcm1hdHRlZFZhbHVlcyA9IHRoaXMuZGF0YS5mb3JtYXR0ZWRWYWx1ZXM7XG4gICAgICAgICAgICBkYXRhLmNoYXJ0QmFja2dyb3VuZCA9IHRoaXMuY2hhcnRCYWNrZ3JvdW5kO1xuICAgICAgICAgICAgZGF0YS5jaXJjbGVCb3VuZHMgPSB0aGlzLl9tYWtlQ2lyY2xlQm91bmRzKGRpbWVuc2lvbik7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnBhcGVyID0gdGhpcy5ncmFwaFJlbmRlcmVyLnJlbmRlcihwYXBlciwgZWwsIGRhdGEsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKTtcbiAgICAgICAgcmV0dXJuIGVsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgcGFwZXIuXG4gICAgICogQHJldHVybnMge29iamVjdH0gb2JqZWN0IGZvciBncmFwaCBkcmF3aW5nXG4gICAgICovXG4gICAgZ2V0UGFwZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXBlcjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBwZXJjZW50IHZhbHVlLlxuICAgICAqIEBwYXJhbSB7e3ZhbHVlczogYXJyYXksIHNjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX19IGRhdGEgc2VyaWVzIGRhdGFcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhY2tlZCBzdGFja2VkIG9wdGlvblxuICAgICAqIEByZXR1cm5zIHthcnJheS48YXJyYXkuPG51bWJlcj4+fSBwZXJjZW50IHZhbHVlc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VQZXJjZW50VmFsdWVzOiBmdW5jdGlvbihkYXRhLCBzdGFja2VkKSB7XG4gICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgIGlmIChzdGFja2VkID09PSBjaGFydENvbnN0LlNUQUNLRURfTk9STUFMX1RZUEUpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuX21ha2VOb3JtYWxTdGFja2VkUGVyY2VudFZhbHVlcyhkYXRhKTtcbiAgICAgICAgfSBlbHNlIGlmIChzdGFja2VkID09PSBjaGFydENvbnN0LlNUQUNLRURfUEVSQ0VOVF9UWVBFKSB7XG4gICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9tYWtlUGVyY2VudFN0YWNrZWRQZXJjZW50VmFsdWVzKGRhdGEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5fbWFrZU5vcm1hbFBlcmNlbnRWYWx1ZXMoZGF0YSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHBlcmNlbnQgdmFsdWVzIGFib3V0IG5vcm1hbCBzdGFja2VkIG9wdGlvbi5cbiAgICAgKiBAcGFyYW0ge3t2YWx1ZXM6IGFycmF5LCBzY2FsZToge21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19fSBkYXRhIHNlcmllcyBkYXRhXG4gICAgICogQHJldHVybnMge2FycmF5fSBwZXJjZW50IHZhbHVlcyBhYm91dCBub3JtYWwgc3RhY2tlZCBvcHRpb24uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZU5vcm1hbFN0YWNrZWRQZXJjZW50VmFsdWVzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBtaW4gPSBkYXRhLnNjYWxlLm1pbixcbiAgICAgICAgICAgIG1heCA9IGRhdGEuc2NhbGUubWF4LFxuICAgICAgICAgICAgZGlzdGFuY2UgPSBtYXggLSBtaW4sXG4gICAgICAgICAgICBwZXJjZW50VmFsdWVzID0gbmUudXRpbC5tYXAoZGF0YS52YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICAgICAgICAgIHZhciBwbHVzVmFsdWVzID0gbmUudXRpbC5maWx0ZXIodmFsdWVzLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlID4gMDtcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIHN1bSA9IG5lLnV0aWwuc3VtKHBsdXNWYWx1ZXMpLFxuICAgICAgICAgICAgICAgICAgICBncm91cFBlcmNlbnQgPSAoc3VtIC0gbWluKSAvIGRpc3RhbmNlO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBncm91cFBlcmNlbnQgKiAodmFsdWUgLyBzdW0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBwZXJjZW50VmFsdWVzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHBlcmNlbnQgdmFsdWVzIGFib3V0IHBlcmNlbnQgc3RhY2tlZCBvcHRpb24uXG4gICAgICogQHBhcmFtIHt7dmFsdWVzOiBhcnJheSwgc2NhbGU6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fX0gZGF0YSBzZXJpZXMgZGF0YVxuICAgICAqIEByZXR1cm5zIHthcnJheX0gcGVyY2VudCB2YWx1ZXMgYWJvdXQgcGVyY2VudCBzdGFja2VkIG9wdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VQZXJjZW50U3RhY2tlZFBlcmNlbnRWYWx1ZXM6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIHBlcmNlbnRWYWx1ZXMgPSBuZS51dGlsLm1hcChkYXRhLnZhbHVlcywgZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgICAgICB2YXIgcGx1c1ZhbHVlcyA9IG5lLnV0aWwuZmlsdGVyKHZhbHVlcywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlID4gMDtcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBzdW0gPSBuZS51dGlsLnN1bShwbHVzVmFsdWVzKTtcbiAgICAgICAgICAgIHJldHVybiBuZS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlIC8gc3VtO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcGVyY2VudFZhbHVlcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBub3JtYWwgcGVyY2VudCB2YWx1ZS5cbiAgICAgKiBAcGFyYW0ge3t2YWx1ZXM6IGFycmF5LCBzY2FsZToge21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19fSBkYXRhIHNlcmllcyBkYXRhXG4gICAgICogQHJldHVybnMge2FycmF5LjxhcnJheS48bnVtYmVyPj59IHBlcmNlbnQgdmFsdWVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZU5vcm1hbFBlcmNlbnRWYWx1ZXM6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIG1pbiA9IGRhdGEuc2NhbGUubWluLFxuICAgICAgICAgICAgbWF4ID0gZGF0YS5zY2FsZS5tYXgsXG4gICAgICAgICAgICBkaXN0YW5jZSA9IG1heCAtIG1pbixcbiAgICAgICAgICAgIHBlcmNlbnRWYWx1ZXMgPSBuZS51dGlsLm1hcChkYXRhLnZhbHVlcywgZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICh2YWx1ZSAtIG1pbikgLyBkaXN0YW5jZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcGVyY2VudFZhbHVlcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsbCBzaG93RG90IGZ1bmN0aW9uIG9mIGdyYXBoUmVuZGVyZXIuXG4gICAgICogQHBhcmFtIHt7Z3JvdXBJbmRleDogbnVtYmVyLCBpbmRleDogbnVtYmVyfX0gZGF0YSBkYXRhXG4gICAgICovXG4gICAgb25TaG93QW5pbWF0aW9uOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIGlmICghdGhpcy5ncmFwaFJlbmRlcmVyLnNob3dBbmltYXRpb24pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmdyYXBoUmVuZGVyZXIuc2hvd0FuaW1hdGlvbi5jYWxsKHRoaXMuZ3JhcGhSZW5kZXJlciwgZGF0YSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGwgaGlkZURvdCBmdW5jdGlvbiBvZiBncmFwaFJlbmRlcmVyLlxuICAgICAqIEBwYXJhbSB7e2dyb3VwSW5kZXg6IG51bWJlciwgaW5kZXg6IG51bWJlcn19IGRhdGEgZGF0YVxuICAgICAqL1xuICAgIG9uSGlkZUFuaW1hdGlvbjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBpZiAoIXRoaXMuZ3JhcGhSZW5kZXJlci5oaWRlQW5pbWF0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ncmFwaFJlbmRlcmVyLmhpZGVBbmltYXRpb24uY2FsbCh0aGlzLmdyYXBoUmVuZGVyZXIsIGRhdGEpO1xuICAgIH1cbn0pO1xuXG5uZS51dGlsLkN1c3RvbUV2ZW50cy5taXhpbihTZXJpZXMpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNlcmllcztcbiIsInZhciBERUZBVUxUX0NPTE9SID0gJyMwMDAwMDAnLFxuICAgIERFRkFVTFRfQkFDS0dST1VORCA9ICcjZmZmZmZmJyxcbiAgICBFTVBUWV9GT05UID0gJycsXG4gICAgREVGQVVMVF9BWElTID0ge1xuICAgICAgICB0aWNrQ29sb3I6IERFRkFVTFRfQ09MT1IsXG4gICAgICAgIHRpdGxlOiB7XG4gICAgICAgICAgICBmb250U2l6ZTogMTIsXG4gICAgICAgICAgICBmb250RmFtaWx5OiBFTVBUWV9GT05ULFxuICAgICAgICAgICAgY29sb3I6IERFRkFVTFRfQ09MT1JcbiAgICAgICAgfSxcbiAgICAgICAgbGFiZWw6IHtcbiAgICAgICAgICAgIGZvbnRTaXplOiAxMixcbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IEVNUFRZX0ZPTlQsXG4gICAgICAgICAgICBjb2xvcjogREVGQVVMVF9DT0xPUlxuICAgICAgICB9XG4gICAgfTtcblxudmFyIGRlZmF1bHRUaGVtZSA9IHtcbiAgICBjaGFydDoge1xuICAgICAgICBiYWNrZ3JvdW5kOiBERUZBVUxUX0JBQ0tHUk9VTkQsXG4gICAgICAgIGZvbnRGYW1pbHk6ICdWZXJkYW5hJ1xuICAgIH0sXG4gICAgdGl0bGU6IHtcbiAgICAgICAgZm9udFNpemU6IDE4LFxuICAgICAgICBmb250RmFtaWx5OiBFTVBUWV9GT05ULFxuICAgICAgICBjb2xvcjogREVGQVVMVF9DT0xPUlxuICAgIH0sXG4gICAgeUF4aXM6IERFRkFVTFRfQVhJUyxcbiAgICB4QXhpczogREVGQVVMVF9BWElTLFxuICAgIHBsb3Q6IHtcbiAgICAgICAgbGluZUNvbG9yOiAnI2RkZGRkZCcsXG4gICAgICAgIGJhY2tncm91bmQ6ICcjZmZmZmZmJ1xuICAgIH0sXG4gICAgc2VyaWVzOiB7XG4gICAgICAgIGNvbG9yczogWycjYWM0MTQyJywgJyNkMjg0NDUnLCAnI2Y0YmY3NScsICcjOTBhOTU5JywgJyM3NWI1YWEnLCAnIzZhOWZiNScsICcjYWE3NTlmJywgJyM4ZjU1MzYnXVxuICAgIH0sXG4gICAgbGVnZW5kOiB7XG4gICAgICAgIGxhYmVsOiB7XG4gICAgICAgICAgICBmb250U2l6ZTogMTIsXG4gICAgICAgICAgICBmb250RmFtaWx5OiBFTVBUWV9GT05ULFxuICAgICAgICAgICAgY29sb3I6IERFRkFVTFRfQ09MT1JcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZGVmYXVsdFRoZW1lO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFRvb2x0aXAgY29tcG9uZW50LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZG9tID0gcmVxdWlyZSgnLi4vaGVscGVycy9kb21IYW5kbGVyLmpzJyksXG4gICAgcmVuZGVyVXRpbCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvcmVuZGVyVXRpbC5qcycpLFxuICAgIGV2ZW50ID0gcmVxdWlyZSgnLi4vaGVscGVycy9ldmVudExpc3RlbmVyLmpzJyksXG4gICAgdGVtcGxhdGVNYWtlciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvdGVtcGxhdGVNYWtlci5qcycpLFxuICAgIHRvb2x0aXBUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdG9vbHRpcFRlbXBsYXRlLmpzJyk7XG5cbnZhciBUT09MVElQX0dBUCA9IDUsXG4gICAgSElEREVOX1dJRFRIID0gMSxcbiAgICBUT09MVElQX0NMQVNTX05BTUUgPSAnbmUtY2hhcnQtdG9vbHRpcCcsXG4gICAgSElERV9ERUxBWSA9IDA7XG5cbnZhciBjb25jYXQgPSBBcnJheS5wcm90b3R5cGUuY29uY2F0O1xuXG52YXIgVG9vbHRpcCA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBUb29sdGlwLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogVG9vbHRpcCBjb21wb25lbnQuXG4gICAgICogQGNvbnN0cnVjdHMgVG9vbHRpcFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48bnVtYmVyPn0gcGFyYW1zLnZhbHVlcyBjb252ZXJ0ZWQgdmFsdWVzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5fSBwYXJhbXMubGFiZWxzIGxhYmVsc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheX0gcGFyYW1zLmxlZ2VuZExhYmVscyBsZWdlbmQgbGFiZWxzXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcHJlZml4IHRvb2x0aXAgcHJlZml4XG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmJvdW5kIGF4aXMgYm91bmRcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgYXhpcyB0aGVtZVxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICBuZS51dGlsLmV4dGVuZCh0aGlzLCBwYXJhbXMpO1xuICAgICAgICAvKipcbiAgICAgICAgICogVG9vbHRpcCB2aWV3IGNsYXNzTmFtZVxuICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jbGFzc05hbWUgPSAnbmUtY2hhcnQtdG9vbHRpcC1hcmVhJztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIHRvb2x0aXAuXG4gICAgICogQHBhcmFtIHt7cG9zaXRpb246IG9iamVjdH19IGJvdW5kIHRvb2x0aXAgYm91bmRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcHJlZml4IHRvb2x0aXAgaWQgcHJlZml4XG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSB0b29sdGlwIGVsZW1lbnRcbiAgICAgKi9cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZWwgPSBkb20uY3JlYXRlKCdESVYnLCB0aGlzLmNsYXNzTmFtZSksXG4gICAgICAgICAgICBib3VuZCA9IHRoaXMuYm91bmQ7XG5cbiAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJQb3NpdGlvbihlbCwgYm91bmQucG9zaXRpb24pO1xuICAgICAgICBlbC5pbm5lckhUTUwgPSB0aGlzLl9tYWtlVG9vbHRpcHNIdG1sKCk7XG5cbiAgICAgICAgdGhpcy5hdHRhY2hFdmVudChlbCk7XG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSB0b29sdGlwIGRhdGEuXG4gICAgICogQHJldHVybnMge2FycmF5LjxvYmplY3Q+fSB0b29sdGlwIGRhdGFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlVG9vbHRpcERhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbGFiZWxzID0gdGhpcy5sYWJlbHMsXG4gICAgICAgICAgICBncm91cFZhbHVlcyA9IHRoaXMudmFsdWVzLFxuICAgICAgICAgICAgbGVnZW5kTGFiZWxzID0gdGhpcy5sZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICB0b29sdGlwRGF0YSA9IG5lLnV0aWwubWFwKGdyb3VwVmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMsIGdyb3VwSW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgaXRlbXMgPSBuZS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IHt2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBsZWdlbmRMYWJlbDogbGVnZW5kTGFiZWxzW2luZGV4XSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBncm91cEluZGV4ICsgJy0nICsgaW5kZXhcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxhYmVscykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5sYWJlbCA9IGxhYmVsc1tncm91cEluZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBpdGVtcztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gY29uY2F0LmFwcGx5KFtdLCB0b29sdGlwRGF0YSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgaHRtbCBvZiB0b29sdGlwLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhIHRvb2x0aXAgZGF0YVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwcmVmaXggdG9vbHRpcCBpZCBwcmVmaXhcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBodG1sXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVRvb2x0aXBzSHRtbDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zLFxuICAgICAgICAgICAgcHJlZml4ID0gdGhpcy5wcmVmaXgsXG4gICAgICAgICAgICBkYXRhID0gdGhpcy5fbWFrZVRvb2x0aXBEYXRhKCksXG4gICAgICAgICAgICBvcHRpb25UZW1wbGF0ZSA9IG9wdGlvbnMudGVtcGxhdGUgPyBvcHRpb25zLnRlbXBsYXRlIDogJycsXG4gICAgICAgICAgICB0cGxPdXRlciA9IHRvb2x0aXBUZW1wbGF0ZS5UUExfVE9PTFRJUCxcbiAgICAgICAgICAgIHRwbFRvb2x0aXAgPSBvcHRpb25UZW1wbGF0ZSA/IHRlbXBsYXRlTWFrZXIudGVtcGxhdGUob3B0aW9uVGVtcGxhdGUpIDogdG9vbHRpcFRlbXBsYXRlLlRQTF9ERUZBVUxUX1RFTVBMQVRFLFxuICAgICAgICAgICAgc3VmZml4ID0gb3B0aW9ucy5zdWZmaXggPyAnJm5ic3A7JyArIG9wdGlvbnMuc3VmZml4IDogJycsXG4gICAgICAgICAgICBodG1sID0gbmUudXRpbC5tYXAoZGF0YSwgZnVuY3Rpb24odG9vbHRpcERhdGEpIHtcbiAgICAgICAgICAgICAgICB2YXIgaWQgPSBwcmVmaXggKyB0b29sdGlwRGF0YS5pZCxcbiAgICAgICAgICAgICAgICAgICAgdG9vbHRpcEh0bWw7XG5cbiAgICAgICAgICAgICAgICB0b29sdGlwRGF0YSA9IG5lLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICcnLFxuICAgICAgICAgICAgICAgICAgICBsZWdlbmRMYWJlbDogJycsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgc3VmZml4OiBzdWZmaXhcbiAgICAgICAgICAgICAgICB9LCB0b29sdGlwRGF0YSk7XG4gICAgICAgICAgICAgICAgdG9vbHRpcEh0bWwgPSB0cGxUb29sdGlwKHRvb2x0aXBEYXRhKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHBsT3V0ZXIoe1xuICAgICAgICAgICAgICAgICAgICBpZDogaWQsXG4gICAgICAgICAgICAgICAgICAgIGh0bWw6IHRvb2x0aXBIdG1sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCB0aGlzKS5qb2luKCcnKTtcbiAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBpbmRleCBmcm9tIGlkXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGlkIHRvb2x0aXAgaWRcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPG51bWJlcj59IGluZGV4ZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRJbmRleEZyb21JZDogZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgdmFyIGlkcyA9IGlkLnNwbGl0KCctJyksXG4gICAgICAgICAgICBzbGljZUluZGV4ID0gaWRzLmxlbmd0aCAtIDI7XG4gICAgICAgIHJldHVybiBpZHMuc2xpY2Uoc2xpY2VJbmRleCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZpcmUgY3VzdG9tIGV2ZW50IHNob3dBbmltYXRpb24uXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGlkIHRvb2x0aXAgaWRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9maXJlU2hvd0FuaW1hdGlvbjogZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgdmFyIGluZGV4ZXMgPSB0aGlzLl9nZXRJbmRleEZyb21JZChpZCk7XG4gICAgICAgIHRoaXMuZmlyZSgnc2hvd0FuaW1hdGlvbicsIHtcbiAgICAgICAgICAgIGdyb3VwSW5kZXg6IGluZGV4ZXNbMF0sXG4gICAgICAgICAgICBpbmRleDogaW5kZXhlc1sxXVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmlyZSBjdXN0b20gZXZlbnQgaGlkZUFuaW1hdGlvbi5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgdG9vbHRpcCBpZFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2ZpcmVIaWRlQW5pbWF0aW9uOiBmdW5jdGlvbihpZCkge1xuICAgICAgICBjb25zb2xlLmxvZygnX2ZpcmVIaWRlQW5pbWF0aW9uJyk7XG4gICAgICAgIHZhciBpbmRleGVzID0gdGhpcy5fZ2V0SW5kZXhGcm9tSWQoaWQpO1xuICAgICAgICB0aGlzLmZpcmUoJ2hpZGVBbmltYXRpb24nLCB7XG4gICAgICAgICAgICBncm91cEluZGV4OiBpbmRleGVzWzBdLFxuICAgICAgICAgICAgaW5kZXg6IGluZGV4ZXNbMV1cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE9uIG1vdXNlb3ZlciBldmVudCBoYW5kbGVyIGZvciB0b29sdGlwIGFyZWFcbiAgICAgKiBAcGFyYW0ge01vdXNlRXZlbnR9IGUgbW91c2UgZXZlbnRcbiAgICAgKi9cbiAgICBvbk1vdXNlb3ZlcjogZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgZWxUYXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQsXG4gICAgICAgICAgICBpZDtcblxuICAgICAgICBpZiAoIWRvbS5oYXNDbGFzcyhlbFRhcmdldCwgVE9PTFRJUF9DTEFTU19OQU1FKSkge1xuICAgICAgICAgICAgZWxUYXJnZXQgPSBkb20uZmluZFBhcmVudEJ5Q2xhc3MoZWxUYXJnZXQsIFRPT0xUSVBfQ0xBU1NfTkFNRSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNob3dlZElkID0gaWQgPSBlbFRhcmdldC5pZDtcbiAgICAgICAgdGhpcy5fZmlyZVNob3dBbmltYXRpb24oaWQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBPbiBtb3VzZW91dCBldmVudCBoYW5kbGVyIGZvciB0b29sdGlwIGFyZWFcbiAgICAgKiBAcGFyYW0ge01vdXNlRXZlbnR9IGUgbW91c2UgZXZlbnRcbiAgICAgKi9cbiAgICBvbk1vdXNlb3V0OiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciBlbFRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudCxcbiAgICAgICAgICAgIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgaW5kZXhlcztcblxuICAgICAgICBpZiAoIWRvbS5oYXNDbGFzcyhlbFRhcmdldCwgVE9PTFRJUF9DTEFTU19OQU1FKSkge1xuICAgICAgICAgICAgZWxUYXJnZXQgPSBkb20uZmluZFBhcmVudEJ5Q2xhc3MoZWxUYXJnZXQsIFRPT0xUSVBfQ0xBU1NfTkFNRSk7XG4gICAgICAgIH1cblxuICAgICAgICBpbmRleGVzID0gdGhpcy5fZ2V0SW5kZXhGcm9tSWQoZWxUYXJnZXQuaWQpO1xuXG4gICAgICAgIHRoaXMuX2hpZGVUb29sdGlwKGVsVGFyZ2V0LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoYXQuZmlyZSgnaGlkZUFuaW1hdGlvbicsIHtcbiAgICAgICAgICAgICAgICBncm91cEluZGV4OiBpbmRleGVzWzBdLFxuICAgICAgICAgICAgICAgIGluZGV4OiBpbmRleGVzWzFdXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGN1bGF0ZSB0b29sdGlwIHBvaW50IHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge3tib3VuZDogb2JqZWN0fX0gcGFyYW1zLmRhdGEgZ3JhcGggaW5mb3JtYXRpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gcGFyYW1zLmRpbWVuc2lvbiB0b29sdGlwIGRpbWVuc2lvblxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5wb3NpdGlvbk9wdGlvbiBwb3NpdGlvbiBvcHRpb24gKGV4OiAnbGVmdCB0b3AnKVxuICAgICAqIEByZXR1cm5zIHt7dG9wOiBudW1iZXIsIGxlZnQ6IG51bWJlcn19IHBvc2l0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2FsY3VsYXRlUG9pbnRQb3NpdGlvbjogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBib3VuZCA9IHBhcmFtcy5kYXRhLmJvdW5kLFxuICAgICAgICAgICAgbWludXNXaWR0aCA9IHBhcmFtcy5kaW1lbnNpb24ud2lkdGggLSAoYm91bmQud2lkdGggfHwgMCksXG4gICAgICAgICAgICBsaW5lR2FwID0gYm91bmQud2lkdGggPyAwIDogVE9PTFRJUF9HQVAsXG4gICAgICAgICAgICBwb3NpdGlvbk9wdGlvbiA9IHBhcmFtcy5wb3NpdGlvbk9wdGlvbiB8fCAnJyxcbiAgICAgICAgICAgIHRvb2x0aXBIZWlnaHQgPSBwYXJhbXMuZGltZW5zaW9uLmhlaWdodCxcbiAgICAgICAgICAgIHJlc3VsdCA9IHt9O1xuXG4gICAgICAgIHJlc3VsdC5sZWZ0ID0gYm91bmQubGVmdCArIChISURERU5fV0lEVEggKiAyKTtcbiAgICAgICAgcmVzdWx0LnRvcCA9IGJvdW5kLnRvcCAtIHRvb2x0aXBIZWlnaHQ7XG5cbiAgICAgICAgaWYgKHBvc2l0aW9uT3B0aW9uLmluZGV4T2YoJ2xlZnQnKSA+IC0xKSB7XG4gICAgICAgICAgICByZXN1bHQubGVmdCAtPSBtaW51c1dpZHRoICsgbGluZUdhcDtcbiAgICAgICAgfSBlbHNlIGlmIChwb3NpdGlvbk9wdGlvbi5pbmRleE9mKCdjZW50ZXInKSA+IC0xKSB7XG4gICAgICAgICAgICByZXN1bHQubGVmdCAtPSBtaW51c1dpZHRoIC8gMjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdC5sZWZ0ICs9IGxpbmVHYXA7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocG9zaXRpb25PcHRpb24uaW5kZXhPZignYm90dG9tJykgPiAtMSkge1xuICAgICAgICAgICAgcmVzdWx0LnRvcCArPSB0b29sdGlwSGVpZ2h0IC0gSElEREVOX1dJRFRIICsgbGluZUdhcDtcbiAgICAgICAgfSBlbHNlIGlmIChwb3NpdGlvbk9wdGlvbi5pbmRleE9mKCdtaWRkbGUnKSA+IC0xKSB7XG4gICAgICAgICAgICByZXN1bHQudG9wICs9IHRvb2x0aXBIZWlnaHQgLyAyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0LnRvcCAtPSBUT09MVElQX0dBUCArIEhJRERFTl9XSURUSDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGN1bGF0ZSB0b29sdGlwIHJlY3QgcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7e2JvdW5kOiBvYmplY3R9fSBwYXJhbXMuZGF0YSBncmFwaCBpbmZvcm1hdGlvblxuICAgICAqICAgICAgQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBwYXJhbXMuZGltZW5zaW9uIHRvb2x0aXAgZGltZW5zaW9uXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLnBvc2l0aW9uT3B0aW9uIHBvc2l0aW9uIG9wdGlvbiAoZXg6ICdsZWZ0IHRvcCcpXG4gICAgICogQHJldHVybnMge3t0b3A6IG51bWJlciwgbGVmdDogbnVtYmVyfX0gcG9zaXRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jYWxjdWxhdGVSZWN0UG9zaXRpb246IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgYm91bmQgPSBwYXJhbXMuZGF0YS5ib3VuZCxcbiAgICAgICAgICAgIG1pbnVzSGVpZ2h0ID0gcGFyYW1zLmRpbWVuc2lvbi5oZWlnaHQgLSAoYm91bmQuaGVpZ2h0IHx8IDApLFxuICAgICAgICAgICAgcG9zaXRpb25PcHRpb24gPSBwYXJhbXMucG9zaXRpb25PcHRpb24gfHwgJycsXG4gICAgICAgICAgICB0b29sdGlwV2lkdGggPSBwYXJhbXMuZGltZW5zaW9uLndpZHRoLFxuICAgICAgICAgICAgcmVzdWx0ID0ge307XG5cbiAgICAgICAgcmVzdWx0LmxlZnQgPSBib3VuZC5sZWZ0ICsgYm91bmQud2lkdGg7XG4gICAgICAgIHJlc3VsdC50b3AgPSBib3VuZC50b3A7XG4gICAgICAgIGlmIChwb3NpdGlvbk9wdGlvbi5pbmRleE9mKCdsZWZ0JykgPiAtMSkge1xuICAgICAgICAgICAgcmVzdWx0LmxlZnQgLT0gdG9vbHRpcFdpZHRoO1xuICAgICAgICB9IGVsc2UgaWYgKHBvc2l0aW9uT3B0aW9uLmluZGV4T2YoJ2NlbnRlcicpID4gLTEpIHtcbiAgICAgICAgICAgIHJlc3VsdC5sZWZ0IC09IHRvb2x0aXBXaWR0aCAvIDI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQubGVmdCArPSBUT09MVElQX0dBUDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwb3NpdGlvbk9wdGlvbi5pbmRleE9mKCd0b3AnKSA+IC0xKSB7XG4gICAgICAgICAgICByZXN1bHQudG9wIC09IG1pbnVzSGVpZ2h0ICsgSElEREVOX1dJRFRIO1xuICAgICAgICB9IGVsc2UgaWYgKHBvc2l0aW9uT3B0aW9uLmluZGV4T2YoJ21pZGRsZScpID4gLTEpIHtcbiAgICAgICAgICAgIHJlc3VsdC50b3AgLT0gbWludXNIZWlnaHQgLyAyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0LnRvcCAtPSBISURERU5fV0lEVEggKiAyO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGN1bGF0ZSB0b29sdGlwIHBvc2l0aW9uLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHt7Ym91bmQ6IG9iamVjdCwgaXNQb2ludFBvc2l0aW9uOiBib29sZWFufX0gcGFyYW1zLmRhdGEgZ3JhcGggaW5mb3JtYXRpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gcGFyYW1zLmRpbWVuc2lvbiB0b29sdGlwIGRpbWVuc2lvblxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5wb3NpdGlvbk9wdGlvbiBwb3NpdGlvbiBvcHRpb24gKGV4OiAnbGVmdCB0b3AnKVxuICAgICAqIEByZXR1cm5zIHt7dG9wOiBudW1iZXIsIGxlZnQ6IG51bWJlcn19IHBvc2l0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2FsY3VsYXRlUG9zaXRpb246IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgICAgIGlmIChwYXJhbXMuZGF0YS5pc1BvaW50UG9zaXRpb24pIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuX2NhbGN1bGF0ZVBvaW50UG9zaXRpb24ocGFyYW1zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuX2NhbGN1bGF0ZVJlY3RQb3NpdGlvbihwYXJhbXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9uU2hvdyBpcyBjYWxsYmFjayBvZiBjdXN0b20gZXZlbnQgc2hvd1Rvb2x0aXAgZm9yIFNlcmllc1ZpZXcuXG4gICAgICogQHBhcmFtIHt7aWQ6IHN0cmluZywgYm91bmQ6IG9iamVjdH19IGRhdGEgdG9vbHRpcCBkYXRhXG4gICAgICovXG4gICAgb25TaG93OiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBlbFRvb2x0aXAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChkYXRhLmlkKSxcbiAgICAgICAgICAgIGFkZFBvc2l0aW9uID0gbmUudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgICAgICAgdG9wOiAwXG4gICAgICAgICAgICB9LCB0aGlzLm9wdGlvbnMuYWRkUG9zaXRpb24pLFxuICAgICAgICAgICAgcG9zaXRpb25PcHRpb24gPSB0aGlzLm9wdGlvbnMucG9zaXRpb24gfHwgJycsXG4gICAgICAgICAgICBwb3NpdGlvbjtcblxuICAgICAgICBpZiAodGhpcy5zaG93ZWRJZCkge1xuICAgICAgICAgICAgZG9tLnJlbW92ZUNsYXNzKGVsVG9vbHRpcCwgJ3Nob3cnKTtcbiAgICAgICAgICAgIHRoaXMuX2ZpcmVIaWRlQW5pbWF0aW9uKHRoaXMuc2hvd2VkSWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zaG93ZWRJZCA9IGRhdGEuaWQ7XG4gICAgICAgIGRvbS5hZGRDbGFzcyhlbFRvb2x0aXAsICdzaG93Jyk7XG5cbiAgICAgICAgcG9zaXRpb24gPSB0aGlzLl9jYWxjdWxhdGVQb3NpdGlvbih7XG4gICAgICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICAgICAgZGltZW5zaW9uOiB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IGVsVG9vbHRpcC5vZmZzZXRXaWR0aCxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IGVsVG9vbHRpcC5vZmZzZXRIZWlnaHRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwb3NpdGlvbk9wdGlvbjogcG9zaXRpb25PcHRpb24gfHwgJydcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZWxUb29sdGlwLnN0eWxlLmNzc1RleHQgPSBbXG4gICAgICAgICAgICByZW5kZXJVdGlsLmNvbmNhdFN0cignbGVmdDonLCBwb3NpdGlvbi5sZWZ0ICsgYWRkUG9zaXRpb24ubGVmdCwgJ3B4JyksXG4gICAgICAgICAgICByZW5kZXJVdGlsLmNvbmNhdFN0cigndG9wOicsIHBvc2l0aW9uLnRvcCArIGFkZFBvc2l0aW9uLnRvcCwgJ3B4JylcbiAgICAgICAgXS5qb2luKCc7Jyk7XG5cbiAgICAgICAgdGhpcy5fZmlyZVNob3dBbmltYXRpb24oZGF0YS5pZCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9uSGlkZSBpcyBjYWxsYmFjayBvZiBjdXN0b20gZXZlbnQgaGlkZVRvb2x0aXAgZm9yIFNlcmllc1ZpZXdcbiAgICAgKiBAcGFyYW0ge3tpZDogc3RyaW5nfX0gZGF0YSB0b29sdGlwIGRhdGFcbiAgICAgKi9cbiAgICBvbkhpZGU6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIGVsVG9vbHRpcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGRhdGEuaWQpLFxuICAgICAgICAgICAgdGhhdCA9IHRoaXM7XG5cbiAgICAgICAgdGhpcy5faGlkZVRvb2x0aXAoZWxUb29sdGlwLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBpbmRleGVzID0gdGhhdC5fZ2V0SW5kZXhGcm9tSWQoZGF0YS5pZCk7XG5cbiAgICAgICAgICAgIHRoYXQuZmlyZSgnaGlkZUFuaW1hdGlvbicsIHtcbiAgICAgICAgICAgICAgICBncm91cEluZGV4OiBpbmRleGVzWzBdLFxuICAgICAgICAgICAgICAgIGluZGV4OiBpbmRleGVzWzFdXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgZGF0YSA9IG51bGw7XG4gICAgICAgICAgICBlbFRvb2x0aXAgPSBudWxsO1xuICAgICAgICAgICAgdGhhdCA9IG51bGw7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBIaWRlIHRvb2x0aXAuXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxUb29sdGlwIHRvb2x0aXAgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIGNhbGxiYWNrXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaGlkZVRvb2x0aXA6IGZ1bmN0aW9uKGVsVG9vbHRpcCwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICBkZWxldGUgdGhpcy5zaG93ZWRJZDtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICh0aGF0LnNob3dlZElkID09PSBlbFRvb2x0aXAuaWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGRvbS5yZW1vdmVDbGFzcyhlbFRvb2x0aXAsICdzaG93Jyk7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGF0ID0gbnVsbDtcbiAgICAgICAgfSwgSElERV9ERUxBWSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCBldmVudFxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICovXG4gICAgYXR0YWNoRXZlbnQ6IGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgIGV2ZW50LmJpbmRFdmVudCgnbW91c2VvdmVyJywgZWwsIG5lLnV0aWwuYmluZCh0aGlzLm9uTW91c2VvdmVyLCB0aGlzKSk7XG4gICAgICAgIGV2ZW50LmJpbmRFdmVudCgnbW91c2VvdXQnLCBlbCwgbmUudXRpbC5iaW5kKHRoaXMub25Nb3VzZW91dCwgdGhpcykpO1xuICAgIH1cbn0pO1xuXG5uZS51dGlsLkN1c3RvbUV2ZW50cy5taXhpbihUb29sdGlwKTtcblxubW9kdWxlLmV4cG9ydHMgPSBUb29sdGlwO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFRoaXMgaXMgdGVtcGxhdGVzIG9mIHRvb2x0aXAgdmlldy5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbnZhciB0ZW1wbGF0ZU1ha2VyID0gcmVxdWlyZSgnLi4vaGVscGVycy90ZW1wbGF0ZU1ha2VyLmpzJyk7XG5cbnZhciB0YWdzID0ge1xuICAgIEhUTUxfVE9PTFRJUDogJzxkaXYgY2xhc3M9XCJuZS1jaGFydC10b29sdGlwXCIgaWQ9XCJ7eyBpZCB9fVwiPnt7IGh0bWwgfX08L2Rpdj4nLFxuICAgIEhUTUxfREVGQVVMVF9URU1QTEFURTogJzxkaXYgY2xhc3M9XCJuZS1jaGFydC1kZWZhdWx0LXRvb2x0aXBcIj4nICtcbiAgICAgICAgJzxkaXY+e3sgbGFiZWwgfX08L2Rpdj4nICtcbiAgICAgICAgJzxkaXY+JyArXG4gICAgICAgICAgICAnPHNwYW4+e3sgbGVnZW5kTGFiZWwgfX08L3NwYW4+OicgK1xuICAgICAgICAgICAgJyZuYnNwOzxzcGFuPnt7IHZhbHVlIH19PC9zcGFuPicgK1xuICAgICAgICAgICAgJzxzcGFuPnt7IHN1ZmZpeCB9fTwvc3Bhbj4nICtcbiAgICAgICAgJzwvZGl2PicgK1xuICAgICc8L2Rpdj4nXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBUUExfVE9PTFRJUDogdGVtcGxhdGVNYWtlci50ZW1wbGF0ZSh0YWdzLkhUTUxfVE9PTFRJUCksXG4gICAgVFBMX0RFRkFVTFRfVEVNUExBVEU6IHRlbXBsYXRlTWFrZXIudGVtcGxhdGUodGFncy5IVE1MX0RFRkFVTFRfVEVNUExBVEUpXG59O1xuIl19
