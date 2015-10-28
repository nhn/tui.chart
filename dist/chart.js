/**
 * @fileoverview tui.chart
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @version 1.2.0
 * @license MIT
 * @link https://github.com/nhnent/fe.tui.chart
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * @fileoverview  Axis component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var dom = require('../helpers/domHandler'),
    chartConst = require('../const'),
    calculator = require('../helpers/calculator'),
    renderUtil = require('../helpers/renderUtil'),
    axisTemplate = require('./axisTemplate');

var Axis = tui.util.defineClass(/** @lends Axis.prototype */ {
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
        tui.util.extend(this, params);
        /**
         * Axis view className
         */
        this.className = 'tui-chart-axis-area';
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
            elLabelArea = this._renderLabelArea(size, dimension.width, bound.degree),
            elTickArea;

        if (!this.aligned || !isVertical) {
            elTickArea = this._renderTickArea(size);
        }
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
        var elTitleArea = renderUtil.renderTitle(params.title, params.theme, 'tui-chart-title-area');

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
            elTickArea = dom.create('DIV', 'tui-chart-tick-area'),
            posType = data.isVertical ? 'bottom' : 'left',
            borderColorType = data.isVertical ? (data.isPositionRight ? 'borderLeftColor' : 'borderRightColor') : 'borderTopColor',
            template = axisTemplate.tplAxisTick,
            ticksHtml = tui.util.map(positions, function(position, index) {
                var cssText;
                if (data.labels[index] === chartConst.EMPTY_AXIS_LABEL) {
                    return '';
                }
                cssText = [
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
     * To make cssText of vertical label.
     * @param {number} axisWidth axis width
     * @param {number} titleAreaWidth title area width
     * @returns {string} cssText
     * @private
     */
    _makeVerticalLabelCssText: function(axisWidth, titleAreaWidth) {
        return ';width:' + (axisWidth - titleAreaWidth + chartConst.V_LABEL_RIGHT_PADDING) + 'px';
    },

    /**
     * Render label area.
     * @param {number} size label area size
     * @param {number} axisWidth axis area width
     * @param {number} degree rotation degree
     * @returns {HTMLElement} label area element
     * @private
     */
    _renderLabelArea: function(size, axisWidth, degree) {
        var data = this.data,
            tickPixelPositions = calculator.makeTickPixelPositions(size, data.tickCount),
            labelSize = tickPixelPositions[1] - tickPixelPositions[0],
            posType = 'left',
            cssTexts = this._makeLabelCssTexts({
                isVertical: data.isVertical,
                isLabelAxis: data.isLabelAxis,
                labelSize: labelSize
            }),
            elLabelArea = dom.create('DIV', 'tui-chart-label-area'),
            areaCssText = renderUtil.makeFontCssText(this.theme.label),
            labelsHtml, titleAreaWidth;

        if (data.isVertical) {
            posType = data.isLabelAxis ? 'top' : 'bottom';
            titleAreaWidth = this._getRenderedTitleHeight() + chartConst.TITLE_AREA_WIDTH_PADDING;
            areaCssText += this._makeVerticalLabelCssText(axisWidth, titleAreaWidth);
        }

        tickPixelPositions.length = data.labels.length;

        labelsHtml = this._makeLabelsHtml({
            positions: tickPixelPositions,
            labels: data.labels,
            posType: posType,
            cssTexts: cssTexts,
            labelSize: labelSize,
            degree: degree,
            theme: this.theme.label
        });

        elLabelArea.innerHTML = labelsHtml;
        elLabelArea.style.cssText = areaCssText;

        this._changeLabelAreaPosition({
            elLabelArea: elLabelArea,
            isVertical: data.isVertical,
            isLabelAxis: data.isLabelAxis,
            theme: this.theme.label,
            labelSize: labelSize,
            aligned: data.aligned
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
     * To calculate rotation moving position.
     * @param {object} params parameters
     *      @param {number} params.degree rotation degree
     *      @param {number} params.labelHeight label height
     *      @param {number} params.left normal left
     *      @param {number} params.moveLeft move left
     *      @param {number} params.top top
     * @returns {{top:number, left: number}} position
     * @private
     */
    _calculateRotationMovingPosition: function(params) {
        var moveLeft = params.moveLeft;
        if (params.degree === chartConst.ANGLE_85) {
            moveLeft += calculator.calculateAdjacent(chartConst.ANGLE_90 - params.degree, params.labelHeight / 2);
        }

        return {
            top: params.top,
            left: params.left - moveLeft
        };
    },

    /**
     * To calculate rotation moving position for ie8.
     * @param {object} params parameters
     *      @param {number} params.degree rotation degree
     *      @param {number} params.labelWidth label width
     *      @param {number} params.labelHeight label height
     *      @param {number} params.left normal left
     *      @param {(string | number)} params.label label
     *      @param {object} theme label theme
     * @returns {{top:number, left: number}} position
     * @private
     */
    _calculateRotationMovingPositionForIE8: function(params) {
        var labelWidth = renderUtil.getRenderedLabelWidth(params.label, params.theme),
            smallAreaWidth = calculator.calculateAdjacent(chartConst.ANGLE_90 - params.degree, params.labelHeight / 2),
            newLabelWidth = (calculator.calculateAdjacent(params.degree, labelWidth / 2) + smallAreaWidth) * 2,
            collectLeft = labelWidth - newLabelWidth,
            moveLeft = (params.labelWidth / 2) - (smallAreaWidth * 2);

        if (params.degree === chartConst.ANGLE_85) {
            moveLeft += smallAreaWidth;
        }

        return {
            top: chartConst.XAXIS_LABEL_TOP_MARGIN,
            left: params.left + collectLeft - moveLeft
        };
    },

    /**
     * To make cssText for rotation moving.
     * @param {object} params parameters
     *      @param {number} params.degree rotation degree
     *      @param {number} params.labelWidth label width
     *      @param {number} params.labelHeight label height
     *      @param {number} params.left normal left
     *      @param {number} params.moveLeft move left
     *      @param {number} params.top top
     *      @param {(string | number)} params.label label
     *      @param {object} theme label theme
     * @returns {string} cssText
     * @private
     */
    _makeCssTextForRotationMoving: function(params) {
        var position;
        if (renderUtil.isIE8()) {
            position = this._calculateRotationMovingPositionForIE8(params);
        } else {
            position = this._calculateRotationMovingPosition(params);
        }
        return renderUtil.concatStr('left:', position.left, 'px', ';top:', position.top, 'px');
    },

    /**
     * To make html of rotation labels.
     * @param {object} params parameters
     *      @param {array.<object>} params.positions label position array
     *      @param {string[]} params.labels label array
     *      @param {string} params.posType position type (left or bottom)
     *      @param {string[]} params.cssTexts css array
     * @returns {string} labels html
     * @private
     */
    _makeRotationLabelsHtml: function(params) {
        var template = axisTemplate.tplAxisLabel,
            labelHeight = renderUtil.getRenderedLabelHeight(params.labels[0], params.theme),
            labelCssText = params.cssTexts.length ? params.cssTexts.join(';') + ';' : '',
            addClass = ' rotation' + params.degree,
            halfWidth = params.labelSize / 2,
            moveLeft = calculator.calculateAdjacent(params.degree, halfWidth),
            top = calculator.calculateOpposite(params.degree, halfWidth) + chartConst.XAXIS_LABEL_TOP_MARGIN,
            labelsHtml = tui.util.map(params.positions, function(position, index) {
                var label = params.labels[index],
                    rotationCssText = this._makeCssTextForRotationMoving({
                        degree: params.degree,
                        labelHeight: labelHeight,
                        labelWidth: params.labelSize,
                        top: top,
                        left: position,
                        moveLeft: moveLeft,
                        label: label,
                        theme: params.theme
                    });

                return template({
                    addClass: addClass,
                    cssText: labelCssText + rotationCssText,
                    label: label
                });
            }, this).join('');

        return labelsHtml;
    },

    /**
     * To make html of normal labels.
     * @param {object} params parameters
     *      @param {array.<object>} params.positions label position array
     *      @param {string[]} params.labels label array
     *      @param {string} params.posType position type (left or bottom)
     *      @param {string[]} params.cssTexts css array
     * @returns {string} labels html
     * @private
     */
    _makeNormalLabelsHtml: function(params) {
        var template = axisTemplate.tplAxisLabel,
            labelCssText = params.cssTexts.length ? params.cssTexts.join(';') + ';' : '',
            labelsHtml = tui.util.map(params.positions, function(position, index) {
                var addCssText = renderUtil.concatStr(params.posType, ':', position, 'px');
                return template({
                    addClass: '',
                    cssText: labelCssText + addCssText,
                    label: params.labels[index]
                });
            }, this).join('');
        return labelsHtml;
    },

    /**
     * To make html of labels.
     * @param {object} params parameters
     *      @param {array.<object>} params.positions label position array
     *      @param {string[]} params.labels label array
     *      @param {string} params.posType position type (left or bottom)
     *      @param {string[]} params.cssTexts css array
     * @returns {string} labels html
     * @private
     */
    _makeLabelsHtml: function(params) {
        var labelsHtml;
        if (params.degree) {
            labelsHtml = this._makeRotationLabelsHtml(params);
        } else {
            labelsHtml = this._makeNormalLabelsHtml(params);
        }

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

        if (params.isLabelAxis && !params.aligned) {
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

},{"../const":15,"../helpers/calculator":24,"../helpers/domHandler":26,"../helpers/renderUtil":28,"./axisTemplate":2}],2:[function(require,module,exports){
/**
 * @fileoverview This is templates or axis view.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

var templateMaker = require('../helpers/templateMaker');

var tags = {
    HTML_AXIS_TICK: '<div class="tui-chart-tick" style="{{ cssText }}"></div>',
    HTML_AXIS_LABEL: '<div class="tui-chart-label{{ addClass }}" style="{{ cssText }}"><span>{{ label }}</span></div>'
};

module.exports = {
    tplAxisTick: templateMaker.template(tags.HTML_AXIS_TICK),
    tplAxisLabel: templateMaker.template(tags.HTML_AXIS_LABEL)
};

},{"../helpers/templateMaker":30}],3:[function(require,module,exports){
/**
 * @fileoverview chart.js is entry point of Toast UI Chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */
'use strict';

var chartConst = require('./const'),
    chartFactory = require('./factories/chartFactory'),
    pluginFactory = require('./factories/pluginFactory'),
    themeFactory = require('./factories/themeFactory');

var _createChart;

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
 *          @param {number} options.yAxis.labelInterval label interval of vertical axis
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
 *          @param {boolean} options.tooltip.grouped whether group tooltip or not
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
 *          @param {number} options.xAxis.labelInterval label interval of horizontal axis
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
 *          @param {boolean} options.tooltip.grouped whether group tooltip or not
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
 *          @param {number} options.xAxis.labelInterval label interval of horizontal axis
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
 *          @param {boolean} options.tooltip.grouped whether group tooltip or not
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
 *          @param {number} options.xAxis.labelInterval label interval of horizontal axis
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
 *          @param {boolean} options.tooltip.grouped whether group tooltip or not
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
 *          @param {number} options.xAxis.labelInterval label interval of horizontal axis
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
 *          @param {boolean} options.tooltip.grouped whether group tooltip or not
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
 * tui.chart.pieChart(container, data, options);
 */
tui.chart.pieChart = function(container, data, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_PIE;
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
tui.chart.registerTheme = function(themeName, theme) {
    themeFactory.register(themeName, theme);
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

},{"./code-snippet-util":14,"./const":15,"./factories/chartFactory":19,"./factories/pluginFactory":20,"./factories/themeFactory":21,"./registerCharts":42,"./registerThemes":43}],4:[function(require,module,exports){
/**
 * @fileoverview Area chart
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase'),
    lineTypeMixer = require('./lineTypeMixer'),
    axisTypeMixer = require('./axisTypeMixer'),
    verticalTypeMixer = require('./verticalTypeMixer'),
    Series = require('../series/areaChartSeries');

var AreaChart = tui.util.defineClass(ChartBase, /** @lends LineChart.prototype */ {
    /**
     * className
     * @type {string}
     */
    className: 'tui-area-chart',

    /**
     * Series class
     * @type {function}
     */
    Series: Series,

    /**
     * Area chart.
     * @constructs AreaChart
     * @extends ChartBase
     * @mixes axisTypeMixer
     * @mixes verticalTypeMixer
     * @mixes lineTypeMixer
     */
    init: function() {
        this.lineTypeInit.apply(this, arguments);
    }
});

lineTypeMixer.mixin(AreaChart);
axisTypeMixer.mixin(AreaChart);
verticalTypeMixer.mixin(AreaChart);

module.exports = AreaChart;

},{"../series/areaChartSeries":44,"./axisTypeMixer":5,"./chartBase":7,"./lineTypeMixer":11,"./verticalTypeMixer":13}],5:[function(require,module,exports){
/**
 * @fileoverview axisTypeMixer is mixer of axis type chart(bar, column, line, area).
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Axis = require('../axes/axis'),
    Plot = require('../plots/plot'),
    Legend = require('../legends/legend'),
    Tooltip = require('../tooltips/tooltip'),
    GroupTooltip = require('../tooltips/groupTooltip');

/**
 * axisTypeMixer is base class of axis type chart(bar, column, line, area).
 * @mixin
 */
var axisTypeMixer = {
    /**
     * Add axis components
     * @param {object} params parameters
     *      @param {object} params.covertData converted data
     *      @param {object} params.axes axes data
     *      @param {object} params.plotData plot data
     *      @param {function} params.Series series class
     */
    addAxisComponents: function(params) {
        var convertedData = params.convertedData,
            options = this.options,
            aligned = !!params.aligned;

        if (params.plotData) {
            this.addComponent('plot', Plot, params.plotData);
        }

        tui.util.forEach(params.axes, function(data, name) {
            this.addComponent(name, Axis, {
                data: data,
                aligned: aligned
            });
        }, this);

        if (convertedData.joinLegendLabels) {
            this.addComponent('legend', Legend, {
                joinLegendLabels: convertedData.joinLegendLabels,
                legendLabels: convertedData.legendLabels,
                chartType: params.chartType
            });
        }

        this.addComponent('series', params.Series, tui.util.extend({
            libType: options.libType,
            chartType: options.chartType,
            parentChartType: options.parentChartType,
            aligned: aligned,
            isSubChart: this.isSubChart,
            isGroupedTooltip: this.isGroupedTooltip
        }, params.seriesData));

        if (this.isGroupedTooltip) {
            this.addComponent('tooltip', GroupTooltip, {
                labels: convertedData.labels,
                joinFormattedValues: convertedData.joinFormattedValues,
                joinLegendLabels: convertedData.joinLegendLabels,
                chartId: this.chartId
            });
        } else {
            this.addComponent('tooltip', Tooltip, {
                values: convertedData.values,
                formattedValues: convertedData.formattedValues,
                labels: convertedData.labels,
                legendLabels: convertedData.legendLabels,
                chartId: this.chartId,
                isVertical: this.isVertical
            });
        }
    },

    /**
     * To make plot data.
     * @param {object} plotData initialized plot data
     * @param {object} axesData axes data
     * @returns {{vTickCount: number, hTickCount: number}} plot data
     */
    makePlotData: function(plotData, axesData) {
        if (tui.util.isUndefined(plotData)) {
            plotData = {
                vTickCount: axesData.yAxis.validTickCount,
                hTickCount: axesData.xAxis.validTickCount
            };
        }
        return plotData;
    },

    /**
     * Mix in.
     * @param {function} func target function
     * @ignore
     */
    mixin: function(func) {
        tui.util.extend(func.prototype, this);
    }
};

module.exports = axisTypeMixer;

},{"../axes/axis":1,"../legends/legend":31,"../plots/plot":33,"../tooltips/groupTooltip":54,"../tooltips/tooltip":55}],6:[function(require,module,exports){
/**
 * @fileoverview Bar chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase'),
    axisTypeMixer = require('./axisTypeMixer'),
    axisDataMaker = require('../helpers/axisDataMaker'),
    Series = require('../series/barChartSeries');

var BarChart = tui.util.defineClass(ChartBase, /** @lends BarChart.prototype */ {
    /**
     * Bar chart.
     * @constructs BarChart
     * @extends ChartBase
     * @mixes axisTypeMixer
     * @param {array.<array>} userData chart data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(userData, theme, options) {
        var baseData = this.makeBaseData(userData, theme, options, {
                hasAxes: true
            }),
            convertedData = baseData.convertedData,
            bounds = baseData.bounds,
            axesData = this._makeAxesData(convertedData, bounds, options);

        /**
         * className
         * @type {string}
         */
        this.className = 'tui-bar-chart';

        ChartBase.call(this, {
            bounds: bounds,
            axesData: axesData,
            theme: theme,
            options: options
        });

        this._addComponents(convertedData, axesData, options);
    },

    /**
     * To make axes data
     * @param {object} convertedData converted data
     * @param {object} bounds chart bounds
     * @param {object} options chart options
     * @returns {object} axes data
     * @private
     */
    _makeAxesData: function(convertedData, bounds, options) {
        var axesData = {
            yAxis: axisDataMaker.makeLabelAxisData({
                labels: convertedData.labels,
                isVertical: true
            }),
            xAxis: axisDataMaker.makeValueAxisData({
                values: convertedData.values,
                seriesDimension: bounds.series.dimension,
                stacked: options.series && options.series.stacked || '',
                chartType: options.chartType,
                formatFunctions: convertedData.formatFunctions,
                options: options.xAxis
            })
        };
        return axesData;
    },

    /**
     * Add components
     * @param {object} convertedData converted data
     * @param {object} axesData axes data
     * @param {object} options chart options
     * @private
     */
    _addComponents: function(convertedData, axesData, options) {
        var plotData, seriesData;

        plotData = this.makePlotData(convertedData.plotData, axesData);
        seriesData = {
            allowNegativeTooltip: true,
            data: {
                values: convertedData.values,
                formattedValues: convertedData.formattedValues,
                formatFunctions: convertedData.formatFunctions,
                scale: axesData.xAxis.scale
            }
        };
        this.addAxisComponents({
            convertedData: convertedData,
            axes: axesData,
            plotData: plotData,
            chartType: options.chartType,
            Series: Series,
            seriesData: seriesData
        });
    }
});

axisTypeMixer.mixin(BarChart);

module.exports = BarChart;

},{"../helpers/axisDataMaker":22,"../series/barChartSeries":45,"./axisTypeMixer":5,"./chartBase":7}],7:[function(require,module,exports){
/**
 * @fileoverview ChartBase
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    dom = require('../helpers/domHandler'),
    renderUtil = require('../helpers/renderUtil'),
    dataConverter = require('../helpers/dataConverter'),
    boundsMaker = require('../helpers/boundsMaker'),
    GroupedEventHandleLayer = require('../eventHandleLayers/groupedEventHandleLayer');

var ChartBase = tui.util.defineClass(/** @lends ChartBase.prototype */ {
    /**
     * Chart base.
     * @constructs ChartBase
     * @param {object} params parameters
     *      @param {object} params.bounds chart bounds
     *      @param {object} params.theme chart theme
     *      @param {{yAxis: obejct, xAxis: object}} axesData axes data
     *      @param {object} params.options chart options
     *      @param {boolean} param.isVertical whether vertical or not
     *      @param {object} params.initedData initialized data from combo chart
     */
    init: function(params) {
        this.chartId = params.initedData && params.initedData.chartId || chartConst.CHAR_ID_PREFIX + '-' + (new Date()).getTime();
        this.isSubChart = !!params.initedData;
        this.components = [];
        this.componentMap = {};
        this.bounds = params.bounds;
        this.theme = params.theme;
        this.options = params.options;
        this.isSubChart = !!params.initedData;
        this.hasAxes = !!params.axesData;
        this.isVertical = !!params.isVertical;
        this.isGroupedTooltip = params.options.tooltip && params.options.tooltip.grouped;

        this._addGroupedEventHandleLayer(params.axesData, params.options.chartType);
    },

    /**
     * Add grouped event handler layer.
     * @param {{yAxis: obejct, xAxis: object}} axesData axes data
     * @param {string} chartType chart type
     * @param {boolean} isVertical whether vertical or not
     * @private
     */
    _addGroupedEventHandleLayer: function(axesData, chartType) {
        var tickCount;

        if (!this.hasAxes || !this.isGroupedTooltip || this.isSubChart) {
            return;
        }

        if (this.isVertical) {
            tickCount = axesData.xAxis ? axesData.xAxis.tickCount : -1;
        } else {
            tickCount = axesData.yAxis ? axesData.yAxis.tickCount : -1;
        }

        this.addComponent('eventHandleLayer', GroupedEventHandleLayer, {
            tickCount: tickCount,
            chartType: chartType,
            isVertical: this.isVertical
        });
    },

    /**
     * To make baes data.
     * @param {array | object} userData user data
     * @param {object} theme chart theme
     * @param {object} options chart options
     * @param {object} params add params
     * @returns {{convertedData: object, bounds: object}} base data
     */
    makeBaseData: function(userData, theme, options, params) {
        var seriesChartTypes = params ? params.seriesChartTypes : [],
            convertedData = dataConverter.convert(userData, options.chart, options.chartType, seriesChartTypes),
            bounds = boundsMaker.make(tui.util.extend({
                chartType: options.chartType,
                convertedData: convertedData,
                theme: theme,
                options: options
            }, params));

        return {
            convertedData: convertedData,
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

        commonParams.bound = tui.util.isArray(bound) ? bound[index] : bound;
        commonParams.theme = tui.util.isArray(theme) ? theme[index] : theme;
        commonParams.options = tui.util.isArray(options) ? options[index] : options || {};

        params = tui.util.extend(commonParams, params);
        component = new Component(params);
        this.components.push(component);
        this.componentMap[name] = component;
    },

    /**
     * Attach custom evnet.
     * @private
     */
    _attachCustomEvent: function() {
        if (this.hasAxes && this.isGroupedTooltip && !this.isSubChart) {
            this._attachCoordinateEvent();
        } else if (!this.hasAxes || !this.isGroupedTooltip) {
            this._attachTooltipEvent();
        }
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

            dom.addClass(el, 'tui-chart');
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
            elTitle = renderUtil.renderTitle(chartOptions.title, this.theme.title, 'tui-chart-title');
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
        var elements = tui.util.map(components, function(component) {
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
    _attachTooltipEvent: function() {
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
     * Attach coordinate event.
     * @private
     */
    _attachCoordinateEvent: function() {
        var eventHandleLayer = this.componentMap.eventHandleLayer,
            tooltip = this.componentMap.tooltip,
            series = this.componentMap.series;
        eventHandleLayer.on('showGroupTooltip', tooltip.onShow, tooltip);
        eventHandleLayer.on('hideGroupTooltip', tooltip.onHide, tooltip);

        if (series) {
            tooltip.on('showGroupAnimation', series.onShowGroupAnimation, series);
            tooltip.on('hideGroupAnimation', series.onHideGroupAnimation, series);
        }
    },

    /**
     * Animate chart.
     */
    animateChart: function() {
        tui.util.forEachArray(this.components, function(component) {
            if (component.animateComponent) {
                component.animateComponent();
            }
        });
    }
});

module.exports = ChartBase;

},{"../const":15,"../eventHandleLayers/groupedEventHandleLayer":17,"../helpers/boundsMaker":23,"../helpers/dataConverter":25,"../helpers/domHandler":26,"../helpers/renderUtil":28}],8:[function(require,module,exports){
/**
 * @fileoverview Column chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase'),
    axisTypeMixer = require('./axisTypeMixer'),
    verticalTypeMixer = require('./verticalTypeMixer'),
    Series = require('../series/columnChartSeries');

var ColumnChart = tui.util.defineClass(ChartBase, /** @lends ColumnChart.prototype */ {
    /**
     * Column chart.
     * @constructs ColumnChart
     * @extends ChartBase
     * @mixes axisTypeMixer
     * @mixes verticalTypeMixer
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
            convertedData = baseData.convertedData,
            bounds = baseData.bounds,
            axesData = this._makeAxesData(convertedData, bounds, options, initedData);

        /**
         * className
         * @type {string}
         */
        this.className = 'tui-column-chart';

        ChartBase.call(this, {
            bounds: bounds,
            axesData: axesData,
            theme: theme,
            options: options,
            isVertical: true,
            initedData: initedData
        });

        this._addComponents(convertedData, axesData, options);
    },

    /**
     * Add components
     * @param {object} convertedData converted data
     * @param {object} axesData axes data
     * @param {object} options chart options
     * @private
     */
    _addComponents: function(convertedData, axesData, options) {
        var plotData, seriesData;

        plotData = this.makePlotData(convertedData.plotData, axesData);
        seriesData = {
            allowNegativeTooltip: true,
            data: {
                values: convertedData.values,
                formattedValues: convertedData.formattedValues,
                formatFunctions: convertedData.formatFunctions,
                scale: axesData.yAxis.scale
            }
        };
        this.addAxisComponents({
            convertedData: convertedData,
            axes: axesData,
            plotData: plotData,
            chartType: options.chartType,
            Series: Series,
            seriesData: seriesData
        });
    }
});

axisTypeMixer.mixin(ColumnChart);
verticalTypeMixer.mixin(ColumnChart);

module.exports = ColumnChart;

},{"../series/columnChartSeries":47,"./axisTypeMixer":5,"./chartBase":7,"./verticalTypeMixer":13}],9:[function(require,module,exports){
/**
 * @fileoverview Combo chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var calculator = require('../helpers/calculator'),
    ChartBase = require('./chartBase'),
    axisDataMaker = require('../helpers/axisDataMaker'),
    defaultTheme = require('../themes/defaultTheme'),
    GroupTooltip = require('../tooltips/groupTooltip'),
    ColumnChart = require('./columnChart'),
    LineChart = require('./lineChart');

var ComboChart = tui.util.defineClass(ChartBase, /** @lends ComboChart.prototype */ {
    /**
     * Combo chart.
     * @constructs ComboChart
     * @extends ChartBase
     * @param {array.<array>} userData chart data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(userData, theme, options) {
        var seriesChartTypes = tui.util.keys(userData.series).sort(),
            optionChartTypes = this._getYAxisOptionChartTypes(seriesChartTypes, options.yAxis),
            chartTypes = optionChartTypes.length ? optionChartTypes : seriesChartTypes,
            baseData = this.makeBaseData(userData, theme, options, {
                isVertical: true,
                hasAxes: true,
                seriesChartTypes: seriesChartTypes,
                optionChartTypes: optionChartTypes
            }),
            convertedData = baseData.convertedData,
            bounds = baseData.bounds,
            optionsMap = this._makeOptionsMap(chartTypes, options),
            themeMap = this._makeThemeMap(seriesChartTypes, theme, convertedData.legendLabels),
            yAxisParams = {
                convertedData: convertedData,
                seriesDimension: bounds.series.dimension,
                chartTypes: chartTypes,
                isOneYAxis: !optionChartTypes.length,
                options: options
            },
            baseAxesData = {};

        baseAxesData.yAxis = this._makeYAxisData(tui.util.extend({
            index: 0
        }, yAxisParams));

        baseAxesData.xAxis = axisDataMaker.makeLabelAxisData({
            labels: convertedData.labels
        });

        this.className = 'tui-combo-chart';

        ChartBase.call(this, {
            bounds: bounds,
            axesData: baseAxesData,
            theme: theme,
            options: options,
            isVertical: true
        });

        this.addComponent('tooltip', GroupTooltip, {
            labels: convertedData.labels,
            joinFormattedValues: convertedData.joinFormattedValues,
            joinLegendLabels: convertedData.joinLegendLabels,
            chartId: this.chartId
        });

        this._installCharts({
            userData: userData,
            baseData: baseData,
            baseAxesData: baseAxesData,
            axesData: this._makeAxesData(baseAxesData, yAxisParams, convertedData.formatFunctions),
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
            optionChartTypes = tui.util.map(yAxisOptions, function(option) {
                return option.chartType;
            });

            tui.util.forEachArray(optionChartTypes, function(chartType, index) {
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
     *      @param {object} params.convertedData converted data
     *      @param {{width: number, height: number}} params.seriesDimension series dimension
     *      @param {array.<string>} chartTypes chart type
     *      @param {boolean} isOneYAxis whether one series or not
     *      @param {object} options chart options
     *      @param {object} addParams add params
     * @returns {object} y axis data
     * @private
     */
    _makeYAxisData: function(params) {
        var convertedData = params.convertedData,
            index = params.index,
            chartType = params.chartTypes[index],
            options = params.options,
            yAxisValues, yAxisOptions, seriesOption;

        if (params.isOneYAxis) {
            yAxisValues = convertedData.joinValues;
            yAxisOptions = [options.yAxis];
        } else {
            yAxisValues = convertedData.values[chartType];
            yAxisOptions = options.yAxis || [];
        }

        seriesOption = options.series && options.series[chartType] || options.series;

        return axisDataMaker.makeValueAxisData(tui.util.extend({
            values: yAxisValues,
            stacked: seriesOption && seriesOption.stacked || '',
            options: yAxisOptions[index],
            chartType: chartType,
            seriesDimension: params.seriesDimension,
            formatFunctions: convertedData.formatFunctions,
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
    _makeAxesData: function(baseAxesData, yAxisParams, formatFunctions) {
        var yAxisData = baseAxesData.yAxis,
            chartTypes = yAxisParams.chartTypes,
            axesData = {},
            yrAxisData;
        if (!yAxisParams.isOneYAxis) {
            yrAxisData = this._makeYAxisData(tui.util.extend({
                index: 1,
                addParams: {
                    isPositionRight: true
                }
            }, yAxisParams));
            if (yAxisData.tickCount < yrAxisData.tickCount) {
                this._increaseYAxisTickCount(yrAxisData.tickCount - yAxisData.tickCount, yAxisData, formatFunctions);
            } else if (yAxisData.tickCount > yrAxisData.tickCount) {
                this._increaseYAxisTickCount(yAxisData.tickCount - yrAxisData.tickCount, yrAxisData, formatFunctions);
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
        tui.util.forEachArray(chartTypes, function(chartType, index) {
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
        tui.util.forEachArray(chartTypes, function(chartType) {
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
            chartOptions.parentChartType = chartOptions.chartType;
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
        tui.util.forEachArray(chartTypes, function(chartType) {
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
                chartTheme.series.label.fontFamily = chartTheme.chart.fontFamily;
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
     * @param {array.<function>} formatFunctions format functions
     * @private
     */
    _increaseYAxisTickCount: function(increaseTickCount, toData, formatFunctions) {
        toData.scale.max += toData.step * increaseTickCount;
        toData.labels = axisDataMaker.formatLabels(calculator.makeLabelsFromScale(toData.scale, toData.step), formatFunctions);
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
            convertedData = baseData.convertedData,
            plotData = {
                vTickCount: params.baseAxesData.yAxis.validTickCount,
                hTickCount: params.baseAxesData.xAxis.validTickCount
            },
            joinLegendLabels = convertedData.joinLegendLabels;

        this.charts = tui.util.map(params.seriesChartTypes, function(chartType) {
            var legendLabels = convertedData.legendLabels[chartType],
                axes = params.axesData[chartType],
                options = params.optionsMap[chartType],
                theme = params.themeMap[chartType],
                bounds = JSON.parse(JSON.stringify(baseData.bounds)),
                Chart = chartClasses[chartType],
                initedData, chart;

            if (axes && axes.yAxis.isPositionRight) {
                bounds.yAxis = bounds.yrAxis;
            }

            initedData = {
                convertedData: {
                    values: convertedData.values[chartType],
                    labels: convertedData.labels,
                    formatFunctions: convertedData.formatFunctions,
                    formattedValues: convertedData.formattedValues[chartType],
                    legendLabels: legendLabels,
                    joinLegendLabels: joinLegendLabels,
                    plotData: plotData
                },
                bounds: bounds,
                axes: axes,
                chartId: this.chartId
            };

            chart = new Chart(params.userData, theme, options, initedData);
            plotData = null;
            joinLegendLabels = null;
            return chart;
        }, this);
    },

    /**
     * Render combo chart.
     * @returns {HTMLElement} combo chart element
     */
    render: function() {
        var el = ChartBase.prototype.render.call(this);
        var paper;
        tui.util.forEachArray(this.charts, function(chart, index) {
            setTimeout(function() {
                chart.render(el, paper);
                if (!paper) {
                    paper = chart.getPaper();
                }
                chart.animateChart();
            }, 1 * index);
        });
        return el;
    }
});

module.exports = ComboChart;

},{"../helpers/axisDataMaker":22,"../helpers/calculator":24,"../themes/defaultTheme":53,"../tooltips/groupTooltip":54,"./chartBase":7,"./columnChart":8,"./lineChart":10}],10:[function(require,module,exports){
/**
 * @fileoverview Line chart
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase'),
    lineTypeMixer = require('./lineTypeMixer'),
    axisTypeMixer = require('./axisTypeMixer'),
    verticalTypeMixer = require('./verticalTypeMixer'),
    Series = require('../series/lineChartSeries');

var LineChart = tui.util.defineClass(ChartBase, /** @lends LineChart.prototype */ {
    /**
     * className
     * @type {string}
     */
    className: 'tui-line-chart',

    /**
     * Series class
     * @type {function}
     */
    Series: Series,

    /**
     * Line chart.
     * @constructs LineChart
     * @extends ChartBase
     * @mixes axisTypeMixer
     * @mixes verticalTypeMixer
     * @mixes lineTypeMixer
     */
    init: function() {
        this.lineTypeInit.apply(this, arguments);
    }
});

axisTypeMixer.mixin(LineChart);
verticalTypeMixer.mixin(LineChart);
lineTypeMixer.mixin(LineChart);

module.exports = LineChart;

},{"../series/lineChartSeries":48,"./axisTypeMixer":5,"./chartBase":7,"./lineTypeMixer":11,"./verticalTypeMixer":13}],11:[function(require,module,exports){
/**
 * @fileoverview lineTypeMixer is mixer of line type chart(line, area).
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase'),
    LineTypeEventHandleLayer = require('../eventHandleLayers/lineTypeEventHandleLayer');

/**
 * lineTypeMixer is mixer of line type chart(line, area).
 * @mixin
 */
var lineTypeMixer = {
    /**
     * Initialize line type chart.
     * @param {array.<array>} userData chart data
     * @param {object} theme chart theme
     * @param {object} options chart options
     * @param {object} initedData initialized data from combo chart
     */
    lineTypeInit: function(userData, theme, options, initedData) {
        var baseData = initedData || this.makeBaseData(userData, theme, options, {
                isVertical: true,
                hasAxes: true
            }),
            convertedData = baseData.convertedData,
            bounds = baseData.bounds,
            axesData = this._makeAxesData(convertedData, bounds, options, initedData);

        ChartBase.call(this, {
            bounds: bounds,
            axesData: axesData,
            theme: theme,
            options: options,
            isVertical: true,
            initedData: initedData
        });

        if (!this.isSubChart && !this.isGroupedTooltip) {
            this.addComponent('eventHandleLayer', LineTypeEventHandleLayer, {
                tickCount: axesData.xAxis ? axesData.xAxis.tickCount : -1
            });
        }

        this._addComponents(convertedData, axesData, options);
    },

    /**
     * Add components
     * @param {object} convertedData converted data
     * @param {object} axesData axes data
     * @param {object} options chart options
     * @private
     */
    _addComponents: function(convertedData, axesData) {
        var plotData, seriesData;

        plotData = this.makePlotData(convertedData.plotData, axesData);
        seriesData = {
            data: {
                values: tui.util.pivot(convertedData.values),
                formattedValues: tui.util.pivot(convertedData.formattedValues),
                scale: axesData.yAxis.scale,
                xTickCount: axesData.xAxis && axesData.xAxis.tickCount || -1
            }
        };
        this.addAxisComponents({
            convertedData: convertedData,
            axes: axesData,
            plotData: plotData,
            Series: this.Series,
            seriesData: seriesData,
            aligned: axesData.xAxis && axesData.xAxis.aligned
        });
    },

    /**
     * Render
     * @returns {HTMLElement} chart element
     */
    render: function() {
        if (!this.isSubChart && !this.isGroupedTooltip) {
            this._attachLineTypeCoordinateEvent();
        }
        return ChartBase.prototype.render.apply(this, arguments);
    },

    /**
     * To attach coordinate event of line type.
     * @private
     */
    _attachLineTypeCoordinateEvent: function() {
        var eventHandleLayer = this.componentMap.eventHandleLayer,
            series = this.componentMap.series;
        eventHandleLayer.on('overTickSector', series.onLineTypeOverTickSector, series);
        eventHandleLayer.on('outTickSector', series.onLineTypeOutTickSector, series);
    },

    /**
     * Mix in.
     * @param {function} func target function
     * @ignore
     */
    mixin: function(func) {
        tui.util.extend(func.prototype, this);
    }
};

module.exports = lineTypeMixer;

},{"../eventHandleLayers/lineTypeEventHandleLayer":18,"./chartBase":7}],12:[function(require,module,exports){
/**
 * @fileoverview Pie chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase'),
    chartConst = require('../const'),
    Legend = require('../legends/legend'),
    Tooltip = require('../tooltips/tooltip'),
    Series = require('../series/pieChartSeries');

var PieChart = tui.util.defineClass(ChartBase, /** @lends PieChart.prototype */ {
    /**
     * Column chart.
     * @constructs PieChart
     * @extends ChartBase
     * @param {array.<array>} userData chart data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(userData, theme, options) {
        var baseData = this.makeBaseData(userData, theme, options),
            convertedData = baseData.convertedData,
            bounds = baseData.bounds;

        this.className = 'tui-pie-chart';

        options.tooltip = options.tooltip || {};

        if (!options.tooltip.position) {
            options.tooltip.position = chartConst.TOOLTIP_DEFAULT_POSITION_OPTION;
        }

        ChartBase.call(this, {
            bounds: bounds,
            theme: theme,
            options: options
        });

        this._addComponents(convertedData, theme.chart.background, bounds, options);
    },

    /**
     * Add components
     * @param {object} convertedData converted data
     * @param {object} chartBackground chart background
     * @param {array.<object>} bounds bounds
     * @param {object} options chart options
     * @private
     */
    _addComponents: function(convertedData, chartBackground, bounds, options) {
        if (convertedData.joinLegendLabels && (!options.series || !options.series.legendType)) {
            this.addComponent('legend', Legend, {
                joinLegendLabels: convertedData.joinLegendLabels,
                legendLabels: convertedData.legendLabels,
                chartType: options.chartType
            });
        }

        this.addComponent('tooltip', Tooltip, {
            chartType: options.chartType,
            values: convertedData.formattedValues,
            labels: convertedData.labels,
            legendLabels: convertedData.legendLabels,
            chartId: this.chartId,
            seriesPosition: bounds.series.position
        });

        this.addComponent('series', Series, {
            libType: options.libType,
            chartType: options.chartType,
            chartBackground: chartBackground,
            data: {
                values: convertedData.values,
                formattedValues: convertedData.formattedValues,
                legendLabels: convertedData.legendLabels,
                chartWidth: bounds.chart.dimension.width
            }
        });
    }
});

module.exports = PieChart;

},{"../const":15,"../legends/legend":31,"../series/pieChartSeries":50,"../tooltips/tooltip":55,"./chartBase":7}],13:[function(require,module,exports){
/**
 * @fileoverview verticalTypeMixer is mixer of vertical type chart(column, line, area).
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var axisDataMaker = require('../helpers/axisDataMaker'),
    state = require('../helpers/state');

/**
 * verticalTypeMixer is mixer of vertical type chart(column, line, area).
 * @mixin
 */
var verticalTypeMixer = {
    /**
     * To make axes data
     * @param {object} convertedData converted data
     * @param {object} bounds chart bounds
     * @param {object} options chart options
     * @param {object} initedData initialized data from combo chart
     * @returns {object} axes data
     * @private
     */
    _makeAxesData: function(convertedData, bounds, options, initedData) {
        var axesData = {};
        if (initedData) {
            axesData = initedData.axes;
        } else {
            axesData.yAxis = axisDataMaker.makeValueAxisData({
                values: convertedData.values,
                seriesDimension: bounds.series.dimension,
                stacked: options.series && options.series.stacked || '',
                chartType: options.chartType,
                formatFunctions: convertedData.formatFunctions,
                options: options.yAxis,
                isVertical: true
            });
            axesData.xAxis = axisDataMaker.makeLabelAxisData({
                labels: convertedData.labels,
                aligned: state.isLineTypeChart(options.chartType),
                options: options.xAxis
            });
        }
        return axesData;
    },

    /**
     * Mix in.
     * @param {function} func target function
     * @ignore
     */
    mixin: function(func) {
        tui.util.extend(func.prototype, this);
    }
};

module.exports = verticalTypeMixer;

},{"../helpers/axisDataMaker":22,"../helpers/state":29}],14:[function(require,module,exports){
'use strict';

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
    tui.util.forEachArray(rest, function(item) {
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
    tui.util.forEachArray(rest, function(item) {
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
    tui.util.forEachArray(arr, function(item) {
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
    tui.util.forEachArray(arr, function(item) {
        if (!condition(item)) {
            result = false;
            return false;
        }
    });
    return result;
};

/**
 * Array pivot.
 * @memberOf module:calculator
 * @param {array.<array>} arr2d target 2d array
 * @returns {array.<array>} pivoted 2d array
 */
var pivot = function(arr2d) {
    var result = [];
    tui.util.forEachArray(arr2d, function(arr) {
        tui.util.forEachArray(arr, function(value, index) {
            if (!result[index]) {
                result[index] = [];
            }
            result[index].push(value);
        });
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
        underPointLens = tui.util.map(args, function(value) {
            return tui.util.lengthAfterPoint(value);
        }),
        underPointLen = tui.util.max(underPointLens),
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
    var multipleNum = tui.util.findMultipleNum(modNum);
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
    return tui.util.reduce(copyArr, function(base, add) {
        return parseFloat(base) + parseFloat(add);
    });
};

tui.util.min = min;
tui.util.max = max;
tui.util.any = any;
tui.util.all = all;
tui.util.pivot = pivot;
tui.util.lengthAfterPoint = lengthAfterPoint;
tui.util.mod = mod;
tui.util.findMultipleNum = findMultipleNum;
tui.util.addition = addition;
tui.util.subtraction = subtraction;
tui.util.multiplication = multiplication;
tui.util.division = division;
tui.util.sum = sum;

},{}],15:[function(require,module,exports){
/**
 * @fileoverview chart const
 * @readonly
 * @enum {number}
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

module.exports = {
    /** chart id prefix */
    CHAR_ID_PREFIX: 'tui-chart',
    /** tooltip id prefix*/
    TOOLTIP_ID_PREFIX: 'tui-chart-tooltip',
    /** chart types */
    CHART_TYPE_BAR: 'bar',
    CHART_TYPE_COLUMN: 'column',
    CHART_TYPE_LINE: 'line',
    CHART_TYPE_AREA: 'area',
    CHART_TYPE_COMBO: 'combo',
    CHART_TYPE_PIE: 'pie',
    /** chart padding */
    CHART_PADDING: 10,
    /** chart default width */
    CHART_DEFAULT_WIDTH: 500,
    /** chart default hdiehgt */
    CHART_DEFAULT_HEIGHT: 400,
    /** hidden width */
    HIDDEN_WIDTH: 1,
    /** rendered text padding */
    TEXT_PADDING: 2,
    /** series expand size */
    SERIES_EXPAND_SIZE: 10,
    /** series label padding */
    SERIES_LABEL_PADDING: 5,
    /** default font size of title */
    DEFAULT_TITLE_FONT_SIZE: 14,
    /** default font size of axis title */
    DEFAULT_AXIS_TITLE_FONT_SIZE: 10,
    /** default font size of label */
    DEFAULT_LABEL_FONT_SIZE: 12,
    /** default font size of series lable */
    DEFAULT_SERIES_LABEL_FONT_SIZE: 11,
    /** default graph plugin */
    DEFAULT_PLUGIN: 'raphael',
    /** default tick color */
    DEFAULT_TICK_COLOR: 'black',
    /** default theme name */
    DEFAULT_THEME_NAME: 'default',
    /** stacked option types */
    STACKED_NORMAL_TYPE: 'normal',
    STACKED_PERCENT_TYPE: 'percent',
    /** empty axis label */
    EMPTY_AXIS_LABEL: '',
    /** angel 360 */
    ANGLE_85: 85,
    ANGLE_90: 90,
    ANGLE_360: 360,
    /** radian */
    RAD: Math.PI / 180,
    /** series legend types */
    SERIES_LEGEND_TYPE_OUTER: 'outer',
    /** series outer label padding */
    SERIES_OUTER_LABEL_PADDING: 20,
    /** default rate of pie graph */
    PIE_GRAPH_DEFAULT_RATE: 0.8,
    /** small rate of pie graph */
    PIE_GRAPH_SMALL_RATE: 0.65,
    /** yAxis properties */
    YAXIS_PROPS: ['tickColor', 'title', 'label'], // yaxis theme의 속성 - chart type filtering할 때 사용됨
    /** series properties */
    SERIES_PROPS: ['label', 'colors', 'borderColor', 'singleColors'], // series theme의 속성 - chart type filtering할 때 사용됨
    /** title area width padding */
    TITLE_AREA_WIDTH_PADDING: 20,
    /** top margin of x axis label */
    XAXIS_LABEL_TOP_MARGIN: 10,
    /** right padding of vertical label */
    V_LABEL_RIGHT_PADDING: 10,
    /** tooltip prefix */
    TOOLTIP_PREFIX: 'tui-chart-tooltip',
    /** minimum pixel type step size */
    MIN_PIXEL_TYPE_STEP_SIZE: 40,
    /** maximum pixel type step size */
    MAX_PIXEL_TYPE_STEP_SIZE: 60,
    /* tick info of percent stacked option */
    PERCENT_STACKED_TICK_INFO: {
        scale: {
            min: 0,
            max: 100
        },
        step: 25,
        tickCount: 5,
        labels: [0, 25, 50, 75, 100]
    },
    /** title add padding */
    TITLE_PADDING: 20,
    /** legend area padding */
    LEGEND_AREA_PADDING: 10,
    /** legend rect width */
    LEGEND_RECT_WIDTH: 12,
    /** lgend label left padding */
    LEGEND_LABEL_LEFT_PADDING: 5,
    /** AXIS LABEL PADDING */
    AXIS_LABEL_PADDING: 7,
    /** rotations degree candidates */
    DEGREE_CANDIDATES: [25, 45, 65, 85],
    /** xAxis label compare margin */
    XAXIS_LABEL_COMPARE_MARGIN: 20,
    /** xAxis label gutter */
    XAXIS_LABEL_GUTTER: 2,
    /** stand multiple nums of axis */
    AXIS_STANDARD_MULTIPLE_NUMS: [1, 2, 5, 10],
    /** label padding top */
    LABEL_PADDING_TOP: 2,
    /** line margin top */
    LINE_MARGIN_TOP: 5,
    /** tooltip gap */
    TOOLTIP_GAP: 5,
    /** tooltip direction */
    TOOLTIP_DIRECTION_FORWORD: 'forword',
    TOOLTIP_DIRECTION_BACKWORD: 'backword',
    /** tooltip default position option */
    TOOLTIP_DEFAULT_POSITION_OPTION: 'center top',
    TOOLTIP_DEFAULT_HORIZONTAL_POSITION_OPTION: 'right middle',
    /** hide delay */
    HIDE_DELAY: 200
};

},{}],16:[function(require,module,exports){
/**
 * @fileoverview EventHandleLayerBase is base class for event handle layers.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var event = require('../helpers/eventListener'),
    dom = require('../helpers/domHandler'),
    renderUtil = require('../helpers/renderUtil');

var EventHandleLayerBase = tui.util.defineClass(/** @lends EventHandleLayerBase.prototype */ {
    /**
     * EventHandleLayerBase is base class for event handle layers.
     * @constructs EventHandleLayerBase
     * @param {object} params parameters
     *      @param {{
     *          dimension: {width: number, height: number},
     *          position: {left: number, top: number}
     *      }} params.bound bound
     *      @param {string} params.chartType chart type
     *      @param {boolean} params.isVertical whether vertical or not
     */
    init: function(params) {
        this.bound = params.bound;
        this.chartType = params.chartType;
        this.isVertical = params.isVertical;
        this.coordinateData = this.makeCoordinateData(params.bound.dimension, params.tickCount, params.chartType);
    },

    /**
     * To make coordinate data.
     */
    makeCoordinateData: function() {},

    /**
     * Render.
     * @return {HTMLElement} coordinate area
     */
    render: function() {
        var elCoordinateArea = dom.create('DIV', 'tui-chart-series-coordinate-area');
        renderUtil.renderDimension(elCoordinateArea, this.bound.dimension);
        renderUtil.renderPosition(elCoordinateArea, this.bound.position);
        this.attachEvent(elCoordinateArea);
        return elCoordinateArea;
    },

    /**
     * Find group index.
     * @param {number} pointValue mouse position point value
     * @returns {number} group index
     */
    findIndex: function(pointValue) {
        var foundIndex = -1;
        tui.util.forEachArray(this.coordinateData, function(scale, index) {
            if (scale.min < pointValue && scale.max >= pointValue) {
                foundIndex = index;
                return false;
            }
        });

        return foundIndex;
    },

    /**
     * To make coordinate data abount line type chart.
     * @param {number} width width
     * @param {number} tickCount tick count
     * @returns {array} coordinate data
     */
    makeLineTypeCoordinateData: function(width, tickCount) {
        var tickInterval = width / (tickCount - 1),
            halfInterval = tickInterval / 2;
        return tui.util.map(tui.util.range(0, tickCount), function(index) {
            return {
                min: index * tickInterval - halfInterval,
                max: index * tickInterval + halfInterval
            };
        });
    },

    /**
     * On mouse move
     * @abstract
     */
    onMousemove: function() {},

    /**
     * On mouse out
     * @abstract
     */
    onMouseout: function() {},

    /**
     * Attach event
     * @param {HTMLElement} el target element
     */
    attachEvent: function(el) {
        event.bindEvent('mousemove', el, tui.util.bind(this.onMousemove, this));
        event.bindEvent('mouseout', el, tui.util.bind(this.onMouseout, this));
    }
});

tui.util.CustomEvents.mixin(EventHandleLayerBase);

module.exports = EventHandleLayerBase;

},{"../helpers/domHandler":26,"../helpers/eventListener":27,"../helpers/renderUtil":28}],17:[function(require,module,exports){
/**
 * @fileoverview GroupedEventHandleLayer is event handle layer for grouped toolip option.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var EventHandleLayerBase = require('./eventHandleLayerBase'),
    chartConst = require('../const'),
    state = require('../helpers/state');

var GroupedEventHandleLayer = tui.util.defineClass(EventHandleLayerBase, /** @lends GroupedEventHandleLayer.prototype */ {
    /**
     * GroupedEventHandleLayer is event handle layer for grouped toolip option.
     * @constructs EventHandleLayerBase
     * @extends EventHandleLayerBase
     */
    init: function() {
        EventHandleLayerBase.apply(this, arguments);
    },

    /**
     * To make coordinate data about non line type chart.
     * @param {number} size width or height
     * @param {number} tickCount tick count
     * @returns {array} coordinate data
     * @private
     */
    _makeNormalCoordinateData: function(size, tickCount) {
        var len = tickCount - 1,
            tickInterval = size / len,
            prev = 0;
        return tui.util.map(tui.util.range(0, len), function(index) {
            var max = tui.util.min([size, (index + 1) * tickInterval]),
                scale = {
                    min: prev,
                    max: max
                };
            prev = max;
            return scale;
        });
    },

    /**
     * To make coordinate data.
     * @param {{width: number, height: number}} dimension dimension
     * @param {number} tickCount tick count
     * @param {string} chartType chart type
     * @returns {array.<{min: number, max: number}>} tick groups
     * @private
     */
    makeCoordinateData: function(dimension, tickCount, chartType) {
        var sizeType = this.isVertical ? 'width' : 'height',
            coordinateData;
        if (state.isLineTypeChart(chartType)) {
            coordinateData = this.makeLineTypeCoordinateData(dimension[sizeType], tickCount);
        } else {
            coordinateData = this._makeNormalCoordinateData(dimension[sizeType], tickCount);
        }

        return coordinateData;
    },

    /**
     * To make range of tooltip position.
     * @param {{min: number, max: number}} scale scale
     * @param {string} chartType chart type
     * @returns {{start: number, end: number}} range type value
     * @private
     */
    _makeRange: function(scale, chartType) {
        var range, center;
        if (state.isLineTypeChart(chartType)) {
            center = scale.max - (scale.max - scale.min) / 2;
            range = {
                start: center,
                end: center
            };
        } else {
            range = {
                start: scale.min,
                end: scale.max
            };
        }

        return range;
    },

    /**
     * Get layer position.
     * @param {MouseEvent} e mouse event object
     * @param {{top: number, right: number, bottom: number, left: number}} bound bound
     * @param {boolean} isVertical whether vertical or not
     * @returns {number} layer position (left or top)
     * @private
     */
    _getLayerPositionValue: function(e, bound, isVertical) {
        var layerPosition;
        if (isVertical) {
            layerPosition = e.clientX - bound.left;
        } else {
            layerPosition = e.clientY - bound.top;
        }
        return layerPosition;
    },

    /**
     * Get tooltip direction.
     * @param {number} index index
     * @returns {string} direction
     * @private
     */
    _getTooltipDirection: function(index) {
        var standardNumber = Math.ceil(this.coordinateData.length / 2),
            number = index + 1;
        // 중앙을 기준으로 중앙을 포함하여 앞부분에 위치하는 data는 forword를 반환하고, 뒷부분에 위치하는 data는 backword를 반환한다.
        return standardNumber >= number ? chartConst.TOOLTIP_DIRECTION_FORWORD : chartConst.TOOLTIP_DIRECTION_BACKWORD;
    },

    /**
     * On mousemove.
     * @param {MouseEvent} e mouse event object
     * @override
     */
    onMousemove: function(e) {
        var elTarget = e.target || e.srcElement,
            bound = elTarget.getBoundingClientRect(),
            layerPositionValue = this._getLayerPositionValue(e, bound, this.isVertical),
            index = this.findIndex(layerPositionValue),
            prevIndex = this.prevIndex,
            sizeType = this.isVertical ? 'height' : 'width',
            direction;

        if (index === -1 || prevIndex === index) {
            return;
        }

        this.prevIndex = index;

        direction = this._getTooltipDirection(index);

        this.fire('showGroupTooltip', {
            index: index,
            range: this._makeRange(this.coordinateData[index], this.chartType),
            size: this.bound.dimension[sizeType],
            direction: direction,
            isVertical: this.isVertical
        });
    },

    /**
     * On mouseout.
     * @param {MouseEvent} e mouse event object
     * @override
     */
    onMouseout: function() {
        this.fire('hideGroupTooltip', this.prevIndex);
        delete this.prevIndex;
    }
});

tui.util.CustomEvents.mixin(GroupedEventHandleLayer);

module.exports = GroupedEventHandleLayer;

},{"../const":15,"../helpers/state":29,"./eventHandleLayerBase":16}],18:[function(require,module,exports){
/**
 * @fileoverview LineTypeEventHandleLayer is event handle layer for line type chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var EventHandleLayerBase = require('./eventHandleLayerBase');

var LineTypeEventHandleLayer = tui.util.defineClass(EventHandleLayerBase, /** @lends LineTypeEventHandleLayer.prototype */ {
    /**
     * LineTypeEventHandleLayer is event handle layer for line type chart.
     * @constructs LineTypeEventHandleLayer
     * @extends LineTypeEventHandleLayer
     */
    init: function() {
        EventHandleLayerBase.apply(this, arguments);
    },

    /**
     * To make coordinate data.
     * @param {{width: number, height: number}} dimension dimension
     * @param {number} tickCount tick count
     * @returns {array.<{min: number, max: number}>} tick groups
     * @private
     */
    makeCoordinateData: function(dimension, tickCount) {
        return this.makeLineTypeCoordinateData(dimension.width, tickCount);
    },

    /**
     * On mousemove.
     * @param {MouseEvent} e mouse event object
     * @override
     */
    onMousemove: function(e) {
        var elTarget = e.target || e.srcElement,
            bound = elTarget.getBoundingClientRect(),
            layerX = e.clientX - bound.left,
            layerY = e.clientY - bound.top,
            index = this.findIndex(layerX);
        this.fire('overTickSector', index, layerY);
    },

    /**
     * On mouseout.
     * @param {MouseEvent} e mouse event object
     * @override
     */
    onMouseout: function() {
        this.fire('outTickSector');
    }
});

tui.util.CustomEvents.mixin(LineTypeEventHandleLayer);

module.exports = LineTypeEventHandleLayer;

},{"./eventHandleLayerBase":16}],19:[function(require,module,exports){
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
         * @param {object} theme chart options
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

},{}],20:[function(require,module,exports){
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

},{}],21:[function(require,module,exports){
/**
 * @fileoverview  Theme factory play role register theme.
 *                Also, you can get theme from this factory.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    defaultTheme = require('../themes/defaultTheme');

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

        result = tui.util.filter(target, function(item, name) {
            return tui.util.inArray(name, rejectionProps) === -1;
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

        if (!tui.util.keys(chartTypes).length) {
            this._concatColors(theme.series, seriesColors);
        } else {
            tui.util.forEach(chartTypes, function(item) {
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
        tui.util.forEach(to, function(item, key) {
            var fromItem = from[key];
            if (!fromItem) {
                return;
            }

            if (tui.util.isArray(fromItem)) {
                to[key] = fromItem.slice();
            } else if (tui.util.isObject(fromItem)) {
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
        if (tui.util.keys(chartTypes).length) {
            tui.util.forEach(chartTypes, function(item, key) {
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
    _copyColorInfoToOther: function(seriesTheme, legendTheme, colors) {
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
            yAxisChartTypeThems = this._filterChartTypes(theme.yAxis, chartConst.YAXIS_PROPS),
            seriesChartTypeThemes = this._filterChartTypes(theme.series, chartConst.SERIES_PROPS);

        if (!tui.util.keys(yAxisChartTypeThems).length) {
            items.push(theme.yAxis.title);
            items.push(theme.yAxis.label);
        } else {
            tui.util.forEach(yAxisChartTypeThems, function(chatTypeTheme) {
                items.push(chatTypeTheme.title);
                items.push(chatTypeTheme.label);
            });
        }

        if (!tui.util.keys(seriesChartTypeThemes).length) {
            items.push(theme.series.label);
        } else {
            tui.util.forEach(seriesChartTypeThemes, function(chatTypeTheme) {
                items.push(chatTypeTheme.label);
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

        tui.util.forEachArray(targetItems, function(item) {
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
        if (!tui.util.keys(seriesChartTypes).length) {
            this._copyColorInfoToOther(theme.series, theme.legend);
            this._copyColorInfoToOther(theme.series, theme.tooltip);
        } else {
            tui.util.forEach(seriesChartTypes, function(item, chartType) {
                theme.legend[chartType] = {};
                theme.tooltip[chartType] = {};
                this._copyColorInfoToOther(item, theme.legend[chartType], item.colors || theme.legend.colors);
                this._copyColorInfoToOther(item, theme.tooltip[chartType], item.colors || theme.tooltip.colors);
                delete theme.legend.colors;
                delete theme.tooltip.colors;
            }, this);
        }
    }
};

},{"../const":15,"../themes/defaultTheme":53}],22:[function(require,module,exports){
/**
 * @fileoverview Axis Data Maker
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    calculator = require('./calculator');

var abs = Math.abs,
    concat = Array.prototype.concat;

/**
 * Axis data maker.
 * @module axisDataMaker
 */
var axisDataMaker = {
    /**
     * To make labels.
     * @param {array.<string>} labels labels
     * @param {number} labelInterval label interval
     * @returns {array.<string>} labels
     * @private
     */
    _makeLabels: function(labels, labelInterval) {
        var lastIndex;
        if (!labelInterval) {
            return labels;
        }

        lastIndex = labels.length - 1;
        return tui.util.map(labels, function(label, index) {
            if (index > 0 && index < lastIndex && (index % labelInterval) > 0) {
                label = chartConst.EMPTY_AXIS_LABEL;
            }
            return label;
        });
    },

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
        var tickCount = params.labels.length,
            options = params.options || {};
        if (!params.aligned) {
            tickCount += 1;
        }

        return {
            labels: this._makeLabels(params.labels, options.labelInterval),
            tickCount: tickCount,
            validTickCount: 0,
            isLabelAxis: true,
            isVertical: !!params.isVertical,
            aligned: !!params.aligned
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
            tickInfo = chartConst.PERCENT_STACKED_TICK_INFO;
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
            labels: this.formatLabels(tickInfo.labels, formatFunctions),
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
            baseValues = baseValues.concat(tui.util.map(groupValues, function(values) {
                var plusValues = tui.util.filter(values, function(value) {
                    return value > 0;
                });
                return tui.util.sum(plusValues);
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
            start = parseInt(baseSize / chartConst.MAX_PIXEL_TYPE_STEP_SIZE, 10),
            end = parseInt(baseSize / chartConst.MIN_PIXEL_TYPE_STEP_SIZE, 10) + 1,
            tickCounts = tui.util.range(start, end);
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
            weight = Math.pow(10, tui.util.lengthAfterPoint(tickInfo.step));
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
        var getComparingValue = tui.util.bind(this._getComparingValue, this, min, max),
            tickInfo = tui.util.min(candidates, getComparingValue);
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
        var min = tui.util.min(params.values),
            max = tui.util.max(params.values),
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

        multipleNum = tui.util.findMultipleNum(min, max);
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

        tickInfo.step = tui.util.division(tickInfo.step, divideNum);
        tickInfo.scale.min = tui.util.division(tickInfo.scale.min, divideNum);
        tickInfo.scale.max = tui.util.division(tickInfo.scale.max, divideNum);
        tickInfo.labels = tui.util.map(tickInfo.labels, function(label) {
            return tui.util.division(label, divideNum);
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
            ticks = tui.util.range(1, tickInfo.tickCount),
            options = params.options,
            step = tickInfo.step,
            scale = tickInfo.scale,
            tickMax = scale.max,
            tickMin = scale.min,
            isUndefinedMin = tui.util.isUndefined(options.min),
            isUndefinedMax = tui.util.isUndefined(options.max),
            labels;
        tui.util.forEachArray(ticks, function(tickIndex) {
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

        // 04. 사용자의 max값이 scael max와 같을 경우, max값을 1 step 증가 시킴
        scale.max = this._addMaxPadding({
            max: scale.max,
            step: step,
            userMax: params.userMax,
            maxOption: params.options.max
        });

        // 05. axis scale이 사용자 min, max와 거리가 멀 경우 조절
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
        if (tui.util.isUndefined(params.maxOption) && (params.max === params.userMax)) {
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
        var mod = tui.util.mod(min, step),
            normalized;

        if (mod === 0) {
            normalized = min;
        } else {
            normalized = tui.util.subtraction(min, (min >= 0 ? mod : step + mod));
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
        var minMaxDiff = tui.util.multiplication(step, tickCount - 1),
            normalizedMax = tui.util.addition(scale.min, minMaxDiff),
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

        candidates = tui.util.map(params.tickCounts, function(tickCount) {
            return this._makeTickInfo({
                tickCount: tickCount,
                scale: tui.util.extend({}, scale),
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
     */
    formatLabels: function(labels, formatFunctions) {
        var result;
        if (!formatFunctions || !formatFunctions.length) {
            return labels;
        }
        result = tui.util.map(labels, function(label) {
            var fns = concat.apply([label], formatFunctions);
            return tui.util.reduce(fns, function(stored, fn) {
                return fn(stored);
            });
        });
        return result;
    }
};

module.exports = axisDataMaker;

},{"../const":15,"./calculator":24}],23:[function(require,module,exports){
/**
 * @fileoverview Bounds maker.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    calculator = require('./calculator'),
    renderUtil = require('./renderUtil');

var concat = Array.prototype.concat;

/**
 * Bounds maker.
 * @module boundsMaker
 */
var boundsMaker = {
    /**
     * Get max label of value axis.
     * @memberOf module:boundsMaker
     * @param {object} convertedData convert data
     * @param {string} chartType chart type
     * @returns {number|string} max label
     * @private
     */
    _getValueAxisMaxLabel: function(convertedData, chartType) {
        var values = chartType && convertedData.values[chartType] || convertedData.joinValues,
            formatFunctions = convertedData.formatFunctions,
            flattenValues = concat.apply([], values),
            min = tui.util.min(flattenValues),
            max = tui.util.max(flattenValues),
            scale = calculator.calculateScale(min, max),
            minLabel = calculator.normalizeAxisNumber(scale.min),
            maxLabel = calculator.normalizeAxisNumber(scale.max),
            fns = formatFunctions && formatFunctions.slice() || [];
        maxLabel = (minLabel + '').length > (maxLabel + '').length ? minLabel : maxLabel;
        fns.unshift(maxLabel);
        maxLabel = tui.util.reduce(fns, function(stored, fn) {
            return fn(stored);
        });
        return maxLabel;
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
            titleAreaHeight = renderUtil.getRenderedLabelHeight(title, theme.title) + chartConst.TITLE_PADDING,
            height = renderUtil.getRenderedLabelsMaxHeight(labels, theme.label) + titleAreaHeight;
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

        titleAreaWidth = renderUtil.getRenderedLabelHeight(title, theme.title) + chartConst.TITLE_PADDING;
        width = renderUtil.getRenderedLabelsMaxWidth(labels, theme.label) + titleAreaWidth + chartConst.AXIS_LABEL_PADDING;

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
            label = this._getValueAxisMaxLabel(params.convertedData, chartType);
            width = this._getYAxisWidth(params.options, [label], theme, index);
        }
        return width;
    },

    /**
     * To make axes dimension.
     * @memberOf module:boundsMaker
     * @param {object} params parameters
     *      @param {object} params.convertedData converted data
     *      @param {object} params.theme chart theme
     *      @param {boolean} params.isVertical whether vertical or not
     *      @param {object} params.options chart options
     *      *      @param {object} params.axesLabelInfo axes label info
     * @returns {{
     *      yAxis: {width: number},
     *      yrAxis: {width: number},
     *      xAxis: {height: number}
     * }} axes dimension
     * @private
     */
    _makeAxesDimension: function(params) {
        var yAxisWidth = 0,
            xAxisHeight = 0,
            yrAxisWidth = 0,
            axesLabelInfo, chartType;

        // axis 영역이 필요 있는 경우에만 처리
        if (params.hasAxes) {
            axesLabelInfo = params.axesLabelInfo;
            chartType = params.optionChartTypes && params.optionChartTypes[0] || '';
            yAxisWidth = this._getYAxisWidth(params.options.yAxis, axesLabelInfo.yAxis, params.theme.yAxis[chartType] || params.theme.yAxis);
            xAxisHeight = this._getXAxisHeight(params.options.xAxis, axesLabelInfo.xAxis, params.theme.xAxis);
            yrAxisWidth = this._getYRAxisWidth({
                convertedData: params.convertedData,
                chartTypes: params.optionChartTypes,
                theme: params.theme.yAxis,
                options: params.options.yAxis
            });
        }

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
     * To make legend dimension.
     * @memberOf module:boundsMaker
     * @param {array.<string>} joinLegendLabels legend labels
     * @param {object} labelTheme label theme
     * @param {string} chartType chart type
     * @param {object} seriesOption series option
     * @returns {{width: number}} legend dimension
     * @private
     */
    _makeLegendDimension: function(joinLegendLabels, labelTheme, chartType, seriesOption) {
        var legendWidth = 0,
            legendLabels, maxLabelWidth;

        seriesOption = seriesOption || {};

        if (chartType !== chartConst.CHART_TYPE_PIE || !seriesOption.legendType) {
            legendLabels = tui.util.map(joinLegendLabels, function(item) {
                return item.label;
            });
            maxLabelWidth = renderUtil.getRenderedLabelsMaxWidth(legendLabels, labelTheme);
            legendWidth = maxLabelWidth + chartConst.LEGEND_RECT_WIDTH +
                chartConst.LEGEND_LABEL_LEFT_PADDING + (chartConst.LEGEND_AREA_PADDING * 2);
        }

        return {
            width: legendWidth
        };
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
            width = params.chartDimension.width - (chartConst.CHART_PADDING * 2) - axesDimension.yAxis.width - rightAreaWidth,
            height = params.chartDimension.height - (chartConst.CHART_PADDING * 2) - params.titleHeight - axesDimension.xAxis.height;

        return {
            width: width,
            height: height
        };
    },

    /**
     * To make chart dimension.
     * @param {{width: number, height: number}} chartOptions chart options
     * @returns {{width: (number), height: (number)}} chart dimension
     * @private
     */
    _makeChartDimension: function(chartOptions) {
        return {
            width: chartOptions.width || chartConst.CHART_DEFAULT_WIDTH,
            height: chartOptions.height || chartConst.CHART_DEFAULT_HEIGHT
        };
    },

    /**
     * To make title dimension
     * @param {{title: string}} option title option
     * @param {{fontFamily: string, fontSize: number}} theme title theme
     * @returns {{height: number}} title dimension
     * @private
     */
    _makeTitleDimension: function(option, theme) {
        return {
            height: renderUtil.getRenderedLabelHeight(option, theme) + chartConst.TITLE_PADDING
        };
    },

    /**
     * To make plot dimention
     * @param {{width: number, height: number}} seriesDimension series dimension
     * @returns {{width: number, height: number}} plot dimension
     * @private
     */
    _makePlotDimension: function(seriesDimension) {
        return {
            width: seriesDimension.width + chartConst.HIDDEN_WIDTH,
            height: seriesDimension.height + chartConst.HIDDEN_WIDTH
        };
    },

    /**
     * Get components dimension
     * @memberOf module:boundsMaker
     * @param {object} params parameters
     *      @param {object} params.convertedData converted data
     *      @param {object} params.theme chart theme
     *      @param {boolean} params.isVertical whether vertical or not
     *      @param {object} params.options chart options
     *      @param {object} params.axesLabelInfo axes label info
     * @returns {Object} components dimensions
     * @private
     */
    _getComponentsDimensions: function(params) {
        var chartOptions = params.options.chart || {},
            chartDimension = this._makeChartDimension(chartOptions),
            titleDimension = this._makeTitleDimension(chartOptions.title, params.theme.title),
            axesDimension = this._makeAxesDimension(params),
            legendDimension = this._makeLegendDimension(params.convertedData.joinLegendLabels, params.theme.legend.label, params.chartType, params.options.series),
            seriesDimension = this._makeSeriesDimension({
                chartDimension: chartDimension,
                axesDimension: axesDimension,
                legendWidth: legendDimension.width,
                titleHeight: titleDimension.height
            });

        return tui.util.extend({
            chart: chartDimension,
            title: titleDimension,
            series: seriesDimension,
            plot: this._makePlotDimension(seriesDimension),
            legend: legendDimension
        }, axesDimension);
    },

    /**
     * To make basic bound.
     * @param {{width: number, height: number}} dimension series dimension.
     * @param {number} top top
     * @param {number} left left
     * @returns {{dimension: {width: number, height: number}, position: {top: number, left: number}}} series bound.
     * @private
     */
    _makeBasicBound: function(dimension, top, left) {
        return {
            dimension: dimension,
            position: {
                top: top,
                left: left
            }
        };
    },

    /**
     * To make yAxis bound.
     * @param {{yAxis: {width: number}, plot: {height: number}}} dimensions dimensions
     * @param {number} top top
     * @returns {{dimension: {width: number, height: (number)}, position: {top: number, left: number}}} yAxis bound
     * @private
     */
    _makeYAxisBound: function(dimensions, top) {
        return {
            dimension: {
                width: dimensions.yAxis.width,
                height: dimensions.plot.height
            },
            position: {
                top: top,
                left: this.chartLeftPadding
            }
        };
    },

    /**
     * To make xAxis bound.
     * @param {{xAxis: {height: number}, plot: {width: number}}} dimensions dimensions
     * @param {number} top top
     * @param {number} left left
     * @param {{degree: number}} rotationInfo rotation info
     * @returns {{dimension: {width: number, height: (number)}, position: {top: number, left: number}}} xAxis bound
     * @private
     */
    _makeXAxisBound: function(dimensions, top, left, rotationInfo) {
        var bound = {
            dimension: {
                width: dimensions.plot.width,
                height: dimensions.xAxis.height
            },
            position: {
                top: top + dimensions.series.height,
                left: left - chartConst.HIDDEN_WIDTH
            }
        };

        if (rotationInfo) {
            bound.degree = rotationInfo.degree;
        }

        return bound;
    },

    /**
     * To make yrAxis bound.
     * @param {{yrAxis: {width: number}, plot: {height: number}, legend: {width: number}}} dimensions dimensions
     * @param {number} top top
     * @returns {{dimension: {width: number, height: (number)}, position: {top: number, left: number}}} yrAxis bound
     * @private
     */
    _makeYRAxisBound: function(dimensions, top) {
        return {
            dimension: {
                width: dimensions.yrAxis.width,
                height: dimensions.plot.height
            },
            position: {
                top: top,
                right: dimensions.legend.width + chartConst.HIDDEN_WIDTH + chartConst.CHART_PADDING
            }
        };
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
     *      @param {{degree: number}} params.rotationInfo rotation info
     * @returns {object} axes bounds
     * @private
     */
    _makeAxesBounds: function(params) {
        var bounds;

        // pie차트와 같이 axis 영역이 필요 없는 경우에는 빈 값을 반환 함
        if (!params.hasAxes) {
            return {};
        }

        bounds = {
            plot: this._makeBasicBound(params.dimensions.plot, params.top, params.left - chartConst.HIDDEN_WIDTH),
            yAxis: this._makeYAxisBound(params.dimensions, params.top),
            xAxis: this._makeXAxisBound(params.dimensions, params.top, params.left, params.rotationInfo)
        };

        // 우측 y axis 영역 bounds 정보 추가
        if (params.optionChartTypes && params.optionChartTypes.length) {
            bounds.yrAxis = this._makeYRAxisBound(params.dimensions, params.top);
        }

        return bounds;
    },

    /**
     * To make chart bound.
     * @param {{width: number, height: number}} dimension chart dimension.
     * @returns {{dimension: {width: number, height: number}}} chart bound
     * @private
     */
    _makeChartBound: function(dimension) {
        return {
            dimension: dimension
        };
    },

    /**
     * To make legend bound.
     * @param {{title: {height: number}, series: {width: number}, yrAxis: {width: number}}} dimensions dimensions
     * @param {number} yAxisWidth yAxis width
     * @returns {{position: {top: number, left: number}}} legend bound
     * @private
     */
    _makeLegendBound: function(dimensions) {
        return {
            position: {
                top: dimensions.title.height,
                left: dimensions.yAxis.width + dimensions.series.width + dimensions.yrAxis.width + this.chartLeftPadding
            }
        };
    },

    /**
     * To make axes label info.
     * @param {object} params parameters
     *      @param {boolean} params.hasAxes whether has axes or not
     *      @param {array} params.optionChartTypes chart types
     *      @param {object} convertedData converted data
     *      @param {boolean} isVertical whether vertical or not
     * @returns {{xAxis: array, yAxis: array}} label info
     * @private
     */
    _makeAxesLabelInfo: function(params) {
        var chartType, maxValueLabel, yLabels, xLabels;

        if (!params.hasAxes) {
            return null;
        }

        chartType = params.optionChartTypes && params.optionChartTypes[0] || '';

        // value 중 가장 큰 값을 추출하여 value label로 지정 (lable 너비 체크 시 사용)
        maxValueLabel = this._getValueAxisMaxLabel(params.convertedData, chartType);

        // 세로옵션에 따라서 x축과 y축에 적용할 레이블 정보 지정
        if (params.isVertical) {
            yLabels = [maxValueLabel];
            xLabels = params.convertedData.labels;
        } else {
            yLabels = params.convertedData.labels;
            xLabels = [maxValueLabel];
        }

        return {
            xAxis: xLabels,
            yAxis: yLabels
        };
    },

    /**
     * Find rotation degree.
     * @param {number} limitWidth limit width
     * @param {number} labelWidth label width
     * @param {number} labelHeight label height
     * @param {number} index candidates index
     * @returns {number} rotation degree
     * @private
     */
    _findRotationDegree: function(limitWidth, labelWidth, labelHeight) {
        var foundDegree,
            halfWidth = labelWidth / 2,
            halfHeight = labelHeight / 2;

        tui.util.forEachArray(chartConst.DEGREE_CANDIDATES, function(degree) {
            var compareWidth = (calculator.calculateAdjacent(degree, halfWidth) + calculator.calculateAdjacent(chartConst.ANGLE_90 - degree, halfHeight)) * 2;
            foundDegree = degree;
            if (compareWidth <= limitWidth + chartConst.XAXIS_LABEL_COMPARE_MARGIN) {
                return false;
            }
        });

        return foundDegree;
    },

    /**
     * To make rotation info about horizontal label.
     * @param {number} seriesWidth series area width
     * @param {array.<string>} labels axis labels
     * @param {object} theme axis label theme
     * @returns {?object} rotation info
     * @private
     */
    _makeHorizontalLabelRotationInfo: function(seriesWidth, labels, theme) {
        var maxLabelWidth = renderUtil.getRenderedLabelsMaxWidth(labels, theme),
            limitWidth = seriesWidth / labels.length - chartConst.XAXIS_LABEL_GUTTER,
            degree, labelHeight;

        if (maxLabelWidth <= limitWidth) {
            return null;
        }

        labelHeight = renderUtil.getRenderedLabelsMaxHeight(labels, theme);
        degree = this._findRotationDegree(limitWidth, maxLabelWidth, labelHeight);

        return {
            maxLabelWidth: maxLabelWidth,
            labelHeight: labelHeight,
            degree: degree
        };
    },

    /**
     * To calculate overflow position left.
     * @param {number} yAxisWidth yAxis width
     * @param {{degree: number, labelHeight: number}} rotationInfo rotation info
     * @param {string} firstLabel firstLabel
     * @param {obejct} theme label theme
     * @returns {number} overflow position left
     * @private
     */
    _calculateOverflowLeft: function(yAxisWidth, rotationInfo, firstLabel, theme) {
        var degree = rotationInfo.degree,
            labelHeight = rotationInfo.labelHeight,
            firstLabelWidth = renderUtil.getRenderedLabelWidth(firstLabel, theme),
            newLabelWidth = (calculator.calculateAdjacent(degree, firstLabelWidth / 2) + calculator.calculateAdjacent(chartConst.ANGLE_90 - degree, labelHeight / 2)) * 2,
            diffLeft = newLabelWidth - yAxisWidth;
        return diffLeft;
    },


    /**
     * To calculate height of xAxis.
     * @param {{degree: number, maxLabelWidth: number, labelHeight: number}} rotationInfo rotation info
     * @returns {number} xAxis height
     * @private
     */
    _calculateXAxisHeight: function(rotationInfo) {
        var degree = rotationInfo.degree,
            maxLabelWidth = rotationInfo.maxLabelWidth,
            labelHeight = rotationInfo.labelHeight,
            axisHeight = (calculator.calculateOpposite(degree, maxLabelWidth / 2) + calculator.calculateOpposite(chartConst.ANGLE_90 - degree, labelHeight / 2)) * 2;
        return axisHeight;
    },

    /**
     * To calculate height difference between origin label and rotation label.
     * @param {{degree: number, maxLabelWidth: number, labelHeight: number}} rotationInfo rotation info
     * @returns {number} height difference
     * @private
     */
    _calculateHeightDifference: function(rotationInfo) {
        var xAxisHeight = this._calculateXAxisHeight(rotationInfo);
        return xAxisHeight - rotationInfo.labelHeight;
    },

    /**
     * Update degree of rotationInfo.
     * @param {number} seriesWidth series width
     * @param {{degree: number, maxLabelWidth: number, labelHeight: number}} rotationInfo rotation info
     * @param {number} labelLength labelLength
     * @param {number} overflowLeft overflow left
     * @private
     */
    _updateDegree: function(seriesWidth, rotationInfo, labelLength, overflowLeft) {
        var limitWidth, newDegree;
        if (overflowLeft > 0) {
            limitWidth = seriesWidth / labelLength + chartConst.XAXIS_LABEL_GUTTER;
            newDegree = this._findRotationDegree(limitWidth, rotationInfo.maxLabelWidth, rotationInfo.labelHeight);
            rotationInfo.degree = newDegree;
        }
    },

    /**
     * Update width of dimentios.
     * @param {{plot: {width: number}, series: {width: number}, xAxis: {width: number}}} dimensions dimensions
     * @param {number} overflowLeft overflow left
     * @private
     */
    _updateDimensionsWidth: function(dimensions, overflowLeft) {
        if (overflowLeft > 0) {
            this.chartLeftPadding += overflowLeft;
            dimensions.plot.width -= overflowLeft;
            dimensions.series.width -= overflowLeft;
            dimensions.xAxis.width -= overflowLeft;
        }
    },

    /**
     * Update height of dimensions.
     * @param {{plot: {height: number}, series: {height: number}, xAxis: {height: number}}} dimensions dimensions
     * @param {number} diffHeight diff height
     * @private
     */
    _updateDimensionsHeight: function(dimensions, diffHeight) {
        dimensions.plot.height -= diffHeight;
        dimensions.series.height -= diffHeight;
        dimensions.xAxis.height += diffHeight;
    },

    /**
     * Update dimensions and degree.
     * @param {{plot: {width: number, height: number}, series: {width: number, height: number}, xAxis: {width: number, height: number}}} dimensions dimensions
     * @param {{degree: number, maxLabelWidth: number, labelHeight: number}} rotationInfo rotation info
     * @param {array} labels labels
     * @param {object} theme theme
     * @private
     */
    _updateDimensionsAndDegree: function(dimensions, rotationInfo, labels, theme) {
        var overflowLeft, diffHeight;
        if (!rotationInfo) {
            return;
        }
        overflowLeft = this._calculateOverflowLeft(dimensions.yAxis.width, rotationInfo, labels[0], theme);
        this._updateDimensionsWidth(dimensions, overflowLeft);
        this._updateDegree(dimensions.series.width, rotationInfo, labels.length, overflowLeft);
        diffHeight = this._calculateHeightDifference(rotationInfo);
        this._updateDimensionsHeight(dimensions, diffHeight);
    },

    /**
     * To make bounds about chart components.
     * @memberOf module:boundsMaker
     * @param {object} params parameters
     *      @param {object} params.convertedData converted data
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
        var axesLabelInfo = this._makeAxesLabelInfo(params),
            dimensions = this._getComponentsDimensions(tui.util.extend({
                axesLabelInfo: axesLabelInfo
            }, params)),
            rotationInfo, top, left, seriesBound, axesBounds, bounds;

        this.chartLeftPadding = chartConst.CHART_PADDING;
        if (params.hasAxes) {
            rotationInfo = this._makeHorizontalLabelRotationInfo(dimensions.series.width, axesLabelInfo.xAxis, params.theme.label);
            this._updateDimensionsAndDegree(dimensions, rotationInfo, axesLabelInfo.xAxis, params.theme.label);
        }

        top = dimensions.title.height + chartConst.CHART_PADDING;
        left = dimensions.yAxis.width + this.chartLeftPadding;
        seriesBound = this._makeBasicBound(dimensions.series, top, left);

        axesBounds = this._makeAxesBounds({
            hasAxes: params.hasAxes,
            rotationInfo: rotationInfo,
            optionChartTypes: params.optionChartTypes,
            dimensions: dimensions,
            top: top,
            left: left
        });
        bounds = tui.util.extend({
            chart: this._makeChartBound(dimensions.chart),
            series: seriesBound,
            legend: this._makeLegendBound(dimensions),
            tooltip: this._makeBasicBound(dimensions.series, top, left - chartConst.SERIES_EXPAND_SIZE),
            eventHandleLayer: seriesBound
        }, axesBounds);
        return bounds;
    }
};

module.exports = boundsMaker;

},{"../const":15,"./calculator":24,"./renderUtil":28}],24:[function(require,module,exports){
/**
 * @fileoverview calculator.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const');

/**
 * Calculator.
 * @module calculator
 */
var calculator = {
    /**
     * To calculate scale from chart min, max data.
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

        tui.util.forEachArray(chartConst.AXIS_STANDARD_MULTIPLE_NUMS, function(num) {
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
            mod = tui.util.mod(value, standard);
            normalized = tui.util.addition(value, (mod > 0 ? standard - mod : 0));
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
            positions = tui.util.map(tui.util.range(0, size, pxStep), function(position) {
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
        var multipleNum = tui.util.findMultipleNum(step),
            min = scale.min * multipleNum,
            max = scale.max * multipleNum,
            labels = tui.util.range(min, max + 1, step * multipleNum);
        labels = tui.util.map(labels, function(label) {
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
     * To calculate adjacent.
     * @param {number} degree degree
     * @param {number} hypotenuse hypotenuse
     * @returns {number} adjacent
     *
     *   H : Hypotenuse
     *   A : Adjacent
     *   O : Opposite
     *   D : Degree
     *
     *        /|
     *       / |
     *    H /  | O
     *     /   |
     *    /\ D |
     *    -----
     *       A
     */
    calculateAdjacent: function(degree, hypotenuse) {
        return Math.cos(degree * chartConst.RAD) * hypotenuse;
    },

    /**
     * To calculate opposite.
     * @param {number} degree degree
     * @param {number} hypotenuse hypotenuse
     * @returns {number} opposite
     */
    calculateOpposite: function(degree, hypotenuse) {
        return Math.sin(degree * chartConst.RAD) * hypotenuse;
    }
};

module.exports = calculator;

},{"../const":15}],25:[function(require,module,exports){
/**
 * @fileoverview Data converter.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

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
     * @param {array.<string>} seriesChartTypes chart types
     * @returns {{
     *      labels: array.<string>,
     *      values: array.<number>,
     *      legendLabels: array.<string>,
     *      formatFunctions: array.<function>,
     *      formattedValues: array.<string>
     * }} converted data
     */
    convert: function(userData, chartOptions, chartType, seriesChartTypes) {
        var labels = userData.categories,
            seriesData = userData.series,
            values = this._pickValues(seriesData),
            joinValues = this._joinValues(values, seriesChartTypes),
            legendLabels = this._pickLegendLabels(seriesData),
            joinLegendLabels = this._joinLegendLabels(legendLabels, chartType, seriesChartTypes),
            format = chartOptions && chartOptions.format || '',
            formatFunctions = this._findFormatFunctions(format),
            formattedValues = format ? this._formatValues(values, formatFunctions) : values,
            joinFormattedValues = this._joinValues(formattedValues, seriesChartTypes);
        return {
            labels: labels,
            values: values,
            joinValues: joinValues,
            legendLabels: legendLabels,
            joinLegendLabels: joinLegendLabels,
            formatFunctions: formatFunctions,
            formattedValues: formattedValues,
            joinFormattedValues: joinFormattedValues
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
     * @param {{name: string, data: (array.<number> | number)}} items items
     * @returns {array} picked value
     * @private
     */
    _pickValue: function(items) {
        return tui.util.map([].concat(items.data), parseFloat);
    },

    /**
     * Pick values from axis data.
     * @memberOf module:dataConverter
     * @param {array.<array>} seriesData series data
     * @returns {string[]} values
     */
    _pickValues: function(seriesData) {
        var values, result;
        if (tui.util.isArray(seriesData)) {
            values = tui.util.map(seriesData, this._pickValue, this);
            result = tui.util.pivot(values);
        } else {
            result = {};
            tui.util.forEach(seriesData, function(groupValues, type) {
                values = tui.util.map(groupValues, this._pickValue, this);
                result[type] = tui.util.pivot(values);
            }, this);
        }
        return result;
    },

    /**
     * Join values.
     * @memberOf module:dataConverter
     * @param {array.<array>} groupValues values
     * @param {array.<string>} seriesChartTypes chart types
     * @returns {array.<number>} join values
     * @private
     */
    _joinValues: function(groupValues, seriesChartTypes) {
        var joinValues;

        if (!seriesChartTypes) {
            return groupValues;
        }

        joinValues = tui.util.map(groupValues, function(values) {
            return values;
        }, this);

        joinValues = [];
        tui.util.forEachArray(seriesChartTypes, function(_chartType) {
            tui.util.forEach(groupValues[_chartType], function(values, index) {
                if (!joinValues[index]) {
                    joinValues[index] = [];
                }
                joinValues[index] = joinValues[index].concat(values);
            });
        });

        return joinValues;
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
        if (tui.util.isArray(seriesData)) {
            result = tui.util.map(seriesData, this._pickLegendLabel, this);
        } else {
            result = {};
            tui.util.forEach(seriesData, function(groupValues, type) {
                result[type] = tui.util.map(groupValues, this._pickLegendLabel, this);
            }, this);
        }
        return result;
    },

    /**
     * Join legend labels.
     * @memberOf module:dataConverter
     * @param {array} legendLabels legend labels
     * @param {string} chartType chart type
     * @param {array.<string>} seriesChartTypes chart types
     * @returns {array} labels
     * @private
     */
    _joinLegendLabels: function(legendLabels, chartType, seriesChartTypes) {
        var joinLabels;
        if (!seriesChartTypes || !seriesChartTypes.length) {
            joinLabels = tui.util.map(legendLabels, function(label) {
                return {
                    chartType: chartType,
                    label: label
                };
            });
        } else {
            joinLabels = [];
            tui.util.forEachArray(seriesChartTypes, function(_chartType) {
                var labels = tui.util.map(legendLabels[_chartType], function(label) {
                    return {
                        chartType: _chartType,
                        label: label
                    };
                });
                joinLabels = joinLabels.concat(labels);
            });
        }
        return joinLabels;
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
        return tui.util.map(groupValues, function(values) {
            return tui.util.map(values, function(value) {
                var fns = [value].concat(formatFunctions);
                return tui.util.reduce(fns, function(stored, fn) {
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
        if (tui.util.isArray(chartValues)) {
            result = this._formatGroupValues(chartValues, formatFunctions);
        } else {
            result = {};
            tui.util.forEach(chartValues, function(groupValues, chartType) {
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

        tui.util.forEachArray(values, function(value) {
            var len = tui.util.lengthAfterPoint(value);
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
            values, lastIndex;

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
        lastIndex = values.length - 1;
        values = tui.util.map(values, function(char, index) {
            var result = [char];
            if (index < lastIndex && (index + 1) % 3 === 0) {
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
            funcs = [tui.util.bind(this._formatDecimal, this, len)];
        } else if (this._isZeroFill(format)) {
            len = format.length;
            funcs = [tui.util.bind(this._formatZeroFill, this, len)];
            return funcs;
        }

        if (this._isComma(format)) {
            funcs.push(this._formatComma);
        }

        return funcs;
    }
};

module.exports = dataConverter;

},{}],26:[function(require,module,exports){
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
            index = tui.util.inArray(newClass, classNames);

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
            index = tui.util.inArray(rmClass, classNames);

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
            index = tui.util.inArray(findClass, classNames);
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
        children = tui.util.isArray(children) ? children : [children];

        tui.util.forEachArray(children, function(child) {
            if (!child) {
                return;
            }
            container.appendChild(child);
        }, this);
    }
};

module.exports = domHandler;

},{}],27:[function(require,module,exports){
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

},{}],28:[function(require,module,exports){
/**
 * @fileoverview Util for rendering.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var dom = require('./domHandler'),
    chartConst = require('./../const');

var browser = tui.util.browser,
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

        elDiv = dom.create('DIV', 'tui-chart-size-check-element');
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

        if (tui.util.isUndefined(label) || label === '') {
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
     * Get Rendered Labels Max Size(width or height).
     * @memberOf module:boundsMaker
     * @param {string[]} labels labels
     * @param {{fontSize: number, fontFamily: string, color: string}} theme label theme
     * @param {function} iteratee iteratee
     * @returns {number} max size (width or height)
     * @private
     */
    _getRenderedLabelsMaxSize: function(labels, theme, iteratee) {
        var sizes = tui.util.map(labels, function(label) {
                return iteratee(label, theme);
            }, this),
            maxSize = tui.util.max(sizes);
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
    getRenderedLabelsMaxWidth: function(labels, theme) {
        var iteratee = tui.util.bind(this.getRenderedLabelWidth, this),
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
    getRenderedLabelsMaxHeight: function(labels, theme) {
        var iteratee = tui.util.bind(this.getRenderedLabelHeight, this),
            maxHeight = this._getRenderedLabelsMaxSize(labels, theme, iteratee);
        return maxHeight;
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
        if (tui.util.isUndefined(position)) {
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

},{"./../const":15,"./domHandler":26}],29:[function(require,module,exports){
/**
 * @fileoverview chart state.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const');

/**
 * state.
 * @module state
 */
var state = {
    /**
     * Whether line type chart or not.
     * @param {string} chartType chart type
     * @returns {boolean} result boolean
     */
    isLineTypeChart: function(chartType) {
        return chartType === chartConst.CHART_TYPE_LINE || chartType === chartConst.CHART_TYPE_AREA;
    }
};

module.exports = state;

},{"../const":15}],30:[function(require,module,exports){
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
            tui.util.forEach(data, function (value, key) {
                var regExp = new RegExp('{{\\s*' + key + '\\s*}}', 'g');
                result = result.replace(regExp, value);
            });
            return result;
        };
    }
};

},{}],31:[function(require,module,exports){
/**
 * @fileoverview  Legend component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    dom = require('../helpers/domHandler'),
    renderUtil = require('../helpers/renderUtil'),
    defaultTheme = require('../themes/defaultTheme'),
    legendTemplate = require('./../legends/legendTemplate');

var Legend = tui.util.defineClass(/** @lends Legend.prototype */ {
    /**
     * Legend component.
     * @constructs Legend
     * @param {object} params parameters
     *      @param {number} params.legendLabels legend labels
     *      @param {object} params.bound axis bound
     *      @param {object} params.theme axis theme
     */
    init: function(params) {
        tui.util.extend(this, params);
        /**
         * Legend view className
         */
        this.className = 'tui-chart-legend-area';
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
        var result = tui.util.map(labels, function(item, index) {
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
            chartLegendTheme = tui.util.filter(theme, function(item, name) {
                return tui.util.inArray(name, chartConst.SERIES_PROPS) === -1 && name !== 'label';
            }),
            chartTypes = tui.util.keys(chartLegendTheme),
            defaultLegendTheme = {
                colors: defaultTheme.series.colors
            },
            chartTheme, result;

        if (!chartTypes.length) {
            result = this._setThemeForLabels(joinLegendLabels, theme);
        } else {
            chartTheme = theme[chartType] || defaultLegendTheme;
            result = this._setThemeForLabels(joinLegendLabels.slice(0, labelLen), chartTheme);
            chartTheme = theme[tui.util.filter(chartTypes, function(propName) {
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
            labelHeight = renderUtil.getRenderedLabelHeight(labels[0].label, labels[0].theme) + (chartConst.LABEL_PADDING_TOP * 2),
            baseMarginTop = parseInt((labelHeight - chartConst.LEGEND_RECT_WIDTH) / 2, 10) - 1,
            html = tui.util.map(labels, function(label) {
                var borderCssText = label.borderColor ? renderUtil.concatStr(';border:1px solid ', label.borderColor) : '',
                    rectMargin, marginTop, data;
                if (label.chartType === 'line') {
                    marginTop = baseMarginTop + chartConst.LINE_MARGIN_TOP;
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

},{"../const":15,"../helpers/domHandler":26,"../helpers/renderUtil":28,"../themes/defaultTheme":53,"./../legends/legendTemplate":32}],32:[function(require,module,exports){
/**
 * @fileoverview This is templates of legend view.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

var templateMaker = require('../helpers/templateMaker');

var tags = {
    HTML_LEGEND: '<div class="tui-chart-legend">' +
        '<div class="tui-chart-legend-rect {{ chartType }}" style="{{ cssText }}"></div>' +
        '<div class="tui-chart-legend-label" style="height:{{ height }}px">{{ label }}</div></div>'
};

module.exports = {
    tplLegend: templateMaker.template(tags.HTML_LEGEND)
};

},{"../helpers/templateMaker":30}],33:[function(require,module,exports){
/**
 * @fileoverview Plot component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var dom = require('../helpers/domHandler'),
    calculator = require('../helpers/calculator'),
    renderUtil = require('../helpers/renderUtil'),
    plotTemplate = require('./plotTemplate');

var Plot = tui.util.defineClass(/** @lends Plot.prototype */ {
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
        tui.util.extend(this, params);
        /**
         * Plot view className
         * @type {string}
         */
        this.className = 'tui-chart-plot-area';
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
            lineHtml = tui.util.map(params.positions, function(position) {
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

},{"../helpers/calculator":24,"../helpers/domHandler":26,"../helpers/renderUtil":28,"./plotTemplate":34}],34:[function(require,module,exports){
/**
 * @fileoverview This is templates of plot view .
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

var templateMaker = require('../helpers/templateMaker');

var tags = {
    HTML_PLOT_LINE: '<div class="tui-chart-plot-line {{ className }}" style="{{ cssText }}"></div>'
};

module.exports = {
    tplPlotLine: templateMaker.template(tags.HTML_PLOT_LINE)
};

},{"../helpers/templateMaker":30}],35:[function(require,module,exports){
/**
 * @fileoverview Raphael render plugin.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var BarChart = require('./raphaelBarChart'),
    LineChart = require('./raphaelLineChart'),
    AreaChart = require('./raphaelAreaChart'),
    PieChart = require('./raphaelPieChart');

var pluginName = 'raphael',
    pluginRaphael;

pluginRaphael = {
    bar: BarChart,
    column: BarChart,
    line: LineChart,
    area: AreaChart,
    pie: PieChart
};

tui.chart.registerPlugin(pluginName, pluginRaphael);

},{"./raphaelAreaChart":36,"./raphaelBarChart":37,"./raphaelLineChart":38,"./raphaelPieChart":40}],36:[function(require,module,exports){
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
var RaphaelAreaChart = tui.util.defineClass(RaphaelLineBase, /** @lends RaphaelAreaChart.prototype */ {
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
            groupAreas, tooltipLine, groupDots;

        if (!paper) {
            paper = Raphael(container, dimension.width, dimension.height);
        }

        groupAreas = this._renderAreas(paper, groupPaths, colors);
        tooltipLine = this._renderTooltipLine(paper, dimension.height);
        groupDots = this.renderDots(paper, groupPositions, colors, borderStyle);

        this.outDotStyle = outDotStyle;
        this.groupPaths = groupPaths;
        this.groupAreas = groupAreas;
        this.tooltipLine = tooltipLine;
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
        var groupAreas = tui.util.map(groupPaths, function(paths, groupIndex) {
            var color = colors[groupIndex] || 'transparent';
            return tui.util.map(paths, function(path) {
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

        if (tui.util.all(tops, this._isMinus) || tui.util.all(tops, this._isPlus)) {
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
        var groupPaths = tui.util.map(groupPositions, function(positions) {
            var fromPos = positions[0],
                rest = positions.slice(1);
            return tui.util.map(rest, function(position) {
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
        tui.util.forEachArray(this.groupDots, function(dots, groupIndex) {
            startTime = 0;
            tui.util.forEachArray(dots, function(dot, index) {
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

},{"./raphaelLineTypeBase":39,"./raphaelRenderUtil":41}],37:[function(require,module,exports){
/**
 * @fileoverview Raphael bar chart renderer.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';
var raphaelRenderUtil = require('./raphaelRenderUtil');

var Raphael = window.Raphael;

var ANIMATION_TIME = 700;

/**
 * @classdesc RaphaelBarChart is graph renderer for bar, column chart.
 * @class RaphaelBarChart
 */
var RaphaelBarChart = tui.util.defineClass(/** @lends RaphaelBarChart.prototype */ {
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
            dimension = data.dimension,
            baseParams;

        if (!groupBounds) {
            return null;
        }

        if (!paper) {
            paper = Raphael(container, dimension.width, dimension.height);
        }

        baseParams = {
            paper: paper,
            theme: data.theme,
            groupBounds: groupBounds,
            groupValues: data.groupValues,
            chartType: data.chartType
        };

        this._renderBars(tui.util.extend({
            inCallback: inCallback,
            outCallback: outCallback
        }, baseParams));

        this._renderBarBorders(baseParams);

        this.chartType = data.chartType;

        return paper;
    },

    /**
     * Render rect
     * @param {object} params parameters
     *      @param {object} params.paper raphael paper
     *      @param {string} params.color series color
     *      @param {string} params.borderColor series borderColor
     *      @param {{left: number, top: number, width: number, height: number}} params.bound bound
     * @returns {object} bar rect
     * @private
     */
    _renderBar: function(params) {
        var bound = params.bound,
            rect;
        if (bound.width < 0 || bound.height < 0) {
            return null;
        }

        rect = params.paper.rect(bound.left, bound.top, bound.width, bound.height);
        rect.attr({
            fill: params.color,
            stroke: 'none'
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
    _bindHoverEvent: function(rect, bound, groupIndex, index, inCallback, outCallback) {
        rect.hover(function() {
            inCallback(bound, groupIndex, index);
        }, function() {
            outCallback();
        });
    },

    /**
     * Render bars.
     * @param {object} params parameters
     *      @param {object} params.paper raphael paper
     *      @param {{colors: string[], singleColors: string[], borderColor: string}} params.theme bar chart theme
     *      @param {array.<array.<{left: number, top:number, width: number, height: number}>>} params.groupBounds bounds
     *      @param {function} params.inCallback in callback
     *      @param {function} params.outCallback out callback
     * @private
     */
    _renderBars: function(params) {
        var singleColors = (params.groupBounds[0].length === 1) && params.theme.singleColors || [],
            colors = params.theme.colors,
            bars = [];
        tui.util.forEachArray(params.groupBounds, function(bounds, groupIndex) {
            var singleColor = singleColors[groupIndex];
            tui.util.forEachArray(bounds, function(bound, index) {
                var color, id, rect, value;

                if (!bound) {
                    return;
                }

                color = singleColor || colors[index];
                id = groupIndex + '-' + index;
                value = params.groupValues[groupIndex][index];
                rect = this._renderBar({
                    paper: params.paper,
                    chartType: params.chartType,
                    color: color,
                    borderColor: params.theme.borderColor,
                    bound: bound.start,
                    value: value
                });

                if (rect) {
                    this._bindHoverEvent(rect, bound.end, groupIndex, index, params.inCallback, params.outCallback);
                }

                bars.push({
                    rect: rect,
                    bound: bound.end,
                    value: value
                });
            }, this);
        }, this);

        this.bars = bars;
    },

    /**
     * To make rect points.
     * @param {{left: number, top:number, width: number, height: number}} bound rect bound
     * @returns {{
     *      leftTop: {left: number, top: number},
     *      rightTop: {left: number, top: number},
     *      rightBottom: {left: number, top: number},
     *      leftBottom: {left: number, top: number}
     * }} rect points
     * @private
     */
    _makeRectPoints: function(bound) {
        return {
            leftTop: {
                left: Math.ceil(bound.left),
                top: Math.ceil(bound.top)
            },
            rightTop: {
                left: Math.ceil(bound.left + bound.width),
                top: Math.ceil(bound.top)
            },
            rightBottom: {
                left: Math.ceil(bound.left + bound.width),
                top: Math.ceil(bound.top + bound.height)
            },
            leftBottom: {
                left: Math.ceil(bound.left),
                top: Math.ceil(bound.top + bound.height)
            }
        };
    },

    /**
     * To make top line path.
     * @param {{left: numbrer, top: number}} leftTop left top
     * @param {{left: numbrer, top: number}} rightTop right top
     * @param {string} chartType chart type
     * @param {number} value value
     * @returns {string} top line path
     * @private
     */
    _makeTopLinePath: function(leftTop, rightTop, chartType, value) {
        var cloneLeftTop = tui.util.extend({}, leftTop);
        cloneLeftTop.left -= chartType === 'column' || value < 0 ? 1 : 0;
        return raphaelRenderUtil.makeLinePath(cloneLeftTop, rightTop);
    },

    /**
     * To make border lines paths.
     * @param {{left: number, top:number, width: number, height: number}} bound rect bound
     * @param {string} chartType chart type
     * @param {number} value value
     * @returns {{top: string, right: string, bottom: string, left: string}} paths
     * @private
     */
    _makeBorderLinesPaths: function(bound, chartType, value) {
        var points = this._makeRectPoints(bound),
            paths = {};

        if (chartType === 'bar' || value >= 0) {
            paths.top = this._makeTopLinePath(points.leftTop, points.rightTop, chartType, value);
        }

        if (chartType === 'column' || value >= 0) {
            paths.right = raphaelRenderUtil.makeLinePath(points.rightTop, points.rightBottom);
        }

        if (chartType === 'bar' || value < 0) {
            paths.bottom = raphaelRenderUtil.makeLinePath(points.leftBottom, points.rightBottom);
        }

        if (chartType === 'column' || value < 0) {
            paths.left = raphaelRenderUtil.makeLinePath(points.leftTop, points.leftBottom);
        }

        return paths;
    },

    /**
     * Render border lines;
     * @param {object} params parameters
     *      @param {object} params.paper paper
     *      @param {{left: number, top:number, width: number, height: number}} params.bound bar bound
     *      @param {string} params.borderColor border color
     *      @param {string} params.chartType chart type
     *      @param {number} params.value value
     * @returns {object} raphael object
     * @private
     */
    _renderBorderLines: function(params) {
        var borderLinePaths = this._makeBorderLinesPaths(params.bound, params.chartType, params.value),
            lines = {};
        tui.util.forEach(borderLinePaths, function(path, name) {
            lines[name] = raphaelRenderUtil.renderLine(params.paper, path, params.borderColor, 1);
        });
        return lines;
    },

    /**
     * Render bar borders.
     * @param {object} params parameters
     *      @param {object} params.paper raphael paper
     *      @param {{colors: string[], singleColors: string[], borderColor: string}} params.theme bar chart theme
     *      @param {array.<array.<{left: number, top:number, width: number, height: number}>>} params.groupBounds bounds
     * @private
     */
    _renderBarBorders: function(params) {
        var borderColor = params.theme.borderColor,
            borders = [];

        this.borders = borders;

        if (!borderColor) {
            return;
        }

        tui.util.forEachArray(params.groupBounds, function(bounds, groupIndex) {
            tui.util.forEachArray(bounds, function(bound, index) {
                var value, borderLines;

                if (!bound) {
                    return;
                }

                value = params.groupValues[groupIndex][index];
                borderLines = this._renderBorderLines({
                    paper: params.paper,
                    bound: bound.start,
                    borderColor: borderColor,
                    chartType: params.chartType,
                    value: value
                });
                borders.push(borderLines);
            }, this);
        }, this);
    },

    /**
     * Animate rect.
     * @param {object} rect raphael object
     * @param {{left: number, top:number, width: number, height: number}} bound rect bound
     * @private
     */
    _animateRect: function(rect, bound) {
        rect.animate({
            x: bound.left,
            y: bound.top,
            width: bound.width,
            height: bound.height
        }, ANIMATION_TIME);
    },

    /**
     * Animate borders.
     * @param {array.<object>} lines raphael objects
     * @param {{left: number, top:number, width: number, height: number}} bound rect bound
     * @param {string} chartType chart type
     * @param {number} value value
     * @private
     */
    _animateBorders: function(lines, bound, chartType, value) {
        var paths = this._makeBorderLinesPaths(bound, chartType, value);
        tui.util.forEach(lines, function(line, name) {
            line.animate({path: paths[name]}, ANIMATION_TIME);
        });
    },

    /**
     * Animate.
     * @param {function} callback callback
     */
    animate: function(callback) {
        tui.util.forEach(this.bars, function(bar, index) {
            var lines = this.borders[index];
            this._animateRect(bar.rect, bar.bound);
            if (lines) {
                this._animateBorders(lines, bar.bound, this.chartType, bar.value);
            }
        }, this);

        if (callback) {
            setTimeout(callback, ANIMATION_TIME);
        }
    }
});

module.exports = RaphaelBarChart;

},{"./raphaelRenderUtil":41}],38:[function(require,module,exports){
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
var RaphaelLineChart = tui.util.defineClass(RaphaelLineBase, /** @lends RaphaelLineChart.prototype */ {
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
            groupLines, tooltipLine, groupDots;

        if (!paper) {
            paper = Raphael(container, dimension.width, dimension.height);
        }

        groupLines = this._renderLines(paper, groupPaths, colors);
        tooltipLine = this._renderTooltipLine(paper, dimension.height);
        groupDots = this.renderDots(paper, groupPositions, colors, borderStyle);

        this.borderStyle = borderStyle;
        this.outDotStyle = outDotStyle;
        this.groupPaths = groupPaths;
        this.groupLines = groupLines;
        this.tooltipLine = tooltipLine;
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
        var groupPaths = tui.util.map(groupPositions, function(positions) {
            var fromPos = positions[0],
                rest = positions.slice(1);
            return tui.util.map(rest, function(position) {
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
        var groupLines = tui.util.map(groupPaths, function(paths, groupIndex) {
            var color = colors[groupIndex] || 'transparent';
            return tui.util.map(paths, function(path) {
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
            borderStyle = this.borderStyle,
            opacity = this.dotOpacity,
            time = ANIMATION_TIME / groupLines[0].length,
            startTime;
        tui.util.forEachArray(this.groupDots, function(dots, groupIndex) {
            startTime = 0;
            tui.util.forEachArray(dots, function(dot, index) {
                var line, path;
                if (index) {
                    line = groupLines[groupIndex][index - 1];
                    path = groupPaths[groupIndex][index - 1].end;
                    this.animateLine(line, path, time, startTime);
                    startTime += time;
                }

                if (opacity) {
                    setTimeout(function() {
                        dot.attr(tui.util.extend({'fill-opacity': opacity}, borderStyle));
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

},{"./raphaelLineTypeBase":39,"./raphaelRenderUtil":41}],39:[function(require,module,exports){
/**
 * @fileoverview RaphaelLineTypeBase is base class for line type renderer.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var raphaelRenderUtil = require('./raphaelRenderUtil');

var DEFAULT_DOT_WIDTH = 3,
    HOVER_DOT_WIDTH = 4;

/**
 * @classdesc RaphaelLineTypeBase is base for line type renderer.
 * @class RaphaelLineTypeBase
 */
var RaphaelLineTypeBase = tui.util.defineClass(/** @lends RaphaelLineTypeBase.prototype */ {
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
     * Render tooltip line.
     * @param {object} paper raphael paper
     * @param {number} height height
     * @returns {object} raphael object
     * @private
     */
    _renderTooltipLine: function(paper, height) {
        var linePath = raphaelRenderUtil.makeLinePath({
                left: 10,
                top: height
            }, {
                left: 10,
                top: 0
            });
        return raphaelRenderUtil.renderLine(paper, linePath, 'transparent', 1);
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
            r: DEFAULT_DOT_WIDTH
        };

        if (borderStyle) {
            tui.util.extend(outDotStyle, borderStyle);
        }

        return outDotStyle;
    },

    /**
     * Render dot.
     * @param {object} paper raphael papaer
     * @param {{left: number, top: number}} position dot position
     * @param {string} color dot color
     * @param {object} borderStyle border style
     * @returns {object} raphael dot
     */
    renderDot: function(paper, position, color) {
        var dot = paper.circle(position.left, position.top, DEFAULT_DOT_WIDTH),
            dotStyle = {
                fill: color,
                'fill-opacity': 0,
                'stroke-opacity': 0
            };

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
    renderDots: function(paper, groupPositions, colors) {
        var dots = tui.util.map(groupPositions, function(positions, groupIndex) {
            var color = colors[groupIndex];
            return tui.util.map(positions, function(position) {
                var dot = this.renderDot(paper, position, color);
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
     * @param {object} dot raphael obejct
     * @param {{left: number, top: number}} position position
     * @param {number} groupIndex group index
     * @param {number} index index
     * @param {function} inCallback in callback
     * @param {function} outCallback out callback
     * @private
     */
    _bindHoverEvent: function(dot, position, groupIndex, index, inCallback, outCallback) {
        dot.hover(function() {
            inCallback(position, index, groupIndex);
        }, function() {
            outCallback();
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
        tui.util.forEach(groupDots, function(dots, groupIndex) {
            tui.util.forEach(dots, function(dot, index) {
                var position = groupPositions[groupIndex][index];
                this._bindHoverEvent(dot, position, groupIndex, index, inCallback, outCallback);
            }, this);
        }, this);
    },

    /**
     * Show dot.
     * @param {object} dot raphael object
     * @private
     */
    _showDot: function(dot) {
        dot.attr({
            'fill-opacity': 1,
            'stroke-opacity': 0.3,
            'stroke-width': 2,
            r: HOVER_DOT_WIDTH
        });
    },

    /**
     * Show animation.
     * @param {{groupIndex: number, index:number}} data show info
     */
    showAnimation: function(data) {
        var index = data.groupIndex, // Line chart has pivot values.
            groupIndex = data.index,
            dot = this.groupDots[groupIndex][index];
        this._showDot(dot);
    },

    /**
     * Get pivot group dots.
     * @returns {array.<array>} dots
     * @private
     */
    _getPivotGroupDots: function() {
        if (!this.pivotGroupDots) {
            this.pivotGroupDots = tui.util.pivot(this.groupDots);
        }

        return this.pivotGroupDots;
    },

    /**
     * Show group dots.
     * @param {number} index index
     * @private
     */
    _showGroupDots: function(index) {
        var dots = this._getPivotGroupDots();
        tui.util.forEachArray(dots[index], tui.util.bind(this._showDot, this));
    },

    /**
     * Show tooltip line.
     * @param {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} bound bound
     * @private
     */
    _showTooltipLine: function(bound) {
        var linePath = raphaelRenderUtil.makeLinePath({
            left: bound.position.left,
            top: bound.dimension.height
        }, {
            left: bound.position.left,
            top: bound.position.top
        });
        this.tooltipLine.attr({
            path: linePath,
            stroke: '#999',
            'stroke-opacity': 1
        });
    },

    /**
     * Show group animation.
     * @param {number} index index
     * @param {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} bound bound
     */
    showGroupAnimation: function(index, bound) {
        this._showGroupDots(index);
        this._showTooltipLine(bound);
    },

    /**
     * Hide dot.
     * @param {object} dot raphael object
     * @private
     */
    _hideDot: function(dot) {
        dot.attr(this.outDotStyle);
    },

    /**
     * Hide animation.
     * @param {{groupIndex: number, index:number}} data hide info
     */
    hideAnimation: function(data) {
        var index = data.groupIndex, // Line chart has pivot values.
            groupIndex = data.index,
            dot = this.groupDots[groupIndex][index];
        if (dot) {
            this._hideDot(dot);
        }
    },

    /**
     * Hide group dots.
     * @param {number} index index
     * @private
     */
    _hideGroupDots: function(index) {
        var dots = this._getPivotGroupDots();
        tui.util.forEachArray(dots[index], tui.util.bind(this._hideDot, this));
    },

    /**
     * Hide tooltip line.
     * @private
     */
    _hideTooltipLine: function() {
        this.tooltipLine.attr({
            'stroke-opacity': 0
        });
    },

    /**
     * Hide group animation.
     * @param {number} index index
     */
    hideGroupAnimation: function(index) {
        this._hideGroupDots(index);
        this._hideTooltipLine();
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

},{"./raphaelRenderUtil":41}],40:[function(require,module,exports){
/**
 * @fileoverview RaphaelPieCharts is graph renderer for pie chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var raphaelRenderUtil = require('./raphaelRenderUtil');

var Raphael = window.Raphael,
    ANGLE_180 = 180,
    RAD = Math.PI / ANGLE_180,
    ANIMATION_TIME = 500,
    LOADING_ANIMATION_TIME = 700;

/**
 * @classdesc RaphaelPieCharts is graph renderer for pie chart.
 * @class RaphaelPieChart
 */
var RaphaelPieChart = tui.util.defineClass(/** @lends RaphaelPieChart.prototype */ {
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
            paper.customAttributes.sector = tui.util.bind(this._makeSectorPath, this);
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
        var x1 = cx + r * Math.sin(startAngle * RAD), // 원 호의 시작 x 좌표
            y1 = cy - r * Math.cos(startAngle * RAD), // 원 호의 시작 y 좌표
            x2 = cx + r * Math.sin(endAngle * RAD),// 원 호의 종료 x 좌표
            y2 = cy - r * Math.cos(endAngle * RAD), // 원 호의 종료 y 좌표
            largeArcFlag = endAngle - startAngle > ANGLE_180 ? 1 : 0,
            path = ["M", cx, cy,
                "L", x1, y1,
                "A", r, r, 0, largeArcFlag, 1, x2, y2,
                "Z"
            ];
        // path에 대한 자세한 설명은 아래 링크를 참고
        // http://www.w3schools.com/svg/svg_path.asp
        // https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d
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

        tui.util.forEachArray(data.sectorsInfo, function(sectorInfo, index) {
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
                index: index,
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
            legendLines = tui.util.map(paths, function(path) {
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
        var paths = tui.util.map(outerPositions, function(positions) {
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
        var throttled = tui.util.throttle(function(e) {
            if (!e) {
                return;
            }
            params.inCallback(params.position, 0, params.index, {
                clientX: e.clientX,
                clientY: e.clientY
            });
        }, 100);
        params.target.mouseover(function (e) {
            params.inCallback(params.position, 0, params.index, {
                clientX: e.clientX,
                clientY: e.clientY
            });
        }).mousemove(throttled).mouseout(function () {
            params.outCallback();
        });
    },

    /**
     * To expand selector radius.
     * @param {object} sector pie sector
     */
    _expandSector: function(sector) {
        var cx = this.circleBound.cx,
            cy = this.circleBound.cy;
        sector.animate({
            transform: "s1.1 1.1 " + cx + " " + cy
        }, ANIMATION_TIME, "elastic");
    },

    /**
     * To restore selector radius.
     * @param {object} sector pie sector
     */
    _restoreSector: function(sector) {
        sector.animate({transform: ""}, ANIMATION_TIME, "elastic");
    },

    /**
     * Show animation.
     * @param {{index: number}} data data
     */
    showAnimation: function(data) {
        var sector = this.sectors[data.index].sector;
        this._expandSector(sector);
    },

    /**
     * Hide animation.
     * @param {{index: number}} data data
     */
    hideAnimation: function(data) {
        var sector = this.sectors[data.index].sector;
        this._restoreSector(sector);
    },

    /**
     * Animate.
     * @param {function} callback callback
     */
    animate: function(callback) {
        var delayTime = 0,
            circleBound = this.circleBound;
        tui.util.forEachArray(this.sectors, function(item) {
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
        tui.util.forEachArray(this.legendLines, function(line) {
            line.animate({
                'stroke': 'black',
                'stroke-opacity': 1
            });
        });
    }
});

module.exports = RaphaelPieChart;

},{"./raphaelRenderUtil":41}],41:[function(require,module,exports){
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

        tui.util.forEachArray(fromPoint, function(from, index) {
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

},{}],42:[function(require,module,exports){
'use strict';

var chartConst = require('./const'),
    chartFactory = require('./factories/chartFactory'),
    BarChart = require('./charts/barChart'),
    ColumnChart = require('./charts/columnChart'),
    LineChart = require('./charts/lineChart'),
    AreaChart = require('./charts/areaChart'),
    ComboChart = require('./charts/comboChart'),
    PieChart = require('./charts/pieChart');

chartFactory.register(chartConst.CHART_TYPE_BAR, BarChart);
chartFactory.register(chartConst.CHART_TYPE_COLUMN, ColumnChart);
chartFactory.register(chartConst.CHART_TYPE_LINE, LineChart);
chartFactory.register(chartConst.CHART_TYPE_AREA, AreaChart);
chartFactory.register(chartConst.CHART_TYPE_COMBO, ComboChart);
chartFactory.register(chartConst.CHART_TYPE_PIE, PieChart);

},{"./charts/areaChart":4,"./charts/barChart":6,"./charts/columnChart":8,"./charts/comboChart":9,"./charts/lineChart":10,"./charts/pieChart":12,"./const":15,"./factories/chartFactory":19}],43:[function(require,module,exports){
'use strict';

var chartConst = require('./const'),
    themeFactory = require('./factories/themeFactory'),
    defaultTheme = require('./themes/defaultTheme');

themeFactory.register(chartConst.DEFAULT_THEME_NAME, defaultTheme);

},{"./const":15,"./factories/themeFactory":21,"./themes/defaultTheme":53}],44:[function(require,module,exports){
/**
 * @fileoverview Area chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series'),
    LineTypeSeriesBase = require('./lineTypeSeriesBase');

var AreaChartSeries = tui.util.defineClass(Series, /** @lends AreaChartSeries.prototype */ {
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
     * To make series data.
     * @returns {object} add data
     */
    makeSeriesData: function() {
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

},{"./lineTypeSeriesBase":49,"./series":51}],45:[function(require,module,exports){
/**
 * @fileoverview Bar chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series'),
    BarTypeSeriesBase = require('./barTypeSeriesBase'),
    chartConst = require('../const'),
    renderUtil = require('../helpers/renderUtil');

var BarChartSeries = tui.util.defineClass(Series, /** @lends BarChartSeries.prototype */ {
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
     * To make bound of bar chart.
     * @param {object} params parameters
     *      @param {{top: number, height: number}} params.baseBound base bound
     *      @param {number} params.startLeft start left
     *      @param {number} params.endLeft end left
     *      @param {number} params.endWidth end width
     * @returns {{
     *      start: {left: number, top: number, width: number, height: number},
     *      end: {left: number, top: number, width: number, height: number}
     * }} column chart bound
     * @private
     */
    _makeBarChartBound: function(params) {
        return {
            start: tui.util.extend({
                left: params.startLeft,
                width: 0
            }, params.baseBound),
            end: tui.util.extend({
                left: params.endLeft,
                width: params.endWidth
            }, params.baseBound)
        };
    },

    /**
     * To make normal bar chart bound.
     * @param {{
     *      dimension: {width: number, height: number},
     *      groupValues: array.<array.<number>>,
     *      groupSize: number, barPadding: number, barSize: number, step: number,
     *      distanceToMin: number, isMinus: boolean
     * }} baseInfo base info
     * @param {number} value value
     * @param {number} paddingTop padding top
     * @param {number} index index
     * @returns {{
     *      start: {left: number, top: number, width: number, height: number},
     *      end: {left: number, top: number, width: number, height: number}
     * }} column chart bound
     * @private
     */
    _makeNormalBarChartBound: function(baseInfo, value, paddingTop, index) {
        var startLeft, endWidth, bound, baseBound;

        startLeft = baseInfo.distanceToMin + chartConst.SERIES_EXPAND_SIZE;
        endWidth = Math.abs(value * baseInfo.dimension.width);
        baseBound = {
            top: paddingTop + ((baseInfo.step) * index),
            height: baseInfo.barSize
        };
        bound = this._makeBarChartBound({
            baseBound: baseBound,
            startLeft: startLeft,
            endLeft: startLeft + (value < 0 ? -endWidth : 0),
            endWidth: endWidth
        });

        return bound;
    },

    /**
     * To make bounds of normal bar chart.
     * @param {{width: number, height:number}} dimension bar chart dimension
     * @returns {array.<array.<object>>} bounds
     * @private
     */
    _makeNormalBarChartBounds: function(dimension) {
        var baseInfo = this.makeBaseInfoForNormalChartBounds(dimension, 'width', 'height'),
            bounds;

        bounds = tui.util.map(baseInfo.groupValues, function(values, groupIndex) {
            var paddingTop = (baseInfo.groupSize * groupIndex) + (baseInfo.barSize / 2);
            return tui.util.map(values, function (value, index) {
                return this._makeNormalBarChartBound(baseInfo, value, paddingTop, index);
            }, this);
        }, this);

        return bounds;
    },

    /**
     * To make bounds of stacked bar chart.
     * @param {{width: number, height:number}} dimension bar chart dimension
     * @returns {array.<array.<object>>} bounds
     * @private
     */
    _makeStackedBarChartBounds: function(dimension) {
        var groupValues, groupHeight, barHeight, bounds;
        groupValues = this.percentValues;
        groupHeight = (dimension.height / groupValues.length);
        barHeight = groupHeight / 2;
        bounds = tui.util.map(groupValues, function (values, groupIndex) {
            var paddingTop = (groupHeight * groupIndex) + (barHeight / 2),
                endLeft = chartConst.SERIES_EXPAND_SIZE;
            return tui.util.map(values, function (value) {
                var endWidth, baseBound, bound;

                if (value < 0) {
                    return null;
                }

                endWidth = value * dimension.width;
                baseBound = {
                    top: paddingTop,
                    height: barHeight
                };
                bound = this._makeBarChartBound({
                    baseBound: baseBound,
                    startLeft: chartConst.SERIES_EXPAND_SIZE,
                    endLeft: endLeft,
                    endWidth: endWidth
                });

                endLeft = endLeft + endWidth;
                return bound;
            }, this);
        }, this);
        return bounds;
    },


    /**
     * To make bounds of bar chart.
     * @param {{width: number, height:number}} dimension bar chart dimension
     * @returns {array.<array.<object>>} bounds
     * @private
     */
    _makeBounds: function(dimension) {
        if (!this.options.stacked) {
            return this._makeNormalBarChartBounds(dimension);
        } else {
            return this._makeStackedBarChartBounds(dimension);
        }
    },

    /**
     * To make series rendering position
     * @param {obeject} params parameters
     *      @param {number} params.value value
     *      @param {{left: number, top: number, width:number, height: number}} params.bound bound
     *      @param {string} params.formattedValue formatted value
     *      @param {number} params.labelHeight label height
     * @returns {{left: number, top: number}} rendering position
     */
    makeSeriesRenderingPosition: function(params) {
        var labelWidth = renderUtil.getRenderedLabelWidth(params.formattedValue, this.theme.label),
            bound = params.bound,
            left = bound.left,
            top = bound.top + (bound.height - params.labelHeight + chartConst.TEXT_PADDING) / 2;

        if (params.value >= 0) {
            left += bound.width + chartConst.SERIES_LABEL_PADDING;
        } else {
            left -= labelWidth + chartConst.SERIES_LABEL_PADDING;
        }

        return {
            left: left,
            top: top
        };
    },

    /**
     * To make sum label html.
     * @param {object} params parameters
     *      @param {array.<number>} params.values values
     *      @param {array.<function>} params.formatFunctions formatting functions
     *      @param {{left: number, top: number}} params.bound bound
     *      @param {number} params.labelHeight label height
     * @returns {string} sum label html
     */
    makeSumLabelHtml: function(params) {
        var sum = this.makeSumValues(params.values, params.formatFunctions),
            bound = params.bound,
            labelHeight = renderUtil.getRenderedLabelHeight(sum, this.theme.label),
            top = bound.top + ((bound.height - labelHeight + chartConst.TEXT_PADDING) / 2),
            left = bound.left + bound.width + chartConst.SERIES_LABEL_PADDING;

        return this.makeSeriesLabelHtml({
            left: left,
            top: top
        }, sum, -1, -1);
    }
});

BarTypeSeriesBase.mixin(BarChartSeries);

module.exports = BarChartSeries;

},{"../const":15,"../helpers/renderUtil":28,"./barTypeSeriesBase":46,"./series":51}],46:[function(require,module,exports){
/**
 * @fileoverview Column chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    dom = require('../helpers/domHandler'),
    renderUtil = require('../helpers/renderUtil');

var BarTypeSeriesBase = tui.util.defineClass(/** @lends BarTypeSeriesBase.prototype */ {
    /**
     * To make series data.
     * @returns {object} add data
     */
    makeSeriesData: function() {
        var groupBounds = this._makeBounds(this.bound.dimension);

        this.groupBounds = groupBounds;

        return {
            groupBounds: groupBounds,
            groupValues: this.percentValues
        };
    },

    /**
     * To make bar gutter.
     * @param {number} groupSize bar group size
     * @param {number} itemCount group item count
     * @returns {number} bar gutter
     */
    makeBarGutter: function(groupSize, itemCount) {
        var baseSize = groupSize / (itemCount + 1) / 2,
            gutter;
        if (baseSize <= 2) {
            gutter = 0;
        } else if (baseSize <= 6) {
            gutter = 2;
        } else {
            gutter = 4;
        }
        return gutter;
    },

    /**
     * To make bar size.
     * @param {number} groupSize bar group size
     * @param {number} barPadding bar padding
     * @param {number} itemCount group item count
     * @returns {number} bar size (width or height)
     */
    makeBarSize: function(groupSize, barPadding, itemCount) {
        return (groupSize - (barPadding * (itemCount - 1))) / (itemCount + 1);
    },

    /**
     * To make base info for normal chart bounds.
     * @param {{width: number, height: number}} dimension series dimension
     * @param {string} sizeType size type (width or height)
     * @param {string} anotherSizeType another size type (width or height)
     * @returns {{
     *      dimension: {width: number, height: number},
     *      groupValues: array.<array.<number>>,
     *      groupSize: number, barPadding: number, barSize: number, step: number,
     *      distanceToMin: number, isMinus: boolean
     * }} base info
     */
    makeBaseInfoForNormalChartBounds: function(dimension, sizeType, anotherSizeType) {
        var groupValues = this.percentValues,
            groupSize = dimension[anotherSizeType] / groupValues.length,
            itemCount = groupValues[0] && groupValues[0].length || 0,
            barPadding = this.makeBarGutter(groupSize, itemCount),
            barSize = this.makeBarSize(groupSize, barPadding, itemCount),
            scaleDistance = this.getScaleDistanceFromZeroPoint(dimension[sizeType], this.data.scale);
        return {
            dimension: dimension,
            groupValues: groupValues,
            groupSize: groupSize,
            barPadding: barPadding,
            barSize: barSize,
            step: barSize + barPadding,
            distanceToMin: scaleDistance.toMin,
            isMinus: this.data.scale.min < 0 && this.data.scale.max <= 0
        };
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
            elSeriesLabelArea = dom.create('div', 'tui-chart-series-label-area'),
            html;
        html = tui.util.map(params.values, function(values, groupIndex) {
            return tui.util.map(values, function(value, index) {
                var bound, formattedValue, renderingPosition;
                bound = groupBounds[groupIndex][index].end;
                formattedValue = formattedValues[groupIndex][index];
                renderingPosition = this.makeSeriesRenderingPosition({
                    value: value,
                    bound: bound,
                    formattedValue: formattedValue,
                    labelHeight: labelHeight
                });
                return this.makeSeriesLabelHtml(renderingPosition, formattedValue, groupIndex, index);
            }, this).join('');
        }, this).join('');

        elSeriesLabelArea.innerHTML = html;
        params.container.appendChild(elSeriesLabelArea);

        return elSeriesLabelArea;
    },

    /**
     * To make sum values.
     * @param {array.<number>} values values
     * @param {array.<function>} formatFunctions format functions
     * @returns {number} sum result.
     */
    makeSumValues: function(values, formatFunctions) {
        var sum = tui.util.sum(tui.util.filter(values, function(value) {
                return value > 0;
            })),
            fns = [sum].concat(formatFunctions || []);

        return tui.util.reduce(fns, function(stored, fn) {
            return fn(stored);
        });
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

        htmls = tui.util.map(values, function(value, index) {
            var labelWidth, left, top, labelHtml, formattedValue;

            if (value < 0) {
                return '';
            }

            bound = params.bounds[index].end;
            formattedValue = params.formattedValues[index];
            labelWidth = renderUtil.getRenderedLabelWidth(formattedValue, this.theme.label);
            left = bound.left + ((bound.width - labelWidth + chartConst.TEXT_PADDING) / 2);
            top = bound.top + ((bound.height - params.labelHeight + chartConst.TEXT_PADDING) / 2);
            labelHtml = this.makeSeriesLabelHtml({
                left: left,
                top: top
            }, formattedValue, params.groupIndex, index);
            return labelHtml;
        }, this);

        if (this.options.stacked === 'normal') {
            htmls.push(this.makeSumLabelHtml({
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
            elSeriesLabelArea = dom.create('div', 'tui-chart-series-label-area'),
            labelHeight = renderUtil.getRenderedLabelHeight(formattedValues[0][0], this.theme.label),
            html;

        html = tui.util.map(params.values, function(values, index) {
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

BarTypeSeriesBase.mixin = function(func) {
    tui.util.extend(func.prototype, BarTypeSeriesBase.prototype);
};

module.exports = BarTypeSeriesBase;

},{"../const":15,"../helpers/domHandler":26,"../helpers/renderUtil":28}],47:[function(require,module,exports){
/**
 * @fileoverview Column chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series'),
    BarTypeSeriesBase = require('./barTypeSeriesBase'),
    chartConst = require('../const'),
    renderUtil = require('../helpers/renderUtil');

var ColumnChartSeries = tui.util.defineClass(Series, /** @lends ColumnChartSeries.prototype */ {
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
     * To make start end tops.
     * @param {number} endTop end top
     * @param {number} endHeight end height
     * @param {number} value value
     * @param {boolean} isMinus whether minus or not
     * @returns {{startTop: number, endTop: number}} start end tops
     * @private
     */
    _makeStartEndTops: function(endTop, endHeight, value) {
        var startTop;
        if (value < 0) {
            startTop = endTop;
        } else {
            startTop = endTop;
            endTop -= endHeight;
        }

        return {
            startTop: startTop,
            endTop: endTop
        };
    },

    /**
     * To make bound of column chart.
     * @param {object} params parameters
     *      @param {{left: number, width: number}} params.baseBound base bound
     *      @param {number} params.startTop start top
     *      @param {number} params.endTop end top
     *      @param {number} params.endHeight end height
     * @returns {{
     *      start: {left: number, top: number, width: number, height: number},
     *      end: {left: number, top: number, width: number, height: number}
     * }} column chart bound
     * @private
     */
    _makeColumnChartBound: function(params) {
        return {
            start: tui.util.extend({
                top: params.startTop,
                height: 0
            }, params.baseBound),
            end: tui.util.extend({
                top: params.endTop,
                height: params.endHeight
            }, params.baseBound)
        };
    },

    /**
     * To make normal column chart bound.
     * @param {{
     *      dimension: {width: number, height: number},
     *      groupValues: array.<array.<number>>,
     *      groupSize: number, barPadding: number, barSize: number, step: number,
     *      distanceToMin: number, isMinus: boolean
     * }} baseInfo base info
     * @param {number} value value
     * @param {number} paddingLeft padding left
     * @param {number} index index
     * @returns {{
     *      start: {left: number, top: number, width: number, height: number},
     *      end: {left: number, top: number, width: number, height: number}
     * }} column chart bound
     * @private
     */
    _makeNormalColumnChartBound: function(baseInfo, value, paddingLeft, index) {
        var endHeight, endTop, startEndTops, bound;

        endHeight = Math.abs(value * baseInfo.dimension.height);
        endTop = baseInfo.isMinus ? 0 : baseInfo.dimension.height - baseInfo.distanceToMin;
        startEndTops = this._makeStartEndTops(endTop, endHeight, value);
        bound = this._makeColumnChartBound(tui.util.extend({
            baseBound: {
                left: paddingLeft + (baseInfo.step * index) + chartConst.SERIES_EXPAND_SIZE,
                width: baseInfo.barSize
            },
            endHeight: endHeight
        }, startEndTops));
        return bound;
    },

    /**
     * To make bounds of normal column chart.
     * @param {{width: number, height:number}} dimension column chart dimension
     * @returns {array.<array.<object>>} bounds
     * @private
     */
    _makeNormalColumnChartBounds: function(dimension) {
        var baseInfo = this.makeBaseInfoForNormalChartBounds(dimension, 'height', 'width'),
            bounds;

        bounds = tui.util.map(baseInfo.groupValues, function(values, groupIndex) {
            var paddingLeft = (baseInfo.groupSize * groupIndex) + (baseInfo.barSize / 2);
            return tui.util.map(values, function (value, index) {
                return this._makeNormalColumnChartBound(baseInfo, value, paddingLeft, index);
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
    _makeStackedColumnChartBounds: function(dimension) {
        var groupValues, groupWidth, barWidth, bounds;

        groupValues = this.percentValues;
        groupWidth = (dimension.width / groupValues.length);
        barWidth = groupWidth / 2;
        bounds = tui.util.map(groupValues, function(values, groupIndex) {
            var paddingLeft = (groupWidth * groupIndex) + (barWidth / 2) + chartConst.SERIES_EXPAND_SIZE,
                top = 0;
            return tui.util.map(values, function (value) {
                var endHeight, baseBound, bound;
                if (value < 0) {
                    return null;
                }

                endHeight = value * dimension.height;
                baseBound = {
                    left: paddingLeft,
                    width: barWidth
                };
                bound = this._makeColumnChartBound({
                    baseBound: baseBound,
                    startTop: dimension.height,
                    endTop: dimension.height - endHeight - top,
                    endHeight: endHeight
                });

                top += endHeight;
                return bound;
            }, this);
        }, this);
        return bounds;
    },

    /**
     * To make bounds of column chart.
     * @param {{width: number, height:number}} dimension column chart dimension
     * @returns {array.<array.<object>>} bounds
     * @private
     */
    _makeBounds: function(dimension) {
        if (!this.options.stacked) {
            return this._makeNormalColumnChartBounds(dimension);
        } else {
            return this._makeStackedColumnChartBounds(dimension);
        }
    },

    /**
     * To make series rendering position
     * @param {obeject} params parameters
     *      @param {number} params.value value
     *      @param {{left: number, top: number, width:number, width:number, height: number}} params.bound bound
     *      @param {string} params.formattedValue formatted value
     *      @param {number} params.labelHeight label height
     * @returns {{left: number, top: number}} rendering position
     */
    makeSeriesRenderingPosition: function(params) {
        var labelWidth = renderUtil.getRenderedLabelWidth(params.formattedValue, this.theme.label),
            bound = params.bound,
            top = bound.top,
            left = bound.left + (bound.width - labelWidth) / 2;

        if (params.value >= 0) {
            top -= params.labelHeight + chartConst.SERIES_LABEL_PADDING;
        } else {
            top += bound.height + chartConst.SERIES_LABEL_PADDING;
        }

        return {
            left: left,
            top: top
        };
    },

    /**
     * To make sum label html.
     * @param {object} params parameters
     *      @param {array.<number>} params.values values
     *      @param {array.<function>} params.formatFunctions formatting functions
     *      @param {{left: number, top: number}} params.bound bound
     *      @param {number} params.labelHeight label height
     * @returns {string} sum label html
     */
    makeSumLabelHtml: function(params) {
        var sum = this.makeSumValues(params.values, params.formatFunctions),
            bound = params.bound,
            labelWidth = renderUtil.getRenderedLabelWidth(sum, this.theme.label),
            left = bound.left + ((bound.width - labelWidth + chartConst.TEXT_PADDING) / 2),
            top = bound.top - params.labelHeight - chartConst.SERIES_LABEL_PADDING;

        return this.makeSeriesLabelHtml({
            left: left,
            top: top
        }, sum, -1, -1);
    }
});

BarTypeSeriesBase.mixin(ColumnChartSeries);

module.exports = ColumnChartSeries;

},{"../const":15,"../helpers/renderUtil":28,"./barTypeSeriesBase":46,"./series":51}],48:[function(require,module,exports){
/**
 * @fileoverview Line chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series'),
    LineTypeSeriesBase = require('./lineTypeSeriesBase');

var LineChartSeries = tui.util.defineClass(Series, /** @lends LineChartSeries.prototype */ {
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
     * To make series data.
     * @returns {object} add data
     */
    makeSeriesData: function() {
        return {
            groupPositions: this.makePositions(this.bound.dimension)
        };
    }
});

LineTypeSeriesBase.mixin(LineChartSeries);

module.exports = LineChartSeries;

},{"./lineTypeSeriesBase":49,"./series":51}],49:[function(require,module,exports){
/**
 * @fileoverview LineTypeSeriesBase is base class for line type series.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    dom = require('../helpers/domHandler'),
    renderUtil = require('../helpers/renderUtil');
/**
 * @classdesc LineTypeSeriesBase is base class for line type series.
 * @class LineTypeSeriesBase
 * @mixin
 */
var LineTypeSeriesBase = tui.util.defineClass(/** @lends LineTypeSeriesBase.prototype */ {
    /**
     * To make positions of line chart.
     * @param {{width: number, height:nunber}} dimension line chart dimension
     * @returns {array.<array.<object>>} positions
     */
    makePositions: function(dimension) {
        var groupValues = this.percentValues,
            width = dimension.width,
            height = dimension.height,
            len = groupValues[0].length,
            step, start, result;
        if (this.aligned) {
            step = width / (len - 1);
            start = 0;
        } else {
            step = width / len;
            start = step / 2;
        }

        result = tui.util.map(groupValues, function(values) {
            return tui.util.map(values, function(value, index) {
                return {
                    left: start + (step * index) + chartConst.SERIES_EXPAND_SIZE,
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
        elSeriesLabelArea = dom.create('div', 'tui-chart-series-label-area');

        html = tui.util.map(params.formattedValues, function(values, groupIndex) {
            return tui.util.map(values, function(value, index) {
                var position = groupPositions[groupIndex][index],
                    labelWidth = renderUtil.getRenderedLabelWidth(value, this.theme.label),
                    labelHtml = this.makeSeriesLabelHtml({
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
    },

    /**
     * Find index.
     * @param {number} groupIndex group index
     * @param {number} layerY mouse position
     * @returns {number} index
     * @private
     */
    _findIndex: function(groupIndex, layerY) {
        var foundIndex = -1,
            diff = 1000;

        if (!this.tickItems) {
            this.tickItems = tui.util.pivot(this.groupPositions);
        }

        tui.util.forEach(this.tickItems[groupIndex], function(position, index) {
            var compare = Math.abs(layerY - position.top);
            if (diff > compare) {
                diff = compare;
                foundIndex = index;
            }
        });
        return foundIndex;
    },

    /**
     * Whether changed or not.
     * @param {number} groupIndex group index
     * @param {number} index index
     * @returns {boolean} whether changed or not
     * @private
     */
    _isChanged: function(groupIndex, index) {
        var prevIndexes = this.prevIndexes;

        this.prevIndexes = {
            groupIndex: groupIndex,
            index: index
        };

        return !prevIndexes || (prevIndexes.groupIndex !== groupIndex) || (prevIndexes.index !== index);
    },

    /**
     * On over tick sector.
     * @param {number} groupIndex groupIndex
     * @param {number} layerY layerY
     */
    onLineTypeOverTickSector: function(groupIndex, layerY) {
        var index, prevIndexes;

        index = this._findIndex(groupIndex, layerY);
        prevIndexes = this.prevIndexes;

        if (!this._isChanged(groupIndex, index)) {
            return;
        }

        if (prevIndexes) {
            this.outCallback();
        }

        this.inCallback(this._getBound(groupIndex, index), groupIndex, index);
    },

    /**
     * On out tick sector.
     */
    onLineTypeOutTickSector: function() {
        delete this.prevIndexes;
        this.outCallback();
    }
});

LineTypeSeriesBase.mixin = function(func) {
    tui.util.extend(func.prototype, LineTypeSeriesBase.prototype);
};

module.exports = LineTypeSeriesBase;

},{"../const":15,"../helpers/domHandler":26,"../helpers/renderUtil":28}],50:[function(require,module,exports){
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

var PieChartSeries = tui.util.defineClass(Series, /** @lends PieChartSeries.prototype */ {
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
        var result = tui.util.map(data.values, function(values) {
            var sum = tui.util.sum(values);
            return tui.util.map(values, function(value) {
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

        paths = tui.util.map(percentValues, function(percentValue) {
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
                popupPosition: this._getArcPosition(tui.util.extend({
                    r: r + delta
                }, positionData)),
                centerPosition: this._getArcPosition(tui.util.extend({
                    r: (r / 2) + delta
                }, positionData)),
                outerPosition: {
                    start: this._getArcPosition(tui.util.extend({
                        r: r
                    }, positionData)),
                    middle: this._getArcPosition(tui.util.extend({
                        r: r + delta
                    }, positionData))
                }
            };
        }, this);

        return paths;
    },

    /**
     * To make series data.
     * @returns {{
     *      formattedValues: array,
     *      chartBackground: string,
     *      circleBound: ({cx: number, cy: number, r: number}),
     *      sectorsInfo: array.<object>
     * }} add data for graph rendering
     */
    makeSeriesData: function() {
        var circleBound = this._makeCircleBound(this.bound.dimension, {
                showLabel: this.options.showLabel,
                legendType: this.options.legendType
            }),
            sectorsInfo = this._makeSectorsInfo(this.percentValues[0], circleBound);

        this.popupPositions = tui.util.pluck(sectorsInfo, 'popupPosition');
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
            diameter = tui.util.multiplication(tui.util.min([width, height]), radiusRate);
        return {
            cx: tui.util.division(width, 2),
            cy: tui.util.division(height, 2),
            r: tui.util.division(diameter, 2)
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
    _makeSeriesDataForSeriesLabel: function(container) {
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
            elSeriesLabelArea = dom.create('div', 'tui-chart-series-label-area'),
            html;

        html = tui.util.map(params.legendLabels, function(legend, index) {
            var label = this._getSeriesLabel({
                    legend: legend,
                    label: formattedValues[index],
                    separator: params.separator,
                    options: params.options
                }),
                position = params.moveToPosition(positions[index], label);
            return this.makeSeriesLabelHtml(position, label, 0, index);
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
        var elArea = this._renderLegendLabel(tui.util.extend({
            positions: tui.util.pluck(params.sectorsInfo, 'centerPosition'),
            moveToPosition: tui.util.bind(this._moveToCenterPosition, this),
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
        tui.util.forEach(positions, function(position) {
            var end = tui.util.extend({}, position.middle);
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
        var outerPositions = tui.util.pluck(params.sectorsInfo, 'outerPosition'),
            centerLeft = params.chartWidth / 2,
            elArea;

        this._addEndPosition(centerLeft, outerPositions);
        elArea = this._renderLegendLabel(tui.util.extend({
            positions: outerPositions,
            moveToPosition: tui.util.bind(this._moveToOuterPosition, this, centerLeft),
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

},{"../const":15,"../helpers/domHandler":26,"../helpers/renderUtil":28,"./series":51}],51:[function(require,module,exports){
/**
 * @fileoverview Series base component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var seriesTemplate = require('./seriesTemplate'),
    chartConst = require('../const'),
    state = require('../helpers/state'),
    dom = require('../helpers/domHandler'),
    renderUtil = require('../helpers/renderUtil'),
    event = require('../helpers/eventListener'),
    pluginFactory = require('../factories/pluginFactory');

var SERIES_LABEL_CLASS_NAME = 'tui-chart-series-label';

var Series = tui.util.defineClass(/** @lends Series.prototype */ {
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

        tui.util.extend(this, params);
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
        this.className = 'tui-chart-series-area';

        this.seriesData = this.makeSeriesData();
    },

    /**
     * To make series data.
     * @returns {object} add data
     */
    makeSeriesData: function() {
        return {};
    },

    /**
     * Show tooltip (mouseover callback).
     * @param {object} params parameters
     *      @param {boolean} params.allowNegativeTooltip whether allow negative tooltip or not
     * @param {{top:number, left: number, width: number, height: number}} bound graph bound information
     * @param {number} groupIndex group index
     * @param {number} index index
     */
    showTooltip: function(params, bound, groupIndex, index, eventPosition) {
        this.fire('showTooltip', tui.util.extend({
            indexes: {
                groupIndex: groupIndex,
                index: index
            },
            bound: bound,
            eventPosition: eventPosition
        }, params));
    },

    /**
     * Hide tooltip (mouseout callback).
     * @param {string} id tooltip id
     */
    hideTooltip: function() {
        this.fire('hideTooltip');
    },

    /**
     * To expand series dimension
     * @param {{width: number, height: number}} dimension series dimension
     * @returns {{width: number, height: number}} expended dimension
     * @private
     */
    _expandDimension: function(dimension) {
        return {
            width: dimension.width + chartConst.SERIES_EXPAND_SIZE * 2,
            height: dimension.height + chartConst.SERIES_EXPAND_SIZE
        };
    },

    /**
     * Render series.
     * @param {object} paper object for graph drawing
     * @returns {HTMLElement} series element
     */
    render: function(paper) {
        var el = dom.create('DIV', this.className),
            bound = this.bound,
            dimension = this._expandDimension(bound.dimension),
            inCallback = tui.util.bind(this.showTooltip, this, {
                allowNegativeTooltip: !!this.allowNegativeTooltip,
                chartType: this.chartType
            }),
            outCallback = tui.util.bind(this.hideTooltip, this),
            data = {
                dimension: dimension,
                chartType: this.chartType,
                theme: this.theme,
                options: this.options
            },
            seriesData = this.seriesData,
            addDataForSeriesLabel;

        if (!paper) {
            renderUtil.renderDimension(el, dimension);
        }

        this._renderPosition(el, bound.position, this.chartType);

        data = tui.util.extend(data, seriesData);

        this.paper = this.graphRenderer.render(paper, el, data, inCallback, outCallback);

        if (this._renderSeriesLabel) {
            addDataForSeriesLabel = this._makeSeriesDataForSeriesLabel(el, dimension);
            this.elSeriesLabelArea = this._renderSeriesLabel(tui.util.extend(addDataForSeriesLabel, seriesData));
        }

        if (!this.isGroupedTooltip) {
            this.attachEvent(el);
        }

        // series label mouse event 동작 시 사용
        this.inCallback = inCallback;
        this.outCallback = outCallback;

        return el;
    },

    /**
     * To make add data for series label.
     * @param {HTMLElement} container container
     * @param {{width: number, height: number}} dimension dimension
     * @returns {{
     *      container: HTMLElement,
     *      values: array.<array>,
     *      formattedValues: array.<array>,
     *      formatFunctions: array.<function>,
     *      dimension: {width: number, height: number}
     * }} add data for series label
     * @private
     */
    _makeSeriesDataForSeriesLabel: function(container, dimension) {
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
     * @param {{top: number, left: number}} position series position
     * @private
     */
    _renderPosition: function(el, position) {
        var hiddenWidth = renderUtil.isIE8() ? chartConst.HIDDEN_WIDTH : 0;
        position.top = position.top - (hiddenWidth * 2);
        position.left = position.left - chartConst.SERIES_EXPAND_SIZE - hiddenWidth;
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
            percentValues = tui.util.map(data.values, function(values) {
                var plusValues = tui.util.filter(values, function(value) {
                        return value > 0;
                    }),
                    sum = tui.util.sum(plusValues),
                    groupPercent = (sum - min) / distance;
                return tui.util.map(values, function(value) {
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
        var percentValues = tui.util.map(data.values, function(values) {
            var plusValues = tui.util.filter(values, function(value) {
                    return value > 0;
                }),
                sum = tui.util.sum(plusValues);
            return tui.util.map(values, function(value) {
                return value === 0 ? 0 : value / sum;
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
            isLineTypeChart = state.isLineTypeChart(this.chartType),
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

        percentValues = tui.util.map(data.values, function(values) {
            return tui.util.map(values, function(value) {
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

    renderCoordinateArea: function() {},

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

        groupIndex = parseInt(elTarget.getAttribute('data-group-index'), 10);
        index = parseInt(elTarget.getAttribute('data-index'), 10);

        if (groupIndex === -1 || index === -1) {
            return;
        }

        this.inCallback(this._getBound(groupIndex, index), groupIndex, index);
    },

    onMousemove: function() {},
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

        groupIndex = parseInt(elTarget.getAttribute('data-group-index'), 10);
        index = parseInt(elTarget.getAttribute('data-index'), 10);

        if (groupIndex === -1 || index === -1) {
            return;
        }

        this.outCallback(groupIndex, index);
    },

    /**
     * Attach event
     * @param {HTMLElement} el target element
     */
    attachEvent: function(el) {
        event.bindEvent('mouseover', el, tui.util.bind(this.onMouseover, this));
        event.bindEvent('mousemove', el, tui.util.bind(this.onMousemove, this));
        event.bindEvent('mouseout', el, tui.util.bind(this.onMouseout, this));
    },

    /**
     * To call showAnimation function of graphRenderer.
     * @param {{groupIndex: number, index: number}} data data
     */
    onShowAnimation: function(data) {
        if (!this.graphRenderer.showAnimation) {
            return;
        }
        this.graphRenderer.showAnimation.call(this.graphRenderer, data);
    },

    /**
     * To call hideAnimation function of graphRenderer.
     * @param {{groupIndex: number, index: number}} data data
     */
    onHideAnimation: function(data) {
        if (!this.graphRenderer.hideAnimation) {
            return;
        }
        this.graphRenderer.hideAnimation.call(this.graphRenderer, data);
    },

    /**
     * To call showGroupAnimation function of graphRenderer.
     * @param {number} index index
     * @param {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} bound bound
     */
    onShowGroupAnimation: function(index, bound) {
        if (!this.graphRenderer.showGroupAnimation) {
            return;
        }
        this.graphRenderer.showGroupAnimation.call(this.graphRenderer, index, bound);
    },

    /**
     * To call hideGroupAnimation function of graphRenderer.
     * @param {number} index index
     */
    onHideGroupAnimation: function(index) {
        if (!this.graphRenderer.hideGroupAnimation) {
            return;
        }
        this.graphRenderer.hideGroupAnimation.call(this.graphRenderer, index);
    },

    /**
     * Animate component.
     */
    animateComponent: function() {
        if (this.graphRenderer.animate) {
            this.graphRenderer.animate(tui.util.bind(this.showSeriesLabelArea, this));
        }
    },

    /**
     * To make html about series label
     * @param {{left: number, top: number}} position position
     * @param {string} value value
     * @param {number} groupIndex group index
     * @param {number} index index
     * @returns {string} html string
     */
    makeSeriesLabelHtml: function(position, value, groupIndex, index) {
        var cssObj = tui.util.extend(position, this.theme.label);
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

        (new tui.component.Effects.Fade({
            element: this.elSeriesLabelArea,
            duration: 300
        })).action({
            start: 0,
            end: 1,
            complete: function() {}
        });
    }
});

tui.util.CustomEvents.mixin(Series);

module.exports = Series;

},{"../const":15,"../factories/pluginFactory":20,"../helpers/domHandler":26,"../helpers/eventListener":27,"../helpers/renderUtil":28,"../helpers/state":29,"./seriesTemplate":52}],52:[function(require,module,exports){
/**
 * @fileoverview This is templates of series.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

var templateMaker = require('../helpers/templateMaker');

var tags = {
    HTML_SERIES_LABEL: '<div class="tui-chart-series-label" style="{{ cssText }}" data-group-index="{{ groupIndex }}" data-index="{{ index }}">{{ value }}</div>',
    TEXT_CSS_TEXT: 'left:{{ left }}px;top:{{ top }}px;font-family:{{ fontFamily }};font-size:{{ fontSize }}px'
};

module.exports = {
    tplSeriesLabel: templateMaker.template(tags.HTML_SERIES_LABEL),
    tplCssText: templateMaker.template(tags.TEXT_CSS_TEXT)
};

},{"../helpers/templateMaker":30}],53:[function(require,module,exports){
var DEFAULT_COLOR = '#000000',
    DEFAULT_BACKGROUND = '#ffffff',
    EMPTY = '',
    DEFAULT_AXIS = {
        tickColor: DEFAULT_COLOR,
        title: {
            fontSize: 12,
            fontFamily: EMPTY,
            color: DEFAULT_COLOR
        },
        label: {
            fontSize: 12,
            fontFamily: EMPTY,
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
        fontFamily: EMPTY,
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
            fontFamily: EMPTY,
            color: DEFAULT_COLOR
        },
        colors: ['#ac4142', '#d28445', '#f4bf75', '#90a959', '#75b5aa', '#6a9fb5', '#aa759f', '#8f5536'],
        borderColor: EMPTY
    },
    legend: {
        label: {
            fontSize: 12,
            fontFamily: EMPTY,
            color: DEFAULT_COLOR
        }
    },
    tooltip: {}
};

module.exports = defaultTheme;

},{}],54:[function(require,module,exports){
/**
 * @fileoverview Group tooltip component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var TooltipBase = require('./tooltipBase'),
    chartConst = require('../const'),
    dom = require('../helpers/domHandler'),
    renderUtil = require('../helpers/renderUtil'),
    defaultTheme = require('../themes/defaultTheme'),
    tooltipTemplate = require('./tooltipTemplate');

var GroupTooltip = tui.util.defineClass(TooltipBase, /** @lends GroupTooltip.prototype */ {
    /**
     * Group tooltip component.
     * @constructs GroupTooltip
     * @param {object} params parameters
     *      @param {array.<number>} params.values converted values
     *      @param {array} params.labels labels
     *      @param {array} params.legendLabels legend labels
     *      @param {object} params.bound axis bound
     *      @param {object} params.theme axis theme
     */
    init: function(params) {
        TooltipBase.call(this, params);
    },

    /**
     * To make tooltip data.
     * @returns {array.<object>} tooltip data
     * @override
     */
    makeTooltipData: function() {
        return tui.util.map(this.joinFormattedValues, function(values, index) {
            return {
                category: this.labels[index],
                values: values
            };
        }, this);
    },

    /**
     * To make colors.
     * @param {array.<string>} legendLabels legend labels
     * @param {object} theme tooltip theme
     * @returns {array.<string>} colors
     * @private
     */
    _makeColors: function(legendLabels, theme) {
        var colorIndex = 0,
            defaultColors, colors, prevChartType;
        if (theme.colors) {
            return theme.colors;
        }

        defaultColors = defaultTheme.series.colors.slice(0, legendLabels.length);

        return tui.util.map(tui.util.pluck(legendLabels, 'chartType'), function(chartType) {
            var color;
            if (prevChartType !== chartType) {
                colors = theme[chartType] ? theme[chartType].colors : defaultColors;
                colorIndex = 0;
            }
            prevChartType = chartType;
            color = colors[colorIndex];
            colorIndex += 1;
            return color;
        });
    },

    /**
     * To make tooltip html.
     * @param {number} groupIndex group index
     * @returns {string} tooltip html
     * @private
     */
    _makeTooltipHtml: function(groupIndex) {
        var item = this.data[groupIndex],
            template = tooltipTemplate.tplGroupItem,
            cssTextTemplate = tooltipTemplate.tplGroupCssText,
            colors = this._makeColors(this.joinLegendLabels, this.theme),
            itemsHtml;

        itemsHtml = tui.util.map(item.values, function(value, index) {
            var legendLabel = this.joinLegendLabels[index];
            return template({
                value: value,
                legend: legendLabel.label,
                chartType: legendLabel.chartType,
                cssText: cssTextTemplate({color: colors[index]}),
                suffix: this.suffix
            });
        }, this).join('');

        return tooltipTemplate.tplGroup({
            category: item.category,
            items: itemsHtml
        });
    },

    /**
     * To calculate vertical position.
     * @param {{width: number, height: number}} dimension dimension
     * @param {{index: number, range: {start: number, end: number},
     *          size: number, direction: string, isVertical: boolean
     *        }} params coordinate event parameters
     * @returns {{left: number, top: number}} position
     * @private
     */
    _calculateVerticalPosition: function(dimension, params) {
        var range = params.range,
            isLine = (range.start === range.end),
            padding = isLine ? 6 : 0,
            left = chartConst.SERIES_EXPAND_SIZE;
        if (params.direction === chartConst.TOOLTIP_DIRECTION_FORWORD) {
            left += range.start + padding;
        } else {
            left += range.end - dimension.width - padding;
        }
        return {
            left: left,
            top: (params.size - dimension.height) / 2
        };
    },

    /**
     * To calculate horizontal position.
     * @param {{width: number, height: number}} dimension dimension
     * @param {{index: number, range: {start: number, end: number},
     *          size: number, direction: string, isVertical: boolean
     *        }} params coordinate event parameters
     * @returns {{left: number, top: number}} position
     * @private
     */
    _calculateHorizontalPosition: function(dimension, params) {
        var range = params.range,
            top = 0;
        if (params.direction === chartConst.TOOLTIP_DIRECTION_FORWORD) {
            top += range.start;
        } else {
            top += range.end - dimension.height;
        }
        return {
            left: (params.size - dimension.width) / 2 + chartConst.SERIES_EXPAND_SIZE,
            top: top
        };
    },

    /**
     * To calculate position.
     * @param {{width: number, height: number}} dimension dimension
     * @param {{index: number, range: {start: number, end: number},
     *          size: number, direction: string, isVertical: boolean
     *        }} params coordinate event parameters
     * @returns {{left: number, top: number}} position
     * @private
     */
    _calculateTooltipPosition: function(dimension, params) {
        var position;
        if (params.isVertical) {
            position = this._calculateVerticalPosition(dimension, params);
        } else {
            position = this._calculateHorizontalPosition(dimension, params);
        }
        return position;
    },

    /**
     * Create tooltip element.
     * @returns {HTMLElement} tooltip element
     * @private
     */
    _createTooltipSectorElement: function() {
        var elTooltipBlock;
        if (!this.elLayout.childNodes.length < 2) {
            elTooltipBlock = dom.create('DIV', 'tui-chart-group-tooltip-sector');
            dom.append(this.elLayout, elTooltipBlock);
        } else {
            elTooltipBlock = this.elLayout.lastChild;
        }
        return elTooltipBlock;
    },

    /**
     * Get tooltip sector element.
     * @returns {HTMLElement} sector element
     * @private
     */
    _getTooltipSectorElement: function() {
        if (!this.elTooltipBlock) {
            this.elTooltipBlock = this._createTooltipSectorElement();
        }
        return this.elTooltipBlock;
    },

    /**
     * To make bound about tooltip sector of vertical type chart.
     * @param {number} height height
     * @param {{start: number, end: number}} range range
     * @param {boolean} isLine whether line or not
     * @returns {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound
     * @private
     */
    _makeVerticalTooltipSectorBound: function(height, range, isLine) {
        var width, moveLeft;
        if (isLine) {
            width = 1;
            height += 6;
            moveLeft = 0;
        } else {
            width = range.end - range.start + 1;
            moveLeft = 1;
        }
        return {
            dimension: {
                width: width,
                height: height
            },
            position: {
                left: range.start + chartConst.SERIES_EXPAND_SIZE - moveLeft,
                top: 0
            }
        };
    },

    /**
     * To make bound about tooltip sector of horizontal type chart.
     * @param {number} width width
     * @param {{start: number, end:number}} range range
     * @returns {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound
     * @private
     */
    _makeHorizontalTooltipSectorBound: function(width, range) {
        return {
            dimension: {
                width: width,
                height: range.end - range.start + 1
            },
            position: {
                left: chartConst.SERIES_EXPAND_SIZE,
                top: range.start
            }
        };
    },

    /**
     * To make bound about tooltip sector.
     * @param {number} size width or height
     * @param {{start: number, end:number}} range range
     * @param {boolean} isVertical whether vertical or not
     * @param {boolean} isLine whether line type or not
     * @returns {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound
     * @private
     */
    _makeTooltipSectorBound: function(size, range, isVertical, isLine) {
        var bound;
        if (isVertical) {
            bound = this._makeVerticalTooltipSectorBound(size, range, isLine);
        } else {
            bound = this._makeHorizontalTooltipSectorBound(size, range);
        }
        return bound;
    },

    /**
     * Show tooltip sector.
     * @param {number} size width or height
     * @param {{start: number, end:number}} range range
     * @param {boolean} isVertical whether vertical or not
     * @param {number} index index
     * @private
     */
    _showTooltipSector: function(size, range, isVertical, index) {
        var elTooltipBlock = this._getTooltipSectorElement(),
            isLine = (range.start === range.end),
            bound = this._makeTooltipSectorBound(size, range, isVertical, isLine);
        if (isLine) {
            this.fire('showGroupAnimation', index, bound);
        } else {
            renderUtil.renderDimension(elTooltipBlock, bound.dimension);
            renderUtil.renderPosition(elTooltipBlock, bound.position);
            dom.addClass(elTooltipBlock, 'show');
        }
    },

    /**
     * Hide tooltip sector.
     * @param {number} index index
     * @private
     */
    _hideTooltipSector: function(index) {
        var elTooltipBlock = this._getTooltipSectorElement();
        dom.removeClass(elTooltipBlock, 'show');
        this.fire('hideGroupAnimation', index);
    },

    /**
     * Show tooltip.
     * @param {HTMLElement} elTooltip tooltip element
     * @param {{index: number, range: {start: number, end: number},
     *          size: number, direction: string, isVertical: boolean
     *        }} params coordinate event parameters
     * @param {{left: number, top: number}} prevPosition prev position
     */
    showTooltip: function(elTooltip, params, prevPosition) {
        var dimension, position;

        if (!tui.util.isUndefined(this.prevIndex)) {
            this.fire('hideGroupAnimation', this.prevIndex);
        }
        elTooltip.innerHTML = this._makeTooltipHtml(params.index);
        dom.addClass(elTooltip, 'show');

        this._showTooltipSector(params.size, params.range, params.isVertical, params.index);
        dimension = this.getTooltipDimension(elTooltip);

        position = this._calculateTooltipPosition(dimension, params);

        this.moveToPosition(elTooltip, position, prevPosition);
        this.prevIndex = params.index;
    },

    /**
     * Hide tooltip.
     * @param {HTMLElement} elTooltip tooltip element
     * @param {number} index index
     */
    hideTooltip: function(elTooltip, index) {
        delete this.prevIndex;
        this._hideTooltipSector(index);
        this.hideAnimation(elTooltip);
    }
});

tui.util.CustomEvents.mixin(GroupTooltip);

module.exports = GroupTooltip;

},{"../const":15,"../helpers/domHandler":26,"../helpers/renderUtil":28,"../themes/defaultTheme":53,"./tooltipBase":56,"./tooltipTemplate":57}],55:[function(require,module,exports){
/**
 * @fileoverview Tooltip component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var TooltipBase = require('./tooltipBase'),
    chartConst = require('../const'),
    dom = require('../helpers/domHandler'),
    event = require('../helpers/eventListener'),
    templateMaker = require('../helpers/templateMaker'),
    tooltipTemplate = require('./tooltipTemplate');

var Tooltip = tui.util.defineClass(TooltipBase, /** @lends Tooltip.prototype */ {
    /**
     * Tooltip component.
     * @constructs Tooltip
     * @param {object} params parameters
     *      @param {array.<number>} params.values converted values
     *      @param {array} params.labels labels
     *      @param {array} params.legendLabels legend labels
     *      @param {object} params.bound axis bound
     *      @param {object} params.theme axis theme
     */
    init: function(params) {
        TooltipBase.call(this, params);
        this.tplTooltip = this._getTooltipTemplate(this.options.template);
        this._setDefaultTooltipPositionOption();
    },

    /**
     * Get tooltip template.
     * @param {object} optionTemplate template option
     * @returns {object} template
     * @private
     */
    _getTooltipTemplate: function(optionTemplate) {
        return optionTemplate ? templateMaker.template(optionTemplate) : tooltipTemplate.tplDefault;
    },

    /**
     * Set default position option of tooltip.
     * @private
     */
    _setDefaultTooltipPositionOption: function() {
        if (this.options.position) {
            return;
        }

        if (this.isVertical) {
            this.options.position = chartConst.TOOLTIP_DEFAULT_POSITION_OPTION;
        } else {
            this.options.position = chartConst.TOOLTIP_DEFAULT_HORIZONTAL_POSITION_OPTION;
        }
    },

    /**
     * Render tooltip.
     * @param {{position: object}} bound tooltip bound
     * @returns {HTMLElement} tooltip element
     */
    render: function() {
        var el = TooltipBase.prototype.render.call(this);
        this.attachEvent(el);
        return el;
    },

    /**
     * To make tooltip data.
     * @returns {array.<object>} tooltip data
     * @override
     */
    makeTooltipData: function() {
        var labels = this.labels,
            groupValues = this.values,
            legendLabels = this.legendLabels;

        return tui.util.map(groupValues, function(values, groupIndex) {
            return tui.util.map(values, function(value, index) {
                return {
                    category: labels ? labels[groupIndex] : '',
                    legend: legendLabels[index],
                    value: value
                };
            });
        });
    },

    /**
     * Fire custom event showAnimation.
     * @param {{groupIndex: number, index: number}} indexes indexes
     * @private
     */
    _fireShowAnimation: function(indexes) {
        this.fire('showAnimation', indexes);
    },

    /**
     * Fire custom event hideAnimation.
     * @param {{groupIndex: number, index: number}} indexes indexes
     * @private
     */
    _fireHideAnimation: function(indexes) {
        this.fire('hideAnimation', indexes);
    },

    /**
     * Set data indexes.
     * @param {HTMLElement} elTooltip tooltip element
     * @param {{groupIndex: number, index:number}} indexes indexes
     * @private
     */
    _setIndexesCustomAttribute: function(elTooltip, indexes) {
        elTooltip.setAttribute('data-groupIndex', indexes.groupIndex);
        elTooltip.setAttribute('data-index', indexes.index);
    },

    /**
     * Get data indexes
     * @param {HTMLElement} elTooltip tooltip element
     * @returns {{groupIndex: number, index: number}} indexes
     * @private
     */
    _getIndexesCustomAttribute: function(elTooltip) {
        var groupIndex = elTooltip.getAttribute('data-groupIndex'),
            index = elTooltip.getAttribute('data-index'),
            indexes;
        if (groupIndex && index) {
            indexes = {
                groupIndex: parseInt(groupIndex, 10),
                index: parseInt(index, 10)
            };
        }
        return indexes;
    },

    /**
     * Set showed custom attribute.
     * @param {HTMLElement} elTooltip tooltip element
     * @param {boolean} status whether showed or not
     * @private
     */
    _setShowedCustomAttribute: function(elTooltip, status) {
        elTooltip.setAttribute('data-showed', status);
    },

    /**
     * Whether showed tooltip or not.
     * @param {HTMLElement} elTooltip tooltip element
     * @returns {boolean} whether showed tooltip or not
     * @private
     */
    _isShowedTooltip: function(elTooltip) {
        return elTooltip.getAttribute('data-showed') === 'true';
    },

    /**
     * On mouseover event handler for tooltip area
     * @param {MouseEvent} e mouse event
     */
    onMouseover: function(e) {
        var elTarget = e.target || e.srcElement,
            indexes;

        if (!dom.hasClass(elTarget, chartConst.TOOLTIP_PREFIX)) {
            elTarget = dom.findParentByClass(elTarget, chartConst.TOOLTIP_PREFIX);
        }


        if (elTarget.id !== this._getTooltipId()) {
            return;
        }

        indexes = this._getIndexesCustomAttribute(elTarget);

        this._setShowedCustomAttribute(elTarget, true);

        this._fireShowAnimation(indexes);
    },

    /**
     * On mouseout event handler for tooltip area
     * @param {MouseEvent} e mouse event
     */
    onMouseout: function(e) {
        var elTarget = e.target || e.srcElement;


        if (!dom.hasClass(elTarget, chartConst.TOOLTIP_PREFIX)) {
            elTarget = dom.findParentByClass(elTarget, chartConst.TOOLTIP_PREFIX);
        }

        if (elTarget.id !== this._getTooltipId()) {
            return;
        }

        this.hideTooltip(elTarget);
    },

    /**
     * To calculate tooltip position abount pie chart.
     * @param {object} params parameters
     *      @param {{left: number, top: number}} params.bound bound
     *      @param {{clientX: number, clientY: number}} params.eventPosition mouse position
     * @returns {{top: number, left: number}} position
     * @private
     */
    _calculateTooltipPositionAboutPieChart: function(params) {
        params.bound.left = params.eventPosition.clientX - this.seriesPosition.left;
        params.bound.top = params.eventPosition.clientY - this.seriesPosition.top;
        return this._calculateTooltipPositionAboutNotBarChart(params);
    },

    /**
     * To calculate tooltip position about not bar chart.
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
            lineGap = bound.width ? 0 : chartConst.TOOLTIP_GAP,
            positionOption = params.positionOption || '',
            tooltipHeight = params.dimension.height,
            result = {};
        result.left = bound.left + addPosition.left;
        result.top = bound.top - tooltipHeight + addPosition.top;

        if (positionOption.indexOf('left') > -1) {
            result.left -= minusWidth + lineGap;
        } else if (positionOption.indexOf('center') > -1) {
            result.left -= minusWidth / 2;
        } else {
            result.left += lineGap;
        }

        if (positionOption.indexOf('bottom') > -1) {
            result.top += tooltipHeight + lineGap;
        } else if (positionOption.indexOf('middle') > -1) {
            result.top += tooltipHeight / 2;
        } else {
            result.top -= chartConst.TOOLTIP_GAP;
        }

        return result;
    },

    /**
     * To calculate tooltip position about bar chart.
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
            result.left += chartConst.TOOLTIP_GAP;
        }

        if (positionOption.indexOf('top') > -1) {
            result.top -= minusHeight;
        } else if (positionOption.indexOf('middle') > -1) {
            result.top -= minusHeight / 2;
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

        if (params.eventPosition) {
            return this._calculateTooltipPositionAboutPieChart(params);
        }

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
                indexes: params.indexes,
                dimension: params.dimension,
                sizeType: sizeType,
                positionType: positionType,
                addPadding: addPadding
            });
        }
        return result;
    },

    /**
     * Get value by indexes.
     * @param {{groupIndex: number, index: number}} indexes indexes
     * @returns {(string | number)} value
     * @private
     */
    _getValueByIndexes: function(indexes) {
        return this.values[indexes.groupIndex][indexes.index];
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
            value = this._getValueByIndexes(params.indexes),
            center;

        if (value < 0) {
            center = bound[positionType] + (bound[sizeType] / 2) + (params.addPadding || 0);
            position[positionType] = position[positionType] - (position[positionType] - center) * 2 - params.dimension[sizeType];
        }

        return position;
    },

    /**
     * Get tooltip id.
     * @returns {string} tooltip id
     * @private
     */
    _getTooltipId: function() {
        if (!this.tooltipId) {
            this.tooltipId = chartConst.TOOLTIP_ID_PREFIX + '-' + (new Date()).getTime();
        }
        return this.tooltipId;
    },

    /**
     * To make tooltip html.
     * @param {{groupIndex: number, index: number}} indexes indexes
     * @returns {string} tooltip html
     * @private
     */
    _makeTooltipHtml: function(indexes) {
        var data = this.data[indexes.groupIndex][indexes.index];
        data.suffix = this.suffix;
        return this.tplTooltip(data);
    },

    _isChangedIndexes: function(prevIndexes, indexes) {
        return !!prevIndexes && (prevIndexes.groupIndex !== indexes.groupIndex || prevIndexes.index !== indexes.index);
    },

    /**
     * Show tooltip.
     * @param {HTMLElement} elTooltip tooltip element
     * @param {{indexes: {groupIndex: number, index: number}, bound: object}} params tooltip data
     * @param {{left: number, top: number}} prevPosition prev position
     */
    showTooltip: function(elTooltip, params, prevPosition) {
        var indexes = params.indexes,
            curIndexes = this._getIndexesCustomAttribute(elTooltip),
            position;

        if (elTooltip.id === this._getTooltipId() && this._isChangedIndexes(curIndexes, indexes)) {
            this._fireHideAnimation(curIndexes);
        }

        elTooltip.id = this._getTooltipId();
        elTooltip.innerHTML = this._makeTooltipHtml(indexes);

        this._setIndexesCustomAttribute(elTooltip, indexes);
        this._setShowedCustomAttribute(elTooltip, true);

        dom.addClass(elTooltip, 'show');

        position = this._calculateTooltipPosition(tui.util.extend({
            dimension: this.getTooltipDimension(elTooltip),
            addPosition: tui.util.extend({
                left: 0,
                top: 0
            }, this.options.addPosition),
            positionOption: this.options.position || '',
            eventPosition: params.eventPosition
        }, params));

        this.moveToPosition(elTooltip, position, prevPosition);
        this._fireShowAnimation(indexes);
    },

    /**
     * Hide tooltip.
     * @param {HTMLElement} elTooltip tooltip element
     * @param {function} callback callback
     */
    hideTooltip: function(elTooltip) {
        var that = this,
            indexes = this._getIndexesCustomAttribute(elTooltip);
        this._setShowedCustomAttribute(elTooltip, false);
        this._fireHideAnimation(indexes);

        if (this._isChangedIndexes(this.prevIndexes, indexes)) {
            delete this.prevIndexes;
        }

        setTimeout(function() {
            if (that._isShowedTooltip(elTooltip)) {
                return;
            }
            that.hideAnimation(elTooltip);

            that = null;
            indexes = null;
        }, chartConst.HIDE_DELAY);
    },

    /**
     * Attach event
     * @param {HTMLElement} el target element
     */
    attachEvent: function(el) {
        event.bindEvent('mouseover', el, tui.util.bind(this.onMouseover, this));
        event.bindEvent('mouseout', el, tui.util.bind(this.onMouseout, this));
    }
});

tui.util.CustomEvents.mixin(Tooltip);

module.exports = Tooltip;

},{"../const":15,"../helpers/domHandler":26,"../helpers/eventListener":27,"../helpers/templateMaker":30,"./tooltipBase":56,"./tooltipTemplate":57}],56:[function(require,module,exports){
/**
 * @fileoverview TooltipBase is base class of tooltip components.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var dom = require('../helpers/domHandler'),
    renderUtil = require('../helpers/renderUtil');

var TooltipBase = tui.util.defineClass(/** @lends TooltipBase.prototype */ {
    /**
     * TooltipBase is base class of tooltip components.
     * @constructs TooltipBase
     * @param {object} params parameters
     *      @param {array.<number>} params.values converted values
     *      @param {array} params.labels labels
     *      @param {array} params.legendLabels legend labels
     *      @param {object} params.bound axis bound
     *      @param {object} params.theme axis theme
     */
    init: function(params) {
        tui.util.extend(this, params);
        /**
         * className
         * @type {string}
         */
        this.className = 'tui-chart-tooltip-area';

        /**
         * TooltipBase container.
         * @type {HTMLElement}
         */
        this.elLayout = null;

        /**
         * TooltipBase base data.
         * @type {array.<array.<object>>}
         */
        this.data = this.makeTooltipData();

        this.suffix = this.options.suffix ? '&nbsp;' + this.options.suffix : '';
    },


    /**
     * To make tooltip data.
     * @abstract
     */
    makeTooltipData: function() {},

    /**
     * Get tooltip layout element.
     * @returns {HTMLElement} layout element
     * @private
     */
    _getTooltipLayoutElement: function() {
        var elLayout = document.getElementById(this.chartId);
        if (!elLayout) {
            elLayout = dom.create('DIV', this.className);
            elLayout.id = this.chartId;
        }
        return elLayout;
    },

    /**
     * Render tooltip.
     * @param {{position: object}} bound tooltip bound
     * @returns {HTMLElement} tooltip element
     */
    render: function() {
        var el = this._getTooltipLayoutElement(),
            bound = this.bound;

        renderUtil.renderPosition(el, bound.position);

        this.elLayout = el;

        return el;
    },

    /**
     * Create tooltip element.
     * @returns {HTMLElement} tooltip element
     * @private
     */
    _createTooltipElement: function() {
        var elTooltip;
        if (!this.elLayout.firstChild) {
            elTooltip = dom.create('DIV', 'tui-chart-tooltip');
            dom.append(this.elLayout, elTooltip);
        } else {
            elTooltip = this.elLayout.firstChild;
        }
        return elTooltip;
    },

    /**
     * Get tooltip element.
     * @returns {HTMLElement} tooltip element
     * @private
     */
    _getTooltipElement: function() {
        if (!this.elTooltip) {
            this.elTooltip = this._createTooltipElement();
        }
        return this.elTooltip;
    },

    /**
     * onShow is callback of custom event showTooltip for SeriesView.
     * @param {object} params coordinate event parameters
     */
    onShow: function(params) {
        var elTooltip = this._getTooltipElement(),
            prevPosition;
        if (elTooltip.offsetWidth) {
            prevPosition = {
                left: elTooltip.offsetLeft,
                top: elTooltip.offsetTop
            };
        }

        this.showTooltip(elTooltip, params, prevPosition);
    },

    /**
     * Get tooltip dimension
     * @param {HTMLElement} elTooltip tooltip element
     * @returns {{width: number, height: number}} rendered tooltip dimension
     */
    getTooltipDimension: function(elTooltip) {
        return {
            width: elTooltip.offsetWidth,
            height: elTooltip.offsetHeight
        };
    },

    /**
     * Cancel hide tooltip.
     * @private
     */
    _cancelHide: function() {
        if (!this.activeHider) {
            return;
        }
        clearInterval(this.activeHider.timerId);
        this.activeHider.setOpacity(1);
    },

    /**
     * Cancel slide tooltip.
     * @private
     */
    _cancelSlide: function() {
        if (!this.activeSliders) {
            return;
        }

        tui.util.forEach(this.activeSliders, function(slider) {
            clearInterval(slider.timerId);
        });

        this._completeSlide();
    },

    /**
     * Move to Position.
     * @param {HTMLElement} elTooltip tooltip element
     * @param {{left: number, top: number}} position position
     * @param {{left: number, top: number}} prevPosition prev position
     */
    moveToPosition: function(elTooltip, position, prevPosition) {
        if (prevPosition) {
            this._cancelHide();
            this._cancelSlide();
            this._slideTooltip(elTooltip, prevPosition, position);
        } else {
            renderUtil.renderPosition(elTooltip, position);
        }
    },

    /**
     * Get slider.
     * @param {HTMLElement} element element
     * @param {string} type slide type (horizontal or vertical)
     * @returns {object} effect object
     * @private
     */
    _getSlider: function(element, type) {
        if (!this.slider) {
            this.slider = {};
        }

        if (!this.slider[type]) {
            this.slider[type] = new tui.component.Effects.Slide({
                flow: type,
                element: element,
                duration: 100
            });
        }
        return this.slider[type];
    },

    /**
     * Complete slide tooltip.
     * @private
     */
    _completeSlide: function() {
        delete this.activeSliders;
    },

    /**
     * Slide tooltip
     * @param {HTMLElement} elTooltip tooltip element
     * @param {{left: number, top: number}} prevPosition prev position
     * @param {{left: number, top: number}} position position
     * @private
     */
    _slideTooltip: function(elTooltip, prevPosition, position) {
        var vSlider = this._getSlider(elTooltip, 'vertical'),
            hSlider = this._getSlider(elTooltip, 'horizontal'),
            moveTop = prevPosition.top - position.top,
            moveLeft = prevPosition.left - position.left,
            vDirection = moveTop > 0 ? 'forword' : 'backword',
            hDirection = moveTop > 0 ? 'forword' : 'backword',
            activeSliders = [],
            complate = tui.util.bind(this._completeSlide, this);

        if (moveTop) {
            vSlider.setDistance(moveTop);
            vSlider.action({
                direction: vDirection,
                start: prevPosition.top,
                complete: complate
            });
            activeSliders.push(vSlider);
        }

        if (moveLeft) {
            hSlider.setDistance(moveLeft);
            hSlider.action({
                direction: hDirection,
                start: prevPosition.left,
                complete: complate
            });
            activeSliders.push(vSlider);
        }

        if (activeSliders.length) {
            this.activeSliders = activeSliders;
        }
    },

    /**
     * onHide is callback of custom event hideTooltip for SeriesView
     * @param {number} index index
     */
    onHide: function(index) {
        var elTooltip = this._getTooltipElement();
        this.hideTooltip(elTooltip, index);
    },

    /**
     * Get hider.
     * @param {HTMLElement} element element
     * @returns {object} effect object
     * @private
     */
    _getHider: function(element) {
        if (!this.hider) {
            this.hider = new tui.component.Effects.Fade({
                element: element,
                duration: 100
            });
        }

        return this.hider;
    },

    hideAnimation: function(elTooltip) {
        this.activeHider = this._getHider(elTooltip);
        this.activeHider.action({
            start: 1,
            end: 0,
            complete: function() {
                dom.removeClass(elTooltip, 'show');
                elTooltip.style.cssText = '';
            }
        });
    }
});

tui.util.CustomEvents.mixin(TooltipBase);

module.exports = TooltipBase;

},{"../helpers/domHandler":26,"../helpers/renderUtil":28}],57:[function(require,module,exports){
/**
 * @fileoverview This is templates of tooltip.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

var templateMaker = require('../helpers/templateMaker');

var tags = {
    HTML_DEFAULT_TEMPLATE: '<div class="tui-chart-default-tooltip">' +
        '<div>{{ category }}</div>' +
        '<div>' +
            '<span>{{ legend }}</span>:' +
            '&nbsp;<span>{{ value }}</span>' +
            '<span>{{ suffix }}</span>' +
        '</div>' +
    '</div>',
    HTML_GROUP: '<div class="tui-chart-default-tooltip tui-chart-group-tooltip">' +
        '<div>{{ category }}</div>' +
        '{{ items }}' +
    '</div>',
    HTML_GROUP_ITEM: '<div>' +
        '<div class="tui-chart-legend-rect {{ chartType }}" style="{{ cssText }}"></div>&nbsp;<span>{{ legend }}</span>:' +
        '&nbsp;<span>{{ value }}</span>' +
        '<span>{{ suffix }}</span>' +
    '</div>',
    GROUP_CSS_TEXT: 'background-color:{{ color }}'
};

module.exports = {
    tplDefault: templateMaker.template(tags.HTML_DEFAULT_TEMPLATE),
    tplGroup: templateMaker.template(tags.HTML_GROUP),
    tplGroupItem: templateMaker.template(tags.HTML_GROUP_ITEM),
    tplGroupCssText: templateMaker.template(tags.GROUP_CSS_TEXT)
};

},{"../helpers/templateMaker":30}]},{},[3,35])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXhlcy9heGlzLmpzIiwic3JjL2pzL2F4ZXMvYXhpc1RlbXBsYXRlLmpzIiwic3JjL2pzL2NoYXJ0LmpzIiwic3JjL2pzL2NoYXJ0cy9hcmVhQ2hhcnQuanMiLCJzcmMvanMvY2hhcnRzL2F4aXNUeXBlTWl4ZXIuanMiLCJzcmMvanMvY2hhcnRzL2JhckNoYXJ0LmpzIiwic3JjL2pzL2NoYXJ0cy9jaGFydEJhc2UuanMiLCJzcmMvanMvY2hhcnRzL2NvbHVtbkNoYXJ0LmpzIiwic3JjL2pzL2NoYXJ0cy9jb21ib0NoYXJ0LmpzIiwic3JjL2pzL2NoYXJ0cy9saW5lQ2hhcnQuanMiLCJzcmMvanMvY2hhcnRzL2xpbmVUeXBlTWl4ZXIuanMiLCJzcmMvanMvY2hhcnRzL3BpZUNoYXJ0LmpzIiwic3JjL2pzL2NoYXJ0cy92ZXJ0aWNhbFR5cGVNaXhlci5qcyIsInNyYy9qcy9jb2RlLXNuaXBwZXQtdXRpbC5qcyIsInNyYy9qcy9jb25zdC5qcyIsInNyYy9qcy9ldmVudEhhbmRsZUxheWVycy9ldmVudEhhbmRsZUxheWVyQmFzZS5qcyIsInNyYy9qcy9ldmVudEhhbmRsZUxheWVycy9ncm91cGVkRXZlbnRIYW5kbGVMYXllci5qcyIsInNyYy9qcy9ldmVudEhhbmRsZUxheWVycy9saW5lVHlwZUV2ZW50SGFuZGxlTGF5ZXIuanMiLCJzcmMvanMvZmFjdG9yaWVzL2NoYXJ0RmFjdG9yeS5qcyIsInNyYy9qcy9mYWN0b3JpZXMvcGx1Z2luRmFjdG9yeS5qcyIsInNyYy9qcy9mYWN0b3JpZXMvdGhlbWVGYWN0b3J5LmpzIiwic3JjL2pzL2hlbHBlcnMvYXhpc0RhdGFNYWtlci5qcyIsInNyYy9qcy9oZWxwZXJzL2JvdW5kc01ha2VyLmpzIiwic3JjL2pzL2hlbHBlcnMvY2FsY3VsYXRvci5qcyIsInNyYy9qcy9oZWxwZXJzL2RhdGFDb252ZXJ0ZXIuanMiLCJzcmMvanMvaGVscGVycy9kb21IYW5kbGVyLmpzIiwic3JjL2pzL2hlbHBlcnMvZXZlbnRMaXN0ZW5lci5qcyIsInNyYy9qcy9oZWxwZXJzL3JlbmRlclV0aWwuanMiLCJzcmMvanMvaGVscGVycy9zdGF0ZS5qcyIsInNyYy9qcy9oZWxwZXJzL3RlbXBsYXRlTWFrZXIuanMiLCJzcmMvanMvbGVnZW5kcy9sZWdlbmQuanMiLCJzcmMvanMvbGVnZW5kcy9sZWdlbmRUZW1wbGF0ZS5qcyIsInNyYy9qcy9wbG90cy9wbG90LmpzIiwic3JjL2pzL3Bsb3RzL3Bsb3RUZW1wbGF0ZS5qcyIsInNyYy9qcy9wbHVnaW5zL3BsdWdpblJhcGhhZWwuanMiLCJzcmMvanMvcGx1Z2lucy9yYXBoYWVsQXJlYUNoYXJ0LmpzIiwic3JjL2pzL3BsdWdpbnMvcmFwaGFlbEJhckNoYXJ0LmpzIiwic3JjL2pzL3BsdWdpbnMvcmFwaGFlbExpbmVDaGFydC5qcyIsInNyYy9qcy9wbHVnaW5zL3JhcGhhZWxMaW5lVHlwZUJhc2UuanMiLCJzcmMvanMvcGx1Z2lucy9yYXBoYWVsUGllQ2hhcnQuanMiLCJzcmMvanMvcGx1Z2lucy9yYXBoYWVsUmVuZGVyVXRpbC5qcyIsInNyYy9qcy9yZWdpc3RlckNoYXJ0cy5qcyIsInNyYy9qcy9yZWdpc3RlclRoZW1lcy5qcyIsInNyYy9qcy9zZXJpZXMvYXJlYUNoYXJ0U2VyaWVzLmpzIiwic3JjL2pzL3Nlcmllcy9iYXJDaGFydFNlcmllcy5qcyIsInNyYy9qcy9zZXJpZXMvYmFyVHlwZVNlcmllc0Jhc2UuanMiLCJzcmMvanMvc2VyaWVzL2NvbHVtbkNoYXJ0U2VyaWVzLmpzIiwic3JjL2pzL3Nlcmllcy9saW5lQ2hhcnRTZXJpZXMuanMiLCJzcmMvanMvc2VyaWVzL2xpbmVUeXBlU2VyaWVzQmFzZS5qcyIsInNyYy9qcy9zZXJpZXMvcGllQ2hhcnRTZXJpZXMuanMiLCJzcmMvanMvc2VyaWVzL3Nlcmllcy5qcyIsInNyYy9qcy9zZXJpZXMvc2VyaWVzVGVtcGxhdGUuanMiLCJzcmMvanMvdGhlbWVzL2RlZmF1bHRUaGVtZS5qcyIsInNyYy9qcy90b29sdGlwcy9ncm91cFRvb2x0aXAuanMiLCJzcmMvanMvdG9vbHRpcHMvdG9vbHRpcC5qcyIsInNyYy9qcy90b29sdGlwcy90b29sdGlwQmFzZS5qcyIsInNyYy9qcy90b29sdGlwcy90b29sdGlwVGVtcGxhdGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6YkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcm5CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25YQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4bUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3UkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMU5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN09BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyWUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOWNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogQGZpbGVvdmVydmlldyAgQXhpcyBjb21wb25lbnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBkb20gPSByZXF1aXJlKCcuLi9oZWxwZXJzL2RvbUhhbmRsZXInKSxcbiAgICBjaGFydENvbnN0ID0gcmVxdWlyZSgnLi4vY29uc3QnKSxcbiAgICBjYWxjdWxhdG9yID0gcmVxdWlyZSgnLi4vaGVscGVycy9jYWxjdWxhdG9yJyksXG4gICAgcmVuZGVyVXRpbCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvcmVuZGVyVXRpbCcpLFxuICAgIGF4aXNUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vYXhpc1RlbXBsYXRlJyk7XG5cbnZhciBBeGlzID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBBeGlzLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogQXhpcyBjb21wb25lbnQuXG4gICAgICogQGNvbnN0cnVjdHMgQXhpc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHt7XG4gICAgICogICAgICAgICAgbGFiZWxzOiBhcnJheS48c3RyaW5nPixcbiAgICAgKiAgICAgICAgICB0aWNrQ291bnQ6IG51bWJlcixcbiAgICAgKiAgICAgICAgICBpc0xhYmVsQXhpczogYm9vbGVhbixcbiAgICAgKiAgICAgICAgICBpc1ZlcnRpY2FsOiBib29sZWFuXG4gICAgICogICAgICB9fSBwYXJhbXMuZGF0YSBheGlzIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuYm91bmQgYXhpcyBib3VuZFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBheGlzIHRoZW1lXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgYXhpcyBvcHRpb25zXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHR1aS51dGlsLmV4dGVuZCh0aGlzLCBwYXJhbXMpO1xuICAgICAgICAvKipcbiAgICAgICAgICogQXhpcyB2aWV3IGNsYXNzTmFtZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jbGFzc05hbWUgPSAndHVpLWNoYXJ0LWF4aXMtYXJlYSc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBheGlzLlxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gYXhpcyBhcmVhIGJhc2UgZWxlbWVudFxuICAgICAqL1xuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBkYXRhID0gdGhpcy5kYXRhLFxuICAgICAgICAgICAgdGhlbWUgPSB0aGlzLnRoZW1lLFxuICAgICAgICAgICAgaXNWZXJ0aWNhbCA9ICEhZGF0YS5pc1ZlcnRpY2FsLFxuICAgICAgICAgICAgaXNQb3NpdGlvblJpZ2h0ID0gZGF0YS5pc1Bvc2l0aW9uUmlnaHQsXG4gICAgICAgICAgICBvcHRpb25zID0gdGhpcy5vcHRpb25zLFxuICAgICAgICAgICAgYm91bmQgPSB0aGlzLmJvdW5kLFxuICAgICAgICAgICAgZGltZW5zaW9uID0gYm91bmQuZGltZW5zaW9uLFxuICAgICAgICAgICAgc2l6ZSA9IGlzVmVydGljYWwgPyBkaW1lbnNpb24uaGVpZ2h0IDogZGltZW5zaW9uLndpZHRoLFxuICAgICAgICAgICAgZWwgPSBkb20uY3JlYXRlKCdESVYnLCB0aGlzLmNsYXNzTmFtZSksXG4gICAgICAgICAgICBlbFRpdGxlQXJlYSA9IHRoaXMuX3JlbmRlclRpdGxlQXJlYSh7XG4gICAgICAgICAgICAgICAgdGl0bGU6IG9wdGlvbnMudGl0bGUsXG4gICAgICAgICAgICAgICAgdGhlbWU6IHRoZW1lLnRpdGxlLFxuICAgICAgICAgICAgICAgIGlzVmVydGljYWw6IGlzVmVydGljYWwsXG4gICAgICAgICAgICAgICAgaXNQb3NpdGlvblJpZ2h0OiBpc1Bvc2l0aW9uUmlnaHQsXG4gICAgICAgICAgICAgICAgc2l6ZTogc2l6ZVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBlbExhYmVsQXJlYSA9IHRoaXMuX3JlbmRlckxhYmVsQXJlYShzaXplLCBkaW1lbnNpb24ud2lkdGgsIGJvdW5kLmRlZ3JlZSksXG4gICAgICAgICAgICBlbFRpY2tBcmVhO1xuXG4gICAgICAgIGlmICghdGhpcy5hbGlnbmVkIHx8ICFpc1ZlcnRpY2FsKSB7XG4gICAgICAgICAgICBlbFRpY2tBcmVhID0gdGhpcy5fcmVuZGVyVGlja0FyZWEoc2l6ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJEaW1lbnNpb24oZWwsIGRpbWVuc2lvbik7XG4gICAgICAgIHJlbmRlclV0aWwucmVuZGVyUG9zaXRpb24oZWwsIGJvdW5kLnBvc2l0aW9uKTtcbiAgICAgICAgZG9tLmFkZENsYXNzKGVsLCBpc1ZlcnRpY2FsID8gJ3ZlcnRpY2FsJyA6ICdob3Jpem9udGFsJyk7XG4gICAgICAgIGRvbS5hZGRDbGFzcyhlbCwgaXNQb3NpdGlvblJpZ2h0ID8gJ3JpZ2h0JyA6ICcnKTtcbiAgICAgICAgZG9tLmFwcGVuZChlbCwgW2VsVGl0bGVBcmVhLCBlbFRpY2tBcmVhLCBlbExhYmVsQXJlYV0pO1xuXG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGNzcyBzdHlsZSBvZiB0aXRsZSBhcmVhXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxUaXRsZUFyZWEgdGl0bGUgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzaXplICh3aWR0aCBvciBoZWlnaHQpXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpc1Bvc2l0aW9uUmlnaHQgd2hldGhlciByaWdodCBwb3NpdGlvbiBvciBub3Q/XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyVGl0bGVBcmVhU3R5bGU6IGZ1bmN0aW9uKGVsVGl0bGVBcmVhLCBzaXplLCBpc1Bvc2l0aW9uUmlnaHQpIHtcbiAgICAgICAgdmFyIGNzc1RleHRzID0gW1xuICAgICAgICAgICAgcmVuZGVyVXRpbC5jb25jYXRTdHIoJ3dpZHRoOicsIHNpemUsICdweCcpXG4gICAgICAgIF07XG5cbiAgICAgICAgaWYgKGlzUG9zaXRpb25SaWdodCkge1xuICAgICAgICAgICAgY3NzVGV4dHMucHVzaChyZW5kZXJVdGlsLmNvbmNhdFN0cigncmlnaHQ6JywgLXNpemUsICdweCcpKTtcbiAgICAgICAgICAgIGNzc1RleHRzLnB1c2gocmVuZGVyVXRpbC5jb25jYXRTdHIoJ3RvcDonLCAwLCAncHgnKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjc3NUZXh0cy5wdXNoKHJlbmRlclV0aWwuY29uY2F0U3RyKCdsZWZ0OicsIDAsICdweCcpKTtcbiAgICAgICAgICAgIGlmICghcmVuZGVyVXRpbC5pc0lFOCgpKSB7XG4gICAgICAgICAgICAgICAgY3NzVGV4dHMucHVzaChyZW5kZXJVdGlsLmNvbmNhdFN0cigndG9wOicsIHNpemUsICdweCcpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGVsVGl0bGVBcmVhLnN0eWxlLmNzc1RleHQgKz0gJzsnICsgY3NzVGV4dHMuam9pbignOycpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUaXRsZSBhcmVhIHJlbmRlcmVyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLnRpdGxlIGF4aXMgdGl0bGVcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgdGl0bGUgdGhlbWVcbiAgICAgKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gcGFyYW1zLmlzVmVydGljYWwgd2hldGhlciB2ZXJ0aWNhbCBvciBub3Q/XG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5pc1Bvc2l0aW9uUmlnaHQgd2hldGhlciByaWdodCBwb3NpdGlvbiBvciBub3Q/XG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnNpemUgKHdpZHRoIG9yIGhlaWdodClcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHRpdGxlIGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJUaXRsZUFyZWE6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgZWxUaXRsZUFyZWEgPSByZW5kZXJVdGlsLnJlbmRlclRpdGxlKHBhcmFtcy50aXRsZSwgcGFyYW1zLnRoZW1lLCAndHVpLWNoYXJ0LXRpdGxlLWFyZWEnKTtcblxuICAgICAgICBpZiAoZWxUaXRsZUFyZWEgJiYgcGFyYW1zLmlzVmVydGljYWwpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlclRpdGxlQXJlYVN0eWxlKGVsVGl0bGVBcmVhLCBwYXJhbXMuc2l6ZSwgcGFyYW1zLmlzUG9zaXRpb25SaWdodCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZWxUaXRsZUFyZWE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlZG5lciB0aWNrIGFyZWEuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHNpemUgc2l6ZSBvciBoZWlnaHRcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHRpY2sgYXJlYSBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyVGlja0FyZWE6IGZ1bmN0aW9uKHNpemUpIHtcbiAgICAgICAgdmFyIGRhdGEgPSB0aGlzLmRhdGEsXG4gICAgICAgICAgICB0aWNrQ291bnQgPSBkYXRhLnRpY2tDb3VudCxcbiAgICAgICAgICAgIHRpY2tDb2xvciA9IHRoaXMudGhlbWUudGlja0NvbG9yLFxuICAgICAgICAgICAgcG9zaXRpb25zID0gY2FsY3VsYXRvci5tYWtlVGlja1BpeGVsUG9zaXRpb25zKHNpemUsIHRpY2tDb3VudCksXG4gICAgICAgICAgICBlbFRpY2tBcmVhID0gZG9tLmNyZWF0ZSgnRElWJywgJ3R1aS1jaGFydC10aWNrLWFyZWEnKSxcbiAgICAgICAgICAgIHBvc1R5cGUgPSBkYXRhLmlzVmVydGljYWwgPyAnYm90dG9tJyA6ICdsZWZ0JyxcbiAgICAgICAgICAgIGJvcmRlckNvbG9yVHlwZSA9IGRhdGEuaXNWZXJ0aWNhbCA/IChkYXRhLmlzUG9zaXRpb25SaWdodCA/ICdib3JkZXJMZWZ0Q29sb3InIDogJ2JvcmRlclJpZ2h0Q29sb3InKSA6ICdib3JkZXJUb3BDb2xvcicsXG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IGF4aXNUZW1wbGF0ZS50cGxBeGlzVGljayxcbiAgICAgICAgICAgIHRpY2tzSHRtbCA9IHR1aS51dGlsLm1hcChwb3NpdGlvbnMsIGZ1bmN0aW9uKHBvc2l0aW9uLCBpbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciBjc3NUZXh0O1xuICAgICAgICAgICAgICAgIGlmIChkYXRhLmxhYmVsc1tpbmRleF0gPT09IGNoYXJ0Q29uc3QuRU1QVFlfQVhJU19MQUJFTCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNzc1RleHQgPSBbXG4gICAgICAgICAgICAgICAgICAgIHJlbmRlclV0aWwuY29uY2F0U3RyKCdiYWNrZ3JvdW5kLWNvbG9yOicsIHRpY2tDb2xvciksXG4gICAgICAgICAgICAgICAgICAgIHJlbmRlclV0aWwuY29uY2F0U3RyKHBvc1R5cGUsICc6ICcsIHBvc2l0aW9uLCAncHgnKVxuICAgICAgICAgICAgICAgIF0uam9pbignOycpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZSh7Y3NzVGV4dDogY3NzVGV4dH0pO1xuICAgICAgICAgICAgfSwgdGhpcykuam9pbignJyk7XG5cbiAgICAgICAgZWxUaWNrQXJlYS5pbm5lckhUTUwgPSB0aWNrc0h0bWw7XG4gICAgICAgIGVsVGlja0FyZWEuc3R5bGVbYm9yZGVyQ29sb3JUeXBlXSA9IHRpY2tDb2xvcjtcblxuICAgICAgICByZXR1cm4gZWxUaWNrQXJlYTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBjc3NUZXh0IG9mIHZlcnRpY2FsIGxhYmVsLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBheGlzV2lkdGggYXhpcyB3aWR0aFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB0aXRsZUFyZWFXaWR0aCB0aXRsZSBhcmVhIHdpZHRoXG4gICAgICogQHJldHVybnMge3N0cmluZ30gY3NzVGV4dFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VWZXJ0aWNhbExhYmVsQ3NzVGV4dDogZnVuY3Rpb24oYXhpc1dpZHRoLCB0aXRsZUFyZWFXaWR0aCkge1xuICAgICAgICByZXR1cm4gJzt3aWR0aDonICsgKGF4aXNXaWR0aCAtIHRpdGxlQXJlYVdpZHRoICsgY2hhcnRDb25zdC5WX0xBQkVMX1JJR0hUX1BBRERJTkcpICsgJ3B4JztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGxhYmVsIGFyZWEuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHNpemUgbGFiZWwgYXJlYSBzaXplXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGF4aXNXaWR0aCBheGlzIGFyZWEgd2lkdGhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZGVncmVlIHJvdGF0aW9uIGRlZ3JlZVxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gbGFiZWwgYXJlYSBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyTGFiZWxBcmVhOiBmdW5jdGlvbihzaXplLCBheGlzV2lkdGgsIGRlZ3JlZSkge1xuICAgICAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YSxcbiAgICAgICAgICAgIHRpY2tQaXhlbFBvc2l0aW9ucyA9IGNhbGN1bGF0b3IubWFrZVRpY2tQaXhlbFBvc2l0aW9ucyhzaXplLCBkYXRhLnRpY2tDb3VudCksXG4gICAgICAgICAgICBsYWJlbFNpemUgPSB0aWNrUGl4ZWxQb3NpdGlvbnNbMV0gLSB0aWNrUGl4ZWxQb3NpdGlvbnNbMF0sXG4gICAgICAgICAgICBwb3NUeXBlID0gJ2xlZnQnLFxuICAgICAgICAgICAgY3NzVGV4dHMgPSB0aGlzLl9tYWtlTGFiZWxDc3NUZXh0cyh7XG4gICAgICAgICAgICAgICAgaXNWZXJ0aWNhbDogZGF0YS5pc1ZlcnRpY2FsLFxuICAgICAgICAgICAgICAgIGlzTGFiZWxBeGlzOiBkYXRhLmlzTGFiZWxBeGlzLFxuICAgICAgICAgICAgICAgIGxhYmVsU2l6ZTogbGFiZWxTaXplXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGVsTGFiZWxBcmVhID0gZG9tLmNyZWF0ZSgnRElWJywgJ3R1aS1jaGFydC1sYWJlbC1hcmVhJyksXG4gICAgICAgICAgICBhcmVhQ3NzVGV4dCA9IHJlbmRlclV0aWwubWFrZUZvbnRDc3NUZXh0KHRoaXMudGhlbWUubGFiZWwpLFxuICAgICAgICAgICAgbGFiZWxzSHRtbCwgdGl0bGVBcmVhV2lkdGg7XG5cbiAgICAgICAgaWYgKGRhdGEuaXNWZXJ0aWNhbCkge1xuICAgICAgICAgICAgcG9zVHlwZSA9IGRhdGEuaXNMYWJlbEF4aXMgPyAndG9wJyA6ICdib3R0b20nO1xuICAgICAgICAgICAgdGl0bGVBcmVhV2lkdGggPSB0aGlzLl9nZXRSZW5kZXJlZFRpdGxlSGVpZ2h0KCkgKyBjaGFydENvbnN0LlRJVExFX0FSRUFfV0lEVEhfUEFERElORztcbiAgICAgICAgICAgIGFyZWFDc3NUZXh0ICs9IHRoaXMuX21ha2VWZXJ0aWNhbExhYmVsQ3NzVGV4dChheGlzV2lkdGgsIHRpdGxlQXJlYVdpZHRoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRpY2tQaXhlbFBvc2l0aW9ucy5sZW5ndGggPSBkYXRhLmxhYmVscy5sZW5ndGg7XG5cbiAgICAgICAgbGFiZWxzSHRtbCA9IHRoaXMuX21ha2VMYWJlbHNIdG1sKHtcbiAgICAgICAgICAgIHBvc2l0aW9uczogdGlja1BpeGVsUG9zaXRpb25zLFxuICAgICAgICAgICAgbGFiZWxzOiBkYXRhLmxhYmVscyxcbiAgICAgICAgICAgIHBvc1R5cGU6IHBvc1R5cGUsXG4gICAgICAgICAgICBjc3NUZXh0czogY3NzVGV4dHMsXG4gICAgICAgICAgICBsYWJlbFNpemU6IGxhYmVsU2l6ZSxcbiAgICAgICAgICAgIGRlZ3JlZTogZGVncmVlLFxuICAgICAgICAgICAgdGhlbWU6IHRoaXMudGhlbWUubGFiZWxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZWxMYWJlbEFyZWEuaW5uZXJIVE1MID0gbGFiZWxzSHRtbDtcbiAgICAgICAgZWxMYWJlbEFyZWEuc3R5bGUuY3NzVGV4dCA9IGFyZWFDc3NUZXh0O1xuXG4gICAgICAgIHRoaXMuX2NoYW5nZUxhYmVsQXJlYVBvc2l0aW9uKHtcbiAgICAgICAgICAgIGVsTGFiZWxBcmVhOiBlbExhYmVsQXJlYSxcbiAgICAgICAgICAgIGlzVmVydGljYWw6IGRhdGEuaXNWZXJ0aWNhbCxcbiAgICAgICAgICAgIGlzTGFiZWxBeGlzOiBkYXRhLmlzTGFiZWxBeGlzLFxuICAgICAgICAgICAgdGhlbWU6IHRoaXMudGhlbWUubGFiZWwsXG4gICAgICAgICAgICBsYWJlbFNpemU6IGxhYmVsU2l6ZSxcbiAgICAgICAgICAgIGFsaWduZWQ6IGRhdGEuYWxpZ25lZFxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gZWxMYWJlbEFyZWE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBoZWlnaHQgb2YgdGl0bGUgYXJlYSA7XG4gICAgICogQHJldHVybnMge251bWJlcn0gaGVpZ2h0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0UmVuZGVyZWRUaXRsZUhlaWdodDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB0aXRsZSA9IHRoaXMub3B0aW9ucy50aXRsZSxcbiAgICAgICAgICAgIHRoZW1lID0gdGhpcy50aGVtZS50aXRsZSxcbiAgICAgICAgICAgIHJlc3VsdCA9IHRpdGxlID8gcmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsSGVpZ2h0KHRpdGxlLCB0aGVtZSkgOiAwO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGNzc1RleHRzIG9mIGxhYmVsLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyXG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5pc1ZlcnRpY2FsIHdoZXRoZXIgdmVydGljYWwgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5pc0xhYmVsQXhpcyB3aGV0aGVyIGxhYmVsIGF4aXMgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmxhYmVsU2l6ZSBsYWJlbCBzaXplICh3aWR0aCBvciBoZWlnaHQpXG4gICAgICogQHJldHVybnMge3N0cmluZ1tdfSBjc3NUZXh0c1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VMYWJlbENzc1RleHRzOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGNzc1RleHRzID0gW107XG5cbiAgICAgICAgaWYgKHBhcmFtcy5pc1ZlcnRpY2FsICYmIHBhcmFtcy5pc0xhYmVsQXhpcykge1xuICAgICAgICAgICAgY3NzVGV4dHMucHVzaChyZW5kZXJVdGlsLmNvbmNhdFN0cignaGVpZ2h0OicsIHBhcmFtcy5sYWJlbFNpemUsICdweCcpKTtcbiAgICAgICAgICAgIGNzc1RleHRzLnB1c2gocmVuZGVyVXRpbC5jb25jYXRTdHIoJ2xpbmUtaGVpZ2h0OicsIHBhcmFtcy5sYWJlbFNpemUsICdweCcpKTtcbiAgICAgICAgfSBlbHNlIGlmICghcGFyYW1zLmlzVmVydGljYWwpIHtcbiAgICAgICAgICAgIGNzc1RleHRzLnB1c2gocmVuZGVyVXRpbC5jb25jYXRTdHIoJ3dpZHRoOicsIHBhcmFtcy5sYWJlbFNpemUsICdweCcpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjc3NUZXh0cztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gY2FsY3VsYXRlIHJvdGF0aW9uIG1vdmluZyBwb3NpdGlvbi5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuZGVncmVlIHJvdGF0aW9uIGRlZ3JlZVxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5sYWJlbEhlaWdodCBsYWJlbCBoZWlnaHRcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubGVmdCBub3JtYWwgbGVmdFxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5tb3ZlTGVmdCBtb3ZlIGxlZnRcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMudG9wIHRvcFxuICAgICAqIEByZXR1cm5zIHt7dG9wOm51bWJlciwgbGVmdDogbnVtYmVyfX0gcG9zaXRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jYWxjdWxhdGVSb3RhdGlvbk1vdmluZ1Bvc2l0aW9uOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIG1vdmVMZWZ0ID0gcGFyYW1zLm1vdmVMZWZ0O1xuICAgICAgICBpZiAocGFyYW1zLmRlZ3JlZSA9PT0gY2hhcnRDb25zdC5BTkdMRV84NSkge1xuICAgICAgICAgICAgbW92ZUxlZnQgKz0gY2FsY3VsYXRvci5jYWxjdWxhdGVBZGphY2VudChjaGFydENvbnN0LkFOR0xFXzkwIC0gcGFyYW1zLmRlZ3JlZSwgcGFyYW1zLmxhYmVsSGVpZ2h0IC8gMik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdG9wOiBwYXJhbXMudG9wLFxuICAgICAgICAgICAgbGVmdDogcGFyYW1zLmxlZnQgLSBtb3ZlTGVmdFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBjYWxjdWxhdGUgcm90YXRpb24gbW92aW5nIHBvc2l0aW9uIGZvciBpZTguXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmRlZ3JlZSByb3RhdGlvbiBkZWdyZWVcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubGFiZWxXaWR0aCBsYWJlbCB3aWR0aFxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5sYWJlbEhlaWdodCBsYWJlbCBoZWlnaHRcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubGVmdCBub3JtYWwgbGVmdFxuICAgICAqICAgICAgQHBhcmFtIHsoc3RyaW5nIHwgbnVtYmVyKX0gcGFyYW1zLmxhYmVsIGxhYmVsXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gdGhlbWUgbGFiZWwgdGhlbWVcbiAgICAgKiBAcmV0dXJucyB7e3RvcDpudW1iZXIsIGxlZnQ6IG51bWJlcn19IHBvc2l0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2FsY3VsYXRlUm90YXRpb25Nb3ZpbmdQb3NpdGlvbkZvcklFODogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBsYWJlbFdpZHRoID0gcmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsV2lkdGgocGFyYW1zLmxhYmVsLCBwYXJhbXMudGhlbWUpLFxuICAgICAgICAgICAgc21hbGxBcmVhV2lkdGggPSBjYWxjdWxhdG9yLmNhbGN1bGF0ZUFkamFjZW50KGNoYXJ0Q29uc3QuQU5HTEVfOTAgLSBwYXJhbXMuZGVncmVlLCBwYXJhbXMubGFiZWxIZWlnaHQgLyAyKSxcbiAgICAgICAgICAgIG5ld0xhYmVsV2lkdGggPSAoY2FsY3VsYXRvci5jYWxjdWxhdGVBZGphY2VudChwYXJhbXMuZGVncmVlLCBsYWJlbFdpZHRoIC8gMikgKyBzbWFsbEFyZWFXaWR0aCkgKiAyLFxuICAgICAgICAgICAgY29sbGVjdExlZnQgPSBsYWJlbFdpZHRoIC0gbmV3TGFiZWxXaWR0aCxcbiAgICAgICAgICAgIG1vdmVMZWZ0ID0gKHBhcmFtcy5sYWJlbFdpZHRoIC8gMikgLSAoc21hbGxBcmVhV2lkdGggKiAyKTtcblxuICAgICAgICBpZiAocGFyYW1zLmRlZ3JlZSA9PT0gY2hhcnRDb25zdC5BTkdMRV84NSkge1xuICAgICAgICAgICAgbW92ZUxlZnQgKz0gc21hbGxBcmVhV2lkdGg7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdG9wOiBjaGFydENvbnN0LlhBWElTX0xBQkVMX1RPUF9NQVJHSU4sXG4gICAgICAgICAgICBsZWZ0OiBwYXJhbXMubGVmdCArIGNvbGxlY3RMZWZ0IC0gbW92ZUxlZnRcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBjc3NUZXh0IGZvciByb3RhdGlvbiBtb3ZpbmcuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmRlZ3JlZSByb3RhdGlvbiBkZWdyZWVcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubGFiZWxXaWR0aCBsYWJlbCB3aWR0aFxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5sYWJlbEhlaWdodCBsYWJlbCBoZWlnaHRcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubGVmdCBub3JtYWwgbGVmdFxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5tb3ZlTGVmdCBtb3ZlIGxlZnRcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMudG9wIHRvcFxuICAgICAqICAgICAgQHBhcmFtIHsoc3RyaW5nIHwgbnVtYmVyKX0gcGFyYW1zLmxhYmVsIGxhYmVsXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gdGhlbWUgbGFiZWwgdGhlbWVcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBjc3NUZXh0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUNzc1RleHRGb3JSb3RhdGlvbk1vdmluZzogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBwb3NpdGlvbjtcbiAgICAgICAgaWYgKHJlbmRlclV0aWwuaXNJRTgoKSkge1xuICAgICAgICAgICAgcG9zaXRpb24gPSB0aGlzLl9jYWxjdWxhdGVSb3RhdGlvbk1vdmluZ1Bvc2l0aW9uRm9ySUU4KHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwb3NpdGlvbiA9IHRoaXMuX2NhbGN1bGF0ZVJvdGF0aW9uTW92aW5nUG9zaXRpb24ocGFyYW1zKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVuZGVyVXRpbC5jb25jYXRTdHIoJ2xlZnQ6JywgcG9zaXRpb24ubGVmdCwgJ3B4JywgJzt0b3A6JywgcG9zaXRpb24udG9wLCAncHgnKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBodG1sIG9mIHJvdGF0aW9uIGxhYmVscy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPG9iamVjdD59IHBhcmFtcy5wb3NpdGlvbnMgbGFiZWwgcG9zaXRpb24gYXJyYXlcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nW119IHBhcmFtcy5sYWJlbHMgbGFiZWwgYXJyYXlcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMucG9zVHlwZSBwb3NpdGlvbiB0eXBlIChsZWZ0IG9yIGJvdHRvbSlcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nW119IHBhcmFtcy5jc3NUZXh0cyBjc3MgYXJyYXlcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBsYWJlbHMgaHRtbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VSb3RhdGlvbkxhYmVsc0h0bWw6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgdGVtcGxhdGUgPSBheGlzVGVtcGxhdGUudHBsQXhpc0xhYmVsLFxuICAgICAgICAgICAgbGFiZWxIZWlnaHQgPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxIZWlnaHQocGFyYW1zLmxhYmVsc1swXSwgcGFyYW1zLnRoZW1lKSxcbiAgICAgICAgICAgIGxhYmVsQ3NzVGV4dCA9IHBhcmFtcy5jc3NUZXh0cy5sZW5ndGggPyBwYXJhbXMuY3NzVGV4dHMuam9pbignOycpICsgJzsnIDogJycsXG4gICAgICAgICAgICBhZGRDbGFzcyA9ICcgcm90YXRpb24nICsgcGFyYW1zLmRlZ3JlZSxcbiAgICAgICAgICAgIGhhbGZXaWR0aCA9IHBhcmFtcy5sYWJlbFNpemUgLyAyLFxuICAgICAgICAgICAgbW92ZUxlZnQgPSBjYWxjdWxhdG9yLmNhbGN1bGF0ZUFkamFjZW50KHBhcmFtcy5kZWdyZWUsIGhhbGZXaWR0aCksXG4gICAgICAgICAgICB0b3AgPSBjYWxjdWxhdG9yLmNhbGN1bGF0ZU9wcG9zaXRlKHBhcmFtcy5kZWdyZWUsIGhhbGZXaWR0aCkgKyBjaGFydENvbnN0LlhBWElTX0xBQkVMX1RPUF9NQVJHSU4sXG4gICAgICAgICAgICBsYWJlbHNIdG1sID0gdHVpLnV0aWwubWFwKHBhcmFtcy5wb3NpdGlvbnMsIGZ1bmN0aW9uKHBvc2l0aW9uLCBpbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciBsYWJlbCA9IHBhcmFtcy5sYWJlbHNbaW5kZXhdLFxuICAgICAgICAgICAgICAgICAgICByb3RhdGlvbkNzc1RleHQgPSB0aGlzLl9tYWtlQ3NzVGV4dEZvclJvdGF0aW9uTW92aW5nKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZ3JlZTogcGFyYW1zLmRlZ3JlZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsSGVpZ2h0OiBsYWJlbEhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsV2lkdGg6IHBhcmFtcy5sYWJlbFNpemUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3A6IHRvcCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6IHBvc2l0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgbW92ZUxlZnQ6IG1vdmVMZWZ0LFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGxhYmVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6IHBhcmFtcy50aGVtZVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGFkZENsYXNzOiBhZGRDbGFzcyxcbiAgICAgICAgICAgICAgICAgICAgY3NzVGV4dDogbGFiZWxDc3NUZXh0ICsgcm90YXRpb25Dc3NUZXh0LFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogbGFiZWxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sIHRoaXMpLmpvaW4oJycpO1xuXG4gICAgICAgIHJldHVybiBsYWJlbHNIdG1sO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGh0bWwgb2Ygbm9ybWFsIGxhYmVscy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPG9iamVjdD59IHBhcmFtcy5wb3NpdGlvbnMgbGFiZWwgcG9zaXRpb24gYXJyYXlcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nW119IHBhcmFtcy5sYWJlbHMgbGFiZWwgYXJyYXlcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMucG9zVHlwZSBwb3NpdGlvbiB0eXBlIChsZWZ0IG9yIGJvdHRvbSlcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nW119IHBhcmFtcy5jc3NUZXh0cyBjc3MgYXJyYXlcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBsYWJlbHMgaHRtbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VOb3JtYWxMYWJlbHNIdG1sOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIHRlbXBsYXRlID0gYXhpc1RlbXBsYXRlLnRwbEF4aXNMYWJlbCxcbiAgICAgICAgICAgIGxhYmVsQ3NzVGV4dCA9IHBhcmFtcy5jc3NUZXh0cy5sZW5ndGggPyBwYXJhbXMuY3NzVGV4dHMuam9pbignOycpICsgJzsnIDogJycsXG4gICAgICAgICAgICBsYWJlbHNIdG1sID0gdHVpLnV0aWwubWFwKHBhcmFtcy5wb3NpdGlvbnMsIGZ1bmN0aW9uKHBvc2l0aW9uLCBpbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciBhZGRDc3NUZXh0ID0gcmVuZGVyVXRpbC5jb25jYXRTdHIocGFyYW1zLnBvc1R5cGUsICc6JywgcG9zaXRpb24sICdweCcpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGFkZENsYXNzOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgY3NzVGV4dDogbGFiZWxDc3NUZXh0ICsgYWRkQ3NzVGV4dCxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHBhcmFtcy5sYWJlbHNbaW5kZXhdXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCB0aGlzKS5qb2luKCcnKTtcbiAgICAgICAgcmV0dXJuIGxhYmVsc0h0bWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgaHRtbCBvZiBsYWJlbHMuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxvYmplY3Q+fSBwYXJhbXMucG9zaXRpb25zIGxhYmVsIHBvc2l0aW9uIGFycmF5XG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ1tdfSBwYXJhbXMubGFiZWxzIGxhYmVsIGFycmF5XG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLnBvc1R5cGUgcG9zaXRpb24gdHlwZSAobGVmdCBvciBib3R0b20pXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ1tdfSBwYXJhbXMuY3NzVGV4dHMgY3NzIGFycmF5XG4gICAgICogQHJldHVybnMge3N0cmluZ30gbGFiZWxzIGh0bWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlTGFiZWxzSHRtbDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBsYWJlbHNIdG1sO1xuICAgICAgICBpZiAocGFyYW1zLmRlZ3JlZSkge1xuICAgICAgICAgICAgbGFiZWxzSHRtbCA9IHRoaXMuX21ha2VSb3RhdGlvbkxhYmVsc0h0bWwocGFyYW1zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxhYmVsc0h0bWwgPSB0aGlzLl9tYWtlTm9ybWFsTGFiZWxzSHRtbChwYXJhbXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGxhYmVsc0h0bWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoYW5nZSBwb3NpdGlvbiBvZiBsYWJlbCBhcmVhLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyXG4gICAgICogICAgICBAcGFyYW0ge0hUTUxFbGVtZW50fSBwYXJhbXMuZWxMYWJlbEFyZWEgbGFiZWwgYXJlYSBlbGVtZW50XG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5pc1ZlcnRpY2FsIHdoZXRoZXIgdmVydGljYWwgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5pc0xhYmVsQXhpcyB3aGV0aGVyIGxhYmVsIGF4aXMgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge3tmb250U2l6ZTogbnVtYmVyLCBmb250RmFtaWx5OiBzdHJpbmcsIGNvbG9yOiBzdHJpbmd9fSBwYXJhbXMudGhlbWUgbGFiZWwgdGhlbWVcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubGFiZWxTaXplIGxhYmVsIHNpemUgKHdpZHRoIG9yIGhlaWdodClcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jaGFuZ2VMYWJlbEFyZWFQb3NpdGlvbjogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBsYWJlbEhlaWdodDtcblxuICAgICAgICBpZiAocGFyYW1zLmlzTGFiZWxBeGlzICYmICFwYXJhbXMuYWxpZ25lZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhcmFtcy5pc1ZlcnRpY2FsKSB7XG4gICAgICAgICAgICBsYWJlbEhlaWdodCA9IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodCgnQUJDJywgcGFyYW1zLnRoZW1lKTtcbiAgICAgICAgICAgIHBhcmFtcy5lbExhYmVsQXJlYS5zdHlsZS50b3AgPSByZW5kZXJVdGlsLmNvbmNhdFN0cihwYXJzZUludChsYWJlbEhlaWdodCAvIDIsIDEwKSwgJ3B4Jyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYXJhbXMuZWxMYWJlbEFyZWEuc3R5bGUubGVmdCA9IHJlbmRlclV0aWwuY29uY2F0U3RyKCctJywgcGFyc2VJbnQocGFyYW1zLmxhYmVsU2l6ZSAvIDIsIDEwKSwgJ3B4Jyk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBeGlzO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFRoaXMgaXMgdGVtcGxhdGVzIG9yIGF4aXMgdmlldy5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbnZhciB0ZW1wbGF0ZU1ha2VyID0gcmVxdWlyZSgnLi4vaGVscGVycy90ZW1wbGF0ZU1ha2VyJyk7XG5cbnZhciB0YWdzID0ge1xuICAgIEhUTUxfQVhJU19USUNLOiAnPGRpdiBjbGFzcz1cInR1aS1jaGFydC10aWNrXCIgc3R5bGU9XCJ7eyBjc3NUZXh0IH19XCI+PC9kaXY+JyxcbiAgICBIVE1MX0FYSVNfTEFCRUw6ICc8ZGl2IGNsYXNzPVwidHVpLWNoYXJ0LWxhYmVse3sgYWRkQ2xhc3MgfX1cIiBzdHlsZT1cInt7IGNzc1RleHQgfX1cIj48c3Bhbj57eyBsYWJlbCB9fTwvc3Bhbj48L2Rpdj4nXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICB0cGxBeGlzVGljazogdGVtcGxhdGVNYWtlci50ZW1wbGF0ZSh0YWdzLkhUTUxfQVhJU19USUNLKSxcbiAgICB0cGxBeGlzTGFiZWw6IHRlbXBsYXRlTWFrZXIudGVtcGxhdGUodGFncy5IVE1MX0FYSVNfTEFCRUwpXG59O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IGNoYXJ0LmpzIGlzIGVudHJ5IHBvaW50IG9mIFRvYXN0IFVJIENoYXJ0LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuL2NvbnN0JyksXG4gICAgY2hhcnRGYWN0b3J5ID0gcmVxdWlyZSgnLi9mYWN0b3JpZXMvY2hhcnRGYWN0b3J5JyksXG4gICAgcGx1Z2luRmFjdG9yeSA9IHJlcXVpcmUoJy4vZmFjdG9yaWVzL3BsdWdpbkZhY3RvcnknKSxcbiAgICB0aGVtZUZhY3RvcnkgPSByZXF1aXJlKCcuL2ZhY3Rvcmllcy90aGVtZUZhY3RvcnknKTtcblxudmFyIF9jcmVhdGVDaGFydDtcblxucmVxdWlyZSgnLi9jb2RlLXNuaXBwZXQtdXRpbCcpO1xucmVxdWlyZSgnLi9yZWdpc3RlckNoYXJ0cycpO1xucmVxdWlyZSgnLi9yZWdpc3RlclRoZW1lcycpO1xuXG4vKipcbiAqIE5ITiBFbnRlcnRhaW5tZW50IFRvYXN0IFVJIENoYXJ0LlxuICogQG5hbWVzcGFjZSB0dWkuY2hhcnRcbiAqL1xudHVpLnV0aWwuZGVmaW5lTmFtZXNwYWNlKCd0dWkuY2hhcnQnKTtcblxuLyoqXG4gKiBDcmVhdGUgY2hhcnQuXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY29udGFpbmVyXG4gKiBAcGFyYW0ge2FycmF5LjxhcnJheT59IGRhdGEgY2hhcnQgZGF0YVxuICogQHBhcmFtIHt7XG4gKiAgIGNoYXJ0OiB7XG4gKiAgICAgd2lkdGg6IG51bWJlcixcbiAqICAgICBoZWlnaHQ6IG51bWJlcixcbiAqICAgICB0aXRsZTogc3RyaW5nLFxuICogICAgIGZvcm1hdDogc3RyaW5nXG4gKiAgIH0sXG4gKiAgIHlBeGlzOiB7XG4gKiAgICAgdGl0bGU6IHN0cmluZyxcbiAqICAgICBtaW46IG51bWJlclxuICogICB9LFxuICogICB4QXhpczoge1xuICogICAgIHRpdGxlOiBzdHJpZyxcbiAqICAgICBtaW46IG51bWJlclxuICogICB9LFxuICogICB0b29sdGlwOiB7XG4gKiAgICAgc3VmZml4OiBzdHJpbmcsXG4gKiAgICAgdGVtcGxhdGU6IHN0cmluZ1xuICogICB9LFxuICogICB0aGVtZTogc3RyaW5nXG4gKiB9fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAqIEByZXR1cm5zIHtvYmplY3R9IGNoYXJ0IGluc3RhbmNlLlxuICogQHByaXZhdGVcbiAqIEBpZ25vcmVcbiAqL1xuX2NyZWF0ZUNoYXJ0ID0gZnVuY3Rpb24oY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKSB7XG4gICAgdmFyIHRoZW1lTmFtZSwgdGhlbWUsIGNoYXJ0O1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHRoZW1lTmFtZSA9IG9wdGlvbnMudGhlbWUgfHwgY2hhcnRDb25zdC5ERUZBVUxUX1RIRU1FX05BTUU7XG4gICAgdGhlbWUgPSB0aGVtZUZhY3RvcnkuZ2V0KHRoZW1lTmFtZSk7XG5cbiAgICBjaGFydCA9IGNoYXJ0RmFjdG9yeS5nZXQob3B0aW9ucy5jaGFydFR5cGUsIGRhdGEsIHRoZW1lLCBvcHRpb25zKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoY2hhcnQucmVuZGVyKCkpO1xuICAgIGNoYXJ0LmFuaW1hdGVDaGFydCgpO1xuXG4gICAgcmV0dXJuIGNoYXJ0O1xufTtcblxuLyoqXG4gKiBCYXIgY2hhcnQgY3JlYXRvci5cbiAqIEBtZW1iZXJPZiB0dWkuY2hhcnRcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciBjaGFydCBjb250YWluZXJcbiAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhIGNoYXJ0IGRhdGFcbiAqICAgICAgQHBhcmFtIHthcnJheS48c3RyaW5nPn0gZGF0YS5jYXRlZ29yaWVzIGNhdGVnb3JpZXNcbiAqICAgICAgQHBhcmFtIHthcnJheS48YXJyYXk+fSBkYXRhLnNlcmllcyBzZXJpZXMgZGF0YVxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5jaGFydCBjaGFydCBvcHRpb25zXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5jaGFydC53aWR0aCBjaGFydCB3aWR0aFxuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMuY2hhcnQuaGVpZ2h0IGNoYXJ0IGhlaWdodFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuY2hhcnQudGl0bGUgY2hhcnQgdGl0bGVcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmNoYXJ0LmZvcm1hdCB2YWx1ZSBmb3JtYXRcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMueUF4aXMgb3B0aW9ucyBvZiB2ZXJ0aWNhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy55QXhpcy50aXRsZSB0aXRsZSBvZiB2ZXJ0aWNhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy55QXhpcy5sYWJlbEludGVydmFsIGxhYmVsIGludGVydmFsIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMueEF4aXMgb3B0aW9ucyBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnhBeGlzLnRpdGxlIHRpdGxlIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMueEF4aXMubWluIG1pbmltYWwgdmFsdWUgb2YgaG9yaXpvbnRhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy54QXhpcy5tYXggbWF4aW11bSB2YWx1ZSBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuc2VyaWVzIG9wdGlvbnMgb2Ygc2VyaWVzXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5zZXJpZXMuc3RhY2tlZCBzdGFja2VkIHR5cGVcbiAqICAgICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5zZXJpZXMuc2hvd0xhYmVsIHdoZXRoZXIgc2hvdyBsYWJlbCBvciBub3RcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMudG9vbHRpcCBvcHRpb25zIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAuc3VmZml4IHN1ZmZpeCBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnRlbXBsYXRlIHRlbXBsYXRlIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAucG9zaXRpb24gdG9vbHRpcCBwb3NpdGlvbiB0eXBlXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uIGFkZCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24ubGVmdCBhZGQgbGVmdCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24udG9wIGFkZCB0b3AgcG9zaXRpb25cbiAqICAgICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy50b29sdGlwLmdyb3VwZWQgd2hldGhlciBncm91cCB0b29sdGlwIG9yIG5vdFxuICogICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50aGVtZSB0aGVtZSBuYW1lXG4gKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmxpYlR5cGUgZ3JhcGggbGlicmFyeSB0eXBlXG4gKiBAcmV0dXJucyB7b2JqZWN0fSBiYXIgY2hhcnRcbiAqIEBleGFtcGxlXG4gKiB2YXIgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhaW5lci1pZCcpLFxuICogICAgIGRhdGEgPSB7XG4gKiAgICAgICBjYXRlZ29yaWVzOiBbJ2NhdGUxJywgJ2NhdGUyJywgJ2NhdGUzJ10sXG4gKiAgICAgICBzZXJpZXM6IFtcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQxJyxcbiAqICAgICAgICAgICBkYXRhOiBbMjAsIDMwLCA1MF1cbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQyJyxcbiAqICAgICAgICAgICBkYXRhOiBbNDAsIDQwLCA2MF1cbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQzJyxcbiAqICAgICAgICAgICBkYXRhOiBbNjAsIDUwLCAxMF1cbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQ0JyxcbiAqICAgICAgICAgICBkYXRhOiBbODAsIDEwLCA3MF1cbiAqICAgICAgICAgfVxuICogICAgICAgXVxuICogICAgIH0sXG4gKiAgICAgb3B0aW9ucyA9IHtcbiAqICAgICAgIGNoYXJ0OiB7XG4gKiAgICAgICAgIHRpdGxlOiAnQmFyIENoYXJ0J1xuICogICAgICAgfSxcbiAqICAgICAgIHlBeGlzOiB7XG4gKiAgICAgICAgIHRpdGxlOiAnWSBBeGlzJ1xuICogICAgICAgfSxcbiAqICAgICAgIHhBeGlzOiB7XG4gKiAgICAgICAgIHRpdGxlOiAnWCBBeGlzJ1xuICogICAgICAgfVxuICogICAgIH07XG4gKiB0dWkuY2hhcnQuYmFyQ2hhcnQoY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKTtcbiAqL1xudHVpLmNoYXJ0LmJhckNoYXJ0ID0gZnVuY3Rpb24oY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgb3B0aW9ucy5jaGFydFR5cGUgPSBjaGFydENvbnN0LkNIQVJUX1RZUEVfQkFSO1xuICAgIHJldHVybiBfY3JlYXRlQ2hhcnQoY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKTtcbn07XG5cbi8qKlxuICogQ29sdW1uIGNoYXJ0IGNyZWF0b3IuXG4gKiBAbWVtYmVyT2YgdHVpLmNoYXJ0XG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY2hhcnQgY29udGFpbmVyXG4gKiBAcGFyYW0ge29iamVjdH0gZGF0YSBjaGFydCBkYXRhXG4gKiAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGRhdGEuY2F0ZWdvcmllcyBjYXRlZ29yaWVzXG4gKiAgICAgIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gZGF0YS5zZXJpZXMgc2VyaWVzIGRhdGFcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuY2hhcnQgY2hhcnQgb3B0aW9uc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMuY2hhcnQud2lkdGggY2hhcnQgd2lkdGhcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LmhlaWdodCBjaGFydCBoZWlnaHRcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmNoYXJ0LnRpdGxlIGNoYXJ0IHRpdGxlXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC5mb3JtYXQgdmFsdWUgZm9ybWF0XG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnlBeGlzIG9wdGlvbnMgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMueUF4aXMudGl0bGUgdGl0bGUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMueUF4aXMubWluIG1pbmltYWwgdmFsdWUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMueUF4aXMubWF4IG1heGltdW0gdmFsdWUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy54QXhpcyBvcHRpb25zIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMueEF4aXMudGl0bGUgdGl0bGUgb2YgaG9yaXpvbnRhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy54QXhpcy5sYWJlbEludGVydmFsIGxhYmVsIGludGVydmFsIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5zZXJpZXMgb3B0aW9ucyBvZiBzZXJpZXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnNlcmllcy5zdGFja2VkIHN0YWNrZWQgdHlwZVxuICogICAgICAgICAgQHBhcmFtIHtib29sZWFufSBvcHRpb25zLnNlcmllcy5zaG93TGFiZWwgd2hldGhlciBzaG93IGxhYmVsIG9yIG5vdFxuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy50b29sdGlwIG9wdGlvbnMgb2YgdG9vbHRpcFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC5zdWZmaXggc3VmZml4IG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAudGVtcGxhdGUgdGVtcGxhdGUgb2YgdG9vbHRpcFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC5wb3NpdGlvbiB0b29sdGlwIHBvc2l0aW9uIHR5cGVcbiAqICAgICAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24gYWRkIHBvc2l0aW9uXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMudG9vbHRpcC5hZGRQb3NpdGlvbi5sZWZ0IGFkZCBsZWZ0IHBvc2l0aW9uXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMudG9vbHRpcC5hZGRQb3NpdGlvbi50b3AgYWRkIHRvcCBwb3NpdGlvblxuICogICAgICAgICAgQHBhcmFtIHtib29sZWFufSBvcHRpb25zLnRvb2x0aXAuZ3JvdXBlZCB3aGV0aGVyIGdyb3VwIHRvb2x0aXAgb3Igbm90XG4gKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRoZW1lIHRoZW1lIG5hbWVcbiAqICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMubGliVHlwZSBncmFwaCBsaWJyYXJ5IHR5cGVcbiAqIEByZXR1cm5zIHtvYmplY3R9IGNvbHVtbiBjaGFydFxuICogQGV4YW1wbGVcbiAqIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFpbmVyLWlkJyksXG4gKiAgICAgZGF0YSA9IHtcbiAqICAgICAgIGNhdGVnb3JpZXM6IFsnY2F0ZTEnLCAnY2F0ZTInLCAnY2F0ZTMnXSxcbiAqICAgICAgIHNlcmllczogW1xuICogICAgICAgICB7XG4gKiAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDEnLFxuICogICAgICAgICAgIGRhdGE6IFsyMCwgMzAsIDUwXVxuICogICAgICAgICB9LFxuICogICAgICAgICB7XG4gKiAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDInLFxuICogICAgICAgICAgIGRhdGE6IFs0MCwgNDAsIDYwXVxuICogICAgICAgICB9LFxuICogICAgICAgICB7XG4gKiAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDMnLFxuICogICAgICAgICAgIGRhdGE6IFs2MCwgNTAsIDEwXVxuICogICAgICAgICB9LFxuICogICAgICAgICB7XG4gKiAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDQnLFxuICogICAgICAgICAgIGRhdGE6IFs4MCwgMTAsIDcwXVxuICogICAgICAgICB9XG4gKiAgICAgICBdXG4gKiAgICAgfSxcbiAqICAgICBvcHRpb25zID0ge1xuICogICAgICAgY2hhcnQ6IHtcbiAqICAgICAgICAgdGl0bGU6ICdDb2x1bW4gQ2hhcnQnXG4gKiAgICAgICB9LFxuICogICAgICAgeUF4aXM6IHtcbiAqICAgICAgICAgdGl0bGU6ICdZIEF4aXMnXG4gKiAgICAgICB9LFxuICogICAgICAgeEF4aXM6IHtcbiAqICAgICAgICAgdGl0bGU6ICdYIEF4aXMnXG4gKiAgICAgICB9XG4gKiAgICAgfTtcbiAqIHR1aS5jaGFydC5jb2x1bW5DaGFydChjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpO1xuICovXG50dWkuY2hhcnQuY29sdW1uQ2hhcnQgPSBmdW5jdGlvbihjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICBvcHRpb25zLmNoYXJ0VHlwZSA9IGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9DT0xVTU47XG4gICAgcmV0dXJuIF9jcmVhdGVDaGFydChjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpO1xufTtcblxuLyoqXG4gKiBMaW5lIGNoYXJ0IGNyZWF0b3IuXG4gKiBAbWVtYmVyT2YgdHVpLmNoYXJ0XG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY2hhcnQgY29udGFpbmVyXG4gKiBAcGFyYW0ge29iamVjdH0gZGF0YSBjaGFydCBkYXRhXG4gKiAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGRhdGEuY2F0ZWdvcmllcyBjYXRlZ29yaWVzXG4gKiAgICAgIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gZGF0YS5zZXJpZXMgc2VyaWVzIGRhdGFcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuY2hhcnQgY2hhcnQgb3B0aW9uc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMuY2hhcnQud2lkdGggY2hhcnQgd2lkdGhcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LmhlaWdodCBjaGFydCBoZWlnaHRcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmNoYXJ0LnRpdGxlIGNoYXJ0IHRpdGxlXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC5mb3JtYXQgdmFsdWUgZm9ybWF0XG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnlBeGlzIG9wdGlvbnMgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMueUF4aXMudGl0bGUgdGl0bGUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMueUF4aXMubWluIG1pbmltYWwgdmFsdWUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMueUF4aXMubWF4IG1heGltdW0gdmFsdWUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy54QXhpcyBvcHRpb25zIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMueEF4aXMudGl0bGUgdGl0bGUgb2YgaG9yaXpvbnRhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy54QXhpcy5sYWJlbEludGVydmFsIGxhYmVsIGludGVydmFsIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5zZXJpZXMgb3B0aW9ucyBvZiBzZXJpZXNcbiAqICAgICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5zZXJpZXMuaGFzRG90IHdoZXRoZXIgaGFzIGRvdCBvciBub3RcbiAqICAgICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5zZXJpZXMuc2hvd0xhYmVsIHdoZXRoZXIgc2hvdyBsYWJlbCBvciBub3RcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMudG9vbHRpcCBvcHRpb25zIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAuc3VmZml4IHN1ZmZpeCBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnRlbXBsYXRlIHRlbXBsYXRlIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAucG9zaXRpb24gdG9vbHRpcCBwb3NpdGlvbiB0eXBlXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uIGFkZCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24ubGVmdCBhZGQgbGVmdCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24udG9wIGFkZCB0b3AgcG9zaXRpb25cbiAqICAgICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy50b29sdGlwLmdyb3VwZWQgd2hldGhlciBncm91cCB0b29sdGlwIG9yIG5vdFxuICogICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50aGVtZSB0aGVtZSBuYW1lXG4gKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmxpYlR5cGUgZ3JhcGggbGlicmFyeSB0eXBlXG4gKiBAcmV0dXJucyB7b2JqZWN0fSBiYXIgY2hhcnRcbiAqIEBleGFtcGxlXG4gKiB2YXIgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhaW5lci1pZCcpLFxuICogICAgIGRhdGEgPSB7XG4gKiAgICAgICBjYXRlZ29yaWVzOiBbJ2NhdGUxJywgJ2NhdGUyJywgJ2NhdGUzJ10sXG4gKiAgICAgICBzZXJpZXM6IFtcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQxJyxcbiAqICAgICAgICAgICBkYXRhOiBbMjAsIDMwLCA1MF1cbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQyJyxcbiAqICAgICAgICAgICBkYXRhOiBbNDAsIDQwLCA2MF1cbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQzJyxcbiAqICAgICAgICAgICBkYXRhOiBbNjAsIDUwLCAxMF1cbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQ0JyxcbiAqICAgICAgICAgICBkYXRhOiBbODAsIDEwLCA3MF1cbiAqICAgICAgICAgfVxuICogICAgICAgXVxuICogICAgIH0sXG4gKiAgICAgb3B0aW9ucyA9IHtcbiAqICAgICAgIGNoYXJ0OiB7XG4gKiAgICAgICAgIHRpdGxlOiAnTGluZSBDaGFydCdcbiAqICAgICAgIH0sXG4gKiAgICAgICB5QXhpczoge1xuICogICAgICAgICB0aXRsZTogJ1kgQXhpcydcbiAqICAgICAgIH0sXG4gKiAgICAgICB4QXhpczoge1xuICogICAgICAgICB0aXRsZTogJ1ggQXhpcydcbiAqICAgICAgIH0sXG4gKiAgICAgICBzZXJpZXM6IHtcbiAqICAgICAgICAgaGFzRG90OiB0cnVlXG4gKiAgICAgICB9XG4gKiAgICAgfTtcbiAqIHR1aS5jaGFydC5saW5lQ2hhcnQoY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKTtcbiAqL1xudHVpLmNoYXJ0LmxpbmVDaGFydCA9IGZ1bmN0aW9uKGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIG9wdGlvbnMuY2hhcnRUeXBlID0gY2hhcnRDb25zdC5DSEFSVF9UWVBFX0xJTkU7XG4gICAgcmV0dXJuIF9jcmVhdGVDaGFydChjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpO1xufTtcblxuLyoqXG4gKiBBcmVhIGNoYXJ0IGNyZWF0b3IuXG4gKiBAbWVtYmVyT2YgdHVpLmNoYXJ0XG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY2hhcnQgY29udGFpbmVyXG4gKiBAcGFyYW0ge29iamVjdH0gZGF0YSBjaGFydCBkYXRhXG4gKiAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGRhdGEuY2F0ZWdvcmllcyBjYXRlZ29yaWVzXG4gKiAgICAgIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gZGF0YS5zZXJpZXMgc2VyaWVzIGRhdGFcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuY2hhcnQgY2hhcnQgb3B0aW9uc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMuY2hhcnQud2lkdGggY2hhcnQgd2lkdGhcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LmhlaWdodCBjaGFydCBoZWlnaHRcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmNoYXJ0LnRpdGxlIGNoYXJ0IHRpdGxlXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC5mb3JtYXQgdmFsdWUgZm9ybWF0XG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnlBeGlzIG9wdGlvbnMgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMueUF4aXMudGl0bGUgdGl0bGUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMueUF4aXMubWluIG1pbmltYWwgdmFsdWUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMueUF4aXMubWF4IG1heGltdW0gdmFsdWUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy54QXhpcyBvcHRpb25zIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMueEF4aXMudGl0bGUgdGl0bGUgb2YgaG9yaXpvbnRhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy54QXhpcy5sYWJlbEludGVydmFsIGxhYmVsIGludGVydmFsIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5zZXJpZXMgb3B0aW9ucyBvZiBzZXJpZXNcbiAqICAgICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5zZXJpZXMuaGFzRG90IHdoZXRoZXIgaGFzIGRvdCBvciBub3RcbiAqICAgICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5zZXJpZXMuc2hvd0xhYmVsIHdoZXRoZXIgc2hvdyBsYWJlbCBvciBub3RcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMudG9vbHRpcCBvcHRpb25zIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAuc3VmZml4IHN1ZmZpeCBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnRlbXBsYXRlIHRlbXBsYXRlIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAucG9zaXRpb24gdG9vbHRpcCBwb3NpdGlvbiB0eXBlXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uIGFkZCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24ubGVmdCBhZGQgbGVmdCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24udG9wIGFkZCB0b3AgcG9zaXRpb25cbiAqICAgICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy50b29sdGlwLmdyb3VwZWQgd2hldGhlciBncm91cCB0b29sdGlwIG9yIG5vdFxuICogICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50aGVtZSB0aGVtZSBuYW1lXG4gKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmxpYlR5cGUgZ3JhcGggbGlicmFyeSB0eXBlXG4gKiBAcmV0dXJucyB7b2JqZWN0fSBiYXIgY2hhcnRcbiAqIEBleGFtcGxlXG4gKiB2YXIgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhaW5lci1pZCcpLFxuICogICAgIGRhdGEgPSB7XG4gKiAgICAgICBjYXRlZ29yaWVzOiBbJ2NhdGUxJywgJ2NhdGUyJywgJ2NhdGUzJ10sXG4gKiAgICAgICBzZXJpZXM6IFtcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQxJyxcbiAqICAgICAgICAgICBkYXRhOiBbMjAsIDMwLCA1MF1cbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQyJyxcbiAqICAgICAgICAgICBkYXRhOiBbNDAsIDQwLCA2MF1cbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQzJyxcbiAqICAgICAgICAgICBkYXRhOiBbNjAsIDUwLCAxMF1cbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQ0JyxcbiAqICAgICAgICAgICBkYXRhOiBbODAsIDEwLCA3MF1cbiAqICAgICAgICAgfVxuICogICAgICAgXVxuICogICAgIH0sXG4gKiAgICAgb3B0aW9ucyA9IHtcbiAqICAgICAgIGNoYXJ0OiB7XG4gKiAgICAgICAgIHRpdGxlOiAnQXJlYSBDaGFydCdcbiAqICAgICAgIH0sXG4gKiAgICAgICB5QXhpczoge1xuICogICAgICAgICB0aXRsZTogJ1kgQXhpcydcbiAqICAgICAgIH0sXG4gKiAgICAgICB4QXhpczoge1xuICogICAgICAgICB0aXRsZTogJ1ggQXhpcydcbiAqICAgICAgIH1cbiAqICAgICB9O1xuICogdHVpLmNoYXJ0LmFyZWFDaGFydChjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpO1xuICovXG50dWkuY2hhcnQuYXJlYUNoYXJ0ID0gZnVuY3Rpb24oY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgb3B0aW9ucy5jaGFydFR5cGUgPSBjaGFydENvbnN0LkNIQVJUX1RZUEVfQVJFQTtcbiAgICByZXR1cm4gX2NyZWF0ZUNoYXJ0KGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucyk7XG59O1xuXG4vKipcbiAqIENvbWJvIGNoYXJ0IGNyZWF0b3IuXG4gKiBAbWVtYmVyT2YgdHVpLmNoYXJ0XG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY2hhcnQgY29udGFpbmVyXG4gKiBAcGFyYW0ge29iamVjdH0gZGF0YSBjaGFydCBkYXRhXG4gKiAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGRhdGEuY2F0ZWdvcmllcyBjYXRlZ29yaWVzXG4gKiAgICAgIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gZGF0YS5zZXJpZXMgc2VyaWVzIGRhdGFcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuY2hhcnQgY2hhcnQgb3B0aW9uc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMuY2hhcnQud2lkdGggY2hhcnQgd2lkdGhcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LmhlaWdodCBjaGFydCBoZWlnaHRcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmNoYXJ0LnRpdGxlIGNoYXJ0IHRpdGxlXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC5mb3JtYXQgdmFsdWUgZm9ybWF0XG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0W119IG9wdGlvbnMueUF4aXMgb3B0aW9ucyBvZiB2ZXJ0aWNhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy55QXhpc1tdLnRpdGxlIHRpdGxlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnlBeGlzW10ubWluIG1pbmltYWwgdmFsdWUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMueUF4aXNbXS5tYXggbWF4aW11bSB2YWx1ZSBvZiB2ZXJ0aWNhbCBheGlzXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnhBeGlzIG9wdGlvbnMgb2YgaG9yaXpvbnRhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy54QXhpcy50aXRsZSB0aXRsZSBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnhBeGlzLmxhYmVsSW50ZXJ2YWwgbGFiZWwgaW50ZXJ2YWwgb2YgaG9yaXpvbnRhbCBheGlzXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnNlcmllcyBvcHRpb25zIG9mIHNlcmllc1xuICogICAgICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuc2VyaWVzLmNvbHVtbiBvcHRpb25zIG9mIGNvbHVtbiBzZXJpZXNcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5zZXJpZXMuY29sdW1uLnN0YWNrZWQgc3RhY2tlZCB0eXBlXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtib29sZWFufSBvcHRpb25zLnNlcmllcy5jb2x1bW4uc2hvd0xhYmVsIHdoZXRoZXIgc2hvdyBsYWJlbCBvciBub3RcbiAqICAgICAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnNlcmllcy5saW5lIG9wdGlvbnMgb2YgbGluZSBzZXJpZXNcbiAqICAgICAgICAgICAgICBAcGFyYW0ge2Jvb2xlYW59IG9wdGlvbnMuc2VyaWVzLmxpbmUuaGFzRG90IHdoZXRoZXIgaGFzIGRvdCBvciBub3RcbiAqICAgICAgICAgICAgICBAcGFyYW0ge2Jvb2xlYW59IG9wdGlvbnMuc2VyaWVzLmxpbmUuc2hvd0xhYmVsIHdoZXRoZXIgc2hvdyBsYWJlbCBvciBub3RcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMudG9vbHRpcCBvcHRpb25zIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnRvb2x0aXAuY29sdW1uIG9wdGlvbnMgb2YgY29sdW1uIHRvb2x0aXBcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLmNvbHVtbi5zdWZmaXggc3VmZml4IG9mIHRvb2x0aXBcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLmNvbHVtbi50ZW1wbGF0ZSB0ZW1wbGF0ZSBvZiB0b29sdGlwXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC5jb2x1bW4ucG9zaXRpb24gdG9vbHRpcCBwb3NpdGlvbiB0eXBlXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMudG9vbHRpcC5jb2x1bW4uYWRkUG9zaXRpb24gYWRkIHBvc2l0aW9uXG4gKiAgICAgICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuY29sdW1uLmFkZFBvc2l0aW9uLmxlZnQgYWRkIGxlZnQgcG9zaXRpb25cbiAqICAgICAgICAgICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMudG9vbHRpcC5jb2x1bW4uYWRkUG9zaXRpb24udG9wIGFkZCB0b3AgcG9zaXRpb25cbiAqICAgICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy50b29sdGlwLmdyb3VwZWQgd2hldGhlciBncm91cCB0b29sdGlwIG9yIG5vdFxuICogICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50aGVtZSB0aGVtZSBuYW1lXG4gKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmxpYlR5cGUgZ3JhcGggbGlicmFyeSB0eXBlXG4gKiBAcmV0dXJucyB7b2JqZWN0fSBiYXIgY2hhcnRcbiAqIEBleGFtcGxlXG4gKiB2YXIgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhaW5lci1pZCcpLFxuICogICAgIGRhdGEgPSB7XG4gKiAgICAgICBjYXRlZ29yaWVzOiBbJ2NhdGUxJywgJ2NhdGUyJywgJ2NhdGUzJ10sXG4gKiAgICAgICBzZXJpZXM6IHtcbiAqICAgICAgICAgY29sdW1uOiBbXG4gKiAgICAgICAgICAge1xuICogICAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDEnLFxuICogICAgICAgICAgICAgZGF0YTogWzIwLCAzMCwgNTBdXVxuICogICAgICAgICAgIH0sXG4gKiAgICAgICAgICAge1xuICogICAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDInLFxuICogICAgICAgICAgICAgZGF0YTogWzQwLCA0MCwgNjBdXG4gKiAgICAgICAgICAgfSxcbiAqICAgICAgICAgICB7XG4gKiAgICAgICAgICAgICBuYW1lOiAnTGVnZW5kMycsXG4gKiAgICAgICAgICAgICBkYXRhOiBbNjAsIDUwLCAxMF1cbiAqICAgICAgICAgICB9LFxuICogICAgICAgICAgIHtcbiAqICAgICAgICAgICAgIG5hbWU6ICdMZWdlbmQ0JyxcbiAqICAgICAgICAgICAgIGRhdGE6IFs4MCwgMTAsIDcwXVxuICogICAgICAgICAgIH1cbiAqICAgICAgICAgfSxcbiAqICAgICAgICAgbGluZTogW1xuICogICAgICAgICAgIHtcbiAqICAgICAgICAgICAgIG5hbWU6ICdMZWdlbmQ1JyxcbiAqICAgICAgICAgICAgIGRhdGE6IFsxLCAyLCAzXVxuICogICAgICAgICAgIH1cbiAqICAgICAgICAgXVxuICogICAgICAgfVxuICogICAgIH0sXG4gKiAgICAgb3B0aW9ucyA9IHtcbiAqICAgICAgIGNoYXJ0OiB7XG4gKiAgICAgICAgIHRpdGxlOiAnQ29tYm8gQ2hhcnQnXG4gKiAgICAgICB9LFxuICogICAgICAgeUF4aXM6W1xuICogICAgICAgICB7XG4gKiAgICAgICAgICAgdGl0bGU6ICdZIEF4aXMnLFxuICogICAgICAgICAgIGNoYXJ0VHlwZTogJ2xpbmUnXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICB0aXRsZTogJ1kgUmlnaHQgQXhpcydcbiAqICAgICAgICAgfVxuICogICAgICAgXSxcbiAqICAgICAgIHhBeGlzOiB7XG4gKiAgICAgICAgIHRpdGxlOiAnWCBBeGlzJ1xuICogICAgICAgfSxcbiAqICAgICAgIHNlcmllczoge1xuICogICAgICAgICBoYXNEb3Q6IHRydWVcbiAqICAgICAgIH1cbiAqICAgICB9O1xuICogdHVpLmNoYXJ0LmNvbWJvQ2hhcnQoY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKTtcbiAqL1xudHVpLmNoYXJ0LmNvbWJvQ2hhcnQgPSBmdW5jdGlvbihjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICBvcHRpb25zLmNoYXJ0VHlwZSA9IGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9DT01CTztcbiAgICByZXR1cm4gX2NyZWF0ZUNoYXJ0KGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucyk7XG59O1xuXG4vKipcbiAqIFBpZSBjaGFydCBjcmVhdG9yLlxuICogQG1lbWJlck9mIHR1aS5jaGFydFxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNoYXJ0IGNvbnRhaW5lclxuICogQHBhcmFtIHtvYmplY3R9IGRhdGEgY2hhcnQgZGF0YVxuICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IGRhdGEuc2VyaWVzIHNlcmllcyBkYXRhXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLmNoYXJ0IGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LndpZHRoIGNoYXJ0IHdpZHRoXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5jaGFydC5oZWlnaHQgY2hhcnQgaGVpZ2h0XG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC50aXRsZSBjaGFydCB0aXRsZVxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuY2hhcnQuZm9ybWF0IHZhbHVlIGZvcm1hdFxuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5zZXJpZXMgb3B0aW9ucyBvZiBzZXJpZXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnNlcmllcy5sZWdlbmRUeXBlIGxlZ2VuZCB0eXBlXG4gKiAgICAgICAgICBAcGFyYW0ge2Jvb2xlYW59IG9wdGlvbnMuc2VyaWVzLnNob3dMYWJlbCB3aGV0aGVyIHNob3cgbGFiZWwgb3Igbm90XG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnRvb2x0aXAgb3B0aW9ucyBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnN1ZmZpeCBzdWZmaXggb2YgdG9vbHRpcFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC50ZW1wbGF0ZSB0ZW1wbGF0ZSBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnBvc2l0aW9uIHRvb2x0aXAgcG9zaXRpb24gdHlwZVxuICogICAgICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMudG9vbHRpcC5hZGRQb3NpdGlvbiBhZGQgcG9zaXRpb25cbiAqICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uLmxlZnQgYWRkIGxlZnQgcG9zaXRpb25cbiAqICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uLnRvcCBhZGQgdG9wIHBvc2l0aW9uXG4gKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRoZW1lIHRoZW1lIG5hbWVcbiAqICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMubGliVHlwZSBncmFwaCBsaWJyYXJ5IHR5cGVcbiAqIEByZXR1cm5zIHtvYmplY3R9IGJhciBjaGFydFxuICogQGV4YW1wbGVcbiAqIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFpbmVyLWlkJyksXG4gKiAgICAgZGF0YSA9IHtcbiAqICAgICAgIHNlcmllczogW1xuICogICAgICAgICB7XG4gKiAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDEnLFxuICogICAgICAgICAgIGRhdGE6IDIwXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMicsXG4gKiAgICAgICAgICAgZGF0YTogNDBcbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQzJyxcbiAqICAgICAgICAgICBkYXRhOiA2MFxuICogICAgICAgICB9LFxuICogICAgICAgICB7XG4gKiAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDQnLFxuICogICAgICAgICAgIGRhdGE6IDgwXG4gKiAgICAgICAgIH1cbiAqICAgICAgIF1cbiAqICAgICB9LFxuICogICAgIG9wdGlvbnMgPSB7XG4gKiAgICAgICBjaGFydDoge1xuICogICAgICAgICB0aXRsZTogJ1BpZSBDaGFydCdcbiAqICAgICAgIH1cbiAqICAgICB9O1xuICogdHVpLmNoYXJ0LnBpZUNoYXJ0KGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucyk7XG4gKi9cbnR1aS5jaGFydC5waWVDaGFydCA9IGZ1bmN0aW9uKGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIG9wdGlvbnMuY2hhcnRUeXBlID0gY2hhcnRDb25zdC5DSEFSVF9UWVBFX1BJRTtcbiAgICByZXR1cm4gX2NyZWF0ZUNoYXJ0KGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucyk7XG59O1xuXG4vKipcbiAqIFJlZ2lzdGVyIHRoZW1lLlxuICogQG1lbWJlck9mIHR1aS5jaGFydFxuICogQHBhcmFtIHtzdHJpbmd9IHRoZW1lTmFtZSB0aGVtZSBuYW1lXG4gKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgYXBwbGljYXRpb24gY2hhcnQgdGhlbWVcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IHRoZW1lLmNoYXJ0IGNoYXJ0IHRoZW1lXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUuY2hhcnQuZm9udEZhbWlseSBmb250IGZhbWlseSBvZiBjaGFydFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLmNoYXJ0LmJhY2tncm91bmQgYmFja2dyb3VuZCBvZiBjaGFydFxuICogICAgICBAcGFyYW0ge29iamVjdH0gdGhlbWUudGl0bGUgY2hhcnQgdGhlbWVcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSB0aGVtZS50aXRsZS5mb250U2l6ZSBmb250IHNpemUgb2YgY2hhcnQgdGl0bGVcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS50aXRsZS5mb250RmFtaWx5IGZvbnQgZmFtaWx5IG9mIGNoYXJ0IHRpdGxlXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUudGl0bGUuY29sb3IgZm9udCBjb2xvciBvZiBjaGFydCB0aXRsZVxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnRpdGxlLmJhY2tncm91bmQgYmFja2dyb3VuZCBvZiBjaGFydCB0aXRsZVxuICogICAgICBAcGFyYW0ge29iamVjdH0gdGhlbWUueUF4aXMgdGhlbWUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtvYmplY3R9IHRoZW1lLnlBeGlzLnRpdGxlIHRoZW1lIG9mIHZlcnRpY2FsIGF4aXMgdGl0bGVcbiAqICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gdGhlbWUueUF4aXMudGl0bGUuZm9udFNpemUgZm9udCBzaXplIG9mIHZlcnRpY2FsIGF4aXMgdGl0bGVcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUueUF4aXMudGl0bGUuZm9udEZhbWlseSBmb250IGZhbWlseSBvZiB2ZXJ0aWNhbCBheGlzIHRpdGxlXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnlBeGlzLnRpdGxlLmNvbG9yIGZvbnQgY29sb3Igb2YgdmVydGljYWwgYXhpcyB0aXRsZVxuICogICAgICAgICAgQHBhcmFtIHtvYmplY3R9IHRoZW1lLnlBeGlzLmxhYmVsIHRoZW1lIG9mIHZlcnRpY2FsIGF4aXMgbGFiZWxcbiAqICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gdGhlbWUueUF4aXMubGFiZWwuZm9udFNpemUgZm9udCBzaXplIG9mIHZlcnRpY2FsIGF4aXMgbGFiZWxcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUueUF4aXMubGFiZWwuZm9udEZhbWlseSBmb250IGZhbWlseSBvZiB2ZXJ0aWNhbCBheGlzIGxhYmVsXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnlBeGlzLmxhYmVsLmNvbG9yIGZvbnQgY29sb3Igb2YgdmVydGljYWwgYXhpcyBsYWJlbFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnlBeGlzLnRpY2tjb2xvciBjb2xvciBvZiB2ZXJ0aWNhbCBheGlzIHRpY2tcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IHRoZW1lLnhBeGlzIHRoZW1lIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtvYmplY3R9IHRoZW1lLnhBeGlzLnRpdGxlIHRoZW1lIG9mIGhvcml6b250YWwgYXhpcyB0aXRsZVxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSB0aGVtZS54QXhpcy50aXRsZS5mb250U2l6ZSBmb250IHNpemUgb2YgaG9yaXpvbnRhbCBheGlzIHRpdGxlXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnhBeGlzLnRpdGxlLmZvbnRGYW1pbHkgZm9udCBmYW1pbHkgb2YgaG9yaXpvbnRhbCBheGlzIHRpdGxlXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnhBeGlzLnRpdGxlLmNvbG9yIGZvbnQgY29sb3Igb2YgaG9yaXpvbnRhbCBheGlzIHRpdGxlXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gdGhlbWUueEF4aXMubGFiZWwgdGhlbWUgb2YgaG9yaXpvbnRhbCBheGlzIGxhYmVsXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IHRoZW1lLnhBeGlzLmxhYmVsLmZvbnRTaXplIGZvbnQgc2l6ZSBvZiBob3Jpem9udGFsIGF4aXMgbGFiZWxcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUueEF4aXMubGFiZWwuZm9udEZhbWlseSBmb250IGZhbWlseSBvZiBob3Jpem9udGFsIGF4aXMgbGFiZWxcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUueEF4aXMubGFiZWwuY29sb3IgZm9udCBjb2xvciBvZiBob3Jpem9udGFsIGF4aXMgbGFiZWxcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS54QXhpcy50aWNrY29sb3IgY29sb3Igb2YgaG9yaXpvbnRhbCBheGlzIHRpY2tcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IHRoZW1lLnBsb3QgcGxvdCB0aGVtZVxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnBsb3QubGluZUNvbG9yIHBsb3QgbGluZSBjb2xvclxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnBsb3QuYmFja2dyb3VuZCBwbG90IGJhY2tncm91bmRcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IHRoZW1lLnNlcmllcyBzZXJpZXMgdGhlbWVcbiAqICAgICAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IHRoZW1lLnNlcmllcy5jb2xvcnMgc2VyaWVzIGNvbG9yc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnNlcmllcy5ib3JkZXJDb2xvciBzZXJpZXMgYm9yZGVyIGNvbG9yXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSB0aGVtZS5sZWdlbmQgbGVnZW5kIHRoZW1lXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gdGhlbWUubGVnZW5kLmxhYmVsIHRoZW1lIG9mIGxlZ2VuZCBsYWJlbFxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSB0aGVtZS5sZWdlbmQubGFiZWwuZm9udFNpemUgZm9udCBzaXplIG9mIGxlZ2VuZCBsYWJlbFxuICogICAgICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS5sZWdlbmQubGFiZWwuZm9udEZhbWlseSBmb250IGZhbWlseSBvZiBsZWdlbmQgbGFiZWxcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUubGVnZW5kLmxhYmVsLmNvbG9yIGZvbnQgY29sb3Igb2YgbGVnZW5kIGxhYmVsXG4gKiBAZXhhbXBsZVxuICogdmFyIHRoZW1lID0ge1xuICogICB5QXhpczoge1xuICogICAgIHRpY2tDb2xvcjogJyNjY2JkOWEnLFxuICogICAgICAgdGl0bGU6IHtcbiAqICAgICAgICAgY29sb3I6ICcjMzMzMzMzJ1xuICogICAgICAgfSxcbiAqICAgICAgIGxhYmVsOiB7XG4gKiAgICAgICAgIGNvbG9yOiAnIzZmNDkxZCdcbiAqICAgICAgIH1cbiAqICAgICB9LFxuICogICAgIHhBeGlzOiB7XG4gKiAgICAgICB0aWNrQ29sb3I6ICcjY2NiZDlhJyxcbiAqICAgICAgIHRpdGxlOiB7XG4gKiAgICAgICAgIGNvbG9yOiAnIzMzMzMzMydcbiAqICAgICAgIH0sXG4gKiAgICAgICBsYWJlbDoge1xuICogICAgICAgICBjb2xvcjogJyM2ZjQ5MWQnXG4gKiAgICAgICB9XG4gKiAgICAgfSxcbiAqICAgICBwbG90OiB7XG4gKiAgICAgICBsaW5lQ29sb3I6ICcjZTVkYmM0JyxcbiAqICAgICAgIGJhY2tncm91bmQ6ICcjZjZmMWU1J1xuICogICAgIH0sXG4gKiAgICAgc2VyaWVzOiB7XG4gKiAgICAgICBjb2xvcnM6IFsnIzQwYWJiNCcsICcjZTc4YTMxJywgJyNjMWM0NTInLCAnIzc5NTIyNCcsICcjZjVmNWY1J10sXG4gKiAgICAgICBib3JkZXJDb2xvcjogJyM4ZTY1MzUnXG4gKiAgICAgfSxcbiAqICAgICBsZWdlbmQ6IHtcbiAqICAgICAgIGxhYmVsOiB7XG4gKiAgICAgICAgIGNvbG9yOiAnIzZmNDkxZCdcbiAqICAgICAgIH1cbiAqICAgICB9XG4gKiAgIH07XG4gKiBjaGFydC5yZWdpc3RlclRoZW1lKCduZXdUaGVtZScsIHRoZW1lKTtcbiAqL1xudHVpLmNoYXJ0LnJlZ2lzdGVyVGhlbWUgPSBmdW5jdGlvbih0aGVtZU5hbWUsIHRoZW1lKSB7XG4gICAgdGhlbWVGYWN0b3J5LnJlZ2lzdGVyKHRoZW1lTmFtZSwgdGhlbWUpO1xufTtcblxuLyoqXG4gKiBSZWdpc3RlciBncmFwaCBwbHVnaW4uXG4gKiBAbWVtYmVyT2YgdHVpLmNoYXJ0XG4gKiBAcGFyYW0ge3N0cmluZ30gbGliVHlwZSB0eXBlIG9mIGdyYXBoIGxpYnJhcnlcbiAqIEBwYXJhbSB7b2JqZWN0fSBwbHVnaW4gcGx1Z2luIHRvIGNvbnRyb2wgbGlicmFyeVxuICogQGV4YW1wbGVcbiAqIHZhciBwbHVnaW5SYXBoYWVsID0ge1xuICogICBiYXI6IGZ1bmN0aW9uKCkge30gLy8gUmVuZGVyIGNsYXNzXG4gKiB9O1xuICogdHVpLmNoYXJ0LnJlZ2lzdGVyUGx1Z2luKCdyYXBoYWVsJywgcGx1Z2luUmFwaGFlbCk7XG4gKi9cbnR1aS5jaGFydC5yZWdpc3RlclBsdWdpbiA9IGZ1bmN0aW9uKGxpYlR5cGUsIHBsdWdpbikge1xuICAgIHBsdWdpbkZhY3RvcnkucmVnaXN0ZXIobGliVHlwZSwgcGx1Z2luKTtcbn07XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgQXJlYSBjaGFydFxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ2hhcnRCYXNlID0gcmVxdWlyZSgnLi9jaGFydEJhc2UnKSxcbiAgICBsaW5lVHlwZU1peGVyID0gcmVxdWlyZSgnLi9saW5lVHlwZU1peGVyJyksXG4gICAgYXhpc1R5cGVNaXhlciA9IHJlcXVpcmUoJy4vYXhpc1R5cGVNaXhlcicpLFxuICAgIHZlcnRpY2FsVHlwZU1peGVyID0gcmVxdWlyZSgnLi92ZXJ0aWNhbFR5cGVNaXhlcicpLFxuICAgIFNlcmllcyA9IHJlcXVpcmUoJy4uL3Nlcmllcy9hcmVhQ2hhcnRTZXJpZXMnKTtcblxudmFyIEFyZWFDaGFydCA9IHR1aS51dGlsLmRlZmluZUNsYXNzKENoYXJ0QmFzZSwgLyoqIEBsZW5kcyBMaW5lQ2hhcnQucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBjbGFzc05hbWVcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIGNsYXNzTmFtZTogJ3R1aS1hcmVhLWNoYXJ0JyxcblxuICAgIC8qKlxuICAgICAqIFNlcmllcyBjbGFzc1xuICAgICAqIEB0eXBlIHtmdW5jdGlvbn1cbiAgICAgKi9cbiAgICBTZXJpZXM6IFNlcmllcyxcblxuICAgIC8qKlxuICAgICAqIEFyZWEgY2hhcnQuXG4gICAgICogQGNvbnN0cnVjdHMgQXJlYUNoYXJ0XG4gICAgICogQGV4dGVuZHMgQ2hhcnRCYXNlXG4gICAgICogQG1peGVzIGF4aXNUeXBlTWl4ZXJcbiAgICAgKiBAbWl4ZXMgdmVydGljYWxUeXBlTWl4ZXJcbiAgICAgKiBAbWl4ZXMgbGluZVR5cGVNaXhlclxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmxpbmVUeXBlSW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbn0pO1xuXG5saW5lVHlwZU1peGVyLm1peGluKEFyZWFDaGFydCk7XG5heGlzVHlwZU1peGVyLm1peGluKEFyZWFDaGFydCk7XG52ZXJ0aWNhbFR5cGVNaXhlci5taXhpbihBcmVhQ2hhcnQpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFyZWFDaGFydDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBheGlzVHlwZU1peGVyIGlzIG1peGVyIG9mIGF4aXMgdHlwZSBjaGFydChiYXIsIGNvbHVtbiwgbGluZSwgYXJlYSkuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBBeGlzID0gcmVxdWlyZSgnLi4vYXhlcy9heGlzJyksXG4gICAgUGxvdCA9IHJlcXVpcmUoJy4uL3Bsb3RzL3Bsb3QnKSxcbiAgICBMZWdlbmQgPSByZXF1aXJlKCcuLi9sZWdlbmRzL2xlZ2VuZCcpLFxuICAgIFRvb2x0aXAgPSByZXF1aXJlKCcuLi90b29sdGlwcy90b29sdGlwJyksXG4gICAgR3JvdXBUb29sdGlwID0gcmVxdWlyZSgnLi4vdG9vbHRpcHMvZ3JvdXBUb29sdGlwJyk7XG5cbi8qKlxuICogYXhpc1R5cGVNaXhlciBpcyBiYXNlIGNsYXNzIG9mIGF4aXMgdHlwZSBjaGFydChiYXIsIGNvbHVtbiwgbGluZSwgYXJlYSkuXG4gKiBAbWl4aW5cbiAqL1xudmFyIGF4aXNUeXBlTWl4ZXIgPSB7XG4gICAgLyoqXG4gICAgICogQWRkIGF4aXMgY29tcG9uZW50c1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5jb3ZlcnREYXRhIGNvbnZlcnRlZCBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmF4ZXMgYXhlcyBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnBsb3REYXRhIHBsb3QgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHtmdW5jdGlvbn0gcGFyYW1zLlNlcmllcyBzZXJpZXMgY2xhc3NcbiAgICAgKi9cbiAgICBhZGRBeGlzQ29tcG9uZW50czogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBjb252ZXJ0ZWREYXRhID0gcGFyYW1zLmNvbnZlcnRlZERhdGEsXG4gICAgICAgICAgICBvcHRpb25zID0gdGhpcy5vcHRpb25zLFxuICAgICAgICAgICAgYWxpZ25lZCA9ICEhcGFyYW1zLmFsaWduZWQ7XG5cbiAgICAgICAgaWYgKHBhcmFtcy5wbG90RGF0YSkge1xuICAgICAgICAgICAgdGhpcy5hZGRDb21wb25lbnQoJ3Bsb3QnLCBQbG90LCBwYXJhbXMucGxvdERhdGEpO1xuICAgICAgICB9XG5cbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaChwYXJhbXMuYXhlcywgZnVuY3Rpb24oZGF0YSwgbmFtZSkge1xuICAgICAgICAgICAgdGhpcy5hZGRDb21wb25lbnQobmFtZSwgQXhpcywge1xuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgICAgICAgICAgYWxpZ25lZDogYWxpZ25lZFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIGlmIChjb252ZXJ0ZWREYXRhLmpvaW5MZWdlbmRMYWJlbHMpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KCdsZWdlbmQnLCBMZWdlbmQsIHtcbiAgICAgICAgICAgICAgICBqb2luTGVnZW5kTGFiZWxzOiBjb252ZXJ0ZWREYXRhLmpvaW5MZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICAgICAgbGVnZW5kTGFiZWxzOiBjb252ZXJ0ZWREYXRhLmxlZ2VuZExhYmVscyxcbiAgICAgICAgICAgICAgICBjaGFydFR5cGU6IHBhcmFtcy5jaGFydFR5cGVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5hZGRDb21wb25lbnQoJ3NlcmllcycsIHBhcmFtcy5TZXJpZXMsIHR1aS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICBsaWJUeXBlOiBvcHRpb25zLmxpYlR5cGUsXG4gICAgICAgICAgICBjaGFydFR5cGU6IG9wdGlvbnMuY2hhcnRUeXBlLFxuICAgICAgICAgICAgcGFyZW50Q2hhcnRUeXBlOiBvcHRpb25zLnBhcmVudENoYXJ0VHlwZSxcbiAgICAgICAgICAgIGFsaWduZWQ6IGFsaWduZWQsXG4gICAgICAgICAgICBpc1N1YkNoYXJ0OiB0aGlzLmlzU3ViQ2hhcnQsXG4gICAgICAgICAgICBpc0dyb3VwZWRUb29sdGlwOiB0aGlzLmlzR3JvdXBlZFRvb2x0aXBcbiAgICAgICAgfSwgcGFyYW1zLnNlcmllc0RhdGEpKTtcblxuICAgICAgICBpZiAodGhpcy5pc0dyb3VwZWRUb29sdGlwKSB7XG4gICAgICAgICAgICB0aGlzLmFkZENvbXBvbmVudCgndG9vbHRpcCcsIEdyb3VwVG9vbHRpcCwge1xuICAgICAgICAgICAgICAgIGxhYmVsczogY29udmVydGVkRGF0YS5sYWJlbHMsXG4gICAgICAgICAgICAgICAgam9pbkZvcm1hdHRlZFZhbHVlczogY29udmVydGVkRGF0YS5qb2luRm9ybWF0dGVkVmFsdWVzLFxuICAgICAgICAgICAgICAgIGpvaW5MZWdlbmRMYWJlbHM6IGNvbnZlcnRlZERhdGEuam9pbkxlZ2VuZExhYmVscyxcbiAgICAgICAgICAgICAgICBjaGFydElkOiB0aGlzLmNoYXJ0SWRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hZGRDb21wb25lbnQoJ3Rvb2x0aXAnLCBUb29sdGlwLCB7XG4gICAgICAgICAgICAgICAgdmFsdWVzOiBjb252ZXJ0ZWREYXRhLnZhbHVlcyxcbiAgICAgICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXM6IGNvbnZlcnRlZERhdGEuZm9ybWF0dGVkVmFsdWVzLFxuICAgICAgICAgICAgICAgIGxhYmVsczogY29udmVydGVkRGF0YS5sYWJlbHMsXG4gICAgICAgICAgICAgICAgbGVnZW5kTGFiZWxzOiBjb252ZXJ0ZWREYXRhLmxlZ2VuZExhYmVscyxcbiAgICAgICAgICAgICAgICBjaGFydElkOiB0aGlzLmNoYXJ0SWQsXG4gICAgICAgICAgICAgICAgaXNWZXJ0aWNhbDogdGhpcy5pc1ZlcnRpY2FsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHBsb3QgZGF0YS5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGxvdERhdGEgaW5pdGlhbGl6ZWQgcGxvdCBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGF4ZXNEYXRhIGF4ZXMgZGF0YVxuICAgICAqIEByZXR1cm5zIHt7dlRpY2tDb3VudDogbnVtYmVyLCBoVGlja0NvdW50OiBudW1iZXJ9fSBwbG90IGRhdGFcbiAgICAgKi9cbiAgICBtYWtlUGxvdERhdGE6IGZ1bmN0aW9uKHBsb3REYXRhLCBheGVzRGF0YSkge1xuICAgICAgICBpZiAodHVpLnV0aWwuaXNVbmRlZmluZWQocGxvdERhdGEpKSB7XG4gICAgICAgICAgICBwbG90RGF0YSA9IHtcbiAgICAgICAgICAgICAgICB2VGlja0NvdW50OiBheGVzRGF0YS55QXhpcy52YWxpZFRpY2tDb3VudCxcbiAgICAgICAgICAgICAgICBoVGlja0NvdW50OiBheGVzRGF0YS54QXhpcy52YWxpZFRpY2tDb3VudFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGxvdERhdGE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1peCBpbi5cbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBmdW5jIHRhcmdldCBmdW5jdGlvblxuICAgICAqIEBpZ25vcmVcbiAgICAgKi9cbiAgICBtaXhpbjogZnVuY3Rpb24oZnVuYykge1xuICAgICAgICB0dWkudXRpbC5leHRlbmQoZnVuYy5wcm90b3R5cGUsIHRoaXMpO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gYXhpc1R5cGVNaXhlcjtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBCYXIgY2hhcnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBDaGFydEJhc2UgPSByZXF1aXJlKCcuL2NoYXJ0QmFzZScpLFxuICAgIGF4aXNUeXBlTWl4ZXIgPSByZXF1aXJlKCcuL2F4aXNUeXBlTWl4ZXInKSxcbiAgICBheGlzRGF0YU1ha2VyID0gcmVxdWlyZSgnLi4vaGVscGVycy9heGlzRGF0YU1ha2VyJyksXG4gICAgU2VyaWVzID0gcmVxdWlyZSgnLi4vc2VyaWVzL2JhckNoYXJ0U2VyaWVzJyk7XG5cbnZhciBCYXJDaGFydCA9IHR1aS51dGlsLmRlZmluZUNsYXNzKENoYXJ0QmFzZSwgLyoqIEBsZW5kcyBCYXJDaGFydC5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIEJhciBjaGFydC5cbiAgICAgKiBAY29uc3RydWN0cyBCYXJDaGFydFxuICAgICAqIEBleHRlbmRzIENoYXJ0QmFzZVxuICAgICAqIEBtaXhlcyBheGlzVHlwZU1peGVyXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXk+fSB1c2VyRGF0YSBjaGFydCBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIGNoYXJ0IHRoZW1lXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKHVzZXJEYXRhLCB0aGVtZSwgb3B0aW9ucykge1xuICAgICAgICB2YXIgYmFzZURhdGEgPSB0aGlzLm1ha2VCYXNlRGF0YSh1c2VyRGF0YSwgdGhlbWUsIG9wdGlvbnMsIHtcbiAgICAgICAgICAgICAgICBoYXNBeGVzOiB0cnVlXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGNvbnZlcnRlZERhdGEgPSBiYXNlRGF0YS5jb252ZXJ0ZWREYXRhLFxuICAgICAgICAgICAgYm91bmRzID0gYmFzZURhdGEuYm91bmRzLFxuICAgICAgICAgICAgYXhlc0RhdGEgPSB0aGlzLl9tYWtlQXhlc0RhdGEoY29udmVydGVkRGF0YSwgYm91bmRzLCBvcHRpb25zKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogY2xhc3NOYW1lXG4gICAgICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNsYXNzTmFtZSA9ICd0dWktYmFyLWNoYXJ0JztcblxuICAgICAgICBDaGFydEJhc2UuY2FsbCh0aGlzLCB7XG4gICAgICAgICAgICBib3VuZHM6IGJvdW5kcyxcbiAgICAgICAgICAgIGF4ZXNEYXRhOiBheGVzRGF0YSxcbiAgICAgICAgICAgIHRoZW1lOiB0aGVtZSxcbiAgICAgICAgICAgIG9wdGlvbnM6IG9wdGlvbnNcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5fYWRkQ29tcG9uZW50cyhjb252ZXJ0ZWREYXRhLCBheGVzRGF0YSwgb3B0aW9ucyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYXhlcyBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGNvbnZlcnRlZERhdGEgY29udmVydGVkIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYm91bmRzIGNoYXJ0IGJvdW5kc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBheGVzIGRhdGFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQXhlc0RhdGE6IGZ1bmN0aW9uKGNvbnZlcnRlZERhdGEsIGJvdW5kcywgb3B0aW9ucykge1xuICAgICAgICB2YXIgYXhlc0RhdGEgPSB7XG4gICAgICAgICAgICB5QXhpczogYXhpc0RhdGFNYWtlci5tYWtlTGFiZWxBeGlzRGF0YSh7XG4gICAgICAgICAgICAgICAgbGFiZWxzOiBjb252ZXJ0ZWREYXRhLmxhYmVscyxcbiAgICAgICAgICAgICAgICBpc1ZlcnRpY2FsOiB0cnVlXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIHhBeGlzOiBheGlzRGF0YU1ha2VyLm1ha2VWYWx1ZUF4aXNEYXRhKHtcbiAgICAgICAgICAgICAgICB2YWx1ZXM6IGNvbnZlcnRlZERhdGEudmFsdWVzLFxuICAgICAgICAgICAgICAgIHNlcmllc0RpbWVuc2lvbjogYm91bmRzLnNlcmllcy5kaW1lbnNpb24sXG4gICAgICAgICAgICAgICAgc3RhY2tlZDogb3B0aW9ucy5zZXJpZXMgJiYgb3B0aW9ucy5zZXJpZXMuc3RhY2tlZCB8fCAnJyxcbiAgICAgICAgICAgICAgICBjaGFydFR5cGU6IG9wdGlvbnMuY2hhcnRUeXBlLFxuICAgICAgICAgICAgICAgIGZvcm1hdEZ1bmN0aW9uczogY29udmVydGVkRGF0YS5mb3JtYXRGdW5jdGlvbnMsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogb3B0aW9ucy54QXhpc1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGF4ZXNEYXRhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgY29tcG9uZW50c1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb252ZXJ0ZWREYXRhIGNvbnZlcnRlZCBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGF4ZXNEYXRhIGF4ZXMgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hZGRDb21wb25lbnRzOiBmdW5jdGlvbihjb252ZXJ0ZWREYXRhLCBheGVzRGF0YSwgb3B0aW9ucykge1xuICAgICAgICB2YXIgcGxvdERhdGEsIHNlcmllc0RhdGE7XG5cbiAgICAgICAgcGxvdERhdGEgPSB0aGlzLm1ha2VQbG90RGF0YShjb252ZXJ0ZWREYXRhLnBsb3REYXRhLCBheGVzRGF0YSk7XG4gICAgICAgIHNlcmllc0RhdGEgPSB7XG4gICAgICAgICAgICBhbGxvd05lZ2F0aXZlVG9vbHRpcDogdHJ1ZSxcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICB2YWx1ZXM6IGNvbnZlcnRlZERhdGEudmFsdWVzLFxuICAgICAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlczogY29udmVydGVkRGF0YS5mb3JtYXR0ZWRWYWx1ZXMsXG4gICAgICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zOiBjb252ZXJ0ZWREYXRhLmZvcm1hdEZ1bmN0aW9ucyxcbiAgICAgICAgICAgICAgICBzY2FsZTogYXhlc0RhdGEueEF4aXMuc2NhbGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5hZGRBeGlzQ29tcG9uZW50cyh7XG4gICAgICAgICAgICBjb252ZXJ0ZWREYXRhOiBjb252ZXJ0ZWREYXRhLFxuICAgICAgICAgICAgYXhlczogYXhlc0RhdGEsXG4gICAgICAgICAgICBwbG90RGF0YTogcGxvdERhdGEsXG4gICAgICAgICAgICBjaGFydFR5cGU6IG9wdGlvbnMuY2hhcnRUeXBlLFxuICAgICAgICAgICAgU2VyaWVzOiBTZXJpZXMsXG4gICAgICAgICAgICBzZXJpZXNEYXRhOiBzZXJpZXNEYXRhXG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuXG5heGlzVHlwZU1peGVyLm1peGluKEJhckNoYXJ0KTtcblxubW9kdWxlLmV4cG9ydHMgPSBCYXJDaGFydDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBDaGFydEJhc2VcbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuLi9jb25zdCcpLFxuICAgIGRvbSA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZG9tSGFuZGxlcicpLFxuICAgIHJlbmRlclV0aWwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3JlbmRlclV0aWwnKSxcbiAgICBkYXRhQ29udmVydGVyID0gcmVxdWlyZSgnLi4vaGVscGVycy9kYXRhQ29udmVydGVyJyksXG4gICAgYm91bmRzTWFrZXIgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2JvdW5kc01ha2VyJyksXG4gICAgR3JvdXBlZEV2ZW50SGFuZGxlTGF5ZXIgPSByZXF1aXJlKCcuLi9ldmVudEhhbmRsZUxheWVycy9ncm91cGVkRXZlbnRIYW5kbGVMYXllcicpO1xuXG52YXIgQ2hhcnRCYXNlID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBDaGFydEJhc2UucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBDaGFydCBiYXNlLlxuICAgICAqIEBjb25zdHJ1Y3RzIENoYXJ0QmFzZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5ib3VuZHMgY2hhcnQgYm91bmRzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIGNoYXJ0IHRoZW1lXG4gICAgICogICAgICBAcGFyYW0ge3t5QXhpczogb2JlamN0LCB4QXhpczogb2JqZWN0fX0gYXhlc0RhdGEgYXhlcyBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbS5pc1ZlcnRpY2FsIHdoZXRoZXIgdmVydGljYWwgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmluaXRlZERhdGEgaW5pdGlhbGl6ZWQgZGF0YSBmcm9tIGNvbWJvIGNoYXJ0XG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHRoaXMuY2hhcnRJZCA9IHBhcmFtcy5pbml0ZWREYXRhICYmIHBhcmFtcy5pbml0ZWREYXRhLmNoYXJ0SWQgfHwgY2hhcnRDb25zdC5DSEFSX0lEX1BSRUZJWCArICctJyArIChuZXcgRGF0ZSgpKS5nZXRUaW1lKCk7XG4gICAgICAgIHRoaXMuaXNTdWJDaGFydCA9ICEhcGFyYW1zLmluaXRlZERhdGE7XG4gICAgICAgIHRoaXMuY29tcG9uZW50cyA9IFtdO1xuICAgICAgICB0aGlzLmNvbXBvbmVudE1hcCA9IHt9O1xuICAgICAgICB0aGlzLmJvdW5kcyA9IHBhcmFtcy5ib3VuZHM7XG4gICAgICAgIHRoaXMudGhlbWUgPSBwYXJhbXMudGhlbWU7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IHBhcmFtcy5vcHRpb25zO1xuICAgICAgICB0aGlzLmlzU3ViQ2hhcnQgPSAhIXBhcmFtcy5pbml0ZWREYXRhO1xuICAgICAgICB0aGlzLmhhc0F4ZXMgPSAhIXBhcmFtcy5heGVzRGF0YTtcbiAgICAgICAgdGhpcy5pc1ZlcnRpY2FsID0gISFwYXJhbXMuaXNWZXJ0aWNhbDtcbiAgICAgICAgdGhpcy5pc0dyb3VwZWRUb29sdGlwID0gcGFyYW1zLm9wdGlvbnMudG9vbHRpcCAmJiBwYXJhbXMub3B0aW9ucy50b29sdGlwLmdyb3VwZWQ7XG5cbiAgICAgICAgdGhpcy5fYWRkR3JvdXBlZEV2ZW50SGFuZGxlTGF5ZXIocGFyYW1zLmF4ZXNEYXRhLCBwYXJhbXMub3B0aW9ucy5jaGFydFR5cGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgZ3JvdXBlZCBldmVudCBoYW5kbGVyIGxheWVyLlxuICAgICAqIEBwYXJhbSB7e3lBeGlzOiBvYmVqY3QsIHhBeGlzOiBvYmplY3R9fSBheGVzRGF0YSBheGVzIGRhdGFcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY2hhcnRUeXBlIGNoYXJ0IHR5cGVcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzVmVydGljYWwgd2hldGhlciB2ZXJ0aWNhbCBvciBub3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hZGRHcm91cGVkRXZlbnRIYW5kbGVMYXllcjogZnVuY3Rpb24oYXhlc0RhdGEsIGNoYXJ0VHlwZSkge1xuICAgICAgICB2YXIgdGlja0NvdW50O1xuXG4gICAgICAgIGlmICghdGhpcy5oYXNBeGVzIHx8ICF0aGlzLmlzR3JvdXBlZFRvb2x0aXAgfHwgdGhpcy5pc1N1YkNoYXJ0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5pc1ZlcnRpY2FsKSB7XG4gICAgICAgICAgICB0aWNrQ291bnQgPSBheGVzRGF0YS54QXhpcyA/IGF4ZXNEYXRhLnhBeGlzLnRpY2tDb3VudCA6IC0xO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGlja0NvdW50ID0gYXhlc0RhdGEueUF4aXMgPyBheGVzRGF0YS55QXhpcy50aWNrQ291bnQgOiAtMTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KCdldmVudEhhbmRsZUxheWVyJywgR3JvdXBlZEV2ZW50SGFuZGxlTGF5ZXIsIHtcbiAgICAgICAgICAgIHRpY2tDb3VudDogdGlja0NvdW50LFxuICAgICAgICAgICAgY2hhcnRUeXBlOiBjaGFydFR5cGUsXG4gICAgICAgICAgICBpc1ZlcnRpY2FsOiB0aGlzLmlzVmVydGljYWxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYmFlcyBkYXRhLlxuICAgICAqIEBwYXJhbSB7YXJyYXkgfCBvYmplY3R9IHVzZXJEYXRhIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBjaGFydCB0aGVtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIGFkZCBwYXJhbXNcbiAgICAgKiBAcmV0dXJucyB7e2NvbnZlcnRlZERhdGE6IG9iamVjdCwgYm91bmRzOiBvYmplY3R9fSBiYXNlIGRhdGFcbiAgICAgKi9cbiAgICBtYWtlQmFzZURhdGE6IGZ1bmN0aW9uKHVzZXJEYXRhLCB0aGVtZSwgb3B0aW9ucywgcGFyYW1zKSB7XG4gICAgICAgIHZhciBzZXJpZXNDaGFydFR5cGVzID0gcGFyYW1zID8gcGFyYW1zLnNlcmllc0NoYXJ0VHlwZXMgOiBbXSxcbiAgICAgICAgICAgIGNvbnZlcnRlZERhdGEgPSBkYXRhQ29udmVydGVyLmNvbnZlcnQodXNlckRhdGEsIG9wdGlvbnMuY2hhcnQsIG9wdGlvbnMuY2hhcnRUeXBlLCBzZXJpZXNDaGFydFR5cGVzKSxcbiAgICAgICAgICAgIGJvdW5kcyA9IGJvdW5kc01ha2VyLm1ha2UodHVpLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICBjaGFydFR5cGU6IG9wdGlvbnMuY2hhcnRUeXBlLFxuICAgICAgICAgICAgICAgIGNvbnZlcnRlZERhdGE6IGNvbnZlcnRlZERhdGEsXG4gICAgICAgICAgICAgICAgdGhlbWU6IHRoZW1lLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IG9wdGlvbnNcbiAgICAgICAgICAgIH0sIHBhcmFtcykpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjb252ZXJ0ZWREYXRhOiBjb252ZXJ0ZWREYXRhLFxuICAgICAgICAgICAgYm91bmRzOiBib3VuZHNcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIGNvbXBvbmVudC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBjb21wb25lbnQgbmFtZVxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IENvbXBvbmVudCBjb21wb25lbnQgZnVuY3Rpb25cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKi9cbiAgICBhZGRDb21wb25lbnQ6IGZ1bmN0aW9uKG5hbWUsIENvbXBvbmVudCwgcGFyYW1zKSB7XG4gICAgICAgIHZhciBib3VuZCA9IHRoaXMuYm91bmRzW25hbWVdLFxuICAgICAgICAgICAgdGhlbWUgPSB0aGlzLnRoZW1lW25hbWVdLFxuICAgICAgICAgICAgb3B0aW9ucyA9IHRoaXMub3B0aW9uc1tuYW1lXSxcbiAgICAgICAgICAgIGluZGV4ID0gcGFyYW1zLmluZGV4IHx8IDAsXG4gICAgICAgICAgICBjb21tb25QYXJhbXMgPSB7fSxcbiAgICAgICAgICAgIGNvbXBvbmVudDtcblxuICAgICAgICBjb21tb25QYXJhbXMuYm91bmQgPSB0dWkudXRpbC5pc0FycmF5KGJvdW5kKSA/IGJvdW5kW2luZGV4XSA6IGJvdW5kO1xuICAgICAgICBjb21tb25QYXJhbXMudGhlbWUgPSB0dWkudXRpbC5pc0FycmF5KHRoZW1lKSA/IHRoZW1lW2luZGV4XSA6IHRoZW1lO1xuICAgICAgICBjb21tb25QYXJhbXMub3B0aW9ucyA9IHR1aS51dGlsLmlzQXJyYXkob3B0aW9ucykgPyBvcHRpb25zW2luZGV4XSA6IG9wdGlvbnMgfHwge307XG5cbiAgICAgICAgcGFyYW1zID0gdHVpLnV0aWwuZXh0ZW5kKGNvbW1vblBhcmFtcywgcGFyYW1zKTtcbiAgICAgICAgY29tcG9uZW50ID0gbmV3IENvbXBvbmVudChwYXJhbXMpO1xuICAgICAgICB0aGlzLmNvbXBvbmVudHMucHVzaChjb21wb25lbnQpO1xuICAgICAgICB0aGlzLmNvbXBvbmVudE1hcFtuYW1lXSA9IGNvbXBvbmVudDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGN1c3RvbSBldm5ldC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hdHRhY2hDdXN0b21FdmVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmhhc0F4ZXMgJiYgdGhpcy5pc0dyb3VwZWRUb29sdGlwICYmICF0aGlzLmlzU3ViQ2hhcnQpIHtcbiAgICAgICAgICAgIHRoaXMuX2F0dGFjaENvb3JkaW5hdGVFdmVudCgpO1xuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLmhhc0F4ZXMgfHwgIXRoaXMuaXNHcm91cGVkVG9vbHRpcCkge1xuICAgICAgICAgICAgdGhpcy5fYXR0YWNoVG9vbHRpcEV2ZW50KCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIGNoYXJ0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgb2JqZWN0IGZvciBncmFwaCBkcmF3aW5nXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSBjaGFydCBlbGVtZW50XG4gICAgICovXG4gICAgcmVuZGVyOiBmdW5jdGlvbihlbCwgcGFwZXIpIHtcbiAgICAgICAgaWYgKCFlbCkge1xuICAgICAgICAgICAgZWwgPSBkb20uY3JlYXRlKCdESVYnLCB0aGlzLmNsYXNzTmFtZSk7XG5cbiAgICAgICAgICAgIGRvbS5hZGRDbGFzcyhlbCwgJ3R1aS1jaGFydCcpO1xuICAgICAgICAgICAgdGhpcy5fcmVuZGVyVGl0bGUoZWwpO1xuICAgICAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJEaW1lbnNpb24oZWwsIHRoaXMuYm91bmRzLmNoYXJ0LmRpbWVuc2lvbik7XG4gICAgICAgICAgICByZW5kZXJVdGlsLnJlbmRlckJhY2tncm91bmQoZWwsIHRoaXMudGhlbWUuY2hhcnQuYmFja2dyb3VuZCk7XG4gICAgICAgICAgICByZW5kZXJVdGlsLnJlbmRlckZvbnRGYW1pbHkoZWwsIHRoaXMudGhlbWUuY2hhcnQuZm9udEZhbWlseSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9yZW5kZXJDb21wb25lbnRzKGVsLCB0aGlzLmNvbXBvbmVudHMsIHBhcGVyKTtcbiAgICAgICAgdGhpcy5fYXR0YWNoQ3VzdG9tRXZlbnQoKTtcblxuICAgICAgICByZXR1cm4gZWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciB0aXRsZS5cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlclRpdGxlOiBmdW5jdGlvbihlbCkge1xuICAgICAgICB2YXIgY2hhcnRPcHRpb25zID0gdGhpcy5vcHRpb25zLmNoYXJ0IHx8IHt9LFxuICAgICAgICAgICAgZWxUaXRsZSA9IHJlbmRlclV0aWwucmVuZGVyVGl0bGUoY2hhcnRPcHRpb25zLnRpdGxlLCB0aGlzLnRoZW1lLnRpdGxlLCAndHVpLWNoYXJ0LXRpdGxlJyk7XG4gICAgICAgIGRvbS5hcHBlbmQoZWwsIGVsVGl0bGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgY29tcG9uZW50cy5cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY29udGFpbmVyIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxvYmplY3Q+fSBjb21wb25lbnRzIGNvbXBvbmVudHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgb2JqZWN0IGZvciBncmFwaCBkcmF3aW5nXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyQ29tcG9uZW50czogZnVuY3Rpb24oY29udGFpbmVyLCBjb21wb25lbnRzLCBwYXBlcikge1xuICAgICAgICB2YXIgZWxlbWVudHMgPSB0dWkudXRpbC5tYXAoY29tcG9uZW50cywgZnVuY3Rpb24oY29tcG9uZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gY29tcG9uZW50LnJlbmRlcihwYXBlcik7XG4gICAgICAgIH0pO1xuICAgICAgICBkb20uYXBwZW5kKGNvbnRhaW5lciwgZWxlbWVudHMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgcGFwZXIuXG4gICAgICogQHJldHVybnMge29iamVjdH0gcGFwZXJcbiAgICAgKi9cbiAgICBnZXRQYXBlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZXJpZXMgPSB0aGlzLmNvbXBvbmVudE1hcC5zZXJpZXMsXG4gICAgICAgICAgICBwYXBlcjtcblxuICAgICAgICBpZiAoc2VyaWVzKSB7XG4gICAgICAgICAgICBwYXBlciA9IHNlcmllcy5nZXRQYXBlcigpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhcGVyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggY3VzdG9tIGV2ZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYXR0YWNoVG9vbHRpcEV2ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHRvb2x0aXAgPSB0aGlzLmNvbXBvbmVudE1hcC50b29sdGlwLFxuICAgICAgICAgICAgc2VyaWVzID0gdGhpcy5jb21wb25lbnRNYXAuc2VyaWVzO1xuICAgICAgICBpZiAoIXRvb2x0aXAgfHwgIXNlcmllcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHNlcmllcy5vbignc2hvd1Rvb2x0aXAnLCB0b29sdGlwLm9uU2hvdywgdG9vbHRpcCk7XG4gICAgICAgIHNlcmllcy5vbignaGlkZVRvb2x0aXAnLCB0b29sdGlwLm9uSGlkZSwgdG9vbHRpcCk7XG5cbiAgICAgICAgaWYgKCFzZXJpZXMub25TaG93QW5pbWF0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0b29sdGlwLm9uKCdzaG93QW5pbWF0aW9uJywgc2VyaWVzLm9uU2hvd0FuaW1hdGlvbiwgc2VyaWVzKTtcbiAgICAgICAgdG9vbHRpcC5vbignaGlkZUFuaW1hdGlvbicsIHNlcmllcy5vbkhpZGVBbmltYXRpb24sIHNlcmllcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCBjb29yZGluYXRlIGV2ZW50LlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2F0dGFjaENvb3JkaW5hdGVFdmVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBldmVudEhhbmRsZUxheWVyID0gdGhpcy5jb21wb25lbnRNYXAuZXZlbnRIYW5kbGVMYXllcixcbiAgICAgICAgICAgIHRvb2x0aXAgPSB0aGlzLmNvbXBvbmVudE1hcC50b29sdGlwLFxuICAgICAgICAgICAgc2VyaWVzID0gdGhpcy5jb21wb25lbnRNYXAuc2VyaWVzO1xuICAgICAgICBldmVudEhhbmRsZUxheWVyLm9uKCdzaG93R3JvdXBUb29sdGlwJywgdG9vbHRpcC5vblNob3csIHRvb2x0aXApO1xuICAgICAgICBldmVudEhhbmRsZUxheWVyLm9uKCdoaWRlR3JvdXBUb29sdGlwJywgdG9vbHRpcC5vbkhpZGUsIHRvb2x0aXApO1xuXG4gICAgICAgIGlmIChzZXJpZXMpIHtcbiAgICAgICAgICAgIHRvb2x0aXAub24oJ3Nob3dHcm91cEFuaW1hdGlvbicsIHNlcmllcy5vblNob3dHcm91cEFuaW1hdGlvbiwgc2VyaWVzKTtcbiAgICAgICAgICAgIHRvb2x0aXAub24oJ2hpZGVHcm91cEFuaW1hdGlvbicsIHNlcmllcy5vbkhpZGVHcm91cEFuaW1hdGlvbiwgc2VyaWVzKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBbmltYXRlIGNoYXJ0LlxuICAgICAqL1xuICAgIGFuaW1hdGVDaGFydDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHR1aS51dGlsLmZvckVhY2hBcnJheSh0aGlzLmNvbXBvbmVudHMsIGZ1bmN0aW9uKGNvbXBvbmVudCkge1xuICAgICAgICAgICAgaWYgKGNvbXBvbmVudC5hbmltYXRlQ29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LmFuaW1hdGVDb21wb25lbnQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2hhcnRCYXNlO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IENvbHVtbiBjaGFydC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIENoYXJ0QmFzZSA9IHJlcXVpcmUoJy4vY2hhcnRCYXNlJyksXG4gICAgYXhpc1R5cGVNaXhlciA9IHJlcXVpcmUoJy4vYXhpc1R5cGVNaXhlcicpLFxuICAgIHZlcnRpY2FsVHlwZU1peGVyID0gcmVxdWlyZSgnLi92ZXJ0aWNhbFR5cGVNaXhlcicpLFxuICAgIFNlcmllcyA9IHJlcXVpcmUoJy4uL3Nlcmllcy9jb2x1bW5DaGFydFNlcmllcycpO1xuXG52YXIgQ29sdW1uQ2hhcnQgPSB0dWkudXRpbC5kZWZpbmVDbGFzcyhDaGFydEJhc2UsIC8qKiBAbGVuZHMgQ29sdW1uQ2hhcnQucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBDb2x1bW4gY2hhcnQuXG4gICAgICogQGNvbnN0cnVjdHMgQ29sdW1uQ2hhcnRcbiAgICAgKiBAZXh0ZW5kcyBDaGFydEJhc2VcbiAgICAgKiBAbWl4ZXMgYXhpc1R5cGVNaXhlclxuICAgICAqIEBtaXhlcyB2ZXJ0aWNhbFR5cGVNaXhlclxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gdXNlckRhdGEgY2hhcnQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBjaGFydCB0aGVtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gaW5pdGVkRGF0YSBpbml0aWFsaXplZCBkYXRhIGZyb20gY29tYm8gY2hhcnRcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbih1c2VyRGF0YSwgdGhlbWUsIG9wdGlvbnMsIGluaXRlZERhdGEpIHtcbiAgICAgICAgdmFyIGJhc2VEYXRhID0gaW5pdGVkRGF0YSB8fCB0aGlzLm1ha2VCYXNlRGF0YSh1c2VyRGF0YSwgdGhlbWUsIG9wdGlvbnMsIHtcbiAgICAgICAgICAgICAgICBpc1ZlcnRpY2FsOiB0cnVlLFxuICAgICAgICAgICAgICAgIGhhc0F4ZXM6IHRydWVcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgY29udmVydGVkRGF0YSA9IGJhc2VEYXRhLmNvbnZlcnRlZERhdGEsXG4gICAgICAgICAgICBib3VuZHMgPSBiYXNlRGF0YS5ib3VuZHMsXG4gICAgICAgICAgICBheGVzRGF0YSA9IHRoaXMuX21ha2VBeGVzRGF0YShjb252ZXJ0ZWREYXRhLCBib3VuZHMsIG9wdGlvbnMsIGluaXRlZERhdGEpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBjbGFzc05hbWVcbiAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2xhc3NOYW1lID0gJ3R1aS1jb2x1bW4tY2hhcnQnO1xuXG4gICAgICAgIENoYXJ0QmFzZS5jYWxsKHRoaXMsIHtcbiAgICAgICAgICAgIGJvdW5kczogYm91bmRzLFxuICAgICAgICAgICAgYXhlc0RhdGE6IGF4ZXNEYXRhLFxuICAgICAgICAgICAgdGhlbWU6IHRoZW1lLFxuICAgICAgICAgICAgb3B0aW9uczogb3B0aW9ucyxcbiAgICAgICAgICAgIGlzVmVydGljYWw6IHRydWUsXG4gICAgICAgICAgICBpbml0ZWREYXRhOiBpbml0ZWREYXRhXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuX2FkZENvbXBvbmVudHMoY29udmVydGVkRGF0YSwgYXhlc0RhdGEsIG9wdGlvbnMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgY29tcG9uZW50c1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb252ZXJ0ZWREYXRhIGNvbnZlcnRlZCBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGF4ZXNEYXRhIGF4ZXMgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hZGRDb21wb25lbnRzOiBmdW5jdGlvbihjb252ZXJ0ZWREYXRhLCBheGVzRGF0YSwgb3B0aW9ucykge1xuICAgICAgICB2YXIgcGxvdERhdGEsIHNlcmllc0RhdGE7XG5cbiAgICAgICAgcGxvdERhdGEgPSB0aGlzLm1ha2VQbG90RGF0YShjb252ZXJ0ZWREYXRhLnBsb3REYXRhLCBheGVzRGF0YSk7XG4gICAgICAgIHNlcmllc0RhdGEgPSB7XG4gICAgICAgICAgICBhbGxvd05lZ2F0aXZlVG9vbHRpcDogdHJ1ZSxcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICB2YWx1ZXM6IGNvbnZlcnRlZERhdGEudmFsdWVzLFxuICAgICAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlczogY29udmVydGVkRGF0YS5mb3JtYXR0ZWRWYWx1ZXMsXG4gICAgICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zOiBjb252ZXJ0ZWREYXRhLmZvcm1hdEZ1bmN0aW9ucyxcbiAgICAgICAgICAgICAgICBzY2FsZTogYXhlc0RhdGEueUF4aXMuc2NhbGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5hZGRBeGlzQ29tcG9uZW50cyh7XG4gICAgICAgICAgICBjb252ZXJ0ZWREYXRhOiBjb252ZXJ0ZWREYXRhLFxuICAgICAgICAgICAgYXhlczogYXhlc0RhdGEsXG4gICAgICAgICAgICBwbG90RGF0YTogcGxvdERhdGEsXG4gICAgICAgICAgICBjaGFydFR5cGU6IG9wdGlvbnMuY2hhcnRUeXBlLFxuICAgICAgICAgICAgU2VyaWVzOiBTZXJpZXMsXG4gICAgICAgICAgICBzZXJpZXNEYXRhOiBzZXJpZXNEYXRhXG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuXG5heGlzVHlwZU1peGVyLm1peGluKENvbHVtbkNoYXJ0KTtcbnZlcnRpY2FsVHlwZU1peGVyLm1peGluKENvbHVtbkNoYXJ0KTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb2x1bW5DaGFydDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBDb21ibyBjaGFydC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGNhbGN1bGF0b3IgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2NhbGN1bGF0b3InKSxcbiAgICBDaGFydEJhc2UgPSByZXF1aXJlKCcuL2NoYXJ0QmFzZScpLFxuICAgIGF4aXNEYXRhTWFrZXIgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2F4aXNEYXRhTWFrZXInKSxcbiAgICBkZWZhdWx0VGhlbWUgPSByZXF1aXJlKCcuLi90aGVtZXMvZGVmYXVsdFRoZW1lJyksXG4gICAgR3JvdXBUb29sdGlwID0gcmVxdWlyZSgnLi4vdG9vbHRpcHMvZ3JvdXBUb29sdGlwJyksXG4gICAgQ29sdW1uQ2hhcnQgPSByZXF1aXJlKCcuL2NvbHVtbkNoYXJ0JyksXG4gICAgTGluZUNoYXJ0ID0gcmVxdWlyZSgnLi9saW5lQ2hhcnQnKTtcblxudmFyIENvbWJvQ2hhcnQgPSB0dWkudXRpbC5kZWZpbmVDbGFzcyhDaGFydEJhc2UsIC8qKiBAbGVuZHMgQ29tYm9DaGFydC5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIENvbWJvIGNoYXJ0LlxuICAgICAqIEBjb25zdHJ1Y3RzIENvbWJvQ2hhcnRcbiAgICAgKiBAZXh0ZW5kcyBDaGFydEJhc2VcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheT59IHVzZXJEYXRhIGNoYXJ0IGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgY2hhcnQgdGhlbWVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24odXNlckRhdGEsIHRoZW1lLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciBzZXJpZXNDaGFydFR5cGVzID0gdHVpLnV0aWwua2V5cyh1c2VyRGF0YS5zZXJpZXMpLnNvcnQoKSxcbiAgICAgICAgICAgIG9wdGlvbkNoYXJ0VHlwZXMgPSB0aGlzLl9nZXRZQXhpc09wdGlvbkNoYXJ0VHlwZXMoc2VyaWVzQ2hhcnRUeXBlcywgb3B0aW9ucy55QXhpcyksXG4gICAgICAgICAgICBjaGFydFR5cGVzID0gb3B0aW9uQ2hhcnRUeXBlcy5sZW5ndGggPyBvcHRpb25DaGFydFR5cGVzIDogc2VyaWVzQ2hhcnRUeXBlcyxcbiAgICAgICAgICAgIGJhc2VEYXRhID0gdGhpcy5tYWtlQmFzZURhdGEodXNlckRhdGEsIHRoZW1lLCBvcHRpb25zLCB7XG4gICAgICAgICAgICAgICAgaXNWZXJ0aWNhbDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBoYXNBeGVzOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNlcmllc0NoYXJ0VHlwZXM6IHNlcmllc0NoYXJ0VHlwZXMsXG4gICAgICAgICAgICAgICAgb3B0aW9uQ2hhcnRUeXBlczogb3B0aW9uQ2hhcnRUeXBlc1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBjb252ZXJ0ZWREYXRhID0gYmFzZURhdGEuY29udmVydGVkRGF0YSxcbiAgICAgICAgICAgIGJvdW5kcyA9IGJhc2VEYXRhLmJvdW5kcyxcbiAgICAgICAgICAgIG9wdGlvbnNNYXAgPSB0aGlzLl9tYWtlT3B0aW9uc01hcChjaGFydFR5cGVzLCBvcHRpb25zKSxcbiAgICAgICAgICAgIHRoZW1lTWFwID0gdGhpcy5fbWFrZVRoZW1lTWFwKHNlcmllc0NoYXJ0VHlwZXMsIHRoZW1lLCBjb252ZXJ0ZWREYXRhLmxlZ2VuZExhYmVscyksXG4gICAgICAgICAgICB5QXhpc1BhcmFtcyA9IHtcbiAgICAgICAgICAgICAgICBjb252ZXJ0ZWREYXRhOiBjb252ZXJ0ZWREYXRhLFxuICAgICAgICAgICAgICAgIHNlcmllc0RpbWVuc2lvbjogYm91bmRzLnNlcmllcy5kaW1lbnNpb24sXG4gICAgICAgICAgICAgICAgY2hhcnRUeXBlczogY2hhcnRUeXBlcyxcbiAgICAgICAgICAgICAgICBpc09uZVlBeGlzOiAhb3B0aW9uQ2hhcnRUeXBlcy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJhc2VBeGVzRGF0YSA9IHt9O1xuXG4gICAgICAgIGJhc2VBeGVzRGF0YS55QXhpcyA9IHRoaXMuX21ha2VZQXhpc0RhdGEodHVpLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgIGluZGV4OiAwXG4gICAgICAgIH0sIHlBeGlzUGFyYW1zKSk7XG5cbiAgICAgICAgYmFzZUF4ZXNEYXRhLnhBeGlzID0gYXhpc0RhdGFNYWtlci5tYWtlTGFiZWxBeGlzRGF0YSh7XG4gICAgICAgICAgICBsYWJlbHM6IGNvbnZlcnRlZERhdGEubGFiZWxzXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuY2xhc3NOYW1lID0gJ3R1aS1jb21iby1jaGFydCc7XG5cbiAgICAgICAgQ2hhcnRCYXNlLmNhbGwodGhpcywge1xuICAgICAgICAgICAgYm91bmRzOiBib3VuZHMsXG4gICAgICAgICAgICBheGVzRGF0YTogYmFzZUF4ZXNEYXRhLFxuICAgICAgICAgICAgdGhlbWU6IHRoZW1lLFxuICAgICAgICAgICAgb3B0aW9uczogb3B0aW9ucyxcbiAgICAgICAgICAgIGlzVmVydGljYWw6IHRydWVcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5hZGRDb21wb25lbnQoJ3Rvb2x0aXAnLCBHcm91cFRvb2x0aXAsIHtcbiAgICAgICAgICAgIGxhYmVsczogY29udmVydGVkRGF0YS5sYWJlbHMsXG4gICAgICAgICAgICBqb2luRm9ybWF0dGVkVmFsdWVzOiBjb252ZXJ0ZWREYXRhLmpvaW5Gb3JtYXR0ZWRWYWx1ZXMsXG4gICAgICAgICAgICBqb2luTGVnZW5kTGFiZWxzOiBjb252ZXJ0ZWREYXRhLmpvaW5MZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICBjaGFydElkOiB0aGlzLmNoYXJ0SWRcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5faW5zdGFsbENoYXJ0cyh7XG4gICAgICAgICAgICB1c2VyRGF0YTogdXNlckRhdGEsXG4gICAgICAgICAgICBiYXNlRGF0YTogYmFzZURhdGEsXG4gICAgICAgICAgICBiYXNlQXhlc0RhdGE6IGJhc2VBeGVzRGF0YSxcbiAgICAgICAgICAgIGF4ZXNEYXRhOiB0aGlzLl9tYWtlQXhlc0RhdGEoYmFzZUF4ZXNEYXRhLCB5QXhpc1BhcmFtcywgY29udmVydGVkRGF0YS5mb3JtYXRGdW5jdGlvbnMpLFxuICAgICAgICAgICAgc2VyaWVzQ2hhcnRUeXBlczogc2VyaWVzQ2hhcnRUeXBlcyxcbiAgICAgICAgICAgIG9wdGlvbnNNYXA6IG9wdGlvbnNNYXAsXG4gICAgICAgICAgICB0aGVtZU1hcDogdGhlbWVNYXBcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB5IGF4aXMgb3B0aW9uIGNoYXJ0IHR5cGVzLlxuICAgICAqIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGNoYXJ0VHlwZXMgY2hhcnQgdHlwZXNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0geUF4aXNPcHRpb25zIHkgYXhpcyBvcHRpb25zXG4gICAgICogQHJldHVybnMge2FycmF5LjxzdHJpbmc+fSBjaGFydCB0eXBlc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFlBeGlzT3B0aW9uQ2hhcnRUeXBlczogZnVuY3Rpb24oY2hhcnRUeXBlcywgeUF4aXNPcHRpb25zKSB7XG4gICAgICAgIHZhciByZXN1bHRDaGFydFR5cGVzID0gY2hhcnRUeXBlcy5zbGljZSgpLFxuICAgICAgICAgICAgaXNSZXZlcnNlID0gZmFsc2UsXG4gICAgICAgICAgICBvcHRpb25DaGFydFR5cGVzO1xuXG4gICAgICAgIHlBeGlzT3B0aW9ucyA9IHlBeGlzT3B0aW9ucyA/IFtdLmNvbmNhdCh5QXhpc09wdGlvbnMpIDogW107XG5cbiAgICAgICAgaWYgKHlBeGlzT3B0aW9ucy5sZW5ndGggPT09IDEgJiYgIXlBeGlzT3B0aW9uc1swXS5jaGFydFR5cGUpIHtcbiAgICAgICAgICAgIHJlc3VsdENoYXJ0VHlwZXMgPSBbXTtcbiAgICAgICAgfSBlbHNlIGlmICh5QXhpc09wdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICBvcHRpb25DaGFydFR5cGVzID0gdHVpLnV0aWwubWFwKHlBeGlzT3B0aW9ucywgZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbi5jaGFydFR5cGU7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdHVpLnV0aWwuZm9yRWFjaEFycmF5KG9wdGlvbkNoYXJ0VHlwZXMsIGZ1bmN0aW9uKGNoYXJ0VHlwZSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICBpc1JldmVyc2UgPSBpc1JldmVyc2UgfHwgKGNoYXJ0VHlwZSAmJiByZXN1bHRDaGFydFR5cGVzW2luZGV4XSAhPT0gY2hhcnRUeXBlIHx8IGZhbHNlKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAoaXNSZXZlcnNlKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0Q2hhcnRUeXBlcy5yZXZlcnNlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0Q2hhcnRUeXBlcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSB5IGF4aXMgZGF0YS5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuaW5kZXggY2hhcnQgaW5kZXhcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuY29udmVydGVkRGF0YSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBwYXJhbXMuc2VyaWVzRGltZW5zaW9uIHNlcmllcyBkaW1lbnNpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGNoYXJ0VHlwZXMgY2hhcnQgdHlwZVxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBpc09uZVlBeGlzIHdoZXRoZXIgb25lIHNlcmllcyBvciBub3RcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBhZGRQYXJhbXMgYWRkIHBhcmFtc1xuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHkgYXhpcyBkYXRhXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVlBeGlzRGF0YTogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBjb252ZXJ0ZWREYXRhID0gcGFyYW1zLmNvbnZlcnRlZERhdGEsXG4gICAgICAgICAgICBpbmRleCA9IHBhcmFtcy5pbmRleCxcbiAgICAgICAgICAgIGNoYXJ0VHlwZSA9IHBhcmFtcy5jaGFydFR5cGVzW2luZGV4XSxcbiAgICAgICAgICAgIG9wdGlvbnMgPSBwYXJhbXMub3B0aW9ucyxcbiAgICAgICAgICAgIHlBeGlzVmFsdWVzLCB5QXhpc09wdGlvbnMsIHNlcmllc09wdGlvbjtcblxuICAgICAgICBpZiAocGFyYW1zLmlzT25lWUF4aXMpIHtcbiAgICAgICAgICAgIHlBeGlzVmFsdWVzID0gY29udmVydGVkRGF0YS5qb2luVmFsdWVzO1xuICAgICAgICAgICAgeUF4aXNPcHRpb25zID0gW29wdGlvbnMueUF4aXNdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgeUF4aXNWYWx1ZXMgPSBjb252ZXJ0ZWREYXRhLnZhbHVlc1tjaGFydFR5cGVdO1xuICAgICAgICAgICAgeUF4aXNPcHRpb25zID0gb3B0aW9ucy55QXhpcyB8fCBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNlcmllc09wdGlvbiA9IG9wdGlvbnMuc2VyaWVzICYmIG9wdGlvbnMuc2VyaWVzW2NoYXJ0VHlwZV0gfHwgb3B0aW9ucy5zZXJpZXM7XG5cbiAgICAgICAgcmV0dXJuIGF4aXNEYXRhTWFrZXIubWFrZVZhbHVlQXhpc0RhdGEodHVpLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgIHZhbHVlczogeUF4aXNWYWx1ZXMsXG4gICAgICAgICAgICBzdGFja2VkOiBzZXJpZXNPcHRpb24gJiYgc2VyaWVzT3B0aW9uLnN0YWNrZWQgfHwgJycsXG4gICAgICAgICAgICBvcHRpb25zOiB5QXhpc09wdGlvbnNbaW5kZXhdLFxuICAgICAgICAgICAgY2hhcnRUeXBlOiBjaGFydFR5cGUsXG4gICAgICAgICAgICBzZXJpZXNEaW1lbnNpb246IHBhcmFtcy5zZXJpZXNEaW1lbnNpb24sXG4gICAgICAgICAgICBmb3JtYXRGdW5jdGlvbnM6IGNvbnZlcnRlZERhdGEuZm9ybWF0RnVuY3Rpb25zLFxuICAgICAgICAgICAgaXNWZXJ0aWNhbDogdHJ1ZVxuICAgICAgICB9LCBwYXJhbXMuYWRkUGFyYW1zKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYXhlcyBkYXRhLlxuICAgICAqIEBwYXJhbSB7e3lBeGlzOiBvYmplY3QsIHhBeGlzOiBvYmplY3R9fSBiYXNlQXhlc0RhdGEgYmFzZSBheGVzIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0geUF4aXNQYXJhbXMgeSBheGlzIHBhcmFtc1xuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IGF4ZXMgZGF0YVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VBeGVzRGF0YTogZnVuY3Rpb24oYmFzZUF4ZXNEYXRhLCB5QXhpc1BhcmFtcywgZm9ybWF0RnVuY3Rpb25zKSB7XG4gICAgICAgIHZhciB5QXhpc0RhdGEgPSBiYXNlQXhlc0RhdGEueUF4aXMsXG4gICAgICAgICAgICBjaGFydFR5cGVzID0geUF4aXNQYXJhbXMuY2hhcnRUeXBlcyxcbiAgICAgICAgICAgIGF4ZXNEYXRhID0ge30sXG4gICAgICAgICAgICB5ckF4aXNEYXRhO1xuICAgICAgICBpZiAoIXlBeGlzUGFyYW1zLmlzT25lWUF4aXMpIHtcbiAgICAgICAgICAgIHlyQXhpc0RhdGEgPSB0aGlzLl9tYWtlWUF4aXNEYXRhKHR1aS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgaW5kZXg6IDEsXG4gICAgICAgICAgICAgICAgYWRkUGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgICAgIGlzUG9zaXRpb25SaWdodDogdHJ1ZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHlBeGlzUGFyYW1zKSk7XG4gICAgICAgICAgICBpZiAoeUF4aXNEYXRhLnRpY2tDb3VudCA8IHlyQXhpc0RhdGEudGlja0NvdW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5jcmVhc2VZQXhpc1RpY2tDb3VudCh5ckF4aXNEYXRhLnRpY2tDb3VudCAtIHlBeGlzRGF0YS50aWNrQ291bnQsIHlBeGlzRGF0YSwgZm9ybWF0RnVuY3Rpb25zKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoeUF4aXNEYXRhLnRpY2tDb3VudCA+IHlyQXhpc0RhdGEudGlja0NvdW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5jcmVhc2VZQXhpc1RpY2tDb3VudCh5QXhpc0RhdGEudGlja0NvdW50IC0geXJBeGlzRGF0YS50aWNrQ291bnQsIHlyQXhpc0RhdGEsIGZvcm1hdEZ1bmN0aW9ucyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBheGVzRGF0YVtjaGFydFR5cGVzWzBdXSA9IGJhc2VBeGVzRGF0YTtcbiAgICAgICAgYXhlc0RhdGFbY2hhcnRUeXBlc1sxXV0gPSB7XG4gICAgICAgICAgICB5QXhpczogeXJBeGlzRGF0YSB8fCB5QXhpc0RhdGFcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gYXhlc0RhdGE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2Ugb3JkZXIgaW5mbyBhYm91bmQgY2hhcnQgdHlwZS5cbiAgICAgKiBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBjaGFydFR5cGVzIGNoYXJ0IHR5cGVzXG4gICAgICogQHJldHVybnMge29iamVjdH0gY2hhcnQgb3JkZXIgaW5mb1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VDaGFydFR5cGVPcmRlckluZm86IGZ1bmN0aW9uKGNoYXJ0VHlwZXMpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgICAgICB0dWkudXRpbC5mb3JFYWNoQXJyYXkoY2hhcnRUeXBlcywgZnVuY3Rpb24oY2hhcnRUeXBlLCBpbmRleCkge1xuICAgICAgICAgICAgcmVzdWx0W2NoYXJ0VHlwZV0gPSBpbmRleDtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2Ugb3B0aW9ucyBtYXBcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY2hhcnRUeXBlcyBjaGFydCB0eXBlc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3JkZXJJbmZvIGNoYXJ0IG9yZGVyXG4gICAgICogQHJldHVybnMge29iamVjdH0gb3B0aW9ucyBtYXBcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlT3B0aW9uc01hcDogZnVuY3Rpb24oY2hhcnRUeXBlcywgb3B0aW9ucykge1xuICAgICAgICB2YXIgb3JkZXJJbmZvID0gdGhpcy5fbWFrZUNoYXJ0VHlwZU9yZGVySW5mbyhjaGFydFR5cGVzKSxcbiAgICAgICAgICAgIHJlc3VsdCA9IHt9O1xuICAgICAgICB0dWkudXRpbC5mb3JFYWNoQXJyYXkoY2hhcnRUeXBlcywgZnVuY3Rpb24oY2hhcnRUeXBlKSB7XG4gICAgICAgICAgICB2YXIgY2hhcnRPcHRpb25zID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvcHRpb25zKSksXG4gICAgICAgICAgICAgICAgaW5kZXggPSBvcmRlckluZm9bY2hhcnRUeXBlXTtcblxuICAgICAgICAgICAgaWYgKGNoYXJ0T3B0aW9ucy55QXhpcyAmJiBjaGFydE9wdGlvbnMueUF4aXNbaW5kZXhdKSB7XG4gICAgICAgICAgICAgICAgY2hhcnRPcHRpb25zLnlBeGlzID0gY2hhcnRPcHRpb25zLnlBeGlzW2luZGV4XTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGNoYXJ0T3B0aW9ucy5zZXJpZXMgJiYgY2hhcnRPcHRpb25zLnNlcmllc1tjaGFydFR5cGVdKSB7XG4gICAgICAgICAgICAgICAgY2hhcnRPcHRpb25zLnNlcmllcyA9IGNoYXJ0T3B0aW9ucy5zZXJpZXNbY2hhcnRUeXBlXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGNoYXJ0T3B0aW9ucy50b29sdGlwICYmIGNoYXJ0T3B0aW9ucy50b29sdGlwW2NoYXJ0VHlwZV0pIHtcbiAgICAgICAgICAgICAgICBjaGFydE9wdGlvbnMudG9vbHRpcCA9IGNoYXJ0T3B0aW9ucy50b29sdGlwW2NoYXJ0VHlwZV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjaGFydE9wdGlvbnMucGFyZW50Q2hhcnRUeXBlID0gY2hhcnRPcHRpb25zLmNoYXJ0VHlwZTtcbiAgICAgICAgICAgIGNoYXJ0T3B0aW9ucy5jaGFydFR5cGUgPSBjaGFydFR5cGU7XG4gICAgICAgICAgICByZXN1bHRbY2hhcnRUeXBlXSA9IGNoYXJ0T3B0aW9ucztcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgdGhlbWUgbWFwXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGNoYXJ0VHlwZXMgY2hhcnQgdHlwZXNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgY2hhcnQgdGhlbWVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gbGVnZW5kTGFiZWxzIGxlZ2VuZCBsYWJlbHNcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSB0aGVtZSBtYXBcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlVGhlbWVNYXA6IGZ1bmN0aW9uKGNoYXJ0VHlwZXMsIHRoZW1lLCBsZWdlbmRMYWJlbHMpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHt9LFxuICAgICAgICAgICAgY29sb3JDb3VudCA9IDA7XG4gICAgICAgIHR1aS51dGlsLmZvckVhY2hBcnJheShjaGFydFR5cGVzLCBmdW5jdGlvbihjaGFydFR5cGUpIHtcbiAgICAgICAgICAgIHZhciBjaGFydFRoZW1lID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGVtZSkpLFxuICAgICAgICAgICAgICAgIHJlbW92ZWRDb2xvcnM7XG5cbiAgICAgICAgICAgIGlmIChjaGFydFRoZW1lLnlBeGlzW2NoYXJ0VHlwZV0pIHtcbiAgICAgICAgICAgICAgICBjaGFydFRoZW1lLnlBeGlzID0gY2hhcnRUaGVtZS55QXhpc1tjaGFydFR5cGVdO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghY2hhcnRUaGVtZS55QXhpcy50aXRsZSkge1xuICAgICAgICAgICAgICAgIGNoYXJ0VGhlbWUueUF4aXMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGRlZmF1bHRUaGVtZS55QXhpcykpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoY2hhcnRUaGVtZS5zZXJpZXNbY2hhcnRUeXBlXSkge1xuICAgICAgICAgICAgICAgIGNoYXJ0VGhlbWUuc2VyaWVzID0gY2hhcnRUaGVtZS5zZXJpZXNbY2hhcnRUeXBlXTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWNoYXJ0VGhlbWUuc2VyaWVzLmNvbG9ycykge1xuICAgICAgICAgICAgICAgIGNoYXJ0VGhlbWUuc2VyaWVzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShkZWZhdWx0VGhlbWUuc2VyaWVzKSk7XG4gICAgICAgICAgICAgICAgY2hhcnRUaGVtZS5zZXJpZXMubGFiZWwuZm9udEZhbWlseSA9IGNoYXJ0VGhlbWUuY2hhcnQuZm9udEZhbWlseTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVtb3ZlZENvbG9ycyA9IGNoYXJ0VGhlbWUuc2VyaWVzLmNvbG9ycy5zcGxpY2UoMCwgY29sb3JDb3VudCk7XG4gICAgICAgICAgICAgICAgY2hhcnRUaGVtZS5zZXJpZXMuY29sb3JzID0gY2hhcnRUaGVtZS5zZXJpZXMuY29sb3JzLmNvbmNhdChyZW1vdmVkQ29sb3JzKTtcbiAgICAgICAgICAgICAgICBjb2xvckNvdW50ICs9IGxlZ2VuZExhYmVsc1tjaGFydFR5cGVdLmxlbmd0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdFtjaGFydFR5cGVdID0gY2hhcnRUaGVtZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEluY3JlYXNlIHkgYXhpcyB0aWNrIGNvdW50LlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmNyZWFzZVRpY2tDb3VudCBpbmNyZWFzZSB0aWNrIGNvdW50XG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRvRGF0YSB0byB0aWNrIGluZm9cbiAgICAgKiBAcGFyYW0ge2FycmF5LjxmdW5jdGlvbj59IGZvcm1hdEZ1bmN0aW9ucyBmb3JtYXQgZnVuY3Rpb25zXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaW5jcmVhc2VZQXhpc1RpY2tDb3VudDogZnVuY3Rpb24oaW5jcmVhc2VUaWNrQ291bnQsIHRvRGF0YSwgZm9ybWF0RnVuY3Rpb25zKSB7XG4gICAgICAgIHRvRGF0YS5zY2FsZS5tYXggKz0gdG9EYXRhLnN0ZXAgKiBpbmNyZWFzZVRpY2tDb3VudDtcbiAgICAgICAgdG9EYXRhLmxhYmVscyA9IGF4aXNEYXRhTWFrZXIuZm9ybWF0TGFiZWxzKGNhbGN1bGF0b3IubWFrZUxhYmVsc0Zyb21TY2FsZSh0b0RhdGEuc2NhbGUsIHRvRGF0YS5zdGVwKSwgZm9ybWF0RnVuY3Rpb25zKTtcbiAgICAgICAgdG9EYXRhLnRpY2tDb3VudCArPSBpbmNyZWFzZVRpY2tDb3VudDtcbiAgICAgICAgdG9EYXRhLnZhbGlkVGlja0NvdW50ICs9IGluY3JlYXNlVGlja0NvdW50O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnN0YWxsIGNoYXJ0cy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudXNlckRhdGEgdXNlciBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmJhc2VEYXRhIGNoYXJ0IGJhc2UgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBjaGFydCB0aGVtZVxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5vcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiAgICAgIEBwYXJhbSB7e3lBeGlzOiBvYmplY3QsIHhBeGlzOiBvYmplY3R9fSBwYXJhbXMuYmFzZUF4ZXNEYXRhIGJhc2UgYXhlcyBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmF4ZXNEYXRhIGF4ZXMgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48c3RyaW5nPn0gcGFyYW1zLnNlcmllc0NoYXJ0VHlwZXMgc2VyaWVzIGNoYXJ0IHR5cGVzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBwYXJhbXMuY2hhcnRUeXBlcyBjaGFydCB0eXBlc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2luc3RhbGxDaGFydHM6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgY2hhcnRDbGFzc2VzID0ge1xuICAgICAgICAgICAgICAgIGNvbHVtbjogQ29sdW1uQ2hhcnQsXG4gICAgICAgICAgICAgICAgbGluZTogTGluZUNoYXJ0XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYmFzZURhdGEgPSBwYXJhbXMuYmFzZURhdGEsXG4gICAgICAgICAgICBjb252ZXJ0ZWREYXRhID0gYmFzZURhdGEuY29udmVydGVkRGF0YSxcbiAgICAgICAgICAgIHBsb3REYXRhID0ge1xuICAgICAgICAgICAgICAgIHZUaWNrQ291bnQ6IHBhcmFtcy5iYXNlQXhlc0RhdGEueUF4aXMudmFsaWRUaWNrQ291bnQsXG4gICAgICAgICAgICAgICAgaFRpY2tDb3VudDogcGFyYW1zLmJhc2VBeGVzRGF0YS54QXhpcy52YWxpZFRpY2tDb3VudFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGpvaW5MZWdlbmRMYWJlbHMgPSBjb252ZXJ0ZWREYXRhLmpvaW5MZWdlbmRMYWJlbHM7XG5cbiAgICAgICAgdGhpcy5jaGFydHMgPSB0dWkudXRpbC5tYXAocGFyYW1zLnNlcmllc0NoYXJ0VHlwZXMsIGZ1bmN0aW9uKGNoYXJ0VHlwZSkge1xuICAgICAgICAgICAgdmFyIGxlZ2VuZExhYmVscyA9IGNvbnZlcnRlZERhdGEubGVnZW5kTGFiZWxzW2NoYXJ0VHlwZV0sXG4gICAgICAgICAgICAgICAgYXhlcyA9IHBhcmFtcy5heGVzRGF0YVtjaGFydFR5cGVdLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSBwYXJhbXMub3B0aW9uc01hcFtjaGFydFR5cGVdLFxuICAgICAgICAgICAgICAgIHRoZW1lID0gcGFyYW1zLnRoZW1lTWFwW2NoYXJ0VHlwZV0sXG4gICAgICAgICAgICAgICAgYm91bmRzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShiYXNlRGF0YS5ib3VuZHMpKSxcbiAgICAgICAgICAgICAgICBDaGFydCA9IGNoYXJ0Q2xhc3Nlc1tjaGFydFR5cGVdLFxuICAgICAgICAgICAgICAgIGluaXRlZERhdGEsIGNoYXJ0O1xuXG4gICAgICAgICAgICBpZiAoYXhlcyAmJiBheGVzLnlBeGlzLmlzUG9zaXRpb25SaWdodCkge1xuICAgICAgICAgICAgICAgIGJvdW5kcy55QXhpcyA9IGJvdW5kcy55ckF4aXM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGluaXRlZERhdGEgPSB7XG4gICAgICAgICAgICAgICAgY29udmVydGVkRGF0YToge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZXM6IGNvbnZlcnRlZERhdGEudmFsdWVzW2NoYXJ0VHlwZV0sXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsczogY29udmVydGVkRGF0YS5sYWJlbHMsXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdEZ1bmN0aW9uczogY29udmVydGVkRGF0YS5mb3JtYXRGdW5jdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlczogY29udmVydGVkRGF0YS5mb3JtYXR0ZWRWYWx1ZXNbY2hhcnRUeXBlXSxcbiAgICAgICAgICAgICAgICAgICAgbGVnZW5kTGFiZWxzOiBsZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICAgICAgICAgIGpvaW5MZWdlbmRMYWJlbHM6IGpvaW5MZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICAgICAgICAgIHBsb3REYXRhOiBwbG90RGF0YVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgYm91bmRzOiBib3VuZHMsXG4gICAgICAgICAgICAgICAgYXhlczogYXhlcyxcbiAgICAgICAgICAgICAgICBjaGFydElkOiB0aGlzLmNoYXJ0SWRcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNoYXJ0ID0gbmV3IENoYXJ0KHBhcmFtcy51c2VyRGF0YSwgdGhlbWUsIG9wdGlvbnMsIGluaXRlZERhdGEpO1xuICAgICAgICAgICAgcGxvdERhdGEgPSBudWxsO1xuICAgICAgICAgICAgam9pbkxlZ2VuZExhYmVscyA9IG51bGw7XG4gICAgICAgICAgICByZXR1cm4gY2hhcnQ7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgY29tYm8gY2hhcnQuXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSBjb21ibyBjaGFydCBlbGVtZW50XG4gICAgICovXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGVsID0gQ2hhcnRCYXNlLnByb3RvdHlwZS5yZW5kZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgdmFyIHBhcGVyO1xuICAgICAgICB0dWkudXRpbC5mb3JFYWNoQXJyYXkodGhpcy5jaGFydHMsIGZ1bmN0aW9uKGNoYXJ0LCBpbmRleCkge1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBjaGFydC5yZW5kZXIoZWwsIHBhcGVyKTtcbiAgICAgICAgICAgICAgICBpZiAoIXBhcGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhcGVyID0gY2hhcnQuZ2V0UGFwZXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2hhcnQuYW5pbWF0ZUNoYXJ0KCk7XG4gICAgICAgICAgICB9LCAxICogaW5kZXgpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGVsO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbWJvQ2hhcnQ7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgTGluZSBjaGFydFxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ2hhcnRCYXNlID0gcmVxdWlyZSgnLi9jaGFydEJhc2UnKSxcbiAgICBsaW5lVHlwZU1peGVyID0gcmVxdWlyZSgnLi9saW5lVHlwZU1peGVyJyksXG4gICAgYXhpc1R5cGVNaXhlciA9IHJlcXVpcmUoJy4vYXhpc1R5cGVNaXhlcicpLFxuICAgIHZlcnRpY2FsVHlwZU1peGVyID0gcmVxdWlyZSgnLi92ZXJ0aWNhbFR5cGVNaXhlcicpLFxuICAgIFNlcmllcyA9IHJlcXVpcmUoJy4uL3Nlcmllcy9saW5lQ2hhcnRTZXJpZXMnKTtcblxudmFyIExpbmVDaGFydCA9IHR1aS51dGlsLmRlZmluZUNsYXNzKENoYXJ0QmFzZSwgLyoqIEBsZW5kcyBMaW5lQ2hhcnQucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBjbGFzc05hbWVcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIGNsYXNzTmFtZTogJ3R1aS1saW5lLWNoYXJ0JyxcblxuICAgIC8qKlxuICAgICAqIFNlcmllcyBjbGFzc1xuICAgICAqIEB0eXBlIHtmdW5jdGlvbn1cbiAgICAgKi9cbiAgICBTZXJpZXM6IFNlcmllcyxcblxuICAgIC8qKlxuICAgICAqIExpbmUgY2hhcnQuXG4gICAgICogQGNvbnN0cnVjdHMgTGluZUNoYXJ0XG4gICAgICogQGV4dGVuZHMgQ2hhcnRCYXNlXG4gICAgICogQG1peGVzIGF4aXNUeXBlTWl4ZXJcbiAgICAgKiBAbWl4ZXMgdmVydGljYWxUeXBlTWl4ZXJcbiAgICAgKiBAbWl4ZXMgbGluZVR5cGVNaXhlclxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmxpbmVUeXBlSW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbn0pO1xuXG5heGlzVHlwZU1peGVyLm1peGluKExpbmVDaGFydCk7XG52ZXJ0aWNhbFR5cGVNaXhlci5taXhpbihMaW5lQ2hhcnQpO1xubGluZVR5cGVNaXhlci5taXhpbihMaW5lQ2hhcnQpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IExpbmVDaGFydDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBsaW5lVHlwZU1peGVyIGlzIG1peGVyIG9mIGxpbmUgdHlwZSBjaGFydChsaW5lLCBhcmVhKS5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIENoYXJ0QmFzZSA9IHJlcXVpcmUoJy4vY2hhcnRCYXNlJyksXG4gICAgTGluZVR5cGVFdmVudEhhbmRsZUxheWVyID0gcmVxdWlyZSgnLi4vZXZlbnRIYW5kbGVMYXllcnMvbGluZVR5cGVFdmVudEhhbmRsZUxheWVyJyk7XG5cbi8qKlxuICogbGluZVR5cGVNaXhlciBpcyBtaXhlciBvZiBsaW5lIHR5cGUgY2hhcnQobGluZSwgYXJlYSkuXG4gKiBAbWl4aW5cbiAqL1xudmFyIGxpbmVUeXBlTWl4ZXIgPSB7XG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSBsaW5lIHR5cGUgY2hhcnQuXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXk+fSB1c2VyRGF0YSBjaGFydCBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIGNoYXJ0IHRoZW1lXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBpbml0ZWREYXRhIGluaXRpYWxpemVkIGRhdGEgZnJvbSBjb21ibyBjaGFydFxuICAgICAqL1xuICAgIGxpbmVUeXBlSW5pdDogZnVuY3Rpb24odXNlckRhdGEsIHRoZW1lLCBvcHRpb25zLCBpbml0ZWREYXRhKSB7XG4gICAgICAgIHZhciBiYXNlRGF0YSA9IGluaXRlZERhdGEgfHwgdGhpcy5tYWtlQmFzZURhdGEodXNlckRhdGEsIHRoZW1lLCBvcHRpb25zLCB7XG4gICAgICAgICAgICAgICAgaXNWZXJ0aWNhbDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBoYXNBeGVzOiB0cnVlXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGNvbnZlcnRlZERhdGEgPSBiYXNlRGF0YS5jb252ZXJ0ZWREYXRhLFxuICAgICAgICAgICAgYm91bmRzID0gYmFzZURhdGEuYm91bmRzLFxuICAgICAgICAgICAgYXhlc0RhdGEgPSB0aGlzLl9tYWtlQXhlc0RhdGEoY29udmVydGVkRGF0YSwgYm91bmRzLCBvcHRpb25zLCBpbml0ZWREYXRhKTtcblxuICAgICAgICBDaGFydEJhc2UuY2FsbCh0aGlzLCB7XG4gICAgICAgICAgICBib3VuZHM6IGJvdW5kcyxcbiAgICAgICAgICAgIGF4ZXNEYXRhOiBheGVzRGF0YSxcbiAgICAgICAgICAgIHRoZW1lOiB0aGVtZSxcbiAgICAgICAgICAgIG9wdGlvbnM6IG9wdGlvbnMsXG4gICAgICAgICAgICBpc1ZlcnRpY2FsOiB0cnVlLFxuICAgICAgICAgICAgaW5pdGVkRGF0YTogaW5pdGVkRGF0YVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoIXRoaXMuaXNTdWJDaGFydCAmJiAhdGhpcy5pc0dyb3VwZWRUb29sdGlwKSB7XG4gICAgICAgICAgICB0aGlzLmFkZENvbXBvbmVudCgnZXZlbnRIYW5kbGVMYXllcicsIExpbmVUeXBlRXZlbnRIYW5kbGVMYXllciwge1xuICAgICAgICAgICAgICAgIHRpY2tDb3VudDogYXhlc0RhdGEueEF4aXMgPyBheGVzRGF0YS54QXhpcy50aWNrQ291bnQgOiAtMVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9hZGRDb21wb25lbnRzKGNvbnZlcnRlZERhdGEsIGF4ZXNEYXRhLCBvcHRpb25zKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIGNvbXBvbmVudHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udmVydGVkRGF0YSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBheGVzRGF0YSBheGVzIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYWRkQ29tcG9uZW50czogZnVuY3Rpb24oY29udmVydGVkRGF0YSwgYXhlc0RhdGEpIHtcbiAgICAgICAgdmFyIHBsb3REYXRhLCBzZXJpZXNEYXRhO1xuXG4gICAgICAgIHBsb3REYXRhID0gdGhpcy5tYWtlUGxvdERhdGEoY29udmVydGVkRGF0YS5wbG90RGF0YSwgYXhlc0RhdGEpO1xuICAgICAgICBzZXJpZXNEYXRhID0ge1xuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIHZhbHVlczogdHVpLnV0aWwucGl2b3QoY29udmVydGVkRGF0YS52YWx1ZXMpLFxuICAgICAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlczogdHVpLnV0aWwucGl2b3QoY29udmVydGVkRGF0YS5mb3JtYXR0ZWRWYWx1ZXMpLFxuICAgICAgICAgICAgICAgIHNjYWxlOiBheGVzRGF0YS55QXhpcy5zY2FsZSxcbiAgICAgICAgICAgICAgICB4VGlja0NvdW50OiBheGVzRGF0YS54QXhpcyAmJiBheGVzRGF0YS54QXhpcy50aWNrQ291bnQgfHwgLTFcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5hZGRBeGlzQ29tcG9uZW50cyh7XG4gICAgICAgICAgICBjb252ZXJ0ZWREYXRhOiBjb252ZXJ0ZWREYXRhLFxuICAgICAgICAgICAgYXhlczogYXhlc0RhdGEsXG4gICAgICAgICAgICBwbG90RGF0YTogcGxvdERhdGEsXG4gICAgICAgICAgICBTZXJpZXM6IHRoaXMuU2VyaWVzLFxuICAgICAgICAgICAgc2VyaWVzRGF0YTogc2VyaWVzRGF0YSxcbiAgICAgICAgICAgIGFsaWduZWQ6IGF4ZXNEYXRhLnhBeGlzICYmIGF4ZXNEYXRhLnhBeGlzLmFsaWduZWRcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlclxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gY2hhcnQgZWxlbWVudFxuICAgICAqL1xuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghdGhpcy5pc1N1YkNoYXJ0ICYmICF0aGlzLmlzR3JvdXBlZFRvb2x0aXApIHtcbiAgICAgICAgICAgIHRoaXMuX2F0dGFjaExpbmVUeXBlQ29vcmRpbmF0ZUV2ZW50KCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIENoYXJ0QmFzZS5wcm90b3R5cGUucmVuZGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIGF0dGFjaCBjb29yZGluYXRlIGV2ZW50IG9mIGxpbmUgdHlwZS5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hdHRhY2hMaW5lVHlwZUNvb3JkaW5hdGVFdmVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBldmVudEhhbmRsZUxheWVyID0gdGhpcy5jb21wb25lbnRNYXAuZXZlbnRIYW5kbGVMYXllcixcbiAgICAgICAgICAgIHNlcmllcyA9IHRoaXMuY29tcG9uZW50TWFwLnNlcmllcztcbiAgICAgICAgZXZlbnRIYW5kbGVMYXllci5vbignb3ZlclRpY2tTZWN0b3InLCBzZXJpZXMub25MaW5lVHlwZU92ZXJUaWNrU2VjdG9yLCBzZXJpZXMpO1xuICAgICAgICBldmVudEhhbmRsZUxheWVyLm9uKCdvdXRUaWNrU2VjdG9yJywgc2VyaWVzLm9uTGluZVR5cGVPdXRUaWNrU2VjdG9yLCBzZXJpZXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBNaXggaW4uXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gZnVuYyB0YXJnZXQgZnVuY3Rpb25cbiAgICAgKiBAaWdub3JlXG4gICAgICovXG4gICAgbWl4aW46IGZ1bmN0aW9uKGZ1bmMpIHtcbiAgICAgICAgdHVpLnV0aWwuZXh0ZW5kKGZ1bmMucHJvdG90eXBlLCB0aGlzKTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGxpbmVUeXBlTWl4ZXI7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgUGllIGNoYXJ0LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ2hhcnRCYXNlID0gcmVxdWlyZSgnLi9jaGFydEJhc2UnKSxcbiAgICBjaGFydENvbnN0ID0gcmVxdWlyZSgnLi4vY29uc3QnKSxcbiAgICBMZWdlbmQgPSByZXF1aXJlKCcuLi9sZWdlbmRzL2xlZ2VuZCcpLFxuICAgIFRvb2x0aXAgPSByZXF1aXJlKCcuLi90b29sdGlwcy90b29sdGlwJyksXG4gICAgU2VyaWVzID0gcmVxdWlyZSgnLi4vc2VyaWVzL3BpZUNoYXJ0U2VyaWVzJyk7XG5cbnZhciBQaWVDaGFydCA9IHR1aS51dGlsLmRlZmluZUNsYXNzKENoYXJ0QmFzZSwgLyoqIEBsZW5kcyBQaWVDaGFydC5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIENvbHVtbiBjaGFydC5cbiAgICAgKiBAY29uc3RydWN0cyBQaWVDaGFydFxuICAgICAqIEBleHRlbmRzIENoYXJ0QmFzZVxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gdXNlckRhdGEgY2hhcnQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBjaGFydCB0aGVtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbih1c2VyRGF0YSwgdGhlbWUsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIGJhc2VEYXRhID0gdGhpcy5tYWtlQmFzZURhdGEodXNlckRhdGEsIHRoZW1lLCBvcHRpb25zKSxcbiAgICAgICAgICAgIGNvbnZlcnRlZERhdGEgPSBiYXNlRGF0YS5jb252ZXJ0ZWREYXRhLFxuICAgICAgICAgICAgYm91bmRzID0gYmFzZURhdGEuYm91bmRzO1xuXG4gICAgICAgIHRoaXMuY2xhc3NOYW1lID0gJ3R1aS1waWUtY2hhcnQnO1xuXG4gICAgICAgIG9wdGlvbnMudG9vbHRpcCA9IG9wdGlvbnMudG9vbHRpcCB8fCB7fTtcblxuICAgICAgICBpZiAoIW9wdGlvbnMudG9vbHRpcC5wb3NpdGlvbikge1xuICAgICAgICAgICAgb3B0aW9ucy50b29sdGlwLnBvc2l0aW9uID0gY2hhcnRDb25zdC5UT09MVElQX0RFRkFVTFRfUE9TSVRJT05fT1BUSU9OO1xuICAgICAgICB9XG5cbiAgICAgICAgQ2hhcnRCYXNlLmNhbGwodGhpcywge1xuICAgICAgICAgICAgYm91bmRzOiBib3VuZHMsXG4gICAgICAgICAgICB0aGVtZTogdGhlbWUsXG4gICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuX2FkZENvbXBvbmVudHMoY29udmVydGVkRGF0YSwgdGhlbWUuY2hhcnQuYmFja2dyb3VuZCwgYm91bmRzLCBvcHRpb25zKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIGNvbXBvbmVudHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udmVydGVkRGF0YSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjaGFydEJhY2tncm91bmQgY2hhcnQgYmFja2dyb3VuZFxuICAgICAqIEBwYXJhbSB7YXJyYXkuPG9iamVjdD59IGJvdW5kcyBib3VuZHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYWRkQ29tcG9uZW50czogZnVuY3Rpb24oY29udmVydGVkRGF0YSwgY2hhcnRCYWNrZ3JvdW5kLCBib3VuZHMsIG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKGNvbnZlcnRlZERhdGEuam9pbkxlZ2VuZExhYmVscyAmJiAoIW9wdGlvbnMuc2VyaWVzIHx8ICFvcHRpb25zLnNlcmllcy5sZWdlbmRUeXBlKSkge1xuICAgICAgICAgICAgdGhpcy5hZGRDb21wb25lbnQoJ2xlZ2VuZCcsIExlZ2VuZCwge1xuICAgICAgICAgICAgICAgIGpvaW5MZWdlbmRMYWJlbHM6IGNvbnZlcnRlZERhdGEuam9pbkxlZ2VuZExhYmVscyxcbiAgICAgICAgICAgICAgICBsZWdlbmRMYWJlbHM6IGNvbnZlcnRlZERhdGEubGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgICAgIGNoYXJ0VHlwZTogb3B0aW9ucy5jaGFydFR5cGVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5hZGRDb21wb25lbnQoJ3Rvb2x0aXAnLCBUb29sdGlwLCB7XG4gICAgICAgICAgICBjaGFydFR5cGU6IG9wdGlvbnMuY2hhcnRUeXBlLFxuICAgICAgICAgICAgdmFsdWVzOiBjb252ZXJ0ZWREYXRhLmZvcm1hdHRlZFZhbHVlcyxcbiAgICAgICAgICAgIGxhYmVsczogY29udmVydGVkRGF0YS5sYWJlbHMsXG4gICAgICAgICAgICBsZWdlbmRMYWJlbHM6IGNvbnZlcnRlZERhdGEubGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgY2hhcnRJZDogdGhpcy5jaGFydElkLFxuICAgICAgICAgICAgc2VyaWVzUG9zaXRpb246IGJvdW5kcy5zZXJpZXMucG9zaXRpb25cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5hZGRDb21wb25lbnQoJ3NlcmllcycsIFNlcmllcywge1xuICAgICAgICAgICAgbGliVHlwZTogb3B0aW9ucy5saWJUeXBlLFxuICAgICAgICAgICAgY2hhcnRUeXBlOiBvcHRpb25zLmNoYXJ0VHlwZSxcbiAgICAgICAgICAgIGNoYXJ0QmFja2dyb3VuZDogY2hhcnRCYWNrZ3JvdW5kLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIHZhbHVlczogY29udmVydGVkRGF0YS52YWx1ZXMsXG4gICAgICAgICAgICAgICAgZm9ybWF0dGVkVmFsdWVzOiBjb252ZXJ0ZWREYXRhLmZvcm1hdHRlZFZhbHVlcyxcbiAgICAgICAgICAgICAgICBsZWdlbmRMYWJlbHM6IGNvbnZlcnRlZERhdGEubGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgICAgIGNoYXJ0V2lkdGg6IGJvdW5kcy5jaGFydC5kaW1lbnNpb24ud2lkdGhcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUGllQ2hhcnQ7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgdmVydGljYWxUeXBlTWl4ZXIgaXMgbWl4ZXIgb2YgdmVydGljYWwgdHlwZSBjaGFydChjb2x1bW4sIGxpbmUsIGFyZWEpLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgYXhpc0RhdGFNYWtlciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvYXhpc0RhdGFNYWtlcicpLFxuICAgIHN0YXRlID0gcmVxdWlyZSgnLi4vaGVscGVycy9zdGF0ZScpO1xuXG4vKipcbiAqIHZlcnRpY2FsVHlwZU1peGVyIGlzIG1peGVyIG9mIHZlcnRpY2FsIHR5cGUgY2hhcnQoY29sdW1uLCBsaW5lLCBhcmVhKS5cbiAqIEBtaXhpblxuICovXG52YXIgdmVydGljYWxUeXBlTWl4ZXIgPSB7XG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBheGVzIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udmVydGVkRGF0YSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBib3VuZHMgY2hhcnQgYm91bmRzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBpbml0ZWREYXRhIGluaXRpYWxpemVkIGRhdGEgZnJvbSBjb21ibyBjaGFydFxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IGF4ZXMgZGF0YVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VBeGVzRGF0YTogZnVuY3Rpb24oY29udmVydGVkRGF0YSwgYm91bmRzLCBvcHRpb25zLCBpbml0ZWREYXRhKSB7XG4gICAgICAgIHZhciBheGVzRGF0YSA9IHt9O1xuICAgICAgICBpZiAoaW5pdGVkRGF0YSkge1xuICAgICAgICAgICAgYXhlc0RhdGEgPSBpbml0ZWREYXRhLmF4ZXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBheGVzRGF0YS55QXhpcyA9IGF4aXNEYXRhTWFrZXIubWFrZVZhbHVlQXhpc0RhdGEoe1xuICAgICAgICAgICAgICAgIHZhbHVlczogY29udmVydGVkRGF0YS52YWx1ZXMsXG4gICAgICAgICAgICAgICAgc2VyaWVzRGltZW5zaW9uOiBib3VuZHMuc2VyaWVzLmRpbWVuc2lvbixcbiAgICAgICAgICAgICAgICBzdGFja2VkOiBvcHRpb25zLnNlcmllcyAmJiBvcHRpb25zLnNlcmllcy5zdGFja2VkIHx8ICcnLFxuICAgICAgICAgICAgICAgIGNoYXJ0VHlwZTogb3B0aW9ucy5jaGFydFR5cGUsXG4gICAgICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zOiBjb252ZXJ0ZWREYXRhLmZvcm1hdEZ1bmN0aW9ucyxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zLnlBeGlzLFxuICAgICAgICAgICAgICAgIGlzVmVydGljYWw6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYXhlc0RhdGEueEF4aXMgPSBheGlzRGF0YU1ha2VyLm1ha2VMYWJlbEF4aXNEYXRhKHtcbiAgICAgICAgICAgICAgICBsYWJlbHM6IGNvbnZlcnRlZERhdGEubGFiZWxzLFxuICAgICAgICAgICAgICAgIGFsaWduZWQ6IHN0YXRlLmlzTGluZVR5cGVDaGFydChvcHRpb25zLmNoYXJ0VHlwZSksXG4gICAgICAgICAgICAgICAgb3B0aW9uczogb3B0aW9ucy54QXhpc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGF4ZXNEYXRhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBNaXggaW4uXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gZnVuYyB0YXJnZXQgZnVuY3Rpb25cbiAgICAgKiBAaWdub3JlXG4gICAgICovXG4gICAgbWl4aW46IGZ1bmN0aW9uKGZ1bmMpIHtcbiAgICAgICAgdHVpLnV0aWwuZXh0ZW5kKGZ1bmMucHJvdG90eXBlLCB0aGlzKTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHZlcnRpY2FsVHlwZU1peGVyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFBpY2sgbWluaW11bSB2YWx1ZSBmcm9tIHZhbHVlIGFycmF5LlxuICogQHBhcmFtIHthcnJheX0gYXJyIHZhbHVlIGFycmF5XG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjb25kaXRpb24gY29uZGl0aW9uIGZ1bmN0aW9uXG4gKiBAcGFyYW0ge29iamVjdH0gY29udGV4dCB0YXJnZXQgY29udGV4dFxuICogQHJldHVybnMgeyp9IG1pbmltdW0gdmFsdWVcbiAqL1xudmFyIG1pbiA9IGZ1bmN0aW9uKGFyciwgY29uZGl0aW9uLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdCwgbWluVmFsdWUsIHJlc3Q7XG4gICAgaWYgKCFjb25kaXRpb24pIHtcbiAgICAgICAgY29uZGl0aW9uID0gZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgIH07XG4gICAgfVxuICAgIHJlc3VsdCA9IGFyclswXTtcbiAgICBtaW5WYWx1ZSA9IGNvbmRpdGlvbi5jYWxsKGNvbnRleHQsIHJlc3VsdCk7XG4gICAgcmVzdCA9IGFyci5zbGljZSgxKTtcbiAgICB0dWkudXRpbC5mb3JFYWNoQXJyYXkocmVzdCwgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICB2YXIgY29tcGFyZVZhbHVlID0gY29uZGl0aW9uLmNhbGwoY29udGV4dCwgaXRlbSk7XG4gICAgICAgIGlmIChjb21wYXJlVmFsdWUgPCBtaW5WYWx1ZSkge1xuICAgICAgICAgICAgbWluVmFsdWUgPSBjb21wYXJlVmFsdWU7XG4gICAgICAgICAgICByZXN1bHQgPSBpdGVtO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogUGljayBtYXhpbXVtIHZhbHVlIGZyb20gdmFsdWUgYXJyYXkuXG4gKiBAcGFyYW0ge2FycmF5fSBhcnIgdmFsdWUgYXJyYXlcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNvbmRpdGlvbiBjb25kaXRpb24gZnVuY3Rpb25cbiAqIEBwYXJhbSB7b2JqZWN0fSBjb250ZXh0IHRhcmdldCBjb250ZXh0XG4gKiBAcmV0dXJucyB7Kn0gbWF4aW11bSB2YWx1ZVxuICovXG52YXIgbWF4ID0gZnVuY3Rpb24oYXJyLCBjb25kaXRpb24sIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0LCBtYXhWYWx1ZSwgcmVzdDtcbiAgICBpZiAoIWNvbmRpdGlvbikge1xuICAgICAgICBjb25kaXRpb24gPSBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgcmVzdWx0ID0gYXJyWzBdO1xuICAgIG1heFZhbHVlID0gY29uZGl0aW9uLmNhbGwoY29udGV4dCwgcmVzdWx0KTtcbiAgICByZXN0ID0gYXJyLnNsaWNlKDEpO1xuICAgIHR1aS51dGlsLmZvckVhY2hBcnJheShyZXN0LCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIHZhciBjb21wYXJlVmFsdWUgPSBjb25kaXRpb24uY2FsbChjb250ZXh0LCBpdGVtKTtcbiAgICAgICAgaWYgKGNvbXBhcmVWYWx1ZSA+IG1heFZhbHVlKSB7XG4gICAgICAgICAgICBtYXhWYWx1ZSA9IGNvbXBhcmVWYWx1ZTtcbiAgICAgICAgICAgIHJlc3VsdCA9IGl0ZW07XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBXaGV0aGVyIG9uZSBvZiB0aGVtIGlzIHRydWUgb3Igbm90LlxuICogQHBhcmFtIHthcnJheX0gYXJyIHRhcmdldCBhcnJheVxuICogQHBhcmFtIHtmdW5jdGlvbn0gY29uZGl0aW9uIGNvbmRpdGlvbiBmdW5jdGlvblxuICogQHJldHVybnMge2Jvb2xlYW59IHJlc3VsdCBib29sZWFuXG4gKi9cbnZhciBhbnkgPSBmdW5jdGlvbihhcnIsIGNvbmRpdGlvbikge1xuICAgIHZhciByZXN1bHQgPSBmYWxzZTtcbiAgICB0dWkudXRpbC5mb3JFYWNoQXJyYXkoYXJyLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIGlmIChjb25kaXRpb24oaXRlbSkpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBBbGwgb2YgdGhlbSBpcyB0cnVlIG9yIG5vdC5cbiAqIEBwYXJhbSB7YXJyYXl9IGFyciB0YXJnZXQgYXJyYXlcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNvbmRpdGlvbiBjb25kaXRpb24gZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtib29sZWFufSByZXN1bHQgYm9vbGVhblxuICovXG52YXIgYWxsID0gZnVuY3Rpb24oYXJyLCBjb25kaXRpb24pIHtcbiAgICB2YXIgcmVzdWx0ID0gdHJ1ZTtcbiAgICB0dWkudXRpbC5mb3JFYWNoQXJyYXkoYXJyLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIGlmICghY29uZGl0aW9uKGl0ZW0pKSB7XG4gICAgICAgICAgICByZXN1bHQgPSBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIEFycmF5IHBpdm90LlxuICogQG1lbWJlck9mIG1vZHVsZTpjYWxjdWxhdG9yXG4gKiBAcGFyYW0ge2FycmF5LjxhcnJheT59IGFycjJkIHRhcmdldCAyZCBhcnJheVxuICogQHJldHVybnMge2FycmF5LjxhcnJheT59IHBpdm90ZWQgMmQgYXJyYXlcbiAqL1xudmFyIHBpdm90ID0gZnVuY3Rpb24oYXJyMmQpIHtcbiAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgdHVpLnV0aWwuZm9yRWFjaEFycmF5KGFycjJkLCBmdW5jdGlvbihhcnIpIHtcbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaEFycmF5KGFyciwgZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgICBpZiAoIXJlc3VsdFtpbmRleF0pIHtcbiAgICAgICAgICAgICAgICByZXN1bHRbaW5kZXhdID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXN1bHRbaW5kZXhdLnB1c2godmFsdWUpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBHZXQgYWZ0ZXIgcG9pbnQgbGVuZ3RoLlxuICogQHBhcmFtIHtzdHJpbmcgfCBudW1iZXJ9IHZhbHVlIHRhcmdldCB2YWx1ZVxuICogQHJldHVybnMge251bWJlcn0gcmVzdWx0IGxlbmd0aFxuICovXG52YXIgbGVuZ3RoQWZ0ZXJQb2ludCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgdmFyIHZhbHVlQXJyID0gKHZhbHVlICsgJycpLnNwbGl0KCcuJyk7XG4gICAgcmV0dXJuIHZhbHVlQXJyLmxlbmd0aCA9PT0gMiA/IHZhbHVlQXJyWzFdLmxlbmd0aCA6IDA7XG59O1xuXG4vKipcbiAqIEZpbmQgbXVsdGlwbGUgbnVtLlxuICogQHBhcmFtIHsuLi5hcnJheX0gdGFyZ2V0IHZhbHVlc1xuICogQHJldHVybnMge251bWJlcn0gbXVsdGlwbGUgbnVtXG4gKi9cbnZhciBmaW5kTXVsdGlwbGVOdW0gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKSxcbiAgICAgICAgdW5kZXJQb2ludExlbnMgPSB0dWkudXRpbC5tYXAoYXJncywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiB0dWkudXRpbC5sZW5ndGhBZnRlclBvaW50KHZhbHVlKTtcbiAgICAgICAgfSksXG4gICAgICAgIHVuZGVyUG9pbnRMZW4gPSB0dWkudXRpbC5tYXgodW5kZXJQb2ludExlbnMpLFxuICAgICAgICBtdWx0aXBsZU51bSA9IE1hdGgucG93KDEwLCB1bmRlclBvaW50TGVuKTtcbiAgICByZXR1cm4gbXVsdGlwbGVOdW07XG59O1xuXG4vKipcbiAqIE1vZHVsbyBvcGVyYXRpb24gZm9yIGZsb2F0aW5nIHBvaW50IG9wZXJhdGlvbi5cbiAqIEBwYXJhbSB7bnVtYmVyfSB0YXJnZXQgdGFyZ2V0IHZhbHVlc1xuICogQHBhcmFtIHtudW1iZXJ9IG1vZE51bSBtb2QgbnVtXG4gKiBAcmV0dXJucyB7bnVtYmVyfSByZXN1bHQgbW9kXG4gKi9cbnZhciBtb2QgPSBmdW5jdGlvbih0YXJnZXQsIG1vZE51bSkge1xuICAgIHZhciBtdWx0aXBsZU51bSA9IHR1aS51dGlsLmZpbmRNdWx0aXBsZU51bShtb2ROdW0pO1xuICAgIHJldHVybiAoKHRhcmdldCAqIG11bHRpcGxlTnVtKSAlIChtb2ROdW0gKiBtdWx0aXBsZU51bSkpIC8gbXVsdGlwbGVOdW07XG59O1xuXG4vKipcbiAqIEFkZGl0aW9uIGZvciBmbG9hdGluZyBwb2ludCBvcGVyYXRpb24uXG4gKiBAcGFyYW0ge251bWJlcn0gYSB0YXJnZXQgYVxuICogQHBhcmFtIHtudW1iZXJ9IGIgdGFyZ2V0IGJcbiAqIEByZXR1cm5zIHtudW1iZXJ9IGFkZGl0aW9uIHJlc3VsdFxuICovXG52YXIgYWRkaXRpb24gPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgdmFyIG11bHRpcGxlTnVtID0gZmluZE11bHRpcGxlTnVtKGEsIGIpO1xuICAgIHJldHVybiAoKGEgKiBtdWx0aXBsZU51bSkgKyAoYiAqIG11bHRpcGxlTnVtKSkgLyBtdWx0aXBsZU51bTtcbn07XG5cbi8qKlxuICogU3VidHJhY3Rpb24gZm9yIGZsb2F0aW5nIHBvaW50IG9wZXJhdGlvbi5cbiAqIEBwYXJhbSB7bnVtYmVyfSBhIHRhcmdldCBhXG4gKiBAcGFyYW0ge251bWJlcn0gYiB0YXJnZXQgYlxuICogQHJldHVybnMge251bWJlcn0gc3VidHJhY3Rpb24gcmVzdWx0XG4gKi9cbnZhciBzdWJ0cmFjdGlvbiA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICB2YXIgbXVsdGlwbGVOdW0gPSBmaW5kTXVsdGlwbGVOdW0oYSwgYik7XG4gICAgcmV0dXJuICgoYSAqIG11bHRpcGxlTnVtKSAtIChiICogbXVsdGlwbGVOdW0pKSAvIG11bHRpcGxlTnVtO1xufTtcblxuLyoqXG4gKiBNdWx0aXBsaWNhdGlvbiBmb3IgZmxvYXRpbmcgcG9pbnQgb3BlcmF0aW9uLlxuICogQHBhcmFtIHtudW1iZXJ9IGEgdGFyZ2V0IGFcbiAqIEBwYXJhbSB7bnVtYmVyfSBiIHRhcmdldCBiXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBtdWx0aXBsaWNhdGlvbiByZXN1bHRcbiAqL1xudmFyIG11bHRpcGxpY2F0aW9uID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHZhciBtdWx0aXBsZU51bSA9IGZpbmRNdWx0aXBsZU51bShhLCBiKTtcbiAgICByZXR1cm4gKChhICogbXVsdGlwbGVOdW0pICogKGIgKiBtdWx0aXBsZU51bSkpIC8gKG11bHRpcGxlTnVtICogbXVsdGlwbGVOdW0pO1xufTtcblxuLyoqXG4gKiBEaXZpc2lvbiBmb3IgZmxvYXRpbmcgcG9pbnQgb3BlcmF0aW9uLlxuICogQHBhcmFtIHtudW1iZXJ9IGEgdGFyZ2V0IGFcbiAqIEBwYXJhbSB7bnVtYmVyfSBiIHRhcmdldCBiXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBkaXZpc2lvbiByZXN1bHRcbiAqL1xudmFyIGRpdmlzaW9uID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHZhciBtdWx0aXBsZU51bSA9IGZpbmRNdWx0aXBsZU51bShhLCBiKTtcbiAgICByZXR1cm4gKGEgKiBtdWx0aXBsZU51bSkgLyAoYiAqIG11bHRpcGxlTnVtKTtcbn07XG5cbi8qKlxuICogU3VtLlxuICogQHBhcmFtIHthcnJheS48bnVtYmVyPn0gdmFsdWVzIHRhcmdldCB2YWx1ZXNcbiAqIEByZXR1cm5zIHtudW1iZXJ9IHJlc3VsdCB2YWx1ZVxuICovXG52YXIgc3VtID0gZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgdmFyIGNvcHlBcnIgPSB2YWx1ZXMuc2xpY2UoKTtcbiAgICBjb3B5QXJyLnVuc2hpZnQoMCk7XG4gICAgcmV0dXJuIHR1aS51dGlsLnJlZHVjZShjb3B5QXJyLCBmdW5jdGlvbihiYXNlLCBhZGQpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoYmFzZSkgKyBwYXJzZUZsb2F0KGFkZCk7XG4gICAgfSk7XG59O1xuXG50dWkudXRpbC5taW4gPSBtaW47XG50dWkudXRpbC5tYXggPSBtYXg7XG50dWkudXRpbC5hbnkgPSBhbnk7XG50dWkudXRpbC5hbGwgPSBhbGw7XG50dWkudXRpbC5waXZvdCA9IHBpdm90O1xudHVpLnV0aWwubGVuZ3RoQWZ0ZXJQb2ludCA9IGxlbmd0aEFmdGVyUG9pbnQ7XG50dWkudXRpbC5tb2QgPSBtb2Q7XG50dWkudXRpbC5maW5kTXVsdGlwbGVOdW0gPSBmaW5kTXVsdGlwbGVOdW07XG50dWkudXRpbC5hZGRpdGlvbiA9IGFkZGl0aW9uO1xudHVpLnV0aWwuc3VidHJhY3Rpb24gPSBzdWJ0cmFjdGlvbjtcbnR1aS51dGlsLm11bHRpcGxpY2F0aW9uID0gbXVsdGlwbGljYXRpb247XG50dWkudXRpbC5kaXZpc2lvbiA9IGRpdmlzaW9uO1xudHVpLnV0aWwuc3VtID0gc3VtO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IGNoYXJ0IGNvbnN0XG4gKiBAcmVhZG9ubHlcbiAqIEBlbnVtIHtudW1iZXJ9XG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAvKiogY2hhcnQgaWQgcHJlZml4ICovXG4gICAgQ0hBUl9JRF9QUkVGSVg6ICd0dWktY2hhcnQnLFxuICAgIC8qKiB0b29sdGlwIGlkIHByZWZpeCovXG4gICAgVE9PTFRJUF9JRF9QUkVGSVg6ICd0dWktY2hhcnQtdG9vbHRpcCcsXG4gICAgLyoqIGNoYXJ0IHR5cGVzICovXG4gICAgQ0hBUlRfVFlQRV9CQVI6ICdiYXInLFxuICAgIENIQVJUX1RZUEVfQ09MVU1OOiAnY29sdW1uJyxcbiAgICBDSEFSVF9UWVBFX0xJTkU6ICdsaW5lJyxcbiAgICBDSEFSVF9UWVBFX0FSRUE6ICdhcmVhJyxcbiAgICBDSEFSVF9UWVBFX0NPTUJPOiAnY29tYm8nLFxuICAgIENIQVJUX1RZUEVfUElFOiAncGllJyxcbiAgICAvKiogY2hhcnQgcGFkZGluZyAqL1xuICAgIENIQVJUX1BBRERJTkc6IDEwLFxuICAgIC8qKiBjaGFydCBkZWZhdWx0IHdpZHRoICovXG4gICAgQ0hBUlRfREVGQVVMVF9XSURUSDogNTAwLFxuICAgIC8qKiBjaGFydCBkZWZhdWx0IGhkaWVoZ3QgKi9cbiAgICBDSEFSVF9ERUZBVUxUX0hFSUdIVDogNDAwLFxuICAgIC8qKiBoaWRkZW4gd2lkdGggKi9cbiAgICBISURERU5fV0lEVEg6IDEsXG4gICAgLyoqIHJlbmRlcmVkIHRleHQgcGFkZGluZyAqL1xuICAgIFRFWFRfUEFERElORzogMixcbiAgICAvKiogc2VyaWVzIGV4cGFuZCBzaXplICovXG4gICAgU0VSSUVTX0VYUEFORF9TSVpFOiAxMCxcbiAgICAvKiogc2VyaWVzIGxhYmVsIHBhZGRpbmcgKi9cbiAgICBTRVJJRVNfTEFCRUxfUEFERElORzogNSxcbiAgICAvKiogZGVmYXVsdCBmb250IHNpemUgb2YgdGl0bGUgKi9cbiAgICBERUZBVUxUX1RJVExFX0ZPTlRfU0laRTogMTQsXG4gICAgLyoqIGRlZmF1bHQgZm9udCBzaXplIG9mIGF4aXMgdGl0bGUgKi9cbiAgICBERUZBVUxUX0FYSVNfVElUTEVfRk9OVF9TSVpFOiAxMCxcbiAgICAvKiogZGVmYXVsdCBmb250IHNpemUgb2YgbGFiZWwgKi9cbiAgICBERUZBVUxUX0xBQkVMX0ZPTlRfU0laRTogMTIsXG4gICAgLyoqIGRlZmF1bHQgZm9udCBzaXplIG9mIHNlcmllcyBsYWJsZSAqL1xuICAgIERFRkFVTFRfU0VSSUVTX0xBQkVMX0ZPTlRfU0laRTogMTEsXG4gICAgLyoqIGRlZmF1bHQgZ3JhcGggcGx1Z2luICovXG4gICAgREVGQVVMVF9QTFVHSU46ICdyYXBoYWVsJyxcbiAgICAvKiogZGVmYXVsdCB0aWNrIGNvbG9yICovXG4gICAgREVGQVVMVF9USUNLX0NPTE9SOiAnYmxhY2snLFxuICAgIC8qKiBkZWZhdWx0IHRoZW1lIG5hbWUgKi9cbiAgICBERUZBVUxUX1RIRU1FX05BTUU6ICdkZWZhdWx0JyxcbiAgICAvKiogc3RhY2tlZCBvcHRpb24gdHlwZXMgKi9cbiAgICBTVEFDS0VEX05PUk1BTF9UWVBFOiAnbm9ybWFsJyxcbiAgICBTVEFDS0VEX1BFUkNFTlRfVFlQRTogJ3BlcmNlbnQnLFxuICAgIC8qKiBlbXB0eSBheGlzIGxhYmVsICovXG4gICAgRU1QVFlfQVhJU19MQUJFTDogJycsXG4gICAgLyoqIGFuZ2VsIDM2MCAqL1xuICAgIEFOR0xFXzg1OiA4NSxcbiAgICBBTkdMRV85MDogOTAsXG4gICAgQU5HTEVfMzYwOiAzNjAsXG4gICAgLyoqIHJhZGlhbiAqL1xuICAgIFJBRDogTWF0aC5QSSAvIDE4MCxcbiAgICAvKiogc2VyaWVzIGxlZ2VuZCB0eXBlcyAqL1xuICAgIFNFUklFU19MRUdFTkRfVFlQRV9PVVRFUjogJ291dGVyJyxcbiAgICAvKiogc2VyaWVzIG91dGVyIGxhYmVsIHBhZGRpbmcgKi9cbiAgICBTRVJJRVNfT1VURVJfTEFCRUxfUEFERElORzogMjAsXG4gICAgLyoqIGRlZmF1bHQgcmF0ZSBvZiBwaWUgZ3JhcGggKi9cbiAgICBQSUVfR1JBUEhfREVGQVVMVF9SQVRFOiAwLjgsXG4gICAgLyoqIHNtYWxsIHJhdGUgb2YgcGllIGdyYXBoICovXG4gICAgUElFX0dSQVBIX1NNQUxMX1JBVEU6IDAuNjUsXG4gICAgLyoqIHlBeGlzIHByb3BlcnRpZXMgKi9cbiAgICBZQVhJU19QUk9QUzogWyd0aWNrQ29sb3InLCAndGl0bGUnLCAnbGFiZWwnXSwgLy8geWF4aXMgdGhlbWXsnZgg7IaN7ISxIC0gY2hhcnQgdHlwZSBmaWx0ZXJpbmftlaAg65WMIOyCrOyaqeuQqFxuICAgIC8qKiBzZXJpZXMgcHJvcGVydGllcyAqL1xuICAgIFNFUklFU19QUk9QUzogWydsYWJlbCcsICdjb2xvcnMnLCAnYm9yZGVyQ29sb3InLCAnc2luZ2xlQ29sb3JzJ10sIC8vIHNlcmllcyB0aGVtZeydmCDsho3shLEgLSBjaGFydCB0eXBlIGZpbHRlcmluZ+2VoCDrlYwg7IKs7Jqp65CoXG4gICAgLyoqIHRpdGxlIGFyZWEgd2lkdGggcGFkZGluZyAqL1xuICAgIFRJVExFX0FSRUFfV0lEVEhfUEFERElORzogMjAsXG4gICAgLyoqIHRvcCBtYXJnaW4gb2YgeCBheGlzIGxhYmVsICovXG4gICAgWEFYSVNfTEFCRUxfVE9QX01BUkdJTjogMTAsXG4gICAgLyoqIHJpZ2h0IHBhZGRpbmcgb2YgdmVydGljYWwgbGFiZWwgKi9cbiAgICBWX0xBQkVMX1JJR0hUX1BBRERJTkc6IDEwLFxuICAgIC8qKiB0b29sdGlwIHByZWZpeCAqL1xuICAgIFRPT0xUSVBfUFJFRklYOiAndHVpLWNoYXJ0LXRvb2x0aXAnLFxuICAgIC8qKiBtaW5pbXVtIHBpeGVsIHR5cGUgc3RlcCBzaXplICovXG4gICAgTUlOX1BJWEVMX1RZUEVfU1RFUF9TSVpFOiA0MCxcbiAgICAvKiogbWF4aW11bSBwaXhlbCB0eXBlIHN0ZXAgc2l6ZSAqL1xuICAgIE1BWF9QSVhFTF9UWVBFX1NURVBfU0laRTogNjAsXG4gICAgLyogdGljayBpbmZvIG9mIHBlcmNlbnQgc3RhY2tlZCBvcHRpb24gKi9cbiAgICBQRVJDRU5UX1NUQUNLRURfVElDS19JTkZPOiB7XG4gICAgICAgIHNjYWxlOiB7XG4gICAgICAgICAgICBtaW46IDAsXG4gICAgICAgICAgICBtYXg6IDEwMFxuICAgICAgICB9LFxuICAgICAgICBzdGVwOiAyNSxcbiAgICAgICAgdGlja0NvdW50OiA1LFxuICAgICAgICBsYWJlbHM6IFswLCAyNSwgNTAsIDc1LCAxMDBdXG4gICAgfSxcbiAgICAvKiogdGl0bGUgYWRkIHBhZGRpbmcgKi9cbiAgICBUSVRMRV9QQURESU5HOiAyMCxcbiAgICAvKiogbGVnZW5kIGFyZWEgcGFkZGluZyAqL1xuICAgIExFR0VORF9BUkVBX1BBRERJTkc6IDEwLFxuICAgIC8qKiBsZWdlbmQgcmVjdCB3aWR0aCAqL1xuICAgIExFR0VORF9SRUNUX1dJRFRIOiAxMixcbiAgICAvKiogbGdlbmQgbGFiZWwgbGVmdCBwYWRkaW5nICovXG4gICAgTEVHRU5EX0xBQkVMX0xFRlRfUEFERElORzogNSxcbiAgICAvKiogQVhJUyBMQUJFTCBQQURESU5HICovXG4gICAgQVhJU19MQUJFTF9QQURESU5HOiA3LFxuICAgIC8qKiByb3RhdGlvbnMgZGVncmVlIGNhbmRpZGF0ZXMgKi9cbiAgICBERUdSRUVfQ0FORElEQVRFUzogWzI1LCA0NSwgNjUsIDg1XSxcbiAgICAvKiogeEF4aXMgbGFiZWwgY29tcGFyZSBtYXJnaW4gKi9cbiAgICBYQVhJU19MQUJFTF9DT01QQVJFX01BUkdJTjogMjAsXG4gICAgLyoqIHhBeGlzIGxhYmVsIGd1dHRlciAqL1xuICAgIFhBWElTX0xBQkVMX0dVVFRFUjogMixcbiAgICAvKiogc3RhbmQgbXVsdGlwbGUgbnVtcyBvZiBheGlzICovXG4gICAgQVhJU19TVEFOREFSRF9NVUxUSVBMRV9OVU1TOiBbMSwgMiwgNSwgMTBdLFxuICAgIC8qKiBsYWJlbCBwYWRkaW5nIHRvcCAqL1xuICAgIExBQkVMX1BBRERJTkdfVE9QOiAyLFxuICAgIC8qKiBsaW5lIG1hcmdpbiB0b3AgKi9cbiAgICBMSU5FX01BUkdJTl9UT1A6IDUsXG4gICAgLyoqIHRvb2x0aXAgZ2FwICovXG4gICAgVE9PTFRJUF9HQVA6IDUsXG4gICAgLyoqIHRvb2x0aXAgZGlyZWN0aW9uICovXG4gICAgVE9PTFRJUF9ESVJFQ1RJT05fRk9SV09SRDogJ2ZvcndvcmQnLFxuICAgIFRPT0xUSVBfRElSRUNUSU9OX0JBQ0tXT1JEOiAnYmFja3dvcmQnLFxuICAgIC8qKiB0b29sdGlwIGRlZmF1bHQgcG9zaXRpb24gb3B0aW9uICovXG4gICAgVE9PTFRJUF9ERUZBVUxUX1BPU0lUSU9OX09QVElPTjogJ2NlbnRlciB0b3AnLFxuICAgIFRPT0xUSVBfREVGQVVMVF9IT1JJWk9OVEFMX1BPU0lUSU9OX09QVElPTjogJ3JpZ2h0IG1pZGRsZScsXG4gICAgLyoqIGhpZGUgZGVsYXkgKi9cbiAgICBISURFX0RFTEFZOiAyMDBcbn07XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgRXZlbnRIYW5kbGVMYXllckJhc2UgaXMgYmFzZSBjbGFzcyBmb3IgZXZlbnQgaGFuZGxlIGxheWVycy5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGV2ZW50ID0gcmVxdWlyZSgnLi4vaGVscGVycy9ldmVudExpc3RlbmVyJyksXG4gICAgZG9tID0gcmVxdWlyZSgnLi4vaGVscGVycy9kb21IYW5kbGVyJyksXG4gICAgcmVuZGVyVXRpbCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvcmVuZGVyVXRpbCcpO1xuXG52YXIgRXZlbnRIYW5kbGVMYXllckJhc2UgPSB0dWkudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIEV2ZW50SGFuZGxlTGF5ZXJCYXNlLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogRXZlbnRIYW5kbGVMYXllckJhc2UgaXMgYmFzZSBjbGFzcyBmb3IgZXZlbnQgaGFuZGxlIGxheWVycy5cbiAgICAgKiBAY29uc3RydWN0cyBFdmVudEhhbmRsZUxheWVyQmFzZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHt7XG4gICAgICogICAgICAgICAgZGltZW5zaW9uOiB7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9LFxuICAgICAqICAgICAgICAgIHBvc2l0aW9uOiB7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn1cbiAgICAgKiAgICAgIH19IHBhcmFtcy5ib3VuZCBib3VuZFxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5jaGFydFR5cGUgY2hhcnQgdHlwZVxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaXNWZXJ0aWNhbCB3aGV0aGVyIHZlcnRpY2FsIG9yIG5vdFxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB0aGlzLmJvdW5kID0gcGFyYW1zLmJvdW5kO1xuICAgICAgICB0aGlzLmNoYXJ0VHlwZSA9IHBhcmFtcy5jaGFydFR5cGU7XG4gICAgICAgIHRoaXMuaXNWZXJ0aWNhbCA9IHBhcmFtcy5pc1ZlcnRpY2FsO1xuICAgICAgICB0aGlzLmNvb3JkaW5hdGVEYXRhID0gdGhpcy5tYWtlQ29vcmRpbmF0ZURhdGEocGFyYW1zLmJvdW5kLmRpbWVuc2lvbiwgcGFyYW1zLnRpY2tDb3VudCwgcGFyYW1zLmNoYXJ0VHlwZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgY29vcmRpbmF0ZSBkYXRhLlxuICAgICAqL1xuICAgIG1ha2VDb29yZGluYXRlRGF0YTogZnVuY3Rpb24oKSB7fSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlci5cbiAgICAgKiBAcmV0dXJuIHtIVE1MRWxlbWVudH0gY29vcmRpbmF0ZSBhcmVhXG4gICAgICovXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGVsQ29vcmRpbmF0ZUFyZWEgPSBkb20uY3JlYXRlKCdESVYnLCAndHVpLWNoYXJ0LXNlcmllcy1jb29yZGluYXRlLWFyZWEnKTtcbiAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJEaW1lbnNpb24oZWxDb29yZGluYXRlQXJlYSwgdGhpcy5ib3VuZC5kaW1lbnNpb24pO1xuICAgICAgICByZW5kZXJVdGlsLnJlbmRlclBvc2l0aW9uKGVsQ29vcmRpbmF0ZUFyZWEsIHRoaXMuYm91bmQucG9zaXRpb24pO1xuICAgICAgICB0aGlzLmF0dGFjaEV2ZW50KGVsQ29vcmRpbmF0ZUFyZWEpO1xuICAgICAgICByZXR1cm4gZWxDb29yZGluYXRlQXJlYTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmluZCBncm91cCBpbmRleC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gcG9pbnRWYWx1ZSBtb3VzZSBwb3NpdGlvbiBwb2ludCB2YWx1ZVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IGdyb3VwIGluZGV4XG4gICAgICovXG4gICAgZmluZEluZGV4OiBmdW5jdGlvbihwb2ludFZhbHVlKSB7XG4gICAgICAgIHZhciBmb3VuZEluZGV4ID0gLTE7XG4gICAgICAgIHR1aS51dGlsLmZvckVhY2hBcnJheSh0aGlzLmNvb3JkaW5hdGVEYXRhLCBmdW5jdGlvbihzY2FsZSwgaW5kZXgpIHtcbiAgICAgICAgICAgIGlmIChzY2FsZS5taW4gPCBwb2ludFZhbHVlICYmIHNjYWxlLm1heCA+PSBwb2ludFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgZm91bmRJbmRleCA9IGluZGV4O1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGZvdW5kSW5kZXg7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgY29vcmRpbmF0ZSBkYXRhIGFib3VudCBsaW5lIHR5cGUgY2hhcnQuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoIHdpZHRoXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHRpY2tDb3VudCB0aWNrIGNvdW50XG4gICAgICogQHJldHVybnMge2FycmF5fSBjb29yZGluYXRlIGRhdGFcbiAgICAgKi9cbiAgICBtYWtlTGluZVR5cGVDb29yZGluYXRlRGF0YTogZnVuY3Rpb24od2lkdGgsIHRpY2tDb3VudCkge1xuICAgICAgICB2YXIgdGlja0ludGVydmFsID0gd2lkdGggLyAodGlja0NvdW50IC0gMSksXG4gICAgICAgICAgICBoYWxmSW50ZXJ2YWwgPSB0aWNrSW50ZXJ2YWwgLyAyO1xuICAgICAgICByZXR1cm4gdHVpLnV0aWwubWFwKHR1aS51dGlsLnJhbmdlKDAsIHRpY2tDb3VudCksIGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG1pbjogaW5kZXggKiB0aWNrSW50ZXJ2YWwgLSBoYWxmSW50ZXJ2YWwsXG4gICAgICAgICAgICAgICAgbWF4OiBpbmRleCAqIHRpY2tJbnRlcnZhbCArIGhhbGZJbnRlcnZhbFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE9uIG1vdXNlIG1vdmVcbiAgICAgKiBAYWJzdHJhY3RcbiAgICAgKi9cbiAgICBvbk1vdXNlbW92ZTogZnVuY3Rpb24oKSB7fSxcblxuICAgIC8qKlxuICAgICAqIE9uIG1vdXNlIG91dFxuICAgICAqIEBhYnN0cmFjdFxuICAgICAqL1xuICAgIG9uTW91c2VvdXQ6IGZ1bmN0aW9uKCkge30sXG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggZXZlbnRcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqL1xuICAgIGF0dGFjaEV2ZW50OiBmdW5jdGlvbihlbCkge1xuICAgICAgICBldmVudC5iaW5kRXZlbnQoJ21vdXNlbW92ZScsIGVsLCB0dWkudXRpbC5iaW5kKHRoaXMub25Nb3VzZW1vdmUsIHRoaXMpKTtcbiAgICAgICAgZXZlbnQuYmluZEV2ZW50KCdtb3VzZW91dCcsIGVsLCB0dWkudXRpbC5iaW5kKHRoaXMub25Nb3VzZW91dCwgdGhpcykpO1xuICAgIH1cbn0pO1xuXG50dWkudXRpbC5DdXN0b21FdmVudHMubWl4aW4oRXZlbnRIYW5kbGVMYXllckJhc2UpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50SGFuZGxlTGF5ZXJCYXNlO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEdyb3VwZWRFdmVudEhhbmRsZUxheWVyIGlzIGV2ZW50IGhhbmRsZSBsYXllciBmb3IgZ3JvdXBlZCB0b29saXAgb3B0aW9uLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgRXZlbnRIYW5kbGVMYXllckJhc2UgPSByZXF1aXJlKCcuL2V2ZW50SGFuZGxlTGF5ZXJCYXNlJyksXG4gICAgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4uL2NvbnN0JyksXG4gICAgc3RhdGUgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3N0YXRlJyk7XG5cbnZhciBHcm91cGVkRXZlbnRIYW5kbGVMYXllciA9IHR1aS51dGlsLmRlZmluZUNsYXNzKEV2ZW50SGFuZGxlTGF5ZXJCYXNlLCAvKiogQGxlbmRzIEdyb3VwZWRFdmVudEhhbmRsZUxheWVyLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogR3JvdXBlZEV2ZW50SGFuZGxlTGF5ZXIgaXMgZXZlbnQgaGFuZGxlIGxheWVyIGZvciBncm91cGVkIHRvb2xpcCBvcHRpb24uXG4gICAgICogQGNvbnN0cnVjdHMgRXZlbnRIYW5kbGVMYXllckJhc2VcbiAgICAgKiBAZXh0ZW5kcyBFdmVudEhhbmRsZUxheWVyQmFzZVxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBFdmVudEhhbmRsZUxheWVyQmFzZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGNvb3JkaW5hdGUgZGF0YSBhYm91dCBub24gbGluZSB0eXBlIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzaXplIHdpZHRoIG9yIGhlaWdodFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB0aWNrQ291bnQgdGljayBjb3VudFxuICAgICAqIEByZXR1cm5zIHthcnJheX0gY29vcmRpbmF0ZSBkYXRhXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZU5vcm1hbENvb3JkaW5hdGVEYXRhOiBmdW5jdGlvbihzaXplLCB0aWNrQ291bnQpIHtcbiAgICAgICAgdmFyIGxlbiA9IHRpY2tDb3VudCAtIDEsXG4gICAgICAgICAgICB0aWNrSW50ZXJ2YWwgPSBzaXplIC8gbGVuLFxuICAgICAgICAgICAgcHJldiA9IDA7XG4gICAgICAgIHJldHVybiB0dWkudXRpbC5tYXAodHVpLnV0aWwucmFuZ2UoMCwgbGVuKSwgZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBtYXggPSB0dWkudXRpbC5taW4oW3NpemUsIChpbmRleCArIDEpICogdGlja0ludGVydmFsXSksXG4gICAgICAgICAgICAgICAgc2NhbGUgPSB7XG4gICAgICAgICAgICAgICAgICAgIG1pbjogcHJldixcbiAgICAgICAgICAgICAgICAgICAgbWF4OiBtYXhcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgcHJldiA9IG1heDtcbiAgICAgICAgICAgIHJldHVybiBzY2FsZTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgY29vcmRpbmF0ZSBkYXRhLlxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gZGltZW5zaW9uIGRpbWVuc2lvblxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB0aWNrQ291bnQgdGljayBjb3VudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjaGFydFR5cGUgY2hhcnQgdHlwZVxuICAgICAqIEByZXR1cm5zIHthcnJheS48e21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn0+fSB0aWNrIGdyb3Vwc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgbWFrZUNvb3JkaW5hdGVEYXRhOiBmdW5jdGlvbihkaW1lbnNpb24sIHRpY2tDb3VudCwgY2hhcnRUeXBlKSB7XG4gICAgICAgIHZhciBzaXplVHlwZSA9IHRoaXMuaXNWZXJ0aWNhbCA/ICd3aWR0aCcgOiAnaGVpZ2h0JyxcbiAgICAgICAgICAgIGNvb3JkaW5hdGVEYXRhO1xuICAgICAgICBpZiAoc3RhdGUuaXNMaW5lVHlwZUNoYXJ0KGNoYXJ0VHlwZSkpIHtcbiAgICAgICAgICAgIGNvb3JkaW5hdGVEYXRhID0gdGhpcy5tYWtlTGluZVR5cGVDb29yZGluYXRlRGF0YShkaW1lbnNpb25bc2l6ZVR5cGVdLCB0aWNrQ291bnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29vcmRpbmF0ZURhdGEgPSB0aGlzLl9tYWtlTm9ybWFsQ29vcmRpbmF0ZURhdGEoZGltZW5zaW9uW3NpemVUeXBlXSwgdGlja0NvdW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjb29yZGluYXRlRGF0YTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSByYW5nZSBvZiB0b29sdGlwIHBvc2l0aW9uLlxuICAgICAqIEBwYXJhbSB7e21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19IHNjYWxlIHNjYWxlXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNoYXJ0VHlwZSBjaGFydCB0eXBlXG4gICAgICogQHJldHVybnMge3tzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcn19IHJhbmdlIHR5cGUgdmFsdWVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlUmFuZ2U6IGZ1bmN0aW9uKHNjYWxlLCBjaGFydFR5cGUpIHtcbiAgICAgICAgdmFyIHJhbmdlLCBjZW50ZXI7XG4gICAgICAgIGlmIChzdGF0ZS5pc0xpbmVUeXBlQ2hhcnQoY2hhcnRUeXBlKSkge1xuICAgICAgICAgICAgY2VudGVyID0gc2NhbGUubWF4IC0gKHNjYWxlLm1heCAtIHNjYWxlLm1pbikgLyAyO1xuICAgICAgICAgICAgcmFuZ2UgPSB7XG4gICAgICAgICAgICAgICAgc3RhcnQ6IGNlbnRlcixcbiAgICAgICAgICAgICAgICBlbmQ6IGNlbnRlclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJhbmdlID0ge1xuICAgICAgICAgICAgICAgIHN0YXJ0OiBzY2FsZS5taW4sXG4gICAgICAgICAgICAgICAgZW5kOiBzY2FsZS5tYXhcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmFuZ2U7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBsYXllciBwb3NpdGlvbi5cbiAgICAgKiBAcGFyYW0ge01vdXNlRXZlbnR9IGUgbW91c2UgZXZlbnQgb2JqZWN0XG4gICAgICogQHBhcmFtIHt7dG9wOiBudW1iZXIsIHJpZ2h0OiBudW1iZXIsIGJvdHRvbTogbnVtYmVyLCBsZWZ0OiBudW1iZXJ9fSBib3VuZCBib3VuZFxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNWZXJ0aWNhbCB3aGV0aGVyIHZlcnRpY2FsIG9yIG5vdFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IGxheWVyIHBvc2l0aW9uIChsZWZ0IG9yIHRvcClcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRMYXllclBvc2l0aW9uVmFsdWU6IGZ1bmN0aW9uKGUsIGJvdW5kLCBpc1ZlcnRpY2FsKSB7XG4gICAgICAgIHZhciBsYXllclBvc2l0aW9uO1xuICAgICAgICBpZiAoaXNWZXJ0aWNhbCkge1xuICAgICAgICAgICAgbGF5ZXJQb3NpdGlvbiA9IGUuY2xpZW50WCAtIGJvdW5kLmxlZnQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsYXllclBvc2l0aW9uID0gZS5jbGllbnRZIC0gYm91bmQudG9wO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsYXllclBvc2l0aW9uO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdG9vbHRpcCBkaXJlY3Rpb24uXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IGluZGV4XG4gICAgICogQHJldHVybnMge3N0cmluZ30gZGlyZWN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0VG9vbHRpcERpcmVjdGlvbjogZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgdmFyIHN0YW5kYXJkTnVtYmVyID0gTWF0aC5jZWlsKHRoaXMuY29vcmRpbmF0ZURhdGEubGVuZ3RoIC8gMiksXG4gICAgICAgICAgICBudW1iZXIgPSBpbmRleCArIDE7XG4gICAgICAgIC8vIOykkeyVmeydhCDquLDspIDsnLzroZwg7KSR7JWZ7J2EIO2PrO2VqO2VmOyXrCDslZ7rtoDrtoTsl5Ag7JyE7LmY7ZWY64qUIGRhdGHripQgZm9yd29yZOulvCDrsJjtmZjtlZjqs6AsIOuSt+u2gOu2hOyXkCDsnITsuZjtlZjripQgZGF0YeuKlCBiYWNrd29yZOulvCDrsJjtmZjtlZzri6QuXG4gICAgICAgIHJldHVybiBzdGFuZGFyZE51bWJlciA+PSBudW1iZXIgPyBjaGFydENvbnN0LlRPT0xUSVBfRElSRUNUSU9OX0ZPUldPUkQgOiBjaGFydENvbnN0LlRPT0xUSVBfRElSRUNUSU9OX0JBQ0tXT1JEO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBPbiBtb3VzZW1vdmUuXG4gICAgICogQHBhcmFtIHtNb3VzZUV2ZW50fSBlIG1vdXNlIGV2ZW50IG9iamVjdFxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIG9uTW91c2Vtb3ZlOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciBlbFRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudCxcbiAgICAgICAgICAgIGJvdW5kID0gZWxUYXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICAgICAgICBsYXllclBvc2l0aW9uVmFsdWUgPSB0aGlzLl9nZXRMYXllclBvc2l0aW9uVmFsdWUoZSwgYm91bmQsIHRoaXMuaXNWZXJ0aWNhbCksXG4gICAgICAgICAgICBpbmRleCA9IHRoaXMuZmluZEluZGV4KGxheWVyUG9zaXRpb25WYWx1ZSksXG4gICAgICAgICAgICBwcmV2SW5kZXggPSB0aGlzLnByZXZJbmRleCxcbiAgICAgICAgICAgIHNpemVUeXBlID0gdGhpcy5pc1ZlcnRpY2FsID8gJ2hlaWdodCcgOiAnd2lkdGgnLFxuICAgICAgICAgICAgZGlyZWN0aW9uO1xuXG4gICAgICAgIGlmIChpbmRleCA9PT0gLTEgfHwgcHJldkluZGV4ID09PSBpbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5wcmV2SW5kZXggPSBpbmRleDtcblxuICAgICAgICBkaXJlY3Rpb24gPSB0aGlzLl9nZXRUb29sdGlwRGlyZWN0aW9uKGluZGV4KTtcblxuICAgICAgICB0aGlzLmZpcmUoJ3Nob3dHcm91cFRvb2x0aXAnLCB7XG4gICAgICAgICAgICBpbmRleDogaW5kZXgsXG4gICAgICAgICAgICByYW5nZTogdGhpcy5fbWFrZVJhbmdlKHRoaXMuY29vcmRpbmF0ZURhdGFbaW5kZXhdLCB0aGlzLmNoYXJ0VHlwZSksXG4gICAgICAgICAgICBzaXplOiB0aGlzLmJvdW5kLmRpbWVuc2lvbltzaXplVHlwZV0sXG4gICAgICAgICAgICBkaXJlY3Rpb246IGRpcmVjdGlvbixcbiAgICAgICAgICAgIGlzVmVydGljYWw6IHRoaXMuaXNWZXJ0aWNhbFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogT24gbW91c2VvdXQuXG4gICAgICogQHBhcmFtIHtNb3VzZUV2ZW50fSBlIG1vdXNlIGV2ZW50IG9iamVjdFxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIG9uTW91c2VvdXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmZpcmUoJ2hpZGVHcm91cFRvb2x0aXAnLCB0aGlzLnByZXZJbmRleCk7XG4gICAgICAgIGRlbGV0ZSB0aGlzLnByZXZJbmRleDtcbiAgICB9XG59KTtcblxudHVpLnV0aWwuQ3VzdG9tRXZlbnRzLm1peGluKEdyb3VwZWRFdmVudEhhbmRsZUxheWVyKTtcblxubW9kdWxlLmV4cG9ydHMgPSBHcm91cGVkRXZlbnRIYW5kbGVMYXllcjtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBMaW5lVHlwZUV2ZW50SGFuZGxlTGF5ZXIgaXMgZXZlbnQgaGFuZGxlIGxheWVyIGZvciBsaW5lIHR5cGUgY2hhcnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBFdmVudEhhbmRsZUxheWVyQmFzZSA9IHJlcXVpcmUoJy4vZXZlbnRIYW5kbGVMYXllckJhc2UnKTtcblxudmFyIExpbmVUeXBlRXZlbnRIYW5kbGVMYXllciA9IHR1aS51dGlsLmRlZmluZUNsYXNzKEV2ZW50SGFuZGxlTGF5ZXJCYXNlLCAvKiogQGxlbmRzIExpbmVUeXBlRXZlbnRIYW5kbGVMYXllci5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIExpbmVUeXBlRXZlbnRIYW5kbGVMYXllciBpcyBldmVudCBoYW5kbGUgbGF5ZXIgZm9yIGxpbmUgdHlwZSBjaGFydC5cbiAgICAgKiBAY29uc3RydWN0cyBMaW5lVHlwZUV2ZW50SGFuZGxlTGF5ZXJcbiAgICAgKiBAZXh0ZW5kcyBMaW5lVHlwZUV2ZW50SGFuZGxlTGF5ZXJcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgRXZlbnRIYW5kbGVMYXllckJhc2UuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBjb29yZGluYXRlIGRhdGEuXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBkaW1lbnNpb24gZGltZW5zaW9uXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHRpY2tDb3VudCB0aWNrIGNvdW50XG4gICAgICogQHJldHVybnMge2FycmF5Ljx7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfT59IHRpY2sgZ3JvdXBzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBtYWtlQ29vcmRpbmF0ZURhdGE6IGZ1bmN0aW9uKGRpbWVuc2lvbiwgdGlja0NvdW50KSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1ha2VMaW5lVHlwZUNvb3JkaW5hdGVEYXRhKGRpbWVuc2lvbi53aWR0aCwgdGlja0NvdW50KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogT24gbW91c2Vtb3ZlLlxuICAgICAqIEBwYXJhbSB7TW91c2VFdmVudH0gZSBtb3VzZSBldmVudCBvYmplY3RcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICBvbk1vdXNlbW92ZTogZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgZWxUYXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQsXG4gICAgICAgICAgICBib3VuZCA9IGVsVGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgICAgICAgbGF5ZXJYID0gZS5jbGllbnRYIC0gYm91bmQubGVmdCxcbiAgICAgICAgICAgIGxheWVyWSA9IGUuY2xpZW50WSAtIGJvdW5kLnRvcCxcbiAgICAgICAgICAgIGluZGV4ID0gdGhpcy5maW5kSW5kZXgobGF5ZXJYKTtcbiAgICAgICAgdGhpcy5maXJlKCdvdmVyVGlja1NlY3RvcicsIGluZGV4LCBsYXllclkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBPbiBtb3VzZW91dC5cbiAgICAgKiBAcGFyYW0ge01vdXNlRXZlbnR9IGUgbW91c2UgZXZlbnQgb2JqZWN0XG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgb25Nb3VzZW91dDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZmlyZSgnb3V0VGlja1NlY3RvcicpO1xuICAgIH1cbn0pO1xuXG50dWkudXRpbC5DdXN0b21FdmVudHMubWl4aW4oTGluZVR5cGVFdmVudEhhbmRsZUxheWVyKTtcblxubW9kdWxlLmV4cG9ydHMgPSBMaW5lVHlwZUV2ZW50SGFuZGxlTGF5ZXI7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgIENoYXJ0IGZhY3RvcnkgcGxheSByb2xlIHJlZ2lzdGVyIGNoYXJ0LlxuICogICAgICAgICAgICAgICAgQWxzbywgeW91IGNhbiBnZXQgY2hhcnQgZnJvbSB0aGlzIGZhY3RvcnkuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBjaGFydHMgPSB7fSxcbiAgICBmYWN0b3J5ID0ge1xuICAgICAgICAvKipcbiAgICAgICAgICogR2V0IGNoYXJ0IGluc3RhbmNlLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY2hhcnRUeXBlIGNoYXJ0IHR5cGVcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGRhdGEgY2hhcnQgZGF0YVxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgY2hhcnQgb3B0aW9uc1xuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICAgICAqIEByZXR1cm5zIHtvYmplY3R9IGNoYXJ0IGluc3RhbmNlO1xuICAgICAgICAgKi9cbiAgICAgICAgZ2V0OiBmdW5jdGlvbihjaGFydFR5cGUsIGRhdGEsIHRoZW1lLCBvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgQ2hhcnQgPSBjaGFydHNbY2hhcnRUeXBlXSxcbiAgICAgICAgICAgICAgICBjaGFydDtcblxuICAgICAgICAgICAgaWYgKCFDaGFydCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGV4aXN0ICcgKyBjaGFydFR5cGUgKyAnIGNoYXJ0LicpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjaGFydCA9IG5ldyBDaGFydChkYXRhLCB0aGVtZSwgb3B0aW9ucyk7XG5cbiAgICAgICAgICAgIHJldHVybiBjaGFydDtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVnaXN0ZXIgY2hhcnQuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjaGFydFR5cGUgY2hhciB0eXBlXG4gICAgICAgICAqIEBwYXJhbSB7Y2xhc3N9IENoYXJ0Q2xhc3MgY2hhcnQgY2xhc3NcbiAgICAgICAgICovXG4gICAgICAgIHJlZ2lzdGVyOiBmdW5jdGlvbihjaGFydFR5cGUsIENoYXJ0Q2xhc3MpIHtcbiAgICAgICAgICAgIGNoYXJ0c1tjaGFydFR5cGVdID0gQ2hhcnRDbGFzcztcbiAgICAgICAgfVxuICAgIH07XG5cbm1vZHVsZS5leHBvcnRzID0gZmFjdG9yeTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyAgUGx1Z2luIGZhY3RvcnkgcGxheSByb2xlIHJlZ2lzdGVyIHJlbmRlcmluZyBwbHVnaW4uXG4gKiAgICAgICAgICAgICAgICBBbHNvLCB5b3UgY2FuIGdldCBwbHVnaW4gZnJvbSB0aGlzIGZhY3RvcnkuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBwbHVnaW5zID0ge30sXG4gICAgZmFjdG9yeSA9IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdldCBncmFwaCByZW5kZXJlci5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGxpYlR5cGUgdHlwZSBvZiBncmFwaCBsaWJyYXJ5XG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjaGFydFR5cGUgY2hhcnQgdHlwZVxuICAgICAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSByZW5kZXJlciBpbnN0YW5jZVxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0OiBmdW5jdGlvbihsaWJUeXBlLCBjaGFydFR5cGUpIHtcbiAgICAgICAgICAgIHZhciBwbHVnaW4gPSBwbHVnaW5zW2xpYlR5cGVdLFxuICAgICAgICAgICAgICAgIFJlbmRlcmVyLCByZW5kZXJlcjtcblxuICAgICAgICAgICAgaWYgKCFwbHVnaW4pIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBleGlzdCAnICsgbGliVHlwZSArICcgcGx1Z2luLicpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBSZW5kZXJlciA9IHBsdWdpbltjaGFydFR5cGVdO1xuICAgICAgICAgICAgaWYgKCFSZW5kZXJlcikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGV4aXN0ICcgKyBjaGFydFR5cGUgKyAnIGNoYXJ0IHJlbmRlcmVyLicpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZW5kZXJlciA9IG5ldyBSZW5kZXJlcigpO1xuXG4gICAgICAgICAgICByZXR1cm4gcmVuZGVyZXI7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQbHVnaW4gcmVnaXN0ZXIuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBsaWJUeXBlIHR5cGUgb2YgZ3JhcGggbGlicmFyeVxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcGx1Z2luIHBsdWdpbiB0byBjb250cm9sIGxpYnJhcnlcbiAgICAgICAgICovXG4gICAgICAgIHJlZ2lzdGVyOiBmdW5jdGlvbihsaWJUeXBlLCBwbHVnaW4pIHtcbiAgICAgICAgICAgIHBsdWdpbnNbbGliVHlwZV0gPSBwbHVnaW47XG4gICAgICAgIH1cbiAgICB9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnk7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgIFRoZW1lIGZhY3RvcnkgcGxheSByb2xlIHJlZ2lzdGVyIHRoZW1lLlxuICogICAgICAgICAgICAgICAgQWxzbywgeW91IGNhbiBnZXQgdGhlbWUgZnJvbSB0aGlzIGZhY3RvcnkuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBjaGFydENvbnN0ID0gcmVxdWlyZSgnLi4vY29uc3QnKSxcbiAgICBkZWZhdWx0VGhlbWUgPSByZXF1aXJlKCcuLi90aGVtZXMvZGVmYXVsdFRoZW1lJyk7XG5cbnZhciB0aGVtZXMgPSB7fTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgLyoqXG4gICAgICogR2V0IHRoZW1lLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0aGVtZU5hbWUgdGhlbWUgbmFtZVxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHRoZW1lIG9iamVjdFxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24odGhlbWVOYW1lKSB7XG4gICAgICAgIHZhciB0aGVtZSA9IHRoZW1lc1t0aGVtZU5hbWVdO1xuXG4gICAgICAgIGlmICghdGhlbWUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGV4aXN0ICcgKyB0aGVtZU5hbWUgKyAnIHRoZW1lLicpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoZW1lO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUaGVtZSByZWdpc3Rlci5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGhlbWVOYW1lIHRoZW1lIG5hbWVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgdGhlbWVcbiAgICAgKi9cbiAgICByZWdpc3RlcjogZnVuY3Rpb24odGhlbWVOYW1lLCB0aGVtZSkge1xuICAgICAgICB2YXIgdGFyZ2V0SXRlbXM7XG4gICAgICAgIHRoZW1lID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGVtZSkpO1xuXG4gICAgICAgIGlmICh0aGVtZU5hbWUgIT09IGNoYXJ0Q29uc3QuREVGQVVMVF9USEVNRV9OQU1FKSB7XG4gICAgICAgICAgICB0aGVtZSA9IHRoaXMuX2luaXRUaGVtZSh0aGVtZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0YXJnZXRJdGVtcyA9IHRoaXMuX2dldEluaGVyaXRUYXJnZXRUaGVtZUl0ZW1zKHRoZW1lKTtcblxuICAgICAgICB0aGlzLl9pbmhlcml0VGhlbWVGb250KHRoZW1lLCB0YXJnZXRJdGVtcyk7XG4gICAgICAgIHRoaXMuX2NvcHlDb2xvckluZm8odGhlbWUpO1xuICAgICAgICB0aGVtZXNbdGhlbWVOYW1lXSA9IHRoZW1lO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbml0IHRoZW1lLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSB0aGVtZVxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHRoZW1lXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAaWdub3JlXG4gICAgICovXG4gICAgX2luaXRUaGVtZTogZnVuY3Rpb24odGhlbWUpIHtcbiAgICAgICAgdmFyIGNsb25lVGhlbWUgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGRlZmF1bHRUaGVtZSkpLFxuICAgICAgICAgICAgbmV3VGhlbWU7XG5cbiAgICAgICAgdGhpcy5fY29uY2F0RGVmYXVsdENvbG9ycyh0aGVtZSwgY2xvbmVUaGVtZS5zZXJpZXMuY29sb3JzKVxuICAgICAgICBuZXdUaGVtZSA9IHRoaXMuX292ZXJ3cml0ZVRoZW1lKHRoZW1lLCBjbG9uZVRoZW1lKTtcblxuICAgICAgICBuZXdUaGVtZSA9IHRoaXMuX2NvcHlQcm9wZXJ0eSh7XG4gICAgICAgICAgICBwcm9wTmFtZTogJ3lBeGlzJyxcbiAgICAgICAgICAgIGZyb21UaGVtZTogdGhlbWUsXG4gICAgICAgICAgICB0b1RoZW1lOiBuZXdUaGVtZSxcbiAgICAgICAgICAgIHJlamVjdGlvblByb3BzOiBjaGFydENvbnN0LllBWElTX1BST1BTXG4gICAgICAgIH0pO1xuXG4gICAgICAgIG5ld1RoZW1lID0gdGhpcy5fY29weVByb3BlcnR5KHtcbiAgICAgICAgICAgIHByb3BOYW1lOiAnc2VyaWVzJyxcbiAgICAgICAgICAgIGZyb21UaGVtZTogdGhlbWUsXG4gICAgICAgICAgICB0b1RoZW1lOiBuZXdUaGVtZSxcbiAgICAgICAgICAgIHJlamVjdGlvblByb3BzOiBjaGFydENvbnN0LlNFUklFU19QUk9QU1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gbmV3VGhlbWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZpbHRlciBjaGFydCB0eXBlcy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGFyZ2V0IHRhcmdldCBjaGFydHNcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSByZWplY3Rpb25Qcm9wcyByZWplY3QgcHJvcGVydHlcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBmaWx0ZXJlZCBjaGFydHMuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZmlsdGVyQ2hhcnRUeXBlczogZnVuY3Rpb24odGFyZ2V0LCByZWplY3Rpb25Qcm9wcykge1xuICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICBpZiAoIXRhcmdldCkge1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVzdWx0ID0gdHVpLnV0aWwuZmlsdGVyKHRhcmdldCwgZnVuY3Rpb24oaXRlbSwgbmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIHR1aS51dGlsLmluQXJyYXkobmFtZSwgcmVqZWN0aW9uUHJvcHMpID09PSAtMTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvbmNhdCBjb2xvcnMuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIHRoZW1lXG4gICAgICogQHBhcmFtIHthcnJheS48c3RyaW5nPn0gc2VyaWVzQ29sb3JzIHNlcmllcyBjb2xvcnNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jb25jYXRDb2xvcnM6IGZ1bmN0aW9uKHRoZW1lLCBzZXJpZXNDb2xvcnMpIHtcbiAgICAgICAgaWYgKHRoZW1lLmNvbG9ycykge1xuICAgICAgICAgICAgdGhlbWUuY29sb3JzID0gdGhlbWUuY29sb3JzLmNvbmNhdChzZXJpZXNDb2xvcnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoZW1lLnNpbmdsZUNvbG9ycykge1xuICAgICAgICAgICAgdGhlbWUuc2luZ2xlQ29sb3JzID0gdGhlbWUuc2luZ2xlQ29sb3JzLmNvbmNhdChzZXJpZXNDb2xvcnMpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvbmNhdCBkZWZhdWx0IGNvbG9ycy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgdGhlbWVcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBzZXJpZXNDb2xvcnMgc2VyaWVzIGNvbG9yc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NvbmNhdERlZmF1bHRDb2xvcnM6IGZ1bmN0aW9uKHRoZW1lLCBzZXJpZXNDb2xvcnMpIHtcbiAgICAgICAgdmFyIGNoYXJ0VHlwZXM7XG5cbiAgICAgICAgaWYgKCF0aGVtZS5zZXJpZXMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNoYXJ0VHlwZXMgPSB0aGlzLl9maWx0ZXJDaGFydFR5cGVzKHRoZW1lLnNlcmllcywgY2hhcnRDb25zdC5TRVJJRVNfUFJPUFMpO1xuXG4gICAgICAgIGlmICghdHVpLnV0aWwua2V5cyhjaGFydFR5cGVzKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMuX2NvbmNhdENvbG9ycyh0aGVtZS5zZXJpZXMsIHNlcmllc0NvbG9ycyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0dWkudXRpbC5mb3JFYWNoKGNoYXJ0VHlwZXMsIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jb25jYXRDb2xvcnMoaXRlbSwgc2VyaWVzQ29sb3JzKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE92ZXJ3cml0ZSB0aGVtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBmcm9tIGZyb20gdGhlbWUgcHJvcGVydHlcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdG8gdG8gdGhlbWUgcHJvcGVydHlcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSByZXN1bHQgcHJvcGVydHlcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vdmVyd3JpdGVUaGVtZTogZnVuY3Rpb24oZnJvbSwgdG8pIHtcbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaCh0bywgZnVuY3Rpb24oaXRlbSwga2V5KSB7XG4gICAgICAgICAgICB2YXIgZnJvbUl0ZW0gPSBmcm9tW2tleV07XG4gICAgICAgICAgICBpZiAoIWZyb21JdGVtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodHVpLnV0aWwuaXNBcnJheShmcm9tSXRlbSkpIHtcbiAgICAgICAgICAgICAgICB0b1trZXldID0gZnJvbUl0ZW0uc2xpY2UoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHVpLnV0aWwuaXNPYmplY3QoZnJvbUl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fb3ZlcndyaXRlVGhlbWUoZnJvbUl0ZW0sIGl0ZW0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0b1trZXldID0gZnJvbUl0ZW07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIHJldHVybiB0bztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29weSBwcm9wZXJ0eS5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMucHJvcE5hbWUgcHJvcGVydHkgbmFtZVxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5mcm9tVGhlbWUgZnJvbSBwcm9wZXJ0eVxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50b1RoZW1lIHRwIHByb3BlcnR5XG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBwYXJhbXMucmVqZWN0aW9uUHJvcHMgcmVqZWN0IHByb3BlcnR5IG5hbWVcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBjb3BpZWQgcHJvcGVydHlcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jb3B5UHJvcGVydHk6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgY2hhcnRUeXBlcztcblxuICAgICAgICBpZiAoIXBhcmFtcy50b1RoZW1lW3BhcmFtcy5wcm9wTmFtZV0pIHtcbiAgICAgICAgICAgIHJldHVybiBwYXJhbXMudG9UaGVtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNoYXJ0VHlwZXMgPSB0aGlzLl9maWx0ZXJDaGFydFR5cGVzKHBhcmFtcy5mcm9tVGhlbWVbcGFyYW1zLnByb3BOYW1lXSwgcGFyYW1zLnJlamVjdGlvblByb3BzKTtcbiAgICAgICAgaWYgKHR1aS51dGlsLmtleXMoY2hhcnRUeXBlcykubGVuZ3RoKSB7XG4gICAgICAgICAgICB0dWkudXRpbC5mb3JFYWNoKGNoYXJ0VHlwZXMsIGZ1bmN0aW9uKGl0ZW0sIGtleSkge1xuICAgICAgICAgICAgICAgIHZhciBjbG9uZVRoZW1lID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShkZWZhdWx0VGhlbWVbcGFyYW1zLnByb3BOYW1lXSkpO1xuICAgICAgICAgICAgICAgIHBhcmFtcy5mcm9tVGhlbWVbcGFyYW1zLnByb3BOYW1lXVtrZXldID0gdGhpcy5fb3ZlcndyaXRlVGhlbWUoaXRlbSwgY2xvbmVUaGVtZSk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICAgICAgcGFyYW1zLnRvVGhlbWVbcGFyYW1zLnByb3BOYW1lXSA9IHBhcmFtcy5mcm9tVGhlbWVbcGFyYW1zLnByb3BOYW1lXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXJhbXMudG9UaGVtZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29weSBjb2xvciBpbmZvIHRvIGxlZ2VuZFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBzZXJpZXNUaGVtZSBzZXJpZXMgdGhlbWVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gbGVnZW5kVGhlbWUgbGVnZW5kIHRoZW1lXG4gICAgICogQHBhcmFtIHthcnJheS48c3RyaW5nPn0gY29sb3JzIGNvbG9yc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NvcHlDb2xvckluZm9Ub090aGVyOiBmdW5jdGlvbihzZXJpZXNUaGVtZSwgbGVnZW5kVGhlbWUsIGNvbG9ycykge1xuICAgICAgICBsZWdlbmRUaGVtZS5jb2xvcnMgPSBjb2xvcnMgfHwgc2VyaWVzVGhlbWUuY29sb3JzO1xuICAgICAgICBpZiAoc2VyaWVzVGhlbWUuc2luZ2xlQ29sb3JzKSB7XG4gICAgICAgICAgICBsZWdlbmRUaGVtZS5zaW5nbGVDb2xvcnMgPSBzZXJpZXNUaGVtZS5zaW5nbGVDb2xvcnM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNlcmllc1RoZW1lLmJvcmRlckNvbG9yKSB7XG4gICAgICAgICAgICBsZWdlbmRUaGVtZS5ib3JkZXJDb2xvciA9IHNlcmllc1RoZW1lLmJvcmRlckNvbG9yO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB0YXJnZXQgaXRlbXMgYWJvdXQgZm9udCBpbmhlcml0LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSB0aGVtZVxuICAgICAqIEByZXR1cm5zIHthcnJheS48b2JqZWN0Pn0gdGFyZ2V0IGl0ZW1zXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0SW5oZXJpdFRhcmdldFRoZW1lSXRlbXM6IGZ1bmN0aW9uKHRoZW1lKSB7XG4gICAgICAgIHZhciBpdGVtcyA9IFtcbiAgICAgICAgICAgICAgICB0aGVtZS50aXRsZSxcbiAgICAgICAgICAgICAgICB0aGVtZS54QXhpcy50aXRsZSxcbiAgICAgICAgICAgICAgICB0aGVtZS54QXhpcy5sYWJlbCxcbiAgICAgICAgICAgICAgICB0aGVtZS5sZWdlbmQubGFiZWxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB5QXhpc0NoYXJ0VHlwZVRoZW1zID0gdGhpcy5fZmlsdGVyQ2hhcnRUeXBlcyh0aGVtZS55QXhpcywgY2hhcnRDb25zdC5ZQVhJU19QUk9QUyksXG4gICAgICAgICAgICBzZXJpZXNDaGFydFR5cGVUaGVtZXMgPSB0aGlzLl9maWx0ZXJDaGFydFR5cGVzKHRoZW1lLnNlcmllcywgY2hhcnRDb25zdC5TRVJJRVNfUFJPUFMpO1xuXG4gICAgICAgIGlmICghdHVpLnV0aWwua2V5cyh5QXhpc0NoYXJ0VHlwZVRoZW1zKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGl0ZW1zLnB1c2godGhlbWUueUF4aXMudGl0bGUpO1xuICAgICAgICAgICAgaXRlbXMucHVzaCh0aGVtZS55QXhpcy5sYWJlbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0dWkudXRpbC5mb3JFYWNoKHlBeGlzQ2hhcnRUeXBlVGhlbXMsIGZ1bmN0aW9uKGNoYXRUeXBlVGhlbWUpIHtcbiAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKGNoYXRUeXBlVGhlbWUudGl0bGUpO1xuICAgICAgICAgICAgICAgIGl0ZW1zLnB1c2goY2hhdFR5cGVUaGVtZS5sYWJlbCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdHVpLnV0aWwua2V5cyhzZXJpZXNDaGFydFR5cGVUaGVtZXMpLmxlbmd0aCkge1xuICAgICAgICAgICAgaXRlbXMucHVzaCh0aGVtZS5zZXJpZXMubGFiZWwpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdHVpLnV0aWwuZm9yRWFjaChzZXJpZXNDaGFydFR5cGVUaGVtZXMsIGZ1bmN0aW9uKGNoYXRUeXBlVGhlbWUpIHtcbiAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKGNoYXRUeXBlVGhlbWUubGFiZWwpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGl0ZW1zO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbmhlcml0IHRoZW1lIGZvbnQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIHRoZW1lXG4gICAgICogQHBhcmFtIHthcnJheS48b2JqZWN0Pn0gdGFyZ2V0SXRlbXMgdGFyZ2V0IHRoZW1lIGl0ZW1zXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaW5oZXJpdFRoZW1lRm9udDogZnVuY3Rpb24odGhlbWUsIHRhcmdldEl0ZW1zKSB7XG4gICAgICAgIHZhciBiYXNlRm9udCA9IHRoZW1lLmNoYXJ0LmZvbnRGYW1pbHk7XG5cbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaEFycmF5KHRhcmdldEl0ZW1zLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICBpZiAoIWl0ZW0uZm9udEZhbWlseSkge1xuICAgICAgICAgICAgICAgIGl0ZW0uZm9udEZhbWlseSA9IGJhc2VGb250O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29weSBjb2xvciBpbmZvLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSB0aGVtZVxuICAgICAqIEBwcml2YXRlXG4gICAgICogQGlnbm9yZVxuICAgICAqL1xuICAgIF9jb3B5Q29sb3JJbmZvOiBmdW5jdGlvbih0aGVtZSkge1xuICAgICAgICB2YXIgc2VyaWVzQ2hhcnRUeXBlcyA9IHRoaXMuX2ZpbHRlckNoYXJ0VHlwZXModGhlbWUuc2VyaWVzLCBjaGFydENvbnN0LlNFUklFU19QUk9QUyk7XG4gICAgICAgIGlmICghdHVpLnV0aWwua2V5cyhzZXJpZXNDaGFydFR5cGVzKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMuX2NvcHlDb2xvckluZm9Ub090aGVyKHRoZW1lLnNlcmllcywgdGhlbWUubGVnZW5kKTtcbiAgICAgICAgICAgIHRoaXMuX2NvcHlDb2xvckluZm9Ub090aGVyKHRoZW1lLnNlcmllcywgdGhlbWUudG9vbHRpcCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0dWkudXRpbC5mb3JFYWNoKHNlcmllc0NoYXJ0VHlwZXMsIGZ1bmN0aW9uKGl0ZW0sIGNoYXJ0VHlwZSkge1xuICAgICAgICAgICAgICAgIHRoZW1lLmxlZ2VuZFtjaGFydFR5cGVdID0ge307XG4gICAgICAgICAgICAgICAgdGhlbWUudG9vbHRpcFtjaGFydFR5cGVdID0ge307XG4gICAgICAgICAgICAgICAgdGhpcy5fY29weUNvbG9ySW5mb1RvT3RoZXIoaXRlbSwgdGhlbWUubGVnZW5kW2NoYXJ0VHlwZV0sIGl0ZW0uY29sb3JzIHx8IHRoZW1lLmxlZ2VuZC5jb2xvcnMpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2NvcHlDb2xvckluZm9Ub090aGVyKGl0ZW0sIHRoZW1lLnRvb2x0aXBbY2hhcnRUeXBlXSwgaXRlbS5jb2xvcnMgfHwgdGhlbWUudG9vbHRpcC5jb2xvcnMpO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGVtZS5sZWdlbmQuY29sb3JzO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGVtZS50b29sdGlwLmNvbG9ycztcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9XG4gICAgfVxufTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBBeGlzIERhdGEgTWFrZXJcbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuLi9jb25zdCcpLFxuICAgIGNhbGN1bGF0b3IgPSByZXF1aXJlKCcuL2NhbGN1bGF0b3InKTtcblxudmFyIGFicyA9IE1hdGguYWJzLFxuICAgIGNvbmNhdCA9IEFycmF5LnByb3RvdHlwZS5jb25jYXQ7XG5cbi8qKlxuICogQXhpcyBkYXRhIG1ha2VyLlxuICogQG1vZHVsZSBheGlzRGF0YU1ha2VyXG4gKi9cbnZhciBheGlzRGF0YU1ha2VyID0ge1xuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgbGFiZWxzLlxuICAgICAqIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGxhYmVscyBsYWJlbHNcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbGFiZWxJbnRlcnZhbCBsYWJlbCBpbnRlcnZhbFxuICAgICAqIEByZXR1cm5zIHthcnJheS48c3RyaW5nPn0gbGFiZWxzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUxhYmVsczogZnVuY3Rpb24obGFiZWxzLCBsYWJlbEludGVydmFsKSB7XG4gICAgICAgIHZhciBsYXN0SW5kZXg7XG4gICAgICAgIGlmICghbGFiZWxJbnRlcnZhbCkge1xuICAgICAgICAgICAgcmV0dXJuIGxhYmVscztcbiAgICAgICAgfVxuXG4gICAgICAgIGxhc3RJbmRleCA9IGxhYmVscy5sZW5ndGggLSAxO1xuICAgICAgICByZXR1cm4gdHVpLnV0aWwubWFwKGxhYmVscywgZnVuY3Rpb24obGFiZWwsIGluZGV4KSB7XG4gICAgICAgICAgICBpZiAoaW5kZXggPiAwICYmIGluZGV4IDwgbGFzdEluZGV4ICYmIChpbmRleCAlIGxhYmVsSW50ZXJ2YWwpID4gMCkge1xuICAgICAgICAgICAgICAgIGxhYmVsID0gY2hhcnRDb25zdC5FTVBUWV9BWElTX0xBQkVMO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGxhYmVsO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBkYXRhIGFib3V0IGxhYmVsIGF4aXMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBsYWJlbHMgY2hhcnQgbGFiZWxzXG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IGlzVmVydGljYWwgd2hldGhlciB2ZXJ0aWNhbCBvciBub3RcbiAgICAgKiBAcmV0dXJucyB7e1xuICAgICAqICAgICAgbGFiZWxzOiBhcnJheS48c3RyaW5nPixcbiAgICAgKiAgICAgIHRpY2tDb3VudDogbnVtYmVyLFxuICAgICAqICAgICAgdmFsaWRUaWNrQ291bnQ6IG51bWJlcixcbiAgICAgKiAgICAgIGlzTGFiZWxBeGlzOiBib29sZWFuLFxuICAgICAqICAgICAgaXNWZXJ0aWNhbDogYm9vbGVhblxuICAgICAqIH19IGF4aXMgZGF0YVxuICAgICAqL1xuICAgIG1ha2VMYWJlbEF4aXNEYXRhOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIHRpY2tDb3VudCA9IHBhcmFtcy5sYWJlbHMubGVuZ3RoLFxuICAgICAgICAgICAgb3B0aW9ucyA9IHBhcmFtcy5vcHRpb25zIHx8IHt9O1xuICAgICAgICBpZiAoIXBhcmFtcy5hbGlnbmVkKSB7XG4gICAgICAgICAgICB0aWNrQ291bnQgKz0gMTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsYWJlbHM6IHRoaXMuX21ha2VMYWJlbHMocGFyYW1zLmxhYmVscywgb3B0aW9ucy5sYWJlbEludGVydmFsKSxcbiAgICAgICAgICAgIHRpY2tDb3VudDogdGlja0NvdW50LFxuICAgICAgICAgICAgdmFsaWRUaWNrQ291bnQ6IDAsXG4gICAgICAgICAgICBpc0xhYmVsQXhpczogdHJ1ZSxcbiAgICAgICAgICAgIGlzVmVydGljYWw6ICEhcGFyYW1zLmlzVmVydGljYWwsXG4gICAgICAgICAgICBhbGlnbmVkOiAhIXBhcmFtcy5hbGlnbmVkXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgZGF0YSBhYm91dCB2YWx1ZSBheGlzLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48YXJyYXkuPG51bWJlcj4+fSBwYXJhbXMudmFsdWVzIGNoYXJ0IHZhbHVlc1xuICAgICAqICAgICAgQHBhcmFtIHt7d2lkdGg6bnVtYmVyLCBoZWlnaHQ6bnVtYmVyfX0gcGFyYW1zLnNlcmllc0RpbWVuc2lvbiBzZXJpZXMgZGltZW5zaW9uXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxmdW5jdGlvbj59IHBhcmFtcy5mb3JtYXRGdW5jdGlvbnMgZm9ybWF0IGZ1bmN0aW9uc1xuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5zdGFja2VkIHN0YWNrZWQgb3B0aW9uXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLm9wdGlvbnMgYXhpcyBvcHRpb25zXG4gICAgICogQHJldHVybnMge3tcbiAgICAgKiAgICAgIGxhYmVsczogYXJyYXkuPHN0cmluZz4sXG4gICAgICogICAgICB0aWNrQ291bnQ6IG51bWJlcixcbiAgICAgKiAgICAgIHZhbGlkVGlja0NvdW50OiBudW1iZXIsXG4gICAgICogICAgICBpc0xhYmVsQXhpczogYm9vbGVhbixcbiAgICAgKiAgICAgIHNjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfSxcbiAgICAgKiAgICAgIGlzVmVydGljYWw6IGJvb2xlYW5cbiAgICAgKiB9fSBheGlzIGRhdGFcbiAgICAgKi9cbiAgICBtYWtlVmFsdWVBeGlzRGF0YTogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBvcHRpb25zID0gcGFyYW1zLm9wdGlvbnMgfHwge30sXG4gICAgICAgICAgICBpc1ZlcnRpY2FsID0gISFwYXJhbXMuaXNWZXJ0aWNhbCxcbiAgICAgICAgICAgIGlzUG9zaXRpb25SaWdodCA9ICEhcGFyYW1zLmlzUG9zaXRpb25SaWdodCxcbiAgICAgICAgICAgIGZvcm1hdEZ1bmN0aW9ucyA9IHBhcmFtcy5mb3JtYXRGdW5jdGlvbnMsXG4gICAgICAgICAgICB0aWNrSW5mbztcbiAgICAgICAgaWYgKHBhcmFtcy5zdGFja2VkID09PSAncGVyY2VudCcpIHtcbiAgICAgICAgICAgIHRpY2tJbmZvID0gY2hhcnRDb25zdC5QRVJDRU5UX1NUQUNLRURfVElDS19JTkZPO1xuICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zID0gW107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aWNrSW5mbyA9IHRoaXMuX2dldFRpY2tJbmZvKHtcbiAgICAgICAgICAgICAgICB2YWx1ZXM6IHRoaXMuX21ha2VCYXNlVmFsdWVzKHBhcmFtcy52YWx1ZXMsIHBhcmFtcy5zdGFja2VkKSxcbiAgICAgICAgICAgICAgICBzZXJpZXNEaW1lbnNpb246IHBhcmFtcy5zZXJpZXNEaW1lbnNpb24sXG4gICAgICAgICAgICAgICAgaXNWZXJ0aWNhbDogaXNWZXJ0aWNhbCxcbiAgICAgICAgICAgICAgICBpc1Bvc2l0aW9uUmlnaHQ6IGlzUG9zaXRpb25SaWdodCxcbiAgICAgICAgICAgICAgICBjaGFydFR5cGU6IHBhcmFtcy5jaGFydFR5cGVcbiAgICAgICAgICAgIH0sIG9wdGlvbnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxhYmVsczogdGhpcy5mb3JtYXRMYWJlbHModGlja0luZm8ubGFiZWxzLCBmb3JtYXRGdW5jdGlvbnMpLFxuICAgICAgICAgICAgdGlja0NvdW50OiB0aWNrSW5mby50aWNrQ291bnQsXG4gICAgICAgICAgICB2YWxpZFRpY2tDb3VudDogdGlja0luZm8udGlja0NvdW50LFxuICAgICAgICAgICAgc2NhbGU6IHRpY2tJbmZvLnNjYWxlLFxuICAgICAgICAgICAgc3RlcDogdGlja0luZm8uc3RlcCxcbiAgICAgICAgICAgIGlzVmVydGljYWw6IGlzVmVydGljYWwsXG4gICAgICAgICAgICBpc1Bvc2l0aW9uUmlnaHQ6IGlzUG9zaXRpb25SaWdodFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGJhc2UgdmFsdWVzLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7YXJyYXkuPG51bWJlcj59IGdyb3VwVmFsdWVzIGdyb3VwIHZhbHVlc1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzdGFja2VkIHN0YWNrZWQgb3B0aW9uLlxuICAgICAqIEByZXR1cm5zIHthcnJheS48bnVtYmVyPn0gYmFzZSB2YWx1ZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQmFzZVZhbHVlczogZnVuY3Rpb24oZ3JvdXBWYWx1ZXMsIHN0YWNrZWQpIHtcbiAgICAgICAgdmFyIGJhc2VWYWx1ZXMgPSBjb25jYXQuYXBwbHkoW10sIGdyb3VwVmFsdWVzKTsgLy8gZmxhdHRlbiBhcnJheVxuICAgICAgICBpZiAoc3RhY2tlZCA9PT0gY2hhcnRDb25zdC5TVEFDS0VEX05PUk1BTF9UWVBFKSB7XG4gICAgICAgICAgICBiYXNlVmFsdWVzID0gYmFzZVZhbHVlcy5jb25jYXQodHVpLnV0aWwubWFwKGdyb3VwVmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGx1c1ZhbHVlcyA9IHR1aS51dGlsLmZpbHRlcih2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSA+IDA7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHR1aS51dGlsLnN1bShwbHVzVmFsdWVzKTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYmFzZVZhbHVlcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGJhc2Ugc2l6ZSBmb3IgZ2V0IGNhbmRpZGF0ZSB0aWNrIGNvdW50cy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGRpbWVuc2lvbiBjaGF0IGRpbWVuc2lvblxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNWZXJ0aWNhbCB3aGV0aGVyIHZlcnRpY2FsIG9yIG5vdFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IGJhc2Ugc2l6ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldEJhc2VTaXplOiBmdW5jdGlvbihkaW1lbnNpb24sIGlzVmVydGljYWwpIHtcbiAgICAgICAgdmFyIGJhc2VTaXplO1xuICAgICAgICBpZiAoaXNWZXJ0aWNhbCkge1xuICAgICAgICAgICAgYmFzZVNpemUgPSBkaW1lbnNpb24uaGVpZ2h0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYmFzZVNpemUgPSBkaW1lbnNpb24ud2lkdGg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJhc2VTaXplO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgY2FuZGlkYXRlIHRpY2sgY291bnRzLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gY2hhcnREaW1lbnNpb24gY2hhdCBkaW1lbnNpb25cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzVmVydGljYWwgd2hldGhlciB2ZXJ0aWNhbCBvciBub3RcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPG51bWJlcj59IHRpY2sgY291bnRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0Q2FuZGlkYXRlVGlja0NvdW50czogZnVuY3Rpb24oY2hhcnREaW1lbnNpb24sIGlzVmVydGljYWwpIHtcbiAgICAgICAgdmFyIGJhc2VTaXplID0gdGhpcy5fZ2V0QmFzZVNpemUoY2hhcnREaW1lbnNpb24sIGlzVmVydGljYWwpLFxuICAgICAgICAgICAgc3RhcnQgPSBwYXJzZUludChiYXNlU2l6ZSAvIGNoYXJ0Q29uc3QuTUFYX1BJWEVMX1RZUEVfU1RFUF9TSVpFLCAxMCksXG4gICAgICAgICAgICBlbmQgPSBwYXJzZUludChiYXNlU2l6ZSAvIGNoYXJ0Q29uc3QuTUlOX1BJWEVMX1RZUEVfU1RFUF9TSVpFLCAxMCkgKyAxLFxuICAgICAgICAgICAgdGlja0NvdW50cyA9IHR1aS51dGlsLnJhbmdlKHN0YXJ0LCBlbmQpO1xuICAgICAgICByZXR1cm4gdGlja0NvdW50cztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNvbXBhcmluZyB2YWx1ZS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWluIG1pbmltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1heCBtYXhpbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7e3NjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfSwgc3RlcDogbnVtYmVyfX0gdGlja0luZm8gdGljayBpbmZvXG4gICAgICogQHJldHVybnMge251bWJlcn0gY29tcGFyaW5nIHZhbHVlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0Q29tcGFyaW5nVmFsdWU6IGZ1bmN0aW9uKG1pbiwgbWF4LCB0aWNrSW5mbykge1xuICAgICAgICB2YXIgZGlmZk1heCA9IGFicyh0aWNrSW5mby5zY2FsZS5tYXggLSBtYXgpLFxuICAgICAgICAgICAgZGlmZk1pbiA9IGFicyhtaW4gLSB0aWNrSW5mby5zY2FsZS5taW4pLFxuICAgICAgICAgICAgd2VpZ2h0ID0gTWF0aC5wb3coMTAsIHR1aS51dGlsLmxlbmd0aEFmdGVyUG9pbnQodGlja0luZm8uc3RlcCkpO1xuICAgICAgICByZXR1cm4gKGRpZmZNYXggKyBkaWZmTWluKSAqIHdlaWdodDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2VsZWN0IHRpY2sgaW5mby5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWluIG1pbmltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1heCBtYXhpbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7YXJyYXkuPG9iamVjdD59IGNhbmRpZGF0ZXMgdGljayBpbmZvIGNhbmRpZGF0ZXNcbiAgICAgKiBAcmV0dXJucyB7e3NjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfSwgdGlja0NvdW50OiBudW1iZXIsIHN0ZXA6IG51bWJlciwgbGFiZWxzOiBhcnJheS48bnVtYmVyPn19IHNlbGVjdGVkIHRpY2sgaW5mb1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NlbGVjdFRpY2tJbmZvOiBmdW5jdGlvbihtaW4sIG1heCwgY2FuZGlkYXRlcykge1xuICAgICAgICB2YXIgZ2V0Q29tcGFyaW5nVmFsdWUgPSB0dWkudXRpbC5iaW5kKHRoaXMuX2dldENvbXBhcmluZ1ZhbHVlLCB0aGlzLCBtaW4sIG1heCksXG4gICAgICAgICAgICB0aWNrSW5mbyA9IHR1aS51dGlsLm1pbihjYW5kaWRhdGVzLCBnZXRDb21wYXJpbmdWYWx1ZSk7XG4gICAgICAgIHJldHVybiB0aWNrSW5mbztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHRpY2sgY291bnQgYW5kIHNjYWxlLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy52YWx1ZXMgYmFzZSB2YWx1ZXNcbiAgICAgKiAgICAgIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gcGFyYW1zLnNlcmllc0RpbWVuc2lvbiBjaGF0IGRpbWVuc2lvblxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaXNWZXJ0aWNhbCB3aGV0aGVyIHZlcnRpY2FsIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5jaGFydFR5cGUgY2hhdCB0eXBlXG4gICAgICogQHBhcmFtIHt7bWluOiBudW1iZXIsIG1heDpudW1iZXJ9fSBvcHRpb25zIGF4aXMgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHt7dGlja0NvdW50OiBudW1iZXIsIHNjYWxlOiBvYmplY3R9fSB0aWNrIGluZm9cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRUaWNrSW5mbzogZnVuY3Rpb24ocGFyYW1zLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciBtaW4gPSB0dWkudXRpbC5taW4ocGFyYW1zLnZhbHVlcyksXG4gICAgICAgICAgICBtYXggPSB0dWkudXRpbC5tYXgocGFyYW1zLnZhbHVlcyksXG4gICAgICAgICAgICBpbnRUeXBlSW5mbywgdGlja0NvdW50cywgY2FuZGlkYXRlcywgdGlja0luZm87XG4gICAgICAgIC8vIDAxLiBtaW4sIG1heCwgb3B0aW9ucyDsoJXrs7Trpbwg7KCV7IiY7ZiV7Jy866GcIOuzgOqyvVxuICAgICAgICBpbnRUeXBlSW5mbyA9IHRoaXMuX21ha2VJbnRlZ2VyVHlwZUluZm8obWluLCBtYXgsIG9wdGlvbnMpO1xuXG4gICAgICAgIC8vIDAyLiB0aWNrIGNvdW50IO2bhOuztOq1sCDslrvquLBcbiAgICAgICAgdGlja0NvdW50cyA9IHBhcmFtcy50aWNrQ291bnQgPyBbcGFyYW1zLnRpY2tDb3VudF0gOiB0aGlzLl9nZXRDYW5kaWRhdGVUaWNrQ291bnRzKHBhcmFtcy5zZXJpZXNEaW1lbnNpb24sIHBhcmFtcy5pc1ZlcnRpY2FsKTtcblxuICAgICAgICAvLyAwMy4gdGljayBpbmZvIO2bhOuztOq1sCDqs4TsgrBcbiAgICAgICAgY2FuZGlkYXRlcyA9IHRoaXMuX2dldENhbmRpZGF0ZVRpY2tJbmZvcyh7XG4gICAgICAgICAgICBtaW46IGludFR5cGVJbmZvLm1pbixcbiAgICAgICAgICAgIG1heDogaW50VHlwZUluZm8ubWF4LFxuICAgICAgICAgICAgdGlja0NvdW50czogdGlja0NvdW50cyxcbiAgICAgICAgICAgIGNoYXJ0VHlwZTogcGFyYW1zLmNoYXJ0VHlwZVxuICAgICAgICB9LCBpbnRUeXBlSW5mby5vcHRpb25zKTtcblxuICAgICAgICAvLyAwNC4gdGljayBpbmZvIO2bhOuztOq1sCDspJEg7ZWY64KYIOyEoO2DnVxuICAgICAgICB0aWNrSW5mbyA9IHRoaXMuX3NlbGVjdFRpY2tJbmZvKGludFR5cGVJbmZvLm1pbiwgaW50VHlwZUluZm8ubWF4LCBjYW5kaWRhdGVzKTtcblxuICAgICAgICAvLyAwNS4g7KCV7IiY7ZiV7Jy866GcIOuzgOqyve2WiOuNmCB0aWNrIGluZm/rpbwg7JuQ656YIO2Yle2DnOuhnCDrs4Dqsr1cbiAgICAgICAgdGlja0luZm8gPSB0aGlzLl9yZXZlcnRPcmlnaW5hbFR5cGVUaWNrSW5mbyh0aWNrSW5mbywgaW50VHlwZUluZm8uZGl2aWRlTnVtKTtcbiAgICAgICAgcmV0dXJuIHRpY2tJbmZvO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGludGVnZXIgdHlwZSBpbmZvXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1pbiBtaW5pbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtYXggbWF4aW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiBAcGFyYW0ge3ttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fSBvcHRpb25zIGF4aXMgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHt7bWluOiBudW1iZXIsIG1heDogbnVtYmVyLCBvcHRpb25zOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfSwgZGl2aWRlTnVtOiBudW1iZXJ9fSBpbnRlZ2VyIHR5cGUgaW5mb1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VJbnRlZ2VyVHlwZUluZm86IGZ1bmN0aW9uKG1pbiwgbWF4LCBvcHRpb25zKSB7XG4gICAgICAgIHZhciBtdWx0aXBsZU51bSwgY2hhbmdlZE9wdGlvbnM7XG5cbiAgICAgICAgaWYgKGFicyhtaW4pID49IDEgfHwgYWJzKG1heCkgPj0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBtaW46IG1pbixcbiAgICAgICAgICAgICAgICBtYXg6IG1heCxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zLFxuICAgICAgICAgICAgICAgIGRpdmlkZU51bTogMVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIG11bHRpcGxlTnVtID0gdHVpLnV0aWwuZmluZE11bHRpcGxlTnVtKG1pbiwgbWF4KTtcbiAgICAgICAgY2hhbmdlZE9wdGlvbnMgPSB7fTtcblxuICAgICAgICBpZiAob3B0aW9ucy5taW4pIHtcbiAgICAgICAgICAgIGNoYW5nZWRPcHRpb25zLm1pbiA9IG9wdGlvbnMubWluICogbXVsdGlwbGVOdW07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob3B0aW9ucy5tYXgpIHtcbiAgICAgICAgICAgIGNoYW5nZWRPcHRpb25zLm1heCA9IG9wdGlvbnMubWF4ICogbXVsdGlwbGVOdW07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbWluOiBtaW4gKiBtdWx0aXBsZU51bSxcbiAgICAgICAgICAgIG1heDogbWF4ICogbXVsdGlwbGVOdW0sXG4gICAgICAgICAgICBvcHRpb25zOiBjaGFuZ2VkT3B0aW9ucyxcbiAgICAgICAgICAgIGRpdmlkZU51bTogbXVsdGlwbGVOdW1cbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV2ZXJ0IHRpY2sgaW5mbyB0byBvcmlnaW5hbCB0eXBlLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7e3N0ZXA6IG51bWJlciwgc2NhbGU6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9LCBsYWJlbHM6IGFycmF5LjxudW1iZXI+fX0gdGlja0luZm8gdGljayBpbmZvXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGRpdmlkZU51bSBkaXZpZGUgbnVtXG4gICAgICogQHJldHVybnMge3tzdGVwOiBudW1iZXIsIHNjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfSwgbGFiZWxzOiBhcnJheS48bnVtYmVyPn19IGRpdmlkZWQgdGljayBpbmZvXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmV2ZXJ0T3JpZ2luYWxUeXBlVGlja0luZm86IGZ1bmN0aW9uKHRpY2tJbmZvLCBkaXZpZGVOdW0pIHtcbiAgICAgICAgaWYgKGRpdmlkZU51bSA9PT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIHRpY2tJbmZvO1xuICAgICAgICB9XG5cbiAgICAgICAgdGlja0luZm8uc3RlcCA9IHR1aS51dGlsLmRpdmlzaW9uKHRpY2tJbmZvLnN0ZXAsIGRpdmlkZU51bSk7XG4gICAgICAgIHRpY2tJbmZvLnNjYWxlLm1pbiA9IHR1aS51dGlsLmRpdmlzaW9uKHRpY2tJbmZvLnNjYWxlLm1pbiwgZGl2aWRlTnVtKTtcbiAgICAgICAgdGlja0luZm8uc2NhbGUubWF4ID0gdHVpLnV0aWwuZGl2aXNpb24odGlja0luZm8uc2NhbGUubWF4LCBkaXZpZGVOdW0pO1xuICAgICAgICB0aWNrSW5mby5sYWJlbHMgPSB0dWkudXRpbC5tYXAodGlja0luZm8ubGFiZWxzLCBmdW5jdGlvbihsYWJlbCkge1xuICAgICAgICAgICAgcmV0dXJuIHR1aS51dGlsLmRpdmlzaW9uKGxhYmVsLCBkaXZpZGVOdW0pO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdGlja0luZm87XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE5vcm1hbGl6ZSBzdGVwLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdGVwIG9yaWdpbmFsIHN0ZXBcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBub3JtYWxpemVkIHN0ZXBcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9ub3JtYWxpemVTdGVwOiBmdW5jdGlvbihzdGVwKSB7XG4gICAgICAgIHJldHVybiBjYWxjdWxhdG9yLm5vcm1hbGl6ZUF4aXNOdW1iZXIoc3RlcCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1pbmltaXplIHRpY2sgc2NhbGUuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnVzZXJNaW4gdXNlciBtaW5cbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMudXNlck1heCB1c2VyIG1heFxuICAgICAqICAgICAgQHBhcmFtIHt7dGlja0NvdW50OiBudW1iZXIsIHNjYWxlOiBvYmplY3R9fSBwYXJhbXMudGlja0luZm8gdGljayBpbmZvXG4gICAgICogICAgICBAcGFyYW0ge3ttaW46IG51bWJlciwgbWF4Om51bWJlcn19IHBhcmFtcy5vcHRpb25zIGF4aXMgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHt7dGlja0NvdW50OiBudW1iZXIsIHNjYWxlOiBvYmplY3QsIGxhYmVsczogYXJyYXl9fSBjb3JyZWN0ZWQgdGljayBpbmZvXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWluaW1pemVUaWNrU2NhbGU6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgdGlja0luZm8gPSBwYXJhbXMudGlja0luZm8sXG4gICAgICAgICAgICB0aWNrcyA9IHR1aS51dGlsLnJhbmdlKDEsIHRpY2tJbmZvLnRpY2tDb3VudCksXG4gICAgICAgICAgICBvcHRpb25zID0gcGFyYW1zLm9wdGlvbnMsXG4gICAgICAgICAgICBzdGVwID0gdGlja0luZm8uc3RlcCxcbiAgICAgICAgICAgIHNjYWxlID0gdGlja0luZm8uc2NhbGUsXG4gICAgICAgICAgICB0aWNrTWF4ID0gc2NhbGUubWF4LFxuICAgICAgICAgICAgdGlja01pbiA9IHNjYWxlLm1pbixcbiAgICAgICAgICAgIGlzVW5kZWZpbmVkTWluID0gdHVpLnV0aWwuaXNVbmRlZmluZWQob3B0aW9ucy5taW4pLFxuICAgICAgICAgICAgaXNVbmRlZmluZWRNYXggPSB0dWkudXRpbC5pc1VuZGVmaW5lZChvcHRpb25zLm1heCksXG4gICAgICAgICAgICBsYWJlbHM7XG4gICAgICAgIHR1aS51dGlsLmZvckVhY2hBcnJheSh0aWNrcywgZnVuY3Rpb24odGlja0luZGV4KSB7XG4gICAgICAgICAgICB2YXIgY3VyU3RlcCA9IChzdGVwICogdGlja0luZGV4KSxcbiAgICAgICAgICAgICAgICBjdXJNaW4gPSB0aWNrTWluICsgY3VyU3RlcCxcbiAgICAgICAgICAgICAgICBjdXJNYXggPSB0aWNrTWF4IC0gY3VyU3RlcDtcblxuICAgICAgICAgICAgLy8g642U7J207IOBIOuzgOqyveydtCDtlYTsmpQg7JeG7J2EIOqyveyasFxuICAgICAgICAgICAgaWYgKHBhcmFtcy51c2VyTWluIDw9IGN1ck1pbiAmJiBwYXJhbXMudXNlck1heCA+PSBjdXJNYXgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIG1pbiDqsJLsl5Ag67OA6rK9IOyXrOycoOqwgCDsnojsnYQg6rK97JqwXG4gICAgICAgICAgICBpZiAoKGlzVW5kZWZpbmVkTWluICYmIHBhcmFtcy51c2VyTWluID4gY3VyTWluKSB8fFxuICAgICAgICAgICAgICAgICghaXNVbmRlZmluZWRNaW4gJiYgb3B0aW9ucy5taW4gPj0gY3VyTWluKSkge1xuICAgICAgICAgICAgICAgIHNjYWxlLm1pbiA9IGN1ck1pbjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gbWF4IOqwkuyXkCDrs4Dqsr0g7Jes7Jyg6rCAIOyeiOydhCDqsr3smrBcbiAgICAgICAgICAgIGlmICgoaXNVbmRlZmluZWRNaW4gJiYgcGFyYW1zLnVzZXJNYXggPCBjdXJNYXgpIHx8XG4gICAgICAgICAgICAgICAgKCFpc1VuZGVmaW5lZE1heCAmJiBvcHRpb25zLm1heCA8PSBjdXJNYXgpKSB7XG4gICAgICAgICAgICAgICAgc2NhbGUubWF4ID0gY3VyTWF4O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBsYWJlbHMgPSBjYWxjdWxhdG9yLm1ha2VMYWJlbHNGcm9tU2NhbGUoc2NhbGUsIHN0ZXApO1xuICAgICAgICB0aWNrSW5mby5sYWJlbHMgPSBsYWJlbHM7XG4gICAgICAgIHRpY2tJbmZvLnN0ZXAgPSBzdGVwO1xuICAgICAgICB0aWNrSW5mby50aWNrQ291bnQgPSBsYWJlbHMubGVuZ3RoO1xuICAgICAgICByZXR1cm4gdGlja0luZm87XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIGRpdmlkZSB0aWNrIHN0ZXAuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHt7c2NhbGU6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9LCB0aWNrQ291bnQ6IG51bWJlciwgc3RlcDogbnVtYmVyLCBsYWJlbHM6IGFycmF5LjxudW1iZXI+fX0gdGlja0luZm8gdGljayBpbmZvXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG9yZ1RpY2tDb3VudCBvcmlnaW5hbCB0aWNrQ291bnRcbiAgICAgKiBAcmV0dXJucyB7e3NjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfSwgdGlja0NvdW50OiBudW1iZXIsIHN0ZXA6IG51bWJlciwgbGFiZWxzOiBhcnJheS48bnVtYmVyPn19IHRpY2sgaW5mb1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2RpdmlkZVRpY2tTdGVwOiBmdW5jdGlvbih0aWNrSW5mbywgb3JnVGlja0NvdW50KSB7XG4gICAgICAgIHZhciBzdGVwID0gdGlja0luZm8uc3RlcCxcbiAgICAgICAgICAgIHNjYWxlID0gdGlja0luZm8uc2NhbGUsXG4gICAgICAgICAgICB0aWNrQ291bnQgPSB0aWNrSW5mby50aWNrQ291bnQ7XG4gICAgICAgIC8vIHN0ZXAgMuydmCDrsLDsiJgg7J2066m07IScIOuzgOqyveuQnCB0aWNrQ291bnTsnZgg65GQ67Cw7IiYLTHsnbQgdGlja0NvdW5067O064ukIG9yZ1RpY2tDb3VudOyZgCDssKjsnbTqsIAg642c64KY6rGw64KYIOqwmeycvOuptCBzdGVw7J2EIOuwmOycvOuhnCDrs4Dqsr3tlZzri6QuXG4gICAgICAgIGlmICgoc3RlcCAlIDIgPT09IDApICYmXG4gICAgICAgICAgICBhYnMob3JnVGlja0NvdW50IC0gKCh0aWNrQ291bnQgKiAyKSAtIDEpKSA8PSBhYnMob3JnVGlja0NvdW50IC0gdGlja0NvdW50KSkge1xuICAgICAgICAgICAgc3RlcCA9IHN0ZXAgLyAyO1xuICAgICAgICAgICAgdGlja0luZm8ubGFiZWxzID0gY2FsY3VsYXRvci5tYWtlTGFiZWxzRnJvbVNjYWxlKHNjYWxlLCBzdGVwKTtcbiAgICAgICAgICAgIHRpY2tJbmZvLnRpY2tDb3VudCA9IHRpY2tJbmZvLmxhYmVscy5sZW5ndGg7XG4gICAgICAgICAgICB0aWNrSW5mby5zdGVwID0gc3RlcDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGlja0luZm87XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgdGljayBpbmZvXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnRpY2tDb3VudCB0aWNrIGNvdW50XG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLm1pbiBzY2FsZSBtaW5cbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubWF4IHNjYWxlIG1heFxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy51c2VyTWluIG1pbmltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnVzZXJNYXggbWF4aW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gcGFyYW1zLmlzTWludXMgd2hldGhlciBzY2FsZSBpcyBtaW51cyBvciBub3RcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMuY2hhcnRUeXBlIGNoYXJ0IHR5cGVcbiAgICAgKiAgICAgIEBwYXJhbSB7e21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19IHBhcmFtcy5vcHRpb25zIGF4aXMgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHt7XG4gICAgICogICAgICBzY2FsZToge21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn0sXG4gICAgICogICAgICB0aWNrQ291bnQ6IG51bWJlcixcbiAgICAgKiAgICAgIHN0ZXA6IG51bWJlcixcbiAgICAgKiAgICAgIGxhYmVsczogYXJyYXkuPG51bWJlcj5cbiAgICAgKiB9fSB0aWNrIGluZm9cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlVGlja0luZm86IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgc2NhbGUgPSBwYXJhbXMuc2NhbGUsXG4gICAgICAgICAgICBzdGVwLCB0aWNrSW5mbztcblxuICAgICAgICAvLyAwMS4g6riw67O4IHNjYWxlIOygleuztOuhnCBzdGVwIOyWu+q4sFxuICAgICAgICBzdGVwID0gY2FsY3VsYXRvci5nZXRTY2FsZVN0ZXAoc2NhbGUsIHBhcmFtcy50aWNrQ291bnQpO1xuXG4gICAgICAgIC8vIDAyLiBzdGVwIOygleq3nO2ZlCDsi5ztgqTquLAgKGV4OiAwLjMgLS0+IDAuNSwgNyAtLT4gMTApXG4gICAgICAgIHN0ZXAgPSB0aGlzLl9ub3JtYWxpemVTdGVwKHN0ZXApO1xuXG4gICAgICAgIC8vIDAzLiBzY2FsZSDsoJXqt5ztmZQg7Iuc7YKk6riwXG4gICAgICAgIHNjYWxlID0gdGhpcy5fbm9ybWFsaXplU2NhbGUoc2NhbGUsIHN0ZXAsIHBhcmFtcy50aWNrQ291bnQpO1xuXG4gICAgICAgIC8vIDA0LiDsgqzsmqnsnpDsnZggbWF46rCS7J20IHNjYWVsIG1heOyZgCDqsJnsnYQg6rK97JqwLCBtYXjqsJLsnYQgMSBzdGVwIOymneqwgCDsi5ztgrRcbiAgICAgICAgc2NhbGUubWF4ID0gdGhpcy5fYWRkTWF4UGFkZGluZyh7XG4gICAgICAgICAgICBtYXg6IHNjYWxlLm1heCxcbiAgICAgICAgICAgIHN0ZXA6IHN0ZXAsXG4gICAgICAgICAgICB1c2VyTWF4OiBwYXJhbXMudXNlck1heCxcbiAgICAgICAgICAgIG1heE9wdGlvbjogcGFyYW1zLm9wdGlvbnMubWF4XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIDA1LiBheGlzIHNjYWxl7J20IOyCrOyaqeyekCBtaW4sIG1heOyZgCDqsbDrpqzqsIAg66mAIOqyveyasCDsobDsoIhcbiAgICAgICAgdGlja0luZm8gPSB0aGlzLl9taW5pbWl6ZVRpY2tTY2FsZSh7XG4gICAgICAgICAgICB1c2VyTWluOiBwYXJhbXMudXNlck1pbixcbiAgICAgICAgICAgIHVzZXJNYXg6IHBhcmFtcy51c2VyTWF4LFxuICAgICAgICAgICAgdGlja0luZm86IHtzY2FsZTogc2NhbGUsIHN0ZXA6IHN0ZXAsIHRpY2tDb3VudDogcGFyYW1zLnRpY2tDb3VudH0sXG4gICAgICAgICAgICBvcHRpb25zOiBwYXJhbXMub3B0aW9uc1xuICAgICAgICB9KTtcblxuICAgICAgICB0aWNrSW5mbyA9IHRoaXMuX2RpdmlkZVRpY2tTdGVwKHRpY2tJbmZvLCBwYXJhbXMudGlja0NvdW50KTtcbiAgICAgICAgcmV0dXJuIHRpY2tJbmZvO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgc2NhbGUgbWF4IHBhZGRpbmcuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcHJhbXMge251bWJlcn0gcGFyYW1zLm1heCBzY2FsZSBtYXhcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMudXNlck1heCBtYXhpbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5tYXhPcHRpb24gbWF4IG9wdGlvblxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5zdGVwIHRpY2sgc3RlcFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IHNjYWxlIG1heFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2FkZE1heFBhZGRpbmc6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgbWF4ID0gcGFyYW1zLm1heDtcbiAgICAgICAgLy8gbm9ybWFsaXpl65CcIHNjYWxlIG1heOqwkuydtCB1c2VyIG1heOqwkuqzvCDqsJnsnYQg6rK97JqwIHN0ZXAg7Kad6rCAXG4gICAgICAgIGlmICh0dWkudXRpbC5pc1VuZGVmaW5lZChwYXJhbXMubWF4T3B0aW9uKSAmJiAocGFyYW1zLm1heCA9PT0gcGFyYW1zLnVzZXJNYXgpKSB7XG4gICAgICAgICAgICBtYXggKz0gcGFyYW1zLnN0ZXA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1heDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbm9ybWFsaXplIG1pbi5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWluIG9yaWdpbmFsIG1pblxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdGVwIHRpY2sgc3RlcFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IG5vcm1hbGl6ZWQgbWluXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbm9ybWFsaXplTWluOiBmdW5jdGlvbihtaW4sIHN0ZXApIHtcbiAgICAgICAgdmFyIG1vZCA9IHR1aS51dGlsLm1vZChtaW4sIHN0ZXApLFxuICAgICAgICAgICAgbm9ybWFsaXplZDtcblxuICAgICAgICBpZiAobW9kID09PSAwKSB7XG4gICAgICAgICAgICBub3JtYWxpemVkID0gbWluO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbm9ybWFsaXplZCA9IHR1aS51dGlsLnN1YnRyYWN0aW9uKG1pbiwgKG1pbiA+PSAwID8gbW9kIDogc3RlcCArIG1vZCkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBub3JtYWxpemVkO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIG5vcm1hbGl6ZWQgbWF4LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7e21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19IHNjYWxlIHNjYWxlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHN0ZXAgdGljayBzdGVwXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHRpY2tDb3VudCB0aWNrIGNvdW50XG4gICAgICogQHJldHVybnMge251bWJlcn0gbm9ybWFsaXplZCBtYXhcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlTm9ybWFsaXplZE1heDogZnVuY3Rpb24oc2NhbGUsIHN0ZXAsIHRpY2tDb3VudCkge1xuICAgICAgICB2YXIgbWluTWF4RGlmZiA9IHR1aS51dGlsLm11bHRpcGxpY2F0aW9uKHN0ZXAsIHRpY2tDb3VudCAtIDEpLFxuICAgICAgICAgICAgbm9ybWFsaXplZE1heCA9IHR1aS51dGlsLmFkZGl0aW9uKHNjYWxlLm1pbiwgbWluTWF4RGlmZiksXG4gICAgICAgICAgICBtYXhEaWZmID0gc2NhbGUubWF4IC0gbm9ybWFsaXplZE1heCxcbiAgICAgICAgICAgIG1vZERpZmYsIGRpdmlkZURpZmY7XG4gICAgICAgIC8vIG5vcm1hbGl6ZeuQnCBtYXjqsJLsnbQg7JuQ656Y7J2YIG1heOqwkiDrs7Tri6Qg7J6R7J2EIOqyveyasCBzdGVw7J2EIOymneqwgOyLnOy8nCDtgbAg6rCS7Jy866GcIOunjOuTpOq4sFxuICAgICAgICBpZiAobWF4RGlmZiA+IDApIHtcbiAgICAgICAgICAgIG1vZERpZmYgPSBtYXhEaWZmICUgc3RlcDtcbiAgICAgICAgICAgIGRpdmlkZURpZmYgPSBNYXRoLmZsb29yKG1heERpZmYgLyBzdGVwKTtcbiAgICAgICAgICAgIG5vcm1hbGl6ZWRNYXggKz0gc3RlcCAqIChtb2REaWZmID4gMCA/IGRpdmlkZURpZmYgKyAxIDogZGl2aWRlRGlmZik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5vcm1hbGl6ZWRNYXg7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG5vcm1hbGl6ZSBzY2FsZS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge3ttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fSBzY2FsZSBiYXNlIHNjYWxlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHN0ZXAgdGljayBzdGVwXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHRpY2tDb3VudCB0aWNrIGNvdW50XG4gICAgICogQHJldHVybnMge3ttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fSBub3JtYWxpemVkIHNjYWxlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbm9ybWFsaXplU2NhbGU6IGZ1bmN0aW9uKHNjYWxlLCBzdGVwLCB0aWNrQ291bnQpIHtcbiAgICAgICAgc2NhbGUubWluID0gdGhpcy5fbm9ybWFsaXplTWluKHNjYWxlLm1pbiwgc3RlcCk7XG4gICAgICAgIHNjYWxlLm1heCA9IHRoaXMuX21ha2VOb3JtYWxpemVkTWF4KHNjYWxlLCBzdGVwLCB0aWNrQ291bnQpO1xuICAgICAgICByZXR1cm4gc2NhbGU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjYW5kaWRhdGVzIGFib3V0IHRpY2sgaW5mby5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubWluIG1pbmltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLm1heCBtYXhpbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48bnVtYmVyPn0gcGFyYW1zLnRpY2tDb3VudHMgdGljayBjb3VudHNcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMuY2hhcnRUeXBlIGNoYXJ0IHR5cGVcbiAgICAgKiBAcGFyYW0ge3ttaW46IG51bWJlciwgbWF4Om51bWJlcn19IG9wdGlvbnMgYXhpcyBvcHRpb25zXG4gICAgICogQHJldHVybnMge2FycmF5fSBjYW5kaWRhdGVzIGFib3V0IHRpY2sgaW5mb1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldENhbmRpZGF0ZVRpY2tJbmZvczogZnVuY3Rpb24ocGFyYW1zLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciB1c2VyTWluID0gcGFyYW1zLm1pbixcbiAgICAgICAgICAgIHVzZXJNYXggPSBwYXJhbXMubWF4LFxuICAgICAgICAgICAgbWluID0gcGFyYW1zLm1pbixcbiAgICAgICAgICAgIG1heCA9IHBhcmFtcy5tYXgsXG4gICAgICAgICAgICBzY2FsZSwgY2FuZGlkYXRlcztcblxuICAgICAgICAvLyBtaW4sIG1heOunjOycvOuhnCDquLDrs7ggc2NhbGUg7Ja76riwXG4gICAgICAgIHNjYWxlID0gdGhpcy5fbWFrZUJhc2VTY2FsZShtaW4sIG1heCwgb3B0aW9ucyk7XG5cbiAgICAgICAgY2FuZGlkYXRlcyA9IHR1aS51dGlsLm1hcChwYXJhbXMudGlja0NvdW50cywgZnVuY3Rpb24odGlja0NvdW50KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbWFrZVRpY2tJbmZvKHtcbiAgICAgICAgICAgICAgICB0aWNrQ291bnQ6IHRpY2tDb3VudCxcbiAgICAgICAgICAgICAgICBzY2FsZTogdHVpLnV0aWwuZXh0ZW5kKHt9LCBzY2FsZSksXG4gICAgICAgICAgICAgICAgdXNlck1pbjogdXNlck1pbixcbiAgICAgICAgICAgICAgICB1c2VyTWF4OiB1c2VyTWF4LFxuICAgICAgICAgICAgICAgIGNoYXJ0VHlwZTogcGFyYW1zLmNoYXJ0VHlwZSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIHJldHVybiBjYW5kaWRhdGVzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGJhc2Ugc2NhbGVcbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWluIG1pbmltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1heCBtYXhpbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7e21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19IG9wdGlvbnMgYXhpcyBvcHRpb25zXG4gICAgICogQHJldHVybnMge3ttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fSBiYXNlIHNjYWxlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUJhc2VTY2FsZTogZnVuY3Rpb24obWluLCBtYXgsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIGlzTWludXMgPSBmYWxzZSxcbiAgICAgICAgICAgIHRtcE1pbiwgc2NhbGU7XG5cbiAgICAgICAgaWYgKG1pbiA8IDAgJiYgbWF4IDw9IDApIHtcbiAgICAgICAgICAgIGlzTWludXMgPSB0cnVlO1xuICAgICAgICAgICAgdG1wTWluID0gbWluO1xuICAgICAgICAgICAgbWluID0gLW1heDtcbiAgICAgICAgICAgIG1heCA9IC10bXBNaW47XG4gICAgICAgIH1cblxuICAgICAgICBzY2FsZSA9IGNhbGN1bGF0b3IuY2FsY3VsYXRlU2NhbGUobWluLCBtYXgpO1xuXG4gICAgICAgIGlmIChpc01pbnVzKSB7XG4gICAgICAgICAgICB0bXBNaW4gPSBzY2FsZS5taW47XG4gICAgICAgICAgICBzY2FsZS5taW4gPSAtc2NhbGUubWF4O1xuICAgICAgICAgICAgc2NhbGUubWF4ID0gLXRtcE1pbjtcbiAgICAgICAgfVxuXG4gICAgICAgIHNjYWxlLm1pbiA9IG9wdGlvbnMubWluIHx8IHNjYWxlLm1pbjtcbiAgICAgICAgc2NhbGUubWF4ID0gb3B0aW9ucy5tYXggfHwgc2NhbGUubWF4O1xuXG4gICAgICAgIHJldHVybiBzY2FsZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRm9ybWF0IGxhYmVscy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBsYWJlbHMgdGFyZ2V0IGxhYmVsc1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb25bXX0gZm9ybWF0RnVuY3Rpb25zIGZvcm1hdCBmdW5jdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nW119IGZvcm1hdHRlZCBsYWJlbHNcbiAgICAgKi9cbiAgICBmb3JtYXRMYWJlbHM6IGZ1bmN0aW9uKGxhYmVscywgZm9ybWF0RnVuY3Rpb25zKSB7XG4gICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgIGlmICghZm9ybWF0RnVuY3Rpb25zIHx8ICFmb3JtYXRGdW5jdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gbGFiZWxzO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdCA9IHR1aS51dGlsLm1hcChsYWJlbHMsIGZ1bmN0aW9uKGxhYmVsKSB7XG4gICAgICAgICAgICB2YXIgZm5zID0gY29uY2F0LmFwcGx5KFtsYWJlbF0sIGZvcm1hdEZ1bmN0aW9ucyk7XG4gICAgICAgICAgICByZXR1cm4gdHVpLnV0aWwucmVkdWNlKGZucywgZnVuY3Rpb24oc3RvcmVkLCBmbikge1xuICAgICAgICAgICAgICAgIHJldHVybiBmbihzdG9yZWQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gYXhpc0RhdGFNYWtlcjtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBCb3VuZHMgbWFrZXIuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBjaGFydENvbnN0ID0gcmVxdWlyZSgnLi4vY29uc3QnKSxcbiAgICBjYWxjdWxhdG9yID0gcmVxdWlyZSgnLi9jYWxjdWxhdG9yJyksXG4gICAgcmVuZGVyVXRpbCA9IHJlcXVpcmUoJy4vcmVuZGVyVXRpbCcpO1xuXG52YXIgY29uY2F0ID0gQXJyYXkucHJvdG90eXBlLmNvbmNhdDtcblxuLyoqXG4gKiBCb3VuZHMgbWFrZXIuXG4gKiBAbW9kdWxlIGJvdW5kc01ha2VyXG4gKi9cbnZhciBib3VuZHNNYWtlciA9IHtcbiAgICAvKipcbiAgICAgKiBHZXQgbWF4IGxhYmVsIG9mIHZhbHVlIGF4aXMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpib3VuZHNNYWtlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb252ZXJ0ZWREYXRhIGNvbnZlcnQgZGF0YVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjaGFydFR5cGUgY2hhcnQgdHlwZVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ8c3RyaW5nfSBtYXggbGFiZWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRWYWx1ZUF4aXNNYXhMYWJlbDogZnVuY3Rpb24oY29udmVydGVkRGF0YSwgY2hhcnRUeXBlKSB7XG4gICAgICAgIHZhciB2YWx1ZXMgPSBjaGFydFR5cGUgJiYgY29udmVydGVkRGF0YS52YWx1ZXNbY2hhcnRUeXBlXSB8fCBjb252ZXJ0ZWREYXRhLmpvaW5WYWx1ZXMsXG4gICAgICAgICAgICBmb3JtYXRGdW5jdGlvbnMgPSBjb252ZXJ0ZWREYXRhLmZvcm1hdEZ1bmN0aW9ucyxcbiAgICAgICAgICAgIGZsYXR0ZW5WYWx1ZXMgPSBjb25jYXQuYXBwbHkoW10sIHZhbHVlcyksXG4gICAgICAgICAgICBtaW4gPSB0dWkudXRpbC5taW4oZmxhdHRlblZhbHVlcyksXG4gICAgICAgICAgICBtYXggPSB0dWkudXRpbC5tYXgoZmxhdHRlblZhbHVlcyksXG4gICAgICAgICAgICBzY2FsZSA9IGNhbGN1bGF0b3IuY2FsY3VsYXRlU2NhbGUobWluLCBtYXgpLFxuICAgICAgICAgICAgbWluTGFiZWwgPSBjYWxjdWxhdG9yLm5vcm1hbGl6ZUF4aXNOdW1iZXIoc2NhbGUubWluKSxcbiAgICAgICAgICAgIG1heExhYmVsID0gY2FsY3VsYXRvci5ub3JtYWxpemVBeGlzTnVtYmVyKHNjYWxlLm1heCksXG4gICAgICAgICAgICBmbnMgPSBmb3JtYXRGdW5jdGlvbnMgJiYgZm9ybWF0RnVuY3Rpb25zLnNsaWNlKCkgfHwgW107XG4gICAgICAgIG1heExhYmVsID0gKG1pbkxhYmVsICsgJycpLmxlbmd0aCA+IChtYXhMYWJlbCArICcnKS5sZW5ndGggPyBtaW5MYWJlbCA6IG1heExhYmVsO1xuICAgICAgICBmbnMudW5zaGlmdChtYXhMYWJlbCk7XG4gICAgICAgIG1heExhYmVsID0gdHVpLnV0aWwucmVkdWNlKGZucywgZnVuY3Rpb24oc3RvcmVkLCBmbikge1xuICAgICAgICAgICAgcmV0dXJuIGZuKHN0b3JlZCk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gbWF4TGFiZWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBoZWlnaHQgb2YgeCBheGlzIGFyZWEuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpib3VuZHNNYWtlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIHggYXhpcyBvcHRpb25zLFxuICAgICAqIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGxhYmVscyBheGlzIGxhYmVsc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBheGlzIHRoZW1lXG4gICAgICogQHJldHVybnMge251bWJlcn0gaGVpZ2h0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0WEF4aXNIZWlnaHQ6IGZ1bmN0aW9uKG9wdGlvbnMsIGxhYmVscywgdGhlbWUpIHtcbiAgICAgICAgdmFyIHRpdGxlID0gb3B0aW9ucyAmJiBvcHRpb25zLnRpdGxlLFxuICAgICAgICAgICAgdGl0bGVBcmVhSGVpZ2h0ID0gcmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsSGVpZ2h0KHRpdGxlLCB0aGVtZS50aXRsZSkgKyBjaGFydENvbnN0LlRJVExFX1BBRERJTkcsXG4gICAgICAgICAgICBoZWlnaHQgPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxzTWF4SGVpZ2h0KGxhYmVscywgdGhlbWUubGFiZWwpICsgdGl0bGVBcmVhSGVpZ2h0O1xuICAgICAgICByZXR1cm4gaGVpZ2h0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgd2lkdGggYWJvdXQgeSBheGlzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIHkgYXhpcyBvcHRpb25zXG4gICAgICogQHBhcmFtIHthcnJheS48c3RyaW5nPn0gbGFiZWxzIGxhYmVsc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSB5QXhpcyB0aGVtZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBvcHRpb25zIGluZGV4XG4gICAgICogQHJldHVybnMge251bWJlcn0geSBheGlzIHdpZHRoXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0WUF4aXNXaWR0aDogZnVuY3Rpb24ob3B0aW9ucywgbGFiZWxzLCB0aGVtZSwgaW5kZXgpIHtcbiAgICAgICAgdmFyIHRpdGxlID0gJycsXG4gICAgICAgICAgICB0aXRsZUFyZWFXaWR0aCwgd2lkdGg7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgICAgICAgIG9wdGlvbnMgPSBbXS5jb25jYXQob3B0aW9ucyk7XG4gICAgICAgICAgICB0aXRsZSA9IG9wdGlvbnNbaW5kZXggfHwgMF0udGl0bGU7XG4gICAgICAgIH1cblxuICAgICAgICB0aXRsZUFyZWFXaWR0aCA9IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodCh0aXRsZSwgdGhlbWUudGl0bGUpICsgY2hhcnRDb25zdC5USVRMRV9QQURESU5HO1xuICAgICAgICB3aWR0aCA9IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbHNNYXhXaWR0aChsYWJlbHMsIHRoZW1lLmxhYmVsKSArIHRpdGxlQXJlYVdpZHRoICsgY2hhcnRDb25zdC5BWElTX0xBQkVMX1BBRERJTkc7XG5cbiAgICAgICAgcmV0dXJuIHdpZHRoO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgd2lkdGggYWJvdXQgeSByaWdodCBheGlzLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Ym91bmRzTWFrZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IHBhcmFtcy5jaGFydFR5cGVzIHkgYXhpcyBjaGFydCB0eXBlc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSB5IGF4aXMgdGhlbWVcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMub3B0aW9ucyB5IGF4aXMgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IHkgcmlnaHQgYXhpcyB3aWR0aFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFlSQXhpc1dpZHRoOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGNoYXJ0VHlwZXMgPSBwYXJhbXMuY2hhcnRUeXBlcyB8fCBbXSxcbiAgICAgICAgICAgIGxlbiA9IGNoYXJ0VHlwZXMubGVuZ3RoLFxuICAgICAgICAgICAgd2lkdGggPSAwLFxuICAgICAgICAgICAgaW5kZXgsIGNoYXJ0VHlwZSwgdGhlbWUsIGxhYmVsO1xuICAgICAgICBpZiAobGVuID4gMCkge1xuICAgICAgICAgICAgaW5kZXggPSBsZW4gLSAxO1xuICAgICAgICAgICAgY2hhcnRUeXBlID0gY2hhcnRUeXBlc1tpbmRleF07XG4gICAgICAgICAgICB0aGVtZSA9IHBhcmFtcy50aGVtZVtjaGFydFR5cGVdIHx8IHBhcmFtcy50aGVtZTtcbiAgICAgICAgICAgIGxhYmVsID0gdGhpcy5fZ2V0VmFsdWVBeGlzTWF4TGFiZWwocGFyYW1zLmNvbnZlcnRlZERhdGEsIGNoYXJ0VHlwZSk7XG4gICAgICAgICAgICB3aWR0aCA9IHRoaXMuX2dldFlBeGlzV2lkdGgocGFyYW1zLm9wdGlvbnMsIFtsYWJlbF0sIHRoZW1lLCBpbmRleCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHdpZHRoO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGF4ZXMgZGltZW5zaW9uLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Ym91bmRzTWFrZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuY29udmVydGVkRGF0YSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBjaGFydCB0aGVtZVxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaXNWZXJ0aWNhbCB3aGV0aGVyIHZlcnRpY2FsIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5vcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiAgICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmF4ZXNMYWJlbEluZm8gYXhlcyBsYWJlbCBpbmZvXG4gICAgICogQHJldHVybnMge3tcbiAgICAgKiAgICAgIHlBeGlzOiB7d2lkdGg6IG51bWJlcn0sXG4gICAgICogICAgICB5ckF4aXM6IHt3aWR0aDogbnVtYmVyfSxcbiAgICAgKiAgICAgIHhBeGlzOiB7aGVpZ2h0OiBudW1iZXJ9XG4gICAgICogfX0gYXhlcyBkaW1lbnNpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQXhlc0RpbWVuc2lvbjogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciB5QXhpc1dpZHRoID0gMCxcbiAgICAgICAgICAgIHhBeGlzSGVpZ2h0ID0gMCxcbiAgICAgICAgICAgIHlyQXhpc1dpZHRoID0gMCxcbiAgICAgICAgICAgIGF4ZXNMYWJlbEluZm8sIGNoYXJ0VHlwZTtcblxuICAgICAgICAvLyBheGlzIOyYgeyXreydtCDtlYTsmpQg7J6I64qUIOqyveyasOyXkOunjCDsspjrpqxcbiAgICAgICAgaWYgKHBhcmFtcy5oYXNBeGVzKSB7XG4gICAgICAgICAgICBheGVzTGFiZWxJbmZvID0gcGFyYW1zLmF4ZXNMYWJlbEluZm87XG4gICAgICAgICAgICBjaGFydFR5cGUgPSBwYXJhbXMub3B0aW9uQ2hhcnRUeXBlcyAmJiBwYXJhbXMub3B0aW9uQ2hhcnRUeXBlc1swXSB8fCAnJztcbiAgICAgICAgICAgIHlBeGlzV2lkdGggPSB0aGlzLl9nZXRZQXhpc1dpZHRoKHBhcmFtcy5vcHRpb25zLnlBeGlzLCBheGVzTGFiZWxJbmZvLnlBeGlzLCBwYXJhbXMudGhlbWUueUF4aXNbY2hhcnRUeXBlXSB8fCBwYXJhbXMudGhlbWUueUF4aXMpO1xuICAgICAgICAgICAgeEF4aXNIZWlnaHQgPSB0aGlzLl9nZXRYQXhpc0hlaWdodChwYXJhbXMub3B0aW9ucy54QXhpcywgYXhlc0xhYmVsSW5mby54QXhpcywgcGFyYW1zLnRoZW1lLnhBeGlzKTtcbiAgICAgICAgICAgIHlyQXhpc1dpZHRoID0gdGhpcy5fZ2V0WVJBeGlzV2lkdGgoe1xuICAgICAgICAgICAgICAgIGNvbnZlcnRlZERhdGE6IHBhcmFtcy5jb252ZXJ0ZWREYXRhLFxuICAgICAgICAgICAgICAgIGNoYXJ0VHlwZXM6IHBhcmFtcy5vcHRpb25DaGFydFR5cGVzLFxuICAgICAgICAgICAgICAgIHRoZW1lOiBwYXJhbXMudGhlbWUueUF4aXMsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogcGFyYW1zLm9wdGlvbnMueUF4aXNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHlBeGlzOiB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IHlBeGlzV2lkdGhcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB5ckF4aXM6IHtcbiAgICAgICAgICAgICAgICB3aWR0aDogeXJBeGlzV2lkdGhcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB4QXhpczoge1xuICAgICAgICAgICAgICAgIGhlaWdodDogeEF4aXNIZWlnaHRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBsZWdlbmQgZGltZW5zaW9uLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Ym91bmRzTWFrZXJcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBqb2luTGVnZW5kTGFiZWxzIGxlZ2VuZCBsYWJlbHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gbGFiZWxUaGVtZSBsYWJlbCB0aGVtZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjaGFydFR5cGUgY2hhcnQgdHlwZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBzZXJpZXNPcHRpb24gc2VyaWVzIG9wdGlvblxuICAgICAqIEByZXR1cm5zIHt7d2lkdGg6IG51bWJlcn19IGxlZ2VuZCBkaW1lbnNpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlTGVnZW5kRGltZW5zaW9uOiBmdW5jdGlvbihqb2luTGVnZW5kTGFiZWxzLCBsYWJlbFRoZW1lLCBjaGFydFR5cGUsIHNlcmllc09wdGlvbikge1xuICAgICAgICB2YXIgbGVnZW5kV2lkdGggPSAwLFxuICAgICAgICAgICAgbGVnZW5kTGFiZWxzLCBtYXhMYWJlbFdpZHRoO1xuXG4gICAgICAgIHNlcmllc09wdGlvbiA9IHNlcmllc09wdGlvbiB8fCB7fTtcblxuICAgICAgICBpZiAoY2hhcnRUeXBlICE9PSBjaGFydENvbnN0LkNIQVJUX1RZUEVfUElFIHx8ICFzZXJpZXNPcHRpb24ubGVnZW5kVHlwZSkge1xuICAgICAgICAgICAgbGVnZW5kTGFiZWxzID0gdHVpLnV0aWwubWFwKGpvaW5MZWdlbmRMYWJlbHMsIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaXRlbS5sYWJlbDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbWF4TGFiZWxXaWR0aCA9IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbHNNYXhXaWR0aChsZWdlbmRMYWJlbHMsIGxhYmVsVGhlbWUpO1xuICAgICAgICAgICAgbGVnZW5kV2lkdGggPSBtYXhMYWJlbFdpZHRoICsgY2hhcnRDb25zdC5MRUdFTkRfUkVDVF9XSURUSCArXG4gICAgICAgICAgICAgICAgY2hhcnRDb25zdC5MRUdFTkRfTEFCRUxfTEVGVF9QQURESU5HICsgKGNoYXJ0Q29uc3QuTEVHRU5EX0FSRUFfUEFERElORyAqIDIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHdpZHRoOiBsZWdlbmRXaWR0aFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHNlcmllcyBkaW1lbnNpb24uXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpib3VuZHNNYWtlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBwYXJhbXMuY2hhcnREaW1lbnNpb24gY2hhcnQgZGltZW5zaW9uXG4gICAgICogICAgICBAcGFyYW0ge3tcbiAgICAgKiAgICAgICAgICB5QXhpczoge3dpZHRoOiBudW1iZXIsIGhlaWdodDpudW1iZXJ9LFxuICAgICAqICAgICAgICAgIHhBeGlzOiB7d2lkdGg6IG51bWJlciwgaGVpZ2h0Om51bWJlcn0sXG4gICAgICogICAgICAgICAgeXJBeGlzOiB7d2lkdGg6IG51bWJlciwgaGVpZ2h0Om51bWJlcn1cbiAgICAgKiAgICAgIH19IHBhcmFtcy5heGVzRGltZW5zaW9uIGF4ZXMgZGltZW5zaW9uXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmxlZ2VuZFdpZHRoIGxlZ2VuZCB3aWR0aFxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy50aXRsZUhlaWdodCB0aXRsZSBoZWlnaHRcbiAgICAgKiBAcmV0dXJucyB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gc2VyaWVzIGRpbWVuc2lvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VTZXJpZXNEaW1lbnNpb246IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgYXhlc0RpbWVuc2lvbiA9IHBhcmFtcy5heGVzRGltZW5zaW9uLFxuICAgICAgICAgICAgcmlnaHRBcmVhV2lkdGggPSBwYXJhbXMubGVnZW5kV2lkdGggKyBheGVzRGltZW5zaW9uLnlyQXhpcy53aWR0aCxcbiAgICAgICAgICAgIHdpZHRoID0gcGFyYW1zLmNoYXJ0RGltZW5zaW9uLndpZHRoIC0gKGNoYXJ0Q29uc3QuQ0hBUlRfUEFERElORyAqIDIpIC0gYXhlc0RpbWVuc2lvbi55QXhpcy53aWR0aCAtIHJpZ2h0QXJlYVdpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0ID0gcGFyYW1zLmNoYXJ0RGltZW5zaW9uLmhlaWdodCAtIChjaGFydENvbnN0LkNIQVJUX1BBRERJTkcgKiAyKSAtIHBhcmFtcy50aXRsZUhlaWdodCAtIGF4ZXNEaW1lbnNpb24ueEF4aXMuaGVpZ2h0O1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB3aWR0aDogd2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IGhlaWdodFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGNoYXJ0IGRpbWVuc2lvbi5cbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGNoYXJ0T3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogQHJldHVybnMge3t3aWR0aDogKG51bWJlciksIGhlaWdodDogKG51bWJlcil9fSBjaGFydCBkaW1lbnNpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQ2hhcnREaW1lbnNpb246IGZ1bmN0aW9uKGNoYXJ0T3B0aW9ucykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgd2lkdGg6IGNoYXJ0T3B0aW9ucy53aWR0aCB8fCBjaGFydENvbnN0LkNIQVJUX0RFRkFVTFRfV0lEVEgsXG4gICAgICAgICAgICBoZWlnaHQ6IGNoYXJ0T3B0aW9ucy5oZWlnaHQgfHwgY2hhcnRDb25zdC5DSEFSVF9ERUZBVUxUX0hFSUdIVFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHRpdGxlIGRpbWVuc2lvblxuICAgICAqIEBwYXJhbSB7e3RpdGxlOiBzdHJpbmd9fSBvcHRpb24gdGl0bGUgb3B0aW9uXG4gICAgICogQHBhcmFtIHt7Zm9udEZhbWlseTogc3RyaW5nLCBmb250U2l6ZTogbnVtYmVyfX0gdGhlbWUgdGl0bGUgdGhlbWVcbiAgICAgKiBAcmV0dXJucyB7e2hlaWdodDogbnVtYmVyfX0gdGl0bGUgZGltZW5zaW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVRpdGxlRGltZW5zaW9uOiBmdW5jdGlvbihvcHRpb24sIHRoZW1lKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBoZWlnaHQ6IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodChvcHRpb24sIHRoZW1lKSArIGNoYXJ0Q29uc3QuVElUTEVfUEFERElOR1xuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHBsb3QgZGltZW50aW9uXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBzZXJpZXNEaW1lbnNpb24gc2VyaWVzIGRpbWVuc2lvblxuICAgICAqIEByZXR1cm5zIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBwbG90IGRpbWVuc2lvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VQbG90RGltZW5zaW9uOiBmdW5jdGlvbihzZXJpZXNEaW1lbnNpb24pIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHdpZHRoOiBzZXJpZXNEaW1lbnNpb24ud2lkdGggKyBjaGFydENvbnN0LkhJRERFTl9XSURUSCxcbiAgICAgICAgICAgIGhlaWdodDogc2VyaWVzRGltZW5zaW9uLmhlaWdodCArIGNoYXJ0Q29uc3QuSElEREVOX1dJRFRIXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjb21wb25lbnRzIGRpbWVuc2lvblxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Ym91bmRzTWFrZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuY29udmVydGVkRGF0YSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBjaGFydCB0aGVtZVxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaXNWZXJ0aWNhbCB3aGV0aGVyIHZlcnRpY2FsIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5vcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuYXhlc0xhYmVsSW5mbyBheGVzIGxhYmVsIGluZm9cbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBjb21wb25lbnRzIGRpbWVuc2lvbnNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRDb21wb25lbnRzRGltZW5zaW9uczogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBjaGFydE9wdGlvbnMgPSBwYXJhbXMub3B0aW9ucy5jaGFydCB8fCB7fSxcbiAgICAgICAgICAgIGNoYXJ0RGltZW5zaW9uID0gdGhpcy5fbWFrZUNoYXJ0RGltZW5zaW9uKGNoYXJ0T3B0aW9ucyksXG4gICAgICAgICAgICB0aXRsZURpbWVuc2lvbiA9IHRoaXMuX21ha2VUaXRsZURpbWVuc2lvbihjaGFydE9wdGlvbnMudGl0bGUsIHBhcmFtcy50aGVtZS50aXRsZSksXG4gICAgICAgICAgICBheGVzRGltZW5zaW9uID0gdGhpcy5fbWFrZUF4ZXNEaW1lbnNpb24ocGFyYW1zKSxcbiAgICAgICAgICAgIGxlZ2VuZERpbWVuc2lvbiA9IHRoaXMuX21ha2VMZWdlbmREaW1lbnNpb24ocGFyYW1zLmNvbnZlcnRlZERhdGEuam9pbkxlZ2VuZExhYmVscywgcGFyYW1zLnRoZW1lLmxlZ2VuZC5sYWJlbCwgcGFyYW1zLmNoYXJ0VHlwZSwgcGFyYW1zLm9wdGlvbnMuc2VyaWVzKSxcbiAgICAgICAgICAgIHNlcmllc0RpbWVuc2lvbiA9IHRoaXMuX21ha2VTZXJpZXNEaW1lbnNpb24oe1xuICAgICAgICAgICAgICAgIGNoYXJ0RGltZW5zaW9uOiBjaGFydERpbWVuc2lvbixcbiAgICAgICAgICAgICAgICBheGVzRGltZW5zaW9uOiBheGVzRGltZW5zaW9uLFxuICAgICAgICAgICAgICAgIGxlZ2VuZFdpZHRoOiBsZWdlbmREaW1lbnNpb24ud2lkdGgsXG4gICAgICAgICAgICAgICAgdGl0bGVIZWlnaHQ6IHRpdGxlRGltZW5zaW9uLmhlaWdodFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHR1aS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICBjaGFydDogY2hhcnREaW1lbnNpb24sXG4gICAgICAgICAgICB0aXRsZTogdGl0bGVEaW1lbnNpb24sXG4gICAgICAgICAgICBzZXJpZXM6IHNlcmllc0RpbWVuc2lvbixcbiAgICAgICAgICAgIHBsb3Q6IHRoaXMuX21ha2VQbG90RGltZW5zaW9uKHNlcmllc0RpbWVuc2lvbiksXG4gICAgICAgICAgICBsZWdlbmQ6IGxlZ2VuZERpbWVuc2lvblxuICAgICAgICB9LCBheGVzRGltZW5zaW9uKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBiYXNpYyBib3VuZC5cbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGRpbWVuc2lvbiBzZXJpZXMgZGltZW5zaW9uLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB0b3AgdG9wXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGxlZnQgbGVmdFxuICAgICAqIEByZXR1cm5zIHt7ZGltZW5zaW9uOiB7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9LCBwb3NpdGlvbjoge3RvcDogbnVtYmVyLCBsZWZ0OiBudW1iZXJ9fX0gc2VyaWVzIGJvdW5kLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VCYXNpY0JvdW5kOiBmdW5jdGlvbihkaW1lbnNpb24sIHRvcCwgbGVmdCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGltZW5zaW9uOiBkaW1lbnNpb24sXG4gICAgICAgICAgICBwb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgIHRvcDogdG9wLFxuICAgICAgICAgICAgICAgIGxlZnQ6IGxlZnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSB5QXhpcyBib3VuZC5cbiAgICAgKiBAcGFyYW0ge3t5QXhpczoge3dpZHRoOiBudW1iZXJ9LCBwbG90OiB7aGVpZ2h0OiBudW1iZXJ9fX0gZGltZW5zaW9ucyBkaW1lbnNpb25zXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHRvcCB0b3BcbiAgICAgKiBAcmV0dXJucyB7e2RpbWVuc2lvbjoge3dpZHRoOiBudW1iZXIsIGhlaWdodDogKG51bWJlcil9LCBwb3NpdGlvbjoge3RvcDogbnVtYmVyLCBsZWZ0OiBudW1iZXJ9fX0geUF4aXMgYm91bmRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlWUF4aXNCb3VuZDogZnVuY3Rpb24oZGltZW5zaW9ucywgdG9wKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkaW1lbnNpb246IHtcbiAgICAgICAgICAgICAgICB3aWR0aDogZGltZW5zaW9ucy55QXhpcy53aWR0aCxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IGRpbWVuc2lvbnMucGxvdC5oZWlnaHRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgIHRvcDogdG9wLFxuICAgICAgICAgICAgICAgIGxlZnQ6IHRoaXMuY2hhcnRMZWZ0UGFkZGluZ1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHhBeGlzIGJvdW5kLlxuICAgICAqIEBwYXJhbSB7e3hBeGlzOiB7aGVpZ2h0OiBudW1iZXJ9LCBwbG90OiB7d2lkdGg6IG51bWJlcn19fSBkaW1lbnNpb25zIGRpbWVuc2lvbnNcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdG9wIHRvcFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBsZWZ0IGxlZnRcbiAgICAgKiBAcGFyYW0ge3tkZWdyZWU6IG51bWJlcn19IHJvdGF0aW9uSW5mbyByb3RhdGlvbiBpbmZvXG4gICAgICogQHJldHVybnMge3tkaW1lbnNpb246IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IChudW1iZXIpfSwgcG9zaXRpb246IHt0b3A6IG51bWJlciwgbGVmdDogbnVtYmVyfX19IHhBeGlzIGJvdW5kXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVhBeGlzQm91bmQ6IGZ1bmN0aW9uKGRpbWVuc2lvbnMsIHRvcCwgbGVmdCwgcm90YXRpb25JbmZvKSB7XG4gICAgICAgIHZhciBib3VuZCA9IHtcbiAgICAgICAgICAgIGRpbWVuc2lvbjoge1xuICAgICAgICAgICAgICAgIHdpZHRoOiBkaW1lbnNpb25zLnBsb3Qud2lkdGgsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBkaW1lbnNpb25zLnhBeGlzLmhlaWdodFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgdG9wOiB0b3AgKyBkaW1lbnNpb25zLnNlcmllcy5oZWlnaHQsXG4gICAgICAgICAgICAgICAgbGVmdDogbGVmdCAtIGNoYXJ0Q29uc3QuSElEREVOX1dJRFRIXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHJvdGF0aW9uSW5mbykge1xuICAgICAgICAgICAgYm91bmQuZGVncmVlID0gcm90YXRpb25JbmZvLmRlZ3JlZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBib3VuZDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSB5ckF4aXMgYm91bmQuXG4gICAgICogQHBhcmFtIHt7eXJBeGlzOiB7d2lkdGg6IG51bWJlcn0sIHBsb3Q6IHtoZWlnaHQ6IG51bWJlcn0sIGxlZ2VuZDoge3dpZHRoOiBudW1iZXJ9fX0gZGltZW5zaW9ucyBkaW1lbnNpb25zXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHRvcCB0b3BcbiAgICAgKiBAcmV0dXJucyB7e2RpbWVuc2lvbjoge3dpZHRoOiBudW1iZXIsIGhlaWdodDogKG51bWJlcil9LCBwb3NpdGlvbjoge3RvcDogbnVtYmVyLCBsZWZ0OiBudW1iZXJ9fX0geXJBeGlzIGJvdW5kXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVlSQXhpc0JvdW5kOiBmdW5jdGlvbihkaW1lbnNpb25zLCB0b3ApIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRpbWVuc2lvbjoge1xuICAgICAgICAgICAgICAgIHdpZHRoOiBkaW1lbnNpb25zLnlyQXhpcy53aWR0aCxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IGRpbWVuc2lvbnMucGxvdC5oZWlnaHRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgIHRvcDogdG9wLFxuICAgICAgICAgICAgICAgIHJpZ2h0OiBkaW1lbnNpb25zLmxlZ2VuZC53aWR0aCArIGNoYXJ0Q29uc3QuSElEREVOX1dJRFRIICsgY2hhcnRDb25zdC5DSEFSVF9QQURESU5HXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYXhlcyBib3VuZHMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpib3VuZHNNYWtlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaGFzQXhlcyB3aGV0aGVyIGhhcyBheGVkIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48c3RyaW5nPn0gcGFyYW1zLm9wdGlvbkNoYXJ0VHlwZXMgeSBheGlzIGNoYXJ0IHR5cGVzXG4gICAgICogICAgICBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IHBhcmFtcy5kaW1lbnNpb24gY2hhcnQgZGltZW5zaW9uXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnRvcCB0b3AgcG9zaXRpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMucmlnaHQgcmlnaHQgcG9zaXRpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7e2RlZ3JlZTogbnVtYmVyfX0gcGFyYW1zLnJvdGF0aW9uSW5mbyByb3RhdGlvbiBpbmZvXG4gICAgICogQHJldHVybnMge29iamVjdH0gYXhlcyBib3VuZHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQXhlc0JvdW5kczogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBib3VuZHM7XG5cbiAgICAgICAgLy8gcGll7LCo7Yq47JmAIOqwmeydtCBheGlzIOyYgeyXreydtCDtlYTsmpQg7JeG64qUIOqyveyasOyXkOuKlCDruYgg6rCS7J2EIOuwmO2ZmCDtlahcbiAgICAgICAgaWYgKCFwYXJhbXMuaGFzQXhlcykge1xuICAgICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICB9XG5cbiAgICAgICAgYm91bmRzID0ge1xuICAgICAgICAgICAgcGxvdDogdGhpcy5fbWFrZUJhc2ljQm91bmQocGFyYW1zLmRpbWVuc2lvbnMucGxvdCwgcGFyYW1zLnRvcCwgcGFyYW1zLmxlZnQgLSBjaGFydENvbnN0LkhJRERFTl9XSURUSCksXG4gICAgICAgICAgICB5QXhpczogdGhpcy5fbWFrZVlBeGlzQm91bmQocGFyYW1zLmRpbWVuc2lvbnMsIHBhcmFtcy50b3ApLFxuICAgICAgICAgICAgeEF4aXM6IHRoaXMuX21ha2VYQXhpc0JvdW5kKHBhcmFtcy5kaW1lbnNpb25zLCBwYXJhbXMudG9wLCBwYXJhbXMubGVmdCwgcGFyYW1zLnJvdGF0aW9uSW5mbylcbiAgICAgICAgfTtcblxuICAgICAgICAvLyDsmrDsuKEgeSBheGlzIOyYgeyXrSBib3VuZHMg7KCV67O0IOy2lOqwgFxuICAgICAgICBpZiAocGFyYW1zLm9wdGlvbkNoYXJ0VHlwZXMgJiYgcGFyYW1zLm9wdGlvbkNoYXJ0VHlwZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBib3VuZHMueXJBeGlzID0gdGhpcy5fbWFrZVlSQXhpc0JvdW5kKHBhcmFtcy5kaW1lbnNpb25zLCBwYXJhbXMudG9wKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBib3VuZHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgY2hhcnQgYm91bmQuXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBkaW1lbnNpb24gY2hhcnQgZGltZW5zaW9uLlxuICAgICAqIEByZXR1cm5zIHt7ZGltZW5zaW9uOiB7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fX0gY2hhcnQgYm91bmRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQ2hhcnRCb3VuZDogZnVuY3Rpb24oZGltZW5zaW9uKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkaW1lbnNpb246IGRpbWVuc2lvblxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGxlZ2VuZCBib3VuZC5cbiAgICAgKiBAcGFyYW0ge3t0aXRsZToge2hlaWdodDogbnVtYmVyfSwgc2VyaWVzOiB7d2lkdGg6IG51bWJlcn0sIHlyQXhpczoge3dpZHRoOiBudW1iZXJ9fX0gZGltZW5zaW9ucyBkaW1lbnNpb25zXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHlBeGlzV2lkdGggeUF4aXMgd2lkdGhcbiAgICAgKiBAcmV0dXJucyB7e3Bvc2l0aW9uOiB7dG9wOiBudW1iZXIsIGxlZnQ6IG51bWJlcn19fSBsZWdlbmQgYm91bmRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlTGVnZW5kQm91bmQ6IGZ1bmN0aW9uKGRpbWVuc2lvbnMpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgdG9wOiBkaW1lbnNpb25zLnRpdGxlLmhlaWdodCxcbiAgICAgICAgICAgICAgICBsZWZ0OiBkaW1lbnNpb25zLnlBeGlzLndpZHRoICsgZGltZW5zaW9ucy5zZXJpZXMud2lkdGggKyBkaW1lbnNpb25zLnlyQXhpcy53aWR0aCArIHRoaXMuY2hhcnRMZWZ0UGFkZGluZ1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGF4ZXMgbGFiZWwgaW5mby5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gcGFyYW1zLmhhc0F4ZXMgd2hldGhlciBoYXMgYXhlcyBvciBub3RcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXl9IHBhcmFtcy5vcHRpb25DaGFydFR5cGVzIGNoYXJ0IHR5cGVzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gY29udmVydGVkRGF0YSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBpc1ZlcnRpY2FsIHdoZXRoZXIgdmVydGljYWwgb3Igbm90XG4gICAgICogQHJldHVybnMge3t4QXhpczogYXJyYXksIHlBeGlzOiBhcnJheX19IGxhYmVsIGluZm9cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQXhlc0xhYmVsSW5mbzogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBjaGFydFR5cGUsIG1heFZhbHVlTGFiZWwsIHlMYWJlbHMsIHhMYWJlbHM7XG5cbiAgICAgICAgaWYgKCFwYXJhbXMuaGFzQXhlcykge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBjaGFydFR5cGUgPSBwYXJhbXMub3B0aW9uQ2hhcnRUeXBlcyAmJiBwYXJhbXMub3B0aW9uQ2hhcnRUeXBlc1swXSB8fCAnJztcblxuICAgICAgICAvLyB2YWx1ZSDspJEg6rCA7J6lIO2BsCDqsJLsnYQg7LaU7Lac7ZWY7JesIHZhbHVlIGxhYmVs66GcIOyngOyglSAobGFibGUg64SI67mEIOyytO2BrCDsi5wg7IKs7JqpKVxuICAgICAgICBtYXhWYWx1ZUxhYmVsID0gdGhpcy5fZ2V0VmFsdWVBeGlzTWF4TGFiZWwocGFyYW1zLmNvbnZlcnRlZERhdGEsIGNoYXJ0VHlwZSk7XG5cbiAgICAgICAgLy8g7IS466Gc7Ji17IWY7JeQIOuUsOudvOyEnCB47LaV6rO8IHnstpXsl5Ag7KCB7Jqp7ZWgIOugiOydtOu4lCDsoJXrs7Qg7KeA7KCVXG4gICAgICAgIGlmIChwYXJhbXMuaXNWZXJ0aWNhbCkge1xuICAgICAgICAgICAgeUxhYmVscyA9IFttYXhWYWx1ZUxhYmVsXTtcbiAgICAgICAgICAgIHhMYWJlbHMgPSBwYXJhbXMuY29udmVydGVkRGF0YS5sYWJlbHM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB5TGFiZWxzID0gcGFyYW1zLmNvbnZlcnRlZERhdGEubGFiZWxzO1xuICAgICAgICAgICAgeExhYmVscyA9IFttYXhWYWx1ZUxhYmVsXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4QXhpczogeExhYmVscyxcbiAgICAgICAgICAgIHlBeGlzOiB5TGFiZWxzXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZpbmQgcm90YXRpb24gZGVncmVlLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBsaW1pdFdpZHRoIGxpbWl0IHdpZHRoXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGxhYmVsV2lkdGggbGFiZWwgd2lkdGhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbGFiZWxIZWlnaHQgbGFiZWwgaGVpZ2h0XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IGNhbmRpZGF0ZXMgaW5kZXhcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSByb3RhdGlvbiBkZWdyZWVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9maW5kUm90YXRpb25EZWdyZWU6IGZ1bmN0aW9uKGxpbWl0V2lkdGgsIGxhYmVsV2lkdGgsIGxhYmVsSGVpZ2h0KSB7XG4gICAgICAgIHZhciBmb3VuZERlZ3JlZSxcbiAgICAgICAgICAgIGhhbGZXaWR0aCA9IGxhYmVsV2lkdGggLyAyLFxuICAgICAgICAgICAgaGFsZkhlaWdodCA9IGxhYmVsSGVpZ2h0IC8gMjtcblxuICAgICAgICB0dWkudXRpbC5mb3JFYWNoQXJyYXkoY2hhcnRDb25zdC5ERUdSRUVfQ0FORElEQVRFUywgZnVuY3Rpb24oZGVncmVlKSB7XG4gICAgICAgICAgICB2YXIgY29tcGFyZVdpZHRoID0gKGNhbGN1bGF0b3IuY2FsY3VsYXRlQWRqYWNlbnQoZGVncmVlLCBoYWxmV2lkdGgpICsgY2FsY3VsYXRvci5jYWxjdWxhdGVBZGphY2VudChjaGFydENvbnN0LkFOR0xFXzkwIC0gZGVncmVlLCBoYWxmSGVpZ2h0KSkgKiAyO1xuICAgICAgICAgICAgZm91bmREZWdyZWUgPSBkZWdyZWU7XG4gICAgICAgICAgICBpZiAoY29tcGFyZVdpZHRoIDw9IGxpbWl0V2lkdGggKyBjaGFydENvbnN0LlhBWElTX0xBQkVMX0NPTVBBUkVfTUFSR0lOKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gZm91bmREZWdyZWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2Ugcm90YXRpb24gaW5mbyBhYm91dCBob3Jpem9udGFsIGxhYmVsLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzZXJpZXNXaWR0aCBzZXJpZXMgYXJlYSB3aWR0aFxuICAgICAqIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGxhYmVscyBheGlzIGxhYmVsc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBheGlzIGxhYmVsIHRoZW1lXG4gICAgICogQHJldHVybnMgez9vYmplY3R9IHJvdGF0aW9uIGluZm9cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlSG9yaXpvbnRhbExhYmVsUm90YXRpb25JbmZvOiBmdW5jdGlvbihzZXJpZXNXaWR0aCwgbGFiZWxzLCB0aGVtZSkge1xuICAgICAgICB2YXIgbWF4TGFiZWxXaWR0aCA9IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbHNNYXhXaWR0aChsYWJlbHMsIHRoZW1lKSxcbiAgICAgICAgICAgIGxpbWl0V2lkdGggPSBzZXJpZXNXaWR0aCAvIGxhYmVscy5sZW5ndGggLSBjaGFydENvbnN0LlhBWElTX0xBQkVMX0dVVFRFUixcbiAgICAgICAgICAgIGRlZ3JlZSwgbGFiZWxIZWlnaHQ7XG5cbiAgICAgICAgaWYgKG1heExhYmVsV2lkdGggPD0gbGltaXRXaWR0aCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBsYWJlbEhlaWdodCA9IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbHNNYXhIZWlnaHQobGFiZWxzLCB0aGVtZSk7XG4gICAgICAgIGRlZ3JlZSA9IHRoaXMuX2ZpbmRSb3RhdGlvbkRlZ3JlZShsaW1pdFdpZHRoLCBtYXhMYWJlbFdpZHRoLCBsYWJlbEhlaWdodCk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG1heExhYmVsV2lkdGg6IG1heExhYmVsV2lkdGgsXG4gICAgICAgICAgICBsYWJlbEhlaWdodDogbGFiZWxIZWlnaHQsXG4gICAgICAgICAgICBkZWdyZWU6IGRlZ3JlZVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBjYWxjdWxhdGUgb3ZlcmZsb3cgcG9zaXRpb24gbGVmdC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0geUF4aXNXaWR0aCB5QXhpcyB3aWR0aFxuICAgICAqIEBwYXJhbSB7e2RlZ3JlZTogbnVtYmVyLCBsYWJlbEhlaWdodDogbnVtYmVyfX0gcm90YXRpb25JbmZvIHJvdGF0aW9uIGluZm9cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZmlyc3RMYWJlbCBmaXJzdExhYmVsXG4gICAgICogQHBhcmFtIHtvYmVqY3R9IHRoZW1lIGxhYmVsIHRoZW1lXG4gICAgICogQHJldHVybnMge251bWJlcn0gb3ZlcmZsb3cgcG9zaXRpb24gbGVmdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NhbGN1bGF0ZU92ZXJmbG93TGVmdDogZnVuY3Rpb24oeUF4aXNXaWR0aCwgcm90YXRpb25JbmZvLCBmaXJzdExhYmVsLCB0aGVtZSkge1xuICAgICAgICB2YXIgZGVncmVlID0gcm90YXRpb25JbmZvLmRlZ3JlZSxcbiAgICAgICAgICAgIGxhYmVsSGVpZ2h0ID0gcm90YXRpb25JbmZvLmxhYmVsSGVpZ2h0LFxuICAgICAgICAgICAgZmlyc3RMYWJlbFdpZHRoID0gcmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsV2lkdGgoZmlyc3RMYWJlbCwgdGhlbWUpLFxuICAgICAgICAgICAgbmV3TGFiZWxXaWR0aCA9IChjYWxjdWxhdG9yLmNhbGN1bGF0ZUFkamFjZW50KGRlZ3JlZSwgZmlyc3RMYWJlbFdpZHRoIC8gMikgKyBjYWxjdWxhdG9yLmNhbGN1bGF0ZUFkamFjZW50KGNoYXJ0Q29uc3QuQU5HTEVfOTAgLSBkZWdyZWUsIGxhYmVsSGVpZ2h0IC8gMikpICogMixcbiAgICAgICAgICAgIGRpZmZMZWZ0ID0gbmV3TGFiZWxXaWR0aCAtIHlBeGlzV2lkdGg7XG4gICAgICAgIHJldHVybiBkaWZmTGVmdDtcbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICAgKiBUbyBjYWxjdWxhdGUgaGVpZ2h0IG9mIHhBeGlzLlxuICAgICAqIEBwYXJhbSB7e2RlZ3JlZTogbnVtYmVyLCBtYXhMYWJlbFdpZHRoOiBudW1iZXIsIGxhYmVsSGVpZ2h0OiBudW1iZXJ9fSByb3RhdGlvbkluZm8gcm90YXRpb24gaW5mb1xuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IHhBeGlzIGhlaWdodFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NhbGN1bGF0ZVhBeGlzSGVpZ2h0OiBmdW5jdGlvbihyb3RhdGlvbkluZm8pIHtcbiAgICAgICAgdmFyIGRlZ3JlZSA9IHJvdGF0aW9uSW5mby5kZWdyZWUsXG4gICAgICAgICAgICBtYXhMYWJlbFdpZHRoID0gcm90YXRpb25JbmZvLm1heExhYmVsV2lkdGgsXG4gICAgICAgICAgICBsYWJlbEhlaWdodCA9IHJvdGF0aW9uSW5mby5sYWJlbEhlaWdodCxcbiAgICAgICAgICAgIGF4aXNIZWlnaHQgPSAoY2FsY3VsYXRvci5jYWxjdWxhdGVPcHBvc2l0ZShkZWdyZWUsIG1heExhYmVsV2lkdGggLyAyKSArIGNhbGN1bGF0b3IuY2FsY3VsYXRlT3Bwb3NpdGUoY2hhcnRDb25zdC5BTkdMRV85MCAtIGRlZ3JlZSwgbGFiZWxIZWlnaHQgLyAyKSkgKiAyO1xuICAgICAgICByZXR1cm4gYXhpc0hlaWdodDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gY2FsY3VsYXRlIGhlaWdodCBkaWZmZXJlbmNlIGJldHdlZW4gb3JpZ2luIGxhYmVsIGFuZCByb3RhdGlvbiBsYWJlbC5cbiAgICAgKiBAcGFyYW0ge3tkZWdyZWU6IG51bWJlciwgbWF4TGFiZWxXaWR0aDogbnVtYmVyLCBsYWJlbEhlaWdodDogbnVtYmVyfX0gcm90YXRpb25JbmZvIHJvdGF0aW9uIGluZm9cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBoZWlnaHQgZGlmZmVyZW5jZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NhbGN1bGF0ZUhlaWdodERpZmZlcmVuY2U6IGZ1bmN0aW9uKHJvdGF0aW9uSW5mbykge1xuICAgICAgICB2YXIgeEF4aXNIZWlnaHQgPSB0aGlzLl9jYWxjdWxhdGVYQXhpc0hlaWdodChyb3RhdGlvbkluZm8pO1xuICAgICAgICByZXR1cm4geEF4aXNIZWlnaHQgLSByb3RhdGlvbkluZm8ubGFiZWxIZWlnaHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZSBkZWdyZWUgb2Ygcm90YXRpb25JbmZvLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzZXJpZXNXaWR0aCBzZXJpZXMgd2lkdGhcbiAgICAgKiBAcGFyYW0ge3tkZWdyZWU6IG51bWJlciwgbWF4TGFiZWxXaWR0aDogbnVtYmVyLCBsYWJlbEhlaWdodDogbnVtYmVyfX0gcm90YXRpb25JbmZvIHJvdGF0aW9uIGluZm9cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbGFiZWxMZW5ndGggbGFiZWxMZW5ndGhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gb3ZlcmZsb3dMZWZ0IG92ZXJmbG93IGxlZnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF91cGRhdGVEZWdyZWU6IGZ1bmN0aW9uKHNlcmllc1dpZHRoLCByb3RhdGlvbkluZm8sIGxhYmVsTGVuZ3RoLCBvdmVyZmxvd0xlZnQpIHtcbiAgICAgICAgdmFyIGxpbWl0V2lkdGgsIG5ld0RlZ3JlZTtcbiAgICAgICAgaWYgKG92ZXJmbG93TGVmdCA+IDApIHtcbiAgICAgICAgICAgIGxpbWl0V2lkdGggPSBzZXJpZXNXaWR0aCAvIGxhYmVsTGVuZ3RoICsgY2hhcnRDb25zdC5YQVhJU19MQUJFTF9HVVRURVI7XG4gICAgICAgICAgICBuZXdEZWdyZWUgPSB0aGlzLl9maW5kUm90YXRpb25EZWdyZWUobGltaXRXaWR0aCwgcm90YXRpb25JbmZvLm1heExhYmVsV2lkdGgsIHJvdGF0aW9uSW5mby5sYWJlbEhlaWdodCk7XG4gICAgICAgICAgICByb3RhdGlvbkluZm8uZGVncmVlID0gbmV3RGVncmVlO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZSB3aWR0aCBvZiBkaW1lbnRpb3MuXG4gICAgICogQHBhcmFtIHt7cGxvdDoge3dpZHRoOiBudW1iZXJ9LCBzZXJpZXM6IHt3aWR0aDogbnVtYmVyfSwgeEF4aXM6IHt3aWR0aDogbnVtYmVyfX19IGRpbWVuc2lvbnMgZGltZW5zaW9uc1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBvdmVyZmxvd0xlZnQgb3ZlcmZsb3cgbGVmdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3VwZGF0ZURpbWVuc2lvbnNXaWR0aDogZnVuY3Rpb24oZGltZW5zaW9ucywgb3ZlcmZsb3dMZWZ0KSB7XG4gICAgICAgIGlmIChvdmVyZmxvd0xlZnQgPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmNoYXJ0TGVmdFBhZGRpbmcgKz0gb3ZlcmZsb3dMZWZ0O1xuICAgICAgICAgICAgZGltZW5zaW9ucy5wbG90LndpZHRoIC09IG92ZXJmbG93TGVmdDtcbiAgICAgICAgICAgIGRpbWVuc2lvbnMuc2VyaWVzLndpZHRoIC09IG92ZXJmbG93TGVmdDtcbiAgICAgICAgICAgIGRpbWVuc2lvbnMueEF4aXMud2lkdGggLT0gb3ZlcmZsb3dMZWZ0O1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZSBoZWlnaHQgb2YgZGltZW5zaW9ucy5cbiAgICAgKiBAcGFyYW0ge3twbG90OiB7aGVpZ2h0OiBudW1iZXJ9LCBzZXJpZXM6IHtoZWlnaHQ6IG51bWJlcn0sIHhBeGlzOiB7aGVpZ2h0OiBudW1iZXJ9fX0gZGltZW5zaW9ucyBkaW1lbnNpb25zXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGRpZmZIZWlnaHQgZGlmZiBoZWlnaHRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF91cGRhdGVEaW1lbnNpb25zSGVpZ2h0OiBmdW5jdGlvbihkaW1lbnNpb25zLCBkaWZmSGVpZ2h0KSB7XG4gICAgICAgIGRpbWVuc2lvbnMucGxvdC5oZWlnaHQgLT0gZGlmZkhlaWdodDtcbiAgICAgICAgZGltZW5zaW9ucy5zZXJpZXMuaGVpZ2h0IC09IGRpZmZIZWlnaHQ7XG4gICAgICAgIGRpbWVuc2lvbnMueEF4aXMuaGVpZ2h0ICs9IGRpZmZIZWlnaHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZSBkaW1lbnNpb25zIGFuZCBkZWdyZWUuXG4gICAgICogQHBhcmFtIHt7cGxvdDoge3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfSwgc2VyaWVzOiB7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9LCB4QXhpczoge3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX19IGRpbWVuc2lvbnMgZGltZW5zaW9uc1xuICAgICAqIEBwYXJhbSB7e2RlZ3JlZTogbnVtYmVyLCBtYXhMYWJlbFdpZHRoOiBudW1iZXIsIGxhYmVsSGVpZ2h0OiBudW1iZXJ9fSByb3RhdGlvbkluZm8gcm90YXRpb24gaW5mb1xuICAgICAqIEBwYXJhbSB7YXJyYXl9IGxhYmVscyBsYWJlbHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgdGhlbWVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF91cGRhdGVEaW1lbnNpb25zQW5kRGVncmVlOiBmdW5jdGlvbihkaW1lbnNpb25zLCByb3RhdGlvbkluZm8sIGxhYmVscywgdGhlbWUpIHtcbiAgICAgICAgdmFyIG92ZXJmbG93TGVmdCwgZGlmZkhlaWdodDtcbiAgICAgICAgaWYgKCFyb3RhdGlvbkluZm8pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBvdmVyZmxvd0xlZnQgPSB0aGlzLl9jYWxjdWxhdGVPdmVyZmxvd0xlZnQoZGltZW5zaW9ucy55QXhpcy53aWR0aCwgcm90YXRpb25JbmZvLCBsYWJlbHNbMF0sIHRoZW1lKTtcbiAgICAgICAgdGhpcy5fdXBkYXRlRGltZW5zaW9uc1dpZHRoKGRpbWVuc2lvbnMsIG92ZXJmbG93TGVmdCk7XG4gICAgICAgIHRoaXMuX3VwZGF0ZURlZ3JlZShkaW1lbnNpb25zLnNlcmllcy53aWR0aCwgcm90YXRpb25JbmZvLCBsYWJlbHMubGVuZ3RoLCBvdmVyZmxvd0xlZnQpO1xuICAgICAgICBkaWZmSGVpZ2h0ID0gdGhpcy5fY2FsY3VsYXRlSGVpZ2h0RGlmZmVyZW5jZShyb3RhdGlvbkluZm8pO1xuICAgICAgICB0aGlzLl91cGRhdGVEaW1lbnNpb25zSGVpZ2h0KGRpbWVuc2lvbnMsIGRpZmZIZWlnaHQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGJvdW5kcyBhYm91dCBjaGFydCBjb21wb25lbnRzLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Ym91bmRzTWFrZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuY29udmVydGVkRGF0YSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBjaGFydCB0aGVtZVxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaXNWZXJ0aWNhbCB3aGV0aGVyIHZlcnRpY2FsIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5vcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gcGFyYW1zLmhhc0F4ZXMgd2hldGhlciBoYXMgYXhlcyBhcmVhIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHthcnJheX0gcGFyYW1zLm9wdGlvbkNoYXJ0VHlwZXMgeSBheGlzIG9wdGlvbiBjaGFydCB0eXBlc1xuICAgICAqIEByZXR1cm5zIHt7XG4gICAgICogICBwbG90OiB7XG4gICAgICogICAgIGRpbWVuc2lvbjoge3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfSxcbiAgICAgKiAgICAgcG9zaXRpb246IHt0b3A6IG51bWJlciwgcmlnaHQ6IG51bWJlcn1cbiAgICAgKiAgIH0sXG4gICAgICogICB5QXhpczoge1xuICAgICAqICAgICBkaW1lbnNpb246IHt3aWR0aDogKG51bWJlciksIGhlaWdodDogbnVtYmVyfSxcbiAgICAgKiAgICAgcG9zaXRpb246IHt0b3A6IG51bWJlcn1cbiAgICAgKiAgIH0sXG4gICAgICogICB4QXhpczoge1xuICAgICAqICAgICBkaW1lbnNpb246IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IChudW1iZXIpfSxcbiAgICAgKiAgICAgcG9zaXRpb246IHtyaWdodDogbnVtYmVyfVxuICAgICAqICAgfSxcbiAgICAgKiAgIHNlcmllczoge1xuICAgICAqICAgICBkaW1lbnNpb246IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn0sXG4gICAgICogICAgIHBvc2l0aW9uOiB7dG9wOiBudW1iZXIsIHJpZ2h0OiBudW1iZXJ9XG4gICAgICogICB9LFxuICAgICAqICAgbGVnZW5kOiB7XG4gICAgICogICAgIHBvc2l0aW9uOiB7dG9wOiBudW1iZXJ9XG4gICAgICogICB9LFxuICAgICAqICAgdG9vbHRpcDoge1xuICAgICAqICAgICBkaW1lbnNpb246IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn0sXG4gICAgICogICAgIHBvc2l0aW9uOiB7dG9wOiBudW1iZXIsIGxlZnQ6IG51bWJlcn1cbiAgICAgKiAgIH1cbiAgICAgKiB9fSBib3VuZHNcbiAgICAgKi9cbiAgICBtYWtlOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGF4ZXNMYWJlbEluZm8gPSB0aGlzLl9tYWtlQXhlc0xhYmVsSW5mbyhwYXJhbXMpLFxuICAgICAgICAgICAgZGltZW5zaW9ucyA9IHRoaXMuX2dldENvbXBvbmVudHNEaW1lbnNpb25zKHR1aS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgYXhlc0xhYmVsSW5mbzogYXhlc0xhYmVsSW5mb1xuICAgICAgICAgICAgfSwgcGFyYW1zKSksXG4gICAgICAgICAgICByb3RhdGlvbkluZm8sIHRvcCwgbGVmdCwgc2VyaWVzQm91bmQsIGF4ZXNCb3VuZHMsIGJvdW5kcztcblxuICAgICAgICB0aGlzLmNoYXJ0TGVmdFBhZGRpbmcgPSBjaGFydENvbnN0LkNIQVJUX1BBRERJTkc7XG4gICAgICAgIGlmIChwYXJhbXMuaGFzQXhlcykge1xuICAgICAgICAgICAgcm90YXRpb25JbmZvID0gdGhpcy5fbWFrZUhvcml6b250YWxMYWJlbFJvdGF0aW9uSW5mbyhkaW1lbnNpb25zLnNlcmllcy53aWR0aCwgYXhlc0xhYmVsSW5mby54QXhpcywgcGFyYW1zLnRoZW1lLmxhYmVsKTtcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZURpbWVuc2lvbnNBbmREZWdyZWUoZGltZW5zaW9ucywgcm90YXRpb25JbmZvLCBheGVzTGFiZWxJbmZvLnhBeGlzLCBwYXJhbXMudGhlbWUubGFiZWwpO1xuICAgICAgICB9XG5cbiAgICAgICAgdG9wID0gZGltZW5zaW9ucy50aXRsZS5oZWlnaHQgKyBjaGFydENvbnN0LkNIQVJUX1BBRERJTkc7XG4gICAgICAgIGxlZnQgPSBkaW1lbnNpb25zLnlBeGlzLndpZHRoICsgdGhpcy5jaGFydExlZnRQYWRkaW5nO1xuICAgICAgICBzZXJpZXNCb3VuZCA9IHRoaXMuX21ha2VCYXNpY0JvdW5kKGRpbWVuc2lvbnMuc2VyaWVzLCB0b3AsIGxlZnQpO1xuXG4gICAgICAgIGF4ZXNCb3VuZHMgPSB0aGlzLl9tYWtlQXhlc0JvdW5kcyh7XG4gICAgICAgICAgICBoYXNBeGVzOiBwYXJhbXMuaGFzQXhlcyxcbiAgICAgICAgICAgIHJvdGF0aW9uSW5mbzogcm90YXRpb25JbmZvLFxuICAgICAgICAgICAgb3B0aW9uQ2hhcnRUeXBlczogcGFyYW1zLm9wdGlvbkNoYXJ0VHlwZXMsXG4gICAgICAgICAgICBkaW1lbnNpb25zOiBkaW1lbnNpb25zLFxuICAgICAgICAgICAgdG9wOiB0b3AsXG4gICAgICAgICAgICBsZWZ0OiBsZWZ0XG4gICAgICAgIH0pO1xuICAgICAgICBib3VuZHMgPSB0dWkudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgY2hhcnQ6IHRoaXMuX21ha2VDaGFydEJvdW5kKGRpbWVuc2lvbnMuY2hhcnQpLFxuICAgICAgICAgICAgc2VyaWVzOiBzZXJpZXNCb3VuZCxcbiAgICAgICAgICAgIGxlZ2VuZDogdGhpcy5fbWFrZUxlZ2VuZEJvdW5kKGRpbWVuc2lvbnMpLFxuICAgICAgICAgICAgdG9vbHRpcDogdGhpcy5fbWFrZUJhc2ljQm91bmQoZGltZW5zaW9ucy5zZXJpZXMsIHRvcCwgbGVmdCAtIGNoYXJ0Q29uc3QuU0VSSUVTX0VYUEFORF9TSVpFKSxcbiAgICAgICAgICAgIGV2ZW50SGFuZGxlTGF5ZXI6IHNlcmllc0JvdW5kXG4gICAgICAgIH0sIGF4ZXNCb3VuZHMpO1xuICAgICAgICByZXR1cm4gYm91bmRzO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gYm91bmRzTWFrZXI7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgY2FsY3VsYXRvci5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuLi9jb25zdCcpO1xuXG4vKipcbiAqIENhbGN1bGF0b3IuXG4gKiBAbW9kdWxlIGNhbGN1bGF0b3JcbiAqL1xudmFyIGNhbGN1bGF0b3IgPSB7XG4gICAgLyoqXG4gICAgICogVG8gY2FsY3VsYXRlIHNjYWxlIGZyb20gY2hhcnQgbWluLCBtYXggZGF0YS5cbiAgICAgKiAgLSBodHRwOi8vcGVsdGllcnRlY2guY29tL2hvdy1leGNlbC1jYWxjdWxhdGVzLWF1dG9tYXRpYy1jaGFydC1heGlzLWxpbWl0cy9cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmNhbGN1bGF0b3JcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWluIG1pbiBtaW5pbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtYXggbWF4IG1heGltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHRpY2tDb3VudCB0aWNrIGNvdW50XG4gICAgICogQHJldHVybnMge3ttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fSBzY2FsZSBheGlzIHNjYWxlXG4gICAgICovXG4gICAgY2FsY3VsYXRlU2NhbGU6IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XG4gICAgICAgIHZhciBzYXZlTWluID0gMCxcbiAgICAgICAgICAgIHNjYWxlID0ge30sXG4gICAgICAgICAgICBpb2RWYWx1ZTsgLy8gaW5jcmVhc2Ugb3IgZGVjcmVhc2UgdmFsdWU7XG5cbiAgICAgICAgaWYgKG1pbiA8IDApIHtcbiAgICAgICAgICAgIHNhdmVNaW4gPSBtaW47XG4gICAgICAgICAgICBtYXggLT0gbWluO1xuICAgICAgICAgICAgbWluID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlvZFZhbHVlID0gKG1heCAtIG1pbikgLyAyMDtcbiAgICAgICAgc2NhbGUubWF4ID0gbWF4ICsgaW9kVmFsdWUgKyBzYXZlTWluO1xuXG4gICAgICAgIGlmIChtYXggLyA2ID4gbWluKSB7XG4gICAgICAgICAgICBzY2FsZS5taW4gPSAwICsgc2F2ZU1pbjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNjYWxlLm1pbiA9IG1pbiAtIGlvZFZhbHVlICsgc2F2ZU1pbjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2NhbGU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG5vcm1hbGl6ZSBudW1iZXIuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpjYWxjdWxhdG9yXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIHRhcmdldCB2YWx1ZVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IG5vcm1hbGl6ZWQgbnVtYmVyXG4gICAgICovXG4gICAgbm9ybWFsaXplQXhpc051bWJlcjogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgdmFyIHN0YW5kYXJkID0gMCxcbiAgICAgICAgICAgIGZsYWcgPSAxLFxuICAgICAgICAgICAgbm9ybWFsaXplZCwgbW9kO1xuXG4gICAgICAgIGlmICh2YWx1ZSA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9IGVsc2UgaWYgKHZhbHVlIDwgMCkge1xuICAgICAgICAgICAgZmxhZyA9IC0xO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFsdWUgKj0gZmxhZztcblxuICAgICAgICB0dWkudXRpbC5mb3JFYWNoQXJyYXkoY2hhcnRDb25zdC5BWElTX1NUQU5EQVJEX01VTFRJUExFX05VTVMsIGZ1bmN0aW9uKG51bSkge1xuICAgICAgICAgICAgaWYgKHZhbHVlIDwgbnVtKSB7XG4gICAgICAgICAgICAgICAgaWYgKG51bSA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhbmRhcmQgPSBudW07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobnVtID09PSAxMCkge1xuICAgICAgICAgICAgICAgIHN0YW5kYXJkID0gMTA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChzdGFuZGFyZCA8IDEpIHtcbiAgICAgICAgICAgIG5vcm1hbGl6ZWQgPSB0aGlzLm5vcm1hbGl6ZUF4aXNOdW1iZXIodmFsdWUgKiAxMCkgKiAwLjE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtb2QgPSB0dWkudXRpbC5tb2QodmFsdWUsIHN0YW5kYXJkKTtcbiAgICAgICAgICAgIG5vcm1hbGl6ZWQgPSB0dWkudXRpbC5hZGRpdGlvbih2YWx1ZSwgKG1vZCA+IDAgPyBzdGFuZGFyZCAtIG1vZCA6IDApKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBub3JtYWxpemVkICo9IGZsYWc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgdGljayBwb3NpdGlvbnMgb2YgcGl4ZWwgdHlwZS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmNhbGN1bGF0b3JcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc2l6ZSBhcmVhIHdpZHRoIG9yIGhlaWdodFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjb3VudCB0aWNrIGNvdW50XG4gICAgICogQHJldHVybnMge2FycmF5LjxudW1iZXI+fSBwb3NpdGlvbnNcbiAgICAgKi9cbiAgICBtYWtlVGlja1BpeGVsUG9zaXRpb25zOiBmdW5jdGlvbihzaXplLCBjb3VudCkge1xuICAgICAgICB2YXIgcG9zaXRpb25zID0gW10sXG4gICAgICAgICAgICBweFNjYWxlLCBweFN0ZXA7XG5cbiAgICAgICAgaWYgKGNvdW50ID4gMCkge1xuICAgICAgICAgICAgcHhTY2FsZSA9IHttaW46IDAsIG1heDogc2l6ZSAtIDF9O1xuICAgICAgICAgICAgcHhTdGVwID0gdGhpcy5nZXRTY2FsZVN0ZXAocHhTY2FsZSwgY291bnQpO1xuICAgICAgICAgICAgcG9zaXRpb25zID0gdHVpLnV0aWwubWFwKHR1aS51dGlsLnJhbmdlKDAsIHNpemUsIHB4U3RlcCksIGZ1bmN0aW9uKHBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdGgucm91bmQocG9zaXRpb24pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBwb3NpdGlvbnNbcG9zaXRpb25zLmxlbmd0aCAtIDFdID0gc2l6ZSAtIDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBvc2l0aW9ucztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBsYWJlbHMgZnJvbSBzY2FsZS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmNhbGN1bGF0b3JcbiAgICAgKiBAcGFyYW0ge3ttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fSBzY2FsZSBheGlzIHNjYWxlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHN0ZXAgc3RlcCBiZXR3ZWVuIG1heCBhbmQgbWluXG4gICAgICogQHJldHVybnMge3N0cmluZ1tdfSBsYWJlbHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIG1ha2VMYWJlbHNGcm9tU2NhbGU6IGZ1bmN0aW9uKHNjYWxlLCBzdGVwKSB7XG4gICAgICAgIHZhciBtdWx0aXBsZU51bSA9IHR1aS51dGlsLmZpbmRNdWx0aXBsZU51bShzdGVwKSxcbiAgICAgICAgICAgIG1pbiA9IHNjYWxlLm1pbiAqIG11bHRpcGxlTnVtLFxuICAgICAgICAgICAgbWF4ID0gc2NhbGUubWF4ICogbXVsdGlwbGVOdW0sXG4gICAgICAgICAgICBsYWJlbHMgPSB0dWkudXRpbC5yYW5nZShtaW4sIG1heCArIDEsIHN0ZXAgKiBtdWx0aXBsZU51bSk7XG4gICAgICAgIGxhYmVscyA9IHR1aS51dGlsLm1hcChsYWJlbHMsIGZ1bmN0aW9uKGxhYmVsKSB7XG4gICAgICAgICAgICByZXR1cm4gbGFiZWwgLyBtdWx0aXBsZU51bTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBsYWJlbHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBzY2FsZSBzdGVwLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Y2FsY3VsYXRvclxuICAgICAqIEBwYXJhbSB7e21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19IHNjYWxlIGF4aXMgc2NhbGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gY291bnQgdmFsdWUgY291bnRcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBzY2FsZSBzdGVwXG4gICAgICovXG4gICAgZ2V0U2NhbGVTdGVwOiBmdW5jdGlvbihzY2FsZSwgY291bnQpIHtcbiAgICAgICAgcmV0dXJuIChzY2FsZS5tYXggLSBzY2FsZS5taW4pIC8gKGNvdW50IC0gMSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIGNhbGN1bGF0ZSBhZGphY2VudC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZGVncmVlIGRlZ3JlZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBoeXBvdGVudXNlIGh5cG90ZW51c2VcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBhZGphY2VudFxuICAgICAqXG4gICAgICogICBIIDogSHlwb3RlbnVzZVxuICAgICAqICAgQSA6IEFkamFjZW50XG4gICAgICogICBPIDogT3Bwb3NpdGVcbiAgICAgKiAgIEQgOiBEZWdyZWVcbiAgICAgKlxuICAgICAqICAgICAgICAvfFxuICAgICAqICAgICAgIC8gfFxuICAgICAqICAgIEggLyAgfCBPXG4gICAgICogICAgIC8gICB8XG4gICAgICogICAgL1xcIEQgfFxuICAgICAqICAgIC0tLS0tXG4gICAgICogICAgICAgQVxuICAgICAqL1xuICAgIGNhbGN1bGF0ZUFkamFjZW50OiBmdW5jdGlvbihkZWdyZWUsIGh5cG90ZW51c2UpIHtcbiAgICAgICAgcmV0dXJuIE1hdGguY29zKGRlZ3JlZSAqIGNoYXJ0Q29uc3QuUkFEKSAqIGh5cG90ZW51c2U7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIGNhbGN1bGF0ZSBvcHBvc2l0ZS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZGVncmVlIGRlZ3JlZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBoeXBvdGVudXNlIGh5cG90ZW51c2VcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBvcHBvc2l0ZVxuICAgICAqL1xuICAgIGNhbGN1bGF0ZU9wcG9zaXRlOiBmdW5jdGlvbihkZWdyZWUsIGh5cG90ZW51c2UpIHtcbiAgICAgICAgcmV0dXJuIE1hdGguc2luKGRlZ3JlZSAqIGNoYXJ0Q29uc3QuUkFEKSAqIGh5cG90ZW51c2U7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBjYWxjdWxhdG9yO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IERhdGEgY29udmVydGVyLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgY29uY2F0ID0gQXJyYXkucHJvdG90eXBlLmNvbmNhdDtcblxuLyoqXG4gKiBEYXRhIGNvbnZlcnRlci5cbiAqIEBtb2R1bGUgZGF0YUNvbnZlcnRlclxuICovXG52YXIgZGF0YUNvbnZlcnRlciA9IHtcbiAgICAvKipcbiAgICAgKiBDb252ZXJ0IHVzZXIgZGF0YS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheT59IHVzZXJEYXRhIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjaGFydE9wdGlvbnMgY2hhcnQgb3B0aW9uXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNoYXJ0VHlwZSBjaGFydCB0eXBlXG4gICAgICogQHBhcmFtIHthcnJheS48c3RyaW5nPn0gc2VyaWVzQ2hhcnRUeXBlcyBjaGFydCB0eXBlc1xuICAgICAqIEByZXR1cm5zIHt7XG4gICAgICogICAgICBsYWJlbHM6IGFycmF5LjxzdHJpbmc+LFxuICAgICAqICAgICAgdmFsdWVzOiBhcnJheS48bnVtYmVyPixcbiAgICAgKiAgICAgIGxlZ2VuZExhYmVsczogYXJyYXkuPHN0cmluZz4sXG4gICAgICogICAgICBmb3JtYXRGdW5jdGlvbnM6IGFycmF5LjxmdW5jdGlvbj4sXG4gICAgICogICAgICBmb3JtYXR0ZWRWYWx1ZXM6IGFycmF5LjxzdHJpbmc+XG4gICAgICogfX0gY29udmVydGVkIGRhdGFcbiAgICAgKi9cbiAgICBjb252ZXJ0OiBmdW5jdGlvbih1c2VyRGF0YSwgY2hhcnRPcHRpb25zLCBjaGFydFR5cGUsIHNlcmllc0NoYXJ0VHlwZXMpIHtcbiAgICAgICAgdmFyIGxhYmVscyA9IHVzZXJEYXRhLmNhdGVnb3JpZXMsXG4gICAgICAgICAgICBzZXJpZXNEYXRhID0gdXNlckRhdGEuc2VyaWVzLFxuICAgICAgICAgICAgdmFsdWVzID0gdGhpcy5fcGlja1ZhbHVlcyhzZXJpZXNEYXRhKSxcbiAgICAgICAgICAgIGpvaW5WYWx1ZXMgPSB0aGlzLl9qb2luVmFsdWVzKHZhbHVlcywgc2VyaWVzQ2hhcnRUeXBlcyksXG4gICAgICAgICAgICBsZWdlbmRMYWJlbHMgPSB0aGlzLl9waWNrTGVnZW5kTGFiZWxzKHNlcmllc0RhdGEpLFxuICAgICAgICAgICAgam9pbkxlZ2VuZExhYmVscyA9IHRoaXMuX2pvaW5MZWdlbmRMYWJlbHMobGVnZW5kTGFiZWxzLCBjaGFydFR5cGUsIHNlcmllc0NoYXJ0VHlwZXMpLFxuICAgICAgICAgICAgZm9ybWF0ID0gY2hhcnRPcHRpb25zICYmIGNoYXJ0T3B0aW9ucy5mb3JtYXQgfHwgJycsXG4gICAgICAgICAgICBmb3JtYXRGdW5jdGlvbnMgPSB0aGlzLl9maW5kRm9ybWF0RnVuY3Rpb25zKGZvcm1hdCksXG4gICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXMgPSBmb3JtYXQgPyB0aGlzLl9mb3JtYXRWYWx1ZXModmFsdWVzLCBmb3JtYXRGdW5jdGlvbnMpIDogdmFsdWVzLFxuICAgICAgICAgICAgam9pbkZvcm1hdHRlZFZhbHVlcyA9IHRoaXMuX2pvaW5WYWx1ZXMoZm9ybWF0dGVkVmFsdWVzLCBzZXJpZXNDaGFydFR5cGVzKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxhYmVsczogbGFiZWxzLFxuICAgICAgICAgICAgdmFsdWVzOiB2YWx1ZXMsXG4gICAgICAgICAgICBqb2luVmFsdWVzOiBqb2luVmFsdWVzLFxuICAgICAgICAgICAgbGVnZW5kTGFiZWxzOiBsZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICBqb2luTGVnZW5kTGFiZWxzOiBqb2luTGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zOiBmb3JtYXRGdW5jdGlvbnMsXG4gICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXM6IGZvcm1hdHRlZFZhbHVlcyxcbiAgICAgICAgICAgIGpvaW5Gb3JtYXR0ZWRWYWx1ZXM6IGpvaW5Gb3JtYXR0ZWRWYWx1ZXNcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2VwYXJhdGUgbGFiZWwuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXkuPGFycmF5Pj59IHVzZXJEYXRhIHVzZXIgZGF0YVxuICAgICAqIEByZXR1cm5zIHt7bGFiZWxzOiAoYXJyYXkuPHN0cmluZz4pLCBzb3VyY2VEYXRhOiBhcnJheS48YXJyYXkuPGFycmF5Pj59fSByZXN1bHQgZGF0YVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NlcGFyYXRlTGFiZWw6IGZ1bmN0aW9uKHVzZXJEYXRhKSB7XG4gICAgICAgIHZhciBsYWJlbHMgPSB1c2VyRGF0YVswXS5wb3AoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxhYmVsczogbGFiZWxzLFxuICAgICAgICAgICAgc291cmNlRGF0YTogdXNlckRhdGFcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUGljayB2YWx1ZS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge3tuYW1lOiBzdHJpbmcsIGRhdGE6IChhcnJheS48bnVtYmVyPiB8IG51bWJlcil9fSBpdGVtcyBpdGVtc1xuICAgICAqIEByZXR1cm5zIHthcnJheX0gcGlja2VkIHZhbHVlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcGlja1ZhbHVlOiBmdW5jdGlvbihpdGVtcykge1xuICAgICAgICByZXR1cm4gdHVpLnV0aWwubWFwKFtdLmNvbmNhdChpdGVtcy5kYXRhKSwgcGFyc2VGbG9hdCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFBpY2sgdmFsdWVzIGZyb20gYXhpcyBkYXRhLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gc2VyaWVzRGF0YSBzZXJpZXMgZGF0YVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmdbXX0gdmFsdWVzXG4gICAgICovXG4gICAgX3BpY2tWYWx1ZXM6IGZ1bmN0aW9uKHNlcmllc0RhdGEpIHtcbiAgICAgICAgdmFyIHZhbHVlcywgcmVzdWx0O1xuICAgICAgICBpZiAodHVpLnV0aWwuaXNBcnJheShzZXJpZXNEYXRhKSkge1xuICAgICAgICAgICAgdmFsdWVzID0gdHVpLnV0aWwubWFwKHNlcmllc0RhdGEsIHRoaXMuX3BpY2tWYWx1ZSwgdGhpcyk7XG4gICAgICAgICAgICByZXN1bHQgPSB0dWkudXRpbC5waXZvdCh2YWx1ZXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0ID0ge307XG4gICAgICAgICAgICB0dWkudXRpbC5mb3JFYWNoKHNlcmllc0RhdGEsIGZ1bmN0aW9uKGdyb3VwVmFsdWVzLCB0eXBlKSB7XG4gICAgICAgICAgICAgICAgdmFsdWVzID0gdHVpLnV0aWwubWFwKGdyb3VwVmFsdWVzLCB0aGlzLl9waWNrVmFsdWUsIHRoaXMpO1xuICAgICAgICAgICAgICAgIHJlc3VsdFt0eXBlXSA9IHR1aS51dGlsLnBpdm90KHZhbHVlcyk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBKb2luIHZhbHVlcy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheT59IGdyb3VwVmFsdWVzIHZhbHVlc1xuICAgICAqIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IHNlcmllc0NoYXJ0VHlwZXMgY2hhcnQgdHlwZXNcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPG51bWJlcj59IGpvaW4gdmFsdWVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfam9pblZhbHVlczogZnVuY3Rpb24oZ3JvdXBWYWx1ZXMsIHNlcmllc0NoYXJ0VHlwZXMpIHtcbiAgICAgICAgdmFyIGpvaW5WYWx1ZXM7XG5cbiAgICAgICAgaWYgKCFzZXJpZXNDaGFydFR5cGVzKSB7XG4gICAgICAgICAgICByZXR1cm4gZ3JvdXBWYWx1ZXM7XG4gICAgICAgIH1cblxuICAgICAgICBqb2luVmFsdWVzID0gdHVpLnV0aWwubWFwKGdyb3VwVmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZXM7XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIGpvaW5WYWx1ZXMgPSBbXTtcbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaEFycmF5KHNlcmllc0NoYXJ0VHlwZXMsIGZ1bmN0aW9uKF9jaGFydFR5cGUpIHtcbiAgICAgICAgICAgIHR1aS51dGlsLmZvckVhY2goZ3JvdXBWYWx1ZXNbX2NoYXJ0VHlwZV0sIGZ1bmN0aW9uKHZhbHVlcywgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWpvaW5WYWx1ZXNbaW5kZXhdKSB7XG4gICAgICAgICAgICAgICAgICAgIGpvaW5WYWx1ZXNbaW5kZXhdID0gW107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGpvaW5WYWx1ZXNbaW5kZXhdID0gam9pblZhbHVlc1tpbmRleF0uY29uY2F0KHZhbHVlcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGpvaW5WYWx1ZXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFBpY2sgbGVnZW5kIGxhYmVsLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBpdGVtIGl0ZW1cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBsYWJlbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3BpY2tMZWdlbmRMYWJlbDogZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICByZXR1cm4gaXRlbS5uYW1lO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBQaWNrIGxlZ2VuZCBsYWJlbHMgZnJvbSBheGlzIGRhdGEuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXk+fSBzZXJpZXNEYXRhIHNlcmllcyBkYXRhXG4gICAgICogQHJldHVybnMge3N0cmluZ1tdfSBsYWJlbHNcbiAgICAgKi9cbiAgICBfcGlja0xlZ2VuZExhYmVsczogZnVuY3Rpb24oc2VyaWVzRGF0YSkge1xuICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICBpZiAodHVpLnV0aWwuaXNBcnJheShzZXJpZXNEYXRhKSkge1xuICAgICAgICAgICAgcmVzdWx0ID0gdHVpLnV0aWwubWFwKHNlcmllc0RhdGEsIHRoaXMuX3BpY2tMZWdlbmRMYWJlbCwgdGhpcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQgPSB7fTtcbiAgICAgICAgICAgIHR1aS51dGlsLmZvckVhY2goc2VyaWVzRGF0YSwgZnVuY3Rpb24oZ3JvdXBWYWx1ZXMsIHR5cGUpIHtcbiAgICAgICAgICAgICAgICByZXN1bHRbdHlwZV0gPSB0dWkudXRpbC5tYXAoZ3JvdXBWYWx1ZXMsIHRoaXMuX3BpY2tMZWdlbmRMYWJlbCwgdGhpcyk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBKb2luIGxlZ2VuZCBsYWJlbHMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHthcnJheX0gbGVnZW5kTGFiZWxzIGxlZ2VuZCBsYWJlbHNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY2hhcnRUeXBlIGNoYXJ0IHR5cGVcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBzZXJpZXNDaGFydFR5cGVzIGNoYXJ0IHR5cGVzXG4gICAgICogQHJldHVybnMge2FycmF5fSBsYWJlbHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9qb2luTGVnZW5kTGFiZWxzOiBmdW5jdGlvbihsZWdlbmRMYWJlbHMsIGNoYXJ0VHlwZSwgc2VyaWVzQ2hhcnRUeXBlcykge1xuICAgICAgICB2YXIgam9pbkxhYmVscztcbiAgICAgICAgaWYgKCFzZXJpZXNDaGFydFR5cGVzIHx8ICFzZXJpZXNDaGFydFR5cGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgam9pbkxhYmVscyA9IHR1aS51dGlsLm1hcChsZWdlbmRMYWJlbHMsIGZ1bmN0aW9uKGxhYmVsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgY2hhcnRUeXBlOiBjaGFydFR5cGUsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiBsYWJlbFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGpvaW5MYWJlbHMgPSBbXTtcbiAgICAgICAgICAgIHR1aS51dGlsLmZvckVhY2hBcnJheShzZXJpZXNDaGFydFR5cGVzLCBmdW5jdGlvbihfY2hhcnRUeXBlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGxhYmVscyA9IHR1aS51dGlsLm1hcChsZWdlbmRMYWJlbHNbX2NoYXJ0VHlwZV0sIGZ1bmN0aW9uKGxhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGFydFR5cGU6IF9jaGFydFR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogbGFiZWxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBqb2luTGFiZWxzID0gam9pbkxhYmVscy5jb25jYXQobGFiZWxzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBqb2luTGFiZWxzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBmb3JtYXQgZ3JvdXAgdmFsdWVzLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gZ3JvdXBWYWx1ZXMgZ3JvdXAgdmFsdWVzXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbltdfSBmb3JtYXRGdW5jdGlvbnMgZm9ybWF0IGZ1bmN0aW9uc1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmdbXX0gZm9ybWF0dGVkIHZhbHVlc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2Zvcm1hdEdyb3VwVmFsdWVzOiBmdW5jdGlvbihncm91cFZhbHVlcywgZm9ybWF0RnVuY3Rpb25zKSB7XG4gICAgICAgIHJldHVybiB0dWkudXRpbC5tYXAoZ3JvdXBWYWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICAgICAgcmV0dXJuIHR1aS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGZucyA9IFt2YWx1ZV0uY29uY2F0KGZvcm1hdEZ1bmN0aW9ucyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHR1aS51dGlsLnJlZHVjZShmbnMsIGZ1bmN0aW9uKHN0b3JlZCwgZm4pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZuKHN0b3JlZCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIGZvcm1hdCBjb252ZXJ0ZWQgdmFsdWVzLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gY2hhcnRWYWx1ZXMgY2hhcnQgdmFsdWVzXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbltdfSBmb3JtYXRGdW5jdGlvbnMgZm9ybWF0IGZ1bmN0aW9uc1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmdbXX0gZm9ybWF0dGVkIHZhbHVlc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2Zvcm1hdFZhbHVlczogZnVuY3Rpb24oY2hhcnRWYWx1ZXMsIGZvcm1hdEZ1bmN0aW9ucykge1xuICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICBpZiAodHVpLnV0aWwuaXNBcnJheShjaGFydFZhbHVlcykpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuX2Zvcm1hdEdyb3VwVmFsdWVzKGNoYXJ0VmFsdWVzLCBmb3JtYXRGdW5jdGlvbnMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0ID0ge307XG4gICAgICAgICAgICB0dWkudXRpbC5mb3JFYWNoKGNoYXJ0VmFsdWVzLCBmdW5jdGlvbihncm91cFZhbHVlcywgY2hhcnRUeXBlKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W2NoYXJ0VHlwZV0gPSB0aGlzLl9mb3JtYXRHcm91cFZhbHVlcyhncm91cFZhbHVlcywgZm9ybWF0RnVuY3Rpb25zKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFBpY2sgbWF4IGxlbmd0aCB1bmRlciBwb2ludC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ1tdfSB2YWx1ZXMgY2hhcnQgdmFsdWVzXG4gICAgICogQHJldHVybnMge251bWJlcn0gbWF4IGxlbmd0aCB1bmRlciBwb2ludFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3BpY2tNYXhMZW5VbmRlclBvaW50OiBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgdmFyIG1heCA9IDA7XG5cbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaEFycmF5KHZhbHVlcywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBsZW4gPSB0dWkudXRpbC5sZW5ndGhBZnRlclBvaW50KHZhbHVlKTtcbiAgICAgICAgICAgIGlmIChsZW4gPiBtYXgpIHtcbiAgICAgICAgICAgICAgICBtYXggPSBsZW47XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIHJldHVybiBtYXg7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgemVybyBmaWxsIGZvcm1hdCBvciBub3QuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZvcm1hdCBmb3JtYXRcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gcmVzdWx0IGJvb2xlYW5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc1plcm9GaWxsOiBmdW5jdGlvbihmb3JtYXQpIHtcbiAgICAgICAgcmV0dXJuIGZvcm1hdC5sZW5ndGggPiAyICYmIGZvcm1hdC5jaGFyQXQoMCkgPT09ICcwJztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciBkZWNpbWFsIGZvcm1hdCBvciBub3QuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZvcm1hdCBmb3JtYXRcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gcmVzdWx0IGJvb2xlYW5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc0RlY2ltYWw6IGZ1bmN0aW9uKGZvcm1hdCkge1xuICAgICAgICB2YXIgaW5kZXhPZiA9IGZvcm1hdC5pbmRleE9mKCcuJyk7XG4gICAgICAgIHJldHVybiBpbmRleE9mID4gLTEgJiYgaW5kZXhPZiA8IGZvcm1hdC5sZW5ndGggLSAxO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIGNvbW1hIGZvcm1hdCBvciBub3QuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZvcm1hdCBmb3JtYXRcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gcmVzdWx0IGJvb2xlYW5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc0NvbW1hOiBmdW5jdGlvbihmb3JtYXQpIHtcbiAgICAgICAgcmV0dXJuIGZvcm1hdC5pbmRleE9mKCcsJykgPT09IGZvcm1hdC5zcGxpdCgnLicpWzBdLmxlbmd0aCAtIDQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZvcm1hdCB6ZXJvIGZpbGwuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGxlbiBsZW5ndGggb2YgcmVzdWx0XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlIHRhcmdldCB2YWx1ZVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGZvcm1hdHRlZCB2YWx1ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2Zvcm1hdFplcm9GaWxsOiBmdW5jdGlvbihsZW4sIHZhbHVlKSB7XG4gICAgICAgIHZhciB6ZXJvID0gJzAnLFxuICAgICAgICAgICAgaXNNaW51cyA9IHZhbHVlIDwgMDtcblxuICAgICAgICB2YWx1ZSA9IE1hdGguYWJzKHZhbHVlKSArICcnO1xuXG4gICAgICAgIGlmICh2YWx1ZS5sZW5ndGggPj0gbGVuKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICB3aGlsZSAodmFsdWUubGVuZ3RoIDwgbGVuKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHplcm8gKyB2YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoaXNNaW51cyA/ICctJyA6ICcnKSArIHZhbHVlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGb3JtYXQgRGVjaW1hbC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbGVuIGxlbmd0aCBvZiB1bmRlciBkZWNpbWFsIHBvaW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlIHRhcmdldCB2YWx1ZVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGZvcm1hdHRlZCB2YWx1ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2Zvcm1hdERlY2ltYWw6IGZ1bmN0aW9uKGxlbiwgdmFsdWUpIHtcbiAgICAgICAgdmFyIHBvdztcblxuICAgICAgICBpZiAobGVuID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5yb3VuZCh2YWx1ZSwgMTApO1xuICAgICAgICB9XG5cbiAgICAgICAgcG93ID0gTWF0aC5wb3coMTAsIGxlbik7XG4gICAgICAgIHZhbHVlID0gTWF0aC5yb3VuZCh2YWx1ZSAqIHBvdykgLyBwb3c7XG4gICAgICAgIHZhbHVlID0gcGFyc2VGbG9hdCh2YWx1ZSkudG9GaXhlZChsZW4pO1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZvcm1hdCBDb21tYS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWUgdGFyZ2V0IHZhbHVlXG4gICAgICogQHJldHVybnMge3N0cmluZ30gZm9ybWF0dGVkIHZhbHVlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZm9ybWF0Q29tbWE6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHZhciBjb21tYSA9ICcsJyxcbiAgICAgICAgICAgIHVuZGVyUG9pbnRWYWx1ZSA9ICcnLFxuICAgICAgICAgICAgdmFsdWVzLCBsYXN0SW5kZXg7XG5cbiAgICAgICAgdmFsdWUgKz0gJyc7XG5cbiAgICAgICAgaWYgKHZhbHVlLmluZGV4T2YoJy4nKSA+IC0xKSB7XG4gICAgICAgICAgICB2YWx1ZXMgPSB2YWx1ZS5zcGxpdCgnLicpO1xuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZXNbMF07XG4gICAgICAgICAgICB1bmRlclBvaW50VmFsdWUgPSAnLicgKyB2YWx1ZXNbMV07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodmFsdWUubGVuZ3RoIDwgNCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlICsgdW5kZXJQb2ludFZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFsdWVzID0gKHZhbHVlKS5zcGxpdCgnJykucmV2ZXJzZSgpO1xuICAgICAgICBsYXN0SW5kZXggPSB2YWx1ZXMubGVuZ3RoIC0gMTtcbiAgICAgICAgdmFsdWVzID0gdHVpLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24oY2hhciwgaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBbY2hhcl07XG4gICAgICAgICAgICBpZiAoaW5kZXggPCBsYXN0SW5kZXggJiYgKGluZGV4ICsgMSkgJSAzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goY29tbWEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGNvbmNhdC5hcHBseShbXSwgdmFsdWVzKS5yZXZlcnNlKCkuam9pbignJykgKyB1bmRlclBvaW50VmFsdWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZpbmQgZm9ybWF0IGZ1bmN0aW9ucy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZm9ybWF0IGZvcm1hdFxuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IHZhbHVlcyBjaGFydCB2YWx1ZXNcbiAgICAgKiBAcmV0dXJucyB7ZnVuY3Rpb25bXX0gZnVuY3Rpb25zXG4gICAgICovXG4gICAgX2ZpbmRGb3JtYXRGdW5jdGlvbnM6IGZ1bmN0aW9uKGZvcm1hdCkge1xuICAgICAgICB2YXIgZnVuY3MgPSBbXSxcbiAgICAgICAgICAgIGxlbjtcblxuICAgICAgICBpZiAoIWZvcm1hdCkge1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2lzRGVjaW1hbChmb3JtYXQpKSB7XG4gICAgICAgICAgICBsZW4gPSB0aGlzLl9waWNrTWF4TGVuVW5kZXJQb2ludChbZm9ybWF0XSk7XG4gICAgICAgICAgICBmdW5jcyA9IFt0dWkudXRpbC5iaW5kKHRoaXMuX2Zvcm1hdERlY2ltYWwsIHRoaXMsIGxlbildO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2lzWmVyb0ZpbGwoZm9ybWF0KSkge1xuICAgICAgICAgICAgbGVuID0gZm9ybWF0Lmxlbmd0aDtcbiAgICAgICAgICAgIGZ1bmNzID0gW3R1aS51dGlsLmJpbmQodGhpcy5fZm9ybWF0WmVyb0ZpbGwsIHRoaXMsIGxlbildO1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmNzO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2lzQ29tbWEoZm9ybWF0KSkge1xuICAgICAgICAgICAgZnVuY3MucHVzaCh0aGlzLl9mb3JtYXRDb21tYSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZnVuY3M7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBkYXRhQ29udmVydGVyO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IERPTSBIYW5kbGVyLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIERPTSBIYW5kbGVyLlxuICogQG1vZHVsZSBkb21IYW5kbGVyXG4gKi9cbnZhciBkb21IYW5kbGVyID0ge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZSBlbGVtZW50LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZG9tSGFuZGxlclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0YWcgaHRtbCB0YWdcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmV3Q2xhc3MgY2xhc3MgbmFtZVxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gY3JlYXRlZCBlbGVtZW50XG4gICAgICovXG4gICAgY3JlYXRlOiBmdW5jdGlvbih0YWcsIG5ld0NsYXNzKSB7XG4gICAgICAgIHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnKTtcblxuICAgICAgICBpZiAobmV3Q2xhc3MpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkQ2xhc3MoZWwsIG5ld0NsYXNzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNsYXNzIG5hbWVzLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZG9tSGFuZGxlclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHJldHVybnMge2FycmF5fSBuYW1lc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldENsYXNzTmFtZXM6IGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgIHZhciBjbGFzc05hbWUgPSBlbC5jbGFzc05hbWUgfHwgJycsXG4gICAgICAgICAgICBjbGFzc05hbWVzID0gY2xhc3NOYW1lID8gY2xhc3NOYW1lLnNwbGl0KCcgJykgOiBbXTtcbiAgICAgICAgcmV0dXJuIGNsYXNzTmFtZXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZCBjc3MgY2xhc3MgdG8gdGFyZ2V0IGVsZW1lbnQuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkb21IYW5kbGVyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmV3Q2xhc3MgYWRkIGNsYXNzIG5hbWVcbiAgICAgKi9cbiAgICBhZGRDbGFzczogZnVuY3Rpb24oZWwsIG5ld0NsYXNzKSB7XG4gICAgICAgIHZhciBjbGFzc05hbWVzID0gdGhpcy5fZ2V0Q2xhc3NOYW1lcyhlbCksXG4gICAgICAgICAgICBpbmRleCA9IHR1aS51dGlsLmluQXJyYXkobmV3Q2xhc3MsIGNsYXNzTmFtZXMpO1xuXG4gICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjbGFzc05hbWVzLnB1c2gobmV3Q2xhc3MpO1xuICAgICAgICBlbC5jbGFzc05hbWUgPSBjbGFzc05hbWVzLmpvaW4oJyAnKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIGNzcyBjbGFzcyBmcm9tIHRhcmdldCBlbGVtZW50LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZG9tSGFuZGxlclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHJtQ2xhc3MgcmVtb3ZlIGNsYXNzIG5hbWVcbiAgICAgKi9cbiAgICByZW1vdmVDbGFzczogZnVuY3Rpb24oZWwsIHJtQ2xhc3MpIHtcbiAgICAgICAgdmFyIGNsYXNzTmFtZXMgPSB0aGlzLl9nZXRDbGFzc05hbWVzKGVsKSxcbiAgICAgICAgICAgIGluZGV4ID0gdHVpLnV0aWwuaW5BcnJheShybUNsYXNzLCBjbGFzc05hbWVzKTtcblxuICAgICAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjbGFzc05hbWVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIGVsLmNsYXNzTmFtZSA9IGNsYXNzTmFtZXMuam9pbignICcpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIGNsYXNzIGV4aXN0IG9yIG5vdC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRvbUhhbmRsZXJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmaW5kQ2xhc3MgdGFyZ2V0IGNzcyBjbGFzc1xuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBoYXMgY2xhc3NcbiAgICAgKi9cbiAgICBoYXNDbGFzczogZnVuY3Rpb24oZWwsIGZpbmRDbGFzcykge1xuICAgICAgICB2YXIgY2xhc3NOYW1lcyA9IHRoaXMuX2dldENsYXNzTmFtZXMoZWwpLFxuICAgICAgICAgICAgaW5kZXggPSB0dWkudXRpbC5pbkFycmF5KGZpbmRDbGFzcywgY2xhc3NOYW1lcyk7XG4gICAgICAgIHJldHVybiBpbmRleCA+IC0xO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGaW5kIHBhcmVudCBieSBjbGFzcyBuYW1lLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZG9tSGFuZGxlclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNsYXNzTmFtZSB0YXJnZXQgY3NzIGNsYXNzXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGxhc3RDbGFzcyBsYXN0IGNzcyBjbGFzc1xuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gcmVzdWx0IGVsZW1lbnRcbiAgICAgKi9cbiAgICBmaW5kUGFyZW50QnlDbGFzczogZnVuY3Rpb24oZWwsIGNsYXNzTmFtZSwgbGFzdENsYXNzKSB7XG4gICAgICAgIHZhciBwYXJlbnQgPSBlbC5wYXJlbnROb2RlO1xuICAgICAgICBpZiAoIXBhcmVudCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5oYXNDbGFzcyhwYXJlbnQsIGNsYXNzTmFtZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBwYXJlbnQ7XG4gICAgICAgIH0gZWxzZSBpZiAocGFyZW50Lm5vZGVOYW1lID09PSAnQk9EWScgfHwgdGhpcy5oYXNDbGFzcyhwYXJlbnQsIGxhc3RDbGFzcykpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmluZFBhcmVudEJ5Q2xhc3MocGFyZW50LCBjbGFzc05hbWUsIGxhc3RDbGFzcyk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXBwZW5kIGNoaWxkIGVsZW1lbnQuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkb21IYW5kbGVyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNvbnRhaW5lciBlbGVtZW50XG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY2hpbGRyZW4gY2hpbGQgZWxlbWVudFxuICAgICAqL1xuICAgIGFwcGVuZDogZnVuY3Rpb24oY29udGFpbmVyLCBjaGlsZHJlbikge1xuICAgICAgICBpZiAoIWNvbnRhaW5lciB8fCAhY2hpbGRyZW4pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjaGlsZHJlbiA9IHR1aS51dGlsLmlzQXJyYXkoY2hpbGRyZW4pID8gY2hpbGRyZW4gOiBbY2hpbGRyZW5dO1xuXG4gICAgICAgIHR1aS51dGlsLmZvckVhY2hBcnJheShjaGlsZHJlbiwgZnVuY3Rpb24oY2hpbGQpIHtcbiAgICAgICAgICAgIGlmICghY2hpbGQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoY2hpbGQpO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRvbUhhbmRsZXI7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgRXZlbnQgbGlzdGVuZXIuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogRXZlbnQgbGlzdGVuZXIuXG4gKiBAbW9kdWxlIGV2ZW50TGlzdGVuZXJcbiAqL1xudmFyIGV2ZW50TGlzdGVuZXIgPSB7XG4gICAgLyoqXG4gICAgICogRXZlbnQgbGlzdGVuZXIgZm9yIElFLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZXZlbnRMaXN0ZW5lclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudE5hbWUgZXZlbnQgbmFtZVxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hdHRhY2hFdmVudDogZnVuY3Rpb24gKGV2ZW50TmFtZSwgZWwsIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT0gXCJvYmplY3RcIiAmJiBjYWxsYmFjay5oYW5kbGVFdmVudCkge1xuICAgICAgICAgICAgZWwuYXR0YWNoRXZlbnQoXCJvblwiICsgZXZlbnROYW1lLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2suaGFuZGxlRXZlbnQuY2FsbChjYWxsYmFjayk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsLmF0dGFjaEV2ZW50KFwib25cIiArIGV2ZW50TmFtZSwgY2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV2ZW50IGxpc3RlbmVyIGZvciBvdGhlciBicm93c2Vycy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmV2ZW50TGlzdGVuZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lIGV2ZW50IG5hbWVcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYWRkRXZlbnRMaXN0ZW5lcjogZnVuY3Rpb24gKGV2ZW50TmFtZSwgZWwsIGNhbGxiYWNrKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgY2FsbGJhY2spO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09IFwib2JqZWN0XCIgJiYgY2FsbGJhY2suaGFuZGxlRXZlbnQpIHtcbiAgICAgICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmhhbmRsZUV2ZW50LmNhbGwoY2FsbGJhY2ssIGV2ZW50KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogQmluZCBldmVudCBmdW5jdGlvbi5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmV2ZW50TGlzdGVuZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lIGV2ZW50IG5hbWVcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgICovXG4gICAgYmluZEV2ZW50OiBmdW5jdGlvbiAoZXZlbnROYW1lLCBlbCwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGJpbmRFdmVudDtcbiAgICAgICAgaWYgKFwiYWRkRXZlbnRMaXN0ZW5lclwiIGluIGVsKSB7XG4gICAgICAgICAgICBiaW5kRXZlbnQgPSB0aGlzLl9hZGRFdmVudExpc3RlbmVyO1xuICAgICAgICB9IGVsc2UgaWYgKFwiYXR0YWNoRXZlbnRcIiBpbiBlbCkge1xuICAgICAgICAgICAgYmluZEV2ZW50ID0gdGhpcy5fYXR0YWNoRXZlbnQ7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5iaW5kRXZlbnQgPSBiaW5kRXZlbnQ7XG4gICAgICAgIGJpbmRFdmVudChldmVudE5hbWUsIGVsLCBjYWxsYmFjayk7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBldmVudExpc3RlbmVyO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFV0aWwgZm9yIHJlbmRlcmluZy5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGRvbSA9IHJlcXVpcmUoJy4vZG9tSGFuZGxlcicpLFxuICAgIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuLy4uL2NvbnN0Jyk7XG5cbnZhciBicm93c2VyID0gdHVpLnV0aWwuYnJvd3NlcixcbiAgICBpc0lFOCA9IGJyb3dzZXIubXNpZSAmJiBicm93c2VyLnZlcnNpb24gPT09IDg7XG5cbi8qKlxuICogVXRpbCBmb3IgcmVuZGVyaW5nLlxuICogQG1vZHVsZSByZW5kZXJVdGlsXG4gKi9cbnZhciByZW5kZXJVdGlsID0ge1xuICAgIC8qKlxuICAgICAqIENvbmNhdCBzdHJpbmcuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpyZW5kZXJVdGlsXG4gICAgICogQHBhcmFtcyB7Li4uc3RyaW5nfSB0YXJnZXQgc3RyaW5nc1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGNvbmNhdCBzdHJpbmdcbiAgICAgKi9cbiAgICBjb25jYXRTdHI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gU3RyaW5nLnByb3RvdHlwZS5jb25jYXQuYXBwbHkoJycsIGFyZ3VtZW50cyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgY3NzVGV4dCBmb3IgZm9udC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOnJlbmRlclV0aWxcbiAgICAgKiBAcGFyYW0ge3tmb250U2l6ZTogbnVtYmVyLCBmb250RmFtaWx5OiBzdHJpbmcsIGNvbG9yOiBzdHJpbmd9fSB0aGVtZSBmb250IHRoZW1lXG4gICAgICogQHJldHVybnMge3N0cmluZ30gY3NzVGV4dFxuICAgICAqL1xuICAgIG1ha2VGb250Q3NzVGV4dDogZnVuY3Rpb24odGhlbWUpIHtcbiAgICAgICAgdmFyIGNzc1RleHRzID0gW107XG5cbiAgICAgICAgaWYgKCF0aGVtZSkge1xuICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoZW1lLmZvbnRTaXplKSB7XG4gICAgICAgICAgICBjc3NUZXh0cy5wdXNoKHRoaXMuY29uY2F0U3RyKCdmb250LXNpemU6JywgdGhlbWUuZm9udFNpemUsICdweCcpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGVtZS5mb250RmFtaWx5KSB7XG4gICAgICAgICAgICBjc3NUZXh0cy5wdXNoKHRoaXMuY29uY2F0U3RyKCdmb250LWZhbWlseTonLCB0aGVtZS5mb250RmFtaWx5KSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhlbWUuY29sb3IpIHtcbiAgICAgICAgICAgIGNzc1RleHRzLnB1c2godGhpcy5jb25jYXRTdHIoJ2NvbG9yOicsIHRoZW1lLmNvbG9yKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY3NzVGV4dHMuam9pbignOycpO1xuICAgIH0sXG5cbiAgICBjaGVja0VsOiBudWxsLFxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBlbGVtZW50IGZvciBzaXplIGNoZWNrLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6cmVuZGVyVXRpbFxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NyZWF0ZVNpemVDaGVja0VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGVsRGl2LCBlbFNwYW47XG4gICAgICAgIGlmICh0aGlzLmNoZWNrRWwpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoZWNrRWw7XG4gICAgICAgIH1cblxuICAgICAgICBlbERpdiA9IGRvbS5jcmVhdGUoJ0RJVicsICd0dWktY2hhcnQtc2l6ZS1jaGVjay1lbGVtZW50Jyk7XG4gICAgICAgIGVsU3BhbiA9IGRvbS5jcmVhdGUoJ1NQQU4nKTtcblxuICAgICAgICBlbERpdi5hcHBlbmRDaGlsZChlbFNwYW4pO1xuICAgICAgICB0aGlzLmNoZWNrRWwgPSBlbERpdjtcbiAgICAgICAgcmV0dXJuIGVsRGl2O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgcmVuZGVyZWQgbGFiZWwgc2l6ZSAod2lkdGggb3IgaGVpZ2h0KS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOnJlbmRlclV0aWxcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbGFiZWwgbGFiZWxcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgdGhlbWVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gb2Zmc2V0VHlwZSBvZmZzZXQgdHlwZSAob2Zmc2V0V2lkdGggb3Igb2Zmc2V0SGVpZ2h0KVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IHNpemVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRSZW5kZXJlZExhYmVsU2l6ZTogZnVuY3Rpb24obGFiZWwsIHRoZW1lLCBvZmZzZXRUeXBlKSB7XG4gICAgICAgIHZhciBlbERpdiwgZWxTcGFuLCBsYWJlbFNpemU7XG5cbiAgICAgICAgaWYgKHR1aS51dGlsLmlzVW5kZWZpbmVkKGxhYmVsKSB8fCBsYWJlbCA9PT0gJycpIHtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG5cbiAgICAgICAgZWxEaXYgPSB0aGlzLl9jcmVhdGVTaXplQ2hlY2tFbCgpO1xuICAgICAgICBlbFNwYW4gPSBlbERpdi5maXJzdENoaWxkO1xuXG4gICAgICAgIHRoZW1lID0gdGhlbWUgfHwge307XG4gICAgICAgIGVsU3Bhbi5pbm5lckhUTUwgPSBsYWJlbDtcbiAgICAgICAgZWxTcGFuLnN0eWxlLmZvbnRTaXplID0gKHRoZW1lLmZvbnRTaXplIHx8IGNoYXJ0Q29uc3QuREVGQVVMVF9MQUJFTF9GT05UX1NJWkUpICsgJ3B4JztcblxuICAgICAgICBpZiAodGhlbWUuZm9udEZhbWlseSkge1xuICAgICAgICAgICAgZWxTcGFuLnN0eWxlLnBhZGRpbmcgPSAwO1xuICAgICAgICAgICAgZWxTcGFuLnN0eWxlLmZvbnRGYW1pbHkgPSB0aGVtZS5mb250RmFtaWx5O1xuICAgICAgICB9XG5cbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChlbERpdik7XG4gICAgICAgIGxhYmVsU2l6ZSA9IGVsU3BhbltvZmZzZXRUeXBlXTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChlbERpdik7XG4gICAgICAgIHJldHVybiBsYWJlbFNpemU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCByZW5kZXJlZCBsYWJlbCB3aWR0aC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOnJlbmRlclV0aWxcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbGFiZWwgbGFiZWxcbiAgICAgKiBAcGFyYW0ge3tmb250U2l6ZTogbnVtYmVyLCBmb250RmFtaWx5OiBzdHJpbmcsIGNvbG9yOiBzdHJpbmd9fSB0aGVtZSBsYWJlbCB0aGVtZVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IHdpZHRoXG4gICAgICovXG4gICAgZ2V0UmVuZGVyZWRMYWJlbFdpZHRoOiBmdW5jdGlvbihsYWJlbCwgdGhlbWUpIHtcbiAgICAgICAgdmFyIGxhYmVsV2lkdGggPSB0aGlzLl9nZXRSZW5kZXJlZExhYmVsU2l6ZShsYWJlbCwgdGhlbWUsICdvZmZzZXRXaWR0aCcpO1xuICAgICAgICByZXR1cm4gbGFiZWxXaWR0aDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHJlbmRlcmVkIGxhYmVsIGhlaWdodC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOnJlbmRlclV0aWxcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbGFiZWwgbGFiZWxcbiAgICAgKiBAcGFyYW0ge3tmb250U2l6ZTogbnVtYmVyLCBmb250RmFtaWx5OiBzdHJpbmcsIGNvbG9yOiBzdHJpbmd9fSB0aGVtZSBsYWJlbCB0aGVtZVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IGhlaWdodFxuICAgICAqL1xuICAgIGdldFJlbmRlcmVkTGFiZWxIZWlnaHQ6IGZ1bmN0aW9uKGxhYmVsLCB0aGVtZSkge1xuICAgICAgICB2YXIgbGFiZWxIZWlnaHQgPSB0aGlzLl9nZXRSZW5kZXJlZExhYmVsU2l6ZShsYWJlbCwgdGhlbWUsICdvZmZzZXRIZWlnaHQnKTtcbiAgICAgICAgcmV0dXJuIGxhYmVsSGVpZ2h0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgUmVuZGVyZWQgTGFiZWxzIE1heCBTaXplKHdpZHRoIG9yIGhlaWdodCkuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpib3VuZHNNYWtlclxuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IGxhYmVscyBsYWJlbHNcbiAgICAgKiBAcGFyYW0ge3tmb250U2l6ZTogbnVtYmVyLCBmb250RmFtaWx5OiBzdHJpbmcsIGNvbG9yOiBzdHJpbmd9fSB0aGVtZSBsYWJlbCB0aGVtZVxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGl0ZXJhdGVlIGl0ZXJhdGVlXG4gICAgICogQHJldHVybnMge251bWJlcn0gbWF4IHNpemUgKHdpZHRoIG9yIGhlaWdodClcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRSZW5kZXJlZExhYmVsc01heFNpemU6IGZ1bmN0aW9uKGxhYmVscywgdGhlbWUsIGl0ZXJhdGVlKSB7XG4gICAgICAgIHZhciBzaXplcyA9IHR1aS51dGlsLm1hcChsYWJlbHMsIGZ1bmN0aW9uKGxhYmVsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0ZXJhdGVlKGxhYmVsLCB0aGVtZSk7XG4gICAgICAgICAgICB9LCB0aGlzKSxcbiAgICAgICAgICAgIG1heFNpemUgPSB0dWkudXRpbC5tYXgoc2l6ZXMpO1xuICAgICAgICByZXR1cm4gbWF4U2l6ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHJlbmRlcmVkIGxhYmVscyBtYXggd2lkdGguXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpib3VuZHNNYWtlclxuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IGxhYmVscyBsYWJlbHNcbiAgICAgKiBAcGFyYW0ge3tmb250U2l6ZTogbnVtYmVyLCBmb250RmFtaWx5OiBzdHJpbmcsIGNvbG9yOiBzdHJpbmd9fSB0aGVtZSBsYWJlbCB0aGVtZVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IG1heCB3aWR0aFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgZ2V0UmVuZGVyZWRMYWJlbHNNYXhXaWR0aDogZnVuY3Rpb24obGFiZWxzLCB0aGVtZSkge1xuICAgICAgICB2YXIgaXRlcmF0ZWUgPSB0dWkudXRpbC5iaW5kKHRoaXMuZ2V0UmVuZGVyZWRMYWJlbFdpZHRoLCB0aGlzKSxcbiAgICAgICAgICAgIG1heFdpZHRoID0gdGhpcy5fZ2V0UmVuZGVyZWRMYWJlbHNNYXhTaXplKGxhYmVscywgdGhlbWUsIGl0ZXJhdGVlKTtcbiAgICAgICAgcmV0dXJuIG1heFdpZHRoO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgcmVuZGVyZWQgbGFiZWxzIG1heCBoZWlnaHQuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpib3VuZHNNYWtlclxuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IGxhYmVscyBsYWJlbHNcbiAgICAgKiBAcGFyYW0ge3tmb250U2l6ZTogbnVtYmVyLCBmb250RmFtaWx5OiBzdHJpbmcsIGNvbG9yOiBzdHJpbmd9fSB0aGVtZSBsYWJlbCB0aGVtZVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IG1heCBoZWlnaHRcbiAgICAgKi9cbiAgICBnZXRSZW5kZXJlZExhYmVsc01heEhlaWdodDogZnVuY3Rpb24obGFiZWxzLCB0aGVtZSkge1xuICAgICAgICB2YXIgaXRlcmF0ZWUgPSB0dWkudXRpbC5iaW5kKHRoaXMuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodCwgdGhpcyksXG4gICAgICAgICAgICBtYXhIZWlnaHQgPSB0aGlzLl9nZXRSZW5kZXJlZExhYmVsc01heFNpemUobGFiZWxzLCB0aGVtZSwgaXRlcmF0ZWUpO1xuICAgICAgICByZXR1cm4gbWF4SGVpZ2h0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgZGltZW5zaW9uLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6cmVuZGVyVXRpbFxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBkaW1lbnNpb24gZGltZW5zaW9uXG4gICAgICovXG4gICAgcmVuZGVyRGltZW5zaW9uOiBmdW5jdGlvbihlbCwgZGltZW5zaW9uKSB7XG4gICAgICAgIGVsLnN0eWxlLmNzc1RleHQgPSBbXG4gICAgICAgICAgICB0aGlzLmNvbmNhdFN0cignd2lkdGg6JywgZGltZW5zaW9uLndpZHRoLCAncHgnKSxcbiAgICAgICAgICAgIHRoaXMuY29uY2F0U3RyKCdoZWlnaHQ6JywgZGltZW5zaW9uLmhlaWdodCwgJ3B4JylcbiAgICAgICAgXS5qb2luKCc7Jyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBwb3NpdGlvbih0b3AsIHJpZ2h0KS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOnJlbmRlclV0aWxcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7e3RvcDogbnVtYmVyLCBsZWZ0OiBudW1iZXIsIHJpZ2h0OiBudW1iZXJ9fSBwb3NpdGlvbiBwb3NpdGlvblxuICAgICAqL1xuICAgIHJlbmRlclBvc2l0aW9uOiBmdW5jdGlvbihlbCwgcG9zaXRpb24pIHtcbiAgICAgICAgaWYgKHR1aS51dGlsLmlzVW5kZWZpbmVkKHBvc2l0aW9uKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBvc2l0aW9uLnRvcCkge1xuICAgICAgICAgICAgZWwuc3R5bGUudG9wID0gcG9zaXRpb24udG9wICsgJ3B4JztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwb3NpdGlvbi5sZWZ0KSB7XG4gICAgICAgICAgICBlbC5zdHlsZS5sZWZ0ID0gcG9zaXRpb24ubGVmdCArICdweCc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocG9zaXRpb24ucmlnaHQpIHtcbiAgICAgICAgICAgIGVsLnN0eWxlLnJpZ2h0ID0gcG9zaXRpb24ucmlnaHQgKyAncHgnO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBiYWNrZ3JvdW5kLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6cmVuZGVyVXRpbFxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGJhY2tncm91bmQgYmFja2dyb3VuZCBvcHRpb25cbiAgICAgKi9cbiAgICByZW5kZXJCYWNrZ3JvdW5kOiBmdW5jdGlvbihlbCwgYmFja2dyb3VuZCkge1xuICAgICAgICBpZiAoIWJhY2tncm91bmQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGVsLnN0eWxlLmJhY2tncm91bmQgPSBiYWNrZ3JvdW5kO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgZm9udCBmYW1pbHkuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpyZW5kZXJVdGlsXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZm9udEZhbWlseSBmb250IGZhbWlseSBvcHRpb25cbiAgICAgKi9cbiAgICByZW5kZXJGb250RmFtaWx5OiBmdW5jdGlvbihlbCwgZm9udEZhbWlseSkge1xuICAgICAgICBpZiAoIWZvbnRGYW1pbHkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGVsLnN0eWxlLmZvbnRGYW1pbHkgPSBmb250RmFtaWx5O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgdGl0bGUuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpyZW5kZXJVdGlsXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRpdGxlIHRpdGxlXG4gICAgICogQHBhcmFtIHt7Zm9udFNpemU6IG51bWJlciwgY29sb3I6IHN0cmluZywgYmFja2dyb3VuZDogc3RyaW5nfX0gdGhlbWUgdGl0bGUgdGhlbWVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY2xhc3NOYW1lIGNzcyBjbGFzcyBuYW1lXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSB0aXRsZSBlbGVtZW50XG4gICAgICovXG4gICAgcmVuZGVyVGl0bGU6IGZ1bmN0aW9uKHRpdGxlLCB0aGVtZSwgY2xhc3NOYW1lKSB7XG4gICAgICAgIHZhciBlbFRpdGxlLCBjc3NUZXh0O1xuXG4gICAgICAgIGlmICghdGl0bGUpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgZWxUaXRsZSA9IGRvbS5jcmVhdGUoJ0RJVicsIGNsYXNzTmFtZSk7XG4gICAgICAgIGVsVGl0bGUuaW5uZXJIVE1MID0gdGl0bGU7XG5cbiAgICAgICAgY3NzVGV4dCA9IHJlbmRlclV0aWwubWFrZUZvbnRDc3NUZXh0KHRoZW1lKTtcblxuICAgICAgICBpZiAodGhlbWUuYmFja2dyb3VuZCkge1xuICAgICAgICAgICAgY3NzVGV4dCArPSAnOycgKyB0aGlzLmNvbmNhdFN0cignYmFja2dyb3VuZDonLCB0aGVtZS5iYWNrZ3JvdW5kKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGVsVGl0bGUuc3R5bGUuY3NzVGV4dCA9IGNzc1RleHQ7XG5cbiAgICAgICAgcmV0dXJuIGVsVGl0bGU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgSUU4IG9yIG5vdC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOnJlbmRlclV0aWxcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gcmVzdWx0IGJvb2xlYW5cbiAgICAgKi9cbiAgICBpc0lFODogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBpc0lFODtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlbmRlclV0aWw7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgY2hhcnQgc3RhdGUuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBjaGFydENvbnN0ID0gcmVxdWlyZSgnLi4vY29uc3QnKTtcblxuLyoqXG4gKiBzdGF0ZS5cbiAqIEBtb2R1bGUgc3RhdGVcbiAqL1xudmFyIHN0YXRlID0ge1xuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgbGluZSB0eXBlIGNoYXJ0IG9yIG5vdC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY2hhcnRUeXBlIGNoYXJ0IHR5cGVcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gcmVzdWx0IGJvb2xlYW5cbiAgICAgKi9cbiAgICBpc0xpbmVUeXBlQ2hhcnQ6IGZ1bmN0aW9uKGNoYXJ0VHlwZSkge1xuICAgICAgICByZXR1cm4gY2hhcnRUeXBlID09PSBjaGFydENvbnN0LkNIQVJUX1RZUEVfTElORSB8fCBjaGFydFR5cGUgPT09IGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9BUkVBO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gc3RhdGU7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgVGhpcyBpcyB0ZW1wbGF0ZSBtYWtlci5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgLyoqXG4gICAgICogVGhpcyBpcyB0ZW1wbGF0ZSBtYWtlci5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaHRtbCBodG1sXG4gICAgICogQHJldHVybnMge2Z1bmN0aW9ufSB0ZW1wbGF0ZSBmdW5jdGlvblxuICAgICAqIEBlYXhtcGxlXG4gICAgICpcbiAgICAgKiAgIHZhciB0ZW1wbGF0ZSA9IHRlbXBsYXRlTWFrZXIudGVtcGxhdGUoJzxzcGFuPnt7IG5hbWUgfX08L3NwYW4+JyksXG4gICAgICogICAgICAgcmVzdWx0ID0gdGVtcGxhdGUoe25hbWU6ICdKb2huJyk7XG4gICAgICogICBjb25zb2xlLmxvZyhyZXN1bHQpOyAvLyA8c3Bhbj5Kb2huPC9zcGFuPlxuICAgICAqXG4gICAgICovXG4gICAgdGVtcGxhdGU6IGZ1bmN0aW9uIChodG1sKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGh0bWw7XG4gICAgICAgICAgICB0dWkudXRpbC5mb3JFYWNoKGRhdGEsIGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlZ0V4cCA9IG5ldyBSZWdFeHAoJ3t7XFxcXHMqJyArIGtleSArICdcXFxccyp9fScsICdnJyk7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UocmVnRXhwLCB2YWx1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgfVxufTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyAgTGVnZW5kIGNvbXBvbmVudC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuLi9jb25zdCcpLFxuICAgIGRvbSA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZG9tSGFuZGxlcicpLFxuICAgIHJlbmRlclV0aWwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3JlbmRlclV0aWwnKSxcbiAgICBkZWZhdWx0VGhlbWUgPSByZXF1aXJlKCcuLi90aGVtZXMvZGVmYXVsdFRoZW1lJyksXG4gICAgbGVnZW5kVGVtcGxhdGUgPSByZXF1aXJlKCcuLy4uL2xlZ2VuZHMvbGVnZW5kVGVtcGxhdGUnKTtcblxudmFyIExlZ2VuZCA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgTGVnZW5kLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogTGVnZW5kIGNvbXBvbmVudC5cbiAgICAgKiBAY29uc3RydWN0cyBMZWdlbmRcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubGVnZW5kTGFiZWxzIGxlZ2VuZCBsYWJlbHNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuYm91bmQgYXhpcyBib3VuZFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBheGlzIHRoZW1lXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHR1aS51dGlsLmV4dGVuZCh0aGlzLCBwYXJhbXMpO1xuICAgICAgICAvKipcbiAgICAgICAgICogTGVnZW5kIHZpZXcgY2xhc3NOYW1lXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNsYXNzTmFtZSA9ICd0dWktY2hhcnQtbGVnZW5kLWFyZWEnO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgbGVnZW5kLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBib3VuZCBwbG90IGJvdW5kXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSBsZWdlbmQgZWxlbWVudFxuICAgICAqL1xuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBlbCA9IGRvbS5jcmVhdGUoJ0RJVicsIHRoaXMuY2xhc3NOYW1lKTtcbiAgICAgICAgZWwuaW5uZXJIVE1MID0gdGhpcy5fbWFrZUxlZ2VuZEh0bWwoKTtcbiAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJQb3NpdGlvbihlbCwgdGhpcy5ib3VuZC5wb3NpdGlvbik7XG4gICAgICAgIHRoaXMuX3JlbmRlckxhYmVsVGhlbWUoZWwsIHRoaXMudGhlbWUubGFiZWwpO1xuXG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHRoZW1lIGZvciBsZWdlbmQgbGFiZWxzXG4gICAgICogQHBhcmFtIHthcnJheS48b2JqZWN0Pn0gbGFiZWxzIGxhYmVsc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBsZWdlbmQgdGhlbWVcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPG9iamVjdD59IGxhYmVsc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldFRoZW1lRm9yTGFiZWxzOiBmdW5jdGlvbihsYWJlbHMsIHRoZW1lKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSB0dWkudXRpbC5tYXAobGFiZWxzLCBmdW5jdGlvbihpdGVtLCBpbmRleCkge1xuICAgICAgICAgICAgdmFyIGl0ZW1UaGVtZSA9IHtcbiAgICAgICAgICAgICAgICBjb2xvcjogdGhlbWUuY29sb3JzW2luZGV4XVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKHRoZW1lLnNpbmdsZUNvbG9ycykge1xuICAgICAgICAgICAgICAgIGl0ZW1UaGVtZS5zaW5nbGVDb2xvciA9IHRoZW1lLnNpbmdsZUNvbG9yc1tpbmRleF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhlbWUuYm9yZGVyQ29sb3IpIHtcbiAgICAgICAgICAgICAgICBpdGVtVGhlbWUuYm9yZGVyQ29sb3IgPSB0aGVtZS5ib3JkZXJDb2xvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGl0ZW0udGhlbWUgPSBpdGVtVGhlbWU7XG4gICAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBsZWdlbmQgbGFiZWxzLlxuICAgICAqIEByZXR1cm5zIHthcnJheS48b2JqZWN0Pn0gbGVnZW5kIGxhYmVscy5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlTGVnZW5kTGFiZWxzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNoYXJ0VHlwZSA9IHRoaXMuY2hhcnRUeXBlLFxuICAgICAgICAgICAgbGVnZW5kTGFiZWxzID0gdGhpcy5sZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICBqb2luTGVnZW5kTGFiZWxzID0gdGhpcy5qb2luTGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgbGFiZWxMZW4gPSBsZWdlbmRMYWJlbHMubGVuZ3RoLFxuICAgICAgICAgICAgdGhlbWUgPSB0aGlzLnRoZW1lLFxuICAgICAgICAgICAgY2hhcnRMZWdlbmRUaGVtZSA9IHR1aS51dGlsLmZpbHRlcih0aGVtZSwgZnVuY3Rpb24oaXRlbSwgbmFtZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0dWkudXRpbC5pbkFycmF5KG5hbWUsIGNoYXJ0Q29uc3QuU0VSSUVTX1BST1BTKSA9PT0gLTEgJiYgbmFtZSAhPT0gJ2xhYmVsJztcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgY2hhcnRUeXBlcyA9IHR1aS51dGlsLmtleXMoY2hhcnRMZWdlbmRUaGVtZSksXG4gICAgICAgICAgICBkZWZhdWx0TGVnZW5kVGhlbWUgPSB7XG4gICAgICAgICAgICAgICAgY29sb3JzOiBkZWZhdWx0VGhlbWUuc2VyaWVzLmNvbG9yc1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNoYXJ0VGhlbWUsIHJlc3VsdDtcblxuICAgICAgICBpZiAoIWNoYXJ0VHlwZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9zZXRUaGVtZUZvckxhYmVscyhqb2luTGVnZW5kTGFiZWxzLCB0aGVtZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjaGFydFRoZW1lID0gdGhlbWVbY2hhcnRUeXBlXSB8fCBkZWZhdWx0TGVnZW5kVGhlbWU7XG4gICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9zZXRUaGVtZUZvckxhYmVscyhqb2luTGVnZW5kTGFiZWxzLnNsaWNlKDAsIGxhYmVsTGVuKSwgY2hhcnRUaGVtZSk7XG4gICAgICAgICAgICBjaGFydFRoZW1lID0gdGhlbWVbdHVpLnV0aWwuZmlsdGVyKGNoYXJ0VHlwZXMsIGZ1bmN0aW9uKHByb3BOYW1lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb3BOYW1lICE9PSBjaGFydFR5cGU7XG4gICAgICAgICAgICB9KVswXV0gfHwgZGVmYXVsdExlZ2VuZFRoZW1lO1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdCh0aGlzLl9zZXRUaGVtZUZvckxhYmVscyhqb2luTGVnZW5kTGFiZWxzLnNsaWNlKGxhYmVsTGVuKSwgY2hhcnRUaGVtZSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgbGVnZW5kIGh0bWwuXG4gICAgICogQHJldHVybnMge3N0cmluZ30gbGVnZW5kIGh0bWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlTGVnZW5kSHRtbDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBsYWJlbHMgPSB0aGlzLl9tYWtlTGVnZW5kTGFiZWxzKCksXG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IGxlZ2VuZFRlbXBsYXRlLnRwbExlZ2VuZCxcbiAgICAgICAgICAgIGxhYmVsSGVpZ2h0ID0gcmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsSGVpZ2h0KGxhYmVsc1swXS5sYWJlbCwgbGFiZWxzWzBdLnRoZW1lKSArIChjaGFydENvbnN0LkxBQkVMX1BBRERJTkdfVE9QICogMiksXG4gICAgICAgICAgICBiYXNlTWFyZ2luVG9wID0gcGFyc2VJbnQoKGxhYmVsSGVpZ2h0IC0gY2hhcnRDb25zdC5MRUdFTkRfUkVDVF9XSURUSCkgLyAyLCAxMCkgLSAxLFxuICAgICAgICAgICAgaHRtbCA9IHR1aS51dGlsLm1hcChsYWJlbHMsIGZ1bmN0aW9uKGxhYmVsKSB7XG4gICAgICAgICAgICAgICAgdmFyIGJvcmRlckNzc1RleHQgPSBsYWJlbC5ib3JkZXJDb2xvciA/IHJlbmRlclV0aWwuY29uY2F0U3RyKCc7Ym9yZGVyOjFweCBzb2xpZCAnLCBsYWJlbC5ib3JkZXJDb2xvcikgOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgcmVjdE1hcmdpbiwgbWFyZ2luVG9wLCBkYXRhO1xuICAgICAgICAgICAgICAgIGlmIChsYWJlbC5jaGFydFR5cGUgPT09ICdsaW5lJykge1xuICAgICAgICAgICAgICAgICAgICBtYXJnaW5Ub3AgPSBiYXNlTWFyZ2luVG9wICsgY2hhcnRDb25zdC5MSU5FX01BUkdJTl9UT1A7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luVG9wID0gYmFzZU1hcmdpblRvcDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVjdE1hcmdpbiA9IHJlbmRlclV0aWwuY29uY2F0U3RyKCc7bWFyZ2luLXRvcDonLCBtYXJnaW5Ub3AsICdweCcpO1xuXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgY3NzVGV4dDogcmVuZGVyVXRpbC5jb25jYXRTdHIoJ2JhY2tncm91bmQtY29sb3I6JywgbGFiZWwudGhlbWUuc2luZ2xlQ29sb3IgfHwgbGFiZWwudGhlbWUuY29sb3IsIGJvcmRlckNzc1RleHQsIHJlY3RNYXJnaW4pLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IGxhYmVsSGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICBjaGFydFR5cGU6IGxhYmVsLmNoYXJ0VHlwZSB8fCAncmVjdCcsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiBsYWJlbC5sYWJlbFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRlbXBsYXRlKGRhdGEpO1xuICAgICAgICAgICAgfSwgdGhpcykuam9pbignJyk7XG4gICAgICAgIHJldHVybiBodG1sO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgY3NzIHN0eWxlIG9mIGxhYmVsIGFyZWEuXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgbGFiZWwgYXJlYSBlbGVtZW50XG4gICAgICogQHBhcmFtIHt7Zm9udFNpemU6bnVtYmVyLCBmb250RmFtaWx5OiBzdHJpbmcsIGNvbG9yOiBzdHJpbmd9fSB0aGVtZSBsYWJlbCB0aGVtZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlckxhYmVsVGhlbWU6IGZ1bmN0aW9uKGVsLCB0aGVtZSkge1xuICAgICAgICB2YXIgY3NzVGV4dCA9IHJlbmRlclV0aWwubWFrZUZvbnRDc3NUZXh0KHRoZW1lKTtcbiAgICAgICAgZWwuc3R5bGUuY3NzVGV4dCArPSAnOycgKyBjc3NUZXh0O1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IExlZ2VuZDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBUaGlzIGlzIHRlbXBsYXRlcyBvZiBsZWdlbmQgdmlldy5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbnZhciB0ZW1wbGF0ZU1ha2VyID0gcmVxdWlyZSgnLi4vaGVscGVycy90ZW1wbGF0ZU1ha2VyJyk7XG5cbnZhciB0YWdzID0ge1xuICAgIEhUTUxfTEVHRU5EOiAnPGRpdiBjbGFzcz1cInR1aS1jaGFydC1sZWdlbmRcIj4nICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJ0dWktY2hhcnQtbGVnZW5kLXJlY3Qge3sgY2hhcnRUeXBlIH19XCIgc3R5bGU9XCJ7eyBjc3NUZXh0IH19XCI+PC9kaXY+JyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwidHVpLWNoYXJ0LWxlZ2VuZC1sYWJlbFwiIHN0eWxlPVwiaGVpZ2h0Ont7IGhlaWdodCB9fXB4XCI+e3sgbGFiZWwgfX08L2Rpdj48L2Rpdj4nXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICB0cGxMZWdlbmQ6IHRlbXBsYXRlTWFrZXIudGVtcGxhdGUodGFncy5IVE1MX0xFR0VORClcbn07XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgUGxvdCBjb21wb25lbnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBkb20gPSByZXF1aXJlKCcuLi9oZWxwZXJzL2RvbUhhbmRsZXInKSxcbiAgICBjYWxjdWxhdG9yID0gcmVxdWlyZSgnLi4vaGVscGVycy9jYWxjdWxhdG9yJyksXG4gICAgcmVuZGVyVXRpbCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvcmVuZGVyVXRpbCcpLFxuICAgIHBsb3RUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vcGxvdFRlbXBsYXRlJyk7XG5cbnZhciBQbG90ID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBQbG90LnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogUGxvdCBjb21wb25lbnQuXG4gICAgICogQGNvbnN0cnVjdHMgUGxvdFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy52VGlja0NvdW50IHZlcnRpY2FsIHRpY2sgY291bnRcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuaFRpY2tDb3VudCBob3Jpem9udGFsIHRpY2sgY291bnRcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuYm91bmQgYXhpcyBib3VuZFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBheGlzIHRoZW1lXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHR1aS51dGlsLmV4dGVuZCh0aGlzLCBwYXJhbXMpO1xuICAgICAgICAvKipcbiAgICAgICAgICogUGxvdCB2aWV3IGNsYXNzTmFtZVxuICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jbGFzc05hbWUgPSAndHVpLWNoYXJ0LXBsb3QtYXJlYSc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBwbG90LlxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCB0b3A6IG51bWJlciwgcmlnaHQ6IG51bWJlcn19IGJvdW5kIHBsb3QgYXJlYSBib3VuZFxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gcGxvdCBlbGVtZW50XG4gICAgICovXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGVsID0gZG9tLmNyZWF0ZSgnRElWJywgdGhpcy5jbGFzc05hbWUpLFxuICAgICAgICAgICAgYm91bmQgPSB0aGlzLmJvdW5kO1xuICAgICAgICByZW5kZXJVdGlsLnJlbmRlckRpbWVuc2lvbihlbCwgYm91bmQuZGltZW5zaW9uKTtcbiAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJQb3NpdGlvbihlbCwgYm91bmQucG9zaXRpb24pO1xuICAgICAgICB0aGlzLl9yZW5kZXJMaW5lcyhlbCwgYm91bmQuZGltZW5zaW9uKTtcblxuICAgICAgICByZXR1cm4gZWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBwbG90IGxpbmVzLlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGRpbWVuc2lvbiBwbG90IGFyZWEgZGltZW5zaW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyTGluZXM6IGZ1bmN0aW9uKGVsLCBkaW1lbnNpb24pIHtcbiAgICAgICAgdmFyIGhQb3NpdGlvbnMgPSB0aGlzLl9tYWtlSG9yaXpvbnRhbFBpeGVsUG9zaXRpb25zKGRpbWVuc2lvbi53aWR0aCksXG4gICAgICAgICAgICB2UG9zaXRpb25zID0gdGhpcy5fbWFrZVZlcnRpY2FsUGl4ZWxQb3NpdGlvbnMoZGltZW5zaW9uLmhlaWdodCksXG4gICAgICAgICAgICB0aGVtZSA9IHRoaXMudGhlbWUsXG4gICAgICAgICAgICBsaW5lSHRtbCA9ICcnO1xuXG4gICAgICAgIGxpbmVIdG1sICs9IHRoaXMuX21ha2VMaW5lSHRtbCh7XG4gICAgICAgICAgICBwb3NpdGlvbnM6IGhQb3NpdGlvbnMsXG4gICAgICAgICAgICBzaXplOiBkaW1lbnNpb24uaGVpZ2h0LFxuICAgICAgICAgICAgY2xhc3NOYW1lOiAndmVydGljYWwnLFxuICAgICAgICAgICAgcG9zaXRpb25UeXBlOiAnbGVmdCcsXG4gICAgICAgICAgICBzaXplVHlwZTogJ2hlaWdodCcsXG4gICAgICAgICAgICBsaW5lQ29sb3I6IHRoZW1lLmxpbmVDb2xvclxuICAgICAgICB9KTtcbiAgICAgICAgbGluZUh0bWwgKz0gdGhpcy5fbWFrZUxpbmVIdG1sKHtcbiAgICAgICAgICAgIHBvc2l0aW9uczogdlBvc2l0aW9ucyxcbiAgICAgICAgICAgIHNpemU6IGRpbWVuc2lvbi53aWR0aCxcbiAgICAgICAgICAgIGNsYXNzTmFtZTogJ2hvcml6b250YWwnLFxuICAgICAgICAgICAgcG9zaXRpb25UeXBlOiAnYm90dG9tJyxcbiAgICAgICAgICAgIHNpemVUeXBlOiAnd2lkdGgnLFxuICAgICAgICAgICAgbGluZUNvbG9yOiB0aGVtZS5saW5lQ29sb3JcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZWwuaW5uZXJIVE1MID0gbGluZUh0bWw7XG5cbiAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJCYWNrZ3JvdW5kKGVsLCB0aGVtZS5iYWNrZ3JvdW5kKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBodG1sIG9mIHBsb3QgbGluZS5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPG9iamVjdD59IHBhcmFtcy5wb3NpdGlvbnMgcG9zaXRpb25zXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnNpemUgd2lkdGggb3IgaGVpZ2h0XG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLmNsYXNzTmFtZSBsaW5lIGNsYXNzTmFtZVxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5wb3NpdGlvblR5cGUgcG9zaXRpb24gdHlwZSAobGVmdCBvciBib3R0b20pXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLnNpemVUeXBlIHNpemUgdHlwZSAoc2l6ZSBvciBoZWlnaHQpXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLmxpbmVDb2xvciBsaW5lIGNvbG9yXG4gICAgICogQHJldHVybnMge3N0cmluZ30gaHRtbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VMaW5lSHRtbDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciB0ZW1wbGF0ZSA9IHBsb3RUZW1wbGF0ZS50cGxQbG90TGluZSxcbiAgICAgICAgICAgIGxpbmVIdG1sID0gdHVpLnV0aWwubWFwKHBhcmFtcy5wb3NpdGlvbnMsIGZ1bmN0aW9uKHBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNzc1RleHRzID0gW1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyVXRpbC5jb25jYXRTdHIocGFyYW1zLnBvc2l0aW9uVHlwZSwgJzonLCBwb3NpdGlvbiwgJ3B4JyksXG4gICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJVdGlsLmNvbmNhdFN0cihwYXJhbXMuc2l6ZVR5cGUsICc6JywgcGFyYW1zLnNpemUsICdweCcpXG4gICAgICAgICAgICAgICAgICAgIF0sIGRhdGE7XG5cbiAgICAgICAgICAgICAgICBpZiAocGFyYW1zLmxpbmVDb2xvcikge1xuICAgICAgICAgICAgICAgICAgICBjc3NUZXh0cy5wdXNoKHJlbmRlclV0aWwuY29uY2F0U3RyKCdiYWNrZ3JvdW5kLWNvbG9yOicsIHBhcmFtcy5saW5lQ29sb3IpKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBkYXRhID0ge2NsYXNzTmFtZTogcGFyYW1zLmNsYXNzTmFtZSwgY3NzVGV4dDogY3NzVGV4dHMuam9pbignOycpfTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGVtcGxhdGUoZGF0YSk7XG4gICAgICAgICAgICB9LCB0aGlzKS5qb2luKCcnKTtcbiAgICAgICAgcmV0dXJuIGxpbmVIdG1sO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHBpeGVsIHZhbHVlIG9mIHZlcnRpY2FsIHBvc2l0aW9uc1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgcGxvdCBoZWlnaHRcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPG51bWJlcj59IHBvc2l0aW9uc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VWZXJ0aWNhbFBpeGVsUG9zaXRpb25zOiBmdW5jdGlvbihoZWlnaHQpIHtcbiAgICAgICAgdmFyIHBvc2l0aW9ucyA9IGNhbGN1bGF0b3IubWFrZVRpY2tQaXhlbFBvc2l0aW9ucyhoZWlnaHQsIHRoaXMudlRpY2tDb3VudCk7XG4gICAgICAgIHBvc2l0aW9ucy5zaGlmdCgpO1xuICAgICAgICByZXR1cm4gcG9zaXRpb25zO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHBpeGVsIHZhbHVlIG9mIGhvcml6b250YWwgcG9zaXRpb25zLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aCBwbG90IHdpZHRoXG4gICAgICogQHJldHVybnMge2FycmF5LjxudW1iZXI+fSBwb3NpdGlvbnNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlSG9yaXpvbnRhbFBpeGVsUG9zaXRpb25zOiBmdW5jdGlvbih3aWR0aCkge1xuICAgICAgICB2YXIgcG9zaXRpb25zID0gY2FsY3VsYXRvci5tYWtlVGlja1BpeGVsUG9zaXRpb25zKHdpZHRoLCB0aGlzLmhUaWNrQ291bnQpO1xuICAgICAgICBwb3NpdGlvbnMuc2hpZnQoKTtcbiAgICAgICAgcmV0dXJuIHBvc2l0aW9ucztcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBQbG90O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFRoaXMgaXMgdGVtcGxhdGVzIG9mIHBsb3QgdmlldyAuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG52YXIgdGVtcGxhdGVNYWtlciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvdGVtcGxhdGVNYWtlcicpO1xuXG52YXIgdGFncyA9IHtcbiAgICBIVE1MX1BMT1RfTElORTogJzxkaXYgY2xhc3M9XCJ0dWktY2hhcnQtcGxvdC1saW5lIHt7IGNsYXNzTmFtZSB9fVwiIHN0eWxlPVwie3sgY3NzVGV4dCB9fVwiPjwvZGl2Pidcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHRwbFBsb3RMaW5lOiB0ZW1wbGF0ZU1ha2VyLnRlbXBsYXRlKHRhZ3MuSFRNTF9QTE9UX0xJTkUpXG59O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFJhcGhhZWwgcmVuZGVyIHBsdWdpbi5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIEJhckNoYXJ0ID0gcmVxdWlyZSgnLi9yYXBoYWVsQmFyQ2hhcnQnKSxcbiAgICBMaW5lQ2hhcnQgPSByZXF1aXJlKCcuL3JhcGhhZWxMaW5lQ2hhcnQnKSxcbiAgICBBcmVhQ2hhcnQgPSByZXF1aXJlKCcuL3JhcGhhZWxBcmVhQ2hhcnQnKSxcbiAgICBQaWVDaGFydCA9IHJlcXVpcmUoJy4vcmFwaGFlbFBpZUNoYXJ0Jyk7XG5cbnZhciBwbHVnaW5OYW1lID0gJ3JhcGhhZWwnLFxuICAgIHBsdWdpblJhcGhhZWw7XG5cbnBsdWdpblJhcGhhZWwgPSB7XG4gICAgYmFyOiBCYXJDaGFydCxcbiAgICBjb2x1bW46IEJhckNoYXJ0LFxuICAgIGxpbmU6IExpbmVDaGFydCxcbiAgICBhcmVhOiBBcmVhQ2hhcnQsXG4gICAgcGllOiBQaWVDaGFydFxufTtcblxudHVpLmNoYXJ0LnJlZ2lzdGVyUGx1Z2luKHBsdWdpbk5hbWUsIHBsdWdpblJhcGhhZWwpO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFJhcGhhZWwgYXJlYSBjaGFydCByZW5kZXJlci5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJhcGhhZWxMaW5lQmFzZSA9IHJlcXVpcmUoJy4vcmFwaGFlbExpbmVUeXBlQmFzZScpLFxuICAgIHJhcGhhZWxSZW5kZXJVdGlsID0gcmVxdWlyZSgnLi9yYXBoYWVsUmVuZGVyVXRpbCcpO1xuXG52YXIgUmFwaGFlbCA9IHdpbmRvdy5SYXBoYWVsLFxuICAgIEFOSU1BVElPTl9USU1FID0gNzAwO1xuXG52YXIgY29uY2F0ID0gQXJyYXkucHJvdG90eXBlLmNvbmNhdDtcblxuLyoqXG4gKiBAY2xhc3NkZXNjIFJhcGhhZWxBcmVhQ2hhcnQgaXMgZ3JhcGggcmVuZGVyZXIgZm9yIGFyZWEgY2hhcnQuXG4gKiBAY2xhc3MgUmFwaGFlbEFyZWFDaGFydFxuICogQGV4dGVuZHMgUmFwaGFlbExpbmVUeXBlQmFzZVxuICovXG52YXIgUmFwaGFlbEFyZWFDaGFydCA9IHR1aS51dGlsLmRlZmluZUNsYXNzKFJhcGhhZWxMaW5lQmFzZSwgLyoqIEBsZW5kcyBSYXBoYWVsQXJlYUNoYXJ0LnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogUmVuZGVyIGZ1bmN0aW9uIG9mIGFyZWEgY2hhcnQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY29udGFpbmVyXG4gICAgICogQHBhcmFtIHt7Z3JvdXBQb3NpdGlvbnM6IGFycmF5LjxhcnJheT4sIGRpbWVuc2lvbjogb2JqZWN0LCB0aGVtZTogb2JqZWN0LCBvcHRpb25zOiBvYmplY3R9fSBkYXRhIHJlbmRlciBkYXRhXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gaW5DYWxsYmFjayBpbiBjYWxsYmFja1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG91dENhbGxiYWNrIG91dCBjYWxsYmFja1xuICAgICAqIEByZXR1cm4ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqL1xuICAgIHJlbmRlcjogZnVuY3Rpb24ocGFwZXIsIGNvbnRhaW5lciwgZGF0YSwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGRpbWVuc2lvbiA9IGRhdGEuZGltZW5zaW9uLFxuICAgICAgICAgICAgZ3JvdXBQb3NpdGlvbnMgPSBkYXRhLmdyb3VwUG9zaXRpb25zLFxuICAgICAgICAgICAgdGhlbWUgPSBkYXRhLnRoZW1lLFxuICAgICAgICAgICAgY29sb3JzID0gdGhlbWUuY29sb3JzLFxuICAgICAgICAgICAgb3BhY2l0eSA9IGRhdGEub3B0aW9ucy5oYXNEb3QgPyAxIDogMCxcbiAgICAgICAgICAgIGdyb3VwUGF0aHMgPSB0aGlzLl9nZXRBcmVhc1BhdGgoZ3JvdXBQb3NpdGlvbnMsIGRhdGEuemVyb1RvcCksXG4gICAgICAgICAgICBib3JkZXJTdHlsZSA9IHRoaXMubWFrZUJvcmRlclN0eWxlKHRoZW1lLmJvcmRlckNvbG9yLCBvcGFjaXR5KSxcbiAgICAgICAgICAgIG91dERvdFN0eWxlID0gdGhpcy5tYWtlT3V0RG90U3R5bGUob3BhY2l0eSwgYm9yZGVyU3R5bGUpLFxuICAgICAgICAgICAgZ3JvdXBBcmVhcywgdG9vbHRpcExpbmUsIGdyb3VwRG90cztcblxuICAgICAgICBpZiAoIXBhcGVyKSB7XG4gICAgICAgICAgICBwYXBlciA9IFJhcGhhZWwoY29udGFpbmVyLCBkaW1lbnNpb24ud2lkdGgsIGRpbWVuc2lvbi5oZWlnaHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgZ3JvdXBBcmVhcyA9IHRoaXMuX3JlbmRlckFyZWFzKHBhcGVyLCBncm91cFBhdGhzLCBjb2xvcnMpO1xuICAgICAgICB0b29sdGlwTGluZSA9IHRoaXMuX3JlbmRlclRvb2x0aXBMaW5lKHBhcGVyLCBkaW1lbnNpb24uaGVpZ2h0KTtcbiAgICAgICAgZ3JvdXBEb3RzID0gdGhpcy5yZW5kZXJEb3RzKHBhcGVyLCBncm91cFBvc2l0aW9ucywgY29sb3JzLCBib3JkZXJTdHlsZSk7XG5cbiAgICAgICAgdGhpcy5vdXREb3RTdHlsZSA9IG91dERvdFN0eWxlO1xuICAgICAgICB0aGlzLmdyb3VwUGF0aHMgPSBncm91cFBhdGhzO1xuICAgICAgICB0aGlzLmdyb3VwQXJlYXMgPSBncm91cEFyZWFzO1xuICAgICAgICB0aGlzLnRvb2x0aXBMaW5lID0gdG9vbHRpcExpbmU7XG4gICAgICAgIHRoaXMuZ3JvdXBEb3RzID0gZ3JvdXBEb3RzO1xuICAgICAgICB0aGlzLmRvdE9wYWNpdHkgPSBvcGFjaXR5O1xuXG4gICAgICAgIHRoaXMuYXR0YWNoRXZlbnQoZ3JvdXBEb3RzLCBncm91cFBvc2l0aW9ucywgb3V0RG90U3R5bGUsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKTtcblxuICAgICAgICByZXR1cm4gcGFwZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBhcmVhIGdyYXBoLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciBwYXBlclxuICAgICAqIEBwYXJhbSB7e3N0YXJ0OiBzdHJpbmcsIGFkZFN0YXJ0OiBzdHJpbmd9fSBwYXRoIHBhdGhcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29sb3IgY29sb3JcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPG9iamVjdD59IHJhcGhhZWwgb2JqZWN0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyQXJlYTogZnVuY3Rpb24ocGFwZXIsIHBhdGgsIGNvbG9yKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBbXSxcbiAgICAgICAgICAgIGFyZWEgPSBwYXBlci5wYXRoKFtwYXRoLnN0YXJ0XSksXG4gICAgICAgICAgICBmaWxsU3R5bGUgPSB7XG4gICAgICAgICAgICAgICAgZmlsbDogY29sb3IsXG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMC41LFxuICAgICAgICAgICAgICAgIHN0cm9rZTogY29sb3IsXG4gICAgICAgICAgICAgICAgJ3N0cm9rZS1vcGFjaXR5JzogMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGFkZEFyZWE7XG5cbiAgICAgICAgYXJlYS5hdHRyKGZpbGxTdHlsZSk7XG4gICAgICAgIHJlc3VsdC5wdXNoKGFyZWEpO1xuXG4gICAgICAgIGlmIChwYXRoLmFkZFN0YXJ0KSB7XG4gICAgICAgICAgICBhZGRBcmVhID0gcGFwZXIucGF0aChbcGF0aC5hZGRTdGFydF0pO1xuICAgICAgICAgICAgYWRkQXJlYS5hdHRyKGZpbGxTdHlsZSk7XG4gICAgICAgICAgICByZXN1bHQucHVzaChhZGRBcmVhKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgYXJlYSBncmFwaHMuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIHBhcGVyXG4gICAgICogQHBhcmFtIHthcnJheS48b2JqZWN0Pn0gZ3JvdXBQYXRocyBncm91cCBwYXRoc1xuICAgICAqIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGNvbG9ycyBjb2xvcnNcbiAgICAgKiBAcmV0dXJucyB7YXJyYXl9IHJhcGhhZWwgb2JqZWN0c1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlckFyZWFzOiBmdW5jdGlvbihwYXBlciwgZ3JvdXBQYXRocywgY29sb3JzKSB7XG4gICAgICAgIHZhciBncm91cEFyZWFzID0gdHVpLnV0aWwubWFwKGdyb3VwUGF0aHMsIGZ1bmN0aW9uKHBhdGhzLCBncm91cEluZGV4KSB7XG4gICAgICAgICAgICB2YXIgY29sb3IgPSBjb2xvcnNbZ3JvdXBJbmRleF0gfHwgJ3RyYW5zcGFyZW50JztcbiAgICAgICAgICAgIHJldHVybiB0dWkudXRpbC5tYXAocGF0aHMsIGZ1bmN0aW9uKHBhdGgpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgICAgICBhcmVhOiB0aGlzLl9yZW5kZXJBcmVhKHBhcGVyLCBwYXRoLmFyZWEsIGNvbG9yKSxcbiAgICAgICAgICAgICAgICAgICAgbGluZTogcmFwaGFlbFJlbmRlclV0aWwucmVuZGVyTGluZShwYXBlciwgcGF0aC5saW5lLnN0YXJ0LCBjb2xvcilcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgcmV0dXJuIGdyb3VwQXJlYXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgbWludXMgb3Igbm90LlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSB2YWx1ZVxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSByZXN1bHQgYm9vbGVhblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2lzTWludXM6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZSA8IDA7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgcGx1cyBvciBub3QuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIHZhbHVlXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHJlc3VsdCBib29sZWFuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNQbHVzOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdmFsdWUgPj0gMDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBoZWlnaHQuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHRvcCB0b3BcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gemVyb1RvcCB6ZXJvIHBvc2l0aW9uIHRvcFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IGhlaWdodFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VIZWlnaHQ6IGZ1bmN0aW9uKHRvcCwgemVyb1RvcCkge1xuICAgICAgICByZXR1cm4gTWF0aC5hYnModG9wIC0gemVyb1RvcCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZpbmQgbWlkZGxlIGxlZnRcbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gZnJvbVBvcyBmcm9tIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IHRvUG9zIHRvIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHplcm9Ub3AgemVybyBwb3NpdGlvbiB0b3BcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBtaWRkbGUgbGVmdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2ZpbmRNaWRkbGVMZWZ0OiBmdW5jdGlvbihmcm9tUG9zLCB0b1BvcywgemVyb1RvcCkge1xuICAgICAgICB2YXIgdG9wcyA9IFt6ZXJvVG9wIC0gZnJvbVBvcy50b3AsIHplcm9Ub3AgLSB0b1Bvcy50b3BdLFxuICAgICAgICAgICAgbWlkZGxlTGVmdCwgd2lkdGgsIGZyb21IZWlnaHQsIHRvSGVpZ2h0O1xuXG4gICAgICAgIGlmICh0dWkudXRpbC5hbGwodG9wcywgdGhpcy5faXNNaW51cykgfHwgdHVpLnV0aWwuYWxsKHRvcHMsIHRoaXMuX2lzUGx1cykpIHtcbiAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZyb21IZWlnaHQgPSB0aGlzLl9tYWtlSGVpZ2h0KGZyb21Qb3MudG9wLCB6ZXJvVG9wKTtcbiAgICAgICAgdG9IZWlnaHQgPSB0aGlzLl9tYWtlSGVpZ2h0KHRvUG9zLnRvcCwgemVyb1RvcCk7XG4gICAgICAgIHdpZHRoID0gdG9Qb3MubGVmdCAtIGZyb21Qb3MubGVmdDtcblxuICAgICAgICBtaWRkbGVMZWZ0ID0gZnJvbVBvcy5sZWZ0ICsgKHdpZHRoICogKGZyb21IZWlnaHQgLyAoZnJvbUhlaWdodCArIHRvSGVpZ2h0KSkpO1xuICAgICAgICByZXR1cm4gbWlkZGxlTGVmdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBhcmVhIHBhdGguXG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IGZyb21Qb3MgZnJvbSBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSB0b1BvcyB0byBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB6ZXJvVG9wIHplcm8gcG9zaXRpb24gdG9wXG4gICAgICogQHJldHVybnMge3N0cmluZ30gYXJlYSBwYXRoXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUFyZWFQYXRoOiBmdW5jdGlvbihmcm9tUG9zLCB0b1BvcywgemVyb1RvcCkge1xuICAgICAgICB2YXIgZnJvbVN0YXJ0UG9pbnQgPSBbJ00nLCBmcm9tUG9zLmxlZnQsICcgJywgemVyb1RvcF0sXG4gICAgICAgICAgICBmcm9tRW5kUG9pbnQgPSB6ZXJvVG9wID09PSBmcm9tUG9zLnRvcCA/IFtdIDogWydMJywgZnJvbVBvcy5sZWZ0LCAnICcsIGZyb21Qb3MudG9wXSxcbiAgICAgICAgICAgIHRvU3RhcnRQb2ludCA9IFsnTCcsIHRvUG9zLmxlZnQsICcgJywgdG9Qb3MudG9wXSxcbiAgICAgICAgICAgIHRvRW5kUG9pbnQgPSB6ZXJvVG9wID09PSB0b1Bvcy50b3AgPyBbXSA6IFsnTCcsIHRvUG9zLmxlZnQsICcgJywgemVyb1RvcF07XG4gICAgICAgIHJldHVybiBjb25jYXQuY2FsbChbXSwgZnJvbVN0YXJ0UG9pbnQsIGZyb21FbmRQb2ludCwgdG9TdGFydFBvaW50LCB0b0VuZFBvaW50KS5qb2luKCcnKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBhcmVhIHBhdGhzLlxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBmcm9tUG9zIGZyb20gcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gdG9Qb3MgdG8gcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gemVyb1RvcCB6ZXJvIHBvc2l0aW9uIHRvcFxuICAgICAqIEByZXR1cm5zIHt7XG4gICAgICogICAgICBzdGFydDogc3RyaW5nLFxuICAgICAqICAgICAgZW5kOiBzdHJpbmcsXG4gICAgICogICAgICBhZGRTdGFydDogc3RyaW5nLFxuICAgICAqICAgICAgYWRkRW5kOiBzdHJpbmdcbiAgICAgKiB9fSBhcmVhIHBhdGhzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUFyZWFQYXRoczogZnVuY3Rpb24oZnJvbVBvcywgdG9Qb3MsIHplcm9Ub3ApIHtcbiAgICAgICAgdmFyIG1pZGRsZUxlZnQgPSB0aGlzLl9maW5kTWlkZGxlTGVmdChmcm9tUG9zLCB0b1BvcywgemVyb1RvcCksXG4gICAgICAgICAgICByZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgc3RhcnQ6IHRoaXMuX21ha2VBcmVhUGF0aChmcm9tUG9zLCBmcm9tUG9zLCB6ZXJvVG9wKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1pZGRsZVBvcztcblxuICAgICAgICBpZiAodGhpcy5faXNQbHVzKG1pZGRsZUxlZnQpKSB7XG4gICAgICAgICAgICBtaWRkbGVQb3MgPSB7bGVmdDogbWlkZGxlTGVmdCwgdG9wOiB6ZXJvVG9wfTtcbiAgICAgICAgICAgIHJlc3VsdC5lbmQgPSB0aGlzLl9tYWtlQXJlYVBhdGgoZnJvbVBvcywgbWlkZGxlUG9zLCB6ZXJvVG9wKTtcbiAgICAgICAgICAgIHJlc3VsdC5hZGRTdGFydCA9IHRoaXMuX21ha2VBcmVhUGF0aChtaWRkbGVQb3MsIG1pZGRsZVBvcywgemVyb1RvcCk7XG4gICAgICAgICAgICByZXN1bHQuYWRkRW5kID0gdGhpcy5fbWFrZUFyZWFQYXRoKG1pZGRsZVBvcywgdG9Qb3MsIHplcm9Ub3ApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0LmVuZCA9IHRoaXMuX21ha2VBcmVhUGF0aChmcm9tUG9zLCB0b1BvcywgemVyb1RvcCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgYXJlYSBwYXRoLlxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gZ3JvdXBQb3NpdGlvbnMgcG9zaXRpb25zXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHplcm9Ub3AgemVybyB0b3BcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxzdHJpbmc+Pn0gcGF0aHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRBcmVhc1BhdGg6IGZ1bmN0aW9uKGdyb3VwUG9zaXRpb25zLCB6ZXJvVG9wKSB7XG4gICAgICAgIHZhciBncm91cFBhdGhzID0gdHVpLnV0aWwubWFwKGdyb3VwUG9zaXRpb25zLCBmdW5jdGlvbihwb3NpdGlvbnMpIHtcbiAgICAgICAgICAgIHZhciBmcm9tUG9zID0gcG9zaXRpb25zWzBdLFxuICAgICAgICAgICAgICAgIHJlc3QgPSBwb3NpdGlvbnMuc2xpY2UoMSk7XG4gICAgICAgICAgICByZXR1cm4gdHVpLnV0aWwubWFwKHJlc3QsIGZ1bmN0aW9uKHBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgYXJlYTogdGhpcy5fbWFrZUFyZWFQYXRocyhmcm9tUG9zLCBwb3NpdGlvbiwgemVyb1RvcCksXG4gICAgICAgICAgICAgICAgICAgIGxpbmU6IHRoaXMubWFrZUxpbmVQYXRoKGZyb21Qb3MsIHBvc2l0aW9uKVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgZnJvbVBvcyA9IHBvc2l0aW9uO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIHJldHVybiBncm91cFBhdGhzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBbmltYXRlIGFyZWEgY2hhcnQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGFyZWEgcmFwaGFlbCBvYmplY3RcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gYXJlYVBhdGggcGF0aFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB0aW1lIHBsYXkgdGltZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdGFydFRpbWUgc3RhcnQgdGltZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2FuaW1hdGVBcmVhOiBmdW5jdGlvbihhcmVhLCBhcmVhUGF0aCwgdGltZSwgc3RhcnRUaW1lKSB7XG4gICAgICAgIHZhciBhcmVhQWRkRW5kUGF0aCA9IGFyZWFQYXRoLmFkZEVuZCxcbiAgICAgICAgICAgIGFyZWFFbmRQYXRoID0gYXJlYVBhdGguZW5kO1xuICAgICAgICBpZiAoYXJlYUFkZEVuZFBhdGgpIHtcbiAgICAgICAgICAgIHRpbWUgPSB0aW1lIC8gMjtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgYXJlYVsxXS5hbmltYXRlKHtwYXRoOiBhcmVhQWRkRW5kUGF0aCwgJ3N0cm9rZS1vcGFjaXR5JzogMC4yNX0sIHRpbWUpO1xuICAgICAgICAgICAgfSwgc3RhcnRUaW1lICsgdGltZSk7XG4gICAgICAgIH1cbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGFyZWFbMF0uYW5pbWF0ZSh7cGF0aDogYXJlYUVuZFBhdGgsICdzdHJva2Utb3BhY2l0eSc6IDAuMjV9LCB0aW1lKTtcbiAgICAgICAgfSwgc3RhcnRUaW1lKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQW5pbWF0ZS5cbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayBjYWxsYmFja1xuICAgICAqL1xuICAgIGFuaW1hdGU6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBncm91cEFyZWFzID0gdGhpcy5ncm91cEFyZWFzLFxuICAgICAgICAgICAgZ3JvdXBQYXRocyA9IHRoaXMuZ3JvdXBQYXRocyxcbiAgICAgICAgICAgIG9wYWNpdHkgPSB0aGlzLmRvdE9wYWNpdHksXG4gICAgICAgICAgICB0aW1lID0gQU5JTUFUSU9OX1RJTUUgLyBncm91cEFyZWFzWzBdLmxlbmd0aCxcbiAgICAgICAgICAgIHN0YXJ0VGltZTtcbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaEFycmF5KHRoaXMuZ3JvdXBEb3RzLCBmdW5jdGlvbihkb3RzLCBncm91cEluZGV4KSB7XG4gICAgICAgICAgICBzdGFydFRpbWUgPSAwO1xuICAgICAgICAgICAgdHVpLnV0aWwuZm9yRWFjaEFycmF5KGRvdHMsIGZ1bmN0aW9uKGRvdCwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgYXJlYSwgYXJlYVBhdGg7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIGFyZWEgPSBncm91cEFyZWFzW2dyb3VwSW5kZXhdW2luZGV4IC0gMV07XG4gICAgICAgICAgICAgICAgICAgIGFyZWFQYXRoID0gZ3JvdXBQYXRoc1tncm91cEluZGV4XVtpbmRleCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFuaW1hdGVMaW5lKGFyZWEubGluZSwgYXJlYVBhdGgubGluZS5lbmQsIHRpbWUsIHN0YXJ0VGltZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2FuaW1hdGVBcmVhKGFyZWEuYXJlYSwgYXJlYVBhdGguYXJlYSwgdGltZSwgc3RhcnRUaW1lKTtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRUaW1lICs9IHRpbWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKG9wYWNpdHkpIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvdC5hdHRyKHsnZmlsbC1vcGFjaXR5Jzogb3BhY2l0eX0pO1xuICAgICAgICAgICAgICAgICAgICB9LCBzdGFydFRpbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoY2FsbGJhY2ssIHN0YXJ0VGltZSk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSYXBoYWVsQXJlYUNoYXJ0O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFJhcGhhZWwgYmFyIGNoYXJ0IHJlbmRlcmVyLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xudmFyIHJhcGhhZWxSZW5kZXJVdGlsID0gcmVxdWlyZSgnLi9yYXBoYWVsUmVuZGVyVXRpbCcpO1xuXG52YXIgUmFwaGFlbCA9IHdpbmRvdy5SYXBoYWVsO1xuXG52YXIgQU5JTUFUSU9OX1RJTUUgPSA3MDA7XG5cbi8qKlxuICogQGNsYXNzZGVzYyBSYXBoYWVsQmFyQ2hhcnQgaXMgZ3JhcGggcmVuZGVyZXIgZm9yIGJhciwgY29sdW1uIGNoYXJ0LlxuICogQGNsYXNzIFJhcGhhZWxCYXJDaGFydFxuICovXG52YXIgUmFwaGFlbEJhckNoYXJ0ID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBSYXBoYWVsQmFyQ2hhcnQucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBSZW5kZXIgZnVuY3Rpb24gb2YgYmFyIGNoYXJ0XG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY29udGFpbmVyIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3tzaXplOiBvYmplY3QsIG1vZGVsOiBvYmplY3QsIG9wdGlvbnM6IG9iamVjdCwgdG9vbHRpcFBvc2l0aW9uOiBzdHJpbmd9fSBkYXRhIGNoYXJ0IGRhdGFcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBpbkNhbGxiYWNrIG1vdXNlb3ZlciBjYWxsYmFja1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG91dENhbGxiYWNrIG1vdXNlb3V0IGNhbGxiYWNrXG4gICAgICogQHJldHVybiB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICovXG4gICAgcmVuZGVyOiBmdW5jdGlvbihwYXBlciwgY29udGFpbmVyLCBkYXRhLCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjaykge1xuICAgICAgICB2YXIgZ3JvdXBCb3VuZHMgPSBkYXRhLmdyb3VwQm91bmRzLFxuICAgICAgICAgICAgZGltZW5zaW9uID0gZGF0YS5kaW1lbnNpb24sXG4gICAgICAgICAgICBiYXNlUGFyYW1zO1xuXG4gICAgICAgIGlmICghZ3JvdXBCb3VuZHMpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFwYXBlcikge1xuICAgICAgICAgICAgcGFwZXIgPSBSYXBoYWVsKGNvbnRhaW5lciwgZGltZW5zaW9uLndpZHRoLCBkaW1lbnNpb24uaGVpZ2h0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGJhc2VQYXJhbXMgPSB7XG4gICAgICAgICAgICBwYXBlcjogcGFwZXIsXG4gICAgICAgICAgICB0aGVtZTogZGF0YS50aGVtZSxcbiAgICAgICAgICAgIGdyb3VwQm91bmRzOiBncm91cEJvdW5kcyxcbiAgICAgICAgICAgIGdyb3VwVmFsdWVzOiBkYXRhLmdyb3VwVmFsdWVzLFxuICAgICAgICAgICAgY2hhcnRUeXBlOiBkYXRhLmNoYXJ0VHlwZVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuX3JlbmRlckJhcnModHVpLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgIGluQ2FsbGJhY2s6IGluQ2FsbGJhY2ssXG4gICAgICAgICAgICBvdXRDYWxsYmFjazogb3V0Q2FsbGJhY2tcbiAgICAgICAgfSwgYmFzZVBhcmFtcykpO1xuXG4gICAgICAgIHRoaXMuX3JlbmRlckJhckJvcmRlcnMoYmFzZVBhcmFtcyk7XG5cbiAgICAgICAgdGhpcy5jaGFydFR5cGUgPSBkYXRhLmNoYXJ0VHlwZTtcblxuICAgICAgICByZXR1cm4gcGFwZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciByZWN0XG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMuY29sb3Igc2VyaWVzIGNvbG9yXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLmJvcmRlckNvbG9yIHNlcmllcyBib3JkZXJDb2xvclxuICAgICAqICAgICAgQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBwYXJhbXMuYm91bmQgYm91bmRcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBiYXIgcmVjdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlckJhcjogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBib3VuZCA9IHBhcmFtcy5ib3VuZCxcbiAgICAgICAgICAgIHJlY3Q7XG4gICAgICAgIGlmIChib3VuZC53aWR0aCA8IDAgfHwgYm91bmQuaGVpZ2h0IDwgMCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICByZWN0ID0gcGFyYW1zLnBhcGVyLnJlY3QoYm91bmQubGVmdCwgYm91bmQudG9wLCBib3VuZC53aWR0aCwgYm91bmQuaGVpZ2h0KTtcbiAgICAgICAgcmVjdC5hdHRyKHtcbiAgICAgICAgICAgIGZpbGw6IHBhcmFtcy5jb2xvcixcbiAgICAgICAgICAgIHN0cm9rZTogJ25vbmUnXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiByZWN0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBCaW5kIGhvdmVyIGV2ZW50LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSByZWN0IHJhcGhhZWwgcmVjdFxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gYm91bmQgYm91bmRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgdG9vbHRpcCBpZFxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGluQ2FsbGJhY2sgaW4gY2FsbGJhY2tcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvdXRDYWxsYmFjayBvdXQgY2FsbGJhY2tcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9iaW5kSG92ZXJFdmVudDogZnVuY3Rpb24ocmVjdCwgYm91bmQsIGdyb3VwSW5kZXgsIGluZGV4LCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjaykge1xuICAgICAgICByZWN0LmhvdmVyKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaW5DYWxsYmFjayhib3VuZCwgZ3JvdXBJbmRleCwgaW5kZXgpO1xuICAgICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIG91dENhbGxiYWNrKCk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgYmFycy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMucGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqICAgICAgQHBhcmFtIHt7Y29sb3JzOiBzdHJpbmdbXSwgc2luZ2xlQ29sb3JzOiBzdHJpbmdbXSwgYm9yZGVyQ29sb3I6IHN0cmluZ319IHBhcmFtcy50aGVtZSBiYXIgY2hhcnQgdGhlbWVcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPGFycmF5Ljx7bGVmdDogbnVtYmVyLCB0b3A6bnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn0+Pn0gcGFyYW1zLmdyb3VwQm91bmRzIGJvdW5kc1xuICAgICAqICAgICAgQHBhcmFtIHtmdW5jdGlvbn0gcGFyYW1zLmluQ2FsbGJhY2sgaW4gY2FsbGJhY2tcbiAgICAgKiAgICAgIEBwYXJhbSB7ZnVuY3Rpb259IHBhcmFtcy5vdXRDYWxsYmFjayBvdXQgY2FsbGJhY2tcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJCYXJzOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIHNpbmdsZUNvbG9ycyA9IChwYXJhbXMuZ3JvdXBCb3VuZHNbMF0ubGVuZ3RoID09PSAxKSAmJiBwYXJhbXMudGhlbWUuc2luZ2xlQ29sb3JzIHx8IFtdLFxuICAgICAgICAgICAgY29sb3JzID0gcGFyYW1zLnRoZW1lLmNvbG9ycyxcbiAgICAgICAgICAgIGJhcnMgPSBbXTtcbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaEFycmF5KHBhcmFtcy5ncm91cEJvdW5kcywgZnVuY3Rpb24oYm91bmRzLCBncm91cEluZGV4KSB7XG4gICAgICAgICAgICB2YXIgc2luZ2xlQ29sb3IgPSBzaW5nbGVDb2xvcnNbZ3JvdXBJbmRleF07XG4gICAgICAgICAgICB0dWkudXRpbC5mb3JFYWNoQXJyYXkoYm91bmRzLCBmdW5jdGlvbihib3VuZCwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29sb3IsIGlkLCByZWN0LCB2YWx1ZTtcblxuICAgICAgICAgICAgICAgIGlmICghYm91bmQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbG9yID0gc2luZ2xlQ29sb3IgfHwgY29sb3JzW2luZGV4XTtcbiAgICAgICAgICAgICAgICBpZCA9IGdyb3VwSW5kZXggKyAnLScgKyBpbmRleDtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHBhcmFtcy5ncm91cFZhbHVlc1tncm91cEluZGV4XVtpbmRleF07XG4gICAgICAgICAgICAgICAgcmVjdCA9IHRoaXMuX3JlbmRlckJhcih7XG4gICAgICAgICAgICAgICAgICAgIHBhcGVyOiBwYXJhbXMucGFwZXIsXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0VHlwZTogcGFyYW1zLmNoYXJ0VHlwZSxcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IGNvbG9yLFxuICAgICAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogcGFyYW1zLnRoZW1lLmJvcmRlckNvbG9yLFxuICAgICAgICAgICAgICAgICAgICBib3VuZDogYm91bmQuc3RhcnQsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKHJlY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYmluZEhvdmVyRXZlbnQocmVjdCwgYm91bmQuZW5kLCBncm91cEluZGV4LCBpbmRleCwgcGFyYW1zLmluQ2FsbGJhY2ssIHBhcmFtcy5vdXRDYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgYmFycy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgcmVjdDogcmVjdCxcbiAgICAgICAgICAgICAgICAgICAgYm91bmQ6IGJvdW5kLmVuZCxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgdGhpcy5iYXJzID0gYmFycztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSByZWN0IHBvaW50cy5cbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDpudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gYm91bmQgcmVjdCBib3VuZFxuICAgICAqIEByZXR1cm5zIHt7XG4gICAgICogICAgICBsZWZ0VG9wOiB7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn0sXG4gICAgICogICAgICByaWdodFRvcDoge2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9LFxuICAgICAqICAgICAgcmlnaHRCb3R0b206IHtsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfSxcbiAgICAgKiAgICAgIGxlZnRCb3R0b206IHtsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfVxuICAgICAqIH19IHJlY3QgcG9pbnRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVJlY3RQb2ludHM6IGZ1bmN0aW9uKGJvdW5kKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsZWZ0VG9wOiB7XG4gICAgICAgICAgICAgICAgbGVmdDogTWF0aC5jZWlsKGJvdW5kLmxlZnQpLFxuICAgICAgICAgICAgICAgIHRvcDogTWF0aC5jZWlsKGJvdW5kLnRvcClcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByaWdodFRvcDoge1xuICAgICAgICAgICAgICAgIGxlZnQ6IE1hdGguY2VpbChib3VuZC5sZWZ0ICsgYm91bmQud2lkdGgpLFxuICAgICAgICAgICAgICAgIHRvcDogTWF0aC5jZWlsKGJvdW5kLnRvcClcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByaWdodEJvdHRvbToge1xuICAgICAgICAgICAgICAgIGxlZnQ6IE1hdGguY2VpbChib3VuZC5sZWZ0ICsgYm91bmQud2lkdGgpLFxuICAgICAgICAgICAgICAgIHRvcDogTWF0aC5jZWlsKGJvdW5kLnRvcCArIGJvdW5kLmhlaWdodClcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsZWZ0Qm90dG9tOiB7XG4gICAgICAgICAgICAgICAgbGVmdDogTWF0aC5jZWlsKGJvdW5kLmxlZnQpLFxuICAgICAgICAgICAgICAgIHRvcDogTWF0aC5jZWlsKGJvdW5kLnRvcCArIGJvdW5kLmhlaWdodClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSB0b3AgbGluZSBwYXRoLlxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJyZXIsIHRvcDogbnVtYmVyfX0gbGVmdFRvcCBsZWZ0IHRvcFxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJyZXIsIHRvcDogbnVtYmVyfX0gcmlnaHRUb3AgcmlnaHQgdG9wXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNoYXJ0VHlwZSBjaGFydCB0eXBlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIHZhbHVlXG4gICAgICogQHJldHVybnMge3N0cmluZ30gdG9wIGxpbmUgcGF0aFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VUb3BMaW5lUGF0aDogZnVuY3Rpb24obGVmdFRvcCwgcmlnaHRUb3AsIGNoYXJ0VHlwZSwgdmFsdWUpIHtcbiAgICAgICAgdmFyIGNsb25lTGVmdFRvcCA9IHR1aS51dGlsLmV4dGVuZCh7fSwgbGVmdFRvcCk7XG4gICAgICAgIGNsb25lTGVmdFRvcC5sZWZ0IC09IGNoYXJ0VHlwZSA9PT0gJ2NvbHVtbicgfHwgdmFsdWUgPCAwID8gMSA6IDA7XG4gICAgICAgIHJldHVybiByYXBoYWVsUmVuZGVyVXRpbC5tYWtlTGluZVBhdGgoY2xvbmVMZWZ0VG9wLCByaWdodFRvcCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYm9yZGVyIGxpbmVzIHBhdGhzLlxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOm51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBib3VuZCByZWN0IGJvdW5kXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNoYXJ0VHlwZSBjaGFydCB0eXBlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIHZhbHVlXG4gICAgICogQHJldHVybnMge3t0b3A6IHN0cmluZywgcmlnaHQ6IHN0cmluZywgYm90dG9tOiBzdHJpbmcsIGxlZnQ6IHN0cmluZ319IHBhdGhzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUJvcmRlckxpbmVzUGF0aHM6IGZ1bmN0aW9uKGJvdW5kLCBjaGFydFR5cGUsIHZhbHVlKSB7XG4gICAgICAgIHZhciBwb2ludHMgPSB0aGlzLl9tYWtlUmVjdFBvaW50cyhib3VuZCksXG4gICAgICAgICAgICBwYXRocyA9IHt9O1xuXG4gICAgICAgIGlmIChjaGFydFR5cGUgPT09ICdiYXInIHx8IHZhbHVlID49IDApIHtcbiAgICAgICAgICAgIHBhdGhzLnRvcCA9IHRoaXMuX21ha2VUb3BMaW5lUGF0aChwb2ludHMubGVmdFRvcCwgcG9pbnRzLnJpZ2h0VG9wLCBjaGFydFR5cGUsIHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjaGFydFR5cGUgPT09ICdjb2x1bW4nIHx8IHZhbHVlID49IDApIHtcbiAgICAgICAgICAgIHBhdGhzLnJpZ2h0ID0gcmFwaGFlbFJlbmRlclV0aWwubWFrZUxpbmVQYXRoKHBvaW50cy5yaWdodFRvcCwgcG9pbnRzLnJpZ2h0Qm90dG9tKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjaGFydFR5cGUgPT09ICdiYXInIHx8IHZhbHVlIDwgMCkge1xuICAgICAgICAgICAgcGF0aHMuYm90dG9tID0gcmFwaGFlbFJlbmRlclV0aWwubWFrZUxpbmVQYXRoKHBvaW50cy5sZWZ0Qm90dG9tLCBwb2ludHMucmlnaHRCb3R0b20pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNoYXJ0VHlwZSA9PT0gJ2NvbHVtbicgfHwgdmFsdWUgPCAwKSB7XG4gICAgICAgICAgICBwYXRocy5sZWZ0ID0gcmFwaGFlbFJlbmRlclV0aWwubWFrZUxpbmVQYXRoKHBvaW50cy5sZWZ0VG9wLCBwb2ludHMubGVmdEJvdHRvbSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGF0aHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBib3JkZXIgbGluZXM7XG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnBhcGVyIHBhcGVyXG4gICAgICogICAgICBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDpudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gcGFyYW1zLmJvdW5kIGJhciBib3VuZFxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5ib3JkZXJDb2xvciBib3JkZXIgY29sb3JcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMuY2hhcnRUeXBlIGNoYXJ0IHR5cGVcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMudmFsdWUgdmFsdWVcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSByYXBoYWVsIG9iamVjdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlckJvcmRlckxpbmVzOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGJvcmRlckxpbmVQYXRocyA9IHRoaXMuX21ha2VCb3JkZXJMaW5lc1BhdGhzKHBhcmFtcy5ib3VuZCwgcGFyYW1zLmNoYXJ0VHlwZSwgcGFyYW1zLnZhbHVlKSxcbiAgICAgICAgICAgIGxpbmVzID0ge307XG4gICAgICAgIHR1aS51dGlsLmZvckVhY2goYm9yZGVyTGluZVBhdGhzLCBmdW5jdGlvbihwYXRoLCBuYW1lKSB7XG4gICAgICAgICAgICBsaW5lc1tuYW1lXSA9IHJhcGhhZWxSZW5kZXJVdGlsLnJlbmRlckxpbmUocGFyYW1zLnBhcGVyLCBwYXRoLCBwYXJhbXMuYm9yZGVyQ29sb3IsIDEpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGxpbmVzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgYmFyIGJvcmRlcnMuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKiAgICAgIEBwYXJhbSB7e2NvbG9yczogc3RyaW5nW10sIHNpbmdsZUNvbG9yczogc3RyaW5nW10sIGJvcmRlckNvbG9yOiBzdHJpbmd9fSBwYXJhbXMudGhlbWUgYmFyIGNoYXJ0IHRoZW1lXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheS48e2xlZnQ6IG51bWJlciwgdG9wOm51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9Pj59IHBhcmFtcy5ncm91cEJvdW5kcyBib3VuZHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJCYXJCb3JkZXJzOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGJvcmRlckNvbG9yID0gcGFyYW1zLnRoZW1lLmJvcmRlckNvbG9yLFxuICAgICAgICAgICAgYm9yZGVycyA9IFtdO1xuXG4gICAgICAgIHRoaXMuYm9yZGVycyA9IGJvcmRlcnM7XG5cbiAgICAgICAgaWYgKCFib3JkZXJDb2xvcikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaEFycmF5KHBhcmFtcy5ncm91cEJvdW5kcywgZnVuY3Rpb24oYm91bmRzLCBncm91cEluZGV4KSB7XG4gICAgICAgICAgICB0dWkudXRpbC5mb3JFYWNoQXJyYXkoYm91bmRzLCBmdW5jdGlvbihib3VuZCwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUsIGJvcmRlckxpbmVzO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFib3VuZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBwYXJhbXMuZ3JvdXBWYWx1ZXNbZ3JvdXBJbmRleF1baW5kZXhdO1xuICAgICAgICAgICAgICAgIGJvcmRlckxpbmVzID0gdGhpcy5fcmVuZGVyQm9yZGVyTGluZXMoe1xuICAgICAgICAgICAgICAgICAgICBwYXBlcjogcGFyYW1zLnBhcGVyLFxuICAgICAgICAgICAgICAgICAgICBib3VuZDogYm91bmQuc3RhcnQsXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBib3JkZXJDb2xvcixcbiAgICAgICAgICAgICAgICAgICAgY2hhcnRUeXBlOiBwYXJhbXMuY2hhcnRUeXBlLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBib3JkZXJzLnB1c2goYm9yZGVyTGluZXMpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBbmltYXRlIHJlY3QuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHJlY3QgcmFwaGFlbCBvYmplY3RcbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDpudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gYm91bmQgcmVjdCBib3VuZFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2FuaW1hdGVSZWN0OiBmdW5jdGlvbihyZWN0LCBib3VuZCkge1xuICAgICAgICByZWN0LmFuaW1hdGUoe1xuICAgICAgICAgICAgeDogYm91bmQubGVmdCxcbiAgICAgICAgICAgIHk6IGJvdW5kLnRvcCxcbiAgICAgICAgICAgIHdpZHRoOiBib3VuZC53aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogYm91bmQuaGVpZ2h0XG4gICAgICAgIH0sIEFOSU1BVElPTl9USU1FKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQW5pbWF0ZSBib3JkZXJzLlxuICAgICAqIEBwYXJhbSB7YXJyYXkuPG9iamVjdD59IGxpbmVzIHJhcGhhZWwgb2JqZWN0c1xuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOm51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBib3VuZCByZWN0IGJvdW5kXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNoYXJ0VHlwZSBjaGFydCB0eXBlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIHZhbHVlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYW5pbWF0ZUJvcmRlcnM6IGZ1bmN0aW9uKGxpbmVzLCBib3VuZCwgY2hhcnRUeXBlLCB2YWx1ZSkge1xuICAgICAgICB2YXIgcGF0aHMgPSB0aGlzLl9tYWtlQm9yZGVyTGluZXNQYXRocyhib3VuZCwgY2hhcnRUeXBlLCB2YWx1ZSk7XG4gICAgICAgIHR1aS51dGlsLmZvckVhY2gobGluZXMsIGZ1bmN0aW9uKGxpbmUsIG5hbWUpIHtcbiAgICAgICAgICAgIGxpbmUuYW5pbWF0ZSh7cGF0aDogcGF0aHNbbmFtZV19LCBBTklNQVRJT05fVElNRSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBbmltYXRlLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIGNhbGxiYWNrXG4gICAgICovXG4gICAgYW5pbWF0ZTogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaCh0aGlzLmJhcnMsIGZ1bmN0aW9uKGJhciwgaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBsaW5lcyA9IHRoaXMuYm9yZGVyc1tpbmRleF07XG4gICAgICAgICAgICB0aGlzLl9hbmltYXRlUmVjdChiYXIucmVjdCwgYmFyLmJvdW5kKTtcbiAgICAgICAgICAgIGlmIChsaW5lcykge1xuICAgICAgICAgICAgICAgIHRoaXMuX2FuaW1hdGVCb3JkZXJzKGxpbmVzLCBiYXIuYm91bmQsIHRoaXMuY2hhcnRUeXBlLCBiYXIudmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoY2FsbGJhY2ssIEFOSU1BVElPTl9USU1FKTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhcGhhZWxCYXJDaGFydDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBSYXBoYWVsIGxpbmUgY2hhcnQgcmVuZGVyZXIuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSYXBoYWVsTGluZUJhc2UgPSByZXF1aXJlKCcuL3JhcGhhZWxMaW5lVHlwZUJhc2UnKSxcbiAgICByYXBoYWVsUmVuZGVyVXRpbCA9IHJlcXVpcmUoJy4vcmFwaGFlbFJlbmRlclV0aWwnKTtcblxudmFyIFJhcGhhZWwgPSB3aW5kb3cuUmFwaGFlbCxcbiAgICBBTklNQVRJT05fVElNRSA9IDcwMDtcblxuLyoqXG4gKiBAY2xhc3NkZXNjIFJhcGhhZWxMaW5lQ2hhcnRzIGlzIGdyYXBoIHJlbmRlcmVyIGZvciBsaW5lIGNoYXJ0LlxuICogQGNsYXNzIFJhcGhhZWxMaW5lQ2hhcnRcbiAqIEBleHRlbmRzIFJhcGhhZWxMaW5lVHlwZUJhc2VcbiAqL1xudmFyIFJhcGhhZWxMaW5lQ2hhcnQgPSB0dWkudXRpbC5kZWZpbmVDbGFzcyhSYXBoYWVsTGluZUJhc2UsIC8qKiBAbGVuZHMgUmFwaGFlbExpbmVDaGFydC5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIFJlbmRlciBmdW5jdGlvbiBvZiBsaW5lIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNvbnRhaW5lclxuICAgICAqIEBwYXJhbSB7e2dyb3VwUG9zaXRpb25zOiBhcnJheS48YXJyYXk+LCBkaW1lbnNpb246IG9iamVjdCwgdGhlbWU6IG9iamVjdCwgb3B0aW9uczogb2JqZWN0fX0gZGF0YSByZW5kZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGluQ2FsbGJhY2sgaW4gY2FsbGJhY2tcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvdXRDYWxsYmFjayBvdXQgY2FsbGJhY2tcbiAgICAgKiBAcmV0dXJuIHtvYmplY3R9IHBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKi9cbiAgICByZW5kZXI6IGZ1bmN0aW9uKHBhcGVyLCBjb250YWluZXIsIGRhdGEsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKSB7XG4gICAgICAgIHZhciBkaW1lbnNpb24gPSBkYXRhLmRpbWVuc2lvbixcbiAgICAgICAgICAgIGdyb3VwUG9zaXRpb25zID0gZGF0YS5ncm91cFBvc2l0aW9ucyxcbiAgICAgICAgICAgIHRoZW1lID0gZGF0YS50aGVtZSxcbiAgICAgICAgICAgIGNvbG9ycyA9IHRoZW1lLmNvbG9ycyxcbiAgICAgICAgICAgIG9wYWNpdHkgPSBkYXRhLm9wdGlvbnMuaGFzRG90ID8gMSA6IDAsXG4gICAgICAgICAgICBncm91cFBhdGhzID0gdGhpcy5fZ2V0TGluZXNQYXRoKGdyb3VwUG9zaXRpb25zKSxcbiAgICAgICAgICAgIGJvcmRlclN0eWxlID0gdGhpcy5tYWtlQm9yZGVyU3R5bGUodGhlbWUuYm9yZGVyQ29sb3IsIG9wYWNpdHkpLFxuICAgICAgICAgICAgb3V0RG90U3R5bGUgPSB0aGlzLm1ha2VPdXREb3RTdHlsZShvcGFjaXR5LCBib3JkZXJTdHlsZSksXG4gICAgICAgICAgICBncm91cExpbmVzLCB0b29sdGlwTGluZSwgZ3JvdXBEb3RzO1xuXG4gICAgICAgIGlmICghcGFwZXIpIHtcbiAgICAgICAgICAgIHBhcGVyID0gUmFwaGFlbChjb250YWluZXIsIGRpbWVuc2lvbi53aWR0aCwgZGltZW5zaW9uLmhlaWdodCk7XG4gICAgICAgIH1cblxuICAgICAgICBncm91cExpbmVzID0gdGhpcy5fcmVuZGVyTGluZXMocGFwZXIsIGdyb3VwUGF0aHMsIGNvbG9ycyk7XG4gICAgICAgIHRvb2x0aXBMaW5lID0gdGhpcy5fcmVuZGVyVG9vbHRpcExpbmUocGFwZXIsIGRpbWVuc2lvbi5oZWlnaHQpO1xuICAgICAgICBncm91cERvdHMgPSB0aGlzLnJlbmRlckRvdHMocGFwZXIsIGdyb3VwUG9zaXRpb25zLCBjb2xvcnMsIGJvcmRlclN0eWxlKTtcblxuICAgICAgICB0aGlzLmJvcmRlclN0eWxlID0gYm9yZGVyU3R5bGU7XG4gICAgICAgIHRoaXMub3V0RG90U3R5bGUgPSBvdXREb3RTdHlsZTtcbiAgICAgICAgdGhpcy5ncm91cFBhdGhzID0gZ3JvdXBQYXRocztcbiAgICAgICAgdGhpcy5ncm91cExpbmVzID0gZ3JvdXBMaW5lcztcbiAgICAgICAgdGhpcy50b29sdGlwTGluZSA9IHRvb2x0aXBMaW5lO1xuICAgICAgICB0aGlzLmdyb3VwRG90cyA9IGdyb3VwRG90cztcbiAgICAgICAgdGhpcy5kb3RPcGFjaXR5ID0gb3BhY2l0eTtcblxuICAgICAgICB0aGlzLmF0dGFjaEV2ZW50KGdyb3VwRG90cywgZ3JvdXBQb3NpdGlvbnMsIG91dERvdFN0eWxlLCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjayk7XG5cbiAgICAgICAgcmV0dXJuIHBhcGVyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgbGluZXMgcGF0aC5cbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheS48b2JqZWN0Pj59IGdyb3VwUG9zaXRpb25zIHBvc2l0aW9uc1xuICAgICAqIEByZXR1cm5zIHthcnJheS48YXJyYXkuPHN0cmluZz4+fSBwYXRoc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldExpbmVzUGF0aDogZnVuY3Rpb24oZ3JvdXBQb3NpdGlvbnMpIHtcbiAgICAgICAgdmFyIGdyb3VwUGF0aHMgPSB0dWkudXRpbC5tYXAoZ3JvdXBQb3NpdGlvbnMsIGZ1bmN0aW9uKHBvc2l0aW9ucykge1xuICAgICAgICAgICAgdmFyIGZyb21Qb3MgPSBwb3NpdGlvbnNbMF0sXG4gICAgICAgICAgICAgICAgcmVzdCA9IHBvc2l0aW9ucy5zbGljZSgxKTtcbiAgICAgICAgICAgIHJldHVybiB0dWkudXRpbC5tYXAocmVzdCwgZnVuY3Rpb24ocG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gdGhpcy5tYWtlTGluZVBhdGgoZnJvbVBvcywgcG9zaXRpb24pO1xuICAgICAgICAgICAgICAgIGZyb21Qb3MgPSBwb3NpdGlvbjtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgICByZXR1cm4gZ3JvdXBQYXRocztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGxpbmVzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXkuPHN0cmluZz4+fSBncm91cFBhdGhzIHBhdGhzXG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gY29sb3JzIGxpbmUgY29sb3JzXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHN0cm9rZVdpZHRoIHN0cm9rZSB3aWR0aFxuICAgICAqIEByZXR1cm5zIHthcnJheS48YXJyYXkuPG9iamVjdD4+fSBsaW5lc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlckxpbmVzOiBmdW5jdGlvbihwYXBlciwgZ3JvdXBQYXRocywgY29sb3JzLCBzdHJva2VXaWR0aCkge1xuICAgICAgICB2YXIgZ3JvdXBMaW5lcyA9IHR1aS51dGlsLm1hcChncm91cFBhdGhzLCBmdW5jdGlvbihwYXRocywgZ3JvdXBJbmRleCkge1xuICAgICAgICAgICAgdmFyIGNvbG9yID0gY29sb3JzW2dyb3VwSW5kZXhdIHx8ICd0cmFuc3BhcmVudCc7XG4gICAgICAgICAgICByZXR1cm4gdHVpLnV0aWwubWFwKHBhdGhzLCBmdW5jdGlvbihwYXRoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJhcGhhZWxSZW5kZXJVdGlsLnJlbmRlckxpbmUocGFwZXIsIHBhdGguc3RhcnQsIGNvbG9yLCBzdHJva2VXaWR0aCk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgcmV0dXJuIGdyb3VwTGluZXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFuaW1hdGUuXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgY2FsbGJhY2tcbiAgICAgKi9cbiAgICBhbmltYXRlOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICB2YXIgZ3JvdXBMaW5lcyA9IHRoaXMuZ3JvdXBMaW5lcyxcbiAgICAgICAgICAgIGdyb3VwUGF0aHMgPSB0aGlzLmdyb3VwUGF0aHMsXG4gICAgICAgICAgICBib3JkZXJTdHlsZSA9IHRoaXMuYm9yZGVyU3R5bGUsXG4gICAgICAgICAgICBvcGFjaXR5ID0gdGhpcy5kb3RPcGFjaXR5LFxuICAgICAgICAgICAgdGltZSA9IEFOSU1BVElPTl9USU1FIC8gZ3JvdXBMaW5lc1swXS5sZW5ndGgsXG4gICAgICAgICAgICBzdGFydFRpbWU7XG4gICAgICAgIHR1aS51dGlsLmZvckVhY2hBcnJheSh0aGlzLmdyb3VwRG90cywgZnVuY3Rpb24oZG90cywgZ3JvdXBJbmRleCkge1xuICAgICAgICAgICAgc3RhcnRUaW1lID0gMDtcbiAgICAgICAgICAgIHR1aS51dGlsLmZvckVhY2hBcnJheShkb3RzLCBmdW5jdGlvbihkb3QsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdmFyIGxpbmUsIHBhdGg7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIGxpbmUgPSBncm91cExpbmVzW2dyb3VwSW5kZXhdW2luZGV4IC0gMV07XG4gICAgICAgICAgICAgICAgICAgIHBhdGggPSBncm91cFBhdGhzW2dyb3VwSW5kZXhdW2luZGV4IC0gMV0uZW5kO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFuaW1hdGVMaW5lKGxpbmUsIHBhdGgsIHRpbWUsIHN0YXJ0VGltZSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0VGltZSArPSB0aW1lO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChvcGFjaXR5KSB7XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb3QuYXR0cih0dWkudXRpbC5leHRlbmQoeydmaWxsLW9wYWNpdHknOiBvcGFjaXR5fSwgYm9yZGVyU3R5bGUpKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgc3RhcnRUaW1lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGNhbGxiYWNrLCBzdGFydFRpbWUpO1xuICAgICAgICB9XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmFwaGFlbExpbmVDaGFydDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBSYXBoYWVsTGluZVR5cGVCYXNlIGlzIGJhc2UgY2xhc3MgZm9yIGxpbmUgdHlwZSByZW5kZXJlci5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHJhcGhhZWxSZW5kZXJVdGlsID0gcmVxdWlyZSgnLi9yYXBoYWVsUmVuZGVyVXRpbCcpO1xuXG52YXIgREVGQVVMVF9ET1RfV0lEVEggPSAzLFxuICAgIEhPVkVSX0RPVF9XSURUSCA9IDQ7XG5cbi8qKlxuICogQGNsYXNzZGVzYyBSYXBoYWVsTGluZVR5cGVCYXNlIGlzIGJhc2UgZm9yIGxpbmUgdHlwZSByZW5kZXJlci5cbiAqIEBjbGFzcyBSYXBoYWVsTGluZVR5cGVCYXNlXG4gKi9cbnZhciBSYXBoYWVsTGluZVR5cGVCYXNlID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBSYXBoYWVsTGluZVR5cGVCYXNlLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBsaW5lIHBhdGhzLlxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBmcm9tUG9zIGZyb20gcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gdG9Qb3MgdG8gcG9zaXRpb25cbiAgICAgKiBAcmV0dXJucyB7e3N0YXJ0OiBzdHJpbmcsIGVuZDogc3RyaW5nfX0gbGluZSBwYXRocy5cbiAgICAgKi9cbiAgICBtYWtlTGluZVBhdGg6IGZ1bmN0aW9uKGZyb21Qb3MsIHRvUG9zKSB7XG4gICAgICAgIHZhciBzdGFydExpbmVQYXRoID0gcmFwaGFlbFJlbmRlclV0aWwubWFrZUxpbmVQYXRoKGZyb21Qb3MsIGZyb21Qb3MpLFxuICAgICAgICAgICAgZW5kTGluZVBhdGggPSByYXBoYWVsUmVuZGVyVXRpbC5tYWtlTGluZVBhdGgoZnJvbVBvcywgdG9Qb3MpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3RhcnQ6IHN0YXJ0TGluZVBhdGgsXG4gICAgICAgICAgICBlbmQ6IGVuZExpbmVQYXRoXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciB0b29sdGlwIGxpbmUuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0IGhlaWdodFxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHJhcGhhZWwgb2JqZWN0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyVG9vbHRpcExpbmU6IGZ1bmN0aW9uKHBhcGVyLCBoZWlnaHQpIHtcbiAgICAgICAgdmFyIGxpbmVQYXRoID0gcmFwaGFlbFJlbmRlclV0aWwubWFrZUxpbmVQYXRoKHtcbiAgICAgICAgICAgICAgICBsZWZ0OiAxMCxcbiAgICAgICAgICAgICAgICB0b3A6IGhlaWdodFxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGxlZnQ6IDEwLFxuICAgICAgICAgICAgICAgIHRvcDogMFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByYXBoYWVsUmVuZGVyVXRpbC5yZW5kZXJMaW5lKHBhcGVyLCBsaW5lUGF0aCwgJ3RyYW5zcGFyZW50JywgMSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYm9yZGVyIHN0eWxlLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBib3JkZXJDb2xvciBib3JkZXIgY29sb3JcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gb3BhY2l0eSBvcGFjaXR5XG4gICAgICogQHJldHVybnMge3tzdHJva2U6IHN0cmluZywgc3Ryb2tlLXdpZHRoOiBudW1iZXIsIHN0cmlrZS1vcGFjaXR5OiBudW1iZXJ9fSBib3JkZXIgc3R5bGVcbiAgICAgKi9cbiAgICBtYWtlQm9yZGVyU3R5bGU6IGZ1bmN0aW9uKGJvcmRlckNvbG9yLCBvcGFjaXR5KSB7XG4gICAgICAgIHZhciBib3JkZXJTdHlsZTtcbiAgICAgICAgaWYgKGJvcmRlckNvbG9yKSB7XG4gICAgICAgICAgICBib3JkZXJTdHlsZSA9IHtcbiAgICAgICAgICAgICAgICBzdHJva2U6IGJvcmRlckNvbG9yLFxuICAgICAgICAgICAgICAgICdzdHJva2Utd2lkdGgnOiAxLFxuICAgICAgICAgICAgICAgICdzdHJva2Utb3BhY2l0eSc6IG9wYWNpdHlcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJvcmRlclN0eWxlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGRvdCBzdHlsZSBmb3IgbW91c2VvdXQgZXZlbnQuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG9wYWNpdHkgb3BhY2l0eVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBib3JkZXJTdHlsZSBib3JkZXIgc3R5bGVcbiAgICAgKiBAcmV0dXJucyB7e2ZpbGwtb3BhY2l0eTogbnVtYmVyLCBzdHJva2Utb3BhY2l0eTogbnVtYmVyLCByOiBudW1iZXJ9fSBzdHlsZVxuICAgICAqL1xuICAgIG1ha2VPdXREb3RTdHlsZTogZnVuY3Rpb24ob3BhY2l0eSwgYm9yZGVyU3R5bGUpIHtcbiAgICAgICAgdmFyIG91dERvdFN0eWxlID0ge1xuICAgICAgICAgICAgJ2ZpbGwtb3BhY2l0eSc6IG9wYWNpdHksXG4gICAgICAgICAgICAnc3Ryb2tlLW9wYWNpdHknOiAwLFxuICAgICAgICAgICAgcjogREVGQVVMVF9ET1RfV0lEVEhcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoYm9yZGVyU3R5bGUpIHtcbiAgICAgICAgICAgIHR1aS51dGlsLmV4dGVuZChvdXREb3RTdHlsZSwgYm9yZGVyU3R5bGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG91dERvdFN0eWxlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgZG90LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGFlclxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBwb3NpdGlvbiBkb3QgcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29sb3IgZG90IGNvbG9yXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGJvcmRlclN0eWxlIGJvcmRlciBzdHlsZVxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHJhcGhhZWwgZG90XG4gICAgICovXG4gICAgcmVuZGVyRG90OiBmdW5jdGlvbihwYXBlciwgcG9zaXRpb24sIGNvbG9yKSB7XG4gICAgICAgIHZhciBkb3QgPSBwYXBlci5jaXJjbGUocG9zaXRpb24ubGVmdCwgcG9zaXRpb24udG9wLCBERUZBVUxUX0RPVF9XSURUSCksXG4gICAgICAgICAgICBkb3RTdHlsZSA9IHtcbiAgICAgICAgICAgICAgICBmaWxsOiBjb2xvcixcbiAgICAgICAgICAgICAgICAnZmlsbC1vcGFjaXR5JzogMCxcbiAgICAgICAgICAgICAgICAnc3Ryb2tlLW9wYWNpdHknOiAwXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIGRvdC5hdHRyKGRvdFN0eWxlKTtcblxuICAgICAgICByZXR1cm4gZG90O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgZG90cy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gZ3JvdXBQb3NpdGlvbnMgcG9zaXRpb25zXG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gY29sb3JzIGNvbG9yc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBib3JkZXJTdHlsZSBib3JkZXIgc3R5bGVcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPG9iamVjdD59IGRvdHNcbiAgICAgKi9cbiAgICByZW5kZXJEb3RzOiBmdW5jdGlvbihwYXBlciwgZ3JvdXBQb3NpdGlvbnMsIGNvbG9ycykge1xuICAgICAgICB2YXIgZG90cyA9IHR1aS51dGlsLm1hcChncm91cFBvc2l0aW9ucywgZnVuY3Rpb24ocG9zaXRpb25zLCBncm91cEluZGV4KSB7XG4gICAgICAgICAgICB2YXIgY29sb3IgPSBjb2xvcnNbZ3JvdXBJbmRleF07XG4gICAgICAgICAgICByZXR1cm4gdHVpLnV0aWwubWFwKHBvc2l0aW9ucywgZnVuY3Rpb24ocG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgZG90ID0gdGhpcy5yZW5kZXJEb3QocGFwZXIsIHBvc2l0aW9uLCBjb2xvcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvdDtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICByZXR1cm4gZG90cztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNlbnRlciBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBmcm9tUG9zIGZyb20gcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gdG9Qb3MgdG8gcG9zaXRpb25cbiAgICAgKiBAcmV0dXJucyB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBwb3NpdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldENlbnRlcjogZnVuY3Rpb24oZnJvbVBvcywgdG9Qb3MpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxlZnQ6IChmcm9tUG9zLmxlZnQgKyB0b1Bvcy5sZWZ0KSAvIDIsXG4gICAgICAgICAgICB0b3A6IChmcm9tUG9zLnRvcCArIHRvUG9zLnRvcCkgLyAyXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJpbmQgaG92ZXIgZXZlbnQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGRvdCByYXBoYWVsIG9iZWpjdFxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBwb3NpdGlvbiBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBncm91cEluZGV4IGdyb3VwIGluZGV4XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IGluZGV4XG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gaW5DYWxsYmFjayBpbiBjYWxsYmFja1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG91dENhbGxiYWNrIG91dCBjYWxsYmFja1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2JpbmRIb3ZlckV2ZW50OiBmdW5jdGlvbihkb3QsIHBvc2l0aW9uLCBncm91cEluZGV4LCBpbmRleCwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spIHtcbiAgICAgICAgZG90LmhvdmVyKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaW5DYWxsYmFjayhwb3NpdGlvbiwgaW5kZXgsIGdyb3VwSW5kZXgpO1xuICAgICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIG91dENhbGxiYWNrKCk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggZXZlbnQuXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXkuPG9iamVjdD4+fSBncm91cERvdHMgZG90c1xuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gZ3JvdXBQb3NpdGlvbnMgcG9zaXRpb25zXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG91dERvdFN0eWxlIGRvdCBzdHlsZVxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGluQ2FsbGJhY2sgaW4gY2FsbGJhY2tcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvdXRDYWxsYmFjayBvdXQgY2FsbGJhY2tcbiAgICAgKi9cbiAgICBhdHRhY2hFdmVudDogZnVuY3Rpb24oZ3JvdXBEb3RzLCBncm91cFBvc2l0aW9ucywgb3V0RG90U3R5bGUsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKSB7XG4gICAgICAgIHR1aS51dGlsLmZvckVhY2goZ3JvdXBEb3RzLCBmdW5jdGlvbihkb3RzLCBncm91cEluZGV4KSB7XG4gICAgICAgICAgICB0dWkudXRpbC5mb3JFYWNoKGRvdHMsIGZ1bmN0aW9uKGRvdCwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgcG9zaXRpb24gPSBncm91cFBvc2l0aW9uc1tncm91cEluZGV4XVtpbmRleF07XG4gICAgICAgICAgICAgICAgdGhpcy5fYmluZEhvdmVyRXZlbnQoZG90LCBwb3NpdGlvbiwgZ3JvdXBJbmRleCwgaW5kZXgsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2hvdyBkb3QuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGRvdCByYXBoYWVsIG9iamVjdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3Nob3dEb3Q6IGZ1bmN0aW9uKGRvdCkge1xuICAgICAgICBkb3QuYXR0cih7XG4gICAgICAgICAgICAnZmlsbC1vcGFjaXR5JzogMSxcbiAgICAgICAgICAgICdzdHJva2Utb3BhY2l0eSc6IDAuMyxcbiAgICAgICAgICAgICdzdHJva2Utd2lkdGgnOiAyLFxuICAgICAgICAgICAgcjogSE9WRVJfRE9UX1dJRFRIXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTaG93IGFuaW1hdGlvbi5cbiAgICAgKiBAcGFyYW0ge3tncm91cEluZGV4OiBudW1iZXIsIGluZGV4Om51bWJlcn19IGRhdGEgc2hvdyBpbmZvXG4gICAgICovXG4gICAgc2hvd0FuaW1hdGlvbjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgaW5kZXggPSBkYXRhLmdyb3VwSW5kZXgsIC8vIExpbmUgY2hhcnQgaGFzIHBpdm90IHZhbHVlcy5cbiAgICAgICAgICAgIGdyb3VwSW5kZXggPSBkYXRhLmluZGV4LFxuICAgICAgICAgICAgZG90ID0gdGhpcy5ncm91cERvdHNbZ3JvdXBJbmRleF1baW5kZXhdO1xuICAgICAgICB0aGlzLl9zaG93RG90KGRvdCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBwaXZvdCBncm91cCBkb3RzLlxuICAgICAqIEByZXR1cm5zIHthcnJheS48YXJyYXk+fSBkb3RzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0UGl2b3RHcm91cERvdHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXRoaXMucGl2b3RHcm91cERvdHMpIHtcbiAgICAgICAgICAgIHRoaXMucGl2b3RHcm91cERvdHMgPSB0dWkudXRpbC5waXZvdCh0aGlzLmdyb3VwRG90cyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5waXZvdEdyb3VwRG90cztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2hvdyBncm91cCBkb3RzLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBpbmRleFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3Nob3dHcm91cERvdHM6IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAgIHZhciBkb3RzID0gdGhpcy5fZ2V0UGl2b3RHcm91cERvdHMoKTtcbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaEFycmF5KGRvdHNbaW5kZXhdLCB0dWkudXRpbC5iaW5kKHRoaXMuX3Nob3dEb3QsIHRoaXMpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2hvdyB0b29sdGlwIGxpbmUuXG4gICAgICogQHBhcmFtIHt7XG4gICAgICogICAgICBkaW1lbnNpb246IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn0sXG4gICAgICogICAgICBwb3NpdGlvbjoge2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9XG4gICAgICogfX0gYm91bmQgYm91bmRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zaG93VG9vbHRpcExpbmU6IGZ1bmN0aW9uKGJvdW5kKSB7XG4gICAgICAgIHZhciBsaW5lUGF0aCA9IHJhcGhhZWxSZW5kZXJVdGlsLm1ha2VMaW5lUGF0aCh7XG4gICAgICAgICAgICBsZWZ0OiBib3VuZC5wb3NpdGlvbi5sZWZ0LFxuICAgICAgICAgICAgdG9wOiBib3VuZC5kaW1lbnNpb24uaGVpZ2h0XG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGxlZnQ6IGJvdW5kLnBvc2l0aW9uLmxlZnQsXG4gICAgICAgICAgICB0b3A6IGJvdW5kLnBvc2l0aW9uLnRvcFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy50b29sdGlwTGluZS5hdHRyKHtcbiAgICAgICAgICAgIHBhdGg6IGxpbmVQYXRoLFxuICAgICAgICAgICAgc3Ryb2tlOiAnIzk5OScsXG4gICAgICAgICAgICAnc3Ryb2tlLW9wYWNpdHknOiAxXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTaG93IGdyb3VwIGFuaW1hdGlvbi5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggaW5kZXhcbiAgICAgKiBAcGFyYW0ge3tcbiAgICAgKiAgICAgIGRpbWVuc2lvbjoge3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfSxcbiAgICAgKiAgICAgIHBvc2l0aW9uOiB7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn1cbiAgICAgKiB9fSBib3VuZCBib3VuZFxuICAgICAqL1xuICAgIHNob3dHcm91cEFuaW1hdGlvbjogZnVuY3Rpb24oaW5kZXgsIGJvdW5kKSB7XG4gICAgICAgIHRoaXMuX3Nob3dHcm91cERvdHMoaW5kZXgpO1xuICAgICAgICB0aGlzLl9zaG93VG9vbHRpcExpbmUoYm91bmQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBIaWRlIGRvdC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZG90IHJhcGhhZWwgb2JqZWN0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaGlkZURvdDogZnVuY3Rpb24oZG90KSB7XG4gICAgICAgIGRvdC5hdHRyKHRoaXMub3V0RG90U3R5bGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBIaWRlIGFuaW1hdGlvbi5cbiAgICAgKiBAcGFyYW0ge3tncm91cEluZGV4OiBudW1iZXIsIGluZGV4Om51bWJlcn19IGRhdGEgaGlkZSBpbmZvXG4gICAgICovXG4gICAgaGlkZUFuaW1hdGlvbjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgaW5kZXggPSBkYXRhLmdyb3VwSW5kZXgsIC8vIExpbmUgY2hhcnQgaGFzIHBpdm90IHZhbHVlcy5cbiAgICAgICAgICAgIGdyb3VwSW5kZXggPSBkYXRhLmluZGV4LFxuICAgICAgICAgICAgZG90ID0gdGhpcy5ncm91cERvdHNbZ3JvdXBJbmRleF1baW5kZXhdO1xuICAgICAgICBpZiAoZG90KSB7XG4gICAgICAgICAgICB0aGlzLl9oaWRlRG90KGRvdCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSGlkZSBncm91cCBkb3RzLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBpbmRleFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2hpZGVHcm91cERvdHM6IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAgIHZhciBkb3RzID0gdGhpcy5fZ2V0UGl2b3RHcm91cERvdHMoKTtcbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaEFycmF5KGRvdHNbaW5kZXhdLCB0dWkudXRpbC5iaW5kKHRoaXMuX2hpZGVEb3QsIHRoaXMpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSGlkZSB0b29sdGlwIGxpbmUuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaGlkZVRvb2x0aXBMaW5lOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy50b29sdGlwTGluZS5hdHRyKHtcbiAgICAgICAgICAgICdzdHJva2Utb3BhY2l0eSc6IDBcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhpZGUgZ3JvdXAgYW5pbWF0aW9uLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBpbmRleFxuICAgICAqL1xuICAgIGhpZGVHcm91cEFuaW1hdGlvbjogZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgdGhpcy5faGlkZUdyb3VwRG90cyhpbmRleCk7XG4gICAgICAgIHRoaXMuX2hpZGVUb29sdGlwTGluZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBbmltYXRlIGxpbmUuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGxpbmUgcmFwaGFlbCBvYmplY3RcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbGluZVBhdGggbGluZSBwYXRoXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHRpbWUgcGxheSB0aW1lXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHN0YXJ0VGltZSBzdGFydCB0aW1lXG4gICAgICovXG4gICAgYW5pbWF0ZUxpbmU6IGZ1bmN0aW9uKGxpbmUsIGxpbmVQYXRoLCB0aW1lLCBzdGFydFRpbWUpIHtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGxpbmUuYW5pbWF0ZSh7cGF0aDogbGluZVBhdGh9LCB0aW1lKTtcbiAgICAgICAgfSwgc3RhcnRUaW1lKTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSYXBoYWVsTGluZVR5cGVCYXNlO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFJhcGhhZWxQaWVDaGFydHMgaXMgZ3JhcGggcmVuZGVyZXIgZm9yIHBpZSBjaGFydC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHJhcGhhZWxSZW5kZXJVdGlsID0gcmVxdWlyZSgnLi9yYXBoYWVsUmVuZGVyVXRpbCcpO1xuXG52YXIgUmFwaGFlbCA9IHdpbmRvdy5SYXBoYWVsLFxuICAgIEFOR0xFXzE4MCA9IDE4MCxcbiAgICBSQUQgPSBNYXRoLlBJIC8gQU5HTEVfMTgwLFxuICAgIEFOSU1BVElPTl9USU1FID0gNTAwLFxuICAgIExPQURJTkdfQU5JTUFUSU9OX1RJTUUgPSA3MDA7XG5cbi8qKlxuICogQGNsYXNzZGVzYyBSYXBoYWVsUGllQ2hhcnRzIGlzIGdyYXBoIHJlbmRlcmVyIGZvciBwaWUgY2hhcnQuXG4gKiBAY2xhc3MgUmFwaGFlbFBpZUNoYXJ0XG4gKi9cbnZhciBSYXBoYWVsUGllQ2hhcnQgPSB0dWkudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIFJhcGhhZWxQaWVDaGFydC5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIFJlbmRlciBmdW5jdGlvbiBvZiBwaWUgY2hhcnQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY29udGFpbmVyXG4gICAgICogQHBhcmFtIHt7c2VjdG9yc0luZm86IGFycmF5LjxvYmplY3Q+LCBjaXJjbGVCb3VuZDoge2N4OiBudW1iZXIsIGN5OiBudW1iZXIsIHI6IG51bWJlcn0sIGRpbWVuc2lvbjogb2JqZWN0LCB0aGVtZTogb2JqZWN0LCBvcHRpb25zOiBvYmplY3R9fSBkYXRhIHJlbmRlciBkYXRhXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gaW5DYWxsYmFjayBpbiBjYWxsYmFja1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG91dENhbGxiYWNrIG91dCBjYWxsYmFja1xuICAgICAqIEByZXR1cm4ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqL1xuICAgIHJlbmRlcjogZnVuY3Rpb24ocGFwZXIsIGNvbnRhaW5lciwgZGF0YSwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGRpbWVuc2lvbiA9IGRhdGEuZGltZW5zaW9uO1xuXG4gICAgICAgIGlmICghcGFwZXIpIHtcbiAgICAgICAgICAgIHBhcGVyID0gUmFwaGFlbChjb250YWluZXIsIGRpbWVuc2lvbi53aWR0aCwgZGltZW5zaW9uLmhlaWdodCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXBhcGVyLmN1c3RvbUF0dHJpYnV0ZXMuc2VjdG9yKSB7XG4gICAgICAgICAgICBwYXBlci5jdXN0b21BdHRyaWJ1dGVzLnNlY3RvciA9IHR1aS51dGlsLmJpbmQodGhpcy5fbWFrZVNlY3RvclBhdGgsIHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jaXJjbGVCb3VuZCA9IGRhdGEuY2lyY2xlQm91bmQ7XG4gICAgICAgIHRoaXMuX3JlbmRlclBpZShwYXBlciwgZGF0YSwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spO1xuXG4gICAgICAgIHJldHVybiBwYXBlcjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBzZWN0b3IgcGF0aC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gY3ggY2VudGVyIHhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gY3kgY2VudGVyIHlcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gciByYWRpdXNcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3RhcnRBbmdsZSBzdGFydCBhbmdsZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBlbmRBbmdsZSBlbmQgYW5nZWxcbiAgICAgKiBAcmV0dXJucyB7e3BhdGg6IGFycmF5fX0gc2VjdG9yIHBhdGhcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlU2VjdG9yUGF0aDogZnVuY3Rpb24oY3gsIGN5LCByLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSkge1xuICAgICAgICB2YXIgeDEgPSBjeCArIHIgKiBNYXRoLnNpbihzdGFydEFuZ2xlICogUkFEKSwgLy8g7JuQIO2YuOydmCDsi5zsnpEgeCDsooztkZxcbiAgICAgICAgICAgIHkxID0gY3kgLSByICogTWF0aC5jb3Moc3RhcnRBbmdsZSAqIFJBRCksIC8vIOybkCDtmLjsnZgg7Iuc7J6RIHkg7KKM7ZGcXG4gICAgICAgICAgICB4MiA9IGN4ICsgciAqIE1hdGguc2luKGVuZEFuZ2xlICogUkFEKSwvLyDsm5Ag7Zi47J2YIOyiheujjCB4IOyijO2RnFxuICAgICAgICAgICAgeTIgPSBjeSAtIHIgKiBNYXRoLmNvcyhlbmRBbmdsZSAqIFJBRCksIC8vIOybkCDtmLjsnZgg7KKF66OMIHkg7KKM7ZGcXG4gICAgICAgICAgICBsYXJnZUFyY0ZsYWcgPSBlbmRBbmdsZSAtIHN0YXJ0QW5nbGUgPiBBTkdMRV8xODAgPyAxIDogMCxcbiAgICAgICAgICAgIHBhdGggPSBbXCJNXCIsIGN4LCBjeSxcbiAgICAgICAgICAgICAgICBcIkxcIiwgeDEsIHkxLFxuICAgICAgICAgICAgICAgIFwiQVwiLCByLCByLCAwLCBsYXJnZUFyY0ZsYWcsIDEsIHgyLCB5MixcbiAgICAgICAgICAgICAgICBcIlpcIlxuICAgICAgICAgICAgXTtcbiAgICAgICAgLy8gcGF0aOyXkCDrjIDtlZwg7J6Q7IS47ZWcIOyEpOuqheydgCDslYTrnpgg66eB7YGs66W8IOywuOqzoFxuICAgICAgICAvLyBodHRwOi8vd3d3Lnczc2Nob29scy5jb20vc3ZnL3N2Z19wYXRoLmFzcFxuICAgICAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9TVkcvQXR0cmlidXRlL2RcbiAgICAgICAgcmV0dXJuIHtwYXRoOiBwYXRofTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIHNlY3RvclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5wYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICogICAgICBAcGFyYW0ge3tjeDogbnVtYmVyLCBjeTogbnVtYmVyLCByOm51bWJlcn19IHBhcmFtcy5jaXJjbGVCb3VuZCBjaXJjbGUgYm91bmRzXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnN0YXJ0QW5nbGUgc3RhcnQgYW5nbGVcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuZW5kQW5nbGUgZW5kIGFuZ2xlXG4gICAgICogICAgICBAcGFyYW0ge3tmaWxsOiBzdHJpbmcsIHN0cm9rZTogc3RyaW5nLCBzdHJpa2Utd2lkdGg6IHN0cmluZ319IHBhcmFtcy5hdHRycyBhdHRyc1xuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHJhcGhhZWwgb2JqZWN0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyU2VjdG9yOiBmdW5jdGlvbiAocGFyYW1zKSB7XG4gICAgICAgIHZhciBjaXJjbGVCb3VuZCA9IHBhcmFtcy5jaXJjbGVCb3VuZCxcbiAgICAgICAgICAgIGFuZ2xlcyA9IHBhcmFtcy5hbmdsZXM7XG4gICAgICAgIHJldHVybiBwYXJhbXMucGFwZXIucGF0aCgpLmF0dHIoe1xuICAgICAgICAgICAgc2VjdG9yOiBbY2lyY2xlQm91bmQuY3gsIGNpcmNsZUJvdW5kLmN5LCBjaXJjbGVCb3VuZC5yLCBhbmdsZXMuc3RhcnRBbmdsZSwgYW5nbGVzLmVuZEFuZ2xlXVxuICAgICAgICB9KS5hdHRyKHBhcmFtcy5hdHRycyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBwaWUgZ3JhcGguXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKiBAcGFyYW0ge3tzZWN0b3JzSW5mbzogYXJyYXkuPG9iamVjdD4sIGNpcmNsZUJvdW5kOiB7Y3g6IG51bWJlciwgY3k6IG51bWJlciwgcjogbnVtYmVyfSwgZGltZW5zaW9uOiBvYmplY3QsIHRoZW1lOiBvYmplY3QsIG9wdGlvbnM6IG9iamVjdH19IGRhdGEgcmVuZGVyIGRhdGFcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBpbkNhbGxiYWNrIGluIGNhbGxiYWNrXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gb3V0Q2FsbGJhY2sgb3V0IGNhbGxiYWNrXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyUGllOiBmdW5jdGlvbihwYXBlciwgZGF0YSwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGNpcmNsZUJvdW5kID0gZGF0YS5jaXJjbGVCb3VuZCxcbiAgICAgICAgICAgIGNvbG9ycyA9IGRhdGEudGhlbWUuY29sb3JzLFxuICAgICAgICAgICAgY2hhcnRCYWNrZ3JvdW5kID0gZGF0YS5jaGFydEJhY2tncm91bmQsXG4gICAgICAgICAgICBzZWN0b3JzID0gW107XG5cbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaEFycmF5KGRhdGEuc2VjdG9yc0luZm8sIGZ1bmN0aW9uKHNlY3RvckluZm8sIGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgcGVyY2VudFZhbHVlID0gc2VjdG9ySW5mby5wZXJjZW50VmFsdWUsXG4gICAgICAgICAgICAgICAgY29sb3IgPSBjb2xvcnNbaW5kZXhdLFxuICAgICAgICAgICAgICAgIHNlY3RvciA9IHRoaXMuX3JlbmRlclNlY3Rvcih7XG4gICAgICAgICAgICAgICAgICAgIHBhcGVyOiBwYXBlcixcbiAgICAgICAgICAgICAgICAgICAgY2lyY2xlQm91bmQ6IGNpcmNsZUJvdW5kLFxuICAgICAgICAgICAgICAgICAgICBhbmdsZXM6IHNlY3RvckluZm8uYW5nbGVzLnN0YXJ0LFxuICAgICAgICAgICAgICAgICAgICBhdHRyczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsbDogY29sb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJva2U6IGNoYXJ0QmFja2dyb3VuZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICdzdHJva2Utd2lkdGgnOiAxXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5fYmluZEhvdmVyRXZlbnQoe1xuICAgICAgICAgICAgICAgIHRhcmdldDogc2VjdG9yLFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBzZWN0b3JJbmZvLnBvcHVwUG9zaXRpb24sXG4gICAgICAgICAgICAgICAgaW5kZXg6IGluZGV4LFxuICAgICAgICAgICAgICAgIGluQ2FsbGJhY2s6IGluQ2FsbGJhY2ssXG4gICAgICAgICAgICAgICAgb3V0Q2FsbGJhY2s6IG91dENhbGxiYWNrXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc2VjdG9ycy5wdXNoKHtcbiAgICAgICAgICAgICAgICBzZWN0b3I6IHNlY3RvcixcbiAgICAgICAgICAgICAgICBhbmdsZXM6IHNlY3RvckluZm8uYW5nbGVzLmVuZCxcbiAgICAgICAgICAgICAgICBwZXJjZW50VmFsdWU6IHBlcmNlbnRWYWx1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIHRoaXMuc2VjdG9ycyA9IHNlY3RvcnM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBsZWdlbmQgbGluZXMuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIHBhcGVyXG4gICAgICogQHBhcmFtIHthcnJheS48b2JqZWN0Pn0gb3V0ZXJQb3NpdGlvbnMgb3V0ZXIgcG9zaXRpb25cbiAgICAgKi9cbiAgICByZW5kZXJMZWdlbmRMaW5lczogZnVuY3Rpb24ocGFwZXIsIG91dGVyUG9zaXRpb25zKSB7XG4gICAgICAgIHZhciBwYXRocyA9IHRoaXMuX21ha2VMaW5lUGF0aHMob3V0ZXJQb3NpdGlvbnMpLFxuICAgICAgICAgICAgbGVnZW5kTGluZXMgPSB0dWkudXRpbC5tYXAocGF0aHMsIGZ1bmN0aW9uKHBhdGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmFwaGFlbFJlbmRlclV0aWwucmVuZGVyTGluZShwYXBlciwgcGF0aCwgJ3RyYW5zcGFyZW50JywgMSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5sZWdlbmRMaW5lcyA9IGxlZ2VuZExpbmVzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGxpbmUgcGF0aHMuXG4gICAgICogQHBhcmFtIHthcnJheS48b2JqZWN0Pn0gb3V0ZXJQb3NpdGlvbnMgb3V0ZXIgcG9zaXRpb25zXG4gICAgICogQHJldHVybnMge0FycmF5fSBsaW5lIHBhdGhzLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VMaW5lUGF0aHM6IGZ1bmN0aW9uKG91dGVyUG9zaXRpb25zKSB7XG4gICAgICAgIHZhciBwYXRocyA9IHR1aS51dGlsLm1hcChvdXRlclBvc2l0aW9ucywgZnVuY3Rpb24ocG9zaXRpb25zKSB7XG4gICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgIHJhcGhhZWxSZW5kZXJVdGlsLm1ha2VMaW5lUGF0aChwb3NpdGlvbnMuc3RhcnQsIHBvc2l0aW9ucy5taWRkbGUpLFxuICAgICAgICAgICAgICAgIHJhcGhhZWxSZW5kZXJVdGlsLm1ha2VMaW5lUGF0aChwb3NpdGlvbnMubWlkZGxlLCBwb3NpdGlvbnMuZW5kKVxuICAgICAgICAgICAgXS5qb2luKCcnKTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIHJldHVybiBwYXRocztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQmluZCBob3ZlciBldmVudC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGFyZ2V0IHJhcGhhZWwgaXRlbVxuICAgICAqICAgICAgQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IHBhcmFtcy5wb3NpdGlvbiBwb3NpdGlvblxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5pZCBpZFxuICAgICAqICAgICAgQHBhcmFtIHtmdW5jdGlvbn0gcGFyYW1zLmluQ2FsbGJhY2sgaW4gY2FsbGJhY2tcbiAgICAgKiAgICAgIEBwYXJhbSB7ZnVuY3Rpb259IHBhcmFtcy5vdXRDYWxsYmFjayBvdXQgY2FsbGJhY2tcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9iaW5kSG92ZXJFdmVudDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciB0aHJvdHRsZWQgPSB0dWkudXRpbC50aHJvdHRsZShmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBpZiAoIWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXJhbXMuaW5DYWxsYmFjayhwYXJhbXMucG9zaXRpb24sIDAsIHBhcmFtcy5pbmRleCwge1xuICAgICAgICAgICAgICAgIGNsaWVudFg6IGUuY2xpZW50WCxcbiAgICAgICAgICAgICAgICBjbGllbnRZOiBlLmNsaWVudFlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCAxMDApO1xuICAgICAgICBwYXJhbXMudGFyZ2V0Lm1vdXNlb3ZlcihmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgcGFyYW1zLmluQ2FsbGJhY2socGFyYW1zLnBvc2l0aW9uLCAwLCBwYXJhbXMuaW5kZXgsIHtcbiAgICAgICAgICAgICAgICBjbGllbnRYOiBlLmNsaWVudFgsXG4gICAgICAgICAgICAgICAgY2xpZW50WTogZS5jbGllbnRZXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSkubW91c2Vtb3ZlKHRocm90dGxlZCkubW91c2VvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcGFyYW1zLm91dENhbGxiYWNrKCk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBleHBhbmQgc2VsZWN0b3IgcmFkaXVzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBzZWN0b3IgcGllIHNlY3RvclxuICAgICAqL1xuICAgIF9leHBhbmRTZWN0b3I6IGZ1bmN0aW9uKHNlY3Rvcikge1xuICAgICAgICB2YXIgY3ggPSB0aGlzLmNpcmNsZUJvdW5kLmN4LFxuICAgICAgICAgICAgY3kgPSB0aGlzLmNpcmNsZUJvdW5kLmN5O1xuICAgICAgICBzZWN0b3IuYW5pbWF0ZSh7XG4gICAgICAgICAgICB0cmFuc2Zvcm06IFwiczEuMSAxLjEgXCIgKyBjeCArIFwiIFwiICsgY3lcbiAgICAgICAgfSwgQU5JTUFUSU9OX1RJTUUsIFwiZWxhc3RpY1wiKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gcmVzdG9yZSBzZWxlY3RvciByYWRpdXMuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHNlY3RvciBwaWUgc2VjdG9yXG4gICAgICovXG4gICAgX3Jlc3RvcmVTZWN0b3I6IGZ1bmN0aW9uKHNlY3Rvcikge1xuICAgICAgICBzZWN0b3IuYW5pbWF0ZSh7dHJhbnNmb3JtOiBcIlwifSwgQU5JTUFUSU9OX1RJTUUsIFwiZWxhc3RpY1wiKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2hvdyBhbmltYXRpb24uXG4gICAgICogQHBhcmFtIHt7aW5kZXg6IG51bWJlcn19IGRhdGEgZGF0YVxuICAgICAqL1xuICAgIHNob3dBbmltYXRpb246IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIHNlY3RvciA9IHRoaXMuc2VjdG9yc1tkYXRhLmluZGV4XS5zZWN0b3I7XG4gICAgICAgIHRoaXMuX2V4cGFuZFNlY3RvcihzZWN0b3IpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBIaWRlIGFuaW1hdGlvbi5cbiAgICAgKiBAcGFyYW0ge3tpbmRleDogbnVtYmVyfX0gZGF0YSBkYXRhXG4gICAgICovXG4gICAgaGlkZUFuaW1hdGlvbjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgc2VjdG9yID0gdGhpcy5zZWN0b3JzW2RhdGEuaW5kZXhdLnNlY3RvcjtcbiAgICAgICAgdGhpcy5fcmVzdG9yZVNlY3RvcihzZWN0b3IpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBbmltYXRlLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIGNhbGxiYWNrXG4gICAgICovXG4gICAgYW5pbWF0ZTogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGRlbGF5VGltZSA9IDAsXG4gICAgICAgICAgICBjaXJjbGVCb3VuZCA9IHRoaXMuY2lyY2xlQm91bmQ7XG4gICAgICAgIHR1aS51dGlsLmZvckVhY2hBcnJheSh0aGlzLnNlY3RvcnMsIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgIHZhciBhbmdsZXMgPSBpdGVtLmFuZ2xlcyxcbiAgICAgICAgICAgICAgICBhbmltYXRpb25UaW1lID0gTE9BRElOR19BTklNQVRJT05fVElNRSAqIGl0ZW0ucGVyY2VudFZhbHVlLFxuICAgICAgICAgICAgICAgIGFuaW0gPSBSYXBoYWVsLmFuaW1hdGlvbih7XG4gICAgICAgICAgICAgICAgICAgIHNlY3RvcjogW2NpcmNsZUJvdW5kLmN4LCBjaXJjbGVCb3VuZC5jeSwgY2lyY2xlQm91bmQuciwgYW5nbGVzLnN0YXJ0QW5nbGUsIGFuZ2xlcy5lbmRBbmdsZV1cbiAgICAgICAgICAgICAgICB9LCBhbmltYXRpb25UaW1lKTtcbiAgICAgICAgICAgIGl0ZW0uc2VjdG9yLmFuaW1hdGUoYW5pbS5kZWxheShkZWxheVRpbWUpKTtcbiAgICAgICAgICAgIGRlbGF5VGltZSArPSBhbmltYXRpb25UaW1lO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoY2FsbGJhY2ssIGRlbGF5VGltZSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQW5pbWF0ZSBsZWdlbmQgbGluZXMuXG4gICAgICovXG4gICAgYW5pbWF0ZUxlZ2VuZExpbmVzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCF0aGlzLmxlZ2VuZExpbmVzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaEFycmF5KHRoaXMubGVnZW5kTGluZXMsIGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIGxpbmUuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgJ3N0cm9rZSc6ICdibGFjaycsXG4gICAgICAgICAgICAgICAgJ3N0cm9rZS1vcGFjaXR5JzogMVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhcGhhZWxQaWVDaGFydDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBVdGlsIGZvciByYXBoYWVsIHJlbmRlcmluZy5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBVdGlsIGZvciByYXBoYWVsIHJlbmRlcmluZy5cbiAqIEBtb2R1bGUgcmFwaGFlbFJlbmRlclV0aWxcbiAqL1xudmFyIHJhcGhhZWxSZW5kZXJVdGlsID0ge1xuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgbGluZSBwYXRoLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6cmFwaGFlbFJlbmRlclV0aWxcbiAgICAgKiBAcGFyYW0ge3t0b3A6IG51bWJlciwgbGVmdDogbnVtYmVyfX0gZnJvbVBvcyBmcm9tIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHt7dG9wOiBudW1iZXIsIGxlZnQ6IG51bWJlcn19IHRvUG9zIHRvIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoIHdpZHRoXG4gICAgICogQHJldHVybnMge3N0cmluZ30gcGF0aFxuICAgICAqL1xuICAgIG1ha2VMaW5lUGF0aDogZnVuY3Rpb24oZnJvbVBvcywgdG9Qb3MsIHdpZHRoKSB7XG4gICAgICAgIHZhciBmcm9tUG9pbnQgPSBbZnJvbVBvcy5sZWZ0LCBmcm9tUG9zLnRvcF0sXG4gICAgICAgICAgICB0b1BvaW50ID0gW3RvUG9zLmxlZnQsIHRvUG9zLnRvcF07XG5cbiAgICAgICAgd2lkdGggPSB3aWR0aCB8fCAxO1xuXG4gICAgICAgIHR1aS51dGlsLmZvckVhY2hBcnJheShmcm9tUG9pbnQsIGZ1bmN0aW9uKGZyb20sIGluZGV4KSB7XG4gICAgICAgICAgICBpZiAoZnJvbSA9PT0gdG9Qb2ludFtpbmRleF0pIHtcbiAgICAgICAgICAgICAgICBmcm9tUG9pbnRbaW5kZXhdID0gdG9Qb2ludFtpbmRleF0gPSBNYXRoLnJvdW5kKGZyb20pIC0gKHdpZHRoICUgMiAvIDIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuICdNJyArIGZyb21Qb2ludC5qb2luKCcgJykgKyAnTCcgKyB0b1BvaW50LmpvaW4oJyAnKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGxpbmUuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpyYXBoYWVsUmVuZGVyVXRpbFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGggbGluZSBwYXRoXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbG9yIGxpbmUgY29sb3JcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3Ryb2tlV2lkdGggc3Ryb2tlIHdpZHRoXG4gICAgICogQHJldHVybnMge29iamVjdH0gcmFwaGFlbCBsaW5lXG4gICAgICovXG4gICAgcmVuZGVyTGluZTogZnVuY3Rpb24ocGFwZXIsIHBhdGgsIGNvbG9yLCBzdHJva2VXaWR0aCkge1xuICAgICAgICB2YXIgbGluZSA9IHBhcGVyLnBhdGgoW3BhdGhdKSxcbiAgICAgICAgICAgIHN0cm9rZVN0eWxlID0ge1xuICAgICAgICAgICAgICAgIHN0cm9rZTogY29sb3IsXG4gICAgICAgICAgICAgICAgJ3N0cm9rZS13aWR0aCc6IHN0cm9rZVdpZHRoIHx8IDJcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgaWYgKGNvbG9yID09PSAndHJhbnNwYXJlbnQnKSB7XG4gICAgICAgICAgICBzdHJva2VTdHlsZS5zdHJva2UgPSAnI2ZmZic7XG4gICAgICAgICAgICBzdHJva2VTdHlsZVsnc3Ryb2tlLW9wYWNpdHknXSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgbGluZS5hdHRyKHN0cm9rZVN0eWxlKTtcblxuICAgICAgICByZXR1cm4gbGluZTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJhcGhhZWxSZW5kZXJVdGlsO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4vY29uc3QnKSxcbiAgICBjaGFydEZhY3RvcnkgPSByZXF1aXJlKCcuL2ZhY3Rvcmllcy9jaGFydEZhY3RvcnknKSxcbiAgICBCYXJDaGFydCA9IHJlcXVpcmUoJy4vY2hhcnRzL2JhckNoYXJ0JyksXG4gICAgQ29sdW1uQ2hhcnQgPSByZXF1aXJlKCcuL2NoYXJ0cy9jb2x1bW5DaGFydCcpLFxuICAgIExpbmVDaGFydCA9IHJlcXVpcmUoJy4vY2hhcnRzL2xpbmVDaGFydCcpLFxuICAgIEFyZWFDaGFydCA9IHJlcXVpcmUoJy4vY2hhcnRzL2FyZWFDaGFydCcpLFxuICAgIENvbWJvQ2hhcnQgPSByZXF1aXJlKCcuL2NoYXJ0cy9jb21ib0NoYXJ0JyksXG4gICAgUGllQ2hhcnQgPSByZXF1aXJlKCcuL2NoYXJ0cy9waWVDaGFydCcpO1xuXG5jaGFydEZhY3RvcnkucmVnaXN0ZXIoY2hhcnRDb25zdC5DSEFSVF9UWVBFX0JBUiwgQmFyQ2hhcnQpO1xuY2hhcnRGYWN0b3J5LnJlZ2lzdGVyKGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9DT0xVTU4sIENvbHVtbkNoYXJ0KTtcbmNoYXJ0RmFjdG9yeS5yZWdpc3RlcihjaGFydENvbnN0LkNIQVJUX1RZUEVfTElORSwgTGluZUNoYXJ0KTtcbmNoYXJ0RmFjdG9yeS5yZWdpc3RlcihjaGFydENvbnN0LkNIQVJUX1RZUEVfQVJFQSwgQXJlYUNoYXJ0KTtcbmNoYXJ0RmFjdG9yeS5yZWdpc3RlcihjaGFydENvbnN0LkNIQVJUX1RZUEVfQ09NQk8sIENvbWJvQ2hhcnQpO1xuY2hhcnRGYWN0b3J5LnJlZ2lzdGVyKGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9QSUUsIFBpZUNoYXJ0KTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuL2NvbnN0JyksXG4gICAgdGhlbWVGYWN0b3J5ID0gcmVxdWlyZSgnLi9mYWN0b3JpZXMvdGhlbWVGYWN0b3J5JyksXG4gICAgZGVmYXVsdFRoZW1lID0gcmVxdWlyZSgnLi90aGVtZXMvZGVmYXVsdFRoZW1lJyk7XG5cbnRoZW1lRmFjdG9yeS5yZWdpc3RlcihjaGFydENvbnN0LkRFRkFVTFRfVEhFTUVfTkFNRSwgZGVmYXVsdFRoZW1lKTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBBcmVhIGNoYXJ0IHNlcmllcyBjb21wb25lbnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTZXJpZXMgPSByZXF1aXJlKCcuL3NlcmllcycpLFxuICAgIExpbmVUeXBlU2VyaWVzQmFzZSA9IHJlcXVpcmUoJy4vbGluZVR5cGVTZXJpZXNCYXNlJyk7XG5cbnZhciBBcmVhQ2hhcnRTZXJpZXMgPSB0dWkudXRpbC5kZWZpbmVDbGFzcyhTZXJpZXMsIC8qKiBAbGVuZHMgQXJlYUNoYXJ0U2VyaWVzLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogQXJlYSBjaGFydCBzZXJpZXMgY29tcG9uZW50LlxuICAgICAqIEBjb25zdHJ1Y3RzIEFyZWFDaGFydFNlcmllc1xuICAgICAqIEBleHRlbmRzIFNlcmllc1xuICAgICAqIEBtaXhlcyBMaW5lVHlwZVNlcmllc0Jhc2VcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMubW9kZWwgc2VyaWVzIG1vZGVsXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgc2VyaWVzIG9wdGlvbnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgc2VyaWVzIHRoZW1lXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIFNlcmllcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHNlcmllcyBkYXRhLlxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IGFkZCBkYXRhXG4gICAgICovXG4gICAgbWFrZVNlcmllc0RhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZGltZW5zaW9uID0gdGhpcy5ib3VuZC5kaW1lbnNpb24sXG4gICAgICAgICAgICBzY2FsZURpc3RhbmNlID0gdGhpcy5nZXRTY2FsZURpc3RhbmNlRnJvbVplcm9Qb2ludChkaW1lbnNpb24uaGVpZ2h0LCB0aGlzLmRhdGEuc2NhbGUpLFxuICAgICAgICAgICAgemVyb1RvcCA9IHNjYWxlRGlzdGFuY2UudG9NYXg7XG4gICAgICAgIGlmICh0aGlzLmRhdGEuc2NhbGUubWluID49IDAgJiYgIXplcm9Ub3ApIHtcbiAgICAgICAgICAgIHplcm9Ub3AgPSBkaW1lbnNpb24uaGVpZ2h0O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGdyb3VwUG9zaXRpb25zOiB0aGlzLm1ha2VQb3NpdGlvbnMoZGltZW5zaW9uKSxcbiAgICAgICAgICAgIHplcm9Ub3A6IHplcm9Ub3BcbiAgICAgICAgfTtcbiAgICB9XG59KTtcblxuTGluZVR5cGVTZXJpZXNCYXNlLm1peGluKEFyZWFDaGFydFNlcmllcyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQXJlYUNoYXJ0U2VyaWVzO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEJhciBjaGFydCBzZXJpZXMgY29tcG9uZW50LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU2VyaWVzID0gcmVxdWlyZSgnLi9zZXJpZXMnKSxcbiAgICBCYXJUeXBlU2VyaWVzQmFzZSA9IHJlcXVpcmUoJy4vYmFyVHlwZVNlcmllc0Jhc2UnKSxcbiAgICBjaGFydENvbnN0ID0gcmVxdWlyZSgnLi4vY29uc3QnKSxcbiAgICByZW5kZXJVdGlsID0gcmVxdWlyZSgnLi4vaGVscGVycy9yZW5kZXJVdGlsJyk7XG5cbnZhciBCYXJDaGFydFNlcmllcyA9IHR1aS51dGlsLmRlZmluZUNsYXNzKFNlcmllcywgLyoqIEBsZW5kcyBCYXJDaGFydFNlcmllcy5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIEJhciBjaGFydCBzZXJpZXMgY29tcG9uZW50LlxuICAgICAqIEBjb25zdHJ1Y3RzIEJhckNoYXJ0U2VyaWVzXG4gICAgICogQGV4dGVuZHMgU2VyaWVzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm1vZGVsIHNlcmllcyBtb2RlbFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5vcHRpb25zIHNlcmllcyBvcHRpb25zXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIHNlcmllcyB0aGVtZVxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBTZXJpZXMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGJvdW5kIG9mIGJhciBjaGFydC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7e3RvcDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IHBhcmFtcy5iYXNlQm91bmQgYmFzZSBib3VuZFxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5zdGFydExlZnQgc3RhcnQgbGVmdFxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5lbmRMZWZ0IGVuZCBsZWZ0XG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmVuZFdpZHRoIGVuZCB3aWR0aFxuICAgICAqIEByZXR1cm5zIHt7XG4gICAgICogICAgICBzdGFydDoge2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfSxcbiAgICAgKiAgICAgIGVuZDoge2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfVxuICAgICAqIH19IGNvbHVtbiBjaGFydCBib3VuZFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VCYXJDaGFydEJvdW5kOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN0YXJ0OiB0dWkudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgICAgIGxlZnQ6IHBhcmFtcy5zdGFydExlZnQsXG4gICAgICAgICAgICAgICAgd2lkdGg6IDBcbiAgICAgICAgICAgIH0sIHBhcmFtcy5iYXNlQm91bmQpLFxuICAgICAgICAgICAgZW5kOiB0dWkudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgICAgIGxlZnQ6IHBhcmFtcy5lbmRMZWZ0LFxuICAgICAgICAgICAgICAgIHdpZHRoOiBwYXJhbXMuZW5kV2lkdGhcbiAgICAgICAgICAgIH0sIHBhcmFtcy5iYXNlQm91bmQpXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2Ugbm9ybWFsIGJhciBjaGFydCBib3VuZC5cbiAgICAgKiBAcGFyYW0ge3tcbiAgICAgKiAgICAgIGRpbWVuc2lvbjoge3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfSxcbiAgICAgKiAgICAgIGdyb3VwVmFsdWVzOiBhcnJheS48YXJyYXkuPG51bWJlcj4+LFxuICAgICAqICAgICAgZ3JvdXBTaXplOiBudW1iZXIsIGJhclBhZGRpbmc6IG51bWJlciwgYmFyU2l6ZTogbnVtYmVyLCBzdGVwOiBudW1iZXIsXG4gICAgICogICAgICBkaXN0YW5jZVRvTWluOiBudW1iZXIsIGlzTWludXM6IGJvb2xlYW5cbiAgICAgKiB9fSBiYXNlSW5mbyBiYXNlIGluZm9cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgdmFsdWVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gcGFkZGluZ1RvcCBwYWRkaW5nIHRvcFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBpbmRleFxuICAgICAqIEByZXR1cm5zIHt7XG4gICAgICogICAgICBzdGFydDoge2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfSxcbiAgICAgKiAgICAgIGVuZDoge2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfVxuICAgICAqIH19IGNvbHVtbiBjaGFydCBib3VuZFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VOb3JtYWxCYXJDaGFydEJvdW5kOiBmdW5jdGlvbihiYXNlSW5mbywgdmFsdWUsIHBhZGRpbmdUb3AsIGluZGV4KSB7XG4gICAgICAgIHZhciBzdGFydExlZnQsIGVuZFdpZHRoLCBib3VuZCwgYmFzZUJvdW5kO1xuXG4gICAgICAgIHN0YXJ0TGVmdCA9IGJhc2VJbmZvLmRpc3RhbmNlVG9NaW4gKyBjaGFydENvbnN0LlNFUklFU19FWFBBTkRfU0laRTtcbiAgICAgICAgZW5kV2lkdGggPSBNYXRoLmFicyh2YWx1ZSAqIGJhc2VJbmZvLmRpbWVuc2lvbi53aWR0aCk7XG4gICAgICAgIGJhc2VCb3VuZCA9IHtcbiAgICAgICAgICAgIHRvcDogcGFkZGluZ1RvcCArICgoYmFzZUluZm8uc3RlcCkgKiBpbmRleCksXG4gICAgICAgICAgICBoZWlnaHQ6IGJhc2VJbmZvLmJhclNpemVcbiAgICAgICAgfTtcbiAgICAgICAgYm91bmQgPSB0aGlzLl9tYWtlQmFyQ2hhcnRCb3VuZCh7XG4gICAgICAgICAgICBiYXNlQm91bmQ6IGJhc2VCb3VuZCxcbiAgICAgICAgICAgIHN0YXJ0TGVmdDogc3RhcnRMZWZ0LFxuICAgICAgICAgICAgZW5kTGVmdDogc3RhcnRMZWZ0ICsgKHZhbHVlIDwgMCA/IC1lbmRXaWR0aCA6IDApLFxuICAgICAgICAgICAgZW5kV2lkdGg6IGVuZFdpZHRoXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBib3VuZDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBib3VuZHMgb2Ygbm9ybWFsIGJhciBjaGFydC5cbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6bnVtYmVyfX0gZGltZW5zaW9uIGJhciBjaGFydCBkaW1lbnNpb25cbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gYm91bmRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZU5vcm1hbEJhckNoYXJ0Qm91bmRzOiBmdW5jdGlvbihkaW1lbnNpb24pIHtcbiAgICAgICAgdmFyIGJhc2VJbmZvID0gdGhpcy5tYWtlQmFzZUluZm9Gb3JOb3JtYWxDaGFydEJvdW5kcyhkaW1lbnNpb24sICd3aWR0aCcsICdoZWlnaHQnKSxcbiAgICAgICAgICAgIGJvdW5kcztcblxuICAgICAgICBib3VuZHMgPSB0dWkudXRpbC5tYXAoYmFzZUluZm8uZ3JvdXBWYWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcywgZ3JvdXBJbmRleCkge1xuICAgICAgICAgICAgdmFyIHBhZGRpbmdUb3AgPSAoYmFzZUluZm8uZ3JvdXBTaXplICogZ3JvdXBJbmRleCkgKyAoYmFzZUluZm8uYmFyU2l6ZSAvIDIpO1xuICAgICAgICAgICAgcmV0dXJuIHR1aS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fbWFrZU5vcm1hbEJhckNoYXJ0Qm91bmQoYmFzZUluZm8sIHZhbHVlLCBwYWRkaW5nVG9wLCBpbmRleCk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgcmV0dXJuIGJvdW5kcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBib3VuZHMgb2Ygc3RhY2tlZCBiYXIgY2hhcnQuXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0Om51bWJlcn19IGRpbWVuc2lvbiBiYXIgY2hhcnQgZGltZW5zaW9uXG4gICAgICogQHJldHVybnMge2FycmF5LjxhcnJheS48b2JqZWN0Pj59IGJvdW5kc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VTdGFja2VkQmFyQ2hhcnRCb3VuZHM6IGZ1bmN0aW9uKGRpbWVuc2lvbikge1xuICAgICAgICB2YXIgZ3JvdXBWYWx1ZXMsIGdyb3VwSGVpZ2h0LCBiYXJIZWlnaHQsIGJvdW5kcztcbiAgICAgICAgZ3JvdXBWYWx1ZXMgPSB0aGlzLnBlcmNlbnRWYWx1ZXM7XG4gICAgICAgIGdyb3VwSGVpZ2h0ID0gKGRpbWVuc2lvbi5oZWlnaHQgLyBncm91cFZhbHVlcy5sZW5ndGgpO1xuICAgICAgICBiYXJIZWlnaHQgPSBncm91cEhlaWdodCAvIDI7XG4gICAgICAgIGJvdW5kcyA9IHR1aS51dGlsLm1hcChncm91cFZhbHVlcywgZnVuY3Rpb24gKHZhbHVlcywgZ3JvdXBJbmRleCkge1xuICAgICAgICAgICAgdmFyIHBhZGRpbmdUb3AgPSAoZ3JvdXBIZWlnaHQgKiBncm91cEluZGV4KSArIChiYXJIZWlnaHQgLyAyKSxcbiAgICAgICAgICAgICAgICBlbmRMZWZ0ID0gY2hhcnRDb25zdC5TRVJJRVNfRVhQQU5EX1NJWkU7XG4gICAgICAgICAgICByZXR1cm4gdHVpLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVuZFdpZHRoLCBiYXNlQm91bmQsIGJvdW5kO1xuXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBlbmRXaWR0aCA9IHZhbHVlICogZGltZW5zaW9uLndpZHRoO1xuICAgICAgICAgICAgICAgIGJhc2VCb3VuZCA9IHtcbiAgICAgICAgICAgICAgICAgICAgdG9wOiBwYWRkaW5nVG9wLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IGJhckhlaWdodFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYm91bmQgPSB0aGlzLl9tYWtlQmFyQ2hhcnRCb3VuZCh7XG4gICAgICAgICAgICAgICAgICAgIGJhc2VCb3VuZDogYmFzZUJvdW5kLFxuICAgICAgICAgICAgICAgICAgICBzdGFydExlZnQ6IGNoYXJ0Q29uc3QuU0VSSUVTX0VYUEFORF9TSVpFLFxuICAgICAgICAgICAgICAgICAgICBlbmRMZWZ0OiBlbmRMZWZ0LFxuICAgICAgICAgICAgICAgICAgICBlbmRXaWR0aDogZW5kV2lkdGhcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGVuZExlZnQgPSBlbmRMZWZ0ICsgZW5kV2lkdGg7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJvdW5kO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgICByZXR1cm4gYm91bmRzO1xuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYm91bmRzIG9mIGJhciBjaGFydC5cbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6bnVtYmVyfX0gZGltZW5zaW9uIGJhciBjaGFydCBkaW1lbnNpb25cbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gYm91bmRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUJvdW5kczogZnVuY3Rpb24oZGltZW5zaW9uKSB7XG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLnN0YWNrZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9tYWtlTm9ybWFsQmFyQ2hhcnRCb3VuZHMoZGltZW5zaW9uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9tYWtlU3RhY2tlZEJhckNoYXJ0Qm91bmRzKGRpbWVuc2lvbik7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBzZXJpZXMgcmVuZGVyaW5nIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHtvYmVqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy52YWx1ZSB2YWx1ZVxuICAgICAqICAgICAgQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlciwgd2lkdGg6bnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IHBhcmFtcy5ib3VuZCBib3VuZFxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5mb3JtYXR0ZWRWYWx1ZSBmb3JtYXR0ZWQgdmFsdWVcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubGFiZWxIZWlnaHQgbGFiZWwgaGVpZ2h0XG4gICAgICogQHJldHVybnMge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gcmVuZGVyaW5nIHBvc2l0aW9uXG4gICAgICovXG4gICAgbWFrZVNlcmllc1JlbmRlcmluZ1Bvc2l0aW9uOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGxhYmVsV2lkdGggPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxXaWR0aChwYXJhbXMuZm9ybWF0dGVkVmFsdWUsIHRoaXMudGhlbWUubGFiZWwpLFxuICAgICAgICAgICAgYm91bmQgPSBwYXJhbXMuYm91bmQsXG4gICAgICAgICAgICBsZWZ0ID0gYm91bmQubGVmdCxcbiAgICAgICAgICAgIHRvcCA9IGJvdW5kLnRvcCArIChib3VuZC5oZWlnaHQgLSBwYXJhbXMubGFiZWxIZWlnaHQgKyBjaGFydENvbnN0LlRFWFRfUEFERElORykgLyAyO1xuXG4gICAgICAgIGlmIChwYXJhbXMudmFsdWUgPj0gMCkge1xuICAgICAgICAgICAgbGVmdCArPSBib3VuZC53aWR0aCArIGNoYXJ0Q29uc3QuU0VSSUVTX0xBQkVMX1BBRERJTkc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZWZ0IC09IGxhYmVsV2lkdGggKyBjaGFydENvbnN0LlNFUklFU19MQUJFTF9QQURESU5HO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxlZnQ6IGxlZnQsXG4gICAgICAgICAgICB0b3A6IHRvcFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHN1bSBsYWJlbCBodG1sLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48bnVtYmVyPn0gcGFyYW1zLnZhbHVlcyB2YWx1ZXNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPGZ1bmN0aW9uPn0gcGFyYW1zLmZvcm1hdEZ1bmN0aW9ucyBmb3JtYXR0aW5nIGZ1bmN0aW9uc1xuICAgICAqICAgICAgQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IHBhcmFtcy5ib3VuZCBib3VuZFxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5sYWJlbEhlaWdodCBsYWJlbCBoZWlnaHRcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBzdW0gbGFiZWwgaHRtbFxuICAgICAqL1xuICAgIG1ha2VTdW1MYWJlbEh0bWw6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgc3VtID0gdGhpcy5tYWtlU3VtVmFsdWVzKHBhcmFtcy52YWx1ZXMsIHBhcmFtcy5mb3JtYXRGdW5jdGlvbnMpLFxuICAgICAgICAgICAgYm91bmQgPSBwYXJhbXMuYm91bmQsXG4gICAgICAgICAgICBsYWJlbEhlaWdodCA9IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodChzdW0sIHRoaXMudGhlbWUubGFiZWwpLFxuICAgICAgICAgICAgdG9wID0gYm91bmQudG9wICsgKChib3VuZC5oZWlnaHQgLSBsYWJlbEhlaWdodCArIGNoYXJ0Q29uc3QuVEVYVF9QQURESU5HKSAvIDIpLFxuICAgICAgICAgICAgbGVmdCA9IGJvdW5kLmxlZnQgKyBib3VuZC53aWR0aCArIGNoYXJ0Q29uc3QuU0VSSUVTX0xBQkVMX1BBRERJTkc7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMubWFrZVNlcmllc0xhYmVsSHRtbCh7XG4gICAgICAgICAgICBsZWZ0OiBsZWZ0LFxuICAgICAgICAgICAgdG9wOiB0b3BcbiAgICAgICAgfSwgc3VtLCAtMSwgLTEpO1xuICAgIH1cbn0pO1xuXG5CYXJUeXBlU2VyaWVzQmFzZS5taXhpbihCYXJDaGFydFNlcmllcyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmFyQ2hhcnRTZXJpZXM7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgQ29sdW1uIGNoYXJ0IHNlcmllcyBjb21wb25lbnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBjaGFydENvbnN0ID0gcmVxdWlyZSgnLi4vY29uc3QnKSxcbiAgICBkb20gPSByZXF1aXJlKCcuLi9oZWxwZXJzL2RvbUhhbmRsZXInKSxcbiAgICByZW5kZXJVdGlsID0gcmVxdWlyZSgnLi4vaGVscGVycy9yZW5kZXJVdGlsJyk7XG5cbnZhciBCYXJUeXBlU2VyaWVzQmFzZSA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgQmFyVHlwZVNlcmllc0Jhc2UucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHNlcmllcyBkYXRhLlxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IGFkZCBkYXRhXG4gICAgICovXG4gICAgbWFrZVNlcmllc0RhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZ3JvdXBCb3VuZHMgPSB0aGlzLl9tYWtlQm91bmRzKHRoaXMuYm91bmQuZGltZW5zaW9uKTtcblxuICAgICAgICB0aGlzLmdyb3VwQm91bmRzID0gZ3JvdXBCb3VuZHM7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGdyb3VwQm91bmRzOiBncm91cEJvdW5kcyxcbiAgICAgICAgICAgIGdyb3VwVmFsdWVzOiB0aGlzLnBlcmNlbnRWYWx1ZXNcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBiYXIgZ3V0dGVyLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBncm91cFNpemUgYmFyIGdyb3VwIHNpemVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaXRlbUNvdW50IGdyb3VwIGl0ZW0gY291bnRcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBiYXIgZ3V0dGVyXG4gICAgICovXG4gICAgbWFrZUJhckd1dHRlcjogZnVuY3Rpb24oZ3JvdXBTaXplLCBpdGVtQ291bnQpIHtcbiAgICAgICAgdmFyIGJhc2VTaXplID0gZ3JvdXBTaXplIC8gKGl0ZW1Db3VudCArIDEpIC8gMixcbiAgICAgICAgICAgIGd1dHRlcjtcbiAgICAgICAgaWYgKGJhc2VTaXplIDw9IDIpIHtcbiAgICAgICAgICAgIGd1dHRlciA9IDA7XG4gICAgICAgIH0gZWxzZSBpZiAoYmFzZVNpemUgPD0gNikge1xuICAgICAgICAgICAgZ3V0dGVyID0gMjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGd1dHRlciA9IDQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGd1dHRlcjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBiYXIgc2l6ZS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZ3JvdXBTaXplIGJhciBncm91cCBzaXplXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGJhclBhZGRpbmcgYmFyIHBhZGRpbmdcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaXRlbUNvdW50IGdyb3VwIGl0ZW0gY291bnRcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBiYXIgc2l6ZSAod2lkdGggb3IgaGVpZ2h0KVxuICAgICAqL1xuICAgIG1ha2VCYXJTaXplOiBmdW5jdGlvbihncm91cFNpemUsIGJhclBhZGRpbmcsIGl0ZW1Db3VudCkge1xuICAgICAgICByZXR1cm4gKGdyb3VwU2l6ZSAtIChiYXJQYWRkaW5nICogKGl0ZW1Db3VudCAtIDEpKSkgLyAoaXRlbUNvdW50ICsgMSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYmFzZSBpbmZvIGZvciBub3JtYWwgY2hhcnQgYm91bmRzLlxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gZGltZW5zaW9uIHNlcmllcyBkaW1lbnNpb25cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc2l6ZVR5cGUgc2l6ZSB0eXBlICh3aWR0aCBvciBoZWlnaHQpXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGFub3RoZXJTaXplVHlwZSBhbm90aGVyIHNpemUgdHlwZSAod2lkdGggb3IgaGVpZ2h0KVxuICAgICAqIEByZXR1cm5zIHt7XG4gICAgICogICAgICBkaW1lbnNpb246IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn0sXG4gICAgICogICAgICBncm91cFZhbHVlczogYXJyYXkuPGFycmF5LjxudW1iZXI+PixcbiAgICAgKiAgICAgIGdyb3VwU2l6ZTogbnVtYmVyLCBiYXJQYWRkaW5nOiBudW1iZXIsIGJhclNpemU6IG51bWJlciwgc3RlcDogbnVtYmVyLFxuICAgICAqICAgICAgZGlzdGFuY2VUb01pbjogbnVtYmVyLCBpc01pbnVzOiBib29sZWFuXG4gICAgICogfX0gYmFzZSBpbmZvXG4gICAgICovXG4gICAgbWFrZUJhc2VJbmZvRm9yTm9ybWFsQ2hhcnRCb3VuZHM6IGZ1bmN0aW9uKGRpbWVuc2lvbiwgc2l6ZVR5cGUsIGFub3RoZXJTaXplVHlwZSkge1xuICAgICAgICB2YXIgZ3JvdXBWYWx1ZXMgPSB0aGlzLnBlcmNlbnRWYWx1ZXMsXG4gICAgICAgICAgICBncm91cFNpemUgPSBkaW1lbnNpb25bYW5vdGhlclNpemVUeXBlXSAvIGdyb3VwVmFsdWVzLmxlbmd0aCxcbiAgICAgICAgICAgIGl0ZW1Db3VudCA9IGdyb3VwVmFsdWVzWzBdICYmIGdyb3VwVmFsdWVzWzBdLmxlbmd0aCB8fCAwLFxuICAgICAgICAgICAgYmFyUGFkZGluZyA9IHRoaXMubWFrZUJhckd1dHRlcihncm91cFNpemUsIGl0ZW1Db3VudCksXG4gICAgICAgICAgICBiYXJTaXplID0gdGhpcy5tYWtlQmFyU2l6ZShncm91cFNpemUsIGJhclBhZGRpbmcsIGl0ZW1Db3VudCksXG4gICAgICAgICAgICBzY2FsZURpc3RhbmNlID0gdGhpcy5nZXRTY2FsZURpc3RhbmNlRnJvbVplcm9Qb2ludChkaW1lbnNpb25bc2l6ZVR5cGVdLCB0aGlzLmRhdGEuc2NhbGUpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGltZW5zaW9uOiBkaW1lbnNpb24sXG4gICAgICAgICAgICBncm91cFZhbHVlczogZ3JvdXBWYWx1ZXMsXG4gICAgICAgICAgICBncm91cFNpemU6IGdyb3VwU2l6ZSxcbiAgICAgICAgICAgIGJhclBhZGRpbmc6IGJhclBhZGRpbmcsXG4gICAgICAgICAgICBiYXJTaXplOiBiYXJTaXplLFxuICAgICAgICAgICAgc3RlcDogYmFyU2l6ZSArIGJhclBhZGRpbmcsXG4gICAgICAgICAgICBkaXN0YW5jZVRvTWluOiBzY2FsZURpc3RhbmNlLnRvTWluLFxuICAgICAgICAgICAgaXNNaW51czogdGhpcy5kYXRhLnNjYWxlLm1pbiA8IDAgJiYgdGhpcy5kYXRhLnNjYWxlLm1heCA8PSAwXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBub3JtYWwgc2VyaWVzIGxhYmVsLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtIVE1MRWxlbWVudH0gcGFyYW1zLmNvbnRhaW5lciBjb250YWluZXJcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gcGFyYW1zLmdyb3VwQm91bmRzIGdyb3VwIGJvdW5kc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48YXJyYXk+fSBwYXJhbXMuZm9ybWF0dGVkVmFsdWVzIGZvcm1hdHRlZCB2YWx1ZXNcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHNlcmllcyBsYWJlbCBhcmVhXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyTm9ybWFsU2VyaWVzTGFiZWw6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgZ3JvdXBCb3VuZHMgPSBwYXJhbXMuZ3JvdXBCb3VuZHMsXG4gICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXMgPSBwYXJhbXMuZm9ybWF0dGVkVmFsdWVzLFxuICAgICAgICAgICAgbGFiZWxIZWlnaHQgPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxIZWlnaHQoZm9ybWF0dGVkVmFsdWVzWzBdWzBdLCB0aGlzLnRoZW1lLmxhYmVsKSxcbiAgICAgICAgICAgIGVsU2VyaWVzTGFiZWxBcmVhID0gZG9tLmNyZWF0ZSgnZGl2JywgJ3R1aS1jaGFydC1zZXJpZXMtbGFiZWwtYXJlYScpLFxuICAgICAgICAgICAgaHRtbDtcbiAgICAgICAgaHRtbCA9IHR1aS51dGlsLm1hcChwYXJhbXMudmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMsIGdyb3VwSW5kZXgpIHtcbiAgICAgICAgICAgIHJldHVybiB0dWkudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgYm91bmQsIGZvcm1hdHRlZFZhbHVlLCByZW5kZXJpbmdQb3NpdGlvbjtcbiAgICAgICAgICAgICAgICBib3VuZCA9IGdyb3VwQm91bmRzW2dyb3VwSW5kZXhdW2luZGV4XS5lbmQ7XG4gICAgICAgICAgICAgICAgZm9ybWF0dGVkVmFsdWUgPSBmb3JtYXR0ZWRWYWx1ZXNbZ3JvdXBJbmRleF1baW5kZXhdO1xuICAgICAgICAgICAgICAgIHJlbmRlcmluZ1Bvc2l0aW9uID0gdGhpcy5tYWtlU2VyaWVzUmVuZGVyaW5nUG9zaXRpb24oe1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIGJvdW5kOiBib3VuZCxcbiAgICAgICAgICAgICAgICAgICAgZm9ybWF0dGVkVmFsdWU6IGZvcm1hdHRlZFZhbHVlLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbEhlaWdodDogbGFiZWxIZWlnaHRcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tYWtlU2VyaWVzTGFiZWxIdG1sKHJlbmRlcmluZ1Bvc2l0aW9uLCBmb3JtYXR0ZWRWYWx1ZSwgZ3JvdXBJbmRleCwgaW5kZXgpO1xuICAgICAgICAgICAgfSwgdGhpcykuam9pbignJyk7XG4gICAgICAgIH0sIHRoaXMpLmpvaW4oJycpO1xuXG4gICAgICAgIGVsU2VyaWVzTGFiZWxBcmVhLmlubmVySFRNTCA9IGh0bWw7XG4gICAgICAgIHBhcmFtcy5jb250YWluZXIuYXBwZW5kQ2hpbGQoZWxTZXJpZXNMYWJlbEFyZWEpO1xuXG4gICAgICAgIHJldHVybiBlbFNlcmllc0xhYmVsQXJlYTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBzdW0gdmFsdWVzLlxuICAgICAqIEBwYXJhbSB7YXJyYXkuPG51bWJlcj59IHZhbHVlcyB2YWx1ZXNcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxmdW5jdGlvbj59IGZvcm1hdEZ1bmN0aW9ucyBmb3JtYXQgZnVuY3Rpb25zXG4gICAgICogQHJldHVybnMge251bWJlcn0gc3VtIHJlc3VsdC5cbiAgICAgKi9cbiAgICBtYWtlU3VtVmFsdWVzOiBmdW5jdGlvbih2YWx1ZXMsIGZvcm1hdEZ1bmN0aW9ucykge1xuICAgICAgICB2YXIgc3VtID0gdHVpLnV0aWwuc3VtKHR1aS51dGlsLmZpbHRlcih2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlID4gMDtcbiAgICAgICAgICAgIH0pKSxcbiAgICAgICAgICAgIGZucyA9IFtzdW1dLmNvbmNhdChmb3JtYXRGdW5jdGlvbnMgfHwgW10pO1xuXG4gICAgICAgIHJldHVybiB0dWkudXRpbC5yZWR1Y2UoZm5zLCBmdW5jdGlvbihzdG9yZWQsIGZuKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4oc3RvcmVkKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2Ugc3RhY2tlZCBsYWJlbHMgaHRtbC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuZ3JvdXBJbmRleCBncm91cCBpbmRleFxuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48bnVtYmVyPn0gcGFyYW1zLnZhbHVlcyB2YWx1ZXMsXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxmdW5jdGlvbj59IHBhcmFtcy5mb3JtYXRGdW5jdGlvbnMgZm9ybWF0dGluZyBmdW5jdGlvbnMsXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxvYmplY3Q+fSBwYXJhbXMuYm91bmRzIGJvdW5kcyxcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXl9IHBhcmFtcy5mb3JtYXR0ZWRWYWx1ZXMgZm9ybWF0dGVkIHZhbHVlcyxcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubGFiZWxIZWlnaHQgbGFiZWwgaGVpZ2h0XG4gICAgICogQHJldHVybnMge3N0cmluZ30gbGFiZWxzIGh0bWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlU3RhY2tlZExhYmVsc0h0bWw6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgdmFsdWVzID0gcGFyYW1zLnZhbHVlcyxcbiAgICAgICAgICAgIGJvdW5kLCBodG1scztcblxuICAgICAgICBodG1scyA9IHR1aS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgICAgdmFyIGxhYmVsV2lkdGgsIGxlZnQsIHRvcCwgbGFiZWxIdG1sLCBmb3JtYXR0ZWRWYWx1ZTtcblxuICAgICAgICAgICAgaWYgKHZhbHVlIDwgMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYm91bmQgPSBwYXJhbXMuYm91bmRzW2luZGV4XS5lbmQ7XG4gICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZSA9IHBhcmFtcy5mb3JtYXR0ZWRWYWx1ZXNbaW5kZXhdO1xuICAgICAgICAgICAgbGFiZWxXaWR0aCA9IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbFdpZHRoKGZvcm1hdHRlZFZhbHVlLCB0aGlzLnRoZW1lLmxhYmVsKTtcbiAgICAgICAgICAgIGxlZnQgPSBib3VuZC5sZWZ0ICsgKChib3VuZC53aWR0aCAtIGxhYmVsV2lkdGggKyBjaGFydENvbnN0LlRFWFRfUEFERElORykgLyAyKTtcbiAgICAgICAgICAgIHRvcCA9IGJvdW5kLnRvcCArICgoYm91bmQuaGVpZ2h0IC0gcGFyYW1zLmxhYmVsSGVpZ2h0ICsgY2hhcnRDb25zdC5URVhUX1BBRERJTkcpIC8gMik7XG4gICAgICAgICAgICBsYWJlbEh0bWwgPSB0aGlzLm1ha2VTZXJpZXNMYWJlbEh0bWwoe1xuICAgICAgICAgICAgICAgIGxlZnQ6IGxlZnQsXG4gICAgICAgICAgICAgICAgdG9wOiB0b3BcbiAgICAgICAgICAgIH0sIGZvcm1hdHRlZFZhbHVlLCBwYXJhbXMuZ3JvdXBJbmRleCwgaW5kZXgpO1xuICAgICAgICAgICAgcmV0dXJuIGxhYmVsSHRtbDtcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zdGFja2VkID09PSAnbm9ybWFsJykge1xuICAgICAgICAgICAgaHRtbHMucHVzaCh0aGlzLm1ha2VTdW1MYWJlbEh0bWwoe1xuICAgICAgICAgICAgICAgIHZhbHVlczogdmFsdWVzLFxuICAgICAgICAgICAgICAgIGZvcm1hdEZ1bmN0aW9uczogcGFyYW1zLmZvcm1hdEZ1bmN0aW9ucyxcbiAgICAgICAgICAgICAgICBib3VuZDogYm91bmQsXG4gICAgICAgICAgICAgICAgbGFiZWxIZWlnaHQ6IHBhcmFtcy5sYWJlbEhlaWdodFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBodG1scy5qb2luKCcnKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIHN0YWNrZWQgc2VyaWVzIGxhYmVsLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtIVE1MRWxlbWVudH0gcGFyYW1zLmNvbnRhaW5lciBjb250YWluZXJcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gcGFyYW1zLmdyb3VwQm91bmRzIGdyb3VwIGJvdW5kc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48YXJyYXk+fSBwYXJhbXMuZm9ybWF0dGVkVmFsdWVzIGZvcm1hdHRlZCB2YWx1ZXNcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHNlcmllcyBsYWJlbCBhcmVhXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyU3RhY2tlZFNlcmllc0xhYmVsOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGdyb3VwQm91bmRzID0gcGFyYW1zLmdyb3VwQm91bmRzLFxuICAgICAgICAgICAgZm9ybWF0dGVkVmFsdWVzID0gcGFyYW1zLmZvcm1hdHRlZFZhbHVlcyxcbiAgICAgICAgICAgIGZvcm1hdEZ1bmN0aW9ucyA9IHBhcmFtcy5mb3JtYXRGdW5jdGlvbnMgfHwgW10sXG4gICAgICAgICAgICBlbFNlcmllc0xhYmVsQXJlYSA9IGRvbS5jcmVhdGUoJ2RpdicsICd0dWktY2hhcnQtc2VyaWVzLWxhYmVsLWFyZWEnKSxcbiAgICAgICAgICAgIGxhYmVsSGVpZ2h0ID0gcmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsSGVpZ2h0KGZvcm1hdHRlZFZhbHVlc1swXVswXSwgdGhpcy50aGVtZS5sYWJlbCksXG4gICAgICAgICAgICBodG1sO1xuXG4gICAgICAgIGh0bWwgPSB0dWkudXRpbC5tYXAocGFyYW1zLnZhbHVlcywgZnVuY3Rpb24odmFsdWVzLCBpbmRleCkge1xuICAgICAgICAgICAgdmFyIGxhYmVsc0h0bWwgPSB0aGlzLl9tYWtlU3RhY2tlZExhYmVsc0h0bWwoe1xuICAgICAgICAgICAgICAgIGdyb3VwSW5kZXg6IGluZGV4LFxuICAgICAgICAgICAgICAgIHZhbHVlczogdmFsdWVzLFxuICAgICAgICAgICAgICAgIGZvcm1hdEZ1bmN0aW9uczogZm9ybWF0RnVuY3Rpb25zLFxuICAgICAgICAgICAgICAgIGJvdW5kczogZ3JvdXBCb3VuZHNbaW5kZXhdLFxuICAgICAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlczogZm9ybWF0dGVkVmFsdWVzW2luZGV4XSxcbiAgICAgICAgICAgICAgICBsYWJlbEhlaWdodDogbGFiZWxIZWlnaHRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGxhYmVsc0h0bWw7XG4gICAgICAgIH0sIHRoaXMpLmpvaW4oJycpO1xuXG4gICAgICAgIGVsU2VyaWVzTGFiZWxBcmVhLmlubmVySFRNTCA9IGh0bWw7XG4gICAgICAgIHBhcmFtcy5jb250YWluZXIuYXBwZW5kQ2hpbGQoZWxTZXJpZXNMYWJlbEFyZWEpO1xuXG4gICAgICAgIHJldHVybiBlbFNlcmllc0xhYmVsQXJlYTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIHNlcmllcyBsYWJlbC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHBhcmFtcy5jb250YWluZXIgY29udGFpbmVyXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IHBhcmFtcy5ncm91cEJvdW5kcyBncm91cCBib3VuZHNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gcGFyYW1zLmZvcm1hdHRlZFZhbHVlcyBmb3JtYXR0ZWQgdmFsdWVzXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSBzZXJpZXMgbGFiZWwgYXJlYVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlclNlcmllc0xhYmVsOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGVsU2VyaWVzTGFiZWxBcmVhO1xuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5zaG93TGFiZWwpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zdGFja2VkKSB7XG4gICAgICAgICAgICBlbFNlcmllc0xhYmVsQXJlYSA9IHRoaXMuX3JlbmRlclN0YWNrZWRTZXJpZXNMYWJlbChwYXJhbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZWxTZXJpZXNMYWJlbEFyZWEgPSB0aGlzLl9yZW5kZXJOb3JtYWxTZXJpZXNMYWJlbChwYXJhbXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbFNlcmllc0xhYmVsQXJlYTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGJvdW5kLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBncm91cEluZGV4IGdyb3VwIGluZGV4XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IGluZGV4XG4gICAgICogQHJldHVybnMge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gYm91bmRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRCb3VuZDogZnVuY3Rpb24oZ3JvdXBJbmRleCwgaW5kZXgpIHtcbiAgICAgICAgaWYgKGdyb3VwSW5kZXggPT09IC0xIHx8IGluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZ3JvdXBCb3VuZHNbZ3JvdXBJbmRleF1baW5kZXhdLmVuZDtcbiAgICB9XG59KTtcblxuQmFyVHlwZVNlcmllc0Jhc2UubWl4aW4gPSBmdW5jdGlvbihmdW5jKSB7XG4gICAgdHVpLnV0aWwuZXh0ZW5kKGZ1bmMucHJvdG90eXBlLCBCYXJUeXBlU2VyaWVzQmFzZS5wcm90b3R5cGUpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBCYXJUeXBlU2VyaWVzQmFzZTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBDb2x1bW4gY2hhcnQgc2VyaWVzIGNvbXBvbmVudC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFNlcmllcyA9IHJlcXVpcmUoJy4vc2VyaWVzJyksXG4gICAgQmFyVHlwZVNlcmllc0Jhc2UgPSByZXF1aXJlKCcuL2JhclR5cGVTZXJpZXNCYXNlJyksXG4gICAgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4uL2NvbnN0JyksXG4gICAgcmVuZGVyVXRpbCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvcmVuZGVyVXRpbCcpO1xuXG52YXIgQ29sdW1uQ2hhcnRTZXJpZXMgPSB0dWkudXRpbC5kZWZpbmVDbGFzcyhTZXJpZXMsIC8qKiBAbGVuZHMgQ29sdW1uQ2hhcnRTZXJpZXMucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBDb2x1bW4gY2hhcnQgc2VyaWVzIGNvbXBvbmVudC5cbiAgICAgKiBAY29uc3RydWN0cyBDb2x1bW5DaGFydFNlcmllc1xuICAgICAqIEBleHRlbmRzIFNlcmllc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5tb2RlbCBzZXJpZXMgbW9kZWxcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMub3B0aW9ucyBzZXJpZXMgb3B0aW9uc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBzZXJpZXMgdGhlbWVcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgU2VyaWVzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2Ugc3RhcnQgZW5kIHRvcHMuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGVuZFRvcCBlbmQgdG9wXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGVuZEhlaWdodCBlbmQgaGVpZ2h0XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIHZhbHVlXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpc01pbnVzIHdoZXRoZXIgbWludXMgb3Igbm90XG4gICAgICogQHJldHVybnMge3tzdGFydFRvcDogbnVtYmVyLCBlbmRUb3A6IG51bWJlcn19IHN0YXJ0IGVuZCB0b3BzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVN0YXJ0RW5kVG9wczogZnVuY3Rpb24oZW5kVG9wLCBlbmRIZWlnaHQsIHZhbHVlKSB7XG4gICAgICAgIHZhciBzdGFydFRvcDtcbiAgICAgICAgaWYgKHZhbHVlIDwgMCkge1xuICAgICAgICAgICAgc3RhcnRUb3AgPSBlbmRUb3A7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdGFydFRvcCA9IGVuZFRvcDtcbiAgICAgICAgICAgIGVuZFRvcCAtPSBlbmRIZWlnaHQ7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3RhcnRUb3A6IHN0YXJ0VG9wLFxuICAgICAgICAgICAgZW5kVG9wOiBlbmRUb3BcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBib3VuZCBvZiBjb2x1bW4gY2hhcnQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHdpZHRoOiBudW1iZXJ9fSBwYXJhbXMuYmFzZUJvdW5kIGJhc2UgYm91bmRcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuc3RhcnRUb3Agc3RhcnQgdG9wXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmVuZFRvcCBlbmQgdG9wXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmVuZEhlaWdodCBlbmQgaGVpZ2h0XG4gICAgICogQHJldHVybnMge3tcbiAgICAgKiAgICAgIHN0YXJ0OiB7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9LFxuICAgICAqICAgICAgZW5kOiB7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9XG4gICAgICogfX0gY29sdW1uIGNoYXJ0IGJvdW5kXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUNvbHVtbkNoYXJ0Qm91bmQ6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3RhcnQ6IHR1aS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgdG9wOiBwYXJhbXMuc3RhcnRUb3AsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAwXG4gICAgICAgICAgICB9LCBwYXJhbXMuYmFzZUJvdW5kKSxcbiAgICAgICAgICAgIGVuZDogdHVpLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICB0b3A6IHBhcmFtcy5lbmRUb3AsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBwYXJhbXMuZW5kSGVpZ2h0XG4gICAgICAgICAgICB9LCBwYXJhbXMuYmFzZUJvdW5kKVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIG5vcm1hbCBjb2x1bW4gY2hhcnQgYm91bmQuXG4gICAgICogQHBhcmFtIHt7XG4gICAgICogICAgICBkaW1lbnNpb246IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn0sXG4gICAgICogICAgICBncm91cFZhbHVlczogYXJyYXkuPGFycmF5LjxudW1iZXI+PixcbiAgICAgKiAgICAgIGdyb3VwU2l6ZTogbnVtYmVyLCBiYXJQYWRkaW5nOiBudW1iZXIsIGJhclNpemU6IG51bWJlciwgc3RlcDogbnVtYmVyLFxuICAgICAqICAgICAgZGlzdGFuY2VUb01pbjogbnVtYmVyLCBpc01pbnVzOiBib29sZWFuXG4gICAgICogfX0gYmFzZUluZm8gYmFzZSBpbmZvXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIHZhbHVlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHBhZGRpbmdMZWZ0IHBhZGRpbmcgbGVmdFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBpbmRleFxuICAgICAqIEByZXR1cm5zIHt7XG4gICAgICogICAgICBzdGFydDoge2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfSxcbiAgICAgKiAgICAgIGVuZDoge2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfVxuICAgICAqIH19IGNvbHVtbiBjaGFydCBib3VuZFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VOb3JtYWxDb2x1bW5DaGFydEJvdW5kOiBmdW5jdGlvbihiYXNlSW5mbywgdmFsdWUsIHBhZGRpbmdMZWZ0LCBpbmRleCkge1xuICAgICAgICB2YXIgZW5kSGVpZ2h0LCBlbmRUb3AsIHN0YXJ0RW5kVG9wcywgYm91bmQ7XG5cbiAgICAgICAgZW5kSGVpZ2h0ID0gTWF0aC5hYnModmFsdWUgKiBiYXNlSW5mby5kaW1lbnNpb24uaGVpZ2h0KTtcbiAgICAgICAgZW5kVG9wID0gYmFzZUluZm8uaXNNaW51cyA/IDAgOiBiYXNlSW5mby5kaW1lbnNpb24uaGVpZ2h0IC0gYmFzZUluZm8uZGlzdGFuY2VUb01pbjtcbiAgICAgICAgc3RhcnRFbmRUb3BzID0gdGhpcy5fbWFrZVN0YXJ0RW5kVG9wcyhlbmRUb3AsIGVuZEhlaWdodCwgdmFsdWUpO1xuICAgICAgICBib3VuZCA9IHRoaXMuX21ha2VDb2x1bW5DaGFydEJvdW5kKHR1aS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICBiYXNlQm91bmQ6IHtcbiAgICAgICAgICAgICAgICBsZWZ0OiBwYWRkaW5nTGVmdCArIChiYXNlSW5mby5zdGVwICogaW5kZXgpICsgY2hhcnRDb25zdC5TRVJJRVNfRVhQQU5EX1NJWkUsXG4gICAgICAgICAgICAgICAgd2lkdGg6IGJhc2VJbmZvLmJhclNpemVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbmRIZWlnaHQ6IGVuZEhlaWdodFxuICAgICAgICB9LCBzdGFydEVuZFRvcHMpKTtcbiAgICAgICAgcmV0dXJuIGJvdW5kO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGJvdW5kcyBvZiBub3JtYWwgY29sdW1uIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDpudW1iZXJ9fSBkaW1lbnNpb24gY29sdW1uIGNoYXJ0IGRpbWVuc2lvblxuICAgICAqIEByZXR1cm5zIHthcnJheS48YXJyYXkuPG9iamVjdD4+fSBib3VuZHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlTm9ybWFsQ29sdW1uQ2hhcnRCb3VuZHM6IGZ1bmN0aW9uKGRpbWVuc2lvbikge1xuICAgICAgICB2YXIgYmFzZUluZm8gPSB0aGlzLm1ha2VCYXNlSW5mb0Zvck5vcm1hbENoYXJ0Qm91bmRzKGRpbWVuc2lvbiwgJ2hlaWdodCcsICd3aWR0aCcpLFxuICAgICAgICAgICAgYm91bmRzO1xuXG4gICAgICAgIGJvdW5kcyA9IHR1aS51dGlsLm1hcChiYXNlSW5mby5ncm91cFZhbHVlcywgZnVuY3Rpb24odmFsdWVzLCBncm91cEluZGV4KSB7XG4gICAgICAgICAgICB2YXIgcGFkZGluZ0xlZnQgPSAoYmFzZUluZm8uZ3JvdXBTaXplICogZ3JvdXBJbmRleCkgKyAoYmFzZUluZm8uYmFyU2l6ZSAvIDIpO1xuICAgICAgICAgICAgcmV0dXJuIHR1aS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fbWFrZU5vcm1hbENvbHVtbkNoYXJ0Qm91bmQoYmFzZUluZm8sIHZhbHVlLCBwYWRkaW5nTGVmdCwgaW5kZXgpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIHJldHVybiBib3VuZHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYm91bmRzIG9mIHN0YWNrZWQgY29sdW1uIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDpudW1iZXJ9fSBkaW1lbnNpb24gY29sdW1uIGNoYXJ0IGRpbWVuc2lvblxuICAgICAqIEByZXR1cm5zIHthcnJheS48YXJyYXkuPG9iamVjdD4+fSBib3VuZHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlU3RhY2tlZENvbHVtbkNoYXJ0Qm91bmRzOiBmdW5jdGlvbihkaW1lbnNpb24pIHtcbiAgICAgICAgdmFyIGdyb3VwVmFsdWVzLCBncm91cFdpZHRoLCBiYXJXaWR0aCwgYm91bmRzO1xuXG4gICAgICAgIGdyb3VwVmFsdWVzID0gdGhpcy5wZXJjZW50VmFsdWVzO1xuICAgICAgICBncm91cFdpZHRoID0gKGRpbWVuc2lvbi53aWR0aCAvIGdyb3VwVmFsdWVzLmxlbmd0aCk7XG4gICAgICAgIGJhcldpZHRoID0gZ3JvdXBXaWR0aCAvIDI7XG4gICAgICAgIGJvdW5kcyA9IHR1aS51dGlsLm1hcChncm91cFZhbHVlcywgZnVuY3Rpb24odmFsdWVzLCBncm91cEluZGV4KSB7XG4gICAgICAgICAgICB2YXIgcGFkZGluZ0xlZnQgPSAoZ3JvdXBXaWR0aCAqIGdyb3VwSW5kZXgpICsgKGJhcldpZHRoIC8gMikgKyBjaGFydENvbnN0LlNFUklFU19FWFBBTkRfU0laRSxcbiAgICAgICAgICAgICAgICB0b3AgPSAwO1xuICAgICAgICAgICAgcmV0dXJuIHR1aS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHZhciBlbmRIZWlnaHQsIGJhc2VCb3VuZCwgYm91bmQ7XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBlbmRIZWlnaHQgPSB2YWx1ZSAqIGRpbWVuc2lvbi5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgYmFzZUJvdW5kID0ge1xuICAgICAgICAgICAgICAgICAgICBsZWZ0OiBwYWRkaW5nTGVmdCxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGJhcldpZHRoXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBib3VuZCA9IHRoaXMuX21ha2VDb2x1bW5DaGFydEJvdW5kKHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZUJvdW5kOiBiYXNlQm91bmQsXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0VG9wOiBkaW1lbnNpb24uaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICBlbmRUb3A6IGRpbWVuc2lvbi5oZWlnaHQgLSBlbmRIZWlnaHQgLSB0b3AsXG4gICAgICAgICAgICAgICAgICAgIGVuZEhlaWdodDogZW5kSGVpZ2h0XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB0b3AgKz0gZW5kSGVpZ2h0O1xuICAgICAgICAgICAgICAgIHJldHVybiBib3VuZDtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIGJvdW5kcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBib3VuZHMgb2YgY29sdW1uIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDpudW1iZXJ9fSBkaW1lbnNpb24gY29sdW1uIGNoYXJ0IGRpbWVuc2lvblxuICAgICAqIEByZXR1cm5zIHthcnJheS48YXJyYXkuPG9iamVjdD4+fSBib3VuZHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQm91bmRzOiBmdW5jdGlvbihkaW1lbnNpb24pIHtcbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuc3RhY2tlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21ha2VOb3JtYWxDb2x1bW5DaGFydEJvdW5kcyhkaW1lbnNpb24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21ha2VTdGFja2VkQ29sdW1uQ2hhcnRCb3VuZHMoZGltZW5zaW9uKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHNlcmllcyByZW5kZXJpbmcgcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge29iZWplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnZhbHVlIHZhbHVlXG4gICAgICogICAgICBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyLCB3aWR0aDpudW1iZXIsIHdpZHRoOm51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBwYXJhbXMuYm91bmQgYm91bmRcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMuZm9ybWF0dGVkVmFsdWUgZm9ybWF0dGVkIHZhbHVlXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmxhYmVsSGVpZ2h0IGxhYmVsIGhlaWdodFxuICAgICAqIEByZXR1cm5zIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IHJlbmRlcmluZyBwb3NpdGlvblxuICAgICAqL1xuICAgIG1ha2VTZXJpZXNSZW5kZXJpbmdQb3NpdGlvbjogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBsYWJlbFdpZHRoID0gcmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsV2lkdGgocGFyYW1zLmZvcm1hdHRlZFZhbHVlLCB0aGlzLnRoZW1lLmxhYmVsKSxcbiAgICAgICAgICAgIGJvdW5kID0gcGFyYW1zLmJvdW5kLFxuICAgICAgICAgICAgdG9wID0gYm91bmQudG9wLFxuICAgICAgICAgICAgbGVmdCA9IGJvdW5kLmxlZnQgKyAoYm91bmQud2lkdGggLSBsYWJlbFdpZHRoKSAvIDI7XG5cbiAgICAgICAgaWYgKHBhcmFtcy52YWx1ZSA+PSAwKSB7XG4gICAgICAgICAgICB0b3AgLT0gcGFyYW1zLmxhYmVsSGVpZ2h0ICsgY2hhcnRDb25zdC5TRVJJRVNfTEFCRUxfUEFERElORztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRvcCArPSBib3VuZC5oZWlnaHQgKyBjaGFydENvbnN0LlNFUklFU19MQUJFTF9QQURESU5HO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxlZnQ6IGxlZnQsXG4gICAgICAgICAgICB0b3A6IHRvcFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHN1bSBsYWJlbCBodG1sLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48bnVtYmVyPn0gcGFyYW1zLnZhbHVlcyB2YWx1ZXNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPGZ1bmN0aW9uPn0gcGFyYW1zLmZvcm1hdEZ1bmN0aW9ucyBmb3JtYXR0aW5nIGZ1bmN0aW9uc1xuICAgICAqICAgICAgQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IHBhcmFtcy5ib3VuZCBib3VuZFxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5sYWJlbEhlaWdodCBsYWJlbCBoZWlnaHRcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBzdW0gbGFiZWwgaHRtbFxuICAgICAqL1xuICAgIG1ha2VTdW1MYWJlbEh0bWw6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgc3VtID0gdGhpcy5tYWtlU3VtVmFsdWVzKHBhcmFtcy52YWx1ZXMsIHBhcmFtcy5mb3JtYXRGdW5jdGlvbnMpLFxuICAgICAgICAgICAgYm91bmQgPSBwYXJhbXMuYm91bmQsXG4gICAgICAgICAgICBsYWJlbFdpZHRoID0gcmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsV2lkdGgoc3VtLCB0aGlzLnRoZW1lLmxhYmVsKSxcbiAgICAgICAgICAgIGxlZnQgPSBib3VuZC5sZWZ0ICsgKChib3VuZC53aWR0aCAtIGxhYmVsV2lkdGggKyBjaGFydENvbnN0LlRFWFRfUEFERElORykgLyAyKSxcbiAgICAgICAgICAgIHRvcCA9IGJvdW5kLnRvcCAtIHBhcmFtcy5sYWJlbEhlaWdodCAtIGNoYXJ0Q29uc3QuU0VSSUVTX0xBQkVMX1BBRERJTkc7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMubWFrZVNlcmllc0xhYmVsSHRtbCh7XG4gICAgICAgICAgICBsZWZ0OiBsZWZ0LFxuICAgICAgICAgICAgdG9wOiB0b3BcbiAgICAgICAgfSwgc3VtLCAtMSwgLTEpO1xuICAgIH1cbn0pO1xuXG5CYXJUeXBlU2VyaWVzQmFzZS5taXhpbihDb2x1bW5DaGFydFNlcmllcyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29sdW1uQ2hhcnRTZXJpZXM7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgTGluZSBjaGFydCBzZXJpZXMgY29tcG9uZW50LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU2VyaWVzID0gcmVxdWlyZSgnLi9zZXJpZXMnKSxcbiAgICBMaW5lVHlwZVNlcmllc0Jhc2UgPSByZXF1aXJlKCcuL2xpbmVUeXBlU2VyaWVzQmFzZScpO1xuXG52YXIgTGluZUNoYXJ0U2VyaWVzID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoU2VyaWVzLCAvKiogQGxlbmRzIExpbmVDaGFydFNlcmllcy5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIExpbmUgY2hhcnQgc2VyaWVzIGNvbXBvbmVudC5cbiAgICAgKiBAY29uc3RydWN0cyBMaW5lQ2hhcnRTZXJpZXNcbiAgICAgKiBAZXh0ZW5kcyBTZXJpZXNcbiAgICAgKiBAbWl4ZXMgTGluZVR5cGVTZXJpZXNCYXNlXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm1vZGVsIHNlcmllcyBtb2RlbFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5vcHRpb25zIHNlcmllcyBvcHRpb25zXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIHNlcmllcyB0aGVtZVxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBTZXJpZXMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBzZXJpZXMgZGF0YS5cbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBhZGQgZGF0YVxuICAgICAqL1xuICAgIG1ha2VTZXJpZXNEYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGdyb3VwUG9zaXRpb25zOiB0aGlzLm1ha2VQb3NpdGlvbnModGhpcy5ib3VuZC5kaW1lbnNpb24pXG4gICAgICAgIH07XG4gICAgfVxufSk7XG5cbkxpbmVUeXBlU2VyaWVzQmFzZS5taXhpbihMaW5lQ2hhcnRTZXJpZXMpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IExpbmVDaGFydFNlcmllcztcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBMaW5lVHlwZVNlcmllc0Jhc2UgaXMgYmFzZSBjbGFzcyBmb3IgbGluZSB0eXBlIHNlcmllcy5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuLi9jb25zdCcpLFxuICAgIGRvbSA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZG9tSGFuZGxlcicpLFxuICAgIHJlbmRlclV0aWwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3JlbmRlclV0aWwnKTtcbi8qKlxuICogQGNsYXNzZGVzYyBMaW5lVHlwZVNlcmllc0Jhc2UgaXMgYmFzZSBjbGFzcyBmb3IgbGluZSB0eXBlIHNlcmllcy5cbiAqIEBjbGFzcyBMaW5lVHlwZVNlcmllc0Jhc2VcbiAqIEBtaXhpblxuICovXG52YXIgTGluZVR5cGVTZXJpZXNCYXNlID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBMaW5lVHlwZVNlcmllc0Jhc2UucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHBvc2l0aW9ucyBvZiBsaW5lIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDpudW5iZXJ9fSBkaW1lbnNpb24gbGluZSBjaGFydCBkaW1lbnNpb25cbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gcG9zaXRpb25zXG4gICAgICovXG4gICAgbWFrZVBvc2l0aW9uczogZnVuY3Rpb24oZGltZW5zaW9uKSB7XG4gICAgICAgIHZhciBncm91cFZhbHVlcyA9IHRoaXMucGVyY2VudFZhbHVlcyxcbiAgICAgICAgICAgIHdpZHRoID0gZGltZW5zaW9uLndpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0ID0gZGltZW5zaW9uLmhlaWdodCxcbiAgICAgICAgICAgIGxlbiA9IGdyb3VwVmFsdWVzWzBdLmxlbmd0aCxcbiAgICAgICAgICAgIHN0ZXAsIHN0YXJ0LCByZXN1bHQ7XG4gICAgICAgIGlmICh0aGlzLmFsaWduZWQpIHtcbiAgICAgICAgICAgIHN0ZXAgPSB3aWR0aCAvIChsZW4gLSAxKTtcbiAgICAgICAgICAgIHN0YXJ0ID0gMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0ZXAgPSB3aWR0aCAvIGxlbjtcbiAgICAgICAgICAgIHN0YXJ0ID0gc3RlcCAvIDI7XG4gICAgICAgIH1cblxuICAgICAgICByZXN1bHQgPSB0dWkudXRpbC5tYXAoZ3JvdXBWYWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICAgICAgcmV0dXJuIHR1aS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IHN0YXJ0ICsgKHN0ZXAgKiBpbmRleCkgKyBjaGFydENvbnN0LlNFUklFU19FWFBBTkRfU0laRSxcbiAgICAgICAgICAgICAgICAgICAgdG9wOiBoZWlnaHQgLSAodmFsdWUgKiBoZWlnaHQpXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5ncm91cFBvc2l0aW9ucyA9IHJlc3VsdDtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIHNlcmllcyBsYWJlbC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHBhcmFtcy5jb250YWluZXIgY29udGFpbmVyXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IHBhcmFtcy5ncm91cFBvc2l0aW9ucyBncm91cCBwb3NpdGlvbnNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gcGFyYW1zLmZvcm1hdHRlZFZhbHVlcyBmb3JtYXR0ZWQgdmFsdWVzXG4gICAgICogQHJldHVybiB7SFRNTEVsZW1lbnR9IHNlcmllcyBhcmVhIGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJTZXJpZXNMYWJlbDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBncm91cFBvc2l0aW9ucywgbGFiZWxIZWlnaHQsIGVsU2VyaWVzTGFiZWxBcmVhLCBodG1sO1xuXG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLnNob3dMYWJlbCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZ3JvdXBQb3NpdGlvbnMgPSBwYXJhbXMuZ3JvdXBQb3NpdGlvbnM7XG4gICAgICAgIGxhYmVsSGVpZ2h0ID0gcmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsSGVpZ2h0KHBhcmFtcy5mb3JtYXR0ZWRWYWx1ZXNbMF1bMF0sIHRoaXMudGhlbWUubGFiZWwpO1xuICAgICAgICBlbFNlcmllc0xhYmVsQXJlYSA9IGRvbS5jcmVhdGUoJ2RpdicsICd0dWktY2hhcnQtc2VyaWVzLWxhYmVsLWFyZWEnKTtcblxuICAgICAgICBodG1sID0gdHVpLnV0aWwubWFwKHBhcmFtcy5mb3JtYXR0ZWRWYWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcywgZ3JvdXBJbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuIHR1aS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciBwb3NpdGlvbiA9IGdyb3VwUG9zaXRpb25zW2dyb3VwSW5kZXhdW2luZGV4XSxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxXaWR0aCA9IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbFdpZHRoKHZhbHVlLCB0aGlzLnRoZW1lLmxhYmVsKSxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxIdG1sID0gdGhpcy5tYWtlU2VyaWVzTGFiZWxIdG1sKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6IHBvc2l0aW9uLmxlZnQgLSAobGFiZWxXaWR0aCAvIDIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiBwb3NpdGlvbi50b3AgLSBsYWJlbEhlaWdodCAtIGNoYXJ0Q29uc3QuU0VSSUVTX0xBQkVMX1BBRERJTkdcbiAgICAgICAgICAgICAgICAgICAgfSwgdmFsdWUsIGluZGV4LCBncm91cEluZGV4KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGFiZWxIdG1sO1xuICAgICAgICAgICAgfSwgdGhpcykuam9pbignJyk7XG4gICAgICAgIH0sIHRoaXMpLmpvaW4oJycpO1xuXG4gICAgICAgIGVsU2VyaWVzTGFiZWxBcmVhLmlubmVySFRNTCA9IGh0bWw7XG4gICAgICAgIHBhcmFtcy5jb250YWluZXIuYXBwZW5kQ2hpbGQoZWxTZXJpZXNMYWJlbEFyZWEpO1xuXG4gICAgICAgIHJldHVybiBlbFNlcmllc0xhYmVsQXJlYTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGJvdW5kLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBncm91cEluZGV4IGdyb3VwIGluZGV4XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IGluZGV4XG4gICAgICogQHJldHVybnMge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gYm91bmRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRCb3VuZDogZnVuY3Rpb24oZ3JvdXBJbmRleCwgaW5kZXgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ3JvdXBQb3NpdGlvbnNbaW5kZXhdW2dyb3VwSW5kZXhdO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGaW5kIGluZGV4LlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBncm91cEluZGV4IGdyb3VwIGluZGV4XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGxheWVyWSBtb3VzZSBwb3NpdGlvblxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IGluZGV4XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZmluZEluZGV4OiBmdW5jdGlvbihncm91cEluZGV4LCBsYXllclkpIHtcbiAgICAgICAgdmFyIGZvdW5kSW5kZXggPSAtMSxcbiAgICAgICAgICAgIGRpZmYgPSAxMDAwO1xuXG4gICAgICAgIGlmICghdGhpcy50aWNrSXRlbXMpIHtcbiAgICAgICAgICAgIHRoaXMudGlja0l0ZW1zID0gdHVpLnV0aWwucGl2b3QodGhpcy5ncm91cFBvc2l0aW9ucyk7XG4gICAgICAgIH1cblxuICAgICAgICB0dWkudXRpbC5mb3JFYWNoKHRoaXMudGlja0l0ZW1zW2dyb3VwSW5kZXhdLCBmdW5jdGlvbihwb3NpdGlvbiwgaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBjb21wYXJlID0gTWF0aC5hYnMobGF5ZXJZIC0gcG9zaXRpb24udG9wKTtcbiAgICAgICAgICAgIGlmIChkaWZmID4gY29tcGFyZSkge1xuICAgICAgICAgICAgICAgIGRpZmYgPSBjb21wYXJlO1xuICAgICAgICAgICAgICAgIGZvdW5kSW5kZXggPSBpbmRleDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBmb3VuZEluZGV4O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIGNoYW5nZWQgb3Igbm90LlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBncm91cEluZGV4IGdyb3VwIGluZGV4XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IGluZGV4XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHdoZXRoZXIgY2hhbmdlZCBvciBub3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc0NoYW5nZWQ6IGZ1bmN0aW9uKGdyb3VwSW5kZXgsIGluZGV4KSB7XG4gICAgICAgIHZhciBwcmV2SW5kZXhlcyA9IHRoaXMucHJldkluZGV4ZXM7XG5cbiAgICAgICAgdGhpcy5wcmV2SW5kZXhlcyA9IHtcbiAgICAgICAgICAgIGdyb3VwSW5kZXg6IGdyb3VwSW5kZXgsXG4gICAgICAgICAgICBpbmRleDogaW5kZXhcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gIXByZXZJbmRleGVzIHx8IChwcmV2SW5kZXhlcy5ncm91cEluZGV4ICE9PSBncm91cEluZGV4KSB8fCAocHJldkluZGV4ZXMuaW5kZXggIT09IGluZGV4KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogT24gb3ZlciB0aWNrIHNlY3Rvci5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZ3JvdXBJbmRleCBncm91cEluZGV4XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGxheWVyWSBsYXllcllcbiAgICAgKi9cbiAgICBvbkxpbmVUeXBlT3ZlclRpY2tTZWN0b3I6IGZ1bmN0aW9uKGdyb3VwSW5kZXgsIGxheWVyWSkge1xuICAgICAgICB2YXIgaW5kZXgsIHByZXZJbmRleGVzO1xuXG4gICAgICAgIGluZGV4ID0gdGhpcy5fZmluZEluZGV4KGdyb3VwSW5kZXgsIGxheWVyWSk7XG4gICAgICAgIHByZXZJbmRleGVzID0gdGhpcy5wcmV2SW5kZXhlcztcblxuICAgICAgICBpZiAoIXRoaXMuX2lzQ2hhbmdlZChncm91cEluZGV4LCBpbmRleCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcmV2SW5kZXhlcykge1xuICAgICAgICAgICAgdGhpcy5vdXRDYWxsYmFjaygpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5pbkNhbGxiYWNrKHRoaXMuX2dldEJvdW5kKGdyb3VwSW5kZXgsIGluZGV4KSwgZ3JvdXBJbmRleCwgaW5kZXgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBPbiBvdXQgdGljayBzZWN0b3IuXG4gICAgICovXG4gICAgb25MaW5lVHlwZU91dFRpY2tTZWN0b3I6IGZ1bmN0aW9uKCkge1xuICAgICAgICBkZWxldGUgdGhpcy5wcmV2SW5kZXhlcztcbiAgICAgICAgdGhpcy5vdXRDYWxsYmFjaygpO1xuICAgIH1cbn0pO1xuXG5MaW5lVHlwZVNlcmllc0Jhc2UubWl4aW4gPSBmdW5jdGlvbihmdW5jKSB7XG4gICAgdHVpLnV0aWwuZXh0ZW5kKGZ1bmMucHJvdG90eXBlLCBMaW5lVHlwZVNlcmllc0Jhc2UucHJvdG90eXBlKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTGluZVR5cGVTZXJpZXNCYXNlO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFBpZSBjaGFydCBzZXJpZXMgY29tcG9uZW50LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU2VyaWVzID0gcmVxdWlyZSgnLi9zZXJpZXMnKSxcbiAgICBjaGFydENvbnN0ID0gcmVxdWlyZSgnLi4vY29uc3QnKSxcbiAgICBkb20gPSByZXF1aXJlKCcuLi9oZWxwZXJzL2RvbUhhbmRsZXInKSxcbiAgICByZW5kZXJVdGlsID0gcmVxdWlyZSgnLi4vaGVscGVycy9yZW5kZXJVdGlsJyk7XG5cbnZhciBQaWVDaGFydFNlcmllcyA9IHR1aS51dGlsLmRlZmluZUNsYXNzKFNlcmllcywgLyoqIEBsZW5kcyBQaWVDaGFydFNlcmllcy5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIExpbmUgY2hhcnQgc2VyaWVzIGNvbXBvbmVudC5cbiAgICAgKiBAY29uc3RydWN0cyBQaWVDaGFydFNlcmllc1xuICAgICAqIEBleHRlbmRzIFNlcmllc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5tb2RlbCBzZXJpZXMgbW9kZWxcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMub3B0aW9ucyBzZXJpZXMgb3B0aW9uc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBzZXJpZXMgdGhlbWVcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgU2VyaWVzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgcGVyY2VudCB2YWx1ZS5cbiAgICAgKiBAcGFyYW0ge3t2YWx1ZXM6IGFycmF5LCBzY2FsZToge21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19fSBkYXRhIHNlcmllcyBkYXRhXG4gICAgICogQHJldHVybnMge2FycmF5LjxhcnJheS48bnVtYmVyPj59IHBlcmNlbnQgdmFsdWVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVBlcmNlbnRWYWx1ZXM6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHR1aS51dGlsLm1hcChkYXRhLnZhbHVlcywgZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgICAgICB2YXIgc3VtID0gdHVpLnV0aWwuc3VtKHZhbHVlcyk7XG4gICAgICAgICAgICByZXR1cm4gdHVpLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgLyBzdW07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2Ugc2VjdG9ycyBpbmZvcm1hdGlvbi5cbiAgICAgKiBAcGFyYW0ge2FycmF5LjxudW1iZXI+fSBwZXJjZW50VmFsdWVzIHBlcmNlbnQgdmFsdWVzXG4gICAgICogQHBhcmFtIHt7Y3g6IG51bWJlciwgY3k6IG51bWJlciwgcjogbnVtYmVyfX0gY2lyY2xlQm91bmQgY2lyY2xlIGJvdW5kXG4gICAgICogQHJldHVybnMge2FycmF5LjxvYmplY3Q+fSBzZWN0b3JzIGluZm9ybWF0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVNlY3RvcnNJbmZvOiBmdW5jdGlvbihwZXJjZW50VmFsdWVzLCBjaXJjbGVCb3VuZCkge1xuICAgICAgICB2YXIgY3ggPSBjaXJjbGVCb3VuZC5jeCxcbiAgICAgICAgICAgIGN5ID0gY2lyY2xlQm91bmQuY3ksXG4gICAgICAgICAgICByID0gY2lyY2xlQm91bmQucixcbiAgICAgICAgICAgIGFuZ2xlID0gMCxcbiAgICAgICAgICAgIGRlbHRhID0gMTAsXG4gICAgICAgICAgICBwYXRocztcblxuICAgICAgICBwYXRocyA9IHR1aS51dGlsLm1hcChwZXJjZW50VmFsdWVzLCBmdW5jdGlvbihwZXJjZW50VmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBhZGRBbmdsZSA9IGNoYXJ0Q29uc3QuQU5HTEVfMzYwICogcGVyY2VudFZhbHVlLFxuICAgICAgICAgICAgICAgIGVuZEFuZ2xlID0gYW5nbGUgKyBhZGRBbmdsZSxcbiAgICAgICAgICAgICAgICBwb3B1cEFuZ2xlID0gYW5nbGUgKyAoYWRkQW5nbGUgLyAyKSxcbiAgICAgICAgICAgICAgICBhbmdsZXMgPSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydEFuZ2xlOiBhbmdsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZEFuZ2xlOiBhbmdsZVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBlbmQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0QW5nbGU6IGFuZ2xlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kQW5nbGU6IGVuZEFuZ2xlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uRGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgY3g6IGN4LFxuICAgICAgICAgICAgICAgICAgICBjeTogY3ksXG4gICAgICAgICAgICAgICAgICAgIGFuZ2xlOiBwb3B1cEFuZ2xlXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGFuZ2xlID0gZW5kQW5nbGU7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHBlcmNlbnRWYWx1ZTogcGVyY2VudFZhbHVlLFxuICAgICAgICAgICAgICAgIGFuZ2xlczogYW5nbGVzLFxuICAgICAgICAgICAgICAgIHBvcHVwUG9zaXRpb246IHRoaXMuX2dldEFyY1Bvc2l0aW9uKHR1aS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgICAgIHI6IHIgKyBkZWx0YVxuICAgICAgICAgICAgICAgIH0sIHBvc2l0aW9uRGF0YSkpLFxuICAgICAgICAgICAgICAgIGNlbnRlclBvc2l0aW9uOiB0aGlzLl9nZXRBcmNQb3NpdGlvbih0dWkudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgICAgICAgICByOiAociAvIDIpICsgZGVsdGFcbiAgICAgICAgICAgICAgICB9LCBwb3NpdGlvbkRhdGEpKSxcbiAgICAgICAgICAgICAgICBvdXRlclBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiB0aGlzLl9nZXRBcmNQb3NpdGlvbih0dWkudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgcjogclxuICAgICAgICAgICAgICAgICAgICB9LCBwb3NpdGlvbkRhdGEpKSxcbiAgICAgICAgICAgICAgICAgICAgbWlkZGxlOiB0aGlzLl9nZXRBcmNQb3NpdGlvbih0dWkudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgcjogciArIGRlbHRhXG4gICAgICAgICAgICAgICAgICAgIH0sIHBvc2l0aW9uRGF0YSkpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgcmV0dXJuIHBhdGhzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHNlcmllcyBkYXRhLlxuICAgICAqIEByZXR1cm5zIHt7XG4gICAgICogICAgICBmb3JtYXR0ZWRWYWx1ZXM6IGFycmF5LFxuICAgICAqICAgICAgY2hhcnRCYWNrZ3JvdW5kOiBzdHJpbmcsXG4gICAgICogICAgICBjaXJjbGVCb3VuZDogKHtjeDogbnVtYmVyLCBjeTogbnVtYmVyLCByOiBudW1iZXJ9KSxcbiAgICAgKiAgICAgIHNlY3RvcnNJbmZvOiBhcnJheS48b2JqZWN0PlxuICAgICAqIH19IGFkZCBkYXRhIGZvciBncmFwaCByZW5kZXJpbmdcbiAgICAgKi9cbiAgICBtYWtlU2VyaWVzRGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjaXJjbGVCb3VuZCA9IHRoaXMuX21ha2VDaXJjbGVCb3VuZCh0aGlzLmJvdW5kLmRpbWVuc2lvbiwge1xuICAgICAgICAgICAgICAgIHNob3dMYWJlbDogdGhpcy5vcHRpb25zLnNob3dMYWJlbCxcbiAgICAgICAgICAgICAgICBsZWdlbmRUeXBlOiB0aGlzLm9wdGlvbnMubGVnZW5kVHlwZVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBzZWN0b3JzSW5mbyA9IHRoaXMuX21ha2VTZWN0b3JzSW5mbyh0aGlzLnBlcmNlbnRWYWx1ZXNbMF0sIGNpcmNsZUJvdW5kKTtcblxuICAgICAgICB0aGlzLnBvcHVwUG9zaXRpb25zID0gdHVpLnV0aWwucGx1Y2soc2VjdG9yc0luZm8sICdwb3B1cFBvc2l0aW9uJyk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjaGFydEJhY2tncm91bmQ6IHRoaXMuY2hhcnRCYWNrZ3JvdW5kLFxuICAgICAgICAgICAgY2lyY2xlQm91bmQ6IGNpcmNsZUJvdW5kLFxuICAgICAgICAgICAgc2VjdG9yc0luZm86IHNlY3RvcnNJbmZvXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgY2lyY2xlIGJvdW5kXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0Om51bWJlcn19IGRpbWVuc2lvbiBjaGFydCBkaW1lbnNpb25cbiAgICAgKiBAcGFyYW0ge3tzaG93TGFiZWw6IGJvb2xlYW4sIGxlZ2VuZFR5cGU6IHN0cmluZ319IG9wdGlvbnMgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHt7Y3g6IG51bWJlciwgY3k6IG51bWJlciwgcjogbnVtYmVyfX0gY2lyY2xlIGJvdW5kc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VDaXJjbGVCb3VuZDogZnVuY3Rpb24oZGltZW5zaW9uLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciB3aWR0aCA9IGRpbWVuc2lvbi53aWR0aCxcbiAgICAgICAgICAgIGhlaWdodCA9IGRpbWVuc2lvbi5oZWlnaHQsXG4gICAgICAgICAgICBpc1NtYWxsUGllID0gb3B0aW9ucy5sZWdlbmRUeXBlID09PSBjaGFydENvbnN0LlNFUklFU19MRUdFTkRfVFlQRV9PVVRFUiAmJiBvcHRpb25zLnNob3dMYWJlbCxcbiAgICAgICAgICAgIHJhZGl1c1JhdGUgPSBpc1NtYWxsUGllID8gY2hhcnRDb25zdC5QSUVfR1JBUEhfU01BTExfUkFURSA6IGNoYXJ0Q29uc3QuUElFX0dSQVBIX0RFRkFVTFRfUkFURSxcbiAgICAgICAgICAgIGRpYW1ldGVyID0gdHVpLnV0aWwubXVsdGlwbGljYXRpb24odHVpLnV0aWwubWluKFt3aWR0aCwgaGVpZ2h0XSksIHJhZGl1c1JhdGUpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY3g6IHR1aS51dGlsLmRpdmlzaW9uKHdpZHRoLCAyKSxcbiAgICAgICAgICAgIGN5OiB0dWkudXRpbC5kaXZpc2lvbihoZWlnaHQsIDIpLFxuICAgICAgICAgICAgcjogdHVpLnV0aWwuZGl2aXNpb24oZGlhbWV0ZXIsIDIpXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBhcmMgcG9zaXRpb24uXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmN4IGNlbnRlciB4XG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmN5IGNlbnRlciB5XG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnIgcmFkaXVzXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmFuZ2xlIGFuZ2xlKGRlZ3JlZSlcbiAgICAgKiBAcmV0dXJucyB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBhcmMgcG9zaXRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRBcmNQb3NpdGlvbjogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsZWZ0OiBwYXJhbXMuY3ggKyAocGFyYW1zLnIgKiBNYXRoLnNpbihwYXJhbXMuYW5nbGUgKiBjaGFydENvbnN0LlJBRCkpLFxuICAgICAgICAgICAgdG9wOiBwYXJhbXMuY3kgLSAocGFyYW1zLnIgKiBNYXRoLmNvcyhwYXJhbXMuYW5nbGUgKiBjaGFydENvbnN0LlJBRCkpXG4gICAgICAgIH07XG4gICAgfSxcblxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBhZGQgZGF0YSBmb3Igc2VyaWVzIGxhYmVsLlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciBjb250YWluZXJcbiAgICAgKiBAcmV0dXJucyB7e1xuICAgICAqICAgICAgY29udGFpbmVyOiBIVE1MRWxlbWVudCxcbiAgICAgKiAgICAgIGxlZ2VuZExhYmVsczogYXJyYXkuPHN0cmluZz4sXG4gICAgICogICAgICBvcHRpb25zOiB7bGVnZW5kVHlwZTogc3RyaW5nLCBzaG93TGFiZWw6IGJvb2xlYW59LFxuICAgICAqICAgICAgY2hhcnRXaWR0aDogbnVtYmVyLFxuICAgICAqICAgICAgZm9ybWF0dGVkVmFsdWVzOiBhcnJheVxuICAgICAqIH19IGFkZCBkYXRhIGZvciBtYWtlIHNlcmllcyBsYWJlbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VTZXJpZXNEYXRhRm9yU2VyaWVzTGFiZWw6IGZ1bmN0aW9uKGNvbnRhaW5lcikge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY29udGFpbmVyOiBjb250YWluZXIsXG4gICAgICAgICAgICBsZWdlbmRMYWJlbHM6IHRoaXMuZGF0YS5sZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgbGVnZW5kVHlwZTogdGhpcy5vcHRpb25zLmxlZ2VuZFR5cGUsXG4gICAgICAgICAgICAgICAgc2hvd0xhYmVsOiB0aGlzLm9wdGlvbnMuc2hvd0xhYmVsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2hhcnRXaWR0aDogdGhpcy5kYXRhLmNoYXJ0V2lkdGgsXG4gICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXM6IHRoaXMuZGF0YS5mb3JtYXR0ZWRWYWx1ZXNbMF1cbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHNlcmllcyBsYWJlbC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMubGVnZW5kIGxlZ2VuZFxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5sYWJlbCBsYWJlbFxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5zZXBhcmF0b3Igc2VwYXJhdG9yXG4gICAgICogICAgICBAcGFyYW0ge3tsZWdlbmRUeXBlOiBib29sZWFuLCBzaG93TGFiZWw6IGJvb2xlYW59fSBwYXJhbXMub3B0aW9ucyBvcHRpb25zXG4gICAgICogQHJldHVybnMge3N0cmluZ30gc2VyaWVzIGxhYmVsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0U2VyaWVzTGFiZWw6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgc2VyaWVzTGFiZWwgPSAnJztcbiAgICAgICAgaWYgKHBhcmFtcy5vcHRpb25zLmxlZ2VuZFR5cGUpIHtcbiAgICAgICAgICAgIHNlcmllc0xhYmVsID0gcGFyYW1zLmxlZ2VuZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYXJhbXMub3B0aW9ucy5zaG93TGFiZWwpIHtcbiAgICAgICAgICAgIHNlcmllc0xhYmVsICs9IChzZXJpZXNMYWJlbCA/IHBhcmFtcy5zZXBhcmF0b3IgOiAnJykgKyBwYXJhbXMubGFiZWw7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc2VyaWVzTGFiZWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBjZW50ZXIgbGVnZW5kLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNvbnRhaW5lclxuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48c3RyaW5nPn0gbGVnZW5kcyBsZWdlbmRzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxvYmplY3Q+fSBjZW50ZXJQb3NpdGlvbnMgY2VudGVyIHBvc2l0aW9uc1xuICAgICAqIEByZXR1cm4ge0hUTUxFbGVtZW50fSBzZXJpZXMgYXJlYSBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyTGVnZW5kTGFiZWw6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgcG9zaXRpb25zID0gcGFyYW1zLnBvc2l0aW9ucyxcbiAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlcyA9IHBhcmFtcy5mb3JtYXR0ZWRWYWx1ZXMsXG4gICAgICAgICAgICBlbFNlcmllc0xhYmVsQXJlYSA9IGRvbS5jcmVhdGUoJ2RpdicsICd0dWktY2hhcnQtc2VyaWVzLWxhYmVsLWFyZWEnKSxcbiAgICAgICAgICAgIGh0bWw7XG5cbiAgICAgICAgaHRtbCA9IHR1aS51dGlsLm1hcChwYXJhbXMubGVnZW5kTGFiZWxzLCBmdW5jdGlvbihsZWdlbmQsIGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgbGFiZWwgPSB0aGlzLl9nZXRTZXJpZXNMYWJlbCh7XG4gICAgICAgICAgICAgICAgICAgIGxlZ2VuZDogbGVnZW5kLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogZm9ybWF0dGVkVmFsdWVzW2luZGV4XSxcbiAgICAgICAgICAgICAgICAgICAgc2VwYXJhdG9yOiBwYXJhbXMuc2VwYXJhdG9yLFxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBwYXJhbXMub3B0aW9uc1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uID0gcGFyYW1zLm1vdmVUb1Bvc2l0aW9uKHBvc2l0aW9uc1tpbmRleF0sIGxhYmVsKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1ha2VTZXJpZXNMYWJlbEh0bWwocG9zaXRpb24sIGxhYmVsLCAwLCBpbmRleCk7XG4gICAgICAgIH0sIHRoaXMpLmpvaW4oJycpO1xuXG4gICAgICAgIGVsU2VyaWVzTGFiZWxBcmVhLmlubmVySFRNTCA9IGh0bWw7XG4gICAgICAgIHBhcmFtcy5jb250YWluZXIuYXBwZW5kQ2hpbGQoZWxTZXJpZXNMYWJlbEFyZWEpO1xuXG4gICAgICAgIHJldHVybiBlbFNlcmllc0xhYmVsQXJlYTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTW92ZSB0byBjZW50ZXIgcG9zaXRpb24uXG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IHBvc2l0aW9uIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGxhYmVsIGxhYmVsXG4gICAgICogQHJldHVybnMge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gY2VudGVyIHBvc2l0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbW92ZVRvQ2VudGVyUG9zaXRpb246IGZ1bmN0aW9uKHBvc2l0aW9uLCBsYWJlbCkge1xuICAgICAgICB2YXIgbGVmdCA9IHBvc2l0aW9uLmxlZnQgLSAocmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsV2lkdGgobGFiZWwsIHRoaXMudGhlbWUubGFiZWwpIC8gMiksXG4gICAgICAgICAgICB0b3AgPSBwb3NpdGlvbi50b3AgLSAocmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsSGVpZ2h0KGxhYmVsLCB0aGlzLnRoZW1lLmxhYmVsKSAvIDIpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbGVmdDogbGVmdCxcbiAgICAgICAgICAgIHRvcDogdG9wXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBjZW50ZXIgbGVnZW5kLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNvbnRhaW5lclxuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48c3RyaW5nPn0gbGVnZW5kcyBsZWdlbmRzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxvYmplY3Q+fSBjZW50ZXJQb3NpdGlvbnMgY2VudGVyIHBvc2l0aW9uc1xuICAgICAqIEByZXR1cm4ge0hUTUxFbGVtZW50fSBhcmVhIGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJDZW50ZXJMZWdlbmQ6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgZWxBcmVhID0gdGhpcy5fcmVuZGVyTGVnZW5kTGFiZWwodHVpLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgIHBvc2l0aW9uczogdHVpLnV0aWwucGx1Y2socGFyYW1zLnNlY3RvcnNJbmZvLCAnY2VudGVyUG9zaXRpb24nKSxcbiAgICAgICAgICAgIG1vdmVUb1Bvc2l0aW9uOiB0dWkudXRpbC5iaW5kKHRoaXMuX21vdmVUb0NlbnRlclBvc2l0aW9uLCB0aGlzKSxcbiAgICAgICAgICAgIHNlcGFyYXRvcjogJzxicj4nXG4gICAgICAgIH0sIHBhcmFtcykpO1xuXG4gICAgICAgIHJldHVybiBlbEFyZWE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZCBlbmQgcG9zaXRpb24uXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGNlbnRlckxlZnQgY2VudGVyIGxlZnRcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxvYmplY3Q+fSBwb3NpdGlvbnMgcG9zaXRpb25zXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYWRkRW5kUG9zaXRpb246IGZ1bmN0aW9uKGNlbnRlckxlZnQsIHBvc2l0aW9ucykge1xuICAgICAgICB0dWkudXRpbC5mb3JFYWNoKHBvc2l0aW9ucywgZnVuY3Rpb24ocG9zaXRpb24pIHtcbiAgICAgICAgICAgIHZhciBlbmQgPSB0dWkudXRpbC5leHRlbmQoe30sIHBvc2l0aW9uLm1pZGRsZSk7XG4gICAgICAgICAgICBpZiAoZW5kLmxlZnQgPCBjZW50ZXJMZWZ0KSB7XG4gICAgICAgICAgICAgICAgZW5kLmxlZnQgLT0gY2hhcnRDb25zdC5TRVJJRVNfT1VURVJfTEFCRUxfUEFERElORztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZW5kLmxlZnQgKz0gY2hhcnRDb25zdC5TRVJJRVNfT1VURVJfTEFCRUxfUEFERElORztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBvc2l0aW9uLmVuZCA9IGVuZDtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1vdmUgdG8gb3V0ZXIgcG9zaXRpb24uXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGNlbnRlckxlZnQgY2VudGVyIGxlZnRcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcG9zaXRpb24gcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbGFiZWwgbGFiZWxcbiAgICAgKiBAcmV0dXJucyB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBvdXRlciBwb3NpdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21vdmVUb091dGVyUG9zaXRpb246IGZ1bmN0aW9uKGNlbnRlckxlZnQsIHBvc2l0aW9uLCBsYWJlbCkge1xuICAgICAgICB2YXIgcG9zaXRpb25FbmQgPSBwb3NpdGlvbi5lbmQsXG4gICAgICAgICAgICBsZWZ0ID0gcG9zaXRpb25FbmQubGVmdCxcbiAgICAgICAgICAgIHRvcCA9IHBvc2l0aW9uRW5kLnRvcCAtIChyZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxIZWlnaHQobGFiZWwsIHRoaXMudGhlbWUubGFiZWwpIC8gMik7XG5cbiAgICAgICAgaWYgKGxlZnQgPCBjZW50ZXJMZWZ0KSB7XG4gICAgICAgICAgICBsZWZ0IC09IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbFdpZHRoKGxhYmVsLCB0aGlzLnRoZW1lLmxhYmVsKSArIGNoYXJ0Q29uc3QuU0VSSUVTX0xBQkVMX1BBRERJTkc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZWZ0ICs9IGNoYXJ0Q29uc3QuU0VSSUVTX0xBQkVMX1BBRERJTkc7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbGVmdDogbGVmdCxcbiAgICAgICAgICAgIHRvcDogdG9wXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBvdXRlciBsZWdlbmQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY29udGFpbmVyXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBsZWdlbmRzIGxlZ2VuZHNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPG9iamVjdD59IGNlbnRlclBvc2l0aW9ucyBjZW50ZXIgcG9zaXRpb25zXG4gICAgICogQHJldHVybiB7SFRNTEVsZW1lbnR9IGFyZWEgZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlck91dGVyTGVnZW5kOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIG91dGVyUG9zaXRpb25zID0gdHVpLnV0aWwucGx1Y2socGFyYW1zLnNlY3RvcnNJbmZvLCAnb3V0ZXJQb3NpdGlvbicpLFxuICAgICAgICAgICAgY2VudGVyTGVmdCA9IHBhcmFtcy5jaGFydFdpZHRoIC8gMixcbiAgICAgICAgICAgIGVsQXJlYTtcblxuICAgICAgICB0aGlzLl9hZGRFbmRQb3NpdGlvbihjZW50ZXJMZWZ0LCBvdXRlclBvc2l0aW9ucyk7XG4gICAgICAgIGVsQXJlYSA9IHRoaXMuX3JlbmRlckxlZ2VuZExhYmVsKHR1aS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICBwb3NpdGlvbnM6IG91dGVyUG9zaXRpb25zLFxuICAgICAgICAgICAgbW92ZVRvUG9zaXRpb246IHR1aS51dGlsLmJpbmQodGhpcy5fbW92ZVRvT3V0ZXJQb3NpdGlvbiwgdGhpcywgY2VudGVyTGVmdCksXG4gICAgICAgICAgICBzZXBhcmF0b3I6ICc6Jm5ic3A7J1xuICAgICAgICB9LCBwYXJhbXMpKTtcblxuICAgICAgICBpZiAodGhpcy5wYXBlcikge1xuICAgICAgICAgICAgdGhpcy5ncmFwaFJlbmRlcmVyLnJlbmRlckxlZ2VuZExpbmVzKHRoaXMucGFwZXIsIG91dGVyUG9zaXRpb25zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBlbEFyZWE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBzZXJpZXMgbGFiZWwuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSBhcmVhIGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJTZXJpZXNMYWJlbDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBlbEFyZWE7XG4gICAgICAgIGlmIChwYXJhbXMub3B0aW9ucy5sZWdlbmRUeXBlID09PSBjaGFydENvbnN0LlNFUklFU19MRUdFTkRfVFlQRV9PVVRFUikge1xuICAgICAgICAgICAgZWxBcmVhID0gdGhpcy5fcmVuZGVyT3V0ZXJMZWdlbmQocGFyYW1zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsQXJlYSA9IHRoaXMuX3JlbmRlckNlbnRlckxlZ2VuZChwYXJhbXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbEFyZWE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBib3VuZC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZ3JvdXBJbmRleCBncm91cCBpbmRleFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBpbmRleFxuICAgICAqIEByZXR1cm5zIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IGJvdW5kXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0Qm91bmQ6IGZ1bmN0aW9uKGdyb3VwSW5kZXgsIGluZGV4KSB7XG4gICAgICAgIGlmIChncm91cEluZGV4ID09PSAtMSB8fCBpbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnBvcHVwUG9zaXRpb25zW2luZGV4XTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2hvdyBzZXJpZXMgbGFiZWwgYXJlYS5cbiAgICAgKi9cbiAgICBzaG93U2VyaWVzTGFiZWxBcmVhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5ncmFwaFJlbmRlcmVyLmFuaW1hdGVMZWdlbmRMaW5lcygpO1xuICAgICAgICBTZXJpZXMucHJvdG90eXBlLnNob3dTZXJpZXNMYWJlbEFyZWEuY2FsbCh0aGlzKTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBQaWVDaGFydFNlcmllcztcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBTZXJpZXMgYmFzZSBjb21wb25lbnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBzZXJpZXNUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vc2VyaWVzVGVtcGxhdGUnKSxcbiAgICBjaGFydENvbnN0ID0gcmVxdWlyZSgnLi4vY29uc3QnKSxcbiAgICBzdGF0ZSA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvc3RhdGUnKSxcbiAgICBkb20gPSByZXF1aXJlKCcuLi9oZWxwZXJzL2RvbUhhbmRsZXInKSxcbiAgICByZW5kZXJVdGlsID0gcmVxdWlyZSgnLi4vaGVscGVycy9yZW5kZXJVdGlsJyksXG4gICAgZXZlbnQgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2V2ZW50TGlzdGVuZXInKSxcbiAgICBwbHVnaW5GYWN0b3J5ID0gcmVxdWlyZSgnLi4vZmFjdG9yaWVzL3BsdWdpbkZhY3RvcnknKTtcblxudmFyIFNFUklFU19MQUJFTF9DTEFTU19OQU1FID0gJ3R1aS1jaGFydC1zZXJpZXMtbGFiZWwnO1xuXG52YXIgU2VyaWVzID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBTZXJpZXMucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBTZXJpZXMgYmFzZSBjb21wb25lbnQuXG4gICAgICogQGNvbnN0cnVjdHMgU2VyaWVzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm1vZGVsIHNlcmllcyBtb2RlbFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5vcHRpb25zIHNlcmllcyBvcHRpb25zXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIHNlcmllcyB0aGVtZVxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgbGliVHlwZTtcblxuICAgICAgICB0dWkudXRpbC5leHRlbmQodGhpcywgcGFyYW1zKTtcbiAgICAgICAgbGliVHlwZSA9IHBhcmFtcy5saWJUeXBlIHx8IGNoYXJ0Q29uc3QuREVGQVVMVF9QTFVHSU47XG4gICAgICAgIHRoaXMucGVyY2VudFZhbHVlcyA9IHRoaXMuX21ha2VQZXJjZW50VmFsdWVzKHBhcmFtcy5kYXRhLCBwYXJhbXMub3B0aW9ucy5zdGFja2VkKTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdyYXBoIHJlbmRlcmVyXG4gICAgICAgICAqIEB0eXBlIHtvYmplY3R9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdyYXBoUmVuZGVyZXIgPSBwbHVnaW5GYWN0b3J5LmdldChsaWJUeXBlLCBwYXJhbXMuY2hhcnRUeXBlKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogU2VyaWVzIHZpZXcgY2xhc3NOYW1lXG4gICAgICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNsYXNzTmFtZSA9ICd0dWktY2hhcnQtc2VyaWVzLWFyZWEnO1xuXG4gICAgICAgIHRoaXMuc2VyaWVzRGF0YSA9IHRoaXMubWFrZVNlcmllc0RhdGEoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBzZXJpZXMgZGF0YS5cbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBhZGQgZGF0YVxuICAgICAqL1xuICAgIG1ha2VTZXJpZXNEYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHt9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTaG93IHRvb2x0aXAgKG1vdXNlb3ZlciBjYWxsYmFjaykuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5hbGxvd05lZ2F0aXZlVG9vbHRpcCB3aGV0aGVyIGFsbG93IG5lZ2F0aXZlIHRvb2x0aXAgb3Igbm90XG4gICAgICogQHBhcmFtIHt7dG9wOm51bWJlciwgbGVmdDogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGJvdW5kIGdyYXBoIGJvdW5kIGluZm9ybWF0aW9uXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGdyb3VwSW5kZXggZ3JvdXAgaW5kZXhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggaW5kZXhcbiAgICAgKi9cbiAgICBzaG93VG9vbHRpcDogZnVuY3Rpb24ocGFyYW1zLCBib3VuZCwgZ3JvdXBJbmRleCwgaW5kZXgsIGV2ZW50UG9zaXRpb24pIHtcbiAgICAgICAgdGhpcy5maXJlKCdzaG93VG9vbHRpcCcsIHR1aS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICBpbmRleGVzOiB7XG4gICAgICAgICAgICAgICAgZ3JvdXBJbmRleDogZ3JvdXBJbmRleCxcbiAgICAgICAgICAgICAgICBpbmRleDogaW5kZXhcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBib3VuZDogYm91bmQsXG4gICAgICAgICAgICBldmVudFBvc2l0aW9uOiBldmVudFBvc2l0aW9uXG4gICAgICAgIH0sIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBIaWRlIHRvb2x0aXAgKG1vdXNlb3V0IGNhbGxiYWNrKS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgdG9vbHRpcCBpZFxuICAgICAqL1xuICAgIGhpZGVUb29sdGlwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5maXJlKCdoaWRlVG9vbHRpcCcpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBleHBhbmQgc2VyaWVzIGRpbWVuc2lvblxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gZGltZW5zaW9uIHNlcmllcyBkaW1lbnNpb25cbiAgICAgKiBAcmV0dXJucyB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gZXhwZW5kZWQgZGltZW5zaW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZXhwYW5kRGltZW5zaW9uOiBmdW5jdGlvbihkaW1lbnNpb24pIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHdpZHRoOiBkaW1lbnNpb24ud2lkdGggKyBjaGFydENvbnN0LlNFUklFU19FWFBBTkRfU0laRSAqIDIsXG4gICAgICAgICAgICBoZWlnaHQ6IGRpbWVuc2lvbi5oZWlnaHQgKyBjaGFydENvbnN0LlNFUklFU19FWFBBTkRfU0laRVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgc2VyaWVzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciBvYmplY3QgZm9yIGdyYXBoIGRyYXdpbmdcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHNlcmllcyBlbGVtZW50XG4gICAgICovXG4gICAgcmVuZGVyOiBmdW5jdGlvbihwYXBlcikge1xuICAgICAgICB2YXIgZWwgPSBkb20uY3JlYXRlKCdESVYnLCB0aGlzLmNsYXNzTmFtZSksXG4gICAgICAgICAgICBib3VuZCA9IHRoaXMuYm91bmQsXG4gICAgICAgICAgICBkaW1lbnNpb24gPSB0aGlzLl9leHBhbmREaW1lbnNpb24oYm91bmQuZGltZW5zaW9uKSxcbiAgICAgICAgICAgIGluQ2FsbGJhY2sgPSB0dWkudXRpbC5iaW5kKHRoaXMuc2hvd1Rvb2x0aXAsIHRoaXMsIHtcbiAgICAgICAgICAgICAgICBhbGxvd05lZ2F0aXZlVG9vbHRpcDogISF0aGlzLmFsbG93TmVnYXRpdmVUb29sdGlwLFxuICAgICAgICAgICAgICAgIGNoYXJ0VHlwZTogdGhpcy5jaGFydFR5cGVcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgb3V0Q2FsbGJhY2sgPSB0dWkudXRpbC5iaW5kKHRoaXMuaGlkZVRvb2x0aXAsIHRoaXMpLFxuICAgICAgICAgICAgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICBkaW1lbnNpb246IGRpbWVuc2lvbixcbiAgICAgICAgICAgICAgICBjaGFydFR5cGU6IHRoaXMuY2hhcnRUeXBlLFxuICAgICAgICAgICAgICAgIHRoZW1lOiB0aGlzLnRoZW1lLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9uc1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNlcmllc0RhdGEgPSB0aGlzLnNlcmllc0RhdGEsXG4gICAgICAgICAgICBhZGREYXRhRm9yU2VyaWVzTGFiZWw7XG5cbiAgICAgICAgaWYgKCFwYXBlcikge1xuICAgICAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJEaW1lbnNpb24oZWwsIGRpbWVuc2lvbik7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9yZW5kZXJQb3NpdGlvbihlbCwgYm91bmQucG9zaXRpb24sIHRoaXMuY2hhcnRUeXBlKTtcblxuICAgICAgICBkYXRhID0gdHVpLnV0aWwuZXh0ZW5kKGRhdGEsIHNlcmllc0RhdGEpO1xuXG4gICAgICAgIHRoaXMucGFwZXIgPSB0aGlzLmdyYXBoUmVuZGVyZXIucmVuZGVyKHBhcGVyLCBlbCwgZGF0YSwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spO1xuXG4gICAgICAgIGlmICh0aGlzLl9yZW5kZXJTZXJpZXNMYWJlbCkge1xuICAgICAgICAgICAgYWRkRGF0YUZvclNlcmllc0xhYmVsID0gdGhpcy5fbWFrZVNlcmllc0RhdGFGb3JTZXJpZXNMYWJlbChlbCwgZGltZW5zaW9uKTtcbiAgICAgICAgICAgIHRoaXMuZWxTZXJpZXNMYWJlbEFyZWEgPSB0aGlzLl9yZW5kZXJTZXJpZXNMYWJlbCh0dWkudXRpbC5leHRlbmQoYWRkRGF0YUZvclNlcmllc0xhYmVsLCBzZXJpZXNEYXRhKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuaXNHcm91cGVkVG9vbHRpcCkge1xuICAgICAgICAgICAgdGhpcy5hdHRhY2hFdmVudChlbCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzZXJpZXMgbGFiZWwgbW91c2UgZXZlbnQg64+Z7J6RIOyLnCDsgqzsmqlcbiAgICAgICAgdGhpcy5pbkNhbGxiYWNrID0gaW5DYWxsYmFjaztcbiAgICAgICAgdGhpcy5vdXRDYWxsYmFjayA9IG91dENhbGxiYWNrO1xuXG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBhZGQgZGF0YSBmb3Igc2VyaWVzIGxhYmVsLlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciBjb250YWluZXJcbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGRpbWVuc2lvbiBkaW1lbnNpb25cbiAgICAgKiBAcmV0dXJucyB7e1xuICAgICAqICAgICAgY29udGFpbmVyOiBIVE1MRWxlbWVudCxcbiAgICAgKiAgICAgIHZhbHVlczogYXJyYXkuPGFycmF5PixcbiAgICAgKiAgICAgIGZvcm1hdHRlZFZhbHVlczogYXJyYXkuPGFycmF5PixcbiAgICAgKiAgICAgIGZvcm1hdEZ1bmN0aW9uczogYXJyYXkuPGZ1bmN0aW9uPixcbiAgICAgKiAgICAgIGRpbWVuc2lvbjoge3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfVxuICAgICAqIH19IGFkZCBkYXRhIGZvciBzZXJpZXMgbGFiZWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlU2VyaWVzRGF0YUZvclNlcmllc0xhYmVsOiBmdW5jdGlvbihjb250YWluZXIsIGRpbWVuc2lvbikge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY29udGFpbmVyOiBjb250YWluZXIsXG4gICAgICAgICAgICB2YWx1ZXM6IHRoaXMuZGF0YS52YWx1ZXMsXG4gICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXM6IHRoaXMuZGF0YS5mb3JtYXR0ZWRWYWx1ZXMsXG4gICAgICAgICAgICBmb3JtYXRGdW5jdGlvbnM6IHRoaXMuZGF0YS5mb3JtYXRGdW5jdGlvbnMsXG4gICAgICAgICAgICBkaW1lbnNpb246IGRpbWVuc2lvblxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgYm91bmRzXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgc2VyaWVzIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3t0b3A6IG51bWJlciwgbGVmdDogbnVtYmVyfX0gcG9zaXRpb24gc2VyaWVzIHBvc2l0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyUG9zaXRpb246IGZ1bmN0aW9uKGVsLCBwb3NpdGlvbikge1xuICAgICAgICB2YXIgaGlkZGVuV2lkdGggPSByZW5kZXJVdGlsLmlzSUU4KCkgPyBjaGFydENvbnN0LkhJRERFTl9XSURUSCA6IDA7XG4gICAgICAgIHBvc2l0aW9uLnRvcCA9IHBvc2l0aW9uLnRvcCAtIChoaWRkZW5XaWR0aCAqIDIpO1xuICAgICAgICBwb3NpdGlvbi5sZWZ0ID0gcG9zaXRpb24ubGVmdCAtIGNoYXJ0Q29uc3QuU0VSSUVTX0VYUEFORF9TSVpFIC0gaGlkZGVuV2lkdGg7XG4gICAgICAgIHJlbmRlclV0aWwucmVuZGVyUG9zaXRpb24oZWwsIHBvc2l0aW9uKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHBhcGVyLlxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IG9iamVjdCBmb3IgZ3JhcGggZHJhd2luZ1xuICAgICAqL1xuICAgIGdldFBhcGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFwZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgcGVyY2VudCB2YWx1ZS5cbiAgICAgKiBAcGFyYW0ge3t2YWx1ZXM6IGFycmF5LCBzY2FsZToge21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19fSBkYXRhIHNlcmllcyBkYXRhXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHN0YWNrZWQgc3RhY2tlZCBvcHRpb25cbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxudW1iZXI+Pn0gcGVyY2VudCB2YWx1ZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlUGVyY2VudFZhbHVlczogZnVuY3Rpb24oZGF0YSwgc3RhY2tlZCkge1xuICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICBpZiAoc3RhY2tlZCA9PT0gY2hhcnRDb25zdC5TVEFDS0VEX05PUk1BTF9UWVBFKSB7XG4gICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9tYWtlTm9ybWFsU3RhY2tlZFBlcmNlbnRWYWx1ZXMoZGF0YSk7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RhY2tlZCA9PT0gY2hhcnRDb25zdC5TVEFDS0VEX1BFUkNFTlRfVFlQRSkge1xuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5fbWFrZVBlcmNlbnRTdGFja2VkUGVyY2VudFZhbHVlcyhkYXRhKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuX21ha2VOb3JtYWxQZXJjZW50VmFsdWVzKGRhdGEpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBwZXJjZW50IHZhbHVlcyBhYm91dCBub3JtYWwgc3RhY2tlZCBvcHRpb24uXG4gICAgICogQHBhcmFtIHt7dmFsdWVzOiBhcnJheSwgc2NhbGU6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fX0gZGF0YSBzZXJpZXMgZGF0YVxuICAgICAqIEByZXR1cm5zIHthcnJheX0gcGVyY2VudCB2YWx1ZXMgYWJvdXQgbm9ybWFsIHN0YWNrZWQgb3B0aW9uLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VOb3JtYWxTdGFja2VkUGVyY2VudFZhbHVlczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgbWluID0gZGF0YS5zY2FsZS5taW4sXG4gICAgICAgICAgICBtYXggPSBkYXRhLnNjYWxlLm1heCxcbiAgICAgICAgICAgIGRpc3RhbmNlID0gbWF4IC0gbWluLFxuICAgICAgICAgICAgcGVyY2VudFZhbHVlcyA9IHR1aS51dGlsLm1hcChkYXRhLnZhbHVlcywgZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBsdXNWYWx1ZXMgPSB0dWkudXRpbC5maWx0ZXIodmFsdWVzLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlID4gMDtcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIHN1bSA9IHR1aS51dGlsLnN1bShwbHVzVmFsdWVzKSxcbiAgICAgICAgICAgICAgICAgICAgZ3JvdXBQZXJjZW50ID0gKHN1bSAtIG1pbikgLyBkaXN0YW5jZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHVpLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlID09PSAwID8gMCA6IGdyb3VwUGVyY2VudCAqICh2YWx1ZSAvIHN1bSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHBlcmNlbnRWYWx1ZXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgcGVyY2VudCB2YWx1ZXMgYWJvdXQgcGVyY2VudCBzdGFja2VkIG9wdGlvbi5cbiAgICAgKiBAcGFyYW0ge3t2YWx1ZXM6IGFycmF5LCBzY2FsZToge21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19fSBkYXRhIHNlcmllcyBkYXRhXG4gICAgICogQHJldHVybnMge2FycmF5fSBwZXJjZW50IHZhbHVlcyBhYm91dCBwZXJjZW50IHN0YWNrZWQgb3B0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVBlcmNlbnRTdGFja2VkUGVyY2VudFZhbHVlczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgcGVyY2VudFZhbHVlcyA9IHR1aS51dGlsLm1hcChkYXRhLnZhbHVlcywgZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgICAgICB2YXIgcGx1c1ZhbHVlcyA9IHR1aS51dGlsLmZpbHRlcih2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSA+IDA7XG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgc3VtID0gdHVpLnV0aWwuc3VtKHBsdXNWYWx1ZXMpO1xuICAgICAgICAgICAgcmV0dXJuIHR1aS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlID09PSAwID8gMCA6IHZhbHVlIC8gc3VtO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcGVyY2VudFZhbHVlcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBub3JtYWwgcGVyY2VudCB2YWx1ZS5cbiAgICAgKiBAcGFyYW0ge3t2YWx1ZXM6IGFycmF5LCBzY2FsZToge21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19fSBkYXRhIHNlcmllcyBkYXRhXG4gICAgICogQHJldHVybnMge2FycmF5LjxhcnJheS48bnVtYmVyPj59IHBlcmNlbnQgdmFsdWVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZU5vcm1hbFBlcmNlbnRWYWx1ZXM6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIG1pbiA9IGRhdGEuc2NhbGUubWluLFxuICAgICAgICAgICAgbWF4ID0gZGF0YS5zY2FsZS5tYXgsXG4gICAgICAgICAgICBkaXN0YW5jZSA9IG1heCAtIG1pbixcbiAgICAgICAgICAgIGlzTGluZVR5cGVDaGFydCA9IHN0YXRlLmlzTGluZVR5cGVDaGFydCh0aGlzLmNoYXJ0VHlwZSksXG4gICAgICAgICAgICBmbGFnID0gMSxcbiAgICAgICAgICAgIHN1YlZhbHVlID0gMCxcbiAgICAgICAgICAgIHBlcmNlbnRWYWx1ZXM7XG5cbiAgICAgICAgaWYgKCFpc0xpbmVUeXBlQ2hhcnQgJiYgbWluIDwgMCAmJiBtYXggPD0gMCkge1xuICAgICAgICAgICAgZmxhZyA9IC0xO1xuICAgICAgICAgICAgc3ViVmFsdWUgPSBtYXg7XG4gICAgICAgICAgICBkaXN0YW5jZSA9IG1pbiAtIG1heDtcbiAgICAgICAgfSBlbHNlIGlmIChpc0xpbmVUeXBlQ2hhcnQgfHwgbWluID49IDApIHtcbiAgICAgICAgICAgIHN1YlZhbHVlID0gbWluO1xuICAgICAgICB9XG5cbiAgICAgICAgcGVyY2VudFZhbHVlcyA9IHR1aS51dGlsLm1hcChkYXRhLnZhbHVlcywgZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgICAgICByZXR1cm4gdHVpLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKHZhbHVlIC0gc3ViVmFsdWUpICogZmxhZyAvIGRpc3RhbmNlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcGVyY2VudFZhbHVlcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHNjYWxlIGRpc3RhbmNlIGZyb20gemVybyBwb2ludC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc2l6ZSBjaGFydCBzaXplICh3aWR0aCBvciBoZWlnaHQpXG4gICAgICogQHBhcmFtIHt7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX0gc2NhbGUgc2NhbGVcbiAgICAgKiBAcmV0dXJucyB7e3RvTWF4OiBudW1iZXIsIHRvTWluOiBudW1iZXJ9fSBwaXhlbCBkaXN0YW5jZVxuICAgICAqL1xuICAgIGdldFNjYWxlRGlzdGFuY2VGcm9tWmVyb1BvaW50OiBmdW5jdGlvbihzaXplLCBzY2FsZSkge1xuICAgICAgICB2YXIgbWluID0gc2NhbGUubWluLFxuICAgICAgICAgICAgbWF4ID0gc2NhbGUubWF4LFxuICAgICAgICAgICAgZGlzdGFuY2UgPSBtYXggLSBtaW4sXG4gICAgICAgICAgICB0b01heCA9IDAsXG4gICAgICAgICAgICB0b01pbiA9IDA7XG5cbiAgICAgICAgaWYgKG1pbiA8IDAgJiYgbWF4ID4gMCkge1xuICAgICAgICAgICAgdG9NYXggPSAoZGlzdGFuY2UgKyBtaW4pIC8gZGlzdGFuY2UgKiBzaXplO1xuICAgICAgICAgICAgdG9NaW4gPSAoZGlzdGFuY2UgLSBtYXgpIC8gZGlzdGFuY2UgKiBzaXplO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRvTWF4OiB0b01heCxcbiAgICAgICAgICAgIHRvTWluOiB0b01pblxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICByZW5kZXJDb29yZGluYXRlQXJlYTogZnVuY3Rpb24oKSB7fSxcblxuICAgIC8qKlxuICAgICAqIE9uIG1vdXNlb3ZlciBldmVudCBoYW5kbGVyIGZvciBzZXJpZXMgYXJlYVxuICAgICAqIEBwYXJhbSB7TW91c2VFdmVudH0gZSBtb3VzZSBldmVudFxuICAgICAqL1xuICAgIG9uTW91c2VvdmVyOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciBlbFRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudCxcbiAgICAgICAgICAgIGdyb3VwSW5kZXgsIGluZGV4O1xuXG4gICAgICAgIGlmIChlbFRhcmdldC5jbGFzc05hbWUgIT09IFNFUklFU19MQUJFTF9DTEFTU19OQU1FKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBncm91cEluZGV4ID0gcGFyc2VJbnQoZWxUYXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWdyb3VwLWluZGV4JyksIDEwKTtcbiAgICAgICAgaW5kZXggPSBwYXJzZUludChlbFRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaW5kZXgnKSwgMTApO1xuXG4gICAgICAgIGlmIChncm91cEluZGV4ID09PSAtMSB8fCBpbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuaW5DYWxsYmFjayh0aGlzLl9nZXRCb3VuZChncm91cEluZGV4LCBpbmRleCksIGdyb3VwSW5kZXgsIGluZGV4KTtcbiAgICB9LFxuXG4gICAgb25Nb3VzZW1vdmU6IGZ1bmN0aW9uKCkge30sXG4gICAgLyoqXG4gICAgICogT24gbW91c2VvdXQgZXZlbnQgaGFuZGxlciBmb3Igc2VyaWVzIGFyZWFcbiAgICAgKiBAcGFyYW0ge01vdXNlRXZlbnR9IGUgbW91c2UgZXZlbnRcbiAgICAgKi9cbiAgICBvbk1vdXNlb3V0OiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciBlbFRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudCxcbiAgICAgICAgICAgIGdyb3VwSW5kZXgsIGluZGV4O1xuXG4gICAgICAgIGlmIChlbFRhcmdldC5jbGFzc05hbWUgIT09IFNFUklFU19MQUJFTF9DTEFTU19OQU1FKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBncm91cEluZGV4ID0gcGFyc2VJbnQoZWxUYXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWdyb3VwLWluZGV4JyksIDEwKTtcbiAgICAgICAgaW5kZXggPSBwYXJzZUludChlbFRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaW5kZXgnKSwgMTApO1xuXG4gICAgICAgIGlmIChncm91cEluZGV4ID09PSAtMSB8fCBpbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMub3V0Q2FsbGJhY2soZ3JvdXBJbmRleCwgaW5kZXgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggZXZlbnRcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqL1xuICAgIGF0dGFjaEV2ZW50OiBmdW5jdGlvbihlbCkge1xuICAgICAgICBldmVudC5iaW5kRXZlbnQoJ21vdXNlb3ZlcicsIGVsLCB0dWkudXRpbC5iaW5kKHRoaXMub25Nb3VzZW92ZXIsIHRoaXMpKTtcbiAgICAgICAgZXZlbnQuYmluZEV2ZW50KCdtb3VzZW1vdmUnLCBlbCwgdHVpLnV0aWwuYmluZCh0aGlzLm9uTW91c2Vtb3ZlLCB0aGlzKSk7XG4gICAgICAgIGV2ZW50LmJpbmRFdmVudCgnbW91c2VvdXQnLCBlbCwgdHVpLnV0aWwuYmluZCh0aGlzLm9uTW91c2VvdXQsIHRoaXMpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gY2FsbCBzaG93QW5pbWF0aW9uIGZ1bmN0aW9uIG9mIGdyYXBoUmVuZGVyZXIuXG4gICAgICogQHBhcmFtIHt7Z3JvdXBJbmRleDogbnVtYmVyLCBpbmRleDogbnVtYmVyfX0gZGF0YSBkYXRhXG4gICAgICovXG4gICAgb25TaG93QW5pbWF0aW9uOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIGlmICghdGhpcy5ncmFwaFJlbmRlcmVyLnNob3dBbmltYXRpb24pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmdyYXBoUmVuZGVyZXIuc2hvd0FuaW1hdGlvbi5jYWxsKHRoaXMuZ3JhcGhSZW5kZXJlciwgZGF0YSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIGNhbGwgaGlkZUFuaW1hdGlvbiBmdW5jdGlvbiBvZiBncmFwaFJlbmRlcmVyLlxuICAgICAqIEBwYXJhbSB7e2dyb3VwSW5kZXg6IG51bWJlciwgaW5kZXg6IG51bWJlcn19IGRhdGEgZGF0YVxuICAgICAqL1xuICAgIG9uSGlkZUFuaW1hdGlvbjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBpZiAoIXRoaXMuZ3JhcGhSZW5kZXJlci5oaWRlQW5pbWF0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ncmFwaFJlbmRlcmVyLmhpZGVBbmltYXRpb24uY2FsbCh0aGlzLmdyYXBoUmVuZGVyZXIsIGRhdGEpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBjYWxsIHNob3dHcm91cEFuaW1hdGlvbiBmdW5jdGlvbiBvZiBncmFwaFJlbmRlcmVyLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBpbmRleFxuICAgICAqIEBwYXJhbSB7e1xuICAgICAqICAgICAgZGltZW5zaW9uOiB7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9LFxuICAgICAqICAgICAgcG9zaXRpb246IHtsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfVxuICAgICAqIH19IGJvdW5kIGJvdW5kXG4gICAgICovXG4gICAgb25TaG93R3JvdXBBbmltYXRpb246IGZ1bmN0aW9uKGluZGV4LCBib3VuZCkge1xuICAgICAgICBpZiAoIXRoaXMuZ3JhcGhSZW5kZXJlci5zaG93R3JvdXBBbmltYXRpb24pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmdyYXBoUmVuZGVyZXIuc2hvd0dyb3VwQW5pbWF0aW9uLmNhbGwodGhpcy5ncmFwaFJlbmRlcmVyLCBpbmRleCwgYm91bmQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBjYWxsIGhpZGVHcm91cEFuaW1hdGlvbiBmdW5jdGlvbiBvZiBncmFwaFJlbmRlcmVyLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBpbmRleFxuICAgICAqL1xuICAgIG9uSGlkZUdyb3VwQW5pbWF0aW9uOiBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICBpZiAoIXRoaXMuZ3JhcGhSZW5kZXJlci5oaWRlR3JvdXBBbmltYXRpb24pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmdyYXBoUmVuZGVyZXIuaGlkZUdyb3VwQW5pbWF0aW9uLmNhbGwodGhpcy5ncmFwaFJlbmRlcmVyLCBpbmRleCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFuaW1hdGUgY29tcG9uZW50LlxuICAgICAqL1xuICAgIGFuaW1hdGVDb21wb25lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5ncmFwaFJlbmRlcmVyLmFuaW1hdGUpIHtcbiAgICAgICAgICAgIHRoaXMuZ3JhcGhSZW5kZXJlci5hbmltYXRlKHR1aS51dGlsLmJpbmQodGhpcy5zaG93U2VyaWVzTGFiZWxBcmVhLCB0aGlzKSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBodG1sIGFib3V0IHNlcmllcyBsYWJlbFxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBwb3NpdGlvbiBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSB2YWx1ZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBncm91cEluZGV4IGdyb3VwIGluZGV4XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IGluZGV4XG4gICAgICogQHJldHVybnMge3N0cmluZ30gaHRtbCBzdHJpbmdcbiAgICAgKi9cbiAgICBtYWtlU2VyaWVzTGFiZWxIdG1sOiBmdW5jdGlvbihwb3NpdGlvbiwgdmFsdWUsIGdyb3VwSW5kZXgsIGluZGV4KSB7XG4gICAgICAgIHZhciBjc3NPYmogPSB0dWkudXRpbC5leHRlbmQocG9zaXRpb24sIHRoaXMudGhlbWUubGFiZWwpO1xuICAgICAgICByZXR1cm4gc2VyaWVzVGVtcGxhdGUudHBsU2VyaWVzTGFiZWwoe1xuICAgICAgICAgICAgY3NzVGV4dDogc2VyaWVzVGVtcGxhdGUudHBsQ3NzVGV4dChjc3NPYmopLFxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgZ3JvdXBJbmRleDogZ3JvdXBJbmRleCxcbiAgICAgICAgICAgIGluZGV4OiBpbmRleFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2hvdyBzZXJpZXMgbGFiZWwgYXJlYS5cbiAgICAgKi9cbiAgICBzaG93U2VyaWVzTGFiZWxBcmVhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCghdGhpcy5vcHRpb25zLnNob3dMYWJlbCAmJiAhdGhpcy5vcHRpb25zLmxlZ2VuZFR5cGUpIHx8ICF0aGlzLmVsU2VyaWVzTGFiZWxBcmVhKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBkb20uYWRkQ2xhc3ModGhpcy5lbFNlcmllc0xhYmVsQXJlYSwgJ3Nob3cnKTtcblxuICAgICAgICAobmV3IHR1aS5jb21wb25lbnQuRWZmZWN0cy5GYWRlKHtcbiAgICAgICAgICAgIGVsZW1lbnQ6IHRoaXMuZWxTZXJpZXNMYWJlbEFyZWEsXG4gICAgICAgICAgICBkdXJhdGlvbjogMzAwXG4gICAgICAgIH0pKS5hY3Rpb24oe1xuICAgICAgICAgICAgc3RhcnQ6IDAsXG4gICAgICAgICAgICBlbmQ6IDEsXG4gICAgICAgICAgICBjb21wbGV0ZTogZnVuY3Rpb24oKSB7fVxuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxudHVpLnV0aWwuQ3VzdG9tRXZlbnRzLm1peGluKFNlcmllcyk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2VyaWVzO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFRoaXMgaXMgdGVtcGxhdGVzIG9mIHNlcmllcy5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbnZhciB0ZW1wbGF0ZU1ha2VyID0gcmVxdWlyZSgnLi4vaGVscGVycy90ZW1wbGF0ZU1ha2VyJyk7XG5cbnZhciB0YWdzID0ge1xuICAgIEhUTUxfU0VSSUVTX0xBQkVMOiAnPGRpdiBjbGFzcz1cInR1aS1jaGFydC1zZXJpZXMtbGFiZWxcIiBzdHlsZT1cInt7IGNzc1RleHQgfX1cIiBkYXRhLWdyb3VwLWluZGV4PVwie3sgZ3JvdXBJbmRleCB9fVwiIGRhdGEtaW5kZXg9XCJ7eyBpbmRleCB9fVwiPnt7IHZhbHVlIH19PC9kaXY+JyxcbiAgICBURVhUX0NTU19URVhUOiAnbGVmdDp7eyBsZWZ0IH19cHg7dG9wOnt7IHRvcCB9fXB4O2ZvbnQtZmFtaWx5Ont7IGZvbnRGYW1pbHkgfX07Zm9udC1zaXplOnt7IGZvbnRTaXplIH19cHgnXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICB0cGxTZXJpZXNMYWJlbDogdGVtcGxhdGVNYWtlci50ZW1wbGF0ZSh0YWdzLkhUTUxfU0VSSUVTX0xBQkVMKSxcbiAgICB0cGxDc3NUZXh0OiB0ZW1wbGF0ZU1ha2VyLnRlbXBsYXRlKHRhZ3MuVEVYVF9DU1NfVEVYVClcbn07XG4iLCJ2YXIgREVGQVVMVF9DT0xPUiA9ICcjMDAwMDAwJyxcbiAgICBERUZBVUxUX0JBQ0tHUk9VTkQgPSAnI2ZmZmZmZicsXG4gICAgRU1QVFkgPSAnJyxcbiAgICBERUZBVUxUX0FYSVMgPSB7XG4gICAgICAgIHRpY2tDb2xvcjogREVGQVVMVF9DT0xPUixcbiAgICAgICAgdGl0bGU6IHtcbiAgICAgICAgICAgIGZvbnRTaXplOiAxMixcbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IEVNUFRZLFxuICAgICAgICAgICAgY29sb3I6IERFRkFVTFRfQ09MT1JcbiAgICAgICAgfSxcbiAgICAgICAgbGFiZWw6IHtcbiAgICAgICAgICAgIGZvbnRTaXplOiAxMixcbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IEVNUFRZLFxuICAgICAgICAgICAgY29sb3I6IERFRkFVTFRfQ09MT1JcbiAgICAgICAgfVxuICAgIH07XG5cbnZhciBkZWZhdWx0VGhlbWUgPSB7XG4gICAgY2hhcnQ6IHtcbiAgICAgICAgYmFja2dyb3VuZDogREVGQVVMVF9CQUNLR1JPVU5ELFxuICAgICAgICBmb250RmFtaWx5OiAnVmVyZGFuYSdcbiAgICB9LFxuICAgIHRpdGxlOiB7XG4gICAgICAgIGZvbnRTaXplOiAxOCxcbiAgICAgICAgZm9udEZhbWlseTogRU1QVFksXG4gICAgICAgIGNvbG9yOiBERUZBVUxUX0NPTE9SXG4gICAgfSxcbiAgICB5QXhpczogREVGQVVMVF9BWElTLFxuICAgIHhBeGlzOiBERUZBVUxUX0FYSVMsXG4gICAgcGxvdDoge1xuICAgICAgICBsaW5lQ29sb3I6ICcjZGRkZGRkJyxcbiAgICAgICAgYmFja2dyb3VuZDogJyNmZmZmZmYnXG4gICAgfSxcbiAgICBzZXJpZXM6IHtcbiAgICAgICAgbGFiZWw6IHtcbiAgICAgICAgICAgIGZvbnRTaXplOiAxMSxcbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IEVNUFRZLFxuICAgICAgICAgICAgY29sb3I6IERFRkFVTFRfQ09MT1JcbiAgICAgICAgfSxcbiAgICAgICAgY29sb3JzOiBbJyNhYzQxNDInLCAnI2QyODQ0NScsICcjZjRiZjc1JywgJyM5MGE5NTknLCAnIzc1YjVhYScsICcjNmE5ZmI1JywgJyNhYTc1OWYnLCAnIzhmNTUzNiddLFxuICAgICAgICBib3JkZXJDb2xvcjogRU1QVFlcbiAgICB9LFxuICAgIGxlZ2VuZDoge1xuICAgICAgICBsYWJlbDoge1xuICAgICAgICAgICAgZm9udFNpemU6IDEyLFxuICAgICAgICAgICAgZm9udEZhbWlseTogRU1QVFksXG4gICAgICAgICAgICBjb2xvcjogREVGQVVMVF9DT0xPUlxuICAgICAgICB9XG4gICAgfSxcbiAgICB0b29sdGlwOiB7fVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBkZWZhdWx0VGhlbWU7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgR3JvdXAgdG9vbHRpcCBjb21wb25lbnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBUb29sdGlwQmFzZSA9IHJlcXVpcmUoJy4vdG9vbHRpcEJhc2UnKSxcbiAgICBjaGFydENvbnN0ID0gcmVxdWlyZSgnLi4vY29uc3QnKSxcbiAgICBkb20gPSByZXF1aXJlKCcuLi9oZWxwZXJzL2RvbUhhbmRsZXInKSxcbiAgICByZW5kZXJVdGlsID0gcmVxdWlyZSgnLi4vaGVscGVycy9yZW5kZXJVdGlsJyksXG4gICAgZGVmYXVsdFRoZW1lID0gcmVxdWlyZSgnLi4vdGhlbWVzL2RlZmF1bHRUaGVtZScpLFxuICAgIHRvb2x0aXBUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdG9vbHRpcFRlbXBsYXRlJyk7XG5cbnZhciBHcm91cFRvb2x0aXAgPSB0dWkudXRpbC5kZWZpbmVDbGFzcyhUb29sdGlwQmFzZSwgLyoqIEBsZW5kcyBHcm91cFRvb2x0aXAucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBHcm91cCB0b29sdGlwIGNvbXBvbmVudC5cbiAgICAgKiBAY29uc3RydWN0cyBHcm91cFRvb2x0aXBcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPG51bWJlcj59IHBhcmFtcy52YWx1ZXMgY29udmVydGVkIHZhbHVlc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheX0gcGFyYW1zLmxhYmVscyBsYWJlbHNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXl9IHBhcmFtcy5sZWdlbmRMYWJlbHMgbGVnZW5kIGxhYmVsc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5ib3VuZCBheGlzIGJvdW5kXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIGF4aXMgdGhlbWVcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgVG9vbHRpcEJhc2UuY2FsbCh0aGlzLCBwYXJhbXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHRvb2x0aXAgZGF0YS5cbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPG9iamVjdD59IHRvb2x0aXAgZGF0YVxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIG1ha2VUb29sdGlwRGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0dWkudXRpbC5tYXAodGhpcy5qb2luRm9ybWF0dGVkVmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMsIGluZGV4KSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiB0aGlzLmxhYmVsc1tpbmRleF0sXG4gICAgICAgICAgICAgICAgdmFsdWVzOiB2YWx1ZXNcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGNvbG9ycy5cbiAgICAgKiBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBsZWdlbmRMYWJlbHMgbGVnZW5kIGxhYmVsc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSB0b29sdGlwIHRoZW1lXG4gICAgICogQHJldHVybnMge2FycmF5LjxzdHJpbmc+fSBjb2xvcnNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQ29sb3JzOiBmdW5jdGlvbihsZWdlbmRMYWJlbHMsIHRoZW1lKSB7XG4gICAgICAgIHZhciBjb2xvckluZGV4ID0gMCxcbiAgICAgICAgICAgIGRlZmF1bHRDb2xvcnMsIGNvbG9ycywgcHJldkNoYXJ0VHlwZTtcbiAgICAgICAgaWYgKHRoZW1lLmNvbG9ycykge1xuICAgICAgICAgICAgcmV0dXJuIHRoZW1lLmNvbG9ycztcbiAgICAgICAgfVxuXG4gICAgICAgIGRlZmF1bHRDb2xvcnMgPSBkZWZhdWx0VGhlbWUuc2VyaWVzLmNvbG9ycy5zbGljZSgwLCBsZWdlbmRMYWJlbHMubGVuZ3RoKTtcblxuICAgICAgICByZXR1cm4gdHVpLnV0aWwubWFwKHR1aS51dGlsLnBsdWNrKGxlZ2VuZExhYmVscywgJ2NoYXJ0VHlwZScpLCBmdW5jdGlvbihjaGFydFR5cGUpIHtcbiAgICAgICAgICAgIHZhciBjb2xvcjtcbiAgICAgICAgICAgIGlmIChwcmV2Q2hhcnRUeXBlICE9PSBjaGFydFR5cGUpIHtcbiAgICAgICAgICAgICAgICBjb2xvcnMgPSB0aGVtZVtjaGFydFR5cGVdID8gdGhlbWVbY2hhcnRUeXBlXS5jb2xvcnMgOiBkZWZhdWx0Q29sb3JzO1xuICAgICAgICAgICAgICAgIGNvbG9ySW5kZXggPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcHJldkNoYXJ0VHlwZSA9IGNoYXJ0VHlwZTtcbiAgICAgICAgICAgIGNvbG9yID0gY29sb3JzW2NvbG9ySW5kZXhdO1xuICAgICAgICAgICAgY29sb3JJbmRleCArPSAxO1xuICAgICAgICAgICAgcmV0dXJuIGNvbG9yO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSB0b29sdGlwIGh0bWwuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGdyb3VwSW5kZXggZ3JvdXAgaW5kZXhcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSB0b29sdGlwIGh0bWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlVG9vbHRpcEh0bWw6IGZ1bmN0aW9uKGdyb3VwSW5kZXgpIHtcbiAgICAgICAgdmFyIGl0ZW0gPSB0aGlzLmRhdGFbZ3JvdXBJbmRleF0sXG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IHRvb2x0aXBUZW1wbGF0ZS50cGxHcm91cEl0ZW0sXG4gICAgICAgICAgICBjc3NUZXh0VGVtcGxhdGUgPSB0b29sdGlwVGVtcGxhdGUudHBsR3JvdXBDc3NUZXh0LFxuICAgICAgICAgICAgY29sb3JzID0gdGhpcy5fbWFrZUNvbG9ycyh0aGlzLmpvaW5MZWdlbmRMYWJlbHMsIHRoaXMudGhlbWUpLFxuICAgICAgICAgICAgaXRlbXNIdG1sO1xuXG4gICAgICAgIGl0ZW1zSHRtbCA9IHR1aS51dGlsLm1hcChpdGVtLnZhbHVlcywgZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgbGVnZW5kTGFiZWwgPSB0aGlzLmpvaW5MZWdlbmRMYWJlbHNbaW5kZXhdO1xuICAgICAgICAgICAgcmV0dXJuIHRlbXBsYXRlKHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICAgICAgbGVnZW5kOiBsZWdlbmRMYWJlbC5sYWJlbCxcbiAgICAgICAgICAgICAgICBjaGFydFR5cGU6IGxlZ2VuZExhYmVsLmNoYXJ0VHlwZSxcbiAgICAgICAgICAgICAgICBjc3NUZXh0OiBjc3NUZXh0VGVtcGxhdGUoe2NvbG9yOiBjb2xvcnNbaW5kZXhdfSksXG4gICAgICAgICAgICAgICAgc3VmZml4OiB0aGlzLnN1ZmZpeFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIHRoaXMpLmpvaW4oJycpO1xuXG4gICAgICAgIHJldHVybiB0b29sdGlwVGVtcGxhdGUudHBsR3JvdXAoe1xuICAgICAgICAgICAgY2F0ZWdvcnk6IGl0ZW0uY2F0ZWdvcnksXG4gICAgICAgICAgICBpdGVtczogaXRlbXNIdG1sXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBjYWxjdWxhdGUgdmVydGljYWwgcG9zaXRpb24uXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBkaW1lbnNpb24gZGltZW5zaW9uXG4gICAgICogQHBhcmFtIHt7aW5kZXg6IG51bWJlciwgcmFuZ2U6IHtzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcn0sXG4gICAgICogICAgICAgICAgc2l6ZTogbnVtYmVyLCBkaXJlY3Rpb246IHN0cmluZywgaXNWZXJ0aWNhbDogYm9vbGVhblxuICAgICAqICAgICAgICB9fSBwYXJhbXMgY29vcmRpbmF0ZSBldmVudCBwYXJhbWV0ZXJzXG4gICAgICogQHJldHVybnMge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gcG9zaXRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jYWxjdWxhdGVWZXJ0aWNhbFBvc2l0aW9uOiBmdW5jdGlvbihkaW1lbnNpb24sIHBhcmFtcykge1xuICAgICAgICB2YXIgcmFuZ2UgPSBwYXJhbXMucmFuZ2UsXG4gICAgICAgICAgICBpc0xpbmUgPSAocmFuZ2Uuc3RhcnQgPT09IHJhbmdlLmVuZCksXG4gICAgICAgICAgICBwYWRkaW5nID0gaXNMaW5lID8gNiA6IDAsXG4gICAgICAgICAgICBsZWZ0ID0gY2hhcnRDb25zdC5TRVJJRVNfRVhQQU5EX1NJWkU7XG4gICAgICAgIGlmIChwYXJhbXMuZGlyZWN0aW9uID09PSBjaGFydENvbnN0LlRPT0xUSVBfRElSRUNUSU9OX0ZPUldPUkQpIHtcbiAgICAgICAgICAgIGxlZnQgKz0gcmFuZ2Uuc3RhcnQgKyBwYWRkaW5nO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGVmdCArPSByYW5nZS5lbmQgLSBkaW1lbnNpb24ud2lkdGggLSBwYWRkaW5nO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsZWZ0OiBsZWZ0LFxuICAgICAgICAgICAgdG9wOiAocGFyYW1zLnNpemUgLSBkaW1lbnNpb24uaGVpZ2h0KSAvIDJcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gY2FsY3VsYXRlIGhvcml6b250YWwgcG9zaXRpb24uXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBkaW1lbnNpb24gZGltZW5zaW9uXG4gICAgICogQHBhcmFtIHt7aW5kZXg6IG51bWJlciwgcmFuZ2U6IHtzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcn0sXG4gICAgICogICAgICAgICAgc2l6ZTogbnVtYmVyLCBkaXJlY3Rpb246IHN0cmluZywgaXNWZXJ0aWNhbDogYm9vbGVhblxuICAgICAqICAgICAgICB9fSBwYXJhbXMgY29vcmRpbmF0ZSBldmVudCBwYXJhbWV0ZXJzXG4gICAgICogQHJldHVybnMge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gcG9zaXRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jYWxjdWxhdGVIb3Jpem9udGFsUG9zaXRpb246IGZ1bmN0aW9uKGRpbWVuc2lvbiwgcGFyYW1zKSB7XG4gICAgICAgIHZhciByYW5nZSA9IHBhcmFtcy5yYW5nZSxcbiAgICAgICAgICAgIHRvcCA9IDA7XG4gICAgICAgIGlmIChwYXJhbXMuZGlyZWN0aW9uID09PSBjaGFydENvbnN0LlRPT0xUSVBfRElSRUNUSU9OX0ZPUldPUkQpIHtcbiAgICAgICAgICAgIHRvcCArPSByYW5nZS5zdGFydDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRvcCArPSByYW5nZS5lbmQgLSBkaW1lbnNpb24uaGVpZ2h0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsZWZ0OiAocGFyYW1zLnNpemUgLSBkaW1lbnNpb24ud2lkdGgpIC8gMiArIGNoYXJ0Q29uc3QuU0VSSUVTX0VYUEFORF9TSVpFLFxuICAgICAgICAgICAgdG9wOiB0b3BcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gY2FsY3VsYXRlIHBvc2l0aW9uLlxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gZGltZW5zaW9uIGRpbWVuc2lvblxuICAgICAqIEBwYXJhbSB7e2luZGV4OiBudW1iZXIsIHJhbmdlOiB7c3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXJ9LFxuICAgICAqICAgICAgICAgIHNpemU6IG51bWJlciwgZGlyZWN0aW9uOiBzdHJpbmcsIGlzVmVydGljYWw6IGJvb2xlYW5cbiAgICAgKiAgICAgICAgfX0gcGFyYW1zIGNvb3JkaW5hdGUgZXZlbnQgcGFyYW1ldGVyc1xuICAgICAqIEByZXR1cm5zIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IHBvc2l0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2FsY3VsYXRlVG9vbHRpcFBvc2l0aW9uOiBmdW5jdGlvbihkaW1lbnNpb24sIHBhcmFtcykge1xuICAgICAgICB2YXIgcG9zaXRpb247XG4gICAgICAgIGlmIChwYXJhbXMuaXNWZXJ0aWNhbCkge1xuICAgICAgICAgICAgcG9zaXRpb24gPSB0aGlzLl9jYWxjdWxhdGVWZXJ0aWNhbFBvc2l0aW9uKGRpbWVuc2lvbiwgcGFyYW1zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBvc2l0aW9uID0gdGhpcy5fY2FsY3VsYXRlSG9yaXpvbnRhbFBvc2l0aW9uKGRpbWVuc2lvbiwgcGFyYW1zKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcG9zaXRpb247XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSB0b29sdGlwIGVsZW1lbnQuXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSB0b29sdGlwIGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jcmVhdGVUb29sdGlwU2VjdG9yRWxlbWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBlbFRvb2x0aXBCbG9jaztcbiAgICAgICAgaWYgKCF0aGlzLmVsTGF5b3V0LmNoaWxkTm9kZXMubGVuZ3RoIDwgMikge1xuICAgICAgICAgICAgZWxUb29sdGlwQmxvY2sgPSBkb20uY3JlYXRlKCdESVYnLCAndHVpLWNoYXJ0LWdyb3VwLXRvb2x0aXAtc2VjdG9yJyk7XG4gICAgICAgICAgICBkb20uYXBwZW5kKHRoaXMuZWxMYXlvdXQsIGVsVG9vbHRpcEJsb2NrKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsVG9vbHRpcEJsb2NrID0gdGhpcy5lbExheW91dC5sYXN0Q2hpbGQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVsVG9vbHRpcEJsb2NrO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdG9vbHRpcCBzZWN0b3IgZWxlbWVudC5cbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHNlY3RvciBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0VG9vbHRpcFNlY3RvckVsZW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXRoaXMuZWxUb29sdGlwQmxvY2spIHtcbiAgICAgICAgICAgIHRoaXMuZWxUb29sdGlwQmxvY2sgPSB0aGlzLl9jcmVhdGVUb29sdGlwU2VjdG9yRWxlbWVudCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmVsVG9vbHRpcEJsb2NrO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGJvdW5kIGFib3V0IHRvb2x0aXAgc2VjdG9yIG9mIHZlcnRpY2FsIHR5cGUgY2hhcnQuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodCBoZWlnaHRcbiAgICAgKiBAcGFyYW0ge3tzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcn19IHJhbmdlIHJhbmdlXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpc0xpbmUgd2hldGhlciBsaW5lIG9yIG5vdFxuICAgICAqIEByZXR1cm5zIHt7ZGltZW5zaW9uOiB7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9LCBwb3NpdGlvbjoge2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fX0gYm91bmRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlVmVydGljYWxUb29sdGlwU2VjdG9yQm91bmQ6IGZ1bmN0aW9uKGhlaWdodCwgcmFuZ2UsIGlzTGluZSkge1xuICAgICAgICB2YXIgd2lkdGgsIG1vdmVMZWZ0O1xuICAgICAgICBpZiAoaXNMaW5lKSB7XG4gICAgICAgICAgICB3aWR0aCA9IDE7XG4gICAgICAgICAgICBoZWlnaHQgKz0gNjtcbiAgICAgICAgICAgIG1vdmVMZWZ0ID0gMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHdpZHRoID0gcmFuZ2UuZW5kIC0gcmFuZ2Uuc3RhcnQgKyAxO1xuICAgICAgICAgICAgbW92ZUxlZnQgPSAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkaW1lbnNpb246IHtcbiAgICAgICAgICAgICAgICB3aWR0aDogd2lkdGgsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBoZWlnaHRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgIGxlZnQ6IHJhbmdlLnN0YXJ0ICsgY2hhcnRDb25zdC5TRVJJRVNfRVhQQU5EX1NJWkUgLSBtb3ZlTGVmdCxcbiAgICAgICAgICAgICAgICB0b3A6IDBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBib3VuZCBhYm91dCB0b29sdGlwIHNlY3RvciBvZiBob3Jpem9udGFsIHR5cGUgY2hhcnQuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoIHdpZHRoXG4gICAgICogQHBhcmFtIHt7c3RhcnQ6IG51bWJlciwgZW5kOm51bWJlcn19IHJhbmdlIHJhbmdlXG4gICAgICogQHJldHVybnMge3tkaW1lbnNpb246IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn0sIHBvc2l0aW9uOiB7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19fSBib3VuZFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VIb3Jpem9udGFsVG9vbHRpcFNlY3RvckJvdW5kOiBmdW5jdGlvbih3aWR0aCwgcmFuZ2UpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRpbWVuc2lvbjoge1xuICAgICAgICAgICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IHJhbmdlLmVuZCAtIHJhbmdlLnN0YXJ0ICsgMVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgbGVmdDogY2hhcnRDb25zdC5TRVJJRVNfRVhQQU5EX1NJWkUsXG4gICAgICAgICAgICAgICAgdG9wOiByYW5nZS5zdGFydFxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGJvdW5kIGFib3V0IHRvb2x0aXAgc2VjdG9yLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzaXplIHdpZHRoIG9yIGhlaWdodFxuICAgICAqIEBwYXJhbSB7e3N0YXJ0OiBudW1iZXIsIGVuZDpudW1iZXJ9fSByYW5nZSByYW5nZVxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNWZXJ0aWNhbCB3aGV0aGVyIHZlcnRpY2FsIG9yIG5vdFxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNMaW5lIHdoZXRoZXIgbGluZSB0eXBlIG9yIG5vdFxuICAgICAqIEByZXR1cm5zIHt7ZGltZW5zaW9uOiB7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9LCBwb3NpdGlvbjoge2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fX0gYm91bmRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlVG9vbHRpcFNlY3RvckJvdW5kOiBmdW5jdGlvbihzaXplLCByYW5nZSwgaXNWZXJ0aWNhbCwgaXNMaW5lKSB7XG4gICAgICAgIHZhciBib3VuZDtcbiAgICAgICAgaWYgKGlzVmVydGljYWwpIHtcbiAgICAgICAgICAgIGJvdW5kID0gdGhpcy5fbWFrZVZlcnRpY2FsVG9vbHRpcFNlY3RvckJvdW5kKHNpemUsIHJhbmdlLCBpc0xpbmUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYm91bmQgPSB0aGlzLl9tYWtlSG9yaXpvbnRhbFRvb2x0aXBTZWN0b3JCb3VuZChzaXplLCByYW5nZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJvdW5kO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTaG93IHRvb2x0aXAgc2VjdG9yLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzaXplIHdpZHRoIG9yIGhlaWdodFxuICAgICAqIEBwYXJhbSB7e3N0YXJ0OiBudW1iZXIsIGVuZDpudW1iZXJ9fSByYW5nZSByYW5nZVxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNWZXJ0aWNhbCB3aGV0aGVyIHZlcnRpY2FsIG9yIG5vdFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBpbmRleFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3Nob3dUb29sdGlwU2VjdG9yOiBmdW5jdGlvbihzaXplLCByYW5nZSwgaXNWZXJ0aWNhbCwgaW5kZXgpIHtcbiAgICAgICAgdmFyIGVsVG9vbHRpcEJsb2NrID0gdGhpcy5fZ2V0VG9vbHRpcFNlY3RvckVsZW1lbnQoKSxcbiAgICAgICAgICAgIGlzTGluZSA9IChyYW5nZS5zdGFydCA9PT0gcmFuZ2UuZW5kKSxcbiAgICAgICAgICAgIGJvdW5kID0gdGhpcy5fbWFrZVRvb2x0aXBTZWN0b3JCb3VuZChzaXplLCByYW5nZSwgaXNWZXJ0aWNhbCwgaXNMaW5lKTtcbiAgICAgICAgaWYgKGlzTGluZSkge1xuICAgICAgICAgICAgdGhpcy5maXJlKCdzaG93R3JvdXBBbmltYXRpb24nLCBpbmRleCwgYm91bmQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJEaW1lbnNpb24oZWxUb29sdGlwQmxvY2ssIGJvdW5kLmRpbWVuc2lvbik7XG4gICAgICAgICAgICByZW5kZXJVdGlsLnJlbmRlclBvc2l0aW9uKGVsVG9vbHRpcEJsb2NrLCBib3VuZC5wb3NpdGlvbik7XG4gICAgICAgICAgICBkb20uYWRkQ2xhc3MoZWxUb29sdGlwQmxvY2ssICdzaG93Jyk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSGlkZSB0b29sdGlwIHNlY3Rvci5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggaW5kZXhcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9oaWRlVG9vbHRpcFNlY3RvcjogZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgdmFyIGVsVG9vbHRpcEJsb2NrID0gdGhpcy5fZ2V0VG9vbHRpcFNlY3RvckVsZW1lbnQoKTtcbiAgICAgICAgZG9tLnJlbW92ZUNsYXNzKGVsVG9vbHRpcEJsb2NrLCAnc2hvdycpO1xuICAgICAgICB0aGlzLmZpcmUoJ2hpZGVHcm91cEFuaW1hdGlvbicsIGluZGV4KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2hvdyB0b29sdGlwLlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsVG9vbHRpcCB0b29sdGlwIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3tpbmRleDogbnVtYmVyLCByYW5nZToge3N0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyfSxcbiAgICAgKiAgICAgICAgICBzaXplOiBudW1iZXIsIGRpcmVjdGlvbjogc3RyaW5nLCBpc1ZlcnRpY2FsOiBib29sZWFuXG4gICAgICogICAgICAgIH19IHBhcmFtcyBjb29yZGluYXRlIGV2ZW50IHBhcmFtZXRlcnNcbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gcHJldlBvc2l0aW9uIHByZXYgcG9zaXRpb25cbiAgICAgKi9cbiAgICBzaG93VG9vbHRpcDogZnVuY3Rpb24oZWxUb29sdGlwLCBwYXJhbXMsIHByZXZQb3NpdGlvbikge1xuICAgICAgICB2YXIgZGltZW5zaW9uLCBwb3NpdGlvbjtcblxuICAgICAgICBpZiAoIXR1aS51dGlsLmlzVW5kZWZpbmVkKHRoaXMucHJldkluZGV4KSkge1xuICAgICAgICAgICAgdGhpcy5maXJlKCdoaWRlR3JvdXBBbmltYXRpb24nLCB0aGlzLnByZXZJbmRleCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxUb29sdGlwLmlubmVySFRNTCA9IHRoaXMuX21ha2VUb29sdGlwSHRtbChwYXJhbXMuaW5kZXgpO1xuICAgICAgICBkb20uYWRkQ2xhc3MoZWxUb29sdGlwLCAnc2hvdycpO1xuXG4gICAgICAgIHRoaXMuX3Nob3dUb29sdGlwU2VjdG9yKHBhcmFtcy5zaXplLCBwYXJhbXMucmFuZ2UsIHBhcmFtcy5pc1ZlcnRpY2FsLCBwYXJhbXMuaW5kZXgpO1xuICAgICAgICBkaW1lbnNpb24gPSB0aGlzLmdldFRvb2x0aXBEaW1lbnNpb24oZWxUb29sdGlwKTtcblxuICAgICAgICBwb3NpdGlvbiA9IHRoaXMuX2NhbGN1bGF0ZVRvb2x0aXBQb3NpdGlvbihkaW1lbnNpb24sIHBhcmFtcyk7XG5cbiAgICAgICAgdGhpcy5tb3ZlVG9Qb3NpdGlvbihlbFRvb2x0aXAsIHBvc2l0aW9uLCBwcmV2UG9zaXRpb24pO1xuICAgICAgICB0aGlzLnByZXZJbmRleCA9IHBhcmFtcy5pbmRleDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSGlkZSB0b29sdGlwLlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsVG9vbHRpcCB0b29sdGlwIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggaW5kZXhcbiAgICAgKi9cbiAgICBoaWRlVG9vbHRpcDogZnVuY3Rpb24oZWxUb29sdGlwLCBpbmRleCkge1xuICAgICAgICBkZWxldGUgdGhpcy5wcmV2SW5kZXg7XG4gICAgICAgIHRoaXMuX2hpZGVUb29sdGlwU2VjdG9yKGluZGV4KTtcbiAgICAgICAgdGhpcy5oaWRlQW5pbWF0aW9uKGVsVG9vbHRpcCk7XG4gICAgfVxufSk7XG5cbnR1aS51dGlsLkN1c3RvbUV2ZW50cy5taXhpbihHcm91cFRvb2x0aXApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEdyb3VwVG9vbHRpcDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBUb29sdGlwIGNvbXBvbmVudC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFRvb2x0aXBCYXNlID0gcmVxdWlyZSgnLi90b29sdGlwQmFzZScpLFxuICAgIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuLi9jb25zdCcpLFxuICAgIGRvbSA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZG9tSGFuZGxlcicpLFxuICAgIGV2ZW50ID0gcmVxdWlyZSgnLi4vaGVscGVycy9ldmVudExpc3RlbmVyJyksXG4gICAgdGVtcGxhdGVNYWtlciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvdGVtcGxhdGVNYWtlcicpLFxuICAgIHRvb2x0aXBUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdG9vbHRpcFRlbXBsYXRlJyk7XG5cbnZhciBUb29sdGlwID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoVG9vbHRpcEJhc2UsIC8qKiBAbGVuZHMgVG9vbHRpcC5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIFRvb2x0aXAgY29tcG9uZW50LlxuICAgICAqIEBjb25zdHJ1Y3RzIFRvb2x0aXBcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPG51bWJlcj59IHBhcmFtcy52YWx1ZXMgY29udmVydGVkIHZhbHVlc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheX0gcGFyYW1zLmxhYmVscyBsYWJlbHNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXl9IHBhcmFtcy5sZWdlbmRMYWJlbHMgbGVnZW5kIGxhYmVsc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5ib3VuZCBheGlzIGJvdW5kXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIGF4aXMgdGhlbWVcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgVG9vbHRpcEJhc2UuY2FsbCh0aGlzLCBwYXJhbXMpO1xuICAgICAgICB0aGlzLnRwbFRvb2x0aXAgPSB0aGlzLl9nZXRUb29sdGlwVGVtcGxhdGUodGhpcy5vcHRpb25zLnRlbXBsYXRlKTtcbiAgICAgICAgdGhpcy5fc2V0RGVmYXVsdFRvb2x0aXBQb3NpdGlvbk9wdGlvbigpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdG9vbHRpcCB0ZW1wbGF0ZS5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uVGVtcGxhdGUgdGVtcGxhdGUgb3B0aW9uXG4gICAgICogQHJldHVybnMge29iamVjdH0gdGVtcGxhdGVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRUb29sdGlwVGVtcGxhdGU6IGZ1bmN0aW9uKG9wdGlvblRlbXBsYXRlKSB7XG4gICAgICAgIHJldHVybiBvcHRpb25UZW1wbGF0ZSA/IHRlbXBsYXRlTWFrZXIudGVtcGxhdGUob3B0aW9uVGVtcGxhdGUpIDogdG9vbHRpcFRlbXBsYXRlLnRwbERlZmF1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBkZWZhdWx0IHBvc2l0aW9uIG9wdGlvbiBvZiB0b29sdGlwLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldERlZmF1bHRUb29sdGlwUG9zaXRpb25PcHRpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnBvc2l0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5pc1ZlcnRpY2FsKSB7XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMucG9zaXRpb24gPSBjaGFydENvbnN0LlRPT0xUSVBfREVGQVVMVF9QT1NJVElPTl9PUFRJT047XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMucG9zaXRpb24gPSBjaGFydENvbnN0LlRPT0xUSVBfREVGQVVMVF9IT1JJWk9OVEFMX1BPU0lUSU9OX09QVElPTjtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgdG9vbHRpcC5cbiAgICAgKiBAcGFyYW0ge3twb3NpdGlvbjogb2JqZWN0fX0gYm91bmQgdG9vbHRpcCBib3VuZFxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gdG9vbHRpcCBlbGVtZW50XG4gICAgICovXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGVsID0gVG9vbHRpcEJhc2UucHJvdG90eXBlLnJlbmRlci5jYWxsKHRoaXMpO1xuICAgICAgICB0aGlzLmF0dGFjaEV2ZW50KGVsKTtcbiAgICAgICAgcmV0dXJuIGVsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHRvb2x0aXAgZGF0YS5cbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPG9iamVjdD59IHRvb2x0aXAgZGF0YVxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIG1ha2VUb29sdGlwRGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBsYWJlbHMgPSB0aGlzLmxhYmVscyxcbiAgICAgICAgICAgIGdyb3VwVmFsdWVzID0gdGhpcy52YWx1ZXMsXG4gICAgICAgICAgICBsZWdlbmRMYWJlbHMgPSB0aGlzLmxlZ2VuZExhYmVscztcblxuICAgICAgICByZXR1cm4gdHVpLnV0aWwubWFwKGdyb3VwVmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMsIGdyb3VwSW5kZXgpIHtcbiAgICAgICAgICAgIHJldHVybiB0dWkudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeTogbGFiZWxzID8gbGFiZWxzW2dyb3VwSW5kZXhdIDogJycsXG4gICAgICAgICAgICAgICAgICAgIGxlZ2VuZDogbGVnZW5kTGFiZWxzW2luZGV4XSxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmlyZSBjdXN0b20gZXZlbnQgc2hvd0FuaW1hdGlvbi5cbiAgICAgKiBAcGFyYW0ge3tncm91cEluZGV4OiBudW1iZXIsIGluZGV4OiBudW1iZXJ9fSBpbmRleGVzIGluZGV4ZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9maXJlU2hvd0FuaW1hdGlvbjogZnVuY3Rpb24oaW5kZXhlcykge1xuICAgICAgICB0aGlzLmZpcmUoJ3Nob3dBbmltYXRpb24nLCBpbmRleGVzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmlyZSBjdXN0b20gZXZlbnQgaGlkZUFuaW1hdGlvbi5cbiAgICAgKiBAcGFyYW0ge3tncm91cEluZGV4OiBudW1iZXIsIGluZGV4OiBudW1iZXJ9fSBpbmRleGVzIGluZGV4ZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9maXJlSGlkZUFuaW1hdGlvbjogZnVuY3Rpb24oaW5kZXhlcykge1xuICAgICAgICB0aGlzLmZpcmUoJ2hpZGVBbmltYXRpb24nLCBpbmRleGVzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGRhdGEgaW5kZXhlcy5cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbFRvb2x0aXAgdG9vbHRpcCBlbGVtZW50XG4gICAgICogQHBhcmFtIHt7Z3JvdXBJbmRleDogbnVtYmVyLCBpbmRleDpudW1iZXJ9fSBpbmRleGVzIGluZGV4ZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRJbmRleGVzQ3VzdG9tQXR0cmlidXRlOiBmdW5jdGlvbihlbFRvb2x0aXAsIGluZGV4ZXMpIHtcbiAgICAgICAgZWxUb29sdGlwLnNldEF0dHJpYnV0ZSgnZGF0YS1ncm91cEluZGV4JywgaW5kZXhlcy5ncm91cEluZGV4KTtcbiAgICAgICAgZWxUb29sdGlwLnNldEF0dHJpYnV0ZSgnZGF0YS1pbmRleCcsIGluZGV4ZXMuaW5kZXgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgZGF0YSBpbmRleGVzXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxUb29sdGlwIHRvb2x0aXAgZWxlbWVudFxuICAgICAqIEByZXR1cm5zIHt7Z3JvdXBJbmRleDogbnVtYmVyLCBpbmRleDogbnVtYmVyfX0gaW5kZXhlc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldEluZGV4ZXNDdXN0b21BdHRyaWJ1dGU6IGZ1bmN0aW9uKGVsVG9vbHRpcCkge1xuICAgICAgICB2YXIgZ3JvdXBJbmRleCA9IGVsVG9vbHRpcC5nZXRBdHRyaWJ1dGUoJ2RhdGEtZ3JvdXBJbmRleCcpLFxuICAgICAgICAgICAgaW5kZXggPSBlbFRvb2x0aXAuZ2V0QXR0cmlidXRlKCdkYXRhLWluZGV4JyksXG4gICAgICAgICAgICBpbmRleGVzO1xuICAgICAgICBpZiAoZ3JvdXBJbmRleCAmJiBpbmRleCkge1xuICAgICAgICAgICAgaW5kZXhlcyA9IHtcbiAgICAgICAgICAgICAgICBncm91cEluZGV4OiBwYXJzZUludChncm91cEluZGV4LCAxMCksXG4gICAgICAgICAgICAgICAgaW5kZXg6IHBhcnNlSW50KGluZGV4LCAxMClcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGluZGV4ZXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBzaG93ZWQgY3VzdG9tIGF0dHJpYnV0ZS5cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbFRvb2x0aXAgdG9vbHRpcCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtib29sZWFufSBzdGF0dXMgd2hldGhlciBzaG93ZWQgb3Igbm90XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0U2hvd2VkQ3VzdG9tQXR0cmlidXRlOiBmdW5jdGlvbihlbFRvb2x0aXAsIHN0YXR1cykge1xuICAgICAgICBlbFRvb2x0aXAuc2V0QXR0cmlidXRlKCdkYXRhLXNob3dlZCcsIHN0YXR1cyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgc2hvd2VkIHRvb2x0aXAgb3Igbm90LlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsVG9vbHRpcCB0b29sdGlwIGVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gd2hldGhlciBzaG93ZWQgdG9vbHRpcCBvciBub3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc1Nob3dlZFRvb2x0aXA6IGZ1bmN0aW9uKGVsVG9vbHRpcCkge1xuICAgICAgICByZXR1cm4gZWxUb29sdGlwLmdldEF0dHJpYnV0ZSgnZGF0YS1zaG93ZWQnKSA9PT0gJ3RydWUnO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBPbiBtb3VzZW92ZXIgZXZlbnQgaGFuZGxlciBmb3IgdG9vbHRpcCBhcmVhXG4gICAgICogQHBhcmFtIHtNb3VzZUV2ZW50fSBlIG1vdXNlIGV2ZW50XG4gICAgICovXG4gICAgb25Nb3VzZW92ZXI6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIGVsVGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50LFxuICAgICAgICAgICAgaW5kZXhlcztcblxuICAgICAgICBpZiAoIWRvbS5oYXNDbGFzcyhlbFRhcmdldCwgY2hhcnRDb25zdC5UT09MVElQX1BSRUZJWCkpIHtcbiAgICAgICAgICAgIGVsVGFyZ2V0ID0gZG9tLmZpbmRQYXJlbnRCeUNsYXNzKGVsVGFyZ2V0LCBjaGFydENvbnN0LlRPT0xUSVBfUFJFRklYKTtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgaWYgKGVsVGFyZ2V0LmlkICE9PSB0aGlzLl9nZXRUb29sdGlwSWQoKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaW5kZXhlcyA9IHRoaXMuX2dldEluZGV4ZXNDdXN0b21BdHRyaWJ1dGUoZWxUYXJnZXQpO1xuXG4gICAgICAgIHRoaXMuX3NldFNob3dlZEN1c3RvbUF0dHJpYnV0ZShlbFRhcmdldCwgdHJ1ZSk7XG5cbiAgICAgICAgdGhpcy5fZmlyZVNob3dBbmltYXRpb24oaW5kZXhlcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE9uIG1vdXNlb3V0IGV2ZW50IGhhbmRsZXIgZm9yIHRvb2x0aXAgYXJlYVxuICAgICAqIEBwYXJhbSB7TW91c2VFdmVudH0gZSBtb3VzZSBldmVudFxuICAgICAqL1xuICAgIG9uTW91c2VvdXQ6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIGVsVGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O1xuXG5cbiAgICAgICAgaWYgKCFkb20uaGFzQ2xhc3MoZWxUYXJnZXQsIGNoYXJ0Q29uc3QuVE9PTFRJUF9QUkVGSVgpKSB7XG4gICAgICAgICAgICBlbFRhcmdldCA9IGRvbS5maW5kUGFyZW50QnlDbGFzcyhlbFRhcmdldCwgY2hhcnRDb25zdC5UT09MVElQX1BSRUZJWCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZWxUYXJnZXQuaWQgIT09IHRoaXMuX2dldFRvb2x0aXBJZCgpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmhpZGVUb29sdGlwKGVsVGFyZ2V0KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gY2FsY3VsYXRlIHRvb2x0aXAgcG9zaXRpb24gYWJvdW50IHBpZSBjaGFydC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBwYXJhbXMuYm91bmQgYm91bmRcbiAgICAgKiAgICAgIEBwYXJhbSB7e2NsaWVudFg6IG51bWJlciwgY2xpZW50WTogbnVtYmVyfX0gcGFyYW1zLmV2ZW50UG9zaXRpb24gbW91c2UgcG9zaXRpb25cbiAgICAgKiBAcmV0dXJucyB7e3RvcDogbnVtYmVyLCBsZWZ0OiBudW1iZXJ9fSBwb3NpdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NhbGN1bGF0ZVRvb2x0aXBQb3NpdGlvbkFib3V0UGllQ2hhcnQ6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICBwYXJhbXMuYm91bmQubGVmdCA9IHBhcmFtcy5ldmVudFBvc2l0aW9uLmNsaWVudFggLSB0aGlzLnNlcmllc1Bvc2l0aW9uLmxlZnQ7XG4gICAgICAgIHBhcmFtcy5ib3VuZC50b3AgPSBwYXJhbXMuZXZlbnRQb3NpdGlvbi5jbGllbnRZIC0gdGhpcy5zZXJpZXNQb3NpdGlvbi50b3A7XG4gICAgICAgIHJldHVybiB0aGlzLl9jYWxjdWxhdGVUb29sdGlwUG9zaXRpb25BYm91dE5vdEJhckNoYXJ0KHBhcmFtcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIGNhbGN1bGF0ZSB0b29sdGlwIHBvc2l0aW9uIGFib3V0IG5vdCBiYXIgY2hhcnQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge3tib3VuZDogb2JqZWN0fX0gcGFyYW1zLmRhdGEgZ3JhcGggaW5mb3JtYXRpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gcGFyYW1zLmRpbWVuc2lvbiB0b29sdGlwIGRpbWVuc2lvblxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5wb3NpdGlvbk9wdGlvbiBwb3NpdGlvbiBvcHRpb24gKGV4OiAnbGVmdCB0b3AnKVxuICAgICAqIEByZXR1cm5zIHt7dG9wOiBudW1iZXIsIGxlZnQ6IG51bWJlcn19IHBvc2l0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2FsY3VsYXRlVG9vbHRpcFBvc2l0aW9uQWJvdXROb3RCYXJDaGFydDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBib3VuZCA9IHBhcmFtcy5ib3VuZCxcbiAgICAgICAgICAgIGFkZFBvc2l0aW9uID0gcGFyYW1zLmFkZFBvc2l0aW9uLFxuICAgICAgICAgICAgbWludXNXaWR0aCA9IHBhcmFtcy5kaW1lbnNpb24ud2lkdGggLSAoYm91bmQud2lkdGggfHwgMCksXG4gICAgICAgICAgICBsaW5lR2FwID0gYm91bmQud2lkdGggPyAwIDogY2hhcnRDb25zdC5UT09MVElQX0dBUCxcbiAgICAgICAgICAgIHBvc2l0aW9uT3B0aW9uID0gcGFyYW1zLnBvc2l0aW9uT3B0aW9uIHx8ICcnLFxuICAgICAgICAgICAgdG9vbHRpcEhlaWdodCA9IHBhcmFtcy5kaW1lbnNpb24uaGVpZ2h0LFxuICAgICAgICAgICAgcmVzdWx0ID0ge307XG4gICAgICAgIHJlc3VsdC5sZWZ0ID0gYm91bmQubGVmdCArIGFkZFBvc2l0aW9uLmxlZnQ7XG4gICAgICAgIHJlc3VsdC50b3AgPSBib3VuZC50b3AgLSB0b29sdGlwSGVpZ2h0ICsgYWRkUG9zaXRpb24udG9wO1xuXG4gICAgICAgIGlmIChwb3NpdGlvbk9wdGlvbi5pbmRleE9mKCdsZWZ0JykgPiAtMSkge1xuICAgICAgICAgICAgcmVzdWx0LmxlZnQgLT0gbWludXNXaWR0aCArIGxpbmVHYXA7XG4gICAgICAgIH0gZWxzZSBpZiAocG9zaXRpb25PcHRpb24uaW5kZXhPZignY2VudGVyJykgPiAtMSkge1xuICAgICAgICAgICAgcmVzdWx0LmxlZnQgLT0gbWludXNXaWR0aCAvIDI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQubGVmdCArPSBsaW5lR2FwO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBvc2l0aW9uT3B0aW9uLmluZGV4T2YoJ2JvdHRvbScpID4gLTEpIHtcbiAgICAgICAgICAgIHJlc3VsdC50b3AgKz0gdG9vbHRpcEhlaWdodCArIGxpbmVHYXA7XG4gICAgICAgIH0gZWxzZSBpZiAocG9zaXRpb25PcHRpb24uaW5kZXhPZignbWlkZGxlJykgPiAtMSkge1xuICAgICAgICAgICAgcmVzdWx0LnRvcCArPSB0b29sdGlwSGVpZ2h0IC8gMjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdC50b3AgLT0gY2hhcnRDb25zdC5UT09MVElQX0dBUDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIGNhbGN1bGF0ZSB0b29sdGlwIHBvc2l0aW9uIGFib3V0IGJhciBjaGFydC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7e2JvdW5kOiBvYmplY3R9fSBwYXJhbXMuZGF0YSBncmFwaCBpbmZvcm1hdGlvblxuICAgICAqICAgICAgQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBwYXJhbXMuZGltZW5zaW9uIHRvb2x0aXAgZGltZW5zaW9uXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLnBvc2l0aW9uT3B0aW9uIHBvc2l0aW9uIG9wdGlvbiAoZXg6ICdsZWZ0IHRvcCcpXG4gICAgICogQHJldHVybnMge3t0b3A6IG51bWJlciwgbGVmdDogbnVtYmVyfX0gcG9zaXRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jYWxjdWxhdGVUb29sdGlwUG9zaXRpb25BYm91dEJhckNoYXJ0OiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGJvdW5kID0gcGFyYW1zLmJvdW5kLFxuICAgICAgICAgICAgYWRkUG9zaXRpb24gPSBwYXJhbXMuYWRkUG9zaXRpb24sXG4gICAgICAgICAgICBtaW51c0hlaWdodCA9IHBhcmFtcy5kaW1lbnNpb24uaGVpZ2h0IC0gKGJvdW5kLmhlaWdodCB8fCAwKSxcbiAgICAgICAgICAgIHBvc2l0aW9uT3B0aW9uID0gcGFyYW1zLnBvc2l0aW9uT3B0aW9uIHx8ICcnLFxuICAgICAgICAgICAgdG9vbHRpcFdpZHRoID0gcGFyYW1zLmRpbWVuc2lvbi53aWR0aCxcbiAgICAgICAgICAgIHJlc3VsdCA9IHt9O1xuXG4gICAgICAgIHJlc3VsdC5sZWZ0ID0gYm91bmQubGVmdCArIGJvdW5kLndpZHRoICsgYWRkUG9zaXRpb24ubGVmdDtcbiAgICAgICAgcmVzdWx0LnRvcCA9IGJvdW5kLnRvcCArIGFkZFBvc2l0aW9uLnRvcDtcblxuICAgICAgICAvLyBUT0RPIDogcG9zaXRpb25PcHRpb25z7J2EIOqwneyytOuhnCDrp4zrk6TslrTshJwg6rKA7IKs7ZWY64+E66GdIOuzgOqyve2VmOq4sCBleCkgcG9zaXRpb25PcHRpb24ubGVmdCA9IHRydWVcbiAgICAgICAgaWYgKHBvc2l0aW9uT3B0aW9uLmluZGV4T2YoJ2xlZnQnKSA+IC0xKSB7XG4gICAgICAgICAgICByZXN1bHQubGVmdCAtPSB0b29sdGlwV2lkdGg7XG4gICAgICAgIH0gZWxzZSBpZiAocG9zaXRpb25PcHRpb24uaW5kZXhPZignY2VudGVyJykgPiAtMSkge1xuICAgICAgICAgICAgcmVzdWx0LmxlZnQgLT0gdG9vbHRpcFdpZHRoIC8gMjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdC5sZWZ0ICs9IGNoYXJ0Q29uc3QuVE9PTFRJUF9HQVA7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocG9zaXRpb25PcHRpb24uaW5kZXhPZigndG9wJykgPiAtMSkge1xuICAgICAgICAgICAgcmVzdWx0LnRvcCAtPSBtaW51c0hlaWdodDtcbiAgICAgICAgfSBlbHNlIGlmIChwb3NpdGlvbk9wdGlvbi5pbmRleE9mKCdtaWRkbGUnKSA+IC0xKSB7XG4gICAgICAgICAgICByZXN1bHQudG9wIC09IG1pbnVzSGVpZ2h0IC8gMjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGN1bGF0ZSB0b29sdGlwIHBvc2l0aW9uLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBwYXJhbXMuYm91bmQgZ3JhcGggYm91bmRcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMuY2hhcnRUeXBlIGNoYXJ0IHR5cGVcbiAgICAgKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gcGFyYW1zLmFsbG93TmVnYXRpdmVUb29sdGlwIHdoZXRoZXIgYWxsb3cgbmVnYXRpdmUgdG9vbHRpcCBvciBub3RcbiAgICAgKiAgICAgIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gcGFyYW1zLmRpbWVuc2lvbiB0b29sdGlwIGRpbWVuc2lvblxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5wb3NpdGlvbk9wdGlvbiBwb3NpdGlvbiBvcHRpb24gKGV4OiAnbGVmdCB0b3AnKVxuICAgICAqIEByZXR1cm5zIHt7dG9wOiBudW1iZXIsIGxlZnQ6IG51bWJlcn19IHBvc2l0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2FsY3VsYXRlVG9vbHRpcFBvc2l0aW9uOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHt9LFxuICAgICAgICAgICAgc2l6ZVR5cGUsIHBvc2l0aW9uVHlwZSwgYWRkUGFkZGluZztcblxuICAgICAgICBpZiAocGFyYW1zLmV2ZW50UG9zaXRpb24pIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jYWxjdWxhdGVUb29sdGlwUG9zaXRpb25BYm91dFBpZUNoYXJ0KHBhcmFtcyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGFyYW1zLmNoYXJ0VHlwZSA9PT0gY2hhcnRDb25zdC5DSEFSVF9UWVBFX0JBUikge1xuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5fY2FsY3VsYXRlVG9vbHRpcFBvc2l0aW9uQWJvdXRCYXJDaGFydChwYXJhbXMpO1xuICAgICAgICAgICAgc2l6ZVR5cGUgPSAnd2lkdGgnO1xuICAgICAgICAgICAgcG9zaXRpb25UeXBlID0gJ2xlZnQnO1xuICAgICAgICAgICAgYWRkUGFkZGluZyA9IDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9jYWxjdWxhdGVUb29sdGlwUG9zaXRpb25BYm91dE5vdEJhckNoYXJ0KHBhcmFtcyk7XG4gICAgICAgICAgICBzaXplVHlwZSA9ICdoZWlnaHQnO1xuICAgICAgICAgICAgcG9zaXRpb25UeXBlID0gJ3RvcCc7XG4gICAgICAgICAgICBhZGRQYWRkaW5nID0gLTE7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGFyYW1zLmFsbG93TmVnYXRpdmVUb29sdGlwKSB7XG4gICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9tb3ZlVG9TeW1tZXRyeShyZXN1bHQsIHtcbiAgICAgICAgICAgICAgICBib3VuZDogcGFyYW1zLmJvdW5kLFxuICAgICAgICAgICAgICAgIGluZGV4ZXM6IHBhcmFtcy5pbmRleGVzLFxuICAgICAgICAgICAgICAgIGRpbWVuc2lvbjogcGFyYW1zLmRpbWVuc2lvbixcbiAgICAgICAgICAgICAgICBzaXplVHlwZTogc2l6ZVR5cGUsXG4gICAgICAgICAgICAgICAgcG9zaXRpb25UeXBlOiBwb3NpdGlvblR5cGUsXG4gICAgICAgICAgICAgICAgYWRkUGFkZGluZzogYWRkUGFkZGluZ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHZhbHVlIGJ5IGluZGV4ZXMuXG4gICAgICogQHBhcmFtIHt7Z3JvdXBJbmRleDogbnVtYmVyLCBpbmRleDogbnVtYmVyfX0gaW5kZXhlcyBpbmRleGVzXG4gICAgICogQHJldHVybnMgeyhzdHJpbmcgfCBudW1iZXIpfSB2YWx1ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFZhbHVlQnlJbmRleGVzOiBmdW5jdGlvbihpbmRleGVzKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnZhbHVlc1tpbmRleGVzLmdyb3VwSW5kZXhdW2luZGV4ZXMuaW5kZXhdO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBNb3ZlIHRvIHN5bW1ldHJ5LlxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBwb3NpdGlvbiB0b29sdGlwIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IHBhcmFtcy5ib3VuZCBncmFwaCBib3VuZFxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5pZCB0b29sdGlwIGlkXG4gICAgICogICAgICBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IHBhcmFtcy5kaW1lbnNpb24gdG9vbHRpcCBkaW1lbnNpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMuc2l6ZVR5cGUgc2l6ZSB0eXBlICh3aWR0aCBvciBoZWlnaHQpXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLnBvc2l0aW9uVHlwZSBwb3NpdGlvbiB0eXBlIChsZWZ0IG9yIHRvcClcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuYWRkUGFkZGluZyBhZGQgcGFkZGluZ1xuICAgICAqIEByZXR1cm5zIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IG1vdmVkIHBvc2l0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbW92ZVRvU3ltbWV0cnk6IGZ1bmN0aW9uKHBvc2l0aW9uLCBwYXJhbXMpIHtcbiAgICAgICAgdmFyIGJvdW5kID0gcGFyYW1zLmJvdW5kLFxuICAgICAgICAgICAgc2l6ZVR5cGUgPSBwYXJhbXMuc2l6ZVR5cGUsXG4gICAgICAgICAgICBwb3NpdGlvblR5cGUgPSBwYXJhbXMucG9zaXRpb25UeXBlLFxuICAgICAgICAgICAgdmFsdWUgPSB0aGlzLl9nZXRWYWx1ZUJ5SW5kZXhlcyhwYXJhbXMuaW5kZXhlcyksXG4gICAgICAgICAgICBjZW50ZXI7XG5cbiAgICAgICAgaWYgKHZhbHVlIDwgMCkge1xuICAgICAgICAgICAgY2VudGVyID0gYm91bmRbcG9zaXRpb25UeXBlXSArIChib3VuZFtzaXplVHlwZV0gLyAyKSArIChwYXJhbXMuYWRkUGFkZGluZyB8fCAwKTtcbiAgICAgICAgICAgIHBvc2l0aW9uW3Bvc2l0aW9uVHlwZV0gPSBwb3NpdGlvbltwb3NpdGlvblR5cGVdIC0gKHBvc2l0aW9uW3Bvc2l0aW9uVHlwZV0gLSBjZW50ZXIpICogMiAtIHBhcmFtcy5kaW1lbnNpb25bc2l6ZVR5cGVdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBvc2l0aW9uO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdG9vbHRpcCBpZC5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSB0b29sdGlwIGlkXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0VG9vbHRpcElkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCF0aGlzLnRvb2x0aXBJZCkge1xuICAgICAgICAgICAgdGhpcy50b29sdGlwSWQgPSBjaGFydENvbnN0LlRPT0xUSVBfSURfUFJFRklYICsgJy0nICsgKG5ldyBEYXRlKCkpLmdldFRpbWUoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy50b29sdGlwSWQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgdG9vbHRpcCBodG1sLlxuICAgICAqIEBwYXJhbSB7e2dyb3VwSW5kZXg6IG51bWJlciwgaW5kZXg6IG51bWJlcn19IGluZGV4ZXMgaW5kZXhlc1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IHRvb2x0aXAgaHRtbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VUb29sdGlwSHRtbDogZnVuY3Rpb24oaW5kZXhlcykge1xuICAgICAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YVtpbmRleGVzLmdyb3VwSW5kZXhdW2luZGV4ZXMuaW5kZXhdO1xuICAgICAgICBkYXRhLnN1ZmZpeCA9IHRoaXMuc3VmZml4O1xuICAgICAgICByZXR1cm4gdGhpcy50cGxUb29sdGlwKGRhdGEpO1xuICAgIH0sXG5cbiAgICBfaXNDaGFuZ2VkSW5kZXhlczogZnVuY3Rpb24ocHJldkluZGV4ZXMsIGluZGV4ZXMpIHtcbiAgICAgICAgcmV0dXJuICEhcHJldkluZGV4ZXMgJiYgKHByZXZJbmRleGVzLmdyb3VwSW5kZXggIT09IGluZGV4ZXMuZ3JvdXBJbmRleCB8fCBwcmV2SW5kZXhlcy5pbmRleCAhPT0gaW5kZXhlcy5pbmRleCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNob3cgdG9vbHRpcC5cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbFRvb2x0aXAgdG9vbHRpcCBlbGVtZW50XG4gICAgICogQHBhcmFtIHt7aW5kZXhlczoge2dyb3VwSW5kZXg6IG51bWJlciwgaW5kZXg6IG51bWJlcn0sIGJvdW5kOiBvYmplY3R9fSBwYXJhbXMgdG9vbHRpcCBkYXRhXG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IHByZXZQb3NpdGlvbiBwcmV2IHBvc2l0aW9uXG4gICAgICovXG4gICAgc2hvd1Rvb2x0aXA6IGZ1bmN0aW9uKGVsVG9vbHRpcCwgcGFyYW1zLCBwcmV2UG9zaXRpb24pIHtcbiAgICAgICAgdmFyIGluZGV4ZXMgPSBwYXJhbXMuaW5kZXhlcyxcbiAgICAgICAgICAgIGN1ckluZGV4ZXMgPSB0aGlzLl9nZXRJbmRleGVzQ3VzdG9tQXR0cmlidXRlKGVsVG9vbHRpcCksXG4gICAgICAgICAgICBwb3NpdGlvbjtcblxuICAgICAgICBpZiAoZWxUb29sdGlwLmlkID09PSB0aGlzLl9nZXRUb29sdGlwSWQoKSAmJiB0aGlzLl9pc0NoYW5nZWRJbmRleGVzKGN1ckluZGV4ZXMsIGluZGV4ZXMpKSB7XG4gICAgICAgICAgICB0aGlzLl9maXJlSGlkZUFuaW1hdGlvbihjdXJJbmRleGVzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGVsVG9vbHRpcC5pZCA9IHRoaXMuX2dldFRvb2x0aXBJZCgpO1xuICAgICAgICBlbFRvb2x0aXAuaW5uZXJIVE1MID0gdGhpcy5fbWFrZVRvb2x0aXBIdG1sKGluZGV4ZXMpO1xuXG4gICAgICAgIHRoaXMuX3NldEluZGV4ZXNDdXN0b21BdHRyaWJ1dGUoZWxUb29sdGlwLCBpbmRleGVzKTtcbiAgICAgICAgdGhpcy5fc2V0U2hvd2VkQ3VzdG9tQXR0cmlidXRlKGVsVG9vbHRpcCwgdHJ1ZSk7XG5cbiAgICAgICAgZG9tLmFkZENsYXNzKGVsVG9vbHRpcCwgJ3Nob3cnKTtcblxuICAgICAgICBwb3NpdGlvbiA9IHRoaXMuX2NhbGN1bGF0ZVRvb2x0aXBQb3NpdGlvbih0dWkudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgZGltZW5zaW9uOiB0aGlzLmdldFRvb2x0aXBEaW1lbnNpb24oZWxUb29sdGlwKSxcbiAgICAgICAgICAgIGFkZFBvc2l0aW9uOiB0dWkudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgICAgICAgdG9wOiAwXG4gICAgICAgICAgICB9LCB0aGlzLm9wdGlvbnMuYWRkUG9zaXRpb24pLFxuICAgICAgICAgICAgcG9zaXRpb25PcHRpb246IHRoaXMub3B0aW9ucy5wb3NpdGlvbiB8fCAnJyxcbiAgICAgICAgICAgIGV2ZW50UG9zaXRpb246IHBhcmFtcy5ldmVudFBvc2l0aW9uXG4gICAgICAgIH0sIHBhcmFtcykpO1xuXG4gICAgICAgIHRoaXMubW92ZVRvUG9zaXRpb24oZWxUb29sdGlwLCBwb3NpdGlvbiwgcHJldlBvc2l0aW9uKTtcbiAgICAgICAgdGhpcy5fZmlyZVNob3dBbmltYXRpb24oaW5kZXhlcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhpZGUgdG9vbHRpcC5cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbFRvb2x0aXAgdG9vbHRpcCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgY2FsbGJhY2tcbiAgICAgKi9cbiAgICBoaWRlVG9vbHRpcDogZnVuY3Rpb24oZWxUb29sdGlwKSB7XG4gICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgIGluZGV4ZXMgPSB0aGlzLl9nZXRJbmRleGVzQ3VzdG9tQXR0cmlidXRlKGVsVG9vbHRpcCk7XG4gICAgICAgIHRoaXMuX3NldFNob3dlZEN1c3RvbUF0dHJpYnV0ZShlbFRvb2x0aXAsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5fZmlyZUhpZGVBbmltYXRpb24oaW5kZXhlcyk7XG5cbiAgICAgICAgaWYgKHRoaXMuX2lzQ2hhbmdlZEluZGV4ZXModGhpcy5wcmV2SW5kZXhlcywgaW5kZXhlcykpIHtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnByZXZJbmRleGVzO1xuICAgICAgICB9XG5cbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICh0aGF0Ll9pc1Nob3dlZFRvb2x0aXAoZWxUb29sdGlwKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoYXQuaGlkZUFuaW1hdGlvbihlbFRvb2x0aXApO1xuXG4gICAgICAgICAgICB0aGF0ID0gbnVsbDtcbiAgICAgICAgICAgIGluZGV4ZXMgPSBudWxsO1xuICAgICAgICB9LCBjaGFydENvbnN0LkhJREVfREVMQVkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggZXZlbnRcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqL1xuICAgIGF0dGFjaEV2ZW50OiBmdW5jdGlvbihlbCkge1xuICAgICAgICBldmVudC5iaW5kRXZlbnQoJ21vdXNlb3ZlcicsIGVsLCB0dWkudXRpbC5iaW5kKHRoaXMub25Nb3VzZW92ZXIsIHRoaXMpKTtcbiAgICAgICAgZXZlbnQuYmluZEV2ZW50KCdtb3VzZW91dCcsIGVsLCB0dWkudXRpbC5iaW5kKHRoaXMub25Nb3VzZW91dCwgdGhpcykpO1xuICAgIH1cbn0pO1xuXG50dWkudXRpbC5DdXN0b21FdmVudHMubWl4aW4oVG9vbHRpcCk7XG5cbm1vZHVsZS5leHBvcnRzID0gVG9vbHRpcDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBUb29sdGlwQmFzZSBpcyBiYXNlIGNsYXNzIG9mIHRvb2x0aXAgY29tcG9uZW50cy5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGRvbSA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZG9tSGFuZGxlcicpLFxuICAgIHJlbmRlclV0aWwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3JlbmRlclV0aWwnKTtcblxudmFyIFRvb2x0aXBCYXNlID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBUb29sdGlwQmFzZS5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIFRvb2x0aXBCYXNlIGlzIGJhc2UgY2xhc3Mgb2YgdG9vbHRpcCBjb21wb25lbnRzLlxuICAgICAqIEBjb25zdHJ1Y3RzIFRvb2x0aXBCYXNlXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxudW1iZXI+fSBwYXJhbXMudmFsdWVzIGNvbnZlcnRlZCB2YWx1ZXNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXl9IHBhcmFtcy5sYWJlbHMgbGFiZWxzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5fSBwYXJhbXMubGVnZW5kTGFiZWxzIGxlZ2VuZCBsYWJlbHNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuYm91bmQgYXhpcyBib3VuZFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBheGlzIHRoZW1lXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHR1aS51dGlsLmV4dGVuZCh0aGlzLCBwYXJhbXMpO1xuICAgICAgICAvKipcbiAgICAgICAgICogY2xhc3NOYW1lXG4gICAgICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNsYXNzTmFtZSA9ICd0dWktY2hhcnQtdG9vbHRpcC1hcmVhJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogVG9vbHRpcEJhc2UgY29udGFpbmVyLlxuICAgICAgICAgKiBAdHlwZSB7SFRNTEVsZW1lbnR9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmVsTGF5b3V0ID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogVG9vbHRpcEJhc2UgYmFzZSBkYXRhLlxuICAgICAgICAgKiBAdHlwZSB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZGF0YSA9IHRoaXMubWFrZVRvb2x0aXBEYXRhKCk7XG5cbiAgICAgICAgdGhpcy5zdWZmaXggPSB0aGlzLm9wdGlvbnMuc3VmZml4ID8gJyZuYnNwOycgKyB0aGlzLm9wdGlvbnMuc3VmZml4IDogJyc7XG4gICAgfSxcblxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSB0b29sdGlwIGRhdGEuXG4gICAgICogQGFic3RyYWN0XG4gICAgICovXG4gICAgbWFrZVRvb2x0aXBEYXRhOiBmdW5jdGlvbigpIHt9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHRvb2x0aXAgbGF5b3V0IGVsZW1lbnQuXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSBsYXlvdXQgZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFRvb2x0aXBMYXlvdXRFbGVtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGVsTGF5b3V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5jaGFydElkKTtcbiAgICAgICAgaWYgKCFlbExheW91dCkge1xuICAgICAgICAgICAgZWxMYXlvdXQgPSBkb20uY3JlYXRlKCdESVYnLCB0aGlzLmNsYXNzTmFtZSk7XG4gICAgICAgICAgICBlbExheW91dC5pZCA9IHRoaXMuY2hhcnRJZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZWxMYXlvdXQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciB0b29sdGlwLlxuICAgICAqIEBwYXJhbSB7e3Bvc2l0aW9uOiBvYmplY3R9fSBib3VuZCB0b29sdGlwIGJvdW5kXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSB0b29sdGlwIGVsZW1lbnRcbiAgICAgKi9cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZWwgPSB0aGlzLl9nZXRUb29sdGlwTGF5b3V0RWxlbWVudCgpLFxuICAgICAgICAgICAgYm91bmQgPSB0aGlzLmJvdW5kO1xuXG4gICAgICAgIHJlbmRlclV0aWwucmVuZGVyUG9zaXRpb24oZWwsIGJvdW5kLnBvc2l0aW9uKTtcblxuICAgICAgICB0aGlzLmVsTGF5b3V0ID0gZWw7XG5cbiAgICAgICAgcmV0dXJuIGVsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgdG9vbHRpcCBlbGVtZW50LlxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gdG9vbHRpcCBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY3JlYXRlVG9vbHRpcEVsZW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZWxUb29sdGlwO1xuICAgICAgICBpZiAoIXRoaXMuZWxMYXlvdXQuZmlyc3RDaGlsZCkge1xuICAgICAgICAgICAgZWxUb29sdGlwID0gZG9tLmNyZWF0ZSgnRElWJywgJ3R1aS1jaGFydC10b29sdGlwJyk7XG4gICAgICAgICAgICBkb20uYXBwZW5kKHRoaXMuZWxMYXlvdXQsIGVsVG9vbHRpcCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbFRvb2x0aXAgPSB0aGlzLmVsTGF5b3V0LmZpcnN0Q2hpbGQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVsVG9vbHRpcDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHRvb2x0aXAgZWxlbWVudC5cbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHRvb2x0aXAgZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFRvb2x0aXBFbGVtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCF0aGlzLmVsVG9vbHRpcCkge1xuICAgICAgICAgICAgdGhpcy5lbFRvb2x0aXAgPSB0aGlzLl9jcmVhdGVUb29sdGlwRWxlbWVudCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmVsVG9vbHRpcDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb25TaG93IGlzIGNhbGxiYWNrIG9mIGN1c3RvbSBldmVudCBzaG93VG9vbHRpcCBmb3IgU2VyaWVzVmlldy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIGNvb3JkaW5hdGUgZXZlbnQgcGFyYW1ldGVyc1xuICAgICAqL1xuICAgIG9uU2hvdzogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBlbFRvb2x0aXAgPSB0aGlzLl9nZXRUb29sdGlwRWxlbWVudCgpLFxuICAgICAgICAgICAgcHJldlBvc2l0aW9uO1xuICAgICAgICBpZiAoZWxUb29sdGlwLm9mZnNldFdpZHRoKSB7XG4gICAgICAgICAgICBwcmV2UG9zaXRpb24gPSB7XG4gICAgICAgICAgICAgICAgbGVmdDogZWxUb29sdGlwLm9mZnNldExlZnQsXG4gICAgICAgICAgICAgICAgdG9wOiBlbFRvb2x0aXAub2Zmc2V0VG9wXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zaG93VG9vbHRpcChlbFRvb2x0aXAsIHBhcmFtcywgcHJldlBvc2l0aW9uKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHRvb2x0aXAgZGltZW5zaW9uXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxUb29sdGlwIHRvb2x0aXAgZWxlbWVudFxuICAgICAqIEByZXR1cm5zIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSByZW5kZXJlZCB0b29sdGlwIGRpbWVuc2lvblxuICAgICAqL1xuICAgIGdldFRvb2x0aXBEaW1lbnNpb246IGZ1bmN0aW9uKGVsVG9vbHRpcCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgd2lkdGg6IGVsVG9vbHRpcC5vZmZzZXRXaWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogZWxUb29sdGlwLm9mZnNldEhlaWdodFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYW5jZWwgaGlkZSB0b29sdGlwLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NhbmNlbEhpZGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXRoaXMuYWN0aXZlSGlkZXIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjbGVhckludGVydmFsKHRoaXMuYWN0aXZlSGlkZXIudGltZXJJZCk7XG4gICAgICAgIHRoaXMuYWN0aXZlSGlkZXIuc2V0T3BhY2l0eSgxKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FuY2VsIHNsaWRlIHRvb2x0aXAuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2FuY2VsU2xpZGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXRoaXMuYWN0aXZlU2xpZGVycykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaCh0aGlzLmFjdGl2ZVNsaWRlcnMsIGZ1bmN0aW9uKHNsaWRlcikge1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChzbGlkZXIudGltZXJJZCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuX2NvbXBsZXRlU2xpZGUoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTW92ZSB0byBQb3NpdGlvbi5cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbFRvb2x0aXAgdG9vbHRpcCBlbGVtZW50XG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IHBvc2l0aW9uIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IHByZXZQb3NpdGlvbiBwcmV2IHBvc2l0aW9uXG4gICAgICovXG4gICAgbW92ZVRvUG9zaXRpb246IGZ1bmN0aW9uKGVsVG9vbHRpcCwgcG9zaXRpb24sIHByZXZQb3NpdGlvbikge1xuICAgICAgICBpZiAocHJldlBvc2l0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLl9jYW5jZWxIaWRlKCk7XG4gICAgICAgICAgICB0aGlzLl9jYW5jZWxTbGlkZSgpO1xuICAgICAgICAgICAgdGhpcy5fc2xpZGVUb29sdGlwKGVsVG9vbHRpcCwgcHJldlBvc2l0aW9uLCBwb3NpdGlvbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZW5kZXJVdGlsLnJlbmRlclBvc2l0aW9uKGVsVG9vbHRpcCwgcG9zaXRpb24pO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBzbGlkZXIuXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgc2xpZGUgdHlwZSAoaG9yaXpvbnRhbCBvciB2ZXJ0aWNhbClcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBlZmZlY3Qgb2JqZWN0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0U2xpZGVyOiBmdW5jdGlvbihlbGVtZW50LCB0eXBlKSB7XG4gICAgICAgIGlmICghdGhpcy5zbGlkZXIpIHtcbiAgICAgICAgICAgIHRoaXMuc2xpZGVyID0ge307XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuc2xpZGVyW3R5cGVdKSB7XG4gICAgICAgICAgICB0aGlzLnNsaWRlclt0eXBlXSA9IG5ldyB0dWkuY29tcG9uZW50LkVmZmVjdHMuU2xpZGUoe1xuICAgICAgICAgICAgICAgIGZsb3c6IHR5cGUsXG4gICAgICAgICAgICAgICAgZWxlbWVudDogZWxlbWVudCxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogMTAwXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5zbGlkZXJbdHlwZV07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvbXBsZXRlIHNsaWRlIHRvb2x0aXAuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY29tcGxldGVTbGlkZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLmFjdGl2ZVNsaWRlcnM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNsaWRlIHRvb2x0aXBcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbFRvb2x0aXAgdG9vbHRpcCBlbGVtZW50XG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IHByZXZQb3NpdGlvbiBwcmV2IHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IHBvc2l0aW9uIHBvc2l0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2xpZGVUb29sdGlwOiBmdW5jdGlvbihlbFRvb2x0aXAsIHByZXZQb3NpdGlvbiwgcG9zaXRpb24pIHtcbiAgICAgICAgdmFyIHZTbGlkZXIgPSB0aGlzLl9nZXRTbGlkZXIoZWxUb29sdGlwLCAndmVydGljYWwnKSxcbiAgICAgICAgICAgIGhTbGlkZXIgPSB0aGlzLl9nZXRTbGlkZXIoZWxUb29sdGlwLCAnaG9yaXpvbnRhbCcpLFxuICAgICAgICAgICAgbW92ZVRvcCA9IHByZXZQb3NpdGlvbi50b3AgLSBwb3NpdGlvbi50b3AsXG4gICAgICAgICAgICBtb3ZlTGVmdCA9IHByZXZQb3NpdGlvbi5sZWZ0IC0gcG9zaXRpb24ubGVmdCxcbiAgICAgICAgICAgIHZEaXJlY3Rpb24gPSBtb3ZlVG9wID4gMCA/ICdmb3J3b3JkJyA6ICdiYWNrd29yZCcsXG4gICAgICAgICAgICBoRGlyZWN0aW9uID0gbW92ZVRvcCA+IDAgPyAnZm9yd29yZCcgOiAnYmFja3dvcmQnLFxuICAgICAgICAgICAgYWN0aXZlU2xpZGVycyA9IFtdLFxuICAgICAgICAgICAgY29tcGxhdGUgPSB0dWkudXRpbC5iaW5kKHRoaXMuX2NvbXBsZXRlU2xpZGUsIHRoaXMpO1xuXG4gICAgICAgIGlmIChtb3ZlVG9wKSB7XG4gICAgICAgICAgICB2U2xpZGVyLnNldERpc3RhbmNlKG1vdmVUb3ApO1xuICAgICAgICAgICAgdlNsaWRlci5hY3Rpb24oe1xuICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogdkRpcmVjdGlvbixcbiAgICAgICAgICAgICAgICBzdGFydDogcHJldlBvc2l0aW9uLnRvcCxcbiAgICAgICAgICAgICAgICBjb21wbGV0ZTogY29tcGxhdGVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYWN0aXZlU2xpZGVycy5wdXNoKHZTbGlkZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1vdmVMZWZ0KSB7XG4gICAgICAgICAgICBoU2xpZGVyLnNldERpc3RhbmNlKG1vdmVMZWZ0KTtcbiAgICAgICAgICAgIGhTbGlkZXIuYWN0aW9uKHtcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb246IGhEaXJlY3Rpb24sXG4gICAgICAgICAgICAgICAgc3RhcnQ6IHByZXZQb3NpdGlvbi5sZWZ0LFxuICAgICAgICAgICAgICAgIGNvbXBsZXRlOiBjb21wbGF0ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBhY3RpdmVTbGlkZXJzLnB1c2godlNsaWRlcik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYWN0aXZlU2xpZGVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlU2xpZGVycyA9IGFjdGl2ZVNsaWRlcnM7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb25IaWRlIGlzIGNhbGxiYWNrIG9mIGN1c3RvbSBldmVudCBoaWRlVG9vbHRpcCBmb3IgU2VyaWVzVmlld1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBpbmRleFxuICAgICAqL1xuICAgIG9uSGlkZTogZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgdmFyIGVsVG9vbHRpcCA9IHRoaXMuX2dldFRvb2x0aXBFbGVtZW50KCk7XG4gICAgICAgIHRoaXMuaGlkZVRvb2x0aXAoZWxUb29sdGlwLCBpbmRleCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBoaWRlci5cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IGVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBlZmZlY3Qgb2JqZWN0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0SGlkZXI6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgaWYgKCF0aGlzLmhpZGVyKSB7XG4gICAgICAgICAgICB0aGlzLmhpZGVyID0gbmV3IHR1aS5jb21wb25lbnQuRWZmZWN0cy5GYWRlKHtcbiAgICAgICAgICAgICAgICBlbGVtZW50OiBlbGVtZW50LFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uOiAxMDBcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuaGlkZXI7XG4gICAgfSxcblxuICAgIGhpZGVBbmltYXRpb246IGZ1bmN0aW9uKGVsVG9vbHRpcCkge1xuICAgICAgICB0aGlzLmFjdGl2ZUhpZGVyID0gdGhpcy5fZ2V0SGlkZXIoZWxUb29sdGlwKTtcbiAgICAgICAgdGhpcy5hY3RpdmVIaWRlci5hY3Rpb24oe1xuICAgICAgICAgICAgc3RhcnQ6IDEsXG4gICAgICAgICAgICBlbmQ6IDAsXG4gICAgICAgICAgICBjb21wbGV0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgZG9tLnJlbW92ZUNsYXNzKGVsVG9vbHRpcCwgJ3Nob3cnKTtcbiAgICAgICAgICAgICAgICBlbFRvb2x0aXAuc3R5bGUuY3NzVGV4dCA9ICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxudHVpLnV0aWwuQ3VzdG9tRXZlbnRzLm1peGluKFRvb2x0aXBCYXNlKTtcblxubW9kdWxlLmV4cG9ydHMgPSBUb29sdGlwQmFzZTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBUaGlzIGlzIHRlbXBsYXRlcyBvZiB0b29sdGlwLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxudmFyIHRlbXBsYXRlTWFrZXIgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3RlbXBsYXRlTWFrZXInKTtcblxudmFyIHRhZ3MgPSB7XG4gICAgSFRNTF9ERUZBVUxUX1RFTVBMQVRFOiAnPGRpdiBjbGFzcz1cInR1aS1jaGFydC1kZWZhdWx0LXRvb2x0aXBcIj4nICtcbiAgICAgICAgJzxkaXY+e3sgY2F0ZWdvcnkgfX08L2Rpdj4nICtcbiAgICAgICAgJzxkaXY+JyArXG4gICAgICAgICAgICAnPHNwYW4+e3sgbGVnZW5kIH19PC9zcGFuPjonICtcbiAgICAgICAgICAgICcmbmJzcDs8c3Bhbj57eyB2YWx1ZSB9fTwvc3Bhbj4nICtcbiAgICAgICAgICAgICc8c3Bhbj57eyBzdWZmaXggfX08L3NwYW4+JyArXG4gICAgICAgICc8L2Rpdj4nICtcbiAgICAnPC9kaXY+JyxcbiAgICBIVE1MX0dST1VQOiAnPGRpdiBjbGFzcz1cInR1aS1jaGFydC1kZWZhdWx0LXRvb2x0aXAgdHVpLWNoYXJ0LWdyb3VwLXRvb2x0aXBcIj4nICtcbiAgICAgICAgJzxkaXY+e3sgY2F0ZWdvcnkgfX08L2Rpdj4nICtcbiAgICAgICAgJ3t7IGl0ZW1zIH19JyArXG4gICAgJzwvZGl2PicsXG4gICAgSFRNTF9HUk9VUF9JVEVNOiAnPGRpdj4nICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJ0dWktY2hhcnQtbGVnZW5kLXJlY3Qge3sgY2hhcnRUeXBlIH19XCIgc3R5bGU9XCJ7eyBjc3NUZXh0IH19XCI+PC9kaXY+Jm5ic3A7PHNwYW4+e3sgbGVnZW5kIH19PC9zcGFuPjonICtcbiAgICAgICAgJyZuYnNwOzxzcGFuPnt7IHZhbHVlIH19PC9zcGFuPicgK1xuICAgICAgICAnPHNwYW4+e3sgc3VmZml4IH19PC9zcGFuPicgK1xuICAgICc8L2Rpdj4nLFxuICAgIEdST1VQX0NTU19URVhUOiAnYmFja2dyb3VuZC1jb2xvcjp7eyBjb2xvciB9fSdcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHRwbERlZmF1bHQ6IHRlbXBsYXRlTWFrZXIudGVtcGxhdGUodGFncy5IVE1MX0RFRkFVTFRfVEVNUExBVEUpLFxuICAgIHRwbEdyb3VwOiB0ZW1wbGF0ZU1ha2VyLnRlbXBsYXRlKHRhZ3MuSFRNTF9HUk9VUCksXG4gICAgdHBsR3JvdXBJdGVtOiB0ZW1wbGF0ZU1ha2VyLnRlbXBsYXRlKHRhZ3MuSFRNTF9HUk9VUF9JVEVNKSxcbiAgICB0cGxHcm91cENzc1RleHQ6IHRlbXBsYXRlTWFrZXIudGVtcGxhdGUodGFncy5HUk9VUF9DU1NfVEVYVClcbn07XG4iXX0=
