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
     * Render css style of title area
     * @param {HTMLElement} elTitleArea title element
     * @param {number} size (width or height)
     * @param {boolean} isPositionRight whether right position or not?
     * @private
     */
    _renderTitleAreaStyle: function(elTitleArea, size, isPositionRight) {
        var cssTexts = [
            renderUtil.concatStr('width:', size, 'px')
        ];

        if (isPositionRight) {
            cssTexts.push(renderUtil.concatStr('right:', -size, 'px'));
            cssTexts.push(renderUtil.concatStr('top:', 0, 'px'));
        } else {
            cssTexts.push(renderUtil.concatStr('left:', 0, 'px'));
            if (!renderUtil.isIE8()) {
                cssTexts.push(renderUtil.concatStr('top:', size, 'px'));
            }
        }

        elTitleArea.style.cssText += ';' + cssTexts.join(';');
    },

    /**
     * Title area renderer
     * @param {object} params parameters
     *      @param {string} params.title axis title
     *      @param {object} params.theme title theme
     *      @param {boolean} params.isVertical whether vertical or not?
     *      @param {boolean} params.isPositionRight whether right position or not?
     *      @param {number} params.size (width or height)
     * @returns {HTMLElement} title element
     * @private
     */
    _renderTitleArea: function(params) {
        var elTitleArea = renderUtil.renderTitle(params.title, params.theme, 'ne-chart-title-area');

        if (elTitleArea && params.isVertical) {
            this._renderTitleAreaStyle(elTitleArea, params.size, params.isPositionRight);
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
            positions = calculator.makeTickPixelPositions(size, tickCount),
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
            tickPixelPositions = calculator.makeTickPixelPositions(size, data.tickCount),
            labelSize = tickPixelPositions[1] - tickPixelPositions[0],
            labels = data.labels,
            isVertical = data.isVertical,
            isLabelAxis = data.isLabelAxis,
            posType = 'left',
            cssTexts = this._makeLabelCssTexts({
                isVertical: isVertical,
                isLabelAxis: isLabelAxis,
                labelSize: labelSize
            }),
            elLabelArea = dom.create('DIV', 'ne-chart-label-area'),
            areaCssText = renderUtil.makeFontCssText(theme.label),
            labelsHtml, titleAreaWidth;

        if (isVertical) {
            posType = isLabelAxis ? 'top' : 'bottom';
            titleAreaWidth = this._getRenderedTitleHeight() + TITLE_AREA_WIDTH_PADDING;
            areaCssText += ';width:' + (axisWidth - titleAreaWidth + V_LABEL_RIGHT_PADDING) + 'px';
        }

        tickPixelPositions.length = labels.length;

        labelsHtml = this._makeLabelsHtml({
            positions: tickPixelPositions,
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
            labelSize: labelSize
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
     *      @param {number} params.labelSize label size (width or height)
     * @returns {string[]} cssTexts
     * @private
     */
    _makeLabelCssTexts: function(params) {
        var cssTexts = [];

        if (params.isVertical && params.isLabelAxis) {
            cssTexts.push(renderUtil.concatStr('height:', params.labelSize, 'px'));
            cssTexts.push(renderUtil.concatStr('line-height:', params.labelSize, 'px'));
        } else if (!params.isVertical) {
            cssTexts.push(renderUtil.concatStr('width:', params.labelSize, 'px'));
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
     *      @param {number} params.labelSize label size (width or height)
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
            params.elLabelArea.style.left = renderUtil.concatStr('-', parseInt(params.labelSize / 2, 10), 'px');
        }
    }
});

module.exports = Axis;

},{"../helpers/calculator.js":20,"../helpers/domHandler.js":22,"../helpers/renderUtil.js":24,"./axisTemplate.js":2}],2:[function(require,module,exports){
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

},{"../helpers/templateMaker.js":25}],3:[function(require,module,exports){
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

},{"./code-snippet-util.js":13,"./const.js":14,"./factories/chartFactory.js":15,"./factories/pluginFactory.js":16,"./factories/themeFactory.js":17,"./registerCharts.js":37,"./registerThemes.js":38}],4:[function(require,module,exports){
/**
 * @fileoverview Area chart
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase'),
    AxisTypeBase = require('./axisTypeBase'),
    VerticalTypeBase = require('./verticalTypeBase'),
    calculator = require('../helpers/calculator'),
    Series = require('../series/areaChartSeries');

var AreaChart = ne.util.defineClass(ChartBase, /** @lends AreaChart.prototype */ {
    /**
     * Line chart.
     * @constructs AreaChart
     * @extends ChartBase
     * @mixes AxisTypeBase
     * @mixes VerticalTypeBase
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

        this.className = 'ne-line-area';

        ChartBase.call(this, bounds, theme, options, initedData);

        axisData = this._makeAxesData(convertData, bounds, options, initedData);
        this._addComponents(convertData, axisData, options);
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
            chartType: options.chartType,
            Series: Series,
            seriesData: {
                allowNegativeTooltip: true,
                data: {
                    values: calculator.arrayPivot(convertData.values),
                    formattedValues: calculator.arrayPivot(convertData.formattedValues),
                    scale: axesData.yAxis.scale
                }
            }
        });
    }
});

AxisTypeBase.mixin(AreaChart);
VerticalTypeBase.mixin(AreaChart);

module.exports = AreaChart;

},{"../helpers/calculator":20,"../series/areaChartSeries":39,"./axisTypeBase":5,"./chartBase":7,"./verticalTypeBase":12}],5:[function(require,module,exports){
/**
 * @fileoverview AxisTypeBase is base class of axis type chart(bar, column, line, area).
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Axis = require('../axes/axis.js'),
    Plot = require('../plots/plot.js'),
    Legend = require('../legends/legend.js'),
    Tooltip = require('../tooltips/tooltip.js');

/**
 * @classdesc AxisTypeBase is base class of axis type chart(bar, column, line, area).
 * @class AxisTypeBase
 * @mixin
 */
var AxisTypeBase = ne.util.defineClass(/** @lends AxisTypeBase.prototype */ {
    /**
     * Add axis components
     * @param {object} params parameters
     *      @param {object} params.covertData converted data
     *      @param {object} params.axes axes data
     *      @param {object} params.plotData plot data
     *      @param {function} params.Series series class
     */
    addAxisComponents: function(params) {
        var convertData = params.convertData,
            options = this.options;

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

        this.addComponent('series', params.Series, ne.util.extend({
            libType: options.libType,
            chartType: options.chartType,
            tooltipPrefix: this.tooltipPrefix
        }, params.seriesData));

        this.addComponent('tooltip', Tooltip, {
            values: convertData.values,
            formattedValues: convertData.formattedValues,
            labels: convertData.labels,
            legendLabels: convertData.legendLabels,
            prefix: this.tooltipPrefix
        });
    }
});

AxisTypeBase.mixin = function(func) {
    ne.util.extend(func.prototype, AxisTypeBase.prototype);
};

module.exports = AxisTypeBase;

},{"../axes/axis.js":1,"../legends/legend.js":26,"../plots/plot.js":28,"../tooltips/tooltip.js":48}],6:[function(require,module,exports){
/**
 * @fileoverview Bar chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase'),
    AxisTypeBase = require('./axisTypeBase'),
    axisDataMaker = require('../helpers/axisDataMaker'),
    Series = require('../series/barChartSeries');

var BarChart = ne.util.defineClass(ChartBase, /** @lends BarChart.prototype */ {
    /**
     * Bar chart.
     * @constructs BarChart
     * @extends ChartBase
     * @mixes AxisTypeBase
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

        ChartBase.call(this, bounds, theme, options);

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
            chartType: options.chartType,
            Series: Series,
            seriesData: {
                allowNegativeTooltip: true,
                data: {
                    values: convertData.values,
                    formattedValues: convertData.formattedValues,
                    formatFunctions: convertData.formatFunctions,
                    scale: axesData.xAxis.scale
                }
            }
        });
    }
});

AxisTypeBase.mixin(BarChart);

module.exports = BarChart;

},{"../helpers/axisDataMaker":18,"../series/barChartSeries":40,"./axisTypeBase":5,"./chartBase":7}],7:[function(require,module,exports){
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
        var convertData = dataConverter.convert(userData, options.chart, options.chartType),
            bounds = boundsMaker.make(ne.util.extend({
                chartType: options.chartType,
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
            renderUtil.renderFontFamily(el, this.theme.chart.fontFamily);
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
    },

    /**
     * Animate chart.
     */
    animateChart: function() {
        ne.util.forEachArray(this.components, function(component) {
            if (component.animateComponent) {
                component.animateComponent();
            }
        });
    },
});

module.exports = ChartBase;

},{"../helpers/boundsMaker.js":19,"../helpers/dataConverter.js":21,"../helpers/domHandler.js":22,"../helpers/renderUtil.js":24}],8:[function(require,module,exports){
/**
 * @fileoverview Column chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase'),
    AxisTypeBase = require('./axisTypeBase'),
    VerticalTypeBase = require('./verticalTypeBase'),
    Series = require('../series/columnChartSeries');

var ColumnChart = ne.util.defineClass(ChartBase, /** @lends ColumnChart.prototype */ {
    /**
     * Column chart.
     * @constructs ColumnChart
     * @extends ChartBase
     * @mixes AxisTypeBase
     * @mixes VerticalTypeBase
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

        ChartBase.call(this, bounds, theme, options, initedData);

        axisData = this._makeAxesData(convertData, bounds, options, initedData);
        this._addComponents(convertData, axisData, options);
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
            chartType: options.chartType,
            Series: Series,
            seriesData: {
                allowNegativeTooltip: true,
                data: {
                    values: convertData.values,
                    formattedValues: convertData.formattedValues,
                    formatFunctions: convertData.formatFunctions,
                    scale: axesData.yAxis.scale
                }
            }
        });
    }
});

AxisTypeBase.mixin(ColumnChart);
VerticalTypeBase.mixin(ColumnChart);

module.exports = ColumnChart;

},{"../series/columnChartSeries":41,"./axisTypeBase":5,"./chartBase":7,"./verticalTypeBase":12}],9:[function(require,module,exports){
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
            optionChartTypes = this._getYAxisOptionChartTypes(seriesChartTypes, options.yAxis),
            chartTypes = optionChartTypes.length ? optionChartTypes : seriesChartTypes,
            baseData = this.makeBaseData(userData, theme, options, {
                isVertical: true,
                hasAxes: true,
                optionChartTypes: optionChartTypes
            }),
            convertData = baseData.convertData,
            bounds = baseData.bounds,
            optionsMap = this._makeOptionsMap(chartTypes, options),
            themeMap = this._makeThemeMap(seriesChartTypes, theme, convertData.legendLabels),
            yAxisParams = {
                convertData: convertData,
                seriesDimension: bounds.series.dimension,
                chartTypes: chartTypes,
                isOneYAxis: !optionChartTypes.length,
                options: options
            },
            baseAxesData = {};

        this.className = 'ne-combo-chart';

        ChartBase.call(this, bounds, theme, options);

        baseAxesData.yAxis = this._makeYAxisData(ne.util.extend({
            index: 0
        }, yAxisParams));

        baseAxesData.xAxis = axisDataMaker.makeLabelAxisData({
            labels: convertData.labels
        });

        this._installCharts({
            userData: userData,
            baseData: baseData,
            baseAxesData: baseAxesData,
            axesData: this._makeAxesData(baseAxesData, yAxisParams),
            seriesChartTypes: seriesChartTypes,
            optionsMap: optionsMap,
            themeMap: themeMap
        });
    },

    /**
     * Get y axis option chart types.
     * @param {array.<string>} chartTypes chart types
     * @param {object} yAxisOptions y axis options
     * @returns {array.<string>} chart types
     * @private
     */
    _getYAxisOptionChartTypes: function(chartTypes, yAxisOptions) {
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
                this._increaseYAxisTickCount(yrAxisData.tickCount - yAxisData.tickCount, yAxisData);
            } else if (yAxisData.tickCount > yrAxisData.tickCount) {
                this._increaseYAxisTickCount(yAxisData.tickCount - yrAxisData.tickCount, yrAxisData);
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
    _makeOptionsMap: function(chartTypes, options) {
        var orderInfo = this._makeChartTypeOrderInfo(chartTypes),
            result = {};
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
     * Increase y axis tick count.
     * @param {number} increaseTickCount increase tick count
     * @param {object} toData to tick info
     * @private
     */
    _increaseYAxisTickCount: function(increaseTickCount, toData) {
        toData.scale.max += toData.step * increaseTickCount;
        toData.labels = calculator.makeLabelsFromScale(toData.scale, toData.step);
        toData.tickCount += increaseTickCount;
        toData.validTickCount += increaseTickCount;
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
            seriesChartTypes = params.seriesChartTypes,
            optionsMap = params.optionsMap,
            themeMap = params.themeMap,
            plotData = {
                vTickCount: baseAxesData.yAxis.validTickCount,
                hTickCount: baseAxesData.xAxis.validTickCount
            },
            joinLegendLabels = convertData.joinLegendLabels;

        this.charts = ne.util.map(seriesChartTypes, function(chartType) {
            var legendLabels = convertData.legendLabels[chartType],
                axes = params.axesData[chartType],
                sendOptions = optionsMap[chartType],
                sendTheme = themeMap[chartType],
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
            chart.animateChart();
        });
        return el;
    }
});

module.exports = ComboChart;

},{"../helpers/axisDataMaker.js":18,"../helpers/calculator.js":20,"../themes/defaultTheme.js":47,"./chartBase.js":7,"./columnChart":8,"./lineChart":10}],10:[function(require,module,exports){
/**
 * @fileoverview Line chart
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase'),
    AxisTypeBase = require('./axisTypeBase'),
    VerticalTypeBase = require('./verticalTypeBase'),
    calculator = require('../helpers/calculator'),
    Series = require('../series/lineChartSeries');

var LineChart = ne.util.defineClass(ChartBase, /** @lends LineChart.prototype */ {
    /**
     * Line chart.
     * @constructs LineChart
     * @extends ChartBase
     * @mixes AxisTypeBase
     * @mixes VerticalTypeBase
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

        ChartBase.call(this, bounds, theme, options, initedData);

        axisData = this._makeAxesData(convertData, bounds, options, initedData);
        this._addComponents(convertData, axisData, options);
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
            chartType: options.chartType,
            Series: Series,
            seriesData: {
                data: {
                    values: calculator.arrayPivot(convertData.values),
                    formattedValues: calculator.arrayPivot(convertData.formattedValues),
                    scale: axesData.yAxis.scale
                }
            }
        });
    }
});

AxisTypeBase.mixin(LineChart);
VerticalTypeBase.mixin(LineChart);

module.exports = LineChart;

},{"../helpers/calculator":20,"../series/lineChartSeries":42,"./axisTypeBase":5,"./chartBase":7,"./verticalTypeBase":12}],11:[function(require,module,exports){
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

        this._addComponents(convertData, theme.chart.background, bounds, options);
    },

    /**
     * Add components
     * @param {object} convertData converted data
     * @param {object} chartBackground chart background
     * @param {array.<object>} bounds bounds
     * @param {object} options chart options
     * @private
     */
    _addComponents: function(convertData, chartBackground, bounds, options) {
        if (convertData.joinLegendLabels && (!options.series || !options.series.legendType)) {
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
            chartBackground: chartBackground,
            data: {
                values: convertData.values,
                formattedValues: convertData.formattedValues,
                legendLabels: convertData.legendLabels,
                chartWidth: bounds.chart.dimension.width
            }
        });
    }
});

module.exports = PieChart;

},{"../legends/legend.js":26,"../series/pieChartSeries.js":44,"../tooltips/tooltip.js":48,"./chartBase.js":7}],12:[function(require,module,exports){
/**
 * @fileoverview VerticalTypeBase is base class of vertical type chart(column, line, area).
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var axisDataMaker = require('../helpers/axisDataMaker');

/**
 * @classdesc VerticalTypeBase is base class of vertical type chart(column, line, area).
 * @class VerticalTypeBase
 * @mixin
 */
var VerticalTypeBase = ne.util.defineClass(/** @lends VerticalTypeBase.prototype */ {
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
    }
});

VerticalTypeBase.mixin = function(func) {
    ne.util.extend(func.prototype, VerticalTypeBase.prototype);
};

module.exports = VerticalTypeBase;

},{"../helpers/axisDataMaker":18}],13:[function(require,module,exports){
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
 * All of them is true or not.
 * @param {array} arr target array
 * @param {function} condition condition function
 * @returns {boolean} result boolean
 */
var all = function(arr, condition) {
    var result = true;
    ne.util.forEachArray(arr, function(item) {
        if (!condition(item)) {
            result = false;
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
ne.util.all = all;
ne.util.lengthAfterPoint = lengthAfterPoint;
ne.util.mod = mod;
ne.util.findMultipleNum = findMultipleNum;
ne.util.addition = addition;
ne.util.subtraction = subtraction;
ne.util.multiplication = multiplication;
ne.util.division = division;
ne.util.sum = sum;

},{}],14:[function(require,module,exports){
/**
 * @fileoverview chart const
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

module.exports = {
    CHART_DEFAULT_WIDTH: 500,
    CHART_DEFAULT_HEIGHT: 400,
    HIDDEN_WIDTH: 1,
    TEXT_PADDING: 2,
    SERIES_LABEL_PADDING: 5,
    DEFAULT_TITLE_FONT_SIZE: 14,
    DEFAULT_AXIS_TITLE_FONT_SIZE: 10,
    DEFAULT_LABEL_FONT_SIZE: 12,
    DEFAULT_PLUGIN: 'raphael',
    DEFAULT_TICK_COLOR: 'black',
    DEFAULT_THEME_NAME: 'default',
    STACKED_NORMAL_TYPE: 'normal',
    STACKED_PERCENT_TYPE: 'percent',
    ANGLE_360: 360,
    RAD: Math.PI / 180,
    DEFAULT_SERIES_LABEL_FONT_SIZE: 11,
    SERIES_LEGEND_TYPE_OUTER: 'outer',
    SERIES_OUTER_LABEL_PADDING: 20,
    PIE_GRAPH_DEFAULT_RATE: 0.8,
    PIE_GRAPH_SMALL_RATE: 0.65,
    CHART_TYPE_BAR: 'bar',
    CHART_TYPE_COLUMN: 'column',
    CHART_TYPE_LINE: 'line',
    CHART_TYPE_AREA: 'area',
    CHART_TYPE_COMBO: 'combo',
    CHART_TYPE_PIE: 'pie',
    YAXIS_PROPS: ['tickColor', 'title', 'label'], // yaxis theme의 속성 - chart type filtering할 때 사용됨
    SERIES_PROPS: ['label', 'colors', 'borderColor', 'singleColors'] // series theme의 속성 - chart type filtering할 때 사용됨
};

},{}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
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
        var targetItems;
        theme = JSON.parse(JSON.stringify(theme));

        if (themeName !== chartConst.DEFAULT_THEME_NAME) {
            theme = this._initTheme(theme);
        }

        targetItems = this._getInheritTargetThemeItems(theme);

        this._inheritThemeFont(theme, targetItems);
        this._copyColorInfo(theme);
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
        newTheme = this._overwriteTheme(theme, cloneTheme);

        newTheme = this._copyProperty({
            propName: 'yAxis',
            fromTheme: theme,
            toTheme: newTheme,
            rejectionProps: chartConst.YAXIS_PROPS
        });

        newTheme = this._copyProperty({
            propName: 'series',
            fromTheme: theme,
            toTheme: newTheme,
            rejectionProps: chartConst.SERIES_PROPS
        });

        return newTheme;
    },

    /**
     * Filter chart types.
     * @param {object} target target charts
     * @param {array.<string>} rejectionProps reject property
     * @returns {Object} filtered charts.
     * @private
     */
    _filterChartTypes: function(target, rejectionProps) {
        var result;
        if (!target) {
            return [];
        }

        result = ne.util.filter(target, function(item, name) {
            return ne.util.inArray(name, rejectionProps) === -1;
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
     * Overwrite theme
     * @param {object} from from theme property
     * @param {object} to to theme property
     * @returns {object} result property
     * @private
     */
    _overwriteTheme: function(from, to) {
        ne.util.forEach(to, function(item, key) {
            var fromItem = from[key];
            if (!fromItem) {
                return;
            }

            if (ne.util.isArray(fromItem)) {
                to[key] = fromItem.slice();
            } else if (ne.util.isObject(fromItem)) {
                this._overwriteTheme(fromItem, item);
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
     *      @param {array.<string>} params.rejectionProps reject property name
     * @returns {object} copied property
     * @private
     */
    _copyProperty: function(params) {
        var chartTypes;

        if (!params.toTheme[params.propName]) {
            return params.toTheme;
        }

        chartTypes = this._filterChartTypes(params.fromTheme[params.propName], params.rejectionProps);
        if (ne.util.keys(chartTypes).length) {
            ne.util.forEach(chartTypes, function(item, key) {
                var cloneTheme = JSON.parse(JSON.stringify(defaultTheme[params.propName]));
                params.fromTheme[params.propName][key] = this._overwriteTheme(item, cloneTheme);
            }, this);

            params.toTheme[params.propName] = params.fromTheme[params.propName];
        }

        return params.toTheme;
    },

    /**
     * Copy color info to legend
     * @param {object} seriesTheme series theme
     * @param {object} legendTheme legend theme
     * @param {array.<string>} colors colors
     * @private
     */
    _copyColorInfoToLegend: function(seriesTheme, legendTheme, colors) {
        legendTheme.colors = colors || seriesTheme.colors;
        if (seriesTheme.singleColors) {
            legendTheme.singleColors = seriesTheme.singleColors;
        }
        if (seriesTheme.borderColor) {
            legendTheme.borderColor = seriesTheme.borderColor;
        }
    },

    /**
     * Get target items about font inherit.
     * @param {object} theme theme
     * @returns {array.<object>} target items
     * @private
     */
    _getInheritTargetThemeItems: function(theme) {
        var items = [
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
            ne.util.forEach(yAxisChartTypes, function(chatType) {
                items.push(chatType.title);
                items.push(chatType.label);
            });
        }

        if (!ne.util.keys(seriesChartTypes).length) {
            items.push(theme.series.label);
        } else {
            ne.util.forEach(yAxisChartTypes, function(chatType) {
                items.push(chatType.label);
            });
        }
        return items;
    },

    /**
     * Inherit theme font.
     * @param {object} theme theme
     * @param {array.<object>} targetItems target theme items
     * @private
     */
    _inheritThemeFont: function(theme, targetItems) {
        var baseFont = theme.chart.fontFamily;

        ne.util.forEachArray(targetItems, function(item) {
            if (!item.fontFamily) {
                item.fontFamily = baseFont;
            }
        });
    },

    /**
     * Copy color info.
     * @param {object} theme theme
     * @private
     * @ignore
     */
    _copyColorInfo: function(theme) {
        var seriesChartTypes = this._filterChartTypes(theme.series, chartConst.SERIES_PROPS);
        if (!ne.util.keys(seriesChartTypes).length) {
            this._copyColorInfoToLegend(theme.series, theme.legend);
        } else {
            ne.util.forEach(seriesChartTypes, function(item, chartType) {
                theme.legend[chartType] = {};
                this._copyColorInfoToLegend(item, theme.legend[chartType], item.colors || theme.legend.colors);
                delete theme.legend.colors;
            }, this);
        }
    }
};

},{"../const.js":14,"../themes/defaultTheme.js":47}],18:[function(require,module,exports){
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

        // 02. step 정규화 시키기 (ex: 0.3 --> 0.5, 7 --> 10)
        step = this._normalizeStep(step);

        // 03. scale 정규화 시키기
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

        // normalize된 scale min값이 user min값과 같을 경우 step 감소
        if ((params.chartType === chartConst.CHART_TYPE_LINE || min) && min === params.userMin) {
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

},{"../const.js":14,"./calculator.js":20}],19:[function(require,module,exports){
/**
 * @fileoverview Bounds maker.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var calculator = require('./calculator'),
    chartConst = require('../const'),
    renderUtil = require('./renderUtil');

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
     *      @param {boolean} params.hasAxes whether has axes area or not
     *      @param {array} params.optionChartTypes y axis option chart types
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
            left = yAxisWidth + CHART_PADDING,
            right = dimensions.legend.width + dimensions.yrAxis.width + CHART_PADDING,
            axesBounds = this._makeAxesBounds({
                hasAxes: params.hasAxes,
                optionChartTypes: params.optionChartTypes,
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
                        left: left
                    }
                },
                legend: {
                    position: {
                        top: dimensions.title.height,
                        left: yAxisWidth + dimensions.series.width + dimensions.yrAxis.width + CHART_PADDING
                    }
                },
                tooltip: {
                    dimension: dimensions.series,
                    position: {
                        top: top,
                        left: left
                    }
                }
            }, axesBounds);
        return bounds;
    },

    /**
     * Get max label of value axis.
     * @memberOf module:boundsMaker
     * @param {object} convertData convert data
     * @param {string} chartType chart type
     * @returns {number|string} max label
     * @private
     */
    _getValueAxisMaxLabel: function(convertData, chartType) {
        var values = chartType && convertData.values[chartType] || convertData.joinValues,
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
     * Get height of x axis area.
     * @memberOf module:boundsMaker
     * @param {object} options x axis options,
     * @param {array.<string>} labels axis labels
     * @param {object} theme axis theme
     * @returns {number} height
     * @private
     */
    _getXAxisHeight: function(options, labels, theme) {
        var title = options && options.title,
            titleAreaHeight = renderUtil.getRenderedLabelHeight(title, theme.title) + TITLE_ADD_PADDING,
            height = this._getRenderedLabelsMaxHeight(labels, theme.label) + titleAreaHeight;
        return height;
    },

    /**
     * Get width about y axis.
     * @param {object} options y axis options
     * @param {array.<string>} labels labels
     * @param {object} theme yAxis theme
     * @param {number} index options index
     * @returns {number} y axis width
     * @private
     */
    _getYAxisWidth: function(options, labels, theme, index) {
        var title = '',
            titleAreaWidth, width;

        if (options) {
            options = [].concat(options);
            title = options[index || 0].title;
        }

        titleAreaWidth = renderUtil.getRenderedLabelHeight(title, theme.title) + TITLE_ADD_PADDING;
        width = this._getRenderedLabelsMaxWidth(labels, theme.label) + titleAreaWidth + AXIS_LABEL_PADDING;

        return width;
    },

    /**
     * Get width about y right axis.
     * @memberOf module:boundsMaker
     * @param {object} params parameters
     *      @param {array.<string>} params.chartTypes y axis chart types
     *      @param {object} params.theme y axis theme
     *      @param {object} params.options y axis options
     * @returns {number} y right axis width
     * @private
     */
    _getYRAxisWidth: function(params) {
        var chartTypes = params.chartTypes || [],
            len = chartTypes.length,
            width = 0,
            index, chartType, theme, label;
        if (len > 0) {
            index = len - 1;
            chartType = chartTypes[index];
            theme = params.theme[chartType] || params.theme;
            label = this._getValueAxisMaxLabel(params.convertData, chartType);
            width = this._getYAxisWidth(params.options, [label], theme, index);
        }
        return width;
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
        var theme, options, convertData, optionChartTypes, maxValueLabel, yLabels,
            xLabels, yAxisWidth, xAxisHeight, yrAxisWidth, chartType;

        // pie차트와 같이 axis 영역이 필요 없는 경우에는 모두 0으로 반환
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
        optionChartTypes = params.optionChartTypes;

        chartType = optionChartTypes && optionChartTypes[0] || '';

        // value 중 가장 큰 값을 추출하여 value label로 지정 (lable 너비 체크 시 사용)
        maxValueLabel = this._getValueAxisMaxLabel(convertData, chartType);

        // 세로옵션에 따라서 x축과 y축에 적용할 레이블 정보 지정
        yLabels = params.isVertical ? [maxValueLabel] : convertData.labels;
        xLabels = params.isVertical ? convertData.labels : [maxValueLabel];

        yAxisWidth = this._getYAxisWidth(options.yAxis, yLabels, theme.yAxis[chartType] || theme.yAxis);
        xAxisHeight = this._getXAxisHeight(options.xAxis, xLabels, theme.xAxis);
        yrAxisWidth = this._getYRAxisWidth({
            convertData: convertData,
            chartTypes: optionChartTypes,
            theme: theme.yAxis,
            options: options.yAxis
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
    _getLegendAreaWidth: function(joinLegendLabels, labelTheme, chartType, seriesOption) {
        var legendWidth = 0,
            legendLabels, maxLabelWidth;

        seriesOption = seriesOption || {};

        if (chartType !== chartConst.CHART_TYPE_PIE || !seriesOption.legendType) {
            legendLabels = ne.util.map(joinLegendLabels, function(item) {
                return item.label;
            });
            maxLabelWidth = this._getRenderedLabelsMaxWidth(legendLabels, labelTheme);
            legendWidth = maxLabelWidth + LEGEND_RECT_WIDTH +
                LEGEND_LABEL_PADDING_LEFT + (LEGEND_AREA_PADDING * 2);
        }

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

        // axis 영역에 필요한 요소들의 너비 높이를 얻어옴
        axesDimension = this._makeAxesDimension(params);
        titleHeight = renderUtil.getRenderedLabelHeight(chartOptions.title, theme.title) + TITLE_ADD_PADDING;
        legendWidth = this._getLegendAreaWidth(convertData.joinLegendLabels, theme.legend.label, params.chartType, options.series);

        // series 너비, 높이 값은 차트 bounds를 구성하는 가장 중요한 요소다
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
            series: seriesDimension,
            legend: {
                width: legendWidth
            }
        }, axesDimension);
        return dimensions;
    },

    /**
     * To make axes bounds.
     * @memberOf module:boundsMaker
     * @param {object} params parameters
     *      @param {boolean} params.hasAxes whether has axed or not
     *      @param {array.<string>} params.optionChartTypes y axis chart types
     *      @param {{width: number, height: number}} params.dimension chart dimension
     *      @param {number} params.top top position
     *      @param {number} params.right right position
     * @returns {object} axes bounds
     * @private
     */
    _makeAxesBounds: function(params) {
        var bounds, dimensions, optionChartTypes, top, right;

        // pie차트와 같이 axis 영역이 필요 없는 경우에는 빈 값을 반환 함
        if (!params.hasAxes) {
            return {};
        }

        dimensions = params.dimensions;
        optionChartTypes = params.optionChartTypes;
        top = params.top;
        right = params.right;
        bounds = {
            plot: {
                dimension: dimensions.series,
                position: {
                    top: top,
                    right: right
                }
            },
            yAxis: {
                dimension: {
                    width: dimensions.yAxis.width,
                    height: dimensions.series.height
                },
                position: {
                    top: top,
                    left: CHART_PADDING + HIDDEN_WIDTH
                }
            },
            xAxis: {
                dimension: {
                    width: dimensions.series.width,
                    height: dimensions.xAxis.height
                },
                position: {
                    top: top + dimensions.series.height - HIDDEN_WIDTH,
                    right: right
                }
            }
        };

        // 우측 y axis 영역 bounds 정보 추가
        if (optionChartTypes && optionChartTypes.length) {
            bounds.yrAxis = {
                dimension: {
                    width: dimensions.yrAxis.width,
                    height: dimensions.series.height
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

},{"../const":14,"./calculator":20,"./renderUtil":24}],20:[function(require,module,exports){
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
     * To make tick positions of pixel type.
     * @memberOf module:calculator
     * @param {number} size area width or height
     * @param {number} count tick count
     * @returns {array.<number>} positions
     */
    makeTickPixelPositions: function(size, count) {
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

},{}],21:[function(require,module,exports){
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
     * @param {array.<array>} userData user data
     * @param {object} chartOptions chart option
     * @param {string} chartType chart type
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
        var zero = '0',
            isMinus = value < 0;

        value = Math.abs(value) + '';

        if (value.length >= len) {
            return value;
        }

        while (value.length < len) {
            value = zero + value;
        }

        return (isMinus ? '-' : '') + value;
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

},{"./calculator.js":20}],22:[function(require,module,exports){
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
        var className = el.className || '',
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

},{}],23:[function(require,module,exports){
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

},{}],24:[function(require,module,exports){
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

        elDiv = dom.create('DIV', 'ne-chart-size-check-element');
        elSpan = dom.create('SPAN');

        elDiv.appendChild(elSpan);
        this.checkEl = elDiv;
        return elDiv;
    },

    /**
     * Get rendered label size (width or height).
     * @memberOf module:renderUtil
     * @param {string} label label
     * @param {object} theme theme
     * @param {string} offsetType offset type (offsetWidth or offsetHeight)
     * @returns {number} size
     * @private
     */
    _getRenderedLabelSize: function(label, theme, offsetType) {
        var elDiv, elSpan, labelSize;

        if (ne.util.isUndefined(label) || label === '') {
            return 0;
        }

        elDiv = this._createSizeCheckEl();
        elSpan = elDiv.firstChild;

        theme = theme || {};
        elSpan.innerHTML = label;
        elSpan.style.fontSize = (theme.fontSize || chartConst.DEFAULT_LABEL_FONT_SIZE) + 'px';

        if (theme.fontFamily) {
            elSpan.style.padding = 0;
            elSpan.style.fontFamily = theme.fontFamily;
        }

        document.body.appendChild(elDiv);
        labelSize = elSpan[offsetType];
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
     * Render font family.
     * @memberOf module:renderUtil
     * @param {HTMLElement} el target element
     * @param {string} fontFamily font family option
     */
    renderFontFamily: function(el, fontFamily) {
        if (!fontFamily) {
            return;
        }

        el.style.fontFamily = fontFamily;
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

},{"./../const.js":14,"./domHandler":22}],25:[function(require,module,exports){
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

},{}],26:[function(require,module,exports){
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
     * Set theme for legend labels
     * @param {array.<object>} labels labels
     * @param {object} theme legend theme
     * @returns {array.<object>} labels
     * @private
     */
    _setThemeForLabels: function(labels, theme) {
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
            result = this._setThemeForLabels(joinLegendLabels, theme);
        } else {
            chartTheme = theme[chartType] || defaultLegendTheme;
            result = this._setThemeForLabels(joinLegendLabels.slice(0, labelLen), chartTheme);
            chartTheme = theme[ne.util.filter(chartTypes, function(propName) {
                return propName !== chartType;
            })[0]] || defaultLegendTheme;
            result = result.concat(this._setThemeForLabels(joinLegendLabels.slice(labelLen), chartTheme));
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
            template = legendTemplate.tplLegend,
            labelHeight = renderUtil.getRenderedLabelHeight(labels[0].label, labels[0].theme) + (LABEL_PADDING_TOP * 2),
            baseMarginTop = parseInt((labelHeight - LEGEND_RECT_WIDTH) / 2, 10) - 1,
            html = ne.util.map(labels, function(label) {
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

},{"../const.js":14,"../helpers/domHandler.js":22,"../helpers/renderUtil.js":24,"../themes/defaultTheme.js":47,"./../legends/legendTemplate.js":27}],27:[function(require,module,exports){
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
    tplLegend: templateMaker.template(tags.HTML_LEGEND)
};

},{"../helpers/templateMaker.js":25}],28:[function(require,module,exports){
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
        var hPositions = this._makeHorizontalPixelPositions(dimension.width),
            vPositions = this._makeVerticalPixelPositions(dimension.height),
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
        var template = plotTemplate.tplPlotLine,
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
     * @private
     */
    _makeVerticalPixelPositions: function(height) {
        var positions = calculator.makeTickPixelPositions(height, this.vTickCount);
        positions.shift();
        return positions;
    },

    /**
     * To make pixel value of horizontal positions.
     * @param {number} width plot width
     * @returns {array.<number>} positions
     * @private
     */
    _makeHorizontalPixelPositions: function(width) {
        var positions = calculator.makeTickPixelPositions(width, this.hTickCount);
        positions.shift();
        return positions;
    }
});

module.exports = Plot;

},{"../helpers/calculator.js":20,"../helpers/domHandler.js":22,"../helpers/renderUtil.js":24,"./plotTemplate.js":29}],29:[function(require,module,exports){
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
    tplPlotLine: templateMaker.template(tags.HTML_PLOT_LINE)
};

},{"../helpers/templateMaker.js":25}],30:[function(require,module,exports){
/**
 * @fileoverview Raphael render plugin.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var BarChart = require('./raphaelBarChart.js'),
    LineChart = require('./raphaelLineChart.js'),
    AreaChart = require('./raphaelAreaChart.js'),
    PieChart = require('./raphaelPieChart.js');

var pluginName = 'raphael',
    pluginRaphael;

pluginRaphael = {
    bar: BarChart,
    column: BarChart,
    line: LineChart,
    area: AreaChart,
    pie: PieChart
};

ne.application.chart.registerPlugin(pluginName, pluginRaphael);

},{"./raphaelAreaChart.js":31,"./raphaelBarChart.js":32,"./raphaelLineChart.js":33,"./raphaelPieChart.js":35}],31:[function(require,module,exports){
/**
 * @fileoverview Raphael area chart renderer.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var RaphaelLineBase = require('./raphaelLineTypeBase'),
    raphaelRenderUtil = require('./raphaelRenderUtil');

var Raphael = window.Raphael,
    ANIMATION_TIME = 700;

var concat = Array.prototype.concat;

/**
 * @classdesc RaphaelAreaChart is graph renderer for area chart.
 * @class RaphaelAreaChart
 * @extends RaphaelLineTypeBase
 */
var RaphaelAreaChart = ne.util.defineClass(RaphaelLineBase, /** @lends RaphaelAreaChart.prototype */ {
    /**
     * Render function of area chart.
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
            groupPaths = this._getAreasPath(groupPositions, data.zeroTop),
            borderStyle = this.makeBorderStyle(theme.borderColor, opacity),
            outDotStyle = this.makeOutDotStyle(opacity, borderStyle),
            groupAreas, groupDots;

        if (!paper) {
            paper = Raphael(container, dimension.width, dimension.height);
        }

        groupAreas = this._renderAreas(paper, groupPaths, colors);
        groupDots = this.renderDots(paper, groupPositions, colors, borderStyle);

        this.outDotStyle = outDotStyle;
        this.groupPaths = groupPaths;
        this.groupAreas = groupAreas;
        this.groupDots = groupDots;
        this.dotOpacity = opacity;

        this.attachEvent(groupDots, groupPositions, outDotStyle, inCallback, outCallback);

        return paper;
    },

    /**
     * Render area graph.
     * @param {object} paper paper
     * @param {{start: string, addStart: string}} path path
     * @param {string} color color
     * @returns {array.<object>} raphael object
     * @private
     */
    _renderArea: function(paper, path, color) {
        var result = [],
            area = paper.path([path.start]),
            fillStyle = {
                fill: color,
                opacity: 0.5,
                stroke: color,
                'stroke-opacity': 0
            },
            addArea;

        area.attr(fillStyle);
        result.push(area);

        if (path.addStart) {
            addArea = paper.path([path.addStart]);
            addArea.attr(fillStyle);
            result.push(addArea);
        }
        return result;
    },

    /**
     * Render area graphs.
     * @param {object} paper paper
     * @param {array.<object>} groupPaths group paths
     * @param {array.<string>} colors colors
     * @returns {array} raphael objects
     * @private
     */
    _renderAreas: function(paper, groupPaths, colors) {
        var groupAreas = ne.util.map(groupPaths, function(paths, groupIndex) {
            var color = colors[groupIndex] || 'transparent';
            return ne.util.map(paths, function(path) {
                var result = {
                    area: this._renderArea(paper, path.area, color),
                    line: raphaelRenderUtil.renderLine(paper, path.line.start, color)
                };
                return result;
            }, this);
        }, this);

        return groupAreas;
    },

    /**
     * Whether minus or not.
     * @param {number} value value
     * @returns {boolean} result boolean
     * @private
     */
    _isMinus: function(value) {
        return value < 0;
    },

    /**
     * Whether plus or not.
     * @param {number} value value
     * @returns {boolean} result boolean
     * @private
     */
    _isPlus: function(value) {
        return value >= 0;
    },

    /**
     * To make height.
     * @param {number} top top
     * @param {number} zeroTop zero position top
     * @returns {number} height
     * @private
     */
    _makeHeight: function(top, zeroTop) {
        return Math.abs(top - zeroTop);
    },

    /**
     * Find middle left
     * @param {{left: number, top: number}} fromPos from position
     * @param {{left: number, top: number}} toPos to position
     * @param {number} zeroTop zero position top
     * @returns {number} middle left
     * @private
     */
    _findMiddleLeft: function(fromPos, toPos, zeroTop) {
        var tops = [zeroTop - fromPos.top, zeroTop - toPos.top],
            middleLeft, width, fromHeight, toHeight;

        if (ne.util.all(tops, this._isMinus) || ne.util.all(tops, this._isPlus)) {
            return -1;
        }

        fromHeight = this._makeHeight(fromPos.top, zeroTop);
        toHeight = this._makeHeight(toPos.top, zeroTop);
        width = toPos.left - fromPos.left;

        middleLeft = fromPos.left + (width * (fromHeight / (fromHeight + toHeight)));
        return middleLeft;
    },

    /**
     * To make area path.
     * @param {{left: number, top: number}} fromPos from position
     * @param {{left: number, top: number}} toPos to position
     * @param {number} zeroTop zero position top
     * @returns {string} area path
     * @private
     */
    _makeAreaPath: function(fromPos, toPos, zeroTop) {
        var fromStartPoint = ['M', fromPos.left, ' ', zeroTop],
            fromEndPoint = zeroTop === fromPos.top ? [] : ['L', fromPos.left, ' ', fromPos.top],
            toStartPoint = ['L', toPos.left, ' ', toPos.top],
            toEndPoint = zeroTop === toPos.top ? [] : ['L', toPos.left, ' ', zeroTop];
        return concat.call([], fromStartPoint, fromEndPoint, toStartPoint, toEndPoint).join('');
    },

    /**
     * To make area paths.
     * @param {{left: number, top: number}} fromPos from position
     * @param {{left: number, top: number}} toPos to position
     * @param {number} zeroTop zero position top
     * @returns {{
     *      start: string,
     *      end: string,
     *      addStart: string,
     *      addEnd: string
     * }} area paths
     * @private
     */
    _makeAreaPaths: function(fromPos, toPos, zeroTop) {
        var middleLeft = this._findMiddleLeft(fromPos, toPos, zeroTop),
            result = {
                start: this._makeAreaPath(fromPos, fromPos, zeroTop)
            },
            middlePos;

        if (this._isPlus(middleLeft)) {
            middlePos = {left: middleLeft, top: zeroTop};
            result.end = this._makeAreaPath(fromPos, middlePos, zeroTop);
            result.addStart = this._makeAreaPath(middlePos, middlePos, zeroTop);
            result.addEnd = this._makeAreaPath(middlePos, toPos, zeroTop);
        } else {
            result.end = this._makeAreaPath(fromPos, toPos, zeroTop);
        }

        return result;
    },

    /**
     * Get area path.
     * @param {array.<array.<object>>} groupPositions positions
     * @param {number} zeroTop zero top
     * @returns {array.<array.<string>>} paths
     * @private
     */
    _getAreasPath: function(groupPositions, zeroTop) {
        var groupPaths = ne.util.map(groupPositions, function(positions) {
            var fromPos = positions[0],
                rest = positions.slice(1);
            return ne.util.map(rest, function(position) {
                var result = {
                    area: this._makeAreaPaths(fromPos, position, zeroTop),
                    line: this.makeLinePath(fromPos, position)
                };
                fromPos = position;
                return result;
            }, this);
        }, this);
        return groupPaths;
    },

    /**
     * Animate area chart.
     * @param {object} area raphael object
     * @param {string} areaPath path
     * @param {number} time play time
     * @param {number} startTime start time
     * @private
     */
    _animateArea: function(area, areaPath, time, startTime) {
        var areaAddEndPath = areaPath.addEnd,
            areaEndPath = areaPath.end;
        if (areaAddEndPath) {
            time = time / 2;
            setTimeout(function() {
                area[1].animate({path: areaAddEndPath, 'stroke-opacity': 0.25}, time);
            }, startTime + time);
        }
        setTimeout(function() {
            area[0].animate({path: areaEndPath, 'stroke-opacity': 0.25}, time);
        }, startTime);
    },

    /**
     * Animate.
     * @param {function} callback callback
     */
    animate: function(callback) {
        var groupAreas = this.groupAreas,
            groupPaths = this.groupPaths,
            opacity = this.dotOpacity,
            time = ANIMATION_TIME / groupAreas[0].length,
            startTime;
        ne.util.forEachArray(this.groupDots, function(dots, groupIndex) {
            startTime = 0;
            ne.util.forEachArray(dots, function(dot, index) {
                var area, areaPath;
                if (index) {
                    area = groupAreas[groupIndex][index - 1];
                    areaPath = groupPaths[groupIndex][index - 1];
                    this.animateLine(area.line, areaPath.line.end, time, startTime);
                    this._animateArea(area.area, areaPath.area, time, startTime);
                    startTime += time;
                }

                if (opacity) {
                    setTimeout(function() {
                        dot.attr({'fill-opacity': opacity});
                    }, startTime);
                }
            }, this);
        }, this);

        if (callback) {
            setTimeout(callback, startTime);
        }
    }
});

module.exports = RaphaelAreaChart;

},{"./raphaelLineTypeBase":34,"./raphaelRenderUtil":36}],32:[function(require,module,exports){
/**
 * @fileoverview Raphael bar chart renderer.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Raphael = window.Raphael;

var ANIMATION_TIME = 700;

/**
 * @classdesc RaphaelBarChart is graph renderer for bar, column chart.
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
            return null;
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
            borderColor = theme.borderColor || 'none',
            bars = [];
        ne.util.forEachArray(groupBounds, function(bounds, groupIndex) {
            var singleColor = singleColors[groupIndex],
                color, id, rect;
            ne.util.forEachArray(bounds, function(bound, index) {
                if (!bound) {
                    return;
                }

                color = singleColor || colors[index];
                id = groupIndex + '-' + index;
                rect = this._renderBar(paper, color, borderColor, bound.start);

                if (rect) {
                    this._bindHoverEvent(rect, bound.end, id, inCallback, outCallback);
                }

                bars.push({
                    rect: rect,
                    bound: bound.end
                });
            }, this);
        }, this);

        this.bars = bars;
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
        var rect;
        if (bound.width < 0 || bound.height < 0) {
            return null;
        }
        rect = paper.rect(bound.left, bound.top, bound.width, bound.height);
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
    },

    /**
     * Animate.
     * @param {function} callback callback
     */
    animate: function(callback) {
        ne.util.forEach(this.bars, function(bar) {
            var bound = bar.bound;
            bar.rect.animate({
                x: bound.left,
                y: bound.top,
                width: bound.width,
                height: bound.height
            }, ANIMATION_TIME);
        });

        if (callback) {
            setTimeout(callback, ANIMATION_TIME);
        }
    }
});

module.exports = RaphaelBarChart;

},{}],33:[function(require,module,exports){
/**
 * @fileoverview Raphael line chart renderer.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var RaphaelLineBase = require('./raphaelLineTypeBase'),
    raphaelRenderUtil = require('./raphaelRenderUtil');

var Raphael = window.Raphael,
    ANIMATION_TIME = 700;

/**
 * @classdesc RaphaelLineCharts is graph renderer for line chart.
 * @class RaphaelLineChart
 * @extends RaphaelLineTypeBase
 */
var RaphaelLineChart = ne.util.defineClass(RaphaelLineBase, /** @lends RaphaelLineChart.prototype */ {
    /**
     * Render function of line chart.
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
            borderStyle = this.makeBorderStyle(theme.borderColor, opacity),
            outDotStyle = this.makeOutDotStyle(opacity, borderStyle),
            groupLines, groupDots;

        if (!paper) {
            paper = Raphael(container, dimension.width, dimension.height);
        }

        groupLines = this._renderLines(paper, groupPaths, colors);
        groupDots = this.renderDots(paper, groupPositions, colors, borderStyle);

        this.outDotStyle = outDotStyle;
        this.groupPaths = groupPaths;
        this.groupLines = groupLines;
        this.groupDots = groupDots;
        this.dotOpacity = opacity;

        this.attachEvent(groupDots, groupPositions, outDotStyle, inCallback, outCallback);

        return paper;
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
                var result = this.makeLinePath(fromPos, position);
                fromPos = position;
                return result;
            }, this);
        }, this);
        return groupPaths;
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
                return raphaelRenderUtil.renderLine(paper, path.start, color, strokeWidth);
            }, this);
        }, this);

        return groupLines;
    },

    /**
     * Animate.
     * @param {function} callback callback
     */
    animate: function(callback) {
        var groupLines = this.groupLines,
            groupPaths = this.groupPaths,
            opacity = this.dotOpacity,
            time = ANIMATION_TIME / groupLines[0].length,
            startTime;
        ne.util.forEachArray(this.groupDots, function(dots, groupIndex) {
            startTime = 0;
            ne.util.forEachArray(dots, function(dot, index) {
                var line, path;
                if (index) {
                    line = groupLines[groupIndex][index - 1];
                    path = groupPaths[groupIndex][index - 1].end;
                    this.animateLine(line, path, time, startTime);
                    startTime += time;
                }

                if (opacity) {
                    setTimeout(function() {
                        dot.attr({'fill-opacity': opacity});
                    }, startTime);
                }
            }, this);
        }, this);

        if (callback) {
            setTimeout(callback, startTime);
        }
    }
});

module.exports = RaphaelLineChart;

},{"./raphaelLineTypeBase":34,"./raphaelRenderUtil":36}],34:[function(require,module,exports){
/**
 * @fileoverview RaphaelLineTypeBase is base class for line type renderer.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var raphaelRenderUtil = require('./raphaelRenderUtil');

var DEFAULT_DOT_WIDTH = 4,
    HOVER_DOT_WIDTH = 5;

/**
 * @classdesc RaphaelLineTypeBase is base for line type renderer.
 * @class RaphaelLineTypeBase
 */
var RaphaelLineTypeBase = ne.util.defineClass(/** @lends RaphaelLineTypeBase.prototype */ {
    /**
     * To make line paths.
     * @param {{left: number, top: number}} fromPos from position
     * @param {{left: number, top: number}} toPos to position
     * @returns {{start: string, end: string}} line paths.
     */
    makeLinePath: function(fromPos, toPos) {
        var startLinePath = raphaelRenderUtil.makeLinePath(fromPos, fromPos),
            endLinePath = raphaelRenderUtil.makeLinePath(fromPos, toPos);
        return {
            start: startLinePath,
            end: endLinePath
        };
    },

    /**
     * To make border style.
     * @param {string} borderColor border color
     * @param {number} opacity opacity
     * @returns {{stroke: string, stroke-width: number, strike-opacity: number}} border style
     */
    makeBorderStyle: function(borderColor, opacity) {
        var borderStyle;
        if (borderColor) {
            borderStyle = {
                stroke: borderColor,
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
     */
    makeOutDotStyle: function(opacity, borderStyle) {
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
     */
    renderDot: function(paper, position, color, opacity, borderStyle) {
        var dot = paper.circle(position.left, position.top, DEFAULT_DOT_WIDTH),
            dotStyle = {
                fill: color,
                'fill-opacity': 0,
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
     * @param {object} borderStyle border style
     * @returns {array.<object>} dots
     */
    renderDots: function(paper, groupPositions, colors, borderStyle) {
        var dots = ne.util.map(groupPositions, function(positions, groupIndex) {
            var color = colors[groupIndex];
            return ne.util.map(positions, function(position) {
                var dot = this.renderDot(paper, position, color, borderStyle);
                return dot;
            }, this);
        }, this);

        return dots;
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
     */
    attachEvent: function(groupDots, groupPositions, outDotStyle, inCallback, outCallback) {
        ne.util.forEach(groupDots, function(dots, groupIndex) {
            ne.util.forEach(dots, function(dot, index) {
                var position = groupPositions[groupIndex][index],
                    id = index + '-' + groupIndex;
                this._bindHoverEvent(dot, position, id, inCallback, outCallback);
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
    },

    /**
     * Animate line.
     * @param {object} line raphael object
     * @param {string} linePath line path
     * @param {number} time play time
     * @param {number} startTime start time
     */
    animateLine: function(line, linePath, time, startTime) {
        setTimeout(function() {
            line.animate({path: linePath}, time);
        }, startTime);
    }
});

module.exports = RaphaelLineTypeBase;

},{"./raphaelRenderUtil":36}],35:[function(require,module,exports){
/**
 * @fileoverview RaphaelPieCharts is graph renderer for pie chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var raphaelRenderUtil = require('./raphaelRenderUtil');

var Raphael = window.Raphael,
    ANGLE_180 = 180,
    ANGLE_90 = 90,
    RAD = Math.PI / ANGLE_180,
    ANIMATION_TIME = 500,
    LOADING_ANIMATION_TIME = 700;

/**
 * @classdesc RaphaelPieCharts is graph renderer for pie chart.
 * @class RaphaelPieChart
 */
var RaphaelPieChart = ne.util.defineClass(/** @lends RaphaelPieChart.prototype */ {
    /**
     * Render function of pie chart.
     * @param {object} paper raphael paper
     * @param {HTMLElement} container container
     * @param {{sectorsInfo: array.<object>, circleBound: {cx: number, cy: number, r: number}, dimension: object, theme: object, options: object}} data render data
     * @param {function} inCallback in callback
     * @param {function} outCallback out callback
     * @return {object} paper raphael paper
     */
    render: function(paper, container, data, inCallback, outCallback) {
        var dimension = data.dimension;

        if (!paper) {
            paper = Raphael(container, dimension.width, dimension.height);
        }

        if (!paper.customAttributes.sector) {
            paper.customAttributes.sector = ne.util.bind(this._makeSectorPath, this);
        }

        this.circleBound = data.circleBound;
        this._renderPie(paper, data, inCallback, outCallback);

        return paper;
    },

    /**
     * To make sector path.
     * @param {number} cx center x
     * @param {number} cy center y
     * @param {number} r radius
     * @param {number} startAngle start angle
     * @param {number} endAngle end angel
     * @returns {{path: array}} sector path
     * @private
     */
    _makeSectorPath: function(cx, cy, r, startAngle, endAngle) {
        var x1 = cx + r * Math.cos(-(startAngle - ANGLE_90) * RAD), // 원 호의 시작 x 좌표
            y1 = cy - r * Math.sin(-(startAngle - ANGLE_90) * RAD), // 원 호의 시작 y 좌표
            x2 = cx + r * Math.cos(-(endAngle - ANGLE_90) * RAD),// 원 호의 종료 x 좌표
            y2 = cy - r * Math.sin(-(endAngle - ANGLE_90) * RAD), // 원 호의 종료 y 좌표
            largeArcFlag = endAngle - startAngle > ANGLE_180 ? 1 : 0,
            path = ["M", cx, cy,
                "L", x2, y2,
                "A", r, r, 0, largeArcFlag, 0, x1, y1,
                "Z"
            ];
        return {path: path};
    },

    /**
     * Render sector
     * @param {object} params parameters
     *      @param {object} params.paper raphael paper
     *      @param {{cx: number, cy: number, r:number}} params.circleBound circle bounds
     *      @param {number} params.startAngle start angle
     *      @param {number} params.endAngle end angle
     *      @param {{fill: string, stroke: string, strike-width: string}} params.attrs attrs
     * @returns {object} raphael object
     * @private
     */
    _renderSector: function (params) {
        var circleBound = params.circleBound,
            angles = params.angles;
        return params.paper.path().attr({
            sector: [circleBound.cx, circleBound.cy, circleBound.r, angles.startAngle, angles.endAngle]
        }).attr(params.attrs);
    },

    /**
     * Render pie graph.
     * @param {object} paper raphael paper
     * @param {{sectorsInfo: array.<object>, circleBound: {cx: number, cy: number, r: number}, dimension: object, theme: object, options: object}} data render data
     * @param {function} inCallback in callback
     * @param {function} outCallback out callback
     * @private
     */
    _renderPie: function(paper, data, inCallback, outCallback) {
        var circleBound = data.circleBound,
            colors = data.theme.colors,
            chartBackground = data.chartBackground,
            sectors = [];

        ne.util.forEachArray(data.sectorsInfo, function(sectorInfo, index) {
            var percentValue = sectorInfo.percentValue,
                color = colors[index],
                sector = this._renderSector({
                    paper: paper,
                    circleBound: circleBound,
                    angles: sectorInfo.angles.start,
                    attrs: {
                        fill: color,
                        stroke: chartBackground,
                        'stroke-width': 1
                    }
                });

            this._bindHoverEvent({
                target: sector,
                position: sectorInfo.popupPosition,
                id: '0-' + index,
                inCallback: inCallback,
                outCallback: outCallback
            });

            sectors.push({
                sector: sector,
                angles: sectorInfo.angles.end,
                percentValue: percentValue
            });
        }, this);

        this.sectors = sectors;
    },

    /**
     * Render legend lines.
     * @param {object} paper paper
     * @param {array.<object>} outerPositions outer position
     */
    renderLegendLines: function(paper, outerPositions) {
        var paths = this._makeLinePaths(outerPositions),
            legendLines = ne.util.map(paths, function(path) {
                return raphaelRenderUtil.renderLine(paper, path, 'transparent', 1);
            });
        this.legendLines = legendLines;
    },

    /**
     * To make line paths.
     * @param {array.<object>} outerPositions outer positions
     * @returns {Array} line paths.
     * @private
     */
    _makeLinePaths: function(outerPositions) {
        var paths = ne.util.map(outerPositions, function(positions) {
            return [
                raphaelRenderUtil.makeLinePath(positions.start, positions.middle),
                raphaelRenderUtil.makeLinePath(positions.middle, positions.end)
            ].join('');
        }, this);
        return paths;
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
        params.target.mouseover(function () {
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
        var sector = this.sectors[data.index].sector,
            cx = this.circleBound.cx,
            cy = this.circleBound.cy;
        sector.animate({
            transform: "s1.1 1.1 " + cx + " " + cy
        }, ANIMATION_TIME, "elastic");
    },

    /**
     * Hide animation.
     * @param {{groupIndex: number, index:number}} data hide info
     */
    hideAnimation: function(data) {
        var sector = this.sectors[data.index].sector;
        sector.animate({transform: ""}, ANIMATION_TIME, "elastic");
    },

    /**
     * Animate.
     * @param {function} callback callback
     */
    animate: function(callback) {
        var delayTime = 0,
            circleBound = this.circleBound;
        ne.util.forEachArray(this.sectors, function(item) {
            var angles = item.angles,
                animationTime = LOADING_ANIMATION_TIME * item.percentValue,
                anim = Raphael.animation({
                    sector: [circleBound.cx, circleBound.cy, circleBound.r, angles.startAngle, angles.endAngle]
                }, animationTime);
            item.sector.animate(anim.delay(delayTime));
            delayTime += animationTime;
        }, this);

        if (callback) {
            setTimeout(callback, delayTime);
        }
    },

    /**
     * Animate legend lines.
     */
    animateLegendLines: function() {
        if (!this.legendLines) {
            return;
        }
        ne.util.forEachArray(this.legendLines, function(line) {
            line.animate({
                'stroke': 'black',
                'stroke-opacity': 1
            });
        });
    }
});

module.exports = RaphaelPieChart;

},{"./raphaelRenderUtil":36}],36:[function(require,module,exports){
/**
 * @fileoverview Util for raphael rendering.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

/**
 * Util for raphael rendering.
 * @module raphaelRenderUtil
 */
var raphaelRenderUtil = {
    /**
     * To make line path.
     * @memberOf module:raphaelRenderUtil
     * @param {{top: number, left: number}} fromPos from position
     * @param {{top: number, left: number}} toPos to position
     * @param {number} width width
     * @returns {string} path
     */
    makeLinePath: function(fromPos, toPos, width) {
        var fromPoint = [fromPos.left, fromPos.top],
            toPoint = [toPos.left, toPos.top];

        width = width || 1;

        ne.util.forEachArray(fromPoint, function(from, index) {
            if (from === toPoint[index]) {
                fromPoint[index] = toPoint[index] = Math.round(from) - (width % 2 / 2);
            }
        });
        return 'M' + fromPoint.join(' ') + 'L' + toPoint.join(' ');
    },

    /**
     * Render line.
     * @memberOf module:raphaelRenderUtil
     * @param {object} paper raphael paper
     * @param {string} path line path
     * @param {string} color line color
     * @param {number} strokeWidth stroke width
     * @returns {object} raphael line
     */
    renderLine: function(paper, path, color, strokeWidth) {
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
    }
};

module.exports = raphaelRenderUtil;

},{}],37:[function(require,module,exports){
'use strict';

var chartConst = require('./const.js'),
    chartFactory = require('./factories/chartFactory.js'),
    BarChart = require('./charts/barChart.js'),
    ColumnChart = require('./charts/columnChart.js'),
    LineChart = require('./charts/lineChart.js'),
    AreaChart = require('./charts/areaChart.js'),
    ComboChart = require('./charts/comboChart.js'),
    PieChart = require('./charts/pieChart.js');

chartFactory.register(chartConst.CHART_TYPE_BAR, BarChart);
chartFactory.register(chartConst.CHART_TYPE_COLUMN, ColumnChart);
chartFactory.register(chartConst.CHART_TYPE_LINE, LineChart);
chartFactory.register(chartConst.CHART_TYPE_AREA, AreaChart);
chartFactory.register(chartConst.CHART_TYPE_COMBO, ComboChart);
chartFactory.register(chartConst.CHART_TYPE_PIE, PieChart);

},{"./charts/areaChart.js":4,"./charts/barChart.js":6,"./charts/columnChart.js":8,"./charts/comboChart.js":9,"./charts/lineChart.js":10,"./charts/pieChart.js":11,"./const.js":14,"./factories/chartFactory.js":15}],38:[function(require,module,exports){
'use strict';

var chartConst = require('./const.js'),
    themeFactory = require('./factories/themeFactory.js'),
    defaultTheme = require('./themes/defaultTheme.js');

themeFactory.register(chartConst.DEFAULT_THEME_NAME, defaultTheme);

},{"./const.js":14,"./factories/themeFactory.js":17,"./themes/defaultTheme.js":47}],39:[function(require,module,exports){
/**
 * @fileoverview Area chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series.js'),
    LineTypeSeriesBase = require('./lineTypeSeriesBase.js');

var AreaChartSeries = ne.util.defineClass(Series, /** @lends AreaChartSeries.prototype */ {
    /**
     * Area chart series component.
     * @constructs AreaChartSeries
     * @extends Series
     * @mixes LineTypeSeriesBase
     * @param {object} params parameters
     *      @param {object} params.model series model
     *      @param {object} params.options series options
     *      @param {object} params.theme series theme
     */
    init: function() {
        Series.apply(this, arguments);
    },

    /**
     * To make add data.
     * @returns {object} add data
     */
    makeAddData: function() {
        var dimension = this.bound.dimension,
            scaleDistance = this.getScaleDistanceFromZeroPoint(dimension.height, this.data.scale),
            zeroTop = scaleDistance.toMax;
        if (this.data.scale.min >= 0 && !zeroTop) {
            zeroTop = dimension.height;
        }

        return {
            groupPositions: this.makePositions(dimension),
            zeroTop: zeroTop
        };
    }
});

LineTypeSeriesBase.mixin(AreaChartSeries);

module.exports = AreaChartSeries;

},{"./lineTypeSeriesBase.js":43,"./series.js":45}],40:[function(require,module,exports){
/**
 * @fileoverview Bar chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series.js'),
    chartConst = require('../const.js'),
    dom = require('../helpers/domHandler.js'),
    renderUtil = require('../helpers/renderUtil.js');

var BarChartSeries = ne.util.defineClass(Series, /** @lends BarChartSeries.prototype */ {
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
     * @private
     */
    _makeBounds: function(dimension, hiddenWidth) {
        hiddenWidth = hiddenWidth || (renderUtil.isIE8() ? 0 : chartConst.HIDDEN_WIDTH);
        if (!this.options.stacked) {
            return this._makeNormalBarBounds(dimension, hiddenWidth);
        } else {
            return this._makeStackedBarBounds(dimension, hiddenWidth);
        }
    },

    /**
     * To make add data.
     * @returns {object} add data
     */
    makeAddData: function() {
        var groupBounds = this._makeBounds(this.bound.dimension);

        this.groupBounds = groupBounds;

        return {
            groupBounds: groupBounds
        };
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
            scaleDistance = this.getScaleDistanceFromZeroPoint(dimension.width, this.data.scale),
            bounds = ne.util.map(groupValues, function(values, groupIndex) {
                var paddingTop = (groupHeight * groupIndex) + (barHeight / 2) + hiddenWidth;
                return ne.util.map(values, function (value, index) {
                    var top = paddingTop + (barHeight * index),
                        startLeft = -chartConst.HIDDEN_WIDTH,
                        endLeft = startLeft,
                        barWidth = value * dimension.width;
                    if (value < 0) {
                        barWidth *= -1;
                        startLeft += scaleDistance.toMin;
                        endLeft += scaleDistance.toMin - barWidth;
                    } else {
                        startLeft += scaleDistance.toMin;
                        endLeft += scaleDistance.toMin;
                    }

                    return {
                        start: {
                            top: top,
                            left: startLeft,
                            width: 0,
                            height: barHeight
                        },
                        end: {
                            top: top,
                            left: endLeft,
                            width: barWidth,
                            height: barHeight
                        }
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
            bounds = ne.util.map(groupValues, function (values, groupIndex) {
                var paddingTop = (groupHeight * groupIndex) + (barHeight / 2) + hiddenWidth,
                    left = -chartConst.HIDDEN_WIDTH;
                return ne.util.map(values, function (value) {
                    var width, bound;
                    if (value < 0) {
                        return null;
                    }
                    width = value * dimension.width;
                    bound = {
                        start: {
                            top: paddingTop,
                            left: -chartConst.HIDDEN_WIDTH,
                            width: 0,
                            height: barHeight
                        },
                        end: {
                            top: paddingTop,
                            left: left,
                            width: width,
                            height: barHeight
                        }
                    };
                    left = left + width;
                    return bound;
                }, this);
            });
        return bounds;
    },

    /**
     * Render normal series label.
     * @param {object} params parameters
     *      @param {HTMLElement} params.container container
     *      @param {array.<array>} params.groupBounds group bounds
     *      @param {array.<array>} params.formattedValues formatted values
     * @returns {HTMLElement} series label area
     * @private
     */
    _renderNormalSeriesLabel: function(params) {
        var groupBounds = params.groupBounds,
            formattedValues = params.formattedValues,
            labelHeight = renderUtil.getRenderedLabelHeight(formattedValues[0][0], this.theme.label),
            elSeriesLabelArea = dom.create('div', 'ne-chart-series-label-area'),
            html;
        html = ne.util.map(params.values, function(values, groupIndex) {
            return ne.util.map(values, function(value, index) {
                var bound = groupBounds[groupIndex][index].end,
                    formattedValue = formattedValues[groupIndex][index],
                    labelWidth = renderUtil.getRenderedLabelWidth(formattedValue, this.theme.label),
                    left = bound.left,
                    labelHtml;

                if (value >= 0) {
                    left += bound.width + chartConst.SERIES_LABEL_PADDING;
                } else {
                    left -= labelWidth + chartConst.SERIES_LABEL_PADDING;
                }
                labelHtml = this._makeSeriesLabelHtml({
                    left: left,
                    top: bound.top + (bound.height - labelHeight + chartConst.TEXT_PADDING) / 2
                }, formattedValue, groupIndex, index);
                return labelHtml;
            }, this).join('');
        }, this).join('');

        elSeriesLabelArea.innerHTML = html;
        params.container.appendChild(elSeriesLabelArea);

        return elSeriesLabelArea;
    },


    /**
     * Render stacked series label.
     * @param {object} params parameters
     *      @param {HTMLElement} params.container container
     *      @param {array.<array>} params.groupBounds group bounds
     *      @param {array.<array>} params.formattedValues formatted values
     * @returns {HTMLElement} series label area
     * @private
     */
    _renderStackedSeriesLabel: function(params) {
        var groupBounds = params.groupBounds,
            formattedValues = params.formattedValues,
            formatFunctions = params.formatFunctions || [],
            elSeriesLabelArea = dom.create('div', 'ne-chart-series-label-area'),
            html;
        html = ne.util.map(params.values, function(values, groupIndex) {
            var total = 0,
                labelHeight = renderUtil.getRenderedLabelHeight(formattedValues[0][0], this.theme.label),
                labelHtmls, lastLeft, lastTop, fns;
            labelHtmls = ne.util.map(values, function(value, index) {
                var bound, formattedValue, labelWidth, left, top, labelHtml;

                if (value < 0) {
                    return '';
                }

                bound = groupBounds[groupIndex][index].end;
                formattedValue = formattedValues[groupIndex][index];
                labelWidth = renderUtil.getRenderedLabelWidth(formattedValue, this.theme.label);
                left = bound.left + (bound.width - labelWidth) / 2;
                top = bound.top + (bound.height - labelHeight + chartConst.TEXT_PADDING) / 2;
                labelHtml = this._makeSeriesLabelHtml({
                    left: left,
                    top: top
                }, formattedValue, groupIndex, index);
                lastLeft = bound.left + bound.width;
                lastTop = top;
                total += value;
                return labelHtml;
            }, this);

            if (this.options.stacked === 'normal') {
                fns = [total].concat(formatFunctions);
                total = ne.util.reduce(fns, function(stored, fn) {
                    return fn(stored);
                });
                labelHtmls.push(this._makeSeriesLabelHtml({
                    left: lastLeft + chartConst.SERIES_LABEL_PADDING,
                    top: lastTop
                }, total, -1, -1));
            }
            return labelHtmls.join('');
        }, this).join('');

        elSeriesLabelArea.innerHTML = html;
        params.container.appendChild(elSeriesLabelArea);

        return elSeriesLabelArea;
    },

    /**
     * Render series label.
     * @param {object} params parameters
     *      @param {HTMLElement} params.container container
     *      @param {array.<array>} params.groupBounds group bounds
     *      @param {array.<array>} params.formattedValues formatted values
     * @returns {HTMLElement} series label area
     * @private
     */
    _renderSeriesLabel: function(params) {
        var elSeriesLabelArea;

        if (!this.options.showLabel) {
            return null;
        }

        if (this.options.stacked) {
            elSeriesLabelArea = this._renderStackedSeriesLabel(params);
        } else {
            elSeriesLabelArea = this._renderNormalSeriesLabel(params);
        }
        return elSeriesLabelArea;
    },

    /**
     * Get bound.
     * @param {number} groupIndex group index
     * @param {number} index index
     * @returns {{left: number, top: number}} bound
     * @private
     */
    _getBound: function(groupIndex, index) {
        if (groupIndex === -1 || index === -1) {
            return null;
        }
        return this.groupBounds[groupIndex][index].end;
    }
});

module.exports = BarChartSeries;

},{"../const.js":14,"../helpers/domHandler.js":22,"../helpers/renderUtil.js":24,"./series.js":45}],41:[function(require,module,exports){
/**
 * @fileoverview Column chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series.js'),
    chartConst = require('../const.js'),
    dom = require('../helpers/domHandler.js'),
    renderUtil = require('../helpers/renderUtil.js');

var ColumnChartSeries = ne.util.defineClass(Series, /** @lends ColumnChartSeries.prototype */ {
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
     * @private
     */
    _makeBounds: function(dimension) {
        if (!this.options.stacked) {
            return this._makeNormalColumnBounds(dimension);
        } else {
            return this._makeStackedColumnBounds(dimension);
        }
    },

    /**
     * To make add data.
     * @returns {object} add data
     */
    makeAddData: function() {
        var gropuBounds = this._makeBounds(this.bound.dimension);

        this.groupBounds = gropuBounds;

        return {
            groupBounds: gropuBounds
        };
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
            isMinus = this.data.scale.min < 0 && this.data.scale.max <= 0,
            scaleDistance = this.getScaleDistanceFromZeroPoint(dimension.height, this.data.scale),
            bounds = ne.util.map(groupValues, function(values, groupIndex) {
                var paddingLeft = (groupWidth * groupIndex) + (barWidth / 2);
                return ne.util.map(values, function (value, index) {
                    var barHeight = value * dimension.height,
                        endTop = dimension.height - barHeight + chartConst.HIDDEN_WIDTH,
                        startTop = endTop + barHeight,
                        left = paddingLeft + (barWidth * index) - chartConst.HIDDEN_WIDTH;

                    if (isMinus) {
                        barHeight *= -1;
                        startTop = 0;
                        endTop = 0;
                    } else if (value < 0) {
                        barHeight *= -1;
                        startTop = endTop = dimension.height - scaleDistance.toMin;
                    } else {
                        startTop -= scaleDistance.toMin;
                        endTop -= scaleDistance.toMin;
                    }

                    return {
                        start: {
                            top: startTop,
                            left: left,
                            width: barWidth,
                            height: 0
                        },
                        end: {
                            top: endTop,
                            left: left,
                            width: barWidth,
                            height: barHeight
                        }
                    };
                }, this);
            }, this);
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
                    var height, bound;
                    if (value < 0) {
                        return null;
                    }
                    height = value * dimension.height;
                    bound = {
                        start: {
                            top: dimension.height,
                            left: paddingLeft,
                            width: barWidth,
                            height: 0
                        },
                        end: {
                            top: dimension.height - height - top,
                            left: paddingLeft,
                            width: barWidth,
                            height: height
                        }
                    };
                    top += height;
                    return bound;
                }, this);
            });
        return bounds;
    },

    /**
     * Render normal series label.
     * @param {object} params parameters
     *      @param {HTMLElement} params.container container
     *      @param {array.<array>} params.groupBounds group bounds
     *      @param {array.<array>} params.formattedValues formatted values
     * @returns {HTMLElement} series label area
     * @private
     */
    _renderNormalSeriesLabel: function(params) {
        var groupBounds = params.groupBounds,
            formattedValues = params.formattedValues,
            labelHeight = renderUtil.getRenderedLabelHeight(formattedValues[0][0], this.theme.label),
            elSeriesLabelArea = dom.create('div', 'ne-chart-series-label-area'),
            html;
        html = ne.util.map(params.values, function(values, groupIndex) {
            return ne.util.map(values, function(value, index) {
                var bound = groupBounds[groupIndex][index].end,
                    formattedValue = formattedValues[groupIndex][index],
                    labelWidth = renderUtil.getRenderedLabelWidth(formattedValue, this.theme.label),
                    top = bound.top,
                    labelHtml;

                if (value >= 0) {
                    top -= labelHeight + chartConst.SERIES_LABEL_PADDING;
                } else {
                    top += bound.height + chartConst.SERIES_LABEL_PADDING;
                }

                labelHtml = this._makeSeriesLabelHtml({
                    left: bound.left + (bound.width - labelWidth) / 2,
                    top: top
                }, formattedValue, groupIndex, index);
                return labelHtml;
            }, this).join('');
        }, this).join('');

        elSeriesLabelArea.innerHTML = html;
        params.container.appendChild(elSeriesLabelArea);

        return elSeriesLabelArea;
    },

    /**
     * To make sum label html.
     * @param {object} params parameters
     *      @param {array.<number>} params.values values
     *      @param {array.<function>} params.formatFunctions formatting functions
     *      @param {{left: number, top: number}} params.bound bound
     *      @param {number} params.labelHeight label height
     * @returns {string} sum label html
     * @private
     */
    _makeSumLabelHtml: function(params) {
        var sum = ne.util.sum(params.values),
            fns = [sum].concat(params.formatFunctions),
            bound = params.bound,
            left = bound.left + (bound.width / 2),
            totalLabelWidth;

        sum = ne.util.reduce(fns, function(stored, fn) {
            return fn(stored);
        });

        totalLabelWidth = renderUtil.getRenderedLabelWidth(sum, this.theme.label);

        return this._makeSeriesLabelHtml({
            left: left - (totalLabelWidth - chartConst.TEXT_PADDING) / 2,
            top: bound.top - params.labelHeight - chartConst.SERIES_LABEL_PADDING
        }, sum, -1, -1);
    },

    /**
     * To make stacked labels html.
     * @param {object} params parameters
     *      @param {number} params.groupIndex group index
     *      @param {array.<number>} params.values values,
     *      @param {array.<function>} params.formatFunctions formatting functions,
     *      @param {array.<object>} params.bounds bounds,
     *      @param {array} params.formattedValues formatted values,
     *      @param {number} params.labelHeight label height
     * @returns {string} labels html
     * @private
     */
    _makeStackedLabelsHtml: function(params) {
        var values = params.values,
            bound, htmls;

        htmls = ne.util.map(params.values, function(value, index) {
            var labelWidth, left, top, labelHtml, formattedValue;

            if (value < 0) {
                return '';
            }

            bound = params.bounds[index].end;
            formattedValue = params.formattedValues[index];
            labelWidth = renderUtil.getRenderedLabelWidth(formattedValue, this.theme.label);
            left = bound.left + ((bound.width - labelWidth + chartConst.TEXT_PADDING) / 2);
            top = bound.top + ((bound.height - params.labelHeight + chartConst.TEXT_PADDING) / 2);
            labelHtml = this._makeSeriesLabelHtml({
                left: left,
                top: top
            }, formattedValue, params.groupIndex, index);
            return labelHtml;
        }, this);

        if (this.options.stacked === 'normal') {
            htmls.push(this._makeSumLabelHtml({
                values: values,
                formatFunctions: params.formatFunctions,
                bound: bound,
                labelHeight: params.labelHeight
            }));
        }
        return htmls.join('');
    },

    /**
     * Render stacked series label.
     * @param {object} params parameters
     *      @param {HTMLElement} params.container container
     *      @param {array.<array>} params.groupBounds group bounds
     *      @param {array.<array>} params.formattedValues formatted values
     * @returns {HTMLElement} series label area
     * @private
     */
    _renderStackedSeriesLabel: function(params) {
        var groupBounds = params.groupBounds,
            formattedValues = params.formattedValues,
            formatFunctions = params.formatFunctions || [],
            elSeriesLabelArea = dom.create('div', 'ne-chart-series-label-area'),
            labelHeight = renderUtil.getRenderedLabelHeight(formattedValues[0][0], this.theme.label),
            html;

        html = ne.util.map(params.values, function(values, index) {
            var labelsHtml = this._makeStackedLabelsHtml({
                    groupIndex: index,
                    values: values,
                    formatFunctions: formatFunctions,
                    bounds: groupBounds[index],
                    formattedValues: formattedValues[index],
                    labelHeight: labelHeight
                });
            return labelsHtml;
        }, this).join('');

        elSeriesLabelArea.innerHTML = html;
        params.container.appendChild(elSeriesLabelArea);

        return elSeriesLabelArea;
    },

    /**
     * Render series label.
     * @param {object} params parameters
     *      @param {HTMLElement} params.container container
     *      @param {array.<array>} params.groupBounds group bounds
     *      @param {array.<array>} params.formattedValues formatted values
     * @returns {HTMLElement} series label area
     * @private
     */
    _renderSeriesLabel: function(params) {
        var elSeriesLabelArea;
        if (!this.options.showLabel) {
            return null;
        }

        if (this.options.stacked) {
            elSeriesLabelArea = this._renderStackedSeriesLabel(params);
        } else {
            elSeriesLabelArea = this._renderNormalSeriesLabel(params);
        }
        return elSeriesLabelArea;
    },

    /**
     * Get bound.
     * @param {number} groupIndex group index
     * @param {number} index index
     * @returns {{left: number, top: number}} bound
     * @private
     */
    _getBound: function(groupIndex, index) {
        if (groupIndex === -1 || index === -1) {
            return null;
        }
        return this.groupBounds[groupIndex][index].end;
    }
});

module.exports = ColumnChartSeries;

},{"../const.js":14,"../helpers/domHandler.js":22,"../helpers/renderUtil.js":24,"./series.js":45}],42:[function(require,module,exports){
/**
 * @fileoverview Line chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series.js'),
    LineTypeSeriesBase = require('./lineTypeSeriesBase.js');

var LineChartSeries = ne.util.defineClass(Series, /** @lends LineChartSeries.prototype */ {
    /**
     * Line chart series component.
     * @constructs LineChartSeries
     * @extends Series
     * @mixes LineTypeSeriesBase
     * @param {object} params parameters
     *      @param {object} params.model series model
     *      @param {object} params.options series options
     *      @param {object} params.theme series theme
     */
    init: function() {
        Series.apply(this, arguments);
    },

    /**
     * To make add data.
     * @returns {object} add data
     */
    makeAddData: function() {
        return {
            groupPositions: this.makePositions(this.bound.dimension)
        };
    }
});

LineTypeSeriesBase.mixin(LineChartSeries);

module.exports = LineChartSeries;

},{"./lineTypeSeriesBase.js":43,"./series.js":45}],43:[function(require,module,exports){
/**
 * @fileoverview LineTypeSeriesBase is base class for line type series.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series.js'),
    chartConst = require('../const.js'),
    dom = require('../helpers/domHandler.js'),
    renderUtil = require('../helpers/renderUtil.js');
/**
 * @classdesc LineTypeSeriesBase is base class for line type series.
 * @class LineTypeSeriesBase
 * @mixin
 */
var LineTypeSeriesBase = ne.util.defineClass(Series, /** @lends LineTypeSeriesBase.prototype */ {
    /**
     * To make positions of line chart.
     * @param {{width: number, height:nunber}} dimension line chart dimension
     * @returns {array.<array.<object>>} positions
     */
    makePositions: function(dimension) {
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
        this.groupPositions = result;
        return result;
    },

    /**
     * Render series label.
     * @param {object} params parameters
     *      @param {HTMLElement} params.container container
     *      @param {array.<array>} params.groupPositions group positions
     *      @param {array.<array>} params.formattedValues formatted values
     * @return {HTMLElement} series area element
     * @private
     */
    _renderSeriesLabel: function(params) {
        var groupPositions, labelHeight, elSeriesLabelArea, html;

        if (!this.options.showLabel) {
            return null;
        }

        groupPositions = params.groupPositions;
        labelHeight = renderUtil.getRenderedLabelHeight(params.formattedValues[0][0], this.theme.label);
        elSeriesLabelArea = dom.create('div', 'ne-chart-series-label-area');

        html = ne.util.map(params.formattedValues, function(values, groupIndex) {
            return ne.util.map(values, function(value, index) {
                var position = groupPositions[groupIndex][index],
                    labelWidth = renderUtil.getRenderedLabelWidth(value, this.theme.label),
                    labelHtml = this._makeSeriesLabelHtml({
                        left: position.left - (labelWidth / 2),
                        top: position.top - labelHeight - chartConst.SERIES_LABEL_PADDING
                    }, value, index, groupIndex);
                return labelHtml;
            }, this).join('');
        }, this).join('');

        elSeriesLabelArea.innerHTML = html;
        params.container.appendChild(elSeriesLabelArea);

        return elSeriesLabelArea;
    },

    /**
     * Get bound.
     * @param {number} groupIndex group index
     * @param {number} index index
     * @returns {{left: number, top: number}} bound
     * @private
     */
    _getBound: function(groupIndex, index) {
        return this.groupPositions[index][groupIndex];
    }
});

LineTypeSeriesBase.mixin = function(func) {
    ne.util.extend(func.prototype, LineTypeSeriesBase.prototype);
};

module.exports = LineTypeSeriesBase;

},{"../const.js":14,"../helpers/domHandler.js":22,"../helpers/renderUtil.js":24,"./series.js":45}],44:[function(require,module,exports){
/**
 * @fileoverview Pie chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series'),
    chartConst = require('../const'),
    dom = require('../helpers/domHandler'),
    renderUtil = require('../helpers/renderUtil');

var PieChartSeries = ne.util.defineClass(Series, /** @lends PieChartSeries.prototype */ {
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
     * To make sectors information.
     * @param {array.<number>} percentValues percent values
     * @param {{cx: number, cy: number, r: number}} circleBound circle bound
     * @returns {array.<object>} sectors information
     * @private
     */
    _makeSectorsInfo: function(percentValues, circleBound) {
        var cx = circleBound.cx,
            cy = circleBound.cy,
            r = circleBound.r,
            angle = 0,
            delta = 10,
            paths;

        paths = ne.util.map(percentValues, function(percentValue) {
            var addAngle = chartConst.ANGLE_360 * percentValue,
                endAngle = angle + addAngle,
                popupAngle = angle + (addAngle / 2),
                angles = {
                    start: {
                        startAngle: angle,
                        endAngle: angle
                    },
                    end: {
                        startAngle: angle,
                        endAngle: endAngle
                    }
                },
                positionData = {
                    cx: cx,
                    cy: cy,
                    angle: popupAngle
                };
            angle = endAngle;
            return {
                percentValue: percentValue,
                angles: angles,
                popupPosition: this._getArcPosition(ne.util.extend({
                    r: r + delta
                }, positionData)),
                centerPosition: this._getArcPosition(ne.util.extend({
                    r: (r / 2) + delta
                }, positionData)),
                outerPosition: {
                    start: this._getArcPosition(ne.util.extend({
                        r: r
                    }, positionData)),
                    middle: this._getArcPosition(ne.util.extend({
                        r: r + delta
                    }, positionData))
                }
            };
        }, this);

        return paths;
    },

    /**
     * To make add data.
     * @returns {{
     *      formattedValues: array,
     *      chartBackground: string,
     *      circleBound: ({cx: number, cy: number, r: number}),
     *      sectorsInfo: array.<object>
     * }} add data for graph rendering
     */
    makeAddData: function() {
        var circleBound = this._makeCircleBound(this.bound.dimension, {
                showLabel: this.options.showLabel,
                legendType: this.options.legendType
            }),
            sectorsInfo = this._makeSectorsInfo(this.percentValues[0], circleBound);

        this.popupPositions = ne.util.pluck(sectorsInfo, 'popupPosition');
        return {
            chartBackground: this.chartBackground,
            circleBound: circleBound,
            sectorsInfo: sectorsInfo
        };
    },

    /**
     * To make circle bound
     * @param {{width: number, height:number}} dimension chart dimension
     * @param {{showLabel: boolean, legendType: string}} options options
     * @returns {{cx: number, cy: number, r: number}} circle bounds
     * @private
     */
    _makeCircleBound: function(dimension, options) {
        var width = dimension.width,
            height = dimension.height,
            isSmallPie = options.legendType === chartConst.SERIES_LEGEND_TYPE_OUTER && options.showLabel,
            radiusRate = isSmallPie ? chartConst.PIE_GRAPH_SMALL_RATE : chartConst.PIE_GRAPH_DEFAULT_RATE,
            diameter = ne.util.multiplication(ne.util.min([width, height]), radiusRate);
        return {
            cx: ne.util.division(width, 2),
            cy: ne.util.division(height, 2),
            r: ne.util.division(diameter, 2)
        };
    },

    /**
     * Get arc position.
     * @param {object} params parameters
     *      @param {number} params.cx center x
     *      @param {number} params.cy center y
     *      @param {number} params.r radius
     *      @param {number} params.angle angle(degree)
     * @returns {{left: number, top: number}} arc position
     * @private
     */
    _getArcPosition: function(params) {
        return {
            left: params.cx + (params.r * Math.sin(params.angle * chartConst.RAD)),
            top: params.cy - (params.r * Math.cos(params.angle * chartConst.RAD))
        };
    },


    /**
     * To make add data for series label.
     * @param {HTMLElement} container container
     * @returns {{
     *      container: HTMLElement,
     *      legendLabels: array.<string>,
     *      options: {legendType: string, showLabel: boolean},
     *      chartWidth: number,
     *      formattedValues: array
     * }} add data for make series label
     * @private
     */
    _makeAddDataForSeriesLabel: function(container) {
        return {
            container: container,
            legendLabels: this.data.legendLabels,
            options: {
                legendType: this.options.legendType,
                showLabel: this.options.showLabel
            },
            chartWidth: this.data.chartWidth,
            formattedValues: this.data.formattedValues[0]
        };
    },

    /**
     * Get series label.
     * @param {object} params parameters
     *      @param {string} params.legend legend
     *      @param {string} params.label label
     *      @param {string} params.separator separator
     *      @param {{legendType: boolean, showLabel: boolean}} params.options options
     * @returns {string} series label
     * @private
     */
    _getSeriesLabel: function(params) {
        var seriesLabel = '';
        if (params.options.legendType) {
            seriesLabel = params.legend;
        }

        if (params.options.showLabel) {
            seriesLabel += (seriesLabel ? params.separator : '') + params.label;
        }

        return seriesLabel;
    },

    /**
     * Render center legend.
     * @param {object} params parameters
     *      @param {HTMLElement} container container
     *      @param {array.<string>} legends legends
     *      @param {array.<object>} centerPositions center positions
     * @return {HTMLElement} series area element
     * @private
     */
    _renderLegendLabel: function(params) {
        var positions = params.positions,
            formattedValues = params.formattedValues,
            elSeriesLabelArea = dom.create('div', 'ne-chart-series-label-area'),
            html;

        html = ne.util.map(params.legendLabels, function(legend, index) {
            var label = this._getSeriesLabel({
                    legend: legend,
                    label: formattedValues[index],
                    separator: params.separator,
                    options: params.options
                }),
                position = params.moveToPosition(positions[index], label);
            return this._makeSeriesLabelHtml(position, label, 0, index);
        }, this).join('');

        elSeriesLabelArea.innerHTML = html;
        params.container.appendChild(elSeriesLabelArea);

        return elSeriesLabelArea;
    },

    /**
     * Move to center position.
     * @param {{left: number, top: number}} position position
     * @param {string} label label
     * @returns {{left: number, top: number}} center position
     * @private
     */
    _moveToCenterPosition: function(position, label) {
        var left = position.left - (renderUtil.getRenderedLabelWidth(label, this.theme.label) / 2),
            top = position.top - (renderUtil.getRenderedLabelHeight(label, this.theme.label) / 2);
        return {
            left: left,
            top: top
        };
    },

    /**
     * Render center legend.
     * @param {object} params parameters
     *      @param {HTMLElement} container container
     *      @param {array.<string>} legends legends
     *      @param {array.<object>} centerPositions center positions
     * @return {HTMLElement} area element
     * @private
     */
    _renderCenterLegend: function(params) {
        var elArea = this._renderLegendLabel(ne.util.extend({
            positions: ne.util.pluck(params.sectorsInfo, 'centerPosition'),
            moveToPosition: ne.util.bind(this._moveToCenterPosition, this),
            separator: '<br>'
        }, params));

        return elArea;
    },

    /**
     * Add end position.
     * @param {number} centerLeft center left
     * @param {array.<object>} positions positions
     * @private
     */
    _addEndPosition: function(centerLeft, positions) {
        ne.util.forEach(positions, function(position) {
            var end = ne.util.extend({}, position.middle);
            if (end.left < centerLeft) {
                end.left -= chartConst.SERIES_OUTER_LABEL_PADDING;
            } else {
                end.left += chartConst.SERIES_OUTER_LABEL_PADDING;
            }
            position.end = end;
        });
    },

    /**
     * Move to outer position.
     * @param {number} centerLeft center left
     * @param {object} position position
     * @param {string} label label
     * @returns {{left: number, top: number}} outer position
     * @private
     */
    _moveToOuterPosition: function(centerLeft, position, label) {
        var positionEnd = position.end,
            left = positionEnd.left,
            top = positionEnd.top - (renderUtil.getRenderedLabelHeight(label, this.theme.label) / 2);

        if (left < centerLeft) {
            left -= renderUtil.getRenderedLabelWidth(label, this.theme.label) + chartConst.SERIES_LABEL_PADDING;
        } else {
            left += chartConst.SERIES_LABEL_PADDING;
        }

        return {
            left: left,
            top: top
        };
    },

    /**
     * Render outer legend.
     * @param {object} params parameters
     *      @param {HTMLElement} container container
     *      @param {array.<string>} legends legends
     *      @param {array.<object>} centerPositions center positions
     * @return {HTMLElement} area element
     * @private
     */
    _renderOuterLegend: function(params) {
        var outerPositions = ne.util.pluck(params.sectorsInfo, 'outerPosition'),
            centerLeft = params.chartWidth / 2,
            elArea;

        this._addEndPosition(centerLeft, outerPositions);
        elArea = this._renderLegendLabel(ne.util.extend({
            positions: outerPositions,
            moveToPosition: ne.util.bind(this._moveToOuterPosition, this, centerLeft),
            separator: ':&nbsp;'
        }, params));

        if (this.paper) {
            this.graphRenderer.renderLegendLines(this.paper, outerPositions);
        }

        return elArea;
    },

    /**
     * Render series label.
     * @param {object} params parameters
     * @returns {HTMLElement} area element
     * @private
     */
    _renderSeriesLabel: function(params) {
        var elArea;
        if (params.options.legendType === chartConst.SERIES_LEGEND_TYPE_OUTER) {
            elArea = this._renderOuterLegend(params);
        } else {
            elArea = this._renderCenterLegend(params);
        }
        return elArea;
    },

    /**
     * Get bound.
     * @param {number} groupIndex group index
     * @param {number} index index
     * @returns {{left: number, top: number}} bound
     * @private
     */
    _getBound: function(groupIndex, index) {
        if (groupIndex === -1 || index === -1) {
            return null;
        }
        return this.popupPositions[index];
    },

    /**
     * Show series label area.
     */
    showSeriesLabelArea: function() {
        this.graphRenderer.animateLegendLines();
        Series.prototype.showSeriesLabelArea.call(this);
    }
});

module.exports = PieChartSeries;

},{"../const":14,"../helpers/domHandler":22,"../helpers/renderUtil":24,"./series":45}],45:[function(require,module,exports){
/**
 * @fileoverview Series base component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var seriesTemplate = require('./seriesTemplate.js'),
    chartConst = require('../const.js'),
    dom = require('../helpers/domHandler.js'),
    renderUtil = require('../helpers/renderUtil.js'),
    event = require('../helpers/eventListener.js'),
    pluginFactory = require('../factories/pluginFactory.js');

var HIDDEN_WIDTH = 1,
    SERIES_LABEL_CLASS_NAME = 'ne-chart-series-label';

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
     * @param {object} params parameters
     *      @param {string} params.prefix tooltip id prefix
     *      @param {boolean} params.allowNegativeTooltip whether allow negative tooltip or not
     * @param {{top:number, left: number, width: number, height: number}} bound graph bound information
     * @param {string} id tooltip id
     */
    showTooltip: function(params, bound, id) {
        this.fire('showTooltip', ne.util.extend({
            id: params.prefix + id,
            bound: bound
        }, params));
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
            dimension = bound.dimension,
            inCallback = ne.util.bind(this.showTooltip, this, {
                prefix: tooltipPrefix,
                allowNegativeTooltip: !!this.allowNegativeTooltip,
                chartType: this.chartType
            }),
            outCallback = ne.util.bind(this.hideTooltip, this, tooltipPrefix),
            data = {
                dimension: dimension,
                theme: this.theme,
                options: this.options
            },
            addData = this.makeAddData(),
            addDataForSeriesLabel;

        if (!paper) {
            renderUtil.renderDimension(el, dimension);
        }

        this._renderPosition(el, bound.position, this.chartType);

        data = ne.util.extend(data, addData);

        this.paper = this.graphRenderer.render(paper, el, data, inCallback, outCallback);

        if (this._renderSeriesLabel) {
            addDataForSeriesLabel = this._makeAddDataForSeriesLabel(el, dimension);
            this.elSeriesLabelArea = this._renderSeriesLabel(ne.util.extend(addDataForSeriesLabel, addData));
        }

        this.attachEvent(el);

        // series label mouse event 동작 시 사용
        this.inCallback = inCallback;
        this.outCallback = outCallback;

        return el;
    },

    /**
     * To make add data.
     * @returns {object} add data
     */
    makeAddData: function() {
        return {};
    },

    /**
     * To make add data for series label.
     * @param {HTMLElement} container container
     * @param {{width: number, height: number}}dimension
     * @returns {{
     *      container: HTMLElement,
     *      values: array.<array>,
     *      formattedValues: array.<array>,
     *      formatFunctions: array.<function>,
     *      dimension: {width: number, height: number}
     * }} add data for series label
     * @private
     */
    _makeAddDataForSeriesLabel: function(container, dimension) {
        return {
            container: container,
            values: this.data.values,
            formattedValues: this.data.formattedValues,
            formatFunctions: this.data.formatFunctions,
            dimension: dimension
        };
    },

    /**
     * Render bounds
     * @param {HTMLElement} el series element
     * @param {{width: number, height: number}} dimension series dimension
     * @param {{top: number, left: number}} position series position
     * @param {string} chartType chart type
     * @private
     */
    _renderPosition: function(el, position, chartType) {
        var hiddenWidth = renderUtil.isIE8() ? 0 : HIDDEN_WIDTH;
        position.top = position.top - HIDDEN_WIDTH;
        position.left = position.left + (chartType === chartConst.CHART_TYPE_BAR ? hiddenWidth : HIDDEN_WIDTH * 2);
        renderUtil.renderPosition(el, position);
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
     * Whether line type chart or not.
     * @param {string} chartType chart type
     * @returns {boolean} result boolean
     * @private
     */
    _isLineTypeChart: function(chartType) {
        return chartType === chartConst.CHART_TYPE_LINE || chartType === chartConst.CHART_TYPE_AREA;
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
            isLineTypeChart = this._isLineTypeChart(this.chartType),
            flag = 1,
            subValue = 0,
            percentValues;

        if (!isLineTypeChart && min < 0 && max <= 0) {
            flag = -1;
            subValue = max;
            distance = min - max;
        } else if (isLineTypeChart || min >= 0) {
            subValue = min;
        }

        percentValues = ne.util.map(data.values, function(values) {
            return ne.util.map(values, function(value) {
                return (value - subValue) * flag / distance;
            });
        });
        return percentValues;
    },

    /**
     * Get scale distance from zero point.
     * @param {number} size chart size (width or height)
     * @param {{min: number, max: number}} scale scale
     * @returns {{toMax: number, toMin: number}} pixel distance
     */
    getScaleDistanceFromZeroPoint: function(size, scale) {
        var min = scale.min,
            max = scale.max,
            distance = max - min,
            toMax = 0,
            toMin = 0;

        if (min < 0 && max > 0) {
            toMax = (distance + min) / distance * size;
            toMin = (distance - max) / distance * size;
        }

        return {
            toMax: toMax,
            toMin: toMin
        };
    },

    /**
     * On mouseover event handler for series area
     * @param {MouseEvent} e mouse event
     */
    onMouseover: function(e) {
        var elTarget = e.target || e.srcElement,
            groupIndex, index;

        if (elTarget.className !== SERIES_LABEL_CLASS_NAME) {
            return;
        }

        groupIndex = elTarget.getAttribute('data-group-index');
        index = elTarget.getAttribute('data-index');
        if (groupIndex === '-1' || index === '-1') {
            return;
        }
        this.inCallback(this._getBound(groupIndex, index), groupIndex + '-' + index);
    },

    /**
     * On mouseout event handler for series area
     * @param {MouseEvent} e mouse event
     */
    onMouseout: function(e) {
        var elTarget = e.target || e.srcElement,
            groupIndex, index;

        if (elTarget.className !== SERIES_LABEL_CLASS_NAME) {
            return;
        }

        groupIndex = elTarget.getAttribute('data-group-index');
        index = elTarget.getAttribute('data-index');

        if (groupIndex === '-1' || index === '-1') {
            return;
        }

        this.outCallback(groupIndex + '-' + index);
    },

    /**
     * Attach event
     * @param {HTMLElement} el target element
     */
    attachEvent: function(el) {
        event.bindEvent('mouseover', el, ne.util.bind(this.onMouseover, this));
        event.bindEvent('mouseout', el, ne.util.bind(this.onMouseout, this));
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
    },

    /**
     * Animate component
     */
    animateComponent: function() {
        if (this.graphRenderer.animate) {
            this.graphRenderer.animate(ne.util.bind(this.showSeriesLabelArea, this));
        }
    },

    /**
     * To make html about series label
     * @param {{left: number, top: number}} position position
     * @param {string} value value
     * @param {number} groupIndex group index
     * @param {number} index index
     * @returns {string} html string
     * @private
     */
    _makeSeriesLabelHtml: function(position, value, groupIndex, index) {
        var cssObj = ne.util.extend(position, this.theme.label);
        return seriesTemplate.tplSeriesLabel({
            cssText: seriesTemplate.tplCssText(cssObj),
            value: value,
            groupIndex: groupIndex,
            index: index
        });
    },

    /**
     * Show series label area.
     */
    showSeriesLabelArea: function() {
        if ((!this.options.showLabel && !this.options.legendType) || !this.elSeriesLabelArea) {
            return;
        }

        dom.addClass(this.elSeriesLabelArea, 'show');

        (new ne.component.Effects.Fade({
            element: this.elSeriesLabelArea,
            duration: 300
        })).action({
            start: 0,
            end: 1,
            complete: function() {}
        });
    }
});

ne.util.CustomEvents.mixin(Series);

module.exports = Series;

},{"../const.js":14,"../factories/pluginFactory.js":16,"../helpers/domHandler.js":22,"../helpers/eventListener.js":23,"../helpers/renderUtil.js":24,"./seriesTemplate.js":46}],46:[function(require,module,exports){
/**
 * @fileoverview This is templates of series.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

var templateMaker = require('../helpers/templateMaker.js');

var tags = {
    HTML_SERIES_LABEL: '<div class="ne-chart-series-label" style="{{ cssText }}" data-group-index="{{ groupIndex }}" data-index="{{ index }}">{{ value }}</div>',
    TEXT_CSS_TEXT: 'left:{{ left }}px;top:{{ top }}px;font-family:{{ fontFamily }};font-size:{{ fontSize }}px'
};

module.exports = {
    tplSeriesLabel: templateMaker.template(tags.HTML_SERIES_LABEL),
    tplCssText: templateMaker.template(tags.TEXT_CSS_TEXT)
};

},{"../helpers/templateMaker.js":25}],47:[function(require,module,exports){
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
        label: {
            fontSize: 11,
            fontFamily: EMPTY_FONT,
            color: DEFAULT_COLOR
        },
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

},{}],48:[function(require,module,exports){
/**
 * @fileoverview Tooltip component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const.js'),
    dom = require('../helpers/domHandler.js'),
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
            tplOuter = tooltipTemplate.tplTooltip,
            tplTooltip = optionTemplate ? templateMaker.template(optionTemplate) : tooltipTemplate.tplDefaultTemplate,
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
     * Calculate tooltip position about not bar chart.
     * @param {object} params parameters
     *      @param {{bound: object}} params.data graph information
     *      @param {{width: number, height: number}} params.dimension tooltip dimension
     *      @param {string} params.positionOption position option (ex: 'left top')
     * @returns {{top: number, left: number}} position
     * @private
     */
    _calculateTooltipPositionAboutNotBarChart: function(params) {
        var bound = params.bound,
            addPosition = params.addPosition,
            minusWidth = params.dimension.width - (bound.width || 0),
            lineGap = bound.width ? 0 : TOOLTIP_GAP,
            positionOption = params.positionOption || '',
            tooltipHeight = params.dimension.height,
            result = {};
        result.left = bound.left + (HIDDEN_WIDTH * 2) + addPosition.left;
        result.top = bound.top - tooltipHeight + addPosition.top;

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
     * Calculate tooltip position about bar chart.
     * @param {object} params parameters
     *      @param {{bound: object}} params.data graph information
     *      @param {{width: number, height: number}} params.dimension tooltip dimension
     *      @param {string} params.positionOption position option (ex: 'left top')
     * @returns {{top: number, left: number}} position
     * @private
     */
    _calculateTooltipPositionAboutBarChart: function(params) {
        var bound = params.bound,
            addPosition = params.addPosition,
            minusHeight = params.dimension.height - (bound.height || 0),
            positionOption = params.positionOption || '',
            tooltipWidth = params.dimension.width,
            result = {};

        result.left = bound.left + bound.width + addPosition.left;
        result.top = bound.top + addPosition.top;

        // TODO : positionOptions을 객체로 만들어서 검사하도록 변경하기 ex) positionOption.left = true
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
     *      @param {{left: number, top: number, width: number, height: number}} params.bound graph bound
     *      @param {string} params.chartType chart type
     *      @param {boolean} params.allowNegativeTooltip whether allow negative tooltip or not
     *      @param {{width: number, height: number}} params.dimension tooltip dimension
     *      @param {string} params.positionOption position option (ex: 'left top')
     * @returns {{top: number, left: number}} position
     * @private
     */
    _calculateTooltipPosition: function(params) {
        var result = {},
            sizeType, positionType, addPadding;
        if (params.chartType === chartConst.CHART_TYPE_BAR) {
            result = this._calculateTooltipPositionAboutBarChart(params);
            sizeType = 'width';
            positionType = 'left';
            addPadding = 1;
        } else {
            result = this._calculateTooltipPositionAboutNotBarChart(params);
            sizeType = 'height';
            positionType = 'top';
            addPadding = -1;
        }

        if (params.allowNegativeTooltip) {
            result = this._moveToSymmetry(result, {
                bound: params.bound,
                id: params.id,
                dimension: params.dimension,
                sizeType: sizeType,
                positionType: positionType,
                addPadding: addPadding
            });
        }
        return result;
    },

    /**
     * Get value by id.
     * @param {string} id tooltip id
     * @returns {number} result value
     * @private
     */
    _getValueById: function(id) {
        var indexes = this._getIndexFromId(id),
            value = this.values[indexes[0]][indexes[1]];
        return value;
    },

    /**
     * Move to symmetry.
     * @param {{left: number, top: number}} position tooltip position
     * @param {object} params parameters
     *      @param {{left: number, top: number, width: number, height: number}} params.bound graph bound
     *      @param {string} params.id tooltip id
     *      @param {{width: number, height: number}} params.dimension tooltip dimension
     *      @param {string} params.sizeType size type (width or height)
     *      @param {string} params.positionType position type (left or top)
     *      @param {number} params.addPadding add padding
     * @returns {{left: number, top: number}} moved position
     * @private
     */
    _moveToSymmetry: function(position, params) {
        var bound = params.bound,
            sizeType = params.sizeType,
            positionType = params.positionType,
            value = this._getValueById(params.id),
            center;

        if (value < 0) {
            center = bound[positionType] + (bound[sizeType] / 2) + (params.addPadding || 0);
            position[positionType] = position[positionType] - (position[positionType] - center) * 2 - params.dimension[sizeType];
        }

        return position;
    },

    /**
     * onShow is callback of custom event showTooltip for SeriesView.
     * @param {{id: string, bound: object}} params tooltip data
     */
    onShow: function(params) {
        var elTooltip = document.getElementById(params.id),
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

        this.showedId = params.id;
        dom.addClass(elTooltip, 'show');

        position = this._calculateTooltipPosition(ne.util.extend({
            dimension: {
                width: elTooltip.offsetWidth,
                height: elTooltip.offsetHeight
            },
            addPosition: addPosition,
            positionOption: positionOption || ''
        }, params));

        elTooltip.style.cssText = [
            renderUtil.concatStr('left:', position.left, 'px'),
            renderUtil.concatStr('top:', position.top, 'px')
        ].join(';');

        this._fireShowAnimation(params.id);
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

},{"../const.js":14,"../helpers/domHandler.js":22,"../helpers/eventListener.js":23,"../helpers/renderUtil.js":24,"../helpers/templateMaker.js":25,"./tooltipTemplate.js":49}],49:[function(require,module,exports){
/**
 * @fileoverview This is templates of tooltip.
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
    tplTooltip: templateMaker.template(tags.HTML_TOOLTIP),
    tplDefaultTemplate: templateMaker.template(tags.HTML_DEFAULT_TEMPLATE)
};

},{"../helpers/templateMaker.js":25}]},{},[3,30])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXhlcy9heGlzLmpzIiwic3JjL2pzL2F4ZXMvYXhpc1RlbXBsYXRlLmpzIiwic3JjL2pzL2NoYXJ0LmpzIiwic3JjL2pzL2NoYXJ0cy9hcmVhQ2hhcnQuanMiLCJzcmMvanMvY2hhcnRzL2F4aXNUeXBlQmFzZS5qcyIsInNyYy9qcy9jaGFydHMvYmFyQ2hhcnQuanMiLCJzcmMvanMvY2hhcnRzL2NoYXJ0QmFzZS5qcyIsInNyYy9qcy9jaGFydHMvY29sdW1uQ2hhcnQuanMiLCJzcmMvanMvY2hhcnRzL2NvbWJvQ2hhcnQuanMiLCJzcmMvanMvY2hhcnRzL2xpbmVDaGFydC5qcyIsInNyYy9qcy9jaGFydHMvcGllQ2hhcnQuanMiLCJzcmMvanMvY2hhcnRzL3ZlcnRpY2FsVHlwZUJhc2UuanMiLCJzcmMvanMvY29kZS1zbmlwcGV0LXV0aWwuanMiLCJzcmMvanMvY29uc3QuanMiLCJzcmMvanMvZmFjdG9yaWVzL2NoYXJ0RmFjdG9yeS5qcyIsInNyYy9qcy9mYWN0b3JpZXMvcGx1Z2luRmFjdG9yeS5qcyIsInNyYy9qcy9mYWN0b3JpZXMvdGhlbWVGYWN0b3J5LmpzIiwic3JjL2pzL2hlbHBlcnMvYXhpc0RhdGFNYWtlci5qcyIsInNyYy9qcy9oZWxwZXJzL2JvdW5kc01ha2VyLmpzIiwic3JjL2pzL2hlbHBlcnMvY2FsY3VsYXRvci5qcyIsInNyYy9qcy9oZWxwZXJzL2RhdGFDb252ZXJ0ZXIuanMiLCJzcmMvanMvaGVscGVycy9kb21IYW5kbGVyLmpzIiwic3JjL2pzL2hlbHBlcnMvZXZlbnRMaXN0ZW5lci5qcyIsInNyYy9qcy9oZWxwZXJzL3JlbmRlclV0aWwuanMiLCJzcmMvanMvaGVscGVycy90ZW1wbGF0ZU1ha2VyLmpzIiwic3JjL2pzL2xlZ2VuZHMvbGVnZW5kLmpzIiwic3JjL2pzL2xlZ2VuZHMvbGVnZW5kVGVtcGxhdGUuanMiLCJzcmMvanMvcGxvdHMvcGxvdC5qcyIsInNyYy9qcy9wbG90cy9wbG90VGVtcGxhdGUuanMiLCJzcmMvanMvcGx1Z2lucy9wbHVnaW5SYXBoYWVsLmpzIiwic3JjL2pzL3BsdWdpbnMvcmFwaGFlbEFyZWFDaGFydC5qcyIsInNyYy9qcy9wbHVnaW5zL3JhcGhhZWxCYXJDaGFydC5qcyIsInNyYy9qcy9wbHVnaW5zL3JhcGhhZWxMaW5lQ2hhcnQuanMiLCJzcmMvanMvcGx1Z2lucy9yYXBoYWVsTGluZVR5cGVCYXNlLmpzIiwic3JjL2pzL3BsdWdpbnMvcmFwaGFlbFBpZUNoYXJ0LmpzIiwic3JjL2pzL3BsdWdpbnMvcmFwaGFlbFJlbmRlclV0aWwuanMiLCJzcmMvanMvcmVnaXN0ZXJDaGFydHMuanMiLCJzcmMvanMvcmVnaXN0ZXJUaGVtZXMuanMiLCJzcmMvanMvc2VyaWVzL2FyZWFDaGFydFNlcmllcy5qcyIsInNyYy9qcy9zZXJpZXMvYmFyQ2hhcnRTZXJpZXMuanMiLCJzcmMvanMvc2VyaWVzL2NvbHVtbkNoYXJ0U2VyaWVzLmpzIiwic3JjL2pzL3Nlcmllcy9saW5lQ2hhcnRTZXJpZXMuanMiLCJzcmMvanMvc2VyaWVzL2xpbmVUeXBlU2VyaWVzQmFzZS5qcyIsInNyYy9qcy9zZXJpZXMvcGllQ2hhcnRTZXJpZXMuanMiLCJzcmMvanMvc2VyaWVzL3Nlcmllcy5qcyIsInNyYy9qcy9zZXJpZXMvc2VyaWVzVGVtcGxhdGUuanMiLCJzcmMvanMvdGhlbWVzL2RlZmF1bHRUaGVtZS5qcyIsInNyYy9qcy90b29sdGlwcy90b29sdGlwLmpzIiwic3JjL2pzL3Rvb2x0aXBzL3Rvb2x0aXBUZW1wbGF0ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDalNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaG5CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1UkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdG5CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbGVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9KQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0WUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDclBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxYUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuY0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3ICBBeGlzIGNvbXBvbmVudC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGRvbSA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZG9tSGFuZGxlci5qcycpLFxuICAgIGNhbGN1bGF0b3IgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2NhbGN1bGF0b3IuanMnKSxcbiAgICByZW5kZXJVdGlsID0gcmVxdWlyZSgnLi4vaGVscGVycy9yZW5kZXJVdGlsLmpzJyksXG4gICAgYXhpc1RlbXBsYXRlID0gcmVxdWlyZSgnLi9heGlzVGVtcGxhdGUuanMnKTtcblxudmFyIFRJVExFX0FSRUFfV0lEVEhfUEFERElORyA9IDIwLFxuICAgIFZfTEFCRUxfUklHSFRfUEFERElORyA9IDEwO1xuXG52YXIgQXhpcyA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBBeGlzLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogQXhpcyBjb21wb25lbnQuXG4gICAgICogQGNvbnN0cnVjdHMgQXhpc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHt7XG4gICAgICogICAgICAgICAgbGFiZWxzOiBhcnJheS48c3RyaW5nPixcbiAgICAgKiAgICAgICAgICB0aWNrQ291bnQ6IG51bWJlcixcbiAgICAgKiAgICAgICAgICBpc0xhYmVsQXhpczogYm9vbGVhbixcbiAgICAgKiAgICAgICAgICBpc1ZlcnRpY2FsOiBib29sZWFuXG4gICAgICogICAgICB9fSBwYXJhbXMuZGF0YSBheGlzIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuYm91bmQgYXhpcyBib3VuZFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBheGlzIHRoZW1lXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgYXhpcyBvcHRpb25zXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIG5lLnV0aWwuZXh0ZW5kKHRoaXMsIHBhcmFtcyk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBeGlzIHZpZXcgY2xhc3NOYW1lXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNsYXNzTmFtZSA9ICduZS1jaGFydC1heGlzLWFyZWEnO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgYXhpcy5cbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IGF4aXMgYXJlYSBiYXNlIGVsZW1lbnRcbiAgICAgKi9cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YSxcbiAgICAgICAgICAgIHRoZW1lID0gdGhpcy50aGVtZSxcbiAgICAgICAgICAgIGlzVmVydGljYWwgPSAhIWRhdGEuaXNWZXJ0aWNhbCxcbiAgICAgICAgICAgIGlzUG9zaXRpb25SaWdodCA9IGRhdGEuaXNQb3NpdGlvblJpZ2h0LFxuICAgICAgICAgICAgb3B0aW9ucyA9IHRoaXMub3B0aW9ucyxcbiAgICAgICAgICAgIGJvdW5kID0gdGhpcy5ib3VuZCxcbiAgICAgICAgICAgIGRpbWVuc2lvbiA9IGJvdW5kLmRpbWVuc2lvbixcbiAgICAgICAgICAgIHNpemUgPSBpc1ZlcnRpY2FsID8gZGltZW5zaW9uLmhlaWdodCA6IGRpbWVuc2lvbi53aWR0aCxcbiAgICAgICAgICAgIGVsID0gZG9tLmNyZWF0ZSgnRElWJywgdGhpcy5jbGFzc05hbWUpLFxuICAgICAgICAgICAgZWxUaXRsZUFyZWEgPSB0aGlzLl9yZW5kZXJUaXRsZUFyZWEoe1xuICAgICAgICAgICAgICAgIHRpdGxlOiBvcHRpb25zLnRpdGxlLFxuICAgICAgICAgICAgICAgIHRoZW1lOiB0aGVtZS50aXRsZSxcbiAgICAgICAgICAgICAgICBpc1ZlcnRpY2FsOiBpc1ZlcnRpY2FsLFxuICAgICAgICAgICAgICAgIGlzUG9zaXRpb25SaWdodDogaXNQb3NpdGlvblJpZ2h0LFxuICAgICAgICAgICAgICAgIHNpemU6IHNpemVcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgZWxUaWNrQXJlYSA9IHRoaXMuX3JlbmRlclRpY2tBcmVhKHNpemUpLFxuICAgICAgICAgICAgZWxMYWJlbEFyZWEgPSB0aGlzLl9yZW5kZXJMYWJlbEFyZWEoc2l6ZSwgZGltZW5zaW9uLndpZHRoKTtcbiAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJEaW1lbnNpb24oZWwsIGRpbWVuc2lvbik7XG4gICAgICAgIHJlbmRlclV0aWwucmVuZGVyUG9zaXRpb24oZWwsIGJvdW5kLnBvc2l0aW9uKTtcbiAgICAgICAgZG9tLmFkZENsYXNzKGVsLCBpc1ZlcnRpY2FsID8gJ3ZlcnRpY2FsJyA6ICdob3Jpem9udGFsJyk7XG4gICAgICAgIGRvbS5hZGRDbGFzcyhlbCwgaXNQb3NpdGlvblJpZ2h0ID8gJ3JpZ2h0JyA6ICcnKTtcbiAgICAgICAgZG9tLmFwcGVuZChlbCwgW2VsVGl0bGVBcmVhLCBlbFRpY2tBcmVhLCBlbExhYmVsQXJlYV0pO1xuXG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGNzcyBzdHlsZSBvZiB0aXRsZSBhcmVhXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxUaXRsZUFyZWEgdGl0bGUgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzaXplICh3aWR0aCBvciBoZWlnaHQpXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpc1Bvc2l0aW9uUmlnaHQgd2hldGhlciByaWdodCBwb3NpdGlvbiBvciBub3Q/XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyVGl0bGVBcmVhU3R5bGU6IGZ1bmN0aW9uKGVsVGl0bGVBcmVhLCBzaXplLCBpc1Bvc2l0aW9uUmlnaHQpIHtcbiAgICAgICAgdmFyIGNzc1RleHRzID0gW1xuICAgICAgICAgICAgcmVuZGVyVXRpbC5jb25jYXRTdHIoJ3dpZHRoOicsIHNpemUsICdweCcpXG4gICAgICAgIF07XG5cbiAgICAgICAgaWYgKGlzUG9zaXRpb25SaWdodCkge1xuICAgICAgICAgICAgY3NzVGV4dHMucHVzaChyZW5kZXJVdGlsLmNvbmNhdFN0cigncmlnaHQ6JywgLXNpemUsICdweCcpKTtcbiAgICAgICAgICAgIGNzc1RleHRzLnB1c2gocmVuZGVyVXRpbC5jb25jYXRTdHIoJ3RvcDonLCAwLCAncHgnKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjc3NUZXh0cy5wdXNoKHJlbmRlclV0aWwuY29uY2F0U3RyKCdsZWZ0OicsIDAsICdweCcpKTtcbiAgICAgICAgICAgIGlmICghcmVuZGVyVXRpbC5pc0lFOCgpKSB7XG4gICAgICAgICAgICAgICAgY3NzVGV4dHMucHVzaChyZW5kZXJVdGlsLmNvbmNhdFN0cigndG9wOicsIHNpemUsICdweCcpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGVsVGl0bGVBcmVhLnN0eWxlLmNzc1RleHQgKz0gJzsnICsgY3NzVGV4dHMuam9pbignOycpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUaXRsZSBhcmVhIHJlbmRlcmVyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLnRpdGxlIGF4aXMgdGl0bGVcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgdGl0bGUgdGhlbWVcbiAgICAgKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gcGFyYW1zLmlzVmVydGljYWwgd2hldGhlciB2ZXJ0aWNhbCBvciBub3Q/XG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5pc1Bvc2l0aW9uUmlnaHQgd2hldGhlciByaWdodCBwb3NpdGlvbiBvciBub3Q/XG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnNpemUgKHdpZHRoIG9yIGhlaWdodClcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHRpdGxlIGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJUaXRsZUFyZWE6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgZWxUaXRsZUFyZWEgPSByZW5kZXJVdGlsLnJlbmRlclRpdGxlKHBhcmFtcy50aXRsZSwgcGFyYW1zLnRoZW1lLCAnbmUtY2hhcnQtdGl0bGUtYXJlYScpO1xuXG4gICAgICAgIGlmIChlbFRpdGxlQXJlYSAmJiBwYXJhbXMuaXNWZXJ0aWNhbCkge1xuICAgICAgICAgICAgdGhpcy5fcmVuZGVyVGl0bGVBcmVhU3R5bGUoZWxUaXRsZUFyZWEsIHBhcmFtcy5zaXplLCBwYXJhbXMuaXNQb3NpdGlvblJpZ2h0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBlbFRpdGxlQXJlYTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVkbmVyIHRpY2sgYXJlYS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc2l6ZSBzaXplIG9yIGhlaWdodFxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gdGljayBhcmVhIGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJUaWNrQXJlYTogZnVuY3Rpb24oc2l6ZSkge1xuICAgICAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YSxcbiAgICAgICAgICAgIHRpY2tDb3VudCA9IGRhdGEudGlja0NvdW50LFxuICAgICAgICAgICAgdGlja0NvbG9yID0gdGhpcy50aGVtZS50aWNrQ29sb3IsXG4gICAgICAgICAgICBwb3NpdGlvbnMgPSBjYWxjdWxhdG9yLm1ha2VUaWNrUGl4ZWxQb3NpdGlvbnMoc2l6ZSwgdGlja0NvdW50KSxcbiAgICAgICAgICAgIGVsVGlja0FyZWEgPSBkb20uY3JlYXRlKCdESVYnLCAnbmUtY2hhcnQtdGljay1hcmVhJyksXG4gICAgICAgICAgICBpc1ZlcnRpY2FsID0gZGF0YS5pc1ZlcnRpY2FsLFxuICAgICAgICAgICAgcG9zVHlwZSA9IGlzVmVydGljYWwgPyAnYm90dG9tJyA6ICdsZWZ0JyxcbiAgICAgICAgICAgIGJvcmRlckNvbG9yVHlwZSA9IGlzVmVydGljYWwgPyAoZGF0YS5pc1Bvc2l0aW9uUmlnaHQgPyAnYm9yZGVyTGVmdENvbG9yJyA6ICdib3JkZXJSaWdodENvbG9yJykgOiAnYm9yZGVyVG9wQ29sb3InLFxuICAgICAgICAgICAgdGVtcGxhdGUgPSBheGlzVGVtcGxhdGUuVFBMX0FYSVNfVElDSyxcbiAgICAgICAgICAgIHRpY2tzSHRtbCA9IG5lLnV0aWwubWFwKHBvc2l0aW9ucywgZnVuY3Rpb24ocG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgY3NzVGV4dCA9IFtcbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyVXRpbC5jb25jYXRTdHIoJ2JhY2tncm91bmQtY29sb3I6JywgdGlja0NvbG9yKSxcbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyVXRpbC5jb25jYXRTdHIocG9zVHlwZSwgJzogJywgcG9zaXRpb24sICdweCcpXG4gICAgICAgICAgICAgICAgXS5qb2luKCc7Jyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRlbXBsYXRlKHtjc3NUZXh0OiBjc3NUZXh0fSk7XG4gICAgICAgICAgICB9LCB0aGlzKS5qb2luKCcnKTtcblxuICAgICAgICBlbFRpY2tBcmVhLmlubmVySFRNTCA9IHRpY2tzSHRtbDtcbiAgICAgICAgZWxUaWNrQXJlYS5zdHlsZVtib3JkZXJDb2xvclR5cGVdID0gdGlja0NvbG9yO1xuXG4gICAgICAgIHJldHVybiBlbFRpY2tBcmVhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgbGFiZWwgYXJlYS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc2l6ZSBsYWJlbCBhcmVhIHNpemVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYXhpc1dpZHRoIGF4aXMgYXJlYSB3aWR0aFxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gbGFiZWwgYXJlYSBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyTGFiZWxBcmVhOiBmdW5jdGlvbihzaXplLCBheGlzV2lkdGgpIHtcbiAgICAgICAgdmFyIGRhdGEgPSB0aGlzLmRhdGEsXG4gICAgICAgICAgICB0aGVtZSA9IHRoaXMudGhlbWUsXG4gICAgICAgICAgICB0aWNrUGl4ZWxQb3NpdGlvbnMgPSBjYWxjdWxhdG9yLm1ha2VUaWNrUGl4ZWxQb3NpdGlvbnMoc2l6ZSwgZGF0YS50aWNrQ291bnQpLFxuICAgICAgICAgICAgbGFiZWxTaXplID0gdGlja1BpeGVsUG9zaXRpb25zWzFdIC0gdGlja1BpeGVsUG9zaXRpb25zWzBdLFxuICAgICAgICAgICAgbGFiZWxzID0gZGF0YS5sYWJlbHMsXG4gICAgICAgICAgICBpc1ZlcnRpY2FsID0gZGF0YS5pc1ZlcnRpY2FsLFxuICAgICAgICAgICAgaXNMYWJlbEF4aXMgPSBkYXRhLmlzTGFiZWxBeGlzLFxuICAgICAgICAgICAgcG9zVHlwZSA9ICdsZWZ0JyxcbiAgICAgICAgICAgIGNzc1RleHRzID0gdGhpcy5fbWFrZUxhYmVsQ3NzVGV4dHMoe1xuICAgICAgICAgICAgICAgIGlzVmVydGljYWw6IGlzVmVydGljYWwsXG4gICAgICAgICAgICAgICAgaXNMYWJlbEF4aXM6IGlzTGFiZWxBeGlzLFxuICAgICAgICAgICAgICAgIGxhYmVsU2l6ZTogbGFiZWxTaXplXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGVsTGFiZWxBcmVhID0gZG9tLmNyZWF0ZSgnRElWJywgJ25lLWNoYXJ0LWxhYmVsLWFyZWEnKSxcbiAgICAgICAgICAgIGFyZWFDc3NUZXh0ID0gcmVuZGVyVXRpbC5tYWtlRm9udENzc1RleHQodGhlbWUubGFiZWwpLFxuICAgICAgICAgICAgbGFiZWxzSHRtbCwgdGl0bGVBcmVhV2lkdGg7XG5cbiAgICAgICAgaWYgKGlzVmVydGljYWwpIHtcbiAgICAgICAgICAgIHBvc1R5cGUgPSBpc0xhYmVsQXhpcyA/ICd0b3AnIDogJ2JvdHRvbSc7XG4gICAgICAgICAgICB0aXRsZUFyZWFXaWR0aCA9IHRoaXMuX2dldFJlbmRlcmVkVGl0bGVIZWlnaHQoKSArIFRJVExFX0FSRUFfV0lEVEhfUEFERElORztcbiAgICAgICAgICAgIGFyZWFDc3NUZXh0ICs9ICc7d2lkdGg6JyArIChheGlzV2lkdGggLSB0aXRsZUFyZWFXaWR0aCArIFZfTEFCRUxfUklHSFRfUEFERElORykgKyAncHgnO1xuICAgICAgICB9XG5cbiAgICAgICAgdGlja1BpeGVsUG9zaXRpb25zLmxlbmd0aCA9IGxhYmVscy5sZW5ndGg7XG5cbiAgICAgICAgbGFiZWxzSHRtbCA9IHRoaXMuX21ha2VMYWJlbHNIdG1sKHtcbiAgICAgICAgICAgIHBvc2l0aW9uczogdGlja1BpeGVsUG9zaXRpb25zLFxuICAgICAgICAgICAgbGFiZWxzOiBsYWJlbHMsXG4gICAgICAgICAgICBwb3NUeXBlOiBwb3NUeXBlLFxuICAgICAgICAgICAgY3NzVGV4dHM6IGNzc1RleHRzXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGVsTGFiZWxBcmVhLmlubmVySFRNTCA9IGxhYmVsc0h0bWw7XG4gICAgICAgIGVsTGFiZWxBcmVhLnN0eWxlLmNzc1RleHQgPSBhcmVhQ3NzVGV4dDtcblxuICAgICAgICB0aGlzLl9jaGFuZ2VMYWJlbEFyZWFQb3NpdGlvbih7XG4gICAgICAgICAgICBlbExhYmVsQXJlYTogZWxMYWJlbEFyZWEsXG4gICAgICAgICAgICBpc1ZlcnRpY2FsOiBpc1ZlcnRpY2FsLFxuICAgICAgICAgICAgaXNMYWJlbEF4aXM6IGlzTGFiZWxBeGlzLFxuICAgICAgICAgICAgdGhlbWU6IHRoZW1lLmxhYmVsLFxuICAgICAgICAgICAgbGFiZWxTaXplOiBsYWJlbFNpemVcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGVsTGFiZWxBcmVhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgaGVpZ2h0IG9mIHRpdGxlIGFyZWEgO1xuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IGhlaWdodFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFJlbmRlcmVkVGl0bGVIZWlnaHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdGl0bGUgPSB0aGlzLm9wdGlvbnMudGl0bGUsXG4gICAgICAgICAgICB0aGVtZSA9IHRoaXMudGhlbWUudGl0bGUsXG4gICAgICAgICAgICByZXN1bHQgPSB0aXRsZSA/IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodCh0aXRsZSwgdGhlbWUpIDogMDtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBjc3NUZXh0cyBvZiBsYWJlbC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlclxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaXNWZXJ0aWNhbCB3aGV0aGVyIHZlcnRpY2FsIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaXNMYWJlbEF4aXMgd2hldGhlciBsYWJlbCBheGlzIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5sYWJlbFNpemUgbGFiZWwgc2l6ZSAod2lkdGggb3IgaGVpZ2h0KVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmdbXX0gY3NzVGV4dHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlTGFiZWxDc3NUZXh0czogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBjc3NUZXh0cyA9IFtdO1xuXG4gICAgICAgIGlmIChwYXJhbXMuaXNWZXJ0aWNhbCAmJiBwYXJhbXMuaXNMYWJlbEF4aXMpIHtcbiAgICAgICAgICAgIGNzc1RleHRzLnB1c2gocmVuZGVyVXRpbC5jb25jYXRTdHIoJ2hlaWdodDonLCBwYXJhbXMubGFiZWxTaXplLCAncHgnKSk7XG4gICAgICAgICAgICBjc3NUZXh0cy5wdXNoKHJlbmRlclV0aWwuY29uY2F0U3RyKCdsaW5lLWhlaWdodDonLCBwYXJhbXMubGFiZWxTaXplLCAncHgnKSk7XG4gICAgICAgIH0gZWxzZSBpZiAoIXBhcmFtcy5pc1ZlcnRpY2FsKSB7XG4gICAgICAgICAgICBjc3NUZXh0cy5wdXNoKHJlbmRlclV0aWwuY29uY2F0U3RyKCd3aWR0aDonLCBwYXJhbXMubGFiZWxTaXplLCAncHgnKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY3NzVGV4dHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgaHRtbCBvZiBsYWJlbC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPG9iamVjdD59IHBhcmFtcy5wb3NpdGlvbnMgbGFiZWwgcG9zaXRpb24gYXJyYXlcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nW119IHBhcmFtcy5sYWJlbHMgbGFiZWwgYXJyYXlcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMucG9zVHlwZSBwb3NpdGlvbiB0eXBlIChsZWZ0IG9yIGJvdHRvbSlcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nW119IHBhcmFtcy5jc3NUZXh0cyBjc3MgYXJyYXlcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBodG1sXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUxhYmVsc0h0bWw6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgdGVtcGxhdGUgPSBheGlzVGVtcGxhdGUuVFBMX0FYSVNfTEFCRUwsXG4gICAgICAgICAgICBsYWJlbHNIdG1sID0gbmUudXRpbC5tYXAocGFyYW1zLnBvc2l0aW9ucywgZnVuY3Rpb24ocG9zaXRpb24sIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdmFyIGxhYmVsQ3NzVGV4dHMgPSBwYXJhbXMuY3NzVGV4dHMuc2xpY2UoKSxcbiAgICAgICAgICAgICAgICAgICAgaHRtbDtcblxuICAgICAgICAgICAgICAgIGxhYmVsQ3NzVGV4dHMucHVzaChyZW5kZXJVdGlsLmNvbmNhdFN0cihwYXJhbXMucG9zVHlwZSwgJzonLCBwb3NpdGlvbiwgJ3B4JykpO1xuICAgICAgICAgICAgICAgIGh0bWwgPSB0ZW1wbGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGNzc1RleHQ6IGxhYmVsQ3NzVGV4dHMuam9pbignOycpLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogcGFyYW1zLmxhYmVsc1tpbmRleF1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gaHRtbDtcbiAgICAgICAgICAgIH0sIHRoaXMpLmpvaW4oJycpO1xuXG4gICAgICAgIHJldHVybiBsYWJlbHNIdG1sO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGFuZ2UgcG9zaXRpb24gb2YgbGFiZWwgYXJlYS5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlclxuICAgICAqICAgICAgQHBhcmFtIHtIVE1MRWxlbWVudH0gcGFyYW1zLmVsTGFiZWxBcmVhIGxhYmVsIGFyZWEgZWxlbWVudFxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaXNWZXJ0aWNhbCB3aGV0aGVyIHZlcnRpY2FsIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaXNMYWJlbEF4aXMgd2hldGhlciBsYWJlbCBheGlzIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHt7Zm9udFNpemU6IG51bWJlciwgZm9udEZhbWlseTogc3RyaW5nLCBjb2xvcjogc3RyaW5nfX0gcGFyYW1zLnRoZW1lIGxhYmVsIHRoZW1lXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmxhYmVsU2l6ZSBsYWJlbCBzaXplICh3aWR0aCBvciBoZWlnaHQpXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2hhbmdlTGFiZWxBcmVhUG9zaXRpb246IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgbGFiZWxIZWlnaHQ7XG5cbiAgICAgICAgaWYgKHBhcmFtcy5pc0xhYmVsQXhpcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhcmFtcy5pc1ZlcnRpY2FsKSB7XG4gICAgICAgICAgICBsYWJlbEhlaWdodCA9IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodCgnQUJDJywgcGFyYW1zLnRoZW1lKTtcbiAgICAgICAgICAgIHBhcmFtcy5lbExhYmVsQXJlYS5zdHlsZS50b3AgPSByZW5kZXJVdGlsLmNvbmNhdFN0cihwYXJzZUludChsYWJlbEhlaWdodCAvIDIsIDEwKSwgJ3B4Jyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYXJhbXMuZWxMYWJlbEFyZWEuc3R5bGUubGVmdCA9IHJlbmRlclV0aWwuY29uY2F0U3RyKCctJywgcGFyc2VJbnQocGFyYW1zLmxhYmVsU2l6ZSAvIDIsIDEwKSwgJ3B4Jyk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBeGlzO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFRoaXMgaXMgdGVtcGxhdGVzIG9yIGF4aXMgdmlldy5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbnZhciB0ZW1wbGF0ZU1ha2VyID0gcmVxdWlyZSgnLi4vaGVscGVycy90ZW1wbGF0ZU1ha2VyLmpzJyk7XG5cbnZhciB0YWdzID0ge1xuICAgIEhUTUxfQVhJU19USUNLOiAnPGRpdiBjbGFzcz1cIm5lLWNoYXJ0LXRpY2tcIiBzdHlsZT1cInt7IGNzc1RleHQgfX1cIj48L2Rpdj4nLFxuICAgIEhUTUxfQVhJU19MQUJFTDogJzxkaXYgY2xhc3M9XCJuZS1jaGFydC1sYWJlbFwiIHN0eWxlPVwie3sgY3NzVGV4dCB9fVwiPnt7IGxhYmVsIH19PC9kaXY+J1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgVFBMX0FYSVNfVElDSzogdGVtcGxhdGVNYWtlci50ZW1wbGF0ZSh0YWdzLkhUTUxfQVhJU19USUNLKSxcbiAgICBUUExfQVhJU19MQUJFTDogdGVtcGxhdGVNYWtlci50ZW1wbGF0ZSh0YWdzLkhUTUxfQVhJU19MQUJFTClcbn07XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgY2hhcnQuanMgaXMgZW50cnkgcG9pbnQgb2YgQXBwbGljYXRpb24gQ2hhcnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4vY29uc3QuanMnKSxcbiAgICBjaGFydEZhY3RvcnkgPSByZXF1aXJlKCcuL2ZhY3Rvcmllcy9jaGFydEZhY3RvcnkuanMnKSxcbiAgICBwbHVnaW5GYWN0b3J5ID0gcmVxdWlyZSgnLi9mYWN0b3JpZXMvcGx1Z2luRmFjdG9yeS5qcycpLFxuICAgIHRoZW1lRmFjdG9yeSA9IHJlcXVpcmUoJy4vZmFjdG9yaWVzL3RoZW1lRmFjdG9yeS5qcycpO1xuXG52YXIgREVGQVVMVF9USEVNRV9OQU1FID0gJ2RlZmF1bHQnO1xuXG52YXIgX2NyZWF0ZUNoYXJ0O1xuXG5yZXF1aXJlKCcuL2NvZGUtc25pcHBldC11dGlsLmpzJyk7XG5yZXF1aXJlKCcuL3JlZ2lzdGVyQ2hhcnRzLmpzJyk7XG5yZXF1aXJlKCcuL3JlZ2lzdGVyVGhlbWVzLmpzJyk7XG5cbi8qKlxuICogTkhOIEVudGVydGFpbm1lbnQgQXBwbGljYXRpb24gQ2hhcnQuXG4gKiBAbmFtZXNwYWNlIG5lLmFwcGxpY2F0aW9uLmNoYXJ0XG4gKi9cbm5lLnV0aWwuZGVmaW5lTmFtZXNwYWNlKCduZS5hcHBsaWNhdGlvbi5jaGFydCcpO1xuXG4vKipcbiAqIENyZWF0ZSBjaGFydC5cbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciBjb250YWluZXJcbiAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gZGF0YSBjaGFydCBkYXRhXG4gKiBAcGFyYW0ge3tcbiAqICAgY2hhcnQ6IHtcbiAqICAgICB3aWR0aDogbnVtYmVyLFxuICogICAgIGhlaWdodDogbnVtYmVyLFxuICogICAgIHRpdGxlOiBzdHJpbmcsXG4gKiAgICAgZm9ybWF0OiBzdHJpbmdcbiAqICAgfSxcbiAqICAgeUF4aXM6IHtcbiAqICAgICB0aXRsZTogc3RyaW5nLFxuICogICAgIG1pbjogbnVtYmVyXG4gKiAgIH0sXG4gKiAgIHhBeGlzOiB7XG4gKiAgICAgdGl0bGU6IHN0cmlnLFxuICogICAgIG1pbjogbnVtYmVyXG4gKiAgIH0sXG4gKiAgIHRvb2x0aXA6IHtcbiAqICAgICBzdWZmaXg6IHN0cmluZyxcbiAqICAgICB0ZW1wbGF0ZTogc3RyaW5nXG4gKiAgIH0sXG4gKiAgIHRoZW1lOiBzdHJpbmdcbiAqIH19IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICogQHJldHVybnMge29iamVjdH0gY2hhcnQgaW5zdGFuY2UuXG4gKiBAcHJpdmF0ZVxuICogQGlnbm9yZVxuICovXG5fY3JlYXRlQ2hhcnQgPSBmdW5jdGlvbihjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpIHtcbiAgICB2YXIgdGhlbWVOYW1lLCB0aGVtZSwgY2hhcnQ7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdGhlbWVOYW1lID0gb3B0aW9ucy50aGVtZSB8fCBERUZBVUxUX1RIRU1FX05BTUU7XG4gICAgdGhlbWUgPSB0aGVtZUZhY3RvcnkuZ2V0KHRoZW1lTmFtZSk7XG5cbiAgICBjaGFydCA9IGNoYXJ0RmFjdG9yeS5nZXQob3B0aW9ucy5jaGFydFR5cGUsIGRhdGEsIHRoZW1lLCBvcHRpb25zKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoY2hhcnQucmVuZGVyKCkpO1xuICAgIGNoYXJ0LmFuaW1hdGVDaGFydCgpO1xuXG4gICAgcmV0dXJuIGNoYXJ0O1xufTtcblxuLyoqXG4gKiBCYXIgY2hhcnQgY3JlYXRvci5cbiAqIEBtZW1iZXJPZiBuZS5hcHBsaWNhdGlvbi5jaGFydFxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNoYXJ0IGNvbnRhaW5lclxuICogQHBhcmFtIHtvYmplY3R9IGRhdGEgY2hhcnQgZGF0YVxuICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBkYXRhLmNhdGVnb3JpZXMgY2F0ZWdvcmllc1xuICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IGRhdGEuc2VyaWVzIHNlcmllcyBkYXRhXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLmNoYXJ0IGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LndpZHRoIGNoYXJ0IHdpZHRoXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5jaGFydC5oZWlnaHQgY2hhcnQgaGVpZ2h0XG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC50aXRsZSBjaGFydCB0aXRsZVxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuY2hhcnQuZm9ybWF0IHZhbHVlIGZvcm1hdFxuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy55QXhpcyBvcHRpb25zIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnlBeGlzLnRpdGxlIHRpdGxlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMueEF4aXMgb3B0aW9ucyBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnhBeGlzLnRpdGxlIHRpdGxlIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMueEF4aXMubWluIG1pbmltYWwgdmFsdWUgb2YgaG9yaXpvbnRhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy54QXhpcy5tYXggbWF4aW11bSB2YWx1ZSBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuc2VyaWVzIG9wdGlvbnMgb2Ygc2VyaWVzXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5zZXJpZXMuc3RhY2tlZCBzdGFja2VkIHR5cGVcbiAqICAgICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5zZXJpZXMuc2hvd0xhYmVsIHdoZXRoZXIgc2hvdyBsYWJlbCBvciBub3RcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMudG9vbHRpcCBvcHRpb25zIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAuc3VmZml4IHN1ZmZpeCBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnRlbXBsYXRlIHRlbXBsYXRlIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAucG9zaXRpb24gdG9vbHRpcCBwb3NpdGlvbiB0eXBlXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uIGFkZCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24ubGVmdCBhZGQgbGVmdCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24udG9wIGFkZCB0b3AgcG9zaXRpb25cbiAqICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudGhlbWUgdGhlbWUgbmFtZVxuICogICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5saWJUeXBlIGdyYXBoIGxpYnJhcnkgdHlwZVxuICogQHJldHVybnMge29iamVjdH0gYmFyIGNoYXJ0XG4gKiBAZXhhbXBsZVxuICogdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWluZXItaWQnKSxcbiAqICAgICBkYXRhID0ge1xuICogICAgICAgY2F0ZWdvcmllczogWydjYXRlMScsICdjYXRlMicsICdjYXRlMyddLFxuICogICAgICAgc2VyaWVzOiBbXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMScsXG4gKiAgICAgICAgICAgZGF0YTogWzIwLCAzMCwgNTBdXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMicsXG4gKiAgICAgICAgICAgZGF0YTogWzQwLCA0MCwgNjBdXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMycsXG4gKiAgICAgICAgICAgZGF0YTogWzYwLCA1MCwgMTBdXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kNCcsXG4gKiAgICAgICAgICAgZGF0YTogWzgwLCAxMCwgNzBdXG4gKiAgICAgICAgIH1cbiAqICAgICAgIF1cbiAqICAgICB9LFxuICogICAgIG9wdGlvbnMgPSB7XG4gKiAgICAgICBjaGFydDoge1xuICogICAgICAgICB0aXRsZTogJ0JhciBDaGFydCdcbiAqICAgICAgIH0sXG4gKiAgICAgICB5QXhpczoge1xuICogICAgICAgICB0aXRsZTogJ1kgQXhpcydcbiAqICAgICAgIH0sXG4gKiAgICAgICB4QXhpczoge1xuICogICAgICAgICB0aXRsZTogJ1ggQXhpcydcbiAqICAgICAgIH1cbiAqICAgICB9O1xuICogbmUuYXBwbGljYXRpb24uY2hhcnQuYmFyQ2hhcnQoY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKTtcbiAqL1xubmUuYXBwbGljYXRpb24uY2hhcnQuYmFyQ2hhcnQgPSBmdW5jdGlvbihjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICBvcHRpb25zLmNoYXJ0VHlwZSA9IGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9CQVI7XG4gICAgcmV0dXJuIF9jcmVhdGVDaGFydChjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpO1xufTtcblxuLyoqXG4gKiBDb2x1bW4gY2hhcnQgY3JlYXRvci5cbiAqIEBtZW1iZXJPZiBuZS5hcHBsaWNhdGlvbi5jaGFydFxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNoYXJ0IGNvbnRhaW5lclxuICogQHBhcmFtIHtvYmplY3R9IGRhdGEgY2hhcnQgZGF0YVxuICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBkYXRhLmNhdGVnb3JpZXMgY2F0ZWdvcmllc1xuICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IGRhdGEuc2VyaWVzIHNlcmllcyBkYXRhXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLmNoYXJ0IGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LndpZHRoIGNoYXJ0IHdpZHRoXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5jaGFydC5oZWlnaHQgY2hhcnQgaGVpZ2h0XG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC50aXRsZSBjaGFydCB0aXRsZVxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuY2hhcnQuZm9ybWF0IHZhbHVlIGZvcm1hdFxuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy55QXhpcyBvcHRpb25zIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnlBeGlzLnRpdGxlIHRpdGxlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnlBeGlzLm1pbiBtaW5pbWFsIHZhbHVlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnlBeGlzLm1heCBtYXhpbXVtIHZhbHVlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMueEF4aXMgb3B0aW9ucyBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnhBeGlzLnRpdGxlIHRpdGxlIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5zZXJpZXMgb3B0aW9ucyBvZiBzZXJpZXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnNlcmllcy5zdGFja2VkIHN0YWNrZWQgdHlwZVxuICogICAgICAgICAgQHBhcmFtIHtib29sZWFufSBvcHRpb25zLnNlcmllcy5zaG93TGFiZWwgd2hldGhlciBzaG93IGxhYmVsIG9yIG5vdFxuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy50b29sdGlwIG9wdGlvbnMgb2YgdG9vbHRpcFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC5zdWZmaXggc3VmZml4IG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAudGVtcGxhdGUgdGVtcGxhdGUgb2YgdG9vbHRpcFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC5wb3NpdGlvbiB0b29sdGlwIHBvc2l0aW9uIHR5cGVcbiAqICAgICAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24gYWRkIHBvc2l0aW9uXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMudG9vbHRpcC5hZGRQb3NpdGlvbi5sZWZ0IGFkZCBsZWZ0IHBvc2l0aW9uXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMudG9vbHRpcC5hZGRQb3NpdGlvbi50b3AgYWRkIHRvcCBwb3NpdGlvblxuICogICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50aGVtZSB0aGVtZSBuYW1lXG4gKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmxpYlR5cGUgZ3JhcGggbGlicmFyeSB0eXBlXG4gKiBAcmV0dXJucyB7b2JqZWN0fSBjb2x1bW4gY2hhcnRcbiAqIEBleGFtcGxlXG4gKiB2YXIgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhaW5lci1pZCcpLFxuICogICAgIGRhdGEgPSB7XG4gKiAgICAgICBjYXRlZ29yaWVzOiBbJ2NhdGUxJywgJ2NhdGUyJywgJ2NhdGUzJ10sXG4gKiAgICAgICBzZXJpZXM6IFtcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQxJyxcbiAqICAgICAgICAgICBkYXRhOiBbMjAsIDMwLCA1MF1cbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQyJyxcbiAqICAgICAgICAgICBkYXRhOiBbNDAsIDQwLCA2MF1cbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQzJyxcbiAqICAgICAgICAgICBkYXRhOiBbNjAsIDUwLCAxMF1cbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQ0JyxcbiAqICAgICAgICAgICBkYXRhOiBbODAsIDEwLCA3MF1cbiAqICAgICAgICAgfVxuICogICAgICAgXVxuICogICAgIH0sXG4gKiAgICAgb3B0aW9ucyA9IHtcbiAqICAgICAgIGNoYXJ0OiB7XG4gKiAgICAgICAgIHRpdGxlOiAnQ29sdW1uIENoYXJ0J1xuICogICAgICAgfSxcbiAqICAgICAgIHlBeGlzOiB7XG4gKiAgICAgICAgIHRpdGxlOiAnWSBBeGlzJ1xuICogICAgICAgfSxcbiAqICAgICAgIHhBeGlzOiB7XG4gKiAgICAgICAgIHRpdGxlOiAnWCBBeGlzJ1xuICogICAgICAgfVxuICogICAgIH07XG4gKiBuZS5hcHBsaWNhdGlvbi5jaGFydC5jb2x1bW5DaGFydChjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpO1xuICovXG5uZS5hcHBsaWNhdGlvbi5jaGFydC5jb2x1bW5DaGFydCA9IGZ1bmN0aW9uKGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIG9wdGlvbnMuY2hhcnRUeXBlID0gY2hhcnRDb25zdC5DSEFSVF9UWVBFX0NPTFVNTjtcbiAgICByZXR1cm4gX2NyZWF0ZUNoYXJ0KGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucyk7XG59O1xuXG4vKipcbiAqIExpbmUgY2hhcnQgY3JlYXRvci5cbiAqIEBtZW1iZXJPZiBuZS5hcHBsaWNhdGlvbi5jaGFydFxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNoYXJ0IGNvbnRhaW5lclxuICogQHBhcmFtIHtvYmplY3R9IGRhdGEgY2hhcnQgZGF0YVxuICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBkYXRhLmNhdGVnb3JpZXMgY2F0ZWdvcmllc1xuICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IGRhdGEuc2VyaWVzIHNlcmllcyBkYXRhXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLmNoYXJ0IGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LndpZHRoIGNoYXJ0IHdpZHRoXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5jaGFydC5oZWlnaHQgY2hhcnQgaGVpZ2h0XG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC50aXRsZSBjaGFydCB0aXRsZVxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuY2hhcnQuZm9ybWF0IHZhbHVlIGZvcm1hdFxuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy55QXhpcyBvcHRpb25zIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnlBeGlzLnRpdGxlIHRpdGxlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnlBeGlzLm1pbiBtaW5pbWFsIHZhbHVlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnlBeGlzLm1heCBtYXhpbXVtIHZhbHVlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMueEF4aXMgb3B0aW9ucyBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnhBeGlzLnRpdGxlIHRpdGxlIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5zZXJpZXMgb3B0aW9ucyBvZiBzZXJpZXNcbiAqICAgICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5zZXJpZXMuaGFzRG90IHdoZXRoZXIgaGFzIGRvdCBvciBub3RcbiAqICAgICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5zZXJpZXMuc2hvd0xhYmVsIHdoZXRoZXIgc2hvdyBsYWJlbCBvciBub3RcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMudG9vbHRpcCBvcHRpb25zIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAuc3VmZml4IHN1ZmZpeCBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnRlbXBsYXRlIHRlbXBsYXRlIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAucG9zaXRpb24gdG9vbHRpcCBwb3NpdGlvbiB0eXBlXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uIGFkZCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24ubGVmdCBhZGQgbGVmdCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24udG9wIGFkZCB0b3AgcG9zaXRpb25cbiAqICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudGhlbWUgdGhlbWUgbmFtZVxuICogICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5saWJUeXBlIGdyYXBoIGxpYnJhcnkgdHlwZVxuICogQHJldHVybnMge29iamVjdH0gYmFyIGNoYXJ0XG4gKiBAZXhhbXBsZVxuICogdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWluZXItaWQnKSxcbiAqICAgICBkYXRhID0ge1xuICogICAgICAgY2F0ZWdvcmllczogWydjYXRlMScsICdjYXRlMicsICdjYXRlMyddLFxuICogICAgICAgc2VyaWVzOiBbXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMScsXG4gKiAgICAgICAgICAgZGF0YTogWzIwLCAzMCwgNTBdXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMicsXG4gKiAgICAgICAgICAgZGF0YTogWzQwLCA0MCwgNjBdXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMycsXG4gKiAgICAgICAgICAgZGF0YTogWzYwLCA1MCwgMTBdXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kNCcsXG4gKiAgICAgICAgICAgZGF0YTogWzgwLCAxMCwgNzBdXG4gKiAgICAgICAgIH1cbiAqICAgICAgIF1cbiAqICAgICB9LFxuICogICAgIG9wdGlvbnMgPSB7XG4gKiAgICAgICBjaGFydDoge1xuICogICAgICAgICB0aXRsZTogJ0xpbmUgQ2hhcnQnXG4gKiAgICAgICB9LFxuICogICAgICAgeUF4aXM6IHtcbiAqICAgICAgICAgdGl0bGU6ICdZIEF4aXMnXG4gKiAgICAgICB9LFxuICogICAgICAgeEF4aXM6IHtcbiAqICAgICAgICAgdGl0bGU6ICdYIEF4aXMnXG4gKiAgICAgICB9LFxuICogICAgICAgc2VyaWVzOiB7XG4gKiAgICAgICAgIGhhc0RvdDogdHJ1ZVxuICogICAgICAgfVxuICogICAgIH07XG4gKiBuZS5hcHBsaWNhdGlvbi5jaGFydC5saW5lQ2hhcnQoY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKTtcbiAqL1xubmUuYXBwbGljYXRpb24uY2hhcnQubGluZUNoYXJ0ID0gZnVuY3Rpb24oY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgb3B0aW9ucy5jaGFydFR5cGUgPSBjaGFydENvbnN0LkNIQVJUX1RZUEVfTElORTtcbiAgICByZXR1cm4gX2NyZWF0ZUNoYXJ0KGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucyk7XG59O1xuXG4vKipcbiAqIEFyZWEgY2hhcnQgY3JlYXRvci5cbiAqIEBtZW1iZXJPZiBuZS5hcHBsaWNhdGlvbi5jaGFydFxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNoYXJ0IGNvbnRhaW5lclxuICogQHBhcmFtIHtvYmplY3R9IGRhdGEgY2hhcnQgZGF0YVxuICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBkYXRhLmNhdGVnb3JpZXMgY2F0ZWdvcmllc1xuICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IGRhdGEuc2VyaWVzIHNlcmllcyBkYXRhXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLmNoYXJ0IGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LndpZHRoIGNoYXJ0IHdpZHRoXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5jaGFydC5oZWlnaHQgY2hhcnQgaGVpZ2h0XG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC50aXRsZSBjaGFydCB0aXRsZVxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuY2hhcnQuZm9ybWF0IHZhbHVlIGZvcm1hdFxuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy55QXhpcyBvcHRpb25zIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnlBeGlzLnRpdGxlIHRpdGxlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnlBeGlzLm1pbiBtaW5pbWFsIHZhbHVlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnlBeGlzLm1heCBtYXhpbXVtIHZhbHVlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMueEF4aXMgb3B0aW9ucyBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnhBeGlzLnRpdGxlIHRpdGxlIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5zZXJpZXMgb3B0aW9ucyBvZiBzZXJpZXNcbiAqICAgICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5zZXJpZXMuaGFzRG90IHdoZXRoZXIgaGFzIGRvdCBvciBub3RcbiAqICAgICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5zZXJpZXMuc2hvd0xhYmVsIHdoZXRoZXIgc2hvdyBsYWJlbCBvciBub3RcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMudG9vbHRpcCBvcHRpb25zIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAuc3VmZml4IHN1ZmZpeCBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnRlbXBsYXRlIHRlbXBsYXRlIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAucG9zaXRpb24gdG9vbHRpcCBwb3NpdGlvbiB0eXBlXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uIGFkZCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24ubGVmdCBhZGQgbGVmdCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24udG9wIGFkZCB0b3AgcG9zaXRpb25cbiAqICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudGhlbWUgdGhlbWUgbmFtZVxuICogICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5saWJUeXBlIGdyYXBoIGxpYnJhcnkgdHlwZVxuICogQHJldHVybnMge29iamVjdH0gYmFyIGNoYXJ0XG4gKiBAaWdub3JlXG4gKiBAZXhhbXBsZVxuICogdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWluZXItaWQnKSxcbiAqICAgICBkYXRhID0ge1xuICogICAgICAgY2F0ZWdvcmllczogWydjYXRlMScsICdjYXRlMicsICdjYXRlMyddLFxuICogICAgICAgc2VyaWVzOiBbXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMScsXG4gKiAgICAgICAgICAgZGF0YTogWzIwLCAzMCwgNTBdXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMicsXG4gKiAgICAgICAgICAgZGF0YTogWzQwLCA0MCwgNjBdXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMycsXG4gKiAgICAgICAgICAgZGF0YTogWzYwLCA1MCwgMTBdXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kNCcsXG4gKiAgICAgICAgICAgZGF0YTogWzgwLCAxMCwgNzBdXG4gKiAgICAgICAgIH1cbiAqICAgICAgIF1cbiAqICAgICB9LFxuICogICAgIG9wdGlvbnMgPSB7XG4gKiAgICAgICBjaGFydDoge1xuICogICAgICAgICB0aXRsZTogJ0FyZWEgQ2hhcnQnXG4gKiAgICAgICB9LFxuICogICAgICAgeUF4aXM6IHtcbiAqICAgICAgICAgdGl0bGU6ICdZIEF4aXMnXG4gKiAgICAgICB9LFxuICogICAgICAgeEF4aXM6IHtcbiAqICAgICAgICAgdGl0bGU6ICdYIEF4aXMnXG4gKiAgICAgICB9XG4gKiAgICAgfTtcbiAqIG5lLmFwcGxpY2F0aW9uLmNoYXJ0LmFyZWFDaGFydChjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpO1xuICovXG5uZS5hcHBsaWNhdGlvbi5jaGFydC5hcmVhQ2hhcnQgPSBmdW5jdGlvbihjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICBvcHRpb25zLmNoYXJ0VHlwZSA9IGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9BUkVBO1xuICAgIHJldHVybiBfY3JlYXRlQ2hhcnQoY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKTtcbn07XG5cbi8qKlxuICogQ29tYm8gY2hhcnQgY3JlYXRvci5cbiAqIEBtZW1iZXJPZiBuZS5hcHBsaWNhdGlvbi5jaGFydFxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNoYXJ0IGNvbnRhaW5lclxuICogQHBhcmFtIHtvYmplY3R9IGRhdGEgY2hhcnQgZGF0YVxuICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBkYXRhLmNhdGVnb3JpZXMgY2F0ZWdvcmllc1xuICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IGRhdGEuc2VyaWVzIHNlcmllcyBkYXRhXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLmNoYXJ0IGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LndpZHRoIGNoYXJ0IHdpZHRoXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5jaGFydC5oZWlnaHQgY2hhcnQgaGVpZ2h0XG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC50aXRsZSBjaGFydCB0aXRsZVxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuY2hhcnQuZm9ybWF0IHZhbHVlIGZvcm1hdFxuICogICAgICBAcGFyYW0ge29iamVjdFtdfSBvcHRpb25zLnlBeGlzIG9wdGlvbnMgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMueUF4aXNbXS50aXRsZSB0aXRsZSBvZiB2ZXJ0aWNhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy55QXhpc1tdLm1pbiBtaW5pbWFsIHZhbHVlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnlBeGlzW10ubWF4IG1heGltdW0gdmFsdWUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy54QXhpcyBvcHRpb25zIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMueEF4aXMudGl0bGUgdGl0bGUgb2YgaG9yaXpvbnRhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy54QXhpcy5taW4gbWluaW1hbCB2YWx1ZSBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnhBeGlzLm1heCBtYXhpbXVtIHZhbHVlIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5zZXJpZXMgb3B0aW9ucyBvZiBzZXJpZXNcbiAqICAgICAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnNlcmllcy5jb2x1bW4gb3B0aW9ucyBvZiBjb2x1bW4gc2VyaWVzXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuc2VyaWVzLmNvbHVtbi5zdGFja2VkIHN0YWNrZWQgdHlwZVxuICogICAgICAgICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5zZXJpZXMuY29sdW1uLnNob3dMYWJlbCB3aGV0aGVyIHNob3cgbGFiZWwgb3Igbm90XG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5zZXJpZXMubGluZSBvcHRpb25zIG9mIGxpbmUgc2VyaWVzXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtib29sZWFufSBvcHRpb25zLnNlcmllcy5saW5lLmhhc0RvdCB3aGV0aGVyIGhhcyBkb3Qgb3Igbm90XG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtib29sZWFufSBvcHRpb25zLnNlcmllcy5saW5lLnNob3dMYWJlbCB3aGV0aGVyIHNob3cgbGFiZWwgb3Igbm90XG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnRvb2x0aXAgb3B0aW9ucyBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy50b29sdGlwLmNvbHVtbiBvcHRpb25zIG9mIGNvbHVtbiB0b29sdGlwXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC5jb2x1bW4uc3VmZml4IHN1ZmZpeCBvZiB0b29sdGlwXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC5jb2x1bW4udGVtcGxhdGUgdGVtcGxhdGUgb2YgdG9vbHRpcFxuICogICAgICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAuY29sdW1uLnBvc2l0aW9uIHRvb2x0aXAgcG9zaXRpb24gdHlwZVxuICogICAgICAgICAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnRvb2x0aXAuY29sdW1uLmFkZFBvc2l0aW9uIGFkZCBwb3NpdGlvblxuICogICAgICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy50b29sdGlwLmNvbHVtbi5hZGRQb3NpdGlvbi5sZWZ0IGFkZCBsZWZ0IHBvc2l0aW9uXG4gKiAgICAgICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuY29sdW1uLmFkZFBvc2l0aW9uLnRvcCBhZGQgdG9wIHBvc2l0aW9uXG4gKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRoZW1lIHRoZW1lIG5hbWVcbiAqICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMubGliVHlwZSBncmFwaCBsaWJyYXJ5IHR5cGVcbiAqIEByZXR1cm5zIHtvYmplY3R9IGJhciBjaGFydFxuICogQGV4YW1wbGVcbiAqIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFpbmVyLWlkJyksXG4gKiAgICAgZGF0YSA9IHtcbiAqICAgICAgIGNhdGVnb3JpZXM6IFsnY2F0ZTEnLCAnY2F0ZTInLCAnY2F0ZTMnXSxcbiAqICAgICAgIHNlcmllczoge1xuICogICAgICAgICBjb2x1bW46IFtcbiAqICAgICAgICAgICB7XG4gKiAgICAgICAgICAgICBuYW1lOiAnTGVnZW5kMScsXG4gKiAgICAgICAgICAgICBkYXRhOiBbMjAsIDMwLCA1MF1dXG4gKiAgICAgICAgICAgfSxcbiAqICAgICAgICAgICB7XG4gKiAgICAgICAgICAgICBuYW1lOiAnTGVnZW5kMicsXG4gKiAgICAgICAgICAgICBkYXRhOiBbNDAsIDQwLCA2MF1cbiAqICAgICAgICAgICB9LFxuICogICAgICAgICAgIHtcbiAqICAgICAgICAgICAgIG5hbWU6ICdMZWdlbmQzJyxcbiAqICAgICAgICAgICAgIGRhdGE6IFs2MCwgNTAsIDEwXVxuICogICAgICAgICAgIH0sXG4gKiAgICAgICAgICAge1xuICogICAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDQnLFxuICogICAgICAgICAgICAgZGF0YTogWzgwLCAxMCwgNzBdXG4gKiAgICAgICAgICAgfVxuICogICAgICAgICB9LFxuICogICAgICAgICBsaW5lOiBbXG4gKiAgICAgICAgICAge1xuICogICAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDUnLFxuICogICAgICAgICAgICAgZGF0YTogWzEsIDIsIDNdXG4gKiAgICAgICAgICAgfVxuICogICAgICAgICBdXG4gKiAgICAgICB9XG4gKiAgICAgfSxcbiAqICAgICBvcHRpb25zID0ge1xuICogICAgICAgY2hhcnQ6IHtcbiAqICAgICAgICAgdGl0bGU6ICdDb21ibyBDaGFydCdcbiAqICAgICAgIH0sXG4gKiAgICAgICB5QXhpczpbXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICB0aXRsZTogJ1kgQXhpcycsXG4gKiAgICAgICAgICAgY2hhcnRUeXBlOiAnbGluZSdcbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIHRpdGxlOiAnWSBSaWdodCBBeGlzJ1xuICogICAgICAgICB9XG4gKiAgICAgICBdLFxuICogICAgICAgeEF4aXM6IHtcbiAqICAgICAgICAgdGl0bGU6ICdYIEF4aXMnXG4gKiAgICAgICB9LFxuICogICAgICAgc2VyaWVzOiB7XG4gKiAgICAgICAgIGhhc0RvdDogdHJ1ZVxuICogICAgICAgfVxuICogICAgIH07XG4gKiBuZS5hcHBsaWNhdGlvbi5jaGFydC5jb21ib0NoYXJ0KGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucyk7XG4gKi9cbm5lLmFwcGxpY2F0aW9uLmNoYXJ0LmNvbWJvQ2hhcnQgPSBmdW5jdGlvbihjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICBvcHRpb25zLmNoYXJ0VHlwZSA9IGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9DT01CTztcbiAgICByZXR1cm4gX2NyZWF0ZUNoYXJ0KGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucyk7XG59O1xuXG4vKipcbiAqIFBpZSBjaGFydCBjcmVhdG9yLlxuICogQG1lbWJlck9mIG5lLmFwcGxpY2F0aW9uLmNoYXJ0XG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY2hhcnQgY29udGFpbmVyXG4gKiBAcGFyYW0ge29iamVjdH0gZGF0YSBjaGFydCBkYXRhXG4gKiAgICAgIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gZGF0YS5zZXJpZXMgc2VyaWVzIGRhdGFcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuY2hhcnQgY2hhcnQgb3B0aW9uc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMuY2hhcnQud2lkdGggY2hhcnQgd2lkdGhcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LmhlaWdodCBjaGFydCBoZWlnaHRcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmNoYXJ0LnRpdGxlIGNoYXJ0IHRpdGxlXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC5mb3JtYXQgdmFsdWUgZm9ybWF0XG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnNlcmllcyBvcHRpb25zIG9mIHNlcmllc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuc2VyaWVzLmxlZ2VuZFR5cGUgbGVnZW5kIHR5cGVcbiAqICAgICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5zZXJpZXMuc2hvd0xhYmVsIHdoZXRoZXIgc2hvdyBsYWJlbCBvciBub3RcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMudG9vbHRpcCBvcHRpb25zIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAuc3VmZml4IHN1ZmZpeCBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnRlbXBsYXRlIHRlbXBsYXRlIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAucG9zaXRpb24gdG9vbHRpcCBwb3NpdGlvbiB0eXBlXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uIGFkZCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24ubGVmdCBhZGQgbGVmdCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24udG9wIGFkZCB0b3AgcG9zaXRpb25cbiAqICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudGhlbWUgdGhlbWUgbmFtZVxuICogICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5saWJUeXBlIGdyYXBoIGxpYnJhcnkgdHlwZVxuICogQHJldHVybnMge29iamVjdH0gYmFyIGNoYXJ0XG4gKiBAZXhhbXBsZVxuICogdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWluZXItaWQnKSxcbiAqICAgICBkYXRhID0ge1xuICogICAgICAgc2VyaWVzOiBbXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMScsXG4gKiAgICAgICAgICAgZGF0YTogMjBcbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQyJyxcbiAqICAgICAgICAgICBkYXRhOiA0MFxuICogICAgICAgICB9LFxuICogICAgICAgICB7XG4gKiAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDMnLFxuICogICAgICAgICAgIGRhdGE6IDYwXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kNCcsXG4gKiAgICAgICAgICAgZGF0YTogODBcbiAqICAgICAgICAgfVxuICogICAgICAgXVxuICogICAgIH0sXG4gKiAgICAgb3B0aW9ucyA9IHtcbiAqICAgICAgIGNoYXJ0OiB7XG4gKiAgICAgICAgIHRpdGxlOiAnUGllIENoYXJ0J1xuICogICAgICAgfVxuICogICAgIH07XG4gKiBuZS5hcHBsaWNhdGlvbi5jaGFydC5waWVDaGFydChjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpO1xuICovXG5uZS5hcHBsaWNhdGlvbi5jaGFydC5waWVDaGFydCA9IGZ1bmN0aW9uKGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIG9wdGlvbnMuY2hhcnRUeXBlID0gY2hhcnRDb25zdC5DSEFSVF9UWVBFX1BJRTtcbiAgICByZXR1cm4gX2NyZWF0ZUNoYXJ0KGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucyk7XG59O1xuXG4vKipcbiAqIFJlZ2lzdGVyIHRoZW1lLlxuICogQG1lbWJlck9mIG5lLmFwcGxpY2F0aW9uLmNoYXJ0XG4gKiBAcGFyYW0ge3N0cmluZ30gdGhlbWVOYW1lIHRoZW1lIG5hbWVcbiAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBhcHBsaWNhdGlvbiBjaGFydCB0aGVtZVxuICogICAgICBAcGFyYW0ge29iamVjdH0gdGhlbWUuY2hhcnQgY2hhcnQgdGhlbWVcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS5jaGFydC5mb250RmFtaWx5IGZvbnQgZmFtaWx5IG9mIGNoYXJ0XG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUuY2hhcnQuYmFja2dyb3VuZCBiYWNrZ3JvdW5kIG9mIGNoYXJ0XG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSB0aGVtZS50aXRsZSBjaGFydCB0aGVtZVxuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IHRoZW1lLnRpdGxlLmZvbnRTaXplIGZvbnQgc2l6ZSBvZiBjaGFydCB0aXRsZVxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnRpdGxlLmZvbnRGYW1pbHkgZm9udCBmYW1pbHkgb2YgY2hhcnQgdGl0bGVcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS50aXRsZS5jb2xvciBmb250IGNvbG9yIG9mIGNoYXJ0IHRpdGxlXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUudGl0bGUuYmFja2dyb3VuZCBiYWNrZ3JvdW5kIG9mIGNoYXJ0IHRpdGxlXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSB0aGVtZS55QXhpcyB0aGVtZSBvZiB2ZXJ0aWNhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gdGhlbWUueUF4aXMudGl0bGUgdGhlbWUgb2YgdmVydGljYWwgYXhpcyB0aXRsZVxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSB0aGVtZS55QXhpcy50aXRsZS5mb250U2l6ZSBmb250IHNpemUgb2YgdmVydGljYWwgYXhpcyB0aXRsZVxuICogICAgICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS55QXhpcy50aXRsZS5mb250RmFtaWx5IGZvbnQgZmFtaWx5IG9mIHZlcnRpY2FsIGF4aXMgdGl0bGVcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUueUF4aXMudGl0bGUuY29sb3IgZm9udCBjb2xvciBvZiB2ZXJ0aWNhbCBheGlzIHRpdGxlXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gdGhlbWUueUF4aXMubGFiZWwgdGhlbWUgb2YgdmVydGljYWwgYXhpcyBsYWJlbFxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSB0aGVtZS55QXhpcy5sYWJlbC5mb250U2l6ZSBmb250IHNpemUgb2YgdmVydGljYWwgYXhpcyBsYWJlbFxuICogICAgICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS55QXhpcy5sYWJlbC5mb250RmFtaWx5IGZvbnQgZmFtaWx5IG9mIHZlcnRpY2FsIGF4aXMgbGFiZWxcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUueUF4aXMubGFiZWwuY29sb3IgZm9udCBjb2xvciBvZiB2ZXJ0aWNhbCBheGlzIGxhYmVsXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUueUF4aXMudGlja2NvbG9yIGNvbG9yIG9mIHZlcnRpY2FsIGF4aXMgdGlja1xuICogICAgICBAcGFyYW0ge29iamVjdH0gdGhlbWUueEF4aXMgdGhlbWUgb2YgaG9yaXpvbnRhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gdGhlbWUueEF4aXMudGl0bGUgdGhlbWUgb2YgaG9yaXpvbnRhbCBheGlzIHRpdGxlXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IHRoZW1lLnhBeGlzLnRpdGxlLmZvbnRTaXplIGZvbnQgc2l6ZSBvZiBob3Jpem9udGFsIGF4aXMgdGl0bGVcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUueEF4aXMudGl0bGUuZm9udEZhbWlseSBmb250IGZhbWlseSBvZiBob3Jpem9udGFsIGF4aXMgdGl0bGVcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUueEF4aXMudGl0bGUuY29sb3IgZm9udCBjb2xvciBvZiBob3Jpem9udGFsIGF4aXMgdGl0bGVcbiAqICAgICAgICAgIEBwYXJhbSB7b2JqZWN0fSB0aGVtZS54QXhpcy5sYWJlbCB0aGVtZSBvZiBob3Jpem9udGFsIGF4aXMgbGFiZWxcbiAqICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gdGhlbWUueEF4aXMubGFiZWwuZm9udFNpemUgZm9udCBzaXplIG9mIGhvcml6b250YWwgYXhpcyBsYWJlbFxuICogICAgICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS54QXhpcy5sYWJlbC5mb250RmFtaWx5IGZvbnQgZmFtaWx5IG9mIGhvcml6b250YWwgYXhpcyBsYWJlbFxuICogICAgICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS54QXhpcy5sYWJlbC5jb2xvciBmb250IGNvbG9yIG9mIGhvcml6b250YWwgYXhpcyBsYWJlbFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnhBeGlzLnRpY2tjb2xvciBjb2xvciBvZiBob3Jpem9udGFsIGF4aXMgdGlja1xuICogICAgICBAcGFyYW0ge29iamVjdH0gdGhlbWUucGxvdCBwbG90IHRoZW1lXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUucGxvdC5saW5lQ29sb3IgcGxvdCBsaW5lIGNvbG9yXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUucGxvdC5iYWNrZ3JvdW5kIHBsb3QgYmFja2dyb3VuZFxuICogICAgICBAcGFyYW0ge29iamVjdH0gdGhlbWUuc2VyaWVzIHNlcmllcyB0aGVtZVxuICogICAgICAgICAgQHBhcmFtIHthcnJheS48c3RyaW5nPn0gdGhlbWUuc2VyaWVzLmNvbG9ycyBzZXJpZXMgY29sb3JzXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUuc2VyaWVzLmJvcmRlckNvbG9yIHNlcmllcyBib3JkZXIgY29sb3JcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IHRoZW1lLmxlZ2VuZCBsZWdlbmQgdGhlbWVcbiAqICAgICAgICAgIEBwYXJhbSB7b2JqZWN0fSB0aGVtZS5sZWdlbmQubGFiZWwgdGhlbWUgb2YgbGVnZW5kIGxhYmVsXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IHRoZW1lLmxlZ2VuZC5sYWJlbC5mb250U2l6ZSBmb250IHNpemUgb2YgbGVnZW5kIGxhYmVsXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLmxlZ2VuZC5sYWJlbC5mb250RmFtaWx5IGZvbnQgZmFtaWx5IG9mIGxlZ2VuZCBsYWJlbFxuICogICAgICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS5sZWdlbmQubGFiZWwuY29sb3IgZm9udCBjb2xvciBvZiBsZWdlbmQgbGFiZWxcbiAqIEBleGFtcGxlXG4gKiB2YXIgdGhlbWUgPSB7XG4gKiAgIHlBeGlzOiB7XG4gKiAgICAgdGlja0NvbG9yOiAnI2NjYmQ5YScsXG4gKiAgICAgICB0aXRsZToge1xuICogICAgICAgICBjb2xvcjogJyMzMzMzMzMnXG4gKiAgICAgICB9LFxuICogICAgICAgbGFiZWw6IHtcbiAqICAgICAgICAgY29sb3I6ICcjNmY0OTFkJ1xuICogICAgICAgfVxuICogICAgIH0sXG4gKiAgICAgeEF4aXM6IHtcbiAqICAgICAgIHRpY2tDb2xvcjogJyNjY2JkOWEnLFxuICogICAgICAgdGl0bGU6IHtcbiAqICAgICAgICAgY29sb3I6ICcjMzMzMzMzJ1xuICogICAgICAgfSxcbiAqICAgICAgIGxhYmVsOiB7XG4gKiAgICAgICAgIGNvbG9yOiAnIzZmNDkxZCdcbiAqICAgICAgIH1cbiAqICAgICB9LFxuICogICAgIHBsb3Q6IHtcbiAqICAgICAgIGxpbmVDb2xvcjogJyNlNWRiYzQnLFxuICogICAgICAgYmFja2dyb3VuZDogJyNmNmYxZTUnXG4gKiAgICAgfSxcbiAqICAgICBzZXJpZXM6IHtcbiAqICAgICAgIGNvbG9yczogWycjNDBhYmI0JywgJyNlNzhhMzEnLCAnI2MxYzQ1MicsICcjNzk1MjI0JywgJyNmNWY1ZjUnXSxcbiAqICAgICAgIGJvcmRlckNvbG9yOiAnIzhlNjUzNSdcbiAqICAgICB9LFxuICogICAgIGxlZ2VuZDoge1xuICogICAgICAgbGFiZWw6IHtcbiAqICAgICAgICAgY29sb3I6ICcjNmY0OTFkJ1xuICogICAgICAgfVxuICogICAgIH1cbiAqICAgfTtcbiAqIGNoYXJ0LnJlZ2lzdGVyVGhlbWUoJ25ld1RoZW1lJywgdGhlbWUpO1xuICovXG5uZS5hcHBsaWNhdGlvbi5jaGFydC5yZWdpc3RlclRoZW1lID0gZnVuY3Rpb24odGhlbWVOYW1lLCB0aGVtZSkge1xuICAgIHRoZW1lRmFjdG9yeS5yZWdpc3Rlcih0aGVtZU5hbWUsIHRoZW1lKTtcbn07XG5cbi8qKlxuICogUmVnaXN0ZXIgZ3JhcGggcGx1Z2luLlxuICogQG1lbWJlck9mIG5lLmFwcGxpY2F0aW9uLmNoYXJ0XG4gKiBAcGFyYW0ge3N0cmluZ30gbGliVHlwZSB0eXBlIG9mIGdyYXBoIGxpYnJhcnlcbiAqIEBwYXJhbSB7b2JqZWN0fSBwbHVnaW4gcGx1Z2luIHRvIGNvbnRyb2wgbGlicmFyeVxuICogQGV4YW1wbGVcbiAqIHZhciBwbHVnaW5SYXBoYWVsID0ge1xuICogICBiYXI6IGZ1bmN0aW9uKCkge30gLy8gUmVuZGVyIGNsYXNzXG4gKiB9O1xuICogbmUuYXBwbGljYXRpb24uY2hhcnQucmVnaXN0ZXJQbHVnaW4oJ3JhcGhhZWwnLCBwbHVnaW5SYXBoYWVsKTtcbiAqL1xubmUuYXBwbGljYXRpb24uY2hhcnQucmVnaXN0ZXJQbHVnaW4gPSBmdW5jdGlvbihsaWJUeXBlLCBwbHVnaW4pIHtcbiAgICBwbHVnaW5GYWN0b3J5LnJlZ2lzdGVyKGxpYlR5cGUsIHBsdWdpbik7XG59O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEFyZWEgY2hhcnRcbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIENoYXJ0QmFzZSA9IHJlcXVpcmUoJy4vY2hhcnRCYXNlJyksXG4gICAgQXhpc1R5cGVCYXNlID0gcmVxdWlyZSgnLi9heGlzVHlwZUJhc2UnKSxcbiAgICBWZXJ0aWNhbFR5cGVCYXNlID0gcmVxdWlyZSgnLi92ZXJ0aWNhbFR5cGVCYXNlJyksXG4gICAgY2FsY3VsYXRvciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvY2FsY3VsYXRvcicpLFxuICAgIFNlcmllcyA9IHJlcXVpcmUoJy4uL3Nlcmllcy9hcmVhQ2hhcnRTZXJpZXMnKTtcblxudmFyIEFyZWFDaGFydCA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoQ2hhcnRCYXNlLCAvKiogQGxlbmRzIEFyZWFDaGFydC5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIExpbmUgY2hhcnQuXG4gICAgICogQGNvbnN0cnVjdHMgQXJlYUNoYXJ0XG4gICAgICogQGV4dGVuZHMgQ2hhcnRCYXNlXG4gICAgICogQG1peGVzIEF4aXNUeXBlQmFzZVxuICAgICAqIEBtaXhlcyBWZXJ0aWNhbFR5cGVCYXNlXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXk+fSB1c2VyRGF0YSBjaGFydCBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIGNoYXJ0IHRoZW1lXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBpbml0ZWREYXRhIGluaXRpYWxpemVkIGRhdGEgZnJvbSBjb21ibyBjaGFydFxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKHVzZXJEYXRhLCB0aGVtZSwgb3B0aW9ucywgaW5pdGVkRGF0YSkge1xuICAgICAgICB2YXIgYmFzZURhdGEgPSBpbml0ZWREYXRhIHx8IHRoaXMubWFrZUJhc2VEYXRhKHVzZXJEYXRhLCB0aGVtZSwgb3B0aW9ucywge1xuICAgICAgICAgICAgICAgIGlzVmVydGljYWw6IHRydWUsXG4gICAgICAgICAgICAgICAgaGFzQXhlczogdHJ1ZVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBjb252ZXJ0RGF0YSA9IGJhc2VEYXRhLmNvbnZlcnREYXRhLFxuICAgICAgICAgICAgYm91bmRzID0gYmFzZURhdGEuYm91bmRzLFxuICAgICAgICAgICAgYXhpc0RhdGE7XG5cbiAgICAgICAgdGhpcy5jbGFzc05hbWUgPSAnbmUtbGluZS1hcmVhJztcblxuICAgICAgICBDaGFydEJhc2UuY2FsbCh0aGlzLCBib3VuZHMsIHRoZW1lLCBvcHRpb25zLCBpbml0ZWREYXRhKTtcblxuICAgICAgICBheGlzRGF0YSA9IHRoaXMuX21ha2VBeGVzRGF0YShjb252ZXJ0RGF0YSwgYm91bmRzLCBvcHRpb25zLCBpbml0ZWREYXRhKTtcbiAgICAgICAgdGhpcy5fYWRkQ29tcG9uZW50cyhjb252ZXJ0RGF0YSwgYXhpc0RhdGEsIG9wdGlvbnMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgY29tcG9uZW50c1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb252ZXJ0RGF0YSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBheGVzRGF0YSBheGVzIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYWRkQ29tcG9uZW50czogZnVuY3Rpb24oY29udmVydERhdGEsIGF4ZXNEYXRhLCBvcHRpb25zKSB7XG4gICAgICAgIHRoaXMuYWRkQXhpc0NvbXBvbmVudHMoe1xuICAgICAgICAgICAgY29udmVydERhdGE6IGNvbnZlcnREYXRhLFxuICAgICAgICAgICAgYXhlczogYXhlc0RhdGEsXG4gICAgICAgICAgICBwbG90RGF0YTogIW5lLnV0aWwuaXNVbmRlZmluZWQoY29udmVydERhdGEucGxvdERhdGEpID8gY29udmVydERhdGEucGxvdERhdGEgOiB7XG4gICAgICAgICAgICAgICAgdlRpY2tDb3VudDogYXhlc0RhdGEueUF4aXMudmFsaWRUaWNrQ291bnQsXG4gICAgICAgICAgICAgICAgaFRpY2tDb3VudDogYXhlc0RhdGEueEF4aXMudmFsaWRUaWNrQ291bnRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjaGFydFR5cGU6IG9wdGlvbnMuY2hhcnRUeXBlLFxuICAgICAgICAgICAgU2VyaWVzOiBTZXJpZXMsXG4gICAgICAgICAgICBzZXJpZXNEYXRhOiB7XG4gICAgICAgICAgICAgICAgYWxsb3dOZWdhdGl2ZVRvb2x0aXA6IHRydWUsXG4gICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZXM6IGNhbGN1bGF0b3IuYXJyYXlQaXZvdChjb252ZXJ0RGF0YS52YWx1ZXMpLFxuICAgICAgICAgICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXM6IGNhbGN1bGF0b3IuYXJyYXlQaXZvdChjb252ZXJ0RGF0YS5mb3JtYXR0ZWRWYWx1ZXMpLFxuICAgICAgICAgICAgICAgICAgICBzY2FsZTogYXhlc0RhdGEueUF4aXMuc2NhbGVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuXG5BeGlzVHlwZUJhc2UubWl4aW4oQXJlYUNoYXJ0KTtcblZlcnRpY2FsVHlwZUJhc2UubWl4aW4oQXJlYUNoYXJ0KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBcmVhQ2hhcnQ7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgQXhpc1R5cGVCYXNlIGlzIGJhc2UgY2xhc3Mgb2YgYXhpcyB0eXBlIGNoYXJ0KGJhciwgY29sdW1uLCBsaW5lLCBhcmVhKS5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIEF4aXMgPSByZXF1aXJlKCcuLi9heGVzL2F4aXMuanMnKSxcbiAgICBQbG90ID0gcmVxdWlyZSgnLi4vcGxvdHMvcGxvdC5qcycpLFxuICAgIExlZ2VuZCA9IHJlcXVpcmUoJy4uL2xlZ2VuZHMvbGVnZW5kLmpzJyksXG4gICAgVG9vbHRpcCA9IHJlcXVpcmUoJy4uL3Rvb2x0aXBzL3Rvb2x0aXAuanMnKTtcblxuLyoqXG4gKiBAY2xhc3NkZXNjIEF4aXNUeXBlQmFzZSBpcyBiYXNlIGNsYXNzIG9mIGF4aXMgdHlwZSBjaGFydChiYXIsIGNvbHVtbiwgbGluZSwgYXJlYSkuXG4gKiBAY2xhc3MgQXhpc1R5cGVCYXNlXG4gKiBAbWl4aW5cbiAqL1xudmFyIEF4aXNUeXBlQmFzZSA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBBeGlzVHlwZUJhc2UucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBBZGQgYXhpcyBjb21wb25lbnRzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmNvdmVydERhdGEgY29udmVydGVkIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuYXhlcyBheGVzIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMucGxvdERhdGEgcGxvdCBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge2Z1bmN0aW9ufSBwYXJhbXMuU2VyaWVzIHNlcmllcyBjbGFzc1xuICAgICAqL1xuICAgIGFkZEF4aXNDb21wb25lbnRzOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGNvbnZlcnREYXRhID0gcGFyYW1zLmNvbnZlcnREYXRhLFxuICAgICAgICAgICAgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcblxuICAgICAgICBpZiAocGFyYW1zLnBsb3REYXRhKSB7XG4gICAgICAgICAgICB0aGlzLmFkZENvbXBvbmVudCgncGxvdCcsIFBsb3QsIHBhcmFtcy5wbG90RGF0YSk7XG4gICAgICAgIH1cblxuICAgICAgICBuZS51dGlsLmZvckVhY2gocGFyYW1zLmF4ZXMsIGZ1bmN0aW9uKGRhdGEsIG5hbWUpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KG5hbWUsIEF4aXMsIHtcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgaWYgKGNvbnZlcnREYXRhLmpvaW5MZWdlbmRMYWJlbHMpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KCdsZWdlbmQnLCBMZWdlbmQsIHtcbiAgICAgICAgICAgICAgICBqb2luTGVnZW5kTGFiZWxzOiBjb252ZXJ0RGF0YS5qb2luTGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgICAgIGxlZ2VuZExhYmVsczogY29udmVydERhdGEubGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgICAgIGNoYXJ0VHlwZTogcGFyYW1zLmNoYXJ0VHlwZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmFkZENvbXBvbmVudCgnc2VyaWVzJywgcGFyYW1zLlNlcmllcywgbmUudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgbGliVHlwZTogb3B0aW9ucy5saWJUeXBlLFxuICAgICAgICAgICAgY2hhcnRUeXBlOiBvcHRpb25zLmNoYXJ0VHlwZSxcbiAgICAgICAgICAgIHRvb2x0aXBQcmVmaXg6IHRoaXMudG9vbHRpcFByZWZpeFxuICAgICAgICB9LCBwYXJhbXMuc2VyaWVzRGF0YSkpO1xuXG4gICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KCd0b29sdGlwJywgVG9vbHRpcCwge1xuICAgICAgICAgICAgdmFsdWVzOiBjb252ZXJ0RGF0YS52YWx1ZXMsXG4gICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXM6IGNvbnZlcnREYXRhLmZvcm1hdHRlZFZhbHVlcyxcbiAgICAgICAgICAgIGxhYmVsczogY29udmVydERhdGEubGFiZWxzLFxuICAgICAgICAgICAgbGVnZW5kTGFiZWxzOiBjb252ZXJ0RGF0YS5sZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICBwcmVmaXg6IHRoaXMudG9vbHRpcFByZWZpeFxuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxuQXhpc1R5cGVCYXNlLm1peGluID0gZnVuY3Rpb24oZnVuYykge1xuICAgIG5lLnV0aWwuZXh0ZW5kKGZ1bmMucHJvdG90eXBlLCBBeGlzVHlwZUJhc2UucHJvdG90eXBlKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQXhpc1R5cGVCYXNlO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEJhciBjaGFydC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIENoYXJ0QmFzZSA9IHJlcXVpcmUoJy4vY2hhcnRCYXNlJyksXG4gICAgQXhpc1R5cGVCYXNlID0gcmVxdWlyZSgnLi9heGlzVHlwZUJhc2UnKSxcbiAgICBheGlzRGF0YU1ha2VyID0gcmVxdWlyZSgnLi4vaGVscGVycy9heGlzRGF0YU1ha2VyJyksXG4gICAgU2VyaWVzID0gcmVxdWlyZSgnLi4vc2VyaWVzL2JhckNoYXJ0U2VyaWVzJyk7XG5cbnZhciBCYXJDaGFydCA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoQ2hhcnRCYXNlLCAvKiogQGxlbmRzIEJhckNoYXJ0LnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogQmFyIGNoYXJ0LlxuICAgICAqIEBjb25zdHJ1Y3RzIEJhckNoYXJ0XG4gICAgICogQGV4dGVuZHMgQ2hhcnRCYXNlXG4gICAgICogQG1peGVzIEF4aXNUeXBlQmFzZVxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gdXNlckRhdGEgY2hhcnQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBjaGFydCB0aGVtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbih1c2VyRGF0YSwgdGhlbWUsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIGJhc2VEYXRhID0gdGhpcy5tYWtlQmFzZURhdGEodXNlckRhdGEsIHRoZW1lLCBvcHRpb25zLCB7XG4gICAgICAgICAgICAgICAgaGFzQXhlczogdHJ1ZVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBjb252ZXJ0RGF0YSA9IGJhc2VEYXRhLmNvbnZlcnREYXRhLFxuICAgICAgICAgICAgYm91bmRzID0gYmFzZURhdGEuYm91bmRzLFxuICAgICAgICAgICAgYXhpc0RhdGE7XG5cbiAgICAgICAgdGhpcy5jbGFzc05hbWUgPSAnbmUtYmFyLWNoYXJ0JztcblxuICAgICAgICBDaGFydEJhc2UuY2FsbCh0aGlzLCBib3VuZHMsIHRoZW1lLCBvcHRpb25zKTtcblxuICAgICAgICBheGlzRGF0YSA9IHRoaXMuX21ha2VBeGVzRGF0YShjb252ZXJ0RGF0YSwgYm91bmRzLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5fYWRkQ29tcG9uZW50cyhjb252ZXJ0RGF0YSwgYXhpc0RhdGEsIG9wdGlvbnMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGF4ZXMgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb252ZXJ0RGF0YSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBib3VuZHMgY2hhcnQgYm91bmRzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IGF4ZXMgZGF0YVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VBeGVzRGF0YTogZnVuY3Rpb24oY29udmVydERhdGEsIGJvdW5kcywgb3B0aW9ucykge1xuICAgICAgICB2YXIgYXhlc0RhdGEgPSB7XG4gICAgICAgICAgICB5QXhpczogYXhpc0RhdGFNYWtlci5tYWtlTGFiZWxBeGlzRGF0YSh7XG4gICAgICAgICAgICAgICAgbGFiZWxzOiBjb252ZXJ0RGF0YS5sYWJlbHMsXG4gICAgICAgICAgICAgICAgaXNWZXJ0aWNhbDogdHJ1ZVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICB4QXhpczogYXhpc0RhdGFNYWtlci5tYWtlVmFsdWVBeGlzRGF0YSh7XG4gICAgICAgICAgICAgICAgdmFsdWVzOiBjb252ZXJ0RGF0YS52YWx1ZXMsXG4gICAgICAgICAgICAgICAgc2VyaWVzRGltZW5zaW9uOiBib3VuZHMuc2VyaWVzLmRpbWVuc2lvbixcbiAgICAgICAgICAgICAgICBzdGFja2VkOiBvcHRpb25zLnNlcmllcyAmJiBvcHRpb25zLnNlcmllcy5zdGFja2VkIHx8ICcnLFxuICAgICAgICAgICAgICAgIGNoYXJ0VHlwZTogb3B0aW9ucy5jaGFydFR5cGUsXG4gICAgICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zOiBjb252ZXJ0RGF0YS5mb3JtYXRGdW5jdGlvbnMsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogb3B0aW9ucy54QXhpc1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGF4ZXNEYXRhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgY29tcG9uZW50c1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb252ZXJ0RGF0YSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBheGVzRGF0YSBheGVzIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYWRkQ29tcG9uZW50czogZnVuY3Rpb24oY29udmVydERhdGEsIGF4ZXNEYXRhLCBvcHRpb25zKSB7XG4gICAgICAgIHRoaXMuYWRkQXhpc0NvbXBvbmVudHMoe1xuICAgICAgICAgICAgY29udmVydERhdGE6IGNvbnZlcnREYXRhLFxuICAgICAgICAgICAgYXhlczogYXhlc0RhdGEsXG4gICAgICAgICAgICBwbG90RGF0YToge1xuICAgICAgICAgICAgICAgIHZUaWNrQ291bnQ6IGF4ZXNEYXRhLnlBeGlzLnZhbGlkVGlja0NvdW50LFxuICAgICAgICAgICAgICAgIGhUaWNrQ291bnQ6IGF4ZXNEYXRhLnhBeGlzLnZhbGlkVGlja0NvdW50XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2hhcnRUeXBlOiBvcHRpb25zLmNoYXJ0VHlwZSxcbiAgICAgICAgICAgIFNlcmllczogU2VyaWVzLFxuICAgICAgICAgICAgc2VyaWVzRGF0YToge1xuICAgICAgICAgICAgICAgIGFsbG93TmVnYXRpdmVUb29sdGlwOiB0cnVlLFxuICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzOiBjb252ZXJ0RGF0YS52YWx1ZXMsXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlczogY29udmVydERhdGEuZm9ybWF0dGVkVmFsdWVzLFxuICAgICAgICAgICAgICAgICAgICBmb3JtYXRGdW5jdGlvbnM6IGNvbnZlcnREYXRhLmZvcm1hdEZ1bmN0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgc2NhbGU6IGF4ZXNEYXRhLnhBeGlzLnNjYWxlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxuQXhpc1R5cGVCYXNlLm1peGluKEJhckNoYXJ0KTtcblxubW9kdWxlLmV4cG9ydHMgPSBCYXJDaGFydDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBDaGFydEJhc2VcbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGRvbSA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZG9tSGFuZGxlci5qcycpLFxuICAgIHJlbmRlclV0aWwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3JlbmRlclV0aWwuanMnKSxcbiAgICBkYXRhQ29udmVydGVyID0gcmVxdWlyZSgnLi4vaGVscGVycy9kYXRhQ29udmVydGVyLmpzJyksXG4gICAgYm91bmRzTWFrZXIgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2JvdW5kc01ha2VyLmpzJyk7XG5cbnZhciBUT09MVElQX1BSRUZJWCA9ICduZS1jaGFydC10b29sdGlwLSc7XG5cbnZhciBDaGFydEJhc2UgPSBuZS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgQ2hhcnRCYXNlLnByb3RvdHlwZSAqLyB7XG4gICAgdG9vbHRpcFByZWZpeDogVE9PTFRJUF9QUkVGSVggKyAobmV3IERhdGUoKSkuZ2V0VGltZSgpICsgJy0nLFxuXG4gICAgLyoqXG4gICAgICogQ2hhcnQgYmFzZS5cbiAgICAgKiBAY29uc3RydWN0cyBDaGFydEJhc2VcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYm91bmRzIGNoYXJ0IGJvdW5kc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBjaGFydCB0aGVtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gaW5pdGVkRGF0YSBpbml0aWFsaXplZCBkYXRhIGZyb20gY29tYm8gY2hhcnRcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihib3VuZHMsIHRoZW1lLCBvcHRpb25zLCBpbml0ZWREYXRhKSB7XG4gICAgICAgIHRoaXMuY29tcG9uZW50cyA9IFtdO1xuICAgICAgICB0aGlzLmNvbXBvbmVudE1hcCA9IHt9O1xuICAgICAgICB0aGlzLmJvdW5kcyA9IGJvdW5kcztcbiAgICAgICAgdGhpcy50aGVtZSA9IHRoZW1lO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgICAgICBpZiAoaW5pdGVkRGF0YSAmJiBpbml0ZWREYXRhLnByZWZpeCkge1xuICAgICAgICAgICAgdGhpcy50b29sdGlwUHJlZml4ICs9IGluaXRlZERhdGEucHJlZml4O1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYmFlcyBkYXRhLlxuICAgICAqIEBwYXJhbSB7YXJyYXkgfCBvYmplY3R9IHVzZXJEYXRhIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBjaGFydCB0aGVtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYm91bmRQYXJhbXMgYWRkIGJvdW5kIHBhcmFtc1xuICAgICAqIEByZXR1cm5zIHt7Y29udmVydERhdGE6IG9iamVjdCwgYm91bmRzOiBvYmplY3R9fSBiYXNlIGRhdGFcbiAgICAgKi9cbiAgICBtYWtlQmFzZURhdGE6IGZ1bmN0aW9uKHVzZXJEYXRhLCB0aGVtZSwgb3B0aW9ucywgYm91bmRQYXJhbXMpIHtcbiAgICAgICAgdmFyIGNvbnZlcnREYXRhID0gZGF0YUNvbnZlcnRlci5jb252ZXJ0KHVzZXJEYXRhLCBvcHRpb25zLmNoYXJ0LCBvcHRpb25zLmNoYXJ0VHlwZSksXG4gICAgICAgICAgICBib3VuZHMgPSBib3VuZHNNYWtlci5tYWtlKG5lLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICBjaGFydFR5cGU6IG9wdGlvbnMuY2hhcnRUeXBlLFxuICAgICAgICAgICAgICAgIGNvbnZlcnREYXRhOiBjb252ZXJ0RGF0YSxcbiAgICAgICAgICAgICAgICB0aGVtZTogdGhlbWUsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgICAgICAgICAgfSwgYm91bmRQYXJhbXMpKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY29udmVydERhdGE6IGNvbnZlcnREYXRhLFxuICAgICAgICAgICAgYm91bmRzOiBib3VuZHNcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIGNvbXBvbmVudC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBjb21wb25lbnQgbmFtZVxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IENvbXBvbmVudCBjb21wb25lbnQgZnVuY3Rpb25cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKi9cbiAgICBhZGRDb21wb25lbnQ6IGZ1bmN0aW9uKG5hbWUsIENvbXBvbmVudCwgcGFyYW1zKSB7XG4gICAgICAgIHZhciBib3VuZCA9IHRoaXMuYm91bmRzW25hbWVdLFxuICAgICAgICAgICAgdGhlbWUgPSB0aGlzLnRoZW1lW25hbWVdLFxuICAgICAgICAgICAgb3B0aW9ucyA9IHRoaXMub3B0aW9uc1tuYW1lXSxcbiAgICAgICAgICAgIGluZGV4ID0gcGFyYW1zLmluZGV4IHx8IDAsXG4gICAgICAgICAgICBjb21tb25QYXJhbXMgPSB7fSxcbiAgICAgICAgICAgIGNvbXBvbmVudDtcblxuICAgICAgICBjb21tb25QYXJhbXMuYm91bmQgPSBuZS51dGlsLmlzQXJyYXkoYm91bmQpID8gYm91bmRbaW5kZXhdIDogYm91bmQ7XG4gICAgICAgIGNvbW1vblBhcmFtcy50aGVtZSA9IG5lLnV0aWwuaXNBcnJheSh0aGVtZSkgPyB0aGVtZVtpbmRleF0gOiB0aGVtZTtcbiAgICAgICAgY29tbW9uUGFyYW1zLm9wdGlvbnMgPSBuZS51dGlsLmlzQXJyYXkob3B0aW9ucykgPyBvcHRpb25zW2luZGV4XSA6IG9wdGlvbnMgfHwge307XG5cbiAgICAgICAgcGFyYW1zID0gbmUudXRpbC5leHRlbmQoY29tbW9uUGFyYW1zLCBwYXJhbXMpO1xuICAgICAgICBjb21wb25lbnQgPSBuZXcgQ29tcG9uZW50KHBhcmFtcyk7XG4gICAgICAgIHRoaXMuY29tcG9uZW50cy5wdXNoKGNvbXBvbmVudCk7XG4gICAgICAgIHRoaXMuY29tcG9uZW50TWFwW25hbWVdID0gY29tcG9uZW50O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgY2hhcnQuXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgY2hhcnQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciBvYmplY3QgZm9yIGdyYXBoIGRyYXdpbmdcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IGNoYXJ0IGVsZW1lbnRcbiAgICAgKi9cbiAgICByZW5kZXI6IGZ1bmN0aW9uKGVsLCBwYXBlcikge1xuICAgICAgICBpZiAoIWVsKSB7XG4gICAgICAgICAgICBlbCA9IGRvbS5jcmVhdGUoJ0RJVicsIHRoaXMuY2xhc3NOYW1lKTtcblxuICAgICAgICAgICAgZG9tLmFkZENsYXNzKGVsLCAnbmUtY2hhcnQnKTtcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlclRpdGxlKGVsKTtcbiAgICAgICAgICAgIHJlbmRlclV0aWwucmVuZGVyRGltZW5zaW9uKGVsLCB0aGlzLmJvdW5kcy5jaGFydC5kaW1lbnNpb24pO1xuICAgICAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJCYWNrZ3JvdW5kKGVsLCB0aGlzLnRoZW1lLmNoYXJ0LmJhY2tncm91bmQpO1xuICAgICAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJGb250RmFtaWx5KGVsLCB0aGlzLnRoZW1lLmNoYXJ0LmZvbnRGYW1pbHkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fcmVuZGVyQ29tcG9uZW50cyhlbCwgdGhpcy5jb21wb25lbnRzLCBwYXBlcik7XG4gICAgICAgIHRoaXMuX2F0dGFjaEN1c3RvbUV2ZW50KCk7XG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIHRpdGxlLlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyVGl0bGU6IGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgIHZhciBjaGFydE9wdGlvbnMgPSB0aGlzLm9wdGlvbnMuY2hhcnQgfHwge30sXG4gICAgICAgICAgICBlbFRpdGxlID0gcmVuZGVyVXRpbC5yZW5kZXJUaXRsZShjaGFydE9wdGlvbnMudGl0bGUsIHRoaXMudGhlbWUudGl0bGUsICduZS1jaGFydC10aXRsZScpO1xuICAgICAgICBkb20uYXBwZW5kKGVsLCBlbFRpdGxlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGNvbXBvbmVudHMuXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNvbnRhaW5lciBlbGVtZW50XG4gICAgICogQHBhcmFtIHthcnJheS48b2JqZWN0Pn0gY29tcG9uZW50cyBjb21wb25lbnRzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIG9iamVjdCBmb3IgZ3JhcGggZHJhd2luZ1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlckNvbXBvbmVudHM6IGZ1bmN0aW9uKGNvbnRhaW5lciwgY29tcG9uZW50cywgcGFwZXIpIHtcbiAgICAgICAgdmFyIGVsZW1lbnRzID0gbmUudXRpbC5tYXAoY29tcG9uZW50cywgZnVuY3Rpb24oY29tcG9uZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gY29tcG9uZW50LnJlbmRlcihwYXBlcik7XG4gICAgICAgIH0pO1xuICAgICAgICBkb20uYXBwZW5kKGNvbnRhaW5lciwgZWxlbWVudHMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgcGFwZXIuXG4gICAgICogQHJldHVybnMge29iamVjdH0gcGFwZXJcbiAgICAgKi9cbiAgICBnZXRQYXBlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZXJpZXMgPSB0aGlzLmNvbXBvbmVudE1hcC5zZXJpZXMsXG4gICAgICAgICAgICBwYXBlcjtcblxuICAgICAgICBpZiAoc2VyaWVzKSB7XG4gICAgICAgICAgICBwYXBlciA9IHNlcmllcy5nZXRQYXBlcigpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhcGVyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggY3VzdG9tIGV2ZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYXR0YWNoQ3VzdG9tRXZlbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdG9vbHRpcCA9IHRoaXMuY29tcG9uZW50TWFwLnRvb2x0aXAsXG4gICAgICAgICAgICBzZXJpZXMgPSB0aGlzLmNvbXBvbmVudE1hcC5zZXJpZXM7XG4gICAgICAgIGlmICghdG9vbHRpcCB8fCAhc2VyaWVzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc2VyaWVzLm9uKCdzaG93VG9vbHRpcCcsIHRvb2x0aXAub25TaG93LCB0b29sdGlwKTtcbiAgICAgICAgc2VyaWVzLm9uKCdoaWRlVG9vbHRpcCcsIHRvb2x0aXAub25IaWRlLCB0b29sdGlwKTtcblxuICAgICAgICBpZiAoIXNlcmllcy5vblNob3dBbmltYXRpb24pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRvb2x0aXAub24oJ3Nob3dBbmltYXRpb24nLCBzZXJpZXMub25TaG93QW5pbWF0aW9uLCBzZXJpZXMpO1xuICAgICAgICB0b29sdGlwLm9uKCdoaWRlQW5pbWF0aW9uJywgc2VyaWVzLm9uSGlkZUFuaW1hdGlvbiwgc2VyaWVzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQW5pbWF0ZSBjaGFydC5cbiAgICAgKi9cbiAgICBhbmltYXRlQ2hhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBuZS51dGlsLmZvckVhY2hBcnJheSh0aGlzLmNvbXBvbmVudHMsIGZ1bmN0aW9uKGNvbXBvbmVudCkge1xuICAgICAgICAgICAgaWYgKGNvbXBvbmVudC5hbmltYXRlQ29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LmFuaW1hdGVDb21wb25lbnQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENoYXJ0QmFzZTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBDb2x1bW4gY2hhcnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBDaGFydEJhc2UgPSByZXF1aXJlKCcuL2NoYXJ0QmFzZScpLFxuICAgIEF4aXNUeXBlQmFzZSA9IHJlcXVpcmUoJy4vYXhpc1R5cGVCYXNlJyksXG4gICAgVmVydGljYWxUeXBlQmFzZSA9IHJlcXVpcmUoJy4vdmVydGljYWxUeXBlQmFzZScpLFxuICAgIFNlcmllcyA9IHJlcXVpcmUoJy4uL3Nlcmllcy9jb2x1bW5DaGFydFNlcmllcycpO1xuXG52YXIgQ29sdW1uQ2hhcnQgPSBuZS51dGlsLmRlZmluZUNsYXNzKENoYXJ0QmFzZSwgLyoqIEBsZW5kcyBDb2x1bW5DaGFydC5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIENvbHVtbiBjaGFydC5cbiAgICAgKiBAY29uc3RydWN0cyBDb2x1bW5DaGFydFxuICAgICAqIEBleHRlbmRzIENoYXJ0QmFzZVxuICAgICAqIEBtaXhlcyBBeGlzVHlwZUJhc2VcbiAgICAgKiBAbWl4ZXMgVmVydGljYWxUeXBlQmFzZVxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gdXNlckRhdGEgY2hhcnQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBjaGFydCB0aGVtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gaW5pdGVkRGF0YSBpbml0aWFsaXplZCBkYXRhIGZyb20gY29tYm8gY2hhcnRcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbih1c2VyRGF0YSwgdGhlbWUsIG9wdGlvbnMsIGluaXRlZERhdGEpIHtcbiAgICAgICAgdmFyIGJhc2VEYXRhID0gaW5pdGVkRGF0YSB8fCB0aGlzLm1ha2VCYXNlRGF0YSh1c2VyRGF0YSwgdGhlbWUsIG9wdGlvbnMsIHtcbiAgICAgICAgICAgICAgICBpc1ZlcnRpY2FsOiB0cnVlLFxuICAgICAgICAgICAgICAgIGhhc0F4ZXM6IHRydWVcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgY29udmVydERhdGEgPSBiYXNlRGF0YS5jb252ZXJ0RGF0YSxcbiAgICAgICAgICAgIGJvdW5kcyA9IGJhc2VEYXRhLmJvdW5kcyxcbiAgICAgICAgICAgIGF4aXNEYXRhO1xuXG4gICAgICAgIHRoaXMuY2xhc3NOYW1lID0gJ25lLWNvbHVtbi1jaGFydCc7XG5cbiAgICAgICAgQ2hhcnRCYXNlLmNhbGwodGhpcywgYm91bmRzLCB0aGVtZSwgb3B0aW9ucywgaW5pdGVkRGF0YSk7XG5cbiAgICAgICAgYXhpc0RhdGEgPSB0aGlzLl9tYWtlQXhlc0RhdGEoY29udmVydERhdGEsIGJvdW5kcywgb3B0aW9ucywgaW5pdGVkRGF0YSk7XG4gICAgICAgIHRoaXMuX2FkZENvbXBvbmVudHMoY29udmVydERhdGEsIGF4aXNEYXRhLCBvcHRpb25zKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIGNvbXBvbmVudHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udmVydERhdGEgY29udmVydGVkIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYXhlc0RhdGEgYXhlcyBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2FkZENvbXBvbmVudHM6IGZ1bmN0aW9uKGNvbnZlcnREYXRhLCBheGVzRGF0YSwgb3B0aW9ucykge1xuICAgICAgICB0aGlzLmFkZEF4aXNDb21wb25lbnRzKHtcbiAgICAgICAgICAgIGNvbnZlcnREYXRhOiBjb252ZXJ0RGF0YSxcbiAgICAgICAgICAgIGF4ZXM6IGF4ZXNEYXRhLFxuICAgICAgICAgICAgcGxvdERhdGE6ICFuZS51dGlsLmlzVW5kZWZpbmVkKGNvbnZlcnREYXRhLnBsb3REYXRhKSA/IGNvbnZlcnREYXRhLnBsb3REYXRhIDoge1xuICAgICAgICAgICAgICAgIHZUaWNrQ291bnQ6IGF4ZXNEYXRhLnlBeGlzLnZhbGlkVGlja0NvdW50LFxuICAgICAgICAgICAgICAgIGhUaWNrQ291bnQ6IGF4ZXNEYXRhLnhBeGlzLnZhbGlkVGlja0NvdW50XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2hhcnRUeXBlOiBvcHRpb25zLmNoYXJ0VHlwZSxcbiAgICAgICAgICAgIFNlcmllczogU2VyaWVzLFxuICAgICAgICAgICAgc2VyaWVzRGF0YToge1xuICAgICAgICAgICAgICAgIGFsbG93TmVnYXRpdmVUb29sdGlwOiB0cnVlLFxuICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzOiBjb252ZXJ0RGF0YS52YWx1ZXMsXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlczogY29udmVydERhdGEuZm9ybWF0dGVkVmFsdWVzLFxuICAgICAgICAgICAgICAgICAgICBmb3JtYXRGdW5jdGlvbnM6IGNvbnZlcnREYXRhLmZvcm1hdEZ1bmN0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgc2NhbGU6IGF4ZXNEYXRhLnlBeGlzLnNjYWxlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxuQXhpc1R5cGVCYXNlLm1peGluKENvbHVtbkNoYXJ0KTtcblZlcnRpY2FsVHlwZUJhc2UubWl4aW4oQ29sdW1uQ2hhcnQpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbHVtbkNoYXJ0O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IENvbWJvIGNoYXJ0LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2FsY3VsYXRvciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvY2FsY3VsYXRvci5qcycpLFxuICAgIENoYXJ0QmFzZSA9IHJlcXVpcmUoJy4vY2hhcnRCYXNlLmpzJyksXG4gICAgYXhpc0RhdGFNYWtlciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvYXhpc0RhdGFNYWtlci5qcycpLFxuICAgIGRlZmF1bHRUaGVtZSA9IHJlcXVpcmUoJy4uL3RoZW1lcy9kZWZhdWx0VGhlbWUuanMnKSxcbiAgICBDb2x1bW5DaGFydCA9IHJlcXVpcmUoJy4vY29sdW1uQ2hhcnQnKSxcbiAgICBMaW5lQ2hhcnQgPSByZXF1aXJlKCcuL2xpbmVDaGFydCcpO1xuXG52YXIgQ29tYm9DaGFydCA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoQ2hhcnRCYXNlLCAvKiogQGxlbmRzIENvbWJvQ2hhcnQucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBDb21ibyBjaGFydC5cbiAgICAgKiBAY29uc3RydWN0cyBDb21ib0NoYXJ0XG4gICAgICogQGV4dGVuZHMgQ2hhcnRCYXNlXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXk+fSB1c2VyRGF0YSBjaGFydCBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIGNoYXJ0IHRoZW1lXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKHVzZXJEYXRhLCB0aGVtZSwgb3B0aW9ucykge1xuICAgICAgICB2YXIgc2VyaWVzQ2hhcnRUeXBlcyA9IG5lLnV0aWwua2V5cyh1c2VyRGF0YS5zZXJpZXMpLnNvcnQoKSxcbiAgICAgICAgICAgIG9wdGlvbkNoYXJ0VHlwZXMgPSB0aGlzLl9nZXRZQXhpc09wdGlvbkNoYXJ0VHlwZXMoc2VyaWVzQ2hhcnRUeXBlcywgb3B0aW9ucy55QXhpcyksXG4gICAgICAgICAgICBjaGFydFR5cGVzID0gb3B0aW9uQ2hhcnRUeXBlcy5sZW5ndGggPyBvcHRpb25DaGFydFR5cGVzIDogc2VyaWVzQ2hhcnRUeXBlcyxcbiAgICAgICAgICAgIGJhc2VEYXRhID0gdGhpcy5tYWtlQmFzZURhdGEodXNlckRhdGEsIHRoZW1lLCBvcHRpb25zLCB7XG4gICAgICAgICAgICAgICAgaXNWZXJ0aWNhbDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBoYXNBeGVzOiB0cnVlLFxuICAgICAgICAgICAgICAgIG9wdGlvbkNoYXJ0VHlwZXM6IG9wdGlvbkNoYXJ0VHlwZXNcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgY29udmVydERhdGEgPSBiYXNlRGF0YS5jb252ZXJ0RGF0YSxcbiAgICAgICAgICAgIGJvdW5kcyA9IGJhc2VEYXRhLmJvdW5kcyxcbiAgICAgICAgICAgIG9wdGlvbnNNYXAgPSB0aGlzLl9tYWtlT3B0aW9uc01hcChjaGFydFR5cGVzLCBvcHRpb25zKSxcbiAgICAgICAgICAgIHRoZW1lTWFwID0gdGhpcy5fbWFrZVRoZW1lTWFwKHNlcmllc0NoYXJ0VHlwZXMsIHRoZW1lLCBjb252ZXJ0RGF0YS5sZWdlbmRMYWJlbHMpLFxuICAgICAgICAgICAgeUF4aXNQYXJhbXMgPSB7XG4gICAgICAgICAgICAgICAgY29udmVydERhdGE6IGNvbnZlcnREYXRhLFxuICAgICAgICAgICAgICAgIHNlcmllc0RpbWVuc2lvbjogYm91bmRzLnNlcmllcy5kaW1lbnNpb24sXG4gICAgICAgICAgICAgICAgY2hhcnRUeXBlczogY2hhcnRUeXBlcyxcbiAgICAgICAgICAgICAgICBpc09uZVlBeGlzOiAhb3B0aW9uQ2hhcnRUeXBlcy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJhc2VBeGVzRGF0YSA9IHt9O1xuXG4gICAgICAgIHRoaXMuY2xhc3NOYW1lID0gJ25lLWNvbWJvLWNoYXJ0JztcblxuICAgICAgICBDaGFydEJhc2UuY2FsbCh0aGlzLCBib3VuZHMsIHRoZW1lLCBvcHRpb25zKTtcblxuICAgICAgICBiYXNlQXhlc0RhdGEueUF4aXMgPSB0aGlzLl9tYWtlWUF4aXNEYXRhKG5lLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgIGluZGV4OiAwXG4gICAgICAgIH0sIHlBeGlzUGFyYW1zKSk7XG5cbiAgICAgICAgYmFzZUF4ZXNEYXRhLnhBeGlzID0gYXhpc0RhdGFNYWtlci5tYWtlTGFiZWxBeGlzRGF0YSh7XG4gICAgICAgICAgICBsYWJlbHM6IGNvbnZlcnREYXRhLmxhYmVsc1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLl9pbnN0YWxsQ2hhcnRzKHtcbiAgICAgICAgICAgIHVzZXJEYXRhOiB1c2VyRGF0YSxcbiAgICAgICAgICAgIGJhc2VEYXRhOiBiYXNlRGF0YSxcbiAgICAgICAgICAgIGJhc2VBeGVzRGF0YTogYmFzZUF4ZXNEYXRhLFxuICAgICAgICAgICAgYXhlc0RhdGE6IHRoaXMuX21ha2VBeGVzRGF0YShiYXNlQXhlc0RhdGEsIHlBeGlzUGFyYW1zKSxcbiAgICAgICAgICAgIHNlcmllc0NoYXJ0VHlwZXM6IHNlcmllc0NoYXJ0VHlwZXMsXG4gICAgICAgICAgICBvcHRpb25zTWFwOiBvcHRpb25zTWFwLFxuICAgICAgICAgICAgdGhlbWVNYXA6IHRoZW1lTWFwXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgeSBheGlzIG9wdGlvbiBjaGFydCB0eXBlcy5cbiAgICAgKiBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBjaGFydFR5cGVzIGNoYXJ0IHR5cGVzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHlBeGlzT3B0aW9ucyB5IGF4aXMgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHthcnJheS48c3RyaW5nPn0gY2hhcnQgdHlwZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRZQXhpc09wdGlvbkNoYXJ0VHlwZXM6IGZ1bmN0aW9uKGNoYXJ0VHlwZXMsIHlBeGlzT3B0aW9ucykge1xuICAgICAgICB2YXIgcmVzdWx0Q2hhcnRUeXBlcyA9IGNoYXJ0VHlwZXMuc2xpY2UoKSxcbiAgICAgICAgICAgIGlzUmV2ZXJzZSA9IGZhbHNlLFxuICAgICAgICAgICAgb3B0aW9uQ2hhcnRUeXBlcztcblxuICAgICAgICB5QXhpc09wdGlvbnMgPSB5QXhpc09wdGlvbnMgPyBbXS5jb25jYXQoeUF4aXNPcHRpb25zKSA6IFtdO1xuXG4gICAgICAgIGlmICh5QXhpc09wdGlvbnMubGVuZ3RoID09PSAxICYmICF5QXhpc09wdGlvbnNbMF0uY2hhcnRUeXBlKSB7XG4gICAgICAgICAgICByZXN1bHRDaGFydFR5cGVzID0gW107XG4gICAgICAgIH0gZWxzZSBpZiAoeUF4aXNPcHRpb25zLmxlbmd0aCkge1xuICAgICAgICAgICAgb3B0aW9uQ2hhcnRUeXBlcyA9IG5lLnV0aWwubWFwKHlBeGlzT3B0aW9ucywgZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbi5jaGFydFR5cGU7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkob3B0aW9uQ2hhcnRUeXBlcywgZnVuY3Rpb24oY2hhcnRUeXBlLCBpbmRleCkge1xuICAgICAgICAgICAgICAgIGlzUmV2ZXJzZSA9IGlzUmV2ZXJzZSB8fCAoY2hhcnRUeXBlICYmIHJlc3VsdENoYXJ0VHlwZXNbaW5kZXhdICE9PSBjaGFydFR5cGUgfHwgZmFsc2UpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmIChpc1JldmVyc2UpIHtcbiAgICAgICAgICAgICAgICByZXN1bHRDaGFydFR5cGVzLnJldmVyc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHRDaGFydFR5cGVzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHkgYXhpcyBkYXRhLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5pbmRleCBjaGFydCBpbmRleFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5jb252ZXJ0RGF0YSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBwYXJhbXMuc2VyaWVzRGltZW5zaW9uIHNlcmllcyBkaW1lbnNpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGNoYXJ0VHlwZXMgY2hhcnQgdHlwZVxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBpc09uZVlBeGlzIHdoZXRoZXIgb25lIHNlcmllcyBvciBub3RcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBhZGRQYXJhbXMgYWRkIHBhcmFtc1xuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHkgYXhpcyBkYXRhXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVlBeGlzRGF0YTogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBjb252ZXJ0RGF0YSA9IHBhcmFtcy5jb252ZXJ0RGF0YSxcbiAgICAgICAgICAgIGluZGV4ID0gcGFyYW1zLmluZGV4LFxuICAgICAgICAgICAgY2hhcnRUeXBlID0gcGFyYW1zLmNoYXJ0VHlwZXNbaW5kZXhdLFxuICAgICAgICAgICAgb3B0aW9ucyA9IHBhcmFtcy5vcHRpb25zLFxuICAgICAgICAgICAgeUF4aXNWYWx1ZXMsIHlBeGlzT3B0aW9ucywgc2VyaWVzT3B0aW9uO1xuXG4gICAgICAgIGlmIChwYXJhbXMuaXNPbmVZQXhpcykge1xuICAgICAgICAgICAgeUF4aXNWYWx1ZXMgPSBjb252ZXJ0RGF0YS5qb2luVmFsdWVzO1xuICAgICAgICAgICAgeUF4aXNPcHRpb25zID0gW29wdGlvbnMueUF4aXNdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgeUF4aXNWYWx1ZXMgPSBjb252ZXJ0RGF0YS52YWx1ZXNbY2hhcnRUeXBlXTtcbiAgICAgICAgICAgIHlBeGlzT3B0aW9ucyA9IG9wdGlvbnMueUF4aXMgfHwgW107XG4gICAgICAgIH1cblxuICAgICAgICBzZXJpZXNPcHRpb24gPSBvcHRpb25zLnNlcmllcyAmJiBvcHRpb25zLnNlcmllc1tjaGFydFR5cGVdIHx8IG9wdGlvbnMuc2VyaWVzO1xuXG4gICAgICAgIHJldHVybiBheGlzRGF0YU1ha2VyLm1ha2VWYWx1ZUF4aXNEYXRhKG5lLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgIHZhbHVlczogeUF4aXNWYWx1ZXMsXG4gICAgICAgICAgICBzdGFja2VkOiBzZXJpZXNPcHRpb24gJiYgc2VyaWVzT3B0aW9uLnN0YWNrZWQgfHwgJycsXG4gICAgICAgICAgICBvcHRpb25zOiB5QXhpc09wdGlvbnNbaW5kZXhdLFxuICAgICAgICAgICAgY2hhcnRUeXBlOiBjaGFydFR5cGUsXG4gICAgICAgICAgICBzZXJpZXNEaW1lbnNpb246IHBhcmFtcy5zZXJpZXNEaW1lbnNpb24sXG4gICAgICAgICAgICBmb3JtYXRGdW5jdGlvbnM6IGNvbnZlcnREYXRhLmZvcm1hdEZ1bmN0aW9ucyxcbiAgICAgICAgICAgIGlzVmVydGljYWw6IHRydWVcbiAgICAgICAgfSwgcGFyYW1zLmFkZFBhcmFtcykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGF4ZXMgZGF0YS5cbiAgICAgKiBAcGFyYW0ge3t5QXhpczogb2JqZWN0LCB4QXhpczogb2JqZWN0fX0gYmFzZUF4ZXNEYXRhIGJhc2UgYXhlcyBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHlBeGlzUGFyYW1zIHkgYXhpcyBwYXJhbXNcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBheGVzIGRhdGFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQXhlc0RhdGE6IGZ1bmN0aW9uKGJhc2VBeGVzRGF0YSwgeUF4aXNQYXJhbXMpIHtcbiAgICAgICAgdmFyIHlBeGlzRGF0YSA9IGJhc2VBeGVzRGF0YS55QXhpcyxcbiAgICAgICAgICAgIGNoYXJ0VHlwZXMgPSB5QXhpc1BhcmFtcy5jaGFydFR5cGVzLFxuICAgICAgICAgICAgYXhlc0RhdGEgPSB7fSxcbiAgICAgICAgICAgIHlyQXhpc0RhdGE7XG4gICAgICAgIGlmICgheUF4aXNQYXJhbXMuaXNPbmVZQXhpcykge1xuICAgICAgICAgICAgeXJBeGlzRGF0YSA9IHRoaXMuX21ha2VZQXhpc0RhdGEobmUudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgICAgIGluZGV4OiAxLFxuICAgICAgICAgICAgICAgIGFkZFBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICBpc1Bvc2l0aW9uUmlnaHQ6IHRydWVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB5QXhpc1BhcmFtcykpO1xuICAgICAgICAgICAgaWYgKHlBeGlzRGF0YS50aWNrQ291bnQgPCB5ckF4aXNEYXRhLnRpY2tDb3VudCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luY3JlYXNlWUF4aXNUaWNrQ291bnQoeXJBeGlzRGF0YS50aWNrQ291bnQgLSB5QXhpc0RhdGEudGlja0NvdW50LCB5QXhpc0RhdGEpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh5QXhpc0RhdGEudGlja0NvdW50ID4geXJBeGlzRGF0YS50aWNrQ291bnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbmNyZWFzZVlBeGlzVGlja0NvdW50KHlBeGlzRGF0YS50aWNrQ291bnQgLSB5ckF4aXNEYXRhLnRpY2tDb3VudCwgeXJBeGlzRGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBheGVzRGF0YVtjaGFydFR5cGVzWzBdXSA9IGJhc2VBeGVzRGF0YTtcbiAgICAgICAgYXhlc0RhdGFbY2hhcnRUeXBlc1sxXV0gPSB7XG4gICAgICAgICAgICB5QXhpczogeXJBeGlzRGF0YSB8fCB5QXhpc0RhdGFcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gYXhlc0RhdGE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2Ugb3JkZXIgaW5mbyBhYm91bmQgY2hhcnQgdHlwZS5cbiAgICAgKiBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBjaGFydFR5cGVzIGNoYXJ0IHR5cGVzXG4gICAgICogQHJldHVybnMge29iamVjdH0gY2hhcnQgb3JkZXIgaW5mb1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VDaGFydFR5cGVPcmRlckluZm86IGZ1bmN0aW9uKGNoYXJ0VHlwZXMpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgICAgICBuZS51dGlsLmZvckVhY2hBcnJheShjaGFydFR5cGVzLCBmdW5jdGlvbihjaGFydFR5cGUsIGluZGV4KSB7XG4gICAgICAgICAgICByZXN1bHRbY2hhcnRUeXBlXSA9IGluZGV4O1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBvcHRpb25zIG1hcFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjaGFydFR5cGVzIGNoYXJ0IHR5cGVzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcmRlckluZm8gY2hhcnQgb3JkZXJcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBvcHRpb25zIG1hcFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VPcHRpb25zTWFwOiBmdW5jdGlvbihjaGFydFR5cGVzLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciBvcmRlckluZm8gPSB0aGlzLl9tYWtlQ2hhcnRUeXBlT3JkZXJJbmZvKGNoYXJ0VHlwZXMpLFxuICAgICAgICAgICAgcmVzdWx0ID0ge307XG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KGNoYXJ0VHlwZXMsIGZ1bmN0aW9uKGNoYXJ0VHlwZSkge1xuICAgICAgICAgICAgdmFyIGNoYXJ0T3B0aW9ucyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob3B0aW9ucykpLFxuICAgICAgICAgICAgICAgIGluZGV4ID0gb3JkZXJJbmZvW2NoYXJ0VHlwZV07XG5cbiAgICAgICAgICAgIGlmIChjaGFydE9wdGlvbnMueUF4aXMgJiYgY2hhcnRPcHRpb25zLnlBeGlzW2luZGV4XSkge1xuICAgICAgICAgICAgICAgIGNoYXJ0T3B0aW9ucy55QXhpcyA9IGNoYXJ0T3B0aW9ucy55QXhpc1tpbmRleF07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChjaGFydE9wdGlvbnMuc2VyaWVzICYmIGNoYXJ0T3B0aW9ucy5zZXJpZXNbY2hhcnRUeXBlXSkge1xuICAgICAgICAgICAgICAgIGNoYXJ0T3B0aW9ucy5zZXJpZXMgPSBjaGFydE9wdGlvbnMuc2VyaWVzW2NoYXJ0VHlwZV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChjaGFydE9wdGlvbnMudG9vbHRpcCAmJiBjaGFydE9wdGlvbnMudG9vbHRpcFtjaGFydFR5cGVdKSB7XG4gICAgICAgICAgICAgICAgY2hhcnRPcHRpb25zLnRvb2x0aXAgPSBjaGFydE9wdGlvbnMudG9vbHRpcFtjaGFydFR5cGVdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2hhcnRPcHRpb25zLmNoYXJ0VHlwZSA9IGNoYXJ0VHlwZTtcbiAgICAgICAgICAgIHJlc3VsdFtjaGFydFR5cGVdID0gY2hhcnRPcHRpb25zO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSB0aGVtZSBtYXBcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY2hhcnRUeXBlcyBjaGFydCB0eXBlc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBjaGFydCB0aGVtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBsZWdlbmRMYWJlbHMgbGVnZW5kIGxhYmVsc1xuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHRoZW1lIG1hcFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VUaGVtZU1hcDogZnVuY3Rpb24oY2hhcnRUeXBlcywgdGhlbWUsIGxlZ2VuZExhYmVscykge1xuICAgICAgICB2YXIgcmVzdWx0ID0ge30sXG4gICAgICAgICAgICBjb2xvckNvdW50ID0gMDtcbiAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkoY2hhcnRUeXBlcywgZnVuY3Rpb24oY2hhcnRUeXBlKSB7XG4gICAgICAgICAgICB2YXIgY2hhcnRUaGVtZSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhlbWUpKSxcbiAgICAgICAgICAgICAgICByZW1vdmVkQ29sb3JzO1xuXG4gICAgICAgICAgICBpZiAoY2hhcnRUaGVtZS55QXhpc1tjaGFydFR5cGVdKSB7XG4gICAgICAgICAgICAgICAgY2hhcnRUaGVtZS55QXhpcyA9IGNoYXJ0VGhlbWUueUF4aXNbY2hhcnRUeXBlXTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWNoYXJ0VGhlbWUueUF4aXMudGl0bGUpIHtcbiAgICAgICAgICAgICAgICBjaGFydFRoZW1lLnlBeGlzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShkZWZhdWx0VGhlbWUueUF4aXMpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGNoYXJ0VGhlbWUuc2VyaWVzW2NoYXJ0VHlwZV0pIHtcbiAgICAgICAgICAgICAgICBjaGFydFRoZW1lLnNlcmllcyA9IGNoYXJ0VGhlbWUuc2VyaWVzW2NoYXJ0VHlwZV07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFjaGFydFRoZW1lLnNlcmllcy5jb2xvcnMpIHtcbiAgICAgICAgICAgICAgICBjaGFydFRoZW1lLnNlcmllcyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZGVmYXVsdFRoZW1lLnNlcmllcykpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZW1vdmVkQ29sb3JzID0gY2hhcnRUaGVtZS5zZXJpZXMuY29sb3JzLnNwbGljZSgwLCBjb2xvckNvdW50KTtcbiAgICAgICAgICAgICAgICBjaGFydFRoZW1lLnNlcmllcy5jb2xvcnMgPSBjaGFydFRoZW1lLnNlcmllcy5jb2xvcnMuY29uY2F0KHJlbW92ZWRDb2xvcnMpO1xuICAgICAgICAgICAgICAgIGNvbG9yQ291bnQgKz0gbGVnZW5kTGFiZWxzW2NoYXJ0VHlwZV0ubGVuZ3RoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0W2NoYXJ0VHlwZV0gPSBjaGFydFRoZW1lO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW5jcmVhc2UgeSBheGlzIHRpY2sgY291bnQuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluY3JlYXNlVGlja0NvdW50IGluY3JlYXNlIHRpY2sgY291bnRcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdG9EYXRhIHRvIHRpY2sgaW5mb1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2luY3JlYXNlWUF4aXNUaWNrQ291bnQ6IGZ1bmN0aW9uKGluY3JlYXNlVGlja0NvdW50LCB0b0RhdGEpIHtcbiAgICAgICAgdG9EYXRhLnNjYWxlLm1heCArPSB0b0RhdGEuc3RlcCAqIGluY3JlYXNlVGlja0NvdW50O1xuICAgICAgICB0b0RhdGEubGFiZWxzID0gY2FsY3VsYXRvci5tYWtlTGFiZWxzRnJvbVNjYWxlKHRvRGF0YS5zY2FsZSwgdG9EYXRhLnN0ZXApO1xuICAgICAgICB0b0RhdGEudGlja0NvdW50ICs9IGluY3JlYXNlVGlja0NvdW50O1xuICAgICAgICB0b0RhdGEudmFsaWRUaWNrQ291bnQgKz0gaW5jcmVhc2VUaWNrQ291bnQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEluc3RhbGwgY2hhcnRzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy51c2VyRGF0YSB1c2VyIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuYmFzZURhdGEgY2hhcnQgYmFzZSBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIGNoYXJ0IHRoZW1lXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqICAgICAgQHBhcmFtIHt7eUF4aXM6IG9iamVjdCwgeEF4aXM6IG9iamVjdH19IHBhcmFtcy5iYXNlQXhlc0RhdGEgYmFzZSBheGVzIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuYXhlc0RhdGEgYXhlcyBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBwYXJhbXMuc2VyaWVzQ2hhcnRUeXBlcyBzZXJpZXMgY2hhcnQgdHlwZXNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IHBhcmFtcy5jaGFydFR5cGVzIGNoYXJ0IHR5cGVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaW5zdGFsbENoYXJ0czogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBjaGFydENsYXNzZXMgPSB7XG4gICAgICAgICAgICAgICAgY29sdW1uOiBDb2x1bW5DaGFydCxcbiAgICAgICAgICAgICAgICBsaW5lOiBMaW5lQ2hhcnRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBiYXNlRGF0YSA9IHBhcmFtcy5iYXNlRGF0YSxcbiAgICAgICAgICAgIGNvbnZlcnREYXRhID0gYmFzZURhdGEuY29udmVydERhdGEsXG4gICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXMgPSBjb252ZXJ0RGF0YS5mb3JtYXR0ZWRWYWx1ZXMsXG4gICAgICAgICAgICBiYXNlQXhlc0RhdGEgPSBwYXJhbXMuYmFzZUF4ZXNEYXRhLFxuICAgICAgICAgICAgc2VyaWVzQ2hhcnRUeXBlcyA9IHBhcmFtcy5zZXJpZXNDaGFydFR5cGVzLFxuICAgICAgICAgICAgb3B0aW9uc01hcCA9IHBhcmFtcy5vcHRpb25zTWFwLFxuICAgICAgICAgICAgdGhlbWVNYXAgPSBwYXJhbXMudGhlbWVNYXAsXG4gICAgICAgICAgICBwbG90RGF0YSA9IHtcbiAgICAgICAgICAgICAgICB2VGlja0NvdW50OiBiYXNlQXhlc0RhdGEueUF4aXMudmFsaWRUaWNrQ291bnQsXG4gICAgICAgICAgICAgICAgaFRpY2tDb3VudDogYmFzZUF4ZXNEYXRhLnhBeGlzLnZhbGlkVGlja0NvdW50XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgam9pbkxlZ2VuZExhYmVscyA9IGNvbnZlcnREYXRhLmpvaW5MZWdlbmRMYWJlbHM7XG5cbiAgICAgICAgdGhpcy5jaGFydHMgPSBuZS51dGlsLm1hcChzZXJpZXNDaGFydFR5cGVzLCBmdW5jdGlvbihjaGFydFR5cGUpIHtcbiAgICAgICAgICAgIHZhciBsZWdlbmRMYWJlbHMgPSBjb252ZXJ0RGF0YS5sZWdlbmRMYWJlbHNbY2hhcnRUeXBlXSxcbiAgICAgICAgICAgICAgICBheGVzID0gcGFyYW1zLmF4ZXNEYXRhW2NoYXJ0VHlwZV0sXG4gICAgICAgICAgICAgICAgc2VuZE9wdGlvbnMgPSBvcHRpb25zTWFwW2NoYXJ0VHlwZV0sXG4gICAgICAgICAgICAgICAgc2VuZFRoZW1lID0gdGhlbWVNYXBbY2hhcnRUeXBlXSxcbiAgICAgICAgICAgICAgICBzZW5kQm91bmRzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShiYXNlRGF0YS5ib3VuZHMpKSxcbiAgICAgICAgICAgICAgICBjaGFydDtcblxuICAgICAgICAgICAgaWYgKGF4ZXMgJiYgYXhlcy55QXhpcy5pc1Bvc2l0aW9uUmlnaHQpIHtcbiAgICAgICAgICAgICAgICBzZW5kQm91bmRzLnlBeGlzID0gc2VuZEJvdW5kcy55ckF4aXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjaGFydCA9IG5ldyBjaGFydENsYXNzZXNbY2hhcnRUeXBlXShwYXJhbXMudXNlckRhdGEsIHNlbmRUaGVtZSwgc2VuZE9wdGlvbnMsIHtcbiAgICAgICAgICAgICAgICBjb252ZXJ0RGF0YToge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZXM6IGNvbnZlcnREYXRhLnZhbHVlc1tjaGFydFR5cGVdLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbHM6IGNvbnZlcnREYXRhLmxhYmVscyxcbiAgICAgICAgICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zOiBjb252ZXJ0RGF0YS5mb3JtYXRGdW5jdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlczogZm9ybWF0dGVkVmFsdWVzW2NoYXJ0VHlwZV0sXG4gICAgICAgICAgICAgICAgICAgIGxlZ2VuZExhYmVsczogbGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgICAgICAgICBqb2luTGVnZW5kTGFiZWxzOiBqb2luTGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgICAgICAgICBwbG90RGF0YTogcGxvdERhdGFcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGJvdW5kczogc2VuZEJvdW5kcyxcbiAgICAgICAgICAgICAgICBheGVzOiBheGVzLFxuICAgICAgICAgICAgICAgIHByZWZpeDogY2hhcnRUeXBlICsgJy0nXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHBsb3REYXRhID0gbnVsbDtcbiAgICAgICAgICAgIGpvaW5MZWdlbmRMYWJlbHMgPSBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIGNoYXJ0O1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGNvbWJvIGNoYXJ0LlxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gY29tYm8gY2hhcnQgZWxlbWVudFxuICAgICAqL1xuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBlbCA9IENoYXJ0QmFzZS5wcm90b3R5cGUucmVuZGVyLmNhbGwodGhpcyk7XG4gICAgICAgIHZhciBwYXBlcjtcbiAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkodGhpcy5jaGFydHMsIGZ1bmN0aW9uKGNoYXJ0KSB7XG4gICAgICAgICAgICBjaGFydC5yZW5kZXIoZWwsIHBhcGVyKTtcbiAgICAgICAgICAgIGlmICghcGFwZXIpIHtcbiAgICAgICAgICAgICAgICBwYXBlciA9IGNoYXJ0LmdldFBhcGVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjaGFydC5hbmltYXRlQ2hhcnQoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb21ib0NoYXJ0O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IExpbmUgY2hhcnRcbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIENoYXJ0QmFzZSA9IHJlcXVpcmUoJy4vY2hhcnRCYXNlJyksXG4gICAgQXhpc1R5cGVCYXNlID0gcmVxdWlyZSgnLi9heGlzVHlwZUJhc2UnKSxcbiAgICBWZXJ0aWNhbFR5cGVCYXNlID0gcmVxdWlyZSgnLi92ZXJ0aWNhbFR5cGVCYXNlJyksXG4gICAgY2FsY3VsYXRvciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvY2FsY3VsYXRvcicpLFxuICAgIFNlcmllcyA9IHJlcXVpcmUoJy4uL3Nlcmllcy9saW5lQ2hhcnRTZXJpZXMnKTtcblxudmFyIExpbmVDaGFydCA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoQ2hhcnRCYXNlLCAvKiogQGxlbmRzIExpbmVDaGFydC5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIExpbmUgY2hhcnQuXG4gICAgICogQGNvbnN0cnVjdHMgTGluZUNoYXJ0XG4gICAgICogQGV4dGVuZHMgQ2hhcnRCYXNlXG4gICAgICogQG1peGVzIEF4aXNUeXBlQmFzZVxuICAgICAqIEBtaXhlcyBWZXJ0aWNhbFR5cGVCYXNlXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXk+fSB1c2VyRGF0YSBjaGFydCBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIGNoYXJ0IHRoZW1lXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBpbml0ZWREYXRhIGluaXRpYWxpemVkIGRhdGEgZnJvbSBjb21ibyBjaGFydFxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKHVzZXJEYXRhLCB0aGVtZSwgb3B0aW9ucywgaW5pdGVkRGF0YSkge1xuICAgICAgICB2YXIgYmFzZURhdGEgPSBpbml0ZWREYXRhIHx8IHRoaXMubWFrZUJhc2VEYXRhKHVzZXJEYXRhLCB0aGVtZSwgb3B0aW9ucywge1xuICAgICAgICAgICAgICAgIGlzVmVydGljYWw6IHRydWUsXG4gICAgICAgICAgICAgICAgaGFzQXhlczogdHJ1ZVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBjb252ZXJ0RGF0YSA9IGJhc2VEYXRhLmNvbnZlcnREYXRhLFxuICAgICAgICAgICAgYm91bmRzID0gYmFzZURhdGEuYm91bmRzLFxuICAgICAgICAgICAgYXhpc0RhdGE7XG5cbiAgICAgICAgdGhpcy5jbGFzc05hbWUgPSAnbmUtbGluZS1jaGFydCc7XG5cbiAgICAgICAgQ2hhcnRCYXNlLmNhbGwodGhpcywgYm91bmRzLCB0aGVtZSwgb3B0aW9ucywgaW5pdGVkRGF0YSk7XG5cbiAgICAgICAgYXhpc0RhdGEgPSB0aGlzLl9tYWtlQXhlc0RhdGEoY29udmVydERhdGEsIGJvdW5kcywgb3B0aW9ucywgaW5pdGVkRGF0YSk7XG4gICAgICAgIHRoaXMuX2FkZENvbXBvbmVudHMoY29udmVydERhdGEsIGF4aXNEYXRhLCBvcHRpb25zKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIGNvbXBvbmVudHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udmVydERhdGEgY29udmVydGVkIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYXhlc0RhdGEgYXhlcyBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2FkZENvbXBvbmVudHM6IGZ1bmN0aW9uKGNvbnZlcnREYXRhLCBheGVzRGF0YSwgb3B0aW9ucykge1xuICAgICAgICB0aGlzLmFkZEF4aXNDb21wb25lbnRzKHtcbiAgICAgICAgICAgIGNvbnZlcnREYXRhOiBjb252ZXJ0RGF0YSxcbiAgICAgICAgICAgIGF4ZXM6IGF4ZXNEYXRhLFxuICAgICAgICAgICAgcGxvdERhdGE6ICFuZS51dGlsLmlzVW5kZWZpbmVkKGNvbnZlcnREYXRhLnBsb3REYXRhKSA/IGNvbnZlcnREYXRhLnBsb3REYXRhIDoge1xuICAgICAgICAgICAgICAgIHZUaWNrQ291bnQ6IGF4ZXNEYXRhLnlBeGlzLnZhbGlkVGlja0NvdW50LFxuICAgICAgICAgICAgICAgIGhUaWNrQ291bnQ6IGF4ZXNEYXRhLnhBeGlzLnZhbGlkVGlja0NvdW50XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2hhcnRUeXBlOiBvcHRpb25zLmNoYXJ0VHlwZSxcbiAgICAgICAgICAgIFNlcmllczogU2VyaWVzLFxuICAgICAgICAgICAgc2VyaWVzRGF0YToge1xuICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzOiBjYWxjdWxhdG9yLmFycmF5UGl2b3QoY29udmVydERhdGEudmFsdWVzKSxcbiAgICAgICAgICAgICAgICAgICAgZm9ybWF0dGVkVmFsdWVzOiBjYWxjdWxhdG9yLmFycmF5UGl2b3QoY29udmVydERhdGEuZm9ybWF0dGVkVmFsdWVzKSxcbiAgICAgICAgICAgICAgICAgICAgc2NhbGU6IGF4ZXNEYXRhLnlBeGlzLnNjYWxlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxuQXhpc1R5cGVCYXNlLm1peGluKExpbmVDaGFydCk7XG5WZXJ0aWNhbFR5cGVCYXNlLm1peGluKExpbmVDaGFydCk7XG5cbm1vZHVsZS5leHBvcnRzID0gTGluZUNoYXJ0O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFBpZSBjaGFydC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIENoYXJ0QmFzZSA9IHJlcXVpcmUoJy4vY2hhcnRCYXNlLmpzJyksXG4gICAgTGVnZW5kID0gcmVxdWlyZSgnLi4vbGVnZW5kcy9sZWdlbmQuanMnKSxcbiAgICBUb29sdGlwID0gcmVxdWlyZSgnLi4vdG9vbHRpcHMvdG9vbHRpcC5qcycpLFxuICAgIFNlcmllcyA9IHJlcXVpcmUoJy4uL3Nlcmllcy9waWVDaGFydFNlcmllcy5qcycpO1xuXG52YXIgUGllQ2hhcnQgPSBuZS51dGlsLmRlZmluZUNsYXNzKENoYXJ0QmFzZSwgLyoqIEBsZW5kcyBQaWVDaGFydC5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIENvbHVtbiBjaGFydC5cbiAgICAgKiBAY29uc3RydWN0cyBQaWVDaGFydFxuICAgICAqIEBleHRlbmRzIENoYXJ0QmFzZVxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gdXNlckRhdGEgY2hhcnQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBjaGFydCB0aGVtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gaW5pdGVkRGF0YSBpbml0aWFsaXplZCBkYXRhIGZyb20gY29tYm8gY2hhcnRcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbih1c2VyRGF0YSwgdGhlbWUsIG9wdGlvbnMsIGluaXRlZERhdGEpIHtcbiAgICAgICAgdmFyIGJhc2VEYXRhID0gaW5pdGVkRGF0YSB8fCB0aGlzLm1ha2VCYXNlRGF0YSh1c2VyRGF0YSwgdGhlbWUsIG9wdGlvbnMpLFxuICAgICAgICAgICAgY29udmVydERhdGEgPSBiYXNlRGF0YS5jb252ZXJ0RGF0YSxcbiAgICAgICAgICAgIGJvdW5kcyA9IGJhc2VEYXRhLmJvdW5kcztcblxuICAgICAgICB0aGlzLmNsYXNzTmFtZSA9ICduZS1waWUtY2hhcnQnO1xuXG4gICAgICAgIG9wdGlvbnMudG9vbHRpcCA9IG9wdGlvbnMudG9vbHRpcCB8fCB7fTtcblxuICAgICAgICBpZiAoIW9wdGlvbnMudG9vbHRpcC5wb3NpdGlvbikge1xuICAgICAgICAgICAgb3B0aW9ucy50b29sdGlwLnBvc2l0aW9uID0gJ2NlbnRlciBtaWRkbGUnO1xuICAgICAgICB9XG5cbiAgICAgICAgQ2hhcnRCYXNlLmNhbGwodGhpcywgYm91bmRzLCB0aGVtZSwgb3B0aW9ucywgaW5pdGVkRGF0YSk7XG5cbiAgICAgICAgdGhpcy5fYWRkQ29tcG9uZW50cyhjb252ZXJ0RGF0YSwgdGhlbWUuY2hhcnQuYmFja2dyb3VuZCwgYm91bmRzLCBvcHRpb25zKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIGNvbXBvbmVudHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udmVydERhdGEgY29udmVydGVkIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY2hhcnRCYWNrZ3JvdW5kIGNoYXJ0IGJhY2tncm91bmRcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxvYmplY3Q+fSBib3VuZHMgYm91bmRzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2FkZENvbXBvbmVudHM6IGZ1bmN0aW9uKGNvbnZlcnREYXRhLCBjaGFydEJhY2tncm91bmQsIGJvdW5kcywgb3B0aW9ucykge1xuICAgICAgICBpZiAoY29udmVydERhdGEuam9pbkxlZ2VuZExhYmVscyAmJiAoIW9wdGlvbnMuc2VyaWVzIHx8ICFvcHRpb25zLnNlcmllcy5sZWdlbmRUeXBlKSkge1xuICAgICAgICAgICAgdGhpcy5hZGRDb21wb25lbnQoJ2xlZ2VuZCcsIExlZ2VuZCwge1xuICAgICAgICAgICAgICAgIGpvaW5MZWdlbmRMYWJlbHM6IGNvbnZlcnREYXRhLmpvaW5MZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICAgICAgbGVnZW5kTGFiZWxzOiBjb252ZXJ0RGF0YS5sZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICAgICAgY2hhcnRUeXBlOiBvcHRpb25zLmNoYXJ0VHlwZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmFkZENvbXBvbmVudCgndG9vbHRpcCcsIFRvb2x0aXAsIHtcbiAgICAgICAgICAgIHZhbHVlczogY29udmVydERhdGEuZm9ybWF0dGVkVmFsdWVzLFxuICAgICAgICAgICAgbGFiZWxzOiBjb252ZXJ0RGF0YS5sYWJlbHMsXG4gICAgICAgICAgICBsZWdlbmRMYWJlbHM6IGNvbnZlcnREYXRhLmxlZ2VuZExhYmVscyxcbiAgICAgICAgICAgIHByZWZpeDogdGhpcy50b29sdGlwUHJlZml4XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KCdzZXJpZXMnLCBTZXJpZXMsIHtcbiAgICAgICAgICAgIGxpYlR5cGU6IG9wdGlvbnMubGliVHlwZSxcbiAgICAgICAgICAgIGNoYXJ0VHlwZTogb3B0aW9ucy5jaGFydFR5cGUsXG4gICAgICAgICAgICB0b29sdGlwUHJlZml4OiB0aGlzLnRvb2x0aXBQcmVmaXgsXG4gICAgICAgICAgICBjaGFydEJhY2tncm91bmQ6IGNoYXJ0QmFja2dyb3VuZCxcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICB2YWx1ZXM6IGNvbnZlcnREYXRhLnZhbHVlcyxcbiAgICAgICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXM6IGNvbnZlcnREYXRhLmZvcm1hdHRlZFZhbHVlcyxcbiAgICAgICAgICAgICAgICBsZWdlbmRMYWJlbHM6IGNvbnZlcnREYXRhLmxlZ2VuZExhYmVscyxcbiAgICAgICAgICAgICAgICBjaGFydFdpZHRoOiBib3VuZHMuY2hhcnQuZGltZW5zaW9uLndpZHRoXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBpZUNoYXJ0O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFZlcnRpY2FsVHlwZUJhc2UgaXMgYmFzZSBjbGFzcyBvZiB2ZXJ0aWNhbCB0eXBlIGNoYXJ0KGNvbHVtbiwgbGluZSwgYXJlYSkuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBheGlzRGF0YU1ha2VyID0gcmVxdWlyZSgnLi4vaGVscGVycy9heGlzRGF0YU1ha2VyJyk7XG5cbi8qKlxuICogQGNsYXNzZGVzYyBWZXJ0aWNhbFR5cGVCYXNlIGlzIGJhc2UgY2xhc3Mgb2YgdmVydGljYWwgdHlwZSBjaGFydChjb2x1bW4sIGxpbmUsIGFyZWEpLlxuICogQGNsYXNzIFZlcnRpY2FsVHlwZUJhc2VcbiAqIEBtaXhpblxuICovXG52YXIgVmVydGljYWxUeXBlQmFzZSA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBWZXJ0aWNhbFR5cGVCYXNlLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBheGVzIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udmVydERhdGEgY29udmVydGVkIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYm91bmRzIGNoYXJ0IGJvdW5kc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gaW5pdGVkRGF0YSBpbml0aWFsaXplZCBkYXRhIGZyb20gY29tYm8gY2hhcnRcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBheGVzIGRhdGFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQXhlc0RhdGE6IGZ1bmN0aW9uKGNvbnZlcnREYXRhLCBib3VuZHMsIG9wdGlvbnMsIGluaXRlZERhdGEpIHtcbiAgICAgICAgdmFyIGF4ZXNEYXRhID0ge307XG4gICAgICAgIGlmIChpbml0ZWREYXRhKSB7XG4gICAgICAgICAgICBheGVzRGF0YSA9IGluaXRlZERhdGEuYXhlcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGF4ZXNEYXRhID0ge1xuICAgICAgICAgICAgICAgIHlBeGlzOiBheGlzRGF0YU1ha2VyLm1ha2VWYWx1ZUF4aXNEYXRhKHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzOiBjb252ZXJ0RGF0YS52YWx1ZXMsXG4gICAgICAgICAgICAgICAgICAgIHNlcmllc0RpbWVuc2lvbjogYm91bmRzLnNlcmllcy5kaW1lbnNpb24sXG4gICAgICAgICAgICAgICAgICAgIHN0YWNrZWQ6IG9wdGlvbnMuc2VyaWVzICYmIG9wdGlvbnMuc2VyaWVzLnN0YWNrZWQgfHwgJycsXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0VHlwZTogb3B0aW9ucy5jaGFydFR5cGUsXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdEZ1bmN0aW9uczogY29udmVydERhdGEuZm9ybWF0RnVuY3Rpb25zLFxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zLnlBeGlzLFxuICAgICAgICAgICAgICAgICAgICBpc1ZlcnRpY2FsOiB0cnVlXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgeEF4aXM6IGF4aXNEYXRhTWFrZXIubWFrZUxhYmVsQXhpc0RhdGEoe1xuICAgICAgICAgICAgICAgICAgICBsYWJlbHM6IGNvbnZlcnREYXRhLmxhYmVsc1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBheGVzRGF0YTtcbiAgICB9XG59KTtcblxuVmVydGljYWxUeXBlQmFzZS5taXhpbiA9IGZ1bmN0aW9uKGZ1bmMpIHtcbiAgICBuZS51dGlsLmV4dGVuZChmdW5jLnByb3RvdHlwZSwgVmVydGljYWxUeXBlQmFzZS5wcm90b3R5cGUpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBWZXJ0aWNhbFR5cGVCYXNlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIG5lLnV0aWzsl5AgcmFuZ2XqsIAg7LaU6rCA65CY6riwIOyghOq5jOyngCDsnoTsi5zroZwg7IKs7JqpXG4gKiBAcGFyYW0ge251bWJlcn0gc3RhcnQgc3RhcnRcbiAqIEBwYXJhbSB7bnVtYmVyfSBzdG9wIHN0b3BcbiAqIEBwYXJhbSB7bnVtYmVyfSBzdGVwIHN0ZXBcbiAqIEByZXR1cm5zIHthcnJheS48bnVtYmVyPn0gcmVzdWx0IGFycmF5XG4gKi9cbnZhciByYW5nZSA9IGZ1bmN0aW9uKHN0YXJ0LCBzdG9wLCBzdGVwKSB7XG4gICAgdmFyIGFyciA9IFtdLFxuICAgICAgICBmbGFnO1xuXG4gICAgaWYgKG5lLnV0aWwuaXNVbmRlZmluZWQoc3RvcCkpIHtcbiAgICAgICAgc3RvcCA9IHN0YXJ0IHx8IDA7XG4gICAgICAgIHN0YXJ0ID0gMDtcbiAgICB9XG5cbiAgICBzdGVwID0gc3RlcCB8fCAxO1xuICAgIGZsYWcgPSBzdGVwIDwgMCA/IC0xIDogMTtcbiAgICBzdG9wICo9IGZsYWc7XG5cbiAgICB3aGlsZSAoc3RhcnQgKiBmbGFnIDwgc3RvcCkge1xuICAgICAgICBhcnIucHVzaChzdGFydCk7XG4gICAgICAgIHN0YXJ0ICs9IHN0ZXA7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFycjtcbn07XG5cbi8qKlxuICogKiBuZS51dGls7JeQIHBsdWNr7J20IOy2lOqwgOuQmOq4sCDsoITquYzsp4Ag7J6E7Iuc66GcIOyCrOyaqVxuICogQHBhcmFtIHthcnJheX0gYXJyIGFycmF5XG4gKiBAcGFyYW0ge3N0cmluZ30gcHJvcGVydHkgcHJvcGVydHlcbiAqIEByZXR1cm5zIHthcnJheX0gcmVzdWx0IGFycmF5XG4gKi9cbnZhciBwbHVjayA9IGZ1bmN0aW9uKGFyciwgcHJvcGVydHkpIHtcbiAgICB2YXIgcmVzdWx0ID0gbmUudXRpbC5tYXAoYXJyLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIHJldHVybiBpdGVtW3Byb3BlcnR5XTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiAqIG5lLnV0aWzsl5Agemlw7J20IOy2lOqwgOuQmOq4sCDsoITquYzsp4Ag7J6E7Iuc66GcIOyCrOyaqVxuICogQHBhcmFtcyB7Li4uYXJyYXl9IGFycmF5XG4gKiBAcmV0dXJucyB7YXJyYXl9IHJlc3VsdCBhcnJheVxuICovXG52YXIgemlwID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFycjIgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpLFxuICAgICAgICByZXN1bHQgPSBbXTtcblxuICAgIG5lLnV0aWwuZm9yRWFjaChhcnIyLCBmdW5jdGlvbihhcnIpIHtcbiAgICAgICAgbmUudXRpbC5mb3JFYWNoKGFyciwgZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgICBpZiAoIXJlc3VsdFtpbmRleF0pIHtcbiAgICAgICAgICAgICAgICByZXN1bHRbaW5kZXhdID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXN1bHRbaW5kZXhdLnB1c2godmFsdWUpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIFBpY2sgbWluaW11bSB2YWx1ZSBmcm9tIHZhbHVlIGFycmF5LlxuICogQHBhcmFtIHthcnJheX0gYXJyIHZhbHVlIGFycmF5XG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjb25kaXRpb24gY29uZGl0aW9uIGZ1bmN0aW9uXG4gKiBAcGFyYW0ge29iamVjdH0gY29udGV4dCB0YXJnZXQgY29udGV4dFxuICogQHJldHVybnMgeyp9IG1pbmltdW0gdmFsdWVcbiAqL1xudmFyIG1pbiA9IGZ1bmN0aW9uKGFyciwgY29uZGl0aW9uLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdCwgbWluVmFsdWUsIHJlc3Q7XG4gICAgaWYgKCFjb25kaXRpb24pIHtcbiAgICAgICAgY29uZGl0aW9uID0gZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgIH07XG4gICAgfVxuICAgIHJlc3VsdCA9IGFyclswXTtcbiAgICBtaW5WYWx1ZSA9IGNvbmRpdGlvbi5jYWxsKGNvbnRleHQsIHJlc3VsdCk7XG4gICAgcmVzdCA9IGFyci5zbGljZSgxKTtcbiAgICBuZS51dGlsLmZvckVhY2hBcnJheShyZXN0LCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIHZhciBjb21wYXJlVmFsdWUgPSBjb25kaXRpb24uY2FsbChjb250ZXh0LCBpdGVtKTtcbiAgICAgICAgaWYgKGNvbXBhcmVWYWx1ZSA8IG1pblZhbHVlKSB7XG4gICAgICAgICAgICBtaW5WYWx1ZSA9IGNvbXBhcmVWYWx1ZTtcbiAgICAgICAgICAgIHJlc3VsdCA9IGl0ZW07XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBQaWNrIG1heGltdW0gdmFsdWUgZnJvbSB2YWx1ZSBhcnJheS5cbiAqIEBwYXJhbSB7YXJyYXl9IGFyciB2YWx1ZSBhcnJheVxuICogQHBhcmFtIHtmdW5jdGlvbn0gY29uZGl0aW9uIGNvbmRpdGlvbiBmdW5jdGlvblxuICogQHBhcmFtIHtvYmplY3R9IGNvbnRleHQgdGFyZ2V0IGNvbnRleHRcbiAqIEByZXR1cm5zIHsqfSBtYXhpbXVtIHZhbHVlXG4gKi9cbnZhciBtYXggPSBmdW5jdGlvbihhcnIsIGNvbmRpdGlvbiwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHQsIG1heFZhbHVlLCByZXN0O1xuICAgIGlmICghY29uZGl0aW9uKSB7XG4gICAgICAgIGNvbmRpdGlvbiA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICB9O1xuICAgIH1cbiAgICByZXN1bHQgPSBhcnJbMF07XG4gICAgbWF4VmFsdWUgPSBjb25kaXRpb24uY2FsbChjb250ZXh0LCByZXN1bHQpO1xuICAgIHJlc3QgPSBhcnIuc2xpY2UoMSk7XG4gICAgbmUudXRpbC5mb3JFYWNoQXJyYXkocmVzdCwgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICB2YXIgY29tcGFyZVZhbHVlID0gY29uZGl0aW9uLmNhbGwoY29udGV4dCwgaXRlbSk7XG4gICAgICAgIGlmIChjb21wYXJlVmFsdWUgPiBtYXhWYWx1ZSkge1xuICAgICAgICAgICAgbWF4VmFsdWUgPSBjb21wYXJlVmFsdWU7XG4gICAgICAgICAgICByZXN1bHQgPSBpdGVtO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogV2hldGhlciBvbmUgb2YgdGhlbSBpcyB0cnVlIG9yIG5vdC5cbiAqIEBwYXJhbSB7YXJyYXl9IGFyciB0YXJnZXQgYXJyYXlcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNvbmRpdGlvbiBjb25kaXRpb24gZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtib29sZWFufSByZXN1bHQgYm9vbGVhblxuICovXG52YXIgYW55ID0gZnVuY3Rpb24oYXJyLCBjb25kaXRpb24pIHtcbiAgICB2YXIgcmVzdWx0ID0gZmFsc2U7XG4gICAgbmUudXRpbC5mb3JFYWNoQXJyYXkoYXJyLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIGlmIChjb25kaXRpb24oaXRlbSkpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBBbGwgb2YgdGhlbSBpcyB0cnVlIG9yIG5vdC5cbiAqIEBwYXJhbSB7YXJyYXl9IGFyciB0YXJnZXQgYXJyYXlcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNvbmRpdGlvbiBjb25kaXRpb24gZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtib29sZWFufSByZXN1bHQgYm9vbGVhblxuICovXG52YXIgYWxsID0gZnVuY3Rpb24oYXJyLCBjb25kaXRpb24pIHtcbiAgICB2YXIgcmVzdWx0ID0gdHJ1ZTtcbiAgICBuZS51dGlsLmZvckVhY2hBcnJheShhcnIsIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgaWYgKCFjb25kaXRpb24oaXRlbSkpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogR2V0IGFmdGVyIHBvaW50IGxlbmd0aC5cbiAqIEBwYXJhbSB7c3RyaW5nIHwgbnVtYmVyfSB2YWx1ZSB0YXJnZXQgdmFsdWVcbiAqIEByZXR1cm5zIHtudW1iZXJ9IHJlc3VsdCBsZW5ndGhcbiAqL1xudmFyIGxlbmd0aEFmdGVyUG9pbnQgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHZhciB2YWx1ZUFyciA9ICh2YWx1ZSArICcnKS5zcGxpdCgnLicpO1xuICAgIHJldHVybiB2YWx1ZUFyci5sZW5ndGggPT09IDIgPyB2YWx1ZUFyclsxXS5sZW5ndGggOiAwO1xufTtcblxuLyoqXG4gKiBGaW5kIG11bHRpcGxlIG51bS5cbiAqIEBwYXJhbSB7Li4uYXJyYXl9IHRhcmdldCB2YWx1ZXNcbiAqIEByZXR1cm5zIHtudW1iZXJ9IG11bHRpcGxlIG51bVxuICovXG52YXIgZmluZE11bHRpcGxlTnVtID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cyksXG4gICAgICAgIHVuZGVyUG9pbnRMZW5zID0gbmUudXRpbC5tYXAoYXJncywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiBuZS51dGlsLmxlbmd0aEFmdGVyUG9pbnQodmFsdWUpO1xuICAgICAgICB9KSxcbiAgICAgICAgdW5kZXJQb2ludExlbiA9IG5lLnV0aWwubWF4KHVuZGVyUG9pbnRMZW5zKSxcbiAgICAgICAgbXVsdGlwbGVOdW0gPSBNYXRoLnBvdygxMCwgdW5kZXJQb2ludExlbik7XG4gICAgcmV0dXJuIG11bHRpcGxlTnVtO1xufTtcblxuLyoqXG4gKiBNb2R1bG8gb3BlcmF0aW9uIGZvciBmbG9hdGluZyBwb2ludCBvcGVyYXRpb24uXG4gKiBAcGFyYW0ge251bWJlcn0gdGFyZ2V0IHRhcmdldCB2YWx1ZXNcbiAqIEBwYXJhbSB7bnVtYmVyfSBtb2ROdW0gbW9kIG51bVxuICogQHJldHVybnMge251bWJlcn0gcmVzdWx0IG1vZFxuICovXG52YXIgbW9kID0gZnVuY3Rpb24odGFyZ2V0LCBtb2ROdW0pIHtcbiAgICB2YXIgbXVsdGlwbGVOdW0gPSBuZS51dGlsLmZpbmRNdWx0aXBsZU51bShtb2ROdW0pO1xuICAgIHJldHVybiAoKHRhcmdldCAqIG11bHRpcGxlTnVtKSAlIChtb2ROdW0gKiBtdWx0aXBsZU51bSkpIC8gbXVsdGlwbGVOdW07XG59O1xuXG4vKipcbiAqIEFkZGl0aW9uIGZvciBmbG9hdGluZyBwb2ludCBvcGVyYXRpb24uXG4gKiBAcGFyYW0ge251bWJlcn0gYSB0YXJnZXQgYVxuICogQHBhcmFtIHtudW1iZXJ9IGIgdGFyZ2V0IGJcbiAqIEByZXR1cm5zIHtudW1iZXJ9IGFkZGl0aW9uIHJlc3VsdFxuICovXG52YXIgYWRkaXRpb24gPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgdmFyIG11bHRpcGxlTnVtID0gZmluZE11bHRpcGxlTnVtKGEsIGIpO1xuICAgIHJldHVybiAoKGEgKiBtdWx0aXBsZU51bSkgKyAoYiAqIG11bHRpcGxlTnVtKSkgLyBtdWx0aXBsZU51bTtcbn07XG5cbi8qKlxuICogU3VidHJhY3Rpb24gZm9yIGZsb2F0aW5nIHBvaW50IG9wZXJhdGlvbi5cbiAqIEBwYXJhbSB7bnVtYmVyfSBhIHRhcmdldCBhXG4gKiBAcGFyYW0ge251bWJlcn0gYiB0YXJnZXQgYlxuICogQHJldHVybnMge251bWJlcn0gc3VidHJhY3Rpb24gcmVzdWx0XG4gKi9cbnZhciBzdWJ0cmFjdGlvbiA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICB2YXIgbXVsdGlwbGVOdW0gPSBmaW5kTXVsdGlwbGVOdW0oYSwgYik7XG4gICAgcmV0dXJuICgoYSAqIG11bHRpcGxlTnVtKSAtIChiICogbXVsdGlwbGVOdW0pKSAvIG11bHRpcGxlTnVtO1xufTtcblxuLyoqXG4gKiBNdWx0aXBsaWNhdGlvbiBmb3IgZmxvYXRpbmcgcG9pbnQgb3BlcmF0aW9uLlxuICogQHBhcmFtIHtudW1iZXJ9IGEgdGFyZ2V0IGFcbiAqIEBwYXJhbSB7bnVtYmVyfSBiIHRhcmdldCBiXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBtdWx0aXBsaWNhdGlvbiByZXN1bHRcbiAqL1xudmFyIG11bHRpcGxpY2F0aW9uID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHZhciBtdWx0aXBsZU51bSA9IGZpbmRNdWx0aXBsZU51bShhLCBiKTtcbiAgICByZXR1cm4gKChhICogbXVsdGlwbGVOdW0pICogKGIgKiBtdWx0aXBsZU51bSkpIC8gKG11bHRpcGxlTnVtICogbXVsdGlwbGVOdW0pO1xufTtcblxuLyoqXG4gKiBEaXZpc2lvbiBmb3IgZmxvYXRpbmcgcG9pbnQgb3BlcmF0aW9uLlxuICogQHBhcmFtIHtudW1iZXJ9IGEgdGFyZ2V0IGFcbiAqIEBwYXJhbSB7bnVtYmVyfSBiIHRhcmdldCBiXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBkaXZpc2lvbiByZXN1bHRcbiAqL1xudmFyIGRpdmlzaW9uID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHZhciBtdWx0aXBsZU51bSA9IGZpbmRNdWx0aXBsZU51bShhLCBiKTtcbiAgICByZXR1cm4gKGEgKiBtdWx0aXBsZU51bSkgLyAoYiAqIG11bHRpcGxlTnVtKTtcbn07XG5cbi8qKlxuICogU3VtLlxuICogQHBhcmFtIHthcnJheS48bnVtYmVyPn0gdmFsdWVzIHRhcmdldCB2YWx1ZXNcbiAqIEByZXR1cm5zIHtudW1iZXJ9IHJlc3VsdCB2YWx1ZVxuICovXG52YXIgc3VtID0gZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgdmFyIGNvcHlBcnIgPSB2YWx1ZXMuc2xpY2UoKTtcbiAgICBjb3B5QXJyLnVuc2hpZnQoMCk7XG4gICAgcmV0dXJuIG5lLnV0aWwucmVkdWNlKGNvcHlBcnIsIGZ1bmN0aW9uKGJhc2UsIGFkZCkge1xuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChiYXNlKSArIHBhcnNlRmxvYXQoYWRkKTtcbiAgICB9KTtcbn07XG5cbm5lLnV0aWwucmFuZ2UgPSByYW5nZTtcbm5lLnV0aWwucGx1Y2sgPSBwbHVjaztcbm5lLnV0aWwuemlwID0gemlwO1xubmUudXRpbC5taW4gPSBtaW47XG5uZS51dGlsLm1heCA9IG1heDtcbm5lLnV0aWwuYW55ID0gYW55O1xubmUudXRpbC5hbGwgPSBhbGw7XG5uZS51dGlsLmxlbmd0aEFmdGVyUG9pbnQgPSBsZW5ndGhBZnRlclBvaW50O1xubmUudXRpbC5tb2QgPSBtb2Q7XG5uZS51dGlsLmZpbmRNdWx0aXBsZU51bSA9IGZpbmRNdWx0aXBsZU51bTtcbm5lLnV0aWwuYWRkaXRpb24gPSBhZGRpdGlvbjtcbm5lLnV0aWwuc3VidHJhY3Rpb24gPSBzdWJ0cmFjdGlvbjtcbm5lLnV0aWwubXVsdGlwbGljYXRpb24gPSBtdWx0aXBsaWNhdGlvbjtcbm5lLnV0aWwuZGl2aXNpb24gPSBkaXZpc2lvbjtcbm5lLnV0aWwuc3VtID0gc3VtO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IGNoYXJ0IGNvbnN0XG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBDSEFSVF9ERUZBVUxUX1dJRFRIOiA1MDAsXG4gICAgQ0hBUlRfREVGQVVMVF9IRUlHSFQ6IDQwMCxcbiAgICBISURERU5fV0lEVEg6IDEsXG4gICAgVEVYVF9QQURESU5HOiAyLFxuICAgIFNFUklFU19MQUJFTF9QQURESU5HOiA1LFxuICAgIERFRkFVTFRfVElUTEVfRk9OVF9TSVpFOiAxNCxcbiAgICBERUZBVUxUX0FYSVNfVElUTEVfRk9OVF9TSVpFOiAxMCxcbiAgICBERUZBVUxUX0xBQkVMX0ZPTlRfU0laRTogMTIsXG4gICAgREVGQVVMVF9QTFVHSU46ICdyYXBoYWVsJyxcbiAgICBERUZBVUxUX1RJQ0tfQ09MT1I6ICdibGFjaycsXG4gICAgREVGQVVMVF9USEVNRV9OQU1FOiAnZGVmYXVsdCcsXG4gICAgU1RBQ0tFRF9OT1JNQUxfVFlQRTogJ25vcm1hbCcsXG4gICAgU1RBQ0tFRF9QRVJDRU5UX1RZUEU6ICdwZXJjZW50JyxcbiAgICBBTkdMRV8zNjA6IDM2MCxcbiAgICBSQUQ6IE1hdGguUEkgLyAxODAsXG4gICAgREVGQVVMVF9TRVJJRVNfTEFCRUxfRk9OVF9TSVpFOiAxMSxcbiAgICBTRVJJRVNfTEVHRU5EX1RZUEVfT1VURVI6ICdvdXRlcicsXG4gICAgU0VSSUVTX09VVEVSX0xBQkVMX1BBRERJTkc6IDIwLFxuICAgIFBJRV9HUkFQSF9ERUZBVUxUX1JBVEU6IDAuOCxcbiAgICBQSUVfR1JBUEhfU01BTExfUkFURTogMC42NSxcbiAgICBDSEFSVF9UWVBFX0JBUjogJ2JhcicsXG4gICAgQ0hBUlRfVFlQRV9DT0xVTU46ICdjb2x1bW4nLFxuICAgIENIQVJUX1RZUEVfTElORTogJ2xpbmUnLFxuICAgIENIQVJUX1RZUEVfQVJFQTogJ2FyZWEnLFxuICAgIENIQVJUX1RZUEVfQ09NQk86ICdjb21ibycsXG4gICAgQ0hBUlRfVFlQRV9QSUU6ICdwaWUnLFxuICAgIFlBWElTX1BST1BTOiBbJ3RpY2tDb2xvcicsICd0aXRsZScsICdsYWJlbCddLCAvLyB5YXhpcyB0aGVtZeydmCDsho3shLEgLSBjaGFydCB0eXBlIGZpbHRlcmluZ+2VoCDrlYwg7IKs7Jqp65CoXG4gICAgU0VSSUVTX1BST1BTOiBbJ2xhYmVsJywgJ2NvbG9ycycsICdib3JkZXJDb2xvcicsICdzaW5nbGVDb2xvcnMnXSAvLyBzZXJpZXMgdGhlbWXsnZgg7IaN7ISxIC0gY2hhcnQgdHlwZSBmaWx0ZXJpbmftlaAg65WMIOyCrOyaqeuQqFxufTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyAgQ2hhcnQgZmFjdG9yeSBwbGF5IHJvbGUgcmVnaXN0ZXIgY2hhcnQuXG4gKiAgICAgICAgICAgICAgICBBbHNvLCB5b3UgY2FuIGdldCBjaGFydCBmcm9tIHRoaXMgZmFjdG9yeS5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGNoYXJ0cyA9IHt9LFxuICAgIGZhY3RvcnkgPSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgY2hhcnQgaW5zdGFuY2UuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjaGFydFR5cGUgY2hhcnQgdHlwZVxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gZGF0YSBjaGFydCBkYXRhXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgICAgICogQHJldHVybnMge29iamVjdH0gY2hhcnQgaW5zdGFuY2U7XG4gICAgICAgICAqL1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKGNoYXJ0VHlwZSwgZGF0YSwgdGhlbWUsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHZhciBDaGFydCA9IGNoYXJ0c1tjaGFydFR5cGVdLFxuICAgICAgICAgICAgICAgIGNoYXJ0O1xuXG4gICAgICAgICAgICBpZiAoIUNoYXJ0KSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgZXhpc3QgJyArIGNoYXJ0VHlwZSArICcgY2hhcnQuJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNoYXJ0ID0gbmV3IENoYXJ0KGRhdGEsIHRoZW1lLCBvcHRpb25zKTtcblxuICAgICAgICAgICAgcmV0dXJuIGNoYXJ0O1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZWdpc3RlciBjaGFydC5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNoYXJ0VHlwZSBjaGFyIHR5cGVcbiAgICAgICAgICogQHBhcmFtIHtjbGFzc30gQ2hhcnRDbGFzcyBjaGFydCBjbGFzc1xuICAgICAgICAgKi9cbiAgICAgICAgcmVnaXN0ZXI6IGZ1bmN0aW9uKGNoYXJ0VHlwZSwgQ2hhcnRDbGFzcykge1xuICAgICAgICAgICAgY2hhcnRzW2NoYXJ0VHlwZV0gPSBDaGFydENsYXNzO1xuICAgICAgICB9XG4gICAgfTtcblxubW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3ICBQbHVnaW4gZmFjdG9yeSBwbGF5IHJvbGUgcmVnaXN0ZXIgcmVuZGVyaW5nIHBsdWdpbi5cbiAqICAgICAgICAgICAgICAgIEFsc28sIHlvdSBjYW4gZ2V0IHBsdWdpbiBmcm9tIHRoaXMgZmFjdG9yeS5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHBsdWdpbnMgPSB7fSxcbiAgICBmYWN0b3J5ID0ge1xuICAgICAgICAvKipcbiAgICAgICAgICogR2V0IGdyYXBoIHJlbmRlcmVyLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gbGliVHlwZSB0eXBlIG9mIGdyYXBoIGxpYnJhcnlcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNoYXJ0VHlwZSBjaGFydCB0eXBlXG4gICAgICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHJlbmRlcmVyIGluc3RhbmNlXG4gICAgICAgICAqL1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKGxpYlR5cGUsIGNoYXJ0VHlwZSkge1xuICAgICAgICAgICAgdmFyIHBsdWdpbiA9IHBsdWdpbnNbbGliVHlwZV0sXG4gICAgICAgICAgICAgICAgUmVuZGVyZXIsIHJlbmRlcmVyO1xuXG4gICAgICAgICAgICBpZiAoIXBsdWdpbikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGV4aXN0ICcgKyBsaWJUeXBlICsgJyBwbHVnaW4uJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIFJlbmRlcmVyID0gcGx1Z2luW2NoYXJ0VHlwZV07XG4gICAgICAgICAgICBpZiAoIVJlbmRlcmVyKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgZXhpc3QgJyArIGNoYXJ0VHlwZSArICcgY2hhcnQgcmVuZGVyZXIuJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlbmRlcmVyID0gbmV3IFJlbmRlcmVyKCk7XG5cbiAgICAgICAgICAgIHJldHVybiByZW5kZXJlcjtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFBsdWdpbiByZWdpc3Rlci5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGxpYlR5cGUgdHlwZSBvZiBncmFwaCBsaWJyYXJ5XG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwbHVnaW4gcGx1Z2luIHRvIGNvbnRyb2wgbGlicmFyeVxuICAgICAgICAgKi9cbiAgICAgICAgcmVnaXN0ZXI6IGZ1bmN0aW9uKGxpYlR5cGUsIHBsdWdpbikge1xuICAgICAgICAgICAgcGx1Z2luc1tsaWJUeXBlXSA9IHBsdWdpbjtcbiAgICAgICAgfVxuICAgIH07XG5cbm1vZHVsZS5leHBvcnRzID0gZmFjdG9yeTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyAgVGhlbWUgZmFjdG9yeSBwbGF5IHJvbGUgcmVnaXN0ZXIgdGhlbWUuXG4gKiAgICAgICAgICAgICAgICBBbHNvLCB5b3UgY2FuIGdldCB0aGVtZSBmcm9tIHRoaXMgZmFjdG9yeS5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuLi9jb25zdC5qcycpLFxuICAgIGRlZmF1bHRUaGVtZSA9IHJlcXVpcmUoJy4uL3RoZW1lcy9kZWZhdWx0VGhlbWUuanMnKTtcblxudmFyIHRoZW1lcyA9IHt9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAvKipcbiAgICAgKiBHZXQgdGhlbWUuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRoZW1lTmFtZSB0aGVtZSBuYW1lXG4gICAgICogQHJldHVybnMge29iamVjdH0gdGhlbWUgb2JqZWN0XG4gICAgICovXG4gICAgZ2V0OiBmdW5jdGlvbih0aGVtZU5hbWUpIHtcbiAgICAgICAgdmFyIHRoZW1lID0gdGhlbWVzW3RoZW1lTmFtZV07XG5cbiAgICAgICAgaWYgKCF0aGVtZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgZXhpc3QgJyArIHRoZW1lTmFtZSArICcgdGhlbWUuJyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhlbWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRoZW1lIHJlZ2lzdGVyLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0aGVtZU5hbWUgdGhlbWUgbmFtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSB0aGVtZVxuICAgICAqL1xuICAgIHJlZ2lzdGVyOiBmdW5jdGlvbih0aGVtZU5hbWUsIHRoZW1lKSB7XG4gICAgICAgIHZhciB0YXJnZXRJdGVtcztcbiAgICAgICAgdGhlbWUgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoZW1lKSk7XG5cbiAgICAgICAgaWYgKHRoZW1lTmFtZSAhPT0gY2hhcnRDb25zdC5ERUZBVUxUX1RIRU1FX05BTUUpIHtcbiAgICAgICAgICAgIHRoZW1lID0gdGhpcy5faW5pdFRoZW1lKHRoZW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRhcmdldEl0ZW1zID0gdGhpcy5fZ2V0SW5oZXJpdFRhcmdldFRoZW1lSXRlbXModGhlbWUpO1xuXG4gICAgICAgIHRoaXMuX2luaGVyaXRUaGVtZUZvbnQodGhlbWUsIHRhcmdldEl0ZW1zKTtcbiAgICAgICAgdGhpcy5fY29weUNvbG9ySW5mbyh0aGVtZSk7XG4gICAgICAgIHRoZW1lc1t0aGVtZU5hbWVdID0gdGhlbWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEluaXQgdGhlbWUuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIHRoZW1lXG4gICAgICogQHJldHVybnMge29iamVjdH0gdGhlbWVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBpZ25vcmVcbiAgICAgKi9cbiAgICBfaW5pdFRoZW1lOiBmdW5jdGlvbih0aGVtZSkge1xuICAgICAgICB2YXIgY2xvbmVUaGVtZSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZGVmYXVsdFRoZW1lKSksXG4gICAgICAgICAgICBuZXdUaGVtZTtcblxuICAgICAgICB0aGlzLl9jb25jYXREZWZhdWx0Q29sb3JzKHRoZW1lLCBjbG9uZVRoZW1lLnNlcmllcy5jb2xvcnMpXG4gICAgICAgIG5ld1RoZW1lID0gdGhpcy5fb3ZlcndyaXRlVGhlbWUodGhlbWUsIGNsb25lVGhlbWUpO1xuXG4gICAgICAgIG5ld1RoZW1lID0gdGhpcy5fY29weVByb3BlcnR5KHtcbiAgICAgICAgICAgIHByb3BOYW1lOiAneUF4aXMnLFxuICAgICAgICAgICAgZnJvbVRoZW1lOiB0aGVtZSxcbiAgICAgICAgICAgIHRvVGhlbWU6IG5ld1RoZW1lLFxuICAgICAgICAgICAgcmVqZWN0aW9uUHJvcHM6IGNoYXJ0Q29uc3QuWUFYSVNfUFJPUFNcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbmV3VGhlbWUgPSB0aGlzLl9jb3B5UHJvcGVydHkoe1xuICAgICAgICAgICAgcHJvcE5hbWU6ICdzZXJpZXMnLFxuICAgICAgICAgICAgZnJvbVRoZW1lOiB0aGVtZSxcbiAgICAgICAgICAgIHRvVGhlbWU6IG5ld1RoZW1lLFxuICAgICAgICAgICAgcmVqZWN0aW9uUHJvcHM6IGNoYXJ0Q29uc3QuU0VSSUVTX1BST1BTXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBuZXdUaGVtZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmlsdGVyIGNoYXJ0IHR5cGVzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0YXJnZXQgdGFyZ2V0IGNoYXJ0c1xuICAgICAqIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IHJlamVjdGlvblByb3BzIHJlamVjdCBwcm9wZXJ0eVxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IGZpbHRlcmVkIGNoYXJ0cy5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9maWx0ZXJDaGFydFR5cGVzOiBmdW5jdGlvbih0YXJnZXQsIHJlamVjdGlvblByb3BzKSB7XG4gICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cblxuICAgICAgICByZXN1bHQgPSBuZS51dGlsLmZpbHRlcih0YXJnZXQsIGZ1bmN0aW9uKGl0ZW0sIG5hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBuZS51dGlsLmluQXJyYXkobmFtZSwgcmVqZWN0aW9uUHJvcHMpID09PSAtMTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvbmNhdCBjb2xvcnMuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIHRoZW1lXG4gICAgICogQHBhcmFtIHthcnJheS48c3RyaW5nPn0gc2VyaWVzQ29sb3JzIHNlcmllcyBjb2xvcnNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jb25jYXRDb2xvcnM6IGZ1bmN0aW9uKHRoZW1lLCBzZXJpZXNDb2xvcnMpIHtcbiAgICAgICAgaWYgKHRoZW1lLmNvbG9ycykge1xuICAgICAgICAgICAgdGhlbWUuY29sb3JzID0gdGhlbWUuY29sb3JzLmNvbmNhdChzZXJpZXNDb2xvcnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoZW1lLnNpbmdsZUNvbG9ycykge1xuICAgICAgICAgICAgdGhlbWUuc2luZ2xlQ29sb3JzID0gdGhlbWUuc2luZ2xlQ29sb3JzLmNvbmNhdChzZXJpZXNDb2xvcnMpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvbmNhdCBkZWZhdWx0IGNvbG9ycy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgdGhlbWVcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBzZXJpZXNDb2xvcnMgc2VyaWVzIGNvbG9yc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NvbmNhdERlZmF1bHRDb2xvcnM6IGZ1bmN0aW9uKHRoZW1lLCBzZXJpZXNDb2xvcnMpIHtcbiAgICAgICAgdmFyIGNoYXJ0VHlwZXM7XG5cbiAgICAgICAgaWYgKCF0aGVtZS5zZXJpZXMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNoYXJ0VHlwZXMgPSB0aGlzLl9maWx0ZXJDaGFydFR5cGVzKHRoZW1lLnNlcmllcywgY2hhcnRDb25zdC5TRVJJRVNfUFJPUFMpO1xuXG4gICAgICAgIGlmICghbmUudXRpbC5rZXlzKGNoYXJ0VHlwZXMpLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5fY29uY2F0Q29sb3JzKHRoZW1lLnNlcmllcywgc2VyaWVzQ29sb3JzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5lLnV0aWwuZm9yRWFjaChjaGFydFR5cGVzLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY29uY2F0Q29sb3JzKGl0ZW0sIHNlcmllc0NvbG9ycyk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBPdmVyd3JpdGUgdGhlbWVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZnJvbSBmcm9tIHRoZW1lIHByb3BlcnR5XG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRvIHRvIHRoZW1lIHByb3BlcnR5XG4gICAgICogQHJldHVybnMge29iamVjdH0gcmVzdWx0IHByb3BlcnR5XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb3ZlcndyaXRlVGhlbWU6IGZ1bmN0aW9uKGZyb20sIHRvKSB7XG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaCh0bywgZnVuY3Rpb24oaXRlbSwga2V5KSB7XG4gICAgICAgICAgICB2YXIgZnJvbUl0ZW0gPSBmcm9tW2tleV07XG4gICAgICAgICAgICBpZiAoIWZyb21JdGVtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobmUudXRpbC5pc0FycmF5KGZyb21JdGVtKSkge1xuICAgICAgICAgICAgICAgIHRvW2tleV0gPSBmcm9tSXRlbS5zbGljZSgpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChuZS51dGlsLmlzT2JqZWN0KGZyb21JdGVtKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX292ZXJ3cml0ZVRoZW1lKGZyb21JdGVtLCBpdGVtKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdG9ba2V5XSA9IGZyb21JdGVtO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICByZXR1cm4gdG87XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvcHkgcHJvcGVydHkuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLnByb3BOYW1lIHByb3BlcnR5IG5hbWVcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuZnJvbVRoZW1lIGZyb20gcHJvcGVydHlcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudG9UaGVtZSB0cCBwcm9wZXJ0eVxuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48c3RyaW5nPn0gcGFyYW1zLnJlamVjdGlvblByb3BzIHJlamVjdCBwcm9wZXJ0eSBuYW1lXG4gICAgICogQHJldHVybnMge29iamVjdH0gY29waWVkIHByb3BlcnR5XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY29weVByb3BlcnR5OiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGNoYXJ0VHlwZXM7XG5cbiAgICAgICAgaWYgKCFwYXJhbXMudG9UaGVtZVtwYXJhbXMucHJvcE5hbWVdKSB7XG4gICAgICAgICAgICByZXR1cm4gcGFyYW1zLnRvVGhlbWU7XG4gICAgICAgIH1cblxuICAgICAgICBjaGFydFR5cGVzID0gdGhpcy5fZmlsdGVyQ2hhcnRUeXBlcyhwYXJhbXMuZnJvbVRoZW1lW3BhcmFtcy5wcm9wTmFtZV0sIHBhcmFtcy5yZWplY3Rpb25Qcm9wcyk7XG4gICAgICAgIGlmIChuZS51dGlsLmtleXMoY2hhcnRUeXBlcykubGVuZ3RoKSB7XG4gICAgICAgICAgICBuZS51dGlsLmZvckVhY2goY2hhcnRUeXBlcywgZnVuY3Rpb24oaXRlbSwga2V5KSB7XG4gICAgICAgICAgICAgICAgdmFyIGNsb25lVGhlbWUgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGRlZmF1bHRUaGVtZVtwYXJhbXMucHJvcE5hbWVdKSk7XG4gICAgICAgICAgICAgICAgcGFyYW1zLmZyb21UaGVtZVtwYXJhbXMucHJvcE5hbWVdW2tleV0gPSB0aGlzLl9vdmVyd3JpdGVUaGVtZShpdGVtLCBjbG9uZVRoZW1lKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgICAgICBwYXJhbXMudG9UaGVtZVtwYXJhbXMucHJvcE5hbWVdID0gcGFyYW1zLmZyb21UaGVtZVtwYXJhbXMucHJvcE5hbWVdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhcmFtcy50b1RoZW1lO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDb3B5IGNvbG9yIGluZm8gdG8gbGVnZW5kXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHNlcmllc1RoZW1lIHNlcmllcyB0aGVtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBsZWdlbmRUaGVtZSBsZWdlbmQgdGhlbWVcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBjb2xvcnMgY29sb3JzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY29weUNvbG9ySW5mb1RvTGVnZW5kOiBmdW5jdGlvbihzZXJpZXNUaGVtZSwgbGVnZW5kVGhlbWUsIGNvbG9ycykge1xuICAgICAgICBsZWdlbmRUaGVtZS5jb2xvcnMgPSBjb2xvcnMgfHwgc2VyaWVzVGhlbWUuY29sb3JzO1xuICAgICAgICBpZiAoc2VyaWVzVGhlbWUuc2luZ2xlQ29sb3JzKSB7XG4gICAgICAgICAgICBsZWdlbmRUaGVtZS5zaW5nbGVDb2xvcnMgPSBzZXJpZXNUaGVtZS5zaW5nbGVDb2xvcnM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNlcmllc1RoZW1lLmJvcmRlckNvbG9yKSB7XG4gICAgICAgICAgICBsZWdlbmRUaGVtZS5ib3JkZXJDb2xvciA9IHNlcmllc1RoZW1lLmJvcmRlckNvbG9yO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB0YXJnZXQgaXRlbXMgYWJvdXQgZm9udCBpbmhlcml0LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSB0aGVtZVxuICAgICAqIEByZXR1cm5zIHthcnJheS48b2JqZWN0Pn0gdGFyZ2V0IGl0ZW1zXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0SW5oZXJpdFRhcmdldFRoZW1lSXRlbXM6IGZ1bmN0aW9uKHRoZW1lKSB7XG4gICAgICAgIHZhciBpdGVtcyA9IFtcbiAgICAgICAgICAgICAgICB0aGVtZS50aXRsZSxcbiAgICAgICAgICAgICAgICB0aGVtZS54QXhpcy50aXRsZSxcbiAgICAgICAgICAgICAgICB0aGVtZS54QXhpcy5sYWJlbCxcbiAgICAgICAgICAgICAgICB0aGVtZS5sZWdlbmQubGFiZWxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB5QXhpc0NoYXJ0VHlwZXMgPSB0aGlzLl9maWx0ZXJDaGFydFR5cGVzKHRoZW1lLnlBeGlzLCBjaGFydENvbnN0LllBWElTX1BST1BTKSxcbiAgICAgICAgICAgIHNlcmllc0NoYXJ0VHlwZXMgPSB0aGlzLl9maWx0ZXJDaGFydFR5cGVzKHRoZW1lLnNlcmllcywgY2hhcnRDb25zdC5TRVJJRVNfUFJPUFMpO1xuXG4gICAgICAgIGlmICghbmUudXRpbC5rZXlzKHlBeGlzQ2hhcnRUeXBlcykubGVuZ3RoKSB7XG4gICAgICAgICAgICBpdGVtcy5wdXNoKHRoZW1lLnlBeGlzLnRpdGxlKTtcbiAgICAgICAgICAgIGl0ZW1zLnB1c2godGhlbWUueUF4aXMubGFiZWwpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmUudXRpbC5mb3JFYWNoKHlBeGlzQ2hhcnRUeXBlcywgZnVuY3Rpb24oY2hhdFR5cGUpIHtcbiAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKGNoYXRUeXBlLnRpdGxlKTtcbiAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKGNoYXRUeXBlLmxhYmVsKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFuZS51dGlsLmtleXMoc2VyaWVzQ2hhcnRUeXBlcykubGVuZ3RoKSB7XG4gICAgICAgICAgICBpdGVtcy5wdXNoKHRoZW1lLnNlcmllcy5sYWJlbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZS51dGlsLmZvckVhY2goeUF4aXNDaGFydFR5cGVzLCBmdW5jdGlvbihjaGF0VHlwZSkge1xuICAgICAgICAgICAgICAgIGl0ZW1zLnB1c2goY2hhdFR5cGUubGFiZWwpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGl0ZW1zO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbmhlcml0IHRoZW1lIGZvbnQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIHRoZW1lXG4gICAgICogQHBhcmFtIHthcnJheS48b2JqZWN0Pn0gdGFyZ2V0SXRlbXMgdGFyZ2V0IHRoZW1lIGl0ZW1zXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaW5oZXJpdFRoZW1lRm9udDogZnVuY3Rpb24odGhlbWUsIHRhcmdldEl0ZW1zKSB7XG4gICAgICAgIHZhciBiYXNlRm9udCA9IHRoZW1lLmNoYXJ0LmZvbnRGYW1pbHk7XG5cbiAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkodGFyZ2V0SXRlbXMsIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgIGlmICghaXRlbS5mb250RmFtaWx5KSB7XG4gICAgICAgICAgICAgICAgaXRlbS5mb250RmFtaWx5ID0gYmFzZUZvbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDb3B5IGNvbG9yIGluZm8uXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIHRoZW1lXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAaWdub3JlXG4gICAgICovXG4gICAgX2NvcHlDb2xvckluZm86IGZ1bmN0aW9uKHRoZW1lKSB7XG4gICAgICAgIHZhciBzZXJpZXNDaGFydFR5cGVzID0gdGhpcy5fZmlsdGVyQ2hhcnRUeXBlcyh0aGVtZS5zZXJpZXMsIGNoYXJ0Q29uc3QuU0VSSUVTX1BST1BTKTtcbiAgICAgICAgaWYgKCFuZS51dGlsLmtleXMoc2VyaWVzQ2hhcnRUeXBlcykubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLl9jb3B5Q29sb3JJbmZvVG9MZWdlbmQodGhlbWUuc2VyaWVzLCB0aGVtZS5sZWdlbmQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmUudXRpbC5mb3JFYWNoKHNlcmllc0NoYXJ0VHlwZXMsIGZ1bmN0aW9uKGl0ZW0sIGNoYXJ0VHlwZSkge1xuICAgICAgICAgICAgICAgIHRoZW1lLmxlZ2VuZFtjaGFydFR5cGVdID0ge307XG4gICAgICAgICAgICAgICAgdGhpcy5fY29weUNvbG9ySW5mb1RvTGVnZW5kKGl0ZW0sIHRoZW1lLmxlZ2VuZFtjaGFydFR5cGVdLCBpdGVtLmNvbG9ycyB8fCB0aGVtZS5sZWdlbmQuY29sb3JzKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhlbWUubGVnZW5kLmNvbG9ycztcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9XG4gICAgfVxufTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBBeGlzIERhdGEgTWFrZXJcbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuLi9jb25zdC5qcycpLFxuICAgIGNhbGN1bGF0b3IgPSByZXF1aXJlKCcuL2NhbGN1bGF0b3IuanMnKTtcblxudmFyIE1JTl9QSVhFTF9TVEVQX1NJWkUgPSA0MCxcbiAgICBNQVhfUElYRUxfU1RFUF9TSVpFID0gNjAsXG4gICAgUEVSQ0VOVF9TVEFDS0VEX1RJQ0tfSU5GTyA9IHtcbiAgICAgICAgc2NhbGU6IHtcbiAgICAgICAgICAgIG1pbjogMCxcbiAgICAgICAgICAgIG1heDogMTAwXG4gICAgICAgIH0sXG4gICAgICAgIHN0ZXA6IDI1LFxuICAgICAgICB0aWNrQ291bnQ6IDUsXG4gICAgICAgIGxhYmVsczogWzAsIDI1LCA1MCwgNzUsIDEwMF1cbiAgICB9O1xuXG52YXIgYWJzID0gTWF0aC5hYnMsXG4gICAgY29uY2F0ID0gQXJyYXkucHJvdG90eXBlLmNvbmNhdDtcblxuLyoqXG4gKiBBeGlzIGRhdGEgbWFrZXIuXG4gKiBAbW9kdWxlIGF4aXNEYXRhTWFrZXJcbiAqL1xudmFyIGF4aXNEYXRhTWFrZXIgPSB7XG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBkYXRhIGFib3V0IGxhYmVsIGF4aXMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBsYWJlbHMgY2hhcnQgbGFiZWxzXG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IGlzVmVydGljYWwgd2hldGhlciB2ZXJ0aWNhbCBvciBub3RcbiAgICAgKiBAcmV0dXJucyB7e1xuICAgICAqICAgICAgbGFiZWxzOiBhcnJheS48c3RyaW5nPixcbiAgICAgKiAgICAgIHRpY2tDb3VudDogbnVtYmVyLFxuICAgICAqICAgICAgdmFsaWRUaWNrQ291bnQ6IG51bWJlcixcbiAgICAgKiAgICAgIGlzTGFiZWxBeGlzOiBib29sZWFuLFxuICAgICAqICAgICAgaXNWZXJ0aWNhbDogYm9vbGVhblxuICAgICAqIH19IGF4aXMgZGF0YVxuICAgICAqL1xuICAgIG1ha2VMYWJlbEF4aXNEYXRhOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxhYmVsczogcGFyYW1zLmxhYmVscyxcbiAgICAgICAgICAgIHRpY2tDb3VudDogcGFyYW1zLmxhYmVscy5sZW5ndGggKyAxLFxuICAgICAgICAgICAgdmFsaWRUaWNrQ291bnQ6IDAsXG4gICAgICAgICAgICBpc0xhYmVsQXhpczogdHJ1ZSxcbiAgICAgICAgICAgIGlzVmVydGljYWw6ICEhcGFyYW1zLmlzVmVydGljYWxcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBkYXRhIGFib3V0IHZhbHVlIGF4aXMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheS48bnVtYmVyPj59IHBhcmFtcy52YWx1ZXMgY2hhcnQgdmFsdWVzXG4gICAgICogICAgICBAcGFyYW0ge3t3aWR0aDpudW1iZXIsIGhlaWdodDpudW1iZXJ9fSBwYXJhbXMuc2VyaWVzRGltZW5zaW9uIHNlcmllcyBkaW1lbnNpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPGZ1bmN0aW9uPn0gcGFyYW1zLmZvcm1hdEZ1bmN0aW9ucyBmb3JtYXQgZnVuY3Rpb25zXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLnN0YWNrZWQgc3RhY2tlZCBvcHRpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMub3B0aW9ucyBheGlzIG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7e1xuICAgICAqICAgICAgbGFiZWxzOiBhcnJheS48c3RyaW5nPixcbiAgICAgKiAgICAgIHRpY2tDb3VudDogbnVtYmVyLFxuICAgICAqICAgICAgdmFsaWRUaWNrQ291bnQ6IG51bWJlcixcbiAgICAgKiAgICAgIGlzTGFiZWxBeGlzOiBib29sZWFuLFxuICAgICAqICAgICAgc2NhbGU6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9LFxuICAgICAqICAgICAgaXNWZXJ0aWNhbDogYm9vbGVhblxuICAgICAqIH19IGF4aXMgZGF0YVxuICAgICAqL1xuICAgIG1ha2VWYWx1ZUF4aXNEYXRhOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSBwYXJhbXMub3B0aW9ucyB8fCB7fSxcbiAgICAgICAgICAgIGlzVmVydGljYWwgPSAhIXBhcmFtcy5pc1ZlcnRpY2FsLFxuICAgICAgICAgICAgaXNQb3NpdGlvblJpZ2h0ID0gISFwYXJhbXMuaXNQb3NpdGlvblJpZ2h0LFxuICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zID0gcGFyYW1zLmZvcm1hdEZ1bmN0aW9ucyxcbiAgICAgICAgICAgIHRpY2tJbmZvO1xuICAgICAgICBpZiAocGFyYW1zLnN0YWNrZWQgPT09ICdwZXJjZW50Jykge1xuICAgICAgICAgICAgdGlja0luZm8gPSBQRVJDRU5UX1NUQUNLRURfVElDS19JTkZPO1xuICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zID0gW107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aWNrSW5mbyA9IHRoaXMuX2dldFRpY2tJbmZvKHtcbiAgICAgICAgICAgICAgICB2YWx1ZXM6IHRoaXMuX21ha2VCYXNlVmFsdWVzKHBhcmFtcy52YWx1ZXMsIHBhcmFtcy5zdGFja2VkKSxcbiAgICAgICAgICAgICAgICBzZXJpZXNEaW1lbnNpb246IHBhcmFtcy5zZXJpZXNEaW1lbnNpb24sXG4gICAgICAgICAgICAgICAgaXNWZXJ0aWNhbDogaXNWZXJ0aWNhbCxcbiAgICAgICAgICAgICAgICBpc1Bvc2l0aW9uUmlnaHQ6IGlzUG9zaXRpb25SaWdodCxcbiAgICAgICAgICAgICAgICBjaGFydFR5cGU6IHBhcmFtcy5jaGFydFR5cGVcbiAgICAgICAgICAgIH0sIG9wdGlvbnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxhYmVsczogdGhpcy5fZm9ybWF0TGFiZWxzKHRpY2tJbmZvLmxhYmVscywgZm9ybWF0RnVuY3Rpb25zKSxcbiAgICAgICAgICAgIHRpY2tDb3VudDogdGlja0luZm8udGlja0NvdW50LFxuICAgICAgICAgICAgdmFsaWRUaWNrQ291bnQ6IHRpY2tJbmZvLnRpY2tDb3VudCxcbiAgICAgICAgICAgIHNjYWxlOiB0aWNrSW5mby5zY2FsZSxcbiAgICAgICAgICAgIHN0ZXA6IHRpY2tJbmZvLnN0ZXAsXG4gICAgICAgICAgICBpc1ZlcnRpY2FsOiBpc1ZlcnRpY2FsLFxuICAgICAgICAgICAgaXNQb3NpdGlvblJpZ2h0OiBpc1Bvc2l0aW9uUmlnaHRcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBiYXNlIHZhbHVlcy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxudW1iZXI+fSBncm91cFZhbHVlcyBncm91cCB2YWx1ZXNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhY2tlZCBzdGFja2VkIG9wdGlvbi5cbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPG51bWJlcj59IGJhc2UgdmFsdWVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUJhc2VWYWx1ZXM6IGZ1bmN0aW9uKGdyb3VwVmFsdWVzLCBzdGFja2VkKSB7XG4gICAgICAgIHZhciBiYXNlVmFsdWVzID0gY29uY2F0LmFwcGx5KFtdLCBncm91cFZhbHVlcyk7IC8vIGZsYXR0ZW4gYXJyYXlcbiAgICAgICAgaWYgKHN0YWNrZWQgPT09IGNoYXJ0Q29uc3QuU1RBQ0tFRF9OT1JNQUxfVFlQRSkge1xuICAgICAgICAgICAgYmFzZVZhbHVlcyA9IGJhc2VWYWx1ZXMuY29uY2F0KG5lLnV0aWwubWFwKGdyb3VwVmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGx1c1ZhbHVlcyA9IG5lLnV0aWwuZmlsdGVyKHZhbHVlcywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlID4gMDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmUudXRpbC5zdW0ocGx1c1ZhbHVlcyk7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJhc2VWYWx1ZXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBiYXNlIHNpemUgZm9yIGdldCBjYW5kaWRhdGUgdGljayBjb3VudHMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBkaW1lbnNpb24gY2hhdCBkaW1lbnNpb25cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzVmVydGljYWwgd2hldGhlciB2ZXJ0aWNhbCBvciBub3RcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBiYXNlIHNpemVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRCYXNlU2l6ZTogZnVuY3Rpb24oZGltZW5zaW9uLCBpc1ZlcnRpY2FsKSB7XG4gICAgICAgIHZhciBiYXNlU2l6ZTtcbiAgICAgICAgaWYgKGlzVmVydGljYWwpIHtcbiAgICAgICAgICAgIGJhc2VTaXplID0gZGltZW5zaW9uLmhlaWdodDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJhc2VTaXplID0gZGltZW5zaW9uLndpZHRoO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBiYXNlU2l6ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNhbmRpZGF0ZSB0aWNrIGNvdW50cy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGNoYXJ0RGltZW5zaW9uIGNoYXQgZGltZW5zaW9uXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpc1ZlcnRpY2FsIHdoZXRoZXIgdmVydGljYWwgb3Igbm90XG4gICAgICogQHJldHVybnMge2FycmF5LjxudW1iZXI+fSB0aWNrIGNvdW50c1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldENhbmRpZGF0ZVRpY2tDb3VudHM6IGZ1bmN0aW9uKGNoYXJ0RGltZW5zaW9uLCBpc1ZlcnRpY2FsKSB7XG4gICAgICAgIHZhciBiYXNlU2l6ZSA9IHRoaXMuX2dldEJhc2VTaXplKGNoYXJ0RGltZW5zaW9uLCBpc1ZlcnRpY2FsKSxcbiAgICAgICAgICAgIHN0YXJ0ID0gcGFyc2VJbnQoYmFzZVNpemUgLyBNQVhfUElYRUxfU1RFUF9TSVpFLCAxMCksXG4gICAgICAgICAgICBlbmQgPSBwYXJzZUludChiYXNlU2l6ZSAvIE1JTl9QSVhFTF9TVEVQX1NJWkUsIDEwKSArIDEsXG4gICAgICAgICAgICB0aWNrQ291bnRzID0gbmUudXRpbC5yYW5nZShzdGFydCwgZW5kKTtcbiAgICAgICAgcmV0dXJuIHRpY2tDb3VudHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjb21wYXJpbmcgdmFsdWUuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1pbiBtaW5pbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtYXggbWF4aW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiBAcGFyYW0ge3tzY2FsZToge21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn0sIHN0ZXA6IG51bWJlcn19IHRpY2tJbmZvIHRpY2sgaW5mb1xuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IGNvbXBhcmluZyB2YWx1ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldENvbXBhcmluZ1ZhbHVlOiBmdW5jdGlvbihtaW4sIG1heCwgdGlja0luZm8pIHtcbiAgICAgICAgdmFyIGRpZmZNYXggPSBhYnModGlja0luZm8uc2NhbGUubWF4IC0gbWF4KSxcbiAgICAgICAgICAgIGRpZmZNaW4gPSBhYnMobWluIC0gdGlja0luZm8uc2NhbGUubWluKSxcbiAgICAgICAgICAgIHdlaWdodCA9IE1hdGgucG93KDEwLCBuZS51dGlsLmxlbmd0aEFmdGVyUG9pbnQodGlja0luZm8uc3RlcCkpO1xuICAgICAgICByZXR1cm4gKGRpZmZNYXggKyBkaWZmTWluKSAqIHdlaWdodDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2VsZWN0IHRpY2sgaW5mby5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWluIG1pbmltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1heCBtYXhpbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7YXJyYXkuPG9iamVjdD59IGNhbmRpZGF0ZXMgdGljayBpbmZvIGNhbmRpZGF0ZXNcbiAgICAgKiBAcmV0dXJucyB7e3NjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfSwgdGlja0NvdW50OiBudW1iZXIsIHN0ZXA6IG51bWJlciwgbGFiZWxzOiBhcnJheS48bnVtYmVyPn19IHNlbGVjdGVkIHRpY2sgaW5mb1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NlbGVjdFRpY2tJbmZvOiBmdW5jdGlvbihtaW4sIG1heCwgY2FuZGlkYXRlcykge1xuICAgICAgICB2YXIgZ2V0Q29tcGFyaW5nVmFsdWUgPSBuZS51dGlsLmJpbmQodGhpcy5fZ2V0Q29tcGFyaW5nVmFsdWUsIHRoaXMsIG1pbiwgbWF4KSxcbiAgICAgICAgICAgIHRpY2tJbmZvID0gbmUudXRpbC5taW4oY2FuZGlkYXRlcywgZ2V0Q29tcGFyaW5nVmFsdWUpO1xuICAgICAgICByZXR1cm4gdGlja0luZm87XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB0aWNrIGNvdW50IGFuZCBzY2FsZS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMudmFsdWVzIGJhc2UgdmFsdWVzXG4gICAgICogICAgICBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IHBhcmFtcy5zZXJpZXNEaW1lbnNpb24gY2hhdCBkaW1lbnNpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gcGFyYW1zLmlzVmVydGljYWwgd2hldGhlciB2ZXJ0aWNhbCBvciBub3RcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMuY2hhcnRUeXBlIGNoYXQgdHlwZVxuICAgICAqIEBwYXJhbSB7e21pbjogbnVtYmVyLCBtYXg6bnVtYmVyfX0gb3B0aW9ucyBheGlzIG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7e3RpY2tDb3VudDogbnVtYmVyLCBzY2FsZTogb2JqZWN0fX0gdGljayBpbmZvXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0VGlja0luZm86IGZ1bmN0aW9uKHBhcmFtcywgb3B0aW9ucykge1xuICAgICAgICB2YXIgbWluID0gbmUudXRpbC5taW4ocGFyYW1zLnZhbHVlcyksXG4gICAgICAgICAgICBtYXggPSBuZS51dGlsLm1heChwYXJhbXMudmFsdWVzKSxcbiAgICAgICAgICAgIGludFR5cGVJbmZvLCB0aWNrQ291bnRzLCBjYW5kaWRhdGVzLCB0aWNrSW5mbztcbiAgICAgICAgLy8gMDEuIG1pbiwgbWF4LCBvcHRpb25zIOygleuztOulvCDsoJXsiJjtmJXsnLzroZwg67OA6rK9XG4gICAgICAgIGludFR5cGVJbmZvID0gdGhpcy5fbWFrZUludGVnZXJUeXBlSW5mbyhtaW4sIG1heCwgb3B0aW9ucyk7XG5cbiAgICAgICAgLy8gMDIuIHRpY2sgY291bnQg7ZuE67O06rWwIOyWu+q4sFxuICAgICAgICB0aWNrQ291bnRzID0gcGFyYW1zLnRpY2tDb3VudCA/IFtwYXJhbXMudGlja0NvdW50XSA6IHRoaXMuX2dldENhbmRpZGF0ZVRpY2tDb3VudHMocGFyYW1zLnNlcmllc0RpbWVuc2lvbiwgcGFyYW1zLmlzVmVydGljYWwpO1xuXG4gICAgICAgIC8vIDAzLiB0aWNrIGluZm8g7ZuE67O06rWwIOqzhOyCsFxuICAgICAgICBjYW5kaWRhdGVzID0gdGhpcy5fZ2V0Q2FuZGlkYXRlVGlja0luZm9zKHtcbiAgICAgICAgICAgIG1pbjogaW50VHlwZUluZm8ubWluLFxuICAgICAgICAgICAgbWF4OiBpbnRUeXBlSW5mby5tYXgsXG4gICAgICAgICAgICB0aWNrQ291bnRzOiB0aWNrQ291bnRzLFxuICAgICAgICAgICAgY2hhcnRUeXBlOiBwYXJhbXMuY2hhcnRUeXBlXG4gICAgICAgIH0sIGludFR5cGVJbmZvLm9wdGlvbnMpO1xuXG4gICAgICAgIC8vIDA0LiB0aWNrIGluZm8g7ZuE67O06rWwIOykkSDtlZjrgpgg7ISg7YOdXG4gICAgICAgIHRpY2tJbmZvID0gdGhpcy5fc2VsZWN0VGlja0luZm8oaW50VHlwZUluZm8ubWluLCBpbnRUeXBlSW5mby5tYXgsIGNhbmRpZGF0ZXMpO1xuXG4gICAgICAgIC8vIDA1LiDsoJXsiJjtmJXsnLzroZwg67OA6rK97ZaI642YIHRpY2sgaW5mb+ulvCDsm5Drnpgg7ZiV7YOc66GcIOuzgOqyvVxuICAgICAgICB0aWNrSW5mbyA9IHRoaXMuX3JldmVydE9yaWdpbmFsVHlwZVRpY2tJbmZvKHRpY2tJbmZvLCBpbnRUeXBlSW5mby5kaXZpZGVOdW0pO1xuICAgICAgICByZXR1cm4gdGlja0luZm87XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgaW50ZWdlciB0eXBlIGluZm9cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWluIG1pbmltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1heCBtYXhpbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7e21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19IG9wdGlvbnMgYXhpcyBvcHRpb25zXG4gICAgICogQHJldHVybnMge3ttaW46IG51bWJlciwgbWF4OiBudW1iZXIsIG9wdGlvbnM6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9LCBkaXZpZGVOdW06IG51bWJlcn19IGludGVnZXIgdHlwZSBpbmZvXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUludGVnZXJUeXBlSW5mbzogZnVuY3Rpb24obWluLCBtYXgsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIG11bHRpcGxlTnVtLCBjaGFuZ2VkT3B0aW9ucztcblxuICAgICAgICBpZiAoYWJzKG1pbikgPj0gMSB8fCBhYnMobWF4KSA+PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG1pbjogbWluLFxuICAgICAgICAgICAgICAgIG1heDogbWF4LFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IG9wdGlvbnMsXG4gICAgICAgICAgICAgICAgZGl2aWRlTnVtOiAxXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgbXVsdGlwbGVOdW0gPSBuZS51dGlsLmZpbmRNdWx0aXBsZU51bShtaW4sIG1heCk7XG4gICAgICAgIGNoYW5nZWRPcHRpb25zID0ge307XG5cbiAgICAgICAgaWYgKG9wdGlvbnMubWluKSB7XG4gICAgICAgICAgICBjaGFuZ2VkT3B0aW9ucy5taW4gPSBvcHRpb25zLm1pbiAqIG11bHRpcGxlTnVtO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9wdGlvbnMubWF4KSB7XG4gICAgICAgICAgICBjaGFuZ2VkT3B0aW9ucy5tYXggPSBvcHRpb25zLm1heCAqIG11bHRpcGxlTnVtO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG1pbjogbWluICogbXVsdGlwbGVOdW0sXG4gICAgICAgICAgICBtYXg6IG1heCAqIG11bHRpcGxlTnVtLFxuICAgICAgICAgICAgb3B0aW9uczogY2hhbmdlZE9wdGlvbnMsXG4gICAgICAgICAgICBkaXZpZGVOdW06IG11bHRpcGxlTnVtXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldmVydCB0aWNrIGluZm8gdG8gb3JpZ2luYWwgdHlwZS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge3tzdGVwOiBudW1iZXIsIHNjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfSwgbGFiZWxzOiBhcnJheS48bnVtYmVyPn19IHRpY2tJbmZvIHRpY2sgaW5mb1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBkaXZpZGVOdW0gZGl2aWRlIG51bVxuICAgICAqIEByZXR1cm5zIHt7c3RlcDogbnVtYmVyLCBzY2FsZToge21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn0sIGxhYmVsczogYXJyYXkuPG51bWJlcj59fSBkaXZpZGVkIHRpY2sgaW5mb1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JldmVydE9yaWdpbmFsVHlwZVRpY2tJbmZvOiBmdW5jdGlvbih0aWNrSW5mbywgZGl2aWRlTnVtKSB7XG4gICAgICAgIGlmIChkaXZpZGVOdW0gPT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiB0aWNrSW5mbztcbiAgICAgICAgfVxuXG4gICAgICAgIHRpY2tJbmZvLnN0ZXAgPSBuZS51dGlsLmRpdmlzaW9uKHRpY2tJbmZvLnN0ZXAsIGRpdmlkZU51bSk7XG4gICAgICAgIHRpY2tJbmZvLnNjYWxlLm1pbiA9IG5lLnV0aWwuZGl2aXNpb24odGlja0luZm8uc2NhbGUubWluLCBkaXZpZGVOdW0pO1xuICAgICAgICB0aWNrSW5mby5zY2FsZS5tYXggPSBuZS51dGlsLmRpdmlzaW9uKHRpY2tJbmZvLnNjYWxlLm1heCwgZGl2aWRlTnVtKTtcbiAgICAgICAgdGlja0luZm8ubGFiZWxzID0gbmUudXRpbC5tYXAodGlja0luZm8ubGFiZWxzLCBmdW5jdGlvbihsYWJlbCkge1xuICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwuZGl2aXNpb24obGFiZWwsIGRpdmlkZU51bSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB0aWNrSW5mbztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTm9ybWFsaXplIHN0ZXAuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHN0ZXAgb3JpZ2luYWwgc3RlcFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IG5vcm1hbGl6ZWQgc3RlcFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX25vcm1hbGl6ZVN0ZXA6IGZ1bmN0aW9uKHN0ZXApIHtcbiAgICAgICAgcmV0dXJuIGNhbGN1bGF0b3Iubm9ybWFsaXplQXhpc051bWJlcihzdGVwKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWluaW1pemUgdGljayBzY2FsZS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMudXNlck1pbiB1c2VyIG1pblxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy51c2VyTWF4IHVzZXIgbWF4XG4gICAgICogICAgICBAcGFyYW0ge3t0aWNrQ291bnQ6IG51bWJlciwgc2NhbGU6IG9iamVjdH19IHBhcmFtcy50aWNrSW5mbyB0aWNrIGluZm9cbiAgICAgKiAgICAgIEBwYXJhbSB7e21pbjogbnVtYmVyLCBtYXg6bnVtYmVyfX0gcGFyYW1zLm9wdGlvbnMgYXhpcyBvcHRpb25zXG4gICAgICogQHJldHVybnMge3t0aWNrQ291bnQ6IG51bWJlciwgc2NhbGU6IG9iamVjdCwgbGFiZWxzOiBhcnJheX19IGNvcnJlY3RlZCB0aWNrIGluZm9cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9taW5pbWl6ZVRpY2tTY2FsZTogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciB0aWNrSW5mbyA9IHBhcmFtcy50aWNrSW5mbyxcbiAgICAgICAgICAgIHRpY2tzID0gbmUudXRpbC5yYW5nZSgxLCB0aWNrSW5mby50aWNrQ291bnQpLFxuICAgICAgICAgICAgb3B0aW9ucyA9IHBhcmFtcy5vcHRpb25zLFxuICAgICAgICAgICAgc3RlcCA9IHRpY2tJbmZvLnN0ZXAsXG4gICAgICAgICAgICBzY2FsZSA9IHRpY2tJbmZvLnNjYWxlLFxuICAgICAgICAgICAgdGlja01heCA9IHNjYWxlLm1heCxcbiAgICAgICAgICAgIHRpY2tNaW4gPSBzY2FsZS5taW4sXG4gICAgICAgICAgICBpc1VuZGVmaW5lZE1pbiA9IG5lLnV0aWwuaXNVbmRlZmluZWQob3B0aW9ucy5taW4pLFxuICAgICAgICAgICAgaXNVbmRlZmluZWRNYXggPSBuZS51dGlsLmlzVW5kZWZpbmVkKG9wdGlvbnMubWF4KSxcbiAgICAgICAgICAgIGxhYmVscztcbiAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkodGlja3MsIGZ1bmN0aW9uKHRpY2tJbmRleCkge1xuICAgICAgICAgICAgdmFyIGN1clN0ZXAgPSAoc3RlcCAqIHRpY2tJbmRleCksXG4gICAgICAgICAgICAgICAgY3VyTWluID0gdGlja01pbiArIGN1clN0ZXAsXG4gICAgICAgICAgICAgICAgY3VyTWF4ID0gdGlja01heCAtIGN1clN0ZXA7XG5cbiAgICAgICAgICAgIC8vIOuNlOydtOyDgSDrs4Dqsr3snbQg7ZWE7JqUIOyXhuydhCDqsr3smrBcbiAgICAgICAgICAgIGlmIChwYXJhbXMudXNlck1pbiA8PSBjdXJNaW4gJiYgcGFyYW1zLnVzZXJNYXggPj0gY3VyTWF4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBtaW4g6rCS7JeQIOuzgOqyvSDsl6zsnKDqsIAg7J6I7J2EIOqyveyasFxuICAgICAgICAgICAgaWYgKChpc1VuZGVmaW5lZE1pbiAmJiBwYXJhbXMudXNlck1pbiA+IGN1ck1pbikgfHxcbiAgICAgICAgICAgICAgICAoIWlzVW5kZWZpbmVkTWluICYmIG9wdGlvbnMubWluID49IGN1ck1pbikpIHtcbiAgICAgICAgICAgICAgICBzY2FsZS5taW4gPSBjdXJNaW47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIG1heCDqsJLsl5Ag67OA6rK9IOyXrOycoOqwgCDsnojsnYQg6rK97JqwXG4gICAgICAgICAgICBpZiAoKGlzVW5kZWZpbmVkTWluICYmIHBhcmFtcy51c2VyTWF4IDwgY3VyTWF4KSB8fFxuICAgICAgICAgICAgICAgICghaXNVbmRlZmluZWRNYXggJiYgb3B0aW9ucy5tYXggPD0gY3VyTWF4KSkge1xuICAgICAgICAgICAgICAgIHNjYWxlLm1heCA9IGN1ck1heDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGFiZWxzID0gY2FsY3VsYXRvci5tYWtlTGFiZWxzRnJvbVNjYWxlKHNjYWxlLCBzdGVwKTtcbiAgICAgICAgdGlja0luZm8ubGFiZWxzID0gbGFiZWxzO1xuICAgICAgICB0aWNrSW5mby5zdGVwID0gc3RlcDtcbiAgICAgICAgdGlja0luZm8udGlja0NvdW50ID0gbGFiZWxzLmxlbmd0aDtcbiAgICAgICAgcmV0dXJuIHRpY2tJbmZvO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBkaXZpZGUgdGljayBzdGVwLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7e3NjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfSwgdGlja0NvdW50OiBudW1iZXIsIHN0ZXA6IG51bWJlciwgbGFiZWxzOiBhcnJheS48bnVtYmVyPn19IHRpY2tJbmZvIHRpY2sgaW5mb1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBvcmdUaWNrQ291bnQgb3JpZ2luYWwgdGlja0NvdW50XG4gICAgICogQHJldHVybnMge3tzY2FsZToge21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn0sIHRpY2tDb3VudDogbnVtYmVyLCBzdGVwOiBudW1iZXIsIGxhYmVsczogYXJyYXkuPG51bWJlcj59fSB0aWNrIGluZm9cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9kaXZpZGVUaWNrU3RlcDogZnVuY3Rpb24odGlja0luZm8sIG9yZ1RpY2tDb3VudCkge1xuICAgICAgICB2YXIgc3RlcCA9IHRpY2tJbmZvLnN0ZXAsXG4gICAgICAgICAgICBzY2FsZSA9IHRpY2tJbmZvLnNjYWxlLFxuICAgICAgICAgICAgdGlja0NvdW50ID0gdGlja0luZm8udGlja0NvdW50O1xuICAgICAgICAvLyBzdGVwIDLsnZgg67Cw7IiYIOydtOuptOyEnCDrs4Dqsr3rkJwgdGlja0NvdW507J2YIOuRkOuwsOyImC0x7J20IHRpY2tDb3VudOuztOuLpCBvcmdUaWNrQ291bnTsmYAg7LCo7J206rCAIOuNnOuCmOqxsOuCmCDqsJnsnLzrqbQgc3RlcOydhCDrsJjsnLzroZwg67OA6rK97ZWc64ukLlxuICAgICAgICBpZiAoKHN0ZXAgJSAyID09PSAwKSAmJlxuICAgICAgICAgICAgYWJzKG9yZ1RpY2tDb3VudCAtICgodGlja0NvdW50ICogMikgLSAxKSkgPD0gYWJzKG9yZ1RpY2tDb3VudCAtIHRpY2tDb3VudCkpIHtcbiAgICAgICAgICAgIHN0ZXAgPSBzdGVwIC8gMjtcbiAgICAgICAgICAgIHRpY2tJbmZvLmxhYmVscyA9IGNhbGN1bGF0b3IubWFrZUxhYmVsc0Zyb21TY2FsZShzY2FsZSwgc3RlcCk7XG4gICAgICAgICAgICB0aWNrSW5mby50aWNrQ291bnQgPSB0aWNrSW5mby5sYWJlbHMubGVuZ3RoO1xuICAgICAgICAgICAgdGlja0luZm8uc3RlcCA9IHN0ZXA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRpY2tJbmZvO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHRpY2sgaW5mb1xuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy50aWNrQ291bnQgdGljayBjb3VudFxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5taW4gc2NhbGUgbWluXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLm1heCBzY2FsZSBtYXhcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMudXNlck1pbiBtaW5pbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy51c2VyTWF4IG1heGltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5pc01pbnVzIHdoZXRoZXIgc2NhbGUgaXMgbWludXMgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLmNoYXJ0VHlwZSBjaGFydCB0eXBlXG4gICAgICogICAgICBAcGFyYW0ge3ttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fSBwYXJhbXMub3B0aW9ucyBheGlzIG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7e1xuICAgICAqICAgICAgc2NhbGU6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9LFxuICAgICAqICAgICAgdGlja0NvdW50OiBudW1iZXIsXG4gICAgICogICAgICBzdGVwOiBudW1iZXIsXG4gICAgICogICAgICBsYWJlbHM6IGFycmF5LjxudW1iZXI+XG4gICAgICogfX0gdGljayBpbmZvXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVRpY2tJbmZvOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIHNjYWxlID0gcGFyYW1zLnNjYWxlLFxuICAgICAgICAgICAgc3RlcCwgdGlja0luZm87XG5cbiAgICAgICAgLy8gMDEuIOq4sOuzuCBzY2FsZSDsoJXrs7TroZwgc3RlcCDslrvquLBcbiAgICAgICAgc3RlcCA9IGNhbGN1bGF0b3IuZ2V0U2NhbGVTdGVwKHNjYWxlLCBwYXJhbXMudGlja0NvdW50KTtcblxuICAgICAgICAvLyAwMi4gc3RlcCDsoJXqt5ztmZQg7Iuc7YKk6riwIChleDogMC4zIC0tPiAwLjUsIDcgLS0+IDEwKVxuICAgICAgICBzdGVwID0gdGhpcy5fbm9ybWFsaXplU3RlcChzdGVwKTtcblxuICAgICAgICAvLyAwMy4gc2NhbGUg7KCV6rec7ZmUIOyLnO2CpOq4sFxuICAgICAgICBzY2FsZSA9IHRoaXMuX25vcm1hbGl6ZVNjYWxlKHNjYWxlLCBzdGVwLCBwYXJhbXMudGlja0NvdW50KTtcblxuICAgICAgICAvLyAwNC4gbGluZeywqO2KuOydmCDqsr3smrAg7IKs7Jqp7J6Q7J2YIG1pbuqwkuydtCBzY2FsZeydmCBtaW7qsJLqs7wg6rCZ7J2EIOqyveyasCwgbWlu6rCS7J2EIDEgc3RlcCDqsJDshowg7Iuc7YK0XG4gICAgICAgIHNjYWxlLm1pbiA9IHRoaXMuX2FkZE1pblBhZGRpbmcoe1xuICAgICAgICAgICAgbWluOiBzY2FsZS5taW4sXG4gICAgICAgICAgICBzdGVwOiBzdGVwLFxuICAgICAgICAgICAgdXNlck1pbjogcGFyYW1zLnVzZXJNaW4sXG4gICAgICAgICAgICBtaW5PcHRpb246IHBhcmFtcy5vcHRpb25zLm1pbixcbiAgICAgICAgICAgIGNoYXJ0VHlwZTogcGFyYW1zLmNoYXJ0VHlwZVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyAwNS4g7IKs7Jqp7J6Q7J2YIG1heOqwkuydtCBzY2FlbCBtYXjsmYAg6rCZ7J2EIOqyveyasCwgbWF46rCS7J2EIDEgc3RlcCDspp3qsIAg7Iuc7YK0XG4gICAgICAgIHNjYWxlLm1heCA9IHRoaXMuX2FkZE1heFBhZGRpbmcoe1xuICAgICAgICAgICAgbWF4OiBzY2FsZS5tYXgsXG4gICAgICAgICAgICBzdGVwOiBzdGVwLFxuICAgICAgICAgICAgdXNlck1heDogcGFyYW1zLnVzZXJNYXgsXG4gICAgICAgICAgICBtYXhPcHRpb246IHBhcmFtcy5vcHRpb25zLm1heFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyAwNi4gYXhpcyBzY2FsZeydtCDsgqzsmqnsnpAgbWluLCBtYXjsmYAg6rGw66as6rCAIOupgCDqsr3smrAg7KGw7KCIXG4gICAgICAgIHRpY2tJbmZvID0gdGhpcy5fbWluaW1pemVUaWNrU2NhbGUoe1xuICAgICAgICAgICAgdXNlck1pbjogcGFyYW1zLnVzZXJNaW4sXG4gICAgICAgICAgICB1c2VyTWF4OiBwYXJhbXMudXNlck1heCxcbiAgICAgICAgICAgIHRpY2tJbmZvOiB7c2NhbGU6IHNjYWxlLCBzdGVwOiBzdGVwLCB0aWNrQ291bnQ6IHBhcmFtcy50aWNrQ291bnR9LFxuICAgICAgICAgICAgb3B0aW9uczogcGFyYW1zLm9wdGlvbnNcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGlja0luZm8gPSB0aGlzLl9kaXZpZGVUaWNrU3RlcCh0aWNrSW5mbywgcGFyYW1zLnRpY2tDb3VudCk7XG4gICAgICAgIHJldHVybiB0aWNrSW5mbztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIHNjYWxlIG1pbiBwYWRkaW5nLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHByYW1zIHtudW1iZXJ9IHBhcmFtcy5taW4gc2NhbGUgbWluXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnVzZXJNaW4gbWluaW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubWluT3B0aW9uIG1pbiBvcHRpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuc3RlcCB0aWNrIHN0ZXBcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBzY2FsZSBtaW5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hZGRNaW5QYWRkaW5nOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIG1pbiA9IHBhcmFtcy5taW47XG5cbiAgICAgICAgLy8gbm9ybWFsaXpl65CcIHNjYWxlIG1pbuqwkuydtCB1c2VyIG1pbuqwkuqzvCDqsJnsnYQg6rK97JqwIHN0ZXAg6rCQ7IaMXG4gICAgICAgIGlmICgocGFyYW1zLmNoYXJ0VHlwZSA9PT0gY2hhcnRDb25zdC5DSEFSVF9UWVBFX0xJTkUgfHwgbWluKSAmJiBtaW4gPT09IHBhcmFtcy51c2VyTWluKSB7XG4gICAgICAgICAgICBtaW4gLT0gcGFyYW1zLnN0ZXA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1pbjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIHNjYWxlIG1heCBwYWRkaW5nLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHByYW1zIHtudW1iZXJ9IHBhcmFtcy5tYXggc2NhbGUgbWF4XG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnVzZXJNYXggbWF4aW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubWF4T3B0aW9uIG1heCBvcHRpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuc3RlcCB0aWNrIHN0ZXBcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBzY2FsZSBtYXhcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hZGRNYXhQYWRkaW5nOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIG1heCA9IHBhcmFtcy5tYXg7XG4gICAgICAgIC8vIG5vcm1hbGl6ZeuQnCBzY2FsZSBtYXjqsJLsnbQgdXNlciBtYXjqsJLqs7wg6rCZ7J2EIOqyveyasCBzdGVwIOymneqwgFxuICAgICAgICBpZiAobmUudXRpbC5pc1VuZGVmaW5lZChwYXJhbXMubWF4T3B0aW9uKSAmJiAocGFyYW1zLm1heCA9PT0gcGFyYW1zLnVzZXJNYXgpKSB7XG4gICAgICAgICAgICBtYXggKz0gcGFyYW1zLnN0ZXA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1heDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbm9ybWFsaXplIG1pbi5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWluIG9yaWdpbmFsIG1pblxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdGVwIHRpY2sgc3RlcFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IG5vcm1hbGl6ZWQgbWluXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbm9ybWFsaXplTWluOiBmdW5jdGlvbihtaW4sIHN0ZXApIHtcbiAgICAgICAgdmFyIG1vZCA9IG5lLnV0aWwubW9kKG1pbiwgc3RlcCksXG4gICAgICAgICAgICBub3JtYWxpemVkO1xuXG4gICAgICAgIGlmIChtb2QgPT09IDApIHtcbiAgICAgICAgICAgIG5vcm1hbGl6ZWQgPSBtaW47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBub3JtYWxpemVkID0gbmUudXRpbC5zdWJ0cmFjdGlvbihtaW4sIChtaW4gPj0gMCA/IG1vZCA6IHN0ZXAgKyBtb2QpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbm9ybWFsaXplZDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBub3JtYWxpemVkIG1heC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge3ttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fSBzY2FsZSBzY2FsZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdGVwIHRpY2sgc3RlcFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB0aWNrQ291bnQgdGljayBjb3VudFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IG5vcm1hbGl6ZWQgbWF4XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZU5vcm1hbGl6ZWRNYXg6IGZ1bmN0aW9uKHNjYWxlLCBzdGVwLCB0aWNrQ291bnQpIHtcbiAgICAgICAgdmFyIG1pbk1heERpZmYgPSBuZS51dGlsLm11bHRpcGxpY2F0aW9uKHN0ZXAsIHRpY2tDb3VudCAtIDEpLFxuICAgICAgICAgICAgbm9ybWFsaXplZE1heCA9IG5lLnV0aWwuYWRkaXRpb24oc2NhbGUubWluLCBtaW5NYXhEaWZmKSxcbiAgICAgICAgICAgIG1heERpZmYgPSBzY2FsZS5tYXggLSBub3JtYWxpemVkTWF4LFxuICAgICAgICAgICAgbW9kRGlmZiwgZGl2aWRlRGlmZjtcbiAgICAgICAgLy8gbm9ybWFsaXpl65CcIG1heOqwkuydtCDsm5DrnpjsnZggbWF46rCSIOuztOuLpCDsnpHsnYQg6rK97JqwIHN0ZXDsnYQg7Kad6rCA7Iuc7LycIO2BsCDqsJLsnLzroZwg66eM65Ok6riwXG4gICAgICAgIGlmIChtYXhEaWZmID4gMCkge1xuICAgICAgICAgICAgbW9kRGlmZiA9IG1heERpZmYgJSBzdGVwO1xuICAgICAgICAgICAgZGl2aWRlRGlmZiA9IE1hdGguZmxvb3IobWF4RGlmZiAvIHN0ZXApO1xuICAgICAgICAgICAgbm9ybWFsaXplZE1heCArPSBzdGVwICogKG1vZERpZmYgPiAwID8gZGl2aWRlRGlmZiArIDEgOiBkaXZpZGVEaWZmKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbm9ybWFsaXplZE1heDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbm9ybWFsaXplIHNjYWxlLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7e21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19IHNjYWxlIGJhc2Ugc2NhbGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3RlcCB0aWNrIHN0ZXBcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdGlja0NvdW50IHRpY2sgY291bnRcbiAgICAgKiBAcmV0dXJucyB7e21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19IG5vcm1hbGl6ZWQgc2NhbGVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9ub3JtYWxpemVTY2FsZTogZnVuY3Rpb24oc2NhbGUsIHN0ZXAsIHRpY2tDb3VudCkge1xuICAgICAgICBzY2FsZS5taW4gPSB0aGlzLl9ub3JtYWxpemVNaW4oc2NhbGUubWluLCBzdGVwKTtcbiAgICAgICAgc2NhbGUubWF4ID0gdGhpcy5fbWFrZU5vcm1hbGl6ZWRNYXgoc2NhbGUsIHN0ZXAsIHRpY2tDb3VudCk7XG4gICAgICAgIHJldHVybiBzY2FsZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNhbmRpZGF0ZXMgYWJvdXQgdGljayBpbmZvLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5taW4gbWluaW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubWF4IG1heGltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxudW1iZXI+fSBwYXJhbXMudGlja0NvdW50cyB0aWNrIGNvdW50c1xuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5jaGFydFR5cGUgY2hhcnQgdHlwZVxuICAgICAqIEBwYXJhbSB7e21pbjogbnVtYmVyLCBtYXg6bnVtYmVyfX0gb3B0aW9ucyBheGlzIG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7YXJyYXl9IGNhbmRpZGF0ZXMgYWJvdXQgdGljayBpbmZvXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0Q2FuZGlkYXRlVGlja0luZm9zOiBmdW5jdGlvbihwYXJhbXMsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIHVzZXJNaW4gPSBwYXJhbXMubWluLFxuICAgICAgICAgICAgdXNlck1heCA9IHBhcmFtcy5tYXgsXG4gICAgICAgICAgICBtaW4gPSBwYXJhbXMubWluLFxuICAgICAgICAgICAgbWF4ID0gcGFyYW1zLm1heCxcbiAgICAgICAgICAgIHNjYWxlLCBjYW5kaWRhdGVzO1xuXG4gICAgICAgIC8vIG1pbiwgbWF466eM7Jy866GcIOq4sOuzuCBzY2FsZSDslrvquLBcbiAgICAgICAgc2NhbGUgPSB0aGlzLl9tYWtlQmFzZVNjYWxlKG1pbiwgbWF4LCBvcHRpb25zKTtcblxuICAgICAgICBjYW5kaWRhdGVzID0gbmUudXRpbC5tYXAocGFyYW1zLnRpY2tDb3VudHMsIGZ1bmN0aW9uKHRpY2tDb3VudCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21ha2VUaWNrSW5mbyh7XG4gICAgICAgICAgICAgICAgdGlja0NvdW50OiB0aWNrQ291bnQsXG4gICAgICAgICAgICAgICAgc2NhbGU6IG5lLnV0aWwuZXh0ZW5kKHt9LCBzY2FsZSksXG4gICAgICAgICAgICAgICAgdXNlck1pbjogdXNlck1pbixcbiAgICAgICAgICAgICAgICB1c2VyTWF4OiB1c2VyTWF4LFxuICAgICAgICAgICAgICAgIGNoYXJ0VHlwZTogcGFyYW1zLmNoYXJ0VHlwZSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIHJldHVybiBjYW5kaWRhdGVzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGJhc2Ugc2NhbGVcbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWluIG1pbmltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1heCBtYXhpbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7e21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19IG9wdGlvbnMgYXhpcyBvcHRpb25zXG4gICAgICogQHJldHVybnMge3ttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fSBiYXNlIHNjYWxlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUJhc2VTY2FsZTogZnVuY3Rpb24obWluLCBtYXgsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIGlzTWludXMgPSBmYWxzZSxcbiAgICAgICAgICAgIHRtcE1pbiwgc2NhbGU7XG5cbiAgICAgICAgaWYgKG1pbiA8IDAgJiYgbWF4IDw9IDApIHtcbiAgICAgICAgICAgIGlzTWludXMgPSB0cnVlO1xuICAgICAgICAgICAgdG1wTWluID0gbWluO1xuICAgICAgICAgICAgbWluID0gLW1heDtcbiAgICAgICAgICAgIG1heCA9IC10bXBNaW47XG4gICAgICAgIH1cblxuICAgICAgICBzY2FsZSA9IGNhbGN1bGF0b3IuY2FsY3VsYXRlU2NhbGUobWluLCBtYXgpO1xuXG4gICAgICAgIGlmIChpc01pbnVzKSB7XG4gICAgICAgICAgICB0bXBNaW4gPSBzY2FsZS5taW47XG4gICAgICAgICAgICBzY2FsZS5taW4gPSAtc2NhbGUubWF4O1xuICAgICAgICAgICAgc2NhbGUubWF4ID0gLXRtcE1pbjtcbiAgICAgICAgfVxuXG4gICAgICAgIHNjYWxlLm1pbiA9IG9wdGlvbnMubWluIHx8IHNjYWxlLm1pbjtcbiAgICAgICAgc2NhbGUubWF4ID0gb3B0aW9ucy5tYXggfHwgc2NhbGUubWF4O1xuXG4gICAgICAgIHJldHVybiBzY2FsZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRm9ybWF0IGxhYmVscy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBsYWJlbHMgdGFyZ2V0IGxhYmVsc1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb25bXX0gZm9ybWF0RnVuY3Rpb25zIGZvcm1hdCBmdW5jdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nW119IGZvcm1hdHRlZCBsYWJlbHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9mb3JtYXRMYWJlbHM6IGZ1bmN0aW9uKGxhYmVscywgZm9ybWF0RnVuY3Rpb25zKSB7XG4gICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgIGlmICghZm9ybWF0RnVuY3Rpb25zIHx8ICFmb3JtYXRGdW5jdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gbGFiZWxzO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdCA9IG5lLnV0aWwubWFwKGxhYmVscywgZnVuY3Rpb24obGFiZWwpIHtcbiAgICAgICAgICAgIHZhciBmbnMgPSBjb25jYXQuYXBwbHkoW2xhYmVsXSwgZm9ybWF0RnVuY3Rpb25zKTtcbiAgICAgICAgICAgIHJldHVybiBuZS51dGlsLnJlZHVjZShmbnMsIGZ1bmN0aW9uKHN0b3JlZCwgZm4pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZm4oc3RvcmVkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGF4aXNEYXRhTWFrZXI7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgQm91bmRzIG1ha2VyLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2FsY3VsYXRvciA9IHJlcXVpcmUoJy4vY2FsY3VsYXRvcicpLFxuICAgIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuLi9jb25zdCcpLFxuICAgIHJlbmRlclV0aWwgPSByZXF1aXJlKCcuL3JlbmRlclV0aWwnKTtcblxudmFyIENIQVJUX1BBRERJTkcgPSAxMCxcbiAgICBUSVRMRV9BRERfUEFERElORyA9IDIwLFxuICAgIExFR0VORF9BUkVBX1BBRERJTkcgPSAxMCxcbiAgICBMRUdFTkRfUkVDVF9XSURUSCA9IDEyLFxuICAgIExFR0VORF9MQUJFTF9QQURESU5HX0xFRlQgPSA1LFxuICAgIEFYSVNfTEFCRUxfUEFERElORyA9IDcsXG4gICAgSElEREVOX1dJRFRIID0gMTtcblxudmFyIGNvbmNhdCA9IEFycmF5LnByb3RvdHlwZS5jb25jYXQ7XG5cbi8qKlxuICogQm91bmRzIG1ha2VyLlxuICogQG1vZHVsZSBib3VuZHNNYWtlclxuICovXG52YXIgYm91bmRzTWFrZXIgPSB7XG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBib3VuZHMgYWJvdXQgY2hhcnQgY29tcG9uZW50cy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmJvdW5kc01ha2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmNvbnZlcnREYXRhIGNvbnZlcnRlZCBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIGNoYXJ0IHRoZW1lXG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5pc1ZlcnRpY2FsIHdoZXRoZXIgdmVydGljYWwgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaGFzQXhlcyB3aGV0aGVyIGhhcyBheGVzIGFyZWEgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge2FycmF5fSBwYXJhbXMub3B0aW9uQ2hhcnRUeXBlcyB5IGF4aXMgb3B0aW9uIGNoYXJ0IHR5cGVzXG4gICAgICogQHJldHVybnMge3tcbiAgICAgKiAgIHBsb3Q6IHtcbiAgICAgKiAgICAgZGltZW5zaW9uOiB7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9LFxuICAgICAqICAgICBwb3NpdGlvbjoge3RvcDogbnVtYmVyLCByaWdodDogbnVtYmVyfVxuICAgICAqICAgfSxcbiAgICAgKiAgIHlBeGlzOiB7XG4gICAgICogICAgIGRpbWVuc2lvbjoge3dpZHRoOiAobnVtYmVyKSwgaGVpZ2h0OiBudW1iZXJ9LFxuICAgICAqICAgICBwb3NpdGlvbjoge3RvcDogbnVtYmVyfVxuICAgICAqICAgfSxcbiAgICAgKiAgIHhBeGlzOiB7XG4gICAgICogICAgIGRpbWVuc2lvbjoge3dpZHRoOiBudW1iZXIsIGhlaWdodDogKG51bWJlcil9LFxuICAgICAqICAgICBwb3NpdGlvbjoge3JpZ2h0OiBudW1iZXJ9XG4gICAgICogICB9LFxuICAgICAqICAgc2VyaWVzOiB7XG4gICAgICogICAgIGRpbWVuc2lvbjoge3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfSxcbiAgICAgKiAgICAgcG9zaXRpb246IHt0b3A6IG51bWJlciwgcmlnaHQ6IG51bWJlcn1cbiAgICAgKiAgIH0sXG4gICAgICogICBsZWdlbmQ6IHtcbiAgICAgKiAgICAgcG9zaXRpb246IHt0b3A6IG51bWJlcn1cbiAgICAgKiAgIH0sXG4gICAgICogICB0b29sdGlwOiB7XG4gICAgICogICAgIGRpbWVuc2lvbjoge3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfSxcbiAgICAgKiAgICAgcG9zaXRpb246IHt0b3A6IG51bWJlciwgbGVmdDogbnVtYmVyfVxuICAgICAqICAgfVxuICAgICAqIH19IGJvdW5kc1xuICAgICAqL1xuICAgIG1ha2U6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgZGltZW5zaW9ucyA9IHRoaXMuX2dldENvbXBvbmVudHNEaW1lbnNpb25zKHBhcmFtcyksXG4gICAgICAgICAgICB5QXhpc1dpZHRoID0gZGltZW5zaW9ucy55QXhpcy53aWR0aCxcbiAgICAgICAgICAgIHRvcCA9IGRpbWVuc2lvbnMudGl0bGUuaGVpZ2h0ICsgQ0hBUlRfUEFERElORyxcbiAgICAgICAgICAgIGxlZnQgPSB5QXhpc1dpZHRoICsgQ0hBUlRfUEFERElORyxcbiAgICAgICAgICAgIHJpZ2h0ID0gZGltZW5zaW9ucy5sZWdlbmQud2lkdGggKyBkaW1lbnNpb25zLnlyQXhpcy53aWR0aCArIENIQVJUX1BBRERJTkcsXG4gICAgICAgICAgICBheGVzQm91bmRzID0gdGhpcy5fbWFrZUF4ZXNCb3VuZHMoe1xuICAgICAgICAgICAgICAgIGhhc0F4ZXM6IHBhcmFtcy5oYXNBeGVzLFxuICAgICAgICAgICAgICAgIG9wdGlvbkNoYXJ0VHlwZXM6IHBhcmFtcy5vcHRpb25DaGFydFR5cGVzLFxuICAgICAgICAgICAgICAgIGRpbWVuc2lvbnM6IGRpbWVuc2lvbnMsXG4gICAgICAgICAgICAgICAgdG9wOiB0b3AsXG4gICAgICAgICAgICAgICAgcmlnaHQ6IHJpZ2h0XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGJvdW5kcyA9IG5lLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICBjaGFydDoge1xuICAgICAgICAgICAgICAgICAgICBkaW1lbnNpb246IGRpbWVuc2lvbnMuY2hhcnRcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNlcmllczoge1xuICAgICAgICAgICAgICAgICAgICBkaW1lbnNpb246IGRpbWVuc2lvbnMuc2VyaWVzLFxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiB0b3AsXG4gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiBsZWZ0XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGxlZ2VuZDoge1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiBkaW1lbnNpb25zLnRpdGxlLmhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6IHlBeGlzV2lkdGggKyBkaW1lbnNpb25zLnNlcmllcy53aWR0aCArIGRpbWVuc2lvbnMueXJBeGlzLndpZHRoICsgQ0hBUlRfUEFERElOR1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0b29sdGlwOiB7XG4gICAgICAgICAgICAgICAgICAgIGRpbWVuc2lvbjogZGltZW5zaW9ucy5zZXJpZXMsXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3A6IHRvcCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6IGxlZnRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIGF4ZXNCb3VuZHMpO1xuICAgICAgICByZXR1cm4gYm91bmRzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgbWF4IGxhYmVsIG9mIHZhbHVlIGF4aXMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpib3VuZHNNYWtlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb252ZXJ0RGF0YSBjb252ZXJ0IGRhdGFcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY2hhcnRUeXBlIGNoYXJ0IHR5cGVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfHN0cmluZ30gbWF4IGxhYmVsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0VmFsdWVBeGlzTWF4TGFiZWw6IGZ1bmN0aW9uKGNvbnZlcnREYXRhLCBjaGFydFR5cGUpIHtcbiAgICAgICAgdmFyIHZhbHVlcyA9IGNoYXJ0VHlwZSAmJiBjb252ZXJ0RGF0YS52YWx1ZXNbY2hhcnRUeXBlXSB8fCBjb252ZXJ0RGF0YS5qb2luVmFsdWVzLFxuICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zID0gY29udmVydERhdGEuZm9ybWF0RnVuY3Rpb25zLFxuICAgICAgICAgICAgZmxhdHRlblZhbHVlcyA9IGNvbmNhdC5hcHBseShbXSwgdmFsdWVzKSxcbiAgICAgICAgICAgIG1pbiA9IG5lLnV0aWwubWluKGZsYXR0ZW5WYWx1ZXMpLFxuICAgICAgICAgICAgbWF4ID0gbmUudXRpbC5tYXgoZmxhdHRlblZhbHVlcyksXG4gICAgICAgICAgICBzY2FsZSA9IGNhbGN1bGF0b3IuY2FsY3VsYXRlU2NhbGUobWluLCBtYXgpLFxuICAgICAgICAgICAgbWluTGFiZWwgPSBjYWxjdWxhdG9yLm5vcm1hbGl6ZUF4aXNOdW1iZXIoc2NhbGUubWluKSxcbiAgICAgICAgICAgIG1heExhYmVsID0gY2FsY3VsYXRvci5ub3JtYWxpemVBeGlzTnVtYmVyKHNjYWxlLm1heCksXG4gICAgICAgICAgICBmbnMgPSBmb3JtYXRGdW5jdGlvbnMgJiYgZm9ybWF0RnVuY3Rpb25zLnNsaWNlKCkgfHwgW107XG4gICAgICAgIG1heExhYmVsID0gKG1pbkxhYmVsICsgJycpLmxlbmd0aCA+IChtYXhMYWJlbCArICcnKS5sZW5ndGggPyBtaW5MYWJlbCA6IG1heExhYmVsO1xuICAgICAgICBmbnMudW5zaGlmdChtYXhMYWJlbCk7XG4gICAgICAgIG1heExhYmVsID0gbmUudXRpbC5yZWR1Y2UoZm5zLCBmdW5jdGlvbihzdG9yZWQsIGZuKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4oc3RvcmVkKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBtYXhMYWJlbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IFJlbmRlcmVkIExhYmVscyBNYXggU2l6ZSh3aWR0aCBvciBoZWlnaHQpLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Ym91bmRzTWFrZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBsYWJlbHMgbGFiZWxzXG4gICAgICogQHBhcmFtIHt7Zm9udFNpemU6IG51bWJlciwgZm9udEZhbWlseTogc3RyaW5nLCBjb2xvcjogc3RyaW5nfX0gdGhlbWUgbGFiZWwgdGhlbWVcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBpdGVyYXRlZSBpdGVyYXRlZVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IG1heCBzaXplICh3aWR0aCBvciBoZWlnaHQpXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0UmVuZGVyZWRMYWJlbHNNYXhTaXplOiBmdW5jdGlvbihsYWJlbHMsIHRoZW1lLCBpdGVyYXRlZSkge1xuICAgICAgICB2YXIgc2l6ZXMgPSBuZS51dGlsLm1hcChsYWJlbHMsIGZ1bmN0aW9uKGxhYmVsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0ZXJhdGVlKGxhYmVsLCB0aGVtZSk7XG4gICAgICAgICAgICB9LCB0aGlzKSxcbiAgICAgICAgICAgIG1heFNpemUgPSBuZS51dGlsLm1heChzaXplcyk7XG4gICAgICAgIHJldHVybiBtYXhTaXplO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgcmVuZGVyZWQgbGFiZWxzIG1heCB3aWR0aC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmJvdW5kc01ha2VyXG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gbGFiZWxzIGxhYmVsc1xuICAgICAqIEBwYXJhbSB7e2ZvbnRTaXplOiBudW1iZXIsIGZvbnRGYW1pbHk6IHN0cmluZywgY29sb3I6IHN0cmluZ319IHRoZW1lIGxhYmVsIHRoZW1lXG4gICAgICogQHJldHVybnMge251bWJlcn0gbWF4IHdpZHRoXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0UmVuZGVyZWRMYWJlbHNNYXhXaWR0aDogZnVuY3Rpb24obGFiZWxzLCB0aGVtZSkge1xuICAgICAgICB2YXIgaXRlcmF0ZWUgPSBuZS51dGlsLmJpbmQocmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsV2lkdGgsIHJlbmRlclV0aWwpLFxuICAgICAgICAgICAgbWF4V2lkdGggPSB0aGlzLl9nZXRSZW5kZXJlZExhYmVsc01heFNpemUobGFiZWxzLCB0aGVtZSwgaXRlcmF0ZWUpO1xuICAgICAgICByZXR1cm4gbWF4V2lkdGg7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCByZW5kZXJlZCBsYWJlbHMgbWF4IGhlaWdodC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmJvdW5kc01ha2VyXG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gbGFiZWxzIGxhYmVsc1xuICAgICAqIEBwYXJhbSB7e2ZvbnRTaXplOiBudW1iZXIsIGZvbnRGYW1pbHk6IHN0cmluZywgY29sb3I6IHN0cmluZ319IHRoZW1lIGxhYmVsIHRoZW1lXG4gICAgICogQHJldHVybnMge251bWJlcn0gbWF4IGhlaWdodFxuICAgICAqL1xuICAgIF9nZXRSZW5kZXJlZExhYmVsc01heEhlaWdodDogZnVuY3Rpb24obGFiZWxzLCB0aGVtZSkge1xuICAgICAgICB2YXIgaXRlcmF0ZWUgPSBuZS51dGlsLmJpbmQocmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsSGVpZ2h0LCByZW5kZXJVdGlsKSxcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuX2dldFJlbmRlcmVkTGFiZWxzTWF4U2l6ZShsYWJlbHMsIHRoZW1lLCBpdGVyYXRlZSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBoZWlnaHQgb2YgeCBheGlzIGFyZWEuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpib3VuZHNNYWtlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIHggYXhpcyBvcHRpb25zLFxuICAgICAqIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGxhYmVscyBheGlzIGxhYmVsc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBheGlzIHRoZW1lXG4gICAgICogQHJldHVybnMge251bWJlcn0gaGVpZ2h0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0WEF4aXNIZWlnaHQ6IGZ1bmN0aW9uKG9wdGlvbnMsIGxhYmVscywgdGhlbWUpIHtcbiAgICAgICAgdmFyIHRpdGxlID0gb3B0aW9ucyAmJiBvcHRpb25zLnRpdGxlLFxuICAgICAgICAgICAgdGl0bGVBcmVhSGVpZ2h0ID0gcmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsSGVpZ2h0KHRpdGxlLCB0aGVtZS50aXRsZSkgKyBUSVRMRV9BRERfUEFERElORyxcbiAgICAgICAgICAgIGhlaWdodCA9IHRoaXMuX2dldFJlbmRlcmVkTGFiZWxzTWF4SGVpZ2h0KGxhYmVscywgdGhlbWUubGFiZWwpICsgdGl0bGVBcmVhSGVpZ2h0O1xuICAgICAgICByZXR1cm4gaGVpZ2h0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgd2lkdGggYWJvdXQgeSBheGlzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIHkgYXhpcyBvcHRpb25zXG4gICAgICogQHBhcmFtIHthcnJheS48c3RyaW5nPn0gbGFiZWxzIGxhYmVsc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSB5QXhpcyB0aGVtZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBvcHRpb25zIGluZGV4XG4gICAgICogQHJldHVybnMge251bWJlcn0geSBheGlzIHdpZHRoXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0WUF4aXNXaWR0aDogZnVuY3Rpb24ob3B0aW9ucywgbGFiZWxzLCB0aGVtZSwgaW5kZXgpIHtcbiAgICAgICAgdmFyIHRpdGxlID0gJycsXG4gICAgICAgICAgICB0aXRsZUFyZWFXaWR0aCwgd2lkdGg7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgICAgICAgIG9wdGlvbnMgPSBbXS5jb25jYXQob3B0aW9ucyk7XG4gICAgICAgICAgICB0aXRsZSA9IG9wdGlvbnNbaW5kZXggfHwgMF0udGl0bGU7XG4gICAgICAgIH1cblxuICAgICAgICB0aXRsZUFyZWFXaWR0aCA9IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodCh0aXRsZSwgdGhlbWUudGl0bGUpICsgVElUTEVfQUREX1BBRERJTkc7XG4gICAgICAgIHdpZHRoID0gdGhpcy5fZ2V0UmVuZGVyZWRMYWJlbHNNYXhXaWR0aChsYWJlbHMsIHRoZW1lLmxhYmVsKSArIHRpdGxlQXJlYVdpZHRoICsgQVhJU19MQUJFTF9QQURESU5HO1xuXG4gICAgICAgIHJldHVybiB3aWR0aDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHdpZHRoIGFib3V0IHkgcmlnaHQgYXhpcy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmJvdW5kc01ha2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBwYXJhbXMuY2hhcnRUeXBlcyB5IGF4aXMgY2hhcnQgdHlwZXNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgeSBheGlzIHRoZW1lXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgeSBheGlzIG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSB5IHJpZ2h0IGF4aXMgd2lkdGhcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRZUkF4aXNXaWR0aDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBjaGFydFR5cGVzID0gcGFyYW1zLmNoYXJ0VHlwZXMgfHwgW10sXG4gICAgICAgICAgICBsZW4gPSBjaGFydFR5cGVzLmxlbmd0aCxcbiAgICAgICAgICAgIHdpZHRoID0gMCxcbiAgICAgICAgICAgIGluZGV4LCBjaGFydFR5cGUsIHRoZW1lLCBsYWJlbDtcbiAgICAgICAgaWYgKGxlbiA+IDApIHtcbiAgICAgICAgICAgIGluZGV4ID0gbGVuIC0gMTtcbiAgICAgICAgICAgIGNoYXJ0VHlwZSA9IGNoYXJ0VHlwZXNbaW5kZXhdO1xuICAgICAgICAgICAgdGhlbWUgPSBwYXJhbXMudGhlbWVbY2hhcnRUeXBlXSB8fCBwYXJhbXMudGhlbWU7XG4gICAgICAgICAgICBsYWJlbCA9IHRoaXMuX2dldFZhbHVlQXhpc01heExhYmVsKHBhcmFtcy5jb252ZXJ0RGF0YSwgY2hhcnRUeXBlKTtcbiAgICAgICAgICAgIHdpZHRoID0gdGhpcy5fZ2V0WUF4aXNXaWR0aChwYXJhbXMub3B0aW9ucywgW2xhYmVsXSwgdGhlbWUsIGluZGV4KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gd2lkdGg7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYXhlcyBkaW1lbnNpb24uXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpib3VuZHNNYWtlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5jb252ZXJ0RGF0YSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBjaGFydCB0aGVtZVxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaXNWZXJ0aWNhbCB3aGV0aGVyIHZlcnRpY2FsIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5vcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7e1xuICAgICAqICAgICAgeUF4aXM6IHt3aWR0aDogbnVtYmVyfSxcbiAgICAgKiAgICAgIHlyQXhpczoge3dpZHRoOiBudW1iZXJ9LFxuICAgICAqICAgICAgeEF4aXM6IHtoZWlnaHQ6IG51bWJlcn1cbiAgICAgKiB9fSBheGVzIGRpbWVuc2lvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VBeGVzRGltZW5zaW9uOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIHRoZW1lLCBvcHRpb25zLCBjb252ZXJ0RGF0YSwgb3B0aW9uQ2hhcnRUeXBlcywgbWF4VmFsdWVMYWJlbCwgeUxhYmVscyxcbiAgICAgICAgICAgIHhMYWJlbHMsIHlBeGlzV2lkdGgsIHhBeGlzSGVpZ2h0LCB5ckF4aXNXaWR0aCwgY2hhcnRUeXBlO1xuXG4gICAgICAgIC8vIHBpZeywqO2KuOyZgCDqsJnsnbQgYXhpcyDsmIHsl63snbQg7ZWE7JqUIOyXhuuKlCDqsr3smrDsl5DripQg66qo65GQIDDsnLzroZwg67CY7ZmYXG4gICAgICAgIGlmICghcGFyYW1zLmhhc0F4ZXMpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgeUF4aXM6IHtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDBcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHlyQXhpczoge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogMFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgeEF4aXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAwXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoZW1lID0gcGFyYW1zLnRoZW1lO1xuICAgICAgICBvcHRpb25zID0gcGFyYW1zLm9wdGlvbnM7XG4gICAgICAgIGNvbnZlcnREYXRhID0gcGFyYW1zLmNvbnZlcnREYXRhO1xuICAgICAgICBvcHRpb25DaGFydFR5cGVzID0gcGFyYW1zLm9wdGlvbkNoYXJ0VHlwZXM7XG5cbiAgICAgICAgY2hhcnRUeXBlID0gb3B0aW9uQ2hhcnRUeXBlcyAmJiBvcHRpb25DaGFydFR5cGVzWzBdIHx8ICcnO1xuXG4gICAgICAgIC8vIHZhbHVlIOykkSDqsIDsnqUg7YGwIOqwkuydhCDstpTstpztlZjsl6wgdmFsdWUgbGFiZWzroZwg7KeA7KCVIChsYWJsZSDrhIjruYQg7LK07YGsIOyLnCDsgqzsmqkpXG4gICAgICAgIG1heFZhbHVlTGFiZWwgPSB0aGlzLl9nZXRWYWx1ZUF4aXNNYXhMYWJlbChjb252ZXJ0RGF0YSwgY2hhcnRUeXBlKTtcblxuICAgICAgICAvLyDshLjroZzsmLXshZjsl5Ag65Sw65287IScIHjstpXqs7wgeey2leyXkCDsoIHsmqntlaAg66CI7J2067iUIOygleuztCDsp4DsoJVcbiAgICAgICAgeUxhYmVscyA9IHBhcmFtcy5pc1ZlcnRpY2FsID8gW21heFZhbHVlTGFiZWxdIDogY29udmVydERhdGEubGFiZWxzO1xuICAgICAgICB4TGFiZWxzID0gcGFyYW1zLmlzVmVydGljYWwgPyBjb252ZXJ0RGF0YS5sYWJlbHMgOiBbbWF4VmFsdWVMYWJlbF07XG5cbiAgICAgICAgeUF4aXNXaWR0aCA9IHRoaXMuX2dldFlBeGlzV2lkdGgob3B0aW9ucy55QXhpcywgeUxhYmVscywgdGhlbWUueUF4aXNbY2hhcnRUeXBlXSB8fCB0aGVtZS55QXhpcyk7XG4gICAgICAgIHhBeGlzSGVpZ2h0ID0gdGhpcy5fZ2V0WEF4aXNIZWlnaHQob3B0aW9ucy54QXhpcywgeExhYmVscywgdGhlbWUueEF4aXMpO1xuICAgICAgICB5ckF4aXNXaWR0aCA9IHRoaXMuX2dldFlSQXhpc1dpZHRoKHtcbiAgICAgICAgICAgIGNvbnZlcnREYXRhOiBjb252ZXJ0RGF0YSxcbiAgICAgICAgICAgIGNoYXJ0VHlwZXM6IG9wdGlvbkNoYXJ0VHlwZXMsXG4gICAgICAgICAgICB0aGVtZTogdGhlbWUueUF4aXMsXG4gICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zLnlBeGlzXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB5QXhpczoge1xuICAgICAgICAgICAgICAgIHdpZHRoOiB5QXhpc1dpZHRoXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgeXJBeGlzOiB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IHlyQXhpc1dpZHRoXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgeEF4aXM6IHtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IHhBeGlzSGVpZ2h0XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB3aWR0aCBvZiBsZWdlbmQgYXJlYS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmJvdW5kc01ha2VyXG4gICAgICogQHBhcmFtIHthcnJheS48c3RyaW5nPn0gam9pbkxlZ2VuZExhYmVscyBsZWdlbmQgbGFiZWxzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGxhYmVsVGhlbWUgbGFiZWwgdGhlbWVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSB3aWR0aFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldExlZ2VuZEFyZWFXaWR0aDogZnVuY3Rpb24oam9pbkxlZ2VuZExhYmVscywgbGFiZWxUaGVtZSwgY2hhcnRUeXBlLCBzZXJpZXNPcHRpb24pIHtcbiAgICAgICAgdmFyIGxlZ2VuZFdpZHRoID0gMCxcbiAgICAgICAgICAgIGxlZ2VuZExhYmVscywgbWF4TGFiZWxXaWR0aDtcblxuICAgICAgICBzZXJpZXNPcHRpb24gPSBzZXJpZXNPcHRpb24gfHwge307XG5cbiAgICAgICAgaWYgKGNoYXJ0VHlwZSAhPT0gY2hhcnRDb25zdC5DSEFSVF9UWVBFX1BJRSB8fCAhc2VyaWVzT3B0aW9uLmxlZ2VuZFR5cGUpIHtcbiAgICAgICAgICAgIGxlZ2VuZExhYmVscyA9IG5lLnV0aWwubWFwKGpvaW5MZWdlbmRMYWJlbHMsIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaXRlbS5sYWJlbDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbWF4TGFiZWxXaWR0aCA9IHRoaXMuX2dldFJlbmRlcmVkTGFiZWxzTWF4V2lkdGgobGVnZW5kTGFiZWxzLCBsYWJlbFRoZW1lKTtcbiAgICAgICAgICAgIGxlZ2VuZFdpZHRoID0gbWF4TGFiZWxXaWR0aCArIExFR0VORF9SRUNUX1dJRFRIICtcbiAgICAgICAgICAgICAgICBMRUdFTkRfTEFCRUxfUEFERElOR19MRUZUICsgKExFR0VORF9BUkVBX1BBRERJTkcgKiAyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBsZWdlbmRXaWR0aDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBzZXJpZXMgZGltZW5zaW9uLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Ym91bmRzTWFrZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gcGFyYW1zLmNoYXJ0RGltZW5zaW9uIGNoYXJ0IGRpbWVuc2lvblxuICAgICAqICAgICAgQHBhcmFtIHt7XG4gICAgICogICAgICAgICAgeUF4aXM6IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6bnVtYmVyfSxcbiAgICAgKiAgICAgICAgICB4QXhpczoge3dpZHRoOiBudW1iZXIsIGhlaWdodDpudW1iZXJ9LFxuICAgICAqICAgICAgICAgIHlyQXhpczoge3dpZHRoOiBudW1iZXIsIGhlaWdodDpudW1iZXJ9XG4gICAgICogICAgICB9fSBwYXJhbXMuYXhlc0RpbWVuc2lvbiBheGVzIGRpbWVuc2lvblxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5sZWdlbmRXaWR0aCBsZWdlbmQgd2lkdGhcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMudGl0bGVIZWlnaHQgdGl0bGUgaGVpZ2h0XG4gICAgICogQHJldHVybnMge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IHNlcmllcyBkaW1lbnNpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlU2VyaWVzRGltZW5zaW9uOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGF4ZXNEaW1lbnNpb24gPSBwYXJhbXMuYXhlc0RpbWVuc2lvbixcbiAgICAgICAgICAgIHJpZ2h0QXJlYVdpZHRoID0gcGFyYW1zLmxlZ2VuZFdpZHRoICsgYXhlc0RpbWVuc2lvbi55ckF4aXMud2lkdGgsXG4gICAgICAgICAgICB3aWR0aCA9IHBhcmFtcy5jaGFydERpbWVuc2lvbi53aWR0aCAtIChDSEFSVF9QQURESU5HICogMikgLSBheGVzRGltZW5zaW9uLnlBeGlzLndpZHRoIC0gcmlnaHRBcmVhV2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQgPSBwYXJhbXMuY2hhcnREaW1lbnNpb24uaGVpZ2h0IC0gKENIQVJUX1BBRERJTkcgKiAyKSAtIHBhcmFtcy50aXRsZUhlaWdodCAtIGF4ZXNEaW1lbnNpb24ueEF4aXMuaGVpZ2h0O1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBoZWlnaHRcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNvbXBvbmVudHMgZGltZW5zaW9uXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpib3VuZHNNYWtlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5jb252ZXJ0RGF0YSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBjaGFydCB0aGVtZVxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaXNWZXJ0aWNhbCB3aGV0aGVyIHZlcnRpY2FsIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5vcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBjb21wb25lbnRzIGRpbWVuc2lvbnNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRDb21wb25lbnRzRGltZW5zaW9uczogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciB0aGVtZSA9IHBhcmFtcy50aGVtZSxcbiAgICAgICAgICAgIG9wdGlvbnMgPSBwYXJhbXMub3B0aW9ucyxcbiAgICAgICAgICAgIGNvbnZlcnREYXRhID0gcGFyYW1zLmNvbnZlcnREYXRhLFxuICAgICAgICAgICAgY2hhcnRPcHRpb25zID0gb3B0aW9ucy5jaGFydCB8fCB7fSxcbiAgICAgICAgICAgIGNoYXJ0RGltZW5zaW9uID0ge1xuICAgICAgICAgICAgICAgIHdpZHRoOiBjaGFydE9wdGlvbnMud2lkdGggfHwgNTAwLFxuICAgICAgICAgICAgICAgIGhlaWdodDogY2hhcnRPcHRpb25zLmhlaWdodCB8fCA0MDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBheGVzRGltZW5zaW9uLCB0aXRsZUhlaWdodCwgbGVnZW5kV2lkdGgsIHNlcmllc0RpbWVuc2lvbiwgZGltZW5zaW9ucztcblxuICAgICAgICAvLyBheGlzIOyYgeyXreyXkCDtlYTsmpTtlZwg7JqU7IaM65Ok7J2YIOuEiOu5hCDrhpLsnbTrpbwg7Ja77Ja07Ji0XG4gICAgICAgIGF4ZXNEaW1lbnNpb24gPSB0aGlzLl9tYWtlQXhlc0RpbWVuc2lvbihwYXJhbXMpO1xuICAgICAgICB0aXRsZUhlaWdodCA9IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodChjaGFydE9wdGlvbnMudGl0bGUsIHRoZW1lLnRpdGxlKSArIFRJVExFX0FERF9QQURESU5HO1xuICAgICAgICBsZWdlbmRXaWR0aCA9IHRoaXMuX2dldExlZ2VuZEFyZWFXaWR0aChjb252ZXJ0RGF0YS5qb2luTGVnZW5kTGFiZWxzLCB0aGVtZS5sZWdlbmQubGFiZWwsIHBhcmFtcy5jaGFydFR5cGUsIG9wdGlvbnMuc2VyaWVzKTtcblxuICAgICAgICAvLyBzZXJpZXMg64SI67mELCDrhpLsnbQg6rCS7J2AIOywqO2KuCBib3VuZHPrpbwg6rWs7ISx7ZWY64qUIOqwgOyepSDspJHsmpTtlZwg7JqU7IaM64ukXG4gICAgICAgIHNlcmllc0RpbWVuc2lvbiA9IHRoaXMuX21ha2VTZXJpZXNEaW1lbnNpb24oe1xuICAgICAgICAgICAgY2hhcnREaW1lbnNpb246IGNoYXJ0RGltZW5zaW9uLFxuICAgICAgICAgICAgYXhlc0RpbWVuc2lvbjogYXhlc0RpbWVuc2lvbixcbiAgICAgICAgICAgIGxlZ2VuZFdpZHRoOiBsZWdlbmRXaWR0aCxcbiAgICAgICAgICAgIHRpdGxlSGVpZ2h0OiB0aXRsZUhlaWdodFxuICAgICAgICB9KTtcblxuICAgICAgICBkaW1lbnNpb25zID0gbmUudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgY2hhcnQ6IGNoYXJ0RGltZW5zaW9uLFxuICAgICAgICAgICAgdGl0bGU6IHtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IHRpdGxlSGVpZ2h0XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2VyaWVzOiBzZXJpZXNEaW1lbnNpb24sXG4gICAgICAgICAgICBsZWdlbmQ6IHtcbiAgICAgICAgICAgICAgICB3aWR0aDogbGVnZW5kV2lkdGhcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgYXhlc0RpbWVuc2lvbik7XG4gICAgICAgIHJldHVybiBkaW1lbnNpb25zO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGF4ZXMgYm91bmRzLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Ym91bmRzTWFrZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gcGFyYW1zLmhhc0F4ZXMgd2hldGhlciBoYXMgYXhlZCBvciBub3RcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IHBhcmFtcy5vcHRpb25DaGFydFR5cGVzIHkgYXhpcyBjaGFydCB0eXBlc1xuICAgICAqICAgICAgQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBwYXJhbXMuZGltZW5zaW9uIGNoYXJ0IGRpbWVuc2lvblxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy50b3AgdG9wIHBvc2l0aW9uXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnJpZ2h0IHJpZ2h0IHBvc2l0aW9uXG4gICAgICogQHJldHVybnMge29iamVjdH0gYXhlcyBib3VuZHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQXhlc0JvdW5kczogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBib3VuZHMsIGRpbWVuc2lvbnMsIG9wdGlvbkNoYXJ0VHlwZXMsIHRvcCwgcmlnaHQ7XG5cbiAgICAgICAgLy8gcGll7LCo7Yq47JmAIOqwmeydtCBheGlzIOyYgeyXreydtCDtlYTsmpQg7JeG64qUIOqyveyasOyXkOuKlCDruYgg6rCS7J2EIOuwmO2ZmCDtlahcbiAgICAgICAgaWYgKCFwYXJhbXMuaGFzQXhlcykge1xuICAgICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICB9XG5cbiAgICAgICAgZGltZW5zaW9ucyA9IHBhcmFtcy5kaW1lbnNpb25zO1xuICAgICAgICBvcHRpb25DaGFydFR5cGVzID0gcGFyYW1zLm9wdGlvbkNoYXJ0VHlwZXM7XG4gICAgICAgIHRvcCA9IHBhcmFtcy50b3A7XG4gICAgICAgIHJpZ2h0ID0gcGFyYW1zLnJpZ2h0O1xuICAgICAgICBib3VuZHMgPSB7XG4gICAgICAgICAgICBwbG90OiB7XG4gICAgICAgICAgICAgICAgZGltZW5zaW9uOiBkaW1lbnNpb25zLnNlcmllcyxcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICB0b3A6IHRvcCxcbiAgICAgICAgICAgICAgICAgICAgcmlnaHQ6IHJpZ2h0XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHlBeGlzOiB7XG4gICAgICAgICAgICAgICAgZGltZW5zaW9uOiB7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiBkaW1lbnNpb25zLnlBeGlzLndpZHRoLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IGRpbWVuc2lvbnMuc2VyaWVzLmhlaWdodFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgdG9wOiB0b3AsXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IENIQVJUX1BBRERJTkcgKyBISURERU5fV0lEVEhcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgeEF4aXM6IHtcbiAgICAgICAgICAgICAgICBkaW1lbnNpb246IHtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGRpbWVuc2lvbnMuc2VyaWVzLndpZHRoLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IGRpbWVuc2lvbnMueEF4aXMuaGVpZ2h0XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICB0b3A6IHRvcCArIGRpbWVuc2lvbnMuc2VyaWVzLmhlaWdodCAtIEhJRERFTl9XSURUSCxcbiAgICAgICAgICAgICAgICAgICAgcmlnaHQ6IHJpZ2h0XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIOyasOy4oSB5IGF4aXMg7JiB7JetIGJvdW5kcyDsoJXrs7Qg7LaU6rCAXG4gICAgICAgIGlmIChvcHRpb25DaGFydFR5cGVzICYmIG9wdGlvbkNoYXJ0VHlwZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBib3VuZHMueXJBeGlzID0ge1xuICAgICAgICAgICAgICAgIGRpbWVuc2lvbjoge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogZGltZW5zaW9ucy55ckF4aXMud2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogZGltZW5zaW9ucy5zZXJpZXMuaGVpZ2h0XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICB0b3A6IHRvcCxcbiAgICAgICAgICAgICAgICAgICAgcmlnaHQ6IGRpbWVuc2lvbnMubGVnZW5kLndpZHRoICsgQ0hBUlRfUEFERElORyArIEhJRERFTl9XSURUSFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYm91bmRzO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gYm91bmRzTWFrZXI7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgY2FsY3VsYXRvci5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIEFYSVNfU1RBTkRBUkRfTVVMVElQTEVfTlVNUyA9IFsxLCAyLCA1LCAxMF07XG5cbi8qKlxuICogQ2FsY3VsYXRvci5cbiAqIEBtb2R1bGUgY2FsY3VsYXRvclxuICovXG52YXIgY2FsY3VsYXRvciA9IHtcbiAgICAvKipcbiAgICAgKiBDYWxjdWxhdGUgc2NhbGUgZnJvbSBjaGFydCBtaW4sIG1heCBkYXRhLlxuICAgICAqICAtIGh0dHA6Ly9wZWx0aWVydGVjaC5jb20vaG93LWV4Y2VsLWNhbGN1bGF0ZXMtYXV0b21hdGljLWNoYXJ0LWF4aXMtbGltaXRzL1xuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Y2FsY3VsYXRvclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtaW4gbWluIG1pbmltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1heCBtYXggbWF4aW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdGlja0NvdW50IHRpY2sgY291bnRcbiAgICAgKiBAcmV0dXJucyB7e21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19IHNjYWxlIGF4aXMgc2NhbGVcbiAgICAgKi9cbiAgICBjYWxjdWxhdGVTY2FsZTogZnVuY3Rpb24obWluLCBtYXgpIHtcbiAgICAgICAgdmFyIHNhdmVNaW4gPSAwLFxuICAgICAgICAgICAgc2NhbGUgPSB7fSxcbiAgICAgICAgICAgIGlvZFZhbHVlOyAvLyBpbmNyZWFzZSBvciBkZWNyZWFzZSB2YWx1ZTtcblxuICAgICAgICBpZiAobWluIDwgMCkge1xuICAgICAgICAgICAgc2F2ZU1pbiA9IG1pbjtcbiAgICAgICAgICAgIG1heCAtPSBtaW47XG4gICAgICAgICAgICBtaW4gPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgaW9kVmFsdWUgPSAobWF4IC0gbWluKSAvIDIwO1xuICAgICAgICBzY2FsZS5tYXggPSBtYXggKyBpb2RWYWx1ZSArIHNhdmVNaW47XG5cbiAgICAgICAgaWYgKG1heCAvIDYgPiBtaW4pIHtcbiAgICAgICAgICAgIHNjYWxlLm1pbiA9IDAgKyBzYXZlTWluO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2NhbGUubWluID0gbWluIC0gaW9kVmFsdWUgKyBzYXZlTWluO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzY2FsZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbm9ybWFsaXplIG51bWJlci5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmNhbGN1bGF0b3JcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgdGFyZ2V0IHZhbHVlXG4gICAgICogQHJldHVybnMge251bWJlcn0gbm9ybWFsaXplZCBudW1iZXJcbiAgICAgKi9cbiAgICBub3JtYWxpemVBeGlzTnVtYmVyOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICB2YXIgc3RhbmRhcmQgPSAwLFxuICAgICAgICAgICAgZmxhZyA9IDEsXG4gICAgICAgICAgICBub3JtYWxpemVkLCBtb2Q7XG5cbiAgICAgICAgaWYgKHZhbHVlID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH0gZWxzZSBpZiAodmFsdWUgPCAwKSB7XG4gICAgICAgICAgICBmbGFnID0gLTE7XG4gICAgICAgIH1cblxuICAgICAgICB2YWx1ZSAqPSBmbGFnO1xuXG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KEFYSVNfU1RBTkRBUkRfTVVMVElQTEVfTlVNUywgZnVuY3Rpb24obnVtKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgPCBudW0pIHtcbiAgICAgICAgICAgICAgICBpZiAobnVtID4gMSkge1xuICAgICAgICAgICAgICAgICAgICBzdGFuZGFyZCA9IG51bTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChudW0gPT09IDEwKSB7XG4gICAgICAgICAgICAgICAgc3RhbmRhcmQgPSAxMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHN0YW5kYXJkIDwgMSkge1xuICAgICAgICAgICAgbm9ybWFsaXplZCA9IHRoaXMubm9ybWFsaXplQXhpc051bWJlcih2YWx1ZSAqIDEwKSAqIDAuMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1vZCA9IG5lLnV0aWwubW9kKHZhbHVlLCBzdGFuZGFyZCk7XG4gICAgICAgICAgICBub3JtYWxpemVkID0gbmUudXRpbC5hZGRpdGlvbih2YWx1ZSwgKG1vZCA+IDAgPyBzdGFuZGFyZCAtIG1vZCA6IDApKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBub3JtYWxpemVkICo9IGZsYWc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgdGljayBwb3NpdGlvbnMgb2YgcGl4ZWwgdHlwZS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmNhbGN1bGF0b3JcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc2l6ZSBhcmVhIHdpZHRoIG9yIGhlaWdodFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjb3VudCB0aWNrIGNvdW50XG4gICAgICogQHJldHVybnMge2FycmF5LjxudW1iZXI+fSBwb3NpdGlvbnNcbiAgICAgKi9cbiAgICBtYWtlVGlja1BpeGVsUG9zaXRpb25zOiBmdW5jdGlvbihzaXplLCBjb3VudCkge1xuICAgICAgICB2YXIgcG9zaXRpb25zID0gW10sXG4gICAgICAgICAgICBweFNjYWxlLCBweFN0ZXA7XG5cbiAgICAgICAgaWYgKGNvdW50ID4gMCkge1xuICAgICAgICAgICAgcHhTY2FsZSA9IHttaW46IDAsIG1heDogc2l6ZSAtIDF9O1xuICAgICAgICAgICAgcHhTdGVwID0gdGhpcy5nZXRTY2FsZVN0ZXAocHhTY2FsZSwgY291bnQpO1xuICAgICAgICAgICAgcG9zaXRpb25zID0gbmUudXRpbC5tYXAobmUudXRpbC5yYW5nZSgwLCBzaXplLCBweFN0ZXApLCBmdW5jdGlvbihwb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLnJvdW5kKHBvc2l0aW9uKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcG9zaXRpb25zW3Bvc2l0aW9ucy5sZW5ndGggLSAxXSA9IHNpemUgLSAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwb3NpdGlvbnM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgbGFiZWxzIGZyb20gc2NhbGUuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpjYWxjdWxhdG9yXG4gICAgICogQHBhcmFtIHt7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX0gc2NhbGUgYXhpcyBzY2FsZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdGVwIHN0ZXAgYmV0d2VlbiBtYXggYW5kIG1pblxuICAgICAqIEByZXR1cm5zIHtzdHJpbmdbXX0gbGFiZWxzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBtYWtlTGFiZWxzRnJvbVNjYWxlOiBmdW5jdGlvbihzY2FsZSwgc3RlcCkge1xuICAgICAgICB2YXIgbXVsdGlwbGVOdW0gPSBuZS51dGlsLmZpbmRNdWx0aXBsZU51bShzdGVwKSxcbiAgICAgICAgICAgIG1pbiA9IHNjYWxlLm1pbiAqIG11bHRpcGxlTnVtLFxuICAgICAgICAgICAgbWF4ID0gc2NhbGUubWF4ICogbXVsdGlwbGVOdW0sXG4gICAgICAgICAgICBsYWJlbHMgPSBuZS51dGlsLnJhbmdlKG1pbiwgbWF4ICsgMSwgc3RlcCAqIG11bHRpcGxlTnVtKTtcbiAgICAgICAgbGFiZWxzID0gbmUudXRpbC5tYXAobGFiZWxzLCBmdW5jdGlvbihsYWJlbCkge1xuICAgICAgICAgICAgcmV0dXJuIGxhYmVsIC8gbXVsdGlwbGVOdW07XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gbGFiZWxzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgc2NhbGUgc3RlcC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmNhbGN1bGF0b3JcbiAgICAgKiBAcGFyYW0ge3ttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fSBzY2FsZSBheGlzIHNjYWxlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGNvdW50IHZhbHVlIGNvdW50XG4gICAgICogQHJldHVybnMge251bWJlcn0gc2NhbGUgc3RlcFxuICAgICAqL1xuICAgIGdldFNjYWxlU3RlcDogZnVuY3Rpb24oc2NhbGUsIGNvdW50KSB7XG4gICAgICAgIHJldHVybiAoc2NhbGUubWF4IC0gc2NhbGUubWluKSAvIChjb3VudCAtIDEpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBcnJheSBwaXZvdC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmNhbGN1bGF0b3JcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheT59IGFycjJkIHRhcmdldCAyZCBhcnJheVxuICAgICAqIEByZXR1cm5zIHthcnJheS48YXJyYXk+fSBwaXZvdGVkIDJkIGFycmF5XG4gICAgICovXG4gICAgYXJyYXlQaXZvdDogZnVuY3Rpb24oYXJyMmQpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgICBuZS51dGlsLmZvckVhY2hBcnJheShhcnIyZCwgZnVuY3Rpb24oYXJyKSB7XG4gICAgICAgICAgICBuZS51dGlsLmZvckVhY2hBcnJheShhcnIsIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgICAgICAgIGlmICghcmVzdWx0W2luZGV4XSkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRbaW5kZXhdID0gW107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlc3VsdFtpbmRleF0ucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBjYWxjdWxhdG9yO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IERhdGEgY29udmVydGVyLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2FsY3VsYXRvciA9IHJlcXVpcmUoJy4vY2FsY3VsYXRvci5qcycpO1xuXG52YXIgY29uY2F0ID0gQXJyYXkucHJvdG90eXBlLmNvbmNhdDtcblxuLyoqXG4gKiBEYXRhIGNvbnZlcnRlci5cbiAqIEBtb2R1bGUgZGF0YUNvbnZlcnRlclxuICovXG52YXIgZGF0YUNvbnZlcnRlciA9IHtcbiAgICAvKipcbiAgICAgKiBDb252ZXJ0IHVzZXIgZGF0YS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheT59IHVzZXJEYXRhIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjaGFydE9wdGlvbnMgY2hhcnQgb3B0aW9uXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNoYXJ0VHlwZSBjaGFydCB0eXBlXG4gICAgICogQHJldHVybnMge3tcbiAgICAgKiAgICAgIGxhYmVsczogYXJyYXkuPHN0cmluZz4sXG4gICAgICogICAgICB2YWx1ZXM6IGFycmF5LjxudW1iZXI+LFxuICAgICAqICAgICAgbGVnZW5kTGFiZWxzOiBhcnJheS48c3RyaW5nPixcbiAgICAgKiAgICAgIGZvcm1hdEZ1bmN0aW9uczogYXJyYXkuPGZ1bmN0aW9uPixcbiAgICAgKiAgICAgIGZvcm1hdHRlZFZhbHVlczogYXJyYXkuPHN0cmluZz5cbiAgICAgKiB9fSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqL1xuICAgIGNvbnZlcnQ6IGZ1bmN0aW9uKHVzZXJEYXRhLCBjaGFydE9wdGlvbnMsIGNoYXJ0VHlwZSkge1xuICAgICAgICB2YXIgbGFiZWxzID0gdXNlckRhdGEuY2F0ZWdvcmllcyxcbiAgICAgICAgICAgIHNlcmllc0RhdGEgPSB1c2VyRGF0YS5zZXJpZXMsXG4gICAgICAgICAgICB2YWx1ZXMgPSB0aGlzLl9waWNrVmFsdWVzKHNlcmllc0RhdGEpLFxuICAgICAgICAgICAgam9pblZhbHVlcyA9IHRoaXMuX2pvaW5WYWx1ZXModmFsdWVzKSxcbiAgICAgICAgICAgIGxlZ2VuZExhYmVscyA9IHRoaXMuX3BpY2tMZWdlbmRMYWJlbHMoc2VyaWVzRGF0YSksXG4gICAgICAgICAgICBqb2luTGVnZW5kTGFiZWxzID0gdGhpcy5fam9pbkxlZ2VuZExhYmVscyhsZWdlbmRMYWJlbHMsIGNoYXJ0VHlwZSksXG4gICAgICAgICAgICBmb3JtYXQgPSBjaGFydE9wdGlvbnMgJiYgY2hhcnRPcHRpb25zLmZvcm1hdCB8fCAnJyxcbiAgICAgICAgICAgIGZvcm1hdEZ1bmN0aW9ucyA9IHRoaXMuX2ZpbmRGb3JtYXRGdW5jdGlvbnMoZm9ybWF0KSxcbiAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlcyA9IGZvcm1hdCA/IHRoaXMuX2Zvcm1hdFZhbHVlcyh2YWx1ZXMsIGZvcm1hdEZ1bmN0aW9ucykgOiB2YWx1ZXM7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsYWJlbHM6IGxhYmVscyxcbiAgICAgICAgICAgIHZhbHVlczogdmFsdWVzLFxuICAgICAgICAgICAgam9pblZhbHVlczogam9pblZhbHVlcyxcbiAgICAgICAgICAgIGxlZ2VuZExhYmVsczogbGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgam9pbkxlZ2VuZExhYmVsczogam9pbkxlZ2VuZExhYmVscyxcbiAgICAgICAgICAgIGZvcm1hdEZ1bmN0aW9uczogZm9ybWF0RnVuY3Rpb25zLFxuICAgICAgICAgICAgZm9ybWF0dGVkVmFsdWVzOiBmb3JtYXR0ZWRWYWx1ZXNcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2VwYXJhdGUgbGFiZWwuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXkuPGFycmF5Pj59IHVzZXJEYXRhIHVzZXIgZGF0YVxuICAgICAqIEByZXR1cm5zIHt7bGFiZWxzOiAoYXJyYXkuPHN0cmluZz4pLCBzb3VyY2VEYXRhOiBhcnJheS48YXJyYXkuPGFycmF5Pj59fSByZXN1bHQgZGF0YVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NlcGFyYXRlTGFiZWw6IGZ1bmN0aW9uKHVzZXJEYXRhKSB7XG4gICAgICAgIHZhciBsYWJlbHMgPSB1c2VyRGF0YVswXS5wb3AoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxhYmVsczogbGFiZWxzLFxuICAgICAgICAgICAgc291cmNlRGF0YTogdXNlckRhdGFcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUGljayB2YWx1ZS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge2FycmF5fSBpdGVtcyBpdGVtc1xuICAgICAqIEByZXR1cm5zIHthcnJheX0gcGlja2VkIHZhbHVlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcGlja1ZhbHVlOiBmdW5jdGlvbihpdGVtcykge1xuICAgICAgICByZXR1cm4gW10uY29uY2F0KGl0ZW1zLmRhdGEpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBQaWNrIHZhbHVlcyBmcm9tIGF4aXMgZGF0YS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheT59IHNlcmllc0RhdGEgc2VyaWVzIGRhdGFcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nW119IHZhbHVlc1xuICAgICAqL1xuICAgIF9waWNrVmFsdWVzOiBmdW5jdGlvbihzZXJpZXNEYXRhKSB7XG4gICAgICAgIHZhciB2YWx1ZXMsIHJlc3VsdDtcbiAgICAgICAgaWYgKG5lLnV0aWwuaXNBcnJheShzZXJpZXNEYXRhKSkge1xuICAgICAgICAgICAgdmFsdWVzID0gbmUudXRpbC5tYXAoc2VyaWVzRGF0YSwgdGhpcy5fcGlja1ZhbHVlLCB0aGlzKTtcbiAgICAgICAgICAgIHJlc3VsdCA9IGNhbGN1bGF0b3IuYXJyYXlQaXZvdCh2YWx1ZXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0ID0ge307XG4gICAgICAgICAgICBuZS51dGlsLmZvckVhY2goc2VyaWVzRGF0YSwgZnVuY3Rpb24oZ3JvdXBWYWx1ZXMsIHR5cGUpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZXMgPSBuZS51dGlsLm1hcChncm91cFZhbHVlcywgdGhpcy5fcGlja1ZhbHVlLCB0aGlzKTtcbiAgICAgICAgICAgICAgICByZXN1bHRbdHlwZV0gPSBjYWxjdWxhdG9yLmFycmF5UGl2b3QodmFsdWVzKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEpvaW4gdmFsdWVzLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gdmFsdWVzIHZhbHVlc1xuICAgICAqIEByZXR1cm5zIHthcnJheS48bnVtYmVyPn0gam9pbiB2YWx1ZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9qb2luVmFsdWVzOiBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgdmFyIGpvaW5WYWx1ZXM7XG5cbiAgICAgICAgaWYgKG5lLnV0aWwuaXNBcnJheSh2YWx1ZXMpKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWVzO1xuICAgICAgICB9XG5cbiAgICAgICAgam9pblZhbHVlcyA9IG5lLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24oZ3JvdXBWYWx1ZXMpIHtcbiAgICAgICAgICAgIHJldHVybiBncm91cFZhbHVlcztcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgcmV0dXJuIGNvbmNhdC5hcHBseShbXSwgam9pblZhbHVlcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFBpY2sgbGVnZW5kIGxhYmVsLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBpdGVtIGl0ZW1cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBsYWJlbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3BpY2tMZWdlbmRMYWJlbDogZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICByZXR1cm4gaXRlbS5uYW1lO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBQaWNrIGxlZ2VuZCBsYWJlbHMgZnJvbSBheGlzIGRhdGEuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXk+fSBzZXJpZXNEYXRhIHNlcmllcyBkYXRhXG4gICAgICogQHJldHVybnMge3N0cmluZ1tdfSBsYWJlbHNcbiAgICAgKi9cbiAgICBfcGlja0xlZ2VuZExhYmVsczogZnVuY3Rpb24oc2VyaWVzRGF0YSkge1xuICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICBpZiAobmUudXRpbC5pc0FycmF5KHNlcmllc0RhdGEpKSB7XG4gICAgICAgICAgICByZXN1bHQgPSBuZS51dGlsLm1hcChzZXJpZXNEYXRhLCB0aGlzLl9waWNrTGVnZW5kTGFiZWwsIHRoaXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0ID0ge307XG4gICAgICAgICAgICBuZS51dGlsLmZvckVhY2goc2VyaWVzRGF0YSwgZnVuY3Rpb24oZ3JvdXBWYWx1ZXMsIHR5cGUpIHtcbiAgICAgICAgICAgICAgICByZXN1bHRbdHlwZV0gPSBuZS51dGlsLm1hcChncm91cFZhbHVlcywgdGhpcy5fcGlja0xlZ2VuZExhYmVsLCB0aGlzKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEpvaW4gbGVnZW5kIGxhYmVscy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge2FycmF5fSBsZWdlbmRMYWJlbHMgbGVnZW5kIGxhYmVsc1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjaGFydFR5cGUgY2hhcnQgdHlwZVxuICAgICAqIEByZXR1cm5zIHthcnJheX0gbGFiZWxzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfam9pbkxlZ2VuZExhYmVsczogZnVuY3Rpb24obGVnZW5kTGFiZWxzLCBjaGFydFR5cGUpIHtcbiAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgaWYgKG5lLnV0aWwuaXNBcnJheShsZWdlbmRMYWJlbHMpKSB7XG4gICAgICAgICAgICByZXN1bHQgPSBuZS51dGlsLm1hcChsZWdlbmRMYWJlbHMsIGZ1bmN0aW9uKGxhYmVsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgY2hhcnRUeXBlOiBjaGFydFR5cGUsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiBsYWJlbFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IG5lLnV0aWwubWFwKGxlZ2VuZExhYmVscywgZnVuY3Rpb24obGFiZWxzLCBfY2hhcnRUeXBlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwubWFwKGxhYmVscywgZnVuY3Rpb24obGFiZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0VHlwZTogX2NoYXJ0VHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBsYWJlbFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgICAgICByZXN1bHQgPSBjb25jYXQuYXBwbHkoW10sIHJlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gZm9ybWF0IGdyb3VwIHZhbHVlcy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheT59IGdyb3VwVmFsdWVzIGdyb3VwIHZhbHVlc1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb25bXX0gZm9ybWF0RnVuY3Rpb25zIGZvcm1hdCBmdW5jdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nW119IGZvcm1hdHRlZCB2YWx1ZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9mb3JtYXRHcm91cFZhbHVlczogZnVuY3Rpb24oZ3JvdXBWYWx1ZXMsIGZvcm1hdEZ1bmN0aW9ucykge1xuICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAoZ3JvdXBWYWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICB2YXIgZm5zID0gW3ZhbHVlXS5jb25jYXQoZm9ybWF0RnVuY3Rpb25zKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmUudXRpbC5yZWR1Y2UoZm5zLCBmdW5jdGlvbihzdG9yZWQsIGZuKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmbihzdG9yZWQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBmb3JtYXQgY29udmVydGVkIHZhbHVlcy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheT59IGNoYXJ0VmFsdWVzIGNoYXJ0IHZhbHVlc1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb25bXX0gZm9ybWF0RnVuY3Rpb25zIGZvcm1hdCBmdW5jdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nW119IGZvcm1hdHRlZCB2YWx1ZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9mb3JtYXRWYWx1ZXM6IGZ1bmN0aW9uKGNoYXJ0VmFsdWVzLCBmb3JtYXRGdW5jdGlvbnMpIHtcbiAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgaWYgKG5lLnV0aWwuaXNBcnJheShjaGFydFZhbHVlcykpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuX2Zvcm1hdEdyb3VwVmFsdWVzKGNoYXJ0VmFsdWVzLCBmb3JtYXRGdW5jdGlvbnMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0ID0ge307XG4gICAgICAgICAgICBuZS51dGlsLmZvckVhY2goY2hhcnRWYWx1ZXMsIGZ1bmN0aW9uKGdyb3VwVmFsdWVzLCBjaGFydFR5cGUpIHtcbiAgICAgICAgICAgICAgICByZXN1bHRbY2hhcnRUeXBlXSA9IHRoaXMuX2Zvcm1hdEdyb3VwVmFsdWVzKGdyb3VwVmFsdWVzLCBmb3JtYXRGdW5jdGlvbnMpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUGljayBtYXggbGVuZ3RoIHVuZGVyIHBvaW50LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IHZhbHVlcyBjaGFydCB2YWx1ZXNcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBtYXggbGVuZ3RoIHVuZGVyIHBvaW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcGlja01heExlblVuZGVyUG9pbnQ6IGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICB2YXIgbWF4ID0gMDtcblxuICAgICAgICBuZS51dGlsLmZvckVhY2hBcnJheSh2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgbGVuID0gbmUudXRpbC5sZW5ndGhBZnRlclBvaW50KHZhbHVlKTtcbiAgICAgICAgICAgIGlmIChsZW4gPiBtYXgpIHtcbiAgICAgICAgICAgICAgICBtYXggPSBsZW47XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIHJldHVybiBtYXg7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgemVybyBmaWxsIGZvcm1hdCBvciBub3QuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZvcm1hdCBmb3JtYXRcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gcmVzdWx0IGJvb2xlYW5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc1plcm9GaWxsOiBmdW5jdGlvbihmb3JtYXQpIHtcbiAgICAgICAgcmV0dXJuIGZvcm1hdC5sZW5ndGggPiAyICYmIGZvcm1hdC5jaGFyQXQoMCkgPT09ICcwJztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciBkZWNpbWFsIGZvcm1hdCBvciBub3QuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZvcm1hdCBmb3JtYXRcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gcmVzdWx0IGJvb2xlYW5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc0RlY2ltYWw6IGZ1bmN0aW9uKGZvcm1hdCkge1xuICAgICAgICB2YXIgaW5kZXhPZiA9IGZvcm1hdC5pbmRleE9mKCcuJyk7XG4gICAgICAgIHJldHVybiBpbmRleE9mID4gLTEgJiYgaW5kZXhPZiA8IGZvcm1hdC5sZW5ndGggLSAxO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIGNvbW1hIGZvcm1hdCBvciBub3QuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZvcm1hdCBmb3JtYXRcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gcmVzdWx0IGJvb2xlYW5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc0NvbW1hOiBmdW5jdGlvbihmb3JtYXQpIHtcbiAgICAgICAgcmV0dXJuIGZvcm1hdC5pbmRleE9mKCcsJykgPT09IGZvcm1hdC5zcGxpdCgnLicpWzBdLmxlbmd0aCAtIDQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZvcm1hdCB6ZXJvIGZpbGwuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGxlbiBsZW5ndGggb2YgcmVzdWx0XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlIHRhcmdldCB2YWx1ZVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGZvcm1hdHRlZCB2YWx1ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2Zvcm1hdFplcm9GaWxsOiBmdW5jdGlvbihsZW4sIHZhbHVlKSB7XG4gICAgICAgIHZhciB6ZXJvID0gJzAnLFxuICAgICAgICAgICAgaXNNaW51cyA9IHZhbHVlIDwgMDtcblxuICAgICAgICB2YWx1ZSA9IE1hdGguYWJzKHZhbHVlKSArICcnO1xuXG4gICAgICAgIGlmICh2YWx1ZS5sZW5ndGggPj0gbGVuKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICB3aGlsZSAodmFsdWUubGVuZ3RoIDwgbGVuKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHplcm8gKyB2YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoaXNNaW51cyA/ICctJyA6ICcnKSArIHZhbHVlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGb3JtYXQgRGVjaW1hbC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbGVuIGxlbmd0aCBvZiB1bmRlciBkZWNpbWFsIHBvaW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlIHRhcmdldCB2YWx1ZVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGZvcm1hdHRlZCB2YWx1ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2Zvcm1hdERlY2ltYWw6IGZ1bmN0aW9uKGxlbiwgdmFsdWUpIHtcbiAgICAgICAgdmFyIHBvdztcblxuICAgICAgICBpZiAobGVuID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5yb3VuZCh2YWx1ZSwgMTApO1xuICAgICAgICB9XG5cbiAgICAgICAgcG93ID0gTWF0aC5wb3coMTAsIGxlbik7XG4gICAgICAgIHZhbHVlID0gTWF0aC5yb3VuZCh2YWx1ZSAqIHBvdykgLyBwb3c7XG4gICAgICAgIHZhbHVlID0gcGFyc2VGbG9hdCh2YWx1ZSkudG9GaXhlZChsZW4pO1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZvcm1hdCBDb21tYS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWUgdGFyZ2V0IHZhbHVlXG4gICAgICogQHJldHVybnMge3N0cmluZ30gZm9ybWF0dGVkIHZhbHVlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZm9ybWF0Q29tbWE6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHZhciBjb21tYSA9ICcsJyxcbiAgICAgICAgICAgIHVuZGVyUG9pbnRWYWx1ZSA9ICcnLFxuICAgICAgICAgICAgdmFsdWVzO1xuXG4gICAgICAgIHZhbHVlICs9ICcnO1xuXG4gICAgICAgIGlmICh2YWx1ZS5pbmRleE9mKCcuJykgPiAtMSkge1xuICAgICAgICAgICAgdmFsdWVzID0gdmFsdWUuc3BsaXQoJy4nKTtcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWVzWzBdO1xuICAgICAgICAgICAgdW5kZXJQb2ludFZhbHVlID0gJy4nICsgdmFsdWVzWzFdO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA8IDQpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZSArIHVuZGVyUG9pbnRWYWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhbHVlcyA9ICh2YWx1ZSkuc3BsaXQoJycpLnJldmVyc2UoKTtcbiAgICAgICAgdmFsdWVzID0gbmUudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbihjaGFyLCBpbmRleCkge1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IFtjaGFyXTtcbiAgICAgICAgICAgIGlmICgoaW5kZXggKyAxKSAlIDMgPT09IDApIHtcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChjb21tYSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gY29uY2F0LmFwcGx5KFtdLCB2YWx1ZXMpLnJldmVyc2UoKS5qb2luKCcnKSArIHVuZGVyUG9pbnRWYWx1ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmluZCBmb3JtYXQgZnVuY3Rpb25zLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmb3JtYXQgZm9ybWF0XG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gdmFsdWVzIGNoYXJ0IHZhbHVlc1xuICAgICAqIEByZXR1cm5zIHtmdW5jdGlvbltdfSBmdW5jdGlvbnNcbiAgICAgKi9cbiAgICBfZmluZEZvcm1hdEZ1bmN0aW9uczogZnVuY3Rpb24oZm9ybWF0KSB7XG4gICAgICAgIHZhciBmdW5jcyA9IFtdLFxuICAgICAgICAgICAgbGVuO1xuXG4gICAgICAgIGlmICghZm9ybWF0KSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5faXNEZWNpbWFsKGZvcm1hdCkpIHtcbiAgICAgICAgICAgIGxlbiA9IHRoaXMuX3BpY2tNYXhMZW5VbmRlclBvaW50KFtmb3JtYXRdKTtcbiAgICAgICAgICAgIGZ1bmNzID0gW25lLnV0aWwuYmluZCh0aGlzLl9mb3JtYXREZWNpbWFsLCB0aGlzLCBsZW4pXTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9pc1plcm9GaWxsKGZvcm1hdCkpIHtcbiAgICAgICAgICAgIGxlbiA9IGZvcm1hdC5sZW5ndGg7XG4gICAgICAgICAgICBmdW5jcyA9IFtuZS51dGlsLmJpbmQodGhpcy5fZm9ybWF0WmVyb0ZpbGwsIHRoaXMsIGxlbildO1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmNzO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2lzQ29tbWEoZm9ybWF0KSkge1xuICAgICAgICAgICAgZnVuY3MucHVzaCh0aGlzLl9mb3JtYXRDb21tYSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZnVuY3M7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBkYXRhQ29udmVydGVyO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IERPTSBIYW5kbGVyLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIERPTSBIYW5kbGVyLlxuICogQG1vZHVsZSBkb21IYW5kbGVyXG4gKi9cbnZhciBkb21IYW5kbGVyID0ge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZSBlbGVtZW50LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZG9tSGFuZGxlclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0YWcgaHRtbCB0YWdcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmV3Q2xhc3MgY2xhc3MgbmFtZVxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gY3JlYXRlZCBlbGVtZW50XG4gICAgICovXG4gICAgY3JlYXRlOiBmdW5jdGlvbih0YWcsIG5ld0NsYXNzKSB7XG4gICAgICAgIHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnKTtcblxuICAgICAgICBpZiAobmV3Q2xhc3MpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkQ2xhc3MoZWwsIG5ld0NsYXNzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNsYXNzIG5hbWVzLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZG9tSGFuZGxlclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHJldHVybnMge2FycmF5fSBuYW1lc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldENsYXNzTmFtZXM6IGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgIHZhciBjbGFzc05hbWUgPSBlbC5jbGFzc05hbWUgfHwgJycsXG4gICAgICAgICAgICBjbGFzc05hbWVzID0gY2xhc3NOYW1lID8gY2xhc3NOYW1lLnNwbGl0KCcgJykgOiBbXTtcbiAgICAgICAgcmV0dXJuIGNsYXNzTmFtZXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZCBjc3MgY2xhc3MgdG8gdGFyZ2V0IGVsZW1lbnQuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkb21IYW5kbGVyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmV3Q2xhc3MgYWRkIGNsYXNzIG5hbWVcbiAgICAgKi9cbiAgICBhZGRDbGFzczogZnVuY3Rpb24oZWwsIG5ld0NsYXNzKSB7XG4gICAgICAgIHZhciBjbGFzc05hbWVzID0gdGhpcy5fZ2V0Q2xhc3NOYW1lcyhlbCksXG4gICAgICAgICAgICBpbmRleCA9IG5lLnV0aWwuaW5BcnJheShuZXdDbGFzcywgY2xhc3NOYW1lcyk7XG5cbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNsYXNzTmFtZXMucHVzaChuZXdDbGFzcyk7XG4gICAgICAgIGVsLmNsYXNzTmFtZSA9IGNsYXNzTmFtZXMuam9pbignICcpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgY3NzIGNsYXNzIGZyb20gdGFyZ2V0IGVsZW1lbnQuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkb21IYW5kbGVyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcm1DbGFzcyByZW1vdmUgY2xhc3MgbmFtZVxuICAgICAqL1xuICAgIHJlbW92ZUNsYXNzOiBmdW5jdGlvbihlbCwgcm1DbGFzcykge1xuICAgICAgICB2YXIgY2xhc3NOYW1lcyA9IHRoaXMuX2dldENsYXNzTmFtZXMoZWwpLFxuICAgICAgICAgICAgaW5kZXggPSBuZS51dGlsLmluQXJyYXkocm1DbGFzcywgY2xhc3NOYW1lcyk7XG5cbiAgICAgICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY2xhc3NOYW1lcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICBlbC5jbGFzc05hbWUgPSBjbGFzc05hbWVzLmpvaW4oJyAnKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciBjbGFzcyBleGlzdCBvciBub3QuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkb21IYW5kbGVyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZmluZENsYXNzIHRhcmdldCBjc3MgY2xhc3NcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gaGFzIGNsYXNzXG4gICAgICovXG4gICAgaGFzQ2xhc3M6IGZ1bmN0aW9uKGVsLCBmaW5kQ2xhc3MpIHtcbiAgICAgICAgdmFyIGNsYXNzTmFtZXMgPSB0aGlzLl9nZXRDbGFzc05hbWVzKGVsKSxcbiAgICAgICAgICAgIGluZGV4ID0gbmUudXRpbC5pbkFycmF5KGZpbmRDbGFzcywgY2xhc3NOYW1lcyk7XG4gICAgICAgIHJldHVybiBpbmRleCA+IC0xO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGaW5kIHBhcmVudCBieSBjbGFzcyBuYW1lLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZG9tSGFuZGxlclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNsYXNzTmFtZSB0YXJnZXQgY3NzIGNsYXNzXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGxhc3RDbGFzcyBsYXN0IGNzcyBjbGFzc1xuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gcmVzdWx0IGVsZW1lbnRcbiAgICAgKi9cbiAgICBmaW5kUGFyZW50QnlDbGFzczogZnVuY3Rpb24oZWwsIGNsYXNzTmFtZSwgbGFzdENsYXNzKSB7XG4gICAgICAgIHZhciBwYXJlbnQgPSBlbC5wYXJlbnROb2RlO1xuICAgICAgICBpZiAoIXBhcmVudCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5oYXNDbGFzcyhwYXJlbnQsIGNsYXNzTmFtZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBwYXJlbnQ7XG4gICAgICAgIH0gZWxzZSBpZiAocGFyZW50Lm5vZGVOYW1lID09PSAnQk9EWScgfHwgdGhpcy5oYXNDbGFzcyhwYXJlbnQsIGxhc3RDbGFzcykpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmluZFBhcmVudEJ5Q2xhc3MocGFyZW50LCBjbGFzc05hbWUsIGxhc3RDbGFzcyk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXBwZW5kIGNoaWxkIGVsZW1lbnQuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkb21IYW5kbGVyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNvbnRhaW5lciBlbGVtZW50XG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY2hpbGRyZW4gY2hpbGQgZWxlbWVudFxuICAgICAqL1xuICAgIGFwcGVuZDogZnVuY3Rpb24oY29udGFpbmVyLCBjaGlsZHJlbikge1xuICAgICAgICBpZiAoIWNvbnRhaW5lciB8fCAhY2hpbGRyZW4pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjaGlsZHJlbiA9IG5lLnV0aWwuaXNBcnJheShjaGlsZHJlbikgPyBjaGlsZHJlbiA6IFtjaGlsZHJlbl07XG5cbiAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkoY2hpbGRyZW4sIGZ1bmN0aW9uKGNoaWxkKSB7XG4gICAgICAgICAgICBpZiAoIWNoaWxkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGNoaWxkKTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBkb21IYW5kbGVyO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEV2ZW50IGxpc3RlbmVyLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEV2ZW50IGxpc3RlbmVyLlxuICogQG1vZHVsZSBldmVudExpc3RlbmVyXG4gKi9cbnZhciBldmVudExpc3RlbmVyID0ge1xuICAgIC8qKlxuICAgICAqIEV2ZW50IGxpc3RlbmVyIGZvciBJRS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmV2ZW50TGlzdGVuZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lIGV2ZW50IG5hbWVcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYXR0YWNoRXZlbnQ6IGZ1bmN0aW9uIChldmVudE5hbWUsIGVsLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09IFwib2JqZWN0XCIgJiYgY2FsbGJhY2suaGFuZGxlRXZlbnQpIHtcbiAgICAgICAgICAgIGVsLmF0dGFjaEV2ZW50KFwib25cIiArIGV2ZW50TmFtZSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrLmhhbmRsZUV2ZW50LmNhbGwoY2FsbGJhY2spO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbC5hdHRhY2hFdmVudChcIm9uXCIgKyBldmVudE5hbWUsIGNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFdmVudCBsaXN0ZW5lciBmb3Igb3RoZXIgYnJvd3NlcnMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpldmVudExpc3RlbmVyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZSBldmVudCBuYW1lXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayBjYWxsYmFjayBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2FkZEV2ZW50TGlzdGVuZXI6IGZ1bmN0aW9uIChldmVudE5hbWUsIGVsLCBjYWxsYmFjaykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGNhbGxiYWNrKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PSBcIm9iamVjdFwiICYmIGNhbGxiYWNrLmhhbmRsZUV2ZW50KSB7XG4gICAgICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5oYW5kbGVFdmVudC5jYWxsKGNhbGxiYWNrLCBldmVudCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEJpbmQgZXZlbnQgZnVuY3Rpb24uXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpldmVudExpc3RlbmVyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZSBldmVudCBuYW1lXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayBjYWxsYmFjayBmdW5jdGlvblxuICAgICAqL1xuICAgIGJpbmRFdmVudDogZnVuY3Rpb24gKGV2ZW50TmFtZSwgZWwsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBiaW5kRXZlbnQ7XG4gICAgICAgIGlmIChcImFkZEV2ZW50TGlzdGVuZXJcIiBpbiBlbCkge1xuICAgICAgICAgICAgYmluZEV2ZW50ID0gdGhpcy5fYWRkRXZlbnRMaXN0ZW5lcjtcbiAgICAgICAgfSBlbHNlIGlmIChcImF0dGFjaEV2ZW50XCIgaW4gZWwpIHtcbiAgICAgICAgICAgIGJpbmRFdmVudCA9IHRoaXMuX2F0dGFjaEV2ZW50O1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYmluZEV2ZW50ID0gYmluZEV2ZW50O1xuICAgICAgICBiaW5kRXZlbnQoZXZlbnROYW1lLCBlbCwgY2FsbGJhY2spO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXZlbnRMaXN0ZW5lcjtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBVdGlsIGZvciByZW5kZXJpbmcuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBkb20gPSByZXF1aXJlKCcuL2RvbUhhbmRsZXInKSxcbiAgICBjaGFydENvbnN0ID0gcmVxdWlyZSgnLi8uLi9jb25zdC5qcycpO1xuXG52YXIgYnJvd3NlciA9IG5lLnV0aWwuYnJvd3NlcixcbiAgICBpc0lFOCA9IGJyb3dzZXIubXNpZSAmJiBicm93c2VyLnZlcnNpb24gPT09IDg7XG5cbi8qKlxuICogVXRpbCBmb3IgcmVuZGVyaW5nLlxuICogQG1vZHVsZSByZW5kZXJVdGlsXG4gKi9cbnZhciByZW5kZXJVdGlsID0ge1xuICAgIC8qKlxuICAgICAqIENvbmNhdCBzdHJpbmcuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpyZW5kZXJVdGlsXG4gICAgICogQHBhcmFtcyB7Li4uc3RyaW5nfSB0YXJnZXQgc3RyaW5nc1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGNvbmNhdCBzdHJpbmdcbiAgICAgKi9cbiAgICBjb25jYXRTdHI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gU3RyaW5nLnByb3RvdHlwZS5jb25jYXQuYXBwbHkoJycsIGFyZ3VtZW50cyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgY3NzVGV4dCBmb3IgZm9udC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOnJlbmRlclV0aWxcbiAgICAgKiBAcGFyYW0ge3tmb250U2l6ZTogbnVtYmVyLCBmb250RmFtaWx5OiBzdHJpbmcsIGNvbG9yOiBzdHJpbmd9fSB0aGVtZSBmb250IHRoZW1lXG4gICAgICogQHJldHVybnMge3N0cmluZ30gY3NzVGV4dFxuICAgICAqL1xuICAgIG1ha2VGb250Q3NzVGV4dDogZnVuY3Rpb24odGhlbWUpIHtcbiAgICAgICAgdmFyIGNzc1RleHRzID0gW107XG5cbiAgICAgICAgaWYgKCF0aGVtZSkge1xuICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoZW1lLmZvbnRTaXplKSB7XG4gICAgICAgICAgICBjc3NUZXh0cy5wdXNoKHRoaXMuY29uY2F0U3RyKCdmb250LXNpemU6JywgdGhlbWUuZm9udFNpemUsICdweCcpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGVtZS5mb250RmFtaWx5KSB7XG4gICAgICAgICAgICBjc3NUZXh0cy5wdXNoKHRoaXMuY29uY2F0U3RyKCdmb250LWZhbWlseTonLCB0aGVtZS5mb250RmFtaWx5KSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhlbWUuY29sb3IpIHtcbiAgICAgICAgICAgIGNzc1RleHRzLnB1c2godGhpcy5jb25jYXRTdHIoJ2NvbG9yOicsIHRoZW1lLmNvbG9yKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY3NzVGV4dHMuam9pbignOycpO1xuICAgIH0sXG5cbiAgICBjaGVja0VsOiBudWxsLFxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBlbGVtZW50IGZvciBzaXplIGNoZWNrLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6cmVuZGVyVXRpbFxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NyZWF0ZVNpemVDaGVja0VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGVsRGl2LCBlbFNwYW47XG4gICAgICAgIGlmICh0aGlzLmNoZWNrRWwpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoZWNrRWw7XG4gICAgICAgIH1cblxuICAgICAgICBlbERpdiA9IGRvbS5jcmVhdGUoJ0RJVicsICduZS1jaGFydC1zaXplLWNoZWNrLWVsZW1lbnQnKTtcbiAgICAgICAgZWxTcGFuID0gZG9tLmNyZWF0ZSgnU1BBTicpO1xuXG4gICAgICAgIGVsRGl2LmFwcGVuZENoaWxkKGVsU3Bhbik7XG4gICAgICAgIHRoaXMuY2hlY2tFbCA9IGVsRGl2O1xuICAgICAgICByZXR1cm4gZWxEaXY7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCByZW5kZXJlZCBsYWJlbCBzaXplICh3aWR0aCBvciBoZWlnaHQpLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6cmVuZGVyVXRpbFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBsYWJlbCBsYWJlbFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSB0aGVtZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBvZmZzZXRUeXBlIG9mZnNldCB0eXBlIChvZmZzZXRXaWR0aCBvciBvZmZzZXRIZWlnaHQpXG4gICAgICogQHJldHVybnMge251bWJlcn0gc2l6ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFJlbmRlcmVkTGFiZWxTaXplOiBmdW5jdGlvbihsYWJlbCwgdGhlbWUsIG9mZnNldFR5cGUpIHtcbiAgICAgICAgdmFyIGVsRGl2LCBlbFNwYW4sIGxhYmVsU2l6ZTtcblxuICAgICAgICBpZiAobmUudXRpbC5pc1VuZGVmaW5lZChsYWJlbCkgfHwgbGFiZWwgPT09ICcnKSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGVsRGl2ID0gdGhpcy5fY3JlYXRlU2l6ZUNoZWNrRWwoKTtcbiAgICAgICAgZWxTcGFuID0gZWxEaXYuZmlyc3RDaGlsZDtcblxuICAgICAgICB0aGVtZSA9IHRoZW1lIHx8IHt9O1xuICAgICAgICBlbFNwYW4uaW5uZXJIVE1MID0gbGFiZWw7XG4gICAgICAgIGVsU3Bhbi5zdHlsZS5mb250U2l6ZSA9ICh0aGVtZS5mb250U2l6ZSB8fCBjaGFydENvbnN0LkRFRkFVTFRfTEFCRUxfRk9OVF9TSVpFKSArICdweCc7XG5cbiAgICAgICAgaWYgKHRoZW1lLmZvbnRGYW1pbHkpIHtcbiAgICAgICAgICAgIGVsU3Bhbi5zdHlsZS5wYWRkaW5nID0gMDtcbiAgICAgICAgICAgIGVsU3Bhbi5zdHlsZS5mb250RmFtaWx5ID0gdGhlbWUuZm9udEZhbWlseTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZWxEaXYpO1xuICAgICAgICBsYWJlbFNpemUgPSBlbFNwYW5bb2Zmc2V0VHlwZV07XG4gICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoZWxEaXYpO1xuICAgICAgICByZXR1cm4gbGFiZWxTaXplO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgcmVuZGVyZWQgbGFiZWwgd2lkdGguXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpyZW5kZXJVdGlsXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGxhYmVsIGxhYmVsXG4gICAgICogQHBhcmFtIHt7Zm9udFNpemU6IG51bWJlciwgZm9udEZhbWlseTogc3RyaW5nLCBjb2xvcjogc3RyaW5nfX0gdGhlbWUgbGFiZWwgdGhlbWVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSB3aWR0aFxuICAgICAqL1xuICAgIGdldFJlbmRlcmVkTGFiZWxXaWR0aDogZnVuY3Rpb24obGFiZWwsIHRoZW1lKSB7XG4gICAgICAgIHZhciBsYWJlbFdpZHRoID0gdGhpcy5fZ2V0UmVuZGVyZWRMYWJlbFNpemUobGFiZWwsIHRoZW1lLCAnb2Zmc2V0V2lkdGgnKTtcbiAgICAgICAgcmV0dXJuIGxhYmVsV2lkdGg7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCByZW5kZXJlZCBsYWJlbCBoZWlnaHQuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpyZW5kZXJVdGlsXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGxhYmVsIGxhYmVsXG4gICAgICogQHBhcmFtIHt7Zm9udFNpemU6IG51bWJlciwgZm9udEZhbWlseTogc3RyaW5nLCBjb2xvcjogc3RyaW5nfX0gdGhlbWUgbGFiZWwgdGhlbWVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBoZWlnaHRcbiAgICAgKi9cbiAgICBnZXRSZW5kZXJlZExhYmVsSGVpZ2h0OiBmdW5jdGlvbihsYWJlbCwgdGhlbWUpIHtcbiAgICAgICAgdmFyIGxhYmVsSGVpZ2h0ID0gdGhpcy5fZ2V0UmVuZGVyZWRMYWJlbFNpemUobGFiZWwsIHRoZW1lLCAnb2Zmc2V0SGVpZ2h0Jyk7XG4gICAgICAgIHJldHVybiBsYWJlbEhlaWdodDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGRpbWVuc2lvbi5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOnJlbmRlclV0aWxcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gZGltZW5zaW9uIGRpbWVuc2lvblxuICAgICAqL1xuICAgIHJlbmRlckRpbWVuc2lvbjogZnVuY3Rpb24oZWwsIGRpbWVuc2lvbikge1xuICAgICAgICBlbC5zdHlsZS5jc3NUZXh0ID0gW1xuICAgICAgICAgICAgdGhpcy5jb25jYXRTdHIoJ3dpZHRoOicsIGRpbWVuc2lvbi53aWR0aCwgJ3B4JyksXG4gICAgICAgICAgICB0aGlzLmNvbmNhdFN0cignaGVpZ2h0OicsIGRpbWVuc2lvbi5oZWlnaHQsICdweCcpXG4gICAgICAgIF0uam9pbignOycpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgcG9zaXRpb24odG9wLCByaWdodCkuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpyZW5kZXJVdGlsXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3t0b3A6IG51bWJlciwgbGVmdDogbnVtYmVyLCByaWdodDogbnVtYmVyfX0gcG9zaXRpb24gcG9zaXRpb25cbiAgICAgKi9cbiAgICByZW5kZXJQb3NpdGlvbjogZnVuY3Rpb24oZWwsIHBvc2l0aW9uKSB7XG4gICAgICAgIGlmIChuZS51dGlsLmlzVW5kZWZpbmVkKHBvc2l0aW9uKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBvc2l0aW9uLnRvcCkge1xuICAgICAgICAgICAgZWwuc3R5bGUudG9wID0gcG9zaXRpb24udG9wICsgJ3B4JztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwb3NpdGlvbi5sZWZ0KSB7XG4gICAgICAgICAgICBlbC5zdHlsZS5sZWZ0ID0gcG9zaXRpb24ubGVmdCArICdweCc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocG9zaXRpb24ucmlnaHQpIHtcbiAgICAgICAgICAgIGVsLnN0eWxlLnJpZ2h0ID0gcG9zaXRpb24ucmlnaHQgKyAncHgnO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBiYWNrZ3JvdW5kLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6cmVuZGVyVXRpbFxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGJhY2tncm91bmQgYmFja2dyb3VuZCBvcHRpb25cbiAgICAgKi9cbiAgICByZW5kZXJCYWNrZ3JvdW5kOiBmdW5jdGlvbihlbCwgYmFja2dyb3VuZCkge1xuICAgICAgICBpZiAoIWJhY2tncm91bmQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGVsLnN0eWxlLmJhY2tncm91bmQgPSBiYWNrZ3JvdW5kO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgZm9udCBmYW1pbHkuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpyZW5kZXJVdGlsXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZm9udEZhbWlseSBmb250IGZhbWlseSBvcHRpb25cbiAgICAgKi9cbiAgICByZW5kZXJGb250RmFtaWx5OiBmdW5jdGlvbihlbCwgZm9udEZhbWlseSkge1xuICAgICAgICBpZiAoIWZvbnRGYW1pbHkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGVsLnN0eWxlLmZvbnRGYW1pbHkgPSBmb250RmFtaWx5O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgdGl0bGUuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpyZW5kZXJVdGlsXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRpdGxlIHRpdGxlXG4gICAgICogQHBhcmFtIHt7Zm9udFNpemU6IG51bWJlciwgY29sb3I6IHN0cmluZywgYmFja2dyb3VuZDogc3RyaW5nfX0gdGhlbWUgdGl0bGUgdGhlbWVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY2xhc3NOYW1lIGNzcyBjbGFzcyBuYW1lXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSB0aXRsZSBlbGVtZW50XG4gICAgICovXG4gICAgcmVuZGVyVGl0bGU6IGZ1bmN0aW9uKHRpdGxlLCB0aGVtZSwgY2xhc3NOYW1lKSB7XG4gICAgICAgIHZhciBlbFRpdGxlLCBjc3NUZXh0O1xuXG4gICAgICAgIGlmICghdGl0bGUpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgZWxUaXRsZSA9IGRvbS5jcmVhdGUoJ0RJVicsIGNsYXNzTmFtZSk7XG4gICAgICAgIGVsVGl0bGUuaW5uZXJIVE1MID0gdGl0bGU7XG5cbiAgICAgICAgY3NzVGV4dCA9IHJlbmRlclV0aWwubWFrZUZvbnRDc3NUZXh0KHRoZW1lKTtcblxuICAgICAgICBpZiAodGhlbWUuYmFja2dyb3VuZCkge1xuICAgICAgICAgICAgY3NzVGV4dCArPSAnOycgKyB0aGlzLmNvbmNhdFN0cignYmFja2dyb3VuZDonLCB0aGVtZS5iYWNrZ3JvdW5kKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGVsVGl0bGUuc3R5bGUuY3NzVGV4dCA9IGNzc1RleHQ7XG5cbiAgICAgICAgcmV0dXJuIGVsVGl0bGU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgSUU4IG9yIG5vdC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOnJlbmRlclV0aWxcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gcmVzdWx0IGJvb2xlYW5cbiAgICAgKi9cbiAgICBpc0lFODogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBpc0lFODtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlbmRlclV0aWw7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgVGhpcyBpcyB0ZW1wbGF0ZSBtYWtlci5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgLyoqXG4gICAgICogVGhpcyBpcyB0ZW1wbGF0ZSBtYWtlci5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaHRtbCBodG1sXG4gICAgICogQHJldHVybnMge2Z1bmN0aW9ufSB0ZW1wbGF0ZSBmdW5jdGlvblxuICAgICAqIEBlYXhtcGxlXG4gICAgICpcbiAgICAgKiAgIHZhciB0ZW1wbGF0ZSA9IHRlbXBsYXRlTWFrZXIudGVtcGxhdGUoJzxzcGFuPnt7IG5hbWUgfX08L3NwYW4+JyksXG4gICAgICogICAgICAgcmVzdWx0ID0gdGVtcGxhdGUoe25hbWU6ICdKb2huJyk7XG4gICAgICogICBjb25zb2xlLmxvZyhyZXN1bHQpOyAvLyA8c3Bhbj5Kb2huPC9zcGFuPlxuICAgICAqXG4gICAgICovXG4gICAgdGVtcGxhdGU6IGZ1bmN0aW9uIChodG1sKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGh0bWw7XG4gICAgICAgICAgICBuZS51dGlsLmZvckVhY2goZGF0YSwgZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVnRXhwID0gbmV3IFJlZ0V4cCgne3tcXFxccyonICsga2V5ICsgJ1xcXFxzKn19JywgJ2cnKTtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShyZWdFeHAsIHZhbHVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfTtcbiAgICB9XG59O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3ICBMZWdlbmQgY29tcG9uZW50LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4uL2NvbnN0LmpzJyksXG4gICAgZG9tID0gcmVxdWlyZSgnLi4vaGVscGVycy9kb21IYW5kbGVyLmpzJyksXG4gICAgcmVuZGVyVXRpbCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvcmVuZGVyVXRpbC5qcycpLFxuICAgIGRlZmF1bHRUaGVtZSA9IHJlcXVpcmUoJy4uL3RoZW1lcy9kZWZhdWx0VGhlbWUuanMnKSxcbiAgICBsZWdlbmRUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vLi4vbGVnZW5kcy9sZWdlbmRUZW1wbGF0ZS5qcycpO1xuXG52YXIgTEVHRU5EX1JFQ1RfV0lEVEggPSAxMixcbiAgICBMQUJFTF9QQURESU5HX1RPUCA9IDIsXG4gICAgTElORV9NQVJHSU5fVE9QID0gNTtcblxudmFyIExlZ2VuZCA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBMZWdlbmQucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBMZWdlbmQgY29tcG9uZW50LlxuICAgICAqIEBjb25zdHJ1Y3RzIExlZ2VuZFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5sZWdlbmRMYWJlbHMgbGVnZW5kIGxhYmVsc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5ib3VuZCBheGlzIGJvdW5kXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIGF4aXMgdGhlbWVcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgbmUudXRpbC5leHRlbmQodGhpcywgcGFyYW1zKTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIExlZ2VuZCB2aWV3IGNsYXNzTmFtZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jbGFzc05hbWUgPSAnbmUtY2hhcnQtbGVnZW5kLWFyZWEnO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgbGVnZW5kLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBib3VuZCBwbG90IGJvdW5kXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSBsZWdlbmQgZWxlbWVudFxuICAgICAqL1xuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBlbCA9IGRvbS5jcmVhdGUoJ0RJVicsIHRoaXMuY2xhc3NOYW1lKTtcbiAgICAgICAgZWwuaW5uZXJIVE1MID0gdGhpcy5fbWFrZUxlZ2VuZEh0bWwoKTtcbiAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJQb3NpdGlvbihlbCwgdGhpcy5ib3VuZC5wb3NpdGlvbik7XG4gICAgICAgIHRoaXMuX3JlbmRlckxhYmVsVGhlbWUoZWwsIHRoaXMudGhlbWUubGFiZWwpO1xuXG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHRoZW1lIGZvciBsZWdlbmQgbGFiZWxzXG4gICAgICogQHBhcmFtIHthcnJheS48b2JqZWN0Pn0gbGFiZWxzIGxhYmVsc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBsZWdlbmQgdGhlbWVcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPG9iamVjdD59IGxhYmVsc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldFRoZW1lRm9yTGFiZWxzOiBmdW5jdGlvbihsYWJlbHMsIHRoZW1lKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBuZS51dGlsLm1hcChsYWJlbHMsIGZ1bmN0aW9uKGl0ZW0sIGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgaXRlbVRoZW1lID0ge1xuICAgICAgICAgICAgICAgIGNvbG9yOiB0aGVtZS5jb2xvcnNbaW5kZXhdXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpZiAodGhlbWUuc2luZ2xlQ29sb3JzKSB7XG4gICAgICAgICAgICAgICAgaXRlbVRoZW1lLnNpbmdsZUNvbG9yID0gdGhlbWUuc2luZ2xlQ29sb3JzW2luZGV4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGVtZS5ib3JkZXJDb2xvcikge1xuICAgICAgICAgICAgICAgIGl0ZW1UaGVtZS5ib3JkZXJDb2xvciA9IHRoZW1lLmJvcmRlckNvbG9yO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaXRlbS50aGVtZSA9IGl0ZW1UaGVtZTtcbiAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGxlZ2VuZCBsYWJlbHMuXG4gICAgICogQHJldHVybnMge2FycmF5LjxvYmplY3Q+fSBsZWdlbmQgbGFiZWxzLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VMZWdlbmRMYWJlbHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY2hhcnRUeXBlID0gdGhpcy5jaGFydFR5cGUsXG4gICAgICAgICAgICBsZWdlbmRMYWJlbHMgPSB0aGlzLmxlZ2VuZExhYmVscyxcbiAgICAgICAgICAgIGpvaW5MZWdlbmRMYWJlbHMgPSB0aGlzLmpvaW5MZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICBsYWJlbExlbiA9IGxlZ2VuZExhYmVscy5sZW5ndGgsXG4gICAgICAgICAgICB0aGVtZSA9IHRoaXMudGhlbWUsXG4gICAgICAgICAgICBjaGFydExlZ2VuZFRoZW1lID0gbmUudXRpbC5maWx0ZXIodGhlbWUsIGZ1bmN0aW9uKGl0ZW0sIG5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmUudXRpbC5pbkFycmF5KG5hbWUsIGNoYXJ0Q29uc3QuU0VSSUVTX1BST1BTKSA9PT0gLTEgJiYgbmFtZSAhPT0gJ2xhYmVsJztcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgY2hhcnRUeXBlcyA9IG5lLnV0aWwua2V5cyhjaGFydExlZ2VuZFRoZW1lKSxcbiAgICAgICAgICAgIGRlZmF1bHRMZWdlbmRUaGVtZSA9IHtcbiAgICAgICAgICAgICAgICBjb2xvcnM6IGRlZmF1bHRUaGVtZS5zZXJpZXMuY29sb3JzXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2hhcnRUaGVtZSwgcmVzdWx0O1xuXG4gICAgICAgIGlmICghY2hhcnRUeXBlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuX3NldFRoZW1lRm9yTGFiZWxzKGpvaW5MZWdlbmRMYWJlbHMsIHRoZW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNoYXJ0VGhlbWUgPSB0aGVtZVtjaGFydFR5cGVdIHx8IGRlZmF1bHRMZWdlbmRUaGVtZTtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuX3NldFRoZW1lRm9yTGFiZWxzKGpvaW5MZWdlbmRMYWJlbHMuc2xpY2UoMCwgbGFiZWxMZW4pLCBjaGFydFRoZW1lKTtcbiAgICAgICAgICAgIGNoYXJ0VGhlbWUgPSB0aGVtZVtuZS51dGlsLmZpbHRlcihjaGFydFR5cGVzLCBmdW5jdGlvbihwcm9wTmFtZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcm9wTmFtZSAhPT0gY2hhcnRUeXBlO1xuICAgICAgICAgICAgfSlbMF1dIHx8IGRlZmF1bHRMZWdlbmRUaGVtZTtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQodGhpcy5fc2V0VGhlbWVGb3JMYWJlbHMoam9pbkxlZ2VuZExhYmVscy5zbGljZShsYWJlbExlbiksIGNoYXJ0VGhlbWUpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGxlZ2VuZCBodG1sLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGxlZ2VuZCBodG1sXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUxlZ2VuZEh0bWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbGFiZWxzID0gdGhpcy5fbWFrZUxlZ2VuZExhYmVscygpLFxuICAgICAgICAgICAgdGVtcGxhdGUgPSBsZWdlbmRUZW1wbGF0ZS50cGxMZWdlbmQsXG4gICAgICAgICAgICBsYWJlbEhlaWdodCA9IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodChsYWJlbHNbMF0ubGFiZWwsIGxhYmVsc1swXS50aGVtZSkgKyAoTEFCRUxfUEFERElOR19UT1AgKiAyKSxcbiAgICAgICAgICAgIGJhc2VNYXJnaW5Ub3AgPSBwYXJzZUludCgobGFiZWxIZWlnaHQgLSBMRUdFTkRfUkVDVF9XSURUSCkgLyAyLCAxMCkgLSAxLFxuICAgICAgICAgICAgaHRtbCA9IG5lLnV0aWwubWFwKGxhYmVscywgZnVuY3Rpb24obGFiZWwpIHtcbiAgICAgICAgICAgICAgICB2YXIgYm9yZGVyQ3NzVGV4dCA9IGxhYmVsLmJvcmRlckNvbG9yID8gcmVuZGVyVXRpbC5jb25jYXRTdHIoJztib3JkZXI6MXB4IHNvbGlkICcsIGxhYmVsLmJvcmRlckNvbG9yKSA6ICcnLFxuICAgICAgICAgICAgICAgICAgICByZWN0TWFyZ2luLCBtYXJnaW5Ub3AsIGRhdGE7XG4gICAgICAgICAgICAgICAgaWYgKGxhYmVsLmNoYXJ0VHlwZSA9PT0gJ2xpbmUnKSB7XG4gICAgICAgICAgICAgICAgICAgIG1hcmdpblRvcCA9IGJhc2VNYXJnaW5Ub3AgKyBMSU5FX01BUkdJTl9UT1A7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luVG9wID0gYmFzZU1hcmdpblRvcDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVjdE1hcmdpbiA9IHJlbmRlclV0aWwuY29uY2F0U3RyKCc7bWFyZ2luLXRvcDonLCBtYXJnaW5Ub3AsICdweCcpO1xuXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgY3NzVGV4dDogcmVuZGVyVXRpbC5jb25jYXRTdHIoJ2JhY2tncm91bmQtY29sb3I6JywgbGFiZWwudGhlbWUuc2luZ2xlQ29sb3IgfHwgbGFiZWwudGhlbWUuY29sb3IsIGJvcmRlckNzc1RleHQsIHJlY3RNYXJnaW4pLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IGxhYmVsSGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICBjaGFydFR5cGU6IGxhYmVsLmNoYXJ0VHlwZSB8fCAncmVjdCcsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiBsYWJlbC5sYWJlbFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRlbXBsYXRlKGRhdGEpO1xuICAgICAgICAgICAgfSwgdGhpcykuam9pbignJyk7XG4gICAgICAgIHJldHVybiBodG1sO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgY3NzIHN0eWxlIG9mIGxhYmVsIGFyZWEuXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgbGFiZWwgYXJlYSBlbGVtZW50XG4gICAgICogQHBhcmFtIHt7Zm9udFNpemU6bnVtYmVyLCBmb250RmFtaWx5OiBzdHJpbmcsIGNvbG9yOiBzdHJpbmd9fSB0aGVtZSBsYWJlbCB0aGVtZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlckxhYmVsVGhlbWU6IGZ1bmN0aW9uKGVsLCB0aGVtZSkge1xuICAgICAgICB2YXIgY3NzVGV4dCA9IHJlbmRlclV0aWwubWFrZUZvbnRDc3NUZXh0KHRoZW1lKTtcbiAgICAgICAgZWwuc3R5bGUuY3NzVGV4dCArPSAnOycgKyBjc3NUZXh0O1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IExlZ2VuZDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBUaGlzIGlzIHRlbXBsYXRlcyBvZiBsZWdlbmQgdmlldy5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbnZhciB0ZW1wbGF0ZU1ha2VyID0gcmVxdWlyZSgnLi4vaGVscGVycy90ZW1wbGF0ZU1ha2VyLmpzJyk7XG5cbnZhciB0YWdzID0ge1xuICAgIEhUTUxfTEVHRU5EOiAnPGRpdiBjbGFzcz1cIm5lLWNoYXJ0LWxlZ2VuZFwiPicgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cIm5lLWNoYXJ0LWxlZ2VuZC1yZWN0IHt7IGNoYXJ0VHlwZSB9fVwiIHN0eWxlPVwie3sgY3NzVGV4dCB9fVwiPjwvZGl2PicgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cIm5lLWNoYXJ0LWxlZ2VuZC1sYWJlbFwiIHN0eWxlPVwiaGVpZ2h0Ont7IGhlaWdodCB9fXB4XCI+e3sgbGFiZWwgfX08L2Rpdj48L2Rpdj4nXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICB0cGxMZWdlbmQ6IHRlbXBsYXRlTWFrZXIudGVtcGxhdGUodGFncy5IVE1MX0xFR0VORClcbn07XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgUGxvdCBjb21wb25lbnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBkb20gPSByZXF1aXJlKCcuLi9oZWxwZXJzL2RvbUhhbmRsZXIuanMnKSxcbiAgICBjYWxjdWxhdG9yID0gcmVxdWlyZSgnLi4vaGVscGVycy9jYWxjdWxhdG9yLmpzJyksXG4gICAgcmVuZGVyVXRpbCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvcmVuZGVyVXRpbC5qcycpLFxuICAgIHBsb3RUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vcGxvdFRlbXBsYXRlLmpzJyk7XG5cbnZhciBQbG90ID0gbmUudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIFBsb3QucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBQbG90IGNvbXBvbmVudC5cbiAgICAgKiBAY29uc3RydWN0cyBQbG90XG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnZUaWNrQ291bnQgdmVydGljYWwgdGljayBjb3VudFxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5oVGlja0NvdW50IGhvcml6b250YWwgdGljayBjb3VudFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5ib3VuZCBheGlzIGJvdW5kXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIGF4aXMgdGhlbWVcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgbmUudXRpbC5leHRlbmQodGhpcywgcGFyYW1zKTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFBsb3QgdmlldyBjbGFzc05hbWVcbiAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2xhc3NOYW1lID0gJ25lLWNoYXJ0LXBsb3QtYXJlYSc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBwbG90LlxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCB0b3A6IG51bWJlciwgcmlnaHQ6IG51bWJlcn19IGJvdW5kIHBsb3QgYXJlYSBib3VuZFxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gcGxvdCBlbGVtZW50XG4gICAgICovXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGVsID0gZG9tLmNyZWF0ZSgnRElWJywgdGhpcy5jbGFzc05hbWUpLFxuICAgICAgICAgICAgYm91bmQgPSB0aGlzLmJvdW5kO1xuICAgICAgICByZW5kZXJVdGlsLnJlbmRlckRpbWVuc2lvbihlbCwgYm91bmQuZGltZW5zaW9uKTtcbiAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJQb3NpdGlvbihlbCwgYm91bmQucG9zaXRpb24pO1xuICAgICAgICB0aGlzLl9yZW5kZXJMaW5lcyhlbCwgYm91bmQuZGltZW5zaW9uKTtcblxuICAgICAgICByZXR1cm4gZWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBwbG90IGxpbmVzLlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGRpbWVuc2lvbiBwbG90IGFyZWEgZGltZW5zaW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyTGluZXM6IGZ1bmN0aW9uKGVsLCBkaW1lbnNpb24pIHtcbiAgICAgICAgdmFyIGhQb3NpdGlvbnMgPSB0aGlzLl9tYWtlSG9yaXpvbnRhbFBpeGVsUG9zaXRpb25zKGRpbWVuc2lvbi53aWR0aCksXG4gICAgICAgICAgICB2UG9zaXRpb25zID0gdGhpcy5fbWFrZVZlcnRpY2FsUGl4ZWxQb3NpdGlvbnMoZGltZW5zaW9uLmhlaWdodCksXG4gICAgICAgICAgICB0aGVtZSA9IHRoaXMudGhlbWUsXG4gICAgICAgICAgICBsaW5lSHRtbCA9ICcnO1xuXG4gICAgICAgIGxpbmVIdG1sICs9IHRoaXMuX21ha2VMaW5lSHRtbCh7XG4gICAgICAgICAgICBwb3NpdGlvbnM6IGhQb3NpdGlvbnMsXG4gICAgICAgICAgICBzaXplOiBkaW1lbnNpb24uaGVpZ2h0LFxuICAgICAgICAgICAgY2xhc3NOYW1lOiAndmVydGljYWwnLFxuICAgICAgICAgICAgcG9zaXRpb25UeXBlOiAnbGVmdCcsXG4gICAgICAgICAgICBzaXplVHlwZTogJ2hlaWdodCcsXG4gICAgICAgICAgICBsaW5lQ29sb3I6IHRoZW1lLmxpbmVDb2xvclxuICAgICAgICB9KTtcbiAgICAgICAgbGluZUh0bWwgKz0gdGhpcy5fbWFrZUxpbmVIdG1sKHtcbiAgICAgICAgICAgIHBvc2l0aW9uczogdlBvc2l0aW9ucyxcbiAgICAgICAgICAgIHNpemU6IGRpbWVuc2lvbi53aWR0aCxcbiAgICAgICAgICAgIGNsYXNzTmFtZTogJ2hvcml6b250YWwnLFxuICAgICAgICAgICAgcG9zaXRpb25UeXBlOiAnYm90dG9tJyxcbiAgICAgICAgICAgIHNpemVUeXBlOiAnd2lkdGgnLFxuICAgICAgICAgICAgbGluZUNvbG9yOiB0aGVtZS5saW5lQ29sb3JcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZWwuaW5uZXJIVE1MID0gbGluZUh0bWw7XG5cbiAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJCYWNrZ3JvdW5kKGVsLCB0aGVtZS5iYWNrZ3JvdW5kKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBodG1sIG9mIHBsb3QgbGluZS5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPG9iamVjdD59IHBhcmFtcy5wb3NpdGlvbnMgcG9zaXRpb25zXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnNpemUgd2lkdGggb3IgaGVpZ2h0XG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLmNsYXNzTmFtZSBsaW5lIGNsYXNzTmFtZVxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5wb3NpdGlvblR5cGUgcG9zaXRpb24gdHlwZSAobGVmdCBvciBib3R0b20pXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLnNpemVUeXBlIHNpemUgdHlwZSAoc2l6ZSBvciBoZWlnaHQpXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLmxpbmVDb2xvciBsaW5lIGNvbG9yXG4gICAgICogQHJldHVybnMge3N0cmluZ30gaHRtbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VMaW5lSHRtbDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciB0ZW1wbGF0ZSA9IHBsb3RUZW1wbGF0ZS50cGxQbG90TGluZSxcbiAgICAgICAgICAgIGxpbmVIdG1sID0gbmUudXRpbC5tYXAocGFyYW1zLnBvc2l0aW9ucywgZnVuY3Rpb24ocG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgY3NzVGV4dHMgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJVdGlsLmNvbmNhdFN0cihwYXJhbXMucG9zaXRpb25UeXBlLCAnOicsIHBvc2l0aW9uLCAncHgnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlclV0aWwuY29uY2F0U3RyKHBhcmFtcy5zaXplVHlwZSwgJzonLCBwYXJhbXMuc2l6ZSwgJ3B4JylcbiAgICAgICAgICAgICAgICAgICAgXSwgZGF0YTtcblxuICAgICAgICAgICAgICAgIGlmIChwYXJhbXMubGluZUNvbG9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGNzc1RleHRzLnB1c2gocmVuZGVyVXRpbC5jb25jYXRTdHIoJ2JhY2tncm91bmQtY29sb3I6JywgcGFyYW1zLmxpbmVDb2xvcikpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGRhdGEgPSB7Y2xhc3NOYW1lOiBwYXJhbXMuY2xhc3NOYW1lLCBjc3NUZXh0OiBjc3NUZXh0cy5qb2luKCc7Jyl9O1xuICAgICAgICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZShkYXRhKTtcbiAgICAgICAgICAgIH0sIHRoaXMpLmpvaW4oJycpO1xuICAgICAgICByZXR1cm4gbGluZUh0bWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgcGl4ZWwgdmFsdWUgb2YgdmVydGljYWwgcG9zaXRpb25zXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodCBwbG90IGhlaWdodFxuICAgICAqIEByZXR1cm5zIHthcnJheS48bnVtYmVyPn0gcG9zaXRpb25zXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVZlcnRpY2FsUGl4ZWxQb3NpdGlvbnM6IGZ1bmN0aW9uKGhlaWdodCkge1xuICAgICAgICB2YXIgcG9zaXRpb25zID0gY2FsY3VsYXRvci5tYWtlVGlja1BpeGVsUG9zaXRpb25zKGhlaWdodCwgdGhpcy52VGlja0NvdW50KTtcbiAgICAgICAgcG9zaXRpb25zLnNoaWZ0KCk7XG4gICAgICAgIHJldHVybiBwb3NpdGlvbnM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgcGl4ZWwgdmFsdWUgb2YgaG9yaXpvbnRhbCBwb3NpdGlvbnMuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoIHBsb3Qgd2lkdGhcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPG51bWJlcj59IHBvc2l0aW9uc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VIb3Jpem9udGFsUGl4ZWxQb3NpdGlvbnM6IGZ1bmN0aW9uKHdpZHRoKSB7XG4gICAgICAgIHZhciBwb3NpdGlvbnMgPSBjYWxjdWxhdG9yLm1ha2VUaWNrUGl4ZWxQb3NpdGlvbnMod2lkdGgsIHRoaXMuaFRpY2tDb3VudCk7XG4gICAgICAgIHBvc2l0aW9ucy5zaGlmdCgpO1xuICAgICAgICByZXR1cm4gcG9zaXRpb25zO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBsb3Q7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgVGhpcyBpcyB0ZW1wbGF0ZXMgb2YgcGxvdCB2aWV3IC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbnZhciB0ZW1wbGF0ZU1ha2VyID0gcmVxdWlyZSgnLi4vaGVscGVycy90ZW1wbGF0ZU1ha2VyLmpzJyk7XG5cbnZhciB0YWdzID0ge1xuICAgIEhUTUxfUExPVF9MSU5FOiAnPGRpdiBjbGFzcz1cIm5lLWNoYXJ0LXBsb3QtbGluZSB7eyBjbGFzc05hbWUgfX1cIiBzdHlsZT1cInt7IGNzc1RleHQgfX1cIj48L2Rpdj4nXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICB0cGxQbG90TGluZTogdGVtcGxhdGVNYWtlci50ZW1wbGF0ZSh0YWdzLkhUTUxfUExPVF9MSU5FKVxufTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBSYXBoYWVsIHJlbmRlciBwbHVnaW4uXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBCYXJDaGFydCA9IHJlcXVpcmUoJy4vcmFwaGFlbEJhckNoYXJ0LmpzJyksXG4gICAgTGluZUNoYXJ0ID0gcmVxdWlyZSgnLi9yYXBoYWVsTGluZUNoYXJ0LmpzJyksXG4gICAgQXJlYUNoYXJ0ID0gcmVxdWlyZSgnLi9yYXBoYWVsQXJlYUNoYXJ0LmpzJyksXG4gICAgUGllQ2hhcnQgPSByZXF1aXJlKCcuL3JhcGhhZWxQaWVDaGFydC5qcycpO1xuXG52YXIgcGx1Z2luTmFtZSA9ICdyYXBoYWVsJyxcbiAgICBwbHVnaW5SYXBoYWVsO1xuXG5wbHVnaW5SYXBoYWVsID0ge1xuICAgIGJhcjogQmFyQ2hhcnQsXG4gICAgY29sdW1uOiBCYXJDaGFydCxcbiAgICBsaW5lOiBMaW5lQ2hhcnQsXG4gICAgYXJlYTogQXJlYUNoYXJ0LFxuICAgIHBpZTogUGllQ2hhcnRcbn07XG5cbm5lLmFwcGxpY2F0aW9uLmNoYXJ0LnJlZ2lzdGVyUGx1Z2luKHBsdWdpbk5hbWUsIHBsdWdpblJhcGhhZWwpO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFJhcGhhZWwgYXJlYSBjaGFydCByZW5kZXJlci5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJhcGhhZWxMaW5lQmFzZSA9IHJlcXVpcmUoJy4vcmFwaGFlbExpbmVUeXBlQmFzZScpLFxuICAgIHJhcGhhZWxSZW5kZXJVdGlsID0gcmVxdWlyZSgnLi9yYXBoYWVsUmVuZGVyVXRpbCcpO1xuXG52YXIgUmFwaGFlbCA9IHdpbmRvdy5SYXBoYWVsLFxuICAgIEFOSU1BVElPTl9USU1FID0gNzAwO1xuXG52YXIgY29uY2F0ID0gQXJyYXkucHJvdG90eXBlLmNvbmNhdDtcblxuLyoqXG4gKiBAY2xhc3NkZXNjIFJhcGhhZWxBcmVhQ2hhcnQgaXMgZ3JhcGggcmVuZGVyZXIgZm9yIGFyZWEgY2hhcnQuXG4gKiBAY2xhc3MgUmFwaGFlbEFyZWFDaGFydFxuICogQGV4dGVuZHMgUmFwaGFlbExpbmVUeXBlQmFzZVxuICovXG52YXIgUmFwaGFlbEFyZWFDaGFydCA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoUmFwaGFlbExpbmVCYXNlLCAvKiogQGxlbmRzIFJhcGhhZWxBcmVhQ2hhcnQucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBSZW5kZXIgZnVuY3Rpb24gb2YgYXJlYSBjaGFydC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciBjb250YWluZXJcbiAgICAgKiBAcGFyYW0ge3tncm91cFBvc2l0aW9uczogYXJyYXkuPGFycmF5PiwgZGltZW5zaW9uOiBvYmplY3QsIHRoZW1lOiBvYmplY3QsIG9wdGlvbnM6IG9iamVjdH19IGRhdGEgcmVuZGVyIGRhdGFcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBpbkNhbGxiYWNrIGluIGNhbGxiYWNrXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gb3V0Q2FsbGJhY2sgb3V0IGNhbGxiYWNrXG4gICAgICogQHJldHVybiB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICovXG4gICAgcmVuZGVyOiBmdW5jdGlvbihwYXBlciwgY29udGFpbmVyLCBkYXRhLCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjaykge1xuICAgICAgICB2YXIgZGltZW5zaW9uID0gZGF0YS5kaW1lbnNpb24sXG4gICAgICAgICAgICBncm91cFBvc2l0aW9ucyA9IGRhdGEuZ3JvdXBQb3NpdGlvbnMsXG4gICAgICAgICAgICB0aGVtZSA9IGRhdGEudGhlbWUsXG4gICAgICAgICAgICBjb2xvcnMgPSB0aGVtZS5jb2xvcnMsXG4gICAgICAgICAgICBvcGFjaXR5ID0gZGF0YS5vcHRpb25zLmhhc0RvdCA/IDEgOiAwLFxuICAgICAgICAgICAgZ3JvdXBQYXRocyA9IHRoaXMuX2dldEFyZWFzUGF0aChncm91cFBvc2l0aW9ucywgZGF0YS56ZXJvVG9wKSxcbiAgICAgICAgICAgIGJvcmRlclN0eWxlID0gdGhpcy5tYWtlQm9yZGVyU3R5bGUodGhlbWUuYm9yZGVyQ29sb3IsIG9wYWNpdHkpLFxuICAgICAgICAgICAgb3V0RG90U3R5bGUgPSB0aGlzLm1ha2VPdXREb3RTdHlsZShvcGFjaXR5LCBib3JkZXJTdHlsZSksXG4gICAgICAgICAgICBncm91cEFyZWFzLCBncm91cERvdHM7XG5cbiAgICAgICAgaWYgKCFwYXBlcikge1xuICAgICAgICAgICAgcGFwZXIgPSBSYXBoYWVsKGNvbnRhaW5lciwgZGltZW5zaW9uLndpZHRoLCBkaW1lbnNpb24uaGVpZ2h0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGdyb3VwQXJlYXMgPSB0aGlzLl9yZW5kZXJBcmVhcyhwYXBlciwgZ3JvdXBQYXRocywgY29sb3JzKTtcbiAgICAgICAgZ3JvdXBEb3RzID0gdGhpcy5yZW5kZXJEb3RzKHBhcGVyLCBncm91cFBvc2l0aW9ucywgY29sb3JzLCBib3JkZXJTdHlsZSk7XG5cbiAgICAgICAgdGhpcy5vdXREb3RTdHlsZSA9IG91dERvdFN0eWxlO1xuICAgICAgICB0aGlzLmdyb3VwUGF0aHMgPSBncm91cFBhdGhzO1xuICAgICAgICB0aGlzLmdyb3VwQXJlYXMgPSBncm91cEFyZWFzO1xuICAgICAgICB0aGlzLmdyb3VwRG90cyA9IGdyb3VwRG90cztcbiAgICAgICAgdGhpcy5kb3RPcGFjaXR5ID0gb3BhY2l0eTtcblxuICAgICAgICB0aGlzLmF0dGFjaEV2ZW50KGdyb3VwRG90cywgZ3JvdXBQb3NpdGlvbnMsIG91dERvdFN0eWxlLCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjayk7XG5cbiAgICAgICAgcmV0dXJuIHBhcGVyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgYXJlYSBncmFwaC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgcGFwZXJcbiAgICAgKiBAcGFyYW0ge3tzdGFydDogc3RyaW5nLCBhZGRTdGFydDogc3RyaW5nfX0gcGF0aCBwYXRoXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbG9yIGNvbG9yXG4gICAgICogQHJldHVybnMge2FycmF5LjxvYmplY3Q+fSByYXBoYWVsIG9iamVjdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlckFyZWE6IGZ1bmN0aW9uKHBhcGVyLCBwYXRoLCBjb2xvcikge1xuICAgICAgICB2YXIgcmVzdWx0ID0gW10sXG4gICAgICAgICAgICBhcmVhID0gcGFwZXIucGF0aChbcGF0aC5zdGFydF0pLFxuICAgICAgICAgICAgZmlsbFN0eWxlID0ge1xuICAgICAgICAgICAgICAgIGZpbGw6IGNvbG9yLFxuICAgICAgICAgICAgICAgIG9wYWNpdHk6IDAuNSxcbiAgICAgICAgICAgICAgICBzdHJva2U6IGNvbG9yLFxuICAgICAgICAgICAgICAgICdzdHJva2Utb3BhY2l0eSc6IDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhZGRBcmVhO1xuXG4gICAgICAgIGFyZWEuYXR0cihmaWxsU3R5bGUpO1xuICAgICAgICByZXN1bHQucHVzaChhcmVhKTtcblxuICAgICAgICBpZiAocGF0aC5hZGRTdGFydCkge1xuICAgICAgICAgICAgYWRkQXJlYSA9IHBhcGVyLnBhdGgoW3BhdGguYWRkU3RhcnRdKTtcbiAgICAgICAgICAgIGFkZEFyZWEuYXR0cihmaWxsU3R5bGUpO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goYWRkQXJlYSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGFyZWEgZ3JhcGhzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciBwYXBlclxuICAgICAqIEBwYXJhbSB7YXJyYXkuPG9iamVjdD59IGdyb3VwUGF0aHMgZ3JvdXAgcGF0aHNcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBjb2xvcnMgY29sb3JzXG4gICAgICogQHJldHVybnMge2FycmF5fSByYXBoYWVsIG9iamVjdHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJBcmVhczogZnVuY3Rpb24ocGFwZXIsIGdyb3VwUGF0aHMsIGNvbG9ycykge1xuICAgICAgICB2YXIgZ3JvdXBBcmVhcyA9IG5lLnV0aWwubWFwKGdyb3VwUGF0aHMsIGZ1bmN0aW9uKHBhdGhzLCBncm91cEluZGV4KSB7XG4gICAgICAgICAgICB2YXIgY29sb3IgPSBjb2xvcnNbZ3JvdXBJbmRleF0gfHwgJ3RyYW5zcGFyZW50JztcbiAgICAgICAgICAgIHJldHVybiBuZS51dGlsLm1hcChwYXRocywgZnVuY3Rpb24ocGF0aCkge1xuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIGFyZWE6IHRoaXMuX3JlbmRlckFyZWEocGFwZXIsIHBhdGguYXJlYSwgY29sb3IpLFxuICAgICAgICAgICAgICAgICAgICBsaW5lOiByYXBoYWVsUmVuZGVyVXRpbC5yZW5kZXJMaW5lKHBhcGVyLCBwYXRoLmxpbmUuc3RhcnQsIGNvbG9yKVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICByZXR1cm4gZ3JvdXBBcmVhcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciBtaW51cyBvciBub3QuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIHZhbHVlXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHJlc3VsdCBib29sZWFuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNNaW51czogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlIDwgMDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciBwbHVzIG9yIG5vdC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgdmFsdWVcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gcmVzdWx0IGJvb2xlYW5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc1BsdXM6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZSA+PSAwO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGhlaWdodC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdG9wIHRvcFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB6ZXJvVG9wIHplcm8gcG9zaXRpb24gdG9wXG4gICAgICogQHJldHVybnMge251bWJlcn0gaGVpZ2h0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUhlaWdodDogZnVuY3Rpb24odG9wLCB6ZXJvVG9wKSB7XG4gICAgICAgIHJldHVybiBNYXRoLmFicyh0b3AgLSB6ZXJvVG9wKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmluZCBtaWRkbGUgbGVmdFxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBmcm9tUG9zIGZyb20gcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gdG9Qb3MgdG8gcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gemVyb1RvcCB6ZXJvIHBvc2l0aW9uIHRvcFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IG1pZGRsZSBsZWZ0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZmluZE1pZGRsZUxlZnQ6IGZ1bmN0aW9uKGZyb21Qb3MsIHRvUG9zLCB6ZXJvVG9wKSB7XG4gICAgICAgIHZhciB0b3BzID0gW3plcm9Ub3AgLSBmcm9tUG9zLnRvcCwgemVyb1RvcCAtIHRvUG9zLnRvcF0sXG4gICAgICAgICAgICBtaWRkbGVMZWZ0LCB3aWR0aCwgZnJvbUhlaWdodCwgdG9IZWlnaHQ7XG5cbiAgICAgICAgaWYgKG5lLnV0aWwuYWxsKHRvcHMsIHRoaXMuX2lzTWludXMpIHx8IG5lLnV0aWwuYWxsKHRvcHMsIHRoaXMuX2lzUGx1cykpIHtcbiAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZyb21IZWlnaHQgPSB0aGlzLl9tYWtlSGVpZ2h0KGZyb21Qb3MudG9wLCB6ZXJvVG9wKTtcbiAgICAgICAgdG9IZWlnaHQgPSB0aGlzLl9tYWtlSGVpZ2h0KHRvUG9zLnRvcCwgemVyb1RvcCk7XG4gICAgICAgIHdpZHRoID0gdG9Qb3MubGVmdCAtIGZyb21Qb3MubGVmdDtcblxuICAgICAgICBtaWRkbGVMZWZ0ID0gZnJvbVBvcy5sZWZ0ICsgKHdpZHRoICogKGZyb21IZWlnaHQgLyAoZnJvbUhlaWdodCArIHRvSGVpZ2h0KSkpO1xuICAgICAgICByZXR1cm4gbWlkZGxlTGVmdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBhcmVhIHBhdGguXG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IGZyb21Qb3MgZnJvbSBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSB0b1BvcyB0byBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB6ZXJvVG9wIHplcm8gcG9zaXRpb24gdG9wXG4gICAgICogQHJldHVybnMge3N0cmluZ30gYXJlYSBwYXRoXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUFyZWFQYXRoOiBmdW5jdGlvbihmcm9tUG9zLCB0b1BvcywgemVyb1RvcCkge1xuICAgICAgICB2YXIgZnJvbVN0YXJ0UG9pbnQgPSBbJ00nLCBmcm9tUG9zLmxlZnQsICcgJywgemVyb1RvcF0sXG4gICAgICAgICAgICBmcm9tRW5kUG9pbnQgPSB6ZXJvVG9wID09PSBmcm9tUG9zLnRvcCA/IFtdIDogWydMJywgZnJvbVBvcy5sZWZ0LCAnICcsIGZyb21Qb3MudG9wXSxcbiAgICAgICAgICAgIHRvU3RhcnRQb2ludCA9IFsnTCcsIHRvUG9zLmxlZnQsICcgJywgdG9Qb3MudG9wXSxcbiAgICAgICAgICAgIHRvRW5kUG9pbnQgPSB6ZXJvVG9wID09PSB0b1Bvcy50b3AgPyBbXSA6IFsnTCcsIHRvUG9zLmxlZnQsICcgJywgemVyb1RvcF07XG4gICAgICAgIHJldHVybiBjb25jYXQuY2FsbChbXSwgZnJvbVN0YXJ0UG9pbnQsIGZyb21FbmRQb2ludCwgdG9TdGFydFBvaW50LCB0b0VuZFBvaW50KS5qb2luKCcnKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBhcmVhIHBhdGhzLlxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBmcm9tUG9zIGZyb20gcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gdG9Qb3MgdG8gcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gemVyb1RvcCB6ZXJvIHBvc2l0aW9uIHRvcFxuICAgICAqIEByZXR1cm5zIHt7XG4gICAgICogICAgICBzdGFydDogc3RyaW5nLFxuICAgICAqICAgICAgZW5kOiBzdHJpbmcsXG4gICAgICogICAgICBhZGRTdGFydDogc3RyaW5nLFxuICAgICAqICAgICAgYWRkRW5kOiBzdHJpbmdcbiAgICAgKiB9fSBhcmVhIHBhdGhzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUFyZWFQYXRoczogZnVuY3Rpb24oZnJvbVBvcywgdG9Qb3MsIHplcm9Ub3ApIHtcbiAgICAgICAgdmFyIG1pZGRsZUxlZnQgPSB0aGlzLl9maW5kTWlkZGxlTGVmdChmcm9tUG9zLCB0b1BvcywgemVyb1RvcCksXG4gICAgICAgICAgICByZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgc3RhcnQ6IHRoaXMuX21ha2VBcmVhUGF0aChmcm9tUG9zLCBmcm9tUG9zLCB6ZXJvVG9wKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1pZGRsZVBvcztcblxuICAgICAgICBpZiAodGhpcy5faXNQbHVzKG1pZGRsZUxlZnQpKSB7XG4gICAgICAgICAgICBtaWRkbGVQb3MgPSB7bGVmdDogbWlkZGxlTGVmdCwgdG9wOiB6ZXJvVG9wfTtcbiAgICAgICAgICAgIHJlc3VsdC5lbmQgPSB0aGlzLl9tYWtlQXJlYVBhdGgoZnJvbVBvcywgbWlkZGxlUG9zLCB6ZXJvVG9wKTtcbiAgICAgICAgICAgIHJlc3VsdC5hZGRTdGFydCA9IHRoaXMuX21ha2VBcmVhUGF0aChtaWRkbGVQb3MsIG1pZGRsZVBvcywgemVyb1RvcCk7XG4gICAgICAgICAgICByZXN1bHQuYWRkRW5kID0gdGhpcy5fbWFrZUFyZWFQYXRoKG1pZGRsZVBvcywgdG9Qb3MsIHplcm9Ub3ApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0LmVuZCA9IHRoaXMuX21ha2VBcmVhUGF0aChmcm9tUG9zLCB0b1BvcywgemVyb1RvcCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgYXJlYSBwYXRoLlxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gZ3JvdXBQb3NpdGlvbnMgcG9zaXRpb25zXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHplcm9Ub3AgemVybyB0b3BcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxzdHJpbmc+Pn0gcGF0aHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRBcmVhc1BhdGg6IGZ1bmN0aW9uKGdyb3VwUG9zaXRpb25zLCB6ZXJvVG9wKSB7XG4gICAgICAgIHZhciBncm91cFBhdGhzID0gbmUudXRpbC5tYXAoZ3JvdXBQb3NpdGlvbnMsIGZ1bmN0aW9uKHBvc2l0aW9ucykge1xuICAgICAgICAgICAgdmFyIGZyb21Qb3MgPSBwb3NpdGlvbnNbMF0sXG4gICAgICAgICAgICAgICAgcmVzdCA9IHBvc2l0aW9ucy5zbGljZSgxKTtcbiAgICAgICAgICAgIHJldHVybiBuZS51dGlsLm1hcChyZXN0LCBmdW5jdGlvbihwb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIGFyZWE6IHRoaXMuX21ha2VBcmVhUGF0aHMoZnJvbVBvcywgcG9zaXRpb24sIHplcm9Ub3ApLFxuICAgICAgICAgICAgICAgICAgICBsaW5lOiB0aGlzLm1ha2VMaW5lUGF0aChmcm9tUG9zLCBwb3NpdGlvbilcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGZyb21Qb3MgPSBwb3NpdGlvbjtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgICByZXR1cm4gZ3JvdXBQYXRocztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQW5pbWF0ZSBhcmVhIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBhcmVhIHJhcGhhZWwgb2JqZWN0XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGFyZWFQYXRoIHBhdGhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdGltZSBwbGF5IHRpbWVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3RhcnRUaW1lIHN0YXJ0IHRpbWVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hbmltYXRlQXJlYTogZnVuY3Rpb24oYXJlYSwgYXJlYVBhdGgsIHRpbWUsIHN0YXJ0VGltZSkge1xuICAgICAgICB2YXIgYXJlYUFkZEVuZFBhdGggPSBhcmVhUGF0aC5hZGRFbmQsXG4gICAgICAgICAgICBhcmVhRW5kUGF0aCA9IGFyZWFQYXRoLmVuZDtcbiAgICAgICAgaWYgKGFyZWFBZGRFbmRQYXRoKSB7XG4gICAgICAgICAgICB0aW1lID0gdGltZSAvIDI7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGFyZWFbMV0uYW5pbWF0ZSh7cGF0aDogYXJlYUFkZEVuZFBhdGgsICdzdHJva2Utb3BhY2l0eSc6IDAuMjV9LCB0aW1lKTtcbiAgICAgICAgICAgIH0sIHN0YXJ0VGltZSArIHRpbWUpO1xuICAgICAgICB9XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBhcmVhWzBdLmFuaW1hdGUoe3BhdGg6IGFyZWFFbmRQYXRoLCAnc3Ryb2tlLW9wYWNpdHknOiAwLjI1fSwgdGltZSk7XG4gICAgICAgIH0sIHN0YXJ0VGltZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFuaW1hdGUuXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgY2FsbGJhY2tcbiAgICAgKi9cbiAgICBhbmltYXRlOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICB2YXIgZ3JvdXBBcmVhcyA9IHRoaXMuZ3JvdXBBcmVhcyxcbiAgICAgICAgICAgIGdyb3VwUGF0aHMgPSB0aGlzLmdyb3VwUGF0aHMsXG4gICAgICAgICAgICBvcGFjaXR5ID0gdGhpcy5kb3RPcGFjaXR5LFxuICAgICAgICAgICAgdGltZSA9IEFOSU1BVElPTl9USU1FIC8gZ3JvdXBBcmVhc1swXS5sZW5ndGgsXG4gICAgICAgICAgICBzdGFydFRpbWU7XG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KHRoaXMuZ3JvdXBEb3RzLCBmdW5jdGlvbihkb3RzLCBncm91cEluZGV4KSB7XG4gICAgICAgICAgICBzdGFydFRpbWUgPSAwO1xuICAgICAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkoZG90cywgZnVuY3Rpb24oZG90LCBpbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciBhcmVhLCBhcmVhUGF0aDtcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgYXJlYSA9IGdyb3VwQXJlYXNbZ3JvdXBJbmRleF1baW5kZXggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgYXJlYVBhdGggPSBncm91cFBhdGhzW2dyb3VwSW5kZXhdW2luZGV4IC0gMV07XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYW5pbWF0ZUxpbmUoYXJlYS5saW5lLCBhcmVhUGF0aC5saW5lLmVuZCwgdGltZSwgc3RhcnRUaW1lKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYW5pbWF0ZUFyZWEoYXJlYS5hcmVhLCBhcmVhUGF0aC5hcmVhLCB0aW1lLCBzdGFydFRpbWUpO1xuICAgICAgICAgICAgICAgICAgICBzdGFydFRpbWUgKz0gdGltZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAob3BhY2l0eSkge1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZG90LmF0dHIoeydmaWxsLW9wYWNpdHknOiBvcGFjaXR5fSk7XG4gICAgICAgICAgICAgICAgICAgIH0sIHN0YXJ0VGltZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgc2V0VGltZW91dChjYWxsYmFjaywgc3RhcnRUaW1lKTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhcGhhZWxBcmVhQ2hhcnQ7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgUmFwaGFlbCBiYXIgY2hhcnQgcmVuZGVyZXIuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSYXBoYWVsID0gd2luZG93LlJhcGhhZWw7XG5cbnZhciBBTklNQVRJT05fVElNRSA9IDcwMDtcblxuLyoqXG4gKiBAY2xhc3NkZXNjIFJhcGhhZWxCYXJDaGFydCBpcyBncmFwaCByZW5kZXJlciBmb3IgYmFyLCBjb2x1bW4gY2hhcnQuXG4gKiBAY2xhc3MgUmFwaGFlbEJhckNoYXJ0XG4gKi9cbnZhciBSYXBoYWVsQmFyQ2hhcnQgPSBuZS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgUmFwaGFlbEJhckNoYXJ0LnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogUmVuZGVyIGZ1bmN0aW9uIG9mIGJhciBjaGFydFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNvbnRhaW5lciBlbGVtZW50XG4gICAgICogQHBhcmFtIHt7c2l6ZTogb2JqZWN0LCBtb2RlbDogb2JqZWN0LCBvcHRpb25zOiBvYmplY3QsIHRvb2x0aXBQb3NpdGlvbjogc3RyaW5nfX0gZGF0YSBjaGFydCBkYXRhXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gaW5DYWxsYmFjayBtb3VzZW92ZXIgY2FsbGJhY2tcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvdXRDYWxsYmFjayBtb3VzZW91dCBjYWxsYmFja1xuICAgICAqIEByZXR1cm4ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqL1xuICAgIHJlbmRlcjogZnVuY3Rpb24ocGFwZXIsIGNvbnRhaW5lciwgZGF0YSwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGdyb3VwQm91bmRzID0gZGF0YS5ncm91cEJvdW5kcyxcbiAgICAgICAgICAgIGRpbWVuc2lvbiA9IGRhdGEuZGltZW5zaW9uO1xuXG4gICAgICAgIGlmICghZ3JvdXBCb3VuZHMpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFwYXBlcikge1xuICAgICAgICAgICAgcGFwZXIgPSBSYXBoYWVsKGNvbnRhaW5lciwgZGltZW5zaW9uLndpZHRoLCBkaW1lbnNpb24uaGVpZ2h0KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9yZW5kZXJCYXJzKHBhcGVyLCBkYXRhLnRoZW1lLCBncm91cEJvdW5kcywgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spO1xuXG4gICAgICAgIHJldHVybiBwYXBlcjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGJhcnMuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKiBAcGFyYW0ge3tjb2xvcnM6IHN0cmluZ1tdLCBzaW5nbGVDb2xvcnM6IHN0cmluZ1tdLCBib3JkZXJDb2xvcjogc3RyaW5nfX0gdGhlbWUgYmFyIGNoYXJ0IHRoZW1lXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXkuPHtsZWZ0OiBudW1iZXIsIHRvcDpudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfT4+fSBncm91cEJvdW5kcyBib3VuZHNcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBpbkNhbGxiYWNrIGluIGNhbGxiYWNrXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gb3V0Q2FsbGJhY2sgb3V0IGNhbGxiYWNrXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyQmFyczogZnVuY3Rpb24ocGFwZXIsIHRoZW1lLCBncm91cEJvdW5kcywgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHNpbmdsZUNvbG9ycyA9IChncm91cEJvdW5kc1swXS5sZW5ndGggPT09IDEpICYmIHRoZW1lLnNpbmdsZUNvbG9ycyB8fCBbXSxcbiAgICAgICAgICAgIGNvbG9ycyA9IHRoZW1lLmNvbG9ycyxcbiAgICAgICAgICAgIGJvcmRlckNvbG9yID0gdGhlbWUuYm9yZGVyQ29sb3IgfHwgJ25vbmUnLFxuICAgICAgICAgICAgYmFycyA9IFtdO1xuICAgICAgICBuZS51dGlsLmZvckVhY2hBcnJheShncm91cEJvdW5kcywgZnVuY3Rpb24oYm91bmRzLCBncm91cEluZGV4KSB7XG4gICAgICAgICAgICB2YXIgc2luZ2xlQ29sb3IgPSBzaW5nbGVDb2xvcnNbZ3JvdXBJbmRleF0sXG4gICAgICAgICAgICAgICAgY29sb3IsIGlkLCByZWN0O1xuICAgICAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkoYm91bmRzLCBmdW5jdGlvbihib3VuZCwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWJvdW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb2xvciA9IHNpbmdsZUNvbG9yIHx8IGNvbG9yc1tpbmRleF07XG4gICAgICAgICAgICAgICAgaWQgPSBncm91cEluZGV4ICsgJy0nICsgaW5kZXg7XG4gICAgICAgICAgICAgICAgcmVjdCA9IHRoaXMuX3JlbmRlckJhcihwYXBlciwgY29sb3IsIGJvcmRlckNvbG9yLCBib3VuZC5zdGFydCk7XG5cbiAgICAgICAgICAgICAgICBpZiAocmVjdCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9iaW5kSG92ZXJFdmVudChyZWN0LCBib3VuZC5lbmQsIGlkLCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgYmFycy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgcmVjdDogcmVjdCxcbiAgICAgICAgICAgICAgICAgICAgYm91bmQ6IGJvdW5kLmVuZFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIHRoaXMuYmFycyA9IGJhcnM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciByZWN0XG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29sb3Igc2VyaWVzIGNvbG9yXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGJvcmRlckNvbG9yIHNlcmllcyBib3JkZXJDb2xvclxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gYm91bmQgYm91bmRcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBiYXIgcmVjdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlckJhcjogZnVuY3Rpb24ocGFwZXIsIGNvbG9yLCBib3JkZXJDb2xvciwgYm91bmQpIHtcbiAgICAgICAgdmFyIHJlY3Q7XG4gICAgICAgIGlmIChib3VuZC53aWR0aCA8IDAgfHwgYm91bmQuaGVpZ2h0IDwgMCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmVjdCA9IHBhcGVyLnJlY3QoYm91bmQubGVmdCwgYm91bmQudG9wLCBib3VuZC53aWR0aCwgYm91bmQuaGVpZ2h0KTtcbiAgICAgICAgcmVjdC5hdHRyKHtcbiAgICAgICAgICAgIGZpbGw6IGNvbG9yLFxuICAgICAgICAgICAgc3Ryb2tlOiBib3JkZXJDb2xvclxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gcmVjdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQmluZCBob3ZlciBldmVudC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcmVjdCByYXBoYWVsIHJlY3RcbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGJvdW5kIGJvdW5kXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGlkIHRvb2x0aXAgaWRcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBpbkNhbGxiYWNrIGluIGNhbGxiYWNrXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gb3V0Q2FsbGJhY2sgb3V0IGNhbGxiYWNrXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYmluZEhvdmVyRXZlbnQ6IGZ1bmN0aW9uKHJlY3QsIGJvdW5kLCBpZCwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spIHtcbiAgICAgICAgcmVjdC5ob3ZlcihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGluQ2FsbGJhY2soYm91bmQsIGlkKTtcbiAgICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBvdXRDYWxsYmFjayhpZCk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBbmltYXRlLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIGNhbGxiYWNrXG4gICAgICovXG4gICAgYW5pbWF0ZTogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgbmUudXRpbC5mb3JFYWNoKHRoaXMuYmFycywgZnVuY3Rpb24oYmFyKSB7XG4gICAgICAgICAgICB2YXIgYm91bmQgPSBiYXIuYm91bmQ7XG4gICAgICAgICAgICBiYXIucmVjdC5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICB4OiBib3VuZC5sZWZ0LFxuICAgICAgICAgICAgICAgIHk6IGJvdW5kLnRvcCxcbiAgICAgICAgICAgICAgICB3aWR0aDogYm91bmQud2lkdGgsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBib3VuZC5oZWlnaHRcbiAgICAgICAgICAgIH0sIEFOSU1BVElPTl9USU1FKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGNhbGxiYWNrLCBBTklNQVRJT05fVElNRSk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSYXBoYWVsQmFyQ2hhcnQ7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgUmFwaGFlbCBsaW5lIGNoYXJ0IHJlbmRlcmVyLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmFwaGFlbExpbmVCYXNlID0gcmVxdWlyZSgnLi9yYXBoYWVsTGluZVR5cGVCYXNlJyksXG4gICAgcmFwaGFlbFJlbmRlclV0aWwgPSByZXF1aXJlKCcuL3JhcGhhZWxSZW5kZXJVdGlsJyk7XG5cbnZhciBSYXBoYWVsID0gd2luZG93LlJhcGhhZWwsXG4gICAgQU5JTUFUSU9OX1RJTUUgPSA3MDA7XG5cbi8qKlxuICogQGNsYXNzZGVzYyBSYXBoYWVsTGluZUNoYXJ0cyBpcyBncmFwaCByZW5kZXJlciBmb3IgbGluZSBjaGFydC5cbiAqIEBjbGFzcyBSYXBoYWVsTGluZUNoYXJ0XG4gKiBAZXh0ZW5kcyBSYXBoYWVsTGluZVR5cGVCYXNlXG4gKi9cbnZhciBSYXBoYWVsTGluZUNoYXJ0ID0gbmUudXRpbC5kZWZpbmVDbGFzcyhSYXBoYWVsTGluZUJhc2UsIC8qKiBAbGVuZHMgUmFwaGFlbExpbmVDaGFydC5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIFJlbmRlciBmdW5jdGlvbiBvZiBsaW5lIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNvbnRhaW5lclxuICAgICAqIEBwYXJhbSB7e2dyb3VwUG9zaXRpb25zOiBhcnJheS48YXJyYXk+LCBkaW1lbnNpb246IG9iamVjdCwgdGhlbWU6IG9iamVjdCwgb3B0aW9uczogb2JqZWN0fX0gZGF0YSByZW5kZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGluQ2FsbGJhY2sgaW4gY2FsbGJhY2tcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvdXRDYWxsYmFjayBvdXQgY2FsbGJhY2tcbiAgICAgKiBAcmV0dXJuIHtvYmplY3R9IHBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKi9cbiAgICByZW5kZXI6IGZ1bmN0aW9uKHBhcGVyLCBjb250YWluZXIsIGRhdGEsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKSB7XG4gICAgICAgIHZhciBkaW1lbnNpb24gPSBkYXRhLmRpbWVuc2lvbixcbiAgICAgICAgICAgIGdyb3VwUG9zaXRpb25zID0gZGF0YS5ncm91cFBvc2l0aW9ucyxcbiAgICAgICAgICAgIHRoZW1lID0gZGF0YS50aGVtZSxcbiAgICAgICAgICAgIGNvbG9ycyA9IHRoZW1lLmNvbG9ycyxcbiAgICAgICAgICAgIG9wYWNpdHkgPSBkYXRhLm9wdGlvbnMuaGFzRG90ID8gMSA6IDAsXG4gICAgICAgICAgICBncm91cFBhdGhzID0gdGhpcy5fZ2V0TGluZXNQYXRoKGdyb3VwUG9zaXRpb25zKSxcbiAgICAgICAgICAgIGJvcmRlclN0eWxlID0gdGhpcy5tYWtlQm9yZGVyU3R5bGUodGhlbWUuYm9yZGVyQ29sb3IsIG9wYWNpdHkpLFxuICAgICAgICAgICAgb3V0RG90U3R5bGUgPSB0aGlzLm1ha2VPdXREb3RTdHlsZShvcGFjaXR5LCBib3JkZXJTdHlsZSksXG4gICAgICAgICAgICBncm91cExpbmVzLCBncm91cERvdHM7XG5cbiAgICAgICAgaWYgKCFwYXBlcikge1xuICAgICAgICAgICAgcGFwZXIgPSBSYXBoYWVsKGNvbnRhaW5lciwgZGltZW5zaW9uLndpZHRoLCBkaW1lbnNpb24uaGVpZ2h0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGdyb3VwTGluZXMgPSB0aGlzLl9yZW5kZXJMaW5lcyhwYXBlciwgZ3JvdXBQYXRocywgY29sb3JzKTtcbiAgICAgICAgZ3JvdXBEb3RzID0gdGhpcy5yZW5kZXJEb3RzKHBhcGVyLCBncm91cFBvc2l0aW9ucywgY29sb3JzLCBib3JkZXJTdHlsZSk7XG5cbiAgICAgICAgdGhpcy5vdXREb3RTdHlsZSA9IG91dERvdFN0eWxlO1xuICAgICAgICB0aGlzLmdyb3VwUGF0aHMgPSBncm91cFBhdGhzO1xuICAgICAgICB0aGlzLmdyb3VwTGluZXMgPSBncm91cExpbmVzO1xuICAgICAgICB0aGlzLmdyb3VwRG90cyA9IGdyb3VwRG90cztcbiAgICAgICAgdGhpcy5kb3RPcGFjaXR5ID0gb3BhY2l0eTtcblxuICAgICAgICB0aGlzLmF0dGFjaEV2ZW50KGdyb3VwRG90cywgZ3JvdXBQb3NpdGlvbnMsIG91dERvdFN0eWxlLCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjayk7XG5cbiAgICAgICAgcmV0dXJuIHBhcGVyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgbGluZXMgcGF0aC5cbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheS48b2JqZWN0Pj59IGdyb3VwUG9zaXRpb25zIHBvc2l0aW9uc1xuICAgICAqIEByZXR1cm5zIHthcnJheS48YXJyYXkuPHN0cmluZz4+fSBwYXRoc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldExpbmVzUGF0aDogZnVuY3Rpb24oZ3JvdXBQb3NpdGlvbnMpIHtcbiAgICAgICAgdmFyIGdyb3VwUGF0aHMgPSBuZS51dGlsLm1hcChncm91cFBvc2l0aW9ucywgZnVuY3Rpb24ocG9zaXRpb25zKSB7XG4gICAgICAgICAgICB2YXIgZnJvbVBvcyA9IHBvc2l0aW9uc1swXSxcbiAgICAgICAgICAgICAgICByZXN0ID0gcG9zaXRpb25zLnNsaWNlKDEpO1xuICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwubWFwKHJlc3QsIGZ1bmN0aW9uKHBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHRoaXMubWFrZUxpbmVQYXRoKGZyb21Qb3MsIHBvc2l0aW9uKTtcbiAgICAgICAgICAgICAgICBmcm9tUG9zID0gcG9zaXRpb247XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIGdyb3VwUGF0aHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBsaW5lcy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5LjxzdHJpbmc+Pn0gZ3JvdXBQYXRocyBwYXRoc1xuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IGNvbG9ycyBsaW5lIGNvbG9yc1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdHJva2VXaWR0aCBzdHJva2Ugd2lkdGhcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gbGluZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJMaW5lczogZnVuY3Rpb24ocGFwZXIsIGdyb3VwUGF0aHMsIGNvbG9ycywgc3Ryb2tlV2lkdGgpIHtcbiAgICAgICAgdmFyIGdyb3VwTGluZXMgPSBuZS51dGlsLm1hcChncm91cFBhdGhzLCBmdW5jdGlvbihwYXRocywgZ3JvdXBJbmRleCkge1xuICAgICAgICAgICAgdmFyIGNvbG9yID0gY29sb3JzW2dyb3VwSW5kZXhdIHx8ICd0cmFuc3BhcmVudCc7XG4gICAgICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAocGF0aHMsIGZ1bmN0aW9uKHBhdGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmFwaGFlbFJlbmRlclV0aWwucmVuZGVyTGluZShwYXBlciwgcGF0aC5zdGFydCwgY29sb3IsIHN0cm9rZVdpZHRoKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICByZXR1cm4gZ3JvdXBMaW5lcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQW5pbWF0ZS5cbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayBjYWxsYmFja1xuICAgICAqL1xuICAgIGFuaW1hdGU6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBncm91cExpbmVzID0gdGhpcy5ncm91cExpbmVzLFxuICAgICAgICAgICAgZ3JvdXBQYXRocyA9IHRoaXMuZ3JvdXBQYXRocyxcbiAgICAgICAgICAgIG9wYWNpdHkgPSB0aGlzLmRvdE9wYWNpdHksXG4gICAgICAgICAgICB0aW1lID0gQU5JTUFUSU9OX1RJTUUgLyBncm91cExpbmVzWzBdLmxlbmd0aCxcbiAgICAgICAgICAgIHN0YXJ0VGltZTtcbiAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkodGhpcy5ncm91cERvdHMsIGZ1bmN0aW9uKGRvdHMsIGdyb3VwSW5kZXgpIHtcbiAgICAgICAgICAgIHN0YXJ0VGltZSA9IDA7XG4gICAgICAgICAgICBuZS51dGlsLmZvckVhY2hBcnJheShkb3RzLCBmdW5jdGlvbihkb3QsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdmFyIGxpbmUsIHBhdGg7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIGxpbmUgPSBncm91cExpbmVzW2dyb3VwSW5kZXhdW2luZGV4IC0gMV07XG4gICAgICAgICAgICAgICAgICAgIHBhdGggPSBncm91cFBhdGhzW2dyb3VwSW5kZXhdW2luZGV4IC0gMV0uZW5kO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFuaW1hdGVMaW5lKGxpbmUsIHBhdGgsIHRpbWUsIHN0YXJ0VGltZSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0VGltZSArPSB0aW1lO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChvcGFjaXR5KSB7XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb3QuYXR0cih7J2ZpbGwtb3BhY2l0eSc6IG9wYWNpdHl9KTtcbiAgICAgICAgICAgICAgICAgICAgfSwgc3RhcnRUaW1lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGNhbGxiYWNrLCBzdGFydFRpbWUpO1xuICAgICAgICB9XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmFwaGFlbExpbmVDaGFydDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBSYXBoYWVsTGluZVR5cGVCYXNlIGlzIGJhc2UgY2xhc3MgZm9yIGxpbmUgdHlwZSByZW5kZXJlci5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHJhcGhhZWxSZW5kZXJVdGlsID0gcmVxdWlyZSgnLi9yYXBoYWVsUmVuZGVyVXRpbCcpO1xuXG52YXIgREVGQVVMVF9ET1RfV0lEVEggPSA0LFxuICAgIEhPVkVSX0RPVF9XSURUSCA9IDU7XG5cbi8qKlxuICogQGNsYXNzZGVzYyBSYXBoYWVsTGluZVR5cGVCYXNlIGlzIGJhc2UgZm9yIGxpbmUgdHlwZSByZW5kZXJlci5cbiAqIEBjbGFzcyBSYXBoYWVsTGluZVR5cGVCYXNlXG4gKi9cbnZhciBSYXBoYWVsTGluZVR5cGVCYXNlID0gbmUudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIFJhcGhhZWxMaW5lVHlwZUJhc2UucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGxpbmUgcGF0aHMuXG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IGZyb21Qb3MgZnJvbSBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSB0b1BvcyB0byBwb3NpdGlvblxuICAgICAqIEByZXR1cm5zIHt7c3RhcnQ6IHN0cmluZywgZW5kOiBzdHJpbmd9fSBsaW5lIHBhdGhzLlxuICAgICAqL1xuICAgIG1ha2VMaW5lUGF0aDogZnVuY3Rpb24oZnJvbVBvcywgdG9Qb3MpIHtcbiAgICAgICAgdmFyIHN0YXJ0TGluZVBhdGggPSByYXBoYWVsUmVuZGVyVXRpbC5tYWtlTGluZVBhdGgoZnJvbVBvcywgZnJvbVBvcyksXG4gICAgICAgICAgICBlbmRMaW5lUGF0aCA9IHJhcGhhZWxSZW5kZXJVdGlsLm1ha2VMaW5lUGF0aChmcm9tUG9zLCB0b1Bvcyk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdGFydDogc3RhcnRMaW5lUGF0aCxcbiAgICAgICAgICAgIGVuZDogZW5kTGluZVBhdGhcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBib3JkZXIgc3R5bGUuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGJvcmRlckNvbG9yIGJvcmRlciBjb2xvclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBvcGFjaXR5IG9wYWNpdHlcbiAgICAgKiBAcmV0dXJucyB7e3N0cm9rZTogc3RyaW5nLCBzdHJva2Utd2lkdGg6IG51bWJlciwgc3RyaWtlLW9wYWNpdHk6IG51bWJlcn19IGJvcmRlciBzdHlsZVxuICAgICAqL1xuICAgIG1ha2VCb3JkZXJTdHlsZTogZnVuY3Rpb24oYm9yZGVyQ29sb3IsIG9wYWNpdHkpIHtcbiAgICAgICAgdmFyIGJvcmRlclN0eWxlO1xuICAgICAgICBpZiAoYm9yZGVyQ29sb3IpIHtcbiAgICAgICAgICAgIGJvcmRlclN0eWxlID0ge1xuICAgICAgICAgICAgICAgIHN0cm9rZTogYm9yZGVyQ29sb3IsXG4gICAgICAgICAgICAgICAgJ3N0cm9rZS13aWR0aCc6IDEsXG4gICAgICAgICAgICAgICAgJ3N0cm9rZS1vcGFjaXR5Jzogb3BhY2l0eVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYm9yZGVyU3R5bGU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgZG90IHN0eWxlIGZvciBtb3VzZW91dCBldmVudC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gb3BhY2l0eSBvcGFjaXR5XG4gICAgICogQHBhcmFtIHtvYmplY3R9IGJvcmRlclN0eWxlIGJvcmRlciBzdHlsZVxuICAgICAqIEByZXR1cm5zIHt7ZmlsbC1vcGFjaXR5OiBudW1iZXIsIHN0cm9rZS1vcGFjaXR5OiBudW1iZXIsIHI6IG51bWJlcn19IHN0eWxlXG4gICAgICovXG4gICAgbWFrZU91dERvdFN0eWxlOiBmdW5jdGlvbihvcGFjaXR5LCBib3JkZXJTdHlsZSkge1xuICAgICAgICB2YXIgb3V0RG90U3R5bGUgPSB7XG4gICAgICAgICAgICAnZmlsbC1vcGFjaXR5Jzogb3BhY2l0eSxcbiAgICAgICAgICAgICdzdHJva2Utb3BhY2l0eSc6IDAsXG4gICAgICAgICAgICByOiA0XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKGJvcmRlclN0eWxlKSB7XG4gICAgICAgICAgICBuZS51dGlsLmV4dGVuZChvdXREb3RTdHlsZSwgYm9yZGVyU3R5bGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG91dERvdFN0eWxlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgZG90LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGFlclxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBwb3NpdGlvbiBkb3QgcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29sb3IgZG90IGNvbG9yXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG9wYWNpdHkgb3BhY2l0eVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBib3JkZXJTdHlsZSBib3JkZXIgc3R5bGVcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSByYXBoYWVsIGRvdFxuICAgICAqL1xuICAgIHJlbmRlckRvdDogZnVuY3Rpb24ocGFwZXIsIHBvc2l0aW9uLCBjb2xvciwgb3BhY2l0eSwgYm9yZGVyU3R5bGUpIHtcbiAgICAgICAgdmFyIGRvdCA9IHBhcGVyLmNpcmNsZShwb3NpdGlvbi5sZWZ0LCBwb3NpdGlvbi50b3AsIERFRkFVTFRfRE9UX1dJRFRIKSxcbiAgICAgICAgICAgIGRvdFN0eWxlID0ge1xuICAgICAgICAgICAgICAgIGZpbGw6IGNvbG9yLFxuICAgICAgICAgICAgICAgICdmaWxsLW9wYWNpdHknOiAwLFxuICAgICAgICAgICAgICAgICdzdHJva2Utb3BhY2l0eSc6IDBcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgaWYgKGJvcmRlclN0eWxlKSB7XG4gICAgICAgICAgICBuZS51dGlsLmV4dGVuZChkb3RTdHlsZSwgYm9yZGVyU3R5bGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgZG90LmF0dHIoZG90U3R5bGUpO1xuXG4gICAgICAgIHJldHVybiBkb3Q7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBkb3RzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXkuPG9iamVjdD4+fSBncm91cFBvc2l0aW9ucyBwb3NpdGlvbnNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBjb2xvcnMgY29sb3JzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGJvcmRlclN0eWxlIGJvcmRlciBzdHlsZVxuICAgICAqIEByZXR1cm5zIHthcnJheS48b2JqZWN0Pn0gZG90c1xuICAgICAqL1xuICAgIHJlbmRlckRvdHM6IGZ1bmN0aW9uKHBhcGVyLCBncm91cFBvc2l0aW9ucywgY29sb3JzLCBib3JkZXJTdHlsZSkge1xuICAgICAgICB2YXIgZG90cyA9IG5lLnV0aWwubWFwKGdyb3VwUG9zaXRpb25zLCBmdW5jdGlvbihwb3NpdGlvbnMsIGdyb3VwSW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBjb2xvciA9IGNvbG9yc1tncm91cEluZGV4XTtcbiAgICAgICAgICAgIHJldHVybiBuZS51dGlsLm1hcChwb3NpdGlvbnMsIGZ1bmN0aW9uKHBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRvdCA9IHRoaXMucmVuZGVyRG90KHBhcGVyLCBwb3NpdGlvbiwgY29sb3IsIGJvcmRlclN0eWxlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZG90O1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIHJldHVybiBkb3RzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgY2VudGVyIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IGZyb21Qb3MgZnJvbSBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSB0b1BvcyB0byBwb3NpdGlvblxuICAgICAqIEByZXR1cm5zIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IHBvc2l0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0Q2VudGVyOiBmdW5jdGlvbihmcm9tUG9zLCB0b1Bvcykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbGVmdDogKGZyb21Qb3MubGVmdCArIHRvUG9zLmxlZnQpIC8gMixcbiAgICAgICAgICAgIHRvcDogKGZyb21Qb3MudG9wICsgdG9Qb3MudG9wKSAvIDJcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQmluZCBob3ZlciBldmVudC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGFyZ2V0IHJhcGhhZWwgaXRlbVxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBwb3NpdGlvbiBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpZCBpZFxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGluQ2FsbGJhY2sgaW4gY2FsbGJhY2tcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvdXRDYWxsYmFjayBvdXQgY2FsbGJhY2tcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9iaW5kSG92ZXJFdmVudDogZnVuY3Rpb24odGFyZ2V0LCBwb3NpdGlvbiwgaWQsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKSB7XG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgdGFyZ2V0LmhvdmVyKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhhdC5zaG93ZWRJZCA9IGlkO1xuICAgICAgICAgICAgaW5DYWxsYmFjayhwb3NpdGlvbiwgaWQpO1xuICAgICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIG91dENhbGxiYWNrKGlkKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCBldmVudC5cbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheS48b2JqZWN0Pj59IGdyb3VwRG90cyBkb3RzXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXkuPG9iamVjdD4+fSBncm91cFBvc2l0aW9ucyBwb3NpdGlvbnNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3V0RG90U3R5bGUgZG90IHN0eWxlXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gaW5DYWxsYmFjayBpbiBjYWxsYmFja1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG91dENhbGxiYWNrIG91dCBjYWxsYmFja1xuICAgICAqL1xuICAgIGF0dGFjaEV2ZW50OiBmdW5jdGlvbihncm91cERvdHMsIGdyb3VwUG9zaXRpb25zLCBvdXREb3RTdHlsZSwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spIHtcbiAgICAgICAgbmUudXRpbC5mb3JFYWNoKGdyb3VwRG90cywgZnVuY3Rpb24oZG90cywgZ3JvdXBJbmRleCkge1xuICAgICAgICAgICAgbmUudXRpbC5mb3JFYWNoKGRvdHMsIGZ1bmN0aW9uKGRvdCwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgcG9zaXRpb24gPSBncm91cFBvc2l0aW9uc1tncm91cEluZGV4XVtpbmRleF0sXG4gICAgICAgICAgICAgICAgICAgIGlkID0gaW5kZXggKyAnLScgKyBncm91cEluZGV4O1xuICAgICAgICAgICAgICAgIHRoaXMuX2JpbmRIb3ZlckV2ZW50KGRvdCwgcG9zaXRpb24sIGlkLCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjayk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNob3cgYW5pbWF0aW9uLlxuICAgICAqIEBwYXJhbSB7e2dyb3VwSW5kZXg6IG51bWJlciwgaW5kZXg6bnVtYmVyfX0gZGF0YSBzaG93IGluZm9cbiAgICAgKi9cbiAgICBzaG93QW5pbWF0aW9uOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBpbmRleCA9IGRhdGEuZ3JvdXBJbmRleCwgLy8gTGluZSBjaGFydCBoYXMgcGl2b3QgdmFsdWVzLlxuICAgICAgICAgICAgZ3JvdXBJbmRleCA9IGRhdGEuaW5kZXgsXG4gICAgICAgICAgICBkb3QgPSB0aGlzLmdyb3VwRG90c1tncm91cEluZGV4XVtpbmRleF07XG5cbiAgICAgICAgZG90LmF0dHIoe1xuICAgICAgICAgICAgJ2ZpbGwtb3BhY2l0eSc6IDEsXG4gICAgICAgICAgICAnc3Ryb2tlLW9wYWNpdHknOiAwLjMsXG4gICAgICAgICAgICAnc3Ryb2tlLXdpZHRoJzogMyxcbiAgICAgICAgICAgIHI6IEhPVkVSX0RPVF9XSURUSFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSGlkZSBhbmltYXRpb24uXG4gICAgICogQHBhcmFtIHt7Z3JvdXBJbmRleDogbnVtYmVyLCBpbmRleDpudW1iZXJ9fSBkYXRhIGhpZGUgaW5mb1xuICAgICAqL1xuICAgIGhpZGVBbmltYXRpb246IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gZGF0YS5ncm91cEluZGV4LCAvLyBMaW5lIGNoYXJ0IGhhcyBwaXZvdCB2YWx1ZXMuXG4gICAgICAgICAgICBncm91cEluZGV4ID0gZGF0YS5pbmRleCxcbiAgICAgICAgICAgIGRvdCA9IHRoaXMuZ3JvdXBEb3RzW2dyb3VwSW5kZXhdW2luZGV4XTtcblxuICAgICAgICBkb3QuYXR0cih0aGlzLm91dERvdFN0eWxlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQW5pbWF0ZSBsaW5lLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBsaW5lIHJhcGhhZWwgb2JqZWN0XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGxpbmVQYXRoIGxpbmUgcGF0aFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB0aW1lIHBsYXkgdGltZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdGFydFRpbWUgc3RhcnQgdGltZVxuICAgICAqL1xuICAgIGFuaW1hdGVMaW5lOiBmdW5jdGlvbihsaW5lLCBsaW5lUGF0aCwgdGltZSwgc3RhcnRUaW1lKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBsaW5lLmFuaW1hdGUoe3BhdGg6IGxpbmVQYXRofSwgdGltZSk7XG4gICAgICAgIH0sIHN0YXJ0VGltZSk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmFwaGFlbExpbmVUeXBlQmFzZTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBSYXBoYWVsUGllQ2hhcnRzIGlzIGdyYXBoIHJlbmRlcmVyIGZvciBwaWUgY2hhcnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciByYXBoYWVsUmVuZGVyVXRpbCA9IHJlcXVpcmUoJy4vcmFwaGFlbFJlbmRlclV0aWwnKTtcblxudmFyIFJhcGhhZWwgPSB3aW5kb3cuUmFwaGFlbCxcbiAgICBBTkdMRV8xODAgPSAxODAsXG4gICAgQU5HTEVfOTAgPSA5MCxcbiAgICBSQUQgPSBNYXRoLlBJIC8gQU5HTEVfMTgwLFxuICAgIEFOSU1BVElPTl9USU1FID0gNTAwLFxuICAgIExPQURJTkdfQU5JTUFUSU9OX1RJTUUgPSA3MDA7XG5cbi8qKlxuICogQGNsYXNzZGVzYyBSYXBoYWVsUGllQ2hhcnRzIGlzIGdyYXBoIHJlbmRlcmVyIGZvciBwaWUgY2hhcnQuXG4gKiBAY2xhc3MgUmFwaGFlbFBpZUNoYXJ0XG4gKi9cbnZhciBSYXBoYWVsUGllQ2hhcnQgPSBuZS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgUmFwaGFlbFBpZUNoYXJ0LnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogUmVuZGVyIGZ1bmN0aW9uIG9mIHBpZSBjaGFydC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciBjb250YWluZXJcbiAgICAgKiBAcGFyYW0ge3tzZWN0b3JzSW5mbzogYXJyYXkuPG9iamVjdD4sIGNpcmNsZUJvdW5kOiB7Y3g6IG51bWJlciwgY3k6IG51bWJlciwgcjogbnVtYmVyfSwgZGltZW5zaW9uOiBvYmplY3QsIHRoZW1lOiBvYmplY3QsIG9wdGlvbnM6IG9iamVjdH19IGRhdGEgcmVuZGVyIGRhdGFcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBpbkNhbGxiYWNrIGluIGNhbGxiYWNrXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gb3V0Q2FsbGJhY2sgb3V0IGNhbGxiYWNrXG4gICAgICogQHJldHVybiB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICovXG4gICAgcmVuZGVyOiBmdW5jdGlvbihwYXBlciwgY29udGFpbmVyLCBkYXRhLCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjaykge1xuICAgICAgICB2YXIgZGltZW5zaW9uID0gZGF0YS5kaW1lbnNpb247XG5cbiAgICAgICAgaWYgKCFwYXBlcikge1xuICAgICAgICAgICAgcGFwZXIgPSBSYXBoYWVsKGNvbnRhaW5lciwgZGltZW5zaW9uLndpZHRoLCBkaW1lbnNpb24uaGVpZ2h0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghcGFwZXIuY3VzdG9tQXR0cmlidXRlcy5zZWN0b3IpIHtcbiAgICAgICAgICAgIHBhcGVyLmN1c3RvbUF0dHJpYnV0ZXMuc2VjdG9yID0gbmUudXRpbC5iaW5kKHRoaXMuX21ha2VTZWN0b3JQYXRoLCB0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY2lyY2xlQm91bmQgPSBkYXRhLmNpcmNsZUJvdW5kO1xuICAgICAgICB0aGlzLl9yZW5kZXJQaWUocGFwZXIsIGRhdGEsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKTtcblxuICAgICAgICByZXR1cm4gcGFwZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2Ugc2VjdG9yIHBhdGguXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGN4IGNlbnRlciB4XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGN5IGNlbnRlciB5XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHIgcmFkaXVzXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHN0YXJ0QW5nbGUgc3RhcnQgYW5nbGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZW5kQW5nbGUgZW5kIGFuZ2VsXG4gICAgICogQHJldHVybnMge3twYXRoOiBhcnJheX19IHNlY3RvciBwYXRoXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVNlY3RvclBhdGg6IGZ1bmN0aW9uKGN4LCBjeSwgciwgc3RhcnRBbmdsZSwgZW5kQW5nbGUpIHtcbiAgICAgICAgdmFyIHgxID0gY3ggKyByICogTWF0aC5jb3MoLShzdGFydEFuZ2xlIC0gQU5HTEVfOTApICogUkFEKSwgLy8g7JuQIO2YuOydmCDsi5zsnpEgeCDsooztkZxcbiAgICAgICAgICAgIHkxID0gY3kgLSByICogTWF0aC5zaW4oLShzdGFydEFuZ2xlIC0gQU5HTEVfOTApICogUkFEKSwgLy8g7JuQIO2YuOydmCDsi5zsnpEgeSDsooztkZxcbiAgICAgICAgICAgIHgyID0gY3ggKyByICogTWF0aC5jb3MoLShlbmRBbmdsZSAtIEFOR0xFXzkwKSAqIFJBRCksLy8g7JuQIO2YuOydmCDsooXro4wgeCDsooztkZxcbiAgICAgICAgICAgIHkyID0gY3kgLSByICogTWF0aC5zaW4oLShlbmRBbmdsZSAtIEFOR0xFXzkwKSAqIFJBRCksIC8vIOybkCDtmLjsnZgg7KKF66OMIHkg7KKM7ZGcXG4gICAgICAgICAgICBsYXJnZUFyY0ZsYWcgPSBlbmRBbmdsZSAtIHN0YXJ0QW5nbGUgPiBBTkdMRV8xODAgPyAxIDogMCxcbiAgICAgICAgICAgIHBhdGggPSBbXCJNXCIsIGN4LCBjeSxcbiAgICAgICAgICAgICAgICBcIkxcIiwgeDIsIHkyLFxuICAgICAgICAgICAgICAgIFwiQVwiLCByLCByLCAwLCBsYXJnZUFyY0ZsYWcsIDAsIHgxLCB5MSxcbiAgICAgICAgICAgICAgICBcIlpcIlxuICAgICAgICAgICAgXTtcbiAgICAgICAgcmV0dXJuIHtwYXRoOiBwYXRofTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIHNlY3RvclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5wYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICogICAgICBAcGFyYW0ge3tjeDogbnVtYmVyLCBjeTogbnVtYmVyLCByOm51bWJlcn19IHBhcmFtcy5jaXJjbGVCb3VuZCBjaXJjbGUgYm91bmRzXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnN0YXJ0QW5nbGUgc3RhcnQgYW5nbGVcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuZW5kQW5nbGUgZW5kIGFuZ2xlXG4gICAgICogICAgICBAcGFyYW0ge3tmaWxsOiBzdHJpbmcsIHN0cm9rZTogc3RyaW5nLCBzdHJpa2Utd2lkdGg6IHN0cmluZ319IHBhcmFtcy5hdHRycyBhdHRyc1xuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHJhcGhhZWwgb2JqZWN0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyU2VjdG9yOiBmdW5jdGlvbiAocGFyYW1zKSB7XG4gICAgICAgIHZhciBjaXJjbGVCb3VuZCA9IHBhcmFtcy5jaXJjbGVCb3VuZCxcbiAgICAgICAgICAgIGFuZ2xlcyA9IHBhcmFtcy5hbmdsZXM7XG4gICAgICAgIHJldHVybiBwYXJhbXMucGFwZXIucGF0aCgpLmF0dHIoe1xuICAgICAgICAgICAgc2VjdG9yOiBbY2lyY2xlQm91bmQuY3gsIGNpcmNsZUJvdW5kLmN5LCBjaXJjbGVCb3VuZC5yLCBhbmdsZXMuc3RhcnRBbmdsZSwgYW5nbGVzLmVuZEFuZ2xlXVxuICAgICAgICB9KS5hdHRyKHBhcmFtcy5hdHRycyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBwaWUgZ3JhcGguXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKiBAcGFyYW0ge3tzZWN0b3JzSW5mbzogYXJyYXkuPG9iamVjdD4sIGNpcmNsZUJvdW5kOiB7Y3g6IG51bWJlciwgY3k6IG51bWJlciwgcjogbnVtYmVyfSwgZGltZW5zaW9uOiBvYmplY3QsIHRoZW1lOiBvYmplY3QsIG9wdGlvbnM6IG9iamVjdH19IGRhdGEgcmVuZGVyIGRhdGFcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBpbkNhbGxiYWNrIGluIGNhbGxiYWNrXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gb3V0Q2FsbGJhY2sgb3V0IGNhbGxiYWNrXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyUGllOiBmdW5jdGlvbihwYXBlciwgZGF0YSwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGNpcmNsZUJvdW5kID0gZGF0YS5jaXJjbGVCb3VuZCxcbiAgICAgICAgICAgIGNvbG9ycyA9IGRhdGEudGhlbWUuY29sb3JzLFxuICAgICAgICAgICAgY2hhcnRCYWNrZ3JvdW5kID0gZGF0YS5jaGFydEJhY2tncm91bmQsXG4gICAgICAgICAgICBzZWN0b3JzID0gW107XG5cbiAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkoZGF0YS5zZWN0b3JzSW5mbywgZnVuY3Rpb24oc2VjdG9ySW5mbywgaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBwZXJjZW50VmFsdWUgPSBzZWN0b3JJbmZvLnBlcmNlbnRWYWx1ZSxcbiAgICAgICAgICAgICAgICBjb2xvciA9IGNvbG9yc1tpbmRleF0sXG4gICAgICAgICAgICAgICAgc2VjdG9yID0gdGhpcy5fcmVuZGVyU2VjdG9yKHtcbiAgICAgICAgICAgICAgICAgICAgcGFwZXI6IHBhcGVyLFxuICAgICAgICAgICAgICAgICAgICBjaXJjbGVCb3VuZDogY2lyY2xlQm91bmQsXG4gICAgICAgICAgICAgICAgICAgIGFuZ2xlczogc2VjdG9ySW5mby5hbmdsZXMuc3RhcnQsXG4gICAgICAgICAgICAgICAgICAgIGF0dHJzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxsOiBjb2xvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cm9rZTogY2hhcnRCYWNrZ3JvdW5kLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3N0cm9rZS13aWR0aCc6IDFcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLl9iaW5kSG92ZXJFdmVudCh7XG4gICAgICAgICAgICAgICAgdGFyZ2V0OiBzZWN0b3IsXG4gICAgICAgICAgICAgICAgcG9zaXRpb246IHNlY3RvckluZm8ucG9wdXBQb3NpdGlvbixcbiAgICAgICAgICAgICAgICBpZDogJzAtJyArIGluZGV4LFxuICAgICAgICAgICAgICAgIGluQ2FsbGJhY2s6IGluQ2FsbGJhY2ssXG4gICAgICAgICAgICAgICAgb3V0Q2FsbGJhY2s6IG91dENhbGxiYWNrXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc2VjdG9ycy5wdXNoKHtcbiAgICAgICAgICAgICAgICBzZWN0b3I6IHNlY3RvcixcbiAgICAgICAgICAgICAgICBhbmdsZXM6IHNlY3RvckluZm8uYW5nbGVzLmVuZCxcbiAgICAgICAgICAgICAgICBwZXJjZW50VmFsdWU6IHBlcmNlbnRWYWx1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIHRoaXMuc2VjdG9ycyA9IHNlY3RvcnM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBsZWdlbmQgbGluZXMuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIHBhcGVyXG4gICAgICogQHBhcmFtIHthcnJheS48b2JqZWN0Pn0gb3V0ZXJQb3NpdGlvbnMgb3V0ZXIgcG9zaXRpb25cbiAgICAgKi9cbiAgICByZW5kZXJMZWdlbmRMaW5lczogZnVuY3Rpb24ocGFwZXIsIG91dGVyUG9zaXRpb25zKSB7XG4gICAgICAgIHZhciBwYXRocyA9IHRoaXMuX21ha2VMaW5lUGF0aHMob3V0ZXJQb3NpdGlvbnMpLFxuICAgICAgICAgICAgbGVnZW5kTGluZXMgPSBuZS51dGlsLm1hcChwYXRocywgZnVuY3Rpb24ocGF0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiByYXBoYWVsUmVuZGVyVXRpbC5yZW5kZXJMaW5lKHBhcGVyLCBwYXRoLCAndHJhbnNwYXJlbnQnLCAxKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB0aGlzLmxlZ2VuZExpbmVzID0gbGVnZW5kTGluZXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgbGluZSBwYXRocy5cbiAgICAgKiBAcGFyYW0ge2FycmF5LjxvYmplY3Q+fSBvdXRlclBvc2l0aW9ucyBvdXRlciBwb3NpdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IGxpbmUgcGF0aHMuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUxpbmVQYXRoczogZnVuY3Rpb24ob3V0ZXJQb3NpdGlvbnMpIHtcbiAgICAgICAgdmFyIHBhdGhzID0gbmUudXRpbC5tYXAob3V0ZXJQb3NpdGlvbnMsIGZ1bmN0aW9uKHBvc2l0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICByYXBoYWVsUmVuZGVyVXRpbC5tYWtlTGluZVBhdGgocG9zaXRpb25zLnN0YXJ0LCBwb3NpdGlvbnMubWlkZGxlKSxcbiAgICAgICAgICAgICAgICByYXBoYWVsUmVuZGVyVXRpbC5tYWtlTGluZVBhdGgocG9zaXRpb25zLm1pZGRsZSwgcG9zaXRpb25zLmVuZClcbiAgICAgICAgICAgIF0uam9pbignJyk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgICByZXR1cm4gcGF0aHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJpbmQgaG92ZXIgZXZlbnQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRhcmdldCByYXBoYWVsIGl0ZW1cbiAgICAgKiAgICAgIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBwYXJhbXMucG9zaXRpb24gcG9zaXRpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMuaWQgaWRcbiAgICAgKiAgICAgIEBwYXJhbSB7ZnVuY3Rpb259IHBhcmFtcy5pbkNhbGxiYWNrIGluIGNhbGxiYWNrXG4gICAgICogICAgICBAcGFyYW0ge2Z1bmN0aW9ufSBwYXJhbXMub3V0Q2FsbGJhY2sgb3V0IGNhbGxiYWNrXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYmluZEhvdmVyRXZlbnQ6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICBwYXJhbXMudGFyZ2V0Lm1vdXNlb3ZlcihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBwYXJhbXMuaW5DYWxsYmFjayhwYXJhbXMucG9zaXRpb24sIHBhcmFtcy5pZCk7XG4gICAgICAgIH0pLm1vdXNlb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHBhcmFtcy5vdXRDYWxsYmFjayhwYXJhbXMuaWQpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2hvdyBhbmltYXRpb24uXG4gICAgICogQHBhcmFtIHt7Z3JvdXBJbmRleDogbnVtYmVyLCBpbmRleDpudW1iZXJ9fSBkYXRhIHNob3cgaW5mb1xuICAgICAqL1xuICAgIHNob3dBbmltYXRpb246IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIHNlY3RvciA9IHRoaXMuc2VjdG9yc1tkYXRhLmluZGV4XS5zZWN0b3IsXG4gICAgICAgICAgICBjeCA9IHRoaXMuY2lyY2xlQm91bmQuY3gsXG4gICAgICAgICAgICBjeSA9IHRoaXMuY2lyY2xlQm91bmQuY3k7XG4gICAgICAgIHNlY3Rvci5hbmltYXRlKHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogXCJzMS4xIDEuMSBcIiArIGN4ICsgXCIgXCIgKyBjeVxuICAgICAgICB9LCBBTklNQVRJT05fVElNRSwgXCJlbGFzdGljXCIpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBIaWRlIGFuaW1hdGlvbi5cbiAgICAgKiBAcGFyYW0ge3tncm91cEluZGV4OiBudW1iZXIsIGluZGV4Om51bWJlcn19IGRhdGEgaGlkZSBpbmZvXG4gICAgICovXG4gICAgaGlkZUFuaW1hdGlvbjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgc2VjdG9yID0gdGhpcy5zZWN0b3JzW2RhdGEuaW5kZXhdLnNlY3RvcjtcbiAgICAgICAgc2VjdG9yLmFuaW1hdGUoe3RyYW5zZm9ybTogXCJcIn0sIEFOSU1BVElPTl9USU1FLCBcImVsYXN0aWNcIik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFuaW1hdGUuXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgY2FsbGJhY2tcbiAgICAgKi9cbiAgICBhbmltYXRlOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICB2YXIgZGVsYXlUaW1lID0gMCxcbiAgICAgICAgICAgIGNpcmNsZUJvdW5kID0gdGhpcy5jaXJjbGVCb3VuZDtcbiAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkodGhpcy5zZWN0b3JzLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICB2YXIgYW5nbGVzID0gaXRlbS5hbmdsZXMsXG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uVGltZSA9IExPQURJTkdfQU5JTUFUSU9OX1RJTUUgKiBpdGVtLnBlcmNlbnRWYWx1ZSxcbiAgICAgICAgICAgICAgICBhbmltID0gUmFwaGFlbC5hbmltYXRpb24oe1xuICAgICAgICAgICAgICAgICAgICBzZWN0b3I6IFtjaXJjbGVCb3VuZC5jeCwgY2lyY2xlQm91bmQuY3ksIGNpcmNsZUJvdW5kLnIsIGFuZ2xlcy5zdGFydEFuZ2xlLCBhbmdsZXMuZW5kQW5nbGVdXG4gICAgICAgICAgICAgICAgfSwgYW5pbWF0aW9uVGltZSk7XG4gICAgICAgICAgICBpdGVtLnNlY3Rvci5hbmltYXRlKGFuaW0uZGVsYXkoZGVsYXlUaW1lKSk7XG4gICAgICAgICAgICBkZWxheVRpbWUgKz0gYW5pbWF0aW9uVGltZTtcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGNhbGxiYWNrLCBkZWxheVRpbWUpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFuaW1hdGUgbGVnZW5kIGxpbmVzLlxuICAgICAqL1xuICAgIGFuaW1hdGVMZWdlbmRMaW5lczogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghdGhpcy5sZWdlbmRMaW5lcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KHRoaXMubGVnZW5kTGluZXMsIGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIGxpbmUuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgJ3N0cm9rZSc6ICdibGFjaycsXG4gICAgICAgICAgICAgICAgJ3N0cm9rZS1vcGFjaXR5JzogMVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhcGhhZWxQaWVDaGFydDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBVdGlsIGZvciByYXBoYWVsIHJlbmRlcmluZy5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBVdGlsIGZvciByYXBoYWVsIHJlbmRlcmluZy5cbiAqIEBtb2R1bGUgcmFwaGFlbFJlbmRlclV0aWxcbiAqL1xudmFyIHJhcGhhZWxSZW5kZXJVdGlsID0ge1xuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgbGluZSBwYXRoLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6cmFwaGFlbFJlbmRlclV0aWxcbiAgICAgKiBAcGFyYW0ge3t0b3A6IG51bWJlciwgbGVmdDogbnVtYmVyfX0gZnJvbVBvcyBmcm9tIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHt7dG9wOiBudW1iZXIsIGxlZnQ6IG51bWJlcn19IHRvUG9zIHRvIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoIHdpZHRoXG4gICAgICogQHJldHVybnMge3N0cmluZ30gcGF0aFxuICAgICAqL1xuICAgIG1ha2VMaW5lUGF0aDogZnVuY3Rpb24oZnJvbVBvcywgdG9Qb3MsIHdpZHRoKSB7XG4gICAgICAgIHZhciBmcm9tUG9pbnQgPSBbZnJvbVBvcy5sZWZ0LCBmcm9tUG9zLnRvcF0sXG4gICAgICAgICAgICB0b1BvaW50ID0gW3RvUG9zLmxlZnQsIHRvUG9zLnRvcF07XG5cbiAgICAgICAgd2lkdGggPSB3aWR0aCB8fCAxO1xuXG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KGZyb21Qb2ludCwgZnVuY3Rpb24oZnJvbSwgaW5kZXgpIHtcbiAgICAgICAgICAgIGlmIChmcm9tID09PSB0b1BvaW50W2luZGV4XSkge1xuICAgICAgICAgICAgICAgIGZyb21Qb2ludFtpbmRleF0gPSB0b1BvaW50W2luZGV4XSA9IE1hdGgucm91bmQoZnJvbSkgLSAod2lkdGggJSAyIC8gMik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gJ00nICsgZnJvbVBvaW50LmpvaW4oJyAnKSArICdMJyArIHRvUG9pbnQuam9pbignICcpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgbGluZS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOnJhcGhhZWxSZW5kZXJVdGlsXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0aCBsaW5lIHBhdGhcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29sb3IgbGluZSBjb2xvclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdHJva2VXaWR0aCBzdHJva2Ugd2lkdGhcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSByYXBoYWVsIGxpbmVcbiAgICAgKi9cbiAgICByZW5kZXJMaW5lOiBmdW5jdGlvbihwYXBlciwgcGF0aCwgY29sb3IsIHN0cm9rZVdpZHRoKSB7XG4gICAgICAgIHZhciBsaW5lID0gcGFwZXIucGF0aChbcGF0aF0pLFxuICAgICAgICAgICAgc3Ryb2tlU3R5bGUgPSB7XG4gICAgICAgICAgICAgICAgc3Ryb2tlOiBjb2xvcixcbiAgICAgICAgICAgICAgICAnc3Ryb2tlLXdpZHRoJzogc3Ryb2tlV2lkdGggfHwgMlxuICAgICAgICAgICAgfTtcblxuICAgICAgICBpZiAoY29sb3IgPT09ICd0cmFuc3BhcmVudCcpIHtcbiAgICAgICAgICAgIHN0cm9rZVN0eWxlLnN0cm9rZSA9ICcjZmZmJztcbiAgICAgICAgICAgIHN0cm9rZVN0eWxlWydzdHJva2Utb3BhY2l0eSddID0gMDtcbiAgICAgICAgfVxuICAgICAgICBsaW5lLmF0dHIoc3Ryb2tlU3R5bGUpO1xuXG4gICAgICAgIHJldHVybiBsaW5lO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gcmFwaGFlbFJlbmRlclV0aWw7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjaGFydENvbnN0ID0gcmVxdWlyZSgnLi9jb25zdC5qcycpLFxuICAgIGNoYXJ0RmFjdG9yeSA9IHJlcXVpcmUoJy4vZmFjdG9yaWVzL2NoYXJ0RmFjdG9yeS5qcycpLFxuICAgIEJhckNoYXJ0ID0gcmVxdWlyZSgnLi9jaGFydHMvYmFyQ2hhcnQuanMnKSxcbiAgICBDb2x1bW5DaGFydCA9IHJlcXVpcmUoJy4vY2hhcnRzL2NvbHVtbkNoYXJ0LmpzJyksXG4gICAgTGluZUNoYXJ0ID0gcmVxdWlyZSgnLi9jaGFydHMvbGluZUNoYXJ0LmpzJyksXG4gICAgQXJlYUNoYXJ0ID0gcmVxdWlyZSgnLi9jaGFydHMvYXJlYUNoYXJ0LmpzJyksXG4gICAgQ29tYm9DaGFydCA9IHJlcXVpcmUoJy4vY2hhcnRzL2NvbWJvQ2hhcnQuanMnKSxcbiAgICBQaWVDaGFydCA9IHJlcXVpcmUoJy4vY2hhcnRzL3BpZUNoYXJ0LmpzJyk7XG5cbmNoYXJ0RmFjdG9yeS5yZWdpc3RlcihjaGFydENvbnN0LkNIQVJUX1RZUEVfQkFSLCBCYXJDaGFydCk7XG5jaGFydEZhY3RvcnkucmVnaXN0ZXIoY2hhcnRDb25zdC5DSEFSVF9UWVBFX0NPTFVNTiwgQ29sdW1uQ2hhcnQpO1xuY2hhcnRGYWN0b3J5LnJlZ2lzdGVyKGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9MSU5FLCBMaW5lQ2hhcnQpO1xuY2hhcnRGYWN0b3J5LnJlZ2lzdGVyKGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9BUkVBLCBBcmVhQ2hhcnQpO1xuY2hhcnRGYWN0b3J5LnJlZ2lzdGVyKGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9DT01CTywgQ29tYm9DaGFydCk7XG5jaGFydEZhY3RvcnkucmVnaXN0ZXIoY2hhcnRDb25zdC5DSEFSVF9UWVBFX1BJRSwgUGllQ2hhcnQpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4vY29uc3QuanMnKSxcbiAgICB0aGVtZUZhY3RvcnkgPSByZXF1aXJlKCcuL2ZhY3Rvcmllcy90aGVtZUZhY3RvcnkuanMnKSxcbiAgICBkZWZhdWx0VGhlbWUgPSByZXF1aXJlKCcuL3RoZW1lcy9kZWZhdWx0VGhlbWUuanMnKTtcblxudGhlbWVGYWN0b3J5LnJlZ2lzdGVyKGNoYXJ0Q29uc3QuREVGQVVMVF9USEVNRV9OQU1FLCBkZWZhdWx0VGhlbWUpO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEFyZWEgY2hhcnQgc2VyaWVzIGNvbXBvbmVudC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFNlcmllcyA9IHJlcXVpcmUoJy4vc2VyaWVzLmpzJyksXG4gICAgTGluZVR5cGVTZXJpZXNCYXNlID0gcmVxdWlyZSgnLi9saW5lVHlwZVNlcmllc0Jhc2UuanMnKTtcblxudmFyIEFyZWFDaGFydFNlcmllcyA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoU2VyaWVzLCAvKiogQGxlbmRzIEFyZWFDaGFydFNlcmllcy5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIEFyZWEgY2hhcnQgc2VyaWVzIGNvbXBvbmVudC5cbiAgICAgKiBAY29uc3RydWN0cyBBcmVhQ2hhcnRTZXJpZXNcbiAgICAgKiBAZXh0ZW5kcyBTZXJpZXNcbiAgICAgKiBAbWl4ZXMgTGluZVR5cGVTZXJpZXNCYXNlXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm1vZGVsIHNlcmllcyBtb2RlbFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5vcHRpb25zIHNlcmllcyBvcHRpb25zXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIHNlcmllcyB0aGVtZVxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBTZXJpZXMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBhZGQgZGF0YS5cbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBhZGQgZGF0YVxuICAgICAqL1xuICAgIG1ha2VBZGREYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGRpbWVuc2lvbiA9IHRoaXMuYm91bmQuZGltZW5zaW9uLFxuICAgICAgICAgICAgc2NhbGVEaXN0YW5jZSA9IHRoaXMuZ2V0U2NhbGVEaXN0YW5jZUZyb21aZXJvUG9pbnQoZGltZW5zaW9uLmhlaWdodCwgdGhpcy5kYXRhLnNjYWxlKSxcbiAgICAgICAgICAgIHplcm9Ub3AgPSBzY2FsZURpc3RhbmNlLnRvTWF4O1xuICAgICAgICBpZiAodGhpcy5kYXRhLnNjYWxlLm1pbiA+PSAwICYmICF6ZXJvVG9wKSB7XG4gICAgICAgICAgICB6ZXJvVG9wID0gZGltZW5zaW9uLmhlaWdodDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBncm91cFBvc2l0aW9uczogdGhpcy5tYWtlUG9zaXRpb25zKGRpbWVuc2lvbiksXG4gICAgICAgICAgICB6ZXJvVG9wOiB6ZXJvVG9wXG4gICAgICAgIH07XG4gICAgfVxufSk7XG5cbkxpbmVUeXBlU2VyaWVzQmFzZS5taXhpbihBcmVhQ2hhcnRTZXJpZXMpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFyZWFDaGFydFNlcmllcztcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBCYXIgY2hhcnQgc2VyaWVzIGNvbXBvbmVudC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFNlcmllcyA9IHJlcXVpcmUoJy4vc2VyaWVzLmpzJyksXG4gICAgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4uL2NvbnN0LmpzJyksXG4gICAgZG9tID0gcmVxdWlyZSgnLi4vaGVscGVycy9kb21IYW5kbGVyLmpzJyksXG4gICAgcmVuZGVyVXRpbCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvcmVuZGVyVXRpbC5qcycpO1xuXG52YXIgQmFyQ2hhcnRTZXJpZXMgPSBuZS51dGlsLmRlZmluZUNsYXNzKFNlcmllcywgLyoqIEBsZW5kcyBCYXJDaGFydFNlcmllcy5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIEJhciBjaGFydCBzZXJpZXMgY29tcG9uZW50LlxuICAgICAqIEBjb25zdHJ1Y3RzIEJhckNoYXJ0U2VyaWVzXG4gICAgICogQGV4dGVuZHMgU2VyaWVzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm1vZGVsIHNlcmllcyBtb2RlbFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5vcHRpb25zIHNlcmllcyBvcHRpb25zXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIHNlcmllcyB0aGVtZVxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBTZXJpZXMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBib3VuZHMgb2YgYmFyIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDpudW1iZXJ9fSBkaW1lbnNpb24gYmFyIGNoYXJ0IGRpbWVuc2lvblxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBoaWRkZW5XaWR0aCBoaWRkZW4gd2lkdGhcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gYm91bmRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUJvdW5kczogZnVuY3Rpb24oZGltZW5zaW9uLCBoaWRkZW5XaWR0aCkge1xuICAgICAgICBoaWRkZW5XaWR0aCA9IGhpZGRlbldpZHRoIHx8IChyZW5kZXJVdGlsLmlzSUU4KCkgPyAwIDogY2hhcnRDb25zdC5ISURERU5fV0lEVEgpO1xuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5zdGFja2VkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbWFrZU5vcm1hbEJhckJvdW5kcyhkaW1lbnNpb24sIGhpZGRlbldpZHRoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9tYWtlU3RhY2tlZEJhckJvdW5kcyhkaW1lbnNpb24sIGhpZGRlbldpZHRoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGFkZCBkYXRhLlxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IGFkZCBkYXRhXG4gICAgICovXG4gICAgbWFrZUFkZERhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZ3JvdXBCb3VuZHMgPSB0aGlzLl9tYWtlQm91bmRzKHRoaXMuYm91bmQuZGltZW5zaW9uKTtcblxuICAgICAgICB0aGlzLmdyb3VwQm91bmRzID0gZ3JvdXBCb3VuZHM7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGdyb3VwQm91bmRzOiBncm91cEJvdW5kc1xuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGJvdW5kcyBvZiBub3JtYWwgYmFyIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDpudW1iZXJ9fSBkaW1lbnNpb24gYmFyIGNoYXJ0IGRpbWVuc2lvblxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBoaWRkZW5XaWR0aCBoaWRkZW4gd2lkdGhcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gYm91bmRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZU5vcm1hbEJhckJvdW5kczogZnVuY3Rpb24oZGltZW5zaW9uLCBoaWRkZW5XaWR0aCkge1xuICAgICAgICB2YXIgZ3JvdXBWYWx1ZXMgPSB0aGlzLnBlcmNlbnRWYWx1ZXMsXG4gICAgICAgICAgICBncm91cEhlaWdodCA9IChkaW1lbnNpb24uaGVpZ2h0IC8gZ3JvdXBWYWx1ZXMubGVuZ3RoKSxcbiAgICAgICAgICAgIGJhckhlaWdodCA9IGdyb3VwSGVpZ2h0IC8gKGdyb3VwVmFsdWVzWzBdLmxlbmd0aCArIDEpLFxuICAgICAgICAgICAgc2NhbGVEaXN0YW5jZSA9IHRoaXMuZ2V0U2NhbGVEaXN0YW5jZUZyb21aZXJvUG9pbnQoZGltZW5zaW9uLndpZHRoLCB0aGlzLmRhdGEuc2NhbGUpLFxuICAgICAgICAgICAgYm91bmRzID0gbmUudXRpbC5tYXAoZ3JvdXBWYWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcywgZ3JvdXBJbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciBwYWRkaW5nVG9wID0gKGdyb3VwSGVpZ2h0ICogZ3JvdXBJbmRleCkgKyAoYmFySGVpZ2h0IC8gMikgKyBoaWRkZW5XaWR0aDtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbiAodmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0b3AgPSBwYWRkaW5nVG9wICsgKGJhckhlaWdodCAqIGluZGV4KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0TGVmdCA9IC1jaGFydENvbnN0LkhJRERFTl9XSURUSCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZExlZnQgPSBzdGFydExlZnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBiYXJXaWR0aCA9IHZhbHVlICogZGltZW5zaW9uLndpZHRoO1xuICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXJXaWR0aCAqPSAtMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0TGVmdCArPSBzY2FsZURpc3RhbmNlLnRvTWluO1xuICAgICAgICAgICAgICAgICAgICAgICAgZW5kTGVmdCArPSBzY2FsZURpc3RhbmNlLnRvTWluIC0gYmFyV2lkdGg7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydExlZnQgKz0gc2NhbGVEaXN0YW5jZS50b01pbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZExlZnQgKz0gc2NhbGVEaXN0YW5jZS50b01pbjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogdG9wLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6IHN0YXJ0TGVmdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IGJhckhlaWdodFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogdG9wLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6IGVuZExlZnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGJhcldpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogYmFySGVpZ2h0XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGJvdW5kcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBib3VuZHMgb2Ygc3RhY2tlZCBiYXIgY2hhcnQuXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0Om51bWJlcn19IGRpbWVuc2lvbiBiYXIgY2hhcnQgZGltZW5zaW9uXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGhpZGRlbldpZHRoIGhpZGRlbiB3aWR0aFxuICAgICAqIEByZXR1cm5zIHthcnJheS48YXJyYXkuPG9iamVjdD4+fSBib3VuZHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlU3RhY2tlZEJhckJvdW5kczogZnVuY3Rpb24oZGltZW5zaW9uLCBoaWRkZW5XaWR0aCkge1xuICAgICAgICB2YXIgZ3JvdXBWYWx1ZXMgPSB0aGlzLnBlcmNlbnRWYWx1ZXMsXG4gICAgICAgICAgICBncm91cEhlaWdodCA9IChkaW1lbnNpb24uaGVpZ2h0IC8gZ3JvdXBWYWx1ZXMubGVuZ3RoKSxcbiAgICAgICAgICAgIGJhckhlaWdodCA9IGdyb3VwSGVpZ2h0IC8gMixcbiAgICAgICAgICAgIGJvdW5kcyA9IG5lLnV0aWwubWFwKGdyb3VwVmFsdWVzLCBmdW5jdGlvbiAodmFsdWVzLCBncm91cEluZGV4KSB7XG4gICAgICAgICAgICAgICAgdmFyIHBhZGRpbmdUb3AgPSAoZ3JvdXBIZWlnaHQgKiBncm91cEluZGV4KSArIChiYXJIZWlnaHQgLyAyKSArIGhpZGRlbldpZHRoLFxuICAgICAgICAgICAgICAgICAgICBsZWZ0ID0gLWNoYXJ0Q29uc3QuSElEREVOX1dJRFRIO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgd2lkdGgsIGJvdW5kO1xuICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB3aWR0aCA9IHZhbHVlICogZGltZW5zaW9uLndpZHRoO1xuICAgICAgICAgICAgICAgICAgICBib3VuZCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiBwYWRkaW5nVG9wLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6IC1jaGFydENvbnN0LkhJRERFTl9XSURUSCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IGJhckhlaWdodFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogcGFkZGluZ1RvcCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiBsZWZ0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IGJhckhlaWdodFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBsZWZ0ID0gbGVmdCArIHdpZHRoO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYm91bmQ7XG4gICAgICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGJvdW5kcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIG5vcm1hbCBzZXJpZXMgbGFiZWwuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge0hUTUxFbGVtZW50fSBwYXJhbXMuY29udGFpbmVyIGNvbnRhaW5lclxuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48YXJyYXk+fSBwYXJhbXMuZ3JvdXBCb3VuZHMgZ3JvdXAgYm91bmRzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IHBhcmFtcy5mb3JtYXR0ZWRWYWx1ZXMgZm9ybWF0dGVkIHZhbHVlc1xuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gc2VyaWVzIGxhYmVsIGFyZWFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJOb3JtYWxTZXJpZXNMYWJlbDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBncm91cEJvdW5kcyA9IHBhcmFtcy5ncm91cEJvdW5kcyxcbiAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlcyA9IHBhcmFtcy5mb3JtYXR0ZWRWYWx1ZXMsXG4gICAgICAgICAgICBsYWJlbEhlaWdodCA9IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodChmb3JtYXR0ZWRWYWx1ZXNbMF1bMF0sIHRoaXMudGhlbWUubGFiZWwpLFxuICAgICAgICAgICAgZWxTZXJpZXNMYWJlbEFyZWEgPSBkb20uY3JlYXRlKCdkaXYnLCAnbmUtY2hhcnQtc2VyaWVzLWxhYmVsLWFyZWEnKSxcbiAgICAgICAgICAgIGh0bWw7XG4gICAgICAgIGh0bWwgPSBuZS51dGlsLm1hcChwYXJhbXMudmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMsIGdyb3VwSW5kZXgpIHtcbiAgICAgICAgICAgIHJldHVybiBuZS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciBib3VuZCA9IGdyb3VwQm91bmRzW2dyb3VwSW5kZXhdW2luZGV4XS5lbmQsXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlID0gZm9ybWF0dGVkVmFsdWVzW2dyb3VwSW5kZXhdW2luZGV4XSxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxXaWR0aCA9IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbFdpZHRoKGZvcm1hdHRlZFZhbHVlLCB0aGlzLnRoZW1lLmxhYmVsKSxcbiAgICAgICAgICAgICAgICAgICAgbGVmdCA9IGJvdW5kLmxlZnQsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsSHRtbDtcblxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGxlZnQgKz0gYm91bmQud2lkdGggKyBjaGFydENvbnN0LlNFUklFU19MQUJFTF9QQURESU5HO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxlZnQgLT0gbGFiZWxXaWR0aCArIGNoYXJ0Q29uc3QuU0VSSUVTX0xBQkVMX1BBRERJTkc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxhYmVsSHRtbCA9IHRoaXMuX21ha2VTZXJpZXNMYWJlbEh0bWwoe1xuICAgICAgICAgICAgICAgICAgICBsZWZ0OiBsZWZ0LFxuICAgICAgICAgICAgICAgICAgICB0b3A6IGJvdW5kLnRvcCArIChib3VuZC5oZWlnaHQgLSBsYWJlbEhlaWdodCArIGNoYXJ0Q29uc3QuVEVYVF9QQURESU5HKSAvIDJcbiAgICAgICAgICAgICAgICB9LCBmb3JtYXR0ZWRWYWx1ZSwgZ3JvdXBJbmRleCwgaW5kZXgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBsYWJlbEh0bWw7XG4gICAgICAgICAgICB9LCB0aGlzKS5qb2luKCcnKTtcbiAgICAgICAgfSwgdGhpcykuam9pbignJyk7XG5cbiAgICAgICAgZWxTZXJpZXNMYWJlbEFyZWEuaW5uZXJIVE1MID0gaHRtbDtcbiAgICAgICAgcGFyYW1zLmNvbnRhaW5lci5hcHBlbmRDaGlsZChlbFNlcmllc0xhYmVsQXJlYSk7XG5cbiAgICAgICAgcmV0dXJuIGVsU2VyaWVzTGFiZWxBcmVhO1xuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBzdGFja2VkIHNlcmllcyBsYWJlbC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHBhcmFtcy5jb250YWluZXIgY29udGFpbmVyXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IHBhcmFtcy5ncm91cEJvdW5kcyBncm91cCBib3VuZHNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gcGFyYW1zLmZvcm1hdHRlZFZhbHVlcyBmb3JtYXR0ZWQgdmFsdWVzXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSBzZXJpZXMgbGFiZWwgYXJlYVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlclN0YWNrZWRTZXJpZXNMYWJlbDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBncm91cEJvdW5kcyA9IHBhcmFtcy5ncm91cEJvdW5kcyxcbiAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlcyA9IHBhcmFtcy5mb3JtYXR0ZWRWYWx1ZXMsXG4gICAgICAgICAgICBmb3JtYXRGdW5jdGlvbnMgPSBwYXJhbXMuZm9ybWF0RnVuY3Rpb25zIHx8IFtdLFxuICAgICAgICAgICAgZWxTZXJpZXNMYWJlbEFyZWEgPSBkb20uY3JlYXRlKCdkaXYnLCAnbmUtY2hhcnQtc2VyaWVzLWxhYmVsLWFyZWEnKSxcbiAgICAgICAgICAgIGh0bWw7XG4gICAgICAgIGh0bWwgPSBuZS51dGlsLm1hcChwYXJhbXMudmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMsIGdyb3VwSW5kZXgpIHtcbiAgICAgICAgICAgIHZhciB0b3RhbCA9IDAsXG4gICAgICAgICAgICAgICAgbGFiZWxIZWlnaHQgPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxIZWlnaHQoZm9ybWF0dGVkVmFsdWVzWzBdWzBdLCB0aGlzLnRoZW1lLmxhYmVsKSxcbiAgICAgICAgICAgICAgICBsYWJlbEh0bWxzLCBsYXN0TGVmdCwgbGFzdFRvcCwgZm5zO1xuICAgICAgICAgICAgbGFiZWxIdG1scyA9IG5lLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdmFyIGJvdW5kLCBmb3JtYXR0ZWRWYWx1ZSwgbGFiZWxXaWR0aCwgbGVmdCwgdG9wLCBsYWJlbEh0bWw7XG5cbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBib3VuZCA9IGdyb3VwQm91bmRzW2dyb3VwSW5kZXhdW2luZGV4XS5lbmQ7XG4gICAgICAgICAgICAgICAgZm9ybWF0dGVkVmFsdWUgPSBmb3JtYXR0ZWRWYWx1ZXNbZ3JvdXBJbmRleF1baW5kZXhdO1xuICAgICAgICAgICAgICAgIGxhYmVsV2lkdGggPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxXaWR0aChmb3JtYXR0ZWRWYWx1ZSwgdGhpcy50aGVtZS5sYWJlbCk7XG4gICAgICAgICAgICAgICAgbGVmdCA9IGJvdW5kLmxlZnQgKyAoYm91bmQud2lkdGggLSBsYWJlbFdpZHRoKSAvIDI7XG4gICAgICAgICAgICAgICAgdG9wID0gYm91bmQudG9wICsgKGJvdW5kLmhlaWdodCAtIGxhYmVsSGVpZ2h0ICsgY2hhcnRDb25zdC5URVhUX1BBRERJTkcpIC8gMjtcbiAgICAgICAgICAgICAgICBsYWJlbEh0bWwgPSB0aGlzLl9tYWtlU2VyaWVzTGFiZWxIdG1sKHtcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogbGVmdCxcbiAgICAgICAgICAgICAgICAgICAgdG9wOiB0b3BcbiAgICAgICAgICAgICAgICB9LCBmb3JtYXR0ZWRWYWx1ZSwgZ3JvdXBJbmRleCwgaW5kZXgpO1xuICAgICAgICAgICAgICAgIGxhc3RMZWZ0ID0gYm91bmQubGVmdCArIGJvdW5kLndpZHRoO1xuICAgICAgICAgICAgICAgIGxhc3RUb3AgPSB0b3A7XG4gICAgICAgICAgICAgICAgdG90YWwgKz0gdmFsdWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxhYmVsSHRtbDtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnN0YWNrZWQgPT09ICdub3JtYWwnKSB7XG4gICAgICAgICAgICAgICAgZm5zID0gW3RvdGFsXS5jb25jYXQoZm9ybWF0RnVuY3Rpb25zKTtcbiAgICAgICAgICAgICAgICB0b3RhbCA9IG5lLnV0aWwucmVkdWNlKGZucywgZnVuY3Rpb24oc3RvcmVkLCBmbikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZm4oc3RvcmVkKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBsYWJlbEh0bWxzLnB1c2godGhpcy5fbWFrZVNlcmllc0xhYmVsSHRtbCh7XG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IGxhc3RMZWZ0ICsgY2hhcnRDb25zdC5TRVJJRVNfTEFCRUxfUEFERElORyxcbiAgICAgICAgICAgICAgICAgICAgdG9wOiBsYXN0VG9wXG4gICAgICAgICAgICAgICAgfSwgdG90YWwsIC0xLCAtMSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGxhYmVsSHRtbHMuam9pbignJyk7XG4gICAgICAgIH0sIHRoaXMpLmpvaW4oJycpO1xuXG4gICAgICAgIGVsU2VyaWVzTGFiZWxBcmVhLmlubmVySFRNTCA9IGh0bWw7XG4gICAgICAgIHBhcmFtcy5jb250YWluZXIuYXBwZW5kQ2hpbGQoZWxTZXJpZXNMYWJlbEFyZWEpO1xuXG4gICAgICAgIHJldHVybiBlbFNlcmllc0xhYmVsQXJlYTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIHNlcmllcyBsYWJlbC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHBhcmFtcy5jb250YWluZXIgY29udGFpbmVyXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IHBhcmFtcy5ncm91cEJvdW5kcyBncm91cCBib3VuZHNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gcGFyYW1zLmZvcm1hdHRlZFZhbHVlcyBmb3JtYXR0ZWQgdmFsdWVzXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSBzZXJpZXMgbGFiZWwgYXJlYVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlclNlcmllc0xhYmVsOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGVsU2VyaWVzTGFiZWxBcmVhO1xuXG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLnNob3dMYWJlbCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnN0YWNrZWQpIHtcbiAgICAgICAgICAgIGVsU2VyaWVzTGFiZWxBcmVhID0gdGhpcy5fcmVuZGVyU3RhY2tlZFNlcmllc0xhYmVsKHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbFNlcmllc0xhYmVsQXJlYSA9IHRoaXMuX3JlbmRlck5vcm1hbFNlcmllc0xhYmVsKHBhcmFtcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVsU2VyaWVzTGFiZWxBcmVhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgYm91bmQuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGdyb3VwSW5kZXggZ3JvdXAgaW5kZXhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggaW5kZXhcbiAgICAgKiBAcmV0dXJucyB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBib3VuZFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldEJvdW5kOiBmdW5jdGlvbihncm91cEluZGV4LCBpbmRleCkge1xuICAgICAgICBpZiAoZ3JvdXBJbmRleCA9PT0gLTEgfHwgaW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5ncm91cEJvdW5kc1tncm91cEluZGV4XVtpbmRleF0uZW5kO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJhckNoYXJ0U2VyaWVzO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IENvbHVtbiBjaGFydCBzZXJpZXMgY29tcG9uZW50LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU2VyaWVzID0gcmVxdWlyZSgnLi9zZXJpZXMuanMnKSxcbiAgICBjaGFydENvbnN0ID0gcmVxdWlyZSgnLi4vY29uc3QuanMnKSxcbiAgICBkb20gPSByZXF1aXJlKCcuLi9oZWxwZXJzL2RvbUhhbmRsZXIuanMnKSxcbiAgICByZW5kZXJVdGlsID0gcmVxdWlyZSgnLi4vaGVscGVycy9yZW5kZXJVdGlsLmpzJyk7XG5cbnZhciBDb2x1bW5DaGFydFNlcmllcyA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoU2VyaWVzLCAvKiogQGxlbmRzIENvbHVtbkNoYXJ0U2VyaWVzLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogQ29sdW1uIGNoYXJ0IHNlcmllcyBjb21wb25lbnQuXG4gICAgICogQGNvbnN0cnVjdHMgQ29sdW1uQ2hhcnRTZXJpZXNcbiAgICAgKiBAZXh0ZW5kcyBTZXJpZXNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMubW9kZWwgc2VyaWVzIG1vZGVsXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgc2VyaWVzIG9wdGlvbnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgc2VyaWVzIHRoZW1lXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIFNlcmllcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGJvdW5kcyBvZiBjb2x1bW4gY2hhcnQuXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0Om51bWJlcn19IGRpbWVuc2lvbiBjb2x1bW4gY2hhcnQgZGltZW5zaW9uXG4gICAgICogQHJldHVybnMge2FycmF5LjxhcnJheS48b2JqZWN0Pj59IGJvdW5kc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VCb3VuZHM6IGZ1bmN0aW9uKGRpbWVuc2lvbikge1xuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5zdGFja2VkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbWFrZU5vcm1hbENvbHVtbkJvdW5kcyhkaW1lbnNpb24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21ha2VTdGFja2VkQ29sdW1uQm91bmRzKGRpbWVuc2lvbik7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBhZGQgZGF0YS5cbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBhZGQgZGF0YVxuICAgICAqL1xuICAgIG1ha2VBZGREYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGdyb3B1Qm91bmRzID0gdGhpcy5fbWFrZUJvdW5kcyh0aGlzLmJvdW5kLmRpbWVuc2lvbik7XG5cbiAgICAgICAgdGhpcy5ncm91cEJvdW5kcyA9IGdyb3B1Qm91bmRzO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBncm91cEJvdW5kczogZ3JvcHVCb3VuZHNcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBib3VuZHMgb2Ygbm9ybWFsIGNvbHVtbiBjaGFydC5cbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6bnVtYmVyfX0gZGltZW5zaW9uIGNvbHVtbiBjaGFydCBkaW1lbnNpb25cbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gYm91bmRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZU5vcm1hbENvbHVtbkJvdW5kczogZnVuY3Rpb24oZGltZW5zaW9uKSB7XG4gICAgICAgIHZhciBncm91cFZhbHVlcyA9IHRoaXMucGVyY2VudFZhbHVlcyxcbiAgICAgICAgICAgIGdyb3VwV2lkdGggPSAoZGltZW5zaW9uLndpZHRoIC8gZ3JvdXBWYWx1ZXMubGVuZ3RoKSxcbiAgICAgICAgICAgIGJhcldpZHRoID0gZ3JvdXBXaWR0aCAvIChncm91cFZhbHVlc1swXS5sZW5ndGggKyAxKSxcbiAgICAgICAgICAgIGlzTWludXMgPSB0aGlzLmRhdGEuc2NhbGUubWluIDwgMCAmJiB0aGlzLmRhdGEuc2NhbGUubWF4IDw9IDAsXG4gICAgICAgICAgICBzY2FsZURpc3RhbmNlID0gdGhpcy5nZXRTY2FsZURpc3RhbmNlRnJvbVplcm9Qb2ludChkaW1lbnNpb24uaGVpZ2h0LCB0aGlzLmRhdGEuc2NhbGUpLFxuICAgICAgICAgICAgYm91bmRzID0gbmUudXRpbC5tYXAoZ3JvdXBWYWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcywgZ3JvdXBJbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciBwYWRkaW5nTGVmdCA9IChncm91cFdpZHRoICogZ3JvdXBJbmRleCkgKyAoYmFyV2lkdGggLyAyKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbiAodmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBiYXJIZWlnaHQgPSB2YWx1ZSAqIGRpbWVuc2lvbi5oZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmRUb3AgPSBkaW1lbnNpb24uaGVpZ2h0IC0gYmFySGVpZ2h0ICsgY2hhcnRDb25zdC5ISURERU5fV0lEVEgsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydFRvcCA9IGVuZFRvcCArIGJhckhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQgPSBwYWRkaW5nTGVmdCArIChiYXJXaWR0aCAqIGluZGV4KSAtIGNoYXJ0Q29uc3QuSElEREVOX1dJRFRIO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc01pbnVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXJIZWlnaHQgKj0gLTE7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydFRvcCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbmRUb3AgPSAwO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFySGVpZ2h0ICo9IC0xO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRUb3AgPSBlbmRUb3AgPSBkaW1lbnNpb24uaGVpZ2h0IC0gc2NhbGVEaXN0YW5jZS50b01pbjtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0VG9wIC09IHNjYWxlRGlzdGFuY2UudG9NaW47XG4gICAgICAgICAgICAgICAgICAgICAgICBlbmRUb3AgLT0gc2NhbGVEaXN0YW5jZS50b01pbjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogc3RhcnRUb3AsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogbGVmdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogYmFyV2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAwXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiBlbmRUb3AsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogbGVmdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogYmFyV2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBiYXJIZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICByZXR1cm4gYm91bmRzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGJvdW5kcyBvZiBzdGFja2VkIGNvbHVtbiBjaGFydC5cbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6bnVtYmVyfX0gZGltZW5zaW9uIGNvbHVtbiBjaGFydCBkaW1lbnNpb25cbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gYm91bmRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVN0YWNrZWRDb2x1bW5Cb3VuZHM6IGZ1bmN0aW9uKGRpbWVuc2lvbikge1xuICAgICAgICB2YXIgZ3JvdXBWYWx1ZXMgPSB0aGlzLnBlcmNlbnRWYWx1ZXMsXG4gICAgICAgICAgICBncm91cFdpZHRoID0gKGRpbWVuc2lvbi53aWR0aCAvIGdyb3VwVmFsdWVzLmxlbmd0aCksXG4gICAgICAgICAgICBiYXJXaWR0aCA9IGdyb3VwV2lkdGggLyAyLFxuICAgICAgICAgICAgYm91bmRzID0gbmUudXRpbC5tYXAoZ3JvdXBWYWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcywgZ3JvdXBJbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciBwYWRkaW5nTGVmdCA9IChncm91cFdpZHRoICogZ3JvdXBJbmRleCkgKyAoYmFyV2lkdGggLyAyKSxcbiAgICAgICAgICAgICAgICAgICAgdG9wID0gMDtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGhlaWdodCwgYm91bmQ7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGhlaWdodCA9IHZhbHVlICogZGltZW5zaW9uLmhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgYm91bmQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogZGltZW5zaW9uLmhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiBwYWRkaW5nTGVmdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogYmFyV2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAwXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiBkaW1lbnNpb24uaGVpZ2h0IC0gaGVpZ2h0IC0gdG9wLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6IHBhZGRpbmdMZWZ0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiBiYXJXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IGhlaWdodFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB0b3AgKz0gaGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYm91bmQ7XG4gICAgICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGJvdW5kcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIG5vcm1hbCBzZXJpZXMgbGFiZWwuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge0hUTUxFbGVtZW50fSBwYXJhbXMuY29udGFpbmVyIGNvbnRhaW5lclxuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48YXJyYXk+fSBwYXJhbXMuZ3JvdXBCb3VuZHMgZ3JvdXAgYm91bmRzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IHBhcmFtcy5mb3JtYXR0ZWRWYWx1ZXMgZm9ybWF0dGVkIHZhbHVlc1xuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gc2VyaWVzIGxhYmVsIGFyZWFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJOb3JtYWxTZXJpZXNMYWJlbDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBncm91cEJvdW5kcyA9IHBhcmFtcy5ncm91cEJvdW5kcyxcbiAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlcyA9IHBhcmFtcy5mb3JtYXR0ZWRWYWx1ZXMsXG4gICAgICAgICAgICBsYWJlbEhlaWdodCA9IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodChmb3JtYXR0ZWRWYWx1ZXNbMF1bMF0sIHRoaXMudGhlbWUubGFiZWwpLFxuICAgICAgICAgICAgZWxTZXJpZXNMYWJlbEFyZWEgPSBkb20uY3JlYXRlKCdkaXYnLCAnbmUtY2hhcnQtc2VyaWVzLWxhYmVsLWFyZWEnKSxcbiAgICAgICAgICAgIGh0bWw7XG4gICAgICAgIGh0bWwgPSBuZS51dGlsLm1hcChwYXJhbXMudmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMsIGdyb3VwSW5kZXgpIHtcbiAgICAgICAgICAgIHJldHVybiBuZS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciBib3VuZCA9IGdyb3VwQm91bmRzW2dyb3VwSW5kZXhdW2luZGV4XS5lbmQsXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlID0gZm9ybWF0dGVkVmFsdWVzW2dyb3VwSW5kZXhdW2luZGV4XSxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxXaWR0aCA9IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbFdpZHRoKGZvcm1hdHRlZFZhbHVlLCB0aGlzLnRoZW1lLmxhYmVsKSxcbiAgICAgICAgICAgICAgICAgICAgdG9wID0gYm91bmQudG9wLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbEh0bWw7XG5cbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICB0b3AgLT0gbGFiZWxIZWlnaHQgKyBjaGFydENvbnN0LlNFUklFU19MQUJFTF9QQURESU5HO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRvcCArPSBib3VuZC5oZWlnaHQgKyBjaGFydENvbnN0LlNFUklFU19MQUJFTF9QQURESU5HO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxhYmVsSHRtbCA9IHRoaXMuX21ha2VTZXJpZXNMYWJlbEh0bWwoe1xuICAgICAgICAgICAgICAgICAgICBsZWZ0OiBib3VuZC5sZWZ0ICsgKGJvdW5kLndpZHRoIC0gbGFiZWxXaWR0aCkgLyAyLFxuICAgICAgICAgICAgICAgICAgICB0b3A6IHRvcFxuICAgICAgICAgICAgICAgIH0sIGZvcm1hdHRlZFZhbHVlLCBncm91cEluZGV4LCBpbmRleCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxhYmVsSHRtbDtcbiAgICAgICAgICAgIH0sIHRoaXMpLmpvaW4oJycpO1xuICAgICAgICB9LCB0aGlzKS5qb2luKCcnKTtcblxuICAgICAgICBlbFNlcmllc0xhYmVsQXJlYS5pbm5lckhUTUwgPSBodG1sO1xuICAgICAgICBwYXJhbXMuY29udGFpbmVyLmFwcGVuZENoaWxkKGVsU2VyaWVzTGFiZWxBcmVhKTtcblxuICAgICAgICByZXR1cm4gZWxTZXJpZXNMYWJlbEFyZWE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2Ugc3VtIGxhYmVsIGh0bWwuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxudW1iZXI+fSBwYXJhbXMudmFsdWVzIHZhbHVlc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48ZnVuY3Rpb24+fSBwYXJhbXMuZm9ybWF0RnVuY3Rpb25zIGZvcm1hdHRpbmcgZnVuY3Rpb25zXG4gICAgICogICAgICBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gcGFyYW1zLmJvdW5kIGJvdW5kXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmxhYmVsSGVpZ2h0IGxhYmVsIGhlaWdodFxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IHN1bSBsYWJlbCBodG1sXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVN1bUxhYmVsSHRtbDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBzdW0gPSBuZS51dGlsLnN1bShwYXJhbXMudmFsdWVzKSxcbiAgICAgICAgICAgIGZucyA9IFtzdW1dLmNvbmNhdChwYXJhbXMuZm9ybWF0RnVuY3Rpb25zKSxcbiAgICAgICAgICAgIGJvdW5kID0gcGFyYW1zLmJvdW5kLFxuICAgICAgICAgICAgbGVmdCA9IGJvdW5kLmxlZnQgKyAoYm91bmQud2lkdGggLyAyKSxcbiAgICAgICAgICAgIHRvdGFsTGFiZWxXaWR0aDtcblxuICAgICAgICBzdW0gPSBuZS51dGlsLnJlZHVjZShmbnMsIGZ1bmN0aW9uKHN0b3JlZCwgZm4pIHtcbiAgICAgICAgICAgIHJldHVybiBmbihzdG9yZWQpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0b3RhbExhYmVsV2lkdGggPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxXaWR0aChzdW0sIHRoaXMudGhlbWUubGFiZWwpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9tYWtlU2VyaWVzTGFiZWxIdG1sKHtcbiAgICAgICAgICAgIGxlZnQ6IGxlZnQgLSAodG90YWxMYWJlbFdpZHRoIC0gY2hhcnRDb25zdC5URVhUX1BBRERJTkcpIC8gMixcbiAgICAgICAgICAgIHRvcDogYm91bmQudG9wIC0gcGFyYW1zLmxhYmVsSGVpZ2h0IC0gY2hhcnRDb25zdC5TRVJJRVNfTEFCRUxfUEFERElOR1xuICAgICAgICB9LCBzdW0sIC0xLCAtMSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2Ugc3RhY2tlZCBsYWJlbHMgaHRtbC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuZ3JvdXBJbmRleCBncm91cCBpbmRleFxuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48bnVtYmVyPn0gcGFyYW1zLnZhbHVlcyB2YWx1ZXMsXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxmdW5jdGlvbj59IHBhcmFtcy5mb3JtYXRGdW5jdGlvbnMgZm9ybWF0dGluZyBmdW5jdGlvbnMsXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxvYmplY3Q+fSBwYXJhbXMuYm91bmRzIGJvdW5kcyxcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXl9IHBhcmFtcy5mb3JtYXR0ZWRWYWx1ZXMgZm9ybWF0dGVkIHZhbHVlcyxcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubGFiZWxIZWlnaHQgbGFiZWwgaGVpZ2h0XG4gICAgICogQHJldHVybnMge3N0cmluZ30gbGFiZWxzIGh0bWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlU3RhY2tlZExhYmVsc0h0bWw6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgdmFsdWVzID0gcGFyYW1zLnZhbHVlcyxcbiAgICAgICAgICAgIGJvdW5kLCBodG1scztcblxuICAgICAgICBodG1scyA9IG5lLnV0aWwubWFwKHBhcmFtcy52YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgICAgdmFyIGxhYmVsV2lkdGgsIGxlZnQsIHRvcCwgbGFiZWxIdG1sLCBmb3JtYXR0ZWRWYWx1ZTtcblxuICAgICAgICAgICAgaWYgKHZhbHVlIDwgMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYm91bmQgPSBwYXJhbXMuYm91bmRzW2luZGV4XS5lbmQ7XG4gICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZSA9IHBhcmFtcy5mb3JtYXR0ZWRWYWx1ZXNbaW5kZXhdO1xuICAgICAgICAgICAgbGFiZWxXaWR0aCA9IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbFdpZHRoKGZvcm1hdHRlZFZhbHVlLCB0aGlzLnRoZW1lLmxhYmVsKTtcbiAgICAgICAgICAgIGxlZnQgPSBib3VuZC5sZWZ0ICsgKChib3VuZC53aWR0aCAtIGxhYmVsV2lkdGggKyBjaGFydENvbnN0LlRFWFRfUEFERElORykgLyAyKTtcbiAgICAgICAgICAgIHRvcCA9IGJvdW5kLnRvcCArICgoYm91bmQuaGVpZ2h0IC0gcGFyYW1zLmxhYmVsSGVpZ2h0ICsgY2hhcnRDb25zdC5URVhUX1BBRERJTkcpIC8gMik7XG4gICAgICAgICAgICBsYWJlbEh0bWwgPSB0aGlzLl9tYWtlU2VyaWVzTGFiZWxIdG1sKHtcbiAgICAgICAgICAgICAgICBsZWZ0OiBsZWZ0LFxuICAgICAgICAgICAgICAgIHRvcDogdG9wXG4gICAgICAgICAgICB9LCBmb3JtYXR0ZWRWYWx1ZSwgcGFyYW1zLmdyb3VwSW5kZXgsIGluZGV4KTtcbiAgICAgICAgICAgIHJldHVybiBsYWJlbEh0bWw7XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc3RhY2tlZCA9PT0gJ25vcm1hbCcpIHtcbiAgICAgICAgICAgIGh0bWxzLnB1c2godGhpcy5fbWFrZVN1bUxhYmVsSHRtbCh7XG4gICAgICAgICAgICAgICAgdmFsdWVzOiB2YWx1ZXMsXG4gICAgICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zOiBwYXJhbXMuZm9ybWF0RnVuY3Rpb25zLFxuICAgICAgICAgICAgICAgIGJvdW5kOiBib3VuZCxcbiAgICAgICAgICAgICAgICBsYWJlbEhlaWdodDogcGFyYW1zLmxhYmVsSGVpZ2h0XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGh0bWxzLmpvaW4oJycpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgc3RhY2tlZCBzZXJpZXMgbGFiZWwuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge0hUTUxFbGVtZW50fSBwYXJhbXMuY29udGFpbmVyIGNvbnRhaW5lclxuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48YXJyYXk+fSBwYXJhbXMuZ3JvdXBCb3VuZHMgZ3JvdXAgYm91bmRzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IHBhcmFtcy5mb3JtYXR0ZWRWYWx1ZXMgZm9ybWF0dGVkIHZhbHVlc1xuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gc2VyaWVzIGxhYmVsIGFyZWFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJTdGFja2VkU2VyaWVzTGFiZWw6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgZ3JvdXBCb3VuZHMgPSBwYXJhbXMuZ3JvdXBCb3VuZHMsXG4gICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXMgPSBwYXJhbXMuZm9ybWF0dGVkVmFsdWVzLFxuICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zID0gcGFyYW1zLmZvcm1hdEZ1bmN0aW9ucyB8fCBbXSxcbiAgICAgICAgICAgIGVsU2VyaWVzTGFiZWxBcmVhID0gZG9tLmNyZWF0ZSgnZGl2JywgJ25lLWNoYXJ0LXNlcmllcy1sYWJlbC1hcmVhJyksXG4gICAgICAgICAgICBsYWJlbEhlaWdodCA9IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodChmb3JtYXR0ZWRWYWx1ZXNbMF1bMF0sIHRoaXMudGhlbWUubGFiZWwpLFxuICAgICAgICAgICAgaHRtbDtcblxuICAgICAgICBodG1sID0gbmUudXRpbC5tYXAocGFyYW1zLnZhbHVlcywgZnVuY3Rpb24odmFsdWVzLCBpbmRleCkge1xuICAgICAgICAgICAgdmFyIGxhYmVsc0h0bWwgPSB0aGlzLl9tYWtlU3RhY2tlZExhYmVsc0h0bWwoe1xuICAgICAgICAgICAgICAgICAgICBncm91cEluZGV4OiBpbmRleCxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzOiB2YWx1ZXMsXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdEZ1bmN0aW9uczogZm9ybWF0RnVuY3Rpb25zLFxuICAgICAgICAgICAgICAgICAgICBib3VuZHM6IGdyb3VwQm91bmRzW2luZGV4XSxcbiAgICAgICAgICAgICAgICAgICAgZm9ybWF0dGVkVmFsdWVzOiBmb3JtYXR0ZWRWYWx1ZXNbaW5kZXhdLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbEhlaWdodDogbGFiZWxIZWlnaHRcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBsYWJlbHNIdG1sO1xuICAgICAgICB9LCB0aGlzKS5qb2luKCcnKTtcblxuICAgICAgICBlbFNlcmllc0xhYmVsQXJlYS5pbm5lckhUTUwgPSBodG1sO1xuICAgICAgICBwYXJhbXMuY29udGFpbmVyLmFwcGVuZENoaWxkKGVsU2VyaWVzTGFiZWxBcmVhKTtcblxuICAgICAgICByZXR1cm4gZWxTZXJpZXNMYWJlbEFyZWE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBzZXJpZXMgbGFiZWwuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge0hUTUxFbGVtZW50fSBwYXJhbXMuY29udGFpbmVyIGNvbnRhaW5lclxuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48YXJyYXk+fSBwYXJhbXMuZ3JvdXBCb3VuZHMgZ3JvdXAgYm91bmRzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IHBhcmFtcy5mb3JtYXR0ZWRWYWx1ZXMgZm9ybWF0dGVkIHZhbHVlc1xuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gc2VyaWVzIGxhYmVsIGFyZWFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJTZXJpZXNMYWJlbDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBlbFNlcmllc0xhYmVsQXJlYTtcbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuc2hvd0xhYmVsKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc3RhY2tlZCkge1xuICAgICAgICAgICAgZWxTZXJpZXNMYWJlbEFyZWEgPSB0aGlzLl9yZW5kZXJTdGFja2VkU2VyaWVzTGFiZWwocGFyYW1zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsU2VyaWVzTGFiZWxBcmVhID0gdGhpcy5fcmVuZGVyTm9ybWFsU2VyaWVzTGFiZWwocGFyYW1zKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZWxTZXJpZXNMYWJlbEFyZWE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBib3VuZC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZ3JvdXBJbmRleCBncm91cCBpbmRleFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBpbmRleFxuICAgICAqIEByZXR1cm5zIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IGJvdW5kXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0Qm91bmQ6IGZ1bmN0aW9uKGdyb3VwSW5kZXgsIGluZGV4KSB7XG4gICAgICAgIGlmIChncm91cEluZGV4ID09PSAtMSB8fCBpbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmdyb3VwQm91bmRzW2dyb3VwSW5kZXhdW2luZGV4XS5lbmQ7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29sdW1uQ2hhcnRTZXJpZXM7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgTGluZSBjaGFydCBzZXJpZXMgY29tcG9uZW50LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU2VyaWVzID0gcmVxdWlyZSgnLi9zZXJpZXMuanMnKSxcbiAgICBMaW5lVHlwZVNlcmllc0Jhc2UgPSByZXF1aXJlKCcuL2xpbmVUeXBlU2VyaWVzQmFzZS5qcycpO1xuXG52YXIgTGluZUNoYXJ0U2VyaWVzID0gbmUudXRpbC5kZWZpbmVDbGFzcyhTZXJpZXMsIC8qKiBAbGVuZHMgTGluZUNoYXJ0U2VyaWVzLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogTGluZSBjaGFydCBzZXJpZXMgY29tcG9uZW50LlxuICAgICAqIEBjb25zdHJ1Y3RzIExpbmVDaGFydFNlcmllc1xuICAgICAqIEBleHRlbmRzIFNlcmllc1xuICAgICAqIEBtaXhlcyBMaW5lVHlwZVNlcmllc0Jhc2VcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMubW9kZWwgc2VyaWVzIG1vZGVsXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgc2VyaWVzIG9wdGlvbnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgc2VyaWVzIHRoZW1lXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIFNlcmllcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGFkZCBkYXRhLlxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IGFkZCBkYXRhXG4gICAgICovXG4gICAgbWFrZUFkZERhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZ3JvdXBQb3NpdGlvbnM6IHRoaXMubWFrZVBvc2l0aW9ucyh0aGlzLmJvdW5kLmRpbWVuc2lvbilcbiAgICAgICAgfTtcbiAgICB9XG59KTtcblxuTGluZVR5cGVTZXJpZXNCYXNlLm1peGluKExpbmVDaGFydFNlcmllcyk7XG5cbm1vZHVsZS5leHBvcnRzID0gTGluZUNoYXJ0U2VyaWVzO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IExpbmVUeXBlU2VyaWVzQmFzZSBpcyBiYXNlIGNsYXNzIGZvciBsaW5lIHR5cGUgc2VyaWVzLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU2VyaWVzID0gcmVxdWlyZSgnLi9zZXJpZXMuanMnKSxcbiAgICBjaGFydENvbnN0ID0gcmVxdWlyZSgnLi4vY29uc3QuanMnKSxcbiAgICBkb20gPSByZXF1aXJlKCcuLi9oZWxwZXJzL2RvbUhhbmRsZXIuanMnKSxcbiAgICByZW5kZXJVdGlsID0gcmVxdWlyZSgnLi4vaGVscGVycy9yZW5kZXJVdGlsLmpzJyk7XG4vKipcbiAqIEBjbGFzc2Rlc2MgTGluZVR5cGVTZXJpZXNCYXNlIGlzIGJhc2UgY2xhc3MgZm9yIGxpbmUgdHlwZSBzZXJpZXMuXG4gKiBAY2xhc3MgTGluZVR5cGVTZXJpZXNCYXNlXG4gKiBAbWl4aW5cbiAqL1xudmFyIExpbmVUeXBlU2VyaWVzQmFzZSA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoU2VyaWVzLCAvKiogQGxlbmRzIExpbmVUeXBlU2VyaWVzQmFzZS5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgcG9zaXRpb25zIG9mIGxpbmUgY2hhcnQuXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0Om51bmJlcn19IGRpbWVuc2lvbiBsaW5lIGNoYXJ0IGRpbWVuc2lvblxuICAgICAqIEByZXR1cm5zIHthcnJheS48YXJyYXkuPG9iamVjdD4+fSBwb3NpdGlvbnNcbiAgICAgKi9cbiAgICBtYWtlUG9zaXRpb25zOiBmdW5jdGlvbihkaW1lbnNpb24pIHtcbiAgICAgICAgdmFyIGdyb3VwVmFsdWVzID0gdGhpcy5wZXJjZW50VmFsdWVzLFxuICAgICAgICAgICAgd2lkdGggPSBkaW1lbnNpb24ud2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQgPSBkaW1lbnNpb24uaGVpZ2h0LFxuICAgICAgICAgICAgc3RlcCA9IHdpZHRoIC8gZ3JvdXBWYWx1ZXNbMF0ubGVuZ3RoLFxuICAgICAgICAgICAgc3RhcnQgPSBzdGVwIC8gMixcbiAgICAgICAgICAgIHJlc3VsdCA9IG5lLnV0aWwubWFwKGdyb3VwVmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6IHN0YXJ0ICsgKHN0ZXAgKiBpbmRleCksXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3A6IGhlaWdodCAtICh2YWx1ZSAqIGhlaWdodClcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB0aGlzLmdyb3VwUG9zaXRpb25zID0gcmVzdWx0O1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgc2VyaWVzIGxhYmVsLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtIVE1MRWxlbWVudH0gcGFyYW1zLmNvbnRhaW5lciBjb250YWluZXJcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gcGFyYW1zLmdyb3VwUG9zaXRpb25zIGdyb3VwIHBvc2l0aW9uc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48YXJyYXk+fSBwYXJhbXMuZm9ybWF0dGVkVmFsdWVzIGZvcm1hdHRlZCB2YWx1ZXNcbiAgICAgKiBAcmV0dXJuIHtIVE1MRWxlbWVudH0gc2VyaWVzIGFyZWEgZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlclNlcmllc0xhYmVsOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGdyb3VwUG9zaXRpb25zLCBsYWJlbEhlaWdodCwgZWxTZXJpZXNMYWJlbEFyZWEsIGh0bWw7XG5cbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuc2hvd0xhYmVsKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGdyb3VwUG9zaXRpb25zID0gcGFyYW1zLmdyb3VwUG9zaXRpb25zO1xuICAgICAgICBsYWJlbEhlaWdodCA9IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodChwYXJhbXMuZm9ybWF0dGVkVmFsdWVzWzBdWzBdLCB0aGlzLnRoZW1lLmxhYmVsKTtcbiAgICAgICAgZWxTZXJpZXNMYWJlbEFyZWEgPSBkb20uY3JlYXRlKCdkaXYnLCAnbmUtY2hhcnQtc2VyaWVzLWxhYmVsLWFyZWEnKTtcblxuICAgICAgICBodG1sID0gbmUudXRpbC5tYXAocGFyYW1zLmZvcm1hdHRlZFZhbHVlcywgZnVuY3Rpb24odmFsdWVzLCBncm91cEluZGV4KSB7XG4gICAgICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgcG9zaXRpb24gPSBncm91cFBvc2l0aW9uc1tncm91cEluZGV4XVtpbmRleF0sXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsV2lkdGggPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxXaWR0aCh2YWx1ZSwgdGhpcy50aGVtZS5sYWJlbCksXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsSHRtbCA9IHRoaXMuX21ha2VTZXJpZXNMYWJlbEh0bWwoe1xuICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogcG9zaXRpb24ubGVmdCAtIChsYWJlbFdpZHRoIC8gMiksXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3A6IHBvc2l0aW9uLnRvcCAtIGxhYmVsSGVpZ2h0IC0gY2hhcnRDb25zdC5TRVJJRVNfTEFCRUxfUEFERElOR1xuICAgICAgICAgICAgICAgICAgICB9LCB2YWx1ZSwgaW5kZXgsIGdyb3VwSW5kZXgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBsYWJlbEh0bWw7XG4gICAgICAgICAgICB9LCB0aGlzKS5qb2luKCcnKTtcbiAgICAgICAgfSwgdGhpcykuam9pbignJyk7XG5cbiAgICAgICAgZWxTZXJpZXNMYWJlbEFyZWEuaW5uZXJIVE1MID0gaHRtbDtcbiAgICAgICAgcGFyYW1zLmNvbnRhaW5lci5hcHBlbmRDaGlsZChlbFNlcmllc0xhYmVsQXJlYSk7XG5cbiAgICAgICAgcmV0dXJuIGVsU2VyaWVzTGFiZWxBcmVhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgYm91bmQuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGdyb3VwSW5kZXggZ3JvdXAgaW5kZXhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggaW5kZXhcbiAgICAgKiBAcmV0dXJucyB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBib3VuZFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldEJvdW5kOiBmdW5jdGlvbihncm91cEluZGV4LCBpbmRleCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ncm91cFBvc2l0aW9uc1tpbmRleF1bZ3JvdXBJbmRleF07XG4gICAgfVxufSk7XG5cbkxpbmVUeXBlU2VyaWVzQmFzZS5taXhpbiA9IGZ1bmN0aW9uKGZ1bmMpIHtcbiAgICBuZS51dGlsLmV4dGVuZChmdW5jLnByb3RvdHlwZSwgTGluZVR5cGVTZXJpZXNCYXNlLnByb3RvdHlwZSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IExpbmVUeXBlU2VyaWVzQmFzZTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBQaWUgY2hhcnQgc2VyaWVzIGNvbXBvbmVudC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFNlcmllcyA9IHJlcXVpcmUoJy4vc2VyaWVzJyksXG4gICAgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4uL2NvbnN0JyksXG4gICAgZG9tID0gcmVxdWlyZSgnLi4vaGVscGVycy9kb21IYW5kbGVyJyksXG4gICAgcmVuZGVyVXRpbCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvcmVuZGVyVXRpbCcpO1xuXG52YXIgUGllQ2hhcnRTZXJpZXMgPSBuZS51dGlsLmRlZmluZUNsYXNzKFNlcmllcywgLyoqIEBsZW5kcyBQaWVDaGFydFNlcmllcy5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIExpbmUgY2hhcnQgc2VyaWVzIGNvbXBvbmVudC5cbiAgICAgKiBAY29uc3RydWN0cyBQaWVDaGFydFNlcmllc1xuICAgICAqIEBleHRlbmRzIFNlcmllc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5tb2RlbCBzZXJpZXMgbW9kZWxcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMub3B0aW9ucyBzZXJpZXMgb3B0aW9uc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBzZXJpZXMgdGhlbWVcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgU2VyaWVzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgcGVyY2VudCB2YWx1ZS5cbiAgICAgKiBAcGFyYW0ge3t2YWx1ZXM6IGFycmF5LCBzY2FsZToge21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19fSBkYXRhIHNlcmllcyBkYXRhXG4gICAgICogQHJldHVybnMge2FycmF5LjxhcnJheS48bnVtYmVyPj59IHBlcmNlbnQgdmFsdWVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVBlcmNlbnRWYWx1ZXM6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IG5lLnV0aWwubWFwKGRhdGEudmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgICAgIHZhciBzdW0gPSBuZS51dGlsLnN1bSh2YWx1ZXMpO1xuICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgLyBzdW07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2Ugc2VjdG9ycyBpbmZvcm1hdGlvbi5cbiAgICAgKiBAcGFyYW0ge2FycmF5LjxudW1iZXI+fSBwZXJjZW50VmFsdWVzIHBlcmNlbnQgdmFsdWVzXG4gICAgICogQHBhcmFtIHt7Y3g6IG51bWJlciwgY3k6IG51bWJlciwgcjogbnVtYmVyfX0gY2lyY2xlQm91bmQgY2lyY2xlIGJvdW5kXG4gICAgICogQHJldHVybnMge2FycmF5LjxvYmplY3Q+fSBzZWN0b3JzIGluZm9ybWF0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVNlY3RvcnNJbmZvOiBmdW5jdGlvbihwZXJjZW50VmFsdWVzLCBjaXJjbGVCb3VuZCkge1xuICAgICAgICB2YXIgY3ggPSBjaXJjbGVCb3VuZC5jeCxcbiAgICAgICAgICAgIGN5ID0gY2lyY2xlQm91bmQuY3ksXG4gICAgICAgICAgICByID0gY2lyY2xlQm91bmQucixcbiAgICAgICAgICAgIGFuZ2xlID0gMCxcbiAgICAgICAgICAgIGRlbHRhID0gMTAsXG4gICAgICAgICAgICBwYXRocztcblxuICAgICAgICBwYXRocyA9IG5lLnV0aWwubWFwKHBlcmNlbnRWYWx1ZXMsIGZ1bmN0aW9uKHBlcmNlbnRWYWx1ZSkge1xuICAgICAgICAgICAgdmFyIGFkZEFuZ2xlID0gY2hhcnRDb25zdC5BTkdMRV8zNjAgKiBwZXJjZW50VmFsdWUsXG4gICAgICAgICAgICAgICAgZW5kQW5nbGUgPSBhbmdsZSArIGFkZEFuZ2xlLFxuICAgICAgICAgICAgICAgIHBvcHVwQW5nbGUgPSBhbmdsZSArIChhZGRBbmdsZSAvIDIpLFxuICAgICAgICAgICAgICAgIGFuZ2xlcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0QW5nbGU6IGFuZ2xlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kQW5nbGU6IGFuZ2xlXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGVuZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRBbmdsZTogYW5nbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmRBbmdsZTogZW5kQW5nbGVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcG9zaXRpb25EYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICBjeDogY3gsXG4gICAgICAgICAgICAgICAgICAgIGN5OiBjeSxcbiAgICAgICAgICAgICAgICAgICAgYW5nbGU6IHBvcHVwQW5nbGVcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgYW5nbGUgPSBlbmRBbmdsZTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcGVyY2VudFZhbHVlOiBwZXJjZW50VmFsdWUsXG4gICAgICAgICAgICAgICAgYW5nbGVzOiBhbmdsZXMsXG4gICAgICAgICAgICAgICAgcG9wdXBQb3NpdGlvbjogdGhpcy5fZ2V0QXJjUG9zaXRpb24obmUudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgICAgICAgICByOiByICsgZGVsdGFcbiAgICAgICAgICAgICAgICB9LCBwb3NpdGlvbkRhdGEpKSxcbiAgICAgICAgICAgICAgICBjZW50ZXJQb3NpdGlvbjogdGhpcy5fZ2V0QXJjUG9zaXRpb24obmUudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgICAgICAgICByOiAociAvIDIpICsgZGVsdGFcbiAgICAgICAgICAgICAgICB9LCBwb3NpdGlvbkRhdGEpKSxcbiAgICAgICAgICAgICAgICBvdXRlclBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiB0aGlzLl9nZXRBcmNQb3NpdGlvbihuZS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgICAgICAgICByOiByXG4gICAgICAgICAgICAgICAgICAgIH0sIHBvc2l0aW9uRGF0YSkpLFxuICAgICAgICAgICAgICAgICAgICBtaWRkbGU6IHRoaXMuX2dldEFyY1Bvc2l0aW9uKG5lLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHI6IHIgKyBkZWx0YVxuICAgICAgICAgICAgICAgICAgICB9LCBwb3NpdGlvbkRhdGEpKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIHJldHVybiBwYXRocztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBhZGQgZGF0YS5cbiAgICAgKiBAcmV0dXJucyB7e1xuICAgICAqICAgICAgZm9ybWF0dGVkVmFsdWVzOiBhcnJheSxcbiAgICAgKiAgICAgIGNoYXJ0QmFja2dyb3VuZDogc3RyaW5nLFxuICAgICAqICAgICAgY2lyY2xlQm91bmQ6ICh7Y3g6IG51bWJlciwgY3k6IG51bWJlciwgcjogbnVtYmVyfSksXG4gICAgICogICAgICBzZWN0b3JzSW5mbzogYXJyYXkuPG9iamVjdD5cbiAgICAgKiB9fSBhZGQgZGF0YSBmb3IgZ3JhcGggcmVuZGVyaW5nXG4gICAgICovXG4gICAgbWFrZUFkZERhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY2lyY2xlQm91bmQgPSB0aGlzLl9tYWtlQ2lyY2xlQm91bmQodGhpcy5ib3VuZC5kaW1lbnNpb24sIHtcbiAgICAgICAgICAgICAgICBzaG93TGFiZWw6IHRoaXMub3B0aW9ucy5zaG93TGFiZWwsXG4gICAgICAgICAgICAgICAgbGVnZW5kVHlwZTogdGhpcy5vcHRpb25zLmxlZ2VuZFR5cGVcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgc2VjdG9yc0luZm8gPSB0aGlzLl9tYWtlU2VjdG9yc0luZm8odGhpcy5wZXJjZW50VmFsdWVzWzBdLCBjaXJjbGVCb3VuZCk7XG5cbiAgICAgICAgdGhpcy5wb3B1cFBvc2l0aW9ucyA9IG5lLnV0aWwucGx1Y2soc2VjdG9yc0luZm8sICdwb3B1cFBvc2l0aW9uJyk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjaGFydEJhY2tncm91bmQ6IHRoaXMuY2hhcnRCYWNrZ3JvdW5kLFxuICAgICAgICAgICAgY2lyY2xlQm91bmQ6IGNpcmNsZUJvdW5kLFxuICAgICAgICAgICAgc2VjdG9yc0luZm86IHNlY3RvcnNJbmZvXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgY2lyY2xlIGJvdW5kXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0Om51bWJlcn19IGRpbWVuc2lvbiBjaGFydCBkaW1lbnNpb25cbiAgICAgKiBAcGFyYW0ge3tzaG93TGFiZWw6IGJvb2xlYW4sIGxlZ2VuZFR5cGU6IHN0cmluZ319IG9wdGlvbnMgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHt7Y3g6IG51bWJlciwgY3k6IG51bWJlciwgcjogbnVtYmVyfX0gY2lyY2xlIGJvdW5kc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VDaXJjbGVCb3VuZDogZnVuY3Rpb24oZGltZW5zaW9uLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciB3aWR0aCA9IGRpbWVuc2lvbi53aWR0aCxcbiAgICAgICAgICAgIGhlaWdodCA9IGRpbWVuc2lvbi5oZWlnaHQsXG4gICAgICAgICAgICBpc1NtYWxsUGllID0gb3B0aW9ucy5sZWdlbmRUeXBlID09PSBjaGFydENvbnN0LlNFUklFU19MRUdFTkRfVFlQRV9PVVRFUiAmJiBvcHRpb25zLnNob3dMYWJlbCxcbiAgICAgICAgICAgIHJhZGl1c1JhdGUgPSBpc1NtYWxsUGllID8gY2hhcnRDb25zdC5QSUVfR1JBUEhfU01BTExfUkFURSA6IGNoYXJ0Q29uc3QuUElFX0dSQVBIX0RFRkFVTFRfUkFURSxcbiAgICAgICAgICAgIGRpYW1ldGVyID0gbmUudXRpbC5tdWx0aXBsaWNhdGlvbihuZS51dGlsLm1pbihbd2lkdGgsIGhlaWdodF0pLCByYWRpdXNSYXRlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGN4OiBuZS51dGlsLmRpdmlzaW9uKHdpZHRoLCAyKSxcbiAgICAgICAgICAgIGN5OiBuZS51dGlsLmRpdmlzaW9uKGhlaWdodCwgMiksXG4gICAgICAgICAgICByOiBuZS51dGlsLmRpdmlzaW9uKGRpYW1ldGVyLCAyKVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgYXJjIHBvc2l0aW9uLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5jeCBjZW50ZXIgeFxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5jeSBjZW50ZXIgeVxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5yIHJhZGl1c1xuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5hbmdsZSBhbmdsZShkZWdyZWUpXG4gICAgICogQHJldHVybnMge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gYXJjIHBvc2l0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0QXJjUG9zaXRpb246IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbGVmdDogcGFyYW1zLmN4ICsgKHBhcmFtcy5yICogTWF0aC5zaW4ocGFyYW1zLmFuZ2xlICogY2hhcnRDb25zdC5SQUQpKSxcbiAgICAgICAgICAgIHRvcDogcGFyYW1zLmN5IC0gKHBhcmFtcy5yICogTWF0aC5jb3MocGFyYW1zLmFuZ2xlICogY2hhcnRDb25zdC5SQUQpKVxuICAgICAgICB9O1xuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYWRkIGRhdGEgZm9yIHNlcmllcyBsYWJlbC5cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY29udGFpbmVyXG4gICAgICogQHJldHVybnMge3tcbiAgICAgKiAgICAgIGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsXG4gICAgICogICAgICBsZWdlbmRMYWJlbHM6IGFycmF5LjxzdHJpbmc+LFxuICAgICAqICAgICAgb3B0aW9uczoge2xlZ2VuZFR5cGU6IHN0cmluZywgc2hvd0xhYmVsOiBib29sZWFufSxcbiAgICAgKiAgICAgIGNoYXJ0V2lkdGg6IG51bWJlcixcbiAgICAgKiAgICAgIGZvcm1hdHRlZFZhbHVlczogYXJyYXlcbiAgICAgKiB9fSBhZGQgZGF0YSBmb3IgbWFrZSBzZXJpZXMgbGFiZWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQWRkRGF0YUZvclNlcmllc0xhYmVsOiBmdW5jdGlvbihjb250YWluZXIpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNvbnRhaW5lcjogY29udGFpbmVyLFxuICAgICAgICAgICAgbGVnZW5kTGFiZWxzOiB0aGlzLmRhdGEubGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICAgIGxlZ2VuZFR5cGU6IHRoaXMub3B0aW9ucy5sZWdlbmRUeXBlLFxuICAgICAgICAgICAgICAgIHNob3dMYWJlbDogdGhpcy5vcHRpb25zLnNob3dMYWJlbFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNoYXJ0V2lkdGg6IHRoaXMuZGF0YS5jaGFydFdpZHRoLFxuICAgICAgICAgICAgZm9ybWF0dGVkVmFsdWVzOiB0aGlzLmRhdGEuZm9ybWF0dGVkVmFsdWVzWzBdXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBzZXJpZXMgbGFiZWwuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLmxlZ2VuZCBsZWdlbmRcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMubGFiZWwgbGFiZWxcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMuc2VwYXJhdG9yIHNlcGFyYXRvclxuICAgICAqICAgICAgQHBhcmFtIHt7bGVnZW5kVHlwZTogYm9vbGVhbiwgc2hvd0xhYmVsOiBib29sZWFufX0gcGFyYW1zLm9wdGlvbnMgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IHNlcmllcyBsYWJlbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFNlcmllc0xhYmVsOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIHNlcmllc0xhYmVsID0gJyc7XG4gICAgICAgIGlmIChwYXJhbXMub3B0aW9ucy5sZWdlbmRUeXBlKSB7XG4gICAgICAgICAgICBzZXJpZXNMYWJlbCA9IHBhcmFtcy5sZWdlbmQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGFyYW1zLm9wdGlvbnMuc2hvd0xhYmVsKSB7XG4gICAgICAgICAgICBzZXJpZXNMYWJlbCArPSAoc2VyaWVzTGFiZWwgPyBwYXJhbXMuc2VwYXJhdG9yIDogJycpICsgcGFyYW1zLmxhYmVsO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNlcmllc0xhYmVsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgY2VudGVyIGxlZ2VuZC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciBjb250YWluZXJcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGxlZ2VuZHMgbGVnZW5kc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48b2JqZWN0Pn0gY2VudGVyUG9zaXRpb25zIGNlbnRlciBwb3NpdGlvbnNcbiAgICAgKiBAcmV0dXJuIHtIVE1MRWxlbWVudH0gc2VyaWVzIGFyZWEgZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlckxlZ2VuZExhYmVsOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIHBvc2l0aW9ucyA9IHBhcmFtcy5wb3NpdGlvbnMsXG4gICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXMgPSBwYXJhbXMuZm9ybWF0dGVkVmFsdWVzLFxuICAgICAgICAgICAgZWxTZXJpZXNMYWJlbEFyZWEgPSBkb20uY3JlYXRlKCdkaXYnLCAnbmUtY2hhcnQtc2VyaWVzLWxhYmVsLWFyZWEnKSxcbiAgICAgICAgICAgIGh0bWw7XG5cbiAgICAgICAgaHRtbCA9IG5lLnV0aWwubWFwKHBhcmFtcy5sZWdlbmRMYWJlbHMsIGZ1bmN0aW9uKGxlZ2VuZCwgaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBsYWJlbCA9IHRoaXMuX2dldFNlcmllc0xhYmVsKHtcbiAgICAgICAgICAgICAgICAgICAgbGVnZW5kOiBsZWdlbmQsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiBmb3JtYXR0ZWRWYWx1ZXNbaW5kZXhdLFxuICAgICAgICAgICAgICAgICAgICBzZXBhcmF0b3I6IHBhcmFtcy5zZXBhcmF0b3IsXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IHBhcmFtcy5vcHRpb25zXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgcG9zaXRpb24gPSBwYXJhbXMubW92ZVRvUG9zaXRpb24ocG9zaXRpb25zW2luZGV4XSwgbGFiZWwpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21ha2VTZXJpZXNMYWJlbEh0bWwocG9zaXRpb24sIGxhYmVsLCAwLCBpbmRleCk7XG4gICAgICAgIH0sIHRoaXMpLmpvaW4oJycpO1xuXG4gICAgICAgIGVsU2VyaWVzTGFiZWxBcmVhLmlubmVySFRNTCA9IGh0bWw7XG4gICAgICAgIHBhcmFtcy5jb250YWluZXIuYXBwZW5kQ2hpbGQoZWxTZXJpZXNMYWJlbEFyZWEpO1xuXG4gICAgICAgIHJldHVybiBlbFNlcmllc0xhYmVsQXJlYTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTW92ZSB0byBjZW50ZXIgcG9zaXRpb24uXG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IHBvc2l0aW9uIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGxhYmVsIGxhYmVsXG4gICAgICogQHJldHVybnMge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gY2VudGVyIHBvc2l0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbW92ZVRvQ2VudGVyUG9zaXRpb246IGZ1bmN0aW9uKHBvc2l0aW9uLCBsYWJlbCkge1xuICAgICAgICB2YXIgbGVmdCA9IHBvc2l0aW9uLmxlZnQgLSAocmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsV2lkdGgobGFiZWwsIHRoaXMudGhlbWUubGFiZWwpIC8gMiksXG4gICAgICAgICAgICB0b3AgPSBwb3NpdGlvbi50b3AgLSAocmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsSGVpZ2h0KGxhYmVsLCB0aGlzLnRoZW1lLmxhYmVsKSAvIDIpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbGVmdDogbGVmdCxcbiAgICAgICAgICAgIHRvcDogdG9wXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBjZW50ZXIgbGVnZW5kLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNvbnRhaW5lclxuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48c3RyaW5nPn0gbGVnZW5kcyBsZWdlbmRzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxvYmplY3Q+fSBjZW50ZXJQb3NpdGlvbnMgY2VudGVyIHBvc2l0aW9uc1xuICAgICAqIEByZXR1cm4ge0hUTUxFbGVtZW50fSBhcmVhIGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJDZW50ZXJMZWdlbmQ6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgZWxBcmVhID0gdGhpcy5fcmVuZGVyTGVnZW5kTGFiZWwobmUudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgcG9zaXRpb25zOiBuZS51dGlsLnBsdWNrKHBhcmFtcy5zZWN0b3JzSW5mbywgJ2NlbnRlclBvc2l0aW9uJyksXG4gICAgICAgICAgICBtb3ZlVG9Qb3NpdGlvbjogbmUudXRpbC5iaW5kKHRoaXMuX21vdmVUb0NlbnRlclBvc2l0aW9uLCB0aGlzKSxcbiAgICAgICAgICAgIHNlcGFyYXRvcjogJzxicj4nXG4gICAgICAgIH0sIHBhcmFtcykpO1xuXG4gICAgICAgIHJldHVybiBlbEFyZWE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZCBlbmQgcG9zaXRpb24uXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGNlbnRlckxlZnQgY2VudGVyIGxlZnRcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxvYmplY3Q+fSBwb3NpdGlvbnMgcG9zaXRpb25zXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYWRkRW5kUG9zaXRpb246IGZ1bmN0aW9uKGNlbnRlckxlZnQsIHBvc2l0aW9ucykge1xuICAgICAgICBuZS51dGlsLmZvckVhY2gocG9zaXRpb25zLCBmdW5jdGlvbihwb3NpdGlvbikge1xuICAgICAgICAgICAgdmFyIGVuZCA9IG5lLnV0aWwuZXh0ZW5kKHt9LCBwb3NpdGlvbi5taWRkbGUpO1xuICAgICAgICAgICAgaWYgKGVuZC5sZWZ0IDwgY2VudGVyTGVmdCkge1xuICAgICAgICAgICAgICAgIGVuZC5sZWZ0IC09IGNoYXJ0Q29uc3QuU0VSSUVTX09VVEVSX0xBQkVMX1BBRERJTkc7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGVuZC5sZWZ0ICs9IGNoYXJ0Q29uc3QuU0VSSUVTX09VVEVSX0xBQkVMX1BBRERJTkc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwb3NpdGlvbi5lbmQgPSBlbmQ7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBNb3ZlIHRvIG91dGVyIHBvc2l0aW9uLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjZW50ZXJMZWZ0IGNlbnRlciBsZWZ0XG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBvc2l0aW9uIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGxhYmVsIGxhYmVsXG4gICAgICogQHJldHVybnMge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gb3V0ZXIgcG9zaXRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tb3ZlVG9PdXRlclBvc2l0aW9uOiBmdW5jdGlvbihjZW50ZXJMZWZ0LCBwb3NpdGlvbiwgbGFiZWwpIHtcbiAgICAgICAgdmFyIHBvc2l0aW9uRW5kID0gcG9zaXRpb24uZW5kLFxuICAgICAgICAgICAgbGVmdCA9IHBvc2l0aW9uRW5kLmxlZnQsXG4gICAgICAgICAgICB0b3AgPSBwb3NpdGlvbkVuZC50b3AgLSAocmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsSGVpZ2h0KGxhYmVsLCB0aGlzLnRoZW1lLmxhYmVsKSAvIDIpO1xuXG4gICAgICAgIGlmIChsZWZ0IDwgY2VudGVyTGVmdCkge1xuICAgICAgICAgICAgbGVmdCAtPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxXaWR0aChsYWJlbCwgdGhpcy50aGVtZS5sYWJlbCkgKyBjaGFydENvbnN0LlNFUklFU19MQUJFTF9QQURESU5HO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGVmdCArPSBjaGFydENvbnN0LlNFUklFU19MQUJFTF9QQURESU5HO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxlZnQ6IGxlZnQsXG4gICAgICAgICAgICB0b3A6IHRvcFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgb3V0ZXIgbGVnZW5kLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNvbnRhaW5lclxuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48c3RyaW5nPn0gbGVnZW5kcyBsZWdlbmRzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxvYmplY3Q+fSBjZW50ZXJQb3NpdGlvbnMgY2VudGVyIHBvc2l0aW9uc1xuICAgICAqIEByZXR1cm4ge0hUTUxFbGVtZW50fSBhcmVhIGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJPdXRlckxlZ2VuZDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBvdXRlclBvc2l0aW9ucyA9IG5lLnV0aWwucGx1Y2socGFyYW1zLnNlY3RvcnNJbmZvLCAnb3V0ZXJQb3NpdGlvbicpLFxuICAgICAgICAgICAgY2VudGVyTGVmdCA9IHBhcmFtcy5jaGFydFdpZHRoIC8gMixcbiAgICAgICAgICAgIGVsQXJlYTtcblxuICAgICAgICB0aGlzLl9hZGRFbmRQb3NpdGlvbihjZW50ZXJMZWZ0LCBvdXRlclBvc2l0aW9ucyk7XG4gICAgICAgIGVsQXJlYSA9IHRoaXMuX3JlbmRlckxlZ2VuZExhYmVsKG5lLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgIHBvc2l0aW9uczogb3V0ZXJQb3NpdGlvbnMsXG4gICAgICAgICAgICBtb3ZlVG9Qb3NpdGlvbjogbmUudXRpbC5iaW5kKHRoaXMuX21vdmVUb091dGVyUG9zaXRpb24sIHRoaXMsIGNlbnRlckxlZnQpLFxuICAgICAgICAgICAgc2VwYXJhdG9yOiAnOiZuYnNwOydcbiAgICAgICAgfSwgcGFyYW1zKSk7XG5cbiAgICAgICAgaWYgKHRoaXMucGFwZXIpIHtcbiAgICAgICAgICAgIHRoaXMuZ3JhcGhSZW5kZXJlci5yZW5kZXJMZWdlbmRMaW5lcyh0aGlzLnBhcGVyLCBvdXRlclBvc2l0aW9ucyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZWxBcmVhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgc2VyaWVzIGxhYmVsLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gYXJlYSBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyU2VyaWVzTGFiZWw6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgZWxBcmVhO1xuICAgICAgICBpZiAocGFyYW1zLm9wdGlvbnMubGVnZW5kVHlwZSA9PT0gY2hhcnRDb25zdC5TRVJJRVNfTEVHRU5EX1RZUEVfT1VURVIpIHtcbiAgICAgICAgICAgIGVsQXJlYSA9IHRoaXMuX3JlbmRlck91dGVyTGVnZW5kKHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbEFyZWEgPSB0aGlzLl9yZW5kZXJDZW50ZXJMZWdlbmQocGFyYW1zKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZWxBcmVhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgYm91bmQuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGdyb3VwSW5kZXggZ3JvdXAgaW5kZXhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggaW5kZXhcbiAgICAgKiBAcmV0dXJucyB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBib3VuZFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldEJvdW5kOiBmdW5jdGlvbihncm91cEluZGV4LCBpbmRleCkge1xuICAgICAgICBpZiAoZ3JvdXBJbmRleCA9PT0gLTEgfHwgaW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5wb3B1cFBvc2l0aW9uc1tpbmRleF07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNob3cgc2VyaWVzIGxhYmVsIGFyZWEuXG4gICAgICovXG4gICAgc2hvd1Nlcmllc0xhYmVsQXJlYTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZ3JhcGhSZW5kZXJlci5hbmltYXRlTGVnZW5kTGluZXMoKTtcbiAgICAgICAgU2VyaWVzLnByb3RvdHlwZS5zaG93U2VyaWVzTGFiZWxBcmVhLmNhbGwodGhpcyk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUGllQ2hhcnRTZXJpZXM7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgU2VyaWVzIGJhc2UgY29tcG9uZW50LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgc2VyaWVzVGVtcGxhdGUgPSByZXF1aXJlKCcuL3Nlcmllc1RlbXBsYXRlLmpzJyksXG4gICAgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4uL2NvbnN0LmpzJyksXG4gICAgZG9tID0gcmVxdWlyZSgnLi4vaGVscGVycy9kb21IYW5kbGVyLmpzJyksXG4gICAgcmVuZGVyVXRpbCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvcmVuZGVyVXRpbC5qcycpLFxuICAgIGV2ZW50ID0gcmVxdWlyZSgnLi4vaGVscGVycy9ldmVudExpc3RlbmVyLmpzJyksXG4gICAgcGx1Z2luRmFjdG9yeSA9IHJlcXVpcmUoJy4uL2ZhY3Rvcmllcy9wbHVnaW5GYWN0b3J5LmpzJyk7XG5cbnZhciBISURERU5fV0lEVEggPSAxLFxuICAgIFNFUklFU19MQUJFTF9DTEFTU19OQU1FID0gJ25lLWNoYXJ0LXNlcmllcy1sYWJlbCc7XG5cbnZhciBTZXJpZXMgPSBuZS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgU2VyaWVzLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogU2VyaWVzIGJhc2UgY29tcG9uZW50LlxuICAgICAqIEBjb25zdHJ1Y3RzIFNlcmllc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5tb2RlbCBzZXJpZXMgbW9kZWxcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMub3B0aW9ucyBzZXJpZXMgb3B0aW9uc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBzZXJpZXMgdGhlbWVcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGxpYlR5cGU7XG5cbiAgICAgICAgbmUudXRpbC5leHRlbmQodGhpcywgcGFyYW1zKTtcbiAgICAgICAgbGliVHlwZSA9IHBhcmFtcy5saWJUeXBlIHx8IGNoYXJ0Q29uc3QuREVGQVVMVF9QTFVHSU47XG4gICAgICAgIHRoaXMucGVyY2VudFZhbHVlcyA9IHRoaXMuX21ha2VQZXJjZW50VmFsdWVzKHBhcmFtcy5kYXRhLCBwYXJhbXMub3B0aW9ucy5zdGFja2VkKTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdyYXBoIHJlbmRlcmVyXG4gICAgICAgICAqIEB0eXBlIHtvYmplY3R9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdyYXBoUmVuZGVyZXIgPSBwbHVnaW5GYWN0b3J5LmdldChsaWJUeXBlLCBwYXJhbXMuY2hhcnRUeXBlKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogU2VyaWVzIHZpZXcgY2xhc3NOYW1lXG4gICAgICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNsYXNzTmFtZSA9ICduZS1jaGFydC1zZXJpZXMtYXJlYSc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNob3cgdG9vbHRpcCAobW91c2VvdmVyIGNhbGxiYWNrKS5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMucHJlZml4IHRvb2x0aXAgaWQgcHJlZml4XG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5hbGxvd05lZ2F0aXZlVG9vbHRpcCB3aGV0aGVyIGFsbG93IG5lZ2F0aXZlIHRvb2x0aXAgb3Igbm90XG4gICAgICogQHBhcmFtIHt7dG9wOm51bWJlciwgbGVmdDogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGJvdW5kIGdyYXBoIGJvdW5kIGluZm9ybWF0aW9uXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGlkIHRvb2x0aXAgaWRcbiAgICAgKi9cbiAgICBzaG93VG9vbHRpcDogZnVuY3Rpb24ocGFyYW1zLCBib3VuZCwgaWQpIHtcbiAgICAgICAgdGhpcy5maXJlKCdzaG93VG9vbHRpcCcsIG5lLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgIGlkOiBwYXJhbXMucHJlZml4ICsgaWQsXG4gICAgICAgICAgICBib3VuZDogYm91bmRcbiAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhpZGUgdG9vbHRpcCAobW91c2VvdXQgY2FsbGJhY2spLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwcmVmaXggdG9vbHRpcCBpZCBwcmVmaXhcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgdG9vbHRpcCBpZFxuICAgICAqL1xuICAgIGhpZGVUb29sdGlwOiBmdW5jdGlvbihwcmVmaXgsIGlkKSB7XG4gICAgICAgIHRoaXMuZmlyZSgnaGlkZVRvb2x0aXAnLCB7XG4gICAgICAgICAgICBpZDogcHJlZml4ICsgaWRcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBzZXJpZXMuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIG9iamVjdCBmb3IgZ3JhcGggZHJhd2luZ1xuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gc2VyaWVzIGVsZW1lbnRcbiAgICAgKi9cbiAgICByZW5kZXI6IGZ1bmN0aW9uKHBhcGVyKSB7XG4gICAgICAgIHZhciBlbCA9IGRvbS5jcmVhdGUoJ0RJVicsIHRoaXMuY2xhc3NOYW1lKSxcbiAgICAgICAgICAgIHRvb2x0aXBQcmVmaXggPSB0aGlzLnRvb2x0aXBQcmVmaXgsXG4gICAgICAgICAgICBib3VuZCA9IHRoaXMuYm91bmQsXG4gICAgICAgICAgICBkaW1lbnNpb24gPSBib3VuZC5kaW1lbnNpb24sXG4gICAgICAgICAgICBpbkNhbGxiYWNrID0gbmUudXRpbC5iaW5kKHRoaXMuc2hvd1Rvb2x0aXAsIHRoaXMsIHtcbiAgICAgICAgICAgICAgICBwcmVmaXg6IHRvb2x0aXBQcmVmaXgsXG4gICAgICAgICAgICAgICAgYWxsb3dOZWdhdGl2ZVRvb2x0aXA6ICEhdGhpcy5hbGxvd05lZ2F0aXZlVG9vbHRpcCxcbiAgICAgICAgICAgICAgICBjaGFydFR5cGU6IHRoaXMuY2hhcnRUeXBlXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIG91dENhbGxiYWNrID0gbmUudXRpbC5iaW5kKHRoaXMuaGlkZVRvb2x0aXAsIHRoaXMsIHRvb2x0aXBQcmVmaXgpLFxuICAgICAgICAgICAgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICBkaW1lbnNpb246IGRpbWVuc2lvbixcbiAgICAgICAgICAgICAgICB0aGVtZTogdGhpcy50aGVtZSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnNcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhZGREYXRhID0gdGhpcy5tYWtlQWRkRGF0YSgpLFxuICAgICAgICAgICAgYWRkRGF0YUZvclNlcmllc0xhYmVsO1xuXG4gICAgICAgIGlmICghcGFwZXIpIHtcbiAgICAgICAgICAgIHJlbmRlclV0aWwucmVuZGVyRGltZW5zaW9uKGVsLCBkaW1lbnNpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fcmVuZGVyUG9zaXRpb24oZWwsIGJvdW5kLnBvc2l0aW9uLCB0aGlzLmNoYXJ0VHlwZSk7XG5cbiAgICAgICAgZGF0YSA9IG5lLnV0aWwuZXh0ZW5kKGRhdGEsIGFkZERhdGEpO1xuXG4gICAgICAgIHRoaXMucGFwZXIgPSB0aGlzLmdyYXBoUmVuZGVyZXIucmVuZGVyKHBhcGVyLCBlbCwgZGF0YSwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spO1xuXG4gICAgICAgIGlmICh0aGlzLl9yZW5kZXJTZXJpZXNMYWJlbCkge1xuICAgICAgICAgICAgYWRkRGF0YUZvclNlcmllc0xhYmVsID0gdGhpcy5fbWFrZUFkZERhdGFGb3JTZXJpZXNMYWJlbChlbCwgZGltZW5zaW9uKTtcbiAgICAgICAgICAgIHRoaXMuZWxTZXJpZXNMYWJlbEFyZWEgPSB0aGlzLl9yZW5kZXJTZXJpZXNMYWJlbChuZS51dGlsLmV4dGVuZChhZGREYXRhRm9yU2VyaWVzTGFiZWwsIGFkZERhdGEpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYXR0YWNoRXZlbnQoZWwpO1xuXG4gICAgICAgIC8vIHNlcmllcyBsYWJlbCBtb3VzZSBldmVudCDrj5nsnpEg7IucIOyCrOyaqVxuICAgICAgICB0aGlzLmluQ2FsbGJhY2sgPSBpbkNhbGxiYWNrO1xuICAgICAgICB0aGlzLm91dENhbGxiYWNrID0gb3V0Q2FsbGJhY2s7XG5cbiAgICAgICAgcmV0dXJuIGVsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGFkZCBkYXRhLlxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IGFkZCBkYXRhXG4gICAgICovXG4gICAgbWFrZUFkZERhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4ge307XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYWRkIGRhdGEgZm9yIHNlcmllcyBsYWJlbC5cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY29udGFpbmVyXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fWRpbWVuc2lvblxuICAgICAqIEByZXR1cm5zIHt7XG4gICAgICogICAgICBjb250YWluZXI6IEhUTUxFbGVtZW50LFxuICAgICAqICAgICAgdmFsdWVzOiBhcnJheS48YXJyYXk+LFxuICAgICAqICAgICAgZm9ybWF0dGVkVmFsdWVzOiBhcnJheS48YXJyYXk+LFxuICAgICAqICAgICAgZm9ybWF0RnVuY3Rpb25zOiBhcnJheS48ZnVuY3Rpb24+LFxuICAgICAqICAgICAgZGltZW5zaW9uOiB7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9XG4gICAgICogfX0gYWRkIGRhdGEgZm9yIHNlcmllcyBsYWJlbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VBZGREYXRhRm9yU2VyaWVzTGFiZWw6IGZ1bmN0aW9uKGNvbnRhaW5lciwgZGltZW5zaW9uKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjb250YWluZXI6IGNvbnRhaW5lcixcbiAgICAgICAgICAgIHZhbHVlczogdGhpcy5kYXRhLnZhbHVlcyxcbiAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlczogdGhpcy5kYXRhLmZvcm1hdHRlZFZhbHVlcyxcbiAgICAgICAgICAgIGZvcm1hdEZ1bmN0aW9uczogdGhpcy5kYXRhLmZvcm1hdEZ1bmN0aW9ucyxcbiAgICAgICAgICAgIGRpbWVuc2lvbjogZGltZW5zaW9uXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBib3VuZHNcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCBzZXJpZXMgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gZGltZW5zaW9uIHNlcmllcyBkaW1lbnNpb25cbiAgICAgKiBAcGFyYW0ge3t0b3A6IG51bWJlciwgbGVmdDogbnVtYmVyfX0gcG9zaXRpb24gc2VyaWVzIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNoYXJ0VHlwZSBjaGFydCB0eXBlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyUG9zaXRpb246IGZ1bmN0aW9uKGVsLCBwb3NpdGlvbiwgY2hhcnRUeXBlKSB7XG4gICAgICAgIHZhciBoaWRkZW5XaWR0aCA9IHJlbmRlclV0aWwuaXNJRTgoKSA/IDAgOiBISURERU5fV0lEVEg7XG4gICAgICAgIHBvc2l0aW9uLnRvcCA9IHBvc2l0aW9uLnRvcCAtIEhJRERFTl9XSURUSDtcbiAgICAgICAgcG9zaXRpb24ubGVmdCA9IHBvc2l0aW9uLmxlZnQgKyAoY2hhcnRUeXBlID09PSBjaGFydENvbnN0LkNIQVJUX1RZUEVfQkFSID8gaGlkZGVuV2lkdGggOiBISURERU5fV0lEVEggKiAyKTtcbiAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJQb3NpdGlvbihlbCwgcG9zaXRpb24pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgcGFwZXIuXG4gICAgICogQHJldHVybnMge29iamVjdH0gb2JqZWN0IGZvciBncmFwaCBkcmF3aW5nXG4gICAgICovXG4gICAgZ2V0UGFwZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXBlcjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBwZXJjZW50IHZhbHVlLlxuICAgICAqIEBwYXJhbSB7e3ZhbHVlczogYXJyYXksIHNjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX19IGRhdGEgc2VyaWVzIGRhdGFcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhY2tlZCBzdGFja2VkIG9wdGlvblxuICAgICAqIEByZXR1cm5zIHthcnJheS48YXJyYXkuPG51bWJlcj4+fSBwZXJjZW50IHZhbHVlc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VQZXJjZW50VmFsdWVzOiBmdW5jdGlvbihkYXRhLCBzdGFja2VkKSB7XG4gICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgIGlmIChzdGFja2VkID09PSBjaGFydENvbnN0LlNUQUNLRURfTk9STUFMX1RZUEUpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuX21ha2VOb3JtYWxTdGFja2VkUGVyY2VudFZhbHVlcyhkYXRhKTtcbiAgICAgICAgfSBlbHNlIGlmIChzdGFja2VkID09PSBjaGFydENvbnN0LlNUQUNLRURfUEVSQ0VOVF9UWVBFKSB7XG4gICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9tYWtlUGVyY2VudFN0YWNrZWRQZXJjZW50VmFsdWVzKGRhdGEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5fbWFrZU5vcm1hbFBlcmNlbnRWYWx1ZXMoZGF0YSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHBlcmNlbnQgdmFsdWVzIGFib3V0IG5vcm1hbCBzdGFja2VkIG9wdGlvbi5cbiAgICAgKiBAcGFyYW0ge3t2YWx1ZXM6IGFycmF5LCBzY2FsZToge21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19fSBkYXRhIHNlcmllcyBkYXRhXG4gICAgICogQHJldHVybnMge2FycmF5fSBwZXJjZW50IHZhbHVlcyBhYm91dCBub3JtYWwgc3RhY2tlZCBvcHRpb24uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZU5vcm1hbFN0YWNrZWRQZXJjZW50VmFsdWVzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBtaW4gPSBkYXRhLnNjYWxlLm1pbixcbiAgICAgICAgICAgIG1heCA9IGRhdGEuc2NhbGUubWF4LFxuICAgICAgICAgICAgZGlzdGFuY2UgPSBtYXggLSBtaW4sXG4gICAgICAgICAgICBwZXJjZW50VmFsdWVzID0gbmUudXRpbC5tYXAoZGF0YS52YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICAgICAgICAgIHZhciBwbHVzVmFsdWVzID0gbmUudXRpbC5maWx0ZXIodmFsdWVzLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlID4gMDtcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIHN1bSA9IG5lLnV0aWwuc3VtKHBsdXNWYWx1ZXMpLFxuICAgICAgICAgICAgICAgICAgICBncm91cFBlcmNlbnQgPSAoc3VtIC0gbWluKSAvIGRpc3RhbmNlO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBncm91cFBlcmNlbnQgKiAodmFsdWUgLyBzdW0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBwZXJjZW50VmFsdWVzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHBlcmNlbnQgdmFsdWVzIGFib3V0IHBlcmNlbnQgc3RhY2tlZCBvcHRpb24uXG4gICAgICogQHBhcmFtIHt7dmFsdWVzOiBhcnJheSwgc2NhbGU6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fX0gZGF0YSBzZXJpZXMgZGF0YVxuICAgICAqIEByZXR1cm5zIHthcnJheX0gcGVyY2VudCB2YWx1ZXMgYWJvdXQgcGVyY2VudCBzdGFja2VkIG9wdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VQZXJjZW50U3RhY2tlZFBlcmNlbnRWYWx1ZXM6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIHBlcmNlbnRWYWx1ZXMgPSBuZS51dGlsLm1hcChkYXRhLnZhbHVlcywgZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgICAgICB2YXIgcGx1c1ZhbHVlcyA9IG5lLnV0aWwuZmlsdGVyKHZhbHVlcywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlID4gMDtcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBzdW0gPSBuZS51dGlsLnN1bShwbHVzVmFsdWVzKTtcbiAgICAgICAgICAgIHJldHVybiBuZS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlIC8gc3VtO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcGVyY2VudFZhbHVlcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciBsaW5lIHR5cGUgY2hhcnQgb3Igbm90LlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjaGFydFR5cGUgY2hhcnQgdHlwZVxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSByZXN1bHQgYm9vbGVhblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2lzTGluZVR5cGVDaGFydDogZnVuY3Rpb24oY2hhcnRUeXBlKSB7XG4gICAgICAgIHJldHVybiBjaGFydFR5cGUgPT09IGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9MSU5FIHx8IGNoYXJ0VHlwZSA9PT0gY2hhcnRDb25zdC5DSEFSVF9UWVBFX0FSRUE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2Ugbm9ybWFsIHBlcmNlbnQgdmFsdWUuXG4gICAgICogQHBhcmFtIHt7dmFsdWVzOiBhcnJheSwgc2NhbGU6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fX0gZGF0YSBzZXJpZXMgZGF0YVxuICAgICAqIEByZXR1cm5zIHthcnJheS48YXJyYXkuPG51bWJlcj4+fSBwZXJjZW50IHZhbHVlc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VOb3JtYWxQZXJjZW50VmFsdWVzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBtaW4gPSBkYXRhLnNjYWxlLm1pbixcbiAgICAgICAgICAgIG1heCA9IGRhdGEuc2NhbGUubWF4LFxuICAgICAgICAgICAgZGlzdGFuY2UgPSBtYXggLSBtaW4sXG4gICAgICAgICAgICBpc0xpbmVUeXBlQ2hhcnQgPSB0aGlzLl9pc0xpbmVUeXBlQ2hhcnQodGhpcy5jaGFydFR5cGUpLFxuICAgICAgICAgICAgZmxhZyA9IDEsXG4gICAgICAgICAgICBzdWJWYWx1ZSA9IDAsXG4gICAgICAgICAgICBwZXJjZW50VmFsdWVzO1xuXG4gICAgICAgIGlmICghaXNMaW5lVHlwZUNoYXJ0ICYmIG1pbiA8IDAgJiYgbWF4IDw9IDApIHtcbiAgICAgICAgICAgIGZsYWcgPSAtMTtcbiAgICAgICAgICAgIHN1YlZhbHVlID0gbWF4O1xuICAgICAgICAgICAgZGlzdGFuY2UgPSBtaW4gLSBtYXg7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNMaW5lVHlwZUNoYXJ0IHx8IG1pbiA+PSAwKSB7XG4gICAgICAgICAgICBzdWJWYWx1ZSA9IG1pbjtcbiAgICAgICAgfVxuXG4gICAgICAgIHBlcmNlbnRWYWx1ZXMgPSBuZS51dGlsLm1hcChkYXRhLnZhbHVlcywgZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAodmFsdWUgLSBzdWJWYWx1ZSkgKiBmbGFnIC8gZGlzdGFuY2U7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBwZXJjZW50VmFsdWVzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgc2NhbGUgZGlzdGFuY2UgZnJvbSB6ZXJvIHBvaW50LlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzaXplIGNoYXJ0IHNpemUgKHdpZHRoIG9yIGhlaWdodClcbiAgICAgKiBAcGFyYW0ge3ttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fSBzY2FsZSBzY2FsZVxuICAgICAqIEByZXR1cm5zIHt7dG9NYXg6IG51bWJlciwgdG9NaW46IG51bWJlcn19IHBpeGVsIGRpc3RhbmNlXG4gICAgICovXG4gICAgZ2V0U2NhbGVEaXN0YW5jZUZyb21aZXJvUG9pbnQ6IGZ1bmN0aW9uKHNpemUsIHNjYWxlKSB7XG4gICAgICAgIHZhciBtaW4gPSBzY2FsZS5taW4sXG4gICAgICAgICAgICBtYXggPSBzY2FsZS5tYXgsXG4gICAgICAgICAgICBkaXN0YW5jZSA9IG1heCAtIG1pbixcbiAgICAgICAgICAgIHRvTWF4ID0gMCxcbiAgICAgICAgICAgIHRvTWluID0gMDtcblxuICAgICAgICBpZiAobWluIDwgMCAmJiBtYXggPiAwKSB7XG4gICAgICAgICAgICB0b01heCA9IChkaXN0YW5jZSArIG1pbikgLyBkaXN0YW5jZSAqIHNpemU7XG4gICAgICAgICAgICB0b01pbiA9IChkaXN0YW5jZSAtIG1heCkgLyBkaXN0YW5jZSAqIHNpemU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdG9NYXg6IHRvTWF4LFxuICAgICAgICAgICAgdG9NaW46IHRvTWluXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE9uIG1vdXNlb3ZlciBldmVudCBoYW5kbGVyIGZvciBzZXJpZXMgYXJlYVxuICAgICAqIEBwYXJhbSB7TW91c2VFdmVudH0gZSBtb3VzZSBldmVudFxuICAgICAqL1xuICAgIG9uTW91c2VvdmVyOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciBlbFRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudCxcbiAgICAgICAgICAgIGdyb3VwSW5kZXgsIGluZGV4O1xuXG4gICAgICAgIGlmIChlbFRhcmdldC5jbGFzc05hbWUgIT09IFNFUklFU19MQUJFTF9DTEFTU19OQU1FKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBncm91cEluZGV4ID0gZWxUYXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWdyb3VwLWluZGV4Jyk7XG4gICAgICAgIGluZGV4ID0gZWxUYXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWluZGV4Jyk7XG4gICAgICAgIGlmIChncm91cEluZGV4ID09PSAnLTEnIHx8IGluZGV4ID09PSAnLTEnKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pbkNhbGxiYWNrKHRoaXMuX2dldEJvdW5kKGdyb3VwSW5kZXgsIGluZGV4KSwgZ3JvdXBJbmRleCArICctJyArIGluZGV4KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogT24gbW91c2VvdXQgZXZlbnQgaGFuZGxlciBmb3Igc2VyaWVzIGFyZWFcbiAgICAgKiBAcGFyYW0ge01vdXNlRXZlbnR9IGUgbW91c2UgZXZlbnRcbiAgICAgKi9cbiAgICBvbk1vdXNlb3V0OiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciBlbFRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudCxcbiAgICAgICAgICAgIGdyb3VwSW5kZXgsIGluZGV4O1xuXG4gICAgICAgIGlmIChlbFRhcmdldC5jbGFzc05hbWUgIT09IFNFUklFU19MQUJFTF9DTEFTU19OQU1FKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBncm91cEluZGV4ID0gZWxUYXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWdyb3VwLWluZGV4Jyk7XG4gICAgICAgIGluZGV4ID0gZWxUYXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWluZGV4Jyk7XG5cbiAgICAgICAgaWYgKGdyb3VwSW5kZXggPT09ICctMScgfHwgaW5kZXggPT09ICctMScpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMub3V0Q2FsbGJhY2soZ3JvdXBJbmRleCArICctJyArIGluZGV4KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGV2ZW50XG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKi9cbiAgICBhdHRhY2hFdmVudDogZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgZXZlbnQuYmluZEV2ZW50KCdtb3VzZW92ZXInLCBlbCwgbmUudXRpbC5iaW5kKHRoaXMub25Nb3VzZW92ZXIsIHRoaXMpKTtcbiAgICAgICAgZXZlbnQuYmluZEV2ZW50KCdtb3VzZW91dCcsIGVsLCBuZS51dGlsLmJpbmQodGhpcy5vbk1vdXNlb3V0LCB0aGlzKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGwgc2hvd0RvdCBmdW5jdGlvbiBvZiBncmFwaFJlbmRlcmVyLlxuICAgICAqIEBwYXJhbSB7e2dyb3VwSW5kZXg6IG51bWJlciwgaW5kZXg6IG51bWJlcn19IGRhdGEgZGF0YVxuICAgICAqL1xuICAgIG9uU2hvd0FuaW1hdGlvbjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBpZiAoIXRoaXMuZ3JhcGhSZW5kZXJlci5zaG93QW5pbWF0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ncmFwaFJlbmRlcmVyLnNob3dBbmltYXRpb24uY2FsbCh0aGlzLmdyYXBoUmVuZGVyZXIsIGRhdGEpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxsIGhpZGVEb3QgZnVuY3Rpb24gb2YgZ3JhcGhSZW5kZXJlci5cbiAgICAgKiBAcGFyYW0ge3tncm91cEluZGV4OiBudW1iZXIsIGluZGV4OiBudW1iZXJ9fSBkYXRhIGRhdGFcbiAgICAgKi9cbiAgICBvbkhpZGVBbmltYXRpb246IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgaWYgKCF0aGlzLmdyYXBoUmVuZGVyZXIuaGlkZUFuaW1hdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ3JhcGhSZW5kZXJlci5oaWRlQW5pbWF0aW9uLmNhbGwodGhpcy5ncmFwaFJlbmRlcmVyLCBkYXRhKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQW5pbWF0ZSBjb21wb25lbnRcbiAgICAgKi9cbiAgICBhbmltYXRlQ29tcG9uZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuZ3JhcGhSZW5kZXJlci5hbmltYXRlKSB7XG4gICAgICAgICAgICB0aGlzLmdyYXBoUmVuZGVyZXIuYW5pbWF0ZShuZS51dGlsLmJpbmQodGhpcy5zaG93U2VyaWVzTGFiZWxBcmVhLCB0aGlzKSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBodG1sIGFib3V0IHNlcmllcyBsYWJlbFxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBwb3NpdGlvbiBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSB2YWx1ZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBncm91cEluZGV4IGdyb3VwIGluZGV4XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IGluZGV4XG4gICAgICogQHJldHVybnMge3N0cmluZ30gaHRtbCBzdHJpbmdcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlU2VyaWVzTGFiZWxIdG1sOiBmdW5jdGlvbihwb3NpdGlvbiwgdmFsdWUsIGdyb3VwSW5kZXgsIGluZGV4KSB7XG4gICAgICAgIHZhciBjc3NPYmogPSBuZS51dGlsLmV4dGVuZChwb3NpdGlvbiwgdGhpcy50aGVtZS5sYWJlbCk7XG4gICAgICAgIHJldHVybiBzZXJpZXNUZW1wbGF0ZS50cGxTZXJpZXNMYWJlbCh7XG4gICAgICAgICAgICBjc3NUZXh0OiBzZXJpZXNUZW1wbGF0ZS50cGxDc3NUZXh0KGNzc09iaiksXG4gICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICBncm91cEluZGV4OiBncm91cEluZGV4LFxuICAgICAgICAgICAgaW5kZXg6IGluZGV4XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTaG93IHNlcmllcyBsYWJlbCBhcmVhLlxuICAgICAqL1xuICAgIHNob3dTZXJpZXNMYWJlbEFyZWE6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoKCF0aGlzLm9wdGlvbnMuc2hvd0xhYmVsICYmICF0aGlzLm9wdGlvbnMubGVnZW5kVHlwZSkgfHwgIXRoaXMuZWxTZXJpZXNMYWJlbEFyZWEpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGRvbS5hZGRDbGFzcyh0aGlzLmVsU2VyaWVzTGFiZWxBcmVhLCAnc2hvdycpO1xuXG4gICAgICAgIChuZXcgbmUuY29tcG9uZW50LkVmZmVjdHMuRmFkZSh7XG4gICAgICAgICAgICBlbGVtZW50OiB0aGlzLmVsU2VyaWVzTGFiZWxBcmVhLFxuICAgICAgICAgICAgZHVyYXRpb246IDMwMFxuICAgICAgICB9KSkuYWN0aW9uKHtcbiAgICAgICAgICAgIHN0YXJ0OiAwLFxuICAgICAgICAgICAgZW5kOiAxLFxuICAgICAgICAgICAgY29tcGxldGU6IGZ1bmN0aW9uKCkge31cbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5cbm5lLnV0aWwuQ3VzdG9tRXZlbnRzLm1peGluKFNlcmllcyk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2VyaWVzO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFRoaXMgaXMgdGVtcGxhdGVzIG9mIHNlcmllcy5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbnZhciB0ZW1wbGF0ZU1ha2VyID0gcmVxdWlyZSgnLi4vaGVscGVycy90ZW1wbGF0ZU1ha2VyLmpzJyk7XG5cbnZhciB0YWdzID0ge1xuICAgIEhUTUxfU0VSSUVTX0xBQkVMOiAnPGRpdiBjbGFzcz1cIm5lLWNoYXJ0LXNlcmllcy1sYWJlbFwiIHN0eWxlPVwie3sgY3NzVGV4dCB9fVwiIGRhdGEtZ3JvdXAtaW5kZXg9XCJ7eyBncm91cEluZGV4IH19XCIgZGF0YS1pbmRleD1cInt7IGluZGV4IH19XCI+e3sgdmFsdWUgfX08L2Rpdj4nLFxuICAgIFRFWFRfQ1NTX1RFWFQ6ICdsZWZ0Ont7IGxlZnQgfX1weDt0b3A6e3sgdG9wIH19cHg7Zm9udC1mYW1pbHk6e3sgZm9udEZhbWlseSB9fTtmb250LXNpemU6e3sgZm9udFNpemUgfX1weCdcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHRwbFNlcmllc0xhYmVsOiB0ZW1wbGF0ZU1ha2VyLnRlbXBsYXRlKHRhZ3MuSFRNTF9TRVJJRVNfTEFCRUwpLFxuICAgIHRwbENzc1RleHQ6IHRlbXBsYXRlTWFrZXIudGVtcGxhdGUodGFncy5URVhUX0NTU19URVhUKVxufTtcbiIsInZhciBERUZBVUxUX0NPTE9SID0gJyMwMDAwMDAnLFxuICAgIERFRkFVTFRfQkFDS0dST1VORCA9ICcjZmZmZmZmJyxcbiAgICBFTVBUWV9GT05UID0gJycsXG4gICAgREVGQVVMVF9BWElTID0ge1xuICAgICAgICB0aWNrQ29sb3I6IERFRkFVTFRfQ09MT1IsXG4gICAgICAgIHRpdGxlOiB7XG4gICAgICAgICAgICBmb250U2l6ZTogMTIsXG4gICAgICAgICAgICBmb250RmFtaWx5OiBFTVBUWV9GT05ULFxuICAgICAgICAgICAgY29sb3I6IERFRkFVTFRfQ09MT1JcbiAgICAgICAgfSxcbiAgICAgICAgbGFiZWw6IHtcbiAgICAgICAgICAgIGZvbnRTaXplOiAxMixcbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IEVNUFRZX0ZPTlQsXG4gICAgICAgICAgICBjb2xvcjogREVGQVVMVF9DT0xPUlxuICAgICAgICB9XG4gICAgfTtcblxudmFyIGRlZmF1bHRUaGVtZSA9IHtcbiAgICBjaGFydDoge1xuICAgICAgICBiYWNrZ3JvdW5kOiBERUZBVUxUX0JBQ0tHUk9VTkQsXG4gICAgICAgIGZvbnRGYW1pbHk6ICdWZXJkYW5hJ1xuICAgIH0sXG4gICAgdGl0bGU6IHtcbiAgICAgICAgZm9udFNpemU6IDE4LFxuICAgICAgICBmb250RmFtaWx5OiBFTVBUWV9GT05ULFxuICAgICAgICBjb2xvcjogREVGQVVMVF9DT0xPUlxuICAgIH0sXG4gICAgeUF4aXM6IERFRkFVTFRfQVhJUyxcbiAgICB4QXhpczogREVGQVVMVF9BWElTLFxuICAgIHBsb3Q6IHtcbiAgICAgICAgbGluZUNvbG9yOiAnI2RkZGRkZCcsXG4gICAgICAgIGJhY2tncm91bmQ6ICcjZmZmZmZmJ1xuICAgIH0sXG4gICAgc2VyaWVzOiB7XG4gICAgICAgIGxhYmVsOiB7XG4gICAgICAgICAgICBmb250U2l6ZTogMTEsXG4gICAgICAgICAgICBmb250RmFtaWx5OiBFTVBUWV9GT05ULFxuICAgICAgICAgICAgY29sb3I6IERFRkFVTFRfQ09MT1JcbiAgICAgICAgfSxcbiAgICAgICAgY29sb3JzOiBbJyNhYzQxNDInLCAnI2QyODQ0NScsICcjZjRiZjc1JywgJyM5MGE5NTknLCAnIzc1YjVhYScsICcjNmE5ZmI1JywgJyNhYTc1OWYnLCAnIzhmNTUzNiddXG4gICAgfSxcbiAgICBsZWdlbmQ6IHtcbiAgICAgICAgbGFiZWw6IHtcbiAgICAgICAgICAgIGZvbnRTaXplOiAxMixcbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IEVNUFRZX0ZPTlQsXG4gICAgICAgICAgICBjb2xvcjogREVGQVVMVF9DT0xPUlxuICAgICAgICB9XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBkZWZhdWx0VGhlbWU7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgVG9vbHRpcCBjb21wb25lbnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBjaGFydENvbnN0ID0gcmVxdWlyZSgnLi4vY29uc3QuanMnKSxcbiAgICBkb20gPSByZXF1aXJlKCcuLi9oZWxwZXJzL2RvbUhhbmRsZXIuanMnKSxcbiAgICByZW5kZXJVdGlsID0gcmVxdWlyZSgnLi4vaGVscGVycy9yZW5kZXJVdGlsLmpzJyksXG4gICAgZXZlbnQgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2V2ZW50TGlzdGVuZXIuanMnKSxcbiAgICB0ZW1wbGF0ZU1ha2VyID0gcmVxdWlyZSgnLi4vaGVscGVycy90ZW1wbGF0ZU1ha2VyLmpzJyksXG4gICAgdG9vbHRpcFRlbXBsYXRlID0gcmVxdWlyZSgnLi90b29sdGlwVGVtcGxhdGUuanMnKTtcblxudmFyIFRPT0xUSVBfR0FQID0gNSxcbiAgICBISURERU5fV0lEVEggPSAxLFxuICAgIFRPT0xUSVBfQ0xBU1NfTkFNRSA9ICduZS1jaGFydC10b29sdGlwJyxcbiAgICBISURFX0RFTEFZID0gMDtcblxudmFyIGNvbmNhdCA9IEFycmF5LnByb3RvdHlwZS5jb25jYXQ7XG5cbnZhciBUb29sdGlwID0gbmUudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIFRvb2x0aXAucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBUb29sdGlwIGNvbXBvbmVudC5cbiAgICAgKiBAY29uc3RydWN0cyBUb29sdGlwXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxudW1iZXI+fSBwYXJhbXMudmFsdWVzIGNvbnZlcnRlZCB2YWx1ZXNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXl9IHBhcmFtcy5sYWJlbHMgbGFiZWxzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5fSBwYXJhbXMubGVnZW5kTGFiZWxzIGxlZ2VuZCBsYWJlbHNcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwcmVmaXggdG9vbHRpcCBwcmVmaXhcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuYm91bmQgYXhpcyBib3VuZFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBheGlzIHRoZW1lXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIG5lLnV0aWwuZXh0ZW5kKHRoaXMsIHBhcmFtcyk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUb29sdGlwIHZpZXcgY2xhc3NOYW1lXG4gICAgICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNsYXNzTmFtZSA9ICduZS1jaGFydC10b29sdGlwLWFyZWEnO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgdG9vbHRpcC5cbiAgICAgKiBAcGFyYW0ge3twb3NpdGlvbjogb2JqZWN0fX0gYm91bmQgdG9vbHRpcCBib3VuZFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwcmVmaXggdG9vbHRpcCBpZCBwcmVmaXhcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHRvb2x0aXAgZWxlbWVudFxuICAgICAqL1xuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBlbCA9IGRvbS5jcmVhdGUoJ0RJVicsIHRoaXMuY2xhc3NOYW1lKSxcbiAgICAgICAgICAgIGJvdW5kID0gdGhpcy5ib3VuZDtcblxuICAgICAgICByZW5kZXJVdGlsLnJlbmRlclBvc2l0aW9uKGVsLCBib3VuZC5wb3NpdGlvbik7XG4gICAgICAgIGVsLmlubmVySFRNTCA9IHRoaXMuX21ha2VUb29sdGlwc0h0bWwoKTtcblxuICAgICAgICB0aGlzLmF0dGFjaEV2ZW50KGVsKTtcbiAgICAgICAgcmV0dXJuIGVsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHRvb2x0aXAgZGF0YS5cbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPG9iamVjdD59IHRvb2x0aXAgZGF0YVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VUb29sdGlwRGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBsYWJlbHMgPSB0aGlzLmxhYmVscyxcbiAgICAgICAgICAgIGdyb3VwVmFsdWVzID0gdGhpcy52YWx1ZXMsXG4gICAgICAgICAgICBsZWdlbmRMYWJlbHMgPSB0aGlzLmxlZ2VuZExhYmVscyxcbiAgICAgICAgICAgIHRvb2x0aXBEYXRhID0gbmUudXRpbC5tYXAoZ3JvdXBWYWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcywgZ3JvdXBJbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciBpdGVtcyA9IG5lLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpdGVtID0ge3ZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZ2VuZExhYmVsOiBsZWdlbmRMYWJlbHNbaW5kZXhdLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGdyb3VwSW5kZXggKyAnLScgKyBpbmRleFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBpZiAobGFiZWxzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmxhYmVsID0gbGFiZWxzW2dyb3VwSW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW1zO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBjb25jYXQuYXBwbHkoW10sIHRvb2x0aXBEYXRhKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBodG1sIG9mIHRvb2x0aXAuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGRhdGEgdG9vbHRpcCBkYXRhXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHByZWZpeCB0b29sdGlwIGlkIHByZWZpeFxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGh0bWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlVG9vbHRpcHNIdG1sOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnMsXG4gICAgICAgICAgICBwcmVmaXggPSB0aGlzLnByZWZpeCxcbiAgICAgICAgICAgIGRhdGEgPSB0aGlzLl9tYWtlVG9vbHRpcERhdGEoKSxcbiAgICAgICAgICAgIG9wdGlvblRlbXBsYXRlID0gb3B0aW9ucy50ZW1wbGF0ZSA/IG9wdGlvbnMudGVtcGxhdGUgOiAnJyxcbiAgICAgICAgICAgIHRwbE91dGVyID0gdG9vbHRpcFRlbXBsYXRlLnRwbFRvb2x0aXAsXG4gICAgICAgICAgICB0cGxUb29sdGlwID0gb3B0aW9uVGVtcGxhdGUgPyB0ZW1wbGF0ZU1ha2VyLnRlbXBsYXRlKG9wdGlvblRlbXBsYXRlKSA6IHRvb2x0aXBUZW1wbGF0ZS50cGxEZWZhdWx0VGVtcGxhdGUsXG4gICAgICAgICAgICBzdWZmaXggPSBvcHRpb25zLnN1ZmZpeCA/ICcmbmJzcDsnICsgb3B0aW9ucy5zdWZmaXggOiAnJyxcbiAgICAgICAgICAgIGh0bWwgPSBuZS51dGlsLm1hcChkYXRhLCBmdW5jdGlvbih0b29sdGlwRGF0YSkge1xuICAgICAgICAgICAgICAgIHZhciBpZCA9IHByZWZpeCArIHRvb2x0aXBEYXRhLmlkLFxuICAgICAgICAgICAgICAgICAgICB0b29sdGlwSHRtbDtcblxuICAgICAgICAgICAgICAgIHRvb2x0aXBEYXRhID0gbmUudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJycsXG4gICAgICAgICAgICAgICAgICAgIGxlZ2VuZExhYmVsOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICcnLFxuICAgICAgICAgICAgICAgICAgICBzdWZmaXg6IHN1ZmZpeFxuICAgICAgICAgICAgICAgIH0sIHRvb2x0aXBEYXRhKTtcbiAgICAgICAgICAgICAgICB0b29sdGlwSHRtbCA9IHRwbFRvb2x0aXAodG9vbHRpcERhdGEpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cGxPdXRlcih7XG4gICAgICAgICAgICAgICAgICAgIGlkOiBpZCxcbiAgICAgICAgICAgICAgICAgICAgaHRtbDogdG9vbHRpcEh0bWxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sIHRoaXMpLmpvaW4oJycpO1xuICAgICAgICByZXR1cm4gaHRtbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGluZGV4IGZyb20gaWRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgdG9vbHRpcCBpZFxuICAgICAqIEByZXR1cm5zIHthcnJheS48bnVtYmVyPn0gaW5kZXhlc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldEluZGV4RnJvbUlkOiBmdW5jdGlvbihpZCkge1xuICAgICAgICB2YXIgaWRzID0gaWQuc3BsaXQoJy0nKSxcbiAgICAgICAgICAgIHNsaWNlSW5kZXggPSBpZHMubGVuZ3RoIC0gMjtcbiAgICAgICAgcmV0dXJuIGlkcy5zbGljZShzbGljZUluZGV4KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmlyZSBjdXN0b20gZXZlbnQgc2hvd0FuaW1hdGlvbi5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgdG9vbHRpcCBpZFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2ZpcmVTaG93QW5pbWF0aW9uOiBmdW5jdGlvbihpZCkge1xuICAgICAgICB2YXIgaW5kZXhlcyA9IHRoaXMuX2dldEluZGV4RnJvbUlkKGlkKTtcbiAgICAgICAgdGhpcy5maXJlKCdzaG93QW5pbWF0aW9uJywge1xuICAgICAgICAgICAgZ3JvdXBJbmRleDogaW5kZXhlc1swXSxcbiAgICAgICAgICAgIGluZGV4OiBpbmRleGVzWzFdXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGaXJlIGN1c3RvbSBldmVudCBoaWRlQW5pbWF0aW9uLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpZCB0b29sdGlwIGlkXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZmlyZUhpZGVBbmltYXRpb246IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgIHZhciBpbmRleGVzID0gdGhpcy5fZ2V0SW5kZXhGcm9tSWQoaWQpO1xuICAgICAgICB0aGlzLmZpcmUoJ2hpZGVBbmltYXRpb24nLCB7XG4gICAgICAgICAgICBncm91cEluZGV4OiBpbmRleGVzWzBdLFxuICAgICAgICAgICAgaW5kZXg6IGluZGV4ZXNbMV1cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE9uIG1vdXNlb3ZlciBldmVudCBoYW5kbGVyIGZvciB0b29sdGlwIGFyZWFcbiAgICAgKiBAcGFyYW0ge01vdXNlRXZlbnR9IGUgbW91c2UgZXZlbnRcbiAgICAgKi9cbiAgICBvbk1vdXNlb3ZlcjogZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgZWxUYXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQsXG4gICAgICAgICAgICBpZDtcblxuICAgICAgICBpZiAoIWRvbS5oYXNDbGFzcyhlbFRhcmdldCwgVE9PTFRJUF9DTEFTU19OQU1FKSkge1xuICAgICAgICAgICAgZWxUYXJnZXQgPSBkb20uZmluZFBhcmVudEJ5Q2xhc3MoZWxUYXJnZXQsIFRPT0xUSVBfQ0xBU1NfTkFNRSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNob3dlZElkID0gaWQgPSBlbFRhcmdldC5pZDtcbiAgICAgICAgdGhpcy5fZmlyZVNob3dBbmltYXRpb24oaWQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBPbiBtb3VzZW91dCBldmVudCBoYW5kbGVyIGZvciB0b29sdGlwIGFyZWFcbiAgICAgKiBAcGFyYW0ge01vdXNlRXZlbnR9IGUgbW91c2UgZXZlbnRcbiAgICAgKi9cbiAgICBvbk1vdXNlb3V0OiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciBlbFRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudCxcbiAgICAgICAgICAgIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgaW5kZXhlcztcblxuICAgICAgICBpZiAoIWRvbS5oYXNDbGFzcyhlbFRhcmdldCwgVE9PTFRJUF9DTEFTU19OQU1FKSkge1xuICAgICAgICAgICAgZWxUYXJnZXQgPSBkb20uZmluZFBhcmVudEJ5Q2xhc3MoZWxUYXJnZXQsIFRPT0xUSVBfQ0xBU1NfTkFNRSk7XG4gICAgICAgIH1cblxuICAgICAgICBpbmRleGVzID0gdGhpcy5fZ2V0SW5kZXhGcm9tSWQoZWxUYXJnZXQuaWQpO1xuXG4gICAgICAgIHRoaXMuX2hpZGVUb29sdGlwKGVsVGFyZ2V0LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoYXQuZmlyZSgnaGlkZUFuaW1hdGlvbicsIHtcbiAgICAgICAgICAgICAgICBncm91cEluZGV4OiBpbmRleGVzWzBdLFxuICAgICAgICAgICAgICAgIGluZGV4OiBpbmRleGVzWzFdXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGN1bGF0ZSB0b29sdGlwIHBvc2l0aW9uIGFib3V0IG5vdCBiYXIgY2hhcnQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge3tib3VuZDogb2JqZWN0fX0gcGFyYW1zLmRhdGEgZ3JhcGggaW5mb3JtYXRpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gcGFyYW1zLmRpbWVuc2lvbiB0b29sdGlwIGRpbWVuc2lvblxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5wb3NpdGlvbk9wdGlvbiBwb3NpdGlvbiBvcHRpb24gKGV4OiAnbGVmdCB0b3AnKVxuICAgICAqIEByZXR1cm5zIHt7dG9wOiBudW1iZXIsIGxlZnQ6IG51bWJlcn19IHBvc2l0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2FsY3VsYXRlVG9vbHRpcFBvc2l0aW9uQWJvdXROb3RCYXJDaGFydDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBib3VuZCA9IHBhcmFtcy5ib3VuZCxcbiAgICAgICAgICAgIGFkZFBvc2l0aW9uID0gcGFyYW1zLmFkZFBvc2l0aW9uLFxuICAgICAgICAgICAgbWludXNXaWR0aCA9IHBhcmFtcy5kaW1lbnNpb24ud2lkdGggLSAoYm91bmQud2lkdGggfHwgMCksXG4gICAgICAgICAgICBsaW5lR2FwID0gYm91bmQud2lkdGggPyAwIDogVE9PTFRJUF9HQVAsXG4gICAgICAgICAgICBwb3NpdGlvbk9wdGlvbiA9IHBhcmFtcy5wb3NpdGlvbk9wdGlvbiB8fCAnJyxcbiAgICAgICAgICAgIHRvb2x0aXBIZWlnaHQgPSBwYXJhbXMuZGltZW5zaW9uLmhlaWdodCxcbiAgICAgICAgICAgIHJlc3VsdCA9IHt9O1xuICAgICAgICByZXN1bHQubGVmdCA9IGJvdW5kLmxlZnQgKyAoSElEREVOX1dJRFRIICogMikgKyBhZGRQb3NpdGlvbi5sZWZ0O1xuICAgICAgICByZXN1bHQudG9wID0gYm91bmQudG9wIC0gdG9vbHRpcEhlaWdodCArIGFkZFBvc2l0aW9uLnRvcDtcblxuICAgICAgICBpZiAocG9zaXRpb25PcHRpb24uaW5kZXhPZignbGVmdCcpID4gLTEpIHtcbiAgICAgICAgICAgIHJlc3VsdC5sZWZ0IC09IG1pbnVzV2lkdGggKyBsaW5lR2FwO1xuICAgICAgICB9IGVsc2UgaWYgKHBvc2l0aW9uT3B0aW9uLmluZGV4T2YoJ2NlbnRlcicpID4gLTEpIHtcbiAgICAgICAgICAgIHJlc3VsdC5sZWZ0IC09IG1pbnVzV2lkdGggLyAyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0LmxlZnQgKz0gbGluZUdhcDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwb3NpdGlvbk9wdGlvbi5pbmRleE9mKCdib3R0b20nKSA+IC0xKSB7XG4gICAgICAgICAgICByZXN1bHQudG9wICs9IHRvb2x0aXBIZWlnaHQgLSBISURERU5fV0lEVEggKyBsaW5lR2FwO1xuICAgICAgICB9IGVsc2UgaWYgKHBvc2l0aW9uT3B0aW9uLmluZGV4T2YoJ21pZGRsZScpID4gLTEpIHtcbiAgICAgICAgICAgIHJlc3VsdC50b3AgKz0gdG9vbHRpcEhlaWdodCAvIDI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQudG9wIC09IFRPT0xUSVBfR0FQICsgSElEREVOX1dJRFRIO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlIHRvb2x0aXAgcG9zaXRpb24gYWJvdXQgYmFyIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHt7Ym91bmQ6IG9iamVjdH19IHBhcmFtcy5kYXRhIGdyYXBoIGluZm9ybWF0aW9uXG4gICAgICogICAgICBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IHBhcmFtcy5kaW1lbnNpb24gdG9vbHRpcCBkaW1lbnNpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMucG9zaXRpb25PcHRpb24gcG9zaXRpb24gb3B0aW9uIChleDogJ2xlZnQgdG9wJylcbiAgICAgKiBAcmV0dXJucyB7e3RvcDogbnVtYmVyLCBsZWZ0OiBudW1iZXJ9fSBwb3NpdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NhbGN1bGF0ZVRvb2x0aXBQb3NpdGlvbkFib3V0QmFyQ2hhcnQ6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgYm91bmQgPSBwYXJhbXMuYm91bmQsXG4gICAgICAgICAgICBhZGRQb3NpdGlvbiA9IHBhcmFtcy5hZGRQb3NpdGlvbixcbiAgICAgICAgICAgIG1pbnVzSGVpZ2h0ID0gcGFyYW1zLmRpbWVuc2lvbi5oZWlnaHQgLSAoYm91bmQuaGVpZ2h0IHx8IDApLFxuICAgICAgICAgICAgcG9zaXRpb25PcHRpb24gPSBwYXJhbXMucG9zaXRpb25PcHRpb24gfHwgJycsXG4gICAgICAgICAgICB0b29sdGlwV2lkdGggPSBwYXJhbXMuZGltZW5zaW9uLndpZHRoLFxuICAgICAgICAgICAgcmVzdWx0ID0ge307XG5cbiAgICAgICAgcmVzdWx0LmxlZnQgPSBib3VuZC5sZWZ0ICsgYm91bmQud2lkdGggKyBhZGRQb3NpdGlvbi5sZWZ0O1xuICAgICAgICByZXN1bHQudG9wID0gYm91bmQudG9wICsgYWRkUG9zaXRpb24udG9wO1xuXG4gICAgICAgIC8vIFRPRE8gOiBwb3NpdGlvbk9wdGlvbnPsnYQg6rCd7LK066GcIOunjOuTpOyWtOyEnCDqsoDsgqztlZjrj4TroZ0g67OA6rK97ZWY6riwIGV4KSBwb3NpdGlvbk9wdGlvbi5sZWZ0ID0gdHJ1ZVxuICAgICAgICBpZiAocG9zaXRpb25PcHRpb24uaW5kZXhPZignbGVmdCcpID4gLTEpIHtcbiAgICAgICAgICAgIHJlc3VsdC5sZWZ0IC09IHRvb2x0aXBXaWR0aDtcbiAgICAgICAgfSBlbHNlIGlmIChwb3NpdGlvbk9wdGlvbi5pbmRleE9mKCdjZW50ZXInKSA+IC0xKSB7XG4gICAgICAgICAgICByZXN1bHQubGVmdCAtPSB0b29sdGlwV2lkdGggLyAyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0LmxlZnQgKz0gVE9PTFRJUF9HQVA7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocG9zaXRpb25PcHRpb24uaW5kZXhPZigndG9wJykgPiAtMSkge1xuICAgICAgICAgICAgcmVzdWx0LnRvcCAtPSBtaW51c0hlaWdodCArIEhJRERFTl9XSURUSDtcbiAgICAgICAgfSBlbHNlIGlmIChwb3NpdGlvbk9wdGlvbi5pbmRleE9mKCdtaWRkbGUnKSA+IC0xKSB7XG4gICAgICAgICAgICByZXN1bHQudG9wIC09IG1pbnVzSGVpZ2h0IC8gMjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdC50b3AgLT0gSElEREVOX1dJRFRIICogMjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGN1bGF0ZSB0b29sdGlwIHBvc2l0aW9uLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBwYXJhbXMuYm91bmQgZ3JhcGggYm91bmRcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMuY2hhcnRUeXBlIGNoYXJ0IHR5cGVcbiAgICAgKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gcGFyYW1zLmFsbG93TmVnYXRpdmVUb29sdGlwIHdoZXRoZXIgYWxsb3cgbmVnYXRpdmUgdG9vbHRpcCBvciBub3RcbiAgICAgKiAgICAgIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gcGFyYW1zLmRpbWVuc2lvbiB0b29sdGlwIGRpbWVuc2lvblxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5wb3NpdGlvbk9wdGlvbiBwb3NpdGlvbiBvcHRpb24gKGV4OiAnbGVmdCB0b3AnKVxuICAgICAqIEByZXR1cm5zIHt7dG9wOiBudW1iZXIsIGxlZnQ6IG51bWJlcn19IHBvc2l0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2FsY3VsYXRlVG9vbHRpcFBvc2l0aW9uOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHt9LFxuICAgICAgICAgICAgc2l6ZVR5cGUsIHBvc2l0aW9uVHlwZSwgYWRkUGFkZGluZztcbiAgICAgICAgaWYgKHBhcmFtcy5jaGFydFR5cGUgPT09IGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9CQVIpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuX2NhbGN1bGF0ZVRvb2x0aXBQb3NpdGlvbkFib3V0QmFyQ2hhcnQocGFyYW1zKTtcbiAgICAgICAgICAgIHNpemVUeXBlID0gJ3dpZHRoJztcbiAgICAgICAgICAgIHBvc2l0aW9uVHlwZSA9ICdsZWZ0JztcbiAgICAgICAgICAgIGFkZFBhZGRpbmcgPSAxO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5fY2FsY3VsYXRlVG9vbHRpcFBvc2l0aW9uQWJvdXROb3RCYXJDaGFydChwYXJhbXMpO1xuICAgICAgICAgICAgc2l6ZVR5cGUgPSAnaGVpZ2h0JztcbiAgICAgICAgICAgIHBvc2l0aW9uVHlwZSA9ICd0b3AnO1xuICAgICAgICAgICAgYWRkUGFkZGluZyA9IC0xO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhcmFtcy5hbGxvd05lZ2F0aXZlVG9vbHRpcCkge1xuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5fbW92ZVRvU3ltbWV0cnkocmVzdWx0LCB7XG4gICAgICAgICAgICAgICAgYm91bmQ6IHBhcmFtcy5ib3VuZCxcbiAgICAgICAgICAgICAgICBpZDogcGFyYW1zLmlkLFxuICAgICAgICAgICAgICAgIGRpbWVuc2lvbjogcGFyYW1zLmRpbWVuc2lvbixcbiAgICAgICAgICAgICAgICBzaXplVHlwZTogc2l6ZVR5cGUsXG4gICAgICAgICAgICAgICAgcG9zaXRpb25UeXBlOiBwb3NpdGlvblR5cGUsXG4gICAgICAgICAgICAgICAgYWRkUGFkZGluZzogYWRkUGFkZGluZ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHZhbHVlIGJ5IGlkLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpZCB0b29sdGlwIGlkXG4gICAgICogQHJldHVybnMge251bWJlcn0gcmVzdWx0IHZhbHVlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0VmFsdWVCeUlkOiBmdW5jdGlvbihpZCkge1xuICAgICAgICB2YXIgaW5kZXhlcyA9IHRoaXMuX2dldEluZGV4RnJvbUlkKGlkKSxcbiAgICAgICAgICAgIHZhbHVlID0gdGhpcy52YWx1ZXNbaW5kZXhlc1swXV1baW5kZXhlc1sxXV07XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTW92ZSB0byBzeW1tZXRyeS5cbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gcG9zaXRpb24gdG9vbHRpcCBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBwYXJhbXMuYm91bmQgZ3JhcGggYm91bmRcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMuaWQgdG9vbHRpcCBpZFxuICAgICAqICAgICAgQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBwYXJhbXMuZGltZW5zaW9uIHRvb2x0aXAgZGltZW5zaW9uXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLnNpemVUeXBlIHNpemUgdHlwZSAod2lkdGggb3IgaGVpZ2h0KVxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5wb3NpdGlvblR5cGUgcG9zaXRpb24gdHlwZSAobGVmdCBvciB0b3ApXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmFkZFBhZGRpbmcgYWRkIHBhZGRpbmdcbiAgICAgKiBAcmV0dXJucyB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBtb3ZlZCBwb3NpdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21vdmVUb1N5bW1ldHJ5OiBmdW5jdGlvbihwb3NpdGlvbiwgcGFyYW1zKSB7XG4gICAgICAgIHZhciBib3VuZCA9IHBhcmFtcy5ib3VuZCxcbiAgICAgICAgICAgIHNpemVUeXBlID0gcGFyYW1zLnNpemVUeXBlLFxuICAgICAgICAgICAgcG9zaXRpb25UeXBlID0gcGFyYW1zLnBvc2l0aW9uVHlwZSxcbiAgICAgICAgICAgIHZhbHVlID0gdGhpcy5fZ2V0VmFsdWVCeUlkKHBhcmFtcy5pZCksXG4gICAgICAgICAgICBjZW50ZXI7XG5cbiAgICAgICAgaWYgKHZhbHVlIDwgMCkge1xuICAgICAgICAgICAgY2VudGVyID0gYm91bmRbcG9zaXRpb25UeXBlXSArIChib3VuZFtzaXplVHlwZV0gLyAyKSArIChwYXJhbXMuYWRkUGFkZGluZyB8fCAwKTtcbiAgICAgICAgICAgIHBvc2l0aW9uW3Bvc2l0aW9uVHlwZV0gPSBwb3NpdGlvbltwb3NpdGlvblR5cGVdIC0gKHBvc2l0aW9uW3Bvc2l0aW9uVHlwZV0gLSBjZW50ZXIpICogMiAtIHBhcmFtcy5kaW1lbnNpb25bc2l6ZVR5cGVdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBvc2l0aW9uO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvblNob3cgaXMgY2FsbGJhY2sgb2YgY3VzdG9tIGV2ZW50IHNob3dUb29sdGlwIGZvciBTZXJpZXNWaWV3LlxuICAgICAqIEBwYXJhbSB7e2lkOiBzdHJpbmcsIGJvdW5kOiBvYmplY3R9fSBwYXJhbXMgdG9vbHRpcCBkYXRhXG4gICAgICovXG4gICAgb25TaG93OiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGVsVG9vbHRpcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHBhcmFtcy5pZCksXG4gICAgICAgICAgICBhZGRQb3NpdGlvbiA9IG5lLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgICAgICAgIHRvcDogMFxuICAgICAgICAgICAgfSwgdGhpcy5vcHRpb25zLmFkZFBvc2l0aW9uKSxcbiAgICAgICAgICAgIHBvc2l0aW9uT3B0aW9uID0gdGhpcy5vcHRpb25zLnBvc2l0aW9uIHx8ICcnLFxuICAgICAgICAgICAgcG9zaXRpb247XG5cbiAgICAgICAgaWYgKHRoaXMuc2hvd2VkSWQpIHtcbiAgICAgICAgICAgIGRvbS5yZW1vdmVDbGFzcyhlbFRvb2x0aXAsICdzaG93Jyk7XG4gICAgICAgICAgICB0aGlzLl9maXJlSGlkZUFuaW1hdGlvbih0aGlzLnNob3dlZElkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2hvd2VkSWQgPSBwYXJhbXMuaWQ7XG4gICAgICAgIGRvbS5hZGRDbGFzcyhlbFRvb2x0aXAsICdzaG93Jyk7XG5cbiAgICAgICAgcG9zaXRpb24gPSB0aGlzLl9jYWxjdWxhdGVUb29sdGlwUG9zaXRpb24obmUudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgZGltZW5zaW9uOiB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IGVsVG9vbHRpcC5vZmZzZXRXaWR0aCxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IGVsVG9vbHRpcC5vZmZzZXRIZWlnaHRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhZGRQb3NpdGlvbjogYWRkUG9zaXRpb24sXG4gICAgICAgICAgICBwb3NpdGlvbk9wdGlvbjogcG9zaXRpb25PcHRpb24gfHwgJydcbiAgICAgICAgfSwgcGFyYW1zKSk7XG5cbiAgICAgICAgZWxUb29sdGlwLnN0eWxlLmNzc1RleHQgPSBbXG4gICAgICAgICAgICByZW5kZXJVdGlsLmNvbmNhdFN0cignbGVmdDonLCBwb3NpdGlvbi5sZWZ0LCAncHgnKSxcbiAgICAgICAgICAgIHJlbmRlclV0aWwuY29uY2F0U3RyKCd0b3A6JywgcG9zaXRpb24udG9wLCAncHgnKVxuICAgICAgICBdLmpvaW4oJzsnKTtcblxuICAgICAgICB0aGlzLl9maXJlU2hvd0FuaW1hdGlvbihwYXJhbXMuaWQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvbkhpZGUgaXMgY2FsbGJhY2sgb2YgY3VzdG9tIGV2ZW50IGhpZGVUb29sdGlwIGZvciBTZXJpZXNWaWV3XG4gICAgICogQHBhcmFtIHt7aWQ6IHN0cmluZ319IGRhdGEgdG9vbHRpcCBkYXRhXG4gICAgICovXG4gICAgb25IaWRlOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBlbFRvb2x0aXAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChkYXRhLmlkKSxcbiAgICAgICAgICAgIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgIHRoaXMuX2hpZGVUb29sdGlwKGVsVG9vbHRpcCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgaW5kZXhlcyA9IHRoYXQuX2dldEluZGV4RnJvbUlkKGRhdGEuaWQpO1xuXG4gICAgICAgICAgICB0aGF0LmZpcmUoJ2hpZGVBbmltYXRpb24nLCB7XG4gICAgICAgICAgICAgICAgZ3JvdXBJbmRleDogaW5kZXhlc1swXSxcbiAgICAgICAgICAgICAgICBpbmRleDogaW5kZXhlc1sxXVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGRhdGEgPSBudWxsO1xuICAgICAgICAgICAgZWxUb29sdGlwID0gbnVsbDtcbiAgICAgICAgICAgIHRoYXQgPSBudWxsO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSGlkZSB0b29sdGlwLlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsVG9vbHRpcCB0b29sdGlwIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayBjYWxsYmFja1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2hpZGVUb29sdGlwOiBmdW5jdGlvbihlbFRvb2x0aXAsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgZGVsZXRlIHRoaXMuc2hvd2VkSWQ7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAodGhhdC5zaG93ZWRJZCA9PT0gZWxUb29sdGlwLmlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkb20ucmVtb3ZlQ2xhc3MoZWxUb29sdGlwLCAnc2hvdycpO1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhhdCA9IG51bGw7XG4gICAgICAgIH0sIEhJREVfREVMQVkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggZXZlbnRcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqL1xuICAgIGF0dGFjaEV2ZW50OiBmdW5jdGlvbihlbCkge1xuICAgICAgICBldmVudC5iaW5kRXZlbnQoJ21vdXNlb3ZlcicsIGVsLCBuZS51dGlsLmJpbmQodGhpcy5vbk1vdXNlb3ZlciwgdGhpcykpO1xuICAgICAgICBldmVudC5iaW5kRXZlbnQoJ21vdXNlb3V0JywgZWwsIG5lLnV0aWwuYmluZCh0aGlzLm9uTW91c2VvdXQsIHRoaXMpKTtcbiAgICB9XG59KTtcblxubmUudXRpbC5DdXN0b21FdmVudHMubWl4aW4oVG9vbHRpcCk7XG5cbm1vZHVsZS5leHBvcnRzID0gVG9vbHRpcDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBUaGlzIGlzIHRlbXBsYXRlcyBvZiB0b29sdGlwLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxudmFyIHRlbXBsYXRlTWFrZXIgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3RlbXBsYXRlTWFrZXIuanMnKTtcblxudmFyIHRhZ3MgPSB7XG4gICAgSFRNTF9UT09MVElQOiAnPGRpdiBjbGFzcz1cIm5lLWNoYXJ0LXRvb2x0aXBcIiBpZD1cInt7IGlkIH19XCI+e3sgaHRtbCB9fTwvZGl2PicsXG4gICAgSFRNTF9ERUZBVUxUX1RFTVBMQVRFOiAnPGRpdiBjbGFzcz1cIm5lLWNoYXJ0LWRlZmF1bHQtdG9vbHRpcFwiPicgK1xuICAgICAgICAnPGRpdj57eyBsYWJlbCB9fTwvZGl2PicgK1xuICAgICAgICAnPGRpdj4nICtcbiAgICAgICAgICAgICc8c3Bhbj57eyBsZWdlbmRMYWJlbCB9fTwvc3Bhbj46JyArXG4gICAgICAgICAgICAnJm5ic3A7PHNwYW4+e3sgdmFsdWUgfX08L3NwYW4+JyArXG4gICAgICAgICAgICAnPHNwYW4+e3sgc3VmZml4IH19PC9zcGFuPicgK1xuICAgICAgICAnPC9kaXY+JyArXG4gICAgJzwvZGl2Pidcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHRwbFRvb2x0aXA6IHRlbXBsYXRlTWFrZXIudGVtcGxhdGUodGFncy5IVE1MX1RPT0xUSVApLFxuICAgIHRwbERlZmF1bHRUZW1wbGF0ZTogdGVtcGxhdGVNYWtlci50ZW1wbGF0ZSh0YWdzLkhUTUxfREVGQVVMVF9URU1QTEFURSlcbn07XG4iXX0=
