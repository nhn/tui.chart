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
        return ne.util.map([].concat(items.data), parseFloat);
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
                    return value === 0 ? 0 : groupPercent * (value / sum);
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
                return value === 0 ? 0 : value / sum;
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXhlcy9heGlzLmpzIiwic3JjL2pzL2F4ZXMvYXhpc1RlbXBsYXRlLmpzIiwic3JjL2pzL2NoYXJ0LmpzIiwic3JjL2pzL2NoYXJ0cy9hcmVhQ2hhcnQuanMiLCJzcmMvanMvY2hhcnRzL2F4aXNUeXBlQmFzZS5qcyIsInNyYy9qcy9jaGFydHMvYmFyQ2hhcnQuanMiLCJzcmMvanMvY2hhcnRzL2NoYXJ0QmFzZS5qcyIsInNyYy9qcy9jaGFydHMvY29sdW1uQ2hhcnQuanMiLCJzcmMvanMvY2hhcnRzL2NvbWJvQ2hhcnQuanMiLCJzcmMvanMvY2hhcnRzL2xpbmVDaGFydC5qcyIsInNyYy9qcy9jaGFydHMvcGllQ2hhcnQuanMiLCJzcmMvanMvY2hhcnRzL3ZlcnRpY2FsVHlwZUJhc2UuanMiLCJzcmMvanMvY29kZS1zbmlwcGV0LXV0aWwuanMiLCJzcmMvanMvY29uc3QuanMiLCJzcmMvanMvZmFjdG9yaWVzL2NoYXJ0RmFjdG9yeS5qcyIsInNyYy9qcy9mYWN0b3JpZXMvcGx1Z2luRmFjdG9yeS5qcyIsInNyYy9qcy9mYWN0b3JpZXMvdGhlbWVGYWN0b3J5LmpzIiwic3JjL2pzL2hlbHBlcnMvYXhpc0RhdGFNYWtlci5qcyIsInNyYy9qcy9oZWxwZXJzL2JvdW5kc01ha2VyLmpzIiwic3JjL2pzL2hlbHBlcnMvY2FsY3VsYXRvci5qcyIsInNyYy9qcy9oZWxwZXJzL2RhdGFDb252ZXJ0ZXIuanMiLCJzcmMvanMvaGVscGVycy9kb21IYW5kbGVyLmpzIiwic3JjL2pzL2hlbHBlcnMvZXZlbnRMaXN0ZW5lci5qcyIsInNyYy9qcy9oZWxwZXJzL3JlbmRlclV0aWwuanMiLCJzcmMvanMvaGVscGVycy90ZW1wbGF0ZU1ha2VyLmpzIiwic3JjL2pzL2xlZ2VuZHMvbGVnZW5kLmpzIiwic3JjL2pzL2xlZ2VuZHMvbGVnZW5kVGVtcGxhdGUuanMiLCJzcmMvanMvcGxvdHMvcGxvdC5qcyIsInNyYy9qcy9wbG90cy9wbG90VGVtcGxhdGUuanMiLCJzcmMvanMvcGx1Z2lucy9wbHVnaW5SYXBoYWVsLmpzIiwic3JjL2pzL3BsdWdpbnMvcmFwaGFlbEFyZWFDaGFydC5qcyIsInNyYy9qcy9wbHVnaW5zL3JhcGhhZWxCYXJDaGFydC5qcyIsInNyYy9qcy9wbHVnaW5zL3JhcGhhZWxMaW5lQ2hhcnQuanMiLCJzcmMvanMvcGx1Z2lucy9yYXBoYWVsTGluZVR5cGVCYXNlLmpzIiwic3JjL2pzL3BsdWdpbnMvcmFwaGFlbFBpZUNoYXJ0LmpzIiwic3JjL2pzL3BsdWdpbnMvcmFwaGFlbFJlbmRlclV0aWwuanMiLCJzcmMvanMvcmVnaXN0ZXJDaGFydHMuanMiLCJzcmMvanMvcmVnaXN0ZXJUaGVtZXMuanMiLCJzcmMvanMvc2VyaWVzL2FyZWFDaGFydFNlcmllcy5qcyIsInNyYy9qcy9zZXJpZXMvYmFyQ2hhcnRTZXJpZXMuanMiLCJzcmMvanMvc2VyaWVzL2NvbHVtbkNoYXJ0U2VyaWVzLmpzIiwic3JjL2pzL3Nlcmllcy9saW5lQ2hhcnRTZXJpZXMuanMiLCJzcmMvanMvc2VyaWVzL2xpbmVUeXBlU2VyaWVzQmFzZS5qcyIsInNyYy9qcy9zZXJpZXMvcGllQ2hhcnRTZXJpZXMuanMiLCJzcmMvanMvc2VyaWVzL3Nlcmllcy5qcyIsInNyYy9qcy9zZXJpZXMvc2VyaWVzVGVtcGxhdGUuanMiLCJzcmMvanMvdGhlbWVzL2RlZmF1bHRUaGVtZS5qcyIsInNyYy9qcy90b29sdGlwcy90b29sdGlwLmpzIiwic3JjL2pzL3Rvb2x0aXBzL3Rvb2x0aXBUZW1wbGF0ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDalNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaG5CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1UkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdG5CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbGVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9KQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0WUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDclBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxYUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuY0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3ICBBeGlzIGNvbXBvbmVudC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGRvbSA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZG9tSGFuZGxlci5qcycpLFxuICAgIGNhbGN1bGF0b3IgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2NhbGN1bGF0b3IuanMnKSxcbiAgICByZW5kZXJVdGlsID0gcmVxdWlyZSgnLi4vaGVscGVycy9yZW5kZXJVdGlsLmpzJyksXG4gICAgYXhpc1RlbXBsYXRlID0gcmVxdWlyZSgnLi9heGlzVGVtcGxhdGUuanMnKTtcblxudmFyIFRJVExFX0FSRUFfV0lEVEhfUEFERElORyA9IDIwLFxuICAgIFZfTEFCRUxfUklHSFRfUEFERElORyA9IDEwO1xuXG52YXIgQXhpcyA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBBeGlzLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogQXhpcyBjb21wb25lbnQuXG4gICAgICogQGNvbnN0cnVjdHMgQXhpc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHt7XG4gICAgICogICAgICAgICAgbGFiZWxzOiBhcnJheS48c3RyaW5nPixcbiAgICAgKiAgICAgICAgICB0aWNrQ291bnQ6IG51bWJlcixcbiAgICAgKiAgICAgICAgICBpc0xhYmVsQXhpczogYm9vbGVhbixcbiAgICAgKiAgICAgICAgICBpc1ZlcnRpY2FsOiBib29sZWFuXG4gICAgICogICAgICB9fSBwYXJhbXMuZGF0YSBheGlzIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuYm91bmQgYXhpcyBib3VuZFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBheGlzIHRoZW1lXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgYXhpcyBvcHRpb25zXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIG5lLnV0aWwuZXh0ZW5kKHRoaXMsIHBhcmFtcyk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBeGlzIHZpZXcgY2xhc3NOYW1lXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNsYXNzTmFtZSA9ICduZS1jaGFydC1heGlzLWFyZWEnO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgYXhpcy5cbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IGF4aXMgYXJlYSBiYXNlIGVsZW1lbnRcbiAgICAgKi9cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YSxcbiAgICAgICAgICAgIHRoZW1lID0gdGhpcy50aGVtZSxcbiAgICAgICAgICAgIGlzVmVydGljYWwgPSAhIWRhdGEuaXNWZXJ0aWNhbCxcbiAgICAgICAgICAgIGlzUG9zaXRpb25SaWdodCA9IGRhdGEuaXNQb3NpdGlvblJpZ2h0LFxuICAgICAgICAgICAgb3B0aW9ucyA9IHRoaXMub3B0aW9ucyxcbiAgICAgICAgICAgIGJvdW5kID0gdGhpcy5ib3VuZCxcbiAgICAgICAgICAgIGRpbWVuc2lvbiA9IGJvdW5kLmRpbWVuc2lvbixcbiAgICAgICAgICAgIHNpemUgPSBpc1ZlcnRpY2FsID8gZGltZW5zaW9uLmhlaWdodCA6IGRpbWVuc2lvbi53aWR0aCxcbiAgICAgICAgICAgIGVsID0gZG9tLmNyZWF0ZSgnRElWJywgdGhpcy5jbGFzc05hbWUpLFxuICAgICAgICAgICAgZWxUaXRsZUFyZWEgPSB0aGlzLl9yZW5kZXJUaXRsZUFyZWEoe1xuICAgICAgICAgICAgICAgIHRpdGxlOiBvcHRpb25zLnRpdGxlLFxuICAgICAgICAgICAgICAgIHRoZW1lOiB0aGVtZS50aXRsZSxcbiAgICAgICAgICAgICAgICBpc1ZlcnRpY2FsOiBpc1ZlcnRpY2FsLFxuICAgICAgICAgICAgICAgIGlzUG9zaXRpb25SaWdodDogaXNQb3NpdGlvblJpZ2h0LFxuICAgICAgICAgICAgICAgIHNpemU6IHNpemVcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgZWxUaWNrQXJlYSA9IHRoaXMuX3JlbmRlclRpY2tBcmVhKHNpemUpLFxuICAgICAgICAgICAgZWxMYWJlbEFyZWEgPSB0aGlzLl9yZW5kZXJMYWJlbEFyZWEoc2l6ZSwgZGltZW5zaW9uLndpZHRoKTtcbiAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJEaW1lbnNpb24oZWwsIGRpbWVuc2lvbik7XG4gICAgICAgIHJlbmRlclV0aWwucmVuZGVyUG9zaXRpb24oZWwsIGJvdW5kLnBvc2l0aW9uKTtcbiAgICAgICAgZG9tLmFkZENsYXNzKGVsLCBpc1ZlcnRpY2FsID8gJ3ZlcnRpY2FsJyA6ICdob3Jpem9udGFsJyk7XG4gICAgICAgIGRvbS5hZGRDbGFzcyhlbCwgaXNQb3NpdGlvblJpZ2h0ID8gJ3JpZ2h0JyA6ICcnKTtcbiAgICAgICAgZG9tLmFwcGVuZChlbCwgW2VsVGl0bGVBcmVhLCBlbFRpY2tBcmVhLCBlbExhYmVsQXJlYV0pO1xuXG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGNzcyBzdHlsZSBvZiB0aXRsZSBhcmVhXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxUaXRsZUFyZWEgdGl0bGUgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzaXplICh3aWR0aCBvciBoZWlnaHQpXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpc1Bvc2l0aW9uUmlnaHQgd2hldGhlciByaWdodCBwb3NpdGlvbiBvciBub3Q/XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyVGl0bGVBcmVhU3R5bGU6IGZ1bmN0aW9uKGVsVGl0bGVBcmVhLCBzaXplLCBpc1Bvc2l0aW9uUmlnaHQpIHtcbiAgICAgICAgdmFyIGNzc1RleHRzID0gW1xuICAgICAgICAgICAgcmVuZGVyVXRpbC5jb25jYXRTdHIoJ3dpZHRoOicsIHNpemUsICdweCcpXG4gICAgICAgIF07XG5cbiAgICAgICAgaWYgKGlzUG9zaXRpb25SaWdodCkge1xuICAgICAgICAgICAgY3NzVGV4dHMucHVzaChyZW5kZXJVdGlsLmNvbmNhdFN0cigncmlnaHQ6JywgLXNpemUsICdweCcpKTtcbiAgICAgICAgICAgIGNzc1RleHRzLnB1c2gocmVuZGVyVXRpbC5jb25jYXRTdHIoJ3RvcDonLCAwLCAncHgnKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjc3NUZXh0cy5wdXNoKHJlbmRlclV0aWwuY29uY2F0U3RyKCdsZWZ0OicsIDAsICdweCcpKTtcbiAgICAgICAgICAgIGlmICghcmVuZGVyVXRpbC5pc0lFOCgpKSB7XG4gICAgICAgICAgICAgICAgY3NzVGV4dHMucHVzaChyZW5kZXJVdGlsLmNvbmNhdFN0cigndG9wOicsIHNpemUsICdweCcpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGVsVGl0bGVBcmVhLnN0eWxlLmNzc1RleHQgKz0gJzsnICsgY3NzVGV4dHMuam9pbignOycpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUaXRsZSBhcmVhIHJlbmRlcmVyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLnRpdGxlIGF4aXMgdGl0bGVcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgdGl0bGUgdGhlbWVcbiAgICAgKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gcGFyYW1zLmlzVmVydGljYWwgd2hldGhlciB2ZXJ0aWNhbCBvciBub3Q/XG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5pc1Bvc2l0aW9uUmlnaHQgd2hldGhlciByaWdodCBwb3NpdGlvbiBvciBub3Q/XG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnNpemUgKHdpZHRoIG9yIGhlaWdodClcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHRpdGxlIGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJUaXRsZUFyZWE6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgZWxUaXRsZUFyZWEgPSByZW5kZXJVdGlsLnJlbmRlclRpdGxlKHBhcmFtcy50aXRsZSwgcGFyYW1zLnRoZW1lLCAnbmUtY2hhcnQtdGl0bGUtYXJlYScpO1xuXG4gICAgICAgIGlmIChlbFRpdGxlQXJlYSAmJiBwYXJhbXMuaXNWZXJ0aWNhbCkge1xuICAgICAgICAgICAgdGhpcy5fcmVuZGVyVGl0bGVBcmVhU3R5bGUoZWxUaXRsZUFyZWEsIHBhcmFtcy5zaXplLCBwYXJhbXMuaXNQb3NpdGlvblJpZ2h0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBlbFRpdGxlQXJlYTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVkbmVyIHRpY2sgYXJlYS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc2l6ZSBzaXplIG9yIGhlaWdodFxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gdGljayBhcmVhIGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJUaWNrQXJlYTogZnVuY3Rpb24oc2l6ZSkge1xuICAgICAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YSxcbiAgICAgICAgICAgIHRpY2tDb3VudCA9IGRhdGEudGlja0NvdW50LFxuICAgICAgICAgICAgdGlja0NvbG9yID0gdGhpcy50aGVtZS50aWNrQ29sb3IsXG4gICAgICAgICAgICBwb3NpdGlvbnMgPSBjYWxjdWxhdG9yLm1ha2VUaWNrUGl4ZWxQb3NpdGlvbnMoc2l6ZSwgdGlja0NvdW50KSxcbiAgICAgICAgICAgIGVsVGlja0FyZWEgPSBkb20uY3JlYXRlKCdESVYnLCAnbmUtY2hhcnQtdGljay1hcmVhJyksXG4gICAgICAgICAgICBpc1ZlcnRpY2FsID0gZGF0YS5pc1ZlcnRpY2FsLFxuICAgICAgICAgICAgcG9zVHlwZSA9IGlzVmVydGljYWwgPyAnYm90dG9tJyA6ICdsZWZ0JyxcbiAgICAgICAgICAgIGJvcmRlckNvbG9yVHlwZSA9IGlzVmVydGljYWwgPyAoZGF0YS5pc1Bvc2l0aW9uUmlnaHQgPyAnYm9yZGVyTGVmdENvbG9yJyA6ICdib3JkZXJSaWdodENvbG9yJykgOiAnYm9yZGVyVG9wQ29sb3InLFxuICAgICAgICAgICAgdGVtcGxhdGUgPSBheGlzVGVtcGxhdGUuVFBMX0FYSVNfVElDSyxcbiAgICAgICAgICAgIHRpY2tzSHRtbCA9IG5lLnV0aWwubWFwKHBvc2l0aW9ucywgZnVuY3Rpb24ocG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgY3NzVGV4dCA9IFtcbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyVXRpbC5jb25jYXRTdHIoJ2JhY2tncm91bmQtY29sb3I6JywgdGlja0NvbG9yKSxcbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyVXRpbC5jb25jYXRTdHIocG9zVHlwZSwgJzogJywgcG9zaXRpb24sICdweCcpXG4gICAgICAgICAgICAgICAgXS5qb2luKCc7Jyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRlbXBsYXRlKHtjc3NUZXh0OiBjc3NUZXh0fSk7XG4gICAgICAgICAgICB9LCB0aGlzKS5qb2luKCcnKTtcblxuICAgICAgICBlbFRpY2tBcmVhLmlubmVySFRNTCA9IHRpY2tzSHRtbDtcbiAgICAgICAgZWxUaWNrQXJlYS5zdHlsZVtib3JkZXJDb2xvclR5cGVdID0gdGlja0NvbG9yO1xuXG4gICAgICAgIHJldHVybiBlbFRpY2tBcmVhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgbGFiZWwgYXJlYS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc2l6ZSBsYWJlbCBhcmVhIHNpemVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYXhpc1dpZHRoIGF4aXMgYXJlYSB3aWR0aFxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gbGFiZWwgYXJlYSBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyTGFiZWxBcmVhOiBmdW5jdGlvbihzaXplLCBheGlzV2lkdGgpIHtcbiAgICAgICAgdmFyIGRhdGEgPSB0aGlzLmRhdGEsXG4gICAgICAgICAgICB0aGVtZSA9IHRoaXMudGhlbWUsXG4gICAgICAgICAgICB0aWNrUGl4ZWxQb3NpdGlvbnMgPSBjYWxjdWxhdG9yLm1ha2VUaWNrUGl4ZWxQb3NpdGlvbnMoc2l6ZSwgZGF0YS50aWNrQ291bnQpLFxuICAgICAgICAgICAgbGFiZWxTaXplID0gdGlja1BpeGVsUG9zaXRpb25zWzFdIC0gdGlja1BpeGVsUG9zaXRpb25zWzBdLFxuICAgICAgICAgICAgbGFiZWxzID0gZGF0YS5sYWJlbHMsXG4gICAgICAgICAgICBpc1ZlcnRpY2FsID0gZGF0YS5pc1ZlcnRpY2FsLFxuICAgICAgICAgICAgaXNMYWJlbEF4aXMgPSBkYXRhLmlzTGFiZWxBeGlzLFxuICAgICAgICAgICAgcG9zVHlwZSA9ICdsZWZ0JyxcbiAgICAgICAgICAgIGNzc1RleHRzID0gdGhpcy5fbWFrZUxhYmVsQ3NzVGV4dHMoe1xuICAgICAgICAgICAgICAgIGlzVmVydGljYWw6IGlzVmVydGljYWwsXG4gICAgICAgICAgICAgICAgaXNMYWJlbEF4aXM6IGlzTGFiZWxBeGlzLFxuICAgICAgICAgICAgICAgIGxhYmVsU2l6ZTogbGFiZWxTaXplXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGVsTGFiZWxBcmVhID0gZG9tLmNyZWF0ZSgnRElWJywgJ25lLWNoYXJ0LWxhYmVsLWFyZWEnKSxcbiAgICAgICAgICAgIGFyZWFDc3NUZXh0ID0gcmVuZGVyVXRpbC5tYWtlRm9udENzc1RleHQodGhlbWUubGFiZWwpLFxuICAgICAgICAgICAgbGFiZWxzSHRtbCwgdGl0bGVBcmVhV2lkdGg7XG5cbiAgICAgICAgaWYgKGlzVmVydGljYWwpIHtcbiAgICAgICAgICAgIHBvc1R5cGUgPSBpc0xhYmVsQXhpcyA/ICd0b3AnIDogJ2JvdHRvbSc7XG4gICAgICAgICAgICB0aXRsZUFyZWFXaWR0aCA9IHRoaXMuX2dldFJlbmRlcmVkVGl0bGVIZWlnaHQoKSArIFRJVExFX0FSRUFfV0lEVEhfUEFERElORztcbiAgICAgICAgICAgIGFyZWFDc3NUZXh0ICs9ICc7d2lkdGg6JyArIChheGlzV2lkdGggLSB0aXRsZUFyZWFXaWR0aCArIFZfTEFCRUxfUklHSFRfUEFERElORykgKyAncHgnO1xuICAgICAgICB9XG5cbiAgICAgICAgdGlja1BpeGVsUG9zaXRpb25zLmxlbmd0aCA9IGxhYmVscy5sZW5ndGg7XG5cbiAgICAgICAgbGFiZWxzSHRtbCA9IHRoaXMuX21ha2VMYWJlbHNIdG1sKHtcbiAgICAgICAgICAgIHBvc2l0aW9uczogdGlja1BpeGVsUG9zaXRpb25zLFxuICAgICAgICAgICAgbGFiZWxzOiBsYWJlbHMsXG4gICAgICAgICAgICBwb3NUeXBlOiBwb3NUeXBlLFxuICAgICAgICAgICAgY3NzVGV4dHM6IGNzc1RleHRzXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGVsTGFiZWxBcmVhLmlubmVySFRNTCA9IGxhYmVsc0h0bWw7XG4gICAgICAgIGVsTGFiZWxBcmVhLnN0eWxlLmNzc1RleHQgPSBhcmVhQ3NzVGV4dDtcblxuICAgICAgICB0aGlzLl9jaGFuZ2VMYWJlbEFyZWFQb3NpdGlvbih7XG4gICAgICAgICAgICBlbExhYmVsQXJlYTogZWxMYWJlbEFyZWEsXG4gICAgICAgICAgICBpc1ZlcnRpY2FsOiBpc1ZlcnRpY2FsLFxuICAgICAgICAgICAgaXNMYWJlbEF4aXM6IGlzTGFiZWxBeGlzLFxuICAgICAgICAgICAgdGhlbWU6IHRoZW1lLmxhYmVsLFxuICAgICAgICAgICAgbGFiZWxTaXplOiBsYWJlbFNpemVcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGVsTGFiZWxBcmVhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgaGVpZ2h0IG9mIHRpdGxlIGFyZWEgO1xuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IGhlaWdodFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFJlbmRlcmVkVGl0bGVIZWlnaHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdGl0bGUgPSB0aGlzLm9wdGlvbnMudGl0bGUsXG4gICAgICAgICAgICB0aGVtZSA9IHRoaXMudGhlbWUudGl0bGUsXG4gICAgICAgICAgICByZXN1bHQgPSB0aXRsZSA/IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodCh0aXRsZSwgdGhlbWUpIDogMDtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBjc3NUZXh0cyBvZiBsYWJlbC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlclxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaXNWZXJ0aWNhbCB3aGV0aGVyIHZlcnRpY2FsIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaXNMYWJlbEF4aXMgd2hldGhlciBsYWJlbCBheGlzIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5sYWJlbFNpemUgbGFiZWwgc2l6ZSAod2lkdGggb3IgaGVpZ2h0KVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmdbXX0gY3NzVGV4dHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlTGFiZWxDc3NUZXh0czogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBjc3NUZXh0cyA9IFtdO1xuXG4gICAgICAgIGlmIChwYXJhbXMuaXNWZXJ0aWNhbCAmJiBwYXJhbXMuaXNMYWJlbEF4aXMpIHtcbiAgICAgICAgICAgIGNzc1RleHRzLnB1c2gocmVuZGVyVXRpbC5jb25jYXRTdHIoJ2hlaWdodDonLCBwYXJhbXMubGFiZWxTaXplLCAncHgnKSk7XG4gICAgICAgICAgICBjc3NUZXh0cy5wdXNoKHJlbmRlclV0aWwuY29uY2F0U3RyKCdsaW5lLWhlaWdodDonLCBwYXJhbXMubGFiZWxTaXplLCAncHgnKSk7XG4gICAgICAgIH0gZWxzZSBpZiAoIXBhcmFtcy5pc1ZlcnRpY2FsKSB7XG4gICAgICAgICAgICBjc3NUZXh0cy5wdXNoKHJlbmRlclV0aWwuY29uY2F0U3RyKCd3aWR0aDonLCBwYXJhbXMubGFiZWxTaXplLCAncHgnKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY3NzVGV4dHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgaHRtbCBvZiBsYWJlbC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPG9iamVjdD59IHBhcmFtcy5wb3NpdGlvbnMgbGFiZWwgcG9zaXRpb24gYXJyYXlcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nW119IHBhcmFtcy5sYWJlbHMgbGFiZWwgYXJyYXlcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMucG9zVHlwZSBwb3NpdGlvbiB0eXBlIChsZWZ0IG9yIGJvdHRvbSlcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nW119IHBhcmFtcy5jc3NUZXh0cyBjc3MgYXJyYXlcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBodG1sXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUxhYmVsc0h0bWw6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgdGVtcGxhdGUgPSBheGlzVGVtcGxhdGUuVFBMX0FYSVNfTEFCRUwsXG4gICAgICAgICAgICBsYWJlbHNIdG1sID0gbmUudXRpbC5tYXAocGFyYW1zLnBvc2l0aW9ucywgZnVuY3Rpb24ocG9zaXRpb24sIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdmFyIGxhYmVsQ3NzVGV4dHMgPSBwYXJhbXMuY3NzVGV4dHMuc2xpY2UoKSxcbiAgICAgICAgICAgICAgICAgICAgaHRtbDtcblxuICAgICAgICAgICAgICAgIGxhYmVsQ3NzVGV4dHMucHVzaChyZW5kZXJVdGlsLmNvbmNhdFN0cihwYXJhbXMucG9zVHlwZSwgJzonLCBwb3NpdGlvbiwgJ3B4JykpO1xuICAgICAgICAgICAgICAgIGh0bWwgPSB0ZW1wbGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGNzc1RleHQ6IGxhYmVsQ3NzVGV4dHMuam9pbignOycpLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogcGFyYW1zLmxhYmVsc1tpbmRleF1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gaHRtbDtcbiAgICAgICAgICAgIH0sIHRoaXMpLmpvaW4oJycpO1xuXG4gICAgICAgIHJldHVybiBsYWJlbHNIdG1sO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGFuZ2UgcG9zaXRpb24gb2YgbGFiZWwgYXJlYS5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlclxuICAgICAqICAgICAgQHBhcmFtIHtIVE1MRWxlbWVudH0gcGFyYW1zLmVsTGFiZWxBcmVhIGxhYmVsIGFyZWEgZWxlbWVudFxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaXNWZXJ0aWNhbCB3aGV0aGVyIHZlcnRpY2FsIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaXNMYWJlbEF4aXMgd2hldGhlciBsYWJlbCBheGlzIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHt7Zm9udFNpemU6IG51bWJlciwgZm9udEZhbWlseTogc3RyaW5nLCBjb2xvcjogc3RyaW5nfX0gcGFyYW1zLnRoZW1lIGxhYmVsIHRoZW1lXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmxhYmVsU2l6ZSBsYWJlbCBzaXplICh3aWR0aCBvciBoZWlnaHQpXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2hhbmdlTGFiZWxBcmVhUG9zaXRpb246IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgbGFiZWxIZWlnaHQ7XG5cbiAgICAgICAgaWYgKHBhcmFtcy5pc0xhYmVsQXhpcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhcmFtcy5pc1ZlcnRpY2FsKSB7XG4gICAgICAgICAgICBsYWJlbEhlaWdodCA9IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodCgnQUJDJywgcGFyYW1zLnRoZW1lKTtcbiAgICAgICAgICAgIHBhcmFtcy5lbExhYmVsQXJlYS5zdHlsZS50b3AgPSByZW5kZXJVdGlsLmNvbmNhdFN0cihwYXJzZUludChsYWJlbEhlaWdodCAvIDIsIDEwKSwgJ3B4Jyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYXJhbXMuZWxMYWJlbEFyZWEuc3R5bGUubGVmdCA9IHJlbmRlclV0aWwuY29uY2F0U3RyKCctJywgcGFyc2VJbnQocGFyYW1zLmxhYmVsU2l6ZSAvIDIsIDEwKSwgJ3B4Jyk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBeGlzO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFRoaXMgaXMgdGVtcGxhdGVzIG9yIGF4aXMgdmlldy5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbnZhciB0ZW1wbGF0ZU1ha2VyID0gcmVxdWlyZSgnLi4vaGVscGVycy90ZW1wbGF0ZU1ha2VyLmpzJyk7XG5cbnZhciB0YWdzID0ge1xuICAgIEhUTUxfQVhJU19USUNLOiAnPGRpdiBjbGFzcz1cIm5lLWNoYXJ0LXRpY2tcIiBzdHlsZT1cInt7IGNzc1RleHQgfX1cIj48L2Rpdj4nLFxuICAgIEhUTUxfQVhJU19MQUJFTDogJzxkaXYgY2xhc3M9XCJuZS1jaGFydC1sYWJlbFwiIHN0eWxlPVwie3sgY3NzVGV4dCB9fVwiPnt7IGxhYmVsIH19PC9kaXY+J1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgVFBMX0FYSVNfVElDSzogdGVtcGxhdGVNYWtlci50ZW1wbGF0ZSh0YWdzLkhUTUxfQVhJU19USUNLKSxcbiAgICBUUExfQVhJU19MQUJFTDogdGVtcGxhdGVNYWtlci50ZW1wbGF0ZSh0YWdzLkhUTUxfQVhJU19MQUJFTClcbn07XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgY2hhcnQuanMgaXMgZW50cnkgcG9pbnQgb2YgQXBwbGljYXRpb24gQ2hhcnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4vY29uc3QuanMnKSxcbiAgICBjaGFydEZhY3RvcnkgPSByZXF1aXJlKCcuL2ZhY3Rvcmllcy9jaGFydEZhY3RvcnkuanMnKSxcbiAgICBwbHVnaW5GYWN0b3J5ID0gcmVxdWlyZSgnLi9mYWN0b3JpZXMvcGx1Z2luRmFjdG9yeS5qcycpLFxuICAgIHRoZW1lRmFjdG9yeSA9IHJlcXVpcmUoJy4vZmFjdG9yaWVzL3RoZW1lRmFjdG9yeS5qcycpO1xuXG52YXIgREVGQVVMVF9USEVNRV9OQU1FID0gJ2RlZmF1bHQnO1xuXG52YXIgX2NyZWF0ZUNoYXJ0O1xuXG5yZXF1aXJlKCcuL2NvZGUtc25pcHBldC11dGlsLmpzJyk7XG5yZXF1aXJlKCcuL3JlZ2lzdGVyQ2hhcnRzLmpzJyk7XG5yZXF1aXJlKCcuL3JlZ2lzdGVyVGhlbWVzLmpzJyk7XG5cbi8qKlxuICogTkhOIEVudGVydGFpbm1lbnQgQXBwbGljYXRpb24gQ2hhcnQuXG4gKiBAbmFtZXNwYWNlIG5lLmFwcGxpY2F0aW9uLmNoYXJ0XG4gKi9cbm5lLnV0aWwuZGVmaW5lTmFtZXNwYWNlKCduZS5hcHBsaWNhdGlvbi5jaGFydCcpO1xuXG4vKipcbiAqIENyZWF0ZSBjaGFydC5cbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciBjb250YWluZXJcbiAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gZGF0YSBjaGFydCBkYXRhXG4gKiBAcGFyYW0ge3tcbiAqICAgY2hhcnQ6IHtcbiAqICAgICB3aWR0aDogbnVtYmVyLFxuICogICAgIGhlaWdodDogbnVtYmVyLFxuICogICAgIHRpdGxlOiBzdHJpbmcsXG4gKiAgICAgZm9ybWF0OiBzdHJpbmdcbiAqICAgfSxcbiAqICAgeUF4aXM6IHtcbiAqICAgICB0aXRsZTogc3RyaW5nLFxuICogICAgIG1pbjogbnVtYmVyXG4gKiAgIH0sXG4gKiAgIHhBeGlzOiB7XG4gKiAgICAgdGl0bGU6IHN0cmlnLFxuICogICAgIG1pbjogbnVtYmVyXG4gKiAgIH0sXG4gKiAgIHRvb2x0aXA6IHtcbiAqICAgICBzdWZmaXg6IHN0cmluZyxcbiAqICAgICB0ZW1wbGF0ZTogc3RyaW5nXG4gKiAgIH0sXG4gKiAgIHRoZW1lOiBzdHJpbmdcbiAqIH19IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICogQHJldHVybnMge29iamVjdH0gY2hhcnQgaW5zdGFuY2UuXG4gKiBAcHJpdmF0ZVxuICogQGlnbm9yZVxuICovXG5fY3JlYXRlQ2hhcnQgPSBmdW5jdGlvbihjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpIHtcbiAgICB2YXIgdGhlbWVOYW1lLCB0aGVtZSwgY2hhcnQ7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdGhlbWVOYW1lID0gb3B0aW9ucy50aGVtZSB8fCBERUZBVUxUX1RIRU1FX05BTUU7XG4gICAgdGhlbWUgPSB0aGVtZUZhY3RvcnkuZ2V0KHRoZW1lTmFtZSk7XG5cbiAgICBjaGFydCA9IGNoYXJ0RmFjdG9yeS5nZXQob3B0aW9ucy5jaGFydFR5cGUsIGRhdGEsIHRoZW1lLCBvcHRpb25zKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoY2hhcnQucmVuZGVyKCkpO1xuICAgIGNoYXJ0LmFuaW1hdGVDaGFydCgpO1xuXG4gICAgcmV0dXJuIGNoYXJ0O1xufTtcblxuLyoqXG4gKiBCYXIgY2hhcnQgY3JlYXRvci5cbiAqIEBtZW1iZXJPZiBuZS5hcHBsaWNhdGlvbi5jaGFydFxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNoYXJ0IGNvbnRhaW5lclxuICogQHBhcmFtIHtvYmplY3R9IGRhdGEgY2hhcnQgZGF0YVxuICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBkYXRhLmNhdGVnb3JpZXMgY2F0ZWdvcmllc1xuICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IGRhdGEuc2VyaWVzIHNlcmllcyBkYXRhXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLmNoYXJ0IGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LndpZHRoIGNoYXJ0IHdpZHRoXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5jaGFydC5oZWlnaHQgY2hhcnQgaGVpZ2h0XG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC50aXRsZSBjaGFydCB0aXRsZVxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuY2hhcnQuZm9ybWF0IHZhbHVlIGZvcm1hdFxuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy55QXhpcyBvcHRpb25zIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnlBeGlzLnRpdGxlIHRpdGxlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMueEF4aXMgb3B0aW9ucyBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnhBeGlzLnRpdGxlIHRpdGxlIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMueEF4aXMubWluIG1pbmltYWwgdmFsdWUgb2YgaG9yaXpvbnRhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy54QXhpcy5tYXggbWF4aW11bSB2YWx1ZSBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuc2VyaWVzIG9wdGlvbnMgb2Ygc2VyaWVzXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5zZXJpZXMuc3RhY2tlZCBzdGFja2VkIHR5cGVcbiAqICAgICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5zZXJpZXMuc2hvd0xhYmVsIHdoZXRoZXIgc2hvdyBsYWJlbCBvciBub3RcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMudG9vbHRpcCBvcHRpb25zIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAuc3VmZml4IHN1ZmZpeCBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnRlbXBsYXRlIHRlbXBsYXRlIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAucG9zaXRpb24gdG9vbHRpcCBwb3NpdGlvbiB0eXBlXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uIGFkZCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24ubGVmdCBhZGQgbGVmdCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24udG9wIGFkZCB0b3AgcG9zaXRpb25cbiAqICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudGhlbWUgdGhlbWUgbmFtZVxuICogICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5saWJUeXBlIGdyYXBoIGxpYnJhcnkgdHlwZVxuICogQHJldHVybnMge29iamVjdH0gYmFyIGNoYXJ0XG4gKiBAZXhhbXBsZVxuICogdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWluZXItaWQnKSxcbiAqICAgICBkYXRhID0ge1xuICogICAgICAgY2F0ZWdvcmllczogWydjYXRlMScsICdjYXRlMicsICdjYXRlMyddLFxuICogICAgICAgc2VyaWVzOiBbXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMScsXG4gKiAgICAgICAgICAgZGF0YTogWzIwLCAzMCwgNTBdXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMicsXG4gKiAgICAgICAgICAgZGF0YTogWzQwLCA0MCwgNjBdXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMycsXG4gKiAgICAgICAgICAgZGF0YTogWzYwLCA1MCwgMTBdXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kNCcsXG4gKiAgICAgICAgICAgZGF0YTogWzgwLCAxMCwgNzBdXG4gKiAgICAgICAgIH1cbiAqICAgICAgIF1cbiAqICAgICB9LFxuICogICAgIG9wdGlvbnMgPSB7XG4gKiAgICAgICBjaGFydDoge1xuICogICAgICAgICB0aXRsZTogJ0JhciBDaGFydCdcbiAqICAgICAgIH0sXG4gKiAgICAgICB5QXhpczoge1xuICogICAgICAgICB0aXRsZTogJ1kgQXhpcydcbiAqICAgICAgIH0sXG4gKiAgICAgICB4QXhpczoge1xuICogICAgICAgICB0aXRsZTogJ1ggQXhpcydcbiAqICAgICAgIH1cbiAqICAgICB9O1xuICogbmUuYXBwbGljYXRpb24uY2hhcnQuYmFyQ2hhcnQoY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKTtcbiAqL1xubmUuYXBwbGljYXRpb24uY2hhcnQuYmFyQ2hhcnQgPSBmdW5jdGlvbihjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICBvcHRpb25zLmNoYXJ0VHlwZSA9IGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9CQVI7XG4gICAgcmV0dXJuIF9jcmVhdGVDaGFydChjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpO1xufTtcblxuLyoqXG4gKiBDb2x1bW4gY2hhcnQgY3JlYXRvci5cbiAqIEBtZW1iZXJPZiBuZS5hcHBsaWNhdGlvbi5jaGFydFxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNoYXJ0IGNvbnRhaW5lclxuICogQHBhcmFtIHtvYmplY3R9IGRhdGEgY2hhcnQgZGF0YVxuICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBkYXRhLmNhdGVnb3JpZXMgY2F0ZWdvcmllc1xuICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IGRhdGEuc2VyaWVzIHNlcmllcyBkYXRhXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLmNoYXJ0IGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LndpZHRoIGNoYXJ0IHdpZHRoXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5jaGFydC5oZWlnaHQgY2hhcnQgaGVpZ2h0XG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC50aXRsZSBjaGFydCB0aXRsZVxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuY2hhcnQuZm9ybWF0IHZhbHVlIGZvcm1hdFxuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy55QXhpcyBvcHRpb25zIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnlBeGlzLnRpdGxlIHRpdGxlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnlBeGlzLm1pbiBtaW5pbWFsIHZhbHVlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnlBeGlzLm1heCBtYXhpbXVtIHZhbHVlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMueEF4aXMgb3B0aW9ucyBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnhBeGlzLnRpdGxlIHRpdGxlIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5zZXJpZXMgb3B0aW9ucyBvZiBzZXJpZXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnNlcmllcy5zdGFja2VkIHN0YWNrZWQgdHlwZVxuICogICAgICAgICAgQHBhcmFtIHtib29sZWFufSBvcHRpb25zLnNlcmllcy5zaG93TGFiZWwgd2hldGhlciBzaG93IGxhYmVsIG9yIG5vdFxuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy50b29sdGlwIG9wdGlvbnMgb2YgdG9vbHRpcFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC5zdWZmaXggc3VmZml4IG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAudGVtcGxhdGUgdGVtcGxhdGUgb2YgdG9vbHRpcFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC5wb3NpdGlvbiB0b29sdGlwIHBvc2l0aW9uIHR5cGVcbiAqICAgICAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24gYWRkIHBvc2l0aW9uXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMudG9vbHRpcC5hZGRQb3NpdGlvbi5sZWZ0IGFkZCBsZWZ0IHBvc2l0aW9uXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMudG9vbHRpcC5hZGRQb3NpdGlvbi50b3AgYWRkIHRvcCBwb3NpdGlvblxuICogICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50aGVtZSB0aGVtZSBuYW1lXG4gKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmxpYlR5cGUgZ3JhcGggbGlicmFyeSB0eXBlXG4gKiBAcmV0dXJucyB7b2JqZWN0fSBjb2x1bW4gY2hhcnRcbiAqIEBleGFtcGxlXG4gKiB2YXIgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhaW5lci1pZCcpLFxuICogICAgIGRhdGEgPSB7XG4gKiAgICAgICBjYXRlZ29yaWVzOiBbJ2NhdGUxJywgJ2NhdGUyJywgJ2NhdGUzJ10sXG4gKiAgICAgICBzZXJpZXM6IFtcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQxJyxcbiAqICAgICAgICAgICBkYXRhOiBbMjAsIDMwLCA1MF1cbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQyJyxcbiAqICAgICAgICAgICBkYXRhOiBbNDAsIDQwLCA2MF1cbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQzJyxcbiAqICAgICAgICAgICBkYXRhOiBbNjAsIDUwLCAxMF1cbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQ0JyxcbiAqICAgICAgICAgICBkYXRhOiBbODAsIDEwLCA3MF1cbiAqICAgICAgICAgfVxuICogICAgICAgXVxuICogICAgIH0sXG4gKiAgICAgb3B0aW9ucyA9IHtcbiAqICAgICAgIGNoYXJ0OiB7XG4gKiAgICAgICAgIHRpdGxlOiAnQ29sdW1uIENoYXJ0J1xuICogICAgICAgfSxcbiAqICAgICAgIHlBeGlzOiB7XG4gKiAgICAgICAgIHRpdGxlOiAnWSBBeGlzJ1xuICogICAgICAgfSxcbiAqICAgICAgIHhBeGlzOiB7XG4gKiAgICAgICAgIHRpdGxlOiAnWCBBeGlzJ1xuICogICAgICAgfVxuICogICAgIH07XG4gKiBuZS5hcHBsaWNhdGlvbi5jaGFydC5jb2x1bW5DaGFydChjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpO1xuICovXG5uZS5hcHBsaWNhdGlvbi5jaGFydC5jb2x1bW5DaGFydCA9IGZ1bmN0aW9uKGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIG9wdGlvbnMuY2hhcnRUeXBlID0gY2hhcnRDb25zdC5DSEFSVF9UWVBFX0NPTFVNTjtcbiAgICByZXR1cm4gX2NyZWF0ZUNoYXJ0KGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucyk7XG59O1xuXG4vKipcbiAqIExpbmUgY2hhcnQgY3JlYXRvci5cbiAqIEBtZW1iZXJPZiBuZS5hcHBsaWNhdGlvbi5jaGFydFxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNoYXJ0IGNvbnRhaW5lclxuICogQHBhcmFtIHtvYmplY3R9IGRhdGEgY2hhcnQgZGF0YVxuICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBkYXRhLmNhdGVnb3JpZXMgY2F0ZWdvcmllc1xuICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IGRhdGEuc2VyaWVzIHNlcmllcyBkYXRhXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLmNoYXJ0IGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LndpZHRoIGNoYXJ0IHdpZHRoXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5jaGFydC5oZWlnaHQgY2hhcnQgaGVpZ2h0XG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC50aXRsZSBjaGFydCB0aXRsZVxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuY2hhcnQuZm9ybWF0IHZhbHVlIGZvcm1hdFxuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy55QXhpcyBvcHRpb25zIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnlBeGlzLnRpdGxlIHRpdGxlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnlBeGlzLm1pbiBtaW5pbWFsIHZhbHVlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnlBeGlzLm1heCBtYXhpbXVtIHZhbHVlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMueEF4aXMgb3B0aW9ucyBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnhBeGlzLnRpdGxlIHRpdGxlIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5zZXJpZXMgb3B0aW9ucyBvZiBzZXJpZXNcbiAqICAgICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5zZXJpZXMuaGFzRG90IHdoZXRoZXIgaGFzIGRvdCBvciBub3RcbiAqICAgICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5zZXJpZXMuc2hvd0xhYmVsIHdoZXRoZXIgc2hvdyBsYWJlbCBvciBub3RcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMudG9vbHRpcCBvcHRpb25zIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAuc3VmZml4IHN1ZmZpeCBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnRlbXBsYXRlIHRlbXBsYXRlIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAucG9zaXRpb24gdG9vbHRpcCBwb3NpdGlvbiB0eXBlXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uIGFkZCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24ubGVmdCBhZGQgbGVmdCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24udG9wIGFkZCB0b3AgcG9zaXRpb25cbiAqICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudGhlbWUgdGhlbWUgbmFtZVxuICogICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5saWJUeXBlIGdyYXBoIGxpYnJhcnkgdHlwZVxuICogQHJldHVybnMge29iamVjdH0gYmFyIGNoYXJ0XG4gKiBAZXhhbXBsZVxuICogdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWluZXItaWQnKSxcbiAqICAgICBkYXRhID0ge1xuICogICAgICAgY2F0ZWdvcmllczogWydjYXRlMScsICdjYXRlMicsICdjYXRlMyddLFxuICogICAgICAgc2VyaWVzOiBbXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMScsXG4gKiAgICAgICAgICAgZGF0YTogWzIwLCAzMCwgNTBdXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMicsXG4gKiAgICAgICAgICAgZGF0YTogWzQwLCA0MCwgNjBdXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMycsXG4gKiAgICAgICAgICAgZGF0YTogWzYwLCA1MCwgMTBdXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kNCcsXG4gKiAgICAgICAgICAgZGF0YTogWzgwLCAxMCwgNzBdXG4gKiAgICAgICAgIH1cbiAqICAgICAgIF1cbiAqICAgICB9LFxuICogICAgIG9wdGlvbnMgPSB7XG4gKiAgICAgICBjaGFydDoge1xuICogICAgICAgICB0aXRsZTogJ0xpbmUgQ2hhcnQnXG4gKiAgICAgICB9LFxuICogICAgICAgeUF4aXM6IHtcbiAqICAgICAgICAgdGl0bGU6ICdZIEF4aXMnXG4gKiAgICAgICB9LFxuICogICAgICAgeEF4aXM6IHtcbiAqICAgICAgICAgdGl0bGU6ICdYIEF4aXMnXG4gKiAgICAgICB9LFxuICogICAgICAgc2VyaWVzOiB7XG4gKiAgICAgICAgIGhhc0RvdDogdHJ1ZVxuICogICAgICAgfVxuICogICAgIH07XG4gKiBuZS5hcHBsaWNhdGlvbi5jaGFydC5saW5lQ2hhcnQoY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKTtcbiAqL1xubmUuYXBwbGljYXRpb24uY2hhcnQubGluZUNoYXJ0ID0gZnVuY3Rpb24oY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgb3B0aW9ucy5jaGFydFR5cGUgPSBjaGFydENvbnN0LkNIQVJUX1RZUEVfTElORTtcbiAgICByZXR1cm4gX2NyZWF0ZUNoYXJ0KGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucyk7XG59O1xuXG4vKipcbiAqIEFyZWEgY2hhcnQgY3JlYXRvci5cbiAqIEBtZW1iZXJPZiBuZS5hcHBsaWNhdGlvbi5jaGFydFxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNoYXJ0IGNvbnRhaW5lclxuICogQHBhcmFtIHtvYmplY3R9IGRhdGEgY2hhcnQgZGF0YVxuICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBkYXRhLmNhdGVnb3JpZXMgY2F0ZWdvcmllc1xuICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IGRhdGEuc2VyaWVzIHNlcmllcyBkYXRhXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLmNoYXJ0IGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LndpZHRoIGNoYXJ0IHdpZHRoXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5jaGFydC5oZWlnaHQgY2hhcnQgaGVpZ2h0XG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC50aXRsZSBjaGFydCB0aXRsZVxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuY2hhcnQuZm9ybWF0IHZhbHVlIGZvcm1hdFxuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy55QXhpcyBvcHRpb25zIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnlBeGlzLnRpdGxlIHRpdGxlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnlBeGlzLm1pbiBtaW5pbWFsIHZhbHVlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnlBeGlzLm1heCBtYXhpbXVtIHZhbHVlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMueEF4aXMgb3B0aW9ucyBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnhBeGlzLnRpdGxlIHRpdGxlIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5zZXJpZXMgb3B0aW9ucyBvZiBzZXJpZXNcbiAqICAgICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5zZXJpZXMuaGFzRG90IHdoZXRoZXIgaGFzIGRvdCBvciBub3RcbiAqICAgICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5zZXJpZXMuc2hvd0xhYmVsIHdoZXRoZXIgc2hvdyBsYWJlbCBvciBub3RcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMudG9vbHRpcCBvcHRpb25zIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAuc3VmZml4IHN1ZmZpeCBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnRlbXBsYXRlIHRlbXBsYXRlIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAucG9zaXRpb24gdG9vbHRpcCBwb3NpdGlvbiB0eXBlXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uIGFkZCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24ubGVmdCBhZGQgbGVmdCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24udG9wIGFkZCB0b3AgcG9zaXRpb25cbiAqICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudGhlbWUgdGhlbWUgbmFtZVxuICogICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5saWJUeXBlIGdyYXBoIGxpYnJhcnkgdHlwZVxuICogQHJldHVybnMge29iamVjdH0gYmFyIGNoYXJ0XG4gKiBAaWdub3JlXG4gKiBAZXhhbXBsZVxuICogdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWluZXItaWQnKSxcbiAqICAgICBkYXRhID0ge1xuICogICAgICAgY2F0ZWdvcmllczogWydjYXRlMScsICdjYXRlMicsICdjYXRlMyddLFxuICogICAgICAgc2VyaWVzOiBbXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMScsXG4gKiAgICAgICAgICAgZGF0YTogWzIwLCAzMCwgNTBdXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMicsXG4gKiAgICAgICAgICAgZGF0YTogWzQwLCA0MCwgNjBdXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMycsXG4gKiAgICAgICAgICAgZGF0YTogWzYwLCA1MCwgMTBdXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kNCcsXG4gKiAgICAgICAgICAgZGF0YTogWzgwLCAxMCwgNzBdXG4gKiAgICAgICAgIH1cbiAqICAgICAgIF1cbiAqICAgICB9LFxuICogICAgIG9wdGlvbnMgPSB7XG4gKiAgICAgICBjaGFydDoge1xuICogICAgICAgICB0aXRsZTogJ0FyZWEgQ2hhcnQnXG4gKiAgICAgICB9LFxuICogICAgICAgeUF4aXM6IHtcbiAqICAgICAgICAgdGl0bGU6ICdZIEF4aXMnXG4gKiAgICAgICB9LFxuICogICAgICAgeEF4aXM6IHtcbiAqICAgICAgICAgdGl0bGU6ICdYIEF4aXMnXG4gKiAgICAgICB9XG4gKiAgICAgfTtcbiAqIG5lLmFwcGxpY2F0aW9uLmNoYXJ0LmFyZWFDaGFydChjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpO1xuICovXG5uZS5hcHBsaWNhdGlvbi5jaGFydC5hcmVhQ2hhcnQgPSBmdW5jdGlvbihjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICBvcHRpb25zLmNoYXJ0VHlwZSA9IGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9BUkVBO1xuICAgIHJldHVybiBfY3JlYXRlQ2hhcnQoY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKTtcbn07XG5cbi8qKlxuICogQ29tYm8gY2hhcnQgY3JlYXRvci5cbiAqIEBtZW1iZXJPZiBuZS5hcHBsaWNhdGlvbi5jaGFydFxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNoYXJ0IGNvbnRhaW5lclxuICogQHBhcmFtIHtvYmplY3R9IGRhdGEgY2hhcnQgZGF0YVxuICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBkYXRhLmNhdGVnb3JpZXMgY2F0ZWdvcmllc1xuICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IGRhdGEuc2VyaWVzIHNlcmllcyBkYXRhXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLmNoYXJ0IGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LndpZHRoIGNoYXJ0IHdpZHRoXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5jaGFydC5oZWlnaHQgY2hhcnQgaGVpZ2h0XG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC50aXRsZSBjaGFydCB0aXRsZVxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuY2hhcnQuZm9ybWF0IHZhbHVlIGZvcm1hdFxuICogICAgICBAcGFyYW0ge29iamVjdFtdfSBvcHRpb25zLnlBeGlzIG9wdGlvbnMgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMueUF4aXNbXS50aXRsZSB0aXRsZSBvZiB2ZXJ0aWNhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy55QXhpc1tdLm1pbiBtaW5pbWFsIHZhbHVlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnlBeGlzW10ubWF4IG1heGltdW0gdmFsdWUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy54QXhpcyBvcHRpb25zIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMueEF4aXMudGl0bGUgdGl0bGUgb2YgaG9yaXpvbnRhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy54QXhpcy5taW4gbWluaW1hbCB2YWx1ZSBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnhBeGlzLm1heCBtYXhpbXVtIHZhbHVlIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5zZXJpZXMgb3B0aW9ucyBvZiBzZXJpZXNcbiAqICAgICAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnNlcmllcy5jb2x1bW4gb3B0aW9ucyBvZiBjb2x1bW4gc2VyaWVzXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuc2VyaWVzLmNvbHVtbi5zdGFja2VkIHN0YWNrZWQgdHlwZVxuICogICAgICAgICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5zZXJpZXMuY29sdW1uLnNob3dMYWJlbCB3aGV0aGVyIHNob3cgbGFiZWwgb3Igbm90XG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5zZXJpZXMubGluZSBvcHRpb25zIG9mIGxpbmUgc2VyaWVzXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtib29sZWFufSBvcHRpb25zLnNlcmllcy5saW5lLmhhc0RvdCB3aGV0aGVyIGhhcyBkb3Qgb3Igbm90XG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtib29sZWFufSBvcHRpb25zLnNlcmllcy5saW5lLnNob3dMYWJlbCB3aGV0aGVyIHNob3cgbGFiZWwgb3Igbm90XG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnRvb2x0aXAgb3B0aW9ucyBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy50b29sdGlwLmNvbHVtbiBvcHRpb25zIG9mIGNvbHVtbiB0b29sdGlwXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC5jb2x1bW4uc3VmZml4IHN1ZmZpeCBvZiB0b29sdGlwXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC5jb2x1bW4udGVtcGxhdGUgdGVtcGxhdGUgb2YgdG9vbHRpcFxuICogICAgICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAuY29sdW1uLnBvc2l0aW9uIHRvb2x0aXAgcG9zaXRpb24gdHlwZVxuICogICAgICAgICAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnRvb2x0aXAuY29sdW1uLmFkZFBvc2l0aW9uIGFkZCBwb3NpdGlvblxuICogICAgICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy50b29sdGlwLmNvbHVtbi5hZGRQb3NpdGlvbi5sZWZ0IGFkZCBsZWZ0IHBvc2l0aW9uXG4gKiAgICAgICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuY29sdW1uLmFkZFBvc2l0aW9uLnRvcCBhZGQgdG9wIHBvc2l0aW9uXG4gKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRoZW1lIHRoZW1lIG5hbWVcbiAqICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMubGliVHlwZSBncmFwaCBsaWJyYXJ5IHR5cGVcbiAqIEByZXR1cm5zIHtvYmplY3R9IGJhciBjaGFydFxuICogQGV4YW1wbGVcbiAqIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFpbmVyLWlkJyksXG4gKiAgICAgZGF0YSA9IHtcbiAqICAgICAgIGNhdGVnb3JpZXM6IFsnY2F0ZTEnLCAnY2F0ZTInLCAnY2F0ZTMnXSxcbiAqICAgICAgIHNlcmllczoge1xuICogICAgICAgICBjb2x1bW46IFtcbiAqICAgICAgICAgICB7XG4gKiAgICAgICAgICAgICBuYW1lOiAnTGVnZW5kMScsXG4gKiAgICAgICAgICAgICBkYXRhOiBbMjAsIDMwLCA1MF1dXG4gKiAgICAgICAgICAgfSxcbiAqICAgICAgICAgICB7XG4gKiAgICAgICAgICAgICBuYW1lOiAnTGVnZW5kMicsXG4gKiAgICAgICAgICAgICBkYXRhOiBbNDAsIDQwLCA2MF1cbiAqICAgICAgICAgICB9LFxuICogICAgICAgICAgIHtcbiAqICAgICAgICAgICAgIG5hbWU6ICdMZWdlbmQzJyxcbiAqICAgICAgICAgICAgIGRhdGE6IFs2MCwgNTAsIDEwXVxuICogICAgICAgICAgIH0sXG4gKiAgICAgICAgICAge1xuICogICAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDQnLFxuICogICAgICAgICAgICAgZGF0YTogWzgwLCAxMCwgNzBdXG4gKiAgICAgICAgICAgfVxuICogICAgICAgICB9LFxuICogICAgICAgICBsaW5lOiBbXG4gKiAgICAgICAgICAge1xuICogICAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDUnLFxuICogICAgICAgICAgICAgZGF0YTogWzEsIDIsIDNdXG4gKiAgICAgICAgICAgfVxuICogICAgICAgICBdXG4gKiAgICAgICB9XG4gKiAgICAgfSxcbiAqICAgICBvcHRpb25zID0ge1xuICogICAgICAgY2hhcnQ6IHtcbiAqICAgICAgICAgdGl0bGU6ICdDb21ibyBDaGFydCdcbiAqICAgICAgIH0sXG4gKiAgICAgICB5QXhpczpbXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICB0aXRsZTogJ1kgQXhpcycsXG4gKiAgICAgICAgICAgY2hhcnRUeXBlOiAnbGluZSdcbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIHRpdGxlOiAnWSBSaWdodCBBeGlzJ1xuICogICAgICAgICB9XG4gKiAgICAgICBdLFxuICogICAgICAgeEF4aXM6IHtcbiAqICAgICAgICAgdGl0bGU6ICdYIEF4aXMnXG4gKiAgICAgICB9LFxuICogICAgICAgc2VyaWVzOiB7XG4gKiAgICAgICAgIGhhc0RvdDogdHJ1ZVxuICogICAgICAgfVxuICogICAgIH07XG4gKiBuZS5hcHBsaWNhdGlvbi5jaGFydC5jb21ib0NoYXJ0KGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucyk7XG4gKi9cbm5lLmFwcGxpY2F0aW9uLmNoYXJ0LmNvbWJvQ2hhcnQgPSBmdW5jdGlvbihjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICBvcHRpb25zLmNoYXJ0VHlwZSA9IGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9DT01CTztcbiAgICByZXR1cm4gX2NyZWF0ZUNoYXJ0KGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucyk7XG59O1xuXG4vKipcbiAqIFBpZSBjaGFydCBjcmVhdG9yLlxuICogQG1lbWJlck9mIG5lLmFwcGxpY2F0aW9uLmNoYXJ0XG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY2hhcnQgY29udGFpbmVyXG4gKiBAcGFyYW0ge29iamVjdH0gZGF0YSBjaGFydCBkYXRhXG4gKiAgICAgIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gZGF0YS5zZXJpZXMgc2VyaWVzIGRhdGFcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuY2hhcnQgY2hhcnQgb3B0aW9uc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMuY2hhcnQud2lkdGggY2hhcnQgd2lkdGhcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LmhlaWdodCBjaGFydCBoZWlnaHRcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmNoYXJ0LnRpdGxlIGNoYXJ0IHRpdGxlXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC5mb3JtYXQgdmFsdWUgZm9ybWF0XG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnNlcmllcyBvcHRpb25zIG9mIHNlcmllc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuc2VyaWVzLmxlZ2VuZFR5cGUgbGVnZW5kIHR5cGVcbiAqICAgICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5zZXJpZXMuc2hvd0xhYmVsIHdoZXRoZXIgc2hvdyBsYWJlbCBvciBub3RcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMudG9vbHRpcCBvcHRpb25zIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAuc3VmZml4IHN1ZmZpeCBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnRlbXBsYXRlIHRlbXBsYXRlIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAucG9zaXRpb24gdG9vbHRpcCBwb3NpdGlvbiB0eXBlXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uIGFkZCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24ubGVmdCBhZGQgbGVmdCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24udG9wIGFkZCB0b3AgcG9zaXRpb25cbiAqICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudGhlbWUgdGhlbWUgbmFtZVxuICogICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5saWJUeXBlIGdyYXBoIGxpYnJhcnkgdHlwZVxuICogQHJldHVybnMge29iamVjdH0gYmFyIGNoYXJ0XG4gKiBAZXhhbXBsZVxuICogdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWluZXItaWQnKSxcbiAqICAgICBkYXRhID0ge1xuICogICAgICAgc2VyaWVzOiBbXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMScsXG4gKiAgICAgICAgICAgZGF0YTogMjBcbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQyJyxcbiAqICAgICAgICAgICBkYXRhOiA0MFxuICogICAgICAgICB9LFxuICogICAgICAgICB7XG4gKiAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDMnLFxuICogICAgICAgICAgIGRhdGE6IDYwXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kNCcsXG4gKiAgICAgICAgICAgZGF0YTogODBcbiAqICAgICAgICAgfVxuICogICAgICAgXVxuICogICAgIH0sXG4gKiAgICAgb3B0aW9ucyA9IHtcbiAqICAgICAgIGNoYXJ0OiB7XG4gKiAgICAgICAgIHRpdGxlOiAnUGllIENoYXJ0J1xuICogICAgICAgfVxuICogICAgIH07XG4gKiBuZS5hcHBsaWNhdGlvbi5jaGFydC5waWVDaGFydChjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpO1xuICovXG5uZS5hcHBsaWNhdGlvbi5jaGFydC5waWVDaGFydCA9IGZ1bmN0aW9uKGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIG9wdGlvbnMuY2hhcnRUeXBlID0gY2hhcnRDb25zdC5DSEFSVF9UWVBFX1BJRTtcbiAgICByZXR1cm4gX2NyZWF0ZUNoYXJ0KGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucyk7XG59O1xuXG4vKipcbiAqIFJlZ2lzdGVyIHRoZW1lLlxuICogQG1lbWJlck9mIG5lLmFwcGxpY2F0aW9uLmNoYXJ0XG4gKiBAcGFyYW0ge3N0cmluZ30gdGhlbWVOYW1lIHRoZW1lIG5hbWVcbiAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBhcHBsaWNhdGlvbiBjaGFydCB0aGVtZVxuICogICAgICBAcGFyYW0ge29iamVjdH0gdGhlbWUuY2hhcnQgY2hhcnQgdGhlbWVcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS5jaGFydC5mb250RmFtaWx5IGZvbnQgZmFtaWx5IG9mIGNoYXJ0XG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUuY2hhcnQuYmFja2dyb3VuZCBiYWNrZ3JvdW5kIG9mIGNoYXJ0XG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSB0aGVtZS50aXRsZSBjaGFydCB0aGVtZVxuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IHRoZW1lLnRpdGxlLmZvbnRTaXplIGZvbnQgc2l6ZSBvZiBjaGFydCB0aXRsZVxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnRpdGxlLmZvbnRGYW1pbHkgZm9udCBmYW1pbHkgb2YgY2hhcnQgdGl0bGVcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS50aXRsZS5jb2xvciBmb250IGNvbG9yIG9mIGNoYXJ0IHRpdGxlXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUudGl0bGUuYmFja2dyb3VuZCBiYWNrZ3JvdW5kIG9mIGNoYXJ0IHRpdGxlXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSB0aGVtZS55QXhpcyB0aGVtZSBvZiB2ZXJ0aWNhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gdGhlbWUueUF4aXMudGl0bGUgdGhlbWUgb2YgdmVydGljYWwgYXhpcyB0aXRsZVxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSB0aGVtZS55QXhpcy50aXRsZS5mb250U2l6ZSBmb250IHNpemUgb2YgdmVydGljYWwgYXhpcyB0aXRsZVxuICogICAgICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS55QXhpcy50aXRsZS5mb250RmFtaWx5IGZvbnQgZmFtaWx5IG9mIHZlcnRpY2FsIGF4aXMgdGl0bGVcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUueUF4aXMudGl0bGUuY29sb3IgZm9udCBjb2xvciBvZiB2ZXJ0aWNhbCBheGlzIHRpdGxlXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gdGhlbWUueUF4aXMubGFiZWwgdGhlbWUgb2YgdmVydGljYWwgYXhpcyBsYWJlbFxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSB0aGVtZS55QXhpcy5sYWJlbC5mb250U2l6ZSBmb250IHNpemUgb2YgdmVydGljYWwgYXhpcyBsYWJlbFxuICogICAgICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS55QXhpcy5sYWJlbC5mb250RmFtaWx5IGZvbnQgZmFtaWx5IG9mIHZlcnRpY2FsIGF4aXMgbGFiZWxcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUueUF4aXMubGFiZWwuY29sb3IgZm9udCBjb2xvciBvZiB2ZXJ0aWNhbCBheGlzIGxhYmVsXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUueUF4aXMudGlja2NvbG9yIGNvbG9yIG9mIHZlcnRpY2FsIGF4aXMgdGlja1xuICogICAgICBAcGFyYW0ge29iamVjdH0gdGhlbWUueEF4aXMgdGhlbWUgb2YgaG9yaXpvbnRhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gdGhlbWUueEF4aXMudGl0bGUgdGhlbWUgb2YgaG9yaXpvbnRhbCBheGlzIHRpdGxlXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IHRoZW1lLnhBeGlzLnRpdGxlLmZvbnRTaXplIGZvbnQgc2l6ZSBvZiBob3Jpem9udGFsIGF4aXMgdGl0bGVcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUueEF4aXMudGl0bGUuZm9udEZhbWlseSBmb250IGZhbWlseSBvZiBob3Jpem9udGFsIGF4aXMgdGl0bGVcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUueEF4aXMudGl0bGUuY29sb3IgZm9udCBjb2xvciBvZiBob3Jpem9udGFsIGF4aXMgdGl0bGVcbiAqICAgICAgICAgIEBwYXJhbSB7b2JqZWN0fSB0aGVtZS54QXhpcy5sYWJlbCB0aGVtZSBvZiBob3Jpem9udGFsIGF4aXMgbGFiZWxcbiAqICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gdGhlbWUueEF4aXMubGFiZWwuZm9udFNpemUgZm9udCBzaXplIG9mIGhvcml6b250YWwgYXhpcyBsYWJlbFxuICogICAgICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS54QXhpcy5sYWJlbC5mb250RmFtaWx5IGZvbnQgZmFtaWx5IG9mIGhvcml6b250YWwgYXhpcyBsYWJlbFxuICogICAgICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS54QXhpcy5sYWJlbC5jb2xvciBmb250IGNvbG9yIG9mIGhvcml6b250YWwgYXhpcyBsYWJlbFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnhBeGlzLnRpY2tjb2xvciBjb2xvciBvZiBob3Jpem9udGFsIGF4aXMgdGlja1xuICogICAgICBAcGFyYW0ge29iamVjdH0gdGhlbWUucGxvdCBwbG90IHRoZW1lXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUucGxvdC5saW5lQ29sb3IgcGxvdCBsaW5lIGNvbG9yXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUucGxvdC5iYWNrZ3JvdW5kIHBsb3QgYmFja2dyb3VuZFxuICogICAgICBAcGFyYW0ge29iamVjdH0gdGhlbWUuc2VyaWVzIHNlcmllcyB0aGVtZVxuICogICAgICAgICAgQHBhcmFtIHthcnJheS48c3RyaW5nPn0gdGhlbWUuc2VyaWVzLmNvbG9ycyBzZXJpZXMgY29sb3JzXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUuc2VyaWVzLmJvcmRlckNvbG9yIHNlcmllcyBib3JkZXIgY29sb3JcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IHRoZW1lLmxlZ2VuZCBsZWdlbmQgdGhlbWVcbiAqICAgICAgICAgIEBwYXJhbSB7b2JqZWN0fSB0aGVtZS5sZWdlbmQubGFiZWwgdGhlbWUgb2YgbGVnZW5kIGxhYmVsXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IHRoZW1lLmxlZ2VuZC5sYWJlbC5mb250U2l6ZSBmb250IHNpemUgb2YgbGVnZW5kIGxhYmVsXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLmxlZ2VuZC5sYWJlbC5mb250RmFtaWx5IGZvbnQgZmFtaWx5IG9mIGxlZ2VuZCBsYWJlbFxuICogICAgICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS5sZWdlbmQubGFiZWwuY29sb3IgZm9udCBjb2xvciBvZiBsZWdlbmQgbGFiZWxcbiAqIEBleGFtcGxlXG4gKiB2YXIgdGhlbWUgPSB7XG4gKiAgIHlBeGlzOiB7XG4gKiAgICAgdGlja0NvbG9yOiAnI2NjYmQ5YScsXG4gKiAgICAgICB0aXRsZToge1xuICogICAgICAgICBjb2xvcjogJyMzMzMzMzMnXG4gKiAgICAgICB9LFxuICogICAgICAgbGFiZWw6IHtcbiAqICAgICAgICAgY29sb3I6ICcjNmY0OTFkJ1xuICogICAgICAgfVxuICogICAgIH0sXG4gKiAgICAgeEF4aXM6IHtcbiAqICAgICAgIHRpY2tDb2xvcjogJyNjY2JkOWEnLFxuICogICAgICAgdGl0bGU6IHtcbiAqICAgICAgICAgY29sb3I6ICcjMzMzMzMzJ1xuICogICAgICAgfSxcbiAqICAgICAgIGxhYmVsOiB7XG4gKiAgICAgICAgIGNvbG9yOiAnIzZmNDkxZCdcbiAqICAgICAgIH1cbiAqICAgICB9LFxuICogICAgIHBsb3Q6IHtcbiAqICAgICAgIGxpbmVDb2xvcjogJyNlNWRiYzQnLFxuICogICAgICAgYmFja2dyb3VuZDogJyNmNmYxZTUnXG4gKiAgICAgfSxcbiAqICAgICBzZXJpZXM6IHtcbiAqICAgICAgIGNvbG9yczogWycjNDBhYmI0JywgJyNlNzhhMzEnLCAnI2MxYzQ1MicsICcjNzk1MjI0JywgJyNmNWY1ZjUnXSxcbiAqICAgICAgIGJvcmRlckNvbG9yOiAnIzhlNjUzNSdcbiAqICAgICB9LFxuICogICAgIGxlZ2VuZDoge1xuICogICAgICAgbGFiZWw6IHtcbiAqICAgICAgICAgY29sb3I6ICcjNmY0OTFkJ1xuICogICAgICAgfVxuICogICAgIH1cbiAqICAgfTtcbiAqIGNoYXJ0LnJlZ2lzdGVyVGhlbWUoJ25ld1RoZW1lJywgdGhlbWUpO1xuICovXG5uZS5hcHBsaWNhdGlvbi5jaGFydC5yZWdpc3RlclRoZW1lID0gZnVuY3Rpb24odGhlbWVOYW1lLCB0aGVtZSkge1xuICAgIHRoZW1lRmFjdG9yeS5yZWdpc3Rlcih0aGVtZU5hbWUsIHRoZW1lKTtcbn07XG5cbi8qKlxuICogUmVnaXN0ZXIgZ3JhcGggcGx1Z2luLlxuICogQG1lbWJlck9mIG5lLmFwcGxpY2F0aW9uLmNoYXJ0XG4gKiBAcGFyYW0ge3N0cmluZ30gbGliVHlwZSB0eXBlIG9mIGdyYXBoIGxpYnJhcnlcbiAqIEBwYXJhbSB7b2JqZWN0fSBwbHVnaW4gcGx1Z2luIHRvIGNvbnRyb2wgbGlicmFyeVxuICogQGV4YW1wbGVcbiAqIHZhciBwbHVnaW5SYXBoYWVsID0ge1xuICogICBiYXI6IGZ1bmN0aW9uKCkge30gLy8gUmVuZGVyIGNsYXNzXG4gKiB9O1xuICogbmUuYXBwbGljYXRpb24uY2hhcnQucmVnaXN0ZXJQbHVnaW4oJ3JhcGhhZWwnLCBwbHVnaW5SYXBoYWVsKTtcbiAqL1xubmUuYXBwbGljYXRpb24uY2hhcnQucmVnaXN0ZXJQbHVnaW4gPSBmdW5jdGlvbihsaWJUeXBlLCBwbHVnaW4pIHtcbiAgICBwbHVnaW5GYWN0b3J5LnJlZ2lzdGVyKGxpYlR5cGUsIHBsdWdpbik7XG59O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEFyZWEgY2hhcnRcbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIENoYXJ0QmFzZSA9IHJlcXVpcmUoJy4vY2hhcnRCYXNlJyksXG4gICAgQXhpc1R5cGVCYXNlID0gcmVxdWlyZSgnLi9heGlzVHlwZUJhc2UnKSxcbiAgICBWZXJ0aWNhbFR5cGVCYXNlID0gcmVxdWlyZSgnLi92ZXJ0aWNhbFR5cGVCYXNlJyksXG4gICAgY2FsY3VsYXRvciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvY2FsY3VsYXRvcicpLFxuICAgIFNlcmllcyA9IHJlcXVpcmUoJy4uL3Nlcmllcy9hcmVhQ2hhcnRTZXJpZXMnKTtcblxudmFyIEFyZWFDaGFydCA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoQ2hhcnRCYXNlLCAvKiogQGxlbmRzIEFyZWFDaGFydC5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIExpbmUgY2hhcnQuXG4gICAgICogQGNvbnN0cnVjdHMgQXJlYUNoYXJ0XG4gICAgICogQGV4dGVuZHMgQ2hhcnRCYXNlXG4gICAgICogQG1peGVzIEF4aXNUeXBlQmFzZVxuICAgICAqIEBtaXhlcyBWZXJ0aWNhbFR5cGVCYXNlXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXk+fSB1c2VyRGF0YSBjaGFydCBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIGNoYXJ0IHRoZW1lXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBpbml0ZWREYXRhIGluaXRpYWxpemVkIGRhdGEgZnJvbSBjb21ibyBjaGFydFxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKHVzZXJEYXRhLCB0aGVtZSwgb3B0aW9ucywgaW5pdGVkRGF0YSkge1xuICAgICAgICB2YXIgYmFzZURhdGEgPSBpbml0ZWREYXRhIHx8IHRoaXMubWFrZUJhc2VEYXRhKHVzZXJEYXRhLCB0aGVtZSwgb3B0aW9ucywge1xuICAgICAgICAgICAgICAgIGlzVmVydGljYWw6IHRydWUsXG4gICAgICAgICAgICAgICAgaGFzQXhlczogdHJ1ZVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBjb252ZXJ0RGF0YSA9IGJhc2VEYXRhLmNvbnZlcnREYXRhLFxuICAgICAgICAgICAgYm91bmRzID0gYmFzZURhdGEuYm91bmRzLFxuICAgICAgICAgICAgYXhpc0RhdGE7XG5cbiAgICAgICAgdGhpcy5jbGFzc05hbWUgPSAnbmUtbGluZS1hcmVhJztcblxuICAgICAgICBDaGFydEJhc2UuY2FsbCh0aGlzLCBib3VuZHMsIHRoZW1lLCBvcHRpb25zLCBpbml0ZWREYXRhKTtcblxuICAgICAgICBheGlzRGF0YSA9IHRoaXMuX21ha2VBeGVzRGF0YShjb252ZXJ0RGF0YSwgYm91bmRzLCBvcHRpb25zLCBpbml0ZWREYXRhKTtcbiAgICAgICAgdGhpcy5fYWRkQ29tcG9uZW50cyhjb252ZXJ0RGF0YSwgYXhpc0RhdGEsIG9wdGlvbnMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgY29tcG9uZW50c1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb252ZXJ0RGF0YSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBheGVzRGF0YSBheGVzIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYWRkQ29tcG9uZW50czogZnVuY3Rpb24oY29udmVydERhdGEsIGF4ZXNEYXRhLCBvcHRpb25zKSB7XG4gICAgICAgIHRoaXMuYWRkQXhpc0NvbXBvbmVudHMoe1xuICAgICAgICAgICAgY29udmVydERhdGE6IGNvbnZlcnREYXRhLFxuICAgICAgICAgICAgYXhlczogYXhlc0RhdGEsXG4gICAgICAgICAgICBwbG90RGF0YTogIW5lLnV0aWwuaXNVbmRlZmluZWQoY29udmVydERhdGEucGxvdERhdGEpID8gY29udmVydERhdGEucGxvdERhdGEgOiB7XG4gICAgICAgICAgICAgICAgdlRpY2tDb3VudDogYXhlc0RhdGEueUF4aXMudmFsaWRUaWNrQ291bnQsXG4gICAgICAgICAgICAgICAgaFRpY2tDb3VudDogYXhlc0RhdGEueEF4aXMudmFsaWRUaWNrQ291bnRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjaGFydFR5cGU6IG9wdGlvbnMuY2hhcnRUeXBlLFxuICAgICAgICAgICAgU2VyaWVzOiBTZXJpZXMsXG4gICAgICAgICAgICBzZXJpZXNEYXRhOiB7XG4gICAgICAgICAgICAgICAgYWxsb3dOZWdhdGl2ZVRvb2x0aXA6IHRydWUsXG4gICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZXM6IGNhbGN1bGF0b3IuYXJyYXlQaXZvdChjb252ZXJ0RGF0YS52YWx1ZXMpLFxuICAgICAgICAgICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXM6IGNhbGN1bGF0b3IuYXJyYXlQaXZvdChjb252ZXJ0RGF0YS5mb3JtYXR0ZWRWYWx1ZXMpLFxuICAgICAgICAgICAgICAgICAgICBzY2FsZTogYXhlc0RhdGEueUF4aXMuc2NhbGVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuXG5BeGlzVHlwZUJhc2UubWl4aW4oQXJlYUNoYXJ0KTtcblZlcnRpY2FsVHlwZUJhc2UubWl4aW4oQXJlYUNoYXJ0KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBcmVhQ2hhcnQ7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgQXhpc1R5cGVCYXNlIGlzIGJhc2UgY2xhc3Mgb2YgYXhpcyB0eXBlIGNoYXJ0KGJhciwgY29sdW1uLCBsaW5lLCBhcmVhKS5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIEF4aXMgPSByZXF1aXJlKCcuLi9heGVzL2F4aXMuanMnKSxcbiAgICBQbG90ID0gcmVxdWlyZSgnLi4vcGxvdHMvcGxvdC5qcycpLFxuICAgIExlZ2VuZCA9IHJlcXVpcmUoJy4uL2xlZ2VuZHMvbGVnZW5kLmpzJyksXG4gICAgVG9vbHRpcCA9IHJlcXVpcmUoJy4uL3Rvb2x0aXBzL3Rvb2x0aXAuanMnKTtcblxuLyoqXG4gKiBAY2xhc3NkZXNjIEF4aXNUeXBlQmFzZSBpcyBiYXNlIGNsYXNzIG9mIGF4aXMgdHlwZSBjaGFydChiYXIsIGNvbHVtbiwgbGluZSwgYXJlYSkuXG4gKiBAY2xhc3MgQXhpc1R5cGVCYXNlXG4gKiBAbWl4aW5cbiAqL1xudmFyIEF4aXNUeXBlQmFzZSA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBBeGlzVHlwZUJhc2UucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBBZGQgYXhpcyBjb21wb25lbnRzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmNvdmVydERhdGEgY29udmVydGVkIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuYXhlcyBheGVzIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMucGxvdERhdGEgcGxvdCBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge2Z1bmN0aW9ufSBwYXJhbXMuU2VyaWVzIHNlcmllcyBjbGFzc1xuICAgICAqL1xuICAgIGFkZEF4aXNDb21wb25lbnRzOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGNvbnZlcnREYXRhID0gcGFyYW1zLmNvbnZlcnREYXRhLFxuICAgICAgICAgICAgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcblxuICAgICAgICBpZiAocGFyYW1zLnBsb3REYXRhKSB7XG4gICAgICAgICAgICB0aGlzLmFkZENvbXBvbmVudCgncGxvdCcsIFBsb3QsIHBhcmFtcy5wbG90RGF0YSk7XG4gICAgICAgIH1cblxuICAgICAgICBuZS51dGlsLmZvckVhY2gocGFyYW1zLmF4ZXMsIGZ1bmN0aW9uKGRhdGEsIG5hbWUpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KG5hbWUsIEF4aXMsIHtcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgaWYgKGNvbnZlcnREYXRhLmpvaW5MZWdlbmRMYWJlbHMpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KCdsZWdlbmQnLCBMZWdlbmQsIHtcbiAgICAgICAgICAgICAgICBqb2luTGVnZW5kTGFiZWxzOiBjb252ZXJ0RGF0YS5qb2luTGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgICAgIGxlZ2VuZExhYmVsczogY29udmVydERhdGEubGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgICAgIGNoYXJ0VHlwZTogcGFyYW1zLmNoYXJ0VHlwZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmFkZENvbXBvbmVudCgnc2VyaWVzJywgcGFyYW1zLlNlcmllcywgbmUudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgbGliVHlwZTogb3B0aW9ucy5saWJUeXBlLFxuICAgICAgICAgICAgY2hhcnRUeXBlOiBvcHRpb25zLmNoYXJ0VHlwZSxcbiAgICAgICAgICAgIHRvb2x0aXBQcmVmaXg6IHRoaXMudG9vbHRpcFByZWZpeFxuICAgICAgICB9LCBwYXJhbXMuc2VyaWVzRGF0YSkpO1xuXG4gICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KCd0b29sdGlwJywgVG9vbHRpcCwge1xuICAgICAgICAgICAgdmFsdWVzOiBjb252ZXJ0RGF0YS52YWx1ZXMsXG4gICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXM6IGNvbnZlcnREYXRhLmZvcm1hdHRlZFZhbHVlcyxcbiAgICAgICAgICAgIGxhYmVsczogY29udmVydERhdGEubGFiZWxzLFxuICAgICAgICAgICAgbGVnZW5kTGFiZWxzOiBjb252ZXJ0RGF0YS5sZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICBwcmVmaXg6IHRoaXMudG9vbHRpcFByZWZpeFxuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxuQXhpc1R5cGVCYXNlLm1peGluID0gZnVuY3Rpb24oZnVuYykge1xuICAgIG5lLnV0aWwuZXh0ZW5kKGZ1bmMucHJvdG90eXBlLCBBeGlzVHlwZUJhc2UucHJvdG90eXBlKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQXhpc1R5cGVCYXNlO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEJhciBjaGFydC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIENoYXJ0QmFzZSA9IHJlcXVpcmUoJy4vY2hhcnRCYXNlJyksXG4gICAgQXhpc1R5cGVCYXNlID0gcmVxdWlyZSgnLi9heGlzVHlwZUJhc2UnKSxcbiAgICBheGlzRGF0YU1ha2VyID0gcmVxdWlyZSgnLi4vaGVscGVycy9heGlzRGF0YU1ha2VyJyksXG4gICAgU2VyaWVzID0gcmVxdWlyZSgnLi4vc2VyaWVzL2JhckNoYXJ0U2VyaWVzJyk7XG5cbnZhciBCYXJDaGFydCA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoQ2hhcnRCYXNlLCAvKiogQGxlbmRzIEJhckNoYXJ0LnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogQmFyIGNoYXJ0LlxuICAgICAqIEBjb25zdHJ1Y3RzIEJhckNoYXJ0XG4gICAgICogQGV4dGVuZHMgQ2hhcnRCYXNlXG4gICAgICogQG1peGVzIEF4aXNUeXBlQmFzZVxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gdXNlckRhdGEgY2hhcnQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBjaGFydCB0aGVtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbih1c2VyRGF0YSwgdGhlbWUsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIGJhc2VEYXRhID0gdGhpcy5tYWtlQmFzZURhdGEodXNlckRhdGEsIHRoZW1lLCBvcHRpb25zLCB7XG4gICAgICAgICAgICAgICAgaGFzQXhlczogdHJ1ZVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBjb252ZXJ0RGF0YSA9IGJhc2VEYXRhLmNvbnZlcnREYXRhLFxuICAgICAgICAgICAgYm91bmRzID0gYmFzZURhdGEuYm91bmRzLFxuICAgICAgICAgICAgYXhpc0RhdGE7XG5cbiAgICAgICAgdGhpcy5jbGFzc05hbWUgPSAnbmUtYmFyLWNoYXJ0JztcblxuICAgICAgICBDaGFydEJhc2UuY2FsbCh0aGlzLCBib3VuZHMsIHRoZW1lLCBvcHRpb25zKTtcblxuICAgICAgICBheGlzRGF0YSA9IHRoaXMuX21ha2VBeGVzRGF0YShjb252ZXJ0RGF0YSwgYm91bmRzLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5fYWRkQ29tcG9uZW50cyhjb252ZXJ0RGF0YSwgYXhpc0RhdGEsIG9wdGlvbnMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGF4ZXMgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb252ZXJ0RGF0YSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBib3VuZHMgY2hhcnQgYm91bmRzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IGF4ZXMgZGF0YVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VBeGVzRGF0YTogZnVuY3Rpb24oY29udmVydERhdGEsIGJvdW5kcywgb3B0aW9ucykge1xuICAgICAgICB2YXIgYXhlc0RhdGEgPSB7XG4gICAgICAgICAgICB5QXhpczogYXhpc0RhdGFNYWtlci5tYWtlTGFiZWxBeGlzRGF0YSh7XG4gICAgICAgICAgICAgICAgbGFiZWxzOiBjb252ZXJ0RGF0YS5sYWJlbHMsXG4gICAgICAgICAgICAgICAgaXNWZXJ0aWNhbDogdHJ1ZVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICB4QXhpczogYXhpc0RhdGFNYWtlci5tYWtlVmFsdWVBeGlzRGF0YSh7XG4gICAgICAgICAgICAgICAgdmFsdWVzOiBjb252ZXJ0RGF0YS52YWx1ZXMsXG4gICAgICAgICAgICAgICAgc2VyaWVzRGltZW5zaW9uOiBib3VuZHMuc2VyaWVzLmRpbWVuc2lvbixcbiAgICAgICAgICAgICAgICBzdGFja2VkOiBvcHRpb25zLnNlcmllcyAmJiBvcHRpb25zLnNlcmllcy5zdGFja2VkIHx8ICcnLFxuICAgICAgICAgICAgICAgIGNoYXJ0VHlwZTogb3B0aW9ucy5jaGFydFR5cGUsXG4gICAgICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zOiBjb252ZXJ0RGF0YS5mb3JtYXRGdW5jdGlvbnMsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogb3B0aW9ucy54QXhpc1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGF4ZXNEYXRhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgY29tcG9uZW50c1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb252ZXJ0RGF0YSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBheGVzRGF0YSBheGVzIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYWRkQ29tcG9uZW50czogZnVuY3Rpb24oY29udmVydERhdGEsIGF4ZXNEYXRhLCBvcHRpb25zKSB7XG4gICAgICAgIHRoaXMuYWRkQXhpc0NvbXBvbmVudHMoe1xuICAgICAgICAgICAgY29udmVydERhdGE6IGNvbnZlcnREYXRhLFxuICAgICAgICAgICAgYXhlczogYXhlc0RhdGEsXG4gICAgICAgICAgICBwbG90RGF0YToge1xuICAgICAgICAgICAgICAgIHZUaWNrQ291bnQ6IGF4ZXNEYXRhLnlBeGlzLnZhbGlkVGlja0NvdW50LFxuICAgICAgICAgICAgICAgIGhUaWNrQ291bnQ6IGF4ZXNEYXRhLnhBeGlzLnZhbGlkVGlja0NvdW50XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2hhcnRUeXBlOiBvcHRpb25zLmNoYXJ0VHlwZSxcbiAgICAgICAgICAgIFNlcmllczogU2VyaWVzLFxuICAgICAgICAgICAgc2VyaWVzRGF0YToge1xuICAgICAgICAgICAgICAgIGFsbG93TmVnYXRpdmVUb29sdGlwOiB0cnVlLFxuICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzOiBjb252ZXJ0RGF0YS52YWx1ZXMsXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlczogY29udmVydERhdGEuZm9ybWF0dGVkVmFsdWVzLFxuICAgICAgICAgICAgICAgICAgICBmb3JtYXRGdW5jdGlvbnM6IGNvbnZlcnREYXRhLmZvcm1hdEZ1bmN0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgc2NhbGU6IGF4ZXNEYXRhLnhBeGlzLnNjYWxlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxuQXhpc1R5cGVCYXNlLm1peGluKEJhckNoYXJ0KTtcblxubW9kdWxlLmV4cG9ydHMgPSBCYXJDaGFydDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBDaGFydEJhc2VcbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGRvbSA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZG9tSGFuZGxlci5qcycpLFxuICAgIHJlbmRlclV0aWwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3JlbmRlclV0aWwuanMnKSxcbiAgICBkYXRhQ29udmVydGVyID0gcmVxdWlyZSgnLi4vaGVscGVycy9kYXRhQ29udmVydGVyLmpzJyksXG4gICAgYm91bmRzTWFrZXIgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2JvdW5kc01ha2VyLmpzJyk7XG5cbnZhciBUT09MVElQX1BSRUZJWCA9ICduZS1jaGFydC10b29sdGlwLSc7XG5cbnZhciBDaGFydEJhc2UgPSBuZS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgQ2hhcnRCYXNlLnByb3RvdHlwZSAqLyB7XG4gICAgdG9vbHRpcFByZWZpeDogVE9PTFRJUF9QUkVGSVggKyAobmV3IERhdGUoKSkuZ2V0VGltZSgpICsgJy0nLFxuXG4gICAgLyoqXG4gICAgICogQ2hhcnQgYmFzZS5cbiAgICAgKiBAY29uc3RydWN0cyBDaGFydEJhc2VcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYm91bmRzIGNoYXJ0IGJvdW5kc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBjaGFydCB0aGVtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gaW5pdGVkRGF0YSBpbml0aWFsaXplZCBkYXRhIGZyb20gY29tYm8gY2hhcnRcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihib3VuZHMsIHRoZW1lLCBvcHRpb25zLCBpbml0ZWREYXRhKSB7XG4gICAgICAgIHRoaXMuY29tcG9uZW50cyA9IFtdO1xuICAgICAgICB0aGlzLmNvbXBvbmVudE1hcCA9IHt9O1xuICAgICAgICB0aGlzLmJvdW5kcyA9IGJvdW5kcztcbiAgICAgICAgdGhpcy50aGVtZSA9IHRoZW1lO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgICAgICBpZiAoaW5pdGVkRGF0YSAmJiBpbml0ZWREYXRhLnByZWZpeCkge1xuICAgICAgICAgICAgdGhpcy50b29sdGlwUHJlZml4ICs9IGluaXRlZERhdGEucHJlZml4O1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYmFlcyBkYXRhLlxuICAgICAqIEBwYXJhbSB7YXJyYXkgfCBvYmplY3R9IHVzZXJEYXRhIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBjaGFydCB0aGVtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYm91bmRQYXJhbXMgYWRkIGJvdW5kIHBhcmFtc1xuICAgICAqIEByZXR1cm5zIHt7Y29udmVydERhdGE6IG9iamVjdCwgYm91bmRzOiBvYmplY3R9fSBiYXNlIGRhdGFcbiAgICAgKi9cbiAgICBtYWtlQmFzZURhdGE6IGZ1bmN0aW9uKHVzZXJEYXRhLCB0aGVtZSwgb3B0aW9ucywgYm91bmRQYXJhbXMpIHtcbiAgICAgICAgdmFyIGNvbnZlcnREYXRhID0gZGF0YUNvbnZlcnRlci5jb252ZXJ0KHVzZXJEYXRhLCBvcHRpb25zLmNoYXJ0LCBvcHRpb25zLmNoYXJ0VHlwZSksXG4gICAgICAgICAgICBib3VuZHMgPSBib3VuZHNNYWtlci5tYWtlKG5lLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICBjaGFydFR5cGU6IG9wdGlvbnMuY2hhcnRUeXBlLFxuICAgICAgICAgICAgICAgIGNvbnZlcnREYXRhOiBjb252ZXJ0RGF0YSxcbiAgICAgICAgICAgICAgICB0aGVtZTogdGhlbWUsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgICAgICAgICAgfSwgYm91bmRQYXJhbXMpKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY29udmVydERhdGE6IGNvbnZlcnREYXRhLFxuICAgICAgICAgICAgYm91bmRzOiBib3VuZHNcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIGNvbXBvbmVudC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBjb21wb25lbnQgbmFtZVxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IENvbXBvbmVudCBjb21wb25lbnQgZnVuY3Rpb25cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKi9cbiAgICBhZGRDb21wb25lbnQ6IGZ1bmN0aW9uKG5hbWUsIENvbXBvbmVudCwgcGFyYW1zKSB7XG4gICAgICAgIHZhciBib3VuZCA9IHRoaXMuYm91bmRzW25hbWVdLFxuICAgICAgICAgICAgdGhlbWUgPSB0aGlzLnRoZW1lW25hbWVdLFxuICAgICAgICAgICAgb3B0aW9ucyA9IHRoaXMub3B0aW9uc1tuYW1lXSxcbiAgICAgICAgICAgIGluZGV4ID0gcGFyYW1zLmluZGV4IHx8IDAsXG4gICAgICAgICAgICBjb21tb25QYXJhbXMgPSB7fSxcbiAgICAgICAgICAgIGNvbXBvbmVudDtcblxuICAgICAgICBjb21tb25QYXJhbXMuYm91bmQgPSBuZS51dGlsLmlzQXJyYXkoYm91bmQpID8gYm91bmRbaW5kZXhdIDogYm91bmQ7XG4gICAgICAgIGNvbW1vblBhcmFtcy50aGVtZSA9IG5lLnV0aWwuaXNBcnJheSh0aGVtZSkgPyB0aGVtZVtpbmRleF0gOiB0aGVtZTtcbiAgICAgICAgY29tbW9uUGFyYW1zLm9wdGlvbnMgPSBuZS51dGlsLmlzQXJyYXkob3B0aW9ucykgPyBvcHRpb25zW2luZGV4XSA6IG9wdGlvbnMgfHwge307XG5cbiAgICAgICAgcGFyYW1zID0gbmUudXRpbC5leHRlbmQoY29tbW9uUGFyYW1zLCBwYXJhbXMpO1xuICAgICAgICBjb21wb25lbnQgPSBuZXcgQ29tcG9uZW50KHBhcmFtcyk7XG4gICAgICAgIHRoaXMuY29tcG9uZW50cy5wdXNoKGNvbXBvbmVudCk7XG4gICAgICAgIHRoaXMuY29tcG9uZW50TWFwW25hbWVdID0gY29tcG9uZW50O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgY2hhcnQuXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgY2hhcnQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciBvYmplY3QgZm9yIGdyYXBoIGRyYXdpbmdcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IGNoYXJ0IGVsZW1lbnRcbiAgICAgKi9cbiAgICByZW5kZXI6IGZ1bmN0aW9uKGVsLCBwYXBlcikge1xuICAgICAgICBpZiAoIWVsKSB7XG4gICAgICAgICAgICBlbCA9IGRvbS5jcmVhdGUoJ0RJVicsIHRoaXMuY2xhc3NOYW1lKTtcblxuICAgICAgICAgICAgZG9tLmFkZENsYXNzKGVsLCAnbmUtY2hhcnQnKTtcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlclRpdGxlKGVsKTtcbiAgICAgICAgICAgIHJlbmRlclV0aWwucmVuZGVyRGltZW5zaW9uKGVsLCB0aGlzLmJvdW5kcy5jaGFydC5kaW1lbnNpb24pO1xuICAgICAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJCYWNrZ3JvdW5kKGVsLCB0aGlzLnRoZW1lLmNoYXJ0LmJhY2tncm91bmQpO1xuICAgICAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJGb250RmFtaWx5KGVsLCB0aGlzLnRoZW1lLmNoYXJ0LmZvbnRGYW1pbHkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fcmVuZGVyQ29tcG9uZW50cyhlbCwgdGhpcy5jb21wb25lbnRzLCBwYXBlcik7XG4gICAgICAgIHRoaXMuX2F0dGFjaEN1c3RvbUV2ZW50KCk7XG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIHRpdGxlLlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyVGl0bGU6IGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgIHZhciBjaGFydE9wdGlvbnMgPSB0aGlzLm9wdGlvbnMuY2hhcnQgfHwge30sXG4gICAgICAgICAgICBlbFRpdGxlID0gcmVuZGVyVXRpbC5yZW5kZXJUaXRsZShjaGFydE9wdGlvbnMudGl0bGUsIHRoaXMudGhlbWUudGl0bGUsICduZS1jaGFydC10aXRsZScpO1xuICAgICAgICBkb20uYXBwZW5kKGVsLCBlbFRpdGxlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGNvbXBvbmVudHMuXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNvbnRhaW5lciBlbGVtZW50XG4gICAgICogQHBhcmFtIHthcnJheS48b2JqZWN0Pn0gY29tcG9uZW50cyBjb21wb25lbnRzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIG9iamVjdCBmb3IgZ3JhcGggZHJhd2luZ1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlckNvbXBvbmVudHM6IGZ1bmN0aW9uKGNvbnRhaW5lciwgY29tcG9uZW50cywgcGFwZXIpIHtcbiAgICAgICAgdmFyIGVsZW1lbnRzID0gbmUudXRpbC5tYXAoY29tcG9uZW50cywgZnVuY3Rpb24oY29tcG9uZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gY29tcG9uZW50LnJlbmRlcihwYXBlcik7XG4gICAgICAgIH0pO1xuICAgICAgICBkb20uYXBwZW5kKGNvbnRhaW5lciwgZWxlbWVudHMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgcGFwZXIuXG4gICAgICogQHJldHVybnMge29iamVjdH0gcGFwZXJcbiAgICAgKi9cbiAgICBnZXRQYXBlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZXJpZXMgPSB0aGlzLmNvbXBvbmVudE1hcC5zZXJpZXMsXG4gICAgICAgICAgICBwYXBlcjtcblxuICAgICAgICBpZiAoc2VyaWVzKSB7XG4gICAgICAgICAgICBwYXBlciA9IHNlcmllcy5nZXRQYXBlcigpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhcGVyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggY3VzdG9tIGV2ZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYXR0YWNoQ3VzdG9tRXZlbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdG9vbHRpcCA9IHRoaXMuY29tcG9uZW50TWFwLnRvb2x0aXAsXG4gICAgICAgICAgICBzZXJpZXMgPSB0aGlzLmNvbXBvbmVudE1hcC5zZXJpZXM7XG4gICAgICAgIGlmICghdG9vbHRpcCB8fCAhc2VyaWVzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc2VyaWVzLm9uKCdzaG93VG9vbHRpcCcsIHRvb2x0aXAub25TaG93LCB0b29sdGlwKTtcbiAgICAgICAgc2VyaWVzLm9uKCdoaWRlVG9vbHRpcCcsIHRvb2x0aXAub25IaWRlLCB0b29sdGlwKTtcblxuICAgICAgICBpZiAoIXNlcmllcy5vblNob3dBbmltYXRpb24pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRvb2x0aXAub24oJ3Nob3dBbmltYXRpb24nLCBzZXJpZXMub25TaG93QW5pbWF0aW9uLCBzZXJpZXMpO1xuICAgICAgICB0b29sdGlwLm9uKCdoaWRlQW5pbWF0aW9uJywgc2VyaWVzLm9uSGlkZUFuaW1hdGlvbiwgc2VyaWVzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQW5pbWF0ZSBjaGFydC5cbiAgICAgKi9cbiAgICBhbmltYXRlQ2hhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBuZS51dGlsLmZvckVhY2hBcnJheSh0aGlzLmNvbXBvbmVudHMsIGZ1bmN0aW9uKGNvbXBvbmVudCkge1xuICAgICAgICAgICAgaWYgKGNvbXBvbmVudC5hbmltYXRlQ29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LmFuaW1hdGVDb21wb25lbnQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENoYXJ0QmFzZTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBDb2x1bW4gY2hhcnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBDaGFydEJhc2UgPSByZXF1aXJlKCcuL2NoYXJ0QmFzZScpLFxuICAgIEF4aXNUeXBlQmFzZSA9IHJlcXVpcmUoJy4vYXhpc1R5cGVCYXNlJyksXG4gICAgVmVydGljYWxUeXBlQmFzZSA9IHJlcXVpcmUoJy4vdmVydGljYWxUeXBlQmFzZScpLFxuICAgIFNlcmllcyA9IHJlcXVpcmUoJy4uL3Nlcmllcy9jb2x1bW5DaGFydFNlcmllcycpO1xuXG52YXIgQ29sdW1uQ2hhcnQgPSBuZS51dGlsLmRlZmluZUNsYXNzKENoYXJ0QmFzZSwgLyoqIEBsZW5kcyBDb2x1bW5DaGFydC5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIENvbHVtbiBjaGFydC5cbiAgICAgKiBAY29uc3RydWN0cyBDb2x1bW5DaGFydFxuICAgICAqIEBleHRlbmRzIENoYXJ0QmFzZVxuICAgICAqIEBtaXhlcyBBeGlzVHlwZUJhc2VcbiAgICAgKiBAbWl4ZXMgVmVydGljYWxUeXBlQmFzZVxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gdXNlckRhdGEgY2hhcnQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBjaGFydCB0aGVtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gaW5pdGVkRGF0YSBpbml0aWFsaXplZCBkYXRhIGZyb20gY29tYm8gY2hhcnRcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbih1c2VyRGF0YSwgdGhlbWUsIG9wdGlvbnMsIGluaXRlZERhdGEpIHtcbiAgICAgICAgdmFyIGJhc2VEYXRhID0gaW5pdGVkRGF0YSB8fCB0aGlzLm1ha2VCYXNlRGF0YSh1c2VyRGF0YSwgdGhlbWUsIG9wdGlvbnMsIHtcbiAgICAgICAgICAgICAgICBpc1ZlcnRpY2FsOiB0cnVlLFxuICAgICAgICAgICAgICAgIGhhc0F4ZXM6IHRydWVcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgY29udmVydERhdGEgPSBiYXNlRGF0YS5jb252ZXJ0RGF0YSxcbiAgICAgICAgICAgIGJvdW5kcyA9IGJhc2VEYXRhLmJvdW5kcyxcbiAgICAgICAgICAgIGF4aXNEYXRhO1xuXG4gICAgICAgIHRoaXMuY2xhc3NOYW1lID0gJ25lLWNvbHVtbi1jaGFydCc7XG5cbiAgICAgICAgQ2hhcnRCYXNlLmNhbGwodGhpcywgYm91bmRzLCB0aGVtZSwgb3B0aW9ucywgaW5pdGVkRGF0YSk7XG5cbiAgICAgICAgYXhpc0RhdGEgPSB0aGlzLl9tYWtlQXhlc0RhdGEoY29udmVydERhdGEsIGJvdW5kcywgb3B0aW9ucywgaW5pdGVkRGF0YSk7XG4gICAgICAgIHRoaXMuX2FkZENvbXBvbmVudHMoY29udmVydERhdGEsIGF4aXNEYXRhLCBvcHRpb25zKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIGNvbXBvbmVudHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udmVydERhdGEgY29udmVydGVkIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYXhlc0RhdGEgYXhlcyBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2FkZENvbXBvbmVudHM6IGZ1bmN0aW9uKGNvbnZlcnREYXRhLCBheGVzRGF0YSwgb3B0aW9ucykge1xuICAgICAgICB0aGlzLmFkZEF4aXNDb21wb25lbnRzKHtcbiAgICAgICAgICAgIGNvbnZlcnREYXRhOiBjb252ZXJ0RGF0YSxcbiAgICAgICAgICAgIGF4ZXM6IGF4ZXNEYXRhLFxuICAgICAgICAgICAgcGxvdERhdGE6ICFuZS51dGlsLmlzVW5kZWZpbmVkKGNvbnZlcnREYXRhLnBsb3REYXRhKSA/IGNvbnZlcnREYXRhLnBsb3REYXRhIDoge1xuICAgICAgICAgICAgICAgIHZUaWNrQ291bnQ6IGF4ZXNEYXRhLnlBeGlzLnZhbGlkVGlja0NvdW50LFxuICAgICAgICAgICAgICAgIGhUaWNrQ291bnQ6IGF4ZXNEYXRhLnhBeGlzLnZhbGlkVGlja0NvdW50XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2hhcnRUeXBlOiBvcHRpb25zLmNoYXJ0VHlwZSxcbiAgICAgICAgICAgIFNlcmllczogU2VyaWVzLFxuICAgICAgICAgICAgc2VyaWVzRGF0YToge1xuICAgICAgICAgICAgICAgIGFsbG93TmVnYXRpdmVUb29sdGlwOiB0cnVlLFxuICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzOiBjb252ZXJ0RGF0YS52YWx1ZXMsXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlczogY29udmVydERhdGEuZm9ybWF0dGVkVmFsdWVzLFxuICAgICAgICAgICAgICAgICAgICBmb3JtYXRGdW5jdGlvbnM6IGNvbnZlcnREYXRhLmZvcm1hdEZ1bmN0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgc2NhbGU6IGF4ZXNEYXRhLnlBeGlzLnNjYWxlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxuQXhpc1R5cGVCYXNlLm1peGluKENvbHVtbkNoYXJ0KTtcblZlcnRpY2FsVHlwZUJhc2UubWl4aW4oQ29sdW1uQ2hhcnQpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbHVtbkNoYXJ0O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IENvbWJvIGNoYXJ0LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2FsY3VsYXRvciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvY2FsY3VsYXRvci5qcycpLFxuICAgIENoYXJ0QmFzZSA9IHJlcXVpcmUoJy4vY2hhcnRCYXNlLmpzJyksXG4gICAgYXhpc0RhdGFNYWtlciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvYXhpc0RhdGFNYWtlci5qcycpLFxuICAgIGRlZmF1bHRUaGVtZSA9IHJlcXVpcmUoJy4uL3RoZW1lcy9kZWZhdWx0VGhlbWUuanMnKSxcbiAgICBDb2x1bW5DaGFydCA9IHJlcXVpcmUoJy4vY29sdW1uQ2hhcnQnKSxcbiAgICBMaW5lQ2hhcnQgPSByZXF1aXJlKCcuL2xpbmVDaGFydCcpO1xuXG52YXIgQ29tYm9DaGFydCA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoQ2hhcnRCYXNlLCAvKiogQGxlbmRzIENvbWJvQ2hhcnQucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBDb21ibyBjaGFydC5cbiAgICAgKiBAY29uc3RydWN0cyBDb21ib0NoYXJ0XG4gICAgICogQGV4dGVuZHMgQ2hhcnRCYXNlXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXk+fSB1c2VyRGF0YSBjaGFydCBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIGNoYXJ0IHRoZW1lXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKHVzZXJEYXRhLCB0aGVtZSwgb3B0aW9ucykge1xuICAgICAgICB2YXIgc2VyaWVzQ2hhcnRUeXBlcyA9IG5lLnV0aWwua2V5cyh1c2VyRGF0YS5zZXJpZXMpLnNvcnQoKSxcbiAgICAgICAgICAgIG9wdGlvbkNoYXJ0VHlwZXMgPSB0aGlzLl9nZXRZQXhpc09wdGlvbkNoYXJ0VHlwZXMoc2VyaWVzQ2hhcnRUeXBlcywgb3B0aW9ucy55QXhpcyksXG4gICAgICAgICAgICBjaGFydFR5cGVzID0gb3B0aW9uQ2hhcnRUeXBlcy5sZW5ndGggPyBvcHRpb25DaGFydFR5cGVzIDogc2VyaWVzQ2hhcnRUeXBlcyxcbiAgICAgICAgICAgIGJhc2VEYXRhID0gdGhpcy5tYWtlQmFzZURhdGEodXNlckRhdGEsIHRoZW1lLCBvcHRpb25zLCB7XG4gICAgICAgICAgICAgICAgaXNWZXJ0aWNhbDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBoYXNBeGVzOiB0cnVlLFxuICAgICAgICAgICAgICAgIG9wdGlvbkNoYXJ0VHlwZXM6IG9wdGlvbkNoYXJ0VHlwZXNcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgY29udmVydERhdGEgPSBiYXNlRGF0YS5jb252ZXJ0RGF0YSxcbiAgICAgICAgICAgIGJvdW5kcyA9IGJhc2VEYXRhLmJvdW5kcyxcbiAgICAgICAgICAgIG9wdGlvbnNNYXAgPSB0aGlzLl9tYWtlT3B0aW9uc01hcChjaGFydFR5cGVzLCBvcHRpb25zKSxcbiAgICAgICAgICAgIHRoZW1lTWFwID0gdGhpcy5fbWFrZVRoZW1lTWFwKHNlcmllc0NoYXJ0VHlwZXMsIHRoZW1lLCBjb252ZXJ0RGF0YS5sZWdlbmRMYWJlbHMpLFxuICAgICAgICAgICAgeUF4aXNQYXJhbXMgPSB7XG4gICAgICAgICAgICAgICAgY29udmVydERhdGE6IGNvbnZlcnREYXRhLFxuICAgICAgICAgICAgICAgIHNlcmllc0RpbWVuc2lvbjogYm91bmRzLnNlcmllcy5kaW1lbnNpb24sXG4gICAgICAgICAgICAgICAgY2hhcnRUeXBlczogY2hhcnRUeXBlcyxcbiAgICAgICAgICAgICAgICBpc09uZVlBeGlzOiAhb3B0aW9uQ2hhcnRUeXBlcy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJhc2VBeGVzRGF0YSA9IHt9O1xuXG4gICAgICAgIHRoaXMuY2xhc3NOYW1lID0gJ25lLWNvbWJvLWNoYXJ0JztcblxuICAgICAgICBDaGFydEJhc2UuY2FsbCh0aGlzLCBib3VuZHMsIHRoZW1lLCBvcHRpb25zKTtcblxuICAgICAgICBiYXNlQXhlc0RhdGEueUF4aXMgPSB0aGlzLl9tYWtlWUF4aXNEYXRhKG5lLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgIGluZGV4OiAwXG4gICAgICAgIH0sIHlBeGlzUGFyYW1zKSk7XG5cbiAgICAgICAgYmFzZUF4ZXNEYXRhLnhBeGlzID0gYXhpc0RhdGFNYWtlci5tYWtlTGFiZWxBeGlzRGF0YSh7XG4gICAgICAgICAgICBsYWJlbHM6IGNvbnZlcnREYXRhLmxhYmVsc1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLl9pbnN0YWxsQ2hhcnRzKHtcbiAgICAgICAgICAgIHVzZXJEYXRhOiB1c2VyRGF0YSxcbiAgICAgICAgICAgIGJhc2VEYXRhOiBiYXNlRGF0YSxcbiAgICAgICAgICAgIGJhc2VBeGVzRGF0YTogYmFzZUF4ZXNEYXRhLFxuICAgICAgICAgICAgYXhlc0RhdGE6IHRoaXMuX21ha2VBeGVzRGF0YShiYXNlQXhlc0RhdGEsIHlBeGlzUGFyYW1zKSxcbiAgICAgICAgICAgIHNlcmllc0NoYXJ0VHlwZXM6IHNlcmllc0NoYXJ0VHlwZXMsXG4gICAgICAgICAgICBvcHRpb25zTWFwOiBvcHRpb25zTWFwLFxuICAgICAgICAgICAgdGhlbWVNYXA6IHRoZW1lTWFwXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgeSBheGlzIG9wdGlvbiBjaGFydCB0eXBlcy5cbiAgICAgKiBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBjaGFydFR5cGVzIGNoYXJ0IHR5cGVzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHlBeGlzT3B0aW9ucyB5IGF4aXMgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHthcnJheS48c3RyaW5nPn0gY2hhcnQgdHlwZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRZQXhpc09wdGlvbkNoYXJ0VHlwZXM6IGZ1bmN0aW9uKGNoYXJ0VHlwZXMsIHlBeGlzT3B0aW9ucykge1xuICAgICAgICB2YXIgcmVzdWx0Q2hhcnRUeXBlcyA9IGNoYXJ0VHlwZXMuc2xpY2UoKSxcbiAgICAgICAgICAgIGlzUmV2ZXJzZSA9IGZhbHNlLFxuICAgICAgICAgICAgb3B0aW9uQ2hhcnRUeXBlcztcblxuICAgICAgICB5QXhpc09wdGlvbnMgPSB5QXhpc09wdGlvbnMgPyBbXS5jb25jYXQoeUF4aXNPcHRpb25zKSA6IFtdO1xuXG4gICAgICAgIGlmICh5QXhpc09wdGlvbnMubGVuZ3RoID09PSAxICYmICF5QXhpc09wdGlvbnNbMF0uY2hhcnRUeXBlKSB7XG4gICAgICAgICAgICByZXN1bHRDaGFydFR5cGVzID0gW107XG4gICAgICAgIH0gZWxzZSBpZiAoeUF4aXNPcHRpb25zLmxlbmd0aCkge1xuICAgICAgICAgICAgb3B0aW9uQ2hhcnRUeXBlcyA9IG5lLnV0aWwubWFwKHlBeGlzT3B0aW9ucywgZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbi5jaGFydFR5cGU7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkob3B0aW9uQ2hhcnRUeXBlcywgZnVuY3Rpb24oY2hhcnRUeXBlLCBpbmRleCkge1xuICAgICAgICAgICAgICAgIGlzUmV2ZXJzZSA9IGlzUmV2ZXJzZSB8fCAoY2hhcnRUeXBlICYmIHJlc3VsdENoYXJ0VHlwZXNbaW5kZXhdICE9PSBjaGFydFR5cGUgfHwgZmFsc2UpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmIChpc1JldmVyc2UpIHtcbiAgICAgICAgICAgICAgICByZXN1bHRDaGFydFR5cGVzLnJldmVyc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHRDaGFydFR5cGVzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHkgYXhpcyBkYXRhLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5pbmRleCBjaGFydCBpbmRleFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5jb252ZXJ0RGF0YSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBwYXJhbXMuc2VyaWVzRGltZW5zaW9uIHNlcmllcyBkaW1lbnNpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGNoYXJ0VHlwZXMgY2hhcnQgdHlwZVxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBpc09uZVlBeGlzIHdoZXRoZXIgb25lIHNlcmllcyBvciBub3RcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBhZGRQYXJhbXMgYWRkIHBhcmFtc1xuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHkgYXhpcyBkYXRhXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVlBeGlzRGF0YTogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBjb252ZXJ0RGF0YSA9IHBhcmFtcy5jb252ZXJ0RGF0YSxcbiAgICAgICAgICAgIGluZGV4ID0gcGFyYW1zLmluZGV4LFxuICAgICAgICAgICAgY2hhcnRUeXBlID0gcGFyYW1zLmNoYXJ0VHlwZXNbaW5kZXhdLFxuICAgICAgICAgICAgb3B0aW9ucyA9IHBhcmFtcy5vcHRpb25zLFxuICAgICAgICAgICAgeUF4aXNWYWx1ZXMsIHlBeGlzT3B0aW9ucywgc2VyaWVzT3B0aW9uO1xuXG4gICAgICAgIGlmIChwYXJhbXMuaXNPbmVZQXhpcykge1xuICAgICAgICAgICAgeUF4aXNWYWx1ZXMgPSBjb252ZXJ0RGF0YS5qb2luVmFsdWVzO1xuICAgICAgICAgICAgeUF4aXNPcHRpb25zID0gW29wdGlvbnMueUF4aXNdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgeUF4aXNWYWx1ZXMgPSBjb252ZXJ0RGF0YS52YWx1ZXNbY2hhcnRUeXBlXTtcbiAgICAgICAgICAgIHlBeGlzT3B0aW9ucyA9IG9wdGlvbnMueUF4aXMgfHwgW107XG4gICAgICAgIH1cblxuICAgICAgICBzZXJpZXNPcHRpb24gPSBvcHRpb25zLnNlcmllcyAmJiBvcHRpb25zLnNlcmllc1tjaGFydFR5cGVdIHx8IG9wdGlvbnMuc2VyaWVzO1xuXG4gICAgICAgIHJldHVybiBheGlzRGF0YU1ha2VyLm1ha2VWYWx1ZUF4aXNEYXRhKG5lLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgIHZhbHVlczogeUF4aXNWYWx1ZXMsXG4gICAgICAgICAgICBzdGFja2VkOiBzZXJpZXNPcHRpb24gJiYgc2VyaWVzT3B0aW9uLnN0YWNrZWQgfHwgJycsXG4gICAgICAgICAgICBvcHRpb25zOiB5QXhpc09wdGlvbnNbaW5kZXhdLFxuICAgICAgICAgICAgY2hhcnRUeXBlOiBjaGFydFR5cGUsXG4gICAgICAgICAgICBzZXJpZXNEaW1lbnNpb246IHBhcmFtcy5zZXJpZXNEaW1lbnNpb24sXG4gICAgICAgICAgICBmb3JtYXRGdW5jdGlvbnM6IGNvbnZlcnREYXRhLmZvcm1hdEZ1bmN0aW9ucyxcbiAgICAgICAgICAgIGlzVmVydGljYWw6IHRydWVcbiAgICAgICAgfSwgcGFyYW1zLmFkZFBhcmFtcykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGF4ZXMgZGF0YS5cbiAgICAgKiBAcGFyYW0ge3t5QXhpczogb2JqZWN0LCB4QXhpczogb2JqZWN0fX0gYmFzZUF4ZXNEYXRhIGJhc2UgYXhlcyBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHlBeGlzUGFyYW1zIHkgYXhpcyBwYXJhbXNcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBheGVzIGRhdGFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQXhlc0RhdGE6IGZ1bmN0aW9uKGJhc2VBeGVzRGF0YSwgeUF4aXNQYXJhbXMpIHtcbiAgICAgICAgdmFyIHlBeGlzRGF0YSA9IGJhc2VBeGVzRGF0YS55QXhpcyxcbiAgICAgICAgICAgIGNoYXJ0VHlwZXMgPSB5QXhpc1BhcmFtcy5jaGFydFR5cGVzLFxuICAgICAgICAgICAgYXhlc0RhdGEgPSB7fSxcbiAgICAgICAgICAgIHlyQXhpc0RhdGE7XG4gICAgICAgIGlmICgheUF4aXNQYXJhbXMuaXNPbmVZQXhpcykge1xuICAgICAgICAgICAgeXJBeGlzRGF0YSA9IHRoaXMuX21ha2VZQXhpc0RhdGEobmUudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgICAgIGluZGV4OiAxLFxuICAgICAgICAgICAgICAgIGFkZFBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICBpc1Bvc2l0aW9uUmlnaHQ6IHRydWVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB5QXhpc1BhcmFtcykpO1xuICAgICAgICAgICAgaWYgKHlBeGlzRGF0YS50aWNrQ291bnQgPCB5ckF4aXNEYXRhLnRpY2tDb3VudCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luY3JlYXNlWUF4aXNUaWNrQ291bnQoeXJBeGlzRGF0YS50aWNrQ291bnQgLSB5QXhpc0RhdGEudGlja0NvdW50LCB5QXhpc0RhdGEpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh5QXhpc0RhdGEudGlja0NvdW50ID4geXJBeGlzRGF0YS50aWNrQ291bnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbmNyZWFzZVlBeGlzVGlja0NvdW50KHlBeGlzRGF0YS50aWNrQ291bnQgLSB5ckF4aXNEYXRhLnRpY2tDb3VudCwgeXJBeGlzRGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBheGVzRGF0YVtjaGFydFR5cGVzWzBdXSA9IGJhc2VBeGVzRGF0YTtcbiAgICAgICAgYXhlc0RhdGFbY2hhcnRUeXBlc1sxXV0gPSB7XG4gICAgICAgICAgICB5QXhpczogeXJBeGlzRGF0YSB8fCB5QXhpc0RhdGFcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gYXhlc0RhdGE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2Ugb3JkZXIgaW5mbyBhYm91bmQgY2hhcnQgdHlwZS5cbiAgICAgKiBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBjaGFydFR5cGVzIGNoYXJ0IHR5cGVzXG4gICAgICogQHJldHVybnMge29iamVjdH0gY2hhcnQgb3JkZXIgaW5mb1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VDaGFydFR5cGVPcmRlckluZm86IGZ1bmN0aW9uKGNoYXJ0VHlwZXMpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgICAgICBuZS51dGlsLmZvckVhY2hBcnJheShjaGFydFR5cGVzLCBmdW5jdGlvbihjaGFydFR5cGUsIGluZGV4KSB7XG4gICAgICAgICAgICByZXN1bHRbY2hhcnRUeXBlXSA9IGluZGV4O1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBvcHRpb25zIG1hcFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjaGFydFR5cGVzIGNoYXJ0IHR5cGVzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcmRlckluZm8gY2hhcnQgb3JkZXJcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBvcHRpb25zIG1hcFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VPcHRpb25zTWFwOiBmdW5jdGlvbihjaGFydFR5cGVzLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciBvcmRlckluZm8gPSB0aGlzLl9tYWtlQ2hhcnRUeXBlT3JkZXJJbmZvKGNoYXJ0VHlwZXMpLFxuICAgICAgICAgICAgcmVzdWx0ID0ge307XG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KGNoYXJ0VHlwZXMsIGZ1bmN0aW9uKGNoYXJ0VHlwZSkge1xuICAgICAgICAgICAgdmFyIGNoYXJ0T3B0aW9ucyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob3B0aW9ucykpLFxuICAgICAgICAgICAgICAgIGluZGV4ID0gb3JkZXJJbmZvW2NoYXJ0VHlwZV07XG5cbiAgICAgICAgICAgIGlmIChjaGFydE9wdGlvbnMueUF4aXMgJiYgY2hhcnRPcHRpb25zLnlBeGlzW2luZGV4XSkge1xuICAgICAgICAgICAgICAgIGNoYXJ0T3B0aW9ucy55QXhpcyA9IGNoYXJ0T3B0aW9ucy55QXhpc1tpbmRleF07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChjaGFydE9wdGlvbnMuc2VyaWVzICYmIGNoYXJ0T3B0aW9ucy5zZXJpZXNbY2hhcnRUeXBlXSkge1xuICAgICAgICAgICAgICAgIGNoYXJ0T3B0aW9ucy5zZXJpZXMgPSBjaGFydE9wdGlvbnMuc2VyaWVzW2NoYXJ0VHlwZV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChjaGFydE9wdGlvbnMudG9vbHRpcCAmJiBjaGFydE9wdGlvbnMudG9vbHRpcFtjaGFydFR5cGVdKSB7XG4gICAgICAgICAgICAgICAgY2hhcnRPcHRpb25zLnRvb2x0aXAgPSBjaGFydE9wdGlvbnMudG9vbHRpcFtjaGFydFR5cGVdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2hhcnRPcHRpb25zLmNoYXJ0VHlwZSA9IGNoYXJ0VHlwZTtcbiAgICAgICAgICAgIHJlc3VsdFtjaGFydFR5cGVdID0gY2hhcnRPcHRpb25zO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSB0aGVtZSBtYXBcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY2hhcnRUeXBlcyBjaGFydCB0eXBlc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBjaGFydCB0aGVtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBsZWdlbmRMYWJlbHMgbGVnZW5kIGxhYmVsc1xuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHRoZW1lIG1hcFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VUaGVtZU1hcDogZnVuY3Rpb24oY2hhcnRUeXBlcywgdGhlbWUsIGxlZ2VuZExhYmVscykge1xuICAgICAgICB2YXIgcmVzdWx0ID0ge30sXG4gICAgICAgICAgICBjb2xvckNvdW50ID0gMDtcbiAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkoY2hhcnRUeXBlcywgZnVuY3Rpb24oY2hhcnRUeXBlKSB7XG4gICAgICAgICAgICB2YXIgY2hhcnRUaGVtZSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhlbWUpKSxcbiAgICAgICAgICAgICAgICByZW1vdmVkQ29sb3JzO1xuXG4gICAgICAgICAgICBpZiAoY2hhcnRUaGVtZS55QXhpc1tjaGFydFR5cGVdKSB7XG4gICAgICAgICAgICAgICAgY2hhcnRUaGVtZS55QXhpcyA9IGNoYXJ0VGhlbWUueUF4aXNbY2hhcnRUeXBlXTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWNoYXJ0VGhlbWUueUF4aXMudGl0bGUpIHtcbiAgICAgICAgICAgICAgICBjaGFydFRoZW1lLnlBeGlzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShkZWZhdWx0VGhlbWUueUF4aXMpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGNoYXJ0VGhlbWUuc2VyaWVzW2NoYXJ0VHlwZV0pIHtcbiAgICAgICAgICAgICAgICBjaGFydFRoZW1lLnNlcmllcyA9IGNoYXJ0VGhlbWUuc2VyaWVzW2NoYXJ0VHlwZV07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFjaGFydFRoZW1lLnNlcmllcy5jb2xvcnMpIHtcbiAgICAgICAgICAgICAgICBjaGFydFRoZW1lLnNlcmllcyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZGVmYXVsdFRoZW1lLnNlcmllcykpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZW1vdmVkQ29sb3JzID0gY2hhcnRUaGVtZS5zZXJpZXMuY29sb3JzLnNwbGljZSgwLCBjb2xvckNvdW50KTtcbiAgICAgICAgICAgICAgICBjaGFydFRoZW1lLnNlcmllcy5jb2xvcnMgPSBjaGFydFRoZW1lLnNlcmllcy5jb2xvcnMuY29uY2F0KHJlbW92ZWRDb2xvcnMpO1xuICAgICAgICAgICAgICAgIGNvbG9yQ291bnQgKz0gbGVnZW5kTGFiZWxzW2NoYXJ0VHlwZV0ubGVuZ3RoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0W2NoYXJ0VHlwZV0gPSBjaGFydFRoZW1lO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW5jcmVhc2UgeSBheGlzIHRpY2sgY291bnQuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluY3JlYXNlVGlja0NvdW50IGluY3JlYXNlIHRpY2sgY291bnRcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdG9EYXRhIHRvIHRpY2sgaW5mb1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2luY3JlYXNlWUF4aXNUaWNrQ291bnQ6IGZ1bmN0aW9uKGluY3JlYXNlVGlja0NvdW50LCB0b0RhdGEpIHtcbiAgICAgICAgdG9EYXRhLnNjYWxlLm1heCArPSB0b0RhdGEuc3RlcCAqIGluY3JlYXNlVGlja0NvdW50O1xuICAgICAgICB0b0RhdGEubGFiZWxzID0gY2FsY3VsYXRvci5tYWtlTGFiZWxzRnJvbVNjYWxlKHRvRGF0YS5zY2FsZSwgdG9EYXRhLnN0ZXApO1xuICAgICAgICB0b0RhdGEudGlja0NvdW50ICs9IGluY3JlYXNlVGlja0NvdW50O1xuICAgICAgICB0b0RhdGEudmFsaWRUaWNrQ291bnQgKz0gaW5jcmVhc2VUaWNrQ291bnQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEluc3RhbGwgY2hhcnRzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy51c2VyRGF0YSB1c2VyIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuYmFzZURhdGEgY2hhcnQgYmFzZSBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIGNoYXJ0IHRoZW1lXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqICAgICAgQHBhcmFtIHt7eUF4aXM6IG9iamVjdCwgeEF4aXM6IG9iamVjdH19IHBhcmFtcy5iYXNlQXhlc0RhdGEgYmFzZSBheGVzIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuYXhlc0RhdGEgYXhlcyBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBwYXJhbXMuc2VyaWVzQ2hhcnRUeXBlcyBzZXJpZXMgY2hhcnQgdHlwZXNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IHBhcmFtcy5jaGFydFR5cGVzIGNoYXJ0IHR5cGVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaW5zdGFsbENoYXJ0czogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBjaGFydENsYXNzZXMgPSB7XG4gICAgICAgICAgICAgICAgY29sdW1uOiBDb2x1bW5DaGFydCxcbiAgICAgICAgICAgICAgICBsaW5lOiBMaW5lQ2hhcnRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBiYXNlRGF0YSA9IHBhcmFtcy5iYXNlRGF0YSxcbiAgICAgICAgICAgIGNvbnZlcnREYXRhID0gYmFzZURhdGEuY29udmVydERhdGEsXG4gICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXMgPSBjb252ZXJ0RGF0YS5mb3JtYXR0ZWRWYWx1ZXMsXG4gICAgICAgICAgICBiYXNlQXhlc0RhdGEgPSBwYXJhbXMuYmFzZUF4ZXNEYXRhLFxuICAgICAgICAgICAgc2VyaWVzQ2hhcnRUeXBlcyA9IHBhcmFtcy5zZXJpZXNDaGFydFR5cGVzLFxuICAgICAgICAgICAgb3B0aW9uc01hcCA9IHBhcmFtcy5vcHRpb25zTWFwLFxuICAgICAgICAgICAgdGhlbWVNYXAgPSBwYXJhbXMudGhlbWVNYXAsXG4gICAgICAgICAgICBwbG90RGF0YSA9IHtcbiAgICAgICAgICAgICAgICB2VGlja0NvdW50OiBiYXNlQXhlc0RhdGEueUF4aXMudmFsaWRUaWNrQ291bnQsXG4gICAgICAgICAgICAgICAgaFRpY2tDb3VudDogYmFzZUF4ZXNEYXRhLnhBeGlzLnZhbGlkVGlja0NvdW50XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgam9pbkxlZ2VuZExhYmVscyA9IGNvbnZlcnREYXRhLmpvaW5MZWdlbmRMYWJlbHM7XG5cbiAgICAgICAgdGhpcy5jaGFydHMgPSBuZS51dGlsLm1hcChzZXJpZXNDaGFydFR5cGVzLCBmdW5jdGlvbihjaGFydFR5cGUpIHtcbiAgICAgICAgICAgIHZhciBsZWdlbmRMYWJlbHMgPSBjb252ZXJ0RGF0YS5sZWdlbmRMYWJlbHNbY2hhcnRUeXBlXSxcbiAgICAgICAgICAgICAgICBheGVzID0gcGFyYW1zLmF4ZXNEYXRhW2NoYXJ0VHlwZV0sXG4gICAgICAgICAgICAgICAgc2VuZE9wdGlvbnMgPSBvcHRpb25zTWFwW2NoYXJ0VHlwZV0sXG4gICAgICAgICAgICAgICAgc2VuZFRoZW1lID0gdGhlbWVNYXBbY2hhcnRUeXBlXSxcbiAgICAgICAgICAgICAgICBzZW5kQm91bmRzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShiYXNlRGF0YS5ib3VuZHMpKSxcbiAgICAgICAgICAgICAgICBjaGFydDtcblxuICAgICAgICAgICAgaWYgKGF4ZXMgJiYgYXhlcy55QXhpcy5pc1Bvc2l0aW9uUmlnaHQpIHtcbiAgICAgICAgICAgICAgICBzZW5kQm91bmRzLnlBeGlzID0gc2VuZEJvdW5kcy55ckF4aXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjaGFydCA9IG5ldyBjaGFydENsYXNzZXNbY2hhcnRUeXBlXShwYXJhbXMudXNlckRhdGEsIHNlbmRUaGVtZSwgc2VuZE9wdGlvbnMsIHtcbiAgICAgICAgICAgICAgICBjb252ZXJ0RGF0YToge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZXM6IGNvbnZlcnREYXRhLnZhbHVlc1tjaGFydFR5cGVdLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbHM6IGNvbnZlcnREYXRhLmxhYmVscyxcbiAgICAgICAgICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zOiBjb252ZXJ0RGF0YS5mb3JtYXRGdW5jdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlczogZm9ybWF0dGVkVmFsdWVzW2NoYXJ0VHlwZV0sXG4gICAgICAgICAgICAgICAgICAgIGxlZ2VuZExhYmVsczogbGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgICAgICAgICBqb2luTGVnZW5kTGFiZWxzOiBqb2luTGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgICAgICAgICBwbG90RGF0YTogcGxvdERhdGFcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGJvdW5kczogc2VuZEJvdW5kcyxcbiAgICAgICAgICAgICAgICBheGVzOiBheGVzLFxuICAgICAgICAgICAgICAgIHByZWZpeDogY2hhcnRUeXBlICsgJy0nXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHBsb3REYXRhID0gbnVsbDtcbiAgICAgICAgICAgIGpvaW5MZWdlbmRMYWJlbHMgPSBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIGNoYXJ0O1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGNvbWJvIGNoYXJ0LlxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gY29tYm8gY2hhcnQgZWxlbWVudFxuICAgICAqL1xuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBlbCA9IENoYXJ0QmFzZS5wcm90b3R5cGUucmVuZGVyLmNhbGwodGhpcyk7XG4gICAgICAgIHZhciBwYXBlcjtcbiAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkodGhpcy5jaGFydHMsIGZ1bmN0aW9uKGNoYXJ0KSB7XG4gICAgICAgICAgICBjaGFydC5yZW5kZXIoZWwsIHBhcGVyKTtcbiAgICAgICAgICAgIGlmICghcGFwZXIpIHtcbiAgICAgICAgICAgICAgICBwYXBlciA9IGNoYXJ0LmdldFBhcGVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjaGFydC5hbmltYXRlQ2hhcnQoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb21ib0NoYXJ0O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IExpbmUgY2hhcnRcbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIENoYXJ0QmFzZSA9IHJlcXVpcmUoJy4vY2hhcnRCYXNlJyksXG4gICAgQXhpc1R5cGVCYXNlID0gcmVxdWlyZSgnLi9heGlzVHlwZUJhc2UnKSxcbiAgICBWZXJ0aWNhbFR5cGVCYXNlID0gcmVxdWlyZSgnLi92ZXJ0aWNhbFR5cGVCYXNlJyksXG4gICAgY2FsY3VsYXRvciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvY2FsY3VsYXRvcicpLFxuICAgIFNlcmllcyA9IHJlcXVpcmUoJy4uL3Nlcmllcy9saW5lQ2hhcnRTZXJpZXMnKTtcblxudmFyIExpbmVDaGFydCA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoQ2hhcnRCYXNlLCAvKiogQGxlbmRzIExpbmVDaGFydC5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIExpbmUgY2hhcnQuXG4gICAgICogQGNvbnN0cnVjdHMgTGluZUNoYXJ0XG4gICAgICogQGV4dGVuZHMgQ2hhcnRCYXNlXG4gICAgICogQG1peGVzIEF4aXNUeXBlQmFzZVxuICAgICAqIEBtaXhlcyBWZXJ0aWNhbFR5cGVCYXNlXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXk+fSB1c2VyRGF0YSBjaGFydCBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIGNoYXJ0IHRoZW1lXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBpbml0ZWREYXRhIGluaXRpYWxpemVkIGRhdGEgZnJvbSBjb21ibyBjaGFydFxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKHVzZXJEYXRhLCB0aGVtZSwgb3B0aW9ucywgaW5pdGVkRGF0YSkge1xuICAgICAgICB2YXIgYmFzZURhdGEgPSBpbml0ZWREYXRhIHx8IHRoaXMubWFrZUJhc2VEYXRhKHVzZXJEYXRhLCB0aGVtZSwgb3B0aW9ucywge1xuICAgICAgICAgICAgICAgIGlzVmVydGljYWw6IHRydWUsXG4gICAgICAgICAgICAgICAgaGFzQXhlczogdHJ1ZVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBjb252ZXJ0RGF0YSA9IGJhc2VEYXRhLmNvbnZlcnREYXRhLFxuICAgICAgICAgICAgYm91bmRzID0gYmFzZURhdGEuYm91bmRzLFxuICAgICAgICAgICAgYXhpc0RhdGE7XG5cbiAgICAgICAgdGhpcy5jbGFzc05hbWUgPSAnbmUtbGluZS1jaGFydCc7XG5cbiAgICAgICAgQ2hhcnRCYXNlLmNhbGwodGhpcywgYm91bmRzLCB0aGVtZSwgb3B0aW9ucywgaW5pdGVkRGF0YSk7XG5cbiAgICAgICAgYXhpc0RhdGEgPSB0aGlzLl9tYWtlQXhlc0RhdGEoY29udmVydERhdGEsIGJvdW5kcywgb3B0aW9ucywgaW5pdGVkRGF0YSk7XG4gICAgICAgIHRoaXMuX2FkZENvbXBvbmVudHMoY29udmVydERhdGEsIGF4aXNEYXRhLCBvcHRpb25zKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIGNvbXBvbmVudHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udmVydERhdGEgY29udmVydGVkIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYXhlc0RhdGEgYXhlcyBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2FkZENvbXBvbmVudHM6IGZ1bmN0aW9uKGNvbnZlcnREYXRhLCBheGVzRGF0YSwgb3B0aW9ucykge1xuICAgICAgICB0aGlzLmFkZEF4aXNDb21wb25lbnRzKHtcbiAgICAgICAgICAgIGNvbnZlcnREYXRhOiBjb252ZXJ0RGF0YSxcbiAgICAgICAgICAgIGF4ZXM6IGF4ZXNEYXRhLFxuICAgICAgICAgICAgcGxvdERhdGE6ICFuZS51dGlsLmlzVW5kZWZpbmVkKGNvbnZlcnREYXRhLnBsb3REYXRhKSA/IGNvbnZlcnREYXRhLnBsb3REYXRhIDoge1xuICAgICAgICAgICAgICAgIHZUaWNrQ291bnQ6IGF4ZXNEYXRhLnlBeGlzLnZhbGlkVGlja0NvdW50LFxuICAgICAgICAgICAgICAgIGhUaWNrQ291bnQ6IGF4ZXNEYXRhLnhBeGlzLnZhbGlkVGlja0NvdW50XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2hhcnRUeXBlOiBvcHRpb25zLmNoYXJ0VHlwZSxcbiAgICAgICAgICAgIFNlcmllczogU2VyaWVzLFxuICAgICAgICAgICAgc2VyaWVzRGF0YToge1xuICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzOiBjYWxjdWxhdG9yLmFycmF5UGl2b3QoY29udmVydERhdGEudmFsdWVzKSxcbiAgICAgICAgICAgICAgICAgICAgZm9ybWF0dGVkVmFsdWVzOiBjYWxjdWxhdG9yLmFycmF5UGl2b3QoY29udmVydERhdGEuZm9ybWF0dGVkVmFsdWVzKSxcbiAgICAgICAgICAgICAgICAgICAgc2NhbGU6IGF4ZXNEYXRhLnlBeGlzLnNjYWxlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxuQXhpc1R5cGVCYXNlLm1peGluKExpbmVDaGFydCk7XG5WZXJ0aWNhbFR5cGVCYXNlLm1peGluKExpbmVDaGFydCk7XG5cbm1vZHVsZS5leHBvcnRzID0gTGluZUNoYXJ0O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFBpZSBjaGFydC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIENoYXJ0QmFzZSA9IHJlcXVpcmUoJy4vY2hhcnRCYXNlLmpzJyksXG4gICAgTGVnZW5kID0gcmVxdWlyZSgnLi4vbGVnZW5kcy9sZWdlbmQuanMnKSxcbiAgICBUb29sdGlwID0gcmVxdWlyZSgnLi4vdG9vbHRpcHMvdG9vbHRpcC5qcycpLFxuICAgIFNlcmllcyA9IHJlcXVpcmUoJy4uL3Nlcmllcy9waWVDaGFydFNlcmllcy5qcycpO1xuXG52YXIgUGllQ2hhcnQgPSBuZS51dGlsLmRlZmluZUNsYXNzKENoYXJ0QmFzZSwgLyoqIEBsZW5kcyBQaWVDaGFydC5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIENvbHVtbiBjaGFydC5cbiAgICAgKiBAY29uc3RydWN0cyBQaWVDaGFydFxuICAgICAqIEBleHRlbmRzIENoYXJ0QmFzZVxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gdXNlckRhdGEgY2hhcnQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBjaGFydCB0aGVtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gaW5pdGVkRGF0YSBpbml0aWFsaXplZCBkYXRhIGZyb20gY29tYm8gY2hhcnRcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbih1c2VyRGF0YSwgdGhlbWUsIG9wdGlvbnMsIGluaXRlZERhdGEpIHtcbiAgICAgICAgdmFyIGJhc2VEYXRhID0gaW5pdGVkRGF0YSB8fCB0aGlzLm1ha2VCYXNlRGF0YSh1c2VyRGF0YSwgdGhlbWUsIG9wdGlvbnMpLFxuICAgICAgICAgICAgY29udmVydERhdGEgPSBiYXNlRGF0YS5jb252ZXJ0RGF0YSxcbiAgICAgICAgICAgIGJvdW5kcyA9IGJhc2VEYXRhLmJvdW5kcztcblxuICAgICAgICB0aGlzLmNsYXNzTmFtZSA9ICduZS1waWUtY2hhcnQnO1xuXG4gICAgICAgIG9wdGlvbnMudG9vbHRpcCA9IG9wdGlvbnMudG9vbHRpcCB8fCB7fTtcblxuICAgICAgICBpZiAoIW9wdGlvbnMudG9vbHRpcC5wb3NpdGlvbikge1xuICAgICAgICAgICAgb3B0aW9ucy50b29sdGlwLnBvc2l0aW9uID0gJ2NlbnRlciBtaWRkbGUnO1xuICAgICAgICB9XG5cbiAgICAgICAgQ2hhcnRCYXNlLmNhbGwodGhpcywgYm91bmRzLCB0aGVtZSwgb3B0aW9ucywgaW5pdGVkRGF0YSk7XG5cbiAgICAgICAgdGhpcy5fYWRkQ29tcG9uZW50cyhjb252ZXJ0RGF0YSwgdGhlbWUuY2hhcnQuYmFja2dyb3VuZCwgYm91bmRzLCBvcHRpb25zKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIGNvbXBvbmVudHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udmVydERhdGEgY29udmVydGVkIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY2hhcnRCYWNrZ3JvdW5kIGNoYXJ0IGJhY2tncm91bmRcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxvYmplY3Q+fSBib3VuZHMgYm91bmRzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2FkZENvbXBvbmVudHM6IGZ1bmN0aW9uKGNvbnZlcnREYXRhLCBjaGFydEJhY2tncm91bmQsIGJvdW5kcywgb3B0aW9ucykge1xuICAgICAgICBpZiAoY29udmVydERhdGEuam9pbkxlZ2VuZExhYmVscyAmJiAoIW9wdGlvbnMuc2VyaWVzIHx8ICFvcHRpb25zLnNlcmllcy5sZWdlbmRUeXBlKSkge1xuICAgICAgICAgICAgdGhpcy5hZGRDb21wb25lbnQoJ2xlZ2VuZCcsIExlZ2VuZCwge1xuICAgICAgICAgICAgICAgIGpvaW5MZWdlbmRMYWJlbHM6IGNvbnZlcnREYXRhLmpvaW5MZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICAgICAgbGVnZW5kTGFiZWxzOiBjb252ZXJ0RGF0YS5sZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICAgICAgY2hhcnRUeXBlOiBvcHRpb25zLmNoYXJ0VHlwZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmFkZENvbXBvbmVudCgndG9vbHRpcCcsIFRvb2x0aXAsIHtcbiAgICAgICAgICAgIHZhbHVlczogY29udmVydERhdGEuZm9ybWF0dGVkVmFsdWVzLFxuICAgICAgICAgICAgbGFiZWxzOiBjb252ZXJ0RGF0YS5sYWJlbHMsXG4gICAgICAgICAgICBsZWdlbmRMYWJlbHM6IGNvbnZlcnREYXRhLmxlZ2VuZExhYmVscyxcbiAgICAgICAgICAgIHByZWZpeDogdGhpcy50b29sdGlwUHJlZml4XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KCdzZXJpZXMnLCBTZXJpZXMsIHtcbiAgICAgICAgICAgIGxpYlR5cGU6IG9wdGlvbnMubGliVHlwZSxcbiAgICAgICAgICAgIGNoYXJ0VHlwZTogb3B0aW9ucy5jaGFydFR5cGUsXG4gICAgICAgICAgICB0b29sdGlwUHJlZml4OiB0aGlzLnRvb2x0aXBQcmVmaXgsXG4gICAgICAgICAgICBjaGFydEJhY2tncm91bmQ6IGNoYXJ0QmFja2dyb3VuZCxcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICB2YWx1ZXM6IGNvbnZlcnREYXRhLnZhbHVlcyxcbiAgICAgICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXM6IGNvbnZlcnREYXRhLmZvcm1hdHRlZFZhbHVlcyxcbiAgICAgICAgICAgICAgICBsZWdlbmRMYWJlbHM6IGNvbnZlcnREYXRhLmxlZ2VuZExhYmVscyxcbiAgICAgICAgICAgICAgICBjaGFydFdpZHRoOiBib3VuZHMuY2hhcnQuZGltZW5zaW9uLndpZHRoXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBpZUNoYXJ0O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFZlcnRpY2FsVHlwZUJhc2UgaXMgYmFzZSBjbGFzcyBvZiB2ZXJ0aWNhbCB0eXBlIGNoYXJ0KGNvbHVtbiwgbGluZSwgYXJlYSkuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBheGlzRGF0YU1ha2VyID0gcmVxdWlyZSgnLi4vaGVscGVycy9heGlzRGF0YU1ha2VyJyk7XG5cbi8qKlxuICogQGNsYXNzZGVzYyBWZXJ0aWNhbFR5cGVCYXNlIGlzIGJhc2UgY2xhc3Mgb2YgdmVydGljYWwgdHlwZSBjaGFydChjb2x1bW4sIGxpbmUsIGFyZWEpLlxuICogQGNsYXNzIFZlcnRpY2FsVHlwZUJhc2VcbiAqIEBtaXhpblxuICovXG52YXIgVmVydGljYWxUeXBlQmFzZSA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBWZXJ0aWNhbFR5cGVCYXNlLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBheGVzIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udmVydERhdGEgY29udmVydGVkIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYm91bmRzIGNoYXJ0IGJvdW5kc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gaW5pdGVkRGF0YSBpbml0aWFsaXplZCBkYXRhIGZyb20gY29tYm8gY2hhcnRcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBheGVzIGRhdGFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQXhlc0RhdGE6IGZ1bmN0aW9uKGNvbnZlcnREYXRhLCBib3VuZHMsIG9wdGlvbnMsIGluaXRlZERhdGEpIHtcbiAgICAgICAgdmFyIGF4ZXNEYXRhID0ge307XG4gICAgICAgIGlmIChpbml0ZWREYXRhKSB7XG4gICAgICAgICAgICBheGVzRGF0YSA9IGluaXRlZERhdGEuYXhlcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGF4ZXNEYXRhID0ge1xuICAgICAgICAgICAgICAgIHlBeGlzOiBheGlzRGF0YU1ha2VyLm1ha2VWYWx1ZUF4aXNEYXRhKHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzOiBjb252ZXJ0RGF0YS52YWx1ZXMsXG4gICAgICAgICAgICAgICAgICAgIHNlcmllc0RpbWVuc2lvbjogYm91bmRzLnNlcmllcy5kaW1lbnNpb24sXG4gICAgICAgICAgICAgICAgICAgIHN0YWNrZWQ6IG9wdGlvbnMuc2VyaWVzICYmIG9wdGlvbnMuc2VyaWVzLnN0YWNrZWQgfHwgJycsXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0VHlwZTogb3B0aW9ucy5jaGFydFR5cGUsXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdEZ1bmN0aW9uczogY29udmVydERhdGEuZm9ybWF0RnVuY3Rpb25zLFxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zLnlBeGlzLFxuICAgICAgICAgICAgICAgICAgICBpc1ZlcnRpY2FsOiB0cnVlXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgeEF4aXM6IGF4aXNEYXRhTWFrZXIubWFrZUxhYmVsQXhpc0RhdGEoe1xuICAgICAgICAgICAgICAgICAgICBsYWJlbHM6IGNvbnZlcnREYXRhLmxhYmVsc1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBheGVzRGF0YTtcbiAgICB9XG59KTtcblxuVmVydGljYWxUeXBlQmFzZS5taXhpbiA9IGZ1bmN0aW9uKGZ1bmMpIHtcbiAgICBuZS51dGlsLmV4dGVuZChmdW5jLnByb3RvdHlwZSwgVmVydGljYWxUeXBlQmFzZS5wcm90b3R5cGUpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBWZXJ0aWNhbFR5cGVCYXNlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIG5lLnV0aWzsl5AgcmFuZ2XqsIAg7LaU6rCA65CY6riwIOyghOq5jOyngCDsnoTsi5zroZwg7IKs7JqpXG4gKiBAcGFyYW0ge251bWJlcn0gc3RhcnQgc3RhcnRcbiAqIEBwYXJhbSB7bnVtYmVyfSBzdG9wIHN0b3BcbiAqIEBwYXJhbSB7bnVtYmVyfSBzdGVwIHN0ZXBcbiAqIEByZXR1cm5zIHthcnJheS48bnVtYmVyPn0gcmVzdWx0IGFycmF5XG4gKi9cbnZhciByYW5nZSA9IGZ1bmN0aW9uKHN0YXJ0LCBzdG9wLCBzdGVwKSB7XG4gICAgdmFyIGFyciA9IFtdLFxuICAgICAgICBmbGFnO1xuXG4gICAgaWYgKG5lLnV0aWwuaXNVbmRlZmluZWQoc3RvcCkpIHtcbiAgICAgICAgc3RvcCA9IHN0YXJ0IHx8IDA7XG4gICAgICAgIHN0YXJ0ID0gMDtcbiAgICB9XG5cbiAgICBzdGVwID0gc3RlcCB8fCAxO1xuICAgIGZsYWcgPSBzdGVwIDwgMCA/IC0xIDogMTtcbiAgICBzdG9wICo9IGZsYWc7XG5cbiAgICB3aGlsZSAoc3RhcnQgKiBmbGFnIDwgc3RvcCkge1xuICAgICAgICBhcnIucHVzaChzdGFydCk7XG4gICAgICAgIHN0YXJ0ICs9IHN0ZXA7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFycjtcbn07XG5cbi8qKlxuICogKiBuZS51dGls7JeQIHBsdWNr7J20IOy2lOqwgOuQmOq4sCDsoITquYzsp4Ag7J6E7Iuc66GcIOyCrOyaqVxuICogQHBhcmFtIHthcnJheX0gYXJyIGFycmF5XG4gKiBAcGFyYW0ge3N0cmluZ30gcHJvcGVydHkgcHJvcGVydHlcbiAqIEByZXR1cm5zIHthcnJheX0gcmVzdWx0IGFycmF5XG4gKi9cbnZhciBwbHVjayA9IGZ1bmN0aW9uKGFyciwgcHJvcGVydHkpIHtcbiAgICB2YXIgcmVzdWx0ID0gbmUudXRpbC5tYXAoYXJyLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIHJldHVybiBpdGVtW3Byb3BlcnR5XTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiAqIG5lLnV0aWzsl5Agemlw7J20IOy2lOqwgOuQmOq4sCDsoITquYzsp4Ag7J6E7Iuc66GcIOyCrOyaqVxuICogQHBhcmFtcyB7Li4uYXJyYXl9IGFycmF5XG4gKiBAcmV0dXJucyB7YXJyYXl9IHJlc3VsdCBhcnJheVxuICovXG52YXIgemlwID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFycjIgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpLFxuICAgICAgICByZXN1bHQgPSBbXTtcblxuICAgIG5lLnV0aWwuZm9yRWFjaChhcnIyLCBmdW5jdGlvbihhcnIpIHtcbiAgICAgICAgbmUudXRpbC5mb3JFYWNoKGFyciwgZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgICBpZiAoIXJlc3VsdFtpbmRleF0pIHtcbiAgICAgICAgICAgICAgICByZXN1bHRbaW5kZXhdID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXN1bHRbaW5kZXhdLnB1c2godmFsdWUpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIFBpY2sgbWluaW11bSB2YWx1ZSBmcm9tIHZhbHVlIGFycmF5LlxuICogQHBhcmFtIHthcnJheX0gYXJyIHZhbHVlIGFycmF5XG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjb25kaXRpb24gY29uZGl0aW9uIGZ1bmN0aW9uXG4gKiBAcGFyYW0ge29iamVjdH0gY29udGV4dCB0YXJnZXQgY29udGV4dFxuICogQHJldHVybnMgeyp9IG1pbmltdW0gdmFsdWVcbiAqL1xudmFyIG1pbiA9IGZ1bmN0aW9uKGFyciwgY29uZGl0aW9uLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdCwgbWluVmFsdWUsIHJlc3Q7XG4gICAgaWYgKCFjb25kaXRpb24pIHtcbiAgICAgICAgY29uZGl0aW9uID0gZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgIH07XG4gICAgfVxuICAgIHJlc3VsdCA9IGFyclswXTtcbiAgICBtaW5WYWx1ZSA9IGNvbmRpdGlvbi5jYWxsKGNvbnRleHQsIHJlc3VsdCk7XG4gICAgcmVzdCA9IGFyci5zbGljZSgxKTtcbiAgICBuZS51dGlsLmZvckVhY2hBcnJheShyZXN0LCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIHZhciBjb21wYXJlVmFsdWUgPSBjb25kaXRpb24uY2FsbChjb250ZXh0LCBpdGVtKTtcbiAgICAgICAgaWYgKGNvbXBhcmVWYWx1ZSA8IG1pblZhbHVlKSB7XG4gICAgICAgICAgICBtaW5WYWx1ZSA9IGNvbXBhcmVWYWx1ZTtcbiAgICAgICAgICAgIHJlc3VsdCA9IGl0ZW07XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBQaWNrIG1heGltdW0gdmFsdWUgZnJvbSB2YWx1ZSBhcnJheS5cbiAqIEBwYXJhbSB7YXJyYXl9IGFyciB2YWx1ZSBhcnJheVxuICogQHBhcmFtIHtmdW5jdGlvbn0gY29uZGl0aW9uIGNvbmRpdGlvbiBmdW5jdGlvblxuICogQHBhcmFtIHtvYmplY3R9IGNvbnRleHQgdGFyZ2V0IGNvbnRleHRcbiAqIEByZXR1cm5zIHsqfSBtYXhpbXVtIHZhbHVlXG4gKi9cbnZhciBtYXggPSBmdW5jdGlvbihhcnIsIGNvbmRpdGlvbiwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHQsIG1heFZhbHVlLCByZXN0O1xuICAgIGlmICghY29uZGl0aW9uKSB7XG4gICAgICAgIGNvbmRpdGlvbiA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICB9O1xuICAgIH1cbiAgICByZXN1bHQgPSBhcnJbMF07XG4gICAgbWF4VmFsdWUgPSBjb25kaXRpb24uY2FsbChjb250ZXh0LCByZXN1bHQpO1xuICAgIHJlc3QgPSBhcnIuc2xpY2UoMSk7XG4gICAgbmUudXRpbC5mb3JFYWNoQXJyYXkocmVzdCwgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICB2YXIgY29tcGFyZVZhbHVlID0gY29uZGl0aW9uLmNhbGwoY29udGV4dCwgaXRlbSk7XG4gICAgICAgIGlmIChjb21wYXJlVmFsdWUgPiBtYXhWYWx1ZSkge1xuICAgICAgICAgICAgbWF4VmFsdWUgPSBjb21wYXJlVmFsdWU7XG4gICAgICAgICAgICByZXN1bHQgPSBpdGVtO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogV2hldGhlciBvbmUgb2YgdGhlbSBpcyB0cnVlIG9yIG5vdC5cbiAqIEBwYXJhbSB7YXJyYXl9IGFyciB0YXJnZXQgYXJyYXlcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNvbmRpdGlvbiBjb25kaXRpb24gZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtib29sZWFufSByZXN1bHQgYm9vbGVhblxuICovXG52YXIgYW55ID0gZnVuY3Rpb24oYXJyLCBjb25kaXRpb24pIHtcbiAgICB2YXIgcmVzdWx0ID0gZmFsc2U7XG4gICAgbmUudXRpbC5mb3JFYWNoQXJyYXkoYXJyLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIGlmIChjb25kaXRpb24oaXRlbSkpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBBbGwgb2YgdGhlbSBpcyB0cnVlIG9yIG5vdC5cbiAqIEBwYXJhbSB7YXJyYXl9IGFyciB0YXJnZXQgYXJyYXlcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNvbmRpdGlvbiBjb25kaXRpb24gZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtib29sZWFufSByZXN1bHQgYm9vbGVhblxuICovXG52YXIgYWxsID0gZnVuY3Rpb24oYXJyLCBjb25kaXRpb24pIHtcbiAgICB2YXIgcmVzdWx0ID0gdHJ1ZTtcbiAgICBuZS51dGlsLmZvckVhY2hBcnJheShhcnIsIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgaWYgKCFjb25kaXRpb24oaXRlbSkpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogR2V0IGFmdGVyIHBvaW50IGxlbmd0aC5cbiAqIEBwYXJhbSB7c3RyaW5nIHwgbnVtYmVyfSB2YWx1ZSB0YXJnZXQgdmFsdWVcbiAqIEByZXR1cm5zIHtudW1iZXJ9IHJlc3VsdCBsZW5ndGhcbiAqL1xudmFyIGxlbmd0aEFmdGVyUG9pbnQgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHZhciB2YWx1ZUFyciA9ICh2YWx1ZSArICcnKS5zcGxpdCgnLicpO1xuICAgIHJldHVybiB2YWx1ZUFyci5sZW5ndGggPT09IDIgPyB2YWx1ZUFyclsxXS5sZW5ndGggOiAwO1xufTtcblxuLyoqXG4gKiBGaW5kIG11bHRpcGxlIG51bS5cbiAqIEBwYXJhbSB7Li4uYXJyYXl9IHRhcmdldCB2YWx1ZXNcbiAqIEByZXR1cm5zIHtudW1iZXJ9IG11bHRpcGxlIG51bVxuICovXG52YXIgZmluZE11bHRpcGxlTnVtID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cyksXG4gICAgICAgIHVuZGVyUG9pbnRMZW5zID0gbmUudXRpbC5tYXAoYXJncywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiBuZS51dGlsLmxlbmd0aEFmdGVyUG9pbnQodmFsdWUpO1xuICAgICAgICB9KSxcbiAgICAgICAgdW5kZXJQb2ludExlbiA9IG5lLnV0aWwubWF4KHVuZGVyUG9pbnRMZW5zKSxcbiAgICAgICAgbXVsdGlwbGVOdW0gPSBNYXRoLnBvdygxMCwgdW5kZXJQb2ludExlbik7XG4gICAgcmV0dXJuIG11bHRpcGxlTnVtO1xufTtcblxuLyoqXG4gKiBNb2R1bG8gb3BlcmF0aW9uIGZvciBmbG9hdGluZyBwb2ludCBvcGVyYXRpb24uXG4gKiBAcGFyYW0ge251bWJlcn0gdGFyZ2V0IHRhcmdldCB2YWx1ZXNcbiAqIEBwYXJhbSB7bnVtYmVyfSBtb2ROdW0gbW9kIG51bVxuICogQHJldHVybnMge251bWJlcn0gcmVzdWx0IG1vZFxuICovXG52YXIgbW9kID0gZnVuY3Rpb24odGFyZ2V0LCBtb2ROdW0pIHtcbiAgICB2YXIgbXVsdGlwbGVOdW0gPSBuZS51dGlsLmZpbmRNdWx0aXBsZU51bShtb2ROdW0pO1xuICAgIHJldHVybiAoKHRhcmdldCAqIG11bHRpcGxlTnVtKSAlIChtb2ROdW0gKiBtdWx0aXBsZU51bSkpIC8gbXVsdGlwbGVOdW07XG59O1xuXG4vKipcbiAqIEFkZGl0aW9uIGZvciBmbG9hdGluZyBwb2ludCBvcGVyYXRpb24uXG4gKiBAcGFyYW0ge251bWJlcn0gYSB0YXJnZXQgYVxuICogQHBhcmFtIHtudW1iZXJ9IGIgdGFyZ2V0IGJcbiAqIEByZXR1cm5zIHtudW1iZXJ9IGFkZGl0aW9uIHJlc3VsdFxuICovXG52YXIgYWRkaXRpb24gPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgdmFyIG11bHRpcGxlTnVtID0gZmluZE11bHRpcGxlTnVtKGEsIGIpO1xuICAgIHJldHVybiAoKGEgKiBtdWx0aXBsZU51bSkgKyAoYiAqIG11bHRpcGxlTnVtKSkgLyBtdWx0aXBsZU51bTtcbn07XG5cbi8qKlxuICogU3VidHJhY3Rpb24gZm9yIGZsb2F0aW5nIHBvaW50IG9wZXJhdGlvbi5cbiAqIEBwYXJhbSB7bnVtYmVyfSBhIHRhcmdldCBhXG4gKiBAcGFyYW0ge251bWJlcn0gYiB0YXJnZXQgYlxuICogQHJldHVybnMge251bWJlcn0gc3VidHJhY3Rpb24gcmVzdWx0XG4gKi9cbnZhciBzdWJ0cmFjdGlvbiA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICB2YXIgbXVsdGlwbGVOdW0gPSBmaW5kTXVsdGlwbGVOdW0oYSwgYik7XG4gICAgcmV0dXJuICgoYSAqIG11bHRpcGxlTnVtKSAtIChiICogbXVsdGlwbGVOdW0pKSAvIG11bHRpcGxlTnVtO1xufTtcblxuLyoqXG4gKiBNdWx0aXBsaWNhdGlvbiBmb3IgZmxvYXRpbmcgcG9pbnQgb3BlcmF0aW9uLlxuICogQHBhcmFtIHtudW1iZXJ9IGEgdGFyZ2V0IGFcbiAqIEBwYXJhbSB7bnVtYmVyfSBiIHRhcmdldCBiXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBtdWx0aXBsaWNhdGlvbiByZXN1bHRcbiAqL1xudmFyIG11bHRpcGxpY2F0aW9uID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHZhciBtdWx0aXBsZU51bSA9IGZpbmRNdWx0aXBsZU51bShhLCBiKTtcbiAgICByZXR1cm4gKChhICogbXVsdGlwbGVOdW0pICogKGIgKiBtdWx0aXBsZU51bSkpIC8gKG11bHRpcGxlTnVtICogbXVsdGlwbGVOdW0pO1xufTtcblxuLyoqXG4gKiBEaXZpc2lvbiBmb3IgZmxvYXRpbmcgcG9pbnQgb3BlcmF0aW9uLlxuICogQHBhcmFtIHtudW1iZXJ9IGEgdGFyZ2V0IGFcbiAqIEBwYXJhbSB7bnVtYmVyfSBiIHRhcmdldCBiXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBkaXZpc2lvbiByZXN1bHRcbiAqL1xudmFyIGRpdmlzaW9uID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHZhciBtdWx0aXBsZU51bSA9IGZpbmRNdWx0aXBsZU51bShhLCBiKTtcbiAgICByZXR1cm4gKGEgKiBtdWx0aXBsZU51bSkgLyAoYiAqIG11bHRpcGxlTnVtKTtcbn07XG5cbi8qKlxuICogU3VtLlxuICogQHBhcmFtIHthcnJheS48bnVtYmVyPn0gdmFsdWVzIHRhcmdldCB2YWx1ZXNcbiAqIEByZXR1cm5zIHtudW1iZXJ9IHJlc3VsdCB2YWx1ZVxuICovXG52YXIgc3VtID0gZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgdmFyIGNvcHlBcnIgPSB2YWx1ZXMuc2xpY2UoKTtcbiAgICBjb3B5QXJyLnVuc2hpZnQoMCk7XG4gICAgcmV0dXJuIG5lLnV0aWwucmVkdWNlKGNvcHlBcnIsIGZ1bmN0aW9uKGJhc2UsIGFkZCkge1xuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChiYXNlKSArIHBhcnNlRmxvYXQoYWRkKTtcbiAgICB9KTtcbn07XG5cbm5lLnV0aWwucmFuZ2UgPSByYW5nZTtcbm5lLnV0aWwucGx1Y2sgPSBwbHVjaztcbm5lLnV0aWwuemlwID0gemlwO1xubmUudXRpbC5taW4gPSBtaW47XG5uZS51dGlsLm1heCA9IG1heDtcbm5lLnV0aWwuYW55ID0gYW55O1xubmUudXRpbC5hbGwgPSBhbGw7XG5uZS51dGlsLmxlbmd0aEFmdGVyUG9pbnQgPSBsZW5ndGhBZnRlclBvaW50O1xubmUudXRpbC5tb2QgPSBtb2Q7XG5uZS51dGlsLmZpbmRNdWx0aXBsZU51bSA9IGZpbmRNdWx0aXBsZU51bTtcbm5lLnV0aWwuYWRkaXRpb24gPSBhZGRpdGlvbjtcbm5lLnV0aWwuc3VidHJhY3Rpb24gPSBzdWJ0cmFjdGlvbjtcbm5lLnV0aWwubXVsdGlwbGljYXRpb24gPSBtdWx0aXBsaWNhdGlvbjtcbm5lLnV0aWwuZGl2aXNpb24gPSBkaXZpc2lvbjtcbm5lLnV0aWwuc3VtID0gc3VtO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IGNoYXJ0IGNvbnN0XG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBDSEFSVF9ERUZBVUxUX1dJRFRIOiA1MDAsXG4gICAgQ0hBUlRfREVGQVVMVF9IRUlHSFQ6IDQwMCxcbiAgICBISURERU5fV0lEVEg6IDEsXG4gICAgVEVYVF9QQURESU5HOiAyLFxuICAgIFNFUklFU19MQUJFTF9QQURESU5HOiA1LFxuICAgIERFRkFVTFRfVElUTEVfRk9OVF9TSVpFOiAxNCxcbiAgICBERUZBVUxUX0FYSVNfVElUTEVfRk9OVF9TSVpFOiAxMCxcbiAgICBERUZBVUxUX0xBQkVMX0ZPTlRfU0laRTogMTIsXG4gICAgREVGQVVMVF9QTFVHSU46ICdyYXBoYWVsJyxcbiAgICBERUZBVUxUX1RJQ0tfQ09MT1I6ICdibGFjaycsXG4gICAgREVGQVVMVF9USEVNRV9OQU1FOiAnZGVmYXVsdCcsXG4gICAgU1RBQ0tFRF9OT1JNQUxfVFlQRTogJ25vcm1hbCcsXG4gICAgU1RBQ0tFRF9QRVJDRU5UX1RZUEU6ICdwZXJjZW50JyxcbiAgICBBTkdMRV8zNjA6IDM2MCxcbiAgICBSQUQ6IE1hdGguUEkgLyAxODAsXG4gICAgREVGQVVMVF9TRVJJRVNfTEFCRUxfRk9OVF9TSVpFOiAxMSxcbiAgICBTRVJJRVNfTEVHRU5EX1RZUEVfT1VURVI6ICdvdXRlcicsXG4gICAgU0VSSUVTX09VVEVSX0xBQkVMX1BBRERJTkc6IDIwLFxuICAgIFBJRV9HUkFQSF9ERUZBVUxUX1JBVEU6IDAuOCxcbiAgICBQSUVfR1JBUEhfU01BTExfUkFURTogMC42NSxcbiAgICBDSEFSVF9UWVBFX0JBUjogJ2JhcicsXG4gICAgQ0hBUlRfVFlQRV9DT0xVTU46ICdjb2x1bW4nLFxuICAgIENIQVJUX1RZUEVfTElORTogJ2xpbmUnLFxuICAgIENIQVJUX1RZUEVfQVJFQTogJ2FyZWEnLFxuICAgIENIQVJUX1RZUEVfQ09NQk86ICdjb21ibycsXG4gICAgQ0hBUlRfVFlQRV9QSUU6ICdwaWUnLFxuICAgIFlBWElTX1BST1BTOiBbJ3RpY2tDb2xvcicsICd0aXRsZScsICdsYWJlbCddLCAvLyB5YXhpcyB0aGVtZeydmCDsho3shLEgLSBjaGFydCB0eXBlIGZpbHRlcmluZ+2VoCDrlYwg7IKs7Jqp65CoXG4gICAgU0VSSUVTX1BST1BTOiBbJ2xhYmVsJywgJ2NvbG9ycycsICdib3JkZXJDb2xvcicsICdzaW5nbGVDb2xvcnMnXSAvLyBzZXJpZXMgdGhlbWXsnZgg7IaN7ISxIC0gY2hhcnQgdHlwZSBmaWx0ZXJpbmftlaAg65WMIOyCrOyaqeuQqFxufTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyAgQ2hhcnQgZmFjdG9yeSBwbGF5IHJvbGUgcmVnaXN0ZXIgY2hhcnQuXG4gKiAgICAgICAgICAgICAgICBBbHNvLCB5b3UgY2FuIGdldCBjaGFydCBmcm9tIHRoaXMgZmFjdG9yeS5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGNoYXJ0cyA9IHt9LFxuICAgIGZhY3RvcnkgPSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgY2hhcnQgaW5zdGFuY2UuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjaGFydFR5cGUgY2hhcnQgdHlwZVxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gZGF0YSBjaGFydCBkYXRhXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgICAgICogQHJldHVybnMge29iamVjdH0gY2hhcnQgaW5zdGFuY2U7XG4gICAgICAgICAqL1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKGNoYXJ0VHlwZSwgZGF0YSwgdGhlbWUsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHZhciBDaGFydCA9IGNoYXJ0c1tjaGFydFR5cGVdLFxuICAgICAgICAgICAgICAgIGNoYXJ0O1xuXG4gICAgICAgICAgICBpZiAoIUNoYXJ0KSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgZXhpc3QgJyArIGNoYXJ0VHlwZSArICcgY2hhcnQuJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNoYXJ0ID0gbmV3IENoYXJ0KGRhdGEsIHRoZW1lLCBvcHRpb25zKTtcblxuICAgICAgICAgICAgcmV0dXJuIGNoYXJ0O1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZWdpc3RlciBjaGFydC5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNoYXJ0VHlwZSBjaGFyIHR5cGVcbiAgICAgICAgICogQHBhcmFtIHtjbGFzc30gQ2hhcnRDbGFzcyBjaGFydCBjbGFzc1xuICAgICAgICAgKi9cbiAgICAgICAgcmVnaXN0ZXI6IGZ1bmN0aW9uKGNoYXJ0VHlwZSwgQ2hhcnRDbGFzcykge1xuICAgICAgICAgICAgY2hhcnRzW2NoYXJ0VHlwZV0gPSBDaGFydENsYXNzO1xuICAgICAgICB9XG4gICAgfTtcblxubW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3ICBQbHVnaW4gZmFjdG9yeSBwbGF5IHJvbGUgcmVnaXN0ZXIgcmVuZGVyaW5nIHBsdWdpbi5cbiAqICAgICAgICAgICAgICAgIEFsc28sIHlvdSBjYW4gZ2V0IHBsdWdpbiBmcm9tIHRoaXMgZmFjdG9yeS5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHBsdWdpbnMgPSB7fSxcbiAgICBmYWN0b3J5ID0ge1xuICAgICAgICAvKipcbiAgICAgICAgICogR2V0IGdyYXBoIHJlbmRlcmVyLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gbGliVHlwZSB0eXBlIG9mIGdyYXBoIGxpYnJhcnlcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNoYXJ0VHlwZSBjaGFydCB0eXBlXG4gICAgICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHJlbmRlcmVyIGluc3RhbmNlXG4gICAgICAgICAqL1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKGxpYlR5cGUsIGNoYXJ0VHlwZSkge1xuICAgICAgICAgICAgdmFyIHBsdWdpbiA9IHBsdWdpbnNbbGliVHlwZV0sXG4gICAgICAgICAgICAgICAgUmVuZGVyZXIsIHJlbmRlcmVyO1xuXG4gICAgICAgICAgICBpZiAoIXBsdWdpbikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGV4aXN0ICcgKyBsaWJUeXBlICsgJyBwbHVnaW4uJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIFJlbmRlcmVyID0gcGx1Z2luW2NoYXJ0VHlwZV07XG4gICAgICAgICAgICBpZiAoIVJlbmRlcmVyKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgZXhpc3QgJyArIGNoYXJ0VHlwZSArICcgY2hhcnQgcmVuZGVyZXIuJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlbmRlcmVyID0gbmV3IFJlbmRlcmVyKCk7XG5cbiAgICAgICAgICAgIHJldHVybiByZW5kZXJlcjtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFBsdWdpbiByZWdpc3Rlci5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGxpYlR5cGUgdHlwZSBvZiBncmFwaCBsaWJyYXJ5XG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwbHVnaW4gcGx1Z2luIHRvIGNvbnRyb2wgbGlicmFyeVxuICAgICAgICAgKi9cbiAgICAgICAgcmVnaXN0ZXI6IGZ1bmN0aW9uKGxpYlR5cGUsIHBsdWdpbikge1xuICAgICAgICAgICAgcGx1Z2luc1tsaWJUeXBlXSA9IHBsdWdpbjtcbiAgICAgICAgfVxuICAgIH07XG5cbm1vZHVsZS5leHBvcnRzID0gZmFjdG9yeTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyAgVGhlbWUgZmFjdG9yeSBwbGF5IHJvbGUgcmVnaXN0ZXIgdGhlbWUuXG4gKiAgICAgICAgICAgICAgICBBbHNvLCB5b3UgY2FuIGdldCB0aGVtZSBmcm9tIHRoaXMgZmFjdG9yeS5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuLi9jb25zdC5qcycpLFxuICAgIGRlZmF1bHRUaGVtZSA9IHJlcXVpcmUoJy4uL3RoZW1lcy9kZWZhdWx0VGhlbWUuanMnKTtcblxudmFyIHRoZW1lcyA9IHt9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAvKipcbiAgICAgKiBHZXQgdGhlbWUuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRoZW1lTmFtZSB0aGVtZSBuYW1lXG4gICAgICogQHJldHVybnMge29iamVjdH0gdGhlbWUgb2JqZWN0XG4gICAgICovXG4gICAgZ2V0OiBmdW5jdGlvbih0aGVtZU5hbWUpIHtcbiAgICAgICAgdmFyIHRoZW1lID0gdGhlbWVzW3RoZW1lTmFtZV07XG5cbiAgICAgICAgaWYgKCF0aGVtZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgZXhpc3QgJyArIHRoZW1lTmFtZSArICcgdGhlbWUuJyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhlbWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRoZW1lIHJlZ2lzdGVyLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0aGVtZU5hbWUgdGhlbWUgbmFtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSB0aGVtZVxuICAgICAqL1xuICAgIHJlZ2lzdGVyOiBmdW5jdGlvbih0aGVtZU5hbWUsIHRoZW1lKSB7XG4gICAgICAgIHZhciB0YXJnZXRJdGVtcztcbiAgICAgICAgdGhlbWUgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoZW1lKSk7XG5cbiAgICAgICAgaWYgKHRoZW1lTmFtZSAhPT0gY2hhcnRDb25zdC5ERUZBVUxUX1RIRU1FX05BTUUpIHtcbiAgICAgICAgICAgIHRoZW1lID0gdGhpcy5faW5pdFRoZW1lKHRoZW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRhcmdldEl0ZW1zID0gdGhpcy5fZ2V0SW5oZXJpdFRhcmdldFRoZW1lSXRlbXModGhlbWUpO1xuXG4gICAgICAgIHRoaXMuX2luaGVyaXRUaGVtZUZvbnQodGhlbWUsIHRhcmdldEl0ZW1zKTtcbiAgICAgICAgdGhpcy5fY29weUNvbG9ySW5mbyh0aGVtZSk7XG4gICAgICAgIHRoZW1lc1t0aGVtZU5hbWVdID0gdGhlbWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEluaXQgdGhlbWUuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIHRoZW1lXG4gICAgICogQHJldHVybnMge29iamVjdH0gdGhlbWVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBpZ25vcmVcbiAgICAgKi9cbiAgICBfaW5pdFRoZW1lOiBmdW5jdGlvbih0aGVtZSkge1xuICAgICAgICB2YXIgY2xvbmVUaGVtZSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZGVmYXVsdFRoZW1lKSksXG4gICAgICAgICAgICBuZXdUaGVtZTtcblxuICAgICAgICB0aGlzLl9jb25jYXREZWZhdWx0Q29sb3JzKHRoZW1lLCBjbG9uZVRoZW1lLnNlcmllcy5jb2xvcnMpXG4gICAgICAgIG5ld1RoZW1lID0gdGhpcy5fb3ZlcndyaXRlVGhlbWUodGhlbWUsIGNsb25lVGhlbWUpO1xuXG4gICAgICAgIG5ld1RoZW1lID0gdGhpcy5fY29weVByb3BlcnR5KHtcbiAgICAgICAgICAgIHByb3BOYW1lOiAneUF4aXMnLFxuICAgICAgICAgICAgZnJvbVRoZW1lOiB0aGVtZSxcbiAgICAgICAgICAgIHRvVGhlbWU6IG5ld1RoZW1lLFxuICAgICAgICAgICAgcmVqZWN0aW9uUHJvcHM6IGNoYXJ0Q29uc3QuWUFYSVNfUFJPUFNcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbmV3VGhlbWUgPSB0aGlzLl9jb3B5UHJvcGVydHkoe1xuICAgICAgICAgICAgcHJvcE5hbWU6ICdzZXJpZXMnLFxuICAgICAgICAgICAgZnJvbVRoZW1lOiB0aGVtZSxcbiAgICAgICAgICAgIHRvVGhlbWU6IG5ld1RoZW1lLFxuICAgICAgICAgICAgcmVqZWN0aW9uUHJvcHM6IGNoYXJ0Q29uc3QuU0VSSUVTX1BST1BTXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBuZXdUaGVtZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmlsdGVyIGNoYXJ0IHR5cGVzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0YXJnZXQgdGFyZ2V0IGNoYXJ0c1xuICAgICAqIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IHJlamVjdGlvblByb3BzIHJlamVjdCBwcm9wZXJ0eVxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IGZpbHRlcmVkIGNoYXJ0cy5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9maWx0ZXJDaGFydFR5cGVzOiBmdW5jdGlvbih0YXJnZXQsIHJlamVjdGlvblByb3BzKSB7XG4gICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cblxuICAgICAgICByZXN1bHQgPSBuZS51dGlsLmZpbHRlcih0YXJnZXQsIGZ1bmN0aW9uKGl0ZW0sIG5hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBuZS51dGlsLmluQXJyYXkobmFtZSwgcmVqZWN0aW9uUHJvcHMpID09PSAtMTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvbmNhdCBjb2xvcnMuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIHRoZW1lXG4gICAgICogQHBhcmFtIHthcnJheS48c3RyaW5nPn0gc2VyaWVzQ29sb3JzIHNlcmllcyBjb2xvcnNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jb25jYXRDb2xvcnM6IGZ1bmN0aW9uKHRoZW1lLCBzZXJpZXNDb2xvcnMpIHtcbiAgICAgICAgaWYgKHRoZW1lLmNvbG9ycykge1xuICAgICAgICAgICAgdGhlbWUuY29sb3JzID0gdGhlbWUuY29sb3JzLmNvbmNhdChzZXJpZXNDb2xvcnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoZW1lLnNpbmdsZUNvbG9ycykge1xuICAgICAgICAgICAgdGhlbWUuc2luZ2xlQ29sb3JzID0gdGhlbWUuc2luZ2xlQ29sb3JzLmNvbmNhdChzZXJpZXNDb2xvcnMpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvbmNhdCBkZWZhdWx0IGNvbG9ycy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgdGhlbWVcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBzZXJpZXNDb2xvcnMgc2VyaWVzIGNvbG9yc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NvbmNhdERlZmF1bHRDb2xvcnM6IGZ1bmN0aW9uKHRoZW1lLCBzZXJpZXNDb2xvcnMpIHtcbiAgICAgICAgdmFyIGNoYXJ0VHlwZXM7XG5cbiAgICAgICAgaWYgKCF0aGVtZS5zZXJpZXMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNoYXJ0VHlwZXMgPSB0aGlzLl9maWx0ZXJDaGFydFR5cGVzKHRoZW1lLnNlcmllcywgY2hhcnRDb25zdC5TRVJJRVNfUFJPUFMpO1xuXG4gICAgICAgIGlmICghbmUudXRpbC5rZXlzKGNoYXJ0VHlwZXMpLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5fY29uY2F0Q29sb3JzKHRoZW1lLnNlcmllcywgc2VyaWVzQ29sb3JzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5lLnV0aWwuZm9yRWFjaChjaGFydFR5cGVzLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY29uY2F0Q29sb3JzKGl0ZW0sIHNlcmllc0NvbG9ycyk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBPdmVyd3JpdGUgdGhlbWVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZnJvbSBmcm9tIHRoZW1lIHByb3BlcnR5XG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRvIHRvIHRoZW1lIHByb3BlcnR5XG4gICAgICogQHJldHVybnMge29iamVjdH0gcmVzdWx0IHByb3BlcnR5XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb3ZlcndyaXRlVGhlbWU6IGZ1bmN0aW9uKGZyb20sIHRvKSB7XG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaCh0bywgZnVuY3Rpb24oaXRlbSwga2V5KSB7XG4gICAgICAgICAgICB2YXIgZnJvbUl0ZW0gPSBmcm9tW2tleV07XG4gICAgICAgICAgICBpZiAoIWZyb21JdGVtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobmUudXRpbC5pc0FycmF5KGZyb21JdGVtKSkge1xuICAgICAgICAgICAgICAgIHRvW2tleV0gPSBmcm9tSXRlbS5zbGljZSgpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChuZS51dGlsLmlzT2JqZWN0KGZyb21JdGVtKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX292ZXJ3cml0ZVRoZW1lKGZyb21JdGVtLCBpdGVtKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdG9ba2V5XSA9IGZyb21JdGVtO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICByZXR1cm4gdG87XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvcHkgcHJvcGVydHkuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLnByb3BOYW1lIHByb3BlcnR5IG5hbWVcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuZnJvbVRoZW1lIGZyb20gcHJvcGVydHlcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudG9UaGVtZSB0cCBwcm9wZXJ0eVxuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48c3RyaW5nPn0gcGFyYW1zLnJlamVjdGlvblByb3BzIHJlamVjdCBwcm9wZXJ0eSBuYW1lXG4gICAgICogQHJldHVybnMge29iamVjdH0gY29waWVkIHByb3BlcnR5XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY29weVByb3BlcnR5OiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGNoYXJ0VHlwZXM7XG5cbiAgICAgICAgaWYgKCFwYXJhbXMudG9UaGVtZVtwYXJhbXMucHJvcE5hbWVdKSB7XG4gICAgICAgICAgICByZXR1cm4gcGFyYW1zLnRvVGhlbWU7XG4gICAgICAgIH1cblxuICAgICAgICBjaGFydFR5cGVzID0gdGhpcy5fZmlsdGVyQ2hhcnRUeXBlcyhwYXJhbXMuZnJvbVRoZW1lW3BhcmFtcy5wcm9wTmFtZV0sIHBhcmFtcy5yZWplY3Rpb25Qcm9wcyk7XG4gICAgICAgIGlmIChuZS51dGlsLmtleXMoY2hhcnRUeXBlcykubGVuZ3RoKSB7XG4gICAgICAgICAgICBuZS51dGlsLmZvckVhY2goY2hhcnRUeXBlcywgZnVuY3Rpb24oaXRlbSwga2V5KSB7XG4gICAgICAgICAgICAgICAgdmFyIGNsb25lVGhlbWUgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGRlZmF1bHRUaGVtZVtwYXJhbXMucHJvcE5hbWVdKSk7XG4gICAgICAgICAgICAgICAgcGFyYW1zLmZyb21UaGVtZVtwYXJhbXMucHJvcE5hbWVdW2tleV0gPSB0aGlzLl9vdmVyd3JpdGVUaGVtZShpdGVtLCBjbG9uZVRoZW1lKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgICAgICBwYXJhbXMudG9UaGVtZVtwYXJhbXMucHJvcE5hbWVdID0gcGFyYW1zLmZyb21UaGVtZVtwYXJhbXMucHJvcE5hbWVdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhcmFtcy50b1RoZW1lO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDb3B5IGNvbG9yIGluZm8gdG8gbGVnZW5kXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHNlcmllc1RoZW1lIHNlcmllcyB0aGVtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBsZWdlbmRUaGVtZSBsZWdlbmQgdGhlbWVcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBjb2xvcnMgY29sb3JzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY29weUNvbG9ySW5mb1RvTGVnZW5kOiBmdW5jdGlvbihzZXJpZXNUaGVtZSwgbGVnZW5kVGhlbWUsIGNvbG9ycykge1xuICAgICAgICBsZWdlbmRUaGVtZS5jb2xvcnMgPSBjb2xvcnMgfHwgc2VyaWVzVGhlbWUuY29sb3JzO1xuICAgICAgICBpZiAoc2VyaWVzVGhlbWUuc2luZ2xlQ29sb3JzKSB7XG4gICAgICAgICAgICBsZWdlbmRUaGVtZS5zaW5nbGVDb2xvcnMgPSBzZXJpZXNUaGVtZS5zaW5nbGVDb2xvcnM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNlcmllc1RoZW1lLmJvcmRlckNvbG9yKSB7XG4gICAgICAgICAgICBsZWdlbmRUaGVtZS5ib3JkZXJDb2xvciA9IHNlcmllc1RoZW1lLmJvcmRlckNvbG9yO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB0YXJnZXQgaXRlbXMgYWJvdXQgZm9udCBpbmhlcml0LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSB0aGVtZVxuICAgICAqIEByZXR1cm5zIHthcnJheS48b2JqZWN0Pn0gdGFyZ2V0IGl0ZW1zXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0SW5oZXJpdFRhcmdldFRoZW1lSXRlbXM6IGZ1bmN0aW9uKHRoZW1lKSB7XG4gICAgICAgIHZhciBpdGVtcyA9IFtcbiAgICAgICAgICAgICAgICB0aGVtZS50aXRsZSxcbiAgICAgICAgICAgICAgICB0aGVtZS54QXhpcy50aXRsZSxcbiAgICAgICAgICAgICAgICB0aGVtZS54QXhpcy5sYWJlbCxcbiAgICAgICAgICAgICAgICB0aGVtZS5sZWdlbmQubGFiZWxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB5QXhpc0NoYXJ0VHlwZXMgPSB0aGlzLl9maWx0ZXJDaGFydFR5cGVzKHRoZW1lLnlBeGlzLCBjaGFydENvbnN0LllBWElTX1BST1BTKSxcbiAgICAgICAgICAgIHNlcmllc0NoYXJ0VHlwZXMgPSB0aGlzLl9maWx0ZXJDaGFydFR5cGVzKHRoZW1lLnNlcmllcywgY2hhcnRDb25zdC5TRVJJRVNfUFJPUFMpO1xuXG4gICAgICAgIGlmICghbmUudXRpbC5rZXlzKHlBeGlzQ2hhcnRUeXBlcykubGVuZ3RoKSB7XG4gICAgICAgICAgICBpdGVtcy5wdXNoKHRoZW1lLnlBeGlzLnRpdGxlKTtcbiAgICAgICAgICAgIGl0ZW1zLnB1c2godGhlbWUueUF4aXMubGFiZWwpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmUudXRpbC5mb3JFYWNoKHlBeGlzQ2hhcnRUeXBlcywgZnVuY3Rpb24oY2hhdFR5cGUpIHtcbiAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKGNoYXRUeXBlLnRpdGxlKTtcbiAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKGNoYXRUeXBlLmxhYmVsKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFuZS51dGlsLmtleXMoc2VyaWVzQ2hhcnRUeXBlcykubGVuZ3RoKSB7XG4gICAgICAgICAgICBpdGVtcy5wdXNoKHRoZW1lLnNlcmllcy5sYWJlbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZS51dGlsLmZvckVhY2goeUF4aXNDaGFydFR5cGVzLCBmdW5jdGlvbihjaGF0VHlwZSkge1xuICAgICAgICAgICAgICAgIGl0ZW1zLnB1c2goY2hhdFR5cGUubGFiZWwpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGl0ZW1zO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbmhlcml0IHRoZW1lIGZvbnQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIHRoZW1lXG4gICAgICogQHBhcmFtIHthcnJheS48b2JqZWN0Pn0gdGFyZ2V0SXRlbXMgdGFyZ2V0IHRoZW1lIGl0ZW1zXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaW5oZXJpdFRoZW1lRm9udDogZnVuY3Rpb24odGhlbWUsIHRhcmdldEl0ZW1zKSB7XG4gICAgICAgIHZhciBiYXNlRm9udCA9IHRoZW1lLmNoYXJ0LmZvbnRGYW1pbHk7XG5cbiAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkodGFyZ2V0SXRlbXMsIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgIGlmICghaXRlbS5mb250RmFtaWx5KSB7XG4gICAgICAgICAgICAgICAgaXRlbS5mb250RmFtaWx5ID0gYmFzZUZvbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDb3B5IGNvbG9yIGluZm8uXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIHRoZW1lXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAaWdub3JlXG4gICAgICovXG4gICAgX2NvcHlDb2xvckluZm86IGZ1bmN0aW9uKHRoZW1lKSB7XG4gICAgICAgIHZhciBzZXJpZXNDaGFydFR5cGVzID0gdGhpcy5fZmlsdGVyQ2hhcnRUeXBlcyh0aGVtZS5zZXJpZXMsIGNoYXJ0Q29uc3QuU0VSSUVTX1BST1BTKTtcbiAgICAgICAgaWYgKCFuZS51dGlsLmtleXMoc2VyaWVzQ2hhcnRUeXBlcykubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLl9jb3B5Q29sb3JJbmZvVG9MZWdlbmQodGhlbWUuc2VyaWVzLCB0aGVtZS5sZWdlbmQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmUudXRpbC5mb3JFYWNoKHNlcmllc0NoYXJ0VHlwZXMsIGZ1bmN0aW9uKGl0ZW0sIGNoYXJ0VHlwZSkge1xuICAgICAgICAgICAgICAgIHRoZW1lLmxlZ2VuZFtjaGFydFR5cGVdID0ge307XG4gICAgICAgICAgICAgICAgdGhpcy5fY29weUNvbG9ySW5mb1RvTGVnZW5kKGl0ZW0sIHRoZW1lLmxlZ2VuZFtjaGFydFR5cGVdLCBpdGVtLmNvbG9ycyB8fCB0aGVtZS5sZWdlbmQuY29sb3JzKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhlbWUubGVnZW5kLmNvbG9ycztcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9XG4gICAgfVxufTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBBeGlzIERhdGEgTWFrZXJcbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuLi9jb25zdC5qcycpLFxuICAgIGNhbGN1bGF0b3IgPSByZXF1aXJlKCcuL2NhbGN1bGF0b3IuanMnKTtcblxudmFyIE1JTl9QSVhFTF9TVEVQX1NJWkUgPSA0MCxcbiAgICBNQVhfUElYRUxfU1RFUF9TSVpFID0gNjAsXG4gICAgUEVSQ0VOVF9TVEFDS0VEX1RJQ0tfSU5GTyA9IHtcbiAgICAgICAgc2NhbGU6IHtcbiAgICAgICAgICAgIG1pbjogMCxcbiAgICAgICAgICAgIG1heDogMTAwXG4gICAgICAgIH0sXG4gICAgICAgIHN0ZXA6IDI1LFxuICAgICAgICB0aWNrQ291bnQ6IDUsXG4gICAgICAgIGxhYmVsczogWzAsIDI1LCA1MCwgNzUsIDEwMF1cbiAgICB9O1xuXG52YXIgYWJzID0gTWF0aC5hYnMsXG4gICAgY29uY2F0ID0gQXJyYXkucHJvdG90eXBlLmNvbmNhdDtcblxuLyoqXG4gKiBBeGlzIGRhdGEgbWFrZXIuXG4gKiBAbW9kdWxlIGF4aXNEYXRhTWFrZXJcbiAqL1xudmFyIGF4aXNEYXRhTWFrZXIgPSB7XG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBkYXRhIGFib3V0IGxhYmVsIGF4aXMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBsYWJlbHMgY2hhcnQgbGFiZWxzXG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IGlzVmVydGljYWwgd2hldGhlciB2ZXJ0aWNhbCBvciBub3RcbiAgICAgKiBAcmV0dXJucyB7e1xuICAgICAqICAgICAgbGFiZWxzOiBhcnJheS48c3RyaW5nPixcbiAgICAgKiAgICAgIHRpY2tDb3VudDogbnVtYmVyLFxuICAgICAqICAgICAgdmFsaWRUaWNrQ291bnQ6IG51bWJlcixcbiAgICAgKiAgICAgIGlzTGFiZWxBeGlzOiBib29sZWFuLFxuICAgICAqICAgICAgaXNWZXJ0aWNhbDogYm9vbGVhblxuICAgICAqIH19IGF4aXMgZGF0YVxuICAgICAqL1xuICAgIG1ha2VMYWJlbEF4aXNEYXRhOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxhYmVsczogcGFyYW1zLmxhYmVscyxcbiAgICAgICAgICAgIHRpY2tDb3VudDogcGFyYW1zLmxhYmVscy5sZW5ndGggKyAxLFxuICAgICAgICAgICAgdmFsaWRUaWNrQ291bnQ6IDAsXG4gICAgICAgICAgICBpc0xhYmVsQXhpczogdHJ1ZSxcbiAgICAgICAgICAgIGlzVmVydGljYWw6ICEhcGFyYW1zLmlzVmVydGljYWxcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBkYXRhIGFib3V0IHZhbHVlIGF4aXMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheS48bnVtYmVyPj59IHBhcmFtcy52YWx1ZXMgY2hhcnQgdmFsdWVzXG4gICAgICogICAgICBAcGFyYW0ge3t3aWR0aDpudW1iZXIsIGhlaWdodDpudW1iZXJ9fSBwYXJhbXMuc2VyaWVzRGltZW5zaW9uIHNlcmllcyBkaW1lbnNpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPGZ1bmN0aW9uPn0gcGFyYW1zLmZvcm1hdEZ1bmN0aW9ucyBmb3JtYXQgZnVuY3Rpb25zXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLnN0YWNrZWQgc3RhY2tlZCBvcHRpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMub3B0aW9ucyBheGlzIG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7e1xuICAgICAqICAgICAgbGFiZWxzOiBhcnJheS48c3RyaW5nPixcbiAgICAgKiAgICAgIHRpY2tDb3VudDogbnVtYmVyLFxuICAgICAqICAgICAgdmFsaWRUaWNrQ291bnQ6IG51bWJlcixcbiAgICAgKiAgICAgIGlzTGFiZWxBeGlzOiBib29sZWFuLFxuICAgICAqICAgICAgc2NhbGU6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9LFxuICAgICAqICAgICAgaXNWZXJ0aWNhbDogYm9vbGVhblxuICAgICAqIH19IGF4aXMgZGF0YVxuICAgICAqL1xuICAgIG1ha2VWYWx1ZUF4aXNEYXRhOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSBwYXJhbXMub3B0aW9ucyB8fCB7fSxcbiAgICAgICAgICAgIGlzVmVydGljYWwgPSAhIXBhcmFtcy5pc1ZlcnRpY2FsLFxuICAgICAgICAgICAgaXNQb3NpdGlvblJpZ2h0ID0gISFwYXJhbXMuaXNQb3NpdGlvblJpZ2h0LFxuICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zID0gcGFyYW1zLmZvcm1hdEZ1bmN0aW9ucyxcbiAgICAgICAgICAgIHRpY2tJbmZvO1xuICAgICAgICBpZiAocGFyYW1zLnN0YWNrZWQgPT09ICdwZXJjZW50Jykge1xuICAgICAgICAgICAgdGlja0luZm8gPSBQRVJDRU5UX1NUQUNLRURfVElDS19JTkZPO1xuICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zID0gW107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aWNrSW5mbyA9IHRoaXMuX2dldFRpY2tJbmZvKHtcbiAgICAgICAgICAgICAgICB2YWx1ZXM6IHRoaXMuX21ha2VCYXNlVmFsdWVzKHBhcmFtcy52YWx1ZXMsIHBhcmFtcy5zdGFja2VkKSxcbiAgICAgICAgICAgICAgICBzZXJpZXNEaW1lbnNpb246IHBhcmFtcy5zZXJpZXNEaW1lbnNpb24sXG4gICAgICAgICAgICAgICAgaXNWZXJ0aWNhbDogaXNWZXJ0aWNhbCxcbiAgICAgICAgICAgICAgICBpc1Bvc2l0aW9uUmlnaHQ6IGlzUG9zaXRpb25SaWdodCxcbiAgICAgICAgICAgICAgICBjaGFydFR5cGU6IHBhcmFtcy5jaGFydFR5cGVcbiAgICAgICAgICAgIH0sIG9wdGlvbnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxhYmVsczogdGhpcy5fZm9ybWF0TGFiZWxzKHRpY2tJbmZvLmxhYmVscywgZm9ybWF0RnVuY3Rpb25zKSxcbiAgICAgICAgICAgIHRpY2tDb3VudDogdGlja0luZm8udGlja0NvdW50LFxuICAgICAgICAgICAgdmFsaWRUaWNrQ291bnQ6IHRpY2tJbmZvLnRpY2tDb3VudCxcbiAgICAgICAgICAgIHNjYWxlOiB0aWNrSW5mby5zY2FsZSxcbiAgICAgICAgICAgIHN0ZXA6IHRpY2tJbmZvLnN0ZXAsXG4gICAgICAgICAgICBpc1ZlcnRpY2FsOiBpc1ZlcnRpY2FsLFxuICAgICAgICAgICAgaXNQb3NpdGlvblJpZ2h0OiBpc1Bvc2l0aW9uUmlnaHRcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBiYXNlIHZhbHVlcy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxudW1iZXI+fSBncm91cFZhbHVlcyBncm91cCB2YWx1ZXNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhY2tlZCBzdGFja2VkIG9wdGlvbi5cbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPG51bWJlcj59IGJhc2UgdmFsdWVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUJhc2VWYWx1ZXM6IGZ1bmN0aW9uKGdyb3VwVmFsdWVzLCBzdGFja2VkKSB7XG4gICAgICAgIHZhciBiYXNlVmFsdWVzID0gY29uY2F0LmFwcGx5KFtdLCBncm91cFZhbHVlcyk7IC8vIGZsYXR0ZW4gYXJyYXlcbiAgICAgICAgaWYgKHN0YWNrZWQgPT09IGNoYXJ0Q29uc3QuU1RBQ0tFRF9OT1JNQUxfVFlQRSkge1xuICAgICAgICAgICAgYmFzZVZhbHVlcyA9IGJhc2VWYWx1ZXMuY29uY2F0KG5lLnV0aWwubWFwKGdyb3VwVmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGx1c1ZhbHVlcyA9IG5lLnV0aWwuZmlsdGVyKHZhbHVlcywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlID4gMDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmUudXRpbC5zdW0ocGx1c1ZhbHVlcyk7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJhc2VWYWx1ZXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBiYXNlIHNpemUgZm9yIGdldCBjYW5kaWRhdGUgdGljayBjb3VudHMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBkaW1lbnNpb24gY2hhdCBkaW1lbnNpb25cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzVmVydGljYWwgd2hldGhlciB2ZXJ0aWNhbCBvciBub3RcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBiYXNlIHNpemVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRCYXNlU2l6ZTogZnVuY3Rpb24oZGltZW5zaW9uLCBpc1ZlcnRpY2FsKSB7XG4gICAgICAgIHZhciBiYXNlU2l6ZTtcbiAgICAgICAgaWYgKGlzVmVydGljYWwpIHtcbiAgICAgICAgICAgIGJhc2VTaXplID0gZGltZW5zaW9uLmhlaWdodDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJhc2VTaXplID0gZGltZW5zaW9uLndpZHRoO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBiYXNlU2l6ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNhbmRpZGF0ZSB0aWNrIGNvdW50cy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGNoYXJ0RGltZW5zaW9uIGNoYXQgZGltZW5zaW9uXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpc1ZlcnRpY2FsIHdoZXRoZXIgdmVydGljYWwgb3Igbm90XG4gICAgICogQHJldHVybnMge2FycmF5LjxudW1iZXI+fSB0aWNrIGNvdW50c1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldENhbmRpZGF0ZVRpY2tDb3VudHM6IGZ1bmN0aW9uKGNoYXJ0RGltZW5zaW9uLCBpc1ZlcnRpY2FsKSB7XG4gICAgICAgIHZhciBiYXNlU2l6ZSA9IHRoaXMuX2dldEJhc2VTaXplKGNoYXJ0RGltZW5zaW9uLCBpc1ZlcnRpY2FsKSxcbiAgICAgICAgICAgIHN0YXJ0ID0gcGFyc2VJbnQoYmFzZVNpemUgLyBNQVhfUElYRUxfU1RFUF9TSVpFLCAxMCksXG4gICAgICAgICAgICBlbmQgPSBwYXJzZUludChiYXNlU2l6ZSAvIE1JTl9QSVhFTF9TVEVQX1NJWkUsIDEwKSArIDEsXG4gICAgICAgICAgICB0aWNrQ291bnRzID0gbmUudXRpbC5yYW5nZShzdGFydCwgZW5kKTtcbiAgICAgICAgcmV0dXJuIHRpY2tDb3VudHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjb21wYXJpbmcgdmFsdWUuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1pbiBtaW5pbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtYXggbWF4aW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiBAcGFyYW0ge3tzY2FsZToge21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn0sIHN0ZXA6IG51bWJlcn19IHRpY2tJbmZvIHRpY2sgaW5mb1xuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IGNvbXBhcmluZyB2YWx1ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldENvbXBhcmluZ1ZhbHVlOiBmdW5jdGlvbihtaW4sIG1heCwgdGlja0luZm8pIHtcbiAgICAgICAgdmFyIGRpZmZNYXggPSBhYnModGlja0luZm8uc2NhbGUubWF4IC0gbWF4KSxcbiAgICAgICAgICAgIGRpZmZNaW4gPSBhYnMobWluIC0gdGlja0luZm8uc2NhbGUubWluKSxcbiAgICAgICAgICAgIHdlaWdodCA9IE1hdGgucG93KDEwLCBuZS51dGlsLmxlbmd0aEFmdGVyUG9pbnQodGlja0luZm8uc3RlcCkpO1xuICAgICAgICByZXR1cm4gKGRpZmZNYXggKyBkaWZmTWluKSAqIHdlaWdodDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2VsZWN0IHRpY2sgaW5mby5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWluIG1pbmltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1heCBtYXhpbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7YXJyYXkuPG9iamVjdD59IGNhbmRpZGF0ZXMgdGljayBpbmZvIGNhbmRpZGF0ZXNcbiAgICAgKiBAcmV0dXJucyB7e3NjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfSwgdGlja0NvdW50OiBudW1iZXIsIHN0ZXA6IG51bWJlciwgbGFiZWxzOiBhcnJheS48bnVtYmVyPn19IHNlbGVjdGVkIHRpY2sgaW5mb1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NlbGVjdFRpY2tJbmZvOiBmdW5jdGlvbihtaW4sIG1heCwgY2FuZGlkYXRlcykge1xuICAgICAgICB2YXIgZ2V0Q29tcGFyaW5nVmFsdWUgPSBuZS51dGlsLmJpbmQodGhpcy5fZ2V0Q29tcGFyaW5nVmFsdWUsIHRoaXMsIG1pbiwgbWF4KSxcbiAgICAgICAgICAgIHRpY2tJbmZvID0gbmUudXRpbC5taW4oY2FuZGlkYXRlcywgZ2V0Q29tcGFyaW5nVmFsdWUpO1xuICAgICAgICByZXR1cm4gdGlja0luZm87XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB0aWNrIGNvdW50IGFuZCBzY2FsZS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMudmFsdWVzIGJhc2UgdmFsdWVzXG4gICAgICogICAgICBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IHBhcmFtcy5zZXJpZXNEaW1lbnNpb24gY2hhdCBkaW1lbnNpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gcGFyYW1zLmlzVmVydGljYWwgd2hldGhlciB2ZXJ0aWNhbCBvciBub3RcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMuY2hhcnRUeXBlIGNoYXQgdHlwZVxuICAgICAqIEBwYXJhbSB7e21pbjogbnVtYmVyLCBtYXg6bnVtYmVyfX0gb3B0aW9ucyBheGlzIG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7e3RpY2tDb3VudDogbnVtYmVyLCBzY2FsZTogb2JqZWN0fX0gdGljayBpbmZvXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0VGlja0luZm86IGZ1bmN0aW9uKHBhcmFtcywgb3B0aW9ucykge1xuICAgICAgICB2YXIgbWluID0gbmUudXRpbC5taW4ocGFyYW1zLnZhbHVlcyksXG4gICAgICAgICAgICBtYXggPSBuZS51dGlsLm1heChwYXJhbXMudmFsdWVzKSxcbiAgICAgICAgICAgIGludFR5cGVJbmZvLCB0aWNrQ291bnRzLCBjYW5kaWRhdGVzLCB0aWNrSW5mbztcbiAgICAgICAgLy8gMDEuIG1pbiwgbWF4LCBvcHRpb25zIOygleuztOulvCDsoJXsiJjtmJXsnLzroZwg67OA6rK9XG4gICAgICAgIGludFR5cGVJbmZvID0gdGhpcy5fbWFrZUludGVnZXJUeXBlSW5mbyhtaW4sIG1heCwgb3B0aW9ucyk7XG5cbiAgICAgICAgLy8gMDIuIHRpY2sgY291bnQg7ZuE67O06rWwIOyWu+q4sFxuICAgICAgICB0aWNrQ291bnRzID0gcGFyYW1zLnRpY2tDb3VudCA/IFtwYXJhbXMudGlja0NvdW50XSA6IHRoaXMuX2dldENhbmRpZGF0ZVRpY2tDb3VudHMocGFyYW1zLnNlcmllc0RpbWVuc2lvbiwgcGFyYW1zLmlzVmVydGljYWwpO1xuXG4gICAgICAgIC8vIDAzLiB0aWNrIGluZm8g7ZuE67O06rWwIOqzhOyCsFxuICAgICAgICBjYW5kaWRhdGVzID0gdGhpcy5fZ2V0Q2FuZGlkYXRlVGlja0luZm9zKHtcbiAgICAgICAgICAgIG1pbjogaW50VHlwZUluZm8ubWluLFxuICAgICAgICAgICAgbWF4OiBpbnRUeXBlSW5mby5tYXgsXG4gICAgICAgICAgICB0aWNrQ291bnRzOiB0aWNrQ291bnRzLFxuICAgICAgICAgICAgY2hhcnRUeXBlOiBwYXJhbXMuY2hhcnRUeXBlXG4gICAgICAgIH0sIGludFR5cGVJbmZvLm9wdGlvbnMpO1xuXG4gICAgICAgIC8vIDA0LiB0aWNrIGluZm8g7ZuE67O06rWwIOykkSDtlZjrgpgg7ISg7YOdXG4gICAgICAgIHRpY2tJbmZvID0gdGhpcy5fc2VsZWN0VGlja0luZm8oaW50VHlwZUluZm8ubWluLCBpbnRUeXBlSW5mby5tYXgsIGNhbmRpZGF0ZXMpO1xuXG4gICAgICAgIC8vIDA1LiDsoJXsiJjtmJXsnLzroZwg67OA6rK97ZaI642YIHRpY2sgaW5mb+ulvCDsm5Drnpgg7ZiV7YOc66GcIOuzgOqyvVxuICAgICAgICB0aWNrSW5mbyA9IHRoaXMuX3JldmVydE9yaWdpbmFsVHlwZVRpY2tJbmZvKHRpY2tJbmZvLCBpbnRUeXBlSW5mby5kaXZpZGVOdW0pO1xuICAgICAgICByZXR1cm4gdGlja0luZm87XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgaW50ZWdlciB0eXBlIGluZm9cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWluIG1pbmltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1heCBtYXhpbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7e21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19IG9wdGlvbnMgYXhpcyBvcHRpb25zXG4gICAgICogQHJldHVybnMge3ttaW46IG51bWJlciwgbWF4OiBudW1iZXIsIG9wdGlvbnM6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9LCBkaXZpZGVOdW06IG51bWJlcn19IGludGVnZXIgdHlwZSBpbmZvXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUludGVnZXJUeXBlSW5mbzogZnVuY3Rpb24obWluLCBtYXgsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIG11bHRpcGxlTnVtLCBjaGFuZ2VkT3B0aW9ucztcblxuICAgICAgICBpZiAoYWJzKG1pbikgPj0gMSB8fCBhYnMobWF4KSA+PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG1pbjogbWluLFxuICAgICAgICAgICAgICAgIG1heDogbWF4LFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IG9wdGlvbnMsXG4gICAgICAgICAgICAgICAgZGl2aWRlTnVtOiAxXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgbXVsdGlwbGVOdW0gPSBuZS51dGlsLmZpbmRNdWx0aXBsZU51bShtaW4sIG1heCk7XG4gICAgICAgIGNoYW5nZWRPcHRpb25zID0ge307XG5cbiAgICAgICAgaWYgKG9wdGlvbnMubWluKSB7XG4gICAgICAgICAgICBjaGFuZ2VkT3B0aW9ucy5taW4gPSBvcHRpb25zLm1pbiAqIG11bHRpcGxlTnVtO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9wdGlvbnMubWF4KSB7XG4gICAgICAgICAgICBjaGFuZ2VkT3B0aW9ucy5tYXggPSBvcHRpb25zLm1heCAqIG11bHRpcGxlTnVtO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG1pbjogbWluICogbXVsdGlwbGVOdW0sXG4gICAgICAgICAgICBtYXg6IG1heCAqIG11bHRpcGxlTnVtLFxuICAgICAgICAgICAgb3B0aW9uczogY2hhbmdlZE9wdGlvbnMsXG4gICAgICAgICAgICBkaXZpZGVOdW06IG11bHRpcGxlTnVtXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldmVydCB0aWNrIGluZm8gdG8gb3JpZ2luYWwgdHlwZS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge3tzdGVwOiBudW1iZXIsIHNjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfSwgbGFiZWxzOiBhcnJheS48bnVtYmVyPn19IHRpY2tJbmZvIHRpY2sgaW5mb1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBkaXZpZGVOdW0gZGl2aWRlIG51bVxuICAgICAqIEByZXR1cm5zIHt7c3RlcDogbnVtYmVyLCBzY2FsZToge21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn0sIGxhYmVsczogYXJyYXkuPG51bWJlcj59fSBkaXZpZGVkIHRpY2sgaW5mb1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JldmVydE9yaWdpbmFsVHlwZVRpY2tJbmZvOiBmdW5jdGlvbih0aWNrSW5mbywgZGl2aWRlTnVtKSB7XG4gICAgICAgIGlmIChkaXZpZGVOdW0gPT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiB0aWNrSW5mbztcbiAgICAgICAgfVxuXG4gICAgICAgIHRpY2tJbmZvLnN0ZXAgPSBuZS51dGlsLmRpdmlzaW9uKHRpY2tJbmZvLnN0ZXAsIGRpdmlkZU51bSk7XG4gICAgICAgIHRpY2tJbmZvLnNjYWxlLm1pbiA9IG5lLnV0aWwuZGl2aXNpb24odGlja0luZm8uc2NhbGUubWluLCBkaXZpZGVOdW0pO1xuICAgICAgICB0aWNrSW5mby5zY2FsZS5tYXggPSBuZS51dGlsLmRpdmlzaW9uKHRpY2tJbmZvLnNjYWxlLm1heCwgZGl2aWRlTnVtKTtcbiAgICAgICAgdGlja0luZm8ubGFiZWxzID0gbmUudXRpbC5tYXAodGlja0luZm8ubGFiZWxzLCBmdW5jdGlvbihsYWJlbCkge1xuICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwuZGl2aXNpb24obGFiZWwsIGRpdmlkZU51bSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB0aWNrSW5mbztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTm9ybWFsaXplIHN0ZXAuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHN0ZXAgb3JpZ2luYWwgc3RlcFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IG5vcm1hbGl6ZWQgc3RlcFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX25vcm1hbGl6ZVN0ZXA6IGZ1bmN0aW9uKHN0ZXApIHtcbiAgICAgICAgcmV0dXJuIGNhbGN1bGF0b3Iubm9ybWFsaXplQXhpc051bWJlcihzdGVwKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWluaW1pemUgdGljayBzY2FsZS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMudXNlck1pbiB1c2VyIG1pblxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy51c2VyTWF4IHVzZXIgbWF4XG4gICAgICogICAgICBAcGFyYW0ge3t0aWNrQ291bnQ6IG51bWJlciwgc2NhbGU6IG9iamVjdH19IHBhcmFtcy50aWNrSW5mbyB0aWNrIGluZm9cbiAgICAgKiAgICAgIEBwYXJhbSB7e21pbjogbnVtYmVyLCBtYXg6bnVtYmVyfX0gcGFyYW1zLm9wdGlvbnMgYXhpcyBvcHRpb25zXG4gICAgICogQHJldHVybnMge3t0aWNrQ291bnQ6IG51bWJlciwgc2NhbGU6IG9iamVjdCwgbGFiZWxzOiBhcnJheX19IGNvcnJlY3RlZCB0aWNrIGluZm9cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9taW5pbWl6ZVRpY2tTY2FsZTogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciB0aWNrSW5mbyA9IHBhcmFtcy50aWNrSW5mbyxcbiAgICAgICAgICAgIHRpY2tzID0gbmUudXRpbC5yYW5nZSgxLCB0aWNrSW5mby50aWNrQ291bnQpLFxuICAgICAgICAgICAgb3B0aW9ucyA9IHBhcmFtcy5vcHRpb25zLFxuICAgICAgICAgICAgc3RlcCA9IHRpY2tJbmZvLnN0ZXAsXG4gICAgICAgICAgICBzY2FsZSA9IHRpY2tJbmZvLnNjYWxlLFxuICAgICAgICAgICAgdGlja01heCA9IHNjYWxlLm1heCxcbiAgICAgICAgICAgIHRpY2tNaW4gPSBzY2FsZS5taW4sXG4gICAgICAgICAgICBpc1VuZGVmaW5lZE1pbiA9IG5lLnV0aWwuaXNVbmRlZmluZWQob3B0aW9ucy5taW4pLFxuICAgICAgICAgICAgaXNVbmRlZmluZWRNYXggPSBuZS51dGlsLmlzVW5kZWZpbmVkKG9wdGlvbnMubWF4KSxcbiAgICAgICAgICAgIGxhYmVscztcbiAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkodGlja3MsIGZ1bmN0aW9uKHRpY2tJbmRleCkge1xuICAgICAgICAgICAgdmFyIGN1clN0ZXAgPSAoc3RlcCAqIHRpY2tJbmRleCksXG4gICAgICAgICAgICAgICAgY3VyTWluID0gdGlja01pbiArIGN1clN0ZXAsXG4gICAgICAgICAgICAgICAgY3VyTWF4ID0gdGlja01heCAtIGN1clN0ZXA7XG5cbiAgICAgICAgICAgIC8vIOuNlOydtOyDgSDrs4Dqsr3snbQg7ZWE7JqUIOyXhuydhCDqsr3smrBcbiAgICAgICAgICAgIGlmIChwYXJhbXMudXNlck1pbiA8PSBjdXJNaW4gJiYgcGFyYW1zLnVzZXJNYXggPj0gY3VyTWF4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBtaW4g6rCS7JeQIOuzgOqyvSDsl6zsnKDqsIAg7J6I7J2EIOqyveyasFxuICAgICAgICAgICAgaWYgKChpc1VuZGVmaW5lZE1pbiAmJiBwYXJhbXMudXNlck1pbiA+IGN1ck1pbikgfHxcbiAgICAgICAgICAgICAgICAoIWlzVW5kZWZpbmVkTWluICYmIG9wdGlvbnMubWluID49IGN1ck1pbikpIHtcbiAgICAgICAgICAgICAgICBzY2FsZS5taW4gPSBjdXJNaW47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIG1heCDqsJLsl5Ag67OA6rK9IOyXrOycoOqwgCDsnojsnYQg6rK97JqwXG4gICAgICAgICAgICBpZiAoKGlzVW5kZWZpbmVkTWluICYmIHBhcmFtcy51c2VyTWF4IDwgY3VyTWF4KSB8fFxuICAgICAgICAgICAgICAgICghaXNVbmRlZmluZWRNYXggJiYgb3B0aW9ucy5tYXggPD0gY3VyTWF4KSkge1xuICAgICAgICAgICAgICAgIHNjYWxlLm1heCA9IGN1ck1heDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGFiZWxzID0gY2FsY3VsYXRvci5tYWtlTGFiZWxzRnJvbVNjYWxlKHNjYWxlLCBzdGVwKTtcbiAgICAgICAgdGlja0luZm8ubGFiZWxzID0gbGFiZWxzO1xuICAgICAgICB0aWNrSW5mby5zdGVwID0gc3RlcDtcbiAgICAgICAgdGlja0luZm8udGlja0NvdW50ID0gbGFiZWxzLmxlbmd0aDtcbiAgICAgICAgcmV0dXJuIHRpY2tJbmZvO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBkaXZpZGUgdGljayBzdGVwLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7e3NjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfSwgdGlja0NvdW50OiBudW1iZXIsIHN0ZXA6IG51bWJlciwgbGFiZWxzOiBhcnJheS48bnVtYmVyPn19IHRpY2tJbmZvIHRpY2sgaW5mb1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBvcmdUaWNrQ291bnQgb3JpZ2luYWwgdGlja0NvdW50XG4gICAgICogQHJldHVybnMge3tzY2FsZToge21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn0sIHRpY2tDb3VudDogbnVtYmVyLCBzdGVwOiBudW1iZXIsIGxhYmVsczogYXJyYXkuPG51bWJlcj59fSB0aWNrIGluZm9cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9kaXZpZGVUaWNrU3RlcDogZnVuY3Rpb24odGlja0luZm8sIG9yZ1RpY2tDb3VudCkge1xuICAgICAgICB2YXIgc3RlcCA9IHRpY2tJbmZvLnN0ZXAsXG4gICAgICAgICAgICBzY2FsZSA9IHRpY2tJbmZvLnNjYWxlLFxuICAgICAgICAgICAgdGlja0NvdW50ID0gdGlja0luZm8udGlja0NvdW50O1xuICAgICAgICAvLyBzdGVwIDLsnZgg67Cw7IiYIOydtOuptOyEnCDrs4Dqsr3rkJwgdGlja0NvdW507J2YIOuRkOuwsOyImC0x7J20IHRpY2tDb3VudOuztOuLpCBvcmdUaWNrQ291bnTsmYAg7LCo7J206rCAIOuNnOuCmOqxsOuCmCDqsJnsnLzrqbQgc3RlcOydhCDrsJjsnLzroZwg67OA6rK97ZWc64ukLlxuICAgICAgICBpZiAoKHN0ZXAgJSAyID09PSAwKSAmJlxuICAgICAgICAgICAgYWJzKG9yZ1RpY2tDb3VudCAtICgodGlja0NvdW50ICogMikgLSAxKSkgPD0gYWJzKG9yZ1RpY2tDb3VudCAtIHRpY2tDb3VudCkpIHtcbiAgICAgICAgICAgIHN0ZXAgPSBzdGVwIC8gMjtcbiAgICAgICAgICAgIHRpY2tJbmZvLmxhYmVscyA9IGNhbGN1bGF0b3IubWFrZUxhYmVsc0Zyb21TY2FsZShzY2FsZSwgc3RlcCk7XG4gICAgICAgICAgICB0aWNrSW5mby50aWNrQ291bnQgPSB0aWNrSW5mby5sYWJlbHMubGVuZ3RoO1xuICAgICAgICAgICAgdGlja0luZm8uc3RlcCA9IHN0ZXA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRpY2tJbmZvO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHRpY2sgaW5mb1xuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy50aWNrQ291bnQgdGljayBjb3VudFxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5taW4gc2NhbGUgbWluXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLm1heCBzY2FsZSBtYXhcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMudXNlck1pbiBtaW5pbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy51c2VyTWF4IG1heGltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5pc01pbnVzIHdoZXRoZXIgc2NhbGUgaXMgbWludXMgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLmNoYXJ0VHlwZSBjaGFydCB0eXBlXG4gICAgICogICAgICBAcGFyYW0ge3ttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fSBwYXJhbXMub3B0aW9ucyBheGlzIG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7e1xuICAgICAqICAgICAgc2NhbGU6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9LFxuICAgICAqICAgICAgdGlja0NvdW50OiBudW1iZXIsXG4gICAgICogICAgICBzdGVwOiBudW1iZXIsXG4gICAgICogICAgICBsYWJlbHM6IGFycmF5LjxudW1iZXI+XG4gICAgICogfX0gdGljayBpbmZvXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVRpY2tJbmZvOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIHNjYWxlID0gcGFyYW1zLnNjYWxlLFxuICAgICAgICAgICAgc3RlcCwgdGlja0luZm87XG5cbiAgICAgICAgLy8gMDEuIOq4sOuzuCBzY2FsZSDsoJXrs7TroZwgc3RlcCDslrvquLBcbiAgICAgICAgc3RlcCA9IGNhbGN1bGF0b3IuZ2V0U2NhbGVTdGVwKHNjYWxlLCBwYXJhbXMudGlja0NvdW50KTtcblxuICAgICAgICAvLyAwMi4gc3RlcCDsoJXqt5ztmZQg7Iuc7YKk6riwIChleDogMC4zIC0tPiAwLjUsIDcgLS0+IDEwKVxuICAgICAgICBzdGVwID0gdGhpcy5fbm9ybWFsaXplU3RlcChzdGVwKTtcblxuICAgICAgICAvLyAwMy4gc2NhbGUg7KCV6rec7ZmUIOyLnO2CpOq4sFxuICAgICAgICBzY2FsZSA9IHRoaXMuX25vcm1hbGl6ZVNjYWxlKHNjYWxlLCBzdGVwLCBwYXJhbXMudGlja0NvdW50KTtcblxuICAgICAgICAvLyAwNC4gbGluZeywqO2KuOydmCDqsr3smrAg7IKs7Jqp7J6Q7J2YIG1pbuqwkuydtCBzY2FsZeydmCBtaW7qsJLqs7wg6rCZ7J2EIOqyveyasCwgbWlu6rCS7J2EIDEgc3RlcCDqsJDshowg7Iuc7YK0XG4gICAgICAgIHNjYWxlLm1pbiA9IHRoaXMuX2FkZE1pblBhZGRpbmcoe1xuICAgICAgICAgICAgbWluOiBzY2FsZS5taW4sXG4gICAgICAgICAgICBzdGVwOiBzdGVwLFxuICAgICAgICAgICAgdXNlck1pbjogcGFyYW1zLnVzZXJNaW4sXG4gICAgICAgICAgICBtaW5PcHRpb246IHBhcmFtcy5vcHRpb25zLm1pbixcbiAgICAgICAgICAgIGNoYXJ0VHlwZTogcGFyYW1zLmNoYXJ0VHlwZVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyAwNS4g7IKs7Jqp7J6Q7J2YIG1heOqwkuydtCBzY2FlbCBtYXjsmYAg6rCZ7J2EIOqyveyasCwgbWF46rCS7J2EIDEgc3RlcCDspp3qsIAg7Iuc7YK0XG4gICAgICAgIHNjYWxlLm1heCA9IHRoaXMuX2FkZE1heFBhZGRpbmcoe1xuICAgICAgICAgICAgbWF4OiBzY2FsZS5tYXgsXG4gICAgICAgICAgICBzdGVwOiBzdGVwLFxuICAgICAgICAgICAgdXNlck1heDogcGFyYW1zLnVzZXJNYXgsXG4gICAgICAgICAgICBtYXhPcHRpb246IHBhcmFtcy5vcHRpb25zLm1heFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyAwNi4gYXhpcyBzY2FsZeydtCDsgqzsmqnsnpAgbWluLCBtYXjsmYAg6rGw66as6rCAIOupgCDqsr3smrAg7KGw7KCIXG4gICAgICAgIHRpY2tJbmZvID0gdGhpcy5fbWluaW1pemVUaWNrU2NhbGUoe1xuICAgICAgICAgICAgdXNlck1pbjogcGFyYW1zLnVzZXJNaW4sXG4gICAgICAgICAgICB1c2VyTWF4OiBwYXJhbXMudXNlck1heCxcbiAgICAgICAgICAgIHRpY2tJbmZvOiB7c2NhbGU6IHNjYWxlLCBzdGVwOiBzdGVwLCB0aWNrQ291bnQ6IHBhcmFtcy50aWNrQ291bnR9LFxuICAgICAgICAgICAgb3B0aW9uczogcGFyYW1zLm9wdGlvbnNcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGlja0luZm8gPSB0aGlzLl9kaXZpZGVUaWNrU3RlcCh0aWNrSW5mbywgcGFyYW1zLnRpY2tDb3VudCk7XG4gICAgICAgIHJldHVybiB0aWNrSW5mbztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIHNjYWxlIG1pbiBwYWRkaW5nLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHByYW1zIHtudW1iZXJ9IHBhcmFtcy5taW4gc2NhbGUgbWluXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnVzZXJNaW4gbWluaW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubWluT3B0aW9uIG1pbiBvcHRpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuc3RlcCB0aWNrIHN0ZXBcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBzY2FsZSBtaW5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hZGRNaW5QYWRkaW5nOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIG1pbiA9IHBhcmFtcy5taW47XG5cbiAgICAgICAgLy8gbm9ybWFsaXpl65CcIHNjYWxlIG1pbuqwkuydtCB1c2VyIG1pbuqwkuqzvCDqsJnsnYQg6rK97JqwIHN0ZXAg6rCQ7IaMXG4gICAgICAgIGlmICgocGFyYW1zLmNoYXJ0VHlwZSA9PT0gY2hhcnRDb25zdC5DSEFSVF9UWVBFX0xJTkUgfHwgbWluKSAmJiBtaW4gPT09IHBhcmFtcy51c2VyTWluKSB7XG4gICAgICAgICAgICBtaW4gLT0gcGFyYW1zLnN0ZXA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1pbjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIHNjYWxlIG1heCBwYWRkaW5nLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHByYW1zIHtudW1iZXJ9IHBhcmFtcy5tYXggc2NhbGUgbWF4XG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnVzZXJNYXggbWF4aW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubWF4T3B0aW9uIG1heCBvcHRpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuc3RlcCB0aWNrIHN0ZXBcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBzY2FsZSBtYXhcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hZGRNYXhQYWRkaW5nOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIG1heCA9IHBhcmFtcy5tYXg7XG4gICAgICAgIC8vIG5vcm1hbGl6ZeuQnCBzY2FsZSBtYXjqsJLsnbQgdXNlciBtYXjqsJLqs7wg6rCZ7J2EIOqyveyasCBzdGVwIOymneqwgFxuICAgICAgICBpZiAobmUudXRpbC5pc1VuZGVmaW5lZChwYXJhbXMubWF4T3B0aW9uKSAmJiAocGFyYW1zLm1heCA9PT0gcGFyYW1zLnVzZXJNYXgpKSB7XG4gICAgICAgICAgICBtYXggKz0gcGFyYW1zLnN0ZXA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1heDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbm9ybWFsaXplIG1pbi5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWluIG9yaWdpbmFsIG1pblxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdGVwIHRpY2sgc3RlcFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IG5vcm1hbGl6ZWQgbWluXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbm9ybWFsaXplTWluOiBmdW5jdGlvbihtaW4sIHN0ZXApIHtcbiAgICAgICAgdmFyIG1vZCA9IG5lLnV0aWwubW9kKG1pbiwgc3RlcCksXG4gICAgICAgICAgICBub3JtYWxpemVkO1xuXG4gICAgICAgIGlmIChtb2QgPT09IDApIHtcbiAgICAgICAgICAgIG5vcm1hbGl6ZWQgPSBtaW47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBub3JtYWxpemVkID0gbmUudXRpbC5zdWJ0cmFjdGlvbihtaW4sIChtaW4gPj0gMCA/IG1vZCA6IHN0ZXAgKyBtb2QpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbm9ybWFsaXplZDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBub3JtYWxpemVkIG1heC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge3ttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fSBzY2FsZSBzY2FsZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdGVwIHRpY2sgc3RlcFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB0aWNrQ291bnQgdGljayBjb3VudFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IG5vcm1hbGl6ZWQgbWF4XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZU5vcm1hbGl6ZWRNYXg6IGZ1bmN0aW9uKHNjYWxlLCBzdGVwLCB0aWNrQ291bnQpIHtcbiAgICAgICAgdmFyIG1pbk1heERpZmYgPSBuZS51dGlsLm11bHRpcGxpY2F0aW9uKHN0ZXAsIHRpY2tDb3VudCAtIDEpLFxuICAgICAgICAgICAgbm9ybWFsaXplZE1heCA9IG5lLnV0aWwuYWRkaXRpb24oc2NhbGUubWluLCBtaW5NYXhEaWZmKSxcbiAgICAgICAgICAgIG1heERpZmYgPSBzY2FsZS5tYXggLSBub3JtYWxpemVkTWF4LFxuICAgICAgICAgICAgbW9kRGlmZiwgZGl2aWRlRGlmZjtcbiAgICAgICAgLy8gbm9ybWFsaXpl65CcIG1heOqwkuydtCDsm5DrnpjsnZggbWF46rCSIOuztOuLpCDsnpHsnYQg6rK97JqwIHN0ZXDsnYQg7Kad6rCA7Iuc7LycIO2BsCDqsJLsnLzroZwg66eM65Ok6riwXG4gICAgICAgIGlmIChtYXhEaWZmID4gMCkge1xuICAgICAgICAgICAgbW9kRGlmZiA9IG1heERpZmYgJSBzdGVwO1xuICAgICAgICAgICAgZGl2aWRlRGlmZiA9IE1hdGguZmxvb3IobWF4RGlmZiAvIHN0ZXApO1xuICAgICAgICAgICAgbm9ybWFsaXplZE1heCArPSBzdGVwICogKG1vZERpZmYgPiAwID8gZGl2aWRlRGlmZiArIDEgOiBkaXZpZGVEaWZmKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbm9ybWFsaXplZE1heDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbm9ybWFsaXplIHNjYWxlLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7e21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19IHNjYWxlIGJhc2Ugc2NhbGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3RlcCB0aWNrIHN0ZXBcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdGlja0NvdW50IHRpY2sgY291bnRcbiAgICAgKiBAcmV0dXJucyB7e21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19IG5vcm1hbGl6ZWQgc2NhbGVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9ub3JtYWxpemVTY2FsZTogZnVuY3Rpb24oc2NhbGUsIHN0ZXAsIHRpY2tDb3VudCkge1xuICAgICAgICBzY2FsZS5taW4gPSB0aGlzLl9ub3JtYWxpemVNaW4oc2NhbGUubWluLCBzdGVwKTtcbiAgICAgICAgc2NhbGUubWF4ID0gdGhpcy5fbWFrZU5vcm1hbGl6ZWRNYXgoc2NhbGUsIHN0ZXAsIHRpY2tDb3VudCk7XG4gICAgICAgIHJldHVybiBzY2FsZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNhbmRpZGF0ZXMgYWJvdXQgdGljayBpbmZvLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5taW4gbWluaW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubWF4IG1heGltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxudW1iZXI+fSBwYXJhbXMudGlja0NvdW50cyB0aWNrIGNvdW50c1xuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5jaGFydFR5cGUgY2hhcnQgdHlwZVxuICAgICAqIEBwYXJhbSB7e21pbjogbnVtYmVyLCBtYXg6bnVtYmVyfX0gb3B0aW9ucyBheGlzIG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7YXJyYXl9IGNhbmRpZGF0ZXMgYWJvdXQgdGljayBpbmZvXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0Q2FuZGlkYXRlVGlja0luZm9zOiBmdW5jdGlvbihwYXJhbXMsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIHVzZXJNaW4gPSBwYXJhbXMubWluLFxuICAgICAgICAgICAgdXNlck1heCA9IHBhcmFtcy5tYXgsXG4gICAgICAgICAgICBtaW4gPSBwYXJhbXMubWluLFxuICAgICAgICAgICAgbWF4ID0gcGFyYW1zLm1heCxcbiAgICAgICAgICAgIHNjYWxlLCBjYW5kaWRhdGVzO1xuXG4gICAgICAgIC8vIG1pbiwgbWF466eM7Jy866GcIOq4sOuzuCBzY2FsZSDslrvquLBcbiAgICAgICAgc2NhbGUgPSB0aGlzLl9tYWtlQmFzZVNjYWxlKG1pbiwgbWF4LCBvcHRpb25zKTtcblxuICAgICAgICBjYW5kaWRhdGVzID0gbmUudXRpbC5tYXAocGFyYW1zLnRpY2tDb3VudHMsIGZ1bmN0aW9uKHRpY2tDb3VudCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21ha2VUaWNrSW5mbyh7XG4gICAgICAgICAgICAgICAgdGlja0NvdW50OiB0aWNrQ291bnQsXG4gICAgICAgICAgICAgICAgc2NhbGU6IG5lLnV0aWwuZXh0ZW5kKHt9LCBzY2FsZSksXG4gICAgICAgICAgICAgICAgdXNlck1pbjogdXNlck1pbixcbiAgICAgICAgICAgICAgICB1c2VyTWF4OiB1c2VyTWF4LFxuICAgICAgICAgICAgICAgIGNoYXJ0VHlwZTogcGFyYW1zLmNoYXJ0VHlwZSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIHJldHVybiBjYW5kaWRhdGVzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGJhc2Ugc2NhbGVcbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWluIG1pbmltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1heCBtYXhpbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7e21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19IG9wdGlvbnMgYXhpcyBvcHRpb25zXG4gICAgICogQHJldHVybnMge3ttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fSBiYXNlIHNjYWxlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUJhc2VTY2FsZTogZnVuY3Rpb24obWluLCBtYXgsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIGlzTWludXMgPSBmYWxzZSxcbiAgICAgICAgICAgIHRtcE1pbiwgc2NhbGU7XG5cbiAgICAgICAgaWYgKG1pbiA8IDAgJiYgbWF4IDw9IDApIHtcbiAgICAgICAgICAgIGlzTWludXMgPSB0cnVlO1xuICAgICAgICAgICAgdG1wTWluID0gbWluO1xuICAgICAgICAgICAgbWluID0gLW1heDtcbiAgICAgICAgICAgIG1heCA9IC10bXBNaW47XG4gICAgICAgIH1cblxuICAgICAgICBzY2FsZSA9IGNhbGN1bGF0b3IuY2FsY3VsYXRlU2NhbGUobWluLCBtYXgpO1xuXG4gICAgICAgIGlmIChpc01pbnVzKSB7XG4gICAgICAgICAgICB0bXBNaW4gPSBzY2FsZS5taW47XG4gICAgICAgICAgICBzY2FsZS5taW4gPSAtc2NhbGUubWF4O1xuICAgICAgICAgICAgc2NhbGUubWF4ID0gLXRtcE1pbjtcbiAgICAgICAgfVxuXG4gICAgICAgIHNjYWxlLm1pbiA9IG9wdGlvbnMubWluIHx8IHNjYWxlLm1pbjtcbiAgICAgICAgc2NhbGUubWF4ID0gb3B0aW9ucy5tYXggfHwgc2NhbGUubWF4O1xuXG4gICAgICAgIHJldHVybiBzY2FsZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRm9ybWF0IGxhYmVscy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBsYWJlbHMgdGFyZ2V0IGxhYmVsc1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb25bXX0gZm9ybWF0RnVuY3Rpb25zIGZvcm1hdCBmdW5jdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nW119IGZvcm1hdHRlZCBsYWJlbHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9mb3JtYXRMYWJlbHM6IGZ1bmN0aW9uKGxhYmVscywgZm9ybWF0RnVuY3Rpb25zKSB7XG4gICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgIGlmICghZm9ybWF0RnVuY3Rpb25zIHx8ICFmb3JtYXRGdW5jdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gbGFiZWxzO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdCA9IG5lLnV0aWwubWFwKGxhYmVscywgZnVuY3Rpb24obGFiZWwpIHtcbiAgICAgICAgICAgIHZhciBmbnMgPSBjb25jYXQuYXBwbHkoW2xhYmVsXSwgZm9ybWF0RnVuY3Rpb25zKTtcbiAgICAgICAgICAgIHJldHVybiBuZS51dGlsLnJlZHVjZShmbnMsIGZ1bmN0aW9uKHN0b3JlZCwgZm4pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZm4oc3RvcmVkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGF4aXNEYXRhTWFrZXI7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgQm91bmRzIG1ha2VyLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2FsY3VsYXRvciA9IHJlcXVpcmUoJy4vY2FsY3VsYXRvcicpLFxuICAgIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuLi9jb25zdCcpLFxuICAgIHJlbmRlclV0aWwgPSByZXF1aXJlKCcuL3JlbmRlclV0aWwnKTtcblxudmFyIENIQVJUX1BBRERJTkcgPSAxMCxcbiAgICBUSVRMRV9BRERfUEFERElORyA9IDIwLFxuICAgIExFR0VORF9BUkVBX1BBRERJTkcgPSAxMCxcbiAgICBMRUdFTkRfUkVDVF9XSURUSCA9IDEyLFxuICAgIExFR0VORF9MQUJFTF9QQURESU5HX0xFRlQgPSA1LFxuICAgIEFYSVNfTEFCRUxfUEFERElORyA9IDcsXG4gICAgSElEREVOX1dJRFRIID0gMTtcblxudmFyIGNvbmNhdCA9IEFycmF5LnByb3RvdHlwZS5jb25jYXQ7XG5cbi8qKlxuICogQm91bmRzIG1ha2VyLlxuICogQG1vZHVsZSBib3VuZHNNYWtlclxuICovXG52YXIgYm91bmRzTWFrZXIgPSB7XG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBib3VuZHMgYWJvdXQgY2hhcnQgY29tcG9uZW50cy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmJvdW5kc01ha2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmNvbnZlcnREYXRhIGNvbnZlcnRlZCBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIGNoYXJ0IHRoZW1lXG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5pc1ZlcnRpY2FsIHdoZXRoZXIgdmVydGljYWwgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaGFzQXhlcyB3aGV0aGVyIGhhcyBheGVzIGFyZWEgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge2FycmF5fSBwYXJhbXMub3B0aW9uQ2hhcnRUeXBlcyB5IGF4aXMgb3B0aW9uIGNoYXJ0IHR5cGVzXG4gICAgICogQHJldHVybnMge3tcbiAgICAgKiAgIHBsb3Q6IHtcbiAgICAgKiAgICAgZGltZW5zaW9uOiB7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9LFxuICAgICAqICAgICBwb3NpdGlvbjoge3RvcDogbnVtYmVyLCByaWdodDogbnVtYmVyfVxuICAgICAqICAgfSxcbiAgICAgKiAgIHlBeGlzOiB7XG4gICAgICogICAgIGRpbWVuc2lvbjoge3dpZHRoOiAobnVtYmVyKSwgaGVpZ2h0OiBudW1iZXJ9LFxuICAgICAqICAgICBwb3NpdGlvbjoge3RvcDogbnVtYmVyfVxuICAgICAqICAgfSxcbiAgICAgKiAgIHhBeGlzOiB7XG4gICAgICogICAgIGRpbWVuc2lvbjoge3dpZHRoOiBudW1iZXIsIGhlaWdodDogKG51bWJlcil9LFxuICAgICAqICAgICBwb3NpdGlvbjoge3JpZ2h0OiBudW1iZXJ9XG4gICAgICogICB9LFxuICAgICAqICAgc2VyaWVzOiB7XG4gICAgICogICAgIGRpbWVuc2lvbjoge3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfSxcbiAgICAgKiAgICAgcG9zaXRpb246IHt0b3A6IG51bWJlciwgcmlnaHQ6IG51bWJlcn1cbiAgICAgKiAgIH0sXG4gICAgICogICBsZWdlbmQ6IHtcbiAgICAgKiAgICAgcG9zaXRpb246IHt0b3A6IG51bWJlcn1cbiAgICAgKiAgIH0sXG4gICAgICogICB0b29sdGlwOiB7XG4gICAgICogICAgIGRpbWVuc2lvbjoge3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfSxcbiAgICAgKiAgICAgcG9zaXRpb246IHt0b3A6IG51bWJlciwgbGVmdDogbnVtYmVyfVxuICAgICAqICAgfVxuICAgICAqIH19IGJvdW5kc1xuICAgICAqL1xuICAgIG1ha2U6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgZGltZW5zaW9ucyA9IHRoaXMuX2dldENvbXBvbmVudHNEaW1lbnNpb25zKHBhcmFtcyksXG4gICAgICAgICAgICB5QXhpc1dpZHRoID0gZGltZW5zaW9ucy55QXhpcy53aWR0aCxcbiAgICAgICAgICAgIHRvcCA9IGRpbWVuc2lvbnMudGl0bGUuaGVpZ2h0ICsgQ0hBUlRfUEFERElORyxcbiAgICAgICAgICAgIGxlZnQgPSB5QXhpc1dpZHRoICsgQ0hBUlRfUEFERElORyxcbiAgICAgICAgICAgIHJpZ2h0ID0gZGltZW5zaW9ucy5sZWdlbmQud2lkdGggKyBkaW1lbnNpb25zLnlyQXhpcy53aWR0aCArIENIQVJUX1BBRERJTkcsXG4gICAgICAgICAgICBheGVzQm91bmRzID0gdGhpcy5fbWFrZUF4ZXNCb3VuZHMoe1xuICAgICAgICAgICAgICAgIGhhc0F4ZXM6IHBhcmFtcy5oYXNBeGVzLFxuICAgICAgICAgICAgICAgIG9wdGlvbkNoYXJ0VHlwZXM6IHBhcmFtcy5vcHRpb25DaGFydFR5cGVzLFxuICAgICAgICAgICAgICAgIGRpbWVuc2lvbnM6IGRpbWVuc2lvbnMsXG4gICAgICAgICAgICAgICAgdG9wOiB0b3AsXG4gICAgICAgICAgICAgICAgcmlnaHQ6IHJpZ2h0XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGJvdW5kcyA9IG5lLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICBjaGFydDoge1xuICAgICAgICAgICAgICAgICAgICBkaW1lbnNpb246IGRpbWVuc2lvbnMuY2hhcnRcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNlcmllczoge1xuICAgICAgICAgICAgICAgICAgICBkaW1lbnNpb246IGRpbWVuc2lvbnMuc2VyaWVzLFxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiB0b3AsXG4gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiBsZWZ0XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGxlZ2VuZDoge1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiBkaW1lbnNpb25zLnRpdGxlLmhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6IHlBeGlzV2lkdGggKyBkaW1lbnNpb25zLnNlcmllcy53aWR0aCArIGRpbWVuc2lvbnMueXJBeGlzLndpZHRoICsgQ0hBUlRfUEFERElOR1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0b29sdGlwOiB7XG4gICAgICAgICAgICAgICAgICAgIGRpbWVuc2lvbjogZGltZW5zaW9ucy5zZXJpZXMsXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3A6IHRvcCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6IGxlZnRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIGF4ZXNCb3VuZHMpO1xuICAgICAgICByZXR1cm4gYm91bmRzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgbWF4IGxhYmVsIG9mIHZhbHVlIGF4aXMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpib3VuZHNNYWtlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb252ZXJ0RGF0YSBjb252ZXJ0IGRhdGFcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY2hhcnRUeXBlIGNoYXJ0IHR5cGVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfHN0cmluZ30gbWF4IGxhYmVsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0VmFsdWVBeGlzTWF4TGFiZWw6IGZ1bmN0aW9uKGNvbnZlcnREYXRhLCBjaGFydFR5cGUpIHtcbiAgICAgICAgdmFyIHZhbHVlcyA9IGNoYXJ0VHlwZSAmJiBjb252ZXJ0RGF0YS52YWx1ZXNbY2hhcnRUeXBlXSB8fCBjb252ZXJ0RGF0YS5qb2luVmFsdWVzLFxuICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zID0gY29udmVydERhdGEuZm9ybWF0RnVuY3Rpb25zLFxuICAgICAgICAgICAgZmxhdHRlblZhbHVlcyA9IGNvbmNhdC5hcHBseShbXSwgdmFsdWVzKSxcbiAgICAgICAgICAgIG1pbiA9IG5lLnV0aWwubWluKGZsYXR0ZW5WYWx1ZXMpLFxuICAgICAgICAgICAgbWF4ID0gbmUudXRpbC5tYXgoZmxhdHRlblZhbHVlcyksXG4gICAgICAgICAgICBzY2FsZSA9IGNhbGN1bGF0b3IuY2FsY3VsYXRlU2NhbGUobWluLCBtYXgpLFxuICAgICAgICAgICAgbWluTGFiZWwgPSBjYWxjdWxhdG9yLm5vcm1hbGl6ZUF4aXNOdW1iZXIoc2NhbGUubWluKSxcbiAgICAgICAgICAgIG1heExhYmVsID0gY2FsY3VsYXRvci5ub3JtYWxpemVBeGlzTnVtYmVyKHNjYWxlLm1heCksXG4gICAgICAgICAgICBmbnMgPSBmb3JtYXRGdW5jdGlvbnMgJiYgZm9ybWF0RnVuY3Rpb25zLnNsaWNlKCkgfHwgW107XG4gICAgICAgIG1heExhYmVsID0gKG1pbkxhYmVsICsgJycpLmxlbmd0aCA+IChtYXhMYWJlbCArICcnKS5sZW5ndGggPyBtaW5MYWJlbCA6IG1heExhYmVsO1xuICAgICAgICBmbnMudW5zaGlmdChtYXhMYWJlbCk7XG4gICAgICAgIG1heExhYmVsID0gbmUudXRpbC5yZWR1Y2UoZm5zLCBmdW5jdGlvbihzdG9yZWQsIGZuKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4oc3RvcmVkKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBtYXhMYWJlbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IFJlbmRlcmVkIExhYmVscyBNYXggU2l6ZSh3aWR0aCBvciBoZWlnaHQpLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Ym91bmRzTWFrZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBsYWJlbHMgbGFiZWxzXG4gICAgICogQHBhcmFtIHt7Zm9udFNpemU6IG51bWJlciwgZm9udEZhbWlseTogc3RyaW5nLCBjb2xvcjogc3RyaW5nfX0gdGhlbWUgbGFiZWwgdGhlbWVcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBpdGVyYXRlZSBpdGVyYXRlZVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IG1heCBzaXplICh3aWR0aCBvciBoZWlnaHQpXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0UmVuZGVyZWRMYWJlbHNNYXhTaXplOiBmdW5jdGlvbihsYWJlbHMsIHRoZW1lLCBpdGVyYXRlZSkge1xuICAgICAgICB2YXIgc2l6ZXMgPSBuZS51dGlsLm1hcChsYWJlbHMsIGZ1bmN0aW9uKGxhYmVsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0ZXJhdGVlKGxhYmVsLCB0aGVtZSk7XG4gICAgICAgICAgICB9LCB0aGlzKSxcbiAgICAgICAgICAgIG1heFNpemUgPSBuZS51dGlsLm1heChzaXplcyk7XG4gICAgICAgIHJldHVybiBtYXhTaXplO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgcmVuZGVyZWQgbGFiZWxzIG1heCB3aWR0aC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmJvdW5kc01ha2VyXG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gbGFiZWxzIGxhYmVsc1xuICAgICAqIEBwYXJhbSB7e2ZvbnRTaXplOiBudW1iZXIsIGZvbnRGYW1pbHk6IHN0cmluZywgY29sb3I6IHN0cmluZ319IHRoZW1lIGxhYmVsIHRoZW1lXG4gICAgICogQHJldHVybnMge251bWJlcn0gbWF4IHdpZHRoXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0UmVuZGVyZWRMYWJlbHNNYXhXaWR0aDogZnVuY3Rpb24obGFiZWxzLCB0aGVtZSkge1xuICAgICAgICB2YXIgaXRlcmF0ZWUgPSBuZS51dGlsLmJpbmQocmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsV2lkdGgsIHJlbmRlclV0aWwpLFxuICAgICAgICAgICAgbWF4V2lkdGggPSB0aGlzLl9nZXRSZW5kZXJlZExhYmVsc01heFNpemUobGFiZWxzLCB0aGVtZSwgaXRlcmF0ZWUpO1xuICAgICAgICByZXR1cm4gbWF4V2lkdGg7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCByZW5kZXJlZCBsYWJlbHMgbWF4IGhlaWdodC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmJvdW5kc01ha2VyXG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gbGFiZWxzIGxhYmVsc1xuICAgICAqIEBwYXJhbSB7e2ZvbnRTaXplOiBudW1iZXIsIGZvbnRGYW1pbHk6IHN0cmluZywgY29sb3I6IHN0cmluZ319IHRoZW1lIGxhYmVsIHRoZW1lXG4gICAgICogQHJldHVybnMge251bWJlcn0gbWF4IGhlaWdodFxuICAgICAqL1xuICAgIF9nZXRSZW5kZXJlZExhYmVsc01heEhlaWdodDogZnVuY3Rpb24obGFiZWxzLCB0aGVtZSkge1xuICAgICAgICB2YXIgaXRlcmF0ZWUgPSBuZS51dGlsLmJpbmQocmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsSGVpZ2h0LCByZW5kZXJVdGlsKSxcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuX2dldFJlbmRlcmVkTGFiZWxzTWF4U2l6ZShsYWJlbHMsIHRoZW1lLCBpdGVyYXRlZSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBoZWlnaHQgb2YgeCBheGlzIGFyZWEuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpib3VuZHNNYWtlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIHggYXhpcyBvcHRpb25zLFxuICAgICAqIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGxhYmVscyBheGlzIGxhYmVsc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBheGlzIHRoZW1lXG4gICAgICogQHJldHVybnMge251bWJlcn0gaGVpZ2h0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0WEF4aXNIZWlnaHQ6IGZ1bmN0aW9uKG9wdGlvbnMsIGxhYmVscywgdGhlbWUpIHtcbiAgICAgICAgdmFyIHRpdGxlID0gb3B0aW9ucyAmJiBvcHRpb25zLnRpdGxlLFxuICAgICAgICAgICAgdGl0bGVBcmVhSGVpZ2h0ID0gcmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsSGVpZ2h0KHRpdGxlLCB0aGVtZS50aXRsZSkgKyBUSVRMRV9BRERfUEFERElORyxcbiAgICAgICAgICAgIGhlaWdodCA9IHRoaXMuX2dldFJlbmRlcmVkTGFiZWxzTWF4SGVpZ2h0KGxhYmVscywgdGhlbWUubGFiZWwpICsgdGl0bGVBcmVhSGVpZ2h0O1xuICAgICAgICByZXR1cm4gaGVpZ2h0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgd2lkdGggYWJvdXQgeSBheGlzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIHkgYXhpcyBvcHRpb25zXG4gICAgICogQHBhcmFtIHthcnJheS48c3RyaW5nPn0gbGFiZWxzIGxhYmVsc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSB5QXhpcyB0aGVtZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBvcHRpb25zIGluZGV4XG4gICAgICogQHJldHVybnMge251bWJlcn0geSBheGlzIHdpZHRoXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0WUF4aXNXaWR0aDogZnVuY3Rpb24ob3B0aW9ucywgbGFiZWxzLCB0aGVtZSwgaW5kZXgpIHtcbiAgICAgICAgdmFyIHRpdGxlID0gJycsXG4gICAgICAgICAgICB0aXRsZUFyZWFXaWR0aCwgd2lkdGg7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgICAgICAgIG9wdGlvbnMgPSBbXS5jb25jYXQob3B0aW9ucyk7XG4gICAgICAgICAgICB0aXRsZSA9IG9wdGlvbnNbaW5kZXggfHwgMF0udGl0bGU7XG4gICAgICAgIH1cblxuICAgICAgICB0aXRsZUFyZWFXaWR0aCA9IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodCh0aXRsZSwgdGhlbWUudGl0bGUpICsgVElUTEVfQUREX1BBRERJTkc7XG4gICAgICAgIHdpZHRoID0gdGhpcy5fZ2V0UmVuZGVyZWRMYWJlbHNNYXhXaWR0aChsYWJlbHMsIHRoZW1lLmxhYmVsKSArIHRpdGxlQXJlYVdpZHRoICsgQVhJU19MQUJFTF9QQURESU5HO1xuXG4gICAgICAgIHJldHVybiB3aWR0aDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHdpZHRoIGFib3V0IHkgcmlnaHQgYXhpcy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmJvdW5kc01ha2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBwYXJhbXMuY2hhcnRUeXBlcyB5IGF4aXMgY2hhcnQgdHlwZXNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgeSBheGlzIHRoZW1lXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgeSBheGlzIG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSB5IHJpZ2h0IGF4aXMgd2lkdGhcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRZUkF4aXNXaWR0aDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBjaGFydFR5cGVzID0gcGFyYW1zLmNoYXJ0VHlwZXMgfHwgW10sXG4gICAgICAgICAgICBsZW4gPSBjaGFydFR5cGVzLmxlbmd0aCxcbiAgICAgICAgICAgIHdpZHRoID0gMCxcbiAgICAgICAgICAgIGluZGV4LCBjaGFydFR5cGUsIHRoZW1lLCBsYWJlbDtcbiAgICAgICAgaWYgKGxlbiA+IDApIHtcbiAgICAgICAgICAgIGluZGV4ID0gbGVuIC0gMTtcbiAgICAgICAgICAgIGNoYXJ0VHlwZSA9IGNoYXJ0VHlwZXNbaW5kZXhdO1xuICAgICAgICAgICAgdGhlbWUgPSBwYXJhbXMudGhlbWVbY2hhcnRUeXBlXSB8fCBwYXJhbXMudGhlbWU7XG4gICAgICAgICAgICBsYWJlbCA9IHRoaXMuX2dldFZhbHVlQXhpc01heExhYmVsKHBhcmFtcy5jb252ZXJ0RGF0YSwgY2hhcnRUeXBlKTtcbiAgICAgICAgICAgIHdpZHRoID0gdGhpcy5fZ2V0WUF4aXNXaWR0aChwYXJhbXMub3B0aW9ucywgW2xhYmVsXSwgdGhlbWUsIGluZGV4KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gd2lkdGg7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYXhlcyBkaW1lbnNpb24uXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpib3VuZHNNYWtlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5jb252ZXJ0RGF0YSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBjaGFydCB0aGVtZVxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaXNWZXJ0aWNhbCB3aGV0aGVyIHZlcnRpY2FsIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5vcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7e1xuICAgICAqICAgICAgeUF4aXM6IHt3aWR0aDogbnVtYmVyfSxcbiAgICAgKiAgICAgIHlyQXhpczoge3dpZHRoOiBudW1iZXJ9LFxuICAgICAqICAgICAgeEF4aXM6IHtoZWlnaHQ6IG51bWJlcn1cbiAgICAgKiB9fSBheGVzIGRpbWVuc2lvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VBeGVzRGltZW5zaW9uOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIHRoZW1lLCBvcHRpb25zLCBjb252ZXJ0RGF0YSwgb3B0aW9uQ2hhcnRUeXBlcywgbWF4VmFsdWVMYWJlbCwgeUxhYmVscyxcbiAgICAgICAgICAgIHhMYWJlbHMsIHlBeGlzV2lkdGgsIHhBeGlzSGVpZ2h0LCB5ckF4aXNXaWR0aCwgY2hhcnRUeXBlO1xuXG4gICAgICAgIC8vIHBpZeywqO2KuOyZgCDqsJnsnbQgYXhpcyDsmIHsl63snbQg7ZWE7JqUIOyXhuuKlCDqsr3smrDsl5DripQg66qo65GQIDDsnLzroZwg67CY7ZmYXG4gICAgICAgIGlmICghcGFyYW1zLmhhc0F4ZXMpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgeUF4aXM6IHtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDBcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHlyQXhpczoge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogMFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgeEF4aXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAwXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoZW1lID0gcGFyYW1zLnRoZW1lO1xuICAgICAgICBvcHRpb25zID0gcGFyYW1zLm9wdGlvbnM7XG4gICAgICAgIGNvbnZlcnREYXRhID0gcGFyYW1zLmNvbnZlcnREYXRhO1xuICAgICAgICBvcHRpb25DaGFydFR5cGVzID0gcGFyYW1zLm9wdGlvbkNoYXJ0VHlwZXM7XG5cbiAgICAgICAgY2hhcnRUeXBlID0gb3B0aW9uQ2hhcnRUeXBlcyAmJiBvcHRpb25DaGFydFR5cGVzWzBdIHx8ICcnO1xuXG4gICAgICAgIC8vIHZhbHVlIOykkSDqsIDsnqUg7YGwIOqwkuydhCDstpTstpztlZjsl6wgdmFsdWUgbGFiZWzroZwg7KeA7KCVIChsYWJsZSDrhIjruYQg7LK07YGsIOyLnCDsgqzsmqkpXG4gICAgICAgIG1heFZhbHVlTGFiZWwgPSB0aGlzLl9nZXRWYWx1ZUF4aXNNYXhMYWJlbChjb252ZXJ0RGF0YSwgY2hhcnRUeXBlKTtcblxuICAgICAgICAvLyDshLjroZzsmLXshZjsl5Ag65Sw65287IScIHjstpXqs7wgeey2leyXkCDsoIHsmqntlaAg66CI7J2067iUIOygleuztCDsp4DsoJVcbiAgICAgICAgeUxhYmVscyA9IHBhcmFtcy5pc1ZlcnRpY2FsID8gW21heFZhbHVlTGFiZWxdIDogY29udmVydERhdGEubGFiZWxzO1xuICAgICAgICB4TGFiZWxzID0gcGFyYW1zLmlzVmVydGljYWwgPyBjb252ZXJ0RGF0YS5sYWJlbHMgOiBbbWF4VmFsdWVMYWJlbF07XG5cbiAgICAgICAgeUF4aXNXaWR0aCA9IHRoaXMuX2dldFlBeGlzV2lkdGgob3B0aW9ucy55QXhpcywgeUxhYmVscywgdGhlbWUueUF4aXNbY2hhcnRUeXBlXSB8fCB0aGVtZS55QXhpcyk7XG4gICAgICAgIHhBeGlzSGVpZ2h0ID0gdGhpcy5fZ2V0WEF4aXNIZWlnaHQob3B0aW9ucy54QXhpcywgeExhYmVscywgdGhlbWUueEF4aXMpO1xuICAgICAgICB5ckF4aXNXaWR0aCA9IHRoaXMuX2dldFlSQXhpc1dpZHRoKHtcbiAgICAgICAgICAgIGNvbnZlcnREYXRhOiBjb252ZXJ0RGF0YSxcbiAgICAgICAgICAgIGNoYXJ0VHlwZXM6IG9wdGlvbkNoYXJ0VHlwZXMsXG4gICAgICAgICAgICB0aGVtZTogdGhlbWUueUF4aXMsXG4gICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zLnlBeGlzXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB5QXhpczoge1xuICAgICAgICAgICAgICAgIHdpZHRoOiB5QXhpc1dpZHRoXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgeXJBeGlzOiB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IHlyQXhpc1dpZHRoXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgeEF4aXM6IHtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IHhBeGlzSGVpZ2h0XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB3aWR0aCBvZiBsZWdlbmQgYXJlYS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmJvdW5kc01ha2VyXG4gICAgICogQHBhcmFtIHthcnJheS48c3RyaW5nPn0gam9pbkxlZ2VuZExhYmVscyBsZWdlbmQgbGFiZWxzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGxhYmVsVGhlbWUgbGFiZWwgdGhlbWVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSB3aWR0aFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldExlZ2VuZEFyZWFXaWR0aDogZnVuY3Rpb24oam9pbkxlZ2VuZExhYmVscywgbGFiZWxUaGVtZSwgY2hhcnRUeXBlLCBzZXJpZXNPcHRpb24pIHtcbiAgICAgICAgdmFyIGxlZ2VuZFdpZHRoID0gMCxcbiAgICAgICAgICAgIGxlZ2VuZExhYmVscywgbWF4TGFiZWxXaWR0aDtcblxuICAgICAgICBzZXJpZXNPcHRpb24gPSBzZXJpZXNPcHRpb24gfHwge307XG5cbiAgICAgICAgaWYgKGNoYXJ0VHlwZSAhPT0gY2hhcnRDb25zdC5DSEFSVF9UWVBFX1BJRSB8fCAhc2VyaWVzT3B0aW9uLmxlZ2VuZFR5cGUpIHtcbiAgICAgICAgICAgIGxlZ2VuZExhYmVscyA9IG5lLnV0aWwubWFwKGpvaW5MZWdlbmRMYWJlbHMsIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaXRlbS5sYWJlbDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbWF4TGFiZWxXaWR0aCA9IHRoaXMuX2dldFJlbmRlcmVkTGFiZWxzTWF4V2lkdGgobGVnZW5kTGFiZWxzLCBsYWJlbFRoZW1lKTtcbiAgICAgICAgICAgIGxlZ2VuZFdpZHRoID0gbWF4TGFiZWxXaWR0aCArIExFR0VORF9SRUNUX1dJRFRIICtcbiAgICAgICAgICAgICAgICBMRUdFTkRfTEFCRUxfUEFERElOR19MRUZUICsgKExFR0VORF9BUkVBX1BBRERJTkcgKiAyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBsZWdlbmRXaWR0aDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBzZXJpZXMgZGltZW5zaW9uLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Ym91bmRzTWFrZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gcGFyYW1zLmNoYXJ0RGltZW5zaW9uIGNoYXJ0IGRpbWVuc2lvblxuICAgICAqICAgICAgQHBhcmFtIHt7XG4gICAgICogICAgICAgICAgeUF4aXM6IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6bnVtYmVyfSxcbiAgICAgKiAgICAgICAgICB4QXhpczoge3dpZHRoOiBudW1iZXIsIGhlaWdodDpudW1iZXJ9LFxuICAgICAqICAgICAgICAgIHlyQXhpczoge3dpZHRoOiBudW1iZXIsIGhlaWdodDpudW1iZXJ9XG4gICAgICogICAgICB9fSBwYXJhbXMuYXhlc0RpbWVuc2lvbiBheGVzIGRpbWVuc2lvblxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5sZWdlbmRXaWR0aCBsZWdlbmQgd2lkdGhcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMudGl0bGVIZWlnaHQgdGl0bGUgaGVpZ2h0XG4gICAgICogQHJldHVybnMge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IHNlcmllcyBkaW1lbnNpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlU2VyaWVzRGltZW5zaW9uOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGF4ZXNEaW1lbnNpb24gPSBwYXJhbXMuYXhlc0RpbWVuc2lvbixcbiAgICAgICAgICAgIHJpZ2h0QXJlYVdpZHRoID0gcGFyYW1zLmxlZ2VuZFdpZHRoICsgYXhlc0RpbWVuc2lvbi55ckF4aXMud2lkdGgsXG4gICAgICAgICAgICB3aWR0aCA9IHBhcmFtcy5jaGFydERpbWVuc2lvbi53aWR0aCAtIChDSEFSVF9QQURESU5HICogMikgLSBheGVzRGltZW5zaW9uLnlBeGlzLndpZHRoIC0gcmlnaHRBcmVhV2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQgPSBwYXJhbXMuY2hhcnREaW1lbnNpb24uaGVpZ2h0IC0gKENIQVJUX1BBRERJTkcgKiAyKSAtIHBhcmFtcy50aXRsZUhlaWdodCAtIGF4ZXNEaW1lbnNpb24ueEF4aXMuaGVpZ2h0O1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBoZWlnaHRcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNvbXBvbmVudHMgZGltZW5zaW9uXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpib3VuZHNNYWtlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5jb252ZXJ0RGF0YSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBjaGFydCB0aGVtZVxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaXNWZXJ0aWNhbCB3aGV0aGVyIHZlcnRpY2FsIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5vcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBjb21wb25lbnRzIGRpbWVuc2lvbnNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRDb21wb25lbnRzRGltZW5zaW9uczogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciB0aGVtZSA9IHBhcmFtcy50aGVtZSxcbiAgICAgICAgICAgIG9wdGlvbnMgPSBwYXJhbXMub3B0aW9ucyxcbiAgICAgICAgICAgIGNvbnZlcnREYXRhID0gcGFyYW1zLmNvbnZlcnREYXRhLFxuICAgICAgICAgICAgY2hhcnRPcHRpb25zID0gb3B0aW9ucy5jaGFydCB8fCB7fSxcbiAgICAgICAgICAgIGNoYXJ0RGltZW5zaW9uID0ge1xuICAgICAgICAgICAgICAgIHdpZHRoOiBjaGFydE9wdGlvbnMud2lkdGggfHwgNTAwLFxuICAgICAgICAgICAgICAgIGhlaWdodDogY2hhcnRPcHRpb25zLmhlaWdodCB8fCA0MDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBheGVzRGltZW5zaW9uLCB0aXRsZUhlaWdodCwgbGVnZW5kV2lkdGgsIHNlcmllc0RpbWVuc2lvbiwgZGltZW5zaW9ucztcblxuICAgICAgICAvLyBheGlzIOyYgeyXreyXkCDtlYTsmpTtlZwg7JqU7IaM65Ok7J2YIOuEiOu5hCDrhpLsnbTrpbwg7Ja77Ja07Ji0XG4gICAgICAgIGF4ZXNEaW1lbnNpb24gPSB0aGlzLl9tYWtlQXhlc0RpbWVuc2lvbihwYXJhbXMpO1xuICAgICAgICB0aXRsZUhlaWdodCA9IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodChjaGFydE9wdGlvbnMudGl0bGUsIHRoZW1lLnRpdGxlKSArIFRJVExFX0FERF9QQURESU5HO1xuICAgICAgICBsZWdlbmRXaWR0aCA9IHRoaXMuX2dldExlZ2VuZEFyZWFXaWR0aChjb252ZXJ0RGF0YS5qb2luTGVnZW5kTGFiZWxzLCB0aGVtZS5sZWdlbmQubGFiZWwsIHBhcmFtcy5jaGFydFR5cGUsIG9wdGlvbnMuc2VyaWVzKTtcblxuICAgICAgICAvLyBzZXJpZXMg64SI67mELCDrhpLsnbQg6rCS7J2AIOywqO2KuCBib3VuZHPrpbwg6rWs7ISx7ZWY64qUIOqwgOyepSDspJHsmpTtlZwg7JqU7IaM64ukXG4gICAgICAgIHNlcmllc0RpbWVuc2lvbiA9IHRoaXMuX21ha2VTZXJpZXNEaW1lbnNpb24oe1xuICAgICAgICAgICAgY2hhcnREaW1lbnNpb246IGNoYXJ0RGltZW5zaW9uLFxuICAgICAgICAgICAgYXhlc0RpbWVuc2lvbjogYXhlc0RpbWVuc2lvbixcbiAgICAgICAgICAgIGxlZ2VuZFdpZHRoOiBsZWdlbmRXaWR0aCxcbiAgICAgICAgICAgIHRpdGxlSGVpZ2h0OiB0aXRsZUhlaWdodFxuICAgICAgICB9KTtcblxuICAgICAgICBkaW1lbnNpb25zID0gbmUudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgY2hhcnQ6IGNoYXJ0RGltZW5zaW9uLFxuICAgICAgICAgICAgdGl0bGU6IHtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IHRpdGxlSGVpZ2h0XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2VyaWVzOiBzZXJpZXNEaW1lbnNpb24sXG4gICAgICAgICAgICBsZWdlbmQ6IHtcbiAgICAgICAgICAgICAgICB3aWR0aDogbGVnZW5kV2lkdGhcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgYXhlc0RpbWVuc2lvbik7XG4gICAgICAgIHJldHVybiBkaW1lbnNpb25zO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGF4ZXMgYm91bmRzLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Ym91bmRzTWFrZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gcGFyYW1zLmhhc0F4ZXMgd2hldGhlciBoYXMgYXhlZCBvciBub3RcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IHBhcmFtcy5vcHRpb25DaGFydFR5cGVzIHkgYXhpcyBjaGFydCB0eXBlc1xuICAgICAqICAgICAgQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBwYXJhbXMuZGltZW5zaW9uIGNoYXJ0IGRpbWVuc2lvblxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy50b3AgdG9wIHBvc2l0aW9uXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnJpZ2h0IHJpZ2h0IHBvc2l0aW9uXG4gICAgICogQHJldHVybnMge29iamVjdH0gYXhlcyBib3VuZHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQXhlc0JvdW5kczogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBib3VuZHMsIGRpbWVuc2lvbnMsIG9wdGlvbkNoYXJ0VHlwZXMsIHRvcCwgcmlnaHQ7XG5cbiAgICAgICAgLy8gcGll7LCo7Yq47JmAIOqwmeydtCBheGlzIOyYgeyXreydtCDtlYTsmpQg7JeG64qUIOqyveyasOyXkOuKlCDruYgg6rCS7J2EIOuwmO2ZmCDtlahcbiAgICAgICAgaWYgKCFwYXJhbXMuaGFzQXhlcykge1xuICAgICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICB9XG5cbiAgICAgICAgZGltZW5zaW9ucyA9IHBhcmFtcy5kaW1lbnNpb25zO1xuICAgICAgICBvcHRpb25DaGFydFR5cGVzID0gcGFyYW1zLm9wdGlvbkNoYXJ0VHlwZXM7XG4gICAgICAgIHRvcCA9IHBhcmFtcy50b3A7XG4gICAgICAgIHJpZ2h0ID0gcGFyYW1zLnJpZ2h0O1xuICAgICAgICBib3VuZHMgPSB7XG4gICAgICAgICAgICBwbG90OiB7XG4gICAgICAgICAgICAgICAgZGltZW5zaW9uOiBkaW1lbnNpb25zLnNlcmllcyxcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICB0b3A6IHRvcCxcbiAgICAgICAgICAgICAgICAgICAgcmlnaHQ6IHJpZ2h0XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHlBeGlzOiB7XG4gICAgICAgICAgICAgICAgZGltZW5zaW9uOiB7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiBkaW1lbnNpb25zLnlBeGlzLndpZHRoLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IGRpbWVuc2lvbnMuc2VyaWVzLmhlaWdodFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgdG9wOiB0b3AsXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IENIQVJUX1BBRERJTkcgKyBISURERU5fV0lEVEhcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgeEF4aXM6IHtcbiAgICAgICAgICAgICAgICBkaW1lbnNpb246IHtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGRpbWVuc2lvbnMuc2VyaWVzLndpZHRoLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IGRpbWVuc2lvbnMueEF4aXMuaGVpZ2h0XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICB0b3A6IHRvcCArIGRpbWVuc2lvbnMuc2VyaWVzLmhlaWdodCAtIEhJRERFTl9XSURUSCxcbiAgICAgICAgICAgICAgICAgICAgcmlnaHQ6IHJpZ2h0XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIOyasOy4oSB5IGF4aXMg7JiB7JetIGJvdW5kcyDsoJXrs7Qg7LaU6rCAXG4gICAgICAgIGlmIChvcHRpb25DaGFydFR5cGVzICYmIG9wdGlvbkNoYXJ0VHlwZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBib3VuZHMueXJBeGlzID0ge1xuICAgICAgICAgICAgICAgIGRpbWVuc2lvbjoge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogZGltZW5zaW9ucy55ckF4aXMud2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogZGltZW5zaW9ucy5zZXJpZXMuaGVpZ2h0XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICB0b3A6IHRvcCxcbiAgICAgICAgICAgICAgICAgICAgcmlnaHQ6IGRpbWVuc2lvbnMubGVnZW5kLndpZHRoICsgQ0hBUlRfUEFERElORyArIEhJRERFTl9XSURUSFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYm91bmRzO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gYm91bmRzTWFrZXI7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgY2FsY3VsYXRvci5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIEFYSVNfU1RBTkRBUkRfTVVMVElQTEVfTlVNUyA9IFsxLCAyLCA1LCAxMF07XG5cbi8qKlxuICogQ2FsY3VsYXRvci5cbiAqIEBtb2R1bGUgY2FsY3VsYXRvclxuICovXG52YXIgY2FsY3VsYXRvciA9IHtcbiAgICAvKipcbiAgICAgKiBDYWxjdWxhdGUgc2NhbGUgZnJvbSBjaGFydCBtaW4sIG1heCBkYXRhLlxuICAgICAqICAtIGh0dHA6Ly9wZWx0aWVydGVjaC5jb20vaG93LWV4Y2VsLWNhbGN1bGF0ZXMtYXV0b21hdGljLWNoYXJ0LWF4aXMtbGltaXRzL1xuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Y2FsY3VsYXRvclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtaW4gbWluIG1pbmltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1heCBtYXggbWF4aW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdGlja0NvdW50IHRpY2sgY291bnRcbiAgICAgKiBAcmV0dXJucyB7e21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19IHNjYWxlIGF4aXMgc2NhbGVcbiAgICAgKi9cbiAgICBjYWxjdWxhdGVTY2FsZTogZnVuY3Rpb24obWluLCBtYXgpIHtcbiAgICAgICAgdmFyIHNhdmVNaW4gPSAwLFxuICAgICAgICAgICAgc2NhbGUgPSB7fSxcbiAgICAgICAgICAgIGlvZFZhbHVlOyAvLyBpbmNyZWFzZSBvciBkZWNyZWFzZSB2YWx1ZTtcblxuICAgICAgICBpZiAobWluIDwgMCkge1xuICAgICAgICAgICAgc2F2ZU1pbiA9IG1pbjtcbiAgICAgICAgICAgIG1heCAtPSBtaW47XG4gICAgICAgICAgICBtaW4gPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgaW9kVmFsdWUgPSAobWF4IC0gbWluKSAvIDIwO1xuICAgICAgICBzY2FsZS5tYXggPSBtYXggKyBpb2RWYWx1ZSArIHNhdmVNaW47XG5cbiAgICAgICAgaWYgKG1heCAvIDYgPiBtaW4pIHtcbiAgICAgICAgICAgIHNjYWxlLm1pbiA9IDAgKyBzYXZlTWluO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2NhbGUubWluID0gbWluIC0gaW9kVmFsdWUgKyBzYXZlTWluO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzY2FsZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbm9ybWFsaXplIG51bWJlci5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmNhbGN1bGF0b3JcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgdGFyZ2V0IHZhbHVlXG4gICAgICogQHJldHVybnMge251bWJlcn0gbm9ybWFsaXplZCBudW1iZXJcbiAgICAgKi9cbiAgICBub3JtYWxpemVBeGlzTnVtYmVyOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICB2YXIgc3RhbmRhcmQgPSAwLFxuICAgICAgICAgICAgZmxhZyA9IDEsXG4gICAgICAgICAgICBub3JtYWxpemVkLCBtb2Q7XG5cbiAgICAgICAgaWYgKHZhbHVlID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH0gZWxzZSBpZiAodmFsdWUgPCAwKSB7XG4gICAgICAgICAgICBmbGFnID0gLTE7XG4gICAgICAgIH1cblxuICAgICAgICB2YWx1ZSAqPSBmbGFnO1xuXG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KEFYSVNfU1RBTkRBUkRfTVVMVElQTEVfTlVNUywgZnVuY3Rpb24obnVtKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgPCBudW0pIHtcbiAgICAgICAgICAgICAgICBpZiAobnVtID4gMSkge1xuICAgICAgICAgICAgICAgICAgICBzdGFuZGFyZCA9IG51bTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChudW0gPT09IDEwKSB7XG4gICAgICAgICAgICAgICAgc3RhbmRhcmQgPSAxMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHN0YW5kYXJkIDwgMSkge1xuICAgICAgICAgICAgbm9ybWFsaXplZCA9IHRoaXMubm9ybWFsaXplQXhpc051bWJlcih2YWx1ZSAqIDEwKSAqIDAuMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1vZCA9IG5lLnV0aWwubW9kKHZhbHVlLCBzdGFuZGFyZCk7XG4gICAgICAgICAgICBub3JtYWxpemVkID0gbmUudXRpbC5hZGRpdGlvbih2YWx1ZSwgKG1vZCA+IDAgPyBzdGFuZGFyZCAtIG1vZCA6IDApKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBub3JtYWxpemVkICo9IGZsYWc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgdGljayBwb3NpdGlvbnMgb2YgcGl4ZWwgdHlwZS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmNhbGN1bGF0b3JcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc2l6ZSBhcmVhIHdpZHRoIG9yIGhlaWdodFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjb3VudCB0aWNrIGNvdW50XG4gICAgICogQHJldHVybnMge2FycmF5LjxudW1iZXI+fSBwb3NpdGlvbnNcbiAgICAgKi9cbiAgICBtYWtlVGlja1BpeGVsUG9zaXRpb25zOiBmdW5jdGlvbihzaXplLCBjb3VudCkge1xuICAgICAgICB2YXIgcG9zaXRpb25zID0gW10sXG4gICAgICAgICAgICBweFNjYWxlLCBweFN0ZXA7XG5cbiAgICAgICAgaWYgKGNvdW50ID4gMCkge1xuICAgICAgICAgICAgcHhTY2FsZSA9IHttaW46IDAsIG1heDogc2l6ZSAtIDF9O1xuICAgICAgICAgICAgcHhTdGVwID0gdGhpcy5nZXRTY2FsZVN0ZXAocHhTY2FsZSwgY291bnQpO1xuICAgICAgICAgICAgcG9zaXRpb25zID0gbmUudXRpbC5tYXAobmUudXRpbC5yYW5nZSgwLCBzaXplLCBweFN0ZXApLCBmdW5jdGlvbihwb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLnJvdW5kKHBvc2l0aW9uKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcG9zaXRpb25zW3Bvc2l0aW9ucy5sZW5ndGggLSAxXSA9IHNpemUgLSAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwb3NpdGlvbnM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgbGFiZWxzIGZyb20gc2NhbGUuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpjYWxjdWxhdG9yXG4gICAgICogQHBhcmFtIHt7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX0gc2NhbGUgYXhpcyBzY2FsZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdGVwIHN0ZXAgYmV0d2VlbiBtYXggYW5kIG1pblxuICAgICAqIEByZXR1cm5zIHtzdHJpbmdbXX0gbGFiZWxzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBtYWtlTGFiZWxzRnJvbVNjYWxlOiBmdW5jdGlvbihzY2FsZSwgc3RlcCkge1xuICAgICAgICB2YXIgbXVsdGlwbGVOdW0gPSBuZS51dGlsLmZpbmRNdWx0aXBsZU51bShzdGVwKSxcbiAgICAgICAgICAgIG1pbiA9IHNjYWxlLm1pbiAqIG11bHRpcGxlTnVtLFxuICAgICAgICAgICAgbWF4ID0gc2NhbGUubWF4ICogbXVsdGlwbGVOdW0sXG4gICAgICAgICAgICBsYWJlbHMgPSBuZS51dGlsLnJhbmdlKG1pbiwgbWF4ICsgMSwgc3RlcCAqIG11bHRpcGxlTnVtKTtcbiAgICAgICAgbGFiZWxzID0gbmUudXRpbC5tYXAobGFiZWxzLCBmdW5jdGlvbihsYWJlbCkge1xuICAgICAgICAgICAgcmV0dXJuIGxhYmVsIC8gbXVsdGlwbGVOdW07XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gbGFiZWxzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgc2NhbGUgc3RlcC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmNhbGN1bGF0b3JcbiAgICAgKiBAcGFyYW0ge3ttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fSBzY2FsZSBheGlzIHNjYWxlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGNvdW50IHZhbHVlIGNvdW50XG4gICAgICogQHJldHVybnMge251bWJlcn0gc2NhbGUgc3RlcFxuICAgICAqL1xuICAgIGdldFNjYWxlU3RlcDogZnVuY3Rpb24oc2NhbGUsIGNvdW50KSB7XG4gICAgICAgIHJldHVybiAoc2NhbGUubWF4IC0gc2NhbGUubWluKSAvIChjb3VudCAtIDEpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBcnJheSBwaXZvdC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmNhbGN1bGF0b3JcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheT59IGFycjJkIHRhcmdldCAyZCBhcnJheVxuICAgICAqIEByZXR1cm5zIHthcnJheS48YXJyYXk+fSBwaXZvdGVkIDJkIGFycmF5XG4gICAgICovXG4gICAgYXJyYXlQaXZvdDogZnVuY3Rpb24oYXJyMmQpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgICBuZS51dGlsLmZvckVhY2hBcnJheShhcnIyZCwgZnVuY3Rpb24oYXJyKSB7XG4gICAgICAgICAgICBuZS51dGlsLmZvckVhY2hBcnJheShhcnIsIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgICAgICAgIGlmICghcmVzdWx0W2luZGV4XSkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRbaW5kZXhdID0gW107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlc3VsdFtpbmRleF0ucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBjYWxjdWxhdG9yO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IERhdGEgY29udmVydGVyLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2FsY3VsYXRvciA9IHJlcXVpcmUoJy4vY2FsY3VsYXRvci5qcycpO1xuXG52YXIgY29uY2F0ID0gQXJyYXkucHJvdG90eXBlLmNvbmNhdDtcblxuLyoqXG4gKiBEYXRhIGNvbnZlcnRlci5cbiAqIEBtb2R1bGUgZGF0YUNvbnZlcnRlclxuICovXG52YXIgZGF0YUNvbnZlcnRlciA9IHtcbiAgICAvKipcbiAgICAgKiBDb252ZXJ0IHVzZXIgZGF0YS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheT59IHVzZXJEYXRhIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjaGFydE9wdGlvbnMgY2hhcnQgb3B0aW9uXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNoYXJ0VHlwZSBjaGFydCB0eXBlXG4gICAgICogQHJldHVybnMge3tcbiAgICAgKiAgICAgIGxhYmVsczogYXJyYXkuPHN0cmluZz4sXG4gICAgICogICAgICB2YWx1ZXM6IGFycmF5LjxudW1iZXI+LFxuICAgICAqICAgICAgbGVnZW5kTGFiZWxzOiBhcnJheS48c3RyaW5nPixcbiAgICAgKiAgICAgIGZvcm1hdEZ1bmN0aW9uczogYXJyYXkuPGZ1bmN0aW9uPixcbiAgICAgKiAgICAgIGZvcm1hdHRlZFZhbHVlczogYXJyYXkuPHN0cmluZz5cbiAgICAgKiB9fSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqL1xuICAgIGNvbnZlcnQ6IGZ1bmN0aW9uKHVzZXJEYXRhLCBjaGFydE9wdGlvbnMsIGNoYXJ0VHlwZSkge1xuICAgICAgICB2YXIgbGFiZWxzID0gdXNlckRhdGEuY2F0ZWdvcmllcyxcbiAgICAgICAgICAgIHNlcmllc0RhdGEgPSB1c2VyRGF0YS5zZXJpZXMsXG4gICAgICAgICAgICB2YWx1ZXMgPSB0aGlzLl9waWNrVmFsdWVzKHNlcmllc0RhdGEpLFxuICAgICAgICAgICAgam9pblZhbHVlcyA9IHRoaXMuX2pvaW5WYWx1ZXModmFsdWVzKSxcbiAgICAgICAgICAgIGxlZ2VuZExhYmVscyA9IHRoaXMuX3BpY2tMZWdlbmRMYWJlbHMoc2VyaWVzRGF0YSksXG4gICAgICAgICAgICBqb2luTGVnZW5kTGFiZWxzID0gdGhpcy5fam9pbkxlZ2VuZExhYmVscyhsZWdlbmRMYWJlbHMsIGNoYXJ0VHlwZSksXG4gICAgICAgICAgICBmb3JtYXQgPSBjaGFydE9wdGlvbnMgJiYgY2hhcnRPcHRpb25zLmZvcm1hdCB8fCAnJyxcbiAgICAgICAgICAgIGZvcm1hdEZ1bmN0aW9ucyA9IHRoaXMuX2ZpbmRGb3JtYXRGdW5jdGlvbnMoZm9ybWF0KSxcbiAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlcyA9IGZvcm1hdCA/IHRoaXMuX2Zvcm1hdFZhbHVlcyh2YWx1ZXMsIGZvcm1hdEZ1bmN0aW9ucykgOiB2YWx1ZXM7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsYWJlbHM6IGxhYmVscyxcbiAgICAgICAgICAgIHZhbHVlczogdmFsdWVzLFxuICAgICAgICAgICAgam9pblZhbHVlczogam9pblZhbHVlcyxcbiAgICAgICAgICAgIGxlZ2VuZExhYmVsczogbGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgam9pbkxlZ2VuZExhYmVsczogam9pbkxlZ2VuZExhYmVscyxcbiAgICAgICAgICAgIGZvcm1hdEZ1bmN0aW9uczogZm9ybWF0RnVuY3Rpb25zLFxuICAgICAgICAgICAgZm9ybWF0dGVkVmFsdWVzOiBmb3JtYXR0ZWRWYWx1ZXNcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2VwYXJhdGUgbGFiZWwuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXkuPGFycmF5Pj59IHVzZXJEYXRhIHVzZXIgZGF0YVxuICAgICAqIEByZXR1cm5zIHt7bGFiZWxzOiAoYXJyYXkuPHN0cmluZz4pLCBzb3VyY2VEYXRhOiBhcnJheS48YXJyYXkuPGFycmF5Pj59fSByZXN1bHQgZGF0YVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NlcGFyYXRlTGFiZWw6IGZ1bmN0aW9uKHVzZXJEYXRhKSB7XG4gICAgICAgIHZhciBsYWJlbHMgPSB1c2VyRGF0YVswXS5wb3AoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxhYmVsczogbGFiZWxzLFxuICAgICAgICAgICAgc291cmNlRGF0YTogdXNlckRhdGFcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUGljayB2YWx1ZS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge2FycmF5fSBpdGVtcyBpdGVtc1xuICAgICAqIEByZXR1cm5zIHthcnJheX0gcGlja2VkIHZhbHVlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcGlja1ZhbHVlOiBmdW5jdGlvbihpdGVtcykge1xuICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAoW10uY29uY2F0KGl0ZW1zLmRhdGEpLCBwYXJzZUZsb2F0KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUGljayB2YWx1ZXMgZnJvbSBheGlzIGRhdGEuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXk+fSBzZXJpZXNEYXRhIHNlcmllcyBkYXRhXG4gICAgICogQHJldHVybnMge3N0cmluZ1tdfSB2YWx1ZXNcbiAgICAgKi9cbiAgICBfcGlja1ZhbHVlczogZnVuY3Rpb24oc2VyaWVzRGF0YSkge1xuICAgICAgICB2YXIgdmFsdWVzLCByZXN1bHQ7XG4gICAgICAgIGlmIChuZS51dGlsLmlzQXJyYXkoc2VyaWVzRGF0YSkpIHtcbiAgICAgICAgICAgIHZhbHVlcyA9IG5lLnV0aWwubWFwKHNlcmllc0RhdGEsIHRoaXMuX3BpY2tWYWx1ZSwgdGhpcyk7XG4gICAgICAgICAgICByZXN1bHQgPSBjYWxjdWxhdG9yLmFycmF5UGl2b3QodmFsdWVzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHt9O1xuICAgICAgICAgICAgbmUudXRpbC5mb3JFYWNoKHNlcmllc0RhdGEsIGZ1bmN0aW9uKGdyb3VwVmFsdWVzLCB0eXBlKSB7XG4gICAgICAgICAgICAgICAgdmFsdWVzID0gbmUudXRpbC5tYXAoZ3JvdXBWYWx1ZXMsIHRoaXMuX3BpY2tWYWx1ZSwgdGhpcyk7XG4gICAgICAgICAgICAgICAgcmVzdWx0W3R5cGVdID0gY2FsY3VsYXRvci5hcnJheVBpdm90KHZhbHVlcyk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBKb2luIHZhbHVlcy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheT59IHZhbHVlcyB2YWx1ZXNcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPG51bWJlcj59IGpvaW4gdmFsdWVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfam9pblZhbHVlczogZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgIHZhciBqb2luVmFsdWVzO1xuXG4gICAgICAgIGlmIChuZS51dGlsLmlzQXJyYXkodmFsdWVzKSkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlcztcbiAgICAgICAgfVxuXG4gICAgICAgIGpvaW5WYWx1ZXMgPSBuZS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uKGdyb3VwVmFsdWVzKSB7XG4gICAgICAgICAgICByZXR1cm4gZ3JvdXBWYWx1ZXM7XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIHJldHVybiBjb25jYXQuYXBwbHkoW10sIGpvaW5WYWx1ZXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBQaWNrIGxlZ2VuZCBsYWJlbC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gaXRlbSBpdGVtXG4gICAgICogQHJldHVybnMge3N0cmluZ30gbGFiZWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9waWNrTGVnZW5kTGFiZWw6IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuIGl0ZW0ubmFtZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUGljayBsZWdlbmQgbGFiZWxzIGZyb20gYXhpcyBkYXRhLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gc2VyaWVzRGF0YSBzZXJpZXMgZGF0YVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmdbXX0gbGFiZWxzXG4gICAgICovXG4gICAgX3BpY2tMZWdlbmRMYWJlbHM6IGZ1bmN0aW9uKHNlcmllc0RhdGEpIHtcbiAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgaWYgKG5lLnV0aWwuaXNBcnJheShzZXJpZXNEYXRhKSkge1xuICAgICAgICAgICAgcmVzdWx0ID0gbmUudXRpbC5tYXAoc2VyaWVzRGF0YSwgdGhpcy5fcGlja0xlZ2VuZExhYmVsLCB0aGlzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHt9O1xuICAgICAgICAgICAgbmUudXRpbC5mb3JFYWNoKHNlcmllc0RhdGEsIGZ1bmN0aW9uKGdyb3VwVmFsdWVzLCB0eXBlKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W3R5cGVdID0gbmUudXRpbC5tYXAoZ3JvdXBWYWx1ZXMsIHRoaXMuX3BpY2tMZWdlbmRMYWJlbCwgdGhpcyk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBKb2luIGxlZ2VuZCBsYWJlbHMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHthcnJheX0gbGVnZW5kTGFiZWxzIGxlZ2VuZCBsYWJlbHNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY2hhcnRUeXBlIGNoYXJ0IHR5cGVcbiAgICAgKiBAcmV0dXJucyB7YXJyYXl9IGxhYmVsc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2pvaW5MZWdlbmRMYWJlbHM6IGZ1bmN0aW9uKGxlZ2VuZExhYmVscywgY2hhcnRUeXBlKSB7XG4gICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgIGlmIChuZS51dGlsLmlzQXJyYXkobGVnZW5kTGFiZWxzKSkge1xuICAgICAgICAgICAgcmVzdWx0ID0gbmUudXRpbC5tYXAobGVnZW5kTGFiZWxzLCBmdW5jdGlvbihsYWJlbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0VHlwZTogY2hhcnRUeXBlLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogbGFiZWxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQgPSBuZS51dGlsLm1hcChsZWdlbmRMYWJlbHMsIGZ1bmN0aW9uKGxhYmVscywgX2NoYXJ0VHlwZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZS51dGlsLm1hcChsYWJlbHMsIGZ1bmN0aW9uKGxhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGFydFR5cGU6IF9jaGFydFR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogbGFiZWxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgICAgcmVzdWx0ID0gY29uY2F0LmFwcGx5KFtdLCByZXN1bHQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIGZvcm1hdCBncm91cCB2YWx1ZXMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXk+fSBncm91cFZhbHVlcyBncm91cCB2YWx1ZXNcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uW119IGZvcm1hdEZ1bmN0aW9ucyBmb3JtYXQgZnVuY3Rpb25zXG4gICAgICogQHJldHVybnMge3N0cmluZ1tdfSBmb3JtYXR0ZWQgdmFsdWVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZm9ybWF0R3JvdXBWYWx1ZXM6IGZ1bmN0aW9uKGdyb3VwVmFsdWVzLCBmb3JtYXRGdW5jdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIG5lLnV0aWwubWFwKGdyb3VwVmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgICAgIHJldHVybiBuZS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGZucyA9IFt2YWx1ZV0uY29uY2F0KGZvcm1hdEZ1bmN0aW9ucyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwucmVkdWNlKGZucywgZnVuY3Rpb24oc3RvcmVkLCBmbikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZm4oc3RvcmVkKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gZm9ybWF0IGNvbnZlcnRlZCB2YWx1ZXMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXk+fSBjaGFydFZhbHVlcyBjaGFydCB2YWx1ZXNcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uW119IGZvcm1hdEZ1bmN0aW9ucyBmb3JtYXQgZnVuY3Rpb25zXG4gICAgICogQHJldHVybnMge3N0cmluZ1tdfSBmb3JtYXR0ZWQgdmFsdWVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZm9ybWF0VmFsdWVzOiBmdW5jdGlvbihjaGFydFZhbHVlcywgZm9ybWF0RnVuY3Rpb25zKSB7XG4gICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgIGlmIChuZS51dGlsLmlzQXJyYXkoY2hhcnRWYWx1ZXMpKSB7XG4gICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9mb3JtYXRHcm91cFZhbHVlcyhjaGFydFZhbHVlcywgZm9ybWF0RnVuY3Rpb25zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHt9O1xuICAgICAgICAgICAgbmUudXRpbC5mb3JFYWNoKGNoYXJ0VmFsdWVzLCBmdW5jdGlvbihncm91cFZhbHVlcywgY2hhcnRUeXBlKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W2NoYXJ0VHlwZV0gPSB0aGlzLl9mb3JtYXRHcm91cFZhbHVlcyhncm91cFZhbHVlcywgZm9ybWF0RnVuY3Rpb25zKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFBpY2sgbWF4IGxlbmd0aCB1bmRlciBwb2ludC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ1tdfSB2YWx1ZXMgY2hhcnQgdmFsdWVzXG4gICAgICogQHJldHVybnMge251bWJlcn0gbWF4IGxlbmd0aCB1bmRlciBwb2ludFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3BpY2tNYXhMZW5VbmRlclBvaW50OiBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgdmFyIG1heCA9IDA7XG5cbiAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkodmFsdWVzLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIGxlbiA9IG5lLnV0aWwubGVuZ3RoQWZ0ZXJQb2ludCh2YWx1ZSk7XG4gICAgICAgICAgICBpZiAobGVuID4gbWF4KSB7XG4gICAgICAgICAgICAgICAgbWF4ID0gbGVuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICByZXR1cm4gbWF4O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIHplcm8gZmlsbCBmb3JtYXQgb3Igbm90LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmb3JtYXQgZm9ybWF0XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHJlc3VsdCBib29sZWFuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNaZXJvRmlsbDogZnVuY3Rpb24oZm9ybWF0KSB7XG4gICAgICAgIHJldHVybiBmb3JtYXQubGVuZ3RoID4gMiAmJiBmb3JtYXQuY2hhckF0KDApID09PSAnMCc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgZGVjaW1hbCBmb3JtYXQgb3Igbm90LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmb3JtYXQgZm9ybWF0XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHJlc3VsdCBib29sZWFuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNEZWNpbWFsOiBmdW5jdGlvbihmb3JtYXQpIHtcbiAgICAgICAgdmFyIGluZGV4T2YgPSBmb3JtYXQuaW5kZXhPZignLicpO1xuICAgICAgICByZXR1cm4gaW5kZXhPZiA+IC0xICYmIGluZGV4T2YgPCBmb3JtYXQubGVuZ3RoIC0gMTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciBjb21tYSBmb3JtYXQgb3Igbm90LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmb3JtYXQgZm9ybWF0XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHJlc3VsdCBib29sZWFuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNDb21tYTogZnVuY3Rpb24oZm9ybWF0KSB7XG4gICAgICAgIHJldHVybiBmb3JtYXQuaW5kZXhPZignLCcpID09PSBmb3JtYXQuc3BsaXQoJy4nKVswXS5sZW5ndGggLSA0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGb3JtYXQgemVybyBmaWxsLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBsZW4gbGVuZ3RoIG9mIHJlc3VsdFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSB0YXJnZXQgdmFsdWVcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBmb3JtYXR0ZWQgdmFsdWVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9mb3JtYXRaZXJvRmlsbDogZnVuY3Rpb24obGVuLCB2YWx1ZSkge1xuICAgICAgICB2YXIgemVybyA9ICcwJyxcbiAgICAgICAgICAgIGlzTWludXMgPSB2YWx1ZSA8IDA7XG5cbiAgICAgICAgdmFsdWUgPSBNYXRoLmFicyh2YWx1ZSkgKyAnJztcblxuICAgICAgICBpZiAodmFsdWUubGVuZ3RoID49IGxlbikge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgd2hpbGUgKHZhbHVlLmxlbmd0aCA8IGxlbikge1xuICAgICAgICAgICAgdmFsdWUgPSB6ZXJvICsgdmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKGlzTWludXMgPyAnLScgOiAnJykgKyB2YWx1ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRm9ybWF0IERlY2ltYWwuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGxlbiBsZW5ndGggb2YgdW5kZXIgZGVjaW1hbCBwb2ludFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSB0YXJnZXQgdmFsdWVcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBmb3JtYXR0ZWQgdmFsdWVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9mb3JtYXREZWNpbWFsOiBmdW5jdGlvbihsZW4sIHZhbHVlKSB7XG4gICAgICAgIHZhciBwb3c7XG5cbiAgICAgICAgaWYgKGxlbiA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIE1hdGgucm91bmQodmFsdWUsIDEwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHBvdyA9IE1hdGgucG93KDEwLCBsZW4pO1xuICAgICAgICB2YWx1ZSA9IE1hdGgucm91bmQodmFsdWUgKiBwb3cpIC8gcG93O1xuICAgICAgICB2YWx1ZSA9IHBhcnNlRmxvYXQodmFsdWUpLnRvRml4ZWQobGVuKTtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGb3JtYXQgQ29tbWEuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlIHRhcmdldCB2YWx1ZVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGZvcm1hdHRlZCB2YWx1ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2Zvcm1hdENvbW1hOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICB2YXIgY29tbWEgPSAnLCcsXG4gICAgICAgICAgICB1bmRlclBvaW50VmFsdWUgPSAnJyxcbiAgICAgICAgICAgIHZhbHVlcztcblxuICAgICAgICB2YWx1ZSArPSAnJztcblxuICAgICAgICBpZiAodmFsdWUuaW5kZXhPZignLicpID4gLTEpIHtcbiAgICAgICAgICAgIHZhbHVlcyA9IHZhbHVlLnNwbGl0KCcuJyk7XG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlc1swXTtcbiAgICAgICAgICAgIHVuZGVyUG9pbnRWYWx1ZSA9ICcuJyArIHZhbHVlc1sxXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh2YWx1ZS5sZW5ndGggPCA0KSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUgKyB1bmRlclBvaW50VmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICB2YWx1ZXMgPSAodmFsdWUpLnNwbGl0KCcnKS5yZXZlcnNlKCk7XG4gICAgICAgIHZhbHVlcyA9IG5lLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24oY2hhciwgaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBbY2hhcl07XG4gICAgICAgICAgICBpZiAoKGluZGV4ICsgMSkgJSAzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goY29tbWEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGNvbmNhdC5hcHBseShbXSwgdmFsdWVzKS5yZXZlcnNlKCkuam9pbignJykgKyB1bmRlclBvaW50VmFsdWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZpbmQgZm9ybWF0IGZ1bmN0aW9ucy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZm9ybWF0IGZvcm1hdFxuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IHZhbHVlcyBjaGFydCB2YWx1ZXNcbiAgICAgKiBAcmV0dXJucyB7ZnVuY3Rpb25bXX0gZnVuY3Rpb25zXG4gICAgICovXG4gICAgX2ZpbmRGb3JtYXRGdW5jdGlvbnM6IGZ1bmN0aW9uKGZvcm1hdCkge1xuICAgICAgICB2YXIgZnVuY3MgPSBbXSxcbiAgICAgICAgICAgIGxlbjtcblxuICAgICAgICBpZiAoIWZvcm1hdCkge1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2lzRGVjaW1hbChmb3JtYXQpKSB7XG4gICAgICAgICAgICBsZW4gPSB0aGlzLl9waWNrTWF4TGVuVW5kZXJQb2ludChbZm9ybWF0XSk7XG4gICAgICAgICAgICBmdW5jcyA9IFtuZS51dGlsLmJpbmQodGhpcy5fZm9ybWF0RGVjaW1hbCwgdGhpcywgbGVuKV07XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5faXNaZXJvRmlsbChmb3JtYXQpKSB7XG4gICAgICAgICAgICBsZW4gPSBmb3JtYXQubGVuZ3RoO1xuICAgICAgICAgICAgZnVuY3MgPSBbbmUudXRpbC5iaW5kKHRoaXMuX2Zvcm1hdFplcm9GaWxsLCB0aGlzLCBsZW4pXTtcbiAgICAgICAgICAgIHJldHVybiBmdW5jcztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9pc0NvbW1hKGZvcm1hdCkpIHtcbiAgICAgICAgICAgIGZ1bmNzLnB1c2godGhpcy5fZm9ybWF0Q29tbWEpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZ1bmNzO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZGF0YUNvbnZlcnRlcjtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBET00gSGFuZGxlci5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBET00gSGFuZGxlci5cbiAqIEBtb2R1bGUgZG9tSGFuZGxlclxuICovXG52YXIgZG9tSGFuZGxlciA9IHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgZWxlbWVudC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRvbUhhbmRsZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGFnIGh0bWwgdGFnXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5ld0NsYXNzIGNsYXNzIG5hbWVcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IGNyZWF0ZWQgZWxlbWVudFxuICAgICAqL1xuICAgIGNyZWF0ZTogZnVuY3Rpb24odGFnLCBuZXdDbGFzcykge1xuICAgICAgICB2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZyk7XG5cbiAgICAgICAgaWYgKG5ld0NsYXNzKSB7XG4gICAgICAgICAgICB0aGlzLmFkZENsYXNzKGVsLCBuZXdDbGFzcyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjbGFzcyBuYW1lcy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRvbUhhbmRsZXJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqIEByZXR1cm5zIHthcnJheX0gbmFtZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRDbGFzc05hbWVzOiBmdW5jdGlvbihlbCkge1xuICAgICAgICB2YXIgY2xhc3NOYW1lID0gZWwuY2xhc3NOYW1lIHx8ICcnLFxuICAgICAgICAgICAgY2xhc3NOYW1lcyA9IGNsYXNzTmFtZSA/IGNsYXNzTmFtZS5zcGxpdCgnICcpIDogW107XG4gICAgICAgIHJldHVybiBjbGFzc05hbWVzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgY3NzIGNsYXNzIHRvIHRhcmdldCBlbGVtZW50LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZG9tSGFuZGxlclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5ld0NsYXNzIGFkZCBjbGFzcyBuYW1lXG4gICAgICovXG4gICAgYWRkQ2xhc3M6IGZ1bmN0aW9uKGVsLCBuZXdDbGFzcykge1xuICAgICAgICB2YXIgY2xhc3NOYW1lcyA9IHRoaXMuX2dldENsYXNzTmFtZXMoZWwpLFxuICAgICAgICAgICAgaW5kZXggPSBuZS51dGlsLmluQXJyYXkobmV3Q2xhc3MsIGNsYXNzTmFtZXMpO1xuXG4gICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjbGFzc05hbWVzLnB1c2gobmV3Q2xhc3MpO1xuICAgICAgICBlbC5jbGFzc05hbWUgPSBjbGFzc05hbWVzLmpvaW4oJyAnKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIGNzcyBjbGFzcyBmcm9tIHRhcmdldCBlbGVtZW50LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZG9tSGFuZGxlclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHJtQ2xhc3MgcmVtb3ZlIGNsYXNzIG5hbWVcbiAgICAgKi9cbiAgICByZW1vdmVDbGFzczogZnVuY3Rpb24oZWwsIHJtQ2xhc3MpIHtcbiAgICAgICAgdmFyIGNsYXNzTmFtZXMgPSB0aGlzLl9nZXRDbGFzc05hbWVzKGVsKSxcbiAgICAgICAgICAgIGluZGV4ID0gbmUudXRpbC5pbkFycmF5KHJtQ2xhc3MsIGNsYXNzTmFtZXMpO1xuXG4gICAgICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNsYXNzTmFtZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgZWwuY2xhc3NOYW1lID0gY2xhc3NOYW1lcy5qb2luKCcgJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgY2xhc3MgZXhpc3Qgb3Igbm90LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZG9tSGFuZGxlclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZpbmRDbGFzcyB0YXJnZXQgY3NzIGNsYXNzXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IGhhcyBjbGFzc1xuICAgICAqL1xuICAgIGhhc0NsYXNzOiBmdW5jdGlvbihlbCwgZmluZENsYXNzKSB7XG4gICAgICAgIHZhciBjbGFzc05hbWVzID0gdGhpcy5fZ2V0Q2xhc3NOYW1lcyhlbCksXG4gICAgICAgICAgICBpbmRleCA9IG5lLnV0aWwuaW5BcnJheShmaW5kQ2xhc3MsIGNsYXNzTmFtZXMpO1xuICAgICAgICByZXR1cm4gaW5kZXggPiAtMTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmluZCBwYXJlbnQgYnkgY2xhc3MgbmFtZS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRvbUhhbmRsZXJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjbGFzc05hbWUgdGFyZ2V0IGNzcyBjbGFzc1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBsYXN0Q2xhc3MgbGFzdCBjc3MgY2xhc3NcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHJlc3VsdCBlbGVtZW50XG4gICAgICovXG4gICAgZmluZFBhcmVudEJ5Q2xhc3M6IGZ1bmN0aW9uKGVsLCBjbGFzc05hbWUsIGxhc3RDbGFzcykge1xuICAgICAgICB2YXIgcGFyZW50ID0gZWwucGFyZW50Tm9kZTtcbiAgICAgICAgaWYgKCFwYXJlbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaGFzQ2xhc3MocGFyZW50LCBjbGFzc05hbWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gcGFyZW50O1xuICAgICAgICB9IGVsc2UgaWYgKHBhcmVudC5ub2RlTmFtZSA9PT0gJ0JPRFknIHx8IHRoaXMuaGFzQ2xhc3MocGFyZW50LCBsYXN0Q2xhc3MpKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbmRQYXJlbnRCeUNsYXNzKHBhcmVudCwgY2xhc3NOYW1lLCBsYXN0Q2xhc3MpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFwcGVuZCBjaGlsZCBlbGVtZW50LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZG9tSGFuZGxlclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciBjb250YWluZXIgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNoaWxkcmVuIGNoaWxkIGVsZW1lbnRcbiAgICAgKi9cbiAgICBhcHBlbmQ6IGZ1bmN0aW9uKGNvbnRhaW5lciwgY2hpbGRyZW4pIHtcbiAgICAgICAgaWYgKCFjb250YWluZXIgfHwgIWNoaWxkcmVuKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY2hpbGRyZW4gPSBuZS51dGlsLmlzQXJyYXkoY2hpbGRyZW4pID8gY2hpbGRyZW4gOiBbY2hpbGRyZW5dO1xuXG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KGNoaWxkcmVuLCBmdW5jdGlvbihjaGlsZCkge1xuICAgICAgICAgICAgaWYgKCFjaGlsZCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChjaGlsZCk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZG9tSGFuZGxlcjtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBFdmVudCBsaXN0ZW5lci5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBFdmVudCBsaXN0ZW5lci5cbiAqIEBtb2R1bGUgZXZlbnRMaXN0ZW5lclxuICovXG52YXIgZXZlbnRMaXN0ZW5lciA9IHtcbiAgICAvKipcbiAgICAgKiBFdmVudCBsaXN0ZW5lciBmb3IgSUUuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpldmVudExpc3RlbmVyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZSBldmVudCBuYW1lXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayBjYWxsYmFjayBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2F0dGFjaEV2ZW50OiBmdW5jdGlvbiAoZXZlbnROYW1lLCBlbCwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PSBcIm9iamVjdFwiICYmIGNhbGxiYWNrLmhhbmRsZUV2ZW50KSB7XG4gICAgICAgICAgICBlbC5hdHRhY2hFdmVudChcIm9uXCIgKyBldmVudE5hbWUsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjay5oYW5kbGVFdmVudC5jYWxsKGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZWwuYXR0YWNoRXZlbnQoXCJvblwiICsgZXZlbnROYW1lLCBjYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXZlbnQgbGlzdGVuZXIgZm9yIG90aGVyIGJyb3dzZXJzLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZXZlbnRMaXN0ZW5lclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudE5hbWUgZXZlbnQgbmFtZVxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hZGRFdmVudExpc3RlbmVyOiBmdW5jdGlvbiAoZXZlbnROYW1lLCBlbCwgY2FsbGJhY2spIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBjYWxsYmFjayk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT0gXCJvYmplY3RcIiAmJiBjYWxsYmFjay5oYW5kbGVFdmVudCkge1xuICAgICAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suaGFuZGxlRXZlbnQuY2FsbChjYWxsYmFjaywgZXZlbnQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBCaW5kIGV2ZW50IGZ1bmN0aW9uLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZXZlbnRMaXN0ZW5lclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudE5hbWUgZXZlbnQgbmFtZVxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgKi9cbiAgICBiaW5kRXZlbnQ6IGZ1bmN0aW9uIChldmVudE5hbWUsIGVsLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgYmluZEV2ZW50O1xuICAgICAgICBpZiAoXCJhZGRFdmVudExpc3RlbmVyXCIgaW4gZWwpIHtcbiAgICAgICAgICAgIGJpbmRFdmVudCA9IHRoaXMuX2FkZEV2ZW50TGlzdGVuZXI7XG4gICAgICAgIH0gZWxzZSBpZiAoXCJhdHRhY2hFdmVudFwiIGluIGVsKSB7XG4gICAgICAgICAgICBiaW5kRXZlbnQgPSB0aGlzLl9hdHRhY2hFdmVudDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmJpbmRFdmVudCA9IGJpbmRFdmVudDtcbiAgICAgICAgYmluZEV2ZW50KGV2ZW50TmFtZSwgZWwsIGNhbGxiYWNrKTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV2ZW50TGlzdGVuZXI7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgVXRpbCBmb3IgcmVuZGVyaW5nLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZG9tID0gcmVxdWlyZSgnLi9kb21IYW5kbGVyJyksXG4gICAgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4vLi4vY29uc3QuanMnKTtcblxudmFyIGJyb3dzZXIgPSBuZS51dGlsLmJyb3dzZXIsXG4gICAgaXNJRTggPSBicm93c2VyLm1zaWUgJiYgYnJvd3Nlci52ZXJzaW9uID09PSA4O1xuXG4vKipcbiAqIFV0aWwgZm9yIHJlbmRlcmluZy5cbiAqIEBtb2R1bGUgcmVuZGVyVXRpbFxuICovXG52YXIgcmVuZGVyVXRpbCA9IHtcbiAgICAvKipcbiAgICAgKiBDb25jYXQgc3RyaW5nLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6cmVuZGVyVXRpbFxuICAgICAqIEBwYXJhbXMgey4uLnN0cmluZ30gdGFyZ2V0IHN0cmluZ3NcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBjb25jYXQgc3RyaW5nXG4gICAgICovXG4gICAgY29uY2F0U3RyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIFN0cmluZy5wcm90b3R5cGUuY29uY2F0LmFwcGx5KCcnLCBhcmd1bWVudHMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGNzc1RleHQgZm9yIGZvbnQuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpyZW5kZXJVdGlsXG4gICAgICogQHBhcmFtIHt7Zm9udFNpemU6IG51bWJlciwgZm9udEZhbWlseTogc3RyaW5nLCBjb2xvcjogc3RyaW5nfX0gdGhlbWUgZm9udCB0aGVtZVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGNzc1RleHRcbiAgICAgKi9cbiAgICBtYWtlRm9udENzc1RleHQ6IGZ1bmN0aW9uKHRoZW1lKSB7XG4gICAgICAgIHZhciBjc3NUZXh0cyA9IFtdO1xuXG4gICAgICAgIGlmICghdGhlbWUpIHtcbiAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGVtZS5mb250U2l6ZSkge1xuICAgICAgICAgICAgY3NzVGV4dHMucHVzaCh0aGlzLmNvbmNhdFN0cignZm9udC1zaXplOicsIHRoZW1lLmZvbnRTaXplLCAncHgnKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhlbWUuZm9udEZhbWlseSkge1xuICAgICAgICAgICAgY3NzVGV4dHMucHVzaCh0aGlzLmNvbmNhdFN0cignZm9udC1mYW1pbHk6JywgdGhlbWUuZm9udEZhbWlseSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoZW1lLmNvbG9yKSB7XG4gICAgICAgICAgICBjc3NUZXh0cy5wdXNoKHRoaXMuY29uY2F0U3RyKCdjb2xvcjonLCB0aGVtZS5jb2xvcikpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNzc1RleHRzLmpvaW4oJzsnKTtcbiAgICB9LFxuXG4gICAgY2hlY2tFbDogbnVsbCxcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgZWxlbWVudCBmb3Igc2l6ZSBjaGVjay5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOnJlbmRlclV0aWxcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jcmVhdGVTaXplQ2hlY2tFbDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBlbERpdiwgZWxTcGFuO1xuICAgICAgICBpZiAodGhpcy5jaGVja0VsKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVja0VsO1xuICAgICAgICB9XG5cbiAgICAgICAgZWxEaXYgPSBkb20uY3JlYXRlKCdESVYnLCAnbmUtY2hhcnQtc2l6ZS1jaGVjay1lbGVtZW50Jyk7XG4gICAgICAgIGVsU3BhbiA9IGRvbS5jcmVhdGUoJ1NQQU4nKTtcblxuICAgICAgICBlbERpdi5hcHBlbmRDaGlsZChlbFNwYW4pO1xuICAgICAgICB0aGlzLmNoZWNrRWwgPSBlbERpdjtcbiAgICAgICAgcmV0dXJuIGVsRGl2O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgcmVuZGVyZWQgbGFiZWwgc2l6ZSAod2lkdGggb3IgaGVpZ2h0KS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOnJlbmRlclV0aWxcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbGFiZWwgbGFiZWxcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgdGhlbWVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gb2Zmc2V0VHlwZSBvZmZzZXQgdHlwZSAob2Zmc2V0V2lkdGggb3Igb2Zmc2V0SGVpZ2h0KVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IHNpemVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRSZW5kZXJlZExhYmVsU2l6ZTogZnVuY3Rpb24obGFiZWwsIHRoZW1lLCBvZmZzZXRUeXBlKSB7XG4gICAgICAgIHZhciBlbERpdiwgZWxTcGFuLCBsYWJlbFNpemU7XG5cbiAgICAgICAgaWYgKG5lLnV0aWwuaXNVbmRlZmluZWQobGFiZWwpIHx8IGxhYmVsID09PSAnJykge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cblxuICAgICAgICBlbERpdiA9IHRoaXMuX2NyZWF0ZVNpemVDaGVja0VsKCk7XG4gICAgICAgIGVsU3BhbiA9IGVsRGl2LmZpcnN0Q2hpbGQ7XG5cbiAgICAgICAgdGhlbWUgPSB0aGVtZSB8fCB7fTtcbiAgICAgICAgZWxTcGFuLmlubmVySFRNTCA9IGxhYmVsO1xuICAgICAgICBlbFNwYW4uc3R5bGUuZm9udFNpemUgPSAodGhlbWUuZm9udFNpemUgfHwgY2hhcnRDb25zdC5ERUZBVUxUX0xBQkVMX0ZPTlRfU0laRSkgKyAncHgnO1xuXG4gICAgICAgIGlmICh0aGVtZS5mb250RmFtaWx5KSB7XG4gICAgICAgICAgICBlbFNwYW4uc3R5bGUucGFkZGluZyA9IDA7XG4gICAgICAgICAgICBlbFNwYW4uc3R5bGUuZm9udEZhbWlseSA9IHRoZW1lLmZvbnRGYW1pbHk7XG4gICAgICAgIH1cblxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGVsRGl2KTtcbiAgICAgICAgbGFiZWxTaXplID0gZWxTcGFuW29mZnNldFR5cGVdO1xuICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGVsRGl2KTtcbiAgICAgICAgcmV0dXJuIGxhYmVsU2l6ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHJlbmRlcmVkIGxhYmVsIHdpZHRoLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6cmVuZGVyVXRpbFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBsYWJlbCBsYWJlbFxuICAgICAqIEBwYXJhbSB7e2ZvbnRTaXplOiBudW1iZXIsIGZvbnRGYW1pbHk6IHN0cmluZywgY29sb3I6IHN0cmluZ319IHRoZW1lIGxhYmVsIHRoZW1lXG4gICAgICogQHJldHVybnMge251bWJlcn0gd2lkdGhcbiAgICAgKi9cbiAgICBnZXRSZW5kZXJlZExhYmVsV2lkdGg6IGZ1bmN0aW9uKGxhYmVsLCB0aGVtZSkge1xuICAgICAgICB2YXIgbGFiZWxXaWR0aCA9IHRoaXMuX2dldFJlbmRlcmVkTGFiZWxTaXplKGxhYmVsLCB0aGVtZSwgJ29mZnNldFdpZHRoJyk7XG4gICAgICAgIHJldHVybiBsYWJlbFdpZHRoO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgcmVuZGVyZWQgbGFiZWwgaGVpZ2h0LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6cmVuZGVyVXRpbFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBsYWJlbCBsYWJlbFxuICAgICAqIEBwYXJhbSB7e2ZvbnRTaXplOiBudW1iZXIsIGZvbnRGYW1pbHk6IHN0cmluZywgY29sb3I6IHN0cmluZ319IHRoZW1lIGxhYmVsIHRoZW1lXG4gICAgICogQHJldHVybnMge251bWJlcn0gaGVpZ2h0XG4gICAgICovXG4gICAgZ2V0UmVuZGVyZWRMYWJlbEhlaWdodDogZnVuY3Rpb24obGFiZWwsIHRoZW1lKSB7XG4gICAgICAgIHZhciBsYWJlbEhlaWdodCA9IHRoaXMuX2dldFJlbmRlcmVkTGFiZWxTaXplKGxhYmVsLCB0aGVtZSwgJ29mZnNldEhlaWdodCcpO1xuICAgICAgICByZXR1cm4gbGFiZWxIZWlnaHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBkaW1lbnNpb24uXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpyZW5kZXJVdGlsXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGRpbWVuc2lvbiBkaW1lbnNpb25cbiAgICAgKi9cbiAgICByZW5kZXJEaW1lbnNpb246IGZ1bmN0aW9uKGVsLCBkaW1lbnNpb24pIHtcbiAgICAgICAgZWwuc3R5bGUuY3NzVGV4dCA9IFtcbiAgICAgICAgICAgIHRoaXMuY29uY2F0U3RyKCd3aWR0aDonLCBkaW1lbnNpb24ud2lkdGgsICdweCcpLFxuICAgICAgICAgICAgdGhpcy5jb25jYXRTdHIoJ2hlaWdodDonLCBkaW1lbnNpb24uaGVpZ2h0LCAncHgnKVxuICAgICAgICBdLmpvaW4oJzsnKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIHBvc2l0aW9uKHRvcCwgcmlnaHQpLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6cmVuZGVyVXRpbFxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHBhcmFtIHt7dG9wOiBudW1iZXIsIGxlZnQ6IG51bWJlciwgcmlnaHQ6IG51bWJlcn19IHBvc2l0aW9uIHBvc2l0aW9uXG4gICAgICovXG4gICAgcmVuZGVyUG9zaXRpb246IGZ1bmN0aW9uKGVsLCBwb3NpdGlvbikge1xuICAgICAgICBpZiAobmUudXRpbC5pc1VuZGVmaW5lZChwb3NpdGlvbikpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwb3NpdGlvbi50b3ApIHtcbiAgICAgICAgICAgIGVsLnN0eWxlLnRvcCA9IHBvc2l0aW9uLnRvcCArICdweCc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocG9zaXRpb24ubGVmdCkge1xuICAgICAgICAgICAgZWwuc3R5bGUubGVmdCA9IHBvc2l0aW9uLmxlZnQgKyAncHgnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBvc2l0aW9uLnJpZ2h0KSB7XG4gICAgICAgICAgICBlbC5zdHlsZS5yaWdodCA9IHBvc2l0aW9uLnJpZ2h0ICsgJ3B4JztcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgYmFja2dyb3VuZC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOnJlbmRlclV0aWxcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBiYWNrZ3JvdW5kIGJhY2tncm91bmQgb3B0aW9uXG4gICAgICovXG4gICAgcmVuZGVyQmFja2dyb3VuZDogZnVuY3Rpb24oZWwsIGJhY2tncm91bmQpIHtcbiAgICAgICAgaWYgKCFiYWNrZ3JvdW5kKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBlbC5zdHlsZS5iYWNrZ3JvdW5kID0gYmFja2dyb3VuZDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGZvbnQgZmFtaWx5LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6cmVuZGVyVXRpbFxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZvbnRGYW1pbHkgZm9udCBmYW1pbHkgb3B0aW9uXG4gICAgICovXG4gICAgcmVuZGVyRm9udEZhbWlseTogZnVuY3Rpb24oZWwsIGZvbnRGYW1pbHkpIHtcbiAgICAgICAgaWYgKCFmb250RmFtaWx5KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBlbC5zdHlsZS5mb250RmFtaWx5ID0gZm9udEZhbWlseTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIHRpdGxlLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6cmVuZGVyVXRpbFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0aXRsZSB0aXRsZVxuICAgICAqIEBwYXJhbSB7e2ZvbnRTaXplOiBudW1iZXIsIGNvbG9yOiBzdHJpbmcsIGJhY2tncm91bmQ6IHN0cmluZ319IHRoZW1lIHRpdGxlIHRoZW1lXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNsYXNzTmFtZSBjc3MgY2xhc3MgbmFtZVxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gdGl0bGUgZWxlbWVudFxuICAgICAqL1xuICAgIHJlbmRlclRpdGxlOiBmdW5jdGlvbih0aXRsZSwgdGhlbWUsIGNsYXNzTmFtZSkge1xuICAgICAgICB2YXIgZWxUaXRsZSwgY3NzVGV4dDtcblxuICAgICAgICBpZiAoIXRpdGxlKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGVsVGl0bGUgPSBkb20uY3JlYXRlKCdESVYnLCBjbGFzc05hbWUpO1xuICAgICAgICBlbFRpdGxlLmlubmVySFRNTCA9IHRpdGxlO1xuXG4gICAgICAgIGNzc1RleHQgPSByZW5kZXJVdGlsLm1ha2VGb250Q3NzVGV4dCh0aGVtZSk7XG5cbiAgICAgICAgaWYgKHRoZW1lLmJhY2tncm91bmQpIHtcbiAgICAgICAgICAgIGNzc1RleHQgKz0gJzsnICsgdGhpcy5jb25jYXRTdHIoJ2JhY2tncm91bmQ6JywgdGhlbWUuYmFja2dyb3VuZCk7XG4gICAgICAgIH1cblxuICAgICAgICBlbFRpdGxlLnN0eWxlLmNzc1RleHQgPSBjc3NUZXh0O1xuXG4gICAgICAgIHJldHVybiBlbFRpdGxlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIElFOCBvciBub3QuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpyZW5kZXJVdGlsXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHJlc3VsdCBib29sZWFuXG4gICAgICovXG4gICAgaXNJRTg6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gaXNJRTg7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSByZW5kZXJVdGlsO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFRoaXMgaXMgdGVtcGxhdGUgbWFrZXIuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIC8qKlxuICAgICAqIFRoaXMgaXMgdGVtcGxhdGUgbWFrZXIuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGh0bWwgaHRtbFxuICAgICAqIEByZXR1cm5zIHtmdW5jdGlvbn0gdGVtcGxhdGUgZnVuY3Rpb25cbiAgICAgKiBAZWF4bXBsZVxuICAgICAqXG4gICAgICogICB2YXIgdGVtcGxhdGUgPSB0ZW1wbGF0ZU1ha2VyLnRlbXBsYXRlKCc8c3Bhbj57eyBuYW1lIH19PC9zcGFuPicpLFxuICAgICAqICAgICAgIHJlc3VsdCA9IHRlbXBsYXRlKHtuYW1lOiAnSm9obicpO1xuICAgICAqICAgY29uc29sZS5sb2cocmVzdWx0KTsgLy8gPHNwYW4+Sm9objwvc3Bhbj5cbiAgICAgKlxuICAgICAqL1xuICAgIHRlbXBsYXRlOiBmdW5jdGlvbiAoaHRtbCkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBodG1sO1xuICAgICAgICAgICAgbmUudXRpbC5mb3JFYWNoKGRhdGEsIGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlZ0V4cCA9IG5ldyBSZWdFeHAoJ3t7XFxcXHMqJyArIGtleSArICdcXFxccyp9fScsICdnJyk7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UocmVnRXhwLCB2YWx1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgfVxufTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyAgTGVnZW5kIGNvbXBvbmVudC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuLi9jb25zdC5qcycpLFxuICAgIGRvbSA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZG9tSGFuZGxlci5qcycpLFxuICAgIHJlbmRlclV0aWwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3JlbmRlclV0aWwuanMnKSxcbiAgICBkZWZhdWx0VGhlbWUgPSByZXF1aXJlKCcuLi90aGVtZXMvZGVmYXVsdFRoZW1lLmpzJyksXG4gICAgbGVnZW5kVGVtcGxhdGUgPSByZXF1aXJlKCcuLy4uL2xlZ2VuZHMvbGVnZW5kVGVtcGxhdGUuanMnKTtcblxudmFyIExFR0VORF9SRUNUX1dJRFRIID0gMTIsXG4gICAgTEFCRUxfUEFERElOR19UT1AgPSAyLFxuICAgIExJTkVfTUFSR0lOX1RPUCA9IDU7XG5cbnZhciBMZWdlbmQgPSBuZS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgTGVnZW5kLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogTGVnZW5kIGNvbXBvbmVudC5cbiAgICAgKiBAY29uc3RydWN0cyBMZWdlbmRcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubGVnZW5kTGFiZWxzIGxlZ2VuZCBsYWJlbHNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuYm91bmQgYXhpcyBib3VuZFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBheGlzIHRoZW1lXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIG5lLnV0aWwuZXh0ZW5kKHRoaXMsIHBhcmFtcyk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBMZWdlbmQgdmlldyBjbGFzc05hbWVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2xhc3NOYW1lID0gJ25lLWNoYXJ0LWxlZ2VuZC1hcmVhJztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGxlZ2VuZC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYm91bmQgcGxvdCBib3VuZFxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gbGVnZW5kIGVsZW1lbnRcbiAgICAgKi9cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZWwgPSBkb20uY3JlYXRlKCdESVYnLCB0aGlzLmNsYXNzTmFtZSk7XG4gICAgICAgIGVsLmlubmVySFRNTCA9IHRoaXMuX21ha2VMZWdlbmRIdG1sKCk7XG4gICAgICAgIHJlbmRlclV0aWwucmVuZGVyUG9zaXRpb24oZWwsIHRoaXMuYm91bmQucG9zaXRpb24pO1xuICAgICAgICB0aGlzLl9yZW5kZXJMYWJlbFRoZW1lKGVsLCB0aGlzLnRoZW1lLmxhYmVsKTtcblxuICAgICAgICByZXR1cm4gZWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCB0aGVtZSBmb3IgbGVnZW5kIGxhYmVsc1xuICAgICAqIEBwYXJhbSB7YXJyYXkuPG9iamVjdD59IGxhYmVscyBsYWJlbHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgbGVnZW5kIHRoZW1lXG4gICAgICogQHJldHVybnMge2FycmF5LjxvYmplY3Q+fSBsYWJlbHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRUaGVtZUZvckxhYmVsczogZnVuY3Rpb24obGFiZWxzLCB0aGVtZSkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gbmUudXRpbC5tYXAobGFiZWxzLCBmdW5jdGlvbihpdGVtLCBpbmRleCkge1xuICAgICAgICAgICAgdmFyIGl0ZW1UaGVtZSA9IHtcbiAgICAgICAgICAgICAgICBjb2xvcjogdGhlbWUuY29sb3JzW2luZGV4XVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKHRoZW1lLnNpbmdsZUNvbG9ycykge1xuICAgICAgICAgICAgICAgIGl0ZW1UaGVtZS5zaW5nbGVDb2xvciA9IHRoZW1lLnNpbmdsZUNvbG9yc1tpbmRleF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhlbWUuYm9yZGVyQ29sb3IpIHtcbiAgICAgICAgICAgICAgICBpdGVtVGhlbWUuYm9yZGVyQ29sb3IgPSB0aGVtZS5ib3JkZXJDb2xvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGl0ZW0udGhlbWUgPSBpdGVtVGhlbWU7XG4gICAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBsZWdlbmQgbGFiZWxzLlxuICAgICAqIEByZXR1cm5zIHthcnJheS48b2JqZWN0Pn0gbGVnZW5kIGxhYmVscy5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlTGVnZW5kTGFiZWxzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNoYXJ0VHlwZSA9IHRoaXMuY2hhcnRUeXBlLFxuICAgICAgICAgICAgbGVnZW5kTGFiZWxzID0gdGhpcy5sZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICBqb2luTGVnZW5kTGFiZWxzID0gdGhpcy5qb2luTGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgbGFiZWxMZW4gPSBsZWdlbmRMYWJlbHMubGVuZ3RoLFxuICAgICAgICAgICAgdGhlbWUgPSB0aGlzLnRoZW1lLFxuICAgICAgICAgICAgY2hhcnRMZWdlbmRUaGVtZSA9IG5lLnV0aWwuZmlsdGVyKHRoZW1lLCBmdW5jdGlvbihpdGVtLCBuYW1lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwuaW5BcnJheShuYW1lLCBjaGFydENvbnN0LlNFUklFU19QUk9QUykgPT09IC0xICYmIG5hbWUgIT09ICdsYWJlbCc7XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGNoYXJ0VHlwZXMgPSBuZS51dGlsLmtleXMoY2hhcnRMZWdlbmRUaGVtZSksXG4gICAgICAgICAgICBkZWZhdWx0TGVnZW5kVGhlbWUgPSB7XG4gICAgICAgICAgICAgICAgY29sb3JzOiBkZWZhdWx0VGhlbWUuc2VyaWVzLmNvbG9yc1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNoYXJ0VGhlbWUsIHJlc3VsdDtcblxuICAgICAgICBpZiAoIWNoYXJ0VHlwZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9zZXRUaGVtZUZvckxhYmVscyhqb2luTGVnZW5kTGFiZWxzLCB0aGVtZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjaGFydFRoZW1lID0gdGhlbWVbY2hhcnRUeXBlXSB8fCBkZWZhdWx0TGVnZW5kVGhlbWU7XG4gICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9zZXRUaGVtZUZvckxhYmVscyhqb2luTGVnZW5kTGFiZWxzLnNsaWNlKDAsIGxhYmVsTGVuKSwgY2hhcnRUaGVtZSk7XG4gICAgICAgICAgICBjaGFydFRoZW1lID0gdGhlbWVbbmUudXRpbC5maWx0ZXIoY2hhcnRUeXBlcywgZnVuY3Rpb24ocHJvcE5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvcE5hbWUgIT09IGNoYXJ0VHlwZTtcbiAgICAgICAgICAgIH0pWzBdXSB8fCBkZWZhdWx0TGVnZW5kVGhlbWU7XG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KHRoaXMuX3NldFRoZW1lRm9yTGFiZWxzKGpvaW5MZWdlbmRMYWJlbHMuc2xpY2UobGFiZWxMZW4pLCBjaGFydFRoZW1lKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBsZWdlbmQgaHRtbC5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBsZWdlbmQgaHRtbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VMZWdlbmRIdG1sOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGxhYmVscyA9IHRoaXMuX21ha2VMZWdlbmRMYWJlbHMoKSxcbiAgICAgICAgICAgIHRlbXBsYXRlID0gbGVnZW5kVGVtcGxhdGUudHBsTGVnZW5kLFxuICAgICAgICAgICAgbGFiZWxIZWlnaHQgPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxIZWlnaHQobGFiZWxzWzBdLmxhYmVsLCBsYWJlbHNbMF0udGhlbWUpICsgKExBQkVMX1BBRERJTkdfVE9QICogMiksXG4gICAgICAgICAgICBiYXNlTWFyZ2luVG9wID0gcGFyc2VJbnQoKGxhYmVsSGVpZ2h0IC0gTEVHRU5EX1JFQ1RfV0lEVEgpIC8gMiwgMTApIC0gMSxcbiAgICAgICAgICAgIGh0bWwgPSBuZS51dGlsLm1hcChsYWJlbHMsIGZ1bmN0aW9uKGxhYmVsKSB7XG4gICAgICAgICAgICAgICAgdmFyIGJvcmRlckNzc1RleHQgPSBsYWJlbC5ib3JkZXJDb2xvciA/IHJlbmRlclV0aWwuY29uY2F0U3RyKCc7Ym9yZGVyOjFweCBzb2xpZCAnLCBsYWJlbC5ib3JkZXJDb2xvcikgOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgcmVjdE1hcmdpbiwgbWFyZ2luVG9wLCBkYXRhO1xuICAgICAgICAgICAgICAgIGlmIChsYWJlbC5jaGFydFR5cGUgPT09ICdsaW5lJykge1xuICAgICAgICAgICAgICAgICAgICBtYXJnaW5Ub3AgPSBiYXNlTWFyZ2luVG9wICsgTElORV9NQVJHSU5fVE9QO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG1hcmdpblRvcCA9IGJhc2VNYXJnaW5Ub3A7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlY3RNYXJnaW4gPSByZW5kZXJVdGlsLmNvbmNhdFN0cignO21hcmdpbi10b3A6JywgbWFyZ2luVG9wLCAncHgnKTtcblxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIGNzc1RleHQ6IHJlbmRlclV0aWwuY29uY2F0U3RyKCdiYWNrZ3JvdW5kLWNvbG9yOicsIGxhYmVsLnRoZW1lLnNpbmdsZUNvbG9yIHx8IGxhYmVsLnRoZW1lLmNvbG9yLCBib3JkZXJDc3NUZXh0LCByZWN0TWFyZ2luKSxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBsYWJlbEhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgY2hhcnRUeXBlOiBsYWJlbC5jaGFydFR5cGUgfHwgJ3JlY3QnLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogbGFiZWwubGFiZWxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZShkYXRhKTtcbiAgICAgICAgICAgIH0sIHRoaXMpLmpvaW4oJycpO1xuICAgICAgICByZXR1cm4gaHRtbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGNzcyBzdHlsZSBvZiBsYWJlbCBhcmVhLlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIGxhYmVsIGFyZWEgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7e2ZvbnRTaXplOm51bWJlciwgZm9udEZhbWlseTogc3RyaW5nLCBjb2xvcjogc3RyaW5nfX0gdGhlbWUgbGFiZWwgdGhlbWVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJMYWJlbFRoZW1lOiBmdW5jdGlvbihlbCwgdGhlbWUpIHtcbiAgICAgICAgdmFyIGNzc1RleHQgPSByZW5kZXJVdGlsLm1ha2VGb250Q3NzVGV4dCh0aGVtZSk7XG4gICAgICAgIGVsLnN0eWxlLmNzc1RleHQgKz0gJzsnICsgY3NzVGV4dDtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBMZWdlbmQ7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgVGhpcyBpcyB0ZW1wbGF0ZXMgb2YgbGVnZW5kIHZpZXcuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG52YXIgdGVtcGxhdGVNYWtlciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvdGVtcGxhdGVNYWtlci5qcycpO1xuXG52YXIgdGFncyA9IHtcbiAgICBIVE1MX0xFR0VORDogJzxkaXYgY2xhc3M9XCJuZS1jaGFydC1sZWdlbmRcIj4nICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJuZS1jaGFydC1sZWdlbmQtcmVjdCB7eyBjaGFydFR5cGUgfX1cIiBzdHlsZT1cInt7IGNzc1RleHQgfX1cIj48L2Rpdj4nICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJuZS1jaGFydC1sZWdlbmQtbGFiZWxcIiBzdHlsZT1cImhlaWdodDp7eyBoZWlnaHQgfX1weFwiPnt7IGxhYmVsIH19PC9kaXY+PC9kaXY+J1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgdHBsTGVnZW5kOiB0ZW1wbGF0ZU1ha2VyLnRlbXBsYXRlKHRhZ3MuSFRNTF9MRUdFTkQpXG59O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFBsb3QgY29tcG9uZW50LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZG9tID0gcmVxdWlyZSgnLi4vaGVscGVycy9kb21IYW5kbGVyLmpzJyksXG4gICAgY2FsY3VsYXRvciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvY2FsY3VsYXRvci5qcycpLFxuICAgIHJlbmRlclV0aWwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3JlbmRlclV0aWwuanMnKSxcbiAgICBwbG90VGVtcGxhdGUgPSByZXF1aXJlKCcuL3Bsb3RUZW1wbGF0ZS5qcycpO1xuXG52YXIgUGxvdCA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBQbG90LnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogUGxvdCBjb21wb25lbnQuXG4gICAgICogQGNvbnN0cnVjdHMgUGxvdFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy52VGlja0NvdW50IHZlcnRpY2FsIHRpY2sgY291bnRcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuaFRpY2tDb3VudCBob3Jpem9udGFsIHRpY2sgY291bnRcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuYm91bmQgYXhpcyBib3VuZFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBheGlzIHRoZW1lXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIG5lLnV0aWwuZXh0ZW5kKHRoaXMsIHBhcmFtcyk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQbG90IHZpZXcgY2xhc3NOYW1lXG4gICAgICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNsYXNzTmFtZSA9ICduZS1jaGFydC1wbG90LWFyZWEnO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgcGxvdC5cbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgdG9wOiBudW1iZXIsIHJpZ2h0OiBudW1iZXJ9fSBib3VuZCBwbG90IGFyZWEgYm91bmRcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHBsb3QgZWxlbWVudFxuICAgICAqL1xuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBlbCA9IGRvbS5jcmVhdGUoJ0RJVicsIHRoaXMuY2xhc3NOYW1lKSxcbiAgICAgICAgICAgIGJvdW5kID0gdGhpcy5ib3VuZDtcbiAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJEaW1lbnNpb24oZWwsIGJvdW5kLmRpbWVuc2lvbik7XG4gICAgICAgIHJlbmRlclV0aWwucmVuZGVyUG9zaXRpb24oZWwsIGJvdW5kLnBvc2l0aW9uKTtcbiAgICAgICAgdGhpcy5fcmVuZGVyTGluZXMoZWwsIGJvdW5kLmRpbWVuc2lvbik7XG5cbiAgICAgICAgcmV0dXJuIGVsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgcGxvdCBsaW5lcy5cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCBlbGVtZW50XG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBkaW1lbnNpb24gcGxvdCBhcmVhIGRpbWVuc2lvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlckxpbmVzOiBmdW5jdGlvbihlbCwgZGltZW5zaW9uKSB7XG4gICAgICAgIHZhciBoUG9zaXRpb25zID0gdGhpcy5fbWFrZUhvcml6b250YWxQaXhlbFBvc2l0aW9ucyhkaW1lbnNpb24ud2lkdGgpLFxuICAgICAgICAgICAgdlBvc2l0aW9ucyA9IHRoaXMuX21ha2VWZXJ0aWNhbFBpeGVsUG9zaXRpb25zKGRpbWVuc2lvbi5oZWlnaHQpLFxuICAgICAgICAgICAgdGhlbWUgPSB0aGlzLnRoZW1lLFxuICAgICAgICAgICAgbGluZUh0bWwgPSAnJztcblxuICAgICAgICBsaW5lSHRtbCArPSB0aGlzLl9tYWtlTGluZUh0bWwoe1xuICAgICAgICAgICAgcG9zaXRpb25zOiBoUG9zaXRpb25zLFxuICAgICAgICAgICAgc2l6ZTogZGltZW5zaW9uLmhlaWdodCxcbiAgICAgICAgICAgIGNsYXNzTmFtZTogJ3ZlcnRpY2FsJyxcbiAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogJ2xlZnQnLFxuICAgICAgICAgICAgc2l6ZVR5cGU6ICdoZWlnaHQnLFxuICAgICAgICAgICAgbGluZUNvbG9yOiB0aGVtZS5saW5lQ29sb3JcbiAgICAgICAgfSk7XG4gICAgICAgIGxpbmVIdG1sICs9IHRoaXMuX21ha2VMaW5lSHRtbCh7XG4gICAgICAgICAgICBwb3NpdGlvbnM6IHZQb3NpdGlvbnMsXG4gICAgICAgICAgICBzaXplOiBkaW1lbnNpb24ud2lkdGgsXG4gICAgICAgICAgICBjbGFzc05hbWU6ICdob3Jpem9udGFsJyxcbiAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogJ2JvdHRvbScsXG4gICAgICAgICAgICBzaXplVHlwZTogJ3dpZHRoJyxcbiAgICAgICAgICAgIGxpbmVDb2xvcjogdGhlbWUubGluZUNvbG9yXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGVsLmlubmVySFRNTCA9IGxpbmVIdG1sO1xuXG4gICAgICAgIHJlbmRlclV0aWwucmVuZGVyQmFja2dyb3VuZChlbCwgdGhlbWUuYmFja2dyb3VuZCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgaHRtbCBvZiBwbG90IGxpbmUuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxvYmplY3Q+fSBwYXJhbXMucG9zaXRpb25zIHBvc2l0aW9uc1xuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5zaXplIHdpZHRoIG9yIGhlaWdodFxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5jbGFzc05hbWUgbGluZSBjbGFzc05hbWVcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMucG9zaXRpb25UeXBlIHBvc2l0aW9uIHR5cGUgKGxlZnQgb3IgYm90dG9tKVxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5zaXplVHlwZSBzaXplIHR5cGUgKHNpemUgb3IgaGVpZ2h0KVxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5saW5lQ29sb3IgbGluZSBjb2xvclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGh0bWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlTGluZUh0bWw6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgdGVtcGxhdGUgPSBwbG90VGVtcGxhdGUudHBsUGxvdExpbmUsXG4gICAgICAgICAgICBsaW5lSHRtbCA9IG5lLnV0aWwubWFwKHBhcmFtcy5wb3NpdGlvbnMsIGZ1bmN0aW9uKHBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNzc1RleHRzID0gW1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyVXRpbC5jb25jYXRTdHIocGFyYW1zLnBvc2l0aW9uVHlwZSwgJzonLCBwb3NpdGlvbiwgJ3B4JyksXG4gICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJVdGlsLmNvbmNhdFN0cihwYXJhbXMuc2l6ZVR5cGUsICc6JywgcGFyYW1zLnNpemUsICdweCcpXG4gICAgICAgICAgICAgICAgICAgIF0sIGRhdGE7XG5cbiAgICAgICAgICAgICAgICBpZiAocGFyYW1zLmxpbmVDb2xvcikge1xuICAgICAgICAgICAgICAgICAgICBjc3NUZXh0cy5wdXNoKHJlbmRlclV0aWwuY29uY2F0U3RyKCdiYWNrZ3JvdW5kLWNvbG9yOicsIHBhcmFtcy5saW5lQ29sb3IpKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBkYXRhID0ge2NsYXNzTmFtZTogcGFyYW1zLmNsYXNzTmFtZSwgY3NzVGV4dDogY3NzVGV4dHMuam9pbignOycpfTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGVtcGxhdGUoZGF0YSk7XG4gICAgICAgICAgICB9LCB0aGlzKS5qb2luKCcnKTtcbiAgICAgICAgcmV0dXJuIGxpbmVIdG1sO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHBpeGVsIHZhbHVlIG9mIHZlcnRpY2FsIHBvc2l0aW9uc1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgcGxvdCBoZWlnaHRcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPG51bWJlcj59IHBvc2l0aW9uc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VWZXJ0aWNhbFBpeGVsUG9zaXRpb25zOiBmdW5jdGlvbihoZWlnaHQpIHtcbiAgICAgICAgdmFyIHBvc2l0aW9ucyA9IGNhbGN1bGF0b3IubWFrZVRpY2tQaXhlbFBvc2l0aW9ucyhoZWlnaHQsIHRoaXMudlRpY2tDb3VudCk7XG4gICAgICAgIHBvc2l0aW9ucy5zaGlmdCgpO1xuICAgICAgICByZXR1cm4gcG9zaXRpb25zO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHBpeGVsIHZhbHVlIG9mIGhvcml6b250YWwgcG9zaXRpb25zLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aCBwbG90IHdpZHRoXG4gICAgICogQHJldHVybnMge2FycmF5LjxudW1iZXI+fSBwb3NpdGlvbnNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlSG9yaXpvbnRhbFBpeGVsUG9zaXRpb25zOiBmdW5jdGlvbih3aWR0aCkge1xuICAgICAgICB2YXIgcG9zaXRpb25zID0gY2FsY3VsYXRvci5tYWtlVGlja1BpeGVsUG9zaXRpb25zKHdpZHRoLCB0aGlzLmhUaWNrQ291bnQpO1xuICAgICAgICBwb3NpdGlvbnMuc2hpZnQoKTtcbiAgICAgICAgcmV0dXJuIHBvc2l0aW9ucztcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBQbG90O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFRoaXMgaXMgdGVtcGxhdGVzIG9mIHBsb3QgdmlldyAuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG52YXIgdGVtcGxhdGVNYWtlciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvdGVtcGxhdGVNYWtlci5qcycpO1xuXG52YXIgdGFncyA9IHtcbiAgICBIVE1MX1BMT1RfTElORTogJzxkaXYgY2xhc3M9XCJuZS1jaGFydC1wbG90LWxpbmUge3sgY2xhc3NOYW1lIH19XCIgc3R5bGU9XCJ7eyBjc3NUZXh0IH19XCI+PC9kaXY+J1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgdHBsUGxvdExpbmU6IHRlbXBsYXRlTWFrZXIudGVtcGxhdGUodGFncy5IVE1MX1BMT1RfTElORSlcbn07XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgUmFwaGFlbCByZW5kZXIgcGx1Z2luLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQmFyQ2hhcnQgPSByZXF1aXJlKCcuL3JhcGhhZWxCYXJDaGFydC5qcycpLFxuICAgIExpbmVDaGFydCA9IHJlcXVpcmUoJy4vcmFwaGFlbExpbmVDaGFydC5qcycpLFxuICAgIEFyZWFDaGFydCA9IHJlcXVpcmUoJy4vcmFwaGFlbEFyZWFDaGFydC5qcycpLFxuICAgIFBpZUNoYXJ0ID0gcmVxdWlyZSgnLi9yYXBoYWVsUGllQ2hhcnQuanMnKTtcblxudmFyIHBsdWdpbk5hbWUgPSAncmFwaGFlbCcsXG4gICAgcGx1Z2luUmFwaGFlbDtcblxucGx1Z2luUmFwaGFlbCA9IHtcbiAgICBiYXI6IEJhckNoYXJ0LFxuICAgIGNvbHVtbjogQmFyQ2hhcnQsXG4gICAgbGluZTogTGluZUNoYXJ0LFxuICAgIGFyZWE6IEFyZWFDaGFydCxcbiAgICBwaWU6IFBpZUNoYXJ0XG59O1xuXG5uZS5hcHBsaWNhdGlvbi5jaGFydC5yZWdpc3RlclBsdWdpbihwbHVnaW5OYW1lLCBwbHVnaW5SYXBoYWVsKTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBSYXBoYWVsIGFyZWEgY2hhcnQgcmVuZGVyZXIuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSYXBoYWVsTGluZUJhc2UgPSByZXF1aXJlKCcuL3JhcGhhZWxMaW5lVHlwZUJhc2UnKSxcbiAgICByYXBoYWVsUmVuZGVyVXRpbCA9IHJlcXVpcmUoJy4vcmFwaGFlbFJlbmRlclV0aWwnKTtcblxudmFyIFJhcGhhZWwgPSB3aW5kb3cuUmFwaGFlbCxcbiAgICBBTklNQVRJT05fVElNRSA9IDcwMDtcblxudmFyIGNvbmNhdCA9IEFycmF5LnByb3RvdHlwZS5jb25jYXQ7XG5cbi8qKlxuICogQGNsYXNzZGVzYyBSYXBoYWVsQXJlYUNoYXJ0IGlzIGdyYXBoIHJlbmRlcmVyIGZvciBhcmVhIGNoYXJ0LlxuICogQGNsYXNzIFJhcGhhZWxBcmVhQ2hhcnRcbiAqIEBleHRlbmRzIFJhcGhhZWxMaW5lVHlwZUJhc2VcbiAqL1xudmFyIFJhcGhhZWxBcmVhQ2hhcnQgPSBuZS51dGlsLmRlZmluZUNsYXNzKFJhcGhhZWxMaW5lQmFzZSwgLyoqIEBsZW5kcyBSYXBoYWVsQXJlYUNoYXJ0LnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogUmVuZGVyIGZ1bmN0aW9uIG9mIGFyZWEgY2hhcnQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY29udGFpbmVyXG4gICAgICogQHBhcmFtIHt7Z3JvdXBQb3NpdGlvbnM6IGFycmF5LjxhcnJheT4sIGRpbWVuc2lvbjogb2JqZWN0LCB0aGVtZTogb2JqZWN0LCBvcHRpb25zOiBvYmplY3R9fSBkYXRhIHJlbmRlciBkYXRhXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gaW5DYWxsYmFjayBpbiBjYWxsYmFja1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG91dENhbGxiYWNrIG91dCBjYWxsYmFja1xuICAgICAqIEByZXR1cm4ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqL1xuICAgIHJlbmRlcjogZnVuY3Rpb24ocGFwZXIsIGNvbnRhaW5lciwgZGF0YSwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGRpbWVuc2lvbiA9IGRhdGEuZGltZW5zaW9uLFxuICAgICAgICAgICAgZ3JvdXBQb3NpdGlvbnMgPSBkYXRhLmdyb3VwUG9zaXRpb25zLFxuICAgICAgICAgICAgdGhlbWUgPSBkYXRhLnRoZW1lLFxuICAgICAgICAgICAgY29sb3JzID0gdGhlbWUuY29sb3JzLFxuICAgICAgICAgICAgb3BhY2l0eSA9IGRhdGEub3B0aW9ucy5oYXNEb3QgPyAxIDogMCxcbiAgICAgICAgICAgIGdyb3VwUGF0aHMgPSB0aGlzLl9nZXRBcmVhc1BhdGgoZ3JvdXBQb3NpdGlvbnMsIGRhdGEuemVyb1RvcCksXG4gICAgICAgICAgICBib3JkZXJTdHlsZSA9IHRoaXMubWFrZUJvcmRlclN0eWxlKHRoZW1lLmJvcmRlckNvbG9yLCBvcGFjaXR5KSxcbiAgICAgICAgICAgIG91dERvdFN0eWxlID0gdGhpcy5tYWtlT3V0RG90U3R5bGUob3BhY2l0eSwgYm9yZGVyU3R5bGUpLFxuICAgICAgICAgICAgZ3JvdXBBcmVhcywgZ3JvdXBEb3RzO1xuXG4gICAgICAgIGlmICghcGFwZXIpIHtcbiAgICAgICAgICAgIHBhcGVyID0gUmFwaGFlbChjb250YWluZXIsIGRpbWVuc2lvbi53aWR0aCwgZGltZW5zaW9uLmhlaWdodCk7XG4gICAgICAgIH1cblxuICAgICAgICBncm91cEFyZWFzID0gdGhpcy5fcmVuZGVyQXJlYXMocGFwZXIsIGdyb3VwUGF0aHMsIGNvbG9ycyk7XG4gICAgICAgIGdyb3VwRG90cyA9IHRoaXMucmVuZGVyRG90cyhwYXBlciwgZ3JvdXBQb3NpdGlvbnMsIGNvbG9ycywgYm9yZGVyU3R5bGUpO1xuXG4gICAgICAgIHRoaXMub3V0RG90U3R5bGUgPSBvdXREb3RTdHlsZTtcbiAgICAgICAgdGhpcy5ncm91cFBhdGhzID0gZ3JvdXBQYXRocztcbiAgICAgICAgdGhpcy5ncm91cEFyZWFzID0gZ3JvdXBBcmVhcztcbiAgICAgICAgdGhpcy5ncm91cERvdHMgPSBncm91cERvdHM7XG4gICAgICAgIHRoaXMuZG90T3BhY2l0eSA9IG9wYWNpdHk7XG5cbiAgICAgICAgdGhpcy5hdHRhY2hFdmVudChncm91cERvdHMsIGdyb3VwUG9zaXRpb25zLCBvdXREb3RTdHlsZSwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spO1xuXG4gICAgICAgIHJldHVybiBwYXBlcjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGFyZWEgZ3JhcGguXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIHBhcGVyXG4gICAgICogQHBhcmFtIHt7c3RhcnQ6IHN0cmluZywgYWRkU3RhcnQ6IHN0cmluZ319IHBhdGggcGF0aFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb2xvciBjb2xvclxuICAgICAqIEByZXR1cm5zIHthcnJheS48b2JqZWN0Pn0gcmFwaGFlbCBvYmplY3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJBcmVhOiBmdW5jdGlvbihwYXBlciwgcGF0aCwgY29sb3IpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdLFxuICAgICAgICAgICAgYXJlYSA9IHBhcGVyLnBhdGgoW3BhdGguc3RhcnRdKSxcbiAgICAgICAgICAgIGZpbGxTdHlsZSA9IHtcbiAgICAgICAgICAgICAgICBmaWxsOiBjb2xvcixcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAwLjUsXG4gICAgICAgICAgICAgICAgc3Ryb2tlOiBjb2xvcixcbiAgICAgICAgICAgICAgICAnc3Ryb2tlLW9wYWNpdHknOiAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYWRkQXJlYTtcblxuICAgICAgICBhcmVhLmF0dHIoZmlsbFN0eWxlKTtcbiAgICAgICAgcmVzdWx0LnB1c2goYXJlYSk7XG5cbiAgICAgICAgaWYgKHBhdGguYWRkU3RhcnQpIHtcbiAgICAgICAgICAgIGFkZEFyZWEgPSBwYXBlci5wYXRoKFtwYXRoLmFkZFN0YXJ0XSk7XG4gICAgICAgICAgICBhZGRBcmVhLmF0dHIoZmlsbFN0eWxlKTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGFkZEFyZWEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBhcmVhIGdyYXBocy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgcGFwZXJcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxvYmplY3Q+fSBncm91cFBhdGhzIGdyb3VwIHBhdGhzXG4gICAgICogQHBhcmFtIHthcnJheS48c3RyaW5nPn0gY29sb3JzIGNvbG9yc1xuICAgICAqIEByZXR1cm5zIHthcnJheX0gcmFwaGFlbCBvYmplY3RzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyQXJlYXM6IGZ1bmN0aW9uKHBhcGVyLCBncm91cFBhdGhzLCBjb2xvcnMpIHtcbiAgICAgICAgdmFyIGdyb3VwQXJlYXMgPSBuZS51dGlsLm1hcChncm91cFBhdGhzLCBmdW5jdGlvbihwYXRocywgZ3JvdXBJbmRleCkge1xuICAgICAgICAgICAgdmFyIGNvbG9yID0gY29sb3JzW2dyb3VwSW5kZXhdIHx8ICd0cmFuc3BhcmVudCc7XG4gICAgICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAocGF0aHMsIGZ1bmN0aW9uKHBhdGgpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgICAgICBhcmVhOiB0aGlzLl9yZW5kZXJBcmVhKHBhcGVyLCBwYXRoLmFyZWEsIGNvbG9yKSxcbiAgICAgICAgICAgICAgICAgICAgbGluZTogcmFwaGFlbFJlbmRlclV0aWwucmVuZGVyTGluZShwYXBlciwgcGF0aC5saW5lLnN0YXJ0LCBjb2xvcilcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgcmV0dXJuIGdyb3VwQXJlYXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgbWludXMgb3Igbm90LlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSB2YWx1ZVxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSByZXN1bHQgYm9vbGVhblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2lzTWludXM6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZSA8IDA7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgcGx1cyBvciBub3QuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIHZhbHVlXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHJlc3VsdCBib29sZWFuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNQbHVzOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdmFsdWUgPj0gMDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBoZWlnaHQuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHRvcCB0b3BcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gemVyb1RvcCB6ZXJvIHBvc2l0aW9uIHRvcFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IGhlaWdodFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VIZWlnaHQ6IGZ1bmN0aW9uKHRvcCwgemVyb1RvcCkge1xuICAgICAgICByZXR1cm4gTWF0aC5hYnModG9wIC0gemVyb1RvcCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZpbmQgbWlkZGxlIGxlZnRcbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gZnJvbVBvcyBmcm9tIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IHRvUG9zIHRvIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHplcm9Ub3AgemVybyBwb3NpdGlvbiB0b3BcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBtaWRkbGUgbGVmdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2ZpbmRNaWRkbGVMZWZ0OiBmdW5jdGlvbihmcm9tUG9zLCB0b1BvcywgemVyb1RvcCkge1xuICAgICAgICB2YXIgdG9wcyA9IFt6ZXJvVG9wIC0gZnJvbVBvcy50b3AsIHplcm9Ub3AgLSB0b1Bvcy50b3BdLFxuICAgICAgICAgICAgbWlkZGxlTGVmdCwgd2lkdGgsIGZyb21IZWlnaHQsIHRvSGVpZ2h0O1xuXG4gICAgICAgIGlmIChuZS51dGlsLmFsbCh0b3BzLCB0aGlzLl9pc01pbnVzKSB8fCBuZS51dGlsLmFsbCh0b3BzLCB0aGlzLl9pc1BsdXMpKSB7XG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH1cblxuICAgICAgICBmcm9tSGVpZ2h0ID0gdGhpcy5fbWFrZUhlaWdodChmcm9tUG9zLnRvcCwgemVyb1RvcCk7XG4gICAgICAgIHRvSGVpZ2h0ID0gdGhpcy5fbWFrZUhlaWdodCh0b1Bvcy50b3AsIHplcm9Ub3ApO1xuICAgICAgICB3aWR0aCA9IHRvUG9zLmxlZnQgLSBmcm9tUG9zLmxlZnQ7XG5cbiAgICAgICAgbWlkZGxlTGVmdCA9IGZyb21Qb3MubGVmdCArICh3aWR0aCAqIChmcm9tSGVpZ2h0IC8gKGZyb21IZWlnaHQgKyB0b0hlaWdodCkpKTtcbiAgICAgICAgcmV0dXJuIG1pZGRsZUxlZnQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYXJlYSBwYXRoLlxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBmcm9tUG9zIGZyb20gcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gdG9Qb3MgdG8gcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gemVyb1RvcCB6ZXJvIHBvc2l0aW9uIHRvcFxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGFyZWEgcGF0aFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VBcmVhUGF0aDogZnVuY3Rpb24oZnJvbVBvcywgdG9Qb3MsIHplcm9Ub3ApIHtcbiAgICAgICAgdmFyIGZyb21TdGFydFBvaW50ID0gWydNJywgZnJvbVBvcy5sZWZ0LCAnICcsIHplcm9Ub3BdLFxuICAgICAgICAgICAgZnJvbUVuZFBvaW50ID0gemVyb1RvcCA9PT0gZnJvbVBvcy50b3AgPyBbXSA6IFsnTCcsIGZyb21Qb3MubGVmdCwgJyAnLCBmcm9tUG9zLnRvcF0sXG4gICAgICAgICAgICB0b1N0YXJ0UG9pbnQgPSBbJ0wnLCB0b1Bvcy5sZWZ0LCAnICcsIHRvUG9zLnRvcF0sXG4gICAgICAgICAgICB0b0VuZFBvaW50ID0gemVyb1RvcCA9PT0gdG9Qb3MudG9wID8gW10gOiBbJ0wnLCB0b1Bvcy5sZWZ0LCAnICcsIHplcm9Ub3BdO1xuICAgICAgICByZXR1cm4gY29uY2F0LmNhbGwoW10sIGZyb21TdGFydFBvaW50LCBmcm9tRW5kUG9pbnQsIHRvU3RhcnRQb2ludCwgdG9FbmRQb2ludCkuam9pbignJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYXJlYSBwYXRocy5cbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gZnJvbVBvcyBmcm9tIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IHRvUG9zIHRvIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHplcm9Ub3AgemVybyBwb3NpdGlvbiB0b3BcbiAgICAgKiBAcmV0dXJucyB7e1xuICAgICAqICAgICAgc3RhcnQ6IHN0cmluZyxcbiAgICAgKiAgICAgIGVuZDogc3RyaW5nLFxuICAgICAqICAgICAgYWRkU3RhcnQ6IHN0cmluZyxcbiAgICAgKiAgICAgIGFkZEVuZDogc3RyaW5nXG4gICAgICogfX0gYXJlYSBwYXRoc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VBcmVhUGF0aHM6IGZ1bmN0aW9uKGZyb21Qb3MsIHRvUG9zLCB6ZXJvVG9wKSB7XG4gICAgICAgIHZhciBtaWRkbGVMZWZ0ID0gdGhpcy5fZmluZE1pZGRsZUxlZnQoZnJvbVBvcywgdG9Qb3MsIHplcm9Ub3ApLFxuICAgICAgICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgIHN0YXJ0OiB0aGlzLl9tYWtlQXJlYVBhdGgoZnJvbVBvcywgZnJvbVBvcywgemVyb1RvcClcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtaWRkbGVQb3M7XG5cbiAgICAgICAgaWYgKHRoaXMuX2lzUGx1cyhtaWRkbGVMZWZ0KSkge1xuICAgICAgICAgICAgbWlkZGxlUG9zID0ge2xlZnQ6IG1pZGRsZUxlZnQsIHRvcDogemVyb1RvcH07XG4gICAgICAgICAgICByZXN1bHQuZW5kID0gdGhpcy5fbWFrZUFyZWFQYXRoKGZyb21Qb3MsIG1pZGRsZVBvcywgemVyb1RvcCk7XG4gICAgICAgICAgICByZXN1bHQuYWRkU3RhcnQgPSB0aGlzLl9tYWtlQXJlYVBhdGgobWlkZGxlUG9zLCBtaWRkbGVQb3MsIHplcm9Ub3ApO1xuICAgICAgICAgICAgcmVzdWx0LmFkZEVuZCA9IHRoaXMuX21ha2VBcmVhUGF0aChtaWRkbGVQb3MsIHRvUG9zLCB6ZXJvVG9wKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdC5lbmQgPSB0aGlzLl9tYWtlQXJlYVBhdGgoZnJvbVBvcywgdG9Qb3MsIHplcm9Ub3ApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGFyZWEgcGF0aC5cbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheS48b2JqZWN0Pj59IGdyb3VwUG9zaXRpb25zIHBvc2l0aW9uc1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB6ZXJvVG9wIHplcm8gdG9wXG4gICAgICogQHJldHVybnMge2FycmF5LjxhcnJheS48c3RyaW5nPj59IHBhdGhzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0QXJlYXNQYXRoOiBmdW5jdGlvbihncm91cFBvc2l0aW9ucywgemVyb1RvcCkge1xuICAgICAgICB2YXIgZ3JvdXBQYXRocyA9IG5lLnV0aWwubWFwKGdyb3VwUG9zaXRpb25zLCBmdW5jdGlvbihwb3NpdGlvbnMpIHtcbiAgICAgICAgICAgIHZhciBmcm9tUG9zID0gcG9zaXRpb25zWzBdLFxuICAgICAgICAgICAgICAgIHJlc3QgPSBwb3NpdGlvbnMuc2xpY2UoMSk7XG4gICAgICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAocmVzdCwgZnVuY3Rpb24ocG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgICAgICBhcmVhOiB0aGlzLl9tYWtlQXJlYVBhdGhzKGZyb21Qb3MsIHBvc2l0aW9uLCB6ZXJvVG9wKSxcbiAgICAgICAgICAgICAgICAgICAgbGluZTogdGhpcy5tYWtlTGluZVBhdGgoZnJvbVBvcywgcG9zaXRpb24pXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBmcm9tUG9zID0gcG9zaXRpb247XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIGdyb3VwUGF0aHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFuaW1hdGUgYXJlYSBjaGFydC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYXJlYSByYXBoYWVsIG9iamVjdFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBhcmVhUGF0aCBwYXRoXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHRpbWUgcGxheSB0aW1lXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHN0YXJ0VGltZSBzdGFydCB0aW1lXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYW5pbWF0ZUFyZWE6IGZ1bmN0aW9uKGFyZWEsIGFyZWFQYXRoLCB0aW1lLCBzdGFydFRpbWUpIHtcbiAgICAgICAgdmFyIGFyZWFBZGRFbmRQYXRoID0gYXJlYVBhdGguYWRkRW5kLFxuICAgICAgICAgICAgYXJlYUVuZFBhdGggPSBhcmVhUGF0aC5lbmQ7XG4gICAgICAgIGlmIChhcmVhQWRkRW5kUGF0aCkge1xuICAgICAgICAgICAgdGltZSA9IHRpbWUgLyAyO1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBhcmVhWzFdLmFuaW1hdGUoe3BhdGg6IGFyZWFBZGRFbmRQYXRoLCAnc3Ryb2tlLW9wYWNpdHknOiAwLjI1fSwgdGltZSk7XG4gICAgICAgICAgICB9LCBzdGFydFRpbWUgKyB0aW1lKTtcbiAgICAgICAgfVxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgYXJlYVswXS5hbmltYXRlKHtwYXRoOiBhcmVhRW5kUGF0aCwgJ3N0cm9rZS1vcGFjaXR5JzogMC4yNX0sIHRpbWUpO1xuICAgICAgICB9LCBzdGFydFRpbWUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBbmltYXRlLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIGNhbGxiYWNrXG4gICAgICovXG4gICAgYW5pbWF0ZTogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGdyb3VwQXJlYXMgPSB0aGlzLmdyb3VwQXJlYXMsXG4gICAgICAgICAgICBncm91cFBhdGhzID0gdGhpcy5ncm91cFBhdGhzLFxuICAgICAgICAgICAgb3BhY2l0eSA9IHRoaXMuZG90T3BhY2l0eSxcbiAgICAgICAgICAgIHRpbWUgPSBBTklNQVRJT05fVElNRSAvIGdyb3VwQXJlYXNbMF0ubGVuZ3RoLFxuICAgICAgICAgICAgc3RhcnRUaW1lO1xuICAgICAgICBuZS51dGlsLmZvckVhY2hBcnJheSh0aGlzLmdyb3VwRG90cywgZnVuY3Rpb24oZG90cywgZ3JvdXBJbmRleCkge1xuICAgICAgICAgICAgc3RhcnRUaW1lID0gMDtcbiAgICAgICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KGRvdHMsIGZ1bmN0aW9uKGRvdCwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgYXJlYSwgYXJlYVBhdGg7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIGFyZWEgPSBncm91cEFyZWFzW2dyb3VwSW5kZXhdW2luZGV4IC0gMV07XG4gICAgICAgICAgICAgICAgICAgIGFyZWFQYXRoID0gZ3JvdXBQYXRoc1tncm91cEluZGV4XVtpbmRleCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFuaW1hdGVMaW5lKGFyZWEubGluZSwgYXJlYVBhdGgubGluZS5lbmQsIHRpbWUsIHN0YXJ0VGltZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2FuaW1hdGVBcmVhKGFyZWEuYXJlYSwgYXJlYVBhdGguYXJlYSwgdGltZSwgc3RhcnRUaW1lKTtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRUaW1lICs9IHRpbWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKG9wYWNpdHkpIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvdC5hdHRyKHsnZmlsbC1vcGFjaXR5Jzogb3BhY2l0eX0pO1xuICAgICAgICAgICAgICAgICAgICB9LCBzdGFydFRpbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoY2FsbGJhY2ssIHN0YXJ0VGltZSk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSYXBoYWVsQXJlYUNoYXJ0O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFJhcGhhZWwgYmFyIGNoYXJ0IHJlbmRlcmVyLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmFwaGFlbCA9IHdpbmRvdy5SYXBoYWVsO1xuXG52YXIgQU5JTUFUSU9OX1RJTUUgPSA3MDA7XG5cbi8qKlxuICogQGNsYXNzZGVzYyBSYXBoYWVsQmFyQ2hhcnQgaXMgZ3JhcGggcmVuZGVyZXIgZm9yIGJhciwgY29sdW1uIGNoYXJ0LlxuICogQGNsYXNzIFJhcGhhZWxCYXJDaGFydFxuICovXG52YXIgUmFwaGFlbEJhckNoYXJ0ID0gbmUudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIFJhcGhhZWxCYXJDaGFydC5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIFJlbmRlciBmdW5jdGlvbiBvZiBiYXIgY2hhcnRcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciBjb250YWluZXIgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7e3NpemU6IG9iamVjdCwgbW9kZWw6IG9iamVjdCwgb3B0aW9uczogb2JqZWN0LCB0b29sdGlwUG9zaXRpb246IHN0cmluZ319IGRhdGEgY2hhcnQgZGF0YVxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGluQ2FsbGJhY2sgbW91c2VvdmVyIGNhbGxiYWNrXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gb3V0Q2FsbGJhY2sgbW91c2VvdXQgY2FsbGJhY2tcbiAgICAgKiBAcmV0dXJuIHtvYmplY3R9IHBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKi9cbiAgICByZW5kZXI6IGZ1bmN0aW9uKHBhcGVyLCBjb250YWluZXIsIGRhdGEsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKSB7XG4gICAgICAgIHZhciBncm91cEJvdW5kcyA9IGRhdGEuZ3JvdXBCb3VuZHMsXG4gICAgICAgICAgICBkaW1lbnNpb24gPSBkYXRhLmRpbWVuc2lvbjtcblxuICAgICAgICBpZiAoIWdyb3VwQm91bmRzKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghcGFwZXIpIHtcbiAgICAgICAgICAgIHBhcGVyID0gUmFwaGFlbChjb250YWluZXIsIGRpbWVuc2lvbi53aWR0aCwgZGltZW5zaW9uLmhlaWdodCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fcmVuZGVyQmFycyhwYXBlciwgZGF0YS50aGVtZSwgZ3JvdXBCb3VuZHMsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKTtcblxuICAgICAgICByZXR1cm4gcGFwZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBiYXJzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICogQHBhcmFtIHt7Y29sb3JzOiBzdHJpbmdbXSwgc2luZ2xlQ29sb3JzOiBzdHJpbmdbXSwgYm9yZGVyQ29sb3I6IHN0cmluZ319IHRoZW1lIGJhciBjaGFydCB0aGVtZVxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Ljx7bGVmdDogbnVtYmVyLCB0b3A6bnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn0+Pn0gZ3JvdXBCb3VuZHMgYm91bmRzXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gaW5DYWxsYmFjayBpbiBjYWxsYmFja1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG91dENhbGxiYWNrIG91dCBjYWxsYmFja1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlckJhcnM6IGZ1bmN0aW9uKHBhcGVyLCB0aGVtZSwgZ3JvdXBCb3VuZHMsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKSB7XG4gICAgICAgIHZhciBzaW5nbGVDb2xvcnMgPSAoZ3JvdXBCb3VuZHNbMF0ubGVuZ3RoID09PSAxKSAmJiB0aGVtZS5zaW5nbGVDb2xvcnMgfHwgW10sXG4gICAgICAgICAgICBjb2xvcnMgPSB0aGVtZS5jb2xvcnMsXG4gICAgICAgICAgICBib3JkZXJDb2xvciA9IHRoZW1lLmJvcmRlckNvbG9yIHx8ICdub25lJyxcbiAgICAgICAgICAgIGJhcnMgPSBbXTtcbiAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkoZ3JvdXBCb3VuZHMsIGZ1bmN0aW9uKGJvdW5kcywgZ3JvdXBJbmRleCkge1xuICAgICAgICAgICAgdmFyIHNpbmdsZUNvbG9yID0gc2luZ2xlQ29sb3JzW2dyb3VwSW5kZXhdLFxuICAgICAgICAgICAgICAgIGNvbG9yLCBpZCwgcmVjdDtcbiAgICAgICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KGJvdW5kcywgZnVuY3Rpb24oYm91bmQsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgaWYgKCFib3VuZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29sb3IgPSBzaW5nbGVDb2xvciB8fCBjb2xvcnNbaW5kZXhdO1xuICAgICAgICAgICAgICAgIGlkID0gZ3JvdXBJbmRleCArICctJyArIGluZGV4O1xuICAgICAgICAgICAgICAgIHJlY3QgPSB0aGlzLl9yZW5kZXJCYXIocGFwZXIsIGNvbG9yLCBib3JkZXJDb2xvciwgYm91bmQuc3RhcnQpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHJlY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYmluZEhvdmVyRXZlbnQocmVjdCwgYm91bmQuZW5kLCBpZCwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGJhcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHJlY3Q6IHJlY3QsXG4gICAgICAgICAgICAgICAgICAgIGJvdW5kOiBib3VuZC5lbmRcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICB0aGlzLmJhcnMgPSBiYXJzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgcmVjdFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbG9yIHNlcmllcyBjb2xvclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBib3JkZXJDb2xvciBzZXJpZXMgYm9yZGVyQ29sb3JcbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGJvdW5kIGJvdW5kXG4gICAgICogQHJldHVybnMge29iamVjdH0gYmFyIHJlY3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJCYXI6IGZ1bmN0aW9uKHBhcGVyLCBjb2xvciwgYm9yZGVyQ29sb3IsIGJvdW5kKSB7XG4gICAgICAgIHZhciByZWN0O1xuICAgICAgICBpZiAoYm91bmQud2lkdGggPCAwIHx8IGJvdW5kLmhlaWdodCA8IDApIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJlY3QgPSBwYXBlci5yZWN0KGJvdW5kLmxlZnQsIGJvdW5kLnRvcCwgYm91bmQud2lkdGgsIGJvdW5kLmhlaWdodCk7XG4gICAgICAgIHJlY3QuYXR0cih7XG4gICAgICAgICAgICBmaWxsOiBjb2xvcixcbiAgICAgICAgICAgIHN0cm9rZTogYm9yZGVyQ29sb3JcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHJlY3Q7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJpbmQgaG92ZXIgZXZlbnQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHJlY3QgcmFwaGFlbCByZWN0XG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBib3VuZCBib3VuZFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpZCB0b29sdGlwIGlkXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gaW5DYWxsYmFjayBpbiBjYWxsYmFja1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG91dENhbGxiYWNrIG91dCBjYWxsYmFja1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2JpbmRIb3ZlckV2ZW50OiBmdW5jdGlvbihyZWN0LCBib3VuZCwgaWQsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKSB7XG4gICAgICAgIHJlY3QuaG92ZXIoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpbkNhbGxiYWNrKGJvdW5kLCBpZCk7XG4gICAgICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgb3V0Q2FsbGJhY2soaWQpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQW5pbWF0ZS5cbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayBjYWxsYmFja1xuICAgICAqL1xuICAgIGFuaW1hdGU6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaCh0aGlzLmJhcnMsIGZ1bmN0aW9uKGJhcikge1xuICAgICAgICAgICAgdmFyIGJvdW5kID0gYmFyLmJvdW5kO1xuICAgICAgICAgICAgYmFyLnJlY3QuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgeDogYm91bmQubGVmdCxcbiAgICAgICAgICAgICAgICB5OiBib3VuZC50b3AsXG4gICAgICAgICAgICAgICAgd2lkdGg6IGJvdW5kLndpZHRoLFxuICAgICAgICAgICAgICAgIGhlaWdodDogYm91bmQuaGVpZ2h0XG4gICAgICAgICAgICB9LCBBTklNQVRJT05fVElNRSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgc2V0VGltZW91dChjYWxsYmFjaywgQU5JTUFUSU9OX1RJTUUpO1xuICAgICAgICB9XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmFwaGFlbEJhckNoYXJ0O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFJhcGhhZWwgbGluZSBjaGFydCByZW5kZXJlci5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJhcGhhZWxMaW5lQmFzZSA9IHJlcXVpcmUoJy4vcmFwaGFlbExpbmVUeXBlQmFzZScpLFxuICAgIHJhcGhhZWxSZW5kZXJVdGlsID0gcmVxdWlyZSgnLi9yYXBoYWVsUmVuZGVyVXRpbCcpO1xuXG52YXIgUmFwaGFlbCA9IHdpbmRvdy5SYXBoYWVsLFxuICAgIEFOSU1BVElPTl9USU1FID0gNzAwO1xuXG4vKipcbiAqIEBjbGFzc2Rlc2MgUmFwaGFlbExpbmVDaGFydHMgaXMgZ3JhcGggcmVuZGVyZXIgZm9yIGxpbmUgY2hhcnQuXG4gKiBAY2xhc3MgUmFwaGFlbExpbmVDaGFydFxuICogQGV4dGVuZHMgUmFwaGFlbExpbmVUeXBlQmFzZVxuICovXG52YXIgUmFwaGFlbExpbmVDaGFydCA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoUmFwaGFlbExpbmVCYXNlLCAvKiogQGxlbmRzIFJhcGhhZWxMaW5lQ2hhcnQucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBSZW5kZXIgZnVuY3Rpb24gb2YgbGluZSBjaGFydC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciBjb250YWluZXJcbiAgICAgKiBAcGFyYW0ge3tncm91cFBvc2l0aW9uczogYXJyYXkuPGFycmF5PiwgZGltZW5zaW9uOiBvYmplY3QsIHRoZW1lOiBvYmplY3QsIG9wdGlvbnM6IG9iamVjdH19IGRhdGEgcmVuZGVyIGRhdGFcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBpbkNhbGxiYWNrIGluIGNhbGxiYWNrXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gb3V0Q2FsbGJhY2sgb3V0IGNhbGxiYWNrXG4gICAgICogQHJldHVybiB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICovXG4gICAgcmVuZGVyOiBmdW5jdGlvbihwYXBlciwgY29udGFpbmVyLCBkYXRhLCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjaykge1xuICAgICAgICB2YXIgZGltZW5zaW9uID0gZGF0YS5kaW1lbnNpb24sXG4gICAgICAgICAgICBncm91cFBvc2l0aW9ucyA9IGRhdGEuZ3JvdXBQb3NpdGlvbnMsXG4gICAgICAgICAgICB0aGVtZSA9IGRhdGEudGhlbWUsXG4gICAgICAgICAgICBjb2xvcnMgPSB0aGVtZS5jb2xvcnMsXG4gICAgICAgICAgICBvcGFjaXR5ID0gZGF0YS5vcHRpb25zLmhhc0RvdCA/IDEgOiAwLFxuICAgICAgICAgICAgZ3JvdXBQYXRocyA9IHRoaXMuX2dldExpbmVzUGF0aChncm91cFBvc2l0aW9ucyksXG4gICAgICAgICAgICBib3JkZXJTdHlsZSA9IHRoaXMubWFrZUJvcmRlclN0eWxlKHRoZW1lLmJvcmRlckNvbG9yLCBvcGFjaXR5KSxcbiAgICAgICAgICAgIG91dERvdFN0eWxlID0gdGhpcy5tYWtlT3V0RG90U3R5bGUob3BhY2l0eSwgYm9yZGVyU3R5bGUpLFxuICAgICAgICAgICAgZ3JvdXBMaW5lcywgZ3JvdXBEb3RzO1xuXG4gICAgICAgIGlmICghcGFwZXIpIHtcbiAgICAgICAgICAgIHBhcGVyID0gUmFwaGFlbChjb250YWluZXIsIGRpbWVuc2lvbi53aWR0aCwgZGltZW5zaW9uLmhlaWdodCk7XG4gICAgICAgIH1cblxuICAgICAgICBncm91cExpbmVzID0gdGhpcy5fcmVuZGVyTGluZXMocGFwZXIsIGdyb3VwUGF0aHMsIGNvbG9ycyk7XG4gICAgICAgIGdyb3VwRG90cyA9IHRoaXMucmVuZGVyRG90cyhwYXBlciwgZ3JvdXBQb3NpdGlvbnMsIGNvbG9ycywgYm9yZGVyU3R5bGUpO1xuXG4gICAgICAgIHRoaXMub3V0RG90U3R5bGUgPSBvdXREb3RTdHlsZTtcbiAgICAgICAgdGhpcy5ncm91cFBhdGhzID0gZ3JvdXBQYXRocztcbiAgICAgICAgdGhpcy5ncm91cExpbmVzID0gZ3JvdXBMaW5lcztcbiAgICAgICAgdGhpcy5ncm91cERvdHMgPSBncm91cERvdHM7XG4gICAgICAgIHRoaXMuZG90T3BhY2l0eSA9IG9wYWNpdHk7XG5cbiAgICAgICAgdGhpcy5hdHRhY2hFdmVudChncm91cERvdHMsIGdyb3VwUG9zaXRpb25zLCBvdXREb3RTdHlsZSwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spO1xuXG4gICAgICAgIHJldHVybiBwYXBlcjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGxpbmVzIHBhdGguXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXkuPG9iamVjdD4+fSBncm91cFBvc2l0aW9ucyBwb3NpdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxzdHJpbmc+Pn0gcGF0aHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRMaW5lc1BhdGg6IGZ1bmN0aW9uKGdyb3VwUG9zaXRpb25zKSB7XG4gICAgICAgIHZhciBncm91cFBhdGhzID0gbmUudXRpbC5tYXAoZ3JvdXBQb3NpdGlvbnMsIGZ1bmN0aW9uKHBvc2l0aW9ucykge1xuICAgICAgICAgICAgdmFyIGZyb21Qb3MgPSBwb3NpdGlvbnNbMF0sXG4gICAgICAgICAgICAgICAgcmVzdCA9IHBvc2l0aW9ucy5zbGljZSgxKTtcbiAgICAgICAgICAgIHJldHVybiBuZS51dGlsLm1hcChyZXN0LCBmdW5jdGlvbihwb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSB0aGlzLm1ha2VMaW5lUGF0aChmcm9tUG9zLCBwb3NpdGlvbik7XG4gICAgICAgICAgICAgICAgZnJvbVBvcyA9IHBvc2l0aW9uO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIHJldHVybiBncm91cFBhdGhzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgbGluZXMuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheS48c3RyaW5nPj59IGdyb3VwUGF0aHMgcGF0aHNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBjb2xvcnMgbGluZSBjb2xvcnNcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3Ryb2tlV2lkdGggc3Ryb2tlIHdpZHRoXG4gICAgICogQHJldHVybnMge2FycmF5LjxhcnJheS48b2JqZWN0Pj59IGxpbmVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyTGluZXM6IGZ1bmN0aW9uKHBhcGVyLCBncm91cFBhdGhzLCBjb2xvcnMsIHN0cm9rZVdpZHRoKSB7XG4gICAgICAgIHZhciBncm91cExpbmVzID0gbmUudXRpbC5tYXAoZ3JvdXBQYXRocywgZnVuY3Rpb24ocGF0aHMsIGdyb3VwSW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBjb2xvciA9IGNvbG9yc1tncm91cEluZGV4XSB8fCAndHJhbnNwYXJlbnQnO1xuICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwubWFwKHBhdGhzLCBmdW5jdGlvbihwYXRoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJhcGhhZWxSZW5kZXJVdGlsLnJlbmRlckxpbmUocGFwZXIsIHBhdGguc3RhcnQsIGNvbG9yLCBzdHJva2VXaWR0aCk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgcmV0dXJuIGdyb3VwTGluZXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFuaW1hdGUuXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgY2FsbGJhY2tcbiAgICAgKi9cbiAgICBhbmltYXRlOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICB2YXIgZ3JvdXBMaW5lcyA9IHRoaXMuZ3JvdXBMaW5lcyxcbiAgICAgICAgICAgIGdyb3VwUGF0aHMgPSB0aGlzLmdyb3VwUGF0aHMsXG4gICAgICAgICAgICBvcGFjaXR5ID0gdGhpcy5kb3RPcGFjaXR5LFxuICAgICAgICAgICAgdGltZSA9IEFOSU1BVElPTl9USU1FIC8gZ3JvdXBMaW5lc1swXS5sZW5ndGgsXG4gICAgICAgICAgICBzdGFydFRpbWU7XG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KHRoaXMuZ3JvdXBEb3RzLCBmdW5jdGlvbihkb3RzLCBncm91cEluZGV4KSB7XG4gICAgICAgICAgICBzdGFydFRpbWUgPSAwO1xuICAgICAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkoZG90cywgZnVuY3Rpb24oZG90LCBpbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciBsaW5lLCBwYXRoO1xuICAgICAgICAgICAgICAgIGlmIChpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICBsaW5lID0gZ3JvdXBMaW5lc1tncm91cEluZGV4XVtpbmRleCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICBwYXRoID0gZ3JvdXBQYXRoc1tncm91cEluZGV4XVtpbmRleCAtIDFdLmVuZDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hbmltYXRlTGluZShsaW5lLCBwYXRoLCB0aW1lLCBzdGFydFRpbWUpO1xuICAgICAgICAgICAgICAgICAgICBzdGFydFRpbWUgKz0gdGltZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAob3BhY2l0eSkge1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZG90LmF0dHIoeydmaWxsLW9wYWNpdHknOiBvcGFjaXR5fSk7XG4gICAgICAgICAgICAgICAgICAgIH0sIHN0YXJ0VGltZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgc2V0VGltZW91dChjYWxsYmFjaywgc3RhcnRUaW1lKTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhcGhhZWxMaW5lQ2hhcnQ7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgUmFwaGFlbExpbmVUeXBlQmFzZSBpcyBiYXNlIGNsYXNzIGZvciBsaW5lIHR5cGUgcmVuZGVyZXIuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciByYXBoYWVsUmVuZGVyVXRpbCA9IHJlcXVpcmUoJy4vcmFwaGFlbFJlbmRlclV0aWwnKTtcblxudmFyIERFRkFVTFRfRE9UX1dJRFRIID0gNCxcbiAgICBIT1ZFUl9ET1RfV0lEVEggPSA1O1xuXG4vKipcbiAqIEBjbGFzc2Rlc2MgUmFwaGFlbExpbmVUeXBlQmFzZSBpcyBiYXNlIGZvciBsaW5lIHR5cGUgcmVuZGVyZXIuXG4gKiBAY2xhc3MgUmFwaGFlbExpbmVUeXBlQmFzZVxuICovXG52YXIgUmFwaGFlbExpbmVUeXBlQmFzZSA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBSYXBoYWVsTGluZVR5cGVCYXNlLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBsaW5lIHBhdGhzLlxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBmcm9tUG9zIGZyb20gcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gdG9Qb3MgdG8gcG9zaXRpb25cbiAgICAgKiBAcmV0dXJucyB7e3N0YXJ0OiBzdHJpbmcsIGVuZDogc3RyaW5nfX0gbGluZSBwYXRocy5cbiAgICAgKi9cbiAgICBtYWtlTGluZVBhdGg6IGZ1bmN0aW9uKGZyb21Qb3MsIHRvUG9zKSB7XG4gICAgICAgIHZhciBzdGFydExpbmVQYXRoID0gcmFwaGFlbFJlbmRlclV0aWwubWFrZUxpbmVQYXRoKGZyb21Qb3MsIGZyb21Qb3MpLFxuICAgICAgICAgICAgZW5kTGluZVBhdGggPSByYXBoYWVsUmVuZGVyVXRpbC5tYWtlTGluZVBhdGgoZnJvbVBvcywgdG9Qb3MpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3RhcnQ6IHN0YXJ0TGluZVBhdGgsXG4gICAgICAgICAgICBlbmQ6IGVuZExpbmVQYXRoXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYm9yZGVyIHN0eWxlLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBib3JkZXJDb2xvciBib3JkZXIgY29sb3JcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gb3BhY2l0eSBvcGFjaXR5XG4gICAgICogQHJldHVybnMge3tzdHJva2U6IHN0cmluZywgc3Ryb2tlLXdpZHRoOiBudW1iZXIsIHN0cmlrZS1vcGFjaXR5OiBudW1iZXJ9fSBib3JkZXIgc3R5bGVcbiAgICAgKi9cbiAgICBtYWtlQm9yZGVyU3R5bGU6IGZ1bmN0aW9uKGJvcmRlckNvbG9yLCBvcGFjaXR5KSB7XG4gICAgICAgIHZhciBib3JkZXJTdHlsZTtcbiAgICAgICAgaWYgKGJvcmRlckNvbG9yKSB7XG4gICAgICAgICAgICBib3JkZXJTdHlsZSA9IHtcbiAgICAgICAgICAgICAgICBzdHJva2U6IGJvcmRlckNvbG9yLFxuICAgICAgICAgICAgICAgICdzdHJva2Utd2lkdGgnOiAxLFxuICAgICAgICAgICAgICAgICdzdHJva2Utb3BhY2l0eSc6IG9wYWNpdHlcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJvcmRlclN0eWxlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGRvdCBzdHlsZSBmb3IgbW91c2VvdXQgZXZlbnQuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG9wYWNpdHkgb3BhY2l0eVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBib3JkZXJTdHlsZSBib3JkZXIgc3R5bGVcbiAgICAgKiBAcmV0dXJucyB7e2ZpbGwtb3BhY2l0eTogbnVtYmVyLCBzdHJva2Utb3BhY2l0eTogbnVtYmVyLCByOiBudW1iZXJ9fSBzdHlsZVxuICAgICAqL1xuICAgIG1ha2VPdXREb3RTdHlsZTogZnVuY3Rpb24ob3BhY2l0eSwgYm9yZGVyU3R5bGUpIHtcbiAgICAgICAgdmFyIG91dERvdFN0eWxlID0ge1xuICAgICAgICAgICAgJ2ZpbGwtb3BhY2l0eSc6IG9wYWNpdHksXG4gICAgICAgICAgICAnc3Ryb2tlLW9wYWNpdHknOiAwLFxuICAgICAgICAgICAgcjogNFxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChib3JkZXJTdHlsZSkge1xuICAgICAgICAgICAgbmUudXRpbC5leHRlbmQob3V0RG90U3R5bGUsIGJvcmRlclN0eWxlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBvdXREb3RTdHlsZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGRvdC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBhZXJcbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gcG9zaXRpb24gZG90IHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbG9yIGRvdCBjb2xvclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBvcGFjaXR5IG9wYWNpdHlcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYm9yZGVyU3R5bGUgYm9yZGVyIHN0eWxlXG4gICAgICogQHJldHVybnMge29iamVjdH0gcmFwaGFlbCBkb3RcbiAgICAgKi9cbiAgICByZW5kZXJEb3Q6IGZ1bmN0aW9uKHBhcGVyLCBwb3NpdGlvbiwgY29sb3IsIG9wYWNpdHksIGJvcmRlclN0eWxlKSB7XG4gICAgICAgIHZhciBkb3QgPSBwYXBlci5jaXJjbGUocG9zaXRpb24ubGVmdCwgcG9zaXRpb24udG9wLCBERUZBVUxUX0RPVF9XSURUSCksXG4gICAgICAgICAgICBkb3RTdHlsZSA9IHtcbiAgICAgICAgICAgICAgICBmaWxsOiBjb2xvcixcbiAgICAgICAgICAgICAgICAnZmlsbC1vcGFjaXR5JzogMCxcbiAgICAgICAgICAgICAgICAnc3Ryb2tlLW9wYWNpdHknOiAwXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIGlmIChib3JkZXJTdHlsZSkge1xuICAgICAgICAgICAgbmUudXRpbC5leHRlbmQoZG90U3R5bGUsIGJvcmRlclN0eWxlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRvdC5hdHRyKGRvdFN0eWxlKTtcblxuICAgICAgICByZXR1cm4gZG90O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgZG90cy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gZ3JvdXBQb3NpdGlvbnMgcG9zaXRpb25zXG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gY29sb3JzIGNvbG9yc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBib3JkZXJTdHlsZSBib3JkZXIgc3R5bGVcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPG9iamVjdD59IGRvdHNcbiAgICAgKi9cbiAgICByZW5kZXJEb3RzOiBmdW5jdGlvbihwYXBlciwgZ3JvdXBQb3NpdGlvbnMsIGNvbG9ycywgYm9yZGVyU3R5bGUpIHtcbiAgICAgICAgdmFyIGRvdHMgPSBuZS51dGlsLm1hcChncm91cFBvc2l0aW9ucywgZnVuY3Rpb24ocG9zaXRpb25zLCBncm91cEluZGV4KSB7XG4gICAgICAgICAgICB2YXIgY29sb3IgPSBjb2xvcnNbZ3JvdXBJbmRleF07XG4gICAgICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAocG9zaXRpb25zLCBmdW5jdGlvbihwb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIHZhciBkb3QgPSB0aGlzLnJlbmRlckRvdChwYXBlciwgcG9zaXRpb24sIGNvbG9yLCBib3JkZXJTdHlsZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvdDtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICByZXR1cm4gZG90cztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNlbnRlciBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBmcm9tUG9zIGZyb20gcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gdG9Qb3MgdG8gcG9zaXRpb25cbiAgICAgKiBAcmV0dXJucyB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBwb3NpdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldENlbnRlcjogZnVuY3Rpb24oZnJvbVBvcywgdG9Qb3MpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxlZnQ6IChmcm9tUG9zLmxlZnQgKyB0b1Bvcy5sZWZ0KSAvIDIsXG4gICAgICAgICAgICB0b3A6IChmcm9tUG9zLnRvcCArIHRvUG9zLnRvcCkgLyAyXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJpbmQgaG92ZXIgZXZlbnQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRhcmdldCByYXBoYWVsIGl0ZW1cbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gcG9zaXRpb24gcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgaWRcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBpbkNhbGxiYWNrIGluIGNhbGxiYWNrXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gb3V0Q2FsbGJhY2sgb3V0IGNhbGxiYWNrXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYmluZEhvdmVyRXZlbnQ6IGZ1bmN0aW9uKHRhcmdldCwgcG9zaXRpb24sIGlkLCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjaykge1xuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgIHRhcmdldC5ob3ZlcihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoYXQuc2hvd2VkSWQgPSBpZDtcbiAgICAgICAgICAgIGluQ2FsbGJhY2socG9zaXRpb24sIGlkKTtcbiAgICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBvdXRDYWxsYmFjayhpZCk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggZXZlbnQuXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXkuPG9iamVjdD4+fSBncm91cERvdHMgZG90c1xuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gZ3JvdXBQb3NpdGlvbnMgcG9zaXRpb25zXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG91dERvdFN0eWxlIGRvdCBzdHlsZVxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGluQ2FsbGJhY2sgaW4gY2FsbGJhY2tcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvdXRDYWxsYmFjayBvdXQgY2FsbGJhY2tcbiAgICAgKi9cbiAgICBhdHRhY2hFdmVudDogZnVuY3Rpb24oZ3JvdXBEb3RzLCBncm91cFBvc2l0aW9ucywgb3V0RG90U3R5bGUsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKSB7XG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaChncm91cERvdHMsIGZ1bmN0aW9uKGRvdHMsIGdyb3VwSW5kZXgpIHtcbiAgICAgICAgICAgIG5lLnV0aWwuZm9yRWFjaChkb3RzLCBmdW5jdGlvbihkb3QsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdmFyIHBvc2l0aW9uID0gZ3JvdXBQb3NpdGlvbnNbZ3JvdXBJbmRleF1baW5kZXhdLFxuICAgICAgICAgICAgICAgICAgICBpZCA9IGluZGV4ICsgJy0nICsgZ3JvdXBJbmRleDtcbiAgICAgICAgICAgICAgICB0aGlzLl9iaW5kSG92ZXJFdmVudChkb3QsIHBvc2l0aW9uLCBpZCwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTaG93IGFuaW1hdGlvbi5cbiAgICAgKiBAcGFyYW0ge3tncm91cEluZGV4OiBudW1iZXIsIGluZGV4Om51bWJlcn19IGRhdGEgc2hvdyBpbmZvXG4gICAgICovXG4gICAgc2hvd0FuaW1hdGlvbjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgaW5kZXggPSBkYXRhLmdyb3VwSW5kZXgsIC8vIExpbmUgY2hhcnQgaGFzIHBpdm90IHZhbHVlcy5cbiAgICAgICAgICAgIGdyb3VwSW5kZXggPSBkYXRhLmluZGV4LFxuICAgICAgICAgICAgZG90ID0gdGhpcy5ncm91cERvdHNbZ3JvdXBJbmRleF1baW5kZXhdO1xuXG4gICAgICAgIGRvdC5hdHRyKHtcbiAgICAgICAgICAgICdmaWxsLW9wYWNpdHknOiAxLFxuICAgICAgICAgICAgJ3N0cm9rZS1vcGFjaXR5JzogMC4zLFxuICAgICAgICAgICAgJ3N0cm9rZS13aWR0aCc6IDMsXG4gICAgICAgICAgICByOiBIT1ZFUl9ET1RfV0lEVEhcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhpZGUgYW5pbWF0aW9uLlxuICAgICAqIEBwYXJhbSB7e2dyb3VwSW5kZXg6IG51bWJlciwgaW5kZXg6bnVtYmVyfX0gZGF0YSBoaWRlIGluZm9cbiAgICAgKi9cbiAgICBoaWRlQW5pbWF0aW9uOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBpbmRleCA9IGRhdGEuZ3JvdXBJbmRleCwgLy8gTGluZSBjaGFydCBoYXMgcGl2b3QgdmFsdWVzLlxuICAgICAgICAgICAgZ3JvdXBJbmRleCA9IGRhdGEuaW5kZXgsXG4gICAgICAgICAgICBkb3QgPSB0aGlzLmdyb3VwRG90c1tncm91cEluZGV4XVtpbmRleF07XG5cbiAgICAgICAgZG90LmF0dHIodGhpcy5vdXREb3RTdHlsZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFuaW1hdGUgbGluZS5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gbGluZSByYXBoYWVsIG9iamVjdFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBsaW5lUGF0aCBsaW5lIHBhdGhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdGltZSBwbGF5IHRpbWVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3RhcnRUaW1lIHN0YXJ0IHRpbWVcbiAgICAgKi9cbiAgICBhbmltYXRlTGluZTogZnVuY3Rpb24obGluZSwgbGluZVBhdGgsIHRpbWUsIHN0YXJ0VGltZSkge1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbGluZS5hbmltYXRlKHtwYXRoOiBsaW5lUGF0aH0sIHRpbWUpO1xuICAgICAgICB9LCBzdGFydFRpbWUpO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhcGhhZWxMaW5lVHlwZUJhc2U7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgUmFwaGFlbFBpZUNoYXJ0cyBpcyBncmFwaCByZW5kZXJlciBmb3IgcGllIGNoYXJ0LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgcmFwaGFlbFJlbmRlclV0aWwgPSByZXF1aXJlKCcuL3JhcGhhZWxSZW5kZXJVdGlsJyk7XG5cbnZhciBSYXBoYWVsID0gd2luZG93LlJhcGhhZWwsXG4gICAgQU5HTEVfMTgwID0gMTgwLFxuICAgIEFOR0xFXzkwID0gOTAsXG4gICAgUkFEID0gTWF0aC5QSSAvIEFOR0xFXzE4MCxcbiAgICBBTklNQVRJT05fVElNRSA9IDUwMCxcbiAgICBMT0FESU5HX0FOSU1BVElPTl9USU1FID0gNzAwO1xuXG4vKipcbiAqIEBjbGFzc2Rlc2MgUmFwaGFlbFBpZUNoYXJ0cyBpcyBncmFwaCByZW5kZXJlciBmb3IgcGllIGNoYXJ0LlxuICogQGNsYXNzIFJhcGhhZWxQaWVDaGFydFxuICovXG52YXIgUmFwaGFlbFBpZUNoYXJ0ID0gbmUudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIFJhcGhhZWxQaWVDaGFydC5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIFJlbmRlciBmdW5jdGlvbiBvZiBwaWUgY2hhcnQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY29udGFpbmVyXG4gICAgICogQHBhcmFtIHt7c2VjdG9yc0luZm86IGFycmF5LjxvYmplY3Q+LCBjaXJjbGVCb3VuZDoge2N4OiBudW1iZXIsIGN5OiBudW1iZXIsIHI6IG51bWJlcn0sIGRpbWVuc2lvbjogb2JqZWN0LCB0aGVtZTogb2JqZWN0LCBvcHRpb25zOiBvYmplY3R9fSBkYXRhIHJlbmRlciBkYXRhXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gaW5DYWxsYmFjayBpbiBjYWxsYmFja1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG91dENhbGxiYWNrIG91dCBjYWxsYmFja1xuICAgICAqIEByZXR1cm4ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqL1xuICAgIHJlbmRlcjogZnVuY3Rpb24ocGFwZXIsIGNvbnRhaW5lciwgZGF0YSwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGRpbWVuc2lvbiA9IGRhdGEuZGltZW5zaW9uO1xuXG4gICAgICAgIGlmICghcGFwZXIpIHtcbiAgICAgICAgICAgIHBhcGVyID0gUmFwaGFlbChjb250YWluZXIsIGRpbWVuc2lvbi53aWR0aCwgZGltZW5zaW9uLmhlaWdodCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXBhcGVyLmN1c3RvbUF0dHJpYnV0ZXMuc2VjdG9yKSB7XG4gICAgICAgICAgICBwYXBlci5jdXN0b21BdHRyaWJ1dGVzLnNlY3RvciA9IG5lLnV0aWwuYmluZCh0aGlzLl9tYWtlU2VjdG9yUGF0aCwgdGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNpcmNsZUJvdW5kID0gZGF0YS5jaXJjbGVCb3VuZDtcbiAgICAgICAgdGhpcy5fcmVuZGVyUGllKHBhcGVyLCBkYXRhLCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjayk7XG5cbiAgICAgICAgcmV0dXJuIHBhcGVyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHNlY3RvciBwYXRoLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjeCBjZW50ZXIgeFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjeSBjZW50ZXIgeVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSByIHJhZGl1c1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdGFydEFuZ2xlIHN0YXJ0IGFuZ2xlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGVuZEFuZ2xlIGVuZCBhbmdlbFxuICAgICAqIEByZXR1cm5zIHt7cGF0aDogYXJyYXl9fSBzZWN0b3IgcGF0aFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VTZWN0b3JQYXRoOiBmdW5jdGlvbihjeCwgY3ksIHIsIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlKSB7XG4gICAgICAgIHZhciB4MSA9IGN4ICsgciAqIE1hdGguY29zKC0oc3RhcnRBbmdsZSAtIEFOR0xFXzkwKSAqIFJBRCksIC8vIOybkCDtmLjsnZgg7Iuc7J6RIHgg7KKM7ZGcXG4gICAgICAgICAgICB5MSA9IGN5IC0gciAqIE1hdGguc2luKC0oc3RhcnRBbmdsZSAtIEFOR0xFXzkwKSAqIFJBRCksIC8vIOybkCDtmLjsnZgg7Iuc7J6RIHkg7KKM7ZGcXG4gICAgICAgICAgICB4MiA9IGN4ICsgciAqIE1hdGguY29zKC0oZW5kQW5nbGUgLSBBTkdMRV85MCkgKiBSQUQpLC8vIOybkCDtmLjsnZgg7KKF66OMIHgg7KKM7ZGcXG4gICAgICAgICAgICB5MiA9IGN5IC0gciAqIE1hdGguc2luKC0oZW5kQW5nbGUgLSBBTkdMRV85MCkgKiBSQUQpLCAvLyDsm5Ag7Zi47J2YIOyiheujjCB5IOyijO2RnFxuICAgICAgICAgICAgbGFyZ2VBcmNGbGFnID0gZW5kQW5nbGUgLSBzdGFydEFuZ2xlID4gQU5HTEVfMTgwID8gMSA6IDAsXG4gICAgICAgICAgICBwYXRoID0gW1wiTVwiLCBjeCwgY3ksXG4gICAgICAgICAgICAgICAgXCJMXCIsIHgyLCB5MixcbiAgICAgICAgICAgICAgICBcIkFcIiwgciwgciwgMCwgbGFyZ2VBcmNGbGFnLCAwLCB4MSwgeTEsXG4gICAgICAgICAgICAgICAgXCJaXCJcbiAgICAgICAgICAgIF07XG4gICAgICAgIHJldHVybiB7cGF0aDogcGF0aH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBzZWN0b3JcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMucGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqICAgICAgQHBhcmFtIHt7Y3g6IG51bWJlciwgY3k6IG51bWJlciwgcjpudW1iZXJ9fSBwYXJhbXMuY2lyY2xlQm91bmQgY2lyY2xlIGJvdW5kc1xuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5zdGFydEFuZ2xlIHN0YXJ0IGFuZ2xlXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmVuZEFuZ2xlIGVuZCBhbmdsZVxuICAgICAqICAgICAgQHBhcmFtIHt7ZmlsbDogc3RyaW5nLCBzdHJva2U6IHN0cmluZywgc3RyaWtlLXdpZHRoOiBzdHJpbmd9fSBwYXJhbXMuYXR0cnMgYXR0cnNcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSByYXBoYWVsIG9iamVjdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlclNlY3RvcjogZnVuY3Rpb24gKHBhcmFtcykge1xuICAgICAgICB2YXIgY2lyY2xlQm91bmQgPSBwYXJhbXMuY2lyY2xlQm91bmQsXG4gICAgICAgICAgICBhbmdsZXMgPSBwYXJhbXMuYW5nbGVzO1xuICAgICAgICByZXR1cm4gcGFyYW1zLnBhcGVyLnBhdGgoKS5hdHRyKHtcbiAgICAgICAgICAgIHNlY3RvcjogW2NpcmNsZUJvdW5kLmN4LCBjaXJjbGVCb3VuZC5jeSwgY2lyY2xlQm91bmQuciwgYW5nbGVzLnN0YXJ0QW5nbGUsIGFuZ2xlcy5lbmRBbmdsZV1cbiAgICAgICAgfSkuYXR0cihwYXJhbXMuYXR0cnMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgcGllIGdyYXBoLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICogQHBhcmFtIHt7c2VjdG9yc0luZm86IGFycmF5LjxvYmplY3Q+LCBjaXJjbGVCb3VuZDoge2N4OiBudW1iZXIsIGN5OiBudW1iZXIsIHI6IG51bWJlcn0sIGRpbWVuc2lvbjogb2JqZWN0LCB0aGVtZTogb2JqZWN0LCBvcHRpb25zOiBvYmplY3R9fSBkYXRhIHJlbmRlciBkYXRhXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gaW5DYWxsYmFjayBpbiBjYWxsYmFja1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG91dENhbGxiYWNrIG91dCBjYWxsYmFja1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlclBpZTogZnVuY3Rpb24ocGFwZXIsIGRhdGEsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKSB7XG4gICAgICAgIHZhciBjaXJjbGVCb3VuZCA9IGRhdGEuY2lyY2xlQm91bmQsXG4gICAgICAgICAgICBjb2xvcnMgPSBkYXRhLnRoZW1lLmNvbG9ycyxcbiAgICAgICAgICAgIGNoYXJ0QmFja2dyb3VuZCA9IGRhdGEuY2hhcnRCYWNrZ3JvdW5kLFxuICAgICAgICAgICAgc2VjdG9ycyA9IFtdO1xuXG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KGRhdGEuc2VjdG9yc0luZm8sIGZ1bmN0aW9uKHNlY3RvckluZm8sIGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgcGVyY2VudFZhbHVlID0gc2VjdG9ySW5mby5wZXJjZW50VmFsdWUsXG4gICAgICAgICAgICAgICAgY29sb3IgPSBjb2xvcnNbaW5kZXhdLFxuICAgICAgICAgICAgICAgIHNlY3RvciA9IHRoaXMuX3JlbmRlclNlY3Rvcih7XG4gICAgICAgICAgICAgICAgICAgIHBhcGVyOiBwYXBlcixcbiAgICAgICAgICAgICAgICAgICAgY2lyY2xlQm91bmQ6IGNpcmNsZUJvdW5kLFxuICAgICAgICAgICAgICAgICAgICBhbmdsZXM6IHNlY3RvckluZm8uYW5nbGVzLnN0YXJ0LFxuICAgICAgICAgICAgICAgICAgICBhdHRyczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsbDogY29sb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJva2U6IGNoYXJ0QmFja2dyb3VuZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICdzdHJva2Utd2lkdGgnOiAxXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5fYmluZEhvdmVyRXZlbnQoe1xuICAgICAgICAgICAgICAgIHRhcmdldDogc2VjdG9yLFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBzZWN0b3JJbmZvLnBvcHVwUG9zaXRpb24sXG4gICAgICAgICAgICAgICAgaWQ6ICcwLScgKyBpbmRleCxcbiAgICAgICAgICAgICAgICBpbkNhbGxiYWNrOiBpbkNhbGxiYWNrLFxuICAgICAgICAgICAgICAgIG91dENhbGxiYWNrOiBvdXRDYWxsYmFja1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHNlY3RvcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgc2VjdG9yOiBzZWN0b3IsXG4gICAgICAgICAgICAgICAgYW5nbGVzOiBzZWN0b3JJbmZvLmFuZ2xlcy5lbmQsXG4gICAgICAgICAgICAgICAgcGVyY2VudFZhbHVlOiBwZXJjZW50VmFsdWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICB0aGlzLnNlY3RvcnMgPSBzZWN0b3JzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgbGVnZW5kIGxpbmVzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciBwYXBlclxuICAgICAqIEBwYXJhbSB7YXJyYXkuPG9iamVjdD59IG91dGVyUG9zaXRpb25zIG91dGVyIHBvc2l0aW9uXG4gICAgICovXG4gICAgcmVuZGVyTGVnZW5kTGluZXM6IGZ1bmN0aW9uKHBhcGVyLCBvdXRlclBvc2l0aW9ucykge1xuICAgICAgICB2YXIgcGF0aHMgPSB0aGlzLl9tYWtlTGluZVBhdGhzKG91dGVyUG9zaXRpb25zKSxcbiAgICAgICAgICAgIGxlZ2VuZExpbmVzID0gbmUudXRpbC5tYXAocGF0aHMsIGZ1bmN0aW9uKHBhdGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmFwaGFlbFJlbmRlclV0aWwucmVuZGVyTGluZShwYXBlciwgcGF0aCwgJ3RyYW5zcGFyZW50JywgMSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5sZWdlbmRMaW5lcyA9IGxlZ2VuZExpbmVzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGxpbmUgcGF0aHMuXG4gICAgICogQHBhcmFtIHthcnJheS48b2JqZWN0Pn0gb3V0ZXJQb3NpdGlvbnMgb3V0ZXIgcG9zaXRpb25zXG4gICAgICogQHJldHVybnMge0FycmF5fSBsaW5lIHBhdGhzLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VMaW5lUGF0aHM6IGZ1bmN0aW9uKG91dGVyUG9zaXRpb25zKSB7XG4gICAgICAgIHZhciBwYXRocyA9IG5lLnV0aWwubWFwKG91dGVyUG9zaXRpb25zLCBmdW5jdGlvbihwb3NpdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgcmFwaGFlbFJlbmRlclV0aWwubWFrZUxpbmVQYXRoKHBvc2l0aW9ucy5zdGFydCwgcG9zaXRpb25zLm1pZGRsZSksXG4gICAgICAgICAgICAgICAgcmFwaGFlbFJlbmRlclV0aWwubWFrZUxpbmVQYXRoKHBvc2l0aW9ucy5taWRkbGUsIHBvc2l0aW9ucy5lbmQpXG4gICAgICAgICAgICBdLmpvaW4oJycpO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIHBhdGhzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBCaW5kIGhvdmVyIGV2ZW50LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50YXJnZXQgcmFwaGFlbCBpdGVtXG4gICAgICogICAgICBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gcGFyYW1zLnBvc2l0aW9uIHBvc2l0aW9uXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLmlkIGlkXG4gICAgICogICAgICBAcGFyYW0ge2Z1bmN0aW9ufSBwYXJhbXMuaW5DYWxsYmFjayBpbiBjYWxsYmFja1xuICAgICAqICAgICAgQHBhcmFtIHtmdW5jdGlvbn0gcGFyYW1zLm91dENhbGxiYWNrIG91dCBjYWxsYmFja1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2JpbmRIb3ZlckV2ZW50OiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgcGFyYW1zLnRhcmdldC5tb3VzZW92ZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcGFyYW1zLmluQ2FsbGJhY2socGFyYW1zLnBvc2l0aW9uLCBwYXJhbXMuaWQpO1xuICAgICAgICB9KS5tb3VzZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBwYXJhbXMub3V0Q2FsbGJhY2socGFyYW1zLmlkKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNob3cgYW5pbWF0aW9uLlxuICAgICAqIEBwYXJhbSB7e2dyb3VwSW5kZXg6IG51bWJlciwgaW5kZXg6bnVtYmVyfX0gZGF0YSBzaG93IGluZm9cbiAgICAgKi9cbiAgICBzaG93QW5pbWF0aW9uOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBzZWN0b3IgPSB0aGlzLnNlY3RvcnNbZGF0YS5pbmRleF0uc2VjdG9yLFxuICAgICAgICAgICAgY3ggPSB0aGlzLmNpcmNsZUJvdW5kLmN4LFxuICAgICAgICAgICAgY3kgPSB0aGlzLmNpcmNsZUJvdW5kLmN5O1xuICAgICAgICBzZWN0b3IuYW5pbWF0ZSh7XG4gICAgICAgICAgICB0cmFuc2Zvcm06IFwiczEuMSAxLjEgXCIgKyBjeCArIFwiIFwiICsgY3lcbiAgICAgICAgfSwgQU5JTUFUSU9OX1RJTUUsIFwiZWxhc3RpY1wiKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSGlkZSBhbmltYXRpb24uXG4gICAgICogQHBhcmFtIHt7Z3JvdXBJbmRleDogbnVtYmVyLCBpbmRleDpudW1iZXJ9fSBkYXRhIGhpZGUgaW5mb1xuICAgICAqL1xuICAgIGhpZGVBbmltYXRpb246IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIHNlY3RvciA9IHRoaXMuc2VjdG9yc1tkYXRhLmluZGV4XS5zZWN0b3I7XG4gICAgICAgIHNlY3Rvci5hbmltYXRlKHt0cmFuc2Zvcm06IFwiXCJ9LCBBTklNQVRJT05fVElNRSwgXCJlbGFzdGljXCIpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBbmltYXRlLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIGNhbGxiYWNrXG4gICAgICovXG4gICAgYW5pbWF0ZTogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGRlbGF5VGltZSA9IDAsXG4gICAgICAgICAgICBjaXJjbGVCb3VuZCA9IHRoaXMuY2lyY2xlQm91bmQ7XG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KHRoaXMuc2VjdG9ycywgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgdmFyIGFuZ2xlcyA9IGl0ZW0uYW5nbGVzLFxuICAgICAgICAgICAgICAgIGFuaW1hdGlvblRpbWUgPSBMT0FESU5HX0FOSU1BVElPTl9USU1FICogaXRlbS5wZXJjZW50VmFsdWUsXG4gICAgICAgICAgICAgICAgYW5pbSA9IFJhcGhhZWwuYW5pbWF0aW9uKHtcbiAgICAgICAgICAgICAgICAgICAgc2VjdG9yOiBbY2lyY2xlQm91bmQuY3gsIGNpcmNsZUJvdW5kLmN5LCBjaXJjbGVCb3VuZC5yLCBhbmdsZXMuc3RhcnRBbmdsZSwgYW5nbGVzLmVuZEFuZ2xlXVxuICAgICAgICAgICAgICAgIH0sIGFuaW1hdGlvblRpbWUpO1xuICAgICAgICAgICAgaXRlbS5zZWN0b3IuYW5pbWF0ZShhbmltLmRlbGF5KGRlbGF5VGltZSkpO1xuICAgICAgICAgICAgZGVsYXlUaW1lICs9IGFuaW1hdGlvblRpbWU7XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgc2V0VGltZW91dChjYWxsYmFjaywgZGVsYXlUaW1lKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBbmltYXRlIGxlZ2VuZCBsaW5lcy5cbiAgICAgKi9cbiAgICBhbmltYXRlTGVnZW5kTGluZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXRoaXMubGVnZW5kTGluZXMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBuZS51dGlsLmZvckVhY2hBcnJheSh0aGlzLmxlZ2VuZExpbmVzLCBmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICBsaW5lLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgICdzdHJva2UnOiAnYmxhY2snLFxuICAgICAgICAgICAgICAgICdzdHJva2Utb3BhY2l0eSc6IDFcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSYXBoYWVsUGllQ2hhcnQ7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgVXRpbCBmb3IgcmFwaGFlbCByZW5kZXJpbmcuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVXRpbCBmb3IgcmFwaGFlbCByZW5kZXJpbmcuXG4gKiBAbW9kdWxlIHJhcGhhZWxSZW5kZXJVdGlsXG4gKi9cbnZhciByYXBoYWVsUmVuZGVyVXRpbCA9IHtcbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGxpbmUgcGF0aC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOnJhcGhhZWxSZW5kZXJVdGlsXG4gICAgICogQHBhcmFtIHt7dG9wOiBudW1iZXIsIGxlZnQ6IG51bWJlcn19IGZyb21Qb3MgZnJvbSBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7e3RvcDogbnVtYmVyLCBsZWZ0OiBudW1iZXJ9fSB0b1BvcyB0byBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aCB3aWR0aFxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IHBhdGhcbiAgICAgKi9cbiAgICBtYWtlTGluZVBhdGg6IGZ1bmN0aW9uKGZyb21Qb3MsIHRvUG9zLCB3aWR0aCkge1xuICAgICAgICB2YXIgZnJvbVBvaW50ID0gW2Zyb21Qb3MubGVmdCwgZnJvbVBvcy50b3BdLFxuICAgICAgICAgICAgdG9Qb2ludCA9IFt0b1Bvcy5sZWZ0LCB0b1Bvcy50b3BdO1xuXG4gICAgICAgIHdpZHRoID0gd2lkdGggfHwgMTtcblxuICAgICAgICBuZS51dGlsLmZvckVhY2hBcnJheShmcm9tUG9pbnQsIGZ1bmN0aW9uKGZyb20sIGluZGV4KSB7XG4gICAgICAgICAgICBpZiAoZnJvbSA9PT0gdG9Qb2ludFtpbmRleF0pIHtcbiAgICAgICAgICAgICAgICBmcm9tUG9pbnRbaW5kZXhdID0gdG9Qb2ludFtpbmRleF0gPSBNYXRoLnJvdW5kKGZyb20pIC0gKHdpZHRoICUgMiAvIDIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuICdNJyArIGZyb21Qb2ludC5qb2luKCcgJykgKyAnTCcgKyB0b1BvaW50LmpvaW4oJyAnKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGxpbmUuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpyYXBoYWVsUmVuZGVyVXRpbFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGggbGluZSBwYXRoXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbG9yIGxpbmUgY29sb3JcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3Ryb2tlV2lkdGggc3Ryb2tlIHdpZHRoXG4gICAgICogQHJldHVybnMge29iamVjdH0gcmFwaGFlbCBsaW5lXG4gICAgICovXG4gICAgcmVuZGVyTGluZTogZnVuY3Rpb24ocGFwZXIsIHBhdGgsIGNvbG9yLCBzdHJva2VXaWR0aCkge1xuICAgICAgICB2YXIgbGluZSA9IHBhcGVyLnBhdGgoW3BhdGhdKSxcbiAgICAgICAgICAgIHN0cm9rZVN0eWxlID0ge1xuICAgICAgICAgICAgICAgIHN0cm9rZTogY29sb3IsXG4gICAgICAgICAgICAgICAgJ3N0cm9rZS13aWR0aCc6IHN0cm9rZVdpZHRoIHx8IDJcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgaWYgKGNvbG9yID09PSAndHJhbnNwYXJlbnQnKSB7XG4gICAgICAgICAgICBzdHJva2VTdHlsZS5zdHJva2UgPSAnI2ZmZic7XG4gICAgICAgICAgICBzdHJva2VTdHlsZVsnc3Ryb2tlLW9wYWNpdHknXSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgbGluZS5hdHRyKHN0cm9rZVN0eWxlKTtcblxuICAgICAgICByZXR1cm4gbGluZTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJhcGhhZWxSZW5kZXJVdGlsO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4vY29uc3QuanMnKSxcbiAgICBjaGFydEZhY3RvcnkgPSByZXF1aXJlKCcuL2ZhY3Rvcmllcy9jaGFydEZhY3RvcnkuanMnKSxcbiAgICBCYXJDaGFydCA9IHJlcXVpcmUoJy4vY2hhcnRzL2JhckNoYXJ0LmpzJyksXG4gICAgQ29sdW1uQ2hhcnQgPSByZXF1aXJlKCcuL2NoYXJ0cy9jb2x1bW5DaGFydC5qcycpLFxuICAgIExpbmVDaGFydCA9IHJlcXVpcmUoJy4vY2hhcnRzL2xpbmVDaGFydC5qcycpLFxuICAgIEFyZWFDaGFydCA9IHJlcXVpcmUoJy4vY2hhcnRzL2FyZWFDaGFydC5qcycpLFxuICAgIENvbWJvQ2hhcnQgPSByZXF1aXJlKCcuL2NoYXJ0cy9jb21ib0NoYXJ0LmpzJyksXG4gICAgUGllQ2hhcnQgPSByZXF1aXJlKCcuL2NoYXJ0cy9waWVDaGFydC5qcycpO1xuXG5jaGFydEZhY3RvcnkucmVnaXN0ZXIoY2hhcnRDb25zdC5DSEFSVF9UWVBFX0JBUiwgQmFyQ2hhcnQpO1xuY2hhcnRGYWN0b3J5LnJlZ2lzdGVyKGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9DT0xVTU4sIENvbHVtbkNoYXJ0KTtcbmNoYXJ0RmFjdG9yeS5yZWdpc3RlcihjaGFydENvbnN0LkNIQVJUX1RZUEVfTElORSwgTGluZUNoYXJ0KTtcbmNoYXJ0RmFjdG9yeS5yZWdpc3RlcihjaGFydENvbnN0LkNIQVJUX1RZUEVfQVJFQSwgQXJlYUNoYXJ0KTtcbmNoYXJ0RmFjdG9yeS5yZWdpc3RlcihjaGFydENvbnN0LkNIQVJUX1RZUEVfQ09NQk8sIENvbWJvQ2hhcnQpO1xuY2hhcnRGYWN0b3J5LnJlZ2lzdGVyKGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9QSUUsIFBpZUNoYXJ0KTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuL2NvbnN0LmpzJyksXG4gICAgdGhlbWVGYWN0b3J5ID0gcmVxdWlyZSgnLi9mYWN0b3JpZXMvdGhlbWVGYWN0b3J5LmpzJyksXG4gICAgZGVmYXVsdFRoZW1lID0gcmVxdWlyZSgnLi90aGVtZXMvZGVmYXVsdFRoZW1lLmpzJyk7XG5cbnRoZW1lRmFjdG9yeS5yZWdpc3RlcihjaGFydENvbnN0LkRFRkFVTFRfVEhFTUVfTkFNRSwgZGVmYXVsdFRoZW1lKTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBBcmVhIGNoYXJ0IHNlcmllcyBjb21wb25lbnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTZXJpZXMgPSByZXF1aXJlKCcuL3Nlcmllcy5qcycpLFxuICAgIExpbmVUeXBlU2VyaWVzQmFzZSA9IHJlcXVpcmUoJy4vbGluZVR5cGVTZXJpZXNCYXNlLmpzJyk7XG5cbnZhciBBcmVhQ2hhcnRTZXJpZXMgPSBuZS51dGlsLmRlZmluZUNsYXNzKFNlcmllcywgLyoqIEBsZW5kcyBBcmVhQ2hhcnRTZXJpZXMucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBBcmVhIGNoYXJ0IHNlcmllcyBjb21wb25lbnQuXG4gICAgICogQGNvbnN0cnVjdHMgQXJlYUNoYXJ0U2VyaWVzXG4gICAgICogQGV4dGVuZHMgU2VyaWVzXG4gICAgICogQG1peGVzIExpbmVUeXBlU2VyaWVzQmFzZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5tb2RlbCBzZXJpZXMgbW9kZWxcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMub3B0aW9ucyBzZXJpZXMgb3B0aW9uc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBzZXJpZXMgdGhlbWVcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgU2VyaWVzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYWRkIGRhdGEuXG4gICAgICogQHJldHVybnMge29iamVjdH0gYWRkIGRhdGFcbiAgICAgKi9cbiAgICBtYWtlQWRkRGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBkaW1lbnNpb24gPSB0aGlzLmJvdW5kLmRpbWVuc2lvbixcbiAgICAgICAgICAgIHNjYWxlRGlzdGFuY2UgPSB0aGlzLmdldFNjYWxlRGlzdGFuY2VGcm9tWmVyb1BvaW50KGRpbWVuc2lvbi5oZWlnaHQsIHRoaXMuZGF0YS5zY2FsZSksXG4gICAgICAgICAgICB6ZXJvVG9wID0gc2NhbGVEaXN0YW5jZS50b01heDtcbiAgICAgICAgaWYgKHRoaXMuZGF0YS5zY2FsZS5taW4gPj0gMCAmJiAhemVyb1RvcCkge1xuICAgICAgICAgICAgemVyb1RvcCA9IGRpbWVuc2lvbi5oZWlnaHQ7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZ3JvdXBQb3NpdGlvbnM6IHRoaXMubWFrZVBvc2l0aW9ucyhkaW1lbnNpb24pLFxuICAgICAgICAgICAgemVyb1RvcDogemVyb1RvcFxuICAgICAgICB9O1xuICAgIH1cbn0pO1xuXG5MaW5lVHlwZVNlcmllc0Jhc2UubWl4aW4oQXJlYUNoYXJ0U2VyaWVzKTtcblxubW9kdWxlLmV4cG9ydHMgPSBBcmVhQ2hhcnRTZXJpZXM7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgQmFyIGNoYXJ0IHNlcmllcyBjb21wb25lbnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTZXJpZXMgPSByZXF1aXJlKCcuL3Nlcmllcy5qcycpLFxuICAgIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuLi9jb25zdC5qcycpLFxuICAgIGRvbSA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZG9tSGFuZGxlci5qcycpLFxuICAgIHJlbmRlclV0aWwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3JlbmRlclV0aWwuanMnKTtcblxudmFyIEJhckNoYXJ0U2VyaWVzID0gbmUudXRpbC5kZWZpbmVDbGFzcyhTZXJpZXMsIC8qKiBAbGVuZHMgQmFyQ2hhcnRTZXJpZXMucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBCYXIgY2hhcnQgc2VyaWVzIGNvbXBvbmVudC5cbiAgICAgKiBAY29uc3RydWN0cyBCYXJDaGFydFNlcmllc1xuICAgICAqIEBleHRlbmRzIFNlcmllc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5tb2RlbCBzZXJpZXMgbW9kZWxcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMub3B0aW9ucyBzZXJpZXMgb3B0aW9uc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBzZXJpZXMgdGhlbWVcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgU2VyaWVzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYm91bmRzIG9mIGJhciBjaGFydC5cbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6bnVtYmVyfX0gZGltZW5zaW9uIGJhciBjaGFydCBkaW1lbnNpb25cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaGlkZGVuV2lkdGggaGlkZGVuIHdpZHRoXG4gICAgICogQHJldHVybnMge2FycmF5LjxhcnJheS48b2JqZWN0Pj59IGJvdW5kc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VCb3VuZHM6IGZ1bmN0aW9uKGRpbWVuc2lvbiwgaGlkZGVuV2lkdGgpIHtcbiAgICAgICAgaGlkZGVuV2lkdGggPSBoaWRkZW5XaWR0aCB8fCAocmVuZGVyVXRpbC5pc0lFOCgpID8gMCA6IGNoYXJ0Q29uc3QuSElEREVOX1dJRFRIKTtcbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuc3RhY2tlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21ha2VOb3JtYWxCYXJCb3VuZHMoZGltZW5zaW9uLCBoaWRkZW5XaWR0aCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbWFrZVN0YWNrZWRCYXJCb3VuZHMoZGltZW5zaW9uLCBoaWRkZW5XaWR0aCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBhZGQgZGF0YS5cbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBhZGQgZGF0YVxuICAgICAqL1xuICAgIG1ha2VBZGREYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGdyb3VwQm91bmRzID0gdGhpcy5fbWFrZUJvdW5kcyh0aGlzLmJvdW5kLmRpbWVuc2lvbik7XG5cbiAgICAgICAgdGhpcy5ncm91cEJvdW5kcyA9IGdyb3VwQm91bmRzO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBncm91cEJvdW5kczogZ3JvdXBCb3VuZHNcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBib3VuZHMgb2Ygbm9ybWFsIGJhciBjaGFydC5cbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6bnVtYmVyfX0gZGltZW5zaW9uIGJhciBjaGFydCBkaW1lbnNpb25cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaGlkZGVuV2lkdGggaGlkZGVuIHdpZHRoXG4gICAgICogQHJldHVybnMge2FycmF5LjxhcnJheS48b2JqZWN0Pj59IGJvdW5kc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VOb3JtYWxCYXJCb3VuZHM6IGZ1bmN0aW9uKGRpbWVuc2lvbiwgaGlkZGVuV2lkdGgpIHtcbiAgICAgICAgdmFyIGdyb3VwVmFsdWVzID0gdGhpcy5wZXJjZW50VmFsdWVzLFxuICAgICAgICAgICAgZ3JvdXBIZWlnaHQgPSAoZGltZW5zaW9uLmhlaWdodCAvIGdyb3VwVmFsdWVzLmxlbmd0aCksXG4gICAgICAgICAgICBiYXJIZWlnaHQgPSBncm91cEhlaWdodCAvIChncm91cFZhbHVlc1swXS5sZW5ndGggKyAxKSxcbiAgICAgICAgICAgIHNjYWxlRGlzdGFuY2UgPSB0aGlzLmdldFNjYWxlRGlzdGFuY2VGcm9tWmVyb1BvaW50KGRpbWVuc2lvbi53aWR0aCwgdGhpcy5kYXRhLnNjYWxlKSxcbiAgICAgICAgICAgIGJvdW5kcyA9IG5lLnV0aWwubWFwKGdyb3VwVmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMsIGdyb3VwSW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFkZGluZ1RvcCA9IChncm91cEhlaWdodCAqIGdyb3VwSW5kZXgpICsgKGJhckhlaWdodCAvIDIpICsgaGlkZGVuV2lkdGg7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24gKHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdG9wID0gcGFkZGluZ1RvcCArIChiYXJIZWlnaHQgKiBpbmRleCksXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydExlZnQgPSAtY2hhcnRDb25zdC5ISURERU5fV0lEVEgsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmRMZWZ0ID0gc3RhcnRMZWZ0LFxuICAgICAgICAgICAgICAgICAgICAgICAgYmFyV2lkdGggPSB2YWx1ZSAqIGRpbWVuc2lvbi53aWR0aDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFyV2lkdGggKj0gLTE7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydExlZnQgKz0gc2NhbGVEaXN0YW5jZS50b01pbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZExlZnQgKz0gc2NhbGVEaXN0YW5jZS50b01pbiAtIGJhcldpZHRoO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRMZWZ0ICs9IHNjYWxlRGlzdGFuY2UudG9NaW47XG4gICAgICAgICAgICAgICAgICAgICAgICBlbmRMZWZ0ICs9IHNjYWxlRGlzdGFuY2UudG9NaW47XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3A6IHRvcCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiBzdGFydExlZnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBiYXJIZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3A6IHRvcCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiBlbmRMZWZ0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiBiYXJXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IGJhckhlaWdodFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBib3VuZHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYm91bmRzIG9mIHN0YWNrZWQgYmFyIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDpudW1iZXJ9fSBkaW1lbnNpb24gYmFyIGNoYXJ0IGRpbWVuc2lvblxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBoaWRkZW5XaWR0aCBoaWRkZW4gd2lkdGhcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gYm91bmRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVN0YWNrZWRCYXJCb3VuZHM6IGZ1bmN0aW9uKGRpbWVuc2lvbiwgaGlkZGVuV2lkdGgpIHtcbiAgICAgICAgdmFyIGdyb3VwVmFsdWVzID0gdGhpcy5wZXJjZW50VmFsdWVzLFxuICAgICAgICAgICAgZ3JvdXBIZWlnaHQgPSAoZGltZW5zaW9uLmhlaWdodCAvIGdyb3VwVmFsdWVzLmxlbmd0aCksXG4gICAgICAgICAgICBiYXJIZWlnaHQgPSBncm91cEhlaWdodCAvIDIsXG4gICAgICAgICAgICBib3VuZHMgPSBuZS51dGlsLm1hcChncm91cFZhbHVlcywgZnVuY3Rpb24gKHZhbHVlcywgZ3JvdXBJbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciBwYWRkaW5nVG9wID0gKGdyb3VwSGVpZ2h0ICogZ3JvdXBJbmRleCkgKyAoYmFySGVpZ2h0IC8gMikgKyBoaWRkZW5XaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgbGVmdCA9IC1jaGFydENvbnN0LkhJRERFTl9XSURUSDtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHdpZHRoLCBib3VuZDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgd2lkdGggPSB2YWx1ZSAqIGRpbWVuc2lvbi53aWR0aDtcbiAgICAgICAgICAgICAgICAgICAgYm91bmQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogcGFkZGluZ1RvcCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiAtY2hhcnRDb25zdC5ISURERU5fV0lEVEgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBiYXJIZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3A6IHBhZGRpbmdUb3AsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogbGVmdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogd2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBiYXJIZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgbGVmdCA9IGxlZnQgKyB3aWR0aDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJvdW5kO1xuICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBib3VuZHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBub3JtYWwgc2VyaWVzIGxhYmVsLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtIVE1MRWxlbWVudH0gcGFyYW1zLmNvbnRhaW5lciBjb250YWluZXJcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gcGFyYW1zLmdyb3VwQm91bmRzIGdyb3VwIGJvdW5kc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48YXJyYXk+fSBwYXJhbXMuZm9ybWF0dGVkVmFsdWVzIGZvcm1hdHRlZCB2YWx1ZXNcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHNlcmllcyBsYWJlbCBhcmVhXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyTm9ybWFsU2VyaWVzTGFiZWw6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgZ3JvdXBCb3VuZHMgPSBwYXJhbXMuZ3JvdXBCb3VuZHMsXG4gICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXMgPSBwYXJhbXMuZm9ybWF0dGVkVmFsdWVzLFxuICAgICAgICAgICAgbGFiZWxIZWlnaHQgPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxIZWlnaHQoZm9ybWF0dGVkVmFsdWVzWzBdWzBdLCB0aGlzLnRoZW1lLmxhYmVsKSxcbiAgICAgICAgICAgIGVsU2VyaWVzTGFiZWxBcmVhID0gZG9tLmNyZWF0ZSgnZGl2JywgJ25lLWNoYXJ0LXNlcmllcy1sYWJlbC1hcmVhJyksXG4gICAgICAgICAgICBodG1sO1xuICAgICAgICBodG1sID0gbmUudXRpbC5tYXAocGFyYW1zLnZhbHVlcywgZnVuY3Rpb24odmFsdWVzLCBncm91cEluZGV4KSB7XG4gICAgICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgYm91bmQgPSBncm91cEJvdW5kc1tncm91cEluZGV4XVtpbmRleF0uZW5kLFxuICAgICAgICAgICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZSA9IGZvcm1hdHRlZFZhbHVlc1tncm91cEluZGV4XVtpbmRleF0sXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsV2lkdGggPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxXaWR0aChmb3JtYXR0ZWRWYWx1ZSwgdGhpcy50aGVtZS5sYWJlbCksXG4gICAgICAgICAgICAgICAgICAgIGxlZnQgPSBib3VuZC5sZWZ0LFxuICAgICAgICAgICAgICAgICAgICBsYWJlbEh0bWw7XG5cbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICBsZWZ0ICs9IGJvdW5kLndpZHRoICsgY2hhcnRDb25zdC5TRVJJRVNfTEFCRUxfUEFERElORztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsZWZ0IC09IGxhYmVsV2lkdGggKyBjaGFydENvbnN0LlNFUklFU19MQUJFTF9QQURESU5HO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsYWJlbEh0bWwgPSB0aGlzLl9tYWtlU2VyaWVzTGFiZWxIdG1sKHtcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogbGVmdCxcbiAgICAgICAgICAgICAgICAgICAgdG9wOiBib3VuZC50b3AgKyAoYm91bmQuaGVpZ2h0IC0gbGFiZWxIZWlnaHQgKyBjaGFydENvbnN0LlRFWFRfUEFERElORykgLyAyXG4gICAgICAgICAgICAgICAgfSwgZm9ybWF0dGVkVmFsdWUsIGdyb3VwSW5kZXgsIGluZGV4KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGFiZWxIdG1sO1xuICAgICAgICAgICAgfSwgdGhpcykuam9pbignJyk7XG4gICAgICAgIH0sIHRoaXMpLmpvaW4oJycpO1xuXG4gICAgICAgIGVsU2VyaWVzTGFiZWxBcmVhLmlubmVySFRNTCA9IGh0bWw7XG4gICAgICAgIHBhcmFtcy5jb250YWluZXIuYXBwZW5kQ2hpbGQoZWxTZXJpZXNMYWJlbEFyZWEpO1xuXG4gICAgICAgIHJldHVybiBlbFNlcmllc0xhYmVsQXJlYTtcbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgc3RhY2tlZCBzZXJpZXMgbGFiZWwuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge0hUTUxFbGVtZW50fSBwYXJhbXMuY29udGFpbmVyIGNvbnRhaW5lclxuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48YXJyYXk+fSBwYXJhbXMuZ3JvdXBCb3VuZHMgZ3JvdXAgYm91bmRzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IHBhcmFtcy5mb3JtYXR0ZWRWYWx1ZXMgZm9ybWF0dGVkIHZhbHVlc1xuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gc2VyaWVzIGxhYmVsIGFyZWFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJTdGFja2VkU2VyaWVzTGFiZWw6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgZ3JvdXBCb3VuZHMgPSBwYXJhbXMuZ3JvdXBCb3VuZHMsXG4gICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXMgPSBwYXJhbXMuZm9ybWF0dGVkVmFsdWVzLFxuICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zID0gcGFyYW1zLmZvcm1hdEZ1bmN0aW9ucyB8fCBbXSxcbiAgICAgICAgICAgIGVsU2VyaWVzTGFiZWxBcmVhID0gZG9tLmNyZWF0ZSgnZGl2JywgJ25lLWNoYXJ0LXNlcmllcy1sYWJlbC1hcmVhJyksXG4gICAgICAgICAgICBodG1sO1xuICAgICAgICBodG1sID0gbmUudXRpbC5tYXAocGFyYW1zLnZhbHVlcywgZnVuY3Rpb24odmFsdWVzLCBncm91cEluZGV4KSB7XG4gICAgICAgICAgICB2YXIgdG90YWwgPSAwLFxuICAgICAgICAgICAgICAgIGxhYmVsSGVpZ2h0ID0gcmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsSGVpZ2h0KGZvcm1hdHRlZFZhbHVlc1swXVswXSwgdGhpcy50aGVtZS5sYWJlbCksXG4gICAgICAgICAgICAgICAgbGFiZWxIdG1scywgbGFzdExlZnQsIGxhc3RUb3AsIGZucztcbiAgICAgICAgICAgIGxhYmVsSHRtbHMgPSBuZS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciBib3VuZCwgZm9ybWF0dGVkVmFsdWUsIGxhYmVsV2lkdGgsIGxlZnQsIHRvcCwgbGFiZWxIdG1sO1xuXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgYm91bmQgPSBncm91cEJvdW5kc1tncm91cEluZGV4XVtpbmRleF0uZW5kO1xuICAgICAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlID0gZm9ybWF0dGVkVmFsdWVzW2dyb3VwSW5kZXhdW2luZGV4XTtcbiAgICAgICAgICAgICAgICBsYWJlbFdpZHRoID0gcmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsV2lkdGgoZm9ybWF0dGVkVmFsdWUsIHRoaXMudGhlbWUubGFiZWwpO1xuICAgICAgICAgICAgICAgIGxlZnQgPSBib3VuZC5sZWZ0ICsgKGJvdW5kLndpZHRoIC0gbGFiZWxXaWR0aCkgLyAyO1xuICAgICAgICAgICAgICAgIHRvcCA9IGJvdW5kLnRvcCArIChib3VuZC5oZWlnaHQgLSBsYWJlbEhlaWdodCArIGNoYXJ0Q29uc3QuVEVYVF9QQURESU5HKSAvIDI7XG4gICAgICAgICAgICAgICAgbGFiZWxIdG1sID0gdGhpcy5fbWFrZVNlcmllc0xhYmVsSHRtbCh7XG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IGxlZnQsXG4gICAgICAgICAgICAgICAgICAgIHRvcDogdG9wXG4gICAgICAgICAgICAgICAgfSwgZm9ybWF0dGVkVmFsdWUsIGdyb3VwSW5kZXgsIGluZGV4KTtcbiAgICAgICAgICAgICAgICBsYXN0TGVmdCA9IGJvdW5kLmxlZnQgKyBib3VuZC53aWR0aDtcbiAgICAgICAgICAgICAgICBsYXN0VG9wID0gdG9wO1xuICAgICAgICAgICAgICAgIHRvdGFsICs9IHZhbHVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBsYWJlbEh0bWw7XG4gICAgICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zdGFja2VkID09PSAnbm9ybWFsJykge1xuICAgICAgICAgICAgICAgIGZucyA9IFt0b3RhbF0uY29uY2F0KGZvcm1hdEZ1bmN0aW9ucyk7XG4gICAgICAgICAgICAgICAgdG90YWwgPSBuZS51dGlsLnJlZHVjZShmbnMsIGZ1bmN0aW9uKHN0b3JlZCwgZm4pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZuKHN0b3JlZCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgbGFiZWxIdG1scy5wdXNoKHRoaXMuX21ha2VTZXJpZXNMYWJlbEh0bWwoe1xuICAgICAgICAgICAgICAgICAgICBsZWZ0OiBsYXN0TGVmdCArIGNoYXJ0Q29uc3QuU0VSSUVTX0xBQkVMX1BBRERJTkcsXG4gICAgICAgICAgICAgICAgICAgIHRvcDogbGFzdFRvcFxuICAgICAgICAgICAgICAgIH0sIHRvdGFsLCAtMSwgLTEpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBsYWJlbEh0bWxzLmpvaW4oJycpO1xuICAgICAgICB9LCB0aGlzKS5qb2luKCcnKTtcblxuICAgICAgICBlbFNlcmllc0xhYmVsQXJlYS5pbm5lckhUTUwgPSBodG1sO1xuICAgICAgICBwYXJhbXMuY29udGFpbmVyLmFwcGVuZENoaWxkKGVsU2VyaWVzTGFiZWxBcmVhKTtcblxuICAgICAgICByZXR1cm4gZWxTZXJpZXNMYWJlbEFyZWE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBzZXJpZXMgbGFiZWwuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge0hUTUxFbGVtZW50fSBwYXJhbXMuY29udGFpbmVyIGNvbnRhaW5lclxuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48YXJyYXk+fSBwYXJhbXMuZ3JvdXBCb3VuZHMgZ3JvdXAgYm91bmRzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IHBhcmFtcy5mb3JtYXR0ZWRWYWx1ZXMgZm9ybWF0dGVkIHZhbHVlc1xuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gc2VyaWVzIGxhYmVsIGFyZWFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJTZXJpZXNMYWJlbDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBlbFNlcmllc0xhYmVsQXJlYTtcblxuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5zaG93TGFiZWwpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zdGFja2VkKSB7XG4gICAgICAgICAgICBlbFNlcmllc0xhYmVsQXJlYSA9IHRoaXMuX3JlbmRlclN0YWNrZWRTZXJpZXNMYWJlbChwYXJhbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZWxTZXJpZXNMYWJlbEFyZWEgPSB0aGlzLl9yZW5kZXJOb3JtYWxTZXJpZXNMYWJlbChwYXJhbXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbFNlcmllc0xhYmVsQXJlYTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGJvdW5kLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBncm91cEluZGV4IGdyb3VwIGluZGV4XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IGluZGV4XG4gICAgICogQHJldHVybnMge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gYm91bmRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRCb3VuZDogZnVuY3Rpb24oZ3JvdXBJbmRleCwgaW5kZXgpIHtcbiAgICAgICAgaWYgKGdyb3VwSW5kZXggPT09IC0xIHx8IGluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZ3JvdXBCb3VuZHNbZ3JvdXBJbmRleF1baW5kZXhdLmVuZDtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBCYXJDaGFydFNlcmllcztcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBDb2x1bW4gY2hhcnQgc2VyaWVzIGNvbXBvbmVudC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFNlcmllcyA9IHJlcXVpcmUoJy4vc2VyaWVzLmpzJyksXG4gICAgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4uL2NvbnN0LmpzJyksXG4gICAgZG9tID0gcmVxdWlyZSgnLi4vaGVscGVycy9kb21IYW5kbGVyLmpzJyksXG4gICAgcmVuZGVyVXRpbCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvcmVuZGVyVXRpbC5qcycpO1xuXG52YXIgQ29sdW1uQ2hhcnRTZXJpZXMgPSBuZS51dGlsLmRlZmluZUNsYXNzKFNlcmllcywgLyoqIEBsZW5kcyBDb2x1bW5DaGFydFNlcmllcy5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIENvbHVtbiBjaGFydCBzZXJpZXMgY29tcG9uZW50LlxuICAgICAqIEBjb25zdHJ1Y3RzIENvbHVtbkNoYXJ0U2VyaWVzXG4gICAgICogQGV4dGVuZHMgU2VyaWVzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm1vZGVsIHNlcmllcyBtb2RlbFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5vcHRpb25zIHNlcmllcyBvcHRpb25zXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIHNlcmllcyB0aGVtZVxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBTZXJpZXMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBib3VuZHMgb2YgY29sdW1uIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDpudW1iZXJ9fSBkaW1lbnNpb24gY29sdW1uIGNoYXJ0IGRpbWVuc2lvblxuICAgICAqIEByZXR1cm5zIHthcnJheS48YXJyYXkuPG9iamVjdD4+fSBib3VuZHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQm91bmRzOiBmdW5jdGlvbihkaW1lbnNpb24pIHtcbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuc3RhY2tlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21ha2VOb3JtYWxDb2x1bW5Cb3VuZHMoZGltZW5zaW9uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9tYWtlU3RhY2tlZENvbHVtbkJvdW5kcyhkaW1lbnNpb24pO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYWRkIGRhdGEuXG4gICAgICogQHJldHVybnMge29iamVjdH0gYWRkIGRhdGFcbiAgICAgKi9cbiAgICBtYWtlQWRkRGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBncm9wdUJvdW5kcyA9IHRoaXMuX21ha2VCb3VuZHModGhpcy5ib3VuZC5kaW1lbnNpb24pO1xuXG4gICAgICAgIHRoaXMuZ3JvdXBCb3VuZHMgPSBncm9wdUJvdW5kcztcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZ3JvdXBCb3VuZHM6IGdyb3B1Qm91bmRzXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYm91bmRzIG9mIG5vcm1hbCBjb2x1bW4gY2hhcnQuXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0Om51bWJlcn19IGRpbWVuc2lvbiBjb2x1bW4gY2hhcnQgZGltZW5zaW9uXG4gICAgICogQHJldHVybnMge2FycmF5LjxhcnJheS48b2JqZWN0Pj59IGJvdW5kc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VOb3JtYWxDb2x1bW5Cb3VuZHM6IGZ1bmN0aW9uKGRpbWVuc2lvbikge1xuICAgICAgICB2YXIgZ3JvdXBWYWx1ZXMgPSB0aGlzLnBlcmNlbnRWYWx1ZXMsXG4gICAgICAgICAgICBncm91cFdpZHRoID0gKGRpbWVuc2lvbi53aWR0aCAvIGdyb3VwVmFsdWVzLmxlbmd0aCksXG4gICAgICAgICAgICBiYXJXaWR0aCA9IGdyb3VwV2lkdGggLyAoZ3JvdXBWYWx1ZXNbMF0ubGVuZ3RoICsgMSksXG4gICAgICAgICAgICBpc01pbnVzID0gdGhpcy5kYXRhLnNjYWxlLm1pbiA8IDAgJiYgdGhpcy5kYXRhLnNjYWxlLm1heCA8PSAwLFxuICAgICAgICAgICAgc2NhbGVEaXN0YW5jZSA9IHRoaXMuZ2V0U2NhbGVEaXN0YW5jZUZyb21aZXJvUG9pbnQoZGltZW5zaW9uLmhlaWdodCwgdGhpcy5kYXRhLnNjYWxlKSxcbiAgICAgICAgICAgIGJvdW5kcyA9IG5lLnV0aWwubWFwKGdyb3VwVmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMsIGdyb3VwSW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFkZGluZ0xlZnQgPSAoZ3JvdXBXaWR0aCAqIGdyb3VwSW5kZXgpICsgKGJhcldpZHRoIC8gMik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24gKHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYmFySGVpZ2h0ID0gdmFsdWUgKiBkaW1lbnNpb24uaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kVG9wID0gZGltZW5zaW9uLmhlaWdodCAtIGJhckhlaWdodCArIGNoYXJ0Q29uc3QuSElEREVOX1dJRFRILFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRUb3AgPSBlbmRUb3AgKyBiYXJIZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0ID0gcGFkZGluZ0xlZnQgKyAoYmFyV2lkdGggKiBpbmRleCkgLSBjaGFydENvbnN0LkhJRERFTl9XSURUSDtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNNaW51cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFySGVpZ2h0ICo9IC0xO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRUb3AgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgZW5kVG9wID0gMDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZSA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhckhlaWdodCAqPSAtMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0VG9wID0gZW5kVG9wID0gZGltZW5zaW9uLmhlaWdodCAtIHNjYWxlRGlzdGFuY2UudG9NaW47XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydFRvcCAtPSBzY2FsZURpc3RhbmNlLnRvTWluO1xuICAgICAgICAgICAgICAgICAgICAgICAgZW5kVG9wIC09IHNjYWxlRGlzdGFuY2UudG9NaW47XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3A6IHN0YXJ0VG9wLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6IGxlZnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGJhcldpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogMFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogZW5kVG9wLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6IGxlZnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGJhcldpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogYmFySGVpZ2h0XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIGJvdW5kcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBib3VuZHMgb2Ygc3RhY2tlZCBjb2x1bW4gY2hhcnQuXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0Om51bWJlcn19IGRpbWVuc2lvbiBjb2x1bW4gY2hhcnQgZGltZW5zaW9uXG4gICAgICogQHJldHVybnMge2FycmF5LjxhcnJheS48b2JqZWN0Pj59IGJvdW5kc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VTdGFja2VkQ29sdW1uQm91bmRzOiBmdW5jdGlvbihkaW1lbnNpb24pIHtcbiAgICAgICAgdmFyIGdyb3VwVmFsdWVzID0gdGhpcy5wZXJjZW50VmFsdWVzLFxuICAgICAgICAgICAgZ3JvdXBXaWR0aCA9IChkaW1lbnNpb24ud2lkdGggLyBncm91cFZhbHVlcy5sZW5ndGgpLFxuICAgICAgICAgICAgYmFyV2lkdGggPSBncm91cFdpZHRoIC8gMixcbiAgICAgICAgICAgIGJvdW5kcyA9IG5lLnV0aWwubWFwKGdyb3VwVmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMsIGdyb3VwSW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFkZGluZ0xlZnQgPSAoZ3JvdXBXaWR0aCAqIGdyb3VwSW5kZXgpICsgKGJhcldpZHRoIC8gMiksXG4gICAgICAgICAgICAgICAgICAgIHRvcCA9IDA7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBoZWlnaHQsIGJvdW5kO1xuICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQgPSB2YWx1ZSAqIGRpbWVuc2lvbi5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgIGJvdW5kID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3A6IGRpbWVuc2lvbi5oZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogcGFkZGluZ0xlZnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGJhcldpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogMFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogZGltZW5zaW9uLmhlaWdodCAtIGhlaWdodCAtIHRvcCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiBwYWRkaW5nTGVmdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogYmFyV2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBoZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgdG9wICs9IGhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJvdW5kO1xuICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBib3VuZHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBub3JtYWwgc2VyaWVzIGxhYmVsLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtIVE1MRWxlbWVudH0gcGFyYW1zLmNvbnRhaW5lciBjb250YWluZXJcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gcGFyYW1zLmdyb3VwQm91bmRzIGdyb3VwIGJvdW5kc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48YXJyYXk+fSBwYXJhbXMuZm9ybWF0dGVkVmFsdWVzIGZvcm1hdHRlZCB2YWx1ZXNcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHNlcmllcyBsYWJlbCBhcmVhXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyTm9ybWFsU2VyaWVzTGFiZWw6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgZ3JvdXBCb3VuZHMgPSBwYXJhbXMuZ3JvdXBCb3VuZHMsXG4gICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXMgPSBwYXJhbXMuZm9ybWF0dGVkVmFsdWVzLFxuICAgICAgICAgICAgbGFiZWxIZWlnaHQgPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxIZWlnaHQoZm9ybWF0dGVkVmFsdWVzWzBdWzBdLCB0aGlzLnRoZW1lLmxhYmVsKSxcbiAgICAgICAgICAgIGVsU2VyaWVzTGFiZWxBcmVhID0gZG9tLmNyZWF0ZSgnZGl2JywgJ25lLWNoYXJ0LXNlcmllcy1sYWJlbC1hcmVhJyksXG4gICAgICAgICAgICBodG1sO1xuICAgICAgICBodG1sID0gbmUudXRpbC5tYXAocGFyYW1zLnZhbHVlcywgZnVuY3Rpb24odmFsdWVzLCBncm91cEluZGV4KSB7XG4gICAgICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgYm91bmQgPSBncm91cEJvdW5kc1tncm91cEluZGV4XVtpbmRleF0uZW5kLFxuICAgICAgICAgICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZSA9IGZvcm1hdHRlZFZhbHVlc1tncm91cEluZGV4XVtpbmRleF0sXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsV2lkdGggPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxXaWR0aChmb3JtYXR0ZWRWYWx1ZSwgdGhpcy50aGVtZS5sYWJlbCksXG4gICAgICAgICAgICAgICAgICAgIHRvcCA9IGJvdW5kLnRvcCxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxIdG1sO1xuXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdG9wIC09IGxhYmVsSGVpZ2h0ICsgY2hhcnRDb25zdC5TRVJJRVNfTEFCRUxfUEFERElORztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0b3AgKz0gYm91bmQuaGVpZ2h0ICsgY2hhcnRDb25zdC5TRVJJRVNfTEFCRUxfUEFERElORztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsYWJlbEh0bWwgPSB0aGlzLl9tYWtlU2VyaWVzTGFiZWxIdG1sKHtcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogYm91bmQubGVmdCArIChib3VuZC53aWR0aCAtIGxhYmVsV2lkdGgpIC8gMixcbiAgICAgICAgICAgICAgICAgICAgdG9wOiB0b3BcbiAgICAgICAgICAgICAgICB9LCBmb3JtYXR0ZWRWYWx1ZSwgZ3JvdXBJbmRleCwgaW5kZXgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBsYWJlbEh0bWw7XG4gICAgICAgICAgICB9LCB0aGlzKS5qb2luKCcnKTtcbiAgICAgICAgfSwgdGhpcykuam9pbignJyk7XG5cbiAgICAgICAgZWxTZXJpZXNMYWJlbEFyZWEuaW5uZXJIVE1MID0gaHRtbDtcbiAgICAgICAgcGFyYW1zLmNvbnRhaW5lci5hcHBlbmRDaGlsZChlbFNlcmllc0xhYmVsQXJlYSk7XG5cbiAgICAgICAgcmV0dXJuIGVsU2VyaWVzTGFiZWxBcmVhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHN1bSBsYWJlbCBodG1sLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48bnVtYmVyPn0gcGFyYW1zLnZhbHVlcyB2YWx1ZXNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPGZ1bmN0aW9uPn0gcGFyYW1zLmZvcm1hdEZ1bmN0aW9ucyBmb3JtYXR0aW5nIGZ1bmN0aW9uc1xuICAgICAqICAgICAgQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IHBhcmFtcy5ib3VuZCBib3VuZFxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5sYWJlbEhlaWdodCBsYWJlbCBoZWlnaHRcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBzdW0gbGFiZWwgaHRtbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VTdW1MYWJlbEh0bWw6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgc3VtID0gbmUudXRpbC5zdW0ocGFyYW1zLnZhbHVlcyksXG4gICAgICAgICAgICBmbnMgPSBbc3VtXS5jb25jYXQocGFyYW1zLmZvcm1hdEZ1bmN0aW9ucyksXG4gICAgICAgICAgICBib3VuZCA9IHBhcmFtcy5ib3VuZCxcbiAgICAgICAgICAgIGxlZnQgPSBib3VuZC5sZWZ0ICsgKGJvdW5kLndpZHRoIC8gMiksXG4gICAgICAgICAgICB0b3RhbExhYmVsV2lkdGg7XG5cbiAgICAgICAgc3VtID0gbmUudXRpbC5yZWR1Y2UoZm5zLCBmdW5jdGlvbihzdG9yZWQsIGZuKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4oc3RvcmVkKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdG90YWxMYWJlbFdpZHRoID0gcmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsV2lkdGgoc3VtLCB0aGlzLnRoZW1lLmxhYmVsKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5fbWFrZVNlcmllc0xhYmVsSHRtbCh7XG4gICAgICAgICAgICBsZWZ0OiBsZWZ0IC0gKHRvdGFsTGFiZWxXaWR0aCAtIGNoYXJ0Q29uc3QuVEVYVF9QQURESU5HKSAvIDIsXG4gICAgICAgICAgICB0b3A6IGJvdW5kLnRvcCAtIHBhcmFtcy5sYWJlbEhlaWdodCAtIGNoYXJ0Q29uc3QuU0VSSUVTX0xBQkVMX1BBRERJTkdcbiAgICAgICAgfSwgc3VtLCAtMSwgLTEpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHN0YWNrZWQgbGFiZWxzIGh0bWwuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmdyb3VwSW5kZXggZ3JvdXAgaW5kZXhcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPG51bWJlcj59IHBhcmFtcy52YWx1ZXMgdmFsdWVzLFxuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48ZnVuY3Rpb24+fSBwYXJhbXMuZm9ybWF0RnVuY3Rpb25zIGZvcm1hdHRpbmcgZnVuY3Rpb25zLFxuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48b2JqZWN0Pn0gcGFyYW1zLmJvdW5kcyBib3VuZHMsXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5fSBwYXJhbXMuZm9ybWF0dGVkVmFsdWVzIGZvcm1hdHRlZCB2YWx1ZXMsXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmxhYmVsSGVpZ2h0IGxhYmVsIGhlaWdodFxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGxhYmVscyBodG1sXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVN0YWNrZWRMYWJlbHNIdG1sOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIHZhbHVlcyA9IHBhcmFtcy52YWx1ZXMsXG4gICAgICAgICAgICBib3VuZCwgaHRtbHM7XG5cbiAgICAgICAgaHRtbHMgPSBuZS51dGlsLm1hcChwYXJhbXMudmFsdWVzLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBsYWJlbFdpZHRoLCBsZWZ0LCB0b3AsIGxhYmVsSHRtbCwgZm9ybWF0dGVkVmFsdWU7XG5cbiAgICAgICAgICAgIGlmICh2YWx1ZSA8IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGJvdW5kID0gcGFyYW1zLmJvdW5kc1tpbmRleF0uZW5kO1xuICAgICAgICAgICAgZm9ybWF0dGVkVmFsdWUgPSBwYXJhbXMuZm9ybWF0dGVkVmFsdWVzW2luZGV4XTtcbiAgICAgICAgICAgIGxhYmVsV2lkdGggPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxXaWR0aChmb3JtYXR0ZWRWYWx1ZSwgdGhpcy50aGVtZS5sYWJlbCk7XG4gICAgICAgICAgICBsZWZ0ID0gYm91bmQubGVmdCArICgoYm91bmQud2lkdGggLSBsYWJlbFdpZHRoICsgY2hhcnRDb25zdC5URVhUX1BBRERJTkcpIC8gMik7XG4gICAgICAgICAgICB0b3AgPSBib3VuZC50b3AgKyAoKGJvdW5kLmhlaWdodCAtIHBhcmFtcy5sYWJlbEhlaWdodCArIGNoYXJ0Q29uc3QuVEVYVF9QQURESU5HKSAvIDIpO1xuICAgICAgICAgICAgbGFiZWxIdG1sID0gdGhpcy5fbWFrZVNlcmllc0xhYmVsSHRtbCh7XG4gICAgICAgICAgICAgICAgbGVmdDogbGVmdCxcbiAgICAgICAgICAgICAgICB0b3A6IHRvcFxuICAgICAgICAgICAgfSwgZm9ybWF0dGVkVmFsdWUsIHBhcmFtcy5ncm91cEluZGV4LCBpbmRleCk7XG4gICAgICAgICAgICByZXR1cm4gbGFiZWxIdG1sO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnN0YWNrZWQgPT09ICdub3JtYWwnKSB7XG4gICAgICAgICAgICBodG1scy5wdXNoKHRoaXMuX21ha2VTdW1MYWJlbEh0bWwoe1xuICAgICAgICAgICAgICAgIHZhbHVlczogdmFsdWVzLFxuICAgICAgICAgICAgICAgIGZvcm1hdEZ1bmN0aW9uczogcGFyYW1zLmZvcm1hdEZ1bmN0aW9ucyxcbiAgICAgICAgICAgICAgICBib3VuZDogYm91bmQsXG4gICAgICAgICAgICAgICAgbGFiZWxIZWlnaHQ6IHBhcmFtcy5sYWJlbEhlaWdodFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBodG1scy5qb2luKCcnKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIHN0YWNrZWQgc2VyaWVzIGxhYmVsLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtIVE1MRWxlbWVudH0gcGFyYW1zLmNvbnRhaW5lciBjb250YWluZXJcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gcGFyYW1zLmdyb3VwQm91bmRzIGdyb3VwIGJvdW5kc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48YXJyYXk+fSBwYXJhbXMuZm9ybWF0dGVkVmFsdWVzIGZvcm1hdHRlZCB2YWx1ZXNcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHNlcmllcyBsYWJlbCBhcmVhXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyU3RhY2tlZFNlcmllc0xhYmVsOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGdyb3VwQm91bmRzID0gcGFyYW1zLmdyb3VwQm91bmRzLFxuICAgICAgICAgICAgZm9ybWF0dGVkVmFsdWVzID0gcGFyYW1zLmZvcm1hdHRlZFZhbHVlcyxcbiAgICAgICAgICAgIGZvcm1hdEZ1bmN0aW9ucyA9IHBhcmFtcy5mb3JtYXRGdW5jdGlvbnMgfHwgW10sXG4gICAgICAgICAgICBlbFNlcmllc0xhYmVsQXJlYSA9IGRvbS5jcmVhdGUoJ2RpdicsICduZS1jaGFydC1zZXJpZXMtbGFiZWwtYXJlYScpLFxuICAgICAgICAgICAgbGFiZWxIZWlnaHQgPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxIZWlnaHQoZm9ybWF0dGVkVmFsdWVzWzBdWzBdLCB0aGlzLnRoZW1lLmxhYmVsKSxcbiAgICAgICAgICAgIGh0bWw7XG5cbiAgICAgICAgaHRtbCA9IG5lLnV0aWwubWFwKHBhcmFtcy52YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcywgaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBsYWJlbHNIdG1sID0gdGhpcy5fbWFrZVN0YWNrZWRMYWJlbHNIdG1sKHtcbiAgICAgICAgICAgICAgICAgICAgZ3JvdXBJbmRleDogaW5kZXgsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlczogdmFsdWVzLFxuICAgICAgICAgICAgICAgICAgICBmb3JtYXRGdW5jdGlvbnM6IGZvcm1hdEZ1bmN0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgYm91bmRzOiBncm91cEJvdW5kc1tpbmRleF0sXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlczogZm9ybWF0dGVkVmFsdWVzW2luZGV4XSxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxIZWlnaHQ6IGxhYmVsSGVpZ2h0XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gbGFiZWxzSHRtbDtcbiAgICAgICAgfSwgdGhpcykuam9pbignJyk7XG5cbiAgICAgICAgZWxTZXJpZXNMYWJlbEFyZWEuaW5uZXJIVE1MID0gaHRtbDtcbiAgICAgICAgcGFyYW1zLmNvbnRhaW5lci5hcHBlbmRDaGlsZChlbFNlcmllc0xhYmVsQXJlYSk7XG5cbiAgICAgICAgcmV0dXJuIGVsU2VyaWVzTGFiZWxBcmVhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgc2VyaWVzIGxhYmVsLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtIVE1MRWxlbWVudH0gcGFyYW1zLmNvbnRhaW5lciBjb250YWluZXJcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gcGFyYW1zLmdyb3VwQm91bmRzIGdyb3VwIGJvdW5kc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48YXJyYXk+fSBwYXJhbXMuZm9ybWF0dGVkVmFsdWVzIGZvcm1hdHRlZCB2YWx1ZXNcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHNlcmllcyBsYWJlbCBhcmVhXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyU2VyaWVzTGFiZWw6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgZWxTZXJpZXNMYWJlbEFyZWE7XG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLnNob3dMYWJlbCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnN0YWNrZWQpIHtcbiAgICAgICAgICAgIGVsU2VyaWVzTGFiZWxBcmVhID0gdGhpcy5fcmVuZGVyU3RhY2tlZFNlcmllc0xhYmVsKHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbFNlcmllc0xhYmVsQXJlYSA9IHRoaXMuX3JlbmRlck5vcm1hbFNlcmllc0xhYmVsKHBhcmFtcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVsU2VyaWVzTGFiZWxBcmVhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgYm91bmQuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGdyb3VwSW5kZXggZ3JvdXAgaW5kZXhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggaW5kZXhcbiAgICAgKiBAcmV0dXJucyB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBib3VuZFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldEJvdW5kOiBmdW5jdGlvbihncm91cEluZGV4LCBpbmRleCkge1xuICAgICAgICBpZiAoZ3JvdXBJbmRleCA9PT0gLTEgfHwgaW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5ncm91cEJvdW5kc1tncm91cEluZGV4XVtpbmRleF0uZW5kO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbHVtbkNoYXJ0U2VyaWVzO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IExpbmUgY2hhcnQgc2VyaWVzIGNvbXBvbmVudC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFNlcmllcyA9IHJlcXVpcmUoJy4vc2VyaWVzLmpzJyksXG4gICAgTGluZVR5cGVTZXJpZXNCYXNlID0gcmVxdWlyZSgnLi9saW5lVHlwZVNlcmllc0Jhc2UuanMnKTtcblxudmFyIExpbmVDaGFydFNlcmllcyA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoU2VyaWVzLCAvKiogQGxlbmRzIExpbmVDaGFydFNlcmllcy5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIExpbmUgY2hhcnQgc2VyaWVzIGNvbXBvbmVudC5cbiAgICAgKiBAY29uc3RydWN0cyBMaW5lQ2hhcnRTZXJpZXNcbiAgICAgKiBAZXh0ZW5kcyBTZXJpZXNcbiAgICAgKiBAbWl4ZXMgTGluZVR5cGVTZXJpZXNCYXNlXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm1vZGVsIHNlcmllcyBtb2RlbFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5vcHRpb25zIHNlcmllcyBvcHRpb25zXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIHNlcmllcyB0aGVtZVxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBTZXJpZXMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBhZGQgZGF0YS5cbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBhZGQgZGF0YVxuICAgICAqL1xuICAgIG1ha2VBZGREYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGdyb3VwUG9zaXRpb25zOiB0aGlzLm1ha2VQb3NpdGlvbnModGhpcy5ib3VuZC5kaW1lbnNpb24pXG4gICAgICAgIH07XG4gICAgfVxufSk7XG5cbkxpbmVUeXBlU2VyaWVzQmFzZS5taXhpbihMaW5lQ2hhcnRTZXJpZXMpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IExpbmVDaGFydFNlcmllcztcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBMaW5lVHlwZVNlcmllc0Jhc2UgaXMgYmFzZSBjbGFzcyBmb3IgbGluZSB0eXBlIHNlcmllcy5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFNlcmllcyA9IHJlcXVpcmUoJy4vc2VyaWVzLmpzJyksXG4gICAgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4uL2NvbnN0LmpzJyksXG4gICAgZG9tID0gcmVxdWlyZSgnLi4vaGVscGVycy9kb21IYW5kbGVyLmpzJyksXG4gICAgcmVuZGVyVXRpbCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvcmVuZGVyVXRpbC5qcycpO1xuLyoqXG4gKiBAY2xhc3NkZXNjIExpbmVUeXBlU2VyaWVzQmFzZSBpcyBiYXNlIGNsYXNzIGZvciBsaW5lIHR5cGUgc2VyaWVzLlxuICogQGNsYXNzIExpbmVUeXBlU2VyaWVzQmFzZVxuICogQG1peGluXG4gKi9cbnZhciBMaW5lVHlwZVNlcmllc0Jhc2UgPSBuZS51dGlsLmRlZmluZUNsYXNzKFNlcmllcywgLyoqIEBsZW5kcyBMaW5lVHlwZVNlcmllc0Jhc2UucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHBvc2l0aW9ucyBvZiBsaW5lIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDpudW5iZXJ9fSBkaW1lbnNpb24gbGluZSBjaGFydCBkaW1lbnNpb25cbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gcG9zaXRpb25zXG4gICAgICovXG4gICAgbWFrZVBvc2l0aW9uczogZnVuY3Rpb24oZGltZW5zaW9uKSB7XG4gICAgICAgIHZhciBncm91cFZhbHVlcyA9IHRoaXMucGVyY2VudFZhbHVlcyxcbiAgICAgICAgICAgIHdpZHRoID0gZGltZW5zaW9uLndpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0ID0gZGltZW5zaW9uLmhlaWdodCxcbiAgICAgICAgICAgIHN0ZXAgPSB3aWR0aCAvIGdyb3VwVmFsdWVzWzBdLmxlbmd0aCxcbiAgICAgICAgICAgIHN0YXJ0ID0gc3RlcCAvIDIsXG4gICAgICAgICAgICByZXN1bHQgPSBuZS51dGlsLm1hcChncm91cFZhbHVlcywgZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiBzdGFydCArIChzdGVwICogaW5kZXgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiBoZWlnaHQgLSAodmFsdWUgKiBoZWlnaHQpXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5ncm91cFBvc2l0aW9ucyA9IHJlc3VsdDtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIHNlcmllcyBsYWJlbC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHBhcmFtcy5jb250YWluZXIgY29udGFpbmVyXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IHBhcmFtcy5ncm91cFBvc2l0aW9ucyBncm91cCBwb3NpdGlvbnNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gcGFyYW1zLmZvcm1hdHRlZFZhbHVlcyBmb3JtYXR0ZWQgdmFsdWVzXG4gICAgICogQHJldHVybiB7SFRNTEVsZW1lbnR9IHNlcmllcyBhcmVhIGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJTZXJpZXNMYWJlbDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBncm91cFBvc2l0aW9ucywgbGFiZWxIZWlnaHQsIGVsU2VyaWVzTGFiZWxBcmVhLCBodG1sO1xuXG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLnNob3dMYWJlbCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBncm91cFBvc2l0aW9ucyA9IHBhcmFtcy5ncm91cFBvc2l0aW9ucztcbiAgICAgICAgbGFiZWxIZWlnaHQgPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxIZWlnaHQocGFyYW1zLmZvcm1hdHRlZFZhbHVlc1swXVswXSwgdGhpcy50aGVtZS5sYWJlbCk7XG4gICAgICAgIGVsU2VyaWVzTGFiZWxBcmVhID0gZG9tLmNyZWF0ZSgnZGl2JywgJ25lLWNoYXJ0LXNlcmllcy1sYWJlbC1hcmVhJyk7XG5cbiAgICAgICAgaHRtbCA9IG5lLnV0aWwubWFwKHBhcmFtcy5mb3JtYXR0ZWRWYWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcywgZ3JvdXBJbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdmFyIHBvc2l0aW9uID0gZ3JvdXBQb3NpdGlvbnNbZ3JvdXBJbmRleF1baW5kZXhdLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbFdpZHRoID0gcmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsV2lkdGgodmFsdWUsIHRoaXMudGhlbWUubGFiZWwpLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbEh0bWwgPSB0aGlzLl9tYWtlU2VyaWVzTGFiZWxIdG1sKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6IHBvc2l0aW9uLmxlZnQgLSAobGFiZWxXaWR0aCAvIDIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiBwb3NpdGlvbi50b3AgLSBsYWJlbEhlaWdodCAtIGNoYXJ0Q29uc3QuU0VSSUVTX0xBQkVMX1BBRERJTkdcbiAgICAgICAgICAgICAgICAgICAgfSwgdmFsdWUsIGluZGV4LCBncm91cEluZGV4KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGFiZWxIdG1sO1xuICAgICAgICAgICAgfSwgdGhpcykuam9pbignJyk7XG4gICAgICAgIH0sIHRoaXMpLmpvaW4oJycpO1xuXG4gICAgICAgIGVsU2VyaWVzTGFiZWxBcmVhLmlubmVySFRNTCA9IGh0bWw7XG4gICAgICAgIHBhcmFtcy5jb250YWluZXIuYXBwZW5kQ2hpbGQoZWxTZXJpZXNMYWJlbEFyZWEpO1xuXG4gICAgICAgIHJldHVybiBlbFNlcmllc0xhYmVsQXJlYTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGJvdW5kLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBncm91cEluZGV4IGdyb3VwIGluZGV4XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IGluZGV4XG4gICAgICogQHJldHVybnMge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gYm91bmRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRCb3VuZDogZnVuY3Rpb24oZ3JvdXBJbmRleCwgaW5kZXgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ3JvdXBQb3NpdGlvbnNbaW5kZXhdW2dyb3VwSW5kZXhdO1xuICAgIH1cbn0pO1xuXG5MaW5lVHlwZVNlcmllc0Jhc2UubWl4aW4gPSBmdW5jdGlvbihmdW5jKSB7XG4gICAgbmUudXRpbC5leHRlbmQoZnVuYy5wcm90b3R5cGUsIExpbmVUeXBlU2VyaWVzQmFzZS5wcm90b3R5cGUpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBMaW5lVHlwZVNlcmllc0Jhc2U7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgUGllIGNoYXJ0IHNlcmllcyBjb21wb25lbnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTZXJpZXMgPSByZXF1aXJlKCcuL3NlcmllcycpLFxuICAgIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuLi9jb25zdCcpLFxuICAgIGRvbSA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZG9tSGFuZGxlcicpLFxuICAgIHJlbmRlclV0aWwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3JlbmRlclV0aWwnKTtcblxudmFyIFBpZUNoYXJ0U2VyaWVzID0gbmUudXRpbC5kZWZpbmVDbGFzcyhTZXJpZXMsIC8qKiBAbGVuZHMgUGllQ2hhcnRTZXJpZXMucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBMaW5lIGNoYXJ0IHNlcmllcyBjb21wb25lbnQuXG4gICAgICogQGNvbnN0cnVjdHMgUGllQ2hhcnRTZXJpZXNcbiAgICAgKiBAZXh0ZW5kcyBTZXJpZXNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMubW9kZWwgc2VyaWVzIG1vZGVsXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgc2VyaWVzIG9wdGlvbnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgc2VyaWVzIHRoZW1lXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIFNlcmllcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHBlcmNlbnQgdmFsdWUuXG4gICAgICogQHBhcmFtIHt7dmFsdWVzOiBhcnJheSwgc2NhbGU6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fX0gZGF0YSBzZXJpZXMgZGF0YVxuICAgICAqIEByZXR1cm5zIHthcnJheS48YXJyYXkuPG51bWJlcj4+fSBwZXJjZW50IHZhbHVlc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VQZXJjZW50VmFsdWVzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBuZS51dGlsLm1hcChkYXRhLnZhbHVlcywgZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgICAgICB2YXIgc3VtID0gbmUudXRpbC5zdW0odmFsdWVzKTtcbiAgICAgICAgICAgIHJldHVybiBuZS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlIC8gc3VtO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHNlY3RvcnMgaW5mb3JtYXRpb24uXG4gICAgICogQHBhcmFtIHthcnJheS48bnVtYmVyPn0gcGVyY2VudFZhbHVlcyBwZXJjZW50IHZhbHVlc1xuICAgICAqIEBwYXJhbSB7e2N4OiBudW1iZXIsIGN5OiBudW1iZXIsIHI6IG51bWJlcn19IGNpcmNsZUJvdW5kIGNpcmNsZSBib3VuZFxuICAgICAqIEByZXR1cm5zIHthcnJheS48b2JqZWN0Pn0gc2VjdG9ycyBpbmZvcm1hdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VTZWN0b3JzSW5mbzogZnVuY3Rpb24ocGVyY2VudFZhbHVlcywgY2lyY2xlQm91bmQpIHtcbiAgICAgICAgdmFyIGN4ID0gY2lyY2xlQm91bmQuY3gsXG4gICAgICAgICAgICBjeSA9IGNpcmNsZUJvdW5kLmN5LFxuICAgICAgICAgICAgciA9IGNpcmNsZUJvdW5kLnIsXG4gICAgICAgICAgICBhbmdsZSA9IDAsXG4gICAgICAgICAgICBkZWx0YSA9IDEwLFxuICAgICAgICAgICAgcGF0aHM7XG5cbiAgICAgICAgcGF0aHMgPSBuZS51dGlsLm1hcChwZXJjZW50VmFsdWVzLCBmdW5jdGlvbihwZXJjZW50VmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBhZGRBbmdsZSA9IGNoYXJ0Q29uc3QuQU5HTEVfMzYwICogcGVyY2VudFZhbHVlLFxuICAgICAgICAgICAgICAgIGVuZEFuZ2xlID0gYW5nbGUgKyBhZGRBbmdsZSxcbiAgICAgICAgICAgICAgICBwb3B1cEFuZ2xlID0gYW5nbGUgKyAoYWRkQW5nbGUgLyAyKSxcbiAgICAgICAgICAgICAgICBhbmdsZXMgPSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydEFuZ2xlOiBhbmdsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZEFuZ2xlOiBhbmdsZVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBlbmQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0QW5nbGU6IGFuZ2xlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kQW5nbGU6IGVuZEFuZ2xlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uRGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgY3g6IGN4LFxuICAgICAgICAgICAgICAgICAgICBjeTogY3ksXG4gICAgICAgICAgICAgICAgICAgIGFuZ2xlOiBwb3B1cEFuZ2xlXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGFuZ2xlID0gZW5kQW5nbGU7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHBlcmNlbnRWYWx1ZTogcGVyY2VudFZhbHVlLFxuICAgICAgICAgICAgICAgIGFuZ2xlczogYW5nbGVzLFxuICAgICAgICAgICAgICAgIHBvcHVwUG9zaXRpb246IHRoaXMuX2dldEFyY1Bvc2l0aW9uKG5lLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICAgICAgcjogciArIGRlbHRhXG4gICAgICAgICAgICAgICAgfSwgcG9zaXRpb25EYXRhKSksXG4gICAgICAgICAgICAgICAgY2VudGVyUG9zaXRpb246IHRoaXMuX2dldEFyY1Bvc2l0aW9uKG5lLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICAgICAgcjogKHIgLyAyKSArIGRlbHRhXG4gICAgICAgICAgICAgICAgfSwgcG9zaXRpb25EYXRhKSksXG4gICAgICAgICAgICAgICAgb3V0ZXJQb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICBzdGFydDogdGhpcy5fZ2V0QXJjUG9zaXRpb24obmUudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgcjogclxuICAgICAgICAgICAgICAgICAgICB9LCBwb3NpdGlvbkRhdGEpKSxcbiAgICAgICAgICAgICAgICAgICAgbWlkZGxlOiB0aGlzLl9nZXRBcmNQb3NpdGlvbihuZS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgICAgICAgICByOiByICsgZGVsdGFcbiAgICAgICAgICAgICAgICAgICAgfSwgcG9zaXRpb25EYXRhKSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICByZXR1cm4gcGF0aHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYWRkIGRhdGEuXG4gICAgICogQHJldHVybnMge3tcbiAgICAgKiAgICAgIGZvcm1hdHRlZFZhbHVlczogYXJyYXksXG4gICAgICogICAgICBjaGFydEJhY2tncm91bmQ6IHN0cmluZyxcbiAgICAgKiAgICAgIGNpcmNsZUJvdW5kOiAoe2N4OiBudW1iZXIsIGN5OiBudW1iZXIsIHI6IG51bWJlcn0pLFxuICAgICAqICAgICAgc2VjdG9yc0luZm86IGFycmF5LjxvYmplY3Q+XG4gICAgICogfX0gYWRkIGRhdGEgZm9yIGdyYXBoIHJlbmRlcmluZ1xuICAgICAqL1xuICAgIG1ha2VBZGREYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNpcmNsZUJvdW5kID0gdGhpcy5fbWFrZUNpcmNsZUJvdW5kKHRoaXMuYm91bmQuZGltZW5zaW9uLCB7XG4gICAgICAgICAgICAgICAgc2hvd0xhYmVsOiB0aGlzLm9wdGlvbnMuc2hvd0xhYmVsLFxuICAgICAgICAgICAgICAgIGxlZ2VuZFR5cGU6IHRoaXMub3B0aW9ucy5sZWdlbmRUeXBlXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIHNlY3RvcnNJbmZvID0gdGhpcy5fbWFrZVNlY3RvcnNJbmZvKHRoaXMucGVyY2VudFZhbHVlc1swXSwgY2lyY2xlQm91bmQpO1xuXG4gICAgICAgIHRoaXMucG9wdXBQb3NpdGlvbnMgPSBuZS51dGlsLnBsdWNrKHNlY3RvcnNJbmZvLCAncG9wdXBQb3NpdGlvbicpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY2hhcnRCYWNrZ3JvdW5kOiB0aGlzLmNoYXJ0QmFja2dyb3VuZCxcbiAgICAgICAgICAgIGNpcmNsZUJvdW5kOiBjaXJjbGVCb3VuZCxcbiAgICAgICAgICAgIHNlY3RvcnNJbmZvOiBzZWN0b3JzSW5mb1xuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGNpcmNsZSBib3VuZFxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDpudW1iZXJ9fSBkaW1lbnNpb24gY2hhcnQgZGltZW5zaW9uXG4gICAgICogQHBhcmFtIHt7c2hvd0xhYmVsOiBib29sZWFuLCBsZWdlbmRUeXBlOiBzdHJpbmd9fSBvcHRpb25zIG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7e2N4OiBudW1iZXIsIGN5OiBudW1iZXIsIHI6IG51bWJlcn19IGNpcmNsZSBib3VuZHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQ2lyY2xlQm91bmQ6IGZ1bmN0aW9uKGRpbWVuc2lvbiwgb3B0aW9ucykge1xuICAgICAgICB2YXIgd2lkdGggPSBkaW1lbnNpb24ud2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQgPSBkaW1lbnNpb24uaGVpZ2h0LFxuICAgICAgICAgICAgaXNTbWFsbFBpZSA9IG9wdGlvbnMubGVnZW5kVHlwZSA9PT0gY2hhcnRDb25zdC5TRVJJRVNfTEVHRU5EX1RZUEVfT1VURVIgJiYgb3B0aW9ucy5zaG93TGFiZWwsXG4gICAgICAgICAgICByYWRpdXNSYXRlID0gaXNTbWFsbFBpZSA/IGNoYXJ0Q29uc3QuUElFX0dSQVBIX1NNQUxMX1JBVEUgOiBjaGFydENvbnN0LlBJRV9HUkFQSF9ERUZBVUxUX1JBVEUsXG4gICAgICAgICAgICBkaWFtZXRlciA9IG5lLnV0aWwubXVsdGlwbGljYXRpb24obmUudXRpbC5taW4oW3dpZHRoLCBoZWlnaHRdKSwgcmFkaXVzUmF0ZSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjeDogbmUudXRpbC5kaXZpc2lvbih3aWR0aCwgMiksXG4gICAgICAgICAgICBjeTogbmUudXRpbC5kaXZpc2lvbihoZWlnaHQsIDIpLFxuICAgICAgICAgICAgcjogbmUudXRpbC5kaXZpc2lvbihkaWFtZXRlciwgMilcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGFyYyBwb3NpdGlvbi5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuY3ggY2VudGVyIHhcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuY3kgY2VudGVyIHlcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuciByYWRpdXNcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuYW5nbGUgYW5nbGUoZGVncmVlKVxuICAgICAqIEByZXR1cm5zIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IGFyYyBwb3NpdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldEFyY1Bvc2l0aW9uOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxlZnQ6IHBhcmFtcy5jeCArIChwYXJhbXMuciAqIE1hdGguc2luKHBhcmFtcy5hbmdsZSAqIGNoYXJ0Q29uc3QuUkFEKSksXG4gICAgICAgICAgICB0b3A6IHBhcmFtcy5jeSAtIChwYXJhbXMuciAqIE1hdGguY29zKHBhcmFtcy5hbmdsZSAqIGNoYXJ0Q29uc3QuUkFEKSlcbiAgICAgICAgfTtcbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGFkZCBkYXRhIGZvciBzZXJpZXMgbGFiZWwuXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNvbnRhaW5lclxuICAgICAqIEByZXR1cm5zIHt7XG4gICAgICogICAgICBjb250YWluZXI6IEhUTUxFbGVtZW50LFxuICAgICAqICAgICAgbGVnZW5kTGFiZWxzOiBhcnJheS48c3RyaW5nPixcbiAgICAgKiAgICAgIG9wdGlvbnM6IHtsZWdlbmRUeXBlOiBzdHJpbmcsIHNob3dMYWJlbDogYm9vbGVhbn0sXG4gICAgICogICAgICBjaGFydFdpZHRoOiBudW1iZXIsXG4gICAgICogICAgICBmb3JtYXR0ZWRWYWx1ZXM6IGFycmF5XG4gICAgICogfX0gYWRkIGRhdGEgZm9yIG1ha2Ugc2VyaWVzIGxhYmVsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUFkZERhdGFGb3JTZXJpZXNMYWJlbDogZnVuY3Rpb24oY29udGFpbmVyKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjb250YWluZXI6IGNvbnRhaW5lcixcbiAgICAgICAgICAgIGxlZ2VuZExhYmVsczogdGhpcy5kYXRhLmxlZ2VuZExhYmVscyxcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICBsZWdlbmRUeXBlOiB0aGlzLm9wdGlvbnMubGVnZW5kVHlwZSxcbiAgICAgICAgICAgICAgICBzaG93TGFiZWw6IHRoaXMub3B0aW9ucy5zaG93TGFiZWxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjaGFydFdpZHRoOiB0aGlzLmRhdGEuY2hhcnRXaWR0aCxcbiAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlczogdGhpcy5kYXRhLmZvcm1hdHRlZFZhbHVlc1swXVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgc2VyaWVzIGxhYmVsLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5sZWdlbmQgbGVnZW5kXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLmxhYmVsIGxhYmVsXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLnNlcGFyYXRvciBzZXBhcmF0b3JcbiAgICAgKiAgICAgIEBwYXJhbSB7e2xlZ2VuZFR5cGU6IGJvb2xlYW4sIHNob3dMYWJlbDogYm9vbGVhbn19IHBhcmFtcy5vcHRpb25zIG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBzZXJpZXMgbGFiZWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRTZXJpZXNMYWJlbDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBzZXJpZXNMYWJlbCA9ICcnO1xuICAgICAgICBpZiAocGFyYW1zLm9wdGlvbnMubGVnZW5kVHlwZSkge1xuICAgICAgICAgICAgc2VyaWVzTGFiZWwgPSBwYXJhbXMubGVnZW5kO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhcmFtcy5vcHRpb25zLnNob3dMYWJlbCkge1xuICAgICAgICAgICAgc2VyaWVzTGFiZWwgKz0gKHNlcmllc0xhYmVsID8gcGFyYW1zLnNlcGFyYXRvciA6ICcnKSArIHBhcmFtcy5sYWJlbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzZXJpZXNMYWJlbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGNlbnRlciBsZWdlbmQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY29udGFpbmVyXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBsZWdlbmRzIGxlZ2VuZHNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPG9iamVjdD59IGNlbnRlclBvc2l0aW9ucyBjZW50ZXIgcG9zaXRpb25zXG4gICAgICogQHJldHVybiB7SFRNTEVsZW1lbnR9IHNlcmllcyBhcmVhIGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJMZWdlbmRMYWJlbDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBwb3NpdGlvbnMgPSBwYXJhbXMucG9zaXRpb25zLFxuICAgICAgICAgICAgZm9ybWF0dGVkVmFsdWVzID0gcGFyYW1zLmZvcm1hdHRlZFZhbHVlcyxcbiAgICAgICAgICAgIGVsU2VyaWVzTGFiZWxBcmVhID0gZG9tLmNyZWF0ZSgnZGl2JywgJ25lLWNoYXJ0LXNlcmllcy1sYWJlbC1hcmVhJyksXG4gICAgICAgICAgICBodG1sO1xuXG4gICAgICAgIGh0bWwgPSBuZS51dGlsLm1hcChwYXJhbXMubGVnZW5kTGFiZWxzLCBmdW5jdGlvbihsZWdlbmQsIGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgbGFiZWwgPSB0aGlzLl9nZXRTZXJpZXNMYWJlbCh7XG4gICAgICAgICAgICAgICAgICAgIGxlZ2VuZDogbGVnZW5kLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogZm9ybWF0dGVkVmFsdWVzW2luZGV4XSxcbiAgICAgICAgICAgICAgICAgICAgc2VwYXJhdG9yOiBwYXJhbXMuc2VwYXJhdG9yLFxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBwYXJhbXMub3B0aW9uc1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uID0gcGFyYW1zLm1vdmVUb1Bvc2l0aW9uKHBvc2l0aW9uc1tpbmRleF0sIGxhYmVsKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9tYWtlU2VyaWVzTGFiZWxIdG1sKHBvc2l0aW9uLCBsYWJlbCwgMCwgaW5kZXgpO1xuICAgICAgICB9LCB0aGlzKS5qb2luKCcnKTtcblxuICAgICAgICBlbFNlcmllc0xhYmVsQXJlYS5pbm5lckhUTUwgPSBodG1sO1xuICAgICAgICBwYXJhbXMuY29udGFpbmVyLmFwcGVuZENoaWxkKGVsU2VyaWVzTGFiZWxBcmVhKTtcblxuICAgICAgICByZXR1cm4gZWxTZXJpZXNMYWJlbEFyZWE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1vdmUgdG8gY2VudGVyIHBvc2l0aW9uLlxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBwb3NpdGlvbiBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBsYWJlbCBsYWJlbFxuICAgICAqIEByZXR1cm5zIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IGNlbnRlciBwb3NpdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21vdmVUb0NlbnRlclBvc2l0aW9uOiBmdW5jdGlvbihwb3NpdGlvbiwgbGFiZWwpIHtcbiAgICAgICAgdmFyIGxlZnQgPSBwb3NpdGlvbi5sZWZ0IC0gKHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbFdpZHRoKGxhYmVsLCB0aGlzLnRoZW1lLmxhYmVsKSAvIDIpLFxuICAgICAgICAgICAgdG9wID0gcG9zaXRpb24udG9wIC0gKHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodChsYWJlbCwgdGhpcy50aGVtZS5sYWJlbCkgLyAyKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxlZnQ6IGxlZnQsXG4gICAgICAgICAgICB0b3A6IHRvcFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgY2VudGVyIGxlZ2VuZC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciBjb250YWluZXJcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGxlZ2VuZHMgbGVnZW5kc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48b2JqZWN0Pn0gY2VudGVyUG9zaXRpb25zIGNlbnRlciBwb3NpdGlvbnNcbiAgICAgKiBAcmV0dXJuIHtIVE1MRWxlbWVudH0gYXJlYSBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyQ2VudGVyTGVnZW5kOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGVsQXJlYSA9IHRoaXMuX3JlbmRlckxlZ2VuZExhYmVsKG5lLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgIHBvc2l0aW9uczogbmUudXRpbC5wbHVjayhwYXJhbXMuc2VjdG9yc0luZm8sICdjZW50ZXJQb3NpdGlvbicpLFxuICAgICAgICAgICAgbW92ZVRvUG9zaXRpb246IG5lLnV0aWwuYmluZCh0aGlzLl9tb3ZlVG9DZW50ZXJQb3NpdGlvbiwgdGhpcyksXG4gICAgICAgICAgICBzZXBhcmF0b3I6ICc8YnI+J1xuICAgICAgICB9LCBwYXJhbXMpKTtcblxuICAgICAgICByZXR1cm4gZWxBcmVhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgZW5kIHBvc2l0aW9uLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjZW50ZXJMZWZ0IGNlbnRlciBsZWZ0XG4gICAgICogQHBhcmFtIHthcnJheS48b2JqZWN0Pn0gcG9zaXRpb25zIHBvc2l0aW9uc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2FkZEVuZFBvc2l0aW9uOiBmdW5jdGlvbihjZW50ZXJMZWZ0LCBwb3NpdGlvbnMpIHtcbiAgICAgICAgbmUudXRpbC5mb3JFYWNoKHBvc2l0aW9ucywgZnVuY3Rpb24ocG9zaXRpb24pIHtcbiAgICAgICAgICAgIHZhciBlbmQgPSBuZS51dGlsLmV4dGVuZCh7fSwgcG9zaXRpb24ubWlkZGxlKTtcbiAgICAgICAgICAgIGlmIChlbmQubGVmdCA8IGNlbnRlckxlZnQpIHtcbiAgICAgICAgICAgICAgICBlbmQubGVmdCAtPSBjaGFydENvbnN0LlNFUklFU19PVVRFUl9MQUJFTF9QQURESU5HO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBlbmQubGVmdCArPSBjaGFydENvbnN0LlNFUklFU19PVVRFUl9MQUJFTF9QQURESU5HO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcG9zaXRpb24uZW5kID0gZW5kO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTW92ZSB0byBvdXRlciBwb3NpdGlvbi5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gY2VudGVyTGVmdCBjZW50ZXIgbGVmdFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwb3NpdGlvbiBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBsYWJlbCBsYWJlbFxuICAgICAqIEByZXR1cm5zIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IG91dGVyIHBvc2l0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbW92ZVRvT3V0ZXJQb3NpdGlvbjogZnVuY3Rpb24oY2VudGVyTGVmdCwgcG9zaXRpb24sIGxhYmVsKSB7XG4gICAgICAgIHZhciBwb3NpdGlvbkVuZCA9IHBvc2l0aW9uLmVuZCxcbiAgICAgICAgICAgIGxlZnQgPSBwb3NpdGlvbkVuZC5sZWZ0LFxuICAgICAgICAgICAgdG9wID0gcG9zaXRpb25FbmQudG9wIC0gKHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodChsYWJlbCwgdGhpcy50aGVtZS5sYWJlbCkgLyAyKTtcblxuICAgICAgICBpZiAobGVmdCA8IGNlbnRlckxlZnQpIHtcbiAgICAgICAgICAgIGxlZnQgLT0gcmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsV2lkdGgobGFiZWwsIHRoaXMudGhlbWUubGFiZWwpICsgY2hhcnRDb25zdC5TRVJJRVNfTEFCRUxfUEFERElORztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxlZnQgKz0gY2hhcnRDb25zdC5TRVJJRVNfTEFCRUxfUEFERElORztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsZWZ0OiBsZWZ0LFxuICAgICAgICAgICAgdG9wOiB0b3BcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIG91dGVyIGxlZ2VuZC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciBjb250YWluZXJcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGxlZ2VuZHMgbGVnZW5kc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48b2JqZWN0Pn0gY2VudGVyUG9zaXRpb25zIGNlbnRlciBwb3NpdGlvbnNcbiAgICAgKiBAcmV0dXJuIHtIVE1MRWxlbWVudH0gYXJlYSBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyT3V0ZXJMZWdlbmQ6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgb3V0ZXJQb3NpdGlvbnMgPSBuZS51dGlsLnBsdWNrKHBhcmFtcy5zZWN0b3JzSW5mbywgJ291dGVyUG9zaXRpb24nKSxcbiAgICAgICAgICAgIGNlbnRlckxlZnQgPSBwYXJhbXMuY2hhcnRXaWR0aCAvIDIsXG4gICAgICAgICAgICBlbEFyZWE7XG5cbiAgICAgICAgdGhpcy5fYWRkRW5kUG9zaXRpb24oY2VudGVyTGVmdCwgb3V0ZXJQb3NpdGlvbnMpO1xuICAgICAgICBlbEFyZWEgPSB0aGlzLl9yZW5kZXJMZWdlbmRMYWJlbChuZS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICBwb3NpdGlvbnM6IG91dGVyUG9zaXRpb25zLFxuICAgICAgICAgICAgbW92ZVRvUG9zaXRpb246IG5lLnV0aWwuYmluZCh0aGlzLl9tb3ZlVG9PdXRlclBvc2l0aW9uLCB0aGlzLCBjZW50ZXJMZWZ0KSxcbiAgICAgICAgICAgIHNlcGFyYXRvcjogJzombmJzcDsnXG4gICAgICAgIH0sIHBhcmFtcykpO1xuXG4gICAgICAgIGlmICh0aGlzLnBhcGVyKSB7XG4gICAgICAgICAgICB0aGlzLmdyYXBoUmVuZGVyZXIucmVuZGVyTGVnZW5kTGluZXModGhpcy5wYXBlciwgb3V0ZXJQb3NpdGlvbnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGVsQXJlYTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIHNlcmllcyBsYWJlbC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IGFyZWEgZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlclNlcmllc0xhYmVsOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGVsQXJlYTtcbiAgICAgICAgaWYgKHBhcmFtcy5vcHRpb25zLmxlZ2VuZFR5cGUgPT09IGNoYXJ0Q29uc3QuU0VSSUVTX0xFR0VORF9UWVBFX09VVEVSKSB7XG4gICAgICAgICAgICBlbEFyZWEgPSB0aGlzLl9yZW5kZXJPdXRlckxlZ2VuZChwYXJhbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZWxBcmVhID0gdGhpcy5fcmVuZGVyQ2VudGVyTGVnZW5kKHBhcmFtcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVsQXJlYTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGJvdW5kLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBncm91cEluZGV4IGdyb3VwIGluZGV4XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IGluZGV4XG4gICAgICogQHJldHVybnMge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gYm91bmRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRCb3VuZDogZnVuY3Rpb24oZ3JvdXBJbmRleCwgaW5kZXgpIHtcbiAgICAgICAgaWYgKGdyb3VwSW5kZXggPT09IC0xIHx8IGluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMucG9wdXBQb3NpdGlvbnNbaW5kZXhdO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTaG93IHNlcmllcyBsYWJlbCBhcmVhLlxuICAgICAqL1xuICAgIHNob3dTZXJpZXNMYWJlbEFyZWE6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmdyYXBoUmVuZGVyZXIuYW5pbWF0ZUxlZ2VuZExpbmVzKCk7XG4gICAgICAgIFNlcmllcy5wcm90b3R5cGUuc2hvd1Nlcmllc0xhYmVsQXJlYS5jYWxsKHRoaXMpO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBpZUNoYXJ0U2VyaWVzO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFNlcmllcyBiYXNlIGNvbXBvbmVudC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHNlcmllc1RlbXBsYXRlID0gcmVxdWlyZSgnLi9zZXJpZXNUZW1wbGF0ZS5qcycpLFxuICAgIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuLi9jb25zdC5qcycpLFxuICAgIGRvbSA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZG9tSGFuZGxlci5qcycpLFxuICAgIHJlbmRlclV0aWwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3JlbmRlclV0aWwuanMnKSxcbiAgICBldmVudCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZXZlbnRMaXN0ZW5lci5qcycpLFxuICAgIHBsdWdpbkZhY3RvcnkgPSByZXF1aXJlKCcuLi9mYWN0b3JpZXMvcGx1Z2luRmFjdG9yeS5qcycpO1xuXG52YXIgSElEREVOX1dJRFRIID0gMSxcbiAgICBTRVJJRVNfTEFCRUxfQ0xBU1NfTkFNRSA9ICduZS1jaGFydC1zZXJpZXMtbGFiZWwnO1xuXG52YXIgU2VyaWVzID0gbmUudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIFNlcmllcy5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIFNlcmllcyBiYXNlIGNvbXBvbmVudC5cbiAgICAgKiBAY29uc3RydWN0cyBTZXJpZXNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMubW9kZWwgc2VyaWVzIG1vZGVsXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgc2VyaWVzIG9wdGlvbnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgc2VyaWVzIHRoZW1lXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBsaWJUeXBlO1xuXG4gICAgICAgIG5lLnV0aWwuZXh0ZW5kKHRoaXMsIHBhcmFtcyk7XG4gICAgICAgIGxpYlR5cGUgPSBwYXJhbXMubGliVHlwZSB8fCBjaGFydENvbnN0LkRFRkFVTFRfUExVR0lOO1xuICAgICAgICB0aGlzLnBlcmNlbnRWYWx1ZXMgPSB0aGlzLl9tYWtlUGVyY2VudFZhbHVlcyhwYXJhbXMuZGF0YSwgcGFyYW1zLm9wdGlvbnMuc3RhY2tlZCk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHcmFwaCByZW5kZXJlclxuICAgICAgICAgKiBAdHlwZSB7b2JqZWN0fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5ncmFwaFJlbmRlcmVyID0gcGx1Z2luRmFjdG9yeS5nZXQobGliVHlwZSwgcGFyYW1zLmNoYXJ0VHlwZSk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNlcmllcyB2aWV3IGNsYXNzTmFtZVxuICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jbGFzc05hbWUgPSAnbmUtY2hhcnQtc2VyaWVzLWFyZWEnO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTaG93IHRvb2x0aXAgKG1vdXNlb3ZlciBjYWxsYmFjaykuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLnByZWZpeCB0b29sdGlwIGlkIHByZWZpeFxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuYWxsb3dOZWdhdGl2ZVRvb2x0aXAgd2hldGhlciBhbGxvdyBuZWdhdGl2ZSB0b29sdGlwIG9yIG5vdFxuICAgICAqIEBwYXJhbSB7e3RvcDpudW1iZXIsIGxlZnQ6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBib3VuZCBncmFwaCBib3VuZCBpbmZvcm1hdGlvblxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpZCB0b29sdGlwIGlkXG4gICAgICovXG4gICAgc2hvd1Rvb2x0aXA6IGZ1bmN0aW9uKHBhcmFtcywgYm91bmQsIGlkKSB7XG4gICAgICAgIHRoaXMuZmlyZSgnc2hvd1Rvb2x0aXAnLCBuZS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICBpZDogcGFyYW1zLnByZWZpeCArIGlkLFxuICAgICAgICAgICAgYm91bmQ6IGJvdW5kXG4gICAgICAgIH0sIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBIaWRlIHRvb2x0aXAgKG1vdXNlb3V0IGNhbGxiYWNrKS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcHJlZml4IHRvb2x0aXAgaWQgcHJlZml4XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGlkIHRvb2x0aXAgaWRcbiAgICAgKi9cbiAgICBoaWRlVG9vbHRpcDogZnVuY3Rpb24ocHJlZml4LCBpZCkge1xuICAgICAgICB0aGlzLmZpcmUoJ2hpZGVUb29sdGlwJywge1xuICAgICAgICAgICAgaWQ6IHByZWZpeCArIGlkXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgc2VyaWVzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciBvYmplY3QgZm9yIGdyYXBoIGRyYXdpbmdcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHNlcmllcyBlbGVtZW50XG4gICAgICovXG4gICAgcmVuZGVyOiBmdW5jdGlvbihwYXBlcikge1xuICAgICAgICB2YXIgZWwgPSBkb20uY3JlYXRlKCdESVYnLCB0aGlzLmNsYXNzTmFtZSksXG4gICAgICAgICAgICB0b29sdGlwUHJlZml4ID0gdGhpcy50b29sdGlwUHJlZml4LFxuICAgICAgICAgICAgYm91bmQgPSB0aGlzLmJvdW5kLFxuICAgICAgICAgICAgZGltZW5zaW9uID0gYm91bmQuZGltZW5zaW9uLFxuICAgICAgICAgICAgaW5DYWxsYmFjayA9IG5lLnV0aWwuYmluZCh0aGlzLnNob3dUb29sdGlwLCB0aGlzLCB7XG4gICAgICAgICAgICAgICAgcHJlZml4OiB0b29sdGlwUHJlZml4LFxuICAgICAgICAgICAgICAgIGFsbG93TmVnYXRpdmVUb29sdGlwOiAhIXRoaXMuYWxsb3dOZWdhdGl2ZVRvb2x0aXAsXG4gICAgICAgICAgICAgICAgY2hhcnRUeXBlOiB0aGlzLmNoYXJ0VHlwZVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBvdXRDYWxsYmFjayA9IG5lLnV0aWwuYmluZCh0aGlzLmhpZGVUb29sdGlwLCB0aGlzLCB0b29sdGlwUHJlZml4KSxcbiAgICAgICAgICAgIGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgZGltZW5zaW9uOiBkaW1lbnNpb24sXG4gICAgICAgICAgICAgICAgdGhlbWU6IHRoaXMudGhlbWUsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYWRkRGF0YSA9IHRoaXMubWFrZUFkZERhdGEoKSxcbiAgICAgICAgICAgIGFkZERhdGFGb3JTZXJpZXNMYWJlbDtcblxuICAgICAgICBpZiAoIXBhcGVyKSB7XG4gICAgICAgICAgICByZW5kZXJVdGlsLnJlbmRlckRpbWVuc2lvbihlbCwgZGltZW5zaW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3JlbmRlclBvc2l0aW9uKGVsLCBib3VuZC5wb3NpdGlvbiwgdGhpcy5jaGFydFR5cGUpO1xuXG4gICAgICAgIGRhdGEgPSBuZS51dGlsLmV4dGVuZChkYXRhLCBhZGREYXRhKTtcblxuICAgICAgICB0aGlzLnBhcGVyID0gdGhpcy5ncmFwaFJlbmRlcmVyLnJlbmRlcihwYXBlciwgZWwsIGRhdGEsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKTtcblxuICAgICAgICBpZiAodGhpcy5fcmVuZGVyU2VyaWVzTGFiZWwpIHtcbiAgICAgICAgICAgIGFkZERhdGFGb3JTZXJpZXNMYWJlbCA9IHRoaXMuX21ha2VBZGREYXRhRm9yU2VyaWVzTGFiZWwoZWwsIGRpbWVuc2lvbik7XG4gICAgICAgICAgICB0aGlzLmVsU2VyaWVzTGFiZWxBcmVhID0gdGhpcy5fcmVuZGVyU2VyaWVzTGFiZWwobmUudXRpbC5leHRlbmQoYWRkRGF0YUZvclNlcmllc0xhYmVsLCBhZGREYXRhKSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmF0dGFjaEV2ZW50KGVsKTtcblxuICAgICAgICAvLyBzZXJpZXMgbGFiZWwgbW91c2UgZXZlbnQg64+Z7J6RIOyLnCDsgqzsmqlcbiAgICAgICAgdGhpcy5pbkNhbGxiYWNrID0gaW5DYWxsYmFjaztcbiAgICAgICAgdGhpcy5vdXRDYWxsYmFjayA9IG91dENhbGxiYWNrO1xuXG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBhZGQgZGF0YS5cbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBhZGQgZGF0YVxuICAgICAqL1xuICAgIG1ha2VBZGREYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHt9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGFkZCBkYXRhIGZvciBzZXJpZXMgbGFiZWwuXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNvbnRhaW5lclxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX1kaW1lbnNpb25cbiAgICAgKiBAcmV0dXJucyB7e1xuICAgICAqICAgICAgY29udGFpbmVyOiBIVE1MRWxlbWVudCxcbiAgICAgKiAgICAgIHZhbHVlczogYXJyYXkuPGFycmF5PixcbiAgICAgKiAgICAgIGZvcm1hdHRlZFZhbHVlczogYXJyYXkuPGFycmF5PixcbiAgICAgKiAgICAgIGZvcm1hdEZ1bmN0aW9uczogYXJyYXkuPGZ1bmN0aW9uPixcbiAgICAgKiAgICAgIGRpbWVuc2lvbjoge3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfVxuICAgICAqIH19IGFkZCBkYXRhIGZvciBzZXJpZXMgbGFiZWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQWRkRGF0YUZvclNlcmllc0xhYmVsOiBmdW5jdGlvbihjb250YWluZXIsIGRpbWVuc2lvbikge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY29udGFpbmVyOiBjb250YWluZXIsXG4gICAgICAgICAgICB2YWx1ZXM6IHRoaXMuZGF0YS52YWx1ZXMsXG4gICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXM6IHRoaXMuZGF0YS5mb3JtYXR0ZWRWYWx1ZXMsXG4gICAgICAgICAgICBmb3JtYXRGdW5jdGlvbnM6IHRoaXMuZGF0YS5mb3JtYXRGdW5jdGlvbnMsXG4gICAgICAgICAgICBkaW1lbnNpb246IGRpbWVuc2lvblxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgYm91bmRzXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgc2VyaWVzIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGRpbWVuc2lvbiBzZXJpZXMgZGltZW5zaW9uXG4gICAgICogQHBhcmFtIHt7dG9wOiBudW1iZXIsIGxlZnQ6IG51bWJlcn19IHBvc2l0aW9uIHNlcmllcyBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjaGFydFR5cGUgY2hhcnQgdHlwZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlclBvc2l0aW9uOiBmdW5jdGlvbihlbCwgcG9zaXRpb24sIGNoYXJ0VHlwZSkge1xuICAgICAgICB2YXIgaGlkZGVuV2lkdGggPSByZW5kZXJVdGlsLmlzSUU4KCkgPyAwIDogSElEREVOX1dJRFRIO1xuICAgICAgICBwb3NpdGlvbi50b3AgPSBwb3NpdGlvbi50b3AgLSBISURERU5fV0lEVEg7XG4gICAgICAgIHBvc2l0aW9uLmxlZnQgPSBwb3NpdGlvbi5sZWZ0ICsgKGNoYXJ0VHlwZSA9PT0gY2hhcnRDb25zdC5DSEFSVF9UWVBFX0JBUiA/IGhpZGRlbldpZHRoIDogSElEREVOX1dJRFRIICogMik7XG4gICAgICAgIHJlbmRlclV0aWwucmVuZGVyUG9zaXRpb24oZWwsIHBvc2l0aW9uKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHBhcGVyLlxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IG9iamVjdCBmb3IgZ3JhcGggZHJhd2luZ1xuICAgICAqL1xuICAgIGdldFBhcGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFwZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgcGVyY2VudCB2YWx1ZS5cbiAgICAgKiBAcGFyYW0ge3t2YWx1ZXM6IGFycmF5LCBzY2FsZToge21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19fSBkYXRhIHNlcmllcyBkYXRhXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHN0YWNrZWQgc3RhY2tlZCBvcHRpb25cbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxudW1iZXI+Pn0gcGVyY2VudCB2YWx1ZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlUGVyY2VudFZhbHVlczogZnVuY3Rpb24oZGF0YSwgc3RhY2tlZCkge1xuICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICBpZiAoc3RhY2tlZCA9PT0gY2hhcnRDb25zdC5TVEFDS0VEX05PUk1BTF9UWVBFKSB7XG4gICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9tYWtlTm9ybWFsU3RhY2tlZFBlcmNlbnRWYWx1ZXMoZGF0YSk7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RhY2tlZCA9PT0gY2hhcnRDb25zdC5TVEFDS0VEX1BFUkNFTlRfVFlQRSkge1xuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5fbWFrZVBlcmNlbnRTdGFja2VkUGVyY2VudFZhbHVlcyhkYXRhKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuX21ha2VOb3JtYWxQZXJjZW50VmFsdWVzKGRhdGEpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBwZXJjZW50IHZhbHVlcyBhYm91dCBub3JtYWwgc3RhY2tlZCBvcHRpb24uXG4gICAgICogQHBhcmFtIHt7dmFsdWVzOiBhcnJheSwgc2NhbGU6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fX0gZGF0YSBzZXJpZXMgZGF0YVxuICAgICAqIEByZXR1cm5zIHthcnJheX0gcGVyY2VudCB2YWx1ZXMgYWJvdXQgbm9ybWFsIHN0YWNrZWQgb3B0aW9uLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VOb3JtYWxTdGFja2VkUGVyY2VudFZhbHVlczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgbWluID0gZGF0YS5zY2FsZS5taW4sXG4gICAgICAgICAgICBtYXggPSBkYXRhLnNjYWxlLm1heCxcbiAgICAgICAgICAgIGRpc3RhbmNlID0gbWF4IC0gbWluLFxuICAgICAgICAgICAgcGVyY2VudFZhbHVlcyA9IG5lLnV0aWwubWFwKGRhdGEudmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGx1c1ZhbHVlcyA9IG5lLnV0aWwuZmlsdGVyKHZhbHVlcywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSA+IDA7XG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBzdW0gPSBuZS51dGlsLnN1bShwbHVzVmFsdWVzKSxcbiAgICAgICAgICAgICAgICAgICAgZ3JvdXBQZXJjZW50ID0gKHN1bSAtIG1pbikgLyBkaXN0YW5jZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgPT09IDAgPyAwIDogZ3JvdXBQZXJjZW50ICogKHZhbHVlIC8gc3VtKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcGVyY2VudFZhbHVlcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBwZXJjZW50IHZhbHVlcyBhYm91dCBwZXJjZW50IHN0YWNrZWQgb3B0aW9uLlxuICAgICAqIEBwYXJhbSB7e3ZhbHVlczogYXJyYXksIHNjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX19IGRhdGEgc2VyaWVzIGRhdGFcbiAgICAgKiBAcmV0dXJucyB7YXJyYXl9IHBlcmNlbnQgdmFsdWVzIGFib3V0IHBlcmNlbnQgc3RhY2tlZCBvcHRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlUGVyY2VudFN0YWNrZWRQZXJjZW50VmFsdWVzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBwZXJjZW50VmFsdWVzID0gbmUudXRpbC5tYXAoZGF0YS52YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICAgICAgdmFyIHBsdXNWYWx1ZXMgPSBuZS51dGlsLmZpbHRlcih2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSA+IDA7XG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgc3VtID0gbmUudXRpbC5zdW0ocGx1c1ZhbHVlcyk7XG4gICAgICAgICAgICByZXR1cm4gbmUudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSA9PT0gMCA/IDAgOiB2YWx1ZSAvIHN1bTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHBlcmNlbnRWYWx1ZXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgbGluZSB0eXBlIGNoYXJ0IG9yIG5vdC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY2hhcnRUeXBlIGNoYXJ0IHR5cGVcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gcmVzdWx0IGJvb2xlYW5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc0xpbmVUeXBlQ2hhcnQ6IGZ1bmN0aW9uKGNoYXJ0VHlwZSkge1xuICAgICAgICByZXR1cm4gY2hhcnRUeXBlID09PSBjaGFydENvbnN0LkNIQVJUX1RZUEVfTElORSB8fCBjaGFydFR5cGUgPT09IGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9BUkVBO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIG5vcm1hbCBwZXJjZW50IHZhbHVlLlxuICAgICAqIEBwYXJhbSB7e3ZhbHVlczogYXJyYXksIHNjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX19IGRhdGEgc2VyaWVzIGRhdGFcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxudW1iZXI+Pn0gcGVyY2VudCB2YWx1ZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlTm9ybWFsUGVyY2VudFZhbHVlczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgbWluID0gZGF0YS5zY2FsZS5taW4sXG4gICAgICAgICAgICBtYXggPSBkYXRhLnNjYWxlLm1heCxcbiAgICAgICAgICAgIGRpc3RhbmNlID0gbWF4IC0gbWluLFxuICAgICAgICAgICAgaXNMaW5lVHlwZUNoYXJ0ID0gdGhpcy5faXNMaW5lVHlwZUNoYXJ0KHRoaXMuY2hhcnRUeXBlKSxcbiAgICAgICAgICAgIGZsYWcgPSAxLFxuICAgICAgICAgICAgc3ViVmFsdWUgPSAwLFxuICAgICAgICAgICAgcGVyY2VudFZhbHVlcztcblxuICAgICAgICBpZiAoIWlzTGluZVR5cGVDaGFydCAmJiBtaW4gPCAwICYmIG1heCA8PSAwKSB7XG4gICAgICAgICAgICBmbGFnID0gLTE7XG4gICAgICAgICAgICBzdWJWYWx1ZSA9IG1heDtcbiAgICAgICAgICAgIGRpc3RhbmNlID0gbWluIC0gbWF4O1xuICAgICAgICB9IGVsc2UgaWYgKGlzTGluZVR5cGVDaGFydCB8fCBtaW4gPj0gMCkge1xuICAgICAgICAgICAgc3ViVmFsdWUgPSBtaW47XG4gICAgICAgIH1cblxuICAgICAgICBwZXJjZW50VmFsdWVzID0gbmUudXRpbC5tYXAoZGF0YS52YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICAgICAgcmV0dXJuIG5lLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKHZhbHVlIC0gc3ViVmFsdWUpICogZmxhZyAvIGRpc3RhbmNlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcGVyY2VudFZhbHVlcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHNjYWxlIGRpc3RhbmNlIGZyb20gemVybyBwb2ludC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc2l6ZSBjaGFydCBzaXplICh3aWR0aCBvciBoZWlnaHQpXG4gICAgICogQHBhcmFtIHt7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX0gc2NhbGUgc2NhbGVcbiAgICAgKiBAcmV0dXJucyB7e3RvTWF4OiBudW1iZXIsIHRvTWluOiBudW1iZXJ9fSBwaXhlbCBkaXN0YW5jZVxuICAgICAqL1xuICAgIGdldFNjYWxlRGlzdGFuY2VGcm9tWmVyb1BvaW50OiBmdW5jdGlvbihzaXplLCBzY2FsZSkge1xuICAgICAgICB2YXIgbWluID0gc2NhbGUubWluLFxuICAgICAgICAgICAgbWF4ID0gc2NhbGUubWF4LFxuICAgICAgICAgICAgZGlzdGFuY2UgPSBtYXggLSBtaW4sXG4gICAgICAgICAgICB0b01heCA9IDAsXG4gICAgICAgICAgICB0b01pbiA9IDA7XG5cbiAgICAgICAgaWYgKG1pbiA8IDAgJiYgbWF4ID4gMCkge1xuICAgICAgICAgICAgdG9NYXggPSAoZGlzdGFuY2UgKyBtaW4pIC8gZGlzdGFuY2UgKiBzaXplO1xuICAgICAgICAgICAgdG9NaW4gPSAoZGlzdGFuY2UgLSBtYXgpIC8gZGlzdGFuY2UgKiBzaXplO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRvTWF4OiB0b01heCxcbiAgICAgICAgICAgIHRvTWluOiB0b01pblxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBPbiBtb3VzZW92ZXIgZXZlbnQgaGFuZGxlciBmb3Igc2VyaWVzIGFyZWFcbiAgICAgKiBAcGFyYW0ge01vdXNlRXZlbnR9IGUgbW91c2UgZXZlbnRcbiAgICAgKi9cbiAgICBvbk1vdXNlb3ZlcjogZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgZWxUYXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQsXG4gICAgICAgICAgICBncm91cEluZGV4LCBpbmRleDtcblxuICAgICAgICBpZiAoZWxUYXJnZXQuY2xhc3NOYW1lICE9PSBTRVJJRVNfTEFCRUxfQ0xBU1NfTkFNRSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZ3JvdXBJbmRleCA9IGVsVGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1ncm91cC1pbmRleCcpO1xuICAgICAgICBpbmRleCA9IGVsVGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1pbmRleCcpO1xuICAgICAgICBpZiAoZ3JvdXBJbmRleCA9PT0gJy0xJyB8fCBpbmRleCA9PT0gJy0xJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaW5DYWxsYmFjayh0aGlzLl9nZXRCb3VuZChncm91cEluZGV4LCBpbmRleCksIGdyb3VwSW5kZXggKyAnLScgKyBpbmRleCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE9uIG1vdXNlb3V0IGV2ZW50IGhhbmRsZXIgZm9yIHNlcmllcyBhcmVhXG4gICAgICogQHBhcmFtIHtNb3VzZUV2ZW50fSBlIG1vdXNlIGV2ZW50XG4gICAgICovXG4gICAgb25Nb3VzZW91dDogZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgZWxUYXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQsXG4gICAgICAgICAgICBncm91cEluZGV4LCBpbmRleDtcblxuICAgICAgICBpZiAoZWxUYXJnZXQuY2xhc3NOYW1lICE9PSBTRVJJRVNfTEFCRUxfQ0xBU1NfTkFNRSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZ3JvdXBJbmRleCA9IGVsVGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1ncm91cC1pbmRleCcpO1xuICAgICAgICBpbmRleCA9IGVsVGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1pbmRleCcpO1xuXG4gICAgICAgIGlmIChncm91cEluZGV4ID09PSAnLTEnIHx8IGluZGV4ID09PSAnLTEnKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm91dENhbGxiYWNrKGdyb3VwSW5kZXggKyAnLScgKyBpbmRleCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCBldmVudFxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICovXG4gICAgYXR0YWNoRXZlbnQ6IGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgIGV2ZW50LmJpbmRFdmVudCgnbW91c2VvdmVyJywgZWwsIG5lLnV0aWwuYmluZCh0aGlzLm9uTW91c2VvdmVyLCB0aGlzKSk7XG4gICAgICAgIGV2ZW50LmJpbmRFdmVudCgnbW91c2VvdXQnLCBlbCwgbmUudXRpbC5iaW5kKHRoaXMub25Nb3VzZW91dCwgdGhpcykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxsIHNob3dEb3QgZnVuY3Rpb24gb2YgZ3JhcGhSZW5kZXJlci5cbiAgICAgKiBAcGFyYW0ge3tncm91cEluZGV4OiBudW1iZXIsIGluZGV4OiBudW1iZXJ9fSBkYXRhIGRhdGFcbiAgICAgKi9cbiAgICBvblNob3dBbmltYXRpb246IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgaWYgKCF0aGlzLmdyYXBoUmVuZGVyZXIuc2hvd0FuaW1hdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ3JhcGhSZW5kZXJlci5zaG93QW5pbWF0aW9uLmNhbGwodGhpcy5ncmFwaFJlbmRlcmVyLCBkYXRhKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsbCBoaWRlRG90IGZ1bmN0aW9uIG9mIGdyYXBoUmVuZGVyZXIuXG4gICAgICogQHBhcmFtIHt7Z3JvdXBJbmRleDogbnVtYmVyLCBpbmRleDogbnVtYmVyfX0gZGF0YSBkYXRhXG4gICAgICovXG4gICAgb25IaWRlQW5pbWF0aW9uOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIGlmICghdGhpcy5ncmFwaFJlbmRlcmVyLmhpZGVBbmltYXRpb24pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmdyYXBoUmVuZGVyZXIuaGlkZUFuaW1hdGlvbi5jYWxsKHRoaXMuZ3JhcGhSZW5kZXJlciwgZGF0YSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFuaW1hdGUgY29tcG9uZW50XG4gICAgICovXG4gICAgYW5pbWF0ZUNvbXBvbmVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmdyYXBoUmVuZGVyZXIuYW5pbWF0ZSkge1xuICAgICAgICAgICAgdGhpcy5ncmFwaFJlbmRlcmVyLmFuaW1hdGUobmUudXRpbC5iaW5kKHRoaXMuc2hvd1Nlcmllc0xhYmVsQXJlYSwgdGhpcykpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgaHRtbCBhYm91dCBzZXJpZXMgbGFiZWxcbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gcG9zaXRpb24gcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWUgdmFsdWVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZ3JvdXBJbmRleCBncm91cCBpbmRleFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBpbmRleFxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGh0bWwgc3RyaW5nXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVNlcmllc0xhYmVsSHRtbDogZnVuY3Rpb24ocG9zaXRpb24sIHZhbHVlLCBncm91cEluZGV4LCBpbmRleCkge1xuICAgICAgICB2YXIgY3NzT2JqID0gbmUudXRpbC5leHRlbmQocG9zaXRpb24sIHRoaXMudGhlbWUubGFiZWwpO1xuICAgICAgICByZXR1cm4gc2VyaWVzVGVtcGxhdGUudHBsU2VyaWVzTGFiZWwoe1xuICAgICAgICAgICAgY3NzVGV4dDogc2VyaWVzVGVtcGxhdGUudHBsQ3NzVGV4dChjc3NPYmopLFxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgZ3JvdXBJbmRleDogZ3JvdXBJbmRleCxcbiAgICAgICAgICAgIGluZGV4OiBpbmRleFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2hvdyBzZXJpZXMgbGFiZWwgYXJlYS5cbiAgICAgKi9cbiAgICBzaG93U2VyaWVzTGFiZWxBcmVhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCghdGhpcy5vcHRpb25zLnNob3dMYWJlbCAmJiAhdGhpcy5vcHRpb25zLmxlZ2VuZFR5cGUpIHx8ICF0aGlzLmVsU2VyaWVzTGFiZWxBcmVhKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBkb20uYWRkQ2xhc3ModGhpcy5lbFNlcmllc0xhYmVsQXJlYSwgJ3Nob3cnKTtcblxuICAgICAgICAobmV3IG5lLmNvbXBvbmVudC5FZmZlY3RzLkZhZGUoe1xuICAgICAgICAgICAgZWxlbWVudDogdGhpcy5lbFNlcmllc0xhYmVsQXJlYSxcbiAgICAgICAgICAgIGR1cmF0aW9uOiAzMDBcbiAgICAgICAgfSkpLmFjdGlvbih7XG4gICAgICAgICAgICBzdGFydDogMCxcbiAgICAgICAgICAgIGVuZDogMSxcbiAgICAgICAgICAgIGNvbXBsZXRlOiBmdW5jdGlvbigpIHt9XG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuXG5uZS51dGlsLkN1c3RvbUV2ZW50cy5taXhpbihTZXJpZXMpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNlcmllcztcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBUaGlzIGlzIHRlbXBsYXRlcyBvZiBzZXJpZXMuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG52YXIgdGVtcGxhdGVNYWtlciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvdGVtcGxhdGVNYWtlci5qcycpO1xuXG52YXIgdGFncyA9IHtcbiAgICBIVE1MX1NFUklFU19MQUJFTDogJzxkaXYgY2xhc3M9XCJuZS1jaGFydC1zZXJpZXMtbGFiZWxcIiBzdHlsZT1cInt7IGNzc1RleHQgfX1cIiBkYXRhLWdyb3VwLWluZGV4PVwie3sgZ3JvdXBJbmRleCB9fVwiIGRhdGEtaW5kZXg9XCJ7eyBpbmRleCB9fVwiPnt7IHZhbHVlIH19PC9kaXY+JyxcbiAgICBURVhUX0NTU19URVhUOiAnbGVmdDp7eyBsZWZ0IH19cHg7dG9wOnt7IHRvcCB9fXB4O2ZvbnQtZmFtaWx5Ont7IGZvbnRGYW1pbHkgfX07Zm9udC1zaXplOnt7IGZvbnRTaXplIH19cHgnXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICB0cGxTZXJpZXNMYWJlbDogdGVtcGxhdGVNYWtlci50ZW1wbGF0ZSh0YWdzLkhUTUxfU0VSSUVTX0xBQkVMKSxcbiAgICB0cGxDc3NUZXh0OiB0ZW1wbGF0ZU1ha2VyLnRlbXBsYXRlKHRhZ3MuVEVYVF9DU1NfVEVYVClcbn07XG4iLCJ2YXIgREVGQVVMVF9DT0xPUiA9ICcjMDAwMDAwJyxcbiAgICBERUZBVUxUX0JBQ0tHUk9VTkQgPSAnI2ZmZmZmZicsXG4gICAgRU1QVFlfRk9OVCA9ICcnLFxuICAgIERFRkFVTFRfQVhJUyA9IHtcbiAgICAgICAgdGlja0NvbG9yOiBERUZBVUxUX0NPTE9SLFxuICAgICAgICB0aXRsZToge1xuICAgICAgICAgICAgZm9udFNpemU6IDEyLFxuICAgICAgICAgICAgZm9udEZhbWlseTogRU1QVFlfRk9OVCxcbiAgICAgICAgICAgIGNvbG9yOiBERUZBVUxUX0NPTE9SXG4gICAgICAgIH0sXG4gICAgICAgIGxhYmVsOiB7XG4gICAgICAgICAgICBmb250U2l6ZTogMTIsXG4gICAgICAgICAgICBmb250RmFtaWx5OiBFTVBUWV9GT05ULFxuICAgICAgICAgICAgY29sb3I6IERFRkFVTFRfQ09MT1JcbiAgICAgICAgfVxuICAgIH07XG5cbnZhciBkZWZhdWx0VGhlbWUgPSB7XG4gICAgY2hhcnQ6IHtcbiAgICAgICAgYmFja2dyb3VuZDogREVGQVVMVF9CQUNLR1JPVU5ELFxuICAgICAgICBmb250RmFtaWx5OiAnVmVyZGFuYSdcbiAgICB9LFxuICAgIHRpdGxlOiB7XG4gICAgICAgIGZvbnRTaXplOiAxOCxcbiAgICAgICAgZm9udEZhbWlseTogRU1QVFlfRk9OVCxcbiAgICAgICAgY29sb3I6IERFRkFVTFRfQ09MT1JcbiAgICB9LFxuICAgIHlBeGlzOiBERUZBVUxUX0FYSVMsXG4gICAgeEF4aXM6IERFRkFVTFRfQVhJUyxcbiAgICBwbG90OiB7XG4gICAgICAgIGxpbmVDb2xvcjogJyNkZGRkZGQnLFxuICAgICAgICBiYWNrZ3JvdW5kOiAnI2ZmZmZmZidcbiAgICB9LFxuICAgIHNlcmllczoge1xuICAgICAgICBsYWJlbDoge1xuICAgICAgICAgICAgZm9udFNpemU6IDExLFxuICAgICAgICAgICAgZm9udEZhbWlseTogRU1QVFlfRk9OVCxcbiAgICAgICAgICAgIGNvbG9yOiBERUZBVUxUX0NPTE9SXG4gICAgICAgIH0sXG4gICAgICAgIGNvbG9yczogWycjYWM0MTQyJywgJyNkMjg0NDUnLCAnI2Y0YmY3NScsICcjOTBhOTU5JywgJyM3NWI1YWEnLCAnIzZhOWZiNScsICcjYWE3NTlmJywgJyM4ZjU1MzYnXVxuICAgIH0sXG4gICAgbGVnZW5kOiB7XG4gICAgICAgIGxhYmVsOiB7XG4gICAgICAgICAgICBmb250U2l6ZTogMTIsXG4gICAgICAgICAgICBmb250RmFtaWx5OiBFTVBUWV9GT05ULFxuICAgICAgICAgICAgY29sb3I6IERFRkFVTFRfQ09MT1JcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZGVmYXVsdFRoZW1lO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFRvb2x0aXAgY29tcG9uZW50LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4uL2NvbnN0LmpzJyksXG4gICAgZG9tID0gcmVxdWlyZSgnLi4vaGVscGVycy9kb21IYW5kbGVyLmpzJyksXG4gICAgcmVuZGVyVXRpbCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvcmVuZGVyVXRpbC5qcycpLFxuICAgIGV2ZW50ID0gcmVxdWlyZSgnLi4vaGVscGVycy9ldmVudExpc3RlbmVyLmpzJyksXG4gICAgdGVtcGxhdGVNYWtlciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvdGVtcGxhdGVNYWtlci5qcycpLFxuICAgIHRvb2x0aXBUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdG9vbHRpcFRlbXBsYXRlLmpzJyk7XG5cbnZhciBUT09MVElQX0dBUCA9IDUsXG4gICAgSElEREVOX1dJRFRIID0gMSxcbiAgICBUT09MVElQX0NMQVNTX05BTUUgPSAnbmUtY2hhcnQtdG9vbHRpcCcsXG4gICAgSElERV9ERUxBWSA9IDA7XG5cbnZhciBjb25jYXQgPSBBcnJheS5wcm90b3R5cGUuY29uY2F0O1xuXG52YXIgVG9vbHRpcCA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBUb29sdGlwLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogVG9vbHRpcCBjb21wb25lbnQuXG4gICAgICogQGNvbnN0cnVjdHMgVG9vbHRpcFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48bnVtYmVyPn0gcGFyYW1zLnZhbHVlcyBjb252ZXJ0ZWQgdmFsdWVzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5fSBwYXJhbXMubGFiZWxzIGxhYmVsc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheX0gcGFyYW1zLmxlZ2VuZExhYmVscyBsZWdlbmQgbGFiZWxzXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcHJlZml4IHRvb2x0aXAgcHJlZml4XG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmJvdW5kIGF4aXMgYm91bmRcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgYXhpcyB0aGVtZVxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICBuZS51dGlsLmV4dGVuZCh0aGlzLCBwYXJhbXMpO1xuICAgICAgICAvKipcbiAgICAgICAgICogVG9vbHRpcCB2aWV3IGNsYXNzTmFtZVxuICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jbGFzc05hbWUgPSAnbmUtY2hhcnQtdG9vbHRpcC1hcmVhJztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIHRvb2x0aXAuXG4gICAgICogQHBhcmFtIHt7cG9zaXRpb246IG9iamVjdH19IGJvdW5kIHRvb2x0aXAgYm91bmRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcHJlZml4IHRvb2x0aXAgaWQgcHJlZml4XG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSB0b29sdGlwIGVsZW1lbnRcbiAgICAgKi9cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZWwgPSBkb20uY3JlYXRlKCdESVYnLCB0aGlzLmNsYXNzTmFtZSksXG4gICAgICAgICAgICBib3VuZCA9IHRoaXMuYm91bmQ7XG5cbiAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJQb3NpdGlvbihlbCwgYm91bmQucG9zaXRpb24pO1xuICAgICAgICBlbC5pbm5lckhUTUwgPSB0aGlzLl9tYWtlVG9vbHRpcHNIdG1sKCk7XG5cbiAgICAgICAgdGhpcy5hdHRhY2hFdmVudChlbCk7XG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSB0b29sdGlwIGRhdGEuXG4gICAgICogQHJldHVybnMge2FycmF5LjxvYmplY3Q+fSB0b29sdGlwIGRhdGFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlVG9vbHRpcERhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbGFiZWxzID0gdGhpcy5sYWJlbHMsXG4gICAgICAgICAgICBncm91cFZhbHVlcyA9IHRoaXMudmFsdWVzLFxuICAgICAgICAgICAgbGVnZW5kTGFiZWxzID0gdGhpcy5sZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICB0b29sdGlwRGF0YSA9IG5lLnV0aWwubWFwKGdyb3VwVmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMsIGdyb3VwSW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgaXRlbXMgPSBuZS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IHt2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBsZWdlbmRMYWJlbDogbGVnZW5kTGFiZWxzW2luZGV4XSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBncm91cEluZGV4ICsgJy0nICsgaW5kZXhcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxhYmVscykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5sYWJlbCA9IGxhYmVsc1tncm91cEluZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBpdGVtcztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gY29uY2F0LmFwcGx5KFtdLCB0b29sdGlwRGF0YSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgaHRtbCBvZiB0b29sdGlwLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhIHRvb2x0aXAgZGF0YVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwcmVmaXggdG9vbHRpcCBpZCBwcmVmaXhcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBodG1sXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVRvb2x0aXBzSHRtbDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zLFxuICAgICAgICAgICAgcHJlZml4ID0gdGhpcy5wcmVmaXgsXG4gICAgICAgICAgICBkYXRhID0gdGhpcy5fbWFrZVRvb2x0aXBEYXRhKCksXG4gICAgICAgICAgICBvcHRpb25UZW1wbGF0ZSA9IG9wdGlvbnMudGVtcGxhdGUgPyBvcHRpb25zLnRlbXBsYXRlIDogJycsXG4gICAgICAgICAgICB0cGxPdXRlciA9IHRvb2x0aXBUZW1wbGF0ZS50cGxUb29sdGlwLFxuICAgICAgICAgICAgdHBsVG9vbHRpcCA9IG9wdGlvblRlbXBsYXRlID8gdGVtcGxhdGVNYWtlci50ZW1wbGF0ZShvcHRpb25UZW1wbGF0ZSkgOiB0b29sdGlwVGVtcGxhdGUudHBsRGVmYXVsdFRlbXBsYXRlLFxuICAgICAgICAgICAgc3VmZml4ID0gb3B0aW9ucy5zdWZmaXggPyAnJm5ic3A7JyArIG9wdGlvbnMuc3VmZml4IDogJycsXG4gICAgICAgICAgICBodG1sID0gbmUudXRpbC5tYXAoZGF0YSwgZnVuY3Rpb24odG9vbHRpcERhdGEpIHtcbiAgICAgICAgICAgICAgICB2YXIgaWQgPSBwcmVmaXggKyB0b29sdGlwRGF0YS5pZCxcbiAgICAgICAgICAgICAgICAgICAgdG9vbHRpcEh0bWw7XG5cbiAgICAgICAgICAgICAgICB0b29sdGlwRGF0YSA9IG5lLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICcnLFxuICAgICAgICAgICAgICAgICAgICBsZWdlbmRMYWJlbDogJycsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgc3VmZml4OiBzdWZmaXhcbiAgICAgICAgICAgICAgICB9LCB0b29sdGlwRGF0YSk7XG4gICAgICAgICAgICAgICAgdG9vbHRpcEh0bWwgPSB0cGxUb29sdGlwKHRvb2x0aXBEYXRhKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHBsT3V0ZXIoe1xuICAgICAgICAgICAgICAgICAgICBpZDogaWQsXG4gICAgICAgICAgICAgICAgICAgIGh0bWw6IHRvb2x0aXBIdG1sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCB0aGlzKS5qb2luKCcnKTtcbiAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBpbmRleCBmcm9tIGlkXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGlkIHRvb2x0aXAgaWRcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPG51bWJlcj59IGluZGV4ZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRJbmRleEZyb21JZDogZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgdmFyIGlkcyA9IGlkLnNwbGl0KCctJyksXG4gICAgICAgICAgICBzbGljZUluZGV4ID0gaWRzLmxlbmd0aCAtIDI7XG4gICAgICAgIHJldHVybiBpZHMuc2xpY2Uoc2xpY2VJbmRleCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZpcmUgY3VzdG9tIGV2ZW50IHNob3dBbmltYXRpb24uXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGlkIHRvb2x0aXAgaWRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9maXJlU2hvd0FuaW1hdGlvbjogZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgdmFyIGluZGV4ZXMgPSB0aGlzLl9nZXRJbmRleEZyb21JZChpZCk7XG4gICAgICAgIHRoaXMuZmlyZSgnc2hvd0FuaW1hdGlvbicsIHtcbiAgICAgICAgICAgIGdyb3VwSW5kZXg6IGluZGV4ZXNbMF0sXG4gICAgICAgICAgICBpbmRleDogaW5kZXhlc1sxXVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmlyZSBjdXN0b20gZXZlbnQgaGlkZUFuaW1hdGlvbi5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgdG9vbHRpcCBpZFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2ZpcmVIaWRlQW5pbWF0aW9uOiBmdW5jdGlvbihpZCkge1xuICAgICAgICB2YXIgaW5kZXhlcyA9IHRoaXMuX2dldEluZGV4RnJvbUlkKGlkKTtcbiAgICAgICAgdGhpcy5maXJlKCdoaWRlQW5pbWF0aW9uJywge1xuICAgICAgICAgICAgZ3JvdXBJbmRleDogaW5kZXhlc1swXSxcbiAgICAgICAgICAgIGluZGV4OiBpbmRleGVzWzFdXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBPbiBtb3VzZW92ZXIgZXZlbnQgaGFuZGxlciBmb3IgdG9vbHRpcCBhcmVhXG4gICAgICogQHBhcmFtIHtNb3VzZUV2ZW50fSBlIG1vdXNlIGV2ZW50XG4gICAgICovXG4gICAgb25Nb3VzZW92ZXI6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIGVsVGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50LFxuICAgICAgICAgICAgaWQ7XG5cbiAgICAgICAgaWYgKCFkb20uaGFzQ2xhc3MoZWxUYXJnZXQsIFRPT0xUSVBfQ0xBU1NfTkFNRSkpIHtcbiAgICAgICAgICAgIGVsVGFyZ2V0ID0gZG9tLmZpbmRQYXJlbnRCeUNsYXNzKGVsVGFyZ2V0LCBUT09MVElQX0NMQVNTX05BTUUpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zaG93ZWRJZCA9IGlkID0gZWxUYXJnZXQuaWQ7XG4gICAgICAgIHRoaXMuX2ZpcmVTaG93QW5pbWF0aW9uKGlkKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogT24gbW91c2VvdXQgZXZlbnQgaGFuZGxlciBmb3IgdG9vbHRpcCBhcmVhXG4gICAgICogQHBhcmFtIHtNb3VzZUV2ZW50fSBlIG1vdXNlIGV2ZW50XG4gICAgICovXG4gICAgb25Nb3VzZW91dDogZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgZWxUYXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQsXG4gICAgICAgICAgICB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgIGluZGV4ZXM7XG5cbiAgICAgICAgaWYgKCFkb20uaGFzQ2xhc3MoZWxUYXJnZXQsIFRPT0xUSVBfQ0xBU1NfTkFNRSkpIHtcbiAgICAgICAgICAgIGVsVGFyZ2V0ID0gZG9tLmZpbmRQYXJlbnRCeUNsYXNzKGVsVGFyZ2V0LCBUT09MVElQX0NMQVNTX05BTUUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaW5kZXhlcyA9IHRoaXMuX2dldEluZGV4RnJvbUlkKGVsVGFyZ2V0LmlkKTtcblxuICAgICAgICB0aGlzLl9oaWRlVG9vbHRpcChlbFRhcmdldCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGF0LmZpcmUoJ2hpZGVBbmltYXRpb24nLCB7XG4gICAgICAgICAgICAgICAgZ3JvdXBJbmRleDogaW5kZXhlc1swXSxcbiAgICAgICAgICAgICAgICBpbmRleDogaW5kZXhlc1sxXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxjdWxhdGUgdG9vbHRpcCBwb3NpdGlvbiBhYm91dCBub3QgYmFyIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHt7Ym91bmQ6IG9iamVjdH19IHBhcmFtcy5kYXRhIGdyYXBoIGluZm9ybWF0aW9uXG4gICAgICogICAgICBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IHBhcmFtcy5kaW1lbnNpb24gdG9vbHRpcCBkaW1lbnNpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMucG9zaXRpb25PcHRpb24gcG9zaXRpb24gb3B0aW9uIChleDogJ2xlZnQgdG9wJylcbiAgICAgKiBAcmV0dXJucyB7e3RvcDogbnVtYmVyLCBsZWZ0OiBudW1iZXJ9fSBwb3NpdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NhbGN1bGF0ZVRvb2x0aXBQb3NpdGlvbkFib3V0Tm90QmFyQ2hhcnQ6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgYm91bmQgPSBwYXJhbXMuYm91bmQsXG4gICAgICAgICAgICBhZGRQb3NpdGlvbiA9IHBhcmFtcy5hZGRQb3NpdGlvbixcbiAgICAgICAgICAgIG1pbnVzV2lkdGggPSBwYXJhbXMuZGltZW5zaW9uLndpZHRoIC0gKGJvdW5kLndpZHRoIHx8IDApLFxuICAgICAgICAgICAgbGluZUdhcCA9IGJvdW5kLndpZHRoID8gMCA6IFRPT0xUSVBfR0FQLFxuICAgICAgICAgICAgcG9zaXRpb25PcHRpb24gPSBwYXJhbXMucG9zaXRpb25PcHRpb24gfHwgJycsXG4gICAgICAgICAgICB0b29sdGlwSGVpZ2h0ID0gcGFyYW1zLmRpbWVuc2lvbi5oZWlnaHQsXG4gICAgICAgICAgICByZXN1bHQgPSB7fTtcbiAgICAgICAgcmVzdWx0LmxlZnQgPSBib3VuZC5sZWZ0ICsgKEhJRERFTl9XSURUSCAqIDIpICsgYWRkUG9zaXRpb24ubGVmdDtcbiAgICAgICAgcmVzdWx0LnRvcCA9IGJvdW5kLnRvcCAtIHRvb2x0aXBIZWlnaHQgKyBhZGRQb3NpdGlvbi50b3A7XG5cbiAgICAgICAgaWYgKHBvc2l0aW9uT3B0aW9uLmluZGV4T2YoJ2xlZnQnKSA+IC0xKSB7XG4gICAgICAgICAgICByZXN1bHQubGVmdCAtPSBtaW51c1dpZHRoICsgbGluZUdhcDtcbiAgICAgICAgfSBlbHNlIGlmIChwb3NpdGlvbk9wdGlvbi5pbmRleE9mKCdjZW50ZXInKSA+IC0xKSB7XG4gICAgICAgICAgICByZXN1bHQubGVmdCAtPSBtaW51c1dpZHRoIC8gMjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdC5sZWZ0ICs9IGxpbmVHYXA7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocG9zaXRpb25PcHRpb24uaW5kZXhPZignYm90dG9tJykgPiAtMSkge1xuICAgICAgICAgICAgcmVzdWx0LnRvcCArPSB0b29sdGlwSGVpZ2h0IC0gSElEREVOX1dJRFRIICsgbGluZUdhcDtcbiAgICAgICAgfSBlbHNlIGlmIChwb3NpdGlvbk9wdGlvbi5pbmRleE9mKCdtaWRkbGUnKSA+IC0xKSB7XG4gICAgICAgICAgICByZXN1bHQudG9wICs9IHRvb2x0aXBIZWlnaHQgLyAyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0LnRvcCAtPSBUT09MVElQX0dBUCArIEhJRERFTl9XSURUSDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGN1bGF0ZSB0b29sdGlwIHBvc2l0aW9uIGFib3V0IGJhciBjaGFydC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7e2JvdW5kOiBvYmplY3R9fSBwYXJhbXMuZGF0YSBncmFwaCBpbmZvcm1hdGlvblxuICAgICAqICAgICAgQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBwYXJhbXMuZGltZW5zaW9uIHRvb2x0aXAgZGltZW5zaW9uXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLnBvc2l0aW9uT3B0aW9uIHBvc2l0aW9uIG9wdGlvbiAoZXg6ICdsZWZ0IHRvcCcpXG4gICAgICogQHJldHVybnMge3t0b3A6IG51bWJlciwgbGVmdDogbnVtYmVyfX0gcG9zaXRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jYWxjdWxhdGVUb29sdGlwUG9zaXRpb25BYm91dEJhckNoYXJ0OiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGJvdW5kID0gcGFyYW1zLmJvdW5kLFxuICAgICAgICAgICAgYWRkUG9zaXRpb24gPSBwYXJhbXMuYWRkUG9zaXRpb24sXG4gICAgICAgICAgICBtaW51c0hlaWdodCA9IHBhcmFtcy5kaW1lbnNpb24uaGVpZ2h0IC0gKGJvdW5kLmhlaWdodCB8fCAwKSxcbiAgICAgICAgICAgIHBvc2l0aW9uT3B0aW9uID0gcGFyYW1zLnBvc2l0aW9uT3B0aW9uIHx8ICcnLFxuICAgICAgICAgICAgdG9vbHRpcFdpZHRoID0gcGFyYW1zLmRpbWVuc2lvbi53aWR0aCxcbiAgICAgICAgICAgIHJlc3VsdCA9IHt9O1xuXG4gICAgICAgIHJlc3VsdC5sZWZ0ID0gYm91bmQubGVmdCArIGJvdW5kLndpZHRoICsgYWRkUG9zaXRpb24ubGVmdDtcbiAgICAgICAgcmVzdWx0LnRvcCA9IGJvdW5kLnRvcCArIGFkZFBvc2l0aW9uLnRvcDtcblxuICAgICAgICAvLyBUT0RPIDogcG9zaXRpb25PcHRpb25z7J2EIOqwneyytOuhnCDrp4zrk6TslrTshJwg6rKA7IKs7ZWY64+E66GdIOuzgOqyve2VmOq4sCBleCkgcG9zaXRpb25PcHRpb24ubGVmdCA9IHRydWVcbiAgICAgICAgaWYgKHBvc2l0aW9uT3B0aW9uLmluZGV4T2YoJ2xlZnQnKSA+IC0xKSB7XG4gICAgICAgICAgICByZXN1bHQubGVmdCAtPSB0b29sdGlwV2lkdGg7XG4gICAgICAgIH0gZWxzZSBpZiAocG9zaXRpb25PcHRpb24uaW5kZXhPZignY2VudGVyJykgPiAtMSkge1xuICAgICAgICAgICAgcmVzdWx0LmxlZnQgLT0gdG9vbHRpcFdpZHRoIC8gMjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdC5sZWZ0ICs9IFRPT0xUSVBfR0FQO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBvc2l0aW9uT3B0aW9uLmluZGV4T2YoJ3RvcCcpID4gLTEpIHtcbiAgICAgICAgICAgIHJlc3VsdC50b3AgLT0gbWludXNIZWlnaHQgKyBISURERU5fV0lEVEg7XG4gICAgICAgIH0gZWxzZSBpZiAocG9zaXRpb25PcHRpb24uaW5kZXhPZignbWlkZGxlJykgPiAtMSkge1xuICAgICAgICAgICAgcmVzdWx0LnRvcCAtPSBtaW51c0hlaWdodCAvIDI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQudG9wIC09IEhJRERFTl9XSURUSCAqIDI7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxjdWxhdGUgdG9vbHRpcCBwb3NpdGlvbi5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gcGFyYW1zLmJvdW5kIGdyYXBoIGJvdW5kXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLmNoYXJ0VHlwZSBjaGFydCB0eXBlXG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5hbGxvd05lZ2F0aXZlVG9vbHRpcCB3aGV0aGVyIGFsbG93IG5lZ2F0aXZlIHRvb2x0aXAgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IHBhcmFtcy5kaW1lbnNpb24gdG9vbHRpcCBkaW1lbnNpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMucG9zaXRpb25PcHRpb24gcG9zaXRpb24gb3B0aW9uIChleDogJ2xlZnQgdG9wJylcbiAgICAgKiBAcmV0dXJucyB7e3RvcDogbnVtYmVyLCBsZWZ0OiBudW1iZXJ9fSBwb3NpdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NhbGN1bGF0ZVRvb2x0aXBQb3NpdGlvbjogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSB7fSxcbiAgICAgICAgICAgIHNpemVUeXBlLCBwb3NpdGlvblR5cGUsIGFkZFBhZGRpbmc7XG4gICAgICAgIGlmIChwYXJhbXMuY2hhcnRUeXBlID09PSBjaGFydENvbnN0LkNIQVJUX1RZUEVfQkFSKSB7XG4gICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9jYWxjdWxhdGVUb29sdGlwUG9zaXRpb25BYm91dEJhckNoYXJ0KHBhcmFtcyk7XG4gICAgICAgICAgICBzaXplVHlwZSA9ICd3aWR0aCc7XG4gICAgICAgICAgICBwb3NpdGlvblR5cGUgPSAnbGVmdCc7XG4gICAgICAgICAgICBhZGRQYWRkaW5nID0gMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuX2NhbGN1bGF0ZVRvb2x0aXBQb3NpdGlvbkFib3V0Tm90QmFyQ2hhcnQocGFyYW1zKTtcbiAgICAgICAgICAgIHNpemVUeXBlID0gJ2hlaWdodCc7XG4gICAgICAgICAgICBwb3NpdGlvblR5cGUgPSAndG9wJztcbiAgICAgICAgICAgIGFkZFBhZGRpbmcgPSAtMTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYXJhbXMuYWxsb3dOZWdhdGl2ZVRvb2x0aXApIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuX21vdmVUb1N5bW1ldHJ5KHJlc3VsdCwge1xuICAgICAgICAgICAgICAgIGJvdW5kOiBwYXJhbXMuYm91bmQsXG4gICAgICAgICAgICAgICAgaWQ6IHBhcmFtcy5pZCxcbiAgICAgICAgICAgICAgICBkaW1lbnNpb246IHBhcmFtcy5kaW1lbnNpb24sXG4gICAgICAgICAgICAgICAgc2l6ZVR5cGU6IHNpemVUeXBlLFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogcG9zaXRpb25UeXBlLFxuICAgICAgICAgICAgICAgIGFkZFBhZGRpbmc6IGFkZFBhZGRpbmdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB2YWx1ZSBieSBpZC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgdG9vbHRpcCBpZFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IHJlc3VsdCB2YWx1ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFZhbHVlQnlJZDogZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgdmFyIGluZGV4ZXMgPSB0aGlzLl9nZXRJbmRleEZyb21JZChpZCksXG4gICAgICAgICAgICB2YWx1ZSA9IHRoaXMudmFsdWVzW2luZGV4ZXNbMF1dW2luZGV4ZXNbMV1dO1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1vdmUgdG8gc3ltbWV0cnkuXG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IHBvc2l0aW9uIHRvb2x0aXAgcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gcGFyYW1zLmJvdW5kIGdyYXBoIGJvdW5kXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLmlkIHRvb2x0aXAgaWRcbiAgICAgKiAgICAgIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gcGFyYW1zLmRpbWVuc2lvbiB0b29sdGlwIGRpbWVuc2lvblxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5zaXplVHlwZSBzaXplIHR5cGUgKHdpZHRoIG9yIGhlaWdodClcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMucG9zaXRpb25UeXBlIHBvc2l0aW9uIHR5cGUgKGxlZnQgb3IgdG9wKVxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5hZGRQYWRkaW5nIGFkZCBwYWRkaW5nXG4gICAgICogQHJldHVybnMge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gbW92ZWQgcG9zaXRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tb3ZlVG9TeW1tZXRyeTogZnVuY3Rpb24ocG9zaXRpb24sIHBhcmFtcykge1xuICAgICAgICB2YXIgYm91bmQgPSBwYXJhbXMuYm91bmQsXG4gICAgICAgICAgICBzaXplVHlwZSA9IHBhcmFtcy5zaXplVHlwZSxcbiAgICAgICAgICAgIHBvc2l0aW9uVHlwZSA9IHBhcmFtcy5wb3NpdGlvblR5cGUsXG4gICAgICAgICAgICB2YWx1ZSA9IHRoaXMuX2dldFZhbHVlQnlJZChwYXJhbXMuaWQpLFxuICAgICAgICAgICAgY2VudGVyO1xuXG4gICAgICAgIGlmICh2YWx1ZSA8IDApIHtcbiAgICAgICAgICAgIGNlbnRlciA9IGJvdW5kW3Bvc2l0aW9uVHlwZV0gKyAoYm91bmRbc2l6ZVR5cGVdIC8gMikgKyAocGFyYW1zLmFkZFBhZGRpbmcgfHwgMCk7XG4gICAgICAgICAgICBwb3NpdGlvbltwb3NpdGlvblR5cGVdID0gcG9zaXRpb25bcG9zaXRpb25UeXBlXSAtIChwb3NpdGlvbltwb3NpdGlvblR5cGVdIC0gY2VudGVyKSAqIDIgLSBwYXJhbXMuZGltZW5zaW9uW3NpemVUeXBlXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwb3NpdGlvbjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb25TaG93IGlzIGNhbGxiYWNrIG9mIGN1c3RvbSBldmVudCBzaG93VG9vbHRpcCBmb3IgU2VyaWVzVmlldy5cbiAgICAgKiBAcGFyYW0ge3tpZDogc3RyaW5nLCBib3VuZDogb2JqZWN0fX0gcGFyYW1zIHRvb2x0aXAgZGF0YVxuICAgICAqL1xuICAgIG9uU2hvdzogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBlbFRvb2x0aXAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwYXJhbXMuaWQpLFxuICAgICAgICAgICAgYWRkUG9zaXRpb24gPSBuZS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgbGVmdDogMCxcbiAgICAgICAgICAgICAgICB0b3A6IDBcbiAgICAgICAgICAgIH0sIHRoaXMub3B0aW9ucy5hZGRQb3NpdGlvbiksXG4gICAgICAgICAgICBwb3NpdGlvbk9wdGlvbiA9IHRoaXMub3B0aW9ucy5wb3NpdGlvbiB8fCAnJyxcbiAgICAgICAgICAgIHBvc2l0aW9uO1xuXG4gICAgICAgIGlmICh0aGlzLnNob3dlZElkKSB7XG4gICAgICAgICAgICBkb20ucmVtb3ZlQ2xhc3MoZWxUb29sdGlwLCAnc2hvdycpO1xuICAgICAgICAgICAgdGhpcy5fZmlyZUhpZGVBbmltYXRpb24odGhpcy5zaG93ZWRJZCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNob3dlZElkID0gcGFyYW1zLmlkO1xuICAgICAgICBkb20uYWRkQ2xhc3MoZWxUb29sdGlwLCAnc2hvdycpO1xuXG4gICAgICAgIHBvc2l0aW9uID0gdGhpcy5fY2FsY3VsYXRlVG9vbHRpcFBvc2l0aW9uKG5lLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgIGRpbWVuc2lvbjoge1xuICAgICAgICAgICAgICAgIHdpZHRoOiBlbFRvb2x0aXAub2Zmc2V0V2lkdGgsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBlbFRvb2x0aXAub2Zmc2V0SGVpZ2h0XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYWRkUG9zaXRpb246IGFkZFBvc2l0aW9uLFxuICAgICAgICAgICAgcG9zaXRpb25PcHRpb246IHBvc2l0aW9uT3B0aW9uIHx8ICcnXG4gICAgICAgIH0sIHBhcmFtcykpO1xuXG4gICAgICAgIGVsVG9vbHRpcC5zdHlsZS5jc3NUZXh0ID0gW1xuICAgICAgICAgICAgcmVuZGVyVXRpbC5jb25jYXRTdHIoJ2xlZnQ6JywgcG9zaXRpb24ubGVmdCwgJ3B4JyksXG4gICAgICAgICAgICByZW5kZXJVdGlsLmNvbmNhdFN0cigndG9wOicsIHBvc2l0aW9uLnRvcCwgJ3B4JylcbiAgICAgICAgXS5qb2luKCc7Jyk7XG5cbiAgICAgICAgdGhpcy5fZmlyZVNob3dBbmltYXRpb24ocGFyYW1zLmlkKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb25IaWRlIGlzIGNhbGxiYWNrIG9mIGN1c3RvbSBldmVudCBoaWRlVG9vbHRpcCBmb3IgU2VyaWVzVmlld1xuICAgICAqIEBwYXJhbSB7e2lkOiBzdHJpbmd9fSBkYXRhIHRvb2x0aXAgZGF0YVxuICAgICAqL1xuICAgIG9uSGlkZTogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgZWxUb29sdGlwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZGF0YS5pZCksXG4gICAgICAgICAgICB0aGF0ID0gdGhpcztcblxuICAgICAgICB0aGlzLl9oaWRlVG9vbHRpcChlbFRvb2x0aXAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGluZGV4ZXMgPSB0aGF0Ll9nZXRJbmRleEZyb21JZChkYXRhLmlkKTtcblxuICAgICAgICAgICAgdGhhdC5maXJlKCdoaWRlQW5pbWF0aW9uJywge1xuICAgICAgICAgICAgICAgIGdyb3VwSW5kZXg6IGluZGV4ZXNbMF0sXG4gICAgICAgICAgICAgICAgaW5kZXg6IGluZGV4ZXNbMV1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBkYXRhID0gbnVsbDtcbiAgICAgICAgICAgIGVsVG9vbHRpcCA9IG51bGw7XG4gICAgICAgICAgICB0aGF0ID0gbnVsbDtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhpZGUgdG9vbHRpcC5cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbFRvb2x0aXAgdG9vbHRpcCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgY2FsbGJhY2tcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9oaWRlVG9vbHRpcDogZnVuY3Rpb24oZWxUb29sdGlwLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgIGRlbGV0ZSB0aGlzLnNob3dlZElkO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHRoYXQuc2hvd2VkSWQgPT09IGVsVG9vbHRpcC5pZCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZG9tLnJlbW92ZUNsYXNzKGVsVG9vbHRpcCwgJ3Nob3cnKTtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoYXQgPSBudWxsO1xuICAgICAgICB9LCBISURFX0RFTEFZKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGV2ZW50XG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKi9cbiAgICBhdHRhY2hFdmVudDogZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgZXZlbnQuYmluZEV2ZW50KCdtb3VzZW92ZXInLCBlbCwgbmUudXRpbC5iaW5kKHRoaXMub25Nb3VzZW92ZXIsIHRoaXMpKTtcbiAgICAgICAgZXZlbnQuYmluZEV2ZW50KCdtb3VzZW91dCcsIGVsLCBuZS51dGlsLmJpbmQodGhpcy5vbk1vdXNlb3V0LCB0aGlzKSk7XG4gICAgfVxufSk7XG5cbm5lLnV0aWwuQ3VzdG9tRXZlbnRzLm1peGluKFRvb2x0aXApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRvb2x0aXA7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgVGhpcyBpcyB0ZW1wbGF0ZXMgb2YgdG9vbHRpcC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbnZhciB0ZW1wbGF0ZU1ha2VyID0gcmVxdWlyZSgnLi4vaGVscGVycy90ZW1wbGF0ZU1ha2VyLmpzJyk7XG5cbnZhciB0YWdzID0ge1xuICAgIEhUTUxfVE9PTFRJUDogJzxkaXYgY2xhc3M9XCJuZS1jaGFydC10b29sdGlwXCIgaWQ9XCJ7eyBpZCB9fVwiPnt7IGh0bWwgfX08L2Rpdj4nLFxuICAgIEhUTUxfREVGQVVMVF9URU1QTEFURTogJzxkaXYgY2xhc3M9XCJuZS1jaGFydC1kZWZhdWx0LXRvb2x0aXBcIj4nICtcbiAgICAgICAgJzxkaXY+e3sgbGFiZWwgfX08L2Rpdj4nICtcbiAgICAgICAgJzxkaXY+JyArXG4gICAgICAgICAgICAnPHNwYW4+e3sgbGVnZW5kTGFiZWwgfX08L3NwYW4+OicgK1xuICAgICAgICAgICAgJyZuYnNwOzxzcGFuPnt7IHZhbHVlIH19PC9zcGFuPicgK1xuICAgICAgICAgICAgJzxzcGFuPnt7IHN1ZmZpeCB9fTwvc3Bhbj4nICtcbiAgICAgICAgJzwvZGl2PicgK1xuICAgICc8L2Rpdj4nXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICB0cGxUb29sdGlwOiB0ZW1wbGF0ZU1ha2VyLnRlbXBsYXRlKHRhZ3MuSFRNTF9UT09MVElQKSxcbiAgICB0cGxEZWZhdWx0VGVtcGxhdGU6IHRlbXBsYXRlTWFrZXIudGVtcGxhdGUodGFncy5IVE1MX0RFRkFVTFRfVEVNUExBVEUpXG59O1xuIl19
