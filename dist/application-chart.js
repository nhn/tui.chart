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
     * Get width about y axis.
     * @param {object} yAxisOption y axis option
     * @param {array.<string>} labels labels
     * @param {object} theme yAxis theme
     * @returns {number} y axis width
     * @private
     */
    _getYAxisWidth: function(yAxisOption, labels, theme) {
        var yAxisOptions,
            title = '';

        if (yAxisOption) {
            yAxisOptions = [].concat(yAxisOption);
            title = yAxisOptions[0].title;
        }

        return this._getVerticalAxisWidth(title, labels, theme);
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
        xAxisTitle = options.xAxis && options.xAxis.title;
        maxLabel = this._getValueAxisMaxLabel(convertData, yAxisChartTypes);
        vLabels = params.isVertical ? [maxLabel] : convertData.labels;
        hLabels = params.isVertical ? convertData.labels : [maxLabel];
        yAxisWidth = this._getYAxisWidth(options.yAxis, vLabels, theme.yAxis);
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

    checkEl: null,
    /**
     * Create element for size check.
     * @memberOf module:renderUtil
     * @returns {HTMLElement} element
     * @private
     */
    _createSizeCheckEl: function() {
        var elDiv, elSpan;
        if (this.checkEl) {
            return this.checkEl;
        }

        elDiv = dom.create('DIV');
        elSpan = dom.create('SPAN');

        elDiv.appendChild(elSpan);
        elDiv.style.cssText = 'position:relative;top:10000px;left:10000px;width:1000px;height:100;line-height:1';

        this.checkEl = elDiv;
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
        var elDiv, elSpan, labelSize;

        if (!label) {
            return 0;
        }

        elDiv = this._createSizeCheckEl();
        elSpan = elDiv.firstChild;

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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXhlcy9heGlzLmpzIiwic3JjL2pzL2F4ZXMvYXhpc1RlbXBsYXRlLmpzIiwic3JjL2pzL2NoYXJ0LmpzIiwic3JjL2pzL2NoYXJ0cy9heGlzVHlwZUJhc2UuanMiLCJzcmMvanMvY2hhcnRzL2JhckNoYXJ0LmpzIiwic3JjL2pzL2NoYXJ0cy9jaGFydEJhc2UuanMiLCJzcmMvanMvY2hhcnRzL2NvbHVtbkNoYXJ0LmpzIiwic3JjL2pzL2NoYXJ0cy9jb21ib0NoYXJ0LmpzIiwic3JjL2pzL2NoYXJ0cy9saW5lQ2hhcnQuanMiLCJzcmMvanMvY2hhcnRzL3BpZUNoYXJ0LmpzIiwic3JjL2pzL2NvZGUtc25pcHBldC11dGlsLmpzIiwic3JjL2pzL2NvbnN0LmpzIiwic3JjL2pzL2ZhY3Rvcmllcy9jaGFydEZhY3RvcnkuanMiLCJzcmMvanMvZmFjdG9yaWVzL3BsdWdpbkZhY3RvcnkuanMiLCJzcmMvanMvZmFjdG9yaWVzL3RoZW1lRmFjdG9yeS5qcyIsInNyYy9qcy9oZWxwZXJzL2F4aXNEYXRhTWFrZXIuanMiLCJzcmMvanMvaGVscGVycy9ib3VuZHNNYWtlci5qcyIsInNyYy9qcy9oZWxwZXJzL2NhbGN1bGF0b3IuanMiLCJzcmMvanMvaGVscGVycy9kYXRhQ29udmVydGVyLmpzIiwic3JjL2pzL2hlbHBlcnMvZG9tSGFuZGxlci5qcyIsInNyYy9qcy9oZWxwZXJzL2V2ZW50TGlzdGVuZXIuanMiLCJzcmMvanMvaGVscGVycy9yZW5kZXJVdGlsLmpzIiwic3JjL2pzL2hlbHBlcnMvdGVtcGxhdGVNYWtlci5qcyIsInNyYy9qcy9sZWdlbmRzL2xlZ2VuZC5qcyIsInNyYy9qcy9sZWdlbmRzL2xlZ2VuZFRlbXBsYXRlLmpzIiwic3JjL2pzL3Bsb3RzL3Bsb3QuanMiLCJzcmMvanMvcGxvdHMvcGxvdFRlbXBsYXRlLmpzIiwic3JjL2pzL3BsdWdpbnMvcGx1Z2luUmFwaGFlbC5qcyIsInNyYy9qcy9wbHVnaW5zL3JhcGhhZWxCYXJDaGFydC5qcyIsInNyYy9qcy9wbHVnaW5zL3JhcGhhZWxMaW5lQ2hhcnQuanMiLCJzcmMvanMvcGx1Z2lucy9yYXBoYWVsUGllQ2hhcnQuanMiLCJzcmMvanMvcmVnaXN0ZXJDaGFydHMuanMiLCJzcmMvanMvcmVnaXN0ZXJUaGVtZXMuanMiLCJzcmMvanMvc2VyaWVzL2JhckNoYXJ0U2VyaWVzLmpzIiwic3JjL2pzL3Nlcmllcy9jb2x1bW5DaGFydFNlcmllcy5qcyIsInNyYy9qcy9zZXJpZXMvbGluZUNoYXJ0U2VyaWVzLmpzIiwic3JjL2pzL3Nlcmllcy9waWVDaGFydFNlcmllcy5qcyIsInNyYy9qcy9zZXJpZXMvc2VyaWVzLmpzIiwic3JjL2pzL3RoZW1lcy9kZWZhdWx0VGhlbWUuanMiLCJzcmMvanMvdG9vbHRpcHMvdG9vbHRpcC5qcyIsInNyYy9qcy90b29sdGlwcy90b29sdGlwVGVtcGxhdGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1aEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2V0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDem5CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwWUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2VkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsWUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3ICBBeGlzIGNvbXBvbmVudC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGRvbSA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZG9tSGFuZGxlci5qcycpLFxuICAgIGNhbGN1bGF0b3IgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2NhbGN1bGF0b3IuanMnKSxcbiAgICByZW5kZXJVdGlsID0gcmVxdWlyZSgnLi4vaGVscGVycy9yZW5kZXJVdGlsLmpzJyksXG4gICAgYXhpc1RlbXBsYXRlID0gcmVxdWlyZSgnLi9heGlzVGVtcGxhdGUuanMnKTtcblxudmFyIFRJVExFX0FSRUFfV0lEVEhfUEFERElORyA9IDIwLFxuICAgIFZfTEFCRUxfUklHSFRfUEFERElORyA9IDEwO1xuXG52YXIgQXhpcyA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBBeGlzLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogQXhpcyBjb21wb25lbnQuXG4gICAgICogQGNvbnN0cnVjdHMgQXhpc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHt7XG4gICAgICogICAgICAgICAgbGFiZWxzOiBhcnJheS48c3RyaW5nPixcbiAgICAgKiAgICAgICAgICB0aWNrQ291bnQ6IG51bWJlcixcbiAgICAgKiAgICAgICAgICBpc0xhYmVsQXhpczogYm9vbGVhbixcbiAgICAgKiAgICAgICAgICBpc1ZlcnRpY2FsOiBib29sZWFuXG4gICAgICogICAgICB9fSBwYXJhbXMuZGF0YSBheGlzIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuYm91bmQgYXhpcyBib3VuZFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBheGlzIHRoZW1lXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgYXhpcyBvcHRpb25zXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIG5lLnV0aWwuZXh0ZW5kKHRoaXMsIHBhcmFtcyk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBeGlzIHZpZXcgY2xhc3NOYW1lXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNsYXNzTmFtZSA9ICduZS1jaGFydC1heGlzLWFyZWEnO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgYXhpcy5cbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IGF4aXMgYXJlYSBiYXNlIGVsZW1lbnRcbiAgICAgKi9cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YSxcbiAgICAgICAgICAgIHRoZW1lID0gdGhpcy50aGVtZSxcbiAgICAgICAgICAgIGlzVmVydGljYWwgPSAhIWRhdGEuaXNWZXJ0aWNhbCxcbiAgICAgICAgICAgIGlzUG9zaXRpb25SaWdodCA9IGRhdGEuaXNQb3NpdGlvblJpZ2h0LFxuICAgICAgICAgICAgb3B0aW9ucyA9IHRoaXMub3B0aW9ucyxcbiAgICAgICAgICAgIGJvdW5kID0gdGhpcy5ib3VuZCxcbiAgICAgICAgICAgIGRpbWVuc2lvbiA9IGJvdW5kLmRpbWVuc2lvbixcbiAgICAgICAgICAgIHNpemUgPSBpc1ZlcnRpY2FsID8gZGltZW5zaW9uLmhlaWdodCA6IGRpbWVuc2lvbi53aWR0aCxcbiAgICAgICAgICAgIGVsID0gZG9tLmNyZWF0ZSgnRElWJywgdGhpcy5jbGFzc05hbWUpLFxuICAgICAgICAgICAgZWxUaXRsZUFyZWEgPSB0aGlzLl9yZW5kZXJUaXRsZUFyZWEoe1xuICAgICAgICAgICAgICAgIHRpdGxlOiBvcHRpb25zLnRpdGxlLFxuICAgICAgICAgICAgICAgIHRoZW1lOiB0aGVtZS50aXRsZSxcbiAgICAgICAgICAgICAgICBpc1ZlcnRpY2FsOiBpc1ZlcnRpY2FsLFxuICAgICAgICAgICAgICAgIGlzUG9zaXRpb25SaWdodDogaXNQb3NpdGlvblJpZ2h0LFxuICAgICAgICAgICAgICAgIHNpemU6IHNpemVcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgZWxUaWNrQXJlYSA9IHRoaXMuX3JlbmRlclRpY2tBcmVhKHNpemUpLFxuICAgICAgICAgICAgZWxMYWJlbEFyZWEgPSB0aGlzLl9yZW5kZXJMYWJlbEFyZWEoc2l6ZSwgZGltZW5zaW9uLndpZHRoKTtcbiAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJEaW1lbnNpb24oZWwsIGRpbWVuc2lvbik7XG4gICAgICAgIHJlbmRlclV0aWwucmVuZGVyUG9zaXRpb24oZWwsIGJvdW5kLnBvc2l0aW9uKTtcbiAgICAgICAgZG9tLmFkZENsYXNzKGVsLCBpc1ZlcnRpY2FsID8gJ3ZlcnRpY2FsJyA6ICdob3Jpem9udGFsJyk7XG4gICAgICAgIGRvbS5hZGRDbGFzcyhlbCwgaXNQb3NpdGlvblJpZ2h0ID8gJ3JpZ2h0JyA6ICcnKTtcbiAgICAgICAgZG9tLmFwcGVuZChlbCwgW2VsVGl0bGVBcmVhLCBlbFRpY2tBcmVhLCBlbExhYmVsQXJlYV0pO1xuXG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVGl0bGUgYXJlYSByZW5kZXJlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy50aXRsZSBheGlzIHRpdGxlXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIHRpdGxlIHRoZW1lXG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5pc1ZlcnRpY2FsIGlzIHZlcnRpY2FsP1xuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5zaXplICh3aWR0aCBvciBoZWlnaHQpXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSB0aXRsZSBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyVGl0bGVBcmVhOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGVsVGl0bGVBcmVhID0gcmVuZGVyVXRpbC5yZW5kZXJUaXRsZShwYXJhbXMudGl0bGUsIHBhcmFtcy50aGVtZSwgJ25lLWNoYXJ0LXRpdGxlLWFyZWEnKSxcbiAgICAgICAgICAgIGNzc1RleHRzID0gW107XG5cbiAgICAgICAgaWYgKGVsVGl0bGVBcmVhICYmIHBhcmFtcy5pc1ZlcnRpY2FsKSB7XG4gICAgICAgICAgICBjc3NUZXh0cyA9IFtcbiAgICAgICAgICAgICAgICByZW5kZXJVdGlsLmNvbmNhdFN0cignd2lkdGg6JywgcGFyYW1zLnNpemUsICdweCcpXG4gICAgICAgICAgICBdO1xuICAgICAgICAgICAgaWYgKHBhcmFtcy5pc1Bvc2l0aW9uUmlnaHQpIHtcbiAgICAgICAgICAgICAgICBjc3NUZXh0cy5wdXNoKHJlbmRlclV0aWwuY29uY2F0U3RyKCdyaWdodDonLCAtcGFyYW1zLnNpemUsICdweCcpKTtcbiAgICAgICAgICAgICAgICBjc3NUZXh0cy5wdXNoKHJlbmRlclV0aWwuY29uY2F0U3RyKCd0b3A6JywgMCwgJ3B4JykpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjc3NUZXh0cy5wdXNoKHJlbmRlclV0aWwuY29uY2F0U3RyKCdsZWZ0OicsIDAsICdweCcpKTtcbiAgICAgICAgICAgICAgICBpZiAoIXJlbmRlclV0aWwuaXNJRTgoKSkge1xuICAgICAgICAgICAgICAgICAgICBjc3NUZXh0cy5wdXNoKHJlbmRlclV0aWwuY29uY2F0U3RyKCd0b3A6JywgcGFyYW1zLnNpemUsICdweCcpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGVsVGl0bGVBcmVhLnN0eWxlLmNzc1RleHQgKz0gJzsnICsgY3NzVGV4dHMuam9pbignOycpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbFRpdGxlQXJlYTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVkbmVyIHRpY2sgYXJlYS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc2l6ZSBzaXplIG9yIGhlaWdodFxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gdGljayBhcmVhIGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJUaWNrQXJlYTogZnVuY3Rpb24oc2l6ZSkge1xuICAgICAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YSxcbiAgICAgICAgICAgIHRpY2tDb3VudCA9IGRhdGEudGlja0NvdW50LFxuICAgICAgICAgICAgdGlja0NvbG9yID0gdGhpcy50aGVtZS50aWNrQ29sb3IsXG4gICAgICAgICAgICBwb3NpdGlvbnMgPSBjYWxjdWxhdG9yLm1ha2VQaXhlbFBvc2l0aW9ucyhzaXplLCB0aWNrQ291bnQpLFxuICAgICAgICAgICAgZWxUaWNrQXJlYSA9IGRvbS5jcmVhdGUoJ0RJVicsICduZS1jaGFydC10aWNrLWFyZWEnKSxcbiAgICAgICAgICAgIGlzVmVydGljYWwgPSBkYXRhLmlzVmVydGljYWwsXG4gICAgICAgICAgICBwb3NUeXBlID0gaXNWZXJ0aWNhbCA/ICdib3R0b20nIDogJ2xlZnQnLFxuICAgICAgICAgICAgYm9yZGVyQ29sb3JUeXBlID0gaXNWZXJ0aWNhbCA/IChkYXRhLmlzUG9zaXRpb25SaWdodCA/ICdib3JkZXJMZWZ0Q29sb3InIDogJ2JvcmRlclJpZ2h0Q29sb3InKSA6ICdib3JkZXJUb3BDb2xvcicsXG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IGF4aXNUZW1wbGF0ZS5UUExfQVhJU19USUNLLFxuICAgICAgICAgICAgdGlja3NIdG1sID0gbmUudXRpbC5tYXAocG9zaXRpb25zLCBmdW5jdGlvbihwb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIHZhciBjc3NUZXh0ID0gW1xuICAgICAgICAgICAgICAgICAgICByZW5kZXJVdGlsLmNvbmNhdFN0cignYmFja2dyb3VuZC1jb2xvcjonLCB0aWNrQ29sb3IpLFxuICAgICAgICAgICAgICAgICAgICByZW5kZXJVdGlsLmNvbmNhdFN0cihwb3NUeXBlLCAnOiAnLCBwb3NpdGlvbiwgJ3B4JylcbiAgICAgICAgICAgICAgICBdLmpvaW4oJzsnKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGVtcGxhdGUoe2Nzc1RleHQ6IGNzc1RleHR9KTtcbiAgICAgICAgICAgIH0sIHRoaXMpLmpvaW4oJycpO1xuXG4gICAgICAgIGVsVGlja0FyZWEuaW5uZXJIVE1MID0gdGlja3NIdG1sO1xuICAgICAgICBlbFRpY2tBcmVhLnN0eWxlW2JvcmRlckNvbG9yVHlwZV0gPSB0aWNrQ29sb3I7XG5cbiAgICAgICAgcmV0dXJuIGVsVGlja0FyZWE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBsYWJlbCBhcmVhLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzaXplIGxhYmVsIGFyZWEgc2l6ZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBheGlzV2lkdGggYXhpcyBhcmVhIHdpZHRoXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSBsYWJlbCBhcmVhIGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJMYWJlbEFyZWE6IGZ1bmN0aW9uKHNpemUsIGF4aXNXaWR0aCkge1xuICAgICAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YSxcbiAgICAgICAgICAgIHRoZW1lID0gdGhpcy50aGVtZSxcbiAgICAgICAgICAgIHBvc2l0aW9ucyA9IGNhbGN1bGF0b3IubWFrZVBpeGVsUG9zaXRpb25zKHNpemUsIGRhdGEudGlja0NvdW50KSxcbiAgICAgICAgICAgIGxhYmVsV2lkdGggPSBwb3NpdGlvbnNbMV0gLSBwb3NpdGlvbnNbMF0sXG4gICAgICAgICAgICBsYWJlbHMgPSBkYXRhLmxhYmVscyxcbiAgICAgICAgICAgIGlzVmVydGljYWwgPSBkYXRhLmlzVmVydGljYWwsXG4gICAgICAgICAgICBpc0xhYmVsQXhpcyA9IGRhdGEuaXNMYWJlbEF4aXMsXG4gICAgICAgICAgICBwb3NUeXBlID0gJ2xlZnQnLFxuICAgICAgICAgICAgY3NzVGV4dHMgPSB0aGlzLl9tYWtlTGFiZWxDc3NUZXh0cyh7XG4gICAgICAgICAgICAgICAgaXNWZXJ0aWNhbDogaXNWZXJ0aWNhbCxcbiAgICAgICAgICAgICAgICBpc0xhYmVsQXhpczogaXNMYWJlbEF4aXMsXG4gICAgICAgICAgICAgICAgbGFiZWxXaWR0aDogbGFiZWxXaWR0aFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBlbExhYmVsQXJlYSA9IGRvbS5jcmVhdGUoJ0RJVicsICduZS1jaGFydC1sYWJlbC1hcmVhJyksXG4gICAgICAgICAgICBhcmVhQ3NzVGV4dCA9IHJlbmRlclV0aWwubWFrZUZvbnRDc3NUZXh0KHRoZW1lLmxhYmVsKSxcbiAgICAgICAgICAgIGxhYmVsc0h0bWwsIHRpdGxlQXJlYVdpZHRoO1xuXG4gICAgICAgIGlmIChpc1ZlcnRpY2FsKSB7XG4gICAgICAgICAgICBwb3NUeXBlID0gaXNMYWJlbEF4aXMgPyAndG9wJyA6ICdib3R0b20nO1xuICAgICAgICAgICAgdGl0bGVBcmVhV2lkdGggPSB0aGlzLl9nZXRSZW5kZXJlZFRpdGxlSGVpZ2h0KCkgKyBUSVRMRV9BUkVBX1dJRFRIX1BBRERJTkc7XG4gICAgICAgICAgICBhcmVhQ3NzVGV4dCArPSAnO3dpZHRoOicgKyAoYXhpc1dpZHRoIC0gdGl0bGVBcmVhV2lkdGggKyBWX0xBQkVMX1JJR0hUX1BBRERJTkcpICsgJ3B4JztcbiAgICAgICAgfVxuXG4gICAgICAgIHBvc2l0aW9ucy5sZW5ndGggPSBsYWJlbHMubGVuZ3RoO1xuXG4gICAgICAgIGxhYmVsc0h0bWwgPSB0aGlzLl9tYWtlTGFiZWxzSHRtbCh7XG4gICAgICAgICAgICBwb3NpdGlvbnM6IHBvc2l0aW9ucyxcbiAgICAgICAgICAgIGxhYmVsczogbGFiZWxzLFxuICAgICAgICAgICAgcG9zVHlwZTogcG9zVHlwZSxcbiAgICAgICAgICAgIGNzc1RleHRzOiBjc3NUZXh0c1xuICAgICAgICB9KTtcblxuICAgICAgICBlbExhYmVsQXJlYS5pbm5lckhUTUwgPSBsYWJlbHNIdG1sO1xuICAgICAgICBlbExhYmVsQXJlYS5zdHlsZS5jc3NUZXh0ID0gYXJlYUNzc1RleHQ7XG5cbiAgICAgICAgdGhpcy5fY2hhbmdlTGFiZWxBcmVhUG9zaXRpb24oe1xuICAgICAgICAgICAgZWxMYWJlbEFyZWE6IGVsTGFiZWxBcmVhLFxuICAgICAgICAgICAgaXNWZXJ0aWNhbDogaXNWZXJ0aWNhbCxcbiAgICAgICAgICAgIGlzTGFiZWxBeGlzOiBpc0xhYmVsQXhpcyxcbiAgICAgICAgICAgIHRoZW1lOiB0aGVtZS5sYWJlbCxcbiAgICAgICAgICAgIGxhYmVsV2lkdGg6IGxhYmVsV2lkdGhcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGVsTGFiZWxBcmVhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgaGVpZ2h0IG9mIHRpdGxlIGFyZWEgO1xuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IGhlaWdodFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFJlbmRlcmVkVGl0bGVIZWlnaHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdGl0bGUgPSB0aGlzLm9wdGlvbnMudGl0bGUsXG4gICAgICAgICAgICB0aGVtZSA9IHRoaXMudGhlbWUudGl0bGUsXG4gICAgICAgICAgICByZXN1bHQgPSB0aXRsZSA/IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodCh0aXRsZSwgdGhlbWUpIDogMDtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBjc3NUZXh0cyBvZiBsYWJlbC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlclxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaXNWZXJ0aWNhbCB3aGV0aGVyIHZlcnRpY2FsIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaXNMYWJlbEF4aXMgd2hldGhlciBsYWJlbCBheGlzIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5sYWJlbFdpZHRoIGxhYmVsIHdpZHRoIG9yIGhlaWdodFxuICAgICAqIEByZXR1cm5zIHtzdHJpbmdbXX0gY3NzVGV4dHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlTGFiZWxDc3NUZXh0czogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBjc3NUZXh0cyA9IFtdO1xuXG4gICAgICAgIGlmIChwYXJhbXMuaXNWZXJ0aWNhbCAmJiBwYXJhbXMuaXNMYWJlbEF4aXMpIHtcbiAgICAgICAgICAgIGNzc1RleHRzLnB1c2gocmVuZGVyVXRpbC5jb25jYXRTdHIoJ2hlaWdodDonLCBwYXJhbXMubGFiZWxXaWR0aCwgJ3B4JykpO1xuICAgICAgICAgICAgY3NzVGV4dHMucHVzaChyZW5kZXJVdGlsLmNvbmNhdFN0cignbGluZS1oZWlnaHQ6JywgcGFyYW1zLmxhYmVsV2lkdGgsICdweCcpKTtcbiAgICAgICAgfSBlbHNlIGlmICghcGFyYW1zLmlzVmVydGljYWwpIHtcbiAgICAgICAgICAgIGNzc1RleHRzLnB1c2gocmVuZGVyVXRpbC5jb25jYXRTdHIoJ3dpZHRoOicsIHBhcmFtcy5sYWJlbFdpZHRoLCAncHgnKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY3NzVGV4dHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgaHRtbCBvZiBsYWJlbC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPG9iamVjdD59IHBhcmFtcy5wb3NpdGlvbnMgbGFiZWwgcG9zaXRpb24gYXJyYXlcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nW119IHBhcmFtcy5sYWJlbHMgbGFiZWwgYXJyYXlcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMucG9zVHlwZSBwb3NpdGlvbiB0eXBlIChsZWZ0IG9yIGJvdHRvbSlcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nW119IHBhcmFtcy5jc3NUZXh0cyBjc3MgYXJyYXlcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBodG1sXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUxhYmVsc0h0bWw6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgdGVtcGxhdGUgPSBheGlzVGVtcGxhdGUuVFBMX0FYSVNfTEFCRUwsXG4gICAgICAgICAgICBsYWJlbHNIdG1sID0gbmUudXRpbC5tYXAocGFyYW1zLnBvc2l0aW9ucywgZnVuY3Rpb24ocG9zaXRpb24sIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdmFyIGxhYmVsQ3NzVGV4dHMgPSBwYXJhbXMuY3NzVGV4dHMuc2xpY2UoKSxcbiAgICAgICAgICAgICAgICAgICAgaHRtbDtcblxuICAgICAgICAgICAgICAgIGxhYmVsQ3NzVGV4dHMucHVzaChyZW5kZXJVdGlsLmNvbmNhdFN0cihwYXJhbXMucG9zVHlwZSwgJzonLCBwb3NpdGlvbiwgJ3B4JykpO1xuICAgICAgICAgICAgICAgIGh0bWwgPSB0ZW1wbGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGNzc1RleHQ6IGxhYmVsQ3NzVGV4dHMuam9pbignOycpLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogcGFyYW1zLmxhYmVsc1tpbmRleF1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gaHRtbDtcbiAgICAgICAgICAgIH0sIHRoaXMpLmpvaW4oJycpO1xuXG4gICAgICAgIHJldHVybiBsYWJlbHNIdG1sO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGFuZ2UgcG9zaXRpb24gb2YgbGFiZWwgYXJlYS5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlclxuICAgICAqICAgICAgQHBhcmFtIHtIVE1MRWxlbWVudH0gcGFyYW1zLmVsTGFiZWxBcmVhIGxhYmVsIGFyZWEgZWxlbWVudFxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaXNWZXJ0aWNhbCB3aGV0aGVyIHZlcnRpY2FsIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaXNMYWJlbEF4aXMgd2hldGhlciBsYWJlbCBheGlzIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHt7Zm9udFNpemU6IG51bWJlciwgZm9udEZhbWlseTogc3RyaW5nLCBjb2xvcjogc3RyaW5nfX0gcGFyYW1zLnRoZW1lIGxhYmVsIHRoZW1lXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmxhYmVsV2lkdGggbGFiZWwgd2lkdGggb3IgaGVpZ2h0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2hhbmdlTGFiZWxBcmVhUG9zaXRpb246IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgbGFiZWxIZWlnaHQ7XG5cbiAgICAgICAgaWYgKHBhcmFtcy5pc0xhYmVsQXhpcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhcmFtcy5pc1ZlcnRpY2FsKSB7XG4gICAgICAgICAgICBsYWJlbEhlaWdodCA9IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodCgnQUJDJywgcGFyYW1zLnRoZW1lKTtcbiAgICAgICAgICAgIHBhcmFtcy5lbExhYmVsQXJlYS5zdHlsZS50b3AgPSByZW5kZXJVdGlsLmNvbmNhdFN0cihwYXJzZUludChsYWJlbEhlaWdodCAvIDIsIDEwKSwgJ3B4Jyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYXJhbXMuZWxMYWJlbEFyZWEuc3R5bGUubGVmdCA9IHJlbmRlclV0aWwuY29uY2F0U3RyKCctJywgcGFyc2VJbnQocGFyYW1zLmxhYmVsV2lkdGggLyAyLCAxMCksICdweCcpO1xuICAgICAgICB9XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQXhpcztcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBUaGlzIGlzIHRlbXBsYXRlcyBvciBheGlzIHZpZXcuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG52YXIgdGVtcGxhdGVNYWtlciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvdGVtcGxhdGVNYWtlci5qcycpO1xuXG52YXIgdGFncyA9IHtcbiAgICBIVE1MX0FYSVNfVElDSzogJzxkaXYgY2xhc3M9XCJuZS1jaGFydC10aWNrXCIgc3R5bGU9XCJ7eyBjc3NUZXh0IH19XCI+PC9kaXY+JyxcbiAgICBIVE1MX0FYSVNfTEFCRUw6ICc8ZGl2IGNsYXNzPVwibmUtY2hhcnQtbGFiZWxcIiBzdHlsZT1cInt7IGNzc1RleHQgfX1cIj57eyBsYWJlbCB9fTwvZGl2Pidcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIFRQTF9BWElTX1RJQ0s6IHRlbXBsYXRlTWFrZXIudGVtcGxhdGUodGFncy5IVE1MX0FYSVNfVElDSyksXG4gICAgVFBMX0FYSVNfTEFCRUw6IHRlbXBsYXRlTWFrZXIudGVtcGxhdGUodGFncy5IVE1MX0FYSVNfTEFCRUwpXG59O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IGNoYXJ0LmpzIGlzIGVudHJ5IHBvaW50IG9mIEFwcGxpY2F0aW9uIENoYXJ0LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuL2NvbnN0LmpzJyksXG4gICAgY2hhcnRGYWN0b3J5ID0gcmVxdWlyZSgnLi9mYWN0b3JpZXMvY2hhcnRGYWN0b3J5LmpzJyksXG4gICAgcGx1Z2luRmFjdG9yeSA9IHJlcXVpcmUoJy4vZmFjdG9yaWVzL3BsdWdpbkZhY3RvcnkuanMnKSxcbiAgICB0aGVtZUZhY3RvcnkgPSByZXF1aXJlKCcuL2ZhY3Rvcmllcy90aGVtZUZhY3RvcnkuanMnKTtcblxudmFyIERFRkFVTFRfVEhFTUVfTkFNRSA9ICdkZWZhdWx0JztcblxudmFyIF9jcmVhdGVDaGFydDtcblxucmVxdWlyZSgnLi9jb2RlLXNuaXBwZXQtdXRpbC5qcycpO1xucmVxdWlyZSgnLi9yZWdpc3RlckNoYXJ0cy5qcycpO1xucmVxdWlyZSgnLi9yZWdpc3RlclRoZW1lcy5qcycpO1xuXG4vKipcbiAqIE5ITiBFbnRlcnRhaW5tZW50IEFwcGxpY2F0aW9uIENoYXJ0LlxuICogQG5hbWVzcGFjZSBuZS5hcHBsaWNhdGlvbi5jaGFydFxuICovXG5uZS51dGlsLmRlZmluZU5hbWVzcGFjZSgnbmUuYXBwbGljYXRpb24uY2hhcnQnKTtcblxuLyoqXG4gKiBDcmVhdGUgY2hhcnQuXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY29udGFpbmVyXG4gKiBAcGFyYW0ge2FycmF5LjxhcnJheT59IGRhdGEgY2hhcnQgZGF0YVxuICogQHBhcmFtIHt7XG4gKiAgIGNoYXJ0OiB7XG4gKiAgICAgd2lkdGg6IG51bWJlcixcbiAqICAgICBoZWlnaHQ6IG51bWJlcixcbiAqICAgICB0aXRsZTogc3RyaW5nLFxuICogICAgIGZvcm1hdDogc3RyaW5nXG4gKiAgIH0sXG4gKiAgIHlBeGlzOiB7XG4gKiAgICAgdGl0bGU6IHN0cmluZyxcbiAqICAgICBtaW46IG51bWJlclxuICogICB9LFxuICogICB4QXhpczoge1xuICogICAgIHRpdGxlOiBzdHJpZyxcbiAqICAgICBtaW46IG51bWJlclxuICogICB9LFxuICogICB0b29sdGlwOiB7XG4gKiAgICAgc3VmZml4OiBzdHJpbmcsXG4gKiAgICAgdGVtcGxhdGU6IHN0cmluZ1xuICogICB9LFxuICogICB0aGVtZTogc3RyaW5nXG4gKiB9fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAqIEByZXR1cm5zIHtvYmplY3R9IGNoYXJ0IGluc3RhbmNlLlxuICogQHByaXZhdGVcbiAqIEBpZ25vcmVcbiAqL1xuX2NyZWF0ZUNoYXJ0ID0gZnVuY3Rpb24oY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKSB7XG4gICAgdmFyIHRoZW1lTmFtZSwgdGhlbWUsIGNoYXJ0O1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHRoZW1lTmFtZSA9IG9wdGlvbnMudGhlbWUgfHwgREVGQVVMVF9USEVNRV9OQU1FO1xuICAgIHRoZW1lID0gdGhlbWVGYWN0b3J5LmdldCh0aGVtZU5hbWUpO1xuXG4gICAgY2hhcnQgPSBjaGFydEZhY3RvcnkuZ2V0KG9wdGlvbnMuY2hhcnRUeXBlLCBkYXRhLCB0aGVtZSwgb3B0aW9ucyk7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGNoYXJ0LnJlbmRlcigpKTtcblxuICAgIHJldHVybiBjaGFydDtcbn07XG5cbi8qKlxuICogQmFyIGNoYXJ0IGNyZWF0b3IuXG4gKiBAbWVtYmVyT2YgbmUuYXBwbGljYXRpb24uY2hhcnRcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciBjaGFydCBjb250YWluZXJcbiAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhIGNoYXJ0IGRhdGFcbiAqICAgICAgQHBhcmFtIHthcnJheS48c3RyaW5nPn0gZGF0YS5jYXRlZ29yaWVzIGNhdGVnb3JpZXNcbiAqICAgICAgQHBhcmFtIHthcnJheS48YXJyYXk+fSBkYXRhLnNlcmllcyBzZXJpZXMgZGF0YVxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5jaGFydCBjaGFydCBvcHRpb25zXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5jaGFydC53aWR0aCBjaGFydCB3aWR0aFxuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMuY2hhcnQuaGVpZ2h0IGNoYXJ0IGhlaWdodFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuY2hhcnQudGl0bGUgY2hhcnQgdGl0bGVcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmNoYXJ0LmZvcm1hdCB2YWx1ZSBmb3JtYXRcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMueUF4aXMgb3B0aW9ucyBvZiB2ZXJ0aWNhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy55QXhpcy50aXRsZSB0aXRsZSBvZiB2ZXJ0aWNhbCBheGlzXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnhBeGlzIG9wdGlvbnMgb2YgaG9yaXpvbnRhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy54QXhpcy50aXRsZSB0aXRsZSBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnhBeGlzLm1pbiBtaW5pbWFsIHZhbHVlIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMueEF4aXMubWF4IG1heGltdW0gdmFsdWUgb2YgaG9yaXpvbnRhbCBheGlzXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnNlcmllcyBvcHRpb25zIG9mIHNlcmllc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuc2VyaWVzLnN0YWNrZWQgc3RhY2tlZCB0eXBlXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnRvb2x0aXAgb3B0aW9ucyBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnN1ZmZpeCBzdWZmaXggb2YgdG9vbHRpcFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC50ZW1wbGF0ZSB0ZW1wbGF0ZSBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnBvc2l0aW9uIHRvb2x0aXAgcG9zaXRpb24gdHlwZVxuICogICAgICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMudG9vbHRpcC5hZGRQb3NpdGlvbiBhZGQgcG9zaXRpb25cbiAqICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uLmxlZnQgYWRkIGxlZnQgcG9zaXRpb25cbiAqICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uLnRvcCBhZGQgdG9wIHBvc2l0aW9uXG4gKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRoZW1lIHRoZW1lIG5hbWVcbiAqICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMubGliVHlwZSBncmFwaCBsaWJyYXJ5IHR5cGVcbiAqIEByZXR1cm5zIHtvYmplY3R9IGJhciBjaGFydFxuICogQGV4YW1wbGVcbiAqIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFpbmVyLWlkJyksXG4gKiAgICAgZGF0YSA9IHtcbiAqICAgICAgIGNhdGVnb3JpZXM6IFsnY2F0ZTEnLCAnY2F0ZTInLCAnY2F0ZTMnXSxcbiAqICAgICAgIHNlcmllczogW1xuICogICAgICAgICB7XG4gKiAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDEnLFxuICogICAgICAgICAgIGRhdGE6IFsyMCwgMzAsIDUwXVxuICogICAgICAgICB9LFxuICogICAgICAgICB7XG4gKiAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDInLFxuICogICAgICAgICAgIGRhdGE6IFs0MCwgNDAsIDYwXVxuICogICAgICAgICB9LFxuICogICAgICAgICB7XG4gKiAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDMnLFxuICogICAgICAgICAgIGRhdGE6IFs2MCwgNTAsIDEwXVxuICogICAgICAgICB9LFxuICogICAgICAgICB7XG4gKiAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDQnLFxuICogICAgICAgICAgIGRhdGE6IFs4MCwgMTAsIDcwXVxuICogICAgICAgICB9XG4gKiAgICAgICBdXG4gKiAgICAgfSxcbiAqICAgICBvcHRpb25zID0ge1xuICogICAgICAgY2hhcnQ6IHtcbiAqICAgICAgICAgdGl0bGU6ICdCYXIgQ2hhcnQnXG4gKiAgICAgICB9LFxuICogICAgICAgeUF4aXM6IHtcbiAqICAgICAgICAgdGl0bGU6ICdZIEF4aXMnXG4gKiAgICAgICB9LFxuICogICAgICAgeEF4aXM6IHtcbiAqICAgICAgICAgdGl0bGU6ICdYIEF4aXMnXG4gKiAgICAgICB9XG4gKiAgICAgfTtcbiAqIG5lLmFwcGxpY2F0aW9uLmNoYXJ0LmJhckNoYXJ0KGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucyk7XG4gKi9cbm5lLmFwcGxpY2F0aW9uLmNoYXJ0LmJhckNoYXJ0ID0gZnVuY3Rpb24oY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgb3B0aW9ucy5jaGFydFR5cGUgPSBjaGFydENvbnN0LkNIQVJUX1RZUEVfQkFSO1xuICAgIHJldHVybiBfY3JlYXRlQ2hhcnQoY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKTtcbn07XG5cbi8qKlxuICogQ29sdW1uIGNoYXJ0IGNyZWF0b3IuXG4gKiBAbWVtYmVyT2YgbmUuYXBwbGljYXRpb24uY2hhcnRcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciBjaGFydCBjb250YWluZXJcbiAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhIGNoYXJ0IGRhdGFcbiAqICAgICAgQHBhcmFtIHthcnJheS48c3RyaW5nPn0gZGF0YS5jYXRlZ29yaWVzIGNhdGVnb3JpZXNcbiAqICAgICAgQHBhcmFtIHthcnJheS48YXJyYXk+fSBkYXRhLnNlcmllcyBzZXJpZXMgZGF0YVxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5jaGFydCBjaGFydCBvcHRpb25zXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5jaGFydC53aWR0aCBjaGFydCB3aWR0aFxuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMuY2hhcnQuaGVpZ2h0IGNoYXJ0IGhlaWdodFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuY2hhcnQudGl0bGUgY2hhcnQgdGl0bGVcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmNoYXJ0LmZvcm1hdCB2YWx1ZSBmb3JtYXRcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMueUF4aXMgb3B0aW9ucyBvZiB2ZXJ0aWNhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy55QXhpcy50aXRsZSB0aXRsZSBvZiB2ZXJ0aWNhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy55QXhpcy5taW4gbWluaW1hbCB2YWx1ZSBvZiB2ZXJ0aWNhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy55QXhpcy5tYXggbWF4aW11bSB2YWx1ZSBvZiB2ZXJ0aWNhbCBheGlzXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnhBeGlzIG9wdGlvbnMgb2YgaG9yaXpvbnRhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy54QXhpcy50aXRsZSB0aXRsZSBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuc2VyaWVzIG9wdGlvbnMgb2Ygc2VyaWVzXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5zZXJpZXMuc3RhY2tlZCBzdGFja2VkIHR5cGVcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMudG9vbHRpcCBvcHRpb25zIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAuc3VmZml4IHN1ZmZpeCBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnRlbXBsYXRlIHRlbXBsYXRlIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAucG9zaXRpb24gdG9vbHRpcCBwb3NpdGlvbiB0eXBlXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uIGFkZCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24ubGVmdCBhZGQgbGVmdCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24udG9wIGFkZCB0b3AgcG9zaXRpb25cbiAqICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudGhlbWUgdGhlbWUgbmFtZVxuICogICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5saWJUeXBlIGdyYXBoIGxpYnJhcnkgdHlwZVxuICogQHJldHVybnMge29iamVjdH0gY29sdW1uIGNoYXJ0XG4gKiBAZXhhbXBsZVxuICogdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWluZXItaWQnKSxcbiAqICAgICBkYXRhID0ge1xuICogICAgICAgY2F0ZWdvcmllczogWydjYXRlMScsICdjYXRlMicsICdjYXRlMyddLFxuICogICAgICAgc2VyaWVzOiBbXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMScsXG4gKiAgICAgICAgICAgZGF0YTogWzIwLCAzMCwgNTBdXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMicsXG4gKiAgICAgICAgICAgZGF0YTogWzQwLCA0MCwgNjBdXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMycsXG4gKiAgICAgICAgICAgZGF0YTogWzYwLCA1MCwgMTBdXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kNCcsXG4gKiAgICAgICAgICAgZGF0YTogWzgwLCAxMCwgNzBdXG4gKiAgICAgICAgIH1cbiAqICAgICAgIF1cbiAqICAgICB9LFxuICogICAgIG9wdGlvbnMgPSB7XG4gKiAgICAgICBjaGFydDoge1xuICogICAgICAgICB0aXRsZTogJ0NvbHVtbiBDaGFydCdcbiAqICAgICAgIH0sXG4gKiAgICAgICB5QXhpczoge1xuICogICAgICAgICB0aXRsZTogJ1kgQXhpcydcbiAqICAgICAgIH0sXG4gKiAgICAgICB4QXhpczoge1xuICogICAgICAgICB0aXRsZTogJ1ggQXhpcydcbiAqICAgICAgIH1cbiAqICAgICB9O1xuICogbmUuYXBwbGljYXRpb24uY2hhcnQuY29sdW1uQ2hhcnQoY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKTtcbiAqL1xubmUuYXBwbGljYXRpb24uY2hhcnQuY29sdW1uQ2hhcnQgPSBmdW5jdGlvbihjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICBvcHRpb25zLmNoYXJ0VHlwZSA9IGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9DT0xVTU47XG4gICAgcmV0dXJuIF9jcmVhdGVDaGFydChjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpO1xufTtcblxuLyoqXG4gKiBMaW5lIGNoYXJ0IGNyZWF0b3IuXG4gKiBAbWVtYmVyT2YgbmUuYXBwbGljYXRpb24uY2hhcnRcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciBjaGFydCBjb250YWluZXJcbiAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhIGNoYXJ0IGRhdGFcbiAqICAgICAgQHBhcmFtIHthcnJheS48c3RyaW5nPn0gZGF0YS5jYXRlZ29yaWVzIGNhdGVnb3JpZXNcbiAqICAgICAgQHBhcmFtIHthcnJheS48YXJyYXk+fSBkYXRhLnNlcmllcyBzZXJpZXMgZGF0YVxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5jaGFydCBjaGFydCBvcHRpb25zXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5jaGFydC53aWR0aCBjaGFydCB3aWR0aFxuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMuY2hhcnQuaGVpZ2h0IGNoYXJ0IGhlaWdodFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuY2hhcnQudGl0bGUgY2hhcnQgdGl0bGVcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmNoYXJ0LmZvcm1hdCB2YWx1ZSBmb3JtYXRcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMueUF4aXMgb3B0aW9ucyBvZiB2ZXJ0aWNhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy55QXhpcy50aXRsZSB0aXRsZSBvZiB2ZXJ0aWNhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy55QXhpcy5taW4gbWluaW1hbCB2YWx1ZSBvZiB2ZXJ0aWNhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy55QXhpcy5tYXggbWF4aW11bSB2YWx1ZSBvZiB2ZXJ0aWNhbCBheGlzXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnhBeGlzIG9wdGlvbnMgb2YgaG9yaXpvbnRhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy54QXhpcy50aXRsZSB0aXRsZSBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuc2VyaWVzIG9wdGlvbnMgb2Ygc2VyaWVzXG4gKiAgICAgICAgICBAcGFyYW0ge2Jvb2xlYW59IG9wdGlvbnMuc2VyaWVzLmhhc0RvdCB3aGV0aGVyIGhhcyBkb3Qgb3Igbm90XG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnRvb2x0aXAgb3B0aW9ucyBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnN1ZmZpeCBzdWZmaXggb2YgdG9vbHRpcFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC50ZW1wbGF0ZSB0ZW1wbGF0ZSBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnBvc2l0aW9uIHRvb2x0aXAgcG9zaXRpb24gdHlwZVxuICogICAgICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMudG9vbHRpcC5hZGRQb3NpdGlvbiBhZGQgcG9zaXRpb25cbiAqICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uLmxlZnQgYWRkIGxlZnQgcG9zaXRpb25cbiAqICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uLnRvcCBhZGQgdG9wIHBvc2l0aW9uXG4gKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRoZW1lIHRoZW1lIG5hbWVcbiAqICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMubGliVHlwZSBncmFwaCBsaWJyYXJ5IHR5cGVcbiAqIEByZXR1cm5zIHtvYmplY3R9IGJhciBjaGFydFxuICogQGV4YW1wbGVcbiAqIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFpbmVyLWlkJyksXG4gKiAgICAgZGF0YSA9IHtcbiAqICAgICAgIGNhdGVnb3JpZXM6IFsnY2F0ZTEnLCAnY2F0ZTInLCAnY2F0ZTMnXSxcbiAqICAgICAgIHNlcmllczogW1xuICogICAgICAgICB7XG4gKiAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDEnLFxuICogICAgICAgICAgIGRhdGE6IFsyMCwgMzAsIDUwXVxuICogICAgICAgICB9LFxuICogICAgICAgICB7XG4gKiAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDInLFxuICogICAgICAgICAgIGRhdGE6IFs0MCwgNDAsIDYwXVxuICogICAgICAgICB9LFxuICogICAgICAgICB7XG4gKiAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDMnLFxuICogICAgICAgICAgIGRhdGE6IFs2MCwgNTAsIDEwXVxuICogICAgICAgICB9LFxuICogICAgICAgICB7XG4gKiAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDQnLFxuICogICAgICAgICAgIGRhdGE6IFs4MCwgMTAsIDcwXVxuICogICAgICAgICB9XG4gKiAgICAgICBdXG4gKiAgICAgfSxcbiAqICAgICBvcHRpb25zID0ge1xuICogICAgICAgY2hhcnQ6IHtcbiAqICAgICAgICAgdGl0bGU6ICdMaW5lIENoYXJ0J1xuICogICAgICAgfSxcbiAqICAgICAgIHlBeGlzOiB7XG4gKiAgICAgICAgIHRpdGxlOiAnWSBBeGlzJ1xuICogICAgICAgfSxcbiAqICAgICAgIHhBeGlzOiB7XG4gKiAgICAgICAgIHRpdGxlOiAnWCBBeGlzJ1xuICogICAgICAgfSxcbiAqICAgICAgIHNlcmllczoge1xuICogICAgICAgICBoYXNEb3Q6IHRydWVcbiAqICAgICAgIH1cbiAqICAgICB9O1xuICogbmUuYXBwbGljYXRpb24uY2hhcnQubGluZUNoYXJ0KGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucyk7XG4gKi9cbm5lLmFwcGxpY2F0aW9uLmNoYXJ0LmxpbmVDaGFydCA9IGZ1bmN0aW9uKGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIG9wdGlvbnMuY2hhcnRUeXBlID0gY2hhcnRDb25zdC5DSEFSVF9UWVBFX0xJTkU7XG4gICAgcmV0dXJuIF9jcmVhdGVDaGFydChjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpO1xufTtcblxuLyoqXG4gKiBDb21ibyBjaGFydCBjcmVhdG9yLlxuICogQG1lbWJlck9mIG5lLmFwcGxpY2F0aW9uLmNoYXJ0XG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY2hhcnQgY29udGFpbmVyXG4gKiBAcGFyYW0ge29iamVjdH0gZGF0YSBjaGFydCBkYXRhXG4gKiAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGRhdGEuY2F0ZWdvcmllcyBjYXRlZ29yaWVzXG4gKiAgICAgIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gZGF0YS5zZXJpZXMgc2VyaWVzIGRhdGFcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuY2hhcnQgY2hhcnQgb3B0aW9uc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMuY2hhcnQud2lkdGggY2hhcnQgd2lkdGhcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LmhlaWdodCBjaGFydCBoZWlnaHRcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmNoYXJ0LnRpdGxlIGNoYXJ0IHRpdGxlXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC5mb3JtYXQgdmFsdWUgZm9ybWF0XG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0W119IG9wdGlvbnMueUF4aXMgb3B0aW9ucyBvZiB2ZXJ0aWNhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy55QXhpc1tdLnRpdGxlIHRpdGxlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnlBeGlzW10ubWluIG1pbmltYWwgdmFsdWUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMueUF4aXNbXS5tYXggbWF4aW11bSB2YWx1ZSBvZiB2ZXJ0aWNhbCBheGlzXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnhBeGlzIG9wdGlvbnMgb2YgaG9yaXpvbnRhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy54QXhpcy50aXRsZSB0aXRsZSBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnhBeGlzLm1pbiBtaW5pbWFsIHZhbHVlIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMueEF4aXMubWF4IG1heGltdW0gdmFsdWUgb2YgaG9yaXpvbnRhbCBheGlzXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnNlcmllcyBvcHRpb25zIG9mIHNlcmllc1xuICogICAgICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuc2VyaWVzLmNvbHVtbiBvcHRpb25zIG9mIGNvbHVtbiBzZXJpZXNcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5zZXJpZXMuY29sdW1uLnN0YWNrZWQgc3RhY2tlZCB0eXBlXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5zZXJpZXMubGluZSBvcHRpb25zIG9mIGxpbmUgc2VyaWVzXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtib29sZWFufSBvcHRpb25zLnNlcmllcy5saW5lLmhhc0RvdCB3aGV0aGVyIGhhcyBkb3Qgb3Igbm90XG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnRvb2x0aXAgb3B0aW9ucyBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy50b29sdGlwLmNvbHVtbiBvcHRpb25zIG9mIGNvbHVtbiB0b29sdGlwXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC5jb2x1bW4uc3VmZml4IHN1ZmZpeCBvZiB0b29sdGlwXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC5jb2x1bW4udGVtcGxhdGUgdGVtcGxhdGUgb2YgdG9vbHRpcFxuICogICAgICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAuY29sdW1uLnBvc2l0aW9uIHRvb2x0aXAgcG9zaXRpb24gdHlwZVxuICogICAgICAgICAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnRvb2x0aXAuY29sdW1uLmFkZFBvc2l0aW9uIGFkZCBwb3NpdGlvblxuICogICAgICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy50b29sdGlwLmNvbHVtbi5hZGRQb3NpdGlvbi5sZWZ0IGFkZCBsZWZ0IHBvc2l0aW9uXG4gKiAgICAgICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuY29sdW1uLmFkZFBvc2l0aW9uLnRvcCBhZGQgdG9wIHBvc2l0aW9uXG4gKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRoZW1lIHRoZW1lIG5hbWVcbiAqICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMubGliVHlwZSBncmFwaCBsaWJyYXJ5IHR5cGVcbiAqIEByZXR1cm5zIHtvYmplY3R9IGJhciBjaGFydFxuICogQGV4YW1wbGVcbiAqIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFpbmVyLWlkJyksXG4gKiAgICAgZGF0YSA9IHtcbiAqICAgICAgIGNhdGVnb3JpZXM6IFsnY2F0ZTEnLCAnY2F0ZTInLCAnY2F0ZTMnXSxcbiAqICAgICAgIHNlcmllczoge1xuICogICAgICAgICBjb2x1bW46IFtcbiAqICAgICAgICAgICB7XG4gKiAgICAgICAgICAgICBuYW1lOiAnTGVnZW5kMScsXG4gKiAgICAgICAgICAgICBkYXRhOiBbMjAsIDMwLCA1MF1dXG4gKiAgICAgICAgICAgfSxcbiAqICAgICAgICAgICB7XG4gKiAgICAgICAgICAgICBuYW1lOiAnTGVnZW5kMicsXG4gKiAgICAgICAgICAgICBkYXRhOiBbNDAsIDQwLCA2MF1cbiAqICAgICAgICAgICB9LFxuICogICAgICAgICAgIHtcbiAqICAgICAgICAgICAgIG5hbWU6ICdMZWdlbmQzJyxcbiAqICAgICAgICAgICAgIGRhdGE6IFs2MCwgNTAsIDEwXVxuICogICAgICAgICAgIH0sXG4gKiAgICAgICAgICAge1xuICogICAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDQnLFxuICogICAgICAgICAgICAgZGF0YTogWzgwLCAxMCwgNzBdXG4gKiAgICAgICAgICAgfVxuICogICAgICAgICB9LFxuICogICAgICAgICBsaW5lOiBbXG4gKiAgICAgICAgICAge1xuICogICAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDUnLFxuICogICAgICAgICAgICAgZGF0YTogWzEsIDIsIDNdXG4gKiAgICAgICAgICAgfVxuICogICAgICAgICBdXG4gKiAgICAgICB9XG4gKiAgICAgfSxcbiAqICAgICBvcHRpb25zID0ge1xuICogICAgICAgY2hhcnQ6IHtcbiAqICAgICAgICAgdGl0bGU6ICdDb21ibyBDaGFydCdcbiAqICAgICAgIH0sXG4gKiAgICAgICB5QXhpczpbXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICB0aXRsZTogJ1kgQXhpcycsXG4gKiAgICAgICAgICAgY2hhcnRUeXBlOiAnbGluZSdcbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIHRpdGxlOiAnWSBSaWdodCBBeGlzJ1xuICogICAgICAgICB9XG4gKiAgICAgICBdLFxuICogICAgICAgeEF4aXM6IHtcbiAqICAgICAgICAgdGl0bGU6ICdYIEF4aXMnXG4gKiAgICAgICB9LFxuICogICAgICAgc2VyaWVzOiB7XG4gKiAgICAgICAgIGhhc0RvdDogdHJ1ZVxuICogICAgICAgfVxuICogICAgIH07XG4gKiBuZS5hcHBsaWNhdGlvbi5jaGFydC5jb21ib0NoYXJ0KGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucyk7XG4gKi9cbm5lLmFwcGxpY2F0aW9uLmNoYXJ0LmNvbWJvQ2hhcnQgPSBmdW5jdGlvbihjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICBvcHRpb25zLmNoYXJ0VHlwZSA9IGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9DT01CTztcbiAgICByZXR1cm4gX2NyZWF0ZUNoYXJ0KGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucyk7XG59O1xuXG4vKipcbiAqIFBpZSBjaGFydCBjcmVhdG9yLlxuICogQG1lbWJlck9mIG5lLmFwcGxpY2F0aW9uLmNoYXJ0XG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY2hhcnQgY29udGFpbmVyXG4gKiBAcGFyYW0ge29iamVjdH0gZGF0YSBjaGFydCBkYXRhXG4gKiAgICAgIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gZGF0YS5zZXJpZXMgc2VyaWVzIGRhdGFcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuY2hhcnQgY2hhcnQgb3B0aW9uc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMuY2hhcnQud2lkdGggY2hhcnQgd2lkdGhcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LmhlaWdodCBjaGFydCBoZWlnaHRcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmNoYXJ0LnRpdGxlIGNoYXJ0IHRpdGxlXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC5mb3JtYXQgdmFsdWUgZm9ybWF0XG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnRvb2x0aXAgb3B0aW9ucyBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnN1ZmZpeCBzdWZmaXggb2YgdG9vbHRpcFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC50ZW1wbGF0ZSB0ZW1wbGF0ZSBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnBvc2l0aW9uIHRvb2x0aXAgcG9zaXRpb24gdHlwZVxuICogICAgICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMudG9vbHRpcC5hZGRQb3NpdGlvbiBhZGQgcG9zaXRpb25cbiAqICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uLmxlZnQgYWRkIGxlZnQgcG9zaXRpb25cbiAqICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uLnRvcCBhZGQgdG9wIHBvc2l0aW9uXG4gKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRoZW1lIHRoZW1lIG5hbWVcbiAqICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMubGliVHlwZSBncmFwaCBsaWJyYXJ5IHR5cGVcbiAqIEByZXR1cm5zIHtvYmplY3R9IGJhciBjaGFydFxuICogQGV4YW1wbGVcbiAqIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFpbmVyLWlkJyksXG4gKiAgICAgZGF0YSA9IHtcbiAqICAgICAgIHNlcmllczogW1xuICogICAgICAgICB7XG4gKiAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDEnLFxuICogICAgICAgICAgIGRhdGE6IDIwXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMicsXG4gKiAgICAgICAgICAgZGF0YTogNDBcbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQzJyxcbiAqICAgICAgICAgICBkYXRhOiA2MFxuICogICAgICAgICB9LFxuICogICAgICAgICB7XG4gKiAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDQnLFxuICogICAgICAgICAgIGRhdGE6IDgwXG4gKiAgICAgICAgIH1cbiAqICAgICAgIF1cbiAqICAgICB9LFxuICogICAgIG9wdGlvbnMgPSB7XG4gKiAgICAgICBjaGFydDoge1xuICogICAgICAgICB0aXRsZTogJ1BpZSBDaGFydCdcbiAqICAgICAgIH1cbiAqICAgICB9O1xuICogbmUuYXBwbGljYXRpb24uY2hhcnQucGllQ2hhcnQoY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKTtcbiAqL1xubmUuYXBwbGljYXRpb24uY2hhcnQucGllQ2hhcnQgPSBmdW5jdGlvbihjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICBvcHRpb25zLmNoYXJ0VHlwZSA9IGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9QSUU7XG4gICAgcmV0dXJuIF9jcmVhdGVDaGFydChjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpO1xufTtcblxuLyoqXG4gKiBSZWdpc3RlciB0aGVtZS5cbiAqIEBtZW1iZXJPZiBuZS5hcHBsaWNhdGlvbi5jaGFydFxuICogQHBhcmFtIHtzdHJpbmd9IHRoZW1lTmFtZSB0aGVtZSBuYW1lXG4gKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgYXBwbGljYXRpb24gY2hhcnQgdGhlbWVcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IHRoZW1lLmNoYXJ0IGNoYXJ0IHRoZW1lXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUuY2hhcnQuZm9udEZhbWlseSBmb250IGZhbWlseSBvZiBjaGFydFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLmNoYXJ0LmJhY2tncm91bmQgYmFja2dyb3VuZCBvZiBjaGFydFxuICogICAgICBAcGFyYW0ge29iamVjdH0gdGhlbWUudGl0bGUgY2hhcnQgdGhlbWVcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSB0aGVtZS50aXRsZS5mb250U2l6ZSBmb250IHNpemUgb2YgY2hhcnQgdGl0bGVcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS50aXRsZS5mb250RmFtaWx5IGZvbnQgZmFtaWx5IG9mIGNoYXJ0IHRpdGxlXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUudGl0bGUuY29sb3IgZm9udCBjb2xvciBvZiBjaGFydCB0aXRsZVxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnRpdGxlLmJhY2tncm91bmQgYmFja2dyb3VuZCBvZiBjaGFydCB0aXRsZVxuICogICAgICBAcGFyYW0ge29iamVjdH0gdGhlbWUueUF4aXMgdGhlbWUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtvYmplY3R9IHRoZW1lLnlBeGlzLnRpdGxlIHRoZW1lIG9mIHZlcnRpY2FsIGF4aXMgdGl0bGVcbiAqICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gdGhlbWUueUF4aXMudGl0bGUuZm9udFNpemUgZm9udCBzaXplIG9mIHZlcnRpY2FsIGF4aXMgdGl0bGVcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUueUF4aXMudGl0bGUuZm9udEZhbWlseSBmb250IGZhbWlseSBvZiB2ZXJ0aWNhbCBheGlzIHRpdGxlXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnlBeGlzLnRpdGxlLmNvbG9yIGZvbnQgY29sb3Igb2YgdmVydGljYWwgYXhpcyB0aXRsZVxuICogICAgICAgICAgQHBhcmFtIHtvYmplY3R9IHRoZW1lLnlBeGlzLmxhYmVsIHRoZW1lIG9mIHZlcnRpY2FsIGF4aXMgbGFiZWxcbiAqICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gdGhlbWUueUF4aXMubGFiZWwuZm9udFNpemUgZm9udCBzaXplIG9mIHZlcnRpY2FsIGF4aXMgbGFiZWxcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUueUF4aXMubGFiZWwuZm9udEZhbWlseSBmb250IGZhbWlseSBvZiB2ZXJ0aWNhbCBheGlzIGxhYmVsXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnlBeGlzLmxhYmVsLmNvbG9yIGZvbnQgY29sb3Igb2YgdmVydGljYWwgYXhpcyBsYWJlbFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnlBeGlzLnRpY2tjb2xvciBjb2xvciBvZiB2ZXJ0aWNhbCBheGlzIHRpY2tcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IHRoZW1lLnhBeGlzIHRoZW1lIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtvYmplY3R9IHRoZW1lLnhBeGlzLnRpdGxlIHRoZW1lIG9mIGhvcml6b250YWwgYXhpcyB0aXRsZVxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSB0aGVtZS54QXhpcy50aXRsZS5mb250U2l6ZSBmb250IHNpemUgb2YgaG9yaXpvbnRhbCBheGlzIHRpdGxlXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnhBeGlzLnRpdGxlLmZvbnRGYW1pbHkgZm9udCBmYW1pbHkgb2YgaG9yaXpvbnRhbCBheGlzIHRpdGxlXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnhBeGlzLnRpdGxlLmNvbG9yIGZvbnQgY29sb3Igb2YgaG9yaXpvbnRhbCBheGlzIHRpdGxlXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gdGhlbWUueEF4aXMubGFiZWwgdGhlbWUgb2YgaG9yaXpvbnRhbCBheGlzIGxhYmVsXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IHRoZW1lLnhBeGlzLmxhYmVsLmZvbnRTaXplIGZvbnQgc2l6ZSBvZiBob3Jpem9udGFsIGF4aXMgbGFiZWxcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUueEF4aXMubGFiZWwuZm9udEZhbWlseSBmb250IGZhbWlseSBvZiBob3Jpem9udGFsIGF4aXMgbGFiZWxcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUueEF4aXMubGFiZWwuY29sb3IgZm9udCBjb2xvciBvZiBob3Jpem9udGFsIGF4aXMgbGFiZWxcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS54QXhpcy50aWNrY29sb3IgY29sb3Igb2YgaG9yaXpvbnRhbCBheGlzIHRpY2tcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IHRoZW1lLnBsb3QgcGxvdCB0aGVtZVxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnBsb3QubGluZUNvbG9yIHBsb3QgbGluZSBjb2xvclxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnBsb3QuYmFja2dyb3VuZCBwbG90IGJhY2tncm91bmRcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IHRoZW1lLnNlcmllcyBzZXJpZXMgdGhlbWVcbiAqICAgICAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IHRoZW1lLnNlcmllcy5jb2xvcnMgc2VyaWVzIGNvbG9yc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnNlcmllcy5ib3JkZXJDb2xvciBzZXJpZXMgYm9yZGVyIGNvbG9yXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSB0aGVtZS5sZWdlbmQgbGVnZW5kIHRoZW1lXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gdGhlbWUubGVnZW5kLmxhYmVsIHRoZW1lIG9mIGxlZ2VuZCBsYWJlbFxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSB0aGVtZS5sZWdlbmQubGFiZWwuZm9udFNpemUgZm9udCBzaXplIG9mIGxlZ2VuZCBsYWJlbFxuICogICAgICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS5sZWdlbmQubGFiZWwuZm9udEZhbWlseSBmb250IGZhbWlseSBvZiBsZWdlbmQgbGFiZWxcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUubGVnZW5kLmxhYmVsLmNvbG9yIGZvbnQgY29sb3Igb2YgbGVnZW5kIGxhYmVsXG4gKiBAZXhhbXBsZVxuICogdmFyIHRoZW1lID0ge1xuICogICB5QXhpczoge1xuICogICAgIHRpY2tDb2xvcjogJyNjY2JkOWEnLFxuICogICAgICAgdGl0bGU6IHtcbiAqICAgICAgICAgY29sb3I6ICcjMzMzMzMzJ1xuICogICAgICAgfSxcbiAqICAgICAgIGxhYmVsOiB7XG4gKiAgICAgICAgIGNvbG9yOiAnIzZmNDkxZCdcbiAqICAgICAgIH1cbiAqICAgICB9LFxuICogICAgIHhBeGlzOiB7XG4gKiAgICAgICB0aWNrQ29sb3I6ICcjY2NiZDlhJyxcbiAqICAgICAgIHRpdGxlOiB7XG4gKiAgICAgICAgIGNvbG9yOiAnIzMzMzMzMydcbiAqICAgICAgIH0sXG4gKiAgICAgICBsYWJlbDoge1xuICogICAgICAgICBjb2xvcjogJyM2ZjQ5MWQnXG4gKiAgICAgICB9XG4gKiAgICAgfSxcbiAqICAgICBwbG90OiB7XG4gKiAgICAgICBsaW5lQ29sb3I6ICcjZTVkYmM0JyxcbiAqICAgICAgIGJhY2tncm91bmQ6ICcjZjZmMWU1J1xuICogICAgIH0sXG4gKiAgICAgc2VyaWVzOiB7XG4gKiAgICAgICBjb2xvcnM6IFsnIzQwYWJiNCcsICcjZTc4YTMxJywgJyNjMWM0NTInLCAnIzc5NTIyNCcsICcjZjVmNWY1J10sXG4gKiAgICAgICBib3JkZXJDb2xvcjogJyM4ZTY1MzUnXG4gKiAgICAgfSxcbiAqICAgICBsZWdlbmQ6IHtcbiAqICAgICAgIGxhYmVsOiB7XG4gKiAgICAgICAgIGNvbG9yOiAnIzZmNDkxZCdcbiAqICAgICAgIH1cbiAqICAgICB9XG4gKiAgIH07XG4gKiBjaGFydC5yZWdpc3RlclRoZW1lKCduZXdUaGVtZScsIHRoZW1lKTtcbiAqL1xubmUuYXBwbGljYXRpb24uY2hhcnQucmVnaXN0ZXJUaGVtZSA9IGZ1bmN0aW9uKHRoZW1lTmFtZSwgdGhlbWUpIHtcbiAgICB0aGVtZUZhY3RvcnkucmVnaXN0ZXIodGhlbWVOYW1lLCB0aGVtZSk7XG59O1xuXG4vKipcbiAqIFJlZ2lzdGVyIGdyYXBoIHBsdWdpbi5cbiAqIEBtZW1iZXJPZiBuZS5hcHBsaWNhdGlvbi5jaGFydFxuICogQHBhcmFtIHtzdHJpbmd9IGxpYlR5cGUgdHlwZSBvZiBncmFwaCBsaWJyYXJ5XG4gKiBAcGFyYW0ge29iamVjdH0gcGx1Z2luIHBsdWdpbiB0byBjb250cm9sIGxpYnJhcnlcbiAqIEBleGFtcGxlXG4gKiB2YXIgcGx1Z2luUmFwaGFlbCA9IHtcbiAqICAgYmFyOiBmdW5jdGlvbigpIHt9IC8vIFJlbmRlciBjbGFzc1xuICogfTtcbiAqIG5lLmFwcGxpY2F0aW9uLmNoYXJ0LnJlZ2lzdGVyUGx1Z2luKCdyYXBoYWVsJywgcGx1Z2luUmFwaGFlbCk7XG4gKi9cbm5lLmFwcGxpY2F0aW9uLmNoYXJ0LnJlZ2lzdGVyUGx1Z2luID0gZnVuY3Rpb24obGliVHlwZSwgcGx1Z2luKSB7XG4gICAgcGx1Z2luRmFjdG9yeS5yZWdpc3RlcihsaWJUeXBlLCBwbHVnaW4pO1xufTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBBeGlzQmFzZVxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ2hhcnRCYXNlID0gcmVxdWlyZSgnLi9jaGFydEJhc2UuanMnKSxcbiAgICBBeGlzID0gcmVxdWlyZSgnLi4vYXhlcy9heGlzLmpzJyksXG4gICAgUGxvdCA9IHJlcXVpcmUoJy4uL3Bsb3RzL3Bsb3QuanMnKSxcbiAgICBMZWdlbmQgPSByZXF1aXJlKCcuLi9sZWdlbmRzL2xlZ2VuZC5qcycpLFxuICAgIFRvb2x0aXAgPSByZXF1aXJlKCcuLi90b29sdGlwcy90b29sdGlwLmpzJyk7XG5cbnZhciBBeGlzVHlwZUJhc2UgPSBuZS51dGlsLmRlZmluZUNsYXNzKENoYXJ0QmFzZSwgLyoqIEBsZW5kcyBBeGlzVHlwZUJhc2UucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBBeGlzIHR5cGUgY2hhcnQgYmFzZVxuICAgICAqIEBjb25zdHJ1Y3RzIEF4aXNUeXBlQmFzZVxuICAgICAqIEBleHRlbmRzIENoYXJ0QmFzZVxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgICAgQ2hhcnRCYXNlLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgYXhpcyBjb21wb25lbnRzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmNvdmVydERhdGEgY29udmVydGVkIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuYXhlcyBheGVzIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMucGxvdERhdGEgcGxvdCBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge2Z1bmN0aW9ufSBwYXJhbXMuU2VyaWVzIHNlcmllcyBjbGFzc1xuICAgICAqL1xuICAgIGFkZEF4aXNDb21wb25lbnRzOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGNvbnZlcnREYXRhID0gcGFyYW1zLmNvbnZlcnREYXRhO1xuXG4gICAgICAgIGlmIChwYXJhbXMucGxvdERhdGEpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KCdwbG90JywgUGxvdCwgcGFyYW1zLnBsb3REYXRhKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaChwYXJhbXMuYXhlcywgZnVuY3Rpb24oZGF0YSwgbmFtZSkge1xuICAgICAgICAgICAgdGhpcy5hZGRDb21wb25lbnQobmFtZSwgQXhpcywge1xuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGFcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICBpZiAoY29udmVydERhdGEuam9pbkxlZ2VuZExhYmVscykge1xuICAgICAgICAgICAgdGhpcy5hZGRDb21wb25lbnQoJ2xlZ2VuZCcsIExlZ2VuZCwge1xuICAgICAgICAgICAgICAgIGpvaW5MZWdlbmRMYWJlbHM6IGNvbnZlcnREYXRhLmpvaW5MZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICAgICAgbGVnZW5kTGFiZWxzOiBjb252ZXJ0RGF0YS5sZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICAgICAgY2hhcnRUeXBlOiBwYXJhbXMuY2hhcnRUeXBlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KCd0b29sdGlwJywgVG9vbHRpcCwge1xuICAgICAgICAgICAgdmFsdWVzOiBjb252ZXJ0RGF0YS5mb3JtYXR0ZWRWYWx1ZXMsXG4gICAgICAgICAgICBsYWJlbHM6IGNvbnZlcnREYXRhLmxhYmVscyxcbiAgICAgICAgICAgIGxlZ2VuZExhYmVsczogY29udmVydERhdGEubGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgcHJlZml4OiB0aGlzLnRvb2x0aXBQcmVmaXhcbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQXhpc1R5cGVCYXNlO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEJhciBjaGFydC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIEF4aXNUeXBlQmFzZSA9IHJlcXVpcmUoJy4vYXhpc1R5cGVCYXNlLmpzJyksXG4gICAgYXhpc0RhdGFNYWtlciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvYXhpc0RhdGFNYWtlci5qcycpLFxuICAgIFNlcmllcyA9IHJlcXVpcmUoJy4uL3Nlcmllcy9iYXJDaGFydFNlcmllcy5qcycpO1xuXG52YXIgQmFyQ2hhcnQgPSBuZS51dGlsLmRlZmluZUNsYXNzKEF4aXNUeXBlQmFzZSwgLyoqIEBsZW5kcyBCYXJDaGFydC5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIEJhciBjaGFydC5cbiAgICAgKiBAY29uc3RydWN0cyBCYXJDaGFydFxuICAgICAqIEBleHRlbmRzIEF4aXNUeXBlQmFzZVxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gdXNlckRhdGEgY2hhcnQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBjaGFydCB0aGVtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbih1c2VyRGF0YSwgdGhlbWUsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIGJhc2VEYXRhID0gdGhpcy5tYWtlQmFzZURhdGEodXNlckRhdGEsIHRoZW1lLCBvcHRpb25zLCB7XG4gICAgICAgICAgICAgICAgaGFzQXhlczogdHJ1ZVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBjb252ZXJ0RGF0YSA9IGJhc2VEYXRhLmNvbnZlcnREYXRhLFxuICAgICAgICAgICAgYm91bmRzID0gYmFzZURhdGEuYm91bmRzLFxuICAgICAgICAgICAgYXhpc0RhdGE7XG5cbiAgICAgICAgdGhpcy5jbGFzc05hbWUgPSAnbmUtYmFyLWNoYXJ0JztcblxuICAgICAgICBBeGlzVHlwZUJhc2UuY2FsbCh0aGlzLCBib3VuZHMsIHRoZW1lLCBvcHRpb25zKTtcblxuICAgICAgICBheGlzRGF0YSA9IHRoaXMuX21ha2VBeGVzRGF0YShjb252ZXJ0RGF0YSwgYm91bmRzLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5fYWRkQ29tcG9uZW50cyhjb252ZXJ0RGF0YSwgYXhpc0RhdGEsIG9wdGlvbnMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGF4ZXMgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb252ZXJ0RGF0YSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBib3VuZHMgY2hhcnQgYm91bmRzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IGF4ZXMgZGF0YVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VBeGVzRGF0YTogZnVuY3Rpb24oY29udmVydERhdGEsIGJvdW5kcywgb3B0aW9ucykge1xuICAgICAgICB2YXIgYXhlc0RhdGEgPSB7XG4gICAgICAgICAgICB5QXhpczogYXhpc0RhdGFNYWtlci5tYWtlTGFiZWxBeGlzRGF0YSh7XG4gICAgICAgICAgICAgICAgbGFiZWxzOiBjb252ZXJ0RGF0YS5sYWJlbHMsXG4gICAgICAgICAgICAgICAgaXNWZXJ0aWNhbDogdHJ1ZVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICB4QXhpczogYXhpc0RhdGFNYWtlci5tYWtlVmFsdWVBeGlzRGF0YSh7XG4gICAgICAgICAgICAgICAgdmFsdWVzOiBjb252ZXJ0RGF0YS52YWx1ZXMsXG4gICAgICAgICAgICAgICAgc2VyaWVzRGltZW5zaW9uOiBib3VuZHMuc2VyaWVzLmRpbWVuc2lvbixcbiAgICAgICAgICAgICAgICBzdGFja2VkOiBvcHRpb25zLnNlcmllcyAmJiBvcHRpb25zLnNlcmllcy5zdGFja2VkIHx8ICcnLFxuICAgICAgICAgICAgICAgIGNoYXJ0VHlwZTogb3B0aW9ucy5jaGFydFR5cGUsXG4gICAgICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zOiBjb252ZXJ0RGF0YS5mb3JtYXRGdW5jdGlvbnMsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogb3B0aW9ucy54QXhpc1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGF4ZXNEYXRhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgY29tcG9uZW50c1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb252ZXJ0RGF0YSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBheGVzRGF0YSBheGVzIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYWRkQ29tcG9uZW50czogZnVuY3Rpb24oY29udmVydERhdGEsIGF4ZXNEYXRhLCBvcHRpb25zKSB7XG4gICAgICAgIHRoaXMuYWRkQXhpc0NvbXBvbmVudHMoe1xuICAgICAgICAgICAgY29udmVydERhdGE6IGNvbnZlcnREYXRhLFxuICAgICAgICAgICAgYXhlczogYXhlc0RhdGEsXG4gICAgICAgICAgICBwbG90RGF0YToge1xuICAgICAgICAgICAgICAgIHZUaWNrQ291bnQ6IGF4ZXNEYXRhLnlBeGlzLnZhbGlkVGlja0NvdW50LFxuICAgICAgICAgICAgICAgIGhUaWNrQ291bnQ6IGF4ZXNEYXRhLnhBeGlzLnZhbGlkVGlja0NvdW50XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2hhcnRUeXBlOiBvcHRpb25zLmNoYXJ0VHlwZVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmFkZENvbXBvbmVudCgnc2VyaWVzJywgU2VyaWVzLCB7XG4gICAgICAgICAgICBsaWJUeXBlOiBvcHRpb25zLmxpYlR5cGUsXG4gICAgICAgICAgICBjaGFydFR5cGU6IG9wdGlvbnMuY2hhcnRUeXBlLFxuICAgICAgICAgICAgdG9vbHRpcFByZWZpeDogdGhpcy50b29sdGlwUHJlZml4LFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIHZhbHVlczogY29udmVydERhdGEudmFsdWVzLFxuICAgICAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlczogY29udmVydERhdGEuZm9ybWF0dGVkVmFsdWVzLFxuICAgICAgICAgICAgICAgIHNjYWxlOiBheGVzRGF0YS54QXhpcy5zY2FsZVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBCYXJDaGFydDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBDaGFydEJhc2VcbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGRvbSA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZG9tSGFuZGxlci5qcycpLFxuICAgIHJlbmRlclV0aWwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3JlbmRlclV0aWwuanMnKSxcbiAgICBkYXRhQ29udmVydGVyID0gcmVxdWlyZSgnLi4vaGVscGVycy9kYXRhQ29udmVydGVyLmpzJyksXG4gICAgYm91bmRzTWFrZXIgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2JvdW5kc01ha2VyLmpzJyk7XG5cbnZhciBUT09MVElQX1BSRUZJWCA9ICduZS1jaGFydC10b29sdGlwLSc7XG5cbnZhciBDaGFydEJhc2UgPSBuZS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgQ2hhcnRCYXNlLnByb3RvdHlwZSAqLyB7XG4gICAgdG9vbHRpcFByZWZpeDogVE9PTFRJUF9QUkVGSVggKyAobmV3IERhdGUoKSkuZ2V0VGltZSgpICsgJy0nLFxuXG4gICAgLyoqXG4gICAgICogQ2hhcnQgYmFzZS5cbiAgICAgKiBAY29uc3RydWN0cyBDaGFydEJhc2VcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYm91bmRzIGNoYXJ0IGJvdW5kc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBjaGFydCB0aGVtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gaW5pdGVkRGF0YSBpbml0aWFsaXplZCBkYXRhIGZyb20gY29tYm8gY2hhcnRcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihib3VuZHMsIHRoZW1lLCBvcHRpb25zLCBpbml0ZWREYXRhKSB7XG4gICAgICAgIHRoaXMuY29tcG9uZW50cyA9IFtdO1xuICAgICAgICB0aGlzLmNvbXBvbmVudE1hcCA9IHt9O1xuICAgICAgICB0aGlzLmJvdW5kcyA9IGJvdW5kcztcbiAgICAgICAgdGhpcy50aGVtZSA9IHRoZW1lO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgICAgICBpZiAoaW5pdGVkRGF0YSAmJiBpbml0ZWREYXRhLnByZWZpeCkge1xuICAgICAgICAgICAgdGhpcy50b29sdGlwUHJlZml4ICs9IGluaXRlZERhdGEucHJlZml4O1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYmFlcyBkYXRhLlxuICAgICAqIEBwYXJhbSB7YXJyYXkgfCBvYmplY3R9IHVzZXJEYXRhIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBjaGFydCB0aGVtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYm91bmRQYXJhbXMgYWRkIGJvdW5kIHBhcmFtc1xuICAgICAqIEByZXR1cm5zIHt7Y29udmVydERhdGE6IG9iamVjdCwgYm91bmRzOiBvYmplY3R9fSBiYXNlIGRhdGFcbiAgICAgKi9cbiAgICBtYWtlQmFzZURhdGE6IGZ1bmN0aW9uKHVzZXJEYXRhLCB0aGVtZSwgb3B0aW9ucywgYm91bmRQYXJhbXMpIHtcbiAgICAgICAgdmFyIGNvbnZlcnREYXRhID0gZGF0YUNvbnZlcnRlci5jb252ZXJ0KHVzZXJEYXRhLCBvcHRpb25zLmNoYXJ0LCBvcHRpb25zLmNoYXJ0VHlwZSwgYm91bmRQYXJhbXMgJiYgYm91bmRQYXJhbXMueUF4aXNDaGFydFR5cGVzKSxcbiAgICAgICAgICAgIGJvdW5kcyA9IGJvdW5kc01ha2VyLm1ha2UobmUudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgICAgIGNvbnZlcnREYXRhOiBjb252ZXJ0RGF0YSxcbiAgICAgICAgICAgICAgICB0aGVtZTogdGhlbWUsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgICAgICAgICAgfSwgYm91bmRQYXJhbXMpKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY29udmVydERhdGE6IGNvbnZlcnREYXRhLFxuICAgICAgICAgICAgYm91bmRzOiBib3VuZHNcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIGNvbXBvbmVudC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBjb21wb25lbnQgbmFtZVxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IENvbXBvbmVudCBjb21wb25lbnQgZnVuY3Rpb25cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKi9cbiAgICBhZGRDb21wb25lbnQ6IGZ1bmN0aW9uKG5hbWUsIENvbXBvbmVudCwgcGFyYW1zKSB7XG4gICAgICAgIHZhciBib3VuZCA9IHRoaXMuYm91bmRzW25hbWVdLFxuICAgICAgICAgICAgdGhlbWUgPSB0aGlzLnRoZW1lW25hbWVdLFxuICAgICAgICAgICAgb3B0aW9ucyA9IHRoaXMub3B0aW9uc1tuYW1lXSxcbiAgICAgICAgICAgIGluZGV4ID0gcGFyYW1zLmluZGV4IHx8IDAsXG4gICAgICAgICAgICBjb21tb25QYXJhbXMgPSB7fSxcbiAgICAgICAgICAgIGNvbXBvbmVudDtcblxuICAgICAgICBjb21tb25QYXJhbXMuYm91bmQgPSBuZS51dGlsLmlzQXJyYXkoYm91bmQpID8gYm91bmRbaW5kZXhdIDogYm91bmQ7XG4gICAgICAgIGNvbW1vblBhcmFtcy50aGVtZSA9IG5lLnV0aWwuaXNBcnJheSh0aGVtZSkgPyB0aGVtZVtpbmRleF0gOiB0aGVtZTtcbiAgICAgICAgY29tbW9uUGFyYW1zLm9wdGlvbnMgPSBuZS51dGlsLmlzQXJyYXkob3B0aW9ucykgPyBvcHRpb25zW2luZGV4XSA6IG9wdGlvbnMgfHwge307XG5cbiAgICAgICAgcGFyYW1zID0gbmUudXRpbC5leHRlbmQoY29tbW9uUGFyYW1zLCBwYXJhbXMpO1xuICAgICAgICBjb21wb25lbnQgPSBuZXcgQ29tcG9uZW50KHBhcmFtcyk7XG4gICAgICAgIHRoaXMuY29tcG9uZW50cy5wdXNoKGNvbXBvbmVudCk7XG4gICAgICAgIHRoaXMuY29tcG9uZW50TWFwW25hbWVdID0gY29tcG9uZW50O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgY2hhcnQuXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgY2hhcnQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciBvYmplY3QgZm9yIGdyYXBoIGRyYXdpbmdcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IGNoYXJ0IGVsZW1lbnRcbiAgICAgKi9cbiAgICByZW5kZXI6IGZ1bmN0aW9uKGVsLCBwYXBlcikge1xuICAgICAgICBpZiAoIWVsKSB7XG4gICAgICAgICAgICBlbCA9IGRvbS5jcmVhdGUoJ0RJVicsIHRoaXMuY2xhc3NOYW1lKTtcblxuICAgICAgICAgICAgZG9tLmFkZENsYXNzKGVsLCAnbmUtY2hhcnQnKTtcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlclRpdGxlKGVsKTtcbiAgICAgICAgICAgIHJlbmRlclV0aWwucmVuZGVyRGltZW5zaW9uKGVsLCB0aGlzLmJvdW5kcy5jaGFydC5kaW1lbnNpb24pO1xuICAgICAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJCYWNrZ3JvdW5kKGVsLCB0aGlzLnRoZW1lLmNoYXJ0LmJhY2tncm91bmQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fcmVuZGVyQ29tcG9uZW50cyhlbCwgdGhpcy5jb21wb25lbnRzLCBwYXBlcik7XG4gICAgICAgIHRoaXMuX2F0dGFjaEN1c3RvbUV2ZW50KCk7XG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIHRpdGxlLlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyVGl0bGU6IGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgIHZhciBjaGFydE9wdGlvbnMgPSB0aGlzLm9wdGlvbnMuY2hhcnQgfHwge30sXG4gICAgICAgICAgICBlbFRpdGxlID0gcmVuZGVyVXRpbC5yZW5kZXJUaXRsZShjaGFydE9wdGlvbnMudGl0bGUsIHRoaXMudGhlbWUudGl0bGUsICduZS1jaGFydC10aXRsZScpO1xuICAgICAgICBkb20uYXBwZW5kKGVsLCBlbFRpdGxlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGNvbXBvbmVudHMuXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNvbnRhaW5lciBlbGVtZW50XG4gICAgICogQHBhcmFtIHthcnJheS48b2JqZWN0Pn0gY29tcG9uZW50cyBjb21wb25lbnRzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIG9iamVjdCBmb3IgZ3JhcGggZHJhd2luZ1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlckNvbXBvbmVudHM6IGZ1bmN0aW9uKGNvbnRhaW5lciwgY29tcG9uZW50cywgcGFwZXIpIHtcbiAgICAgICAgdmFyIGVsZW1lbnRzID0gbmUudXRpbC5tYXAoY29tcG9uZW50cywgZnVuY3Rpb24oY29tcG9uZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gY29tcG9uZW50LnJlbmRlcihwYXBlcik7XG4gICAgICAgIH0pO1xuICAgICAgICBkb20uYXBwZW5kKGNvbnRhaW5lciwgZWxlbWVudHMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgcGFwZXIuXG4gICAgICogQHJldHVybnMge29iamVjdH0gcGFwZXJcbiAgICAgKi9cbiAgICBnZXRQYXBlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZXJpZXMgPSB0aGlzLmNvbXBvbmVudE1hcC5zZXJpZXMsXG4gICAgICAgICAgICBwYXBlcjtcblxuICAgICAgICBpZiAoc2VyaWVzKSB7XG4gICAgICAgICAgICBwYXBlciA9IHNlcmllcy5nZXRQYXBlcigpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhcGVyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggY3VzdG9tIGV2ZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYXR0YWNoQ3VzdG9tRXZlbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdG9vbHRpcCA9IHRoaXMuY29tcG9uZW50TWFwLnRvb2x0aXAsXG4gICAgICAgICAgICBzZXJpZXMgPSB0aGlzLmNvbXBvbmVudE1hcC5zZXJpZXM7XG4gICAgICAgIGlmICghdG9vbHRpcCB8fCAhc2VyaWVzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc2VyaWVzLm9uKCdzaG93VG9vbHRpcCcsIHRvb2x0aXAub25TaG93LCB0b29sdGlwKTtcbiAgICAgICAgc2VyaWVzLm9uKCdoaWRlVG9vbHRpcCcsIHRvb2x0aXAub25IaWRlLCB0b29sdGlwKTtcblxuICAgICAgICBpZiAoIXNlcmllcy5vblNob3dBbmltYXRpb24pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRvb2x0aXAub24oJ3Nob3dBbmltYXRpb24nLCBzZXJpZXMub25TaG93QW5pbWF0aW9uLCBzZXJpZXMpO1xuICAgICAgICB0b29sdGlwLm9uKCdoaWRlQW5pbWF0aW9uJywgc2VyaWVzLm9uSGlkZUFuaW1hdGlvbiwgc2VyaWVzKTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBDaGFydEJhc2U7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgQ29sdW1uIGNoYXJ0LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQXhpc1R5cGVCYXNlID0gcmVxdWlyZSgnLi9heGlzVHlwZUJhc2UuanMnKSxcbiAgICBheGlzRGF0YU1ha2VyID0gcmVxdWlyZSgnLi4vaGVscGVycy9heGlzRGF0YU1ha2VyLmpzJyksXG4gICAgU2VyaWVzID0gcmVxdWlyZSgnLi4vc2VyaWVzL2NvbHVtbkNoYXJ0U2VyaWVzLmpzJyk7XG5cbnZhciBDb2x1bW5DaGFydCA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoQXhpc1R5cGVCYXNlLCAvKiogQGxlbmRzIENvbHVtbkNoYXJ0LnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogQ29sdW1uIGNoYXJ0LlxuICAgICAqIEBjb25zdHJ1Y3RzIENvbHVtbkNoYXJ0XG4gICAgICogQGV4dGVuZHMgQXhpc1R5cGVCYXNlXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXk+fSB1c2VyRGF0YSBjaGFydCBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIGNoYXJ0IHRoZW1lXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBpbml0ZWREYXRhIGluaXRpYWxpemVkIGRhdGEgZnJvbSBjb21ibyBjaGFydFxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKHVzZXJEYXRhLCB0aGVtZSwgb3B0aW9ucywgaW5pdGVkRGF0YSkge1xuICAgICAgICB2YXIgYmFzZURhdGEgPSBpbml0ZWREYXRhIHx8IHRoaXMubWFrZUJhc2VEYXRhKHVzZXJEYXRhLCB0aGVtZSwgb3B0aW9ucywge1xuICAgICAgICAgICAgICAgIGlzVmVydGljYWw6IHRydWUsXG4gICAgICAgICAgICAgICAgaGFzQXhlczogdHJ1ZVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBjb252ZXJ0RGF0YSA9IGJhc2VEYXRhLmNvbnZlcnREYXRhLFxuICAgICAgICAgICAgYm91bmRzID0gYmFzZURhdGEuYm91bmRzLFxuICAgICAgICAgICAgYXhpc0RhdGE7XG5cbiAgICAgICAgdGhpcy5jbGFzc05hbWUgPSAnbmUtY29sdW1uLWNoYXJ0JztcblxuICAgICAgICBBeGlzVHlwZUJhc2UuY2FsbCh0aGlzLCBib3VuZHMsIHRoZW1lLCBvcHRpb25zLCBpbml0ZWREYXRhKTtcblxuICAgICAgICBheGlzRGF0YSA9IHRoaXMuX21ha2VBeGVzRGF0YShjb252ZXJ0RGF0YSwgYm91bmRzLCBvcHRpb25zLCBpbml0ZWREYXRhKTtcbiAgICAgICAgdGhpcy5fYWRkQ29tcG9uZW50cyhjb252ZXJ0RGF0YSwgYXhpc0RhdGEsIG9wdGlvbnMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGF4ZXMgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb252ZXJ0RGF0YSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBib3VuZHMgY2hhcnQgYm91bmRzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBpbml0ZWREYXRhIGluaXRpYWxpemVkIGRhdGEgZnJvbSBjb21ibyBjaGFydFxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IGF4ZXMgZGF0YVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VBeGVzRGF0YTogZnVuY3Rpb24oY29udmVydERhdGEsIGJvdW5kcywgb3B0aW9ucywgaW5pdGVkRGF0YSkge1xuICAgICAgICB2YXIgYXhlc0RhdGEgPSB7fTtcbiAgICAgICAgaWYgKGluaXRlZERhdGEpIHtcbiAgICAgICAgICAgIGF4ZXNEYXRhID0gaW5pdGVkRGF0YS5heGVzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXhlc0RhdGEgPSB7XG4gICAgICAgICAgICAgICAgeUF4aXM6IGF4aXNEYXRhTWFrZXIubWFrZVZhbHVlQXhpc0RhdGEoe1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZXM6IGNvbnZlcnREYXRhLnZhbHVlcyxcbiAgICAgICAgICAgICAgICAgICAgc2VyaWVzRGltZW5zaW9uOiBib3VuZHMuc2VyaWVzLmRpbWVuc2lvbixcbiAgICAgICAgICAgICAgICAgICAgc3RhY2tlZDogb3B0aW9ucy5zZXJpZXMgJiYgb3B0aW9ucy5zZXJpZXMuc3RhY2tlZCB8fCAnJyxcbiAgICAgICAgICAgICAgICAgICAgY2hhcnRUeXBlOiBvcHRpb25zLmNoYXJ0VHlwZSxcbiAgICAgICAgICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zOiBjb252ZXJ0RGF0YS5mb3JtYXRGdW5jdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IG9wdGlvbnMueUF4aXMsXG4gICAgICAgICAgICAgICAgICAgIGlzVmVydGljYWw6IHRydWVcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICB4QXhpczogYXhpc0RhdGFNYWtlci5tYWtlTGFiZWxBeGlzRGF0YSh7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsczogY29udmVydERhdGEubGFiZWxzXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGF4ZXNEYXRhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgY29tcG9uZW50c1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb252ZXJ0RGF0YSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBheGVzRGF0YSBheGVzIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYWRkQ29tcG9uZW50czogZnVuY3Rpb24oY29udmVydERhdGEsIGF4ZXNEYXRhLCBvcHRpb25zKSB7XG4gICAgICAgIHRoaXMuYWRkQXhpc0NvbXBvbmVudHMoe1xuICAgICAgICAgICAgY29udmVydERhdGE6IGNvbnZlcnREYXRhLFxuICAgICAgICAgICAgYXhlczogYXhlc0RhdGEsXG4gICAgICAgICAgICBwbG90RGF0YTogIW5lLnV0aWwuaXNVbmRlZmluZWQoY29udmVydERhdGEucGxvdERhdGEpID8gY29udmVydERhdGEucGxvdERhdGEgOiB7XG4gICAgICAgICAgICAgICAgdlRpY2tDb3VudDogYXhlc0RhdGEueUF4aXMudmFsaWRUaWNrQ291bnQsXG4gICAgICAgICAgICAgICAgaFRpY2tDb3VudDogYXhlc0RhdGEueEF4aXMudmFsaWRUaWNrQ291bnRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjaGFydFR5cGU6IG9wdGlvbnMuY2hhcnRUeXBlXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KCdzZXJpZXMnLCBTZXJpZXMsIHtcbiAgICAgICAgICAgIGxpYlR5cGU6IG9wdGlvbnMubGliVHlwZSxcbiAgICAgICAgICAgIGNoYXJ0VHlwZTogb3B0aW9ucy5jaGFydFR5cGUsXG4gICAgICAgICAgICB0b29sdGlwUHJlZml4OiB0aGlzLnRvb2x0aXBQcmVmaXgsXG4gICAgICAgICAgICBpc1BvaW50UG9zaXRpb246IHRydWUsXG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgdmFsdWVzOiBjb252ZXJ0RGF0YS52YWx1ZXMsXG4gICAgICAgICAgICAgICAgZm9ybWF0dGVkVmFsdWVzOiBjb252ZXJ0RGF0YS5mb3JtYXR0ZWRWYWx1ZXMsXG4gICAgICAgICAgICAgICAgc2NhbGU6IGF4ZXNEYXRhLnlBeGlzLnNjYWxlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbHVtbkNoYXJ0O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IENvbWJvIGNoYXJ0LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2FsY3VsYXRvciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvY2FsY3VsYXRvci5qcycpLFxuICAgIENoYXJ0QmFzZSA9IHJlcXVpcmUoJy4vY2hhcnRCYXNlLmpzJyksXG4gICAgYXhpc0RhdGFNYWtlciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvYXhpc0RhdGFNYWtlci5qcycpLFxuICAgIGRlZmF1bHRUaGVtZSA9IHJlcXVpcmUoJy4uL3RoZW1lcy9kZWZhdWx0VGhlbWUuanMnKSxcbiAgICBDb2x1bW5DaGFydCA9IHJlcXVpcmUoJy4vY29sdW1uQ2hhcnQnKSxcbiAgICBMaW5lQ2hhcnQgPSByZXF1aXJlKCcuL2xpbmVDaGFydCcpO1xuXG52YXIgQ29tYm9DaGFydCA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoQ2hhcnRCYXNlLCAvKiogQGxlbmRzIENvbWJvQ2hhcnQucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBDb21ibyBjaGFydC5cbiAgICAgKiBAY29uc3RydWN0cyBDb21ib0NoYXJ0XG4gICAgICogQGV4dGVuZHMgQ2hhcnRCYXNlXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXk+fSB1c2VyRGF0YSBjaGFydCBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIGNoYXJ0IHRoZW1lXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKHVzZXJEYXRhLCB0aGVtZSwgb3B0aW9ucykge1xuICAgICAgICB2YXIgc2VyaWVzQ2hhcnRUeXBlcyA9IG5lLnV0aWwua2V5cyh1c2VyRGF0YS5zZXJpZXMpLnNvcnQoKSxcbiAgICAgICAgICAgIHlBeGlzQ2hhcnRUeXBlcyA9IHRoaXMuX2dldFlBeGlzQ2hhcnRUeXBlcyhzZXJpZXNDaGFydFR5cGVzLCBvcHRpb25zLnlBeGlzKSxcbiAgICAgICAgICAgIGNoYXJ0VHlwZXMgPSB5QXhpc0NoYXJ0VHlwZXMubGVuZ3RoID8geUF4aXNDaGFydFR5cGVzIDogc2VyaWVzQ2hhcnRUeXBlcyxcbiAgICAgICAgICAgIGlzT25lWUF4aXMgPSAheUF4aXNDaGFydFR5cGVzLmxlbmd0aCxcbiAgICAgICAgICAgIGJhc2VEYXRhID0gdGhpcy5tYWtlQmFzZURhdGEodXNlckRhdGEsIHRoZW1lLCBvcHRpb25zLCB7XG4gICAgICAgICAgICAgICAgaXNWZXJ0aWNhbDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBoYXNBeGVzOiB0cnVlLFxuICAgICAgICAgICAgICAgIHlBeGlzQ2hhcnRUeXBlczogeUF4aXNDaGFydFR5cGVzXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGNvbnZlcnREYXRhID0gYmFzZURhdGEuY29udmVydERhdGEsXG4gICAgICAgICAgICBib3VuZHMgPSBiYXNlRGF0YS5ib3VuZHMsXG4gICAgICAgICAgICBzZXJpZXNEaW1lbnNpb24gPSBib3VuZHMuc2VyaWVzLmRpbWVuc2lvbixcbiAgICAgICAgICAgIGF4ZXNEYXRhID0ge30sXG4gICAgICAgICAgICBiYXNlQXhlc0RhdGEgPSB7fSxcbiAgICAgICAgICAgIHlBeGlzUGFyYW1zO1xuXG4gICAgICAgIHRoaXMuY2xhc3NOYW1lID0gJ25lLWNvbWJvLWNoYXJ0JztcblxuICAgICAgICB5QXhpc1BhcmFtcyA9IHtcbiAgICAgICAgICAgIGNvbnZlcnREYXRhOiBjb252ZXJ0RGF0YSxcbiAgICAgICAgICAgIHNlcmllc0RpbWVuc2lvbjogc2VyaWVzRGltZW5zaW9uLFxuICAgICAgICAgICAgY2hhcnRUeXBlczogY2hhcnRUeXBlcyxcbiAgICAgICAgICAgIGlzT25lWUF4aXM6IGlzT25lWUF4aXMsXG4gICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zXG4gICAgICAgIH07XG5cbiAgICAgICAgQ2hhcnRCYXNlLmNhbGwodGhpcywgYm91bmRzLCB0aGVtZSwgb3B0aW9ucyk7XG5cbiAgICAgICAgYmFzZUF4ZXNEYXRhLnlBeGlzID0gdGhpcy5fbWFrZVlBeGlzRGF0YShuZS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICBpbmRleDogMFxuICAgICAgICB9LCB5QXhpc1BhcmFtcykpO1xuXG4gICAgICAgIGJhc2VBeGVzRGF0YS54QXhpcyA9IGF4aXNEYXRhTWFrZXIubWFrZUxhYmVsQXhpc0RhdGEoe1xuICAgICAgICAgICAgbGFiZWxzOiBjb252ZXJ0RGF0YS5sYWJlbHNcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXhlc0RhdGEgPSB0aGlzLl9tYWtlQXhlc0RhdGEoYmFzZUF4ZXNEYXRhLCB5QXhpc1BhcmFtcyk7XG5cbiAgICAgICAgdGhpcy5faW5zdGFsbENoYXJ0cyh7XG4gICAgICAgICAgICB1c2VyRGF0YTogdXNlckRhdGEsXG4gICAgICAgICAgICB0aGVtZTogdGhlbWUsXG4gICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zLFxuICAgICAgICAgICAgYmFzZURhdGE6IGJhc2VEYXRhLFxuICAgICAgICAgICAgYmFzZUF4ZXNEYXRhOiBiYXNlQXhlc0RhdGEsXG4gICAgICAgICAgICBheGVzRGF0YTogYXhlc0RhdGEsXG4gICAgICAgICAgICBzZXJpZXNDaGFydFR5cGVzOiBzZXJpZXNDaGFydFR5cGVzLFxuICAgICAgICAgICAgY2hhcnRUeXBlczogY2hhcnRUeXBlc1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHkgYXhpcyBjaGFydCB0eXBlcy5cbiAgICAgKiBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBjaGFydFR5cGVzIGNoYXJ0IHR5cGVzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHlBeGlzT3B0aW9ucyB5IGF4aXMgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHthcnJheS48c3RyaW5nPn0gY2hhcnQgdHlwZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRZQXhpc0NoYXJ0VHlwZXM6IGZ1bmN0aW9uKGNoYXJ0VHlwZXMsIHlBeGlzT3B0aW9ucykge1xuICAgICAgICB2YXIgcmVzdWx0Q2hhcnRUeXBlcyA9IGNoYXJ0VHlwZXMuc2xpY2UoKSxcbiAgICAgICAgICAgIGlzUmV2ZXJzZSA9IGZhbHNlLFxuICAgICAgICAgICAgb3B0aW9uQ2hhcnRUeXBlcztcblxuICAgICAgICB5QXhpc09wdGlvbnMgPSB5QXhpc09wdGlvbnMgPyBbXS5jb25jYXQoeUF4aXNPcHRpb25zKSA6IFtdO1xuXG4gICAgICAgIGlmICh5QXhpc09wdGlvbnMubGVuZ3RoID09PSAxICYmICF5QXhpc09wdGlvbnNbMF0uY2hhcnRUeXBlKSB7XG4gICAgICAgICAgICByZXN1bHRDaGFydFR5cGVzID0gW107XG4gICAgICAgIH0gZWxzZSBpZiAoeUF4aXNPcHRpb25zLmxlbmd0aCkge1xuICAgICAgICAgICAgb3B0aW9uQ2hhcnRUeXBlcyA9IG5lLnV0aWwubWFwKHlBeGlzT3B0aW9ucywgZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbi5jaGFydFR5cGU7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkob3B0aW9uQ2hhcnRUeXBlcywgZnVuY3Rpb24oY2hhcnRUeXBlLCBpbmRleCkge1xuICAgICAgICAgICAgICAgIGlzUmV2ZXJzZSA9IGlzUmV2ZXJzZSB8fCAoY2hhcnRUeXBlICYmIHJlc3VsdENoYXJ0VHlwZXNbaW5kZXhdICE9PSBjaGFydFR5cGUgfHwgZmFsc2UpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmIChpc1JldmVyc2UpIHtcbiAgICAgICAgICAgICAgICByZXN1bHRDaGFydFR5cGVzLnJldmVyc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHRDaGFydFR5cGVzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHkgYXhpcyBkYXRhLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5pbmRleCBjaGFydCBpbmRleFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5jb252ZXJ0RGF0YSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBwYXJhbXMuc2VyaWVzRGltZW5zaW9uIHNlcmllcyBkaW1lbnNpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGNoYXJ0VHlwZXMgY2hhcnQgdHlwZVxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBpc09uZVlBeGlzIHdoZXRoZXIgb25lIHNlcmllcyBvciBub3RcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBhZGRQYXJhbXMgYWRkIHBhcmFtc1xuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHkgYXhpcyBkYXRhXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVlBeGlzRGF0YTogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBjb252ZXJ0RGF0YSA9IHBhcmFtcy5jb252ZXJ0RGF0YSxcbiAgICAgICAgICAgIGluZGV4ID0gcGFyYW1zLmluZGV4LFxuICAgICAgICAgICAgY2hhcnRUeXBlID0gcGFyYW1zLmNoYXJ0VHlwZXNbaW5kZXhdLFxuICAgICAgICAgICAgb3B0aW9ucyA9IHBhcmFtcy5vcHRpb25zLFxuICAgICAgICAgICAgeUF4aXNWYWx1ZXMsIHlBeGlzT3B0aW9ucywgc2VyaWVzT3B0aW9uO1xuXG4gICAgICAgIGlmIChwYXJhbXMuaXNPbmVZQXhpcykge1xuICAgICAgICAgICAgeUF4aXNWYWx1ZXMgPSBjb252ZXJ0RGF0YS5qb2luVmFsdWVzO1xuICAgICAgICAgICAgeUF4aXNPcHRpb25zID0gW29wdGlvbnMueUF4aXNdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgeUF4aXNWYWx1ZXMgPSBjb252ZXJ0RGF0YS52YWx1ZXNbY2hhcnRUeXBlXTtcbiAgICAgICAgICAgIHlBeGlzT3B0aW9ucyA9IG9wdGlvbnMueUF4aXMgfHwgW107XG4gICAgICAgIH1cblxuICAgICAgICBzZXJpZXNPcHRpb24gPSBvcHRpb25zLnNlcmllcyAmJiBvcHRpb25zLnNlcmllc1tjaGFydFR5cGVdIHx8IG9wdGlvbnMuc2VyaWVzO1xuXG4gICAgICAgIHJldHVybiBheGlzRGF0YU1ha2VyLm1ha2VWYWx1ZUF4aXNEYXRhKG5lLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgIHZhbHVlczogeUF4aXNWYWx1ZXMsXG4gICAgICAgICAgICBzdGFja2VkOiBzZXJpZXNPcHRpb24gJiYgc2VyaWVzT3B0aW9uLnN0YWNrZWQgfHwgJycsXG4gICAgICAgICAgICBvcHRpb25zOiB5QXhpc09wdGlvbnNbaW5kZXhdLFxuICAgICAgICAgICAgY2hhcnRUeXBlOiBjaGFydFR5cGUsXG4gICAgICAgICAgICBzZXJpZXNEaW1lbnNpb246IHBhcmFtcy5zZXJpZXNEaW1lbnNpb24sXG4gICAgICAgICAgICBmb3JtYXRGdW5jdGlvbnM6IGNvbnZlcnREYXRhLmZvcm1hdEZ1bmN0aW9ucyxcbiAgICAgICAgICAgIGlzVmVydGljYWw6IHRydWVcbiAgICAgICAgfSwgcGFyYW1zLmFkZFBhcmFtcykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGF4ZXMgZGF0YS5cbiAgICAgKiBAcGFyYW0ge3t5QXhpczogb2JqZWN0LCB4QXhpczogb2JqZWN0fX0gYmFzZUF4ZXNEYXRhIGJhc2UgYXhlcyBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHlBeGlzUGFyYW1zIHkgYXhpcyBwYXJhbXNcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBheGVzIGRhdGFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQXhlc0RhdGE6IGZ1bmN0aW9uKGJhc2VBeGVzRGF0YSwgeUF4aXNQYXJhbXMpIHtcbiAgICAgICAgdmFyIHlBeGlzRGF0YSA9IGJhc2VBeGVzRGF0YS55QXhpcyxcbiAgICAgICAgICAgIGNoYXJ0VHlwZXMgPSB5QXhpc1BhcmFtcy5jaGFydFR5cGVzLFxuICAgICAgICAgICAgYXhlc0RhdGEgPSB7fSxcbiAgICAgICAgICAgIHlyQXhpc0RhdGE7XG4gICAgICAgIGlmICgheUF4aXNQYXJhbXMuaXNPbmVZQXhpcykge1xuICAgICAgICAgICAgeXJBeGlzRGF0YSA9IHRoaXMuX21ha2VZQXhpc0RhdGEobmUudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgICAgIGluZGV4OiAxLFxuICAgICAgICAgICAgICAgIGFkZFBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICBpc1Bvc2l0aW9uUmlnaHQ6IHRydWVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB5QXhpc1BhcmFtcykpO1xuICAgICAgICAgICAgaWYgKHlBeGlzRGF0YS50aWNrQ291bnQgPCB5ckF4aXNEYXRhLnRpY2tDb3VudCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luY3JlYXNlWUF4aXNTY2FsZU1heCh5ckF4aXNEYXRhLCB5QXhpc0RhdGEpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh5QXhpc0RhdGEudGlja0NvdW50ID4geXJBeGlzRGF0YS50aWNrQ291bnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbmNyZWFzZVlBeGlzU2NhbGVNYXgoeUF4aXNEYXRhLCB5ckF4aXNEYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGF4ZXNEYXRhW2NoYXJ0VHlwZXNbMF1dID0gYmFzZUF4ZXNEYXRhO1xuICAgICAgICBheGVzRGF0YVtjaGFydFR5cGVzWzFdXSA9IHtcbiAgICAgICAgICAgIHlBeGlzOiB5ckF4aXNEYXRhIHx8IHlBeGlzRGF0YVxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBheGVzRGF0YTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBvcmRlciBpbmZvIGFib3VuZCBjaGFydCB0eXBlLlxuICAgICAqIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGNoYXJ0VHlwZXMgY2hhcnQgdHlwZXNcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBjaGFydCBvcmRlciBpbmZvXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUNoYXJ0VHlwZU9yZGVySW5mbzogZnVuY3Rpb24oY2hhcnRUeXBlcykge1xuICAgICAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KGNoYXJ0VHlwZXMsIGZ1bmN0aW9uKGNoYXJ0VHlwZSwgaW5kZXgpIHtcbiAgICAgICAgICAgIHJlc3VsdFtjaGFydFR5cGVdID0gaW5kZXg7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIG9wdGlvbnMgbWFwXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGNoYXJ0VHlwZXMgY2hhcnQgdHlwZXNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9yZGVySW5mbyBjaGFydCBvcmRlclxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IG9wdGlvbnMgbWFwXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZU9wdGlvbnNNYXA6IGZ1bmN0aW9uKGNoYXJ0VHlwZXMsIG9wdGlvbnMsIG9yZGVySW5mbykge1xuICAgICAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KGNoYXJ0VHlwZXMsIGZ1bmN0aW9uKGNoYXJ0VHlwZSkge1xuICAgICAgICAgICAgdmFyIGNoYXJ0T3B0aW9ucyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob3B0aW9ucykpLFxuICAgICAgICAgICAgICAgIGluZGV4ID0gb3JkZXJJbmZvW2NoYXJ0VHlwZV07XG5cbiAgICAgICAgICAgIGlmIChjaGFydE9wdGlvbnMueUF4aXMgJiYgY2hhcnRPcHRpb25zLnlBeGlzW2luZGV4XSkge1xuICAgICAgICAgICAgICAgIGNoYXJ0T3B0aW9ucy55QXhpcyA9IGNoYXJ0T3B0aW9ucy55QXhpc1tpbmRleF07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChjaGFydE9wdGlvbnMuc2VyaWVzICYmIGNoYXJ0T3B0aW9ucy5zZXJpZXNbY2hhcnRUeXBlXSkge1xuICAgICAgICAgICAgICAgIGNoYXJ0T3B0aW9ucy5zZXJpZXMgPSBjaGFydE9wdGlvbnMuc2VyaWVzW2NoYXJ0VHlwZV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChjaGFydE9wdGlvbnMudG9vbHRpcCAmJiBjaGFydE9wdGlvbnMudG9vbHRpcFtjaGFydFR5cGVdKSB7XG4gICAgICAgICAgICAgICAgY2hhcnRPcHRpb25zLnRvb2x0aXAgPSBjaGFydE9wdGlvbnMudG9vbHRpcFtjaGFydFR5cGVdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2hhcnRPcHRpb25zLmNoYXJ0VHlwZSA9IGNoYXJ0VHlwZTtcbiAgICAgICAgICAgIHJlc3VsdFtjaGFydFR5cGVdID0gY2hhcnRPcHRpb25zO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSB0aGVtZSBtYXBcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY2hhcnRUeXBlcyBjaGFydCB0eXBlc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBjaGFydCB0aGVtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBsZWdlbmRMYWJlbHMgbGVnZW5kIGxhYmVsc1xuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHRoZW1lIG1hcFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VUaGVtZU1hcDogZnVuY3Rpb24oY2hhcnRUeXBlcywgdGhlbWUsIGxlZ2VuZExhYmVscykge1xuICAgICAgICB2YXIgcmVzdWx0ID0ge30sXG4gICAgICAgICAgICBjb2xvckNvdW50ID0gMDtcbiAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkoY2hhcnRUeXBlcywgZnVuY3Rpb24oY2hhcnRUeXBlKSB7XG4gICAgICAgICAgICB2YXIgY2hhcnRUaGVtZSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhlbWUpKSxcbiAgICAgICAgICAgICAgICByZW1vdmVkQ29sb3JzO1xuXG4gICAgICAgICAgICBpZiAoY2hhcnRUaGVtZS55QXhpc1tjaGFydFR5cGVdKSB7XG4gICAgICAgICAgICAgICAgY2hhcnRUaGVtZS55QXhpcyA9IGNoYXJ0VGhlbWUueUF4aXNbY2hhcnRUeXBlXTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWNoYXJ0VGhlbWUueUF4aXMudGl0bGUpIHtcbiAgICAgICAgICAgICAgICBjaGFydFRoZW1lLnlBeGlzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShkZWZhdWx0VGhlbWUueUF4aXMpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGNoYXJ0VGhlbWUuc2VyaWVzW2NoYXJ0VHlwZV0pIHtcbiAgICAgICAgICAgICAgICBjaGFydFRoZW1lLnNlcmllcyA9IGNoYXJ0VGhlbWUuc2VyaWVzW2NoYXJ0VHlwZV07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFjaGFydFRoZW1lLnNlcmllcy5jb2xvcnMpIHtcbiAgICAgICAgICAgICAgICBjaGFydFRoZW1lLnNlcmllcyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZGVmYXVsdFRoZW1lLnNlcmllcykpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZW1vdmVkQ29sb3JzID0gY2hhcnRUaGVtZS5zZXJpZXMuY29sb3JzLnNwbGljZSgwLCBjb2xvckNvdW50KTtcbiAgICAgICAgICAgICAgICBjaGFydFRoZW1lLnNlcmllcy5jb2xvcnMgPSBjaGFydFRoZW1lLnNlcmllcy5jb2xvcnMuY29uY2F0KHJlbW92ZWRDb2xvcnMpO1xuICAgICAgICAgICAgICAgIGNvbG9yQ291bnQgKz0gbGVnZW5kTGFiZWxzW2NoYXJ0VHlwZV0ubGVuZ3RoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0W2NoYXJ0VHlwZV0gPSBjaGFydFRoZW1lO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW5jcmVhc2UgeSBheGlzIHNjYWxlIG1heC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZnJvbURhdGEgZnJvbSB0aWNrIGluZm9cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdG9EYXRhIHRvIHRpY2sgaW5mb1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2luY3JlYXNlWUF4aXNTY2FsZU1heDogZnVuY3Rpb24oZnJvbURhdGEsIHRvRGF0YSkge1xuICAgICAgICB2YXIgZGlmZiA9IGZyb21EYXRhLnRpY2tDb3VudCAtIHRvRGF0YS50aWNrQ291bnQ7XG4gICAgICAgIHRvRGF0YS5zY2FsZS5tYXggKz0gdG9EYXRhLnN0ZXAgKiBkaWZmO1xuICAgICAgICB0b0RhdGEubGFiZWxzID0gY2FsY3VsYXRvci5tYWtlTGFiZWxzRnJvbVNjYWxlKHRvRGF0YS5zY2FsZSwgdG9EYXRhLnN0ZXApO1xuICAgICAgICB0b0RhdGEudGlja0NvdW50ID0gZnJvbURhdGEudGlja0NvdW50O1xuICAgICAgICB0b0RhdGEudmFsaWRUaWNrQ291bnQgPSBmcm9tRGF0YS50aWNrQ291bnQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEluc3RhbGwgY2hhcnRzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy51c2VyRGF0YSB1c2VyIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuYmFzZURhdGEgY2hhcnQgYmFzZSBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIGNoYXJ0IHRoZW1lXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqICAgICAgQHBhcmFtIHt7eUF4aXM6IG9iamVjdCwgeEF4aXM6IG9iamVjdH19IHBhcmFtcy5iYXNlQXhlc0RhdGEgYmFzZSBheGVzIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuYXhlc0RhdGEgYXhlcyBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBwYXJhbXMuc2VyaWVzQ2hhcnRUeXBlcyBzZXJpZXMgY2hhcnQgdHlwZXNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IHBhcmFtcy5jaGFydFR5cGVzIGNoYXJ0IHR5cGVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaW5zdGFsbENoYXJ0czogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBjaGFydENsYXNzZXMgPSB7XG4gICAgICAgICAgICAgICAgY29sdW1uOiBDb2x1bW5DaGFydCxcbiAgICAgICAgICAgICAgICBsaW5lOiBMaW5lQ2hhcnRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBiYXNlRGF0YSA9IHBhcmFtcy5iYXNlRGF0YSxcbiAgICAgICAgICAgIGNvbnZlcnREYXRhID0gYmFzZURhdGEuY29udmVydERhdGEsXG4gICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXMgPSBjb252ZXJ0RGF0YS5mb3JtYXR0ZWRWYWx1ZXMsXG4gICAgICAgICAgICBiYXNlQXhlc0RhdGEgPSBwYXJhbXMuYmFzZUF4ZXNEYXRhLFxuICAgICAgICAgICAgY2hhcnRUeXBlcyA9IHBhcmFtcy5jaGFydFR5cGVzLFxuICAgICAgICAgICAgc2VyaWVzQ2hhcnRUeXBlcyA9IHBhcmFtcy5zZXJpZXNDaGFydFR5cGVzLFxuICAgICAgICAgICAgb3JkZXJJbmZvID0gdGhpcy5fbWFrZUNoYXJ0VHlwZU9yZGVySW5mbyhjaGFydFR5cGVzKSxcbiAgICAgICAgICAgIHJlbWFrZU9wdGlvbnMgPSB0aGlzLl9tYWtlT3B0aW9uc01hcChjaGFydFR5cGVzLCBwYXJhbXMub3B0aW9ucywgb3JkZXJJbmZvKSxcbiAgICAgICAgICAgIHJlbWFrZVRoZW1lID0gdGhpcy5fbWFrZVRoZW1lTWFwKHNlcmllc0NoYXJ0VHlwZXMsIHBhcmFtcy50aGVtZSwgY29udmVydERhdGEubGVnZW5kTGFiZWxzKSxcbiAgICAgICAgICAgIHBsb3REYXRhID0ge1xuICAgICAgICAgICAgICAgIHZUaWNrQ291bnQ6IGJhc2VBeGVzRGF0YS55QXhpcy52YWxpZFRpY2tDb3VudCxcbiAgICAgICAgICAgICAgICBoVGlja0NvdW50OiBiYXNlQXhlc0RhdGEueEF4aXMudmFsaWRUaWNrQ291bnRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBqb2luTGVnZW5kTGFiZWxzID0gY29udmVydERhdGEuam9pbkxlZ2VuZExhYmVscztcblxuICAgICAgICB0aGlzLmNoYXJ0cyA9IG5lLnV0aWwubWFwKHNlcmllc0NoYXJ0VHlwZXMsIGZ1bmN0aW9uKGNoYXJ0VHlwZSkge1xuICAgICAgICAgICAgdmFyIGxlZ2VuZExhYmVscyA9IGNvbnZlcnREYXRhLmxlZ2VuZExhYmVsc1tjaGFydFR5cGVdLFxuICAgICAgICAgICAgICAgIGF4ZXMgPSBwYXJhbXMuYXhlc0RhdGFbY2hhcnRUeXBlXSxcbiAgICAgICAgICAgICAgICBzZW5kT3B0aW9ucyA9IHJlbWFrZU9wdGlvbnNbY2hhcnRUeXBlXSxcbiAgICAgICAgICAgICAgICBzZW5kVGhlbWUgPSByZW1ha2VUaGVtZVtjaGFydFR5cGVdLFxuICAgICAgICAgICAgICAgIHNlbmRCb3VuZHMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGJhc2VEYXRhLmJvdW5kcykpLFxuICAgICAgICAgICAgICAgIGNoYXJ0O1xuXG4gICAgICAgICAgICBpZiAoYXhlcyAmJiBheGVzLnlBeGlzLmlzUG9zaXRpb25SaWdodCkge1xuICAgICAgICAgICAgICAgIHNlbmRCb3VuZHMueUF4aXMgPSBzZW5kQm91bmRzLnlyQXhpcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNoYXJ0ID0gbmV3IGNoYXJ0Q2xhc3Nlc1tjaGFydFR5cGVdKHBhcmFtcy51c2VyRGF0YSwgc2VuZFRoZW1lLCBzZW5kT3B0aW9ucywge1xuICAgICAgICAgICAgICAgIGNvbnZlcnREYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlczogY29udmVydERhdGEudmFsdWVzW2NoYXJ0VHlwZV0sXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsczogY29udmVydERhdGEubGFiZWxzLFxuICAgICAgICAgICAgICAgICAgICBmb3JtYXRGdW5jdGlvbnM6IGNvbnZlcnREYXRhLmZvcm1hdEZ1bmN0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgZm9ybWF0dGVkVmFsdWVzOiBmb3JtYXR0ZWRWYWx1ZXNbY2hhcnRUeXBlXSxcbiAgICAgICAgICAgICAgICAgICAgbGVnZW5kTGFiZWxzOiBsZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICAgICAgICAgIGpvaW5MZWdlbmRMYWJlbHM6IGpvaW5MZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICAgICAgICAgIHBsb3REYXRhOiBwbG90RGF0YVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgYm91bmRzOiBzZW5kQm91bmRzLFxuICAgICAgICAgICAgICAgIGF4ZXM6IGF4ZXMsXG4gICAgICAgICAgICAgICAgcHJlZml4OiBjaGFydFR5cGUgKyAnLSdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcGxvdERhdGEgPSBudWxsO1xuICAgICAgICAgICAgam9pbkxlZ2VuZExhYmVscyA9IG51bGw7XG4gICAgICAgICAgICByZXR1cm4gY2hhcnQ7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgY29tYm8gY2hhcnQuXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSBjb21ibyBjaGFydCBlbGVtZW50XG4gICAgICovXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGVsID0gQ2hhcnRCYXNlLnByb3RvdHlwZS5yZW5kZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgdmFyIHBhcGVyO1xuICAgICAgICBuZS51dGlsLmZvckVhY2hBcnJheSh0aGlzLmNoYXJ0cywgZnVuY3Rpb24oY2hhcnQpIHtcbiAgICAgICAgICAgIGNoYXJ0LnJlbmRlcihlbCwgcGFwZXIpO1xuICAgICAgICAgICAgaWYgKCFwYXBlcikge1xuICAgICAgICAgICAgICAgIHBhcGVyID0gY2hhcnQuZ2V0UGFwZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb21ib0NoYXJ0O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IExpbmUgY2hhcnRcbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIEF4aXNUeXBlQmFzZSA9IHJlcXVpcmUoJy4vYXhpc1R5cGVCYXNlLmpzJyksXG4gICAgY2FsY3VsYXRvciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvY2FsY3VsYXRvci5qcycpLFxuICAgIGF4aXNEYXRhTWFrZXIgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2F4aXNEYXRhTWFrZXIuanMnKSxcbiAgICBTZXJpZXMgPSByZXF1aXJlKCcuLi9zZXJpZXMvbGluZUNoYXJ0U2VyaWVzLmpzJyk7XG5cbnZhciBMaW5lQ2hhcnQgPSBuZS51dGlsLmRlZmluZUNsYXNzKEF4aXNUeXBlQmFzZSwgLyoqIEBsZW5kcyBMaW5lQ2hhcnQucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBMaW5lIGNoYXJ0LlxuICAgICAqIEBjb25zdHJ1Y3RzIExpbmVDaGFydFxuICAgICAqIEBleHRlbmRzIEF4aXNUeXBlQmFzZVxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gdXNlckRhdGEgY2hhcnQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBjaGFydCB0aGVtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gaW5pdGVkRGF0YSBpbml0aWFsaXplZCBkYXRhIGZyb20gY29tYm8gY2hhcnRcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbih1c2VyRGF0YSwgdGhlbWUsIG9wdGlvbnMsIGluaXRlZERhdGEpIHtcbiAgICAgICAgdmFyIGJhc2VEYXRhID0gaW5pdGVkRGF0YSB8fCB0aGlzLm1ha2VCYXNlRGF0YSh1c2VyRGF0YSwgdGhlbWUsIG9wdGlvbnMsIHtcbiAgICAgICAgICAgICAgICBpc1ZlcnRpY2FsOiB0cnVlLFxuICAgICAgICAgICAgICAgIGhhc0F4ZXM6IHRydWVcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgY29udmVydERhdGEgPSBiYXNlRGF0YS5jb252ZXJ0RGF0YSxcbiAgICAgICAgICAgIGJvdW5kcyA9IGJhc2VEYXRhLmJvdW5kcyxcbiAgICAgICAgICAgIGF4aXNEYXRhO1xuXG4gICAgICAgIHRoaXMuY2xhc3NOYW1lID0gJ25lLWxpbmUtY2hhcnQnO1xuXG4gICAgICAgIEF4aXNUeXBlQmFzZS5jYWxsKHRoaXMsIGJvdW5kcywgdGhlbWUsIG9wdGlvbnMsIGluaXRlZERhdGEpO1xuXG4gICAgICAgIGF4aXNEYXRhID0gdGhpcy5fbWFrZUF4ZXNEYXRhKGNvbnZlcnREYXRhLCBib3VuZHMsIG9wdGlvbnMsIGluaXRlZERhdGEpO1xuICAgICAgICB0aGlzLl9hZGRDb21wb25lbnRzKGNvbnZlcnREYXRhLCBheGlzRGF0YSwgb3B0aW9ucyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYXhlcyBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGNvbnZlcnREYXRhIGNvbnZlcnRlZCBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGJvdW5kcyBjaGFydCBib3VuZHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGluaXRlZERhdGEgaW5pdGlhbGl6ZWQgZGF0YSBmcm9tIGNvbWJvIGNoYXJ0XG4gICAgICogQHJldHVybnMge29iamVjdH0gYXhlcyBkYXRhXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUF4ZXNEYXRhOiBmdW5jdGlvbihjb252ZXJ0RGF0YSwgYm91bmRzLCBvcHRpb25zLCBpbml0ZWREYXRhKSB7XG4gICAgICAgIHZhciBheGVzRGF0YSA9IHt9O1xuICAgICAgICBpZiAoaW5pdGVkRGF0YSkge1xuICAgICAgICAgICAgYXhlc0RhdGEgPSBpbml0ZWREYXRhLmF4ZXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBheGVzRGF0YSA9IHtcbiAgICAgICAgICAgICAgICB5QXhpczogYXhpc0RhdGFNYWtlci5tYWtlVmFsdWVBeGlzRGF0YSh7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlczogY29udmVydERhdGEudmFsdWVzLFxuICAgICAgICAgICAgICAgICAgICBzZXJpZXNEaW1lbnNpb246IGJvdW5kcy5zZXJpZXMuZGltZW5zaW9uLFxuICAgICAgICAgICAgICAgICAgICBzdGFja2VkOiBvcHRpb25zLnNlcmllcyAmJiBvcHRpb25zLnNlcmllcy5zdGFja2VkIHx8ICcnLFxuICAgICAgICAgICAgICAgICAgICBjaGFydFR5cGU6IG9wdGlvbnMuY2hhcnRUeXBlLFxuICAgICAgICAgICAgICAgICAgICBmb3JtYXRGdW5jdGlvbnM6IGNvbnZlcnREYXRhLmZvcm1hdEZ1bmN0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogb3B0aW9ucy55QXhpcyxcbiAgICAgICAgICAgICAgICAgICAgaXNWZXJ0aWNhbDogdHJ1ZVxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIHhBeGlzOiBheGlzRGF0YU1ha2VyLm1ha2VMYWJlbEF4aXNEYXRhKHtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxzOiBjb252ZXJ0RGF0YS5sYWJlbHNcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXhlc0RhdGE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZCBjb21wb25lbnRzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGNvbnZlcnREYXRhIGNvbnZlcnRlZCBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGF4ZXNEYXRhIGF4ZXMgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hZGRDb21wb25lbnRzOiBmdW5jdGlvbihjb252ZXJ0RGF0YSwgYXhlc0RhdGEsIG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5hZGRBeGlzQ29tcG9uZW50cyh7XG4gICAgICAgICAgICBjb252ZXJ0RGF0YTogY29udmVydERhdGEsXG4gICAgICAgICAgICBheGVzOiBheGVzRGF0YSxcbiAgICAgICAgICAgIHBsb3REYXRhOiAhbmUudXRpbC5pc1VuZGVmaW5lZChjb252ZXJ0RGF0YS5wbG90RGF0YSkgPyBjb252ZXJ0RGF0YS5wbG90RGF0YSA6IHtcbiAgICAgICAgICAgICAgICB2VGlja0NvdW50OiBheGVzRGF0YS55QXhpcy52YWxpZFRpY2tDb3VudCxcbiAgICAgICAgICAgICAgICBoVGlja0NvdW50OiBheGVzRGF0YS54QXhpcy52YWxpZFRpY2tDb3VudFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNoYXJ0VHlwZTogb3B0aW9ucy5jaGFydFR5cGVcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5hZGRDb21wb25lbnQoJ3NlcmllcycsIFNlcmllcywge1xuICAgICAgICAgICAgbGliVHlwZTogb3B0aW9ucy5saWJUeXBlLFxuICAgICAgICAgICAgY2hhcnRUeXBlOiBvcHRpb25zLmNoYXJ0VHlwZSxcbiAgICAgICAgICAgIHRvb2x0aXBQcmVmaXg6IHRoaXMudG9vbHRpcFByZWZpeCxcbiAgICAgICAgICAgIGlzUG9pbnRQb3NpdGlvbjogdHJ1ZSxcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICB2YWx1ZXM6IGNhbGN1bGF0b3IuYXJyYXlQaXZvdChjb252ZXJ0RGF0YS52YWx1ZXMpLFxuICAgICAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlczogY2FsY3VsYXRvci5hcnJheVBpdm90KGNvbnZlcnREYXRhLmZvcm1hdHRlZFZhbHVlcyksXG4gICAgICAgICAgICAgICAgc2NhbGU6IGF4ZXNEYXRhLnlBeGlzLnNjYWxlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IExpbmVDaGFydDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBQaWUgY2hhcnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBDaGFydEJhc2UgPSByZXF1aXJlKCcuL2NoYXJ0QmFzZS5qcycpLFxuICAgIExlZ2VuZCA9IHJlcXVpcmUoJy4uL2xlZ2VuZHMvbGVnZW5kLmpzJyksXG4gICAgVG9vbHRpcCA9IHJlcXVpcmUoJy4uL3Rvb2x0aXBzL3Rvb2x0aXAuanMnKSxcbiAgICBTZXJpZXMgPSByZXF1aXJlKCcuLi9zZXJpZXMvcGllQ2hhcnRTZXJpZXMuanMnKTtcblxudmFyIFBpZUNoYXJ0ID0gbmUudXRpbC5kZWZpbmVDbGFzcyhDaGFydEJhc2UsIC8qKiBAbGVuZHMgUGllQ2hhcnQucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBDb2x1bW4gY2hhcnQuXG4gICAgICogQGNvbnN0cnVjdHMgUGllQ2hhcnRcbiAgICAgKiBAZXh0ZW5kcyBDaGFydEJhc2VcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheT59IHVzZXJEYXRhIGNoYXJ0IGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgY2hhcnQgdGhlbWVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGluaXRlZERhdGEgaW5pdGlhbGl6ZWQgZGF0YSBmcm9tIGNvbWJvIGNoYXJ0XG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24odXNlckRhdGEsIHRoZW1lLCBvcHRpb25zLCBpbml0ZWREYXRhKSB7XG4gICAgICAgIHZhciBiYXNlRGF0YSA9IGluaXRlZERhdGEgfHwgdGhpcy5tYWtlQmFzZURhdGEodXNlckRhdGEsIHRoZW1lLCBvcHRpb25zKSxcbiAgICAgICAgICAgIGNvbnZlcnREYXRhID0gYmFzZURhdGEuY29udmVydERhdGEsXG4gICAgICAgICAgICBib3VuZHMgPSBiYXNlRGF0YS5ib3VuZHM7XG5cbiAgICAgICAgdGhpcy5jbGFzc05hbWUgPSAnbmUtcGllLWNoYXJ0JztcblxuICAgICAgICBvcHRpb25zLnRvb2x0aXAgPSBvcHRpb25zLnRvb2x0aXAgfHwge307XG5cbiAgICAgICAgaWYgKCFvcHRpb25zLnRvb2x0aXAucG9zaXRpb24pIHtcbiAgICAgICAgICAgIG9wdGlvbnMudG9vbHRpcC5wb3NpdGlvbiA9ICdjZW50ZXIgbWlkZGxlJztcbiAgICAgICAgfVxuXG4gICAgICAgIENoYXJ0QmFzZS5jYWxsKHRoaXMsIGJvdW5kcywgdGhlbWUsIG9wdGlvbnMsIGluaXRlZERhdGEpO1xuXG4gICAgICAgIHRoaXMuX2FkZENvbXBvbmVudHMoY29udmVydERhdGEsIHRoZW1lLmNoYXJ0LmJhY2tncm91bmQsIG9wdGlvbnMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgY29tcG9uZW50c1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb252ZXJ0RGF0YSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjaGFydEJhY2tncm91bmQgY2hhcnQg44WgYWNrZ3JvdW5kXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2FkZENvbXBvbmVudHM6IGZ1bmN0aW9uKGNvbnZlcnREYXRhLCBjaGFydEJhY2tncm91bmQsIG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKGNvbnZlcnREYXRhLmpvaW5MZWdlbmRMYWJlbHMpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KCdsZWdlbmQnLCBMZWdlbmQsIHtcbiAgICAgICAgICAgICAgICBqb2luTGVnZW5kTGFiZWxzOiBjb252ZXJ0RGF0YS5qb2luTGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgICAgIGxlZ2VuZExhYmVsczogY29udmVydERhdGEubGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgICAgIGNoYXJ0VHlwZTogb3B0aW9ucy5jaGFydFR5cGVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5hZGRDb21wb25lbnQoJ3Rvb2x0aXAnLCBUb29sdGlwLCB7XG4gICAgICAgICAgICB2YWx1ZXM6IGNvbnZlcnREYXRhLmZvcm1hdHRlZFZhbHVlcyxcbiAgICAgICAgICAgIGxhYmVsczogY29udmVydERhdGEubGFiZWxzLFxuICAgICAgICAgICAgbGVnZW5kTGFiZWxzOiBjb252ZXJ0RGF0YS5sZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICBwcmVmaXg6IHRoaXMudG9vbHRpcFByZWZpeFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmFkZENvbXBvbmVudCgnc2VyaWVzJywgU2VyaWVzLCB7XG4gICAgICAgICAgICBsaWJUeXBlOiBvcHRpb25zLmxpYlR5cGUsXG4gICAgICAgICAgICBjaGFydFR5cGU6IG9wdGlvbnMuY2hhcnRUeXBlLFxuICAgICAgICAgICAgdG9vbHRpcFByZWZpeDogdGhpcy50b29sdGlwUHJlZml4LFxuICAgICAgICAgICAgaXNQb2ludFBvc2l0aW9uOiB0cnVlLFxuICAgICAgICAgICAgY2hhcnRCYWNrZ3JvdW5kOiBjaGFydEJhY2tncm91bmQsXG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgdmFsdWVzOiBjb252ZXJ0RGF0YS52YWx1ZXMsXG4gICAgICAgICAgICAgICAgZm9ybWF0dGVkVmFsdWVzOiBjb252ZXJ0RGF0YS5mb3JtYXR0ZWRWYWx1ZXNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUGllQ2hhcnQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogbmUudXRpbOyXkCByYW5nZeqwgCDstpTqsIDrkJjquLAg7KCE6rmM7KeAIOyehOyLnOuhnCDsgqzsmqlcbiAqIEBwYXJhbSB7bnVtYmVyfSBzdGFydCBzdGFydFxuICogQHBhcmFtIHtudW1iZXJ9IHN0b3Agc3RvcFxuICogQHBhcmFtIHtudW1iZXJ9IHN0ZXAgc3RlcFxuICogQHJldHVybnMge2FycmF5LjxudW1iZXI+fSByZXN1bHQgYXJyYXlcbiAqL1xudmFyIHJhbmdlID0gZnVuY3Rpb24oc3RhcnQsIHN0b3AsIHN0ZXApIHtcbiAgICB2YXIgYXJyID0gW10sXG4gICAgICAgIGZsYWc7XG5cbiAgICBpZiAobmUudXRpbC5pc1VuZGVmaW5lZChzdG9wKSkge1xuICAgICAgICBzdG9wID0gc3RhcnQgfHwgMDtcbiAgICAgICAgc3RhcnQgPSAwO1xuICAgIH1cblxuICAgIHN0ZXAgPSBzdGVwIHx8IDE7XG4gICAgZmxhZyA9IHN0ZXAgPCAwID8gLTEgOiAxO1xuICAgIHN0b3AgKj0gZmxhZztcblxuICAgIHdoaWxlIChzdGFydCAqIGZsYWcgPCBzdG9wKSB7XG4gICAgICAgIGFyci5wdXNoKHN0YXJ0KTtcbiAgICAgICAgc3RhcnQgKz0gc3RlcDtcbiAgICB9XG5cbiAgICByZXR1cm4gYXJyO1xufTtcblxuLyoqXG4gKiAqIG5lLnV0aWzsl5AgcGx1Y2vsnbQg7LaU6rCA65CY6riwIOyghOq5jOyngCDsnoTsi5zroZwg7IKs7JqpXG4gKiBAcGFyYW0ge2FycmF5fSBhcnIgYXJyYXlcbiAqIEBwYXJhbSB7c3RyaW5nfSBwcm9wZXJ0eSBwcm9wZXJ0eVxuICogQHJldHVybnMge2FycmF5fSByZXN1bHQgYXJyYXlcbiAqL1xudmFyIHBsdWNrID0gZnVuY3Rpb24oYXJyLCBwcm9wZXJ0eSkge1xuICAgIHZhciByZXN1bHQgPSBuZS51dGlsLm1hcChhcnIsIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuIGl0ZW1bcHJvcGVydHldO1xuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqICogbmUudXRpbOyXkCB6aXDsnbQg7LaU6rCA65CY6riwIOyghOq5jOyngCDsnoTsi5zroZwg7IKs7JqpXG4gKiBAcGFyYW1zIHsuLi5hcnJheX0gYXJyYXlcbiAqIEByZXR1cm5zIHthcnJheX0gcmVzdWx0IGFycmF5XG4gKi9cbnZhciB6aXAgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJyMiA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyksXG4gICAgICAgIHJlc3VsdCA9IFtdO1xuXG4gICAgbmUudXRpbC5mb3JFYWNoKGFycjIsIGZ1bmN0aW9uKGFycikge1xuICAgICAgICBuZS51dGlsLmZvckVhY2goYXJyLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgICAgIGlmICghcmVzdWx0W2luZGV4XSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdFtpbmRleF0gPSBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdFtpbmRleF0ucHVzaCh2YWx1ZSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogUGljayBtaW5pbXVtIHZhbHVlIGZyb20gdmFsdWUgYXJyYXkuXG4gKiBAcGFyYW0ge2FycmF5fSBhcnIgdmFsdWUgYXJyYXlcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNvbmRpdGlvbiBjb25kaXRpb24gZnVuY3Rpb25cbiAqIEBwYXJhbSB7b2JqZWN0fSBjb250ZXh0IHRhcmdldCBjb250ZXh0XG4gKiBAcmV0dXJucyB7Kn0gbWluaW11bSB2YWx1ZVxuICovXG52YXIgbWluID0gZnVuY3Rpb24oYXJyLCBjb25kaXRpb24sIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0LCBtaW5WYWx1ZSwgcmVzdDtcbiAgICBpZiAoIWNvbmRpdGlvbikge1xuICAgICAgICBjb25kaXRpb24gPSBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgcmVzdWx0ID0gYXJyWzBdO1xuICAgIG1pblZhbHVlID0gY29uZGl0aW9uLmNhbGwoY29udGV4dCwgcmVzdWx0KTtcbiAgICByZXN0ID0gYXJyLnNsaWNlKDEpO1xuICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KHJlc3QsIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgdmFyIGNvbXBhcmVWYWx1ZSA9IGNvbmRpdGlvbi5jYWxsKGNvbnRleHQsIGl0ZW0pO1xuICAgICAgICBpZiAoY29tcGFyZVZhbHVlIDwgbWluVmFsdWUpIHtcbiAgICAgICAgICAgIG1pblZhbHVlID0gY29tcGFyZVZhbHVlO1xuICAgICAgICAgICAgcmVzdWx0ID0gaXRlbTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIFBpY2sgbWF4aW11bSB2YWx1ZSBmcm9tIHZhbHVlIGFycmF5LlxuICogQHBhcmFtIHthcnJheX0gYXJyIHZhbHVlIGFycmF5XG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjb25kaXRpb24gY29uZGl0aW9uIGZ1bmN0aW9uXG4gKiBAcGFyYW0ge29iamVjdH0gY29udGV4dCB0YXJnZXQgY29udGV4dFxuICogQHJldHVybnMgeyp9IG1heGltdW0gdmFsdWVcbiAqL1xudmFyIG1heCA9IGZ1bmN0aW9uKGFyciwgY29uZGl0aW9uLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdCwgbWF4VmFsdWUsIHJlc3Q7XG4gICAgaWYgKCFjb25kaXRpb24pIHtcbiAgICAgICAgY29uZGl0aW9uID0gZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgIH07XG4gICAgfVxuICAgIHJlc3VsdCA9IGFyclswXTtcbiAgICBtYXhWYWx1ZSA9IGNvbmRpdGlvbi5jYWxsKGNvbnRleHQsIHJlc3VsdCk7XG4gICAgcmVzdCA9IGFyci5zbGljZSgxKTtcbiAgICBuZS51dGlsLmZvckVhY2hBcnJheShyZXN0LCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIHZhciBjb21wYXJlVmFsdWUgPSBjb25kaXRpb24uY2FsbChjb250ZXh0LCBpdGVtKTtcbiAgICAgICAgaWYgKGNvbXBhcmVWYWx1ZSA+IG1heFZhbHVlKSB7XG4gICAgICAgICAgICBtYXhWYWx1ZSA9IGNvbXBhcmVWYWx1ZTtcbiAgICAgICAgICAgIHJlc3VsdCA9IGl0ZW07XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBXaGV0aGVyIG9uZSBvZiB0aGVtIGlzIHRydWUgb3Igbm90LlxuICogQHBhcmFtIHthcnJheX0gYXJyIHRhcmdldCBhcnJheVxuICogQHBhcmFtIHtmdW5jdGlvbn0gY29uZGl0aW9uIGNvbmRpdGlvbiBmdW5jdGlvblxuICogQHJldHVybnMge2Jvb2xlYW59IHJlc3VsdCBib29sZWFuXG4gKi9cbnZhciBhbnkgPSBmdW5jdGlvbihhcnIsIGNvbmRpdGlvbikge1xuICAgIHZhciByZXN1bHQgPSBmYWxzZTtcbiAgICBuZS51dGlsLmZvckVhY2hBcnJheShhcnIsIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgaWYgKGNvbmRpdGlvbihpdGVtKSkge1xuICAgICAgICAgICAgcmVzdWx0ID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIEdldCBhZnRlciBwb2ludCBsZW5ndGguXG4gKiBAcGFyYW0ge3N0cmluZyB8IG51bWJlcn0gdmFsdWUgdGFyZ2V0IHZhbHVlXG4gKiBAcmV0dXJucyB7bnVtYmVyfSByZXN1bHQgbGVuZ3RoXG4gKi9cbnZhciBsZW5ndGhBZnRlclBvaW50ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICB2YXIgdmFsdWVBcnIgPSAodmFsdWUgKyAnJykuc3BsaXQoJy4nKTtcbiAgICByZXR1cm4gdmFsdWVBcnIubGVuZ3RoID09PSAyID8gdmFsdWVBcnJbMV0ubGVuZ3RoIDogMDtcbn07XG5cbi8qKlxuICogRmluZCBtdWx0aXBsZSBudW0uXG4gKiBAcGFyYW0gey4uLmFycmF5fSB0YXJnZXQgdmFsdWVzXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBtdWx0aXBsZSBudW1cbiAqL1xudmFyIGZpbmRNdWx0aXBsZU51bSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMpLFxuICAgICAgICB1bmRlclBvaW50TGVucyA9IG5lLnV0aWwubWFwKGFyZ3MsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gbmUudXRpbC5sZW5ndGhBZnRlclBvaW50KHZhbHVlKTtcbiAgICAgICAgfSksXG4gICAgICAgIHVuZGVyUG9pbnRMZW4gPSBuZS51dGlsLm1heCh1bmRlclBvaW50TGVucyksXG4gICAgICAgIG11bHRpcGxlTnVtID0gTWF0aC5wb3coMTAsIHVuZGVyUG9pbnRMZW4pO1xuICAgIHJldHVybiBtdWx0aXBsZU51bTtcbn07XG5cbi8qKlxuICogTW9kdWxvIG9wZXJhdGlvbiBmb3IgZmxvYXRpbmcgcG9pbnQgb3BlcmF0aW9uLlxuICogQHBhcmFtIHtudW1iZXJ9IHRhcmdldCB0YXJnZXQgdmFsdWVzXG4gKiBAcGFyYW0ge251bWJlcn0gbW9kTnVtIG1vZCBudW1cbiAqIEByZXR1cm5zIHtudW1iZXJ9IHJlc3VsdCBtb2RcbiAqL1xudmFyIG1vZCA9IGZ1bmN0aW9uKHRhcmdldCwgbW9kTnVtKSB7XG4gICAgdmFyIG11bHRpcGxlTnVtID0gbmUudXRpbC5maW5kTXVsdGlwbGVOdW0obW9kTnVtKTtcbiAgICByZXR1cm4gKCh0YXJnZXQgKiBtdWx0aXBsZU51bSkgJSAobW9kTnVtICogbXVsdGlwbGVOdW0pKSAvIG11bHRpcGxlTnVtO1xufTtcblxuLyoqXG4gKiBBZGRpdGlvbiBmb3IgZmxvYXRpbmcgcG9pbnQgb3BlcmF0aW9uLlxuICogQHBhcmFtIHtudW1iZXJ9IGEgdGFyZ2V0IGFcbiAqIEBwYXJhbSB7bnVtYmVyfSBiIHRhcmdldCBiXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBhZGRpdGlvbiByZXN1bHRcbiAqL1xudmFyIGFkZGl0aW9uID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHZhciBtdWx0aXBsZU51bSA9IGZpbmRNdWx0aXBsZU51bShhLCBiKTtcbiAgICByZXR1cm4gKChhICogbXVsdGlwbGVOdW0pICsgKGIgKiBtdWx0aXBsZU51bSkpIC8gbXVsdGlwbGVOdW07XG59O1xuXG4vKipcbiAqIFN1YnRyYWN0aW9uIGZvciBmbG9hdGluZyBwb2ludCBvcGVyYXRpb24uXG4gKiBAcGFyYW0ge251bWJlcn0gYSB0YXJnZXQgYVxuICogQHBhcmFtIHtudW1iZXJ9IGIgdGFyZ2V0IGJcbiAqIEByZXR1cm5zIHtudW1iZXJ9IHN1YnRyYWN0aW9uIHJlc3VsdFxuICovXG52YXIgc3VidHJhY3Rpb24gPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgdmFyIG11bHRpcGxlTnVtID0gZmluZE11bHRpcGxlTnVtKGEsIGIpO1xuICAgIHJldHVybiAoKGEgKiBtdWx0aXBsZU51bSkgLSAoYiAqIG11bHRpcGxlTnVtKSkgLyBtdWx0aXBsZU51bTtcbn07XG5cbi8qKlxuICogTXVsdGlwbGljYXRpb24gZm9yIGZsb2F0aW5nIHBvaW50IG9wZXJhdGlvbi5cbiAqIEBwYXJhbSB7bnVtYmVyfSBhIHRhcmdldCBhXG4gKiBAcGFyYW0ge251bWJlcn0gYiB0YXJnZXQgYlxuICogQHJldHVybnMge251bWJlcn0gbXVsdGlwbGljYXRpb24gcmVzdWx0XG4gKi9cbnZhciBtdWx0aXBsaWNhdGlvbiA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICB2YXIgbXVsdGlwbGVOdW0gPSBmaW5kTXVsdGlwbGVOdW0oYSwgYik7XG4gICAgcmV0dXJuICgoYSAqIG11bHRpcGxlTnVtKSAqIChiICogbXVsdGlwbGVOdW0pKSAvIChtdWx0aXBsZU51bSAqIG11bHRpcGxlTnVtKTtcbn07XG5cbi8qKlxuICogRGl2aXNpb24gZm9yIGZsb2F0aW5nIHBvaW50IG9wZXJhdGlvbi5cbiAqIEBwYXJhbSB7bnVtYmVyfSBhIHRhcmdldCBhXG4gKiBAcGFyYW0ge251bWJlcn0gYiB0YXJnZXQgYlxuICogQHJldHVybnMge251bWJlcn0gZGl2aXNpb24gcmVzdWx0XG4gKi9cbnZhciBkaXZpc2lvbiA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICB2YXIgbXVsdGlwbGVOdW0gPSBmaW5kTXVsdGlwbGVOdW0oYSwgYik7XG4gICAgcmV0dXJuIChhICogbXVsdGlwbGVOdW0pIC8gKGIgKiBtdWx0aXBsZU51bSk7XG59O1xuXG4vKipcbiAqIFN1bS5cbiAqIEBwYXJhbSB7YXJyYXkuPG51bWJlcj59IHZhbHVlcyB0YXJnZXQgdmFsdWVzXG4gKiBAcmV0dXJucyB7bnVtYmVyfSByZXN1bHQgdmFsdWVcbiAqL1xudmFyIHN1bSA9IGZ1bmN0aW9uKHZhbHVlcykge1xuICAgIHZhciBjb3B5QXJyID0gdmFsdWVzLnNsaWNlKCk7XG4gICAgY29weUFyci51bnNoaWZ0KDApO1xuICAgIHJldHVybiBuZS51dGlsLnJlZHVjZShjb3B5QXJyLCBmdW5jdGlvbihiYXNlLCBhZGQpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoYmFzZSkgKyBwYXJzZUZsb2F0KGFkZCk7XG4gICAgfSk7XG59O1xuXG5uZS51dGlsLnJhbmdlID0gcmFuZ2U7XG5uZS51dGlsLnBsdWNrID0gcGx1Y2s7XG5uZS51dGlsLnppcCA9IHppcDtcbm5lLnV0aWwubWluID0gbWluO1xubmUudXRpbC5tYXggPSBtYXg7XG5uZS51dGlsLmFueSA9IGFueTtcbm5lLnV0aWwubGVuZ3RoQWZ0ZXJQb2ludCA9IGxlbmd0aEFmdGVyUG9pbnQ7XG5uZS51dGlsLm1vZCA9IG1vZDtcbm5lLnV0aWwuZmluZE11bHRpcGxlTnVtID0gZmluZE11bHRpcGxlTnVtO1xubmUudXRpbC5hZGRpdGlvbiA9IGFkZGl0aW9uO1xubmUudXRpbC5zdWJ0cmFjdGlvbiA9IHN1YnRyYWN0aW9uO1xubmUudXRpbC5tdWx0aXBsaWNhdGlvbiA9IG11bHRpcGxpY2F0aW9uO1xubmUudXRpbC5kaXZpc2lvbiA9IGRpdmlzaW9uO1xubmUudXRpbC5zdW0gPSBzdW07XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgY2hhcnQgY29uc3RcbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIENIQVJUX0RFRkFVTFRfV0lEVEg6IDUwMCxcbiAgICBDSEFSVF9ERUZBVUxUX0hFSUdIVDogNDAwLFxuICAgIEhJRERFTl9XSURUSDogMSxcbiAgICBERUZBVUxUX1RJVExFX0ZPTlRfU0laRTogMTQsXG4gICAgREVGQVVMVF9BWElTX1RJVExFX0ZPTlRfU0laRTogMTAsXG4gICAgREVGQVVMVF9MQUJFTF9GT05UX1NJWkU6IDEyLFxuICAgIERFRkFVTFRfUExVR0lOOiAncmFwaGFlbCcsXG4gICAgREVGQVVMVF9USUNLX0NPTE9SOiAnYmxhY2snLFxuICAgIERFRkFVTFRfVEhFTUVfTkFNRTogJ2RlZmF1bHQnLFxuICAgIFNUQUNLRURfTk9STUFMX1RZUEU6ICdub3JtYWwnLFxuICAgIFNUQUNLRURfUEVSQ0VOVF9UWVBFOiAncGVyY2VudCcsXG4gICAgQ0hBUlRfVFlQRV9CQVI6ICdiYXInLFxuICAgIENIQVJUX1RZUEVfQ09MVU1OOiAnY29sdW1uJyxcbiAgICBDSEFSVF9UWVBFX0xJTkU6ICdsaW5lJyxcbiAgICBDSEFSVF9UWVBFX0NPTUJPOiAnY29tYm8nLFxuICAgIENIQVJUX1RZUEVfUElFOiAncGllJyxcbiAgICBZQVhJU19QUk9QUzogWyd0aWNrQ29sb3InLCAndGl0bGUnLCAnbGFiZWwnXSxcbiAgICBTRVJJRVNfUFJPUFM6IFsnY29sb3JzJywgJ2JvcmRlckNvbG9yJywgJ3NpbmdsZUNvbG9ycyddXG59O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3ICBDaGFydCBmYWN0b3J5IHBsYXkgcm9sZSByZWdpc3RlciBjaGFydC5cbiAqICAgICAgICAgICAgICAgIEFsc28sIHlvdSBjYW4gZ2V0IGNoYXJ0IGZyb20gdGhpcyBmYWN0b3J5LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2hhcnRzID0ge30sXG4gICAgZmFjdG9yeSA9IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdldCBjaGFydCBpbnN0YW5jZS5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNoYXJ0VHlwZSBjaGFydCB0eXBlXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhIGNoYXJ0IGRhdGFcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBjaGFydCBpbnN0YW5jZTtcbiAgICAgICAgICovXG4gICAgICAgIGdldDogZnVuY3Rpb24oY2hhcnRUeXBlLCBkYXRhLCB0aGVtZSwgb3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIENoYXJ0ID0gY2hhcnRzW2NoYXJ0VHlwZV0sXG4gICAgICAgICAgICAgICAgY2hhcnQ7XG5cbiAgICAgICAgICAgIGlmICghQ2hhcnQpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBleGlzdCAnICsgY2hhcnRUeXBlICsgJyBjaGFydC4nKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2hhcnQgPSBuZXcgQ2hhcnQoZGF0YSwgdGhlbWUsIG9wdGlvbnMpO1xuXG4gICAgICAgICAgICByZXR1cm4gY2hhcnQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlZ2lzdGVyIGNoYXJ0LlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY2hhcnRUeXBlIGNoYXIgdHlwZVxuICAgICAgICAgKiBAcGFyYW0ge2NsYXNzfSBDaGFydENsYXNzIGNoYXJ0IGNsYXNzXG4gICAgICAgICAqL1xuICAgICAgICByZWdpc3RlcjogZnVuY3Rpb24oY2hhcnRUeXBlLCBDaGFydENsYXNzKSB7XG4gICAgICAgICAgICBjaGFydHNbY2hhcnRUeXBlXSA9IENoYXJ0Q2xhc3M7XG4gICAgICAgIH1cbiAgICB9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnk7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgIFBsdWdpbiBmYWN0b3J5IHBsYXkgcm9sZSByZWdpc3RlciByZW5kZXJpbmcgcGx1Z2luLlxuICogICAgICAgICAgICAgICAgQWxzbywgeW91IGNhbiBnZXQgcGx1Z2luIGZyb20gdGhpcyBmYWN0b3J5LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgcGx1Z2lucyA9IHt9LFxuICAgIGZhY3RvcnkgPSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgZ3JhcGggcmVuZGVyZXIuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBsaWJUeXBlIHR5cGUgb2YgZ3JhcGggbGlicmFyeVxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY2hhcnRUeXBlIGNoYXJ0IHR5cGVcbiAgICAgICAgICogQHJldHVybnMge29iamVjdH0gcmVuZGVyZXIgaW5zdGFuY2VcbiAgICAgICAgICovXG4gICAgICAgIGdldDogZnVuY3Rpb24obGliVHlwZSwgY2hhcnRUeXBlKSB7XG4gICAgICAgICAgICB2YXIgcGx1Z2luID0gcGx1Z2luc1tsaWJUeXBlXSxcbiAgICAgICAgICAgICAgICBSZW5kZXJlciwgcmVuZGVyZXI7XG5cbiAgICAgICAgICAgIGlmICghcGx1Z2luKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgZXhpc3QgJyArIGxpYlR5cGUgKyAnIHBsdWdpbi4nKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgUmVuZGVyZXIgPSBwbHVnaW5bY2hhcnRUeXBlXTtcbiAgICAgICAgICAgIGlmICghUmVuZGVyZXIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBleGlzdCAnICsgY2hhcnRUeXBlICsgJyBjaGFydCByZW5kZXJlci4nKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmVuZGVyZXIgPSBuZXcgUmVuZGVyZXIoKTtcblxuICAgICAgICAgICAgcmV0dXJuIHJlbmRlcmVyO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogUGx1Z2luIHJlZ2lzdGVyLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gbGliVHlwZSB0eXBlIG9mIGdyYXBoIGxpYnJhcnlcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IHBsdWdpbiBwbHVnaW4gdG8gY29udHJvbCBsaWJyYXJ5XG4gICAgICAgICAqL1xuICAgICAgICByZWdpc3RlcjogZnVuY3Rpb24obGliVHlwZSwgcGx1Z2luKSB7XG4gICAgICAgICAgICBwbHVnaW5zW2xpYlR5cGVdID0gcGx1Z2luO1xuICAgICAgICB9XG4gICAgfTtcblxubW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3ICBUaGVtZSBmYWN0b3J5IHBsYXkgcm9sZSByZWdpc3RlciB0aGVtZS5cbiAqICAgICAgICAgICAgICAgIEFsc28sIHlvdSBjYW4gZ2V0IHRoZW1lIGZyb20gdGhpcyBmYWN0b3J5LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4uL2NvbnN0LmpzJyksXG4gICAgZGVmYXVsdFRoZW1lID0gcmVxdWlyZSgnLi4vdGhlbWVzL2RlZmF1bHRUaGVtZS5qcycpO1xuXG52YXIgdGhlbWVzID0ge307XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIC8qKlxuICAgICAqIEdldCB0aGVtZS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGhlbWVOYW1lIHRoZW1lIG5hbWVcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSB0aGVtZSBvYmplY3RcbiAgICAgKi9cbiAgICBnZXQ6IGZ1bmN0aW9uKHRoZW1lTmFtZSkge1xuICAgICAgICB2YXIgdGhlbWUgPSB0aGVtZXNbdGhlbWVOYW1lXTtcblxuICAgICAgICBpZiAoIXRoZW1lKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBleGlzdCAnICsgdGhlbWVOYW1lICsgJyB0aGVtZS4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGVtZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVGhlbWUgcmVnaXN0ZXIuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRoZW1lTmFtZSB0aGVtZSBuYW1lXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIHRoZW1lXG4gICAgICovXG4gICAgcmVnaXN0ZXI6IGZ1bmN0aW9uKHRoZW1lTmFtZSwgdGhlbWUpIHtcbiAgICAgICAgdGhlbWUgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoZW1lKSk7XG4gICAgICAgIGlmICh0aGVtZU5hbWUgIT09IGNoYXJ0Q29uc3QuREVGQVVMVF9USEVNRV9OQU1FKSB7XG4gICAgICAgICAgICB0aGVtZSA9IHRoaXMuX2luaXRUaGVtZSh0aGVtZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5faW5oZXJpdFRoZW1lUHJvcGVydHkodGhlbWUpO1xuICAgICAgICB0aGVtZXNbdGhlbWVOYW1lXSA9IHRoZW1lO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbml0IHRoZW1lLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSB0aGVtZVxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHRoZW1lXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAaWdub3JlXG4gICAgICovXG4gICAgX2luaXRUaGVtZTogZnVuY3Rpb24odGhlbWUpIHtcbiAgICAgICAgdmFyIGNsb25lVGhlbWUgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGRlZmF1bHRUaGVtZSkpLFxuICAgICAgICAgICAgbmV3VGhlbWU7XG5cbiAgICAgICAgdGhpcy5fY29uY2F0RGVmYXVsdENvbG9ycyh0aGVtZSwgY2xvbmVUaGVtZS5zZXJpZXMuY29sb3JzKVxuICAgICAgICBuZXdUaGVtZSA9IHRoaXMuX2V4dGVuZFRoZW1lKHRoZW1lLCBjbG9uZVRoZW1lKTtcblxuICAgICAgICBuZXdUaGVtZSA9IHRoaXMuX2NvcHlQcm9wZXJ0eSh7XG4gICAgICAgICAgICBwcm9wTmFtZTogJ3lBeGlzJyxcbiAgICAgICAgICAgIGZyb21UaGVtZTogdGhlbWUsXG4gICAgICAgICAgICB0b1RoZW1lOiBuZXdUaGVtZSxcbiAgICAgICAgICAgIHJlamVjdFByb3BzOiBjaGFydENvbnN0LllBWElTX1BST1BTXG4gICAgICAgIH0pO1xuXG4gICAgICAgIG5ld1RoZW1lID0gdGhpcy5fY29weVByb3BlcnR5KHtcbiAgICAgICAgICAgIHByb3BOYW1lOiAnc2VyaWVzJyxcbiAgICAgICAgICAgIGZyb21UaGVtZTogdGhlbWUsXG4gICAgICAgICAgICB0b1RoZW1lOiBuZXdUaGVtZSxcbiAgICAgICAgICAgIHJlamVjdFByb3BzOiBjaGFydENvbnN0LlNFUklFU19QUk9QU1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIG5ld1RoZW1lO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGaWx0ZXIgY2hhcnQgdHlwZXMuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRhcmdldCB0YXJnZXQgY2hhcnRzXG4gICAgICogQHBhcmFtIHthcnJheS48c3RyaW5nPn0gcmVqZWN0UHJvcHMgcmVqZWN0IHByb3BlcnR5XG4gICAgICogQHJldHVybnMge09iamVjdH0gZmlsdGVyZWQgY2hhcnRzLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2ZpbHRlckNoYXJ0VHlwZXM6IGZ1bmN0aW9uKHRhcmdldCwgcmVqZWN0UHJvcHMpIHtcbiAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlc3VsdCA9IG5lLnV0aWwuZmlsdGVyKHRhcmdldCwgZnVuY3Rpb24oaXRlbSwgbmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwuaW5BcnJheShuYW1lLCByZWplY3RQcm9wcykgPT09IC0xO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29uY2F0IGNvbG9ycy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgdGhlbWVcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBzZXJpZXNDb2xvcnMgc2VyaWVzIGNvbG9yc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NvbmNhdENvbG9yczogZnVuY3Rpb24odGhlbWUsIHNlcmllc0NvbG9ycykge1xuICAgICAgICBpZiAodGhlbWUuY29sb3JzKSB7XG4gICAgICAgICAgICB0aGVtZS5jb2xvcnMgPSB0aGVtZS5jb2xvcnMuY29uY2F0KHNlcmllc0NvbG9ycyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhlbWUuc2luZ2xlQ29sb3JzKSB7XG4gICAgICAgICAgICB0aGVtZS5zaW5nbGVDb2xvcnMgPSB0aGVtZS5zaW5nbGVDb2xvcnMuY29uY2F0KHNlcmllc0NvbG9ycyk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29uY2F0IGRlZmF1bHQgY29sb3JzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSB0aGVtZVxuICAgICAqIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IHNlcmllc0NvbG9ycyBzZXJpZXMgY29sb3JzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY29uY2F0RGVmYXVsdENvbG9yczogZnVuY3Rpb24odGhlbWUsIHNlcmllc0NvbG9ycykge1xuICAgICAgICB2YXIgY2hhcnRUeXBlcztcblxuICAgICAgICBpZiAoIXRoZW1lLnNlcmllcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY2hhcnRUeXBlcyA9IHRoaXMuX2ZpbHRlckNoYXJ0VHlwZXModGhlbWUuc2VyaWVzLCBjaGFydENvbnN0LlNFUklFU19QUk9QUyk7XG5cbiAgICAgICAgaWYgKCFuZS51dGlsLmtleXMoY2hhcnRUeXBlcykubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLl9jb25jYXRDb2xvcnModGhlbWUuc2VyaWVzLCBzZXJpZXNDb2xvcnMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmUudXRpbC5mb3JFYWNoKGNoYXJ0VHlwZXMsIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jb25jYXRDb2xvcnMoaXRlbSwgc2VyaWVzQ29sb3JzKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV4dGVuZCB0aGVtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBmcm9tIGZyb20gdGhlbWUgcHJvcGVydHlcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdG8gdG8gdGhlbWUgcHJvcGVydHlcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSByZXN1bHQgcHJvcGVydHlcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9leHRlbmRUaGVtZTogZnVuY3Rpb24oZnJvbSwgdG8pIHtcbiAgICAgICAgbmUudXRpbC5mb3JFYWNoKHRvLCBmdW5jdGlvbihpdGVtLCBrZXkpIHtcbiAgICAgICAgICAgIHZhciBmcm9tSXRlbSA9IGZyb21ba2V5XTtcbiAgICAgICAgICAgIGlmICghZnJvbUl0ZW0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChuZS51dGlsLmlzQXJyYXkoZnJvbUl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgdG9ba2V5XSA9IGZyb21JdGVtLnNsaWNlKCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5lLnV0aWwuaXNPYmplY3QoZnJvbUl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZXh0ZW5kVGhlbWUoZnJvbUl0ZW0sIGl0ZW0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0b1trZXldID0gZnJvbUl0ZW07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIHJldHVybiB0bztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29weSBwcm9wZXJ0eS5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMucHJvcE5hbWUgcHJvcGVydHkgbmFtZVxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5mcm9tVGhlbWUgZnJvbSBwcm9wZXJ0eVxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50b1RoZW1lIHRwIHByb3BlcnR5XG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBwYXJhbXMucmVqZWN0UHJvcHMgcmVqZWN0IHByb3BlcnR5IG5hbWVcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBjb3BpZWQgcHJvcGVydHlcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jb3B5UHJvcGVydHk6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgY2hhcnRUeXBlcztcblxuICAgICAgICBpZiAoIXBhcmFtcy50b1RoZW1lW3BhcmFtcy5wcm9wTmFtZV0pIHtcbiAgICAgICAgICAgIHJldHVybiBwYXJhbXMudG9UaGVtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNoYXJ0VHlwZXMgPSB0aGlzLl9maWx0ZXJDaGFydFR5cGVzKHBhcmFtcy5mcm9tVGhlbWVbcGFyYW1zLnByb3BOYW1lXSwgcGFyYW1zLnJlamVjdFByb3BzKTtcbiAgICAgICAgaWYgKG5lLnV0aWwua2V5cyhjaGFydFR5cGVzKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIG5lLnV0aWwuZm9yRWFjaChjaGFydFR5cGVzLCBmdW5jdGlvbihpdGVtLCBrZXkpIHtcbiAgICAgICAgICAgICAgICB2YXIgY2xvbmVUaGVtZSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZGVmYXVsdFRoZW1lW3BhcmFtcy5wcm9wTmFtZV0pKTtcbiAgICAgICAgICAgICAgICBwYXJhbXMuZnJvbVRoZW1lW3BhcmFtcy5wcm9wTmFtZV1ba2V5XSA9IHRoaXMuX2V4dGVuZFRoZW1lKGl0ZW0sIGNsb25lVGhlbWUpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgICAgIHBhcmFtcy50b1RoZW1lW3BhcmFtcy5wcm9wTmFtZV0gPSBwYXJhbXMuZnJvbVRoZW1lW3BhcmFtcy5wcm9wTmFtZV07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGFyYW1zLnRvVGhlbWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvcHkgY29sb3IgaW5mbyB0byBsZWdlbmRcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gc2VyaWVzVGhlbWUgc2VyaWVzIHRoZW1lXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGxlZ2VuZFRoZW1lIGxlZ2VuZCB0aGVtZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NvcHlDb2xvckluZm9Ub0xlZ2VuZDogZnVuY3Rpb24oc2VyaWVzVGhlbWUsIGxlZ2VuZFRoZW1lKSB7XG4gICAgICAgIGlmIChzZXJpZXNUaGVtZS5zaW5nbGVDb2xvcnMpIHtcbiAgICAgICAgICAgIGxlZ2VuZFRoZW1lLnNpbmdsZUNvbG9ycyA9IHNlcmllc1RoZW1lLnNpbmdsZUNvbG9ycztcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2VyaWVzVGhlbWUuYm9yZGVyQ29sb3IpIHtcbiAgICAgICAgICAgIGxlZ2VuZFRoZW1lLmJvcmRlckNvbG9yID0gc2VyaWVzVGhlbWUuYm9yZGVyQ29sb3I7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gaW5oZXJpdCB0aGVtZSBwcm9wZXJ0eS5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgdGhlbWVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBpZ25vcmVcbiAgICAgKi9cbiAgICBfaW5oZXJpdFRoZW1lUHJvcGVydHk6IGZ1bmN0aW9uKHRoZW1lKSB7XG4gICAgICAgIHZhciBiYXNlRm9udCA9IHRoZW1lLmNoYXJ0LmZvbnRGYW1pbHksXG4gICAgICAgICAgICBpdGVtcyA9IFtcbiAgICAgICAgICAgICAgICB0aGVtZS50aXRsZSxcbiAgICAgICAgICAgICAgICB0aGVtZS54QXhpcy50aXRsZSxcbiAgICAgICAgICAgICAgICB0aGVtZS54QXhpcy5sYWJlbCxcbiAgICAgICAgICAgICAgICB0aGVtZS5sZWdlbmQubGFiZWxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB5QXhpc0NoYXJ0VHlwZXMgPSB0aGlzLl9maWx0ZXJDaGFydFR5cGVzKHRoZW1lLnlBeGlzLCBjaGFydENvbnN0LllBWElTX1BST1BTKSxcbiAgICAgICAgICAgIHNlcmllc0NoYXJ0VHlwZXMgPSB0aGlzLl9maWx0ZXJDaGFydFR5cGVzKHRoZW1lLnNlcmllcywgY2hhcnRDb25zdC5TRVJJRVNfUFJPUFMpO1xuXG4gICAgICAgIGlmICghbmUudXRpbC5rZXlzKHlBeGlzQ2hhcnRUeXBlcykubGVuZ3RoKSB7XG4gICAgICAgICAgICBpdGVtcy5wdXNoKHRoZW1lLnlBeGlzLnRpdGxlKTtcbiAgICAgICAgICAgIGl0ZW1zLnB1c2godGhlbWUueUF4aXMubGFiZWwpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmUudXRpbC5mb3JFYWNoKHlBeGlzQ2hhcnRUeXBlcywgZnVuY3Rpb24oeUF4aXNUaGVtZSkge1xuICAgICAgICAgICAgICAgIGl0ZW1zLnB1c2goeUF4aXNUaGVtZS50aXRsZSk7XG4gICAgICAgICAgICAgICAgaXRlbXMucHVzaCh5QXhpc1RoZW1lLmxhYmVsKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkoaXRlbXMsIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgIGlmICghaXRlbS5mb250RmFtaWx5KSB7XG4gICAgICAgICAgICAgICAgaXRlbS5mb250RmFtaWx5ID0gYmFzZUZvbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICghbmUudXRpbC5rZXlzKHNlcmllc0NoYXJ0VHlwZXMpLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhlbWUubGVnZW5kLmNvbG9ycyA9IHRoZW1lLnNlcmllcy5jb2xvcnM7XG4gICAgICAgICAgICB0aGlzLl9jb3B5Q29sb3JJbmZvVG9MZWdlbmQodGhlbWUuc2VyaWVzLCB0aGVtZS5sZWdlbmQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmUudXRpbC5mb3JFYWNoKHNlcmllc0NoYXJ0VHlwZXMsIGZ1bmN0aW9uKGl0ZW0sIGNoYXJ0VHlwZSkge1xuICAgICAgICAgICAgICAgIHRoZW1lLmxlZ2VuZFtjaGFydFR5cGVdID0ge1xuICAgICAgICAgICAgICAgICAgICBjb2xvcnM6IGl0ZW0uY29sb3JzIHx8IHRoZW1lLmxlZ2VuZC5jb2xvcnNcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMuX2NvcHlDb2xvckluZm9Ub0xlZ2VuZChpdGVtLCB0aGVtZS5sZWdlbmRbY2hhcnRUeXBlXSk7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoZW1lLmxlZ2VuZC5jb2xvcnM7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgQXhpcyBEYXRhIE1ha2VyXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBjaGFydENvbnN0ID0gcmVxdWlyZSgnLi4vY29uc3QuanMnKSxcbiAgICBjYWxjdWxhdG9yID0gcmVxdWlyZSgnLi9jYWxjdWxhdG9yLmpzJyk7XG5cbnZhciBNSU5fUElYRUxfU1RFUF9TSVpFID0gNDAsXG4gICAgTUFYX1BJWEVMX1NURVBfU0laRSA9IDYwLFxuICAgIFBFUkNFTlRfU1RBQ0tFRF9USUNLX0lORk8gPSB7XG4gICAgICAgIHNjYWxlOiB7XG4gICAgICAgICAgICBtaW46IDAsXG4gICAgICAgICAgICBtYXg6IDEwMFxuICAgICAgICB9LFxuICAgICAgICBzdGVwOiAyNSxcbiAgICAgICAgdGlja0NvdW50OiA1LFxuICAgICAgICBsYWJlbHM6IFswLCAyNSwgNTAsIDc1LCAxMDBdXG4gICAgfTtcblxudmFyIGFicyA9IE1hdGguYWJzLFxuICAgIGNvbmNhdCA9IEFycmF5LnByb3RvdHlwZS5jb25jYXQ7XG5cbi8qKlxuICogQXhpcyBkYXRhIG1ha2VyLlxuICogQG1vZHVsZSBheGlzRGF0YU1ha2VyXG4gKi9cbnZhciBheGlzRGF0YU1ha2VyID0ge1xuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgZGF0YSBhYm91dCBsYWJlbCBheGlzLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48c3RyaW5nPn0gbGFiZWxzIGNoYXJ0IGxhYmVsc1xuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBpc1ZlcnRpY2FsIHdoZXRoZXIgdmVydGljYWwgb3Igbm90XG4gICAgICogQHJldHVybnMge3tcbiAgICAgKiAgICAgIGxhYmVsczogYXJyYXkuPHN0cmluZz4sXG4gICAgICogICAgICB0aWNrQ291bnQ6IG51bWJlcixcbiAgICAgKiAgICAgIHZhbGlkVGlja0NvdW50OiBudW1iZXIsXG4gICAgICogICAgICBpc0xhYmVsQXhpczogYm9vbGVhbixcbiAgICAgKiAgICAgIGlzVmVydGljYWw6IGJvb2xlYW5cbiAgICAgKiB9fSBheGlzIGRhdGFcbiAgICAgKi9cbiAgICBtYWtlTGFiZWxBeGlzRGF0YTogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsYWJlbHM6IHBhcmFtcy5sYWJlbHMsXG4gICAgICAgICAgICB0aWNrQ291bnQ6IHBhcmFtcy5sYWJlbHMubGVuZ3RoICsgMSxcbiAgICAgICAgICAgIHZhbGlkVGlja0NvdW50OiAwLFxuICAgICAgICAgICAgaXNMYWJlbEF4aXM6IHRydWUsXG4gICAgICAgICAgICBpc1ZlcnRpY2FsOiAhIXBhcmFtcy5pc1ZlcnRpY2FsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgZGF0YSBhYm91dCB2YWx1ZSBheGlzLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48YXJyYXkuPG51bWJlcj4+fSBwYXJhbXMudmFsdWVzIGNoYXJ0IHZhbHVlc1xuICAgICAqICAgICAgQHBhcmFtIHt7d2lkdGg6bnVtYmVyLCBoZWlnaHQ6bnVtYmVyfX0gcGFyYW1zLnNlcmllc0RpbWVuc2lvbiBzZXJpZXMgZGltZW5zaW9uXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxmdW5jdGlvbj59IHBhcmFtcy5mb3JtYXRGdW5jdGlvbnMgZm9ybWF0IGZ1bmN0aW9uc1xuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5zdGFja2VkIHN0YWNrZWQgb3B0aW9uXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLm9wdGlvbnMgYXhpcyBvcHRpb25zXG4gICAgICogQHJldHVybnMge3tcbiAgICAgKiAgICAgIGxhYmVsczogYXJyYXkuPHN0cmluZz4sXG4gICAgICogICAgICB0aWNrQ291bnQ6IG51bWJlcixcbiAgICAgKiAgICAgIHZhbGlkVGlja0NvdW50OiBudW1iZXIsXG4gICAgICogICAgICBpc0xhYmVsQXhpczogYm9vbGVhbixcbiAgICAgKiAgICAgIHNjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfSxcbiAgICAgKiAgICAgIGlzVmVydGljYWw6IGJvb2xlYW5cbiAgICAgKiB9fSBheGlzIGRhdGFcbiAgICAgKi9cbiAgICBtYWtlVmFsdWVBeGlzRGF0YTogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBvcHRpb25zID0gcGFyYW1zLm9wdGlvbnMgfHwge30sXG4gICAgICAgICAgICBpc1ZlcnRpY2FsID0gISFwYXJhbXMuaXNWZXJ0aWNhbCxcbiAgICAgICAgICAgIGlzUG9zaXRpb25SaWdodCA9ICEhcGFyYW1zLmlzUG9zaXRpb25SaWdodCxcbiAgICAgICAgICAgIGZvcm1hdEZ1bmN0aW9ucyA9IHBhcmFtcy5mb3JtYXRGdW5jdGlvbnMsXG4gICAgICAgICAgICB0aWNrSW5mbztcbiAgICAgICAgaWYgKHBhcmFtcy5zdGFja2VkID09PSAncGVyY2VudCcpIHtcbiAgICAgICAgICAgIHRpY2tJbmZvID0gUEVSQ0VOVF9TVEFDS0VEX1RJQ0tfSU5GTztcbiAgICAgICAgICAgIGZvcm1hdEZ1bmN0aW9ucyA9IFtdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGlja0luZm8gPSB0aGlzLl9nZXRUaWNrSW5mbyh7XG4gICAgICAgICAgICAgICAgdmFsdWVzOiB0aGlzLl9tYWtlQmFzZVZhbHVlcyhwYXJhbXMudmFsdWVzLCBwYXJhbXMuc3RhY2tlZCksXG4gICAgICAgICAgICAgICAgc2VyaWVzRGltZW5zaW9uOiBwYXJhbXMuc2VyaWVzRGltZW5zaW9uLFxuICAgICAgICAgICAgICAgIGlzVmVydGljYWw6IGlzVmVydGljYWwsXG4gICAgICAgICAgICAgICAgaXNQb3NpdGlvblJpZ2h0OiBpc1Bvc2l0aW9uUmlnaHQsXG4gICAgICAgICAgICAgICAgY2hhcnRUeXBlOiBwYXJhbXMuY2hhcnRUeXBlXG4gICAgICAgICAgICB9LCBvcHRpb25zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsYWJlbHM6IHRoaXMuX2Zvcm1hdExhYmVscyh0aWNrSW5mby5sYWJlbHMsIGZvcm1hdEZ1bmN0aW9ucyksXG4gICAgICAgICAgICB0aWNrQ291bnQ6IHRpY2tJbmZvLnRpY2tDb3VudCxcbiAgICAgICAgICAgIHZhbGlkVGlja0NvdW50OiB0aWNrSW5mby50aWNrQ291bnQsXG4gICAgICAgICAgICBzY2FsZTogdGlja0luZm8uc2NhbGUsXG4gICAgICAgICAgICBzdGVwOiB0aWNrSW5mby5zdGVwLFxuICAgICAgICAgICAgaXNWZXJ0aWNhbDogaXNWZXJ0aWNhbCxcbiAgICAgICAgICAgIGlzUG9zaXRpb25SaWdodDogaXNQb3NpdGlvblJpZ2h0XG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYmFzZSB2YWx1ZXMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHthcnJheS48bnVtYmVyPn0gZ3JvdXBWYWx1ZXMgZ3JvdXAgdmFsdWVzXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHN0YWNrZWQgc3RhY2tlZCBvcHRpb24uXG4gICAgICogQHJldHVybnMge2FycmF5LjxudW1iZXI+fSBiYXNlIHZhbHVlc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VCYXNlVmFsdWVzOiBmdW5jdGlvbihncm91cFZhbHVlcywgc3RhY2tlZCkge1xuICAgICAgICB2YXIgYmFzZVZhbHVlcyA9IGNvbmNhdC5hcHBseShbXSwgZ3JvdXBWYWx1ZXMpOyAvLyBmbGF0dGVuIGFycmF5XG4gICAgICAgIGlmIChzdGFja2VkID09PSBjaGFydENvbnN0LlNUQUNLRURfTk9STUFMX1RZUEUpIHtcbiAgICAgICAgICAgIGJhc2VWYWx1ZXMgPSBiYXNlVmFsdWVzLmNvbmNhdChuZS51dGlsLm1hcChncm91cFZhbHVlcywgZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBsdXNWYWx1ZXMgPSBuZS51dGlsLmZpbHRlcih2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSA+IDA7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwuc3VtKHBsdXNWYWx1ZXMpO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBiYXNlVmFsdWVzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgYmFzZSBzaXplIGZvciBnZXQgY2FuZGlkYXRlIHRpY2sgY291bnRzLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gZGltZW5zaW9uIGNoYXQgZGltZW5zaW9uXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpc1ZlcnRpY2FsIHdoZXRoZXIgdmVydGljYWwgb3Igbm90XG4gICAgICogQHJldHVybnMge251bWJlcn0gYmFzZSBzaXplXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0QmFzZVNpemU6IGZ1bmN0aW9uKGRpbWVuc2lvbiwgaXNWZXJ0aWNhbCkge1xuICAgICAgICB2YXIgYmFzZVNpemU7XG4gICAgICAgIGlmIChpc1ZlcnRpY2FsKSB7XG4gICAgICAgICAgICBiYXNlU2l6ZSA9IGRpbWVuc2lvbi5oZWlnaHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBiYXNlU2l6ZSA9IGRpbWVuc2lvbi53aWR0aDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYmFzZVNpemU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjYW5kaWRhdGUgdGljayBjb3VudHMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBjaGFydERpbWVuc2lvbiBjaGF0IGRpbWVuc2lvblxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNWZXJ0aWNhbCB3aGV0aGVyIHZlcnRpY2FsIG9yIG5vdFxuICAgICAqIEByZXR1cm5zIHthcnJheS48bnVtYmVyPn0gdGljayBjb3VudHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRDYW5kaWRhdGVUaWNrQ291bnRzOiBmdW5jdGlvbihjaGFydERpbWVuc2lvbiwgaXNWZXJ0aWNhbCkge1xuICAgICAgICB2YXIgYmFzZVNpemUgPSB0aGlzLl9nZXRCYXNlU2l6ZShjaGFydERpbWVuc2lvbiwgaXNWZXJ0aWNhbCksXG4gICAgICAgICAgICBzdGFydCA9IHBhcnNlSW50KGJhc2VTaXplIC8gTUFYX1BJWEVMX1NURVBfU0laRSwgMTApLFxuICAgICAgICAgICAgZW5kID0gcGFyc2VJbnQoYmFzZVNpemUgLyBNSU5fUElYRUxfU1RFUF9TSVpFLCAxMCkgKyAxLFxuICAgICAgICAgICAgdGlja0NvdW50cyA9IG5lLnV0aWwucmFuZ2Uoc3RhcnQsIGVuZCk7XG4gICAgICAgIHJldHVybiB0aWNrQ291bnRzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgY29tcGFyaW5nIHZhbHVlLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtaW4gbWluaW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWF4IG1heGltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogQHBhcmFtIHt7c2NhbGU6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9LCBzdGVwOiBudW1iZXJ9fSB0aWNrSW5mbyB0aWNrIGluZm9cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBjb21wYXJpbmcgdmFsdWVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRDb21wYXJpbmdWYWx1ZTogZnVuY3Rpb24obWluLCBtYXgsIHRpY2tJbmZvKSB7XG4gICAgICAgIHZhciBkaWZmTWF4ID0gYWJzKHRpY2tJbmZvLnNjYWxlLm1heCAtIG1heCksXG4gICAgICAgICAgICBkaWZmTWluID0gYWJzKG1pbiAtIHRpY2tJbmZvLnNjYWxlLm1pbiksXG4gICAgICAgICAgICB3ZWlnaHQgPSBNYXRoLnBvdygxMCwgbmUudXRpbC5sZW5ndGhBZnRlclBvaW50KHRpY2tJbmZvLnN0ZXApKTtcbiAgICAgICAgcmV0dXJuIChkaWZmTWF4ICsgZGlmZk1pbikgKiB3ZWlnaHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNlbGVjdCB0aWNrIGluZm8uXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1pbiBtaW5pbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtYXggbWF4aW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxvYmplY3Q+fSBjYW5kaWRhdGVzIHRpY2sgaW5mbyBjYW5kaWRhdGVzXG4gICAgICogQHJldHVybnMge3tzY2FsZToge21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn0sIHRpY2tDb3VudDogbnVtYmVyLCBzdGVwOiBudW1iZXIsIGxhYmVsczogYXJyYXkuPG51bWJlcj59fSBzZWxlY3RlZCB0aWNrIGluZm9cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZWxlY3RUaWNrSW5mbzogZnVuY3Rpb24obWluLCBtYXgsIGNhbmRpZGF0ZXMpIHtcbiAgICAgICAgdmFyIGdldENvbXBhcmluZ1ZhbHVlID0gbmUudXRpbC5iaW5kKHRoaXMuX2dldENvbXBhcmluZ1ZhbHVlLCB0aGlzLCBtaW4sIG1heCksXG4gICAgICAgICAgICB0aWNrSW5mbyA9IG5lLnV0aWwubWluKGNhbmRpZGF0ZXMsIGdldENvbXBhcmluZ1ZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHRpY2tJbmZvO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGljayBjb3VudCBhbmQgc2NhbGUuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnZhbHVlcyBiYXNlIHZhbHVlc1xuICAgICAqICAgICAgQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBwYXJhbXMuc2VyaWVzRGltZW5zaW9uIGNoYXQgZGltZW5zaW9uXG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5pc1ZlcnRpY2FsIHdoZXRoZXIgdmVydGljYWwgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLmNoYXJ0VHlwZSBjaGF0IHR5cGVcbiAgICAgKiBAcGFyYW0ge3ttaW46IG51bWJlciwgbWF4Om51bWJlcn19IG9wdGlvbnMgYXhpcyBvcHRpb25zXG4gICAgICogQHJldHVybnMge3t0aWNrQ291bnQ6IG51bWJlciwgc2NhbGU6IG9iamVjdH19IHRpY2sgaW5mb1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFRpY2tJbmZvOiBmdW5jdGlvbihwYXJhbXMsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIG1pbiA9IG5lLnV0aWwubWluKHBhcmFtcy52YWx1ZXMpLFxuICAgICAgICAgICAgbWF4ID0gbmUudXRpbC5tYXgocGFyYW1zLnZhbHVlcyksXG4gICAgICAgICAgICBpbnRUeXBlSW5mbywgdGlja0NvdW50cywgY2FuZGlkYXRlcywgdGlja0luZm87XG4gICAgICAgIC8vIDAxLiBtaW4sIG1heCwgb3B0aW9ucyDsoJXrs7Trpbwg7KCV7IiY7ZiV7Jy866GcIOuzgOqyvVxuICAgICAgICBpbnRUeXBlSW5mbyA9IHRoaXMuX21ha2VJbnRlZ2VyVHlwZUluZm8obWluLCBtYXgsIG9wdGlvbnMpO1xuXG4gICAgICAgIC8vIDAyLiB0aWNrIGNvdW50IO2bhOuztOq1sCDslrvquLBcbiAgICAgICAgdGlja0NvdW50cyA9IHBhcmFtcy50aWNrQ291bnQgPyBbcGFyYW1zLnRpY2tDb3VudF0gOiB0aGlzLl9nZXRDYW5kaWRhdGVUaWNrQ291bnRzKHBhcmFtcy5zZXJpZXNEaW1lbnNpb24sIHBhcmFtcy5pc1ZlcnRpY2FsKTtcblxuICAgICAgICAvLyAwMy4gdGljayBpbmZvIO2bhOuztOq1sCDqs4TsgrBcbiAgICAgICAgY2FuZGlkYXRlcyA9IHRoaXMuX2dldENhbmRpZGF0ZVRpY2tJbmZvcyh7XG4gICAgICAgICAgICBtaW46IGludFR5cGVJbmZvLm1pbixcbiAgICAgICAgICAgIG1heDogaW50VHlwZUluZm8ubWF4LFxuICAgICAgICAgICAgdGlja0NvdW50czogdGlja0NvdW50cyxcbiAgICAgICAgICAgIGNoYXJ0VHlwZTogcGFyYW1zLmNoYXJ0VHlwZVxuICAgICAgICB9LCBpbnRUeXBlSW5mby5vcHRpb25zKTtcblxuICAgICAgICAvLyAwNC4gdGljayBpbmZvIO2bhOuztOq1sCDspJEg7ZWY64KYIOyEoO2DnVxuICAgICAgICB0aWNrSW5mbyA9IHRoaXMuX3NlbGVjdFRpY2tJbmZvKGludFR5cGVJbmZvLm1pbiwgaW50VHlwZUluZm8ubWF4LCBjYW5kaWRhdGVzKTtcblxuICAgICAgICAvLyAwNS4g7KCV7IiY7ZiV7Jy866GcIOuzgOqyve2WiOuNmCB0aWNrIGluZm/rpbwg7JuQ656YIO2Yle2DnOuhnCDrs4Dqsr1cbiAgICAgICAgdGlja0luZm8gPSB0aGlzLl9yZXZlcnRPcmlnaW5hbFR5cGVUaWNrSW5mbyh0aWNrSW5mbywgaW50VHlwZUluZm8uZGl2aWRlTnVtKTtcbiAgICAgICAgcmV0dXJuIHRpY2tJbmZvO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGludGVnZXIgdHlwZSBpbmZvXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1pbiBtaW5pbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtYXggbWF4aW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiBAcGFyYW0ge3ttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fSBvcHRpb25zIGF4aXMgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHt7bWluOiBudW1iZXIsIG1heDogbnVtYmVyLCBvcHRpb25zOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfSwgZGl2aWRlTnVtOiBudW1iZXJ9fSBpbnRlZ2VyIHR5cGUgaW5mb1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VJbnRlZ2VyVHlwZUluZm86IGZ1bmN0aW9uKG1pbiwgbWF4LCBvcHRpb25zKSB7XG4gICAgICAgIHZhciBtdWx0aXBsZU51bSwgY2hhbmdlZE9wdGlvbnM7XG5cbiAgICAgICAgaWYgKGFicyhtaW4pID49IDEgfHwgYWJzKG1heCkgPj0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBtaW46IG1pbixcbiAgICAgICAgICAgICAgICBtYXg6IG1heCxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zLFxuICAgICAgICAgICAgICAgIGRpdmlkZU51bTogMVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIG11bHRpcGxlTnVtID0gbmUudXRpbC5maW5kTXVsdGlwbGVOdW0obWluLCBtYXgpO1xuICAgICAgICBjaGFuZ2VkT3B0aW9ucyA9IHt9O1xuXG4gICAgICAgIGlmIChvcHRpb25zLm1pbikge1xuICAgICAgICAgICAgY2hhbmdlZE9wdGlvbnMubWluID0gb3B0aW9ucy5taW4gKiBtdWx0aXBsZU51bTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvcHRpb25zLm1heCkge1xuICAgICAgICAgICAgY2hhbmdlZE9wdGlvbnMubWF4ID0gb3B0aW9ucy5tYXggKiBtdWx0aXBsZU51bTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBtaW46IG1pbiAqIG11bHRpcGxlTnVtLFxuICAgICAgICAgICAgbWF4OiBtYXggKiBtdWx0aXBsZU51bSxcbiAgICAgICAgICAgIG9wdGlvbnM6IGNoYW5nZWRPcHRpb25zLFxuICAgICAgICAgICAgZGl2aWRlTnVtOiBtdWx0aXBsZU51bVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXZlcnQgdGljayBpbmZvIHRvIG9yaWdpbmFsIHR5cGUuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHt7c3RlcDogbnVtYmVyLCBzY2FsZToge21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn0sIGxhYmVsczogYXJyYXkuPG51bWJlcj59fSB0aWNrSW5mbyB0aWNrIGluZm9cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZGl2aWRlTnVtIGRpdmlkZSBudW1cbiAgICAgKiBAcmV0dXJucyB7e3N0ZXA6IG51bWJlciwgc2NhbGU6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9LCBsYWJlbHM6IGFycmF5LjxudW1iZXI+fX0gZGl2aWRlZCB0aWNrIGluZm9cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZXZlcnRPcmlnaW5hbFR5cGVUaWNrSW5mbzogZnVuY3Rpb24odGlja0luZm8sIGRpdmlkZU51bSkge1xuICAgICAgICBpZiAoZGl2aWRlTnVtID09PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gdGlja0luZm87XG4gICAgICAgIH1cblxuICAgICAgICB0aWNrSW5mby5zdGVwID0gbmUudXRpbC5kaXZpc2lvbih0aWNrSW5mby5zdGVwLCBkaXZpZGVOdW0pO1xuICAgICAgICB0aWNrSW5mby5zY2FsZS5taW4gPSBuZS51dGlsLmRpdmlzaW9uKHRpY2tJbmZvLnNjYWxlLm1pbiwgZGl2aWRlTnVtKTtcbiAgICAgICAgdGlja0luZm8uc2NhbGUubWF4ID0gbmUudXRpbC5kaXZpc2lvbih0aWNrSW5mby5zY2FsZS5tYXgsIGRpdmlkZU51bSk7XG4gICAgICAgIHRpY2tJbmZvLmxhYmVscyA9IG5lLnV0aWwubWFwKHRpY2tJbmZvLmxhYmVscywgZnVuY3Rpb24obGFiZWwpIHtcbiAgICAgICAgICAgIHJldHVybiBuZS51dGlsLmRpdmlzaW9uKGxhYmVsLCBkaXZpZGVOdW0pO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdGlja0luZm87XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE5vcm1hbGl6ZSBzdGVwLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdGVwIG9yaWdpbmFsIHN0ZXBcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBub3JtYWxpemVkIHN0ZXBcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9ub3JtYWxpemVTdGVwOiBmdW5jdGlvbihzdGVwKSB7XG4gICAgICAgIHJldHVybiBjYWxjdWxhdG9yLm5vcm1hbGl6ZUF4aXNOdW1iZXIoc3RlcCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1pbmltaXplIHRpY2sgc2NhbGUuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnVzZXJNaW4gdXNlciBtaW5cbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMudXNlck1heCB1c2VyIG1heFxuICAgICAqICAgICAgQHBhcmFtIHt7dGlja0NvdW50OiBudW1iZXIsIHNjYWxlOiBvYmplY3R9fSBwYXJhbXMudGlja0luZm8gdGljayBpbmZvXG4gICAgICogICAgICBAcGFyYW0ge3ttaW46IG51bWJlciwgbWF4Om51bWJlcn19IHBhcmFtcy5vcHRpb25zIGF4aXMgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHt7dGlja0NvdW50OiBudW1iZXIsIHNjYWxlOiBvYmplY3QsIGxhYmVsczogYXJyYXl9fSBjb3JyZWN0ZWQgdGljayBpbmZvXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWluaW1pemVUaWNrU2NhbGU6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgdGlja0luZm8gPSBwYXJhbXMudGlja0luZm8sXG4gICAgICAgICAgICB0aWNrcyA9IG5lLnV0aWwucmFuZ2UoMSwgdGlja0luZm8udGlja0NvdW50KSxcbiAgICAgICAgICAgIG9wdGlvbnMgPSBwYXJhbXMub3B0aW9ucyxcbiAgICAgICAgICAgIHN0ZXAgPSB0aWNrSW5mby5zdGVwLFxuICAgICAgICAgICAgc2NhbGUgPSB0aWNrSW5mby5zY2FsZSxcbiAgICAgICAgICAgIHRpY2tNYXggPSBzY2FsZS5tYXgsXG4gICAgICAgICAgICB0aWNrTWluID0gc2NhbGUubWluLFxuICAgICAgICAgICAgaXNVbmRlZmluZWRNaW4gPSBuZS51dGlsLmlzVW5kZWZpbmVkKG9wdGlvbnMubWluKSxcbiAgICAgICAgICAgIGlzVW5kZWZpbmVkTWF4ID0gbmUudXRpbC5pc1VuZGVmaW5lZChvcHRpb25zLm1heCksXG4gICAgICAgICAgICBsYWJlbHM7XG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KHRpY2tzLCBmdW5jdGlvbih0aWNrSW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBjdXJTdGVwID0gKHN0ZXAgKiB0aWNrSW5kZXgpLFxuICAgICAgICAgICAgICAgIGN1ck1pbiA9IHRpY2tNaW4gKyBjdXJTdGVwLFxuICAgICAgICAgICAgICAgIGN1ck1heCA9IHRpY2tNYXggLSBjdXJTdGVwO1xuXG4gICAgICAgICAgICAvLyDrjZTsnbTsg4Eg67OA6rK97J20IO2VhOyalCDsl4bsnYQg6rK97JqwXG4gICAgICAgICAgICBpZiAocGFyYW1zLnVzZXJNaW4gPD0gY3VyTWluICYmIHBhcmFtcy51c2VyTWF4ID49IGN1ck1heCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gbWluIOqwkuyXkCDrs4Dqsr0g7Jes7Jyg6rCAIOyeiOydhCDqsr3smrBcbiAgICAgICAgICAgIGlmICgoaXNVbmRlZmluZWRNaW4gJiYgcGFyYW1zLnVzZXJNaW4gPiBjdXJNaW4pIHx8XG4gICAgICAgICAgICAgICAgKCFpc1VuZGVmaW5lZE1pbiAmJiBvcHRpb25zLm1pbiA+PSBjdXJNaW4pKSB7XG4gICAgICAgICAgICAgICAgc2NhbGUubWluID0gY3VyTWluO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBtYXgg6rCS7JeQIOuzgOqyvSDsl6zsnKDqsIAg7J6I7J2EIOqyveyasFxuICAgICAgICAgICAgaWYgKChpc1VuZGVmaW5lZE1pbiAmJiBwYXJhbXMudXNlck1heCA8IGN1ck1heCkgfHxcbiAgICAgICAgICAgICAgICAoIWlzVW5kZWZpbmVkTWF4ICYmIG9wdGlvbnMubWF4IDw9IGN1ck1heCkpIHtcbiAgICAgICAgICAgICAgICBzY2FsZS5tYXggPSBjdXJNYXg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxhYmVscyA9IGNhbGN1bGF0b3IubWFrZUxhYmVsc0Zyb21TY2FsZShzY2FsZSwgc3RlcCk7XG4gICAgICAgIHRpY2tJbmZvLmxhYmVscyA9IGxhYmVscztcbiAgICAgICAgdGlja0luZm8uc3RlcCA9IHN0ZXA7XG4gICAgICAgIHRpY2tJbmZvLnRpY2tDb3VudCA9IGxhYmVscy5sZW5ndGg7XG4gICAgICAgIHJldHVybiB0aWNrSW5mbztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gZGl2aWRlIHRpY2sgc3RlcC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge3tzY2FsZToge21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn0sIHRpY2tDb3VudDogbnVtYmVyLCBzdGVwOiBudW1iZXIsIGxhYmVsczogYXJyYXkuPG51bWJlcj59fSB0aWNrSW5mbyB0aWNrIGluZm9cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gb3JnVGlja0NvdW50IG9yaWdpbmFsIHRpY2tDb3VudFxuICAgICAqIEByZXR1cm5zIHt7c2NhbGU6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9LCB0aWNrQ291bnQ6IG51bWJlciwgc3RlcDogbnVtYmVyLCBsYWJlbHM6IGFycmF5LjxudW1iZXI+fX0gdGljayBpbmZvXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZGl2aWRlVGlja1N0ZXA6IGZ1bmN0aW9uKHRpY2tJbmZvLCBvcmdUaWNrQ291bnQpIHtcbiAgICAgICAgdmFyIHN0ZXAgPSB0aWNrSW5mby5zdGVwLFxuICAgICAgICAgICAgc2NhbGUgPSB0aWNrSW5mby5zY2FsZSxcbiAgICAgICAgICAgIHRpY2tDb3VudCA9IHRpY2tJbmZvLnRpY2tDb3VudDtcbiAgICAgICAgLy8gc3RlcCAy7J2YIOuwsOyImCDsnbTrqbTshJwg67OA6rK965CcIHRpY2tDb3VudOydmCDrkZDrsLDsiJgtMeydtCB0aWNrQ291bnTrs7Tri6Qgb3JnVGlja0NvdW507JmAIOywqOydtOqwgCDrjZzrgpjqsbDrgpgg6rCZ7Jy866m0IHN0ZXDsnYQg67CY7Jy866GcIOuzgOqyve2VnOuLpC5cbiAgICAgICAgaWYgKChzdGVwICUgMiA9PT0gMCkgJiZcbiAgICAgICAgICAgIGFicyhvcmdUaWNrQ291bnQgLSAoKHRpY2tDb3VudCAqIDIpIC0gMSkpIDw9IGFicyhvcmdUaWNrQ291bnQgLSB0aWNrQ291bnQpKSB7XG4gICAgICAgICAgICBzdGVwID0gc3RlcCAvIDI7XG4gICAgICAgICAgICB0aWNrSW5mby5sYWJlbHMgPSBjYWxjdWxhdG9yLm1ha2VMYWJlbHNGcm9tU2NhbGUoc2NhbGUsIHN0ZXApO1xuICAgICAgICAgICAgdGlja0luZm8udGlja0NvdW50ID0gdGlja0luZm8ubGFiZWxzLmxlbmd0aDtcbiAgICAgICAgICAgIHRpY2tJbmZvLnN0ZXAgPSBzdGVwO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aWNrSW5mbztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSB0aWNrIGluZm9cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMudGlja0NvdW50IHRpY2sgY291bnRcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubWluIHNjYWxlIG1pblxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5tYXggc2NhbGUgbWF4XG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnVzZXJNaW4gbWluaW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMudXNlck1heCBtYXhpbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaXNNaW51cyB3aGV0aGVyIHNjYWxlIGlzIG1pbnVzIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5jaGFydFR5cGUgY2hhcnQgdHlwZVxuICAgICAqICAgICAgQHBhcmFtIHt7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX0gcGFyYW1zLm9wdGlvbnMgYXhpcyBvcHRpb25zXG4gICAgICogQHJldHVybnMge3tcbiAgICAgKiAgICAgIHNjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfSxcbiAgICAgKiAgICAgIHRpY2tDb3VudDogbnVtYmVyLFxuICAgICAqICAgICAgc3RlcDogbnVtYmVyLFxuICAgICAqICAgICAgbGFiZWxzOiBhcnJheS48bnVtYmVyPlxuICAgICAqIH19IHRpY2sgaW5mb1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VUaWNrSW5mbzogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBzY2FsZSA9IHBhcmFtcy5zY2FsZSxcbiAgICAgICAgICAgIHN0ZXAsIHRpY2tJbmZvO1xuXG4gICAgICAgIC8vIDAxLiDquLDrs7ggc2NhbGUg7KCV67O066GcIHN0ZXAg7Ja76riwXG4gICAgICAgIHN0ZXAgPSBjYWxjdWxhdG9yLmdldFNjYWxlU3RlcChzY2FsZSwgcGFyYW1zLnRpY2tDb3VudCk7XG5cbiAgICAgICAgLy8gMDIuIHN0ZXAg7J2867CY7ZmUIOyLnO2CpOq4sCAoZXg6IDAuMyAtLT4gMC41LCA3IC0tPiAxMClcbiAgICAgICAgc3RlcCA9IHRoaXMuX25vcm1hbGl6ZVN0ZXAoc3RlcCk7XG5cbiAgICAgICAgLy8gMDMuIHNjYWxlIOydvOuwmO2ZlCDsi5ztgqTquLBcbiAgICAgICAgc2NhbGUgPSB0aGlzLl9ub3JtYWxpemVTY2FsZShzY2FsZSwgc3RlcCwgcGFyYW1zLnRpY2tDb3VudCk7XG5cbiAgICAgICAgLy8gMDQuIGxpbmXssKjtirjsnZgg6rK97JqwIOyCrOyaqeyekOydmCBtaW7qsJLsnbQgc2NhbGXsnZggbWlu6rCS6rO8IOqwmeydhCDqsr3smrAsIG1pbuqwkuydhCAxIHN0ZXAg6rCQ7IaMIOyLnO2CtFxuICAgICAgICBzY2FsZS5taW4gPSB0aGlzLl9hZGRNaW5QYWRkaW5nKHtcbiAgICAgICAgICAgIG1pbjogc2NhbGUubWluLFxuICAgICAgICAgICAgc3RlcDogc3RlcCxcbiAgICAgICAgICAgIHVzZXJNaW46IHBhcmFtcy51c2VyTWluLFxuICAgICAgICAgICAgbWluT3B0aW9uOiBwYXJhbXMub3B0aW9ucy5taW4sXG4gICAgICAgICAgICBjaGFydFR5cGU6IHBhcmFtcy5jaGFydFR5cGVcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gMDUuIOyCrOyaqeyekOydmCBtYXjqsJLsnbQgc2NhZWwgbWF47JmAIOqwmeydhCDqsr3smrAsIG1heOqwkuydhCAxIHN0ZXAg7Kad6rCAIOyLnO2CtFxuICAgICAgICBzY2FsZS5tYXggPSB0aGlzLl9hZGRNYXhQYWRkaW5nKHtcbiAgICAgICAgICAgIG1heDogc2NhbGUubWF4LFxuICAgICAgICAgICAgc3RlcDogc3RlcCxcbiAgICAgICAgICAgIHVzZXJNYXg6IHBhcmFtcy51c2VyTWF4LFxuICAgICAgICAgICAgbWF4T3B0aW9uOiBwYXJhbXMub3B0aW9ucy5tYXhcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gMDYuIGF4aXMgc2NhbGXsnbQg7IKs7Jqp7J6QIG1pbiwgbWF47JmAIOqxsOumrOqwgCDrqYAg6rK97JqwIOyhsOygiFxuICAgICAgICB0aWNrSW5mbyA9IHRoaXMuX21pbmltaXplVGlja1NjYWxlKHtcbiAgICAgICAgICAgIHVzZXJNaW46IHBhcmFtcy51c2VyTWluLFxuICAgICAgICAgICAgdXNlck1heDogcGFyYW1zLnVzZXJNYXgsXG4gICAgICAgICAgICB0aWNrSW5mbzoge3NjYWxlOiBzY2FsZSwgc3RlcDogc3RlcCwgdGlja0NvdW50OiBwYXJhbXMudGlja0NvdW50fSxcbiAgICAgICAgICAgIG9wdGlvbnM6IHBhcmFtcy5vcHRpb25zXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRpY2tJbmZvID0gdGhpcy5fZGl2aWRlVGlja1N0ZXAodGlja0luZm8sIHBhcmFtcy50aWNrQ291bnQpO1xuICAgICAgICByZXR1cm4gdGlja0luZm87XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZCBzY2FsZSBtaW4gcGFkZGluZy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwcmFtcyB7bnVtYmVyfSBwYXJhbXMubWluIHNjYWxlIG1pblxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy51c2VyTWluIG1pbmltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLm1pbk9wdGlvbiBtaW4gb3B0aW9uXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnN0ZXAgdGljayBzdGVwXG4gICAgICogQHJldHVybnMge251bWJlcn0gc2NhbGUgbWluXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYWRkTWluUGFkZGluZzogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBtaW4gPSBwYXJhbXMubWluO1xuXG4gICAgICAgIGlmIChwYXJhbXMuY2hhcnRUeXBlICE9PSBjaGFydENvbnN0LkNIQVJUX1RZUEVfTElORSB8fCAhbmUudXRpbC5pc1VuZGVmaW5lZChwYXJhbXMubWluT3B0aW9uKSkge1xuICAgICAgICAgICAgcmV0dXJuIG1pbjtcbiAgICAgICAgfVxuICAgICAgICAvLyBub3JtYWxpemXrkJwgc2NhbGUgbWlu6rCS7J20IHVzZXIgbWlu6rCS6rO8IOqwmeydhCDqsr3smrAgc3RlcCDqsJDshoxcbiAgICAgICAgaWYgKHBhcmFtcy5taW4gPT09IHBhcmFtcy51c2VyTWluKSB7XG4gICAgICAgICAgICBtaW4gLT0gcGFyYW1zLnN0ZXA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1pbjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIHNjYWxlIG1heCBwYWRkaW5nLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHByYW1zIHtudW1iZXJ9IHBhcmFtcy5tYXggc2NhbGUgbWF4XG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnVzZXJNYXggbWF4aW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubWF4T3B0aW9uIG1heCBvcHRpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuc3RlcCB0aWNrIHN0ZXBcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBzY2FsZSBtYXhcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hZGRNYXhQYWRkaW5nOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIG1heCA9IHBhcmFtcy5tYXg7XG4gICAgICAgIC8vIG5vcm1hbGl6ZeuQnCBzY2FsZSBtYXjqsJLsnbQgdXNlciBtYXjqsJLqs7wg6rCZ7J2EIOqyveyasCBzdGVwIOymneqwgFxuICAgICAgICBpZiAobmUudXRpbC5pc1VuZGVmaW5lZChwYXJhbXMubWF4T3B0aW9uKSAmJiAocGFyYW1zLm1heCA9PT0gcGFyYW1zLnVzZXJNYXgpKSB7XG4gICAgICAgICAgICBtYXggKz0gcGFyYW1zLnN0ZXA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1heDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbm9ybWFsaXplIG1pbi5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWluIG9yaWdpbmFsIG1pblxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdGVwIHRpY2sgc3RlcFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IG5vcm1hbGl6ZWQgbWluXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbm9ybWFsaXplTWluOiBmdW5jdGlvbihtaW4sIHN0ZXApIHtcbiAgICAgICAgdmFyIG1vZCA9IG5lLnV0aWwubW9kKG1pbiwgc3RlcCksXG4gICAgICAgICAgICBub3JtYWxpemVkO1xuXG4gICAgICAgIGlmIChtb2QgPT09IDApIHtcbiAgICAgICAgICAgIG5vcm1hbGl6ZWQgPSBtaW47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBub3JtYWxpemVkID0gbmUudXRpbC5zdWJ0cmFjdGlvbihtaW4sIChtaW4gPj0gMCA/IG1vZCA6IHN0ZXAgKyBtb2QpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbm9ybWFsaXplZDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBub3JtYWxpemVkIG1heC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge3ttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fSBzY2FsZSBzY2FsZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdGVwIHRpY2sgc3RlcFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB0aWNrQ291bnQgdGljayBjb3VudFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IG5vcm1hbGl6ZWQgbWF4XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZU5vcm1hbGl6ZWRNYXg6IGZ1bmN0aW9uKHNjYWxlLCBzdGVwLCB0aWNrQ291bnQpIHtcbiAgICAgICAgdmFyIG1pbk1heERpZmYgPSBuZS51dGlsLm11bHRpcGxpY2F0aW9uKHN0ZXAsIHRpY2tDb3VudCAtIDEpLFxuICAgICAgICAgICAgbm9ybWFsaXplZE1heCA9IG5lLnV0aWwuYWRkaXRpb24oc2NhbGUubWluLCBtaW5NYXhEaWZmKSxcbiAgICAgICAgICAgIG1heERpZmYgPSBzY2FsZS5tYXggLSBub3JtYWxpemVkTWF4LFxuICAgICAgICAgICAgbW9kRGlmZiwgZGl2aWRlRGlmZjtcbiAgICAgICAgLy8gbm9ybWFsaXpl65CcIG1heOqwkuydtCDsm5DrnpjsnZggbWF46rCSIOuztOuLpCDsnpHsnYQg6rK97JqwIHN0ZXDsnYQg7Kad6rCA7Iuc7LycIO2BsCDqsJLsnLzroZwg66eM65Ok6riwXG4gICAgICAgIGlmIChtYXhEaWZmID4gMCkge1xuICAgICAgICAgICAgbW9kRGlmZiA9IG1heERpZmYgJSBzdGVwO1xuICAgICAgICAgICAgZGl2aWRlRGlmZiA9IE1hdGguZmxvb3IobWF4RGlmZiAvIHN0ZXApO1xuICAgICAgICAgICAgbm9ybWFsaXplZE1heCArPSBzdGVwICogKG1vZERpZmYgPiAwID8gZGl2aWRlRGlmZiArIDEgOiBkaXZpZGVEaWZmKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbm9ybWFsaXplZE1heDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbm9ybWFsaXplIHNjYWxlLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7e21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19IHNjYWxlIGJhc2Ugc2NhbGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3RlcCB0aWNrIHN0ZXBcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdGlja0NvdW50IHRpY2sgY291bnRcbiAgICAgKiBAcmV0dXJucyB7e21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19IG5vcm1hbGl6ZWQgc2NhbGVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9ub3JtYWxpemVTY2FsZTogZnVuY3Rpb24oc2NhbGUsIHN0ZXAsIHRpY2tDb3VudCkge1xuICAgICAgICBzY2FsZS5taW4gPSB0aGlzLl9ub3JtYWxpemVNaW4oc2NhbGUubWluLCBzdGVwKTtcbiAgICAgICAgc2NhbGUubWF4ID0gdGhpcy5fbWFrZU5vcm1hbGl6ZWRNYXgoc2NhbGUsIHN0ZXAsIHRpY2tDb3VudCk7XG4gICAgICAgIHJldHVybiBzY2FsZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNhbmRpZGF0ZXMgYWJvdXQgdGljayBpbmZvLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5taW4gbWluaW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubWF4IG1heGltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxudW1iZXI+fSBwYXJhbXMudGlja0NvdW50cyB0aWNrIGNvdW50c1xuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5jaGFydFR5cGUgY2hhcnQgdHlwZVxuICAgICAqIEBwYXJhbSB7e21pbjogbnVtYmVyLCBtYXg6bnVtYmVyfX0gb3B0aW9ucyBheGlzIG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7YXJyYXl9IGNhbmRpZGF0ZXMgYWJvdXQgdGljayBpbmZvXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0Q2FuZGlkYXRlVGlja0luZm9zOiBmdW5jdGlvbihwYXJhbXMsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIHVzZXJNaW4gPSBwYXJhbXMubWluLFxuICAgICAgICAgICAgdXNlck1heCA9IHBhcmFtcy5tYXgsXG4gICAgICAgICAgICBtaW4gPSBwYXJhbXMubWluLFxuICAgICAgICAgICAgbWF4ID0gcGFyYW1zLm1heCxcbiAgICAgICAgICAgIHNjYWxlLCBjYW5kaWRhdGVzO1xuXG4gICAgICAgIC8vIG1pbiwgbWF466eM7Jy866GcIOq4sOuzuCBzY2FsZSDslrvquLBcbiAgICAgICAgc2NhbGUgPSB0aGlzLl9tYWtlQmFzZVNjYWxlKG1pbiwgbWF4LCBvcHRpb25zKTtcblxuICAgICAgICBjYW5kaWRhdGVzID0gbmUudXRpbC5tYXAocGFyYW1zLnRpY2tDb3VudHMsIGZ1bmN0aW9uKHRpY2tDb3VudCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21ha2VUaWNrSW5mbyh7XG4gICAgICAgICAgICAgICAgdGlja0NvdW50OiB0aWNrQ291bnQsXG4gICAgICAgICAgICAgICAgc2NhbGU6IG5lLnV0aWwuZXh0ZW5kKHt9LCBzY2FsZSksXG4gICAgICAgICAgICAgICAgdXNlck1pbjogdXNlck1pbixcbiAgICAgICAgICAgICAgICB1c2VyTWF4OiB1c2VyTWF4LFxuICAgICAgICAgICAgICAgIGNoYXJ0VHlwZTogcGFyYW1zLmNoYXJ0VHlwZSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIHJldHVybiBjYW5kaWRhdGVzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGJhc2Ugc2NhbGVcbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWluIG1pbmltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1heCBtYXhpbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7e21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19IG9wdGlvbnMgYXhpcyBvcHRpb25zXG4gICAgICogQHJldHVybnMge3ttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fSBiYXNlIHNjYWxlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUJhc2VTY2FsZTogZnVuY3Rpb24obWluLCBtYXgsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIGlzTWludXMgPSBmYWxzZSxcbiAgICAgICAgICAgIHRtcE1pbiwgc2NhbGU7XG5cbiAgICAgICAgaWYgKG1pbiA8IDAgJiYgbWF4IDw9IDApIHtcbiAgICAgICAgICAgIGlzTWludXMgPSB0cnVlO1xuICAgICAgICAgICAgdG1wTWluID0gbWluO1xuICAgICAgICAgICAgbWluID0gLW1heDtcbiAgICAgICAgICAgIG1heCA9IC10bXBNaW47XG4gICAgICAgIH1cblxuICAgICAgICBzY2FsZSA9IGNhbGN1bGF0b3IuY2FsY3VsYXRlU2NhbGUobWluLCBtYXgpO1xuXG4gICAgICAgIGlmIChpc01pbnVzKSB7XG4gICAgICAgICAgICB0bXBNaW4gPSBzY2FsZS5taW47XG4gICAgICAgICAgICBzY2FsZS5taW4gPSAtc2NhbGUubWF4O1xuICAgICAgICAgICAgc2NhbGUubWF4ID0gLXRtcE1pbjtcbiAgICAgICAgfVxuXG4gICAgICAgIHNjYWxlLm1pbiA9IG9wdGlvbnMubWluIHx8IHNjYWxlLm1pbjtcbiAgICAgICAgc2NhbGUubWF4ID0gb3B0aW9ucy5tYXggfHwgc2NhbGUubWF4O1xuXG4gICAgICAgIHJldHVybiBzY2FsZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRm9ybWF0IGxhYmVscy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBsYWJlbHMgdGFyZ2V0IGxhYmVsc1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb25bXX0gZm9ybWF0RnVuY3Rpb25zIGZvcm1hdCBmdW5jdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nW119IGZvcm1hdHRlZCBsYWJlbHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9mb3JtYXRMYWJlbHM6IGZ1bmN0aW9uKGxhYmVscywgZm9ybWF0RnVuY3Rpb25zKSB7XG4gICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgIGlmICghZm9ybWF0RnVuY3Rpb25zIHx8ICFmb3JtYXRGdW5jdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gbGFiZWxzO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdCA9IG5lLnV0aWwubWFwKGxhYmVscywgZnVuY3Rpb24obGFiZWwpIHtcbiAgICAgICAgICAgIHZhciBmbnMgPSBjb25jYXQuYXBwbHkoW2xhYmVsXSwgZm9ybWF0RnVuY3Rpb25zKTtcbiAgICAgICAgICAgIHJldHVybiBuZS51dGlsLnJlZHVjZShmbnMsIGZ1bmN0aW9uKHN0b3JlZCwgZm4pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZm4oc3RvcmVkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGF4aXNEYXRhTWFrZXI7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgQm91bmRzIG1ha2VyLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2FsY3VsYXRvciA9IHJlcXVpcmUoJy4vY2FsY3VsYXRvci5qcycpLFxuICAgIHJlbmRlclV0aWwgPSByZXF1aXJlKCcuL3JlbmRlclV0aWwuanMnKTtcblxudmFyIENIQVJUX1BBRERJTkcgPSAxMCxcbiAgICBUSVRMRV9BRERfUEFERElORyA9IDIwLFxuICAgIExFR0VORF9BUkVBX1BBRERJTkcgPSAxMCxcbiAgICBMRUdFTkRfUkVDVF9XSURUSCA9IDEyLFxuICAgIExFR0VORF9MQUJFTF9QQURESU5HX0xFRlQgPSA1LFxuICAgIEFYSVNfTEFCRUxfUEFERElORyA9IDcsXG4gICAgSElEREVOX1dJRFRIID0gMTtcblxudmFyIGNvbmNhdCA9IEFycmF5LnByb3RvdHlwZS5jb25jYXQ7XG5cbi8qKlxuICogQm91bmRzIG1ha2VyLlxuICogQG1vZHVsZSBib3VuZHNNYWtlclxuICovXG52YXIgYm91bmRzTWFrZXIgPSB7XG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBib3VuZHMgYWJvdXQgY2hhcnQgY29tcG9uZW50cy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmJvdW5kc01ha2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmNvbnZlcnREYXRhIGNvbnZlcnRlZCBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIGNoYXJ0IHRoZW1lXG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5pc1ZlcnRpY2FsIHdoZXRoZXIgdmVydGljYWwgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHt7XG4gICAgICogICBwbG90OiB7XG4gICAgICogICAgIGRpbWVuc2lvbjoge3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfSxcbiAgICAgKiAgICAgcG9zaXRpb246IHt0b3A6IG51bWJlciwgcmlnaHQ6IG51bWJlcn1cbiAgICAgKiAgIH0sXG4gICAgICogICB5QXhpczoge1xuICAgICAqICAgICBkaW1lbnNpb246IHt3aWR0aDogKG51bWJlciksIGhlaWdodDogbnVtYmVyfSxcbiAgICAgKiAgICAgcG9zaXRpb246IHt0b3A6IG51bWJlcn1cbiAgICAgKiAgIH0sXG4gICAgICogICB4QXhpczoge1xuICAgICAqICAgICBkaW1lbnNpb246IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IChudW1iZXIpfSxcbiAgICAgKiAgICAgcG9zaXRpb246IHtyaWdodDogbnVtYmVyfVxuICAgICAqICAgfSxcbiAgICAgKiAgIHNlcmllczoge1xuICAgICAqICAgICBkaW1lbnNpb246IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn0sXG4gICAgICogICAgIHBvc2l0aW9uOiB7dG9wOiBudW1iZXIsIHJpZ2h0OiBudW1iZXJ9XG4gICAgICogICB9LFxuICAgICAqICAgbGVnZW5kOiB7XG4gICAgICogICAgIHBvc2l0aW9uOiB7dG9wOiBudW1iZXJ9XG4gICAgICogICB9LFxuICAgICAqICAgdG9vbHRpcDoge1xuICAgICAqICAgICBkaW1lbnNpb246IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn0sXG4gICAgICogICAgIHBvc2l0aW9uOiB7dG9wOiBudW1iZXIsIGxlZnQ6IG51bWJlcn1cbiAgICAgKiAgIH1cbiAgICAgKiB9fSBib3VuZHNcbiAgICAgKi9cbiAgICBtYWtlOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGRpbWVuc2lvbnMgPSB0aGlzLl9nZXRDb21wb25lbnRzRGltZW5zaW9ucyhwYXJhbXMpLFxuICAgICAgICAgICAgeUF4aXNXaWR0aCA9IGRpbWVuc2lvbnMueUF4aXMud2lkdGgsXG4gICAgICAgICAgICB0b3AgPSBkaW1lbnNpb25zLnRpdGxlLmhlaWdodCArIENIQVJUX1BBRERJTkcsXG4gICAgICAgICAgICByaWdodCA9IGRpbWVuc2lvbnMubGVnZW5kLndpZHRoICsgZGltZW5zaW9ucy55ckF4aXMud2lkdGggKyBDSEFSVF9QQURESU5HLFxuICAgICAgICAgICAgYXhlc0JvdW5kcyA9IHRoaXMuX21ha2VBeGVzQm91bmRzKHtcbiAgICAgICAgICAgICAgICBoYXNBeGVzOiBwYXJhbXMuaGFzQXhlcyxcbiAgICAgICAgICAgICAgICB5QXhpc0NoYXJ0VHlwZXM6IHBhcmFtcy55QXhpc0NoYXJ0VHlwZXMsXG4gICAgICAgICAgICAgICAgZGltZW5zaW9uczogZGltZW5zaW9ucyxcbiAgICAgICAgICAgICAgICB0b3A6IHRvcCxcbiAgICAgICAgICAgICAgICByaWdodDogcmlnaHRcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgYm91bmRzID0gbmUudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgICAgIGNoYXJ0OiB7XG4gICAgICAgICAgICAgICAgICAgIGRpbWVuc2lvbjogZGltZW5zaW9ucy5jaGFydFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc2VyaWVzOiB7XG4gICAgICAgICAgICAgICAgICAgIGRpbWVuc2lvbjogZGltZW5zaW9ucy5zZXJpZXMsXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3A6IHRvcCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJpZ2h0OiByaWdodFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBsZWdlbmQ6IHtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogZGltZW5zaW9ucy50aXRsZS5oZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiB5QXhpc1dpZHRoICsgZGltZW5zaW9ucy5wbG90LndpZHRoICsgZGltZW5zaW9ucy55ckF4aXMud2lkdGggKyBDSEFSVF9QQURESU5HXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRvb2x0aXA6IHtcbiAgICAgICAgICAgICAgICAgICAgZGltZW5zaW9uOiBkaW1lbnNpb25zLnRvb2x0aXAsXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3A6IHRvcCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6IHlBeGlzV2lkdGggKyBDSEFSVF9QQURESU5HXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCBheGVzQm91bmRzKTtcbiAgICAgICAgcmV0dXJuIGJvdW5kcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IG1heCBsYWJlbCBvZiB2YWx1ZSBheGlzLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Ym91bmRzTWFrZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udmVydERhdGEgY29udmVydCBkYXRhXG4gICAgICogQHBhcmFtIHthcnJheS48c3RyaW5nPn0gY2hhcnRUeXBlcyBjaGFydCB0eXBlc1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBjaGFydCB0eXBlIGluZGV4XG4gICAgICogQHJldHVybnMge251bWJlcnxzdHJpbmd9IG1heCBsYWJlbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFZhbHVlQXhpc01heExhYmVsOiBmdW5jdGlvbihjb252ZXJ0RGF0YSwgY2hhcnRUeXBlcywgaW5kZXgpIHtcbiAgICAgICAgdmFyIGNoYXJ0VHlwZSA9IGNoYXJ0VHlwZXMgJiYgY2hhcnRUeXBlc1tpbmRleCB8fCAwXSB8fCAnJyxcbiAgICAgICAgICAgIHZhbHVlcyA9IGNoYXJ0VHlwZSAmJiBjb252ZXJ0RGF0YS52YWx1ZXNbY2hhcnRUeXBlXSA/IGNvbnZlcnREYXRhLnZhbHVlc1tjaGFydFR5cGVdIDogY29udmVydERhdGEuam9pblZhbHVlcyxcbiAgICAgICAgICAgIGZvcm1hdEZ1bmN0aW9ucyA9IGNvbnZlcnREYXRhLmZvcm1hdEZ1bmN0aW9ucyxcbiAgICAgICAgICAgIGZsYXR0ZW5WYWx1ZXMgPSBjb25jYXQuYXBwbHkoW10sIHZhbHVlcyksXG4gICAgICAgICAgICBtaW4gPSBuZS51dGlsLm1pbihmbGF0dGVuVmFsdWVzKSxcbiAgICAgICAgICAgIG1heCA9IG5lLnV0aWwubWF4KGZsYXR0ZW5WYWx1ZXMpLFxuICAgICAgICAgICAgc2NhbGUgPSBjYWxjdWxhdG9yLmNhbGN1bGF0ZVNjYWxlKG1pbiwgbWF4KSxcbiAgICAgICAgICAgIG1pbkxhYmVsID0gY2FsY3VsYXRvci5ub3JtYWxpemVBeGlzTnVtYmVyKHNjYWxlLm1pbiksXG4gICAgICAgICAgICBtYXhMYWJlbCA9IGNhbGN1bGF0b3Iubm9ybWFsaXplQXhpc051bWJlcihzY2FsZS5tYXgpLFxuICAgICAgICAgICAgZm5zID0gZm9ybWF0RnVuY3Rpb25zICYmIGZvcm1hdEZ1bmN0aW9ucy5zbGljZSgpIHx8IFtdO1xuICAgICAgICBtYXhMYWJlbCA9IChtaW5MYWJlbCArICcnKS5sZW5ndGggPiAobWF4TGFiZWwgKyAnJykubGVuZ3RoID8gbWluTGFiZWwgOiBtYXhMYWJlbDtcbiAgICAgICAgZm5zLnVuc2hpZnQobWF4TGFiZWwpO1xuICAgICAgICBtYXhMYWJlbCA9IG5lLnV0aWwucmVkdWNlKGZucywgZnVuY3Rpb24oc3RvcmVkLCBmbikge1xuICAgICAgICAgICAgcmV0dXJuIGZuKHN0b3JlZCk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gbWF4TGFiZWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBSZW5kZXJlZCBMYWJlbHMgTWF4IFNpemUod2lkdGggb3IgaGVpZ2h0KS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmJvdW5kc01ha2VyXG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gbGFiZWxzIGxhYmVsc1xuICAgICAqIEBwYXJhbSB7e2ZvbnRTaXplOiBudW1iZXIsIGZvbnRGYW1pbHk6IHN0cmluZywgY29sb3I6IHN0cmluZ319IHRoZW1lIGxhYmVsIHRoZW1lXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gaXRlcmF0ZWUgaXRlcmF0ZWVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBtYXggc2l6ZSAod2lkdGggb3IgaGVpZ2h0KVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFJlbmRlcmVkTGFiZWxzTWF4U2l6ZTogZnVuY3Rpb24obGFiZWxzLCB0aGVtZSwgaXRlcmF0ZWUpIHtcbiAgICAgICAgdmFyIHNpemVzID0gbmUudXRpbC5tYXAobGFiZWxzLCBmdW5jdGlvbihsYWJlbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpdGVyYXRlZShsYWJlbCwgdGhlbWUpO1xuICAgICAgICAgICAgfSwgdGhpcyksXG4gICAgICAgICAgICBtYXhTaXplID0gbmUudXRpbC5tYXgoc2l6ZXMpO1xuICAgICAgICByZXR1cm4gbWF4U2l6ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHJlbmRlcmVkIGxhYmVscyBtYXggd2lkdGguXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpib3VuZHNNYWtlclxuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IGxhYmVscyBsYWJlbHNcbiAgICAgKiBAcGFyYW0ge3tmb250U2l6ZTogbnVtYmVyLCBmb250RmFtaWx5OiBzdHJpbmcsIGNvbG9yOiBzdHJpbmd9fSB0aGVtZSBsYWJlbCB0aGVtZVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IG1heCB3aWR0aFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFJlbmRlcmVkTGFiZWxzTWF4V2lkdGg6IGZ1bmN0aW9uKGxhYmVscywgdGhlbWUpIHtcbiAgICAgICAgdmFyIGl0ZXJhdGVlID0gbmUudXRpbC5iaW5kKHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbFdpZHRoLCByZW5kZXJVdGlsKSxcbiAgICAgICAgICAgIG1heFdpZHRoID0gdGhpcy5fZ2V0UmVuZGVyZWRMYWJlbHNNYXhTaXplKGxhYmVscywgdGhlbWUsIGl0ZXJhdGVlKTtcbiAgICAgICAgcmV0dXJuIG1heFdpZHRoO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgcmVuZGVyZWQgbGFiZWxzIG1heCBoZWlnaHQuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpib3VuZHNNYWtlclxuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IGxhYmVscyBsYWJlbHNcbiAgICAgKiBAcGFyYW0ge3tmb250U2l6ZTogbnVtYmVyLCBmb250RmFtaWx5OiBzdHJpbmcsIGNvbG9yOiBzdHJpbmd9fSB0aGVtZSBsYWJlbCB0aGVtZVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IG1heCBoZWlnaHRcbiAgICAgKi9cbiAgICBfZ2V0UmVuZGVyZWRMYWJlbHNNYXhIZWlnaHQ6IGZ1bmN0aW9uKGxhYmVscywgdGhlbWUpIHtcbiAgICAgICAgdmFyIGl0ZXJhdGVlID0gbmUudXRpbC5iaW5kKHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodCwgcmVuZGVyVXRpbCksXG4gICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9nZXRSZW5kZXJlZExhYmVsc01heFNpemUobGFiZWxzLCB0aGVtZSwgaXRlcmF0ZWUpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgd2lkdGggb2YgdmVydGljYWwgYXhpcyBhcmVhLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Ym91bmRzTWFrZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGl0bGUgYXhpcyB0aXRsZSxcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBsYWJlbHMgYXhpcyBsYWJlbHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgYXhpcyB0aGVtZVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IHdpZHRoXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0VmVydGljYWxBeGlzV2lkdGg6IGZ1bmN0aW9uKHRpdGxlLCBsYWJlbHMsIHRoZW1lKSB7XG4gICAgICAgIHZhciB0aXRsZUFyZWFXaWR0aCA9IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodCh0aXRsZSwgdGhlbWUudGl0bGUpICsgVElUTEVfQUREX1BBRERJTkcsXG4gICAgICAgICAgICB3aWR0aCA9IHRoaXMuX2dldFJlbmRlcmVkTGFiZWxzTWF4V2lkdGgobGFiZWxzLCB0aGVtZS5sYWJlbCkgKyB0aXRsZUFyZWFXaWR0aCArIEFYSVNfTEFCRUxfUEFERElORztcbiAgICAgICAgcmV0dXJuIHdpZHRoO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgaGVpZ2h0IG9mIGhvcml6b250YWwgYXhpcyBhcmVhLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Ym91bmRzTWFrZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGl0bGUgYXhpcyB0aXRsZSxcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBsYWJlbHMgYXhpcyBsYWJlbHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgYXhpcyB0aGVtZVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IGhlaWdodFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldEhvcml6b250YWxBeGlzSGVpZ2h0OiBmdW5jdGlvbih0aXRsZSwgbGFiZWxzLCB0aGVtZSkge1xuICAgICAgICB2YXIgdGl0bGVBcmVhSGVpZ2h0ID0gcmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsSGVpZ2h0KHRpdGxlLCB0aGVtZS50aXRsZSkgKyBUSVRMRV9BRERfUEFERElORyxcbiAgICAgICAgICAgIGhlaWdodCA9IHRoaXMuX2dldFJlbmRlcmVkTGFiZWxzTWF4SGVpZ2h0KGxhYmVscywgdGhlbWUubGFiZWwpICsgdGl0bGVBcmVhSGVpZ2h0O1xuICAgICAgICByZXR1cm4gaGVpZ2h0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgd2lkdGggYWJvdXQgeSBheGlzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB5QXhpc09wdGlvbiB5IGF4aXMgb3B0aW9uXG4gICAgICogQHBhcmFtIHthcnJheS48c3RyaW5nPn0gbGFiZWxzIGxhYmVsc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSB5QXhpcyB0aGVtZVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IHkgYXhpcyB3aWR0aFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFlBeGlzV2lkdGg6IGZ1bmN0aW9uKHlBeGlzT3B0aW9uLCBsYWJlbHMsIHRoZW1lKSB7XG4gICAgICAgIHZhciB5QXhpc09wdGlvbnMsXG4gICAgICAgICAgICB0aXRsZSA9ICcnO1xuXG4gICAgICAgIGlmICh5QXhpc09wdGlvbikge1xuICAgICAgICAgICAgeUF4aXNPcHRpb25zID0gW10uY29uY2F0KHlBeGlzT3B0aW9uKTtcbiAgICAgICAgICAgIHRpdGxlID0geUF4aXNPcHRpb25zWzBdLnRpdGxlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldFZlcnRpY2FsQXhpc1dpZHRoKHRpdGxlLCBsYWJlbHMsIHRoZW1lKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHdpZHRoIGFib3V0IHkgcmlnaHQgYXhpcy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmJvdW5kc01ha2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBwYXJhbXMueUF4aXNDaGFydFR5cGVzIGNoYXJ0IHR5cGVzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIGNoYXJ0IHRoZW1lXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IHkgcmlnaHQgYXhpcyB3aWR0aFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFlSQXhpc1dpZHRoOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIHlBeGlzQ2hhcnRUeXBlcyA9IHBhcmFtcy55QXhpc0NoYXJ0VHlwZXMgfHwgW10sXG4gICAgICAgICAgICByaWdodFlBeGlzV2lkdGggPSAwLFxuICAgICAgICAgICAgeUF4aXNUaGVtZXMsIHlBeGlzVGhlbWUsIHlBeGlzT3B0aW9ucywgaW5kZXgsIGxhYmVscywgdGl0bGU7XG4gICAgICAgIGluZGV4ID0geUF4aXNDaGFydFR5cGVzLmxlbmd0aCAtIDE7XG4gICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgICB5QXhpc1RoZW1lcyA9IFtdLmNvbmNhdChwYXJhbXMudGhlbWUueUF4aXMpO1xuICAgICAgICAgICAgeUF4aXNPcHRpb25zID0gW10uY29uY2F0KHBhcmFtcy5vcHRpb25zLnlBeGlzKTtcbiAgICAgICAgICAgIHRpdGxlID0geUF4aXNPcHRpb25zW2luZGV4XSAmJiB5QXhpc09wdGlvbnNbaW5kZXhdLnRpdGxlO1xuICAgICAgICAgICAgbGFiZWxzID0gW3RoaXMuX2dldFZhbHVlQXhpc01heExhYmVsKHBhcmFtcy5jb252ZXJ0RGF0YSwgeUF4aXNDaGFydFR5cGVzLCBpbmRleCldO1xuICAgICAgICAgICAgeUF4aXNUaGVtZSA9IHlBeGlzVGhlbWVzLmxlbmd0aCA9PT0gMSA/IHlBeGlzVGhlbWVzWzBdIDogeUF4aXNUaGVtZXNbaW5kZXhdO1xuICAgICAgICAgICAgcmlnaHRZQXhpc1dpZHRoID0gdGhpcy5fZ2V0VmVydGljYWxBeGlzV2lkdGgodGl0bGUsIGxhYmVscywgeUF4aXNUaGVtZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJpZ2h0WUF4aXNXaWR0aDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBheGVzIGRpbWVuc2lvbi5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmJvdW5kc01ha2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmNvbnZlcnREYXRhIGNvbnZlcnRlZCBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIGNoYXJ0IHRoZW1lXG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5pc1ZlcnRpY2FsIHdoZXRoZXIgdmVydGljYWwgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHt7XG4gICAgICogICAgICB5QXhpczoge3dpZHRoOiBudW1iZXJ9LFxuICAgICAqICAgICAgeXJBeGlzOiB7d2lkdGg6IG51bWJlcn0sXG4gICAgICogICAgICB4QXhpczoge2hlaWdodDogbnVtYmVyfVxuICAgICAqIH19IGF4ZXMgZGltZW5zaW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUF4ZXNEaW1lbnNpb246IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgdGhlbWUsIG9wdGlvbnMsIGNvbnZlcnREYXRhLCB5QXhpc0NoYXJ0VHlwZXMsXG4gICAgICAgICAgICB5QXhpc1RpdGxlLCB4QXhpc1RpdGxlLCBtYXhMYWJlbCwgdkxhYmVscywgaExhYmVscyxcbiAgICAgICAgICAgIHlBeGlzV2lkdGgsIHhBeGlzSGVpZ2h0LCB5ckF4aXNXaWR0aDtcbiAgICAgICAgaWYgKCFwYXJhbXMuaGFzQXhlcykge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB5QXhpczoge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogMFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgeXJBeGlzOiB7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAwXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB4QXhpczoge1xuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IDBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgdGhlbWUgPSBwYXJhbXMudGhlbWU7XG4gICAgICAgIG9wdGlvbnMgPSBwYXJhbXMub3B0aW9ucztcbiAgICAgICAgY29udmVydERhdGEgPSBwYXJhbXMuY29udmVydERhdGE7XG4gICAgICAgIHlBeGlzQ2hhcnRUeXBlcyA9IHBhcmFtcy55QXhpc0NoYXJ0VHlwZXM7XG4gICAgICAgIHhBeGlzVGl0bGUgPSBvcHRpb25zLnhBeGlzICYmIG9wdGlvbnMueEF4aXMudGl0bGU7XG4gICAgICAgIG1heExhYmVsID0gdGhpcy5fZ2V0VmFsdWVBeGlzTWF4TGFiZWwoY29udmVydERhdGEsIHlBeGlzQ2hhcnRUeXBlcyk7XG4gICAgICAgIHZMYWJlbHMgPSBwYXJhbXMuaXNWZXJ0aWNhbCA/IFttYXhMYWJlbF0gOiBjb252ZXJ0RGF0YS5sYWJlbHM7XG4gICAgICAgIGhMYWJlbHMgPSBwYXJhbXMuaXNWZXJ0aWNhbCA/IGNvbnZlcnREYXRhLmxhYmVscyA6IFttYXhMYWJlbF07XG4gICAgICAgIHlBeGlzV2lkdGggPSB0aGlzLl9nZXRZQXhpc1dpZHRoKG9wdGlvbnMueUF4aXMsIHZMYWJlbHMsIHRoZW1lLnlBeGlzKTtcbiAgICAgICAgeEF4aXNIZWlnaHQgPSB0aGlzLl9nZXRIb3Jpem9udGFsQXhpc0hlaWdodCh4QXhpc1RpdGxlLCBoTGFiZWxzLCB0aGVtZS54QXhpcyk7XG4gICAgICAgIHlyQXhpc1dpZHRoID0gdGhpcy5fZ2V0WVJBeGlzV2lkdGgoe1xuICAgICAgICAgICAgY29udmVydERhdGE6IGNvbnZlcnREYXRhLFxuICAgICAgICAgICAgeUF4aXNDaGFydFR5cGVzOiB5QXhpc0NoYXJ0VHlwZXMsXG4gICAgICAgICAgICB0aGVtZTogdGhlbWUsXG4gICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB5QXhpczoge1xuICAgICAgICAgICAgICAgIHdpZHRoOiB5QXhpc1dpZHRoXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgeXJBeGlzOiB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IHlyQXhpc1dpZHRoXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgeEF4aXM6IHtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IHhBeGlzSGVpZ2h0XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB3aWR0aCBvZiBsZWdlbmQgYXJlYS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmJvdW5kc01ha2VyXG4gICAgICogQHBhcmFtIHthcnJheS48c3RyaW5nPn0gam9pbkxlZ2VuZExhYmVscyBsZWdlbmQgbGFiZWxzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGxhYmVsVGhlbWUgbGFiZWwgdGhlbWVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSB3aWR0aFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldExlZ2VuZEFyZWFXaWR0aDogZnVuY3Rpb24oam9pbkxlZ2VuZExhYmVscywgbGFiZWxUaGVtZSkge1xuICAgICAgICB2YXIgbGVnZW5kTGFiZWxzID0gbmUudXRpbC5tYXAoam9pbkxlZ2VuZExhYmVscywgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpdGVtLmxhYmVsO1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBtYXhMYWJlbFdpZHRoID0gdGhpcy5fZ2V0UmVuZGVyZWRMYWJlbHNNYXhXaWR0aChsZWdlbmRMYWJlbHMsIGxhYmVsVGhlbWUpLFxuICAgICAgICAgICAgbGVnZW5kV2lkdGggPSBtYXhMYWJlbFdpZHRoICsgTEVHRU5EX1JFQ1RfV0lEVEggK1xuICAgICAgICAgICAgICAgIExFR0VORF9MQUJFTF9QQURESU5HX0xFRlQgKyAoTEVHRU5EX0FSRUFfUEFERElORyAqIDIpO1xuICAgICAgICByZXR1cm4gbGVnZW5kV2lkdGg7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2Ugc2VyaWVzIGRpbWVuc2lvbi5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmJvdW5kc01ha2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IHBhcmFtcy5jaGFydERpbWVuc2lvbiBjaGFydCBkaW1lbnNpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7e1xuICAgICAqICAgICAgICAgIHlBeGlzOiB7d2lkdGg6IG51bWJlciwgaGVpZ2h0Om51bWJlcn0sXG4gICAgICogICAgICAgICAgeEF4aXM6IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6bnVtYmVyfSxcbiAgICAgKiAgICAgICAgICB5ckF4aXM6IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6bnVtYmVyfVxuICAgICAqICAgICAgfX0gcGFyYW1zLmF4ZXNEaW1lbnNpb24gYXhlcyBkaW1lbnNpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubGVnZW5kV2lkdGggbGVnZW5kIHdpZHRoXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnRpdGxlSGVpZ2h0IHRpdGxlIGhlaWdodFxuICAgICAqIEByZXR1cm5zIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBzZXJpZXMgZGltZW5zaW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVNlcmllc0RpbWVuc2lvbjogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBheGVzRGltZW5zaW9uID0gcGFyYW1zLmF4ZXNEaW1lbnNpb24sXG4gICAgICAgICAgICByaWdodEFyZWFXaWR0aCA9IHBhcmFtcy5sZWdlbmRXaWR0aCArIGF4ZXNEaW1lbnNpb24ueXJBeGlzLndpZHRoLFxuICAgICAgICAgICAgd2lkdGggPSBwYXJhbXMuY2hhcnREaW1lbnNpb24ud2lkdGggLSAoQ0hBUlRfUEFERElORyAqIDIpIC0gYXhlc0RpbWVuc2lvbi55QXhpcy53aWR0aCAtIHJpZ2h0QXJlYVdpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0ID0gcGFyYW1zLmNoYXJ0RGltZW5zaW9uLmhlaWdodCAtIChDSEFSVF9QQURESU5HICogMikgLSBwYXJhbXMudGl0bGVIZWlnaHQgLSBheGVzRGltZW5zaW9uLnhBeGlzLmhlaWdodDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogaGVpZ2h0XG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjb21wb25lbnRzIGRpbWVuc2lvblxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Ym91bmRzTWFrZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuY29udmVydERhdGEgY29udmVydGVkIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgY2hhcnQgdGhlbWVcbiAgICAgKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gcGFyYW1zLmlzVmVydGljYWwgd2hldGhlciB2ZXJ0aWNhbCBvciBub3RcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMub3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogQHJldHVybnMge09iamVjdH0gY29tcG9uZW50cyBkaW1lbnNpb25zXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0Q29tcG9uZW50c0RpbWVuc2lvbnM6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgdGhlbWUgPSBwYXJhbXMudGhlbWUsXG4gICAgICAgICAgICBvcHRpb25zID0gcGFyYW1zLm9wdGlvbnMsXG4gICAgICAgICAgICBjb252ZXJ0RGF0YSA9IHBhcmFtcy5jb252ZXJ0RGF0YSxcbiAgICAgICAgICAgIGNoYXJ0T3B0aW9ucyA9IG9wdGlvbnMuY2hhcnQgfHwge30sXG4gICAgICAgICAgICBjaGFydERpbWVuc2lvbiA9IHtcbiAgICAgICAgICAgICAgICB3aWR0aDogY2hhcnRPcHRpb25zLndpZHRoIHx8IDUwMCxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IGNoYXJ0T3B0aW9ucy5oZWlnaHQgfHwgNDAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYXhlc0RpbWVuc2lvbiwgdGl0bGVIZWlnaHQsIGxlZ2VuZFdpZHRoLCBzZXJpZXNEaW1lbnNpb24sIGRpbWVuc2lvbnM7XG5cbiAgICAgICAgYXhlc0RpbWVuc2lvbiA9IHRoaXMuX21ha2VBeGVzRGltZW5zaW9uKHBhcmFtcyk7XG4gICAgICAgIHRpdGxlSGVpZ2h0ID0gcmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsSGVpZ2h0KGNoYXJ0T3B0aW9ucy50aXRsZSwgdGhlbWUudGl0bGUpICsgVElUTEVfQUREX1BBRERJTkc7XG4gICAgICAgIGxlZ2VuZFdpZHRoID0gdGhpcy5fZ2V0TGVnZW5kQXJlYVdpZHRoKGNvbnZlcnREYXRhLmpvaW5MZWdlbmRMYWJlbHMsIHRoZW1lLmxlZ2VuZC5sYWJlbCk7XG4gICAgICAgIHNlcmllc0RpbWVuc2lvbiA9IHRoaXMuX21ha2VTZXJpZXNEaW1lbnNpb24oe1xuICAgICAgICAgICAgY2hhcnREaW1lbnNpb246IGNoYXJ0RGltZW5zaW9uLFxuICAgICAgICAgICAgYXhlc0RpbWVuc2lvbjogYXhlc0RpbWVuc2lvbixcbiAgICAgICAgICAgIGxlZ2VuZFdpZHRoOiBsZWdlbmRXaWR0aCxcbiAgICAgICAgICAgIHRpdGxlSGVpZ2h0OiB0aXRsZUhlaWdodFxuICAgICAgICB9KTtcbiAgICAgICAgZGltZW5zaW9ucyA9IG5lLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgIGNoYXJ0OiBjaGFydERpbWVuc2lvbixcbiAgICAgICAgICAgIHRpdGxlOiB7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiB0aXRsZUhlaWdodFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBsb3Q6IHNlcmllc0RpbWVuc2lvbixcbiAgICAgICAgICAgIHNlcmllczogc2VyaWVzRGltZW5zaW9uLFxuICAgICAgICAgICAgbGVnZW5kOiB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IGxlZ2VuZFdpZHRoXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdG9vbHRpcDogc2VyaWVzRGltZW5zaW9uXG4gICAgICAgIH0sIGF4ZXNEaW1lbnNpb24pO1xuICAgICAgICByZXR1cm4gZGltZW5zaW9ucztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBheGVzIGJvdW5kcy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmJvdW5kc01ha2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5oYXNBeGVzIHdoZXRoZXIgaGFzIGF4ZWQgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBwYXJhbXMueUF4aXNDaGFydFR5cGVzIHkgYXhpcyBjaGFydCB0eXBlc1xuICAgICAqICAgICAgQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBwYXJhbXMuZGltZW5zaW9uIGNoYXJ0IGRpbWVuc2lvblxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy50b3AgdG9wIHBvc2l0aW9uXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnJpZ2h0IHJpZ2h0IHBvc2l0aW9uXG4gICAgICogQHJldHVybnMge29iamVjdH0gYXhlcyBib3VuZHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQXhlc0JvdW5kczogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBib3VuZHMsIGRpbWVuc2lvbnMsIHlBeGlzQ2hhcnRUeXBlcywgdG9wLCByaWdodDtcblxuICAgICAgICBpZiAoIXBhcmFtcy5oYXNBeGVzKSB7XG4gICAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgIH1cblxuICAgICAgICBkaW1lbnNpb25zID0gcGFyYW1zLmRpbWVuc2lvbnM7XG4gICAgICAgIHlBeGlzQ2hhcnRUeXBlcyA9IHBhcmFtcy55QXhpc0NoYXJ0VHlwZXM7XG4gICAgICAgIHRvcCA9IHBhcmFtcy50b3A7XG4gICAgICAgIHJpZ2h0ID0gcGFyYW1zLnJpZ2h0O1xuICAgICAgICBib3VuZHMgPSB7XG4gICAgICAgICAgICBwbG90OiB7XG4gICAgICAgICAgICAgICAgZGltZW5zaW9uOiBkaW1lbnNpb25zLnBsb3QsXG4gICAgICAgICAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgdG9wOiB0b3AsXG4gICAgICAgICAgICAgICAgICAgIHJpZ2h0OiByaWdodFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB5QXhpczoge1xuICAgICAgICAgICAgICAgIGRpbWVuc2lvbjoge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogZGltZW5zaW9ucy55QXhpcy53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBkaW1lbnNpb25zLnBsb3QuaGVpZ2h0XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICB0b3A6IHRvcCxcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogQ0hBUlRfUEFERElORyArIEhJRERFTl9XSURUSFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB4QXhpczoge1xuICAgICAgICAgICAgICAgIGRpbWVuc2lvbjoge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogZGltZW5zaW9ucy5wbG90LndpZHRoLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IGRpbWVuc2lvbnMueEF4aXMuaGVpZ2h0XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICB0b3A6IHRvcCArIGRpbWVuc2lvbnMucGxvdC5oZWlnaHQgLSBISURERU5fV0lEVEgsXG4gICAgICAgICAgICAgICAgICAgIHJpZ2h0OiByaWdodFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoeUF4aXNDaGFydFR5cGVzICYmIHlBeGlzQ2hhcnRUeXBlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGJvdW5kcy55ckF4aXMgPSB7XG4gICAgICAgICAgICAgICAgZGltZW5zaW9uOiB7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiBkaW1lbnNpb25zLnlyQXhpcy53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBkaW1lbnNpb25zLnBsb3QuaGVpZ2h0XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICB0b3A6IHRvcCxcbiAgICAgICAgICAgICAgICAgICAgcmlnaHQ6IGRpbWVuc2lvbnMubGVnZW5kLndpZHRoICsgQ0hBUlRfUEFERElORyArIEhJRERFTl9XSURUSFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYm91bmRzO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gYm91bmRzTWFrZXI7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgY2FsY3VsYXRvci5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIEFYSVNfU1RBTkRBUkRfTVVMVElQTEVfTlVNUyA9IFsxLCAyLCA1LCAxMF07XG5cbi8qKlxuICogQ2FsY3VsYXRvci5cbiAqIEBtb2R1bGUgY2FsY3VsYXRvclxuICovXG52YXIgY2FsY3VsYXRvciA9IHtcbiAgICAvKipcbiAgICAgKiBDYWxjdWxhdGUgc2NhbGUgZnJvbSBjaGFydCBtaW4sIG1heCBkYXRhLlxuICAgICAqICAtIGh0dHA6Ly9wZWx0aWVydGVjaC5jb20vaG93LWV4Y2VsLWNhbGN1bGF0ZXMtYXV0b21hdGljLWNoYXJ0LWF4aXMtbGltaXRzL1xuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Y2FsY3VsYXRvclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtaW4gbWluIG1pbmltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1heCBtYXggbWF4aW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdGlja0NvdW50IHRpY2sgY291bnRcbiAgICAgKiBAcmV0dXJucyB7e21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19IHNjYWxlIGF4aXMgc2NhbGVcbiAgICAgKi9cbiAgICBjYWxjdWxhdGVTY2FsZTogZnVuY3Rpb24obWluLCBtYXgpIHtcbiAgICAgICAgdmFyIHNhdmVNaW4gPSAwLFxuICAgICAgICAgICAgc2NhbGUgPSB7fSxcbiAgICAgICAgICAgIGlvZFZhbHVlOyAvLyBpbmNyZWFzZSBvciBkZWNyZWFzZSB2YWx1ZTtcblxuICAgICAgICBpZiAobWluIDwgMCkge1xuICAgICAgICAgICAgc2F2ZU1pbiA9IG1pbjtcbiAgICAgICAgICAgIG1heCAtPSBtaW47XG4gICAgICAgICAgICBtaW4gPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgaW9kVmFsdWUgPSAobWF4IC0gbWluKSAvIDIwO1xuICAgICAgICBzY2FsZS5tYXggPSBtYXggKyBpb2RWYWx1ZSArIHNhdmVNaW47XG5cbiAgICAgICAgaWYgKG1heCAvIDYgPiBtaW4pIHtcbiAgICAgICAgICAgIHNjYWxlLm1pbiA9IDAgKyBzYXZlTWluO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2NhbGUubWluID0gbWluIC0gaW9kVmFsdWUgKyBzYXZlTWluO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzY2FsZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbm9ybWFsaXplIG51bWJlci5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmNhbGN1bGF0b3JcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgdGFyZ2V0IHZhbHVlXG4gICAgICogQHJldHVybnMge251bWJlcn0gbm9ybWFsaXplZCBudW1iZXJcbiAgICAgKi9cbiAgICBub3JtYWxpemVBeGlzTnVtYmVyOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICB2YXIgc3RhbmRhcmQgPSAwLFxuICAgICAgICAgICAgZmxhZyA9IDEsXG4gICAgICAgICAgICBub3JtYWxpemVkLCBtb2Q7XG5cbiAgICAgICAgaWYgKHZhbHVlID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH0gZWxzZSBpZiAodmFsdWUgPCAwKSB7XG4gICAgICAgICAgICBmbGFnID0gLTE7XG4gICAgICAgIH1cblxuICAgICAgICB2YWx1ZSAqPSBmbGFnO1xuXG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KEFYSVNfU1RBTkRBUkRfTVVMVElQTEVfTlVNUywgZnVuY3Rpb24obnVtKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgPCBudW0pIHtcbiAgICAgICAgICAgICAgICBpZiAobnVtID4gMSkge1xuICAgICAgICAgICAgICAgICAgICBzdGFuZGFyZCA9IG51bTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChudW0gPT09IDEwKSB7XG4gICAgICAgICAgICAgICAgc3RhbmRhcmQgPSAxMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHN0YW5kYXJkIDwgMSkge1xuICAgICAgICAgICAgbm9ybWFsaXplZCA9IHRoaXMubm9ybWFsaXplQXhpc051bWJlcih2YWx1ZSAqIDEwKSAqIDAuMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1vZCA9IG5lLnV0aWwubW9kKHZhbHVlLCBzdGFuZGFyZCk7XG4gICAgICAgICAgICBub3JtYWxpemVkID0gbmUudXRpbC5hZGRpdGlvbih2YWx1ZSwgKG1vZCA+IDAgPyBzdGFuZGFyZCAtIG1vZCA6IDApKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBub3JtYWxpemVkICo9IGZsYWc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIE1ha2UgdGljayBwb3NpdGlvbnMgb2YgcGl4ZWwgdHlwZS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmNhbGN1bGF0b3JcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc2l6ZSBhcmVhIHdpZHRoIG9yIGhlaWdodFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjb3VudCB0aWNrIGNvdW50XG4gICAgICogQHJldHVybnMge2FycmF5LjxudW1iZXI+fSBwb3NpdGlvbnNcbiAgICAgKi9cbiAgICBtYWtlUGl4ZWxQb3NpdGlvbnM6IGZ1bmN0aW9uKHNpemUsIGNvdW50KSB7XG4gICAgICAgIHZhciBwb3NpdGlvbnMgPSBbXSxcbiAgICAgICAgICAgIHB4U2NhbGUsIHB4U3RlcDtcblxuICAgICAgICBpZiAoY291bnQgPiAwKSB7XG4gICAgICAgICAgICBweFNjYWxlID0ge21pbjogMCwgbWF4OiBzaXplIC0gMX07XG4gICAgICAgICAgICBweFN0ZXAgPSB0aGlzLmdldFNjYWxlU3RlcChweFNjYWxlLCBjb3VudCk7XG4gICAgICAgICAgICBwb3NpdGlvbnMgPSBuZS51dGlsLm1hcChuZS51dGlsLnJhbmdlKDAsIHNpemUsIHB4U3RlcCksIGZ1bmN0aW9uKHBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdGgucm91bmQocG9zaXRpb24pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBwb3NpdGlvbnNbcG9zaXRpb25zLmxlbmd0aCAtIDFdID0gc2l6ZSAtIDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBvc2l0aW9ucztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBsYWJlbHMgZnJvbSBzY2FsZS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmNhbGN1bGF0b3JcbiAgICAgKiBAcGFyYW0ge3ttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fSBzY2FsZSBheGlzIHNjYWxlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHN0ZXAgc3RlcCBiZXR3ZWVuIG1heCBhbmQgbWluXG4gICAgICogQHJldHVybnMge3N0cmluZ1tdfSBsYWJlbHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIG1ha2VMYWJlbHNGcm9tU2NhbGU6IGZ1bmN0aW9uKHNjYWxlLCBzdGVwKSB7XG4gICAgICAgIHZhciBtdWx0aXBsZU51bSA9IG5lLnV0aWwuZmluZE11bHRpcGxlTnVtKHN0ZXApLFxuICAgICAgICAgICAgbWluID0gc2NhbGUubWluICogbXVsdGlwbGVOdW0sXG4gICAgICAgICAgICBtYXggPSBzY2FsZS5tYXggKiBtdWx0aXBsZU51bSxcbiAgICAgICAgICAgIGxhYmVscyA9IG5lLnV0aWwucmFuZ2UobWluLCBtYXggKyAxLCBzdGVwICogbXVsdGlwbGVOdW0pO1xuICAgICAgICBsYWJlbHMgPSBuZS51dGlsLm1hcChsYWJlbHMsIGZ1bmN0aW9uKGxhYmVsKSB7XG4gICAgICAgICAgICByZXR1cm4gbGFiZWwgLyBtdWx0aXBsZU51bTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBsYWJlbHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBzY2FsZSBzdGVwLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Y2FsY3VsYXRvclxuICAgICAqIEBwYXJhbSB7e21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19IHNjYWxlIGF4aXMgc2NhbGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gY291bnQgdmFsdWUgY291bnRcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBzY2FsZSBzdGVwXG4gICAgICovXG4gICAgZ2V0U2NhbGVTdGVwOiBmdW5jdGlvbihzY2FsZSwgY291bnQpIHtcbiAgICAgICAgcmV0dXJuIChzY2FsZS5tYXggLSBzY2FsZS5taW4pIC8gKGNvdW50IC0gMSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFycmF5IHBpdm90LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Y2FsY3VsYXRvclxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gYXJyMmQgdGFyZ2V0IDJkIGFycmF5XG4gICAgICogQHJldHVybnMge2FycmF5LjxhcnJheT59IHBpdm90ZWQgMmQgYXJyYXlcbiAgICAgKi9cbiAgICBhcnJheVBpdm90OiBmdW5jdGlvbihhcnIyZCkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KGFycjJkLCBmdW5jdGlvbihhcnIpIHtcbiAgICAgICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KGFyciwgZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgaWYgKCFyZXN1bHRbaW5kZXhdKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFtpbmRleF0gPSBbXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVzdWx0W2luZGV4XS5wdXNoKHZhbHVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNhbGN1bGF0b3I7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgRGF0YSBjb252ZXJ0ZXIuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBjYWxjdWxhdG9yID0gcmVxdWlyZSgnLi9jYWxjdWxhdG9yLmpzJyk7XG5cbnZhciBjb25jYXQgPSBBcnJheS5wcm90b3R5cGUuY29uY2F0O1xuXG4vKipcbiAqIERhdGEgY29udmVydGVyLlxuICogQG1vZHVsZSBkYXRhQ29udmVydGVyXG4gKi9cbnZhciBkYXRhQ29udmVydGVyID0ge1xuICAgIC8qKlxuICAgICAqIENvbnZlcnQgdXNlciBkYXRhLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gdXNlckRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY2hhcnRPcHRpb25zIGNoYXJ0IG9wdGlvblxuICAgICAqIEByZXR1cm5zIHt7XG4gICAgICogICAgICBsYWJlbHM6IGFycmF5LjxzdHJpbmc+LFxuICAgICAqICAgICAgdmFsdWVzOiBhcnJheS48bnVtYmVyPixcbiAgICAgKiAgICAgIGxlZ2VuZExhYmVsczogYXJyYXkuPHN0cmluZz4sXG4gICAgICogICAgICBmb3JtYXRGdW5jdGlvbnM6IGFycmF5LjxmdW5jdGlvbj4sXG4gICAgICogICAgICBmb3JtYXR0ZWRWYWx1ZXM6IGFycmF5LjxzdHJpbmc+XG4gICAgICogfX0gY29udmVydGVkIGRhdGFcbiAgICAgKi9cbiAgICBjb252ZXJ0OiBmdW5jdGlvbih1c2VyRGF0YSwgY2hhcnRPcHRpb25zLCBjaGFydFR5cGUpIHtcbiAgICAgICAgdmFyIGxhYmVscyA9IHVzZXJEYXRhLmNhdGVnb3JpZXMsXG4gICAgICAgICAgICBzZXJpZXNEYXRhID0gdXNlckRhdGEuc2VyaWVzLFxuICAgICAgICAgICAgdmFsdWVzID0gdGhpcy5fcGlja1ZhbHVlcyhzZXJpZXNEYXRhKSxcbiAgICAgICAgICAgIGpvaW5WYWx1ZXMgPSB0aGlzLl9qb2luVmFsdWVzKHZhbHVlcyksXG4gICAgICAgICAgICBsZWdlbmRMYWJlbHMgPSB0aGlzLl9waWNrTGVnZW5kTGFiZWxzKHNlcmllc0RhdGEpLFxuICAgICAgICAgICAgam9pbkxlZ2VuZExhYmVscyA9IHRoaXMuX2pvaW5MZWdlbmRMYWJlbHMobGVnZW5kTGFiZWxzLCBjaGFydFR5cGUpLFxuICAgICAgICAgICAgZm9ybWF0ID0gY2hhcnRPcHRpb25zICYmIGNoYXJ0T3B0aW9ucy5mb3JtYXQgfHwgJycsXG4gICAgICAgICAgICBmb3JtYXRGdW5jdGlvbnMgPSB0aGlzLl9maW5kRm9ybWF0RnVuY3Rpb25zKGZvcm1hdCksXG4gICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXMgPSBmb3JtYXQgPyB0aGlzLl9mb3JtYXRWYWx1ZXModmFsdWVzLCBmb3JtYXRGdW5jdGlvbnMpIDogdmFsdWVzO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbGFiZWxzOiBsYWJlbHMsXG4gICAgICAgICAgICB2YWx1ZXM6IHZhbHVlcyxcbiAgICAgICAgICAgIGpvaW5WYWx1ZXM6IGpvaW5WYWx1ZXMsXG4gICAgICAgICAgICBsZWdlbmRMYWJlbHM6IGxlZ2VuZExhYmVscyxcbiAgICAgICAgICAgIGpvaW5MZWdlbmRMYWJlbHM6IGpvaW5MZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICBmb3JtYXRGdW5jdGlvbnM6IGZvcm1hdEZ1bmN0aW9ucyxcbiAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlczogZm9ybWF0dGVkVmFsdWVzXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNlcGFyYXRlIGxhYmVsLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5LjxhcnJheT4+fSB1c2VyRGF0YSB1c2VyIGRhdGFcbiAgICAgKiBAcmV0dXJucyB7e2xhYmVsczogKGFycmF5LjxzdHJpbmc+KSwgc291cmNlRGF0YTogYXJyYXkuPGFycmF5LjxhcnJheT4+fX0gcmVzdWx0IGRhdGFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXBhcmF0ZUxhYmVsOiBmdW5jdGlvbih1c2VyRGF0YSkge1xuICAgICAgICB2YXIgbGFiZWxzID0gdXNlckRhdGFbMF0ucG9wKCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsYWJlbHM6IGxhYmVscyxcbiAgICAgICAgICAgIHNvdXJjZURhdGE6IHVzZXJEYXRhXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFBpY2sgdmFsdWUuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHthcnJheX0gaXRlbXMgaXRlbXNcbiAgICAgKiBAcmV0dXJucyB7YXJyYXl9IHBpY2tlZCB2YWx1ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3BpY2tWYWx1ZTogZnVuY3Rpb24oaXRlbXMpIHtcbiAgICAgICAgcmV0dXJuIFtdLmNvbmNhdChpdGVtcy5kYXRhKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUGljayB2YWx1ZXMgZnJvbSBheGlzIGRhdGEuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXk+fSBzZXJpZXNEYXRhIHNlcmllcyBkYXRhXG4gICAgICogQHJldHVybnMge3N0cmluZ1tdfSB2YWx1ZXNcbiAgICAgKi9cbiAgICBfcGlja1ZhbHVlczogZnVuY3Rpb24oc2VyaWVzRGF0YSkge1xuICAgICAgICB2YXIgdmFsdWVzLCByZXN1bHQ7XG4gICAgICAgIGlmIChuZS51dGlsLmlzQXJyYXkoc2VyaWVzRGF0YSkpIHtcbiAgICAgICAgICAgIHZhbHVlcyA9IG5lLnV0aWwubWFwKHNlcmllc0RhdGEsIHRoaXMuX3BpY2tWYWx1ZSwgdGhpcyk7XG4gICAgICAgICAgICByZXN1bHQgPSBjYWxjdWxhdG9yLmFycmF5UGl2b3QodmFsdWVzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHt9O1xuICAgICAgICAgICAgbmUudXRpbC5mb3JFYWNoKHNlcmllc0RhdGEsIGZ1bmN0aW9uKGdyb3VwVmFsdWVzLCB0eXBlKSB7XG4gICAgICAgICAgICAgICAgdmFsdWVzID0gbmUudXRpbC5tYXAoZ3JvdXBWYWx1ZXMsIHRoaXMuX3BpY2tWYWx1ZSwgdGhpcyk7XG4gICAgICAgICAgICAgICAgcmVzdWx0W3R5cGVdID0gY2FsY3VsYXRvci5hcnJheVBpdm90KHZhbHVlcyk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBKb2luIHZhbHVlcy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheT59IHZhbHVlcyB2YWx1ZXNcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPG51bWJlcj59IGpvaW4gdmFsdWVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfam9pblZhbHVlczogZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgIHZhciBqb2luVmFsdWVzO1xuXG4gICAgICAgIGlmIChuZS51dGlsLmlzQXJyYXkodmFsdWVzKSkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlcztcbiAgICAgICAgfVxuXG4gICAgICAgIGpvaW5WYWx1ZXMgPSBuZS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uKGdyb3VwVmFsdWVzKSB7XG4gICAgICAgICAgICByZXR1cm4gZ3JvdXBWYWx1ZXM7XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIHJldHVybiBjb25jYXQuYXBwbHkoW10sIGpvaW5WYWx1ZXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBQaWNrIGxlZ2VuZCBsYWJlbC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gaXRlbSBpdGVtXG4gICAgICogQHJldHVybnMge3N0cmluZ30gbGFiZWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9waWNrTGVnZW5kTGFiZWw6IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuIGl0ZW0ubmFtZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUGljayBsZWdlbmQgbGFiZWxzIGZyb20gYXhpcyBkYXRhLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gc2VyaWVzRGF0YSBzZXJpZXMgZGF0YVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmdbXX0gbGFiZWxzXG4gICAgICovXG4gICAgX3BpY2tMZWdlbmRMYWJlbHM6IGZ1bmN0aW9uKHNlcmllc0RhdGEpIHtcbiAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgaWYgKG5lLnV0aWwuaXNBcnJheShzZXJpZXNEYXRhKSkge1xuICAgICAgICAgICAgcmVzdWx0ID0gbmUudXRpbC5tYXAoc2VyaWVzRGF0YSwgdGhpcy5fcGlja0xlZ2VuZExhYmVsLCB0aGlzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHt9O1xuICAgICAgICAgICAgbmUudXRpbC5mb3JFYWNoKHNlcmllc0RhdGEsIGZ1bmN0aW9uKGdyb3VwVmFsdWVzLCB0eXBlKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W3R5cGVdID0gbmUudXRpbC5tYXAoZ3JvdXBWYWx1ZXMsIHRoaXMuX3BpY2tMZWdlbmRMYWJlbCwgdGhpcyk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBKb2luIGxlZ2VuZCBsYWJlbHMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHthcnJheX0gbGVnZW5kTGFiZWxzIGxlZ2VuZCBsYWJlbHNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY2hhcnRUeXBlIGNoYXJ0IHR5cGVcbiAgICAgKiBAcmV0dXJucyB7YXJyYXl9IGxhYmVsc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2pvaW5MZWdlbmRMYWJlbHM6IGZ1bmN0aW9uKGxlZ2VuZExhYmVscywgY2hhcnRUeXBlKSB7XG4gICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgIGlmIChuZS51dGlsLmlzQXJyYXkobGVnZW5kTGFiZWxzKSkge1xuICAgICAgICAgICAgcmVzdWx0ID0gbmUudXRpbC5tYXAobGVnZW5kTGFiZWxzLCBmdW5jdGlvbihsYWJlbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0VHlwZTogY2hhcnRUeXBlLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogbGFiZWxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQgPSBuZS51dGlsLm1hcChsZWdlbmRMYWJlbHMsIGZ1bmN0aW9uKGxhYmVscywgX2NoYXJ0VHlwZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZS51dGlsLm1hcChsYWJlbHMsIGZ1bmN0aW9uKGxhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGFydFR5cGU6IF9jaGFydFR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogbGFiZWxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgICAgcmVzdWx0ID0gY29uY2F0LmFwcGx5KFtdLCByZXN1bHQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIGZvcm1hdCBncm91cCB2YWx1ZXMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXk+fSBncm91cFZhbHVlcyBncm91cCB2YWx1ZXNcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uW119IGZvcm1hdEZ1bmN0aW9ucyBmb3JtYXQgZnVuY3Rpb25zXG4gICAgICogQHJldHVybnMge3N0cmluZ1tdfSBmb3JtYXR0ZWQgdmFsdWVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZm9ybWF0R3JvdXBWYWx1ZXM6IGZ1bmN0aW9uKGdyb3VwVmFsdWVzLCBmb3JtYXRGdW5jdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIG5lLnV0aWwubWFwKGdyb3VwVmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgICAgIHJldHVybiBuZS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGZucyA9IFt2YWx1ZV0uY29uY2F0KGZvcm1hdEZ1bmN0aW9ucyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwucmVkdWNlKGZucywgZnVuY3Rpb24oc3RvcmVkLCBmbikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZm4oc3RvcmVkKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gZm9ybWF0IGNvbnZlcnRlZCB2YWx1ZXMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXk+fSBjaGFydFZhbHVlcyBjaGFydCB2YWx1ZXNcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uW119IGZvcm1hdEZ1bmN0aW9ucyBmb3JtYXQgZnVuY3Rpb25zXG4gICAgICogQHJldHVybnMge3N0cmluZ1tdfSBmb3JtYXR0ZWQgdmFsdWVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZm9ybWF0VmFsdWVzOiBmdW5jdGlvbihjaGFydFZhbHVlcywgZm9ybWF0RnVuY3Rpb25zKSB7XG4gICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgIGlmIChuZS51dGlsLmlzQXJyYXkoY2hhcnRWYWx1ZXMpKSB7XG4gICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9mb3JtYXRHcm91cFZhbHVlcyhjaGFydFZhbHVlcywgZm9ybWF0RnVuY3Rpb25zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHt9O1xuICAgICAgICAgICAgbmUudXRpbC5mb3JFYWNoKGNoYXJ0VmFsdWVzLCBmdW5jdGlvbihncm91cFZhbHVlcywgY2hhcnRUeXBlKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W2NoYXJ0VHlwZV0gPSB0aGlzLl9mb3JtYXRHcm91cFZhbHVlcyhncm91cFZhbHVlcywgZm9ybWF0RnVuY3Rpb25zKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFBpY2sgbWF4IGxlbmd0aCB1bmRlciBwb2ludC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ1tdfSB2YWx1ZXMgY2hhcnQgdmFsdWVzXG4gICAgICogQHJldHVybnMge251bWJlcn0gbWF4IGxlbmd0aCB1bmRlciBwb2ludFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3BpY2tNYXhMZW5VbmRlclBvaW50OiBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgdmFyIG1heCA9IDA7XG5cbiAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkodmFsdWVzLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIGxlbiA9IG5lLnV0aWwubGVuZ3RoQWZ0ZXJQb2ludCh2YWx1ZSk7XG4gICAgICAgICAgICBpZiAobGVuID4gbWF4KSB7XG4gICAgICAgICAgICAgICAgbWF4ID0gbGVuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICByZXR1cm4gbWF4O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIHplcm8gZmlsbCBmb3JtYXQgb3Igbm90LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmb3JtYXQgZm9ybWF0XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHJlc3VsdCBib29sZWFuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNaZXJvRmlsbDogZnVuY3Rpb24oZm9ybWF0KSB7XG4gICAgICAgIHJldHVybiBmb3JtYXQubGVuZ3RoID4gMiAmJiBmb3JtYXQuY2hhckF0KDApID09PSAnMCc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgZGVjaW1hbCBmb3JtYXQgb3Igbm90LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmb3JtYXQgZm9ybWF0XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHJlc3VsdCBib29sZWFuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNEZWNpbWFsOiBmdW5jdGlvbihmb3JtYXQpIHtcbiAgICAgICAgdmFyIGluZGV4T2YgPSBmb3JtYXQuaW5kZXhPZignLicpO1xuICAgICAgICByZXR1cm4gaW5kZXhPZiA+IC0xICYmIGluZGV4T2YgPCBmb3JtYXQubGVuZ3RoIC0gMTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciBjb21tYSBmb3JtYXQgb3Igbm90LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmb3JtYXQgZm9ybWF0XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHJlc3VsdCBib29sZWFuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNDb21tYTogZnVuY3Rpb24oZm9ybWF0KSB7XG4gICAgICAgIHJldHVybiBmb3JtYXQuaW5kZXhPZignLCcpID09PSBmb3JtYXQuc3BsaXQoJy4nKVswXS5sZW5ndGggLSA0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGb3JtYXQgemVybyBmaWxsLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBsZW4gbGVuZ3RoIG9mIHJlc3VsdFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSB0YXJnZXQgdmFsdWVcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBmb3JtYXR0ZWQgdmFsdWVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9mb3JtYXRaZXJvRmlsbDogZnVuY3Rpb24obGVuLCB2YWx1ZSkge1xuICAgICAgICB2YXIgemVybyA9ICcwJztcblxuICAgICAgICB2YWx1ZSArPSAnJztcblxuICAgICAgICBpZiAodmFsdWUubGVuZ3RoID49IGxlbikge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgd2hpbGUgKHZhbHVlLmxlbmd0aCA8IGxlbikge1xuICAgICAgICAgICAgdmFsdWUgPSB6ZXJvICsgdmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZvcm1hdCBEZWNpbWFsLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBsZW4gbGVuZ3RoIG9mIHVuZGVyIGRlY2ltYWwgcG9pbnRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWUgdGFyZ2V0IHZhbHVlXG4gICAgICogQHJldHVybnMge3N0cmluZ30gZm9ybWF0dGVkIHZhbHVlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZm9ybWF0RGVjaW1hbDogZnVuY3Rpb24obGVuLCB2YWx1ZSkge1xuICAgICAgICB2YXIgcG93O1xuXG4gICAgICAgIGlmIChsZW4gPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLnJvdW5kKHZhbHVlLCAxMCk7XG4gICAgICAgIH1cblxuICAgICAgICBwb3cgPSBNYXRoLnBvdygxMCwgbGVuKTtcbiAgICAgICAgdmFsdWUgPSBNYXRoLnJvdW5kKHZhbHVlICogcG93KSAvIHBvdztcbiAgICAgICAgdmFsdWUgPSBwYXJzZUZsb2F0KHZhbHVlKS50b0ZpeGVkKGxlbik7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRm9ybWF0IENvbW1hLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSB0YXJnZXQgdmFsdWVcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBmb3JtYXR0ZWQgdmFsdWVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9mb3JtYXRDb21tYTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgdmFyIGNvbW1hID0gJywnLFxuICAgICAgICAgICAgdW5kZXJQb2ludFZhbHVlID0gJycsXG4gICAgICAgICAgICB2YWx1ZXM7XG5cbiAgICAgICAgdmFsdWUgKz0gJyc7XG5cbiAgICAgICAgaWYgKHZhbHVlLmluZGV4T2YoJy4nKSA+IC0xKSB7XG4gICAgICAgICAgICB2YWx1ZXMgPSB2YWx1ZS5zcGxpdCgnLicpO1xuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZXNbMF07XG4gICAgICAgICAgICB1bmRlclBvaW50VmFsdWUgPSAnLicgKyB2YWx1ZXNbMV07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodmFsdWUubGVuZ3RoIDwgNCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlICsgdW5kZXJQb2ludFZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFsdWVzID0gKHZhbHVlKS5zcGxpdCgnJykucmV2ZXJzZSgpO1xuICAgICAgICB2YWx1ZXMgPSBuZS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uKGNoYXIsIGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gW2NoYXJdO1xuICAgICAgICAgICAgaWYgKChpbmRleCArIDEpICUgMyA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKGNvbW1hKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBjb25jYXQuYXBwbHkoW10sIHZhbHVlcykucmV2ZXJzZSgpLmpvaW4oJycpICsgdW5kZXJQb2ludFZhbHVlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGaW5kIGZvcm1hdCBmdW5jdGlvbnMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZvcm1hdCBmb3JtYXRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ1tdfSB2YWx1ZXMgY2hhcnQgdmFsdWVzXG4gICAgICogQHJldHVybnMge2Z1bmN0aW9uW119IGZ1bmN0aW9uc1xuICAgICAqL1xuICAgIF9maW5kRm9ybWF0RnVuY3Rpb25zOiBmdW5jdGlvbihmb3JtYXQpIHtcbiAgICAgICAgdmFyIGZ1bmNzID0gW10sXG4gICAgICAgICAgICBsZW47XG5cbiAgICAgICAgaWYgKCFmb3JtYXQpIHtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9pc0RlY2ltYWwoZm9ybWF0KSkge1xuICAgICAgICAgICAgbGVuID0gdGhpcy5fcGlja01heExlblVuZGVyUG9pbnQoW2Zvcm1hdF0pO1xuICAgICAgICAgICAgZnVuY3MgPSBbbmUudXRpbC5iaW5kKHRoaXMuX2Zvcm1hdERlY2ltYWwsIHRoaXMsIGxlbildO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2lzWmVyb0ZpbGwoZm9ybWF0KSkge1xuICAgICAgICAgICAgbGVuID0gZm9ybWF0Lmxlbmd0aDtcbiAgICAgICAgICAgIGZ1bmNzID0gW25lLnV0aWwuYmluZCh0aGlzLl9mb3JtYXRaZXJvRmlsbCwgdGhpcywgbGVuKV07XG4gICAgICAgICAgICByZXR1cm4gZnVuY3M7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5faXNDb21tYShmb3JtYXQpKSB7XG4gICAgICAgICAgICBmdW5jcy5wdXNoKHRoaXMuX2Zvcm1hdENvbW1hKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmdW5jcztcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRhdGFDb252ZXJ0ZXI7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgRE9NIEhhbmRsZXIuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogRE9NIEhhbmRsZXIuXG4gKiBAbW9kdWxlIGRvbUhhbmRsZXJcbiAqL1xudmFyIGRvbUhhbmRsZXIgPSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGVsZW1lbnQuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkb21IYW5kbGVyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRhZyBodG1sIHRhZ1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuZXdDbGFzcyBjbGFzcyBuYW1lXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSBjcmVhdGVkIGVsZW1lbnRcbiAgICAgKi9cbiAgICBjcmVhdGU6IGZ1bmN0aW9uKHRhZywgbmV3Q2xhc3MpIHtcbiAgICAgICAgdmFyIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcpO1xuXG4gICAgICAgIGlmIChuZXdDbGFzcykge1xuICAgICAgICAgICAgdGhpcy5hZGRDbGFzcyhlbCwgbmV3Q2xhc3MpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGVsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgY2xhc3MgbmFtZXMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkb21IYW5kbGVyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyB7YXJyYXl9IG5hbWVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0Q2xhc3NOYW1lczogZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgdmFyIGNsYXNzTmFtZSA9IGVsLmNsYXNzTmFtZSA/IGVsLmNsYXNzTmFtZSA6ICcnLFxuICAgICAgICAgICAgY2xhc3NOYW1lcyA9IGNsYXNzTmFtZSA/IGNsYXNzTmFtZS5zcGxpdCgnICcpIDogW107XG4gICAgICAgIHJldHVybiBjbGFzc05hbWVzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgY3NzIGNsYXNzIHRvIHRhcmdldCBlbGVtZW50LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZG9tSGFuZGxlclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5ld0NsYXNzIGFkZCBjbGFzcyBuYW1lXG4gICAgICovXG4gICAgYWRkQ2xhc3M6IGZ1bmN0aW9uKGVsLCBuZXdDbGFzcykge1xuICAgICAgICB2YXIgY2xhc3NOYW1lcyA9IHRoaXMuX2dldENsYXNzTmFtZXMoZWwpLFxuICAgICAgICAgICAgaW5kZXggPSBuZS51dGlsLmluQXJyYXkobmV3Q2xhc3MsIGNsYXNzTmFtZXMpO1xuXG4gICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjbGFzc05hbWVzLnB1c2gobmV3Q2xhc3MpO1xuICAgICAgICBlbC5jbGFzc05hbWUgPSBjbGFzc05hbWVzLmpvaW4oJyAnKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIGNzcyBjbGFzcyBmcm9tIHRhcmdldCBlbGVtZW50LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZG9tSGFuZGxlclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHJtQ2xhc3MgcmVtb3ZlIGNsYXNzIG5hbWVcbiAgICAgKi9cbiAgICByZW1vdmVDbGFzczogZnVuY3Rpb24oZWwsIHJtQ2xhc3MpIHtcbiAgICAgICAgdmFyIGNsYXNzTmFtZXMgPSB0aGlzLl9nZXRDbGFzc05hbWVzKGVsKSxcbiAgICAgICAgICAgIGluZGV4ID0gbmUudXRpbC5pbkFycmF5KHJtQ2xhc3MsIGNsYXNzTmFtZXMpO1xuXG4gICAgICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNsYXNzTmFtZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgZWwuY2xhc3NOYW1lID0gY2xhc3NOYW1lcy5qb2luKCcgJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgY2xhc3MgZXhpc3Qgb3Igbm90LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZG9tSGFuZGxlclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZpbmRDbGFzcyB0YXJnZXQgY3NzIGNsYXNzXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IGhhcyBjbGFzc1xuICAgICAqL1xuICAgIGhhc0NsYXNzOiBmdW5jdGlvbihlbCwgZmluZENsYXNzKSB7XG4gICAgICAgIHZhciBjbGFzc05hbWVzID0gdGhpcy5fZ2V0Q2xhc3NOYW1lcyhlbCksXG4gICAgICAgICAgICBpbmRleCA9IG5lLnV0aWwuaW5BcnJheShmaW5kQ2xhc3MsIGNsYXNzTmFtZXMpO1xuICAgICAgICByZXR1cm4gaW5kZXggPiAtMTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmluZCBwYXJlbnQgYnkgY2xhc3MgbmFtZS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRvbUhhbmRsZXJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjbGFzc05hbWUgdGFyZ2V0IGNzcyBjbGFzc1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBsYXN0Q2xhc3MgbGFzdCBjc3MgY2xhc3NcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHJlc3VsdCBlbGVtZW50XG4gICAgICovXG4gICAgZmluZFBhcmVudEJ5Q2xhc3M6IGZ1bmN0aW9uKGVsLCBjbGFzc05hbWUsIGxhc3RDbGFzcykge1xuICAgICAgICB2YXIgcGFyZW50ID0gZWwucGFyZW50Tm9kZTtcbiAgICAgICAgaWYgKCFwYXJlbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaGFzQ2xhc3MocGFyZW50LCBjbGFzc05hbWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gcGFyZW50O1xuICAgICAgICB9IGVsc2UgaWYgKHBhcmVudC5ub2RlTmFtZSA9PT0gJ0JPRFknIHx8IHRoaXMuaGFzQ2xhc3MocGFyZW50LCBsYXN0Q2xhc3MpKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbmRQYXJlbnRCeUNsYXNzKHBhcmVudCwgY2xhc3NOYW1lLCBsYXN0Q2xhc3MpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFwcGVuZCBjaGlsZCBlbGVtZW50LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZG9tSGFuZGxlclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciBjb250YWluZXIgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNoaWxkcmVuIGNoaWxkIGVsZW1lbnRcbiAgICAgKi9cbiAgICBhcHBlbmQ6IGZ1bmN0aW9uKGNvbnRhaW5lciwgY2hpbGRyZW4pIHtcbiAgICAgICAgaWYgKCFjb250YWluZXIgfHwgIWNoaWxkcmVuKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY2hpbGRyZW4gPSBuZS51dGlsLmlzQXJyYXkoY2hpbGRyZW4pID8gY2hpbGRyZW4gOiBbY2hpbGRyZW5dO1xuXG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KGNoaWxkcmVuLCBmdW5jdGlvbihjaGlsZCkge1xuICAgICAgICAgICAgaWYgKCFjaGlsZCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChjaGlsZCk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZG9tSGFuZGxlcjtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBFdmVudCBsaXN0ZW5lci5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBFdmVudCBsaXN0ZW5lci5cbiAqIEBtb2R1bGUgZXZlbnRMaXN0ZW5lclxuICovXG52YXIgZXZlbnRMaXN0ZW5lciA9IHtcbiAgICAvKipcbiAgICAgKiBFdmVudCBsaXN0ZW5lciBmb3IgSUUuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpldmVudExpc3RlbmVyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZSBldmVudCBuYW1lXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayBjYWxsYmFjayBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2F0dGFjaEV2ZW50OiBmdW5jdGlvbiAoZXZlbnROYW1lLCBlbCwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PSBcIm9iamVjdFwiICYmIGNhbGxiYWNrLmhhbmRsZUV2ZW50KSB7XG4gICAgICAgICAgICBlbC5hdHRhY2hFdmVudChcIm9uXCIgKyBldmVudE5hbWUsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjay5oYW5kbGVFdmVudC5jYWxsKGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZWwuYXR0YWNoRXZlbnQoXCJvblwiICsgZXZlbnROYW1lLCBjYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXZlbnQgbGlzdGVuZXIgZm9yIG90aGVyIGJyb3dzZXJzLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZXZlbnRMaXN0ZW5lclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudE5hbWUgZXZlbnQgbmFtZVxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hZGRFdmVudExpc3RlbmVyOiBmdW5jdGlvbiAoZXZlbnROYW1lLCBlbCwgY2FsbGJhY2spIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBjYWxsYmFjayk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT0gXCJvYmplY3RcIiAmJiBjYWxsYmFjay5oYW5kbGVFdmVudCkge1xuICAgICAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suaGFuZGxlRXZlbnQuY2FsbChjYWxsYmFjaywgZXZlbnQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBCaW5kIGV2ZW50IGZ1bmN0aW9uLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZXZlbnRMaXN0ZW5lclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudE5hbWUgZXZlbnQgbmFtZVxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgKi9cbiAgICBiaW5kRXZlbnQ6IGZ1bmN0aW9uIChldmVudE5hbWUsIGVsLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgYmluZEV2ZW50O1xuICAgICAgICBpZiAoXCJhZGRFdmVudExpc3RlbmVyXCIgaW4gZWwpIHtcbiAgICAgICAgICAgIGJpbmRFdmVudCA9IHRoaXMuX2FkZEV2ZW50TGlzdGVuZXI7XG4gICAgICAgIH0gZWxzZSBpZiAoXCJhdHRhY2hFdmVudFwiIGluIGVsKSB7XG4gICAgICAgICAgICBiaW5kRXZlbnQgPSB0aGlzLl9hdHRhY2hFdmVudDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmJpbmRFdmVudCA9IGJpbmRFdmVudDtcbiAgICAgICAgYmluZEV2ZW50KGV2ZW50TmFtZSwgZWwsIGNhbGxiYWNrKTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV2ZW50TGlzdGVuZXI7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgVXRpbCBmb3IgcmVuZGVyaW5nLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZG9tID0gcmVxdWlyZSgnLi9kb21IYW5kbGVyJyksXG4gICAgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4vLi4vY29uc3QuanMnKTtcblxudmFyIGJyb3dzZXIgPSBuZS51dGlsLmJyb3dzZXIsXG4gICAgaXNJRTggPSBicm93c2VyLm1zaWUgJiYgYnJvd3Nlci52ZXJzaW9uID09PSA4O1xuXG4vKipcbiAqIFV0aWwgZm9yIHJlbmRlcmluZy5cbiAqIEBtb2R1bGUgcmVuZGVyVXRpbFxuICovXG52YXIgcmVuZGVyVXRpbCA9IHtcbiAgICAvKipcbiAgICAgKiBDb25jYXQgc3RyaW5nLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6cmVuZGVyVXRpbFxuICAgICAqIEBwYXJhbXMgey4uLnN0cmluZ30gdGFyZ2V0IHN0cmluZ3NcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBjb25jYXQgc3RyaW5nXG4gICAgICovXG4gICAgY29uY2F0U3RyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIFN0cmluZy5wcm90b3R5cGUuY29uY2F0LmFwcGx5KCcnLCBhcmd1bWVudHMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGNzc1RleHQgZm9yIGZvbnQuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpyZW5kZXJVdGlsXG4gICAgICogQHBhcmFtIHt7Zm9udFNpemU6IG51bWJlciwgZm9udEZhbWlseTogc3RyaW5nLCBjb2xvcjogc3RyaW5nfX0gdGhlbWUgZm9udCB0aGVtZVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGNzc1RleHRcbiAgICAgKi9cbiAgICBtYWtlRm9udENzc1RleHQ6IGZ1bmN0aW9uKHRoZW1lKSB7XG4gICAgICAgIHZhciBjc3NUZXh0cyA9IFtdO1xuXG4gICAgICAgIGlmICghdGhlbWUpIHtcbiAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGVtZS5mb250U2l6ZSkge1xuICAgICAgICAgICAgY3NzVGV4dHMucHVzaCh0aGlzLmNvbmNhdFN0cignZm9udC1zaXplOicsIHRoZW1lLmZvbnRTaXplLCAncHgnKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhlbWUuZm9udEZhbWlseSkge1xuICAgICAgICAgICAgY3NzVGV4dHMucHVzaCh0aGlzLmNvbmNhdFN0cignZm9udC1mYW1pbHk6JywgdGhlbWUuZm9udEZhbWlseSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoZW1lLmNvbG9yKSB7XG4gICAgICAgICAgICBjc3NUZXh0cy5wdXNoKHRoaXMuY29uY2F0U3RyKCdjb2xvcjonLCB0aGVtZS5jb2xvcikpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNzc1RleHRzLmpvaW4oJzsnKTtcbiAgICB9LFxuXG4gICAgY2hlY2tFbDogbnVsbCxcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgZWxlbWVudCBmb3Igc2l6ZSBjaGVjay5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOnJlbmRlclV0aWxcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jcmVhdGVTaXplQ2hlY2tFbDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBlbERpdiwgZWxTcGFuO1xuICAgICAgICBpZiAodGhpcy5jaGVja0VsKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVja0VsO1xuICAgICAgICB9XG5cbiAgICAgICAgZWxEaXYgPSBkb20uY3JlYXRlKCdESVYnKTtcbiAgICAgICAgZWxTcGFuID0gZG9tLmNyZWF0ZSgnU1BBTicpO1xuXG4gICAgICAgIGVsRGl2LmFwcGVuZENoaWxkKGVsU3Bhbik7XG4gICAgICAgIGVsRGl2LnN0eWxlLmNzc1RleHQgPSAncG9zaXRpb246cmVsYXRpdmU7dG9wOjEwMDAwcHg7bGVmdDoxMDAwMHB4O3dpZHRoOjEwMDBweDtoZWlnaHQ6MTAwO2xpbmUtaGVpZ2h0OjEnO1xuXG4gICAgICAgIHRoaXMuY2hlY2tFbCA9IGVsRGl2O1xuICAgICAgICByZXR1cm4gZWxEaXY7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCByZW5kZXJlZCBsYWJlbCBzaXplICh3aWR0aCBvciBoZWlnaHQpLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6cmVuZGVyVXRpbFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBsYWJlbCBsYWJlbFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSB0aGVtZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwcm9wZXJ0eSBlbGVtZW50IHByb3BlcnR5XG4gICAgICogQHJldHVybnMge251bWJlcn0gc2l6ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFJlbmRlcmVkTGFiZWxTaXplOiBmdW5jdGlvbihsYWJlbCwgdGhlbWUsIHByb3BlcnR5KSB7XG4gICAgICAgIHZhciBlbERpdiwgZWxTcGFuLCBsYWJlbFNpemU7XG5cbiAgICAgICAgaWYgKCFsYWJlbCkge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cblxuICAgICAgICBlbERpdiA9IHRoaXMuX2NyZWF0ZVNpemVDaGVja0VsKCk7XG4gICAgICAgIGVsU3BhbiA9IGVsRGl2LmZpcnN0Q2hpbGQ7XG5cbiAgICAgICAgdGhlbWUgPSB0aGVtZSB8fCB7fTtcbiAgICAgICAgZWxTcGFuLmlubmVySFRNTCA9IGxhYmVsO1xuICAgICAgICBlbFNwYW4uc3R5bGUuZm9udFNpemUgPSAodGhlbWUuZm9udFNpemUgfHwgY2hhcnRDb25zdC5ERUZBVUxUX0xBQkVMX0ZPTlRfU0laRSkgKyAncHgnO1xuXG4gICAgICAgIGlmICh0aGVtZS5mb250RmFtaWx5KSB7XG4gICAgICAgICAgICBlbFNwYW4uc3R5bGUuZm9udEZhbWlseSA9IHRoZW1lLmZvbnRGYW1pbHk7XG4gICAgICAgIH1cblxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGVsRGl2KTtcbiAgICAgICAgbGFiZWxTaXplID0gZWxTcGFuW3Byb3BlcnR5XTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChlbERpdik7XG4gICAgICAgIHJldHVybiBsYWJlbFNpemU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCByZW5kZXJlZCBsYWJlbCB3aWR0aC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOnJlbmRlclV0aWxcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbGFiZWwgbGFiZWxcbiAgICAgKiBAcGFyYW0ge3tmb250U2l6ZTogbnVtYmVyLCBmb250RmFtaWx5OiBzdHJpbmcsIGNvbG9yOiBzdHJpbmd9fSB0aGVtZSBsYWJlbCB0aGVtZVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IHdpZHRoXG4gICAgICovXG4gICAgZ2V0UmVuZGVyZWRMYWJlbFdpZHRoOiBmdW5jdGlvbihsYWJlbCwgdGhlbWUpIHtcbiAgICAgICAgdmFyIGxhYmVsV2lkdGggPSB0aGlzLl9nZXRSZW5kZXJlZExhYmVsU2l6ZShsYWJlbCwgdGhlbWUsICdvZmZzZXRXaWR0aCcpO1xuICAgICAgICByZXR1cm4gbGFiZWxXaWR0aDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHJlbmRlcmVkIGxhYmVsIGhlaWdodC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOnJlbmRlclV0aWxcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbGFiZWwgbGFiZWxcbiAgICAgKiBAcGFyYW0ge3tmb250U2l6ZTogbnVtYmVyLCBmb250RmFtaWx5OiBzdHJpbmcsIGNvbG9yOiBzdHJpbmd9fSB0aGVtZSBsYWJlbCB0aGVtZVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IGhlaWdodFxuICAgICAqL1xuICAgIGdldFJlbmRlcmVkTGFiZWxIZWlnaHQ6IGZ1bmN0aW9uKGxhYmVsLCB0aGVtZSkge1xuICAgICAgICB2YXIgbGFiZWxIZWlnaHQgPSB0aGlzLl9nZXRSZW5kZXJlZExhYmVsU2l6ZShsYWJlbCwgdGhlbWUsICdvZmZzZXRIZWlnaHQnKTtcbiAgICAgICAgcmV0dXJuIGxhYmVsSGVpZ2h0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgZGltZW5zaW9uLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6cmVuZGVyVXRpbFxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBkaW1lbnNpb24gZGltZW5zaW9uXG4gICAgICovXG4gICAgcmVuZGVyRGltZW5zaW9uOiBmdW5jdGlvbihlbCwgZGltZW5zaW9uKSB7XG4gICAgICAgIGVsLnN0eWxlLmNzc1RleHQgPSBbXG4gICAgICAgICAgICB0aGlzLmNvbmNhdFN0cignd2lkdGg6JywgZGltZW5zaW9uLndpZHRoLCAncHgnKSxcbiAgICAgICAgICAgIHRoaXMuY29uY2F0U3RyKCdoZWlnaHQ6JywgZGltZW5zaW9uLmhlaWdodCwgJ3B4JylcbiAgICAgICAgXS5qb2luKCc7Jyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBwb3NpdGlvbih0b3AsIHJpZ2h0KS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOnJlbmRlclV0aWxcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7e3RvcDogbnVtYmVyLCBsZWZ0OiBudW1iZXIsIHJpZ2h0OiBudW1iZXJ9fSBwb3NpdGlvbiBwb3NpdGlvblxuICAgICAqL1xuICAgIHJlbmRlclBvc2l0aW9uOiBmdW5jdGlvbihlbCwgcG9zaXRpb24pIHtcbiAgICAgICAgaWYgKG5lLnV0aWwuaXNVbmRlZmluZWQocG9zaXRpb24pKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocG9zaXRpb24udG9wKSB7XG4gICAgICAgICAgICBlbC5zdHlsZS50b3AgPSBwb3NpdGlvbi50b3AgKyAncHgnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBvc2l0aW9uLmxlZnQpIHtcbiAgICAgICAgICAgIGVsLnN0eWxlLmxlZnQgPSBwb3NpdGlvbi5sZWZ0ICsgJ3B4JztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwb3NpdGlvbi5yaWdodCkge1xuICAgICAgICAgICAgZWwuc3R5bGUucmlnaHQgPSBwb3NpdGlvbi5yaWdodCArICdweCc7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGJhY2tncm91bmQuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpyZW5kZXJVdGlsXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gYmFja2dyb3VuZCBiYWNrZ3JvdW5kIG9wdGlvblxuICAgICAqL1xuICAgIHJlbmRlckJhY2tncm91bmQ6IGZ1bmN0aW9uKGVsLCBiYWNrZ3JvdW5kKSB7XG4gICAgICAgIGlmICghYmFja2dyb3VuZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZWwuc3R5bGUuYmFja2dyb3VuZCA9IGJhY2tncm91bmQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciB0aXRsZS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOnJlbmRlclV0aWxcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGl0bGUgdGl0bGVcbiAgICAgKiBAcGFyYW0ge3tmb250U2l6ZTogbnVtYmVyLCBjb2xvcjogc3RyaW5nLCBiYWNrZ3JvdW5kOiBzdHJpbmd9fSB0aGVtZSB0aXRsZSB0aGVtZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjbGFzc05hbWUgY3NzIGNsYXNzIG5hbWVcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHRpdGxlIGVsZW1lbnRcbiAgICAgKi9cbiAgICByZW5kZXJUaXRsZTogZnVuY3Rpb24odGl0bGUsIHRoZW1lLCBjbGFzc05hbWUpIHtcbiAgICAgICAgdmFyIGVsVGl0bGUsIGNzc1RleHQ7XG5cbiAgICAgICAgaWYgKCF0aXRsZSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBlbFRpdGxlID0gZG9tLmNyZWF0ZSgnRElWJywgY2xhc3NOYW1lKTtcbiAgICAgICAgZWxUaXRsZS5pbm5lckhUTUwgPSB0aXRsZTtcblxuICAgICAgICBjc3NUZXh0ID0gcmVuZGVyVXRpbC5tYWtlRm9udENzc1RleHQodGhlbWUpO1xuXG4gICAgICAgIGlmICh0aGVtZS5iYWNrZ3JvdW5kKSB7XG4gICAgICAgICAgICBjc3NUZXh0ICs9ICc7JyArIHRoaXMuY29uY2F0U3RyKCdiYWNrZ3JvdW5kOicsIHRoZW1lLmJhY2tncm91bmQpO1xuICAgICAgICB9XG5cbiAgICAgICAgZWxUaXRsZS5zdHlsZS5jc3NUZXh0ID0gY3NzVGV4dDtcblxuICAgICAgICByZXR1cm4gZWxUaXRsZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciBJRTggb3Igbm90LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6cmVuZGVyVXRpbFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSByZXN1bHQgYm9vbGVhblxuICAgICAqL1xuICAgIGlzSUU4OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGlzSUU4O1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gcmVuZGVyVXRpbDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBUaGlzIGlzIHRlbXBsYXRlIG1ha2VyLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAvKipcbiAgICAgKiBUaGlzIGlzIHRlbXBsYXRlIG1ha2VyLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBodG1sIGh0bWxcbiAgICAgKiBAcmV0dXJucyB7ZnVuY3Rpb259IHRlbXBsYXRlIGZ1bmN0aW9uXG4gICAgICogQGVheG1wbGVcbiAgICAgKlxuICAgICAqICAgdmFyIHRlbXBsYXRlID0gdGVtcGxhdGVNYWtlci50ZW1wbGF0ZSgnPHNwYW4+e3sgbmFtZSB9fTwvc3Bhbj4nKSxcbiAgICAgKiAgICAgICByZXN1bHQgPSB0ZW1wbGF0ZSh7bmFtZTogJ0pvaG4nKTtcbiAgICAgKiAgIGNvbnNvbGUubG9nKHJlc3VsdCk7IC8vIDxzcGFuPkpvaG48L3NwYW4+XG4gICAgICpcbiAgICAgKi9cbiAgICB0ZW1wbGF0ZTogZnVuY3Rpb24gKGh0bWwpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gaHRtbDtcbiAgICAgICAgICAgIG5lLnV0aWwuZm9yRWFjaChkYXRhLCBmdW5jdGlvbiAodmFsdWUsIGtleSkge1xuICAgICAgICAgICAgICAgIHZhciByZWdFeHAgPSBuZXcgUmVnRXhwKCd7e1xcXFxzKicgKyBrZXkgKyAnXFxcXHMqfX0nLCAnZycpO1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKHJlZ0V4cCwgdmFsdWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9O1xuICAgIH1cbn07XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgIExlZ2VuZCBjb21wb25lbnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBjaGFydENvbnN0ID0gcmVxdWlyZSgnLi4vY29uc3QuanMnKSxcbiAgICBkb20gPSByZXF1aXJlKCcuLi9oZWxwZXJzL2RvbUhhbmRsZXIuanMnKSxcbiAgICByZW5kZXJVdGlsID0gcmVxdWlyZSgnLi4vaGVscGVycy9yZW5kZXJVdGlsLmpzJyksXG4gICAgZGVmYXVsdFRoZW1lID0gcmVxdWlyZSgnLi4vdGhlbWVzL2RlZmF1bHRUaGVtZS5qcycpLFxuICAgIGxlZ2VuZFRlbXBsYXRlID0gcmVxdWlyZSgnLi8uLi9sZWdlbmRzL2xlZ2VuZFRlbXBsYXRlLmpzJyk7XG5cbnZhciBMRUdFTkRfUkVDVF9XSURUSCA9IDEyLFxuICAgIExBQkVMX1BBRERJTkdfVE9QID0gMixcbiAgICBMSU5FX01BUkdJTl9UT1AgPSA1O1xuXG52YXIgTGVnZW5kID0gbmUudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIExlZ2VuZC5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIExlZ2VuZCBjb21wb25lbnQuXG4gICAgICogQGNvbnN0cnVjdHMgTGVnZW5kXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmxlZ2VuZExhYmVscyBsZWdlbmQgbGFiZWxzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmJvdW5kIGF4aXMgYm91bmRcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgYXhpcyB0aGVtZVxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICBuZS51dGlsLmV4dGVuZCh0aGlzLCBwYXJhbXMpO1xuICAgICAgICAvKipcbiAgICAgICAgICogTGVnZW5kIHZpZXcgY2xhc3NOYW1lXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNsYXNzTmFtZSA9ICduZS1jaGFydC1sZWdlbmQtYXJlYSc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBsZWdlbmQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGJvdW5kIHBsb3QgYm91bmRcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IGxlZ2VuZCBlbGVtZW50XG4gICAgICovXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGVsID0gZG9tLmNyZWF0ZSgnRElWJywgdGhpcy5jbGFzc05hbWUpO1xuICAgICAgICBlbC5pbm5lckhUTUwgPSB0aGlzLl9tYWtlTGVnZW5kSHRtbCgpO1xuICAgICAgICByZW5kZXJVdGlsLnJlbmRlclBvc2l0aW9uKGVsLCB0aGlzLmJvdW5kLnBvc2l0aW9uKTtcbiAgICAgICAgdGhpcy5fcmVuZGVyTGFiZWxUaGVtZShlbCwgdGhpcy50aGVtZS5sYWJlbCk7XG5cbiAgICAgICAgcmV0dXJuIGVsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlbWUgdG8gbGVnZW5kIGxhYmVsc1xuICAgICAqIEBwYXJhbSB7YXJyYXkuPG9iamVjdD59IGxhYmVscyBsYWJlbHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgbGVnZW5kIHRoZW1lXG4gICAgICogQHJldHVybnMge2FycmF5LjxvYmplY3Q+fSBsYWJlbHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRUaGVtZVRvTGFiZWxzOiBmdW5jdGlvbihsYWJlbHMsIHRoZW1lKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBuZS51dGlsLm1hcChsYWJlbHMsIGZ1bmN0aW9uKGl0ZW0sIGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgaXRlbVRoZW1lID0ge1xuICAgICAgICAgICAgICAgIGNvbG9yOiB0aGVtZS5jb2xvcnNbaW5kZXhdXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpZiAodGhlbWUuc2luZ2xlQ29sb3JzKSB7XG4gICAgICAgICAgICAgICAgaXRlbVRoZW1lLnNpbmdsZUNvbG9yID0gdGhlbWUuc2luZ2xlQ29sb3JzW2luZGV4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGVtZS5ib3JkZXJDb2xvcikge1xuICAgICAgICAgICAgICAgIGl0ZW1UaGVtZS5ib3JkZXJDb2xvciA9IHRoZW1lLmJvcmRlckNvbG9yO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaXRlbS50aGVtZSA9IGl0ZW1UaGVtZTtcbiAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGxlZ2VuZCBsYWJlbHMuXG4gICAgICogQHJldHVybnMge2FycmF5LjxvYmplY3Q+fSBsZWdlbmQgbGFiZWxzLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VMZWdlbmRMYWJlbHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY2hhcnRUeXBlID0gdGhpcy5jaGFydFR5cGUsXG4gICAgICAgICAgICBsZWdlbmRMYWJlbHMgPSB0aGlzLmxlZ2VuZExhYmVscyxcbiAgICAgICAgICAgIGpvaW5MZWdlbmRMYWJlbHMgPSB0aGlzLmpvaW5MZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICBsYWJlbExlbiA9IGxlZ2VuZExhYmVscy5sZW5ndGgsXG4gICAgICAgICAgICB0aGVtZSA9IHRoaXMudGhlbWUsXG4gICAgICAgICAgICBjaGFydExlZ2VuZFRoZW1lID0gbmUudXRpbC5maWx0ZXIodGhlbWUsIGZ1bmN0aW9uKGl0ZW0sIG5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmUudXRpbC5pbkFycmF5KG5hbWUsIGNoYXJ0Q29uc3QuU0VSSUVTX1BST1BTKSA9PT0gLTEgJiYgbmFtZSAhPT0gJ2xhYmVsJztcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgY2hhcnRUeXBlcyA9IG5lLnV0aWwua2V5cyhjaGFydExlZ2VuZFRoZW1lKSxcbiAgICAgICAgICAgIGRlZmF1bHRMZWdlbmRUaGVtZSA9IHtcbiAgICAgICAgICAgICAgICBjb2xvcnM6IGRlZmF1bHRUaGVtZS5zZXJpZXMuY29sb3JzXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2hhcnRUaGVtZSwgcmVzdWx0O1xuXG4gICAgICAgIGlmICghY2hhcnRUeXBlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuX3NldFRoZW1lVG9MYWJlbHMoam9pbkxlZ2VuZExhYmVscywgdGhlbWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2hhcnRUaGVtZSA9IHRoZW1lW2NoYXJ0VHlwZV0gfHwgZGVmYXVsdExlZ2VuZFRoZW1lO1xuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5fc2V0VGhlbWVUb0xhYmVscyhqb2luTGVnZW5kTGFiZWxzLnNsaWNlKDAsIGxhYmVsTGVuKSwgY2hhcnRUaGVtZSk7XG4gICAgICAgICAgICBjaGFydFRoZW1lID0gdGhlbWVbbmUudXRpbC5maWx0ZXIoY2hhcnRUeXBlcywgZnVuY3Rpb24ocHJvcE5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvcE5hbWUgIT09IGNoYXJ0VHlwZTtcbiAgICAgICAgICAgIH0pWzBdXSB8fCBkZWZhdWx0TGVnZW5kVGhlbWU7XG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KHRoaXMuX3NldFRoZW1lVG9MYWJlbHMoam9pbkxlZ2VuZExhYmVscy5zbGljZShsYWJlbExlbiksIGNoYXJ0VGhlbWUpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGxlZ2VuZCBodG1sLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGxlZ2VuZCBodG1sXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUxlZ2VuZEh0bWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbGFiZWxzID0gdGhpcy5fbWFrZUxlZ2VuZExhYmVscygpLFxuICAgICAgICAgICAgdGVtcGxhdGUgPSBsZWdlbmRUZW1wbGF0ZS5UUExfTEVHRU5ELFxuICAgICAgICAgICAgbGFiZWxIZWlnaHQgPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxIZWlnaHQobGFiZWxzWzBdLmxhYmVsLCBsYWJlbHNbMF0udGhlbWUpICsgKExBQkVMX1BBRERJTkdfVE9QICogMiksXG4gICAgICAgICAgICBiYXNlTWFyZ2luVG9wID0gcGFyc2VJbnQoKGxhYmVsSGVpZ2h0IC0gTEVHRU5EX1JFQ1RfV0lEVEgpIC8gMiwgMTApIC0gMSxcbiAgICAgICAgICAgIGh0bWwgPSBuZS51dGlsLm1hcChsYWJlbHMsIGZ1bmN0aW9uKGxhYmVsLCBpbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciBib3JkZXJDc3NUZXh0ID0gbGFiZWwuYm9yZGVyQ29sb3IgPyByZW5kZXJVdGlsLmNvbmNhdFN0cignO2JvcmRlcjoxcHggc29saWQgJywgbGFiZWwuYm9yZGVyQ29sb3IpIDogJycsXG4gICAgICAgICAgICAgICAgICAgIHJlY3RNYXJnaW4sIG1hcmdpblRvcCwgZGF0YTtcbiAgICAgICAgICAgICAgICBpZiAobGFiZWwuY2hhcnRUeXBlID09PSAnbGluZScpIHtcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luVG9wID0gYmFzZU1hcmdpblRvcCArIExJTkVfTUFSR0lOX1RPUDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBtYXJnaW5Ub3AgPSBiYXNlTWFyZ2luVG9wO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZWN0TWFyZ2luID0gcmVuZGVyVXRpbC5jb25jYXRTdHIoJzttYXJnaW4tdG9wOicsIG1hcmdpblRvcCwgJ3B4Jyk7XG5cbiAgICAgICAgICAgICAgICBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICBjc3NUZXh0OiByZW5kZXJVdGlsLmNvbmNhdFN0cignYmFja2dyb3VuZC1jb2xvcjonLCBsYWJlbC50aGVtZS5zaW5nbGVDb2xvciB8fCBsYWJlbC50aGVtZS5jb2xvciwgYm9yZGVyQ3NzVGV4dCwgcmVjdE1hcmdpbiksXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogbGFiZWxIZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0VHlwZTogbGFiZWwuY2hhcnRUeXBlIHx8ICdyZWN0JyxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGxhYmVsLmxhYmVsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGVtcGxhdGUoZGF0YSk7XG4gICAgICAgICAgICB9LCB0aGlzKS5qb2luKCcnKTtcbiAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBjc3Mgc3R5bGUgb2YgbGFiZWwgYXJlYS5cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCBsYWJlbCBhcmVhIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3tmb250U2l6ZTpudW1iZXIsIGZvbnRGYW1pbHk6IHN0cmluZywgY29sb3I6IHN0cmluZ319IHRoZW1lIGxhYmVsIHRoZW1lXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyTGFiZWxUaGVtZTogZnVuY3Rpb24oZWwsIHRoZW1lKSB7XG4gICAgICAgIHZhciBjc3NUZXh0ID0gcmVuZGVyVXRpbC5tYWtlRm9udENzc1RleHQodGhlbWUpO1xuICAgICAgICBlbC5zdHlsZS5jc3NUZXh0ICs9ICc7JyArIGNzc1RleHQ7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTGVnZW5kO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFRoaXMgaXMgdGVtcGxhdGVzIG9mIGxlZ2VuZCB2aWV3LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxudmFyIHRlbXBsYXRlTWFrZXIgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3RlbXBsYXRlTWFrZXIuanMnKTtcblxudmFyIHRhZ3MgPSB7XG4gICAgSFRNTF9MRUdFTkQ6ICc8ZGl2IGNsYXNzPVwibmUtY2hhcnQtbGVnZW5kXCI+JyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwibmUtY2hhcnQtbGVnZW5kLXJlY3Qge3sgY2hhcnRUeXBlIH19XCIgc3R5bGU9XCJ7eyBjc3NUZXh0IH19XCI+PC9kaXY+JyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwibmUtY2hhcnQtbGVnZW5kLWxhYmVsXCIgc3R5bGU9XCJoZWlnaHQ6e3sgaGVpZ2h0IH19cHhcIj57eyBsYWJlbCB9fTwvZGl2PjwvZGl2Pidcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIFRQTF9MRUdFTkQ6IHRlbXBsYXRlTWFrZXIudGVtcGxhdGUodGFncy5IVE1MX0xFR0VORClcbn07XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgUGxvdCBjb21wb25lbnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBkb20gPSByZXF1aXJlKCcuLi9oZWxwZXJzL2RvbUhhbmRsZXIuanMnKSxcbiAgICBjYWxjdWxhdG9yID0gcmVxdWlyZSgnLi4vaGVscGVycy9jYWxjdWxhdG9yLmpzJyksXG4gICAgcmVuZGVyVXRpbCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvcmVuZGVyVXRpbC5qcycpLFxuICAgIHBsb3RUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vcGxvdFRlbXBsYXRlLmpzJyk7XG5cbnZhciBQbG90ID0gbmUudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIFBsb3QucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBQbG90IGNvbXBvbmVudC5cbiAgICAgKiBAY29uc3RydWN0cyBQbG90XG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnZUaWNrQ291bnQgdmVydGljYWwgdGljayBjb3VudFxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5oVGlja0NvdW50IGhvcml6b250YWwgdGljayBjb3VudFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5ib3VuZCBheGlzIGJvdW5kXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIGF4aXMgdGhlbWVcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgbmUudXRpbC5leHRlbmQodGhpcywgcGFyYW1zKTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFBsb3QgdmlldyBjbGFzc05hbWVcbiAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2xhc3NOYW1lID0gJ25lLWNoYXJ0LXBsb3QtYXJlYSc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBwbG90LlxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCB0b3A6IG51bWJlciwgcmlnaHQ6IG51bWJlcn19IGJvdW5kIHBsb3QgYXJlYSBib3VuZFxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gcGxvdCBlbGVtZW50XG4gICAgICovXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGVsID0gZG9tLmNyZWF0ZSgnRElWJywgdGhpcy5jbGFzc05hbWUpLFxuICAgICAgICAgICAgYm91bmQgPSB0aGlzLmJvdW5kO1xuICAgICAgICByZW5kZXJVdGlsLnJlbmRlckRpbWVuc2lvbihlbCwgYm91bmQuZGltZW5zaW9uKTtcbiAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJQb3NpdGlvbihlbCwgYm91bmQucG9zaXRpb24pO1xuICAgICAgICB0aGlzLl9yZW5kZXJMaW5lcyhlbCwgYm91bmQuZGltZW5zaW9uKTtcblxuICAgICAgICByZXR1cm4gZWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBwbG90IGxpbmVzLlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGRpbWVuc2lvbiBwbG90IGFyZWEgZGltZW5zaW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyTGluZXM6IGZ1bmN0aW9uKGVsLCBkaW1lbnNpb24pIHtcbiAgICAgICAgdmFyIGhQb3NpdGlvbnMgPSB0aGlzLm1ha2VIb3Jpem9udGFsUGl4ZWxQb3NpdGlvbnMoZGltZW5zaW9uLndpZHRoKSxcbiAgICAgICAgICAgIHZQb3NpdGlvbnMgPSB0aGlzLm1ha2VWZXJ0aWNhbFBpeGVsUG9zaXRpb25zKGRpbWVuc2lvbi5oZWlnaHQpLFxuICAgICAgICAgICAgdGhlbWUgPSB0aGlzLnRoZW1lLFxuICAgICAgICAgICAgbGluZUh0bWwgPSAnJztcblxuICAgICAgICBsaW5lSHRtbCArPSB0aGlzLl9tYWtlTGluZUh0bWwoe1xuICAgICAgICAgICAgcG9zaXRpb25zOiBoUG9zaXRpb25zLFxuICAgICAgICAgICAgc2l6ZTogZGltZW5zaW9uLmhlaWdodCxcbiAgICAgICAgICAgIGNsYXNzTmFtZTogJ3ZlcnRpY2FsJyxcbiAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogJ2xlZnQnLFxuICAgICAgICAgICAgc2l6ZVR5cGU6ICdoZWlnaHQnLFxuICAgICAgICAgICAgbGluZUNvbG9yOiB0aGVtZS5saW5lQ29sb3JcbiAgICAgICAgfSk7XG4gICAgICAgIGxpbmVIdG1sICs9IHRoaXMuX21ha2VMaW5lSHRtbCh7XG4gICAgICAgICAgICBwb3NpdGlvbnM6IHZQb3NpdGlvbnMsXG4gICAgICAgICAgICBzaXplOiBkaW1lbnNpb24ud2lkdGgsXG4gICAgICAgICAgICBjbGFzc05hbWU6ICdob3Jpem9udGFsJyxcbiAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogJ2JvdHRvbScsXG4gICAgICAgICAgICBzaXplVHlwZTogJ3dpZHRoJyxcbiAgICAgICAgICAgIGxpbmVDb2xvcjogdGhlbWUubGluZUNvbG9yXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGVsLmlubmVySFRNTCA9IGxpbmVIdG1sO1xuXG4gICAgICAgIHJlbmRlclV0aWwucmVuZGVyQmFja2dyb3VuZChlbCwgdGhlbWUuYmFja2dyb3VuZCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgaHRtbCBvZiBwbG90IGxpbmUuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxvYmplY3Q+fSBwYXJhbXMucG9zaXRpb25zIHBvc2l0aW9uc1xuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5zaXplIHdpZHRoIG9yIGhlaWdodFxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5jbGFzc05hbWUgbGluZSBjbGFzc05hbWVcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMucG9zaXRpb25UeXBlIHBvc2l0aW9uIHR5cGUgKGxlZnQgb3IgYm90dG9tKVxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5zaXplVHlwZSBzaXplIHR5cGUgKHNpemUgb3IgaGVpZ2h0KVxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5saW5lQ29sb3IgbGluZSBjb2xvclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGh0bWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlTGluZUh0bWw6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgdGVtcGxhdGUgPSBwbG90VGVtcGxhdGUuVFBMX1BMT1RfTElORSxcbiAgICAgICAgICAgIGxpbmVIdG1sID0gbmUudXRpbC5tYXAocGFyYW1zLnBvc2l0aW9ucywgZnVuY3Rpb24ocG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgY3NzVGV4dHMgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJVdGlsLmNvbmNhdFN0cihwYXJhbXMucG9zaXRpb25UeXBlLCAnOicsIHBvc2l0aW9uLCAncHgnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlclV0aWwuY29uY2F0U3RyKHBhcmFtcy5zaXplVHlwZSwgJzonLCBwYXJhbXMuc2l6ZSwgJ3B4JylcbiAgICAgICAgICAgICAgICAgICAgXSwgZGF0YTtcblxuICAgICAgICAgICAgICAgIGlmIChwYXJhbXMubGluZUNvbG9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGNzc1RleHRzLnB1c2gocmVuZGVyVXRpbC5jb25jYXRTdHIoJ2JhY2tncm91bmQtY29sb3I6JywgcGFyYW1zLmxpbmVDb2xvcikpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGRhdGEgPSB7Y2xhc3NOYW1lOiBwYXJhbXMuY2xhc3NOYW1lLCBjc3NUZXh0OiBjc3NUZXh0cy5qb2luKCc7Jyl9O1xuICAgICAgICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZShkYXRhKTtcbiAgICAgICAgICAgIH0sIHRoaXMpLmpvaW4oJycpO1xuICAgICAgICByZXR1cm4gbGluZUh0bWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgcGl4ZWwgdmFsdWUgb2YgdmVydGljYWwgcG9zaXRpb25zXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodCBwbG90IGhlaWdodFxuICAgICAqIEByZXR1cm5zIHthcnJheS48bnVtYmVyPn0gcG9zaXRpb25zXG4gICAgICovXG4gICAgbWFrZVZlcnRpY2FsUGl4ZWxQb3NpdGlvbnM6IGZ1bmN0aW9uKGhlaWdodCkge1xuICAgICAgICB2YXIgcG9zaXRpb25zID0gY2FsY3VsYXRvci5tYWtlUGl4ZWxQb3NpdGlvbnMoaGVpZ2h0LCB0aGlzLnZUaWNrQ291bnQpO1xuICAgICAgICBwb3NpdGlvbnMuc2hpZnQoKTtcbiAgICAgICAgcmV0dXJuIHBvc2l0aW9ucztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBwaXhlbCB2YWx1ZSBvZiBob3Jpem9udGFsIHBvc2l0aW9ucy5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGggcGxvdCB3aWR0aFxuICAgICAqIEByZXR1cm5zIHthcnJheS48bnVtYmVyPn0gcG9zaXRpb25zXG4gICAgICovXG4gICAgbWFrZUhvcml6b250YWxQaXhlbFBvc2l0aW9uczogZnVuY3Rpb24od2lkdGgpIHtcbiAgICAgICAgdmFyIHBvc2l0aW9ucyA9IGNhbGN1bGF0b3IubWFrZVBpeGVsUG9zaXRpb25zKHdpZHRoLCB0aGlzLmhUaWNrQ291bnQpO1xuICAgICAgICBwb3NpdGlvbnMuc2hpZnQoKTtcbiAgICAgICAgcmV0dXJuIHBvc2l0aW9ucztcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBQbG90O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFRoaXMgaXMgdGVtcGxhdGVzIG9mIHBsb3QgdmlldyAuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG52YXIgdGVtcGxhdGVNYWtlciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvdGVtcGxhdGVNYWtlci5qcycpO1xuXG52YXIgdGFncyA9IHtcbiAgICBIVE1MX1BMT1RfTElORTogJzxkaXYgY2xhc3M9XCJuZS1jaGFydC1wbG90LWxpbmUge3sgY2xhc3NOYW1lIH19XCIgc3R5bGU9XCJ7eyBjc3NUZXh0IH19XCI+PC9kaXY+J1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgVFBMX1BMT1RfTElORTogdGVtcGxhdGVNYWtlci50ZW1wbGF0ZSh0YWdzLkhUTUxfUExPVF9MSU5FKVxufTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBSYXBoYWVsIHJlbmRlciBwbHVnaW4uXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBCYXJDaGFydCA9IHJlcXVpcmUoJy4vcmFwaGFlbEJhckNoYXJ0LmpzJyksXG4gICAgTGluZUNoYXJ0ID0gcmVxdWlyZSgnLi9yYXBoYWVsTGluZUNoYXJ0LmpzJyksXG4gICAgUGllQ2hhcnQgPSByZXF1aXJlKCcuL3JhcGhhZWxQaWVDaGFydC5qcycpO1xuXG52YXIgcGx1Z2luTmFtZSA9ICdyYXBoYWVsJyxcbiAgICBwbHVnaW5SYXBoYWVsO1xuXG5wbHVnaW5SYXBoYWVsID0ge1xuICAgIGJhcjogQmFyQ2hhcnQsXG4gICAgY29sdW1uOiBCYXJDaGFydCxcbiAgICBsaW5lOiBMaW5lQ2hhcnQsXG4gICAgcGllOiBQaWVDaGFydFxufTtcblxubmUuYXBwbGljYXRpb24uY2hhcnQucmVnaXN0ZXJQbHVnaW4ocGx1Z2luTmFtZSwgcGx1Z2luUmFwaGFlbCk7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgUmFwaGFlbCBiYXIgY2hhcnQgcmVuZGVyZXIuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSYXBoYWVsID0gd2luZG93LlJhcGhhZWw7XG5cbi8qKlxuICogQGNsYXNzZGVzYyBSYXBoYWVsQmFyQ2hhcnQgaXMgZ3JhcGggcmVuZGVyZXIuXG4gKiBAY2xhc3MgUmFwaGFlbEJhckNoYXJ0XG4gKi9cbnZhciBSYXBoYWVsQmFyQ2hhcnQgPSBuZS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgUmFwaGFlbEJhckNoYXJ0LnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogUmVuZGVyIGZ1bmN0aW9uIG9mIGJhciBjaGFydFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNvbnRhaW5lciBlbGVtZW50XG4gICAgICogQHBhcmFtIHt7c2l6ZTogb2JqZWN0LCBtb2RlbDogb2JqZWN0LCBvcHRpb25zOiBvYmplY3QsIHRvb2x0aXBQb3NpdGlvbjogc3RyaW5nfX0gZGF0YSBjaGFydCBkYXRhXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gaW5DYWxsYmFjayBtb3VzZW92ZXIgY2FsbGJhY2tcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvdXRDYWxsYmFjayBtb3VzZW91dCBjYWxsYmFja1xuICAgICAqIEByZXR1cm4ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqL1xuICAgIHJlbmRlcjogZnVuY3Rpb24ocGFwZXIsIGNvbnRhaW5lciwgZGF0YSwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGdyb3VwQm91bmRzID0gZGF0YS5ncm91cEJvdW5kcyxcbiAgICAgICAgICAgIGRpbWVuc2lvbiA9IGRhdGEuZGltZW5zaW9uO1xuXG4gICAgICAgIGlmICghZ3JvdXBCb3VuZHMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghcGFwZXIpIHtcbiAgICAgICAgICAgIHBhcGVyID0gUmFwaGFlbChjb250YWluZXIsIGRpbWVuc2lvbi53aWR0aCwgZGltZW5zaW9uLmhlaWdodCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fcmVuZGVyQmFycyhwYXBlciwgZGF0YS50aGVtZSwgZ3JvdXBCb3VuZHMsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKTtcblxuICAgICAgICByZXR1cm4gcGFwZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBiYXJzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICogQHBhcmFtIHt7Y29sb3JzOiBzdHJpbmdbXSwgc2luZ2xlQ29sb3JzOiBzdHJpbmdbXSwgYm9yZGVyQ29sb3I6IHN0cmluZ319IHRoZW1lIGJhciBjaGFydCB0aGVtZVxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Ljx7bGVmdDogbnVtYmVyLCB0b3A6bnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn0+Pn0gZ3JvdXBCb3VuZHMgYm91bmRzXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gaW5DYWxsYmFjayBpbiBjYWxsYmFja1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG91dENhbGxiYWNrIG91dCBjYWxsYmFja1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlckJhcnM6IGZ1bmN0aW9uKHBhcGVyLCB0aGVtZSwgZ3JvdXBCb3VuZHMsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKSB7XG4gICAgICAgIHZhciBzaW5nbGVDb2xvcnMgPSAoZ3JvdXBCb3VuZHNbMF0ubGVuZ3RoID09PSAxKSAmJiB0aGVtZS5zaW5nbGVDb2xvcnMgfHwgW10sXG4gICAgICAgICAgICBjb2xvcnMgPSB0aGVtZS5jb2xvcnMsXG4gICAgICAgICAgICBib3JkZXJDb2xvciA9IHRoZW1lLmJvcmRlckNvbG9yIHx8ICdub25lJztcbiAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkoZ3JvdXBCb3VuZHMsIGZ1bmN0aW9uKGJvdW5kcywgZ3JvdXBJbmRleCkge1xuICAgICAgICAgICAgdmFyIHNpbmdsZUNvbG9yID0gc2luZ2xlQ29sb3JzW2dyb3VwSW5kZXhdO1xuICAgICAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkoYm91bmRzLCBmdW5jdGlvbihib3VuZCwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29sb3IgPSBzaW5nbGVDb2xvciB8fCBjb2xvcnNbaW5kZXhdLFxuICAgICAgICAgICAgICAgICAgICBpZCA9IGdyb3VwSW5kZXggKyAnLScgKyBpbmRleCxcbiAgICAgICAgICAgICAgICAgICAgcmVjdCA9IHRoaXMuX3JlbmRlckJhcihwYXBlciwgY29sb3IsIGJvcmRlckNvbG9yLCBib3VuZCk7XG4gICAgICAgICAgICAgICAgaWYgKHJlY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYmluZEhvdmVyRXZlbnQocmVjdCwgYm91bmQsIGlkLCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgcmVjdFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbG9yIHNlcmllcyBjb2xvclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBib3JkZXJDb2xvciBzZXJpZXMgYm9yZGVyQ29sb3JcbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGJvdW5kIGJvdW5kXG4gICAgICogQHJldHVybnMge29iamVjdH0gYmFyIHJlY3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJCYXI6IGZ1bmN0aW9uKHBhcGVyLCBjb2xvciwgYm9yZGVyQ29sb3IsIGJvdW5kKSB7XG4gICAgICAgIGlmIChib3VuZC53aWR0aCA8IDAgfHwgYm91bmQuaGVpZ2h0IDwgMCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJlY3QgPSBwYXBlci5yZWN0KGJvdW5kLmxlZnQsIGJvdW5kLnRvcCwgYm91bmQud2lkdGgsIGJvdW5kLmhlaWdodCk7XG4gICAgICAgIHJlY3QuYXR0cih7XG4gICAgICAgICAgICBmaWxsOiBjb2xvcixcbiAgICAgICAgICAgIHN0cm9rZTogYm9yZGVyQ29sb3JcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHJlY3Q7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJpbmQgaG92ZXIgZXZlbnQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHJlY3QgcmFwaGFlbCByZWN0XG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBib3VuZCBib3VuZFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpZCB0b29sdGlwIGlkXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gaW5DYWxsYmFjayBpbiBjYWxsYmFja1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG91dENhbGxiYWNrIG91dCBjYWxsYmFja1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2JpbmRIb3ZlckV2ZW50OiBmdW5jdGlvbihyZWN0LCBib3VuZCwgaWQsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKSB7XG4gICAgICAgIHJlY3QuaG92ZXIoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpbkNhbGxiYWNrKGJvdW5kLCBpZCk7XG4gICAgICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgb3V0Q2FsbGJhY2soaWQpO1xuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSYXBoYWVsQmFyQ2hhcnQ7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgUmFwaGFlbCBsaW5lIGNoYXJ0IHJlbmRlcmVyLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmFwaGFlbCA9IHdpbmRvdy5SYXBoYWVsLFxuICAgIERFRkFVTFRfRE9UX1dJRFRIID0gNCxcbiAgICBIT1ZFUl9ET1RfV0lEVEggPSA1O1xuXG4vKipcbiAqIEBjbGFzc2Rlc2MgUmFwaGFlbExpbmVDaGFydHMgaXMgZ3JhcGggcmVuZGVyZXIuXG4gKiBAY2xhc3MgUmFwaGFlbExpbmVDaGFydFxuICovXG52YXIgUmFwaGFlbExpbmVDaGFydCA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBSYXBoYWVsTGluZUNoYXJ0LnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogUmVuZGVyIGZ1bmN0aW9uIG9yIGxpbmUgY2hhcnQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY29udGFpbmVyXG4gICAgICogQHBhcmFtIHt7Z3JvdXBQb3NpdGlvbnM6IGFycmF5LjxhcnJheT4sIGRpbWVuc2lvbjogb2JqZWN0LCB0aGVtZTogb2JqZWN0LCBvcHRpb25zOiBvYmplY3R9fSBkYXRhIHJlbmRlciBkYXRhXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gaW5DYWxsYmFjayBpbiBjYWxsYmFja1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG91dENhbGxiYWNrIG91dCBjYWxsYmFja1xuICAgICAqIEByZXR1cm4ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqL1xuICAgIHJlbmRlcjogZnVuY3Rpb24ocGFwZXIsIGNvbnRhaW5lciwgZGF0YSwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGRpbWVuc2lvbiA9IGRhdGEuZGltZW5zaW9uLFxuICAgICAgICAgICAgZ3JvdXBQb3NpdGlvbnMgPSBkYXRhLmdyb3VwUG9zaXRpb25zLFxuICAgICAgICAgICAgdGhlbWUgPSBkYXRhLnRoZW1lLFxuICAgICAgICAgICAgY29sb3JzID0gdGhlbWUuY29sb3JzLFxuICAgICAgICAgICAgb3BhY2l0eSA9IGRhdGEub3B0aW9ucy5oYXNEb3QgPyAxIDogMCxcbiAgICAgICAgICAgIGdyb3VwUGF0aHMgPSB0aGlzLl9nZXRMaW5lc1BhdGgoZ3JvdXBQb3NpdGlvbnMpLFxuICAgICAgICAgICAgYm9yZGVyU3R5bGUgPSB0aGlzLl9tYWtlQm9yZGVyU3R5bGUodGhlbWUuYm9yZGVyQ29sb3IsIG9wYWNpdHkpLFxuICAgICAgICAgICAgb3V0RG90U3R5bGUgPSB0aGlzLl9tYWtlT3V0RG90U3R5bGUob3BhY2l0eSwgYm9yZGVyU3R5bGUpLFxuICAgICAgICAgICAgZ3JvdXBEb3RzO1xuXG4gICAgICAgIGlmICghcGFwZXIpIHtcbiAgICAgICAgICAgIHBhcGVyID0gUmFwaGFlbChjb250YWluZXIsIGRpbWVuc2lvbi53aWR0aCwgZGltZW5zaW9uLmhlaWdodCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9yZW5kZXJMaW5lcyhwYXBlciwgZ3JvdXBQYXRocywgY29sb3JzKTtcbiAgICAgICAgZ3JvdXBEb3RzID0gdGhpcy5fcmVuZGVyRG90cyhwYXBlciwgZ3JvdXBQb3NpdGlvbnMsIGNvbG9ycywgb3BhY2l0eSwgYm9yZGVyU3R5bGUpO1xuXG4gICAgICAgIHRoaXMub3V0RG90U3R5bGUgPSBvdXREb3RTdHlsZTtcbiAgICAgICAgdGhpcy5ncm91cERvdHMgPSBncm91cERvdHM7XG5cbiAgICAgICAgdGhpcy5fYXR0YWNoRXZlbnQoZ3JvdXBEb3RzLCBncm91cFBvc2l0aW9ucywgb3V0RG90U3R5bGUsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKTtcblxuICAgICAgICByZXR1cm4gcGFwZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYm9yZGVyIHN0eWxlLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBib3JkZXJDb2xvciBib3JkZXIgY29sb3JcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gb3BhY2l0eSBvcGFjaXR5XG4gICAgICogQHJldHVybnMge3tzdHJva2U6IHN0cmluZywgc3Ryb2tlLXdpZHRoOiBudW1iZXIsIHN0cmlrZS1vcGFjaXR5OiBudW1iZXJ9fSBib3JkZXIgc3R5bGVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQm9yZGVyU3R5bGU6IGZ1bmN0aW9uKGJvcmRlckNvbG9yLCBvcGFjaXR5KSB7XG4gICAgICAgIHZhciBib3JkZXJTdHlsZTtcbiAgICAgICAgaWYgKGJvcmRlckNvbG9yKSB7XG4gICAgICAgICAgICBib3JkZXJTdHlsZSA9IHtcbiAgICAgICAgICAgICAgICAnc3Ryb2tlJzogYm9yZGVyQ29sb3IsXG4gICAgICAgICAgICAgICAgJ3N0cm9rZS13aWR0aCc6IDEsXG4gICAgICAgICAgICAgICAgJ3N0cm9rZS1vcGFjaXR5Jzogb3BhY2l0eVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYm9yZGVyU3R5bGU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgZG90IHN0eWxlIGZvciBtb3VzZW91dCBldmVudC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gb3BhY2l0eSBvcGFjaXR5XG4gICAgICogQHBhcmFtIHtvYmplY3R9IGJvcmRlclN0eWxlIGJvcmRlciBzdHlsZVxuICAgICAqIEByZXR1cm5zIHt7ZmlsbC1vcGFjaXR5OiBudW1iZXIsIHN0cm9rZS1vcGFjaXR5OiBudW1iZXIsIHI6IG51bWJlcn19IHN0eWxlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZU91dERvdFN0eWxlOiBmdW5jdGlvbihvcGFjaXR5LCBib3JkZXJTdHlsZSkge1xuICAgICAgICB2YXIgb3V0RG90U3R5bGUgPSB7XG4gICAgICAgICAgICAnZmlsbC1vcGFjaXR5Jzogb3BhY2l0eSxcbiAgICAgICAgICAgICdzdHJva2Utb3BhY2l0eSc6IDAsXG4gICAgICAgICAgICByOiA0XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKGJvcmRlclN0eWxlKSB7XG4gICAgICAgICAgICBuZS51dGlsLmV4dGVuZChvdXREb3RTdHlsZSwgYm9yZGVyU3R5bGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG91dERvdFN0eWxlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgZG90LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGFlclxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBwb3NpdGlvbiBkb3QgcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29sb3IgZG90IGNvbG9yXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG9wYWNpdHkgb3BhY2l0eVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBib3JkZXJTdHlsZSBib3JkZXIgc3R5bGVcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSByYXBoYWVsIGRvdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlckRvdDogZnVuY3Rpb24ocGFwZXIsIHBvc2l0aW9uLCBjb2xvciwgb3BhY2l0eSwgYm9yZGVyU3R5bGUpIHtcbiAgICAgICAgdmFyIGRvdCA9IHBhcGVyLmNpcmNsZShwb3NpdGlvbi5sZWZ0LCBwb3NpdGlvbi50b3AsIERFRkFVTFRfRE9UX1dJRFRIKSxcbiAgICAgICAgICAgIGRvdFN0eWxlID0ge1xuICAgICAgICAgICAgICAgIGZpbGw6IGNvbG9yLFxuICAgICAgICAgICAgICAgICdmaWxsLW9wYWNpdHknOiBvcGFjaXR5LFxuICAgICAgICAgICAgICAgICdzdHJva2Utb3BhY2l0eSc6IDBcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgaWYgKGJvcmRlclN0eWxlKSB7XG4gICAgICAgICAgICBuZS51dGlsLmV4dGVuZChkb3RTdHlsZSwgYm9yZGVyU3R5bGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgZG90LmF0dHIoZG90U3R5bGUpO1xuXG4gICAgICAgIHJldHVybiBkb3Q7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBkb3RzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXkuPG9iamVjdD4+fSBncm91cFBvc2l0aW9ucyBwb3NpdGlvbnNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBjb2xvcnMgY29sb3JzXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG9wYWNpdHkgb3BhY2l0eVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBib3JkZXJTdHlsZSBib3JkZXIgc3R5bGVcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPG9iamVjdD59IGRvdHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJEb3RzOiBmdW5jdGlvbihwYXBlciwgZ3JvdXBQb3NpdGlvbnMsIGNvbG9ycywgb3BhY2l0eSwgYm9yZGVyU3R5bGUpIHtcbiAgICAgICAgdmFyIGRvdHMgPSBuZS51dGlsLm1hcChncm91cFBvc2l0aW9ucywgZnVuY3Rpb24ocG9zaXRpb25zLCBncm91cEluZGV4KSB7XG4gICAgICAgICAgICB2YXIgY29sb3IgPSBjb2xvcnNbZ3JvdXBJbmRleF07XG4gICAgICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAocG9zaXRpb25zLCBmdW5jdGlvbihwb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIHZhciBkb3QgPSB0aGlzLl9yZW5kZXJEb3QocGFwZXIsIHBvc2l0aW9uLCBjb2xvciwgb3BhY2l0eSwgYm9yZGVyU3R5bGUpO1xuICAgICAgICAgICAgICAgIHJldHVybiBkb3Q7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgcmV0dXJuIGRvdHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgbGluZSBwYXRoLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBmeCBmcm9tIHhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZnkgZnJvbSB5XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHR4IHRvIHhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdHkgdG8geVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aCB3aWR0aFxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IHBhdGhcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlTGluZVBhdGg6IGZ1bmN0aW9uKGZ4LCBmeSwgdHgsIHR5LCB3aWR0aCkge1xuICAgICAgICB2YXIgZnJvbVBvaW50ID0gW2Z4LCBmeV07XG4gICAgICAgIHZhciB0b1BvaW50ID0gW3R4LCB0eV07XG5cbiAgICAgICAgd2lkdGggPSB3aWR0aCB8fCAxO1xuXG4gICAgICAgIGlmIChmcm9tUG9pbnRbMF0gPT09IHRvUG9pbnRbMF0pIHtcbiAgICAgICAgICAgIGZyb21Qb2ludFswXSA9IHRvUG9pbnRbMF0gPSBNYXRoLnJvdW5kKGZyb21Qb2ludFswXSkgLSAod2lkdGggJSAyIC8gMik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZyb21Qb2ludFsxXSA9PT0gdG9Qb2ludFsxXSkge1xuICAgICAgICAgICAgZnJvbVBvaW50WzFdID0gdG9Qb2ludFsxXSA9IE1hdGgucm91bmQoZnJvbVBvaW50WzFdKSArICh3aWR0aCAlIDIgLyAyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAnTScgKyBmcm9tUG9pbnQuam9pbignICcpICsgJ0wnICsgdG9Qb2ludC5qb2luKCcgJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjZW50ZXIgcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gZnJvbVBvcyBmcm9tIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IHRvUG9zIHRvIHBvc2l0aW9uXG4gICAgICogQHJldHVybnMge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gcG9zaXRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRDZW50ZXI6IGZ1bmN0aW9uKGZyb21Qb3MsIHRvUG9zKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsZWZ0OiAoZnJvbVBvcy5sZWZ0ICsgdG9Qb3MubGVmdCkgLyAyLFxuICAgICAgICAgICAgdG9wOiAoZnJvbVBvcy50b3AgKyB0b1Bvcy50b3ApIC8gMlxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgbGluZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGggbGluZSBwYXRoXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbG9yIGxpbmUgY29sb3JcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3Ryb2tlV2lkdGggc3Ryb2tlIHdpZHRoXG4gICAgICogQHJldHVybnMge29iamVjdH0gcmFwaGFlbCBsaW5lXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyTGluZTogZnVuY3Rpb24ocGFwZXIsIHBhdGgsIGNvbG9yLCBzdHJva2VXaWR0aCkge1xuICAgICAgICB2YXIgbGluZSA9IHBhcGVyLnBhdGgoW3BhdGhdKSxcbiAgICAgICAgICAgIHN0cm9rZVN0eWxlID0ge1xuICAgICAgICAgICAgICAgIHN0cm9rZTogY29sb3IsXG4gICAgICAgICAgICAgICAgJ3N0cm9rZS13aWR0aCc6IHN0cm9rZVdpZHRoIHx8IDJcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgaWYgKGNvbG9yID09PSAndHJhbnNwYXJlbnQnKSB7XG4gICAgICAgICAgICBzdHJva2VTdHlsZS5zdHJva2UgPSAnI2ZmZic7XG4gICAgICAgICAgICBzdHJva2VTdHlsZVsnc3Ryb2tlLW9wYWNpdHknXSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgbGluZS5hdHRyKHN0cm9rZVN0eWxlKTtcblxuICAgICAgICByZXR1cm4gbGluZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGJhY2tncm91bmQgbGluZXMuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheS48c3RyaW5nPj59IGdyb3VwUGF0aHMgcGF0aHNcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gbGluZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJCZ0xpbmVzOiBmdW5jdGlvbihwYXBlciwgZ3JvdXBQYXRocykge1xuICAgICAgICB2YXIgZ3JvdXBMaW5lcyA9IHRoaXMuX3JlbmRlckxpbmVzKHBhcGVyLCBncm91cFBhdGhzLCBbXSwgMTApO1xuICAgICAgICByZXR1cm4gZ3JvdXBMaW5lcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGxpbmVzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXkuPHN0cmluZz4+fSBncm91cFBhdGhzIHBhdGhzXG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gY29sb3JzIGxpbmUgY29sb3JzXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHN0cm9rZVdpZHRoIHN0cm9rZSB3aWR0aFxuICAgICAqIEByZXR1cm5zIHthcnJheS48YXJyYXkuPG9iamVjdD4+fSBsaW5lc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlckxpbmVzOiBmdW5jdGlvbihwYXBlciwgZ3JvdXBQYXRocywgY29sb3JzLCBzdHJva2VXaWR0aCkge1xuICAgICAgICB2YXIgZ3JvdXBMaW5lcyA9IG5lLnV0aWwubWFwKGdyb3VwUGF0aHMsIGZ1bmN0aW9uKHBhdGhzLCBncm91cEluZGV4KSB7XG4gICAgICAgICAgICB2YXIgY29sb3IgPSBjb2xvcnNbZ3JvdXBJbmRleF0gfHwgJ3RyYW5zcGFyZW50JztcbiAgICAgICAgICAgIHJldHVybiBuZS51dGlsLm1hcChwYXRocywgZnVuY3Rpb24ocGF0aCkge1xuICAgICAgICAgICAgICAgIHZhciBmaXJzdExpbmUgPSB0aGlzLl9yZW5kZXJMaW5lKHBhcGVyLCBwYXRoWzBdLCBjb2xvciwgc3Ryb2tlV2lkdGgpLFxuICAgICAgICAgICAgICAgICAgICBzZWNvbmRMaW5lID0gdGhpcy5fcmVuZGVyTGluZShwYXBlciwgcGF0aFsxXSwgY29sb3IsIHN0cm9rZVdpZHRoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gW2ZpcnN0TGluZSwgc2Vjb25kTGluZV07XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgcmV0dXJuIGdyb3VwTGluZXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBsaW5lcyBwYXRoLlxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gZ3JvdXBQb3NpdGlvbnMgcG9zaXRpb25zXG4gICAgICogQHJldHVybnMge2FycmF5LjxhcnJheS48c3RyaW5nPj59IHBhdGhzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0TGluZXNQYXRoOiBmdW5jdGlvbihncm91cFBvc2l0aW9ucykge1xuICAgICAgICB2YXIgZ3JvdXBQYXRocyA9IG5lLnV0aWwubWFwKGdyb3VwUG9zaXRpb25zLCBmdW5jdGlvbihwb3NpdGlvbnMpIHtcbiAgICAgICAgICAgIHZhciBmcm9tUG9zID0gcG9zaXRpb25zWzBdLFxuICAgICAgICAgICAgICAgIHJlc3QgPSBwb3NpdGlvbnMuc2xpY2UoMSk7XG4gICAgICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAocmVzdCwgZnVuY3Rpb24ocG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgY2VudGVyUG9zID0gdGhpcy5fZ2V0Q2VudGVyKGZyb21Qb3MsIHBvc2l0aW9uKSxcbiAgICAgICAgICAgICAgICAgICAgZmlyc3RQYXRoID0gdGhpcy5fbWFrZUxpbmVQYXRoKGZyb21Qb3MubGVmdCwgZnJvbVBvcy50b3AsIGNlbnRlclBvcy5sZWZ0LCBjZW50ZXJQb3MudG9wKSxcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kUGF0aCA9IHRoaXMuX21ha2VMaW5lUGF0aChjZW50ZXJQb3MubGVmdCwgY2VudGVyUG9zLnRvcCwgcG9zaXRpb24ubGVmdCwgcG9zaXRpb24udG9wKTtcbiAgICAgICAgICAgICAgICBmcm9tUG9zID0gcG9zaXRpb247XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtmaXJzdFBhdGgsIHNlY29uZFBhdGhdO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgICByZXR1cm4gZ3JvdXBQYXRocztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQmluZCBob3ZlciBldmVudC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGFyZ2V0IHJhcGhhZWwgaXRlbVxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBwb3NpdGlvbiBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpZCBpZFxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGluQ2FsbGJhY2sgaW4gY2FsbGJhY2tcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvdXRDYWxsYmFjayBvdXQgY2FsbGJhY2tcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9iaW5kSG92ZXJFdmVudDogZnVuY3Rpb24odGFyZ2V0LCBwb3NpdGlvbiwgaWQsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKSB7XG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgdGFyZ2V0LmhvdmVyKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhhdC5zaG93ZWRJZCA9IGlkO1xuICAgICAgICAgICAgaW5DYWxsYmFjayhwb3NpdGlvbiwgaWQpO1xuICAgICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIG91dENhbGxiYWNrKGlkKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCBldmVudC5cbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheS48b2JqZWN0Pj59IGdyb3VwRG90cyBkb3RzXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXkuPG9iamVjdD4+fSBncm91cFBvc2l0aW9ucyBwb3NpdGlvbnNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3V0RG90U3R5bGUgZG90IHN0eWxlXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gaW5DYWxsYmFjayBpbiBjYWxsYmFja1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG91dENhbGxiYWNrIG91dCBjYWxsYmFja1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2F0dGFjaEV2ZW50OiBmdW5jdGlvbihncm91cERvdHMsIGdyb3VwUG9zaXRpb25zLCBvdXREb3RTdHlsZSwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spIHtcbiAgICAgICAgbmUudXRpbC5mb3JFYWNoKGdyb3VwRG90cywgZnVuY3Rpb24oZG90cywgZ3JvdXBJbmRleCkge1xuICAgICAgICAgICAgbmUudXRpbC5mb3JFYWNoKGRvdHMsIGZ1bmN0aW9uKGRvdCwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgcG9zaXRpb24gPSBncm91cFBvc2l0aW9uc1tncm91cEluZGV4XVtpbmRleF0sXG4gICAgICAgICAgICAgICAgICAgIGlkID0gaW5kZXggKyAnLScgKyBncm91cEluZGV4O1xuICAgICAgICAgICAgICAgICAgICAvL3ByZXZJbmRleCwgcHJldkRvdCwgcHJldlBvc2l0b24sIHByZXZJZCwgYmdMaW5lcywgbGluZXM7XG4gICAgICAgICAgICAgICAgdGhpcy5fYmluZEhvdmVyRXZlbnQoZG90LCBwb3NpdGlvbiwgaWQsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICAvL2lmIChpbmRleCA+IDApIHtcbiAgICAgICAgICAgICAgICAvLyAgICBwcmV2SW5kZXggPSBpbmRleCAtIDE7XG4gICAgICAgICAgICAgICAgLy8gICAgcHJldkRvdCA9IHNjb3BlW3ByZXZJbmRleF07XG4gICAgICAgICAgICAgICAgLy8gICAgcHJldlBvc2l0b24gPSBncm91cFBvc2l0aW9uc1tncm91cEluZGV4XVtwcmV2SW5kZXhdO1xuICAgICAgICAgICAgICAgIC8vICAgIHByZXZJZCA9IHByZXZJbmRleCArICctJyArIGdyb3VwSW5kZXg7XG4gICAgICAgICAgICAgICAgLy8gICAgLy9iZ0xpbmVzID0gZ3JvdXBCZ0xpbmVzW2dyb3VwSW5kZXhdW3ByZXZJbmRleF07XG4gICAgICAgICAgICAgICAgLy8gICAgbGluZXMgPSBncm91cExpbmVzW2dyb3VwSW5kZXhdW3ByZXZJbmRleF07XG4gICAgICAgICAgICAgICAgLy8gICAgdGhpcy5fYmluZEhvdmVyRXZlbnQoYmdMaW5lc1swXSwgcHJldkRvdCwgb3V0RG90U3R5bGUsIHByZXZQb3NpdG9uLCBwcmV2SWQsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICAvLyAgICB0aGlzLl9iaW5kSG92ZXJFdmVudChiZ0xpbmVzWzFdLCBkb3QsIG91dERvdFN0eWxlLCBwb3NpdGlvbiwgaWQsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICAvLyAgICB0aGlzLl9iaW5kSG92ZXJFdmVudChsaW5lc1swXSwgcHJldkRvdCwgb3V0RG90U3R5bGUsIHByZXZQb3NpdG9uLCBwcmV2SWQsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICAvLyAgICB0aGlzLl9iaW5kSG92ZXJFdmVudChsaW5lc1sxXSwgZG90LCBvdXREb3RTdHlsZSwgcG9zaXRpb24sIGlkLCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgLy99XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNob3cgYW5pbWF0aW9uLlxuICAgICAqIEBwYXJhbSB7e2dyb3VwSW5kZXg6IG51bWJlciwgaW5kZXg6bnVtYmVyfX0gZGF0YSBzaG93IGluZm9cbiAgICAgKi9cbiAgICBzaG93QW5pbWF0aW9uOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBpbmRleCA9IGRhdGEuZ3JvdXBJbmRleCwgLy8gTGluZSBjaGFydCBoYXMgcGl2b3QgdmFsdWVzLlxuICAgICAgICAgICAgZ3JvdXBJbmRleCA9IGRhdGEuaW5kZXgsXG4gICAgICAgICAgICBkb3QgPSB0aGlzLmdyb3VwRG90c1tncm91cEluZGV4XVtpbmRleF07XG5cbiAgICAgICAgZG90LmF0dHIoe1xuICAgICAgICAgICAgJ2ZpbGwtb3BhY2l0eSc6IDEsXG4gICAgICAgICAgICAnc3Ryb2tlLW9wYWNpdHknOiAwLjMsXG4gICAgICAgICAgICAnc3Ryb2tlLXdpZHRoJzogMyxcbiAgICAgICAgICAgIHI6IEhPVkVSX0RPVF9XSURUSFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSGlkZSBhbmltYXRpb24uXG4gICAgICogQHBhcmFtIHt7Z3JvdXBJbmRleDogbnVtYmVyLCBpbmRleDpudW1iZXJ9fSBkYXRhIGhpZGUgaW5mb1xuICAgICAqL1xuICAgIGhpZGVBbmltYXRpb246IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gZGF0YS5ncm91cEluZGV4LCAvLyBMaW5lIGNoYXJ0IGhhcyBwaXZvdCB2YWx1ZXMuXG4gICAgICAgICAgICBncm91cEluZGV4ID0gZGF0YS5pbmRleCxcbiAgICAgICAgICAgIGRvdCA9IHRoaXMuZ3JvdXBEb3RzW2dyb3VwSW5kZXhdW2luZGV4XTtcblxuICAgICAgICBkb3QuYXR0cih0aGlzLm91dERvdFN0eWxlKTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSYXBoYWVsTGluZUNoYXJ0O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFJhcGhhZWwgcGllIGNoYXJ0IHJlbmRlcmVyLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmFwaGFlbCA9IHdpbmRvdy5SYXBoYWVsLFxuICAgIFJBRCA9IE1hdGguUEkgLyAxODAsXG4gICAgQU5JTUFUSU9OX1RJTUUgPSA1MDA7XG5cbi8qKlxuICogQGNsYXNzZGVzYyBSYXBoYWVsUGllQ2hhcnRzIGlzIGdyYXBoIHJlbmRlcmVyLlxuICogQGNsYXNzIFJhcGhhZWxQaWVDaGFydFxuICovXG52YXIgUmFwaGFlbFBpZUNoYXJ0ID0gbmUudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIFJhcGhhZWxQaWVDaGFydC5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIFJlbmRlciBmdW5jdGlvbiBvciBsaW5lIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNvbnRhaW5lclxuICAgICAqIEBwYXJhbSB7e3BlcmNlbnRWYWx1ZXM6IGFycmF5LjxudW1iZXI+LCBjaXJjbGVCb3VuZHM6IHtjeDogbnVtYmVyLCBjeTogbnVtYmVyLCByOiBudW1iZXJ9LCBkaW1lbnNpb246IG9iamVjdCwgdGhlbWU6IG9iamVjdCwgb3B0aW9uczogb2JqZWN0fX0gZGF0YSByZW5kZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGluQ2FsbGJhY2sgaW4gY2FsbGJhY2tcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvdXRDYWxsYmFjayBvdXQgY2FsbGJhY2tcbiAgICAgKiBAcmV0dXJuIHtvYmplY3R9IHBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKi9cbiAgICByZW5kZXI6IGZ1bmN0aW9uKHBhcGVyLCBjb250YWluZXIsIGRhdGEsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKSB7XG4gICAgICAgIHZhciBkaW1lbnNpb24gPSBkYXRhLmRpbWVuc2lvbjtcbiAgICAgICAgaWYgKCFwYXBlcikge1xuICAgICAgICAgICAgcGFwZXIgPSBSYXBoYWVsKGNvbnRhaW5lciwgZGltZW5zaW9uLndpZHRoLCBkaW1lbnNpb24uaGVpZ2h0KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9yZW5kZXJQaWUocGFwZXIsIGRhdGEsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKTtcblxuICAgICAgICByZXR1cm4gcGFwZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBzZWN0b3JcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMucGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqICAgICAgQHBhcmFtIHt7Y3g6IG51bWJlciwgY3k6IG51bWJlciwgcjpudW1iZXJ9fSBwYXJhbXMuY2lyY2xlQm91bmRzIGNpcmNsZSBib3VuZHNcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuc3RhcnRBbmdsZSBzdGFydCBhbmdsZVxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5lbmRBbmdsZSBlbmQgYW5nbGVcbiAgICAgKiAgICAgIEBwYXJhbSB7e2ZpbGw6IHN0cmluZywgc3Ryb2tlOiBzdHJpbmcsIHN0cmlrZS13aWR0aDogc3RyaW5nfX0gcGFyYW1zLmF0dHJzIGF0dHJzXG4gICAgICogQHJldHVybnMge29iamVjdH0gcmFwaGFlbCBvYmplY3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJTZWN0b3I6IGZ1bmN0aW9uIChwYXJhbXMpIHtcbiAgICAgICAgdmFyIGN4ID0gcGFyYW1zLmNpcmNsZUJvdW5kcy5jeCxcbiAgICAgICAgICAgIGN5ID0gcGFyYW1zLmNpcmNsZUJvdW5kcy5jeSxcbiAgICAgICAgICAgIHIgPSBwYXJhbXMuY2lyY2xlQm91bmRzLnIsXG4gICAgICAgICAgICB4MSA9IGN4ICsgciAqIE1hdGguY29zKC1wYXJhbXMuc3RhcnRBbmdsZSAqIFJBRCksXG4gICAgICAgICAgICB4MiA9IGN4ICsgciAqIE1hdGguY29zKC1wYXJhbXMuZW5kQW5nbGUgKiBSQUQpLFxuICAgICAgICAgICAgeTEgPSBjeSArIHIgKiBNYXRoLnNpbigtcGFyYW1zLnN0YXJ0QW5nbGUgKiBSQUQpLFxuICAgICAgICAgICAgeTIgPSBjeSArIHIgKiBNYXRoLnNpbigtcGFyYW1zLmVuZEFuZ2xlICogUkFEKSxcbiAgICAgICAgICAgIHBhdGhQYXJhbSA9IFtcIk1cIiwgY3gsIGN5LCBcIkxcIiwgeDEsIHkxLCBcIkFcIiwgciwgciwgMCwgKyhwYXJhbXMuZW5kQW5nbGUgLSBwYXJhbXMuc3RhcnRBbmdsZSA+IDE4MCksIDAsIHgyLCB5MiwgXCJ6XCJdO1xuICAgICAgICByZXR1cm4gcGFyYW1zLnBhcGVyLnBhdGgocGF0aFBhcmFtKS5hdHRyKHBhcmFtcy5hdHRycyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBwaWUgZ3JhcGguXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKiBAcGFyYW0ge3twZXJjZW50VmFsdWVzOiBhcnJheS48bnVtYmVyPiwgY2lyY2xlQm91bmRzOiB7Y3g6IG51bWJlciwgY3k6IG51bWJlciwgcjogbnVtYmVyfSwgZGltZW5zaW9uOiBvYmplY3QsIHRoZW1lOiBvYmplY3QsIG9wdGlvbnM6IG9iamVjdH19IGRhdGEgcmVuZGVyIGRhdGFcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBpbkNhbGxiYWNrIGluIGNhbGxiYWNrXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gb3V0Q2FsbGJhY2sgb3V0IGNhbGxiYWNrXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyUGllOiBmdW5jdGlvbihwYXBlciwgZGF0YSwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHBlcmNlbnRWYWx1ZXMgPSBkYXRhLnBlcmNlbnRWYWx1ZXNbMF0sXG4gICAgICAgICAgICBjaXJjbGVCb3VuZHMgPSBkYXRhLmNpcmNsZUJvdW5kcyxcbiAgICAgICAgICAgIGNvbG9ycyA9IGRhdGEudGhlbWUuY29sb3JzLFxuICAgICAgICAgICAgY2hhcnRCYWNrZ3JvdW5kID0gZGF0YS5jaGFydEJhY2tncm91bmQsXG4gICAgICAgICAgICBjeCA9IGNpcmNsZUJvdW5kcy5jeCxcbiAgICAgICAgICAgIGN5ID0gY2lyY2xlQm91bmRzLmN5LFxuICAgICAgICAgICAgciA9IGNpcmNsZUJvdW5kcy5yLFxuICAgICAgICAgICAgYW5nbGUgPSAwLFxuICAgICAgICAgICAgZGVsdGEgPSAxMCxcbiAgICAgICAgICAgIGNoYXJ0ID0gcGFwZXIuc2V0KCk7XG5cbiAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkocGVyY2VudFZhbHVlcywgZnVuY3Rpb24ocGVyY2VudFZhbHVlLCBpbmRleCkge1xuICAgICAgICAgICAgdmFyIGFuZ2xlUGx1cyA9IDM2MCAqIHBlcmNlbnRWYWx1ZSxcbiAgICAgICAgICAgICAgICBwb3BBbmdsZSA9IGFuZ2xlICsgKGFuZ2xlUGx1cyAvIDIpLFxuICAgICAgICAgICAgICAgIGNvbG9yID0gY29sb3JzW2luZGV4XSxcbiAgICAgICAgICAgICAgICBwID0gdGhpcy5fcmVuZGVyU2VjdG9yKHtcbiAgICAgICAgICAgICAgICAgICAgcGFwZXI6IHBhcGVyLFxuICAgICAgICAgICAgICAgICAgICBjaXJjbGVCb3VuZHM6IGNpcmNsZUJvdW5kcyxcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRBbmdsZTogYW5nbGUsXG4gICAgICAgICAgICAgICAgICAgIGVuZEFuZ2xlOiBhbmdsZSArIGFuZ2xlUGx1cyxcbiAgICAgICAgICAgICAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGw6IFwiOTAtXCIgKyBjb2xvciArIFwiLVwiICsgY29sb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJva2U6IGNoYXJ0QmFja2dyb3VuZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICdzdHJva2Utd2lkdGgnOiAxXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBwb3NpdGlvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogY3ggKyAociArIGRlbHRhKSAqIE1hdGguY29zKC1wb3BBbmdsZSAqIFJBRCksXG4gICAgICAgICAgICAgICAgICAgIHRvcDogY3kgKyAociArIGRlbHRhKSAqIE1hdGguc2luKC1wb3BBbmdsZSAqIFJBRClcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLl9iaW5kSG92ZXJFdmVudCh7XG4gICAgICAgICAgICAgICAgdGFyZ2V0OiBwLFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBwb3NpdGlvbixcbiAgICAgICAgICAgICAgICBpZDogJzAtJyArIGluZGV4LFxuICAgICAgICAgICAgICAgIGluQ2FsbGJhY2s6IGluQ2FsbGJhY2ssXG4gICAgICAgICAgICAgICAgb3V0Q2FsbGJhY2s6IG91dENhbGxiYWNrXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNoYXJ0LnB1c2gocCk7XG4gICAgICAgICAgICBhbmdsZSArPSBhbmdsZVBsdXM7XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIHRoaXMuY2lyY2xlQm91bmRzID0gY2lyY2xlQm91bmRzO1xuICAgICAgICB0aGlzLmNoYXJ0ID0gY2hhcnQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJpbmQgaG92ZXIgZXZlbnQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRhcmdldCByYXBoYWVsIGl0ZW1cbiAgICAgKiAgICAgIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBwYXJhbXMucG9zaXRpb24gcG9zaXRpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMuaWQgaWRcbiAgICAgKiAgICAgIEBwYXJhbSB7ZnVuY3Rpb259IHBhcmFtcy5pbkNhbGxiYWNrIGluIGNhbGxiYWNrXG4gICAgICogICAgICBAcGFyYW0ge2Z1bmN0aW9ufSBwYXJhbXMub3V0Q2FsbGJhY2sgb3V0IGNhbGxiYWNrXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYmluZEhvdmVyRXZlbnQ6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgIHBhcmFtcy50YXJnZXQubW91c2VvdmVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoYXQuc2hvd2VkSWQgPSBwYXJhbXMuaWQ7XG4gICAgICAgICAgICBwYXJhbXMuaW5DYWxsYmFjayhwYXJhbXMucG9zaXRpb24sIHBhcmFtcy5pZCk7XG4gICAgICAgIH0pLm1vdXNlb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHBhcmFtcy5vdXRDYWxsYmFjayhwYXJhbXMuaWQpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2hvdyBhbmltYXRpb24uXG4gICAgICogQHBhcmFtIHt7Z3JvdXBJbmRleDogbnVtYmVyLCBpbmRleDpudW1iZXJ9fSBkYXRhIHNob3cgaW5mb1xuICAgICAqL1xuICAgIHNob3dBbmltYXRpb246IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIHRhcmdldCA9IHRoaXMuY2hhcnRbZGF0YS5pbmRleF0sXG4gICAgICAgICAgICBjeCA9IHRoaXMuY2lyY2xlQm91bmRzLmN4LFxuICAgICAgICAgICAgY3kgPSB0aGlzLmNpcmNsZUJvdW5kcy5jeTtcbiAgICAgICAgdGFyZ2V0LnN0b3AoKS5hbmltYXRlKHt0cmFuc2Zvcm06IFwiczEuMSAxLjEgXCIgKyBjeCArIFwiIFwiICsgY3l9LCBBTklNQVRJT05fVElNRSwgXCJlbGFzdGljXCIpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBIaWRlIGFuaW1hdGlvbi5cbiAgICAgKiBAcGFyYW0ge3tncm91cEluZGV4OiBudW1iZXIsIGluZGV4Om51bWJlcn19IGRhdGEgaGlkZSBpbmZvXG4gICAgICovXG4gICAgaGlkZUFuaW1hdGlvbjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgdGFyZ2V0ID0gdGhpcy5jaGFydFtkYXRhLmluZGV4XTtcbiAgICAgICAgdGFyZ2V0LnN0b3AoKS5hbmltYXRlKHt0cmFuc2Zvcm06IFwiXCJ9LCBBTklNQVRJT05fVElNRSwgXCJlbGFzdGljXCIpO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhcGhhZWxQaWVDaGFydDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuL2NvbnN0LmpzJyksXG4gICAgY2hhcnRGYWN0b3J5ID0gcmVxdWlyZSgnLi9mYWN0b3JpZXMvY2hhcnRGYWN0b3J5LmpzJyksXG4gICAgQmFyQ2hhcnQgPSByZXF1aXJlKCcuL2NoYXJ0cy9iYXJDaGFydC5qcycpLFxuICAgIENvbHVtbkNoYXJ0ID0gcmVxdWlyZSgnLi9jaGFydHMvY29sdW1uQ2hhcnQuanMnKSxcbiAgICBMaW5lQ2hhcnQgPSByZXF1aXJlKCcuL2NoYXJ0cy9saW5lQ2hhcnQuanMnKSxcbiAgICBDb21ib0NoYXJ0ID0gcmVxdWlyZSgnLi9jaGFydHMvY29tYm9DaGFydC5qcycpLFxuICAgIFBpZUNoYXJ0ID0gcmVxdWlyZSgnLi9jaGFydHMvcGllQ2hhcnQuanMnKTtcblxuY2hhcnRGYWN0b3J5LnJlZ2lzdGVyKGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9CQVIsIEJhckNoYXJ0KTtcbmNoYXJ0RmFjdG9yeS5yZWdpc3RlcihjaGFydENvbnN0LkNIQVJUX1RZUEVfQ09MVU1OLCBDb2x1bW5DaGFydCk7XG5jaGFydEZhY3RvcnkucmVnaXN0ZXIoY2hhcnRDb25zdC5DSEFSVF9UWVBFX0xJTkUsIExpbmVDaGFydCk7XG5jaGFydEZhY3RvcnkucmVnaXN0ZXIoY2hhcnRDb25zdC5DSEFSVF9UWVBFX0NPTUJPLCBDb21ib0NoYXJ0KTtcbmNoYXJ0RmFjdG9yeS5yZWdpc3RlcihjaGFydENvbnN0LkNIQVJUX1RZUEVfUElFLCBQaWVDaGFydCk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjaGFydENvbnN0ID0gcmVxdWlyZSgnLi9jb25zdC5qcycpLFxuICAgIHRoZW1lRmFjdG9yeSA9IHJlcXVpcmUoJy4vZmFjdG9yaWVzL3RoZW1lRmFjdG9yeS5qcycpLFxuICAgIGRlZmF1bHRUaGVtZSA9IHJlcXVpcmUoJy4vdGhlbWVzL2RlZmF1bHRUaGVtZS5qcycpO1xuXG50aGVtZUZhY3RvcnkucmVnaXN0ZXIoY2hhcnRDb25zdC5ERUZBVUxUX1RIRU1FX05BTUUsIGRlZmF1bHRUaGVtZSk7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgQmFyIGNoYXJ0IHNlcmllcyBjb21wb25lbnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTZXJpZXMgPSByZXF1aXJlKCcuL3Nlcmllcy5qcycpLFxuICAgIHJlbmRlclV0aWwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3JlbmRlclV0aWwuanMnKTtcblxudmFyIEhJRERFTl9XSURUSCA9IDE7XG5cbnZhciBCYXJDaGFydFNlcmllcyA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoU2VyaWVzLCAvKiogQGxlbmRzIFNlcmllcy5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIEJhciBjaGFydCBzZXJpZXMgY29tcG9uZW50LlxuICAgICAqIEBjb25zdHJ1Y3RzIEJhckNoYXJ0U2VyaWVzXG4gICAgICogQGV4dGVuZHMgU2VyaWVzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm1vZGVsIHNlcmllcyBtb2RlbFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5vcHRpb25zIHNlcmllcyBvcHRpb25zXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIHNlcmllcyB0aGVtZVxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBTZXJpZXMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBib3VuZHMgb2YgYmFyIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDpudW1iZXJ9fSBkaW1lbnNpb24gYmFyIGNoYXJ0IGRpbWVuc2lvblxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBoaWRkZW5XaWR0aCBoaWRkZW4gd2lkdGhcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gYm91bmRzXG4gICAgICovXG4gICAgX21ha2VCb3VuZHM6IGZ1bmN0aW9uKGRpbWVuc2lvbiwgaGlkZGVuV2lkdGgpIHtcbiAgICAgICAgaGlkZGVuV2lkdGggPSBoaWRkZW5XaWR0aCB8fCAocmVuZGVyVXRpbC5pc0lFOCgpID8gMCA6IEhJRERFTl9XSURUSCk7XG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLnN0YWNrZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9tYWtlTm9ybWFsQmFyQm91bmRzKGRpbWVuc2lvbiwgaGlkZGVuV2lkdGgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21ha2VTdGFja2VkQmFyQm91bmRzKGRpbWVuc2lvbiwgaGlkZGVuV2lkdGgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYm91bmRzIG9mIG5vcm1hbCBiYXIgY2hhcnQuXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0Om51bWJlcn19IGRpbWVuc2lvbiBiYXIgY2hhcnQgZGltZW5zaW9uXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGhpZGRlbldpZHRoIGhpZGRlbiB3aWR0aFxuICAgICAqIEByZXR1cm5zIHthcnJheS48YXJyYXkuPG9iamVjdD4+fSBib3VuZHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlTm9ybWFsQmFyQm91bmRzOiBmdW5jdGlvbihkaW1lbnNpb24sIGhpZGRlbldpZHRoKSB7XG4gICAgICAgIHZhciBncm91cFZhbHVlcyA9IHRoaXMucGVyY2VudFZhbHVlcyxcbiAgICAgICAgICAgIGdyb3VwSGVpZ2h0ID0gKGRpbWVuc2lvbi5oZWlnaHQgLyBncm91cFZhbHVlcy5sZW5ndGgpLFxuICAgICAgICAgICAgYmFySGVpZ2h0ID0gZ3JvdXBIZWlnaHQgLyAoZ3JvdXBWYWx1ZXNbMF0ubGVuZ3RoICsgMSksXG4gICAgICAgICAgICBib3VuZHMgPSBuZS51dGlsLm1hcChncm91cFZhbHVlcywgZnVuY3Rpb24odmFsdWVzLCBncm91cEluZGV4KSB7XG4gICAgICAgICAgICAgICAgdmFyIHBhZGRpbmdUb3AgPSAoZ3JvdXBIZWlnaHQgKiBncm91cEluZGV4KSArIChiYXJIZWlnaHQgLyAyKSArIGhpZGRlbldpZHRoO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogcGFkZGluZ1RvcCArIChiYXJIZWlnaHQgKiBpbmRleCksXG4gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiAtSElEREVOX1dJRFRILFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHZhbHVlICogZGltZW5zaW9uLndpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBiYXJIZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gYm91bmRzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGJvdW5kcyBvZiBzdGFja2VkIGJhciBjaGFydC5cbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6bnVtYmVyfX0gZGltZW5zaW9uIGJhciBjaGFydCBkaW1lbnNpb25cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaGlkZGVuV2lkdGggaGlkZGVuIHdpZHRoXG4gICAgICogQHJldHVybnMge2FycmF5LjxhcnJheS48b2JqZWN0Pj59IGJvdW5kc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VTdGFja2VkQmFyQm91bmRzOiBmdW5jdGlvbihkaW1lbnNpb24sIGhpZGRlbldpZHRoKSB7XG4gICAgICAgIHZhciBncm91cFZhbHVlcyA9IHRoaXMucGVyY2VudFZhbHVlcyxcbiAgICAgICAgICAgIGdyb3VwSGVpZ2h0ID0gKGRpbWVuc2lvbi5oZWlnaHQgLyBncm91cFZhbHVlcy5sZW5ndGgpLFxuICAgICAgICAgICAgYmFySGVpZ2h0ID0gZ3JvdXBIZWlnaHQgLyAyLFxuICAgICAgICAgICAgYm91bmRzID0gbmUudXRpbC5tYXAoZ3JvdXBWYWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcywgZ3JvdXBJbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciBwYWRkaW5nVG9wID0gKGdyb3VwSGVpZ2h0ICogZ3JvdXBJbmRleCkgKyAoYmFySGVpZ2h0IC8gMikgKyBoaWRkZW5XaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgbGVmdCA9IC1ISURERU5fV0lEVEg7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB3aWR0aCA9IHZhbHVlICogZGltZW5zaW9uLndpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgYm91bmQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiBwYWRkaW5nVG9wLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6IGxlZnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogYmFySGVpZ2h0XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBsZWZ0ID0gbGVmdCArIHdpZHRoO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYm91bmQ7XG4gICAgICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGJvdW5kcztcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBCYXJDaGFydFNlcmllcztcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBDb2x1bW4gY2hhcnQgc2VyaWVzIGNvbXBvbmVudC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFNlcmllcyA9IHJlcXVpcmUoJy4vc2VyaWVzLmpzJyk7XG5cbnZhciBISURERU5fV0lEVEggPSAxO1xuXG52YXIgQ29sdW1uQ2hhcnRTZXJpZXMgPSBuZS51dGlsLmRlZmluZUNsYXNzKFNlcmllcywgLyoqIEBsZW5kcyBTZXJpZXMucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBDb2x1bW4gY2hhcnQgc2VyaWVzIGNvbXBvbmVudC5cbiAgICAgKiBAY29uc3RydWN0cyBDb2x1bW5DaGFydFNlcmllc1xuICAgICAqIEBleHRlbmRzIFNlcmllc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5tb2RlbCBzZXJpZXMgbW9kZWxcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMub3B0aW9ucyBzZXJpZXMgb3B0aW9uc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBzZXJpZXMgdGhlbWVcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgU2VyaWVzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYm91bmRzIG9mIGNvbHVtbiBjaGFydC5cbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6bnVtYmVyfX0gZGltZW5zaW9uIGNvbHVtbiBjaGFydCBkaW1lbnNpb25cbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gYm91bmRzXG4gICAgICovXG4gICAgX21ha2VCb3VuZHM6IGZ1bmN0aW9uKGRpbWVuc2lvbikge1xuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5zdGFja2VkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbWFrZU5vcm1hbENvbHVtbkJvdW5kcyhkaW1lbnNpb24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21ha2VTdGFja2VkQ29sdW1uQm91bmRzKGRpbWVuc2lvbik7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBib3VuZHMgb2Ygbm9ybWFsIGNvbHVtbiBjaGFydC5cbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6bnVtYmVyfX0gZGltZW5zaW9uIGNvbHVtbiBjaGFydCBkaW1lbnNpb25cbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gYm91bmRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZU5vcm1hbENvbHVtbkJvdW5kczogZnVuY3Rpb24oZGltZW5zaW9uKSB7XG4gICAgICAgIHZhciBncm91cFZhbHVlcyA9IHRoaXMucGVyY2VudFZhbHVlcyxcbiAgICAgICAgICAgIGdyb3VwV2lkdGggPSAoZGltZW5zaW9uLndpZHRoIC8gZ3JvdXBWYWx1ZXMubGVuZ3RoKSxcbiAgICAgICAgICAgIGJhcldpZHRoID0gZ3JvdXBXaWR0aCAvIChncm91cFZhbHVlc1swXS5sZW5ndGggKyAxKSxcbiAgICAgICAgICAgIGJvdW5kcyA9IG5lLnV0aWwubWFwKGdyb3VwVmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMsIGdyb3VwSW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFkZGluZ0xlZnQgPSAoZ3JvdXBXaWR0aCAqIGdyb3VwSW5kZXgpICsgKGJhcldpZHRoIC8gMik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24gKHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYmFySGVpZ2h0ID0gdmFsdWUgKiBkaW1lbnNpb24uaGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiBkaW1lbnNpb24uaGVpZ2h0IC0gYmFySGVpZ2h0ICsgSElEREVOX1dJRFRILFxuICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogcGFkZGluZ0xlZnQgKyAoYmFyV2lkdGggKiBpbmRleCkgLSBISURERU5fV0lEVEgsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogYmFyV2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IGJhckhlaWdodFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBib3VuZHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYm91bmRzIG9mIHN0YWNrZWQgY29sdW1uIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDpudW1iZXJ9fSBkaW1lbnNpb24gY29sdW1uIGNoYXJ0IGRpbWVuc2lvblxuICAgICAqIEByZXR1cm5zIHthcnJheS48YXJyYXkuPG9iamVjdD4+fSBib3VuZHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlU3RhY2tlZENvbHVtbkJvdW5kczogZnVuY3Rpb24oZGltZW5zaW9uKSB7XG4gICAgICAgIHZhciBncm91cFZhbHVlcyA9IHRoaXMucGVyY2VudFZhbHVlcyxcbiAgICAgICAgICAgIGdyb3VwV2lkdGggPSAoZGltZW5zaW9uLndpZHRoIC8gZ3JvdXBWYWx1ZXMubGVuZ3RoKSxcbiAgICAgICAgICAgIGJhcldpZHRoID0gZ3JvdXBXaWR0aCAvIDIsXG4gICAgICAgICAgICBib3VuZHMgPSBuZS51dGlsLm1hcChncm91cFZhbHVlcywgZnVuY3Rpb24odmFsdWVzLCBncm91cEluZGV4KSB7XG4gICAgICAgICAgICAgICAgdmFyIHBhZGRpbmdMZWZ0ID0gKGdyb3VwV2lkdGggKiBncm91cEluZGV4KSArIChiYXJXaWR0aCAvIDIpLFxuICAgICAgICAgICAgICAgICAgICB0b3AgPSAwO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaGVpZ2h0ID0gdmFsdWUgKiBkaW1lbnNpb24uaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICAgICAgYm91bmQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiBkaW1lbnNpb24uaGVpZ2h0IC0gaGVpZ2h0IC0gdG9wLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6IHBhZGRpbmdMZWZ0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiBiYXJXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IGhlaWdodFxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgdG9wICs9IGhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJvdW5kO1xuICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBib3VuZHM7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29sdW1uQ2hhcnRTZXJpZXM7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgTGluZSBjaGFydCBzZXJpZXMgY29tcG9uZW50LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU2VyaWVzID0gcmVxdWlyZSgnLi9zZXJpZXMuanMnKTtcblxudmFyIExpbmVDaGFydFNlcmllcyA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoU2VyaWVzLCAvKiogQGxlbmRzIFNlcmllcy5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIExpbmUgY2hhcnQgc2VyaWVzIGNvbXBvbmVudC5cbiAgICAgKiBAY29uc3RydWN0cyBMaW5lQ2hhcnRTZXJpZXNcbiAgICAgKiBAZXh0ZW5kcyBTZXJpZXNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMubW9kZWwgc2VyaWVzIG1vZGVsXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgc2VyaWVzIG9wdGlvbnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgc2VyaWVzIHRoZW1lXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIFNlcmllcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHBvc2l0aW9ucyBvZiBsaW5lIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDpudW5iZXJ9fSBkaW1lbnNpb24gbGluZSBjaGFydCBkaW1lbnNpb25cbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gcG9zaXRpb25zXG4gICAgICovXG4gICAgX21ha2VQb3NpdGlvbnM6IGZ1bmN0aW9uKGRpbWVuc2lvbikge1xuICAgICAgICB2YXIgZ3JvdXBWYWx1ZXMgPSB0aGlzLnBlcmNlbnRWYWx1ZXMsXG4gICAgICAgICAgICB3aWR0aCA9IGRpbWVuc2lvbi53aWR0aCxcbiAgICAgICAgICAgIGhlaWdodCA9IGRpbWVuc2lvbi5oZWlnaHQsXG4gICAgICAgICAgICBzdGVwID0gd2lkdGggLyBncm91cFZhbHVlc1swXS5sZW5ndGgsXG4gICAgICAgICAgICBzdGFydCA9IHN0ZXAgLyAyLFxuICAgICAgICAgICAgcmVzdWx0ID0gbmUudXRpbC5tYXAoZ3JvdXBWYWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogc3RhcnQgKyAoc3RlcCAqIGluZGV4KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogaGVpZ2h0IC0gKHZhbHVlICogaGVpZ2h0KVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTGluZUNoYXJ0U2VyaWVzO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFBpZSBjaGFydCBzZXJpZXMgY29tcG9uZW50LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU2VyaWVzID0gcmVxdWlyZSgnLi9zZXJpZXMuanMnKTtcblxudmFyIFBpZUNoYXJ0U2VyaWVzID0gbmUudXRpbC5kZWZpbmVDbGFzcyhTZXJpZXMsIC8qKiBAbGVuZHMgU2VyaWVzLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogTGluZSBjaGFydCBzZXJpZXMgY29tcG9uZW50LlxuICAgICAqIEBjb25zdHJ1Y3RzIFBpZUNoYXJ0U2VyaWVzXG4gICAgICogQGV4dGVuZHMgU2VyaWVzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm1vZGVsIHNlcmllcyBtb2RlbFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5vcHRpb25zIHNlcmllcyBvcHRpb25zXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIHNlcmllcyB0aGVtZVxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBTZXJpZXMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBwZXJjZW50IHZhbHVlLlxuICAgICAqIEBwYXJhbSB7e3ZhbHVlczogYXJyYXksIHNjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX19IGRhdGEgc2VyaWVzIGRhdGFcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxudW1iZXI+Pn0gcGVyY2VudCB2YWx1ZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlUGVyY2VudFZhbHVlczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gbmUudXRpbC5tYXAoZGF0YS52YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICAgICAgdmFyIHN1bSA9IG5lLnV0aWwuc3VtKHZhbHVlcyk7XG4gICAgICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSAvIHN1bTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBjaXJjbGUgYm91bmRzXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0Om51bWJlcn19IGRpbWVuc2lvbiBjaGFydCBkaW1lbnNpb25cbiAgICAgKiBAcmV0dXJucyB7e2N4OiBudW1iZXIsIGN5OiBudW1iZXIsIHI6IG51bWJlcn19IGNpcmNsZSBib3VuZHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQ2lyY2xlQm91bmRzOiBmdW5jdGlvbihkaW1lbnNpb24pIHtcbiAgICAgICAgdmFyIHdpZHRoID0gZGltZW5zaW9uLndpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0ID0gZGltZW5zaW9uLmhlaWdodCxcbiAgICAgICAgICAgIHN0ZFNpemUgPSBuZS51dGlsLm11bHRpcGxpY2F0aW9uKG5lLnV0aWwubWluKFt3aWR0aCwgaGVpZ2h0XSksIDAuOCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjeDogbmUudXRpbC5kaXZpc2lvbih3aWR0aCwgMiksXG4gICAgICAgICAgICBjeTogbmUudXRpbC5kaXZpc2lvbihoZWlnaHQsIDIpLFxuICAgICAgICAgICAgcjogbmUudXRpbC5kaXZpc2lvbihzdGRTaXplLCAyKVxuICAgICAgICB9O1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBpZUNoYXJ0U2VyaWVzO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFNlcmllcyBiYXNlIGNvbXBvbmVudC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuLi9jb25zdC5qcycpLFxuICAgIHJlbmRlclV0aWwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3JlbmRlclV0aWwuanMnKSxcbiAgICBkb20gPSByZXF1aXJlKCcuLi9oZWxwZXJzL2RvbUhhbmRsZXIuanMnKSxcbiAgICBwbHVnaW5GYWN0b3J5ID0gcmVxdWlyZSgnLi4vZmFjdG9yaWVzL3BsdWdpbkZhY3RvcnkuanMnKTtcblxudmFyIEhJRERFTl9XSURUSCA9IDE7XG5cbnZhciBTZXJpZXMgPSBuZS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgU2VyaWVzLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogU2VyaWVzIGJhc2UgY29tcG9uZW50LlxuICAgICAqIEBjb25zdHJ1Y3RzIFNlcmllc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5tb2RlbCBzZXJpZXMgbW9kZWxcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMub3B0aW9ucyBzZXJpZXMgb3B0aW9uc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBzZXJpZXMgdGhlbWVcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGxpYlR5cGU7XG5cbiAgICAgICAgbmUudXRpbC5leHRlbmQodGhpcywgcGFyYW1zKTtcbiAgICAgICAgbGliVHlwZSA9IHBhcmFtcy5saWJUeXBlIHx8IGNoYXJ0Q29uc3QuREVGQVVMVF9QTFVHSU47XG4gICAgICAgIHRoaXMucGVyY2VudFZhbHVlcyA9IHRoaXMuX21ha2VQZXJjZW50VmFsdWVzKHBhcmFtcy5kYXRhLCBwYXJhbXMub3B0aW9ucy5zdGFja2VkKTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdyYXBoIHJlbmRlcmVyXG4gICAgICAgICAqIEB0eXBlIHtvYmplY3R9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdyYXBoUmVuZGVyZXIgPSBwbHVnaW5GYWN0b3J5LmdldChsaWJUeXBlLCBwYXJhbXMuY2hhcnRUeXBlKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogU2VyaWVzIHZpZXcgY2xhc3NOYW1lXG4gICAgICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNsYXNzTmFtZSA9ICduZS1jaGFydC1zZXJpZXMtYXJlYSc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNob3cgdG9vbHRpcCAobW91c2VvdmVyIGNhbGxiYWNrKS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcHJlZml4IHRvb2x0aXAgaWQgcHJlZml4XG4gICAgICogQHBhcmFtIHtib29sZWFufSBpc1ZlcnRpY2FsIHdoZXRoZXIgdmVydGljYWwgb3Igbm90XG4gICAgICogQHBhcmFtIHt7dG9wOm51bWJlciwgbGVmdDogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGJvdW5kIGdyYXBoIGJvdW5kIGluZm9ybWF0aW9uXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGlkIHRvb2x0aXAgaWRcbiAgICAgKi9cbiAgICBzaG93VG9vbHRpcDogZnVuY3Rpb24ocHJlZml4LCBpc1BvaW50UG9zaXRpb24sIGJvdW5kLCBpZCkge1xuICAgICAgICB0aGlzLmZpcmUoJ3Nob3dUb29sdGlwJywge1xuICAgICAgICAgICAgaWQ6IHByZWZpeCArIGlkLFxuICAgICAgICAgICAgaXNQb2ludFBvc2l0aW9uOiBpc1BvaW50UG9zaXRpb24sXG4gICAgICAgICAgICBib3VuZDogYm91bmRcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhpZGUgdG9vbHRpcCAobW91c2VvdXQgY2FsbGJhY2spLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwcmVmaXggdG9vbHRpcCBpZCBwcmVmaXhcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgdG9vbHRpcCBpZFxuICAgICAqL1xuICAgIGhpZGVUb29sdGlwOiBmdW5jdGlvbihwcmVmaXgsIGlkKSB7XG4gICAgICAgIHRoaXMuZmlyZSgnaGlkZVRvb2x0aXAnLCB7XG4gICAgICAgICAgICBpZDogcHJlZml4ICsgaWRcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBzZXJpZXMuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIG9iamVjdCBmb3IgZ3JhcGggZHJhd2luZ1xuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gc2VyaWVzIGVsZW1lbnRcbiAgICAgKi9cbiAgICByZW5kZXI6IGZ1bmN0aW9uKHBhcGVyKSB7XG4gICAgICAgIHZhciBlbCA9IGRvbS5jcmVhdGUoJ0RJVicsIHRoaXMuY2xhc3NOYW1lKSxcbiAgICAgICAgICAgIHRvb2x0aXBQcmVmaXggPSB0aGlzLnRvb2x0aXBQcmVmaXgsXG4gICAgICAgICAgICBib3VuZCA9IHRoaXMuYm91bmQsXG4gICAgICAgICAgICBpc1BvaW50UG9zaXRpb24gPSAhIXRoaXMuaXNQb2ludFBvc2l0aW9uLFxuICAgICAgICAgICAgZGltZW5zaW9uID0gYm91bmQuZGltZW5zaW9uLFxuICAgICAgICAgICAgcG9zaXRpb24gPSBib3VuZC5wb3NpdGlvbixcbiAgICAgICAgICAgIGluQ2FsbGJhY2sgPSBuZS51dGlsLmJpbmQodGhpcy5zaG93VG9vbHRpcCwgdGhpcywgdG9vbHRpcFByZWZpeCwgaXNQb2ludFBvc2l0aW9uKSxcbiAgICAgICAgICAgIG91dENhbGxiYWNrID0gbmUudXRpbC5iaW5kKHRoaXMuaGlkZVRvb2x0aXAsIHRoaXMsIHRvb2x0aXBQcmVmaXgpLFxuICAgICAgICAgICAgaGlkZGVuV2lkdGggPSByZW5kZXJVdGlsLmlzSUU4KCkgPyAwIDogSElEREVOX1dJRFRILFxuICAgICAgICAgICAgZGF0YTtcblxuICAgICAgICBpZiAoIXBhcGVyKSB7XG4gICAgICAgICAgICByZW5kZXJVdGlsLnJlbmRlckRpbWVuc2lvbihlbCwgZGltZW5zaW9uKTtcblxuICAgICAgICAgICAgcG9zaXRpb24udG9wID0gcG9zaXRpb24udG9wICsgKGlzUG9pbnRQb3NpdGlvbiA/IC1ISURERU5fV0lEVEggOiAtMSk7XG4gICAgICAgICAgICBwb3NpdGlvbi5yaWdodCA9IHBvc2l0aW9uLnJpZ2h0ICsgKGlzUG9pbnRQb3NpdGlvbiA/IC0oSElEREVOX1dJRFRIICogMikgOiAtaGlkZGVuV2lkdGgpO1xuXG4gICAgICAgICAgICByZW5kZXJVdGlsLnJlbmRlclBvc2l0aW9uKGVsLCBwb3NpdGlvbik7XG4gICAgICAgIH1cblxuICAgICAgICBkYXRhID0ge1xuICAgICAgICAgICAgZGltZW5zaW9uOiBkaW1lbnNpb24sXG4gICAgICAgICAgICB0aGVtZTogdGhpcy50aGVtZSxcbiAgICAgICAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9uc1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmICh0aGlzLl9tYWtlQm91bmRzKSB7XG4gICAgICAgICAgICBkYXRhLmdyb3VwQm91bmRzID0gdGhpcy5fbWFrZUJvdW5kcyhkaW1lbnNpb24pO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX21ha2VQb3NpdGlvbnMpIHtcbiAgICAgICAgICAgIGRhdGEuZ3JvdXBQb3NpdGlvbnMgPSB0aGlzLl9tYWtlUG9zaXRpb25zKGRpbWVuc2lvbik7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fbWFrZUNpcmNsZUJvdW5kcykge1xuICAgICAgICAgICAgZGF0YS5wZXJjZW50VmFsdWVzID0gdGhpcy5wZXJjZW50VmFsdWVzO1xuICAgICAgICAgICAgZGF0YS5mb3JtYXR0ZWRWYWx1ZXMgPSB0aGlzLmRhdGEuZm9ybWF0dGVkVmFsdWVzO1xuICAgICAgICAgICAgZGF0YS5jaGFydEJhY2tncm91bmQgPSB0aGlzLmNoYXJ0QmFja2dyb3VuZDtcbiAgICAgICAgICAgIGRhdGEuY2lyY2xlQm91bmRzID0gdGhpcy5fbWFrZUNpcmNsZUJvdW5kcyhkaW1lbnNpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5wYXBlciA9IHRoaXMuZ3JhcGhSZW5kZXJlci5yZW5kZXIocGFwZXIsIGVsLCBkYXRhLCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjayk7XG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHBhcGVyLlxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IG9iamVjdCBmb3IgZ3JhcGggZHJhd2luZ1xuICAgICAqL1xuICAgIGdldFBhcGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFwZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgcGVyY2VudCB2YWx1ZS5cbiAgICAgKiBAcGFyYW0ge3t2YWx1ZXM6IGFycmF5LCBzY2FsZToge21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19fSBkYXRhIHNlcmllcyBkYXRhXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHN0YWNrZWQgc3RhY2tlZCBvcHRpb25cbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxudW1iZXI+Pn0gcGVyY2VudCB2YWx1ZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlUGVyY2VudFZhbHVlczogZnVuY3Rpb24oZGF0YSwgc3RhY2tlZCkge1xuICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICBpZiAoc3RhY2tlZCA9PT0gY2hhcnRDb25zdC5TVEFDS0VEX05PUk1BTF9UWVBFKSB7XG4gICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9tYWtlTm9ybWFsU3RhY2tlZFBlcmNlbnRWYWx1ZXMoZGF0YSk7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RhY2tlZCA9PT0gY2hhcnRDb25zdC5TVEFDS0VEX1BFUkNFTlRfVFlQRSkge1xuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5fbWFrZVBlcmNlbnRTdGFja2VkUGVyY2VudFZhbHVlcyhkYXRhKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuX21ha2VOb3JtYWxQZXJjZW50VmFsdWVzKGRhdGEpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBwZXJjZW50IHZhbHVlcyBhYm91dCBub3JtYWwgc3RhY2tlZCBvcHRpb24uXG4gICAgICogQHBhcmFtIHt7dmFsdWVzOiBhcnJheSwgc2NhbGU6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fX0gZGF0YSBzZXJpZXMgZGF0YVxuICAgICAqIEByZXR1cm5zIHthcnJheX0gcGVyY2VudCB2YWx1ZXMgYWJvdXQgbm9ybWFsIHN0YWNrZWQgb3B0aW9uLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VOb3JtYWxTdGFja2VkUGVyY2VudFZhbHVlczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgbWluID0gZGF0YS5zY2FsZS5taW4sXG4gICAgICAgICAgICBtYXggPSBkYXRhLnNjYWxlLm1heCxcbiAgICAgICAgICAgIGRpc3RhbmNlID0gbWF4IC0gbWluLFxuICAgICAgICAgICAgcGVyY2VudFZhbHVlcyA9IG5lLnV0aWwubWFwKGRhdGEudmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGx1c1ZhbHVlcyA9IG5lLnV0aWwuZmlsdGVyKHZhbHVlcywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSA+IDA7XG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBzdW0gPSBuZS51dGlsLnN1bShwbHVzVmFsdWVzKSxcbiAgICAgICAgICAgICAgICAgICAgZ3JvdXBQZXJjZW50ID0gKHN1bSAtIG1pbikgLyBkaXN0YW5jZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZ3JvdXBQZXJjZW50ICogKHZhbHVlIC8gc3VtKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcGVyY2VudFZhbHVlcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBwZXJjZW50IHZhbHVlcyBhYm91dCBwZXJjZW50IHN0YWNrZWQgb3B0aW9uLlxuICAgICAqIEBwYXJhbSB7e3ZhbHVlczogYXJyYXksIHNjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX19IGRhdGEgc2VyaWVzIGRhdGFcbiAgICAgKiBAcmV0dXJucyB7YXJyYXl9IHBlcmNlbnQgdmFsdWVzIGFib3V0IHBlcmNlbnQgc3RhY2tlZCBvcHRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlUGVyY2VudFN0YWNrZWRQZXJjZW50VmFsdWVzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBwZXJjZW50VmFsdWVzID0gbmUudXRpbC5tYXAoZGF0YS52YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICAgICAgdmFyIHBsdXNWYWx1ZXMgPSBuZS51dGlsLmZpbHRlcih2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSA+IDA7XG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgc3VtID0gbmUudXRpbC5zdW0ocGx1c1ZhbHVlcyk7XG4gICAgICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSAvIHN1bTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHBlcmNlbnRWYWx1ZXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2Ugbm9ybWFsIHBlcmNlbnQgdmFsdWUuXG4gICAgICogQHBhcmFtIHt7dmFsdWVzOiBhcnJheSwgc2NhbGU6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fX0gZGF0YSBzZXJpZXMgZGF0YVxuICAgICAqIEByZXR1cm5zIHthcnJheS48YXJyYXkuPG51bWJlcj4+fSBwZXJjZW50IHZhbHVlc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VOb3JtYWxQZXJjZW50VmFsdWVzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBtaW4gPSBkYXRhLnNjYWxlLm1pbixcbiAgICAgICAgICAgIG1heCA9IGRhdGEuc2NhbGUubWF4LFxuICAgICAgICAgICAgZGlzdGFuY2UgPSBtYXggLSBtaW4sXG4gICAgICAgICAgICBwZXJjZW50VmFsdWVzID0gbmUudXRpbC5tYXAoZGF0YS52YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAodmFsdWUgLSBtaW4pIC8gZGlzdGFuY2U7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHBlcmNlbnRWYWx1ZXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGwgc2hvd0RvdCBmdW5jdGlvbiBvZiBncmFwaFJlbmRlcmVyLlxuICAgICAqIEBwYXJhbSB7e2dyb3VwSW5kZXg6IG51bWJlciwgaW5kZXg6IG51bWJlcn19IGRhdGEgZGF0YVxuICAgICAqL1xuICAgIG9uU2hvd0FuaW1hdGlvbjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBpZiAoIXRoaXMuZ3JhcGhSZW5kZXJlci5zaG93QW5pbWF0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ncmFwaFJlbmRlcmVyLnNob3dBbmltYXRpb24uY2FsbCh0aGlzLmdyYXBoUmVuZGVyZXIsIGRhdGEpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxsIGhpZGVEb3QgZnVuY3Rpb24gb2YgZ3JhcGhSZW5kZXJlci5cbiAgICAgKiBAcGFyYW0ge3tncm91cEluZGV4OiBudW1iZXIsIGluZGV4OiBudW1iZXJ9fSBkYXRhIGRhdGFcbiAgICAgKi9cbiAgICBvbkhpZGVBbmltYXRpb246IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgaWYgKCF0aGlzLmdyYXBoUmVuZGVyZXIuaGlkZUFuaW1hdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ3JhcGhSZW5kZXJlci5oaWRlQW5pbWF0aW9uLmNhbGwodGhpcy5ncmFwaFJlbmRlcmVyLCBkYXRhKTtcbiAgICB9XG59KTtcblxubmUudXRpbC5DdXN0b21FdmVudHMubWl4aW4oU2VyaWVzKTtcblxubW9kdWxlLmV4cG9ydHMgPSBTZXJpZXM7XG4iLCJ2YXIgREVGQVVMVF9DT0xPUiA9ICcjMDAwMDAwJyxcbiAgICBERUZBVUxUX0JBQ0tHUk9VTkQgPSAnI2ZmZmZmZicsXG4gICAgRU1QVFlfRk9OVCA9ICcnLFxuICAgIERFRkFVTFRfQVhJUyA9IHtcbiAgICAgICAgdGlja0NvbG9yOiBERUZBVUxUX0NPTE9SLFxuICAgICAgICB0aXRsZToge1xuICAgICAgICAgICAgZm9udFNpemU6IDEyLFxuICAgICAgICAgICAgZm9udEZhbWlseTogRU1QVFlfRk9OVCxcbiAgICAgICAgICAgIGNvbG9yOiBERUZBVUxUX0NPTE9SXG4gICAgICAgIH0sXG4gICAgICAgIGxhYmVsOiB7XG4gICAgICAgICAgICBmb250U2l6ZTogMTIsXG4gICAgICAgICAgICBmb250RmFtaWx5OiBFTVBUWV9GT05ULFxuICAgICAgICAgICAgY29sb3I6IERFRkFVTFRfQ09MT1JcbiAgICAgICAgfVxuICAgIH07XG5cbnZhciBkZWZhdWx0VGhlbWUgPSB7XG4gICAgY2hhcnQ6IHtcbiAgICAgICAgYmFja2dyb3VuZDogREVGQVVMVF9CQUNLR1JPVU5ELFxuICAgICAgICBmb250RmFtaWx5OiAnVmVyZGFuYSdcbiAgICB9LFxuICAgIHRpdGxlOiB7XG4gICAgICAgIGZvbnRTaXplOiAxOCxcbiAgICAgICAgZm9udEZhbWlseTogRU1QVFlfRk9OVCxcbiAgICAgICAgY29sb3I6IERFRkFVTFRfQ09MT1JcbiAgICB9LFxuICAgIHlBeGlzOiBERUZBVUxUX0FYSVMsXG4gICAgeEF4aXM6IERFRkFVTFRfQVhJUyxcbiAgICBwbG90OiB7XG4gICAgICAgIGxpbmVDb2xvcjogJyNkZGRkZGQnLFxuICAgICAgICBiYWNrZ3JvdW5kOiAnI2ZmZmZmZidcbiAgICB9LFxuICAgIHNlcmllczoge1xuICAgICAgICBjb2xvcnM6IFsnI2FjNDE0MicsICcjZDI4NDQ1JywgJyNmNGJmNzUnLCAnIzkwYTk1OScsICcjNzViNWFhJywgJyM2YTlmYjUnLCAnI2FhNzU5ZicsICcjOGY1NTM2J11cbiAgICB9LFxuICAgIGxlZ2VuZDoge1xuICAgICAgICBsYWJlbDoge1xuICAgICAgICAgICAgZm9udFNpemU6IDEyLFxuICAgICAgICAgICAgZm9udEZhbWlseTogRU1QVFlfRk9OVCxcbiAgICAgICAgICAgIGNvbG9yOiBERUZBVUxUX0NPTE9SXG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmF1bHRUaGVtZTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBUb29sdGlwIGNvbXBvbmVudC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGRvbSA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZG9tSGFuZGxlci5qcycpLFxuICAgIHJlbmRlclV0aWwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3JlbmRlclV0aWwuanMnKSxcbiAgICBldmVudCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZXZlbnRMaXN0ZW5lci5qcycpLFxuICAgIHRlbXBsYXRlTWFrZXIgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3RlbXBsYXRlTWFrZXIuanMnKSxcbiAgICB0b29sdGlwVGVtcGxhdGUgPSByZXF1aXJlKCcuL3Rvb2x0aXBUZW1wbGF0ZS5qcycpO1xuXG52YXIgVE9PTFRJUF9HQVAgPSA1LFxuICAgIEhJRERFTl9XSURUSCA9IDEsXG4gICAgVE9PTFRJUF9DTEFTU19OQU1FID0gJ25lLWNoYXJ0LXRvb2x0aXAnLFxuICAgIEhJREVfREVMQVkgPSAwO1xuXG52YXIgY29uY2F0ID0gQXJyYXkucHJvdG90eXBlLmNvbmNhdDtcblxudmFyIFRvb2x0aXAgPSBuZS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgVG9vbHRpcC5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIFRvb2x0aXAgY29tcG9uZW50LlxuICAgICAqIEBjb25zdHJ1Y3RzIFRvb2x0aXBcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPG51bWJlcj59IHBhcmFtcy52YWx1ZXMgY29udmVydGVkIHZhbHVlc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheX0gcGFyYW1zLmxhYmVscyBsYWJlbHNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXl9IHBhcmFtcy5sZWdlbmRMYWJlbHMgbGVnZW5kIGxhYmVsc1xuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHByZWZpeCB0b29sdGlwIHByZWZpeFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5ib3VuZCBheGlzIGJvdW5kXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIGF4aXMgdGhlbWVcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgbmUudXRpbC5leHRlbmQodGhpcywgcGFyYW1zKTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRvb2x0aXAgdmlldyBjbGFzc05hbWVcbiAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2xhc3NOYW1lID0gJ25lLWNoYXJ0LXRvb2x0aXAtYXJlYSc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciB0b29sdGlwLlxuICAgICAqIEBwYXJhbSB7e3Bvc2l0aW9uOiBvYmplY3R9fSBib3VuZCB0b29sdGlwIGJvdW5kXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHByZWZpeCB0b29sdGlwIGlkIHByZWZpeFxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gdG9vbHRpcCBlbGVtZW50XG4gICAgICovXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGVsID0gZG9tLmNyZWF0ZSgnRElWJywgdGhpcy5jbGFzc05hbWUpLFxuICAgICAgICAgICAgYm91bmQgPSB0aGlzLmJvdW5kO1xuXG4gICAgICAgIHJlbmRlclV0aWwucmVuZGVyUG9zaXRpb24oZWwsIGJvdW5kLnBvc2l0aW9uKTtcbiAgICAgICAgZWwuaW5uZXJIVE1MID0gdGhpcy5fbWFrZVRvb2x0aXBzSHRtbCgpO1xuXG4gICAgICAgIHRoaXMuYXR0YWNoRXZlbnQoZWwpO1xuICAgICAgICByZXR1cm4gZWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgdG9vbHRpcCBkYXRhLlxuICAgICAqIEByZXR1cm5zIHthcnJheS48b2JqZWN0Pn0gdG9vbHRpcCBkYXRhXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVRvb2x0aXBEYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGxhYmVscyA9IHRoaXMubGFiZWxzLFxuICAgICAgICAgICAgZ3JvdXBWYWx1ZXMgPSB0aGlzLnZhbHVlcyxcbiAgICAgICAgICAgIGxlZ2VuZExhYmVscyA9IHRoaXMubGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgdG9vbHRpcERhdGEgPSBuZS51dGlsLm1hcChncm91cFZhbHVlcywgZnVuY3Rpb24odmFsdWVzLCBncm91cEluZGV4KSB7XG4gICAgICAgICAgICAgICAgdmFyIGl0ZW1zID0gbmUudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSB7dmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGVnZW5kTGFiZWw6IGxlZ2VuZExhYmVsc1tpbmRleF0sXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogZ3JvdXBJbmRleCArICctJyArIGluZGV4XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIGlmIChsYWJlbHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ubGFiZWwgPSBsYWJlbHNbZ3JvdXBJbmRleF07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gaXRlbXM7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGNvbmNhdC5hcHBseShbXSwgdG9vbHRpcERhdGEpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGh0bWwgb2YgdG9vbHRpcC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZGF0YSB0b29sdGlwIGRhdGFcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcHJlZml4IHRvb2x0aXAgaWQgcHJlZml4XG4gICAgICogQHJldHVybnMge3N0cmluZ30gaHRtbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VUb29sdGlwc0h0bWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucyxcbiAgICAgICAgICAgIHByZWZpeCA9IHRoaXMucHJlZml4LFxuICAgICAgICAgICAgZGF0YSA9IHRoaXMuX21ha2VUb29sdGlwRGF0YSgpLFxuICAgICAgICAgICAgb3B0aW9uVGVtcGxhdGUgPSBvcHRpb25zLnRlbXBsYXRlID8gb3B0aW9ucy50ZW1wbGF0ZSA6ICcnLFxuICAgICAgICAgICAgdHBsT3V0ZXIgPSB0b29sdGlwVGVtcGxhdGUuVFBMX1RPT0xUSVAsXG4gICAgICAgICAgICB0cGxUb29sdGlwID0gb3B0aW9uVGVtcGxhdGUgPyB0ZW1wbGF0ZU1ha2VyLnRlbXBsYXRlKG9wdGlvblRlbXBsYXRlKSA6IHRvb2x0aXBUZW1wbGF0ZS5UUExfREVGQVVMVF9URU1QTEFURSxcbiAgICAgICAgICAgIHN1ZmZpeCA9IG9wdGlvbnMuc3VmZml4ID8gJyZuYnNwOycgKyBvcHRpb25zLnN1ZmZpeCA6ICcnLFxuICAgICAgICAgICAgaHRtbCA9IG5lLnV0aWwubWFwKGRhdGEsIGZ1bmN0aW9uKHRvb2x0aXBEYXRhKSB7XG4gICAgICAgICAgICAgICAgdmFyIGlkID0gcHJlZml4ICsgdG9vbHRpcERhdGEuaWQsXG4gICAgICAgICAgICAgICAgICAgIHRvb2x0aXBIdG1sO1xuXG4gICAgICAgICAgICAgICAgdG9vbHRpcERhdGEgPSBuZS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgbGVnZW5kTGFiZWw6ICcnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJycsXG4gICAgICAgICAgICAgICAgICAgIHN1ZmZpeDogc3VmZml4XG4gICAgICAgICAgICAgICAgfSwgdG9vbHRpcERhdGEpO1xuICAgICAgICAgICAgICAgIHRvb2x0aXBIdG1sID0gdHBsVG9vbHRpcCh0b29sdGlwRGF0YSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRwbE91dGVyKHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgICAgICAgICBodG1sOiB0b29sdGlwSHRtbFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSwgdGhpcykuam9pbignJyk7XG4gICAgICAgIHJldHVybiBodG1sO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgaW5kZXggZnJvbSBpZFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpZCB0b29sdGlwIGlkXG4gICAgICogQHJldHVybnMge2FycmF5LjxudW1iZXI+fSBpbmRleGVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0SW5kZXhGcm9tSWQ6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgIHZhciBpZHMgPSBpZC5zcGxpdCgnLScpLFxuICAgICAgICAgICAgc2xpY2VJbmRleCA9IGlkcy5sZW5ndGggLSAyO1xuICAgICAgICByZXR1cm4gaWRzLnNsaWNlKHNsaWNlSW5kZXgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGaXJlIGN1c3RvbSBldmVudCBzaG93QW5pbWF0aW9uLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpZCB0b29sdGlwIGlkXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZmlyZVNob3dBbmltYXRpb246IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgIHZhciBpbmRleGVzID0gdGhpcy5fZ2V0SW5kZXhGcm9tSWQoaWQpO1xuICAgICAgICB0aGlzLmZpcmUoJ3Nob3dBbmltYXRpb24nLCB7XG4gICAgICAgICAgICBncm91cEluZGV4OiBpbmRleGVzWzBdLFxuICAgICAgICAgICAgaW5kZXg6IGluZGV4ZXNbMV1cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZpcmUgY3VzdG9tIGV2ZW50IGhpZGVBbmltYXRpb24uXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGlkIHRvb2x0aXAgaWRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9maXJlSGlkZUFuaW1hdGlvbjogZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgdmFyIGluZGV4ZXMgPSB0aGlzLl9nZXRJbmRleEZyb21JZChpZCk7XG4gICAgICAgIHRoaXMuZmlyZSgnaGlkZUFuaW1hdGlvbicsIHtcbiAgICAgICAgICAgIGdyb3VwSW5kZXg6IGluZGV4ZXNbMF0sXG4gICAgICAgICAgICBpbmRleDogaW5kZXhlc1sxXVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogT24gbW91c2VvdmVyIGV2ZW50IGhhbmRsZXIgZm9yIHRvb2x0aXAgYXJlYVxuICAgICAqIEBwYXJhbSB7TW91c2VFdmVudH0gZSBtb3VzZSBldmVudFxuICAgICAqL1xuICAgIG9uTW91c2VvdmVyOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciBlbFRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudCxcbiAgICAgICAgICAgIGlkO1xuXG4gICAgICAgIGlmICghZG9tLmhhc0NsYXNzKGVsVGFyZ2V0LCBUT09MVElQX0NMQVNTX05BTUUpKSB7XG4gICAgICAgICAgICBlbFRhcmdldCA9IGRvbS5maW5kUGFyZW50QnlDbGFzcyhlbFRhcmdldCwgVE9PTFRJUF9DTEFTU19OQU1FKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2hvd2VkSWQgPSBpZCA9IGVsVGFyZ2V0LmlkO1xuICAgICAgICB0aGlzLl9maXJlU2hvd0FuaW1hdGlvbihpZCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE9uIG1vdXNlb3V0IGV2ZW50IGhhbmRsZXIgZm9yIHRvb2x0aXAgYXJlYVxuICAgICAqIEBwYXJhbSB7TW91c2VFdmVudH0gZSBtb3VzZSBldmVudFxuICAgICAqL1xuICAgIG9uTW91c2VvdXQ6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIGVsVGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50LFxuICAgICAgICAgICAgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICBpbmRleGVzO1xuXG4gICAgICAgIGlmICghZG9tLmhhc0NsYXNzKGVsVGFyZ2V0LCBUT09MVElQX0NMQVNTX05BTUUpKSB7XG4gICAgICAgICAgICBlbFRhcmdldCA9IGRvbS5maW5kUGFyZW50QnlDbGFzcyhlbFRhcmdldCwgVE9PTFRJUF9DTEFTU19OQU1FKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGluZGV4ZXMgPSB0aGlzLl9nZXRJbmRleEZyb21JZChlbFRhcmdldC5pZCk7XG5cbiAgICAgICAgdGhpcy5faGlkZVRvb2x0aXAoZWxUYXJnZXQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhhdC5maXJlKCdoaWRlQW5pbWF0aW9uJywge1xuICAgICAgICAgICAgICAgIGdyb3VwSW5kZXg6IGluZGV4ZXNbMF0sXG4gICAgICAgICAgICAgICAgaW5kZXg6IGluZGV4ZXNbMV1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlIHRvb2x0aXAgcG9pbnQgcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7e2JvdW5kOiBvYmplY3R9fSBwYXJhbXMuZGF0YSBncmFwaCBpbmZvcm1hdGlvblxuICAgICAqICAgICAgQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBwYXJhbXMuZGltZW5zaW9uIHRvb2x0aXAgZGltZW5zaW9uXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLnBvc2l0aW9uT3B0aW9uIHBvc2l0aW9uIG9wdGlvbiAoZXg6ICdsZWZ0IHRvcCcpXG4gICAgICogQHJldHVybnMge3t0b3A6IG51bWJlciwgbGVmdDogbnVtYmVyfX0gcG9zaXRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jYWxjdWxhdGVQb2ludFBvc2l0aW9uOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGJvdW5kID0gcGFyYW1zLmRhdGEuYm91bmQsXG4gICAgICAgICAgICBtaW51c1dpZHRoID0gcGFyYW1zLmRpbWVuc2lvbi53aWR0aCAtIChib3VuZC53aWR0aCB8fCAwKSxcbiAgICAgICAgICAgIGxpbmVHYXAgPSBib3VuZC53aWR0aCA/IDAgOiBUT09MVElQX0dBUCxcbiAgICAgICAgICAgIHBvc2l0aW9uT3B0aW9uID0gcGFyYW1zLnBvc2l0aW9uT3B0aW9uIHx8ICcnLFxuICAgICAgICAgICAgdG9vbHRpcEhlaWdodCA9IHBhcmFtcy5kaW1lbnNpb24uaGVpZ2h0LFxuICAgICAgICAgICAgcmVzdWx0ID0ge307XG5cbiAgICAgICAgcmVzdWx0LmxlZnQgPSBib3VuZC5sZWZ0ICsgKEhJRERFTl9XSURUSCAqIDIpO1xuICAgICAgICByZXN1bHQudG9wID0gYm91bmQudG9wIC0gdG9vbHRpcEhlaWdodDtcblxuICAgICAgICBpZiAocG9zaXRpb25PcHRpb24uaW5kZXhPZignbGVmdCcpID4gLTEpIHtcbiAgICAgICAgICAgIHJlc3VsdC5sZWZ0IC09IG1pbnVzV2lkdGggKyBsaW5lR2FwO1xuICAgICAgICB9IGVsc2UgaWYgKHBvc2l0aW9uT3B0aW9uLmluZGV4T2YoJ2NlbnRlcicpID4gLTEpIHtcbiAgICAgICAgICAgIHJlc3VsdC5sZWZ0IC09IG1pbnVzV2lkdGggLyAyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0LmxlZnQgKz0gbGluZUdhcDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwb3NpdGlvbk9wdGlvbi5pbmRleE9mKCdib3R0b20nKSA+IC0xKSB7XG4gICAgICAgICAgICByZXN1bHQudG9wICs9IHRvb2x0aXBIZWlnaHQgLSBISURERU5fV0lEVEggKyBsaW5lR2FwO1xuICAgICAgICB9IGVsc2UgaWYgKHBvc2l0aW9uT3B0aW9uLmluZGV4T2YoJ21pZGRsZScpID4gLTEpIHtcbiAgICAgICAgICAgIHJlc3VsdC50b3AgKz0gdG9vbHRpcEhlaWdodCAvIDI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQudG9wIC09IFRPT0xUSVBfR0FQICsgSElEREVOX1dJRFRIO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlIHRvb2x0aXAgcmVjdCBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHt7Ym91bmQ6IG9iamVjdH19IHBhcmFtcy5kYXRhIGdyYXBoIGluZm9ybWF0aW9uXG4gICAgICogICAgICBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IHBhcmFtcy5kaW1lbnNpb24gdG9vbHRpcCBkaW1lbnNpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMucG9zaXRpb25PcHRpb24gcG9zaXRpb24gb3B0aW9uIChleDogJ2xlZnQgdG9wJylcbiAgICAgKiBAcmV0dXJucyB7e3RvcDogbnVtYmVyLCBsZWZ0OiBudW1iZXJ9fSBwb3NpdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NhbGN1bGF0ZVJlY3RQb3NpdGlvbjogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBib3VuZCA9IHBhcmFtcy5kYXRhLmJvdW5kLFxuICAgICAgICAgICAgbWludXNIZWlnaHQgPSBwYXJhbXMuZGltZW5zaW9uLmhlaWdodCAtIChib3VuZC5oZWlnaHQgfHwgMCksXG4gICAgICAgICAgICBwb3NpdGlvbk9wdGlvbiA9IHBhcmFtcy5wb3NpdGlvbk9wdGlvbiB8fCAnJyxcbiAgICAgICAgICAgIHRvb2x0aXBXaWR0aCA9IHBhcmFtcy5kaW1lbnNpb24ud2lkdGgsXG4gICAgICAgICAgICByZXN1bHQgPSB7fTtcblxuICAgICAgICByZXN1bHQubGVmdCA9IGJvdW5kLmxlZnQgKyBib3VuZC53aWR0aDtcbiAgICAgICAgcmVzdWx0LnRvcCA9IGJvdW5kLnRvcDtcbiAgICAgICAgaWYgKHBvc2l0aW9uT3B0aW9uLmluZGV4T2YoJ2xlZnQnKSA+IC0xKSB7XG4gICAgICAgICAgICByZXN1bHQubGVmdCAtPSB0b29sdGlwV2lkdGg7XG4gICAgICAgIH0gZWxzZSBpZiAocG9zaXRpb25PcHRpb24uaW5kZXhPZignY2VudGVyJykgPiAtMSkge1xuICAgICAgICAgICAgcmVzdWx0LmxlZnQgLT0gdG9vbHRpcFdpZHRoIC8gMjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdC5sZWZ0ICs9IFRPT0xUSVBfR0FQO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBvc2l0aW9uT3B0aW9uLmluZGV4T2YoJ3RvcCcpID4gLTEpIHtcbiAgICAgICAgICAgIHJlc3VsdC50b3AgLT0gbWludXNIZWlnaHQgKyBISURERU5fV0lEVEg7XG4gICAgICAgIH0gZWxzZSBpZiAocG9zaXRpb25PcHRpb24uaW5kZXhPZignbWlkZGxlJykgPiAtMSkge1xuICAgICAgICAgICAgcmVzdWx0LnRvcCAtPSBtaW51c0hlaWdodCAvIDI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQudG9wIC09IEhJRERFTl9XSURUSCAqIDI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlIHRvb2x0aXAgcG9zaXRpb24uXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge3tib3VuZDogb2JqZWN0LCBpc1BvaW50UG9zaXRpb246IGJvb2xlYW59fSBwYXJhbXMuZGF0YSBncmFwaCBpbmZvcm1hdGlvblxuICAgICAqICAgICAgQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBwYXJhbXMuZGltZW5zaW9uIHRvb2x0aXAgZGltZW5zaW9uXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLnBvc2l0aW9uT3B0aW9uIHBvc2l0aW9uIG9wdGlvbiAoZXg6ICdsZWZ0IHRvcCcpXG4gICAgICogQHJldHVybnMge3t0b3A6IG51bWJlciwgbGVmdDogbnVtYmVyfX0gcG9zaXRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jYWxjdWxhdGVQb3NpdGlvbjogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICAgICAgaWYgKHBhcmFtcy5kYXRhLmlzUG9pbnRQb3NpdGlvbikge1xuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5fY2FsY3VsYXRlUG9pbnRQb3NpdGlvbihwYXJhbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5fY2FsY3VsYXRlUmVjdFBvc2l0aW9uKHBhcmFtcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb25TaG93IGlzIGNhbGxiYWNrIG9mIGN1c3RvbSBldmVudCBzaG93VG9vbHRpcCBmb3IgU2VyaWVzVmlldy5cbiAgICAgKiBAcGFyYW0ge3tpZDogc3RyaW5nLCBib3VuZDogb2JqZWN0fX0gZGF0YSB0b29sdGlwIGRhdGFcbiAgICAgKi9cbiAgICBvblNob3c6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIGVsVG9vbHRpcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGRhdGEuaWQpLFxuICAgICAgICAgICAgYWRkUG9zaXRpb24gPSBuZS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgbGVmdDogMCxcbiAgICAgICAgICAgICAgICB0b3A6IDBcbiAgICAgICAgICAgIH0sIHRoaXMub3B0aW9ucy5hZGRQb3NpdGlvbiksXG4gICAgICAgICAgICBwb3NpdGlvbk9wdGlvbiA9IHRoaXMub3B0aW9ucy5wb3NpdGlvbiB8fCAnJyxcbiAgICAgICAgICAgIHBvc2l0aW9uO1xuXG4gICAgICAgIGlmICh0aGlzLnNob3dlZElkKSB7XG4gICAgICAgICAgICBkb20ucmVtb3ZlQ2xhc3MoZWxUb29sdGlwLCAnc2hvdycpO1xuICAgICAgICAgICAgdGhpcy5fZmlyZUhpZGVBbmltYXRpb24odGhpcy5zaG93ZWRJZCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNob3dlZElkID0gZGF0YS5pZDtcbiAgICAgICAgZG9tLmFkZENsYXNzKGVsVG9vbHRpcCwgJ3Nob3cnKTtcblxuICAgICAgICBwb3NpdGlvbiA9IHRoaXMuX2NhbGN1bGF0ZVBvc2l0aW9uKHtcbiAgICAgICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgICAgICBkaW1lbnNpb246IHtcbiAgICAgICAgICAgICAgICB3aWR0aDogZWxUb29sdGlwLm9mZnNldFdpZHRoLFxuICAgICAgICAgICAgICAgIGhlaWdodDogZWxUb29sdGlwLm9mZnNldEhlaWdodFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBvc2l0aW9uT3B0aW9uOiBwb3NpdGlvbk9wdGlvbiB8fCAnJ1xuICAgICAgICB9KTtcblxuICAgICAgICBlbFRvb2x0aXAuc3R5bGUuY3NzVGV4dCA9IFtcbiAgICAgICAgICAgIHJlbmRlclV0aWwuY29uY2F0U3RyKCdsZWZ0OicsIHBvc2l0aW9uLmxlZnQgKyBhZGRQb3NpdGlvbi5sZWZ0LCAncHgnKSxcbiAgICAgICAgICAgIHJlbmRlclV0aWwuY29uY2F0U3RyKCd0b3A6JywgcG9zaXRpb24udG9wICsgYWRkUG9zaXRpb24udG9wLCAncHgnKVxuICAgICAgICBdLmpvaW4oJzsnKTtcblxuICAgICAgICB0aGlzLl9maXJlU2hvd0FuaW1hdGlvbihkYXRhLmlkKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb25IaWRlIGlzIGNhbGxiYWNrIG9mIGN1c3RvbSBldmVudCBoaWRlVG9vbHRpcCBmb3IgU2VyaWVzVmlld1xuICAgICAqIEBwYXJhbSB7e2lkOiBzdHJpbmd9fSBkYXRhIHRvb2x0aXAgZGF0YVxuICAgICAqL1xuICAgIG9uSGlkZTogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgZWxUb29sdGlwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZGF0YS5pZCksXG4gICAgICAgICAgICB0aGF0ID0gdGhpcztcblxuICAgICAgICB0aGlzLl9oaWRlVG9vbHRpcChlbFRvb2x0aXAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGluZGV4ZXMgPSB0aGF0Ll9nZXRJbmRleEZyb21JZChkYXRhLmlkKTtcblxuICAgICAgICAgICAgdGhhdC5maXJlKCdoaWRlQW5pbWF0aW9uJywge1xuICAgICAgICAgICAgICAgIGdyb3VwSW5kZXg6IGluZGV4ZXNbMF0sXG4gICAgICAgICAgICAgICAgaW5kZXg6IGluZGV4ZXNbMV1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBkYXRhID0gbnVsbDtcbiAgICAgICAgICAgIGVsVG9vbHRpcCA9IG51bGw7XG4gICAgICAgICAgICB0aGF0ID0gbnVsbDtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhpZGUgdG9vbHRpcC5cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbFRvb2x0aXAgdG9vbHRpcCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgY2FsbGJhY2tcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9oaWRlVG9vbHRpcDogZnVuY3Rpb24oZWxUb29sdGlwLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgIGRlbGV0ZSB0aGlzLnNob3dlZElkO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHRoYXQuc2hvd2VkSWQgPT09IGVsVG9vbHRpcC5pZCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZG9tLnJlbW92ZUNsYXNzKGVsVG9vbHRpcCwgJ3Nob3cnKTtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoYXQgPSBudWxsO1xuICAgICAgICB9LCBISURFX0RFTEFZKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGV2ZW50XG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKi9cbiAgICBhdHRhY2hFdmVudDogZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgZXZlbnQuYmluZEV2ZW50KCdtb3VzZW92ZXInLCBlbCwgbmUudXRpbC5iaW5kKHRoaXMub25Nb3VzZW92ZXIsIHRoaXMpKTtcbiAgICAgICAgZXZlbnQuYmluZEV2ZW50KCdtb3VzZW91dCcsIGVsLCBuZS51dGlsLmJpbmQodGhpcy5vbk1vdXNlb3V0LCB0aGlzKSk7XG4gICAgfVxufSk7XG5cbm5lLnV0aWwuQ3VzdG9tRXZlbnRzLm1peGluKFRvb2x0aXApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRvb2x0aXA7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgVGhpcyBpcyB0ZW1wbGF0ZXMgb2YgdG9vbHRpcCB2aWV3LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxudmFyIHRlbXBsYXRlTWFrZXIgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3RlbXBsYXRlTWFrZXIuanMnKTtcblxudmFyIHRhZ3MgPSB7XG4gICAgSFRNTF9UT09MVElQOiAnPGRpdiBjbGFzcz1cIm5lLWNoYXJ0LXRvb2x0aXBcIiBpZD1cInt7IGlkIH19XCI+e3sgaHRtbCB9fTwvZGl2PicsXG4gICAgSFRNTF9ERUZBVUxUX1RFTVBMQVRFOiAnPGRpdiBjbGFzcz1cIm5lLWNoYXJ0LWRlZmF1bHQtdG9vbHRpcFwiPicgK1xuICAgICAgICAnPGRpdj57eyBsYWJlbCB9fTwvZGl2PicgK1xuICAgICAgICAnPGRpdj4nICtcbiAgICAgICAgICAgICc8c3Bhbj57eyBsZWdlbmRMYWJlbCB9fTwvc3Bhbj46JyArXG4gICAgICAgICAgICAnJm5ic3A7PHNwYW4+e3sgdmFsdWUgfX08L3NwYW4+JyArXG4gICAgICAgICAgICAnPHNwYW4+e3sgc3VmZml4IH19PC9zcGFuPicgK1xuICAgICAgICAnPC9kaXY+JyArXG4gICAgJzwvZGl2Pidcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIFRQTF9UT09MVElQOiB0ZW1wbGF0ZU1ha2VyLnRlbXBsYXRlKHRhZ3MuSFRNTF9UT09MVElQKSxcbiAgICBUUExfREVGQVVMVF9URU1QTEFURTogdGVtcGxhdGVNYWtlci50ZW1wbGF0ZSh0YWdzLkhUTUxfREVGQVVMVF9URU1QTEFURSlcbn07XG4iXX0=
