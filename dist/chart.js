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
                if (this.aligned && data.labels[index] === chartConst.EMPTY_AXIS_LABEL) {
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
 * @fileoverview Chart const
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

/**
 * Chart const
 * @readonly
 * @enum {number}
 */
var chartConst = {
    /** chart id prefix
     * @type {string}
     */
    CHAR_ID_PREFIX: 'tui-chart',
    /** tooltip id prefix
     * @type {string}
     */
    TOOLTIP_ID_PREFIX: 'tui-chart-tooltip',
    /** chart types
     * @type {string}
     */
    CHART_TYPE_BAR: 'bar',
    /** @type {string} */
    CHART_TYPE_COLUMN: 'column',
    /** @type {string} */
    CHART_TYPE_LINE: 'line',
    /** @type {string} */
    CHART_TYPE_AREA: 'area',
    /** @type {string} */
    CHART_TYPE_COMBO: 'combo',
    /** @type {string} */
    CHART_TYPE_PIE: 'pie',
    /** chart padding */
    CHART_PADDING: 10,
    /** chart default width */
    CHART_DEFAULT_WIDTH: 500,
    /** chart default height */
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
    /** default font size of series label */
    DEFAULT_SERIES_LABEL_FONT_SIZE: 11,
    /** @type {string} */
    /** default graph plugin
     * @type {string}
     */
    DEFAULT_PLUGIN: 'raphael',
    /** default tick color
     * @type {string}
     */
    DEFAULT_TICK_COLOR: 'black',
    /** default theme name
     * @type {string}
     */
    DEFAULT_THEME_NAME: 'default',
    /** stacked option types
     * @type {string}
     */
    STACKED_NORMAL_TYPE: 'normal',
    /** @type {string} */
    STACKED_PERCENT_TYPE: 'percent',
    /** empty axis label */
    EMPTY_AXIS_LABEL: '',
    /** angel */
    ANGLE_85: 85,
    ANGLE_90: 90,
    ANGLE_360: 360,
    /** radian */
    RAD: Math.PI / 180,
    /** series legend types
     * @type {string}
     */
    SERIES_LEGEND_TYPE_OUTER: 'outer',
    /** series outer label padding */
    SERIES_OUTER_LABEL_PADDING: 20,
    /** default rate of pie graph */
    PIE_GRAPH_DEFAULT_RATE: 0.8,
    /** small rate of pie graph */
    PIE_GRAPH_SMALL_RATE: 0.65,
    /** yAxis properties
     * @type {array.<string>}
     */
    YAXIS_PROPS: ['tickColor', 'title', 'label'], // yaxis theme의 속성 - chart type filtering할 때 사용됨
    /** series properties
     * @type {array.<string>}
     */
    SERIES_PROPS: ['label', 'colors', 'borderColor', 'singleColors'], // series theme의 속성 - chart type filtering할 때 사용됨
    /** title area width padding */
    TITLE_AREA_WIDTH_PADDING: 20,
    /** top margin of x axis label */
    XAXIS_LABEL_TOP_MARGIN: 10,
    /** right padding of vertical label */
    V_LABEL_RIGHT_PADDING: 10,
    /** tooltip prefix
     * @type {string}
     */
    TOOLTIP_PREFIX: 'tui-chart-tooltip',
    /** minimum pixel type step size */
    MIN_PIXEL_TYPE_STEP_SIZE: 40,
    /** maximum pixel type step size */
    MAX_PIXEL_TYPE_STEP_SIZE: 60,
    /** tick info of percent stacked option
     * @type {object}
     */
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
    /** tooltip direction
     * @type {string}
     */
    TOOLTIP_DIRECTION_FORWORD: 'forword',
    /** @type {string} */
    TOOLTIP_DIRECTION_BACKWORD: 'backword',
    /** tooltip default position option
     * @type {string}
     */
    TOOLTIP_DEFAULT_POSITION_OPTION: 'center top',
    /** @type {string} */
    TOOLTIP_DEFAULT_HORIZONTAL_POSITION_OPTION: 'right middle',
    /** hide delay */
    HIDE_DELAY: 200
};
module.exports = chartConst;

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
    calculator = require('./calculator'),
    state = require('./state');

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

        // 04. line차트의 경우 사용자의 min값이 scale의 min값과 같을 경우, min값을 1 step 감소 시킴
        scale.min = this._addMinPadding({
            min: scale.min,
            step: step,
            userMin: params.userMin,
            minOption: params.options.min,
            chartType: params.chartType
        });

        // 04. 사용자의 max값이 scael max와 같을 경우, max값을 1 step 증가 시킴
        scale.max = this._addMaxPadding({
            max: scale.max,
            step: step,
            userMax: params.userMax,
            maxOption: params.options.max,
            chartType: params.chartType
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

        if ((params.chartType !== chartConst.CHART_TYPE_LINE && params.userMin >= 0) || !tui.util.isUndefined(params.minOption)) {
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

        if ((params.chartType !== chartConst.CHART_TYPE_LINE && params.userMax <= 0) || !tui.util.isUndefined(params.maxOption)) {
            return max;
        }

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

},{"../const":15,"./calculator":24,"./state":29}],23:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXhlcy9heGlzLmpzIiwic3JjL2pzL2F4ZXMvYXhpc1RlbXBsYXRlLmpzIiwic3JjL2pzL2NoYXJ0LmpzIiwic3JjL2pzL2NoYXJ0cy9hcmVhQ2hhcnQuanMiLCJzcmMvanMvY2hhcnRzL2F4aXNUeXBlTWl4ZXIuanMiLCJzcmMvanMvY2hhcnRzL2JhckNoYXJ0LmpzIiwic3JjL2pzL2NoYXJ0cy9jaGFydEJhc2UuanMiLCJzcmMvanMvY2hhcnRzL2NvbHVtbkNoYXJ0LmpzIiwic3JjL2pzL2NoYXJ0cy9jb21ib0NoYXJ0LmpzIiwic3JjL2pzL2NoYXJ0cy9saW5lQ2hhcnQuanMiLCJzcmMvanMvY2hhcnRzL2xpbmVUeXBlTWl4ZXIuanMiLCJzcmMvanMvY2hhcnRzL3BpZUNoYXJ0LmpzIiwic3JjL2pzL2NoYXJ0cy92ZXJ0aWNhbFR5cGVNaXhlci5qcyIsInNyYy9qcy9jb2RlLXNuaXBwZXQtdXRpbC5qcyIsInNyYy9qcy9jb25zdC5qcyIsInNyYy9qcy9ldmVudEhhbmRsZUxheWVycy9ldmVudEhhbmRsZUxheWVyQmFzZS5qcyIsInNyYy9qcy9ldmVudEhhbmRsZUxheWVycy9ncm91cGVkRXZlbnRIYW5kbGVMYXllci5qcyIsInNyYy9qcy9ldmVudEhhbmRsZUxheWVycy9saW5lVHlwZUV2ZW50SGFuZGxlTGF5ZXIuanMiLCJzcmMvanMvZmFjdG9yaWVzL2NoYXJ0RmFjdG9yeS5qcyIsInNyYy9qcy9mYWN0b3JpZXMvcGx1Z2luRmFjdG9yeS5qcyIsInNyYy9qcy9mYWN0b3JpZXMvdGhlbWVGYWN0b3J5LmpzIiwic3JjL2pzL2hlbHBlcnMvYXhpc0RhdGFNYWtlci5qcyIsInNyYy9qcy9oZWxwZXJzL2JvdW5kc01ha2VyLmpzIiwic3JjL2pzL2hlbHBlcnMvY2FsY3VsYXRvci5qcyIsInNyYy9qcy9oZWxwZXJzL2RhdGFDb252ZXJ0ZXIuanMiLCJzcmMvanMvaGVscGVycy9kb21IYW5kbGVyLmpzIiwic3JjL2pzL2hlbHBlcnMvZXZlbnRMaXN0ZW5lci5qcyIsInNyYy9qcy9oZWxwZXJzL3JlbmRlclV0aWwuanMiLCJzcmMvanMvaGVscGVycy9zdGF0ZS5qcyIsInNyYy9qcy9oZWxwZXJzL3RlbXBsYXRlTWFrZXIuanMiLCJzcmMvanMvbGVnZW5kcy9sZWdlbmQuanMiLCJzcmMvanMvbGVnZW5kcy9sZWdlbmRUZW1wbGF0ZS5qcyIsInNyYy9qcy9wbG90cy9wbG90LmpzIiwic3JjL2pzL3Bsb3RzL3Bsb3RUZW1wbGF0ZS5qcyIsInNyYy9qcy9wbHVnaW5zL3BsdWdpblJhcGhhZWwuanMiLCJzcmMvanMvcGx1Z2lucy9yYXBoYWVsQXJlYUNoYXJ0LmpzIiwic3JjL2pzL3BsdWdpbnMvcmFwaGFlbEJhckNoYXJ0LmpzIiwic3JjL2pzL3BsdWdpbnMvcmFwaGFlbExpbmVDaGFydC5qcyIsInNyYy9qcy9wbHVnaW5zL3JhcGhhZWxMaW5lVHlwZUJhc2UuanMiLCJzcmMvanMvcGx1Z2lucy9yYXBoYWVsUGllQ2hhcnQuanMiLCJzcmMvanMvcGx1Z2lucy9yYXBoYWVsUmVuZGVyVXRpbC5qcyIsInNyYy9qcy9yZWdpc3RlckNoYXJ0cy5qcyIsInNyYy9qcy9yZWdpc3RlclRoZW1lcy5qcyIsInNyYy9qcy9zZXJpZXMvYXJlYUNoYXJ0U2VyaWVzLmpzIiwic3JjL2pzL3Nlcmllcy9iYXJDaGFydFNlcmllcy5qcyIsInNyYy9qcy9zZXJpZXMvYmFyVHlwZVNlcmllc0Jhc2UuanMiLCJzcmMvanMvc2VyaWVzL2NvbHVtbkNoYXJ0U2VyaWVzLmpzIiwic3JjL2pzL3Nlcmllcy9saW5lQ2hhcnRTZXJpZXMuanMiLCJzcmMvanMvc2VyaWVzL2xpbmVUeXBlU2VyaWVzQmFzZS5qcyIsInNyYy9qcy9zZXJpZXMvcGllQ2hhcnRTZXJpZXMuanMiLCJzcmMvanMvc2VyaWVzL3Nlcmllcy5qcyIsInNyYy9qcy9zZXJpZXMvc2VyaWVzVGVtcGxhdGUuanMiLCJzcmMvanMvdGhlbWVzL2RlZmF1bHRUaGVtZS5qcyIsInNyYy9qcy90b29sdGlwcy9ncm91cFRvb2x0aXAuanMiLCJzcmMvanMvdG9vbHRpcHMvdG9vbHRpcC5qcyIsInNyYy9qcy90b29sdGlwcy90b29sdGlwQmFzZS5qcyIsInNyYy9qcy90b29sdGlwcy90b29sdGlwVGVtcGxhdGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6YkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcm5CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25YQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaFNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNocEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3UkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMU5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN09BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyWUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOWNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogQGZpbGVvdmVydmlldyAgQXhpcyBjb21wb25lbnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBkb20gPSByZXF1aXJlKCcuLi9oZWxwZXJzL2RvbUhhbmRsZXInKSxcbiAgICBjaGFydENvbnN0ID0gcmVxdWlyZSgnLi4vY29uc3QnKSxcbiAgICBjYWxjdWxhdG9yID0gcmVxdWlyZSgnLi4vaGVscGVycy9jYWxjdWxhdG9yJyksXG4gICAgcmVuZGVyVXRpbCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvcmVuZGVyVXRpbCcpLFxuICAgIGF4aXNUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vYXhpc1RlbXBsYXRlJyk7XG5cbnZhciBBeGlzID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBBeGlzLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogQXhpcyBjb21wb25lbnQuXG4gICAgICogQGNvbnN0cnVjdHMgQXhpc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHt7XG4gICAgICogICAgICAgICAgbGFiZWxzOiBhcnJheS48c3RyaW5nPixcbiAgICAgKiAgICAgICAgICB0aWNrQ291bnQ6IG51bWJlcixcbiAgICAgKiAgICAgICAgICBpc0xhYmVsQXhpczogYm9vbGVhbixcbiAgICAgKiAgICAgICAgICBpc1ZlcnRpY2FsOiBib29sZWFuXG4gICAgICogICAgICB9fSBwYXJhbXMuZGF0YSBheGlzIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuYm91bmQgYXhpcyBib3VuZFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBheGlzIHRoZW1lXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgYXhpcyBvcHRpb25zXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHR1aS51dGlsLmV4dGVuZCh0aGlzLCBwYXJhbXMpO1xuICAgICAgICAvKipcbiAgICAgICAgICogQXhpcyB2aWV3IGNsYXNzTmFtZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jbGFzc05hbWUgPSAndHVpLWNoYXJ0LWF4aXMtYXJlYSc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBheGlzLlxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gYXhpcyBhcmVhIGJhc2UgZWxlbWVudFxuICAgICAqL1xuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBkYXRhID0gdGhpcy5kYXRhLFxuICAgICAgICAgICAgdGhlbWUgPSB0aGlzLnRoZW1lLFxuICAgICAgICAgICAgaXNWZXJ0aWNhbCA9ICEhZGF0YS5pc1ZlcnRpY2FsLFxuICAgICAgICAgICAgaXNQb3NpdGlvblJpZ2h0ID0gZGF0YS5pc1Bvc2l0aW9uUmlnaHQsXG4gICAgICAgICAgICBvcHRpb25zID0gdGhpcy5vcHRpb25zLFxuICAgICAgICAgICAgYm91bmQgPSB0aGlzLmJvdW5kLFxuICAgICAgICAgICAgZGltZW5zaW9uID0gYm91bmQuZGltZW5zaW9uLFxuICAgICAgICAgICAgc2l6ZSA9IGlzVmVydGljYWwgPyBkaW1lbnNpb24uaGVpZ2h0IDogZGltZW5zaW9uLndpZHRoLFxuICAgICAgICAgICAgZWwgPSBkb20uY3JlYXRlKCdESVYnLCB0aGlzLmNsYXNzTmFtZSksXG4gICAgICAgICAgICBlbFRpdGxlQXJlYSA9IHRoaXMuX3JlbmRlclRpdGxlQXJlYSh7XG4gICAgICAgICAgICAgICAgdGl0bGU6IG9wdGlvbnMudGl0bGUsXG4gICAgICAgICAgICAgICAgdGhlbWU6IHRoZW1lLnRpdGxlLFxuICAgICAgICAgICAgICAgIGlzVmVydGljYWw6IGlzVmVydGljYWwsXG4gICAgICAgICAgICAgICAgaXNQb3NpdGlvblJpZ2h0OiBpc1Bvc2l0aW9uUmlnaHQsXG4gICAgICAgICAgICAgICAgc2l6ZTogc2l6ZVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBlbExhYmVsQXJlYSA9IHRoaXMuX3JlbmRlckxhYmVsQXJlYShzaXplLCBkaW1lbnNpb24ud2lkdGgsIGJvdW5kLmRlZ3JlZSksXG4gICAgICAgICAgICBlbFRpY2tBcmVhO1xuXG4gICAgICAgIGlmICghdGhpcy5hbGlnbmVkIHx8ICFpc1ZlcnRpY2FsKSB7XG4gICAgICAgICAgICBlbFRpY2tBcmVhID0gdGhpcy5fcmVuZGVyVGlja0FyZWEoc2l6ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJEaW1lbnNpb24oZWwsIGRpbWVuc2lvbik7XG4gICAgICAgIHJlbmRlclV0aWwucmVuZGVyUG9zaXRpb24oZWwsIGJvdW5kLnBvc2l0aW9uKTtcbiAgICAgICAgZG9tLmFkZENsYXNzKGVsLCBpc1ZlcnRpY2FsID8gJ3ZlcnRpY2FsJyA6ICdob3Jpem9udGFsJyk7XG4gICAgICAgIGRvbS5hZGRDbGFzcyhlbCwgaXNQb3NpdGlvblJpZ2h0ID8gJ3JpZ2h0JyA6ICcnKTtcbiAgICAgICAgZG9tLmFwcGVuZChlbCwgW2VsVGl0bGVBcmVhLCBlbFRpY2tBcmVhLCBlbExhYmVsQXJlYV0pO1xuXG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGNzcyBzdHlsZSBvZiB0aXRsZSBhcmVhXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxUaXRsZUFyZWEgdGl0bGUgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzaXplICh3aWR0aCBvciBoZWlnaHQpXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpc1Bvc2l0aW9uUmlnaHQgd2hldGhlciByaWdodCBwb3NpdGlvbiBvciBub3Q/XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyVGl0bGVBcmVhU3R5bGU6IGZ1bmN0aW9uKGVsVGl0bGVBcmVhLCBzaXplLCBpc1Bvc2l0aW9uUmlnaHQpIHtcbiAgICAgICAgdmFyIGNzc1RleHRzID0gW1xuICAgICAgICAgICAgcmVuZGVyVXRpbC5jb25jYXRTdHIoJ3dpZHRoOicsIHNpemUsICdweCcpXG4gICAgICAgIF07XG5cbiAgICAgICAgaWYgKGlzUG9zaXRpb25SaWdodCkge1xuICAgICAgICAgICAgY3NzVGV4dHMucHVzaChyZW5kZXJVdGlsLmNvbmNhdFN0cigncmlnaHQ6JywgLXNpemUsICdweCcpKTtcbiAgICAgICAgICAgIGNzc1RleHRzLnB1c2gocmVuZGVyVXRpbC5jb25jYXRTdHIoJ3RvcDonLCAwLCAncHgnKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjc3NUZXh0cy5wdXNoKHJlbmRlclV0aWwuY29uY2F0U3RyKCdsZWZ0OicsIDAsICdweCcpKTtcbiAgICAgICAgICAgIGlmICghcmVuZGVyVXRpbC5pc0lFOCgpKSB7XG4gICAgICAgICAgICAgICAgY3NzVGV4dHMucHVzaChyZW5kZXJVdGlsLmNvbmNhdFN0cigndG9wOicsIHNpemUsICdweCcpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGVsVGl0bGVBcmVhLnN0eWxlLmNzc1RleHQgKz0gJzsnICsgY3NzVGV4dHMuam9pbignOycpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUaXRsZSBhcmVhIHJlbmRlcmVyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLnRpdGxlIGF4aXMgdGl0bGVcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgdGl0bGUgdGhlbWVcbiAgICAgKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gcGFyYW1zLmlzVmVydGljYWwgd2hldGhlciB2ZXJ0aWNhbCBvciBub3Q/XG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5pc1Bvc2l0aW9uUmlnaHQgd2hldGhlciByaWdodCBwb3NpdGlvbiBvciBub3Q/XG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnNpemUgKHdpZHRoIG9yIGhlaWdodClcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHRpdGxlIGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJUaXRsZUFyZWE6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgZWxUaXRsZUFyZWEgPSByZW5kZXJVdGlsLnJlbmRlclRpdGxlKHBhcmFtcy50aXRsZSwgcGFyYW1zLnRoZW1lLCAndHVpLWNoYXJ0LXRpdGxlLWFyZWEnKTtcblxuICAgICAgICBpZiAoZWxUaXRsZUFyZWEgJiYgcGFyYW1zLmlzVmVydGljYWwpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlclRpdGxlQXJlYVN0eWxlKGVsVGl0bGVBcmVhLCBwYXJhbXMuc2l6ZSwgcGFyYW1zLmlzUG9zaXRpb25SaWdodCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZWxUaXRsZUFyZWE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlZG5lciB0aWNrIGFyZWEuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHNpemUgc2l6ZSBvciBoZWlnaHRcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHRpY2sgYXJlYSBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyVGlja0FyZWE6IGZ1bmN0aW9uKHNpemUpIHtcbiAgICAgICAgdmFyIGRhdGEgPSB0aGlzLmRhdGEsXG4gICAgICAgICAgICB0aWNrQ291bnQgPSBkYXRhLnRpY2tDb3VudCxcbiAgICAgICAgICAgIHRpY2tDb2xvciA9IHRoaXMudGhlbWUudGlja0NvbG9yLFxuICAgICAgICAgICAgcG9zaXRpb25zID0gY2FsY3VsYXRvci5tYWtlVGlja1BpeGVsUG9zaXRpb25zKHNpemUsIHRpY2tDb3VudCksXG4gICAgICAgICAgICBlbFRpY2tBcmVhID0gZG9tLmNyZWF0ZSgnRElWJywgJ3R1aS1jaGFydC10aWNrLWFyZWEnKSxcbiAgICAgICAgICAgIHBvc1R5cGUgPSBkYXRhLmlzVmVydGljYWwgPyAnYm90dG9tJyA6ICdsZWZ0JyxcbiAgICAgICAgICAgIGJvcmRlckNvbG9yVHlwZSA9IGRhdGEuaXNWZXJ0aWNhbCA/IChkYXRhLmlzUG9zaXRpb25SaWdodCA/ICdib3JkZXJMZWZ0Q29sb3InIDogJ2JvcmRlclJpZ2h0Q29sb3InKSA6ICdib3JkZXJUb3BDb2xvcicsXG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IGF4aXNUZW1wbGF0ZS50cGxBeGlzVGljayxcbiAgICAgICAgICAgIHRpY2tzSHRtbCA9IHR1aS51dGlsLm1hcChwb3NpdGlvbnMsIGZ1bmN0aW9uKHBvc2l0aW9uLCBpbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciBjc3NUZXh0O1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmFsaWduZWQgJiYgZGF0YS5sYWJlbHNbaW5kZXhdID09PSBjaGFydENvbnN0LkVNUFRZX0FYSVNfTEFCRUwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjc3NUZXh0ID0gW1xuICAgICAgICAgICAgICAgICAgICByZW5kZXJVdGlsLmNvbmNhdFN0cignYmFja2dyb3VuZC1jb2xvcjonLCB0aWNrQ29sb3IpLFxuICAgICAgICAgICAgICAgICAgICByZW5kZXJVdGlsLmNvbmNhdFN0cihwb3NUeXBlLCAnOiAnLCBwb3NpdGlvbiwgJ3B4JylcbiAgICAgICAgICAgICAgICBdLmpvaW4oJzsnKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGVtcGxhdGUoe2Nzc1RleHQ6IGNzc1RleHR9KTtcbiAgICAgICAgICAgIH0sIHRoaXMpLmpvaW4oJycpO1xuXG4gICAgICAgIGVsVGlja0FyZWEuaW5uZXJIVE1MID0gdGlja3NIdG1sO1xuICAgICAgICBlbFRpY2tBcmVhLnN0eWxlW2JvcmRlckNvbG9yVHlwZV0gPSB0aWNrQ29sb3I7XG5cbiAgICAgICAgcmV0dXJuIGVsVGlja0FyZWE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgY3NzVGV4dCBvZiB2ZXJ0aWNhbCBsYWJlbC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYXhpc1dpZHRoIGF4aXMgd2lkdGhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdGl0bGVBcmVhV2lkdGggdGl0bGUgYXJlYSB3aWR0aFxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGNzc1RleHRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlVmVydGljYWxMYWJlbENzc1RleHQ6IGZ1bmN0aW9uKGF4aXNXaWR0aCwgdGl0bGVBcmVhV2lkdGgpIHtcbiAgICAgICAgcmV0dXJuICc7d2lkdGg6JyArIChheGlzV2lkdGggLSB0aXRsZUFyZWFXaWR0aCArIGNoYXJ0Q29uc3QuVl9MQUJFTF9SSUdIVF9QQURESU5HKSArICdweCc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBsYWJlbCBhcmVhLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzaXplIGxhYmVsIGFyZWEgc2l6ZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBheGlzV2lkdGggYXhpcyBhcmVhIHdpZHRoXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGRlZ3JlZSByb3RhdGlvbiBkZWdyZWVcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IGxhYmVsIGFyZWEgZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlckxhYmVsQXJlYTogZnVuY3Rpb24oc2l6ZSwgYXhpc1dpZHRoLCBkZWdyZWUpIHtcbiAgICAgICAgdmFyIGRhdGEgPSB0aGlzLmRhdGEsXG4gICAgICAgICAgICB0aWNrUGl4ZWxQb3NpdGlvbnMgPSBjYWxjdWxhdG9yLm1ha2VUaWNrUGl4ZWxQb3NpdGlvbnMoc2l6ZSwgZGF0YS50aWNrQ291bnQpLFxuICAgICAgICAgICAgbGFiZWxTaXplID0gdGlja1BpeGVsUG9zaXRpb25zWzFdIC0gdGlja1BpeGVsUG9zaXRpb25zWzBdLFxuICAgICAgICAgICAgcG9zVHlwZSA9ICdsZWZ0JyxcbiAgICAgICAgICAgIGNzc1RleHRzID0gdGhpcy5fbWFrZUxhYmVsQ3NzVGV4dHMoe1xuICAgICAgICAgICAgICAgIGlzVmVydGljYWw6IGRhdGEuaXNWZXJ0aWNhbCxcbiAgICAgICAgICAgICAgICBpc0xhYmVsQXhpczogZGF0YS5pc0xhYmVsQXhpcyxcbiAgICAgICAgICAgICAgICBsYWJlbFNpemU6IGxhYmVsU2l6ZVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBlbExhYmVsQXJlYSA9IGRvbS5jcmVhdGUoJ0RJVicsICd0dWktY2hhcnQtbGFiZWwtYXJlYScpLFxuICAgICAgICAgICAgYXJlYUNzc1RleHQgPSByZW5kZXJVdGlsLm1ha2VGb250Q3NzVGV4dCh0aGlzLnRoZW1lLmxhYmVsKSxcbiAgICAgICAgICAgIGxhYmVsc0h0bWwsIHRpdGxlQXJlYVdpZHRoO1xuXG4gICAgICAgIGlmIChkYXRhLmlzVmVydGljYWwpIHtcbiAgICAgICAgICAgIHBvc1R5cGUgPSBkYXRhLmlzTGFiZWxBeGlzID8gJ3RvcCcgOiAnYm90dG9tJztcbiAgICAgICAgICAgIHRpdGxlQXJlYVdpZHRoID0gdGhpcy5fZ2V0UmVuZGVyZWRUaXRsZUhlaWdodCgpICsgY2hhcnRDb25zdC5USVRMRV9BUkVBX1dJRFRIX1BBRERJTkc7XG4gICAgICAgICAgICBhcmVhQ3NzVGV4dCArPSB0aGlzLl9tYWtlVmVydGljYWxMYWJlbENzc1RleHQoYXhpc1dpZHRoLCB0aXRsZUFyZWFXaWR0aCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aWNrUGl4ZWxQb3NpdGlvbnMubGVuZ3RoID0gZGF0YS5sYWJlbHMubGVuZ3RoO1xuXG4gICAgICAgIGxhYmVsc0h0bWwgPSB0aGlzLl9tYWtlTGFiZWxzSHRtbCh7XG4gICAgICAgICAgICBwb3NpdGlvbnM6IHRpY2tQaXhlbFBvc2l0aW9ucyxcbiAgICAgICAgICAgIGxhYmVsczogZGF0YS5sYWJlbHMsXG4gICAgICAgICAgICBwb3NUeXBlOiBwb3NUeXBlLFxuICAgICAgICAgICAgY3NzVGV4dHM6IGNzc1RleHRzLFxuICAgICAgICAgICAgbGFiZWxTaXplOiBsYWJlbFNpemUsXG4gICAgICAgICAgICBkZWdyZWU6IGRlZ3JlZSxcbiAgICAgICAgICAgIHRoZW1lOiB0aGlzLnRoZW1lLmxhYmVsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGVsTGFiZWxBcmVhLmlubmVySFRNTCA9IGxhYmVsc0h0bWw7XG4gICAgICAgIGVsTGFiZWxBcmVhLnN0eWxlLmNzc1RleHQgPSBhcmVhQ3NzVGV4dDtcblxuICAgICAgICB0aGlzLl9jaGFuZ2VMYWJlbEFyZWFQb3NpdGlvbih7XG4gICAgICAgICAgICBlbExhYmVsQXJlYTogZWxMYWJlbEFyZWEsXG4gICAgICAgICAgICBpc1ZlcnRpY2FsOiBkYXRhLmlzVmVydGljYWwsXG4gICAgICAgICAgICBpc0xhYmVsQXhpczogZGF0YS5pc0xhYmVsQXhpcyxcbiAgICAgICAgICAgIHRoZW1lOiB0aGlzLnRoZW1lLmxhYmVsLFxuICAgICAgICAgICAgbGFiZWxTaXplOiBsYWJlbFNpemUsXG4gICAgICAgICAgICBhbGlnbmVkOiBkYXRhLmFsaWduZWRcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGVsTGFiZWxBcmVhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgaGVpZ2h0IG9mIHRpdGxlIGFyZWEgO1xuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IGhlaWdodFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFJlbmRlcmVkVGl0bGVIZWlnaHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdGl0bGUgPSB0aGlzLm9wdGlvbnMudGl0bGUsXG4gICAgICAgICAgICB0aGVtZSA9IHRoaXMudGhlbWUudGl0bGUsXG4gICAgICAgICAgICByZXN1bHQgPSB0aXRsZSA/IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodCh0aXRsZSwgdGhlbWUpIDogMDtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBjc3NUZXh0cyBvZiBsYWJlbC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlclxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaXNWZXJ0aWNhbCB3aGV0aGVyIHZlcnRpY2FsIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaXNMYWJlbEF4aXMgd2hldGhlciBsYWJlbCBheGlzIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5sYWJlbFNpemUgbGFiZWwgc2l6ZSAod2lkdGggb3IgaGVpZ2h0KVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmdbXX0gY3NzVGV4dHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlTGFiZWxDc3NUZXh0czogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBjc3NUZXh0cyA9IFtdO1xuXG4gICAgICAgIGlmIChwYXJhbXMuaXNWZXJ0aWNhbCAmJiBwYXJhbXMuaXNMYWJlbEF4aXMpIHtcbiAgICAgICAgICAgIGNzc1RleHRzLnB1c2gocmVuZGVyVXRpbC5jb25jYXRTdHIoJ2hlaWdodDonLCBwYXJhbXMubGFiZWxTaXplLCAncHgnKSk7XG4gICAgICAgICAgICBjc3NUZXh0cy5wdXNoKHJlbmRlclV0aWwuY29uY2F0U3RyKCdsaW5lLWhlaWdodDonLCBwYXJhbXMubGFiZWxTaXplLCAncHgnKSk7XG4gICAgICAgIH0gZWxzZSBpZiAoIXBhcmFtcy5pc1ZlcnRpY2FsKSB7XG4gICAgICAgICAgICBjc3NUZXh0cy5wdXNoKHJlbmRlclV0aWwuY29uY2F0U3RyKCd3aWR0aDonLCBwYXJhbXMubGFiZWxTaXplLCAncHgnKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY3NzVGV4dHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIGNhbGN1bGF0ZSByb3RhdGlvbiBtb3ZpbmcgcG9zaXRpb24uXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmRlZ3JlZSByb3RhdGlvbiBkZWdyZWVcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubGFiZWxIZWlnaHQgbGFiZWwgaGVpZ2h0XG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmxlZnQgbm9ybWFsIGxlZnRcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubW92ZUxlZnQgbW92ZSBsZWZ0XG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnRvcCB0b3BcbiAgICAgKiBAcmV0dXJucyB7e3RvcDpudW1iZXIsIGxlZnQ6IG51bWJlcn19IHBvc2l0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2FsY3VsYXRlUm90YXRpb25Nb3ZpbmdQb3NpdGlvbjogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBtb3ZlTGVmdCA9IHBhcmFtcy5tb3ZlTGVmdDtcbiAgICAgICAgaWYgKHBhcmFtcy5kZWdyZWUgPT09IGNoYXJ0Q29uc3QuQU5HTEVfODUpIHtcbiAgICAgICAgICAgIG1vdmVMZWZ0ICs9IGNhbGN1bGF0b3IuY2FsY3VsYXRlQWRqYWNlbnQoY2hhcnRDb25zdC5BTkdMRV85MCAtIHBhcmFtcy5kZWdyZWUsIHBhcmFtcy5sYWJlbEhlaWdodCAvIDIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRvcDogcGFyYW1zLnRvcCxcbiAgICAgICAgICAgIGxlZnQ6IHBhcmFtcy5sZWZ0IC0gbW92ZUxlZnRcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gY2FsY3VsYXRlIHJvdGF0aW9uIG1vdmluZyBwb3NpdGlvbiBmb3IgaWU4LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5kZWdyZWUgcm90YXRpb24gZGVncmVlXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmxhYmVsV2lkdGggbGFiZWwgd2lkdGhcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubGFiZWxIZWlnaHQgbGFiZWwgaGVpZ2h0XG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmxlZnQgbm9ybWFsIGxlZnRcbiAgICAgKiAgICAgIEBwYXJhbSB7KHN0cmluZyB8IG51bWJlcil9IHBhcmFtcy5sYWJlbCBsYWJlbFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHRoZW1lIGxhYmVsIHRoZW1lXG4gICAgICogQHJldHVybnMge3t0b3A6bnVtYmVyLCBsZWZ0OiBudW1iZXJ9fSBwb3NpdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NhbGN1bGF0ZVJvdGF0aW9uTW92aW5nUG9zaXRpb25Gb3JJRTg6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgbGFiZWxXaWR0aCA9IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbFdpZHRoKHBhcmFtcy5sYWJlbCwgcGFyYW1zLnRoZW1lKSxcbiAgICAgICAgICAgIHNtYWxsQXJlYVdpZHRoID0gY2FsY3VsYXRvci5jYWxjdWxhdGVBZGphY2VudChjaGFydENvbnN0LkFOR0xFXzkwIC0gcGFyYW1zLmRlZ3JlZSwgcGFyYW1zLmxhYmVsSGVpZ2h0IC8gMiksXG4gICAgICAgICAgICBuZXdMYWJlbFdpZHRoID0gKGNhbGN1bGF0b3IuY2FsY3VsYXRlQWRqYWNlbnQocGFyYW1zLmRlZ3JlZSwgbGFiZWxXaWR0aCAvIDIpICsgc21hbGxBcmVhV2lkdGgpICogMixcbiAgICAgICAgICAgIGNvbGxlY3RMZWZ0ID0gbGFiZWxXaWR0aCAtIG5ld0xhYmVsV2lkdGgsXG4gICAgICAgICAgICBtb3ZlTGVmdCA9IChwYXJhbXMubGFiZWxXaWR0aCAvIDIpIC0gKHNtYWxsQXJlYVdpZHRoICogMik7XG5cbiAgICAgICAgaWYgKHBhcmFtcy5kZWdyZWUgPT09IGNoYXJ0Q29uc3QuQU5HTEVfODUpIHtcbiAgICAgICAgICAgIG1vdmVMZWZ0ICs9IHNtYWxsQXJlYVdpZHRoO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRvcDogY2hhcnRDb25zdC5YQVhJU19MQUJFTF9UT1BfTUFSR0lOLFxuICAgICAgICAgICAgbGVmdDogcGFyYW1zLmxlZnQgKyBjb2xsZWN0TGVmdCAtIG1vdmVMZWZ0XG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgY3NzVGV4dCBmb3Igcm90YXRpb24gbW92aW5nLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5kZWdyZWUgcm90YXRpb24gZGVncmVlXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmxhYmVsV2lkdGggbGFiZWwgd2lkdGhcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubGFiZWxIZWlnaHQgbGFiZWwgaGVpZ2h0XG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmxlZnQgbm9ybWFsIGxlZnRcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubW92ZUxlZnQgbW92ZSBsZWZ0XG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnRvcCB0b3BcbiAgICAgKiAgICAgIEBwYXJhbSB7KHN0cmluZyB8IG51bWJlcil9IHBhcmFtcy5sYWJlbCBsYWJlbFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHRoZW1lIGxhYmVsIHRoZW1lXG4gICAgICogQHJldHVybnMge3N0cmluZ30gY3NzVGV4dFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VDc3NUZXh0Rm9yUm90YXRpb25Nb3Zpbmc6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgcG9zaXRpb247XG4gICAgICAgIGlmIChyZW5kZXJVdGlsLmlzSUU4KCkpIHtcbiAgICAgICAgICAgIHBvc2l0aW9uID0gdGhpcy5fY2FsY3VsYXRlUm90YXRpb25Nb3ZpbmdQb3NpdGlvbkZvcklFOChwYXJhbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcG9zaXRpb24gPSB0aGlzLl9jYWxjdWxhdGVSb3RhdGlvbk1vdmluZ1Bvc2l0aW9uKHBhcmFtcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlbmRlclV0aWwuY29uY2F0U3RyKCdsZWZ0OicsIHBvc2l0aW9uLmxlZnQsICdweCcsICc7dG9wOicsIHBvc2l0aW9uLnRvcCwgJ3B4Jyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgaHRtbCBvZiByb3RhdGlvbiBsYWJlbHMuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxvYmplY3Q+fSBwYXJhbXMucG9zaXRpb25zIGxhYmVsIHBvc2l0aW9uIGFycmF5XG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ1tdfSBwYXJhbXMubGFiZWxzIGxhYmVsIGFycmF5XG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLnBvc1R5cGUgcG9zaXRpb24gdHlwZSAobGVmdCBvciBib3R0b20pXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ1tdfSBwYXJhbXMuY3NzVGV4dHMgY3NzIGFycmF5XG4gICAgICogQHJldHVybnMge3N0cmluZ30gbGFiZWxzIGh0bWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlUm90YXRpb25MYWJlbHNIdG1sOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIHRlbXBsYXRlID0gYXhpc1RlbXBsYXRlLnRwbEF4aXNMYWJlbCxcbiAgICAgICAgICAgIGxhYmVsSGVpZ2h0ID0gcmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsSGVpZ2h0KHBhcmFtcy5sYWJlbHNbMF0sIHBhcmFtcy50aGVtZSksXG4gICAgICAgICAgICBsYWJlbENzc1RleHQgPSBwYXJhbXMuY3NzVGV4dHMubGVuZ3RoID8gcGFyYW1zLmNzc1RleHRzLmpvaW4oJzsnKSArICc7JyA6ICcnLFxuICAgICAgICAgICAgYWRkQ2xhc3MgPSAnIHJvdGF0aW9uJyArIHBhcmFtcy5kZWdyZWUsXG4gICAgICAgICAgICBoYWxmV2lkdGggPSBwYXJhbXMubGFiZWxTaXplIC8gMixcbiAgICAgICAgICAgIG1vdmVMZWZ0ID0gY2FsY3VsYXRvci5jYWxjdWxhdGVBZGphY2VudChwYXJhbXMuZGVncmVlLCBoYWxmV2lkdGgpLFxuICAgICAgICAgICAgdG9wID0gY2FsY3VsYXRvci5jYWxjdWxhdGVPcHBvc2l0ZShwYXJhbXMuZGVncmVlLCBoYWxmV2lkdGgpICsgY2hhcnRDb25zdC5YQVhJU19MQUJFTF9UT1BfTUFSR0lOLFxuICAgICAgICAgICAgbGFiZWxzSHRtbCA9IHR1aS51dGlsLm1hcChwYXJhbXMucG9zaXRpb25zLCBmdW5jdGlvbihwb3NpdGlvbiwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgbGFiZWwgPSBwYXJhbXMubGFiZWxzW2luZGV4XSxcbiAgICAgICAgICAgICAgICAgICAgcm90YXRpb25Dc3NUZXh0ID0gdGhpcy5fbWFrZUNzc1RleHRGb3JSb3RhdGlvbk1vdmluZyh7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWdyZWU6IHBhcmFtcy5kZWdyZWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbEhlaWdodDogbGFiZWxIZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbFdpZHRoOiBwYXJhbXMubGFiZWxTaXplLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiB0b3AsXG4gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiBwb3NpdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vdmVMZWZ0OiBtb3ZlTGVmdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBsYWJlbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOiBwYXJhbXMudGhlbWVcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdGVtcGxhdGUoe1xuICAgICAgICAgICAgICAgICAgICBhZGRDbGFzczogYWRkQ2xhc3MsXG4gICAgICAgICAgICAgICAgICAgIGNzc1RleHQ6IGxhYmVsQ3NzVGV4dCArIHJvdGF0aW9uQ3NzVGV4dCxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGxhYmVsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCB0aGlzKS5qb2luKCcnKTtcblxuICAgICAgICByZXR1cm4gbGFiZWxzSHRtbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBodG1sIG9mIG5vcm1hbCBsYWJlbHMuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxvYmplY3Q+fSBwYXJhbXMucG9zaXRpb25zIGxhYmVsIHBvc2l0aW9uIGFycmF5XG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ1tdfSBwYXJhbXMubGFiZWxzIGxhYmVsIGFycmF5XG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLnBvc1R5cGUgcG9zaXRpb24gdHlwZSAobGVmdCBvciBib3R0b20pXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ1tdfSBwYXJhbXMuY3NzVGV4dHMgY3NzIGFycmF5XG4gICAgICogQHJldHVybnMge3N0cmluZ30gbGFiZWxzIGh0bWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlTm9ybWFsTGFiZWxzSHRtbDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciB0ZW1wbGF0ZSA9IGF4aXNUZW1wbGF0ZS50cGxBeGlzTGFiZWwsXG4gICAgICAgICAgICBsYWJlbENzc1RleHQgPSBwYXJhbXMuY3NzVGV4dHMubGVuZ3RoID8gcGFyYW1zLmNzc1RleHRzLmpvaW4oJzsnKSArICc7JyA6ICcnLFxuICAgICAgICAgICAgbGFiZWxzSHRtbCA9IHR1aS51dGlsLm1hcChwYXJhbXMucG9zaXRpb25zLCBmdW5jdGlvbihwb3NpdGlvbiwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgYWRkQ3NzVGV4dCA9IHJlbmRlclV0aWwuY29uY2F0U3RyKHBhcmFtcy5wb3NUeXBlLCAnOicsIHBvc2l0aW9uLCAncHgnKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGVtcGxhdGUoe1xuICAgICAgICAgICAgICAgICAgICBhZGRDbGFzczogJycsXG4gICAgICAgICAgICAgICAgICAgIGNzc1RleHQ6IGxhYmVsQ3NzVGV4dCArIGFkZENzc1RleHQsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiBwYXJhbXMubGFiZWxzW2luZGV4XVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSwgdGhpcykuam9pbignJyk7XG4gICAgICAgIHJldHVybiBsYWJlbHNIdG1sO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGh0bWwgb2YgbGFiZWxzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48b2JqZWN0Pn0gcGFyYW1zLnBvc2l0aW9ucyBsYWJlbCBwb3NpdGlvbiBhcnJheVxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmdbXX0gcGFyYW1zLmxhYmVscyBsYWJlbCBhcnJheVxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5wb3NUeXBlIHBvc2l0aW9uIHR5cGUgKGxlZnQgb3IgYm90dG9tKVxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmdbXX0gcGFyYW1zLmNzc1RleHRzIGNzcyBhcnJheVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGxhYmVscyBodG1sXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUxhYmVsc0h0bWw6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgbGFiZWxzSHRtbDtcbiAgICAgICAgaWYgKHBhcmFtcy5kZWdyZWUpIHtcbiAgICAgICAgICAgIGxhYmVsc0h0bWwgPSB0aGlzLl9tYWtlUm90YXRpb25MYWJlbHNIdG1sKHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsYWJlbHNIdG1sID0gdGhpcy5fbWFrZU5vcm1hbExhYmVsc0h0bWwocGFyYW1zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBsYWJlbHNIdG1sO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGFuZ2UgcG9zaXRpb24gb2YgbGFiZWwgYXJlYS5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlclxuICAgICAqICAgICAgQHBhcmFtIHtIVE1MRWxlbWVudH0gcGFyYW1zLmVsTGFiZWxBcmVhIGxhYmVsIGFyZWEgZWxlbWVudFxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaXNWZXJ0aWNhbCB3aGV0aGVyIHZlcnRpY2FsIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaXNMYWJlbEF4aXMgd2hldGhlciBsYWJlbCBheGlzIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHt7Zm9udFNpemU6IG51bWJlciwgZm9udEZhbWlseTogc3RyaW5nLCBjb2xvcjogc3RyaW5nfX0gcGFyYW1zLnRoZW1lIGxhYmVsIHRoZW1lXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmxhYmVsU2l6ZSBsYWJlbCBzaXplICh3aWR0aCBvciBoZWlnaHQpXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2hhbmdlTGFiZWxBcmVhUG9zaXRpb246IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgbGFiZWxIZWlnaHQ7XG5cbiAgICAgICAgaWYgKHBhcmFtcy5pc0xhYmVsQXhpcyAmJiAhcGFyYW1zLmFsaWduZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYXJhbXMuaXNWZXJ0aWNhbCkge1xuICAgICAgICAgICAgbGFiZWxIZWlnaHQgPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxIZWlnaHQoJ0FCQycsIHBhcmFtcy50aGVtZSk7XG4gICAgICAgICAgICBwYXJhbXMuZWxMYWJlbEFyZWEuc3R5bGUudG9wID0gcmVuZGVyVXRpbC5jb25jYXRTdHIocGFyc2VJbnQobGFiZWxIZWlnaHQgLyAyLCAxMCksICdweCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGFyYW1zLmVsTGFiZWxBcmVhLnN0eWxlLmxlZnQgPSByZW5kZXJVdGlsLmNvbmNhdFN0cignLScsIHBhcnNlSW50KHBhcmFtcy5sYWJlbFNpemUgLyAyLCAxMCksICdweCcpO1xuICAgICAgICB9XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQXhpcztcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBUaGlzIGlzIHRlbXBsYXRlcyBvciBheGlzIHZpZXcuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG52YXIgdGVtcGxhdGVNYWtlciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvdGVtcGxhdGVNYWtlcicpO1xuXG52YXIgdGFncyA9IHtcbiAgICBIVE1MX0FYSVNfVElDSzogJzxkaXYgY2xhc3M9XCJ0dWktY2hhcnQtdGlja1wiIHN0eWxlPVwie3sgY3NzVGV4dCB9fVwiPjwvZGl2PicsXG4gICAgSFRNTF9BWElTX0xBQkVMOiAnPGRpdiBjbGFzcz1cInR1aS1jaGFydC1sYWJlbHt7IGFkZENsYXNzIH19XCIgc3R5bGU9XCJ7eyBjc3NUZXh0IH19XCI+PHNwYW4+e3sgbGFiZWwgfX08L3NwYW4+PC9kaXY+J1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgdHBsQXhpc1RpY2s6IHRlbXBsYXRlTWFrZXIudGVtcGxhdGUodGFncy5IVE1MX0FYSVNfVElDSyksXG4gICAgdHBsQXhpc0xhYmVsOiB0ZW1wbGF0ZU1ha2VyLnRlbXBsYXRlKHRhZ3MuSFRNTF9BWElTX0xBQkVMKVxufTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBjaGFydC5qcyBpcyBlbnRyeSBwb2ludCBvZiBUb2FzdCBVSSBDaGFydC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBjaGFydENvbnN0ID0gcmVxdWlyZSgnLi9jb25zdCcpLFxuICAgIGNoYXJ0RmFjdG9yeSA9IHJlcXVpcmUoJy4vZmFjdG9yaWVzL2NoYXJ0RmFjdG9yeScpLFxuICAgIHBsdWdpbkZhY3RvcnkgPSByZXF1aXJlKCcuL2ZhY3Rvcmllcy9wbHVnaW5GYWN0b3J5JyksXG4gICAgdGhlbWVGYWN0b3J5ID0gcmVxdWlyZSgnLi9mYWN0b3JpZXMvdGhlbWVGYWN0b3J5Jyk7XG5cbnZhciBfY3JlYXRlQ2hhcnQ7XG5cbnJlcXVpcmUoJy4vY29kZS1zbmlwcGV0LXV0aWwnKTtcbnJlcXVpcmUoJy4vcmVnaXN0ZXJDaGFydHMnKTtcbnJlcXVpcmUoJy4vcmVnaXN0ZXJUaGVtZXMnKTtcblxuLyoqXG4gKiBOSE4gRW50ZXJ0YWlubWVudCBUb2FzdCBVSSBDaGFydC5cbiAqIEBuYW1lc3BhY2UgdHVpLmNoYXJ0XG4gKi9cbnR1aS51dGlsLmRlZmluZU5hbWVzcGFjZSgndHVpLmNoYXJ0Jyk7XG5cbi8qKlxuICogQ3JlYXRlIGNoYXJ0LlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNvbnRhaW5lclxuICogQHBhcmFtIHthcnJheS48YXJyYXk+fSBkYXRhIGNoYXJ0IGRhdGFcbiAqIEBwYXJhbSB7e1xuICogICBjaGFydDoge1xuICogICAgIHdpZHRoOiBudW1iZXIsXG4gKiAgICAgaGVpZ2h0OiBudW1iZXIsXG4gKiAgICAgdGl0bGU6IHN0cmluZyxcbiAqICAgICBmb3JtYXQ6IHN0cmluZ1xuICogICB9LFxuICogICB5QXhpczoge1xuICogICAgIHRpdGxlOiBzdHJpbmcsXG4gKiAgICAgbWluOiBudW1iZXJcbiAqICAgfSxcbiAqICAgeEF4aXM6IHtcbiAqICAgICB0aXRsZTogc3RyaWcsXG4gKiAgICAgbWluOiBudW1iZXJcbiAqICAgfSxcbiAqICAgdG9vbHRpcDoge1xuICogICAgIHN1ZmZpeDogc3RyaW5nLFxuICogICAgIHRlbXBsYXRlOiBzdHJpbmdcbiAqICAgfSxcbiAqICAgdGhlbWU6IHN0cmluZ1xuICogfX0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gKiBAcmV0dXJucyB7b2JqZWN0fSBjaGFydCBpbnN0YW5jZS5cbiAqIEBwcml2YXRlXG4gKiBAaWdub3JlXG4gKi9cbl9jcmVhdGVDaGFydCA9IGZ1bmN0aW9uKGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucykge1xuICAgIHZhciB0aGVtZU5hbWUsIHRoZW1lLCBjaGFydDtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB0aGVtZU5hbWUgPSBvcHRpb25zLnRoZW1lIHx8IGNoYXJ0Q29uc3QuREVGQVVMVF9USEVNRV9OQU1FO1xuICAgIHRoZW1lID0gdGhlbWVGYWN0b3J5LmdldCh0aGVtZU5hbWUpO1xuXG4gICAgY2hhcnQgPSBjaGFydEZhY3RvcnkuZ2V0KG9wdGlvbnMuY2hhcnRUeXBlLCBkYXRhLCB0aGVtZSwgb3B0aW9ucyk7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGNoYXJ0LnJlbmRlcigpKTtcbiAgICBjaGFydC5hbmltYXRlQ2hhcnQoKTtcblxuICAgIHJldHVybiBjaGFydDtcbn07XG5cbi8qKlxuICogQmFyIGNoYXJ0IGNyZWF0b3IuXG4gKiBAbWVtYmVyT2YgdHVpLmNoYXJ0XG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY2hhcnQgY29udGFpbmVyXG4gKiBAcGFyYW0ge29iamVjdH0gZGF0YSBjaGFydCBkYXRhXG4gKiAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGRhdGEuY2F0ZWdvcmllcyBjYXRlZ29yaWVzXG4gKiAgICAgIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gZGF0YS5zZXJpZXMgc2VyaWVzIGRhdGFcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuY2hhcnQgY2hhcnQgb3B0aW9uc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMuY2hhcnQud2lkdGggY2hhcnQgd2lkdGhcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LmhlaWdodCBjaGFydCBoZWlnaHRcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmNoYXJ0LnRpdGxlIGNoYXJ0IHRpdGxlXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC5mb3JtYXQgdmFsdWUgZm9ybWF0XG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnlBeGlzIG9wdGlvbnMgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMueUF4aXMudGl0bGUgdGl0bGUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMueUF4aXMubGFiZWxJbnRlcnZhbCBsYWJlbCBpbnRlcnZhbCBvZiB2ZXJ0aWNhbCBheGlzXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnhBeGlzIG9wdGlvbnMgb2YgaG9yaXpvbnRhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy54QXhpcy50aXRsZSB0aXRsZSBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnhBeGlzLm1pbiBtaW5pbWFsIHZhbHVlIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMueEF4aXMubWF4IG1heGltdW0gdmFsdWUgb2YgaG9yaXpvbnRhbCBheGlzXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnNlcmllcyBvcHRpb25zIG9mIHNlcmllc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuc2VyaWVzLnN0YWNrZWQgc3RhY2tlZCB0eXBlXG4gKiAgICAgICAgICBAcGFyYW0ge2Jvb2xlYW59IG9wdGlvbnMuc2VyaWVzLnNob3dMYWJlbCB3aGV0aGVyIHNob3cgbGFiZWwgb3Igbm90XG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnRvb2x0aXAgb3B0aW9ucyBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnN1ZmZpeCBzdWZmaXggb2YgdG9vbHRpcFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC50ZW1wbGF0ZSB0ZW1wbGF0ZSBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnBvc2l0aW9uIHRvb2x0aXAgcG9zaXRpb24gdHlwZVxuICogICAgICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMudG9vbHRpcC5hZGRQb3NpdGlvbiBhZGQgcG9zaXRpb25cbiAqICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uLmxlZnQgYWRkIGxlZnQgcG9zaXRpb25cbiAqICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uLnRvcCBhZGQgdG9wIHBvc2l0aW9uXG4gKiAgICAgICAgICBAcGFyYW0ge2Jvb2xlYW59IG9wdGlvbnMudG9vbHRpcC5ncm91cGVkIHdoZXRoZXIgZ3JvdXAgdG9vbHRpcCBvciBub3RcbiAqICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudGhlbWUgdGhlbWUgbmFtZVxuICogICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5saWJUeXBlIGdyYXBoIGxpYnJhcnkgdHlwZVxuICogQHJldHVybnMge29iamVjdH0gYmFyIGNoYXJ0XG4gKiBAZXhhbXBsZVxuICogdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWluZXItaWQnKSxcbiAqICAgICBkYXRhID0ge1xuICogICAgICAgY2F0ZWdvcmllczogWydjYXRlMScsICdjYXRlMicsICdjYXRlMyddLFxuICogICAgICAgc2VyaWVzOiBbXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMScsXG4gKiAgICAgICAgICAgZGF0YTogWzIwLCAzMCwgNTBdXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMicsXG4gKiAgICAgICAgICAgZGF0YTogWzQwLCA0MCwgNjBdXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMycsXG4gKiAgICAgICAgICAgZGF0YTogWzYwLCA1MCwgMTBdXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kNCcsXG4gKiAgICAgICAgICAgZGF0YTogWzgwLCAxMCwgNzBdXG4gKiAgICAgICAgIH1cbiAqICAgICAgIF1cbiAqICAgICB9LFxuICogICAgIG9wdGlvbnMgPSB7XG4gKiAgICAgICBjaGFydDoge1xuICogICAgICAgICB0aXRsZTogJ0JhciBDaGFydCdcbiAqICAgICAgIH0sXG4gKiAgICAgICB5QXhpczoge1xuICogICAgICAgICB0aXRsZTogJ1kgQXhpcydcbiAqICAgICAgIH0sXG4gKiAgICAgICB4QXhpczoge1xuICogICAgICAgICB0aXRsZTogJ1ggQXhpcydcbiAqICAgICAgIH1cbiAqICAgICB9O1xuICogdHVpLmNoYXJ0LmJhckNoYXJ0KGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucyk7XG4gKi9cbnR1aS5jaGFydC5iYXJDaGFydCA9IGZ1bmN0aW9uKGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIG9wdGlvbnMuY2hhcnRUeXBlID0gY2hhcnRDb25zdC5DSEFSVF9UWVBFX0JBUjtcbiAgICByZXR1cm4gX2NyZWF0ZUNoYXJ0KGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucyk7XG59O1xuXG4vKipcbiAqIENvbHVtbiBjaGFydCBjcmVhdG9yLlxuICogQG1lbWJlck9mIHR1aS5jaGFydFxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNoYXJ0IGNvbnRhaW5lclxuICogQHBhcmFtIHtvYmplY3R9IGRhdGEgY2hhcnQgZGF0YVxuICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBkYXRhLmNhdGVnb3JpZXMgY2F0ZWdvcmllc1xuICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IGRhdGEuc2VyaWVzIHNlcmllcyBkYXRhXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLmNoYXJ0IGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LndpZHRoIGNoYXJ0IHdpZHRoXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5jaGFydC5oZWlnaHQgY2hhcnQgaGVpZ2h0XG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC50aXRsZSBjaGFydCB0aXRsZVxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuY2hhcnQuZm9ybWF0IHZhbHVlIGZvcm1hdFxuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy55QXhpcyBvcHRpb25zIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnlBeGlzLnRpdGxlIHRpdGxlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnlBeGlzLm1pbiBtaW5pbWFsIHZhbHVlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnlBeGlzLm1heCBtYXhpbXVtIHZhbHVlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMueEF4aXMgb3B0aW9ucyBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnhBeGlzLnRpdGxlIHRpdGxlIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMueEF4aXMubGFiZWxJbnRlcnZhbCBsYWJlbCBpbnRlcnZhbCBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuc2VyaWVzIG9wdGlvbnMgb2Ygc2VyaWVzXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5zZXJpZXMuc3RhY2tlZCBzdGFja2VkIHR5cGVcbiAqICAgICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5zZXJpZXMuc2hvd0xhYmVsIHdoZXRoZXIgc2hvdyBsYWJlbCBvciBub3RcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMudG9vbHRpcCBvcHRpb25zIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAuc3VmZml4IHN1ZmZpeCBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnRlbXBsYXRlIHRlbXBsYXRlIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAucG9zaXRpb24gdG9vbHRpcCBwb3NpdGlvbiB0eXBlXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uIGFkZCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24ubGVmdCBhZGQgbGVmdCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24udG9wIGFkZCB0b3AgcG9zaXRpb25cbiAqICAgICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy50b29sdGlwLmdyb3VwZWQgd2hldGhlciBncm91cCB0b29sdGlwIG9yIG5vdFxuICogICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50aGVtZSB0aGVtZSBuYW1lXG4gKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmxpYlR5cGUgZ3JhcGggbGlicmFyeSB0eXBlXG4gKiBAcmV0dXJucyB7b2JqZWN0fSBjb2x1bW4gY2hhcnRcbiAqIEBleGFtcGxlXG4gKiB2YXIgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhaW5lci1pZCcpLFxuICogICAgIGRhdGEgPSB7XG4gKiAgICAgICBjYXRlZ29yaWVzOiBbJ2NhdGUxJywgJ2NhdGUyJywgJ2NhdGUzJ10sXG4gKiAgICAgICBzZXJpZXM6IFtcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQxJyxcbiAqICAgICAgICAgICBkYXRhOiBbMjAsIDMwLCA1MF1cbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQyJyxcbiAqICAgICAgICAgICBkYXRhOiBbNDAsIDQwLCA2MF1cbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQzJyxcbiAqICAgICAgICAgICBkYXRhOiBbNjAsIDUwLCAxMF1cbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQ0JyxcbiAqICAgICAgICAgICBkYXRhOiBbODAsIDEwLCA3MF1cbiAqICAgICAgICAgfVxuICogICAgICAgXVxuICogICAgIH0sXG4gKiAgICAgb3B0aW9ucyA9IHtcbiAqICAgICAgIGNoYXJ0OiB7XG4gKiAgICAgICAgIHRpdGxlOiAnQ29sdW1uIENoYXJ0J1xuICogICAgICAgfSxcbiAqICAgICAgIHlBeGlzOiB7XG4gKiAgICAgICAgIHRpdGxlOiAnWSBBeGlzJ1xuICogICAgICAgfSxcbiAqICAgICAgIHhBeGlzOiB7XG4gKiAgICAgICAgIHRpdGxlOiAnWCBBeGlzJ1xuICogICAgICAgfVxuICogICAgIH07XG4gKiB0dWkuY2hhcnQuY29sdW1uQ2hhcnQoY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKTtcbiAqL1xudHVpLmNoYXJ0LmNvbHVtbkNoYXJ0ID0gZnVuY3Rpb24oY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgb3B0aW9ucy5jaGFydFR5cGUgPSBjaGFydENvbnN0LkNIQVJUX1RZUEVfQ09MVU1OO1xuICAgIHJldHVybiBfY3JlYXRlQ2hhcnQoY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKTtcbn07XG5cbi8qKlxuICogTGluZSBjaGFydCBjcmVhdG9yLlxuICogQG1lbWJlck9mIHR1aS5jaGFydFxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNoYXJ0IGNvbnRhaW5lclxuICogQHBhcmFtIHtvYmplY3R9IGRhdGEgY2hhcnQgZGF0YVxuICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBkYXRhLmNhdGVnb3JpZXMgY2F0ZWdvcmllc1xuICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IGRhdGEuc2VyaWVzIHNlcmllcyBkYXRhXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLmNoYXJ0IGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LndpZHRoIGNoYXJ0IHdpZHRoXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5jaGFydC5oZWlnaHQgY2hhcnQgaGVpZ2h0XG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC50aXRsZSBjaGFydCB0aXRsZVxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuY2hhcnQuZm9ybWF0IHZhbHVlIGZvcm1hdFxuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy55QXhpcyBvcHRpb25zIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnlBeGlzLnRpdGxlIHRpdGxlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnlBeGlzLm1pbiBtaW5pbWFsIHZhbHVlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnlBeGlzLm1heCBtYXhpbXVtIHZhbHVlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMueEF4aXMgb3B0aW9ucyBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnhBeGlzLnRpdGxlIHRpdGxlIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMueEF4aXMubGFiZWxJbnRlcnZhbCBsYWJlbCBpbnRlcnZhbCBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuc2VyaWVzIG9wdGlvbnMgb2Ygc2VyaWVzXG4gKiAgICAgICAgICBAcGFyYW0ge2Jvb2xlYW59IG9wdGlvbnMuc2VyaWVzLmhhc0RvdCB3aGV0aGVyIGhhcyBkb3Qgb3Igbm90XG4gKiAgICAgICAgICBAcGFyYW0ge2Jvb2xlYW59IG9wdGlvbnMuc2VyaWVzLnNob3dMYWJlbCB3aGV0aGVyIHNob3cgbGFiZWwgb3Igbm90XG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnRvb2x0aXAgb3B0aW9ucyBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnN1ZmZpeCBzdWZmaXggb2YgdG9vbHRpcFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC50ZW1wbGF0ZSB0ZW1wbGF0ZSBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnBvc2l0aW9uIHRvb2x0aXAgcG9zaXRpb24gdHlwZVxuICogICAgICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMudG9vbHRpcC5hZGRQb3NpdGlvbiBhZGQgcG9zaXRpb25cbiAqICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uLmxlZnQgYWRkIGxlZnQgcG9zaXRpb25cbiAqICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uLnRvcCBhZGQgdG9wIHBvc2l0aW9uXG4gKiAgICAgICAgICBAcGFyYW0ge2Jvb2xlYW59IG9wdGlvbnMudG9vbHRpcC5ncm91cGVkIHdoZXRoZXIgZ3JvdXAgdG9vbHRpcCBvciBub3RcbiAqICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudGhlbWUgdGhlbWUgbmFtZVxuICogICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5saWJUeXBlIGdyYXBoIGxpYnJhcnkgdHlwZVxuICogQHJldHVybnMge29iamVjdH0gYmFyIGNoYXJ0XG4gKiBAZXhhbXBsZVxuICogdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWluZXItaWQnKSxcbiAqICAgICBkYXRhID0ge1xuICogICAgICAgY2F0ZWdvcmllczogWydjYXRlMScsICdjYXRlMicsICdjYXRlMyddLFxuICogICAgICAgc2VyaWVzOiBbXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMScsXG4gKiAgICAgICAgICAgZGF0YTogWzIwLCAzMCwgNTBdXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMicsXG4gKiAgICAgICAgICAgZGF0YTogWzQwLCA0MCwgNjBdXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMycsXG4gKiAgICAgICAgICAgZGF0YTogWzYwLCA1MCwgMTBdXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kNCcsXG4gKiAgICAgICAgICAgZGF0YTogWzgwLCAxMCwgNzBdXG4gKiAgICAgICAgIH1cbiAqICAgICAgIF1cbiAqICAgICB9LFxuICogICAgIG9wdGlvbnMgPSB7XG4gKiAgICAgICBjaGFydDoge1xuICogICAgICAgICB0aXRsZTogJ0xpbmUgQ2hhcnQnXG4gKiAgICAgICB9LFxuICogICAgICAgeUF4aXM6IHtcbiAqICAgICAgICAgdGl0bGU6ICdZIEF4aXMnXG4gKiAgICAgICB9LFxuICogICAgICAgeEF4aXM6IHtcbiAqICAgICAgICAgdGl0bGU6ICdYIEF4aXMnXG4gKiAgICAgICB9LFxuICogICAgICAgc2VyaWVzOiB7XG4gKiAgICAgICAgIGhhc0RvdDogdHJ1ZVxuICogICAgICAgfVxuICogICAgIH07XG4gKiB0dWkuY2hhcnQubGluZUNoYXJ0KGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucyk7XG4gKi9cbnR1aS5jaGFydC5saW5lQ2hhcnQgPSBmdW5jdGlvbihjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICBvcHRpb25zLmNoYXJ0VHlwZSA9IGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9MSU5FO1xuICAgIHJldHVybiBfY3JlYXRlQ2hhcnQoY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKTtcbn07XG5cbi8qKlxuICogQXJlYSBjaGFydCBjcmVhdG9yLlxuICogQG1lbWJlck9mIHR1aS5jaGFydFxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNoYXJ0IGNvbnRhaW5lclxuICogQHBhcmFtIHtvYmplY3R9IGRhdGEgY2hhcnQgZGF0YVxuICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBkYXRhLmNhdGVnb3JpZXMgY2F0ZWdvcmllc1xuICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IGRhdGEuc2VyaWVzIHNlcmllcyBkYXRhXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLmNoYXJ0IGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LndpZHRoIGNoYXJ0IHdpZHRoXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5jaGFydC5oZWlnaHQgY2hhcnQgaGVpZ2h0XG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC50aXRsZSBjaGFydCB0aXRsZVxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuY2hhcnQuZm9ybWF0IHZhbHVlIGZvcm1hdFxuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy55QXhpcyBvcHRpb25zIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnlBeGlzLnRpdGxlIHRpdGxlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnlBeGlzLm1pbiBtaW5pbWFsIHZhbHVlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnlBeGlzLm1heCBtYXhpbXVtIHZhbHVlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMueEF4aXMgb3B0aW9ucyBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnhBeGlzLnRpdGxlIHRpdGxlIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMueEF4aXMubGFiZWxJbnRlcnZhbCBsYWJlbCBpbnRlcnZhbCBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuc2VyaWVzIG9wdGlvbnMgb2Ygc2VyaWVzXG4gKiAgICAgICAgICBAcGFyYW0ge2Jvb2xlYW59IG9wdGlvbnMuc2VyaWVzLmhhc0RvdCB3aGV0aGVyIGhhcyBkb3Qgb3Igbm90XG4gKiAgICAgICAgICBAcGFyYW0ge2Jvb2xlYW59IG9wdGlvbnMuc2VyaWVzLnNob3dMYWJlbCB3aGV0aGVyIHNob3cgbGFiZWwgb3Igbm90XG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnRvb2x0aXAgb3B0aW9ucyBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnN1ZmZpeCBzdWZmaXggb2YgdG9vbHRpcFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC50ZW1wbGF0ZSB0ZW1wbGF0ZSBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnBvc2l0aW9uIHRvb2x0aXAgcG9zaXRpb24gdHlwZVxuICogICAgICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMudG9vbHRpcC5hZGRQb3NpdGlvbiBhZGQgcG9zaXRpb25cbiAqICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uLmxlZnQgYWRkIGxlZnQgcG9zaXRpb25cbiAqICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uLnRvcCBhZGQgdG9wIHBvc2l0aW9uXG4gKiAgICAgICAgICBAcGFyYW0ge2Jvb2xlYW59IG9wdGlvbnMudG9vbHRpcC5ncm91cGVkIHdoZXRoZXIgZ3JvdXAgdG9vbHRpcCBvciBub3RcbiAqICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudGhlbWUgdGhlbWUgbmFtZVxuICogICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5saWJUeXBlIGdyYXBoIGxpYnJhcnkgdHlwZVxuICogQHJldHVybnMge29iamVjdH0gYmFyIGNoYXJ0XG4gKiBAZXhhbXBsZVxuICogdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWluZXItaWQnKSxcbiAqICAgICBkYXRhID0ge1xuICogICAgICAgY2F0ZWdvcmllczogWydjYXRlMScsICdjYXRlMicsICdjYXRlMyddLFxuICogICAgICAgc2VyaWVzOiBbXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMScsXG4gKiAgICAgICAgICAgZGF0YTogWzIwLCAzMCwgNTBdXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMicsXG4gKiAgICAgICAgICAgZGF0YTogWzQwLCA0MCwgNjBdXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMycsXG4gKiAgICAgICAgICAgZGF0YTogWzYwLCA1MCwgMTBdXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kNCcsXG4gKiAgICAgICAgICAgZGF0YTogWzgwLCAxMCwgNzBdXG4gKiAgICAgICAgIH1cbiAqICAgICAgIF1cbiAqICAgICB9LFxuICogICAgIG9wdGlvbnMgPSB7XG4gKiAgICAgICBjaGFydDoge1xuICogICAgICAgICB0aXRsZTogJ0FyZWEgQ2hhcnQnXG4gKiAgICAgICB9LFxuICogICAgICAgeUF4aXM6IHtcbiAqICAgICAgICAgdGl0bGU6ICdZIEF4aXMnXG4gKiAgICAgICB9LFxuICogICAgICAgeEF4aXM6IHtcbiAqICAgICAgICAgdGl0bGU6ICdYIEF4aXMnXG4gKiAgICAgICB9XG4gKiAgICAgfTtcbiAqIHR1aS5jaGFydC5hcmVhQ2hhcnQoY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKTtcbiAqL1xudHVpLmNoYXJ0LmFyZWFDaGFydCA9IGZ1bmN0aW9uKGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIG9wdGlvbnMuY2hhcnRUeXBlID0gY2hhcnRDb25zdC5DSEFSVF9UWVBFX0FSRUE7XG4gICAgcmV0dXJuIF9jcmVhdGVDaGFydChjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpO1xufTtcblxuLyoqXG4gKiBDb21ibyBjaGFydCBjcmVhdG9yLlxuICogQG1lbWJlck9mIHR1aS5jaGFydFxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNoYXJ0IGNvbnRhaW5lclxuICogQHBhcmFtIHtvYmplY3R9IGRhdGEgY2hhcnQgZGF0YVxuICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBkYXRhLmNhdGVnb3JpZXMgY2F0ZWdvcmllc1xuICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IGRhdGEuc2VyaWVzIHNlcmllcyBkYXRhXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLmNoYXJ0IGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LndpZHRoIGNoYXJ0IHdpZHRoXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5jaGFydC5oZWlnaHQgY2hhcnQgaGVpZ2h0XG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC50aXRsZSBjaGFydCB0aXRsZVxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuY2hhcnQuZm9ybWF0IHZhbHVlIGZvcm1hdFxuICogICAgICBAcGFyYW0ge29iamVjdFtdfSBvcHRpb25zLnlBeGlzIG9wdGlvbnMgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMueUF4aXNbXS50aXRsZSB0aXRsZSBvZiB2ZXJ0aWNhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy55QXhpc1tdLm1pbiBtaW5pbWFsIHZhbHVlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnlBeGlzW10ubWF4IG1heGltdW0gdmFsdWUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy54QXhpcyBvcHRpb25zIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMueEF4aXMudGl0bGUgdGl0bGUgb2YgaG9yaXpvbnRhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy54QXhpcy5sYWJlbEludGVydmFsIGxhYmVsIGludGVydmFsIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5zZXJpZXMgb3B0aW9ucyBvZiBzZXJpZXNcbiAqICAgICAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnNlcmllcy5jb2x1bW4gb3B0aW9ucyBvZiBjb2x1bW4gc2VyaWVzXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuc2VyaWVzLmNvbHVtbi5zdGFja2VkIHN0YWNrZWQgdHlwZVxuICogICAgICAgICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5zZXJpZXMuY29sdW1uLnNob3dMYWJlbCB3aGV0aGVyIHNob3cgbGFiZWwgb3Igbm90XG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5zZXJpZXMubGluZSBvcHRpb25zIG9mIGxpbmUgc2VyaWVzXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtib29sZWFufSBvcHRpb25zLnNlcmllcy5saW5lLmhhc0RvdCB3aGV0aGVyIGhhcyBkb3Qgb3Igbm90XG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtib29sZWFufSBvcHRpb25zLnNlcmllcy5saW5lLnNob3dMYWJlbCB3aGV0aGVyIHNob3cgbGFiZWwgb3Igbm90XG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnRvb2x0aXAgb3B0aW9ucyBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy50b29sdGlwLmNvbHVtbiBvcHRpb25zIG9mIGNvbHVtbiB0b29sdGlwXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC5jb2x1bW4uc3VmZml4IHN1ZmZpeCBvZiB0b29sdGlwXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC5jb2x1bW4udGVtcGxhdGUgdGVtcGxhdGUgb2YgdG9vbHRpcFxuICogICAgICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAuY29sdW1uLnBvc2l0aW9uIHRvb2x0aXAgcG9zaXRpb24gdHlwZVxuICogICAgICAgICAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnRvb2x0aXAuY29sdW1uLmFkZFBvc2l0aW9uIGFkZCBwb3NpdGlvblxuICogICAgICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy50b29sdGlwLmNvbHVtbi5hZGRQb3NpdGlvbi5sZWZ0IGFkZCBsZWZ0IHBvc2l0aW9uXG4gKiAgICAgICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuY29sdW1uLmFkZFBvc2l0aW9uLnRvcCBhZGQgdG9wIHBvc2l0aW9uXG4gKiAgICAgICAgICBAcGFyYW0ge2Jvb2xlYW59IG9wdGlvbnMudG9vbHRpcC5ncm91cGVkIHdoZXRoZXIgZ3JvdXAgdG9vbHRpcCBvciBub3RcbiAqICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudGhlbWUgdGhlbWUgbmFtZVxuICogICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5saWJUeXBlIGdyYXBoIGxpYnJhcnkgdHlwZVxuICogQHJldHVybnMge29iamVjdH0gYmFyIGNoYXJ0XG4gKiBAZXhhbXBsZVxuICogdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWluZXItaWQnKSxcbiAqICAgICBkYXRhID0ge1xuICogICAgICAgY2F0ZWdvcmllczogWydjYXRlMScsICdjYXRlMicsICdjYXRlMyddLFxuICogICAgICAgc2VyaWVzOiB7XG4gKiAgICAgICAgIGNvbHVtbjogW1xuICogICAgICAgICAgIHtcbiAqICAgICAgICAgICAgIG5hbWU6ICdMZWdlbmQxJyxcbiAqICAgICAgICAgICAgIGRhdGE6IFsyMCwgMzAsIDUwXV1cbiAqICAgICAgICAgICB9LFxuICogICAgICAgICAgIHtcbiAqICAgICAgICAgICAgIG5hbWU6ICdMZWdlbmQyJyxcbiAqICAgICAgICAgICAgIGRhdGE6IFs0MCwgNDAsIDYwXVxuICogICAgICAgICAgIH0sXG4gKiAgICAgICAgICAge1xuICogICAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDMnLFxuICogICAgICAgICAgICAgZGF0YTogWzYwLCA1MCwgMTBdXG4gKiAgICAgICAgICAgfSxcbiAqICAgICAgICAgICB7XG4gKiAgICAgICAgICAgICBuYW1lOiAnTGVnZW5kNCcsXG4gKiAgICAgICAgICAgICBkYXRhOiBbODAsIDEwLCA3MF1cbiAqICAgICAgICAgICB9XG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIGxpbmU6IFtcbiAqICAgICAgICAgICB7XG4gKiAgICAgICAgICAgICBuYW1lOiAnTGVnZW5kNScsXG4gKiAgICAgICAgICAgICBkYXRhOiBbMSwgMiwgM11cbiAqICAgICAgICAgICB9XG4gKiAgICAgICAgIF1cbiAqICAgICAgIH1cbiAqICAgICB9LFxuICogICAgIG9wdGlvbnMgPSB7XG4gKiAgICAgICBjaGFydDoge1xuICogICAgICAgICB0aXRsZTogJ0NvbWJvIENoYXJ0J1xuICogICAgICAgfSxcbiAqICAgICAgIHlBeGlzOltcbiAqICAgICAgICAge1xuICogICAgICAgICAgIHRpdGxlOiAnWSBBeGlzJyxcbiAqICAgICAgICAgICBjaGFydFR5cGU6ICdsaW5lJ1xuICogICAgICAgICB9LFxuICogICAgICAgICB7XG4gKiAgICAgICAgICAgdGl0bGU6ICdZIFJpZ2h0IEF4aXMnXG4gKiAgICAgICAgIH1cbiAqICAgICAgIF0sXG4gKiAgICAgICB4QXhpczoge1xuICogICAgICAgICB0aXRsZTogJ1ggQXhpcydcbiAqICAgICAgIH0sXG4gKiAgICAgICBzZXJpZXM6IHtcbiAqICAgICAgICAgaGFzRG90OiB0cnVlXG4gKiAgICAgICB9XG4gKiAgICAgfTtcbiAqIHR1aS5jaGFydC5jb21ib0NoYXJ0KGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucyk7XG4gKi9cbnR1aS5jaGFydC5jb21ib0NoYXJ0ID0gZnVuY3Rpb24oY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgb3B0aW9ucy5jaGFydFR5cGUgPSBjaGFydENvbnN0LkNIQVJUX1RZUEVfQ09NQk87XG4gICAgcmV0dXJuIF9jcmVhdGVDaGFydChjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpO1xufTtcblxuLyoqXG4gKiBQaWUgY2hhcnQgY3JlYXRvci5cbiAqIEBtZW1iZXJPZiB0dWkuY2hhcnRcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciBjaGFydCBjb250YWluZXJcbiAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhIGNoYXJ0IGRhdGFcbiAqICAgICAgQHBhcmFtIHthcnJheS48YXJyYXk+fSBkYXRhLnNlcmllcyBzZXJpZXMgZGF0YVxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5jaGFydCBjaGFydCBvcHRpb25zXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5jaGFydC53aWR0aCBjaGFydCB3aWR0aFxuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMuY2hhcnQuaGVpZ2h0IGNoYXJ0IGhlaWdodFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuY2hhcnQudGl0bGUgY2hhcnQgdGl0bGVcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmNoYXJ0LmZvcm1hdCB2YWx1ZSBmb3JtYXRcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuc2VyaWVzIG9wdGlvbnMgb2Ygc2VyaWVzXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5zZXJpZXMubGVnZW5kVHlwZSBsZWdlbmQgdHlwZVxuICogICAgICAgICAgQHBhcmFtIHtib29sZWFufSBvcHRpb25zLnNlcmllcy5zaG93TGFiZWwgd2hldGhlciBzaG93IGxhYmVsIG9yIG5vdFxuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy50b29sdGlwIG9wdGlvbnMgb2YgdG9vbHRpcFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC5zdWZmaXggc3VmZml4IG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAudGVtcGxhdGUgdGVtcGxhdGUgb2YgdG9vbHRpcFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC5wb3NpdGlvbiB0b29sdGlwIHBvc2l0aW9uIHR5cGVcbiAqICAgICAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24gYWRkIHBvc2l0aW9uXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMudG9vbHRpcC5hZGRQb3NpdGlvbi5sZWZ0IGFkZCBsZWZ0IHBvc2l0aW9uXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMudG9vbHRpcC5hZGRQb3NpdGlvbi50b3AgYWRkIHRvcCBwb3NpdGlvblxuICogICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50aGVtZSB0aGVtZSBuYW1lXG4gKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmxpYlR5cGUgZ3JhcGggbGlicmFyeSB0eXBlXG4gKiBAcmV0dXJucyB7b2JqZWN0fSBiYXIgY2hhcnRcbiAqIEBleGFtcGxlXG4gKiB2YXIgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhaW5lci1pZCcpLFxuICogICAgIGRhdGEgPSB7XG4gKiAgICAgICBzZXJpZXM6IFtcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQxJyxcbiAqICAgICAgICAgICBkYXRhOiAyMFxuICogICAgICAgICB9LFxuICogICAgICAgICB7XG4gKiAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDInLFxuICogICAgICAgICAgIGRhdGE6IDQwXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMycsXG4gKiAgICAgICAgICAgZGF0YTogNjBcbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQ0JyxcbiAqICAgICAgICAgICBkYXRhOiA4MFxuICogICAgICAgICB9XG4gKiAgICAgICBdXG4gKiAgICAgfSxcbiAqICAgICBvcHRpb25zID0ge1xuICogICAgICAgY2hhcnQ6IHtcbiAqICAgICAgICAgdGl0bGU6ICdQaWUgQ2hhcnQnXG4gKiAgICAgICB9XG4gKiAgICAgfTtcbiAqIHR1aS5jaGFydC5waWVDaGFydChjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpO1xuICovXG50dWkuY2hhcnQucGllQ2hhcnQgPSBmdW5jdGlvbihjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICBvcHRpb25zLmNoYXJ0VHlwZSA9IGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9QSUU7XG4gICAgcmV0dXJuIF9jcmVhdGVDaGFydChjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpO1xufTtcblxuLyoqXG4gKiBSZWdpc3RlciB0aGVtZS5cbiAqIEBtZW1iZXJPZiB0dWkuY2hhcnRcbiAqIEBwYXJhbSB7c3RyaW5nfSB0aGVtZU5hbWUgdGhlbWUgbmFtZVxuICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIGFwcGxpY2F0aW9uIGNoYXJ0IHRoZW1lXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSB0aGVtZS5jaGFydCBjaGFydCB0aGVtZVxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLmNoYXJ0LmZvbnRGYW1pbHkgZm9udCBmYW1pbHkgb2YgY2hhcnRcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS5jaGFydC5iYWNrZ3JvdW5kIGJhY2tncm91bmQgb2YgY2hhcnRcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IHRoZW1lLnRpdGxlIGNoYXJ0IHRoZW1lXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gdGhlbWUudGl0bGUuZm9udFNpemUgZm9udCBzaXplIG9mIGNoYXJ0IHRpdGxlXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUudGl0bGUuZm9udEZhbWlseSBmb250IGZhbWlseSBvZiBjaGFydCB0aXRsZVxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnRpdGxlLmNvbG9yIGZvbnQgY29sb3Igb2YgY2hhcnQgdGl0bGVcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS50aXRsZS5iYWNrZ3JvdW5kIGJhY2tncm91bmQgb2YgY2hhcnQgdGl0bGVcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IHRoZW1lLnlBeGlzIHRoZW1lIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7b2JqZWN0fSB0aGVtZS55QXhpcy50aXRsZSB0aGVtZSBvZiB2ZXJ0aWNhbCBheGlzIHRpdGxlXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IHRoZW1lLnlBeGlzLnRpdGxlLmZvbnRTaXplIGZvbnQgc2l6ZSBvZiB2ZXJ0aWNhbCBheGlzIHRpdGxlXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnlBeGlzLnRpdGxlLmZvbnRGYW1pbHkgZm9udCBmYW1pbHkgb2YgdmVydGljYWwgYXhpcyB0aXRsZVxuICogICAgICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS55QXhpcy50aXRsZS5jb2xvciBmb250IGNvbG9yIG9mIHZlcnRpY2FsIGF4aXMgdGl0bGVcbiAqICAgICAgICAgIEBwYXJhbSB7b2JqZWN0fSB0aGVtZS55QXhpcy5sYWJlbCB0aGVtZSBvZiB2ZXJ0aWNhbCBheGlzIGxhYmVsXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IHRoZW1lLnlBeGlzLmxhYmVsLmZvbnRTaXplIGZvbnQgc2l6ZSBvZiB2ZXJ0aWNhbCBheGlzIGxhYmVsXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnlBeGlzLmxhYmVsLmZvbnRGYW1pbHkgZm9udCBmYW1pbHkgb2YgdmVydGljYWwgYXhpcyBsYWJlbFxuICogICAgICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS55QXhpcy5sYWJlbC5jb2xvciBmb250IGNvbG9yIG9mIHZlcnRpY2FsIGF4aXMgbGFiZWxcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS55QXhpcy50aWNrY29sb3IgY29sb3Igb2YgdmVydGljYWwgYXhpcyB0aWNrXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSB0aGVtZS54QXhpcyB0aGVtZSBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7b2JqZWN0fSB0aGVtZS54QXhpcy50aXRsZSB0aGVtZSBvZiBob3Jpem9udGFsIGF4aXMgdGl0bGVcbiAqICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gdGhlbWUueEF4aXMudGl0bGUuZm9udFNpemUgZm9udCBzaXplIG9mIGhvcml6b250YWwgYXhpcyB0aXRsZVxuICogICAgICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS54QXhpcy50aXRsZS5mb250RmFtaWx5IGZvbnQgZmFtaWx5IG9mIGhvcml6b250YWwgYXhpcyB0aXRsZVxuICogICAgICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS54QXhpcy50aXRsZS5jb2xvciBmb250IGNvbG9yIG9mIGhvcml6b250YWwgYXhpcyB0aXRsZVxuICogICAgICAgICAgQHBhcmFtIHtvYmplY3R9IHRoZW1lLnhBeGlzLmxhYmVsIHRoZW1lIG9mIGhvcml6b250YWwgYXhpcyBsYWJlbFxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSB0aGVtZS54QXhpcy5sYWJlbC5mb250U2l6ZSBmb250IHNpemUgb2YgaG9yaXpvbnRhbCBheGlzIGxhYmVsXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnhBeGlzLmxhYmVsLmZvbnRGYW1pbHkgZm9udCBmYW1pbHkgb2YgaG9yaXpvbnRhbCBheGlzIGxhYmVsXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnhBeGlzLmxhYmVsLmNvbG9yIGZvbnQgY29sb3Igb2YgaG9yaXpvbnRhbCBheGlzIGxhYmVsXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUueEF4aXMudGlja2NvbG9yIGNvbG9yIG9mIGhvcml6b250YWwgYXhpcyB0aWNrXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSB0aGVtZS5wbG90IHBsb3QgdGhlbWVcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS5wbG90LmxpbmVDb2xvciBwbG90IGxpbmUgY29sb3JcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS5wbG90LmJhY2tncm91bmQgcGxvdCBiYWNrZ3JvdW5kXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSB0aGVtZS5zZXJpZXMgc2VyaWVzIHRoZW1lXG4gKiAgICAgICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSB0aGVtZS5zZXJpZXMuY29sb3JzIHNlcmllcyBjb2xvcnNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS5zZXJpZXMuYm9yZGVyQ29sb3Igc2VyaWVzIGJvcmRlciBjb2xvclxuICogICAgICBAcGFyYW0ge29iamVjdH0gdGhlbWUubGVnZW5kIGxlZ2VuZCB0aGVtZVxuICogICAgICAgICAgQHBhcmFtIHtvYmplY3R9IHRoZW1lLmxlZ2VuZC5sYWJlbCB0aGVtZSBvZiBsZWdlbmQgbGFiZWxcbiAqICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gdGhlbWUubGVnZW5kLmxhYmVsLmZvbnRTaXplIGZvbnQgc2l6ZSBvZiBsZWdlbmQgbGFiZWxcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUubGVnZW5kLmxhYmVsLmZvbnRGYW1pbHkgZm9udCBmYW1pbHkgb2YgbGVnZW5kIGxhYmVsXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLmxlZ2VuZC5sYWJlbC5jb2xvciBmb250IGNvbG9yIG9mIGxlZ2VuZCBsYWJlbFxuICogQGV4YW1wbGVcbiAqIHZhciB0aGVtZSA9IHtcbiAqICAgeUF4aXM6IHtcbiAqICAgICB0aWNrQ29sb3I6ICcjY2NiZDlhJyxcbiAqICAgICAgIHRpdGxlOiB7XG4gKiAgICAgICAgIGNvbG9yOiAnIzMzMzMzMydcbiAqICAgICAgIH0sXG4gKiAgICAgICBsYWJlbDoge1xuICogICAgICAgICBjb2xvcjogJyM2ZjQ5MWQnXG4gKiAgICAgICB9XG4gKiAgICAgfSxcbiAqICAgICB4QXhpczoge1xuICogICAgICAgdGlja0NvbG9yOiAnI2NjYmQ5YScsXG4gKiAgICAgICB0aXRsZToge1xuICogICAgICAgICBjb2xvcjogJyMzMzMzMzMnXG4gKiAgICAgICB9LFxuICogICAgICAgbGFiZWw6IHtcbiAqICAgICAgICAgY29sb3I6ICcjNmY0OTFkJ1xuICogICAgICAgfVxuICogICAgIH0sXG4gKiAgICAgcGxvdDoge1xuICogICAgICAgbGluZUNvbG9yOiAnI2U1ZGJjNCcsXG4gKiAgICAgICBiYWNrZ3JvdW5kOiAnI2Y2ZjFlNSdcbiAqICAgICB9LFxuICogICAgIHNlcmllczoge1xuICogICAgICAgY29sb3JzOiBbJyM0MGFiYjQnLCAnI2U3OGEzMScsICcjYzFjNDUyJywgJyM3OTUyMjQnLCAnI2Y1ZjVmNSddLFxuICogICAgICAgYm9yZGVyQ29sb3I6ICcjOGU2NTM1J1xuICogICAgIH0sXG4gKiAgICAgbGVnZW5kOiB7XG4gKiAgICAgICBsYWJlbDoge1xuICogICAgICAgICBjb2xvcjogJyM2ZjQ5MWQnXG4gKiAgICAgICB9XG4gKiAgICAgfVxuICogICB9O1xuICogY2hhcnQucmVnaXN0ZXJUaGVtZSgnbmV3VGhlbWUnLCB0aGVtZSk7XG4gKi9cbnR1aS5jaGFydC5yZWdpc3RlclRoZW1lID0gZnVuY3Rpb24odGhlbWVOYW1lLCB0aGVtZSkge1xuICAgIHRoZW1lRmFjdG9yeS5yZWdpc3Rlcih0aGVtZU5hbWUsIHRoZW1lKTtcbn07XG5cbi8qKlxuICogUmVnaXN0ZXIgZ3JhcGggcGx1Z2luLlxuICogQG1lbWJlck9mIHR1aS5jaGFydFxuICogQHBhcmFtIHtzdHJpbmd9IGxpYlR5cGUgdHlwZSBvZiBncmFwaCBsaWJyYXJ5XG4gKiBAcGFyYW0ge29iamVjdH0gcGx1Z2luIHBsdWdpbiB0byBjb250cm9sIGxpYnJhcnlcbiAqIEBleGFtcGxlXG4gKiB2YXIgcGx1Z2luUmFwaGFlbCA9IHtcbiAqICAgYmFyOiBmdW5jdGlvbigpIHt9IC8vIFJlbmRlciBjbGFzc1xuICogfTtcbiAqIHR1aS5jaGFydC5yZWdpc3RlclBsdWdpbigncmFwaGFlbCcsIHBsdWdpblJhcGhhZWwpO1xuICovXG50dWkuY2hhcnQucmVnaXN0ZXJQbHVnaW4gPSBmdW5jdGlvbihsaWJUeXBlLCBwbHVnaW4pIHtcbiAgICBwbHVnaW5GYWN0b3J5LnJlZ2lzdGVyKGxpYlR5cGUsIHBsdWdpbik7XG59O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEFyZWEgY2hhcnRcbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIENoYXJ0QmFzZSA9IHJlcXVpcmUoJy4vY2hhcnRCYXNlJyksXG4gICAgbGluZVR5cGVNaXhlciA9IHJlcXVpcmUoJy4vbGluZVR5cGVNaXhlcicpLFxuICAgIGF4aXNUeXBlTWl4ZXIgPSByZXF1aXJlKCcuL2F4aXNUeXBlTWl4ZXInKSxcbiAgICB2ZXJ0aWNhbFR5cGVNaXhlciA9IHJlcXVpcmUoJy4vdmVydGljYWxUeXBlTWl4ZXInKSxcbiAgICBTZXJpZXMgPSByZXF1aXJlKCcuLi9zZXJpZXMvYXJlYUNoYXJ0U2VyaWVzJyk7XG5cbnZhciBBcmVhQ2hhcnQgPSB0dWkudXRpbC5kZWZpbmVDbGFzcyhDaGFydEJhc2UsIC8qKiBAbGVuZHMgTGluZUNoYXJ0LnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogY2xhc3NOYW1lXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICBjbGFzc05hbWU6ICd0dWktYXJlYS1jaGFydCcsXG5cbiAgICAvKipcbiAgICAgKiBTZXJpZXMgY2xhc3NcbiAgICAgKiBAdHlwZSB7ZnVuY3Rpb259XG4gICAgICovXG4gICAgU2VyaWVzOiBTZXJpZXMsXG5cbiAgICAvKipcbiAgICAgKiBBcmVhIGNoYXJ0LlxuICAgICAqIEBjb25zdHJ1Y3RzIEFyZWFDaGFydFxuICAgICAqIEBleHRlbmRzIENoYXJ0QmFzZVxuICAgICAqIEBtaXhlcyBheGlzVHlwZU1peGVyXG4gICAgICogQG1peGVzIHZlcnRpY2FsVHlwZU1peGVyXG4gICAgICogQG1peGVzIGxpbmVUeXBlTWl4ZXJcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5saW5lVHlwZUluaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG59KTtcblxubGluZVR5cGVNaXhlci5taXhpbihBcmVhQ2hhcnQpO1xuYXhpc1R5cGVNaXhlci5taXhpbihBcmVhQ2hhcnQpO1xudmVydGljYWxUeXBlTWl4ZXIubWl4aW4oQXJlYUNoYXJ0KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBcmVhQ2hhcnQ7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgYXhpc1R5cGVNaXhlciBpcyBtaXhlciBvZiBheGlzIHR5cGUgY2hhcnQoYmFyLCBjb2x1bW4sIGxpbmUsIGFyZWEpLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQXhpcyA9IHJlcXVpcmUoJy4uL2F4ZXMvYXhpcycpLFxuICAgIFBsb3QgPSByZXF1aXJlKCcuLi9wbG90cy9wbG90JyksXG4gICAgTGVnZW5kID0gcmVxdWlyZSgnLi4vbGVnZW5kcy9sZWdlbmQnKSxcbiAgICBUb29sdGlwID0gcmVxdWlyZSgnLi4vdG9vbHRpcHMvdG9vbHRpcCcpLFxuICAgIEdyb3VwVG9vbHRpcCA9IHJlcXVpcmUoJy4uL3Rvb2x0aXBzL2dyb3VwVG9vbHRpcCcpO1xuXG4vKipcbiAqIGF4aXNUeXBlTWl4ZXIgaXMgYmFzZSBjbGFzcyBvZiBheGlzIHR5cGUgY2hhcnQoYmFyLCBjb2x1bW4sIGxpbmUsIGFyZWEpLlxuICogQG1peGluXG4gKi9cbnZhciBheGlzVHlwZU1peGVyID0ge1xuICAgIC8qKlxuICAgICAqIEFkZCBheGlzIGNvbXBvbmVudHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuY292ZXJ0RGF0YSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5heGVzIGF4ZXMgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5wbG90RGF0YSBwbG90IGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7ZnVuY3Rpb259IHBhcmFtcy5TZXJpZXMgc2VyaWVzIGNsYXNzXG4gICAgICovXG4gICAgYWRkQXhpc0NvbXBvbmVudHM6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgY29udmVydGVkRGF0YSA9IHBhcmFtcy5jb252ZXJ0ZWREYXRhLFxuICAgICAgICAgICAgb3B0aW9ucyA9IHRoaXMub3B0aW9ucyxcbiAgICAgICAgICAgIGFsaWduZWQgPSAhIXBhcmFtcy5hbGlnbmVkO1xuXG4gICAgICAgIGlmIChwYXJhbXMucGxvdERhdGEpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KCdwbG90JywgUGxvdCwgcGFyYW1zLnBsb3REYXRhKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHR1aS51dGlsLmZvckVhY2gocGFyYW1zLmF4ZXMsIGZ1bmN0aW9uKGRhdGEsIG5hbWUpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KG5hbWUsIEF4aXMsIHtcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICAgICAgICAgIGFsaWduZWQ6IGFsaWduZWRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICBpZiAoY29udmVydGVkRGF0YS5qb2luTGVnZW5kTGFiZWxzKSB7XG4gICAgICAgICAgICB0aGlzLmFkZENvbXBvbmVudCgnbGVnZW5kJywgTGVnZW5kLCB7XG4gICAgICAgICAgICAgICAgam9pbkxlZ2VuZExhYmVsczogY29udmVydGVkRGF0YS5qb2luTGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgICAgIGxlZ2VuZExhYmVsczogY29udmVydGVkRGF0YS5sZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICAgICAgY2hhcnRUeXBlOiBwYXJhbXMuY2hhcnRUeXBlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KCdzZXJpZXMnLCBwYXJhbXMuU2VyaWVzLCB0dWkudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgbGliVHlwZTogb3B0aW9ucy5saWJUeXBlLFxuICAgICAgICAgICAgY2hhcnRUeXBlOiBvcHRpb25zLmNoYXJ0VHlwZSxcbiAgICAgICAgICAgIHBhcmVudENoYXJ0VHlwZTogb3B0aW9ucy5wYXJlbnRDaGFydFR5cGUsXG4gICAgICAgICAgICBhbGlnbmVkOiBhbGlnbmVkLFxuICAgICAgICAgICAgaXNTdWJDaGFydDogdGhpcy5pc1N1YkNoYXJ0LFxuICAgICAgICAgICAgaXNHcm91cGVkVG9vbHRpcDogdGhpcy5pc0dyb3VwZWRUb29sdGlwXG4gICAgICAgIH0sIHBhcmFtcy5zZXJpZXNEYXRhKSk7XG5cbiAgICAgICAgaWYgKHRoaXMuaXNHcm91cGVkVG9vbHRpcCkge1xuICAgICAgICAgICAgdGhpcy5hZGRDb21wb25lbnQoJ3Rvb2x0aXAnLCBHcm91cFRvb2x0aXAsIHtcbiAgICAgICAgICAgICAgICBsYWJlbHM6IGNvbnZlcnRlZERhdGEubGFiZWxzLFxuICAgICAgICAgICAgICAgIGpvaW5Gb3JtYXR0ZWRWYWx1ZXM6IGNvbnZlcnRlZERhdGEuam9pbkZvcm1hdHRlZFZhbHVlcyxcbiAgICAgICAgICAgICAgICBqb2luTGVnZW5kTGFiZWxzOiBjb252ZXJ0ZWREYXRhLmpvaW5MZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICAgICAgY2hhcnRJZDogdGhpcy5jaGFydElkXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KCd0b29sdGlwJywgVG9vbHRpcCwge1xuICAgICAgICAgICAgICAgIHZhbHVlczogY29udmVydGVkRGF0YS52YWx1ZXMsXG4gICAgICAgICAgICAgICAgZm9ybWF0dGVkVmFsdWVzOiBjb252ZXJ0ZWREYXRhLmZvcm1hdHRlZFZhbHVlcyxcbiAgICAgICAgICAgICAgICBsYWJlbHM6IGNvbnZlcnRlZERhdGEubGFiZWxzLFxuICAgICAgICAgICAgICAgIGxlZ2VuZExhYmVsczogY29udmVydGVkRGF0YS5sZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICAgICAgY2hhcnRJZDogdGhpcy5jaGFydElkLFxuICAgICAgICAgICAgICAgIGlzVmVydGljYWw6IHRoaXMuaXNWZXJ0aWNhbFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBwbG90IGRhdGEuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBsb3REYXRhIGluaXRpYWxpemVkIHBsb3QgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBheGVzRGF0YSBheGVzIGRhdGFcbiAgICAgKiBAcmV0dXJucyB7e3ZUaWNrQ291bnQ6IG51bWJlciwgaFRpY2tDb3VudDogbnVtYmVyfX0gcGxvdCBkYXRhXG4gICAgICovXG4gICAgbWFrZVBsb3REYXRhOiBmdW5jdGlvbihwbG90RGF0YSwgYXhlc0RhdGEpIHtcbiAgICAgICAgaWYgKHR1aS51dGlsLmlzVW5kZWZpbmVkKHBsb3REYXRhKSkge1xuICAgICAgICAgICAgcGxvdERhdGEgPSB7XG4gICAgICAgICAgICAgICAgdlRpY2tDb3VudDogYXhlc0RhdGEueUF4aXMudmFsaWRUaWNrQ291bnQsXG4gICAgICAgICAgICAgICAgaFRpY2tDb3VudDogYXhlc0RhdGEueEF4aXMudmFsaWRUaWNrQ291bnRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBsb3REYXRhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBNaXggaW4uXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gZnVuYyB0YXJnZXQgZnVuY3Rpb25cbiAgICAgKiBAaWdub3JlXG4gICAgICovXG4gICAgbWl4aW46IGZ1bmN0aW9uKGZ1bmMpIHtcbiAgICAgICAgdHVpLnV0aWwuZXh0ZW5kKGZ1bmMucHJvdG90eXBlLCB0aGlzKTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGF4aXNUeXBlTWl4ZXI7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgQmFyIGNoYXJ0LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ2hhcnRCYXNlID0gcmVxdWlyZSgnLi9jaGFydEJhc2UnKSxcbiAgICBheGlzVHlwZU1peGVyID0gcmVxdWlyZSgnLi9heGlzVHlwZU1peGVyJyksXG4gICAgYXhpc0RhdGFNYWtlciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvYXhpc0RhdGFNYWtlcicpLFxuICAgIFNlcmllcyA9IHJlcXVpcmUoJy4uL3Nlcmllcy9iYXJDaGFydFNlcmllcycpO1xuXG52YXIgQmFyQ2hhcnQgPSB0dWkudXRpbC5kZWZpbmVDbGFzcyhDaGFydEJhc2UsIC8qKiBAbGVuZHMgQmFyQ2hhcnQucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBCYXIgY2hhcnQuXG4gICAgICogQGNvbnN0cnVjdHMgQmFyQ2hhcnRcbiAgICAgKiBAZXh0ZW5kcyBDaGFydEJhc2VcbiAgICAgKiBAbWl4ZXMgYXhpc1R5cGVNaXhlclxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gdXNlckRhdGEgY2hhcnQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBjaGFydCB0aGVtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbih1c2VyRGF0YSwgdGhlbWUsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIGJhc2VEYXRhID0gdGhpcy5tYWtlQmFzZURhdGEodXNlckRhdGEsIHRoZW1lLCBvcHRpb25zLCB7XG4gICAgICAgICAgICAgICAgaGFzQXhlczogdHJ1ZVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBjb252ZXJ0ZWREYXRhID0gYmFzZURhdGEuY29udmVydGVkRGF0YSxcbiAgICAgICAgICAgIGJvdW5kcyA9IGJhc2VEYXRhLmJvdW5kcyxcbiAgICAgICAgICAgIGF4ZXNEYXRhID0gdGhpcy5fbWFrZUF4ZXNEYXRhKGNvbnZlcnRlZERhdGEsIGJvdW5kcywgb3B0aW9ucyk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGNsYXNzTmFtZVxuICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jbGFzc05hbWUgPSAndHVpLWJhci1jaGFydCc7XG5cbiAgICAgICAgQ2hhcnRCYXNlLmNhbGwodGhpcywge1xuICAgICAgICAgICAgYm91bmRzOiBib3VuZHMsXG4gICAgICAgICAgICBheGVzRGF0YTogYXhlc0RhdGEsXG4gICAgICAgICAgICB0aGVtZTogdGhlbWUsXG4gICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuX2FkZENvbXBvbmVudHMoY29udmVydGVkRGF0YSwgYXhlc0RhdGEsIG9wdGlvbnMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGF4ZXMgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb252ZXJ0ZWREYXRhIGNvbnZlcnRlZCBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGJvdW5kcyBjaGFydCBib3VuZHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogQHJldHVybnMge29iamVjdH0gYXhlcyBkYXRhXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUF4ZXNEYXRhOiBmdW5jdGlvbihjb252ZXJ0ZWREYXRhLCBib3VuZHMsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIGF4ZXNEYXRhID0ge1xuICAgICAgICAgICAgeUF4aXM6IGF4aXNEYXRhTWFrZXIubWFrZUxhYmVsQXhpc0RhdGEoe1xuICAgICAgICAgICAgICAgIGxhYmVsczogY29udmVydGVkRGF0YS5sYWJlbHMsXG4gICAgICAgICAgICAgICAgaXNWZXJ0aWNhbDogdHJ1ZVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICB4QXhpczogYXhpc0RhdGFNYWtlci5tYWtlVmFsdWVBeGlzRGF0YSh7XG4gICAgICAgICAgICAgICAgdmFsdWVzOiBjb252ZXJ0ZWREYXRhLnZhbHVlcyxcbiAgICAgICAgICAgICAgICBzZXJpZXNEaW1lbnNpb246IGJvdW5kcy5zZXJpZXMuZGltZW5zaW9uLFxuICAgICAgICAgICAgICAgIHN0YWNrZWQ6IG9wdGlvbnMuc2VyaWVzICYmIG9wdGlvbnMuc2VyaWVzLnN0YWNrZWQgfHwgJycsXG4gICAgICAgICAgICAgICAgY2hhcnRUeXBlOiBvcHRpb25zLmNoYXJ0VHlwZSxcbiAgICAgICAgICAgICAgICBmb3JtYXRGdW5jdGlvbnM6IGNvbnZlcnRlZERhdGEuZm9ybWF0RnVuY3Rpb25zLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IG9wdGlvbnMueEF4aXNcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBheGVzRGF0YTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIGNvbXBvbmVudHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udmVydGVkRGF0YSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBheGVzRGF0YSBheGVzIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYWRkQ29tcG9uZW50czogZnVuY3Rpb24oY29udmVydGVkRGF0YSwgYXhlc0RhdGEsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIHBsb3REYXRhLCBzZXJpZXNEYXRhO1xuXG4gICAgICAgIHBsb3REYXRhID0gdGhpcy5tYWtlUGxvdERhdGEoY29udmVydGVkRGF0YS5wbG90RGF0YSwgYXhlc0RhdGEpO1xuICAgICAgICBzZXJpZXNEYXRhID0ge1xuICAgICAgICAgICAgYWxsb3dOZWdhdGl2ZVRvb2x0aXA6IHRydWUsXG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgdmFsdWVzOiBjb252ZXJ0ZWREYXRhLnZhbHVlcyxcbiAgICAgICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXM6IGNvbnZlcnRlZERhdGEuZm9ybWF0dGVkVmFsdWVzLFxuICAgICAgICAgICAgICAgIGZvcm1hdEZ1bmN0aW9uczogY29udmVydGVkRGF0YS5mb3JtYXRGdW5jdGlvbnMsXG4gICAgICAgICAgICAgICAgc2NhbGU6IGF4ZXNEYXRhLnhBeGlzLnNjYWxlXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuYWRkQXhpc0NvbXBvbmVudHMoe1xuICAgICAgICAgICAgY29udmVydGVkRGF0YTogY29udmVydGVkRGF0YSxcbiAgICAgICAgICAgIGF4ZXM6IGF4ZXNEYXRhLFxuICAgICAgICAgICAgcGxvdERhdGE6IHBsb3REYXRhLFxuICAgICAgICAgICAgY2hhcnRUeXBlOiBvcHRpb25zLmNoYXJ0VHlwZSxcbiAgICAgICAgICAgIFNlcmllczogU2VyaWVzLFxuICAgICAgICAgICAgc2VyaWVzRGF0YTogc2VyaWVzRGF0YVxuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxuYXhpc1R5cGVNaXhlci5taXhpbihCYXJDaGFydCk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmFyQ2hhcnQ7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgQ2hhcnRCYXNlXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBjaGFydENvbnN0ID0gcmVxdWlyZSgnLi4vY29uc3QnKSxcbiAgICBkb20gPSByZXF1aXJlKCcuLi9oZWxwZXJzL2RvbUhhbmRsZXInKSxcbiAgICByZW5kZXJVdGlsID0gcmVxdWlyZSgnLi4vaGVscGVycy9yZW5kZXJVdGlsJyksXG4gICAgZGF0YUNvbnZlcnRlciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZGF0YUNvbnZlcnRlcicpLFxuICAgIGJvdW5kc01ha2VyID0gcmVxdWlyZSgnLi4vaGVscGVycy9ib3VuZHNNYWtlcicpLFxuICAgIEdyb3VwZWRFdmVudEhhbmRsZUxheWVyID0gcmVxdWlyZSgnLi4vZXZlbnRIYW5kbGVMYXllcnMvZ3JvdXBlZEV2ZW50SGFuZGxlTGF5ZXInKTtcblxudmFyIENoYXJ0QmFzZSA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgQ2hhcnRCYXNlLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogQ2hhcnQgYmFzZS5cbiAgICAgKiBAY29uc3RydWN0cyBDaGFydEJhc2VcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuYm91bmRzIGNoYXJ0IGJvdW5kc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBjaGFydCB0aGVtZVxuICAgICAqICAgICAgQHBhcmFtIHt7eUF4aXM6IG9iZWpjdCwgeEF4aXM6IG9iamVjdH19IGF4ZXNEYXRhIGF4ZXMgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5vcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gcGFyYW0uaXNWZXJ0aWNhbCB3aGV0aGVyIHZlcnRpY2FsIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5pbml0ZWREYXRhIGluaXRpYWxpemVkIGRhdGEgZnJvbSBjb21ibyBjaGFydFxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB0aGlzLmNoYXJ0SWQgPSBwYXJhbXMuaW5pdGVkRGF0YSAmJiBwYXJhbXMuaW5pdGVkRGF0YS5jaGFydElkIHx8IGNoYXJ0Q29uc3QuQ0hBUl9JRF9QUkVGSVggKyAnLScgKyAobmV3IERhdGUoKSkuZ2V0VGltZSgpO1xuICAgICAgICB0aGlzLmlzU3ViQ2hhcnQgPSAhIXBhcmFtcy5pbml0ZWREYXRhO1xuICAgICAgICB0aGlzLmNvbXBvbmVudHMgPSBbXTtcbiAgICAgICAgdGhpcy5jb21wb25lbnRNYXAgPSB7fTtcbiAgICAgICAgdGhpcy5ib3VuZHMgPSBwYXJhbXMuYm91bmRzO1xuICAgICAgICB0aGlzLnRoZW1lID0gcGFyYW1zLnRoZW1lO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBwYXJhbXMub3B0aW9ucztcbiAgICAgICAgdGhpcy5pc1N1YkNoYXJ0ID0gISFwYXJhbXMuaW5pdGVkRGF0YTtcbiAgICAgICAgdGhpcy5oYXNBeGVzID0gISFwYXJhbXMuYXhlc0RhdGE7XG4gICAgICAgIHRoaXMuaXNWZXJ0aWNhbCA9ICEhcGFyYW1zLmlzVmVydGljYWw7XG4gICAgICAgIHRoaXMuaXNHcm91cGVkVG9vbHRpcCA9IHBhcmFtcy5vcHRpb25zLnRvb2x0aXAgJiYgcGFyYW1zLm9wdGlvbnMudG9vbHRpcC5ncm91cGVkO1xuXG4gICAgICAgIHRoaXMuX2FkZEdyb3VwZWRFdmVudEhhbmRsZUxheWVyKHBhcmFtcy5heGVzRGF0YSwgcGFyYW1zLm9wdGlvbnMuY2hhcnRUeXBlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIGdyb3VwZWQgZXZlbnQgaGFuZGxlciBsYXllci5cbiAgICAgKiBAcGFyYW0ge3t5QXhpczogb2JlamN0LCB4QXhpczogb2JqZWN0fX0gYXhlc0RhdGEgYXhlcyBkYXRhXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNoYXJ0VHlwZSBjaGFydCB0eXBlXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpc1ZlcnRpY2FsIHdoZXRoZXIgdmVydGljYWwgb3Igbm90XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYWRkR3JvdXBlZEV2ZW50SGFuZGxlTGF5ZXI6IGZ1bmN0aW9uKGF4ZXNEYXRhLCBjaGFydFR5cGUpIHtcbiAgICAgICAgdmFyIHRpY2tDb3VudDtcblxuICAgICAgICBpZiAoIXRoaXMuaGFzQXhlcyB8fCAhdGhpcy5pc0dyb3VwZWRUb29sdGlwIHx8IHRoaXMuaXNTdWJDaGFydCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuaXNWZXJ0aWNhbCkge1xuICAgICAgICAgICAgdGlja0NvdW50ID0gYXhlc0RhdGEueEF4aXMgPyBheGVzRGF0YS54QXhpcy50aWNrQ291bnQgOiAtMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRpY2tDb3VudCA9IGF4ZXNEYXRhLnlBeGlzID8gYXhlc0RhdGEueUF4aXMudGlja0NvdW50IDogLTE7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmFkZENvbXBvbmVudCgnZXZlbnRIYW5kbGVMYXllcicsIEdyb3VwZWRFdmVudEhhbmRsZUxheWVyLCB7XG4gICAgICAgICAgICB0aWNrQ291bnQ6IHRpY2tDb3VudCxcbiAgICAgICAgICAgIGNoYXJ0VHlwZTogY2hhcnRUeXBlLFxuICAgICAgICAgICAgaXNWZXJ0aWNhbDogdGhpcy5pc1ZlcnRpY2FsXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGJhZXMgZGF0YS5cbiAgICAgKiBAcGFyYW0ge2FycmF5IHwgb2JqZWN0fSB1c2VyRGF0YSB1c2VyIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgY2hhcnQgdGhlbWVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBhZGQgcGFyYW1zXG4gICAgICogQHJldHVybnMge3tjb252ZXJ0ZWREYXRhOiBvYmplY3QsIGJvdW5kczogb2JqZWN0fX0gYmFzZSBkYXRhXG4gICAgICovXG4gICAgbWFrZUJhc2VEYXRhOiBmdW5jdGlvbih1c2VyRGF0YSwgdGhlbWUsIG9wdGlvbnMsIHBhcmFtcykge1xuICAgICAgICB2YXIgc2VyaWVzQ2hhcnRUeXBlcyA9IHBhcmFtcyA/IHBhcmFtcy5zZXJpZXNDaGFydFR5cGVzIDogW10sXG4gICAgICAgICAgICBjb252ZXJ0ZWREYXRhID0gZGF0YUNvbnZlcnRlci5jb252ZXJ0KHVzZXJEYXRhLCBvcHRpb25zLmNoYXJ0LCBvcHRpb25zLmNoYXJ0VHlwZSwgc2VyaWVzQ2hhcnRUeXBlcyksXG4gICAgICAgICAgICBib3VuZHMgPSBib3VuZHNNYWtlci5tYWtlKHR1aS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgY2hhcnRUeXBlOiBvcHRpb25zLmNoYXJ0VHlwZSxcbiAgICAgICAgICAgICAgICBjb252ZXJ0ZWREYXRhOiBjb252ZXJ0ZWREYXRhLFxuICAgICAgICAgICAgICAgIHRoZW1lOiB0aGVtZSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zXG4gICAgICAgICAgICB9LCBwYXJhbXMpKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY29udmVydGVkRGF0YTogY29udmVydGVkRGF0YSxcbiAgICAgICAgICAgIGJvdW5kczogYm91bmRzXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZCBjb21wb25lbnQuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgY29tcG9uZW50IG5hbWVcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBDb21wb25lbnQgY29tcG9uZW50IGZ1bmN0aW9uXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICovXG4gICAgYWRkQ29tcG9uZW50OiBmdW5jdGlvbihuYW1lLCBDb21wb25lbnQsIHBhcmFtcykge1xuICAgICAgICB2YXIgYm91bmQgPSB0aGlzLmJvdW5kc1tuYW1lXSxcbiAgICAgICAgICAgIHRoZW1lID0gdGhpcy50aGVtZVtuYW1lXSxcbiAgICAgICAgICAgIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnNbbmFtZV0sXG4gICAgICAgICAgICBpbmRleCA9IHBhcmFtcy5pbmRleCB8fCAwLFxuICAgICAgICAgICAgY29tbW9uUGFyYW1zID0ge30sXG4gICAgICAgICAgICBjb21wb25lbnQ7XG5cbiAgICAgICAgY29tbW9uUGFyYW1zLmJvdW5kID0gdHVpLnV0aWwuaXNBcnJheShib3VuZCkgPyBib3VuZFtpbmRleF0gOiBib3VuZDtcbiAgICAgICAgY29tbW9uUGFyYW1zLnRoZW1lID0gdHVpLnV0aWwuaXNBcnJheSh0aGVtZSkgPyB0aGVtZVtpbmRleF0gOiB0aGVtZTtcbiAgICAgICAgY29tbW9uUGFyYW1zLm9wdGlvbnMgPSB0dWkudXRpbC5pc0FycmF5KG9wdGlvbnMpID8gb3B0aW9uc1tpbmRleF0gOiBvcHRpb25zIHx8IHt9O1xuXG4gICAgICAgIHBhcmFtcyA9IHR1aS51dGlsLmV4dGVuZChjb21tb25QYXJhbXMsIHBhcmFtcyk7XG4gICAgICAgIGNvbXBvbmVudCA9IG5ldyBDb21wb25lbnQocGFyYW1zKTtcbiAgICAgICAgdGhpcy5jb21wb25lbnRzLnB1c2goY29tcG9uZW50KTtcbiAgICAgICAgdGhpcy5jb21wb25lbnRNYXBbbmFtZV0gPSBjb21wb25lbnQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCBjdXN0b20gZXZuZXQuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYXR0YWNoQ3VzdG9tRXZlbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5oYXNBeGVzICYmIHRoaXMuaXNHcm91cGVkVG9vbHRpcCAmJiAhdGhpcy5pc1N1YkNoYXJ0KSB7XG4gICAgICAgICAgICB0aGlzLl9hdHRhY2hDb29yZGluYXRlRXZlbnQoKTtcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy5oYXNBeGVzIHx8ICF0aGlzLmlzR3JvdXBlZFRvb2x0aXApIHtcbiAgICAgICAgICAgIHRoaXMuX2F0dGFjaFRvb2x0aXBFdmVudCgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBjaGFydC5cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCBjaGFydCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIG9iamVjdCBmb3IgZ3JhcGggZHJhd2luZ1xuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gY2hhcnQgZWxlbWVudFxuICAgICAqL1xuICAgIHJlbmRlcjogZnVuY3Rpb24oZWwsIHBhcGVyKSB7XG4gICAgICAgIGlmICghZWwpIHtcbiAgICAgICAgICAgIGVsID0gZG9tLmNyZWF0ZSgnRElWJywgdGhpcy5jbGFzc05hbWUpO1xuXG4gICAgICAgICAgICBkb20uYWRkQ2xhc3MoZWwsICd0dWktY2hhcnQnKTtcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlclRpdGxlKGVsKTtcbiAgICAgICAgICAgIHJlbmRlclV0aWwucmVuZGVyRGltZW5zaW9uKGVsLCB0aGlzLmJvdW5kcy5jaGFydC5kaW1lbnNpb24pO1xuICAgICAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJCYWNrZ3JvdW5kKGVsLCB0aGlzLnRoZW1lLmNoYXJ0LmJhY2tncm91bmQpO1xuICAgICAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJGb250RmFtaWx5KGVsLCB0aGlzLnRoZW1lLmNoYXJ0LmZvbnRGYW1pbHkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fcmVuZGVyQ29tcG9uZW50cyhlbCwgdGhpcy5jb21wb25lbnRzLCBwYXBlcik7XG4gICAgICAgIHRoaXMuX2F0dGFjaEN1c3RvbUV2ZW50KCk7XG5cbiAgICAgICAgcmV0dXJuIGVsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgdGl0bGUuXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJUaXRsZTogZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgdmFyIGNoYXJ0T3B0aW9ucyA9IHRoaXMub3B0aW9ucy5jaGFydCB8fCB7fSxcbiAgICAgICAgICAgIGVsVGl0bGUgPSByZW5kZXJVdGlsLnJlbmRlclRpdGxlKGNoYXJ0T3B0aW9ucy50aXRsZSwgdGhpcy50aGVtZS50aXRsZSwgJ3R1aS1jaGFydC10aXRsZScpO1xuICAgICAgICBkb20uYXBwZW5kKGVsLCBlbFRpdGxlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGNvbXBvbmVudHMuXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNvbnRhaW5lciBlbGVtZW50XG4gICAgICogQHBhcmFtIHthcnJheS48b2JqZWN0Pn0gY29tcG9uZW50cyBjb21wb25lbnRzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIG9iamVjdCBmb3IgZ3JhcGggZHJhd2luZ1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlckNvbXBvbmVudHM6IGZ1bmN0aW9uKGNvbnRhaW5lciwgY29tcG9uZW50cywgcGFwZXIpIHtcbiAgICAgICAgdmFyIGVsZW1lbnRzID0gdHVpLnV0aWwubWFwKGNvbXBvbmVudHMsIGZ1bmN0aW9uKGNvbXBvbmVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbXBvbmVudC5yZW5kZXIocGFwZXIpO1xuICAgICAgICB9KTtcbiAgICAgICAgZG9tLmFwcGVuZChjb250YWluZXIsIGVsZW1lbnRzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHBhcGVyLlxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHBhcGVyXG4gICAgICovXG4gICAgZ2V0UGFwZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2VyaWVzID0gdGhpcy5jb21wb25lbnRNYXAuc2VyaWVzLFxuICAgICAgICAgICAgcGFwZXI7XG5cbiAgICAgICAgaWYgKHNlcmllcykge1xuICAgICAgICAgICAgcGFwZXIgPSBzZXJpZXMuZ2V0UGFwZXIoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXBlcjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGN1c3RvbSBldmVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2F0dGFjaFRvb2x0aXBFdmVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB0b29sdGlwID0gdGhpcy5jb21wb25lbnRNYXAudG9vbHRpcCxcbiAgICAgICAgICAgIHNlcmllcyA9IHRoaXMuY29tcG9uZW50TWFwLnNlcmllcztcbiAgICAgICAgaWYgKCF0b29sdGlwIHx8ICFzZXJpZXMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzZXJpZXMub24oJ3Nob3dUb29sdGlwJywgdG9vbHRpcC5vblNob3csIHRvb2x0aXApO1xuICAgICAgICBzZXJpZXMub24oJ2hpZGVUb29sdGlwJywgdG9vbHRpcC5vbkhpZGUsIHRvb2x0aXApO1xuXG4gICAgICAgIGlmICghc2VyaWVzLm9uU2hvd0FuaW1hdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdG9vbHRpcC5vbignc2hvd0FuaW1hdGlvbicsIHNlcmllcy5vblNob3dBbmltYXRpb24sIHNlcmllcyk7XG4gICAgICAgIHRvb2x0aXAub24oJ2hpZGVBbmltYXRpb24nLCBzZXJpZXMub25IaWRlQW5pbWF0aW9uLCBzZXJpZXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggY29vcmRpbmF0ZSBldmVudC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hdHRhY2hDb29yZGluYXRlRXZlbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZXZlbnRIYW5kbGVMYXllciA9IHRoaXMuY29tcG9uZW50TWFwLmV2ZW50SGFuZGxlTGF5ZXIsXG4gICAgICAgICAgICB0b29sdGlwID0gdGhpcy5jb21wb25lbnRNYXAudG9vbHRpcCxcbiAgICAgICAgICAgIHNlcmllcyA9IHRoaXMuY29tcG9uZW50TWFwLnNlcmllcztcbiAgICAgICAgZXZlbnRIYW5kbGVMYXllci5vbignc2hvd0dyb3VwVG9vbHRpcCcsIHRvb2x0aXAub25TaG93LCB0b29sdGlwKTtcbiAgICAgICAgZXZlbnRIYW5kbGVMYXllci5vbignaGlkZUdyb3VwVG9vbHRpcCcsIHRvb2x0aXAub25IaWRlLCB0b29sdGlwKTtcblxuICAgICAgICBpZiAoc2VyaWVzKSB7XG4gICAgICAgICAgICB0b29sdGlwLm9uKCdzaG93R3JvdXBBbmltYXRpb24nLCBzZXJpZXMub25TaG93R3JvdXBBbmltYXRpb24sIHNlcmllcyk7XG4gICAgICAgICAgICB0b29sdGlwLm9uKCdoaWRlR3JvdXBBbmltYXRpb24nLCBzZXJpZXMub25IaWRlR3JvdXBBbmltYXRpb24sIHNlcmllcyk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQW5pbWF0ZSBjaGFydC5cbiAgICAgKi9cbiAgICBhbmltYXRlQ2hhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0dWkudXRpbC5mb3JFYWNoQXJyYXkodGhpcy5jb21wb25lbnRzLCBmdW5jdGlvbihjb21wb25lbnQpIHtcbiAgICAgICAgICAgIGlmIChjb21wb25lbnQuYW5pbWF0ZUNvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5hbmltYXRlQ29tcG9uZW50KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENoYXJ0QmFzZTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBDb2x1bW4gY2hhcnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBDaGFydEJhc2UgPSByZXF1aXJlKCcuL2NoYXJ0QmFzZScpLFxuICAgIGF4aXNUeXBlTWl4ZXIgPSByZXF1aXJlKCcuL2F4aXNUeXBlTWl4ZXInKSxcbiAgICB2ZXJ0aWNhbFR5cGVNaXhlciA9IHJlcXVpcmUoJy4vdmVydGljYWxUeXBlTWl4ZXInKSxcbiAgICBTZXJpZXMgPSByZXF1aXJlKCcuLi9zZXJpZXMvY29sdW1uQ2hhcnRTZXJpZXMnKTtcblxudmFyIENvbHVtbkNoYXJ0ID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoQ2hhcnRCYXNlLCAvKiogQGxlbmRzIENvbHVtbkNoYXJ0LnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogQ29sdW1uIGNoYXJ0LlxuICAgICAqIEBjb25zdHJ1Y3RzIENvbHVtbkNoYXJ0XG4gICAgICogQGV4dGVuZHMgQ2hhcnRCYXNlXG4gICAgICogQG1peGVzIGF4aXNUeXBlTWl4ZXJcbiAgICAgKiBAbWl4ZXMgdmVydGljYWxUeXBlTWl4ZXJcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheT59IHVzZXJEYXRhIGNoYXJ0IGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgY2hhcnQgdGhlbWVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGluaXRlZERhdGEgaW5pdGlhbGl6ZWQgZGF0YSBmcm9tIGNvbWJvIGNoYXJ0XG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24odXNlckRhdGEsIHRoZW1lLCBvcHRpb25zLCBpbml0ZWREYXRhKSB7XG4gICAgICAgIHZhciBiYXNlRGF0YSA9IGluaXRlZERhdGEgfHwgdGhpcy5tYWtlQmFzZURhdGEodXNlckRhdGEsIHRoZW1lLCBvcHRpb25zLCB7XG4gICAgICAgICAgICAgICAgaXNWZXJ0aWNhbDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBoYXNBeGVzOiB0cnVlXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGNvbnZlcnRlZERhdGEgPSBiYXNlRGF0YS5jb252ZXJ0ZWREYXRhLFxuICAgICAgICAgICAgYm91bmRzID0gYmFzZURhdGEuYm91bmRzLFxuICAgICAgICAgICAgYXhlc0RhdGEgPSB0aGlzLl9tYWtlQXhlc0RhdGEoY29udmVydGVkRGF0YSwgYm91bmRzLCBvcHRpb25zLCBpbml0ZWREYXRhKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogY2xhc3NOYW1lXG4gICAgICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNsYXNzTmFtZSA9ICd0dWktY29sdW1uLWNoYXJ0JztcblxuICAgICAgICBDaGFydEJhc2UuY2FsbCh0aGlzLCB7XG4gICAgICAgICAgICBib3VuZHM6IGJvdW5kcyxcbiAgICAgICAgICAgIGF4ZXNEYXRhOiBheGVzRGF0YSxcbiAgICAgICAgICAgIHRoZW1lOiB0aGVtZSxcbiAgICAgICAgICAgIG9wdGlvbnM6IG9wdGlvbnMsXG4gICAgICAgICAgICBpc1ZlcnRpY2FsOiB0cnVlLFxuICAgICAgICAgICAgaW5pdGVkRGF0YTogaW5pdGVkRGF0YVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLl9hZGRDb21wb25lbnRzKGNvbnZlcnRlZERhdGEsIGF4ZXNEYXRhLCBvcHRpb25zKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIGNvbXBvbmVudHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udmVydGVkRGF0YSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBheGVzRGF0YSBheGVzIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYWRkQ29tcG9uZW50czogZnVuY3Rpb24oY29udmVydGVkRGF0YSwgYXhlc0RhdGEsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIHBsb3REYXRhLCBzZXJpZXNEYXRhO1xuXG4gICAgICAgIHBsb3REYXRhID0gdGhpcy5tYWtlUGxvdERhdGEoY29udmVydGVkRGF0YS5wbG90RGF0YSwgYXhlc0RhdGEpO1xuICAgICAgICBzZXJpZXNEYXRhID0ge1xuICAgICAgICAgICAgYWxsb3dOZWdhdGl2ZVRvb2x0aXA6IHRydWUsXG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgdmFsdWVzOiBjb252ZXJ0ZWREYXRhLnZhbHVlcyxcbiAgICAgICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXM6IGNvbnZlcnRlZERhdGEuZm9ybWF0dGVkVmFsdWVzLFxuICAgICAgICAgICAgICAgIGZvcm1hdEZ1bmN0aW9uczogY29udmVydGVkRGF0YS5mb3JtYXRGdW5jdGlvbnMsXG4gICAgICAgICAgICAgICAgc2NhbGU6IGF4ZXNEYXRhLnlBeGlzLnNjYWxlXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuYWRkQXhpc0NvbXBvbmVudHMoe1xuICAgICAgICAgICAgY29udmVydGVkRGF0YTogY29udmVydGVkRGF0YSxcbiAgICAgICAgICAgIGF4ZXM6IGF4ZXNEYXRhLFxuICAgICAgICAgICAgcGxvdERhdGE6IHBsb3REYXRhLFxuICAgICAgICAgICAgY2hhcnRUeXBlOiBvcHRpb25zLmNoYXJ0VHlwZSxcbiAgICAgICAgICAgIFNlcmllczogU2VyaWVzLFxuICAgICAgICAgICAgc2VyaWVzRGF0YTogc2VyaWVzRGF0YVxuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxuYXhpc1R5cGVNaXhlci5taXhpbihDb2x1bW5DaGFydCk7XG52ZXJ0aWNhbFR5cGVNaXhlci5taXhpbihDb2x1bW5DaGFydCk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29sdW1uQ2hhcnQ7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgQ29tYm8gY2hhcnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBjYWxjdWxhdG9yID0gcmVxdWlyZSgnLi4vaGVscGVycy9jYWxjdWxhdG9yJyksXG4gICAgQ2hhcnRCYXNlID0gcmVxdWlyZSgnLi9jaGFydEJhc2UnKSxcbiAgICBheGlzRGF0YU1ha2VyID0gcmVxdWlyZSgnLi4vaGVscGVycy9heGlzRGF0YU1ha2VyJyksXG4gICAgZGVmYXVsdFRoZW1lID0gcmVxdWlyZSgnLi4vdGhlbWVzL2RlZmF1bHRUaGVtZScpLFxuICAgIEdyb3VwVG9vbHRpcCA9IHJlcXVpcmUoJy4uL3Rvb2x0aXBzL2dyb3VwVG9vbHRpcCcpLFxuICAgIENvbHVtbkNoYXJ0ID0gcmVxdWlyZSgnLi9jb2x1bW5DaGFydCcpLFxuICAgIExpbmVDaGFydCA9IHJlcXVpcmUoJy4vbGluZUNoYXJ0Jyk7XG5cbnZhciBDb21ib0NoYXJ0ID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoQ2hhcnRCYXNlLCAvKiogQGxlbmRzIENvbWJvQ2hhcnQucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBDb21ibyBjaGFydC5cbiAgICAgKiBAY29uc3RydWN0cyBDb21ib0NoYXJ0XG4gICAgICogQGV4dGVuZHMgQ2hhcnRCYXNlXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXk+fSB1c2VyRGF0YSBjaGFydCBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIGNoYXJ0IHRoZW1lXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKHVzZXJEYXRhLCB0aGVtZSwgb3B0aW9ucykge1xuICAgICAgICB2YXIgc2VyaWVzQ2hhcnRUeXBlcyA9IHR1aS51dGlsLmtleXModXNlckRhdGEuc2VyaWVzKS5zb3J0KCksXG4gICAgICAgICAgICBvcHRpb25DaGFydFR5cGVzID0gdGhpcy5fZ2V0WUF4aXNPcHRpb25DaGFydFR5cGVzKHNlcmllc0NoYXJ0VHlwZXMsIG9wdGlvbnMueUF4aXMpLFxuICAgICAgICAgICAgY2hhcnRUeXBlcyA9IG9wdGlvbkNoYXJ0VHlwZXMubGVuZ3RoID8gb3B0aW9uQ2hhcnRUeXBlcyA6IHNlcmllc0NoYXJ0VHlwZXMsXG4gICAgICAgICAgICBiYXNlRGF0YSA9IHRoaXMubWFrZUJhc2VEYXRhKHVzZXJEYXRhLCB0aGVtZSwgb3B0aW9ucywge1xuICAgICAgICAgICAgICAgIGlzVmVydGljYWw6IHRydWUsXG4gICAgICAgICAgICAgICAgaGFzQXhlczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzZXJpZXNDaGFydFR5cGVzOiBzZXJpZXNDaGFydFR5cGVzLFxuICAgICAgICAgICAgICAgIG9wdGlvbkNoYXJ0VHlwZXM6IG9wdGlvbkNoYXJ0VHlwZXNcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgY29udmVydGVkRGF0YSA9IGJhc2VEYXRhLmNvbnZlcnRlZERhdGEsXG4gICAgICAgICAgICBib3VuZHMgPSBiYXNlRGF0YS5ib3VuZHMsXG4gICAgICAgICAgICBvcHRpb25zTWFwID0gdGhpcy5fbWFrZU9wdGlvbnNNYXAoY2hhcnRUeXBlcywgb3B0aW9ucyksXG4gICAgICAgICAgICB0aGVtZU1hcCA9IHRoaXMuX21ha2VUaGVtZU1hcChzZXJpZXNDaGFydFR5cGVzLCB0aGVtZSwgY29udmVydGVkRGF0YS5sZWdlbmRMYWJlbHMpLFxuICAgICAgICAgICAgeUF4aXNQYXJhbXMgPSB7XG4gICAgICAgICAgICAgICAgY29udmVydGVkRGF0YTogY29udmVydGVkRGF0YSxcbiAgICAgICAgICAgICAgICBzZXJpZXNEaW1lbnNpb246IGJvdW5kcy5zZXJpZXMuZGltZW5zaW9uLFxuICAgICAgICAgICAgICAgIGNoYXJ0VHlwZXM6IGNoYXJ0VHlwZXMsXG4gICAgICAgICAgICAgICAgaXNPbmVZQXhpczogIW9wdGlvbkNoYXJ0VHlwZXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IG9wdGlvbnNcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBiYXNlQXhlc0RhdGEgPSB7fTtcblxuICAgICAgICBiYXNlQXhlc0RhdGEueUF4aXMgPSB0aGlzLl9tYWtlWUF4aXNEYXRhKHR1aS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICBpbmRleDogMFxuICAgICAgICB9LCB5QXhpc1BhcmFtcykpO1xuXG4gICAgICAgIGJhc2VBeGVzRGF0YS54QXhpcyA9IGF4aXNEYXRhTWFrZXIubWFrZUxhYmVsQXhpc0RhdGEoe1xuICAgICAgICAgICAgbGFiZWxzOiBjb252ZXJ0ZWREYXRhLmxhYmVsc1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmNsYXNzTmFtZSA9ICd0dWktY29tYm8tY2hhcnQnO1xuXG4gICAgICAgIENoYXJ0QmFzZS5jYWxsKHRoaXMsIHtcbiAgICAgICAgICAgIGJvdW5kczogYm91bmRzLFxuICAgICAgICAgICAgYXhlc0RhdGE6IGJhc2VBeGVzRGF0YSxcbiAgICAgICAgICAgIHRoZW1lOiB0aGVtZSxcbiAgICAgICAgICAgIG9wdGlvbnM6IG9wdGlvbnMsXG4gICAgICAgICAgICBpc1ZlcnRpY2FsOiB0cnVlXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KCd0b29sdGlwJywgR3JvdXBUb29sdGlwLCB7XG4gICAgICAgICAgICBsYWJlbHM6IGNvbnZlcnRlZERhdGEubGFiZWxzLFxuICAgICAgICAgICAgam9pbkZvcm1hdHRlZFZhbHVlczogY29udmVydGVkRGF0YS5qb2luRm9ybWF0dGVkVmFsdWVzLFxuICAgICAgICAgICAgam9pbkxlZ2VuZExhYmVsczogY29udmVydGVkRGF0YS5qb2luTGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgY2hhcnRJZDogdGhpcy5jaGFydElkXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuX2luc3RhbGxDaGFydHMoe1xuICAgICAgICAgICAgdXNlckRhdGE6IHVzZXJEYXRhLFxuICAgICAgICAgICAgYmFzZURhdGE6IGJhc2VEYXRhLFxuICAgICAgICAgICAgYmFzZUF4ZXNEYXRhOiBiYXNlQXhlc0RhdGEsXG4gICAgICAgICAgICBheGVzRGF0YTogdGhpcy5fbWFrZUF4ZXNEYXRhKGJhc2VBeGVzRGF0YSwgeUF4aXNQYXJhbXMsIGNvbnZlcnRlZERhdGEuZm9ybWF0RnVuY3Rpb25zKSxcbiAgICAgICAgICAgIHNlcmllc0NoYXJ0VHlwZXM6IHNlcmllc0NoYXJ0VHlwZXMsXG4gICAgICAgICAgICBvcHRpb25zTWFwOiBvcHRpb25zTWFwLFxuICAgICAgICAgICAgdGhlbWVNYXA6IHRoZW1lTWFwXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgeSBheGlzIG9wdGlvbiBjaGFydCB0eXBlcy5cbiAgICAgKiBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBjaGFydFR5cGVzIGNoYXJ0IHR5cGVzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHlBeGlzT3B0aW9ucyB5IGF4aXMgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHthcnJheS48c3RyaW5nPn0gY2hhcnQgdHlwZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRZQXhpc09wdGlvbkNoYXJ0VHlwZXM6IGZ1bmN0aW9uKGNoYXJ0VHlwZXMsIHlBeGlzT3B0aW9ucykge1xuICAgICAgICB2YXIgcmVzdWx0Q2hhcnRUeXBlcyA9IGNoYXJ0VHlwZXMuc2xpY2UoKSxcbiAgICAgICAgICAgIGlzUmV2ZXJzZSA9IGZhbHNlLFxuICAgICAgICAgICAgb3B0aW9uQ2hhcnRUeXBlcztcblxuICAgICAgICB5QXhpc09wdGlvbnMgPSB5QXhpc09wdGlvbnMgPyBbXS5jb25jYXQoeUF4aXNPcHRpb25zKSA6IFtdO1xuXG4gICAgICAgIGlmICh5QXhpc09wdGlvbnMubGVuZ3RoID09PSAxICYmICF5QXhpc09wdGlvbnNbMF0uY2hhcnRUeXBlKSB7XG4gICAgICAgICAgICByZXN1bHRDaGFydFR5cGVzID0gW107XG4gICAgICAgIH0gZWxzZSBpZiAoeUF4aXNPcHRpb25zLmxlbmd0aCkge1xuICAgICAgICAgICAgb3B0aW9uQ2hhcnRUeXBlcyA9IHR1aS51dGlsLm1hcCh5QXhpc09wdGlvbnMsIGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb24uY2hhcnRUeXBlO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHR1aS51dGlsLmZvckVhY2hBcnJheShvcHRpb25DaGFydFR5cGVzLCBmdW5jdGlvbihjaGFydFR5cGUsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgaXNSZXZlcnNlID0gaXNSZXZlcnNlIHx8IChjaGFydFR5cGUgJiYgcmVzdWx0Q2hhcnRUeXBlc1tpbmRleF0gIT09IGNoYXJ0VHlwZSB8fCBmYWxzZSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKGlzUmV2ZXJzZSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdENoYXJ0VHlwZXMucmV2ZXJzZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdENoYXJ0VHlwZXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgeSBheGlzIGRhdGEuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmluZGV4IGNoYXJ0IGluZGV4XG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmNvbnZlcnRlZERhdGEgY29udmVydGVkIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gcGFyYW1zLnNlcmllc0RpbWVuc2lvbiBzZXJpZXMgZGltZW5zaW9uXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBjaGFydFR5cGVzIGNoYXJ0IHR5cGVcbiAgICAgKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gaXNPbmVZQXhpcyB3aGV0aGVyIG9uZSBzZXJpZXMgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gYWRkUGFyYW1zIGFkZCBwYXJhbXNcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSB5IGF4aXMgZGF0YVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VZQXhpc0RhdGE6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgY29udmVydGVkRGF0YSA9IHBhcmFtcy5jb252ZXJ0ZWREYXRhLFxuICAgICAgICAgICAgaW5kZXggPSBwYXJhbXMuaW5kZXgsXG4gICAgICAgICAgICBjaGFydFR5cGUgPSBwYXJhbXMuY2hhcnRUeXBlc1tpbmRleF0sXG4gICAgICAgICAgICBvcHRpb25zID0gcGFyYW1zLm9wdGlvbnMsXG4gICAgICAgICAgICB5QXhpc1ZhbHVlcywgeUF4aXNPcHRpb25zLCBzZXJpZXNPcHRpb247XG5cbiAgICAgICAgaWYgKHBhcmFtcy5pc09uZVlBeGlzKSB7XG4gICAgICAgICAgICB5QXhpc1ZhbHVlcyA9IGNvbnZlcnRlZERhdGEuam9pblZhbHVlcztcbiAgICAgICAgICAgIHlBeGlzT3B0aW9ucyA9IFtvcHRpb25zLnlBeGlzXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHlBeGlzVmFsdWVzID0gY29udmVydGVkRGF0YS52YWx1ZXNbY2hhcnRUeXBlXTtcbiAgICAgICAgICAgIHlBeGlzT3B0aW9ucyA9IG9wdGlvbnMueUF4aXMgfHwgW107XG4gICAgICAgIH1cblxuICAgICAgICBzZXJpZXNPcHRpb24gPSBvcHRpb25zLnNlcmllcyAmJiBvcHRpb25zLnNlcmllc1tjaGFydFR5cGVdIHx8IG9wdGlvbnMuc2VyaWVzO1xuXG4gICAgICAgIHJldHVybiBheGlzRGF0YU1ha2VyLm1ha2VWYWx1ZUF4aXNEYXRhKHR1aS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICB2YWx1ZXM6IHlBeGlzVmFsdWVzLFxuICAgICAgICAgICAgc3RhY2tlZDogc2VyaWVzT3B0aW9uICYmIHNlcmllc09wdGlvbi5zdGFja2VkIHx8ICcnLFxuICAgICAgICAgICAgb3B0aW9uczogeUF4aXNPcHRpb25zW2luZGV4XSxcbiAgICAgICAgICAgIGNoYXJ0VHlwZTogY2hhcnRUeXBlLFxuICAgICAgICAgICAgc2VyaWVzRGltZW5zaW9uOiBwYXJhbXMuc2VyaWVzRGltZW5zaW9uLFxuICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zOiBjb252ZXJ0ZWREYXRhLmZvcm1hdEZ1bmN0aW9ucyxcbiAgICAgICAgICAgIGlzVmVydGljYWw6IHRydWVcbiAgICAgICAgfSwgcGFyYW1zLmFkZFBhcmFtcykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGF4ZXMgZGF0YS5cbiAgICAgKiBAcGFyYW0ge3t5QXhpczogb2JqZWN0LCB4QXhpczogb2JqZWN0fX0gYmFzZUF4ZXNEYXRhIGJhc2UgYXhlcyBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHlBeGlzUGFyYW1zIHkgYXhpcyBwYXJhbXNcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBheGVzIGRhdGFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQXhlc0RhdGE6IGZ1bmN0aW9uKGJhc2VBeGVzRGF0YSwgeUF4aXNQYXJhbXMsIGZvcm1hdEZ1bmN0aW9ucykge1xuICAgICAgICB2YXIgeUF4aXNEYXRhID0gYmFzZUF4ZXNEYXRhLnlBeGlzLFxuICAgICAgICAgICAgY2hhcnRUeXBlcyA9IHlBeGlzUGFyYW1zLmNoYXJ0VHlwZXMsXG4gICAgICAgICAgICBheGVzRGF0YSA9IHt9LFxuICAgICAgICAgICAgeXJBeGlzRGF0YTtcbiAgICAgICAgaWYgKCF5QXhpc1BhcmFtcy5pc09uZVlBeGlzKSB7XG4gICAgICAgICAgICB5ckF4aXNEYXRhID0gdGhpcy5fbWFrZVlBeGlzRGF0YSh0dWkudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgICAgIGluZGV4OiAxLFxuICAgICAgICAgICAgICAgIGFkZFBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICBpc1Bvc2l0aW9uUmlnaHQ6IHRydWVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB5QXhpc1BhcmFtcykpO1xuICAgICAgICAgICAgaWYgKHlBeGlzRGF0YS50aWNrQ291bnQgPCB5ckF4aXNEYXRhLnRpY2tDb3VudCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luY3JlYXNlWUF4aXNUaWNrQ291bnQoeXJBeGlzRGF0YS50aWNrQ291bnQgLSB5QXhpc0RhdGEudGlja0NvdW50LCB5QXhpc0RhdGEsIGZvcm1hdEZ1bmN0aW9ucyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHlBeGlzRGF0YS50aWNrQ291bnQgPiB5ckF4aXNEYXRhLnRpY2tDb3VudCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luY3JlYXNlWUF4aXNUaWNrQ291bnQoeUF4aXNEYXRhLnRpY2tDb3VudCAtIHlyQXhpc0RhdGEudGlja0NvdW50LCB5ckF4aXNEYXRhLCBmb3JtYXRGdW5jdGlvbnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgYXhlc0RhdGFbY2hhcnRUeXBlc1swXV0gPSBiYXNlQXhlc0RhdGE7XG4gICAgICAgIGF4ZXNEYXRhW2NoYXJ0VHlwZXNbMV1dID0ge1xuICAgICAgICAgICAgeUF4aXM6IHlyQXhpc0RhdGEgfHwgeUF4aXNEYXRhXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIGF4ZXNEYXRhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIG9yZGVyIGluZm8gYWJvdW5kIGNoYXJ0IHR5cGUuXG4gICAgICogQHBhcmFtIHthcnJheS48c3RyaW5nPn0gY2hhcnRUeXBlcyBjaGFydCB0eXBlc1xuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IGNoYXJ0IG9yZGVyIGluZm9cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQ2hhcnRUeXBlT3JkZXJJbmZvOiBmdW5jdGlvbihjaGFydFR5cGVzKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaEFycmF5KGNoYXJ0VHlwZXMsIGZ1bmN0aW9uKGNoYXJ0VHlwZSwgaW5kZXgpIHtcbiAgICAgICAgICAgIHJlc3VsdFtjaGFydFR5cGVdID0gaW5kZXg7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIG9wdGlvbnMgbWFwXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGNoYXJ0VHlwZXMgY2hhcnQgdHlwZXNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9yZGVySW5mbyBjaGFydCBvcmRlclxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IG9wdGlvbnMgbWFwXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZU9wdGlvbnNNYXA6IGZ1bmN0aW9uKGNoYXJ0VHlwZXMsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIG9yZGVySW5mbyA9IHRoaXMuX21ha2VDaGFydFR5cGVPcmRlckluZm8oY2hhcnRUeXBlcyksXG4gICAgICAgICAgICByZXN1bHQgPSB7fTtcbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaEFycmF5KGNoYXJ0VHlwZXMsIGZ1bmN0aW9uKGNoYXJ0VHlwZSkge1xuICAgICAgICAgICAgdmFyIGNoYXJ0T3B0aW9ucyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob3B0aW9ucykpLFxuICAgICAgICAgICAgICAgIGluZGV4ID0gb3JkZXJJbmZvW2NoYXJ0VHlwZV07XG5cbiAgICAgICAgICAgIGlmIChjaGFydE9wdGlvbnMueUF4aXMgJiYgY2hhcnRPcHRpb25zLnlBeGlzW2luZGV4XSkge1xuICAgICAgICAgICAgICAgIGNoYXJ0T3B0aW9ucy55QXhpcyA9IGNoYXJ0T3B0aW9ucy55QXhpc1tpbmRleF07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChjaGFydE9wdGlvbnMuc2VyaWVzICYmIGNoYXJ0T3B0aW9ucy5zZXJpZXNbY2hhcnRUeXBlXSkge1xuICAgICAgICAgICAgICAgIGNoYXJ0T3B0aW9ucy5zZXJpZXMgPSBjaGFydE9wdGlvbnMuc2VyaWVzW2NoYXJ0VHlwZV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChjaGFydE9wdGlvbnMudG9vbHRpcCAmJiBjaGFydE9wdGlvbnMudG9vbHRpcFtjaGFydFR5cGVdKSB7XG4gICAgICAgICAgICAgICAgY2hhcnRPcHRpb25zLnRvb2x0aXAgPSBjaGFydE9wdGlvbnMudG9vbHRpcFtjaGFydFR5cGVdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2hhcnRPcHRpb25zLnBhcmVudENoYXJ0VHlwZSA9IGNoYXJ0T3B0aW9ucy5jaGFydFR5cGU7XG4gICAgICAgICAgICBjaGFydE9wdGlvbnMuY2hhcnRUeXBlID0gY2hhcnRUeXBlO1xuICAgICAgICAgICAgcmVzdWx0W2NoYXJ0VHlwZV0gPSBjaGFydE9wdGlvbnM7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHRoZW1lIG1hcFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjaGFydFR5cGVzIGNoYXJ0IHR5cGVzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIGNoYXJ0IHRoZW1lXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGxlZ2VuZExhYmVscyBsZWdlbmQgbGFiZWxzXG4gICAgICogQHJldHVybnMge29iamVjdH0gdGhlbWUgbWFwXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVRoZW1lTWFwOiBmdW5jdGlvbihjaGFydFR5cGVzLCB0aGVtZSwgbGVnZW5kTGFiZWxzKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSB7fSxcbiAgICAgICAgICAgIGNvbG9yQ291bnQgPSAwO1xuICAgICAgICB0dWkudXRpbC5mb3JFYWNoQXJyYXkoY2hhcnRUeXBlcywgZnVuY3Rpb24oY2hhcnRUeXBlKSB7XG4gICAgICAgICAgICB2YXIgY2hhcnRUaGVtZSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhlbWUpKSxcbiAgICAgICAgICAgICAgICByZW1vdmVkQ29sb3JzO1xuXG4gICAgICAgICAgICBpZiAoY2hhcnRUaGVtZS55QXhpc1tjaGFydFR5cGVdKSB7XG4gICAgICAgICAgICAgICAgY2hhcnRUaGVtZS55QXhpcyA9IGNoYXJ0VGhlbWUueUF4aXNbY2hhcnRUeXBlXTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWNoYXJ0VGhlbWUueUF4aXMudGl0bGUpIHtcbiAgICAgICAgICAgICAgICBjaGFydFRoZW1lLnlBeGlzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShkZWZhdWx0VGhlbWUueUF4aXMpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGNoYXJ0VGhlbWUuc2VyaWVzW2NoYXJ0VHlwZV0pIHtcbiAgICAgICAgICAgICAgICBjaGFydFRoZW1lLnNlcmllcyA9IGNoYXJ0VGhlbWUuc2VyaWVzW2NoYXJ0VHlwZV07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFjaGFydFRoZW1lLnNlcmllcy5jb2xvcnMpIHtcbiAgICAgICAgICAgICAgICBjaGFydFRoZW1lLnNlcmllcyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZGVmYXVsdFRoZW1lLnNlcmllcykpO1xuICAgICAgICAgICAgICAgIGNoYXJ0VGhlbWUuc2VyaWVzLmxhYmVsLmZvbnRGYW1pbHkgPSBjaGFydFRoZW1lLmNoYXJ0LmZvbnRGYW1pbHk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlbW92ZWRDb2xvcnMgPSBjaGFydFRoZW1lLnNlcmllcy5jb2xvcnMuc3BsaWNlKDAsIGNvbG9yQ291bnQpO1xuICAgICAgICAgICAgICAgIGNoYXJ0VGhlbWUuc2VyaWVzLmNvbG9ycyA9IGNoYXJ0VGhlbWUuc2VyaWVzLmNvbG9ycy5jb25jYXQocmVtb3ZlZENvbG9ycyk7XG4gICAgICAgICAgICAgICAgY29sb3JDb3VudCArPSBsZWdlbmRMYWJlbHNbY2hhcnRUeXBlXS5sZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXN1bHRbY2hhcnRUeXBlXSA9IGNoYXJ0VGhlbWU7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbmNyZWFzZSB5IGF4aXMgdGljayBjb3VudC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5jcmVhc2VUaWNrQ291bnQgaW5jcmVhc2UgdGljayBjb3VudFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0b0RhdGEgdG8gdGljayBpbmZvXG4gICAgICogQHBhcmFtIHthcnJheS48ZnVuY3Rpb24+fSBmb3JtYXRGdW5jdGlvbnMgZm9ybWF0IGZ1bmN0aW9uc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2luY3JlYXNlWUF4aXNUaWNrQ291bnQ6IGZ1bmN0aW9uKGluY3JlYXNlVGlja0NvdW50LCB0b0RhdGEsIGZvcm1hdEZ1bmN0aW9ucykge1xuICAgICAgICB0b0RhdGEuc2NhbGUubWF4ICs9IHRvRGF0YS5zdGVwICogaW5jcmVhc2VUaWNrQ291bnQ7XG4gICAgICAgIHRvRGF0YS5sYWJlbHMgPSBheGlzRGF0YU1ha2VyLmZvcm1hdExhYmVscyhjYWxjdWxhdG9yLm1ha2VMYWJlbHNGcm9tU2NhbGUodG9EYXRhLnNjYWxlLCB0b0RhdGEuc3RlcCksIGZvcm1hdEZ1bmN0aW9ucyk7XG4gICAgICAgIHRvRGF0YS50aWNrQ291bnQgKz0gaW5jcmVhc2VUaWNrQ291bnQ7XG4gICAgICAgIHRvRGF0YS52YWxpZFRpY2tDb3VudCArPSBpbmNyZWFzZVRpY2tDb3VudDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW5zdGFsbCBjaGFydHMuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnVzZXJEYXRhIHVzZXIgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5iYXNlRGF0YSBjaGFydCBiYXNlIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgY2hhcnQgdGhlbWVcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMub3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogICAgICBAcGFyYW0ge3t5QXhpczogb2JqZWN0LCB4QXhpczogb2JqZWN0fX0gcGFyYW1zLmJhc2VBeGVzRGF0YSBiYXNlIGF4ZXMgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5heGVzRGF0YSBheGVzIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IHBhcmFtcy5zZXJpZXNDaGFydFR5cGVzIHNlcmllcyBjaGFydCB0eXBlc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48c3RyaW5nPn0gcGFyYW1zLmNoYXJ0VHlwZXMgY2hhcnQgdHlwZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pbnN0YWxsQ2hhcnRzOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGNoYXJ0Q2xhc3NlcyA9IHtcbiAgICAgICAgICAgICAgICBjb2x1bW46IENvbHVtbkNoYXJ0LFxuICAgICAgICAgICAgICAgIGxpbmU6IExpbmVDaGFydFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJhc2VEYXRhID0gcGFyYW1zLmJhc2VEYXRhLFxuICAgICAgICAgICAgY29udmVydGVkRGF0YSA9IGJhc2VEYXRhLmNvbnZlcnRlZERhdGEsXG4gICAgICAgICAgICBwbG90RGF0YSA9IHtcbiAgICAgICAgICAgICAgICB2VGlja0NvdW50OiBwYXJhbXMuYmFzZUF4ZXNEYXRhLnlBeGlzLnZhbGlkVGlja0NvdW50LFxuICAgICAgICAgICAgICAgIGhUaWNrQ291bnQ6IHBhcmFtcy5iYXNlQXhlc0RhdGEueEF4aXMudmFsaWRUaWNrQ291bnRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBqb2luTGVnZW5kTGFiZWxzID0gY29udmVydGVkRGF0YS5qb2luTGVnZW5kTGFiZWxzO1xuXG4gICAgICAgIHRoaXMuY2hhcnRzID0gdHVpLnV0aWwubWFwKHBhcmFtcy5zZXJpZXNDaGFydFR5cGVzLCBmdW5jdGlvbihjaGFydFR5cGUpIHtcbiAgICAgICAgICAgIHZhciBsZWdlbmRMYWJlbHMgPSBjb252ZXJ0ZWREYXRhLmxlZ2VuZExhYmVsc1tjaGFydFR5cGVdLFxuICAgICAgICAgICAgICAgIGF4ZXMgPSBwYXJhbXMuYXhlc0RhdGFbY2hhcnRUeXBlXSxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gcGFyYW1zLm9wdGlvbnNNYXBbY2hhcnRUeXBlXSxcbiAgICAgICAgICAgICAgICB0aGVtZSA9IHBhcmFtcy50aGVtZU1hcFtjaGFydFR5cGVdLFxuICAgICAgICAgICAgICAgIGJvdW5kcyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoYmFzZURhdGEuYm91bmRzKSksXG4gICAgICAgICAgICAgICAgQ2hhcnQgPSBjaGFydENsYXNzZXNbY2hhcnRUeXBlXSxcbiAgICAgICAgICAgICAgICBpbml0ZWREYXRhLCBjaGFydDtcblxuICAgICAgICAgICAgaWYgKGF4ZXMgJiYgYXhlcy55QXhpcy5pc1Bvc2l0aW9uUmlnaHQpIHtcbiAgICAgICAgICAgICAgICBib3VuZHMueUF4aXMgPSBib3VuZHMueXJBeGlzO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpbml0ZWREYXRhID0ge1xuICAgICAgICAgICAgICAgIGNvbnZlcnRlZERhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzOiBjb252ZXJ0ZWREYXRhLnZhbHVlc1tjaGFydFR5cGVdLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbHM6IGNvbnZlcnRlZERhdGEubGFiZWxzLFxuICAgICAgICAgICAgICAgICAgICBmb3JtYXRGdW5jdGlvbnM6IGNvbnZlcnRlZERhdGEuZm9ybWF0RnVuY3Rpb25zLFxuICAgICAgICAgICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXM6IGNvbnZlcnRlZERhdGEuZm9ybWF0dGVkVmFsdWVzW2NoYXJ0VHlwZV0sXG4gICAgICAgICAgICAgICAgICAgIGxlZ2VuZExhYmVsczogbGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgICAgICAgICBqb2luTGVnZW5kTGFiZWxzOiBqb2luTGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgICAgICAgICBwbG90RGF0YTogcGxvdERhdGFcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGJvdW5kczogYm91bmRzLFxuICAgICAgICAgICAgICAgIGF4ZXM6IGF4ZXMsXG4gICAgICAgICAgICAgICAgY2hhcnRJZDogdGhpcy5jaGFydElkXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjaGFydCA9IG5ldyBDaGFydChwYXJhbXMudXNlckRhdGEsIHRoZW1lLCBvcHRpb25zLCBpbml0ZWREYXRhKTtcbiAgICAgICAgICAgIHBsb3REYXRhID0gbnVsbDtcbiAgICAgICAgICAgIGpvaW5MZWdlbmRMYWJlbHMgPSBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIGNoYXJ0O1xuICAgICAgICB9LCB0aGlzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGNvbWJvIGNoYXJ0LlxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gY29tYm8gY2hhcnQgZWxlbWVudFxuICAgICAqL1xuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBlbCA9IENoYXJ0QmFzZS5wcm90b3R5cGUucmVuZGVyLmNhbGwodGhpcyk7XG4gICAgICAgIHZhciBwYXBlcjtcbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaEFycmF5KHRoaXMuY2hhcnRzLCBmdW5jdGlvbihjaGFydCwgaW5kZXgpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgY2hhcnQucmVuZGVyKGVsLCBwYXBlcik7XG4gICAgICAgICAgICAgICAgaWYgKCFwYXBlcikge1xuICAgICAgICAgICAgICAgICAgICBwYXBlciA9IGNoYXJ0LmdldFBhcGVyKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNoYXJ0LmFuaW1hdGVDaGFydCgpO1xuICAgICAgICAgICAgfSwgMSAqIGluZGV4KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb21ib0NoYXJ0O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IExpbmUgY2hhcnRcbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIENoYXJ0QmFzZSA9IHJlcXVpcmUoJy4vY2hhcnRCYXNlJyksXG4gICAgbGluZVR5cGVNaXhlciA9IHJlcXVpcmUoJy4vbGluZVR5cGVNaXhlcicpLFxuICAgIGF4aXNUeXBlTWl4ZXIgPSByZXF1aXJlKCcuL2F4aXNUeXBlTWl4ZXInKSxcbiAgICB2ZXJ0aWNhbFR5cGVNaXhlciA9IHJlcXVpcmUoJy4vdmVydGljYWxUeXBlTWl4ZXInKSxcbiAgICBTZXJpZXMgPSByZXF1aXJlKCcuLi9zZXJpZXMvbGluZUNoYXJ0U2VyaWVzJyk7XG5cbnZhciBMaW5lQ2hhcnQgPSB0dWkudXRpbC5kZWZpbmVDbGFzcyhDaGFydEJhc2UsIC8qKiBAbGVuZHMgTGluZUNoYXJ0LnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogY2xhc3NOYW1lXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICBjbGFzc05hbWU6ICd0dWktbGluZS1jaGFydCcsXG5cbiAgICAvKipcbiAgICAgKiBTZXJpZXMgY2xhc3NcbiAgICAgKiBAdHlwZSB7ZnVuY3Rpb259XG4gICAgICovXG4gICAgU2VyaWVzOiBTZXJpZXMsXG5cbiAgICAvKipcbiAgICAgKiBMaW5lIGNoYXJ0LlxuICAgICAqIEBjb25zdHJ1Y3RzIExpbmVDaGFydFxuICAgICAqIEBleHRlbmRzIENoYXJ0QmFzZVxuICAgICAqIEBtaXhlcyBheGlzVHlwZU1peGVyXG4gICAgICogQG1peGVzIHZlcnRpY2FsVHlwZU1peGVyXG4gICAgICogQG1peGVzIGxpbmVUeXBlTWl4ZXJcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5saW5lVHlwZUluaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG59KTtcblxuYXhpc1R5cGVNaXhlci5taXhpbihMaW5lQ2hhcnQpO1xudmVydGljYWxUeXBlTWl4ZXIubWl4aW4oTGluZUNoYXJ0KTtcbmxpbmVUeXBlTWl4ZXIubWl4aW4oTGluZUNoYXJ0KTtcblxubW9kdWxlLmV4cG9ydHMgPSBMaW5lQ2hhcnQ7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgbGluZVR5cGVNaXhlciBpcyBtaXhlciBvZiBsaW5lIHR5cGUgY2hhcnQobGluZSwgYXJlYSkuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBDaGFydEJhc2UgPSByZXF1aXJlKCcuL2NoYXJ0QmFzZScpLFxuICAgIExpbmVUeXBlRXZlbnRIYW5kbGVMYXllciA9IHJlcXVpcmUoJy4uL2V2ZW50SGFuZGxlTGF5ZXJzL2xpbmVUeXBlRXZlbnRIYW5kbGVMYXllcicpO1xuXG4vKipcbiAqIGxpbmVUeXBlTWl4ZXIgaXMgbWl4ZXIgb2YgbGluZSB0eXBlIGNoYXJ0KGxpbmUsIGFyZWEpLlxuICogQG1peGluXG4gKi9cbnZhciBsaW5lVHlwZU1peGVyID0ge1xuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgbGluZSB0eXBlIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gdXNlckRhdGEgY2hhcnQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBjaGFydCB0aGVtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gaW5pdGVkRGF0YSBpbml0aWFsaXplZCBkYXRhIGZyb20gY29tYm8gY2hhcnRcbiAgICAgKi9cbiAgICBsaW5lVHlwZUluaXQ6IGZ1bmN0aW9uKHVzZXJEYXRhLCB0aGVtZSwgb3B0aW9ucywgaW5pdGVkRGF0YSkge1xuICAgICAgICB2YXIgYmFzZURhdGEgPSBpbml0ZWREYXRhIHx8IHRoaXMubWFrZUJhc2VEYXRhKHVzZXJEYXRhLCB0aGVtZSwgb3B0aW9ucywge1xuICAgICAgICAgICAgICAgIGlzVmVydGljYWw6IHRydWUsXG4gICAgICAgICAgICAgICAgaGFzQXhlczogdHJ1ZVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBjb252ZXJ0ZWREYXRhID0gYmFzZURhdGEuY29udmVydGVkRGF0YSxcbiAgICAgICAgICAgIGJvdW5kcyA9IGJhc2VEYXRhLmJvdW5kcyxcbiAgICAgICAgICAgIGF4ZXNEYXRhID0gdGhpcy5fbWFrZUF4ZXNEYXRhKGNvbnZlcnRlZERhdGEsIGJvdW5kcywgb3B0aW9ucywgaW5pdGVkRGF0YSk7XG5cbiAgICAgICAgQ2hhcnRCYXNlLmNhbGwodGhpcywge1xuICAgICAgICAgICAgYm91bmRzOiBib3VuZHMsXG4gICAgICAgICAgICBheGVzRGF0YTogYXhlc0RhdGEsXG4gICAgICAgICAgICB0aGVtZTogdGhlbWUsXG4gICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zLFxuICAgICAgICAgICAgaXNWZXJ0aWNhbDogdHJ1ZSxcbiAgICAgICAgICAgIGluaXRlZERhdGE6IGluaXRlZERhdGFcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKCF0aGlzLmlzU3ViQ2hhcnQgJiYgIXRoaXMuaXNHcm91cGVkVG9vbHRpcCkge1xuICAgICAgICAgICAgdGhpcy5hZGRDb21wb25lbnQoJ2V2ZW50SGFuZGxlTGF5ZXInLCBMaW5lVHlwZUV2ZW50SGFuZGxlTGF5ZXIsIHtcbiAgICAgICAgICAgICAgICB0aWNrQ291bnQ6IGF4ZXNEYXRhLnhBeGlzID8gYXhlc0RhdGEueEF4aXMudGlja0NvdW50IDogLTFcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fYWRkQ29tcG9uZW50cyhjb252ZXJ0ZWREYXRhLCBheGVzRGF0YSwgb3B0aW9ucyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZCBjb21wb25lbnRzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGNvbnZlcnRlZERhdGEgY29udmVydGVkIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYXhlc0RhdGEgYXhlcyBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2FkZENvbXBvbmVudHM6IGZ1bmN0aW9uKGNvbnZlcnRlZERhdGEsIGF4ZXNEYXRhKSB7XG4gICAgICAgIHZhciBwbG90RGF0YSwgc2VyaWVzRGF0YTtcblxuICAgICAgICBwbG90RGF0YSA9IHRoaXMubWFrZVBsb3REYXRhKGNvbnZlcnRlZERhdGEucGxvdERhdGEsIGF4ZXNEYXRhKTtcbiAgICAgICAgc2VyaWVzRGF0YSA9IHtcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICB2YWx1ZXM6IHR1aS51dGlsLnBpdm90KGNvbnZlcnRlZERhdGEudmFsdWVzKSxcbiAgICAgICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXM6IHR1aS51dGlsLnBpdm90KGNvbnZlcnRlZERhdGEuZm9ybWF0dGVkVmFsdWVzKSxcbiAgICAgICAgICAgICAgICBzY2FsZTogYXhlc0RhdGEueUF4aXMuc2NhbGUsXG4gICAgICAgICAgICAgICAgeFRpY2tDb3VudDogYXhlc0RhdGEueEF4aXMgJiYgYXhlc0RhdGEueEF4aXMudGlja0NvdW50IHx8IC0xXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuYWRkQXhpc0NvbXBvbmVudHMoe1xuICAgICAgICAgICAgY29udmVydGVkRGF0YTogY29udmVydGVkRGF0YSxcbiAgICAgICAgICAgIGF4ZXM6IGF4ZXNEYXRhLFxuICAgICAgICAgICAgcGxvdERhdGE6IHBsb3REYXRhLFxuICAgICAgICAgICAgU2VyaWVzOiB0aGlzLlNlcmllcyxcbiAgICAgICAgICAgIHNlcmllc0RhdGE6IHNlcmllc0RhdGEsXG4gICAgICAgICAgICBhbGlnbmVkOiBheGVzRGF0YS54QXhpcyAmJiBheGVzRGF0YS54QXhpcy5hbGlnbmVkXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXJcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IGNoYXJ0IGVsZW1lbnRcbiAgICAgKi9cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNTdWJDaGFydCAmJiAhdGhpcy5pc0dyb3VwZWRUb29sdGlwKSB7XG4gICAgICAgICAgICB0aGlzLl9hdHRhY2hMaW5lVHlwZUNvb3JkaW5hdGVFdmVudCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBDaGFydEJhc2UucHJvdG90eXBlLnJlbmRlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBhdHRhY2ggY29vcmRpbmF0ZSBldmVudCBvZiBsaW5lIHR5cGUuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYXR0YWNoTGluZVR5cGVDb29yZGluYXRlRXZlbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZXZlbnRIYW5kbGVMYXllciA9IHRoaXMuY29tcG9uZW50TWFwLmV2ZW50SGFuZGxlTGF5ZXIsXG4gICAgICAgICAgICBzZXJpZXMgPSB0aGlzLmNvbXBvbmVudE1hcC5zZXJpZXM7XG4gICAgICAgIGV2ZW50SGFuZGxlTGF5ZXIub24oJ292ZXJUaWNrU2VjdG9yJywgc2VyaWVzLm9uTGluZVR5cGVPdmVyVGlja1NlY3Rvciwgc2VyaWVzKTtcbiAgICAgICAgZXZlbnRIYW5kbGVMYXllci5vbignb3V0VGlja1NlY3RvcicsIHNlcmllcy5vbkxpbmVUeXBlT3V0VGlja1NlY3Rvciwgc2VyaWVzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTWl4IGluLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGZ1bmMgdGFyZ2V0IGZ1bmN0aW9uXG4gICAgICogQGlnbm9yZVxuICAgICAqL1xuICAgIG1peGluOiBmdW5jdGlvbihmdW5jKSB7XG4gICAgICAgIHR1aS51dGlsLmV4dGVuZChmdW5jLnByb3RvdHlwZSwgdGhpcyk7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBsaW5lVHlwZU1peGVyO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFBpZSBjaGFydC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIENoYXJ0QmFzZSA9IHJlcXVpcmUoJy4vY2hhcnRCYXNlJyksXG4gICAgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4uL2NvbnN0JyksXG4gICAgTGVnZW5kID0gcmVxdWlyZSgnLi4vbGVnZW5kcy9sZWdlbmQnKSxcbiAgICBUb29sdGlwID0gcmVxdWlyZSgnLi4vdG9vbHRpcHMvdG9vbHRpcCcpLFxuICAgIFNlcmllcyA9IHJlcXVpcmUoJy4uL3Nlcmllcy9waWVDaGFydFNlcmllcycpO1xuXG52YXIgUGllQ2hhcnQgPSB0dWkudXRpbC5kZWZpbmVDbGFzcyhDaGFydEJhc2UsIC8qKiBAbGVuZHMgUGllQ2hhcnQucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBDb2x1bW4gY2hhcnQuXG4gICAgICogQGNvbnN0cnVjdHMgUGllQ2hhcnRcbiAgICAgKiBAZXh0ZW5kcyBDaGFydEJhc2VcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheT59IHVzZXJEYXRhIGNoYXJ0IGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgY2hhcnQgdGhlbWVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24odXNlckRhdGEsIHRoZW1lLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciBiYXNlRGF0YSA9IHRoaXMubWFrZUJhc2VEYXRhKHVzZXJEYXRhLCB0aGVtZSwgb3B0aW9ucyksXG4gICAgICAgICAgICBjb252ZXJ0ZWREYXRhID0gYmFzZURhdGEuY29udmVydGVkRGF0YSxcbiAgICAgICAgICAgIGJvdW5kcyA9IGJhc2VEYXRhLmJvdW5kcztcblxuICAgICAgICB0aGlzLmNsYXNzTmFtZSA9ICd0dWktcGllLWNoYXJ0JztcblxuICAgICAgICBvcHRpb25zLnRvb2x0aXAgPSBvcHRpb25zLnRvb2x0aXAgfHwge307XG5cbiAgICAgICAgaWYgKCFvcHRpb25zLnRvb2x0aXAucG9zaXRpb24pIHtcbiAgICAgICAgICAgIG9wdGlvbnMudG9vbHRpcC5wb3NpdGlvbiA9IGNoYXJ0Q29uc3QuVE9PTFRJUF9ERUZBVUxUX1BPU0lUSU9OX09QVElPTjtcbiAgICAgICAgfVxuXG4gICAgICAgIENoYXJ0QmFzZS5jYWxsKHRoaXMsIHtcbiAgICAgICAgICAgIGJvdW5kczogYm91bmRzLFxuICAgICAgICAgICAgdGhlbWU6IHRoZW1lLFxuICAgICAgICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLl9hZGRDb21wb25lbnRzKGNvbnZlcnRlZERhdGEsIHRoZW1lLmNoYXJ0LmJhY2tncm91bmQsIGJvdW5kcywgb3B0aW9ucyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZCBjb21wb25lbnRzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGNvbnZlcnRlZERhdGEgY29udmVydGVkIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY2hhcnRCYWNrZ3JvdW5kIGNoYXJ0IGJhY2tncm91bmRcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxvYmplY3Q+fSBib3VuZHMgYm91bmRzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2FkZENvbXBvbmVudHM6IGZ1bmN0aW9uKGNvbnZlcnRlZERhdGEsIGNoYXJ0QmFja2dyb3VuZCwgYm91bmRzLCBvcHRpb25zKSB7XG4gICAgICAgIGlmIChjb252ZXJ0ZWREYXRhLmpvaW5MZWdlbmRMYWJlbHMgJiYgKCFvcHRpb25zLnNlcmllcyB8fCAhb3B0aW9ucy5zZXJpZXMubGVnZW5kVHlwZSkpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KCdsZWdlbmQnLCBMZWdlbmQsIHtcbiAgICAgICAgICAgICAgICBqb2luTGVnZW5kTGFiZWxzOiBjb252ZXJ0ZWREYXRhLmpvaW5MZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICAgICAgbGVnZW5kTGFiZWxzOiBjb252ZXJ0ZWREYXRhLmxlZ2VuZExhYmVscyxcbiAgICAgICAgICAgICAgICBjaGFydFR5cGU6IG9wdGlvbnMuY2hhcnRUeXBlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KCd0b29sdGlwJywgVG9vbHRpcCwge1xuICAgICAgICAgICAgY2hhcnRUeXBlOiBvcHRpb25zLmNoYXJ0VHlwZSxcbiAgICAgICAgICAgIHZhbHVlczogY29udmVydGVkRGF0YS5mb3JtYXR0ZWRWYWx1ZXMsXG4gICAgICAgICAgICBsYWJlbHM6IGNvbnZlcnRlZERhdGEubGFiZWxzLFxuICAgICAgICAgICAgbGVnZW5kTGFiZWxzOiBjb252ZXJ0ZWREYXRhLmxlZ2VuZExhYmVscyxcbiAgICAgICAgICAgIGNoYXJ0SWQ6IHRoaXMuY2hhcnRJZCxcbiAgICAgICAgICAgIHNlcmllc1Bvc2l0aW9uOiBib3VuZHMuc2VyaWVzLnBvc2l0aW9uXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KCdzZXJpZXMnLCBTZXJpZXMsIHtcbiAgICAgICAgICAgIGxpYlR5cGU6IG9wdGlvbnMubGliVHlwZSxcbiAgICAgICAgICAgIGNoYXJ0VHlwZTogb3B0aW9ucy5jaGFydFR5cGUsXG4gICAgICAgICAgICBjaGFydEJhY2tncm91bmQ6IGNoYXJ0QmFja2dyb3VuZCxcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICB2YWx1ZXM6IGNvbnZlcnRlZERhdGEudmFsdWVzLFxuICAgICAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlczogY29udmVydGVkRGF0YS5mb3JtYXR0ZWRWYWx1ZXMsXG4gICAgICAgICAgICAgICAgbGVnZW5kTGFiZWxzOiBjb252ZXJ0ZWREYXRhLmxlZ2VuZExhYmVscyxcbiAgICAgICAgICAgICAgICBjaGFydFdpZHRoOiBib3VuZHMuY2hhcnQuZGltZW5zaW9uLndpZHRoXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBpZUNoYXJ0O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IHZlcnRpY2FsVHlwZU1peGVyIGlzIG1peGVyIG9mIHZlcnRpY2FsIHR5cGUgY2hhcnQoY29sdW1uLCBsaW5lLCBhcmVhKS5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGF4aXNEYXRhTWFrZXIgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2F4aXNEYXRhTWFrZXInKSxcbiAgICBzdGF0ZSA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvc3RhdGUnKTtcblxuLyoqXG4gKiB2ZXJ0aWNhbFR5cGVNaXhlciBpcyBtaXhlciBvZiB2ZXJ0aWNhbCB0eXBlIGNoYXJ0KGNvbHVtbiwgbGluZSwgYXJlYSkuXG4gKiBAbWl4aW5cbiAqL1xudmFyIHZlcnRpY2FsVHlwZU1peGVyID0ge1xuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYXhlcyBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGNvbnZlcnRlZERhdGEgY29udmVydGVkIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYm91bmRzIGNoYXJ0IGJvdW5kc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gaW5pdGVkRGF0YSBpbml0aWFsaXplZCBkYXRhIGZyb20gY29tYm8gY2hhcnRcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBheGVzIGRhdGFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQXhlc0RhdGE6IGZ1bmN0aW9uKGNvbnZlcnRlZERhdGEsIGJvdW5kcywgb3B0aW9ucywgaW5pdGVkRGF0YSkge1xuICAgICAgICB2YXIgYXhlc0RhdGEgPSB7fTtcbiAgICAgICAgaWYgKGluaXRlZERhdGEpIHtcbiAgICAgICAgICAgIGF4ZXNEYXRhID0gaW5pdGVkRGF0YS5heGVzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXhlc0RhdGEueUF4aXMgPSBheGlzRGF0YU1ha2VyLm1ha2VWYWx1ZUF4aXNEYXRhKHtcbiAgICAgICAgICAgICAgICB2YWx1ZXM6IGNvbnZlcnRlZERhdGEudmFsdWVzLFxuICAgICAgICAgICAgICAgIHNlcmllc0RpbWVuc2lvbjogYm91bmRzLnNlcmllcy5kaW1lbnNpb24sXG4gICAgICAgICAgICAgICAgc3RhY2tlZDogb3B0aW9ucy5zZXJpZXMgJiYgb3B0aW9ucy5zZXJpZXMuc3RhY2tlZCB8fCAnJyxcbiAgICAgICAgICAgICAgICBjaGFydFR5cGU6IG9wdGlvbnMuY2hhcnRUeXBlLFxuICAgICAgICAgICAgICAgIGZvcm1hdEZ1bmN0aW9uczogY29udmVydGVkRGF0YS5mb3JtYXRGdW5jdGlvbnMsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogb3B0aW9ucy55QXhpcyxcbiAgICAgICAgICAgICAgICBpc1ZlcnRpY2FsOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGF4ZXNEYXRhLnhBeGlzID0gYXhpc0RhdGFNYWtlci5tYWtlTGFiZWxBeGlzRGF0YSh7XG4gICAgICAgICAgICAgICAgbGFiZWxzOiBjb252ZXJ0ZWREYXRhLmxhYmVscyxcbiAgICAgICAgICAgICAgICBhbGlnbmVkOiBzdGF0ZS5pc0xpbmVUeXBlQ2hhcnQob3B0aW9ucy5jaGFydFR5cGUpLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IG9wdGlvbnMueEF4aXNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBheGVzRGF0YTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTWl4IGluLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGZ1bmMgdGFyZ2V0IGZ1bmN0aW9uXG4gICAgICogQGlnbm9yZVxuICAgICAqL1xuICAgIG1peGluOiBmdW5jdGlvbihmdW5jKSB7XG4gICAgICAgIHR1aS51dGlsLmV4dGVuZChmdW5jLnByb3RvdHlwZSwgdGhpcyk7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB2ZXJ0aWNhbFR5cGVNaXhlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBQaWNrIG1pbmltdW0gdmFsdWUgZnJvbSB2YWx1ZSBhcnJheS5cbiAqIEBwYXJhbSB7YXJyYXl9IGFyciB2YWx1ZSBhcnJheVxuICogQHBhcmFtIHtmdW5jdGlvbn0gY29uZGl0aW9uIGNvbmRpdGlvbiBmdW5jdGlvblxuICogQHBhcmFtIHtvYmplY3R9IGNvbnRleHQgdGFyZ2V0IGNvbnRleHRcbiAqIEByZXR1cm5zIHsqfSBtaW5pbXVtIHZhbHVlXG4gKi9cbnZhciBtaW4gPSBmdW5jdGlvbihhcnIsIGNvbmRpdGlvbiwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHQsIG1pblZhbHVlLCByZXN0O1xuICAgIGlmICghY29uZGl0aW9uKSB7XG4gICAgICAgIGNvbmRpdGlvbiA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICB9O1xuICAgIH1cbiAgICByZXN1bHQgPSBhcnJbMF07XG4gICAgbWluVmFsdWUgPSBjb25kaXRpb24uY2FsbChjb250ZXh0LCByZXN1bHQpO1xuICAgIHJlc3QgPSBhcnIuc2xpY2UoMSk7XG4gICAgdHVpLnV0aWwuZm9yRWFjaEFycmF5KHJlc3QsIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgdmFyIGNvbXBhcmVWYWx1ZSA9IGNvbmRpdGlvbi5jYWxsKGNvbnRleHQsIGl0ZW0pO1xuICAgICAgICBpZiAoY29tcGFyZVZhbHVlIDwgbWluVmFsdWUpIHtcbiAgICAgICAgICAgIG1pblZhbHVlID0gY29tcGFyZVZhbHVlO1xuICAgICAgICAgICAgcmVzdWx0ID0gaXRlbTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIFBpY2sgbWF4aW11bSB2YWx1ZSBmcm9tIHZhbHVlIGFycmF5LlxuICogQHBhcmFtIHthcnJheX0gYXJyIHZhbHVlIGFycmF5XG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjb25kaXRpb24gY29uZGl0aW9uIGZ1bmN0aW9uXG4gKiBAcGFyYW0ge29iamVjdH0gY29udGV4dCB0YXJnZXQgY29udGV4dFxuICogQHJldHVybnMgeyp9IG1heGltdW0gdmFsdWVcbiAqL1xudmFyIG1heCA9IGZ1bmN0aW9uKGFyciwgY29uZGl0aW9uLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdCwgbWF4VmFsdWUsIHJlc3Q7XG4gICAgaWYgKCFjb25kaXRpb24pIHtcbiAgICAgICAgY29uZGl0aW9uID0gZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgIH07XG4gICAgfVxuICAgIHJlc3VsdCA9IGFyclswXTtcbiAgICBtYXhWYWx1ZSA9IGNvbmRpdGlvbi5jYWxsKGNvbnRleHQsIHJlc3VsdCk7XG4gICAgcmVzdCA9IGFyci5zbGljZSgxKTtcbiAgICB0dWkudXRpbC5mb3JFYWNoQXJyYXkocmVzdCwgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICB2YXIgY29tcGFyZVZhbHVlID0gY29uZGl0aW9uLmNhbGwoY29udGV4dCwgaXRlbSk7XG4gICAgICAgIGlmIChjb21wYXJlVmFsdWUgPiBtYXhWYWx1ZSkge1xuICAgICAgICAgICAgbWF4VmFsdWUgPSBjb21wYXJlVmFsdWU7XG4gICAgICAgICAgICByZXN1bHQgPSBpdGVtO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogV2hldGhlciBvbmUgb2YgdGhlbSBpcyB0cnVlIG9yIG5vdC5cbiAqIEBwYXJhbSB7YXJyYXl9IGFyciB0YXJnZXQgYXJyYXlcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNvbmRpdGlvbiBjb25kaXRpb24gZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtib29sZWFufSByZXN1bHQgYm9vbGVhblxuICovXG52YXIgYW55ID0gZnVuY3Rpb24oYXJyLCBjb25kaXRpb24pIHtcbiAgICB2YXIgcmVzdWx0ID0gZmFsc2U7XG4gICAgdHVpLnV0aWwuZm9yRWFjaEFycmF5KGFyciwgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICBpZiAoY29uZGl0aW9uKGl0ZW0pKSB7XG4gICAgICAgICAgICByZXN1bHQgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogQWxsIG9mIHRoZW0gaXMgdHJ1ZSBvciBub3QuXG4gKiBAcGFyYW0ge2FycmF5fSBhcnIgdGFyZ2V0IGFycmF5XG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjb25kaXRpb24gY29uZGl0aW9uIGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gcmVzdWx0IGJvb2xlYW5cbiAqL1xudmFyIGFsbCA9IGZ1bmN0aW9uKGFyciwgY29uZGl0aW9uKSB7XG4gICAgdmFyIHJlc3VsdCA9IHRydWU7XG4gICAgdHVpLnV0aWwuZm9yRWFjaEFycmF5KGFyciwgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICBpZiAoIWNvbmRpdGlvbihpdGVtKSkge1xuICAgICAgICAgICAgcmVzdWx0ID0gZmFsc2U7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBBcnJheSBwaXZvdC5cbiAqIEBtZW1iZXJPZiBtb2R1bGU6Y2FsY3VsYXRvclxuICogQHBhcmFtIHthcnJheS48YXJyYXk+fSBhcnIyZCB0YXJnZXQgMmQgYXJyYXlcbiAqIEByZXR1cm5zIHthcnJheS48YXJyYXk+fSBwaXZvdGVkIDJkIGFycmF5XG4gKi9cbnZhciBwaXZvdCA9IGZ1bmN0aW9uKGFycjJkKSB7XG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgIHR1aS51dGlsLmZvckVhY2hBcnJheShhcnIyZCwgZnVuY3Rpb24oYXJyKSB7XG4gICAgICAgIHR1aS51dGlsLmZvckVhY2hBcnJheShhcnIsIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgICAgaWYgKCFyZXN1bHRbaW5kZXhdKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W2luZGV4XSA9IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0W2luZGV4XS5wdXNoKHZhbHVlKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogR2V0IGFmdGVyIHBvaW50IGxlbmd0aC5cbiAqIEBwYXJhbSB7c3RyaW5nIHwgbnVtYmVyfSB2YWx1ZSB0YXJnZXQgdmFsdWVcbiAqIEByZXR1cm5zIHtudW1iZXJ9IHJlc3VsdCBsZW5ndGhcbiAqL1xudmFyIGxlbmd0aEFmdGVyUG9pbnQgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHZhciB2YWx1ZUFyciA9ICh2YWx1ZSArICcnKS5zcGxpdCgnLicpO1xuICAgIHJldHVybiB2YWx1ZUFyci5sZW5ndGggPT09IDIgPyB2YWx1ZUFyclsxXS5sZW5ndGggOiAwO1xufTtcblxuLyoqXG4gKiBGaW5kIG11bHRpcGxlIG51bS5cbiAqIEBwYXJhbSB7Li4uYXJyYXl9IHRhcmdldCB2YWx1ZXNcbiAqIEByZXR1cm5zIHtudW1iZXJ9IG11bHRpcGxlIG51bVxuICovXG52YXIgZmluZE11bHRpcGxlTnVtID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cyksXG4gICAgICAgIHVuZGVyUG9pbnRMZW5zID0gdHVpLnV0aWwubWFwKGFyZ3MsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gdHVpLnV0aWwubGVuZ3RoQWZ0ZXJQb2ludCh2YWx1ZSk7XG4gICAgICAgIH0pLFxuICAgICAgICB1bmRlclBvaW50TGVuID0gdHVpLnV0aWwubWF4KHVuZGVyUG9pbnRMZW5zKSxcbiAgICAgICAgbXVsdGlwbGVOdW0gPSBNYXRoLnBvdygxMCwgdW5kZXJQb2ludExlbik7XG4gICAgcmV0dXJuIG11bHRpcGxlTnVtO1xufTtcblxuLyoqXG4gKiBNb2R1bG8gb3BlcmF0aW9uIGZvciBmbG9hdGluZyBwb2ludCBvcGVyYXRpb24uXG4gKiBAcGFyYW0ge251bWJlcn0gdGFyZ2V0IHRhcmdldCB2YWx1ZXNcbiAqIEBwYXJhbSB7bnVtYmVyfSBtb2ROdW0gbW9kIG51bVxuICogQHJldHVybnMge251bWJlcn0gcmVzdWx0IG1vZFxuICovXG52YXIgbW9kID0gZnVuY3Rpb24odGFyZ2V0LCBtb2ROdW0pIHtcbiAgICB2YXIgbXVsdGlwbGVOdW0gPSB0dWkudXRpbC5maW5kTXVsdGlwbGVOdW0obW9kTnVtKTtcbiAgICByZXR1cm4gKCh0YXJnZXQgKiBtdWx0aXBsZU51bSkgJSAobW9kTnVtICogbXVsdGlwbGVOdW0pKSAvIG11bHRpcGxlTnVtO1xufTtcblxuLyoqXG4gKiBBZGRpdGlvbiBmb3IgZmxvYXRpbmcgcG9pbnQgb3BlcmF0aW9uLlxuICogQHBhcmFtIHtudW1iZXJ9IGEgdGFyZ2V0IGFcbiAqIEBwYXJhbSB7bnVtYmVyfSBiIHRhcmdldCBiXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBhZGRpdGlvbiByZXN1bHRcbiAqL1xudmFyIGFkZGl0aW9uID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHZhciBtdWx0aXBsZU51bSA9IGZpbmRNdWx0aXBsZU51bShhLCBiKTtcbiAgICByZXR1cm4gKChhICogbXVsdGlwbGVOdW0pICsgKGIgKiBtdWx0aXBsZU51bSkpIC8gbXVsdGlwbGVOdW07XG59O1xuXG4vKipcbiAqIFN1YnRyYWN0aW9uIGZvciBmbG9hdGluZyBwb2ludCBvcGVyYXRpb24uXG4gKiBAcGFyYW0ge251bWJlcn0gYSB0YXJnZXQgYVxuICogQHBhcmFtIHtudW1iZXJ9IGIgdGFyZ2V0IGJcbiAqIEByZXR1cm5zIHtudW1iZXJ9IHN1YnRyYWN0aW9uIHJlc3VsdFxuICovXG52YXIgc3VidHJhY3Rpb24gPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgdmFyIG11bHRpcGxlTnVtID0gZmluZE11bHRpcGxlTnVtKGEsIGIpO1xuICAgIHJldHVybiAoKGEgKiBtdWx0aXBsZU51bSkgLSAoYiAqIG11bHRpcGxlTnVtKSkgLyBtdWx0aXBsZU51bTtcbn07XG5cbi8qKlxuICogTXVsdGlwbGljYXRpb24gZm9yIGZsb2F0aW5nIHBvaW50IG9wZXJhdGlvbi5cbiAqIEBwYXJhbSB7bnVtYmVyfSBhIHRhcmdldCBhXG4gKiBAcGFyYW0ge251bWJlcn0gYiB0YXJnZXQgYlxuICogQHJldHVybnMge251bWJlcn0gbXVsdGlwbGljYXRpb24gcmVzdWx0XG4gKi9cbnZhciBtdWx0aXBsaWNhdGlvbiA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICB2YXIgbXVsdGlwbGVOdW0gPSBmaW5kTXVsdGlwbGVOdW0oYSwgYik7XG4gICAgcmV0dXJuICgoYSAqIG11bHRpcGxlTnVtKSAqIChiICogbXVsdGlwbGVOdW0pKSAvIChtdWx0aXBsZU51bSAqIG11bHRpcGxlTnVtKTtcbn07XG5cbi8qKlxuICogRGl2aXNpb24gZm9yIGZsb2F0aW5nIHBvaW50IG9wZXJhdGlvbi5cbiAqIEBwYXJhbSB7bnVtYmVyfSBhIHRhcmdldCBhXG4gKiBAcGFyYW0ge251bWJlcn0gYiB0YXJnZXQgYlxuICogQHJldHVybnMge251bWJlcn0gZGl2aXNpb24gcmVzdWx0XG4gKi9cbnZhciBkaXZpc2lvbiA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICB2YXIgbXVsdGlwbGVOdW0gPSBmaW5kTXVsdGlwbGVOdW0oYSwgYik7XG4gICAgcmV0dXJuIChhICogbXVsdGlwbGVOdW0pIC8gKGIgKiBtdWx0aXBsZU51bSk7XG59O1xuXG4vKipcbiAqIFN1bS5cbiAqIEBwYXJhbSB7YXJyYXkuPG51bWJlcj59IHZhbHVlcyB0YXJnZXQgdmFsdWVzXG4gKiBAcmV0dXJucyB7bnVtYmVyfSByZXN1bHQgdmFsdWVcbiAqL1xudmFyIHN1bSA9IGZ1bmN0aW9uKHZhbHVlcykge1xuICAgIHZhciBjb3B5QXJyID0gdmFsdWVzLnNsaWNlKCk7XG4gICAgY29weUFyci51bnNoaWZ0KDApO1xuICAgIHJldHVybiB0dWkudXRpbC5yZWR1Y2UoY29weUFyciwgZnVuY3Rpb24oYmFzZSwgYWRkKSB7XG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KGJhc2UpICsgcGFyc2VGbG9hdChhZGQpO1xuICAgIH0pO1xufTtcblxudHVpLnV0aWwubWluID0gbWluO1xudHVpLnV0aWwubWF4ID0gbWF4O1xudHVpLnV0aWwuYW55ID0gYW55O1xudHVpLnV0aWwuYWxsID0gYWxsO1xudHVpLnV0aWwucGl2b3QgPSBwaXZvdDtcbnR1aS51dGlsLmxlbmd0aEFmdGVyUG9pbnQgPSBsZW5ndGhBZnRlclBvaW50O1xudHVpLnV0aWwubW9kID0gbW9kO1xudHVpLnV0aWwuZmluZE11bHRpcGxlTnVtID0gZmluZE11bHRpcGxlTnVtO1xudHVpLnV0aWwuYWRkaXRpb24gPSBhZGRpdGlvbjtcbnR1aS51dGlsLnN1YnRyYWN0aW9uID0gc3VidHJhY3Rpb247XG50dWkudXRpbC5tdWx0aXBsaWNhdGlvbiA9IG11bHRpcGxpY2F0aW9uO1xudHVpLnV0aWwuZGl2aXNpb24gPSBkaXZpc2lvbjtcbnR1aS51dGlsLnN1bSA9IHN1bTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBDaGFydCBjb25zdFxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuLyoqXG4gKiBDaGFydCBjb25zdFxuICogQHJlYWRvbmx5XG4gKiBAZW51bSB7bnVtYmVyfVxuICovXG52YXIgY2hhcnRDb25zdCA9IHtcbiAgICAvKiogY2hhcnQgaWQgcHJlZml4XG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICBDSEFSX0lEX1BSRUZJWDogJ3R1aS1jaGFydCcsXG4gICAgLyoqIHRvb2x0aXAgaWQgcHJlZml4XG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICBUT09MVElQX0lEX1BSRUZJWDogJ3R1aS1jaGFydC10b29sdGlwJyxcbiAgICAvKiogY2hhcnQgdHlwZXNcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIENIQVJUX1RZUEVfQkFSOiAnYmFyJyxcbiAgICAvKiogQHR5cGUge3N0cmluZ30gKi9cbiAgICBDSEFSVF9UWVBFX0NPTFVNTjogJ2NvbHVtbicsXG4gICAgLyoqIEB0eXBlIHtzdHJpbmd9ICovXG4gICAgQ0hBUlRfVFlQRV9MSU5FOiAnbGluZScsXG4gICAgLyoqIEB0eXBlIHtzdHJpbmd9ICovXG4gICAgQ0hBUlRfVFlQRV9BUkVBOiAnYXJlYScsXG4gICAgLyoqIEB0eXBlIHtzdHJpbmd9ICovXG4gICAgQ0hBUlRfVFlQRV9DT01CTzogJ2NvbWJvJyxcbiAgICAvKiogQHR5cGUge3N0cmluZ30gKi9cbiAgICBDSEFSVF9UWVBFX1BJRTogJ3BpZScsXG4gICAgLyoqIGNoYXJ0IHBhZGRpbmcgKi9cbiAgICBDSEFSVF9QQURESU5HOiAxMCxcbiAgICAvKiogY2hhcnQgZGVmYXVsdCB3aWR0aCAqL1xuICAgIENIQVJUX0RFRkFVTFRfV0lEVEg6IDUwMCxcbiAgICAvKiogY2hhcnQgZGVmYXVsdCBoZWlnaHQgKi9cbiAgICBDSEFSVF9ERUZBVUxUX0hFSUdIVDogNDAwLFxuICAgIC8qKiBoaWRkZW4gd2lkdGggKi9cbiAgICBISURERU5fV0lEVEg6IDEsXG4gICAgLyoqIHJlbmRlcmVkIHRleHQgcGFkZGluZyAqL1xuICAgIFRFWFRfUEFERElORzogMixcbiAgICAvKiogc2VyaWVzIGV4cGFuZCBzaXplICovXG4gICAgU0VSSUVTX0VYUEFORF9TSVpFOiAxMCxcbiAgICAvKiogc2VyaWVzIGxhYmVsIHBhZGRpbmcgKi9cbiAgICBTRVJJRVNfTEFCRUxfUEFERElORzogNSxcbiAgICAvKiogZGVmYXVsdCBmb250IHNpemUgb2YgdGl0bGUgKi9cbiAgICBERUZBVUxUX1RJVExFX0ZPTlRfU0laRTogMTQsXG4gICAgLyoqIGRlZmF1bHQgZm9udCBzaXplIG9mIGF4aXMgdGl0bGUgKi9cbiAgICBERUZBVUxUX0FYSVNfVElUTEVfRk9OVF9TSVpFOiAxMCxcbiAgICAvKiogZGVmYXVsdCBmb250IHNpemUgb2YgbGFiZWwgKi9cbiAgICBERUZBVUxUX0xBQkVMX0ZPTlRfU0laRTogMTIsXG4gICAgLyoqIGRlZmF1bHQgZm9udCBzaXplIG9mIHNlcmllcyBsYWJlbCAqL1xuICAgIERFRkFVTFRfU0VSSUVTX0xBQkVMX0ZPTlRfU0laRTogMTEsXG4gICAgLyoqIEB0eXBlIHtzdHJpbmd9ICovXG4gICAgLyoqIGRlZmF1bHQgZ3JhcGggcGx1Z2luXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICBERUZBVUxUX1BMVUdJTjogJ3JhcGhhZWwnLFxuICAgIC8qKiBkZWZhdWx0IHRpY2sgY29sb3JcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIERFRkFVTFRfVElDS19DT0xPUjogJ2JsYWNrJyxcbiAgICAvKiogZGVmYXVsdCB0aGVtZSBuYW1lXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICBERUZBVUxUX1RIRU1FX05BTUU6ICdkZWZhdWx0JyxcbiAgICAvKiogc3RhY2tlZCBvcHRpb24gdHlwZXNcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIFNUQUNLRURfTk9STUFMX1RZUEU6ICdub3JtYWwnLFxuICAgIC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuICAgIFNUQUNLRURfUEVSQ0VOVF9UWVBFOiAncGVyY2VudCcsXG4gICAgLyoqIGVtcHR5IGF4aXMgbGFiZWwgKi9cbiAgICBFTVBUWV9BWElTX0xBQkVMOiAnJyxcbiAgICAvKiogYW5nZWwgKi9cbiAgICBBTkdMRV84NTogODUsXG4gICAgQU5HTEVfOTA6IDkwLFxuICAgIEFOR0xFXzM2MDogMzYwLFxuICAgIC8qKiByYWRpYW4gKi9cbiAgICBSQUQ6IE1hdGguUEkgLyAxODAsXG4gICAgLyoqIHNlcmllcyBsZWdlbmQgdHlwZXNcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIFNFUklFU19MRUdFTkRfVFlQRV9PVVRFUjogJ291dGVyJyxcbiAgICAvKiogc2VyaWVzIG91dGVyIGxhYmVsIHBhZGRpbmcgKi9cbiAgICBTRVJJRVNfT1VURVJfTEFCRUxfUEFERElORzogMjAsXG4gICAgLyoqIGRlZmF1bHQgcmF0ZSBvZiBwaWUgZ3JhcGggKi9cbiAgICBQSUVfR1JBUEhfREVGQVVMVF9SQVRFOiAwLjgsXG4gICAgLyoqIHNtYWxsIHJhdGUgb2YgcGllIGdyYXBoICovXG4gICAgUElFX0dSQVBIX1NNQUxMX1JBVEU6IDAuNjUsXG4gICAgLyoqIHlBeGlzIHByb3BlcnRpZXNcbiAgICAgKiBAdHlwZSB7YXJyYXkuPHN0cmluZz59XG4gICAgICovXG4gICAgWUFYSVNfUFJPUFM6IFsndGlja0NvbG9yJywgJ3RpdGxlJywgJ2xhYmVsJ10sIC8vIHlheGlzIHRoZW1l7J2YIOyGjeyEsSAtIGNoYXJ0IHR5cGUgZmlsdGVyaW5n7ZWgIOuVjCDsgqzsmqnrkKhcbiAgICAvKiogc2VyaWVzIHByb3BlcnRpZXNcbiAgICAgKiBAdHlwZSB7YXJyYXkuPHN0cmluZz59XG4gICAgICovXG4gICAgU0VSSUVTX1BST1BTOiBbJ2xhYmVsJywgJ2NvbG9ycycsICdib3JkZXJDb2xvcicsICdzaW5nbGVDb2xvcnMnXSwgLy8gc2VyaWVzIHRoZW1l7J2YIOyGjeyEsSAtIGNoYXJ0IHR5cGUgZmlsdGVyaW5n7ZWgIOuVjCDsgqzsmqnrkKhcbiAgICAvKiogdGl0bGUgYXJlYSB3aWR0aCBwYWRkaW5nICovXG4gICAgVElUTEVfQVJFQV9XSURUSF9QQURESU5HOiAyMCxcbiAgICAvKiogdG9wIG1hcmdpbiBvZiB4IGF4aXMgbGFiZWwgKi9cbiAgICBYQVhJU19MQUJFTF9UT1BfTUFSR0lOOiAxMCxcbiAgICAvKiogcmlnaHQgcGFkZGluZyBvZiB2ZXJ0aWNhbCBsYWJlbCAqL1xuICAgIFZfTEFCRUxfUklHSFRfUEFERElORzogMTAsXG4gICAgLyoqIHRvb2x0aXAgcHJlZml4XG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICBUT09MVElQX1BSRUZJWDogJ3R1aS1jaGFydC10b29sdGlwJyxcbiAgICAvKiogbWluaW11bSBwaXhlbCB0eXBlIHN0ZXAgc2l6ZSAqL1xuICAgIE1JTl9QSVhFTF9UWVBFX1NURVBfU0laRTogNDAsXG4gICAgLyoqIG1heGltdW0gcGl4ZWwgdHlwZSBzdGVwIHNpemUgKi9cbiAgICBNQVhfUElYRUxfVFlQRV9TVEVQX1NJWkU6IDYwLFxuICAgIC8qKiB0aWNrIGluZm8gb2YgcGVyY2VudCBzdGFja2VkIG9wdGlvblxuICAgICAqIEB0eXBlIHtvYmplY3R9XG4gICAgICovXG4gICAgUEVSQ0VOVF9TVEFDS0VEX1RJQ0tfSU5GTzoge1xuICAgICAgICBzY2FsZToge1xuICAgICAgICAgICAgbWluOiAwLFxuICAgICAgICAgICAgbWF4OiAxMDBcbiAgICAgICAgfSxcbiAgICAgICAgc3RlcDogMjUsXG4gICAgICAgIHRpY2tDb3VudDogNSxcbiAgICAgICAgbGFiZWxzOiBbMCwgMjUsIDUwLCA3NSwgMTAwXVxuICAgIH0sXG4gICAgLyoqIHRpdGxlIGFkZCBwYWRkaW5nICovXG4gICAgVElUTEVfUEFERElORzogMjAsXG4gICAgLyoqIGxlZ2VuZCBhcmVhIHBhZGRpbmcgKi9cbiAgICBMRUdFTkRfQVJFQV9QQURESU5HOiAxMCxcbiAgICAvKiogbGVnZW5kIHJlY3Qgd2lkdGggKi9cbiAgICBMRUdFTkRfUkVDVF9XSURUSDogMTIsXG4gICAgLyoqIGxnZW5kIGxhYmVsIGxlZnQgcGFkZGluZyAqL1xuICAgIExFR0VORF9MQUJFTF9MRUZUX1BBRERJTkc6IDUsXG4gICAgLyoqIEFYSVMgTEFCRUwgUEFERElORyAqL1xuICAgIEFYSVNfTEFCRUxfUEFERElORzogNyxcbiAgICAvKiogcm90YXRpb25zIGRlZ3JlZSBjYW5kaWRhdGVzICovXG4gICAgREVHUkVFX0NBTkRJREFURVM6IFsyNSwgNDUsIDY1LCA4NV0sXG4gICAgLyoqIHhBeGlzIGxhYmVsIGNvbXBhcmUgbWFyZ2luICovXG4gICAgWEFYSVNfTEFCRUxfQ09NUEFSRV9NQVJHSU46IDIwLFxuICAgIC8qKiB4QXhpcyBsYWJlbCBndXR0ZXIgKi9cbiAgICBYQVhJU19MQUJFTF9HVVRURVI6IDIsXG4gICAgLyoqIHN0YW5kIG11bHRpcGxlIG51bXMgb2YgYXhpcyAqL1xuICAgIEFYSVNfU1RBTkRBUkRfTVVMVElQTEVfTlVNUzogWzEsIDIsIDUsIDEwXSxcbiAgICAvKiogbGFiZWwgcGFkZGluZyB0b3AgKi9cbiAgICBMQUJFTF9QQURESU5HX1RPUDogMixcbiAgICAvKiogbGluZSBtYXJnaW4gdG9wICovXG4gICAgTElORV9NQVJHSU5fVE9QOiA1LFxuICAgIC8qKiB0b29sdGlwIGdhcCAqL1xuICAgIFRPT0xUSVBfR0FQOiA1LFxuICAgIC8qKiB0b29sdGlwIGRpcmVjdGlvblxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICovXG4gICAgVE9PTFRJUF9ESVJFQ1RJT05fRk9SV09SRDogJ2ZvcndvcmQnLFxuICAgIC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuICAgIFRPT0xUSVBfRElSRUNUSU9OX0JBQ0tXT1JEOiAnYmFja3dvcmQnLFxuICAgIC8qKiB0b29sdGlwIGRlZmF1bHQgcG9zaXRpb24gb3B0aW9uXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICBUT09MVElQX0RFRkFVTFRfUE9TSVRJT05fT1BUSU9OOiAnY2VudGVyIHRvcCcsXG4gICAgLyoqIEB0eXBlIHtzdHJpbmd9ICovXG4gICAgVE9PTFRJUF9ERUZBVUxUX0hPUklaT05UQUxfUE9TSVRJT05fT1BUSU9OOiAncmlnaHQgbWlkZGxlJyxcbiAgICAvKiogaGlkZSBkZWxheSAqL1xuICAgIEhJREVfREVMQVk6IDIwMFxufTtcbm1vZHVsZS5leHBvcnRzID0gY2hhcnRDb25zdDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBFdmVudEhhbmRsZUxheWVyQmFzZSBpcyBiYXNlIGNsYXNzIGZvciBldmVudCBoYW5kbGUgbGF5ZXJzLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZXZlbnQgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2V2ZW50TGlzdGVuZXInKSxcbiAgICBkb20gPSByZXF1aXJlKCcuLi9oZWxwZXJzL2RvbUhhbmRsZXInKSxcbiAgICByZW5kZXJVdGlsID0gcmVxdWlyZSgnLi4vaGVscGVycy9yZW5kZXJVdGlsJyk7XG5cbnZhciBFdmVudEhhbmRsZUxheWVyQmFzZSA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgRXZlbnRIYW5kbGVMYXllckJhc2UucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBFdmVudEhhbmRsZUxheWVyQmFzZSBpcyBiYXNlIGNsYXNzIGZvciBldmVudCBoYW5kbGUgbGF5ZXJzLlxuICAgICAqIEBjb25zdHJ1Y3RzIEV2ZW50SGFuZGxlTGF5ZXJCYXNlXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge3tcbiAgICAgKiAgICAgICAgICBkaW1lbnNpb246IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn0sXG4gICAgICogICAgICAgICAgcG9zaXRpb246IHtsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfVxuICAgICAqICAgICAgfX0gcGFyYW1zLmJvdW5kIGJvdW5kXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLmNoYXJ0VHlwZSBjaGFydCB0eXBlXG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5pc1ZlcnRpY2FsIHdoZXRoZXIgdmVydGljYWwgb3Igbm90XG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHRoaXMuYm91bmQgPSBwYXJhbXMuYm91bmQ7XG4gICAgICAgIHRoaXMuY2hhcnRUeXBlID0gcGFyYW1zLmNoYXJ0VHlwZTtcbiAgICAgICAgdGhpcy5pc1ZlcnRpY2FsID0gcGFyYW1zLmlzVmVydGljYWw7XG4gICAgICAgIHRoaXMuY29vcmRpbmF0ZURhdGEgPSB0aGlzLm1ha2VDb29yZGluYXRlRGF0YShwYXJhbXMuYm91bmQuZGltZW5zaW9uLCBwYXJhbXMudGlja0NvdW50LCBwYXJhbXMuY2hhcnRUeXBlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBjb29yZGluYXRlIGRhdGEuXG4gICAgICovXG4gICAgbWFrZUNvb3JkaW5hdGVEYXRhOiBmdW5jdGlvbigpIHt9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyLlxuICAgICAqIEByZXR1cm4ge0hUTUxFbGVtZW50fSBjb29yZGluYXRlIGFyZWFcbiAgICAgKi9cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZWxDb29yZGluYXRlQXJlYSA9IGRvbS5jcmVhdGUoJ0RJVicsICd0dWktY2hhcnQtc2VyaWVzLWNvb3JkaW5hdGUtYXJlYScpO1xuICAgICAgICByZW5kZXJVdGlsLnJlbmRlckRpbWVuc2lvbihlbENvb3JkaW5hdGVBcmVhLCB0aGlzLmJvdW5kLmRpbWVuc2lvbik7XG4gICAgICAgIHJlbmRlclV0aWwucmVuZGVyUG9zaXRpb24oZWxDb29yZGluYXRlQXJlYSwgdGhpcy5ib3VuZC5wb3NpdGlvbik7XG4gICAgICAgIHRoaXMuYXR0YWNoRXZlbnQoZWxDb29yZGluYXRlQXJlYSk7XG4gICAgICAgIHJldHVybiBlbENvb3JkaW5hdGVBcmVhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGaW5kIGdyb3VwIGluZGV4LlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBwb2ludFZhbHVlIG1vdXNlIHBvc2l0aW9uIHBvaW50IHZhbHVlXG4gICAgICogQHJldHVybnMge251bWJlcn0gZ3JvdXAgaW5kZXhcbiAgICAgKi9cbiAgICBmaW5kSW5kZXg6IGZ1bmN0aW9uKHBvaW50VmFsdWUpIHtcbiAgICAgICAgdmFyIGZvdW5kSW5kZXggPSAtMTtcbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaEFycmF5KHRoaXMuY29vcmRpbmF0ZURhdGEsIGZ1bmN0aW9uKHNjYWxlLCBpbmRleCkge1xuICAgICAgICAgICAgaWYgKHNjYWxlLm1pbiA8IHBvaW50VmFsdWUgJiYgc2NhbGUubWF4ID49IHBvaW50VmFsdWUpIHtcbiAgICAgICAgICAgICAgICBmb3VuZEluZGV4ID0gaW5kZXg7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gZm91bmRJbmRleDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBjb29yZGluYXRlIGRhdGEgYWJvdW50IGxpbmUgdHlwZSBjaGFydC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGggd2lkdGhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdGlja0NvdW50IHRpY2sgY291bnRcbiAgICAgKiBAcmV0dXJucyB7YXJyYXl9IGNvb3JkaW5hdGUgZGF0YVxuICAgICAqL1xuICAgIG1ha2VMaW5lVHlwZUNvb3JkaW5hdGVEYXRhOiBmdW5jdGlvbih3aWR0aCwgdGlja0NvdW50KSB7XG4gICAgICAgIHZhciB0aWNrSW50ZXJ2YWwgPSB3aWR0aCAvICh0aWNrQ291bnQgLSAxKSxcbiAgICAgICAgICAgIGhhbGZJbnRlcnZhbCA9IHRpY2tJbnRlcnZhbCAvIDI7XG4gICAgICAgIHJldHVybiB0dWkudXRpbC5tYXAodHVpLnV0aWwucmFuZ2UoMCwgdGlja0NvdW50KSwgZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgbWluOiBpbmRleCAqIHRpY2tJbnRlcnZhbCAtIGhhbGZJbnRlcnZhbCxcbiAgICAgICAgICAgICAgICBtYXg6IGluZGV4ICogdGlja0ludGVydmFsICsgaGFsZkludGVydmFsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogT24gbW91c2UgbW92ZVxuICAgICAqIEBhYnN0cmFjdFxuICAgICAqL1xuICAgIG9uTW91c2Vtb3ZlOiBmdW5jdGlvbigpIHt9LFxuXG4gICAgLyoqXG4gICAgICogT24gbW91c2Ugb3V0XG4gICAgICogQGFic3RyYWN0XG4gICAgICovXG4gICAgb25Nb3VzZW91dDogZnVuY3Rpb24oKSB7fSxcblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCBldmVudFxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICovXG4gICAgYXR0YWNoRXZlbnQ6IGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgIGV2ZW50LmJpbmRFdmVudCgnbW91c2Vtb3ZlJywgZWwsIHR1aS51dGlsLmJpbmQodGhpcy5vbk1vdXNlbW92ZSwgdGhpcykpO1xuICAgICAgICBldmVudC5iaW5kRXZlbnQoJ21vdXNlb3V0JywgZWwsIHR1aS51dGlsLmJpbmQodGhpcy5vbk1vdXNlb3V0LCB0aGlzKSk7XG4gICAgfVxufSk7XG5cbnR1aS51dGlsLkN1c3RvbUV2ZW50cy5taXhpbihFdmVudEhhbmRsZUxheWVyQmFzZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRIYW5kbGVMYXllckJhc2U7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgR3JvdXBlZEV2ZW50SGFuZGxlTGF5ZXIgaXMgZXZlbnQgaGFuZGxlIGxheWVyIGZvciBncm91cGVkIHRvb2xpcCBvcHRpb24uXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBFdmVudEhhbmRsZUxheWVyQmFzZSA9IHJlcXVpcmUoJy4vZXZlbnRIYW5kbGVMYXllckJhc2UnKSxcbiAgICBjaGFydENvbnN0ID0gcmVxdWlyZSgnLi4vY29uc3QnKSxcbiAgICBzdGF0ZSA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvc3RhdGUnKTtcblxudmFyIEdyb3VwZWRFdmVudEhhbmRsZUxheWVyID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoRXZlbnRIYW5kbGVMYXllckJhc2UsIC8qKiBAbGVuZHMgR3JvdXBlZEV2ZW50SGFuZGxlTGF5ZXIucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBHcm91cGVkRXZlbnRIYW5kbGVMYXllciBpcyBldmVudCBoYW5kbGUgbGF5ZXIgZm9yIGdyb3VwZWQgdG9vbGlwIG9wdGlvbi5cbiAgICAgKiBAY29uc3RydWN0cyBFdmVudEhhbmRsZUxheWVyQmFzZVxuICAgICAqIEBleHRlbmRzIEV2ZW50SGFuZGxlTGF5ZXJCYXNlXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIEV2ZW50SGFuZGxlTGF5ZXJCYXNlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgY29vcmRpbmF0ZSBkYXRhIGFib3V0IG5vbiBsaW5lIHR5cGUgY2hhcnQuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHNpemUgd2lkdGggb3IgaGVpZ2h0XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHRpY2tDb3VudCB0aWNrIGNvdW50XG4gICAgICogQHJldHVybnMge2FycmF5fSBjb29yZGluYXRlIGRhdGFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlTm9ybWFsQ29vcmRpbmF0ZURhdGE6IGZ1bmN0aW9uKHNpemUsIHRpY2tDb3VudCkge1xuICAgICAgICB2YXIgbGVuID0gdGlja0NvdW50IC0gMSxcbiAgICAgICAgICAgIHRpY2tJbnRlcnZhbCA9IHNpemUgLyBsZW4sXG4gICAgICAgICAgICBwcmV2ID0gMDtcbiAgICAgICAgcmV0dXJuIHR1aS51dGlsLm1hcCh0dWkudXRpbC5yYW5nZSgwLCBsZW4pLCBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICAgICAgdmFyIG1heCA9IHR1aS51dGlsLm1pbihbc2l6ZSwgKGluZGV4ICsgMSkgKiB0aWNrSW50ZXJ2YWxdKSxcbiAgICAgICAgICAgICAgICBzY2FsZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgbWluOiBwcmV2LFxuICAgICAgICAgICAgICAgICAgICBtYXg6IG1heFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICBwcmV2ID0gbWF4O1xuICAgICAgICAgICAgcmV0dXJuIHNjYWxlO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBjb29yZGluYXRlIGRhdGEuXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBkaW1lbnNpb24gZGltZW5zaW9uXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHRpY2tDb3VudCB0aWNrIGNvdW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNoYXJ0VHlwZSBjaGFydCB0eXBlXG4gICAgICogQHJldHVybnMge2FycmF5Ljx7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfT59IHRpY2sgZ3JvdXBzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBtYWtlQ29vcmRpbmF0ZURhdGE6IGZ1bmN0aW9uKGRpbWVuc2lvbiwgdGlja0NvdW50LCBjaGFydFR5cGUpIHtcbiAgICAgICAgdmFyIHNpemVUeXBlID0gdGhpcy5pc1ZlcnRpY2FsID8gJ3dpZHRoJyA6ICdoZWlnaHQnLFxuICAgICAgICAgICAgY29vcmRpbmF0ZURhdGE7XG4gICAgICAgIGlmIChzdGF0ZS5pc0xpbmVUeXBlQ2hhcnQoY2hhcnRUeXBlKSkge1xuICAgICAgICAgICAgY29vcmRpbmF0ZURhdGEgPSB0aGlzLm1ha2VMaW5lVHlwZUNvb3JkaW5hdGVEYXRhKGRpbWVuc2lvbltzaXplVHlwZV0sIHRpY2tDb3VudCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb29yZGluYXRlRGF0YSA9IHRoaXMuX21ha2VOb3JtYWxDb29yZGluYXRlRGF0YShkaW1lbnNpb25bc2l6ZVR5cGVdLCB0aWNrQ291bnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNvb3JkaW5hdGVEYXRhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHJhbmdlIG9mIHRvb2x0aXAgcG9zaXRpb24uXG4gICAgICogQHBhcmFtIHt7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX0gc2NhbGUgc2NhbGVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY2hhcnRUeXBlIGNoYXJ0IHR5cGVcbiAgICAgKiBAcmV0dXJucyB7e3N0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyfX0gcmFuZ2UgdHlwZSB2YWx1ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VSYW5nZTogZnVuY3Rpb24oc2NhbGUsIGNoYXJ0VHlwZSkge1xuICAgICAgICB2YXIgcmFuZ2UsIGNlbnRlcjtcbiAgICAgICAgaWYgKHN0YXRlLmlzTGluZVR5cGVDaGFydChjaGFydFR5cGUpKSB7XG4gICAgICAgICAgICBjZW50ZXIgPSBzY2FsZS5tYXggLSAoc2NhbGUubWF4IC0gc2NhbGUubWluKSAvIDI7XG4gICAgICAgICAgICByYW5nZSA9IHtcbiAgICAgICAgICAgICAgICBzdGFydDogY2VudGVyLFxuICAgICAgICAgICAgICAgIGVuZDogY2VudGVyXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmFuZ2UgPSB7XG4gICAgICAgICAgICAgICAgc3RhcnQ6IHNjYWxlLm1pbixcbiAgICAgICAgICAgICAgICBlbmQ6IHNjYWxlLm1heFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByYW5nZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGxheWVyIHBvc2l0aW9uLlxuICAgICAqIEBwYXJhbSB7TW91c2VFdmVudH0gZSBtb3VzZSBldmVudCBvYmplY3RcbiAgICAgKiBAcGFyYW0ge3t0b3A6IG51bWJlciwgcmlnaHQ6IG51bWJlciwgYm90dG9tOiBudW1iZXIsIGxlZnQ6IG51bWJlcn19IGJvdW5kIGJvdW5kXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpc1ZlcnRpY2FsIHdoZXRoZXIgdmVydGljYWwgb3Igbm90XG4gICAgICogQHJldHVybnMge251bWJlcn0gbGF5ZXIgcG9zaXRpb24gKGxlZnQgb3IgdG9wKVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldExheWVyUG9zaXRpb25WYWx1ZTogZnVuY3Rpb24oZSwgYm91bmQsIGlzVmVydGljYWwpIHtcbiAgICAgICAgdmFyIGxheWVyUG9zaXRpb247XG4gICAgICAgIGlmIChpc1ZlcnRpY2FsKSB7XG4gICAgICAgICAgICBsYXllclBvc2l0aW9uID0gZS5jbGllbnRYIC0gYm91bmQubGVmdDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxheWVyUG9zaXRpb24gPSBlLmNsaWVudFkgLSBib3VuZC50b3A7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxheWVyUG9zaXRpb247XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB0b29sdGlwIGRpcmVjdGlvbi5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggaW5kZXhcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBkaXJlY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRUb29sdGlwRGlyZWN0aW9uOiBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICB2YXIgc3RhbmRhcmROdW1iZXIgPSBNYXRoLmNlaWwodGhpcy5jb29yZGluYXRlRGF0YS5sZW5ndGggLyAyKSxcbiAgICAgICAgICAgIG51bWJlciA9IGluZGV4ICsgMTtcbiAgICAgICAgLy8g7KSR7JWZ7J2EIOq4sOykgOycvOuhnCDspJHslZnsnYQg7Y+s7ZWo7ZWY7JesIOyVnuu2gOu2hOyXkCDsnITsuZjtlZjripQgZGF0YeuKlCBmb3J3b3Jk66W8IOuwmO2ZmO2VmOqzoCwg65K367aA67aE7JeQIOychOy5mO2VmOuKlCBkYXRh64qUIGJhY2t3b3Jk66W8IOuwmO2ZmO2VnOuLpC5cbiAgICAgICAgcmV0dXJuIHN0YW5kYXJkTnVtYmVyID49IG51bWJlciA/IGNoYXJ0Q29uc3QuVE9PTFRJUF9ESVJFQ1RJT05fRk9SV09SRCA6IGNoYXJ0Q29uc3QuVE9PTFRJUF9ESVJFQ1RJT05fQkFDS1dPUkQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE9uIG1vdXNlbW92ZS5cbiAgICAgKiBAcGFyYW0ge01vdXNlRXZlbnR9IGUgbW91c2UgZXZlbnQgb2JqZWN0XG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgb25Nb3VzZW1vdmU6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIGVsVGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50LFxuICAgICAgICAgICAgYm91bmQgPSBlbFRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgICAgICAgIGxheWVyUG9zaXRpb25WYWx1ZSA9IHRoaXMuX2dldExheWVyUG9zaXRpb25WYWx1ZShlLCBib3VuZCwgdGhpcy5pc1ZlcnRpY2FsKSxcbiAgICAgICAgICAgIGluZGV4ID0gdGhpcy5maW5kSW5kZXgobGF5ZXJQb3NpdGlvblZhbHVlKSxcbiAgICAgICAgICAgIHByZXZJbmRleCA9IHRoaXMucHJldkluZGV4LFxuICAgICAgICAgICAgc2l6ZVR5cGUgPSB0aGlzLmlzVmVydGljYWwgPyAnaGVpZ2h0JyA6ICd3aWR0aCcsXG4gICAgICAgICAgICBkaXJlY3Rpb247XG5cbiAgICAgICAgaWYgKGluZGV4ID09PSAtMSB8fCBwcmV2SW5kZXggPT09IGluZGV4KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnByZXZJbmRleCA9IGluZGV4O1xuXG4gICAgICAgIGRpcmVjdGlvbiA9IHRoaXMuX2dldFRvb2x0aXBEaXJlY3Rpb24oaW5kZXgpO1xuXG4gICAgICAgIHRoaXMuZmlyZSgnc2hvd0dyb3VwVG9vbHRpcCcsIHtcbiAgICAgICAgICAgIGluZGV4OiBpbmRleCxcbiAgICAgICAgICAgIHJhbmdlOiB0aGlzLl9tYWtlUmFuZ2UodGhpcy5jb29yZGluYXRlRGF0YVtpbmRleF0sIHRoaXMuY2hhcnRUeXBlKSxcbiAgICAgICAgICAgIHNpemU6IHRoaXMuYm91bmQuZGltZW5zaW9uW3NpemVUeXBlXSxcbiAgICAgICAgICAgIGRpcmVjdGlvbjogZGlyZWN0aW9uLFxuICAgICAgICAgICAgaXNWZXJ0aWNhbDogdGhpcy5pc1ZlcnRpY2FsXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBPbiBtb3VzZW91dC5cbiAgICAgKiBAcGFyYW0ge01vdXNlRXZlbnR9IGUgbW91c2UgZXZlbnQgb2JqZWN0XG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgb25Nb3VzZW91dDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZmlyZSgnaGlkZUdyb3VwVG9vbHRpcCcsIHRoaXMucHJldkluZGV4KTtcbiAgICAgICAgZGVsZXRlIHRoaXMucHJldkluZGV4O1xuICAgIH1cbn0pO1xuXG50dWkudXRpbC5DdXN0b21FdmVudHMubWl4aW4oR3JvdXBlZEV2ZW50SGFuZGxlTGF5ZXIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEdyb3VwZWRFdmVudEhhbmRsZUxheWVyO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IExpbmVUeXBlRXZlbnRIYW5kbGVMYXllciBpcyBldmVudCBoYW5kbGUgbGF5ZXIgZm9yIGxpbmUgdHlwZSBjaGFydC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIEV2ZW50SGFuZGxlTGF5ZXJCYXNlID0gcmVxdWlyZSgnLi9ldmVudEhhbmRsZUxheWVyQmFzZScpO1xuXG52YXIgTGluZVR5cGVFdmVudEhhbmRsZUxheWVyID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoRXZlbnRIYW5kbGVMYXllckJhc2UsIC8qKiBAbGVuZHMgTGluZVR5cGVFdmVudEhhbmRsZUxheWVyLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogTGluZVR5cGVFdmVudEhhbmRsZUxheWVyIGlzIGV2ZW50IGhhbmRsZSBsYXllciBmb3IgbGluZSB0eXBlIGNoYXJ0LlxuICAgICAqIEBjb25zdHJ1Y3RzIExpbmVUeXBlRXZlbnRIYW5kbGVMYXllclxuICAgICAqIEBleHRlbmRzIExpbmVUeXBlRXZlbnRIYW5kbGVMYXllclxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBFdmVudEhhbmRsZUxheWVyQmFzZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGNvb3JkaW5hdGUgZGF0YS5cbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGRpbWVuc2lvbiBkaW1lbnNpb25cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdGlja0NvdW50IHRpY2sgY291bnRcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9Pn0gdGljayBncm91cHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIG1ha2VDb29yZGluYXRlRGF0YTogZnVuY3Rpb24oZGltZW5zaW9uLCB0aWNrQ291bnQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWFrZUxpbmVUeXBlQ29vcmRpbmF0ZURhdGEoZGltZW5zaW9uLndpZHRoLCB0aWNrQ291bnQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBPbiBtb3VzZW1vdmUuXG4gICAgICogQHBhcmFtIHtNb3VzZUV2ZW50fSBlIG1vdXNlIGV2ZW50IG9iamVjdFxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIG9uTW91c2Vtb3ZlOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciBlbFRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudCxcbiAgICAgICAgICAgIGJvdW5kID0gZWxUYXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICAgICAgICBsYXllclggPSBlLmNsaWVudFggLSBib3VuZC5sZWZ0LFxuICAgICAgICAgICAgbGF5ZXJZID0gZS5jbGllbnRZIC0gYm91bmQudG9wLFxuICAgICAgICAgICAgaW5kZXggPSB0aGlzLmZpbmRJbmRleChsYXllclgpO1xuICAgICAgICB0aGlzLmZpcmUoJ292ZXJUaWNrU2VjdG9yJywgaW5kZXgsIGxheWVyWSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE9uIG1vdXNlb3V0LlxuICAgICAqIEBwYXJhbSB7TW91c2VFdmVudH0gZSBtb3VzZSBldmVudCBvYmplY3RcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICBvbk1vdXNlb3V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5maXJlKCdvdXRUaWNrU2VjdG9yJyk7XG4gICAgfVxufSk7XG5cbnR1aS51dGlsLkN1c3RvbUV2ZW50cy5taXhpbihMaW5lVHlwZUV2ZW50SGFuZGxlTGF5ZXIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IExpbmVUeXBlRXZlbnRIYW5kbGVMYXllcjtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyAgQ2hhcnQgZmFjdG9yeSBwbGF5IHJvbGUgcmVnaXN0ZXIgY2hhcnQuXG4gKiAgICAgICAgICAgICAgICBBbHNvLCB5b3UgY2FuIGdldCBjaGFydCBmcm9tIHRoaXMgZmFjdG9yeS5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGNoYXJ0cyA9IHt9LFxuICAgIGZhY3RvcnkgPSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgY2hhcnQgaW5zdGFuY2UuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjaGFydFR5cGUgY2hhcnQgdHlwZVxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gZGF0YSBjaGFydCBkYXRhXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBjaGFydCBvcHRpb25zXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgICAgICogQHJldHVybnMge29iamVjdH0gY2hhcnQgaW5zdGFuY2U7XG4gICAgICAgICAqL1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKGNoYXJ0VHlwZSwgZGF0YSwgdGhlbWUsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHZhciBDaGFydCA9IGNoYXJ0c1tjaGFydFR5cGVdLFxuICAgICAgICAgICAgICAgIGNoYXJ0O1xuXG4gICAgICAgICAgICBpZiAoIUNoYXJ0KSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgZXhpc3QgJyArIGNoYXJ0VHlwZSArICcgY2hhcnQuJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNoYXJ0ID0gbmV3IENoYXJ0KGRhdGEsIHRoZW1lLCBvcHRpb25zKTtcblxuICAgICAgICAgICAgcmV0dXJuIGNoYXJ0O1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZWdpc3RlciBjaGFydC5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNoYXJ0VHlwZSBjaGFyIHR5cGVcbiAgICAgICAgICogQHBhcmFtIHtjbGFzc30gQ2hhcnRDbGFzcyBjaGFydCBjbGFzc1xuICAgICAgICAgKi9cbiAgICAgICAgcmVnaXN0ZXI6IGZ1bmN0aW9uKGNoYXJ0VHlwZSwgQ2hhcnRDbGFzcykge1xuICAgICAgICAgICAgY2hhcnRzW2NoYXJ0VHlwZV0gPSBDaGFydENsYXNzO1xuICAgICAgICB9XG4gICAgfTtcblxubW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3ICBQbHVnaW4gZmFjdG9yeSBwbGF5IHJvbGUgcmVnaXN0ZXIgcmVuZGVyaW5nIHBsdWdpbi5cbiAqICAgICAgICAgICAgICAgIEFsc28sIHlvdSBjYW4gZ2V0IHBsdWdpbiBmcm9tIHRoaXMgZmFjdG9yeS5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHBsdWdpbnMgPSB7fSxcbiAgICBmYWN0b3J5ID0ge1xuICAgICAgICAvKipcbiAgICAgICAgICogR2V0IGdyYXBoIHJlbmRlcmVyLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gbGliVHlwZSB0eXBlIG9mIGdyYXBoIGxpYnJhcnlcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNoYXJ0VHlwZSBjaGFydCB0eXBlXG4gICAgICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHJlbmRlcmVyIGluc3RhbmNlXG4gICAgICAgICAqL1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKGxpYlR5cGUsIGNoYXJ0VHlwZSkge1xuICAgICAgICAgICAgdmFyIHBsdWdpbiA9IHBsdWdpbnNbbGliVHlwZV0sXG4gICAgICAgICAgICAgICAgUmVuZGVyZXIsIHJlbmRlcmVyO1xuXG4gICAgICAgICAgICBpZiAoIXBsdWdpbikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGV4aXN0ICcgKyBsaWJUeXBlICsgJyBwbHVnaW4uJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIFJlbmRlcmVyID0gcGx1Z2luW2NoYXJ0VHlwZV07XG4gICAgICAgICAgICBpZiAoIVJlbmRlcmVyKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgZXhpc3QgJyArIGNoYXJ0VHlwZSArICcgY2hhcnQgcmVuZGVyZXIuJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlbmRlcmVyID0gbmV3IFJlbmRlcmVyKCk7XG5cbiAgICAgICAgICAgIHJldHVybiByZW5kZXJlcjtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFBsdWdpbiByZWdpc3Rlci5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGxpYlR5cGUgdHlwZSBvZiBncmFwaCBsaWJyYXJ5XG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwbHVnaW4gcGx1Z2luIHRvIGNvbnRyb2wgbGlicmFyeVxuICAgICAgICAgKi9cbiAgICAgICAgcmVnaXN0ZXI6IGZ1bmN0aW9uKGxpYlR5cGUsIHBsdWdpbikge1xuICAgICAgICAgICAgcGx1Z2luc1tsaWJUeXBlXSA9IHBsdWdpbjtcbiAgICAgICAgfVxuICAgIH07XG5cbm1vZHVsZS5leHBvcnRzID0gZmFjdG9yeTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyAgVGhlbWUgZmFjdG9yeSBwbGF5IHJvbGUgcmVnaXN0ZXIgdGhlbWUuXG4gKiAgICAgICAgICAgICAgICBBbHNvLCB5b3UgY2FuIGdldCB0aGVtZSBmcm9tIHRoaXMgZmFjdG9yeS5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuLi9jb25zdCcpLFxuICAgIGRlZmF1bHRUaGVtZSA9IHJlcXVpcmUoJy4uL3RoZW1lcy9kZWZhdWx0VGhlbWUnKTtcblxudmFyIHRoZW1lcyA9IHt9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAvKipcbiAgICAgKiBHZXQgdGhlbWUuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRoZW1lTmFtZSB0aGVtZSBuYW1lXG4gICAgICogQHJldHVybnMge29iamVjdH0gdGhlbWUgb2JqZWN0XG4gICAgICovXG4gICAgZ2V0OiBmdW5jdGlvbih0aGVtZU5hbWUpIHtcbiAgICAgICAgdmFyIHRoZW1lID0gdGhlbWVzW3RoZW1lTmFtZV07XG5cbiAgICAgICAgaWYgKCF0aGVtZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgZXhpc3QgJyArIHRoZW1lTmFtZSArICcgdGhlbWUuJyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhlbWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRoZW1lIHJlZ2lzdGVyLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0aGVtZU5hbWUgdGhlbWUgbmFtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSB0aGVtZVxuICAgICAqL1xuICAgIHJlZ2lzdGVyOiBmdW5jdGlvbih0aGVtZU5hbWUsIHRoZW1lKSB7XG4gICAgICAgIHZhciB0YXJnZXRJdGVtcztcbiAgICAgICAgdGhlbWUgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoZW1lKSk7XG5cbiAgICAgICAgaWYgKHRoZW1lTmFtZSAhPT0gY2hhcnRDb25zdC5ERUZBVUxUX1RIRU1FX05BTUUpIHtcbiAgICAgICAgICAgIHRoZW1lID0gdGhpcy5faW5pdFRoZW1lKHRoZW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRhcmdldEl0ZW1zID0gdGhpcy5fZ2V0SW5oZXJpdFRhcmdldFRoZW1lSXRlbXModGhlbWUpO1xuXG4gICAgICAgIHRoaXMuX2luaGVyaXRUaGVtZUZvbnQodGhlbWUsIHRhcmdldEl0ZW1zKTtcbiAgICAgICAgdGhpcy5fY29weUNvbG9ySW5mbyh0aGVtZSk7XG4gICAgICAgIHRoZW1lc1t0aGVtZU5hbWVdID0gdGhlbWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEluaXQgdGhlbWUuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIHRoZW1lXG4gICAgICogQHJldHVybnMge29iamVjdH0gdGhlbWVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBpZ25vcmVcbiAgICAgKi9cbiAgICBfaW5pdFRoZW1lOiBmdW5jdGlvbih0aGVtZSkge1xuICAgICAgICB2YXIgY2xvbmVUaGVtZSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZGVmYXVsdFRoZW1lKSksXG4gICAgICAgICAgICBuZXdUaGVtZTtcblxuICAgICAgICB0aGlzLl9jb25jYXREZWZhdWx0Q29sb3JzKHRoZW1lLCBjbG9uZVRoZW1lLnNlcmllcy5jb2xvcnMpXG4gICAgICAgIG5ld1RoZW1lID0gdGhpcy5fb3ZlcndyaXRlVGhlbWUodGhlbWUsIGNsb25lVGhlbWUpO1xuXG4gICAgICAgIG5ld1RoZW1lID0gdGhpcy5fY29weVByb3BlcnR5KHtcbiAgICAgICAgICAgIHByb3BOYW1lOiAneUF4aXMnLFxuICAgICAgICAgICAgZnJvbVRoZW1lOiB0aGVtZSxcbiAgICAgICAgICAgIHRvVGhlbWU6IG5ld1RoZW1lLFxuICAgICAgICAgICAgcmVqZWN0aW9uUHJvcHM6IGNoYXJ0Q29uc3QuWUFYSVNfUFJPUFNcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbmV3VGhlbWUgPSB0aGlzLl9jb3B5UHJvcGVydHkoe1xuICAgICAgICAgICAgcHJvcE5hbWU6ICdzZXJpZXMnLFxuICAgICAgICAgICAgZnJvbVRoZW1lOiB0aGVtZSxcbiAgICAgICAgICAgIHRvVGhlbWU6IG5ld1RoZW1lLFxuICAgICAgICAgICAgcmVqZWN0aW9uUHJvcHM6IGNoYXJ0Q29uc3QuU0VSSUVTX1BST1BTXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBuZXdUaGVtZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmlsdGVyIGNoYXJ0IHR5cGVzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0YXJnZXQgdGFyZ2V0IGNoYXJ0c1xuICAgICAqIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IHJlamVjdGlvblByb3BzIHJlamVjdCBwcm9wZXJ0eVxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IGZpbHRlcmVkIGNoYXJ0cy5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9maWx0ZXJDaGFydFR5cGVzOiBmdW5jdGlvbih0YXJnZXQsIHJlamVjdGlvblByb3BzKSB7XG4gICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cblxuICAgICAgICByZXN1bHQgPSB0dWkudXRpbC5maWx0ZXIodGFyZ2V0LCBmdW5jdGlvbihpdGVtLCBuYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gdHVpLnV0aWwuaW5BcnJheShuYW1lLCByZWplY3Rpb25Qcm9wcykgPT09IC0xO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29uY2F0IGNvbG9ycy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgdGhlbWVcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBzZXJpZXNDb2xvcnMgc2VyaWVzIGNvbG9yc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NvbmNhdENvbG9yczogZnVuY3Rpb24odGhlbWUsIHNlcmllc0NvbG9ycykge1xuICAgICAgICBpZiAodGhlbWUuY29sb3JzKSB7XG4gICAgICAgICAgICB0aGVtZS5jb2xvcnMgPSB0aGVtZS5jb2xvcnMuY29uY2F0KHNlcmllc0NvbG9ycyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhlbWUuc2luZ2xlQ29sb3JzKSB7XG4gICAgICAgICAgICB0aGVtZS5zaW5nbGVDb2xvcnMgPSB0aGVtZS5zaW5nbGVDb2xvcnMuY29uY2F0KHNlcmllc0NvbG9ycyk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29uY2F0IGRlZmF1bHQgY29sb3JzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSB0aGVtZVxuICAgICAqIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IHNlcmllc0NvbG9ycyBzZXJpZXMgY29sb3JzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY29uY2F0RGVmYXVsdENvbG9yczogZnVuY3Rpb24odGhlbWUsIHNlcmllc0NvbG9ycykge1xuICAgICAgICB2YXIgY2hhcnRUeXBlcztcblxuICAgICAgICBpZiAoIXRoZW1lLnNlcmllcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY2hhcnRUeXBlcyA9IHRoaXMuX2ZpbHRlckNoYXJ0VHlwZXModGhlbWUuc2VyaWVzLCBjaGFydENvbnN0LlNFUklFU19QUk9QUyk7XG5cbiAgICAgICAgaWYgKCF0dWkudXRpbC5rZXlzKGNoYXJ0VHlwZXMpLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5fY29uY2F0Q29sb3JzKHRoZW1lLnNlcmllcywgc2VyaWVzQ29sb3JzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHR1aS51dGlsLmZvckVhY2goY2hhcnRUeXBlcywgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NvbmNhdENvbG9ycyhpdGVtLCBzZXJpZXNDb2xvcnMpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogT3ZlcndyaXRlIHRoZW1lXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGZyb20gZnJvbSB0aGVtZSBwcm9wZXJ0eVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0byB0byB0aGVtZSBwcm9wZXJ0eVxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHJlc3VsdCBwcm9wZXJ0eVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX292ZXJ3cml0ZVRoZW1lOiBmdW5jdGlvbihmcm9tLCB0bykge1xuICAgICAgICB0dWkudXRpbC5mb3JFYWNoKHRvLCBmdW5jdGlvbihpdGVtLCBrZXkpIHtcbiAgICAgICAgICAgIHZhciBmcm9tSXRlbSA9IGZyb21ba2V5XTtcbiAgICAgICAgICAgIGlmICghZnJvbUl0ZW0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0dWkudXRpbC5pc0FycmF5KGZyb21JdGVtKSkge1xuICAgICAgICAgICAgICAgIHRvW2tleV0gPSBmcm9tSXRlbS5zbGljZSgpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0dWkudXRpbC5pc09iamVjdChmcm9tSXRlbSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9vdmVyd3JpdGVUaGVtZShmcm9tSXRlbSwgaXRlbSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRvW2tleV0gPSBmcm9tSXRlbTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgcmV0dXJuIHRvO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDb3B5IHByb3BlcnR5LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5wcm9wTmFtZSBwcm9wZXJ0eSBuYW1lXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmZyb21UaGVtZSBmcm9tIHByb3BlcnR5XG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRvVGhlbWUgdHAgcHJvcGVydHlcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IHBhcmFtcy5yZWplY3Rpb25Qcm9wcyByZWplY3QgcHJvcGVydHkgbmFtZVxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IGNvcGllZCBwcm9wZXJ0eVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NvcHlQcm9wZXJ0eTogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBjaGFydFR5cGVzO1xuXG4gICAgICAgIGlmICghcGFyYW1zLnRvVGhlbWVbcGFyYW1zLnByb3BOYW1lXSkge1xuICAgICAgICAgICAgcmV0dXJuIHBhcmFtcy50b1RoZW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgY2hhcnRUeXBlcyA9IHRoaXMuX2ZpbHRlckNoYXJ0VHlwZXMocGFyYW1zLmZyb21UaGVtZVtwYXJhbXMucHJvcE5hbWVdLCBwYXJhbXMucmVqZWN0aW9uUHJvcHMpO1xuICAgICAgICBpZiAodHVpLnV0aWwua2V5cyhjaGFydFR5cGVzKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHR1aS51dGlsLmZvckVhY2goY2hhcnRUeXBlcywgZnVuY3Rpb24oaXRlbSwga2V5KSB7XG4gICAgICAgICAgICAgICAgdmFyIGNsb25lVGhlbWUgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGRlZmF1bHRUaGVtZVtwYXJhbXMucHJvcE5hbWVdKSk7XG4gICAgICAgICAgICAgICAgcGFyYW1zLmZyb21UaGVtZVtwYXJhbXMucHJvcE5hbWVdW2tleV0gPSB0aGlzLl9vdmVyd3JpdGVUaGVtZShpdGVtLCBjbG9uZVRoZW1lKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgICAgICBwYXJhbXMudG9UaGVtZVtwYXJhbXMucHJvcE5hbWVdID0gcGFyYW1zLmZyb21UaGVtZVtwYXJhbXMucHJvcE5hbWVdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhcmFtcy50b1RoZW1lO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDb3B5IGNvbG9yIGluZm8gdG8gbGVnZW5kXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHNlcmllc1RoZW1lIHNlcmllcyB0aGVtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBsZWdlbmRUaGVtZSBsZWdlbmQgdGhlbWVcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBjb2xvcnMgY29sb3JzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY29weUNvbG9ySW5mb1RvT3RoZXI6IGZ1bmN0aW9uKHNlcmllc1RoZW1lLCBsZWdlbmRUaGVtZSwgY29sb3JzKSB7XG4gICAgICAgIGxlZ2VuZFRoZW1lLmNvbG9ycyA9IGNvbG9ycyB8fCBzZXJpZXNUaGVtZS5jb2xvcnM7XG4gICAgICAgIGlmIChzZXJpZXNUaGVtZS5zaW5nbGVDb2xvcnMpIHtcbiAgICAgICAgICAgIGxlZ2VuZFRoZW1lLnNpbmdsZUNvbG9ycyA9IHNlcmllc1RoZW1lLnNpbmdsZUNvbG9ycztcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2VyaWVzVGhlbWUuYm9yZGVyQ29sb3IpIHtcbiAgICAgICAgICAgIGxlZ2VuZFRoZW1lLmJvcmRlckNvbG9yID0gc2VyaWVzVGhlbWUuYm9yZGVyQ29sb3I7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHRhcmdldCBpdGVtcyBhYm91dCBmb250IGluaGVyaXQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIHRoZW1lXG4gICAgICogQHJldHVybnMge2FycmF5LjxvYmplY3Q+fSB0YXJnZXQgaXRlbXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRJbmhlcml0VGFyZ2V0VGhlbWVJdGVtczogZnVuY3Rpb24odGhlbWUpIHtcbiAgICAgICAgdmFyIGl0ZW1zID0gW1xuICAgICAgICAgICAgICAgIHRoZW1lLnRpdGxlLFxuICAgICAgICAgICAgICAgIHRoZW1lLnhBeGlzLnRpdGxlLFxuICAgICAgICAgICAgICAgIHRoZW1lLnhBeGlzLmxhYmVsLFxuICAgICAgICAgICAgICAgIHRoZW1lLmxlZ2VuZC5sYWJlbFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIHlBeGlzQ2hhcnRUeXBlVGhlbXMgPSB0aGlzLl9maWx0ZXJDaGFydFR5cGVzKHRoZW1lLnlBeGlzLCBjaGFydENvbnN0LllBWElTX1BST1BTKSxcbiAgICAgICAgICAgIHNlcmllc0NoYXJ0VHlwZVRoZW1lcyA9IHRoaXMuX2ZpbHRlckNoYXJ0VHlwZXModGhlbWUuc2VyaWVzLCBjaGFydENvbnN0LlNFUklFU19QUk9QUyk7XG5cbiAgICAgICAgaWYgKCF0dWkudXRpbC5rZXlzKHlBeGlzQ2hhcnRUeXBlVGhlbXMpLmxlbmd0aCkge1xuICAgICAgICAgICAgaXRlbXMucHVzaCh0aGVtZS55QXhpcy50aXRsZSk7XG4gICAgICAgICAgICBpdGVtcy5wdXNoKHRoZW1lLnlBeGlzLmxhYmVsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHR1aS51dGlsLmZvckVhY2goeUF4aXNDaGFydFR5cGVUaGVtcywgZnVuY3Rpb24oY2hhdFR5cGVUaGVtZSkge1xuICAgICAgICAgICAgICAgIGl0ZW1zLnB1c2goY2hhdFR5cGVUaGVtZS50aXRsZSk7XG4gICAgICAgICAgICAgICAgaXRlbXMucHVzaChjaGF0VHlwZVRoZW1lLmxhYmVsKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0dWkudXRpbC5rZXlzKHNlcmllc0NoYXJ0VHlwZVRoZW1lcykubGVuZ3RoKSB7XG4gICAgICAgICAgICBpdGVtcy5wdXNoKHRoZW1lLnNlcmllcy5sYWJlbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0dWkudXRpbC5mb3JFYWNoKHNlcmllc0NoYXJ0VHlwZVRoZW1lcywgZnVuY3Rpb24oY2hhdFR5cGVUaGVtZSkge1xuICAgICAgICAgICAgICAgIGl0ZW1zLnB1c2goY2hhdFR5cGVUaGVtZS5sYWJlbCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaXRlbXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEluaGVyaXQgdGhlbWUgZm9udC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgdGhlbWVcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxvYmplY3Q+fSB0YXJnZXRJdGVtcyB0YXJnZXQgdGhlbWUgaXRlbXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pbmhlcml0VGhlbWVGb250OiBmdW5jdGlvbih0aGVtZSwgdGFyZ2V0SXRlbXMpIHtcbiAgICAgICAgdmFyIGJhc2VGb250ID0gdGhlbWUuY2hhcnQuZm9udEZhbWlseTtcblxuICAgICAgICB0dWkudXRpbC5mb3JFYWNoQXJyYXkodGFyZ2V0SXRlbXMsIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgIGlmICghaXRlbS5mb250RmFtaWx5KSB7XG4gICAgICAgICAgICAgICAgaXRlbS5mb250RmFtaWx5ID0gYmFzZUZvbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDb3B5IGNvbG9yIGluZm8uXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIHRoZW1lXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAaWdub3JlXG4gICAgICovXG4gICAgX2NvcHlDb2xvckluZm86IGZ1bmN0aW9uKHRoZW1lKSB7XG4gICAgICAgIHZhciBzZXJpZXNDaGFydFR5cGVzID0gdGhpcy5fZmlsdGVyQ2hhcnRUeXBlcyh0aGVtZS5zZXJpZXMsIGNoYXJ0Q29uc3QuU0VSSUVTX1BST1BTKTtcbiAgICAgICAgaWYgKCF0dWkudXRpbC5rZXlzKHNlcmllc0NoYXJ0VHlwZXMpLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5fY29weUNvbG9ySW5mb1RvT3RoZXIodGhlbWUuc2VyaWVzLCB0aGVtZS5sZWdlbmQpO1xuICAgICAgICAgICAgdGhpcy5fY29weUNvbG9ySW5mb1RvT3RoZXIodGhlbWUuc2VyaWVzLCB0aGVtZS50b29sdGlwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHR1aS51dGlsLmZvckVhY2goc2VyaWVzQ2hhcnRUeXBlcywgZnVuY3Rpb24oaXRlbSwgY2hhcnRUeXBlKSB7XG4gICAgICAgICAgICAgICAgdGhlbWUubGVnZW5kW2NoYXJ0VHlwZV0gPSB7fTtcbiAgICAgICAgICAgICAgICB0aGVtZS50b29sdGlwW2NoYXJ0VHlwZV0gPSB7fTtcbiAgICAgICAgICAgICAgICB0aGlzLl9jb3B5Q29sb3JJbmZvVG9PdGhlcihpdGVtLCB0aGVtZS5sZWdlbmRbY2hhcnRUeXBlXSwgaXRlbS5jb2xvcnMgfHwgdGhlbWUubGVnZW5kLmNvbG9ycyk7XG4gICAgICAgICAgICAgICAgdGhpcy5fY29weUNvbG9ySW5mb1RvT3RoZXIoaXRlbSwgdGhlbWUudG9vbHRpcFtjaGFydFR5cGVdLCBpdGVtLmNvbG9ycyB8fCB0aGVtZS50b29sdGlwLmNvbG9ycyk7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoZW1lLmxlZ2VuZC5jb2xvcnM7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoZW1lLnRvb2x0aXAuY29sb3JzO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEF4aXMgRGF0YSBNYWtlclxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4uL2NvbnN0JyksXG4gICAgY2FsY3VsYXRvciA9IHJlcXVpcmUoJy4vY2FsY3VsYXRvcicpLFxuICAgIHN0YXRlID0gcmVxdWlyZSgnLi9zdGF0ZScpO1xuXG52YXIgYWJzID0gTWF0aC5hYnMsXG4gICAgY29uY2F0ID0gQXJyYXkucHJvdG90eXBlLmNvbmNhdDtcblxuLyoqXG4gKiBBeGlzIGRhdGEgbWFrZXIuXG4gKiBAbW9kdWxlIGF4aXNEYXRhTWFrZXJcbiAqL1xudmFyIGF4aXNEYXRhTWFrZXIgPSB7XG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBsYWJlbHMuXG4gICAgICogQHBhcmFtIHthcnJheS48c3RyaW5nPn0gbGFiZWxzIGxhYmVsc1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBsYWJlbEludGVydmFsIGxhYmVsIGludGVydmFsXG4gICAgICogQHJldHVybnMge2FycmF5LjxzdHJpbmc+fSBsYWJlbHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlTGFiZWxzOiBmdW5jdGlvbihsYWJlbHMsIGxhYmVsSW50ZXJ2YWwpIHtcbiAgICAgICAgdmFyIGxhc3RJbmRleDtcbiAgICAgICAgaWYgKCFsYWJlbEludGVydmFsKSB7XG4gICAgICAgICAgICByZXR1cm4gbGFiZWxzO1xuICAgICAgICB9XG5cbiAgICAgICAgbGFzdEluZGV4ID0gbGFiZWxzLmxlbmd0aCAtIDE7XG4gICAgICAgIHJldHVybiB0dWkudXRpbC5tYXAobGFiZWxzLCBmdW5jdGlvbihsYWJlbCwgaW5kZXgpIHtcbiAgICAgICAgICAgIGlmIChpbmRleCA+IDAgJiYgaW5kZXggPCBsYXN0SW5kZXggJiYgKGluZGV4ICUgbGFiZWxJbnRlcnZhbCkgPiAwKSB7XG4gICAgICAgICAgICAgICAgbGFiZWwgPSBjaGFydENvbnN0LkVNUFRZX0FYSVNfTEFCRUw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbGFiZWw7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGRhdGEgYWJvdXQgbGFiZWwgYXhpcy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGxhYmVscyBjaGFydCBsYWJlbHNcbiAgICAgKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gaXNWZXJ0aWNhbCB3aGV0aGVyIHZlcnRpY2FsIG9yIG5vdFxuICAgICAqIEByZXR1cm5zIHt7XG4gICAgICogICAgICBsYWJlbHM6IGFycmF5LjxzdHJpbmc+LFxuICAgICAqICAgICAgdGlja0NvdW50OiBudW1iZXIsXG4gICAgICogICAgICB2YWxpZFRpY2tDb3VudDogbnVtYmVyLFxuICAgICAqICAgICAgaXNMYWJlbEF4aXM6IGJvb2xlYW4sXG4gICAgICogICAgICBpc1ZlcnRpY2FsOiBib29sZWFuXG4gICAgICogfX0gYXhpcyBkYXRhXG4gICAgICovXG4gICAgbWFrZUxhYmVsQXhpc0RhdGE6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgdGlja0NvdW50ID0gcGFyYW1zLmxhYmVscy5sZW5ndGgsXG4gICAgICAgICAgICBvcHRpb25zID0gcGFyYW1zLm9wdGlvbnMgfHwge307XG4gICAgICAgIGlmICghcGFyYW1zLmFsaWduZWQpIHtcbiAgICAgICAgICAgIHRpY2tDb3VudCArPSAxO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxhYmVsczogdGhpcy5fbWFrZUxhYmVscyhwYXJhbXMubGFiZWxzLCBvcHRpb25zLmxhYmVsSW50ZXJ2YWwpLFxuICAgICAgICAgICAgdGlja0NvdW50OiB0aWNrQ291bnQsXG4gICAgICAgICAgICB2YWxpZFRpY2tDb3VudDogMCxcbiAgICAgICAgICAgIGlzTGFiZWxBeGlzOiB0cnVlLFxuICAgICAgICAgICAgaXNWZXJ0aWNhbDogISFwYXJhbXMuaXNWZXJ0aWNhbCxcbiAgICAgICAgICAgIGFsaWduZWQ6ICEhcGFyYW1zLmFsaWduZWRcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBkYXRhIGFib3V0IHZhbHVlIGF4aXMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheS48bnVtYmVyPj59IHBhcmFtcy52YWx1ZXMgY2hhcnQgdmFsdWVzXG4gICAgICogICAgICBAcGFyYW0ge3t3aWR0aDpudW1iZXIsIGhlaWdodDpudW1iZXJ9fSBwYXJhbXMuc2VyaWVzRGltZW5zaW9uIHNlcmllcyBkaW1lbnNpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPGZ1bmN0aW9uPn0gcGFyYW1zLmZvcm1hdEZ1bmN0aW9ucyBmb3JtYXQgZnVuY3Rpb25zXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLnN0YWNrZWQgc3RhY2tlZCBvcHRpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMub3B0aW9ucyBheGlzIG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7e1xuICAgICAqICAgICAgbGFiZWxzOiBhcnJheS48c3RyaW5nPixcbiAgICAgKiAgICAgIHRpY2tDb3VudDogbnVtYmVyLFxuICAgICAqICAgICAgdmFsaWRUaWNrQ291bnQ6IG51bWJlcixcbiAgICAgKiAgICAgIGlzTGFiZWxBeGlzOiBib29sZWFuLFxuICAgICAqICAgICAgc2NhbGU6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9LFxuICAgICAqICAgICAgaXNWZXJ0aWNhbDogYm9vbGVhblxuICAgICAqIH19IGF4aXMgZGF0YVxuICAgICAqL1xuICAgIG1ha2VWYWx1ZUF4aXNEYXRhOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSBwYXJhbXMub3B0aW9ucyB8fCB7fSxcbiAgICAgICAgICAgIGlzVmVydGljYWwgPSAhIXBhcmFtcy5pc1ZlcnRpY2FsLFxuICAgICAgICAgICAgaXNQb3NpdGlvblJpZ2h0ID0gISFwYXJhbXMuaXNQb3NpdGlvblJpZ2h0LFxuICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zID0gcGFyYW1zLmZvcm1hdEZ1bmN0aW9ucyxcbiAgICAgICAgICAgIHRpY2tJbmZvO1xuICAgICAgICBpZiAocGFyYW1zLnN0YWNrZWQgPT09ICdwZXJjZW50Jykge1xuICAgICAgICAgICAgdGlja0luZm8gPSBjaGFydENvbnN0LlBFUkNFTlRfU1RBQ0tFRF9USUNLX0lORk87XG4gICAgICAgICAgICBmb3JtYXRGdW5jdGlvbnMgPSBbXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRpY2tJbmZvID0gdGhpcy5fZ2V0VGlja0luZm8oe1xuICAgICAgICAgICAgICAgIHZhbHVlczogdGhpcy5fbWFrZUJhc2VWYWx1ZXMocGFyYW1zLnZhbHVlcywgcGFyYW1zLnN0YWNrZWQpLFxuICAgICAgICAgICAgICAgIHNlcmllc0RpbWVuc2lvbjogcGFyYW1zLnNlcmllc0RpbWVuc2lvbixcbiAgICAgICAgICAgICAgICBpc1ZlcnRpY2FsOiBpc1ZlcnRpY2FsLFxuICAgICAgICAgICAgICAgIGlzUG9zaXRpb25SaWdodDogaXNQb3NpdGlvblJpZ2h0LFxuICAgICAgICAgICAgICAgIGNoYXJ0VHlwZTogcGFyYW1zLmNoYXJ0VHlwZVxuICAgICAgICAgICAgfSwgb3B0aW9ucyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbGFiZWxzOiB0aGlzLmZvcm1hdExhYmVscyh0aWNrSW5mby5sYWJlbHMsIGZvcm1hdEZ1bmN0aW9ucyksXG4gICAgICAgICAgICB0aWNrQ291bnQ6IHRpY2tJbmZvLnRpY2tDb3VudCxcbiAgICAgICAgICAgIHZhbGlkVGlja0NvdW50OiB0aWNrSW5mby50aWNrQ291bnQsXG4gICAgICAgICAgICBzY2FsZTogdGlja0luZm8uc2NhbGUsXG4gICAgICAgICAgICBzdGVwOiB0aWNrSW5mby5zdGVwLFxuICAgICAgICAgICAgaXNWZXJ0aWNhbDogaXNWZXJ0aWNhbCxcbiAgICAgICAgICAgIGlzUG9zaXRpb25SaWdodDogaXNQb3NpdGlvblJpZ2h0XG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYmFzZSB2YWx1ZXMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHthcnJheS48bnVtYmVyPn0gZ3JvdXBWYWx1ZXMgZ3JvdXAgdmFsdWVzXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHN0YWNrZWQgc3RhY2tlZCBvcHRpb24uXG4gICAgICogQHJldHVybnMge2FycmF5LjxudW1iZXI+fSBiYXNlIHZhbHVlc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VCYXNlVmFsdWVzOiBmdW5jdGlvbihncm91cFZhbHVlcywgc3RhY2tlZCkge1xuICAgICAgICB2YXIgYmFzZVZhbHVlcyA9IGNvbmNhdC5hcHBseShbXSwgZ3JvdXBWYWx1ZXMpOyAvLyBmbGF0dGVuIGFycmF5XG4gICAgICAgIGlmIChzdGFja2VkID09PSBjaGFydENvbnN0LlNUQUNLRURfTk9STUFMX1RZUEUpIHtcbiAgICAgICAgICAgIGJhc2VWYWx1ZXMgPSBiYXNlVmFsdWVzLmNvbmNhdCh0dWkudXRpbC5tYXAoZ3JvdXBWYWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICAgICAgICAgIHZhciBwbHVzVmFsdWVzID0gdHVpLnV0aWwuZmlsdGVyKHZhbHVlcywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlID4gMDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHVpLnV0aWwuc3VtKHBsdXNWYWx1ZXMpO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBiYXNlVmFsdWVzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgYmFzZSBzaXplIGZvciBnZXQgY2FuZGlkYXRlIHRpY2sgY291bnRzLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gZGltZW5zaW9uIGNoYXQgZGltZW5zaW9uXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpc1ZlcnRpY2FsIHdoZXRoZXIgdmVydGljYWwgb3Igbm90XG4gICAgICogQHJldHVybnMge251bWJlcn0gYmFzZSBzaXplXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0QmFzZVNpemU6IGZ1bmN0aW9uKGRpbWVuc2lvbiwgaXNWZXJ0aWNhbCkge1xuICAgICAgICB2YXIgYmFzZVNpemU7XG4gICAgICAgIGlmIChpc1ZlcnRpY2FsKSB7XG4gICAgICAgICAgICBiYXNlU2l6ZSA9IGRpbWVuc2lvbi5oZWlnaHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBiYXNlU2l6ZSA9IGRpbWVuc2lvbi53aWR0aDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYmFzZVNpemU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjYW5kaWRhdGUgdGljayBjb3VudHMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBjaGFydERpbWVuc2lvbiBjaGF0IGRpbWVuc2lvblxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNWZXJ0aWNhbCB3aGV0aGVyIHZlcnRpY2FsIG9yIG5vdFxuICAgICAqIEByZXR1cm5zIHthcnJheS48bnVtYmVyPn0gdGljayBjb3VudHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRDYW5kaWRhdGVUaWNrQ291bnRzOiBmdW5jdGlvbihjaGFydERpbWVuc2lvbiwgaXNWZXJ0aWNhbCkge1xuICAgICAgICB2YXIgYmFzZVNpemUgPSB0aGlzLl9nZXRCYXNlU2l6ZShjaGFydERpbWVuc2lvbiwgaXNWZXJ0aWNhbCksXG4gICAgICAgICAgICBzdGFydCA9IHBhcnNlSW50KGJhc2VTaXplIC8gY2hhcnRDb25zdC5NQVhfUElYRUxfVFlQRV9TVEVQX1NJWkUsIDEwKSxcbiAgICAgICAgICAgIGVuZCA9IHBhcnNlSW50KGJhc2VTaXplIC8gY2hhcnRDb25zdC5NSU5fUElYRUxfVFlQRV9TVEVQX1NJWkUsIDEwKSArIDEsXG4gICAgICAgICAgICB0aWNrQ291bnRzID0gdHVpLnV0aWwucmFuZ2Uoc3RhcnQsIGVuZCk7XG4gICAgICAgIHJldHVybiB0aWNrQ291bnRzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgY29tcGFyaW5nIHZhbHVlLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtaW4gbWluaW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWF4IG1heGltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogQHBhcmFtIHt7c2NhbGU6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9LCBzdGVwOiBudW1iZXJ9fSB0aWNrSW5mbyB0aWNrIGluZm9cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBjb21wYXJpbmcgdmFsdWVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRDb21wYXJpbmdWYWx1ZTogZnVuY3Rpb24obWluLCBtYXgsIHRpY2tJbmZvKSB7XG4gICAgICAgIHZhciBkaWZmTWF4ID0gYWJzKHRpY2tJbmZvLnNjYWxlLm1heCAtIG1heCksXG4gICAgICAgICAgICBkaWZmTWluID0gYWJzKG1pbiAtIHRpY2tJbmZvLnNjYWxlLm1pbiksXG4gICAgICAgICAgICB3ZWlnaHQgPSBNYXRoLnBvdygxMCwgdHVpLnV0aWwubGVuZ3RoQWZ0ZXJQb2ludCh0aWNrSW5mby5zdGVwKSk7XG4gICAgICAgIHJldHVybiAoZGlmZk1heCArIGRpZmZNaW4pICogd2VpZ2h0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZWxlY3QgdGljayBpbmZvLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtaW4gbWluaW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWF4IG1heGltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogQHBhcmFtIHthcnJheS48b2JqZWN0Pn0gY2FuZGlkYXRlcyB0aWNrIGluZm8gY2FuZGlkYXRlc1xuICAgICAqIEByZXR1cm5zIHt7c2NhbGU6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9LCB0aWNrQ291bnQ6IG51bWJlciwgc3RlcDogbnVtYmVyLCBsYWJlbHM6IGFycmF5LjxudW1iZXI+fX0gc2VsZWN0ZWQgdGljayBpbmZvXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2VsZWN0VGlja0luZm86IGZ1bmN0aW9uKG1pbiwgbWF4LCBjYW5kaWRhdGVzKSB7XG4gICAgICAgIHZhciBnZXRDb21wYXJpbmdWYWx1ZSA9IHR1aS51dGlsLmJpbmQodGhpcy5fZ2V0Q29tcGFyaW5nVmFsdWUsIHRoaXMsIG1pbiwgbWF4KSxcbiAgICAgICAgICAgIHRpY2tJbmZvID0gdHVpLnV0aWwubWluKGNhbmRpZGF0ZXMsIGdldENvbXBhcmluZ1ZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHRpY2tJbmZvO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGljayBjb3VudCBhbmQgc2NhbGUuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnZhbHVlcyBiYXNlIHZhbHVlc1xuICAgICAqICAgICAgQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBwYXJhbXMuc2VyaWVzRGltZW5zaW9uIGNoYXQgZGltZW5zaW9uXG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5pc1ZlcnRpY2FsIHdoZXRoZXIgdmVydGljYWwgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLmNoYXJ0VHlwZSBjaGF0IHR5cGVcbiAgICAgKiBAcGFyYW0ge3ttaW46IG51bWJlciwgbWF4Om51bWJlcn19IG9wdGlvbnMgYXhpcyBvcHRpb25zXG4gICAgICogQHJldHVybnMge3t0aWNrQ291bnQ6IG51bWJlciwgc2NhbGU6IG9iamVjdH19IHRpY2sgaW5mb1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFRpY2tJbmZvOiBmdW5jdGlvbihwYXJhbXMsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIG1pbiA9IHR1aS51dGlsLm1pbihwYXJhbXMudmFsdWVzKSxcbiAgICAgICAgICAgIG1heCA9IHR1aS51dGlsLm1heChwYXJhbXMudmFsdWVzKSxcbiAgICAgICAgICAgIGludFR5cGVJbmZvLCB0aWNrQ291bnRzLCBjYW5kaWRhdGVzLCB0aWNrSW5mbztcbiAgICAgICAgLy8gMDEuIG1pbiwgbWF4LCBvcHRpb25zIOygleuztOulvCDsoJXsiJjtmJXsnLzroZwg67OA6rK9XG4gICAgICAgIGludFR5cGVJbmZvID0gdGhpcy5fbWFrZUludGVnZXJUeXBlSW5mbyhtaW4sIG1heCwgb3B0aW9ucyk7XG5cbiAgICAgICAgLy8gMDIuIHRpY2sgY291bnQg7ZuE67O06rWwIOyWu+q4sFxuICAgICAgICB0aWNrQ291bnRzID0gcGFyYW1zLnRpY2tDb3VudCA/IFtwYXJhbXMudGlja0NvdW50XSA6IHRoaXMuX2dldENhbmRpZGF0ZVRpY2tDb3VudHMocGFyYW1zLnNlcmllc0RpbWVuc2lvbiwgcGFyYW1zLmlzVmVydGljYWwpO1xuXG4gICAgICAgIC8vIDAzLiB0aWNrIGluZm8g7ZuE67O06rWwIOqzhOyCsFxuICAgICAgICBjYW5kaWRhdGVzID0gdGhpcy5fZ2V0Q2FuZGlkYXRlVGlja0luZm9zKHtcbiAgICAgICAgICAgIG1pbjogaW50VHlwZUluZm8ubWluLFxuICAgICAgICAgICAgbWF4OiBpbnRUeXBlSW5mby5tYXgsXG4gICAgICAgICAgICB0aWNrQ291bnRzOiB0aWNrQ291bnRzLFxuICAgICAgICAgICAgY2hhcnRUeXBlOiBwYXJhbXMuY2hhcnRUeXBlXG4gICAgICAgIH0sIGludFR5cGVJbmZvLm9wdGlvbnMpO1xuXG4gICAgICAgIC8vIDA0LiB0aWNrIGluZm8g7ZuE67O06rWwIOykkSDtlZjrgpgg7ISg7YOdXG4gICAgICAgIHRpY2tJbmZvID0gdGhpcy5fc2VsZWN0VGlja0luZm8oaW50VHlwZUluZm8ubWluLCBpbnRUeXBlSW5mby5tYXgsIGNhbmRpZGF0ZXMpO1xuXG4gICAgICAgIC8vIDA1LiDsoJXsiJjtmJXsnLzroZwg67OA6rK97ZaI642YIHRpY2sgaW5mb+ulvCDsm5Drnpgg7ZiV7YOc66GcIOuzgOqyvVxuICAgICAgICB0aWNrSW5mbyA9IHRoaXMuX3JldmVydE9yaWdpbmFsVHlwZVRpY2tJbmZvKHRpY2tJbmZvLCBpbnRUeXBlSW5mby5kaXZpZGVOdW0pO1xuICAgICAgICByZXR1cm4gdGlja0luZm87XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgaW50ZWdlciB0eXBlIGluZm9cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWluIG1pbmltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1heCBtYXhpbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7e21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19IG9wdGlvbnMgYXhpcyBvcHRpb25zXG4gICAgICogQHJldHVybnMge3ttaW46IG51bWJlciwgbWF4OiBudW1iZXIsIG9wdGlvbnM6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9LCBkaXZpZGVOdW06IG51bWJlcn19IGludGVnZXIgdHlwZSBpbmZvXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUludGVnZXJUeXBlSW5mbzogZnVuY3Rpb24obWluLCBtYXgsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIG11bHRpcGxlTnVtLCBjaGFuZ2VkT3B0aW9ucztcblxuICAgICAgICBpZiAoYWJzKG1pbikgPj0gMSB8fCBhYnMobWF4KSA+PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG1pbjogbWluLFxuICAgICAgICAgICAgICAgIG1heDogbWF4LFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IG9wdGlvbnMsXG4gICAgICAgICAgICAgICAgZGl2aWRlTnVtOiAxXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgbXVsdGlwbGVOdW0gPSB0dWkudXRpbC5maW5kTXVsdGlwbGVOdW0obWluLCBtYXgpO1xuICAgICAgICBjaGFuZ2VkT3B0aW9ucyA9IHt9O1xuXG4gICAgICAgIGlmIChvcHRpb25zLm1pbikge1xuICAgICAgICAgICAgY2hhbmdlZE9wdGlvbnMubWluID0gb3B0aW9ucy5taW4gKiBtdWx0aXBsZU51bTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvcHRpb25zLm1heCkge1xuICAgICAgICAgICAgY2hhbmdlZE9wdGlvbnMubWF4ID0gb3B0aW9ucy5tYXggKiBtdWx0aXBsZU51bTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBtaW46IG1pbiAqIG11bHRpcGxlTnVtLFxuICAgICAgICAgICAgbWF4OiBtYXggKiBtdWx0aXBsZU51bSxcbiAgICAgICAgICAgIG9wdGlvbnM6IGNoYW5nZWRPcHRpb25zLFxuICAgICAgICAgICAgZGl2aWRlTnVtOiBtdWx0aXBsZU51bVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXZlcnQgdGljayBpbmZvIHRvIG9yaWdpbmFsIHR5cGUuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHt7c3RlcDogbnVtYmVyLCBzY2FsZToge21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn0sIGxhYmVsczogYXJyYXkuPG51bWJlcj59fSB0aWNrSW5mbyB0aWNrIGluZm9cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZGl2aWRlTnVtIGRpdmlkZSBudW1cbiAgICAgKiBAcmV0dXJucyB7e3N0ZXA6IG51bWJlciwgc2NhbGU6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9LCBsYWJlbHM6IGFycmF5LjxudW1iZXI+fX0gZGl2aWRlZCB0aWNrIGluZm9cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZXZlcnRPcmlnaW5hbFR5cGVUaWNrSW5mbzogZnVuY3Rpb24odGlja0luZm8sIGRpdmlkZU51bSkge1xuICAgICAgICBpZiAoZGl2aWRlTnVtID09PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gdGlja0luZm87XG4gICAgICAgIH1cblxuICAgICAgICB0aWNrSW5mby5zdGVwID0gdHVpLnV0aWwuZGl2aXNpb24odGlja0luZm8uc3RlcCwgZGl2aWRlTnVtKTtcbiAgICAgICAgdGlja0luZm8uc2NhbGUubWluID0gdHVpLnV0aWwuZGl2aXNpb24odGlja0luZm8uc2NhbGUubWluLCBkaXZpZGVOdW0pO1xuICAgICAgICB0aWNrSW5mby5zY2FsZS5tYXggPSB0dWkudXRpbC5kaXZpc2lvbih0aWNrSW5mby5zY2FsZS5tYXgsIGRpdmlkZU51bSk7XG4gICAgICAgIHRpY2tJbmZvLmxhYmVscyA9IHR1aS51dGlsLm1hcCh0aWNrSW5mby5sYWJlbHMsIGZ1bmN0aW9uKGxhYmVsKSB7XG4gICAgICAgICAgICByZXR1cm4gdHVpLnV0aWwuZGl2aXNpb24obGFiZWwsIGRpdmlkZU51bSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB0aWNrSW5mbztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTm9ybWFsaXplIHN0ZXAuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHN0ZXAgb3JpZ2luYWwgc3RlcFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IG5vcm1hbGl6ZWQgc3RlcFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX25vcm1hbGl6ZVN0ZXA6IGZ1bmN0aW9uKHN0ZXApIHtcbiAgICAgICAgcmV0dXJuIGNhbGN1bGF0b3Iubm9ybWFsaXplQXhpc051bWJlcihzdGVwKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWluaW1pemUgdGljayBzY2FsZS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMudXNlck1pbiB1c2VyIG1pblxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy51c2VyTWF4IHVzZXIgbWF4XG4gICAgICogICAgICBAcGFyYW0ge3t0aWNrQ291bnQ6IG51bWJlciwgc2NhbGU6IG9iamVjdH19IHBhcmFtcy50aWNrSW5mbyB0aWNrIGluZm9cbiAgICAgKiAgICAgIEBwYXJhbSB7e21pbjogbnVtYmVyLCBtYXg6bnVtYmVyfX0gcGFyYW1zLm9wdGlvbnMgYXhpcyBvcHRpb25zXG4gICAgICogQHJldHVybnMge3t0aWNrQ291bnQ6IG51bWJlciwgc2NhbGU6IG9iamVjdCwgbGFiZWxzOiBhcnJheX19IGNvcnJlY3RlZCB0aWNrIGluZm9cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9taW5pbWl6ZVRpY2tTY2FsZTogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciB0aWNrSW5mbyA9IHBhcmFtcy50aWNrSW5mbyxcbiAgICAgICAgICAgIHRpY2tzID0gdHVpLnV0aWwucmFuZ2UoMSwgdGlja0luZm8udGlja0NvdW50KSxcbiAgICAgICAgICAgIG9wdGlvbnMgPSBwYXJhbXMub3B0aW9ucyxcbiAgICAgICAgICAgIHN0ZXAgPSB0aWNrSW5mby5zdGVwLFxuICAgICAgICAgICAgc2NhbGUgPSB0aWNrSW5mby5zY2FsZSxcbiAgICAgICAgICAgIHRpY2tNYXggPSBzY2FsZS5tYXgsXG4gICAgICAgICAgICB0aWNrTWluID0gc2NhbGUubWluLFxuICAgICAgICAgICAgaXNVbmRlZmluZWRNaW4gPSB0dWkudXRpbC5pc1VuZGVmaW5lZChvcHRpb25zLm1pbiksXG4gICAgICAgICAgICBpc1VuZGVmaW5lZE1heCA9IHR1aS51dGlsLmlzVW5kZWZpbmVkKG9wdGlvbnMubWF4KSxcbiAgICAgICAgICAgIGxhYmVscztcbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaEFycmF5KHRpY2tzLCBmdW5jdGlvbih0aWNrSW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBjdXJTdGVwID0gKHN0ZXAgKiB0aWNrSW5kZXgpLFxuICAgICAgICAgICAgICAgIGN1ck1pbiA9IHRpY2tNaW4gKyBjdXJTdGVwLFxuICAgICAgICAgICAgICAgIGN1ck1heCA9IHRpY2tNYXggLSBjdXJTdGVwO1xuXG4gICAgICAgICAgICAvLyDrjZTsnbTsg4Eg67OA6rK97J20IO2VhOyalCDsl4bsnYQg6rK97JqwXG4gICAgICAgICAgICBpZiAocGFyYW1zLnVzZXJNaW4gPD0gY3VyTWluICYmIHBhcmFtcy51c2VyTWF4ID49IGN1ck1heCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gbWluIOqwkuyXkCDrs4Dqsr0g7Jes7Jyg6rCAIOyeiOydhCDqsr3smrBcbiAgICAgICAgICAgIGlmICgoaXNVbmRlZmluZWRNaW4gJiYgcGFyYW1zLnVzZXJNaW4gPiBjdXJNaW4pIHx8XG4gICAgICAgICAgICAgICAgKCFpc1VuZGVmaW5lZE1pbiAmJiBvcHRpb25zLm1pbiA+PSBjdXJNaW4pKSB7XG4gICAgICAgICAgICAgICAgc2NhbGUubWluID0gY3VyTWluO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBtYXgg6rCS7JeQIOuzgOqyvSDsl6zsnKDqsIAg7J6I7J2EIOqyveyasFxuICAgICAgICAgICAgaWYgKChpc1VuZGVmaW5lZE1pbiAmJiBwYXJhbXMudXNlck1heCA8IGN1ck1heCkgfHxcbiAgICAgICAgICAgICAgICAoIWlzVW5kZWZpbmVkTWF4ICYmIG9wdGlvbnMubWF4IDw9IGN1ck1heCkpIHtcbiAgICAgICAgICAgICAgICBzY2FsZS5tYXggPSBjdXJNYXg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxhYmVscyA9IGNhbGN1bGF0b3IubWFrZUxhYmVsc0Zyb21TY2FsZShzY2FsZSwgc3RlcCk7XG4gICAgICAgIHRpY2tJbmZvLmxhYmVscyA9IGxhYmVscztcbiAgICAgICAgdGlja0luZm8uc3RlcCA9IHN0ZXA7XG4gICAgICAgIHRpY2tJbmZvLnRpY2tDb3VudCA9IGxhYmVscy5sZW5ndGg7XG4gICAgICAgIHJldHVybiB0aWNrSW5mbztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gZGl2aWRlIHRpY2sgc3RlcC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge3tzY2FsZToge21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn0sIHRpY2tDb3VudDogbnVtYmVyLCBzdGVwOiBudW1iZXIsIGxhYmVsczogYXJyYXkuPG51bWJlcj59fSB0aWNrSW5mbyB0aWNrIGluZm9cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gb3JnVGlja0NvdW50IG9yaWdpbmFsIHRpY2tDb3VudFxuICAgICAqIEByZXR1cm5zIHt7c2NhbGU6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9LCB0aWNrQ291bnQ6IG51bWJlciwgc3RlcDogbnVtYmVyLCBsYWJlbHM6IGFycmF5LjxudW1iZXI+fX0gdGljayBpbmZvXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZGl2aWRlVGlja1N0ZXA6IGZ1bmN0aW9uKHRpY2tJbmZvLCBvcmdUaWNrQ291bnQpIHtcbiAgICAgICAgdmFyIHN0ZXAgPSB0aWNrSW5mby5zdGVwLFxuICAgICAgICAgICAgc2NhbGUgPSB0aWNrSW5mby5zY2FsZSxcbiAgICAgICAgICAgIHRpY2tDb3VudCA9IHRpY2tJbmZvLnRpY2tDb3VudDtcbiAgICAgICAgLy8gc3RlcCAy7J2YIOuwsOyImCDsnbTrqbTshJwg67OA6rK965CcIHRpY2tDb3VudOydmCDrkZDrsLDsiJgtMeydtCB0aWNrQ291bnTrs7Tri6Qgb3JnVGlja0NvdW507JmAIOywqOydtOqwgCDrjZzrgpjqsbDrgpgg6rCZ7Jy866m0IHN0ZXDsnYQg67CY7Jy866GcIOuzgOqyve2VnOuLpC5cbiAgICAgICAgaWYgKChzdGVwICUgMiA9PT0gMCkgJiZcbiAgICAgICAgICAgIGFicyhvcmdUaWNrQ291bnQgLSAoKHRpY2tDb3VudCAqIDIpIC0gMSkpIDw9IGFicyhvcmdUaWNrQ291bnQgLSB0aWNrQ291bnQpKSB7XG4gICAgICAgICAgICBzdGVwID0gc3RlcCAvIDI7XG4gICAgICAgICAgICB0aWNrSW5mby5sYWJlbHMgPSBjYWxjdWxhdG9yLm1ha2VMYWJlbHNGcm9tU2NhbGUoc2NhbGUsIHN0ZXApO1xuICAgICAgICAgICAgdGlja0luZm8udGlja0NvdW50ID0gdGlja0luZm8ubGFiZWxzLmxlbmd0aDtcbiAgICAgICAgICAgIHRpY2tJbmZvLnN0ZXAgPSBzdGVwO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aWNrSW5mbztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSB0aWNrIGluZm9cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMudGlja0NvdW50IHRpY2sgY291bnRcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubWluIHNjYWxlIG1pblxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5tYXggc2NhbGUgbWF4XG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnVzZXJNaW4gbWluaW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMudXNlck1heCBtYXhpbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaXNNaW51cyB3aGV0aGVyIHNjYWxlIGlzIG1pbnVzIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5jaGFydFR5cGUgY2hhcnQgdHlwZVxuICAgICAqICAgICAgQHBhcmFtIHt7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX0gcGFyYW1zLm9wdGlvbnMgYXhpcyBvcHRpb25zXG4gICAgICogQHJldHVybnMge3tcbiAgICAgKiAgICAgIHNjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfSxcbiAgICAgKiAgICAgIHRpY2tDb3VudDogbnVtYmVyLFxuICAgICAqICAgICAgc3RlcDogbnVtYmVyLFxuICAgICAqICAgICAgbGFiZWxzOiBhcnJheS48bnVtYmVyPlxuICAgICAqIH19IHRpY2sgaW5mb1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VUaWNrSW5mbzogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBzY2FsZSA9IHBhcmFtcy5zY2FsZSxcbiAgICAgICAgICAgIHN0ZXAsIHRpY2tJbmZvO1xuXG4gICAgICAgIC8vIDAxLiDquLDrs7ggc2NhbGUg7KCV67O066GcIHN0ZXAg7Ja76riwXG4gICAgICAgIHN0ZXAgPSBjYWxjdWxhdG9yLmdldFNjYWxlU3RlcChzY2FsZSwgcGFyYW1zLnRpY2tDb3VudCk7XG5cbiAgICAgICAgLy8gMDIuIHN0ZXAg7KCV6rec7ZmUIOyLnO2CpOq4sCAoZXg6IDAuMyAtLT4gMC41LCA3IC0tPiAxMClcbiAgICAgICAgc3RlcCA9IHRoaXMuX25vcm1hbGl6ZVN0ZXAoc3RlcCk7XG5cbiAgICAgICAgLy8gMDMuIHNjYWxlIOygleq3nO2ZlCDsi5ztgqTquLBcbiAgICAgICAgc2NhbGUgPSB0aGlzLl9ub3JtYWxpemVTY2FsZShzY2FsZSwgc3RlcCwgcGFyYW1zLnRpY2tDb3VudCk7XG5cbiAgICAgICAgLy8gMDQuIGxpbmXssKjtirjsnZgg6rK97JqwIOyCrOyaqeyekOydmCBtaW7qsJLsnbQgc2NhbGXsnZggbWlu6rCS6rO8IOqwmeydhCDqsr3smrAsIG1pbuqwkuydhCAxIHN0ZXAg6rCQ7IaMIOyLnO2CtFxuICAgICAgICBzY2FsZS5taW4gPSB0aGlzLl9hZGRNaW5QYWRkaW5nKHtcbiAgICAgICAgICAgIG1pbjogc2NhbGUubWluLFxuICAgICAgICAgICAgc3RlcDogc3RlcCxcbiAgICAgICAgICAgIHVzZXJNaW46IHBhcmFtcy51c2VyTWluLFxuICAgICAgICAgICAgbWluT3B0aW9uOiBwYXJhbXMub3B0aW9ucy5taW4sXG4gICAgICAgICAgICBjaGFydFR5cGU6IHBhcmFtcy5jaGFydFR5cGVcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gMDQuIOyCrOyaqeyekOydmCBtYXjqsJLsnbQgc2NhZWwgbWF47JmAIOqwmeydhCDqsr3smrAsIG1heOqwkuydhCAxIHN0ZXAg7Kad6rCAIOyLnO2CtFxuICAgICAgICBzY2FsZS5tYXggPSB0aGlzLl9hZGRNYXhQYWRkaW5nKHtcbiAgICAgICAgICAgIG1heDogc2NhbGUubWF4LFxuICAgICAgICAgICAgc3RlcDogc3RlcCxcbiAgICAgICAgICAgIHVzZXJNYXg6IHBhcmFtcy51c2VyTWF4LFxuICAgICAgICAgICAgbWF4T3B0aW9uOiBwYXJhbXMub3B0aW9ucy5tYXgsXG4gICAgICAgICAgICBjaGFydFR5cGU6IHBhcmFtcy5jaGFydFR5cGVcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gMDUuIGF4aXMgc2NhbGXsnbQg7IKs7Jqp7J6QIG1pbiwgbWF47JmAIOqxsOumrOqwgCDrqYAg6rK97JqwIOyhsOygiFxuICAgICAgICB0aWNrSW5mbyA9IHRoaXMuX21pbmltaXplVGlja1NjYWxlKHtcbiAgICAgICAgICAgIHVzZXJNaW46IHBhcmFtcy51c2VyTWluLFxuICAgICAgICAgICAgdXNlck1heDogcGFyYW1zLnVzZXJNYXgsXG4gICAgICAgICAgICB0aWNrSW5mbzoge3NjYWxlOiBzY2FsZSwgc3RlcDogc3RlcCwgdGlja0NvdW50OiBwYXJhbXMudGlja0NvdW50fSxcbiAgICAgICAgICAgIG9wdGlvbnM6IHBhcmFtcy5vcHRpb25zXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRpY2tJbmZvID0gdGhpcy5fZGl2aWRlVGlja1N0ZXAodGlja0luZm8sIHBhcmFtcy50aWNrQ291bnQpO1xuICAgICAgICByZXR1cm4gdGlja0luZm87XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZCBzY2FsZSBtaW4gcGFkZGluZy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwcmFtcyB7bnVtYmVyfSBwYXJhbXMubWluIHNjYWxlIG1pblxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy51c2VyTWluIG1pbmltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLm1pbk9wdGlvbiBtaW4gb3B0aW9uXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnN0ZXAgdGljayBzdGVwXG4gICAgICogQHJldHVybnMge251bWJlcn0gc2NhbGUgbWluXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYWRkTWluUGFkZGluZzogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBtaW4gPSBwYXJhbXMubWluO1xuXG4gICAgICAgIGlmICgocGFyYW1zLmNoYXJ0VHlwZSAhPT0gY2hhcnRDb25zdC5DSEFSVF9UWVBFX0xJTkUgJiYgcGFyYW1zLnVzZXJNaW4gPj0gMCkgfHwgIXR1aS51dGlsLmlzVW5kZWZpbmVkKHBhcmFtcy5taW5PcHRpb24pKSB7XG4gICAgICAgICAgICByZXR1cm4gbWluO1xuICAgICAgICB9XG4gICAgICAgIC8vIG5vcm1hbGl6ZeuQnCBzY2FsZSBtaW7qsJLsnbQgdXNlciBtaW7qsJLqs7wg6rCZ7J2EIOqyveyasCBzdGVwIOqwkOyGjFxuICAgICAgICBpZiAocGFyYW1zLm1pbiA9PT0gcGFyYW1zLnVzZXJNaW4pIHtcbiAgICAgICAgICAgIG1pbiAtPSBwYXJhbXMuc3RlcDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWluO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgc2NhbGUgbWF4IHBhZGRpbmcuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcHJhbXMge251bWJlcn0gcGFyYW1zLm1heCBzY2FsZSBtYXhcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMudXNlck1heCBtYXhpbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5tYXhPcHRpb24gbWF4IG9wdGlvblxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5zdGVwIHRpY2sgc3RlcFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IHNjYWxlIG1heFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2FkZE1heFBhZGRpbmc6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgbWF4ID0gcGFyYW1zLm1heDtcblxuICAgICAgICBpZiAoKHBhcmFtcy5jaGFydFR5cGUgIT09IGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9MSU5FICYmIHBhcmFtcy51c2VyTWF4IDw9IDApIHx8ICF0dWkudXRpbC5pc1VuZGVmaW5lZChwYXJhbXMubWF4T3B0aW9uKSkge1xuICAgICAgICAgICAgcmV0dXJuIG1heDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG5vcm1hbGl6ZeuQnCBzY2FsZSBtYXjqsJLsnbQgdXNlciBtYXjqsJLqs7wg6rCZ7J2EIOqyveyasCBzdGVwIOymneqwgFxuICAgICAgICBpZiAodHVpLnV0aWwuaXNVbmRlZmluZWQocGFyYW1zLm1heE9wdGlvbikgJiYgKHBhcmFtcy5tYXggPT09IHBhcmFtcy51c2VyTWF4KSkge1xuICAgICAgICAgICAgbWF4ICs9IHBhcmFtcy5zdGVwO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXg7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG5vcm1hbGl6ZSBtaW4uXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1pbiBvcmlnaW5hbCBtaW5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3RlcCB0aWNrIHN0ZXBcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBub3JtYWxpemVkIG1pblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX25vcm1hbGl6ZU1pbjogZnVuY3Rpb24obWluLCBzdGVwKSB7XG4gICAgICAgIHZhciBtb2QgPSB0dWkudXRpbC5tb2QobWluLCBzdGVwKSxcbiAgICAgICAgICAgIG5vcm1hbGl6ZWQ7XG5cbiAgICAgICAgaWYgKG1vZCA9PT0gMCkge1xuICAgICAgICAgICAgbm9ybWFsaXplZCA9IG1pbjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5vcm1hbGl6ZWQgPSB0dWkudXRpbC5zdWJ0cmFjdGlvbihtaW4sIChtaW4gPj0gMCA/IG1vZCA6IHN0ZXAgKyBtb2QpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbm9ybWFsaXplZDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBub3JtYWxpemVkIG1heC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge3ttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fSBzY2FsZSBzY2FsZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdGVwIHRpY2sgc3RlcFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB0aWNrQ291bnQgdGljayBjb3VudFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IG5vcm1hbGl6ZWQgbWF4XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZU5vcm1hbGl6ZWRNYXg6IGZ1bmN0aW9uKHNjYWxlLCBzdGVwLCB0aWNrQ291bnQpIHtcbiAgICAgICAgdmFyIG1pbk1heERpZmYgPSB0dWkudXRpbC5tdWx0aXBsaWNhdGlvbihzdGVwLCB0aWNrQ291bnQgLSAxKSxcbiAgICAgICAgICAgIG5vcm1hbGl6ZWRNYXggPSB0dWkudXRpbC5hZGRpdGlvbihzY2FsZS5taW4sIG1pbk1heERpZmYpLFxuICAgICAgICAgICAgbWF4RGlmZiA9IHNjYWxlLm1heCAtIG5vcm1hbGl6ZWRNYXgsXG4gICAgICAgICAgICBtb2REaWZmLCBkaXZpZGVEaWZmO1xuICAgICAgICAvLyBub3JtYWxpemXrkJwgbWF46rCS7J20IOybkOuemOydmCBtYXjqsJIg67O064ukIOyekeydhCDqsr3smrAgc3RlcOydhCDspp3qsIDsi5zsvJwg7YGwIOqwkuycvOuhnCDrp4zrk6TquLBcbiAgICAgICAgaWYgKG1heERpZmYgPiAwKSB7XG4gICAgICAgICAgICBtb2REaWZmID0gbWF4RGlmZiAlIHN0ZXA7XG4gICAgICAgICAgICBkaXZpZGVEaWZmID0gTWF0aC5mbG9vcihtYXhEaWZmIC8gc3RlcCk7XG4gICAgICAgICAgICBub3JtYWxpemVkTWF4ICs9IHN0ZXAgKiAobW9kRGlmZiA+IDAgPyBkaXZpZGVEaWZmICsgMSA6IGRpdmlkZURpZmYpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBub3JtYWxpemVkTWF4O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBub3JtYWxpemUgc2NhbGUuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHt7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX0gc2NhbGUgYmFzZSBzY2FsZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdGVwIHRpY2sgc3RlcFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB0aWNrQ291bnQgdGljayBjb3VudFxuICAgICAqIEByZXR1cm5zIHt7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX0gbm9ybWFsaXplZCBzY2FsZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX25vcm1hbGl6ZVNjYWxlOiBmdW5jdGlvbihzY2FsZSwgc3RlcCwgdGlja0NvdW50KSB7XG4gICAgICAgIHNjYWxlLm1pbiA9IHRoaXMuX25vcm1hbGl6ZU1pbihzY2FsZS5taW4sIHN0ZXApO1xuICAgICAgICBzY2FsZS5tYXggPSB0aGlzLl9tYWtlTm9ybWFsaXplZE1heChzY2FsZSwgc3RlcCwgdGlja0NvdW50KTtcbiAgICAgICAgcmV0dXJuIHNjYWxlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgY2FuZGlkYXRlcyBhYm91dCB0aWNrIGluZm8uXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLm1pbiBtaW5pbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5tYXggbWF4aW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPG51bWJlcj59IHBhcmFtcy50aWNrQ291bnRzIHRpY2sgY291bnRzXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLmNoYXJ0VHlwZSBjaGFydCB0eXBlXG4gICAgICogQHBhcmFtIHt7bWluOiBudW1iZXIsIG1heDpudW1iZXJ9fSBvcHRpb25zIGF4aXMgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHthcnJheX0gY2FuZGlkYXRlcyBhYm91dCB0aWNrIGluZm9cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRDYW5kaWRhdGVUaWNrSW5mb3M6IGZ1bmN0aW9uKHBhcmFtcywgb3B0aW9ucykge1xuICAgICAgICB2YXIgdXNlck1pbiA9IHBhcmFtcy5taW4sXG4gICAgICAgICAgICB1c2VyTWF4ID0gcGFyYW1zLm1heCxcbiAgICAgICAgICAgIG1pbiA9IHBhcmFtcy5taW4sXG4gICAgICAgICAgICBtYXggPSBwYXJhbXMubWF4LFxuICAgICAgICAgICAgc2NhbGUsIGNhbmRpZGF0ZXM7XG5cbiAgICAgICAgLy8gbWluLCBtYXjrp4zsnLzroZwg6riw67O4IHNjYWxlIOyWu+q4sFxuICAgICAgICBzY2FsZSA9IHRoaXMuX21ha2VCYXNlU2NhbGUobWluLCBtYXgsIG9wdGlvbnMpO1xuXG4gICAgICAgIGNhbmRpZGF0ZXMgPSB0dWkudXRpbC5tYXAocGFyYW1zLnRpY2tDb3VudHMsIGZ1bmN0aW9uKHRpY2tDb3VudCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21ha2VUaWNrSW5mbyh7XG4gICAgICAgICAgICAgICAgdGlja0NvdW50OiB0aWNrQ291bnQsXG4gICAgICAgICAgICAgICAgc2NhbGU6IHR1aS51dGlsLmV4dGVuZCh7fSwgc2NhbGUpLFxuICAgICAgICAgICAgICAgIHVzZXJNaW46IHVzZXJNaW4sXG4gICAgICAgICAgICAgICAgdXNlck1heDogdXNlck1heCxcbiAgICAgICAgICAgICAgICBjaGFydFR5cGU6IHBhcmFtcy5jaGFydFR5cGUsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgICByZXR1cm4gY2FuZGlkYXRlcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBiYXNlIHNjYWxlXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1pbiBtaW5pbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtYXggbWF4aW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiBAcGFyYW0ge3ttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fSBvcHRpb25zIGF4aXMgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHt7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX0gYmFzZSBzY2FsZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VCYXNlU2NhbGU6IGZ1bmN0aW9uKG1pbiwgbWF4LCBvcHRpb25zKSB7XG4gICAgICAgIHZhciBpc01pbnVzID0gZmFsc2UsXG4gICAgICAgICAgICB0bXBNaW4sIHNjYWxlO1xuXG4gICAgICAgIGlmIChtaW4gPCAwICYmIG1heCA8PSAwKSB7XG4gICAgICAgICAgICBpc01pbnVzID0gdHJ1ZTtcbiAgICAgICAgICAgIHRtcE1pbiA9IG1pbjtcbiAgICAgICAgICAgIG1pbiA9IC1tYXg7XG4gICAgICAgICAgICBtYXggPSAtdG1wTWluO1xuICAgICAgICB9XG5cbiAgICAgICAgc2NhbGUgPSBjYWxjdWxhdG9yLmNhbGN1bGF0ZVNjYWxlKG1pbiwgbWF4KTtcblxuICAgICAgICBpZiAoaXNNaW51cykge1xuICAgICAgICAgICAgdG1wTWluID0gc2NhbGUubWluO1xuICAgICAgICAgICAgc2NhbGUubWluID0gLXNjYWxlLm1heDtcbiAgICAgICAgICAgIHNjYWxlLm1heCA9IC10bXBNaW47XG4gICAgICAgIH1cblxuICAgICAgICBzY2FsZS5taW4gPSBvcHRpb25zLm1pbiB8fCBzY2FsZS5taW47XG4gICAgICAgIHNjYWxlLm1heCA9IG9wdGlvbnMubWF4IHx8IHNjYWxlLm1heDtcblxuICAgICAgICByZXR1cm4gc2NhbGU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZvcm1hdCBsYWJlbHMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gbGFiZWxzIHRhcmdldCBsYWJlbHNcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uW119IGZvcm1hdEZ1bmN0aW9ucyBmb3JtYXQgZnVuY3Rpb25zXG4gICAgICogQHJldHVybnMge3N0cmluZ1tdfSBmb3JtYXR0ZWQgbGFiZWxzXG4gICAgICovXG4gICAgZm9ybWF0TGFiZWxzOiBmdW5jdGlvbihsYWJlbHMsIGZvcm1hdEZ1bmN0aW9ucykge1xuICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICBpZiAoIWZvcm1hdEZ1bmN0aW9ucyB8fCAhZm9ybWF0RnVuY3Rpb25zLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIGxhYmVscztcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQgPSB0dWkudXRpbC5tYXAobGFiZWxzLCBmdW5jdGlvbihsYWJlbCkge1xuICAgICAgICAgICAgdmFyIGZucyA9IGNvbmNhdC5hcHBseShbbGFiZWxdLCBmb3JtYXRGdW5jdGlvbnMpO1xuICAgICAgICAgICAgcmV0dXJuIHR1aS51dGlsLnJlZHVjZShmbnMsIGZ1bmN0aW9uKHN0b3JlZCwgZm4pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZm4oc3RvcmVkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGF4aXNEYXRhTWFrZXI7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgQm91bmRzIG1ha2VyLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4uL2NvbnN0JyksXG4gICAgY2FsY3VsYXRvciA9IHJlcXVpcmUoJy4vY2FsY3VsYXRvcicpLFxuICAgIHJlbmRlclV0aWwgPSByZXF1aXJlKCcuL3JlbmRlclV0aWwnKTtcblxudmFyIGNvbmNhdCA9IEFycmF5LnByb3RvdHlwZS5jb25jYXQ7XG5cbi8qKlxuICogQm91bmRzIG1ha2VyLlxuICogQG1vZHVsZSBib3VuZHNNYWtlclxuICovXG52YXIgYm91bmRzTWFrZXIgPSB7XG4gICAgLyoqXG4gICAgICogR2V0IG1heCBsYWJlbCBvZiB2YWx1ZSBheGlzLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Ym91bmRzTWFrZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udmVydGVkRGF0YSBjb252ZXJ0IGRhdGFcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY2hhcnRUeXBlIGNoYXJ0IHR5cGVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfHN0cmluZ30gbWF4IGxhYmVsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0VmFsdWVBeGlzTWF4TGFiZWw6IGZ1bmN0aW9uKGNvbnZlcnRlZERhdGEsIGNoYXJ0VHlwZSkge1xuICAgICAgICB2YXIgdmFsdWVzID0gY2hhcnRUeXBlICYmIGNvbnZlcnRlZERhdGEudmFsdWVzW2NoYXJ0VHlwZV0gfHwgY29udmVydGVkRGF0YS5qb2luVmFsdWVzLFxuICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zID0gY29udmVydGVkRGF0YS5mb3JtYXRGdW5jdGlvbnMsXG4gICAgICAgICAgICBmbGF0dGVuVmFsdWVzID0gY29uY2F0LmFwcGx5KFtdLCB2YWx1ZXMpLFxuICAgICAgICAgICAgbWluID0gdHVpLnV0aWwubWluKGZsYXR0ZW5WYWx1ZXMpLFxuICAgICAgICAgICAgbWF4ID0gdHVpLnV0aWwubWF4KGZsYXR0ZW5WYWx1ZXMpLFxuICAgICAgICAgICAgc2NhbGUgPSBjYWxjdWxhdG9yLmNhbGN1bGF0ZVNjYWxlKG1pbiwgbWF4KSxcbiAgICAgICAgICAgIG1pbkxhYmVsID0gY2FsY3VsYXRvci5ub3JtYWxpemVBeGlzTnVtYmVyKHNjYWxlLm1pbiksXG4gICAgICAgICAgICBtYXhMYWJlbCA9IGNhbGN1bGF0b3Iubm9ybWFsaXplQXhpc051bWJlcihzY2FsZS5tYXgpLFxuICAgICAgICAgICAgZm5zID0gZm9ybWF0RnVuY3Rpb25zICYmIGZvcm1hdEZ1bmN0aW9ucy5zbGljZSgpIHx8IFtdO1xuICAgICAgICBtYXhMYWJlbCA9IChtaW5MYWJlbCArICcnKS5sZW5ndGggPiAobWF4TGFiZWwgKyAnJykubGVuZ3RoID8gbWluTGFiZWwgOiBtYXhMYWJlbDtcbiAgICAgICAgZm5zLnVuc2hpZnQobWF4TGFiZWwpO1xuICAgICAgICBtYXhMYWJlbCA9IHR1aS51dGlsLnJlZHVjZShmbnMsIGZ1bmN0aW9uKHN0b3JlZCwgZm4pIHtcbiAgICAgICAgICAgIHJldHVybiBmbihzdG9yZWQpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIG1heExhYmVsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgaGVpZ2h0IG9mIHggYXhpcyBhcmVhLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Ym91bmRzTWFrZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyB4IGF4aXMgb3B0aW9ucyxcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBsYWJlbHMgYXhpcyBsYWJlbHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgYXhpcyB0aGVtZVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IGhlaWdodFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFhBeGlzSGVpZ2h0OiBmdW5jdGlvbihvcHRpb25zLCBsYWJlbHMsIHRoZW1lKSB7XG4gICAgICAgIHZhciB0aXRsZSA9IG9wdGlvbnMgJiYgb3B0aW9ucy50aXRsZSxcbiAgICAgICAgICAgIHRpdGxlQXJlYUhlaWdodCA9IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodCh0aXRsZSwgdGhlbWUudGl0bGUpICsgY2hhcnRDb25zdC5USVRMRV9QQURESU5HLFxuICAgICAgICAgICAgaGVpZ2h0ID0gcmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsc01heEhlaWdodChsYWJlbHMsIHRoZW1lLmxhYmVsKSArIHRpdGxlQXJlYUhlaWdodDtcbiAgICAgICAgcmV0dXJuIGhlaWdodDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHdpZHRoIGFib3V0IHkgYXhpcy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyB5IGF4aXMgb3B0aW9uc1xuICAgICAqIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGxhYmVscyBsYWJlbHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgeUF4aXMgdGhlbWVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggb3B0aW9ucyBpbmRleFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IHkgYXhpcyB3aWR0aFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFlBeGlzV2lkdGg6IGZ1bmN0aW9uKG9wdGlvbnMsIGxhYmVscywgdGhlbWUsIGluZGV4KSB7XG4gICAgICAgIHZhciB0aXRsZSA9ICcnLFxuICAgICAgICAgICAgdGl0bGVBcmVhV2lkdGgsIHdpZHRoO1xuXG4gICAgICAgIGlmIChvcHRpb25zKSB7XG4gICAgICAgICAgICBvcHRpb25zID0gW10uY29uY2F0KG9wdGlvbnMpO1xuICAgICAgICAgICAgdGl0bGUgPSBvcHRpb25zW2luZGV4IHx8IDBdLnRpdGxlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGl0bGVBcmVhV2lkdGggPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxIZWlnaHQodGl0bGUsIHRoZW1lLnRpdGxlKSArIGNoYXJ0Q29uc3QuVElUTEVfUEFERElORztcbiAgICAgICAgd2lkdGggPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxzTWF4V2lkdGgobGFiZWxzLCB0aGVtZS5sYWJlbCkgKyB0aXRsZUFyZWFXaWR0aCArIGNoYXJ0Q29uc3QuQVhJU19MQUJFTF9QQURESU5HO1xuXG4gICAgICAgIHJldHVybiB3aWR0aDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHdpZHRoIGFib3V0IHkgcmlnaHQgYXhpcy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmJvdW5kc01ha2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBwYXJhbXMuY2hhcnRUeXBlcyB5IGF4aXMgY2hhcnQgdHlwZXNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgeSBheGlzIHRoZW1lXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgeSBheGlzIG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSB5IHJpZ2h0IGF4aXMgd2lkdGhcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRZUkF4aXNXaWR0aDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBjaGFydFR5cGVzID0gcGFyYW1zLmNoYXJ0VHlwZXMgfHwgW10sXG4gICAgICAgICAgICBsZW4gPSBjaGFydFR5cGVzLmxlbmd0aCxcbiAgICAgICAgICAgIHdpZHRoID0gMCxcbiAgICAgICAgICAgIGluZGV4LCBjaGFydFR5cGUsIHRoZW1lLCBsYWJlbDtcbiAgICAgICAgaWYgKGxlbiA+IDApIHtcbiAgICAgICAgICAgIGluZGV4ID0gbGVuIC0gMTtcbiAgICAgICAgICAgIGNoYXJ0VHlwZSA9IGNoYXJ0VHlwZXNbaW5kZXhdO1xuICAgICAgICAgICAgdGhlbWUgPSBwYXJhbXMudGhlbWVbY2hhcnRUeXBlXSB8fCBwYXJhbXMudGhlbWU7XG4gICAgICAgICAgICBsYWJlbCA9IHRoaXMuX2dldFZhbHVlQXhpc01heExhYmVsKHBhcmFtcy5jb252ZXJ0ZWREYXRhLCBjaGFydFR5cGUpO1xuICAgICAgICAgICAgd2lkdGggPSB0aGlzLl9nZXRZQXhpc1dpZHRoKHBhcmFtcy5vcHRpb25zLCBbbGFiZWxdLCB0aGVtZSwgaW5kZXgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB3aWR0aDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBheGVzIGRpbWVuc2lvbi5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmJvdW5kc01ha2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmNvbnZlcnRlZERhdGEgY29udmVydGVkIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgY2hhcnQgdGhlbWVcbiAgICAgKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gcGFyYW1zLmlzVmVydGljYWwgd2hldGhlciB2ZXJ0aWNhbCBvciBub3RcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMub3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5heGVzTGFiZWxJbmZvIGF4ZXMgbGFiZWwgaW5mb1xuICAgICAqIEByZXR1cm5zIHt7XG4gICAgICogICAgICB5QXhpczoge3dpZHRoOiBudW1iZXJ9LFxuICAgICAqICAgICAgeXJBeGlzOiB7d2lkdGg6IG51bWJlcn0sXG4gICAgICogICAgICB4QXhpczoge2hlaWdodDogbnVtYmVyfVxuICAgICAqIH19IGF4ZXMgZGltZW5zaW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUF4ZXNEaW1lbnNpb246IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgeUF4aXNXaWR0aCA9IDAsXG4gICAgICAgICAgICB4QXhpc0hlaWdodCA9IDAsXG4gICAgICAgICAgICB5ckF4aXNXaWR0aCA9IDAsXG4gICAgICAgICAgICBheGVzTGFiZWxJbmZvLCBjaGFydFR5cGU7XG5cbiAgICAgICAgLy8gYXhpcyDsmIHsl63snbQg7ZWE7JqUIOyeiOuKlCDqsr3smrDsl5Drp4wg7LKY66asXG4gICAgICAgIGlmIChwYXJhbXMuaGFzQXhlcykge1xuICAgICAgICAgICAgYXhlc0xhYmVsSW5mbyA9IHBhcmFtcy5heGVzTGFiZWxJbmZvO1xuICAgICAgICAgICAgY2hhcnRUeXBlID0gcGFyYW1zLm9wdGlvbkNoYXJ0VHlwZXMgJiYgcGFyYW1zLm9wdGlvbkNoYXJ0VHlwZXNbMF0gfHwgJyc7XG4gICAgICAgICAgICB5QXhpc1dpZHRoID0gdGhpcy5fZ2V0WUF4aXNXaWR0aChwYXJhbXMub3B0aW9ucy55QXhpcywgYXhlc0xhYmVsSW5mby55QXhpcywgcGFyYW1zLnRoZW1lLnlBeGlzW2NoYXJ0VHlwZV0gfHwgcGFyYW1zLnRoZW1lLnlBeGlzKTtcbiAgICAgICAgICAgIHhBeGlzSGVpZ2h0ID0gdGhpcy5fZ2V0WEF4aXNIZWlnaHQocGFyYW1zLm9wdGlvbnMueEF4aXMsIGF4ZXNMYWJlbEluZm8ueEF4aXMsIHBhcmFtcy50aGVtZS54QXhpcyk7XG4gICAgICAgICAgICB5ckF4aXNXaWR0aCA9IHRoaXMuX2dldFlSQXhpc1dpZHRoKHtcbiAgICAgICAgICAgICAgICBjb252ZXJ0ZWREYXRhOiBwYXJhbXMuY29udmVydGVkRGF0YSxcbiAgICAgICAgICAgICAgICBjaGFydFR5cGVzOiBwYXJhbXMub3B0aW9uQ2hhcnRUeXBlcyxcbiAgICAgICAgICAgICAgICB0aGVtZTogcGFyYW1zLnRoZW1lLnlBeGlzLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IHBhcmFtcy5vcHRpb25zLnlBeGlzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB5QXhpczoge1xuICAgICAgICAgICAgICAgIHdpZHRoOiB5QXhpc1dpZHRoXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgeXJBeGlzOiB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IHlyQXhpc1dpZHRoXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgeEF4aXM6IHtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IHhBeGlzSGVpZ2h0XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgbGVnZW5kIGRpbWVuc2lvbi5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmJvdW5kc01ha2VyXG4gICAgICogQHBhcmFtIHthcnJheS48c3RyaW5nPn0gam9pbkxlZ2VuZExhYmVscyBsZWdlbmQgbGFiZWxzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGxhYmVsVGhlbWUgbGFiZWwgdGhlbWVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY2hhcnRUeXBlIGNoYXJ0IHR5cGVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gc2VyaWVzT3B0aW9uIHNlcmllcyBvcHRpb25cbiAgICAgKiBAcmV0dXJucyB7e3dpZHRoOiBudW1iZXJ9fSBsZWdlbmQgZGltZW5zaW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUxlZ2VuZERpbWVuc2lvbjogZnVuY3Rpb24oam9pbkxlZ2VuZExhYmVscywgbGFiZWxUaGVtZSwgY2hhcnRUeXBlLCBzZXJpZXNPcHRpb24pIHtcbiAgICAgICAgdmFyIGxlZ2VuZFdpZHRoID0gMCxcbiAgICAgICAgICAgIGxlZ2VuZExhYmVscywgbWF4TGFiZWxXaWR0aDtcblxuICAgICAgICBzZXJpZXNPcHRpb24gPSBzZXJpZXNPcHRpb24gfHwge307XG5cbiAgICAgICAgaWYgKGNoYXJ0VHlwZSAhPT0gY2hhcnRDb25zdC5DSEFSVF9UWVBFX1BJRSB8fCAhc2VyaWVzT3B0aW9uLmxlZ2VuZFR5cGUpIHtcbiAgICAgICAgICAgIGxlZ2VuZExhYmVscyA9IHR1aS51dGlsLm1hcChqb2luTGVnZW5kTGFiZWxzLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW0ubGFiZWw7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG1heExhYmVsV2lkdGggPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxzTWF4V2lkdGgobGVnZW5kTGFiZWxzLCBsYWJlbFRoZW1lKTtcbiAgICAgICAgICAgIGxlZ2VuZFdpZHRoID0gbWF4TGFiZWxXaWR0aCArIGNoYXJ0Q29uc3QuTEVHRU5EX1JFQ1RfV0lEVEggK1xuICAgICAgICAgICAgICAgIGNoYXJ0Q29uc3QuTEVHRU5EX0xBQkVMX0xFRlRfUEFERElORyArIChjaGFydENvbnN0LkxFR0VORF9BUkVBX1BBRERJTkcgKiAyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB3aWR0aDogbGVnZW5kV2lkdGhcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBzZXJpZXMgZGltZW5zaW9uLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Ym91bmRzTWFrZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gcGFyYW1zLmNoYXJ0RGltZW5zaW9uIGNoYXJ0IGRpbWVuc2lvblxuICAgICAqICAgICAgQHBhcmFtIHt7XG4gICAgICogICAgICAgICAgeUF4aXM6IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6bnVtYmVyfSxcbiAgICAgKiAgICAgICAgICB4QXhpczoge3dpZHRoOiBudW1iZXIsIGhlaWdodDpudW1iZXJ9LFxuICAgICAqICAgICAgICAgIHlyQXhpczoge3dpZHRoOiBudW1iZXIsIGhlaWdodDpudW1iZXJ9XG4gICAgICogICAgICB9fSBwYXJhbXMuYXhlc0RpbWVuc2lvbiBheGVzIGRpbWVuc2lvblxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5sZWdlbmRXaWR0aCBsZWdlbmQgd2lkdGhcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMudGl0bGVIZWlnaHQgdGl0bGUgaGVpZ2h0XG4gICAgICogQHJldHVybnMge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IHNlcmllcyBkaW1lbnNpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlU2VyaWVzRGltZW5zaW9uOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGF4ZXNEaW1lbnNpb24gPSBwYXJhbXMuYXhlc0RpbWVuc2lvbixcbiAgICAgICAgICAgIHJpZ2h0QXJlYVdpZHRoID0gcGFyYW1zLmxlZ2VuZFdpZHRoICsgYXhlc0RpbWVuc2lvbi55ckF4aXMud2lkdGgsXG4gICAgICAgICAgICB3aWR0aCA9IHBhcmFtcy5jaGFydERpbWVuc2lvbi53aWR0aCAtIChjaGFydENvbnN0LkNIQVJUX1BBRERJTkcgKiAyKSAtIGF4ZXNEaW1lbnNpb24ueUF4aXMud2lkdGggLSByaWdodEFyZWFXaWR0aCxcbiAgICAgICAgICAgIGhlaWdodCA9IHBhcmFtcy5jaGFydERpbWVuc2lvbi5oZWlnaHQgLSAoY2hhcnRDb25zdC5DSEFSVF9QQURESU5HICogMikgLSBwYXJhbXMudGl0bGVIZWlnaHQgLSBheGVzRGltZW5zaW9uLnhBeGlzLmhlaWdodDtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBoZWlnaHRcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBjaGFydCBkaW1lbnNpb24uXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBjaGFydE9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHt7d2lkdGg6IChudW1iZXIpLCBoZWlnaHQ6IChudW1iZXIpfX0gY2hhcnQgZGltZW5zaW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUNoYXJ0RGltZW5zaW9uOiBmdW5jdGlvbihjaGFydE9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHdpZHRoOiBjaGFydE9wdGlvbnMud2lkdGggfHwgY2hhcnRDb25zdC5DSEFSVF9ERUZBVUxUX1dJRFRILFxuICAgICAgICAgICAgaGVpZ2h0OiBjaGFydE9wdGlvbnMuaGVpZ2h0IHx8IGNoYXJ0Q29uc3QuQ0hBUlRfREVGQVVMVF9IRUlHSFRcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSB0aXRsZSBkaW1lbnNpb25cbiAgICAgKiBAcGFyYW0ge3t0aXRsZTogc3RyaW5nfX0gb3B0aW9uIHRpdGxlIG9wdGlvblxuICAgICAqIEBwYXJhbSB7e2ZvbnRGYW1pbHk6IHN0cmluZywgZm9udFNpemU6IG51bWJlcn19IHRoZW1lIHRpdGxlIHRoZW1lXG4gICAgICogQHJldHVybnMge3toZWlnaHQ6IG51bWJlcn19IHRpdGxlIGRpbWVuc2lvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VUaXRsZURpbWVuc2lvbjogZnVuY3Rpb24ob3B0aW9uLCB0aGVtZSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaGVpZ2h0OiByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxIZWlnaHQob3B0aW9uLCB0aGVtZSkgKyBjaGFydENvbnN0LlRJVExFX1BBRERJTkdcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBwbG90IGRpbWVudGlvblxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gc2VyaWVzRGltZW5zaW9uIHNlcmllcyBkaW1lbnNpb25cbiAgICAgKiBAcmV0dXJucyB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gcGxvdCBkaW1lbnNpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlUGxvdERpbWVuc2lvbjogZnVuY3Rpb24oc2VyaWVzRGltZW5zaW9uKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB3aWR0aDogc2VyaWVzRGltZW5zaW9uLndpZHRoICsgY2hhcnRDb25zdC5ISURERU5fV0lEVEgsXG4gICAgICAgICAgICBoZWlnaHQ6IHNlcmllc0RpbWVuc2lvbi5oZWlnaHQgKyBjaGFydENvbnN0LkhJRERFTl9XSURUSFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgY29tcG9uZW50cyBkaW1lbnNpb25cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmJvdW5kc01ha2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmNvbnZlcnRlZERhdGEgY29udmVydGVkIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgY2hhcnQgdGhlbWVcbiAgICAgKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gcGFyYW1zLmlzVmVydGljYWwgd2hldGhlciB2ZXJ0aWNhbCBvciBub3RcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMub3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmF4ZXNMYWJlbEluZm8gYXhlcyBsYWJlbCBpbmZvXG4gICAgICogQHJldHVybnMge09iamVjdH0gY29tcG9uZW50cyBkaW1lbnNpb25zXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0Q29tcG9uZW50c0RpbWVuc2lvbnM6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgY2hhcnRPcHRpb25zID0gcGFyYW1zLm9wdGlvbnMuY2hhcnQgfHwge30sXG4gICAgICAgICAgICBjaGFydERpbWVuc2lvbiA9IHRoaXMuX21ha2VDaGFydERpbWVuc2lvbihjaGFydE9wdGlvbnMpLFxuICAgICAgICAgICAgdGl0bGVEaW1lbnNpb24gPSB0aGlzLl9tYWtlVGl0bGVEaW1lbnNpb24oY2hhcnRPcHRpb25zLnRpdGxlLCBwYXJhbXMudGhlbWUudGl0bGUpLFxuICAgICAgICAgICAgYXhlc0RpbWVuc2lvbiA9IHRoaXMuX21ha2VBeGVzRGltZW5zaW9uKHBhcmFtcyksXG4gICAgICAgICAgICBsZWdlbmREaW1lbnNpb24gPSB0aGlzLl9tYWtlTGVnZW5kRGltZW5zaW9uKHBhcmFtcy5jb252ZXJ0ZWREYXRhLmpvaW5MZWdlbmRMYWJlbHMsIHBhcmFtcy50aGVtZS5sZWdlbmQubGFiZWwsIHBhcmFtcy5jaGFydFR5cGUsIHBhcmFtcy5vcHRpb25zLnNlcmllcyksXG4gICAgICAgICAgICBzZXJpZXNEaW1lbnNpb24gPSB0aGlzLl9tYWtlU2VyaWVzRGltZW5zaW9uKHtcbiAgICAgICAgICAgICAgICBjaGFydERpbWVuc2lvbjogY2hhcnREaW1lbnNpb24sXG4gICAgICAgICAgICAgICAgYXhlc0RpbWVuc2lvbjogYXhlc0RpbWVuc2lvbixcbiAgICAgICAgICAgICAgICBsZWdlbmRXaWR0aDogbGVnZW5kRGltZW5zaW9uLndpZHRoLFxuICAgICAgICAgICAgICAgIHRpdGxlSGVpZ2h0OiB0aXRsZURpbWVuc2lvbi5oZWlnaHRcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB0dWkudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgY2hhcnQ6IGNoYXJ0RGltZW5zaW9uLFxuICAgICAgICAgICAgdGl0bGU6IHRpdGxlRGltZW5zaW9uLFxuICAgICAgICAgICAgc2VyaWVzOiBzZXJpZXNEaW1lbnNpb24sXG4gICAgICAgICAgICBwbG90OiB0aGlzLl9tYWtlUGxvdERpbWVuc2lvbihzZXJpZXNEaW1lbnNpb24pLFxuICAgICAgICAgICAgbGVnZW5kOiBsZWdlbmREaW1lbnNpb25cbiAgICAgICAgfSwgYXhlc0RpbWVuc2lvbik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYmFzaWMgYm91bmQuXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBkaW1lbnNpb24gc2VyaWVzIGRpbWVuc2lvbi5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdG9wIHRvcFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBsZWZ0IGxlZnRcbiAgICAgKiBAcmV0dXJucyB7e2RpbWVuc2lvbjoge3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfSwgcG9zaXRpb246IHt0b3A6IG51bWJlciwgbGVmdDogbnVtYmVyfX19IHNlcmllcyBib3VuZC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQmFzaWNCb3VuZDogZnVuY3Rpb24oZGltZW5zaW9uLCB0b3AsIGxlZnQpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRpbWVuc2lvbjogZGltZW5zaW9uLFxuICAgICAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICB0b3A6IHRvcCxcbiAgICAgICAgICAgICAgICBsZWZ0OiBsZWZ0XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgeUF4aXMgYm91bmQuXG4gICAgICogQHBhcmFtIHt7eUF4aXM6IHt3aWR0aDogbnVtYmVyfSwgcGxvdDoge2hlaWdodDogbnVtYmVyfX19IGRpbWVuc2lvbnMgZGltZW5zaW9uc1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB0b3AgdG9wXG4gICAgICogQHJldHVybnMge3tkaW1lbnNpb246IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IChudW1iZXIpfSwgcG9zaXRpb246IHt0b3A6IG51bWJlciwgbGVmdDogbnVtYmVyfX19IHlBeGlzIGJvdW5kXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVlBeGlzQm91bmQ6IGZ1bmN0aW9uKGRpbWVuc2lvbnMsIHRvcCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGltZW5zaW9uOiB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IGRpbWVuc2lvbnMueUF4aXMud2lkdGgsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBkaW1lbnNpb25zLnBsb3QuaGVpZ2h0XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICB0b3A6IHRvcCxcbiAgICAgICAgICAgICAgICBsZWZ0OiB0aGlzLmNoYXJ0TGVmdFBhZGRpbmdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSB4QXhpcyBib3VuZC5cbiAgICAgKiBAcGFyYW0ge3t4QXhpczoge2hlaWdodDogbnVtYmVyfSwgcGxvdDoge3dpZHRoOiBudW1iZXJ9fX0gZGltZW5zaW9ucyBkaW1lbnNpb25zXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHRvcCB0b3BcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbGVmdCBsZWZ0XG4gICAgICogQHBhcmFtIHt7ZGVncmVlOiBudW1iZXJ9fSByb3RhdGlvbkluZm8gcm90YXRpb24gaW5mb1xuICAgICAqIEByZXR1cm5zIHt7ZGltZW5zaW9uOiB7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiAobnVtYmVyKX0sIHBvc2l0aW9uOiB7dG9wOiBudW1iZXIsIGxlZnQ6IG51bWJlcn19fSB4QXhpcyBib3VuZFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VYQXhpc0JvdW5kOiBmdW5jdGlvbihkaW1lbnNpb25zLCB0b3AsIGxlZnQsIHJvdGF0aW9uSW5mbykge1xuICAgICAgICB2YXIgYm91bmQgPSB7XG4gICAgICAgICAgICBkaW1lbnNpb246IHtcbiAgICAgICAgICAgICAgICB3aWR0aDogZGltZW5zaW9ucy5wbG90LndpZHRoLFxuICAgICAgICAgICAgICAgIGhlaWdodDogZGltZW5zaW9ucy54QXhpcy5oZWlnaHRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgIHRvcDogdG9wICsgZGltZW5zaW9ucy5zZXJpZXMuaGVpZ2h0LFxuICAgICAgICAgICAgICAgIGxlZnQ6IGxlZnQgLSBjaGFydENvbnN0LkhJRERFTl9XSURUSFxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChyb3RhdGlvbkluZm8pIHtcbiAgICAgICAgICAgIGJvdW5kLmRlZ3JlZSA9IHJvdGF0aW9uSW5mby5kZWdyZWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYm91bmQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgeXJBeGlzIGJvdW5kLlxuICAgICAqIEBwYXJhbSB7e3lyQXhpczoge3dpZHRoOiBudW1iZXJ9LCBwbG90OiB7aGVpZ2h0OiBudW1iZXJ9LCBsZWdlbmQ6IHt3aWR0aDogbnVtYmVyfX19IGRpbWVuc2lvbnMgZGltZW5zaW9uc1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB0b3AgdG9wXG4gICAgICogQHJldHVybnMge3tkaW1lbnNpb246IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IChudW1iZXIpfSwgcG9zaXRpb246IHt0b3A6IG51bWJlciwgbGVmdDogbnVtYmVyfX19IHlyQXhpcyBib3VuZFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VZUkF4aXNCb3VuZDogZnVuY3Rpb24oZGltZW5zaW9ucywgdG9wKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkaW1lbnNpb246IHtcbiAgICAgICAgICAgICAgICB3aWR0aDogZGltZW5zaW9ucy55ckF4aXMud2lkdGgsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBkaW1lbnNpb25zLnBsb3QuaGVpZ2h0XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICB0b3A6IHRvcCxcbiAgICAgICAgICAgICAgICByaWdodDogZGltZW5zaW9ucy5sZWdlbmQud2lkdGggKyBjaGFydENvbnN0LkhJRERFTl9XSURUSCArIGNoYXJ0Q29uc3QuQ0hBUlRfUEFERElOR1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGF4ZXMgYm91bmRzLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Ym91bmRzTWFrZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gcGFyYW1zLmhhc0F4ZXMgd2hldGhlciBoYXMgYXhlZCBvciBub3RcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IHBhcmFtcy5vcHRpb25DaGFydFR5cGVzIHkgYXhpcyBjaGFydCB0eXBlc1xuICAgICAqICAgICAgQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBwYXJhbXMuZGltZW5zaW9uIGNoYXJ0IGRpbWVuc2lvblxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy50b3AgdG9wIHBvc2l0aW9uXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnJpZ2h0IHJpZ2h0IHBvc2l0aW9uXG4gICAgICogICAgICBAcGFyYW0ge3tkZWdyZWU6IG51bWJlcn19IHBhcmFtcy5yb3RhdGlvbkluZm8gcm90YXRpb24gaW5mb1xuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IGF4ZXMgYm91bmRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUF4ZXNCb3VuZHM6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgYm91bmRzO1xuXG4gICAgICAgIC8vIHBpZeywqO2KuOyZgCDqsJnsnbQgYXhpcyDsmIHsl63snbQg7ZWE7JqUIOyXhuuKlCDqsr3smrDsl5DripQg67mIIOqwkuydhCDrsJjtmZgg7ZWoXG4gICAgICAgIGlmICghcGFyYW1zLmhhc0F4ZXMpIHtcbiAgICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgfVxuXG4gICAgICAgIGJvdW5kcyA9IHtcbiAgICAgICAgICAgIHBsb3Q6IHRoaXMuX21ha2VCYXNpY0JvdW5kKHBhcmFtcy5kaW1lbnNpb25zLnBsb3QsIHBhcmFtcy50b3AsIHBhcmFtcy5sZWZ0IC0gY2hhcnRDb25zdC5ISURERU5fV0lEVEgpLFxuICAgICAgICAgICAgeUF4aXM6IHRoaXMuX21ha2VZQXhpc0JvdW5kKHBhcmFtcy5kaW1lbnNpb25zLCBwYXJhbXMudG9wKSxcbiAgICAgICAgICAgIHhBeGlzOiB0aGlzLl9tYWtlWEF4aXNCb3VuZChwYXJhbXMuZGltZW5zaW9ucywgcGFyYW1zLnRvcCwgcGFyYW1zLmxlZnQsIHBhcmFtcy5yb3RhdGlvbkluZm8pXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8g7Jqw7LihIHkgYXhpcyDsmIHsl60gYm91bmRzIOygleuztCDstpTqsIBcbiAgICAgICAgaWYgKHBhcmFtcy5vcHRpb25DaGFydFR5cGVzICYmIHBhcmFtcy5vcHRpb25DaGFydFR5cGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgYm91bmRzLnlyQXhpcyA9IHRoaXMuX21ha2VZUkF4aXNCb3VuZChwYXJhbXMuZGltZW5zaW9ucywgcGFyYW1zLnRvcCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYm91bmRzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGNoYXJ0IGJvdW5kLlxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gZGltZW5zaW9uIGNoYXJ0IGRpbWVuc2lvbi5cbiAgICAgKiBAcmV0dXJucyB7e2RpbWVuc2lvbjoge3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX19IGNoYXJ0IGJvdW5kXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUNoYXJ0Qm91bmQ6IGZ1bmN0aW9uKGRpbWVuc2lvbikge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGltZW5zaW9uOiBkaW1lbnNpb25cbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBsZWdlbmQgYm91bmQuXG4gICAgICogQHBhcmFtIHt7dGl0bGU6IHtoZWlnaHQ6IG51bWJlcn0sIHNlcmllczoge3dpZHRoOiBudW1iZXJ9LCB5ckF4aXM6IHt3aWR0aDogbnVtYmVyfX19IGRpbWVuc2lvbnMgZGltZW5zaW9uc1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5QXhpc1dpZHRoIHlBeGlzIHdpZHRoXG4gICAgICogQHJldHVybnMge3twb3NpdGlvbjoge3RvcDogbnVtYmVyLCBsZWZ0OiBudW1iZXJ9fX0gbGVnZW5kIGJvdW5kXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUxlZ2VuZEJvdW5kOiBmdW5jdGlvbihkaW1lbnNpb25zKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBwb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgIHRvcDogZGltZW5zaW9ucy50aXRsZS5oZWlnaHQsXG4gICAgICAgICAgICAgICAgbGVmdDogZGltZW5zaW9ucy55QXhpcy53aWR0aCArIGRpbWVuc2lvbnMuc2VyaWVzLndpZHRoICsgZGltZW5zaW9ucy55ckF4aXMud2lkdGggKyB0aGlzLmNoYXJ0TGVmdFBhZGRpbmdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBheGVzIGxhYmVsIGluZm8uXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5oYXNBeGVzIHdoZXRoZXIgaGFzIGF4ZXMgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge2FycmF5fSBwYXJhbXMub3B0aW9uQ2hhcnRUeXBlcyBjaGFydCB0eXBlc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IGNvbnZlcnRlZERhdGEgY29udmVydGVkIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gaXNWZXJ0aWNhbCB3aGV0aGVyIHZlcnRpY2FsIG9yIG5vdFxuICAgICAqIEByZXR1cm5zIHt7eEF4aXM6IGFycmF5LCB5QXhpczogYXJyYXl9fSBsYWJlbCBpbmZvXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUF4ZXNMYWJlbEluZm86IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgY2hhcnRUeXBlLCBtYXhWYWx1ZUxhYmVsLCB5TGFiZWxzLCB4TGFiZWxzO1xuXG4gICAgICAgIGlmICghcGFyYW1zLmhhc0F4ZXMpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgY2hhcnRUeXBlID0gcGFyYW1zLm9wdGlvbkNoYXJ0VHlwZXMgJiYgcGFyYW1zLm9wdGlvbkNoYXJ0VHlwZXNbMF0gfHwgJyc7XG5cbiAgICAgICAgLy8gdmFsdWUg7KSRIOqwgOyepSDtgbAg6rCS7J2EIOy2lOy2nO2VmOyXrCB2YWx1ZSBsYWJlbOuhnCDsp4DsoJUgKGxhYmxlIOuEiOu5hCDssrTtgawg7IucIOyCrOyaqSlcbiAgICAgICAgbWF4VmFsdWVMYWJlbCA9IHRoaXMuX2dldFZhbHVlQXhpc01heExhYmVsKHBhcmFtcy5jb252ZXJ0ZWREYXRhLCBjaGFydFR5cGUpO1xuXG4gICAgICAgIC8vIOyEuOuhnOyYteyFmOyXkCDrlLDrnbzshJwgeOy2leqzvCB57LaV7JeQIOyggeyaqe2VoCDroIjsnbTruJQg7KCV67O0IOyngOyglVxuICAgICAgICBpZiAocGFyYW1zLmlzVmVydGljYWwpIHtcbiAgICAgICAgICAgIHlMYWJlbHMgPSBbbWF4VmFsdWVMYWJlbF07XG4gICAgICAgICAgICB4TGFiZWxzID0gcGFyYW1zLmNvbnZlcnRlZERhdGEubGFiZWxzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgeUxhYmVscyA9IHBhcmFtcy5jb252ZXJ0ZWREYXRhLmxhYmVscztcbiAgICAgICAgICAgIHhMYWJlbHMgPSBbbWF4VmFsdWVMYWJlbF07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeEF4aXM6IHhMYWJlbHMsXG4gICAgICAgICAgICB5QXhpczogeUxhYmVsc1xuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGaW5kIHJvdGF0aW9uIGRlZ3JlZS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbGltaXRXaWR0aCBsaW1pdCB3aWR0aFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBsYWJlbFdpZHRoIGxhYmVsIHdpZHRoXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGxhYmVsSGVpZ2h0IGxhYmVsIGhlaWdodFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBjYW5kaWRhdGVzIGluZGV4XG4gICAgICogQHJldHVybnMge251bWJlcn0gcm90YXRpb24gZGVncmVlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZmluZFJvdGF0aW9uRGVncmVlOiBmdW5jdGlvbihsaW1pdFdpZHRoLCBsYWJlbFdpZHRoLCBsYWJlbEhlaWdodCkge1xuICAgICAgICB2YXIgZm91bmREZWdyZWUsXG4gICAgICAgICAgICBoYWxmV2lkdGggPSBsYWJlbFdpZHRoIC8gMixcbiAgICAgICAgICAgIGhhbGZIZWlnaHQgPSBsYWJlbEhlaWdodCAvIDI7XG5cbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaEFycmF5KGNoYXJ0Q29uc3QuREVHUkVFX0NBTkRJREFURVMsIGZ1bmN0aW9uKGRlZ3JlZSkge1xuICAgICAgICAgICAgdmFyIGNvbXBhcmVXaWR0aCA9IChjYWxjdWxhdG9yLmNhbGN1bGF0ZUFkamFjZW50KGRlZ3JlZSwgaGFsZldpZHRoKSArIGNhbGN1bGF0b3IuY2FsY3VsYXRlQWRqYWNlbnQoY2hhcnRDb25zdC5BTkdMRV85MCAtIGRlZ3JlZSwgaGFsZkhlaWdodCkpICogMjtcbiAgICAgICAgICAgIGZvdW5kRGVncmVlID0gZGVncmVlO1xuICAgICAgICAgICAgaWYgKGNvbXBhcmVXaWR0aCA8PSBsaW1pdFdpZHRoICsgY2hhcnRDb25zdC5YQVhJU19MQUJFTF9DT01QQVJFX01BUkdJTikge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGZvdW5kRGVncmVlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHJvdGF0aW9uIGluZm8gYWJvdXQgaG9yaXpvbnRhbCBsYWJlbC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc2VyaWVzV2lkdGggc2VyaWVzIGFyZWEgd2lkdGhcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBsYWJlbHMgYXhpcyBsYWJlbHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgYXhpcyBsYWJlbCB0aGVtZVxuICAgICAqIEByZXR1cm5zIHs/b2JqZWN0fSByb3RhdGlvbiBpbmZvXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUhvcml6b250YWxMYWJlbFJvdGF0aW9uSW5mbzogZnVuY3Rpb24oc2VyaWVzV2lkdGgsIGxhYmVscywgdGhlbWUpIHtcbiAgICAgICAgdmFyIG1heExhYmVsV2lkdGggPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxzTWF4V2lkdGgobGFiZWxzLCB0aGVtZSksXG4gICAgICAgICAgICBsaW1pdFdpZHRoID0gc2VyaWVzV2lkdGggLyBsYWJlbHMubGVuZ3RoIC0gY2hhcnRDb25zdC5YQVhJU19MQUJFTF9HVVRURVIsXG4gICAgICAgICAgICBkZWdyZWUsIGxhYmVsSGVpZ2h0O1xuXG4gICAgICAgIGlmIChtYXhMYWJlbFdpZHRoIDw9IGxpbWl0V2lkdGgpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgbGFiZWxIZWlnaHQgPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxzTWF4SGVpZ2h0KGxhYmVscywgdGhlbWUpO1xuICAgICAgICBkZWdyZWUgPSB0aGlzLl9maW5kUm90YXRpb25EZWdyZWUobGltaXRXaWR0aCwgbWF4TGFiZWxXaWR0aCwgbGFiZWxIZWlnaHQpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBtYXhMYWJlbFdpZHRoOiBtYXhMYWJlbFdpZHRoLFxuICAgICAgICAgICAgbGFiZWxIZWlnaHQ6IGxhYmVsSGVpZ2h0LFxuICAgICAgICAgICAgZGVncmVlOiBkZWdyZWVcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gY2FsY3VsYXRlIG92ZXJmbG93IHBvc2l0aW9uIGxlZnQuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHlBeGlzV2lkdGggeUF4aXMgd2lkdGhcbiAgICAgKiBAcGFyYW0ge3tkZWdyZWU6IG51bWJlciwgbGFiZWxIZWlnaHQ6IG51bWJlcn19IHJvdGF0aW9uSW5mbyByb3RhdGlvbiBpbmZvXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZpcnN0TGFiZWwgZmlyc3RMYWJlbFxuICAgICAqIEBwYXJhbSB7b2JlamN0fSB0aGVtZSBsYWJlbCB0aGVtZVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IG92ZXJmbG93IHBvc2l0aW9uIGxlZnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jYWxjdWxhdGVPdmVyZmxvd0xlZnQ6IGZ1bmN0aW9uKHlBeGlzV2lkdGgsIHJvdGF0aW9uSW5mbywgZmlyc3RMYWJlbCwgdGhlbWUpIHtcbiAgICAgICAgdmFyIGRlZ3JlZSA9IHJvdGF0aW9uSW5mby5kZWdyZWUsXG4gICAgICAgICAgICBsYWJlbEhlaWdodCA9IHJvdGF0aW9uSW5mby5sYWJlbEhlaWdodCxcbiAgICAgICAgICAgIGZpcnN0TGFiZWxXaWR0aCA9IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbFdpZHRoKGZpcnN0TGFiZWwsIHRoZW1lKSxcbiAgICAgICAgICAgIG5ld0xhYmVsV2lkdGggPSAoY2FsY3VsYXRvci5jYWxjdWxhdGVBZGphY2VudChkZWdyZWUsIGZpcnN0TGFiZWxXaWR0aCAvIDIpICsgY2FsY3VsYXRvci5jYWxjdWxhdGVBZGphY2VudChjaGFydENvbnN0LkFOR0xFXzkwIC0gZGVncmVlLCBsYWJlbEhlaWdodCAvIDIpKSAqIDIsXG4gICAgICAgICAgICBkaWZmTGVmdCA9IG5ld0xhYmVsV2lkdGggLSB5QXhpc1dpZHRoO1xuICAgICAgICByZXR1cm4gZGlmZkxlZnQ7XG4gICAgfSxcblxuXG4gICAgLyoqXG4gICAgICogVG8gY2FsY3VsYXRlIGhlaWdodCBvZiB4QXhpcy5cbiAgICAgKiBAcGFyYW0ge3tkZWdyZWU6IG51bWJlciwgbWF4TGFiZWxXaWR0aDogbnVtYmVyLCBsYWJlbEhlaWdodDogbnVtYmVyfX0gcm90YXRpb25JbmZvIHJvdGF0aW9uIGluZm9cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSB4QXhpcyBoZWlnaHRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jYWxjdWxhdGVYQXhpc0hlaWdodDogZnVuY3Rpb24ocm90YXRpb25JbmZvKSB7XG4gICAgICAgIHZhciBkZWdyZWUgPSByb3RhdGlvbkluZm8uZGVncmVlLFxuICAgICAgICAgICAgbWF4TGFiZWxXaWR0aCA9IHJvdGF0aW9uSW5mby5tYXhMYWJlbFdpZHRoLFxuICAgICAgICAgICAgbGFiZWxIZWlnaHQgPSByb3RhdGlvbkluZm8ubGFiZWxIZWlnaHQsXG4gICAgICAgICAgICBheGlzSGVpZ2h0ID0gKGNhbGN1bGF0b3IuY2FsY3VsYXRlT3Bwb3NpdGUoZGVncmVlLCBtYXhMYWJlbFdpZHRoIC8gMikgKyBjYWxjdWxhdG9yLmNhbGN1bGF0ZU9wcG9zaXRlKGNoYXJ0Q29uc3QuQU5HTEVfOTAgLSBkZWdyZWUsIGxhYmVsSGVpZ2h0IC8gMikpICogMjtcbiAgICAgICAgcmV0dXJuIGF4aXNIZWlnaHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIGNhbGN1bGF0ZSBoZWlnaHQgZGlmZmVyZW5jZSBiZXR3ZWVuIG9yaWdpbiBsYWJlbCBhbmQgcm90YXRpb24gbGFiZWwuXG4gICAgICogQHBhcmFtIHt7ZGVncmVlOiBudW1iZXIsIG1heExhYmVsV2lkdGg6IG51bWJlciwgbGFiZWxIZWlnaHQ6IG51bWJlcn19IHJvdGF0aW9uSW5mbyByb3RhdGlvbiBpbmZvXG4gICAgICogQHJldHVybnMge251bWJlcn0gaGVpZ2h0IGRpZmZlcmVuY2VcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jYWxjdWxhdGVIZWlnaHREaWZmZXJlbmNlOiBmdW5jdGlvbihyb3RhdGlvbkluZm8pIHtcbiAgICAgICAgdmFyIHhBeGlzSGVpZ2h0ID0gdGhpcy5fY2FsY3VsYXRlWEF4aXNIZWlnaHQocm90YXRpb25JbmZvKTtcbiAgICAgICAgcmV0dXJuIHhBeGlzSGVpZ2h0IC0gcm90YXRpb25JbmZvLmxhYmVsSGVpZ2h0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgZGVncmVlIG9mIHJvdGF0aW9uSW5mby5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc2VyaWVzV2lkdGggc2VyaWVzIHdpZHRoXG4gICAgICogQHBhcmFtIHt7ZGVncmVlOiBudW1iZXIsIG1heExhYmVsV2lkdGg6IG51bWJlciwgbGFiZWxIZWlnaHQ6IG51bWJlcn19IHJvdGF0aW9uSW5mbyByb3RhdGlvbiBpbmZvXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGxhYmVsTGVuZ3RoIGxhYmVsTGVuZ3RoXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG92ZXJmbG93TGVmdCBvdmVyZmxvdyBsZWZ0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfdXBkYXRlRGVncmVlOiBmdW5jdGlvbihzZXJpZXNXaWR0aCwgcm90YXRpb25JbmZvLCBsYWJlbExlbmd0aCwgb3ZlcmZsb3dMZWZ0KSB7XG4gICAgICAgIHZhciBsaW1pdFdpZHRoLCBuZXdEZWdyZWU7XG4gICAgICAgIGlmIChvdmVyZmxvd0xlZnQgPiAwKSB7XG4gICAgICAgICAgICBsaW1pdFdpZHRoID0gc2VyaWVzV2lkdGggLyBsYWJlbExlbmd0aCArIGNoYXJ0Q29uc3QuWEFYSVNfTEFCRUxfR1VUVEVSO1xuICAgICAgICAgICAgbmV3RGVncmVlID0gdGhpcy5fZmluZFJvdGF0aW9uRGVncmVlKGxpbWl0V2lkdGgsIHJvdGF0aW9uSW5mby5tYXhMYWJlbFdpZHRoLCByb3RhdGlvbkluZm8ubGFiZWxIZWlnaHQpO1xuICAgICAgICAgICAgcm90YXRpb25JbmZvLmRlZ3JlZSA9IG5ld0RlZ3JlZTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgd2lkdGggb2YgZGltZW50aW9zLlxuICAgICAqIEBwYXJhbSB7e3Bsb3Q6IHt3aWR0aDogbnVtYmVyfSwgc2VyaWVzOiB7d2lkdGg6IG51bWJlcn0sIHhBeGlzOiB7d2lkdGg6IG51bWJlcn19fSBkaW1lbnNpb25zIGRpbWVuc2lvbnNcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gb3ZlcmZsb3dMZWZ0IG92ZXJmbG93IGxlZnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF91cGRhdGVEaW1lbnNpb25zV2lkdGg6IGZ1bmN0aW9uKGRpbWVuc2lvbnMsIG92ZXJmbG93TGVmdCkge1xuICAgICAgICBpZiAob3ZlcmZsb3dMZWZ0ID4gMCkge1xuICAgICAgICAgICAgdGhpcy5jaGFydExlZnRQYWRkaW5nICs9IG92ZXJmbG93TGVmdDtcbiAgICAgICAgICAgIGRpbWVuc2lvbnMucGxvdC53aWR0aCAtPSBvdmVyZmxvd0xlZnQ7XG4gICAgICAgICAgICBkaW1lbnNpb25zLnNlcmllcy53aWR0aCAtPSBvdmVyZmxvd0xlZnQ7XG4gICAgICAgICAgICBkaW1lbnNpb25zLnhBeGlzLndpZHRoIC09IG92ZXJmbG93TGVmdDtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgaGVpZ2h0IG9mIGRpbWVuc2lvbnMuXG4gICAgICogQHBhcmFtIHt7cGxvdDoge2hlaWdodDogbnVtYmVyfSwgc2VyaWVzOiB7aGVpZ2h0OiBudW1iZXJ9LCB4QXhpczoge2hlaWdodDogbnVtYmVyfX19IGRpbWVuc2lvbnMgZGltZW5zaW9uc1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBkaWZmSGVpZ2h0IGRpZmYgaGVpZ2h0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfdXBkYXRlRGltZW5zaW9uc0hlaWdodDogZnVuY3Rpb24oZGltZW5zaW9ucywgZGlmZkhlaWdodCkge1xuICAgICAgICBkaW1lbnNpb25zLnBsb3QuaGVpZ2h0IC09IGRpZmZIZWlnaHQ7XG4gICAgICAgIGRpbWVuc2lvbnMuc2VyaWVzLmhlaWdodCAtPSBkaWZmSGVpZ2h0O1xuICAgICAgICBkaW1lbnNpb25zLnhBeGlzLmhlaWdodCArPSBkaWZmSGVpZ2h0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgZGltZW5zaW9ucyBhbmQgZGVncmVlLlxuICAgICAqIEBwYXJhbSB7e3Bsb3Q6IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn0sIHNlcmllczoge3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfSwgeEF4aXM6IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19fSBkaW1lbnNpb25zIGRpbWVuc2lvbnNcbiAgICAgKiBAcGFyYW0ge3tkZWdyZWU6IG51bWJlciwgbWF4TGFiZWxXaWR0aDogbnVtYmVyLCBsYWJlbEhlaWdodDogbnVtYmVyfX0gcm90YXRpb25JbmZvIHJvdGF0aW9uIGluZm9cbiAgICAgKiBAcGFyYW0ge2FycmF5fSBsYWJlbHMgbGFiZWxzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIHRoZW1lXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfdXBkYXRlRGltZW5zaW9uc0FuZERlZ3JlZTogZnVuY3Rpb24oZGltZW5zaW9ucywgcm90YXRpb25JbmZvLCBsYWJlbHMsIHRoZW1lKSB7XG4gICAgICAgIHZhciBvdmVyZmxvd0xlZnQsIGRpZmZIZWlnaHQ7XG4gICAgICAgIGlmICghcm90YXRpb25JbmZvKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgb3ZlcmZsb3dMZWZ0ID0gdGhpcy5fY2FsY3VsYXRlT3ZlcmZsb3dMZWZ0KGRpbWVuc2lvbnMueUF4aXMud2lkdGgsIHJvdGF0aW9uSW5mbywgbGFiZWxzWzBdLCB0aGVtZSk7XG4gICAgICAgIHRoaXMuX3VwZGF0ZURpbWVuc2lvbnNXaWR0aChkaW1lbnNpb25zLCBvdmVyZmxvd0xlZnQpO1xuICAgICAgICB0aGlzLl91cGRhdGVEZWdyZWUoZGltZW5zaW9ucy5zZXJpZXMud2lkdGgsIHJvdGF0aW9uSW5mbywgbGFiZWxzLmxlbmd0aCwgb3ZlcmZsb3dMZWZ0KTtcbiAgICAgICAgZGlmZkhlaWdodCA9IHRoaXMuX2NhbGN1bGF0ZUhlaWdodERpZmZlcmVuY2Uocm90YXRpb25JbmZvKTtcbiAgICAgICAgdGhpcy5fdXBkYXRlRGltZW5zaW9uc0hlaWdodChkaW1lbnNpb25zLCBkaWZmSGVpZ2h0KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBib3VuZHMgYWJvdXQgY2hhcnQgY29tcG9uZW50cy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmJvdW5kc01ha2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmNvbnZlcnRlZERhdGEgY29udmVydGVkIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgY2hhcnQgdGhlbWVcbiAgICAgKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gcGFyYW1zLmlzVmVydGljYWwgd2hldGhlciB2ZXJ0aWNhbCBvciBub3RcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMub3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5oYXNBeGVzIHdoZXRoZXIgaGFzIGF4ZXMgYXJlYSBvciBub3RcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXl9IHBhcmFtcy5vcHRpb25DaGFydFR5cGVzIHkgYXhpcyBvcHRpb24gY2hhcnQgdHlwZXNcbiAgICAgKiBAcmV0dXJucyB7e1xuICAgICAqICAgcGxvdDoge1xuICAgICAqICAgICBkaW1lbnNpb246IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn0sXG4gICAgICogICAgIHBvc2l0aW9uOiB7dG9wOiBudW1iZXIsIHJpZ2h0OiBudW1iZXJ9XG4gICAgICogICB9LFxuICAgICAqICAgeUF4aXM6IHtcbiAgICAgKiAgICAgZGltZW5zaW9uOiB7d2lkdGg6IChudW1iZXIpLCBoZWlnaHQ6IG51bWJlcn0sXG4gICAgICogICAgIHBvc2l0aW9uOiB7dG9wOiBudW1iZXJ9XG4gICAgICogICB9LFxuICAgICAqICAgeEF4aXM6IHtcbiAgICAgKiAgICAgZGltZW5zaW9uOiB7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiAobnVtYmVyKX0sXG4gICAgICogICAgIHBvc2l0aW9uOiB7cmlnaHQ6IG51bWJlcn1cbiAgICAgKiAgIH0sXG4gICAgICogICBzZXJpZXM6IHtcbiAgICAgKiAgICAgZGltZW5zaW9uOiB7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9LFxuICAgICAqICAgICBwb3NpdGlvbjoge3RvcDogbnVtYmVyLCByaWdodDogbnVtYmVyfVxuICAgICAqICAgfSxcbiAgICAgKiAgIGxlZ2VuZDoge1xuICAgICAqICAgICBwb3NpdGlvbjoge3RvcDogbnVtYmVyfVxuICAgICAqICAgfSxcbiAgICAgKiAgIHRvb2x0aXA6IHtcbiAgICAgKiAgICAgZGltZW5zaW9uOiB7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9LFxuICAgICAqICAgICBwb3NpdGlvbjoge3RvcDogbnVtYmVyLCBsZWZ0OiBudW1iZXJ9XG4gICAgICogICB9XG4gICAgICogfX0gYm91bmRzXG4gICAgICovXG4gICAgbWFrZTogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBheGVzTGFiZWxJbmZvID0gdGhpcy5fbWFrZUF4ZXNMYWJlbEluZm8ocGFyYW1zKSxcbiAgICAgICAgICAgIGRpbWVuc2lvbnMgPSB0aGlzLl9nZXRDb21wb25lbnRzRGltZW5zaW9ucyh0dWkudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgICAgIGF4ZXNMYWJlbEluZm86IGF4ZXNMYWJlbEluZm9cbiAgICAgICAgICAgIH0sIHBhcmFtcykpLFxuICAgICAgICAgICAgcm90YXRpb25JbmZvLCB0b3AsIGxlZnQsIHNlcmllc0JvdW5kLCBheGVzQm91bmRzLCBib3VuZHM7XG5cbiAgICAgICAgdGhpcy5jaGFydExlZnRQYWRkaW5nID0gY2hhcnRDb25zdC5DSEFSVF9QQURESU5HO1xuICAgICAgICBpZiAocGFyYW1zLmhhc0F4ZXMpIHtcbiAgICAgICAgICAgIHJvdGF0aW9uSW5mbyA9IHRoaXMuX21ha2VIb3Jpem9udGFsTGFiZWxSb3RhdGlvbkluZm8oZGltZW5zaW9ucy5zZXJpZXMud2lkdGgsIGF4ZXNMYWJlbEluZm8ueEF4aXMsIHBhcmFtcy50aGVtZS5sYWJlbCk7XG4gICAgICAgICAgICB0aGlzLl91cGRhdGVEaW1lbnNpb25zQW5kRGVncmVlKGRpbWVuc2lvbnMsIHJvdGF0aW9uSW5mbywgYXhlc0xhYmVsSW5mby54QXhpcywgcGFyYW1zLnRoZW1lLmxhYmVsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRvcCA9IGRpbWVuc2lvbnMudGl0bGUuaGVpZ2h0ICsgY2hhcnRDb25zdC5DSEFSVF9QQURESU5HO1xuICAgICAgICBsZWZ0ID0gZGltZW5zaW9ucy55QXhpcy53aWR0aCArIHRoaXMuY2hhcnRMZWZ0UGFkZGluZztcbiAgICAgICAgc2VyaWVzQm91bmQgPSB0aGlzLl9tYWtlQmFzaWNCb3VuZChkaW1lbnNpb25zLnNlcmllcywgdG9wLCBsZWZ0KTtcblxuICAgICAgICBheGVzQm91bmRzID0gdGhpcy5fbWFrZUF4ZXNCb3VuZHMoe1xuICAgICAgICAgICAgaGFzQXhlczogcGFyYW1zLmhhc0F4ZXMsXG4gICAgICAgICAgICByb3RhdGlvbkluZm86IHJvdGF0aW9uSW5mbyxcbiAgICAgICAgICAgIG9wdGlvbkNoYXJ0VHlwZXM6IHBhcmFtcy5vcHRpb25DaGFydFR5cGVzLFxuICAgICAgICAgICAgZGltZW5zaW9uczogZGltZW5zaW9ucyxcbiAgICAgICAgICAgIHRvcDogdG9wLFxuICAgICAgICAgICAgbGVmdDogbGVmdFxuICAgICAgICB9KTtcbiAgICAgICAgYm91bmRzID0gdHVpLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgIGNoYXJ0OiB0aGlzLl9tYWtlQ2hhcnRCb3VuZChkaW1lbnNpb25zLmNoYXJ0KSxcbiAgICAgICAgICAgIHNlcmllczogc2VyaWVzQm91bmQsXG4gICAgICAgICAgICBsZWdlbmQ6IHRoaXMuX21ha2VMZWdlbmRCb3VuZChkaW1lbnNpb25zKSxcbiAgICAgICAgICAgIHRvb2x0aXA6IHRoaXMuX21ha2VCYXNpY0JvdW5kKGRpbWVuc2lvbnMuc2VyaWVzLCB0b3AsIGxlZnQgLSBjaGFydENvbnN0LlNFUklFU19FWFBBTkRfU0laRSksXG4gICAgICAgICAgICBldmVudEhhbmRsZUxheWVyOiBzZXJpZXNCb3VuZFxuICAgICAgICB9LCBheGVzQm91bmRzKTtcbiAgICAgICAgcmV0dXJuIGJvdW5kcztcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGJvdW5kc01ha2VyO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IGNhbGN1bGF0b3IuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBjaGFydENvbnN0ID0gcmVxdWlyZSgnLi4vY29uc3QnKTtcblxuLyoqXG4gKiBDYWxjdWxhdG9yLlxuICogQG1vZHVsZSBjYWxjdWxhdG9yXG4gKi9cbnZhciBjYWxjdWxhdG9yID0ge1xuICAgIC8qKlxuICAgICAqIFRvIGNhbGN1bGF0ZSBzY2FsZSBmcm9tIGNoYXJ0IG1pbiwgbWF4IGRhdGEuXG4gICAgICogIC0gaHR0cDovL3BlbHRpZXJ0ZWNoLmNvbS9ob3ctZXhjZWwtY2FsY3VsYXRlcy1hdXRvbWF0aWMtY2hhcnQtYXhpcy1saW1pdHMvXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpjYWxjdWxhdG9yXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1pbiBtaW4gbWluaW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWF4IG1heCBtYXhpbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB0aWNrQ291bnQgdGljayBjb3VudFxuICAgICAqIEByZXR1cm5zIHt7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX0gc2NhbGUgYXhpcyBzY2FsZVxuICAgICAqL1xuICAgIGNhbGN1bGF0ZVNjYWxlOiBmdW5jdGlvbihtaW4sIG1heCkge1xuICAgICAgICB2YXIgc2F2ZU1pbiA9IDAsXG4gICAgICAgICAgICBzY2FsZSA9IHt9LFxuICAgICAgICAgICAgaW9kVmFsdWU7IC8vIGluY3JlYXNlIG9yIGRlY3JlYXNlIHZhbHVlO1xuXG4gICAgICAgIGlmIChtaW4gPCAwKSB7XG4gICAgICAgICAgICBzYXZlTWluID0gbWluO1xuICAgICAgICAgICAgbWF4IC09IG1pbjtcbiAgICAgICAgICAgIG1pbiA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICBpb2RWYWx1ZSA9IChtYXggLSBtaW4pIC8gMjA7XG4gICAgICAgIHNjYWxlLm1heCA9IG1heCArIGlvZFZhbHVlICsgc2F2ZU1pbjtcblxuICAgICAgICBpZiAobWF4IC8gNiA+IG1pbikge1xuICAgICAgICAgICAgc2NhbGUubWluID0gMCArIHNhdmVNaW47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzY2FsZS5taW4gPSBtaW4gLSBpb2RWYWx1ZSArIHNhdmVNaW47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNjYWxlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBub3JtYWxpemUgbnVtYmVyLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Y2FsY3VsYXRvclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSB0YXJnZXQgdmFsdWVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBub3JtYWxpemVkIG51bWJlclxuICAgICAqL1xuICAgIG5vcm1hbGl6ZUF4aXNOdW1iZXI6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHZhciBzdGFuZGFyZCA9IDAsXG4gICAgICAgICAgICBmbGFnID0gMSxcbiAgICAgICAgICAgIG5vcm1hbGl6ZWQsIG1vZDtcblxuICAgICAgICBpZiAodmFsdWUgPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfSBlbHNlIGlmICh2YWx1ZSA8IDApIHtcbiAgICAgICAgICAgIGZsYWcgPSAtMTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhbHVlICo9IGZsYWc7XG5cbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaEFycmF5KGNoYXJ0Q29uc3QuQVhJU19TVEFOREFSRF9NVUxUSVBMRV9OVU1TLCBmdW5jdGlvbihudW0pIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA8IG51bSkge1xuICAgICAgICAgICAgICAgIGlmIChudW0gPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YW5kYXJkID0gbnVtO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG51bSA9PT0gMTApIHtcbiAgICAgICAgICAgICAgICBzdGFuZGFyZCA9IDEwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoc3RhbmRhcmQgPCAxKSB7XG4gICAgICAgICAgICBub3JtYWxpemVkID0gdGhpcy5ub3JtYWxpemVBeGlzTnVtYmVyKHZhbHVlICogMTApICogMC4xO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbW9kID0gdHVpLnV0aWwubW9kKHZhbHVlLCBzdGFuZGFyZCk7XG4gICAgICAgICAgICBub3JtYWxpemVkID0gdHVpLnV0aWwuYWRkaXRpb24odmFsdWUsIChtb2QgPiAwID8gc3RhbmRhcmQgLSBtb2QgOiAwKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbm9ybWFsaXplZCAqPSBmbGFnO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHRpY2sgcG9zaXRpb25zIG9mIHBpeGVsIHR5cGUuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpjYWxjdWxhdG9yXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHNpemUgYXJlYSB3aWR0aCBvciBoZWlnaHRcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gY291bnQgdGljayBjb3VudFxuICAgICAqIEByZXR1cm5zIHthcnJheS48bnVtYmVyPn0gcG9zaXRpb25zXG4gICAgICovXG4gICAgbWFrZVRpY2tQaXhlbFBvc2l0aW9uczogZnVuY3Rpb24oc2l6ZSwgY291bnQpIHtcbiAgICAgICAgdmFyIHBvc2l0aW9ucyA9IFtdLFxuICAgICAgICAgICAgcHhTY2FsZSwgcHhTdGVwO1xuXG4gICAgICAgIGlmIChjb3VudCA+IDApIHtcbiAgICAgICAgICAgIHB4U2NhbGUgPSB7bWluOiAwLCBtYXg6IHNpemUgLSAxfTtcbiAgICAgICAgICAgIHB4U3RlcCA9IHRoaXMuZ2V0U2NhbGVTdGVwKHB4U2NhbGUsIGNvdW50KTtcbiAgICAgICAgICAgIHBvc2l0aW9ucyA9IHR1aS51dGlsLm1hcCh0dWkudXRpbC5yYW5nZSgwLCBzaXplLCBweFN0ZXApLCBmdW5jdGlvbihwb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLnJvdW5kKHBvc2l0aW9uKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcG9zaXRpb25zW3Bvc2l0aW9ucy5sZW5ndGggLSAxXSA9IHNpemUgLSAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwb3NpdGlvbnM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgbGFiZWxzIGZyb20gc2NhbGUuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpjYWxjdWxhdG9yXG4gICAgICogQHBhcmFtIHt7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX0gc2NhbGUgYXhpcyBzY2FsZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdGVwIHN0ZXAgYmV0d2VlbiBtYXggYW5kIG1pblxuICAgICAqIEByZXR1cm5zIHtzdHJpbmdbXX0gbGFiZWxzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBtYWtlTGFiZWxzRnJvbVNjYWxlOiBmdW5jdGlvbihzY2FsZSwgc3RlcCkge1xuICAgICAgICB2YXIgbXVsdGlwbGVOdW0gPSB0dWkudXRpbC5maW5kTXVsdGlwbGVOdW0oc3RlcCksXG4gICAgICAgICAgICBtaW4gPSBzY2FsZS5taW4gKiBtdWx0aXBsZU51bSxcbiAgICAgICAgICAgIG1heCA9IHNjYWxlLm1heCAqIG11bHRpcGxlTnVtLFxuICAgICAgICAgICAgbGFiZWxzID0gdHVpLnV0aWwucmFuZ2UobWluLCBtYXggKyAxLCBzdGVwICogbXVsdGlwbGVOdW0pO1xuICAgICAgICBsYWJlbHMgPSB0dWkudXRpbC5tYXAobGFiZWxzLCBmdW5jdGlvbihsYWJlbCkge1xuICAgICAgICAgICAgcmV0dXJuIGxhYmVsIC8gbXVsdGlwbGVOdW07XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gbGFiZWxzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgc2NhbGUgc3RlcC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmNhbGN1bGF0b3JcbiAgICAgKiBAcGFyYW0ge3ttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fSBzY2FsZSBheGlzIHNjYWxlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGNvdW50IHZhbHVlIGNvdW50XG4gICAgICogQHJldHVybnMge251bWJlcn0gc2NhbGUgc3RlcFxuICAgICAqL1xuICAgIGdldFNjYWxlU3RlcDogZnVuY3Rpb24oc2NhbGUsIGNvdW50KSB7XG4gICAgICAgIHJldHVybiAoc2NhbGUubWF4IC0gc2NhbGUubWluKSAvIChjb3VudCAtIDEpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBjYWxjdWxhdGUgYWRqYWNlbnQuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGRlZ3JlZSBkZWdyZWVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaHlwb3RlbnVzZSBoeXBvdGVudXNlXG4gICAgICogQHJldHVybnMge251bWJlcn0gYWRqYWNlbnRcbiAgICAgKlxuICAgICAqICAgSCA6IEh5cG90ZW51c2VcbiAgICAgKiAgIEEgOiBBZGphY2VudFxuICAgICAqICAgTyA6IE9wcG9zaXRlXG4gICAgICogICBEIDogRGVncmVlXG4gICAgICpcbiAgICAgKiAgICAgICAgL3xcbiAgICAgKiAgICAgICAvIHxcbiAgICAgKiAgICBIIC8gIHwgT1xuICAgICAqICAgICAvICAgfFxuICAgICAqICAgIC9cXCBEIHxcbiAgICAgKiAgICAtLS0tLVxuICAgICAqICAgICAgIEFcbiAgICAgKi9cbiAgICBjYWxjdWxhdGVBZGphY2VudDogZnVuY3Rpb24oZGVncmVlLCBoeXBvdGVudXNlKSB7XG4gICAgICAgIHJldHVybiBNYXRoLmNvcyhkZWdyZWUgKiBjaGFydENvbnN0LlJBRCkgKiBoeXBvdGVudXNlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBjYWxjdWxhdGUgb3Bwb3NpdGUuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGRlZ3JlZSBkZWdyZWVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaHlwb3RlbnVzZSBoeXBvdGVudXNlXG4gICAgICogQHJldHVybnMge251bWJlcn0gb3Bwb3NpdGVcbiAgICAgKi9cbiAgICBjYWxjdWxhdGVPcHBvc2l0ZTogZnVuY3Rpb24oZGVncmVlLCBoeXBvdGVudXNlKSB7XG4gICAgICAgIHJldHVybiBNYXRoLnNpbihkZWdyZWUgKiBjaGFydENvbnN0LlJBRCkgKiBoeXBvdGVudXNlO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gY2FsY3VsYXRvcjtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBEYXRhIGNvbnZlcnRlci5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGNvbmNhdCA9IEFycmF5LnByb3RvdHlwZS5jb25jYXQ7XG5cbi8qKlxuICogRGF0YSBjb252ZXJ0ZXIuXG4gKiBAbW9kdWxlIGRhdGFDb252ZXJ0ZXJcbiAqL1xudmFyIGRhdGFDb252ZXJ0ZXIgPSB7XG4gICAgLyoqXG4gICAgICogQ29udmVydCB1c2VyIGRhdGEuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXk+fSB1c2VyRGF0YSB1c2VyIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY2hhcnRPcHRpb25zIGNoYXJ0IG9wdGlvblxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjaGFydFR5cGUgY2hhcnQgdHlwZVxuICAgICAqIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IHNlcmllc0NoYXJ0VHlwZXMgY2hhcnQgdHlwZXNcbiAgICAgKiBAcmV0dXJucyB7e1xuICAgICAqICAgICAgbGFiZWxzOiBhcnJheS48c3RyaW5nPixcbiAgICAgKiAgICAgIHZhbHVlczogYXJyYXkuPG51bWJlcj4sXG4gICAgICogICAgICBsZWdlbmRMYWJlbHM6IGFycmF5LjxzdHJpbmc+LFxuICAgICAqICAgICAgZm9ybWF0RnVuY3Rpb25zOiBhcnJheS48ZnVuY3Rpb24+LFxuICAgICAqICAgICAgZm9ybWF0dGVkVmFsdWVzOiBhcnJheS48c3RyaW5nPlxuICAgICAqIH19IGNvbnZlcnRlZCBkYXRhXG4gICAgICovXG4gICAgY29udmVydDogZnVuY3Rpb24odXNlckRhdGEsIGNoYXJ0T3B0aW9ucywgY2hhcnRUeXBlLCBzZXJpZXNDaGFydFR5cGVzKSB7XG4gICAgICAgIHZhciBsYWJlbHMgPSB1c2VyRGF0YS5jYXRlZ29yaWVzLFxuICAgICAgICAgICAgc2VyaWVzRGF0YSA9IHVzZXJEYXRhLnNlcmllcyxcbiAgICAgICAgICAgIHZhbHVlcyA9IHRoaXMuX3BpY2tWYWx1ZXMoc2VyaWVzRGF0YSksXG4gICAgICAgICAgICBqb2luVmFsdWVzID0gdGhpcy5fam9pblZhbHVlcyh2YWx1ZXMsIHNlcmllc0NoYXJ0VHlwZXMpLFxuICAgICAgICAgICAgbGVnZW5kTGFiZWxzID0gdGhpcy5fcGlja0xlZ2VuZExhYmVscyhzZXJpZXNEYXRhKSxcbiAgICAgICAgICAgIGpvaW5MZWdlbmRMYWJlbHMgPSB0aGlzLl9qb2luTGVnZW5kTGFiZWxzKGxlZ2VuZExhYmVscywgY2hhcnRUeXBlLCBzZXJpZXNDaGFydFR5cGVzKSxcbiAgICAgICAgICAgIGZvcm1hdCA9IGNoYXJ0T3B0aW9ucyAmJiBjaGFydE9wdGlvbnMuZm9ybWF0IHx8ICcnLFxuICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zID0gdGhpcy5fZmluZEZvcm1hdEZ1bmN0aW9ucyhmb3JtYXQpLFxuICAgICAgICAgICAgZm9ybWF0dGVkVmFsdWVzID0gZm9ybWF0ID8gdGhpcy5fZm9ybWF0VmFsdWVzKHZhbHVlcywgZm9ybWF0RnVuY3Rpb25zKSA6IHZhbHVlcyxcbiAgICAgICAgICAgIGpvaW5Gb3JtYXR0ZWRWYWx1ZXMgPSB0aGlzLl9qb2luVmFsdWVzKGZvcm1hdHRlZFZhbHVlcywgc2VyaWVzQ2hhcnRUeXBlcyk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsYWJlbHM6IGxhYmVscyxcbiAgICAgICAgICAgIHZhbHVlczogdmFsdWVzLFxuICAgICAgICAgICAgam9pblZhbHVlczogam9pblZhbHVlcyxcbiAgICAgICAgICAgIGxlZ2VuZExhYmVsczogbGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgam9pbkxlZ2VuZExhYmVsczogam9pbkxlZ2VuZExhYmVscyxcbiAgICAgICAgICAgIGZvcm1hdEZ1bmN0aW9uczogZm9ybWF0RnVuY3Rpb25zLFxuICAgICAgICAgICAgZm9ybWF0dGVkVmFsdWVzOiBmb3JtYXR0ZWRWYWx1ZXMsXG4gICAgICAgICAgICBqb2luRm9ybWF0dGVkVmFsdWVzOiBqb2luRm9ybWF0dGVkVmFsdWVzXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNlcGFyYXRlIGxhYmVsLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5LjxhcnJheT4+fSB1c2VyRGF0YSB1c2VyIGRhdGFcbiAgICAgKiBAcmV0dXJucyB7e2xhYmVsczogKGFycmF5LjxzdHJpbmc+KSwgc291cmNlRGF0YTogYXJyYXkuPGFycmF5LjxhcnJheT4+fX0gcmVzdWx0IGRhdGFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXBhcmF0ZUxhYmVsOiBmdW5jdGlvbih1c2VyRGF0YSkge1xuICAgICAgICB2YXIgbGFiZWxzID0gdXNlckRhdGFbMF0ucG9wKCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsYWJlbHM6IGxhYmVscyxcbiAgICAgICAgICAgIHNvdXJjZURhdGE6IHVzZXJEYXRhXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFBpY2sgdmFsdWUuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHt7bmFtZTogc3RyaW5nLCBkYXRhOiAoYXJyYXkuPG51bWJlcj4gfCBudW1iZXIpfX0gaXRlbXMgaXRlbXNcbiAgICAgKiBAcmV0dXJucyB7YXJyYXl9IHBpY2tlZCB2YWx1ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3BpY2tWYWx1ZTogZnVuY3Rpb24oaXRlbXMpIHtcbiAgICAgICAgcmV0dXJuIHR1aS51dGlsLm1hcChbXS5jb25jYXQoaXRlbXMuZGF0YSksIHBhcnNlRmxvYXQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBQaWNrIHZhbHVlcyBmcm9tIGF4aXMgZGF0YS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheT59IHNlcmllc0RhdGEgc2VyaWVzIGRhdGFcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nW119IHZhbHVlc1xuICAgICAqL1xuICAgIF9waWNrVmFsdWVzOiBmdW5jdGlvbihzZXJpZXNEYXRhKSB7XG4gICAgICAgIHZhciB2YWx1ZXMsIHJlc3VsdDtcbiAgICAgICAgaWYgKHR1aS51dGlsLmlzQXJyYXkoc2VyaWVzRGF0YSkpIHtcbiAgICAgICAgICAgIHZhbHVlcyA9IHR1aS51dGlsLm1hcChzZXJpZXNEYXRhLCB0aGlzLl9waWNrVmFsdWUsIHRoaXMpO1xuICAgICAgICAgICAgcmVzdWx0ID0gdHVpLnV0aWwucGl2b3QodmFsdWVzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHt9O1xuICAgICAgICAgICAgdHVpLnV0aWwuZm9yRWFjaChzZXJpZXNEYXRhLCBmdW5jdGlvbihncm91cFZhbHVlcywgdHlwZSkge1xuICAgICAgICAgICAgICAgIHZhbHVlcyA9IHR1aS51dGlsLm1hcChncm91cFZhbHVlcywgdGhpcy5fcGlja1ZhbHVlLCB0aGlzKTtcbiAgICAgICAgICAgICAgICByZXN1bHRbdHlwZV0gPSB0dWkudXRpbC5waXZvdCh2YWx1ZXMpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSm9pbiB2YWx1ZXMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXk+fSBncm91cFZhbHVlcyB2YWx1ZXNcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBzZXJpZXNDaGFydFR5cGVzIGNoYXJ0IHR5cGVzXG4gICAgICogQHJldHVybnMge2FycmF5LjxudW1iZXI+fSBqb2luIHZhbHVlc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2pvaW5WYWx1ZXM6IGZ1bmN0aW9uKGdyb3VwVmFsdWVzLCBzZXJpZXNDaGFydFR5cGVzKSB7XG4gICAgICAgIHZhciBqb2luVmFsdWVzO1xuXG4gICAgICAgIGlmICghc2VyaWVzQ2hhcnRUeXBlcykge1xuICAgICAgICAgICAgcmV0dXJuIGdyb3VwVmFsdWVzO1xuICAgICAgICB9XG5cbiAgICAgICAgam9pblZhbHVlcyA9IHR1aS51dGlsLm1hcChncm91cFZhbHVlcywgZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWVzO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICBqb2luVmFsdWVzID0gW107XG4gICAgICAgIHR1aS51dGlsLmZvckVhY2hBcnJheShzZXJpZXNDaGFydFR5cGVzLCBmdW5jdGlvbihfY2hhcnRUeXBlKSB7XG4gICAgICAgICAgICB0dWkudXRpbC5mb3JFYWNoKGdyb3VwVmFsdWVzW19jaGFydFR5cGVdLCBmdW5jdGlvbih2YWx1ZXMsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgaWYgKCFqb2luVmFsdWVzW2luZGV4XSkge1xuICAgICAgICAgICAgICAgICAgICBqb2luVmFsdWVzW2luZGV4XSA9IFtdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBqb2luVmFsdWVzW2luZGV4XSA9IGpvaW5WYWx1ZXNbaW5kZXhdLmNvbmNhdCh2YWx1ZXMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBqb2luVmFsdWVzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBQaWNrIGxlZ2VuZCBsYWJlbC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gaXRlbSBpdGVtXG4gICAgICogQHJldHVybnMge3N0cmluZ30gbGFiZWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9waWNrTGVnZW5kTGFiZWw6IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuIGl0ZW0ubmFtZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUGljayBsZWdlbmQgbGFiZWxzIGZyb20gYXhpcyBkYXRhLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gc2VyaWVzRGF0YSBzZXJpZXMgZGF0YVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmdbXX0gbGFiZWxzXG4gICAgICovXG4gICAgX3BpY2tMZWdlbmRMYWJlbHM6IGZ1bmN0aW9uKHNlcmllc0RhdGEpIHtcbiAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgaWYgKHR1aS51dGlsLmlzQXJyYXkoc2VyaWVzRGF0YSkpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHR1aS51dGlsLm1hcChzZXJpZXNEYXRhLCB0aGlzLl9waWNrTGVnZW5kTGFiZWwsIHRoaXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0ID0ge307XG4gICAgICAgICAgICB0dWkudXRpbC5mb3JFYWNoKHNlcmllc0RhdGEsIGZ1bmN0aW9uKGdyb3VwVmFsdWVzLCB0eXBlKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W3R5cGVdID0gdHVpLnV0aWwubWFwKGdyb3VwVmFsdWVzLCB0aGlzLl9waWNrTGVnZW5kTGFiZWwsIHRoaXMpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSm9pbiBsZWdlbmQgbGFiZWxzLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7YXJyYXl9IGxlZ2VuZExhYmVscyBsZWdlbmQgbGFiZWxzXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNoYXJ0VHlwZSBjaGFydCB0eXBlXG4gICAgICogQHBhcmFtIHthcnJheS48c3RyaW5nPn0gc2VyaWVzQ2hhcnRUeXBlcyBjaGFydCB0eXBlc1xuICAgICAqIEByZXR1cm5zIHthcnJheX0gbGFiZWxzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfam9pbkxlZ2VuZExhYmVsczogZnVuY3Rpb24obGVnZW5kTGFiZWxzLCBjaGFydFR5cGUsIHNlcmllc0NoYXJ0VHlwZXMpIHtcbiAgICAgICAgdmFyIGpvaW5MYWJlbHM7XG4gICAgICAgIGlmICghc2VyaWVzQ2hhcnRUeXBlcyB8fCAhc2VyaWVzQ2hhcnRUeXBlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGpvaW5MYWJlbHMgPSB0dWkudXRpbC5tYXAobGVnZW5kTGFiZWxzLCBmdW5jdGlvbihsYWJlbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0VHlwZTogY2hhcnRUeXBlLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogbGFiZWxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBqb2luTGFiZWxzID0gW107XG4gICAgICAgICAgICB0dWkudXRpbC5mb3JFYWNoQXJyYXkoc2VyaWVzQ2hhcnRUeXBlcywgZnVuY3Rpb24oX2NoYXJ0VHlwZSkge1xuICAgICAgICAgICAgICAgIHZhciBsYWJlbHMgPSB0dWkudXRpbC5tYXAobGVnZW5kTGFiZWxzW19jaGFydFR5cGVdLCBmdW5jdGlvbihsYWJlbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnRUeXBlOiBfY2hhcnRUeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGxhYmVsXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgam9pbkxhYmVscyA9IGpvaW5MYWJlbHMuY29uY2F0KGxhYmVscyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gam9pbkxhYmVscztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gZm9ybWF0IGdyb3VwIHZhbHVlcy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheT59IGdyb3VwVmFsdWVzIGdyb3VwIHZhbHVlc1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb25bXX0gZm9ybWF0RnVuY3Rpb25zIGZvcm1hdCBmdW5jdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nW119IGZvcm1hdHRlZCB2YWx1ZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9mb3JtYXRHcm91cFZhbHVlczogZnVuY3Rpb24oZ3JvdXBWYWx1ZXMsIGZvcm1hdEZ1bmN0aW9ucykge1xuICAgICAgICByZXR1cm4gdHVpLnV0aWwubWFwKGdyb3VwVmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgICAgIHJldHVybiB0dWkudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHZhciBmbnMgPSBbdmFsdWVdLmNvbmNhdChmb3JtYXRGdW5jdGlvbnMpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0dWkudXRpbC5yZWR1Y2UoZm5zLCBmdW5jdGlvbihzdG9yZWQsIGZuKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmbihzdG9yZWQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBmb3JtYXQgY29udmVydGVkIHZhbHVlcy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheT59IGNoYXJ0VmFsdWVzIGNoYXJ0IHZhbHVlc1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb25bXX0gZm9ybWF0RnVuY3Rpb25zIGZvcm1hdCBmdW5jdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nW119IGZvcm1hdHRlZCB2YWx1ZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9mb3JtYXRWYWx1ZXM6IGZ1bmN0aW9uKGNoYXJ0VmFsdWVzLCBmb3JtYXRGdW5jdGlvbnMpIHtcbiAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgaWYgKHR1aS51dGlsLmlzQXJyYXkoY2hhcnRWYWx1ZXMpKSB7XG4gICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9mb3JtYXRHcm91cFZhbHVlcyhjaGFydFZhbHVlcywgZm9ybWF0RnVuY3Rpb25zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHt9O1xuICAgICAgICAgICAgdHVpLnV0aWwuZm9yRWFjaChjaGFydFZhbHVlcywgZnVuY3Rpb24oZ3JvdXBWYWx1ZXMsIGNoYXJ0VHlwZSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdFtjaGFydFR5cGVdID0gdGhpcy5fZm9ybWF0R3JvdXBWYWx1ZXMoZ3JvdXBWYWx1ZXMsIGZvcm1hdEZ1bmN0aW9ucyk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBQaWNrIG1heCBsZW5ndGggdW5kZXIgcG9pbnQuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gdmFsdWVzIGNoYXJ0IHZhbHVlc1xuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IG1heCBsZW5ndGggdW5kZXIgcG9pbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9waWNrTWF4TGVuVW5kZXJQb2ludDogZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgIHZhciBtYXggPSAwO1xuXG4gICAgICAgIHR1aS51dGlsLmZvckVhY2hBcnJheSh2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgbGVuID0gdHVpLnV0aWwubGVuZ3RoQWZ0ZXJQb2ludCh2YWx1ZSk7XG4gICAgICAgICAgICBpZiAobGVuID4gbWF4KSB7XG4gICAgICAgICAgICAgICAgbWF4ID0gbGVuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICByZXR1cm4gbWF4O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIHplcm8gZmlsbCBmb3JtYXQgb3Igbm90LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmb3JtYXQgZm9ybWF0XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHJlc3VsdCBib29sZWFuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNaZXJvRmlsbDogZnVuY3Rpb24oZm9ybWF0KSB7XG4gICAgICAgIHJldHVybiBmb3JtYXQubGVuZ3RoID4gMiAmJiBmb3JtYXQuY2hhckF0KDApID09PSAnMCc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgZGVjaW1hbCBmb3JtYXQgb3Igbm90LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmb3JtYXQgZm9ybWF0XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHJlc3VsdCBib29sZWFuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNEZWNpbWFsOiBmdW5jdGlvbihmb3JtYXQpIHtcbiAgICAgICAgdmFyIGluZGV4T2YgPSBmb3JtYXQuaW5kZXhPZignLicpO1xuICAgICAgICByZXR1cm4gaW5kZXhPZiA+IC0xICYmIGluZGV4T2YgPCBmb3JtYXQubGVuZ3RoIC0gMTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciBjb21tYSBmb3JtYXQgb3Igbm90LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmb3JtYXQgZm9ybWF0XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHJlc3VsdCBib29sZWFuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNDb21tYTogZnVuY3Rpb24oZm9ybWF0KSB7XG4gICAgICAgIHJldHVybiBmb3JtYXQuaW5kZXhPZignLCcpID09PSBmb3JtYXQuc3BsaXQoJy4nKVswXS5sZW5ndGggLSA0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGb3JtYXQgemVybyBmaWxsLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBsZW4gbGVuZ3RoIG9mIHJlc3VsdFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSB0YXJnZXQgdmFsdWVcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBmb3JtYXR0ZWQgdmFsdWVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9mb3JtYXRaZXJvRmlsbDogZnVuY3Rpb24obGVuLCB2YWx1ZSkge1xuICAgICAgICB2YXIgemVybyA9ICcwJyxcbiAgICAgICAgICAgIGlzTWludXMgPSB2YWx1ZSA8IDA7XG5cbiAgICAgICAgdmFsdWUgPSBNYXRoLmFicyh2YWx1ZSkgKyAnJztcblxuICAgICAgICBpZiAodmFsdWUubGVuZ3RoID49IGxlbikge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgd2hpbGUgKHZhbHVlLmxlbmd0aCA8IGxlbikge1xuICAgICAgICAgICAgdmFsdWUgPSB6ZXJvICsgdmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKGlzTWludXMgPyAnLScgOiAnJykgKyB2YWx1ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRm9ybWF0IERlY2ltYWwuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGxlbiBsZW5ndGggb2YgdW5kZXIgZGVjaW1hbCBwb2ludFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSB0YXJnZXQgdmFsdWVcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBmb3JtYXR0ZWQgdmFsdWVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9mb3JtYXREZWNpbWFsOiBmdW5jdGlvbihsZW4sIHZhbHVlKSB7XG4gICAgICAgIHZhciBwb3c7XG5cbiAgICAgICAgaWYgKGxlbiA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIE1hdGgucm91bmQodmFsdWUsIDEwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHBvdyA9IE1hdGgucG93KDEwLCBsZW4pO1xuICAgICAgICB2YWx1ZSA9IE1hdGgucm91bmQodmFsdWUgKiBwb3cpIC8gcG93O1xuICAgICAgICB2YWx1ZSA9IHBhcnNlRmxvYXQodmFsdWUpLnRvRml4ZWQobGVuKTtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGb3JtYXQgQ29tbWEuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlIHRhcmdldCB2YWx1ZVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGZvcm1hdHRlZCB2YWx1ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2Zvcm1hdENvbW1hOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICB2YXIgY29tbWEgPSAnLCcsXG4gICAgICAgICAgICB1bmRlclBvaW50VmFsdWUgPSAnJyxcbiAgICAgICAgICAgIHZhbHVlcywgbGFzdEluZGV4O1xuXG4gICAgICAgIHZhbHVlICs9ICcnO1xuXG4gICAgICAgIGlmICh2YWx1ZS5pbmRleE9mKCcuJykgPiAtMSkge1xuICAgICAgICAgICAgdmFsdWVzID0gdmFsdWUuc3BsaXQoJy4nKTtcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWVzWzBdO1xuICAgICAgICAgICAgdW5kZXJQb2ludFZhbHVlID0gJy4nICsgdmFsdWVzWzFdO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA8IDQpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZSArIHVuZGVyUG9pbnRWYWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhbHVlcyA9ICh2YWx1ZSkuc3BsaXQoJycpLnJldmVyc2UoKTtcbiAgICAgICAgbGFzdEluZGV4ID0gdmFsdWVzLmxlbmd0aCAtIDE7XG4gICAgICAgIHZhbHVlcyA9IHR1aS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uKGNoYXIsIGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gW2NoYXJdO1xuICAgICAgICAgICAgaWYgKGluZGV4IDwgbGFzdEluZGV4ICYmIChpbmRleCArIDEpICUgMyA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKGNvbW1hKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBjb25jYXQuYXBwbHkoW10sIHZhbHVlcykucmV2ZXJzZSgpLmpvaW4oJycpICsgdW5kZXJQb2ludFZhbHVlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGaW5kIGZvcm1hdCBmdW5jdGlvbnMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZvcm1hdCBmb3JtYXRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ1tdfSB2YWx1ZXMgY2hhcnQgdmFsdWVzXG4gICAgICogQHJldHVybnMge2Z1bmN0aW9uW119IGZ1bmN0aW9uc1xuICAgICAqL1xuICAgIF9maW5kRm9ybWF0RnVuY3Rpb25zOiBmdW5jdGlvbihmb3JtYXQpIHtcbiAgICAgICAgdmFyIGZ1bmNzID0gW10sXG4gICAgICAgICAgICBsZW47XG5cbiAgICAgICAgaWYgKCFmb3JtYXQpIHtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9pc0RlY2ltYWwoZm9ybWF0KSkge1xuICAgICAgICAgICAgbGVuID0gdGhpcy5fcGlja01heExlblVuZGVyUG9pbnQoW2Zvcm1hdF0pO1xuICAgICAgICAgICAgZnVuY3MgPSBbdHVpLnV0aWwuYmluZCh0aGlzLl9mb3JtYXREZWNpbWFsLCB0aGlzLCBsZW4pXTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9pc1plcm9GaWxsKGZvcm1hdCkpIHtcbiAgICAgICAgICAgIGxlbiA9IGZvcm1hdC5sZW5ndGg7XG4gICAgICAgICAgICBmdW5jcyA9IFt0dWkudXRpbC5iaW5kKHRoaXMuX2Zvcm1hdFplcm9GaWxsLCB0aGlzLCBsZW4pXTtcbiAgICAgICAgICAgIHJldHVybiBmdW5jcztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9pc0NvbW1hKGZvcm1hdCkpIHtcbiAgICAgICAgICAgIGZ1bmNzLnB1c2godGhpcy5fZm9ybWF0Q29tbWEpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZ1bmNzO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZGF0YUNvbnZlcnRlcjtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBET00gSGFuZGxlci5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBET00gSGFuZGxlci5cbiAqIEBtb2R1bGUgZG9tSGFuZGxlclxuICovXG52YXIgZG9tSGFuZGxlciA9IHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgZWxlbWVudC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRvbUhhbmRsZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGFnIGh0bWwgdGFnXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5ld0NsYXNzIGNsYXNzIG5hbWVcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IGNyZWF0ZWQgZWxlbWVudFxuICAgICAqL1xuICAgIGNyZWF0ZTogZnVuY3Rpb24odGFnLCBuZXdDbGFzcykge1xuICAgICAgICB2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZyk7XG5cbiAgICAgICAgaWYgKG5ld0NsYXNzKSB7XG4gICAgICAgICAgICB0aGlzLmFkZENsYXNzKGVsLCBuZXdDbGFzcyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjbGFzcyBuYW1lcy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRvbUhhbmRsZXJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqIEByZXR1cm5zIHthcnJheX0gbmFtZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRDbGFzc05hbWVzOiBmdW5jdGlvbihlbCkge1xuICAgICAgICB2YXIgY2xhc3NOYW1lID0gZWwuY2xhc3NOYW1lIHx8ICcnLFxuICAgICAgICAgICAgY2xhc3NOYW1lcyA9IGNsYXNzTmFtZSA/IGNsYXNzTmFtZS5zcGxpdCgnICcpIDogW107XG4gICAgICAgIHJldHVybiBjbGFzc05hbWVzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgY3NzIGNsYXNzIHRvIHRhcmdldCBlbGVtZW50LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZG9tSGFuZGxlclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5ld0NsYXNzIGFkZCBjbGFzcyBuYW1lXG4gICAgICovXG4gICAgYWRkQ2xhc3M6IGZ1bmN0aW9uKGVsLCBuZXdDbGFzcykge1xuICAgICAgICB2YXIgY2xhc3NOYW1lcyA9IHRoaXMuX2dldENsYXNzTmFtZXMoZWwpLFxuICAgICAgICAgICAgaW5kZXggPSB0dWkudXRpbC5pbkFycmF5KG5ld0NsYXNzLCBjbGFzc05hbWVzKTtcblxuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY2xhc3NOYW1lcy5wdXNoKG5ld0NsYXNzKTtcbiAgICAgICAgZWwuY2xhc3NOYW1lID0gY2xhc3NOYW1lcy5qb2luKCcgJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBjc3MgY2xhc3MgZnJvbSB0YXJnZXQgZWxlbWVudC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRvbUhhbmRsZXJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBybUNsYXNzIHJlbW92ZSBjbGFzcyBuYW1lXG4gICAgICovXG4gICAgcmVtb3ZlQ2xhc3M6IGZ1bmN0aW9uKGVsLCBybUNsYXNzKSB7XG4gICAgICAgIHZhciBjbGFzc05hbWVzID0gdGhpcy5fZ2V0Q2xhc3NOYW1lcyhlbCksXG4gICAgICAgICAgICBpbmRleCA9IHR1aS51dGlsLmluQXJyYXkocm1DbGFzcywgY2xhc3NOYW1lcyk7XG5cbiAgICAgICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY2xhc3NOYW1lcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICBlbC5jbGFzc05hbWUgPSBjbGFzc05hbWVzLmpvaW4oJyAnKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciBjbGFzcyBleGlzdCBvciBub3QuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkb21IYW5kbGVyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZmluZENsYXNzIHRhcmdldCBjc3MgY2xhc3NcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gaGFzIGNsYXNzXG4gICAgICovXG4gICAgaGFzQ2xhc3M6IGZ1bmN0aW9uKGVsLCBmaW5kQ2xhc3MpIHtcbiAgICAgICAgdmFyIGNsYXNzTmFtZXMgPSB0aGlzLl9nZXRDbGFzc05hbWVzKGVsKSxcbiAgICAgICAgICAgIGluZGV4ID0gdHVpLnV0aWwuaW5BcnJheShmaW5kQ2xhc3MsIGNsYXNzTmFtZXMpO1xuICAgICAgICByZXR1cm4gaW5kZXggPiAtMTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmluZCBwYXJlbnQgYnkgY2xhc3MgbmFtZS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRvbUhhbmRsZXJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjbGFzc05hbWUgdGFyZ2V0IGNzcyBjbGFzc1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBsYXN0Q2xhc3MgbGFzdCBjc3MgY2xhc3NcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHJlc3VsdCBlbGVtZW50XG4gICAgICovXG4gICAgZmluZFBhcmVudEJ5Q2xhc3M6IGZ1bmN0aW9uKGVsLCBjbGFzc05hbWUsIGxhc3RDbGFzcykge1xuICAgICAgICB2YXIgcGFyZW50ID0gZWwucGFyZW50Tm9kZTtcbiAgICAgICAgaWYgKCFwYXJlbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaGFzQ2xhc3MocGFyZW50LCBjbGFzc05hbWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gcGFyZW50O1xuICAgICAgICB9IGVsc2UgaWYgKHBhcmVudC5ub2RlTmFtZSA9PT0gJ0JPRFknIHx8IHRoaXMuaGFzQ2xhc3MocGFyZW50LCBsYXN0Q2xhc3MpKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbmRQYXJlbnRCeUNsYXNzKHBhcmVudCwgY2xhc3NOYW1lLCBsYXN0Q2xhc3MpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFwcGVuZCBjaGlsZCBlbGVtZW50LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZG9tSGFuZGxlclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciBjb250YWluZXIgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNoaWxkcmVuIGNoaWxkIGVsZW1lbnRcbiAgICAgKi9cbiAgICBhcHBlbmQ6IGZ1bmN0aW9uKGNvbnRhaW5lciwgY2hpbGRyZW4pIHtcbiAgICAgICAgaWYgKCFjb250YWluZXIgfHwgIWNoaWxkcmVuKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY2hpbGRyZW4gPSB0dWkudXRpbC5pc0FycmF5KGNoaWxkcmVuKSA/IGNoaWxkcmVuIDogW2NoaWxkcmVuXTtcblxuICAgICAgICB0dWkudXRpbC5mb3JFYWNoQXJyYXkoY2hpbGRyZW4sIGZ1bmN0aW9uKGNoaWxkKSB7XG4gICAgICAgICAgICBpZiAoIWNoaWxkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGNoaWxkKTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBkb21IYW5kbGVyO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEV2ZW50IGxpc3RlbmVyLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEV2ZW50IGxpc3RlbmVyLlxuICogQG1vZHVsZSBldmVudExpc3RlbmVyXG4gKi9cbnZhciBldmVudExpc3RlbmVyID0ge1xuICAgIC8qKlxuICAgICAqIEV2ZW50IGxpc3RlbmVyIGZvciBJRS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmV2ZW50TGlzdGVuZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lIGV2ZW50IG5hbWVcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYXR0YWNoRXZlbnQ6IGZ1bmN0aW9uIChldmVudE5hbWUsIGVsLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09IFwib2JqZWN0XCIgJiYgY2FsbGJhY2suaGFuZGxlRXZlbnQpIHtcbiAgICAgICAgICAgIGVsLmF0dGFjaEV2ZW50KFwib25cIiArIGV2ZW50TmFtZSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrLmhhbmRsZUV2ZW50LmNhbGwoY2FsbGJhY2spO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbC5hdHRhY2hFdmVudChcIm9uXCIgKyBldmVudE5hbWUsIGNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFdmVudCBsaXN0ZW5lciBmb3Igb3RoZXIgYnJvd3NlcnMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpldmVudExpc3RlbmVyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZSBldmVudCBuYW1lXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayBjYWxsYmFjayBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2FkZEV2ZW50TGlzdGVuZXI6IGZ1bmN0aW9uIChldmVudE5hbWUsIGVsLCBjYWxsYmFjaykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGNhbGxiYWNrKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PSBcIm9iamVjdFwiICYmIGNhbGxiYWNrLmhhbmRsZUV2ZW50KSB7XG4gICAgICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5oYW5kbGVFdmVudC5jYWxsKGNhbGxiYWNrLCBldmVudCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEJpbmQgZXZlbnQgZnVuY3Rpb24uXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpldmVudExpc3RlbmVyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZSBldmVudCBuYW1lXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayBjYWxsYmFjayBmdW5jdGlvblxuICAgICAqL1xuICAgIGJpbmRFdmVudDogZnVuY3Rpb24gKGV2ZW50TmFtZSwgZWwsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBiaW5kRXZlbnQ7XG4gICAgICAgIGlmIChcImFkZEV2ZW50TGlzdGVuZXJcIiBpbiBlbCkge1xuICAgICAgICAgICAgYmluZEV2ZW50ID0gdGhpcy5fYWRkRXZlbnRMaXN0ZW5lcjtcbiAgICAgICAgfSBlbHNlIGlmIChcImF0dGFjaEV2ZW50XCIgaW4gZWwpIHtcbiAgICAgICAgICAgIGJpbmRFdmVudCA9IHRoaXMuX2F0dGFjaEV2ZW50O1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYmluZEV2ZW50ID0gYmluZEV2ZW50O1xuICAgICAgICBiaW5kRXZlbnQoZXZlbnROYW1lLCBlbCwgY2FsbGJhY2spO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXZlbnRMaXN0ZW5lcjtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBVdGlsIGZvciByZW5kZXJpbmcuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBkb20gPSByZXF1aXJlKCcuL2RvbUhhbmRsZXInKSxcbiAgICBjaGFydENvbnN0ID0gcmVxdWlyZSgnLi8uLi9jb25zdCcpO1xuXG52YXIgYnJvd3NlciA9IHR1aS51dGlsLmJyb3dzZXIsXG4gICAgaXNJRTggPSBicm93c2VyLm1zaWUgJiYgYnJvd3Nlci52ZXJzaW9uID09PSA4O1xuXG4vKipcbiAqIFV0aWwgZm9yIHJlbmRlcmluZy5cbiAqIEBtb2R1bGUgcmVuZGVyVXRpbFxuICovXG52YXIgcmVuZGVyVXRpbCA9IHtcbiAgICAvKipcbiAgICAgKiBDb25jYXQgc3RyaW5nLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6cmVuZGVyVXRpbFxuICAgICAqIEBwYXJhbXMgey4uLnN0cmluZ30gdGFyZ2V0IHN0cmluZ3NcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBjb25jYXQgc3RyaW5nXG4gICAgICovXG4gICAgY29uY2F0U3RyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIFN0cmluZy5wcm90b3R5cGUuY29uY2F0LmFwcGx5KCcnLCBhcmd1bWVudHMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGNzc1RleHQgZm9yIGZvbnQuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpyZW5kZXJVdGlsXG4gICAgICogQHBhcmFtIHt7Zm9udFNpemU6IG51bWJlciwgZm9udEZhbWlseTogc3RyaW5nLCBjb2xvcjogc3RyaW5nfX0gdGhlbWUgZm9udCB0aGVtZVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGNzc1RleHRcbiAgICAgKi9cbiAgICBtYWtlRm9udENzc1RleHQ6IGZ1bmN0aW9uKHRoZW1lKSB7XG4gICAgICAgIHZhciBjc3NUZXh0cyA9IFtdO1xuXG4gICAgICAgIGlmICghdGhlbWUpIHtcbiAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGVtZS5mb250U2l6ZSkge1xuICAgICAgICAgICAgY3NzVGV4dHMucHVzaCh0aGlzLmNvbmNhdFN0cignZm9udC1zaXplOicsIHRoZW1lLmZvbnRTaXplLCAncHgnKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhlbWUuZm9udEZhbWlseSkge1xuICAgICAgICAgICAgY3NzVGV4dHMucHVzaCh0aGlzLmNvbmNhdFN0cignZm9udC1mYW1pbHk6JywgdGhlbWUuZm9udEZhbWlseSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoZW1lLmNvbG9yKSB7XG4gICAgICAgICAgICBjc3NUZXh0cy5wdXNoKHRoaXMuY29uY2F0U3RyKCdjb2xvcjonLCB0aGVtZS5jb2xvcikpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNzc1RleHRzLmpvaW4oJzsnKTtcbiAgICB9LFxuXG4gICAgY2hlY2tFbDogbnVsbCxcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgZWxlbWVudCBmb3Igc2l6ZSBjaGVjay5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOnJlbmRlclV0aWxcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jcmVhdGVTaXplQ2hlY2tFbDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBlbERpdiwgZWxTcGFuO1xuICAgICAgICBpZiAodGhpcy5jaGVja0VsKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVja0VsO1xuICAgICAgICB9XG5cbiAgICAgICAgZWxEaXYgPSBkb20uY3JlYXRlKCdESVYnLCAndHVpLWNoYXJ0LXNpemUtY2hlY2stZWxlbWVudCcpO1xuICAgICAgICBlbFNwYW4gPSBkb20uY3JlYXRlKCdTUEFOJyk7XG5cbiAgICAgICAgZWxEaXYuYXBwZW5kQ2hpbGQoZWxTcGFuKTtcbiAgICAgICAgdGhpcy5jaGVja0VsID0gZWxEaXY7XG4gICAgICAgIHJldHVybiBlbERpdjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHJlbmRlcmVkIGxhYmVsIHNpemUgKHdpZHRoIG9yIGhlaWdodCkuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpyZW5kZXJVdGlsXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGxhYmVsIGxhYmVsXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIHRoZW1lXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG9mZnNldFR5cGUgb2Zmc2V0IHR5cGUgKG9mZnNldFdpZHRoIG9yIG9mZnNldEhlaWdodClcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBzaXplXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0UmVuZGVyZWRMYWJlbFNpemU6IGZ1bmN0aW9uKGxhYmVsLCB0aGVtZSwgb2Zmc2V0VHlwZSkge1xuICAgICAgICB2YXIgZWxEaXYsIGVsU3BhbiwgbGFiZWxTaXplO1xuXG4gICAgICAgIGlmICh0dWkudXRpbC5pc1VuZGVmaW5lZChsYWJlbCkgfHwgbGFiZWwgPT09ICcnKSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGVsRGl2ID0gdGhpcy5fY3JlYXRlU2l6ZUNoZWNrRWwoKTtcbiAgICAgICAgZWxTcGFuID0gZWxEaXYuZmlyc3RDaGlsZDtcblxuICAgICAgICB0aGVtZSA9IHRoZW1lIHx8IHt9O1xuICAgICAgICBlbFNwYW4uaW5uZXJIVE1MID0gbGFiZWw7XG4gICAgICAgIGVsU3Bhbi5zdHlsZS5mb250U2l6ZSA9ICh0aGVtZS5mb250U2l6ZSB8fCBjaGFydENvbnN0LkRFRkFVTFRfTEFCRUxfRk9OVF9TSVpFKSArICdweCc7XG5cbiAgICAgICAgaWYgKHRoZW1lLmZvbnRGYW1pbHkpIHtcbiAgICAgICAgICAgIGVsU3Bhbi5zdHlsZS5wYWRkaW5nID0gMDtcbiAgICAgICAgICAgIGVsU3Bhbi5zdHlsZS5mb250RmFtaWx5ID0gdGhlbWUuZm9udEZhbWlseTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZWxEaXYpO1xuICAgICAgICBsYWJlbFNpemUgPSBlbFNwYW5bb2Zmc2V0VHlwZV07XG4gICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoZWxEaXYpO1xuICAgICAgICByZXR1cm4gbGFiZWxTaXplO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgcmVuZGVyZWQgbGFiZWwgd2lkdGguXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpyZW5kZXJVdGlsXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGxhYmVsIGxhYmVsXG4gICAgICogQHBhcmFtIHt7Zm9udFNpemU6IG51bWJlciwgZm9udEZhbWlseTogc3RyaW5nLCBjb2xvcjogc3RyaW5nfX0gdGhlbWUgbGFiZWwgdGhlbWVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSB3aWR0aFxuICAgICAqL1xuICAgIGdldFJlbmRlcmVkTGFiZWxXaWR0aDogZnVuY3Rpb24obGFiZWwsIHRoZW1lKSB7XG4gICAgICAgIHZhciBsYWJlbFdpZHRoID0gdGhpcy5fZ2V0UmVuZGVyZWRMYWJlbFNpemUobGFiZWwsIHRoZW1lLCAnb2Zmc2V0V2lkdGgnKTtcbiAgICAgICAgcmV0dXJuIGxhYmVsV2lkdGg7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCByZW5kZXJlZCBsYWJlbCBoZWlnaHQuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpyZW5kZXJVdGlsXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGxhYmVsIGxhYmVsXG4gICAgICogQHBhcmFtIHt7Zm9udFNpemU6IG51bWJlciwgZm9udEZhbWlseTogc3RyaW5nLCBjb2xvcjogc3RyaW5nfX0gdGhlbWUgbGFiZWwgdGhlbWVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBoZWlnaHRcbiAgICAgKi9cbiAgICBnZXRSZW5kZXJlZExhYmVsSGVpZ2h0OiBmdW5jdGlvbihsYWJlbCwgdGhlbWUpIHtcbiAgICAgICAgdmFyIGxhYmVsSGVpZ2h0ID0gdGhpcy5fZ2V0UmVuZGVyZWRMYWJlbFNpemUobGFiZWwsIHRoZW1lLCAnb2Zmc2V0SGVpZ2h0Jyk7XG4gICAgICAgIHJldHVybiBsYWJlbEhlaWdodDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IFJlbmRlcmVkIExhYmVscyBNYXggU2l6ZSh3aWR0aCBvciBoZWlnaHQpLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Ym91bmRzTWFrZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBsYWJlbHMgbGFiZWxzXG4gICAgICogQHBhcmFtIHt7Zm9udFNpemU6IG51bWJlciwgZm9udEZhbWlseTogc3RyaW5nLCBjb2xvcjogc3RyaW5nfX0gdGhlbWUgbGFiZWwgdGhlbWVcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBpdGVyYXRlZSBpdGVyYXRlZVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IG1heCBzaXplICh3aWR0aCBvciBoZWlnaHQpXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0UmVuZGVyZWRMYWJlbHNNYXhTaXplOiBmdW5jdGlvbihsYWJlbHMsIHRoZW1lLCBpdGVyYXRlZSkge1xuICAgICAgICB2YXIgc2l6ZXMgPSB0dWkudXRpbC5tYXAobGFiZWxzLCBmdW5jdGlvbihsYWJlbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpdGVyYXRlZShsYWJlbCwgdGhlbWUpO1xuICAgICAgICAgICAgfSwgdGhpcyksXG4gICAgICAgICAgICBtYXhTaXplID0gdHVpLnV0aWwubWF4KHNpemVzKTtcbiAgICAgICAgcmV0dXJuIG1heFNpemU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCByZW5kZXJlZCBsYWJlbHMgbWF4IHdpZHRoLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Ym91bmRzTWFrZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBsYWJlbHMgbGFiZWxzXG4gICAgICogQHBhcmFtIHt7Zm9udFNpemU6IG51bWJlciwgZm9udEZhbWlseTogc3RyaW5nLCBjb2xvcjogc3RyaW5nfX0gdGhlbWUgbGFiZWwgdGhlbWVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBtYXggd2lkdGhcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGdldFJlbmRlcmVkTGFiZWxzTWF4V2lkdGg6IGZ1bmN0aW9uKGxhYmVscywgdGhlbWUpIHtcbiAgICAgICAgdmFyIGl0ZXJhdGVlID0gdHVpLnV0aWwuYmluZCh0aGlzLmdldFJlbmRlcmVkTGFiZWxXaWR0aCwgdGhpcyksXG4gICAgICAgICAgICBtYXhXaWR0aCA9IHRoaXMuX2dldFJlbmRlcmVkTGFiZWxzTWF4U2l6ZShsYWJlbHMsIHRoZW1lLCBpdGVyYXRlZSk7XG4gICAgICAgIHJldHVybiBtYXhXaWR0aDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHJlbmRlcmVkIGxhYmVscyBtYXggaGVpZ2h0LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Ym91bmRzTWFrZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBsYWJlbHMgbGFiZWxzXG4gICAgICogQHBhcmFtIHt7Zm9udFNpemU6IG51bWJlciwgZm9udEZhbWlseTogc3RyaW5nLCBjb2xvcjogc3RyaW5nfX0gdGhlbWUgbGFiZWwgdGhlbWVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBtYXggaGVpZ2h0XG4gICAgICovXG4gICAgZ2V0UmVuZGVyZWRMYWJlbHNNYXhIZWlnaHQ6IGZ1bmN0aW9uKGxhYmVscywgdGhlbWUpIHtcbiAgICAgICAgdmFyIGl0ZXJhdGVlID0gdHVpLnV0aWwuYmluZCh0aGlzLmdldFJlbmRlcmVkTGFiZWxIZWlnaHQsIHRoaXMpLFxuICAgICAgICAgICAgbWF4SGVpZ2h0ID0gdGhpcy5fZ2V0UmVuZGVyZWRMYWJlbHNNYXhTaXplKGxhYmVscywgdGhlbWUsIGl0ZXJhdGVlKTtcbiAgICAgICAgcmV0dXJuIG1heEhlaWdodDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGRpbWVuc2lvbi5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOnJlbmRlclV0aWxcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gZGltZW5zaW9uIGRpbWVuc2lvblxuICAgICAqL1xuICAgIHJlbmRlckRpbWVuc2lvbjogZnVuY3Rpb24oZWwsIGRpbWVuc2lvbikge1xuICAgICAgICBlbC5zdHlsZS5jc3NUZXh0ID0gW1xuICAgICAgICAgICAgdGhpcy5jb25jYXRTdHIoJ3dpZHRoOicsIGRpbWVuc2lvbi53aWR0aCwgJ3B4JyksXG4gICAgICAgICAgICB0aGlzLmNvbmNhdFN0cignaGVpZ2h0OicsIGRpbWVuc2lvbi5oZWlnaHQsICdweCcpXG4gICAgICAgIF0uam9pbignOycpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgcG9zaXRpb24odG9wLCByaWdodCkuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpyZW5kZXJVdGlsXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3t0b3A6IG51bWJlciwgbGVmdDogbnVtYmVyLCByaWdodDogbnVtYmVyfX0gcG9zaXRpb24gcG9zaXRpb25cbiAgICAgKi9cbiAgICByZW5kZXJQb3NpdGlvbjogZnVuY3Rpb24oZWwsIHBvc2l0aW9uKSB7XG4gICAgICAgIGlmICh0dWkudXRpbC5pc1VuZGVmaW5lZChwb3NpdGlvbikpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwb3NpdGlvbi50b3ApIHtcbiAgICAgICAgICAgIGVsLnN0eWxlLnRvcCA9IHBvc2l0aW9uLnRvcCArICdweCc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocG9zaXRpb24ubGVmdCkge1xuICAgICAgICAgICAgZWwuc3R5bGUubGVmdCA9IHBvc2l0aW9uLmxlZnQgKyAncHgnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBvc2l0aW9uLnJpZ2h0KSB7XG4gICAgICAgICAgICBlbC5zdHlsZS5yaWdodCA9IHBvc2l0aW9uLnJpZ2h0ICsgJ3B4JztcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgYmFja2dyb3VuZC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOnJlbmRlclV0aWxcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBiYWNrZ3JvdW5kIGJhY2tncm91bmQgb3B0aW9uXG4gICAgICovXG4gICAgcmVuZGVyQmFja2dyb3VuZDogZnVuY3Rpb24oZWwsIGJhY2tncm91bmQpIHtcbiAgICAgICAgaWYgKCFiYWNrZ3JvdW5kKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBlbC5zdHlsZS5iYWNrZ3JvdW5kID0gYmFja2dyb3VuZDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGZvbnQgZmFtaWx5LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6cmVuZGVyVXRpbFxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZvbnRGYW1pbHkgZm9udCBmYW1pbHkgb3B0aW9uXG4gICAgICovXG4gICAgcmVuZGVyRm9udEZhbWlseTogZnVuY3Rpb24oZWwsIGZvbnRGYW1pbHkpIHtcbiAgICAgICAgaWYgKCFmb250RmFtaWx5KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBlbC5zdHlsZS5mb250RmFtaWx5ID0gZm9udEZhbWlseTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIHRpdGxlLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6cmVuZGVyVXRpbFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0aXRsZSB0aXRsZVxuICAgICAqIEBwYXJhbSB7e2ZvbnRTaXplOiBudW1iZXIsIGNvbG9yOiBzdHJpbmcsIGJhY2tncm91bmQ6IHN0cmluZ319IHRoZW1lIHRpdGxlIHRoZW1lXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNsYXNzTmFtZSBjc3MgY2xhc3MgbmFtZVxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gdGl0bGUgZWxlbWVudFxuICAgICAqL1xuICAgIHJlbmRlclRpdGxlOiBmdW5jdGlvbih0aXRsZSwgdGhlbWUsIGNsYXNzTmFtZSkge1xuICAgICAgICB2YXIgZWxUaXRsZSwgY3NzVGV4dDtcblxuICAgICAgICBpZiAoIXRpdGxlKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGVsVGl0bGUgPSBkb20uY3JlYXRlKCdESVYnLCBjbGFzc05hbWUpO1xuICAgICAgICBlbFRpdGxlLmlubmVySFRNTCA9IHRpdGxlO1xuXG4gICAgICAgIGNzc1RleHQgPSByZW5kZXJVdGlsLm1ha2VGb250Q3NzVGV4dCh0aGVtZSk7XG5cbiAgICAgICAgaWYgKHRoZW1lLmJhY2tncm91bmQpIHtcbiAgICAgICAgICAgIGNzc1RleHQgKz0gJzsnICsgdGhpcy5jb25jYXRTdHIoJ2JhY2tncm91bmQ6JywgdGhlbWUuYmFja2dyb3VuZCk7XG4gICAgICAgIH1cblxuICAgICAgICBlbFRpdGxlLnN0eWxlLmNzc1RleHQgPSBjc3NUZXh0O1xuXG4gICAgICAgIHJldHVybiBlbFRpdGxlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIElFOCBvciBub3QuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpyZW5kZXJVdGlsXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHJlc3VsdCBib29sZWFuXG4gICAgICovXG4gICAgaXNJRTg6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gaXNJRTg7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSByZW5kZXJVdGlsO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IGNoYXJ0IHN0YXRlLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4uL2NvbnN0Jyk7XG5cbi8qKlxuICogc3RhdGUuXG4gKiBAbW9kdWxlIHN0YXRlXG4gKi9cbnZhciBzdGF0ZSA9IHtcbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIGxpbmUgdHlwZSBjaGFydCBvciBub3QuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNoYXJ0VHlwZSBjaGFydCB0eXBlXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHJlc3VsdCBib29sZWFuXG4gICAgICovXG4gICAgaXNMaW5lVHlwZUNoYXJ0OiBmdW5jdGlvbihjaGFydFR5cGUpIHtcbiAgICAgICAgcmV0dXJuIGNoYXJ0VHlwZSA9PT0gY2hhcnRDb25zdC5DSEFSVF9UWVBFX0xJTkUgfHwgY2hhcnRUeXBlID09PSBjaGFydENvbnN0LkNIQVJUX1RZUEVfQVJFQTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHN0YXRlO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFRoaXMgaXMgdGVtcGxhdGUgbWFrZXIuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIC8qKlxuICAgICAqIFRoaXMgaXMgdGVtcGxhdGUgbWFrZXIuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGh0bWwgaHRtbFxuICAgICAqIEByZXR1cm5zIHtmdW5jdGlvbn0gdGVtcGxhdGUgZnVuY3Rpb25cbiAgICAgKiBAZWF4bXBsZVxuICAgICAqXG4gICAgICogICB2YXIgdGVtcGxhdGUgPSB0ZW1wbGF0ZU1ha2VyLnRlbXBsYXRlKCc8c3Bhbj57eyBuYW1lIH19PC9zcGFuPicpLFxuICAgICAqICAgICAgIHJlc3VsdCA9IHRlbXBsYXRlKHtuYW1lOiAnSm9obicpO1xuICAgICAqICAgY29uc29sZS5sb2cocmVzdWx0KTsgLy8gPHNwYW4+Sm9objwvc3Bhbj5cbiAgICAgKlxuICAgICAqL1xuICAgIHRlbXBsYXRlOiBmdW5jdGlvbiAoaHRtbCkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBodG1sO1xuICAgICAgICAgICAgdHVpLnV0aWwuZm9yRWFjaChkYXRhLCBmdW5jdGlvbiAodmFsdWUsIGtleSkge1xuICAgICAgICAgICAgICAgIHZhciByZWdFeHAgPSBuZXcgUmVnRXhwKCd7e1xcXFxzKicgKyBrZXkgKyAnXFxcXHMqfX0nLCAnZycpO1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKHJlZ0V4cCwgdmFsdWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9O1xuICAgIH1cbn07XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgIExlZ2VuZCBjb21wb25lbnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBjaGFydENvbnN0ID0gcmVxdWlyZSgnLi4vY29uc3QnKSxcbiAgICBkb20gPSByZXF1aXJlKCcuLi9oZWxwZXJzL2RvbUhhbmRsZXInKSxcbiAgICByZW5kZXJVdGlsID0gcmVxdWlyZSgnLi4vaGVscGVycy9yZW5kZXJVdGlsJyksXG4gICAgZGVmYXVsdFRoZW1lID0gcmVxdWlyZSgnLi4vdGhlbWVzL2RlZmF1bHRUaGVtZScpLFxuICAgIGxlZ2VuZFRlbXBsYXRlID0gcmVxdWlyZSgnLi8uLi9sZWdlbmRzL2xlZ2VuZFRlbXBsYXRlJyk7XG5cbnZhciBMZWdlbmQgPSB0dWkudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIExlZ2VuZC5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIExlZ2VuZCBjb21wb25lbnQuXG4gICAgICogQGNvbnN0cnVjdHMgTGVnZW5kXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmxlZ2VuZExhYmVscyBsZWdlbmQgbGFiZWxzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmJvdW5kIGF4aXMgYm91bmRcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgYXhpcyB0aGVtZVxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB0dWkudXRpbC5leHRlbmQodGhpcywgcGFyYW1zKTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIExlZ2VuZCB2aWV3IGNsYXNzTmFtZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jbGFzc05hbWUgPSAndHVpLWNoYXJ0LWxlZ2VuZC1hcmVhJztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGxlZ2VuZC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYm91bmQgcGxvdCBib3VuZFxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gbGVnZW5kIGVsZW1lbnRcbiAgICAgKi9cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZWwgPSBkb20uY3JlYXRlKCdESVYnLCB0aGlzLmNsYXNzTmFtZSk7XG4gICAgICAgIGVsLmlubmVySFRNTCA9IHRoaXMuX21ha2VMZWdlbmRIdG1sKCk7XG4gICAgICAgIHJlbmRlclV0aWwucmVuZGVyUG9zaXRpb24oZWwsIHRoaXMuYm91bmQucG9zaXRpb24pO1xuICAgICAgICB0aGlzLl9yZW5kZXJMYWJlbFRoZW1lKGVsLCB0aGlzLnRoZW1lLmxhYmVsKTtcblxuICAgICAgICByZXR1cm4gZWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCB0aGVtZSBmb3IgbGVnZW5kIGxhYmVsc1xuICAgICAqIEBwYXJhbSB7YXJyYXkuPG9iamVjdD59IGxhYmVscyBsYWJlbHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgbGVnZW5kIHRoZW1lXG4gICAgICogQHJldHVybnMge2FycmF5LjxvYmplY3Q+fSBsYWJlbHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRUaGVtZUZvckxhYmVsczogZnVuY3Rpb24obGFiZWxzLCB0aGVtZSkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gdHVpLnV0aWwubWFwKGxhYmVscywgZnVuY3Rpb24oaXRlbSwgaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBpdGVtVGhlbWUgPSB7XG4gICAgICAgICAgICAgICAgY29sb3I6IHRoZW1lLmNvbG9yc1tpbmRleF1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGlmICh0aGVtZS5zaW5nbGVDb2xvcnMpIHtcbiAgICAgICAgICAgICAgICBpdGVtVGhlbWUuc2luZ2xlQ29sb3IgPSB0aGVtZS5zaW5nbGVDb2xvcnNbaW5kZXhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoZW1lLmJvcmRlckNvbG9yKSB7XG4gICAgICAgICAgICAgICAgaXRlbVRoZW1lLmJvcmRlckNvbG9yID0gdGhlbWUuYm9yZGVyQ29sb3I7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpdGVtLnRoZW1lID0gaXRlbVRoZW1lO1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgbGVnZW5kIGxhYmVscy5cbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPG9iamVjdD59IGxlZ2VuZCBsYWJlbHMuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUxlZ2VuZExhYmVsczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjaGFydFR5cGUgPSB0aGlzLmNoYXJ0VHlwZSxcbiAgICAgICAgICAgIGxlZ2VuZExhYmVscyA9IHRoaXMubGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgam9pbkxlZ2VuZExhYmVscyA9IHRoaXMuam9pbkxlZ2VuZExhYmVscyxcbiAgICAgICAgICAgIGxhYmVsTGVuID0gbGVnZW5kTGFiZWxzLmxlbmd0aCxcbiAgICAgICAgICAgIHRoZW1lID0gdGhpcy50aGVtZSxcbiAgICAgICAgICAgIGNoYXJ0TGVnZW5kVGhlbWUgPSB0dWkudXRpbC5maWx0ZXIodGhlbWUsIGZ1bmN0aW9uKGl0ZW0sIG5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHVpLnV0aWwuaW5BcnJheShuYW1lLCBjaGFydENvbnN0LlNFUklFU19QUk9QUykgPT09IC0xICYmIG5hbWUgIT09ICdsYWJlbCc7XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGNoYXJ0VHlwZXMgPSB0dWkudXRpbC5rZXlzKGNoYXJ0TGVnZW5kVGhlbWUpLFxuICAgICAgICAgICAgZGVmYXVsdExlZ2VuZFRoZW1lID0ge1xuICAgICAgICAgICAgICAgIGNvbG9yczogZGVmYXVsdFRoZW1lLnNlcmllcy5jb2xvcnNcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjaGFydFRoZW1lLCByZXN1bHQ7XG5cbiAgICAgICAgaWYgKCFjaGFydFR5cGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5fc2V0VGhlbWVGb3JMYWJlbHMoam9pbkxlZ2VuZExhYmVscywgdGhlbWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2hhcnRUaGVtZSA9IHRoZW1lW2NoYXJ0VHlwZV0gfHwgZGVmYXVsdExlZ2VuZFRoZW1lO1xuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5fc2V0VGhlbWVGb3JMYWJlbHMoam9pbkxlZ2VuZExhYmVscy5zbGljZSgwLCBsYWJlbExlbiksIGNoYXJ0VGhlbWUpO1xuICAgICAgICAgICAgY2hhcnRUaGVtZSA9IHRoZW1lW3R1aS51dGlsLmZpbHRlcihjaGFydFR5cGVzLCBmdW5jdGlvbihwcm9wTmFtZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcm9wTmFtZSAhPT0gY2hhcnRUeXBlO1xuICAgICAgICAgICAgfSlbMF1dIHx8IGRlZmF1bHRMZWdlbmRUaGVtZTtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQodGhpcy5fc2V0VGhlbWVGb3JMYWJlbHMoam9pbkxlZ2VuZExhYmVscy5zbGljZShsYWJlbExlbiksIGNoYXJ0VGhlbWUpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGxlZ2VuZCBodG1sLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGxlZ2VuZCBodG1sXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUxlZ2VuZEh0bWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbGFiZWxzID0gdGhpcy5fbWFrZUxlZ2VuZExhYmVscygpLFxuICAgICAgICAgICAgdGVtcGxhdGUgPSBsZWdlbmRUZW1wbGF0ZS50cGxMZWdlbmQsXG4gICAgICAgICAgICBsYWJlbEhlaWdodCA9IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodChsYWJlbHNbMF0ubGFiZWwsIGxhYmVsc1swXS50aGVtZSkgKyAoY2hhcnRDb25zdC5MQUJFTF9QQURESU5HX1RPUCAqIDIpLFxuICAgICAgICAgICAgYmFzZU1hcmdpblRvcCA9IHBhcnNlSW50KChsYWJlbEhlaWdodCAtIGNoYXJ0Q29uc3QuTEVHRU5EX1JFQ1RfV0lEVEgpIC8gMiwgMTApIC0gMSxcbiAgICAgICAgICAgIGh0bWwgPSB0dWkudXRpbC5tYXAobGFiZWxzLCBmdW5jdGlvbihsYWJlbCkge1xuICAgICAgICAgICAgICAgIHZhciBib3JkZXJDc3NUZXh0ID0gbGFiZWwuYm9yZGVyQ29sb3IgPyByZW5kZXJVdGlsLmNvbmNhdFN0cignO2JvcmRlcjoxcHggc29saWQgJywgbGFiZWwuYm9yZGVyQ29sb3IpIDogJycsXG4gICAgICAgICAgICAgICAgICAgIHJlY3RNYXJnaW4sIG1hcmdpblRvcCwgZGF0YTtcbiAgICAgICAgICAgICAgICBpZiAobGFiZWwuY2hhcnRUeXBlID09PSAnbGluZScpIHtcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luVG9wID0gYmFzZU1hcmdpblRvcCArIGNoYXJ0Q29uc3QuTElORV9NQVJHSU5fVE9QO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG1hcmdpblRvcCA9IGJhc2VNYXJnaW5Ub3A7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlY3RNYXJnaW4gPSByZW5kZXJVdGlsLmNvbmNhdFN0cignO21hcmdpbi10b3A6JywgbWFyZ2luVG9wLCAncHgnKTtcblxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIGNzc1RleHQ6IHJlbmRlclV0aWwuY29uY2F0U3RyKCdiYWNrZ3JvdW5kLWNvbG9yOicsIGxhYmVsLnRoZW1lLnNpbmdsZUNvbG9yIHx8IGxhYmVsLnRoZW1lLmNvbG9yLCBib3JkZXJDc3NUZXh0LCByZWN0TWFyZ2luKSxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBsYWJlbEhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgY2hhcnRUeXBlOiBsYWJlbC5jaGFydFR5cGUgfHwgJ3JlY3QnLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogbGFiZWwubGFiZWxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZShkYXRhKTtcbiAgICAgICAgICAgIH0sIHRoaXMpLmpvaW4oJycpO1xuICAgICAgICByZXR1cm4gaHRtbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGNzcyBzdHlsZSBvZiBsYWJlbCBhcmVhLlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIGxhYmVsIGFyZWEgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7e2ZvbnRTaXplOm51bWJlciwgZm9udEZhbWlseTogc3RyaW5nLCBjb2xvcjogc3RyaW5nfX0gdGhlbWUgbGFiZWwgdGhlbWVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJMYWJlbFRoZW1lOiBmdW5jdGlvbihlbCwgdGhlbWUpIHtcbiAgICAgICAgdmFyIGNzc1RleHQgPSByZW5kZXJVdGlsLm1ha2VGb250Q3NzVGV4dCh0aGVtZSk7XG4gICAgICAgIGVsLnN0eWxlLmNzc1RleHQgKz0gJzsnICsgY3NzVGV4dDtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBMZWdlbmQ7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgVGhpcyBpcyB0ZW1wbGF0ZXMgb2YgbGVnZW5kIHZpZXcuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG52YXIgdGVtcGxhdGVNYWtlciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvdGVtcGxhdGVNYWtlcicpO1xuXG52YXIgdGFncyA9IHtcbiAgICBIVE1MX0xFR0VORDogJzxkaXYgY2xhc3M9XCJ0dWktY2hhcnQtbGVnZW5kXCI+JyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwidHVpLWNoYXJ0LWxlZ2VuZC1yZWN0IHt7IGNoYXJ0VHlwZSB9fVwiIHN0eWxlPVwie3sgY3NzVGV4dCB9fVwiPjwvZGl2PicgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cInR1aS1jaGFydC1sZWdlbmQtbGFiZWxcIiBzdHlsZT1cImhlaWdodDp7eyBoZWlnaHQgfX1weFwiPnt7IGxhYmVsIH19PC9kaXY+PC9kaXY+J1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgdHBsTGVnZW5kOiB0ZW1wbGF0ZU1ha2VyLnRlbXBsYXRlKHRhZ3MuSFRNTF9MRUdFTkQpXG59O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFBsb3QgY29tcG9uZW50LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZG9tID0gcmVxdWlyZSgnLi4vaGVscGVycy9kb21IYW5kbGVyJyksXG4gICAgY2FsY3VsYXRvciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvY2FsY3VsYXRvcicpLFxuICAgIHJlbmRlclV0aWwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3JlbmRlclV0aWwnKSxcbiAgICBwbG90VGVtcGxhdGUgPSByZXF1aXJlKCcuL3Bsb3RUZW1wbGF0ZScpO1xuXG52YXIgUGxvdCA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgUGxvdC5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIFBsb3QgY29tcG9uZW50LlxuICAgICAqIEBjb25zdHJ1Y3RzIFBsb3RcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMudlRpY2tDb3VudCB2ZXJ0aWNhbCB0aWNrIGNvdW50XG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmhUaWNrQ291bnQgaG9yaXpvbnRhbCB0aWNrIGNvdW50XG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmJvdW5kIGF4aXMgYm91bmRcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgYXhpcyB0aGVtZVxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB0dWkudXRpbC5leHRlbmQodGhpcywgcGFyYW1zKTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFBsb3QgdmlldyBjbGFzc05hbWVcbiAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2xhc3NOYW1lID0gJ3R1aS1jaGFydC1wbG90LWFyZWEnO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgcGxvdC5cbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgdG9wOiBudW1iZXIsIHJpZ2h0OiBudW1iZXJ9fSBib3VuZCBwbG90IGFyZWEgYm91bmRcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHBsb3QgZWxlbWVudFxuICAgICAqL1xuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBlbCA9IGRvbS5jcmVhdGUoJ0RJVicsIHRoaXMuY2xhc3NOYW1lKSxcbiAgICAgICAgICAgIGJvdW5kID0gdGhpcy5ib3VuZDtcbiAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJEaW1lbnNpb24oZWwsIGJvdW5kLmRpbWVuc2lvbik7XG4gICAgICAgIHJlbmRlclV0aWwucmVuZGVyUG9zaXRpb24oZWwsIGJvdW5kLnBvc2l0aW9uKTtcbiAgICAgICAgdGhpcy5fcmVuZGVyTGluZXMoZWwsIGJvdW5kLmRpbWVuc2lvbik7XG5cbiAgICAgICAgcmV0dXJuIGVsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgcGxvdCBsaW5lcy5cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCBlbGVtZW50XG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBkaW1lbnNpb24gcGxvdCBhcmVhIGRpbWVuc2lvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlckxpbmVzOiBmdW5jdGlvbihlbCwgZGltZW5zaW9uKSB7XG4gICAgICAgIHZhciBoUG9zaXRpb25zID0gdGhpcy5fbWFrZUhvcml6b250YWxQaXhlbFBvc2l0aW9ucyhkaW1lbnNpb24ud2lkdGgpLFxuICAgICAgICAgICAgdlBvc2l0aW9ucyA9IHRoaXMuX21ha2VWZXJ0aWNhbFBpeGVsUG9zaXRpb25zKGRpbWVuc2lvbi5oZWlnaHQpLFxuICAgICAgICAgICAgdGhlbWUgPSB0aGlzLnRoZW1lLFxuICAgICAgICAgICAgbGluZUh0bWwgPSAnJztcblxuICAgICAgICBsaW5lSHRtbCArPSB0aGlzLl9tYWtlTGluZUh0bWwoe1xuICAgICAgICAgICAgcG9zaXRpb25zOiBoUG9zaXRpb25zLFxuICAgICAgICAgICAgc2l6ZTogZGltZW5zaW9uLmhlaWdodCxcbiAgICAgICAgICAgIGNsYXNzTmFtZTogJ3ZlcnRpY2FsJyxcbiAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogJ2xlZnQnLFxuICAgICAgICAgICAgc2l6ZVR5cGU6ICdoZWlnaHQnLFxuICAgICAgICAgICAgbGluZUNvbG9yOiB0aGVtZS5saW5lQ29sb3JcbiAgICAgICAgfSk7XG4gICAgICAgIGxpbmVIdG1sICs9IHRoaXMuX21ha2VMaW5lSHRtbCh7XG4gICAgICAgICAgICBwb3NpdGlvbnM6IHZQb3NpdGlvbnMsXG4gICAgICAgICAgICBzaXplOiBkaW1lbnNpb24ud2lkdGgsXG4gICAgICAgICAgICBjbGFzc05hbWU6ICdob3Jpem9udGFsJyxcbiAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogJ2JvdHRvbScsXG4gICAgICAgICAgICBzaXplVHlwZTogJ3dpZHRoJyxcbiAgICAgICAgICAgIGxpbmVDb2xvcjogdGhlbWUubGluZUNvbG9yXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGVsLmlubmVySFRNTCA9IGxpbmVIdG1sO1xuXG4gICAgICAgIHJlbmRlclV0aWwucmVuZGVyQmFja2dyb3VuZChlbCwgdGhlbWUuYmFja2dyb3VuZCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgaHRtbCBvZiBwbG90IGxpbmUuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxvYmplY3Q+fSBwYXJhbXMucG9zaXRpb25zIHBvc2l0aW9uc1xuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5zaXplIHdpZHRoIG9yIGhlaWdodFxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5jbGFzc05hbWUgbGluZSBjbGFzc05hbWVcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMucG9zaXRpb25UeXBlIHBvc2l0aW9uIHR5cGUgKGxlZnQgb3IgYm90dG9tKVxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5zaXplVHlwZSBzaXplIHR5cGUgKHNpemUgb3IgaGVpZ2h0KVxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5saW5lQ29sb3IgbGluZSBjb2xvclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGh0bWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlTGluZUh0bWw6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgdGVtcGxhdGUgPSBwbG90VGVtcGxhdGUudHBsUGxvdExpbmUsXG4gICAgICAgICAgICBsaW5lSHRtbCA9IHR1aS51dGlsLm1hcChwYXJhbXMucG9zaXRpb25zLCBmdW5jdGlvbihwb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIHZhciBjc3NUZXh0cyA9IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlclV0aWwuY29uY2F0U3RyKHBhcmFtcy5wb3NpdGlvblR5cGUsICc6JywgcG9zaXRpb24sICdweCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyVXRpbC5jb25jYXRTdHIocGFyYW1zLnNpemVUeXBlLCAnOicsIHBhcmFtcy5zaXplLCAncHgnKVxuICAgICAgICAgICAgICAgICAgICBdLCBkYXRhO1xuXG4gICAgICAgICAgICAgICAgaWYgKHBhcmFtcy5saW5lQ29sb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgY3NzVGV4dHMucHVzaChyZW5kZXJVdGlsLmNvbmNhdFN0cignYmFja2dyb3VuZC1jb2xvcjonLCBwYXJhbXMubGluZUNvbG9yKSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtjbGFzc05hbWU6IHBhcmFtcy5jbGFzc05hbWUsIGNzc1RleHQ6IGNzc1RleHRzLmpvaW4oJzsnKX07XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRlbXBsYXRlKGRhdGEpO1xuICAgICAgICAgICAgfSwgdGhpcykuam9pbignJyk7XG4gICAgICAgIHJldHVybiBsaW5lSHRtbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBwaXhlbCB2YWx1ZSBvZiB2ZXJ0aWNhbCBwb3NpdGlvbnNcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0IHBsb3QgaGVpZ2h0XG4gICAgICogQHJldHVybnMge2FycmF5LjxudW1iZXI+fSBwb3NpdGlvbnNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlVmVydGljYWxQaXhlbFBvc2l0aW9uczogZnVuY3Rpb24oaGVpZ2h0KSB7XG4gICAgICAgIHZhciBwb3NpdGlvbnMgPSBjYWxjdWxhdG9yLm1ha2VUaWNrUGl4ZWxQb3NpdGlvbnMoaGVpZ2h0LCB0aGlzLnZUaWNrQ291bnQpO1xuICAgICAgICBwb3NpdGlvbnMuc2hpZnQoKTtcbiAgICAgICAgcmV0dXJuIHBvc2l0aW9ucztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBwaXhlbCB2YWx1ZSBvZiBob3Jpem9udGFsIHBvc2l0aW9ucy5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGggcGxvdCB3aWR0aFxuICAgICAqIEByZXR1cm5zIHthcnJheS48bnVtYmVyPn0gcG9zaXRpb25zXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUhvcml6b250YWxQaXhlbFBvc2l0aW9uczogZnVuY3Rpb24od2lkdGgpIHtcbiAgICAgICAgdmFyIHBvc2l0aW9ucyA9IGNhbGN1bGF0b3IubWFrZVRpY2tQaXhlbFBvc2l0aW9ucyh3aWR0aCwgdGhpcy5oVGlja0NvdW50KTtcbiAgICAgICAgcG9zaXRpb25zLnNoaWZ0KCk7XG4gICAgICAgIHJldHVybiBwb3NpdGlvbnM7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUGxvdDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBUaGlzIGlzIHRlbXBsYXRlcyBvZiBwbG90IHZpZXcgLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxudmFyIHRlbXBsYXRlTWFrZXIgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3RlbXBsYXRlTWFrZXInKTtcblxudmFyIHRhZ3MgPSB7XG4gICAgSFRNTF9QTE9UX0xJTkU6ICc8ZGl2IGNsYXNzPVwidHVpLWNoYXJ0LXBsb3QtbGluZSB7eyBjbGFzc05hbWUgfX1cIiBzdHlsZT1cInt7IGNzc1RleHQgfX1cIj48L2Rpdj4nXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICB0cGxQbG90TGluZTogdGVtcGxhdGVNYWtlci50ZW1wbGF0ZSh0YWdzLkhUTUxfUExPVF9MSU5FKVxufTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBSYXBoYWVsIHJlbmRlciBwbHVnaW4uXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBCYXJDaGFydCA9IHJlcXVpcmUoJy4vcmFwaGFlbEJhckNoYXJ0JyksXG4gICAgTGluZUNoYXJ0ID0gcmVxdWlyZSgnLi9yYXBoYWVsTGluZUNoYXJ0JyksXG4gICAgQXJlYUNoYXJ0ID0gcmVxdWlyZSgnLi9yYXBoYWVsQXJlYUNoYXJ0JyksXG4gICAgUGllQ2hhcnQgPSByZXF1aXJlKCcuL3JhcGhhZWxQaWVDaGFydCcpO1xuXG52YXIgcGx1Z2luTmFtZSA9ICdyYXBoYWVsJyxcbiAgICBwbHVnaW5SYXBoYWVsO1xuXG5wbHVnaW5SYXBoYWVsID0ge1xuICAgIGJhcjogQmFyQ2hhcnQsXG4gICAgY29sdW1uOiBCYXJDaGFydCxcbiAgICBsaW5lOiBMaW5lQ2hhcnQsXG4gICAgYXJlYTogQXJlYUNoYXJ0LFxuICAgIHBpZTogUGllQ2hhcnRcbn07XG5cbnR1aS5jaGFydC5yZWdpc3RlclBsdWdpbihwbHVnaW5OYW1lLCBwbHVnaW5SYXBoYWVsKTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBSYXBoYWVsIGFyZWEgY2hhcnQgcmVuZGVyZXIuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSYXBoYWVsTGluZUJhc2UgPSByZXF1aXJlKCcuL3JhcGhhZWxMaW5lVHlwZUJhc2UnKSxcbiAgICByYXBoYWVsUmVuZGVyVXRpbCA9IHJlcXVpcmUoJy4vcmFwaGFlbFJlbmRlclV0aWwnKTtcblxudmFyIFJhcGhhZWwgPSB3aW5kb3cuUmFwaGFlbCxcbiAgICBBTklNQVRJT05fVElNRSA9IDcwMDtcblxudmFyIGNvbmNhdCA9IEFycmF5LnByb3RvdHlwZS5jb25jYXQ7XG5cbi8qKlxuICogQGNsYXNzZGVzYyBSYXBoYWVsQXJlYUNoYXJ0IGlzIGdyYXBoIHJlbmRlcmVyIGZvciBhcmVhIGNoYXJ0LlxuICogQGNsYXNzIFJhcGhhZWxBcmVhQ2hhcnRcbiAqIEBleHRlbmRzIFJhcGhhZWxMaW5lVHlwZUJhc2VcbiAqL1xudmFyIFJhcGhhZWxBcmVhQ2hhcnQgPSB0dWkudXRpbC5kZWZpbmVDbGFzcyhSYXBoYWVsTGluZUJhc2UsIC8qKiBAbGVuZHMgUmFwaGFlbEFyZWFDaGFydC5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIFJlbmRlciBmdW5jdGlvbiBvZiBhcmVhIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNvbnRhaW5lclxuICAgICAqIEBwYXJhbSB7e2dyb3VwUG9zaXRpb25zOiBhcnJheS48YXJyYXk+LCBkaW1lbnNpb246IG9iamVjdCwgdGhlbWU6IG9iamVjdCwgb3B0aW9uczogb2JqZWN0fX0gZGF0YSByZW5kZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGluQ2FsbGJhY2sgaW4gY2FsbGJhY2tcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvdXRDYWxsYmFjayBvdXQgY2FsbGJhY2tcbiAgICAgKiBAcmV0dXJuIHtvYmplY3R9IHBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKi9cbiAgICByZW5kZXI6IGZ1bmN0aW9uKHBhcGVyLCBjb250YWluZXIsIGRhdGEsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKSB7XG4gICAgICAgIHZhciBkaW1lbnNpb24gPSBkYXRhLmRpbWVuc2lvbixcbiAgICAgICAgICAgIGdyb3VwUG9zaXRpb25zID0gZGF0YS5ncm91cFBvc2l0aW9ucyxcbiAgICAgICAgICAgIHRoZW1lID0gZGF0YS50aGVtZSxcbiAgICAgICAgICAgIGNvbG9ycyA9IHRoZW1lLmNvbG9ycyxcbiAgICAgICAgICAgIG9wYWNpdHkgPSBkYXRhLm9wdGlvbnMuaGFzRG90ID8gMSA6IDAsXG4gICAgICAgICAgICBncm91cFBhdGhzID0gdGhpcy5fZ2V0QXJlYXNQYXRoKGdyb3VwUG9zaXRpb25zLCBkYXRhLnplcm9Ub3ApLFxuICAgICAgICAgICAgYm9yZGVyU3R5bGUgPSB0aGlzLm1ha2VCb3JkZXJTdHlsZSh0aGVtZS5ib3JkZXJDb2xvciwgb3BhY2l0eSksXG4gICAgICAgICAgICBvdXREb3RTdHlsZSA9IHRoaXMubWFrZU91dERvdFN0eWxlKG9wYWNpdHksIGJvcmRlclN0eWxlKSxcbiAgICAgICAgICAgIGdyb3VwQXJlYXMsIHRvb2x0aXBMaW5lLCBncm91cERvdHM7XG5cbiAgICAgICAgaWYgKCFwYXBlcikge1xuICAgICAgICAgICAgcGFwZXIgPSBSYXBoYWVsKGNvbnRhaW5lciwgZGltZW5zaW9uLndpZHRoLCBkaW1lbnNpb24uaGVpZ2h0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGdyb3VwQXJlYXMgPSB0aGlzLl9yZW5kZXJBcmVhcyhwYXBlciwgZ3JvdXBQYXRocywgY29sb3JzKTtcbiAgICAgICAgdG9vbHRpcExpbmUgPSB0aGlzLl9yZW5kZXJUb29sdGlwTGluZShwYXBlciwgZGltZW5zaW9uLmhlaWdodCk7XG4gICAgICAgIGdyb3VwRG90cyA9IHRoaXMucmVuZGVyRG90cyhwYXBlciwgZ3JvdXBQb3NpdGlvbnMsIGNvbG9ycywgYm9yZGVyU3R5bGUpO1xuXG4gICAgICAgIHRoaXMub3V0RG90U3R5bGUgPSBvdXREb3RTdHlsZTtcbiAgICAgICAgdGhpcy5ncm91cFBhdGhzID0gZ3JvdXBQYXRocztcbiAgICAgICAgdGhpcy5ncm91cEFyZWFzID0gZ3JvdXBBcmVhcztcbiAgICAgICAgdGhpcy50b29sdGlwTGluZSA9IHRvb2x0aXBMaW5lO1xuICAgICAgICB0aGlzLmdyb3VwRG90cyA9IGdyb3VwRG90cztcbiAgICAgICAgdGhpcy5kb3RPcGFjaXR5ID0gb3BhY2l0eTtcblxuICAgICAgICB0aGlzLmF0dGFjaEV2ZW50KGdyb3VwRG90cywgZ3JvdXBQb3NpdGlvbnMsIG91dERvdFN0eWxlLCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjayk7XG5cbiAgICAgICAgcmV0dXJuIHBhcGVyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgYXJlYSBncmFwaC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgcGFwZXJcbiAgICAgKiBAcGFyYW0ge3tzdGFydDogc3RyaW5nLCBhZGRTdGFydDogc3RyaW5nfX0gcGF0aCBwYXRoXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbG9yIGNvbG9yXG4gICAgICogQHJldHVybnMge2FycmF5LjxvYmplY3Q+fSByYXBoYWVsIG9iamVjdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlckFyZWE6IGZ1bmN0aW9uKHBhcGVyLCBwYXRoLCBjb2xvcikge1xuICAgICAgICB2YXIgcmVzdWx0ID0gW10sXG4gICAgICAgICAgICBhcmVhID0gcGFwZXIucGF0aChbcGF0aC5zdGFydF0pLFxuICAgICAgICAgICAgZmlsbFN0eWxlID0ge1xuICAgICAgICAgICAgICAgIGZpbGw6IGNvbG9yLFxuICAgICAgICAgICAgICAgIG9wYWNpdHk6IDAuNSxcbiAgICAgICAgICAgICAgICBzdHJva2U6IGNvbG9yLFxuICAgICAgICAgICAgICAgICdzdHJva2Utb3BhY2l0eSc6IDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhZGRBcmVhO1xuXG4gICAgICAgIGFyZWEuYXR0cihmaWxsU3R5bGUpO1xuICAgICAgICByZXN1bHQucHVzaChhcmVhKTtcblxuICAgICAgICBpZiAocGF0aC5hZGRTdGFydCkge1xuICAgICAgICAgICAgYWRkQXJlYSA9IHBhcGVyLnBhdGgoW3BhdGguYWRkU3RhcnRdKTtcbiAgICAgICAgICAgIGFkZEFyZWEuYXR0cihmaWxsU3R5bGUpO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goYWRkQXJlYSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGFyZWEgZ3JhcGhzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciBwYXBlclxuICAgICAqIEBwYXJhbSB7YXJyYXkuPG9iamVjdD59IGdyb3VwUGF0aHMgZ3JvdXAgcGF0aHNcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBjb2xvcnMgY29sb3JzXG4gICAgICogQHJldHVybnMge2FycmF5fSByYXBoYWVsIG9iamVjdHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJBcmVhczogZnVuY3Rpb24ocGFwZXIsIGdyb3VwUGF0aHMsIGNvbG9ycykge1xuICAgICAgICB2YXIgZ3JvdXBBcmVhcyA9IHR1aS51dGlsLm1hcChncm91cFBhdGhzLCBmdW5jdGlvbihwYXRocywgZ3JvdXBJbmRleCkge1xuICAgICAgICAgICAgdmFyIGNvbG9yID0gY29sb3JzW2dyb3VwSW5kZXhdIHx8ICd0cmFuc3BhcmVudCc7XG4gICAgICAgICAgICByZXR1cm4gdHVpLnV0aWwubWFwKHBhdGhzLCBmdW5jdGlvbihwYXRoKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgYXJlYTogdGhpcy5fcmVuZGVyQXJlYShwYXBlciwgcGF0aC5hcmVhLCBjb2xvciksXG4gICAgICAgICAgICAgICAgICAgIGxpbmU6IHJhcGhhZWxSZW5kZXJVdGlsLnJlbmRlckxpbmUocGFwZXIsIHBhdGgubGluZS5zdGFydCwgY29sb3IpXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIHJldHVybiBncm91cEFyZWFzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIG1pbnVzIG9yIG5vdC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgdmFsdWVcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gcmVzdWx0IGJvb2xlYW5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc01pbnVzOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdmFsdWUgPCAwO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIHBsdXMgb3Igbm90LlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSB2YWx1ZVxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSByZXN1bHQgYm9vbGVhblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2lzUGx1czogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlID49IDA7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgaGVpZ2h0LlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB0b3AgdG9wXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHplcm9Ub3AgemVybyBwb3NpdGlvbiB0b3BcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBoZWlnaHRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlSGVpZ2h0OiBmdW5jdGlvbih0b3AsIHplcm9Ub3ApIHtcbiAgICAgICAgcmV0dXJuIE1hdGguYWJzKHRvcCAtIHplcm9Ub3ApO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGaW5kIG1pZGRsZSBsZWZ0XG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IGZyb21Qb3MgZnJvbSBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSB0b1BvcyB0byBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB6ZXJvVG9wIHplcm8gcG9zaXRpb24gdG9wXG4gICAgICogQHJldHVybnMge251bWJlcn0gbWlkZGxlIGxlZnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9maW5kTWlkZGxlTGVmdDogZnVuY3Rpb24oZnJvbVBvcywgdG9Qb3MsIHplcm9Ub3ApIHtcbiAgICAgICAgdmFyIHRvcHMgPSBbemVyb1RvcCAtIGZyb21Qb3MudG9wLCB6ZXJvVG9wIC0gdG9Qb3MudG9wXSxcbiAgICAgICAgICAgIG1pZGRsZUxlZnQsIHdpZHRoLCBmcm9tSGVpZ2h0LCB0b0hlaWdodDtcblxuICAgICAgICBpZiAodHVpLnV0aWwuYWxsKHRvcHMsIHRoaXMuX2lzTWludXMpIHx8IHR1aS51dGlsLmFsbCh0b3BzLCB0aGlzLl9pc1BsdXMpKSB7XG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH1cblxuICAgICAgICBmcm9tSGVpZ2h0ID0gdGhpcy5fbWFrZUhlaWdodChmcm9tUG9zLnRvcCwgemVyb1RvcCk7XG4gICAgICAgIHRvSGVpZ2h0ID0gdGhpcy5fbWFrZUhlaWdodCh0b1Bvcy50b3AsIHplcm9Ub3ApO1xuICAgICAgICB3aWR0aCA9IHRvUG9zLmxlZnQgLSBmcm9tUG9zLmxlZnQ7XG5cbiAgICAgICAgbWlkZGxlTGVmdCA9IGZyb21Qb3MubGVmdCArICh3aWR0aCAqIChmcm9tSGVpZ2h0IC8gKGZyb21IZWlnaHQgKyB0b0hlaWdodCkpKTtcbiAgICAgICAgcmV0dXJuIG1pZGRsZUxlZnQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYXJlYSBwYXRoLlxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBmcm9tUG9zIGZyb20gcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gdG9Qb3MgdG8gcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gemVyb1RvcCB6ZXJvIHBvc2l0aW9uIHRvcFxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGFyZWEgcGF0aFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VBcmVhUGF0aDogZnVuY3Rpb24oZnJvbVBvcywgdG9Qb3MsIHplcm9Ub3ApIHtcbiAgICAgICAgdmFyIGZyb21TdGFydFBvaW50ID0gWydNJywgZnJvbVBvcy5sZWZ0LCAnICcsIHplcm9Ub3BdLFxuICAgICAgICAgICAgZnJvbUVuZFBvaW50ID0gemVyb1RvcCA9PT0gZnJvbVBvcy50b3AgPyBbXSA6IFsnTCcsIGZyb21Qb3MubGVmdCwgJyAnLCBmcm9tUG9zLnRvcF0sXG4gICAgICAgICAgICB0b1N0YXJ0UG9pbnQgPSBbJ0wnLCB0b1Bvcy5sZWZ0LCAnICcsIHRvUG9zLnRvcF0sXG4gICAgICAgICAgICB0b0VuZFBvaW50ID0gemVyb1RvcCA9PT0gdG9Qb3MudG9wID8gW10gOiBbJ0wnLCB0b1Bvcy5sZWZ0LCAnICcsIHplcm9Ub3BdO1xuICAgICAgICByZXR1cm4gY29uY2F0LmNhbGwoW10sIGZyb21TdGFydFBvaW50LCBmcm9tRW5kUG9pbnQsIHRvU3RhcnRQb2ludCwgdG9FbmRQb2ludCkuam9pbignJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYXJlYSBwYXRocy5cbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gZnJvbVBvcyBmcm9tIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IHRvUG9zIHRvIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHplcm9Ub3AgemVybyBwb3NpdGlvbiB0b3BcbiAgICAgKiBAcmV0dXJucyB7e1xuICAgICAqICAgICAgc3RhcnQ6IHN0cmluZyxcbiAgICAgKiAgICAgIGVuZDogc3RyaW5nLFxuICAgICAqICAgICAgYWRkU3RhcnQ6IHN0cmluZyxcbiAgICAgKiAgICAgIGFkZEVuZDogc3RyaW5nXG4gICAgICogfX0gYXJlYSBwYXRoc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VBcmVhUGF0aHM6IGZ1bmN0aW9uKGZyb21Qb3MsIHRvUG9zLCB6ZXJvVG9wKSB7XG4gICAgICAgIHZhciBtaWRkbGVMZWZ0ID0gdGhpcy5fZmluZE1pZGRsZUxlZnQoZnJvbVBvcywgdG9Qb3MsIHplcm9Ub3ApLFxuICAgICAgICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgIHN0YXJ0OiB0aGlzLl9tYWtlQXJlYVBhdGgoZnJvbVBvcywgZnJvbVBvcywgemVyb1RvcClcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtaWRkbGVQb3M7XG5cbiAgICAgICAgaWYgKHRoaXMuX2lzUGx1cyhtaWRkbGVMZWZ0KSkge1xuICAgICAgICAgICAgbWlkZGxlUG9zID0ge2xlZnQ6IG1pZGRsZUxlZnQsIHRvcDogemVyb1RvcH07XG4gICAgICAgICAgICByZXN1bHQuZW5kID0gdGhpcy5fbWFrZUFyZWFQYXRoKGZyb21Qb3MsIG1pZGRsZVBvcywgemVyb1RvcCk7XG4gICAgICAgICAgICByZXN1bHQuYWRkU3RhcnQgPSB0aGlzLl9tYWtlQXJlYVBhdGgobWlkZGxlUG9zLCBtaWRkbGVQb3MsIHplcm9Ub3ApO1xuICAgICAgICAgICAgcmVzdWx0LmFkZEVuZCA9IHRoaXMuX21ha2VBcmVhUGF0aChtaWRkbGVQb3MsIHRvUG9zLCB6ZXJvVG9wKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdC5lbmQgPSB0aGlzLl9tYWtlQXJlYVBhdGgoZnJvbVBvcywgdG9Qb3MsIHplcm9Ub3ApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGFyZWEgcGF0aC5cbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheS48b2JqZWN0Pj59IGdyb3VwUG9zaXRpb25zIHBvc2l0aW9uc1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB6ZXJvVG9wIHplcm8gdG9wXG4gICAgICogQHJldHVybnMge2FycmF5LjxhcnJheS48c3RyaW5nPj59IHBhdGhzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0QXJlYXNQYXRoOiBmdW5jdGlvbihncm91cFBvc2l0aW9ucywgemVyb1RvcCkge1xuICAgICAgICB2YXIgZ3JvdXBQYXRocyA9IHR1aS51dGlsLm1hcChncm91cFBvc2l0aW9ucywgZnVuY3Rpb24ocG9zaXRpb25zKSB7XG4gICAgICAgICAgICB2YXIgZnJvbVBvcyA9IHBvc2l0aW9uc1swXSxcbiAgICAgICAgICAgICAgICByZXN0ID0gcG9zaXRpb25zLnNsaWNlKDEpO1xuICAgICAgICAgICAgcmV0dXJuIHR1aS51dGlsLm1hcChyZXN0LCBmdW5jdGlvbihwb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIGFyZWE6IHRoaXMuX21ha2VBcmVhUGF0aHMoZnJvbVBvcywgcG9zaXRpb24sIHplcm9Ub3ApLFxuICAgICAgICAgICAgICAgICAgICBsaW5lOiB0aGlzLm1ha2VMaW5lUGF0aChmcm9tUG9zLCBwb3NpdGlvbilcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGZyb21Qb3MgPSBwb3NpdGlvbjtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgICByZXR1cm4gZ3JvdXBQYXRocztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQW5pbWF0ZSBhcmVhIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBhcmVhIHJhcGhhZWwgb2JqZWN0XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGFyZWFQYXRoIHBhdGhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdGltZSBwbGF5IHRpbWVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3RhcnRUaW1lIHN0YXJ0IHRpbWVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hbmltYXRlQXJlYTogZnVuY3Rpb24oYXJlYSwgYXJlYVBhdGgsIHRpbWUsIHN0YXJ0VGltZSkge1xuICAgICAgICB2YXIgYXJlYUFkZEVuZFBhdGggPSBhcmVhUGF0aC5hZGRFbmQsXG4gICAgICAgICAgICBhcmVhRW5kUGF0aCA9IGFyZWFQYXRoLmVuZDtcbiAgICAgICAgaWYgKGFyZWFBZGRFbmRQYXRoKSB7XG4gICAgICAgICAgICB0aW1lID0gdGltZSAvIDI7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGFyZWFbMV0uYW5pbWF0ZSh7cGF0aDogYXJlYUFkZEVuZFBhdGgsICdzdHJva2Utb3BhY2l0eSc6IDAuMjV9LCB0aW1lKTtcbiAgICAgICAgICAgIH0sIHN0YXJ0VGltZSArIHRpbWUpO1xuICAgICAgICB9XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBhcmVhWzBdLmFuaW1hdGUoe3BhdGg6IGFyZWFFbmRQYXRoLCAnc3Ryb2tlLW9wYWNpdHknOiAwLjI1fSwgdGltZSk7XG4gICAgICAgIH0sIHN0YXJ0VGltZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFuaW1hdGUuXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgY2FsbGJhY2tcbiAgICAgKi9cbiAgICBhbmltYXRlOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICB2YXIgZ3JvdXBBcmVhcyA9IHRoaXMuZ3JvdXBBcmVhcyxcbiAgICAgICAgICAgIGdyb3VwUGF0aHMgPSB0aGlzLmdyb3VwUGF0aHMsXG4gICAgICAgICAgICBvcGFjaXR5ID0gdGhpcy5kb3RPcGFjaXR5LFxuICAgICAgICAgICAgdGltZSA9IEFOSU1BVElPTl9USU1FIC8gZ3JvdXBBcmVhc1swXS5sZW5ndGgsXG4gICAgICAgICAgICBzdGFydFRpbWU7XG4gICAgICAgIHR1aS51dGlsLmZvckVhY2hBcnJheSh0aGlzLmdyb3VwRG90cywgZnVuY3Rpb24oZG90cywgZ3JvdXBJbmRleCkge1xuICAgICAgICAgICAgc3RhcnRUaW1lID0gMDtcbiAgICAgICAgICAgIHR1aS51dGlsLmZvckVhY2hBcnJheShkb3RzLCBmdW5jdGlvbihkb3QsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdmFyIGFyZWEsIGFyZWFQYXRoO1xuICAgICAgICAgICAgICAgIGlmIChpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICBhcmVhID0gZ3JvdXBBcmVhc1tncm91cEluZGV4XVtpbmRleCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICBhcmVhUGF0aCA9IGdyb3VwUGF0aHNbZ3JvdXBJbmRleF1baW5kZXggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hbmltYXRlTGluZShhcmVhLmxpbmUsIGFyZWFQYXRoLmxpbmUuZW5kLCB0aW1lLCBzdGFydFRpbWUpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hbmltYXRlQXJlYShhcmVhLmFyZWEsIGFyZWFQYXRoLmFyZWEsIHRpbWUsIHN0YXJ0VGltZSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0VGltZSArPSB0aW1lO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChvcGFjaXR5KSB7XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb3QuYXR0cih7J2ZpbGwtb3BhY2l0eSc6IG9wYWNpdHl9KTtcbiAgICAgICAgICAgICAgICAgICAgfSwgc3RhcnRUaW1lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGNhbGxiYWNrLCBzdGFydFRpbWUpO1xuICAgICAgICB9XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmFwaGFlbEFyZWFDaGFydDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBSYXBoYWVsIGJhciBjaGFydCByZW5kZXJlci5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcbnZhciByYXBoYWVsUmVuZGVyVXRpbCA9IHJlcXVpcmUoJy4vcmFwaGFlbFJlbmRlclV0aWwnKTtcblxudmFyIFJhcGhhZWwgPSB3aW5kb3cuUmFwaGFlbDtcblxudmFyIEFOSU1BVElPTl9USU1FID0gNzAwO1xuXG4vKipcbiAqIEBjbGFzc2Rlc2MgUmFwaGFlbEJhckNoYXJ0IGlzIGdyYXBoIHJlbmRlcmVyIGZvciBiYXIsIGNvbHVtbiBjaGFydC5cbiAqIEBjbGFzcyBSYXBoYWVsQmFyQ2hhcnRcbiAqL1xudmFyIFJhcGhhZWxCYXJDaGFydCA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgUmFwaGFlbEJhckNoYXJ0LnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogUmVuZGVyIGZ1bmN0aW9uIG9mIGJhciBjaGFydFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNvbnRhaW5lciBlbGVtZW50XG4gICAgICogQHBhcmFtIHt7c2l6ZTogb2JqZWN0LCBtb2RlbDogb2JqZWN0LCBvcHRpb25zOiBvYmplY3QsIHRvb2x0aXBQb3NpdGlvbjogc3RyaW5nfX0gZGF0YSBjaGFydCBkYXRhXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gaW5DYWxsYmFjayBtb3VzZW92ZXIgY2FsbGJhY2tcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvdXRDYWxsYmFjayBtb3VzZW91dCBjYWxsYmFja1xuICAgICAqIEByZXR1cm4ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqL1xuICAgIHJlbmRlcjogZnVuY3Rpb24ocGFwZXIsIGNvbnRhaW5lciwgZGF0YSwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGdyb3VwQm91bmRzID0gZGF0YS5ncm91cEJvdW5kcyxcbiAgICAgICAgICAgIGRpbWVuc2lvbiA9IGRhdGEuZGltZW5zaW9uLFxuICAgICAgICAgICAgYmFzZVBhcmFtcztcblxuICAgICAgICBpZiAoIWdyb3VwQm91bmRzKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghcGFwZXIpIHtcbiAgICAgICAgICAgIHBhcGVyID0gUmFwaGFlbChjb250YWluZXIsIGRpbWVuc2lvbi53aWR0aCwgZGltZW5zaW9uLmhlaWdodCk7XG4gICAgICAgIH1cblxuICAgICAgICBiYXNlUGFyYW1zID0ge1xuICAgICAgICAgICAgcGFwZXI6IHBhcGVyLFxuICAgICAgICAgICAgdGhlbWU6IGRhdGEudGhlbWUsXG4gICAgICAgICAgICBncm91cEJvdW5kczogZ3JvdXBCb3VuZHMsXG4gICAgICAgICAgICBncm91cFZhbHVlczogZGF0YS5ncm91cFZhbHVlcyxcbiAgICAgICAgICAgIGNoYXJ0VHlwZTogZGF0YS5jaGFydFR5cGVcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLl9yZW5kZXJCYXJzKHR1aS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICBpbkNhbGxiYWNrOiBpbkNhbGxiYWNrLFxuICAgICAgICAgICAgb3V0Q2FsbGJhY2s6IG91dENhbGxiYWNrXG4gICAgICAgIH0sIGJhc2VQYXJhbXMpKTtcblxuICAgICAgICB0aGlzLl9yZW5kZXJCYXJCb3JkZXJzKGJhc2VQYXJhbXMpO1xuXG4gICAgICAgIHRoaXMuY2hhcnRUeXBlID0gZGF0YS5jaGFydFR5cGU7XG5cbiAgICAgICAgcmV0dXJuIHBhcGVyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgcmVjdFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5wYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLmNvbG9yIHNlcmllcyBjb2xvclxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5ib3JkZXJDb2xvciBzZXJpZXMgYm9yZGVyQ29sb3JcbiAgICAgKiAgICAgIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gcGFyYW1zLmJvdW5kIGJvdW5kXG4gICAgICogQHJldHVybnMge29iamVjdH0gYmFyIHJlY3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJCYXI6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgYm91bmQgPSBwYXJhbXMuYm91bmQsXG4gICAgICAgICAgICByZWN0O1xuICAgICAgICBpZiAoYm91bmQud2lkdGggPCAwIHx8IGJvdW5kLmhlaWdodCA8IDApIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVjdCA9IHBhcmFtcy5wYXBlci5yZWN0KGJvdW5kLmxlZnQsIGJvdW5kLnRvcCwgYm91bmQud2lkdGgsIGJvdW5kLmhlaWdodCk7XG4gICAgICAgIHJlY3QuYXR0cih7XG4gICAgICAgICAgICBmaWxsOiBwYXJhbXMuY29sb3IsXG4gICAgICAgICAgICBzdHJva2U6ICdub25lJ1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gcmVjdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQmluZCBob3ZlciBldmVudC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcmVjdCByYXBoYWVsIHJlY3RcbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGJvdW5kIGJvdW5kXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGlkIHRvb2x0aXAgaWRcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBpbkNhbGxiYWNrIGluIGNhbGxiYWNrXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gb3V0Q2FsbGJhY2sgb3V0IGNhbGxiYWNrXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYmluZEhvdmVyRXZlbnQ6IGZ1bmN0aW9uKHJlY3QsIGJvdW5kLCBncm91cEluZGV4LCBpbmRleCwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spIHtcbiAgICAgICAgcmVjdC5ob3ZlcihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGluQ2FsbGJhY2soYm91bmQsIGdyb3VwSW5kZXgsIGluZGV4KTtcbiAgICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBvdXRDYWxsYmFjaygpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGJhcnMuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKiAgICAgIEBwYXJhbSB7e2NvbG9yczogc3RyaW5nW10sIHNpbmdsZUNvbG9yczogc3RyaW5nW10sIGJvcmRlckNvbG9yOiBzdHJpbmd9fSBwYXJhbXMudGhlbWUgYmFyIGNoYXJ0IHRoZW1lXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheS48e2xlZnQ6IG51bWJlciwgdG9wOm51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9Pj59IHBhcmFtcy5ncm91cEJvdW5kcyBib3VuZHNcbiAgICAgKiAgICAgIEBwYXJhbSB7ZnVuY3Rpb259IHBhcmFtcy5pbkNhbGxiYWNrIGluIGNhbGxiYWNrXG4gICAgICogICAgICBAcGFyYW0ge2Z1bmN0aW9ufSBwYXJhbXMub3V0Q2FsbGJhY2sgb3V0IGNhbGxiYWNrXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyQmFyczogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBzaW5nbGVDb2xvcnMgPSAocGFyYW1zLmdyb3VwQm91bmRzWzBdLmxlbmd0aCA9PT0gMSkgJiYgcGFyYW1zLnRoZW1lLnNpbmdsZUNvbG9ycyB8fCBbXSxcbiAgICAgICAgICAgIGNvbG9ycyA9IHBhcmFtcy50aGVtZS5jb2xvcnMsXG4gICAgICAgICAgICBiYXJzID0gW107XG4gICAgICAgIHR1aS51dGlsLmZvckVhY2hBcnJheShwYXJhbXMuZ3JvdXBCb3VuZHMsIGZ1bmN0aW9uKGJvdW5kcywgZ3JvdXBJbmRleCkge1xuICAgICAgICAgICAgdmFyIHNpbmdsZUNvbG9yID0gc2luZ2xlQ29sb3JzW2dyb3VwSW5kZXhdO1xuICAgICAgICAgICAgdHVpLnV0aWwuZm9yRWFjaEFycmF5KGJvdW5kcywgZnVuY3Rpb24oYm91bmQsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdmFyIGNvbG9yLCBpZCwgcmVjdCwgdmFsdWU7XG5cbiAgICAgICAgICAgICAgICBpZiAoIWJvdW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb2xvciA9IHNpbmdsZUNvbG9yIHx8IGNvbG9yc1tpbmRleF07XG4gICAgICAgICAgICAgICAgaWQgPSBncm91cEluZGV4ICsgJy0nICsgaW5kZXg7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBwYXJhbXMuZ3JvdXBWYWx1ZXNbZ3JvdXBJbmRleF1baW5kZXhdO1xuICAgICAgICAgICAgICAgIHJlY3QgPSB0aGlzLl9yZW5kZXJCYXIoe1xuICAgICAgICAgICAgICAgICAgICBwYXBlcjogcGFyYW1zLnBhcGVyLFxuICAgICAgICAgICAgICAgICAgICBjaGFydFR5cGU6IHBhcmFtcy5jaGFydFR5cGUsXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiBjb2xvcixcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IHBhcmFtcy50aGVtZS5ib3JkZXJDb2xvcixcbiAgICAgICAgICAgICAgICAgICAgYm91bmQ6IGJvdW5kLnN0YXJ0LFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWVcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGlmIChyZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2JpbmRIb3ZlckV2ZW50KHJlY3QsIGJvdW5kLmVuZCwgZ3JvdXBJbmRleCwgaW5kZXgsIHBhcmFtcy5pbkNhbGxiYWNrLCBwYXJhbXMub3V0Q2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGJhcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHJlY3Q6IHJlY3QsXG4gICAgICAgICAgICAgICAgICAgIGJvdW5kOiBib3VuZC5lbmQsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIHRoaXMuYmFycyA9IGJhcnM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgcmVjdCBwb2ludHMuXG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6bnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGJvdW5kIHJlY3QgYm91bmRcbiAgICAgKiBAcmV0dXJucyB7e1xuICAgICAqICAgICAgbGVmdFRvcDoge2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9LFxuICAgICAqICAgICAgcmlnaHRUb3A6IHtsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfSxcbiAgICAgKiAgICAgIHJpZ2h0Qm90dG9tOiB7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn0sXG4gICAgICogICAgICBsZWZ0Qm90dG9tOiB7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn1cbiAgICAgKiB9fSByZWN0IHBvaW50c1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VSZWN0UG9pbnRzOiBmdW5jdGlvbihib3VuZCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbGVmdFRvcDoge1xuICAgICAgICAgICAgICAgIGxlZnQ6IE1hdGguY2VpbChib3VuZC5sZWZ0KSxcbiAgICAgICAgICAgICAgICB0b3A6IE1hdGguY2VpbChib3VuZC50b3ApXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmlnaHRUb3A6IHtcbiAgICAgICAgICAgICAgICBsZWZ0OiBNYXRoLmNlaWwoYm91bmQubGVmdCArIGJvdW5kLndpZHRoKSxcbiAgICAgICAgICAgICAgICB0b3A6IE1hdGguY2VpbChib3VuZC50b3ApXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmlnaHRCb3R0b206IHtcbiAgICAgICAgICAgICAgICBsZWZ0OiBNYXRoLmNlaWwoYm91bmQubGVmdCArIGJvdW5kLndpZHRoKSxcbiAgICAgICAgICAgICAgICB0b3A6IE1hdGguY2VpbChib3VuZC50b3AgKyBib3VuZC5oZWlnaHQpXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbGVmdEJvdHRvbToge1xuICAgICAgICAgICAgICAgIGxlZnQ6IE1hdGguY2VpbChib3VuZC5sZWZ0KSxcbiAgICAgICAgICAgICAgICB0b3A6IE1hdGguY2VpbChib3VuZC50b3AgKyBib3VuZC5oZWlnaHQpXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgdG9wIGxpbmUgcGF0aC5cbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1icmVyLCB0b3A6IG51bWJlcn19IGxlZnRUb3AgbGVmdCB0b3BcbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1icmVyLCB0b3A6IG51bWJlcn19IHJpZ2h0VG9wIHJpZ2h0IHRvcFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjaGFydFR5cGUgY2hhcnQgdHlwZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSB2YWx1ZVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IHRvcCBsaW5lIHBhdGhcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlVG9wTGluZVBhdGg6IGZ1bmN0aW9uKGxlZnRUb3AsIHJpZ2h0VG9wLCBjaGFydFR5cGUsIHZhbHVlKSB7XG4gICAgICAgIHZhciBjbG9uZUxlZnRUb3AgPSB0dWkudXRpbC5leHRlbmQoe30sIGxlZnRUb3ApO1xuICAgICAgICBjbG9uZUxlZnRUb3AubGVmdCAtPSBjaGFydFR5cGUgPT09ICdjb2x1bW4nIHx8IHZhbHVlIDwgMCA/IDEgOiAwO1xuICAgICAgICByZXR1cm4gcmFwaGFlbFJlbmRlclV0aWwubWFrZUxpbmVQYXRoKGNsb25lTGVmdFRvcCwgcmlnaHRUb3ApO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGJvcmRlciBsaW5lcyBwYXRocy5cbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDpudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gYm91bmQgcmVjdCBib3VuZFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjaGFydFR5cGUgY2hhcnQgdHlwZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSB2YWx1ZVxuICAgICAqIEByZXR1cm5zIHt7dG9wOiBzdHJpbmcsIHJpZ2h0OiBzdHJpbmcsIGJvdHRvbTogc3RyaW5nLCBsZWZ0OiBzdHJpbmd9fSBwYXRoc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VCb3JkZXJMaW5lc1BhdGhzOiBmdW5jdGlvbihib3VuZCwgY2hhcnRUeXBlLCB2YWx1ZSkge1xuICAgICAgICB2YXIgcG9pbnRzID0gdGhpcy5fbWFrZVJlY3RQb2ludHMoYm91bmQpLFxuICAgICAgICAgICAgcGF0aHMgPSB7fTtcblxuICAgICAgICBpZiAoY2hhcnRUeXBlID09PSAnYmFyJyB8fCB2YWx1ZSA+PSAwKSB7XG4gICAgICAgICAgICBwYXRocy50b3AgPSB0aGlzLl9tYWtlVG9wTGluZVBhdGgocG9pbnRzLmxlZnRUb3AsIHBvaW50cy5yaWdodFRvcCwgY2hhcnRUeXBlLCB2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2hhcnRUeXBlID09PSAnY29sdW1uJyB8fCB2YWx1ZSA+PSAwKSB7XG4gICAgICAgICAgICBwYXRocy5yaWdodCA9IHJhcGhhZWxSZW5kZXJVdGlsLm1ha2VMaW5lUGF0aChwb2ludHMucmlnaHRUb3AsIHBvaW50cy5yaWdodEJvdHRvbSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2hhcnRUeXBlID09PSAnYmFyJyB8fCB2YWx1ZSA8IDApIHtcbiAgICAgICAgICAgIHBhdGhzLmJvdHRvbSA9IHJhcGhhZWxSZW5kZXJVdGlsLm1ha2VMaW5lUGF0aChwb2ludHMubGVmdEJvdHRvbSwgcG9pbnRzLnJpZ2h0Qm90dG9tKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjaGFydFR5cGUgPT09ICdjb2x1bW4nIHx8IHZhbHVlIDwgMCkge1xuICAgICAgICAgICAgcGF0aHMubGVmdCA9IHJhcGhhZWxSZW5kZXJVdGlsLm1ha2VMaW5lUGF0aChwb2ludHMubGVmdFRvcCwgcG9pbnRzLmxlZnRCb3R0b20pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhdGhzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgYm9yZGVyIGxpbmVzO1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5wYXBlciBwYXBlclxuICAgICAqICAgICAgQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6bnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IHBhcmFtcy5ib3VuZCBiYXIgYm91bmRcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMuYm9yZGVyQ29sb3IgYm9yZGVyIGNvbG9yXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLmNoYXJ0VHlwZSBjaGFydCB0eXBlXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnZhbHVlIHZhbHVlXG4gICAgICogQHJldHVybnMge29iamVjdH0gcmFwaGFlbCBvYmplY3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJCb3JkZXJMaW5lczogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBib3JkZXJMaW5lUGF0aHMgPSB0aGlzLl9tYWtlQm9yZGVyTGluZXNQYXRocyhwYXJhbXMuYm91bmQsIHBhcmFtcy5jaGFydFR5cGUsIHBhcmFtcy52YWx1ZSksXG4gICAgICAgICAgICBsaW5lcyA9IHt9O1xuICAgICAgICB0dWkudXRpbC5mb3JFYWNoKGJvcmRlckxpbmVQYXRocywgZnVuY3Rpb24ocGF0aCwgbmFtZSkge1xuICAgICAgICAgICAgbGluZXNbbmFtZV0gPSByYXBoYWVsUmVuZGVyVXRpbC5yZW5kZXJMaW5lKHBhcmFtcy5wYXBlciwgcGF0aCwgcGFyYW1zLmJvcmRlckNvbG9yLCAxKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBsaW5lcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGJhciBib3JkZXJzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5wYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICogICAgICBAcGFyYW0ge3tjb2xvcnM6IHN0cmluZ1tdLCBzaW5nbGVDb2xvcnM6IHN0cmluZ1tdLCBib3JkZXJDb2xvcjogc3RyaW5nfX0gcGFyYW1zLnRoZW1lIGJhciBjaGFydCB0aGVtZVxuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48YXJyYXkuPHtsZWZ0OiBudW1iZXIsIHRvcDpudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfT4+fSBwYXJhbXMuZ3JvdXBCb3VuZHMgYm91bmRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyQmFyQm9yZGVyczogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBib3JkZXJDb2xvciA9IHBhcmFtcy50aGVtZS5ib3JkZXJDb2xvcixcbiAgICAgICAgICAgIGJvcmRlcnMgPSBbXTtcblxuICAgICAgICB0aGlzLmJvcmRlcnMgPSBib3JkZXJzO1xuXG4gICAgICAgIGlmICghYm9yZGVyQ29sb3IpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHR1aS51dGlsLmZvckVhY2hBcnJheShwYXJhbXMuZ3JvdXBCb3VuZHMsIGZ1bmN0aW9uKGJvdW5kcywgZ3JvdXBJbmRleCkge1xuICAgICAgICAgICAgdHVpLnV0aWwuZm9yRWFjaEFycmF5KGJvdW5kcywgZnVuY3Rpb24oYm91bmQsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlLCBib3JkZXJMaW5lcztcblxuICAgICAgICAgICAgICAgIGlmICghYm91bmQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhbHVlID0gcGFyYW1zLmdyb3VwVmFsdWVzW2dyb3VwSW5kZXhdW2luZGV4XTtcbiAgICAgICAgICAgICAgICBib3JkZXJMaW5lcyA9IHRoaXMuX3JlbmRlckJvcmRlckxpbmVzKHtcbiAgICAgICAgICAgICAgICAgICAgcGFwZXI6IHBhcmFtcy5wYXBlcixcbiAgICAgICAgICAgICAgICAgICAgYm91bmQ6IGJvdW5kLnN0YXJ0LFxuICAgICAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogYm9yZGVyQ29sb3IsXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0VHlwZTogcGFyYW1zLmNoYXJ0VHlwZSxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYm9yZGVycy5wdXNoKGJvcmRlckxpbmVzKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQW5pbWF0ZSByZWN0LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSByZWN0IHJhcGhhZWwgb2JqZWN0XG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6bnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGJvdW5kIHJlY3QgYm91bmRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hbmltYXRlUmVjdDogZnVuY3Rpb24ocmVjdCwgYm91bmQpIHtcbiAgICAgICAgcmVjdC5hbmltYXRlKHtcbiAgICAgICAgICAgIHg6IGJvdW5kLmxlZnQsXG4gICAgICAgICAgICB5OiBib3VuZC50b3AsXG4gICAgICAgICAgICB3aWR0aDogYm91bmQud2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IGJvdW5kLmhlaWdodFxuICAgICAgICB9LCBBTklNQVRJT05fVElNRSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFuaW1hdGUgYm9yZGVycy5cbiAgICAgKiBAcGFyYW0ge2FycmF5LjxvYmplY3Q+fSBsaW5lcyByYXBoYWVsIG9iamVjdHNcbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDpudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gYm91bmQgcmVjdCBib3VuZFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjaGFydFR5cGUgY2hhcnQgdHlwZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSB2YWx1ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2FuaW1hdGVCb3JkZXJzOiBmdW5jdGlvbihsaW5lcywgYm91bmQsIGNoYXJ0VHlwZSwgdmFsdWUpIHtcbiAgICAgICAgdmFyIHBhdGhzID0gdGhpcy5fbWFrZUJvcmRlckxpbmVzUGF0aHMoYm91bmQsIGNoYXJ0VHlwZSwgdmFsdWUpO1xuICAgICAgICB0dWkudXRpbC5mb3JFYWNoKGxpbmVzLCBmdW5jdGlvbihsaW5lLCBuYW1lKSB7XG4gICAgICAgICAgICBsaW5lLmFuaW1hdGUoe3BhdGg6IHBhdGhzW25hbWVdfSwgQU5JTUFUSU9OX1RJTUUpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQW5pbWF0ZS5cbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayBjYWxsYmFja1xuICAgICAqL1xuICAgIGFuaW1hdGU6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgIHR1aS51dGlsLmZvckVhY2godGhpcy5iYXJzLCBmdW5jdGlvbihiYXIsIGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgbGluZXMgPSB0aGlzLmJvcmRlcnNbaW5kZXhdO1xuICAgICAgICAgICAgdGhpcy5fYW5pbWF0ZVJlY3QoYmFyLnJlY3QsIGJhci5ib3VuZCk7XG4gICAgICAgICAgICBpZiAobGluZXMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9hbmltYXRlQm9yZGVycyhsaW5lcywgYmFyLmJvdW5kLCB0aGlzLmNoYXJ0VHlwZSwgYmFyLnZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGNhbGxiYWNrLCBBTklNQVRJT05fVElNRSk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSYXBoYWVsQmFyQ2hhcnQ7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgUmFwaGFlbCBsaW5lIGNoYXJ0IHJlbmRlcmVyLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmFwaGFlbExpbmVCYXNlID0gcmVxdWlyZSgnLi9yYXBoYWVsTGluZVR5cGVCYXNlJyksXG4gICAgcmFwaGFlbFJlbmRlclV0aWwgPSByZXF1aXJlKCcuL3JhcGhhZWxSZW5kZXJVdGlsJyk7XG5cbnZhciBSYXBoYWVsID0gd2luZG93LlJhcGhhZWwsXG4gICAgQU5JTUFUSU9OX1RJTUUgPSA3MDA7XG5cbi8qKlxuICogQGNsYXNzZGVzYyBSYXBoYWVsTGluZUNoYXJ0cyBpcyBncmFwaCByZW5kZXJlciBmb3IgbGluZSBjaGFydC5cbiAqIEBjbGFzcyBSYXBoYWVsTGluZUNoYXJ0XG4gKiBAZXh0ZW5kcyBSYXBoYWVsTGluZVR5cGVCYXNlXG4gKi9cbnZhciBSYXBoYWVsTGluZUNoYXJ0ID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoUmFwaGFlbExpbmVCYXNlLCAvKiogQGxlbmRzIFJhcGhhZWxMaW5lQ2hhcnQucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBSZW5kZXIgZnVuY3Rpb24gb2YgbGluZSBjaGFydC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciBjb250YWluZXJcbiAgICAgKiBAcGFyYW0ge3tncm91cFBvc2l0aW9uczogYXJyYXkuPGFycmF5PiwgZGltZW5zaW9uOiBvYmplY3QsIHRoZW1lOiBvYmplY3QsIG9wdGlvbnM6IG9iamVjdH19IGRhdGEgcmVuZGVyIGRhdGFcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBpbkNhbGxiYWNrIGluIGNhbGxiYWNrXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gb3V0Q2FsbGJhY2sgb3V0IGNhbGxiYWNrXG4gICAgICogQHJldHVybiB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICovXG4gICAgcmVuZGVyOiBmdW5jdGlvbihwYXBlciwgY29udGFpbmVyLCBkYXRhLCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjaykge1xuICAgICAgICB2YXIgZGltZW5zaW9uID0gZGF0YS5kaW1lbnNpb24sXG4gICAgICAgICAgICBncm91cFBvc2l0aW9ucyA9IGRhdGEuZ3JvdXBQb3NpdGlvbnMsXG4gICAgICAgICAgICB0aGVtZSA9IGRhdGEudGhlbWUsXG4gICAgICAgICAgICBjb2xvcnMgPSB0aGVtZS5jb2xvcnMsXG4gICAgICAgICAgICBvcGFjaXR5ID0gZGF0YS5vcHRpb25zLmhhc0RvdCA/IDEgOiAwLFxuICAgICAgICAgICAgZ3JvdXBQYXRocyA9IHRoaXMuX2dldExpbmVzUGF0aChncm91cFBvc2l0aW9ucyksXG4gICAgICAgICAgICBib3JkZXJTdHlsZSA9IHRoaXMubWFrZUJvcmRlclN0eWxlKHRoZW1lLmJvcmRlckNvbG9yLCBvcGFjaXR5KSxcbiAgICAgICAgICAgIG91dERvdFN0eWxlID0gdGhpcy5tYWtlT3V0RG90U3R5bGUob3BhY2l0eSwgYm9yZGVyU3R5bGUpLFxuICAgICAgICAgICAgZ3JvdXBMaW5lcywgdG9vbHRpcExpbmUsIGdyb3VwRG90cztcblxuICAgICAgICBpZiAoIXBhcGVyKSB7XG4gICAgICAgICAgICBwYXBlciA9IFJhcGhhZWwoY29udGFpbmVyLCBkaW1lbnNpb24ud2lkdGgsIGRpbWVuc2lvbi5oZWlnaHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgZ3JvdXBMaW5lcyA9IHRoaXMuX3JlbmRlckxpbmVzKHBhcGVyLCBncm91cFBhdGhzLCBjb2xvcnMpO1xuICAgICAgICB0b29sdGlwTGluZSA9IHRoaXMuX3JlbmRlclRvb2x0aXBMaW5lKHBhcGVyLCBkaW1lbnNpb24uaGVpZ2h0KTtcbiAgICAgICAgZ3JvdXBEb3RzID0gdGhpcy5yZW5kZXJEb3RzKHBhcGVyLCBncm91cFBvc2l0aW9ucywgY29sb3JzLCBib3JkZXJTdHlsZSk7XG5cbiAgICAgICAgdGhpcy5ib3JkZXJTdHlsZSA9IGJvcmRlclN0eWxlO1xuICAgICAgICB0aGlzLm91dERvdFN0eWxlID0gb3V0RG90U3R5bGU7XG4gICAgICAgIHRoaXMuZ3JvdXBQYXRocyA9IGdyb3VwUGF0aHM7XG4gICAgICAgIHRoaXMuZ3JvdXBMaW5lcyA9IGdyb3VwTGluZXM7XG4gICAgICAgIHRoaXMudG9vbHRpcExpbmUgPSB0b29sdGlwTGluZTtcbiAgICAgICAgdGhpcy5ncm91cERvdHMgPSBncm91cERvdHM7XG4gICAgICAgIHRoaXMuZG90T3BhY2l0eSA9IG9wYWNpdHk7XG5cbiAgICAgICAgdGhpcy5hdHRhY2hFdmVudChncm91cERvdHMsIGdyb3VwUG9zaXRpb25zLCBvdXREb3RTdHlsZSwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spO1xuXG4gICAgICAgIHJldHVybiBwYXBlcjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGxpbmVzIHBhdGguXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXkuPG9iamVjdD4+fSBncm91cFBvc2l0aW9ucyBwb3NpdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxzdHJpbmc+Pn0gcGF0aHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRMaW5lc1BhdGg6IGZ1bmN0aW9uKGdyb3VwUG9zaXRpb25zKSB7XG4gICAgICAgIHZhciBncm91cFBhdGhzID0gdHVpLnV0aWwubWFwKGdyb3VwUG9zaXRpb25zLCBmdW5jdGlvbihwb3NpdGlvbnMpIHtcbiAgICAgICAgICAgIHZhciBmcm9tUG9zID0gcG9zaXRpb25zWzBdLFxuICAgICAgICAgICAgICAgIHJlc3QgPSBwb3NpdGlvbnMuc2xpY2UoMSk7XG4gICAgICAgICAgICByZXR1cm4gdHVpLnV0aWwubWFwKHJlc3QsIGZ1bmN0aW9uKHBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHRoaXMubWFrZUxpbmVQYXRoKGZyb21Qb3MsIHBvc2l0aW9uKTtcbiAgICAgICAgICAgICAgICBmcm9tUG9zID0gcG9zaXRpb247XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIGdyb3VwUGF0aHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBsaW5lcy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5LjxzdHJpbmc+Pn0gZ3JvdXBQYXRocyBwYXRoc1xuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IGNvbG9ycyBsaW5lIGNvbG9yc1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdHJva2VXaWR0aCBzdHJva2Ugd2lkdGhcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gbGluZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJMaW5lczogZnVuY3Rpb24ocGFwZXIsIGdyb3VwUGF0aHMsIGNvbG9ycywgc3Ryb2tlV2lkdGgpIHtcbiAgICAgICAgdmFyIGdyb3VwTGluZXMgPSB0dWkudXRpbC5tYXAoZ3JvdXBQYXRocywgZnVuY3Rpb24ocGF0aHMsIGdyb3VwSW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBjb2xvciA9IGNvbG9yc1tncm91cEluZGV4XSB8fCAndHJhbnNwYXJlbnQnO1xuICAgICAgICAgICAgcmV0dXJuIHR1aS51dGlsLm1hcChwYXRocywgZnVuY3Rpb24ocGF0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiByYXBoYWVsUmVuZGVyVXRpbC5yZW5kZXJMaW5lKHBhcGVyLCBwYXRoLnN0YXJ0LCBjb2xvciwgc3Ryb2tlV2lkdGgpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIHJldHVybiBncm91cExpbmVzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBbmltYXRlLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIGNhbGxiYWNrXG4gICAgICovXG4gICAgYW5pbWF0ZTogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGdyb3VwTGluZXMgPSB0aGlzLmdyb3VwTGluZXMsXG4gICAgICAgICAgICBncm91cFBhdGhzID0gdGhpcy5ncm91cFBhdGhzLFxuICAgICAgICAgICAgYm9yZGVyU3R5bGUgPSB0aGlzLmJvcmRlclN0eWxlLFxuICAgICAgICAgICAgb3BhY2l0eSA9IHRoaXMuZG90T3BhY2l0eSxcbiAgICAgICAgICAgIHRpbWUgPSBBTklNQVRJT05fVElNRSAvIGdyb3VwTGluZXNbMF0ubGVuZ3RoLFxuICAgICAgICAgICAgc3RhcnRUaW1lO1xuICAgICAgICB0dWkudXRpbC5mb3JFYWNoQXJyYXkodGhpcy5ncm91cERvdHMsIGZ1bmN0aW9uKGRvdHMsIGdyb3VwSW5kZXgpIHtcbiAgICAgICAgICAgIHN0YXJ0VGltZSA9IDA7XG4gICAgICAgICAgICB0dWkudXRpbC5mb3JFYWNoQXJyYXkoZG90cywgZnVuY3Rpb24oZG90LCBpbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciBsaW5lLCBwYXRoO1xuICAgICAgICAgICAgICAgIGlmIChpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICBsaW5lID0gZ3JvdXBMaW5lc1tncm91cEluZGV4XVtpbmRleCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICBwYXRoID0gZ3JvdXBQYXRoc1tncm91cEluZGV4XVtpbmRleCAtIDFdLmVuZDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hbmltYXRlTGluZShsaW5lLCBwYXRoLCB0aW1lLCBzdGFydFRpbWUpO1xuICAgICAgICAgICAgICAgICAgICBzdGFydFRpbWUgKz0gdGltZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAob3BhY2l0eSkge1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZG90LmF0dHIodHVpLnV0aWwuZXh0ZW5kKHsnZmlsbC1vcGFjaXR5Jzogb3BhY2l0eX0sIGJvcmRlclN0eWxlKSk7XG4gICAgICAgICAgICAgICAgICAgIH0sIHN0YXJ0VGltZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgc2V0VGltZW91dChjYWxsYmFjaywgc3RhcnRUaW1lKTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhcGhhZWxMaW5lQ2hhcnQ7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgUmFwaGFlbExpbmVUeXBlQmFzZSBpcyBiYXNlIGNsYXNzIGZvciBsaW5lIHR5cGUgcmVuZGVyZXIuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciByYXBoYWVsUmVuZGVyVXRpbCA9IHJlcXVpcmUoJy4vcmFwaGFlbFJlbmRlclV0aWwnKTtcblxudmFyIERFRkFVTFRfRE9UX1dJRFRIID0gMyxcbiAgICBIT1ZFUl9ET1RfV0lEVEggPSA0O1xuXG4vKipcbiAqIEBjbGFzc2Rlc2MgUmFwaGFlbExpbmVUeXBlQmFzZSBpcyBiYXNlIGZvciBsaW5lIHR5cGUgcmVuZGVyZXIuXG4gKiBAY2xhc3MgUmFwaGFlbExpbmVUeXBlQmFzZVxuICovXG52YXIgUmFwaGFlbExpbmVUeXBlQmFzZSA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgUmFwaGFlbExpbmVUeXBlQmFzZS5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgbGluZSBwYXRocy5cbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gZnJvbVBvcyBmcm9tIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IHRvUG9zIHRvIHBvc2l0aW9uXG4gICAgICogQHJldHVybnMge3tzdGFydDogc3RyaW5nLCBlbmQ6IHN0cmluZ319IGxpbmUgcGF0aHMuXG4gICAgICovXG4gICAgbWFrZUxpbmVQYXRoOiBmdW5jdGlvbihmcm9tUG9zLCB0b1Bvcykge1xuICAgICAgICB2YXIgc3RhcnRMaW5lUGF0aCA9IHJhcGhhZWxSZW5kZXJVdGlsLm1ha2VMaW5lUGF0aChmcm9tUG9zLCBmcm9tUG9zKSxcbiAgICAgICAgICAgIGVuZExpbmVQYXRoID0gcmFwaGFlbFJlbmRlclV0aWwubWFrZUxpbmVQYXRoKGZyb21Qb3MsIHRvUG9zKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN0YXJ0OiBzdGFydExpbmVQYXRoLFxuICAgICAgICAgICAgZW5kOiBlbmRMaW5lUGF0aFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgdG9vbHRpcCBsaW5lLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodCBoZWlnaHRcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSByYXBoYWVsIG9iamVjdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlclRvb2x0aXBMaW5lOiBmdW5jdGlvbihwYXBlciwgaGVpZ2h0KSB7XG4gICAgICAgIHZhciBsaW5lUGF0aCA9IHJhcGhhZWxSZW5kZXJVdGlsLm1ha2VMaW5lUGF0aCh7XG4gICAgICAgICAgICAgICAgbGVmdDogMTAsXG4gICAgICAgICAgICAgICAgdG9wOiBoZWlnaHRcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBsZWZ0OiAxMCxcbiAgICAgICAgICAgICAgICB0b3A6IDBcbiAgICAgICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmFwaGFlbFJlbmRlclV0aWwucmVuZGVyTGluZShwYXBlciwgbGluZVBhdGgsICd0cmFuc3BhcmVudCcsIDEpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGJvcmRlciBzdHlsZS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gYm9yZGVyQ29sb3IgYm9yZGVyIGNvbG9yXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG9wYWNpdHkgb3BhY2l0eVxuICAgICAqIEByZXR1cm5zIHt7c3Ryb2tlOiBzdHJpbmcsIHN0cm9rZS13aWR0aDogbnVtYmVyLCBzdHJpa2Utb3BhY2l0eTogbnVtYmVyfX0gYm9yZGVyIHN0eWxlXG4gICAgICovXG4gICAgbWFrZUJvcmRlclN0eWxlOiBmdW5jdGlvbihib3JkZXJDb2xvciwgb3BhY2l0eSkge1xuICAgICAgICB2YXIgYm9yZGVyU3R5bGU7XG4gICAgICAgIGlmIChib3JkZXJDb2xvcikge1xuICAgICAgICAgICAgYm9yZGVyU3R5bGUgPSB7XG4gICAgICAgICAgICAgICAgc3Ryb2tlOiBib3JkZXJDb2xvcixcbiAgICAgICAgICAgICAgICAnc3Ryb2tlLXdpZHRoJzogMSxcbiAgICAgICAgICAgICAgICAnc3Ryb2tlLW9wYWNpdHknOiBvcGFjaXR5XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBib3JkZXJTdHlsZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBkb3Qgc3R5bGUgZm9yIG1vdXNlb3V0IGV2ZW50LlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBvcGFjaXR5IG9wYWNpdHlcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYm9yZGVyU3R5bGUgYm9yZGVyIHN0eWxlXG4gICAgICogQHJldHVybnMge3tmaWxsLW9wYWNpdHk6IG51bWJlciwgc3Ryb2tlLW9wYWNpdHk6IG51bWJlciwgcjogbnVtYmVyfX0gc3R5bGVcbiAgICAgKi9cbiAgICBtYWtlT3V0RG90U3R5bGU6IGZ1bmN0aW9uKG9wYWNpdHksIGJvcmRlclN0eWxlKSB7XG4gICAgICAgIHZhciBvdXREb3RTdHlsZSA9IHtcbiAgICAgICAgICAgICdmaWxsLW9wYWNpdHknOiBvcGFjaXR5LFxuICAgICAgICAgICAgJ3N0cm9rZS1vcGFjaXR5JzogMCxcbiAgICAgICAgICAgIHI6IERFRkFVTFRfRE9UX1dJRFRIXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKGJvcmRlclN0eWxlKSB7XG4gICAgICAgICAgICB0dWkudXRpbC5leHRlbmQob3V0RG90U3R5bGUsIGJvcmRlclN0eWxlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBvdXREb3RTdHlsZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGRvdC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBhZXJcbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gcG9zaXRpb24gZG90IHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbG9yIGRvdCBjb2xvclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBib3JkZXJTdHlsZSBib3JkZXIgc3R5bGVcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSByYXBoYWVsIGRvdFxuICAgICAqL1xuICAgIHJlbmRlckRvdDogZnVuY3Rpb24ocGFwZXIsIHBvc2l0aW9uLCBjb2xvcikge1xuICAgICAgICB2YXIgZG90ID0gcGFwZXIuY2lyY2xlKHBvc2l0aW9uLmxlZnQsIHBvc2l0aW9uLnRvcCwgREVGQVVMVF9ET1RfV0lEVEgpLFxuICAgICAgICAgICAgZG90U3R5bGUgPSB7XG4gICAgICAgICAgICAgICAgZmlsbDogY29sb3IsXG4gICAgICAgICAgICAgICAgJ2ZpbGwtb3BhY2l0eSc6IDAsXG4gICAgICAgICAgICAgICAgJ3N0cm9rZS1vcGFjaXR5JzogMFxuICAgICAgICAgICAgfTtcblxuICAgICAgICBkb3QuYXR0cihkb3RTdHlsZSk7XG5cbiAgICAgICAgcmV0dXJuIGRvdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGRvdHMuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheS48b2JqZWN0Pj59IGdyb3VwUG9zaXRpb25zIHBvc2l0aW9uc1xuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IGNvbG9ycyBjb2xvcnNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYm9yZGVyU3R5bGUgYm9yZGVyIHN0eWxlXG4gICAgICogQHJldHVybnMge2FycmF5LjxvYmplY3Q+fSBkb3RzXG4gICAgICovXG4gICAgcmVuZGVyRG90czogZnVuY3Rpb24ocGFwZXIsIGdyb3VwUG9zaXRpb25zLCBjb2xvcnMpIHtcbiAgICAgICAgdmFyIGRvdHMgPSB0dWkudXRpbC5tYXAoZ3JvdXBQb3NpdGlvbnMsIGZ1bmN0aW9uKHBvc2l0aW9ucywgZ3JvdXBJbmRleCkge1xuICAgICAgICAgICAgdmFyIGNvbG9yID0gY29sb3JzW2dyb3VwSW5kZXhdO1xuICAgICAgICAgICAgcmV0dXJuIHR1aS51dGlsLm1hcChwb3NpdGlvbnMsIGZ1bmN0aW9uKHBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRvdCA9IHRoaXMucmVuZGVyRG90KHBhcGVyLCBwb3NpdGlvbiwgY29sb3IpO1xuICAgICAgICAgICAgICAgIHJldHVybiBkb3Q7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgcmV0dXJuIGRvdHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjZW50ZXIgcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gZnJvbVBvcyBmcm9tIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IHRvUG9zIHRvIHBvc2l0aW9uXG4gICAgICogQHJldHVybnMge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gcG9zaXRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRDZW50ZXI6IGZ1bmN0aW9uKGZyb21Qb3MsIHRvUG9zKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsZWZ0OiAoZnJvbVBvcy5sZWZ0ICsgdG9Qb3MubGVmdCkgLyAyLFxuICAgICAgICAgICAgdG9wOiAoZnJvbVBvcy50b3AgKyB0b1Bvcy50b3ApIC8gMlxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBCaW5kIGhvdmVyIGV2ZW50LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBkb3QgcmFwaGFlbCBvYmVqY3RcbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gcG9zaXRpb24gcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZ3JvdXBJbmRleCBncm91cCBpbmRleFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBpbmRleFxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGluQ2FsbGJhY2sgaW4gY2FsbGJhY2tcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvdXRDYWxsYmFjayBvdXQgY2FsbGJhY2tcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9iaW5kSG92ZXJFdmVudDogZnVuY3Rpb24oZG90LCBwb3NpdGlvbiwgZ3JvdXBJbmRleCwgaW5kZXgsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKSB7XG4gICAgICAgIGRvdC5ob3ZlcihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGluQ2FsbGJhY2socG9zaXRpb24sIGluZGV4LCBncm91cEluZGV4KTtcbiAgICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBvdXRDYWxsYmFjaygpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGV2ZW50LlxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gZ3JvdXBEb3RzIGRvdHNcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheS48b2JqZWN0Pj59IGdyb3VwUG9zaXRpb25zIHBvc2l0aW9uc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvdXREb3RTdHlsZSBkb3Qgc3R5bGVcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBpbkNhbGxiYWNrIGluIGNhbGxiYWNrXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gb3V0Q2FsbGJhY2sgb3V0IGNhbGxiYWNrXG4gICAgICovXG4gICAgYXR0YWNoRXZlbnQ6IGZ1bmN0aW9uKGdyb3VwRG90cywgZ3JvdXBQb3NpdGlvbnMsIG91dERvdFN0eWxlLCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjaykge1xuICAgICAgICB0dWkudXRpbC5mb3JFYWNoKGdyb3VwRG90cywgZnVuY3Rpb24oZG90cywgZ3JvdXBJbmRleCkge1xuICAgICAgICAgICAgdHVpLnV0aWwuZm9yRWFjaChkb3RzLCBmdW5jdGlvbihkb3QsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdmFyIHBvc2l0aW9uID0gZ3JvdXBQb3NpdGlvbnNbZ3JvdXBJbmRleF1baW5kZXhdO1xuICAgICAgICAgICAgICAgIHRoaXMuX2JpbmRIb3ZlckV2ZW50KGRvdCwgcG9zaXRpb24sIGdyb3VwSW5kZXgsIGluZGV4LCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjayk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNob3cgZG90LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBkb3QgcmFwaGFlbCBvYmplY3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zaG93RG90OiBmdW5jdGlvbihkb3QpIHtcbiAgICAgICAgZG90LmF0dHIoe1xuICAgICAgICAgICAgJ2ZpbGwtb3BhY2l0eSc6IDEsXG4gICAgICAgICAgICAnc3Ryb2tlLW9wYWNpdHknOiAwLjMsXG4gICAgICAgICAgICAnc3Ryb2tlLXdpZHRoJzogMixcbiAgICAgICAgICAgIHI6IEhPVkVSX0RPVF9XSURUSFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2hvdyBhbmltYXRpb24uXG4gICAgICogQHBhcmFtIHt7Z3JvdXBJbmRleDogbnVtYmVyLCBpbmRleDpudW1iZXJ9fSBkYXRhIHNob3cgaW5mb1xuICAgICAqL1xuICAgIHNob3dBbmltYXRpb246IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gZGF0YS5ncm91cEluZGV4LCAvLyBMaW5lIGNoYXJ0IGhhcyBwaXZvdCB2YWx1ZXMuXG4gICAgICAgICAgICBncm91cEluZGV4ID0gZGF0YS5pbmRleCxcbiAgICAgICAgICAgIGRvdCA9IHRoaXMuZ3JvdXBEb3RzW2dyb3VwSW5kZXhdW2luZGV4XTtcbiAgICAgICAgdGhpcy5fc2hvd0RvdChkb3QpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgcGl2b3QgZ3JvdXAgZG90cy5cbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5Pn0gZG90c1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFBpdm90R3JvdXBEb3RzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCF0aGlzLnBpdm90R3JvdXBEb3RzKSB7XG4gICAgICAgICAgICB0aGlzLnBpdm90R3JvdXBEb3RzID0gdHVpLnV0aWwucGl2b3QodGhpcy5ncm91cERvdHMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMucGl2b3RHcm91cERvdHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNob3cgZ3JvdXAgZG90cy5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggaW5kZXhcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zaG93R3JvdXBEb3RzOiBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICB2YXIgZG90cyA9IHRoaXMuX2dldFBpdm90R3JvdXBEb3RzKCk7XG4gICAgICAgIHR1aS51dGlsLmZvckVhY2hBcnJheShkb3RzW2luZGV4XSwgdHVpLnV0aWwuYmluZCh0aGlzLl9zaG93RG90LCB0aGlzKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNob3cgdG9vbHRpcCBsaW5lLlxuICAgICAqIEBwYXJhbSB7e1xuICAgICAqICAgICAgZGltZW5zaW9uOiB7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9LFxuICAgICAqICAgICAgcG9zaXRpb246IHtsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfVxuICAgICAqIH19IGJvdW5kIGJvdW5kXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2hvd1Rvb2x0aXBMaW5lOiBmdW5jdGlvbihib3VuZCkge1xuICAgICAgICB2YXIgbGluZVBhdGggPSByYXBoYWVsUmVuZGVyVXRpbC5tYWtlTGluZVBhdGgoe1xuICAgICAgICAgICAgbGVmdDogYm91bmQucG9zaXRpb24ubGVmdCxcbiAgICAgICAgICAgIHRvcDogYm91bmQuZGltZW5zaW9uLmhlaWdodFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBsZWZ0OiBib3VuZC5wb3NpdGlvbi5sZWZ0LFxuICAgICAgICAgICAgdG9wOiBib3VuZC5wb3NpdGlvbi50b3BcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMudG9vbHRpcExpbmUuYXR0cih7XG4gICAgICAgICAgICBwYXRoOiBsaW5lUGF0aCxcbiAgICAgICAgICAgIHN0cm9rZTogJyM5OTknLFxuICAgICAgICAgICAgJ3N0cm9rZS1vcGFjaXR5JzogMVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2hvdyBncm91cCBhbmltYXRpb24uXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IGluZGV4XG4gICAgICogQHBhcmFtIHt7XG4gICAgICogICAgICBkaW1lbnNpb246IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn0sXG4gICAgICogICAgICBwb3NpdGlvbjoge2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9XG4gICAgICogfX0gYm91bmQgYm91bmRcbiAgICAgKi9cbiAgICBzaG93R3JvdXBBbmltYXRpb246IGZ1bmN0aW9uKGluZGV4LCBib3VuZCkge1xuICAgICAgICB0aGlzLl9zaG93R3JvdXBEb3RzKGluZGV4KTtcbiAgICAgICAgdGhpcy5fc2hvd1Rvb2x0aXBMaW5lKGJvdW5kKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSGlkZSBkb3QuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGRvdCByYXBoYWVsIG9iamVjdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2hpZGVEb3Q6IGZ1bmN0aW9uKGRvdCkge1xuICAgICAgICBkb3QuYXR0cih0aGlzLm91dERvdFN0eWxlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSGlkZSBhbmltYXRpb24uXG4gICAgICogQHBhcmFtIHt7Z3JvdXBJbmRleDogbnVtYmVyLCBpbmRleDpudW1iZXJ9fSBkYXRhIGhpZGUgaW5mb1xuICAgICAqL1xuICAgIGhpZGVBbmltYXRpb246IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gZGF0YS5ncm91cEluZGV4LCAvLyBMaW5lIGNoYXJ0IGhhcyBwaXZvdCB2YWx1ZXMuXG4gICAgICAgICAgICBncm91cEluZGV4ID0gZGF0YS5pbmRleCxcbiAgICAgICAgICAgIGRvdCA9IHRoaXMuZ3JvdXBEb3RzW2dyb3VwSW5kZXhdW2luZGV4XTtcbiAgICAgICAgaWYgKGRvdCkge1xuICAgICAgICAgICAgdGhpcy5faGlkZURvdChkb3QpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhpZGUgZ3JvdXAgZG90cy5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggaW5kZXhcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9oaWRlR3JvdXBEb3RzOiBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICB2YXIgZG90cyA9IHRoaXMuX2dldFBpdm90R3JvdXBEb3RzKCk7XG4gICAgICAgIHR1aS51dGlsLmZvckVhY2hBcnJheShkb3RzW2luZGV4XSwgdHVpLnV0aWwuYmluZCh0aGlzLl9oaWRlRG90LCB0aGlzKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhpZGUgdG9vbHRpcCBsaW5lLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2hpZGVUb29sdGlwTGluZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMudG9vbHRpcExpbmUuYXR0cih7XG4gICAgICAgICAgICAnc3Ryb2tlLW9wYWNpdHknOiAwXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBIaWRlIGdyb3VwIGFuaW1hdGlvbi5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggaW5kZXhcbiAgICAgKi9cbiAgICBoaWRlR3JvdXBBbmltYXRpb246IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAgIHRoaXMuX2hpZGVHcm91cERvdHMoaW5kZXgpO1xuICAgICAgICB0aGlzLl9oaWRlVG9vbHRpcExpbmUoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQW5pbWF0ZSBsaW5lLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBsaW5lIHJhcGhhZWwgb2JqZWN0XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGxpbmVQYXRoIGxpbmUgcGF0aFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB0aW1lIHBsYXkgdGltZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdGFydFRpbWUgc3RhcnQgdGltZVxuICAgICAqL1xuICAgIGFuaW1hdGVMaW5lOiBmdW5jdGlvbihsaW5lLCBsaW5lUGF0aCwgdGltZSwgc3RhcnRUaW1lKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBsaW5lLmFuaW1hdGUoe3BhdGg6IGxpbmVQYXRofSwgdGltZSk7XG4gICAgICAgIH0sIHN0YXJ0VGltZSk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmFwaGFlbExpbmVUeXBlQmFzZTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBSYXBoYWVsUGllQ2hhcnRzIGlzIGdyYXBoIHJlbmRlcmVyIGZvciBwaWUgY2hhcnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciByYXBoYWVsUmVuZGVyVXRpbCA9IHJlcXVpcmUoJy4vcmFwaGFlbFJlbmRlclV0aWwnKTtcblxudmFyIFJhcGhhZWwgPSB3aW5kb3cuUmFwaGFlbCxcbiAgICBBTkdMRV8xODAgPSAxODAsXG4gICAgUkFEID0gTWF0aC5QSSAvIEFOR0xFXzE4MCxcbiAgICBBTklNQVRJT05fVElNRSA9IDUwMCxcbiAgICBMT0FESU5HX0FOSU1BVElPTl9USU1FID0gNzAwO1xuXG4vKipcbiAqIEBjbGFzc2Rlc2MgUmFwaGFlbFBpZUNoYXJ0cyBpcyBncmFwaCByZW5kZXJlciBmb3IgcGllIGNoYXJ0LlxuICogQGNsYXNzIFJhcGhhZWxQaWVDaGFydFxuICovXG52YXIgUmFwaGFlbFBpZUNoYXJ0ID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBSYXBoYWVsUGllQ2hhcnQucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBSZW5kZXIgZnVuY3Rpb24gb2YgcGllIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNvbnRhaW5lclxuICAgICAqIEBwYXJhbSB7e3NlY3RvcnNJbmZvOiBhcnJheS48b2JqZWN0PiwgY2lyY2xlQm91bmQ6IHtjeDogbnVtYmVyLCBjeTogbnVtYmVyLCByOiBudW1iZXJ9LCBkaW1lbnNpb246IG9iamVjdCwgdGhlbWU6IG9iamVjdCwgb3B0aW9uczogb2JqZWN0fX0gZGF0YSByZW5kZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGluQ2FsbGJhY2sgaW4gY2FsbGJhY2tcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvdXRDYWxsYmFjayBvdXQgY2FsbGJhY2tcbiAgICAgKiBAcmV0dXJuIHtvYmplY3R9IHBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKi9cbiAgICByZW5kZXI6IGZ1bmN0aW9uKHBhcGVyLCBjb250YWluZXIsIGRhdGEsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKSB7XG4gICAgICAgIHZhciBkaW1lbnNpb24gPSBkYXRhLmRpbWVuc2lvbjtcblxuICAgICAgICBpZiAoIXBhcGVyKSB7XG4gICAgICAgICAgICBwYXBlciA9IFJhcGhhZWwoY29udGFpbmVyLCBkaW1lbnNpb24ud2lkdGgsIGRpbWVuc2lvbi5oZWlnaHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFwYXBlci5jdXN0b21BdHRyaWJ1dGVzLnNlY3Rvcikge1xuICAgICAgICAgICAgcGFwZXIuY3VzdG9tQXR0cmlidXRlcy5zZWN0b3IgPSB0dWkudXRpbC5iaW5kKHRoaXMuX21ha2VTZWN0b3JQYXRoLCB0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY2lyY2xlQm91bmQgPSBkYXRhLmNpcmNsZUJvdW5kO1xuICAgICAgICB0aGlzLl9yZW5kZXJQaWUocGFwZXIsIGRhdGEsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKTtcblxuICAgICAgICByZXR1cm4gcGFwZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2Ugc2VjdG9yIHBhdGguXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGN4IGNlbnRlciB4XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGN5IGNlbnRlciB5XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHIgcmFkaXVzXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHN0YXJ0QW5nbGUgc3RhcnQgYW5nbGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZW5kQW5nbGUgZW5kIGFuZ2VsXG4gICAgICogQHJldHVybnMge3twYXRoOiBhcnJheX19IHNlY3RvciBwYXRoXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVNlY3RvclBhdGg6IGZ1bmN0aW9uKGN4LCBjeSwgciwgc3RhcnRBbmdsZSwgZW5kQW5nbGUpIHtcbiAgICAgICAgdmFyIHgxID0gY3ggKyByICogTWF0aC5zaW4oc3RhcnRBbmdsZSAqIFJBRCksIC8vIOybkCDtmLjsnZgg7Iuc7J6RIHgg7KKM7ZGcXG4gICAgICAgICAgICB5MSA9IGN5IC0gciAqIE1hdGguY29zKHN0YXJ0QW5nbGUgKiBSQUQpLCAvLyDsm5Ag7Zi47J2YIOyLnOyekSB5IOyijO2RnFxuICAgICAgICAgICAgeDIgPSBjeCArIHIgKiBNYXRoLnNpbihlbmRBbmdsZSAqIFJBRCksLy8g7JuQIO2YuOydmCDsooXro4wgeCDsooztkZxcbiAgICAgICAgICAgIHkyID0gY3kgLSByICogTWF0aC5jb3MoZW5kQW5nbGUgKiBSQUQpLCAvLyDsm5Ag7Zi47J2YIOyiheujjCB5IOyijO2RnFxuICAgICAgICAgICAgbGFyZ2VBcmNGbGFnID0gZW5kQW5nbGUgLSBzdGFydEFuZ2xlID4gQU5HTEVfMTgwID8gMSA6IDAsXG4gICAgICAgICAgICBwYXRoID0gW1wiTVwiLCBjeCwgY3ksXG4gICAgICAgICAgICAgICAgXCJMXCIsIHgxLCB5MSxcbiAgICAgICAgICAgICAgICBcIkFcIiwgciwgciwgMCwgbGFyZ2VBcmNGbGFnLCAxLCB4MiwgeTIsXG4gICAgICAgICAgICAgICAgXCJaXCJcbiAgICAgICAgICAgIF07XG4gICAgICAgIC8vIHBhdGjsl5Ag64yA7ZWcIOyekOyEuO2VnCDshKTrqoXsnYAg7JWE656YIOunge2BrOulvCDssLjqs6BcbiAgICAgICAgLy8gaHR0cDovL3d3dy53M3NjaG9vbHMuY29tL3N2Zy9zdmdfcGF0aC5hc3BcbiAgICAgICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvU1ZHL0F0dHJpYnV0ZS9kXG4gICAgICAgIHJldHVybiB7cGF0aDogcGF0aH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBzZWN0b3JcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMucGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqICAgICAgQHBhcmFtIHt7Y3g6IG51bWJlciwgY3k6IG51bWJlciwgcjpudW1iZXJ9fSBwYXJhbXMuY2lyY2xlQm91bmQgY2lyY2xlIGJvdW5kc1xuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5zdGFydEFuZ2xlIHN0YXJ0IGFuZ2xlXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmVuZEFuZ2xlIGVuZCBhbmdsZVxuICAgICAqICAgICAgQHBhcmFtIHt7ZmlsbDogc3RyaW5nLCBzdHJva2U6IHN0cmluZywgc3RyaWtlLXdpZHRoOiBzdHJpbmd9fSBwYXJhbXMuYXR0cnMgYXR0cnNcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSByYXBoYWVsIG9iamVjdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlclNlY3RvcjogZnVuY3Rpb24gKHBhcmFtcykge1xuICAgICAgICB2YXIgY2lyY2xlQm91bmQgPSBwYXJhbXMuY2lyY2xlQm91bmQsXG4gICAgICAgICAgICBhbmdsZXMgPSBwYXJhbXMuYW5nbGVzO1xuICAgICAgICByZXR1cm4gcGFyYW1zLnBhcGVyLnBhdGgoKS5hdHRyKHtcbiAgICAgICAgICAgIHNlY3RvcjogW2NpcmNsZUJvdW5kLmN4LCBjaXJjbGVCb3VuZC5jeSwgY2lyY2xlQm91bmQuciwgYW5nbGVzLnN0YXJ0QW5nbGUsIGFuZ2xlcy5lbmRBbmdsZV1cbiAgICAgICAgfSkuYXR0cihwYXJhbXMuYXR0cnMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgcGllIGdyYXBoLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICogQHBhcmFtIHt7c2VjdG9yc0luZm86IGFycmF5LjxvYmplY3Q+LCBjaXJjbGVCb3VuZDoge2N4OiBudW1iZXIsIGN5OiBudW1iZXIsIHI6IG51bWJlcn0sIGRpbWVuc2lvbjogb2JqZWN0LCB0aGVtZTogb2JqZWN0LCBvcHRpb25zOiBvYmplY3R9fSBkYXRhIHJlbmRlciBkYXRhXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gaW5DYWxsYmFjayBpbiBjYWxsYmFja1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG91dENhbGxiYWNrIG91dCBjYWxsYmFja1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlclBpZTogZnVuY3Rpb24ocGFwZXIsIGRhdGEsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKSB7XG4gICAgICAgIHZhciBjaXJjbGVCb3VuZCA9IGRhdGEuY2lyY2xlQm91bmQsXG4gICAgICAgICAgICBjb2xvcnMgPSBkYXRhLnRoZW1lLmNvbG9ycyxcbiAgICAgICAgICAgIGNoYXJ0QmFja2dyb3VuZCA9IGRhdGEuY2hhcnRCYWNrZ3JvdW5kLFxuICAgICAgICAgICAgc2VjdG9ycyA9IFtdO1xuXG4gICAgICAgIHR1aS51dGlsLmZvckVhY2hBcnJheShkYXRhLnNlY3RvcnNJbmZvLCBmdW5jdGlvbihzZWN0b3JJbmZvLCBpbmRleCkge1xuICAgICAgICAgICAgdmFyIHBlcmNlbnRWYWx1ZSA9IHNlY3RvckluZm8ucGVyY2VudFZhbHVlLFxuICAgICAgICAgICAgICAgIGNvbG9yID0gY29sb3JzW2luZGV4XSxcbiAgICAgICAgICAgICAgICBzZWN0b3IgPSB0aGlzLl9yZW5kZXJTZWN0b3Ioe1xuICAgICAgICAgICAgICAgICAgICBwYXBlcjogcGFwZXIsXG4gICAgICAgICAgICAgICAgICAgIGNpcmNsZUJvdW5kOiBjaXJjbGVCb3VuZCxcbiAgICAgICAgICAgICAgICAgICAgYW5nbGVzOiBzZWN0b3JJbmZvLmFuZ2xlcy5zdGFydCxcbiAgICAgICAgICAgICAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGw6IGNvbG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3Ryb2tlOiBjaGFydEJhY2tncm91bmQsXG4gICAgICAgICAgICAgICAgICAgICAgICAnc3Ryb2tlLXdpZHRoJzogMVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuX2JpbmRIb3ZlckV2ZW50KHtcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IHNlY3RvcixcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogc2VjdG9ySW5mby5wb3B1cFBvc2l0aW9uLFxuICAgICAgICAgICAgICAgIGluZGV4OiBpbmRleCxcbiAgICAgICAgICAgICAgICBpbkNhbGxiYWNrOiBpbkNhbGxiYWNrLFxuICAgICAgICAgICAgICAgIG91dENhbGxiYWNrOiBvdXRDYWxsYmFja1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHNlY3RvcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgc2VjdG9yOiBzZWN0b3IsXG4gICAgICAgICAgICAgICAgYW5nbGVzOiBzZWN0b3JJbmZvLmFuZ2xlcy5lbmQsXG4gICAgICAgICAgICAgICAgcGVyY2VudFZhbHVlOiBwZXJjZW50VmFsdWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICB0aGlzLnNlY3RvcnMgPSBzZWN0b3JzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgbGVnZW5kIGxpbmVzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciBwYXBlclxuICAgICAqIEBwYXJhbSB7YXJyYXkuPG9iamVjdD59IG91dGVyUG9zaXRpb25zIG91dGVyIHBvc2l0aW9uXG4gICAgICovXG4gICAgcmVuZGVyTGVnZW5kTGluZXM6IGZ1bmN0aW9uKHBhcGVyLCBvdXRlclBvc2l0aW9ucykge1xuICAgICAgICB2YXIgcGF0aHMgPSB0aGlzLl9tYWtlTGluZVBhdGhzKG91dGVyUG9zaXRpb25zKSxcbiAgICAgICAgICAgIGxlZ2VuZExpbmVzID0gdHVpLnV0aWwubWFwKHBhdGhzLCBmdW5jdGlvbihwYXRoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJhcGhhZWxSZW5kZXJVdGlsLnJlbmRlckxpbmUocGFwZXIsIHBhdGgsICd0cmFuc3BhcmVudCcsIDEpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIHRoaXMubGVnZW5kTGluZXMgPSBsZWdlbmRMaW5lcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBsaW5lIHBhdGhzLlxuICAgICAqIEBwYXJhbSB7YXJyYXkuPG9iamVjdD59IG91dGVyUG9zaXRpb25zIG91dGVyIHBvc2l0aW9uc1xuICAgICAqIEByZXR1cm5zIHtBcnJheX0gbGluZSBwYXRocy5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlTGluZVBhdGhzOiBmdW5jdGlvbihvdXRlclBvc2l0aW9ucykge1xuICAgICAgICB2YXIgcGF0aHMgPSB0dWkudXRpbC5tYXAob3V0ZXJQb3NpdGlvbnMsIGZ1bmN0aW9uKHBvc2l0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICByYXBoYWVsUmVuZGVyVXRpbC5tYWtlTGluZVBhdGgocG9zaXRpb25zLnN0YXJ0LCBwb3NpdGlvbnMubWlkZGxlKSxcbiAgICAgICAgICAgICAgICByYXBoYWVsUmVuZGVyVXRpbC5tYWtlTGluZVBhdGgocG9zaXRpb25zLm1pZGRsZSwgcG9zaXRpb25zLmVuZClcbiAgICAgICAgICAgIF0uam9pbignJyk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgICByZXR1cm4gcGF0aHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJpbmQgaG92ZXIgZXZlbnQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRhcmdldCByYXBoYWVsIGl0ZW1cbiAgICAgKiAgICAgIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBwYXJhbXMucG9zaXRpb24gcG9zaXRpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMuaWQgaWRcbiAgICAgKiAgICAgIEBwYXJhbSB7ZnVuY3Rpb259IHBhcmFtcy5pbkNhbGxiYWNrIGluIGNhbGxiYWNrXG4gICAgICogICAgICBAcGFyYW0ge2Z1bmN0aW9ufSBwYXJhbXMub3V0Q2FsbGJhY2sgb3V0IGNhbGxiYWNrXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYmluZEhvdmVyRXZlbnQ6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgdGhyb3R0bGVkID0gdHVpLnV0aWwudGhyb3R0bGUoZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgaWYgKCFlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFyYW1zLmluQ2FsbGJhY2socGFyYW1zLnBvc2l0aW9uLCAwLCBwYXJhbXMuaW5kZXgsIHtcbiAgICAgICAgICAgICAgICBjbGllbnRYOiBlLmNsaWVudFgsXG4gICAgICAgICAgICAgICAgY2xpZW50WTogZS5jbGllbnRZXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgcGFyYW1zLnRhcmdldC5tb3VzZW92ZXIoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHBhcmFtcy5pbkNhbGxiYWNrKHBhcmFtcy5wb3NpdGlvbiwgMCwgcGFyYW1zLmluZGV4LCB7XG4gICAgICAgICAgICAgICAgY2xpZW50WDogZS5jbGllbnRYLFxuICAgICAgICAgICAgICAgIGNsaWVudFk6IGUuY2xpZW50WVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pLm1vdXNlbW92ZSh0aHJvdHRsZWQpLm1vdXNlb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHBhcmFtcy5vdXRDYWxsYmFjaygpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gZXhwYW5kIHNlbGVjdG9yIHJhZGl1cy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gc2VjdG9yIHBpZSBzZWN0b3JcbiAgICAgKi9cbiAgICBfZXhwYW5kU2VjdG9yOiBmdW5jdGlvbihzZWN0b3IpIHtcbiAgICAgICAgdmFyIGN4ID0gdGhpcy5jaXJjbGVCb3VuZC5jeCxcbiAgICAgICAgICAgIGN5ID0gdGhpcy5jaXJjbGVCb3VuZC5jeTtcbiAgICAgICAgc2VjdG9yLmFuaW1hdGUoe1xuICAgICAgICAgICAgdHJhbnNmb3JtOiBcInMxLjEgMS4xIFwiICsgY3ggKyBcIiBcIiArIGN5XG4gICAgICAgIH0sIEFOSU1BVElPTl9USU1FLCBcImVsYXN0aWNcIik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIHJlc3RvcmUgc2VsZWN0b3IgcmFkaXVzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBzZWN0b3IgcGllIHNlY3RvclxuICAgICAqL1xuICAgIF9yZXN0b3JlU2VjdG9yOiBmdW5jdGlvbihzZWN0b3IpIHtcbiAgICAgICAgc2VjdG9yLmFuaW1hdGUoe3RyYW5zZm9ybTogXCJcIn0sIEFOSU1BVElPTl9USU1FLCBcImVsYXN0aWNcIik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNob3cgYW5pbWF0aW9uLlxuICAgICAqIEBwYXJhbSB7e2luZGV4OiBudW1iZXJ9fSBkYXRhIGRhdGFcbiAgICAgKi9cbiAgICBzaG93QW5pbWF0aW9uOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBzZWN0b3IgPSB0aGlzLnNlY3RvcnNbZGF0YS5pbmRleF0uc2VjdG9yO1xuICAgICAgICB0aGlzLl9leHBhbmRTZWN0b3Ioc2VjdG9yKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSGlkZSBhbmltYXRpb24uXG4gICAgICogQHBhcmFtIHt7aW5kZXg6IG51bWJlcn19IGRhdGEgZGF0YVxuICAgICAqL1xuICAgIGhpZGVBbmltYXRpb246IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIHNlY3RvciA9IHRoaXMuc2VjdG9yc1tkYXRhLmluZGV4XS5zZWN0b3I7XG4gICAgICAgIHRoaXMuX3Jlc3RvcmVTZWN0b3Ioc2VjdG9yKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQW5pbWF0ZS5cbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayBjYWxsYmFja1xuICAgICAqL1xuICAgIGFuaW1hdGU6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBkZWxheVRpbWUgPSAwLFxuICAgICAgICAgICAgY2lyY2xlQm91bmQgPSB0aGlzLmNpcmNsZUJvdW5kO1xuICAgICAgICB0dWkudXRpbC5mb3JFYWNoQXJyYXkodGhpcy5zZWN0b3JzLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICB2YXIgYW5nbGVzID0gaXRlbS5hbmdsZXMsXG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uVGltZSA9IExPQURJTkdfQU5JTUFUSU9OX1RJTUUgKiBpdGVtLnBlcmNlbnRWYWx1ZSxcbiAgICAgICAgICAgICAgICBhbmltID0gUmFwaGFlbC5hbmltYXRpb24oe1xuICAgICAgICAgICAgICAgICAgICBzZWN0b3I6IFtjaXJjbGVCb3VuZC5jeCwgY2lyY2xlQm91bmQuY3ksIGNpcmNsZUJvdW5kLnIsIGFuZ2xlcy5zdGFydEFuZ2xlLCBhbmdsZXMuZW5kQW5nbGVdXG4gICAgICAgICAgICAgICAgfSwgYW5pbWF0aW9uVGltZSk7XG4gICAgICAgICAgICBpdGVtLnNlY3Rvci5hbmltYXRlKGFuaW0uZGVsYXkoZGVsYXlUaW1lKSk7XG4gICAgICAgICAgICBkZWxheVRpbWUgKz0gYW5pbWF0aW9uVGltZTtcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGNhbGxiYWNrLCBkZWxheVRpbWUpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFuaW1hdGUgbGVnZW5kIGxpbmVzLlxuICAgICAqL1xuICAgIGFuaW1hdGVMZWdlbmRMaW5lczogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghdGhpcy5sZWdlbmRMaW5lcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHR1aS51dGlsLmZvckVhY2hBcnJheSh0aGlzLmxlZ2VuZExpbmVzLCBmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICBsaW5lLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgICdzdHJva2UnOiAnYmxhY2snLFxuICAgICAgICAgICAgICAgICdzdHJva2Utb3BhY2l0eSc6IDFcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSYXBoYWVsUGllQ2hhcnQ7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgVXRpbCBmb3IgcmFwaGFlbCByZW5kZXJpbmcuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVXRpbCBmb3IgcmFwaGFlbCByZW5kZXJpbmcuXG4gKiBAbW9kdWxlIHJhcGhhZWxSZW5kZXJVdGlsXG4gKi9cbnZhciByYXBoYWVsUmVuZGVyVXRpbCA9IHtcbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGxpbmUgcGF0aC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOnJhcGhhZWxSZW5kZXJVdGlsXG4gICAgICogQHBhcmFtIHt7dG9wOiBudW1iZXIsIGxlZnQ6IG51bWJlcn19IGZyb21Qb3MgZnJvbSBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7e3RvcDogbnVtYmVyLCBsZWZ0OiBudW1iZXJ9fSB0b1BvcyB0byBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aCB3aWR0aFxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IHBhdGhcbiAgICAgKi9cbiAgICBtYWtlTGluZVBhdGg6IGZ1bmN0aW9uKGZyb21Qb3MsIHRvUG9zLCB3aWR0aCkge1xuICAgICAgICB2YXIgZnJvbVBvaW50ID0gW2Zyb21Qb3MubGVmdCwgZnJvbVBvcy50b3BdLFxuICAgICAgICAgICAgdG9Qb2ludCA9IFt0b1Bvcy5sZWZ0LCB0b1Bvcy50b3BdO1xuXG4gICAgICAgIHdpZHRoID0gd2lkdGggfHwgMTtcblxuICAgICAgICB0dWkudXRpbC5mb3JFYWNoQXJyYXkoZnJvbVBvaW50LCBmdW5jdGlvbihmcm9tLCBpbmRleCkge1xuICAgICAgICAgICAgaWYgKGZyb20gPT09IHRvUG9pbnRbaW5kZXhdKSB7XG4gICAgICAgICAgICAgICAgZnJvbVBvaW50W2luZGV4XSA9IHRvUG9pbnRbaW5kZXhdID0gTWF0aC5yb3VuZChmcm9tKSAtICh3aWR0aCAlIDIgLyAyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiAnTScgKyBmcm9tUG9pbnQuam9pbignICcpICsgJ0wnICsgdG9Qb2ludC5qb2luKCcgJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBsaW5lLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6cmFwaGFlbFJlbmRlclV0aWxcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIGxpbmUgcGF0aFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb2xvciBsaW5lIGNvbG9yXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHN0cm9rZVdpZHRoIHN0cm9rZSB3aWR0aFxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHJhcGhhZWwgbGluZVxuICAgICAqL1xuICAgIHJlbmRlckxpbmU6IGZ1bmN0aW9uKHBhcGVyLCBwYXRoLCBjb2xvciwgc3Ryb2tlV2lkdGgpIHtcbiAgICAgICAgdmFyIGxpbmUgPSBwYXBlci5wYXRoKFtwYXRoXSksXG4gICAgICAgICAgICBzdHJva2VTdHlsZSA9IHtcbiAgICAgICAgICAgICAgICBzdHJva2U6IGNvbG9yLFxuICAgICAgICAgICAgICAgICdzdHJva2Utd2lkdGgnOiBzdHJva2VXaWR0aCB8fCAyXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIGlmIChjb2xvciA9PT0gJ3RyYW5zcGFyZW50Jykge1xuICAgICAgICAgICAgc3Ryb2tlU3R5bGUuc3Ryb2tlID0gJyNmZmYnO1xuICAgICAgICAgICAgc3Ryb2tlU3R5bGVbJ3N0cm9rZS1vcGFjaXR5J10gPSAwO1xuICAgICAgICB9XG4gICAgICAgIGxpbmUuYXR0cihzdHJva2VTdHlsZSk7XG5cbiAgICAgICAgcmV0dXJuIGxpbmU7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSByYXBoYWVsUmVuZGVyVXRpbDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuL2NvbnN0JyksXG4gICAgY2hhcnRGYWN0b3J5ID0gcmVxdWlyZSgnLi9mYWN0b3JpZXMvY2hhcnRGYWN0b3J5JyksXG4gICAgQmFyQ2hhcnQgPSByZXF1aXJlKCcuL2NoYXJ0cy9iYXJDaGFydCcpLFxuICAgIENvbHVtbkNoYXJ0ID0gcmVxdWlyZSgnLi9jaGFydHMvY29sdW1uQ2hhcnQnKSxcbiAgICBMaW5lQ2hhcnQgPSByZXF1aXJlKCcuL2NoYXJ0cy9saW5lQ2hhcnQnKSxcbiAgICBBcmVhQ2hhcnQgPSByZXF1aXJlKCcuL2NoYXJ0cy9hcmVhQ2hhcnQnKSxcbiAgICBDb21ib0NoYXJ0ID0gcmVxdWlyZSgnLi9jaGFydHMvY29tYm9DaGFydCcpLFxuICAgIFBpZUNoYXJ0ID0gcmVxdWlyZSgnLi9jaGFydHMvcGllQ2hhcnQnKTtcblxuY2hhcnRGYWN0b3J5LnJlZ2lzdGVyKGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9CQVIsIEJhckNoYXJ0KTtcbmNoYXJ0RmFjdG9yeS5yZWdpc3RlcihjaGFydENvbnN0LkNIQVJUX1RZUEVfQ09MVU1OLCBDb2x1bW5DaGFydCk7XG5jaGFydEZhY3RvcnkucmVnaXN0ZXIoY2hhcnRDb25zdC5DSEFSVF9UWVBFX0xJTkUsIExpbmVDaGFydCk7XG5jaGFydEZhY3RvcnkucmVnaXN0ZXIoY2hhcnRDb25zdC5DSEFSVF9UWVBFX0FSRUEsIEFyZWFDaGFydCk7XG5jaGFydEZhY3RvcnkucmVnaXN0ZXIoY2hhcnRDb25zdC5DSEFSVF9UWVBFX0NPTUJPLCBDb21ib0NoYXJ0KTtcbmNoYXJ0RmFjdG9yeS5yZWdpc3RlcihjaGFydENvbnN0LkNIQVJUX1RZUEVfUElFLCBQaWVDaGFydCk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjaGFydENvbnN0ID0gcmVxdWlyZSgnLi9jb25zdCcpLFxuICAgIHRoZW1lRmFjdG9yeSA9IHJlcXVpcmUoJy4vZmFjdG9yaWVzL3RoZW1lRmFjdG9yeScpLFxuICAgIGRlZmF1bHRUaGVtZSA9IHJlcXVpcmUoJy4vdGhlbWVzL2RlZmF1bHRUaGVtZScpO1xuXG50aGVtZUZhY3RvcnkucmVnaXN0ZXIoY2hhcnRDb25zdC5ERUZBVUxUX1RIRU1FX05BTUUsIGRlZmF1bHRUaGVtZSk7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgQXJlYSBjaGFydCBzZXJpZXMgY29tcG9uZW50LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU2VyaWVzID0gcmVxdWlyZSgnLi9zZXJpZXMnKSxcbiAgICBMaW5lVHlwZVNlcmllc0Jhc2UgPSByZXF1aXJlKCcuL2xpbmVUeXBlU2VyaWVzQmFzZScpO1xuXG52YXIgQXJlYUNoYXJ0U2VyaWVzID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoU2VyaWVzLCAvKiogQGxlbmRzIEFyZWFDaGFydFNlcmllcy5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIEFyZWEgY2hhcnQgc2VyaWVzIGNvbXBvbmVudC5cbiAgICAgKiBAY29uc3RydWN0cyBBcmVhQ2hhcnRTZXJpZXNcbiAgICAgKiBAZXh0ZW5kcyBTZXJpZXNcbiAgICAgKiBAbWl4ZXMgTGluZVR5cGVTZXJpZXNCYXNlXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm1vZGVsIHNlcmllcyBtb2RlbFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5vcHRpb25zIHNlcmllcyBvcHRpb25zXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIHNlcmllcyB0aGVtZVxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBTZXJpZXMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBzZXJpZXMgZGF0YS5cbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBhZGQgZGF0YVxuICAgICAqL1xuICAgIG1ha2VTZXJpZXNEYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGRpbWVuc2lvbiA9IHRoaXMuYm91bmQuZGltZW5zaW9uLFxuICAgICAgICAgICAgc2NhbGVEaXN0YW5jZSA9IHRoaXMuZ2V0U2NhbGVEaXN0YW5jZUZyb21aZXJvUG9pbnQoZGltZW5zaW9uLmhlaWdodCwgdGhpcy5kYXRhLnNjYWxlKSxcbiAgICAgICAgICAgIHplcm9Ub3AgPSBzY2FsZURpc3RhbmNlLnRvTWF4O1xuICAgICAgICBpZiAodGhpcy5kYXRhLnNjYWxlLm1pbiA+PSAwICYmICF6ZXJvVG9wKSB7XG4gICAgICAgICAgICB6ZXJvVG9wID0gZGltZW5zaW9uLmhlaWdodDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBncm91cFBvc2l0aW9uczogdGhpcy5tYWtlUG9zaXRpb25zKGRpbWVuc2lvbiksXG4gICAgICAgICAgICB6ZXJvVG9wOiB6ZXJvVG9wXG4gICAgICAgIH07XG4gICAgfVxufSk7XG5cbkxpbmVUeXBlU2VyaWVzQmFzZS5taXhpbihBcmVhQ2hhcnRTZXJpZXMpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFyZWFDaGFydFNlcmllcztcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBCYXIgY2hhcnQgc2VyaWVzIGNvbXBvbmVudC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFNlcmllcyA9IHJlcXVpcmUoJy4vc2VyaWVzJyksXG4gICAgQmFyVHlwZVNlcmllc0Jhc2UgPSByZXF1aXJlKCcuL2JhclR5cGVTZXJpZXNCYXNlJyksXG4gICAgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4uL2NvbnN0JyksXG4gICAgcmVuZGVyVXRpbCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvcmVuZGVyVXRpbCcpO1xuXG52YXIgQmFyQ2hhcnRTZXJpZXMgPSB0dWkudXRpbC5kZWZpbmVDbGFzcyhTZXJpZXMsIC8qKiBAbGVuZHMgQmFyQ2hhcnRTZXJpZXMucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBCYXIgY2hhcnQgc2VyaWVzIGNvbXBvbmVudC5cbiAgICAgKiBAY29uc3RydWN0cyBCYXJDaGFydFNlcmllc1xuICAgICAqIEBleHRlbmRzIFNlcmllc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5tb2RlbCBzZXJpZXMgbW9kZWxcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMub3B0aW9ucyBzZXJpZXMgb3B0aW9uc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBzZXJpZXMgdGhlbWVcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgU2VyaWVzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfSxcblxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBib3VuZCBvZiBiYXIgY2hhcnQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge3t0b3A6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBwYXJhbXMuYmFzZUJvdW5kIGJhc2UgYm91bmRcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuc3RhcnRMZWZ0IHN0YXJ0IGxlZnRcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuZW5kTGVmdCBlbmQgbGVmdFxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5lbmRXaWR0aCBlbmQgd2lkdGhcbiAgICAgKiBAcmV0dXJucyB7e1xuICAgICAqICAgICAgc3RhcnQ6IHtsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn0sXG4gICAgICogICAgICBlbmQ6IHtsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn1cbiAgICAgKiB9fSBjb2x1bW4gY2hhcnQgYm91bmRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQmFyQ2hhcnRCb3VuZDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdGFydDogdHVpLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICBsZWZ0OiBwYXJhbXMuc3RhcnRMZWZ0LFxuICAgICAgICAgICAgICAgIHdpZHRoOiAwXG4gICAgICAgICAgICB9LCBwYXJhbXMuYmFzZUJvdW5kKSxcbiAgICAgICAgICAgIGVuZDogdHVpLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICBsZWZ0OiBwYXJhbXMuZW5kTGVmdCxcbiAgICAgICAgICAgICAgICB3aWR0aDogcGFyYW1zLmVuZFdpZHRoXG4gICAgICAgICAgICB9LCBwYXJhbXMuYmFzZUJvdW5kKVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIG5vcm1hbCBiYXIgY2hhcnQgYm91bmQuXG4gICAgICogQHBhcmFtIHt7XG4gICAgICogICAgICBkaW1lbnNpb246IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn0sXG4gICAgICogICAgICBncm91cFZhbHVlczogYXJyYXkuPGFycmF5LjxudW1iZXI+PixcbiAgICAgKiAgICAgIGdyb3VwU2l6ZTogbnVtYmVyLCBiYXJQYWRkaW5nOiBudW1iZXIsIGJhclNpemU6IG51bWJlciwgc3RlcDogbnVtYmVyLFxuICAgICAqICAgICAgZGlzdGFuY2VUb01pbjogbnVtYmVyLCBpc01pbnVzOiBib29sZWFuXG4gICAgICogfX0gYmFzZUluZm8gYmFzZSBpbmZvXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIHZhbHVlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHBhZGRpbmdUb3AgcGFkZGluZyB0b3BcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggaW5kZXhcbiAgICAgKiBAcmV0dXJucyB7e1xuICAgICAqICAgICAgc3RhcnQ6IHtsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn0sXG4gICAgICogICAgICBlbmQ6IHtsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn1cbiAgICAgKiB9fSBjb2x1bW4gY2hhcnQgYm91bmRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlTm9ybWFsQmFyQ2hhcnRCb3VuZDogZnVuY3Rpb24oYmFzZUluZm8sIHZhbHVlLCBwYWRkaW5nVG9wLCBpbmRleCkge1xuICAgICAgICB2YXIgc3RhcnRMZWZ0LCBlbmRXaWR0aCwgYm91bmQsIGJhc2VCb3VuZDtcblxuICAgICAgICBzdGFydExlZnQgPSBiYXNlSW5mby5kaXN0YW5jZVRvTWluICsgY2hhcnRDb25zdC5TRVJJRVNfRVhQQU5EX1NJWkU7XG4gICAgICAgIGVuZFdpZHRoID0gTWF0aC5hYnModmFsdWUgKiBiYXNlSW5mby5kaW1lbnNpb24ud2lkdGgpO1xuICAgICAgICBiYXNlQm91bmQgPSB7XG4gICAgICAgICAgICB0b3A6IHBhZGRpbmdUb3AgKyAoKGJhc2VJbmZvLnN0ZXApICogaW5kZXgpLFxuICAgICAgICAgICAgaGVpZ2h0OiBiYXNlSW5mby5iYXJTaXplXG4gICAgICAgIH07XG4gICAgICAgIGJvdW5kID0gdGhpcy5fbWFrZUJhckNoYXJ0Qm91bmQoe1xuICAgICAgICAgICAgYmFzZUJvdW5kOiBiYXNlQm91bmQsXG4gICAgICAgICAgICBzdGFydExlZnQ6IHN0YXJ0TGVmdCxcbiAgICAgICAgICAgIGVuZExlZnQ6IHN0YXJ0TGVmdCArICh2YWx1ZSA8IDAgPyAtZW5kV2lkdGggOiAwKSxcbiAgICAgICAgICAgIGVuZFdpZHRoOiBlbmRXaWR0aFxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gYm91bmQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYm91bmRzIG9mIG5vcm1hbCBiYXIgY2hhcnQuXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0Om51bWJlcn19IGRpbWVuc2lvbiBiYXIgY2hhcnQgZGltZW5zaW9uXG4gICAgICogQHJldHVybnMge2FycmF5LjxhcnJheS48b2JqZWN0Pj59IGJvdW5kc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VOb3JtYWxCYXJDaGFydEJvdW5kczogZnVuY3Rpb24oZGltZW5zaW9uKSB7XG4gICAgICAgIHZhciBiYXNlSW5mbyA9IHRoaXMubWFrZUJhc2VJbmZvRm9yTm9ybWFsQ2hhcnRCb3VuZHMoZGltZW5zaW9uLCAnd2lkdGgnLCAnaGVpZ2h0JyksXG4gICAgICAgICAgICBib3VuZHM7XG5cbiAgICAgICAgYm91bmRzID0gdHVpLnV0aWwubWFwKGJhc2VJbmZvLmdyb3VwVmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMsIGdyb3VwSW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBwYWRkaW5nVG9wID0gKGJhc2VJbmZvLmdyb3VwU2l6ZSAqIGdyb3VwSW5kZXgpICsgKGJhc2VJbmZvLmJhclNpemUgLyAyKTtcbiAgICAgICAgICAgIHJldHVybiB0dWkudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbiAodmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21ha2VOb3JtYWxCYXJDaGFydEJvdW5kKGJhc2VJbmZvLCB2YWx1ZSwgcGFkZGluZ1RvcCwgaW5kZXgpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIHJldHVybiBib3VuZHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYm91bmRzIG9mIHN0YWNrZWQgYmFyIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDpudW1iZXJ9fSBkaW1lbnNpb24gYmFyIGNoYXJ0IGRpbWVuc2lvblxuICAgICAqIEByZXR1cm5zIHthcnJheS48YXJyYXkuPG9iamVjdD4+fSBib3VuZHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlU3RhY2tlZEJhckNoYXJ0Qm91bmRzOiBmdW5jdGlvbihkaW1lbnNpb24pIHtcbiAgICAgICAgdmFyIGdyb3VwVmFsdWVzLCBncm91cEhlaWdodCwgYmFySGVpZ2h0LCBib3VuZHM7XG4gICAgICAgIGdyb3VwVmFsdWVzID0gdGhpcy5wZXJjZW50VmFsdWVzO1xuICAgICAgICBncm91cEhlaWdodCA9IChkaW1lbnNpb24uaGVpZ2h0IC8gZ3JvdXBWYWx1ZXMubGVuZ3RoKTtcbiAgICAgICAgYmFySGVpZ2h0ID0gZ3JvdXBIZWlnaHQgLyAyO1xuICAgICAgICBib3VuZHMgPSB0dWkudXRpbC5tYXAoZ3JvdXBWYWx1ZXMsIGZ1bmN0aW9uICh2YWx1ZXMsIGdyb3VwSW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBwYWRkaW5nVG9wID0gKGdyb3VwSGVpZ2h0ICogZ3JvdXBJbmRleCkgKyAoYmFySGVpZ2h0IC8gMiksXG4gICAgICAgICAgICAgICAgZW5kTGVmdCA9IGNoYXJ0Q29uc3QuU0VSSUVTX0VYUEFORF9TSVpFO1xuICAgICAgICAgICAgcmV0dXJuIHR1aS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHZhciBlbmRXaWR0aCwgYmFzZUJvdW5kLCBib3VuZDtcblxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZW5kV2lkdGggPSB2YWx1ZSAqIGRpbWVuc2lvbi53aWR0aDtcbiAgICAgICAgICAgICAgICBiYXNlQm91bmQgPSB7XG4gICAgICAgICAgICAgICAgICAgIHRvcDogcGFkZGluZ1RvcCxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBiYXJIZWlnaHRcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGJvdW5kID0gdGhpcy5fbWFrZUJhckNoYXJ0Qm91bmQoe1xuICAgICAgICAgICAgICAgICAgICBiYXNlQm91bmQ6IGJhc2VCb3VuZCxcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRMZWZ0OiBjaGFydENvbnN0LlNFUklFU19FWFBBTkRfU0laRSxcbiAgICAgICAgICAgICAgICAgICAgZW5kTGVmdDogZW5kTGVmdCxcbiAgICAgICAgICAgICAgICAgICAgZW5kV2lkdGg6IGVuZFdpZHRoXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBlbmRMZWZ0ID0gZW5kTGVmdCArIGVuZFdpZHRoO1xuICAgICAgICAgICAgICAgIHJldHVybiBib3VuZDtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIGJvdW5kcztcbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGJvdW5kcyBvZiBiYXIgY2hhcnQuXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0Om51bWJlcn19IGRpbWVuc2lvbiBiYXIgY2hhcnQgZGltZW5zaW9uXG4gICAgICogQHJldHVybnMge2FycmF5LjxhcnJheS48b2JqZWN0Pj59IGJvdW5kc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VCb3VuZHM6IGZ1bmN0aW9uKGRpbWVuc2lvbikge1xuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5zdGFja2VkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbWFrZU5vcm1hbEJhckNoYXJ0Qm91bmRzKGRpbWVuc2lvbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbWFrZVN0YWNrZWRCYXJDaGFydEJvdW5kcyhkaW1lbnNpb24pO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2Ugc2VyaWVzIHJlbmRlcmluZyBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7b2JlamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMudmFsdWUgdmFsdWVcbiAgICAgKiAgICAgIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXIsIHdpZHRoOm51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBwYXJhbXMuYm91bmQgYm91bmRcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMuZm9ybWF0dGVkVmFsdWUgZm9ybWF0dGVkIHZhbHVlXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmxhYmVsSGVpZ2h0IGxhYmVsIGhlaWdodFxuICAgICAqIEByZXR1cm5zIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IHJlbmRlcmluZyBwb3NpdGlvblxuICAgICAqL1xuICAgIG1ha2VTZXJpZXNSZW5kZXJpbmdQb3NpdGlvbjogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBsYWJlbFdpZHRoID0gcmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsV2lkdGgocGFyYW1zLmZvcm1hdHRlZFZhbHVlLCB0aGlzLnRoZW1lLmxhYmVsKSxcbiAgICAgICAgICAgIGJvdW5kID0gcGFyYW1zLmJvdW5kLFxuICAgICAgICAgICAgbGVmdCA9IGJvdW5kLmxlZnQsXG4gICAgICAgICAgICB0b3AgPSBib3VuZC50b3AgKyAoYm91bmQuaGVpZ2h0IC0gcGFyYW1zLmxhYmVsSGVpZ2h0ICsgY2hhcnRDb25zdC5URVhUX1BBRERJTkcpIC8gMjtcblxuICAgICAgICBpZiAocGFyYW1zLnZhbHVlID49IDApIHtcbiAgICAgICAgICAgIGxlZnQgKz0gYm91bmQud2lkdGggKyBjaGFydENvbnN0LlNFUklFU19MQUJFTF9QQURESU5HO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGVmdCAtPSBsYWJlbFdpZHRoICsgY2hhcnRDb25zdC5TRVJJRVNfTEFCRUxfUEFERElORztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsZWZ0OiBsZWZ0LFxuICAgICAgICAgICAgdG9wOiB0b3BcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBzdW0gbGFiZWwgaHRtbC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPG51bWJlcj59IHBhcmFtcy52YWx1ZXMgdmFsdWVzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxmdW5jdGlvbj59IHBhcmFtcy5mb3JtYXRGdW5jdGlvbnMgZm9ybWF0dGluZyBmdW5jdGlvbnNcbiAgICAgKiAgICAgIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBwYXJhbXMuYm91bmQgYm91bmRcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubGFiZWxIZWlnaHQgbGFiZWwgaGVpZ2h0XG4gICAgICogQHJldHVybnMge3N0cmluZ30gc3VtIGxhYmVsIGh0bWxcbiAgICAgKi9cbiAgICBtYWtlU3VtTGFiZWxIdG1sOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIHN1bSA9IHRoaXMubWFrZVN1bVZhbHVlcyhwYXJhbXMudmFsdWVzLCBwYXJhbXMuZm9ybWF0RnVuY3Rpb25zKSxcbiAgICAgICAgICAgIGJvdW5kID0gcGFyYW1zLmJvdW5kLFxuICAgICAgICAgICAgbGFiZWxIZWlnaHQgPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxIZWlnaHQoc3VtLCB0aGlzLnRoZW1lLmxhYmVsKSxcbiAgICAgICAgICAgIHRvcCA9IGJvdW5kLnRvcCArICgoYm91bmQuaGVpZ2h0IC0gbGFiZWxIZWlnaHQgKyBjaGFydENvbnN0LlRFWFRfUEFERElORykgLyAyKSxcbiAgICAgICAgICAgIGxlZnQgPSBib3VuZC5sZWZ0ICsgYm91bmQud2lkdGggKyBjaGFydENvbnN0LlNFUklFU19MQUJFTF9QQURESU5HO1xuXG4gICAgICAgIHJldHVybiB0aGlzLm1ha2VTZXJpZXNMYWJlbEh0bWwoe1xuICAgICAgICAgICAgbGVmdDogbGVmdCxcbiAgICAgICAgICAgIHRvcDogdG9wXG4gICAgICAgIH0sIHN1bSwgLTEsIC0xKTtcbiAgICB9XG59KTtcblxuQmFyVHlwZVNlcmllc0Jhc2UubWl4aW4oQmFyQ2hhcnRTZXJpZXMpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJhckNoYXJ0U2VyaWVzO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IENvbHVtbiBjaGFydCBzZXJpZXMgY29tcG9uZW50LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4uL2NvbnN0JyksXG4gICAgZG9tID0gcmVxdWlyZSgnLi4vaGVscGVycy9kb21IYW5kbGVyJyksXG4gICAgcmVuZGVyVXRpbCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvcmVuZGVyVXRpbCcpO1xuXG52YXIgQmFyVHlwZVNlcmllc0Jhc2UgPSB0dWkudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIEJhclR5cGVTZXJpZXNCYXNlLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBzZXJpZXMgZGF0YS5cbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBhZGQgZGF0YVxuICAgICAqL1xuICAgIG1ha2VTZXJpZXNEYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGdyb3VwQm91bmRzID0gdGhpcy5fbWFrZUJvdW5kcyh0aGlzLmJvdW5kLmRpbWVuc2lvbik7XG5cbiAgICAgICAgdGhpcy5ncm91cEJvdW5kcyA9IGdyb3VwQm91bmRzO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBncm91cEJvdW5kczogZ3JvdXBCb3VuZHMsXG4gICAgICAgICAgICBncm91cFZhbHVlczogdGhpcy5wZXJjZW50VmFsdWVzXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYmFyIGd1dHRlci5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZ3JvdXBTaXplIGJhciBncm91cCBzaXplXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGl0ZW1Db3VudCBncm91cCBpdGVtIGNvdW50XG4gICAgICogQHJldHVybnMge251bWJlcn0gYmFyIGd1dHRlclxuICAgICAqL1xuICAgIG1ha2VCYXJHdXR0ZXI6IGZ1bmN0aW9uKGdyb3VwU2l6ZSwgaXRlbUNvdW50KSB7XG4gICAgICAgIHZhciBiYXNlU2l6ZSA9IGdyb3VwU2l6ZSAvIChpdGVtQ291bnQgKyAxKSAvIDIsXG4gICAgICAgICAgICBndXR0ZXI7XG4gICAgICAgIGlmIChiYXNlU2l6ZSA8PSAyKSB7XG4gICAgICAgICAgICBndXR0ZXIgPSAwO1xuICAgICAgICB9IGVsc2UgaWYgKGJhc2VTaXplIDw9IDYpIHtcbiAgICAgICAgICAgIGd1dHRlciA9IDI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBndXR0ZXIgPSA0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBndXR0ZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYmFyIHNpemUuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGdyb3VwU2l6ZSBiYXIgZ3JvdXAgc2l6ZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBiYXJQYWRkaW5nIGJhciBwYWRkaW5nXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGl0ZW1Db3VudCBncm91cCBpdGVtIGNvdW50XG4gICAgICogQHJldHVybnMge251bWJlcn0gYmFyIHNpemUgKHdpZHRoIG9yIGhlaWdodClcbiAgICAgKi9cbiAgICBtYWtlQmFyU2l6ZTogZnVuY3Rpb24oZ3JvdXBTaXplLCBiYXJQYWRkaW5nLCBpdGVtQ291bnQpIHtcbiAgICAgICAgcmV0dXJuIChncm91cFNpemUgLSAoYmFyUGFkZGluZyAqIChpdGVtQ291bnQgLSAxKSkpIC8gKGl0ZW1Db3VudCArIDEpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGJhc2UgaW5mbyBmb3Igbm9ybWFsIGNoYXJ0IGJvdW5kcy5cbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGRpbWVuc2lvbiBzZXJpZXMgZGltZW5zaW9uXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHNpemVUeXBlIHNpemUgdHlwZSAod2lkdGggb3IgaGVpZ2h0KVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBhbm90aGVyU2l6ZVR5cGUgYW5vdGhlciBzaXplIHR5cGUgKHdpZHRoIG9yIGhlaWdodClcbiAgICAgKiBAcmV0dXJucyB7e1xuICAgICAqICAgICAgZGltZW5zaW9uOiB7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9LFxuICAgICAqICAgICAgZ3JvdXBWYWx1ZXM6IGFycmF5LjxhcnJheS48bnVtYmVyPj4sXG4gICAgICogICAgICBncm91cFNpemU6IG51bWJlciwgYmFyUGFkZGluZzogbnVtYmVyLCBiYXJTaXplOiBudW1iZXIsIHN0ZXA6IG51bWJlcixcbiAgICAgKiAgICAgIGRpc3RhbmNlVG9NaW46IG51bWJlciwgaXNNaW51czogYm9vbGVhblxuICAgICAqIH19IGJhc2UgaW5mb1xuICAgICAqL1xuICAgIG1ha2VCYXNlSW5mb0Zvck5vcm1hbENoYXJ0Qm91bmRzOiBmdW5jdGlvbihkaW1lbnNpb24sIHNpemVUeXBlLCBhbm90aGVyU2l6ZVR5cGUpIHtcbiAgICAgICAgdmFyIGdyb3VwVmFsdWVzID0gdGhpcy5wZXJjZW50VmFsdWVzLFxuICAgICAgICAgICAgZ3JvdXBTaXplID0gZGltZW5zaW9uW2Fub3RoZXJTaXplVHlwZV0gLyBncm91cFZhbHVlcy5sZW5ndGgsXG4gICAgICAgICAgICBpdGVtQ291bnQgPSBncm91cFZhbHVlc1swXSAmJiBncm91cFZhbHVlc1swXS5sZW5ndGggfHwgMCxcbiAgICAgICAgICAgIGJhclBhZGRpbmcgPSB0aGlzLm1ha2VCYXJHdXR0ZXIoZ3JvdXBTaXplLCBpdGVtQ291bnQpLFxuICAgICAgICAgICAgYmFyU2l6ZSA9IHRoaXMubWFrZUJhclNpemUoZ3JvdXBTaXplLCBiYXJQYWRkaW5nLCBpdGVtQ291bnQpLFxuICAgICAgICAgICAgc2NhbGVEaXN0YW5jZSA9IHRoaXMuZ2V0U2NhbGVEaXN0YW5jZUZyb21aZXJvUG9pbnQoZGltZW5zaW9uW3NpemVUeXBlXSwgdGhpcy5kYXRhLnNjYWxlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRpbWVuc2lvbjogZGltZW5zaW9uLFxuICAgICAgICAgICAgZ3JvdXBWYWx1ZXM6IGdyb3VwVmFsdWVzLFxuICAgICAgICAgICAgZ3JvdXBTaXplOiBncm91cFNpemUsXG4gICAgICAgICAgICBiYXJQYWRkaW5nOiBiYXJQYWRkaW5nLFxuICAgICAgICAgICAgYmFyU2l6ZTogYmFyU2l6ZSxcbiAgICAgICAgICAgIHN0ZXA6IGJhclNpemUgKyBiYXJQYWRkaW5nLFxuICAgICAgICAgICAgZGlzdGFuY2VUb01pbjogc2NhbGVEaXN0YW5jZS50b01pbixcbiAgICAgICAgICAgIGlzTWludXM6IHRoaXMuZGF0YS5zY2FsZS5taW4gPCAwICYmIHRoaXMuZGF0YS5zY2FsZS5tYXggPD0gMFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgbm9ybWFsIHNlcmllcyBsYWJlbC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHBhcmFtcy5jb250YWluZXIgY29udGFpbmVyXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IHBhcmFtcy5ncm91cEJvdW5kcyBncm91cCBib3VuZHNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gcGFyYW1zLmZvcm1hdHRlZFZhbHVlcyBmb3JtYXR0ZWQgdmFsdWVzXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSBzZXJpZXMgbGFiZWwgYXJlYVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlck5vcm1hbFNlcmllc0xhYmVsOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGdyb3VwQm91bmRzID0gcGFyYW1zLmdyb3VwQm91bmRzLFxuICAgICAgICAgICAgZm9ybWF0dGVkVmFsdWVzID0gcGFyYW1zLmZvcm1hdHRlZFZhbHVlcyxcbiAgICAgICAgICAgIGxhYmVsSGVpZ2h0ID0gcmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsSGVpZ2h0KGZvcm1hdHRlZFZhbHVlc1swXVswXSwgdGhpcy50aGVtZS5sYWJlbCksXG4gICAgICAgICAgICBlbFNlcmllc0xhYmVsQXJlYSA9IGRvbS5jcmVhdGUoJ2RpdicsICd0dWktY2hhcnQtc2VyaWVzLWxhYmVsLWFyZWEnKSxcbiAgICAgICAgICAgIGh0bWw7XG4gICAgICAgIGh0bWwgPSB0dWkudXRpbC5tYXAocGFyYW1zLnZhbHVlcywgZnVuY3Rpb24odmFsdWVzLCBncm91cEluZGV4KSB7XG4gICAgICAgICAgICByZXR1cm4gdHVpLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdmFyIGJvdW5kLCBmb3JtYXR0ZWRWYWx1ZSwgcmVuZGVyaW5nUG9zaXRpb247XG4gICAgICAgICAgICAgICAgYm91bmQgPSBncm91cEJvdW5kc1tncm91cEluZGV4XVtpbmRleF0uZW5kO1xuICAgICAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlID0gZm9ybWF0dGVkVmFsdWVzW2dyb3VwSW5kZXhdW2luZGV4XTtcbiAgICAgICAgICAgICAgICByZW5kZXJpbmdQb3NpdGlvbiA9IHRoaXMubWFrZVNlcmllc1JlbmRlcmluZ1Bvc2l0aW9uKHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgICAgICAgICBib3VuZDogYm91bmQsXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlOiBmb3JtYXR0ZWRWYWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxIZWlnaHQ6IGxhYmVsSGVpZ2h0XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubWFrZVNlcmllc0xhYmVsSHRtbChyZW5kZXJpbmdQb3NpdGlvbiwgZm9ybWF0dGVkVmFsdWUsIGdyb3VwSW5kZXgsIGluZGV4KTtcbiAgICAgICAgICAgIH0sIHRoaXMpLmpvaW4oJycpO1xuICAgICAgICB9LCB0aGlzKS5qb2luKCcnKTtcblxuICAgICAgICBlbFNlcmllc0xhYmVsQXJlYS5pbm5lckhUTUwgPSBodG1sO1xuICAgICAgICBwYXJhbXMuY29udGFpbmVyLmFwcGVuZENoaWxkKGVsU2VyaWVzTGFiZWxBcmVhKTtcblxuICAgICAgICByZXR1cm4gZWxTZXJpZXNMYWJlbEFyZWE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2Ugc3VtIHZhbHVlcy5cbiAgICAgKiBAcGFyYW0ge2FycmF5LjxudW1iZXI+fSB2YWx1ZXMgdmFsdWVzXG4gICAgICogQHBhcmFtIHthcnJheS48ZnVuY3Rpb24+fSBmb3JtYXRGdW5jdGlvbnMgZm9ybWF0IGZ1bmN0aW9uc1xuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IHN1bSByZXN1bHQuXG4gICAgICovXG4gICAgbWFrZVN1bVZhbHVlczogZnVuY3Rpb24odmFsdWVzLCBmb3JtYXRGdW5jdGlvbnMpIHtcbiAgICAgICAgdmFyIHN1bSA9IHR1aS51dGlsLnN1bSh0dWkudXRpbC5maWx0ZXIodmFsdWVzLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSA+IDA7XG4gICAgICAgICAgICB9KSksXG4gICAgICAgICAgICBmbnMgPSBbc3VtXS5jb25jYXQoZm9ybWF0RnVuY3Rpb25zIHx8IFtdKTtcblxuICAgICAgICByZXR1cm4gdHVpLnV0aWwucmVkdWNlKGZucywgZnVuY3Rpb24oc3RvcmVkLCBmbikge1xuICAgICAgICAgICAgcmV0dXJuIGZuKHN0b3JlZCk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHN0YWNrZWQgbGFiZWxzIGh0bWwuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmdyb3VwSW5kZXggZ3JvdXAgaW5kZXhcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPG51bWJlcj59IHBhcmFtcy52YWx1ZXMgdmFsdWVzLFxuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48ZnVuY3Rpb24+fSBwYXJhbXMuZm9ybWF0RnVuY3Rpb25zIGZvcm1hdHRpbmcgZnVuY3Rpb25zLFxuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48b2JqZWN0Pn0gcGFyYW1zLmJvdW5kcyBib3VuZHMsXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5fSBwYXJhbXMuZm9ybWF0dGVkVmFsdWVzIGZvcm1hdHRlZCB2YWx1ZXMsXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmxhYmVsSGVpZ2h0IGxhYmVsIGhlaWdodFxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGxhYmVscyBodG1sXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVN0YWNrZWRMYWJlbHNIdG1sOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIHZhbHVlcyA9IHBhcmFtcy52YWx1ZXMsXG4gICAgICAgICAgICBib3VuZCwgaHRtbHM7XG5cbiAgICAgICAgaHRtbHMgPSB0dWkudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBsYWJlbFdpZHRoLCBsZWZ0LCB0b3AsIGxhYmVsSHRtbCwgZm9ybWF0dGVkVmFsdWU7XG5cbiAgICAgICAgICAgIGlmICh2YWx1ZSA8IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGJvdW5kID0gcGFyYW1zLmJvdW5kc1tpbmRleF0uZW5kO1xuICAgICAgICAgICAgZm9ybWF0dGVkVmFsdWUgPSBwYXJhbXMuZm9ybWF0dGVkVmFsdWVzW2luZGV4XTtcbiAgICAgICAgICAgIGxhYmVsV2lkdGggPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxXaWR0aChmb3JtYXR0ZWRWYWx1ZSwgdGhpcy50aGVtZS5sYWJlbCk7XG4gICAgICAgICAgICBsZWZ0ID0gYm91bmQubGVmdCArICgoYm91bmQud2lkdGggLSBsYWJlbFdpZHRoICsgY2hhcnRDb25zdC5URVhUX1BBRERJTkcpIC8gMik7XG4gICAgICAgICAgICB0b3AgPSBib3VuZC50b3AgKyAoKGJvdW5kLmhlaWdodCAtIHBhcmFtcy5sYWJlbEhlaWdodCArIGNoYXJ0Q29uc3QuVEVYVF9QQURESU5HKSAvIDIpO1xuICAgICAgICAgICAgbGFiZWxIdG1sID0gdGhpcy5tYWtlU2VyaWVzTGFiZWxIdG1sKHtcbiAgICAgICAgICAgICAgICBsZWZ0OiBsZWZ0LFxuICAgICAgICAgICAgICAgIHRvcDogdG9wXG4gICAgICAgICAgICB9LCBmb3JtYXR0ZWRWYWx1ZSwgcGFyYW1zLmdyb3VwSW5kZXgsIGluZGV4KTtcbiAgICAgICAgICAgIHJldHVybiBsYWJlbEh0bWw7XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc3RhY2tlZCA9PT0gJ25vcm1hbCcpIHtcbiAgICAgICAgICAgIGh0bWxzLnB1c2godGhpcy5tYWtlU3VtTGFiZWxIdG1sKHtcbiAgICAgICAgICAgICAgICB2YWx1ZXM6IHZhbHVlcyxcbiAgICAgICAgICAgICAgICBmb3JtYXRGdW5jdGlvbnM6IHBhcmFtcy5mb3JtYXRGdW5jdGlvbnMsXG4gICAgICAgICAgICAgICAgYm91bmQ6IGJvdW5kLFxuICAgICAgICAgICAgICAgIGxhYmVsSGVpZ2h0OiBwYXJhbXMubGFiZWxIZWlnaHRcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaHRtbHMuam9pbignJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBzdGFja2VkIHNlcmllcyBsYWJlbC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHBhcmFtcy5jb250YWluZXIgY29udGFpbmVyXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IHBhcmFtcy5ncm91cEJvdW5kcyBncm91cCBib3VuZHNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gcGFyYW1zLmZvcm1hdHRlZFZhbHVlcyBmb3JtYXR0ZWQgdmFsdWVzXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSBzZXJpZXMgbGFiZWwgYXJlYVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlclN0YWNrZWRTZXJpZXNMYWJlbDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBncm91cEJvdW5kcyA9IHBhcmFtcy5ncm91cEJvdW5kcyxcbiAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlcyA9IHBhcmFtcy5mb3JtYXR0ZWRWYWx1ZXMsXG4gICAgICAgICAgICBmb3JtYXRGdW5jdGlvbnMgPSBwYXJhbXMuZm9ybWF0RnVuY3Rpb25zIHx8IFtdLFxuICAgICAgICAgICAgZWxTZXJpZXNMYWJlbEFyZWEgPSBkb20uY3JlYXRlKCdkaXYnLCAndHVpLWNoYXJ0LXNlcmllcy1sYWJlbC1hcmVhJyksXG4gICAgICAgICAgICBsYWJlbEhlaWdodCA9IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodChmb3JtYXR0ZWRWYWx1ZXNbMF1bMF0sIHRoaXMudGhlbWUubGFiZWwpLFxuICAgICAgICAgICAgaHRtbDtcblxuICAgICAgICBodG1sID0gdHVpLnV0aWwubWFwKHBhcmFtcy52YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcywgaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBsYWJlbHNIdG1sID0gdGhpcy5fbWFrZVN0YWNrZWRMYWJlbHNIdG1sKHtcbiAgICAgICAgICAgICAgICBncm91cEluZGV4OiBpbmRleCxcbiAgICAgICAgICAgICAgICB2YWx1ZXM6IHZhbHVlcyxcbiAgICAgICAgICAgICAgICBmb3JtYXRGdW5jdGlvbnM6IGZvcm1hdEZ1bmN0aW9ucyxcbiAgICAgICAgICAgICAgICBib3VuZHM6IGdyb3VwQm91bmRzW2luZGV4XSxcbiAgICAgICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXM6IGZvcm1hdHRlZFZhbHVlc1tpbmRleF0sXG4gICAgICAgICAgICAgICAgbGFiZWxIZWlnaHQ6IGxhYmVsSGVpZ2h0XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBsYWJlbHNIdG1sO1xuICAgICAgICB9LCB0aGlzKS5qb2luKCcnKTtcblxuICAgICAgICBlbFNlcmllc0xhYmVsQXJlYS5pbm5lckhUTUwgPSBodG1sO1xuICAgICAgICBwYXJhbXMuY29udGFpbmVyLmFwcGVuZENoaWxkKGVsU2VyaWVzTGFiZWxBcmVhKTtcblxuICAgICAgICByZXR1cm4gZWxTZXJpZXNMYWJlbEFyZWE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBzZXJpZXMgbGFiZWwuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge0hUTUxFbGVtZW50fSBwYXJhbXMuY29udGFpbmVyIGNvbnRhaW5lclxuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48YXJyYXk+fSBwYXJhbXMuZ3JvdXBCb3VuZHMgZ3JvdXAgYm91bmRzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IHBhcmFtcy5mb3JtYXR0ZWRWYWx1ZXMgZm9ybWF0dGVkIHZhbHVlc1xuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gc2VyaWVzIGxhYmVsIGFyZWFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJTZXJpZXNMYWJlbDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBlbFNlcmllc0xhYmVsQXJlYTtcbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuc2hvd0xhYmVsKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc3RhY2tlZCkge1xuICAgICAgICAgICAgZWxTZXJpZXNMYWJlbEFyZWEgPSB0aGlzLl9yZW5kZXJTdGFja2VkU2VyaWVzTGFiZWwocGFyYW1zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsU2VyaWVzTGFiZWxBcmVhID0gdGhpcy5fcmVuZGVyTm9ybWFsU2VyaWVzTGFiZWwocGFyYW1zKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZWxTZXJpZXNMYWJlbEFyZWE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBib3VuZC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZ3JvdXBJbmRleCBncm91cCBpbmRleFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBpbmRleFxuICAgICAqIEByZXR1cm5zIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IGJvdW5kXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0Qm91bmQ6IGZ1bmN0aW9uKGdyb3VwSW5kZXgsIGluZGV4KSB7XG4gICAgICAgIGlmIChncm91cEluZGV4ID09PSAtMSB8fCBpbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmdyb3VwQm91bmRzW2dyb3VwSW5kZXhdW2luZGV4XS5lbmQ7XG4gICAgfVxufSk7XG5cbkJhclR5cGVTZXJpZXNCYXNlLm1peGluID0gZnVuY3Rpb24oZnVuYykge1xuICAgIHR1aS51dGlsLmV4dGVuZChmdW5jLnByb3RvdHlwZSwgQmFyVHlwZVNlcmllc0Jhc2UucHJvdG90eXBlKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQmFyVHlwZVNlcmllc0Jhc2U7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgQ29sdW1uIGNoYXJ0IHNlcmllcyBjb21wb25lbnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTZXJpZXMgPSByZXF1aXJlKCcuL3NlcmllcycpLFxuICAgIEJhclR5cGVTZXJpZXNCYXNlID0gcmVxdWlyZSgnLi9iYXJUeXBlU2VyaWVzQmFzZScpLFxuICAgIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuLi9jb25zdCcpLFxuICAgIHJlbmRlclV0aWwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3JlbmRlclV0aWwnKTtcblxudmFyIENvbHVtbkNoYXJ0U2VyaWVzID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoU2VyaWVzLCAvKiogQGxlbmRzIENvbHVtbkNoYXJ0U2VyaWVzLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogQ29sdW1uIGNoYXJ0IHNlcmllcyBjb21wb25lbnQuXG4gICAgICogQGNvbnN0cnVjdHMgQ29sdW1uQ2hhcnRTZXJpZXNcbiAgICAgKiBAZXh0ZW5kcyBTZXJpZXNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMubW9kZWwgc2VyaWVzIG1vZGVsXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgc2VyaWVzIG9wdGlvbnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgc2VyaWVzIHRoZW1lXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIFNlcmllcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHN0YXJ0IGVuZCB0b3BzLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBlbmRUb3AgZW5kIHRvcFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBlbmRIZWlnaHQgZW5kIGhlaWdodFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSB2YWx1ZVxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNNaW51cyB3aGV0aGVyIG1pbnVzIG9yIG5vdFxuICAgICAqIEByZXR1cm5zIHt7c3RhcnRUb3A6IG51bWJlciwgZW5kVG9wOiBudW1iZXJ9fSBzdGFydCBlbmQgdG9wc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VTdGFydEVuZFRvcHM6IGZ1bmN0aW9uKGVuZFRvcCwgZW5kSGVpZ2h0LCB2YWx1ZSkge1xuICAgICAgICB2YXIgc3RhcnRUb3A7XG4gICAgICAgIGlmICh2YWx1ZSA8IDApIHtcbiAgICAgICAgICAgIHN0YXJ0VG9wID0gZW5kVG9wO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhcnRUb3AgPSBlbmRUb3A7XG4gICAgICAgICAgICBlbmRUb3AgLT0gZW5kSGVpZ2h0O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN0YXJ0VG9wOiBzdGFydFRvcCxcbiAgICAgICAgICAgIGVuZFRvcDogZW5kVG9wXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYm91bmQgb2YgY29sdW1uIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB3aWR0aDogbnVtYmVyfX0gcGFyYW1zLmJhc2VCb3VuZCBiYXNlIGJvdW5kXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnN0YXJ0VG9wIHN0YXJ0IHRvcFxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5lbmRUb3AgZW5kIHRvcFxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5lbmRIZWlnaHQgZW5kIGhlaWdodFxuICAgICAqIEByZXR1cm5zIHt7XG4gICAgICogICAgICBzdGFydDoge2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfSxcbiAgICAgKiAgICAgIGVuZDoge2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfVxuICAgICAqIH19IGNvbHVtbiBjaGFydCBib3VuZFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VDb2x1bW5DaGFydEJvdW5kOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN0YXJ0OiB0dWkudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgICAgIHRvcDogcGFyYW1zLnN0YXJ0VG9wLFxuICAgICAgICAgICAgICAgIGhlaWdodDogMFxuICAgICAgICAgICAgfSwgcGFyYW1zLmJhc2VCb3VuZCksXG4gICAgICAgICAgICBlbmQ6IHR1aS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgdG9wOiBwYXJhbXMuZW5kVG9wLFxuICAgICAgICAgICAgICAgIGhlaWdodDogcGFyYW1zLmVuZEhlaWdodFxuICAgICAgICAgICAgfSwgcGFyYW1zLmJhc2VCb3VuZClcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBub3JtYWwgY29sdW1uIGNoYXJ0IGJvdW5kLlxuICAgICAqIEBwYXJhbSB7e1xuICAgICAqICAgICAgZGltZW5zaW9uOiB7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9LFxuICAgICAqICAgICAgZ3JvdXBWYWx1ZXM6IGFycmF5LjxhcnJheS48bnVtYmVyPj4sXG4gICAgICogICAgICBncm91cFNpemU6IG51bWJlciwgYmFyUGFkZGluZzogbnVtYmVyLCBiYXJTaXplOiBudW1iZXIsIHN0ZXA6IG51bWJlcixcbiAgICAgKiAgICAgIGRpc3RhbmNlVG9NaW46IG51bWJlciwgaXNNaW51czogYm9vbGVhblxuICAgICAqIH19IGJhc2VJbmZvIGJhc2UgaW5mb1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSB2YWx1ZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBwYWRkaW5nTGVmdCBwYWRkaW5nIGxlZnRcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggaW5kZXhcbiAgICAgKiBAcmV0dXJucyB7e1xuICAgICAqICAgICAgc3RhcnQ6IHtsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn0sXG4gICAgICogICAgICBlbmQ6IHtsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn1cbiAgICAgKiB9fSBjb2x1bW4gY2hhcnQgYm91bmRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlTm9ybWFsQ29sdW1uQ2hhcnRCb3VuZDogZnVuY3Rpb24oYmFzZUluZm8sIHZhbHVlLCBwYWRkaW5nTGVmdCwgaW5kZXgpIHtcbiAgICAgICAgdmFyIGVuZEhlaWdodCwgZW5kVG9wLCBzdGFydEVuZFRvcHMsIGJvdW5kO1xuXG4gICAgICAgIGVuZEhlaWdodCA9IE1hdGguYWJzKHZhbHVlICogYmFzZUluZm8uZGltZW5zaW9uLmhlaWdodCk7XG4gICAgICAgIGVuZFRvcCA9IGJhc2VJbmZvLmlzTWludXMgPyAwIDogYmFzZUluZm8uZGltZW5zaW9uLmhlaWdodCAtIGJhc2VJbmZvLmRpc3RhbmNlVG9NaW47XG4gICAgICAgIHN0YXJ0RW5kVG9wcyA9IHRoaXMuX21ha2VTdGFydEVuZFRvcHMoZW5kVG9wLCBlbmRIZWlnaHQsIHZhbHVlKTtcbiAgICAgICAgYm91bmQgPSB0aGlzLl9tYWtlQ29sdW1uQ2hhcnRCb3VuZCh0dWkudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgYmFzZUJvdW5kOiB7XG4gICAgICAgICAgICAgICAgbGVmdDogcGFkZGluZ0xlZnQgKyAoYmFzZUluZm8uc3RlcCAqIGluZGV4KSArIGNoYXJ0Q29uc3QuU0VSSUVTX0VYUEFORF9TSVpFLFxuICAgICAgICAgICAgICAgIHdpZHRoOiBiYXNlSW5mby5iYXJTaXplXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW5kSGVpZ2h0OiBlbmRIZWlnaHRcbiAgICAgICAgfSwgc3RhcnRFbmRUb3BzKSk7XG4gICAgICAgIHJldHVybiBib3VuZDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBib3VuZHMgb2Ygbm9ybWFsIGNvbHVtbiBjaGFydC5cbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6bnVtYmVyfX0gZGltZW5zaW9uIGNvbHVtbiBjaGFydCBkaW1lbnNpb25cbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gYm91bmRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZU5vcm1hbENvbHVtbkNoYXJ0Qm91bmRzOiBmdW5jdGlvbihkaW1lbnNpb24pIHtcbiAgICAgICAgdmFyIGJhc2VJbmZvID0gdGhpcy5tYWtlQmFzZUluZm9Gb3JOb3JtYWxDaGFydEJvdW5kcyhkaW1lbnNpb24sICdoZWlnaHQnLCAnd2lkdGgnKSxcbiAgICAgICAgICAgIGJvdW5kcztcblxuICAgICAgICBib3VuZHMgPSB0dWkudXRpbC5tYXAoYmFzZUluZm8uZ3JvdXBWYWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcywgZ3JvdXBJbmRleCkge1xuICAgICAgICAgICAgdmFyIHBhZGRpbmdMZWZ0ID0gKGJhc2VJbmZvLmdyb3VwU2l6ZSAqIGdyb3VwSW5kZXgpICsgKGJhc2VJbmZvLmJhclNpemUgLyAyKTtcbiAgICAgICAgICAgIHJldHVybiB0dWkudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbiAodmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21ha2VOb3JtYWxDb2x1bW5DaGFydEJvdW5kKGJhc2VJbmZvLCB2YWx1ZSwgcGFkZGluZ0xlZnQsIGluZGV4KTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICByZXR1cm4gYm91bmRzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGJvdW5kcyBvZiBzdGFja2VkIGNvbHVtbiBjaGFydC5cbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6bnVtYmVyfX0gZGltZW5zaW9uIGNvbHVtbiBjaGFydCBkaW1lbnNpb25cbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gYm91bmRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVN0YWNrZWRDb2x1bW5DaGFydEJvdW5kczogZnVuY3Rpb24oZGltZW5zaW9uKSB7XG4gICAgICAgIHZhciBncm91cFZhbHVlcywgZ3JvdXBXaWR0aCwgYmFyV2lkdGgsIGJvdW5kcztcblxuICAgICAgICBncm91cFZhbHVlcyA9IHRoaXMucGVyY2VudFZhbHVlcztcbiAgICAgICAgZ3JvdXBXaWR0aCA9IChkaW1lbnNpb24ud2lkdGggLyBncm91cFZhbHVlcy5sZW5ndGgpO1xuICAgICAgICBiYXJXaWR0aCA9IGdyb3VwV2lkdGggLyAyO1xuICAgICAgICBib3VuZHMgPSB0dWkudXRpbC5tYXAoZ3JvdXBWYWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcywgZ3JvdXBJbmRleCkge1xuICAgICAgICAgICAgdmFyIHBhZGRpbmdMZWZ0ID0gKGdyb3VwV2lkdGggKiBncm91cEluZGV4KSArIChiYXJXaWR0aCAvIDIpICsgY2hhcnRDb25zdC5TRVJJRVNfRVhQQU5EX1NJWkUsXG4gICAgICAgICAgICAgICAgdG9wID0gMDtcbiAgICAgICAgICAgIHJldHVybiB0dWkudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB2YXIgZW5kSGVpZ2h0LCBiYXNlQm91bmQsIGJvdW5kO1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZW5kSGVpZ2h0ID0gdmFsdWUgKiBkaW1lbnNpb24uaGVpZ2h0O1xuICAgICAgICAgICAgICAgIGJhc2VCb3VuZCA9IHtcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogcGFkZGluZ0xlZnQsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiBiYXJXaWR0aFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYm91bmQgPSB0aGlzLl9tYWtlQ29sdW1uQ2hhcnRCb3VuZCh7XG4gICAgICAgICAgICAgICAgICAgIGJhc2VCb3VuZDogYmFzZUJvdW5kLFxuICAgICAgICAgICAgICAgICAgICBzdGFydFRvcDogZGltZW5zaW9uLmhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgZW5kVG9wOiBkaW1lbnNpb24uaGVpZ2h0IC0gZW5kSGVpZ2h0IC0gdG9wLFxuICAgICAgICAgICAgICAgICAgICBlbmRIZWlnaHQ6IGVuZEhlaWdodFxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgdG9wICs9IGVuZEhlaWdodDtcbiAgICAgICAgICAgICAgICByZXR1cm4gYm91bmQ7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIHJldHVybiBib3VuZHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYm91bmRzIG9mIGNvbHVtbiBjaGFydC5cbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6bnVtYmVyfX0gZGltZW5zaW9uIGNvbHVtbiBjaGFydCBkaW1lbnNpb25cbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gYm91bmRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUJvdW5kczogZnVuY3Rpb24oZGltZW5zaW9uKSB7XG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLnN0YWNrZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9tYWtlTm9ybWFsQ29sdW1uQ2hhcnRCb3VuZHMoZGltZW5zaW9uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9tYWtlU3RhY2tlZENvbHVtbkNoYXJ0Qm91bmRzKGRpbWVuc2lvbik7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBzZXJpZXMgcmVuZGVyaW5nIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHtvYmVqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy52YWx1ZSB2YWx1ZVxuICAgICAqICAgICAgQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlciwgd2lkdGg6bnVtYmVyLCB3aWR0aDpudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gcGFyYW1zLmJvdW5kIGJvdW5kXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLmZvcm1hdHRlZFZhbHVlIGZvcm1hdHRlZCB2YWx1ZVxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5sYWJlbEhlaWdodCBsYWJlbCBoZWlnaHRcbiAgICAgKiBAcmV0dXJucyB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSByZW5kZXJpbmcgcG9zaXRpb25cbiAgICAgKi9cbiAgICBtYWtlU2VyaWVzUmVuZGVyaW5nUG9zaXRpb246IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgbGFiZWxXaWR0aCA9IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbFdpZHRoKHBhcmFtcy5mb3JtYXR0ZWRWYWx1ZSwgdGhpcy50aGVtZS5sYWJlbCksXG4gICAgICAgICAgICBib3VuZCA9IHBhcmFtcy5ib3VuZCxcbiAgICAgICAgICAgIHRvcCA9IGJvdW5kLnRvcCxcbiAgICAgICAgICAgIGxlZnQgPSBib3VuZC5sZWZ0ICsgKGJvdW5kLndpZHRoIC0gbGFiZWxXaWR0aCkgLyAyO1xuXG4gICAgICAgIGlmIChwYXJhbXMudmFsdWUgPj0gMCkge1xuICAgICAgICAgICAgdG9wIC09IHBhcmFtcy5sYWJlbEhlaWdodCArIGNoYXJ0Q29uc3QuU0VSSUVTX0xBQkVMX1BBRERJTkc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0b3AgKz0gYm91bmQuaGVpZ2h0ICsgY2hhcnRDb25zdC5TRVJJRVNfTEFCRUxfUEFERElORztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsZWZ0OiBsZWZ0LFxuICAgICAgICAgICAgdG9wOiB0b3BcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBzdW0gbGFiZWwgaHRtbC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPG51bWJlcj59IHBhcmFtcy52YWx1ZXMgdmFsdWVzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxmdW5jdGlvbj59IHBhcmFtcy5mb3JtYXRGdW5jdGlvbnMgZm9ybWF0dGluZyBmdW5jdGlvbnNcbiAgICAgKiAgICAgIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBwYXJhbXMuYm91bmQgYm91bmRcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubGFiZWxIZWlnaHQgbGFiZWwgaGVpZ2h0XG4gICAgICogQHJldHVybnMge3N0cmluZ30gc3VtIGxhYmVsIGh0bWxcbiAgICAgKi9cbiAgICBtYWtlU3VtTGFiZWxIdG1sOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIHN1bSA9IHRoaXMubWFrZVN1bVZhbHVlcyhwYXJhbXMudmFsdWVzLCBwYXJhbXMuZm9ybWF0RnVuY3Rpb25zKSxcbiAgICAgICAgICAgIGJvdW5kID0gcGFyYW1zLmJvdW5kLFxuICAgICAgICAgICAgbGFiZWxXaWR0aCA9IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbFdpZHRoKHN1bSwgdGhpcy50aGVtZS5sYWJlbCksXG4gICAgICAgICAgICBsZWZ0ID0gYm91bmQubGVmdCArICgoYm91bmQud2lkdGggLSBsYWJlbFdpZHRoICsgY2hhcnRDb25zdC5URVhUX1BBRERJTkcpIC8gMiksXG4gICAgICAgICAgICB0b3AgPSBib3VuZC50b3AgLSBwYXJhbXMubGFiZWxIZWlnaHQgLSBjaGFydENvbnN0LlNFUklFU19MQUJFTF9QQURESU5HO1xuXG4gICAgICAgIHJldHVybiB0aGlzLm1ha2VTZXJpZXNMYWJlbEh0bWwoe1xuICAgICAgICAgICAgbGVmdDogbGVmdCxcbiAgICAgICAgICAgIHRvcDogdG9wXG4gICAgICAgIH0sIHN1bSwgLTEsIC0xKTtcbiAgICB9XG59KTtcblxuQmFyVHlwZVNlcmllc0Jhc2UubWl4aW4oQ29sdW1uQ2hhcnRTZXJpZXMpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbHVtbkNoYXJ0U2VyaWVzO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IExpbmUgY2hhcnQgc2VyaWVzIGNvbXBvbmVudC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFNlcmllcyA9IHJlcXVpcmUoJy4vc2VyaWVzJyksXG4gICAgTGluZVR5cGVTZXJpZXNCYXNlID0gcmVxdWlyZSgnLi9saW5lVHlwZVNlcmllc0Jhc2UnKTtcblxudmFyIExpbmVDaGFydFNlcmllcyA9IHR1aS51dGlsLmRlZmluZUNsYXNzKFNlcmllcywgLyoqIEBsZW5kcyBMaW5lQ2hhcnRTZXJpZXMucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBMaW5lIGNoYXJ0IHNlcmllcyBjb21wb25lbnQuXG4gICAgICogQGNvbnN0cnVjdHMgTGluZUNoYXJ0U2VyaWVzXG4gICAgICogQGV4dGVuZHMgU2VyaWVzXG4gICAgICogQG1peGVzIExpbmVUeXBlU2VyaWVzQmFzZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5tb2RlbCBzZXJpZXMgbW9kZWxcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMub3B0aW9ucyBzZXJpZXMgb3B0aW9uc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBzZXJpZXMgdGhlbWVcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgU2VyaWVzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2Ugc2VyaWVzIGRhdGEuXG4gICAgICogQHJldHVybnMge29iamVjdH0gYWRkIGRhdGFcbiAgICAgKi9cbiAgICBtYWtlU2VyaWVzRGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBncm91cFBvc2l0aW9uczogdGhpcy5tYWtlUG9zaXRpb25zKHRoaXMuYm91bmQuZGltZW5zaW9uKVxuICAgICAgICB9O1xuICAgIH1cbn0pO1xuXG5MaW5lVHlwZVNlcmllc0Jhc2UubWl4aW4oTGluZUNoYXJ0U2VyaWVzKTtcblxubW9kdWxlLmV4cG9ydHMgPSBMaW5lQ2hhcnRTZXJpZXM7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgTGluZVR5cGVTZXJpZXNCYXNlIGlzIGJhc2UgY2xhc3MgZm9yIGxpbmUgdHlwZSBzZXJpZXMuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBjaGFydENvbnN0ID0gcmVxdWlyZSgnLi4vY29uc3QnKSxcbiAgICBkb20gPSByZXF1aXJlKCcuLi9oZWxwZXJzL2RvbUhhbmRsZXInKSxcbiAgICByZW5kZXJVdGlsID0gcmVxdWlyZSgnLi4vaGVscGVycy9yZW5kZXJVdGlsJyk7XG4vKipcbiAqIEBjbGFzc2Rlc2MgTGluZVR5cGVTZXJpZXNCYXNlIGlzIGJhc2UgY2xhc3MgZm9yIGxpbmUgdHlwZSBzZXJpZXMuXG4gKiBAY2xhc3MgTGluZVR5cGVTZXJpZXNCYXNlXG4gKiBAbWl4aW5cbiAqL1xudmFyIExpbmVUeXBlU2VyaWVzQmFzZSA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgTGluZVR5cGVTZXJpZXNCYXNlLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBwb3NpdGlvbnMgb2YgbGluZSBjaGFydC5cbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6bnVuYmVyfX0gZGltZW5zaW9uIGxpbmUgY2hhcnQgZGltZW5zaW9uXG4gICAgICogQHJldHVybnMge2FycmF5LjxhcnJheS48b2JqZWN0Pj59IHBvc2l0aW9uc1xuICAgICAqL1xuICAgIG1ha2VQb3NpdGlvbnM6IGZ1bmN0aW9uKGRpbWVuc2lvbikge1xuICAgICAgICB2YXIgZ3JvdXBWYWx1ZXMgPSB0aGlzLnBlcmNlbnRWYWx1ZXMsXG4gICAgICAgICAgICB3aWR0aCA9IGRpbWVuc2lvbi53aWR0aCxcbiAgICAgICAgICAgIGhlaWdodCA9IGRpbWVuc2lvbi5oZWlnaHQsXG4gICAgICAgICAgICBsZW4gPSBncm91cFZhbHVlc1swXS5sZW5ndGgsXG4gICAgICAgICAgICBzdGVwLCBzdGFydCwgcmVzdWx0O1xuICAgICAgICBpZiAodGhpcy5hbGlnbmVkKSB7XG4gICAgICAgICAgICBzdGVwID0gd2lkdGggLyAobGVuIC0gMSk7XG4gICAgICAgICAgICBzdGFydCA9IDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdGVwID0gd2lkdGggLyBsZW47XG4gICAgICAgICAgICBzdGFydCA9IHN0ZXAgLyAyO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVzdWx0ID0gdHVpLnV0aWwubWFwKGdyb3VwVmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgICAgIHJldHVybiB0dWkudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBsZWZ0OiBzdGFydCArIChzdGVwICogaW5kZXgpICsgY2hhcnRDb25zdC5TRVJJRVNfRVhQQU5EX1NJWkUsXG4gICAgICAgICAgICAgICAgICAgIHRvcDogaGVpZ2h0IC0gKHZhbHVlICogaGVpZ2h0KVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZ3JvdXBQb3NpdGlvbnMgPSByZXN1bHQ7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBzZXJpZXMgbGFiZWwuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge0hUTUxFbGVtZW50fSBwYXJhbXMuY29udGFpbmVyIGNvbnRhaW5lclxuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48YXJyYXk+fSBwYXJhbXMuZ3JvdXBQb3NpdGlvbnMgZ3JvdXAgcG9zaXRpb25zXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IHBhcmFtcy5mb3JtYXR0ZWRWYWx1ZXMgZm9ybWF0dGVkIHZhbHVlc1xuICAgICAqIEByZXR1cm4ge0hUTUxFbGVtZW50fSBzZXJpZXMgYXJlYSBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyU2VyaWVzTGFiZWw6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgZ3JvdXBQb3NpdGlvbnMsIGxhYmVsSGVpZ2h0LCBlbFNlcmllc0xhYmVsQXJlYSwgaHRtbDtcblxuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5zaG93TGFiZWwpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGdyb3VwUG9zaXRpb25zID0gcGFyYW1zLmdyb3VwUG9zaXRpb25zO1xuICAgICAgICBsYWJlbEhlaWdodCA9IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodChwYXJhbXMuZm9ybWF0dGVkVmFsdWVzWzBdWzBdLCB0aGlzLnRoZW1lLmxhYmVsKTtcbiAgICAgICAgZWxTZXJpZXNMYWJlbEFyZWEgPSBkb20uY3JlYXRlKCdkaXYnLCAndHVpLWNoYXJ0LXNlcmllcy1sYWJlbC1hcmVhJyk7XG5cbiAgICAgICAgaHRtbCA9IHR1aS51dGlsLm1hcChwYXJhbXMuZm9ybWF0dGVkVmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMsIGdyb3VwSW5kZXgpIHtcbiAgICAgICAgICAgIHJldHVybiB0dWkudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgcG9zaXRpb24gPSBncm91cFBvc2l0aW9uc1tncm91cEluZGV4XVtpbmRleF0sXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsV2lkdGggPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxXaWR0aCh2YWx1ZSwgdGhpcy50aGVtZS5sYWJlbCksXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsSHRtbCA9IHRoaXMubWFrZVNlcmllc0xhYmVsSHRtbCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiBwb3NpdGlvbi5sZWZ0IC0gKGxhYmVsV2lkdGggLyAyKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogcG9zaXRpb24udG9wIC0gbGFiZWxIZWlnaHQgLSBjaGFydENvbnN0LlNFUklFU19MQUJFTF9QQURESU5HXG4gICAgICAgICAgICAgICAgICAgIH0sIHZhbHVlLCBpbmRleCwgZ3JvdXBJbmRleCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxhYmVsSHRtbDtcbiAgICAgICAgICAgIH0sIHRoaXMpLmpvaW4oJycpO1xuICAgICAgICB9LCB0aGlzKS5qb2luKCcnKTtcblxuICAgICAgICBlbFNlcmllc0xhYmVsQXJlYS5pbm5lckhUTUwgPSBodG1sO1xuICAgICAgICBwYXJhbXMuY29udGFpbmVyLmFwcGVuZENoaWxkKGVsU2VyaWVzTGFiZWxBcmVhKTtcblxuICAgICAgICByZXR1cm4gZWxTZXJpZXNMYWJlbEFyZWE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBib3VuZC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZ3JvdXBJbmRleCBncm91cCBpbmRleFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBpbmRleFxuICAgICAqIEByZXR1cm5zIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IGJvdW5kXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0Qm91bmQ6IGZ1bmN0aW9uKGdyb3VwSW5kZXgsIGluZGV4KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdyb3VwUG9zaXRpb25zW2luZGV4XVtncm91cEluZGV4XTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmluZCBpbmRleC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZ3JvdXBJbmRleCBncm91cCBpbmRleFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBsYXllclkgbW91c2UgcG9zaXRpb25cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBpbmRleFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2ZpbmRJbmRleDogZnVuY3Rpb24oZ3JvdXBJbmRleCwgbGF5ZXJZKSB7XG4gICAgICAgIHZhciBmb3VuZEluZGV4ID0gLTEsXG4gICAgICAgICAgICBkaWZmID0gMTAwMDtcblxuICAgICAgICBpZiAoIXRoaXMudGlja0l0ZW1zKSB7XG4gICAgICAgICAgICB0aGlzLnRpY2tJdGVtcyA9IHR1aS51dGlsLnBpdm90KHRoaXMuZ3JvdXBQb3NpdGlvbnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaCh0aGlzLnRpY2tJdGVtc1tncm91cEluZGV4XSwgZnVuY3Rpb24ocG9zaXRpb24sIGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgY29tcGFyZSA9IE1hdGguYWJzKGxheWVyWSAtIHBvc2l0aW9uLnRvcCk7XG4gICAgICAgICAgICBpZiAoZGlmZiA+IGNvbXBhcmUpIHtcbiAgICAgICAgICAgICAgICBkaWZmID0gY29tcGFyZTtcbiAgICAgICAgICAgICAgICBmb3VuZEluZGV4ID0gaW5kZXg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZm91bmRJbmRleDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciBjaGFuZ2VkIG9yIG5vdC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZ3JvdXBJbmRleCBncm91cCBpbmRleFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBpbmRleFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSB3aGV0aGVyIGNoYW5nZWQgb3Igbm90XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNDaGFuZ2VkOiBmdW5jdGlvbihncm91cEluZGV4LCBpbmRleCkge1xuICAgICAgICB2YXIgcHJldkluZGV4ZXMgPSB0aGlzLnByZXZJbmRleGVzO1xuXG4gICAgICAgIHRoaXMucHJldkluZGV4ZXMgPSB7XG4gICAgICAgICAgICBncm91cEluZGV4OiBncm91cEluZGV4LFxuICAgICAgICAgICAgaW5kZXg6IGluZGV4XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuICFwcmV2SW5kZXhlcyB8fCAocHJldkluZGV4ZXMuZ3JvdXBJbmRleCAhPT0gZ3JvdXBJbmRleCkgfHwgKHByZXZJbmRleGVzLmluZGV4ICE9PSBpbmRleCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE9uIG92ZXIgdGljayBzZWN0b3IuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGdyb3VwSW5kZXggZ3JvdXBJbmRleFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBsYXllclkgbGF5ZXJZXG4gICAgICovXG4gICAgb25MaW5lVHlwZU92ZXJUaWNrU2VjdG9yOiBmdW5jdGlvbihncm91cEluZGV4LCBsYXllclkpIHtcbiAgICAgICAgdmFyIGluZGV4LCBwcmV2SW5kZXhlcztcblxuICAgICAgICBpbmRleCA9IHRoaXMuX2ZpbmRJbmRleChncm91cEluZGV4LCBsYXllclkpO1xuICAgICAgICBwcmV2SW5kZXhlcyA9IHRoaXMucHJldkluZGV4ZXM7XG5cbiAgICAgICAgaWYgKCF0aGlzLl9pc0NoYW5nZWQoZ3JvdXBJbmRleCwgaW5kZXgpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJldkluZGV4ZXMpIHtcbiAgICAgICAgICAgIHRoaXMub3V0Q2FsbGJhY2soKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuaW5DYWxsYmFjayh0aGlzLl9nZXRCb3VuZChncm91cEluZGV4LCBpbmRleCksIGdyb3VwSW5kZXgsIGluZGV4KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogT24gb3V0IHRpY2sgc2VjdG9yLlxuICAgICAqL1xuICAgIG9uTGluZVR5cGVPdXRUaWNrU2VjdG9yOiBmdW5jdGlvbigpIHtcbiAgICAgICAgZGVsZXRlIHRoaXMucHJldkluZGV4ZXM7XG4gICAgICAgIHRoaXMub3V0Q2FsbGJhY2soKTtcbiAgICB9XG59KTtcblxuTGluZVR5cGVTZXJpZXNCYXNlLm1peGluID0gZnVuY3Rpb24oZnVuYykge1xuICAgIHR1aS51dGlsLmV4dGVuZChmdW5jLnByb3RvdHlwZSwgTGluZVR5cGVTZXJpZXNCYXNlLnByb3RvdHlwZSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IExpbmVUeXBlU2VyaWVzQmFzZTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBQaWUgY2hhcnQgc2VyaWVzIGNvbXBvbmVudC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFNlcmllcyA9IHJlcXVpcmUoJy4vc2VyaWVzJyksXG4gICAgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4uL2NvbnN0JyksXG4gICAgZG9tID0gcmVxdWlyZSgnLi4vaGVscGVycy9kb21IYW5kbGVyJyksXG4gICAgcmVuZGVyVXRpbCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvcmVuZGVyVXRpbCcpO1xuXG52YXIgUGllQ2hhcnRTZXJpZXMgPSB0dWkudXRpbC5kZWZpbmVDbGFzcyhTZXJpZXMsIC8qKiBAbGVuZHMgUGllQ2hhcnRTZXJpZXMucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBMaW5lIGNoYXJ0IHNlcmllcyBjb21wb25lbnQuXG4gICAgICogQGNvbnN0cnVjdHMgUGllQ2hhcnRTZXJpZXNcbiAgICAgKiBAZXh0ZW5kcyBTZXJpZXNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMubW9kZWwgc2VyaWVzIG1vZGVsXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgc2VyaWVzIG9wdGlvbnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgc2VyaWVzIHRoZW1lXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIFNlcmllcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHBlcmNlbnQgdmFsdWUuXG4gICAgICogQHBhcmFtIHt7dmFsdWVzOiBhcnJheSwgc2NhbGU6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fX0gZGF0YSBzZXJpZXMgZGF0YVxuICAgICAqIEByZXR1cm5zIHthcnJheS48YXJyYXkuPG51bWJlcj4+fSBwZXJjZW50IHZhbHVlc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VQZXJjZW50VmFsdWVzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSB0dWkudXRpbC5tYXAoZGF0YS52YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICAgICAgdmFyIHN1bSA9IHR1aS51dGlsLnN1bSh2YWx1ZXMpO1xuICAgICAgICAgICAgcmV0dXJuIHR1aS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlIC8gc3VtO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHNlY3RvcnMgaW5mb3JtYXRpb24uXG4gICAgICogQHBhcmFtIHthcnJheS48bnVtYmVyPn0gcGVyY2VudFZhbHVlcyBwZXJjZW50IHZhbHVlc1xuICAgICAqIEBwYXJhbSB7e2N4OiBudW1iZXIsIGN5OiBudW1iZXIsIHI6IG51bWJlcn19IGNpcmNsZUJvdW5kIGNpcmNsZSBib3VuZFxuICAgICAqIEByZXR1cm5zIHthcnJheS48b2JqZWN0Pn0gc2VjdG9ycyBpbmZvcm1hdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VTZWN0b3JzSW5mbzogZnVuY3Rpb24ocGVyY2VudFZhbHVlcywgY2lyY2xlQm91bmQpIHtcbiAgICAgICAgdmFyIGN4ID0gY2lyY2xlQm91bmQuY3gsXG4gICAgICAgICAgICBjeSA9IGNpcmNsZUJvdW5kLmN5LFxuICAgICAgICAgICAgciA9IGNpcmNsZUJvdW5kLnIsXG4gICAgICAgICAgICBhbmdsZSA9IDAsXG4gICAgICAgICAgICBkZWx0YSA9IDEwLFxuICAgICAgICAgICAgcGF0aHM7XG5cbiAgICAgICAgcGF0aHMgPSB0dWkudXRpbC5tYXAocGVyY2VudFZhbHVlcywgZnVuY3Rpb24ocGVyY2VudFZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgYWRkQW5nbGUgPSBjaGFydENvbnN0LkFOR0xFXzM2MCAqIHBlcmNlbnRWYWx1ZSxcbiAgICAgICAgICAgICAgICBlbmRBbmdsZSA9IGFuZ2xlICsgYWRkQW5nbGUsXG4gICAgICAgICAgICAgICAgcG9wdXBBbmdsZSA9IGFuZ2xlICsgKGFkZEFuZ2xlIC8gMiksXG4gICAgICAgICAgICAgICAgYW5nbGVzID0ge1xuICAgICAgICAgICAgICAgICAgICBzdGFydDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRBbmdsZTogYW5nbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmRBbmdsZTogYW5nbGVcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZW5kOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydEFuZ2xlOiBhbmdsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZEFuZ2xlOiBlbmRBbmdsZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwb3NpdGlvbkRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIGN4OiBjeCxcbiAgICAgICAgICAgICAgICAgICAgY3k6IGN5LFxuICAgICAgICAgICAgICAgICAgICBhbmdsZTogcG9wdXBBbmdsZVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICBhbmdsZSA9IGVuZEFuZ2xlO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBwZXJjZW50VmFsdWU6IHBlcmNlbnRWYWx1ZSxcbiAgICAgICAgICAgICAgICBhbmdsZXM6IGFuZ2xlcyxcbiAgICAgICAgICAgICAgICBwb3B1cFBvc2l0aW9uOiB0aGlzLl9nZXRBcmNQb3NpdGlvbih0dWkudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgICAgICAgICByOiByICsgZGVsdGFcbiAgICAgICAgICAgICAgICB9LCBwb3NpdGlvbkRhdGEpKSxcbiAgICAgICAgICAgICAgICBjZW50ZXJQb3NpdGlvbjogdGhpcy5fZ2V0QXJjUG9zaXRpb24odHVpLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICAgICAgcjogKHIgLyAyKSArIGRlbHRhXG4gICAgICAgICAgICAgICAgfSwgcG9zaXRpb25EYXRhKSksXG4gICAgICAgICAgICAgICAgb3V0ZXJQb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICBzdGFydDogdGhpcy5fZ2V0QXJjUG9zaXRpb24odHVpLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHI6IHJcbiAgICAgICAgICAgICAgICAgICAgfSwgcG9zaXRpb25EYXRhKSksXG4gICAgICAgICAgICAgICAgICAgIG1pZGRsZTogdGhpcy5fZ2V0QXJjUG9zaXRpb24odHVpLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHI6IHIgKyBkZWx0YVxuICAgICAgICAgICAgICAgICAgICB9LCBwb3NpdGlvbkRhdGEpKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIHJldHVybiBwYXRocztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBzZXJpZXMgZGF0YS5cbiAgICAgKiBAcmV0dXJucyB7e1xuICAgICAqICAgICAgZm9ybWF0dGVkVmFsdWVzOiBhcnJheSxcbiAgICAgKiAgICAgIGNoYXJ0QmFja2dyb3VuZDogc3RyaW5nLFxuICAgICAqICAgICAgY2lyY2xlQm91bmQ6ICh7Y3g6IG51bWJlciwgY3k6IG51bWJlciwgcjogbnVtYmVyfSksXG4gICAgICogICAgICBzZWN0b3JzSW5mbzogYXJyYXkuPG9iamVjdD5cbiAgICAgKiB9fSBhZGQgZGF0YSBmb3IgZ3JhcGggcmVuZGVyaW5nXG4gICAgICovXG4gICAgbWFrZVNlcmllc0RhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY2lyY2xlQm91bmQgPSB0aGlzLl9tYWtlQ2lyY2xlQm91bmQodGhpcy5ib3VuZC5kaW1lbnNpb24sIHtcbiAgICAgICAgICAgICAgICBzaG93TGFiZWw6IHRoaXMub3B0aW9ucy5zaG93TGFiZWwsXG4gICAgICAgICAgICAgICAgbGVnZW5kVHlwZTogdGhpcy5vcHRpb25zLmxlZ2VuZFR5cGVcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgc2VjdG9yc0luZm8gPSB0aGlzLl9tYWtlU2VjdG9yc0luZm8odGhpcy5wZXJjZW50VmFsdWVzWzBdLCBjaXJjbGVCb3VuZCk7XG5cbiAgICAgICAgdGhpcy5wb3B1cFBvc2l0aW9ucyA9IHR1aS51dGlsLnBsdWNrKHNlY3RvcnNJbmZvLCAncG9wdXBQb3NpdGlvbicpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY2hhcnRCYWNrZ3JvdW5kOiB0aGlzLmNoYXJ0QmFja2dyb3VuZCxcbiAgICAgICAgICAgIGNpcmNsZUJvdW5kOiBjaXJjbGVCb3VuZCxcbiAgICAgICAgICAgIHNlY3RvcnNJbmZvOiBzZWN0b3JzSW5mb1xuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGNpcmNsZSBib3VuZFxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDpudW1iZXJ9fSBkaW1lbnNpb24gY2hhcnQgZGltZW5zaW9uXG4gICAgICogQHBhcmFtIHt7c2hvd0xhYmVsOiBib29sZWFuLCBsZWdlbmRUeXBlOiBzdHJpbmd9fSBvcHRpb25zIG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7e2N4OiBudW1iZXIsIGN5OiBudW1iZXIsIHI6IG51bWJlcn19IGNpcmNsZSBib3VuZHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQ2lyY2xlQm91bmQ6IGZ1bmN0aW9uKGRpbWVuc2lvbiwgb3B0aW9ucykge1xuICAgICAgICB2YXIgd2lkdGggPSBkaW1lbnNpb24ud2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQgPSBkaW1lbnNpb24uaGVpZ2h0LFxuICAgICAgICAgICAgaXNTbWFsbFBpZSA9IG9wdGlvbnMubGVnZW5kVHlwZSA9PT0gY2hhcnRDb25zdC5TRVJJRVNfTEVHRU5EX1RZUEVfT1VURVIgJiYgb3B0aW9ucy5zaG93TGFiZWwsXG4gICAgICAgICAgICByYWRpdXNSYXRlID0gaXNTbWFsbFBpZSA/IGNoYXJ0Q29uc3QuUElFX0dSQVBIX1NNQUxMX1JBVEUgOiBjaGFydENvbnN0LlBJRV9HUkFQSF9ERUZBVUxUX1JBVEUsXG4gICAgICAgICAgICBkaWFtZXRlciA9IHR1aS51dGlsLm11bHRpcGxpY2F0aW9uKHR1aS51dGlsLm1pbihbd2lkdGgsIGhlaWdodF0pLCByYWRpdXNSYXRlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGN4OiB0dWkudXRpbC5kaXZpc2lvbih3aWR0aCwgMiksXG4gICAgICAgICAgICBjeTogdHVpLnV0aWwuZGl2aXNpb24oaGVpZ2h0LCAyKSxcbiAgICAgICAgICAgIHI6IHR1aS51dGlsLmRpdmlzaW9uKGRpYW1ldGVyLCAyKVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgYXJjIHBvc2l0aW9uLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5jeCBjZW50ZXIgeFxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5jeSBjZW50ZXIgeVxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5yIHJhZGl1c1xuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5hbmdsZSBhbmdsZShkZWdyZWUpXG4gICAgICogQHJldHVybnMge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gYXJjIHBvc2l0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0QXJjUG9zaXRpb246IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbGVmdDogcGFyYW1zLmN4ICsgKHBhcmFtcy5yICogTWF0aC5zaW4ocGFyYW1zLmFuZ2xlICogY2hhcnRDb25zdC5SQUQpKSxcbiAgICAgICAgICAgIHRvcDogcGFyYW1zLmN5IC0gKHBhcmFtcy5yICogTWF0aC5jb3MocGFyYW1zLmFuZ2xlICogY2hhcnRDb25zdC5SQUQpKVxuICAgICAgICB9O1xuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYWRkIGRhdGEgZm9yIHNlcmllcyBsYWJlbC5cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY29udGFpbmVyXG4gICAgICogQHJldHVybnMge3tcbiAgICAgKiAgICAgIGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsXG4gICAgICogICAgICBsZWdlbmRMYWJlbHM6IGFycmF5LjxzdHJpbmc+LFxuICAgICAqICAgICAgb3B0aW9uczoge2xlZ2VuZFR5cGU6IHN0cmluZywgc2hvd0xhYmVsOiBib29sZWFufSxcbiAgICAgKiAgICAgIGNoYXJ0V2lkdGg6IG51bWJlcixcbiAgICAgKiAgICAgIGZvcm1hdHRlZFZhbHVlczogYXJyYXlcbiAgICAgKiB9fSBhZGQgZGF0YSBmb3IgbWFrZSBzZXJpZXMgbGFiZWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlU2VyaWVzRGF0YUZvclNlcmllc0xhYmVsOiBmdW5jdGlvbihjb250YWluZXIpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNvbnRhaW5lcjogY29udGFpbmVyLFxuICAgICAgICAgICAgbGVnZW5kTGFiZWxzOiB0aGlzLmRhdGEubGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICAgIGxlZ2VuZFR5cGU6IHRoaXMub3B0aW9ucy5sZWdlbmRUeXBlLFxuICAgICAgICAgICAgICAgIHNob3dMYWJlbDogdGhpcy5vcHRpb25zLnNob3dMYWJlbFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNoYXJ0V2lkdGg6IHRoaXMuZGF0YS5jaGFydFdpZHRoLFxuICAgICAgICAgICAgZm9ybWF0dGVkVmFsdWVzOiB0aGlzLmRhdGEuZm9ybWF0dGVkVmFsdWVzWzBdXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBzZXJpZXMgbGFiZWwuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLmxlZ2VuZCBsZWdlbmRcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMubGFiZWwgbGFiZWxcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMuc2VwYXJhdG9yIHNlcGFyYXRvclxuICAgICAqICAgICAgQHBhcmFtIHt7bGVnZW5kVHlwZTogYm9vbGVhbiwgc2hvd0xhYmVsOiBib29sZWFufX0gcGFyYW1zLm9wdGlvbnMgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IHNlcmllcyBsYWJlbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFNlcmllc0xhYmVsOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIHNlcmllc0xhYmVsID0gJyc7XG4gICAgICAgIGlmIChwYXJhbXMub3B0aW9ucy5sZWdlbmRUeXBlKSB7XG4gICAgICAgICAgICBzZXJpZXNMYWJlbCA9IHBhcmFtcy5sZWdlbmQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGFyYW1zLm9wdGlvbnMuc2hvd0xhYmVsKSB7XG4gICAgICAgICAgICBzZXJpZXNMYWJlbCArPSAoc2VyaWVzTGFiZWwgPyBwYXJhbXMuc2VwYXJhdG9yIDogJycpICsgcGFyYW1zLmxhYmVsO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNlcmllc0xhYmVsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgY2VudGVyIGxlZ2VuZC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciBjb250YWluZXJcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGxlZ2VuZHMgbGVnZW5kc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48b2JqZWN0Pn0gY2VudGVyUG9zaXRpb25zIGNlbnRlciBwb3NpdGlvbnNcbiAgICAgKiBAcmV0dXJuIHtIVE1MRWxlbWVudH0gc2VyaWVzIGFyZWEgZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlckxlZ2VuZExhYmVsOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIHBvc2l0aW9ucyA9IHBhcmFtcy5wb3NpdGlvbnMsXG4gICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXMgPSBwYXJhbXMuZm9ybWF0dGVkVmFsdWVzLFxuICAgICAgICAgICAgZWxTZXJpZXNMYWJlbEFyZWEgPSBkb20uY3JlYXRlKCdkaXYnLCAndHVpLWNoYXJ0LXNlcmllcy1sYWJlbC1hcmVhJyksXG4gICAgICAgICAgICBodG1sO1xuXG4gICAgICAgIGh0bWwgPSB0dWkudXRpbC5tYXAocGFyYW1zLmxlZ2VuZExhYmVscywgZnVuY3Rpb24obGVnZW5kLCBpbmRleCkge1xuICAgICAgICAgICAgdmFyIGxhYmVsID0gdGhpcy5fZ2V0U2VyaWVzTGFiZWwoe1xuICAgICAgICAgICAgICAgICAgICBsZWdlbmQ6IGxlZ2VuZCxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGZvcm1hdHRlZFZhbHVlc1tpbmRleF0sXG4gICAgICAgICAgICAgICAgICAgIHNlcGFyYXRvcjogcGFyYW1zLnNlcGFyYXRvcixcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogcGFyYW1zLm9wdGlvbnNcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBwb3NpdGlvbiA9IHBhcmFtcy5tb3ZlVG9Qb3NpdGlvbihwb3NpdGlvbnNbaW5kZXhdLCBsYWJlbCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tYWtlU2VyaWVzTGFiZWxIdG1sKHBvc2l0aW9uLCBsYWJlbCwgMCwgaW5kZXgpO1xuICAgICAgICB9LCB0aGlzKS5qb2luKCcnKTtcblxuICAgICAgICBlbFNlcmllc0xhYmVsQXJlYS5pbm5lckhUTUwgPSBodG1sO1xuICAgICAgICBwYXJhbXMuY29udGFpbmVyLmFwcGVuZENoaWxkKGVsU2VyaWVzTGFiZWxBcmVhKTtcblxuICAgICAgICByZXR1cm4gZWxTZXJpZXNMYWJlbEFyZWE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1vdmUgdG8gY2VudGVyIHBvc2l0aW9uLlxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBwb3NpdGlvbiBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBsYWJlbCBsYWJlbFxuICAgICAqIEByZXR1cm5zIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IGNlbnRlciBwb3NpdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21vdmVUb0NlbnRlclBvc2l0aW9uOiBmdW5jdGlvbihwb3NpdGlvbiwgbGFiZWwpIHtcbiAgICAgICAgdmFyIGxlZnQgPSBwb3NpdGlvbi5sZWZ0IC0gKHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbFdpZHRoKGxhYmVsLCB0aGlzLnRoZW1lLmxhYmVsKSAvIDIpLFxuICAgICAgICAgICAgdG9wID0gcG9zaXRpb24udG9wIC0gKHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodChsYWJlbCwgdGhpcy50aGVtZS5sYWJlbCkgLyAyKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxlZnQ6IGxlZnQsXG4gICAgICAgICAgICB0b3A6IHRvcFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgY2VudGVyIGxlZ2VuZC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciBjb250YWluZXJcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGxlZ2VuZHMgbGVnZW5kc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48b2JqZWN0Pn0gY2VudGVyUG9zaXRpb25zIGNlbnRlciBwb3NpdGlvbnNcbiAgICAgKiBAcmV0dXJuIHtIVE1MRWxlbWVudH0gYXJlYSBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyQ2VudGVyTGVnZW5kOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGVsQXJlYSA9IHRoaXMuX3JlbmRlckxlZ2VuZExhYmVsKHR1aS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICBwb3NpdGlvbnM6IHR1aS51dGlsLnBsdWNrKHBhcmFtcy5zZWN0b3JzSW5mbywgJ2NlbnRlclBvc2l0aW9uJyksXG4gICAgICAgICAgICBtb3ZlVG9Qb3NpdGlvbjogdHVpLnV0aWwuYmluZCh0aGlzLl9tb3ZlVG9DZW50ZXJQb3NpdGlvbiwgdGhpcyksXG4gICAgICAgICAgICBzZXBhcmF0b3I6ICc8YnI+J1xuICAgICAgICB9LCBwYXJhbXMpKTtcblxuICAgICAgICByZXR1cm4gZWxBcmVhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgZW5kIHBvc2l0aW9uLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjZW50ZXJMZWZ0IGNlbnRlciBsZWZ0XG4gICAgICogQHBhcmFtIHthcnJheS48b2JqZWN0Pn0gcG9zaXRpb25zIHBvc2l0aW9uc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2FkZEVuZFBvc2l0aW9uOiBmdW5jdGlvbihjZW50ZXJMZWZ0LCBwb3NpdGlvbnMpIHtcbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaChwb3NpdGlvbnMsIGZ1bmN0aW9uKHBvc2l0aW9uKSB7XG4gICAgICAgICAgICB2YXIgZW5kID0gdHVpLnV0aWwuZXh0ZW5kKHt9LCBwb3NpdGlvbi5taWRkbGUpO1xuICAgICAgICAgICAgaWYgKGVuZC5sZWZ0IDwgY2VudGVyTGVmdCkge1xuICAgICAgICAgICAgICAgIGVuZC5sZWZ0IC09IGNoYXJ0Q29uc3QuU0VSSUVTX09VVEVSX0xBQkVMX1BBRERJTkc7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGVuZC5sZWZ0ICs9IGNoYXJ0Q29uc3QuU0VSSUVTX09VVEVSX0xBQkVMX1BBRERJTkc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwb3NpdGlvbi5lbmQgPSBlbmQ7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBNb3ZlIHRvIG91dGVyIHBvc2l0aW9uLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjZW50ZXJMZWZ0IGNlbnRlciBsZWZ0XG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBvc2l0aW9uIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGxhYmVsIGxhYmVsXG4gICAgICogQHJldHVybnMge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gb3V0ZXIgcG9zaXRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tb3ZlVG9PdXRlclBvc2l0aW9uOiBmdW5jdGlvbihjZW50ZXJMZWZ0LCBwb3NpdGlvbiwgbGFiZWwpIHtcbiAgICAgICAgdmFyIHBvc2l0aW9uRW5kID0gcG9zaXRpb24uZW5kLFxuICAgICAgICAgICAgbGVmdCA9IHBvc2l0aW9uRW5kLmxlZnQsXG4gICAgICAgICAgICB0b3AgPSBwb3NpdGlvbkVuZC50b3AgLSAocmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsSGVpZ2h0KGxhYmVsLCB0aGlzLnRoZW1lLmxhYmVsKSAvIDIpO1xuXG4gICAgICAgIGlmIChsZWZ0IDwgY2VudGVyTGVmdCkge1xuICAgICAgICAgICAgbGVmdCAtPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxXaWR0aChsYWJlbCwgdGhpcy50aGVtZS5sYWJlbCkgKyBjaGFydENvbnN0LlNFUklFU19MQUJFTF9QQURESU5HO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGVmdCArPSBjaGFydENvbnN0LlNFUklFU19MQUJFTF9QQURESU5HO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxlZnQ6IGxlZnQsXG4gICAgICAgICAgICB0b3A6IHRvcFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgb3V0ZXIgbGVnZW5kLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNvbnRhaW5lclxuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48c3RyaW5nPn0gbGVnZW5kcyBsZWdlbmRzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxvYmplY3Q+fSBjZW50ZXJQb3NpdGlvbnMgY2VudGVyIHBvc2l0aW9uc1xuICAgICAqIEByZXR1cm4ge0hUTUxFbGVtZW50fSBhcmVhIGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJPdXRlckxlZ2VuZDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBvdXRlclBvc2l0aW9ucyA9IHR1aS51dGlsLnBsdWNrKHBhcmFtcy5zZWN0b3JzSW5mbywgJ291dGVyUG9zaXRpb24nKSxcbiAgICAgICAgICAgIGNlbnRlckxlZnQgPSBwYXJhbXMuY2hhcnRXaWR0aCAvIDIsXG4gICAgICAgICAgICBlbEFyZWE7XG5cbiAgICAgICAgdGhpcy5fYWRkRW5kUG9zaXRpb24oY2VudGVyTGVmdCwgb3V0ZXJQb3NpdGlvbnMpO1xuICAgICAgICBlbEFyZWEgPSB0aGlzLl9yZW5kZXJMZWdlbmRMYWJlbCh0dWkudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgcG9zaXRpb25zOiBvdXRlclBvc2l0aW9ucyxcbiAgICAgICAgICAgIG1vdmVUb1Bvc2l0aW9uOiB0dWkudXRpbC5iaW5kKHRoaXMuX21vdmVUb091dGVyUG9zaXRpb24sIHRoaXMsIGNlbnRlckxlZnQpLFxuICAgICAgICAgICAgc2VwYXJhdG9yOiAnOiZuYnNwOydcbiAgICAgICAgfSwgcGFyYW1zKSk7XG5cbiAgICAgICAgaWYgKHRoaXMucGFwZXIpIHtcbiAgICAgICAgICAgIHRoaXMuZ3JhcGhSZW5kZXJlci5yZW5kZXJMZWdlbmRMaW5lcyh0aGlzLnBhcGVyLCBvdXRlclBvc2l0aW9ucyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZWxBcmVhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgc2VyaWVzIGxhYmVsLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gYXJlYSBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyU2VyaWVzTGFiZWw6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgZWxBcmVhO1xuICAgICAgICBpZiAocGFyYW1zLm9wdGlvbnMubGVnZW5kVHlwZSA9PT0gY2hhcnRDb25zdC5TRVJJRVNfTEVHRU5EX1RZUEVfT1VURVIpIHtcbiAgICAgICAgICAgIGVsQXJlYSA9IHRoaXMuX3JlbmRlck91dGVyTGVnZW5kKHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbEFyZWEgPSB0aGlzLl9yZW5kZXJDZW50ZXJMZWdlbmQocGFyYW1zKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZWxBcmVhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgYm91bmQuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGdyb3VwSW5kZXggZ3JvdXAgaW5kZXhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggaW5kZXhcbiAgICAgKiBAcmV0dXJucyB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBib3VuZFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldEJvdW5kOiBmdW5jdGlvbihncm91cEluZGV4LCBpbmRleCkge1xuICAgICAgICBpZiAoZ3JvdXBJbmRleCA9PT0gLTEgfHwgaW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5wb3B1cFBvc2l0aW9uc1tpbmRleF07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNob3cgc2VyaWVzIGxhYmVsIGFyZWEuXG4gICAgICovXG4gICAgc2hvd1Nlcmllc0xhYmVsQXJlYTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZ3JhcGhSZW5kZXJlci5hbmltYXRlTGVnZW5kTGluZXMoKTtcbiAgICAgICAgU2VyaWVzLnByb3RvdHlwZS5zaG93U2VyaWVzTGFiZWxBcmVhLmNhbGwodGhpcyk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUGllQ2hhcnRTZXJpZXM7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgU2VyaWVzIGJhc2UgY29tcG9uZW50LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgc2VyaWVzVGVtcGxhdGUgPSByZXF1aXJlKCcuL3Nlcmllc1RlbXBsYXRlJyksXG4gICAgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4uL2NvbnN0JyksXG4gICAgc3RhdGUgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3N0YXRlJyksXG4gICAgZG9tID0gcmVxdWlyZSgnLi4vaGVscGVycy9kb21IYW5kbGVyJyksXG4gICAgcmVuZGVyVXRpbCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvcmVuZGVyVXRpbCcpLFxuICAgIGV2ZW50ID0gcmVxdWlyZSgnLi4vaGVscGVycy9ldmVudExpc3RlbmVyJyksXG4gICAgcGx1Z2luRmFjdG9yeSA9IHJlcXVpcmUoJy4uL2ZhY3Rvcmllcy9wbHVnaW5GYWN0b3J5Jyk7XG5cbnZhciBTRVJJRVNfTEFCRUxfQ0xBU1NfTkFNRSA9ICd0dWktY2hhcnQtc2VyaWVzLWxhYmVsJztcblxudmFyIFNlcmllcyA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgU2VyaWVzLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogU2VyaWVzIGJhc2UgY29tcG9uZW50LlxuICAgICAqIEBjb25zdHJ1Y3RzIFNlcmllc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5tb2RlbCBzZXJpZXMgbW9kZWxcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMub3B0aW9ucyBzZXJpZXMgb3B0aW9uc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBzZXJpZXMgdGhlbWVcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGxpYlR5cGU7XG5cbiAgICAgICAgdHVpLnV0aWwuZXh0ZW5kKHRoaXMsIHBhcmFtcyk7XG4gICAgICAgIGxpYlR5cGUgPSBwYXJhbXMubGliVHlwZSB8fCBjaGFydENvbnN0LkRFRkFVTFRfUExVR0lOO1xuICAgICAgICB0aGlzLnBlcmNlbnRWYWx1ZXMgPSB0aGlzLl9tYWtlUGVyY2VudFZhbHVlcyhwYXJhbXMuZGF0YSwgcGFyYW1zLm9wdGlvbnMuc3RhY2tlZCk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHcmFwaCByZW5kZXJlclxuICAgICAgICAgKiBAdHlwZSB7b2JqZWN0fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5ncmFwaFJlbmRlcmVyID0gcGx1Z2luRmFjdG9yeS5nZXQobGliVHlwZSwgcGFyYW1zLmNoYXJ0VHlwZSk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNlcmllcyB2aWV3IGNsYXNzTmFtZVxuICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jbGFzc05hbWUgPSAndHVpLWNoYXJ0LXNlcmllcy1hcmVhJztcblxuICAgICAgICB0aGlzLnNlcmllc0RhdGEgPSB0aGlzLm1ha2VTZXJpZXNEYXRhKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2Ugc2VyaWVzIGRhdGEuXG4gICAgICogQHJldHVybnMge29iamVjdH0gYWRkIGRhdGFcbiAgICAgKi9cbiAgICBtYWtlU2VyaWVzRGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB7fTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2hvdyB0b29sdGlwIChtb3VzZW92ZXIgY2FsbGJhY2spLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuYWxsb3dOZWdhdGl2ZVRvb2x0aXAgd2hldGhlciBhbGxvdyBuZWdhdGl2ZSB0b29sdGlwIG9yIG5vdFxuICAgICAqIEBwYXJhbSB7e3RvcDpudW1iZXIsIGxlZnQ6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBib3VuZCBncmFwaCBib3VuZCBpbmZvcm1hdGlvblxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBncm91cEluZGV4IGdyb3VwIGluZGV4XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IGluZGV4XG4gICAgICovXG4gICAgc2hvd1Rvb2x0aXA6IGZ1bmN0aW9uKHBhcmFtcywgYm91bmQsIGdyb3VwSW5kZXgsIGluZGV4LCBldmVudFBvc2l0aW9uKSB7XG4gICAgICAgIHRoaXMuZmlyZSgnc2hvd1Rvb2x0aXAnLCB0dWkudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgaW5kZXhlczoge1xuICAgICAgICAgICAgICAgIGdyb3VwSW5kZXg6IGdyb3VwSW5kZXgsXG4gICAgICAgICAgICAgICAgaW5kZXg6IGluZGV4XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm91bmQ6IGJvdW5kLFxuICAgICAgICAgICAgZXZlbnRQb3NpdGlvbjogZXZlbnRQb3NpdGlvblxuICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSGlkZSB0b29sdGlwIChtb3VzZW91dCBjYWxsYmFjaykuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGlkIHRvb2x0aXAgaWRcbiAgICAgKi9cbiAgICBoaWRlVG9vbHRpcDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZmlyZSgnaGlkZVRvb2x0aXAnKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gZXhwYW5kIHNlcmllcyBkaW1lbnNpb25cbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGRpbWVuc2lvbiBzZXJpZXMgZGltZW5zaW9uXG4gICAgICogQHJldHVybnMge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGV4cGVuZGVkIGRpbWVuc2lvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2V4cGFuZERpbWVuc2lvbjogZnVuY3Rpb24oZGltZW5zaW9uKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB3aWR0aDogZGltZW5zaW9uLndpZHRoICsgY2hhcnRDb25zdC5TRVJJRVNfRVhQQU5EX1NJWkUgKiAyLFxuICAgICAgICAgICAgaGVpZ2h0OiBkaW1lbnNpb24uaGVpZ2h0ICsgY2hhcnRDb25zdC5TRVJJRVNfRVhQQU5EX1NJWkVcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIHNlcmllcy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgb2JqZWN0IGZvciBncmFwaCBkcmF3aW5nXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSBzZXJpZXMgZWxlbWVudFxuICAgICAqL1xuICAgIHJlbmRlcjogZnVuY3Rpb24ocGFwZXIpIHtcbiAgICAgICAgdmFyIGVsID0gZG9tLmNyZWF0ZSgnRElWJywgdGhpcy5jbGFzc05hbWUpLFxuICAgICAgICAgICAgYm91bmQgPSB0aGlzLmJvdW5kLFxuICAgICAgICAgICAgZGltZW5zaW9uID0gdGhpcy5fZXhwYW5kRGltZW5zaW9uKGJvdW5kLmRpbWVuc2lvbiksXG4gICAgICAgICAgICBpbkNhbGxiYWNrID0gdHVpLnV0aWwuYmluZCh0aGlzLnNob3dUb29sdGlwLCB0aGlzLCB7XG4gICAgICAgICAgICAgICAgYWxsb3dOZWdhdGl2ZVRvb2x0aXA6ICEhdGhpcy5hbGxvd05lZ2F0aXZlVG9vbHRpcCxcbiAgICAgICAgICAgICAgICBjaGFydFR5cGU6IHRoaXMuY2hhcnRUeXBlXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIG91dENhbGxiYWNrID0gdHVpLnV0aWwuYmluZCh0aGlzLmhpZGVUb29sdGlwLCB0aGlzKSxcbiAgICAgICAgICAgIGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgZGltZW5zaW9uOiBkaW1lbnNpb24sXG4gICAgICAgICAgICAgICAgY2hhcnRUeXBlOiB0aGlzLmNoYXJ0VHlwZSxcbiAgICAgICAgICAgICAgICB0aGVtZTogdGhpcy50aGVtZSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnNcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXJpZXNEYXRhID0gdGhpcy5zZXJpZXNEYXRhLFxuICAgICAgICAgICAgYWRkRGF0YUZvclNlcmllc0xhYmVsO1xuXG4gICAgICAgIGlmICghcGFwZXIpIHtcbiAgICAgICAgICAgIHJlbmRlclV0aWwucmVuZGVyRGltZW5zaW9uKGVsLCBkaW1lbnNpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fcmVuZGVyUG9zaXRpb24oZWwsIGJvdW5kLnBvc2l0aW9uLCB0aGlzLmNoYXJ0VHlwZSk7XG5cbiAgICAgICAgZGF0YSA9IHR1aS51dGlsLmV4dGVuZChkYXRhLCBzZXJpZXNEYXRhKTtcblxuICAgICAgICB0aGlzLnBhcGVyID0gdGhpcy5ncmFwaFJlbmRlcmVyLnJlbmRlcihwYXBlciwgZWwsIGRhdGEsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKTtcblxuICAgICAgICBpZiAodGhpcy5fcmVuZGVyU2VyaWVzTGFiZWwpIHtcbiAgICAgICAgICAgIGFkZERhdGFGb3JTZXJpZXNMYWJlbCA9IHRoaXMuX21ha2VTZXJpZXNEYXRhRm9yU2VyaWVzTGFiZWwoZWwsIGRpbWVuc2lvbik7XG4gICAgICAgICAgICB0aGlzLmVsU2VyaWVzTGFiZWxBcmVhID0gdGhpcy5fcmVuZGVyU2VyaWVzTGFiZWwodHVpLnV0aWwuZXh0ZW5kKGFkZERhdGFGb3JTZXJpZXNMYWJlbCwgc2VyaWVzRGF0YSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLmlzR3JvdXBlZFRvb2x0aXApIHtcbiAgICAgICAgICAgIHRoaXMuYXR0YWNoRXZlbnQoZWwpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc2VyaWVzIGxhYmVsIG1vdXNlIGV2ZW50IOuPmeyekSDsi5wg7IKs7JqpXG4gICAgICAgIHRoaXMuaW5DYWxsYmFjayA9IGluQ2FsbGJhY2s7XG4gICAgICAgIHRoaXMub3V0Q2FsbGJhY2sgPSBvdXRDYWxsYmFjaztcblxuICAgICAgICByZXR1cm4gZWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYWRkIGRhdGEgZm9yIHNlcmllcyBsYWJlbC5cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY29udGFpbmVyXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBkaW1lbnNpb24gZGltZW5zaW9uXG4gICAgICogQHJldHVybnMge3tcbiAgICAgKiAgICAgIGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsXG4gICAgICogICAgICB2YWx1ZXM6IGFycmF5LjxhcnJheT4sXG4gICAgICogICAgICBmb3JtYXR0ZWRWYWx1ZXM6IGFycmF5LjxhcnJheT4sXG4gICAgICogICAgICBmb3JtYXRGdW5jdGlvbnM6IGFycmF5LjxmdW5jdGlvbj4sXG4gICAgICogICAgICBkaW1lbnNpb246IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn1cbiAgICAgKiB9fSBhZGQgZGF0YSBmb3Igc2VyaWVzIGxhYmVsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVNlcmllc0RhdGFGb3JTZXJpZXNMYWJlbDogZnVuY3Rpb24oY29udGFpbmVyLCBkaW1lbnNpb24pIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNvbnRhaW5lcjogY29udGFpbmVyLFxuICAgICAgICAgICAgdmFsdWVzOiB0aGlzLmRhdGEudmFsdWVzLFxuICAgICAgICAgICAgZm9ybWF0dGVkVmFsdWVzOiB0aGlzLmRhdGEuZm9ybWF0dGVkVmFsdWVzLFxuICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zOiB0aGlzLmRhdGEuZm9ybWF0RnVuY3Rpb25zLFxuICAgICAgICAgICAgZGltZW5zaW9uOiBkaW1lbnNpb25cbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGJvdW5kc1xuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHNlcmllcyBlbGVtZW50XG4gICAgICogQHBhcmFtIHt7dG9wOiBudW1iZXIsIGxlZnQ6IG51bWJlcn19IHBvc2l0aW9uIHNlcmllcyBwb3NpdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlclBvc2l0aW9uOiBmdW5jdGlvbihlbCwgcG9zaXRpb24pIHtcbiAgICAgICAgdmFyIGhpZGRlbldpZHRoID0gcmVuZGVyVXRpbC5pc0lFOCgpID8gY2hhcnRDb25zdC5ISURERU5fV0lEVEggOiAwO1xuICAgICAgICBwb3NpdGlvbi50b3AgPSBwb3NpdGlvbi50b3AgLSAoaGlkZGVuV2lkdGggKiAyKTtcbiAgICAgICAgcG9zaXRpb24ubGVmdCA9IHBvc2l0aW9uLmxlZnQgLSBjaGFydENvbnN0LlNFUklFU19FWFBBTkRfU0laRSAtIGhpZGRlbldpZHRoO1xuICAgICAgICByZW5kZXJVdGlsLnJlbmRlclBvc2l0aW9uKGVsLCBwb3NpdGlvbik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBwYXBlci5cbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBvYmplY3QgZm9yIGdyYXBoIGRyYXdpbmdcbiAgICAgKi9cbiAgICBnZXRQYXBlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcGVyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHBlcmNlbnQgdmFsdWUuXG4gICAgICogQHBhcmFtIHt7dmFsdWVzOiBhcnJheSwgc2NhbGU6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fX0gZGF0YSBzZXJpZXMgZGF0YVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzdGFja2VkIHN0YWNrZWQgb3B0aW9uXG4gICAgICogQHJldHVybnMge2FycmF5LjxhcnJheS48bnVtYmVyPj59IHBlcmNlbnQgdmFsdWVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVBlcmNlbnRWYWx1ZXM6IGZ1bmN0aW9uKGRhdGEsIHN0YWNrZWQpIHtcbiAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgaWYgKHN0YWNrZWQgPT09IGNoYXJ0Q29uc3QuU1RBQ0tFRF9OT1JNQUxfVFlQRSkge1xuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5fbWFrZU5vcm1hbFN0YWNrZWRQZXJjZW50VmFsdWVzKGRhdGEpO1xuICAgICAgICB9IGVsc2UgaWYgKHN0YWNrZWQgPT09IGNoYXJ0Q29uc3QuU1RBQ0tFRF9QRVJDRU5UX1RZUEUpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuX21ha2VQZXJjZW50U3RhY2tlZFBlcmNlbnRWYWx1ZXMoZGF0YSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9tYWtlTm9ybWFsUGVyY2VudFZhbHVlcyhkYXRhKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgcGVyY2VudCB2YWx1ZXMgYWJvdXQgbm9ybWFsIHN0YWNrZWQgb3B0aW9uLlxuICAgICAqIEBwYXJhbSB7e3ZhbHVlczogYXJyYXksIHNjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX19IGRhdGEgc2VyaWVzIGRhdGFcbiAgICAgKiBAcmV0dXJucyB7YXJyYXl9IHBlcmNlbnQgdmFsdWVzIGFib3V0IG5vcm1hbCBzdGFja2VkIG9wdGlvbi5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlTm9ybWFsU3RhY2tlZFBlcmNlbnRWYWx1ZXM6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIG1pbiA9IGRhdGEuc2NhbGUubWluLFxuICAgICAgICAgICAgbWF4ID0gZGF0YS5zY2FsZS5tYXgsXG4gICAgICAgICAgICBkaXN0YW5jZSA9IG1heCAtIG1pbixcbiAgICAgICAgICAgIHBlcmNlbnRWYWx1ZXMgPSB0dWkudXRpbC5tYXAoZGF0YS52YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICAgICAgICAgIHZhciBwbHVzVmFsdWVzID0gdHVpLnV0aWwuZmlsdGVyKHZhbHVlcywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSA+IDA7XG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBzdW0gPSB0dWkudXRpbC5zdW0ocGx1c1ZhbHVlcyksXG4gICAgICAgICAgICAgICAgICAgIGdyb3VwUGVyY2VudCA9IChzdW0gLSBtaW4pIC8gZGlzdGFuY2U7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHR1aS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSA9PT0gMCA/IDAgOiBncm91cFBlcmNlbnQgKiAodmFsdWUgLyBzdW0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBwZXJjZW50VmFsdWVzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHBlcmNlbnQgdmFsdWVzIGFib3V0IHBlcmNlbnQgc3RhY2tlZCBvcHRpb24uXG4gICAgICogQHBhcmFtIHt7dmFsdWVzOiBhcnJheSwgc2NhbGU6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fX0gZGF0YSBzZXJpZXMgZGF0YVxuICAgICAqIEByZXR1cm5zIHthcnJheX0gcGVyY2VudCB2YWx1ZXMgYWJvdXQgcGVyY2VudCBzdGFja2VkIG9wdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VQZXJjZW50U3RhY2tlZFBlcmNlbnRWYWx1ZXM6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIHBlcmNlbnRWYWx1ZXMgPSB0dWkudXRpbC5tYXAoZGF0YS52YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICAgICAgdmFyIHBsdXNWYWx1ZXMgPSB0dWkudXRpbC5maWx0ZXIodmFsdWVzLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgPiAwO1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIHN1bSA9IHR1aS51dGlsLnN1bShwbHVzVmFsdWVzKTtcbiAgICAgICAgICAgIHJldHVybiB0dWkudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSA9PT0gMCA/IDAgOiB2YWx1ZSAvIHN1bTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHBlcmNlbnRWYWx1ZXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2Ugbm9ybWFsIHBlcmNlbnQgdmFsdWUuXG4gICAgICogQHBhcmFtIHt7dmFsdWVzOiBhcnJheSwgc2NhbGU6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fX0gZGF0YSBzZXJpZXMgZGF0YVxuICAgICAqIEByZXR1cm5zIHthcnJheS48YXJyYXkuPG51bWJlcj4+fSBwZXJjZW50IHZhbHVlc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VOb3JtYWxQZXJjZW50VmFsdWVzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBtaW4gPSBkYXRhLnNjYWxlLm1pbixcbiAgICAgICAgICAgIG1heCA9IGRhdGEuc2NhbGUubWF4LFxuICAgICAgICAgICAgZGlzdGFuY2UgPSBtYXggLSBtaW4sXG4gICAgICAgICAgICBpc0xpbmVUeXBlQ2hhcnQgPSBzdGF0ZS5pc0xpbmVUeXBlQ2hhcnQodGhpcy5jaGFydFR5cGUpLFxuICAgICAgICAgICAgZmxhZyA9IDEsXG4gICAgICAgICAgICBzdWJWYWx1ZSA9IDAsXG4gICAgICAgICAgICBwZXJjZW50VmFsdWVzO1xuXG4gICAgICAgIGlmICghaXNMaW5lVHlwZUNoYXJ0ICYmIG1pbiA8IDAgJiYgbWF4IDw9IDApIHtcbiAgICAgICAgICAgIGZsYWcgPSAtMTtcbiAgICAgICAgICAgIHN1YlZhbHVlID0gbWF4O1xuICAgICAgICAgICAgZGlzdGFuY2UgPSBtaW4gLSBtYXg7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNMaW5lVHlwZUNoYXJ0IHx8IG1pbiA+PSAwKSB7XG4gICAgICAgICAgICBzdWJWYWx1ZSA9IG1pbjtcbiAgICAgICAgfVxuXG4gICAgICAgIHBlcmNlbnRWYWx1ZXMgPSB0dWkudXRpbC5tYXAoZGF0YS52YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICAgICAgcmV0dXJuIHR1aS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICh2YWx1ZSAtIHN1YlZhbHVlKSAqIGZsYWcgLyBkaXN0YW5jZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHBlcmNlbnRWYWx1ZXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBzY2FsZSBkaXN0YW5jZSBmcm9tIHplcm8gcG9pbnQuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHNpemUgY2hhcnQgc2l6ZSAod2lkdGggb3IgaGVpZ2h0KVxuICAgICAqIEBwYXJhbSB7e21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19IHNjYWxlIHNjYWxlXG4gICAgICogQHJldHVybnMge3t0b01heDogbnVtYmVyLCB0b01pbjogbnVtYmVyfX0gcGl4ZWwgZGlzdGFuY2VcbiAgICAgKi9cbiAgICBnZXRTY2FsZURpc3RhbmNlRnJvbVplcm9Qb2ludDogZnVuY3Rpb24oc2l6ZSwgc2NhbGUpIHtcbiAgICAgICAgdmFyIG1pbiA9IHNjYWxlLm1pbixcbiAgICAgICAgICAgIG1heCA9IHNjYWxlLm1heCxcbiAgICAgICAgICAgIGRpc3RhbmNlID0gbWF4IC0gbWluLFxuICAgICAgICAgICAgdG9NYXggPSAwLFxuICAgICAgICAgICAgdG9NaW4gPSAwO1xuXG4gICAgICAgIGlmIChtaW4gPCAwICYmIG1heCA+IDApIHtcbiAgICAgICAgICAgIHRvTWF4ID0gKGRpc3RhbmNlICsgbWluKSAvIGRpc3RhbmNlICogc2l6ZTtcbiAgICAgICAgICAgIHRvTWluID0gKGRpc3RhbmNlIC0gbWF4KSAvIGRpc3RhbmNlICogc2l6ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0b01heDogdG9NYXgsXG4gICAgICAgICAgICB0b01pbjogdG9NaW5cbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgcmVuZGVyQ29vcmRpbmF0ZUFyZWE6IGZ1bmN0aW9uKCkge30sXG5cbiAgICAvKipcbiAgICAgKiBPbiBtb3VzZW92ZXIgZXZlbnQgaGFuZGxlciBmb3Igc2VyaWVzIGFyZWFcbiAgICAgKiBAcGFyYW0ge01vdXNlRXZlbnR9IGUgbW91c2UgZXZlbnRcbiAgICAgKi9cbiAgICBvbk1vdXNlb3ZlcjogZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgZWxUYXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQsXG4gICAgICAgICAgICBncm91cEluZGV4LCBpbmRleDtcblxuICAgICAgICBpZiAoZWxUYXJnZXQuY2xhc3NOYW1lICE9PSBTRVJJRVNfTEFCRUxfQ0xBU1NfTkFNRSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZ3JvdXBJbmRleCA9IHBhcnNlSW50KGVsVGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1ncm91cC1pbmRleCcpLCAxMCk7XG4gICAgICAgIGluZGV4ID0gcGFyc2VJbnQoZWxUYXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWluZGV4JyksIDEwKTtcblxuICAgICAgICBpZiAoZ3JvdXBJbmRleCA9PT0gLTEgfHwgaW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmluQ2FsbGJhY2sodGhpcy5fZ2V0Qm91bmQoZ3JvdXBJbmRleCwgaW5kZXgpLCBncm91cEluZGV4LCBpbmRleCk7XG4gICAgfSxcblxuICAgIG9uTW91c2Vtb3ZlOiBmdW5jdGlvbigpIHt9LFxuICAgIC8qKlxuICAgICAqIE9uIG1vdXNlb3V0IGV2ZW50IGhhbmRsZXIgZm9yIHNlcmllcyBhcmVhXG4gICAgICogQHBhcmFtIHtNb3VzZUV2ZW50fSBlIG1vdXNlIGV2ZW50XG4gICAgICovXG4gICAgb25Nb3VzZW91dDogZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgZWxUYXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQsXG4gICAgICAgICAgICBncm91cEluZGV4LCBpbmRleDtcblxuICAgICAgICBpZiAoZWxUYXJnZXQuY2xhc3NOYW1lICE9PSBTRVJJRVNfTEFCRUxfQ0xBU1NfTkFNRSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZ3JvdXBJbmRleCA9IHBhcnNlSW50KGVsVGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1ncm91cC1pbmRleCcpLCAxMCk7XG4gICAgICAgIGluZGV4ID0gcGFyc2VJbnQoZWxUYXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWluZGV4JyksIDEwKTtcblxuICAgICAgICBpZiAoZ3JvdXBJbmRleCA9PT0gLTEgfHwgaW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm91dENhbGxiYWNrKGdyb3VwSW5kZXgsIGluZGV4KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGV2ZW50XG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKi9cbiAgICBhdHRhY2hFdmVudDogZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgZXZlbnQuYmluZEV2ZW50KCdtb3VzZW92ZXInLCBlbCwgdHVpLnV0aWwuYmluZCh0aGlzLm9uTW91c2VvdmVyLCB0aGlzKSk7XG4gICAgICAgIGV2ZW50LmJpbmRFdmVudCgnbW91c2Vtb3ZlJywgZWwsIHR1aS51dGlsLmJpbmQodGhpcy5vbk1vdXNlbW92ZSwgdGhpcykpO1xuICAgICAgICBldmVudC5iaW5kRXZlbnQoJ21vdXNlb3V0JywgZWwsIHR1aS51dGlsLmJpbmQodGhpcy5vbk1vdXNlb3V0LCB0aGlzKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIGNhbGwgc2hvd0FuaW1hdGlvbiBmdW5jdGlvbiBvZiBncmFwaFJlbmRlcmVyLlxuICAgICAqIEBwYXJhbSB7e2dyb3VwSW5kZXg6IG51bWJlciwgaW5kZXg6IG51bWJlcn19IGRhdGEgZGF0YVxuICAgICAqL1xuICAgIG9uU2hvd0FuaW1hdGlvbjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBpZiAoIXRoaXMuZ3JhcGhSZW5kZXJlci5zaG93QW5pbWF0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ncmFwaFJlbmRlcmVyLnNob3dBbmltYXRpb24uY2FsbCh0aGlzLmdyYXBoUmVuZGVyZXIsIGRhdGEpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBjYWxsIGhpZGVBbmltYXRpb24gZnVuY3Rpb24gb2YgZ3JhcGhSZW5kZXJlci5cbiAgICAgKiBAcGFyYW0ge3tncm91cEluZGV4OiBudW1iZXIsIGluZGV4OiBudW1iZXJ9fSBkYXRhIGRhdGFcbiAgICAgKi9cbiAgICBvbkhpZGVBbmltYXRpb246IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgaWYgKCF0aGlzLmdyYXBoUmVuZGVyZXIuaGlkZUFuaW1hdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ3JhcGhSZW5kZXJlci5oaWRlQW5pbWF0aW9uLmNhbGwodGhpcy5ncmFwaFJlbmRlcmVyLCBkYXRhKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gY2FsbCBzaG93R3JvdXBBbmltYXRpb24gZnVuY3Rpb24gb2YgZ3JhcGhSZW5kZXJlci5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggaW5kZXhcbiAgICAgKiBAcGFyYW0ge3tcbiAgICAgKiAgICAgIGRpbWVuc2lvbjoge3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfSxcbiAgICAgKiAgICAgIHBvc2l0aW9uOiB7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn1cbiAgICAgKiB9fSBib3VuZCBib3VuZFxuICAgICAqL1xuICAgIG9uU2hvd0dyb3VwQW5pbWF0aW9uOiBmdW5jdGlvbihpbmRleCwgYm91bmQpIHtcbiAgICAgICAgaWYgKCF0aGlzLmdyYXBoUmVuZGVyZXIuc2hvd0dyb3VwQW5pbWF0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ncmFwaFJlbmRlcmVyLnNob3dHcm91cEFuaW1hdGlvbi5jYWxsKHRoaXMuZ3JhcGhSZW5kZXJlciwgaW5kZXgsIGJvdW5kKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gY2FsbCBoaWRlR3JvdXBBbmltYXRpb24gZnVuY3Rpb24gb2YgZ3JhcGhSZW5kZXJlci5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggaW5kZXhcbiAgICAgKi9cbiAgICBvbkhpZGVHcm91cEFuaW1hdGlvbjogZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmdyYXBoUmVuZGVyZXIuaGlkZUdyb3VwQW5pbWF0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ncmFwaFJlbmRlcmVyLmhpZGVHcm91cEFuaW1hdGlvbi5jYWxsKHRoaXMuZ3JhcGhSZW5kZXJlciwgaW5kZXgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBbmltYXRlIGNvbXBvbmVudC5cbiAgICAgKi9cbiAgICBhbmltYXRlQ29tcG9uZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuZ3JhcGhSZW5kZXJlci5hbmltYXRlKSB7XG4gICAgICAgICAgICB0aGlzLmdyYXBoUmVuZGVyZXIuYW5pbWF0ZSh0dWkudXRpbC5iaW5kKHRoaXMuc2hvd1Nlcmllc0xhYmVsQXJlYSwgdGhpcykpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgaHRtbCBhYm91dCBzZXJpZXMgbGFiZWxcbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gcG9zaXRpb24gcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWUgdmFsdWVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZ3JvdXBJbmRleCBncm91cCBpbmRleFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBpbmRleFxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGh0bWwgc3RyaW5nXG4gICAgICovXG4gICAgbWFrZVNlcmllc0xhYmVsSHRtbDogZnVuY3Rpb24ocG9zaXRpb24sIHZhbHVlLCBncm91cEluZGV4LCBpbmRleCkge1xuICAgICAgICB2YXIgY3NzT2JqID0gdHVpLnV0aWwuZXh0ZW5kKHBvc2l0aW9uLCB0aGlzLnRoZW1lLmxhYmVsKTtcbiAgICAgICAgcmV0dXJuIHNlcmllc1RlbXBsYXRlLnRwbFNlcmllc0xhYmVsKHtcbiAgICAgICAgICAgIGNzc1RleHQ6IHNlcmllc1RlbXBsYXRlLnRwbENzc1RleHQoY3NzT2JqKSxcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgIGdyb3VwSW5kZXg6IGdyb3VwSW5kZXgsXG4gICAgICAgICAgICBpbmRleDogaW5kZXhcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNob3cgc2VyaWVzIGxhYmVsIGFyZWEuXG4gICAgICovXG4gICAgc2hvd1Nlcmllc0xhYmVsQXJlYTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICgoIXRoaXMub3B0aW9ucy5zaG93TGFiZWwgJiYgIXRoaXMub3B0aW9ucy5sZWdlbmRUeXBlKSB8fCAhdGhpcy5lbFNlcmllc0xhYmVsQXJlYSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZG9tLmFkZENsYXNzKHRoaXMuZWxTZXJpZXNMYWJlbEFyZWEsICdzaG93Jyk7XG5cbiAgICAgICAgKG5ldyB0dWkuY29tcG9uZW50LkVmZmVjdHMuRmFkZSh7XG4gICAgICAgICAgICBlbGVtZW50OiB0aGlzLmVsU2VyaWVzTGFiZWxBcmVhLFxuICAgICAgICAgICAgZHVyYXRpb246IDMwMFxuICAgICAgICB9KSkuYWN0aW9uKHtcbiAgICAgICAgICAgIHN0YXJ0OiAwLFxuICAgICAgICAgICAgZW5kOiAxLFxuICAgICAgICAgICAgY29tcGxldGU6IGZ1bmN0aW9uKCkge31cbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5cbnR1aS51dGlsLkN1c3RvbUV2ZW50cy5taXhpbihTZXJpZXMpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNlcmllcztcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBUaGlzIGlzIHRlbXBsYXRlcyBvZiBzZXJpZXMuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG52YXIgdGVtcGxhdGVNYWtlciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvdGVtcGxhdGVNYWtlcicpO1xuXG52YXIgdGFncyA9IHtcbiAgICBIVE1MX1NFUklFU19MQUJFTDogJzxkaXYgY2xhc3M9XCJ0dWktY2hhcnQtc2VyaWVzLWxhYmVsXCIgc3R5bGU9XCJ7eyBjc3NUZXh0IH19XCIgZGF0YS1ncm91cC1pbmRleD1cInt7IGdyb3VwSW5kZXggfX1cIiBkYXRhLWluZGV4PVwie3sgaW5kZXggfX1cIj57eyB2YWx1ZSB9fTwvZGl2PicsXG4gICAgVEVYVF9DU1NfVEVYVDogJ2xlZnQ6e3sgbGVmdCB9fXB4O3RvcDp7eyB0b3AgfX1weDtmb250LWZhbWlseTp7eyBmb250RmFtaWx5IH19O2ZvbnQtc2l6ZTp7eyBmb250U2l6ZSB9fXB4J1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgdHBsU2VyaWVzTGFiZWw6IHRlbXBsYXRlTWFrZXIudGVtcGxhdGUodGFncy5IVE1MX1NFUklFU19MQUJFTCksXG4gICAgdHBsQ3NzVGV4dDogdGVtcGxhdGVNYWtlci50ZW1wbGF0ZSh0YWdzLlRFWFRfQ1NTX1RFWFQpXG59O1xuIiwidmFyIERFRkFVTFRfQ09MT1IgPSAnIzAwMDAwMCcsXG4gICAgREVGQVVMVF9CQUNLR1JPVU5EID0gJyNmZmZmZmYnLFxuICAgIEVNUFRZID0gJycsXG4gICAgREVGQVVMVF9BWElTID0ge1xuICAgICAgICB0aWNrQ29sb3I6IERFRkFVTFRfQ09MT1IsXG4gICAgICAgIHRpdGxlOiB7XG4gICAgICAgICAgICBmb250U2l6ZTogMTIsXG4gICAgICAgICAgICBmb250RmFtaWx5OiBFTVBUWSxcbiAgICAgICAgICAgIGNvbG9yOiBERUZBVUxUX0NPTE9SXG4gICAgICAgIH0sXG4gICAgICAgIGxhYmVsOiB7XG4gICAgICAgICAgICBmb250U2l6ZTogMTIsXG4gICAgICAgICAgICBmb250RmFtaWx5OiBFTVBUWSxcbiAgICAgICAgICAgIGNvbG9yOiBERUZBVUxUX0NPTE9SXG4gICAgICAgIH1cbiAgICB9O1xuXG52YXIgZGVmYXVsdFRoZW1lID0ge1xuICAgIGNoYXJ0OiB7XG4gICAgICAgIGJhY2tncm91bmQ6IERFRkFVTFRfQkFDS0dST1VORCxcbiAgICAgICAgZm9udEZhbWlseTogJ1ZlcmRhbmEnXG4gICAgfSxcbiAgICB0aXRsZToge1xuICAgICAgICBmb250U2l6ZTogMTgsXG4gICAgICAgIGZvbnRGYW1pbHk6IEVNUFRZLFxuICAgICAgICBjb2xvcjogREVGQVVMVF9DT0xPUlxuICAgIH0sXG4gICAgeUF4aXM6IERFRkFVTFRfQVhJUyxcbiAgICB4QXhpczogREVGQVVMVF9BWElTLFxuICAgIHBsb3Q6IHtcbiAgICAgICAgbGluZUNvbG9yOiAnI2RkZGRkZCcsXG4gICAgICAgIGJhY2tncm91bmQ6ICcjZmZmZmZmJ1xuICAgIH0sXG4gICAgc2VyaWVzOiB7XG4gICAgICAgIGxhYmVsOiB7XG4gICAgICAgICAgICBmb250U2l6ZTogMTEsXG4gICAgICAgICAgICBmb250RmFtaWx5OiBFTVBUWSxcbiAgICAgICAgICAgIGNvbG9yOiBERUZBVUxUX0NPTE9SXG4gICAgICAgIH0sXG4gICAgICAgIGNvbG9yczogWycjYWM0MTQyJywgJyNkMjg0NDUnLCAnI2Y0YmY3NScsICcjOTBhOTU5JywgJyM3NWI1YWEnLCAnIzZhOWZiNScsICcjYWE3NTlmJywgJyM4ZjU1MzYnXSxcbiAgICAgICAgYm9yZGVyQ29sb3I6IEVNUFRZXG4gICAgfSxcbiAgICBsZWdlbmQ6IHtcbiAgICAgICAgbGFiZWw6IHtcbiAgICAgICAgICAgIGZvbnRTaXplOiAxMixcbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IEVNUFRZLFxuICAgICAgICAgICAgY29sb3I6IERFRkFVTFRfQ09MT1JcbiAgICAgICAgfVxuICAgIH0sXG4gICAgdG9vbHRpcDoge31cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZGVmYXVsdFRoZW1lO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEdyb3VwIHRvb2x0aXAgY29tcG9uZW50LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgVG9vbHRpcEJhc2UgPSByZXF1aXJlKCcuL3Rvb2x0aXBCYXNlJyksXG4gICAgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4uL2NvbnN0JyksXG4gICAgZG9tID0gcmVxdWlyZSgnLi4vaGVscGVycy9kb21IYW5kbGVyJyksXG4gICAgcmVuZGVyVXRpbCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvcmVuZGVyVXRpbCcpLFxuICAgIGRlZmF1bHRUaGVtZSA9IHJlcXVpcmUoJy4uL3RoZW1lcy9kZWZhdWx0VGhlbWUnKSxcbiAgICB0b29sdGlwVGVtcGxhdGUgPSByZXF1aXJlKCcuL3Rvb2x0aXBUZW1wbGF0ZScpO1xuXG52YXIgR3JvdXBUb29sdGlwID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoVG9vbHRpcEJhc2UsIC8qKiBAbGVuZHMgR3JvdXBUb29sdGlwLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogR3JvdXAgdG9vbHRpcCBjb21wb25lbnQuXG4gICAgICogQGNvbnN0cnVjdHMgR3JvdXBUb29sdGlwXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxudW1iZXI+fSBwYXJhbXMudmFsdWVzIGNvbnZlcnRlZCB2YWx1ZXNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXl9IHBhcmFtcy5sYWJlbHMgbGFiZWxzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5fSBwYXJhbXMubGVnZW5kTGFiZWxzIGxlZ2VuZCBsYWJlbHNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuYm91bmQgYXhpcyBib3VuZFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBheGlzIHRoZW1lXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIFRvb2x0aXBCYXNlLmNhbGwodGhpcywgcGFyYW1zKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSB0b29sdGlwIGRhdGEuXG4gICAgICogQHJldHVybnMge2FycmF5LjxvYmplY3Q+fSB0b29sdGlwIGRhdGFcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICBtYWtlVG9vbHRpcERhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdHVpLnV0aWwubWFwKHRoaXMuam9pbkZvcm1hdHRlZFZhbHVlcywgZnVuY3Rpb24odmFsdWVzLCBpbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogdGhpcy5sYWJlbHNbaW5kZXhdLFxuICAgICAgICAgICAgICAgIHZhbHVlczogdmFsdWVzXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LCB0aGlzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBjb2xvcnMuXG4gICAgICogQHBhcmFtIHthcnJheS48c3RyaW5nPn0gbGVnZW5kTGFiZWxzIGxlZ2VuZCBsYWJlbHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgdG9vbHRpcCB0aGVtZVxuICAgICAqIEByZXR1cm5zIHthcnJheS48c3RyaW5nPn0gY29sb3JzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUNvbG9yczogZnVuY3Rpb24obGVnZW5kTGFiZWxzLCB0aGVtZSkge1xuICAgICAgICB2YXIgY29sb3JJbmRleCA9IDAsXG4gICAgICAgICAgICBkZWZhdWx0Q29sb3JzLCBjb2xvcnMsIHByZXZDaGFydFR5cGU7XG4gICAgICAgIGlmICh0aGVtZS5jb2xvcnMpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGVtZS5jb2xvcnM7XG4gICAgICAgIH1cblxuICAgICAgICBkZWZhdWx0Q29sb3JzID0gZGVmYXVsdFRoZW1lLnNlcmllcy5jb2xvcnMuc2xpY2UoMCwgbGVnZW5kTGFiZWxzLmxlbmd0aCk7XG5cbiAgICAgICAgcmV0dXJuIHR1aS51dGlsLm1hcCh0dWkudXRpbC5wbHVjayhsZWdlbmRMYWJlbHMsICdjaGFydFR5cGUnKSwgZnVuY3Rpb24oY2hhcnRUeXBlKSB7XG4gICAgICAgICAgICB2YXIgY29sb3I7XG4gICAgICAgICAgICBpZiAocHJldkNoYXJ0VHlwZSAhPT0gY2hhcnRUeXBlKSB7XG4gICAgICAgICAgICAgICAgY29sb3JzID0gdGhlbWVbY2hhcnRUeXBlXSA/IHRoZW1lW2NoYXJ0VHlwZV0uY29sb3JzIDogZGVmYXVsdENvbG9ycztcbiAgICAgICAgICAgICAgICBjb2xvckluZGV4ID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHByZXZDaGFydFR5cGUgPSBjaGFydFR5cGU7XG4gICAgICAgICAgICBjb2xvciA9IGNvbG9yc1tjb2xvckluZGV4XTtcbiAgICAgICAgICAgIGNvbG9ySW5kZXggKz0gMTtcbiAgICAgICAgICAgIHJldHVybiBjb2xvcjtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgdG9vbHRpcCBodG1sLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBncm91cEluZGV4IGdyb3VwIGluZGV4XG4gICAgICogQHJldHVybnMge3N0cmluZ30gdG9vbHRpcCBodG1sXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVRvb2x0aXBIdG1sOiBmdW5jdGlvbihncm91cEluZGV4KSB7XG4gICAgICAgIHZhciBpdGVtID0gdGhpcy5kYXRhW2dyb3VwSW5kZXhdLFxuICAgICAgICAgICAgdGVtcGxhdGUgPSB0b29sdGlwVGVtcGxhdGUudHBsR3JvdXBJdGVtLFxuICAgICAgICAgICAgY3NzVGV4dFRlbXBsYXRlID0gdG9vbHRpcFRlbXBsYXRlLnRwbEdyb3VwQ3NzVGV4dCxcbiAgICAgICAgICAgIGNvbG9ycyA9IHRoaXMuX21ha2VDb2xvcnModGhpcy5qb2luTGVnZW5kTGFiZWxzLCB0aGlzLnRoZW1lKSxcbiAgICAgICAgICAgIGl0ZW1zSHRtbDtcblxuICAgICAgICBpdGVtc0h0bWwgPSB0dWkudXRpbC5tYXAoaXRlbS52YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgICAgdmFyIGxlZ2VuZExhYmVsID0gdGhpcy5qb2luTGVnZW5kTGFiZWxzW2luZGV4XTtcbiAgICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZSh7XG4gICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgICAgIGxlZ2VuZDogbGVnZW5kTGFiZWwubGFiZWwsXG4gICAgICAgICAgICAgICAgY2hhcnRUeXBlOiBsZWdlbmRMYWJlbC5jaGFydFR5cGUsXG4gICAgICAgICAgICAgICAgY3NzVGV4dDogY3NzVGV4dFRlbXBsYXRlKHtjb2xvcjogY29sb3JzW2luZGV4XX0pLFxuICAgICAgICAgICAgICAgIHN1ZmZpeDogdGhpcy5zdWZmaXhcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCB0aGlzKS5qb2luKCcnKTtcblxuICAgICAgICByZXR1cm4gdG9vbHRpcFRlbXBsYXRlLnRwbEdyb3VwKHtcbiAgICAgICAgICAgIGNhdGVnb3J5OiBpdGVtLmNhdGVnb3J5LFxuICAgICAgICAgICAgaXRlbXM6IGl0ZW1zSHRtbFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gY2FsY3VsYXRlIHZlcnRpY2FsIHBvc2l0aW9uLlxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gZGltZW5zaW9uIGRpbWVuc2lvblxuICAgICAqIEBwYXJhbSB7e2luZGV4OiBudW1iZXIsIHJhbmdlOiB7c3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXJ9LFxuICAgICAqICAgICAgICAgIHNpemU6IG51bWJlciwgZGlyZWN0aW9uOiBzdHJpbmcsIGlzVmVydGljYWw6IGJvb2xlYW5cbiAgICAgKiAgICAgICAgfX0gcGFyYW1zIGNvb3JkaW5hdGUgZXZlbnQgcGFyYW1ldGVyc1xuICAgICAqIEByZXR1cm5zIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IHBvc2l0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2FsY3VsYXRlVmVydGljYWxQb3NpdGlvbjogZnVuY3Rpb24oZGltZW5zaW9uLCBwYXJhbXMpIHtcbiAgICAgICAgdmFyIHJhbmdlID0gcGFyYW1zLnJhbmdlLFxuICAgICAgICAgICAgaXNMaW5lID0gKHJhbmdlLnN0YXJ0ID09PSByYW5nZS5lbmQpLFxuICAgICAgICAgICAgcGFkZGluZyA9IGlzTGluZSA/IDYgOiAwLFxuICAgICAgICAgICAgbGVmdCA9IGNoYXJ0Q29uc3QuU0VSSUVTX0VYUEFORF9TSVpFO1xuICAgICAgICBpZiAocGFyYW1zLmRpcmVjdGlvbiA9PT0gY2hhcnRDb25zdC5UT09MVElQX0RJUkVDVElPTl9GT1JXT1JEKSB7XG4gICAgICAgICAgICBsZWZ0ICs9IHJhbmdlLnN0YXJ0ICsgcGFkZGluZztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxlZnQgKz0gcmFuZ2UuZW5kIC0gZGltZW5zaW9uLndpZHRoIC0gcGFkZGluZztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbGVmdDogbGVmdCxcbiAgICAgICAgICAgIHRvcDogKHBhcmFtcy5zaXplIC0gZGltZW5zaW9uLmhlaWdodCkgLyAyXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIGNhbGN1bGF0ZSBob3Jpem9udGFsIHBvc2l0aW9uLlxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gZGltZW5zaW9uIGRpbWVuc2lvblxuICAgICAqIEBwYXJhbSB7e2luZGV4OiBudW1iZXIsIHJhbmdlOiB7c3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXJ9LFxuICAgICAqICAgICAgICAgIHNpemU6IG51bWJlciwgZGlyZWN0aW9uOiBzdHJpbmcsIGlzVmVydGljYWw6IGJvb2xlYW5cbiAgICAgKiAgICAgICAgfX0gcGFyYW1zIGNvb3JkaW5hdGUgZXZlbnQgcGFyYW1ldGVyc1xuICAgICAqIEByZXR1cm5zIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IHBvc2l0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2FsY3VsYXRlSG9yaXpvbnRhbFBvc2l0aW9uOiBmdW5jdGlvbihkaW1lbnNpb24sIHBhcmFtcykge1xuICAgICAgICB2YXIgcmFuZ2UgPSBwYXJhbXMucmFuZ2UsXG4gICAgICAgICAgICB0b3AgPSAwO1xuICAgICAgICBpZiAocGFyYW1zLmRpcmVjdGlvbiA9PT0gY2hhcnRDb25zdC5UT09MVElQX0RJUkVDVElPTl9GT1JXT1JEKSB7XG4gICAgICAgICAgICB0b3AgKz0gcmFuZ2Uuc3RhcnQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0b3AgKz0gcmFuZ2UuZW5kIC0gZGltZW5zaW9uLmhlaWdodDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbGVmdDogKHBhcmFtcy5zaXplIC0gZGltZW5zaW9uLndpZHRoKSAvIDIgKyBjaGFydENvbnN0LlNFUklFU19FWFBBTkRfU0laRSxcbiAgICAgICAgICAgIHRvcDogdG9wXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIGNhbGN1bGF0ZSBwb3NpdGlvbi5cbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGRpbWVuc2lvbiBkaW1lbnNpb25cbiAgICAgKiBAcGFyYW0ge3tpbmRleDogbnVtYmVyLCByYW5nZToge3N0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyfSxcbiAgICAgKiAgICAgICAgICBzaXplOiBudW1iZXIsIGRpcmVjdGlvbjogc3RyaW5nLCBpc1ZlcnRpY2FsOiBib29sZWFuXG4gICAgICogICAgICAgIH19IHBhcmFtcyBjb29yZGluYXRlIGV2ZW50IHBhcmFtZXRlcnNcbiAgICAgKiBAcmV0dXJucyB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBwb3NpdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NhbGN1bGF0ZVRvb2x0aXBQb3NpdGlvbjogZnVuY3Rpb24oZGltZW5zaW9uLCBwYXJhbXMpIHtcbiAgICAgICAgdmFyIHBvc2l0aW9uO1xuICAgICAgICBpZiAocGFyYW1zLmlzVmVydGljYWwpIHtcbiAgICAgICAgICAgIHBvc2l0aW9uID0gdGhpcy5fY2FsY3VsYXRlVmVydGljYWxQb3NpdGlvbihkaW1lbnNpb24sIHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwb3NpdGlvbiA9IHRoaXMuX2NhbGN1bGF0ZUhvcml6b250YWxQb3NpdGlvbihkaW1lbnNpb24sIHBhcmFtcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBvc2l0aW9uO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgdG9vbHRpcCBlbGVtZW50LlxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gdG9vbHRpcCBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY3JlYXRlVG9vbHRpcFNlY3RvckVsZW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZWxUb29sdGlwQmxvY2s7XG4gICAgICAgIGlmICghdGhpcy5lbExheW91dC5jaGlsZE5vZGVzLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgICAgIGVsVG9vbHRpcEJsb2NrID0gZG9tLmNyZWF0ZSgnRElWJywgJ3R1aS1jaGFydC1ncm91cC10b29sdGlwLXNlY3RvcicpO1xuICAgICAgICAgICAgZG9tLmFwcGVuZCh0aGlzLmVsTGF5b3V0LCBlbFRvb2x0aXBCbG9jayk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbFRvb2x0aXBCbG9jayA9IHRoaXMuZWxMYXlvdXQubGFzdENoaWxkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbFRvb2x0aXBCbG9jaztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHRvb2x0aXAgc2VjdG9yIGVsZW1lbnQuXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSBzZWN0b3IgZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFRvb2x0aXBTZWN0b3JFbGVtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCF0aGlzLmVsVG9vbHRpcEJsb2NrKSB7XG4gICAgICAgICAgICB0aGlzLmVsVG9vbHRpcEJsb2NrID0gdGhpcy5fY3JlYXRlVG9vbHRpcFNlY3RvckVsZW1lbnQoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5lbFRvb2x0aXBCbG9jaztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBib3VuZCBhYm91dCB0b29sdGlwIHNlY3RvciBvZiB2ZXJ0aWNhbCB0eXBlIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgaGVpZ2h0XG4gICAgICogQHBhcmFtIHt7c3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXJ9fSByYW5nZSByYW5nZVxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNMaW5lIHdoZXRoZXIgbGluZSBvciBub3RcbiAgICAgKiBAcmV0dXJucyB7e2RpbWVuc2lvbjoge3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfSwgcG9zaXRpb246IHtsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX19IGJvdW5kXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVZlcnRpY2FsVG9vbHRpcFNlY3RvckJvdW5kOiBmdW5jdGlvbihoZWlnaHQsIHJhbmdlLCBpc0xpbmUpIHtcbiAgICAgICAgdmFyIHdpZHRoLCBtb3ZlTGVmdDtcbiAgICAgICAgaWYgKGlzTGluZSkge1xuICAgICAgICAgICAgd2lkdGggPSAxO1xuICAgICAgICAgICAgaGVpZ2h0ICs9IDY7XG4gICAgICAgICAgICBtb3ZlTGVmdCA9IDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3aWR0aCA9IHJhbmdlLmVuZCAtIHJhbmdlLnN0YXJ0ICsgMTtcbiAgICAgICAgICAgIG1vdmVMZWZ0ID0gMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGltZW5zaW9uOiB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgICAgICAgICAgIGhlaWdodDogaGVpZ2h0XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICBsZWZ0OiByYW5nZS5zdGFydCArIGNoYXJ0Q29uc3QuU0VSSUVTX0VYUEFORF9TSVpFIC0gbW92ZUxlZnQsXG4gICAgICAgICAgICAgICAgdG9wOiAwXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYm91bmQgYWJvdXQgdG9vbHRpcCBzZWN0b3Igb2YgaG9yaXpvbnRhbCB0eXBlIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aCB3aWR0aFxuICAgICAqIEBwYXJhbSB7e3N0YXJ0OiBudW1iZXIsIGVuZDpudW1iZXJ9fSByYW5nZSByYW5nZVxuICAgICAqIEByZXR1cm5zIHt7ZGltZW5zaW9uOiB7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9LCBwb3NpdGlvbjoge2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fX0gYm91bmRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlSG9yaXpvbnRhbFRvb2x0aXBTZWN0b3JCb3VuZDogZnVuY3Rpb24od2lkdGgsIHJhbmdlKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkaW1lbnNpb246IHtcbiAgICAgICAgICAgICAgICB3aWR0aDogd2lkdGgsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiByYW5nZS5lbmQgLSByYW5nZS5zdGFydCArIDFcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgIGxlZnQ6IGNoYXJ0Q29uc3QuU0VSSUVTX0VYUEFORF9TSVpFLFxuICAgICAgICAgICAgICAgIHRvcDogcmFuZ2Uuc3RhcnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBib3VuZCBhYm91dCB0b29sdGlwIHNlY3Rvci5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc2l6ZSB3aWR0aCBvciBoZWlnaHRcbiAgICAgKiBAcGFyYW0ge3tzdGFydDogbnVtYmVyLCBlbmQ6bnVtYmVyfX0gcmFuZ2UgcmFuZ2VcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzVmVydGljYWwgd2hldGhlciB2ZXJ0aWNhbCBvciBub3RcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzTGluZSB3aGV0aGVyIGxpbmUgdHlwZSBvciBub3RcbiAgICAgKiBAcmV0dXJucyB7e2RpbWVuc2lvbjoge3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfSwgcG9zaXRpb246IHtsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX19IGJvdW5kXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVRvb2x0aXBTZWN0b3JCb3VuZDogZnVuY3Rpb24oc2l6ZSwgcmFuZ2UsIGlzVmVydGljYWwsIGlzTGluZSkge1xuICAgICAgICB2YXIgYm91bmQ7XG4gICAgICAgIGlmIChpc1ZlcnRpY2FsKSB7XG4gICAgICAgICAgICBib3VuZCA9IHRoaXMuX21ha2VWZXJ0aWNhbFRvb2x0aXBTZWN0b3JCb3VuZChzaXplLCByYW5nZSwgaXNMaW5lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJvdW5kID0gdGhpcy5fbWFrZUhvcml6b250YWxUb29sdGlwU2VjdG9yQm91bmQoc2l6ZSwgcmFuZ2UpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBib3VuZDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2hvdyB0b29sdGlwIHNlY3Rvci5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc2l6ZSB3aWR0aCBvciBoZWlnaHRcbiAgICAgKiBAcGFyYW0ge3tzdGFydDogbnVtYmVyLCBlbmQ6bnVtYmVyfX0gcmFuZ2UgcmFuZ2VcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzVmVydGljYWwgd2hldGhlciB2ZXJ0aWNhbCBvciBub3RcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggaW5kZXhcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zaG93VG9vbHRpcFNlY3RvcjogZnVuY3Rpb24oc2l6ZSwgcmFuZ2UsIGlzVmVydGljYWwsIGluZGV4KSB7XG4gICAgICAgIHZhciBlbFRvb2x0aXBCbG9jayA9IHRoaXMuX2dldFRvb2x0aXBTZWN0b3JFbGVtZW50KCksXG4gICAgICAgICAgICBpc0xpbmUgPSAocmFuZ2Uuc3RhcnQgPT09IHJhbmdlLmVuZCksXG4gICAgICAgICAgICBib3VuZCA9IHRoaXMuX21ha2VUb29sdGlwU2VjdG9yQm91bmQoc2l6ZSwgcmFuZ2UsIGlzVmVydGljYWwsIGlzTGluZSk7XG4gICAgICAgIGlmIChpc0xpbmUpIHtcbiAgICAgICAgICAgIHRoaXMuZmlyZSgnc2hvd0dyb3VwQW5pbWF0aW9uJywgaW5kZXgsIGJvdW5kKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlbmRlclV0aWwucmVuZGVyRGltZW5zaW9uKGVsVG9vbHRpcEJsb2NrLCBib3VuZC5kaW1lbnNpb24pO1xuICAgICAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJQb3NpdGlvbihlbFRvb2x0aXBCbG9jaywgYm91bmQucG9zaXRpb24pO1xuICAgICAgICAgICAgZG9tLmFkZENsYXNzKGVsVG9vbHRpcEJsb2NrLCAnc2hvdycpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhpZGUgdG9vbHRpcCBzZWN0b3IuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IGluZGV4XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaGlkZVRvb2x0aXBTZWN0b3I6IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAgIHZhciBlbFRvb2x0aXBCbG9jayA9IHRoaXMuX2dldFRvb2x0aXBTZWN0b3JFbGVtZW50KCk7XG4gICAgICAgIGRvbS5yZW1vdmVDbGFzcyhlbFRvb2x0aXBCbG9jaywgJ3Nob3cnKTtcbiAgICAgICAgdGhpcy5maXJlKCdoaWRlR3JvdXBBbmltYXRpb24nLCBpbmRleCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNob3cgdG9vbHRpcC5cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbFRvb2x0aXAgdG9vbHRpcCBlbGVtZW50XG4gICAgICogQHBhcmFtIHt7aW5kZXg6IG51bWJlciwgcmFuZ2U6IHtzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcn0sXG4gICAgICogICAgICAgICAgc2l6ZTogbnVtYmVyLCBkaXJlY3Rpb246IHN0cmluZywgaXNWZXJ0aWNhbDogYm9vbGVhblxuICAgICAqICAgICAgICB9fSBwYXJhbXMgY29vcmRpbmF0ZSBldmVudCBwYXJhbWV0ZXJzXG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IHByZXZQb3NpdGlvbiBwcmV2IHBvc2l0aW9uXG4gICAgICovXG4gICAgc2hvd1Rvb2x0aXA6IGZ1bmN0aW9uKGVsVG9vbHRpcCwgcGFyYW1zLCBwcmV2UG9zaXRpb24pIHtcbiAgICAgICAgdmFyIGRpbWVuc2lvbiwgcG9zaXRpb247XG5cbiAgICAgICAgaWYgKCF0dWkudXRpbC5pc1VuZGVmaW5lZCh0aGlzLnByZXZJbmRleCkpIHtcbiAgICAgICAgICAgIHRoaXMuZmlyZSgnaGlkZUdyb3VwQW5pbWF0aW9uJywgdGhpcy5wcmV2SW5kZXgpO1xuICAgICAgICB9XG4gICAgICAgIGVsVG9vbHRpcC5pbm5lckhUTUwgPSB0aGlzLl9tYWtlVG9vbHRpcEh0bWwocGFyYW1zLmluZGV4KTtcbiAgICAgICAgZG9tLmFkZENsYXNzKGVsVG9vbHRpcCwgJ3Nob3cnKTtcblxuICAgICAgICB0aGlzLl9zaG93VG9vbHRpcFNlY3RvcihwYXJhbXMuc2l6ZSwgcGFyYW1zLnJhbmdlLCBwYXJhbXMuaXNWZXJ0aWNhbCwgcGFyYW1zLmluZGV4KTtcbiAgICAgICAgZGltZW5zaW9uID0gdGhpcy5nZXRUb29sdGlwRGltZW5zaW9uKGVsVG9vbHRpcCk7XG5cbiAgICAgICAgcG9zaXRpb24gPSB0aGlzLl9jYWxjdWxhdGVUb29sdGlwUG9zaXRpb24oZGltZW5zaW9uLCBwYXJhbXMpO1xuXG4gICAgICAgIHRoaXMubW92ZVRvUG9zaXRpb24oZWxUb29sdGlwLCBwb3NpdGlvbiwgcHJldlBvc2l0aW9uKTtcbiAgICAgICAgdGhpcy5wcmV2SW5kZXggPSBwYXJhbXMuaW5kZXg7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhpZGUgdG9vbHRpcC5cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbFRvb2x0aXAgdG9vbHRpcCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IGluZGV4XG4gICAgICovXG4gICAgaGlkZVRvb2x0aXA6IGZ1bmN0aW9uKGVsVG9vbHRpcCwgaW5kZXgpIHtcbiAgICAgICAgZGVsZXRlIHRoaXMucHJldkluZGV4O1xuICAgICAgICB0aGlzLl9oaWRlVG9vbHRpcFNlY3RvcihpbmRleCk7XG4gICAgICAgIHRoaXMuaGlkZUFuaW1hdGlvbihlbFRvb2x0aXApO1xuICAgIH1cbn0pO1xuXG50dWkudXRpbC5DdXN0b21FdmVudHMubWl4aW4oR3JvdXBUb29sdGlwKTtcblxubW9kdWxlLmV4cG9ydHMgPSBHcm91cFRvb2x0aXA7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgVG9vbHRpcCBjb21wb25lbnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBUb29sdGlwQmFzZSA9IHJlcXVpcmUoJy4vdG9vbHRpcEJhc2UnKSxcbiAgICBjaGFydENvbnN0ID0gcmVxdWlyZSgnLi4vY29uc3QnKSxcbiAgICBkb20gPSByZXF1aXJlKCcuLi9oZWxwZXJzL2RvbUhhbmRsZXInKSxcbiAgICBldmVudCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZXZlbnRMaXN0ZW5lcicpLFxuICAgIHRlbXBsYXRlTWFrZXIgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3RlbXBsYXRlTWFrZXInKSxcbiAgICB0b29sdGlwVGVtcGxhdGUgPSByZXF1aXJlKCcuL3Rvb2x0aXBUZW1wbGF0ZScpO1xuXG52YXIgVG9vbHRpcCA9IHR1aS51dGlsLmRlZmluZUNsYXNzKFRvb2x0aXBCYXNlLCAvKiogQGxlbmRzIFRvb2x0aXAucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBUb29sdGlwIGNvbXBvbmVudC5cbiAgICAgKiBAY29uc3RydWN0cyBUb29sdGlwXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxudW1iZXI+fSBwYXJhbXMudmFsdWVzIGNvbnZlcnRlZCB2YWx1ZXNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXl9IHBhcmFtcy5sYWJlbHMgbGFiZWxzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5fSBwYXJhbXMubGVnZW5kTGFiZWxzIGxlZ2VuZCBsYWJlbHNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuYm91bmQgYXhpcyBib3VuZFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBheGlzIHRoZW1lXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIFRvb2x0aXBCYXNlLmNhbGwodGhpcywgcGFyYW1zKTtcbiAgICAgICAgdGhpcy50cGxUb29sdGlwID0gdGhpcy5fZ2V0VG9vbHRpcFRlbXBsYXRlKHRoaXMub3B0aW9ucy50ZW1wbGF0ZSk7XG4gICAgICAgIHRoaXMuX3NldERlZmF1bHRUb29sdGlwUG9zaXRpb25PcHRpb24oKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHRvb2x0aXAgdGVtcGxhdGUuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvblRlbXBsYXRlIHRlbXBsYXRlIG9wdGlvblxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHRlbXBsYXRlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0VG9vbHRpcFRlbXBsYXRlOiBmdW5jdGlvbihvcHRpb25UZW1wbGF0ZSkge1xuICAgICAgICByZXR1cm4gb3B0aW9uVGVtcGxhdGUgPyB0ZW1wbGF0ZU1ha2VyLnRlbXBsYXRlKG9wdGlvblRlbXBsYXRlKSA6IHRvb2x0aXBUZW1wbGF0ZS50cGxEZWZhdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgZGVmYXVsdCBwb3NpdGlvbiBvcHRpb24gb2YgdG9vbHRpcC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXREZWZhdWx0VG9vbHRpcFBvc2l0aW9uT3B0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5wb3NpdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuaXNWZXJ0aWNhbCkge1xuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnBvc2l0aW9uID0gY2hhcnRDb25zdC5UT09MVElQX0RFRkFVTFRfUE9TSVRJT05fT1BUSU9OO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnBvc2l0aW9uID0gY2hhcnRDb25zdC5UT09MVElQX0RFRkFVTFRfSE9SSVpPTlRBTF9QT1NJVElPTl9PUFRJT047XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIHRvb2x0aXAuXG4gICAgICogQHBhcmFtIHt7cG9zaXRpb246IG9iamVjdH19IGJvdW5kIHRvb2x0aXAgYm91bmRcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHRvb2x0aXAgZWxlbWVudFxuICAgICAqL1xuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBlbCA9IFRvb2x0aXBCYXNlLnByb3RvdHlwZS5yZW5kZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgdGhpcy5hdHRhY2hFdmVudChlbCk7XG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSB0b29sdGlwIGRhdGEuXG4gICAgICogQHJldHVybnMge2FycmF5LjxvYmplY3Q+fSB0b29sdGlwIGRhdGFcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICBtYWtlVG9vbHRpcERhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbGFiZWxzID0gdGhpcy5sYWJlbHMsXG4gICAgICAgICAgICBncm91cFZhbHVlcyA9IHRoaXMudmFsdWVzLFxuICAgICAgICAgICAgbGVnZW5kTGFiZWxzID0gdGhpcy5sZWdlbmRMYWJlbHM7XG5cbiAgICAgICAgcmV0dXJuIHR1aS51dGlsLm1hcChncm91cFZhbHVlcywgZnVuY3Rpb24odmFsdWVzLCBncm91cEluZGV4KSB7XG4gICAgICAgICAgICByZXR1cm4gdHVpLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGxhYmVscyA/IGxhYmVsc1tncm91cEluZGV4XSA6ICcnLFxuICAgICAgICAgICAgICAgICAgICBsZWdlbmQ6IGxlZ2VuZExhYmVsc1tpbmRleF0sXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZpcmUgY3VzdG9tIGV2ZW50IHNob3dBbmltYXRpb24uXG4gICAgICogQHBhcmFtIHt7Z3JvdXBJbmRleDogbnVtYmVyLCBpbmRleDogbnVtYmVyfX0gaW5kZXhlcyBpbmRleGVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZmlyZVNob3dBbmltYXRpb246IGZ1bmN0aW9uKGluZGV4ZXMpIHtcbiAgICAgICAgdGhpcy5maXJlKCdzaG93QW5pbWF0aW9uJywgaW5kZXhlcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZpcmUgY3VzdG9tIGV2ZW50IGhpZGVBbmltYXRpb24uXG4gICAgICogQHBhcmFtIHt7Z3JvdXBJbmRleDogbnVtYmVyLCBpbmRleDogbnVtYmVyfX0gaW5kZXhlcyBpbmRleGVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZmlyZUhpZGVBbmltYXRpb246IGZ1bmN0aW9uKGluZGV4ZXMpIHtcbiAgICAgICAgdGhpcy5maXJlKCdoaWRlQW5pbWF0aW9uJywgaW5kZXhlcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBkYXRhIGluZGV4ZXMuXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxUb29sdGlwIHRvb2x0aXAgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7e2dyb3VwSW5kZXg6IG51bWJlciwgaW5kZXg6bnVtYmVyfX0gaW5kZXhlcyBpbmRleGVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0SW5kZXhlc0N1c3RvbUF0dHJpYnV0ZTogZnVuY3Rpb24oZWxUb29sdGlwLCBpbmRleGVzKSB7XG4gICAgICAgIGVsVG9vbHRpcC5zZXRBdHRyaWJ1dGUoJ2RhdGEtZ3JvdXBJbmRleCcsIGluZGV4ZXMuZ3JvdXBJbmRleCk7XG4gICAgICAgIGVsVG9vbHRpcC5zZXRBdHRyaWJ1dGUoJ2RhdGEtaW5kZXgnLCBpbmRleGVzLmluZGV4KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGRhdGEgaW5kZXhlc1xuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsVG9vbHRpcCB0b29sdGlwIGVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyB7e2dyb3VwSW5kZXg6IG51bWJlciwgaW5kZXg6IG51bWJlcn19IGluZGV4ZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRJbmRleGVzQ3VzdG9tQXR0cmlidXRlOiBmdW5jdGlvbihlbFRvb2x0aXApIHtcbiAgICAgICAgdmFyIGdyb3VwSW5kZXggPSBlbFRvb2x0aXAuZ2V0QXR0cmlidXRlKCdkYXRhLWdyb3VwSW5kZXgnKSxcbiAgICAgICAgICAgIGluZGV4ID0gZWxUb29sdGlwLmdldEF0dHJpYnV0ZSgnZGF0YS1pbmRleCcpLFxuICAgICAgICAgICAgaW5kZXhlcztcbiAgICAgICAgaWYgKGdyb3VwSW5kZXggJiYgaW5kZXgpIHtcbiAgICAgICAgICAgIGluZGV4ZXMgPSB7XG4gICAgICAgICAgICAgICAgZ3JvdXBJbmRleDogcGFyc2VJbnQoZ3JvdXBJbmRleCwgMTApLFxuICAgICAgICAgICAgICAgIGluZGV4OiBwYXJzZUludChpbmRleCwgMTApXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbmRleGVzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgc2hvd2VkIGN1c3RvbSBhdHRyaWJ1dGUuXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxUb29sdGlwIHRvb2x0aXAgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gc3RhdHVzIHdoZXRoZXIgc2hvd2VkIG9yIG5vdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldFNob3dlZEN1c3RvbUF0dHJpYnV0ZTogZnVuY3Rpb24oZWxUb29sdGlwLCBzdGF0dXMpIHtcbiAgICAgICAgZWxUb29sdGlwLnNldEF0dHJpYnV0ZSgnZGF0YS1zaG93ZWQnLCBzdGF0dXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIHNob3dlZCB0b29sdGlwIG9yIG5vdC5cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbFRvb2x0aXAgdG9vbHRpcCBlbGVtZW50XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHdoZXRoZXIgc2hvd2VkIHRvb2x0aXAgb3Igbm90XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNTaG93ZWRUb29sdGlwOiBmdW5jdGlvbihlbFRvb2x0aXApIHtcbiAgICAgICAgcmV0dXJuIGVsVG9vbHRpcC5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2hvd2VkJykgPT09ICd0cnVlJztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogT24gbW91c2VvdmVyIGV2ZW50IGhhbmRsZXIgZm9yIHRvb2x0aXAgYXJlYVxuICAgICAqIEBwYXJhbSB7TW91c2VFdmVudH0gZSBtb3VzZSBldmVudFxuICAgICAqL1xuICAgIG9uTW91c2VvdmVyOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciBlbFRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudCxcbiAgICAgICAgICAgIGluZGV4ZXM7XG5cbiAgICAgICAgaWYgKCFkb20uaGFzQ2xhc3MoZWxUYXJnZXQsIGNoYXJ0Q29uc3QuVE9PTFRJUF9QUkVGSVgpKSB7XG4gICAgICAgICAgICBlbFRhcmdldCA9IGRvbS5maW5kUGFyZW50QnlDbGFzcyhlbFRhcmdldCwgY2hhcnRDb25zdC5UT09MVElQX1BSRUZJWCk7XG4gICAgICAgIH1cblxuXG4gICAgICAgIGlmIChlbFRhcmdldC5pZCAhPT0gdGhpcy5fZ2V0VG9vbHRpcElkKCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGluZGV4ZXMgPSB0aGlzLl9nZXRJbmRleGVzQ3VzdG9tQXR0cmlidXRlKGVsVGFyZ2V0KTtcblxuICAgICAgICB0aGlzLl9zZXRTaG93ZWRDdXN0b21BdHRyaWJ1dGUoZWxUYXJnZXQsIHRydWUpO1xuXG4gICAgICAgIHRoaXMuX2ZpcmVTaG93QW5pbWF0aW9uKGluZGV4ZXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBPbiBtb3VzZW91dCBldmVudCBoYW5kbGVyIGZvciB0b29sdGlwIGFyZWFcbiAgICAgKiBAcGFyYW0ge01vdXNlRXZlbnR9IGUgbW91c2UgZXZlbnRcbiAgICAgKi9cbiAgICBvbk1vdXNlb3V0OiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciBlbFRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudDtcblxuXG4gICAgICAgIGlmICghZG9tLmhhc0NsYXNzKGVsVGFyZ2V0LCBjaGFydENvbnN0LlRPT0xUSVBfUFJFRklYKSkge1xuICAgICAgICAgICAgZWxUYXJnZXQgPSBkb20uZmluZFBhcmVudEJ5Q2xhc3MoZWxUYXJnZXQsIGNoYXJ0Q29uc3QuVE9PTFRJUF9QUkVGSVgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVsVGFyZ2V0LmlkICE9PSB0aGlzLl9nZXRUb29sdGlwSWQoKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5oaWRlVG9vbHRpcChlbFRhcmdldCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIGNhbGN1bGF0ZSB0b29sdGlwIHBvc2l0aW9uIGFib3VudCBwaWUgY2hhcnQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gcGFyYW1zLmJvdW5kIGJvdW5kXG4gICAgICogICAgICBAcGFyYW0ge3tjbGllbnRYOiBudW1iZXIsIGNsaWVudFk6IG51bWJlcn19IHBhcmFtcy5ldmVudFBvc2l0aW9uIG1vdXNlIHBvc2l0aW9uXG4gICAgICogQHJldHVybnMge3t0b3A6IG51bWJlciwgbGVmdDogbnVtYmVyfX0gcG9zaXRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jYWxjdWxhdGVUb29sdGlwUG9zaXRpb25BYm91dFBpZUNoYXJ0OiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgcGFyYW1zLmJvdW5kLmxlZnQgPSBwYXJhbXMuZXZlbnRQb3NpdGlvbi5jbGllbnRYIC0gdGhpcy5zZXJpZXNQb3NpdGlvbi5sZWZ0O1xuICAgICAgICBwYXJhbXMuYm91bmQudG9wID0gcGFyYW1zLmV2ZW50UG9zaXRpb24uY2xpZW50WSAtIHRoaXMuc2VyaWVzUG9zaXRpb24udG9wO1xuICAgICAgICByZXR1cm4gdGhpcy5fY2FsY3VsYXRlVG9vbHRpcFBvc2l0aW9uQWJvdXROb3RCYXJDaGFydChwYXJhbXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBjYWxjdWxhdGUgdG9vbHRpcCBwb3NpdGlvbiBhYm91dCBub3QgYmFyIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHt7Ym91bmQ6IG9iamVjdH19IHBhcmFtcy5kYXRhIGdyYXBoIGluZm9ybWF0aW9uXG4gICAgICogICAgICBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IHBhcmFtcy5kaW1lbnNpb24gdG9vbHRpcCBkaW1lbnNpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMucG9zaXRpb25PcHRpb24gcG9zaXRpb24gb3B0aW9uIChleDogJ2xlZnQgdG9wJylcbiAgICAgKiBAcmV0dXJucyB7e3RvcDogbnVtYmVyLCBsZWZ0OiBudW1iZXJ9fSBwb3NpdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NhbGN1bGF0ZVRvb2x0aXBQb3NpdGlvbkFib3V0Tm90QmFyQ2hhcnQ6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgYm91bmQgPSBwYXJhbXMuYm91bmQsXG4gICAgICAgICAgICBhZGRQb3NpdGlvbiA9IHBhcmFtcy5hZGRQb3NpdGlvbixcbiAgICAgICAgICAgIG1pbnVzV2lkdGggPSBwYXJhbXMuZGltZW5zaW9uLndpZHRoIC0gKGJvdW5kLndpZHRoIHx8IDApLFxuICAgICAgICAgICAgbGluZUdhcCA9IGJvdW5kLndpZHRoID8gMCA6IGNoYXJ0Q29uc3QuVE9PTFRJUF9HQVAsXG4gICAgICAgICAgICBwb3NpdGlvbk9wdGlvbiA9IHBhcmFtcy5wb3NpdGlvbk9wdGlvbiB8fCAnJyxcbiAgICAgICAgICAgIHRvb2x0aXBIZWlnaHQgPSBwYXJhbXMuZGltZW5zaW9uLmhlaWdodCxcbiAgICAgICAgICAgIHJlc3VsdCA9IHt9O1xuICAgICAgICByZXN1bHQubGVmdCA9IGJvdW5kLmxlZnQgKyBhZGRQb3NpdGlvbi5sZWZ0O1xuICAgICAgICByZXN1bHQudG9wID0gYm91bmQudG9wIC0gdG9vbHRpcEhlaWdodCArIGFkZFBvc2l0aW9uLnRvcDtcblxuICAgICAgICBpZiAocG9zaXRpb25PcHRpb24uaW5kZXhPZignbGVmdCcpID4gLTEpIHtcbiAgICAgICAgICAgIHJlc3VsdC5sZWZ0IC09IG1pbnVzV2lkdGggKyBsaW5lR2FwO1xuICAgICAgICB9IGVsc2UgaWYgKHBvc2l0aW9uT3B0aW9uLmluZGV4T2YoJ2NlbnRlcicpID4gLTEpIHtcbiAgICAgICAgICAgIHJlc3VsdC5sZWZ0IC09IG1pbnVzV2lkdGggLyAyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0LmxlZnQgKz0gbGluZUdhcDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwb3NpdGlvbk9wdGlvbi5pbmRleE9mKCdib3R0b20nKSA+IC0xKSB7XG4gICAgICAgICAgICByZXN1bHQudG9wICs9IHRvb2x0aXBIZWlnaHQgKyBsaW5lR2FwO1xuICAgICAgICB9IGVsc2UgaWYgKHBvc2l0aW9uT3B0aW9uLmluZGV4T2YoJ21pZGRsZScpID4gLTEpIHtcbiAgICAgICAgICAgIHJlc3VsdC50b3AgKz0gdG9vbHRpcEhlaWdodCAvIDI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQudG9wIC09IGNoYXJ0Q29uc3QuVE9PTFRJUF9HQVA7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBjYWxjdWxhdGUgdG9vbHRpcCBwb3NpdGlvbiBhYm91dCBiYXIgY2hhcnQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge3tib3VuZDogb2JqZWN0fX0gcGFyYW1zLmRhdGEgZ3JhcGggaW5mb3JtYXRpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gcGFyYW1zLmRpbWVuc2lvbiB0b29sdGlwIGRpbWVuc2lvblxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5wb3NpdGlvbk9wdGlvbiBwb3NpdGlvbiBvcHRpb24gKGV4OiAnbGVmdCB0b3AnKVxuICAgICAqIEByZXR1cm5zIHt7dG9wOiBudW1iZXIsIGxlZnQ6IG51bWJlcn19IHBvc2l0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2FsY3VsYXRlVG9vbHRpcFBvc2l0aW9uQWJvdXRCYXJDaGFydDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBib3VuZCA9IHBhcmFtcy5ib3VuZCxcbiAgICAgICAgICAgIGFkZFBvc2l0aW9uID0gcGFyYW1zLmFkZFBvc2l0aW9uLFxuICAgICAgICAgICAgbWludXNIZWlnaHQgPSBwYXJhbXMuZGltZW5zaW9uLmhlaWdodCAtIChib3VuZC5oZWlnaHQgfHwgMCksXG4gICAgICAgICAgICBwb3NpdGlvbk9wdGlvbiA9IHBhcmFtcy5wb3NpdGlvbk9wdGlvbiB8fCAnJyxcbiAgICAgICAgICAgIHRvb2x0aXBXaWR0aCA9IHBhcmFtcy5kaW1lbnNpb24ud2lkdGgsXG4gICAgICAgICAgICByZXN1bHQgPSB7fTtcblxuICAgICAgICByZXN1bHQubGVmdCA9IGJvdW5kLmxlZnQgKyBib3VuZC53aWR0aCArIGFkZFBvc2l0aW9uLmxlZnQ7XG4gICAgICAgIHJlc3VsdC50b3AgPSBib3VuZC50b3AgKyBhZGRQb3NpdGlvbi50b3A7XG5cbiAgICAgICAgLy8gVE9ETyA6IHBvc2l0aW9uT3B0aW9uc+ydhCDqsJ3ssrTroZwg66eM65Ok7Ja07IScIOqygOyCrO2VmOuPhOuhnSDrs4Dqsr3tlZjquLAgZXgpIHBvc2l0aW9uT3B0aW9uLmxlZnQgPSB0cnVlXG4gICAgICAgIGlmIChwb3NpdGlvbk9wdGlvbi5pbmRleE9mKCdsZWZ0JykgPiAtMSkge1xuICAgICAgICAgICAgcmVzdWx0LmxlZnQgLT0gdG9vbHRpcFdpZHRoO1xuICAgICAgICB9IGVsc2UgaWYgKHBvc2l0aW9uT3B0aW9uLmluZGV4T2YoJ2NlbnRlcicpID4gLTEpIHtcbiAgICAgICAgICAgIHJlc3VsdC5sZWZ0IC09IHRvb2x0aXBXaWR0aCAvIDI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQubGVmdCArPSBjaGFydENvbnN0LlRPT0xUSVBfR0FQO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBvc2l0aW9uT3B0aW9uLmluZGV4T2YoJ3RvcCcpID4gLTEpIHtcbiAgICAgICAgICAgIHJlc3VsdC50b3AgLT0gbWludXNIZWlnaHQ7XG4gICAgICAgIH0gZWxzZSBpZiAocG9zaXRpb25PcHRpb24uaW5kZXhPZignbWlkZGxlJykgPiAtMSkge1xuICAgICAgICAgICAgcmVzdWx0LnRvcCAtPSBtaW51c0hlaWdodCAvIDI7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxjdWxhdGUgdG9vbHRpcCBwb3NpdGlvbi5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gcGFyYW1zLmJvdW5kIGdyYXBoIGJvdW5kXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLmNoYXJ0VHlwZSBjaGFydCB0eXBlXG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5hbGxvd05lZ2F0aXZlVG9vbHRpcCB3aGV0aGVyIGFsbG93IG5lZ2F0aXZlIHRvb2x0aXAgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IHBhcmFtcy5kaW1lbnNpb24gdG9vbHRpcCBkaW1lbnNpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMucG9zaXRpb25PcHRpb24gcG9zaXRpb24gb3B0aW9uIChleDogJ2xlZnQgdG9wJylcbiAgICAgKiBAcmV0dXJucyB7e3RvcDogbnVtYmVyLCBsZWZ0OiBudW1iZXJ9fSBwb3NpdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NhbGN1bGF0ZVRvb2x0aXBQb3NpdGlvbjogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSB7fSxcbiAgICAgICAgICAgIHNpemVUeXBlLCBwb3NpdGlvblR5cGUsIGFkZFBhZGRpbmc7XG5cbiAgICAgICAgaWYgKHBhcmFtcy5ldmVudFBvc2l0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY2FsY3VsYXRlVG9vbHRpcFBvc2l0aW9uQWJvdXRQaWVDaGFydChwYXJhbXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhcmFtcy5jaGFydFR5cGUgPT09IGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9CQVIpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuX2NhbGN1bGF0ZVRvb2x0aXBQb3NpdGlvbkFib3V0QmFyQ2hhcnQocGFyYW1zKTtcbiAgICAgICAgICAgIHNpemVUeXBlID0gJ3dpZHRoJztcbiAgICAgICAgICAgIHBvc2l0aW9uVHlwZSA9ICdsZWZ0JztcbiAgICAgICAgICAgIGFkZFBhZGRpbmcgPSAxO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5fY2FsY3VsYXRlVG9vbHRpcFBvc2l0aW9uQWJvdXROb3RCYXJDaGFydChwYXJhbXMpO1xuICAgICAgICAgICAgc2l6ZVR5cGUgPSAnaGVpZ2h0JztcbiAgICAgICAgICAgIHBvc2l0aW9uVHlwZSA9ICd0b3AnO1xuICAgICAgICAgICAgYWRkUGFkZGluZyA9IC0xO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhcmFtcy5hbGxvd05lZ2F0aXZlVG9vbHRpcCkge1xuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5fbW92ZVRvU3ltbWV0cnkocmVzdWx0LCB7XG4gICAgICAgICAgICAgICAgYm91bmQ6IHBhcmFtcy5ib3VuZCxcbiAgICAgICAgICAgICAgICBpbmRleGVzOiBwYXJhbXMuaW5kZXhlcyxcbiAgICAgICAgICAgICAgICBkaW1lbnNpb246IHBhcmFtcy5kaW1lbnNpb24sXG4gICAgICAgICAgICAgICAgc2l6ZVR5cGU6IHNpemVUeXBlLFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogcG9zaXRpb25UeXBlLFxuICAgICAgICAgICAgICAgIGFkZFBhZGRpbmc6IGFkZFBhZGRpbmdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB2YWx1ZSBieSBpbmRleGVzLlxuICAgICAqIEBwYXJhbSB7e2dyb3VwSW5kZXg6IG51bWJlciwgaW5kZXg6IG51bWJlcn19IGluZGV4ZXMgaW5kZXhlc1xuICAgICAqIEByZXR1cm5zIHsoc3RyaW5nIHwgbnVtYmVyKX0gdmFsdWVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRWYWx1ZUJ5SW5kZXhlczogZnVuY3Rpb24oaW5kZXhlcykge1xuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZXNbaW5kZXhlcy5ncm91cEluZGV4XVtpbmRleGVzLmluZGV4XTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTW92ZSB0byBzeW1tZXRyeS5cbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gcG9zaXRpb24gdG9vbHRpcCBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBwYXJhbXMuYm91bmQgZ3JhcGggYm91bmRcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMuaWQgdG9vbHRpcCBpZFxuICAgICAqICAgICAgQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBwYXJhbXMuZGltZW5zaW9uIHRvb2x0aXAgZGltZW5zaW9uXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLnNpemVUeXBlIHNpemUgdHlwZSAod2lkdGggb3IgaGVpZ2h0KVxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5wb3NpdGlvblR5cGUgcG9zaXRpb24gdHlwZSAobGVmdCBvciB0b3ApXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmFkZFBhZGRpbmcgYWRkIHBhZGRpbmdcbiAgICAgKiBAcmV0dXJucyB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBtb3ZlZCBwb3NpdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21vdmVUb1N5bW1ldHJ5OiBmdW5jdGlvbihwb3NpdGlvbiwgcGFyYW1zKSB7XG4gICAgICAgIHZhciBib3VuZCA9IHBhcmFtcy5ib3VuZCxcbiAgICAgICAgICAgIHNpemVUeXBlID0gcGFyYW1zLnNpemVUeXBlLFxuICAgICAgICAgICAgcG9zaXRpb25UeXBlID0gcGFyYW1zLnBvc2l0aW9uVHlwZSxcbiAgICAgICAgICAgIHZhbHVlID0gdGhpcy5fZ2V0VmFsdWVCeUluZGV4ZXMocGFyYW1zLmluZGV4ZXMpLFxuICAgICAgICAgICAgY2VudGVyO1xuXG4gICAgICAgIGlmICh2YWx1ZSA8IDApIHtcbiAgICAgICAgICAgIGNlbnRlciA9IGJvdW5kW3Bvc2l0aW9uVHlwZV0gKyAoYm91bmRbc2l6ZVR5cGVdIC8gMikgKyAocGFyYW1zLmFkZFBhZGRpbmcgfHwgMCk7XG4gICAgICAgICAgICBwb3NpdGlvbltwb3NpdGlvblR5cGVdID0gcG9zaXRpb25bcG9zaXRpb25UeXBlXSAtIChwb3NpdGlvbltwb3NpdGlvblR5cGVdIC0gY2VudGVyKSAqIDIgLSBwYXJhbXMuZGltZW5zaW9uW3NpemVUeXBlXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwb3NpdGlvbjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHRvb2x0aXAgaWQuXG4gICAgICogQHJldHVybnMge3N0cmluZ30gdG9vbHRpcCBpZFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFRvb2x0aXBJZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghdGhpcy50b29sdGlwSWQpIHtcbiAgICAgICAgICAgIHRoaXMudG9vbHRpcElkID0gY2hhcnRDb25zdC5UT09MVElQX0lEX1BSRUZJWCArICctJyArIChuZXcgRGF0ZSgpKS5nZXRUaW1lKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMudG9vbHRpcElkO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHRvb2x0aXAgaHRtbC5cbiAgICAgKiBAcGFyYW0ge3tncm91cEluZGV4OiBudW1iZXIsIGluZGV4OiBudW1iZXJ9fSBpbmRleGVzIGluZGV4ZXNcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSB0b29sdGlwIGh0bWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlVG9vbHRpcEh0bWw6IGZ1bmN0aW9uKGluZGV4ZXMpIHtcbiAgICAgICAgdmFyIGRhdGEgPSB0aGlzLmRhdGFbaW5kZXhlcy5ncm91cEluZGV4XVtpbmRleGVzLmluZGV4XTtcbiAgICAgICAgZGF0YS5zdWZmaXggPSB0aGlzLnN1ZmZpeDtcbiAgICAgICAgcmV0dXJuIHRoaXMudHBsVG9vbHRpcChkYXRhKTtcbiAgICB9LFxuXG4gICAgX2lzQ2hhbmdlZEluZGV4ZXM6IGZ1bmN0aW9uKHByZXZJbmRleGVzLCBpbmRleGVzKSB7XG4gICAgICAgIHJldHVybiAhIXByZXZJbmRleGVzICYmIChwcmV2SW5kZXhlcy5ncm91cEluZGV4ICE9PSBpbmRleGVzLmdyb3VwSW5kZXggfHwgcHJldkluZGV4ZXMuaW5kZXggIT09IGluZGV4ZXMuaW5kZXgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTaG93IHRvb2x0aXAuXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxUb29sdGlwIHRvb2x0aXAgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7e2luZGV4ZXM6IHtncm91cEluZGV4OiBudW1iZXIsIGluZGV4OiBudW1iZXJ9LCBib3VuZDogb2JqZWN0fX0gcGFyYW1zIHRvb2x0aXAgZGF0YVxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBwcmV2UG9zaXRpb24gcHJldiBwb3NpdGlvblxuICAgICAqL1xuICAgIHNob3dUb29sdGlwOiBmdW5jdGlvbihlbFRvb2x0aXAsIHBhcmFtcywgcHJldlBvc2l0aW9uKSB7XG4gICAgICAgIHZhciBpbmRleGVzID0gcGFyYW1zLmluZGV4ZXMsXG4gICAgICAgICAgICBjdXJJbmRleGVzID0gdGhpcy5fZ2V0SW5kZXhlc0N1c3RvbUF0dHJpYnV0ZShlbFRvb2x0aXApLFxuICAgICAgICAgICAgcG9zaXRpb247XG5cbiAgICAgICAgaWYgKGVsVG9vbHRpcC5pZCA9PT0gdGhpcy5fZ2V0VG9vbHRpcElkKCkgJiYgdGhpcy5faXNDaGFuZ2VkSW5kZXhlcyhjdXJJbmRleGVzLCBpbmRleGVzKSkge1xuICAgICAgICAgICAgdGhpcy5fZmlyZUhpZGVBbmltYXRpb24oY3VySW5kZXhlcyk7XG4gICAgICAgIH1cblxuICAgICAgICBlbFRvb2x0aXAuaWQgPSB0aGlzLl9nZXRUb29sdGlwSWQoKTtcbiAgICAgICAgZWxUb29sdGlwLmlubmVySFRNTCA9IHRoaXMuX21ha2VUb29sdGlwSHRtbChpbmRleGVzKTtcblxuICAgICAgICB0aGlzLl9zZXRJbmRleGVzQ3VzdG9tQXR0cmlidXRlKGVsVG9vbHRpcCwgaW5kZXhlcyk7XG4gICAgICAgIHRoaXMuX3NldFNob3dlZEN1c3RvbUF0dHJpYnV0ZShlbFRvb2x0aXAsIHRydWUpO1xuXG4gICAgICAgIGRvbS5hZGRDbGFzcyhlbFRvb2x0aXAsICdzaG93Jyk7XG5cbiAgICAgICAgcG9zaXRpb24gPSB0aGlzLl9jYWxjdWxhdGVUb29sdGlwUG9zaXRpb24odHVpLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgIGRpbWVuc2lvbjogdGhpcy5nZXRUb29sdGlwRGltZW5zaW9uKGVsVG9vbHRpcCksXG4gICAgICAgICAgICBhZGRQb3NpdGlvbjogdHVpLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgICAgICAgIHRvcDogMFxuICAgICAgICAgICAgfSwgdGhpcy5vcHRpb25zLmFkZFBvc2l0aW9uKSxcbiAgICAgICAgICAgIHBvc2l0aW9uT3B0aW9uOiB0aGlzLm9wdGlvbnMucG9zaXRpb24gfHwgJycsXG4gICAgICAgICAgICBldmVudFBvc2l0aW9uOiBwYXJhbXMuZXZlbnRQb3NpdGlvblxuICAgICAgICB9LCBwYXJhbXMpKTtcblxuICAgICAgICB0aGlzLm1vdmVUb1Bvc2l0aW9uKGVsVG9vbHRpcCwgcG9zaXRpb24sIHByZXZQb3NpdGlvbik7XG4gICAgICAgIHRoaXMuX2ZpcmVTaG93QW5pbWF0aW9uKGluZGV4ZXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBIaWRlIHRvb2x0aXAuXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxUb29sdGlwIHRvb2x0aXAgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIGNhbGxiYWNrXG4gICAgICovXG4gICAgaGlkZVRvb2x0aXA6IGZ1bmN0aW9uKGVsVG9vbHRpcCkge1xuICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICBpbmRleGVzID0gdGhpcy5fZ2V0SW5kZXhlc0N1c3RvbUF0dHJpYnV0ZShlbFRvb2x0aXApO1xuICAgICAgICB0aGlzLl9zZXRTaG93ZWRDdXN0b21BdHRyaWJ1dGUoZWxUb29sdGlwLCBmYWxzZSk7XG4gICAgICAgIHRoaXMuX2ZpcmVIaWRlQW5pbWF0aW9uKGluZGV4ZXMpO1xuXG4gICAgICAgIGlmICh0aGlzLl9pc0NoYW5nZWRJbmRleGVzKHRoaXMucHJldkluZGV4ZXMsIGluZGV4ZXMpKSB7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5wcmV2SW5kZXhlcztcbiAgICAgICAgfVxuXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAodGhhdC5faXNTaG93ZWRUb29sdGlwKGVsVG9vbHRpcCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGF0LmhpZGVBbmltYXRpb24oZWxUb29sdGlwKTtcblxuICAgICAgICAgICAgdGhhdCA9IG51bGw7XG4gICAgICAgICAgICBpbmRleGVzID0gbnVsbDtcbiAgICAgICAgfSwgY2hhcnRDb25zdC5ISURFX0RFTEFZKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGV2ZW50XG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKi9cbiAgICBhdHRhY2hFdmVudDogZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgZXZlbnQuYmluZEV2ZW50KCdtb3VzZW92ZXInLCBlbCwgdHVpLnV0aWwuYmluZCh0aGlzLm9uTW91c2VvdmVyLCB0aGlzKSk7XG4gICAgICAgIGV2ZW50LmJpbmRFdmVudCgnbW91c2VvdXQnLCBlbCwgdHVpLnV0aWwuYmluZCh0aGlzLm9uTW91c2VvdXQsIHRoaXMpKTtcbiAgICB9XG59KTtcblxudHVpLnV0aWwuQ3VzdG9tRXZlbnRzLm1peGluKFRvb2x0aXApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRvb2x0aXA7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgVG9vbHRpcEJhc2UgaXMgYmFzZSBjbGFzcyBvZiB0b29sdGlwIGNvbXBvbmVudHMuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBkb20gPSByZXF1aXJlKCcuLi9oZWxwZXJzL2RvbUhhbmRsZXInKSxcbiAgICByZW5kZXJVdGlsID0gcmVxdWlyZSgnLi4vaGVscGVycy9yZW5kZXJVdGlsJyk7XG5cbnZhciBUb29sdGlwQmFzZSA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgVG9vbHRpcEJhc2UucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBUb29sdGlwQmFzZSBpcyBiYXNlIGNsYXNzIG9mIHRvb2x0aXAgY29tcG9uZW50cy5cbiAgICAgKiBAY29uc3RydWN0cyBUb29sdGlwQmFzZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48bnVtYmVyPn0gcGFyYW1zLnZhbHVlcyBjb252ZXJ0ZWQgdmFsdWVzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5fSBwYXJhbXMubGFiZWxzIGxhYmVsc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheX0gcGFyYW1zLmxlZ2VuZExhYmVscyBsZWdlbmQgbGFiZWxzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmJvdW5kIGF4aXMgYm91bmRcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgYXhpcyB0aGVtZVxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB0dWkudXRpbC5leHRlbmQodGhpcywgcGFyYW1zKTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGNsYXNzTmFtZVxuICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jbGFzc05hbWUgPSAndHVpLWNoYXJ0LXRvb2x0aXAtYXJlYSc7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRvb2x0aXBCYXNlIGNvbnRhaW5lci5cbiAgICAgICAgICogQHR5cGUge0hUTUxFbGVtZW50fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5lbExheW91dCA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRvb2x0aXBCYXNlIGJhc2UgZGF0YS5cbiAgICAgICAgICogQHR5cGUge2FycmF5LjxhcnJheS48b2JqZWN0Pj59XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmRhdGEgPSB0aGlzLm1ha2VUb29sdGlwRGF0YSgpO1xuXG4gICAgICAgIHRoaXMuc3VmZml4ID0gdGhpcy5vcHRpb25zLnN1ZmZpeCA/ICcmbmJzcDsnICsgdGhpcy5vcHRpb25zLnN1ZmZpeCA6ICcnO1xuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgdG9vbHRpcCBkYXRhLlxuICAgICAqIEBhYnN0cmFjdFxuICAgICAqL1xuICAgIG1ha2VUb29sdGlwRGF0YTogZnVuY3Rpb24oKSB7fSxcblxuICAgIC8qKlxuICAgICAqIEdldCB0b29sdGlwIGxheW91dCBlbGVtZW50LlxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gbGF5b3V0IGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRUb29sdGlwTGF5b3V0RWxlbWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBlbExheW91dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuY2hhcnRJZCk7XG4gICAgICAgIGlmICghZWxMYXlvdXQpIHtcbiAgICAgICAgICAgIGVsTGF5b3V0ID0gZG9tLmNyZWF0ZSgnRElWJywgdGhpcy5jbGFzc05hbWUpO1xuICAgICAgICAgICAgZWxMYXlvdXQuaWQgPSB0aGlzLmNoYXJ0SWQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVsTGF5b3V0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgdG9vbHRpcC5cbiAgICAgKiBAcGFyYW0ge3twb3NpdGlvbjogb2JqZWN0fX0gYm91bmQgdG9vbHRpcCBib3VuZFxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gdG9vbHRpcCBlbGVtZW50XG4gICAgICovXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGVsID0gdGhpcy5fZ2V0VG9vbHRpcExheW91dEVsZW1lbnQoKSxcbiAgICAgICAgICAgIGJvdW5kID0gdGhpcy5ib3VuZDtcblxuICAgICAgICByZW5kZXJVdGlsLnJlbmRlclBvc2l0aW9uKGVsLCBib3VuZC5wb3NpdGlvbik7XG5cbiAgICAgICAgdGhpcy5lbExheW91dCA9IGVsO1xuXG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIHRvb2x0aXAgZWxlbWVudC5cbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHRvb2x0aXAgZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NyZWF0ZVRvb2x0aXBFbGVtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGVsVG9vbHRpcDtcbiAgICAgICAgaWYgKCF0aGlzLmVsTGF5b3V0LmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgICAgIGVsVG9vbHRpcCA9IGRvbS5jcmVhdGUoJ0RJVicsICd0dWktY2hhcnQtdG9vbHRpcCcpO1xuICAgICAgICAgICAgZG9tLmFwcGVuZCh0aGlzLmVsTGF5b3V0LCBlbFRvb2x0aXApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZWxUb29sdGlwID0gdGhpcy5lbExheW91dC5maXJzdENoaWxkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbFRvb2x0aXA7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB0b29sdGlwIGVsZW1lbnQuXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSB0b29sdGlwIGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRUb29sdGlwRWxlbWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghdGhpcy5lbFRvb2x0aXApIHtcbiAgICAgICAgICAgIHRoaXMuZWxUb29sdGlwID0gdGhpcy5fY3JlYXRlVG9vbHRpcEVsZW1lbnQoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5lbFRvb2x0aXA7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9uU2hvdyBpcyBjYWxsYmFjayBvZiBjdXN0b20gZXZlbnQgc2hvd1Rvb2x0aXAgZm9yIFNlcmllc1ZpZXcuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBjb29yZGluYXRlIGV2ZW50IHBhcmFtZXRlcnNcbiAgICAgKi9cbiAgICBvblNob3c6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgZWxUb29sdGlwID0gdGhpcy5fZ2V0VG9vbHRpcEVsZW1lbnQoKSxcbiAgICAgICAgICAgIHByZXZQb3NpdGlvbjtcbiAgICAgICAgaWYgKGVsVG9vbHRpcC5vZmZzZXRXaWR0aCkge1xuICAgICAgICAgICAgcHJldlBvc2l0aW9uID0ge1xuICAgICAgICAgICAgICAgIGxlZnQ6IGVsVG9vbHRpcC5vZmZzZXRMZWZ0LFxuICAgICAgICAgICAgICAgIHRvcDogZWxUb29sdGlwLm9mZnNldFRvcFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2hvd1Rvb2x0aXAoZWxUb29sdGlwLCBwYXJhbXMsIHByZXZQb3NpdGlvbik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB0b29sdGlwIGRpbWVuc2lvblxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsVG9vbHRpcCB0b29sdGlwIGVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gcmVuZGVyZWQgdG9vbHRpcCBkaW1lbnNpb25cbiAgICAgKi9cbiAgICBnZXRUb29sdGlwRGltZW5zaW9uOiBmdW5jdGlvbihlbFRvb2x0aXApIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHdpZHRoOiBlbFRvb2x0aXAub2Zmc2V0V2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IGVsVG9vbHRpcC5vZmZzZXRIZWlnaHRcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FuY2VsIGhpZGUgdG9vbHRpcC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jYW5jZWxIaWRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCF0aGlzLmFjdGl2ZUhpZGVyKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLmFjdGl2ZUhpZGVyLnRpbWVySWQpO1xuICAgICAgICB0aGlzLmFjdGl2ZUhpZGVyLnNldE9wYWNpdHkoMSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbmNlbCBzbGlkZSB0b29sdGlwLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NhbmNlbFNsaWRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCF0aGlzLmFjdGl2ZVNsaWRlcnMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHR1aS51dGlsLmZvckVhY2godGhpcy5hY3RpdmVTbGlkZXJzLCBmdW5jdGlvbihzbGlkZXIpIHtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoc2xpZGVyLnRpbWVySWQpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLl9jb21wbGV0ZVNsaWRlKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1vdmUgdG8gUG9zaXRpb24uXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxUb29sdGlwIHRvb2x0aXAgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBwb3NpdGlvbiBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBwcmV2UG9zaXRpb24gcHJldiBwb3NpdGlvblxuICAgICAqL1xuICAgIG1vdmVUb1Bvc2l0aW9uOiBmdW5jdGlvbihlbFRvb2x0aXAsIHBvc2l0aW9uLCBwcmV2UG9zaXRpb24pIHtcbiAgICAgICAgaWYgKHByZXZQb3NpdGlvbikge1xuICAgICAgICAgICAgdGhpcy5fY2FuY2VsSGlkZSgpO1xuICAgICAgICAgICAgdGhpcy5fY2FuY2VsU2xpZGUoKTtcbiAgICAgICAgICAgIHRoaXMuX3NsaWRlVG9vbHRpcChlbFRvb2x0aXAsIHByZXZQb3NpdGlvbiwgcG9zaXRpb24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJQb3NpdGlvbihlbFRvb2x0aXAsIHBvc2l0aW9uKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgc2xpZGVyLlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIHNsaWRlIHR5cGUgKGhvcml6b250YWwgb3IgdmVydGljYWwpXG4gICAgICogQHJldHVybnMge29iamVjdH0gZWZmZWN0IG9iamVjdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFNsaWRlcjogZnVuY3Rpb24oZWxlbWVudCwgdHlwZSkge1xuICAgICAgICBpZiAoIXRoaXMuc2xpZGVyKSB7XG4gICAgICAgICAgICB0aGlzLnNsaWRlciA9IHt9O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLnNsaWRlclt0eXBlXSkge1xuICAgICAgICAgICAgdGhpcy5zbGlkZXJbdHlwZV0gPSBuZXcgdHVpLmNvbXBvbmVudC5FZmZlY3RzLlNsaWRlKHtcbiAgICAgICAgICAgICAgICBmbG93OiB0eXBlLFxuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IGVsZW1lbnQsXG4gICAgICAgICAgICAgICAgZHVyYXRpb246IDEwMFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuc2xpZGVyW3R5cGVdO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDb21wbGV0ZSBzbGlkZSB0b29sdGlwLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NvbXBsZXRlU2xpZGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICBkZWxldGUgdGhpcy5hY3RpdmVTbGlkZXJzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTbGlkZSB0b29sdGlwXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxUb29sdGlwIHRvb2x0aXAgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBwcmV2UG9zaXRpb24gcHJldiBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBwb3NpdGlvbiBwb3NpdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NsaWRlVG9vbHRpcDogZnVuY3Rpb24oZWxUb29sdGlwLCBwcmV2UG9zaXRpb24sIHBvc2l0aW9uKSB7XG4gICAgICAgIHZhciB2U2xpZGVyID0gdGhpcy5fZ2V0U2xpZGVyKGVsVG9vbHRpcCwgJ3ZlcnRpY2FsJyksXG4gICAgICAgICAgICBoU2xpZGVyID0gdGhpcy5fZ2V0U2xpZGVyKGVsVG9vbHRpcCwgJ2hvcml6b250YWwnKSxcbiAgICAgICAgICAgIG1vdmVUb3AgPSBwcmV2UG9zaXRpb24udG9wIC0gcG9zaXRpb24udG9wLFxuICAgICAgICAgICAgbW92ZUxlZnQgPSBwcmV2UG9zaXRpb24ubGVmdCAtIHBvc2l0aW9uLmxlZnQsXG4gICAgICAgICAgICB2RGlyZWN0aW9uID0gbW92ZVRvcCA+IDAgPyAnZm9yd29yZCcgOiAnYmFja3dvcmQnLFxuICAgICAgICAgICAgaERpcmVjdGlvbiA9IG1vdmVUb3AgPiAwID8gJ2ZvcndvcmQnIDogJ2JhY2t3b3JkJyxcbiAgICAgICAgICAgIGFjdGl2ZVNsaWRlcnMgPSBbXSxcbiAgICAgICAgICAgIGNvbXBsYXRlID0gdHVpLnV0aWwuYmluZCh0aGlzLl9jb21wbGV0ZVNsaWRlLCB0aGlzKTtcblxuICAgICAgICBpZiAobW92ZVRvcCkge1xuICAgICAgICAgICAgdlNsaWRlci5zZXREaXN0YW5jZShtb3ZlVG9wKTtcbiAgICAgICAgICAgIHZTbGlkZXIuYWN0aW9uKHtcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb246IHZEaXJlY3Rpb24sXG4gICAgICAgICAgICAgICAgc3RhcnQ6IHByZXZQb3NpdGlvbi50b3AsXG4gICAgICAgICAgICAgICAgY29tcGxldGU6IGNvbXBsYXRlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGFjdGl2ZVNsaWRlcnMucHVzaCh2U2xpZGVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtb3ZlTGVmdCkge1xuICAgICAgICAgICAgaFNsaWRlci5zZXREaXN0YW5jZShtb3ZlTGVmdCk7XG4gICAgICAgICAgICBoU2xpZGVyLmFjdGlvbih7XG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uOiBoRGlyZWN0aW9uLFxuICAgICAgICAgICAgICAgIHN0YXJ0OiBwcmV2UG9zaXRpb24ubGVmdCxcbiAgICAgICAgICAgICAgICBjb21wbGV0ZTogY29tcGxhdGVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYWN0aXZlU2xpZGVycy5wdXNoKHZTbGlkZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGFjdGl2ZVNsaWRlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZVNsaWRlcnMgPSBhY3RpdmVTbGlkZXJzO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9uSGlkZSBpcyBjYWxsYmFjayBvZiBjdXN0b20gZXZlbnQgaGlkZVRvb2x0aXAgZm9yIFNlcmllc1ZpZXdcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggaW5kZXhcbiAgICAgKi9cbiAgICBvbkhpZGU6IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAgIHZhciBlbFRvb2x0aXAgPSB0aGlzLl9nZXRUb29sdGlwRWxlbWVudCgpO1xuICAgICAgICB0aGlzLmhpZGVUb29sdGlwKGVsVG9vbHRpcCwgaW5kZXgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgaGlkZXIuXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCBlbGVtZW50XG4gICAgICogQHJldHVybnMge29iamVjdH0gZWZmZWN0IG9iamVjdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldEhpZGVyOiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgIGlmICghdGhpcy5oaWRlcikge1xuICAgICAgICAgICAgdGhpcy5oaWRlciA9IG5ldyB0dWkuY29tcG9uZW50LkVmZmVjdHMuRmFkZSh7XG4gICAgICAgICAgICAgICAgZWxlbWVudDogZWxlbWVudCxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogMTAwXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmhpZGVyO1xuICAgIH0sXG5cbiAgICBoaWRlQW5pbWF0aW9uOiBmdW5jdGlvbihlbFRvb2x0aXApIHtcbiAgICAgICAgdGhpcy5hY3RpdmVIaWRlciA9IHRoaXMuX2dldEhpZGVyKGVsVG9vbHRpcCk7XG4gICAgICAgIHRoaXMuYWN0aXZlSGlkZXIuYWN0aW9uKHtcbiAgICAgICAgICAgIHN0YXJ0OiAxLFxuICAgICAgICAgICAgZW5kOiAwLFxuICAgICAgICAgICAgY29tcGxldGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGRvbS5yZW1vdmVDbGFzcyhlbFRvb2x0aXAsICdzaG93Jyk7XG4gICAgICAgICAgICAgICAgZWxUb29sdGlwLnN0eWxlLmNzc1RleHQgPSAnJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5cbnR1aS51dGlsLkN1c3RvbUV2ZW50cy5taXhpbihUb29sdGlwQmFzZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVG9vbHRpcEJhc2U7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgVGhpcyBpcyB0ZW1wbGF0ZXMgb2YgdG9vbHRpcC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbnZhciB0ZW1wbGF0ZU1ha2VyID0gcmVxdWlyZSgnLi4vaGVscGVycy90ZW1wbGF0ZU1ha2VyJyk7XG5cbnZhciB0YWdzID0ge1xuICAgIEhUTUxfREVGQVVMVF9URU1QTEFURTogJzxkaXYgY2xhc3M9XCJ0dWktY2hhcnQtZGVmYXVsdC10b29sdGlwXCI+JyArXG4gICAgICAgICc8ZGl2Pnt7IGNhdGVnb3J5IH19PC9kaXY+JyArXG4gICAgICAgICc8ZGl2PicgK1xuICAgICAgICAgICAgJzxzcGFuPnt7IGxlZ2VuZCB9fTwvc3Bhbj46JyArXG4gICAgICAgICAgICAnJm5ic3A7PHNwYW4+e3sgdmFsdWUgfX08L3NwYW4+JyArXG4gICAgICAgICAgICAnPHNwYW4+e3sgc3VmZml4IH19PC9zcGFuPicgK1xuICAgICAgICAnPC9kaXY+JyArXG4gICAgJzwvZGl2PicsXG4gICAgSFRNTF9HUk9VUDogJzxkaXYgY2xhc3M9XCJ0dWktY2hhcnQtZGVmYXVsdC10b29sdGlwIHR1aS1jaGFydC1ncm91cC10b29sdGlwXCI+JyArXG4gICAgICAgICc8ZGl2Pnt7IGNhdGVnb3J5IH19PC9kaXY+JyArXG4gICAgICAgICd7eyBpdGVtcyB9fScgK1xuICAgICc8L2Rpdj4nLFxuICAgIEhUTUxfR1JPVVBfSVRFTTogJzxkaXY+JyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwidHVpLWNoYXJ0LWxlZ2VuZC1yZWN0IHt7IGNoYXJ0VHlwZSB9fVwiIHN0eWxlPVwie3sgY3NzVGV4dCB9fVwiPjwvZGl2PiZuYnNwOzxzcGFuPnt7IGxlZ2VuZCB9fTwvc3Bhbj46JyArXG4gICAgICAgICcmbmJzcDs8c3Bhbj57eyB2YWx1ZSB9fTwvc3Bhbj4nICtcbiAgICAgICAgJzxzcGFuPnt7IHN1ZmZpeCB9fTwvc3Bhbj4nICtcbiAgICAnPC9kaXY+JyxcbiAgICBHUk9VUF9DU1NfVEVYVDogJ2JhY2tncm91bmQtY29sb3I6e3sgY29sb3IgfX0nXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICB0cGxEZWZhdWx0OiB0ZW1wbGF0ZU1ha2VyLnRlbXBsYXRlKHRhZ3MuSFRNTF9ERUZBVUxUX1RFTVBMQVRFKSxcbiAgICB0cGxHcm91cDogdGVtcGxhdGVNYWtlci50ZW1wbGF0ZSh0YWdzLkhUTUxfR1JPVVApLFxuICAgIHRwbEdyb3VwSXRlbTogdGVtcGxhdGVNYWtlci50ZW1wbGF0ZSh0YWdzLkhUTUxfR1JPVVBfSVRFTSksXG4gICAgdHBsR3JvdXBDc3NUZXh0OiB0ZW1wbGF0ZU1ha2VyLnRlbXBsYXRlKHRhZ3MuR1JPVVBfQ1NTX1RFWFQpXG59O1xuIl19
