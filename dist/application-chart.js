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
            tooltipPrefix: this.tooltipPrefix,
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXhlcy9heGlzLmpzIiwic3JjL2pzL2F4ZXMvYXhpc1RlbXBsYXRlLmpzIiwic3JjL2pzL2NoYXJ0LmpzIiwic3JjL2pzL2NoYXJ0cy9hcmVhQ2hhcnQuanMiLCJzcmMvanMvY2hhcnRzL2F4aXNUeXBlQmFzZS5qcyIsInNyYy9qcy9jaGFydHMvYmFyQ2hhcnQuanMiLCJzcmMvanMvY2hhcnRzL2NoYXJ0QmFzZS5qcyIsInNyYy9qcy9jaGFydHMvY29sdW1uQ2hhcnQuanMiLCJzcmMvanMvY2hhcnRzL2NvbWJvQ2hhcnQuanMiLCJzcmMvanMvY2hhcnRzL2xpbmVDaGFydC5qcyIsInNyYy9qcy9jaGFydHMvcGllQ2hhcnQuanMiLCJzcmMvanMvY2hhcnRzL3ZlcnRpY2FsVHlwZUJhc2UuanMiLCJzcmMvanMvY29kZS1zbmlwcGV0LXV0aWwuanMiLCJzcmMvanMvY29uc3QuanMiLCJzcmMvanMvZmFjdG9yaWVzL2NoYXJ0RmFjdG9yeS5qcyIsInNyYy9qcy9mYWN0b3JpZXMvcGx1Z2luRmFjdG9yeS5qcyIsInNyYy9qcy9mYWN0b3JpZXMvdGhlbWVGYWN0b3J5LmpzIiwic3JjL2pzL2hlbHBlcnMvYXhpc0RhdGFNYWtlci5qcyIsInNyYy9qcy9oZWxwZXJzL2JvdW5kc01ha2VyLmpzIiwic3JjL2pzL2hlbHBlcnMvY2FsY3VsYXRvci5qcyIsInNyYy9qcy9oZWxwZXJzL2RhdGFDb252ZXJ0ZXIuanMiLCJzcmMvanMvaGVscGVycy9kb21IYW5kbGVyLmpzIiwic3JjL2pzL2hlbHBlcnMvZXZlbnRMaXN0ZW5lci5qcyIsInNyYy9qcy9oZWxwZXJzL3JlbmRlclV0aWwuanMiLCJzcmMvanMvaGVscGVycy90ZW1wbGF0ZU1ha2VyLmpzIiwic3JjL2pzL2xlZ2VuZHMvbGVnZW5kLmpzIiwic3JjL2pzL2xlZ2VuZHMvbGVnZW5kVGVtcGxhdGUuanMiLCJzcmMvanMvcGxvdHMvcGxvdC5qcyIsInNyYy9qcy9wbG90cy9wbG90VGVtcGxhdGUuanMiLCJzcmMvanMvcGx1Z2lucy9wbHVnaW5SYXBoYWVsLmpzIiwic3JjL2pzL3BsdWdpbnMvcmFwaGFlbEFyZWFDaGFydC5qcyIsInNyYy9qcy9wbHVnaW5zL3JhcGhhZWxCYXJDaGFydC5qcyIsInNyYy9qcy9wbHVnaW5zL3JhcGhhZWxMaW5lQ2hhcnQuanMiLCJzcmMvanMvcGx1Z2lucy9yYXBoYWVsTGluZVR5cGVCYXNlLmpzIiwic3JjL2pzL3BsdWdpbnMvcmFwaGFlbFBpZUNoYXJ0LmpzIiwic3JjL2pzL3BsdWdpbnMvcmFwaGFlbFJlbmRlclV0aWwuanMiLCJzcmMvanMvcmVnaXN0ZXJDaGFydHMuanMiLCJzcmMvanMvcmVnaXN0ZXJUaGVtZXMuanMiLCJzcmMvanMvc2VyaWVzL2FyZWFDaGFydFNlcmllcy5qcyIsInNyYy9qcy9zZXJpZXMvYmFyQ2hhcnRTZXJpZXMuanMiLCJzcmMvanMvc2VyaWVzL2NvbHVtbkNoYXJ0U2VyaWVzLmpzIiwic3JjL2pzL3Nlcmllcy9saW5lQ2hhcnRTZXJpZXMuanMiLCJzcmMvanMvc2VyaWVzL2xpbmVUeXBlU2VyaWVzQmFzZS5qcyIsInNyYy9qcy9zZXJpZXMvcGllQ2hhcnRTZXJpZXMuanMiLCJzcmMvanMvc2VyaWVzL3Nlcmllcy5qcyIsInNyYy9qcy9zZXJpZXMvc2VyaWVzVGVtcGxhdGUuanMiLCJzcmMvanMvdGhlbWVzL2RlZmF1bHRUaGVtZS5qcyIsInNyYy9qcy90b29sdGlwcy90b29sdGlwLmpzIiwic3JjL2pzL3Rvb2x0aXBzL3Rvb2x0aXBUZW1wbGF0ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDalNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaG5CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1UkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdG5CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbGVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9KQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0WUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDclBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxYUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuY0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3ICBBeGlzIGNvbXBvbmVudC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGRvbSA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZG9tSGFuZGxlci5qcycpLFxuICAgIGNhbGN1bGF0b3IgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2NhbGN1bGF0b3IuanMnKSxcbiAgICByZW5kZXJVdGlsID0gcmVxdWlyZSgnLi4vaGVscGVycy9yZW5kZXJVdGlsLmpzJyksXG4gICAgYXhpc1RlbXBsYXRlID0gcmVxdWlyZSgnLi9heGlzVGVtcGxhdGUuanMnKTtcblxudmFyIFRJVExFX0FSRUFfV0lEVEhfUEFERElORyA9IDIwLFxuICAgIFZfTEFCRUxfUklHSFRfUEFERElORyA9IDEwO1xuXG52YXIgQXhpcyA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBBeGlzLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogQXhpcyBjb21wb25lbnQuXG4gICAgICogQGNvbnN0cnVjdHMgQXhpc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHt7XG4gICAgICogICAgICAgICAgbGFiZWxzOiBhcnJheS48c3RyaW5nPixcbiAgICAgKiAgICAgICAgICB0aWNrQ291bnQ6IG51bWJlcixcbiAgICAgKiAgICAgICAgICBpc0xhYmVsQXhpczogYm9vbGVhbixcbiAgICAgKiAgICAgICAgICBpc1ZlcnRpY2FsOiBib29sZWFuXG4gICAgICogICAgICB9fSBwYXJhbXMuZGF0YSBheGlzIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuYm91bmQgYXhpcyBib3VuZFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBheGlzIHRoZW1lXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgYXhpcyBvcHRpb25zXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIG5lLnV0aWwuZXh0ZW5kKHRoaXMsIHBhcmFtcyk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBeGlzIHZpZXcgY2xhc3NOYW1lXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNsYXNzTmFtZSA9ICduZS1jaGFydC1heGlzLWFyZWEnO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgYXhpcy5cbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IGF4aXMgYXJlYSBiYXNlIGVsZW1lbnRcbiAgICAgKi9cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YSxcbiAgICAgICAgICAgIHRoZW1lID0gdGhpcy50aGVtZSxcbiAgICAgICAgICAgIGlzVmVydGljYWwgPSAhIWRhdGEuaXNWZXJ0aWNhbCxcbiAgICAgICAgICAgIGlzUG9zaXRpb25SaWdodCA9IGRhdGEuaXNQb3NpdGlvblJpZ2h0LFxuICAgICAgICAgICAgb3B0aW9ucyA9IHRoaXMub3B0aW9ucyxcbiAgICAgICAgICAgIGJvdW5kID0gdGhpcy5ib3VuZCxcbiAgICAgICAgICAgIGRpbWVuc2lvbiA9IGJvdW5kLmRpbWVuc2lvbixcbiAgICAgICAgICAgIHNpemUgPSBpc1ZlcnRpY2FsID8gZGltZW5zaW9uLmhlaWdodCA6IGRpbWVuc2lvbi53aWR0aCxcbiAgICAgICAgICAgIGVsID0gZG9tLmNyZWF0ZSgnRElWJywgdGhpcy5jbGFzc05hbWUpLFxuICAgICAgICAgICAgZWxUaXRsZUFyZWEgPSB0aGlzLl9yZW5kZXJUaXRsZUFyZWEoe1xuICAgICAgICAgICAgICAgIHRpdGxlOiBvcHRpb25zLnRpdGxlLFxuICAgICAgICAgICAgICAgIHRoZW1lOiB0aGVtZS50aXRsZSxcbiAgICAgICAgICAgICAgICBpc1ZlcnRpY2FsOiBpc1ZlcnRpY2FsLFxuICAgICAgICAgICAgICAgIGlzUG9zaXRpb25SaWdodDogaXNQb3NpdGlvblJpZ2h0LFxuICAgICAgICAgICAgICAgIHNpemU6IHNpemVcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgZWxUaWNrQXJlYSA9IHRoaXMuX3JlbmRlclRpY2tBcmVhKHNpemUpLFxuICAgICAgICAgICAgZWxMYWJlbEFyZWEgPSB0aGlzLl9yZW5kZXJMYWJlbEFyZWEoc2l6ZSwgZGltZW5zaW9uLndpZHRoKTtcbiAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJEaW1lbnNpb24oZWwsIGRpbWVuc2lvbik7XG4gICAgICAgIHJlbmRlclV0aWwucmVuZGVyUG9zaXRpb24oZWwsIGJvdW5kLnBvc2l0aW9uKTtcbiAgICAgICAgZG9tLmFkZENsYXNzKGVsLCBpc1ZlcnRpY2FsID8gJ3ZlcnRpY2FsJyA6ICdob3Jpem9udGFsJyk7XG4gICAgICAgIGRvbS5hZGRDbGFzcyhlbCwgaXNQb3NpdGlvblJpZ2h0ID8gJ3JpZ2h0JyA6ICcnKTtcbiAgICAgICAgZG9tLmFwcGVuZChlbCwgW2VsVGl0bGVBcmVhLCBlbFRpY2tBcmVhLCBlbExhYmVsQXJlYV0pO1xuXG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGNzcyBzdHlsZSBvZiB0aXRsZSBhcmVhXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxUaXRsZUFyZWEgdGl0bGUgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzaXplICh3aWR0aCBvciBoZWlnaHQpXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpc1Bvc2l0aW9uUmlnaHQgd2hldGhlciByaWdodCBwb3NpdGlvbiBvciBub3Q/XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyVGl0bGVBcmVhU3R5bGU6IGZ1bmN0aW9uKGVsVGl0bGVBcmVhLCBzaXplLCBpc1Bvc2l0aW9uUmlnaHQpIHtcbiAgICAgICAgdmFyIGNzc1RleHRzID0gW1xuICAgICAgICAgICAgcmVuZGVyVXRpbC5jb25jYXRTdHIoJ3dpZHRoOicsIHNpemUsICdweCcpXG4gICAgICAgIF07XG5cbiAgICAgICAgaWYgKGlzUG9zaXRpb25SaWdodCkge1xuICAgICAgICAgICAgY3NzVGV4dHMucHVzaChyZW5kZXJVdGlsLmNvbmNhdFN0cigncmlnaHQ6JywgLXNpemUsICdweCcpKTtcbiAgICAgICAgICAgIGNzc1RleHRzLnB1c2gocmVuZGVyVXRpbC5jb25jYXRTdHIoJ3RvcDonLCAwLCAncHgnKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjc3NUZXh0cy5wdXNoKHJlbmRlclV0aWwuY29uY2F0U3RyKCdsZWZ0OicsIDAsICdweCcpKTtcbiAgICAgICAgICAgIGlmICghcmVuZGVyVXRpbC5pc0lFOCgpKSB7XG4gICAgICAgICAgICAgICAgY3NzVGV4dHMucHVzaChyZW5kZXJVdGlsLmNvbmNhdFN0cigndG9wOicsIHNpemUsICdweCcpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGVsVGl0bGVBcmVhLnN0eWxlLmNzc1RleHQgKz0gJzsnICsgY3NzVGV4dHMuam9pbignOycpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUaXRsZSBhcmVhIHJlbmRlcmVyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLnRpdGxlIGF4aXMgdGl0bGVcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgdGl0bGUgdGhlbWVcbiAgICAgKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gcGFyYW1zLmlzVmVydGljYWwgd2hldGhlciB2ZXJ0aWNhbCBvciBub3Q/XG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5pc1Bvc2l0aW9uUmlnaHQgd2hldGhlciByaWdodCBwb3NpdGlvbiBvciBub3Q/XG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnNpemUgKHdpZHRoIG9yIGhlaWdodClcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHRpdGxlIGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJUaXRsZUFyZWE6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgZWxUaXRsZUFyZWEgPSByZW5kZXJVdGlsLnJlbmRlclRpdGxlKHBhcmFtcy50aXRsZSwgcGFyYW1zLnRoZW1lLCAnbmUtY2hhcnQtdGl0bGUtYXJlYScpO1xuXG4gICAgICAgIGlmIChlbFRpdGxlQXJlYSAmJiBwYXJhbXMuaXNWZXJ0aWNhbCkge1xuICAgICAgICAgICAgdGhpcy5fcmVuZGVyVGl0bGVBcmVhU3R5bGUoZWxUaXRsZUFyZWEsIHBhcmFtcy5zaXplLCBwYXJhbXMuaXNQb3NpdGlvblJpZ2h0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBlbFRpdGxlQXJlYTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVkbmVyIHRpY2sgYXJlYS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc2l6ZSBzaXplIG9yIGhlaWdodFxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gdGljayBhcmVhIGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJUaWNrQXJlYTogZnVuY3Rpb24oc2l6ZSkge1xuICAgICAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YSxcbiAgICAgICAgICAgIHRpY2tDb3VudCA9IGRhdGEudGlja0NvdW50LFxuICAgICAgICAgICAgdGlja0NvbG9yID0gdGhpcy50aGVtZS50aWNrQ29sb3IsXG4gICAgICAgICAgICBwb3NpdGlvbnMgPSBjYWxjdWxhdG9yLm1ha2VUaWNrUGl4ZWxQb3NpdGlvbnMoc2l6ZSwgdGlja0NvdW50KSxcbiAgICAgICAgICAgIGVsVGlja0FyZWEgPSBkb20uY3JlYXRlKCdESVYnLCAnbmUtY2hhcnQtdGljay1hcmVhJyksXG4gICAgICAgICAgICBpc1ZlcnRpY2FsID0gZGF0YS5pc1ZlcnRpY2FsLFxuICAgICAgICAgICAgcG9zVHlwZSA9IGlzVmVydGljYWwgPyAnYm90dG9tJyA6ICdsZWZ0JyxcbiAgICAgICAgICAgIGJvcmRlckNvbG9yVHlwZSA9IGlzVmVydGljYWwgPyAoZGF0YS5pc1Bvc2l0aW9uUmlnaHQgPyAnYm9yZGVyTGVmdENvbG9yJyA6ICdib3JkZXJSaWdodENvbG9yJykgOiAnYm9yZGVyVG9wQ29sb3InLFxuICAgICAgICAgICAgdGVtcGxhdGUgPSBheGlzVGVtcGxhdGUuVFBMX0FYSVNfVElDSyxcbiAgICAgICAgICAgIHRpY2tzSHRtbCA9IG5lLnV0aWwubWFwKHBvc2l0aW9ucywgZnVuY3Rpb24ocG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgY3NzVGV4dCA9IFtcbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyVXRpbC5jb25jYXRTdHIoJ2JhY2tncm91bmQtY29sb3I6JywgdGlja0NvbG9yKSxcbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyVXRpbC5jb25jYXRTdHIocG9zVHlwZSwgJzogJywgcG9zaXRpb24sICdweCcpXG4gICAgICAgICAgICAgICAgXS5qb2luKCc7Jyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRlbXBsYXRlKHtjc3NUZXh0OiBjc3NUZXh0fSk7XG4gICAgICAgICAgICB9LCB0aGlzKS5qb2luKCcnKTtcblxuICAgICAgICBlbFRpY2tBcmVhLmlubmVySFRNTCA9IHRpY2tzSHRtbDtcbiAgICAgICAgZWxUaWNrQXJlYS5zdHlsZVtib3JkZXJDb2xvclR5cGVdID0gdGlja0NvbG9yO1xuXG4gICAgICAgIHJldHVybiBlbFRpY2tBcmVhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgbGFiZWwgYXJlYS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc2l6ZSBsYWJlbCBhcmVhIHNpemVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYXhpc1dpZHRoIGF4aXMgYXJlYSB3aWR0aFxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gbGFiZWwgYXJlYSBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyTGFiZWxBcmVhOiBmdW5jdGlvbihzaXplLCBheGlzV2lkdGgpIHtcbiAgICAgICAgdmFyIGRhdGEgPSB0aGlzLmRhdGEsXG4gICAgICAgICAgICB0aGVtZSA9IHRoaXMudGhlbWUsXG4gICAgICAgICAgICB0aWNrUGl4ZWxQb3NpdGlvbnMgPSBjYWxjdWxhdG9yLm1ha2VUaWNrUGl4ZWxQb3NpdGlvbnMoc2l6ZSwgZGF0YS50aWNrQ291bnQpLFxuICAgICAgICAgICAgbGFiZWxTaXplID0gdGlja1BpeGVsUG9zaXRpb25zWzFdIC0gdGlja1BpeGVsUG9zaXRpb25zWzBdLFxuICAgICAgICAgICAgbGFiZWxzID0gZGF0YS5sYWJlbHMsXG4gICAgICAgICAgICBpc1ZlcnRpY2FsID0gZGF0YS5pc1ZlcnRpY2FsLFxuICAgICAgICAgICAgaXNMYWJlbEF4aXMgPSBkYXRhLmlzTGFiZWxBeGlzLFxuICAgICAgICAgICAgcG9zVHlwZSA9ICdsZWZ0JyxcbiAgICAgICAgICAgIGNzc1RleHRzID0gdGhpcy5fbWFrZUxhYmVsQ3NzVGV4dHMoe1xuICAgICAgICAgICAgICAgIGlzVmVydGljYWw6IGlzVmVydGljYWwsXG4gICAgICAgICAgICAgICAgaXNMYWJlbEF4aXM6IGlzTGFiZWxBeGlzLFxuICAgICAgICAgICAgICAgIGxhYmVsU2l6ZTogbGFiZWxTaXplXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGVsTGFiZWxBcmVhID0gZG9tLmNyZWF0ZSgnRElWJywgJ25lLWNoYXJ0LWxhYmVsLWFyZWEnKSxcbiAgICAgICAgICAgIGFyZWFDc3NUZXh0ID0gcmVuZGVyVXRpbC5tYWtlRm9udENzc1RleHQodGhlbWUubGFiZWwpLFxuICAgICAgICAgICAgbGFiZWxzSHRtbCwgdGl0bGVBcmVhV2lkdGg7XG5cbiAgICAgICAgaWYgKGlzVmVydGljYWwpIHtcbiAgICAgICAgICAgIHBvc1R5cGUgPSBpc0xhYmVsQXhpcyA/ICd0b3AnIDogJ2JvdHRvbSc7XG4gICAgICAgICAgICB0aXRsZUFyZWFXaWR0aCA9IHRoaXMuX2dldFJlbmRlcmVkVGl0bGVIZWlnaHQoKSArIFRJVExFX0FSRUFfV0lEVEhfUEFERElORztcbiAgICAgICAgICAgIGFyZWFDc3NUZXh0ICs9ICc7d2lkdGg6JyArIChheGlzV2lkdGggLSB0aXRsZUFyZWFXaWR0aCArIFZfTEFCRUxfUklHSFRfUEFERElORykgKyAncHgnO1xuICAgICAgICB9XG5cbiAgICAgICAgdGlja1BpeGVsUG9zaXRpb25zLmxlbmd0aCA9IGxhYmVscy5sZW5ndGg7XG5cbiAgICAgICAgbGFiZWxzSHRtbCA9IHRoaXMuX21ha2VMYWJlbHNIdG1sKHtcbiAgICAgICAgICAgIHBvc2l0aW9uczogdGlja1BpeGVsUG9zaXRpb25zLFxuICAgICAgICAgICAgbGFiZWxzOiBsYWJlbHMsXG4gICAgICAgICAgICBwb3NUeXBlOiBwb3NUeXBlLFxuICAgICAgICAgICAgY3NzVGV4dHM6IGNzc1RleHRzXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGVsTGFiZWxBcmVhLmlubmVySFRNTCA9IGxhYmVsc0h0bWw7XG4gICAgICAgIGVsTGFiZWxBcmVhLnN0eWxlLmNzc1RleHQgPSBhcmVhQ3NzVGV4dDtcblxuICAgICAgICB0aGlzLl9jaGFuZ2VMYWJlbEFyZWFQb3NpdGlvbih7XG4gICAgICAgICAgICBlbExhYmVsQXJlYTogZWxMYWJlbEFyZWEsXG4gICAgICAgICAgICBpc1ZlcnRpY2FsOiBpc1ZlcnRpY2FsLFxuICAgICAgICAgICAgaXNMYWJlbEF4aXM6IGlzTGFiZWxBeGlzLFxuICAgICAgICAgICAgdGhlbWU6IHRoZW1lLmxhYmVsLFxuICAgICAgICAgICAgbGFiZWxTaXplOiBsYWJlbFNpemVcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGVsTGFiZWxBcmVhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgaGVpZ2h0IG9mIHRpdGxlIGFyZWEgO1xuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IGhlaWdodFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFJlbmRlcmVkVGl0bGVIZWlnaHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdGl0bGUgPSB0aGlzLm9wdGlvbnMudGl0bGUsXG4gICAgICAgICAgICB0aGVtZSA9IHRoaXMudGhlbWUudGl0bGUsXG4gICAgICAgICAgICByZXN1bHQgPSB0aXRsZSA/IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodCh0aXRsZSwgdGhlbWUpIDogMDtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBjc3NUZXh0cyBvZiBsYWJlbC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlclxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaXNWZXJ0aWNhbCB3aGV0aGVyIHZlcnRpY2FsIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaXNMYWJlbEF4aXMgd2hldGhlciBsYWJlbCBheGlzIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5sYWJlbFNpemUgbGFiZWwgc2l6ZSAod2lkdGggb3IgaGVpZ2h0KVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmdbXX0gY3NzVGV4dHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlTGFiZWxDc3NUZXh0czogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBjc3NUZXh0cyA9IFtdO1xuXG4gICAgICAgIGlmIChwYXJhbXMuaXNWZXJ0aWNhbCAmJiBwYXJhbXMuaXNMYWJlbEF4aXMpIHtcbiAgICAgICAgICAgIGNzc1RleHRzLnB1c2gocmVuZGVyVXRpbC5jb25jYXRTdHIoJ2hlaWdodDonLCBwYXJhbXMubGFiZWxTaXplLCAncHgnKSk7XG4gICAgICAgICAgICBjc3NUZXh0cy5wdXNoKHJlbmRlclV0aWwuY29uY2F0U3RyKCdsaW5lLWhlaWdodDonLCBwYXJhbXMubGFiZWxTaXplLCAncHgnKSk7XG4gICAgICAgIH0gZWxzZSBpZiAoIXBhcmFtcy5pc1ZlcnRpY2FsKSB7XG4gICAgICAgICAgICBjc3NUZXh0cy5wdXNoKHJlbmRlclV0aWwuY29uY2F0U3RyKCd3aWR0aDonLCBwYXJhbXMubGFiZWxTaXplLCAncHgnKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY3NzVGV4dHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgaHRtbCBvZiBsYWJlbC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPG9iamVjdD59IHBhcmFtcy5wb3NpdGlvbnMgbGFiZWwgcG9zaXRpb24gYXJyYXlcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nW119IHBhcmFtcy5sYWJlbHMgbGFiZWwgYXJyYXlcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMucG9zVHlwZSBwb3NpdGlvbiB0eXBlIChsZWZ0IG9yIGJvdHRvbSlcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nW119IHBhcmFtcy5jc3NUZXh0cyBjc3MgYXJyYXlcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBodG1sXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUxhYmVsc0h0bWw6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgdGVtcGxhdGUgPSBheGlzVGVtcGxhdGUuVFBMX0FYSVNfTEFCRUwsXG4gICAgICAgICAgICBsYWJlbHNIdG1sID0gbmUudXRpbC5tYXAocGFyYW1zLnBvc2l0aW9ucywgZnVuY3Rpb24ocG9zaXRpb24sIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdmFyIGxhYmVsQ3NzVGV4dHMgPSBwYXJhbXMuY3NzVGV4dHMuc2xpY2UoKSxcbiAgICAgICAgICAgICAgICAgICAgaHRtbDtcblxuICAgICAgICAgICAgICAgIGxhYmVsQ3NzVGV4dHMucHVzaChyZW5kZXJVdGlsLmNvbmNhdFN0cihwYXJhbXMucG9zVHlwZSwgJzonLCBwb3NpdGlvbiwgJ3B4JykpO1xuICAgICAgICAgICAgICAgIGh0bWwgPSB0ZW1wbGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGNzc1RleHQ6IGxhYmVsQ3NzVGV4dHMuam9pbignOycpLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogcGFyYW1zLmxhYmVsc1tpbmRleF1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gaHRtbDtcbiAgICAgICAgICAgIH0sIHRoaXMpLmpvaW4oJycpO1xuXG4gICAgICAgIHJldHVybiBsYWJlbHNIdG1sO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGFuZ2UgcG9zaXRpb24gb2YgbGFiZWwgYXJlYS5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlclxuICAgICAqICAgICAgQHBhcmFtIHtIVE1MRWxlbWVudH0gcGFyYW1zLmVsTGFiZWxBcmVhIGxhYmVsIGFyZWEgZWxlbWVudFxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaXNWZXJ0aWNhbCB3aGV0aGVyIHZlcnRpY2FsIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaXNMYWJlbEF4aXMgd2hldGhlciBsYWJlbCBheGlzIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHt7Zm9udFNpemU6IG51bWJlciwgZm9udEZhbWlseTogc3RyaW5nLCBjb2xvcjogc3RyaW5nfX0gcGFyYW1zLnRoZW1lIGxhYmVsIHRoZW1lXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmxhYmVsU2l6ZSBsYWJlbCBzaXplICh3aWR0aCBvciBoZWlnaHQpXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2hhbmdlTGFiZWxBcmVhUG9zaXRpb246IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgbGFiZWxIZWlnaHQ7XG5cbiAgICAgICAgaWYgKHBhcmFtcy5pc0xhYmVsQXhpcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhcmFtcy5pc1ZlcnRpY2FsKSB7XG4gICAgICAgICAgICBsYWJlbEhlaWdodCA9IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodCgnQUJDJywgcGFyYW1zLnRoZW1lKTtcbiAgICAgICAgICAgIHBhcmFtcy5lbExhYmVsQXJlYS5zdHlsZS50b3AgPSByZW5kZXJVdGlsLmNvbmNhdFN0cihwYXJzZUludChsYWJlbEhlaWdodCAvIDIsIDEwKSwgJ3B4Jyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYXJhbXMuZWxMYWJlbEFyZWEuc3R5bGUubGVmdCA9IHJlbmRlclV0aWwuY29uY2F0U3RyKCctJywgcGFyc2VJbnQocGFyYW1zLmxhYmVsU2l6ZSAvIDIsIDEwKSwgJ3B4Jyk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBeGlzO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFRoaXMgaXMgdGVtcGxhdGVzIG9yIGF4aXMgdmlldy5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbnZhciB0ZW1wbGF0ZU1ha2VyID0gcmVxdWlyZSgnLi4vaGVscGVycy90ZW1wbGF0ZU1ha2VyLmpzJyk7XG5cbnZhciB0YWdzID0ge1xuICAgIEhUTUxfQVhJU19USUNLOiAnPGRpdiBjbGFzcz1cIm5lLWNoYXJ0LXRpY2tcIiBzdHlsZT1cInt7IGNzc1RleHQgfX1cIj48L2Rpdj4nLFxuICAgIEhUTUxfQVhJU19MQUJFTDogJzxkaXYgY2xhc3M9XCJuZS1jaGFydC1sYWJlbFwiIHN0eWxlPVwie3sgY3NzVGV4dCB9fVwiPnt7IGxhYmVsIH19PC9kaXY+J1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgVFBMX0FYSVNfVElDSzogdGVtcGxhdGVNYWtlci50ZW1wbGF0ZSh0YWdzLkhUTUxfQVhJU19USUNLKSxcbiAgICBUUExfQVhJU19MQUJFTDogdGVtcGxhdGVNYWtlci50ZW1wbGF0ZSh0YWdzLkhUTUxfQVhJU19MQUJFTClcbn07XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgY2hhcnQuanMgaXMgZW50cnkgcG9pbnQgb2YgQXBwbGljYXRpb24gQ2hhcnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4vY29uc3QuanMnKSxcbiAgICBjaGFydEZhY3RvcnkgPSByZXF1aXJlKCcuL2ZhY3Rvcmllcy9jaGFydEZhY3RvcnkuanMnKSxcbiAgICBwbHVnaW5GYWN0b3J5ID0gcmVxdWlyZSgnLi9mYWN0b3JpZXMvcGx1Z2luRmFjdG9yeS5qcycpLFxuICAgIHRoZW1lRmFjdG9yeSA9IHJlcXVpcmUoJy4vZmFjdG9yaWVzL3RoZW1lRmFjdG9yeS5qcycpO1xuXG52YXIgREVGQVVMVF9USEVNRV9OQU1FID0gJ2RlZmF1bHQnO1xuXG52YXIgX2NyZWF0ZUNoYXJ0O1xuXG5yZXF1aXJlKCcuL2NvZGUtc25pcHBldC11dGlsLmpzJyk7XG5yZXF1aXJlKCcuL3JlZ2lzdGVyQ2hhcnRzLmpzJyk7XG5yZXF1aXJlKCcuL3JlZ2lzdGVyVGhlbWVzLmpzJyk7XG5cbi8qKlxuICogTkhOIEVudGVydGFpbm1lbnQgQXBwbGljYXRpb24gQ2hhcnQuXG4gKiBAbmFtZXNwYWNlIG5lLmFwcGxpY2F0aW9uLmNoYXJ0XG4gKi9cbm5lLnV0aWwuZGVmaW5lTmFtZXNwYWNlKCduZS5hcHBsaWNhdGlvbi5jaGFydCcpO1xuXG4vKipcbiAqIENyZWF0ZSBjaGFydC5cbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciBjb250YWluZXJcbiAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gZGF0YSBjaGFydCBkYXRhXG4gKiBAcGFyYW0ge3tcbiAqICAgY2hhcnQ6IHtcbiAqICAgICB3aWR0aDogbnVtYmVyLFxuICogICAgIGhlaWdodDogbnVtYmVyLFxuICogICAgIHRpdGxlOiBzdHJpbmcsXG4gKiAgICAgZm9ybWF0OiBzdHJpbmdcbiAqICAgfSxcbiAqICAgeUF4aXM6IHtcbiAqICAgICB0aXRsZTogc3RyaW5nLFxuICogICAgIG1pbjogbnVtYmVyXG4gKiAgIH0sXG4gKiAgIHhBeGlzOiB7XG4gKiAgICAgdGl0bGU6IHN0cmlnLFxuICogICAgIG1pbjogbnVtYmVyXG4gKiAgIH0sXG4gKiAgIHRvb2x0aXA6IHtcbiAqICAgICBzdWZmaXg6IHN0cmluZyxcbiAqICAgICB0ZW1wbGF0ZTogc3RyaW5nXG4gKiAgIH0sXG4gKiAgIHRoZW1lOiBzdHJpbmdcbiAqIH19IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICogQHJldHVybnMge29iamVjdH0gY2hhcnQgaW5zdGFuY2UuXG4gKiBAcHJpdmF0ZVxuICogQGlnbm9yZVxuICovXG5fY3JlYXRlQ2hhcnQgPSBmdW5jdGlvbihjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpIHtcbiAgICB2YXIgdGhlbWVOYW1lLCB0aGVtZSwgY2hhcnQ7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdGhlbWVOYW1lID0gb3B0aW9ucy50aGVtZSB8fCBERUZBVUxUX1RIRU1FX05BTUU7XG4gICAgdGhlbWUgPSB0aGVtZUZhY3RvcnkuZ2V0KHRoZW1lTmFtZSk7XG5cbiAgICBjaGFydCA9IGNoYXJ0RmFjdG9yeS5nZXQob3B0aW9ucy5jaGFydFR5cGUsIGRhdGEsIHRoZW1lLCBvcHRpb25zKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoY2hhcnQucmVuZGVyKCkpO1xuICAgIGNoYXJ0LmFuaW1hdGVDaGFydCgpO1xuXG4gICAgcmV0dXJuIGNoYXJ0O1xufTtcblxuLyoqXG4gKiBCYXIgY2hhcnQgY3JlYXRvci5cbiAqIEBtZW1iZXJPZiBuZS5hcHBsaWNhdGlvbi5jaGFydFxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNoYXJ0IGNvbnRhaW5lclxuICogQHBhcmFtIHtvYmplY3R9IGRhdGEgY2hhcnQgZGF0YVxuICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBkYXRhLmNhdGVnb3JpZXMgY2F0ZWdvcmllc1xuICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IGRhdGEuc2VyaWVzIHNlcmllcyBkYXRhXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLmNoYXJ0IGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LndpZHRoIGNoYXJ0IHdpZHRoXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5jaGFydC5oZWlnaHQgY2hhcnQgaGVpZ2h0XG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC50aXRsZSBjaGFydCB0aXRsZVxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuY2hhcnQuZm9ybWF0IHZhbHVlIGZvcm1hdFxuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy55QXhpcyBvcHRpb25zIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnlBeGlzLnRpdGxlIHRpdGxlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMueEF4aXMgb3B0aW9ucyBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnhBeGlzLnRpdGxlIHRpdGxlIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMueEF4aXMubWluIG1pbmltYWwgdmFsdWUgb2YgaG9yaXpvbnRhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy54QXhpcy5tYXggbWF4aW11bSB2YWx1ZSBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuc2VyaWVzIG9wdGlvbnMgb2Ygc2VyaWVzXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5zZXJpZXMuc3RhY2tlZCBzdGFja2VkIHR5cGVcbiAqICAgICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5zZXJpZXMuc2hvd0xhYmVsIHdoZXRoZXIgc2hvdyBsYWJlbCBvciBub3RcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMudG9vbHRpcCBvcHRpb25zIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAuc3VmZml4IHN1ZmZpeCBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnRlbXBsYXRlIHRlbXBsYXRlIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAucG9zaXRpb24gdG9vbHRpcCBwb3NpdGlvbiB0eXBlXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uIGFkZCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24ubGVmdCBhZGQgbGVmdCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24udG9wIGFkZCB0b3AgcG9zaXRpb25cbiAqICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudGhlbWUgdGhlbWUgbmFtZVxuICogICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5saWJUeXBlIGdyYXBoIGxpYnJhcnkgdHlwZVxuICogQHJldHVybnMge29iamVjdH0gYmFyIGNoYXJ0XG4gKiBAZXhhbXBsZVxuICogdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWluZXItaWQnKSxcbiAqICAgICBkYXRhID0ge1xuICogICAgICAgY2F0ZWdvcmllczogWydjYXRlMScsICdjYXRlMicsICdjYXRlMyddLFxuICogICAgICAgc2VyaWVzOiBbXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMScsXG4gKiAgICAgICAgICAgZGF0YTogWzIwLCAzMCwgNTBdXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMicsXG4gKiAgICAgICAgICAgZGF0YTogWzQwLCA0MCwgNjBdXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMycsXG4gKiAgICAgICAgICAgZGF0YTogWzYwLCA1MCwgMTBdXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kNCcsXG4gKiAgICAgICAgICAgZGF0YTogWzgwLCAxMCwgNzBdXG4gKiAgICAgICAgIH1cbiAqICAgICAgIF1cbiAqICAgICB9LFxuICogICAgIG9wdGlvbnMgPSB7XG4gKiAgICAgICBjaGFydDoge1xuICogICAgICAgICB0aXRsZTogJ0JhciBDaGFydCdcbiAqICAgICAgIH0sXG4gKiAgICAgICB5QXhpczoge1xuICogICAgICAgICB0aXRsZTogJ1kgQXhpcydcbiAqICAgICAgIH0sXG4gKiAgICAgICB4QXhpczoge1xuICogICAgICAgICB0aXRsZTogJ1ggQXhpcydcbiAqICAgICAgIH1cbiAqICAgICB9O1xuICogbmUuYXBwbGljYXRpb24uY2hhcnQuYmFyQ2hhcnQoY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKTtcbiAqL1xubmUuYXBwbGljYXRpb24uY2hhcnQuYmFyQ2hhcnQgPSBmdW5jdGlvbihjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICBvcHRpb25zLmNoYXJ0VHlwZSA9IGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9CQVI7XG4gICAgcmV0dXJuIF9jcmVhdGVDaGFydChjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpO1xufTtcblxuLyoqXG4gKiBDb2x1bW4gY2hhcnQgY3JlYXRvci5cbiAqIEBtZW1iZXJPZiBuZS5hcHBsaWNhdGlvbi5jaGFydFxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNoYXJ0IGNvbnRhaW5lclxuICogQHBhcmFtIHtvYmplY3R9IGRhdGEgY2hhcnQgZGF0YVxuICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBkYXRhLmNhdGVnb3JpZXMgY2F0ZWdvcmllc1xuICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IGRhdGEuc2VyaWVzIHNlcmllcyBkYXRhXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLmNoYXJ0IGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LndpZHRoIGNoYXJ0IHdpZHRoXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5jaGFydC5oZWlnaHQgY2hhcnQgaGVpZ2h0XG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC50aXRsZSBjaGFydCB0aXRsZVxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuY2hhcnQuZm9ybWF0IHZhbHVlIGZvcm1hdFxuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy55QXhpcyBvcHRpb25zIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnlBeGlzLnRpdGxlIHRpdGxlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnlBeGlzLm1pbiBtaW5pbWFsIHZhbHVlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnlBeGlzLm1heCBtYXhpbXVtIHZhbHVlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMueEF4aXMgb3B0aW9ucyBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnhBeGlzLnRpdGxlIHRpdGxlIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5zZXJpZXMgb3B0aW9ucyBvZiBzZXJpZXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnNlcmllcy5zdGFja2VkIHN0YWNrZWQgdHlwZVxuICogICAgICAgICAgQHBhcmFtIHtib29sZWFufSBvcHRpb25zLnNlcmllcy5zaG93TGFiZWwgd2hldGhlciBzaG93IGxhYmVsIG9yIG5vdFxuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy50b29sdGlwIG9wdGlvbnMgb2YgdG9vbHRpcFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC5zdWZmaXggc3VmZml4IG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAudGVtcGxhdGUgdGVtcGxhdGUgb2YgdG9vbHRpcFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC5wb3NpdGlvbiB0b29sdGlwIHBvc2l0aW9uIHR5cGVcbiAqICAgICAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24gYWRkIHBvc2l0aW9uXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMudG9vbHRpcC5hZGRQb3NpdGlvbi5sZWZ0IGFkZCBsZWZ0IHBvc2l0aW9uXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMudG9vbHRpcC5hZGRQb3NpdGlvbi50b3AgYWRkIHRvcCBwb3NpdGlvblxuICogICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50aGVtZSB0aGVtZSBuYW1lXG4gKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmxpYlR5cGUgZ3JhcGggbGlicmFyeSB0eXBlXG4gKiBAcmV0dXJucyB7b2JqZWN0fSBjb2x1bW4gY2hhcnRcbiAqIEBleGFtcGxlXG4gKiB2YXIgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhaW5lci1pZCcpLFxuICogICAgIGRhdGEgPSB7XG4gKiAgICAgICBjYXRlZ29yaWVzOiBbJ2NhdGUxJywgJ2NhdGUyJywgJ2NhdGUzJ10sXG4gKiAgICAgICBzZXJpZXM6IFtcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQxJyxcbiAqICAgICAgICAgICBkYXRhOiBbMjAsIDMwLCA1MF1cbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQyJyxcbiAqICAgICAgICAgICBkYXRhOiBbNDAsIDQwLCA2MF1cbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQzJyxcbiAqICAgICAgICAgICBkYXRhOiBbNjAsIDUwLCAxMF1cbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQ0JyxcbiAqICAgICAgICAgICBkYXRhOiBbODAsIDEwLCA3MF1cbiAqICAgICAgICAgfVxuICogICAgICAgXVxuICogICAgIH0sXG4gKiAgICAgb3B0aW9ucyA9IHtcbiAqICAgICAgIGNoYXJ0OiB7XG4gKiAgICAgICAgIHRpdGxlOiAnQ29sdW1uIENoYXJ0J1xuICogICAgICAgfSxcbiAqICAgICAgIHlBeGlzOiB7XG4gKiAgICAgICAgIHRpdGxlOiAnWSBBeGlzJ1xuICogICAgICAgfSxcbiAqICAgICAgIHhBeGlzOiB7XG4gKiAgICAgICAgIHRpdGxlOiAnWCBBeGlzJ1xuICogICAgICAgfVxuICogICAgIH07XG4gKiBuZS5hcHBsaWNhdGlvbi5jaGFydC5jb2x1bW5DaGFydChjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpO1xuICovXG5uZS5hcHBsaWNhdGlvbi5jaGFydC5jb2x1bW5DaGFydCA9IGZ1bmN0aW9uKGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIG9wdGlvbnMuY2hhcnRUeXBlID0gY2hhcnRDb25zdC5DSEFSVF9UWVBFX0NPTFVNTjtcbiAgICByZXR1cm4gX2NyZWF0ZUNoYXJ0KGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucyk7XG59O1xuXG4vKipcbiAqIExpbmUgY2hhcnQgY3JlYXRvci5cbiAqIEBtZW1iZXJPZiBuZS5hcHBsaWNhdGlvbi5jaGFydFxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNoYXJ0IGNvbnRhaW5lclxuICogQHBhcmFtIHtvYmplY3R9IGRhdGEgY2hhcnQgZGF0YVxuICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBkYXRhLmNhdGVnb3JpZXMgY2F0ZWdvcmllc1xuICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IGRhdGEuc2VyaWVzIHNlcmllcyBkYXRhXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLmNoYXJ0IGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LndpZHRoIGNoYXJ0IHdpZHRoXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5jaGFydC5oZWlnaHQgY2hhcnQgaGVpZ2h0XG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC50aXRsZSBjaGFydCB0aXRsZVxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuY2hhcnQuZm9ybWF0IHZhbHVlIGZvcm1hdFxuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy55QXhpcyBvcHRpb25zIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnlBeGlzLnRpdGxlIHRpdGxlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnlBeGlzLm1pbiBtaW5pbWFsIHZhbHVlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnlBeGlzLm1heCBtYXhpbXVtIHZhbHVlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMueEF4aXMgb3B0aW9ucyBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnhBeGlzLnRpdGxlIHRpdGxlIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5zZXJpZXMgb3B0aW9ucyBvZiBzZXJpZXNcbiAqICAgICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5zZXJpZXMuaGFzRG90IHdoZXRoZXIgaGFzIGRvdCBvciBub3RcbiAqICAgICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5zZXJpZXMuc2hvd0xhYmVsIHdoZXRoZXIgc2hvdyBsYWJlbCBvciBub3RcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMudG9vbHRpcCBvcHRpb25zIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAuc3VmZml4IHN1ZmZpeCBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnRlbXBsYXRlIHRlbXBsYXRlIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAucG9zaXRpb24gdG9vbHRpcCBwb3NpdGlvbiB0eXBlXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uIGFkZCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24ubGVmdCBhZGQgbGVmdCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24udG9wIGFkZCB0b3AgcG9zaXRpb25cbiAqICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudGhlbWUgdGhlbWUgbmFtZVxuICogICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5saWJUeXBlIGdyYXBoIGxpYnJhcnkgdHlwZVxuICogQHJldHVybnMge29iamVjdH0gYmFyIGNoYXJ0XG4gKiBAZXhhbXBsZVxuICogdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWluZXItaWQnKSxcbiAqICAgICBkYXRhID0ge1xuICogICAgICAgY2F0ZWdvcmllczogWydjYXRlMScsICdjYXRlMicsICdjYXRlMyddLFxuICogICAgICAgc2VyaWVzOiBbXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMScsXG4gKiAgICAgICAgICAgZGF0YTogWzIwLCAzMCwgNTBdXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMicsXG4gKiAgICAgICAgICAgZGF0YTogWzQwLCA0MCwgNjBdXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMycsXG4gKiAgICAgICAgICAgZGF0YTogWzYwLCA1MCwgMTBdXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kNCcsXG4gKiAgICAgICAgICAgZGF0YTogWzgwLCAxMCwgNzBdXG4gKiAgICAgICAgIH1cbiAqICAgICAgIF1cbiAqICAgICB9LFxuICogICAgIG9wdGlvbnMgPSB7XG4gKiAgICAgICBjaGFydDoge1xuICogICAgICAgICB0aXRsZTogJ0xpbmUgQ2hhcnQnXG4gKiAgICAgICB9LFxuICogICAgICAgeUF4aXM6IHtcbiAqICAgICAgICAgdGl0bGU6ICdZIEF4aXMnXG4gKiAgICAgICB9LFxuICogICAgICAgeEF4aXM6IHtcbiAqICAgICAgICAgdGl0bGU6ICdYIEF4aXMnXG4gKiAgICAgICB9LFxuICogICAgICAgc2VyaWVzOiB7XG4gKiAgICAgICAgIGhhc0RvdDogdHJ1ZVxuICogICAgICAgfVxuICogICAgIH07XG4gKiBuZS5hcHBsaWNhdGlvbi5jaGFydC5saW5lQ2hhcnQoY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKTtcbiAqL1xubmUuYXBwbGljYXRpb24uY2hhcnQubGluZUNoYXJ0ID0gZnVuY3Rpb24oY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgb3B0aW9ucy5jaGFydFR5cGUgPSBjaGFydENvbnN0LkNIQVJUX1RZUEVfTElORTtcbiAgICByZXR1cm4gX2NyZWF0ZUNoYXJ0KGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucyk7XG59O1xuXG4vKipcbiAqIEFyZWEgY2hhcnQgY3JlYXRvci5cbiAqIEBtZW1iZXJPZiBuZS5hcHBsaWNhdGlvbi5jaGFydFxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNoYXJ0IGNvbnRhaW5lclxuICogQHBhcmFtIHtvYmplY3R9IGRhdGEgY2hhcnQgZGF0YVxuICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBkYXRhLmNhdGVnb3JpZXMgY2F0ZWdvcmllc1xuICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IGRhdGEuc2VyaWVzIHNlcmllcyBkYXRhXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLmNoYXJ0IGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LndpZHRoIGNoYXJ0IHdpZHRoXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5jaGFydC5oZWlnaHQgY2hhcnQgaGVpZ2h0XG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC50aXRsZSBjaGFydCB0aXRsZVxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuY2hhcnQuZm9ybWF0IHZhbHVlIGZvcm1hdFxuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy55QXhpcyBvcHRpb25zIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnlBeGlzLnRpdGxlIHRpdGxlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnlBeGlzLm1pbiBtaW5pbWFsIHZhbHVlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnlBeGlzLm1heCBtYXhpbXVtIHZhbHVlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMueEF4aXMgb3B0aW9ucyBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnhBeGlzLnRpdGxlIHRpdGxlIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5zZXJpZXMgb3B0aW9ucyBvZiBzZXJpZXNcbiAqICAgICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5zZXJpZXMuaGFzRG90IHdoZXRoZXIgaGFzIGRvdCBvciBub3RcbiAqICAgICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5zZXJpZXMuc2hvd0xhYmVsIHdoZXRoZXIgc2hvdyBsYWJlbCBvciBub3RcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMudG9vbHRpcCBvcHRpb25zIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAuc3VmZml4IHN1ZmZpeCBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnRlbXBsYXRlIHRlbXBsYXRlIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAucG9zaXRpb24gdG9vbHRpcCBwb3NpdGlvbiB0eXBlXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uIGFkZCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24ubGVmdCBhZGQgbGVmdCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24udG9wIGFkZCB0b3AgcG9zaXRpb25cbiAqICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudGhlbWUgdGhlbWUgbmFtZVxuICogICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5saWJUeXBlIGdyYXBoIGxpYnJhcnkgdHlwZVxuICogQHJldHVybnMge29iamVjdH0gYmFyIGNoYXJ0XG4gKiBAaWdub3JlXG4gKiBAZXhhbXBsZVxuICogdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWluZXItaWQnKSxcbiAqICAgICBkYXRhID0ge1xuICogICAgICAgY2F0ZWdvcmllczogWydjYXRlMScsICdjYXRlMicsICdjYXRlMyddLFxuICogICAgICAgc2VyaWVzOiBbXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMScsXG4gKiAgICAgICAgICAgZGF0YTogWzIwLCAzMCwgNTBdXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMicsXG4gKiAgICAgICAgICAgZGF0YTogWzQwLCA0MCwgNjBdXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMycsXG4gKiAgICAgICAgICAgZGF0YTogWzYwLCA1MCwgMTBdXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kNCcsXG4gKiAgICAgICAgICAgZGF0YTogWzgwLCAxMCwgNzBdXG4gKiAgICAgICAgIH1cbiAqICAgICAgIF1cbiAqICAgICB9LFxuICogICAgIG9wdGlvbnMgPSB7XG4gKiAgICAgICBjaGFydDoge1xuICogICAgICAgICB0aXRsZTogJ0FyZWEgQ2hhcnQnXG4gKiAgICAgICB9LFxuICogICAgICAgeUF4aXM6IHtcbiAqICAgICAgICAgdGl0bGU6ICdZIEF4aXMnXG4gKiAgICAgICB9LFxuICogICAgICAgeEF4aXM6IHtcbiAqICAgICAgICAgdGl0bGU6ICdYIEF4aXMnXG4gKiAgICAgICB9XG4gKiAgICAgfTtcbiAqIG5lLmFwcGxpY2F0aW9uLmNoYXJ0LmFyZWFDaGFydChjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpO1xuICovXG5uZS5hcHBsaWNhdGlvbi5jaGFydC5hcmVhQ2hhcnQgPSBmdW5jdGlvbihjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICBvcHRpb25zLmNoYXJ0VHlwZSA9IGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9BUkVBO1xuICAgIHJldHVybiBfY3JlYXRlQ2hhcnQoY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKTtcbn07XG5cbi8qKlxuICogQ29tYm8gY2hhcnQgY3JlYXRvci5cbiAqIEBtZW1iZXJPZiBuZS5hcHBsaWNhdGlvbi5jaGFydFxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNoYXJ0IGNvbnRhaW5lclxuICogQHBhcmFtIHtvYmplY3R9IGRhdGEgY2hhcnQgZGF0YVxuICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBkYXRhLmNhdGVnb3JpZXMgY2F0ZWdvcmllc1xuICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IGRhdGEuc2VyaWVzIHNlcmllcyBkYXRhXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLmNoYXJ0IGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LndpZHRoIGNoYXJ0IHdpZHRoXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5jaGFydC5oZWlnaHQgY2hhcnQgaGVpZ2h0XG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC50aXRsZSBjaGFydCB0aXRsZVxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuY2hhcnQuZm9ybWF0IHZhbHVlIGZvcm1hdFxuICogICAgICBAcGFyYW0ge29iamVjdFtdfSBvcHRpb25zLnlBeGlzIG9wdGlvbnMgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMueUF4aXNbXS50aXRsZSB0aXRsZSBvZiB2ZXJ0aWNhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy55QXhpc1tdLm1pbiBtaW5pbWFsIHZhbHVlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnlBeGlzW10ubWF4IG1heGltdW0gdmFsdWUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy54QXhpcyBvcHRpb25zIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMueEF4aXMudGl0bGUgdGl0bGUgb2YgaG9yaXpvbnRhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy54QXhpcy5taW4gbWluaW1hbCB2YWx1ZSBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnhBeGlzLm1heCBtYXhpbXVtIHZhbHVlIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5zZXJpZXMgb3B0aW9ucyBvZiBzZXJpZXNcbiAqICAgICAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnNlcmllcy5jb2x1bW4gb3B0aW9ucyBvZiBjb2x1bW4gc2VyaWVzXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuc2VyaWVzLmNvbHVtbi5zdGFja2VkIHN0YWNrZWQgdHlwZVxuICogICAgICAgICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5zZXJpZXMuY29sdW1uLnNob3dMYWJlbCB3aGV0aGVyIHNob3cgbGFiZWwgb3Igbm90XG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5zZXJpZXMubGluZSBvcHRpb25zIG9mIGxpbmUgc2VyaWVzXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtib29sZWFufSBvcHRpb25zLnNlcmllcy5saW5lLmhhc0RvdCB3aGV0aGVyIGhhcyBkb3Qgb3Igbm90XG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtib29sZWFufSBvcHRpb25zLnNlcmllcy5saW5lLnNob3dMYWJlbCB3aGV0aGVyIHNob3cgbGFiZWwgb3Igbm90XG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnRvb2x0aXAgb3B0aW9ucyBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy50b29sdGlwLmNvbHVtbiBvcHRpb25zIG9mIGNvbHVtbiB0b29sdGlwXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC5jb2x1bW4uc3VmZml4IHN1ZmZpeCBvZiB0b29sdGlwXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC5jb2x1bW4udGVtcGxhdGUgdGVtcGxhdGUgb2YgdG9vbHRpcFxuICogICAgICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAuY29sdW1uLnBvc2l0aW9uIHRvb2x0aXAgcG9zaXRpb24gdHlwZVxuICogICAgICAgICAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnRvb2x0aXAuY29sdW1uLmFkZFBvc2l0aW9uIGFkZCBwb3NpdGlvblxuICogICAgICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy50b29sdGlwLmNvbHVtbi5hZGRQb3NpdGlvbi5sZWZ0IGFkZCBsZWZ0IHBvc2l0aW9uXG4gKiAgICAgICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuY29sdW1uLmFkZFBvc2l0aW9uLnRvcCBhZGQgdG9wIHBvc2l0aW9uXG4gKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRoZW1lIHRoZW1lIG5hbWVcbiAqICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMubGliVHlwZSBncmFwaCBsaWJyYXJ5IHR5cGVcbiAqIEByZXR1cm5zIHtvYmplY3R9IGJhciBjaGFydFxuICogQGV4YW1wbGVcbiAqIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFpbmVyLWlkJyksXG4gKiAgICAgZGF0YSA9IHtcbiAqICAgICAgIGNhdGVnb3JpZXM6IFsnY2F0ZTEnLCAnY2F0ZTInLCAnY2F0ZTMnXSxcbiAqICAgICAgIHNlcmllczoge1xuICogICAgICAgICBjb2x1bW46IFtcbiAqICAgICAgICAgICB7XG4gKiAgICAgICAgICAgICBuYW1lOiAnTGVnZW5kMScsXG4gKiAgICAgICAgICAgICBkYXRhOiBbMjAsIDMwLCA1MF1dXG4gKiAgICAgICAgICAgfSxcbiAqICAgICAgICAgICB7XG4gKiAgICAgICAgICAgICBuYW1lOiAnTGVnZW5kMicsXG4gKiAgICAgICAgICAgICBkYXRhOiBbNDAsIDQwLCA2MF1cbiAqICAgICAgICAgICB9LFxuICogICAgICAgICAgIHtcbiAqICAgICAgICAgICAgIG5hbWU6ICdMZWdlbmQzJyxcbiAqICAgICAgICAgICAgIGRhdGE6IFs2MCwgNTAsIDEwXVxuICogICAgICAgICAgIH0sXG4gKiAgICAgICAgICAge1xuICogICAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDQnLFxuICogICAgICAgICAgICAgZGF0YTogWzgwLCAxMCwgNzBdXG4gKiAgICAgICAgICAgfVxuICogICAgICAgICB9LFxuICogICAgICAgICBsaW5lOiBbXG4gKiAgICAgICAgICAge1xuICogICAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDUnLFxuICogICAgICAgICAgICAgZGF0YTogWzEsIDIsIDNdXG4gKiAgICAgICAgICAgfVxuICogICAgICAgICBdXG4gKiAgICAgICB9XG4gKiAgICAgfSxcbiAqICAgICBvcHRpb25zID0ge1xuICogICAgICAgY2hhcnQ6IHtcbiAqICAgICAgICAgdGl0bGU6ICdDb21ibyBDaGFydCdcbiAqICAgICAgIH0sXG4gKiAgICAgICB5QXhpczpbXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICB0aXRsZTogJ1kgQXhpcycsXG4gKiAgICAgICAgICAgY2hhcnRUeXBlOiAnbGluZSdcbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIHRpdGxlOiAnWSBSaWdodCBBeGlzJ1xuICogICAgICAgICB9XG4gKiAgICAgICBdLFxuICogICAgICAgeEF4aXM6IHtcbiAqICAgICAgICAgdGl0bGU6ICdYIEF4aXMnXG4gKiAgICAgICB9LFxuICogICAgICAgc2VyaWVzOiB7XG4gKiAgICAgICAgIGhhc0RvdDogdHJ1ZVxuICogICAgICAgfVxuICogICAgIH07XG4gKiBuZS5hcHBsaWNhdGlvbi5jaGFydC5jb21ib0NoYXJ0KGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucyk7XG4gKi9cbm5lLmFwcGxpY2F0aW9uLmNoYXJ0LmNvbWJvQ2hhcnQgPSBmdW5jdGlvbihjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICBvcHRpb25zLmNoYXJ0VHlwZSA9IGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9DT01CTztcbiAgICByZXR1cm4gX2NyZWF0ZUNoYXJ0KGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucyk7XG59O1xuXG4vKipcbiAqIFBpZSBjaGFydCBjcmVhdG9yLlxuICogQG1lbWJlck9mIG5lLmFwcGxpY2F0aW9uLmNoYXJ0XG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY2hhcnQgY29udGFpbmVyXG4gKiBAcGFyYW0ge29iamVjdH0gZGF0YSBjaGFydCBkYXRhXG4gKiAgICAgIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gZGF0YS5zZXJpZXMgc2VyaWVzIGRhdGFcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuY2hhcnQgY2hhcnQgb3B0aW9uc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMuY2hhcnQud2lkdGggY2hhcnQgd2lkdGhcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LmhlaWdodCBjaGFydCBoZWlnaHRcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmNoYXJ0LnRpdGxlIGNoYXJ0IHRpdGxlXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC5mb3JtYXQgdmFsdWUgZm9ybWF0XG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnNlcmllcyBvcHRpb25zIG9mIHNlcmllc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuc2VyaWVzLmxlZ2VuZFR5cGUgbGVnZW5kIHR5cGVcbiAqICAgICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5zZXJpZXMuc2hvd0xhYmVsIHdoZXRoZXIgc2hvdyBsYWJlbCBvciBub3RcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMudG9vbHRpcCBvcHRpb25zIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAuc3VmZml4IHN1ZmZpeCBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnRlbXBsYXRlIHRlbXBsYXRlIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAucG9zaXRpb24gdG9vbHRpcCBwb3NpdGlvbiB0eXBlXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uIGFkZCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24ubGVmdCBhZGQgbGVmdCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24udG9wIGFkZCB0b3AgcG9zaXRpb25cbiAqICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudGhlbWUgdGhlbWUgbmFtZVxuICogICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5saWJUeXBlIGdyYXBoIGxpYnJhcnkgdHlwZVxuICogQHJldHVybnMge29iamVjdH0gYmFyIGNoYXJ0XG4gKiBAZXhhbXBsZVxuICogdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWluZXItaWQnKSxcbiAqICAgICBkYXRhID0ge1xuICogICAgICAgc2VyaWVzOiBbXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMScsXG4gKiAgICAgICAgICAgZGF0YTogMjBcbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQyJyxcbiAqICAgICAgICAgICBkYXRhOiA0MFxuICogICAgICAgICB9LFxuICogICAgICAgICB7XG4gKiAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDMnLFxuICogICAgICAgICAgIGRhdGE6IDYwXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kNCcsXG4gKiAgICAgICAgICAgZGF0YTogODBcbiAqICAgICAgICAgfVxuICogICAgICAgXVxuICogICAgIH0sXG4gKiAgICAgb3B0aW9ucyA9IHtcbiAqICAgICAgIGNoYXJ0OiB7XG4gKiAgICAgICAgIHRpdGxlOiAnUGllIENoYXJ0J1xuICogICAgICAgfVxuICogICAgIH07XG4gKiBuZS5hcHBsaWNhdGlvbi5jaGFydC5waWVDaGFydChjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpO1xuICovXG5uZS5hcHBsaWNhdGlvbi5jaGFydC5waWVDaGFydCA9IGZ1bmN0aW9uKGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIG9wdGlvbnMuY2hhcnRUeXBlID0gY2hhcnRDb25zdC5DSEFSVF9UWVBFX1BJRTtcbiAgICByZXR1cm4gX2NyZWF0ZUNoYXJ0KGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucyk7XG59O1xuXG4vKipcbiAqIFJlZ2lzdGVyIHRoZW1lLlxuICogQG1lbWJlck9mIG5lLmFwcGxpY2F0aW9uLmNoYXJ0XG4gKiBAcGFyYW0ge3N0cmluZ30gdGhlbWVOYW1lIHRoZW1lIG5hbWVcbiAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBhcHBsaWNhdGlvbiBjaGFydCB0aGVtZVxuICogICAgICBAcGFyYW0ge29iamVjdH0gdGhlbWUuY2hhcnQgY2hhcnQgdGhlbWVcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS5jaGFydC5mb250RmFtaWx5IGZvbnQgZmFtaWx5IG9mIGNoYXJ0XG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUuY2hhcnQuYmFja2dyb3VuZCBiYWNrZ3JvdW5kIG9mIGNoYXJ0XG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSB0aGVtZS50aXRsZSBjaGFydCB0aGVtZVxuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IHRoZW1lLnRpdGxlLmZvbnRTaXplIGZvbnQgc2l6ZSBvZiBjaGFydCB0aXRsZVxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnRpdGxlLmZvbnRGYW1pbHkgZm9udCBmYW1pbHkgb2YgY2hhcnQgdGl0bGVcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS50aXRsZS5jb2xvciBmb250IGNvbG9yIG9mIGNoYXJ0IHRpdGxlXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUudGl0bGUuYmFja2dyb3VuZCBiYWNrZ3JvdW5kIG9mIGNoYXJ0IHRpdGxlXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSB0aGVtZS55QXhpcyB0aGVtZSBvZiB2ZXJ0aWNhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gdGhlbWUueUF4aXMudGl0bGUgdGhlbWUgb2YgdmVydGljYWwgYXhpcyB0aXRsZVxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSB0aGVtZS55QXhpcy50aXRsZS5mb250U2l6ZSBmb250IHNpemUgb2YgdmVydGljYWwgYXhpcyB0aXRsZVxuICogICAgICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS55QXhpcy50aXRsZS5mb250RmFtaWx5IGZvbnQgZmFtaWx5IG9mIHZlcnRpY2FsIGF4aXMgdGl0bGVcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUueUF4aXMudGl0bGUuY29sb3IgZm9udCBjb2xvciBvZiB2ZXJ0aWNhbCBheGlzIHRpdGxlXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gdGhlbWUueUF4aXMubGFiZWwgdGhlbWUgb2YgdmVydGljYWwgYXhpcyBsYWJlbFxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSB0aGVtZS55QXhpcy5sYWJlbC5mb250U2l6ZSBmb250IHNpemUgb2YgdmVydGljYWwgYXhpcyBsYWJlbFxuICogICAgICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS55QXhpcy5sYWJlbC5mb250RmFtaWx5IGZvbnQgZmFtaWx5IG9mIHZlcnRpY2FsIGF4aXMgbGFiZWxcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUueUF4aXMubGFiZWwuY29sb3IgZm9udCBjb2xvciBvZiB2ZXJ0aWNhbCBheGlzIGxhYmVsXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUueUF4aXMudGlja2NvbG9yIGNvbG9yIG9mIHZlcnRpY2FsIGF4aXMgdGlja1xuICogICAgICBAcGFyYW0ge29iamVjdH0gdGhlbWUueEF4aXMgdGhlbWUgb2YgaG9yaXpvbnRhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gdGhlbWUueEF4aXMudGl0bGUgdGhlbWUgb2YgaG9yaXpvbnRhbCBheGlzIHRpdGxlXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IHRoZW1lLnhBeGlzLnRpdGxlLmZvbnRTaXplIGZvbnQgc2l6ZSBvZiBob3Jpem9udGFsIGF4aXMgdGl0bGVcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUueEF4aXMudGl0bGUuZm9udEZhbWlseSBmb250IGZhbWlseSBvZiBob3Jpem9udGFsIGF4aXMgdGl0bGVcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUueEF4aXMudGl0bGUuY29sb3IgZm9udCBjb2xvciBvZiBob3Jpem9udGFsIGF4aXMgdGl0bGVcbiAqICAgICAgICAgIEBwYXJhbSB7b2JqZWN0fSB0aGVtZS54QXhpcy5sYWJlbCB0aGVtZSBvZiBob3Jpem9udGFsIGF4aXMgbGFiZWxcbiAqICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gdGhlbWUueEF4aXMubGFiZWwuZm9udFNpemUgZm9udCBzaXplIG9mIGhvcml6b250YWwgYXhpcyBsYWJlbFxuICogICAgICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS54QXhpcy5sYWJlbC5mb250RmFtaWx5IGZvbnQgZmFtaWx5IG9mIGhvcml6b250YWwgYXhpcyBsYWJlbFxuICogICAgICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS54QXhpcy5sYWJlbC5jb2xvciBmb250IGNvbG9yIG9mIGhvcml6b250YWwgYXhpcyBsYWJlbFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnhBeGlzLnRpY2tjb2xvciBjb2xvciBvZiBob3Jpem9udGFsIGF4aXMgdGlja1xuICogICAgICBAcGFyYW0ge29iamVjdH0gdGhlbWUucGxvdCBwbG90IHRoZW1lXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUucGxvdC5saW5lQ29sb3IgcGxvdCBsaW5lIGNvbG9yXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUucGxvdC5iYWNrZ3JvdW5kIHBsb3QgYmFja2dyb3VuZFxuICogICAgICBAcGFyYW0ge29iamVjdH0gdGhlbWUuc2VyaWVzIHNlcmllcyB0aGVtZVxuICogICAgICAgICAgQHBhcmFtIHthcnJheS48c3RyaW5nPn0gdGhlbWUuc2VyaWVzLmNvbG9ycyBzZXJpZXMgY29sb3JzXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUuc2VyaWVzLmJvcmRlckNvbG9yIHNlcmllcyBib3JkZXIgY29sb3JcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IHRoZW1lLmxlZ2VuZCBsZWdlbmQgdGhlbWVcbiAqICAgICAgICAgIEBwYXJhbSB7b2JqZWN0fSB0aGVtZS5sZWdlbmQubGFiZWwgdGhlbWUgb2YgbGVnZW5kIGxhYmVsXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IHRoZW1lLmxlZ2VuZC5sYWJlbC5mb250U2l6ZSBmb250IHNpemUgb2YgbGVnZW5kIGxhYmVsXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLmxlZ2VuZC5sYWJlbC5mb250RmFtaWx5IGZvbnQgZmFtaWx5IG9mIGxlZ2VuZCBsYWJlbFxuICogICAgICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS5sZWdlbmQubGFiZWwuY29sb3IgZm9udCBjb2xvciBvZiBsZWdlbmQgbGFiZWxcbiAqIEBleGFtcGxlXG4gKiB2YXIgdGhlbWUgPSB7XG4gKiAgIHlBeGlzOiB7XG4gKiAgICAgdGlja0NvbG9yOiAnI2NjYmQ5YScsXG4gKiAgICAgICB0aXRsZToge1xuICogICAgICAgICBjb2xvcjogJyMzMzMzMzMnXG4gKiAgICAgICB9LFxuICogICAgICAgbGFiZWw6IHtcbiAqICAgICAgICAgY29sb3I6ICcjNmY0OTFkJ1xuICogICAgICAgfVxuICogICAgIH0sXG4gKiAgICAgeEF4aXM6IHtcbiAqICAgICAgIHRpY2tDb2xvcjogJyNjY2JkOWEnLFxuICogICAgICAgdGl0bGU6IHtcbiAqICAgICAgICAgY29sb3I6ICcjMzMzMzMzJ1xuICogICAgICAgfSxcbiAqICAgICAgIGxhYmVsOiB7XG4gKiAgICAgICAgIGNvbG9yOiAnIzZmNDkxZCdcbiAqICAgICAgIH1cbiAqICAgICB9LFxuICogICAgIHBsb3Q6IHtcbiAqICAgICAgIGxpbmVDb2xvcjogJyNlNWRiYzQnLFxuICogICAgICAgYmFja2dyb3VuZDogJyNmNmYxZTUnXG4gKiAgICAgfSxcbiAqICAgICBzZXJpZXM6IHtcbiAqICAgICAgIGNvbG9yczogWycjNDBhYmI0JywgJyNlNzhhMzEnLCAnI2MxYzQ1MicsICcjNzk1MjI0JywgJyNmNWY1ZjUnXSxcbiAqICAgICAgIGJvcmRlckNvbG9yOiAnIzhlNjUzNSdcbiAqICAgICB9LFxuICogICAgIGxlZ2VuZDoge1xuICogICAgICAgbGFiZWw6IHtcbiAqICAgICAgICAgY29sb3I6ICcjNmY0OTFkJ1xuICogICAgICAgfVxuICogICAgIH1cbiAqICAgfTtcbiAqIGNoYXJ0LnJlZ2lzdGVyVGhlbWUoJ25ld1RoZW1lJywgdGhlbWUpO1xuICovXG5uZS5hcHBsaWNhdGlvbi5jaGFydC5yZWdpc3RlclRoZW1lID0gZnVuY3Rpb24odGhlbWVOYW1lLCB0aGVtZSkge1xuICAgIHRoZW1lRmFjdG9yeS5yZWdpc3Rlcih0aGVtZU5hbWUsIHRoZW1lKTtcbn07XG5cbi8qKlxuICogUmVnaXN0ZXIgZ3JhcGggcGx1Z2luLlxuICogQG1lbWJlck9mIG5lLmFwcGxpY2F0aW9uLmNoYXJ0XG4gKiBAcGFyYW0ge3N0cmluZ30gbGliVHlwZSB0eXBlIG9mIGdyYXBoIGxpYnJhcnlcbiAqIEBwYXJhbSB7b2JqZWN0fSBwbHVnaW4gcGx1Z2luIHRvIGNvbnRyb2wgbGlicmFyeVxuICogQGV4YW1wbGVcbiAqIHZhciBwbHVnaW5SYXBoYWVsID0ge1xuICogICBiYXI6IGZ1bmN0aW9uKCkge30gLy8gUmVuZGVyIGNsYXNzXG4gKiB9O1xuICogbmUuYXBwbGljYXRpb24uY2hhcnQucmVnaXN0ZXJQbHVnaW4oJ3JhcGhhZWwnLCBwbHVnaW5SYXBoYWVsKTtcbiAqL1xubmUuYXBwbGljYXRpb24uY2hhcnQucmVnaXN0ZXJQbHVnaW4gPSBmdW5jdGlvbihsaWJUeXBlLCBwbHVnaW4pIHtcbiAgICBwbHVnaW5GYWN0b3J5LnJlZ2lzdGVyKGxpYlR5cGUsIHBsdWdpbik7XG59O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEFyZWEgY2hhcnRcbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIENoYXJ0QmFzZSA9IHJlcXVpcmUoJy4vY2hhcnRCYXNlJyksXG4gICAgQXhpc1R5cGVCYXNlID0gcmVxdWlyZSgnLi9heGlzVHlwZUJhc2UnKSxcbiAgICBWZXJ0aWNhbFR5cGVCYXNlID0gcmVxdWlyZSgnLi92ZXJ0aWNhbFR5cGVCYXNlJyksXG4gICAgY2FsY3VsYXRvciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvY2FsY3VsYXRvcicpLFxuICAgIFNlcmllcyA9IHJlcXVpcmUoJy4uL3Nlcmllcy9hcmVhQ2hhcnRTZXJpZXMnKTtcblxudmFyIEFyZWFDaGFydCA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoQ2hhcnRCYXNlLCAvKiogQGxlbmRzIEFyZWFDaGFydC5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIExpbmUgY2hhcnQuXG4gICAgICogQGNvbnN0cnVjdHMgQXJlYUNoYXJ0XG4gICAgICogQGV4dGVuZHMgQ2hhcnRCYXNlXG4gICAgICogQG1peGVzIEF4aXNUeXBlQmFzZVxuICAgICAqIEBtaXhlcyBWZXJ0aWNhbFR5cGVCYXNlXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXk+fSB1c2VyRGF0YSBjaGFydCBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIGNoYXJ0IHRoZW1lXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBpbml0ZWREYXRhIGluaXRpYWxpemVkIGRhdGEgZnJvbSBjb21ibyBjaGFydFxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKHVzZXJEYXRhLCB0aGVtZSwgb3B0aW9ucywgaW5pdGVkRGF0YSkge1xuICAgICAgICB2YXIgYmFzZURhdGEgPSBpbml0ZWREYXRhIHx8IHRoaXMubWFrZUJhc2VEYXRhKHVzZXJEYXRhLCB0aGVtZSwgb3B0aW9ucywge1xuICAgICAgICAgICAgICAgIGlzVmVydGljYWw6IHRydWUsXG4gICAgICAgICAgICAgICAgaGFzQXhlczogdHJ1ZVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBjb252ZXJ0RGF0YSA9IGJhc2VEYXRhLmNvbnZlcnREYXRhLFxuICAgICAgICAgICAgYm91bmRzID0gYmFzZURhdGEuYm91bmRzLFxuICAgICAgICAgICAgYXhpc0RhdGE7XG5cbiAgICAgICAgdGhpcy5jbGFzc05hbWUgPSAnbmUtbGluZS1hcmVhJztcblxuICAgICAgICBDaGFydEJhc2UuY2FsbCh0aGlzLCBib3VuZHMsIHRoZW1lLCBvcHRpb25zLCBpbml0ZWREYXRhKTtcblxuICAgICAgICBheGlzRGF0YSA9IHRoaXMuX21ha2VBeGVzRGF0YShjb252ZXJ0RGF0YSwgYm91bmRzLCBvcHRpb25zLCBpbml0ZWREYXRhKTtcbiAgICAgICAgdGhpcy5fYWRkQ29tcG9uZW50cyhjb252ZXJ0RGF0YSwgYXhpc0RhdGEsIG9wdGlvbnMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgY29tcG9uZW50c1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb252ZXJ0RGF0YSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBheGVzRGF0YSBheGVzIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYWRkQ29tcG9uZW50czogZnVuY3Rpb24oY29udmVydERhdGEsIGF4ZXNEYXRhLCBvcHRpb25zKSB7XG4gICAgICAgIHRoaXMuYWRkQXhpc0NvbXBvbmVudHMoe1xuICAgICAgICAgICAgY29udmVydERhdGE6IGNvbnZlcnREYXRhLFxuICAgICAgICAgICAgYXhlczogYXhlc0RhdGEsXG4gICAgICAgICAgICBwbG90RGF0YTogIW5lLnV0aWwuaXNVbmRlZmluZWQoY29udmVydERhdGEucGxvdERhdGEpID8gY29udmVydERhdGEucGxvdERhdGEgOiB7XG4gICAgICAgICAgICAgICAgdlRpY2tDb3VudDogYXhlc0RhdGEueUF4aXMudmFsaWRUaWNrQ291bnQsXG4gICAgICAgICAgICAgICAgaFRpY2tDb3VudDogYXhlc0RhdGEueEF4aXMudmFsaWRUaWNrQ291bnRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjaGFydFR5cGU6IG9wdGlvbnMuY2hhcnRUeXBlLFxuICAgICAgICAgICAgU2VyaWVzOiBTZXJpZXMsXG4gICAgICAgICAgICBzZXJpZXNEYXRhOiB7XG4gICAgICAgICAgICAgICAgYWxsb3dOZWdhdGl2ZVRvb2x0aXA6IHRydWUsXG4gICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZXM6IGNhbGN1bGF0b3IuYXJyYXlQaXZvdChjb252ZXJ0RGF0YS52YWx1ZXMpLFxuICAgICAgICAgICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXM6IGNhbGN1bGF0b3IuYXJyYXlQaXZvdChjb252ZXJ0RGF0YS5mb3JtYXR0ZWRWYWx1ZXMpLFxuICAgICAgICAgICAgICAgICAgICBzY2FsZTogYXhlc0RhdGEueUF4aXMuc2NhbGVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuXG5BeGlzVHlwZUJhc2UubWl4aW4oQXJlYUNoYXJ0KTtcblZlcnRpY2FsVHlwZUJhc2UubWl4aW4oQXJlYUNoYXJ0KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBcmVhQ2hhcnQ7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgQXhpc1R5cGVCYXNlIGlzIGJhc2UgY2xhc3Mgb2YgYXhpcyB0eXBlIGNoYXJ0KGJhciwgY29sdW1uLCBsaW5lLCBhcmVhKS5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIEF4aXMgPSByZXF1aXJlKCcuLi9heGVzL2F4aXMuanMnKSxcbiAgICBQbG90ID0gcmVxdWlyZSgnLi4vcGxvdHMvcGxvdC5qcycpLFxuICAgIExlZ2VuZCA9IHJlcXVpcmUoJy4uL2xlZ2VuZHMvbGVnZW5kLmpzJyksXG4gICAgVG9vbHRpcCA9IHJlcXVpcmUoJy4uL3Rvb2x0aXBzL3Rvb2x0aXAuanMnKTtcblxuLyoqXG4gKiBAY2xhc3NkZXNjIEF4aXNUeXBlQmFzZSBpcyBiYXNlIGNsYXNzIG9mIGF4aXMgdHlwZSBjaGFydChiYXIsIGNvbHVtbiwgbGluZSwgYXJlYSkuXG4gKiBAY2xhc3MgQXhpc1R5cGVCYXNlXG4gKiBAbWl4aW5cbiAqL1xudmFyIEF4aXNUeXBlQmFzZSA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBBeGlzVHlwZUJhc2UucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBBZGQgYXhpcyBjb21wb25lbnRzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmNvdmVydERhdGEgY29udmVydGVkIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuYXhlcyBheGVzIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMucGxvdERhdGEgcGxvdCBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge2Z1bmN0aW9ufSBwYXJhbXMuU2VyaWVzIHNlcmllcyBjbGFzc1xuICAgICAqL1xuICAgIGFkZEF4aXNDb21wb25lbnRzOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGNvbnZlcnREYXRhID0gcGFyYW1zLmNvbnZlcnREYXRhLFxuICAgICAgICAgICAgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcblxuICAgICAgICBpZiAocGFyYW1zLnBsb3REYXRhKSB7XG4gICAgICAgICAgICB0aGlzLmFkZENvbXBvbmVudCgncGxvdCcsIFBsb3QsIHBhcmFtcy5wbG90RGF0YSk7XG4gICAgICAgIH1cblxuICAgICAgICBuZS51dGlsLmZvckVhY2gocGFyYW1zLmF4ZXMsIGZ1bmN0aW9uKGRhdGEsIG5hbWUpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KG5hbWUsIEF4aXMsIHtcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgaWYgKGNvbnZlcnREYXRhLmpvaW5MZWdlbmRMYWJlbHMpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KCdsZWdlbmQnLCBMZWdlbmQsIHtcbiAgICAgICAgICAgICAgICBqb2luTGVnZW5kTGFiZWxzOiBjb252ZXJ0RGF0YS5qb2luTGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgICAgIGxlZ2VuZExhYmVsczogY29udmVydERhdGEubGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgICAgIGNoYXJ0VHlwZTogcGFyYW1zLmNoYXJ0VHlwZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmFkZENvbXBvbmVudCgnc2VyaWVzJywgcGFyYW1zLlNlcmllcywgbmUudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgbGliVHlwZTogb3B0aW9ucy5saWJUeXBlLFxuICAgICAgICAgICAgY2hhcnRUeXBlOiBvcHRpb25zLmNoYXJ0VHlwZSxcbiAgICAgICAgICAgIHRvb2x0aXBQcmVmaXg6IHRoaXMudG9vbHRpcFByZWZpeCxcbiAgICAgICAgfSwgcGFyYW1zLnNlcmllc0RhdGEpKTtcblxuICAgICAgICB0aGlzLmFkZENvbXBvbmVudCgndG9vbHRpcCcsIFRvb2x0aXAsIHtcbiAgICAgICAgICAgIHZhbHVlczogY29udmVydERhdGEudmFsdWVzLFxuICAgICAgICAgICAgZm9ybWF0dGVkVmFsdWVzOiBjb252ZXJ0RGF0YS5mb3JtYXR0ZWRWYWx1ZXMsXG4gICAgICAgICAgICBsYWJlbHM6IGNvbnZlcnREYXRhLmxhYmVscyxcbiAgICAgICAgICAgIGxlZ2VuZExhYmVsczogY29udmVydERhdGEubGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgcHJlZml4OiB0aGlzLnRvb2x0aXBQcmVmaXhcbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5cbkF4aXNUeXBlQmFzZS5taXhpbiA9IGZ1bmN0aW9uKGZ1bmMpIHtcbiAgICBuZS51dGlsLmV4dGVuZChmdW5jLnByb3RvdHlwZSwgQXhpc1R5cGVCYXNlLnByb3RvdHlwZSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEF4aXNUeXBlQmFzZTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBCYXIgY2hhcnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBDaGFydEJhc2UgPSByZXF1aXJlKCcuL2NoYXJ0QmFzZScpLFxuICAgIEF4aXNUeXBlQmFzZSA9IHJlcXVpcmUoJy4vYXhpc1R5cGVCYXNlJyksXG4gICAgYXhpc0RhdGFNYWtlciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvYXhpc0RhdGFNYWtlcicpLFxuICAgIFNlcmllcyA9IHJlcXVpcmUoJy4uL3Nlcmllcy9iYXJDaGFydFNlcmllcycpO1xuXG52YXIgQmFyQ2hhcnQgPSBuZS51dGlsLmRlZmluZUNsYXNzKENoYXJ0QmFzZSwgLyoqIEBsZW5kcyBCYXJDaGFydC5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIEJhciBjaGFydC5cbiAgICAgKiBAY29uc3RydWN0cyBCYXJDaGFydFxuICAgICAqIEBleHRlbmRzIENoYXJ0QmFzZVxuICAgICAqIEBtaXhlcyBBeGlzVHlwZUJhc2VcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheT59IHVzZXJEYXRhIGNoYXJ0IGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgY2hhcnQgdGhlbWVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24odXNlckRhdGEsIHRoZW1lLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciBiYXNlRGF0YSA9IHRoaXMubWFrZUJhc2VEYXRhKHVzZXJEYXRhLCB0aGVtZSwgb3B0aW9ucywge1xuICAgICAgICAgICAgICAgIGhhc0F4ZXM6IHRydWVcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgY29udmVydERhdGEgPSBiYXNlRGF0YS5jb252ZXJ0RGF0YSxcbiAgICAgICAgICAgIGJvdW5kcyA9IGJhc2VEYXRhLmJvdW5kcyxcbiAgICAgICAgICAgIGF4aXNEYXRhO1xuXG4gICAgICAgIHRoaXMuY2xhc3NOYW1lID0gJ25lLWJhci1jaGFydCc7XG5cbiAgICAgICAgQ2hhcnRCYXNlLmNhbGwodGhpcywgYm91bmRzLCB0aGVtZSwgb3B0aW9ucyk7XG5cbiAgICAgICAgYXhpc0RhdGEgPSB0aGlzLl9tYWtlQXhlc0RhdGEoY29udmVydERhdGEsIGJvdW5kcywgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMuX2FkZENvbXBvbmVudHMoY29udmVydERhdGEsIGF4aXNEYXRhLCBvcHRpb25zKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBheGVzIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udmVydERhdGEgY29udmVydGVkIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYm91bmRzIGNoYXJ0IGJvdW5kc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBheGVzIGRhdGFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQXhlc0RhdGE6IGZ1bmN0aW9uKGNvbnZlcnREYXRhLCBib3VuZHMsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIGF4ZXNEYXRhID0ge1xuICAgICAgICAgICAgeUF4aXM6IGF4aXNEYXRhTWFrZXIubWFrZUxhYmVsQXhpc0RhdGEoe1xuICAgICAgICAgICAgICAgIGxhYmVsczogY29udmVydERhdGEubGFiZWxzLFxuICAgICAgICAgICAgICAgIGlzVmVydGljYWw6IHRydWVcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgeEF4aXM6IGF4aXNEYXRhTWFrZXIubWFrZVZhbHVlQXhpc0RhdGEoe1xuICAgICAgICAgICAgICAgIHZhbHVlczogY29udmVydERhdGEudmFsdWVzLFxuICAgICAgICAgICAgICAgIHNlcmllc0RpbWVuc2lvbjogYm91bmRzLnNlcmllcy5kaW1lbnNpb24sXG4gICAgICAgICAgICAgICAgc3RhY2tlZDogb3B0aW9ucy5zZXJpZXMgJiYgb3B0aW9ucy5zZXJpZXMuc3RhY2tlZCB8fCAnJyxcbiAgICAgICAgICAgICAgICBjaGFydFR5cGU6IG9wdGlvbnMuY2hhcnRUeXBlLFxuICAgICAgICAgICAgICAgIGZvcm1hdEZ1bmN0aW9uczogY29udmVydERhdGEuZm9ybWF0RnVuY3Rpb25zLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IG9wdGlvbnMueEF4aXNcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBheGVzRGF0YTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIGNvbXBvbmVudHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udmVydERhdGEgY29udmVydGVkIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYXhlc0RhdGEgYXhlcyBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2FkZENvbXBvbmVudHM6IGZ1bmN0aW9uKGNvbnZlcnREYXRhLCBheGVzRGF0YSwgb3B0aW9ucykge1xuICAgICAgICB0aGlzLmFkZEF4aXNDb21wb25lbnRzKHtcbiAgICAgICAgICAgIGNvbnZlcnREYXRhOiBjb252ZXJ0RGF0YSxcbiAgICAgICAgICAgIGF4ZXM6IGF4ZXNEYXRhLFxuICAgICAgICAgICAgcGxvdERhdGE6IHtcbiAgICAgICAgICAgICAgICB2VGlja0NvdW50OiBheGVzRGF0YS55QXhpcy52YWxpZFRpY2tDb3VudCxcbiAgICAgICAgICAgICAgICBoVGlja0NvdW50OiBheGVzRGF0YS54QXhpcy52YWxpZFRpY2tDb3VudFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNoYXJ0VHlwZTogb3B0aW9ucy5jaGFydFR5cGUsXG4gICAgICAgICAgICBTZXJpZXM6IFNlcmllcyxcbiAgICAgICAgICAgIHNlcmllc0RhdGE6IHtcbiAgICAgICAgICAgICAgICBhbGxvd05lZ2F0aXZlVG9vbHRpcDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlczogY29udmVydERhdGEudmFsdWVzLFxuICAgICAgICAgICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXM6IGNvbnZlcnREYXRhLmZvcm1hdHRlZFZhbHVlcyxcbiAgICAgICAgICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zOiBjb252ZXJ0RGF0YS5mb3JtYXRGdW5jdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgIHNjYWxlOiBheGVzRGF0YS54QXhpcy5zY2FsZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5cbkF4aXNUeXBlQmFzZS5taXhpbihCYXJDaGFydCk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmFyQ2hhcnQ7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgQ2hhcnRCYXNlXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBkb20gPSByZXF1aXJlKCcuLi9oZWxwZXJzL2RvbUhhbmRsZXIuanMnKSxcbiAgICByZW5kZXJVdGlsID0gcmVxdWlyZSgnLi4vaGVscGVycy9yZW5kZXJVdGlsLmpzJyksXG4gICAgZGF0YUNvbnZlcnRlciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZGF0YUNvbnZlcnRlci5qcycpLFxuICAgIGJvdW5kc01ha2VyID0gcmVxdWlyZSgnLi4vaGVscGVycy9ib3VuZHNNYWtlci5qcycpO1xuXG52YXIgVE9PTFRJUF9QUkVGSVggPSAnbmUtY2hhcnQtdG9vbHRpcC0nO1xuXG52YXIgQ2hhcnRCYXNlID0gbmUudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIENoYXJ0QmFzZS5wcm90b3R5cGUgKi8ge1xuICAgIHRvb2x0aXBQcmVmaXg6IFRPT0xUSVBfUFJFRklYICsgKG5ldyBEYXRlKCkpLmdldFRpbWUoKSArICctJyxcblxuICAgIC8qKlxuICAgICAqIENoYXJ0IGJhc2UuXG4gICAgICogQGNvbnN0cnVjdHMgQ2hhcnRCYXNlXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGJvdW5kcyBjaGFydCBib3VuZHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgY2hhcnQgdGhlbWVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGluaXRlZERhdGEgaW5pdGlhbGl6ZWQgZGF0YSBmcm9tIGNvbWJvIGNoYXJ0XG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24oYm91bmRzLCB0aGVtZSwgb3B0aW9ucywgaW5pdGVkRGF0YSkge1xuICAgICAgICB0aGlzLmNvbXBvbmVudHMgPSBbXTtcbiAgICAgICAgdGhpcy5jb21wb25lbnRNYXAgPSB7fTtcbiAgICAgICAgdGhpcy5ib3VuZHMgPSBib3VuZHM7XG4gICAgICAgIHRoaXMudGhlbWUgPSB0aGVtZTtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICAgICAgaWYgKGluaXRlZERhdGEgJiYgaW5pdGVkRGF0YS5wcmVmaXgpIHtcbiAgICAgICAgICAgIHRoaXMudG9vbHRpcFByZWZpeCArPSBpbml0ZWREYXRhLnByZWZpeDtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGJhZXMgZGF0YS5cbiAgICAgKiBAcGFyYW0ge2FycmF5IHwgb2JqZWN0fSB1c2VyRGF0YSB1c2VyIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgY2hhcnQgdGhlbWVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGJvdW5kUGFyYW1zIGFkZCBib3VuZCBwYXJhbXNcbiAgICAgKiBAcmV0dXJucyB7e2NvbnZlcnREYXRhOiBvYmplY3QsIGJvdW5kczogb2JqZWN0fX0gYmFzZSBkYXRhXG4gICAgICovXG4gICAgbWFrZUJhc2VEYXRhOiBmdW5jdGlvbih1c2VyRGF0YSwgdGhlbWUsIG9wdGlvbnMsIGJvdW5kUGFyYW1zKSB7XG4gICAgICAgIHZhciBjb252ZXJ0RGF0YSA9IGRhdGFDb252ZXJ0ZXIuY29udmVydCh1c2VyRGF0YSwgb3B0aW9ucy5jaGFydCwgb3B0aW9ucy5jaGFydFR5cGUpLFxuICAgICAgICAgICAgYm91bmRzID0gYm91bmRzTWFrZXIubWFrZShuZS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgY2hhcnRUeXBlOiBvcHRpb25zLmNoYXJ0VHlwZSxcbiAgICAgICAgICAgICAgICBjb252ZXJ0RGF0YTogY29udmVydERhdGEsXG4gICAgICAgICAgICAgICAgdGhlbWU6IHRoZW1lLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IG9wdGlvbnNcbiAgICAgICAgICAgIH0sIGJvdW5kUGFyYW1zKSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNvbnZlcnREYXRhOiBjb252ZXJ0RGF0YSxcbiAgICAgICAgICAgIGJvdW5kczogYm91bmRzXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZCBjb21wb25lbnQuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgY29tcG9uZW50IG5hbWVcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBDb21wb25lbnQgY29tcG9uZW50IGZ1bmN0aW9uXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICovXG4gICAgYWRkQ29tcG9uZW50OiBmdW5jdGlvbihuYW1lLCBDb21wb25lbnQsIHBhcmFtcykge1xuICAgICAgICB2YXIgYm91bmQgPSB0aGlzLmJvdW5kc1tuYW1lXSxcbiAgICAgICAgICAgIHRoZW1lID0gdGhpcy50aGVtZVtuYW1lXSxcbiAgICAgICAgICAgIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnNbbmFtZV0sXG4gICAgICAgICAgICBpbmRleCA9IHBhcmFtcy5pbmRleCB8fCAwLFxuICAgICAgICAgICAgY29tbW9uUGFyYW1zID0ge30sXG4gICAgICAgICAgICBjb21wb25lbnQ7XG5cbiAgICAgICAgY29tbW9uUGFyYW1zLmJvdW5kID0gbmUudXRpbC5pc0FycmF5KGJvdW5kKSA/IGJvdW5kW2luZGV4XSA6IGJvdW5kO1xuICAgICAgICBjb21tb25QYXJhbXMudGhlbWUgPSBuZS51dGlsLmlzQXJyYXkodGhlbWUpID8gdGhlbWVbaW5kZXhdIDogdGhlbWU7XG4gICAgICAgIGNvbW1vblBhcmFtcy5vcHRpb25zID0gbmUudXRpbC5pc0FycmF5KG9wdGlvbnMpID8gb3B0aW9uc1tpbmRleF0gOiBvcHRpb25zIHx8IHt9O1xuXG4gICAgICAgIHBhcmFtcyA9IG5lLnV0aWwuZXh0ZW5kKGNvbW1vblBhcmFtcywgcGFyYW1zKTtcbiAgICAgICAgY29tcG9uZW50ID0gbmV3IENvbXBvbmVudChwYXJhbXMpO1xuICAgICAgICB0aGlzLmNvbXBvbmVudHMucHVzaChjb21wb25lbnQpO1xuICAgICAgICB0aGlzLmNvbXBvbmVudE1hcFtuYW1lXSA9IGNvbXBvbmVudDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIGNoYXJ0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgb2JqZWN0IGZvciBncmFwaCBkcmF3aW5nXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSBjaGFydCBlbGVtZW50XG4gICAgICovXG4gICAgcmVuZGVyOiBmdW5jdGlvbihlbCwgcGFwZXIpIHtcbiAgICAgICAgaWYgKCFlbCkge1xuICAgICAgICAgICAgZWwgPSBkb20uY3JlYXRlKCdESVYnLCB0aGlzLmNsYXNzTmFtZSk7XG5cbiAgICAgICAgICAgIGRvbS5hZGRDbGFzcyhlbCwgJ25lLWNoYXJ0Jyk7XG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJUaXRsZShlbCk7XG4gICAgICAgICAgICByZW5kZXJVdGlsLnJlbmRlckRpbWVuc2lvbihlbCwgdGhpcy5ib3VuZHMuY2hhcnQuZGltZW5zaW9uKTtcbiAgICAgICAgICAgIHJlbmRlclV0aWwucmVuZGVyQmFja2dyb3VuZChlbCwgdGhpcy50aGVtZS5jaGFydC5iYWNrZ3JvdW5kKTtcbiAgICAgICAgICAgIHJlbmRlclV0aWwucmVuZGVyRm9udEZhbWlseShlbCwgdGhpcy50aGVtZS5jaGFydC5mb250RmFtaWx5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3JlbmRlckNvbXBvbmVudHMoZWwsIHRoaXMuY29tcG9uZW50cywgcGFwZXIpO1xuICAgICAgICB0aGlzLl9hdHRhY2hDdXN0b21FdmVudCgpO1xuICAgICAgICByZXR1cm4gZWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciB0aXRsZS5cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlclRpdGxlOiBmdW5jdGlvbihlbCkge1xuICAgICAgICB2YXIgY2hhcnRPcHRpb25zID0gdGhpcy5vcHRpb25zLmNoYXJ0IHx8IHt9LFxuICAgICAgICAgICAgZWxUaXRsZSA9IHJlbmRlclV0aWwucmVuZGVyVGl0bGUoY2hhcnRPcHRpb25zLnRpdGxlLCB0aGlzLnRoZW1lLnRpdGxlLCAnbmUtY2hhcnQtdGl0bGUnKTtcbiAgICAgICAgZG9tLmFwcGVuZChlbCwgZWxUaXRsZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBjb21wb25lbnRzLlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciBjb250YWluZXIgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7YXJyYXkuPG9iamVjdD59IGNvbXBvbmVudHMgY29tcG9uZW50c1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciBvYmplY3QgZm9yIGdyYXBoIGRyYXdpbmdcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJDb21wb25lbnRzOiBmdW5jdGlvbihjb250YWluZXIsIGNvbXBvbmVudHMsIHBhcGVyKSB7XG4gICAgICAgIHZhciBlbGVtZW50cyA9IG5lLnV0aWwubWFwKGNvbXBvbmVudHMsIGZ1bmN0aW9uKGNvbXBvbmVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbXBvbmVudC5yZW5kZXIocGFwZXIpO1xuICAgICAgICB9KTtcbiAgICAgICAgZG9tLmFwcGVuZChjb250YWluZXIsIGVsZW1lbnRzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHBhcGVyLlxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHBhcGVyXG4gICAgICovXG4gICAgZ2V0UGFwZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2VyaWVzID0gdGhpcy5jb21wb25lbnRNYXAuc2VyaWVzLFxuICAgICAgICAgICAgcGFwZXI7XG5cbiAgICAgICAgaWYgKHNlcmllcykge1xuICAgICAgICAgICAgcGFwZXIgPSBzZXJpZXMuZ2V0UGFwZXIoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXBlcjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGN1c3RvbSBldmVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2F0dGFjaEN1c3RvbUV2ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHRvb2x0aXAgPSB0aGlzLmNvbXBvbmVudE1hcC50b29sdGlwLFxuICAgICAgICAgICAgc2VyaWVzID0gdGhpcy5jb21wb25lbnRNYXAuc2VyaWVzO1xuICAgICAgICBpZiAoIXRvb2x0aXAgfHwgIXNlcmllcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHNlcmllcy5vbignc2hvd1Rvb2x0aXAnLCB0b29sdGlwLm9uU2hvdywgdG9vbHRpcCk7XG4gICAgICAgIHNlcmllcy5vbignaGlkZVRvb2x0aXAnLCB0b29sdGlwLm9uSGlkZSwgdG9vbHRpcCk7XG5cbiAgICAgICAgaWYgKCFzZXJpZXMub25TaG93QW5pbWF0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0b29sdGlwLm9uKCdzaG93QW5pbWF0aW9uJywgc2VyaWVzLm9uU2hvd0FuaW1hdGlvbiwgc2VyaWVzKTtcbiAgICAgICAgdG9vbHRpcC5vbignaGlkZUFuaW1hdGlvbicsIHNlcmllcy5vbkhpZGVBbmltYXRpb24sIHNlcmllcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFuaW1hdGUgY2hhcnQuXG4gICAgICovXG4gICAgYW5pbWF0ZUNoYXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkodGhpcy5jb21wb25lbnRzLCBmdW5jdGlvbihjb21wb25lbnQpIHtcbiAgICAgICAgICAgIGlmIChjb21wb25lbnQuYW5pbWF0ZUNvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5hbmltYXRlQ29tcG9uZW50KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBDaGFydEJhc2U7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgQ29sdW1uIGNoYXJ0LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ2hhcnRCYXNlID0gcmVxdWlyZSgnLi9jaGFydEJhc2UnKSxcbiAgICBBeGlzVHlwZUJhc2UgPSByZXF1aXJlKCcuL2F4aXNUeXBlQmFzZScpLFxuICAgIFZlcnRpY2FsVHlwZUJhc2UgPSByZXF1aXJlKCcuL3ZlcnRpY2FsVHlwZUJhc2UnKSxcbiAgICBTZXJpZXMgPSByZXF1aXJlKCcuLi9zZXJpZXMvY29sdW1uQ2hhcnRTZXJpZXMnKTtcblxudmFyIENvbHVtbkNoYXJ0ID0gbmUudXRpbC5kZWZpbmVDbGFzcyhDaGFydEJhc2UsIC8qKiBAbGVuZHMgQ29sdW1uQ2hhcnQucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBDb2x1bW4gY2hhcnQuXG4gICAgICogQGNvbnN0cnVjdHMgQ29sdW1uQ2hhcnRcbiAgICAgKiBAZXh0ZW5kcyBDaGFydEJhc2VcbiAgICAgKiBAbWl4ZXMgQXhpc1R5cGVCYXNlXG4gICAgICogQG1peGVzIFZlcnRpY2FsVHlwZUJhc2VcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheT59IHVzZXJEYXRhIGNoYXJ0IGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgY2hhcnQgdGhlbWVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGluaXRlZERhdGEgaW5pdGlhbGl6ZWQgZGF0YSBmcm9tIGNvbWJvIGNoYXJ0XG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24odXNlckRhdGEsIHRoZW1lLCBvcHRpb25zLCBpbml0ZWREYXRhKSB7XG4gICAgICAgIHZhciBiYXNlRGF0YSA9IGluaXRlZERhdGEgfHwgdGhpcy5tYWtlQmFzZURhdGEodXNlckRhdGEsIHRoZW1lLCBvcHRpb25zLCB7XG4gICAgICAgICAgICAgICAgaXNWZXJ0aWNhbDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBoYXNBeGVzOiB0cnVlXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGNvbnZlcnREYXRhID0gYmFzZURhdGEuY29udmVydERhdGEsXG4gICAgICAgICAgICBib3VuZHMgPSBiYXNlRGF0YS5ib3VuZHMsXG4gICAgICAgICAgICBheGlzRGF0YTtcblxuICAgICAgICB0aGlzLmNsYXNzTmFtZSA9ICduZS1jb2x1bW4tY2hhcnQnO1xuXG4gICAgICAgIENoYXJ0QmFzZS5jYWxsKHRoaXMsIGJvdW5kcywgdGhlbWUsIG9wdGlvbnMsIGluaXRlZERhdGEpO1xuXG4gICAgICAgIGF4aXNEYXRhID0gdGhpcy5fbWFrZUF4ZXNEYXRhKGNvbnZlcnREYXRhLCBib3VuZHMsIG9wdGlvbnMsIGluaXRlZERhdGEpO1xuICAgICAgICB0aGlzLl9hZGRDb21wb25lbnRzKGNvbnZlcnREYXRhLCBheGlzRGF0YSwgb3B0aW9ucyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZCBjb21wb25lbnRzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGNvbnZlcnREYXRhIGNvbnZlcnRlZCBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGF4ZXNEYXRhIGF4ZXMgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hZGRDb21wb25lbnRzOiBmdW5jdGlvbihjb252ZXJ0RGF0YSwgYXhlc0RhdGEsIG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5hZGRBeGlzQ29tcG9uZW50cyh7XG4gICAgICAgICAgICBjb252ZXJ0RGF0YTogY29udmVydERhdGEsXG4gICAgICAgICAgICBheGVzOiBheGVzRGF0YSxcbiAgICAgICAgICAgIHBsb3REYXRhOiAhbmUudXRpbC5pc1VuZGVmaW5lZChjb252ZXJ0RGF0YS5wbG90RGF0YSkgPyBjb252ZXJ0RGF0YS5wbG90RGF0YSA6IHtcbiAgICAgICAgICAgICAgICB2VGlja0NvdW50OiBheGVzRGF0YS55QXhpcy52YWxpZFRpY2tDb3VudCxcbiAgICAgICAgICAgICAgICBoVGlja0NvdW50OiBheGVzRGF0YS54QXhpcy52YWxpZFRpY2tDb3VudFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNoYXJ0VHlwZTogb3B0aW9ucy5jaGFydFR5cGUsXG4gICAgICAgICAgICBTZXJpZXM6IFNlcmllcyxcbiAgICAgICAgICAgIHNlcmllc0RhdGE6IHtcbiAgICAgICAgICAgICAgICBhbGxvd05lZ2F0aXZlVG9vbHRpcDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlczogY29udmVydERhdGEudmFsdWVzLFxuICAgICAgICAgICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXM6IGNvbnZlcnREYXRhLmZvcm1hdHRlZFZhbHVlcyxcbiAgICAgICAgICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zOiBjb252ZXJ0RGF0YS5mb3JtYXRGdW5jdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgIHNjYWxlOiBheGVzRGF0YS55QXhpcy5zY2FsZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5cbkF4aXNUeXBlQmFzZS5taXhpbihDb2x1bW5DaGFydCk7XG5WZXJ0aWNhbFR5cGVCYXNlLm1peGluKENvbHVtbkNoYXJ0KTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb2x1bW5DaGFydDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBDb21ibyBjaGFydC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGNhbGN1bGF0b3IgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2NhbGN1bGF0b3IuanMnKSxcbiAgICBDaGFydEJhc2UgPSByZXF1aXJlKCcuL2NoYXJ0QmFzZS5qcycpLFxuICAgIGF4aXNEYXRhTWFrZXIgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2F4aXNEYXRhTWFrZXIuanMnKSxcbiAgICBkZWZhdWx0VGhlbWUgPSByZXF1aXJlKCcuLi90aGVtZXMvZGVmYXVsdFRoZW1lLmpzJyksXG4gICAgQ29sdW1uQ2hhcnQgPSByZXF1aXJlKCcuL2NvbHVtbkNoYXJ0JyksXG4gICAgTGluZUNoYXJ0ID0gcmVxdWlyZSgnLi9saW5lQ2hhcnQnKTtcblxudmFyIENvbWJvQ2hhcnQgPSBuZS51dGlsLmRlZmluZUNsYXNzKENoYXJ0QmFzZSwgLyoqIEBsZW5kcyBDb21ib0NoYXJ0LnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogQ29tYm8gY2hhcnQuXG4gICAgICogQGNvbnN0cnVjdHMgQ29tYm9DaGFydFxuICAgICAqIEBleHRlbmRzIENoYXJ0QmFzZVxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gdXNlckRhdGEgY2hhcnQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBjaGFydCB0aGVtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbih1c2VyRGF0YSwgdGhlbWUsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIHNlcmllc0NoYXJ0VHlwZXMgPSBuZS51dGlsLmtleXModXNlckRhdGEuc2VyaWVzKS5zb3J0KCksXG4gICAgICAgICAgICBvcHRpb25DaGFydFR5cGVzID0gdGhpcy5fZ2V0WUF4aXNPcHRpb25DaGFydFR5cGVzKHNlcmllc0NoYXJ0VHlwZXMsIG9wdGlvbnMueUF4aXMpLFxuICAgICAgICAgICAgY2hhcnRUeXBlcyA9IG9wdGlvbkNoYXJ0VHlwZXMubGVuZ3RoID8gb3B0aW9uQ2hhcnRUeXBlcyA6IHNlcmllc0NoYXJ0VHlwZXMsXG4gICAgICAgICAgICBiYXNlRGF0YSA9IHRoaXMubWFrZUJhc2VEYXRhKHVzZXJEYXRhLCB0aGVtZSwgb3B0aW9ucywge1xuICAgICAgICAgICAgICAgIGlzVmVydGljYWw6IHRydWUsXG4gICAgICAgICAgICAgICAgaGFzQXhlczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBvcHRpb25DaGFydFR5cGVzOiBvcHRpb25DaGFydFR5cGVzXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGNvbnZlcnREYXRhID0gYmFzZURhdGEuY29udmVydERhdGEsXG4gICAgICAgICAgICBib3VuZHMgPSBiYXNlRGF0YS5ib3VuZHMsXG4gICAgICAgICAgICBvcHRpb25zTWFwID0gdGhpcy5fbWFrZU9wdGlvbnNNYXAoY2hhcnRUeXBlcywgb3B0aW9ucyksXG4gICAgICAgICAgICB0aGVtZU1hcCA9IHRoaXMuX21ha2VUaGVtZU1hcChzZXJpZXNDaGFydFR5cGVzLCB0aGVtZSwgY29udmVydERhdGEubGVnZW5kTGFiZWxzKSxcbiAgICAgICAgICAgIHlBeGlzUGFyYW1zID0ge1xuICAgICAgICAgICAgICAgIGNvbnZlcnREYXRhOiBjb252ZXJ0RGF0YSxcbiAgICAgICAgICAgICAgICBzZXJpZXNEaW1lbnNpb246IGJvdW5kcy5zZXJpZXMuZGltZW5zaW9uLFxuICAgICAgICAgICAgICAgIGNoYXJ0VHlwZXM6IGNoYXJ0VHlwZXMsXG4gICAgICAgICAgICAgICAgaXNPbmVZQXhpczogIW9wdGlvbkNoYXJ0VHlwZXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IG9wdGlvbnNcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBiYXNlQXhlc0RhdGEgPSB7fTtcblxuICAgICAgICB0aGlzLmNsYXNzTmFtZSA9ICduZS1jb21iby1jaGFydCc7XG5cbiAgICAgICAgQ2hhcnRCYXNlLmNhbGwodGhpcywgYm91bmRzLCB0aGVtZSwgb3B0aW9ucyk7XG5cbiAgICAgICAgYmFzZUF4ZXNEYXRhLnlBeGlzID0gdGhpcy5fbWFrZVlBeGlzRGF0YShuZS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICBpbmRleDogMFxuICAgICAgICB9LCB5QXhpc1BhcmFtcykpO1xuXG4gICAgICAgIGJhc2VBeGVzRGF0YS54QXhpcyA9IGF4aXNEYXRhTWFrZXIubWFrZUxhYmVsQXhpc0RhdGEoe1xuICAgICAgICAgICAgbGFiZWxzOiBjb252ZXJ0RGF0YS5sYWJlbHNcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5faW5zdGFsbENoYXJ0cyh7XG4gICAgICAgICAgICB1c2VyRGF0YTogdXNlckRhdGEsXG4gICAgICAgICAgICBiYXNlRGF0YTogYmFzZURhdGEsXG4gICAgICAgICAgICBiYXNlQXhlc0RhdGE6IGJhc2VBeGVzRGF0YSxcbiAgICAgICAgICAgIGF4ZXNEYXRhOiB0aGlzLl9tYWtlQXhlc0RhdGEoYmFzZUF4ZXNEYXRhLCB5QXhpc1BhcmFtcyksXG4gICAgICAgICAgICBzZXJpZXNDaGFydFR5cGVzOiBzZXJpZXNDaGFydFR5cGVzLFxuICAgICAgICAgICAgb3B0aW9uc01hcDogb3B0aW9uc01hcCxcbiAgICAgICAgICAgIHRoZW1lTWFwOiB0aGVtZU1hcFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHkgYXhpcyBvcHRpb24gY2hhcnQgdHlwZXMuXG4gICAgICogQHBhcmFtIHthcnJheS48c3RyaW5nPn0gY2hhcnRUeXBlcyBjaGFydCB0eXBlc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB5QXhpc09wdGlvbnMgeSBheGlzIG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPHN0cmluZz59IGNoYXJ0IHR5cGVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0WUF4aXNPcHRpb25DaGFydFR5cGVzOiBmdW5jdGlvbihjaGFydFR5cGVzLCB5QXhpc09wdGlvbnMpIHtcbiAgICAgICAgdmFyIHJlc3VsdENoYXJ0VHlwZXMgPSBjaGFydFR5cGVzLnNsaWNlKCksXG4gICAgICAgICAgICBpc1JldmVyc2UgPSBmYWxzZSxcbiAgICAgICAgICAgIG9wdGlvbkNoYXJ0VHlwZXM7XG5cbiAgICAgICAgeUF4aXNPcHRpb25zID0geUF4aXNPcHRpb25zID8gW10uY29uY2F0KHlBeGlzT3B0aW9ucykgOiBbXTtcblxuICAgICAgICBpZiAoeUF4aXNPcHRpb25zLmxlbmd0aCA9PT0gMSAmJiAheUF4aXNPcHRpb25zWzBdLmNoYXJ0VHlwZSkge1xuICAgICAgICAgICAgcmVzdWx0Q2hhcnRUeXBlcyA9IFtdO1xuICAgICAgICB9IGVsc2UgaWYgKHlBeGlzT3B0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgICAgIG9wdGlvbkNoYXJ0VHlwZXMgPSBuZS51dGlsLm1hcCh5QXhpc09wdGlvbnMsIGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb24uY2hhcnRUeXBlO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KG9wdGlvbkNoYXJ0VHlwZXMsIGZ1bmN0aW9uKGNoYXJ0VHlwZSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICBpc1JldmVyc2UgPSBpc1JldmVyc2UgfHwgKGNoYXJ0VHlwZSAmJiByZXN1bHRDaGFydFR5cGVzW2luZGV4XSAhPT0gY2hhcnRUeXBlIHx8IGZhbHNlKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAoaXNSZXZlcnNlKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0Q2hhcnRUeXBlcy5yZXZlcnNlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0Q2hhcnRUeXBlcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSB5IGF4aXMgZGF0YS5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuaW5kZXggY2hhcnQgaW5kZXhcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuY29udmVydERhdGEgY29udmVydGVkIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gcGFyYW1zLnNlcmllc0RpbWVuc2lvbiBzZXJpZXMgZGltZW5zaW9uXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBjaGFydFR5cGVzIGNoYXJ0IHR5cGVcbiAgICAgKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gaXNPbmVZQXhpcyB3aGV0aGVyIG9uZSBzZXJpZXMgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gYWRkUGFyYW1zIGFkZCBwYXJhbXNcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSB5IGF4aXMgZGF0YVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VZQXhpc0RhdGE6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgY29udmVydERhdGEgPSBwYXJhbXMuY29udmVydERhdGEsXG4gICAgICAgICAgICBpbmRleCA9IHBhcmFtcy5pbmRleCxcbiAgICAgICAgICAgIGNoYXJ0VHlwZSA9IHBhcmFtcy5jaGFydFR5cGVzW2luZGV4XSxcbiAgICAgICAgICAgIG9wdGlvbnMgPSBwYXJhbXMub3B0aW9ucyxcbiAgICAgICAgICAgIHlBeGlzVmFsdWVzLCB5QXhpc09wdGlvbnMsIHNlcmllc09wdGlvbjtcblxuICAgICAgICBpZiAocGFyYW1zLmlzT25lWUF4aXMpIHtcbiAgICAgICAgICAgIHlBeGlzVmFsdWVzID0gY29udmVydERhdGEuam9pblZhbHVlcztcbiAgICAgICAgICAgIHlBeGlzT3B0aW9ucyA9IFtvcHRpb25zLnlBeGlzXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHlBeGlzVmFsdWVzID0gY29udmVydERhdGEudmFsdWVzW2NoYXJ0VHlwZV07XG4gICAgICAgICAgICB5QXhpc09wdGlvbnMgPSBvcHRpb25zLnlBeGlzIHx8IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgc2VyaWVzT3B0aW9uID0gb3B0aW9ucy5zZXJpZXMgJiYgb3B0aW9ucy5zZXJpZXNbY2hhcnRUeXBlXSB8fCBvcHRpb25zLnNlcmllcztcblxuICAgICAgICByZXR1cm4gYXhpc0RhdGFNYWtlci5tYWtlVmFsdWVBeGlzRGF0YShuZS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICB2YWx1ZXM6IHlBeGlzVmFsdWVzLFxuICAgICAgICAgICAgc3RhY2tlZDogc2VyaWVzT3B0aW9uICYmIHNlcmllc09wdGlvbi5zdGFja2VkIHx8ICcnLFxuICAgICAgICAgICAgb3B0aW9uczogeUF4aXNPcHRpb25zW2luZGV4XSxcbiAgICAgICAgICAgIGNoYXJ0VHlwZTogY2hhcnRUeXBlLFxuICAgICAgICAgICAgc2VyaWVzRGltZW5zaW9uOiBwYXJhbXMuc2VyaWVzRGltZW5zaW9uLFxuICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zOiBjb252ZXJ0RGF0YS5mb3JtYXRGdW5jdGlvbnMsXG4gICAgICAgICAgICBpc1ZlcnRpY2FsOiB0cnVlXG4gICAgICAgIH0sIHBhcmFtcy5hZGRQYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBheGVzIGRhdGEuXG4gICAgICogQHBhcmFtIHt7eUF4aXM6IG9iamVjdCwgeEF4aXM6IG9iamVjdH19IGJhc2VBeGVzRGF0YSBiYXNlIGF4ZXMgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB5QXhpc1BhcmFtcyB5IGF4aXMgcGFyYW1zXG4gICAgICogQHJldHVybnMge29iamVjdH0gYXhlcyBkYXRhXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUF4ZXNEYXRhOiBmdW5jdGlvbihiYXNlQXhlc0RhdGEsIHlBeGlzUGFyYW1zKSB7XG4gICAgICAgIHZhciB5QXhpc0RhdGEgPSBiYXNlQXhlc0RhdGEueUF4aXMsXG4gICAgICAgICAgICBjaGFydFR5cGVzID0geUF4aXNQYXJhbXMuY2hhcnRUeXBlcyxcbiAgICAgICAgICAgIGF4ZXNEYXRhID0ge30sXG4gICAgICAgICAgICB5ckF4aXNEYXRhO1xuICAgICAgICBpZiAoIXlBeGlzUGFyYW1zLmlzT25lWUF4aXMpIHtcbiAgICAgICAgICAgIHlyQXhpc0RhdGEgPSB0aGlzLl9tYWtlWUF4aXNEYXRhKG5lLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICBpbmRleDogMSxcbiAgICAgICAgICAgICAgICBhZGRQYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaXNQb3NpdGlvblJpZ2h0OiB0cnVlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgeUF4aXNQYXJhbXMpKTtcbiAgICAgICAgICAgIGlmICh5QXhpc0RhdGEudGlja0NvdW50IDwgeXJBeGlzRGF0YS50aWNrQ291bnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbmNyZWFzZVlBeGlzVGlja0NvdW50KHlyQXhpc0RhdGEudGlja0NvdW50IC0geUF4aXNEYXRhLnRpY2tDb3VudCwgeUF4aXNEYXRhKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoeUF4aXNEYXRhLnRpY2tDb3VudCA+IHlyQXhpc0RhdGEudGlja0NvdW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5jcmVhc2VZQXhpc1RpY2tDb3VudCh5QXhpc0RhdGEudGlja0NvdW50IC0geXJBeGlzRGF0YS50aWNrQ291bnQsIHlyQXhpc0RhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgYXhlc0RhdGFbY2hhcnRUeXBlc1swXV0gPSBiYXNlQXhlc0RhdGE7XG4gICAgICAgIGF4ZXNEYXRhW2NoYXJ0VHlwZXNbMV1dID0ge1xuICAgICAgICAgICAgeUF4aXM6IHlyQXhpc0RhdGEgfHwgeUF4aXNEYXRhXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIGF4ZXNEYXRhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIG9yZGVyIGluZm8gYWJvdW5kIGNoYXJ0IHR5cGUuXG4gICAgICogQHBhcmFtIHthcnJheS48c3RyaW5nPn0gY2hhcnRUeXBlcyBjaGFydCB0eXBlc1xuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IGNoYXJ0IG9yZGVyIGluZm9cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQ2hhcnRUeXBlT3JkZXJJbmZvOiBmdW5jdGlvbihjaGFydFR5cGVzKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkoY2hhcnRUeXBlcywgZnVuY3Rpb24oY2hhcnRUeXBlLCBpbmRleCkge1xuICAgICAgICAgICAgcmVzdWx0W2NoYXJ0VHlwZV0gPSBpbmRleDtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2Ugb3B0aW9ucyBtYXBcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY2hhcnRUeXBlcyBjaGFydCB0eXBlc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3JkZXJJbmZvIGNoYXJ0IG9yZGVyXG4gICAgICogQHJldHVybnMge29iamVjdH0gb3B0aW9ucyBtYXBcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlT3B0aW9uc01hcDogZnVuY3Rpb24oY2hhcnRUeXBlcywgb3B0aW9ucykge1xuICAgICAgICB2YXIgb3JkZXJJbmZvID0gdGhpcy5fbWFrZUNoYXJ0VHlwZU9yZGVySW5mbyhjaGFydFR5cGVzKSxcbiAgICAgICAgICAgIHJlc3VsdCA9IHt9O1xuICAgICAgICBuZS51dGlsLmZvckVhY2hBcnJheShjaGFydFR5cGVzLCBmdW5jdGlvbihjaGFydFR5cGUpIHtcbiAgICAgICAgICAgIHZhciBjaGFydE9wdGlvbnMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9wdGlvbnMpKSxcbiAgICAgICAgICAgICAgICBpbmRleCA9IG9yZGVySW5mb1tjaGFydFR5cGVdO1xuXG4gICAgICAgICAgICBpZiAoY2hhcnRPcHRpb25zLnlBeGlzICYmIGNoYXJ0T3B0aW9ucy55QXhpc1tpbmRleF0pIHtcbiAgICAgICAgICAgICAgICBjaGFydE9wdGlvbnMueUF4aXMgPSBjaGFydE9wdGlvbnMueUF4aXNbaW5kZXhdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoY2hhcnRPcHRpb25zLnNlcmllcyAmJiBjaGFydE9wdGlvbnMuc2VyaWVzW2NoYXJ0VHlwZV0pIHtcbiAgICAgICAgICAgICAgICBjaGFydE9wdGlvbnMuc2VyaWVzID0gY2hhcnRPcHRpb25zLnNlcmllc1tjaGFydFR5cGVdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoY2hhcnRPcHRpb25zLnRvb2x0aXAgJiYgY2hhcnRPcHRpb25zLnRvb2x0aXBbY2hhcnRUeXBlXSkge1xuICAgICAgICAgICAgICAgIGNoYXJ0T3B0aW9ucy50b29sdGlwID0gY2hhcnRPcHRpb25zLnRvb2x0aXBbY2hhcnRUeXBlXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNoYXJ0T3B0aW9ucy5jaGFydFR5cGUgPSBjaGFydFR5cGU7XG4gICAgICAgICAgICByZXN1bHRbY2hhcnRUeXBlXSA9IGNoYXJ0T3B0aW9ucztcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgdGhlbWUgbWFwXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGNoYXJ0VHlwZXMgY2hhcnQgdHlwZXNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgY2hhcnQgdGhlbWVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gbGVnZW5kTGFiZWxzIGxlZ2VuZCBsYWJlbHNcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSB0aGVtZSBtYXBcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlVGhlbWVNYXA6IGZ1bmN0aW9uKGNoYXJ0VHlwZXMsIHRoZW1lLCBsZWdlbmRMYWJlbHMpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHt9LFxuICAgICAgICAgICAgY29sb3JDb3VudCA9IDA7XG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KGNoYXJ0VHlwZXMsIGZ1bmN0aW9uKGNoYXJ0VHlwZSkge1xuICAgICAgICAgICAgdmFyIGNoYXJ0VGhlbWUgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoZW1lKSksXG4gICAgICAgICAgICAgICAgcmVtb3ZlZENvbG9ycztcblxuICAgICAgICAgICAgaWYgKGNoYXJ0VGhlbWUueUF4aXNbY2hhcnRUeXBlXSkge1xuICAgICAgICAgICAgICAgIGNoYXJ0VGhlbWUueUF4aXMgPSBjaGFydFRoZW1lLnlBeGlzW2NoYXJ0VHlwZV07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFjaGFydFRoZW1lLnlBeGlzLnRpdGxlKSB7XG4gICAgICAgICAgICAgICAgY2hhcnRUaGVtZS55QXhpcyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZGVmYXVsdFRoZW1lLnlBeGlzKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChjaGFydFRoZW1lLnNlcmllc1tjaGFydFR5cGVdKSB7XG4gICAgICAgICAgICAgICAgY2hhcnRUaGVtZS5zZXJpZXMgPSBjaGFydFRoZW1lLnNlcmllc1tjaGFydFR5cGVdO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghY2hhcnRUaGVtZS5zZXJpZXMuY29sb3JzKSB7XG4gICAgICAgICAgICAgICAgY2hhcnRUaGVtZS5zZXJpZXMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGRlZmF1bHRUaGVtZS5zZXJpZXMpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVtb3ZlZENvbG9ycyA9IGNoYXJ0VGhlbWUuc2VyaWVzLmNvbG9ycy5zcGxpY2UoMCwgY29sb3JDb3VudCk7XG4gICAgICAgICAgICAgICAgY2hhcnRUaGVtZS5zZXJpZXMuY29sb3JzID0gY2hhcnRUaGVtZS5zZXJpZXMuY29sb3JzLmNvbmNhdChyZW1vdmVkQ29sb3JzKTtcbiAgICAgICAgICAgICAgICBjb2xvckNvdW50ICs9IGxlZ2VuZExhYmVsc1tjaGFydFR5cGVdLmxlbmd0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdFtjaGFydFR5cGVdID0gY2hhcnRUaGVtZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEluY3JlYXNlIHkgYXhpcyB0aWNrIGNvdW50LlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmNyZWFzZVRpY2tDb3VudCBpbmNyZWFzZSB0aWNrIGNvdW50XG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRvRGF0YSB0byB0aWNrIGluZm9cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pbmNyZWFzZVlBeGlzVGlja0NvdW50OiBmdW5jdGlvbihpbmNyZWFzZVRpY2tDb3VudCwgdG9EYXRhKSB7XG4gICAgICAgIHRvRGF0YS5zY2FsZS5tYXggKz0gdG9EYXRhLnN0ZXAgKiBpbmNyZWFzZVRpY2tDb3VudDtcbiAgICAgICAgdG9EYXRhLmxhYmVscyA9IGNhbGN1bGF0b3IubWFrZUxhYmVsc0Zyb21TY2FsZSh0b0RhdGEuc2NhbGUsIHRvRGF0YS5zdGVwKTtcbiAgICAgICAgdG9EYXRhLnRpY2tDb3VudCArPSBpbmNyZWFzZVRpY2tDb3VudDtcbiAgICAgICAgdG9EYXRhLnZhbGlkVGlja0NvdW50ICs9IGluY3JlYXNlVGlja0NvdW50O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnN0YWxsIGNoYXJ0cy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudXNlckRhdGEgdXNlciBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmJhc2VEYXRhIGNoYXJ0IGJhc2UgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBjaGFydCB0aGVtZVxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5vcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiAgICAgIEBwYXJhbSB7e3lBeGlzOiBvYmplY3QsIHhBeGlzOiBvYmplY3R9fSBwYXJhbXMuYmFzZUF4ZXNEYXRhIGJhc2UgYXhlcyBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmF4ZXNEYXRhIGF4ZXMgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48c3RyaW5nPn0gcGFyYW1zLnNlcmllc0NoYXJ0VHlwZXMgc2VyaWVzIGNoYXJ0IHR5cGVzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBwYXJhbXMuY2hhcnRUeXBlcyBjaGFydCB0eXBlc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2luc3RhbGxDaGFydHM6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgY2hhcnRDbGFzc2VzID0ge1xuICAgICAgICAgICAgICAgIGNvbHVtbjogQ29sdW1uQ2hhcnQsXG4gICAgICAgICAgICAgICAgbGluZTogTGluZUNoYXJ0XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYmFzZURhdGEgPSBwYXJhbXMuYmFzZURhdGEsXG4gICAgICAgICAgICBjb252ZXJ0RGF0YSA9IGJhc2VEYXRhLmNvbnZlcnREYXRhLFxuICAgICAgICAgICAgZm9ybWF0dGVkVmFsdWVzID0gY29udmVydERhdGEuZm9ybWF0dGVkVmFsdWVzLFxuICAgICAgICAgICAgYmFzZUF4ZXNEYXRhID0gcGFyYW1zLmJhc2VBeGVzRGF0YSxcbiAgICAgICAgICAgIHNlcmllc0NoYXJ0VHlwZXMgPSBwYXJhbXMuc2VyaWVzQ2hhcnRUeXBlcyxcbiAgICAgICAgICAgIG9wdGlvbnNNYXAgPSBwYXJhbXMub3B0aW9uc01hcCxcbiAgICAgICAgICAgIHRoZW1lTWFwID0gcGFyYW1zLnRoZW1lTWFwLFxuICAgICAgICAgICAgcGxvdERhdGEgPSB7XG4gICAgICAgICAgICAgICAgdlRpY2tDb3VudDogYmFzZUF4ZXNEYXRhLnlBeGlzLnZhbGlkVGlja0NvdW50LFxuICAgICAgICAgICAgICAgIGhUaWNrQ291bnQ6IGJhc2VBeGVzRGF0YS54QXhpcy52YWxpZFRpY2tDb3VudFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGpvaW5MZWdlbmRMYWJlbHMgPSBjb252ZXJ0RGF0YS5qb2luTGVnZW5kTGFiZWxzO1xuXG4gICAgICAgIHRoaXMuY2hhcnRzID0gbmUudXRpbC5tYXAoc2VyaWVzQ2hhcnRUeXBlcywgZnVuY3Rpb24oY2hhcnRUeXBlKSB7XG4gICAgICAgICAgICB2YXIgbGVnZW5kTGFiZWxzID0gY29udmVydERhdGEubGVnZW5kTGFiZWxzW2NoYXJ0VHlwZV0sXG4gICAgICAgICAgICAgICAgYXhlcyA9IHBhcmFtcy5heGVzRGF0YVtjaGFydFR5cGVdLFxuICAgICAgICAgICAgICAgIHNlbmRPcHRpb25zID0gb3B0aW9uc01hcFtjaGFydFR5cGVdLFxuICAgICAgICAgICAgICAgIHNlbmRUaGVtZSA9IHRoZW1lTWFwW2NoYXJ0VHlwZV0sXG4gICAgICAgICAgICAgICAgc2VuZEJvdW5kcyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoYmFzZURhdGEuYm91bmRzKSksXG4gICAgICAgICAgICAgICAgY2hhcnQ7XG5cbiAgICAgICAgICAgIGlmIChheGVzICYmIGF4ZXMueUF4aXMuaXNQb3NpdGlvblJpZ2h0KSB7XG4gICAgICAgICAgICAgICAgc2VuZEJvdW5kcy55QXhpcyA9IHNlbmRCb3VuZHMueXJBeGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2hhcnQgPSBuZXcgY2hhcnRDbGFzc2VzW2NoYXJ0VHlwZV0ocGFyYW1zLnVzZXJEYXRhLCBzZW5kVGhlbWUsIHNlbmRPcHRpb25zLCB7XG4gICAgICAgICAgICAgICAgY29udmVydERhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzOiBjb252ZXJ0RGF0YS52YWx1ZXNbY2hhcnRUeXBlXSxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxzOiBjb252ZXJ0RGF0YS5sYWJlbHMsXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdEZ1bmN0aW9uczogY29udmVydERhdGEuZm9ybWF0RnVuY3Rpb25zLFxuICAgICAgICAgICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXM6IGZvcm1hdHRlZFZhbHVlc1tjaGFydFR5cGVdLFxuICAgICAgICAgICAgICAgICAgICBsZWdlbmRMYWJlbHM6IGxlZ2VuZExhYmVscyxcbiAgICAgICAgICAgICAgICAgICAgam9pbkxlZ2VuZExhYmVsczogam9pbkxlZ2VuZExhYmVscyxcbiAgICAgICAgICAgICAgICAgICAgcGxvdERhdGE6IHBsb3REYXRhXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBib3VuZHM6IHNlbmRCb3VuZHMsXG4gICAgICAgICAgICAgICAgYXhlczogYXhlcyxcbiAgICAgICAgICAgICAgICBwcmVmaXg6IGNoYXJ0VHlwZSArICctJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBwbG90RGF0YSA9IG51bGw7XG4gICAgICAgICAgICBqb2luTGVnZW5kTGFiZWxzID0gbnVsbDtcbiAgICAgICAgICAgIHJldHVybiBjaGFydDtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBjb21ibyBjaGFydC5cbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IGNvbWJvIGNoYXJ0IGVsZW1lbnRcbiAgICAgKi9cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZWwgPSBDaGFydEJhc2UucHJvdG90eXBlLnJlbmRlci5jYWxsKHRoaXMpO1xuICAgICAgICB2YXIgcGFwZXI7XG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KHRoaXMuY2hhcnRzLCBmdW5jdGlvbihjaGFydCkge1xuICAgICAgICAgICAgY2hhcnQucmVuZGVyKGVsLCBwYXBlcik7XG4gICAgICAgICAgICBpZiAoIXBhcGVyKSB7XG4gICAgICAgICAgICAgICAgcGFwZXIgPSBjaGFydC5nZXRQYXBlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2hhcnQuYW5pbWF0ZUNoYXJ0KCk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZWw7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29tYm9DaGFydDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBMaW5lIGNoYXJ0XG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBDaGFydEJhc2UgPSByZXF1aXJlKCcuL2NoYXJ0QmFzZScpLFxuICAgIEF4aXNUeXBlQmFzZSA9IHJlcXVpcmUoJy4vYXhpc1R5cGVCYXNlJyksXG4gICAgVmVydGljYWxUeXBlQmFzZSA9IHJlcXVpcmUoJy4vdmVydGljYWxUeXBlQmFzZScpLFxuICAgIGNhbGN1bGF0b3IgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2NhbGN1bGF0b3InKSxcbiAgICBTZXJpZXMgPSByZXF1aXJlKCcuLi9zZXJpZXMvbGluZUNoYXJ0U2VyaWVzJyk7XG5cbnZhciBMaW5lQ2hhcnQgPSBuZS51dGlsLmRlZmluZUNsYXNzKENoYXJ0QmFzZSwgLyoqIEBsZW5kcyBMaW5lQ2hhcnQucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBMaW5lIGNoYXJ0LlxuICAgICAqIEBjb25zdHJ1Y3RzIExpbmVDaGFydFxuICAgICAqIEBleHRlbmRzIENoYXJ0QmFzZVxuICAgICAqIEBtaXhlcyBBeGlzVHlwZUJhc2VcbiAgICAgKiBAbWl4ZXMgVmVydGljYWxUeXBlQmFzZVxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gdXNlckRhdGEgY2hhcnQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBjaGFydCB0aGVtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gaW5pdGVkRGF0YSBpbml0aWFsaXplZCBkYXRhIGZyb20gY29tYm8gY2hhcnRcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbih1c2VyRGF0YSwgdGhlbWUsIG9wdGlvbnMsIGluaXRlZERhdGEpIHtcbiAgICAgICAgdmFyIGJhc2VEYXRhID0gaW5pdGVkRGF0YSB8fCB0aGlzLm1ha2VCYXNlRGF0YSh1c2VyRGF0YSwgdGhlbWUsIG9wdGlvbnMsIHtcbiAgICAgICAgICAgICAgICBpc1ZlcnRpY2FsOiB0cnVlLFxuICAgICAgICAgICAgICAgIGhhc0F4ZXM6IHRydWVcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgY29udmVydERhdGEgPSBiYXNlRGF0YS5jb252ZXJ0RGF0YSxcbiAgICAgICAgICAgIGJvdW5kcyA9IGJhc2VEYXRhLmJvdW5kcyxcbiAgICAgICAgICAgIGF4aXNEYXRhO1xuXG4gICAgICAgIHRoaXMuY2xhc3NOYW1lID0gJ25lLWxpbmUtY2hhcnQnO1xuXG4gICAgICAgIENoYXJ0QmFzZS5jYWxsKHRoaXMsIGJvdW5kcywgdGhlbWUsIG9wdGlvbnMsIGluaXRlZERhdGEpO1xuXG4gICAgICAgIGF4aXNEYXRhID0gdGhpcy5fbWFrZUF4ZXNEYXRhKGNvbnZlcnREYXRhLCBib3VuZHMsIG9wdGlvbnMsIGluaXRlZERhdGEpO1xuICAgICAgICB0aGlzLl9hZGRDb21wb25lbnRzKGNvbnZlcnREYXRhLCBheGlzRGF0YSwgb3B0aW9ucyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZCBjb21wb25lbnRzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGNvbnZlcnREYXRhIGNvbnZlcnRlZCBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGF4ZXNEYXRhIGF4ZXMgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hZGRDb21wb25lbnRzOiBmdW5jdGlvbihjb252ZXJ0RGF0YSwgYXhlc0RhdGEsIG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5hZGRBeGlzQ29tcG9uZW50cyh7XG4gICAgICAgICAgICBjb252ZXJ0RGF0YTogY29udmVydERhdGEsXG4gICAgICAgICAgICBheGVzOiBheGVzRGF0YSxcbiAgICAgICAgICAgIHBsb3REYXRhOiAhbmUudXRpbC5pc1VuZGVmaW5lZChjb252ZXJ0RGF0YS5wbG90RGF0YSkgPyBjb252ZXJ0RGF0YS5wbG90RGF0YSA6IHtcbiAgICAgICAgICAgICAgICB2VGlja0NvdW50OiBheGVzRGF0YS55QXhpcy52YWxpZFRpY2tDb3VudCxcbiAgICAgICAgICAgICAgICBoVGlja0NvdW50OiBheGVzRGF0YS54QXhpcy52YWxpZFRpY2tDb3VudFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNoYXJ0VHlwZTogb3B0aW9ucy5jaGFydFR5cGUsXG4gICAgICAgICAgICBTZXJpZXM6IFNlcmllcyxcbiAgICAgICAgICAgIHNlcmllc0RhdGE6IHtcbiAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlczogY2FsY3VsYXRvci5hcnJheVBpdm90KGNvbnZlcnREYXRhLnZhbHVlcyksXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlczogY2FsY3VsYXRvci5hcnJheVBpdm90KGNvbnZlcnREYXRhLmZvcm1hdHRlZFZhbHVlcyksXG4gICAgICAgICAgICAgICAgICAgIHNjYWxlOiBheGVzRGF0YS55QXhpcy5zY2FsZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5cbkF4aXNUeXBlQmFzZS5taXhpbihMaW5lQ2hhcnQpO1xuVmVydGljYWxUeXBlQmFzZS5taXhpbihMaW5lQ2hhcnQpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IExpbmVDaGFydDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBQaWUgY2hhcnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBDaGFydEJhc2UgPSByZXF1aXJlKCcuL2NoYXJ0QmFzZS5qcycpLFxuICAgIExlZ2VuZCA9IHJlcXVpcmUoJy4uL2xlZ2VuZHMvbGVnZW5kLmpzJyksXG4gICAgVG9vbHRpcCA9IHJlcXVpcmUoJy4uL3Rvb2x0aXBzL3Rvb2x0aXAuanMnKSxcbiAgICBTZXJpZXMgPSByZXF1aXJlKCcuLi9zZXJpZXMvcGllQ2hhcnRTZXJpZXMuanMnKTtcblxudmFyIFBpZUNoYXJ0ID0gbmUudXRpbC5kZWZpbmVDbGFzcyhDaGFydEJhc2UsIC8qKiBAbGVuZHMgUGllQ2hhcnQucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBDb2x1bW4gY2hhcnQuXG4gICAgICogQGNvbnN0cnVjdHMgUGllQ2hhcnRcbiAgICAgKiBAZXh0ZW5kcyBDaGFydEJhc2VcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheT59IHVzZXJEYXRhIGNoYXJ0IGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgY2hhcnQgdGhlbWVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGluaXRlZERhdGEgaW5pdGlhbGl6ZWQgZGF0YSBmcm9tIGNvbWJvIGNoYXJ0XG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24odXNlckRhdGEsIHRoZW1lLCBvcHRpb25zLCBpbml0ZWREYXRhKSB7XG4gICAgICAgIHZhciBiYXNlRGF0YSA9IGluaXRlZERhdGEgfHwgdGhpcy5tYWtlQmFzZURhdGEodXNlckRhdGEsIHRoZW1lLCBvcHRpb25zKSxcbiAgICAgICAgICAgIGNvbnZlcnREYXRhID0gYmFzZURhdGEuY29udmVydERhdGEsXG4gICAgICAgICAgICBib3VuZHMgPSBiYXNlRGF0YS5ib3VuZHM7XG5cbiAgICAgICAgdGhpcy5jbGFzc05hbWUgPSAnbmUtcGllLWNoYXJ0JztcblxuICAgICAgICBvcHRpb25zLnRvb2x0aXAgPSBvcHRpb25zLnRvb2x0aXAgfHwge307XG5cbiAgICAgICAgaWYgKCFvcHRpb25zLnRvb2x0aXAucG9zaXRpb24pIHtcbiAgICAgICAgICAgIG9wdGlvbnMudG9vbHRpcC5wb3NpdGlvbiA9ICdjZW50ZXIgbWlkZGxlJztcbiAgICAgICAgfVxuXG4gICAgICAgIENoYXJ0QmFzZS5jYWxsKHRoaXMsIGJvdW5kcywgdGhlbWUsIG9wdGlvbnMsIGluaXRlZERhdGEpO1xuXG4gICAgICAgIHRoaXMuX2FkZENvbXBvbmVudHMoY29udmVydERhdGEsIHRoZW1lLmNoYXJ0LmJhY2tncm91bmQsIGJvdW5kcywgb3B0aW9ucyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZCBjb21wb25lbnRzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGNvbnZlcnREYXRhIGNvbnZlcnRlZCBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGNoYXJ0QmFja2dyb3VuZCBjaGFydCBiYWNrZ3JvdW5kXG4gICAgICogQHBhcmFtIHthcnJheS48b2JqZWN0Pn0gYm91bmRzIGJvdW5kc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hZGRDb21wb25lbnRzOiBmdW5jdGlvbihjb252ZXJ0RGF0YSwgY2hhcnRCYWNrZ3JvdW5kLCBib3VuZHMsIG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKGNvbnZlcnREYXRhLmpvaW5MZWdlbmRMYWJlbHMgJiYgKCFvcHRpb25zLnNlcmllcyB8fCAhb3B0aW9ucy5zZXJpZXMubGVnZW5kVHlwZSkpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KCdsZWdlbmQnLCBMZWdlbmQsIHtcbiAgICAgICAgICAgICAgICBqb2luTGVnZW5kTGFiZWxzOiBjb252ZXJ0RGF0YS5qb2luTGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgICAgIGxlZ2VuZExhYmVsczogY29udmVydERhdGEubGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgICAgIGNoYXJ0VHlwZTogb3B0aW9ucy5jaGFydFR5cGVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5hZGRDb21wb25lbnQoJ3Rvb2x0aXAnLCBUb29sdGlwLCB7XG4gICAgICAgICAgICB2YWx1ZXM6IGNvbnZlcnREYXRhLmZvcm1hdHRlZFZhbHVlcyxcbiAgICAgICAgICAgIGxhYmVsczogY29udmVydERhdGEubGFiZWxzLFxuICAgICAgICAgICAgbGVnZW5kTGFiZWxzOiBjb252ZXJ0RGF0YS5sZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICBwcmVmaXg6IHRoaXMudG9vbHRpcFByZWZpeFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmFkZENvbXBvbmVudCgnc2VyaWVzJywgU2VyaWVzLCB7XG4gICAgICAgICAgICBsaWJUeXBlOiBvcHRpb25zLmxpYlR5cGUsXG4gICAgICAgICAgICBjaGFydFR5cGU6IG9wdGlvbnMuY2hhcnRUeXBlLFxuICAgICAgICAgICAgdG9vbHRpcFByZWZpeDogdGhpcy50b29sdGlwUHJlZml4LFxuICAgICAgICAgICAgY2hhcnRCYWNrZ3JvdW5kOiBjaGFydEJhY2tncm91bmQsXG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgdmFsdWVzOiBjb252ZXJ0RGF0YS52YWx1ZXMsXG4gICAgICAgICAgICAgICAgZm9ybWF0dGVkVmFsdWVzOiBjb252ZXJ0RGF0YS5mb3JtYXR0ZWRWYWx1ZXMsXG4gICAgICAgICAgICAgICAgbGVnZW5kTGFiZWxzOiBjb252ZXJ0RGF0YS5sZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICAgICAgY2hhcnRXaWR0aDogYm91bmRzLmNoYXJ0LmRpbWVuc2lvbi53aWR0aFxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBQaWVDaGFydDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBWZXJ0aWNhbFR5cGVCYXNlIGlzIGJhc2UgY2xhc3Mgb2YgdmVydGljYWwgdHlwZSBjaGFydChjb2x1bW4sIGxpbmUsIGFyZWEpLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgYXhpc0RhdGFNYWtlciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvYXhpc0RhdGFNYWtlcicpO1xuXG4vKipcbiAqIEBjbGFzc2Rlc2MgVmVydGljYWxUeXBlQmFzZSBpcyBiYXNlIGNsYXNzIG9mIHZlcnRpY2FsIHR5cGUgY2hhcnQoY29sdW1uLCBsaW5lLCBhcmVhKS5cbiAqIEBjbGFzcyBWZXJ0aWNhbFR5cGVCYXNlXG4gKiBAbWl4aW5cbiAqL1xudmFyIFZlcnRpY2FsVHlwZUJhc2UgPSBuZS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgVmVydGljYWxUeXBlQmFzZS5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYXhlcyBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGNvbnZlcnREYXRhIGNvbnZlcnRlZCBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGJvdW5kcyBjaGFydCBib3VuZHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGluaXRlZERhdGEgaW5pdGlhbGl6ZWQgZGF0YSBmcm9tIGNvbWJvIGNoYXJ0XG4gICAgICogQHJldHVybnMge29iamVjdH0gYXhlcyBkYXRhXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUF4ZXNEYXRhOiBmdW5jdGlvbihjb252ZXJ0RGF0YSwgYm91bmRzLCBvcHRpb25zLCBpbml0ZWREYXRhKSB7XG4gICAgICAgIHZhciBheGVzRGF0YSA9IHt9O1xuICAgICAgICBpZiAoaW5pdGVkRGF0YSkge1xuICAgICAgICAgICAgYXhlc0RhdGEgPSBpbml0ZWREYXRhLmF4ZXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBheGVzRGF0YSA9IHtcbiAgICAgICAgICAgICAgICB5QXhpczogYXhpc0RhdGFNYWtlci5tYWtlVmFsdWVBeGlzRGF0YSh7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlczogY29udmVydERhdGEudmFsdWVzLFxuICAgICAgICAgICAgICAgICAgICBzZXJpZXNEaW1lbnNpb246IGJvdW5kcy5zZXJpZXMuZGltZW5zaW9uLFxuICAgICAgICAgICAgICAgICAgICBzdGFja2VkOiBvcHRpb25zLnNlcmllcyAmJiBvcHRpb25zLnNlcmllcy5zdGFja2VkIHx8ICcnLFxuICAgICAgICAgICAgICAgICAgICBjaGFydFR5cGU6IG9wdGlvbnMuY2hhcnRUeXBlLFxuICAgICAgICAgICAgICAgICAgICBmb3JtYXRGdW5jdGlvbnM6IGNvbnZlcnREYXRhLmZvcm1hdEZ1bmN0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogb3B0aW9ucy55QXhpcyxcbiAgICAgICAgICAgICAgICAgICAgaXNWZXJ0aWNhbDogdHJ1ZVxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIHhBeGlzOiBheGlzRGF0YU1ha2VyLm1ha2VMYWJlbEF4aXNEYXRhKHtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxzOiBjb252ZXJ0RGF0YS5sYWJlbHNcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXhlc0RhdGE7XG4gICAgfVxufSk7XG5cblZlcnRpY2FsVHlwZUJhc2UubWl4aW4gPSBmdW5jdGlvbihmdW5jKSB7XG4gICAgbmUudXRpbC5leHRlbmQoZnVuYy5wcm90b3R5cGUsIFZlcnRpY2FsVHlwZUJhc2UucHJvdG90eXBlKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVmVydGljYWxUeXBlQmFzZTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBuZS51dGls7JeQIHJhbmdl6rCAIOy2lOqwgOuQmOq4sCDsoITquYzsp4Ag7J6E7Iuc66GcIOyCrOyaqVxuICogQHBhcmFtIHtudW1iZXJ9IHN0YXJ0IHN0YXJ0XG4gKiBAcGFyYW0ge251bWJlcn0gc3RvcCBzdG9wXG4gKiBAcGFyYW0ge251bWJlcn0gc3RlcCBzdGVwXG4gKiBAcmV0dXJucyB7YXJyYXkuPG51bWJlcj59IHJlc3VsdCBhcnJheVxuICovXG52YXIgcmFuZ2UgPSBmdW5jdGlvbihzdGFydCwgc3RvcCwgc3RlcCkge1xuICAgIHZhciBhcnIgPSBbXSxcbiAgICAgICAgZmxhZztcblxuICAgIGlmIChuZS51dGlsLmlzVW5kZWZpbmVkKHN0b3ApKSB7XG4gICAgICAgIHN0b3AgPSBzdGFydCB8fCAwO1xuICAgICAgICBzdGFydCA9IDA7XG4gICAgfVxuXG4gICAgc3RlcCA9IHN0ZXAgfHwgMTtcbiAgICBmbGFnID0gc3RlcCA8IDAgPyAtMSA6IDE7XG4gICAgc3RvcCAqPSBmbGFnO1xuXG4gICAgd2hpbGUgKHN0YXJ0ICogZmxhZyA8IHN0b3ApIHtcbiAgICAgICAgYXJyLnB1c2goc3RhcnQpO1xuICAgICAgICBzdGFydCArPSBzdGVwO1xuICAgIH1cblxuICAgIHJldHVybiBhcnI7XG59O1xuXG4vKipcbiAqICogbmUudXRpbOyXkCBwbHVja+ydtCDstpTqsIDrkJjquLAg7KCE6rmM7KeAIOyehOyLnOuhnCDsgqzsmqlcbiAqIEBwYXJhbSB7YXJyYXl9IGFyciBhcnJheVxuICogQHBhcmFtIHtzdHJpbmd9IHByb3BlcnR5IHByb3BlcnR5XG4gKiBAcmV0dXJucyB7YXJyYXl9IHJlc3VsdCBhcnJheVxuICovXG52YXIgcGx1Y2sgPSBmdW5jdGlvbihhcnIsIHByb3BlcnR5KSB7XG4gICAgdmFyIHJlc3VsdCA9IG5lLnV0aWwubWFwKGFyciwgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICByZXR1cm4gaXRlbVtwcm9wZXJ0eV07XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogKiBuZS51dGls7JeQIHppcOydtCDstpTqsIDrkJjquLAg7KCE6rmM7KeAIOyehOyLnOuhnCDsgqzsmqlcbiAqIEBwYXJhbXMgey4uLmFycmF5fSBhcnJheVxuICogQHJldHVybnMge2FycmF5fSByZXN1bHQgYXJyYXlcbiAqL1xudmFyIHppcCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcnIyID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSxcbiAgICAgICAgcmVzdWx0ID0gW107XG5cbiAgICBuZS51dGlsLmZvckVhY2goYXJyMiwgZnVuY3Rpb24oYXJyKSB7XG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaChhcnIsIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgICAgaWYgKCFyZXN1bHRbaW5kZXhdKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W2luZGV4XSA9IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0W2luZGV4XS5wdXNoKHZhbHVlKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBQaWNrIG1pbmltdW0gdmFsdWUgZnJvbSB2YWx1ZSBhcnJheS5cbiAqIEBwYXJhbSB7YXJyYXl9IGFyciB2YWx1ZSBhcnJheVxuICogQHBhcmFtIHtmdW5jdGlvbn0gY29uZGl0aW9uIGNvbmRpdGlvbiBmdW5jdGlvblxuICogQHBhcmFtIHtvYmplY3R9IGNvbnRleHQgdGFyZ2V0IGNvbnRleHRcbiAqIEByZXR1cm5zIHsqfSBtaW5pbXVtIHZhbHVlXG4gKi9cbnZhciBtaW4gPSBmdW5jdGlvbihhcnIsIGNvbmRpdGlvbiwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHQsIG1pblZhbHVlLCByZXN0O1xuICAgIGlmICghY29uZGl0aW9uKSB7XG4gICAgICAgIGNvbmRpdGlvbiA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICB9O1xuICAgIH1cbiAgICByZXN1bHQgPSBhcnJbMF07XG4gICAgbWluVmFsdWUgPSBjb25kaXRpb24uY2FsbChjb250ZXh0LCByZXN1bHQpO1xuICAgIHJlc3QgPSBhcnIuc2xpY2UoMSk7XG4gICAgbmUudXRpbC5mb3JFYWNoQXJyYXkocmVzdCwgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICB2YXIgY29tcGFyZVZhbHVlID0gY29uZGl0aW9uLmNhbGwoY29udGV4dCwgaXRlbSk7XG4gICAgICAgIGlmIChjb21wYXJlVmFsdWUgPCBtaW5WYWx1ZSkge1xuICAgICAgICAgICAgbWluVmFsdWUgPSBjb21wYXJlVmFsdWU7XG4gICAgICAgICAgICByZXN1bHQgPSBpdGVtO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogUGljayBtYXhpbXVtIHZhbHVlIGZyb20gdmFsdWUgYXJyYXkuXG4gKiBAcGFyYW0ge2FycmF5fSBhcnIgdmFsdWUgYXJyYXlcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNvbmRpdGlvbiBjb25kaXRpb24gZnVuY3Rpb25cbiAqIEBwYXJhbSB7b2JqZWN0fSBjb250ZXh0IHRhcmdldCBjb250ZXh0XG4gKiBAcmV0dXJucyB7Kn0gbWF4aW11bSB2YWx1ZVxuICovXG52YXIgbWF4ID0gZnVuY3Rpb24oYXJyLCBjb25kaXRpb24sIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0LCBtYXhWYWx1ZSwgcmVzdDtcbiAgICBpZiAoIWNvbmRpdGlvbikge1xuICAgICAgICBjb25kaXRpb24gPSBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgcmVzdWx0ID0gYXJyWzBdO1xuICAgIG1heFZhbHVlID0gY29uZGl0aW9uLmNhbGwoY29udGV4dCwgcmVzdWx0KTtcbiAgICByZXN0ID0gYXJyLnNsaWNlKDEpO1xuICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KHJlc3QsIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgdmFyIGNvbXBhcmVWYWx1ZSA9IGNvbmRpdGlvbi5jYWxsKGNvbnRleHQsIGl0ZW0pO1xuICAgICAgICBpZiAoY29tcGFyZVZhbHVlID4gbWF4VmFsdWUpIHtcbiAgICAgICAgICAgIG1heFZhbHVlID0gY29tcGFyZVZhbHVlO1xuICAgICAgICAgICAgcmVzdWx0ID0gaXRlbTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIFdoZXRoZXIgb25lIG9mIHRoZW0gaXMgdHJ1ZSBvciBub3QuXG4gKiBAcGFyYW0ge2FycmF5fSBhcnIgdGFyZ2V0IGFycmF5XG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjb25kaXRpb24gY29uZGl0aW9uIGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gcmVzdWx0IGJvb2xlYW5cbiAqL1xudmFyIGFueSA9IGZ1bmN0aW9uKGFyciwgY29uZGl0aW9uKSB7XG4gICAgdmFyIHJlc3VsdCA9IGZhbHNlO1xuICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KGFyciwgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICBpZiAoY29uZGl0aW9uKGl0ZW0pKSB7XG4gICAgICAgICAgICByZXN1bHQgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogQWxsIG9mIHRoZW0gaXMgdHJ1ZSBvciBub3QuXG4gKiBAcGFyYW0ge2FycmF5fSBhcnIgdGFyZ2V0IGFycmF5XG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjb25kaXRpb24gY29uZGl0aW9uIGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gcmVzdWx0IGJvb2xlYW5cbiAqL1xudmFyIGFsbCA9IGZ1bmN0aW9uKGFyciwgY29uZGl0aW9uKSB7XG4gICAgdmFyIHJlc3VsdCA9IHRydWU7XG4gICAgbmUudXRpbC5mb3JFYWNoQXJyYXkoYXJyLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIGlmICghY29uZGl0aW9uKGl0ZW0pKSB7XG4gICAgICAgICAgICByZXN1bHQgPSBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIEdldCBhZnRlciBwb2ludCBsZW5ndGguXG4gKiBAcGFyYW0ge3N0cmluZyB8IG51bWJlcn0gdmFsdWUgdGFyZ2V0IHZhbHVlXG4gKiBAcmV0dXJucyB7bnVtYmVyfSByZXN1bHQgbGVuZ3RoXG4gKi9cbnZhciBsZW5ndGhBZnRlclBvaW50ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICB2YXIgdmFsdWVBcnIgPSAodmFsdWUgKyAnJykuc3BsaXQoJy4nKTtcbiAgICByZXR1cm4gdmFsdWVBcnIubGVuZ3RoID09PSAyID8gdmFsdWVBcnJbMV0ubGVuZ3RoIDogMDtcbn07XG5cbi8qKlxuICogRmluZCBtdWx0aXBsZSBudW0uXG4gKiBAcGFyYW0gey4uLmFycmF5fSB0YXJnZXQgdmFsdWVzXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBtdWx0aXBsZSBudW1cbiAqL1xudmFyIGZpbmRNdWx0aXBsZU51bSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMpLFxuICAgICAgICB1bmRlclBvaW50TGVucyA9IG5lLnV0aWwubWFwKGFyZ3MsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gbmUudXRpbC5sZW5ndGhBZnRlclBvaW50KHZhbHVlKTtcbiAgICAgICAgfSksXG4gICAgICAgIHVuZGVyUG9pbnRMZW4gPSBuZS51dGlsLm1heCh1bmRlclBvaW50TGVucyksXG4gICAgICAgIG11bHRpcGxlTnVtID0gTWF0aC5wb3coMTAsIHVuZGVyUG9pbnRMZW4pO1xuICAgIHJldHVybiBtdWx0aXBsZU51bTtcbn07XG5cbi8qKlxuICogTW9kdWxvIG9wZXJhdGlvbiBmb3IgZmxvYXRpbmcgcG9pbnQgb3BlcmF0aW9uLlxuICogQHBhcmFtIHtudW1iZXJ9IHRhcmdldCB0YXJnZXQgdmFsdWVzXG4gKiBAcGFyYW0ge251bWJlcn0gbW9kTnVtIG1vZCBudW1cbiAqIEByZXR1cm5zIHtudW1iZXJ9IHJlc3VsdCBtb2RcbiAqL1xudmFyIG1vZCA9IGZ1bmN0aW9uKHRhcmdldCwgbW9kTnVtKSB7XG4gICAgdmFyIG11bHRpcGxlTnVtID0gbmUudXRpbC5maW5kTXVsdGlwbGVOdW0obW9kTnVtKTtcbiAgICByZXR1cm4gKCh0YXJnZXQgKiBtdWx0aXBsZU51bSkgJSAobW9kTnVtICogbXVsdGlwbGVOdW0pKSAvIG11bHRpcGxlTnVtO1xufTtcblxuLyoqXG4gKiBBZGRpdGlvbiBmb3IgZmxvYXRpbmcgcG9pbnQgb3BlcmF0aW9uLlxuICogQHBhcmFtIHtudW1iZXJ9IGEgdGFyZ2V0IGFcbiAqIEBwYXJhbSB7bnVtYmVyfSBiIHRhcmdldCBiXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBhZGRpdGlvbiByZXN1bHRcbiAqL1xudmFyIGFkZGl0aW9uID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHZhciBtdWx0aXBsZU51bSA9IGZpbmRNdWx0aXBsZU51bShhLCBiKTtcbiAgICByZXR1cm4gKChhICogbXVsdGlwbGVOdW0pICsgKGIgKiBtdWx0aXBsZU51bSkpIC8gbXVsdGlwbGVOdW07XG59O1xuXG4vKipcbiAqIFN1YnRyYWN0aW9uIGZvciBmbG9hdGluZyBwb2ludCBvcGVyYXRpb24uXG4gKiBAcGFyYW0ge251bWJlcn0gYSB0YXJnZXQgYVxuICogQHBhcmFtIHtudW1iZXJ9IGIgdGFyZ2V0IGJcbiAqIEByZXR1cm5zIHtudW1iZXJ9IHN1YnRyYWN0aW9uIHJlc3VsdFxuICovXG52YXIgc3VidHJhY3Rpb24gPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgdmFyIG11bHRpcGxlTnVtID0gZmluZE11bHRpcGxlTnVtKGEsIGIpO1xuICAgIHJldHVybiAoKGEgKiBtdWx0aXBsZU51bSkgLSAoYiAqIG11bHRpcGxlTnVtKSkgLyBtdWx0aXBsZU51bTtcbn07XG5cbi8qKlxuICogTXVsdGlwbGljYXRpb24gZm9yIGZsb2F0aW5nIHBvaW50IG9wZXJhdGlvbi5cbiAqIEBwYXJhbSB7bnVtYmVyfSBhIHRhcmdldCBhXG4gKiBAcGFyYW0ge251bWJlcn0gYiB0YXJnZXQgYlxuICogQHJldHVybnMge251bWJlcn0gbXVsdGlwbGljYXRpb24gcmVzdWx0XG4gKi9cbnZhciBtdWx0aXBsaWNhdGlvbiA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICB2YXIgbXVsdGlwbGVOdW0gPSBmaW5kTXVsdGlwbGVOdW0oYSwgYik7XG4gICAgcmV0dXJuICgoYSAqIG11bHRpcGxlTnVtKSAqIChiICogbXVsdGlwbGVOdW0pKSAvIChtdWx0aXBsZU51bSAqIG11bHRpcGxlTnVtKTtcbn07XG5cbi8qKlxuICogRGl2aXNpb24gZm9yIGZsb2F0aW5nIHBvaW50IG9wZXJhdGlvbi5cbiAqIEBwYXJhbSB7bnVtYmVyfSBhIHRhcmdldCBhXG4gKiBAcGFyYW0ge251bWJlcn0gYiB0YXJnZXQgYlxuICogQHJldHVybnMge251bWJlcn0gZGl2aXNpb24gcmVzdWx0XG4gKi9cbnZhciBkaXZpc2lvbiA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICB2YXIgbXVsdGlwbGVOdW0gPSBmaW5kTXVsdGlwbGVOdW0oYSwgYik7XG4gICAgcmV0dXJuIChhICogbXVsdGlwbGVOdW0pIC8gKGIgKiBtdWx0aXBsZU51bSk7XG59O1xuXG4vKipcbiAqIFN1bS5cbiAqIEBwYXJhbSB7YXJyYXkuPG51bWJlcj59IHZhbHVlcyB0YXJnZXQgdmFsdWVzXG4gKiBAcmV0dXJucyB7bnVtYmVyfSByZXN1bHQgdmFsdWVcbiAqL1xudmFyIHN1bSA9IGZ1bmN0aW9uKHZhbHVlcykge1xuICAgIHZhciBjb3B5QXJyID0gdmFsdWVzLnNsaWNlKCk7XG4gICAgY29weUFyci51bnNoaWZ0KDApO1xuICAgIHJldHVybiBuZS51dGlsLnJlZHVjZShjb3B5QXJyLCBmdW5jdGlvbihiYXNlLCBhZGQpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoYmFzZSkgKyBwYXJzZUZsb2F0KGFkZCk7XG4gICAgfSk7XG59O1xuXG5uZS51dGlsLnJhbmdlID0gcmFuZ2U7XG5uZS51dGlsLnBsdWNrID0gcGx1Y2s7XG5uZS51dGlsLnppcCA9IHppcDtcbm5lLnV0aWwubWluID0gbWluO1xubmUudXRpbC5tYXggPSBtYXg7XG5uZS51dGlsLmFueSA9IGFueTtcbm5lLnV0aWwuYWxsID0gYWxsO1xubmUudXRpbC5sZW5ndGhBZnRlclBvaW50ID0gbGVuZ3RoQWZ0ZXJQb2ludDtcbm5lLnV0aWwubW9kID0gbW9kO1xubmUudXRpbC5maW5kTXVsdGlwbGVOdW0gPSBmaW5kTXVsdGlwbGVOdW07XG5uZS51dGlsLmFkZGl0aW9uID0gYWRkaXRpb247XG5uZS51dGlsLnN1YnRyYWN0aW9uID0gc3VidHJhY3Rpb247XG5uZS51dGlsLm11bHRpcGxpY2F0aW9uID0gbXVsdGlwbGljYXRpb247XG5uZS51dGlsLmRpdmlzaW9uID0gZGl2aXNpb247XG5uZS51dGlsLnN1bSA9IHN1bTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBjaGFydCBjb25zdFxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgQ0hBUlRfREVGQVVMVF9XSURUSDogNTAwLFxuICAgIENIQVJUX0RFRkFVTFRfSEVJR0hUOiA0MDAsXG4gICAgSElEREVOX1dJRFRIOiAxLFxuICAgIFRFWFRfUEFERElORzogMixcbiAgICBTRVJJRVNfTEFCRUxfUEFERElORzogNSxcbiAgICBERUZBVUxUX1RJVExFX0ZPTlRfU0laRTogMTQsXG4gICAgREVGQVVMVF9BWElTX1RJVExFX0ZPTlRfU0laRTogMTAsXG4gICAgREVGQVVMVF9MQUJFTF9GT05UX1NJWkU6IDEyLFxuICAgIERFRkFVTFRfUExVR0lOOiAncmFwaGFlbCcsXG4gICAgREVGQVVMVF9USUNLX0NPTE9SOiAnYmxhY2snLFxuICAgIERFRkFVTFRfVEhFTUVfTkFNRTogJ2RlZmF1bHQnLFxuICAgIFNUQUNLRURfTk9STUFMX1RZUEU6ICdub3JtYWwnLFxuICAgIFNUQUNLRURfUEVSQ0VOVF9UWVBFOiAncGVyY2VudCcsXG4gICAgQU5HTEVfMzYwOiAzNjAsXG4gICAgUkFEOiBNYXRoLlBJIC8gMTgwLFxuICAgIERFRkFVTFRfU0VSSUVTX0xBQkVMX0ZPTlRfU0laRTogMTEsXG4gICAgU0VSSUVTX0xFR0VORF9UWVBFX09VVEVSOiAnb3V0ZXInLFxuICAgIFNFUklFU19PVVRFUl9MQUJFTF9QQURESU5HOiAyMCxcbiAgICBQSUVfR1JBUEhfREVGQVVMVF9SQVRFOiAwLjgsXG4gICAgUElFX0dSQVBIX1NNQUxMX1JBVEU6IDAuNjUsXG4gICAgQ0hBUlRfVFlQRV9CQVI6ICdiYXInLFxuICAgIENIQVJUX1RZUEVfQ09MVU1OOiAnY29sdW1uJyxcbiAgICBDSEFSVF9UWVBFX0xJTkU6ICdsaW5lJyxcbiAgICBDSEFSVF9UWVBFX0FSRUE6ICdhcmVhJyxcbiAgICBDSEFSVF9UWVBFX0NPTUJPOiAnY29tYm8nLFxuICAgIENIQVJUX1RZUEVfUElFOiAncGllJyxcbiAgICBZQVhJU19QUk9QUzogWyd0aWNrQ29sb3InLCAndGl0bGUnLCAnbGFiZWwnXSwgLy8geWF4aXMgdGhlbWXsnZgg7IaN7ISxIC0gY2hhcnQgdHlwZSBmaWx0ZXJpbmftlaAg65WMIOyCrOyaqeuQqFxuICAgIFNFUklFU19QUk9QUzogWydsYWJlbCcsICdjb2xvcnMnLCAnYm9yZGVyQ29sb3InLCAnc2luZ2xlQ29sb3JzJ10gLy8gc2VyaWVzIHRoZW1l7J2YIOyGjeyEsSAtIGNoYXJ0IHR5cGUgZmlsdGVyaW5n7ZWgIOuVjCDsgqzsmqnrkKhcbn07XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgIENoYXJ0IGZhY3RvcnkgcGxheSByb2xlIHJlZ2lzdGVyIGNoYXJ0LlxuICogICAgICAgICAgICAgICAgQWxzbywgeW91IGNhbiBnZXQgY2hhcnQgZnJvbSB0aGlzIGZhY3RvcnkuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBjaGFydHMgPSB7fSxcbiAgICBmYWN0b3J5ID0ge1xuICAgICAgICAvKipcbiAgICAgICAgICogR2V0IGNoYXJ0IGluc3RhbmNlLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY2hhcnRUeXBlIGNoYXJ0IHR5cGVcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGRhdGEgY2hhcnQgZGF0YVxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICAgICAqIEByZXR1cm5zIHtvYmplY3R9IGNoYXJ0IGluc3RhbmNlO1xuICAgICAgICAgKi9cbiAgICAgICAgZ2V0OiBmdW5jdGlvbihjaGFydFR5cGUsIGRhdGEsIHRoZW1lLCBvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgQ2hhcnQgPSBjaGFydHNbY2hhcnRUeXBlXSxcbiAgICAgICAgICAgICAgICBjaGFydDtcblxuICAgICAgICAgICAgaWYgKCFDaGFydCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGV4aXN0ICcgKyBjaGFydFR5cGUgKyAnIGNoYXJ0LicpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjaGFydCA9IG5ldyBDaGFydChkYXRhLCB0aGVtZSwgb3B0aW9ucyk7XG5cbiAgICAgICAgICAgIHJldHVybiBjaGFydDtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVnaXN0ZXIgY2hhcnQuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjaGFydFR5cGUgY2hhciB0eXBlXG4gICAgICAgICAqIEBwYXJhbSB7Y2xhc3N9IENoYXJ0Q2xhc3MgY2hhcnQgY2xhc3NcbiAgICAgICAgICovXG4gICAgICAgIHJlZ2lzdGVyOiBmdW5jdGlvbihjaGFydFR5cGUsIENoYXJ0Q2xhc3MpIHtcbiAgICAgICAgICAgIGNoYXJ0c1tjaGFydFR5cGVdID0gQ2hhcnRDbGFzcztcbiAgICAgICAgfVxuICAgIH07XG5cbm1vZHVsZS5leHBvcnRzID0gZmFjdG9yeTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyAgUGx1Z2luIGZhY3RvcnkgcGxheSByb2xlIHJlZ2lzdGVyIHJlbmRlcmluZyBwbHVnaW4uXG4gKiAgICAgICAgICAgICAgICBBbHNvLCB5b3UgY2FuIGdldCBwbHVnaW4gZnJvbSB0aGlzIGZhY3RvcnkuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBwbHVnaW5zID0ge30sXG4gICAgZmFjdG9yeSA9IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdldCBncmFwaCByZW5kZXJlci5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGxpYlR5cGUgdHlwZSBvZiBncmFwaCBsaWJyYXJ5XG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjaGFydFR5cGUgY2hhcnQgdHlwZVxuICAgICAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSByZW5kZXJlciBpbnN0YW5jZVxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0OiBmdW5jdGlvbihsaWJUeXBlLCBjaGFydFR5cGUpIHtcbiAgICAgICAgICAgIHZhciBwbHVnaW4gPSBwbHVnaW5zW2xpYlR5cGVdLFxuICAgICAgICAgICAgICAgIFJlbmRlcmVyLCByZW5kZXJlcjtcblxuICAgICAgICAgICAgaWYgKCFwbHVnaW4pIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBleGlzdCAnICsgbGliVHlwZSArICcgcGx1Z2luLicpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBSZW5kZXJlciA9IHBsdWdpbltjaGFydFR5cGVdO1xuICAgICAgICAgICAgaWYgKCFSZW5kZXJlcikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGV4aXN0ICcgKyBjaGFydFR5cGUgKyAnIGNoYXJ0IHJlbmRlcmVyLicpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZW5kZXJlciA9IG5ldyBSZW5kZXJlcigpO1xuXG4gICAgICAgICAgICByZXR1cm4gcmVuZGVyZXI7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQbHVnaW4gcmVnaXN0ZXIuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBsaWJUeXBlIHR5cGUgb2YgZ3JhcGggbGlicmFyeVxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcGx1Z2luIHBsdWdpbiB0byBjb250cm9sIGxpYnJhcnlcbiAgICAgICAgICovXG4gICAgICAgIHJlZ2lzdGVyOiBmdW5jdGlvbihsaWJUeXBlLCBwbHVnaW4pIHtcbiAgICAgICAgICAgIHBsdWdpbnNbbGliVHlwZV0gPSBwbHVnaW47XG4gICAgICAgIH1cbiAgICB9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnk7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgIFRoZW1lIGZhY3RvcnkgcGxheSByb2xlIHJlZ2lzdGVyIHRoZW1lLlxuICogICAgICAgICAgICAgICAgQWxzbywgeW91IGNhbiBnZXQgdGhlbWUgZnJvbSB0aGlzIGZhY3RvcnkuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBjaGFydENvbnN0ID0gcmVxdWlyZSgnLi4vY29uc3QuanMnKSxcbiAgICBkZWZhdWx0VGhlbWUgPSByZXF1aXJlKCcuLi90aGVtZXMvZGVmYXVsdFRoZW1lLmpzJyk7XG5cbnZhciB0aGVtZXMgPSB7fTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgLyoqXG4gICAgICogR2V0IHRoZW1lLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0aGVtZU5hbWUgdGhlbWUgbmFtZVxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHRoZW1lIG9iamVjdFxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24odGhlbWVOYW1lKSB7XG4gICAgICAgIHZhciB0aGVtZSA9IHRoZW1lc1t0aGVtZU5hbWVdO1xuXG4gICAgICAgIGlmICghdGhlbWUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGV4aXN0ICcgKyB0aGVtZU5hbWUgKyAnIHRoZW1lLicpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoZW1lO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUaGVtZSByZWdpc3Rlci5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGhlbWVOYW1lIHRoZW1lIG5hbWVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgdGhlbWVcbiAgICAgKi9cbiAgICByZWdpc3RlcjogZnVuY3Rpb24odGhlbWVOYW1lLCB0aGVtZSkge1xuICAgICAgICB2YXIgdGFyZ2V0SXRlbXM7XG4gICAgICAgIHRoZW1lID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGVtZSkpO1xuXG4gICAgICAgIGlmICh0aGVtZU5hbWUgIT09IGNoYXJ0Q29uc3QuREVGQVVMVF9USEVNRV9OQU1FKSB7XG4gICAgICAgICAgICB0aGVtZSA9IHRoaXMuX2luaXRUaGVtZSh0aGVtZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0YXJnZXRJdGVtcyA9IHRoaXMuX2dldEluaGVyaXRUYXJnZXRUaGVtZUl0ZW1zKHRoZW1lKTtcblxuICAgICAgICB0aGlzLl9pbmhlcml0VGhlbWVGb250KHRoZW1lLCB0YXJnZXRJdGVtcyk7XG4gICAgICAgIHRoaXMuX2NvcHlDb2xvckluZm8odGhlbWUpO1xuICAgICAgICB0aGVtZXNbdGhlbWVOYW1lXSA9IHRoZW1lO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbml0IHRoZW1lLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSB0aGVtZVxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHRoZW1lXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAaWdub3JlXG4gICAgICovXG4gICAgX2luaXRUaGVtZTogZnVuY3Rpb24odGhlbWUpIHtcbiAgICAgICAgdmFyIGNsb25lVGhlbWUgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGRlZmF1bHRUaGVtZSkpLFxuICAgICAgICAgICAgbmV3VGhlbWU7XG5cbiAgICAgICAgdGhpcy5fY29uY2F0RGVmYXVsdENvbG9ycyh0aGVtZSwgY2xvbmVUaGVtZS5zZXJpZXMuY29sb3JzKVxuICAgICAgICBuZXdUaGVtZSA9IHRoaXMuX292ZXJ3cml0ZVRoZW1lKHRoZW1lLCBjbG9uZVRoZW1lKTtcblxuICAgICAgICBuZXdUaGVtZSA9IHRoaXMuX2NvcHlQcm9wZXJ0eSh7XG4gICAgICAgICAgICBwcm9wTmFtZTogJ3lBeGlzJyxcbiAgICAgICAgICAgIGZyb21UaGVtZTogdGhlbWUsXG4gICAgICAgICAgICB0b1RoZW1lOiBuZXdUaGVtZSxcbiAgICAgICAgICAgIHJlamVjdGlvblByb3BzOiBjaGFydENvbnN0LllBWElTX1BST1BTXG4gICAgICAgIH0pO1xuXG4gICAgICAgIG5ld1RoZW1lID0gdGhpcy5fY29weVByb3BlcnR5KHtcbiAgICAgICAgICAgIHByb3BOYW1lOiAnc2VyaWVzJyxcbiAgICAgICAgICAgIGZyb21UaGVtZTogdGhlbWUsXG4gICAgICAgICAgICB0b1RoZW1lOiBuZXdUaGVtZSxcbiAgICAgICAgICAgIHJlamVjdGlvblByb3BzOiBjaGFydENvbnN0LlNFUklFU19QUk9QU1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gbmV3VGhlbWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZpbHRlciBjaGFydCB0eXBlcy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGFyZ2V0IHRhcmdldCBjaGFydHNcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSByZWplY3Rpb25Qcm9wcyByZWplY3QgcHJvcGVydHlcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBmaWx0ZXJlZCBjaGFydHMuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZmlsdGVyQ2hhcnRUeXBlczogZnVuY3Rpb24odGFyZ2V0LCByZWplY3Rpb25Qcm9wcykge1xuICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICBpZiAoIXRhcmdldCkge1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVzdWx0ID0gbmUudXRpbC5maWx0ZXIodGFyZ2V0LCBmdW5jdGlvbihpdGVtLCBuYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gbmUudXRpbC5pbkFycmF5KG5hbWUsIHJlamVjdGlvblByb3BzKSA9PT0gLTE7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDb25jYXQgY29sb3JzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSB0aGVtZVxuICAgICAqIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IHNlcmllc0NvbG9ycyBzZXJpZXMgY29sb3JzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY29uY2F0Q29sb3JzOiBmdW5jdGlvbih0aGVtZSwgc2VyaWVzQ29sb3JzKSB7XG4gICAgICAgIGlmICh0aGVtZS5jb2xvcnMpIHtcbiAgICAgICAgICAgIHRoZW1lLmNvbG9ycyA9IHRoZW1lLmNvbG9ycy5jb25jYXQoc2VyaWVzQ29sb3JzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGVtZS5zaW5nbGVDb2xvcnMpIHtcbiAgICAgICAgICAgIHRoZW1lLnNpbmdsZUNvbG9ycyA9IHRoZW1lLnNpbmdsZUNvbG9ycy5jb25jYXQoc2VyaWVzQ29sb3JzKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDb25jYXQgZGVmYXVsdCBjb2xvcnMuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIHRoZW1lXG4gICAgICogQHBhcmFtIHthcnJheS48c3RyaW5nPn0gc2VyaWVzQ29sb3JzIHNlcmllcyBjb2xvcnNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jb25jYXREZWZhdWx0Q29sb3JzOiBmdW5jdGlvbih0aGVtZSwgc2VyaWVzQ29sb3JzKSB7XG4gICAgICAgIHZhciBjaGFydFR5cGVzO1xuXG4gICAgICAgIGlmICghdGhlbWUuc2VyaWVzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjaGFydFR5cGVzID0gdGhpcy5fZmlsdGVyQ2hhcnRUeXBlcyh0aGVtZS5zZXJpZXMsIGNoYXJ0Q29uc3QuU0VSSUVTX1BST1BTKTtcblxuICAgICAgICBpZiAoIW5lLnV0aWwua2V5cyhjaGFydFR5cGVzKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMuX2NvbmNhdENvbG9ycyh0aGVtZS5zZXJpZXMsIHNlcmllc0NvbG9ycyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZS51dGlsLmZvckVhY2goY2hhcnRUeXBlcywgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NvbmNhdENvbG9ycyhpdGVtLCBzZXJpZXNDb2xvcnMpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogT3ZlcndyaXRlIHRoZW1lXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGZyb20gZnJvbSB0aGVtZSBwcm9wZXJ0eVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0byB0byB0aGVtZSBwcm9wZXJ0eVxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHJlc3VsdCBwcm9wZXJ0eVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX292ZXJ3cml0ZVRoZW1lOiBmdW5jdGlvbihmcm9tLCB0bykge1xuICAgICAgICBuZS51dGlsLmZvckVhY2godG8sIGZ1bmN0aW9uKGl0ZW0sIGtleSkge1xuICAgICAgICAgICAgdmFyIGZyb21JdGVtID0gZnJvbVtrZXldO1xuICAgICAgICAgICAgaWYgKCFmcm9tSXRlbSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG5lLnV0aWwuaXNBcnJheShmcm9tSXRlbSkpIHtcbiAgICAgICAgICAgICAgICB0b1trZXldID0gZnJvbUl0ZW0uc2xpY2UoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobmUudXRpbC5pc09iamVjdChmcm9tSXRlbSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9vdmVyd3JpdGVUaGVtZShmcm9tSXRlbSwgaXRlbSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRvW2tleV0gPSBmcm9tSXRlbTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgcmV0dXJuIHRvO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDb3B5IHByb3BlcnR5LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5wcm9wTmFtZSBwcm9wZXJ0eSBuYW1lXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmZyb21UaGVtZSBmcm9tIHByb3BlcnR5XG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRvVGhlbWUgdHAgcHJvcGVydHlcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IHBhcmFtcy5yZWplY3Rpb25Qcm9wcyByZWplY3QgcHJvcGVydHkgbmFtZVxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IGNvcGllZCBwcm9wZXJ0eVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NvcHlQcm9wZXJ0eTogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBjaGFydFR5cGVzO1xuXG4gICAgICAgIGlmICghcGFyYW1zLnRvVGhlbWVbcGFyYW1zLnByb3BOYW1lXSkge1xuICAgICAgICAgICAgcmV0dXJuIHBhcmFtcy50b1RoZW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgY2hhcnRUeXBlcyA9IHRoaXMuX2ZpbHRlckNoYXJ0VHlwZXMocGFyYW1zLmZyb21UaGVtZVtwYXJhbXMucHJvcE5hbWVdLCBwYXJhbXMucmVqZWN0aW9uUHJvcHMpO1xuICAgICAgICBpZiAobmUudXRpbC5rZXlzKGNoYXJ0VHlwZXMpLmxlbmd0aCkge1xuICAgICAgICAgICAgbmUudXRpbC5mb3JFYWNoKGNoYXJ0VHlwZXMsIGZ1bmN0aW9uKGl0ZW0sIGtleSkge1xuICAgICAgICAgICAgICAgIHZhciBjbG9uZVRoZW1lID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShkZWZhdWx0VGhlbWVbcGFyYW1zLnByb3BOYW1lXSkpO1xuICAgICAgICAgICAgICAgIHBhcmFtcy5mcm9tVGhlbWVbcGFyYW1zLnByb3BOYW1lXVtrZXldID0gdGhpcy5fb3ZlcndyaXRlVGhlbWUoaXRlbSwgY2xvbmVUaGVtZSk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICAgICAgcGFyYW1zLnRvVGhlbWVbcGFyYW1zLnByb3BOYW1lXSA9IHBhcmFtcy5mcm9tVGhlbWVbcGFyYW1zLnByb3BOYW1lXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXJhbXMudG9UaGVtZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29weSBjb2xvciBpbmZvIHRvIGxlZ2VuZFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBzZXJpZXNUaGVtZSBzZXJpZXMgdGhlbWVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gbGVnZW5kVGhlbWUgbGVnZW5kIHRoZW1lXG4gICAgICogQHBhcmFtIHthcnJheS48c3RyaW5nPn0gY29sb3JzIGNvbG9yc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NvcHlDb2xvckluZm9Ub0xlZ2VuZDogZnVuY3Rpb24oc2VyaWVzVGhlbWUsIGxlZ2VuZFRoZW1lLCBjb2xvcnMpIHtcbiAgICAgICAgbGVnZW5kVGhlbWUuY29sb3JzID0gY29sb3JzIHx8IHNlcmllc1RoZW1lLmNvbG9ycztcbiAgICAgICAgaWYgKHNlcmllc1RoZW1lLnNpbmdsZUNvbG9ycykge1xuICAgICAgICAgICAgbGVnZW5kVGhlbWUuc2luZ2xlQ29sb3JzID0gc2VyaWVzVGhlbWUuc2luZ2xlQ29sb3JzO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzZXJpZXNUaGVtZS5ib3JkZXJDb2xvcikge1xuICAgICAgICAgICAgbGVnZW5kVGhlbWUuYm9yZGVyQ29sb3IgPSBzZXJpZXNUaGVtZS5ib3JkZXJDb2xvcjtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGFyZ2V0IGl0ZW1zIGFib3V0IGZvbnQgaW5oZXJpdC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgdGhlbWVcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPG9iamVjdD59IHRhcmdldCBpdGVtc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldEluaGVyaXRUYXJnZXRUaGVtZUl0ZW1zOiBmdW5jdGlvbih0aGVtZSkge1xuICAgICAgICB2YXIgaXRlbXMgPSBbXG4gICAgICAgICAgICAgICAgdGhlbWUudGl0bGUsXG4gICAgICAgICAgICAgICAgdGhlbWUueEF4aXMudGl0bGUsXG4gICAgICAgICAgICAgICAgdGhlbWUueEF4aXMubGFiZWwsXG4gICAgICAgICAgICAgICAgdGhlbWUubGVnZW5kLmxhYmVsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgeUF4aXNDaGFydFR5cGVzID0gdGhpcy5fZmlsdGVyQ2hhcnRUeXBlcyh0aGVtZS55QXhpcywgY2hhcnRDb25zdC5ZQVhJU19QUk9QUyksXG4gICAgICAgICAgICBzZXJpZXNDaGFydFR5cGVzID0gdGhpcy5fZmlsdGVyQ2hhcnRUeXBlcyh0aGVtZS5zZXJpZXMsIGNoYXJ0Q29uc3QuU0VSSUVTX1BST1BTKTtcblxuICAgICAgICBpZiAoIW5lLnV0aWwua2V5cyh5QXhpc0NoYXJ0VHlwZXMpLmxlbmd0aCkge1xuICAgICAgICAgICAgaXRlbXMucHVzaCh0aGVtZS55QXhpcy50aXRsZSk7XG4gICAgICAgICAgICBpdGVtcy5wdXNoKHRoZW1lLnlBeGlzLmxhYmVsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5lLnV0aWwuZm9yRWFjaCh5QXhpc0NoYXJ0VHlwZXMsIGZ1bmN0aW9uKGNoYXRUeXBlKSB7XG4gICAgICAgICAgICAgICAgaXRlbXMucHVzaChjaGF0VHlwZS50aXRsZSk7XG4gICAgICAgICAgICAgICAgaXRlbXMucHVzaChjaGF0VHlwZS5sYWJlbCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghbmUudXRpbC5rZXlzKHNlcmllc0NoYXJ0VHlwZXMpLmxlbmd0aCkge1xuICAgICAgICAgICAgaXRlbXMucHVzaCh0aGVtZS5zZXJpZXMubGFiZWwpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmUudXRpbC5mb3JFYWNoKHlBeGlzQ2hhcnRUeXBlcywgZnVuY3Rpb24oY2hhdFR5cGUpIHtcbiAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKGNoYXRUeXBlLmxhYmVsKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpdGVtcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW5oZXJpdCB0aGVtZSBmb250LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSB0aGVtZVxuICAgICAqIEBwYXJhbSB7YXJyYXkuPG9iamVjdD59IHRhcmdldEl0ZW1zIHRhcmdldCB0aGVtZSBpdGVtc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2luaGVyaXRUaGVtZUZvbnQ6IGZ1bmN0aW9uKHRoZW1lLCB0YXJnZXRJdGVtcykge1xuICAgICAgICB2YXIgYmFzZUZvbnQgPSB0aGVtZS5jaGFydC5mb250RmFtaWx5O1xuXG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KHRhcmdldEl0ZW1zLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICBpZiAoIWl0ZW0uZm9udEZhbWlseSkge1xuICAgICAgICAgICAgICAgIGl0ZW0uZm9udEZhbWlseSA9IGJhc2VGb250O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29weSBjb2xvciBpbmZvLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSB0aGVtZVxuICAgICAqIEBwcml2YXRlXG4gICAgICogQGlnbm9yZVxuICAgICAqL1xuICAgIF9jb3B5Q29sb3JJbmZvOiBmdW5jdGlvbih0aGVtZSkge1xuICAgICAgICB2YXIgc2VyaWVzQ2hhcnRUeXBlcyA9IHRoaXMuX2ZpbHRlckNoYXJ0VHlwZXModGhlbWUuc2VyaWVzLCBjaGFydENvbnN0LlNFUklFU19QUk9QUyk7XG4gICAgICAgIGlmICghbmUudXRpbC5rZXlzKHNlcmllc0NoYXJ0VHlwZXMpLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5fY29weUNvbG9ySW5mb1RvTGVnZW5kKHRoZW1lLnNlcmllcywgdGhlbWUubGVnZW5kKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5lLnV0aWwuZm9yRWFjaChzZXJpZXNDaGFydFR5cGVzLCBmdW5jdGlvbihpdGVtLCBjaGFydFR5cGUpIHtcbiAgICAgICAgICAgICAgICB0aGVtZS5sZWdlbmRbY2hhcnRUeXBlXSA9IHt9O1xuICAgICAgICAgICAgICAgIHRoaXMuX2NvcHlDb2xvckluZm9Ub0xlZ2VuZChpdGVtLCB0aGVtZS5sZWdlbmRbY2hhcnRUeXBlXSwgaXRlbS5jb2xvcnMgfHwgdGhlbWUubGVnZW5kLmNvbG9ycyk7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoZW1lLmxlZ2VuZC5jb2xvcnM7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgQXhpcyBEYXRhIE1ha2VyXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBjaGFydENvbnN0ID0gcmVxdWlyZSgnLi4vY29uc3QuanMnKSxcbiAgICBjYWxjdWxhdG9yID0gcmVxdWlyZSgnLi9jYWxjdWxhdG9yLmpzJyk7XG5cbnZhciBNSU5fUElYRUxfU1RFUF9TSVpFID0gNDAsXG4gICAgTUFYX1BJWEVMX1NURVBfU0laRSA9IDYwLFxuICAgIFBFUkNFTlRfU1RBQ0tFRF9USUNLX0lORk8gPSB7XG4gICAgICAgIHNjYWxlOiB7XG4gICAgICAgICAgICBtaW46IDAsXG4gICAgICAgICAgICBtYXg6IDEwMFxuICAgICAgICB9LFxuICAgICAgICBzdGVwOiAyNSxcbiAgICAgICAgdGlja0NvdW50OiA1LFxuICAgICAgICBsYWJlbHM6IFswLCAyNSwgNTAsIDc1LCAxMDBdXG4gICAgfTtcblxudmFyIGFicyA9IE1hdGguYWJzLFxuICAgIGNvbmNhdCA9IEFycmF5LnByb3RvdHlwZS5jb25jYXQ7XG5cbi8qKlxuICogQXhpcyBkYXRhIG1ha2VyLlxuICogQG1vZHVsZSBheGlzRGF0YU1ha2VyXG4gKi9cbnZhciBheGlzRGF0YU1ha2VyID0ge1xuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgZGF0YSBhYm91dCBsYWJlbCBheGlzLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48c3RyaW5nPn0gbGFiZWxzIGNoYXJ0IGxhYmVsc1xuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBpc1ZlcnRpY2FsIHdoZXRoZXIgdmVydGljYWwgb3Igbm90XG4gICAgICogQHJldHVybnMge3tcbiAgICAgKiAgICAgIGxhYmVsczogYXJyYXkuPHN0cmluZz4sXG4gICAgICogICAgICB0aWNrQ291bnQ6IG51bWJlcixcbiAgICAgKiAgICAgIHZhbGlkVGlja0NvdW50OiBudW1iZXIsXG4gICAgICogICAgICBpc0xhYmVsQXhpczogYm9vbGVhbixcbiAgICAgKiAgICAgIGlzVmVydGljYWw6IGJvb2xlYW5cbiAgICAgKiB9fSBheGlzIGRhdGFcbiAgICAgKi9cbiAgICBtYWtlTGFiZWxBeGlzRGF0YTogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsYWJlbHM6IHBhcmFtcy5sYWJlbHMsXG4gICAgICAgICAgICB0aWNrQ291bnQ6IHBhcmFtcy5sYWJlbHMubGVuZ3RoICsgMSxcbiAgICAgICAgICAgIHZhbGlkVGlja0NvdW50OiAwLFxuICAgICAgICAgICAgaXNMYWJlbEF4aXM6IHRydWUsXG4gICAgICAgICAgICBpc1ZlcnRpY2FsOiAhIXBhcmFtcy5pc1ZlcnRpY2FsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgZGF0YSBhYm91dCB2YWx1ZSBheGlzLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48YXJyYXkuPG51bWJlcj4+fSBwYXJhbXMudmFsdWVzIGNoYXJ0IHZhbHVlc1xuICAgICAqICAgICAgQHBhcmFtIHt7d2lkdGg6bnVtYmVyLCBoZWlnaHQ6bnVtYmVyfX0gcGFyYW1zLnNlcmllc0RpbWVuc2lvbiBzZXJpZXMgZGltZW5zaW9uXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxmdW5jdGlvbj59IHBhcmFtcy5mb3JtYXRGdW5jdGlvbnMgZm9ybWF0IGZ1bmN0aW9uc1xuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5zdGFja2VkIHN0YWNrZWQgb3B0aW9uXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLm9wdGlvbnMgYXhpcyBvcHRpb25zXG4gICAgICogQHJldHVybnMge3tcbiAgICAgKiAgICAgIGxhYmVsczogYXJyYXkuPHN0cmluZz4sXG4gICAgICogICAgICB0aWNrQ291bnQ6IG51bWJlcixcbiAgICAgKiAgICAgIHZhbGlkVGlja0NvdW50OiBudW1iZXIsXG4gICAgICogICAgICBpc0xhYmVsQXhpczogYm9vbGVhbixcbiAgICAgKiAgICAgIHNjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfSxcbiAgICAgKiAgICAgIGlzVmVydGljYWw6IGJvb2xlYW5cbiAgICAgKiB9fSBheGlzIGRhdGFcbiAgICAgKi9cbiAgICBtYWtlVmFsdWVBeGlzRGF0YTogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBvcHRpb25zID0gcGFyYW1zLm9wdGlvbnMgfHwge30sXG4gICAgICAgICAgICBpc1ZlcnRpY2FsID0gISFwYXJhbXMuaXNWZXJ0aWNhbCxcbiAgICAgICAgICAgIGlzUG9zaXRpb25SaWdodCA9ICEhcGFyYW1zLmlzUG9zaXRpb25SaWdodCxcbiAgICAgICAgICAgIGZvcm1hdEZ1bmN0aW9ucyA9IHBhcmFtcy5mb3JtYXRGdW5jdGlvbnMsXG4gICAgICAgICAgICB0aWNrSW5mbztcbiAgICAgICAgaWYgKHBhcmFtcy5zdGFja2VkID09PSAncGVyY2VudCcpIHtcbiAgICAgICAgICAgIHRpY2tJbmZvID0gUEVSQ0VOVF9TVEFDS0VEX1RJQ0tfSU5GTztcbiAgICAgICAgICAgIGZvcm1hdEZ1bmN0aW9ucyA9IFtdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGlja0luZm8gPSB0aGlzLl9nZXRUaWNrSW5mbyh7XG4gICAgICAgICAgICAgICAgdmFsdWVzOiB0aGlzLl9tYWtlQmFzZVZhbHVlcyhwYXJhbXMudmFsdWVzLCBwYXJhbXMuc3RhY2tlZCksXG4gICAgICAgICAgICAgICAgc2VyaWVzRGltZW5zaW9uOiBwYXJhbXMuc2VyaWVzRGltZW5zaW9uLFxuICAgICAgICAgICAgICAgIGlzVmVydGljYWw6IGlzVmVydGljYWwsXG4gICAgICAgICAgICAgICAgaXNQb3NpdGlvblJpZ2h0OiBpc1Bvc2l0aW9uUmlnaHQsXG4gICAgICAgICAgICAgICAgY2hhcnRUeXBlOiBwYXJhbXMuY2hhcnRUeXBlXG4gICAgICAgICAgICB9LCBvcHRpb25zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsYWJlbHM6IHRoaXMuX2Zvcm1hdExhYmVscyh0aWNrSW5mby5sYWJlbHMsIGZvcm1hdEZ1bmN0aW9ucyksXG4gICAgICAgICAgICB0aWNrQ291bnQ6IHRpY2tJbmZvLnRpY2tDb3VudCxcbiAgICAgICAgICAgIHZhbGlkVGlja0NvdW50OiB0aWNrSW5mby50aWNrQ291bnQsXG4gICAgICAgICAgICBzY2FsZTogdGlja0luZm8uc2NhbGUsXG4gICAgICAgICAgICBzdGVwOiB0aWNrSW5mby5zdGVwLFxuICAgICAgICAgICAgaXNWZXJ0aWNhbDogaXNWZXJ0aWNhbCxcbiAgICAgICAgICAgIGlzUG9zaXRpb25SaWdodDogaXNQb3NpdGlvblJpZ2h0XG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYmFzZSB2YWx1ZXMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHthcnJheS48bnVtYmVyPn0gZ3JvdXBWYWx1ZXMgZ3JvdXAgdmFsdWVzXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHN0YWNrZWQgc3RhY2tlZCBvcHRpb24uXG4gICAgICogQHJldHVybnMge2FycmF5LjxudW1iZXI+fSBiYXNlIHZhbHVlc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VCYXNlVmFsdWVzOiBmdW5jdGlvbihncm91cFZhbHVlcywgc3RhY2tlZCkge1xuICAgICAgICB2YXIgYmFzZVZhbHVlcyA9IGNvbmNhdC5hcHBseShbXSwgZ3JvdXBWYWx1ZXMpOyAvLyBmbGF0dGVuIGFycmF5XG4gICAgICAgIGlmIChzdGFja2VkID09PSBjaGFydENvbnN0LlNUQUNLRURfTk9STUFMX1RZUEUpIHtcbiAgICAgICAgICAgIGJhc2VWYWx1ZXMgPSBiYXNlVmFsdWVzLmNvbmNhdChuZS51dGlsLm1hcChncm91cFZhbHVlcywgZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBsdXNWYWx1ZXMgPSBuZS51dGlsLmZpbHRlcih2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSA+IDA7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwuc3VtKHBsdXNWYWx1ZXMpO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBiYXNlVmFsdWVzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgYmFzZSBzaXplIGZvciBnZXQgY2FuZGlkYXRlIHRpY2sgY291bnRzLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gZGltZW5zaW9uIGNoYXQgZGltZW5zaW9uXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpc1ZlcnRpY2FsIHdoZXRoZXIgdmVydGljYWwgb3Igbm90XG4gICAgICogQHJldHVybnMge251bWJlcn0gYmFzZSBzaXplXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0QmFzZVNpemU6IGZ1bmN0aW9uKGRpbWVuc2lvbiwgaXNWZXJ0aWNhbCkge1xuICAgICAgICB2YXIgYmFzZVNpemU7XG4gICAgICAgIGlmIChpc1ZlcnRpY2FsKSB7XG4gICAgICAgICAgICBiYXNlU2l6ZSA9IGRpbWVuc2lvbi5oZWlnaHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBiYXNlU2l6ZSA9IGRpbWVuc2lvbi53aWR0aDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYmFzZVNpemU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjYW5kaWRhdGUgdGljayBjb3VudHMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBjaGFydERpbWVuc2lvbiBjaGF0IGRpbWVuc2lvblxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNWZXJ0aWNhbCB3aGV0aGVyIHZlcnRpY2FsIG9yIG5vdFxuICAgICAqIEByZXR1cm5zIHthcnJheS48bnVtYmVyPn0gdGljayBjb3VudHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRDYW5kaWRhdGVUaWNrQ291bnRzOiBmdW5jdGlvbihjaGFydERpbWVuc2lvbiwgaXNWZXJ0aWNhbCkge1xuICAgICAgICB2YXIgYmFzZVNpemUgPSB0aGlzLl9nZXRCYXNlU2l6ZShjaGFydERpbWVuc2lvbiwgaXNWZXJ0aWNhbCksXG4gICAgICAgICAgICBzdGFydCA9IHBhcnNlSW50KGJhc2VTaXplIC8gTUFYX1BJWEVMX1NURVBfU0laRSwgMTApLFxuICAgICAgICAgICAgZW5kID0gcGFyc2VJbnQoYmFzZVNpemUgLyBNSU5fUElYRUxfU1RFUF9TSVpFLCAxMCkgKyAxLFxuICAgICAgICAgICAgdGlja0NvdW50cyA9IG5lLnV0aWwucmFuZ2Uoc3RhcnQsIGVuZCk7XG4gICAgICAgIHJldHVybiB0aWNrQ291bnRzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgY29tcGFyaW5nIHZhbHVlLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtaW4gbWluaW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWF4IG1heGltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogQHBhcmFtIHt7c2NhbGU6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9LCBzdGVwOiBudW1iZXJ9fSB0aWNrSW5mbyB0aWNrIGluZm9cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBjb21wYXJpbmcgdmFsdWVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRDb21wYXJpbmdWYWx1ZTogZnVuY3Rpb24obWluLCBtYXgsIHRpY2tJbmZvKSB7XG4gICAgICAgIHZhciBkaWZmTWF4ID0gYWJzKHRpY2tJbmZvLnNjYWxlLm1heCAtIG1heCksXG4gICAgICAgICAgICBkaWZmTWluID0gYWJzKG1pbiAtIHRpY2tJbmZvLnNjYWxlLm1pbiksXG4gICAgICAgICAgICB3ZWlnaHQgPSBNYXRoLnBvdygxMCwgbmUudXRpbC5sZW5ndGhBZnRlclBvaW50KHRpY2tJbmZvLnN0ZXApKTtcbiAgICAgICAgcmV0dXJuIChkaWZmTWF4ICsgZGlmZk1pbikgKiB3ZWlnaHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNlbGVjdCB0aWNrIGluZm8uXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1pbiBtaW5pbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtYXggbWF4aW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxvYmplY3Q+fSBjYW5kaWRhdGVzIHRpY2sgaW5mbyBjYW5kaWRhdGVzXG4gICAgICogQHJldHVybnMge3tzY2FsZToge21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn0sIHRpY2tDb3VudDogbnVtYmVyLCBzdGVwOiBudW1iZXIsIGxhYmVsczogYXJyYXkuPG51bWJlcj59fSBzZWxlY3RlZCB0aWNrIGluZm9cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZWxlY3RUaWNrSW5mbzogZnVuY3Rpb24obWluLCBtYXgsIGNhbmRpZGF0ZXMpIHtcbiAgICAgICAgdmFyIGdldENvbXBhcmluZ1ZhbHVlID0gbmUudXRpbC5iaW5kKHRoaXMuX2dldENvbXBhcmluZ1ZhbHVlLCB0aGlzLCBtaW4sIG1heCksXG4gICAgICAgICAgICB0aWNrSW5mbyA9IG5lLnV0aWwubWluKGNhbmRpZGF0ZXMsIGdldENvbXBhcmluZ1ZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHRpY2tJbmZvO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGljayBjb3VudCBhbmQgc2NhbGUuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnZhbHVlcyBiYXNlIHZhbHVlc1xuICAgICAqICAgICAgQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBwYXJhbXMuc2VyaWVzRGltZW5zaW9uIGNoYXQgZGltZW5zaW9uXG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5pc1ZlcnRpY2FsIHdoZXRoZXIgdmVydGljYWwgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLmNoYXJ0VHlwZSBjaGF0IHR5cGVcbiAgICAgKiBAcGFyYW0ge3ttaW46IG51bWJlciwgbWF4Om51bWJlcn19IG9wdGlvbnMgYXhpcyBvcHRpb25zXG4gICAgICogQHJldHVybnMge3t0aWNrQ291bnQ6IG51bWJlciwgc2NhbGU6IG9iamVjdH19IHRpY2sgaW5mb1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFRpY2tJbmZvOiBmdW5jdGlvbihwYXJhbXMsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIG1pbiA9IG5lLnV0aWwubWluKHBhcmFtcy52YWx1ZXMpLFxuICAgICAgICAgICAgbWF4ID0gbmUudXRpbC5tYXgocGFyYW1zLnZhbHVlcyksXG4gICAgICAgICAgICBpbnRUeXBlSW5mbywgdGlja0NvdW50cywgY2FuZGlkYXRlcywgdGlja0luZm87XG4gICAgICAgIC8vIDAxLiBtaW4sIG1heCwgb3B0aW9ucyDsoJXrs7Trpbwg7KCV7IiY7ZiV7Jy866GcIOuzgOqyvVxuICAgICAgICBpbnRUeXBlSW5mbyA9IHRoaXMuX21ha2VJbnRlZ2VyVHlwZUluZm8obWluLCBtYXgsIG9wdGlvbnMpO1xuXG4gICAgICAgIC8vIDAyLiB0aWNrIGNvdW50IO2bhOuztOq1sCDslrvquLBcbiAgICAgICAgdGlja0NvdW50cyA9IHBhcmFtcy50aWNrQ291bnQgPyBbcGFyYW1zLnRpY2tDb3VudF0gOiB0aGlzLl9nZXRDYW5kaWRhdGVUaWNrQ291bnRzKHBhcmFtcy5zZXJpZXNEaW1lbnNpb24sIHBhcmFtcy5pc1ZlcnRpY2FsKTtcblxuICAgICAgICAvLyAwMy4gdGljayBpbmZvIO2bhOuztOq1sCDqs4TsgrBcbiAgICAgICAgY2FuZGlkYXRlcyA9IHRoaXMuX2dldENhbmRpZGF0ZVRpY2tJbmZvcyh7XG4gICAgICAgICAgICBtaW46IGludFR5cGVJbmZvLm1pbixcbiAgICAgICAgICAgIG1heDogaW50VHlwZUluZm8ubWF4LFxuICAgICAgICAgICAgdGlja0NvdW50czogdGlja0NvdW50cyxcbiAgICAgICAgICAgIGNoYXJ0VHlwZTogcGFyYW1zLmNoYXJ0VHlwZVxuICAgICAgICB9LCBpbnRUeXBlSW5mby5vcHRpb25zKTtcblxuICAgICAgICAvLyAwNC4gdGljayBpbmZvIO2bhOuztOq1sCDspJEg7ZWY64KYIOyEoO2DnVxuICAgICAgICB0aWNrSW5mbyA9IHRoaXMuX3NlbGVjdFRpY2tJbmZvKGludFR5cGVJbmZvLm1pbiwgaW50VHlwZUluZm8ubWF4LCBjYW5kaWRhdGVzKTtcblxuICAgICAgICAvLyAwNS4g7KCV7IiY7ZiV7Jy866GcIOuzgOqyve2WiOuNmCB0aWNrIGluZm/rpbwg7JuQ656YIO2Yle2DnOuhnCDrs4Dqsr1cbiAgICAgICAgdGlja0luZm8gPSB0aGlzLl9yZXZlcnRPcmlnaW5hbFR5cGVUaWNrSW5mbyh0aWNrSW5mbywgaW50VHlwZUluZm8uZGl2aWRlTnVtKTtcbiAgICAgICAgcmV0dXJuIHRpY2tJbmZvO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGludGVnZXIgdHlwZSBpbmZvXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1pbiBtaW5pbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtYXggbWF4aW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiBAcGFyYW0ge3ttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fSBvcHRpb25zIGF4aXMgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHt7bWluOiBudW1iZXIsIG1heDogbnVtYmVyLCBvcHRpb25zOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfSwgZGl2aWRlTnVtOiBudW1iZXJ9fSBpbnRlZ2VyIHR5cGUgaW5mb1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VJbnRlZ2VyVHlwZUluZm86IGZ1bmN0aW9uKG1pbiwgbWF4LCBvcHRpb25zKSB7XG4gICAgICAgIHZhciBtdWx0aXBsZU51bSwgY2hhbmdlZE9wdGlvbnM7XG5cbiAgICAgICAgaWYgKGFicyhtaW4pID49IDEgfHwgYWJzKG1heCkgPj0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBtaW46IG1pbixcbiAgICAgICAgICAgICAgICBtYXg6IG1heCxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zLFxuICAgICAgICAgICAgICAgIGRpdmlkZU51bTogMVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIG11bHRpcGxlTnVtID0gbmUudXRpbC5maW5kTXVsdGlwbGVOdW0obWluLCBtYXgpO1xuICAgICAgICBjaGFuZ2VkT3B0aW9ucyA9IHt9O1xuXG4gICAgICAgIGlmIChvcHRpb25zLm1pbikge1xuICAgICAgICAgICAgY2hhbmdlZE9wdGlvbnMubWluID0gb3B0aW9ucy5taW4gKiBtdWx0aXBsZU51bTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvcHRpb25zLm1heCkge1xuICAgICAgICAgICAgY2hhbmdlZE9wdGlvbnMubWF4ID0gb3B0aW9ucy5tYXggKiBtdWx0aXBsZU51bTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBtaW46IG1pbiAqIG11bHRpcGxlTnVtLFxuICAgICAgICAgICAgbWF4OiBtYXggKiBtdWx0aXBsZU51bSxcbiAgICAgICAgICAgIG9wdGlvbnM6IGNoYW5nZWRPcHRpb25zLFxuICAgICAgICAgICAgZGl2aWRlTnVtOiBtdWx0aXBsZU51bVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXZlcnQgdGljayBpbmZvIHRvIG9yaWdpbmFsIHR5cGUuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHt7c3RlcDogbnVtYmVyLCBzY2FsZToge21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn0sIGxhYmVsczogYXJyYXkuPG51bWJlcj59fSB0aWNrSW5mbyB0aWNrIGluZm9cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZGl2aWRlTnVtIGRpdmlkZSBudW1cbiAgICAgKiBAcmV0dXJucyB7e3N0ZXA6IG51bWJlciwgc2NhbGU6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9LCBsYWJlbHM6IGFycmF5LjxudW1iZXI+fX0gZGl2aWRlZCB0aWNrIGluZm9cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZXZlcnRPcmlnaW5hbFR5cGVUaWNrSW5mbzogZnVuY3Rpb24odGlja0luZm8sIGRpdmlkZU51bSkge1xuICAgICAgICBpZiAoZGl2aWRlTnVtID09PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gdGlja0luZm87XG4gICAgICAgIH1cblxuICAgICAgICB0aWNrSW5mby5zdGVwID0gbmUudXRpbC5kaXZpc2lvbih0aWNrSW5mby5zdGVwLCBkaXZpZGVOdW0pO1xuICAgICAgICB0aWNrSW5mby5zY2FsZS5taW4gPSBuZS51dGlsLmRpdmlzaW9uKHRpY2tJbmZvLnNjYWxlLm1pbiwgZGl2aWRlTnVtKTtcbiAgICAgICAgdGlja0luZm8uc2NhbGUubWF4ID0gbmUudXRpbC5kaXZpc2lvbih0aWNrSW5mby5zY2FsZS5tYXgsIGRpdmlkZU51bSk7XG4gICAgICAgIHRpY2tJbmZvLmxhYmVscyA9IG5lLnV0aWwubWFwKHRpY2tJbmZvLmxhYmVscywgZnVuY3Rpb24obGFiZWwpIHtcbiAgICAgICAgICAgIHJldHVybiBuZS51dGlsLmRpdmlzaW9uKGxhYmVsLCBkaXZpZGVOdW0pO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdGlja0luZm87XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE5vcm1hbGl6ZSBzdGVwLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdGVwIG9yaWdpbmFsIHN0ZXBcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBub3JtYWxpemVkIHN0ZXBcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9ub3JtYWxpemVTdGVwOiBmdW5jdGlvbihzdGVwKSB7XG4gICAgICAgIHJldHVybiBjYWxjdWxhdG9yLm5vcm1hbGl6ZUF4aXNOdW1iZXIoc3RlcCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1pbmltaXplIHRpY2sgc2NhbGUuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnVzZXJNaW4gdXNlciBtaW5cbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMudXNlck1heCB1c2VyIG1heFxuICAgICAqICAgICAgQHBhcmFtIHt7dGlja0NvdW50OiBudW1iZXIsIHNjYWxlOiBvYmplY3R9fSBwYXJhbXMudGlja0luZm8gdGljayBpbmZvXG4gICAgICogICAgICBAcGFyYW0ge3ttaW46IG51bWJlciwgbWF4Om51bWJlcn19IHBhcmFtcy5vcHRpb25zIGF4aXMgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHt7dGlja0NvdW50OiBudW1iZXIsIHNjYWxlOiBvYmplY3QsIGxhYmVsczogYXJyYXl9fSBjb3JyZWN0ZWQgdGljayBpbmZvXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWluaW1pemVUaWNrU2NhbGU6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgdGlja0luZm8gPSBwYXJhbXMudGlja0luZm8sXG4gICAgICAgICAgICB0aWNrcyA9IG5lLnV0aWwucmFuZ2UoMSwgdGlja0luZm8udGlja0NvdW50KSxcbiAgICAgICAgICAgIG9wdGlvbnMgPSBwYXJhbXMub3B0aW9ucyxcbiAgICAgICAgICAgIHN0ZXAgPSB0aWNrSW5mby5zdGVwLFxuICAgICAgICAgICAgc2NhbGUgPSB0aWNrSW5mby5zY2FsZSxcbiAgICAgICAgICAgIHRpY2tNYXggPSBzY2FsZS5tYXgsXG4gICAgICAgICAgICB0aWNrTWluID0gc2NhbGUubWluLFxuICAgICAgICAgICAgaXNVbmRlZmluZWRNaW4gPSBuZS51dGlsLmlzVW5kZWZpbmVkKG9wdGlvbnMubWluKSxcbiAgICAgICAgICAgIGlzVW5kZWZpbmVkTWF4ID0gbmUudXRpbC5pc1VuZGVmaW5lZChvcHRpb25zLm1heCksXG4gICAgICAgICAgICBsYWJlbHM7XG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KHRpY2tzLCBmdW5jdGlvbih0aWNrSW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBjdXJTdGVwID0gKHN0ZXAgKiB0aWNrSW5kZXgpLFxuICAgICAgICAgICAgICAgIGN1ck1pbiA9IHRpY2tNaW4gKyBjdXJTdGVwLFxuICAgICAgICAgICAgICAgIGN1ck1heCA9IHRpY2tNYXggLSBjdXJTdGVwO1xuXG4gICAgICAgICAgICAvLyDrjZTsnbTsg4Eg67OA6rK97J20IO2VhOyalCDsl4bsnYQg6rK97JqwXG4gICAgICAgICAgICBpZiAocGFyYW1zLnVzZXJNaW4gPD0gY3VyTWluICYmIHBhcmFtcy51c2VyTWF4ID49IGN1ck1heCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gbWluIOqwkuyXkCDrs4Dqsr0g7Jes7Jyg6rCAIOyeiOydhCDqsr3smrBcbiAgICAgICAgICAgIGlmICgoaXNVbmRlZmluZWRNaW4gJiYgcGFyYW1zLnVzZXJNaW4gPiBjdXJNaW4pIHx8XG4gICAgICAgICAgICAgICAgKCFpc1VuZGVmaW5lZE1pbiAmJiBvcHRpb25zLm1pbiA+PSBjdXJNaW4pKSB7XG4gICAgICAgICAgICAgICAgc2NhbGUubWluID0gY3VyTWluO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBtYXgg6rCS7JeQIOuzgOqyvSDsl6zsnKDqsIAg7J6I7J2EIOqyveyasFxuICAgICAgICAgICAgaWYgKChpc1VuZGVmaW5lZE1pbiAmJiBwYXJhbXMudXNlck1heCA8IGN1ck1heCkgfHxcbiAgICAgICAgICAgICAgICAoIWlzVW5kZWZpbmVkTWF4ICYmIG9wdGlvbnMubWF4IDw9IGN1ck1heCkpIHtcbiAgICAgICAgICAgICAgICBzY2FsZS5tYXggPSBjdXJNYXg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxhYmVscyA9IGNhbGN1bGF0b3IubWFrZUxhYmVsc0Zyb21TY2FsZShzY2FsZSwgc3RlcCk7XG4gICAgICAgIHRpY2tJbmZvLmxhYmVscyA9IGxhYmVscztcbiAgICAgICAgdGlja0luZm8uc3RlcCA9IHN0ZXA7XG4gICAgICAgIHRpY2tJbmZvLnRpY2tDb3VudCA9IGxhYmVscy5sZW5ndGg7XG4gICAgICAgIHJldHVybiB0aWNrSW5mbztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gZGl2aWRlIHRpY2sgc3RlcC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge3tzY2FsZToge21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn0sIHRpY2tDb3VudDogbnVtYmVyLCBzdGVwOiBudW1iZXIsIGxhYmVsczogYXJyYXkuPG51bWJlcj59fSB0aWNrSW5mbyB0aWNrIGluZm9cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gb3JnVGlja0NvdW50IG9yaWdpbmFsIHRpY2tDb3VudFxuICAgICAqIEByZXR1cm5zIHt7c2NhbGU6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9LCB0aWNrQ291bnQ6IG51bWJlciwgc3RlcDogbnVtYmVyLCBsYWJlbHM6IGFycmF5LjxudW1iZXI+fX0gdGljayBpbmZvXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZGl2aWRlVGlja1N0ZXA6IGZ1bmN0aW9uKHRpY2tJbmZvLCBvcmdUaWNrQ291bnQpIHtcbiAgICAgICAgdmFyIHN0ZXAgPSB0aWNrSW5mby5zdGVwLFxuICAgICAgICAgICAgc2NhbGUgPSB0aWNrSW5mby5zY2FsZSxcbiAgICAgICAgICAgIHRpY2tDb3VudCA9IHRpY2tJbmZvLnRpY2tDb3VudDtcbiAgICAgICAgLy8gc3RlcCAy7J2YIOuwsOyImCDsnbTrqbTshJwg67OA6rK965CcIHRpY2tDb3VudOydmCDrkZDrsLDsiJgtMeydtCB0aWNrQ291bnTrs7Tri6Qgb3JnVGlja0NvdW507JmAIOywqOydtOqwgCDrjZzrgpjqsbDrgpgg6rCZ7Jy866m0IHN0ZXDsnYQg67CY7Jy866GcIOuzgOqyve2VnOuLpC5cbiAgICAgICAgaWYgKChzdGVwICUgMiA9PT0gMCkgJiZcbiAgICAgICAgICAgIGFicyhvcmdUaWNrQ291bnQgLSAoKHRpY2tDb3VudCAqIDIpIC0gMSkpIDw9IGFicyhvcmdUaWNrQ291bnQgLSB0aWNrQ291bnQpKSB7XG4gICAgICAgICAgICBzdGVwID0gc3RlcCAvIDI7XG4gICAgICAgICAgICB0aWNrSW5mby5sYWJlbHMgPSBjYWxjdWxhdG9yLm1ha2VMYWJlbHNGcm9tU2NhbGUoc2NhbGUsIHN0ZXApO1xuICAgICAgICAgICAgdGlja0luZm8udGlja0NvdW50ID0gdGlja0luZm8ubGFiZWxzLmxlbmd0aDtcbiAgICAgICAgICAgIHRpY2tJbmZvLnN0ZXAgPSBzdGVwO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aWNrSW5mbztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSB0aWNrIGluZm9cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMudGlja0NvdW50IHRpY2sgY291bnRcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubWluIHNjYWxlIG1pblxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5tYXggc2NhbGUgbWF4XG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnVzZXJNaW4gbWluaW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMudXNlck1heCBtYXhpbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaXNNaW51cyB3aGV0aGVyIHNjYWxlIGlzIG1pbnVzIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5jaGFydFR5cGUgY2hhcnQgdHlwZVxuICAgICAqICAgICAgQHBhcmFtIHt7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX0gcGFyYW1zLm9wdGlvbnMgYXhpcyBvcHRpb25zXG4gICAgICogQHJldHVybnMge3tcbiAgICAgKiAgICAgIHNjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfSxcbiAgICAgKiAgICAgIHRpY2tDb3VudDogbnVtYmVyLFxuICAgICAqICAgICAgc3RlcDogbnVtYmVyLFxuICAgICAqICAgICAgbGFiZWxzOiBhcnJheS48bnVtYmVyPlxuICAgICAqIH19IHRpY2sgaW5mb1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VUaWNrSW5mbzogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBzY2FsZSA9IHBhcmFtcy5zY2FsZSxcbiAgICAgICAgICAgIHN0ZXAsIHRpY2tJbmZvO1xuXG4gICAgICAgIC8vIDAxLiDquLDrs7ggc2NhbGUg7KCV67O066GcIHN0ZXAg7Ja76riwXG4gICAgICAgIHN0ZXAgPSBjYWxjdWxhdG9yLmdldFNjYWxlU3RlcChzY2FsZSwgcGFyYW1zLnRpY2tDb3VudCk7XG5cbiAgICAgICAgLy8gMDIuIHN0ZXAg7KCV6rec7ZmUIOyLnO2CpOq4sCAoZXg6IDAuMyAtLT4gMC41LCA3IC0tPiAxMClcbiAgICAgICAgc3RlcCA9IHRoaXMuX25vcm1hbGl6ZVN0ZXAoc3RlcCk7XG5cbiAgICAgICAgLy8gMDMuIHNjYWxlIOygleq3nO2ZlCDsi5ztgqTquLBcbiAgICAgICAgc2NhbGUgPSB0aGlzLl9ub3JtYWxpemVTY2FsZShzY2FsZSwgc3RlcCwgcGFyYW1zLnRpY2tDb3VudCk7XG5cbiAgICAgICAgLy8gMDQuIGxpbmXssKjtirjsnZgg6rK97JqwIOyCrOyaqeyekOydmCBtaW7qsJLsnbQgc2NhbGXsnZggbWlu6rCS6rO8IOqwmeydhCDqsr3smrAsIG1pbuqwkuydhCAxIHN0ZXAg6rCQ7IaMIOyLnO2CtFxuICAgICAgICBzY2FsZS5taW4gPSB0aGlzLl9hZGRNaW5QYWRkaW5nKHtcbiAgICAgICAgICAgIG1pbjogc2NhbGUubWluLFxuICAgICAgICAgICAgc3RlcDogc3RlcCxcbiAgICAgICAgICAgIHVzZXJNaW46IHBhcmFtcy51c2VyTWluLFxuICAgICAgICAgICAgbWluT3B0aW9uOiBwYXJhbXMub3B0aW9ucy5taW4sXG4gICAgICAgICAgICBjaGFydFR5cGU6IHBhcmFtcy5jaGFydFR5cGVcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gMDUuIOyCrOyaqeyekOydmCBtYXjqsJLsnbQgc2NhZWwgbWF47JmAIOqwmeydhCDqsr3smrAsIG1heOqwkuydhCAxIHN0ZXAg7Kad6rCAIOyLnO2CtFxuICAgICAgICBzY2FsZS5tYXggPSB0aGlzLl9hZGRNYXhQYWRkaW5nKHtcbiAgICAgICAgICAgIG1heDogc2NhbGUubWF4LFxuICAgICAgICAgICAgc3RlcDogc3RlcCxcbiAgICAgICAgICAgIHVzZXJNYXg6IHBhcmFtcy51c2VyTWF4LFxuICAgICAgICAgICAgbWF4T3B0aW9uOiBwYXJhbXMub3B0aW9ucy5tYXhcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gMDYuIGF4aXMgc2NhbGXsnbQg7IKs7Jqp7J6QIG1pbiwgbWF47JmAIOqxsOumrOqwgCDrqYAg6rK97JqwIOyhsOygiFxuICAgICAgICB0aWNrSW5mbyA9IHRoaXMuX21pbmltaXplVGlja1NjYWxlKHtcbiAgICAgICAgICAgIHVzZXJNaW46IHBhcmFtcy51c2VyTWluLFxuICAgICAgICAgICAgdXNlck1heDogcGFyYW1zLnVzZXJNYXgsXG4gICAgICAgICAgICB0aWNrSW5mbzoge3NjYWxlOiBzY2FsZSwgc3RlcDogc3RlcCwgdGlja0NvdW50OiBwYXJhbXMudGlja0NvdW50fSxcbiAgICAgICAgICAgIG9wdGlvbnM6IHBhcmFtcy5vcHRpb25zXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRpY2tJbmZvID0gdGhpcy5fZGl2aWRlVGlja1N0ZXAodGlja0luZm8sIHBhcmFtcy50aWNrQ291bnQpO1xuICAgICAgICByZXR1cm4gdGlja0luZm87XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZCBzY2FsZSBtaW4gcGFkZGluZy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwcmFtcyB7bnVtYmVyfSBwYXJhbXMubWluIHNjYWxlIG1pblxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy51c2VyTWluIG1pbmltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLm1pbk9wdGlvbiBtaW4gb3B0aW9uXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnN0ZXAgdGljayBzdGVwXG4gICAgICogQHJldHVybnMge251bWJlcn0gc2NhbGUgbWluXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYWRkTWluUGFkZGluZzogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBtaW4gPSBwYXJhbXMubWluO1xuXG4gICAgICAgIC8vIG5vcm1hbGl6ZeuQnCBzY2FsZSBtaW7qsJLsnbQgdXNlciBtaW7qsJLqs7wg6rCZ7J2EIOqyveyasCBzdGVwIOqwkOyGjFxuICAgICAgICBpZiAoKHBhcmFtcy5jaGFydFR5cGUgPT09IGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9MSU5FIHx8IG1pbikgJiYgbWluID09PSBwYXJhbXMudXNlck1pbikge1xuICAgICAgICAgICAgbWluIC09IHBhcmFtcy5zdGVwO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtaW47XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZCBzY2FsZSBtYXggcGFkZGluZy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwcmFtcyB7bnVtYmVyfSBwYXJhbXMubWF4IHNjYWxlIG1heFxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy51c2VyTWF4IG1heGltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLm1heE9wdGlvbiBtYXggb3B0aW9uXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnN0ZXAgdGljayBzdGVwXG4gICAgICogQHJldHVybnMge251bWJlcn0gc2NhbGUgbWF4XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYWRkTWF4UGFkZGluZzogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBtYXggPSBwYXJhbXMubWF4O1xuICAgICAgICAvLyBub3JtYWxpemXrkJwgc2NhbGUgbWF46rCS7J20IHVzZXIgbWF46rCS6rO8IOqwmeydhCDqsr3smrAgc3RlcCDspp3qsIBcbiAgICAgICAgaWYgKG5lLnV0aWwuaXNVbmRlZmluZWQocGFyYW1zLm1heE9wdGlvbikgJiYgKHBhcmFtcy5tYXggPT09IHBhcmFtcy51c2VyTWF4KSkge1xuICAgICAgICAgICAgbWF4ICs9IHBhcmFtcy5zdGVwO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXg7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG5vcm1hbGl6ZSBtaW4uXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1pbiBvcmlnaW5hbCBtaW5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3RlcCB0aWNrIHN0ZXBcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBub3JtYWxpemVkIG1pblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX25vcm1hbGl6ZU1pbjogZnVuY3Rpb24obWluLCBzdGVwKSB7XG4gICAgICAgIHZhciBtb2QgPSBuZS51dGlsLm1vZChtaW4sIHN0ZXApLFxuICAgICAgICAgICAgbm9ybWFsaXplZDtcblxuICAgICAgICBpZiAobW9kID09PSAwKSB7XG4gICAgICAgICAgICBub3JtYWxpemVkID0gbWluO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbm9ybWFsaXplZCA9IG5lLnV0aWwuc3VidHJhY3Rpb24obWluLCAobWluID49IDAgPyBtb2QgOiBzdGVwICsgbW9kKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5vcm1hbGl6ZWQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2Ugbm9ybWFsaXplZCBtYXguXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHt7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX0gc2NhbGUgc2NhbGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3RlcCB0aWNrIHN0ZXBcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdGlja0NvdW50IHRpY2sgY291bnRcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBub3JtYWxpemVkIG1heFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VOb3JtYWxpemVkTWF4OiBmdW5jdGlvbihzY2FsZSwgc3RlcCwgdGlja0NvdW50KSB7XG4gICAgICAgIHZhciBtaW5NYXhEaWZmID0gbmUudXRpbC5tdWx0aXBsaWNhdGlvbihzdGVwLCB0aWNrQ291bnQgLSAxKSxcbiAgICAgICAgICAgIG5vcm1hbGl6ZWRNYXggPSBuZS51dGlsLmFkZGl0aW9uKHNjYWxlLm1pbiwgbWluTWF4RGlmZiksXG4gICAgICAgICAgICBtYXhEaWZmID0gc2NhbGUubWF4IC0gbm9ybWFsaXplZE1heCxcbiAgICAgICAgICAgIG1vZERpZmYsIGRpdmlkZURpZmY7XG4gICAgICAgIC8vIG5vcm1hbGl6ZeuQnCBtYXjqsJLsnbQg7JuQ656Y7J2YIG1heOqwkiDrs7Tri6Qg7J6R7J2EIOqyveyasCBzdGVw7J2EIOymneqwgOyLnOy8nCDtgbAg6rCS7Jy866GcIOunjOuTpOq4sFxuICAgICAgICBpZiAobWF4RGlmZiA+IDApIHtcbiAgICAgICAgICAgIG1vZERpZmYgPSBtYXhEaWZmICUgc3RlcDtcbiAgICAgICAgICAgIGRpdmlkZURpZmYgPSBNYXRoLmZsb29yKG1heERpZmYgLyBzdGVwKTtcbiAgICAgICAgICAgIG5vcm1hbGl6ZWRNYXggKz0gc3RlcCAqIChtb2REaWZmID4gMCA/IGRpdmlkZURpZmYgKyAxIDogZGl2aWRlRGlmZik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5vcm1hbGl6ZWRNYXg7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG5vcm1hbGl6ZSBzY2FsZS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge3ttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fSBzY2FsZSBiYXNlIHNjYWxlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHN0ZXAgdGljayBzdGVwXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHRpY2tDb3VudCB0aWNrIGNvdW50XG4gICAgICogQHJldHVybnMge3ttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fSBub3JtYWxpemVkIHNjYWxlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbm9ybWFsaXplU2NhbGU6IGZ1bmN0aW9uKHNjYWxlLCBzdGVwLCB0aWNrQ291bnQpIHtcbiAgICAgICAgc2NhbGUubWluID0gdGhpcy5fbm9ybWFsaXplTWluKHNjYWxlLm1pbiwgc3RlcCk7XG4gICAgICAgIHNjYWxlLm1heCA9IHRoaXMuX21ha2VOb3JtYWxpemVkTWF4KHNjYWxlLCBzdGVwLCB0aWNrQ291bnQpO1xuICAgICAgICByZXR1cm4gc2NhbGU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjYW5kaWRhdGVzIGFib3V0IHRpY2sgaW5mby5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubWluIG1pbmltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLm1heCBtYXhpbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48bnVtYmVyPn0gcGFyYW1zLnRpY2tDb3VudHMgdGljayBjb3VudHNcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMuY2hhcnRUeXBlIGNoYXJ0IHR5cGVcbiAgICAgKiBAcGFyYW0ge3ttaW46IG51bWJlciwgbWF4Om51bWJlcn19IG9wdGlvbnMgYXhpcyBvcHRpb25zXG4gICAgICogQHJldHVybnMge2FycmF5fSBjYW5kaWRhdGVzIGFib3V0IHRpY2sgaW5mb1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldENhbmRpZGF0ZVRpY2tJbmZvczogZnVuY3Rpb24ocGFyYW1zLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciB1c2VyTWluID0gcGFyYW1zLm1pbixcbiAgICAgICAgICAgIHVzZXJNYXggPSBwYXJhbXMubWF4LFxuICAgICAgICAgICAgbWluID0gcGFyYW1zLm1pbixcbiAgICAgICAgICAgIG1heCA9IHBhcmFtcy5tYXgsXG4gICAgICAgICAgICBzY2FsZSwgY2FuZGlkYXRlcztcblxuICAgICAgICAvLyBtaW4sIG1heOunjOycvOuhnCDquLDrs7ggc2NhbGUg7Ja76riwXG4gICAgICAgIHNjYWxlID0gdGhpcy5fbWFrZUJhc2VTY2FsZShtaW4sIG1heCwgb3B0aW9ucyk7XG5cbiAgICAgICAgY2FuZGlkYXRlcyA9IG5lLnV0aWwubWFwKHBhcmFtcy50aWNrQ291bnRzLCBmdW5jdGlvbih0aWNrQ291bnQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9tYWtlVGlja0luZm8oe1xuICAgICAgICAgICAgICAgIHRpY2tDb3VudDogdGlja0NvdW50LFxuICAgICAgICAgICAgICAgIHNjYWxlOiBuZS51dGlsLmV4dGVuZCh7fSwgc2NhbGUpLFxuICAgICAgICAgICAgICAgIHVzZXJNaW46IHVzZXJNaW4sXG4gICAgICAgICAgICAgICAgdXNlck1heDogdXNlck1heCxcbiAgICAgICAgICAgICAgICBjaGFydFR5cGU6IHBhcmFtcy5jaGFydFR5cGUsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgICByZXR1cm4gY2FuZGlkYXRlcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBiYXNlIHNjYWxlXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1pbiBtaW5pbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtYXggbWF4aW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiBAcGFyYW0ge3ttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fSBvcHRpb25zIGF4aXMgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHt7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX0gYmFzZSBzY2FsZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VCYXNlU2NhbGU6IGZ1bmN0aW9uKG1pbiwgbWF4LCBvcHRpb25zKSB7XG4gICAgICAgIHZhciBpc01pbnVzID0gZmFsc2UsXG4gICAgICAgICAgICB0bXBNaW4sIHNjYWxlO1xuXG4gICAgICAgIGlmIChtaW4gPCAwICYmIG1heCA8PSAwKSB7XG4gICAgICAgICAgICBpc01pbnVzID0gdHJ1ZTtcbiAgICAgICAgICAgIHRtcE1pbiA9IG1pbjtcbiAgICAgICAgICAgIG1pbiA9IC1tYXg7XG4gICAgICAgICAgICBtYXggPSAtdG1wTWluO1xuICAgICAgICB9XG5cbiAgICAgICAgc2NhbGUgPSBjYWxjdWxhdG9yLmNhbGN1bGF0ZVNjYWxlKG1pbiwgbWF4KTtcblxuICAgICAgICBpZiAoaXNNaW51cykge1xuICAgICAgICAgICAgdG1wTWluID0gc2NhbGUubWluO1xuICAgICAgICAgICAgc2NhbGUubWluID0gLXNjYWxlLm1heDtcbiAgICAgICAgICAgIHNjYWxlLm1heCA9IC10bXBNaW47XG4gICAgICAgIH1cblxuICAgICAgICBzY2FsZS5taW4gPSBvcHRpb25zLm1pbiB8fCBzY2FsZS5taW47XG4gICAgICAgIHNjYWxlLm1heCA9IG9wdGlvbnMubWF4IHx8IHNjYWxlLm1heDtcblxuICAgICAgICByZXR1cm4gc2NhbGU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZvcm1hdCBsYWJlbHMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gbGFiZWxzIHRhcmdldCBsYWJlbHNcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uW119IGZvcm1hdEZ1bmN0aW9ucyBmb3JtYXQgZnVuY3Rpb25zXG4gICAgICogQHJldHVybnMge3N0cmluZ1tdfSBmb3JtYXR0ZWQgbGFiZWxzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZm9ybWF0TGFiZWxzOiBmdW5jdGlvbihsYWJlbHMsIGZvcm1hdEZ1bmN0aW9ucykge1xuICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICBpZiAoIWZvcm1hdEZ1bmN0aW9ucyB8fCAhZm9ybWF0RnVuY3Rpb25zLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIGxhYmVscztcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQgPSBuZS51dGlsLm1hcChsYWJlbHMsIGZ1bmN0aW9uKGxhYmVsKSB7XG4gICAgICAgICAgICB2YXIgZm5zID0gY29uY2F0LmFwcGx5KFtsYWJlbF0sIGZvcm1hdEZ1bmN0aW9ucyk7XG4gICAgICAgICAgICByZXR1cm4gbmUudXRpbC5yZWR1Y2UoZm5zLCBmdW5jdGlvbihzdG9yZWQsIGZuKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZuKHN0b3JlZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBheGlzRGF0YU1ha2VyO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEJvdW5kcyBtYWtlci5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGNhbGN1bGF0b3IgPSByZXF1aXJlKCcuL2NhbGN1bGF0b3InKSxcbiAgICBjaGFydENvbnN0ID0gcmVxdWlyZSgnLi4vY29uc3QnKSxcbiAgICByZW5kZXJVdGlsID0gcmVxdWlyZSgnLi9yZW5kZXJVdGlsJyk7XG5cbnZhciBDSEFSVF9QQURESU5HID0gMTAsXG4gICAgVElUTEVfQUREX1BBRERJTkcgPSAyMCxcbiAgICBMRUdFTkRfQVJFQV9QQURESU5HID0gMTAsXG4gICAgTEVHRU5EX1JFQ1RfV0lEVEggPSAxMixcbiAgICBMRUdFTkRfTEFCRUxfUEFERElOR19MRUZUID0gNSxcbiAgICBBWElTX0xBQkVMX1BBRERJTkcgPSA3LFxuICAgIEhJRERFTl9XSURUSCA9IDE7XG5cbnZhciBjb25jYXQgPSBBcnJheS5wcm90b3R5cGUuY29uY2F0O1xuXG4vKipcbiAqIEJvdW5kcyBtYWtlci5cbiAqIEBtb2R1bGUgYm91bmRzTWFrZXJcbiAqL1xudmFyIGJvdW5kc01ha2VyID0ge1xuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYm91bmRzIGFib3V0IGNoYXJ0IGNvbXBvbmVudHMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpib3VuZHNNYWtlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5jb252ZXJ0RGF0YSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBjaGFydCB0aGVtZVxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaXNWZXJ0aWNhbCB3aGV0aGVyIHZlcnRpY2FsIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5vcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gcGFyYW1zLmhhc0F4ZXMgd2hldGhlciBoYXMgYXhlcyBhcmVhIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHthcnJheX0gcGFyYW1zLm9wdGlvbkNoYXJ0VHlwZXMgeSBheGlzIG9wdGlvbiBjaGFydCB0eXBlc1xuICAgICAqIEByZXR1cm5zIHt7XG4gICAgICogICBwbG90OiB7XG4gICAgICogICAgIGRpbWVuc2lvbjoge3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfSxcbiAgICAgKiAgICAgcG9zaXRpb246IHt0b3A6IG51bWJlciwgcmlnaHQ6IG51bWJlcn1cbiAgICAgKiAgIH0sXG4gICAgICogICB5QXhpczoge1xuICAgICAqICAgICBkaW1lbnNpb246IHt3aWR0aDogKG51bWJlciksIGhlaWdodDogbnVtYmVyfSxcbiAgICAgKiAgICAgcG9zaXRpb246IHt0b3A6IG51bWJlcn1cbiAgICAgKiAgIH0sXG4gICAgICogICB4QXhpczoge1xuICAgICAqICAgICBkaW1lbnNpb246IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IChudW1iZXIpfSxcbiAgICAgKiAgICAgcG9zaXRpb246IHtyaWdodDogbnVtYmVyfVxuICAgICAqICAgfSxcbiAgICAgKiAgIHNlcmllczoge1xuICAgICAqICAgICBkaW1lbnNpb246IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn0sXG4gICAgICogICAgIHBvc2l0aW9uOiB7dG9wOiBudW1iZXIsIHJpZ2h0OiBudW1iZXJ9XG4gICAgICogICB9LFxuICAgICAqICAgbGVnZW5kOiB7XG4gICAgICogICAgIHBvc2l0aW9uOiB7dG9wOiBudW1iZXJ9XG4gICAgICogICB9LFxuICAgICAqICAgdG9vbHRpcDoge1xuICAgICAqICAgICBkaW1lbnNpb246IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn0sXG4gICAgICogICAgIHBvc2l0aW9uOiB7dG9wOiBudW1iZXIsIGxlZnQ6IG51bWJlcn1cbiAgICAgKiAgIH1cbiAgICAgKiB9fSBib3VuZHNcbiAgICAgKi9cbiAgICBtYWtlOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGRpbWVuc2lvbnMgPSB0aGlzLl9nZXRDb21wb25lbnRzRGltZW5zaW9ucyhwYXJhbXMpLFxuICAgICAgICAgICAgeUF4aXNXaWR0aCA9IGRpbWVuc2lvbnMueUF4aXMud2lkdGgsXG4gICAgICAgICAgICB0b3AgPSBkaW1lbnNpb25zLnRpdGxlLmhlaWdodCArIENIQVJUX1BBRERJTkcsXG4gICAgICAgICAgICBsZWZ0ID0geUF4aXNXaWR0aCArIENIQVJUX1BBRERJTkcsXG4gICAgICAgICAgICByaWdodCA9IGRpbWVuc2lvbnMubGVnZW5kLndpZHRoICsgZGltZW5zaW9ucy55ckF4aXMud2lkdGggKyBDSEFSVF9QQURESU5HLFxuICAgICAgICAgICAgYXhlc0JvdW5kcyA9IHRoaXMuX21ha2VBeGVzQm91bmRzKHtcbiAgICAgICAgICAgICAgICBoYXNBeGVzOiBwYXJhbXMuaGFzQXhlcyxcbiAgICAgICAgICAgICAgICBvcHRpb25DaGFydFR5cGVzOiBwYXJhbXMub3B0aW9uQ2hhcnRUeXBlcyxcbiAgICAgICAgICAgICAgICBkaW1lbnNpb25zOiBkaW1lbnNpb25zLFxuICAgICAgICAgICAgICAgIHRvcDogdG9wLFxuICAgICAgICAgICAgICAgIHJpZ2h0OiByaWdodFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBib3VuZHMgPSBuZS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgY2hhcnQ6IHtcbiAgICAgICAgICAgICAgICAgICAgZGltZW5zaW9uOiBkaW1lbnNpb25zLmNoYXJ0XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzZXJpZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgZGltZW5zaW9uOiBkaW1lbnNpb25zLnNlcmllcyxcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogdG9wLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogbGVmdFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBsZWdlbmQ6IHtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogZGltZW5zaW9ucy50aXRsZS5oZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiB5QXhpc1dpZHRoICsgZGltZW5zaW9ucy5zZXJpZXMud2lkdGggKyBkaW1lbnNpb25zLnlyQXhpcy53aWR0aCArIENIQVJUX1BBRERJTkdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdG9vbHRpcDoge1xuICAgICAgICAgICAgICAgICAgICBkaW1lbnNpb246IGRpbWVuc2lvbnMuc2VyaWVzLFxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiB0b3AsXG4gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiBsZWZ0XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCBheGVzQm91bmRzKTtcbiAgICAgICAgcmV0dXJuIGJvdW5kcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IG1heCBsYWJlbCBvZiB2YWx1ZSBheGlzLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Ym91bmRzTWFrZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udmVydERhdGEgY29udmVydCBkYXRhXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNoYXJ0VHlwZSBjaGFydCB0eXBlXG4gICAgICogQHJldHVybnMge251bWJlcnxzdHJpbmd9IG1heCBsYWJlbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFZhbHVlQXhpc01heExhYmVsOiBmdW5jdGlvbihjb252ZXJ0RGF0YSwgY2hhcnRUeXBlKSB7XG4gICAgICAgIHZhciB2YWx1ZXMgPSBjaGFydFR5cGUgJiYgY29udmVydERhdGEudmFsdWVzW2NoYXJ0VHlwZV0gfHwgY29udmVydERhdGEuam9pblZhbHVlcyxcbiAgICAgICAgICAgIGZvcm1hdEZ1bmN0aW9ucyA9IGNvbnZlcnREYXRhLmZvcm1hdEZ1bmN0aW9ucyxcbiAgICAgICAgICAgIGZsYXR0ZW5WYWx1ZXMgPSBjb25jYXQuYXBwbHkoW10sIHZhbHVlcyksXG4gICAgICAgICAgICBtaW4gPSBuZS51dGlsLm1pbihmbGF0dGVuVmFsdWVzKSxcbiAgICAgICAgICAgIG1heCA9IG5lLnV0aWwubWF4KGZsYXR0ZW5WYWx1ZXMpLFxuICAgICAgICAgICAgc2NhbGUgPSBjYWxjdWxhdG9yLmNhbGN1bGF0ZVNjYWxlKG1pbiwgbWF4KSxcbiAgICAgICAgICAgIG1pbkxhYmVsID0gY2FsY3VsYXRvci5ub3JtYWxpemVBeGlzTnVtYmVyKHNjYWxlLm1pbiksXG4gICAgICAgICAgICBtYXhMYWJlbCA9IGNhbGN1bGF0b3Iubm9ybWFsaXplQXhpc051bWJlcihzY2FsZS5tYXgpLFxuICAgICAgICAgICAgZm5zID0gZm9ybWF0RnVuY3Rpb25zICYmIGZvcm1hdEZ1bmN0aW9ucy5zbGljZSgpIHx8IFtdO1xuICAgICAgICBtYXhMYWJlbCA9IChtaW5MYWJlbCArICcnKS5sZW5ndGggPiAobWF4TGFiZWwgKyAnJykubGVuZ3RoID8gbWluTGFiZWwgOiBtYXhMYWJlbDtcbiAgICAgICAgZm5zLnVuc2hpZnQobWF4TGFiZWwpO1xuICAgICAgICBtYXhMYWJlbCA9IG5lLnV0aWwucmVkdWNlKGZucywgZnVuY3Rpb24oc3RvcmVkLCBmbikge1xuICAgICAgICAgICAgcmV0dXJuIGZuKHN0b3JlZCk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gbWF4TGFiZWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBSZW5kZXJlZCBMYWJlbHMgTWF4IFNpemUod2lkdGggb3IgaGVpZ2h0KS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmJvdW5kc01ha2VyXG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gbGFiZWxzIGxhYmVsc1xuICAgICAqIEBwYXJhbSB7e2ZvbnRTaXplOiBudW1iZXIsIGZvbnRGYW1pbHk6IHN0cmluZywgY29sb3I6IHN0cmluZ319IHRoZW1lIGxhYmVsIHRoZW1lXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gaXRlcmF0ZWUgaXRlcmF0ZWVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBtYXggc2l6ZSAod2lkdGggb3IgaGVpZ2h0KVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFJlbmRlcmVkTGFiZWxzTWF4U2l6ZTogZnVuY3Rpb24obGFiZWxzLCB0aGVtZSwgaXRlcmF0ZWUpIHtcbiAgICAgICAgdmFyIHNpemVzID0gbmUudXRpbC5tYXAobGFiZWxzLCBmdW5jdGlvbihsYWJlbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpdGVyYXRlZShsYWJlbCwgdGhlbWUpO1xuICAgICAgICAgICAgfSwgdGhpcyksXG4gICAgICAgICAgICBtYXhTaXplID0gbmUudXRpbC5tYXgoc2l6ZXMpO1xuICAgICAgICByZXR1cm4gbWF4U2l6ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHJlbmRlcmVkIGxhYmVscyBtYXggd2lkdGguXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpib3VuZHNNYWtlclxuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IGxhYmVscyBsYWJlbHNcbiAgICAgKiBAcGFyYW0ge3tmb250U2l6ZTogbnVtYmVyLCBmb250RmFtaWx5OiBzdHJpbmcsIGNvbG9yOiBzdHJpbmd9fSB0aGVtZSBsYWJlbCB0aGVtZVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IG1heCB3aWR0aFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFJlbmRlcmVkTGFiZWxzTWF4V2lkdGg6IGZ1bmN0aW9uKGxhYmVscywgdGhlbWUpIHtcbiAgICAgICAgdmFyIGl0ZXJhdGVlID0gbmUudXRpbC5iaW5kKHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbFdpZHRoLCByZW5kZXJVdGlsKSxcbiAgICAgICAgICAgIG1heFdpZHRoID0gdGhpcy5fZ2V0UmVuZGVyZWRMYWJlbHNNYXhTaXplKGxhYmVscywgdGhlbWUsIGl0ZXJhdGVlKTtcbiAgICAgICAgcmV0dXJuIG1heFdpZHRoO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgcmVuZGVyZWQgbGFiZWxzIG1heCBoZWlnaHQuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpib3VuZHNNYWtlclxuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IGxhYmVscyBsYWJlbHNcbiAgICAgKiBAcGFyYW0ge3tmb250U2l6ZTogbnVtYmVyLCBmb250RmFtaWx5OiBzdHJpbmcsIGNvbG9yOiBzdHJpbmd9fSB0aGVtZSBsYWJlbCB0aGVtZVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IG1heCBoZWlnaHRcbiAgICAgKi9cbiAgICBfZ2V0UmVuZGVyZWRMYWJlbHNNYXhIZWlnaHQ6IGZ1bmN0aW9uKGxhYmVscywgdGhlbWUpIHtcbiAgICAgICAgdmFyIGl0ZXJhdGVlID0gbmUudXRpbC5iaW5kKHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodCwgcmVuZGVyVXRpbCksXG4gICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9nZXRSZW5kZXJlZExhYmVsc01heFNpemUobGFiZWxzLCB0aGVtZSwgaXRlcmF0ZWUpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgaGVpZ2h0IG9mIHggYXhpcyBhcmVhLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Ym91bmRzTWFrZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyB4IGF4aXMgb3B0aW9ucyxcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBsYWJlbHMgYXhpcyBsYWJlbHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgYXhpcyB0aGVtZVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IGhlaWdodFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFhBeGlzSGVpZ2h0OiBmdW5jdGlvbihvcHRpb25zLCBsYWJlbHMsIHRoZW1lKSB7XG4gICAgICAgIHZhciB0aXRsZSA9IG9wdGlvbnMgJiYgb3B0aW9ucy50aXRsZSxcbiAgICAgICAgICAgIHRpdGxlQXJlYUhlaWdodCA9IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodCh0aXRsZSwgdGhlbWUudGl0bGUpICsgVElUTEVfQUREX1BBRERJTkcsXG4gICAgICAgICAgICBoZWlnaHQgPSB0aGlzLl9nZXRSZW5kZXJlZExhYmVsc01heEhlaWdodChsYWJlbHMsIHRoZW1lLmxhYmVsKSArIHRpdGxlQXJlYUhlaWdodDtcbiAgICAgICAgcmV0dXJuIGhlaWdodDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHdpZHRoIGFib3V0IHkgYXhpcy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyB5IGF4aXMgb3B0aW9uc1xuICAgICAqIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGxhYmVscyBsYWJlbHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgeUF4aXMgdGhlbWVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggb3B0aW9ucyBpbmRleFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IHkgYXhpcyB3aWR0aFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFlBeGlzV2lkdGg6IGZ1bmN0aW9uKG9wdGlvbnMsIGxhYmVscywgdGhlbWUsIGluZGV4KSB7XG4gICAgICAgIHZhciB0aXRsZSA9ICcnLFxuICAgICAgICAgICAgdGl0bGVBcmVhV2lkdGgsIHdpZHRoO1xuXG4gICAgICAgIGlmIChvcHRpb25zKSB7XG4gICAgICAgICAgICBvcHRpb25zID0gW10uY29uY2F0KG9wdGlvbnMpO1xuICAgICAgICAgICAgdGl0bGUgPSBvcHRpb25zW2luZGV4IHx8IDBdLnRpdGxlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGl0bGVBcmVhV2lkdGggPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxIZWlnaHQodGl0bGUsIHRoZW1lLnRpdGxlKSArIFRJVExFX0FERF9QQURESU5HO1xuICAgICAgICB3aWR0aCA9IHRoaXMuX2dldFJlbmRlcmVkTGFiZWxzTWF4V2lkdGgobGFiZWxzLCB0aGVtZS5sYWJlbCkgKyB0aXRsZUFyZWFXaWR0aCArIEFYSVNfTEFCRUxfUEFERElORztcblxuICAgICAgICByZXR1cm4gd2lkdGg7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB3aWR0aCBhYm91dCB5IHJpZ2h0IGF4aXMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpib3VuZHNNYWtlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48c3RyaW5nPn0gcGFyYW1zLmNoYXJ0VHlwZXMgeSBheGlzIGNoYXJ0IHR5cGVzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIHkgYXhpcyB0aGVtZVxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5vcHRpb25zIHkgYXhpcyBvcHRpb25zXG4gICAgICogQHJldHVybnMge251bWJlcn0geSByaWdodCBheGlzIHdpZHRoXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0WVJBeGlzV2lkdGg6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgY2hhcnRUeXBlcyA9IHBhcmFtcy5jaGFydFR5cGVzIHx8IFtdLFxuICAgICAgICAgICAgbGVuID0gY2hhcnRUeXBlcy5sZW5ndGgsXG4gICAgICAgICAgICB3aWR0aCA9IDAsXG4gICAgICAgICAgICBpbmRleCwgY2hhcnRUeXBlLCB0aGVtZSwgbGFiZWw7XG4gICAgICAgIGlmIChsZW4gPiAwKSB7XG4gICAgICAgICAgICBpbmRleCA9IGxlbiAtIDE7XG4gICAgICAgICAgICBjaGFydFR5cGUgPSBjaGFydFR5cGVzW2luZGV4XTtcbiAgICAgICAgICAgIHRoZW1lID0gcGFyYW1zLnRoZW1lW2NoYXJ0VHlwZV0gfHwgcGFyYW1zLnRoZW1lO1xuICAgICAgICAgICAgbGFiZWwgPSB0aGlzLl9nZXRWYWx1ZUF4aXNNYXhMYWJlbChwYXJhbXMuY29udmVydERhdGEsIGNoYXJ0VHlwZSk7XG4gICAgICAgICAgICB3aWR0aCA9IHRoaXMuX2dldFlBeGlzV2lkdGgocGFyYW1zLm9wdGlvbnMsIFtsYWJlbF0sIHRoZW1lLCBpbmRleCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHdpZHRoO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGF4ZXMgZGltZW5zaW9uLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Ym91bmRzTWFrZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuY29udmVydERhdGEgY29udmVydGVkIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgY2hhcnQgdGhlbWVcbiAgICAgKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gcGFyYW1zLmlzVmVydGljYWwgd2hldGhlciB2ZXJ0aWNhbCBvciBub3RcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMub3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogQHJldHVybnMge3tcbiAgICAgKiAgICAgIHlBeGlzOiB7d2lkdGg6IG51bWJlcn0sXG4gICAgICogICAgICB5ckF4aXM6IHt3aWR0aDogbnVtYmVyfSxcbiAgICAgKiAgICAgIHhBeGlzOiB7aGVpZ2h0OiBudW1iZXJ9XG4gICAgICogfX0gYXhlcyBkaW1lbnNpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQXhlc0RpbWVuc2lvbjogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciB0aGVtZSwgb3B0aW9ucywgY29udmVydERhdGEsIG9wdGlvbkNoYXJ0VHlwZXMsIG1heFZhbHVlTGFiZWwsIHlMYWJlbHMsXG4gICAgICAgICAgICB4TGFiZWxzLCB5QXhpc1dpZHRoLCB4QXhpc0hlaWdodCwgeXJBeGlzV2lkdGgsIGNoYXJ0VHlwZTtcblxuICAgICAgICAvLyBwaWXssKjtirjsmYAg6rCZ7J20IGF4aXMg7JiB7Jet7J20IO2VhOyalCDsl4bripQg6rK97Jqw7JeQ64qUIOuqqOuRkCAw7Jy866GcIOuwmO2ZmFxuICAgICAgICBpZiAoIXBhcmFtcy5oYXNBeGVzKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHlBeGlzOiB7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAwXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB5ckF4aXM6IHtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDBcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHhBeGlzOiB7XG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogMFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICB0aGVtZSA9IHBhcmFtcy50aGVtZTtcbiAgICAgICAgb3B0aW9ucyA9IHBhcmFtcy5vcHRpb25zO1xuICAgICAgICBjb252ZXJ0RGF0YSA9IHBhcmFtcy5jb252ZXJ0RGF0YTtcbiAgICAgICAgb3B0aW9uQ2hhcnRUeXBlcyA9IHBhcmFtcy5vcHRpb25DaGFydFR5cGVzO1xuXG4gICAgICAgIGNoYXJ0VHlwZSA9IG9wdGlvbkNoYXJ0VHlwZXMgJiYgb3B0aW9uQ2hhcnRUeXBlc1swXSB8fCAnJztcblxuICAgICAgICAvLyB2YWx1ZSDspJEg6rCA7J6lIO2BsCDqsJLsnYQg7LaU7Lac7ZWY7JesIHZhbHVlIGxhYmVs66GcIOyngOyglSAobGFibGUg64SI67mEIOyytO2BrCDsi5wg7IKs7JqpKVxuICAgICAgICBtYXhWYWx1ZUxhYmVsID0gdGhpcy5fZ2V0VmFsdWVBeGlzTWF4TGFiZWwoY29udmVydERhdGEsIGNoYXJ0VHlwZSk7XG5cbiAgICAgICAgLy8g7IS466Gc7Ji17IWY7JeQIOuUsOudvOyEnCB47LaV6rO8IHnstpXsl5Ag7KCB7Jqp7ZWgIOugiOydtOu4lCDsoJXrs7Qg7KeA7KCVXG4gICAgICAgIHlMYWJlbHMgPSBwYXJhbXMuaXNWZXJ0aWNhbCA/IFttYXhWYWx1ZUxhYmVsXSA6IGNvbnZlcnREYXRhLmxhYmVscztcbiAgICAgICAgeExhYmVscyA9IHBhcmFtcy5pc1ZlcnRpY2FsID8gY29udmVydERhdGEubGFiZWxzIDogW21heFZhbHVlTGFiZWxdO1xuXG4gICAgICAgIHlBeGlzV2lkdGggPSB0aGlzLl9nZXRZQXhpc1dpZHRoKG9wdGlvbnMueUF4aXMsIHlMYWJlbHMsIHRoZW1lLnlBeGlzW2NoYXJ0VHlwZV0gfHwgdGhlbWUueUF4aXMpO1xuICAgICAgICB4QXhpc0hlaWdodCA9IHRoaXMuX2dldFhBeGlzSGVpZ2h0KG9wdGlvbnMueEF4aXMsIHhMYWJlbHMsIHRoZW1lLnhBeGlzKTtcbiAgICAgICAgeXJBeGlzV2lkdGggPSB0aGlzLl9nZXRZUkF4aXNXaWR0aCh7XG4gICAgICAgICAgICBjb252ZXJ0RGF0YTogY29udmVydERhdGEsXG4gICAgICAgICAgICBjaGFydFR5cGVzOiBvcHRpb25DaGFydFR5cGVzLFxuICAgICAgICAgICAgdGhlbWU6IHRoZW1lLnlBeGlzLFxuICAgICAgICAgICAgb3B0aW9uczogb3B0aW9ucy55QXhpc1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeUF4aXM6IHtcbiAgICAgICAgICAgICAgICB3aWR0aDogeUF4aXNXaWR0aFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHlyQXhpczoge1xuICAgICAgICAgICAgICAgIHdpZHRoOiB5ckF4aXNXaWR0aFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHhBeGlzOiB7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiB4QXhpc0hlaWdodFxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgd2lkdGggb2YgbGVnZW5kIGFyZWEuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpib3VuZHNNYWtlclxuICAgICAqIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGpvaW5MZWdlbmRMYWJlbHMgbGVnZW5kIGxhYmVsc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBsYWJlbFRoZW1lIGxhYmVsIHRoZW1lXG4gICAgICogQHJldHVybnMge251bWJlcn0gd2lkdGhcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRMZWdlbmRBcmVhV2lkdGg6IGZ1bmN0aW9uKGpvaW5MZWdlbmRMYWJlbHMsIGxhYmVsVGhlbWUsIGNoYXJ0VHlwZSwgc2VyaWVzT3B0aW9uKSB7XG4gICAgICAgIHZhciBsZWdlbmRXaWR0aCA9IDAsXG4gICAgICAgICAgICBsZWdlbmRMYWJlbHMsIG1heExhYmVsV2lkdGg7XG5cbiAgICAgICAgc2VyaWVzT3B0aW9uID0gc2VyaWVzT3B0aW9uIHx8IHt9O1xuXG4gICAgICAgIGlmIChjaGFydFR5cGUgIT09IGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9QSUUgfHwgIXNlcmllc09wdGlvbi5sZWdlbmRUeXBlKSB7XG4gICAgICAgICAgICBsZWdlbmRMYWJlbHMgPSBuZS51dGlsLm1hcChqb2luTGVnZW5kTGFiZWxzLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW0ubGFiZWw7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG1heExhYmVsV2lkdGggPSB0aGlzLl9nZXRSZW5kZXJlZExhYmVsc01heFdpZHRoKGxlZ2VuZExhYmVscywgbGFiZWxUaGVtZSk7XG4gICAgICAgICAgICBsZWdlbmRXaWR0aCA9IG1heExhYmVsV2lkdGggKyBMRUdFTkRfUkVDVF9XSURUSCArXG4gICAgICAgICAgICAgICAgTEVHRU5EX0xBQkVMX1BBRERJTkdfTEVGVCArIChMRUdFTkRfQVJFQV9QQURESU5HICogMik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbGVnZW5kV2lkdGg7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2Ugc2VyaWVzIGRpbWVuc2lvbi5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmJvdW5kc01ha2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IHBhcmFtcy5jaGFydERpbWVuc2lvbiBjaGFydCBkaW1lbnNpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7e1xuICAgICAqICAgICAgICAgIHlBeGlzOiB7d2lkdGg6IG51bWJlciwgaGVpZ2h0Om51bWJlcn0sXG4gICAgICogICAgICAgICAgeEF4aXM6IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6bnVtYmVyfSxcbiAgICAgKiAgICAgICAgICB5ckF4aXM6IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6bnVtYmVyfVxuICAgICAqICAgICAgfX0gcGFyYW1zLmF4ZXNEaW1lbnNpb24gYXhlcyBkaW1lbnNpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubGVnZW5kV2lkdGggbGVnZW5kIHdpZHRoXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnRpdGxlSGVpZ2h0IHRpdGxlIGhlaWdodFxuICAgICAqIEByZXR1cm5zIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBzZXJpZXMgZGltZW5zaW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVNlcmllc0RpbWVuc2lvbjogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBheGVzRGltZW5zaW9uID0gcGFyYW1zLmF4ZXNEaW1lbnNpb24sXG4gICAgICAgICAgICByaWdodEFyZWFXaWR0aCA9IHBhcmFtcy5sZWdlbmRXaWR0aCArIGF4ZXNEaW1lbnNpb24ueXJBeGlzLndpZHRoLFxuICAgICAgICAgICAgd2lkdGggPSBwYXJhbXMuY2hhcnREaW1lbnNpb24ud2lkdGggLSAoQ0hBUlRfUEFERElORyAqIDIpIC0gYXhlc0RpbWVuc2lvbi55QXhpcy53aWR0aCAtIHJpZ2h0QXJlYVdpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0ID0gcGFyYW1zLmNoYXJ0RGltZW5zaW9uLmhlaWdodCAtIChDSEFSVF9QQURESU5HICogMikgLSBwYXJhbXMudGl0bGVIZWlnaHQgLSBheGVzRGltZW5zaW9uLnhBeGlzLmhlaWdodDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogaGVpZ2h0XG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjb21wb25lbnRzIGRpbWVuc2lvblxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Ym91bmRzTWFrZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuY29udmVydERhdGEgY29udmVydGVkIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgY2hhcnQgdGhlbWVcbiAgICAgKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gcGFyYW1zLmlzVmVydGljYWwgd2hldGhlciB2ZXJ0aWNhbCBvciBub3RcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMub3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogQHJldHVybnMge09iamVjdH0gY29tcG9uZW50cyBkaW1lbnNpb25zXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0Q29tcG9uZW50c0RpbWVuc2lvbnM6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgdGhlbWUgPSBwYXJhbXMudGhlbWUsXG4gICAgICAgICAgICBvcHRpb25zID0gcGFyYW1zLm9wdGlvbnMsXG4gICAgICAgICAgICBjb252ZXJ0RGF0YSA9IHBhcmFtcy5jb252ZXJ0RGF0YSxcbiAgICAgICAgICAgIGNoYXJ0T3B0aW9ucyA9IG9wdGlvbnMuY2hhcnQgfHwge30sXG4gICAgICAgICAgICBjaGFydERpbWVuc2lvbiA9IHtcbiAgICAgICAgICAgICAgICB3aWR0aDogY2hhcnRPcHRpb25zLndpZHRoIHx8IDUwMCxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IGNoYXJ0T3B0aW9ucy5oZWlnaHQgfHwgNDAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYXhlc0RpbWVuc2lvbiwgdGl0bGVIZWlnaHQsIGxlZ2VuZFdpZHRoLCBzZXJpZXNEaW1lbnNpb24sIGRpbWVuc2lvbnM7XG5cbiAgICAgICAgLy8gYXhpcyDsmIHsl63sl5Ag7ZWE7JqU7ZWcIOyalOyGjOuTpOydmCDrhIjruYQg64aS7J2066W8IOyWu+yWtOyYtFxuICAgICAgICBheGVzRGltZW5zaW9uID0gdGhpcy5fbWFrZUF4ZXNEaW1lbnNpb24ocGFyYW1zKTtcbiAgICAgICAgdGl0bGVIZWlnaHQgPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxIZWlnaHQoY2hhcnRPcHRpb25zLnRpdGxlLCB0aGVtZS50aXRsZSkgKyBUSVRMRV9BRERfUEFERElORztcbiAgICAgICAgbGVnZW5kV2lkdGggPSB0aGlzLl9nZXRMZWdlbmRBcmVhV2lkdGgoY29udmVydERhdGEuam9pbkxlZ2VuZExhYmVscywgdGhlbWUubGVnZW5kLmxhYmVsLCBwYXJhbXMuY2hhcnRUeXBlLCBvcHRpb25zLnNlcmllcyk7XG5cbiAgICAgICAgLy8gc2VyaWVzIOuEiOu5hCwg64aS7J20IOqwkuydgCDssKjtirggYm91bmRz66W8IOq1rOyEse2VmOuKlCDqsIDsnqUg7KSR7JqU7ZWcIOyalOyGjOuLpFxuICAgICAgICBzZXJpZXNEaW1lbnNpb24gPSB0aGlzLl9tYWtlU2VyaWVzRGltZW5zaW9uKHtcbiAgICAgICAgICAgIGNoYXJ0RGltZW5zaW9uOiBjaGFydERpbWVuc2lvbixcbiAgICAgICAgICAgIGF4ZXNEaW1lbnNpb246IGF4ZXNEaW1lbnNpb24sXG4gICAgICAgICAgICBsZWdlbmRXaWR0aDogbGVnZW5kV2lkdGgsXG4gICAgICAgICAgICB0aXRsZUhlaWdodDogdGl0bGVIZWlnaHRcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZGltZW5zaW9ucyA9IG5lLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgIGNoYXJ0OiBjaGFydERpbWVuc2lvbixcbiAgICAgICAgICAgIHRpdGxlOiB7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiB0aXRsZUhlaWdodFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNlcmllczogc2VyaWVzRGltZW5zaW9uLFxuICAgICAgICAgICAgbGVnZW5kOiB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IGxlZ2VuZFdpZHRoXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIGF4ZXNEaW1lbnNpb24pO1xuICAgICAgICByZXR1cm4gZGltZW5zaW9ucztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBheGVzIGJvdW5kcy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmJvdW5kc01ha2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5oYXNBeGVzIHdoZXRoZXIgaGFzIGF4ZWQgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBwYXJhbXMub3B0aW9uQ2hhcnRUeXBlcyB5IGF4aXMgY2hhcnQgdHlwZXNcbiAgICAgKiAgICAgIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gcGFyYW1zLmRpbWVuc2lvbiBjaGFydCBkaW1lbnNpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMudG9wIHRvcCBwb3NpdGlvblxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5yaWdodCByaWdodCBwb3NpdGlvblxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IGF4ZXMgYm91bmRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUF4ZXNCb3VuZHM6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgYm91bmRzLCBkaW1lbnNpb25zLCBvcHRpb25DaGFydFR5cGVzLCB0b3AsIHJpZ2h0O1xuXG4gICAgICAgIC8vIHBpZeywqO2KuOyZgCDqsJnsnbQgYXhpcyDsmIHsl63snbQg7ZWE7JqUIOyXhuuKlCDqsr3smrDsl5DripQg67mIIOqwkuydhCDrsJjtmZgg7ZWoXG4gICAgICAgIGlmICghcGFyYW1zLmhhc0F4ZXMpIHtcbiAgICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRpbWVuc2lvbnMgPSBwYXJhbXMuZGltZW5zaW9ucztcbiAgICAgICAgb3B0aW9uQ2hhcnRUeXBlcyA9IHBhcmFtcy5vcHRpb25DaGFydFR5cGVzO1xuICAgICAgICB0b3AgPSBwYXJhbXMudG9wO1xuICAgICAgICByaWdodCA9IHBhcmFtcy5yaWdodDtcbiAgICAgICAgYm91bmRzID0ge1xuICAgICAgICAgICAgcGxvdDoge1xuICAgICAgICAgICAgICAgIGRpbWVuc2lvbjogZGltZW5zaW9ucy5zZXJpZXMsXG4gICAgICAgICAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgdG9wOiB0b3AsXG4gICAgICAgICAgICAgICAgICAgIHJpZ2h0OiByaWdodFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB5QXhpczoge1xuICAgICAgICAgICAgICAgIGRpbWVuc2lvbjoge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogZGltZW5zaW9ucy55QXhpcy53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBkaW1lbnNpb25zLnNlcmllcy5oZWlnaHRcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgIHRvcDogdG9wLFxuICAgICAgICAgICAgICAgICAgICBsZWZ0OiBDSEFSVF9QQURESU5HICsgSElEREVOX1dJRFRIXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHhBeGlzOiB7XG4gICAgICAgICAgICAgICAgZGltZW5zaW9uOiB7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiBkaW1lbnNpb25zLnNlcmllcy53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBkaW1lbnNpb25zLnhBeGlzLmhlaWdodFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgdG9wOiB0b3AgKyBkaW1lbnNpb25zLnNlcmllcy5oZWlnaHQgLSBISURERU5fV0lEVEgsXG4gICAgICAgICAgICAgICAgICAgIHJpZ2h0OiByaWdodFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvLyDsmrDsuKEgeSBheGlzIOyYgeyXrSBib3VuZHMg7KCV67O0IOy2lOqwgFxuICAgICAgICBpZiAob3B0aW9uQ2hhcnRUeXBlcyAmJiBvcHRpb25DaGFydFR5cGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgYm91bmRzLnlyQXhpcyA9IHtcbiAgICAgICAgICAgICAgICBkaW1lbnNpb246IHtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGRpbWVuc2lvbnMueXJBeGlzLndpZHRoLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IGRpbWVuc2lvbnMuc2VyaWVzLmhlaWdodFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgdG9wOiB0b3AsXG4gICAgICAgICAgICAgICAgICAgIHJpZ2h0OiBkaW1lbnNpb25zLmxlZ2VuZC53aWR0aCArIENIQVJUX1BBRERJTkcgKyBISURERU5fV0lEVEhcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGJvdW5kcztcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGJvdW5kc01ha2VyO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IGNhbGN1bGF0b3IuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBBWElTX1NUQU5EQVJEX01VTFRJUExFX05VTVMgPSBbMSwgMiwgNSwgMTBdO1xuXG4vKipcbiAqIENhbGN1bGF0b3IuXG4gKiBAbW9kdWxlIGNhbGN1bGF0b3JcbiAqL1xudmFyIGNhbGN1bGF0b3IgPSB7XG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlIHNjYWxlIGZyb20gY2hhcnQgbWluLCBtYXggZGF0YS5cbiAgICAgKiAgLSBodHRwOi8vcGVsdGllcnRlY2guY29tL2hvdy1leGNlbC1jYWxjdWxhdGVzLWF1dG9tYXRpYy1jaGFydC1heGlzLWxpbWl0cy9cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmNhbGN1bGF0b3JcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWluIG1pbiBtaW5pbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtYXggbWF4IG1heGltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHRpY2tDb3VudCB0aWNrIGNvdW50XG4gICAgICogQHJldHVybnMge3ttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fSBzY2FsZSBheGlzIHNjYWxlXG4gICAgICovXG4gICAgY2FsY3VsYXRlU2NhbGU6IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XG4gICAgICAgIHZhciBzYXZlTWluID0gMCxcbiAgICAgICAgICAgIHNjYWxlID0ge30sXG4gICAgICAgICAgICBpb2RWYWx1ZTsgLy8gaW5jcmVhc2Ugb3IgZGVjcmVhc2UgdmFsdWU7XG5cbiAgICAgICAgaWYgKG1pbiA8IDApIHtcbiAgICAgICAgICAgIHNhdmVNaW4gPSBtaW47XG4gICAgICAgICAgICBtYXggLT0gbWluO1xuICAgICAgICAgICAgbWluID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlvZFZhbHVlID0gKG1heCAtIG1pbikgLyAyMDtcbiAgICAgICAgc2NhbGUubWF4ID0gbWF4ICsgaW9kVmFsdWUgKyBzYXZlTWluO1xuXG4gICAgICAgIGlmIChtYXggLyA2ID4gbWluKSB7XG4gICAgICAgICAgICBzY2FsZS5taW4gPSAwICsgc2F2ZU1pbjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNjYWxlLm1pbiA9IG1pbiAtIGlvZFZhbHVlICsgc2F2ZU1pbjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2NhbGU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG5vcm1hbGl6ZSBudW1iZXIuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpjYWxjdWxhdG9yXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIHRhcmdldCB2YWx1ZVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IG5vcm1hbGl6ZWQgbnVtYmVyXG4gICAgICovXG4gICAgbm9ybWFsaXplQXhpc051bWJlcjogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgdmFyIHN0YW5kYXJkID0gMCxcbiAgICAgICAgICAgIGZsYWcgPSAxLFxuICAgICAgICAgICAgbm9ybWFsaXplZCwgbW9kO1xuXG4gICAgICAgIGlmICh2YWx1ZSA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9IGVsc2UgaWYgKHZhbHVlIDwgMCkge1xuICAgICAgICAgICAgZmxhZyA9IC0xO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFsdWUgKj0gZmxhZztcblxuICAgICAgICBuZS51dGlsLmZvckVhY2hBcnJheShBWElTX1NUQU5EQVJEX01VTFRJUExFX05VTVMsIGZ1bmN0aW9uKG51bSkge1xuICAgICAgICAgICAgaWYgKHZhbHVlIDwgbnVtKSB7XG4gICAgICAgICAgICAgICAgaWYgKG51bSA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhbmRhcmQgPSBudW07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobnVtID09PSAxMCkge1xuICAgICAgICAgICAgICAgIHN0YW5kYXJkID0gMTA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChzdGFuZGFyZCA8IDEpIHtcbiAgICAgICAgICAgIG5vcm1hbGl6ZWQgPSB0aGlzLm5vcm1hbGl6ZUF4aXNOdW1iZXIodmFsdWUgKiAxMCkgKiAwLjE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtb2QgPSBuZS51dGlsLm1vZCh2YWx1ZSwgc3RhbmRhcmQpO1xuICAgICAgICAgICAgbm9ybWFsaXplZCA9IG5lLnV0aWwuYWRkaXRpb24odmFsdWUsIChtb2QgPiAwID8gc3RhbmRhcmQgLSBtb2QgOiAwKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbm9ybWFsaXplZCAqPSBmbGFnO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHRpY2sgcG9zaXRpb25zIG9mIHBpeGVsIHR5cGUuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpjYWxjdWxhdG9yXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHNpemUgYXJlYSB3aWR0aCBvciBoZWlnaHRcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gY291bnQgdGljayBjb3VudFxuICAgICAqIEByZXR1cm5zIHthcnJheS48bnVtYmVyPn0gcG9zaXRpb25zXG4gICAgICovXG4gICAgbWFrZVRpY2tQaXhlbFBvc2l0aW9uczogZnVuY3Rpb24oc2l6ZSwgY291bnQpIHtcbiAgICAgICAgdmFyIHBvc2l0aW9ucyA9IFtdLFxuICAgICAgICAgICAgcHhTY2FsZSwgcHhTdGVwO1xuXG4gICAgICAgIGlmIChjb3VudCA+IDApIHtcbiAgICAgICAgICAgIHB4U2NhbGUgPSB7bWluOiAwLCBtYXg6IHNpemUgLSAxfTtcbiAgICAgICAgICAgIHB4U3RlcCA9IHRoaXMuZ2V0U2NhbGVTdGVwKHB4U2NhbGUsIGNvdW50KTtcbiAgICAgICAgICAgIHBvc2l0aW9ucyA9IG5lLnV0aWwubWFwKG5lLnV0aWwucmFuZ2UoMCwgc2l6ZSwgcHhTdGVwKSwgZnVuY3Rpb24ocG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWF0aC5yb3VuZChwb3NpdGlvbik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHBvc2l0aW9uc1twb3NpdGlvbnMubGVuZ3RoIC0gMV0gPSBzaXplIC0gMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcG9zaXRpb25zO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGxhYmVscyBmcm9tIHNjYWxlLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Y2FsY3VsYXRvclxuICAgICAqIEBwYXJhbSB7e21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19IHNjYWxlIGF4aXMgc2NhbGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3RlcCBzdGVwIGJldHdlZW4gbWF4IGFuZCBtaW5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nW119IGxhYmVsc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgbWFrZUxhYmVsc0Zyb21TY2FsZTogZnVuY3Rpb24oc2NhbGUsIHN0ZXApIHtcbiAgICAgICAgdmFyIG11bHRpcGxlTnVtID0gbmUudXRpbC5maW5kTXVsdGlwbGVOdW0oc3RlcCksXG4gICAgICAgICAgICBtaW4gPSBzY2FsZS5taW4gKiBtdWx0aXBsZU51bSxcbiAgICAgICAgICAgIG1heCA9IHNjYWxlLm1heCAqIG11bHRpcGxlTnVtLFxuICAgICAgICAgICAgbGFiZWxzID0gbmUudXRpbC5yYW5nZShtaW4sIG1heCArIDEsIHN0ZXAgKiBtdWx0aXBsZU51bSk7XG4gICAgICAgIGxhYmVscyA9IG5lLnV0aWwubWFwKGxhYmVscywgZnVuY3Rpb24obGFiZWwpIHtcbiAgICAgICAgICAgIHJldHVybiBsYWJlbCAvIG11bHRpcGxlTnVtO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGxhYmVscztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHNjYWxlIHN0ZXAuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpjYWxjdWxhdG9yXG4gICAgICogQHBhcmFtIHt7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX0gc2NhbGUgYXhpcyBzY2FsZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjb3VudCB2YWx1ZSBjb3VudFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IHNjYWxlIHN0ZXBcbiAgICAgKi9cbiAgICBnZXRTY2FsZVN0ZXA6IGZ1bmN0aW9uKHNjYWxlLCBjb3VudCkge1xuICAgICAgICByZXR1cm4gKHNjYWxlLm1heCAtIHNjYWxlLm1pbikgLyAoY291bnQgLSAxKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXJyYXkgcGl2b3QuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpjYWxjdWxhdG9yXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXk+fSBhcnIyZCB0YXJnZXQgMmQgYXJyYXlcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5Pn0gcGl2b3RlZCAyZCBhcnJheVxuICAgICAqL1xuICAgIGFycmF5UGl2b3Q6IGZ1bmN0aW9uKGFycjJkKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkoYXJyMmQsIGZ1bmN0aW9uKGFycikge1xuICAgICAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkoYXJyLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXJlc3VsdFtpbmRleF0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2luZGV4XSA9IFtdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXN1bHRbaW5kZXhdLnB1c2godmFsdWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gY2FsY3VsYXRvcjtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBEYXRhIGNvbnZlcnRlci5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGNhbGN1bGF0b3IgPSByZXF1aXJlKCcuL2NhbGN1bGF0b3IuanMnKTtcblxudmFyIGNvbmNhdCA9IEFycmF5LnByb3RvdHlwZS5jb25jYXQ7XG5cbi8qKlxuICogRGF0YSBjb252ZXJ0ZXIuXG4gKiBAbW9kdWxlIGRhdGFDb252ZXJ0ZXJcbiAqL1xudmFyIGRhdGFDb252ZXJ0ZXIgPSB7XG4gICAgLyoqXG4gICAgICogQ29udmVydCB1c2VyIGRhdGEuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXk+fSB1c2VyRGF0YSB1c2VyIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY2hhcnRPcHRpb25zIGNoYXJ0IG9wdGlvblxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjaGFydFR5cGUgY2hhcnQgdHlwZVxuICAgICAqIEByZXR1cm5zIHt7XG4gICAgICogICAgICBsYWJlbHM6IGFycmF5LjxzdHJpbmc+LFxuICAgICAqICAgICAgdmFsdWVzOiBhcnJheS48bnVtYmVyPixcbiAgICAgKiAgICAgIGxlZ2VuZExhYmVsczogYXJyYXkuPHN0cmluZz4sXG4gICAgICogICAgICBmb3JtYXRGdW5jdGlvbnM6IGFycmF5LjxmdW5jdGlvbj4sXG4gICAgICogICAgICBmb3JtYXR0ZWRWYWx1ZXM6IGFycmF5LjxzdHJpbmc+XG4gICAgICogfX0gY29udmVydGVkIGRhdGFcbiAgICAgKi9cbiAgICBjb252ZXJ0OiBmdW5jdGlvbih1c2VyRGF0YSwgY2hhcnRPcHRpb25zLCBjaGFydFR5cGUpIHtcbiAgICAgICAgdmFyIGxhYmVscyA9IHVzZXJEYXRhLmNhdGVnb3JpZXMsXG4gICAgICAgICAgICBzZXJpZXNEYXRhID0gdXNlckRhdGEuc2VyaWVzLFxuICAgICAgICAgICAgdmFsdWVzID0gdGhpcy5fcGlja1ZhbHVlcyhzZXJpZXNEYXRhKSxcbiAgICAgICAgICAgIGpvaW5WYWx1ZXMgPSB0aGlzLl9qb2luVmFsdWVzKHZhbHVlcyksXG4gICAgICAgICAgICBsZWdlbmRMYWJlbHMgPSB0aGlzLl9waWNrTGVnZW5kTGFiZWxzKHNlcmllc0RhdGEpLFxuICAgICAgICAgICAgam9pbkxlZ2VuZExhYmVscyA9IHRoaXMuX2pvaW5MZWdlbmRMYWJlbHMobGVnZW5kTGFiZWxzLCBjaGFydFR5cGUpLFxuICAgICAgICAgICAgZm9ybWF0ID0gY2hhcnRPcHRpb25zICYmIGNoYXJ0T3B0aW9ucy5mb3JtYXQgfHwgJycsXG4gICAgICAgICAgICBmb3JtYXRGdW5jdGlvbnMgPSB0aGlzLl9maW5kRm9ybWF0RnVuY3Rpb25zKGZvcm1hdCksXG4gICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXMgPSBmb3JtYXQgPyB0aGlzLl9mb3JtYXRWYWx1ZXModmFsdWVzLCBmb3JtYXRGdW5jdGlvbnMpIDogdmFsdWVzO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbGFiZWxzOiBsYWJlbHMsXG4gICAgICAgICAgICB2YWx1ZXM6IHZhbHVlcyxcbiAgICAgICAgICAgIGpvaW5WYWx1ZXM6IGpvaW5WYWx1ZXMsXG4gICAgICAgICAgICBsZWdlbmRMYWJlbHM6IGxlZ2VuZExhYmVscyxcbiAgICAgICAgICAgIGpvaW5MZWdlbmRMYWJlbHM6IGpvaW5MZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICBmb3JtYXRGdW5jdGlvbnM6IGZvcm1hdEZ1bmN0aW9ucyxcbiAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlczogZm9ybWF0dGVkVmFsdWVzXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNlcGFyYXRlIGxhYmVsLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5LjxhcnJheT4+fSB1c2VyRGF0YSB1c2VyIGRhdGFcbiAgICAgKiBAcmV0dXJucyB7e2xhYmVsczogKGFycmF5LjxzdHJpbmc+KSwgc291cmNlRGF0YTogYXJyYXkuPGFycmF5LjxhcnJheT4+fX0gcmVzdWx0IGRhdGFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXBhcmF0ZUxhYmVsOiBmdW5jdGlvbih1c2VyRGF0YSkge1xuICAgICAgICB2YXIgbGFiZWxzID0gdXNlckRhdGFbMF0ucG9wKCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsYWJlbHM6IGxhYmVscyxcbiAgICAgICAgICAgIHNvdXJjZURhdGE6IHVzZXJEYXRhXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFBpY2sgdmFsdWUuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHthcnJheX0gaXRlbXMgaXRlbXNcbiAgICAgKiBAcmV0dXJucyB7YXJyYXl9IHBpY2tlZCB2YWx1ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3BpY2tWYWx1ZTogZnVuY3Rpb24oaXRlbXMpIHtcbiAgICAgICAgcmV0dXJuIFtdLmNvbmNhdChpdGVtcy5kYXRhKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUGljayB2YWx1ZXMgZnJvbSBheGlzIGRhdGEuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXk+fSBzZXJpZXNEYXRhIHNlcmllcyBkYXRhXG4gICAgICogQHJldHVybnMge3N0cmluZ1tdfSB2YWx1ZXNcbiAgICAgKi9cbiAgICBfcGlja1ZhbHVlczogZnVuY3Rpb24oc2VyaWVzRGF0YSkge1xuICAgICAgICB2YXIgdmFsdWVzLCByZXN1bHQ7XG4gICAgICAgIGlmIChuZS51dGlsLmlzQXJyYXkoc2VyaWVzRGF0YSkpIHtcbiAgICAgICAgICAgIHZhbHVlcyA9IG5lLnV0aWwubWFwKHNlcmllc0RhdGEsIHRoaXMuX3BpY2tWYWx1ZSwgdGhpcyk7XG4gICAgICAgICAgICByZXN1bHQgPSBjYWxjdWxhdG9yLmFycmF5UGl2b3QodmFsdWVzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHt9O1xuICAgICAgICAgICAgbmUudXRpbC5mb3JFYWNoKHNlcmllc0RhdGEsIGZ1bmN0aW9uKGdyb3VwVmFsdWVzLCB0eXBlKSB7XG4gICAgICAgICAgICAgICAgdmFsdWVzID0gbmUudXRpbC5tYXAoZ3JvdXBWYWx1ZXMsIHRoaXMuX3BpY2tWYWx1ZSwgdGhpcyk7XG4gICAgICAgICAgICAgICAgcmVzdWx0W3R5cGVdID0gY2FsY3VsYXRvci5hcnJheVBpdm90KHZhbHVlcyk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBKb2luIHZhbHVlcy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheT59IHZhbHVlcyB2YWx1ZXNcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPG51bWJlcj59IGpvaW4gdmFsdWVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfam9pblZhbHVlczogZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgIHZhciBqb2luVmFsdWVzO1xuXG4gICAgICAgIGlmIChuZS51dGlsLmlzQXJyYXkodmFsdWVzKSkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlcztcbiAgICAgICAgfVxuXG4gICAgICAgIGpvaW5WYWx1ZXMgPSBuZS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uKGdyb3VwVmFsdWVzKSB7XG4gICAgICAgICAgICByZXR1cm4gZ3JvdXBWYWx1ZXM7XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIHJldHVybiBjb25jYXQuYXBwbHkoW10sIGpvaW5WYWx1ZXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBQaWNrIGxlZ2VuZCBsYWJlbC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gaXRlbSBpdGVtXG4gICAgICogQHJldHVybnMge3N0cmluZ30gbGFiZWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9waWNrTGVnZW5kTGFiZWw6IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuIGl0ZW0ubmFtZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUGljayBsZWdlbmQgbGFiZWxzIGZyb20gYXhpcyBkYXRhLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gc2VyaWVzRGF0YSBzZXJpZXMgZGF0YVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmdbXX0gbGFiZWxzXG4gICAgICovXG4gICAgX3BpY2tMZWdlbmRMYWJlbHM6IGZ1bmN0aW9uKHNlcmllc0RhdGEpIHtcbiAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgaWYgKG5lLnV0aWwuaXNBcnJheShzZXJpZXNEYXRhKSkge1xuICAgICAgICAgICAgcmVzdWx0ID0gbmUudXRpbC5tYXAoc2VyaWVzRGF0YSwgdGhpcy5fcGlja0xlZ2VuZExhYmVsLCB0aGlzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHt9O1xuICAgICAgICAgICAgbmUudXRpbC5mb3JFYWNoKHNlcmllc0RhdGEsIGZ1bmN0aW9uKGdyb3VwVmFsdWVzLCB0eXBlKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W3R5cGVdID0gbmUudXRpbC5tYXAoZ3JvdXBWYWx1ZXMsIHRoaXMuX3BpY2tMZWdlbmRMYWJlbCwgdGhpcyk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBKb2luIGxlZ2VuZCBsYWJlbHMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHthcnJheX0gbGVnZW5kTGFiZWxzIGxlZ2VuZCBsYWJlbHNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY2hhcnRUeXBlIGNoYXJ0IHR5cGVcbiAgICAgKiBAcmV0dXJucyB7YXJyYXl9IGxhYmVsc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2pvaW5MZWdlbmRMYWJlbHM6IGZ1bmN0aW9uKGxlZ2VuZExhYmVscywgY2hhcnRUeXBlKSB7XG4gICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgIGlmIChuZS51dGlsLmlzQXJyYXkobGVnZW5kTGFiZWxzKSkge1xuICAgICAgICAgICAgcmVzdWx0ID0gbmUudXRpbC5tYXAobGVnZW5kTGFiZWxzLCBmdW5jdGlvbihsYWJlbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0VHlwZTogY2hhcnRUeXBlLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogbGFiZWxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQgPSBuZS51dGlsLm1hcChsZWdlbmRMYWJlbHMsIGZ1bmN0aW9uKGxhYmVscywgX2NoYXJ0VHlwZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZS51dGlsLm1hcChsYWJlbHMsIGZ1bmN0aW9uKGxhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGFydFR5cGU6IF9jaGFydFR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogbGFiZWxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgICAgcmVzdWx0ID0gY29uY2F0LmFwcGx5KFtdLCByZXN1bHQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIGZvcm1hdCBncm91cCB2YWx1ZXMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXk+fSBncm91cFZhbHVlcyBncm91cCB2YWx1ZXNcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uW119IGZvcm1hdEZ1bmN0aW9ucyBmb3JtYXQgZnVuY3Rpb25zXG4gICAgICogQHJldHVybnMge3N0cmluZ1tdfSBmb3JtYXR0ZWQgdmFsdWVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZm9ybWF0R3JvdXBWYWx1ZXM6IGZ1bmN0aW9uKGdyb3VwVmFsdWVzLCBmb3JtYXRGdW5jdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIG5lLnV0aWwubWFwKGdyb3VwVmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgICAgIHJldHVybiBuZS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGZucyA9IFt2YWx1ZV0uY29uY2F0KGZvcm1hdEZ1bmN0aW9ucyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwucmVkdWNlKGZucywgZnVuY3Rpb24oc3RvcmVkLCBmbikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZm4oc3RvcmVkKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gZm9ybWF0IGNvbnZlcnRlZCB2YWx1ZXMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXk+fSBjaGFydFZhbHVlcyBjaGFydCB2YWx1ZXNcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uW119IGZvcm1hdEZ1bmN0aW9ucyBmb3JtYXQgZnVuY3Rpb25zXG4gICAgICogQHJldHVybnMge3N0cmluZ1tdfSBmb3JtYXR0ZWQgdmFsdWVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZm9ybWF0VmFsdWVzOiBmdW5jdGlvbihjaGFydFZhbHVlcywgZm9ybWF0RnVuY3Rpb25zKSB7XG4gICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgIGlmIChuZS51dGlsLmlzQXJyYXkoY2hhcnRWYWx1ZXMpKSB7XG4gICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9mb3JtYXRHcm91cFZhbHVlcyhjaGFydFZhbHVlcywgZm9ybWF0RnVuY3Rpb25zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHt9O1xuICAgICAgICAgICAgbmUudXRpbC5mb3JFYWNoKGNoYXJ0VmFsdWVzLCBmdW5jdGlvbihncm91cFZhbHVlcywgY2hhcnRUeXBlKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W2NoYXJ0VHlwZV0gPSB0aGlzLl9mb3JtYXRHcm91cFZhbHVlcyhncm91cFZhbHVlcywgZm9ybWF0RnVuY3Rpb25zKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFBpY2sgbWF4IGxlbmd0aCB1bmRlciBwb2ludC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ1tdfSB2YWx1ZXMgY2hhcnQgdmFsdWVzXG4gICAgICogQHJldHVybnMge251bWJlcn0gbWF4IGxlbmd0aCB1bmRlciBwb2ludFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3BpY2tNYXhMZW5VbmRlclBvaW50OiBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgdmFyIG1heCA9IDA7XG5cbiAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkodmFsdWVzLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIGxlbiA9IG5lLnV0aWwubGVuZ3RoQWZ0ZXJQb2ludCh2YWx1ZSk7XG4gICAgICAgICAgICBpZiAobGVuID4gbWF4KSB7XG4gICAgICAgICAgICAgICAgbWF4ID0gbGVuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICByZXR1cm4gbWF4O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIHplcm8gZmlsbCBmb3JtYXQgb3Igbm90LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmb3JtYXQgZm9ybWF0XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHJlc3VsdCBib29sZWFuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNaZXJvRmlsbDogZnVuY3Rpb24oZm9ybWF0KSB7XG4gICAgICAgIHJldHVybiBmb3JtYXQubGVuZ3RoID4gMiAmJiBmb3JtYXQuY2hhckF0KDApID09PSAnMCc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgZGVjaW1hbCBmb3JtYXQgb3Igbm90LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmb3JtYXQgZm9ybWF0XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHJlc3VsdCBib29sZWFuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNEZWNpbWFsOiBmdW5jdGlvbihmb3JtYXQpIHtcbiAgICAgICAgdmFyIGluZGV4T2YgPSBmb3JtYXQuaW5kZXhPZignLicpO1xuICAgICAgICByZXR1cm4gaW5kZXhPZiA+IC0xICYmIGluZGV4T2YgPCBmb3JtYXQubGVuZ3RoIC0gMTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciBjb21tYSBmb3JtYXQgb3Igbm90LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmb3JtYXQgZm9ybWF0XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHJlc3VsdCBib29sZWFuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNDb21tYTogZnVuY3Rpb24oZm9ybWF0KSB7XG4gICAgICAgIHJldHVybiBmb3JtYXQuaW5kZXhPZignLCcpID09PSBmb3JtYXQuc3BsaXQoJy4nKVswXS5sZW5ndGggLSA0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGb3JtYXQgemVybyBmaWxsLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBsZW4gbGVuZ3RoIG9mIHJlc3VsdFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSB0YXJnZXQgdmFsdWVcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBmb3JtYXR0ZWQgdmFsdWVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9mb3JtYXRaZXJvRmlsbDogZnVuY3Rpb24obGVuLCB2YWx1ZSkge1xuICAgICAgICB2YXIgemVybyA9ICcwJyxcbiAgICAgICAgICAgIGlzTWludXMgPSB2YWx1ZSA8IDA7XG5cbiAgICAgICAgdmFsdWUgPSBNYXRoLmFicyh2YWx1ZSkgKyAnJztcblxuICAgICAgICBpZiAodmFsdWUubGVuZ3RoID49IGxlbikge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgd2hpbGUgKHZhbHVlLmxlbmd0aCA8IGxlbikge1xuICAgICAgICAgICAgdmFsdWUgPSB6ZXJvICsgdmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKGlzTWludXMgPyAnLScgOiAnJykgKyB2YWx1ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRm9ybWF0IERlY2ltYWwuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGxlbiBsZW5ndGggb2YgdW5kZXIgZGVjaW1hbCBwb2ludFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSB0YXJnZXQgdmFsdWVcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBmb3JtYXR0ZWQgdmFsdWVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9mb3JtYXREZWNpbWFsOiBmdW5jdGlvbihsZW4sIHZhbHVlKSB7XG4gICAgICAgIHZhciBwb3c7XG5cbiAgICAgICAgaWYgKGxlbiA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIE1hdGgucm91bmQodmFsdWUsIDEwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHBvdyA9IE1hdGgucG93KDEwLCBsZW4pO1xuICAgICAgICB2YWx1ZSA9IE1hdGgucm91bmQodmFsdWUgKiBwb3cpIC8gcG93O1xuICAgICAgICB2YWx1ZSA9IHBhcnNlRmxvYXQodmFsdWUpLnRvRml4ZWQobGVuKTtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGb3JtYXQgQ29tbWEuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlIHRhcmdldCB2YWx1ZVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGZvcm1hdHRlZCB2YWx1ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2Zvcm1hdENvbW1hOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICB2YXIgY29tbWEgPSAnLCcsXG4gICAgICAgICAgICB1bmRlclBvaW50VmFsdWUgPSAnJyxcbiAgICAgICAgICAgIHZhbHVlcztcblxuICAgICAgICB2YWx1ZSArPSAnJztcblxuICAgICAgICBpZiAodmFsdWUuaW5kZXhPZignLicpID4gLTEpIHtcbiAgICAgICAgICAgIHZhbHVlcyA9IHZhbHVlLnNwbGl0KCcuJyk7XG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlc1swXTtcbiAgICAgICAgICAgIHVuZGVyUG9pbnRWYWx1ZSA9ICcuJyArIHZhbHVlc1sxXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh2YWx1ZS5sZW5ndGggPCA0KSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUgKyB1bmRlclBvaW50VmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICB2YWx1ZXMgPSAodmFsdWUpLnNwbGl0KCcnKS5yZXZlcnNlKCk7XG4gICAgICAgIHZhbHVlcyA9IG5lLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24oY2hhciwgaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBbY2hhcl07XG4gICAgICAgICAgICBpZiAoKGluZGV4ICsgMSkgJSAzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goY29tbWEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGNvbmNhdC5hcHBseShbXSwgdmFsdWVzKS5yZXZlcnNlKCkuam9pbignJykgKyB1bmRlclBvaW50VmFsdWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZpbmQgZm9ybWF0IGZ1bmN0aW9ucy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZm9ybWF0IGZvcm1hdFxuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IHZhbHVlcyBjaGFydCB2YWx1ZXNcbiAgICAgKiBAcmV0dXJucyB7ZnVuY3Rpb25bXX0gZnVuY3Rpb25zXG4gICAgICovXG4gICAgX2ZpbmRGb3JtYXRGdW5jdGlvbnM6IGZ1bmN0aW9uKGZvcm1hdCkge1xuICAgICAgICB2YXIgZnVuY3MgPSBbXSxcbiAgICAgICAgICAgIGxlbjtcblxuICAgICAgICBpZiAoIWZvcm1hdCkge1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2lzRGVjaW1hbChmb3JtYXQpKSB7XG4gICAgICAgICAgICBsZW4gPSB0aGlzLl9waWNrTWF4TGVuVW5kZXJQb2ludChbZm9ybWF0XSk7XG4gICAgICAgICAgICBmdW5jcyA9IFtuZS51dGlsLmJpbmQodGhpcy5fZm9ybWF0RGVjaW1hbCwgdGhpcywgbGVuKV07XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5faXNaZXJvRmlsbChmb3JtYXQpKSB7XG4gICAgICAgICAgICBsZW4gPSBmb3JtYXQubGVuZ3RoO1xuICAgICAgICAgICAgZnVuY3MgPSBbbmUudXRpbC5iaW5kKHRoaXMuX2Zvcm1hdFplcm9GaWxsLCB0aGlzLCBsZW4pXTtcbiAgICAgICAgICAgIHJldHVybiBmdW5jcztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9pc0NvbW1hKGZvcm1hdCkpIHtcbiAgICAgICAgICAgIGZ1bmNzLnB1c2godGhpcy5fZm9ybWF0Q29tbWEpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZ1bmNzO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZGF0YUNvbnZlcnRlcjtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBET00gSGFuZGxlci5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBET00gSGFuZGxlci5cbiAqIEBtb2R1bGUgZG9tSGFuZGxlclxuICovXG52YXIgZG9tSGFuZGxlciA9IHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgZWxlbWVudC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRvbUhhbmRsZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGFnIGh0bWwgdGFnXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5ld0NsYXNzIGNsYXNzIG5hbWVcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IGNyZWF0ZWQgZWxlbWVudFxuICAgICAqL1xuICAgIGNyZWF0ZTogZnVuY3Rpb24odGFnLCBuZXdDbGFzcykge1xuICAgICAgICB2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZyk7XG5cbiAgICAgICAgaWYgKG5ld0NsYXNzKSB7XG4gICAgICAgICAgICB0aGlzLmFkZENsYXNzKGVsLCBuZXdDbGFzcyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjbGFzcyBuYW1lcy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRvbUhhbmRsZXJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqIEByZXR1cm5zIHthcnJheX0gbmFtZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRDbGFzc05hbWVzOiBmdW5jdGlvbihlbCkge1xuICAgICAgICB2YXIgY2xhc3NOYW1lID0gZWwuY2xhc3NOYW1lIHx8ICcnLFxuICAgICAgICAgICAgY2xhc3NOYW1lcyA9IGNsYXNzTmFtZSA/IGNsYXNzTmFtZS5zcGxpdCgnICcpIDogW107XG4gICAgICAgIHJldHVybiBjbGFzc05hbWVzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgY3NzIGNsYXNzIHRvIHRhcmdldCBlbGVtZW50LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZG9tSGFuZGxlclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5ld0NsYXNzIGFkZCBjbGFzcyBuYW1lXG4gICAgICovXG4gICAgYWRkQ2xhc3M6IGZ1bmN0aW9uKGVsLCBuZXdDbGFzcykge1xuICAgICAgICB2YXIgY2xhc3NOYW1lcyA9IHRoaXMuX2dldENsYXNzTmFtZXMoZWwpLFxuICAgICAgICAgICAgaW5kZXggPSBuZS51dGlsLmluQXJyYXkobmV3Q2xhc3MsIGNsYXNzTmFtZXMpO1xuXG4gICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjbGFzc05hbWVzLnB1c2gobmV3Q2xhc3MpO1xuICAgICAgICBlbC5jbGFzc05hbWUgPSBjbGFzc05hbWVzLmpvaW4oJyAnKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIGNzcyBjbGFzcyBmcm9tIHRhcmdldCBlbGVtZW50LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZG9tSGFuZGxlclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHJtQ2xhc3MgcmVtb3ZlIGNsYXNzIG5hbWVcbiAgICAgKi9cbiAgICByZW1vdmVDbGFzczogZnVuY3Rpb24oZWwsIHJtQ2xhc3MpIHtcbiAgICAgICAgdmFyIGNsYXNzTmFtZXMgPSB0aGlzLl9nZXRDbGFzc05hbWVzKGVsKSxcbiAgICAgICAgICAgIGluZGV4ID0gbmUudXRpbC5pbkFycmF5KHJtQ2xhc3MsIGNsYXNzTmFtZXMpO1xuXG4gICAgICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNsYXNzTmFtZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgZWwuY2xhc3NOYW1lID0gY2xhc3NOYW1lcy5qb2luKCcgJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgY2xhc3MgZXhpc3Qgb3Igbm90LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZG9tSGFuZGxlclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZpbmRDbGFzcyB0YXJnZXQgY3NzIGNsYXNzXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IGhhcyBjbGFzc1xuICAgICAqL1xuICAgIGhhc0NsYXNzOiBmdW5jdGlvbihlbCwgZmluZENsYXNzKSB7XG4gICAgICAgIHZhciBjbGFzc05hbWVzID0gdGhpcy5fZ2V0Q2xhc3NOYW1lcyhlbCksXG4gICAgICAgICAgICBpbmRleCA9IG5lLnV0aWwuaW5BcnJheShmaW5kQ2xhc3MsIGNsYXNzTmFtZXMpO1xuICAgICAgICByZXR1cm4gaW5kZXggPiAtMTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmluZCBwYXJlbnQgYnkgY2xhc3MgbmFtZS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRvbUhhbmRsZXJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjbGFzc05hbWUgdGFyZ2V0IGNzcyBjbGFzc1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBsYXN0Q2xhc3MgbGFzdCBjc3MgY2xhc3NcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHJlc3VsdCBlbGVtZW50XG4gICAgICovXG4gICAgZmluZFBhcmVudEJ5Q2xhc3M6IGZ1bmN0aW9uKGVsLCBjbGFzc05hbWUsIGxhc3RDbGFzcykge1xuICAgICAgICB2YXIgcGFyZW50ID0gZWwucGFyZW50Tm9kZTtcbiAgICAgICAgaWYgKCFwYXJlbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaGFzQ2xhc3MocGFyZW50LCBjbGFzc05hbWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gcGFyZW50O1xuICAgICAgICB9IGVsc2UgaWYgKHBhcmVudC5ub2RlTmFtZSA9PT0gJ0JPRFknIHx8IHRoaXMuaGFzQ2xhc3MocGFyZW50LCBsYXN0Q2xhc3MpKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbmRQYXJlbnRCeUNsYXNzKHBhcmVudCwgY2xhc3NOYW1lLCBsYXN0Q2xhc3MpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFwcGVuZCBjaGlsZCBlbGVtZW50LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZG9tSGFuZGxlclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciBjb250YWluZXIgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNoaWxkcmVuIGNoaWxkIGVsZW1lbnRcbiAgICAgKi9cbiAgICBhcHBlbmQ6IGZ1bmN0aW9uKGNvbnRhaW5lciwgY2hpbGRyZW4pIHtcbiAgICAgICAgaWYgKCFjb250YWluZXIgfHwgIWNoaWxkcmVuKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY2hpbGRyZW4gPSBuZS51dGlsLmlzQXJyYXkoY2hpbGRyZW4pID8gY2hpbGRyZW4gOiBbY2hpbGRyZW5dO1xuXG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KGNoaWxkcmVuLCBmdW5jdGlvbihjaGlsZCkge1xuICAgICAgICAgICAgaWYgKCFjaGlsZCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChjaGlsZCk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZG9tSGFuZGxlcjtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBFdmVudCBsaXN0ZW5lci5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBFdmVudCBsaXN0ZW5lci5cbiAqIEBtb2R1bGUgZXZlbnRMaXN0ZW5lclxuICovXG52YXIgZXZlbnRMaXN0ZW5lciA9IHtcbiAgICAvKipcbiAgICAgKiBFdmVudCBsaXN0ZW5lciBmb3IgSUUuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpldmVudExpc3RlbmVyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZSBldmVudCBuYW1lXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayBjYWxsYmFjayBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2F0dGFjaEV2ZW50OiBmdW5jdGlvbiAoZXZlbnROYW1lLCBlbCwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PSBcIm9iamVjdFwiICYmIGNhbGxiYWNrLmhhbmRsZUV2ZW50KSB7XG4gICAgICAgICAgICBlbC5hdHRhY2hFdmVudChcIm9uXCIgKyBldmVudE5hbWUsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjay5oYW5kbGVFdmVudC5jYWxsKGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZWwuYXR0YWNoRXZlbnQoXCJvblwiICsgZXZlbnROYW1lLCBjYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXZlbnQgbGlzdGVuZXIgZm9yIG90aGVyIGJyb3dzZXJzLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZXZlbnRMaXN0ZW5lclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudE5hbWUgZXZlbnQgbmFtZVxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hZGRFdmVudExpc3RlbmVyOiBmdW5jdGlvbiAoZXZlbnROYW1lLCBlbCwgY2FsbGJhY2spIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBjYWxsYmFjayk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT0gXCJvYmplY3RcIiAmJiBjYWxsYmFjay5oYW5kbGVFdmVudCkge1xuICAgICAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suaGFuZGxlRXZlbnQuY2FsbChjYWxsYmFjaywgZXZlbnQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBCaW5kIGV2ZW50IGZ1bmN0aW9uLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZXZlbnRMaXN0ZW5lclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudE5hbWUgZXZlbnQgbmFtZVxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgKi9cbiAgICBiaW5kRXZlbnQ6IGZ1bmN0aW9uIChldmVudE5hbWUsIGVsLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgYmluZEV2ZW50O1xuICAgICAgICBpZiAoXCJhZGRFdmVudExpc3RlbmVyXCIgaW4gZWwpIHtcbiAgICAgICAgICAgIGJpbmRFdmVudCA9IHRoaXMuX2FkZEV2ZW50TGlzdGVuZXI7XG4gICAgICAgIH0gZWxzZSBpZiAoXCJhdHRhY2hFdmVudFwiIGluIGVsKSB7XG4gICAgICAgICAgICBiaW5kRXZlbnQgPSB0aGlzLl9hdHRhY2hFdmVudDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmJpbmRFdmVudCA9IGJpbmRFdmVudDtcbiAgICAgICAgYmluZEV2ZW50KGV2ZW50TmFtZSwgZWwsIGNhbGxiYWNrKTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV2ZW50TGlzdGVuZXI7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgVXRpbCBmb3IgcmVuZGVyaW5nLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZG9tID0gcmVxdWlyZSgnLi9kb21IYW5kbGVyJyksXG4gICAgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4vLi4vY29uc3QuanMnKTtcblxudmFyIGJyb3dzZXIgPSBuZS51dGlsLmJyb3dzZXIsXG4gICAgaXNJRTggPSBicm93c2VyLm1zaWUgJiYgYnJvd3Nlci52ZXJzaW9uID09PSA4O1xuXG4vKipcbiAqIFV0aWwgZm9yIHJlbmRlcmluZy5cbiAqIEBtb2R1bGUgcmVuZGVyVXRpbFxuICovXG52YXIgcmVuZGVyVXRpbCA9IHtcbiAgICAvKipcbiAgICAgKiBDb25jYXQgc3RyaW5nLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6cmVuZGVyVXRpbFxuICAgICAqIEBwYXJhbXMgey4uLnN0cmluZ30gdGFyZ2V0IHN0cmluZ3NcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBjb25jYXQgc3RyaW5nXG4gICAgICovXG4gICAgY29uY2F0U3RyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIFN0cmluZy5wcm90b3R5cGUuY29uY2F0LmFwcGx5KCcnLCBhcmd1bWVudHMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGNzc1RleHQgZm9yIGZvbnQuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpyZW5kZXJVdGlsXG4gICAgICogQHBhcmFtIHt7Zm9udFNpemU6IG51bWJlciwgZm9udEZhbWlseTogc3RyaW5nLCBjb2xvcjogc3RyaW5nfX0gdGhlbWUgZm9udCB0aGVtZVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGNzc1RleHRcbiAgICAgKi9cbiAgICBtYWtlRm9udENzc1RleHQ6IGZ1bmN0aW9uKHRoZW1lKSB7XG4gICAgICAgIHZhciBjc3NUZXh0cyA9IFtdO1xuXG4gICAgICAgIGlmICghdGhlbWUpIHtcbiAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGVtZS5mb250U2l6ZSkge1xuICAgICAgICAgICAgY3NzVGV4dHMucHVzaCh0aGlzLmNvbmNhdFN0cignZm9udC1zaXplOicsIHRoZW1lLmZvbnRTaXplLCAncHgnKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhlbWUuZm9udEZhbWlseSkge1xuICAgICAgICAgICAgY3NzVGV4dHMucHVzaCh0aGlzLmNvbmNhdFN0cignZm9udC1mYW1pbHk6JywgdGhlbWUuZm9udEZhbWlseSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoZW1lLmNvbG9yKSB7XG4gICAgICAgICAgICBjc3NUZXh0cy5wdXNoKHRoaXMuY29uY2F0U3RyKCdjb2xvcjonLCB0aGVtZS5jb2xvcikpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNzc1RleHRzLmpvaW4oJzsnKTtcbiAgICB9LFxuXG4gICAgY2hlY2tFbDogbnVsbCxcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgZWxlbWVudCBmb3Igc2l6ZSBjaGVjay5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOnJlbmRlclV0aWxcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jcmVhdGVTaXplQ2hlY2tFbDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBlbERpdiwgZWxTcGFuO1xuICAgICAgICBpZiAodGhpcy5jaGVja0VsKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVja0VsO1xuICAgICAgICB9XG5cbiAgICAgICAgZWxEaXYgPSBkb20uY3JlYXRlKCdESVYnLCAnbmUtY2hhcnQtc2l6ZS1jaGVjay1lbGVtZW50Jyk7XG4gICAgICAgIGVsU3BhbiA9IGRvbS5jcmVhdGUoJ1NQQU4nKTtcblxuICAgICAgICBlbERpdi5hcHBlbmRDaGlsZChlbFNwYW4pO1xuICAgICAgICB0aGlzLmNoZWNrRWwgPSBlbERpdjtcbiAgICAgICAgcmV0dXJuIGVsRGl2O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgcmVuZGVyZWQgbGFiZWwgc2l6ZSAod2lkdGggb3IgaGVpZ2h0KS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOnJlbmRlclV0aWxcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbGFiZWwgbGFiZWxcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgdGhlbWVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gb2Zmc2V0VHlwZSBvZmZzZXQgdHlwZSAob2Zmc2V0V2lkdGggb3Igb2Zmc2V0SGVpZ2h0KVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IHNpemVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRSZW5kZXJlZExhYmVsU2l6ZTogZnVuY3Rpb24obGFiZWwsIHRoZW1lLCBvZmZzZXRUeXBlKSB7XG4gICAgICAgIHZhciBlbERpdiwgZWxTcGFuLCBsYWJlbFNpemU7XG5cbiAgICAgICAgaWYgKG5lLnV0aWwuaXNVbmRlZmluZWQobGFiZWwpIHx8IGxhYmVsID09PSAnJykge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cblxuICAgICAgICBlbERpdiA9IHRoaXMuX2NyZWF0ZVNpemVDaGVja0VsKCk7XG4gICAgICAgIGVsU3BhbiA9IGVsRGl2LmZpcnN0Q2hpbGQ7XG5cbiAgICAgICAgdGhlbWUgPSB0aGVtZSB8fCB7fTtcbiAgICAgICAgZWxTcGFuLmlubmVySFRNTCA9IGxhYmVsO1xuICAgICAgICBlbFNwYW4uc3R5bGUuZm9udFNpemUgPSAodGhlbWUuZm9udFNpemUgfHwgY2hhcnRDb25zdC5ERUZBVUxUX0xBQkVMX0ZPTlRfU0laRSkgKyAncHgnO1xuXG4gICAgICAgIGlmICh0aGVtZS5mb250RmFtaWx5KSB7XG4gICAgICAgICAgICBlbFNwYW4uc3R5bGUucGFkZGluZyA9IDA7XG4gICAgICAgICAgICBlbFNwYW4uc3R5bGUuZm9udEZhbWlseSA9IHRoZW1lLmZvbnRGYW1pbHk7XG4gICAgICAgIH1cblxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGVsRGl2KTtcbiAgICAgICAgbGFiZWxTaXplID0gZWxTcGFuW29mZnNldFR5cGVdO1xuICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGVsRGl2KTtcbiAgICAgICAgcmV0dXJuIGxhYmVsU2l6ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHJlbmRlcmVkIGxhYmVsIHdpZHRoLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6cmVuZGVyVXRpbFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBsYWJlbCBsYWJlbFxuICAgICAqIEBwYXJhbSB7e2ZvbnRTaXplOiBudW1iZXIsIGZvbnRGYW1pbHk6IHN0cmluZywgY29sb3I6IHN0cmluZ319IHRoZW1lIGxhYmVsIHRoZW1lXG4gICAgICogQHJldHVybnMge251bWJlcn0gd2lkdGhcbiAgICAgKi9cbiAgICBnZXRSZW5kZXJlZExhYmVsV2lkdGg6IGZ1bmN0aW9uKGxhYmVsLCB0aGVtZSkge1xuICAgICAgICB2YXIgbGFiZWxXaWR0aCA9IHRoaXMuX2dldFJlbmRlcmVkTGFiZWxTaXplKGxhYmVsLCB0aGVtZSwgJ29mZnNldFdpZHRoJyk7XG4gICAgICAgIHJldHVybiBsYWJlbFdpZHRoO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgcmVuZGVyZWQgbGFiZWwgaGVpZ2h0LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6cmVuZGVyVXRpbFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBsYWJlbCBsYWJlbFxuICAgICAqIEBwYXJhbSB7e2ZvbnRTaXplOiBudW1iZXIsIGZvbnRGYW1pbHk6IHN0cmluZywgY29sb3I6IHN0cmluZ319IHRoZW1lIGxhYmVsIHRoZW1lXG4gICAgICogQHJldHVybnMge251bWJlcn0gaGVpZ2h0XG4gICAgICovXG4gICAgZ2V0UmVuZGVyZWRMYWJlbEhlaWdodDogZnVuY3Rpb24obGFiZWwsIHRoZW1lKSB7XG4gICAgICAgIHZhciBsYWJlbEhlaWdodCA9IHRoaXMuX2dldFJlbmRlcmVkTGFiZWxTaXplKGxhYmVsLCB0aGVtZSwgJ29mZnNldEhlaWdodCcpO1xuICAgICAgICByZXR1cm4gbGFiZWxIZWlnaHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBkaW1lbnNpb24uXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpyZW5kZXJVdGlsXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGRpbWVuc2lvbiBkaW1lbnNpb25cbiAgICAgKi9cbiAgICByZW5kZXJEaW1lbnNpb246IGZ1bmN0aW9uKGVsLCBkaW1lbnNpb24pIHtcbiAgICAgICAgZWwuc3R5bGUuY3NzVGV4dCA9IFtcbiAgICAgICAgICAgIHRoaXMuY29uY2F0U3RyKCd3aWR0aDonLCBkaW1lbnNpb24ud2lkdGgsICdweCcpLFxuICAgICAgICAgICAgdGhpcy5jb25jYXRTdHIoJ2hlaWdodDonLCBkaW1lbnNpb24uaGVpZ2h0LCAncHgnKVxuICAgICAgICBdLmpvaW4oJzsnKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIHBvc2l0aW9uKHRvcCwgcmlnaHQpLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6cmVuZGVyVXRpbFxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHBhcmFtIHt7dG9wOiBudW1iZXIsIGxlZnQ6IG51bWJlciwgcmlnaHQ6IG51bWJlcn19IHBvc2l0aW9uIHBvc2l0aW9uXG4gICAgICovXG4gICAgcmVuZGVyUG9zaXRpb246IGZ1bmN0aW9uKGVsLCBwb3NpdGlvbikge1xuICAgICAgICBpZiAobmUudXRpbC5pc1VuZGVmaW5lZChwb3NpdGlvbikpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwb3NpdGlvbi50b3ApIHtcbiAgICAgICAgICAgIGVsLnN0eWxlLnRvcCA9IHBvc2l0aW9uLnRvcCArICdweCc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocG9zaXRpb24ubGVmdCkge1xuICAgICAgICAgICAgZWwuc3R5bGUubGVmdCA9IHBvc2l0aW9uLmxlZnQgKyAncHgnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBvc2l0aW9uLnJpZ2h0KSB7XG4gICAgICAgICAgICBlbC5zdHlsZS5yaWdodCA9IHBvc2l0aW9uLnJpZ2h0ICsgJ3B4JztcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgYmFja2dyb3VuZC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOnJlbmRlclV0aWxcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBiYWNrZ3JvdW5kIGJhY2tncm91bmQgb3B0aW9uXG4gICAgICovXG4gICAgcmVuZGVyQmFja2dyb3VuZDogZnVuY3Rpb24oZWwsIGJhY2tncm91bmQpIHtcbiAgICAgICAgaWYgKCFiYWNrZ3JvdW5kKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBlbC5zdHlsZS5iYWNrZ3JvdW5kID0gYmFja2dyb3VuZDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGZvbnQgZmFtaWx5LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6cmVuZGVyVXRpbFxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZvbnRGYW1pbHkgZm9udCBmYW1pbHkgb3B0aW9uXG4gICAgICovXG4gICAgcmVuZGVyRm9udEZhbWlseTogZnVuY3Rpb24oZWwsIGZvbnRGYW1pbHkpIHtcbiAgICAgICAgaWYgKCFmb250RmFtaWx5KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBlbC5zdHlsZS5mb250RmFtaWx5ID0gZm9udEZhbWlseTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIHRpdGxlLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6cmVuZGVyVXRpbFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0aXRsZSB0aXRsZVxuICAgICAqIEBwYXJhbSB7e2ZvbnRTaXplOiBudW1iZXIsIGNvbG9yOiBzdHJpbmcsIGJhY2tncm91bmQ6IHN0cmluZ319IHRoZW1lIHRpdGxlIHRoZW1lXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNsYXNzTmFtZSBjc3MgY2xhc3MgbmFtZVxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gdGl0bGUgZWxlbWVudFxuICAgICAqL1xuICAgIHJlbmRlclRpdGxlOiBmdW5jdGlvbih0aXRsZSwgdGhlbWUsIGNsYXNzTmFtZSkge1xuICAgICAgICB2YXIgZWxUaXRsZSwgY3NzVGV4dDtcblxuICAgICAgICBpZiAoIXRpdGxlKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGVsVGl0bGUgPSBkb20uY3JlYXRlKCdESVYnLCBjbGFzc05hbWUpO1xuICAgICAgICBlbFRpdGxlLmlubmVySFRNTCA9IHRpdGxlO1xuXG4gICAgICAgIGNzc1RleHQgPSByZW5kZXJVdGlsLm1ha2VGb250Q3NzVGV4dCh0aGVtZSk7XG5cbiAgICAgICAgaWYgKHRoZW1lLmJhY2tncm91bmQpIHtcbiAgICAgICAgICAgIGNzc1RleHQgKz0gJzsnICsgdGhpcy5jb25jYXRTdHIoJ2JhY2tncm91bmQ6JywgdGhlbWUuYmFja2dyb3VuZCk7XG4gICAgICAgIH1cblxuICAgICAgICBlbFRpdGxlLnN0eWxlLmNzc1RleHQgPSBjc3NUZXh0O1xuXG4gICAgICAgIHJldHVybiBlbFRpdGxlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIElFOCBvciBub3QuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpyZW5kZXJVdGlsXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHJlc3VsdCBib29sZWFuXG4gICAgICovXG4gICAgaXNJRTg6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gaXNJRTg7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSByZW5kZXJVdGlsO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFRoaXMgaXMgdGVtcGxhdGUgbWFrZXIuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIC8qKlxuICAgICAqIFRoaXMgaXMgdGVtcGxhdGUgbWFrZXIuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGh0bWwgaHRtbFxuICAgICAqIEByZXR1cm5zIHtmdW5jdGlvbn0gdGVtcGxhdGUgZnVuY3Rpb25cbiAgICAgKiBAZWF4bXBsZVxuICAgICAqXG4gICAgICogICB2YXIgdGVtcGxhdGUgPSB0ZW1wbGF0ZU1ha2VyLnRlbXBsYXRlKCc8c3Bhbj57eyBuYW1lIH19PC9zcGFuPicpLFxuICAgICAqICAgICAgIHJlc3VsdCA9IHRlbXBsYXRlKHtuYW1lOiAnSm9obicpO1xuICAgICAqICAgY29uc29sZS5sb2cocmVzdWx0KTsgLy8gPHNwYW4+Sm9objwvc3Bhbj5cbiAgICAgKlxuICAgICAqL1xuICAgIHRlbXBsYXRlOiBmdW5jdGlvbiAoaHRtbCkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBodG1sO1xuICAgICAgICAgICAgbmUudXRpbC5mb3JFYWNoKGRhdGEsIGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlZ0V4cCA9IG5ldyBSZWdFeHAoJ3t7XFxcXHMqJyArIGtleSArICdcXFxccyp9fScsICdnJyk7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UocmVnRXhwLCB2YWx1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgfVxufTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyAgTGVnZW5kIGNvbXBvbmVudC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuLi9jb25zdC5qcycpLFxuICAgIGRvbSA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZG9tSGFuZGxlci5qcycpLFxuICAgIHJlbmRlclV0aWwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3JlbmRlclV0aWwuanMnKSxcbiAgICBkZWZhdWx0VGhlbWUgPSByZXF1aXJlKCcuLi90aGVtZXMvZGVmYXVsdFRoZW1lLmpzJyksXG4gICAgbGVnZW5kVGVtcGxhdGUgPSByZXF1aXJlKCcuLy4uL2xlZ2VuZHMvbGVnZW5kVGVtcGxhdGUuanMnKTtcblxudmFyIExFR0VORF9SRUNUX1dJRFRIID0gMTIsXG4gICAgTEFCRUxfUEFERElOR19UT1AgPSAyLFxuICAgIExJTkVfTUFSR0lOX1RPUCA9IDU7XG5cbnZhciBMZWdlbmQgPSBuZS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgTGVnZW5kLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogTGVnZW5kIGNvbXBvbmVudC5cbiAgICAgKiBAY29uc3RydWN0cyBMZWdlbmRcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubGVnZW5kTGFiZWxzIGxlZ2VuZCBsYWJlbHNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuYm91bmQgYXhpcyBib3VuZFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBheGlzIHRoZW1lXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIG5lLnV0aWwuZXh0ZW5kKHRoaXMsIHBhcmFtcyk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBMZWdlbmQgdmlldyBjbGFzc05hbWVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2xhc3NOYW1lID0gJ25lLWNoYXJ0LWxlZ2VuZC1hcmVhJztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGxlZ2VuZC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYm91bmQgcGxvdCBib3VuZFxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gbGVnZW5kIGVsZW1lbnRcbiAgICAgKi9cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZWwgPSBkb20uY3JlYXRlKCdESVYnLCB0aGlzLmNsYXNzTmFtZSk7XG4gICAgICAgIGVsLmlubmVySFRNTCA9IHRoaXMuX21ha2VMZWdlbmRIdG1sKCk7XG4gICAgICAgIHJlbmRlclV0aWwucmVuZGVyUG9zaXRpb24oZWwsIHRoaXMuYm91bmQucG9zaXRpb24pO1xuICAgICAgICB0aGlzLl9yZW5kZXJMYWJlbFRoZW1lKGVsLCB0aGlzLnRoZW1lLmxhYmVsKTtcblxuICAgICAgICByZXR1cm4gZWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCB0aGVtZSBmb3IgbGVnZW5kIGxhYmVsc1xuICAgICAqIEBwYXJhbSB7YXJyYXkuPG9iamVjdD59IGxhYmVscyBsYWJlbHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgbGVnZW5kIHRoZW1lXG4gICAgICogQHJldHVybnMge2FycmF5LjxvYmplY3Q+fSBsYWJlbHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRUaGVtZUZvckxhYmVsczogZnVuY3Rpb24obGFiZWxzLCB0aGVtZSkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gbmUudXRpbC5tYXAobGFiZWxzLCBmdW5jdGlvbihpdGVtLCBpbmRleCkge1xuICAgICAgICAgICAgdmFyIGl0ZW1UaGVtZSA9IHtcbiAgICAgICAgICAgICAgICBjb2xvcjogdGhlbWUuY29sb3JzW2luZGV4XVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKHRoZW1lLnNpbmdsZUNvbG9ycykge1xuICAgICAgICAgICAgICAgIGl0ZW1UaGVtZS5zaW5nbGVDb2xvciA9IHRoZW1lLnNpbmdsZUNvbG9yc1tpbmRleF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhlbWUuYm9yZGVyQ29sb3IpIHtcbiAgICAgICAgICAgICAgICBpdGVtVGhlbWUuYm9yZGVyQ29sb3IgPSB0aGVtZS5ib3JkZXJDb2xvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGl0ZW0udGhlbWUgPSBpdGVtVGhlbWU7XG4gICAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBsZWdlbmQgbGFiZWxzLlxuICAgICAqIEByZXR1cm5zIHthcnJheS48b2JqZWN0Pn0gbGVnZW5kIGxhYmVscy5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlTGVnZW5kTGFiZWxzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNoYXJ0VHlwZSA9IHRoaXMuY2hhcnRUeXBlLFxuICAgICAgICAgICAgbGVnZW5kTGFiZWxzID0gdGhpcy5sZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICBqb2luTGVnZW5kTGFiZWxzID0gdGhpcy5qb2luTGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgbGFiZWxMZW4gPSBsZWdlbmRMYWJlbHMubGVuZ3RoLFxuICAgICAgICAgICAgdGhlbWUgPSB0aGlzLnRoZW1lLFxuICAgICAgICAgICAgY2hhcnRMZWdlbmRUaGVtZSA9IG5lLnV0aWwuZmlsdGVyKHRoZW1lLCBmdW5jdGlvbihpdGVtLCBuYW1lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwuaW5BcnJheShuYW1lLCBjaGFydENvbnN0LlNFUklFU19QUk9QUykgPT09IC0xICYmIG5hbWUgIT09ICdsYWJlbCc7XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGNoYXJ0VHlwZXMgPSBuZS51dGlsLmtleXMoY2hhcnRMZWdlbmRUaGVtZSksXG4gICAgICAgICAgICBkZWZhdWx0TGVnZW5kVGhlbWUgPSB7XG4gICAgICAgICAgICAgICAgY29sb3JzOiBkZWZhdWx0VGhlbWUuc2VyaWVzLmNvbG9yc1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNoYXJ0VGhlbWUsIHJlc3VsdDtcblxuICAgICAgICBpZiAoIWNoYXJ0VHlwZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9zZXRUaGVtZUZvckxhYmVscyhqb2luTGVnZW5kTGFiZWxzLCB0aGVtZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjaGFydFRoZW1lID0gdGhlbWVbY2hhcnRUeXBlXSB8fCBkZWZhdWx0TGVnZW5kVGhlbWU7XG4gICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9zZXRUaGVtZUZvckxhYmVscyhqb2luTGVnZW5kTGFiZWxzLnNsaWNlKDAsIGxhYmVsTGVuKSwgY2hhcnRUaGVtZSk7XG4gICAgICAgICAgICBjaGFydFRoZW1lID0gdGhlbWVbbmUudXRpbC5maWx0ZXIoY2hhcnRUeXBlcywgZnVuY3Rpb24ocHJvcE5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvcE5hbWUgIT09IGNoYXJ0VHlwZTtcbiAgICAgICAgICAgIH0pWzBdXSB8fCBkZWZhdWx0TGVnZW5kVGhlbWU7XG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KHRoaXMuX3NldFRoZW1lRm9yTGFiZWxzKGpvaW5MZWdlbmRMYWJlbHMuc2xpY2UobGFiZWxMZW4pLCBjaGFydFRoZW1lKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBsZWdlbmQgaHRtbC5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBsZWdlbmQgaHRtbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VMZWdlbmRIdG1sOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGxhYmVscyA9IHRoaXMuX21ha2VMZWdlbmRMYWJlbHMoKSxcbiAgICAgICAgICAgIHRlbXBsYXRlID0gbGVnZW5kVGVtcGxhdGUudHBsTGVnZW5kLFxuICAgICAgICAgICAgbGFiZWxIZWlnaHQgPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxIZWlnaHQobGFiZWxzWzBdLmxhYmVsLCBsYWJlbHNbMF0udGhlbWUpICsgKExBQkVMX1BBRERJTkdfVE9QICogMiksXG4gICAgICAgICAgICBiYXNlTWFyZ2luVG9wID0gcGFyc2VJbnQoKGxhYmVsSGVpZ2h0IC0gTEVHRU5EX1JFQ1RfV0lEVEgpIC8gMiwgMTApIC0gMSxcbiAgICAgICAgICAgIGh0bWwgPSBuZS51dGlsLm1hcChsYWJlbHMsIGZ1bmN0aW9uKGxhYmVsKSB7XG4gICAgICAgICAgICAgICAgdmFyIGJvcmRlckNzc1RleHQgPSBsYWJlbC5ib3JkZXJDb2xvciA/IHJlbmRlclV0aWwuY29uY2F0U3RyKCc7Ym9yZGVyOjFweCBzb2xpZCAnLCBsYWJlbC5ib3JkZXJDb2xvcikgOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgcmVjdE1hcmdpbiwgbWFyZ2luVG9wLCBkYXRhO1xuICAgICAgICAgICAgICAgIGlmIChsYWJlbC5jaGFydFR5cGUgPT09ICdsaW5lJykge1xuICAgICAgICAgICAgICAgICAgICBtYXJnaW5Ub3AgPSBiYXNlTWFyZ2luVG9wICsgTElORV9NQVJHSU5fVE9QO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG1hcmdpblRvcCA9IGJhc2VNYXJnaW5Ub3A7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlY3RNYXJnaW4gPSByZW5kZXJVdGlsLmNvbmNhdFN0cignO21hcmdpbi10b3A6JywgbWFyZ2luVG9wLCAncHgnKTtcblxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIGNzc1RleHQ6IHJlbmRlclV0aWwuY29uY2F0U3RyKCdiYWNrZ3JvdW5kLWNvbG9yOicsIGxhYmVsLnRoZW1lLnNpbmdsZUNvbG9yIHx8IGxhYmVsLnRoZW1lLmNvbG9yLCBib3JkZXJDc3NUZXh0LCByZWN0TWFyZ2luKSxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBsYWJlbEhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgY2hhcnRUeXBlOiBsYWJlbC5jaGFydFR5cGUgfHwgJ3JlY3QnLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogbGFiZWwubGFiZWxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZShkYXRhKTtcbiAgICAgICAgICAgIH0sIHRoaXMpLmpvaW4oJycpO1xuICAgICAgICByZXR1cm4gaHRtbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGNzcyBzdHlsZSBvZiBsYWJlbCBhcmVhLlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIGxhYmVsIGFyZWEgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7e2ZvbnRTaXplOm51bWJlciwgZm9udEZhbWlseTogc3RyaW5nLCBjb2xvcjogc3RyaW5nfX0gdGhlbWUgbGFiZWwgdGhlbWVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJMYWJlbFRoZW1lOiBmdW5jdGlvbihlbCwgdGhlbWUpIHtcbiAgICAgICAgdmFyIGNzc1RleHQgPSByZW5kZXJVdGlsLm1ha2VGb250Q3NzVGV4dCh0aGVtZSk7XG4gICAgICAgIGVsLnN0eWxlLmNzc1RleHQgKz0gJzsnICsgY3NzVGV4dDtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBMZWdlbmQ7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgVGhpcyBpcyB0ZW1wbGF0ZXMgb2YgbGVnZW5kIHZpZXcuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG52YXIgdGVtcGxhdGVNYWtlciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvdGVtcGxhdGVNYWtlci5qcycpO1xuXG52YXIgdGFncyA9IHtcbiAgICBIVE1MX0xFR0VORDogJzxkaXYgY2xhc3M9XCJuZS1jaGFydC1sZWdlbmRcIj4nICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJuZS1jaGFydC1sZWdlbmQtcmVjdCB7eyBjaGFydFR5cGUgfX1cIiBzdHlsZT1cInt7IGNzc1RleHQgfX1cIj48L2Rpdj4nICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJuZS1jaGFydC1sZWdlbmQtbGFiZWxcIiBzdHlsZT1cImhlaWdodDp7eyBoZWlnaHQgfX1weFwiPnt7IGxhYmVsIH19PC9kaXY+PC9kaXY+J1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgdHBsTGVnZW5kOiB0ZW1wbGF0ZU1ha2VyLnRlbXBsYXRlKHRhZ3MuSFRNTF9MRUdFTkQpXG59O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFBsb3QgY29tcG9uZW50LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZG9tID0gcmVxdWlyZSgnLi4vaGVscGVycy9kb21IYW5kbGVyLmpzJyksXG4gICAgY2FsY3VsYXRvciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvY2FsY3VsYXRvci5qcycpLFxuICAgIHJlbmRlclV0aWwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3JlbmRlclV0aWwuanMnKSxcbiAgICBwbG90VGVtcGxhdGUgPSByZXF1aXJlKCcuL3Bsb3RUZW1wbGF0ZS5qcycpO1xuXG52YXIgUGxvdCA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBQbG90LnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogUGxvdCBjb21wb25lbnQuXG4gICAgICogQGNvbnN0cnVjdHMgUGxvdFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy52VGlja0NvdW50IHZlcnRpY2FsIHRpY2sgY291bnRcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuaFRpY2tDb3VudCBob3Jpem9udGFsIHRpY2sgY291bnRcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuYm91bmQgYXhpcyBib3VuZFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBheGlzIHRoZW1lXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIG5lLnV0aWwuZXh0ZW5kKHRoaXMsIHBhcmFtcyk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQbG90IHZpZXcgY2xhc3NOYW1lXG4gICAgICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNsYXNzTmFtZSA9ICduZS1jaGFydC1wbG90LWFyZWEnO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgcGxvdC5cbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgdG9wOiBudW1iZXIsIHJpZ2h0OiBudW1iZXJ9fSBib3VuZCBwbG90IGFyZWEgYm91bmRcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHBsb3QgZWxlbWVudFxuICAgICAqL1xuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBlbCA9IGRvbS5jcmVhdGUoJ0RJVicsIHRoaXMuY2xhc3NOYW1lKSxcbiAgICAgICAgICAgIGJvdW5kID0gdGhpcy5ib3VuZDtcbiAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJEaW1lbnNpb24oZWwsIGJvdW5kLmRpbWVuc2lvbik7XG4gICAgICAgIHJlbmRlclV0aWwucmVuZGVyUG9zaXRpb24oZWwsIGJvdW5kLnBvc2l0aW9uKTtcbiAgICAgICAgdGhpcy5fcmVuZGVyTGluZXMoZWwsIGJvdW5kLmRpbWVuc2lvbik7XG5cbiAgICAgICAgcmV0dXJuIGVsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgcGxvdCBsaW5lcy5cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCBlbGVtZW50XG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBkaW1lbnNpb24gcGxvdCBhcmVhIGRpbWVuc2lvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlckxpbmVzOiBmdW5jdGlvbihlbCwgZGltZW5zaW9uKSB7XG4gICAgICAgIHZhciBoUG9zaXRpb25zID0gdGhpcy5fbWFrZUhvcml6b250YWxQaXhlbFBvc2l0aW9ucyhkaW1lbnNpb24ud2lkdGgpLFxuICAgICAgICAgICAgdlBvc2l0aW9ucyA9IHRoaXMuX21ha2VWZXJ0aWNhbFBpeGVsUG9zaXRpb25zKGRpbWVuc2lvbi5oZWlnaHQpLFxuICAgICAgICAgICAgdGhlbWUgPSB0aGlzLnRoZW1lLFxuICAgICAgICAgICAgbGluZUh0bWwgPSAnJztcblxuICAgICAgICBsaW5lSHRtbCArPSB0aGlzLl9tYWtlTGluZUh0bWwoe1xuICAgICAgICAgICAgcG9zaXRpb25zOiBoUG9zaXRpb25zLFxuICAgICAgICAgICAgc2l6ZTogZGltZW5zaW9uLmhlaWdodCxcbiAgICAgICAgICAgIGNsYXNzTmFtZTogJ3ZlcnRpY2FsJyxcbiAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogJ2xlZnQnLFxuICAgICAgICAgICAgc2l6ZVR5cGU6ICdoZWlnaHQnLFxuICAgICAgICAgICAgbGluZUNvbG9yOiB0aGVtZS5saW5lQ29sb3JcbiAgICAgICAgfSk7XG4gICAgICAgIGxpbmVIdG1sICs9IHRoaXMuX21ha2VMaW5lSHRtbCh7XG4gICAgICAgICAgICBwb3NpdGlvbnM6IHZQb3NpdGlvbnMsXG4gICAgICAgICAgICBzaXplOiBkaW1lbnNpb24ud2lkdGgsXG4gICAgICAgICAgICBjbGFzc05hbWU6ICdob3Jpem9udGFsJyxcbiAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogJ2JvdHRvbScsXG4gICAgICAgICAgICBzaXplVHlwZTogJ3dpZHRoJyxcbiAgICAgICAgICAgIGxpbmVDb2xvcjogdGhlbWUubGluZUNvbG9yXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGVsLmlubmVySFRNTCA9IGxpbmVIdG1sO1xuXG4gICAgICAgIHJlbmRlclV0aWwucmVuZGVyQmFja2dyb3VuZChlbCwgdGhlbWUuYmFja2dyb3VuZCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgaHRtbCBvZiBwbG90IGxpbmUuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxvYmplY3Q+fSBwYXJhbXMucG9zaXRpb25zIHBvc2l0aW9uc1xuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5zaXplIHdpZHRoIG9yIGhlaWdodFxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5jbGFzc05hbWUgbGluZSBjbGFzc05hbWVcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMucG9zaXRpb25UeXBlIHBvc2l0aW9uIHR5cGUgKGxlZnQgb3IgYm90dG9tKVxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5zaXplVHlwZSBzaXplIHR5cGUgKHNpemUgb3IgaGVpZ2h0KVxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5saW5lQ29sb3IgbGluZSBjb2xvclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGh0bWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlTGluZUh0bWw6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgdGVtcGxhdGUgPSBwbG90VGVtcGxhdGUudHBsUGxvdExpbmUsXG4gICAgICAgICAgICBsaW5lSHRtbCA9IG5lLnV0aWwubWFwKHBhcmFtcy5wb3NpdGlvbnMsIGZ1bmN0aW9uKHBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNzc1RleHRzID0gW1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyVXRpbC5jb25jYXRTdHIocGFyYW1zLnBvc2l0aW9uVHlwZSwgJzonLCBwb3NpdGlvbiwgJ3B4JyksXG4gICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJVdGlsLmNvbmNhdFN0cihwYXJhbXMuc2l6ZVR5cGUsICc6JywgcGFyYW1zLnNpemUsICdweCcpXG4gICAgICAgICAgICAgICAgICAgIF0sIGRhdGE7XG5cbiAgICAgICAgICAgICAgICBpZiAocGFyYW1zLmxpbmVDb2xvcikge1xuICAgICAgICAgICAgICAgICAgICBjc3NUZXh0cy5wdXNoKHJlbmRlclV0aWwuY29uY2F0U3RyKCdiYWNrZ3JvdW5kLWNvbG9yOicsIHBhcmFtcy5saW5lQ29sb3IpKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBkYXRhID0ge2NsYXNzTmFtZTogcGFyYW1zLmNsYXNzTmFtZSwgY3NzVGV4dDogY3NzVGV4dHMuam9pbignOycpfTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGVtcGxhdGUoZGF0YSk7XG4gICAgICAgICAgICB9LCB0aGlzKS5qb2luKCcnKTtcbiAgICAgICAgcmV0dXJuIGxpbmVIdG1sO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHBpeGVsIHZhbHVlIG9mIHZlcnRpY2FsIHBvc2l0aW9uc1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgcGxvdCBoZWlnaHRcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPG51bWJlcj59IHBvc2l0aW9uc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VWZXJ0aWNhbFBpeGVsUG9zaXRpb25zOiBmdW5jdGlvbihoZWlnaHQpIHtcbiAgICAgICAgdmFyIHBvc2l0aW9ucyA9IGNhbGN1bGF0b3IubWFrZVRpY2tQaXhlbFBvc2l0aW9ucyhoZWlnaHQsIHRoaXMudlRpY2tDb3VudCk7XG4gICAgICAgIHBvc2l0aW9ucy5zaGlmdCgpO1xuICAgICAgICByZXR1cm4gcG9zaXRpb25zO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHBpeGVsIHZhbHVlIG9mIGhvcml6b250YWwgcG9zaXRpb25zLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aCBwbG90IHdpZHRoXG4gICAgICogQHJldHVybnMge2FycmF5LjxudW1iZXI+fSBwb3NpdGlvbnNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlSG9yaXpvbnRhbFBpeGVsUG9zaXRpb25zOiBmdW5jdGlvbih3aWR0aCkge1xuICAgICAgICB2YXIgcG9zaXRpb25zID0gY2FsY3VsYXRvci5tYWtlVGlja1BpeGVsUG9zaXRpb25zKHdpZHRoLCB0aGlzLmhUaWNrQ291bnQpO1xuICAgICAgICBwb3NpdGlvbnMuc2hpZnQoKTtcbiAgICAgICAgcmV0dXJuIHBvc2l0aW9ucztcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBQbG90O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFRoaXMgaXMgdGVtcGxhdGVzIG9mIHBsb3QgdmlldyAuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG52YXIgdGVtcGxhdGVNYWtlciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvdGVtcGxhdGVNYWtlci5qcycpO1xuXG52YXIgdGFncyA9IHtcbiAgICBIVE1MX1BMT1RfTElORTogJzxkaXYgY2xhc3M9XCJuZS1jaGFydC1wbG90LWxpbmUge3sgY2xhc3NOYW1lIH19XCIgc3R5bGU9XCJ7eyBjc3NUZXh0IH19XCI+PC9kaXY+J1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgdHBsUGxvdExpbmU6IHRlbXBsYXRlTWFrZXIudGVtcGxhdGUodGFncy5IVE1MX1BMT1RfTElORSlcbn07XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgUmFwaGFlbCByZW5kZXIgcGx1Z2luLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQmFyQ2hhcnQgPSByZXF1aXJlKCcuL3JhcGhhZWxCYXJDaGFydC5qcycpLFxuICAgIExpbmVDaGFydCA9IHJlcXVpcmUoJy4vcmFwaGFlbExpbmVDaGFydC5qcycpLFxuICAgIEFyZWFDaGFydCA9IHJlcXVpcmUoJy4vcmFwaGFlbEFyZWFDaGFydC5qcycpLFxuICAgIFBpZUNoYXJ0ID0gcmVxdWlyZSgnLi9yYXBoYWVsUGllQ2hhcnQuanMnKTtcblxudmFyIHBsdWdpbk5hbWUgPSAncmFwaGFlbCcsXG4gICAgcGx1Z2luUmFwaGFlbDtcblxucGx1Z2luUmFwaGFlbCA9IHtcbiAgICBiYXI6IEJhckNoYXJ0LFxuICAgIGNvbHVtbjogQmFyQ2hhcnQsXG4gICAgbGluZTogTGluZUNoYXJ0LFxuICAgIGFyZWE6IEFyZWFDaGFydCxcbiAgICBwaWU6IFBpZUNoYXJ0XG59O1xuXG5uZS5hcHBsaWNhdGlvbi5jaGFydC5yZWdpc3RlclBsdWdpbihwbHVnaW5OYW1lLCBwbHVnaW5SYXBoYWVsKTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBSYXBoYWVsIGFyZWEgY2hhcnQgcmVuZGVyZXIuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSYXBoYWVsTGluZUJhc2UgPSByZXF1aXJlKCcuL3JhcGhhZWxMaW5lVHlwZUJhc2UnKSxcbiAgICByYXBoYWVsUmVuZGVyVXRpbCA9IHJlcXVpcmUoJy4vcmFwaGFlbFJlbmRlclV0aWwnKTtcblxudmFyIFJhcGhhZWwgPSB3aW5kb3cuUmFwaGFlbCxcbiAgICBBTklNQVRJT05fVElNRSA9IDcwMDtcblxudmFyIGNvbmNhdCA9IEFycmF5LnByb3RvdHlwZS5jb25jYXQ7XG5cbi8qKlxuICogQGNsYXNzZGVzYyBSYXBoYWVsQXJlYUNoYXJ0IGlzIGdyYXBoIHJlbmRlcmVyIGZvciBhcmVhIGNoYXJ0LlxuICogQGNsYXNzIFJhcGhhZWxBcmVhQ2hhcnRcbiAqIEBleHRlbmRzIFJhcGhhZWxMaW5lVHlwZUJhc2VcbiAqL1xudmFyIFJhcGhhZWxBcmVhQ2hhcnQgPSBuZS51dGlsLmRlZmluZUNsYXNzKFJhcGhhZWxMaW5lQmFzZSwgLyoqIEBsZW5kcyBSYXBoYWVsQXJlYUNoYXJ0LnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogUmVuZGVyIGZ1bmN0aW9uIG9mIGFyZWEgY2hhcnQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY29udGFpbmVyXG4gICAgICogQHBhcmFtIHt7Z3JvdXBQb3NpdGlvbnM6IGFycmF5LjxhcnJheT4sIGRpbWVuc2lvbjogb2JqZWN0LCB0aGVtZTogb2JqZWN0LCBvcHRpb25zOiBvYmplY3R9fSBkYXRhIHJlbmRlciBkYXRhXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gaW5DYWxsYmFjayBpbiBjYWxsYmFja1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG91dENhbGxiYWNrIG91dCBjYWxsYmFja1xuICAgICAqIEByZXR1cm4ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqL1xuICAgIHJlbmRlcjogZnVuY3Rpb24ocGFwZXIsIGNvbnRhaW5lciwgZGF0YSwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGRpbWVuc2lvbiA9IGRhdGEuZGltZW5zaW9uLFxuICAgICAgICAgICAgZ3JvdXBQb3NpdGlvbnMgPSBkYXRhLmdyb3VwUG9zaXRpb25zLFxuICAgICAgICAgICAgdGhlbWUgPSBkYXRhLnRoZW1lLFxuICAgICAgICAgICAgY29sb3JzID0gdGhlbWUuY29sb3JzLFxuICAgICAgICAgICAgb3BhY2l0eSA9IGRhdGEub3B0aW9ucy5oYXNEb3QgPyAxIDogMCxcbiAgICAgICAgICAgIGdyb3VwUGF0aHMgPSB0aGlzLl9nZXRBcmVhc1BhdGgoZ3JvdXBQb3NpdGlvbnMsIGRhdGEuemVyb1RvcCksXG4gICAgICAgICAgICBib3JkZXJTdHlsZSA9IHRoaXMubWFrZUJvcmRlclN0eWxlKHRoZW1lLmJvcmRlckNvbG9yLCBvcGFjaXR5KSxcbiAgICAgICAgICAgIG91dERvdFN0eWxlID0gdGhpcy5tYWtlT3V0RG90U3R5bGUob3BhY2l0eSwgYm9yZGVyU3R5bGUpLFxuICAgICAgICAgICAgZ3JvdXBBcmVhcywgZ3JvdXBEb3RzO1xuXG4gICAgICAgIGlmICghcGFwZXIpIHtcbiAgICAgICAgICAgIHBhcGVyID0gUmFwaGFlbChjb250YWluZXIsIGRpbWVuc2lvbi53aWR0aCwgZGltZW5zaW9uLmhlaWdodCk7XG4gICAgICAgIH1cblxuICAgICAgICBncm91cEFyZWFzID0gdGhpcy5fcmVuZGVyQXJlYXMocGFwZXIsIGdyb3VwUGF0aHMsIGNvbG9ycyk7XG4gICAgICAgIGdyb3VwRG90cyA9IHRoaXMucmVuZGVyRG90cyhwYXBlciwgZ3JvdXBQb3NpdGlvbnMsIGNvbG9ycywgYm9yZGVyU3R5bGUpO1xuXG4gICAgICAgIHRoaXMub3V0RG90U3R5bGUgPSBvdXREb3RTdHlsZTtcbiAgICAgICAgdGhpcy5ncm91cFBhdGhzID0gZ3JvdXBQYXRocztcbiAgICAgICAgdGhpcy5ncm91cEFyZWFzID0gZ3JvdXBBcmVhcztcbiAgICAgICAgdGhpcy5ncm91cERvdHMgPSBncm91cERvdHM7XG4gICAgICAgIHRoaXMuZG90T3BhY2l0eSA9IG9wYWNpdHk7XG5cbiAgICAgICAgdGhpcy5hdHRhY2hFdmVudChncm91cERvdHMsIGdyb3VwUG9zaXRpb25zLCBvdXREb3RTdHlsZSwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spO1xuXG4gICAgICAgIHJldHVybiBwYXBlcjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGFyZWEgZ3JhcGguXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIHBhcGVyXG4gICAgICogQHBhcmFtIHt7c3RhcnQ6IHN0cmluZywgYWRkU3RhcnQ6IHN0cmluZ319IHBhdGggcGF0aFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb2xvciBjb2xvclxuICAgICAqIEByZXR1cm5zIHthcnJheS48b2JqZWN0Pn0gcmFwaGFlbCBvYmplY3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJBcmVhOiBmdW5jdGlvbihwYXBlciwgcGF0aCwgY29sb3IpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdLFxuICAgICAgICAgICAgYXJlYSA9IHBhcGVyLnBhdGgoW3BhdGguc3RhcnRdKSxcbiAgICAgICAgICAgIGZpbGxTdHlsZSA9IHtcbiAgICAgICAgICAgICAgICBmaWxsOiBjb2xvcixcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAwLjUsXG4gICAgICAgICAgICAgICAgc3Ryb2tlOiBjb2xvcixcbiAgICAgICAgICAgICAgICAnc3Ryb2tlLW9wYWNpdHknOiAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYWRkQXJlYTtcblxuICAgICAgICBhcmVhLmF0dHIoZmlsbFN0eWxlKTtcbiAgICAgICAgcmVzdWx0LnB1c2goYXJlYSk7XG5cbiAgICAgICAgaWYgKHBhdGguYWRkU3RhcnQpIHtcbiAgICAgICAgICAgIGFkZEFyZWEgPSBwYXBlci5wYXRoKFtwYXRoLmFkZFN0YXJ0XSk7XG4gICAgICAgICAgICBhZGRBcmVhLmF0dHIoZmlsbFN0eWxlKTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGFkZEFyZWEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBhcmVhIGdyYXBocy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgcGFwZXJcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxvYmplY3Q+fSBncm91cFBhdGhzIGdyb3VwIHBhdGhzXG4gICAgICogQHBhcmFtIHthcnJheS48c3RyaW5nPn0gY29sb3JzIGNvbG9yc1xuICAgICAqIEByZXR1cm5zIHthcnJheX0gcmFwaGFlbCBvYmplY3RzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyQXJlYXM6IGZ1bmN0aW9uKHBhcGVyLCBncm91cFBhdGhzLCBjb2xvcnMpIHtcbiAgICAgICAgdmFyIGdyb3VwQXJlYXMgPSBuZS51dGlsLm1hcChncm91cFBhdGhzLCBmdW5jdGlvbihwYXRocywgZ3JvdXBJbmRleCkge1xuICAgICAgICAgICAgdmFyIGNvbG9yID0gY29sb3JzW2dyb3VwSW5kZXhdIHx8ICd0cmFuc3BhcmVudCc7XG4gICAgICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAocGF0aHMsIGZ1bmN0aW9uKHBhdGgpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgICAgICBhcmVhOiB0aGlzLl9yZW5kZXJBcmVhKHBhcGVyLCBwYXRoLmFyZWEsIGNvbG9yKSxcbiAgICAgICAgICAgICAgICAgICAgbGluZTogcmFwaGFlbFJlbmRlclV0aWwucmVuZGVyTGluZShwYXBlciwgcGF0aC5saW5lLnN0YXJ0LCBjb2xvcilcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgcmV0dXJuIGdyb3VwQXJlYXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgbWludXMgb3Igbm90LlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSB2YWx1ZVxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSByZXN1bHQgYm9vbGVhblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2lzTWludXM6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZSA8IDA7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgcGx1cyBvciBub3QuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIHZhbHVlXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHJlc3VsdCBib29sZWFuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNQbHVzOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdmFsdWUgPj0gMDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBoZWlnaHQuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHRvcCB0b3BcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gemVyb1RvcCB6ZXJvIHBvc2l0aW9uIHRvcFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IGhlaWdodFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VIZWlnaHQ6IGZ1bmN0aW9uKHRvcCwgemVyb1RvcCkge1xuICAgICAgICByZXR1cm4gTWF0aC5hYnModG9wIC0gemVyb1RvcCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZpbmQgbWlkZGxlIGxlZnRcbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gZnJvbVBvcyBmcm9tIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IHRvUG9zIHRvIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHplcm9Ub3AgemVybyBwb3NpdGlvbiB0b3BcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBtaWRkbGUgbGVmdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2ZpbmRNaWRkbGVMZWZ0OiBmdW5jdGlvbihmcm9tUG9zLCB0b1BvcywgemVyb1RvcCkge1xuICAgICAgICB2YXIgdG9wcyA9IFt6ZXJvVG9wIC0gZnJvbVBvcy50b3AsIHplcm9Ub3AgLSB0b1Bvcy50b3BdLFxuICAgICAgICAgICAgbWlkZGxlTGVmdCwgd2lkdGgsIGZyb21IZWlnaHQsIHRvSGVpZ2h0O1xuXG4gICAgICAgIGlmIChuZS51dGlsLmFsbCh0b3BzLCB0aGlzLl9pc01pbnVzKSB8fCBuZS51dGlsLmFsbCh0b3BzLCB0aGlzLl9pc1BsdXMpKSB7XG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH1cblxuICAgICAgICBmcm9tSGVpZ2h0ID0gdGhpcy5fbWFrZUhlaWdodChmcm9tUG9zLnRvcCwgemVyb1RvcCk7XG4gICAgICAgIHRvSGVpZ2h0ID0gdGhpcy5fbWFrZUhlaWdodCh0b1Bvcy50b3AsIHplcm9Ub3ApO1xuICAgICAgICB3aWR0aCA9IHRvUG9zLmxlZnQgLSBmcm9tUG9zLmxlZnQ7XG5cbiAgICAgICAgbWlkZGxlTGVmdCA9IGZyb21Qb3MubGVmdCArICh3aWR0aCAqIChmcm9tSGVpZ2h0IC8gKGZyb21IZWlnaHQgKyB0b0hlaWdodCkpKTtcbiAgICAgICAgcmV0dXJuIG1pZGRsZUxlZnQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYXJlYSBwYXRoLlxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBmcm9tUG9zIGZyb20gcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gdG9Qb3MgdG8gcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gemVyb1RvcCB6ZXJvIHBvc2l0aW9uIHRvcFxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGFyZWEgcGF0aFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VBcmVhUGF0aDogZnVuY3Rpb24oZnJvbVBvcywgdG9Qb3MsIHplcm9Ub3ApIHtcbiAgICAgICAgdmFyIGZyb21TdGFydFBvaW50ID0gWydNJywgZnJvbVBvcy5sZWZ0LCAnICcsIHplcm9Ub3BdLFxuICAgICAgICAgICAgZnJvbUVuZFBvaW50ID0gemVyb1RvcCA9PT0gZnJvbVBvcy50b3AgPyBbXSA6IFsnTCcsIGZyb21Qb3MubGVmdCwgJyAnLCBmcm9tUG9zLnRvcF0sXG4gICAgICAgICAgICB0b1N0YXJ0UG9pbnQgPSBbJ0wnLCB0b1Bvcy5sZWZ0LCAnICcsIHRvUG9zLnRvcF0sXG4gICAgICAgICAgICB0b0VuZFBvaW50ID0gemVyb1RvcCA9PT0gdG9Qb3MudG9wID8gW10gOiBbJ0wnLCB0b1Bvcy5sZWZ0LCAnICcsIHplcm9Ub3BdO1xuICAgICAgICByZXR1cm4gY29uY2F0LmNhbGwoW10sIGZyb21TdGFydFBvaW50LCBmcm9tRW5kUG9pbnQsIHRvU3RhcnRQb2ludCwgdG9FbmRQb2ludCkuam9pbignJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYXJlYSBwYXRocy5cbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gZnJvbVBvcyBmcm9tIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IHRvUG9zIHRvIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHplcm9Ub3AgemVybyBwb3NpdGlvbiB0b3BcbiAgICAgKiBAcmV0dXJucyB7e1xuICAgICAqICAgICAgc3RhcnQ6IHN0cmluZyxcbiAgICAgKiAgICAgIGVuZDogc3RyaW5nLFxuICAgICAqICAgICAgYWRkU3RhcnQ6IHN0cmluZyxcbiAgICAgKiAgICAgIGFkZEVuZDogc3RyaW5nXG4gICAgICogfX0gYXJlYSBwYXRoc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VBcmVhUGF0aHM6IGZ1bmN0aW9uKGZyb21Qb3MsIHRvUG9zLCB6ZXJvVG9wKSB7XG4gICAgICAgIHZhciBtaWRkbGVMZWZ0ID0gdGhpcy5fZmluZE1pZGRsZUxlZnQoZnJvbVBvcywgdG9Qb3MsIHplcm9Ub3ApLFxuICAgICAgICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgIHN0YXJ0OiB0aGlzLl9tYWtlQXJlYVBhdGgoZnJvbVBvcywgZnJvbVBvcywgemVyb1RvcClcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtaWRkbGVQb3M7XG5cbiAgICAgICAgaWYgKHRoaXMuX2lzUGx1cyhtaWRkbGVMZWZ0KSkge1xuICAgICAgICAgICAgbWlkZGxlUG9zID0ge2xlZnQ6IG1pZGRsZUxlZnQsIHRvcDogemVyb1RvcH07XG4gICAgICAgICAgICByZXN1bHQuZW5kID0gdGhpcy5fbWFrZUFyZWFQYXRoKGZyb21Qb3MsIG1pZGRsZVBvcywgemVyb1RvcCk7XG4gICAgICAgICAgICByZXN1bHQuYWRkU3RhcnQgPSB0aGlzLl9tYWtlQXJlYVBhdGgobWlkZGxlUG9zLCBtaWRkbGVQb3MsIHplcm9Ub3ApO1xuICAgICAgICAgICAgcmVzdWx0LmFkZEVuZCA9IHRoaXMuX21ha2VBcmVhUGF0aChtaWRkbGVQb3MsIHRvUG9zLCB6ZXJvVG9wKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdC5lbmQgPSB0aGlzLl9tYWtlQXJlYVBhdGgoZnJvbVBvcywgdG9Qb3MsIHplcm9Ub3ApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGFyZWEgcGF0aC5cbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheS48b2JqZWN0Pj59IGdyb3VwUG9zaXRpb25zIHBvc2l0aW9uc1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB6ZXJvVG9wIHplcm8gdG9wXG4gICAgICogQHJldHVybnMge2FycmF5LjxhcnJheS48c3RyaW5nPj59IHBhdGhzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0QXJlYXNQYXRoOiBmdW5jdGlvbihncm91cFBvc2l0aW9ucywgemVyb1RvcCkge1xuICAgICAgICB2YXIgZ3JvdXBQYXRocyA9IG5lLnV0aWwubWFwKGdyb3VwUG9zaXRpb25zLCBmdW5jdGlvbihwb3NpdGlvbnMpIHtcbiAgICAgICAgICAgIHZhciBmcm9tUG9zID0gcG9zaXRpb25zWzBdLFxuICAgICAgICAgICAgICAgIHJlc3QgPSBwb3NpdGlvbnMuc2xpY2UoMSk7XG4gICAgICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAocmVzdCwgZnVuY3Rpb24ocG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgICAgICBhcmVhOiB0aGlzLl9tYWtlQXJlYVBhdGhzKGZyb21Qb3MsIHBvc2l0aW9uLCB6ZXJvVG9wKSxcbiAgICAgICAgICAgICAgICAgICAgbGluZTogdGhpcy5tYWtlTGluZVBhdGgoZnJvbVBvcywgcG9zaXRpb24pXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBmcm9tUG9zID0gcG9zaXRpb247XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIGdyb3VwUGF0aHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFuaW1hdGUgYXJlYSBjaGFydC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYXJlYSByYXBoYWVsIG9iamVjdFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBhcmVhUGF0aCBwYXRoXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHRpbWUgcGxheSB0aW1lXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHN0YXJ0VGltZSBzdGFydCB0aW1lXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYW5pbWF0ZUFyZWE6IGZ1bmN0aW9uKGFyZWEsIGFyZWFQYXRoLCB0aW1lLCBzdGFydFRpbWUpIHtcbiAgICAgICAgdmFyIGFyZWFBZGRFbmRQYXRoID0gYXJlYVBhdGguYWRkRW5kLFxuICAgICAgICAgICAgYXJlYUVuZFBhdGggPSBhcmVhUGF0aC5lbmQ7XG4gICAgICAgIGlmIChhcmVhQWRkRW5kUGF0aCkge1xuICAgICAgICAgICAgdGltZSA9IHRpbWUgLyAyO1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBhcmVhWzFdLmFuaW1hdGUoe3BhdGg6IGFyZWFBZGRFbmRQYXRoLCAnc3Ryb2tlLW9wYWNpdHknOiAwLjI1fSwgdGltZSk7XG4gICAgICAgICAgICB9LCBzdGFydFRpbWUgKyB0aW1lKTtcbiAgICAgICAgfVxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgYXJlYVswXS5hbmltYXRlKHtwYXRoOiBhcmVhRW5kUGF0aCwgJ3N0cm9rZS1vcGFjaXR5JzogMC4yNX0sIHRpbWUpO1xuICAgICAgICB9LCBzdGFydFRpbWUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBbmltYXRlLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIGNhbGxiYWNrXG4gICAgICovXG4gICAgYW5pbWF0ZTogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGdyb3VwQXJlYXMgPSB0aGlzLmdyb3VwQXJlYXMsXG4gICAgICAgICAgICBncm91cFBhdGhzID0gdGhpcy5ncm91cFBhdGhzLFxuICAgICAgICAgICAgb3BhY2l0eSA9IHRoaXMuZG90T3BhY2l0eSxcbiAgICAgICAgICAgIHRpbWUgPSBBTklNQVRJT05fVElNRSAvIGdyb3VwQXJlYXNbMF0ubGVuZ3RoLFxuICAgICAgICAgICAgc3RhcnRUaW1lO1xuICAgICAgICBuZS51dGlsLmZvckVhY2hBcnJheSh0aGlzLmdyb3VwRG90cywgZnVuY3Rpb24oZG90cywgZ3JvdXBJbmRleCkge1xuICAgICAgICAgICAgc3RhcnRUaW1lID0gMDtcbiAgICAgICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KGRvdHMsIGZ1bmN0aW9uKGRvdCwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgYXJlYSwgYXJlYVBhdGg7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIGFyZWEgPSBncm91cEFyZWFzW2dyb3VwSW5kZXhdW2luZGV4IC0gMV07XG4gICAgICAgICAgICAgICAgICAgIGFyZWFQYXRoID0gZ3JvdXBQYXRoc1tncm91cEluZGV4XVtpbmRleCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFuaW1hdGVMaW5lKGFyZWEubGluZSwgYXJlYVBhdGgubGluZS5lbmQsIHRpbWUsIHN0YXJ0VGltZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2FuaW1hdGVBcmVhKGFyZWEuYXJlYSwgYXJlYVBhdGguYXJlYSwgdGltZSwgc3RhcnRUaW1lKTtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRUaW1lICs9IHRpbWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKG9wYWNpdHkpIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvdC5hdHRyKHsnZmlsbC1vcGFjaXR5Jzogb3BhY2l0eX0pO1xuICAgICAgICAgICAgICAgICAgICB9LCBzdGFydFRpbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoY2FsbGJhY2ssIHN0YXJ0VGltZSk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSYXBoYWVsQXJlYUNoYXJ0O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFJhcGhhZWwgYmFyIGNoYXJ0IHJlbmRlcmVyLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmFwaGFlbCA9IHdpbmRvdy5SYXBoYWVsO1xuXG52YXIgQU5JTUFUSU9OX1RJTUUgPSA3MDA7XG5cbi8qKlxuICogQGNsYXNzZGVzYyBSYXBoYWVsQmFyQ2hhcnQgaXMgZ3JhcGggcmVuZGVyZXIgZm9yIGJhciwgY29sdW1uIGNoYXJ0LlxuICogQGNsYXNzIFJhcGhhZWxCYXJDaGFydFxuICovXG52YXIgUmFwaGFlbEJhckNoYXJ0ID0gbmUudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIFJhcGhhZWxCYXJDaGFydC5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIFJlbmRlciBmdW5jdGlvbiBvZiBiYXIgY2hhcnRcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciBjb250YWluZXIgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7e3NpemU6IG9iamVjdCwgbW9kZWw6IG9iamVjdCwgb3B0aW9uczogb2JqZWN0LCB0b29sdGlwUG9zaXRpb246IHN0cmluZ319IGRhdGEgY2hhcnQgZGF0YVxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGluQ2FsbGJhY2sgbW91c2VvdmVyIGNhbGxiYWNrXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gb3V0Q2FsbGJhY2sgbW91c2VvdXQgY2FsbGJhY2tcbiAgICAgKiBAcmV0dXJuIHtvYmplY3R9IHBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKi9cbiAgICByZW5kZXI6IGZ1bmN0aW9uKHBhcGVyLCBjb250YWluZXIsIGRhdGEsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKSB7XG4gICAgICAgIHZhciBncm91cEJvdW5kcyA9IGRhdGEuZ3JvdXBCb3VuZHMsXG4gICAgICAgICAgICBkaW1lbnNpb24gPSBkYXRhLmRpbWVuc2lvbjtcblxuICAgICAgICBpZiAoIWdyb3VwQm91bmRzKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghcGFwZXIpIHtcbiAgICAgICAgICAgIHBhcGVyID0gUmFwaGFlbChjb250YWluZXIsIGRpbWVuc2lvbi53aWR0aCwgZGltZW5zaW9uLmhlaWdodCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fcmVuZGVyQmFycyhwYXBlciwgZGF0YS50aGVtZSwgZ3JvdXBCb3VuZHMsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKTtcblxuICAgICAgICByZXR1cm4gcGFwZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBiYXJzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICogQHBhcmFtIHt7Y29sb3JzOiBzdHJpbmdbXSwgc2luZ2xlQ29sb3JzOiBzdHJpbmdbXSwgYm9yZGVyQ29sb3I6IHN0cmluZ319IHRoZW1lIGJhciBjaGFydCB0aGVtZVxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Ljx7bGVmdDogbnVtYmVyLCB0b3A6bnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn0+Pn0gZ3JvdXBCb3VuZHMgYm91bmRzXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gaW5DYWxsYmFjayBpbiBjYWxsYmFja1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG91dENhbGxiYWNrIG91dCBjYWxsYmFja1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlckJhcnM6IGZ1bmN0aW9uKHBhcGVyLCB0aGVtZSwgZ3JvdXBCb3VuZHMsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKSB7XG4gICAgICAgIHZhciBzaW5nbGVDb2xvcnMgPSAoZ3JvdXBCb3VuZHNbMF0ubGVuZ3RoID09PSAxKSAmJiB0aGVtZS5zaW5nbGVDb2xvcnMgfHwgW10sXG4gICAgICAgICAgICBjb2xvcnMgPSB0aGVtZS5jb2xvcnMsXG4gICAgICAgICAgICBib3JkZXJDb2xvciA9IHRoZW1lLmJvcmRlckNvbG9yIHx8ICdub25lJyxcbiAgICAgICAgICAgIGJhcnMgPSBbXTtcbiAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkoZ3JvdXBCb3VuZHMsIGZ1bmN0aW9uKGJvdW5kcywgZ3JvdXBJbmRleCkge1xuICAgICAgICAgICAgdmFyIHNpbmdsZUNvbG9yID0gc2luZ2xlQ29sb3JzW2dyb3VwSW5kZXhdLFxuICAgICAgICAgICAgICAgIGNvbG9yLCBpZCwgcmVjdDtcbiAgICAgICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KGJvdW5kcywgZnVuY3Rpb24oYm91bmQsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgaWYgKCFib3VuZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29sb3IgPSBzaW5nbGVDb2xvciB8fCBjb2xvcnNbaW5kZXhdO1xuICAgICAgICAgICAgICAgIGlkID0gZ3JvdXBJbmRleCArICctJyArIGluZGV4O1xuICAgICAgICAgICAgICAgIHJlY3QgPSB0aGlzLl9yZW5kZXJCYXIocGFwZXIsIGNvbG9yLCBib3JkZXJDb2xvciwgYm91bmQuc3RhcnQpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHJlY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYmluZEhvdmVyRXZlbnQocmVjdCwgYm91bmQuZW5kLCBpZCwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGJhcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHJlY3Q6IHJlY3QsXG4gICAgICAgICAgICAgICAgICAgIGJvdW5kOiBib3VuZC5lbmRcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICB0aGlzLmJhcnMgPSBiYXJzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgcmVjdFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbG9yIHNlcmllcyBjb2xvclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBib3JkZXJDb2xvciBzZXJpZXMgYm9yZGVyQ29sb3JcbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGJvdW5kIGJvdW5kXG4gICAgICogQHJldHVybnMge29iamVjdH0gYmFyIHJlY3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJCYXI6IGZ1bmN0aW9uKHBhcGVyLCBjb2xvciwgYm9yZGVyQ29sb3IsIGJvdW5kKSB7XG4gICAgICAgIHZhciByZWN0O1xuICAgICAgICBpZiAoYm91bmQud2lkdGggPCAwIHx8IGJvdW5kLmhlaWdodCA8IDApIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJlY3QgPSBwYXBlci5yZWN0KGJvdW5kLmxlZnQsIGJvdW5kLnRvcCwgYm91bmQud2lkdGgsIGJvdW5kLmhlaWdodCk7XG4gICAgICAgIHJlY3QuYXR0cih7XG4gICAgICAgICAgICBmaWxsOiBjb2xvcixcbiAgICAgICAgICAgIHN0cm9rZTogYm9yZGVyQ29sb3JcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHJlY3Q7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJpbmQgaG92ZXIgZXZlbnQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHJlY3QgcmFwaGFlbCByZWN0XG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBib3VuZCBib3VuZFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpZCB0b29sdGlwIGlkXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gaW5DYWxsYmFjayBpbiBjYWxsYmFja1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG91dENhbGxiYWNrIG91dCBjYWxsYmFja1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2JpbmRIb3ZlckV2ZW50OiBmdW5jdGlvbihyZWN0LCBib3VuZCwgaWQsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKSB7XG4gICAgICAgIHJlY3QuaG92ZXIoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpbkNhbGxiYWNrKGJvdW5kLCBpZCk7XG4gICAgICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgb3V0Q2FsbGJhY2soaWQpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQW5pbWF0ZS5cbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayBjYWxsYmFja1xuICAgICAqL1xuICAgIGFuaW1hdGU6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaCh0aGlzLmJhcnMsIGZ1bmN0aW9uKGJhcikge1xuICAgICAgICAgICAgdmFyIGJvdW5kID0gYmFyLmJvdW5kO1xuICAgICAgICAgICAgYmFyLnJlY3QuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgeDogYm91bmQubGVmdCxcbiAgICAgICAgICAgICAgICB5OiBib3VuZC50b3AsXG4gICAgICAgICAgICAgICAgd2lkdGg6IGJvdW5kLndpZHRoLFxuICAgICAgICAgICAgICAgIGhlaWdodDogYm91bmQuaGVpZ2h0XG4gICAgICAgICAgICB9LCBBTklNQVRJT05fVElNRSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgc2V0VGltZW91dChjYWxsYmFjaywgQU5JTUFUSU9OX1RJTUUpO1xuICAgICAgICB9XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmFwaGFlbEJhckNoYXJ0O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFJhcGhhZWwgbGluZSBjaGFydCByZW5kZXJlci5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJhcGhhZWxMaW5lQmFzZSA9IHJlcXVpcmUoJy4vcmFwaGFlbExpbmVUeXBlQmFzZScpLFxuICAgIHJhcGhhZWxSZW5kZXJVdGlsID0gcmVxdWlyZSgnLi9yYXBoYWVsUmVuZGVyVXRpbCcpO1xuXG52YXIgUmFwaGFlbCA9IHdpbmRvdy5SYXBoYWVsLFxuICAgIEFOSU1BVElPTl9USU1FID0gNzAwO1xuXG4vKipcbiAqIEBjbGFzc2Rlc2MgUmFwaGFlbExpbmVDaGFydHMgaXMgZ3JhcGggcmVuZGVyZXIgZm9yIGxpbmUgY2hhcnQuXG4gKiBAY2xhc3MgUmFwaGFlbExpbmVDaGFydFxuICogQGV4dGVuZHMgUmFwaGFlbExpbmVUeXBlQmFzZVxuICovXG52YXIgUmFwaGFlbExpbmVDaGFydCA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoUmFwaGFlbExpbmVCYXNlLCAvKiogQGxlbmRzIFJhcGhhZWxMaW5lQ2hhcnQucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBSZW5kZXIgZnVuY3Rpb24gb2YgbGluZSBjaGFydC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciBjb250YWluZXJcbiAgICAgKiBAcGFyYW0ge3tncm91cFBvc2l0aW9uczogYXJyYXkuPGFycmF5PiwgZGltZW5zaW9uOiBvYmplY3QsIHRoZW1lOiBvYmplY3QsIG9wdGlvbnM6IG9iamVjdH19IGRhdGEgcmVuZGVyIGRhdGFcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBpbkNhbGxiYWNrIGluIGNhbGxiYWNrXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gb3V0Q2FsbGJhY2sgb3V0IGNhbGxiYWNrXG4gICAgICogQHJldHVybiB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICovXG4gICAgcmVuZGVyOiBmdW5jdGlvbihwYXBlciwgY29udGFpbmVyLCBkYXRhLCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjaykge1xuICAgICAgICB2YXIgZGltZW5zaW9uID0gZGF0YS5kaW1lbnNpb24sXG4gICAgICAgICAgICBncm91cFBvc2l0aW9ucyA9IGRhdGEuZ3JvdXBQb3NpdGlvbnMsXG4gICAgICAgICAgICB0aGVtZSA9IGRhdGEudGhlbWUsXG4gICAgICAgICAgICBjb2xvcnMgPSB0aGVtZS5jb2xvcnMsXG4gICAgICAgICAgICBvcGFjaXR5ID0gZGF0YS5vcHRpb25zLmhhc0RvdCA/IDEgOiAwLFxuICAgICAgICAgICAgZ3JvdXBQYXRocyA9IHRoaXMuX2dldExpbmVzUGF0aChncm91cFBvc2l0aW9ucyksXG4gICAgICAgICAgICBib3JkZXJTdHlsZSA9IHRoaXMubWFrZUJvcmRlclN0eWxlKHRoZW1lLmJvcmRlckNvbG9yLCBvcGFjaXR5KSxcbiAgICAgICAgICAgIG91dERvdFN0eWxlID0gdGhpcy5tYWtlT3V0RG90U3R5bGUob3BhY2l0eSwgYm9yZGVyU3R5bGUpLFxuICAgICAgICAgICAgZ3JvdXBMaW5lcywgZ3JvdXBEb3RzO1xuXG4gICAgICAgIGlmICghcGFwZXIpIHtcbiAgICAgICAgICAgIHBhcGVyID0gUmFwaGFlbChjb250YWluZXIsIGRpbWVuc2lvbi53aWR0aCwgZGltZW5zaW9uLmhlaWdodCk7XG4gICAgICAgIH1cblxuICAgICAgICBncm91cExpbmVzID0gdGhpcy5fcmVuZGVyTGluZXMocGFwZXIsIGdyb3VwUGF0aHMsIGNvbG9ycyk7XG4gICAgICAgIGdyb3VwRG90cyA9IHRoaXMucmVuZGVyRG90cyhwYXBlciwgZ3JvdXBQb3NpdGlvbnMsIGNvbG9ycywgYm9yZGVyU3R5bGUpO1xuXG4gICAgICAgIHRoaXMub3V0RG90U3R5bGUgPSBvdXREb3RTdHlsZTtcbiAgICAgICAgdGhpcy5ncm91cFBhdGhzID0gZ3JvdXBQYXRocztcbiAgICAgICAgdGhpcy5ncm91cExpbmVzID0gZ3JvdXBMaW5lcztcbiAgICAgICAgdGhpcy5ncm91cERvdHMgPSBncm91cERvdHM7XG4gICAgICAgIHRoaXMuZG90T3BhY2l0eSA9IG9wYWNpdHk7XG5cbiAgICAgICAgdGhpcy5hdHRhY2hFdmVudChncm91cERvdHMsIGdyb3VwUG9zaXRpb25zLCBvdXREb3RTdHlsZSwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spO1xuXG4gICAgICAgIHJldHVybiBwYXBlcjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGxpbmVzIHBhdGguXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXkuPG9iamVjdD4+fSBncm91cFBvc2l0aW9ucyBwb3NpdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxzdHJpbmc+Pn0gcGF0aHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRMaW5lc1BhdGg6IGZ1bmN0aW9uKGdyb3VwUG9zaXRpb25zKSB7XG4gICAgICAgIHZhciBncm91cFBhdGhzID0gbmUudXRpbC5tYXAoZ3JvdXBQb3NpdGlvbnMsIGZ1bmN0aW9uKHBvc2l0aW9ucykge1xuICAgICAgICAgICAgdmFyIGZyb21Qb3MgPSBwb3NpdGlvbnNbMF0sXG4gICAgICAgICAgICAgICAgcmVzdCA9IHBvc2l0aW9ucy5zbGljZSgxKTtcbiAgICAgICAgICAgIHJldHVybiBuZS51dGlsLm1hcChyZXN0LCBmdW5jdGlvbihwb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSB0aGlzLm1ha2VMaW5lUGF0aChmcm9tUG9zLCBwb3NpdGlvbik7XG4gICAgICAgICAgICAgICAgZnJvbVBvcyA9IHBvc2l0aW9uO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIHJldHVybiBncm91cFBhdGhzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgbGluZXMuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheS48c3RyaW5nPj59IGdyb3VwUGF0aHMgcGF0aHNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBjb2xvcnMgbGluZSBjb2xvcnNcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3Ryb2tlV2lkdGggc3Ryb2tlIHdpZHRoXG4gICAgICogQHJldHVybnMge2FycmF5LjxhcnJheS48b2JqZWN0Pj59IGxpbmVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyTGluZXM6IGZ1bmN0aW9uKHBhcGVyLCBncm91cFBhdGhzLCBjb2xvcnMsIHN0cm9rZVdpZHRoKSB7XG4gICAgICAgIHZhciBncm91cExpbmVzID0gbmUudXRpbC5tYXAoZ3JvdXBQYXRocywgZnVuY3Rpb24ocGF0aHMsIGdyb3VwSW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBjb2xvciA9IGNvbG9yc1tncm91cEluZGV4XSB8fCAndHJhbnNwYXJlbnQnO1xuICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwubWFwKHBhdGhzLCBmdW5jdGlvbihwYXRoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJhcGhhZWxSZW5kZXJVdGlsLnJlbmRlckxpbmUocGFwZXIsIHBhdGguc3RhcnQsIGNvbG9yLCBzdHJva2VXaWR0aCk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgcmV0dXJuIGdyb3VwTGluZXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFuaW1hdGUuXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgY2FsbGJhY2tcbiAgICAgKi9cbiAgICBhbmltYXRlOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICB2YXIgZ3JvdXBMaW5lcyA9IHRoaXMuZ3JvdXBMaW5lcyxcbiAgICAgICAgICAgIGdyb3VwUGF0aHMgPSB0aGlzLmdyb3VwUGF0aHMsXG4gICAgICAgICAgICBvcGFjaXR5ID0gdGhpcy5kb3RPcGFjaXR5LFxuICAgICAgICAgICAgdGltZSA9IEFOSU1BVElPTl9USU1FIC8gZ3JvdXBMaW5lc1swXS5sZW5ndGgsXG4gICAgICAgICAgICBzdGFydFRpbWU7XG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KHRoaXMuZ3JvdXBEb3RzLCBmdW5jdGlvbihkb3RzLCBncm91cEluZGV4KSB7XG4gICAgICAgICAgICBzdGFydFRpbWUgPSAwO1xuICAgICAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkoZG90cywgZnVuY3Rpb24oZG90LCBpbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciBsaW5lLCBwYXRoO1xuICAgICAgICAgICAgICAgIGlmIChpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICBsaW5lID0gZ3JvdXBMaW5lc1tncm91cEluZGV4XVtpbmRleCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICBwYXRoID0gZ3JvdXBQYXRoc1tncm91cEluZGV4XVtpbmRleCAtIDFdLmVuZDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hbmltYXRlTGluZShsaW5lLCBwYXRoLCB0aW1lLCBzdGFydFRpbWUpO1xuICAgICAgICAgICAgICAgICAgICBzdGFydFRpbWUgKz0gdGltZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAob3BhY2l0eSkge1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZG90LmF0dHIoeydmaWxsLW9wYWNpdHknOiBvcGFjaXR5fSk7XG4gICAgICAgICAgICAgICAgICAgIH0sIHN0YXJ0VGltZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgc2V0VGltZW91dChjYWxsYmFjaywgc3RhcnRUaW1lKTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhcGhhZWxMaW5lQ2hhcnQ7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgUmFwaGFlbExpbmVUeXBlQmFzZSBpcyBiYXNlIGNsYXNzIGZvciBsaW5lIHR5cGUgcmVuZGVyZXIuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciByYXBoYWVsUmVuZGVyVXRpbCA9IHJlcXVpcmUoJy4vcmFwaGFlbFJlbmRlclV0aWwnKTtcblxudmFyIERFRkFVTFRfRE9UX1dJRFRIID0gNCxcbiAgICBIT1ZFUl9ET1RfV0lEVEggPSA1O1xuXG4vKipcbiAqIEBjbGFzc2Rlc2MgUmFwaGFlbExpbmVUeXBlQmFzZSBpcyBiYXNlIGZvciBsaW5lIHR5cGUgcmVuZGVyZXIuXG4gKiBAY2xhc3MgUmFwaGFlbExpbmVUeXBlQmFzZVxuICovXG52YXIgUmFwaGFlbExpbmVUeXBlQmFzZSA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBSYXBoYWVsTGluZVR5cGVCYXNlLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBsaW5lIHBhdGhzLlxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBmcm9tUG9zIGZyb20gcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gdG9Qb3MgdG8gcG9zaXRpb25cbiAgICAgKiBAcmV0dXJucyB7e3N0YXJ0OiBzdHJpbmcsIGVuZDogc3RyaW5nfX0gbGluZSBwYXRocy5cbiAgICAgKi9cbiAgICBtYWtlTGluZVBhdGg6IGZ1bmN0aW9uKGZyb21Qb3MsIHRvUG9zKSB7XG4gICAgICAgIHZhciBzdGFydExpbmVQYXRoID0gcmFwaGFlbFJlbmRlclV0aWwubWFrZUxpbmVQYXRoKGZyb21Qb3MsIGZyb21Qb3MpLFxuICAgICAgICAgICAgZW5kTGluZVBhdGggPSByYXBoYWVsUmVuZGVyVXRpbC5tYWtlTGluZVBhdGgoZnJvbVBvcywgdG9Qb3MpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3RhcnQ6IHN0YXJ0TGluZVBhdGgsXG4gICAgICAgICAgICBlbmQ6IGVuZExpbmVQYXRoXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYm9yZGVyIHN0eWxlLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBib3JkZXJDb2xvciBib3JkZXIgY29sb3JcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gb3BhY2l0eSBvcGFjaXR5XG4gICAgICogQHJldHVybnMge3tzdHJva2U6IHN0cmluZywgc3Ryb2tlLXdpZHRoOiBudW1iZXIsIHN0cmlrZS1vcGFjaXR5OiBudW1iZXJ9fSBib3JkZXIgc3R5bGVcbiAgICAgKi9cbiAgICBtYWtlQm9yZGVyU3R5bGU6IGZ1bmN0aW9uKGJvcmRlckNvbG9yLCBvcGFjaXR5KSB7XG4gICAgICAgIHZhciBib3JkZXJTdHlsZTtcbiAgICAgICAgaWYgKGJvcmRlckNvbG9yKSB7XG4gICAgICAgICAgICBib3JkZXJTdHlsZSA9IHtcbiAgICAgICAgICAgICAgICBzdHJva2U6IGJvcmRlckNvbG9yLFxuICAgICAgICAgICAgICAgICdzdHJva2Utd2lkdGgnOiAxLFxuICAgICAgICAgICAgICAgICdzdHJva2Utb3BhY2l0eSc6IG9wYWNpdHlcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJvcmRlclN0eWxlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGRvdCBzdHlsZSBmb3IgbW91c2VvdXQgZXZlbnQuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG9wYWNpdHkgb3BhY2l0eVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBib3JkZXJTdHlsZSBib3JkZXIgc3R5bGVcbiAgICAgKiBAcmV0dXJucyB7e2ZpbGwtb3BhY2l0eTogbnVtYmVyLCBzdHJva2Utb3BhY2l0eTogbnVtYmVyLCByOiBudW1iZXJ9fSBzdHlsZVxuICAgICAqL1xuICAgIG1ha2VPdXREb3RTdHlsZTogZnVuY3Rpb24ob3BhY2l0eSwgYm9yZGVyU3R5bGUpIHtcbiAgICAgICAgdmFyIG91dERvdFN0eWxlID0ge1xuICAgICAgICAgICAgJ2ZpbGwtb3BhY2l0eSc6IG9wYWNpdHksXG4gICAgICAgICAgICAnc3Ryb2tlLW9wYWNpdHknOiAwLFxuICAgICAgICAgICAgcjogNFxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChib3JkZXJTdHlsZSkge1xuICAgICAgICAgICAgbmUudXRpbC5leHRlbmQob3V0RG90U3R5bGUsIGJvcmRlclN0eWxlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBvdXREb3RTdHlsZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGRvdC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBhZXJcbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gcG9zaXRpb24gZG90IHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbG9yIGRvdCBjb2xvclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBvcGFjaXR5IG9wYWNpdHlcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYm9yZGVyU3R5bGUgYm9yZGVyIHN0eWxlXG4gICAgICogQHJldHVybnMge29iamVjdH0gcmFwaGFlbCBkb3RcbiAgICAgKi9cbiAgICByZW5kZXJEb3Q6IGZ1bmN0aW9uKHBhcGVyLCBwb3NpdGlvbiwgY29sb3IsIG9wYWNpdHksIGJvcmRlclN0eWxlKSB7XG4gICAgICAgIHZhciBkb3QgPSBwYXBlci5jaXJjbGUocG9zaXRpb24ubGVmdCwgcG9zaXRpb24udG9wLCBERUZBVUxUX0RPVF9XSURUSCksXG4gICAgICAgICAgICBkb3RTdHlsZSA9IHtcbiAgICAgICAgICAgICAgICBmaWxsOiBjb2xvcixcbiAgICAgICAgICAgICAgICAnZmlsbC1vcGFjaXR5JzogMCxcbiAgICAgICAgICAgICAgICAnc3Ryb2tlLW9wYWNpdHknOiAwXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIGlmIChib3JkZXJTdHlsZSkge1xuICAgICAgICAgICAgbmUudXRpbC5leHRlbmQoZG90U3R5bGUsIGJvcmRlclN0eWxlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRvdC5hdHRyKGRvdFN0eWxlKTtcblxuICAgICAgICByZXR1cm4gZG90O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgZG90cy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gZ3JvdXBQb3NpdGlvbnMgcG9zaXRpb25zXG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gY29sb3JzIGNvbG9yc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBib3JkZXJTdHlsZSBib3JkZXIgc3R5bGVcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPG9iamVjdD59IGRvdHNcbiAgICAgKi9cbiAgICByZW5kZXJEb3RzOiBmdW5jdGlvbihwYXBlciwgZ3JvdXBQb3NpdGlvbnMsIGNvbG9ycywgYm9yZGVyU3R5bGUpIHtcbiAgICAgICAgdmFyIGRvdHMgPSBuZS51dGlsLm1hcChncm91cFBvc2l0aW9ucywgZnVuY3Rpb24ocG9zaXRpb25zLCBncm91cEluZGV4KSB7XG4gICAgICAgICAgICB2YXIgY29sb3IgPSBjb2xvcnNbZ3JvdXBJbmRleF07XG4gICAgICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAocG9zaXRpb25zLCBmdW5jdGlvbihwb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIHZhciBkb3QgPSB0aGlzLnJlbmRlckRvdChwYXBlciwgcG9zaXRpb24sIGNvbG9yLCBib3JkZXJTdHlsZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvdDtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICByZXR1cm4gZG90cztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNlbnRlciBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBmcm9tUG9zIGZyb20gcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gdG9Qb3MgdG8gcG9zaXRpb25cbiAgICAgKiBAcmV0dXJucyB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBwb3NpdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldENlbnRlcjogZnVuY3Rpb24oZnJvbVBvcywgdG9Qb3MpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxlZnQ6IChmcm9tUG9zLmxlZnQgKyB0b1Bvcy5sZWZ0KSAvIDIsXG4gICAgICAgICAgICB0b3A6IChmcm9tUG9zLnRvcCArIHRvUG9zLnRvcCkgLyAyXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJpbmQgaG92ZXIgZXZlbnQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRhcmdldCByYXBoYWVsIGl0ZW1cbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gcG9zaXRpb24gcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgaWRcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBpbkNhbGxiYWNrIGluIGNhbGxiYWNrXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gb3V0Q2FsbGJhY2sgb3V0IGNhbGxiYWNrXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYmluZEhvdmVyRXZlbnQ6IGZ1bmN0aW9uKHRhcmdldCwgcG9zaXRpb24sIGlkLCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjaykge1xuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgIHRhcmdldC5ob3ZlcihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoYXQuc2hvd2VkSWQgPSBpZDtcbiAgICAgICAgICAgIGluQ2FsbGJhY2socG9zaXRpb24sIGlkKTtcbiAgICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBvdXRDYWxsYmFjayhpZCk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggZXZlbnQuXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXkuPG9iamVjdD4+fSBncm91cERvdHMgZG90c1xuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gZ3JvdXBQb3NpdGlvbnMgcG9zaXRpb25zXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG91dERvdFN0eWxlIGRvdCBzdHlsZVxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGluQ2FsbGJhY2sgaW4gY2FsbGJhY2tcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvdXRDYWxsYmFjayBvdXQgY2FsbGJhY2tcbiAgICAgKi9cbiAgICBhdHRhY2hFdmVudDogZnVuY3Rpb24oZ3JvdXBEb3RzLCBncm91cFBvc2l0aW9ucywgb3V0RG90U3R5bGUsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKSB7XG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaChncm91cERvdHMsIGZ1bmN0aW9uKGRvdHMsIGdyb3VwSW5kZXgpIHtcbiAgICAgICAgICAgIG5lLnV0aWwuZm9yRWFjaChkb3RzLCBmdW5jdGlvbihkb3QsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdmFyIHBvc2l0aW9uID0gZ3JvdXBQb3NpdGlvbnNbZ3JvdXBJbmRleF1baW5kZXhdLFxuICAgICAgICAgICAgICAgICAgICBpZCA9IGluZGV4ICsgJy0nICsgZ3JvdXBJbmRleDtcbiAgICAgICAgICAgICAgICB0aGlzLl9iaW5kSG92ZXJFdmVudChkb3QsIHBvc2l0aW9uLCBpZCwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTaG93IGFuaW1hdGlvbi5cbiAgICAgKiBAcGFyYW0ge3tncm91cEluZGV4OiBudW1iZXIsIGluZGV4Om51bWJlcn19IGRhdGEgc2hvdyBpbmZvXG4gICAgICovXG4gICAgc2hvd0FuaW1hdGlvbjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgaW5kZXggPSBkYXRhLmdyb3VwSW5kZXgsIC8vIExpbmUgY2hhcnQgaGFzIHBpdm90IHZhbHVlcy5cbiAgICAgICAgICAgIGdyb3VwSW5kZXggPSBkYXRhLmluZGV4LFxuICAgICAgICAgICAgZG90ID0gdGhpcy5ncm91cERvdHNbZ3JvdXBJbmRleF1baW5kZXhdO1xuXG4gICAgICAgIGRvdC5hdHRyKHtcbiAgICAgICAgICAgICdmaWxsLW9wYWNpdHknOiAxLFxuICAgICAgICAgICAgJ3N0cm9rZS1vcGFjaXR5JzogMC4zLFxuICAgICAgICAgICAgJ3N0cm9rZS13aWR0aCc6IDMsXG4gICAgICAgICAgICByOiBIT1ZFUl9ET1RfV0lEVEhcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhpZGUgYW5pbWF0aW9uLlxuICAgICAqIEBwYXJhbSB7e2dyb3VwSW5kZXg6IG51bWJlciwgaW5kZXg6bnVtYmVyfX0gZGF0YSBoaWRlIGluZm9cbiAgICAgKi9cbiAgICBoaWRlQW5pbWF0aW9uOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBpbmRleCA9IGRhdGEuZ3JvdXBJbmRleCwgLy8gTGluZSBjaGFydCBoYXMgcGl2b3QgdmFsdWVzLlxuICAgICAgICAgICAgZ3JvdXBJbmRleCA9IGRhdGEuaW5kZXgsXG4gICAgICAgICAgICBkb3QgPSB0aGlzLmdyb3VwRG90c1tncm91cEluZGV4XVtpbmRleF07XG5cbiAgICAgICAgZG90LmF0dHIodGhpcy5vdXREb3RTdHlsZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFuaW1hdGUgbGluZS5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gbGluZSByYXBoYWVsIG9iamVjdFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBsaW5lUGF0aCBsaW5lIHBhdGhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdGltZSBwbGF5IHRpbWVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3RhcnRUaW1lIHN0YXJ0IHRpbWVcbiAgICAgKi9cbiAgICBhbmltYXRlTGluZTogZnVuY3Rpb24obGluZSwgbGluZVBhdGgsIHRpbWUsIHN0YXJ0VGltZSkge1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbGluZS5hbmltYXRlKHtwYXRoOiBsaW5lUGF0aH0sIHRpbWUpO1xuICAgICAgICB9LCBzdGFydFRpbWUpO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhcGhhZWxMaW5lVHlwZUJhc2U7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgUmFwaGFlbFBpZUNoYXJ0cyBpcyBncmFwaCByZW5kZXJlciBmb3IgcGllIGNoYXJ0LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgcmFwaGFlbFJlbmRlclV0aWwgPSByZXF1aXJlKCcuL3JhcGhhZWxSZW5kZXJVdGlsJyk7XG5cbnZhciBSYXBoYWVsID0gd2luZG93LlJhcGhhZWwsXG4gICAgQU5HTEVfMTgwID0gMTgwLFxuICAgIEFOR0xFXzkwID0gOTAsXG4gICAgUkFEID0gTWF0aC5QSSAvIEFOR0xFXzE4MCxcbiAgICBBTklNQVRJT05fVElNRSA9IDUwMCxcbiAgICBMT0FESU5HX0FOSU1BVElPTl9USU1FID0gNzAwO1xuXG4vKipcbiAqIEBjbGFzc2Rlc2MgUmFwaGFlbFBpZUNoYXJ0cyBpcyBncmFwaCByZW5kZXJlciBmb3IgcGllIGNoYXJ0LlxuICogQGNsYXNzIFJhcGhhZWxQaWVDaGFydFxuICovXG52YXIgUmFwaGFlbFBpZUNoYXJ0ID0gbmUudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIFJhcGhhZWxQaWVDaGFydC5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIFJlbmRlciBmdW5jdGlvbiBvZiBwaWUgY2hhcnQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY29udGFpbmVyXG4gICAgICogQHBhcmFtIHt7c2VjdG9yc0luZm86IGFycmF5LjxvYmplY3Q+LCBjaXJjbGVCb3VuZDoge2N4OiBudW1iZXIsIGN5OiBudW1iZXIsIHI6IG51bWJlcn0sIGRpbWVuc2lvbjogb2JqZWN0LCB0aGVtZTogb2JqZWN0LCBvcHRpb25zOiBvYmplY3R9fSBkYXRhIHJlbmRlciBkYXRhXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gaW5DYWxsYmFjayBpbiBjYWxsYmFja1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG91dENhbGxiYWNrIG91dCBjYWxsYmFja1xuICAgICAqIEByZXR1cm4ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqL1xuICAgIHJlbmRlcjogZnVuY3Rpb24ocGFwZXIsIGNvbnRhaW5lciwgZGF0YSwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGRpbWVuc2lvbiA9IGRhdGEuZGltZW5zaW9uO1xuXG4gICAgICAgIGlmICghcGFwZXIpIHtcbiAgICAgICAgICAgIHBhcGVyID0gUmFwaGFlbChjb250YWluZXIsIGRpbWVuc2lvbi53aWR0aCwgZGltZW5zaW9uLmhlaWdodCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXBhcGVyLmN1c3RvbUF0dHJpYnV0ZXMuc2VjdG9yKSB7XG4gICAgICAgICAgICBwYXBlci5jdXN0b21BdHRyaWJ1dGVzLnNlY3RvciA9IG5lLnV0aWwuYmluZCh0aGlzLl9tYWtlU2VjdG9yUGF0aCwgdGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNpcmNsZUJvdW5kID0gZGF0YS5jaXJjbGVCb3VuZDtcbiAgICAgICAgdGhpcy5fcmVuZGVyUGllKHBhcGVyLCBkYXRhLCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjayk7XG5cbiAgICAgICAgcmV0dXJuIHBhcGVyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHNlY3RvciBwYXRoLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjeCBjZW50ZXIgeFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjeSBjZW50ZXIgeVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSByIHJhZGl1c1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdGFydEFuZ2xlIHN0YXJ0IGFuZ2xlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGVuZEFuZ2xlIGVuZCBhbmdlbFxuICAgICAqIEByZXR1cm5zIHt7cGF0aDogYXJyYXl9fSBzZWN0b3IgcGF0aFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VTZWN0b3JQYXRoOiBmdW5jdGlvbihjeCwgY3ksIHIsIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlKSB7XG4gICAgICAgIHZhciB4MSA9IGN4ICsgciAqIE1hdGguY29zKC0oc3RhcnRBbmdsZSAtIEFOR0xFXzkwKSAqIFJBRCksIC8vIOybkCDtmLjsnZgg7Iuc7J6RIHgg7KKM7ZGcXG4gICAgICAgICAgICB5MSA9IGN5IC0gciAqIE1hdGguc2luKC0oc3RhcnRBbmdsZSAtIEFOR0xFXzkwKSAqIFJBRCksIC8vIOybkCDtmLjsnZgg7Iuc7J6RIHkg7KKM7ZGcXG4gICAgICAgICAgICB4MiA9IGN4ICsgciAqIE1hdGguY29zKC0oZW5kQW5nbGUgLSBBTkdMRV85MCkgKiBSQUQpLC8vIOybkCDtmLjsnZgg7KKF66OMIHgg7KKM7ZGcXG4gICAgICAgICAgICB5MiA9IGN5IC0gciAqIE1hdGguc2luKC0oZW5kQW5nbGUgLSBBTkdMRV85MCkgKiBSQUQpLCAvLyDsm5Ag7Zi47J2YIOyiheujjCB5IOyijO2RnFxuICAgICAgICAgICAgbGFyZ2VBcmNGbGFnID0gZW5kQW5nbGUgLSBzdGFydEFuZ2xlID4gQU5HTEVfMTgwID8gMSA6IDAsXG4gICAgICAgICAgICBwYXRoID0gW1wiTVwiLCBjeCwgY3ksXG4gICAgICAgICAgICAgICAgXCJMXCIsIHgyLCB5MixcbiAgICAgICAgICAgICAgICBcIkFcIiwgciwgciwgMCwgbGFyZ2VBcmNGbGFnLCAwLCB4MSwgeTEsXG4gICAgICAgICAgICAgICAgXCJaXCJcbiAgICAgICAgICAgIF07XG4gICAgICAgIHJldHVybiB7cGF0aDogcGF0aH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBzZWN0b3JcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMucGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqICAgICAgQHBhcmFtIHt7Y3g6IG51bWJlciwgY3k6IG51bWJlciwgcjpudW1iZXJ9fSBwYXJhbXMuY2lyY2xlQm91bmQgY2lyY2xlIGJvdW5kc1xuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5zdGFydEFuZ2xlIHN0YXJ0IGFuZ2xlXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmVuZEFuZ2xlIGVuZCBhbmdsZVxuICAgICAqICAgICAgQHBhcmFtIHt7ZmlsbDogc3RyaW5nLCBzdHJva2U6IHN0cmluZywgc3RyaWtlLXdpZHRoOiBzdHJpbmd9fSBwYXJhbXMuYXR0cnMgYXR0cnNcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSByYXBoYWVsIG9iamVjdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlclNlY3RvcjogZnVuY3Rpb24gKHBhcmFtcykge1xuICAgICAgICB2YXIgY2lyY2xlQm91bmQgPSBwYXJhbXMuY2lyY2xlQm91bmQsXG4gICAgICAgICAgICBhbmdsZXMgPSBwYXJhbXMuYW5nbGVzO1xuICAgICAgICByZXR1cm4gcGFyYW1zLnBhcGVyLnBhdGgoKS5hdHRyKHtcbiAgICAgICAgICAgIHNlY3RvcjogW2NpcmNsZUJvdW5kLmN4LCBjaXJjbGVCb3VuZC5jeSwgY2lyY2xlQm91bmQuciwgYW5nbGVzLnN0YXJ0QW5nbGUsIGFuZ2xlcy5lbmRBbmdsZV1cbiAgICAgICAgfSkuYXR0cihwYXJhbXMuYXR0cnMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgcGllIGdyYXBoLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICogQHBhcmFtIHt7c2VjdG9yc0luZm86IGFycmF5LjxvYmplY3Q+LCBjaXJjbGVCb3VuZDoge2N4OiBudW1iZXIsIGN5OiBudW1iZXIsIHI6IG51bWJlcn0sIGRpbWVuc2lvbjogb2JqZWN0LCB0aGVtZTogb2JqZWN0LCBvcHRpb25zOiBvYmplY3R9fSBkYXRhIHJlbmRlciBkYXRhXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gaW5DYWxsYmFjayBpbiBjYWxsYmFja1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG91dENhbGxiYWNrIG91dCBjYWxsYmFja1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlclBpZTogZnVuY3Rpb24ocGFwZXIsIGRhdGEsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKSB7XG4gICAgICAgIHZhciBjaXJjbGVCb3VuZCA9IGRhdGEuY2lyY2xlQm91bmQsXG4gICAgICAgICAgICBjb2xvcnMgPSBkYXRhLnRoZW1lLmNvbG9ycyxcbiAgICAgICAgICAgIGNoYXJ0QmFja2dyb3VuZCA9IGRhdGEuY2hhcnRCYWNrZ3JvdW5kLFxuICAgICAgICAgICAgc2VjdG9ycyA9IFtdO1xuXG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KGRhdGEuc2VjdG9yc0luZm8sIGZ1bmN0aW9uKHNlY3RvckluZm8sIGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgcGVyY2VudFZhbHVlID0gc2VjdG9ySW5mby5wZXJjZW50VmFsdWUsXG4gICAgICAgICAgICAgICAgY29sb3IgPSBjb2xvcnNbaW5kZXhdLFxuICAgICAgICAgICAgICAgIHNlY3RvciA9IHRoaXMuX3JlbmRlclNlY3Rvcih7XG4gICAgICAgICAgICAgICAgICAgIHBhcGVyOiBwYXBlcixcbiAgICAgICAgICAgICAgICAgICAgY2lyY2xlQm91bmQ6IGNpcmNsZUJvdW5kLFxuICAgICAgICAgICAgICAgICAgICBhbmdsZXM6IHNlY3RvckluZm8uYW5nbGVzLnN0YXJ0LFxuICAgICAgICAgICAgICAgICAgICBhdHRyczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsbDogY29sb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJva2U6IGNoYXJ0QmFja2dyb3VuZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICdzdHJva2Utd2lkdGgnOiAxXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5fYmluZEhvdmVyRXZlbnQoe1xuICAgICAgICAgICAgICAgIHRhcmdldDogc2VjdG9yLFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBzZWN0b3JJbmZvLnBvcHVwUG9zaXRpb24sXG4gICAgICAgICAgICAgICAgaWQ6ICcwLScgKyBpbmRleCxcbiAgICAgICAgICAgICAgICBpbkNhbGxiYWNrOiBpbkNhbGxiYWNrLFxuICAgICAgICAgICAgICAgIG91dENhbGxiYWNrOiBvdXRDYWxsYmFja1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHNlY3RvcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgc2VjdG9yOiBzZWN0b3IsXG4gICAgICAgICAgICAgICAgYW5nbGVzOiBzZWN0b3JJbmZvLmFuZ2xlcy5lbmQsXG4gICAgICAgICAgICAgICAgcGVyY2VudFZhbHVlOiBwZXJjZW50VmFsdWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICB0aGlzLnNlY3RvcnMgPSBzZWN0b3JzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgbGVnZW5kIGxpbmVzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciBwYXBlclxuICAgICAqIEBwYXJhbSB7YXJyYXkuPG9iamVjdD59IG91dGVyUG9zaXRpb25zIG91dGVyIHBvc2l0aW9uXG4gICAgICovXG4gICAgcmVuZGVyTGVnZW5kTGluZXM6IGZ1bmN0aW9uKHBhcGVyLCBvdXRlclBvc2l0aW9ucykge1xuICAgICAgICB2YXIgcGF0aHMgPSB0aGlzLl9tYWtlTGluZVBhdGhzKG91dGVyUG9zaXRpb25zKSxcbiAgICAgICAgICAgIGxlZ2VuZExpbmVzID0gbmUudXRpbC5tYXAocGF0aHMsIGZ1bmN0aW9uKHBhdGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmFwaGFlbFJlbmRlclV0aWwucmVuZGVyTGluZShwYXBlciwgcGF0aCwgJ3RyYW5zcGFyZW50JywgMSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5sZWdlbmRMaW5lcyA9IGxlZ2VuZExpbmVzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGxpbmUgcGF0aHMuXG4gICAgICogQHBhcmFtIHthcnJheS48b2JqZWN0Pn0gb3V0ZXJQb3NpdGlvbnMgb3V0ZXIgcG9zaXRpb25zXG4gICAgICogQHJldHVybnMge0FycmF5fSBsaW5lIHBhdGhzLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VMaW5lUGF0aHM6IGZ1bmN0aW9uKG91dGVyUG9zaXRpb25zKSB7XG4gICAgICAgIHZhciBwYXRocyA9IG5lLnV0aWwubWFwKG91dGVyUG9zaXRpb25zLCBmdW5jdGlvbihwb3NpdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgcmFwaGFlbFJlbmRlclV0aWwubWFrZUxpbmVQYXRoKHBvc2l0aW9ucy5zdGFydCwgcG9zaXRpb25zLm1pZGRsZSksXG4gICAgICAgICAgICAgICAgcmFwaGFlbFJlbmRlclV0aWwubWFrZUxpbmVQYXRoKHBvc2l0aW9ucy5taWRkbGUsIHBvc2l0aW9ucy5lbmQpXG4gICAgICAgICAgICBdLmpvaW4oJycpO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIHBhdGhzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBCaW5kIGhvdmVyIGV2ZW50LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50YXJnZXQgcmFwaGFlbCBpdGVtXG4gICAgICogICAgICBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gcGFyYW1zLnBvc2l0aW9uIHBvc2l0aW9uXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLmlkIGlkXG4gICAgICogICAgICBAcGFyYW0ge2Z1bmN0aW9ufSBwYXJhbXMuaW5DYWxsYmFjayBpbiBjYWxsYmFja1xuICAgICAqICAgICAgQHBhcmFtIHtmdW5jdGlvbn0gcGFyYW1zLm91dENhbGxiYWNrIG91dCBjYWxsYmFja1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2JpbmRIb3ZlckV2ZW50OiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgcGFyYW1zLnRhcmdldC5tb3VzZW92ZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcGFyYW1zLmluQ2FsbGJhY2socGFyYW1zLnBvc2l0aW9uLCBwYXJhbXMuaWQpO1xuICAgICAgICB9KS5tb3VzZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBwYXJhbXMub3V0Q2FsbGJhY2socGFyYW1zLmlkKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNob3cgYW5pbWF0aW9uLlxuICAgICAqIEBwYXJhbSB7e2dyb3VwSW5kZXg6IG51bWJlciwgaW5kZXg6bnVtYmVyfX0gZGF0YSBzaG93IGluZm9cbiAgICAgKi9cbiAgICBzaG93QW5pbWF0aW9uOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBzZWN0b3IgPSB0aGlzLnNlY3RvcnNbZGF0YS5pbmRleF0uc2VjdG9yLFxuICAgICAgICAgICAgY3ggPSB0aGlzLmNpcmNsZUJvdW5kLmN4LFxuICAgICAgICAgICAgY3kgPSB0aGlzLmNpcmNsZUJvdW5kLmN5O1xuICAgICAgICBzZWN0b3IuYW5pbWF0ZSh7XG4gICAgICAgICAgICB0cmFuc2Zvcm06IFwiczEuMSAxLjEgXCIgKyBjeCArIFwiIFwiICsgY3lcbiAgICAgICAgfSwgQU5JTUFUSU9OX1RJTUUsIFwiZWxhc3RpY1wiKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSGlkZSBhbmltYXRpb24uXG4gICAgICogQHBhcmFtIHt7Z3JvdXBJbmRleDogbnVtYmVyLCBpbmRleDpudW1iZXJ9fSBkYXRhIGhpZGUgaW5mb1xuICAgICAqL1xuICAgIGhpZGVBbmltYXRpb246IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIHNlY3RvciA9IHRoaXMuc2VjdG9yc1tkYXRhLmluZGV4XS5zZWN0b3I7XG4gICAgICAgIHNlY3Rvci5hbmltYXRlKHt0cmFuc2Zvcm06IFwiXCJ9LCBBTklNQVRJT05fVElNRSwgXCJlbGFzdGljXCIpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBbmltYXRlLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIGNhbGxiYWNrXG4gICAgICovXG4gICAgYW5pbWF0ZTogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGRlbGF5VGltZSA9IDAsXG4gICAgICAgICAgICBjaXJjbGVCb3VuZCA9IHRoaXMuY2lyY2xlQm91bmQ7XG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KHRoaXMuc2VjdG9ycywgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgdmFyIGFuZ2xlcyA9IGl0ZW0uYW5nbGVzLFxuICAgICAgICAgICAgICAgIGFuaW1hdGlvblRpbWUgPSBMT0FESU5HX0FOSU1BVElPTl9USU1FICogaXRlbS5wZXJjZW50VmFsdWUsXG4gICAgICAgICAgICAgICAgYW5pbSA9IFJhcGhhZWwuYW5pbWF0aW9uKHtcbiAgICAgICAgICAgICAgICAgICAgc2VjdG9yOiBbY2lyY2xlQm91bmQuY3gsIGNpcmNsZUJvdW5kLmN5LCBjaXJjbGVCb3VuZC5yLCBhbmdsZXMuc3RhcnRBbmdsZSwgYW5nbGVzLmVuZEFuZ2xlXVxuICAgICAgICAgICAgICAgIH0sIGFuaW1hdGlvblRpbWUpO1xuICAgICAgICAgICAgaXRlbS5zZWN0b3IuYW5pbWF0ZShhbmltLmRlbGF5KGRlbGF5VGltZSkpO1xuICAgICAgICAgICAgZGVsYXlUaW1lICs9IGFuaW1hdGlvblRpbWU7XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgc2V0VGltZW91dChjYWxsYmFjaywgZGVsYXlUaW1lKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBbmltYXRlIGxlZ2VuZCBsaW5lcy5cbiAgICAgKi9cbiAgICBhbmltYXRlTGVnZW5kTGluZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXRoaXMubGVnZW5kTGluZXMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBuZS51dGlsLmZvckVhY2hBcnJheSh0aGlzLmxlZ2VuZExpbmVzLCBmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICBsaW5lLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgICdzdHJva2UnOiAnYmxhY2snLFxuICAgICAgICAgICAgICAgICdzdHJva2Utb3BhY2l0eSc6IDFcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSYXBoYWVsUGllQ2hhcnQ7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgVXRpbCBmb3IgcmFwaGFlbCByZW5kZXJpbmcuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVXRpbCBmb3IgcmFwaGFlbCByZW5kZXJpbmcuXG4gKiBAbW9kdWxlIHJhcGhhZWxSZW5kZXJVdGlsXG4gKi9cbnZhciByYXBoYWVsUmVuZGVyVXRpbCA9IHtcbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGxpbmUgcGF0aC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOnJhcGhhZWxSZW5kZXJVdGlsXG4gICAgICogQHBhcmFtIHt7dG9wOiBudW1iZXIsIGxlZnQ6IG51bWJlcn19IGZyb21Qb3MgZnJvbSBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7e3RvcDogbnVtYmVyLCBsZWZ0OiBudW1iZXJ9fSB0b1BvcyB0byBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aCB3aWR0aFxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IHBhdGhcbiAgICAgKi9cbiAgICBtYWtlTGluZVBhdGg6IGZ1bmN0aW9uKGZyb21Qb3MsIHRvUG9zLCB3aWR0aCkge1xuICAgICAgICB2YXIgZnJvbVBvaW50ID0gW2Zyb21Qb3MubGVmdCwgZnJvbVBvcy50b3BdLFxuICAgICAgICAgICAgdG9Qb2ludCA9IFt0b1Bvcy5sZWZ0LCB0b1Bvcy50b3BdO1xuXG4gICAgICAgIHdpZHRoID0gd2lkdGggfHwgMTtcblxuICAgICAgICBuZS51dGlsLmZvckVhY2hBcnJheShmcm9tUG9pbnQsIGZ1bmN0aW9uKGZyb20sIGluZGV4KSB7XG4gICAgICAgICAgICBpZiAoZnJvbSA9PT0gdG9Qb2ludFtpbmRleF0pIHtcbiAgICAgICAgICAgICAgICBmcm9tUG9pbnRbaW5kZXhdID0gdG9Qb2ludFtpbmRleF0gPSBNYXRoLnJvdW5kKGZyb20pIC0gKHdpZHRoICUgMiAvIDIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuICdNJyArIGZyb21Qb2ludC5qb2luKCcgJykgKyAnTCcgKyB0b1BvaW50LmpvaW4oJyAnKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGxpbmUuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpyYXBoYWVsUmVuZGVyVXRpbFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGggbGluZSBwYXRoXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbG9yIGxpbmUgY29sb3JcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3Ryb2tlV2lkdGggc3Ryb2tlIHdpZHRoXG4gICAgICogQHJldHVybnMge29iamVjdH0gcmFwaGFlbCBsaW5lXG4gICAgICovXG4gICAgcmVuZGVyTGluZTogZnVuY3Rpb24ocGFwZXIsIHBhdGgsIGNvbG9yLCBzdHJva2VXaWR0aCkge1xuICAgICAgICB2YXIgbGluZSA9IHBhcGVyLnBhdGgoW3BhdGhdKSxcbiAgICAgICAgICAgIHN0cm9rZVN0eWxlID0ge1xuICAgICAgICAgICAgICAgIHN0cm9rZTogY29sb3IsXG4gICAgICAgICAgICAgICAgJ3N0cm9rZS13aWR0aCc6IHN0cm9rZVdpZHRoIHx8IDJcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgaWYgKGNvbG9yID09PSAndHJhbnNwYXJlbnQnKSB7XG4gICAgICAgICAgICBzdHJva2VTdHlsZS5zdHJva2UgPSAnI2ZmZic7XG4gICAgICAgICAgICBzdHJva2VTdHlsZVsnc3Ryb2tlLW9wYWNpdHknXSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgbGluZS5hdHRyKHN0cm9rZVN0eWxlKTtcblxuICAgICAgICByZXR1cm4gbGluZTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJhcGhhZWxSZW5kZXJVdGlsO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4vY29uc3QuanMnKSxcbiAgICBjaGFydEZhY3RvcnkgPSByZXF1aXJlKCcuL2ZhY3Rvcmllcy9jaGFydEZhY3RvcnkuanMnKSxcbiAgICBCYXJDaGFydCA9IHJlcXVpcmUoJy4vY2hhcnRzL2JhckNoYXJ0LmpzJyksXG4gICAgQ29sdW1uQ2hhcnQgPSByZXF1aXJlKCcuL2NoYXJ0cy9jb2x1bW5DaGFydC5qcycpLFxuICAgIExpbmVDaGFydCA9IHJlcXVpcmUoJy4vY2hhcnRzL2xpbmVDaGFydC5qcycpLFxuICAgIEFyZWFDaGFydCA9IHJlcXVpcmUoJy4vY2hhcnRzL2FyZWFDaGFydC5qcycpLFxuICAgIENvbWJvQ2hhcnQgPSByZXF1aXJlKCcuL2NoYXJ0cy9jb21ib0NoYXJ0LmpzJyksXG4gICAgUGllQ2hhcnQgPSByZXF1aXJlKCcuL2NoYXJ0cy9waWVDaGFydC5qcycpO1xuXG5jaGFydEZhY3RvcnkucmVnaXN0ZXIoY2hhcnRDb25zdC5DSEFSVF9UWVBFX0JBUiwgQmFyQ2hhcnQpO1xuY2hhcnRGYWN0b3J5LnJlZ2lzdGVyKGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9DT0xVTU4sIENvbHVtbkNoYXJ0KTtcbmNoYXJ0RmFjdG9yeS5yZWdpc3RlcihjaGFydENvbnN0LkNIQVJUX1RZUEVfTElORSwgTGluZUNoYXJ0KTtcbmNoYXJ0RmFjdG9yeS5yZWdpc3RlcihjaGFydENvbnN0LkNIQVJUX1RZUEVfQVJFQSwgQXJlYUNoYXJ0KTtcbmNoYXJ0RmFjdG9yeS5yZWdpc3RlcihjaGFydENvbnN0LkNIQVJUX1RZUEVfQ09NQk8sIENvbWJvQ2hhcnQpO1xuY2hhcnRGYWN0b3J5LnJlZ2lzdGVyKGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9QSUUsIFBpZUNoYXJ0KTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuL2NvbnN0LmpzJyksXG4gICAgdGhlbWVGYWN0b3J5ID0gcmVxdWlyZSgnLi9mYWN0b3JpZXMvdGhlbWVGYWN0b3J5LmpzJyksXG4gICAgZGVmYXVsdFRoZW1lID0gcmVxdWlyZSgnLi90aGVtZXMvZGVmYXVsdFRoZW1lLmpzJyk7XG5cbnRoZW1lRmFjdG9yeS5yZWdpc3RlcihjaGFydENvbnN0LkRFRkFVTFRfVEhFTUVfTkFNRSwgZGVmYXVsdFRoZW1lKTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBBcmVhIGNoYXJ0IHNlcmllcyBjb21wb25lbnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTZXJpZXMgPSByZXF1aXJlKCcuL3Nlcmllcy5qcycpLFxuICAgIExpbmVUeXBlU2VyaWVzQmFzZSA9IHJlcXVpcmUoJy4vbGluZVR5cGVTZXJpZXNCYXNlLmpzJyk7XG5cbnZhciBBcmVhQ2hhcnRTZXJpZXMgPSBuZS51dGlsLmRlZmluZUNsYXNzKFNlcmllcywgLyoqIEBsZW5kcyBBcmVhQ2hhcnRTZXJpZXMucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBBcmVhIGNoYXJ0IHNlcmllcyBjb21wb25lbnQuXG4gICAgICogQGNvbnN0cnVjdHMgQXJlYUNoYXJ0U2VyaWVzXG4gICAgICogQGV4dGVuZHMgU2VyaWVzXG4gICAgICogQG1peGVzIExpbmVUeXBlU2VyaWVzQmFzZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5tb2RlbCBzZXJpZXMgbW9kZWxcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMub3B0aW9ucyBzZXJpZXMgb3B0aW9uc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBzZXJpZXMgdGhlbWVcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgU2VyaWVzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYWRkIGRhdGEuXG4gICAgICogQHJldHVybnMge29iamVjdH0gYWRkIGRhdGFcbiAgICAgKi9cbiAgICBtYWtlQWRkRGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBkaW1lbnNpb24gPSB0aGlzLmJvdW5kLmRpbWVuc2lvbixcbiAgICAgICAgICAgIHNjYWxlRGlzdGFuY2UgPSB0aGlzLmdldFNjYWxlRGlzdGFuY2VGcm9tWmVyb1BvaW50KGRpbWVuc2lvbi5oZWlnaHQsIHRoaXMuZGF0YS5zY2FsZSksXG4gICAgICAgICAgICB6ZXJvVG9wID0gc2NhbGVEaXN0YW5jZS50b01heDtcbiAgICAgICAgaWYgKHRoaXMuZGF0YS5zY2FsZS5taW4gPj0gMCAmJiAhemVyb1RvcCkge1xuICAgICAgICAgICAgemVyb1RvcCA9IGRpbWVuc2lvbi5oZWlnaHQ7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZ3JvdXBQb3NpdGlvbnM6IHRoaXMubWFrZVBvc2l0aW9ucyhkaW1lbnNpb24pLFxuICAgICAgICAgICAgemVyb1RvcDogemVyb1RvcFxuICAgICAgICB9O1xuICAgIH1cbn0pO1xuXG5MaW5lVHlwZVNlcmllc0Jhc2UubWl4aW4oQXJlYUNoYXJ0U2VyaWVzKTtcblxubW9kdWxlLmV4cG9ydHMgPSBBcmVhQ2hhcnRTZXJpZXM7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgQmFyIGNoYXJ0IHNlcmllcyBjb21wb25lbnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTZXJpZXMgPSByZXF1aXJlKCcuL3Nlcmllcy5qcycpLFxuICAgIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuLi9jb25zdC5qcycpLFxuICAgIGRvbSA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZG9tSGFuZGxlci5qcycpLFxuICAgIHJlbmRlclV0aWwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3JlbmRlclV0aWwuanMnKTtcblxudmFyIEJhckNoYXJ0U2VyaWVzID0gbmUudXRpbC5kZWZpbmVDbGFzcyhTZXJpZXMsIC8qKiBAbGVuZHMgQmFyQ2hhcnRTZXJpZXMucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBCYXIgY2hhcnQgc2VyaWVzIGNvbXBvbmVudC5cbiAgICAgKiBAY29uc3RydWN0cyBCYXJDaGFydFNlcmllc1xuICAgICAqIEBleHRlbmRzIFNlcmllc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5tb2RlbCBzZXJpZXMgbW9kZWxcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMub3B0aW9ucyBzZXJpZXMgb3B0aW9uc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBzZXJpZXMgdGhlbWVcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgU2VyaWVzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYm91bmRzIG9mIGJhciBjaGFydC5cbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6bnVtYmVyfX0gZGltZW5zaW9uIGJhciBjaGFydCBkaW1lbnNpb25cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaGlkZGVuV2lkdGggaGlkZGVuIHdpZHRoXG4gICAgICogQHJldHVybnMge2FycmF5LjxhcnJheS48b2JqZWN0Pj59IGJvdW5kc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VCb3VuZHM6IGZ1bmN0aW9uKGRpbWVuc2lvbiwgaGlkZGVuV2lkdGgpIHtcbiAgICAgICAgaGlkZGVuV2lkdGggPSBoaWRkZW5XaWR0aCB8fCAocmVuZGVyVXRpbC5pc0lFOCgpID8gMCA6IGNoYXJ0Q29uc3QuSElEREVOX1dJRFRIKTtcbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuc3RhY2tlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21ha2VOb3JtYWxCYXJCb3VuZHMoZGltZW5zaW9uLCBoaWRkZW5XaWR0aCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbWFrZVN0YWNrZWRCYXJCb3VuZHMoZGltZW5zaW9uLCBoaWRkZW5XaWR0aCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBhZGQgZGF0YS5cbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBhZGQgZGF0YVxuICAgICAqL1xuICAgIG1ha2VBZGREYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGdyb3VwQm91bmRzID0gdGhpcy5fbWFrZUJvdW5kcyh0aGlzLmJvdW5kLmRpbWVuc2lvbik7XG5cbiAgICAgICAgdGhpcy5ncm91cEJvdW5kcyA9IGdyb3VwQm91bmRzO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBncm91cEJvdW5kczogZ3JvdXBCb3VuZHNcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBib3VuZHMgb2Ygbm9ybWFsIGJhciBjaGFydC5cbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6bnVtYmVyfX0gZGltZW5zaW9uIGJhciBjaGFydCBkaW1lbnNpb25cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaGlkZGVuV2lkdGggaGlkZGVuIHdpZHRoXG4gICAgICogQHJldHVybnMge2FycmF5LjxhcnJheS48b2JqZWN0Pj59IGJvdW5kc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VOb3JtYWxCYXJCb3VuZHM6IGZ1bmN0aW9uKGRpbWVuc2lvbiwgaGlkZGVuV2lkdGgpIHtcbiAgICAgICAgdmFyIGdyb3VwVmFsdWVzID0gdGhpcy5wZXJjZW50VmFsdWVzLFxuICAgICAgICAgICAgZ3JvdXBIZWlnaHQgPSAoZGltZW5zaW9uLmhlaWdodCAvIGdyb3VwVmFsdWVzLmxlbmd0aCksXG4gICAgICAgICAgICBiYXJIZWlnaHQgPSBncm91cEhlaWdodCAvIChncm91cFZhbHVlc1swXS5sZW5ndGggKyAxKSxcbiAgICAgICAgICAgIHNjYWxlRGlzdGFuY2UgPSB0aGlzLmdldFNjYWxlRGlzdGFuY2VGcm9tWmVyb1BvaW50KGRpbWVuc2lvbi53aWR0aCwgdGhpcy5kYXRhLnNjYWxlKSxcbiAgICAgICAgICAgIGJvdW5kcyA9IG5lLnV0aWwubWFwKGdyb3VwVmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMsIGdyb3VwSW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFkZGluZ1RvcCA9IChncm91cEhlaWdodCAqIGdyb3VwSW5kZXgpICsgKGJhckhlaWdodCAvIDIpICsgaGlkZGVuV2lkdGg7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24gKHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdG9wID0gcGFkZGluZ1RvcCArIChiYXJIZWlnaHQgKiBpbmRleCksXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydExlZnQgPSAtY2hhcnRDb25zdC5ISURERU5fV0lEVEgsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmRMZWZ0ID0gc3RhcnRMZWZ0LFxuICAgICAgICAgICAgICAgICAgICAgICAgYmFyV2lkdGggPSB2YWx1ZSAqIGRpbWVuc2lvbi53aWR0aDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFyV2lkdGggKj0gLTE7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydExlZnQgKz0gc2NhbGVEaXN0YW5jZS50b01pbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZExlZnQgKz0gc2NhbGVEaXN0YW5jZS50b01pbiAtIGJhcldpZHRoO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRMZWZ0ICs9IHNjYWxlRGlzdGFuY2UudG9NaW47XG4gICAgICAgICAgICAgICAgICAgICAgICBlbmRMZWZ0ICs9IHNjYWxlRGlzdGFuY2UudG9NaW47XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3A6IHRvcCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiBzdGFydExlZnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBiYXJIZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3A6IHRvcCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiBlbmRMZWZ0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiBiYXJXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IGJhckhlaWdodFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBib3VuZHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYm91bmRzIG9mIHN0YWNrZWQgYmFyIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDpudW1iZXJ9fSBkaW1lbnNpb24gYmFyIGNoYXJ0IGRpbWVuc2lvblxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBoaWRkZW5XaWR0aCBoaWRkZW4gd2lkdGhcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gYm91bmRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVN0YWNrZWRCYXJCb3VuZHM6IGZ1bmN0aW9uKGRpbWVuc2lvbiwgaGlkZGVuV2lkdGgpIHtcbiAgICAgICAgdmFyIGdyb3VwVmFsdWVzID0gdGhpcy5wZXJjZW50VmFsdWVzLFxuICAgICAgICAgICAgZ3JvdXBIZWlnaHQgPSAoZGltZW5zaW9uLmhlaWdodCAvIGdyb3VwVmFsdWVzLmxlbmd0aCksXG4gICAgICAgICAgICBiYXJIZWlnaHQgPSBncm91cEhlaWdodCAvIDIsXG4gICAgICAgICAgICBib3VuZHMgPSBuZS51dGlsLm1hcChncm91cFZhbHVlcywgZnVuY3Rpb24gKHZhbHVlcywgZ3JvdXBJbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciBwYWRkaW5nVG9wID0gKGdyb3VwSGVpZ2h0ICogZ3JvdXBJbmRleCkgKyAoYmFySGVpZ2h0IC8gMikgKyBoaWRkZW5XaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgbGVmdCA9IC1jaGFydENvbnN0LkhJRERFTl9XSURUSDtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHdpZHRoLCBib3VuZDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgd2lkdGggPSB2YWx1ZSAqIGRpbWVuc2lvbi53aWR0aDtcbiAgICAgICAgICAgICAgICAgICAgYm91bmQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogcGFkZGluZ1RvcCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiAtY2hhcnRDb25zdC5ISURERU5fV0lEVEgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBiYXJIZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3A6IHBhZGRpbmdUb3AsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogbGVmdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogd2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBiYXJIZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgbGVmdCA9IGxlZnQgKyB3aWR0aDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJvdW5kO1xuICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBib3VuZHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBub3JtYWwgc2VyaWVzIGxhYmVsLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtIVE1MRWxlbWVudH0gcGFyYW1zLmNvbnRhaW5lciBjb250YWluZXJcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gcGFyYW1zLmdyb3VwQm91bmRzIGdyb3VwIGJvdW5kc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48YXJyYXk+fSBwYXJhbXMuZm9ybWF0dGVkVmFsdWVzIGZvcm1hdHRlZCB2YWx1ZXNcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHNlcmllcyBsYWJlbCBhcmVhXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyTm9ybWFsU2VyaWVzTGFiZWw6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgZ3JvdXBCb3VuZHMgPSBwYXJhbXMuZ3JvdXBCb3VuZHMsXG4gICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXMgPSBwYXJhbXMuZm9ybWF0dGVkVmFsdWVzLFxuICAgICAgICAgICAgbGFiZWxIZWlnaHQgPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxIZWlnaHQoZm9ybWF0dGVkVmFsdWVzWzBdWzBdLCB0aGlzLnRoZW1lLmxhYmVsKSxcbiAgICAgICAgICAgIGVsU2VyaWVzTGFiZWxBcmVhID0gZG9tLmNyZWF0ZSgnZGl2JywgJ25lLWNoYXJ0LXNlcmllcy1sYWJlbC1hcmVhJyksXG4gICAgICAgICAgICBodG1sO1xuICAgICAgICBodG1sID0gbmUudXRpbC5tYXAocGFyYW1zLnZhbHVlcywgZnVuY3Rpb24odmFsdWVzLCBncm91cEluZGV4KSB7XG4gICAgICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgYm91bmQgPSBncm91cEJvdW5kc1tncm91cEluZGV4XVtpbmRleF0uZW5kLFxuICAgICAgICAgICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZSA9IGZvcm1hdHRlZFZhbHVlc1tncm91cEluZGV4XVtpbmRleF0sXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsV2lkdGggPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxXaWR0aChmb3JtYXR0ZWRWYWx1ZSwgdGhpcy50aGVtZS5sYWJlbCksXG4gICAgICAgICAgICAgICAgICAgIGxlZnQgPSBib3VuZC5sZWZ0LFxuICAgICAgICAgICAgICAgICAgICBsYWJlbEh0bWw7XG5cbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICBsZWZ0ICs9IGJvdW5kLndpZHRoICsgY2hhcnRDb25zdC5TRVJJRVNfTEFCRUxfUEFERElORztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsZWZ0IC09IGxhYmVsV2lkdGggKyBjaGFydENvbnN0LlNFUklFU19MQUJFTF9QQURESU5HO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsYWJlbEh0bWwgPSB0aGlzLl9tYWtlU2VyaWVzTGFiZWxIdG1sKHtcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogbGVmdCxcbiAgICAgICAgICAgICAgICAgICAgdG9wOiBib3VuZC50b3AgKyAoYm91bmQuaGVpZ2h0IC0gbGFiZWxIZWlnaHQgKyBjaGFydENvbnN0LlRFWFRfUEFERElORykgLyAyXG4gICAgICAgICAgICAgICAgfSwgZm9ybWF0dGVkVmFsdWUsIGdyb3VwSW5kZXgsIGluZGV4KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGFiZWxIdG1sO1xuICAgICAgICAgICAgfSwgdGhpcykuam9pbignJyk7XG4gICAgICAgIH0sIHRoaXMpLmpvaW4oJycpO1xuXG4gICAgICAgIGVsU2VyaWVzTGFiZWxBcmVhLmlubmVySFRNTCA9IGh0bWw7XG4gICAgICAgIHBhcmFtcy5jb250YWluZXIuYXBwZW5kQ2hpbGQoZWxTZXJpZXNMYWJlbEFyZWEpO1xuXG4gICAgICAgIHJldHVybiBlbFNlcmllc0xhYmVsQXJlYTtcbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgc3RhY2tlZCBzZXJpZXMgbGFiZWwuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge0hUTUxFbGVtZW50fSBwYXJhbXMuY29udGFpbmVyIGNvbnRhaW5lclxuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48YXJyYXk+fSBwYXJhbXMuZ3JvdXBCb3VuZHMgZ3JvdXAgYm91bmRzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IHBhcmFtcy5mb3JtYXR0ZWRWYWx1ZXMgZm9ybWF0dGVkIHZhbHVlc1xuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gc2VyaWVzIGxhYmVsIGFyZWFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJTdGFja2VkU2VyaWVzTGFiZWw6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgZ3JvdXBCb3VuZHMgPSBwYXJhbXMuZ3JvdXBCb3VuZHMsXG4gICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXMgPSBwYXJhbXMuZm9ybWF0dGVkVmFsdWVzLFxuICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zID0gcGFyYW1zLmZvcm1hdEZ1bmN0aW9ucyB8fCBbXSxcbiAgICAgICAgICAgIGVsU2VyaWVzTGFiZWxBcmVhID0gZG9tLmNyZWF0ZSgnZGl2JywgJ25lLWNoYXJ0LXNlcmllcy1sYWJlbC1hcmVhJyksXG4gICAgICAgICAgICBodG1sO1xuICAgICAgICBodG1sID0gbmUudXRpbC5tYXAocGFyYW1zLnZhbHVlcywgZnVuY3Rpb24odmFsdWVzLCBncm91cEluZGV4KSB7XG4gICAgICAgICAgICB2YXIgdG90YWwgPSAwLFxuICAgICAgICAgICAgICAgIGxhYmVsSGVpZ2h0ID0gcmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsSGVpZ2h0KGZvcm1hdHRlZFZhbHVlc1swXVswXSwgdGhpcy50aGVtZS5sYWJlbCksXG4gICAgICAgICAgICAgICAgbGFiZWxIdG1scywgbGFzdExlZnQsIGxhc3RUb3AsIGZucztcbiAgICAgICAgICAgIGxhYmVsSHRtbHMgPSBuZS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciBib3VuZCwgZm9ybWF0dGVkVmFsdWUsIGxhYmVsV2lkdGgsIGxlZnQsIHRvcCwgbGFiZWxIdG1sO1xuXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgYm91bmQgPSBncm91cEJvdW5kc1tncm91cEluZGV4XVtpbmRleF0uZW5kO1xuICAgICAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlID0gZm9ybWF0dGVkVmFsdWVzW2dyb3VwSW5kZXhdW2luZGV4XTtcbiAgICAgICAgICAgICAgICBsYWJlbFdpZHRoID0gcmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsV2lkdGgoZm9ybWF0dGVkVmFsdWUsIHRoaXMudGhlbWUubGFiZWwpO1xuICAgICAgICAgICAgICAgIGxlZnQgPSBib3VuZC5sZWZ0ICsgKGJvdW5kLndpZHRoIC0gbGFiZWxXaWR0aCkgLyAyO1xuICAgICAgICAgICAgICAgIHRvcCA9IGJvdW5kLnRvcCArIChib3VuZC5oZWlnaHQgLSBsYWJlbEhlaWdodCArIGNoYXJ0Q29uc3QuVEVYVF9QQURESU5HKSAvIDI7XG4gICAgICAgICAgICAgICAgbGFiZWxIdG1sID0gdGhpcy5fbWFrZVNlcmllc0xhYmVsSHRtbCh7XG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IGxlZnQsXG4gICAgICAgICAgICAgICAgICAgIHRvcDogdG9wXG4gICAgICAgICAgICAgICAgfSwgZm9ybWF0dGVkVmFsdWUsIGdyb3VwSW5kZXgsIGluZGV4KTtcbiAgICAgICAgICAgICAgICBsYXN0TGVmdCA9IGJvdW5kLmxlZnQgKyBib3VuZC53aWR0aDtcbiAgICAgICAgICAgICAgICBsYXN0VG9wID0gdG9wO1xuICAgICAgICAgICAgICAgIHRvdGFsICs9IHZhbHVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBsYWJlbEh0bWw7XG4gICAgICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zdGFja2VkID09PSAnbm9ybWFsJykge1xuICAgICAgICAgICAgICAgIGZucyA9IFt0b3RhbF0uY29uY2F0KGZvcm1hdEZ1bmN0aW9ucyk7XG4gICAgICAgICAgICAgICAgdG90YWwgPSBuZS51dGlsLnJlZHVjZShmbnMsIGZ1bmN0aW9uKHN0b3JlZCwgZm4pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZuKHN0b3JlZCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgbGFiZWxIdG1scy5wdXNoKHRoaXMuX21ha2VTZXJpZXNMYWJlbEh0bWwoe1xuICAgICAgICAgICAgICAgICAgICBsZWZ0OiBsYXN0TGVmdCArIGNoYXJ0Q29uc3QuU0VSSUVTX0xBQkVMX1BBRERJTkcsXG4gICAgICAgICAgICAgICAgICAgIHRvcDogbGFzdFRvcFxuICAgICAgICAgICAgICAgIH0sIHRvdGFsLCAtMSwgLTEpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBsYWJlbEh0bWxzLmpvaW4oJycpO1xuICAgICAgICB9LCB0aGlzKS5qb2luKCcnKTtcblxuICAgICAgICBlbFNlcmllc0xhYmVsQXJlYS5pbm5lckhUTUwgPSBodG1sO1xuICAgICAgICBwYXJhbXMuY29udGFpbmVyLmFwcGVuZENoaWxkKGVsU2VyaWVzTGFiZWxBcmVhKTtcblxuICAgICAgICByZXR1cm4gZWxTZXJpZXNMYWJlbEFyZWE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBzZXJpZXMgbGFiZWwuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge0hUTUxFbGVtZW50fSBwYXJhbXMuY29udGFpbmVyIGNvbnRhaW5lclxuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48YXJyYXk+fSBwYXJhbXMuZ3JvdXBCb3VuZHMgZ3JvdXAgYm91bmRzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IHBhcmFtcy5mb3JtYXR0ZWRWYWx1ZXMgZm9ybWF0dGVkIHZhbHVlc1xuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gc2VyaWVzIGxhYmVsIGFyZWFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJTZXJpZXNMYWJlbDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBlbFNlcmllc0xhYmVsQXJlYTtcblxuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5zaG93TGFiZWwpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zdGFja2VkKSB7XG4gICAgICAgICAgICBlbFNlcmllc0xhYmVsQXJlYSA9IHRoaXMuX3JlbmRlclN0YWNrZWRTZXJpZXNMYWJlbChwYXJhbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZWxTZXJpZXNMYWJlbEFyZWEgPSB0aGlzLl9yZW5kZXJOb3JtYWxTZXJpZXNMYWJlbChwYXJhbXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbFNlcmllc0xhYmVsQXJlYTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGJvdW5kLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBncm91cEluZGV4IGdyb3VwIGluZGV4XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IGluZGV4XG4gICAgICogQHJldHVybnMge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gYm91bmRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRCb3VuZDogZnVuY3Rpb24oZ3JvdXBJbmRleCwgaW5kZXgpIHtcbiAgICAgICAgaWYgKGdyb3VwSW5kZXggPT09IC0xIHx8IGluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZ3JvdXBCb3VuZHNbZ3JvdXBJbmRleF1baW5kZXhdLmVuZDtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBCYXJDaGFydFNlcmllcztcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBDb2x1bW4gY2hhcnQgc2VyaWVzIGNvbXBvbmVudC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFNlcmllcyA9IHJlcXVpcmUoJy4vc2VyaWVzLmpzJyksXG4gICAgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4uL2NvbnN0LmpzJyksXG4gICAgZG9tID0gcmVxdWlyZSgnLi4vaGVscGVycy9kb21IYW5kbGVyLmpzJyksXG4gICAgcmVuZGVyVXRpbCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvcmVuZGVyVXRpbC5qcycpO1xuXG52YXIgQ29sdW1uQ2hhcnRTZXJpZXMgPSBuZS51dGlsLmRlZmluZUNsYXNzKFNlcmllcywgLyoqIEBsZW5kcyBDb2x1bW5DaGFydFNlcmllcy5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIENvbHVtbiBjaGFydCBzZXJpZXMgY29tcG9uZW50LlxuICAgICAqIEBjb25zdHJ1Y3RzIENvbHVtbkNoYXJ0U2VyaWVzXG4gICAgICogQGV4dGVuZHMgU2VyaWVzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm1vZGVsIHNlcmllcyBtb2RlbFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5vcHRpb25zIHNlcmllcyBvcHRpb25zXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIHNlcmllcyB0aGVtZVxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBTZXJpZXMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBib3VuZHMgb2YgY29sdW1uIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDpudW1iZXJ9fSBkaW1lbnNpb24gY29sdW1uIGNoYXJ0IGRpbWVuc2lvblxuICAgICAqIEByZXR1cm5zIHthcnJheS48YXJyYXkuPG9iamVjdD4+fSBib3VuZHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQm91bmRzOiBmdW5jdGlvbihkaW1lbnNpb24pIHtcbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuc3RhY2tlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21ha2VOb3JtYWxDb2x1bW5Cb3VuZHMoZGltZW5zaW9uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9tYWtlU3RhY2tlZENvbHVtbkJvdW5kcyhkaW1lbnNpb24pO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYWRkIGRhdGEuXG4gICAgICogQHJldHVybnMge29iamVjdH0gYWRkIGRhdGFcbiAgICAgKi9cbiAgICBtYWtlQWRkRGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBncm9wdUJvdW5kcyA9IHRoaXMuX21ha2VCb3VuZHModGhpcy5ib3VuZC5kaW1lbnNpb24pO1xuXG4gICAgICAgIHRoaXMuZ3JvdXBCb3VuZHMgPSBncm9wdUJvdW5kcztcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZ3JvdXBCb3VuZHM6IGdyb3B1Qm91bmRzXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYm91bmRzIG9mIG5vcm1hbCBjb2x1bW4gY2hhcnQuXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0Om51bWJlcn19IGRpbWVuc2lvbiBjb2x1bW4gY2hhcnQgZGltZW5zaW9uXG4gICAgICogQHJldHVybnMge2FycmF5LjxhcnJheS48b2JqZWN0Pj59IGJvdW5kc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VOb3JtYWxDb2x1bW5Cb3VuZHM6IGZ1bmN0aW9uKGRpbWVuc2lvbikge1xuICAgICAgICB2YXIgZ3JvdXBWYWx1ZXMgPSB0aGlzLnBlcmNlbnRWYWx1ZXMsXG4gICAgICAgICAgICBncm91cFdpZHRoID0gKGRpbWVuc2lvbi53aWR0aCAvIGdyb3VwVmFsdWVzLmxlbmd0aCksXG4gICAgICAgICAgICBiYXJXaWR0aCA9IGdyb3VwV2lkdGggLyAoZ3JvdXBWYWx1ZXNbMF0ubGVuZ3RoICsgMSksXG4gICAgICAgICAgICBpc01pbnVzID0gdGhpcy5kYXRhLnNjYWxlLm1pbiA8IDAgJiYgdGhpcy5kYXRhLnNjYWxlLm1heCA8PSAwLFxuICAgICAgICAgICAgc2NhbGVEaXN0YW5jZSA9IHRoaXMuZ2V0U2NhbGVEaXN0YW5jZUZyb21aZXJvUG9pbnQoZGltZW5zaW9uLmhlaWdodCwgdGhpcy5kYXRhLnNjYWxlKSxcbiAgICAgICAgICAgIGJvdW5kcyA9IG5lLnV0aWwubWFwKGdyb3VwVmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMsIGdyb3VwSW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFkZGluZ0xlZnQgPSAoZ3JvdXBXaWR0aCAqIGdyb3VwSW5kZXgpICsgKGJhcldpZHRoIC8gMik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24gKHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYmFySGVpZ2h0ID0gdmFsdWUgKiBkaW1lbnNpb24uaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kVG9wID0gZGltZW5zaW9uLmhlaWdodCAtIGJhckhlaWdodCArIGNoYXJ0Q29uc3QuSElEREVOX1dJRFRILFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRUb3AgPSBlbmRUb3AgKyBiYXJIZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0ID0gcGFkZGluZ0xlZnQgKyAoYmFyV2lkdGggKiBpbmRleCkgLSBjaGFydENvbnN0LkhJRERFTl9XSURUSDtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNNaW51cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFySGVpZ2h0ICo9IC0xO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRUb3AgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgZW5kVG9wID0gMDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZSA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhckhlaWdodCAqPSAtMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0VG9wID0gZW5kVG9wID0gZGltZW5zaW9uLmhlaWdodCAtIHNjYWxlRGlzdGFuY2UudG9NaW47XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydFRvcCAtPSBzY2FsZURpc3RhbmNlLnRvTWluO1xuICAgICAgICAgICAgICAgICAgICAgICAgZW5kVG9wIC09IHNjYWxlRGlzdGFuY2UudG9NaW47XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3A6IHN0YXJ0VG9wLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6IGxlZnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGJhcldpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogMFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogZW5kVG9wLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6IGxlZnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGJhcldpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogYmFySGVpZ2h0XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIGJvdW5kcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBib3VuZHMgb2Ygc3RhY2tlZCBjb2x1bW4gY2hhcnQuXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0Om51bWJlcn19IGRpbWVuc2lvbiBjb2x1bW4gY2hhcnQgZGltZW5zaW9uXG4gICAgICogQHJldHVybnMge2FycmF5LjxhcnJheS48b2JqZWN0Pj59IGJvdW5kc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VTdGFja2VkQ29sdW1uQm91bmRzOiBmdW5jdGlvbihkaW1lbnNpb24pIHtcbiAgICAgICAgdmFyIGdyb3VwVmFsdWVzID0gdGhpcy5wZXJjZW50VmFsdWVzLFxuICAgICAgICAgICAgZ3JvdXBXaWR0aCA9IChkaW1lbnNpb24ud2lkdGggLyBncm91cFZhbHVlcy5sZW5ndGgpLFxuICAgICAgICAgICAgYmFyV2lkdGggPSBncm91cFdpZHRoIC8gMixcbiAgICAgICAgICAgIGJvdW5kcyA9IG5lLnV0aWwubWFwKGdyb3VwVmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMsIGdyb3VwSW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFkZGluZ0xlZnQgPSAoZ3JvdXBXaWR0aCAqIGdyb3VwSW5kZXgpICsgKGJhcldpZHRoIC8gMiksXG4gICAgICAgICAgICAgICAgICAgIHRvcCA9IDA7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBoZWlnaHQsIGJvdW5kO1xuICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQgPSB2YWx1ZSAqIGRpbWVuc2lvbi5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgIGJvdW5kID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3A6IGRpbWVuc2lvbi5oZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogcGFkZGluZ0xlZnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGJhcldpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogMFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogZGltZW5zaW9uLmhlaWdodCAtIGhlaWdodCAtIHRvcCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiBwYWRkaW5nTGVmdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogYmFyV2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBoZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgdG9wICs9IGhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJvdW5kO1xuICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBib3VuZHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBub3JtYWwgc2VyaWVzIGxhYmVsLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtIVE1MRWxlbWVudH0gcGFyYW1zLmNvbnRhaW5lciBjb250YWluZXJcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gcGFyYW1zLmdyb3VwQm91bmRzIGdyb3VwIGJvdW5kc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48YXJyYXk+fSBwYXJhbXMuZm9ybWF0dGVkVmFsdWVzIGZvcm1hdHRlZCB2YWx1ZXNcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHNlcmllcyBsYWJlbCBhcmVhXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyTm9ybWFsU2VyaWVzTGFiZWw6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgZ3JvdXBCb3VuZHMgPSBwYXJhbXMuZ3JvdXBCb3VuZHMsXG4gICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXMgPSBwYXJhbXMuZm9ybWF0dGVkVmFsdWVzLFxuICAgICAgICAgICAgbGFiZWxIZWlnaHQgPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxIZWlnaHQoZm9ybWF0dGVkVmFsdWVzWzBdWzBdLCB0aGlzLnRoZW1lLmxhYmVsKSxcbiAgICAgICAgICAgIGVsU2VyaWVzTGFiZWxBcmVhID0gZG9tLmNyZWF0ZSgnZGl2JywgJ25lLWNoYXJ0LXNlcmllcy1sYWJlbC1hcmVhJyksXG4gICAgICAgICAgICBodG1sO1xuICAgICAgICBodG1sID0gbmUudXRpbC5tYXAocGFyYW1zLnZhbHVlcywgZnVuY3Rpb24odmFsdWVzLCBncm91cEluZGV4KSB7XG4gICAgICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgYm91bmQgPSBncm91cEJvdW5kc1tncm91cEluZGV4XVtpbmRleF0uZW5kLFxuICAgICAgICAgICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZSA9IGZvcm1hdHRlZFZhbHVlc1tncm91cEluZGV4XVtpbmRleF0sXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsV2lkdGggPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxXaWR0aChmb3JtYXR0ZWRWYWx1ZSwgdGhpcy50aGVtZS5sYWJlbCksXG4gICAgICAgICAgICAgICAgICAgIHRvcCA9IGJvdW5kLnRvcCxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxIdG1sO1xuXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdG9wIC09IGxhYmVsSGVpZ2h0ICsgY2hhcnRDb25zdC5TRVJJRVNfTEFCRUxfUEFERElORztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0b3AgKz0gYm91bmQuaGVpZ2h0ICsgY2hhcnRDb25zdC5TRVJJRVNfTEFCRUxfUEFERElORztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsYWJlbEh0bWwgPSB0aGlzLl9tYWtlU2VyaWVzTGFiZWxIdG1sKHtcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogYm91bmQubGVmdCArIChib3VuZC53aWR0aCAtIGxhYmVsV2lkdGgpIC8gMixcbiAgICAgICAgICAgICAgICAgICAgdG9wOiB0b3BcbiAgICAgICAgICAgICAgICB9LCBmb3JtYXR0ZWRWYWx1ZSwgZ3JvdXBJbmRleCwgaW5kZXgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBsYWJlbEh0bWw7XG4gICAgICAgICAgICB9LCB0aGlzKS5qb2luKCcnKTtcbiAgICAgICAgfSwgdGhpcykuam9pbignJyk7XG5cbiAgICAgICAgZWxTZXJpZXNMYWJlbEFyZWEuaW5uZXJIVE1MID0gaHRtbDtcbiAgICAgICAgcGFyYW1zLmNvbnRhaW5lci5hcHBlbmRDaGlsZChlbFNlcmllc0xhYmVsQXJlYSk7XG5cbiAgICAgICAgcmV0dXJuIGVsU2VyaWVzTGFiZWxBcmVhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHN1bSBsYWJlbCBodG1sLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48bnVtYmVyPn0gcGFyYW1zLnZhbHVlcyB2YWx1ZXNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPGZ1bmN0aW9uPn0gcGFyYW1zLmZvcm1hdEZ1bmN0aW9ucyBmb3JtYXR0aW5nIGZ1bmN0aW9uc1xuICAgICAqICAgICAgQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IHBhcmFtcy5ib3VuZCBib3VuZFxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5sYWJlbEhlaWdodCBsYWJlbCBoZWlnaHRcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBzdW0gbGFiZWwgaHRtbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VTdW1MYWJlbEh0bWw6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgc3VtID0gbmUudXRpbC5zdW0ocGFyYW1zLnZhbHVlcyksXG4gICAgICAgICAgICBmbnMgPSBbc3VtXS5jb25jYXQocGFyYW1zLmZvcm1hdEZ1bmN0aW9ucyksXG4gICAgICAgICAgICBib3VuZCA9IHBhcmFtcy5ib3VuZCxcbiAgICAgICAgICAgIGxlZnQgPSBib3VuZC5sZWZ0ICsgKGJvdW5kLndpZHRoIC8gMiksXG4gICAgICAgICAgICB0b3RhbExhYmVsV2lkdGg7XG5cbiAgICAgICAgc3VtID0gbmUudXRpbC5yZWR1Y2UoZm5zLCBmdW5jdGlvbihzdG9yZWQsIGZuKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4oc3RvcmVkKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdG90YWxMYWJlbFdpZHRoID0gcmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsV2lkdGgoc3VtLCB0aGlzLnRoZW1lLmxhYmVsKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5fbWFrZVNlcmllc0xhYmVsSHRtbCh7XG4gICAgICAgICAgICBsZWZ0OiBsZWZ0IC0gKHRvdGFsTGFiZWxXaWR0aCAtIGNoYXJ0Q29uc3QuVEVYVF9QQURESU5HKSAvIDIsXG4gICAgICAgICAgICB0b3A6IGJvdW5kLnRvcCAtIHBhcmFtcy5sYWJlbEhlaWdodCAtIGNoYXJ0Q29uc3QuU0VSSUVTX0xBQkVMX1BBRERJTkdcbiAgICAgICAgfSwgc3VtLCAtMSwgLTEpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHN0YWNrZWQgbGFiZWxzIGh0bWwuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmdyb3VwSW5kZXggZ3JvdXAgaW5kZXhcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPG51bWJlcj59IHBhcmFtcy52YWx1ZXMgdmFsdWVzLFxuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48ZnVuY3Rpb24+fSBwYXJhbXMuZm9ybWF0RnVuY3Rpb25zIGZvcm1hdHRpbmcgZnVuY3Rpb25zLFxuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48b2JqZWN0Pn0gcGFyYW1zLmJvdW5kcyBib3VuZHMsXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5fSBwYXJhbXMuZm9ybWF0dGVkVmFsdWVzIGZvcm1hdHRlZCB2YWx1ZXMsXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmxhYmVsSGVpZ2h0IGxhYmVsIGhlaWdodFxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGxhYmVscyBodG1sXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVN0YWNrZWRMYWJlbHNIdG1sOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIHZhbHVlcyA9IHBhcmFtcy52YWx1ZXMsXG4gICAgICAgICAgICBib3VuZCwgaHRtbHM7XG5cbiAgICAgICAgaHRtbHMgPSBuZS51dGlsLm1hcChwYXJhbXMudmFsdWVzLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBsYWJlbFdpZHRoLCBsZWZ0LCB0b3AsIGxhYmVsSHRtbCwgZm9ybWF0dGVkVmFsdWU7XG5cbiAgICAgICAgICAgIGlmICh2YWx1ZSA8IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGJvdW5kID0gcGFyYW1zLmJvdW5kc1tpbmRleF0uZW5kO1xuICAgICAgICAgICAgZm9ybWF0dGVkVmFsdWUgPSBwYXJhbXMuZm9ybWF0dGVkVmFsdWVzW2luZGV4XTtcbiAgICAgICAgICAgIGxhYmVsV2lkdGggPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxXaWR0aChmb3JtYXR0ZWRWYWx1ZSwgdGhpcy50aGVtZS5sYWJlbCk7XG4gICAgICAgICAgICBsZWZ0ID0gYm91bmQubGVmdCArICgoYm91bmQud2lkdGggLSBsYWJlbFdpZHRoICsgY2hhcnRDb25zdC5URVhUX1BBRERJTkcpIC8gMik7XG4gICAgICAgICAgICB0b3AgPSBib3VuZC50b3AgKyAoKGJvdW5kLmhlaWdodCAtIHBhcmFtcy5sYWJlbEhlaWdodCArIGNoYXJ0Q29uc3QuVEVYVF9QQURESU5HKSAvIDIpO1xuICAgICAgICAgICAgbGFiZWxIdG1sID0gdGhpcy5fbWFrZVNlcmllc0xhYmVsSHRtbCh7XG4gICAgICAgICAgICAgICAgbGVmdDogbGVmdCxcbiAgICAgICAgICAgICAgICB0b3A6IHRvcFxuICAgICAgICAgICAgfSwgZm9ybWF0dGVkVmFsdWUsIHBhcmFtcy5ncm91cEluZGV4LCBpbmRleCk7XG4gICAgICAgICAgICByZXR1cm4gbGFiZWxIdG1sO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnN0YWNrZWQgPT09ICdub3JtYWwnKSB7XG4gICAgICAgICAgICBodG1scy5wdXNoKHRoaXMuX21ha2VTdW1MYWJlbEh0bWwoe1xuICAgICAgICAgICAgICAgIHZhbHVlczogdmFsdWVzLFxuICAgICAgICAgICAgICAgIGZvcm1hdEZ1bmN0aW9uczogcGFyYW1zLmZvcm1hdEZ1bmN0aW9ucyxcbiAgICAgICAgICAgICAgICBib3VuZDogYm91bmQsXG4gICAgICAgICAgICAgICAgbGFiZWxIZWlnaHQ6IHBhcmFtcy5sYWJlbEhlaWdodFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBodG1scy5qb2luKCcnKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIHN0YWNrZWQgc2VyaWVzIGxhYmVsLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtIVE1MRWxlbWVudH0gcGFyYW1zLmNvbnRhaW5lciBjb250YWluZXJcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gcGFyYW1zLmdyb3VwQm91bmRzIGdyb3VwIGJvdW5kc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48YXJyYXk+fSBwYXJhbXMuZm9ybWF0dGVkVmFsdWVzIGZvcm1hdHRlZCB2YWx1ZXNcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHNlcmllcyBsYWJlbCBhcmVhXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyU3RhY2tlZFNlcmllc0xhYmVsOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGdyb3VwQm91bmRzID0gcGFyYW1zLmdyb3VwQm91bmRzLFxuICAgICAgICAgICAgZm9ybWF0dGVkVmFsdWVzID0gcGFyYW1zLmZvcm1hdHRlZFZhbHVlcyxcbiAgICAgICAgICAgIGZvcm1hdEZ1bmN0aW9ucyA9IHBhcmFtcy5mb3JtYXRGdW5jdGlvbnMgfHwgW10sXG4gICAgICAgICAgICBlbFNlcmllc0xhYmVsQXJlYSA9IGRvbS5jcmVhdGUoJ2RpdicsICduZS1jaGFydC1zZXJpZXMtbGFiZWwtYXJlYScpLFxuICAgICAgICAgICAgbGFiZWxIZWlnaHQgPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxIZWlnaHQoZm9ybWF0dGVkVmFsdWVzWzBdWzBdLCB0aGlzLnRoZW1lLmxhYmVsKSxcbiAgICAgICAgICAgIGh0bWw7XG5cbiAgICAgICAgaHRtbCA9IG5lLnV0aWwubWFwKHBhcmFtcy52YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcywgaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBsYWJlbHNIdG1sID0gdGhpcy5fbWFrZVN0YWNrZWRMYWJlbHNIdG1sKHtcbiAgICAgICAgICAgICAgICAgICAgZ3JvdXBJbmRleDogaW5kZXgsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlczogdmFsdWVzLFxuICAgICAgICAgICAgICAgICAgICBmb3JtYXRGdW5jdGlvbnM6IGZvcm1hdEZ1bmN0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgYm91bmRzOiBncm91cEJvdW5kc1tpbmRleF0sXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlczogZm9ybWF0dGVkVmFsdWVzW2luZGV4XSxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxIZWlnaHQ6IGxhYmVsSGVpZ2h0XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gbGFiZWxzSHRtbDtcbiAgICAgICAgfSwgdGhpcykuam9pbignJyk7XG5cbiAgICAgICAgZWxTZXJpZXNMYWJlbEFyZWEuaW5uZXJIVE1MID0gaHRtbDtcbiAgICAgICAgcGFyYW1zLmNvbnRhaW5lci5hcHBlbmRDaGlsZChlbFNlcmllc0xhYmVsQXJlYSk7XG5cbiAgICAgICAgcmV0dXJuIGVsU2VyaWVzTGFiZWxBcmVhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgc2VyaWVzIGxhYmVsLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtIVE1MRWxlbWVudH0gcGFyYW1zLmNvbnRhaW5lciBjb250YWluZXJcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gcGFyYW1zLmdyb3VwQm91bmRzIGdyb3VwIGJvdW5kc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48YXJyYXk+fSBwYXJhbXMuZm9ybWF0dGVkVmFsdWVzIGZvcm1hdHRlZCB2YWx1ZXNcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHNlcmllcyBsYWJlbCBhcmVhXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyU2VyaWVzTGFiZWw6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgZWxTZXJpZXNMYWJlbEFyZWE7XG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLnNob3dMYWJlbCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnN0YWNrZWQpIHtcbiAgICAgICAgICAgIGVsU2VyaWVzTGFiZWxBcmVhID0gdGhpcy5fcmVuZGVyU3RhY2tlZFNlcmllc0xhYmVsKHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbFNlcmllc0xhYmVsQXJlYSA9IHRoaXMuX3JlbmRlck5vcm1hbFNlcmllc0xhYmVsKHBhcmFtcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVsU2VyaWVzTGFiZWxBcmVhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgYm91bmQuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGdyb3VwSW5kZXggZ3JvdXAgaW5kZXhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggaW5kZXhcbiAgICAgKiBAcmV0dXJucyB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBib3VuZFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldEJvdW5kOiBmdW5jdGlvbihncm91cEluZGV4LCBpbmRleCkge1xuICAgICAgICBpZiAoZ3JvdXBJbmRleCA9PT0gLTEgfHwgaW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5ncm91cEJvdW5kc1tncm91cEluZGV4XVtpbmRleF0uZW5kO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbHVtbkNoYXJ0U2VyaWVzO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IExpbmUgY2hhcnQgc2VyaWVzIGNvbXBvbmVudC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFNlcmllcyA9IHJlcXVpcmUoJy4vc2VyaWVzLmpzJyksXG4gICAgTGluZVR5cGVTZXJpZXNCYXNlID0gcmVxdWlyZSgnLi9saW5lVHlwZVNlcmllc0Jhc2UuanMnKTtcblxudmFyIExpbmVDaGFydFNlcmllcyA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoU2VyaWVzLCAvKiogQGxlbmRzIExpbmVDaGFydFNlcmllcy5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIExpbmUgY2hhcnQgc2VyaWVzIGNvbXBvbmVudC5cbiAgICAgKiBAY29uc3RydWN0cyBMaW5lQ2hhcnRTZXJpZXNcbiAgICAgKiBAZXh0ZW5kcyBTZXJpZXNcbiAgICAgKiBAbWl4ZXMgTGluZVR5cGVTZXJpZXNCYXNlXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm1vZGVsIHNlcmllcyBtb2RlbFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5vcHRpb25zIHNlcmllcyBvcHRpb25zXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIHNlcmllcyB0aGVtZVxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBTZXJpZXMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBhZGQgZGF0YS5cbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBhZGQgZGF0YVxuICAgICAqL1xuICAgIG1ha2VBZGREYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGdyb3VwUG9zaXRpb25zOiB0aGlzLm1ha2VQb3NpdGlvbnModGhpcy5ib3VuZC5kaW1lbnNpb24pXG4gICAgICAgIH07XG4gICAgfVxufSk7XG5cbkxpbmVUeXBlU2VyaWVzQmFzZS5taXhpbihMaW5lQ2hhcnRTZXJpZXMpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IExpbmVDaGFydFNlcmllcztcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBMaW5lVHlwZVNlcmllc0Jhc2UgaXMgYmFzZSBjbGFzcyBmb3IgbGluZSB0eXBlIHNlcmllcy5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFNlcmllcyA9IHJlcXVpcmUoJy4vc2VyaWVzLmpzJyksXG4gICAgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4uL2NvbnN0LmpzJyksXG4gICAgZG9tID0gcmVxdWlyZSgnLi4vaGVscGVycy9kb21IYW5kbGVyLmpzJyksXG4gICAgcmVuZGVyVXRpbCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvcmVuZGVyVXRpbC5qcycpO1xuLyoqXG4gKiBAY2xhc3NkZXNjIExpbmVUeXBlU2VyaWVzQmFzZSBpcyBiYXNlIGNsYXNzIGZvciBsaW5lIHR5cGUgc2VyaWVzLlxuICogQGNsYXNzIExpbmVUeXBlU2VyaWVzQmFzZVxuICogQG1peGluXG4gKi9cbnZhciBMaW5lVHlwZVNlcmllc0Jhc2UgPSBuZS51dGlsLmRlZmluZUNsYXNzKFNlcmllcywgLyoqIEBsZW5kcyBMaW5lVHlwZVNlcmllc0Jhc2UucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHBvc2l0aW9ucyBvZiBsaW5lIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDpudW5iZXJ9fSBkaW1lbnNpb24gbGluZSBjaGFydCBkaW1lbnNpb25cbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gcG9zaXRpb25zXG4gICAgICovXG4gICAgbWFrZVBvc2l0aW9uczogZnVuY3Rpb24oZGltZW5zaW9uKSB7XG4gICAgICAgIHZhciBncm91cFZhbHVlcyA9IHRoaXMucGVyY2VudFZhbHVlcyxcbiAgICAgICAgICAgIHdpZHRoID0gZGltZW5zaW9uLndpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0ID0gZGltZW5zaW9uLmhlaWdodCxcbiAgICAgICAgICAgIHN0ZXAgPSB3aWR0aCAvIGdyb3VwVmFsdWVzWzBdLmxlbmd0aCxcbiAgICAgICAgICAgIHN0YXJ0ID0gc3RlcCAvIDIsXG4gICAgICAgICAgICByZXN1bHQgPSBuZS51dGlsLm1hcChncm91cFZhbHVlcywgZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiBzdGFydCArIChzdGVwICogaW5kZXgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiBoZWlnaHQgLSAodmFsdWUgKiBoZWlnaHQpXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5ncm91cFBvc2l0aW9ucyA9IHJlc3VsdDtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIHNlcmllcyBsYWJlbC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHBhcmFtcy5jb250YWluZXIgY29udGFpbmVyXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IHBhcmFtcy5ncm91cFBvc2l0aW9ucyBncm91cCBwb3NpdGlvbnNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gcGFyYW1zLmZvcm1hdHRlZFZhbHVlcyBmb3JtYXR0ZWQgdmFsdWVzXG4gICAgICogQHJldHVybiB7SFRNTEVsZW1lbnR9IHNlcmllcyBhcmVhIGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJTZXJpZXNMYWJlbDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBncm91cFBvc2l0aW9ucywgbGFiZWxIZWlnaHQsIGVsU2VyaWVzTGFiZWxBcmVhLCBodG1sO1xuXG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLnNob3dMYWJlbCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBncm91cFBvc2l0aW9ucyA9IHBhcmFtcy5ncm91cFBvc2l0aW9ucztcbiAgICAgICAgbGFiZWxIZWlnaHQgPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxIZWlnaHQocGFyYW1zLmZvcm1hdHRlZFZhbHVlc1swXVswXSwgdGhpcy50aGVtZS5sYWJlbCk7XG4gICAgICAgIGVsU2VyaWVzTGFiZWxBcmVhID0gZG9tLmNyZWF0ZSgnZGl2JywgJ25lLWNoYXJ0LXNlcmllcy1sYWJlbC1hcmVhJyk7XG5cbiAgICAgICAgaHRtbCA9IG5lLnV0aWwubWFwKHBhcmFtcy5mb3JtYXR0ZWRWYWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcywgZ3JvdXBJbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdmFyIHBvc2l0aW9uID0gZ3JvdXBQb3NpdGlvbnNbZ3JvdXBJbmRleF1baW5kZXhdLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbFdpZHRoID0gcmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsV2lkdGgodmFsdWUsIHRoaXMudGhlbWUubGFiZWwpLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbEh0bWwgPSB0aGlzLl9tYWtlU2VyaWVzTGFiZWxIdG1sKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6IHBvc2l0aW9uLmxlZnQgLSAobGFiZWxXaWR0aCAvIDIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiBwb3NpdGlvbi50b3AgLSBsYWJlbEhlaWdodCAtIGNoYXJ0Q29uc3QuU0VSSUVTX0xBQkVMX1BBRERJTkdcbiAgICAgICAgICAgICAgICAgICAgfSwgdmFsdWUsIGluZGV4LCBncm91cEluZGV4KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGFiZWxIdG1sO1xuICAgICAgICAgICAgfSwgdGhpcykuam9pbignJyk7XG4gICAgICAgIH0sIHRoaXMpLmpvaW4oJycpO1xuXG4gICAgICAgIGVsU2VyaWVzTGFiZWxBcmVhLmlubmVySFRNTCA9IGh0bWw7XG4gICAgICAgIHBhcmFtcy5jb250YWluZXIuYXBwZW5kQ2hpbGQoZWxTZXJpZXNMYWJlbEFyZWEpO1xuXG4gICAgICAgIHJldHVybiBlbFNlcmllc0xhYmVsQXJlYTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGJvdW5kLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBncm91cEluZGV4IGdyb3VwIGluZGV4XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IGluZGV4XG4gICAgICogQHJldHVybnMge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gYm91bmRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRCb3VuZDogZnVuY3Rpb24oZ3JvdXBJbmRleCwgaW5kZXgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ3JvdXBQb3NpdGlvbnNbaW5kZXhdW2dyb3VwSW5kZXhdO1xuICAgIH1cbn0pO1xuXG5MaW5lVHlwZVNlcmllc0Jhc2UubWl4aW4gPSBmdW5jdGlvbihmdW5jKSB7XG4gICAgbmUudXRpbC5leHRlbmQoZnVuYy5wcm90b3R5cGUsIExpbmVUeXBlU2VyaWVzQmFzZS5wcm90b3R5cGUpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBMaW5lVHlwZVNlcmllc0Jhc2U7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgUGllIGNoYXJ0IHNlcmllcyBjb21wb25lbnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTZXJpZXMgPSByZXF1aXJlKCcuL3NlcmllcycpLFxuICAgIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuLi9jb25zdCcpLFxuICAgIGRvbSA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZG9tSGFuZGxlcicpLFxuICAgIHJlbmRlclV0aWwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3JlbmRlclV0aWwnKTtcblxudmFyIFBpZUNoYXJ0U2VyaWVzID0gbmUudXRpbC5kZWZpbmVDbGFzcyhTZXJpZXMsIC8qKiBAbGVuZHMgUGllQ2hhcnRTZXJpZXMucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBMaW5lIGNoYXJ0IHNlcmllcyBjb21wb25lbnQuXG4gICAgICogQGNvbnN0cnVjdHMgUGllQ2hhcnRTZXJpZXNcbiAgICAgKiBAZXh0ZW5kcyBTZXJpZXNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMubW9kZWwgc2VyaWVzIG1vZGVsXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgc2VyaWVzIG9wdGlvbnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgc2VyaWVzIHRoZW1lXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIFNlcmllcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHBlcmNlbnQgdmFsdWUuXG4gICAgICogQHBhcmFtIHt7dmFsdWVzOiBhcnJheSwgc2NhbGU6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fX0gZGF0YSBzZXJpZXMgZGF0YVxuICAgICAqIEByZXR1cm5zIHthcnJheS48YXJyYXkuPG51bWJlcj4+fSBwZXJjZW50IHZhbHVlc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VQZXJjZW50VmFsdWVzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBuZS51dGlsLm1hcChkYXRhLnZhbHVlcywgZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgICAgICB2YXIgc3VtID0gbmUudXRpbC5zdW0odmFsdWVzKTtcbiAgICAgICAgICAgIHJldHVybiBuZS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlIC8gc3VtO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHNlY3RvcnMgaW5mb3JtYXRpb24uXG4gICAgICogQHBhcmFtIHthcnJheS48bnVtYmVyPn0gcGVyY2VudFZhbHVlcyBwZXJjZW50IHZhbHVlc1xuICAgICAqIEBwYXJhbSB7e2N4OiBudW1iZXIsIGN5OiBudW1iZXIsIHI6IG51bWJlcn19IGNpcmNsZUJvdW5kIGNpcmNsZSBib3VuZFxuICAgICAqIEByZXR1cm5zIHthcnJheS48b2JqZWN0Pn0gc2VjdG9ycyBpbmZvcm1hdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VTZWN0b3JzSW5mbzogZnVuY3Rpb24ocGVyY2VudFZhbHVlcywgY2lyY2xlQm91bmQpIHtcbiAgICAgICAgdmFyIGN4ID0gY2lyY2xlQm91bmQuY3gsXG4gICAgICAgICAgICBjeSA9IGNpcmNsZUJvdW5kLmN5LFxuICAgICAgICAgICAgciA9IGNpcmNsZUJvdW5kLnIsXG4gICAgICAgICAgICBhbmdsZSA9IDAsXG4gICAgICAgICAgICBkZWx0YSA9IDEwLFxuICAgICAgICAgICAgcGF0aHM7XG5cbiAgICAgICAgcGF0aHMgPSBuZS51dGlsLm1hcChwZXJjZW50VmFsdWVzLCBmdW5jdGlvbihwZXJjZW50VmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBhZGRBbmdsZSA9IGNoYXJ0Q29uc3QuQU5HTEVfMzYwICogcGVyY2VudFZhbHVlLFxuICAgICAgICAgICAgICAgIGVuZEFuZ2xlID0gYW5nbGUgKyBhZGRBbmdsZSxcbiAgICAgICAgICAgICAgICBwb3B1cEFuZ2xlID0gYW5nbGUgKyAoYWRkQW5nbGUgLyAyKSxcbiAgICAgICAgICAgICAgICBhbmdsZXMgPSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydEFuZ2xlOiBhbmdsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZEFuZ2xlOiBhbmdsZVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBlbmQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0QW5nbGU6IGFuZ2xlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kQW5nbGU6IGVuZEFuZ2xlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uRGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgY3g6IGN4LFxuICAgICAgICAgICAgICAgICAgICBjeTogY3ksXG4gICAgICAgICAgICAgICAgICAgIGFuZ2xlOiBwb3B1cEFuZ2xlXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGFuZ2xlID0gZW5kQW5nbGU7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHBlcmNlbnRWYWx1ZTogcGVyY2VudFZhbHVlLFxuICAgICAgICAgICAgICAgIGFuZ2xlczogYW5nbGVzLFxuICAgICAgICAgICAgICAgIHBvcHVwUG9zaXRpb246IHRoaXMuX2dldEFyY1Bvc2l0aW9uKG5lLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICAgICAgcjogciArIGRlbHRhXG4gICAgICAgICAgICAgICAgfSwgcG9zaXRpb25EYXRhKSksXG4gICAgICAgICAgICAgICAgY2VudGVyUG9zaXRpb246IHRoaXMuX2dldEFyY1Bvc2l0aW9uKG5lLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICAgICAgcjogKHIgLyAyKSArIGRlbHRhXG4gICAgICAgICAgICAgICAgfSwgcG9zaXRpb25EYXRhKSksXG4gICAgICAgICAgICAgICAgb3V0ZXJQb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICBzdGFydDogdGhpcy5fZ2V0QXJjUG9zaXRpb24obmUudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgcjogclxuICAgICAgICAgICAgICAgICAgICB9LCBwb3NpdGlvbkRhdGEpKSxcbiAgICAgICAgICAgICAgICAgICAgbWlkZGxlOiB0aGlzLl9nZXRBcmNQb3NpdGlvbihuZS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgICAgICAgICByOiByICsgZGVsdGFcbiAgICAgICAgICAgICAgICAgICAgfSwgcG9zaXRpb25EYXRhKSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICByZXR1cm4gcGF0aHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYWRkIGRhdGEuXG4gICAgICogQHJldHVybnMge3tcbiAgICAgKiAgICAgIGZvcm1hdHRlZFZhbHVlczogYXJyYXksXG4gICAgICogICAgICBjaGFydEJhY2tncm91bmQ6IHN0cmluZyxcbiAgICAgKiAgICAgIGNpcmNsZUJvdW5kOiAoe2N4OiBudW1iZXIsIGN5OiBudW1iZXIsIHI6IG51bWJlcn0pLFxuICAgICAqICAgICAgc2VjdG9yc0luZm86IGFycmF5LjxvYmplY3Q+XG4gICAgICogfX0gYWRkIGRhdGEgZm9yIGdyYXBoIHJlbmRlcmluZ1xuICAgICAqL1xuICAgIG1ha2VBZGREYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNpcmNsZUJvdW5kID0gdGhpcy5fbWFrZUNpcmNsZUJvdW5kKHRoaXMuYm91bmQuZGltZW5zaW9uLCB7XG4gICAgICAgICAgICAgICAgc2hvd0xhYmVsOiB0aGlzLm9wdGlvbnMuc2hvd0xhYmVsLFxuICAgICAgICAgICAgICAgIGxlZ2VuZFR5cGU6IHRoaXMub3B0aW9ucy5sZWdlbmRUeXBlXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIHNlY3RvcnNJbmZvID0gdGhpcy5fbWFrZVNlY3RvcnNJbmZvKHRoaXMucGVyY2VudFZhbHVlc1swXSwgY2lyY2xlQm91bmQpO1xuXG4gICAgICAgIHRoaXMucG9wdXBQb3NpdGlvbnMgPSBuZS51dGlsLnBsdWNrKHNlY3RvcnNJbmZvLCAncG9wdXBQb3NpdGlvbicpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY2hhcnRCYWNrZ3JvdW5kOiB0aGlzLmNoYXJ0QmFja2dyb3VuZCxcbiAgICAgICAgICAgIGNpcmNsZUJvdW5kOiBjaXJjbGVCb3VuZCxcbiAgICAgICAgICAgIHNlY3RvcnNJbmZvOiBzZWN0b3JzSW5mb1xuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGNpcmNsZSBib3VuZFxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDpudW1iZXJ9fSBkaW1lbnNpb24gY2hhcnQgZGltZW5zaW9uXG4gICAgICogQHBhcmFtIHt7c2hvd0xhYmVsOiBib29sZWFuLCBsZWdlbmRUeXBlOiBzdHJpbmd9fSBvcHRpb25zIG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7e2N4OiBudW1iZXIsIGN5OiBudW1iZXIsIHI6IG51bWJlcn19IGNpcmNsZSBib3VuZHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQ2lyY2xlQm91bmQ6IGZ1bmN0aW9uKGRpbWVuc2lvbiwgb3B0aW9ucykge1xuICAgICAgICB2YXIgd2lkdGggPSBkaW1lbnNpb24ud2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQgPSBkaW1lbnNpb24uaGVpZ2h0LFxuICAgICAgICAgICAgaXNTbWFsbFBpZSA9IG9wdGlvbnMubGVnZW5kVHlwZSA9PT0gY2hhcnRDb25zdC5TRVJJRVNfTEVHRU5EX1RZUEVfT1VURVIgJiYgb3B0aW9ucy5zaG93TGFiZWwsXG4gICAgICAgICAgICByYWRpdXNSYXRlID0gaXNTbWFsbFBpZSA/IGNoYXJ0Q29uc3QuUElFX0dSQVBIX1NNQUxMX1JBVEUgOiBjaGFydENvbnN0LlBJRV9HUkFQSF9ERUZBVUxUX1JBVEUsXG4gICAgICAgICAgICBkaWFtZXRlciA9IG5lLnV0aWwubXVsdGlwbGljYXRpb24obmUudXRpbC5taW4oW3dpZHRoLCBoZWlnaHRdKSwgcmFkaXVzUmF0ZSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjeDogbmUudXRpbC5kaXZpc2lvbih3aWR0aCwgMiksXG4gICAgICAgICAgICBjeTogbmUudXRpbC5kaXZpc2lvbihoZWlnaHQsIDIpLFxuICAgICAgICAgICAgcjogbmUudXRpbC5kaXZpc2lvbihkaWFtZXRlciwgMilcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGFyYyBwb3NpdGlvbi5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuY3ggY2VudGVyIHhcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuY3kgY2VudGVyIHlcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuciByYWRpdXNcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuYW5nbGUgYW5nbGUoZGVncmVlKVxuICAgICAqIEByZXR1cm5zIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IGFyYyBwb3NpdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldEFyY1Bvc2l0aW9uOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxlZnQ6IHBhcmFtcy5jeCArIChwYXJhbXMuciAqIE1hdGguc2luKHBhcmFtcy5hbmdsZSAqIGNoYXJ0Q29uc3QuUkFEKSksXG4gICAgICAgICAgICB0b3A6IHBhcmFtcy5jeSAtIChwYXJhbXMuciAqIE1hdGguY29zKHBhcmFtcy5hbmdsZSAqIGNoYXJ0Q29uc3QuUkFEKSlcbiAgICAgICAgfTtcbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGFkZCBkYXRhIGZvciBzZXJpZXMgbGFiZWwuXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNvbnRhaW5lclxuICAgICAqIEByZXR1cm5zIHt7XG4gICAgICogICAgICBjb250YWluZXI6IEhUTUxFbGVtZW50LFxuICAgICAqICAgICAgbGVnZW5kTGFiZWxzOiBhcnJheS48c3RyaW5nPixcbiAgICAgKiAgICAgIG9wdGlvbnM6IHtsZWdlbmRUeXBlOiBzdHJpbmcsIHNob3dMYWJlbDogYm9vbGVhbn0sXG4gICAgICogICAgICBjaGFydFdpZHRoOiBudW1iZXIsXG4gICAgICogICAgICBmb3JtYXR0ZWRWYWx1ZXM6IGFycmF5XG4gICAgICogfX0gYWRkIGRhdGEgZm9yIG1ha2Ugc2VyaWVzIGxhYmVsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUFkZERhdGFGb3JTZXJpZXNMYWJlbDogZnVuY3Rpb24oY29udGFpbmVyKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjb250YWluZXI6IGNvbnRhaW5lcixcbiAgICAgICAgICAgIGxlZ2VuZExhYmVsczogdGhpcy5kYXRhLmxlZ2VuZExhYmVscyxcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICBsZWdlbmRUeXBlOiB0aGlzLm9wdGlvbnMubGVnZW5kVHlwZSxcbiAgICAgICAgICAgICAgICBzaG93TGFiZWw6IHRoaXMub3B0aW9ucy5zaG93TGFiZWxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjaGFydFdpZHRoOiB0aGlzLmRhdGEuY2hhcnRXaWR0aCxcbiAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlczogdGhpcy5kYXRhLmZvcm1hdHRlZFZhbHVlc1swXVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgc2VyaWVzIGxhYmVsLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5sZWdlbmQgbGVnZW5kXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLmxhYmVsIGxhYmVsXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLnNlcGFyYXRvciBzZXBhcmF0b3JcbiAgICAgKiAgICAgIEBwYXJhbSB7e2xlZ2VuZFR5cGU6IGJvb2xlYW4sIHNob3dMYWJlbDogYm9vbGVhbn19IHBhcmFtcy5vcHRpb25zIG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBzZXJpZXMgbGFiZWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRTZXJpZXNMYWJlbDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBzZXJpZXNMYWJlbCA9ICcnO1xuICAgICAgICBpZiAocGFyYW1zLm9wdGlvbnMubGVnZW5kVHlwZSkge1xuICAgICAgICAgICAgc2VyaWVzTGFiZWwgPSBwYXJhbXMubGVnZW5kO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhcmFtcy5vcHRpb25zLnNob3dMYWJlbCkge1xuICAgICAgICAgICAgc2VyaWVzTGFiZWwgKz0gKHNlcmllc0xhYmVsID8gcGFyYW1zLnNlcGFyYXRvciA6ICcnKSArIHBhcmFtcy5sYWJlbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzZXJpZXNMYWJlbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGNlbnRlciBsZWdlbmQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY29udGFpbmVyXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBsZWdlbmRzIGxlZ2VuZHNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPG9iamVjdD59IGNlbnRlclBvc2l0aW9ucyBjZW50ZXIgcG9zaXRpb25zXG4gICAgICogQHJldHVybiB7SFRNTEVsZW1lbnR9IHNlcmllcyBhcmVhIGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJMZWdlbmRMYWJlbDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBwb3NpdGlvbnMgPSBwYXJhbXMucG9zaXRpb25zLFxuICAgICAgICAgICAgZm9ybWF0dGVkVmFsdWVzID0gcGFyYW1zLmZvcm1hdHRlZFZhbHVlcyxcbiAgICAgICAgICAgIGVsU2VyaWVzTGFiZWxBcmVhID0gZG9tLmNyZWF0ZSgnZGl2JywgJ25lLWNoYXJ0LXNlcmllcy1sYWJlbC1hcmVhJyksXG4gICAgICAgICAgICBodG1sO1xuXG4gICAgICAgIGh0bWwgPSBuZS51dGlsLm1hcChwYXJhbXMubGVnZW5kTGFiZWxzLCBmdW5jdGlvbihsZWdlbmQsIGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgbGFiZWwgPSB0aGlzLl9nZXRTZXJpZXNMYWJlbCh7XG4gICAgICAgICAgICAgICAgICAgIGxlZ2VuZDogbGVnZW5kLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogZm9ybWF0dGVkVmFsdWVzW2luZGV4XSxcbiAgICAgICAgICAgICAgICAgICAgc2VwYXJhdG9yOiBwYXJhbXMuc2VwYXJhdG9yLFxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBwYXJhbXMub3B0aW9uc1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uID0gcGFyYW1zLm1vdmVUb1Bvc2l0aW9uKHBvc2l0aW9uc1tpbmRleF0sIGxhYmVsKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9tYWtlU2VyaWVzTGFiZWxIdG1sKHBvc2l0aW9uLCBsYWJlbCwgMCwgaW5kZXgpO1xuICAgICAgICB9LCB0aGlzKS5qb2luKCcnKTtcblxuICAgICAgICBlbFNlcmllc0xhYmVsQXJlYS5pbm5lckhUTUwgPSBodG1sO1xuICAgICAgICBwYXJhbXMuY29udGFpbmVyLmFwcGVuZENoaWxkKGVsU2VyaWVzTGFiZWxBcmVhKTtcblxuICAgICAgICByZXR1cm4gZWxTZXJpZXNMYWJlbEFyZWE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1vdmUgdG8gY2VudGVyIHBvc2l0aW9uLlxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBwb3NpdGlvbiBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBsYWJlbCBsYWJlbFxuICAgICAqIEByZXR1cm5zIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IGNlbnRlciBwb3NpdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21vdmVUb0NlbnRlclBvc2l0aW9uOiBmdW5jdGlvbihwb3NpdGlvbiwgbGFiZWwpIHtcbiAgICAgICAgdmFyIGxlZnQgPSBwb3NpdGlvbi5sZWZ0IC0gKHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbFdpZHRoKGxhYmVsLCB0aGlzLnRoZW1lLmxhYmVsKSAvIDIpLFxuICAgICAgICAgICAgdG9wID0gcG9zaXRpb24udG9wIC0gKHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodChsYWJlbCwgdGhpcy50aGVtZS5sYWJlbCkgLyAyKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxlZnQ6IGxlZnQsXG4gICAgICAgICAgICB0b3A6IHRvcFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgY2VudGVyIGxlZ2VuZC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciBjb250YWluZXJcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGxlZ2VuZHMgbGVnZW5kc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48b2JqZWN0Pn0gY2VudGVyUG9zaXRpb25zIGNlbnRlciBwb3NpdGlvbnNcbiAgICAgKiBAcmV0dXJuIHtIVE1MRWxlbWVudH0gYXJlYSBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyQ2VudGVyTGVnZW5kOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGVsQXJlYSA9IHRoaXMuX3JlbmRlckxlZ2VuZExhYmVsKG5lLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgIHBvc2l0aW9uczogbmUudXRpbC5wbHVjayhwYXJhbXMuc2VjdG9yc0luZm8sICdjZW50ZXJQb3NpdGlvbicpLFxuICAgICAgICAgICAgbW92ZVRvUG9zaXRpb246IG5lLnV0aWwuYmluZCh0aGlzLl9tb3ZlVG9DZW50ZXJQb3NpdGlvbiwgdGhpcyksXG4gICAgICAgICAgICBzZXBhcmF0b3I6ICc8YnI+J1xuICAgICAgICB9LCBwYXJhbXMpKTtcblxuICAgICAgICByZXR1cm4gZWxBcmVhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgZW5kIHBvc2l0aW9uLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjZW50ZXJMZWZ0IGNlbnRlciBsZWZ0XG4gICAgICogQHBhcmFtIHthcnJheS48b2JqZWN0Pn0gcG9zaXRpb25zIHBvc2l0aW9uc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2FkZEVuZFBvc2l0aW9uOiBmdW5jdGlvbihjZW50ZXJMZWZ0LCBwb3NpdGlvbnMpIHtcbiAgICAgICAgbmUudXRpbC5mb3JFYWNoKHBvc2l0aW9ucywgZnVuY3Rpb24ocG9zaXRpb24pIHtcbiAgICAgICAgICAgIHZhciBlbmQgPSBuZS51dGlsLmV4dGVuZCh7fSwgcG9zaXRpb24ubWlkZGxlKTtcbiAgICAgICAgICAgIGlmIChlbmQubGVmdCA8IGNlbnRlckxlZnQpIHtcbiAgICAgICAgICAgICAgICBlbmQubGVmdCAtPSBjaGFydENvbnN0LlNFUklFU19PVVRFUl9MQUJFTF9QQURESU5HO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBlbmQubGVmdCArPSBjaGFydENvbnN0LlNFUklFU19PVVRFUl9MQUJFTF9QQURESU5HO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcG9zaXRpb24uZW5kID0gZW5kO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTW92ZSB0byBvdXRlciBwb3NpdGlvbi5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gY2VudGVyTGVmdCBjZW50ZXIgbGVmdFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwb3NpdGlvbiBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBsYWJlbCBsYWJlbFxuICAgICAqIEByZXR1cm5zIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IG91dGVyIHBvc2l0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbW92ZVRvT3V0ZXJQb3NpdGlvbjogZnVuY3Rpb24oY2VudGVyTGVmdCwgcG9zaXRpb24sIGxhYmVsKSB7XG4gICAgICAgIHZhciBwb3NpdGlvbkVuZCA9IHBvc2l0aW9uLmVuZCxcbiAgICAgICAgICAgIGxlZnQgPSBwb3NpdGlvbkVuZC5sZWZ0LFxuICAgICAgICAgICAgdG9wID0gcG9zaXRpb25FbmQudG9wIC0gKHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodChsYWJlbCwgdGhpcy50aGVtZS5sYWJlbCkgLyAyKTtcblxuICAgICAgICBpZiAobGVmdCA8IGNlbnRlckxlZnQpIHtcbiAgICAgICAgICAgIGxlZnQgLT0gcmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsV2lkdGgobGFiZWwsIHRoaXMudGhlbWUubGFiZWwpICsgY2hhcnRDb25zdC5TRVJJRVNfTEFCRUxfUEFERElORztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxlZnQgKz0gY2hhcnRDb25zdC5TRVJJRVNfTEFCRUxfUEFERElORztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsZWZ0OiBsZWZ0LFxuICAgICAgICAgICAgdG9wOiB0b3BcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIG91dGVyIGxlZ2VuZC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciBjb250YWluZXJcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGxlZ2VuZHMgbGVnZW5kc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48b2JqZWN0Pn0gY2VudGVyUG9zaXRpb25zIGNlbnRlciBwb3NpdGlvbnNcbiAgICAgKiBAcmV0dXJuIHtIVE1MRWxlbWVudH0gYXJlYSBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyT3V0ZXJMZWdlbmQ6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgb3V0ZXJQb3NpdGlvbnMgPSBuZS51dGlsLnBsdWNrKHBhcmFtcy5zZWN0b3JzSW5mbywgJ291dGVyUG9zaXRpb24nKSxcbiAgICAgICAgICAgIGNlbnRlckxlZnQgPSBwYXJhbXMuY2hhcnRXaWR0aCAvIDIsXG4gICAgICAgICAgICBlbEFyZWE7XG5cbiAgICAgICAgdGhpcy5fYWRkRW5kUG9zaXRpb24oY2VudGVyTGVmdCwgb3V0ZXJQb3NpdGlvbnMpO1xuICAgICAgICBlbEFyZWEgPSB0aGlzLl9yZW5kZXJMZWdlbmRMYWJlbChuZS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICBwb3NpdGlvbnM6IG91dGVyUG9zaXRpb25zLFxuICAgICAgICAgICAgbW92ZVRvUG9zaXRpb246IG5lLnV0aWwuYmluZCh0aGlzLl9tb3ZlVG9PdXRlclBvc2l0aW9uLCB0aGlzLCBjZW50ZXJMZWZ0KSxcbiAgICAgICAgICAgIHNlcGFyYXRvcjogJzombmJzcDsnXG4gICAgICAgIH0sIHBhcmFtcykpO1xuXG4gICAgICAgIGlmICh0aGlzLnBhcGVyKSB7XG4gICAgICAgICAgICB0aGlzLmdyYXBoUmVuZGVyZXIucmVuZGVyTGVnZW5kTGluZXModGhpcy5wYXBlciwgb3V0ZXJQb3NpdGlvbnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGVsQXJlYTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIHNlcmllcyBsYWJlbC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IGFyZWEgZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlclNlcmllc0xhYmVsOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGVsQXJlYTtcbiAgICAgICAgaWYgKHBhcmFtcy5vcHRpb25zLmxlZ2VuZFR5cGUgPT09IGNoYXJ0Q29uc3QuU0VSSUVTX0xFR0VORF9UWVBFX09VVEVSKSB7XG4gICAgICAgICAgICBlbEFyZWEgPSB0aGlzLl9yZW5kZXJPdXRlckxlZ2VuZChwYXJhbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZWxBcmVhID0gdGhpcy5fcmVuZGVyQ2VudGVyTGVnZW5kKHBhcmFtcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVsQXJlYTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGJvdW5kLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBncm91cEluZGV4IGdyb3VwIGluZGV4XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IGluZGV4XG4gICAgICogQHJldHVybnMge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gYm91bmRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRCb3VuZDogZnVuY3Rpb24oZ3JvdXBJbmRleCwgaW5kZXgpIHtcbiAgICAgICAgaWYgKGdyb3VwSW5kZXggPT09IC0xIHx8IGluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMucG9wdXBQb3NpdGlvbnNbaW5kZXhdO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTaG93IHNlcmllcyBsYWJlbCBhcmVhLlxuICAgICAqL1xuICAgIHNob3dTZXJpZXNMYWJlbEFyZWE6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmdyYXBoUmVuZGVyZXIuYW5pbWF0ZUxlZ2VuZExpbmVzKCk7XG4gICAgICAgIFNlcmllcy5wcm90b3R5cGUuc2hvd1Nlcmllc0xhYmVsQXJlYS5jYWxsKHRoaXMpO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBpZUNoYXJ0U2VyaWVzO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFNlcmllcyBiYXNlIGNvbXBvbmVudC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHNlcmllc1RlbXBsYXRlID0gcmVxdWlyZSgnLi9zZXJpZXNUZW1wbGF0ZS5qcycpLFxuICAgIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuLi9jb25zdC5qcycpLFxuICAgIGRvbSA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZG9tSGFuZGxlci5qcycpLFxuICAgIHJlbmRlclV0aWwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3JlbmRlclV0aWwuanMnKSxcbiAgICBldmVudCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZXZlbnRMaXN0ZW5lci5qcycpLFxuICAgIHBsdWdpbkZhY3RvcnkgPSByZXF1aXJlKCcuLi9mYWN0b3JpZXMvcGx1Z2luRmFjdG9yeS5qcycpO1xuXG52YXIgSElEREVOX1dJRFRIID0gMSxcbiAgICBTRVJJRVNfTEFCRUxfQ0xBU1NfTkFNRSA9ICduZS1jaGFydC1zZXJpZXMtbGFiZWwnO1xuXG52YXIgU2VyaWVzID0gbmUudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIFNlcmllcy5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIFNlcmllcyBiYXNlIGNvbXBvbmVudC5cbiAgICAgKiBAY29uc3RydWN0cyBTZXJpZXNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMubW9kZWwgc2VyaWVzIG1vZGVsXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgc2VyaWVzIG9wdGlvbnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgc2VyaWVzIHRoZW1lXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBsaWJUeXBlO1xuXG4gICAgICAgIG5lLnV0aWwuZXh0ZW5kKHRoaXMsIHBhcmFtcyk7XG4gICAgICAgIGxpYlR5cGUgPSBwYXJhbXMubGliVHlwZSB8fCBjaGFydENvbnN0LkRFRkFVTFRfUExVR0lOO1xuICAgICAgICB0aGlzLnBlcmNlbnRWYWx1ZXMgPSB0aGlzLl9tYWtlUGVyY2VudFZhbHVlcyhwYXJhbXMuZGF0YSwgcGFyYW1zLm9wdGlvbnMuc3RhY2tlZCk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHcmFwaCByZW5kZXJlclxuICAgICAgICAgKiBAdHlwZSB7b2JqZWN0fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5ncmFwaFJlbmRlcmVyID0gcGx1Z2luRmFjdG9yeS5nZXQobGliVHlwZSwgcGFyYW1zLmNoYXJ0VHlwZSk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNlcmllcyB2aWV3IGNsYXNzTmFtZVxuICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jbGFzc05hbWUgPSAnbmUtY2hhcnQtc2VyaWVzLWFyZWEnO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTaG93IHRvb2x0aXAgKG1vdXNlb3ZlciBjYWxsYmFjaykuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLnByZWZpeCB0b29sdGlwIGlkIHByZWZpeFxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuYWxsb3dOZWdhdGl2ZVRvb2x0aXAgd2hldGhlciBhbGxvdyBuZWdhdGl2ZSB0b29sdGlwIG9yIG5vdFxuICAgICAqIEBwYXJhbSB7e3RvcDpudW1iZXIsIGxlZnQ6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBib3VuZCBncmFwaCBib3VuZCBpbmZvcm1hdGlvblxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpZCB0b29sdGlwIGlkXG4gICAgICovXG4gICAgc2hvd1Rvb2x0aXA6IGZ1bmN0aW9uKHBhcmFtcywgYm91bmQsIGlkKSB7XG4gICAgICAgIHRoaXMuZmlyZSgnc2hvd1Rvb2x0aXAnLCBuZS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICBpZDogcGFyYW1zLnByZWZpeCArIGlkLFxuICAgICAgICAgICAgYm91bmQ6IGJvdW5kXG4gICAgICAgIH0sIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBIaWRlIHRvb2x0aXAgKG1vdXNlb3V0IGNhbGxiYWNrKS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcHJlZml4IHRvb2x0aXAgaWQgcHJlZml4XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGlkIHRvb2x0aXAgaWRcbiAgICAgKi9cbiAgICBoaWRlVG9vbHRpcDogZnVuY3Rpb24ocHJlZml4LCBpZCkge1xuICAgICAgICB0aGlzLmZpcmUoJ2hpZGVUb29sdGlwJywge1xuICAgICAgICAgICAgaWQ6IHByZWZpeCArIGlkXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgc2VyaWVzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciBvYmplY3QgZm9yIGdyYXBoIGRyYXdpbmdcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHNlcmllcyBlbGVtZW50XG4gICAgICovXG4gICAgcmVuZGVyOiBmdW5jdGlvbihwYXBlcikge1xuICAgICAgICB2YXIgZWwgPSBkb20uY3JlYXRlKCdESVYnLCB0aGlzLmNsYXNzTmFtZSksXG4gICAgICAgICAgICB0b29sdGlwUHJlZml4ID0gdGhpcy50b29sdGlwUHJlZml4LFxuICAgICAgICAgICAgYm91bmQgPSB0aGlzLmJvdW5kLFxuICAgICAgICAgICAgZGltZW5zaW9uID0gYm91bmQuZGltZW5zaW9uLFxuICAgICAgICAgICAgaW5DYWxsYmFjayA9IG5lLnV0aWwuYmluZCh0aGlzLnNob3dUb29sdGlwLCB0aGlzLCB7XG4gICAgICAgICAgICAgICAgcHJlZml4OiB0b29sdGlwUHJlZml4LFxuICAgICAgICAgICAgICAgIGFsbG93TmVnYXRpdmVUb29sdGlwOiAhIXRoaXMuYWxsb3dOZWdhdGl2ZVRvb2x0aXAsXG4gICAgICAgICAgICAgICAgY2hhcnRUeXBlOiB0aGlzLmNoYXJ0VHlwZVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBvdXRDYWxsYmFjayA9IG5lLnV0aWwuYmluZCh0aGlzLmhpZGVUb29sdGlwLCB0aGlzLCB0b29sdGlwUHJlZml4KSxcbiAgICAgICAgICAgIGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgZGltZW5zaW9uOiBkaW1lbnNpb24sXG4gICAgICAgICAgICAgICAgdGhlbWU6IHRoaXMudGhlbWUsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYWRkRGF0YSA9IHRoaXMubWFrZUFkZERhdGEoKSxcbiAgICAgICAgICAgIGFkZERhdGFGb3JTZXJpZXNMYWJlbDtcblxuICAgICAgICBpZiAoIXBhcGVyKSB7XG4gICAgICAgICAgICByZW5kZXJVdGlsLnJlbmRlckRpbWVuc2lvbihlbCwgZGltZW5zaW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3JlbmRlclBvc2l0aW9uKGVsLCBib3VuZC5wb3NpdGlvbiwgdGhpcy5jaGFydFR5cGUpO1xuXG4gICAgICAgIGRhdGEgPSBuZS51dGlsLmV4dGVuZChkYXRhLCBhZGREYXRhKTtcblxuICAgICAgICB0aGlzLnBhcGVyID0gdGhpcy5ncmFwaFJlbmRlcmVyLnJlbmRlcihwYXBlciwgZWwsIGRhdGEsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKTtcblxuICAgICAgICBpZiAodGhpcy5fcmVuZGVyU2VyaWVzTGFiZWwpIHtcbiAgICAgICAgICAgIGFkZERhdGFGb3JTZXJpZXNMYWJlbCA9IHRoaXMuX21ha2VBZGREYXRhRm9yU2VyaWVzTGFiZWwoZWwsIGRpbWVuc2lvbik7XG4gICAgICAgICAgICB0aGlzLmVsU2VyaWVzTGFiZWxBcmVhID0gdGhpcy5fcmVuZGVyU2VyaWVzTGFiZWwobmUudXRpbC5leHRlbmQoYWRkRGF0YUZvclNlcmllc0xhYmVsLCBhZGREYXRhKSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmF0dGFjaEV2ZW50KGVsKTtcblxuICAgICAgICAvLyBzZXJpZXMgbGFiZWwgbW91c2UgZXZlbnQg64+Z7J6RIOyLnCDsgqzsmqlcbiAgICAgICAgdGhpcy5pbkNhbGxiYWNrID0gaW5DYWxsYmFjaztcbiAgICAgICAgdGhpcy5vdXRDYWxsYmFjayA9IG91dENhbGxiYWNrO1xuXG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBhZGQgZGF0YS5cbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBhZGQgZGF0YVxuICAgICAqL1xuICAgIG1ha2VBZGREYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHt9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGFkZCBkYXRhIGZvciBzZXJpZXMgbGFiZWwuXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNvbnRhaW5lclxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX1kaW1lbnNpb25cbiAgICAgKiBAcmV0dXJucyB7e1xuICAgICAqICAgICAgY29udGFpbmVyOiBIVE1MRWxlbWVudCxcbiAgICAgKiAgICAgIHZhbHVlczogYXJyYXkuPGFycmF5PixcbiAgICAgKiAgICAgIGZvcm1hdHRlZFZhbHVlczogYXJyYXkuPGFycmF5PixcbiAgICAgKiAgICAgIGZvcm1hdEZ1bmN0aW9uczogYXJyYXkuPGZ1bmN0aW9uPixcbiAgICAgKiAgICAgIGRpbWVuc2lvbjoge3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfVxuICAgICAqIH19IGFkZCBkYXRhIGZvciBzZXJpZXMgbGFiZWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQWRkRGF0YUZvclNlcmllc0xhYmVsOiBmdW5jdGlvbihjb250YWluZXIsIGRpbWVuc2lvbikge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY29udGFpbmVyOiBjb250YWluZXIsXG4gICAgICAgICAgICB2YWx1ZXM6IHRoaXMuZGF0YS52YWx1ZXMsXG4gICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXM6IHRoaXMuZGF0YS5mb3JtYXR0ZWRWYWx1ZXMsXG4gICAgICAgICAgICBmb3JtYXRGdW5jdGlvbnM6IHRoaXMuZGF0YS5mb3JtYXRGdW5jdGlvbnMsXG4gICAgICAgICAgICBkaW1lbnNpb246IGRpbWVuc2lvblxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgYm91bmRzXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgc2VyaWVzIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGRpbWVuc2lvbiBzZXJpZXMgZGltZW5zaW9uXG4gICAgICogQHBhcmFtIHt7dG9wOiBudW1iZXIsIGxlZnQ6IG51bWJlcn19IHBvc2l0aW9uIHNlcmllcyBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjaGFydFR5cGUgY2hhcnQgdHlwZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlclBvc2l0aW9uOiBmdW5jdGlvbihlbCwgcG9zaXRpb24sIGNoYXJ0VHlwZSkge1xuICAgICAgICB2YXIgaGlkZGVuV2lkdGggPSByZW5kZXJVdGlsLmlzSUU4KCkgPyAwIDogSElEREVOX1dJRFRIO1xuICAgICAgICBwb3NpdGlvbi50b3AgPSBwb3NpdGlvbi50b3AgLSBISURERU5fV0lEVEg7XG4gICAgICAgIHBvc2l0aW9uLmxlZnQgPSBwb3NpdGlvbi5sZWZ0ICsgKGNoYXJ0VHlwZSA9PT0gY2hhcnRDb25zdC5DSEFSVF9UWVBFX0JBUiA/IGhpZGRlbldpZHRoIDogSElEREVOX1dJRFRIICogMik7XG4gICAgICAgIHJlbmRlclV0aWwucmVuZGVyUG9zaXRpb24oZWwsIHBvc2l0aW9uKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHBhcGVyLlxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IG9iamVjdCBmb3IgZ3JhcGggZHJhd2luZ1xuICAgICAqL1xuICAgIGdldFBhcGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFwZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgcGVyY2VudCB2YWx1ZS5cbiAgICAgKiBAcGFyYW0ge3t2YWx1ZXM6IGFycmF5LCBzY2FsZToge21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19fSBkYXRhIHNlcmllcyBkYXRhXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHN0YWNrZWQgc3RhY2tlZCBvcHRpb25cbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxudW1iZXI+Pn0gcGVyY2VudCB2YWx1ZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlUGVyY2VudFZhbHVlczogZnVuY3Rpb24oZGF0YSwgc3RhY2tlZCkge1xuICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICBpZiAoc3RhY2tlZCA9PT0gY2hhcnRDb25zdC5TVEFDS0VEX05PUk1BTF9UWVBFKSB7XG4gICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9tYWtlTm9ybWFsU3RhY2tlZFBlcmNlbnRWYWx1ZXMoZGF0YSk7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RhY2tlZCA9PT0gY2hhcnRDb25zdC5TVEFDS0VEX1BFUkNFTlRfVFlQRSkge1xuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5fbWFrZVBlcmNlbnRTdGFja2VkUGVyY2VudFZhbHVlcyhkYXRhKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuX21ha2VOb3JtYWxQZXJjZW50VmFsdWVzKGRhdGEpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBwZXJjZW50IHZhbHVlcyBhYm91dCBub3JtYWwgc3RhY2tlZCBvcHRpb24uXG4gICAgICogQHBhcmFtIHt7dmFsdWVzOiBhcnJheSwgc2NhbGU6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fX0gZGF0YSBzZXJpZXMgZGF0YVxuICAgICAqIEByZXR1cm5zIHthcnJheX0gcGVyY2VudCB2YWx1ZXMgYWJvdXQgbm9ybWFsIHN0YWNrZWQgb3B0aW9uLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VOb3JtYWxTdGFja2VkUGVyY2VudFZhbHVlczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgbWluID0gZGF0YS5zY2FsZS5taW4sXG4gICAgICAgICAgICBtYXggPSBkYXRhLnNjYWxlLm1heCxcbiAgICAgICAgICAgIGRpc3RhbmNlID0gbWF4IC0gbWluLFxuICAgICAgICAgICAgcGVyY2VudFZhbHVlcyA9IG5lLnV0aWwubWFwKGRhdGEudmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGx1c1ZhbHVlcyA9IG5lLnV0aWwuZmlsdGVyKHZhbHVlcywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSA+IDA7XG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBzdW0gPSBuZS51dGlsLnN1bShwbHVzVmFsdWVzKSxcbiAgICAgICAgICAgICAgICAgICAgZ3JvdXBQZXJjZW50ID0gKHN1bSAtIG1pbikgLyBkaXN0YW5jZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZ3JvdXBQZXJjZW50ICogKHZhbHVlIC8gc3VtKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcGVyY2VudFZhbHVlcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBwZXJjZW50IHZhbHVlcyBhYm91dCBwZXJjZW50IHN0YWNrZWQgb3B0aW9uLlxuICAgICAqIEBwYXJhbSB7e3ZhbHVlczogYXJyYXksIHNjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX19IGRhdGEgc2VyaWVzIGRhdGFcbiAgICAgKiBAcmV0dXJucyB7YXJyYXl9IHBlcmNlbnQgdmFsdWVzIGFib3V0IHBlcmNlbnQgc3RhY2tlZCBvcHRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlUGVyY2VudFN0YWNrZWRQZXJjZW50VmFsdWVzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBwZXJjZW50VmFsdWVzID0gbmUudXRpbC5tYXAoZGF0YS52YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICAgICAgdmFyIHBsdXNWYWx1ZXMgPSBuZS51dGlsLmZpbHRlcih2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSA+IDA7XG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgc3VtID0gbmUudXRpbC5zdW0ocGx1c1ZhbHVlcyk7XG4gICAgICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSAvIHN1bTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHBlcmNlbnRWYWx1ZXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgbGluZSB0eXBlIGNoYXJ0IG9yIG5vdC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY2hhcnRUeXBlIGNoYXJ0IHR5cGVcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gcmVzdWx0IGJvb2xlYW5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc0xpbmVUeXBlQ2hhcnQ6IGZ1bmN0aW9uKGNoYXJ0VHlwZSkge1xuICAgICAgICByZXR1cm4gY2hhcnRUeXBlID09PSBjaGFydENvbnN0LkNIQVJUX1RZUEVfTElORSB8fCBjaGFydFR5cGUgPT09IGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9BUkVBO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIG5vcm1hbCBwZXJjZW50IHZhbHVlLlxuICAgICAqIEBwYXJhbSB7e3ZhbHVlczogYXJyYXksIHNjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX19IGRhdGEgc2VyaWVzIGRhdGFcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxudW1iZXI+Pn0gcGVyY2VudCB2YWx1ZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlTm9ybWFsUGVyY2VudFZhbHVlczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgbWluID0gZGF0YS5zY2FsZS5taW4sXG4gICAgICAgICAgICBtYXggPSBkYXRhLnNjYWxlLm1heCxcbiAgICAgICAgICAgIGRpc3RhbmNlID0gbWF4IC0gbWluLFxuICAgICAgICAgICAgaXNMaW5lVHlwZUNoYXJ0ID0gdGhpcy5faXNMaW5lVHlwZUNoYXJ0KHRoaXMuY2hhcnRUeXBlKSxcbiAgICAgICAgICAgIGZsYWcgPSAxLFxuICAgICAgICAgICAgc3ViVmFsdWUgPSAwLFxuICAgICAgICAgICAgcGVyY2VudFZhbHVlcztcblxuICAgICAgICBpZiAoIWlzTGluZVR5cGVDaGFydCAmJiBtaW4gPCAwICYmIG1heCA8PSAwKSB7XG4gICAgICAgICAgICBmbGFnID0gLTE7XG4gICAgICAgICAgICBzdWJWYWx1ZSA9IG1heDtcbiAgICAgICAgICAgIGRpc3RhbmNlID0gbWluIC0gbWF4O1xuICAgICAgICB9IGVsc2UgaWYgKGlzTGluZVR5cGVDaGFydCB8fCBtaW4gPj0gMCkge1xuICAgICAgICAgICAgc3ViVmFsdWUgPSBtaW47XG4gICAgICAgIH1cblxuICAgICAgICBwZXJjZW50VmFsdWVzID0gbmUudXRpbC5tYXAoZGF0YS52YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKHZhbHVlIC0gc3ViVmFsdWUpICogZmxhZyAvIGRpc3RhbmNlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcGVyY2VudFZhbHVlcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHNjYWxlIGRpc3RhbmNlIGZyb20gemVybyBwb2ludC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc2l6ZSBjaGFydCBzaXplICh3aWR0aCBvciBoZWlnaHQpXG4gICAgICogQHBhcmFtIHt7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX0gc2NhbGUgc2NhbGVcbiAgICAgKiBAcmV0dXJucyB7e3RvTWF4OiBudW1iZXIsIHRvTWluOiBudW1iZXJ9fSBwaXhlbCBkaXN0YW5jZVxuICAgICAqL1xuICAgIGdldFNjYWxlRGlzdGFuY2VGcm9tWmVyb1BvaW50OiBmdW5jdGlvbihzaXplLCBzY2FsZSkge1xuICAgICAgICB2YXIgbWluID0gc2NhbGUubWluLFxuICAgICAgICAgICAgbWF4ID0gc2NhbGUubWF4LFxuICAgICAgICAgICAgZGlzdGFuY2UgPSBtYXggLSBtaW4sXG4gICAgICAgICAgICB0b01heCA9IDAsXG4gICAgICAgICAgICB0b01pbiA9IDA7XG5cbiAgICAgICAgaWYgKG1pbiA8IDAgJiYgbWF4ID4gMCkge1xuICAgICAgICAgICAgdG9NYXggPSAoZGlzdGFuY2UgKyBtaW4pIC8gZGlzdGFuY2UgKiBzaXplO1xuICAgICAgICAgICAgdG9NaW4gPSAoZGlzdGFuY2UgLSBtYXgpIC8gZGlzdGFuY2UgKiBzaXplO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRvTWF4OiB0b01heCxcbiAgICAgICAgICAgIHRvTWluOiB0b01pblxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBPbiBtb3VzZW92ZXIgZXZlbnQgaGFuZGxlciBmb3Igc2VyaWVzIGFyZWFcbiAgICAgKiBAcGFyYW0ge01vdXNlRXZlbnR9IGUgbW91c2UgZXZlbnRcbiAgICAgKi9cbiAgICBvbk1vdXNlb3ZlcjogZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgZWxUYXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQsXG4gICAgICAgICAgICBncm91cEluZGV4LCBpbmRleDtcblxuICAgICAgICBpZiAoZWxUYXJnZXQuY2xhc3NOYW1lICE9PSBTRVJJRVNfTEFCRUxfQ0xBU1NfTkFNRSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZ3JvdXBJbmRleCA9IGVsVGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1ncm91cC1pbmRleCcpO1xuICAgICAgICBpbmRleCA9IGVsVGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1pbmRleCcpO1xuICAgICAgICBpZiAoZ3JvdXBJbmRleCA9PT0gJy0xJyB8fCBpbmRleCA9PT0gJy0xJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaW5DYWxsYmFjayh0aGlzLl9nZXRCb3VuZChncm91cEluZGV4LCBpbmRleCksIGdyb3VwSW5kZXggKyAnLScgKyBpbmRleCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE9uIG1vdXNlb3V0IGV2ZW50IGhhbmRsZXIgZm9yIHNlcmllcyBhcmVhXG4gICAgICogQHBhcmFtIHtNb3VzZUV2ZW50fSBlIG1vdXNlIGV2ZW50XG4gICAgICovXG4gICAgb25Nb3VzZW91dDogZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgZWxUYXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQsXG4gICAgICAgICAgICBncm91cEluZGV4LCBpbmRleDtcblxuICAgICAgICBpZiAoZWxUYXJnZXQuY2xhc3NOYW1lICE9PSBTRVJJRVNfTEFCRUxfQ0xBU1NfTkFNRSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZ3JvdXBJbmRleCA9IGVsVGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1ncm91cC1pbmRleCcpO1xuICAgICAgICBpbmRleCA9IGVsVGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1pbmRleCcpO1xuXG4gICAgICAgIGlmIChncm91cEluZGV4ID09PSAnLTEnIHx8IGluZGV4ID09PSAnLTEnKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm91dENhbGxiYWNrKGdyb3VwSW5kZXggKyAnLScgKyBpbmRleCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCBldmVudFxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICovXG4gICAgYXR0YWNoRXZlbnQ6IGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgIGV2ZW50LmJpbmRFdmVudCgnbW91c2VvdmVyJywgZWwsIG5lLnV0aWwuYmluZCh0aGlzLm9uTW91c2VvdmVyLCB0aGlzKSk7XG4gICAgICAgIGV2ZW50LmJpbmRFdmVudCgnbW91c2VvdXQnLCBlbCwgbmUudXRpbC5iaW5kKHRoaXMub25Nb3VzZW91dCwgdGhpcykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxsIHNob3dEb3QgZnVuY3Rpb24gb2YgZ3JhcGhSZW5kZXJlci5cbiAgICAgKiBAcGFyYW0ge3tncm91cEluZGV4OiBudW1iZXIsIGluZGV4OiBudW1iZXJ9fSBkYXRhIGRhdGFcbiAgICAgKi9cbiAgICBvblNob3dBbmltYXRpb246IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgaWYgKCF0aGlzLmdyYXBoUmVuZGVyZXIuc2hvd0FuaW1hdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ3JhcGhSZW5kZXJlci5zaG93QW5pbWF0aW9uLmNhbGwodGhpcy5ncmFwaFJlbmRlcmVyLCBkYXRhKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsbCBoaWRlRG90IGZ1bmN0aW9uIG9mIGdyYXBoUmVuZGVyZXIuXG4gICAgICogQHBhcmFtIHt7Z3JvdXBJbmRleDogbnVtYmVyLCBpbmRleDogbnVtYmVyfX0gZGF0YSBkYXRhXG4gICAgICovXG4gICAgb25IaWRlQW5pbWF0aW9uOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIGlmICghdGhpcy5ncmFwaFJlbmRlcmVyLmhpZGVBbmltYXRpb24pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmdyYXBoUmVuZGVyZXIuaGlkZUFuaW1hdGlvbi5jYWxsKHRoaXMuZ3JhcGhSZW5kZXJlciwgZGF0YSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFuaW1hdGUgY29tcG9uZW50XG4gICAgICovXG4gICAgYW5pbWF0ZUNvbXBvbmVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmdyYXBoUmVuZGVyZXIuYW5pbWF0ZSkge1xuICAgICAgICAgICAgdGhpcy5ncmFwaFJlbmRlcmVyLmFuaW1hdGUobmUudXRpbC5iaW5kKHRoaXMuc2hvd1Nlcmllc0xhYmVsQXJlYSwgdGhpcykpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgaHRtbCBhYm91dCBzZXJpZXMgbGFiZWxcbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gcG9zaXRpb24gcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWUgdmFsdWVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZ3JvdXBJbmRleCBncm91cCBpbmRleFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBpbmRleFxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGh0bWwgc3RyaW5nXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVNlcmllc0xhYmVsSHRtbDogZnVuY3Rpb24ocG9zaXRpb24sIHZhbHVlLCBncm91cEluZGV4LCBpbmRleCkge1xuICAgICAgICB2YXIgY3NzT2JqID0gbmUudXRpbC5leHRlbmQocG9zaXRpb24sIHRoaXMudGhlbWUubGFiZWwpO1xuICAgICAgICByZXR1cm4gc2VyaWVzVGVtcGxhdGUudHBsU2VyaWVzTGFiZWwoe1xuICAgICAgICAgICAgY3NzVGV4dDogc2VyaWVzVGVtcGxhdGUudHBsQ3NzVGV4dChjc3NPYmopLFxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgZ3JvdXBJbmRleDogZ3JvdXBJbmRleCxcbiAgICAgICAgICAgIGluZGV4OiBpbmRleFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2hvdyBzZXJpZXMgbGFiZWwgYXJlYS5cbiAgICAgKi9cbiAgICBzaG93U2VyaWVzTGFiZWxBcmVhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCghdGhpcy5vcHRpb25zLnNob3dMYWJlbCAmJiAhdGhpcy5vcHRpb25zLmxlZ2VuZFR5cGUpIHx8ICF0aGlzLmVsU2VyaWVzTGFiZWxBcmVhKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBkb20uYWRkQ2xhc3ModGhpcy5lbFNlcmllc0xhYmVsQXJlYSwgJ3Nob3cnKTtcblxuICAgICAgICAobmV3IG5lLmNvbXBvbmVudC5FZmZlY3RzLkZhZGUoe1xuICAgICAgICAgICAgZWxlbWVudDogdGhpcy5lbFNlcmllc0xhYmVsQXJlYSxcbiAgICAgICAgICAgIGR1cmF0aW9uOiAzMDBcbiAgICAgICAgfSkpLmFjdGlvbih7XG4gICAgICAgICAgICBzdGFydDogMCxcbiAgICAgICAgICAgIGVuZDogMSxcbiAgICAgICAgICAgIGNvbXBsZXRlOiBmdW5jdGlvbigpIHt9XG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuXG5uZS51dGlsLkN1c3RvbUV2ZW50cy5taXhpbihTZXJpZXMpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNlcmllcztcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBUaGlzIGlzIHRlbXBsYXRlcyBvZiBzZXJpZXMuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG52YXIgdGVtcGxhdGVNYWtlciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvdGVtcGxhdGVNYWtlci5qcycpO1xuXG52YXIgdGFncyA9IHtcbiAgICBIVE1MX1NFUklFU19MQUJFTDogJzxkaXYgY2xhc3M9XCJuZS1jaGFydC1zZXJpZXMtbGFiZWxcIiBzdHlsZT1cInt7IGNzc1RleHQgfX1cIiBkYXRhLWdyb3VwLWluZGV4PVwie3sgZ3JvdXBJbmRleCB9fVwiIGRhdGEtaW5kZXg9XCJ7eyBpbmRleCB9fVwiPnt7IHZhbHVlIH19PC9kaXY+JyxcbiAgICBURVhUX0NTU19URVhUOiAnbGVmdDp7eyBsZWZ0IH19cHg7dG9wOnt7IHRvcCB9fXB4O2ZvbnQtZmFtaWx5Ont7IGZvbnRGYW1pbHkgfX07Zm9udC1zaXplOnt7IGZvbnRTaXplIH19cHgnXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICB0cGxTZXJpZXNMYWJlbDogdGVtcGxhdGVNYWtlci50ZW1wbGF0ZSh0YWdzLkhUTUxfU0VSSUVTX0xBQkVMKSxcbiAgICB0cGxDc3NUZXh0OiB0ZW1wbGF0ZU1ha2VyLnRlbXBsYXRlKHRhZ3MuVEVYVF9DU1NfVEVYVClcbn07XG4iLCJ2YXIgREVGQVVMVF9DT0xPUiA9ICcjMDAwMDAwJyxcbiAgICBERUZBVUxUX0JBQ0tHUk9VTkQgPSAnI2ZmZmZmZicsXG4gICAgRU1QVFlfRk9OVCA9ICcnLFxuICAgIERFRkFVTFRfQVhJUyA9IHtcbiAgICAgICAgdGlja0NvbG9yOiBERUZBVUxUX0NPTE9SLFxuICAgICAgICB0aXRsZToge1xuICAgICAgICAgICAgZm9udFNpemU6IDEyLFxuICAgICAgICAgICAgZm9udEZhbWlseTogRU1QVFlfRk9OVCxcbiAgICAgICAgICAgIGNvbG9yOiBERUZBVUxUX0NPTE9SXG4gICAgICAgIH0sXG4gICAgICAgIGxhYmVsOiB7XG4gICAgICAgICAgICBmb250U2l6ZTogMTIsXG4gICAgICAgICAgICBmb250RmFtaWx5OiBFTVBUWV9GT05ULFxuICAgICAgICAgICAgY29sb3I6IERFRkFVTFRfQ09MT1JcbiAgICAgICAgfVxuICAgIH07XG5cbnZhciBkZWZhdWx0VGhlbWUgPSB7XG4gICAgY2hhcnQ6IHtcbiAgICAgICAgYmFja2dyb3VuZDogREVGQVVMVF9CQUNLR1JPVU5ELFxuICAgICAgICBmb250RmFtaWx5OiAnVmVyZGFuYSdcbiAgICB9LFxuICAgIHRpdGxlOiB7XG4gICAgICAgIGZvbnRTaXplOiAxOCxcbiAgICAgICAgZm9udEZhbWlseTogRU1QVFlfRk9OVCxcbiAgICAgICAgY29sb3I6IERFRkFVTFRfQ09MT1JcbiAgICB9LFxuICAgIHlBeGlzOiBERUZBVUxUX0FYSVMsXG4gICAgeEF4aXM6IERFRkFVTFRfQVhJUyxcbiAgICBwbG90OiB7XG4gICAgICAgIGxpbmVDb2xvcjogJyNkZGRkZGQnLFxuICAgICAgICBiYWNrZ3JvdW5kOiAnI2ZmZmZmZidcbiAgICB9LFxuICAgIHNlcmllczoge1xuICAgICAgICBsYWJlbDoge1xuICAgICAgICAgICAgZm9udFNpemU6IDExLFxuICAgICAgICAgICAgZm9udEZhbWlseTogRU1QVFlfRk9OVCxcbiAgICAgICAgICAgIGNvbG9yOiBERUZBVUxUX0NPTE9SXG4gICAgICAgIH0sXG4gICAgICAgIGNvbG9yczogWycjYWM0MTQyJywgJyNkMjg0NDUnLCAnI2Y0YmY3NScsICcjOTBhOTU5JywgJyM3NWI1YWEnLCAnIzZhOWZiNScsICcjYWE3NTlmJywgJyM4ZjU1MzYnXVxuICAgIH0sXG4gICAgbGVnZW5kOiB7XG4gICAgICAgIGxhYmVsOiB7XG4gICAgICAgICAgICBmb250U2l6ZTogMTIsXG4gICAgICAgICAgICBmb250RmFtaWx5OiBFTVBUWV9GT05ULFxuICAgICAgICAgICAgY29sb3I6IERFRkFVTFRfQ09MT1JcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZGVmYXVsdFRoZW1lO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFRvb2x0aXAgY29tcG9uZW50LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4uL2NvbnN0LmpzJyksXG4gICAgZG9tID0gcmVxdWlyZSgnLi4vaGVscGVycy9kb21IYW5kbGVyLmpzJyksXG4gICAgcmVuZGVyVXRpbCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvcmVuZGVyVXRpbC5qcycpLFxuICAgIGV2ZW50ID0gcmVxdWlyZSgnLi4vaGVscGVycy9ldmVudExpc3RlbmVyLmpzJyksXG4gICAgdGVtcGxhdGVNYWtlciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvdGVtcGxhdGVNYWtlci5qcycpLFxuICAgIHRvb2x0aXBUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdG9vbHRpcFRlbXBsYXRlLmpzJyk7XG5cbnZhciBUT09MVElQX0dBUCA9IDUsXG4gICAgSElEREVOX1dJRFRIID0gMSxcbiAgICBUT09MVElQX0NMQVNTX05BTUUgPSAnbmUtY2hhcnQtdG9vbHRpcCcsXG4gICAgSElERV9ERUxBWSA9IDA7XG5cbnZhciBjb25jYXQgPSBBcnJheS5wcm90b3R5cGUuY29uY2F0O1xuXG52YXIgVG9vbHRpcCA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBUb29sdGlwLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogVG9vbHRpcCBjb21wb25lbnQuXG4gICAgICogQGNvbnN0cnVjdHMgVG9vbHRpcFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48bnVtYmVyPn0gcGFyYW1zLnZhbHVlcyBjb252ZXJ0ZWQgdmFsdWVzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5fSBwYXJhbXMubGFiZWxzIGxhYmVsc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheX0gcGFyYW1zLmxlZ2VuZExhYmVscyBsZWdlbmQgbGFiZWxzXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcHJlZml4IHRvb2x0aXAgcHJlZml4XG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmJvdW5kIGF4aXMgYm91bmRcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgYXhpcyB0aGVtZVxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICBuZS51dGlsLmV4dGVuZCh0aGlzLCBwYXJhbXMpO1xuICAgICAgICAvKipcbiAgICAgICAgICogVG9vbHRpcCB2aWV3IGNsYXNzTmFtZVxuICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jbGFzc05hbWUgPSAnbmUtY2hhcnQtdG9vbHRpcC1hcmVhJztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIHRvb2x0aXAuXG4gICAgICogQHBhcmFtIHt7cG9zaXRpb246IG9iamVjdH19IGJvdW5kIHRvb2x0aXAgYm91bmRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcHJlZml4IHRvb2x0aXAgaWQgcHJlZml4XG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSB0b29sdGlwIGVsZW1lbnRcbiAgICAgKi9cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZWwgPSBkb20uY3JlYXRlKCdESVYnLCB0aGlzLmNsYXNzTmFtZSksXG4gICAgICAgICAgICBib3VuZCA9IHRoaXMuYm91bmQ7XG5cbiAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJQb3NpdGlvbihlbCwgYm91bmQucG9zaXRpb24pO1xuICAgICAgICBlbC5pbm5lckhUTUwgPSB0aGlzLl9tYWtlVG9vbHRpcHNIdG1sKCk7XG5cbiAgICAgICAgdGhpcy5hdHRhY2hFdmVudChlbCk7XG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSB0b29sdGlwIGRhdGEuXG4gICAgICogQHJldHVybnMge2FycmF5LjxvYmplY3Q+fSB0b29sdGlwIGRhdGFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlVG9vbHRpcERhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbGFiZWxzID0gdGhpcy5sYWJlbHMsXG4gICAgICAgICAgICBncm91cFZhbHVlcyA9IHRoaXMudmFsdWVzLFxuICAgICAgICAgICAgbGVnZW5kTGFiZWxzID0gdGhpcy5sZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICB0b29sdGlwRGF0YSA9IG5lLnV0aWwubWFwKGdyb3VwVmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMsIGdyb3VwSW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgaXRlbXMgPSBuZS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IHt2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBsZWdlbmRMYWJlbDogbGVnZW5kTGFiZWxzW2luZGV4XSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBncm91cEluZGV4ICsgJy0nICsgaW5kZXhcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxhYmVscykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5sYWJlbCA9IGxhYmVsc1tncm91cEluZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBpdGVtcztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gY29uY2F0LmFwcGx5KFtdLCB0b29sdGlwRGF0YSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgaHRtbCBvZiB0b29sdGlwLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhIHRvb2x0aXAgZGF0YVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwcmVmaXggdG9vbHRpcCBpZCBwcmVmaXhcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBodG1sXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVRvb2x0aXBzSHRtbDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zLFxuICAgICAgICAgICAgcHJlZml4ID0gdGhpcy5wcmVmaXgsXG4gICAgICAgICAgICBkYXRhID0gdGhpcy5fbWFrZVRvb2x0aXBEYXRhKCksXG4gICAgICAgICAgICBvcHRpb25UZW1wbGF0ZSA9IG9wdGlvbnMudGVtcGxhdGUgPyBvcHRpb25zLnRlbXBsYXRlIDogJycsXG4gICAgICAgICAgICB0cGxPdXRlciA9IHRvb2x0aXBUZW1wbGF0ZS50cGxUb29sdGlwLFxuICAgICAgICAgICAgdHBsVG9vbHRpcCA9IG9wdGlvblRlbXBsYXRlID8gdGVtcGxhdGVNYWtlci50ZW1wbGF0ZShvcHRpb25UZW1wbGF0ZSkgOiB0b29sdGlwVGVtcGxhdGUudHBsRGVmYXVsdFRlbXBsYXRlLFxuICAgICAgICAgICAgc3VmZml4ID0gb3B0aW9ucy5zdWZmaXggPyAnJm5ic3A7JyArIG9wdGlvbnMuc3VmZml4IDogJycsXG4gICAgICAgICAgICBodG1sID0gbmUudXRpbC5tYXAoZGF0YSwgZnVuY3Rpb24odG9vbHRpcERhdGEpIHtcbiAgICAgICAgICAgICAgICB2YXIgaWQgPSBwcmVmaXggKyB0b29sdGlwRGF0YS5pZCxcbiAgICAgICAgICAgICAgICAgICAgdG9vbHRpcEh0bWw7XG5cbiAgICAgICAgICAgICAgICB0b29sdGlwRGF0YSA9IG5lLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICcnLFxuICAgICAgICAgICAgICAgICAgICBsZWdlbmRMYWJlbDogJycsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgc3VmZml4OiBzdWZmaXhcbiAgICAgICAgICAgICAgICB9LCB0b29sdGlwRGF0YSk7XG4gICAgICAgICAgICAgICAgdG9vbHRpcEh0bWwgPSB0cGxUb29sdGlwKHRvb2x0aXBEYXRhKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHBsT3V0ZXIoe1xuICAgICAgICAgICAgICAgICAgICBpZDogaWQsXG4gICAgICAgICAgICAgICAgICAgIGh0bWw6IHRvb2x0aXBIdG1sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCB0aGlzKS5qb2luKCcnKTtcbiAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBpbmRleCBmcm9tIGlkXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGlkIHRvb2x0aXAgaWRcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPG51bWJlcj59IGluZGV4ZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRJbmRleEZyb21JZDogZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgdmFyIGlkcyA9IGlkLnNwbGl0KCctJyksXG4gICAgICAgICAgICBzbGljZUluZGV4ID0gaWRzLmxlbmd0aCAtIDI7XG4gICAgICAgIHJldHVybiBpZHMuc2xpY2Uoc2xpY2VJbmRleCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZpcmUgY3VzdG9tIGV2ZW50IHNob3dBbmltYXRpb24uXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGlkIHRvb2x0aXAgaWRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9maXJlU2hvd0FuaW1hdGlvbjogZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgdmFyIGluZGV4ZXMgPSB0aGlzLl9nZXRJbmRleEZyb21JZChpZCk7XG4gICAgICAgIHRoaXMuZmlyZSgnc2hvd0FuaW1hdGlvbicsIHtcbiAgICAgICAgICAgIGdyb3VwSW5kZXg6IGluZGV4ZXNbMF0sXG4gICAgICAgICAgICBpbmRleDogaW5kZXhlc1sxXVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmlyZSBjdXN0b20gZXZlbnQgaGlkZUFuaW1hdGlvbi5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgdG9vbHRpcCBpZFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2ZpcmVIaWRlQW5pbWF0aW9uOiBmdW5jdGlvbihpZCkge1xuICAgICAgICB2YXIgaW5kZXhlcyA9IHRoaXMuX2dldEluZGV4RnJvbUlkKGlkKTtcbiAgICAgICAgdGhpcy5maXJlKCdoaWRlQW5pbWF0aW9uJywge1xuICAgICAgICAgICAgZ3JvdXBJbmRleDogaW5kZXhlc1swXSxcbiAgICAgICAgICAgIGluZGV4OiBpbmRleGVzWzFdXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBPbiBtb3VzZW92ZXIgZXZlbnQgaGFuZGxlciBmb3IgdG9vbHRpcCBhcmVhXG4gICAgICogQHBhcmFtIHtNb3VzZUV2ZW50fSBlIG1vdXNlIGV2ZW50XG4gICAgICovXG4gICAgb25Nb3VzZW92ZXI6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIGVsVGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50LFxuICAgICAgICAgICAgaWQ7XG5cbiAgICAgICAgaWYgKCFkb20uaGFzQ2xhc3MoZWxUYXJnZXQsIFRPT0xUSVBfQ0xBU1NfTkFNRSkpIHtcbiAgICAgICAgICAgIGVsVGFyZ2V0ID0gZG9tLmZpbmRQYXJlbnRCeUNsYXNzKGVsVGFyZ2V0LCBUT09MVElQX0NMQVNTX05BTUUpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zaG93ZWRJZCA9IGlkID0gZWxUYXJnZXQuaWQ7XG4gICAgICAgIHRoaXMuX2ZpcmVTaG93QW5pbWF0aW9uKGlkKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogT24gbW91c2VvdXQgZXZlbnQgaGFuZGxlciBmb3IgdG9vbHRpcCBhcmVhXG4gICAgICogQHBhcmFtIHtNb3VzZUV2ZW50fSBlIG1vdXNlIGV2ZW50XG4gICAgICovXG4gICAgb25Nb3VzZW91dDogZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgZWxUYXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQsXG4gICAgICAgICAgICB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgIGluZGV4ZXM7XG5cbiAgICAgICAgaWYgKCFkb20uaGFzQ2xhc3MoZWxUYXJnZXQsIFRPT0xUSVBfQ0xBU1NfTkFNRSkpIHtcbiAgICAgICAgICAgIGVsVGFyZ2V0ID0gZG9tLmZpbmRQYXJlbnRCeUNsYXNzKGVsVGFyZ2V0LCBUT09MVElQX0NMQVNTX05BTUUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaW5kZXhlcyA9IHRoaXMuX2dldEluZGV4RnJvbUlkKGVsVGFyZ2V0LmlkKTtcblxuICAgICAgICB0aGlzLl9oaWRlVG9vbHRpcChlbFRhcmdldCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGF0LmZpcmUoJ2hpZGVBbmltYXRpb24nLCB7XG4gICAgICAgICAgICAgICAgZ3JvdXBJbmRleDogaW5kZXhlc1swXSxcbiAgICAgICAgICAgICAgICBpbmRleDogaW5kZXhlc1sxXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxjdWxhdGUgdG9vbHRpcCBwb3NpdGlvbiBhYm91dCBub3QgYmFyIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHt7Ym91bmQ6IG9iamVjdH19IHBhcmFtcy5kYXRhIGdyYXBoIGluZm9ybWF0aW9uXG4gICAgICogICAgICBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IHBhcmFtcy5kaW1lbnNpb24gdG9vbHRpcCBkaW1lbnNpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMucG9zaXRpb25PcHRpb24gcG9zaXRpb24gb3B0aW9uIChleDogJ2xlZnQgdG9wJylcbiAgICAgKiBAcmV0dXJucyB7e3RvcDogbnVtYmVyLCBsZWZ0OiBudW1iZXJ9fSBwb3NpdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NhbGN1bGF0ZVRvb2x0aXBQb3NpdGlvbkFib3V0Tm90QmFyQ2hhcnQ6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgYm91bmQgPSBwYXJhbXMuYm91bmQsXG4gICAgICAgICAgICBhZGRQb3NpdGlvbiA9IHBhcmFtcy5hZGRQb3NpdGlvbixcbiAgICAgICAgICAgIG1pbnVzV2lkdGggPSBwYXJhbXMuZGltZW5zaW9uLndpZHRoIC0gKGJvdW5kLndpZHRoIHx8IDApLFxuICAgICAgICAgICAgbGluZUdhcCA9IGJvdW5kLndpZHRoID8gMCA6IFRPT0xUSVBfR0FQLFxuICAgICAgICAgICAgcG9zaXRpb25PcHRpb24gPSBwYXJhbXMucG9zaXRpb25PcHRpb24gfHwgJycsXG4gICAgICAgICAgICB0b29sdGlwSGVpZ2h0ID0gcGFyYW1zLmRpbWVuc2lvbi5oZWlnaHQsXG4gICAgICAgICAgICByZXN1bHQgPSB7fTtcbiAgICAgICAgcmVzdWx0LmxlZnQgPSBib3VuZC5sZWZ0ICsgKEhJRERFTl9XSURUSCAqIDIpICsgYWRkUG9zaXRpb24ubGVmdDtcbiAgICAgICAgcmVzdWx0LnRvcCA9IGJvdW5kLnRvcCAtIHRvb2x0aXBIZWlnaHQgKyBhZGRQb3NpdGlvbi50b3A7XG5cbiAgICAgICAgaWYgKHBvc2l0aW9uT3B0aW9uLmluZGV4T2YoJ2xlZnQnKSA+IC0xKSB7XG4gICAgICAgICAgICByZXN1bHQubGVmdCAtPSBtaW51c1dpZHRoICsgbGluZUdhcDtcbiAgICAgICAgfSBlbHNlIGlmIChwb3NpdGlvbk9wdGlvbi5pbmRleE9mKCdjZW50ZXInKSA+IC0xKSB7XG4gICAgICAgICAgICByZXN1bHQubGVmdCAtPSBtaW51c1dpZHRoIC8gMjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdC5sZWZ0ICs9IGxpbmVHYXA7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocG9zaXRpb25PcHRpb24uaW5kZXhPZignYm90dG9tJykgPiAtMSkge1xuICAgICAgICAgICAgcmVzdWx0LnRvcCArPSB0b29sdGlwSGVpZ2h0IC0gSElEREVOX1dJRFRIICsgbGluZUdhcDtcbiAgICAgICAgfSBlbHNlIGlmIChwb3NpdGlvbk9wdGlvbi5pbmRleE9mKCdtaWRkbGUnKSA+IC0xKSB7XG4gICAgICAgICAgICByZXN1bHQudG9wICs9IHRvb2x0aXBIZWlnaHQgLyAyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0LnRvcCAtPSBUT09MVElQX0dBUCArIEhJRERFTl9XSURUSDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGN1bGF0ZSB0b29sdGlwIHBvc2l0aW9uIGFib3V0IGJhciBjaGFydC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7e2JvdW5kOiBvYmplY3R9fSBwYXJhbXMuZGF0YSBncmFwaCBpbmZvcm1hdGlvblxuICAgICAqICAgICAgQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBwYXJhbXMuZGltZW5zaW9uIHRvb2x0aXAgZGltZW5zaW9uXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLnBvc2l0aW9uT3B0aW9uIHBvc2l0aW9uIG9wdGlvbiAoZXg6ICdsZWZ0IHRvcCcpXG4gICAgICogQHJldHVybnMge3t0b3A6IG51bWJlciwgbGVmdDogbnVtYmVyfX0gcG9zaXRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jYWxjdWxhdGVUb29sdGlwUG9zaXRpb25BYm91dEJhckNoYXJ0OiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGJvdW5kID0gcGFyYW1zLmJvdW5kLFxuICAgICAgICAgICAgYWRkUG9zaXRpb24gPSBwYXJhbXMuYWRkUG9zaXRpb24sXG4gICAgICAgICAgICBtaW51c0hlaWdodCA9IHBhcmFtcy5kaW1lbnNpb24uaGVpZ2h0IC0gKGJvdW5kLmhlaWdodCB8fCAwKSxcbiAgICAgICAgICAgIHBvc2l0aW9uT3B0aW9uID0gcGFyYW1zLnBvc2l0aW9uT3B0aW9uIHx8ICcnLFxuICAgICAgICAgICAgdG9vbHRpcFdpZHRoID0gcGFyYW1zLmRpbWVuc2lvbi53aWR0aCxcbiAgICAgICAgICAgIHJlc3VsdCA9IHt9O1xuXG4gICAgICAgIHJlc3VsdC5sZWZ0ID0gYm91bmQubGVmdCArIGJvdW5kLndpZHRoICsgYWRkUG9zaXRpb24ubGVmdDtcbiAgICAgICAgcmVzdWx0LnRvcCA9IGJvdW5kLnRvcCArIGFkZFBvc2l0aW9uLnRvcDtcblxuICAgICAgICAvLyBUT0RPIDogcG9zaXRpb25PcHRpb25z7J2EIOqwneyytOuhnCDrp4zrk6TslrTshJwg6rKA7IKs7ZWY64+E66GdIOuzgOqyve2VmOq4sCBleCkgcG9zaXRpb25PcHRpb24ubGVmdCA9IHRydWVcbiAgICAgICAgaWYgKHBvc2l0aW9uT3B0aW9uLmluZGV4T2YoJ2xlZnQnKSA+IC0xKSB7XG4gICAgICAgICAgICByZXN1bHQubGVmdCAtPSB0b29sdGlwV2lkdGg7XG4gICAgICAgIH0gZWxzZSBpZiAocG9zaXRpb25PcHRpb24uaW5kZXhPZignY2VudGVyJykgPiAtMSkge1xuICAgICAgICAgICAgcmVzdWx0LmxlZnQgLT0gdG9vbHRpcFdpZHRoIC8gMjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdC5sZWZ0ICs9IFRPT0xUSVBfR0FQO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBvc2l0aW9uT3B0aW9uLmluZGV4T2YoJ3RvcCcpID4gLTEpIHtcbiAgICAgICAgICAgIHJlc3VsdC50b3AgLT0gbWludXNIZWlnaHQgKyBISURERU5fV0lEVEg7XG4gICAgICAgIH0gZWxzZSBpZiAocG9zaXRpb25PcHRpb24uaW5kZXhPZignbWlkZGxlJykgPiAtMSkge1xuICAgICAgICAgICAgcmVzdWx0LnRvcCAtPSBtaW51c0hlaWdodCAvIDI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQudG9wIC09IEhJRERFTl9XSURUSCAqIDI7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxjdWxhdGUgdG9vbHRpcCBwb3NpdGlvbi5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gcGFyYW1zLmJvdW5kIGdyYXBoIGJvdW5kXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLmNoYXJ0VHlwZSBjaGFydCB0eXBlXG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5hbGxvd05lZ2F0aXZlVG9vbHRpcCB3aGV0aGVyIGFsbG93IG5lZ2F0aXZlIHRvb2x0aXAgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IHBhcmFtcy5kaW1lbnNpb24gdG9vbHRpcCBkaW1lbnNpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMucG9zaXRpb25PcHRpb24gcG9zaXRpb24gb3B0aW9uIChleDogJ2xlZnQgdG9wJylcbiAgICAgKiBAcmV0dXJucyB7e3RvcDogbnVtYmVyLCBsZWZ0OiBudW1iZXJ9fSBwb3NpdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NhbGN1bGF0ZVRvb2x0aXBQb3NpdGlvbjogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSB7fSxcbiAgICAgICAgICAgIHNpemVUeXBlLCBwb3NpdGlvblR5cGUsIGFkZFBhZGRpbmc7XG4gICAgICAgIGlmIChwYXJhbXMuY2hhcnRUeXBlID09PSBjaGFydENvbnN0LkNIQVJUX1RZUEVfQkFSKSB7XG4gICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9jYWxjdWxhdGVUb29sdGlwUG9zaXRpb25BYm91dEJhckNoYXJ0KHBhcmFtcyk7XG4gICAgICAgICAgICBzaXplVHlwZSA9ICd3aWR0aCc7XG4gICAgICAgICAgICBwb3NpdGlvblR5cGUgPSAnbGVmdCc7XG4gICAgICAgICAgICBhZGRQYWRkaW5nID0gMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuX2NhbGN1bGF0ZVRvb2x0aXBQb3NpdGlvbkFib3V0Tm90QmFyQ2hhcnQocGFyYW1zKTtcbiAgICAgICAgICAgIHNpemVUeXBlID0gJ2hlaWdodCc7XG4gICAgICAgICAgICBwb3NpdGlvblR5cGUgPSAndG9wJztcbiAgICAgICAgICAgIGFkZFBhZGRpbmcgPSAtMTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYXJhbXMuYWxsb3dOZWdhdGl2ZVRvb2x0aXApIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuX21vdmVUb1N5bW1ldHJ5KHJlc3VsdCwge1xuICAgICAgICAgICAgICAgIGJvdW5kOiBwYXJhbXMuYm91bmQsXG4gICAgICAgICAgICAgICAgaWQ6IHBhcmFtcy5pZCxcbiAgICAgICAgICAgICAgICBkaW1lbnNpb246IHBhcmFtcy5kaW1lbnNpb24sXG4gICAgICAgICAgICAgICAgc2l6ZVR5cGU6IHNpemVUeXBlLFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogcG9zaXRpb25UeXBlLFxuICAgICAgICAgICAgICAgIGFkZFBhZGRpbmc6IGFkZFBhZGRpbmdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB2YWx1ZSBieSBpZC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgdG9vbHRpcCBpZFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IHJlc3VsdCB2YWx1ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFZhbHVlQnlJZDogZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgdmFyIGluZGV4ZXMgPSB0aGlzLl9nZXRJbmRleEZyb21JZChpZCksXG4gICAgICAgICAgICB2YWx1ZSA9IHRoaXMudmFsdWVzW2luZGV4ZXNbMF1dW2luZGV4ZXNbMV1dO1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1vdmUgdG8gc3ltbWV0cnkuXG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IHBvc2l0aW9uIHRvb2x0aXAgcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gcGFyYW1zLmJvdW5kIGdyYXBoIGJvdW5kXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLmlkIHRvb2x0aXAgaWRcbiAgICAgKiAgICAgIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gcGFyYW1zLmRpbWVuc2lvbiB0b29sdGlwIGRpbWVuc2lvblxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5zaXplVHlwZSBzaXplIHR5cGUgKHdpZHRoIG9yIGhlaWdodClcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMucG9zaXRpb25UeXBlIHBvc2l0aW9uIHR5cGUgKGxlZnQgb3IgdG9wKVxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5hZGRQYWRkaW5nIGFkZCBwYWRkaW5nXG4gICAgICogQHJldHVybnMge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gbW92ZWQgcG9zaXRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tb3ZlVG9TeW1tZXRyeTogZnVuY3Rpb24ocG9zaXRpb24sIHBhcmFtcykge1xuICAgICAgICB2YXIgYm91bmQgPSBwYXJhbXMuYm91bmQsXG4gICAgICAgICAgICBzaXplVHlwZSA9IHBhcmFtcy5zaXplVHlwZSxcbiAgICAgICAgICAgIHBvc2l0aW9uVHlwZSA9IHBhcmFtcy5wb3NpdGlvblR5cGUsXG4gICAgICAgICAgICB2YWx1ZSA9IHRoaXMuX2dldFZhbHVlQnlJZChwYXJhbXMuaWQpLFxuICAgICAgICAgICAgY2VudGVyO1xuXG4gICAgICAgIGlmICh2YWx1ZSA8IDApIHtcbiAgICAgICAgICAgIGNlbnRlciA9IGJvdW5kW3Bvc2l0aW9uVHlwZV0gKyAoYm91bmRbc2l6ZVR5cGVdIC8gMikgKyAocGFyYW1zLmFkZFBhZGRpbmcgfHwgMCk7XG4gICAgICAgICAgICBwb3NpdGlvbltwb3NpdGlvblR5cGVdID0gcG9zaXRpb25bcG9zaXRpb25UeXBlXSAtIChwb3NpdGlvbltwb3NpdGlvblR5cGVdIC0gY2VudGVyKSAqIDIgLSBwYXJhbXMuZGltZW5zaW9uW3NpemVUeXBlXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwb3NpdGlvbjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb25TaG93IGlzIGNhbGxiYWNrIG9mIGN1c3RvbSBldmVudCBzaG93VG9vbHRpcCBmb3IgU2VyaWVzVmlldy5cbiAgICAgKiBAcGFyYW0ge3tpZDogc3RyaW5nLCBib3VuZDogb2JqZWN0fX0gcGFyYW1zIHRvb2x0aXAgZGF0YVxuICAgICAqL1xuICAgIG9uU2hvdzogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBlbFRvb2x0aXAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwYXJhbXMuaWQpLFxuICAgICAgICAgICAgYWRkUG9zaXRpb24gPSBuZS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgbGVmdDogMCxcbiAgICAgICAgICAgICAgICB0b3A6IDBcbiAgICAgICAgICAgIH0sIHRoaXMub3B0aW9ucy5hZGRQb3NpdGlvbiksXG4gICAgICAgICAgICBwb3NpdGlvbk9wdGlvbiA9IHRoaXMub3B0aW9ucy5wb3NpdGlvbiB8fCAnJyxcbiAgICAgICAgICAgIHBvc2l0aW9uO1xuXG4gICAgICAgIGlmICh0aGlzLnNob3dlZElkKSB7XG4gICAgICAgICAgICBkb20ucmVtb3ZlQ2xhc3MoZWxUb29sdGlwLCAnc2hvdycpO1xuICAgICAgICAgICAgdGhpcy5fZmlyZUhpZGVBbmltYXRpb24odGhpcy5zaG93ZWRJZCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNob3dlZElkID0gcGFyYW1zLmlkO1xuICAgICAgICBkb20uYWRkQ2xhc3MoZWxUb29sdGlwLCAnc2hvdycpO1xuXG4gICAgICAgIHBvc2l0aW9uID0gdGhpcy5fY2FsY3VsYXRlVG9vbHRpcFBvc2l0aW9uKG5lLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgIGRpbWVuc2lvbjoge1xuICAgICAgICAgICAgICAgIHdpZHRoOiBlbFRvb2x0aXAub2Zmc2V0V2lkdGgsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBlbFRvb2x0aXAub2Zmc2V0SGVpZ2h0XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYWRkUG9zaXRpb246IGFkZFBvc2l0aW9uLFxuICAgICAgICAgICAgcG9zaXRpb25PcHRpb246IHBvc2l0aW9uT3B0aW9uIHx8ICcnXG4gICAgICAgIH0sIHBhcmFtcykpO1xuXG4gICAgICAgIGVsVG9vbHRpcC5zdHlsZS5jc3NUZXh0ID0gW1xuICAgICAgICAgICAgcmVuZGVyVXRpbC5jb25jYXRTdHIoJ2xlZnQ6JywgcG9zaXRpb24ubGVmdCwgJ3B4JyksXG4gICAgICAgICAgICByZW5kZXJVdGlsLmNvbmNhdFN0cigndG9wOicsIHBvc2l0aW9uLnRvcCwgJ3B4JylcbiAgICAgICAgXS5qb2luKCc7Jyk7XG5cbiAgICAgICAgdGhpcy5fZmlyZVNob3dBbmltYXRpb24ocGFyYW1zLmlkKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb25IaWRlIGlzIGNhbGxiYWNrIG9mIGN1c3RvbSBldmVudCBoaWRlVG9vbHRpcCBmb3IgU2VyaWVzVmlld1xuICAgICAqIEBwYXJhbSB7e2lkOiBzdHJpbmd9fSBkYXRhIHRvb2x0aXAgZGF0YVxuICAgICAqL1xuICAgIG9uSGlkZTogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgZWxUb29sdGlwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZGF0YS5pZCksXG4gICAgICAgICAgICB0aGF0ID0gdGhpcztcblxuICAgICAgICB0aGlzLl9oaWRlVG9vbHRpcChlbFRvb2x0aXAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGluZGV4ZXMgPSB0aGF0Ll9nZXRJbmRleEZyb21JZChkYXRhLmlkKTtcblxuICAgICAgICAgICAgdGhhdC5maXJlKCdoaWRlQW5pbWF0aW9uJywge1xuICAgICAgICAgICAgICAgIGdyb3VwSW5kZXg6IGluZGV4ZXNbMF0sXG4gICAgICAgICAgICAgICAgaW5kZXg6IGluZGV4ZXNbMV1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBkYXRhID0gbnVsbDtcbiAgICAgICAgICAgIGVsVG9vbHRpcCA9IG51bGw7XG4gICAgICAgICAgICB0aGF0ID0gbnVsbDtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhpZGUgdG9vbHRpcC5cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbFRvb2x0aXAgdG9vbHRpcCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgY2FsbGJhY2tcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9oaWRlVG9vbHRpcDogZnVuY3Rpb24oZWxUb29sdGlwLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgIGRlbGV0ZSB0aGlzLnNob3dlZElkO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHRoYXQuc2hvd2VkSWQgPT09IGVsVG9vbHRpcC5pZCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZG9tLnJlbW92ZUNsYXNzKGVsVG9vbHRpcCwgJ3Nob3cnKTtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoYXQgPSBudWxsO1xuICAgICAgICB9LCBISURFX0RFTEFZKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGV2ZW50XG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKi9cbiAgICBhdHRhY2hFdmVudDogZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgZXZlbnQuYmluZEV2ZW50KCdtb3VzZW92ZXInLCBlbCwgbmUudXRpbC5iaW5kKHRoaXMub25Nb3VzZW92ZXIsIHRoaXMpKTtcbiAgICAgICAgZXZlbnQuYmluZEV2ZW50KCdtb3VzZW91dCcsIGVsLCBuZS51dGlsLmJpbmQodGhpcy5vbk1vdXNlb3V0LCB0aGlzKSk7XG4gICAgfVxufSk7XG5cbm5lLnV0aWwuQ3VzdG9tRXZlbnRzLm1peGluKFRvb2x0aXApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRvb2x0aXA7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgVGhpcyBpcyB0ZW1wbGF0ZXMgb2YgdG9vbHRpcC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbnZhciB0ZW1wbGF0ZU1ha2VyID0gcmVxdWlyZSgnLi4vaGVscGVycy90ZW1wbGF0ZU1ha2VyLmpzJyk7XG5cbnZhciB0YWdzID0ge1xuICAgIEhUTUxfVE9PTFRJUDogJzxkaXYgY2xhc3M9XCJuZS1jaGFydC10b29sdGlwXCIgaWQ9XCJ7eyBpZCB9fVwiPnt7IGh0bWwgfX08L2Rpdj4nLFxuICAgIEhUTUxfREVGQVVMVF9URU1QTEFURTogJzxkaXYgY2xhc3M9XCJuZS1jaGFydC1kZWZhdWx0LXRvb2x0aXBcIj4nICtcbiAgICAgICAgJzxkaXY+e3sgbGFiZWwgfX08L2Rpdj4nICtcbiAgICAgICAgJzxkaXY+JyArXG4gICAgICAgICAgICAnPHNwYW4+e3sgbGVnZW5kTGFiZWwgfX08L3NwYW4+OicgK1xuICAgICAgICAgICAgJyZuYnNwOzxzcGFuPnt7IHZhbHVlIH19PC9zcGFuPicgK1xuICAgICAgICAgICAgJzxzcGFuPnt7IHN1ZmZpeCB9fTwvc3Bhbj4nICtcbiAgICAgICAgJzwvZGl2PicgK1xuICAgICc8L2Rpdj4nXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICB0cGxUb29sdGlwOiB0ZW1wbGF0ZU1ha2VyLnRlbXBsYXRlKHRhZ3MuSFRNTF9UT09MVElQKSxcbiAgICB0cGxEZWZhdWx0VGVtcGxhdGU6IHRlbXBsYXRlTWFrZXIudGVtcGxhdGUodGFncy5IVE1MX0RFRkFVTFRfVEVNUExBVEUpXG59O1xuIl19
