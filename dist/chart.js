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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXhlcy9heGlzLmpzIiwic3JjL2pzL2F4ZXMvYXhpc1RlbXBsYXRlLmpzIiwic3JjL2pzL2NoYXJ0LmpzIiwic3JjL2pzL2NoYXJ0cy9hcmVhQ2hhcnQuanMiLCJzcmMvanMvY2hhcnRzL2F4aXNUeXBlTWl4ZXIuanMiLCJzcmMvanMvY2hhcnRzL2JhckNoYXJ0LmpzIiwic3JjL2pzL2NoYXJ0cy9jaGFydEJhc2UuanMiLCJzcmMvanMvY2hhcnRzL2NvbHVtbkNoYXJ0LmpzIiwic3JjL2pzL2NoYXJ0cy9jb21ib0NoYXJ0LmpzIiwic3JjL2pzL2NoYXJ0cy9saW5lQ2hhcnQuanMiLCJzcmMvanMvY2hhcnRzL2xpbmVUeXBlTWl4ZXIuanMiLCJzcmMvanMvY2hhcnRzL3BpZUNoYXJ0LmpzIiwic3JjL2pzL2NoYXJ0cy92ZXJ0aWNhbFR5cGVNaXhlci5qcyIsInNyYy9qcy9jb2RlLXNuaXBwZXQtdXRpbC5qcyIsInNyYy9qcy9jb25zdC5qcyIsInNyYy9qcy9ldmVudEhhbmRsZUxheWVycy9ldmVudEhhbmRsZUxheWVyQmFzZS5qcyIsInNyYy9qcy9ldmVudEhhbmRsZUxheWVycy9ncm91cGVkRXZlbnRIYW5kbGVMYXllci5qcyIsInNyYy9qcy9ldmVudEhhbmRsZUxheWVycy9saW5lVHlwZUV2ZW50SGFuZGxlTGF5ZXIuanMiLCJzcmMvanMvZmFjdG9yaWVzL2NoYXJ0RmFjdG9yeS5qcyIsInNyYy9qcy9mYWN0b3JpZXMvcGx1Z2luRmFjdG9yeS5qcyIsInNyYy9qcy9mYWN0b3JpZXMvdGhlbWVGYWN0b3J5LmpzIiwic3JjL2pzL2hlbHBlcnMvYXhpc0RhdGFNYWtlci5qcyIsInNyYy9qcy9oZWxwZXJzL2JvdW5kc01ha2VyLmpzIiwic3JjL2pzL2hlbHBlcnMvY2FsY3VsYXRvci5qcyIsInNyYy9qcy9oZWxwZXJzL2RhdGFDb252ZXJ0ZXIuanMiLCJzcmMvanMvaGVscGVycy9kb21IYW5kbGVyLmpzIiwic3JjL2pzL2hlbHBlcnMvZXZlbnRMaXN0ZW5lci5qcyIsInNyYy9qcy9oZWxwZXJzL3JlbmRlclV0aWwuanMiLCJzcmMvanMvaGVscGVycy9zdGF0ZS5qcyIsInNyYy9qcy9oZWxwZXJzL3RlbXBsYXRlTWFrZXIuanMiLCJzcmMvanMvbGVnZW5kcy9sZWdlbmQuanMiLCJzcmMvanMvbGVnZW5kcy9sZWdlbmRUZW1wbGF0ZS5qcyIsInNyYy9qcy9wbG90cy9wbG90LmpzIiwic3JjL2pzL3Bsb3RzL3Bsb3RUZW1wbGF0ZS5qcyIsInNyYy9qcy9wbHVnaW5zL3BsdWdpblJhcGhhZWwuanMiLCJzcmMvanMvcGx1Z2lucy9yYXBoYWVsQXJlYUNoYXJ0LmpzIiwic3JjL2pzL3BsdWdpbnMvcmFwaGFlbEJhckNoYXJ0LmpzIiwic3JjL2pzL3BsdWdpbnMvcmFwaGFlbExpbmVDaGFydC5qcyIsInNyYy9qcy9wbHVnaW5zL3JhcGhhZWxMaW5lVHlwZUJhc2UuanMiLCJzcmMvanMvcGx1Z2lucy9yYXBoYWVsUGllQ2hhcnQuanMiLCJzcmMvanMvcGx1Z2lucy9yYXBoYWVsUmVuZGVyVXRpbC5qcyIsInNyYy9qcy9yZWdpc3RlckNoYXJ0cy5qcyIsInNyYy9qcy9yZWdpc3RlclRoZW1lcy5qcyIsInNyYy9qcy9zZXJpZXMvYXJlYUNoYXJ0U2VyaWVzLmpzIiwic3JjL2pzL3Nlcmllcy9iYXJDaGFydFNlcmllcy5qcyIsInNyYy9qcy9zZXJpZXMvYmFyVHlwZVNlcmllc0Jhc2UuanMiLCJzcmMvanMvc2VyaWVzL2NvbHVtbkNoYXJ0U2VyaWVzLmpzIiwic3JjL2pzL3Nlcmllcy9saW5lQ2hhcnRTZXJpZXMuanMiLCJzcmMvanMvc2VyaWVzL2xpbmVUeXBlU2VyaWVzQmFzZS5qcyIsInNyYy9qcy9zZXJpZXMvcGllQ2hhcnRTZXJpZXMuanMiLCJzcmMvanMvc2VyaWVzL3Nlcmllcy5qcyIsInNyYy9qcy9zZXJpZXMvc2VyaWVzVGVtcGxhdGUuanMiLCJzcmMvanMvdGhlbWVzL2RlZmF1bHRUaGVtZS5qcyIsInNyYy9qcy90b29sdGlwcy9ncm91cFRvb2x0aXAuanMiLCJzcmMvanMvdG9vbHRpcHMvdG9vbHRpcC5qcyIsInNyYy9qcy90b29sdGlwcy90b29sdGlwQmFzZS5qcyIsInNyYy9qcy90b29sdGlwcy90b29sdGlwVGVtcGxhdGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6YkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcm5CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25YQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcHNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDelVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Y0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOWRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3ICBBeGlzIGNvbXBvbmVudC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGRvbSA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZG9tSGFuZGxlcicpLFxuICAgIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuLi9jb25zdCcpLFxuICAgIGNhbGN1bGF0b3IgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2NhbGN1bGF0b3InKSxcbiAgICByZW5kZXJVdGlsID0gcmVxdWlyZSgnLi4vaGVscGVycy9yZW5kZXJVdGlsJyksXG4gICAgYXhpc1RlbXBsYXRlID0gcmVxdWlyZSgnLi9heGlzVGVtcGxhdGUnKTtcblxudmFyIEF4aXMgPSB0dWkudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIEF4aXMucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBBeGlzIGNvbXBvbmVudC5cbiAgICAgKiBAY29uc3RydWN0cyBBeGlzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge3tcbiAgICAgKiAgICAgICAgICBsYWJlbHM6IGFycmF5LjxzdHJpbmc+LFxuICAgICAqICAgICAgICAgIHRpY2tDb3VudDogbnVtYmVyLFxuICAgICAqICAgICAgICAgIGlzTGFiZWxBeGlzOiBib29sZWFuLFxuICAgICAqICAgICAgICAgIGlzVmVydGljYWw6IGJvb2xlYW5cbiAgICAgKiAgICAgIH19IHBhcmFtcy5kYXRhIGF4aXMgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5ib3VuZCBheGlzIGJvdW5kXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIGF4aXMgdGhlbWVcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMub3B0aW9ucyBheGlzIG9wdGlvbnNcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdHVpLnV0aWwuZXh0ZW5kKHRoaXMsIHBhcmFtcyk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBeGlzIHZpZXcgY2xhc3NOYW1lXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNsYXNzTmFtZSA9ICd0dWktY2hhcnQtYXhpcy1hcmVhJztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGF4aXMuXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSBheGlzIGFyZWEgYmFzZSBlbGVtZW50XG4gICAgICovXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGRhdGEgPSB0aGlzLmRhdGEsXG4gICAgICAgICAgICB0aGVtZSA9IHRoaXMudGhlbWUsXG4gICAgICAgICAgICBpc1ZlcnRpY2FsID0gISFkYXRhLmlzVmVydGljYWwsXG4gICAgICAgICAgICBpc1Bvc2l0aW9uUmlnaHQgPSBkYXRhLmlzUG9zaXRpb25SaWdodCxcbiAgICAgICAgICAgIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnMsXG4gICAgICAgICAgICBib3VuZCA9IHRoaXMuYm91bmQsXG4gICAgICAgICAgICBkaW1lbnNpb24gPSBib3VuZC5kaW1lbnNpb24sXG4gICAgICAgICAgICBzaXplID0gaXNWZXJ0aWNhbCA/IGRpbWVuc2lvbi5oZWlnaHQgOiBkaW1lbnNpb24ud2lkdGgsXG4gICAgICAgICAgICBlbCA9IGRvbS5jcmVhdGUoJ0RJVicsIHRoaXMuY2xhc3NOYW1lKSxcbiAgICAgICAgICAgIGVsVGl0bGVBcmVhID0gdGhpcy5fcmVuZGVyVGl0bGVBcmVhKHtcbiAgICAgICAgICAgICAgICB0aXRsZTogb3B0aW9ucy50aXRsZSxcbiAgICAgICAgICAgICAgICB0aGVtZTogdGhlbWUudGl0bGUsXG4gICAgICAgICAgICAgICAgaXNWZXJ0aWNhbDogaXNWZXJ0aWNhbCxcbiAgICAgICAgICAgICAgICBpc1Bvc2l0aW9uUmlnaHQ6IGlzUG9zaXRpb25SaWdodCxcbiAgICAgICAgICAgICAgICBzaXplOiBzaXplXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGVsTGFiZWxBcmVhID0gdGhpcy5fcmVuZGVyTGFiZWxBcmVhKHNpemUsIGRpbWVuc2lvbi53aWR0aCwgYm91bmQuZGVncmVlKSxcbiAgICAgICAgICAgIGVsVGlja0FyZWE7XG5cbiAgICAgICAgaWYgKCF0aGlzLmFsaWduZWQgfHwgIWlzVmVydGljYWwpIHtcbiAgICAgICAgICAgIGVsVGlja0FyZWEgPSB0aGlzLl9yZW5kZXJUaWNrQXJlYShzaXplKTtcbiAgICAgICAgfVxuICAgICAgICByZW5kZXJVdGlsLnJlbmRlckRpbWVuc2lvbihlbCwgZGltZW5zaW9uKTtcbiAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJQb3NpdGlvbihlbCwgYm91bmQucG9zaXRpb24pO1xuICAgICAgICBkb20uYWRkQ2xhc3MoZWwsIGlzVmVydGljYWwgPyAndmVydGljYWwnIDogJ2hvcml6b250YWwnKTtcbiAgICAgICAgZG9tLmFkZENsYXNzKGVsLCBpc1Bvc2l0aW9uUmlnaHQgPyAncmlnaHQnIDogJycpO1xuICAgICAgICBkb20uYXBwZW5kKGVsLCBbZWxUaXRsZUFyZWEsIGVsVGlja0FyZWEsIGVsTGFiZWxBcmVhXSk7XG5cbiAgICAgICAgcmV0dXJuIGVsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgY3NzIHN0eWxlIG9mIHRpdGxlIGFyZWFcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbFRpdGxlQXJlYSB0aXRsZSBlbGVtZW50XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHNpemUgKHdpZHRoIG9yIGhlaWdodClcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzUG9zaXRpb25SaWdodCB3aGV0aGVyIHJpZ2h0IHBvc2l0aW9uIG9yIG5vdD9cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJUaXRsZUFyZWFTdHlsZTogZnVuY3Rpb24oZWxUaXRsZUFyZWEsIHNpemUsIGlzUG9zaXRpb25SaWdodCkge1xuICAgICAgICB2YXIgY3NzVGV4dHMgPSBbXG4gICAgICAgICAgICByZW5kZXJVdGlsLmNvbmNhdFN0cignd2lkdGg6Jywgc2l6ZSwgJ3B4JylcbiAgICAgICAgXTtcblxuICAgICAgICBpZiAoaXNQb3NpdGlvblJpZ2h0KSB7XG4gICAgICAgICAgICBjc3NUZXh0cy5wdXNoKHJlbmRlclV0aWwuY29uY2F0U3RyKCdyaWdodDonLCAtc2l6ZSwgJ3B4JykpO1xuICAgICAgICAgICAgY3NzVGV4dHMucHVzaChyZW5kZXJVdGlsLmNvbmNhdFN0cigndG9wOicsIDAsICdweCcpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNzc1RleHRzLnB1c2gocmVuZGVyVXRpbC5jb25jYXRTdHIoJ2xlZnQ6JywgMCwgJ3B4JykpO1xuICAgICAgICAgICAgaWYgKCFyZW5kZXJVdGlsLmlzSUU4KCkpIHtcbiAgICAgICAgICAgICAgICBjc3NUZXh0cy5wdXNoKHJlbmRlclV0aWwuY29uY2F0U3RyKCd0b3A6Jywgc2l6ZSwgJ3B4JykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZWxUaXRsZUFyZWEuc3R5bGUuY3NzVGV4dCArPSAnOycgKyBjc3NUZXh0cy5qb2luKCc7Jyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRpdGxlIGFyZWEgcmVuZGVyZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMudGl0bGUgYXhpcyB0aXRsZVxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSB0aXRsZSB0aGVtZVxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaXNWZXJ0aWNhbCB3aGV0aGVyIHZlcnRpY2FsIG9yIG5vdD9cbiAgICAgKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gcGFyYW1zLmlzUG9zaXRpb25SaWdodCB3aGV0aGVyIHJpZ2h0IHBvc2l0aW9uIG9yIG5vdD9cbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuc2l6ZSAod2lkdGggb3IgaGVpZ2h0KVxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gdGl0bGUgZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlclRpdGxlQXJlYTogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBlbFRpdGxlQXJlYSA9IHJlbmRlclV0aWwucmVuZGVyVGl0bGUocGFyYW1zLnRpdGxlLCBwYXJhbXMudGhlbWUsICd0dWktY2hhcnQtdGl0bGUtYXJlYScpO1xuXG4gICAgICAgIGlmIChlbFRpdGxlQXJlYSAmJiBwYXJhbXMuaXNWZXJ0aWNhbCkge1xuICAgICAgICAgICAgdGhpcy5fcmVuZGVyVGl0bGVBcmVhU3R5bGUoZWxUaXRsZUFyZWEsIHBhcmFtcy5zaXplLCBwYXJhbXMuaXNQb3NpdGlvblJpZ2h0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBlbFRpdGxlQXJlYTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVkbmVyIHRpY2sgYXJlYS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc2l6ZSBzaXplIG9yIGhlaWdodFxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gdGljayBhcmVhIGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJUaWNrQXJlYTogZnVuY3Rpb24oc2l6ZSkge1xuICAgICAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YSxcbiAgICAgICAgICAgIHRpY2tDb3VudCA9IGRhdGEudGlja0NvdW50LFxuICAgICAgICAgICAgdGlja0NvbG9yID0gdGhpcy50aGVtZS50aWNrQ29sb3IsXG4gICAgICAgICAgICBwb3NpdGlvbnMgPSBjYWxjdWxhdG9yLm1ha2VUaWNrUGl4ZWxQb3NpdGlvbnMoc2l6ZSwgdGlja0NvdW50KSxcbiAgICAgICAgICAgIGVsVGlja0FyZWEgPSBkb20uY3JlYXRlKCdESVYnLCAndHVpLWNoYXJ0LXRpY2stYXJlYScpLFxuICAgICAgICAgICAgcG9zVHlwZSA9IGRhdGEuaXNWZXJ0aWNhbCA/ICdib3R0b20nIDogJ2xlZnQnLFxuICAgICAgICAgICAgYm9yZGVyQ29sb3JUeXBlID0gZGF0YS5pc1ZlcnRpY2FsID8gKGRhdGEuaXNQb3NpdGlvblJpZ2h0ID8gJ2JvcmRlckxlZnRDb2xvcicgOiAnYm9yZGVyUmlnaHRDb2xvcicpIDogJ2JvcmRlclRvcENvbG9yJyxcbiAgICAgICAgICAgIHRlbXBsYXRlID0gYXhpc1RlbXBsYXRlLnRwbEF4aXNUaWNrLFxuICAgICAgICAgICAgdGlja3NIdG1sID0gdHVpLnV0aWwubWFwKHBvc2l0aW9ucywgZnVuY3Rpb24ocG9zaXRpb24sIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdmFyIGNzc1RleHQ7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYWxpZ25lZCAmJiBkYXRhLmxhYmVsc1tpbmRleF0gPT09IGNoYXJ0Q29uc3QuRU1QVFlfQVhJU19MQUJFTCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNzc1RleHQgPSBbXG4gICAgICAgICAgICAgICAgICAgIHJlbmRlclV0aWwuY29uY2F0U3RyKCdiYWNrZ3JvdW5kLWNvbG9yOicsIHRpY2tDb2xvciksXG4gICAgICAgICAgICAgICAgICAgIHJlbmRlclV0aWwuY29uY2F0U3RyKHBvc1R5cGUsICc6ICcsIHBvc2l0aW9uLCAncHgnKVxuICAgICAgICAgICAgICAgIF0uam9pbignOycpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZSh7Y3NzVGV4dDogY3NzVGV4dH0pO1xuICAgICAgICAgICAgfSwgdGhpcykuam9pbignJyk7XG5cbiAgICAgICAgZWxUaWNrQXJlYS5pbm5lckhUTUwgPSB0aWNrc0h0bWw7XG4gICAgICAgIGVsVGlja0FyZWEuc3R5bGVbYm9yZGVyQ29sb3JUeXBlXSA9IHRpY2tDb2xvcjtcblxuICAgICAgICByZXR1cm4gZWxUaWNrQXJlYTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBjc3NUZXh0IG9mIHZlcnRpY2FsIGxhYmVsLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBheGlzV2lkdGggYXhpcyB3aWR0aFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB0aXRsZUFyZWFXaWR0aCB0aXRsZSBhcmVhIHdpZHRoXG4gICAgICogQHJldHVybnMge3N0cmluZ30gY3NzVGV4dFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VWZXJ0aWNhbExhYmVsQ3NzVGV4dDogZnVuY3Rpb24oYXhpc1dpZHRoLCB0aXRsZUFyZWFXaWR0aCkge1xuICAgICAgICByZXR1cm4gJzt3aWR0aDonICsgKGF4aXNXaWR0aCAtIHRpdGxlQXJlYVdpZHRoICsgY2hhcnRDb25zdC5WX0xBQkVMX1JJR0hUX1BBRERJTkcpICsgJ3B4JztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGxhYmVsIGFyZWEuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHNpemUgbGFiZWwgYXJlYSBzaXplXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGF4aXNXaWR0aCBheGlzIGFyZWEgd2lkdGhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZGVncmVlIHJvdGF0aW9uIGRlZ3JlZVxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gbGFiZWwgYXJlYSBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyTGFiZWxBcmVhOiBmdW5jdGlvbihzaXplLCBheGlzV2lkdGgsIGRlZ3JlZSkge1xuICAgICAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YSxcbiAgICAgICAgICAgIHRpY2tQaXhlbFBvc2l0aW9ucyA9IGNhbGN1bGF0b3IubWFrZVRpY2tQaXhlbFBvc2l0aW9ucyhzaXplLCBkYXRhLnRpY2tDb3VudCksXG4gICAgICAgICAgICBsYWJlbFNpemUgPSB0aWNrUGl4ZWxQb3NpdGlvbnNbMV0gLSB0aWNrUGl4ZWxQb3NpdGlvbnNbMF0sXG4gICAgICAgICAgICBwb3NUeXBlID0gJ2xlZnQnLFxuICAgICAgICAgICAgY3NzVGV4dHMgPSB0aGlzLl9tYWtlTGFiZWxDc3NUZXh0cyh7XG4gICAgICAgICAgICAgICAgaXNWZXJ0aWNhbDogZGF0YS5pc1ZlcnRpY2FsLFxuICAgICAgICAgICAgICAgIGlzTGFiZWxBeGlzOiBkYXRhLmlzTGFiZWxBeGlzLFxuICAgICAgICAgICAgICAgIGxhYmVsU2l6ZTogbGFiZWxTaXplXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGVsTGFiZWxBcmVhID0gZG9tLmNyZWF0ZSgnRElWJywgJ3R1aS1jaGFydC1sYWJlbC1hcmVhJyksXG4gICAgICAgICAgICBhcmVhQ3NzVGV4dCA9IHJlbmRlclV0aWwubWFrZUZvbnRDc3NUZXh0KHRoaXMudGhlbWUubGFiZWwpLFxuICAgICAgICAgICAgbGFiZWxzSHRtbCwgdGl0bGVBcmVhV2lkdGg7XG5cbiAgICAgICAgaWYgKGRhdGEuaXNWZXJ0aWNhbCkge1xuICAgICAgICAgICAgcG9zVHlwZSA9IGRhdGEuaXNMYWJlbEF4aXMgPyAndG9wJyA6ICdib3R0b20nO1xuICAgICAgICAgICAgdGl0bGVBcmVhV2lkdGggPSB0aGlzLl9nZXRSZW5kZXJlZFRpdGxlSGVpZ2h0KCkgKyBjaGFydENvbnN0LlRJVExFX0FSRUFfV0lEVEhfUEFERElORztcbiAgICAgICAgICAgIGFyZWFDc3NUZXh0ICs9IHRoaXMuX21ha2VWZXJ0aWNhbExhYmVsQ3NzVGV4dChheGlzV2lkdGgsIHRpdGxlQXJlYVdpZHRoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRpY2tQaXhlbFBvc2l0aW9ucy5sZW5ndGggPSBkYXRhLmxhYmVscy5sZW5ndGg7XG5cbiAgICAgICAgbGFiZWxzSHRtbCA9IHRoaXMuX21ha2VMYWJlbHNIdG1sKHtcbiAgICAgICAgICAgIHBvc2l0aW9uczogdGlja1BpeGVsUG9zaXRpb25zLFxuICAgICAgICAgICAgbGFiZWxzOiBkYXRhLmxhYmVscyxcbiAgICAgICAgICAgIHBvc1R5cGU6IHBvc1R5cGUsXG4gICAgICAgICAgICBjc3NUZXh0czogY3NzVGV4dHMsXG4gICAgICAgICAgICBsYWJlbFNpemU6IGxhYmVsU2l6ZSxcbiAgICAgICAgICAgIGRlZ3JlZTogZGVncmVlLFxuICAgICAgICAgICAgdGhlbWU6IHRoaXMudGhlbWUubGFiZWxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZWxMYWJlbEFyZWEuaW5uZXJIVE1MID0gbGFiZWxzSHRtbDtcbiAgICAgICAgZWxMYWJlbEFyZWEuc3R5bGUuY3NzVGV4dCA9IGFyZWFDc3NUZXh0O1xuXG4gICAgICAgIHRoaXMuX2NoYW5nZUxhYmVsQXJlYVBvc2l0aW9uKHtcbiAgICAgICAgICAgIGVsTGFiZWxBcmVhOiBlbExhYmVsQXJlYSxcbiAgICAgICAgICAgIGlzVmVydGljYWw6IGRhdGEuaXNWZXJ0aWNhbCxcbiAgICAgICAgICAgIGlzTGFiZWxBeGlzOiBkYXRhLmlzTGFiZWxBeGlzLFxuICAgICAgICAgICAgdGhlbWU6IHRoaXMudGhlbWUubGFiZWwsXG4gICAgICAgICAgICBsYWJlbFNpemU6IGxhYmVsU2l6ZSxcbiAgICAgICAgICAgIGFsaWduZWQ6IGRhdGEuYWxpZ25lZFxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gZWxMYWJlbEFyZWE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBoZWlnaHQgb2YgdGl0bGUgYXJlYSA7XG4gICAgICogQHJldHVybnMge251bWJlcn0gaGVpZ2h0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0UmVuZGVyZWRUaXRsZUhlaWdodDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB0aXRsZSA9IHRoaXMub3B0aW9ucy50aXRsZSxcbiAgICAgICAgICAgIHRoZW1lID0gdGhpcy50aGVtZS50aXRsZSxcbiAgICAgICAgICAgIHJlc3VsdCA9IHRpdGxlID8gcmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsSGVpZ2h0KHRpdGxlLCB0aGVtZSkgOiAwO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGNzc1RleHRzIG9mIGxhYmVsLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyXG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5pc1ZlcnRpY2FsIHdoZXRoZXIgdmVydGljYWwgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5pc0xhYmVsQXhpcyB3aGV0aGVyIGxhYmVsIGF4aXMgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmxhYmVsU2l6ZSBsYWJlbCBzaXplICh3aWR0aCBvciBoZWlnaHQpXG4gICAgICogQHJldHVybnMge3N0cmluZ1tdfSBjc3NUZXh0c1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VMYWJlbENzc1RleHRzOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGNzc1RleHRzID0gW107XG5cbiAgICAgICAgaWYgKHBhcmFtcy5pc1ZlcnRpY2FsICYmIHBhcmFtcy5pc0xhYmVsQXhpcykge1xuICAgICAgICAgICAgY3NzVGV4dHMucHVzaChyZW5kZXJVdGlsLmNvbmNhdFN0cignaGVpZ2h0OicsIHBhcmFtcy5sYWJlbFNpemUsICdweCcpKTtcbiAgICAgICAgICAgIGNzc1RleHRzLnB1c2gocmVuZGVyVXRpbC5jb25jYXRTdHIoJ2xpbmUtaGVpZ2h0OicsIHBhcmFtcy5sYWJlbFNpemUsICdweCcpKTtcbiAgICAgICAgfSBlbHNlIGlmICghcGFyYW1zLmlzVmVydGljYWwpIHtcbiAgICAgICAgICAgIGNzc1RleHRzLnB1c2gocmVuZGVyVXRpbC5jb25jYXRTdHIoJ3dpZHRoOicsIHBhcmFtcy5sYWJlbFNpemUsICdweCcpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjc3NUZXh0cztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gY2FsY3VsYXRlIHJvdGF0aW9uIG1vdmluZyBwb3NpdGlvbi5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuZGVncmVlIHJvdGF0aW9uIGRlZ3JlZVxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5sYWJlbEhlaWdodCBsYWJlbCBoZWlnaHRcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubGVmdCBub3JtYWwgbGVmdFxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5tb3ZlTGVmdCBtb3ZlIGxlZnRcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMudG9wIHRvcFxuICAgICAqIEByZXR1cm5zIHt7dG9wOm51bWJlciwgbGVmdDogbnVtYmVyfX0gcG9zaXRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jYWxjdWxhdGVSb3RhdGlvbk1vdmluZ1Bvc2l0aW9uOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIG1vdmVMZWZ0ID0gcGFyYW1zLm1vdmVMZWZ0O1xuICAgICAgICBpZiAocGFyYW1zLmRlZ3JlZSA9PT0gY2hhcnRDb25zdC5BTkdMRV84NSkge1xuICAgICAgICAgICAgbW92ZUxlZnQgKz0gY2FsY3VsYXRvci5jYWxjdWxhdGVBZGphY2VudChjaGFydENvbnN0LkFOR0xFXzkwIC0gcGFyYW1zLmRlZ3JlZSwgcGFyYW1zLmxhYmVsSGVpZ2h0IC8gMik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdG9wOiBwYXJhbXMudG9wLFxuICAgICAgICAgICAgbGVmdDogcGFyYW1zLmxlZnQgLSBtb3ZlTGVmdFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBjYWxjdWxhdGUgcm90YXRpb24gbW92aW5nIHBvc2l0aW9uIGZvciBpZTguXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmRlZ3JlZSByb3RhdGlvbiBkZWdyZWVcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubGFiZWxXaWR0aCBsYWJlbCB3aWR0aFxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5sYWJlbEhlaWdodCBsYWJlbCBoZWlnaHRcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubGVmdCBub3JtYWwgbGVmdFxuICAgICAqICAgICAgQHBhcmFtIHsoc3RyaW5nIHwgbnVtYmVyKX0gcGFyYW1zLmxhYmVsIGxhYmVsXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gdGhlbWUgbGFiZWwgdGhlbWVcbiAgICAgKiBAcmV0dXJucyB7e3RvcDpudW1iZXIsIGxlZnQ6IG51bWJlcn19IHBvc2l0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2FsY3VsYXRlUm90YXRpb25Nb3ZpbmdQb3NpdGlvbkZvcklFODogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBsYWJlbFdpZHRoID0gcmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsV2lkdGgocGFyYW1zLmxhYmVsLCBwYXJhbXMudGhlbWUpLFxuICAgICAgICAgICAgc21hbGxBcmVhV2lkdGggPSBjYWxjdWxhdG9yLmNhbGN1bGF0ZUFkamFjZW50KGNoYXJ0Q29uc3QuQU5HTEVfOTAgLSBwYXJhbXMuZGVncmVlLCBwYXJhbXMubGFiZWxIZWlnaHQgLyAyKSxcbiAgICAgICAgICAgIG5ld0xhYmVsV2lkdGggPSAoY2FsY3VsYXRvci5jYWxjdWxhdGVBZGphY2VudChwYXJhbXMuZGVncmVlLCBsYWJlbFdpZHRoIC8gMikgKyBzbWFsbEFyZWFXaWR0aCkgKiAyLFxuICAgICAgICAgICAgY29sbGVjdExlZnQgPSBsYWJlbFdpZHRoIC0gbmV3TGFiZWxXaWR0aCxcbiAgICAgICAgICAgIG1vdmVMZWZ0ID0gKHBhcmFtcy5sYWJlbFdpZHRoIC8gMikgLSAoc21hbGxBcmVhV2lkdGggKiAyKTtcblxuICAgICAgICBpZiAocGFyYW1zLmRlZ3JlZSA9PT0gY2hhcnRDb25zdC5BTkdMRV84NSkge1xuICAgICAgICAgICAgbW92ZUxlZnQgKz0gc21hbGxBcmVhV2lkdGg7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdG9wOiBjaGFydENvbnN0LlhBWElTX0xBQkVMX1RPUF9NQVJHSU4sXG4gICAgICAgICAgICBsZWZ0OiBwYXJhbXMubGVmdCArIGNvbGxlY3RMZWZ0IC0gbW92ZUxlZnRcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBjc3NUZXh0IGZvciByb3RhdGlvbiBtb3ZpbmcuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmRlZ3JlZSByb3RhdGlvbiBkZWdyZWVcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubGFiZWxXaWR0aCBsYWJlbCB3aWR0aFxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5sYWJlbEhlaWdodCBsYWJlbCBoZWlnaHRcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubGVmdCBub3JtYWwgbGVmdFxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5tb3ZlTGVmdCBtb3ZlIGxlZnRcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMudG9wIHRvcFxuICAgICAqICAgICAgQHBhcmFtIHsoc3RyaW5nIHwgbnVtYmVyKX0gcGFyYW1zLmxhYmVsIGxhYmVsXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gdGhlbWUgbGFiZWwgdGhlbWVcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBjc3NUZXh0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUNzc1RleHRGb3JSb3RhdGlvbk1vdmluZzogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBwb3NpdGlvbjtcbiAgICAgICAgaWYgKHJlbmRlclV0aWwuaXNJRTgoKSkge1xuICAgICAgICAgICAgcG9zaXRpb24gPSB0aGlzLl9jYWxjdWxhdGVSb3RhdGlvbk1vdmluZ1Bvc2l0aW9uRm9ySUU4KHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwb3NpdGlvbiA9IHRoaXMuX2NhbGN1bGF0ZVJvdGF0aW9uTW92aW5nUG9zaXRpb24ocGFyYW1zKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVuZGVyVXRpbC5jb25jYXRTdHIoJ2xlZnQ6JywgcG9zaXRpb24ubGVmdCwgJ3B4JywgJzt0b3A6JywgcG9zaXRpb24udG9wLCAncHgnKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBodG1sIG9mIHJvdGF0aW9uIGxhYmVscy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPG9iamVjdD59IHBhcmFtcy5wb3NpdGlvbnMgbGFiZWwgcG9zaXRpb24gYXJyYXlcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nW119IHBhcmFtcy5sYWJlbHMgbGFiZWwgYXJyYXlcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMucG9zVHlwZSBwb3NpdGlvbiB0eXBlIChsZWZ0IG9yIGJvdHRvbSlcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nW119IHBhcmFtcy5jc3NUZXh0cyBjc3MgYXJyYXlcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBsYWJlbHMgaHRtbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VSb3RhdGlvbkxhYmVsc0h0bWw6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgdGVtcGxhdGUgPSBheGlzVGVtcGxhdGUudHBsQXhpc0xhYmVsLFxuICAgICAgICAgICAgbGFiZWxIZWlnaHQgPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxIZWlnaHQocGFyYW1zLmxhYmVsc1swXSwgcGFyYW1zLnRoZW1lKSxcbiAgICAgICAgICAgIGxhYmVsQ3NzVGV4dCA9IHBhcmFtcy5jc3NUZXh0cy5sZW5ndGggPyBwYXJhbXMuY3NzVGV4dHMuam9pbignOycpICsgJzsnIDogJycsXG4gICAgICAgICAgICBhZGRDbGFzcyA9ICcgcm90YXRpb24nICsgcGFyYW1zLmRlZ3JlZSxcbiAgICAgICAgICAgIGhhbGZXaWR0aCA9IHBhcmFtcy5sYWJlbFNpemUgLyAyLFxuICAgICAgICAgICAgbW92ZUxlZnQgPSBjYWxjdWxhdG9yLmNhbGN1bGF0ZUFkamFjZW50KHBhcmFtcy5kZWdyZWUsIGhhbGZXaWR0aCksXG4gICAgICAgICAgICB0b3AgPSBjYWxjdWxhdG9yLmNhbGN1bGF0ZU9wcG9zaXRlKHBhcmFtcy5kZWdyZWUsIGhhbGZXaWR0aCkgKyBjaGFydENvbnN0LlhBWElTX0xBQkVMX1RPUF9NQVJHSU4sXG4gICAgICAgICAgICBsYWJlbHNIdG1sID0gdHVpLnV0aWwubWFwKHBhcmFtcy5wb3NpdGlvbnMsIGZ1bmN0aW9uKHBvc2l0aW9uLCBpbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciBsYWJlbCA9IHBhcmFtcy5sYWJlbHNbaW5kZXhdLFxuICAgICAgICAgICAgICAgICAgICByb3RhdGlvbkNzc1RleHQgPSB0aGlzLl9tYWtlQ3NzVGV4dEZvclJvdGF0aW9uTW92aW5nKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZ3JlZTogcGFyYW1zLmRlZ3JlZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsSGVpZ2h0OiBsYWJlbEhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsV2lkdGg6IHBhcmFtcy5sYWJlbFNpemUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3A6IHRvcCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6IHBvc2l0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgbW92ZUxlZnQ6IG1vdmVMZWZ0LFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGxhYmVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6IHBhcmFtcy50aGVtZVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGFkZENsYXNzOiBhZGRDbGFzcyxcbiAgICAgICAgICAgICAgICAgICAgY3NzVGV4dDogbGFiZWxDc3NUZXh0ICsgcm90YXRpb25Dc3NUZXh0LFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogbGFiZWxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sIHRoaXMpLmpvaW4oJycpO1xuXG4gICAgICAgIHJldHVybiBsYWJlbHNIdG1sO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGh0bWwgb2Ygbm9ybWFsIGxhYmVscy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPG9iamVjdD59IHBhcmFtcy5wb3NpdGlvbnMgbGFiZWwgcG9zaXRpb24gYXJyYXlcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nW119IHBhcmFtcy5sYWJlbHMgbGFiZWwgYXJyYXlcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMucG9zVHlwZSBwb3NpdGlvbiB0eXBlIChsZWZ0IG9yIGJvdHRvbSlcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nW119IHBhcmFtcy5jc3NUZXh0cyBjc3MgYXJyYXlcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBsYWJlbHMgaHRtbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VOb3JtYWxMYWJlbHNIdG1sOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIHRlbXBsYXRlID0gYXhpc1RlbXBsYXRlLnRwbEF4aXNMYWJlbCxcbiAgICAgICAgICAgIGxhYmVsQ3NzVGV4dCA9IHBhcmFtcy5jc3NUZXh0cy5sZW5ndGggPyBwYXJhbXMuY3NzVGV4dHMuam9pbignOycpICsgJzsnIDogJycsXG4gICAgICAgICAgICBsYWJlbHNIdG1sID0gdHVpLnV0aWwubWFwKHBhcmFtcy5wb3NpdGlvbnMsIGZ1bmN0aW9uKHBvc2l0aW9uLCBpbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciBhZGRDc3NUZXh0ID0gcmVuZGVyVXRpbC5jb25jYXRTdHIocGFyYW1zLnBvc1R5cGUsICc6JywgcG9zaXRpb24sICdweCcpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGFkZENsYXNzOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgY3NzVGV4dDogbGFiZWxDc3NUZXh0ICsgYWRkQ3NzVGV4dCxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHBhcmFtcy5sYWJlbHNbaW5kZXhdXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCB0aGlzKS5qb2luKCcnKTtcbiAgICAgICAgcmV0dXJuIGxhYmVsc0h0bWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgaHRtbCBvZiBsYWJlbHMuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxvYmplY3Q+fSBwYXJhbXMucG9zaXRpb25zIGxhYmVsIHBvc2l0aW9uIGFycmF5XG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ1tdfSBwYXJhbXMubGFiZWxzIGxhYmVsIGFycmF5XG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLnBvc1R5cGUgcG9zaXRpb24gdHlwZSAobGVmdCBvciBib3R0b20pXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ1tdfSBwYXJhbXMuY3NzVGV4dHMgY3NzIGFycmF5XG4gICAgICogQHJldHVybnMge3N0cmluZ30gbGFiZWxzIGh0bWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlTGFiZWxzSHRtbDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBsYWJlbHNIdG1sO1xuICAgICAgICBpZiAocGFyYW1zLmRlZ3JlZSkge1xuICAgICAgICAgICAgbGFiZWxzSHRtbCA9IHRoaXMuX21ha2VSb3RhdGlvbkxhYmVsc0h0bWwocGFyYW1zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxhYmVsc0h0bWwgPSB0aGlzLl9tYWtlTm9ybWFsTGFiZWxzSHRtbChwYXJhbXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGxhYmVsc0h0bWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoYW5nZSBwb3NpdGlvbiBvZiBsYWJlbCBhcmVhLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyXG4gICAgICogICAgICBAcGFyYW0ge0hUTUxFbGVtZW50fSBwYXJhbXMuZWxMYWJlbEFyZWEgbGFiZWwgYXJlYSBlbGVtZW50XG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5pc1ZlcnRpY2FsIHdoZXRoZXIgdmVydGljYWwgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5pc0xhYmVsQXhpcyB3aGV0aGVyIGxhYmVsIGF4aXMgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge3tmb250U2l6ZTogbnVtYmVyLCBmb250RmFtaWx5OiBzdHJpbmcsIGNvbG9yOiBzdHJpbmd9fSBwYXJhbXMudGhlbWUgbGFiZWwgdGhlbWVcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubGFiZWxTaXplIGxhYmVsIHNpemUgKHdpZHRoIG9yIGhlaWdodClcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jaGFuZ2VMYWJlbEFyZWFQb3NpdGlvbjogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBsYWJlbEhlaWdodDtcblxuICAgICAgICBpZiAocGFyYW1zLmlzTGFiZWxBeGlzICYmICFwYXJhbXMuYWxpZ25lZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhcmFtcy5pc1ZlcnRpY2FsKSB7XG4gICAgICAgICAgICBsYWJlbEhlaWdodCA9IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodCgnQUJDJywgcGFyYW1zLnRoZW1lKTtcbiAgICAgICAgICAgIHBhcmFtcy5lbExhYmVsQXJlYS5zdHlsZS50b3AgPSByZW5kZXJVdGlsLmNvbmNhdFN0cihwYXJzZUludChsYWJlbEhlaWdodCAvIDIsIDEwKSwgJ3B4Jyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYXJhbXMuZWxMYWJlbEFyZWEuc3R5bGUubGVmdCA9IHJlbmRlclV0aWwuY29uY2F0U3RyKCctJywgcGFyc2VJbnQocGFyYW1zLmxhYmVsU2l6ZSAvIDIsIDEwKSwgJ3B4Jyk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBeGlzO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFRoaXMgaXMgdGVtcGxhdGVzIG9yIGF4aXMgdmlldy5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbnZhciB0ZW1wbGF0ZU1ha2VyID0gcmVxdWlyZSgnLi4vaGVscGVycy90ZW1wbGF0ZU1ha2VyJyk7XG5cbnZhciB0YWdzID0ge1xuICAgIEhUTUxfQVhJU19USUNLOiAnPGRpdiBjbGFzcz1cInR1aS1jaGFydC10aWNrXCIgc3R5bGU9XCJ7eyBjc3NUZXh0IH19XCI+PC9kaXY+JyxcbiAgICBIVE1MX0FYSVNfTEFCRUw6ICc8ZGl2IGNsYXNzPVwidHVpLWNoYXJ0LWxhYmVse3sgYWRkQ2xhc3MgfX1cIiBzdHlsZT1cInt7IGNzc1RleHQgfX1cIj48c3Bhbj57eyBsYWJlbCB9fTwvc3Bhbj48L2Rpdj4nXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICB0cGxBeGlzVGljazogdGVtcGxhdGVNYWtlci50ZW1wbGF0ZSh0YWdzLkhUTUxfQVhJU19USUNLKSxcbiAgICB0cGxBeGlzTGFiZWw6IHRlbXBsYXRlTWFrZXIudGVtcGxhdGUodGFncy5IVE1MX0FYSVNfTEFCRUwpXG59O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IGNoYXJ0LmpzIGlzIGVudHJ5IHBvaW50IG9mIFRvYXN0IFVJIENoYXJ0LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuL2NvbnN0JyksXG4gICAgY2hhcnRGYWN0b3J5ID0gcmVxdWlyZSgnLi9mYWN0b3JpZXMvY2hhcnRGYWN0b3J5JyksXG4gICAgcGx1Z2luRmFjdG9yeSA9IHJlcXVpcmUoJy4vZmFjdG9yaWVzL3BsdWdpbkZhY3RvcnknKSxcbiAgICB0aGVtZUZhY3RvcnkgPSByZXF1aXJlKCcuL2ZhY3Rvcmllcy90aGVtZUZhY3RvcnknKTtcblxudmFyIF9jcmVhdGVDaGFydDtcblxucmVxdWlyZSgnLi9jb2RlLXNuaXBwZXQtdXRpbCcpO1xucmVxdWlyZSgnLi9yZWdpc3RlckNoYXJ0cycpO1xucmVxdWlyZSgnLi9yZWdpc3RlclRoZW1lcycpO1xuXG4vKipcbiAqIE5ITiBFbnRlcnRhaW5tZW50IFRvYXN0IFVJIENoYXJ0LlxuICogQG5hbWVzcGFjZSB0dWkuY2hhcnRcbiAqL1xudHVpLnV0aWwuZGVmaW5lTmFtZXNwYWNlKCd0dWkuY2hhcnQnKTtcblxuLyoqXG4gKiBDcmVhdGUgY2hhcnQuXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY29udGFpbmVyXG4gKiBAcGFyYW0ge2FycmF5LjxhcnJheT59IGRhdGEgY2hhcnQgZGF0YVxuICogQHBhcmFtIHt7XG4gKiAgIGNoYXJ0OiB7XG4gKiAgICAgd2lkdGg6IG51bWJlcixcbiAqICAgICBoZWlnaHQ6IG51bWJlcixcbiAqICAgICB0aXRsZTogc3RyaW5nLFxuICogICAgIGZvcm1hdDogc3RyaW5nXG4gKiAgIH0sXG4gKiAgIHlBeGlzOiB7XG4gKiAgICAgdGl0bGU6IHN0cmluZyxcbiAqICAgICBtaW46IG51bWJlclxuICogICB9LFxuICogICB4QXhpczoge1xuICogICAgIHRpdGxlOiBzdHJpZyxcbiAqICAgICBtaW46IG51bWJlclxuICogICB9LFxuICogICB0b29sdGlwOiB7XG4gKiAgICAgc3VmZml4OiBzdHJpbmcsXG4gKiAgICAgdGVtcGxhdGU6IHN0cmluZ1xuICogICB9LFxuICogICB0aGVtZTogc3RyaW5nXG4gKiB9fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAqIEByZXR1cm5zIHtvYmplY3R9IGNoYXJ0IGluc3RhbmNlLlxuICogQHByaXZhdGVcbiAqIEBpZ25vcmVcbiAqL1xuX2NyZWF0ZUNoYXJ0ID0gZnVuY3Rpb24oY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKSB7XG4gICAgdmFyIHRoZW1lTmFtZSwgdGhlbWUsIGNoYXJ0O1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHRoZW1lTmFtZSA9IG9wdGlvbnMudGhlbWUgfHwgY2hhcnRDb25zdC5ERUZBVUxUX1RIRU1FX05BTUU7XG4gICAgdGhlbWUgPSB0aGVtZUZhY3RvcnkuZ2V0KHRoZW1lTmFtZSk7XG5cbiAgICBjaGFydCA9IGNoYXJ0RmFjdG9yeS5nZXQob3B0aW9ucy5jaGFydFR5cGUsIGRhdGEsIHRoZW1lLCBvcHRpb25zKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoY2hhcnQucmVuZGVyKCkpO1xuICAgIGNoYXJ0LmFuaW1hdGVDaGFydCgpO1xuXG4gICAgcmV0dXJuIGNoYXJ0O1xufTtcblxuLyoqXG4gKiBCYXIgY2hhcnQgY3JlYXRvci5cbiAqIEBtZW1iZXJPZiB0dWkuY2hhcnRcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciBjaGFydCBjb250YWluZXJcbiAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhIGNoYXJ0IGRhdGFcbiAqICAgICAgQHBhcmFtIHthcnJheS48c3RyaW5nPn0gZGF0YS5jYXRlZ29yaWVzIGNhdGVnb3JpZXNcbiAqICAgICAgQHBhcmFtIHthcnJheS48YXJyYXk+fSBkYXRhLnNlcmllcyBzZXJpZXMgZGF0YVxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5jaGFydCBjaGFydCBvcHRpb25zXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5jaGFydC53aWR0aCBjaGFydCB3aWR0aFxuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMuY2hhcnQuaGVpZ2h0IGNoYXJ0IGhlaWdodFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuY2hhcnQudGl0bGUgY2hhcnQgdGl0bGVcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmNoYXJ0LmZvcm1hdCB2YWx1ZSBmb3JtYXRcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMueUF4aXMgb3B0aW9ucyBvZiB2ZXJ0aWNhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy55QXhpcy50aXRsZSB0aXRsZSBvZiB2ZXJ0aWNhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy55QXhpcy5sYWJlbEludGVydmFsIGxhYmVsIGludGVydmFsIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMueEF4aXMgb3B0aW9ucyBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnhBeGlzLnRpdGxlIHRpdGxlIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMueEF4aXMubWluIG1pbmltYWwgdmFsdWUgb2YgaG9yaXpvbnRhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy54QXhpcy5tYXggbWF4aW11bSB2YWx1ZSBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuc2VyaWVzIG9wdGlvbnMgb2Ygc2VyaWVzXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5zZXJpZXMuc3RhY2tlZCBzdGFja2VkIHR5cGVcbiAqICAgICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5zZXJpZXMuc2hvd0xhYmVsIHdoZXRoZXIgc2hvdyBsYWJlbCBvciBub3RcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMudG9vbHRpcCBvcHRpb25zIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAuc3VmZml4IHN1ZmZpeCBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnRlbXBsYXRlIHRlbXBsYXRlIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAucG9zaXRpb24gdG9vbHRpcCBwb3NpdGlvbiB0eXBlXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uIGFkZCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24ubGVmdCBhZGQgbGVmdCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24udG9wIGFkZCB0b3AgcG9zaXRpb25cbiAqICAgICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy50b29sdGlwLmdyb3VwZWQgd2hldGhlciBncm91cCB0b29sdGlwIG9yIG5vdFxuICogICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50aGVtZSB0aGVtZSBuYW1lXG4gKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmxpYlR5cGUgZ3JhcGggbGlicmFyeSB0eXBlXG4gKiBAcmV0dXJucyB7b2JqZWN0fSBiYXIgY2hhcnRcbiAqIEBleGFtcGxlXG4gKiB2YXIgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhaW5lci1pZCcpLFxuICogICAgIGRhdGEgPSB7XG4gKiAgICAgICBjYXRlZ29yaWVzOiBbJ2NhdGUxJywgJ2NhdGUyJywgJ2NhdGUzJ10sXG4gKiAgICAgICBzZXJpZXM6IFtcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQxJyxcbiAqICAgICAgICAgICBkYXRhOiBbMjAsIDMwLCA1MF1cbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQyJyxcbiAqICAgICAgICAgICBkYXRhOiBbNDAsIDQwLCA2MF1cbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQzJyxcbiAqICAgICAgICAgICBkYXRhOiBbNjAsIDUwLCAxMF1cbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQ0JyxcbiAqICAgICAgICAgICBkYXRhOiBbODAsIDEwLCA3MF1cbiAqICAgICAgICAgfVxuICogICAgICAgXVxuICogICAgIH0sXG4gKiAgICAgb3B0aW9ucyA9IHtcbiAqICAgICAgIGNoYXJ0OiB7XG4gKiAgICAgICAgIHRpdGxlOiAnQmFyIENoYXJ0J1xuICogICAgICAgfSxcbiAqICAgICAgIHlBeGlzOiB7XG4gKiAgICAgICAgIHRpdGxlOiAnWSBBeGlzJ1xuICogICAgICAgfSxcbiAqICAgICAgIHhBeGlzOiB7XG4gKiAgICAgICAgIHRpdGxlOiAnWCBBeGlzJ1xuICogICAgICAgfVxuICogICAgIH07XG4gKiB0dWkuY2hhcnQuYmFyQ2hhcnQoY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKTtcbiAqL1xudHVpLmNoYXJ0LmJhckNoYXJ0ID0gZnVuY3Rpb24oY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgb3B0aW9ucy5jaGFydFR5cGUgPSBjaGFydENvbnN0LkNIQVJUX1RZUEVfQkFSO1xuICAgIHJldHVybiBfY3JlYXRlQ2hhcnQoY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKTtcbn07XG5cbi8qKlxuICogQ29sdW1uIGNoYXJ0IGNyZWF0b3IuXG4gKiBAbWVtYmVyT2YgdHVpLmNoYXJ0XG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY2hhcnQgY29udGFpbmVyXG4gKiBAcGFyYW0ge29iamVjdH0gZGF0YSBjaGFydCBkYXRhXG4gKiAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGRhdGEuY2F0ZWdvcmllcyBjYXRlZ29yaWVzXG4gKiAgICAgIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gZGF0YS5zZXJpZXMgc2VyaWVzIGRhdGFcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuY2hhcnQgY2hhcnQgb3B0aW9uc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMuY2hhcnQud2lkdGggY2hhcnQgd2lkdGhcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LmhlaWdodCBjaGFydCBoZWlnaHRcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmNoYXJ0LnRpdGxlIGNoYXJ0IHRpdGxlXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC5mb3JtYXQgdmFsdWUgZm9ybWF0XG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnlBeGlzIG9wdGlvbnMgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMueUF4aXMudGl0bGUgdGl0bGUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMueUF4aXMubWluIG1pbmltYWwgdmFsdWUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMueUF4aXMubWF4IG1heGltdW0gdmFsdWUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy54QXhpcyBvcHRpb25zIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMueEF4aXMudGl0bGUgdGl0bGUgb2YgaG9yaXpvbnRhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy54QXhpcy5sYWJlbEludGVydmFsIGxhYmVsIGludGVydmFsIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5zZXJpZXMgb3B0aW9ucyBvZiBzZXJpZXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnNlcmllcy5zdGFja2VkIHN0YWNrZWQgdHlwZVxuICogICAgICAgICAgQHBhcmFtIHtib29sZWFufSBvcHRpb25zLnNlcmllcy5zaG93TGFiZWwgd2hldGhlciBzaG93IGxhYmVsIG9yIG5vdFxuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy50b29sdGlwIG9wdGlvbnMgb2YgdG9vbHRpcFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC5zdWZmaXggc3VmZml4IG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAudGVtcGxhdGUgdGVtcGxhdGUgb2YgdG9vbHRpcFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC5wb3NpdGlvbiB0b29sdGlwIHBvc2l0aW9uIHR5cGVcbiAqICAgICAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24gYWRkIHBvc2l0aW9uXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMudG9vbHRpcC5hZGRQb3NpdGlvbi5sZWZ0IGFkZCBsZWZ0IHBvc2l0aW9uXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMudG9vbHRpcC5hZGRQb3NpdGlvbi50b3AgYWRkIHRvcCBwb3NpdGlvblxuICogICAgICAgICAgQHBhcmFtIHtib29sZWFufSBvcHRpb25zLnRvb2x0aXAuZ3JvdXBlZCB3aGV0aGVyIGdyb3VwIHRvb2x0aXAgb3Igbm90XG4gKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRoZW1lIHRoZW1lIG5hbWVcbiAqICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMubGliVHlwZSBncmFwaCBsaWJyYXJ5IHR5cGVcbiAqIEByZXR1cm5zIHtvYmplY3R9IGNvbHVtbiBjaGFydFxuICogQGV4YW1wbGVcbiAqIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFpbmVyLWlkJyksXG4gKiAgICAgZGF0YSA9IHtcbiAqICAgICAgIGNhdGVnb3JpZXM6IFsnY2F0ZTEnLCAnY2F0ZTInLCAnY2F0ZTMnXSxcbiAqICAgICAgIHNlcmllczogW1xuICogICAgICAgICB7XG4gKiAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDEnLFxuICogICAgICAgICAgIGRhdGE6IFsyMCwgMzAsIDUwXVxuICogICAgICAgICB9LFxuICogICAgICAgICB7XG4gKiAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDInLFxuICogICAgICAgICAgIGRhdGE6IFs0MCwgNDAsIDYwXVxuICogICAgICAgICB9LFxuICogICAgICAgICB7XG4gKiAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDMnLFxuICogICAgICAgICAgIGRhdGE6IFs2MCwgNTAsIDEwXVxuICogICAgICAgICB9LFxuICogICAgICAgICB7XG4gKiAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDQnLFxuICogICAgICAgICAgIGRhdGE6IFs4MCwgMTAsIDcwXVxuICogICAgICAgICB9XG4gKiAgICAgICBdXG4gKiAgICAgfSxcbiAqICAgICBvcHRpb25zID0ge1xuICogICAgICAgY2hhcnQ6IHtcbiAqICAgICAgICAgdGl0bGU6ICdDb2x1bW4gQ2hhcnQnXG4gKiAgICAgICB9LFxuICogICAgICAgeUF4aXM6IHtcbiAqICAgICAgICAgdGl0bGU6ICdZIEF4aXMnXG4gKiAgICAgICB9LFxuICogICAgICAgeEF4aXM6IHtcbiAqICAgICAgICAgdGl0bGU6ICdYIEF4aXMnXG4gKiAgICAgICB9XG4gKiAgICAgfTtcbiAqIHR1aS5jaGFydC5jb2x1bW5DaGFydChjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpO1xuICovXG50dWkuY2hhcnQuY29sdW1uQ2hhcnQgPSBmdW5jdGlvbihjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICBvcHRpb25zLmNoYXJ0VHlwZSA9IGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9DT0xVTU47XG4gICAgcmV0dXJuIF9jcmVhdGVDaGFydChjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpO1xufTtcblxuLyoqXG4gKiBMaW5lIGNoYXJ0IGNyZWF0b3IuXG4gKiBAbWVtYmVyT2YgdHVpLmNoYXJ0XG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY2hhcnQgY29udGFpbmVyXG4gKiBAcGFyYW0ge29iamVjdH0gZGF0YSBjaGFydCBkYXRhXG4gKiAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGRhdGEuY2F0ZWdvcmllcyBjYXRlZ29yaWVzXG4gKiAgICAgIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gZGF0YS5zZXJpZXMgc2VyaWVzIGRhdGFcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuY2hhcnQgY2hhcnQgb3B0aW9uc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMuY2hhcnQud2lkdGggY2hhcnQgd2lkdGhcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LmhlaWdodCBjaGFydCBoZWlnaHRcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmNoYXJ0LnRpdGxlIGNoYXJ0IHRpdGxlXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC5mb3JtYXQgdmFsdWUgZm9ybWF0XG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnlBeGlzIG9wdGlvbnMgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMueUF4aXMudGl0bGUgdGl0bGUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMueUF4aXMubWluIG1pbmltYWwgdmFsdWUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMueUF4aXMubWF4IG1heGltdW0gdmFsdWUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy54QXhpcyBvcHRpb25zIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMueEF4aXMudGl0bGUgdGl0bGUgb2YgaG9yaXpvbnRhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy54QXhpcy5sYWJlbEludGVydmFsIGxhYmVsIGludGVydmFsIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5zZXJpZXMgb3B0aW9ucyBvZiBzZXJpZXNcbiAqICAgICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5zZXJpZXMuaGFzRG90IHdoZXRoZXIgaGFzIGRvdCBvciBub3RcbiAqICAgICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5zZXJpZXMuc2hvd0xhYmVsIHdoZXRoZXIgc2hvdyBsYWJlbCBvciBub3RcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMudG9vbHRpcCBvcHRpb25zIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAuc3VmZml4IHN1ZmZpeCBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnRlbXBsYXRlIHRlbXBsYXRlIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAucG9zaXRpb24gdG9vbHRpcCBwb3NpdGlvbiB0eXBlXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uIGFkZCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24ubGVmdCBhZGQgbGVmdCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24udG9wIGFkZCB0b3AgcG9zaXRpb25cbiAqICAgICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy50b29sdGlwLmdyb3VwZWQgd2hldGhlciBncm91cCB0b29sdGlwIG9yIG5vdFxuICogICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50aGVtZSB0aGVtZSBuYW1lXG4gKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmxpYlR5cGUgZ3JhcGggbGlicmFyeSB0eXBlXG4gKiBAcmV0dXJucyB7b2JqZWN0fSBiYXIgY2hhcnRcbiAqIEBleGFtcGxlXG4gKiB2YXIgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhaW5lci1pZCcpLFxuICogICAgIGRhdGEgPSB7XG4gKiAgICAgICBjYXRlZ29yaWVzOiBbJ2NhdGUxJywgJ2NhdGUyJywgJ2NhdGUzJ10sXG4gKiAgICAgICBzZXJpZXM6IFtcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQxJyxcbiAqICAgICAgICAgICBkYXRhOiBbMjAsIDMwLCA1MF1cbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQyJyxcbiAqICAgICAgICAgICBkYXRhOiBbNDAsIDQwLCA2MF1cbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQzJyxcbiAqICAgICAgICAgICBkYXRhOiBbNjAsIDUwLCAxMF1cbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQ0JyxcbiAqICAgICAgICAgICBkYXRhOiBbODAsIDEwLCA3MF1cbiAqICAgICAgICAgfVxuICogICAgICAgXVxuICogICAgIH0sXG4gKiAgICAgb3B0aW9ucyA9IHtcbiAqICAgICAgIGNoYXJ0OiB7XG4gKiAgICAgICAgIHRpdGxlOiAnTGluZSBDaGFydCdcbiAqICAgICAgIH0sXG4gKiAgICAgICB5QXhpczoge1xuICogICAgICAgICB0aXRsZTogJ1kgQXhpcydcbiAqICAgICAgIH0sXG4gKiAgICAgICB4QXhpczoge1xuICogICAgICAgICB0aXRsZTogJ1ggQXhpcydcbiAqICAgICAgIH0sXG4gKiAgICAgICBzZXJpZXM6IHtcbiAqICAgICAgICAgaGFzRG90OiB0cnVlXG4gKiAgICAgICB9XG4gKiAgICAgfTtcbiAqIHR1aS5jaGFydC5saW5lQ2hhcnQoY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKTtcbiAqL1xudHVpLmNoYXJ0LmxpbmVDaGFydCA9IGZ1bmN0aW9uKGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIG9wdGlvbnMuY2hhcnRUeXBlID0gY2hhcnRDb25zdC5DSEFSVF9UWVBFX0xJTkU7XG4gICAgcmV0dXJuIF9jcmVhdGVDaGFydChjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpO1xufTtcblxuLyoqXG4gKiBBcmVhIGNoYXJ0IGNyZWF0b3IuXG4gKiBAbWVtYmVyT2YgdHVpLmNoYXJ0XG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY2hhcnQgY29udGFpbmVyXG4gKiBAcGFyYW0ge29iamVjdH0gZGF0YSBjaGFydCBkYXRhXG4gKiAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGRhdGEuY2F0ZWdvcmllcyBjYXRlZ29yaWVzXG4gKiAgICAgIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gZGF0YS5zZXJpZXMgc2VyaWVzIGRhdGFcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuY2hhcnQgY2hhcnQgb3B0aW9uc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMuY2hhcnQud2lkdGggY2hhcnQgd2lkdGhcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LmhlaWdodCBjaGFydCBoZWlnaHRcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmNoYXJ0LnRpdGxlIGNoYXJ0IHRpdGxlXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC5mb3JtYXQgdmFsdWUgZm9ybWF0XG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnlBeGlzIG9wdGlvbnMgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMueUF4aXMudGl0bGUgdGl0bGUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMueUF4aXMubWluIG1pbmltYWwgdmFsdWUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMueUF4aXMubWF4IG1heGltdW0gdmFsdWUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy54QXhpcyBvcHRpb25zIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMueEF4aXMudGl0bGUgdGl0bGUgb2YgaG9yaXpvbnRhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy54QXhpcy5sYWJlbEludGVydmFsIGxhYmVsIGludGVydmFsIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5zZXJpZXMgb3B0aW9ucyBvZiBzZXJpZXNcbiAqICAgICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5zZXJpZXMuaGFzRG90IHdoZXRoZXIgaGFzIGRvdCBvciBub3RcbiAqICAgICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5zZXJpZXMuc2hvd0xhYmVsIHdoZXRoZXIgc2hvdyBsYWJlbCBvciBub3RcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMudG9vbHRpcCBvcHRpb25zIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAuc3VmZml4IHN1ZmZpeCBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnRlbXBsYXRlIHRlbXBsYXRlIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRvb2x0aXAucG9zaXRpb24gdG9vbHRpcCBwb3NpdGlvbiB0eXBlXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uIGFkZCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24ubGVmdCBhZGQgbGVmdCBwb3NpdGlvblxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuYWRkUG9zaXRpb24udG9wIGFkZCB0b3AgcG9zaXRpb25cbiAqICAgICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy50b29sdGlwLmdyb3VwZWQgd2hldGhlciBncm91cCB0b29sdGlwIG9yIG5vdFxuICogICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50aGVtZSB0aGVtZSBuYW1lXG4gKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmxpYlR5cGUgZ3JhcGggbGlicmFyeSB0eXBlXG4gKiBAcmV0dXJucyB7b2JqZWN0fSBiYXIgY2hhcnRcbiAqIEBleGFtcGxlXG4gKiB2YXIgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhaW5lci1pZCcpLFxuICogICAgIGRhdGEgPSB7XG4gKiAgICAgICBjYXRlZ29yaWVzOiBbJ2NhdGUxJywgJ2NhdGUyJywgJ2NhdGUzJ10sXG4gKiAgICAgICBzZXJpZXM6IFtcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQxJyxcbiAqICAgICAgICAgICBkYXRhOiBbMjAsIDMwLCA1MF1cbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQyJyxcbiAqICAgICAgICAgICBkYXRhOiBbNDAsIDQwLCA2MF1cbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQzJyxcbiAqICAgICAgICAgICBkYXRhOiBbNjAsIDUwLCAxMF1cbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQ0JyxcbiAqICAgICAgICAgICBkYXRhOiBbODAsIDEwLCA3MF1cbiAqICAgICAgICAgfVxuICogICAgICAgXVxuICogICAgIH0sXG4gKiAgICAgb3B0aW9ucyA9IHtcbiAqICAgICAgIGNoYXJ0OiB7XG4gKiAgICAgICAgIHRpdGxlOiAnQXJlYSBDaGFydCdcbiAqICAgICAgIH0sXG4gKiAgICAgICB5QXhpczoge1xuICogICAgICAgICB0aXRsZTogJ1kgQXhpcydcbiAqICAgICAgIH0sXG4gKiAgICAgICB4QXhpczoge1xuICogICAgICAgICB0aXRsZTogJ1ggQXhpcydcbiAqICAgICAgIH1cbiAqICAgICB9O1xuICogdHVpLmNoYXJ0LmFyZWFDaGFydChjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpO1xuICovXG50dWkuY2hhcnQuYXJlYUNoYXJ0ID0gZnVuY3Rpb24oY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgb3B0aW9ucy5jaGFydFR5cGUgPSBjaGFydENvbnN0LkNIQVJUX1RZUEVfQVJFQTtcbiAgICByZXR1cm4gX2NyZWF0ZUNoYXJ0KGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucyk7XG59O1xuXG4vKipcbiAqIENvbWJvIGNoYXJ0IGNyZWF0b3IuXG4gKiBAbWVtYmVyT2YgdHVpLmNoYXJ0XG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY2hhcnQgY29udGFpbmVyXG4gKiBAcGFyYW0ge29iamVjdH0gZGF0YSBjaGFydCBkYXRhXG4gKiAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGRhdGEuY2F0ZWdvcmllcyBjYXRlZ29yaWVzXG4gKiAgICAgIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gZGF0YS5zZXJpZXMgc2VyaWVzIGRhdGFcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuY2hhcnQgY2hhcnQgb3B0aW9uc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMuY2hhcnQud2lkdGggY2hhcnQgd2lkdGhcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LmhlaWdodCBjaGFydCBoZWlnaHRcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmNoYXJ0LnRpdGxlIGNoYXJ0IHRpdGxlXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC5mb3JtYXQgdmFsdWUgZm9ybWF0XG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0W119IG9wdGlvbnMueUF4aXMgb3B0aW9ucyBvZiB2ZXJ0aWNhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy55QXhpc1tdLnRpdGxlIHRpdGxlIG9mIHZlcnRpY2FsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnlBeGlzW10ubWluIG1pbmltYWwgdmFsdWUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMueUF4aXNbXS5tYXggbWF4aW11bSB2YWx1ZSBvZiB2ZXJ0aWNhbCBheGlzXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnhBeGlzIG9wdGlvbnMgb2YgaG9yaXpvbnRhbCBheGlzXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy54QXhpcy50aXRsZSB0aXRsZSBvZiBob3Jpem9udGFsIGF4aXNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnhBeGlzLmxhYmVsSW50ZXJ2YWwgbGFiZWwgaW50ZXJ2YWwgb2YgaG9yaXpvbnRhbCBheGlzXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnNlcmllcyBvcHRpb25zIG9mIHNlcmllc1xuICogICAgICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuc2VyaWVzLmNvbHVtbiBvcHRpb25zIG9mIGNvbHVtbiBzZXJpZXNcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5zZXJpZXMuY29sdW1uLnN0YWNrZWQgc3RhY2tlZCB0eXBlXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtib29sZWFufSBvcHRpb25zLnNlcmllcy5jb2x1bW4uc2hvd0xhYmVsIHdoZXRoZXIgc2hvdyBsYWJlbCBvciBub3RcbiAqICAgICAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnNlcmllcy5saW5lIG9wdGlvbnMgb2YgbGluZSBzZXJpZXNcbiAqICAgICAgICAgICAgICBAcGFyYW0ge2Jvb2xlYW59IG9wdGlvbnMuc2VyaWVzLmxpbmUuaGFzRG90IHdoZXRoZXIgaGFzIGRvdCBvciBub3RcbiAqICAgICAgICAgICAgICBAcGFyYW0ge2Jvb2xlYW59IG9wdGlvbnMuc2VyaWVzLmxpbmUuc2hvd0xhYmVsIHdoZXRoZXIgc2hvdyBsYWJlbCBvciBub3RcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMudG9vbHRpcCBvcHRpb25zIG9mIHRvb2x0aXBcbiAqICAgICAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnRvb2x0aXAuY29sdW1uIG9wdGlvbnMgb2YgY29sdW1uIHRvb2x0aXBcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLmNvbHVtbi5zdWZmaXggc3VmZml4IG9mIHRvb2x0aXBcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLmNvbHVtbi50ZW1wbGF0ZSB0ZW1wbGF0ZSBvZiB0b29sdGlwXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC5jb2x1bW4ucG9zaXRpb24gdG9vbHRpcCBwb3NpdGlvbiB0eXBlXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMudG9vbHRpcC5jb2x1bW4uYWRkUG9zaXRpb24gYWRkIHBvc2l0aW9uXG4gKiAgICAgICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRvb2x0aXAuY29sdW1uLmFkZFBvc2l0aW9uLmxlZnQgYWRkIGxlZnQgcG9zaXRpb25cbiAqICAgICAgICAgICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMudG9vbHRpcC5jb2x1bW4uYWRkUG9zaXRpb24udG9wIGFkZCB0b3AgcG9zaXRpb25cbiAqICAgICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy50b29sdGlwLmdyb3VwZWQgd2hldGhlciBncm91cCB0b29sdGlwIG9yIG5vdFxuICogICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50aGVtZSB0aGVtZSBuYW1lXG4gKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmxpYlR5cGUgZ3JhcGggbGlicmFyeSB0eXBlXG4gKiBAcmV0dXJucyB7b2JqZWN0fSBiYXIgY2hhcnRcbiAqIEBleGFtcGxlXG4gKiB2YXIgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhaW5lci1pZCcpLFxuICogICAgIGRhdGEgPSB7XG4gKiAgICAgICBjYXRlZ29yaWVzOiBbJ2NhdGUxJywgJ2NhdGUyJywgJ2NhdGUzJ10sXG4gKiAgICAgICBzZXJpZXM6IHtcbiAqICAgICAgICAgY29sdW1uOiBbXG4gKiAgICAgICAgICAge1xuICogICAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDEnLFxuICogICAgICAgICAgICAgZGF0YTogWzIwLCAzMCwgNTBdXVxuICogICAgICAgICAgIH0sXG4gKiAgICAgICAgICAge1xuICogICAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDInLFxuICogICAgICAgICAgICAgZGF0YTogWzQwLCA0MCwgNjBdXG4gKiAgICAgICAgICAgfSxcbiAqICAgICAgICAgICB7XG4gKiAgICAgICAgICAgICBuYW1lOiAnTGVnZW5kMycsXG4gKiAgICAgICAgICAgICBkYXRhOiBbNjAsIDUwLCAxMF1cbiAqICAgICAgICAgICB9LFxuICogICAgICAgICAgIHtcbiAqICAgICAgICAgICAgIG5hbWU6ICdMZWdlbmQ0JyxcbiAqICAgICAgICAgICAgIGRhdGE6IFs4MCwgMTAsIDcwXVxuICogICAgICAgICAgIH1cbiAqICAgICAgICAgfSxcbiAqICAgICAgICAgbGluZTogW1xuICogICAgICAgICAgIHtcbiAqICAgICAgICAgICAgIG5hbWU6ICdMZWdlbmQ1JyxcbiAqICAgICAgICAgICAgIGRhdGE6IFsxLCAyLCAzXVxuICogICAgICAgICAgIH1cbiAqICAgICAgICAgXVxuICogICAgICAgfVxuICogICAgIH0sXG4gKiAgICAgb3B0aW9ucyA9IHtcbiAqICAgICAgIGNoYXJ0OiB7XG4gKiAgICAgICAgIHRpdGxlOiAnQ29tYm8gQ2hhcnQnXG4gKiAgICAgICB9LFxuICogICAgICAgeUF4aXM6W1xuICogICAgICAgICB7XG4gKiAgICAgICAgICAgdGl0bGU6ICdZIEF4aXMnLFxuICogICAgICAgICAgIGNoYXJ0VHlwZTogJ2xpbmUnXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICB0aXRsZTogJ1kgUmlnaHQgQXhpcydcbiAqICAgICAgICAgfVxuICogICAgICAgXSxcbiAqICAgICAgIHhBeGlzOiB7XG4gKiAgICAgICAgIHRpdGxlOiAnWCBBeGlzJ1xuICogICAgICAgfSxcbiAqICAgICAgIHNlcmllczoge1xuICogICAgICAgICBoYXNEb3Q6IHRydWVcbiAqICAgICAgIH1cbiAqICAgICB9O1xuICogdHVpLmNoYXJ0LmNvbWJvQ2hhcnQoY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKTtcbiAqL1xudHVpLmNoYXJ0LmNvbWJvQ2hhcnQgPSBmdW5jdGlvbihjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICBvcHRpb25zLmNoYXJ0VHlwZSA9IGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9DT01CTztcbiAgICByZXR1cm4gX2NyZWF0ZUNoYXJ0KGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucyk7XG59O1xuXG4vKipcbiAqIFBpZSBjaGFydCBjcmVhdG9yLlxuICogQG1lbWJlck9mIHR1aS5jaGFydFxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNoYXJ0IGNvbnRhaW5lclxuICogQHBhcmFtIHtvYmplY3R9IGRhdGEgY2hhcnQgZGF0YVxuICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IGRhdGEuc2VyaWVzIHNlcmllcyBkYXRhXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLmNoYXJ0IGNoYXJ0IG9wdGlvbnNcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmNoYXJ0LndpZHRoIGNoYXJ0IHdpZHRoXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5jaGFydC5oZWlnaHQgY2hhcnQgaGVpZ2h0XG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jaGFydC50aXRsZSBjaGFydCB0aXRsZVxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuY2hhcnQuZm9ybWF0IHZhbHVlIGZvcm1hdFxuICogICAgICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5zZXJpZXMgb3B0aW9ucyBvZiBzZXJpZXNcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnNlcmllcy5sZWdlbmRUeXBlIGxlZ2VuZCB0eXBlXG4gKiAgICAgICAgICBAcGFyYW0ge2Jvb2xlYW59IG9wdGlvbnMuc2VyaWVzLnNob3dMYWJlbCB3aGV0aGVyIHNob3cgbGFiZWwgb3Igbm90XG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnRvb2x0aXAgb3B0aW9ucyBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnN1ZmZpeCBzdWZmaXggb2YgdG9vbHRpcFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9vbHRpcC50ZW1wbGF0ZSB0ZW1wbGF0ZSBvZiB0b29sdGlwXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50b29sdGlwLnBvc2l0aW9uIHRvb2x0aXAgcG9zaXRpb24gdHlwZVxuICogICAgICAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMudG9vbHRpcC5hZGRQb3NpdGlvbiBhZGQgcG9zaXRpb25cbiAqICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uLmxlZnQgYWRkIGxlZnQgcG9zaXRpb25cbiAqICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy50b29sdGlwLmFkZFBvc2l0aW9uLnRvcCBhZGQgdG9wIHBvc2l0aW9uXG4gKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRoZW1lIHRoZW1lIG5hbWVcbiAqICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMubGliVHlwZSBncmFwaCBsaWJyYXJ5IHR5cGVcbiAqIEByZXR1cm5zIHtvYmplY3R9IGJhciBjaGFydFxuICogQGV4YW1wbGVcbiAqIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFpbmVyLWlkJyksXG4gKiAgICAgZGF0YSA9IHtcbiAqICAgICAgIHNlcmllczogW1xuICogICAgICAgICB7XG4gKiAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDEnLFxuICogICAgICAgICAgIGRhdGE6IDIwXG4gKiAgICAgICAgIH0sXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBuYW1lOiAnTGVnZW5kMicsXG4gKiAgICAgICAgICAgZGF0YTogNDBcbiAqICAgICAgICAgfSxcbiAqICAgICAgICAge1xuICogICAgICAgICAgIG5hbWU6ICdMZWdlbmQzJyxcbiAqICAgICAgICAgICBkYXRhOiA2MFxuICogICAgICAgICB9LFxuICogICAgICAgICB7XG4gKiAgICAgICAgICAgbmFtZTogJ0xlZ2VuZDQnLFxuICogICAgICAgICAgIGRhdGE6IDgwXG4gKiAgICAgICAgIH1cbiAqICAgICAgIF1cbiAqICAgICB9LFxuICogICAgIG9wdGlvbnMgPSB7XG4gKiAgICAgICBjaGFydDoge1xuICogICAgICAgICB0aXRsZTogJ1BpZSBDaGFydCdcbiAqICAgICAgIH1cbiAqICAgICB9O1xuICogdHVpLmNoYXJ0LnBpZUNoYXJ0KGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucyk7XG4gKi9cbnR1aS5jaGFydC5waWVDaGFydCA9IGZ1bmN0aW9uKGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIG9wdGlvbnMuY2hhcnRUeXBlID0gY2hhcnRDb25zdC5DSEFSVF9UWVBFX1BJRTtcbiAgICByZXR1cm4gX2NyZWF0ZUNoYXJ0KGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucyk7XG59O1xuXG4vKipcbiAqIFJlZ2lzdGVyIHRoZW1lLlxuICogQG1lbWJlck9mIHR1aS5jaGFydFxuICogQHBhcmFtIHtzdHJpbmd9IHRoZW1lTmFtZSB0aGVtZSBuYW1lXG4gKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgYXBwbGljYXRpb24gY2hhcnQgdGhlbWVcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IHRoZW1lLmNoYXJ0IGNoYXJ0IHRoZW1lXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUuY2hhcnQuZm9udEZhbWlseSBmb250IGZhbWlseSBvZiBjaGFydFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLmNoYXJ0LmJhY2tncm91bmQgYmFja2dyb3VuZCBvZiBjaGFydFxuICogICAgICBAcGFyYW0ge29iamVjdH0gdGhlbWUudGl0bGUgY2hhcnQgdGhlbWVcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSB0aGVtZS50aXRsZS5mb250U2l6ZSBmb250IHNpemUgb2YgY2hhcnQgdGl0bGVcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS50aXRsZS5mb250RmFtaWx5IGZvbnQgZmFtaWx5IG9mIGNoYXJ0IHRpdGxlXG4gKiAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUudGl0bGUuY29sb3IgZm9udCBjb2xvciBvZiBjaGFydCB0aXRsZVxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnRpdGxlLmJhY2tncm91bmQgYmFja2dyb3VuZCBvZiBjaGFydCB0aXRsZVxuICogICAgICBAcGFyYW0ge29iamVjdH0gdGhlbWUueUF4aXMgdGhlbWUgb2YgdmVydGljYWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtvYmplY3R9IHRoZW1lLnlBeGlzLnRpdGxlIHRoZW1lIG9mIHZlcnRpY2FsIGF4aXMgdGl0bGVcbiAqICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gdGhlbWUueUF4aXMudGl0bGUuZm9udFNpemUgZm9udCBzaXplIG9mIHZlcnRpY2FsIGF4aXMgdGl0bGVcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUueUF4aXMudGl0bGUuZm9udEZhbWlseSBmb250IGZhbWlseSBvZiB2ZXJ0aWNhbCBheGlzIHRpdGxlXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnlBeGlzLnRpdGxlLmNvbG9yIGZvbnQgY29sb3Igb2YgdmVydGljYWwgYXhpcyB0aXRsZVxuICogICAgICAgICAgQHBhcmFtIHtvYmplY3R9IHRoZW1lLnlBeGlzLmxhYmVsIHRoZW1lIG9mIHZlcnRpY2FsIGF4aXMgbGFiZWxcbiAqICAgICAgICAgICAgICBAcGFyYW0ge251bWJlcn0gdGhlbWUueUF4aXMubGFiZWwuZm9udFNpemUgZm9udCBzaXplIG9mIHZlcnRpY2FsIGF4aXMgbGFiZWxcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUueUF4aXMubGFiZWwuZm9udEZhbWlseSBmb250IGZhbWlseSBvZiB2ZXJ0aWNhbCBheGlzIGxhYmVsXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnlBeGlzLmxhYmVsLmNvbG9yIGZvbnQgY29sb3Igb2YgdmVydGljYWwgYXhpcyBsYWJlbFxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnlBeGlzLnRpY2tjb2xvciBjb2xvciBvZiB2ZXJ0aWNhbCBheGlzIHRpY2tcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IHRoZW1lLnhBeGlzIHRoZW1lIG9mIGhvcml6b250YWwgYXhpc1xuICogICAgICAgICAgQHBhcmFtIHtvYmplY3R9IHRoZW1lLnhBeGlzLnRpdGxlIHRoZW1lIG9mIGhvcml6b250YWwgYXhpcyB0aXRsZVxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSB0aGVtZS54QXhpcy50aXRsZS5mb250U2l6ZSBmb250IHNpemUgb2YgaG9yaXpvbnRhbCBheGlzIHRpdGxlXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnhBeGlzLnRpdGxlLmZvbnRGYW1pbHkgZm9udCBmYW1pbHkgb2YgaG9yaXpvbnRhbCBheGlzIHRpdGxlXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnhBeGlzLnRpdGxlLmNvbG9yIGZvbnQgY29sb3Igb2YgaG9yaXpvbnRhbCBheGlzIHRpdGxlXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gdGhlbWUueEF4aXMubGFiZWwgdGhlbWUgb2YgaG9yaXpvbnRhbCBheGlzIGxhYmVsXG4gKiAgICAgICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IHRoZW1lLnhBeGlzLmxhYmVsLmZvbnRTaXplIGZvbnQgc2l6ZSBvZiBob3Jpem9udGFsIGF4aXMgbGFiZWxcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUueEF4aXMubGFiZWwuZm9udEZhbWlseSBmb250IGZhbWlseSBvZiBob3Jpem9udGFsIGF4aXMgbGFiZWxcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUueEF4aXMubGFiZWwuY29sb3IgZm9udCBjb2xvciBvZiBob3Jpem9udGFsIGF4aXMgbGFiZWxcbiAqICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS54QXhpcy50aWNrY29sb3IgY29sb3Igb2YgaG9yaXpvbnRhbCBheGlzIHRpY2tcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IHRoZW1lLnBsb3QgcGxvdCB0aGVtZVxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnBsb3QubGluZUNvbG9yIHBsb3QgbGluZSBjb2xvclxuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnBsb3QuYmFja2dyb3VuZCBwbG90IGJhY2tncm91bmRcbiAqICAgICAgQHBhcmFtIHtvYmplY3R9IHRoZW1lLnNlcmllcyBzZXJpZXMgdGhlbWVcbiAqICAgICAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IHRoZW1lLnNlcmllcy5jb2xvcnMgc2VyaWVzIGNvbG9yc1xuICogICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHRoZW1lLnNlcmllcy5ib3JkZXJDb2xvciBzZXJpZXMgYm9yZGVyIGNvbG9yXG4gKiAgICAgIEBwYXJhbSB7b2JqZWN0fSB0aGVtZS5sZWdlbmQgbGVnZW5kIHRoZW1lXG4gKiAgICAgICAgICBAcGFyYW0ge29iamVjdH0gdGhlbWUubGVnZW5kLmxhYmVsIHRoZW1lIG9mIGxlZ2VuZCBsYWJlbFxuICogICAgICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSB0aGVtZS5sZWdlbmQubGFiZWwuZm9udFNpemUgZm9udCBzaXplIG9mIGxlZ2VuZCBsYWJlbFxuICogICAgICAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSB0aGVtZS5sZWdlbmQubGFiZWwuZm9udEZhbWlseSBmb250IGZhbWlseSBvZiBsZWdlbmQgbGFiZWxcbiAqICAgICAgICAgICAgICBAcGFyYW0ge3N0cmluZ30gdGhlbWUubGVnZW5kLmxhYmVsLmNvbG9yIGZvbnQgY29sb3Igb2YgbGVnZW5kIGxhYmVsXG4gKiBAZXhhbXBsZVxuICogdmFyIHRoZW1lID0ge1xuICogICB5QXhpczoge1xuICogICAgIHRpY2tDb2xvcjogJyNjY2JkOWEnLFxuICogICAgICAgdGl0bGU6IHtcbiAqICAgICAgICAgY29sb3I6ICcjMzMzMzMzJ1xuICogICAgICAgfSxcbiAqICAgICAgIGxhYmVsOiB7XG4gKiAgICAgICAgIGNvbG9yOiAnIzZmNDkxZCdcbiAqICAgICAgIH1cbiAqICAgICB9LFxuICogICAgIHhBeGlzOiB7XG4gKiAgICAgICB0aWNrQ29sb3I6ICcjY2NiZDlhJyxcbiAqICAgICAgIHRpdGxlOiB7XG4gKiAgICAgICAgIGNvbG9yOiAnIzMzMzMzMydcbiAqICAgICAgIH0sXG4gKiAgICAgICBsYWJlbDoge1xuICogICAgICAgICBjb2xvcjogJyM2ZjQ5MWQnXG4gKiAgICAgICB9XG4gKiAgICAgfSxcbiAqICAgICBwbG90OiB7XG4gKiAgICAgICBsaW5lQ29sb3I6ICcjZTVkYmM0JyxcbiAqICAgICAgIGJhY2tncm91bmQ6ICcjZjZmMWU1J1xuICogICAgIH0sXG4gKiAgICAgc2VyaWVzOiB7XG4gKiAgICAgICBjb2xvcnM6IFsnIzQwYWJiNCcsICcjZTc4YTMxJywgJyNjMWM0NTInLCAnIzc5NTIyNCcsICcjZjVmNWY1J10sXG4gKiAgICAgICBib3JkZXJDb2xvcjogJyM4ZTY1MzUnXG4gKiAgICAgfSxcbiAqICAgICBsZWdlbmQ6IHtcbiAqICAgICAgIGxhYmVsOiB7XG4gKiAgICAgICAgIGNvbG9yOiAnIzZmNDkxZCdcbiAqICAgICAgIH1cbiAqICAgICB9XG4gKiAgIH07XG4gKiBjaGFydC5yZWdpc3RlclRoZW1lKCduZXdUaGVtZScsIHRoZW1lKTtcbiAqL1xudHVpLmNoYXJ0LnJlZ2lzdGVyVGhlbWUgPSBmdW5jdGlvbih0aGVtZU5hbWUsIHRoZW1lKSB7XG4gICAgdGhlbWVGYWN0b3J5LnJlZ2lzdGVyKHRoZW1lTmFtZSwgdGhlbWUpO1xufTtcblxuLyoqXG4gKiBSZWdpc3RlciBncmFwaCBwbHVnaW4uXG4gKiBAbWVtYmVyT2YgdHVpLmNoYXJ0XG4gKiBAcGFyYW0ge3N0cmluZ30gbGliVHlwZSB0eXBlIG9mIGdyYXBoIGxpYnJhcnlcbiAqIEBwYXJhbSB7b2JqZWN0fSBwbHVnaW4gcGx1Z2luIHRvIGNvbnRyb2wgbGlicmFyeVxuICogQGV4YW1wbGVcbiAqIHZhciBwbHVnaW5SYXBoYWVsID0ge1xuICogICBiYXI6IGZ1bmN0aW9uKCkge30gLy8gUmVuZGVyIGNsYXNzXG4gKiB9O1xuICogdHVpLmNoYXJ0LnJlZ2lzdGVyUGx1Z2luKCdyYXBoYWVsJywgcGx1Z2luUmFwaGFlbCk7XG4gKi9cbnR1aS5jaGFydC5yZWdpc3RlclBsdWdpbiA9IGZ1bmN0aW9uKGxpYlR5cGUsIHBsdWdpbikge1xuICAgIHBsdWdpbkZhY3RvcnkucmVnaXN0ZXIobGliVHlwZSwgcGx1Z2luKTtcbn07XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgQXJlYSBjaGFydFxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ2hhcnRCYXNlID0gcmVxdWlyZSgnLi9jaGFydEJhc2UnKSxcbiAgICBsaW5lVHlwZU1peGVyID0gcmVxdWlyZSgnLi9saW5lVHlwZU1peGVyJyksXG4gICAgYXhpc1R5cGVNaXhlciA9IHJlcXVpcmUoJy4vYXhpc1R5cGVNaXhlcicpLFxuICAgIHZlcnRpY2FsVHlwZU1peGVyID0gcmVxdWlyZSgnLi92ZXJ0aWNhbFR5cGVNaXhlcicpLFxuICAgIFNlcmllcyA9IHJlcXVpcmUoJy4uL3Nlcmllcy9hcmVhQ2hhcnRTZXJpZXMnKTtcblxudmFyIEFyZWFDaGFydCA9IHR1aS51dGlsLmRlZmluZUNsYXNzKENoYXJ0QmFzZSwgLyoqIEBsZW5kcyBMaW5lQ2hhcnQucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBjbGFzc05hbWVcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIGNsYXNzTmFtZTogJ3R1aS1hcmVhLWNoYXJ0JyxcblxuICAgIC8qKlxuICAgICAqIFNlcmllcyBjbGFzc1xuICAgICAqIEB0eXBlIHtmdW5jdGlvbn1cbiAgICAgKi9cbiAgICBTZXJpZXM6IFNlcmllcyxcblxuICAgIC8qKlxuICAgICAqIEFyZWEgY2hhcnQuXG4gICAgICogQGNvbnN0cnVjdHMgQXJlYUNoYXJ0XG4gICAgICogQGV4dGVuZHMgQ2hhcnRCYXNlXG4gICAgICogQG1peGVzIGF4aXNUeXBlTWl4ZXJcbiAgICAgKiBAbWl4ZXMgdmVydGljYWxUeXBlTWl4ZXJcbiAgICAgKiBAbWl4ZXMgbGluZVR5cGVNaXhlclxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmxpbmVUeXBlSW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbn0pO1xuXG5saW5lVHlwZU1peGVyLm1peGluKEFyZWFDaGFydCk7XG5heGlzVHlwZU1peGVyLm1peGluKEFyZWFDaGFydCk7XG52ZXJ0aWNhbFR5cGVNaXhlci5taXhpbihBcmVhQ2hhcnQpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFyZWFDaGFydDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBheGlzVHlwZU1peGVyIGlzIG1peGVyIG9mIGF4aXMgdHlwZSBjaGFydChiYXIsIGNvbHVtbiwgbGluZSwgYXJlYSkuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBBeGlzID0gcmVxdWlyZSgnLi4vYXhlcy9heGlzJyksXG4gICAgUGxvdCA9IHJlcXVpcmUoJy4uL3Bsb3RzL3Bsb3QnKSxcbiAgICBMZWdlbmQgPSByZXF1aXJlKCcuLi9sZWdlbmRzL2xlZ2VuZCcpLFxuICAgIFRvb2x0aXAgPSByZXF1aXJlKCcuLi90b29sdGlwcy90b29sdGlwJyksXG4gICAgR3JvdXBUb29sdGlwID0gcmVxdWlyZSgnLi4vdG9vbHRpcHMvZ3JvdXBUb29sdGlwJyk7XG5cbi8qKlxuICogYXhpc1R5cGVNaXhlciBpcyBiYXNlIGNsYXNzIG9mIGF4aXMgdHlwZSBjaGFydChiYXIsIGNvbHVtbiwgbGluZSwgYXJlYSkuXG4gKiBAbWl4aW5cbiAqL1xudmFyIGF4aXNUeXBlTWl4ZXIgPSB7XG4gICAgLyoqXG4gICAgICogQWRkIGF4aXMgY29tcG9uZW50c1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5jb3ZlcnREYXRhIGNvbnZlcnRlZCBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmF4ZXMgYXhlcyBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnBsb3REYXRhIHBsb3QgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHtmdW5jdGlvbn0gcGFyYW1zLlNlcmllcyBzZXJpZXMgY2xhc3NcbiAgICAgKi9cbiAgICBhZGRBeGlzQ29tcG9uZW50czogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBjb252ZXJ0ZWREYXRhID0gcGFyYW1zLmNvbnZlcnRlZERhdGEsXG4gICAgICAgICAgICBvcHRpb25zID0gdGhpcy5vcHRpb25zLFxuICAgICAgICAgICAgYWxpZ25lZCA9ICEhcGFyYW1zLmFsaWduZWQ7XG5cbiAgICAgICAgaWYgKHBhcmFtcy5wbG90RGF0YSkge1xuICAgICAgICAgICAgdGhpcy5hZGRDb21wb25lbnQoJ3Bsb3QnLCBQbG90LCBwYXJhbXMucGxvdERhdGEpO1xuICAgICAgICB9XG5cbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaChwYXJhbXMuYXhlcywgZnVuY3Rpb24oZGF0YSwgbmFtZSkge1xuICAgICAgICAgICAgdGhpcy5hZGRDb21wb25lbnQobmFtZSwgQXhpcywge1xuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgICAgICAgICAgYWxpZ25lZDogYWxpZ25lZFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIGlmIChjb252ZXJ0ZWREYXRhLmpvaW5MZWdlbmRMYWJlbHMpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KCdsZWdlbmQnLCBMZWdlbmQsIHtcbiAgICAgICAgICAgICAgICBqb2luTGVnZW5kTGFiZWxzOiBjb252ZXJ0ZWREYXRhLmpvaW5MZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICAgICAgbGVnZW5kTGFiZWxzOiBjb252ZXJ0ZWREYXRhLmxlZ2VuZExhYmVscyxcbiAgICAgICAgICAgICAgICBjaGFydFR5cGU6IHBhcmFtcy5jaGFydFR5cGVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5hZGRDb21wb25lbnQoJ3NlcmllcycsIHBhcmFtcy5TZXJpZXMsIHR1aS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICBsaWJUeXBlOiBvcHRpb25zLmxpYlR5cGUsXG4gICAgICAgICAgICBjaGFydFR5cGU6IG9wdGlvbnMuY2hhcnRUeXBlLFxuICAgICAgICAgICAgcGFyZW50Q2hhcnRUeXBlOiBvcHRpb25zLnBhcmVudENoYXJ0VHlwZSxcbiAgICAgICAgICAgIGFsaWduZWQ6IGFsaWduZWQsXG4gICAgICAgICAgICBpc1N1YkNoYXJ0OiB0aGlzLmlzU3ViQ2hhcnQsXG4gICAgICAgICAgICBpc0dyb3VwZWRUb29sdGlwOiB0aGlzLmlzR3JvdXBlZFRvb2x0aXBcbiAgICAgICAgfSwgcGFyYW1zLnNlcmllc0RhdGEpKTtcblxuICAgICAgICBpZiAodGhpcy5pc0dyb3VwZWRUb29sdGlwKSB7XG4gICAgICAgICAgICB0aGlzLmFkZENvbXBvbmVudCgndG9vbHRpcCcsIEdyb3VwVG9vbHRpcCwge1xuICAgICAgICAgICAgICAgIGxhYmVsczogY29udmVydGVkRGF0YS5sYWJlbHMsXG4gICAgICAgICAgICAgICAgam9pbkZvcm1hdHRlZFZhbHVlczogY29udmVydGVkRGF0YS5qb2luRm9ybWF0dGVkVmFsdWVzLFxuICAgICAgICAgICAgICAgIGpvaW5MZWdlbmRMYWJlbHM6IGNvbnZlcnRlZERhdGEuam9pbkxlZ2VuZExhYmVscyxcbiAgICAgICAgICAgICAgICBjaGFydElkOiB0aGlzLmNoYXJ0SWRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hZGRDb21wb25lbnQoJ3Rvb2x0aXAnLCBUb29sdGlwLCB7XG4gICAgICAgICAgICAgICAgdmFsdWVzOiBjb252ZXJ0ZWREYXRhLnZhbHVlcyxcbiAgICAgICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXM6IGNvbnZlcnRlZERhdGEuZm9ybWF0dGVkVmFsdWVzLFxuICAgICAgICAgICAgICAgIGxhYmVsczogY29udmVydGVkRGF0YS5sYWJlbHMsXG4gICAgICAgICAgICAgICAgbGVnZW5kTGFiZWxzOiBjb252ZXJ0ZWREYXRhLmxlZ2VuZExhYmVscyxcbiAgICAgICAgICAgICAgICBjaGFydElkOiB0aGlzLmNoYXJ0SWQsXG4gICAgICAgICAgICAgICAgaXNWZXJ0aWNhbDogdGhpcy5pc1ZlcnRpY2FsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHBsb3QgZGF0YS5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGxvdERhdGEgaW5pdGlhbGl6ZWQgcGxvdCBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGF4ZXNEYXRhIGF4ZXMgZGF0YVxuICAgICAqIEByZXR1cm5zIHt7dlRpY2tDb3VudDogbnVtYmVyLCBoVGlja0NvdW50OiBudW1iZXJ9fSBwbG90IGRhdGFcbiAgICAgKi9cbiAgICBtYWtlUGxvdERhdGE6IGZ1bmN0aW9uKHBsb3REYXRhLCBheGVzRGF0YSkge1xuICAgICAgICBpZiAodHVpLnV0aWwuaXNVbmRlZmluZWQocGxvdERhdGEpKSB7XG4gICAgICAgICAgICBwbG90RGF0YSA9IHtcbiAgICAgICAgICAgICAgICB2VGlja0NvdW50OiBheGVzRGF0YS55QXhpcy52YWxpZFRpY2tDb3VudCxcbiAgICAgICAgICAgICAgICBoVGlja0NvdW50OiBheGVzRGF0YS54QXhpcy52YWxpZFRpY2tDb3VudFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGxvdERhdGE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1peCBpbi5cbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBmdW5jIHRhcmdldCBmdW5jdGlvblxuICAgICAqIEBpZ25vcmVcbiAgICAgKi9cbiAgICBtaXhpbjogZnVuY3Rpb24oZnVuYykge1xuICAgICAgICB0dWkudXRpbC5leHRlbmQoZnVuYy5wcm90b3R5cGUsIHRoaXMpO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gYXhpc1R5cGVNaXhlcjtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBCYXIgY2hhcnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBDaGFydEJhc2UgPSByZXF1aXJlKCcuL2NoYXJ0QmFzZScpLFxuICAgIGF4aXNUeXBlTWl4ZXIgPSByZXF1aXJlKCcuL2F4aXNUeXBlTWl4ZXInKSxcbiAgICBheGlzRGF0YU1ha2VyID0gcmVxdWlyZSgnLi4vaGVscGVycy9heGlzRGF0YU1ha2VyJyksXG4gICAgU2VyaWVzID0gcmVxdWlyZSgnLi4vc2VyaWVzL2JhckNoYXJ0U2VyaWVzJyk7XG5cbnZhciBCYXJDaGFydCA9IHR1aS51dGlsLmRlZmluZUNsYXNzKENoYXJ0QmFzZSwgLyoqIEBsZW5kcyBCYXJDaGFydC5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIEJhciBjaGFydC5cbiAgICAgKiBAY29uc3RydWN0cyBCYXJDaGFydFxuICAgICAqIEBleHRlbmRzIENoYXJ0QmFzZVxuICAgICAqIEBtaXhlcyBheGlzVHlwZU1peGVyXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXk+fSB1c2VyRGF0YSBjaGFydCBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIGNoYXJ0IHRoZW1lXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKHVzZXJEYXRhLCB0aGVtZSwgb3B0aW9ucykge1xuICAgICAgICB2YXIgYmFzZURhdGEgPSB0aGlzLm1ha2VCYXNlRGF0YSh1c2VyRGF0YSwgdGhlbWUsIG9wdGlvbnMsIHtcbiAgICAgICAgICAgICAgICBoYXNBeGVzOiB0cnVlXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGNvbnZlcnRlZERhdGEgPSBiYXNlRGF0YS5jb252ZXJ0ZWREYXRhLFxuICAgICAgICAgICAgYm91bmRzID0gYmFzZURhdGEuYm91bmRzLFxuICAgICAgICAgICAgYXhlc0RhdGEgPSB0aGlzLl9tYWtlQXhlc0RhdGEoY29udmVydGVkRGF0YSwgYm91bmRzLCBvcHRpb25zKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogY2xhc3NOYW1lXG4gICAgICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNsYXNzTmFtZSA9ICd0dWktYmFyLWNoYXJ0JztcblxuICAgICAgICBDaGFydEJhc2UuY2FsbCh0aGlzLCB7XG4gICAgICAgICAgICBib3VuZHM6IGJvdW5kcyxcbiAgICAgICAgICAgIGF4ZXNEYXRhOiBheGVzRGF0YSxcbiAgICAgICAgICAgIHRoZW1lOiB0aGVtZSxcbiAgICAgICAgICAgIG9wdGlvbnM6IG9wdGlvbnNcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5fYWRkQ29tcG9uZW50cyhjb252ZXJ0ZWREYXRhLCBheGVzRGF0YSwgb3B0aW9ucyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYXhlcyBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGNvbnZlcnRlZERhdGEgY29udmVydGVkIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYm91bmRzIGNoYXJ0IGJvdW5kc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBheGVzIGRhdGFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQXhlc0RhdGE6IGZ1bmN0aW9uKGNvbnZlcnRlZERhdGEsIGJvdW5kcywgb3B0aW9ucykge1xuICAgICAgICB2YXIgYXhlc0RhdGEgPSB7XG4gICAgICAgICAgICB5QXhpczogYXhpc0RhdGFNYWtlci5tYWtlTGFiZWxBeGlzRGF0YSh7XG4gICAgICAgICAgICAgICAgbGFiZWxzOiBjb252ZXJ0ZWREYXRhLmxhYmVscyxcbiAgICAgICAgICAgICAgICBpc1ZlcnRpY2FsOiB0cnVlXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIHhBeGlzOiBheGlzRGF0YU1ha2VyLm1ha2VWYWx1ZUF4aXNEYXRhKHtcbiAgICAgICAgICAgICAgICB2YWx1ZXM6IGNvbnZlcnRlZERhdGEudmFsdWVzLFxuICAgICAgICAgICAgICAgIHNlcmllc0RpbWVuc2lvbjogYm91bmRzLnNlcmllcy5kaW1lbnNpb24sXG4gICAgICAgICAgICAgICAgc3RhY2tlZDogb3B0aW9ucy5zZXJpZXMgJiYgb3B0aW9ucy5zZXJpZXMuc3RhY2tlZCB8fCAnJyxcbiAgICAgICAgICAgICAgICBjaGFydFR5cGU6IG9wdGlvbnMuY2hhcnRUeXBlLFxuICAgICAgICAgICAgICAgIGZvcm1hdEZ1bmN0aW9uczogY29udmVydGVkRGF0YS5mb3JtYXRGdW5jdGlvbnMsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogb3B0aW9ucy54QXhpc1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGF4ZXNEYXRhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgY29tcG9uZW50c1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb252ZXJ0ZWREYXRhIGNvbnZlcnRlZCBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGF4ZXNEYXRhIGF4ZXMgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hZGRDb21wb25lbnRzOiBmdW5jdGlvbihjb252ZXJ0ZWREYXRhLCBheGVzRGF0YSwgb3B0aW9ucykge1xuICAgICAgICB2YXIgcGxvdERhdGEsIHNlcmllc0RhdGE7XG5cbiAgICAgICAgcGxvdERhdGEgPSB0aGlzLm1ha2VQbG90RGF0YShjb252ZXJ0ZWREYXRhLnBsb3REYXRhLCBheGVzRGF0YSk7XG4gICAgICAgIHNlcmllc0RhdGEgPSB7XG4gICAgICAgICAgICBhbGxvd05lZ2F0aXZlVG9vbHRpcDogdHJ1ZSxcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICB2YWx1ZXM6IGNvbnZlcnRlZERhdGEudmFsdWVzLFxuICAgICAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlczogY29udmVydGVkRGF0YS5mb3JtYXR0ZWRWYWx1ZXMsXG4gICAgICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zOiBjb252ZXJ0ZWREYXRhLmZvcm1hdEZ1bmN0aW9ucyxcbiAgICAgICAgICAgICAgICBzY2FsZTogYXhlc0RhdGEueEF4aXMuc2NhbGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5hZGRBeGlzQ29tcG9uZW50cyh7XG4gICAgICAgICAgICBjb252ZXJ0ZWREYXRhOiBjb252ZXJ0ZWREYXRhLFxuICAgICAgICAgICAgYXhlczogYXhlc0RhdGEsXG4gICAgICAgICAgICBwbG90RGF0YTogcGxvdERhdGEsXG4gICAgICAgICAgICBjaGFydFR5cGU6IG9wdGlvbnMuY2hhcnRUeXBlLFxuICAgICAgICAgICAgU2VyaWVzOiBTZXJpZXMsXG4gICAgICAgICAgICBzZXJpZXNEYXRhOiBzZXJpZXNEYXRhXG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuXG5heGlzVHlwZU1peGVyLm1peGluKEJhckNoYXJ0KTtcblxubW9kdWxlLmV4cG9ydHMgPSBCYXJDaGFydDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBDaGFydEJhc2VcbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuLi9jb25zdCcpLFxuICAgIGRvbSA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZG9tSGFuZGxlcicpLFxuICAgIHJlbmRlclV0aWwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3JlbmRlclV0aWwnKSxcbiAgICBkYXRhQ29udmVydGVyID0gcmVxdWlyZSgnLi4vaGVscGVycy9kYXRhQ29udmVydGVyJyksXG4gICAgYm91bmRzTWFrZXIgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2JvdW5kc01ha2VyJyksXG4gICAgR3JvdXBlZEV2ZW50SGFuZGxlTGF5ZXIgPSByZXF1aXJlKCcuLi9ldmVudEhhbmRsZUxheWVycy9ncm91cGVkRXZlbnRIYW5kbGVMYXllcicpO1xuXG52YXIgQ2hhcnRCYXNlID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBDaGFydEJhc2UucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBDaGFydCBiYXNlLlxuICAgICAqIEBjb25zdHJ1Y3RzIENoYXJ0QmFzZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5ib3VuZHMgY2hhcnQgYm91bmRzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIGNoYXJ0IHRoZW1lXG4gICAgICogICAgICBAcGFyYW0ge3t5QXhpczogb2JlamN0LCB4QXhpczogb2JqZWN0fX0gYXhlc0RhdGEgYXhlcyBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbS5pc1ZlcnRpY2FsIHdoZXRoZXIgdmVydGljYWwgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmluaXRlZERhdGEgaW5pdGlhbGl6ZWQgZGF0YSBmcm9tIGNvbWJvIGNoYXJ0XG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHRoaXMuY2hhcnRJZCA9IHBhcmFtcy5pbml0ZWREYXRhICYmIHBhcmFtcy5pbml0ZWREYXRhLmNoYXJ0SWQgfHwgY2hhcnRDb25zdC5DSEFSX0lEX1BSRUZJWCArICctJyArIChuZXcgRGF0ZSgpKS5nZXRUaW1lKCk7XG4gICAgICAgIHRoaXMuaXNTdWJDaGFydCA9ICEhcGFyYW1zLmluaXRlZERhdGE7XG4gICAgICAgIHRoaXMuY29tcG9uZW50cyA9IFtdO1xuICAgICAgICB0aGlzLmNvbXBvbmVudE1hcCA9IHt9O1xuICAgICAgICB0aGlzLmJvdW5kcyA9IHBhcmFtcy5ib3VuZHM7XG4gICAgICAgIHRoaXMudGhlbWUgPSBwYXJhbXMudGhlbWU7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IHBhcmFtcy5vcHRpb25zO1xuICAgICAgICB0aGlzLmlzU3ViQ2hhcnQgPSAhIXBhcmFtcy5pbml0ZWREYXRhO1xuICAgICAgICB0aGlzLmhhc0F4ZXMgPSAhIXBhcmFtcy5heGVzRGF0YTtcbiAgICAgICAgdGhpcy5pc1ZlcnRpY2FsID0gISFwYXJhbXMuaXNWZXJ0aWNhbDtcbiAgICAgICAgdGhpcy5pc0dyb3VwZWRUb29sdGlwID0gcGFyYW1zLm9wdGlvbnMudG9vbHRpcCAmJiBwYXJhbXMub3B0aW9ucy50b29sdGlwLmdyb3VwZWQ7XG5cbiAgICAgICAgdGhpcy5fYWRkR3JvdXBlZEV2ZW50SGFuZGxlTGF5ZXIocGFyYW1zLmF4ZXNEYXRhLCBwYXJhbXMub3B0aW9ucy5jaGFydFR5cGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgZ3JvdXBlZCBldmVudCBoYW5kbGVyIGxheWVyLlxuICAgICAqIEBwYXJhbSB7e3lBeGlzOiBvYmVqY3QsIHhBeGlzOiBvYmplY3R9fSBheGVzRGF0YSBheGVzIGRhdGFcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY2hhcnRUeXBlIGNoYXJ0IHR5cGVcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzVmVydGljYWwgd2hldGhlciB2ZXJ0aWNhbCBvciBub3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hZGRHcm91cGVkRXZlbnRIYW5kbGVMYXllcjogZnVuY3Rpb24oYXhlc0RhdGEsIGNoYXJ0VHlwZSkge1xuICAgICAgICB2YXIgdGlja0NvdW50O1xuXG4gICAgICAgIGlmICghdGhpcy5oYXNBeGVzIHx8ICF0aGlzLmlzR3JvdXBlZFRvb2x0aXAgfHwgdGhpcy5pc1N1YkNoYXJ0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5pc1ZlcnRpY2FsKSB7XG4gICAgICAgICAgICB0aWNrQ291bnQgPSBheGVzRGF0YS54QXhpcyA/IGF4ZXNEYXRhLnhBeGlzLnRpY2tDb3VudCA6IC0xO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGlja0NvdW50ID0gYXhlc0RhdGEueUF4aXMgPyBheGVzRGF0YS55QXhpcy50aWNrQ291bnQgOiAtMTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KCdldmVudEhhbmRsZUxheWVyJywgR3JvdXBlZEV2ZW50SGFuZGxlTGF5ZXIsIHtcbiAgICAgICAgICAgIHRpY2tDb3VudDogdGlja0NvdW50LFxuICAgICAgICAgICAgY2hhcnRUeXBlOiBjaGFydFR5cGUsXG4gICAgICAgICAgICBpc1ZlcnRpY2FsOiB0aGlzLmlzVmVydGljYWxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYmFlcyBkYXRhLlxuICAgICAqIEBwYXJhbSB7YXJyYXkgfCBvYmplY3R9IHVzZXJEYXRhIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBjaGFydCB0aGVtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIGFkZCBwYXJhbXNcbiAgICAgKiBAcmV0dXJucyB7e2NvbnZlcnRlZERhdGE6IG9iamVjdCwgYm91bmRzOiBvYmplY3R9fSBiYXNlIGRhdGFcbiAgICAgKi9cbiAgICBtYWtlQmFzZURhdGE6IGZ1bmN0aW9uKHVzZXJEYXRhLCB0aGVtZSwgb3B0aW9ucywgcGFyYW1zKSB7XG4gICAgICAgIHZhciBzZXJpZXNDaGFydFR5cGVzID0gcGFyYW1zID8gcGFyYW1zLnNlcmllc0NoYXJ0VHlwZXMgOiBbXSxcbiAgICAgICAgICAgIGNvbnZlcnRlZERhdGEgPSBkYXRhQ29udmVydGVyLmNvbnZlcnQodXNlckRhdGEsIG9wdGlvbnMuY2hhcnQsIG9wdGlvbnMuY2hhcnRUeXBlLCBzZXJpZXNDaGFydFR5cGVzKSxcbiAgICAgICAgICAgIGJvdW5kcyA9IGJvdW5kc01ha2VyLm1ha2UodHVpLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICBjaGFydFR5cGU6IG9wdGlvbnMuY2hhcnRUeXBlLFxuICAgICAgICAgICAgICAgIGNvbnZlcnRlZERhdGE6IGNvbnZlcnRlZERhdGEsXG4gICAgICAgICAgICAgICAgdGhlbWU6IHRoZW1lLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IG9wdGlvbnNcbiAgICAgICAgICAgIH0sIHBhcmFtcykpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjb252ZXJ0ZWREYXRhOiBjb252ZXJ0ZWREYXRhLFxuICAgICAgICAgICAgYm91bmRzOiBib3VuZHNcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIGNvbXBvbmVudC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBjb21wb25lbnQgbmFtZVxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IENvbXBvbmVudCBjb21wb25lbnQgZnVuY3Rpb25cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKi9cbiAgICBhZGRDb21wb25lbnQ6IGZ1bmN0aW9uKG5hbWUsIENvbXBvbmVudCwgcGFyYW1zKSB7XG4gICAgICAgIHZhciBib3VuZCA9IHRoaXMuYm91bmRzW25hbWVdLFxuICAgICAgICAgICAgdGhlbWUgPSB0aGlzLnRoZW1lW25hbWVdLFxuICAgICAgICAgICAgb3B0aW9ucyA9IHRoaXMub3B0aW9uc1tuYW1lXSxcbiAgICAgICAgICAgIGluZGV4ID0gcGFyYW1zLmluZGV4IHx8IDAsXG4gICAgICAgICAgICBjb21tb25QYXJhbXMgPSB7fSxcbiAgICAgICAgICAgIGNvbXBvbmVudDtcblxuICAgICAgICBjb21tb25QYXJhbXMuYm91bmQgPSB0dWkudXRpbC5pc0FycmF5KGJvdW5kKSA/IGJvdW5kW2luZGV4XSA6IGJvdW5kO1xuICAgICAgICBjb21tb25QYXJhbXMudGhlbWUgPSB0dWkudXRpbC5pc0FycmF5KHRoZW1lKSA/IHRoZW1lW2luZGV4XSA6IHRoZW1lO1xuICAgICAgICBjb21tb25QYXJhbXMub3B0aW9ucyA9IHR1aS51dGlsLmlzQXJyYXkob3B0aW9ucykgPyBvcHRpb25zW2luZGV4XSA6IG9wdGlvbnMgfHwge307XG5cbiAgICAgICAgcGFyYW1zID0gdHVpLnV0aWwuZXh0ZW5kKGNvbW1vblBhcmFtcywgcGFyYW1zKTtcbiAgICAgICAgY29tcG9uZW50ID0gbmV3IENvbXBvbmVudChwYXJhbXMpO1xuICAgICAgICB0aGlzLmNvbXBvbmVudHMucHVzaChjb21wb25lbnQpO1xuICAgICAgICB0aGlzLmNvbXBvbmVudE1hcFtuYW1lXSA9IGNvbXBvbmVudDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGN1c3RvbSBldm5ldC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hdHRhY2hDdXN0b21FdmVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmhhc0F4ZXMgJiYgdGhpcy5pc0dyb3VwZWRUb29sdGlwICYmICF0aGlzLmlzU3ViQ2hhcnQpIHtcbiAgICAgICAgICAgIHRoaXMuX2F0dGFjaENvb3JkaW5hdGVFdmVudCgpO1xuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLmhhc0F4ZXMgfHwgIXRoaXMuaXNHcm91cGVkVG9vbHRpcCkge1xuICAgICAgICAgICAgdGhpcy5fYXR0YWNoVG9vbHRpcEV2ZW50KCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIGNoYXJ0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgb2JqZWN0IGZvciBncmFwaCBkcmF3aW5nXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSBjaGFydCBlbGVtZW50XG4gICAgICovXG4gICAgcmVuZGVyOiBmdW5jdGlvbihlbCwgcGFwZXIpIHtcbiAgICAgICAgaWYgKCFlbCkge1xuICAgICAgICAgICAgZWwgPSBkb20uY3JlYXRlKCdESVYnLCB0aGlzLmNsYXNzTmFtZSk7XG5cbiAgICAgICAgICAgIGRvbS5hZGRDbGFzcyhlbCwgJ3R1aS1jaGFydCcpO1xuICAgICAgICAgICAgdGhpcy5fcmVuZGVyVGl0bGUoZWwpO1xuICAgICAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJEaW1lbnNpb24oZWwsIHRoaXMuYm91bmRzLmNoYXJ0LmRpbWVuc2lvbik7XG4gICAgICAgICAgICByZW5kZXJVdGlsLnJlbmRlckJhY2tncm91bmQoZWwsIHRoaXMudGhlbWUuY2hhcnQuYmFja2dyb3VuZCk7XG4gICAgICAgICAgICByZW5kZXJVdGlsLnJlbmRlckZvbnRGYW1pbHkoZWwsIHRoaXMudGhlbWUuY2hhcnQuZm9udEZhbWlseSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9yZW5kZXJDb21wb25lbnRzKGVsLCB0aGlzLmNvbXBvbmVudHMsIHBhcGVyKTtcbiAgICAgICAgdGhpcy5fYXR0YWNoQ3VzdG9tRXZlbnQoKTtcblxuICAgICAgICByZXR1cm4gZWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciB0aXRsZS5cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlclRpdGxlOiBmdW5jdGlvbihlbCkge1xuICAgICAgICB2YXIgY2hhcnRPcHRpb25zID0gdGhpcy5vcHRpb25zLmNoYXJ0IHx8IHt9LFxuICAgICAgICAgICAgZWxUaXRsZSA9IHJlbmRlclV0aWwucmVuZGVyVGl0bGUoY2hhcnRPcHRpb25zLnRpdGxlLCB0aGlzLnRoZW1lLnRpdGxlLCAndHVpLWNoYXJ0LXRpdGxlJyk7XG4gICAgICAgIGRvbS5hcHBlbmQoZWwsIGVsVGl0bGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgY29tcG9uZW50cy5cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY29udGFpbmVyIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxvYmplY3Q+fSBjb21wb25lbnRzIGNvbXBvbmVudHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgb2JqZWN0IGZvciBncmFwaCBkcmF3aW5nXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyQ29tcG9uZW50czogZnVuY3Rpb24oY29udGFpbmVyLCBjb21wb25lbnRzLCBwYXBlcikge1xuICAgICAgICB2YXIgZWxlbWVudHMgPSB0dWkudXRpbC5tYXAoY29tcG9uZW50cywgZnVuY3Rpb24oY29tcG9uZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gY29tcG9uZW50LnJlbmRlcihwYXBlcik7XG4gICAgICAgIH0pO1xuICAgICAgICBkb20uYXBwZW5kKGNvbnRhaW5lciwgZWxlbWVudHMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgcGFwZXIuXG4gICAgICogQHJldHVybnMge29iamVjdH0gcGFwZXJcbiAgICAgKi9cbiAgICBnZXRQYXBlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZXJpZXMgPSB0aGlzLmNvbXBvbmVudE1hcC5zZXJpZXMsXG4gICAgICAgICAgICBwYXBlcjtcblxuICAgICAgICBpZiAoc2VyaWVzKSB7XG4gICAgICAgICAgICBwYXBlciA9IHNlcmllcy5nZXRQYXBlcigpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhcGVyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggY3VzdG9tIGV2ZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYXR0YWNoVG9vbHRpcEV2ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHRvb2x0aXAgPSB0aGlzLmNvbXBvbmVudE1hcC50b29sdGlwLFxuICAgICAgICAgICAgc2VyaWVzID0gdGhpcy5jb21wb25lbnRNYXAuc2VyaWVzO1xuICAgICAgICBpZiAoIXRvb2x0aXAgfHwgIXNlcmllcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHNlcmllcy5vbignc2hvd1Rvb2x0aXAnLCB0b29sdGlwLm9uU2hvdywgdG9vbHRpcCk7XG4gICAgICAgIHNlcmllcy5vbignaGlkZVRvb2x0aXAnLCB0b29sdGlwLm9uSGlkZSwgdG9vbHRpcCk7XG5cbiAgICAgICAgaWYgKCFzZXJpZXMub25TaG93QW5pbWF0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0b29sdGlwLm9uKCdzaG93QW5pbWF0aW9uJywgc2VyaWVzLm9uU2hvd0FuaW1hdGlvbiwgc2VyaWVzKTtcbiAgICAgICAgdG9vbHRpcC5vbignaGlkZUFuaW1hdGlvbicsIHNlcmllcy5vbkhpZGVBbmltYXRpb24sIHNlcmllcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCBjb29yZGluYXRlIGV2ZW50LlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2F0dGFjaENvb3JkaW5hdGVFdmVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBldmVudEhhbmRsZUxheWVyID0gdGhpcy5jb21wb25lbnRNYXAuZXZlbnRIYW5kbGVMYXllcixcbiAgICAgICAgICAgIHRvb2x0aXAgPSB0aGlzLmNvbXBvbmVudE1hcC50b29sdGlwLFxuICAgICAgICAgICAgc2VyaWVzID0gdGhpcy5jb21wb25lbnRNYXAuc2VyaWVzO1xuICAgICAgICBldmVudEhhbmRsZUxheWVyLm9uKCdzaG93R3JvdXBUb29sdGlwJywgdG9vbHRpcC5vblNob3csIHRvb2x0aXApO1xuICAgICAgICBldmVudEhhbmRsZUxheWVyLm9uKCdoaWRlR3JvdXBUb29sdGlwJywgdG9vbHRpcC5vbkhpZGUsIHRvb2x0aXApO1xuXG4gICAgICAgIGlmIChzZXJpZXMpIHtcbiAgICAgICAgICAgIHRvb2x0aXAub24oJ3Nob3dHcm91cEFuaW1hdGlvbicsIHNlcmllcy5vblNob3dHcm91cEFuaW1hdGlvbiwgc2VyaWVzKTtcbiAgICAgICAgICAgIHRvb2x0aXAub24oJ2hpZGVHcm91cEFuaW1hdGlvbicsIHNlcmllcy5vbkhpZGVHcm91cEFuaW1hdGlvbiwgc2VyaWVzKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBbmltYXRlIGNoYXJ0LlxuICAgICAqL1xuICAgIGFuaW1hdGVDaGFydDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHR1aS51dGlsLmZvckVhY2hBcnJheSh0aGlzLmNvbXBvbmVudHMsIGZ1bmN0aW9uKGNvbXBvbmVudCkge1xuICAgICAgICAgICAgaWYgKGNvbXBvbmVudC5hbmltYXRlQ29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LmFuaW1hdGVDb21wb25lbnQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2hhcnRCYXNlO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IENvbHVtbiBjaGFydC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIENoYXJ0QmFzZSA9IHJlcXVpcmUoJy4vY2hhcnRCYXNlJyksXG4gICAgYXhpc1R5cGVNaXhlciA9IHJlcXVpcmUoJy4vYXhpc1R5cGVNaXhlcicpLFxuICAgIHZlcnRpY2FsVHlwZU1peGVyID0gcmVxdWlyZSgnLi92ZXJ0aWNhbFR5cGVNaXhlcicpLFxuICAgIFNlcmllcyA9IHJlcXVpcmUoJy4uL3Nlcmllcy9jb2x1bW5DaGFydFNlcmllcycpO1xuXG52YXIgQ29sdW1uQ2hhcnQgPSB0dWkudXRpbC5kZWZpbmVDbGFzcyhDaGFydEJhc2UsIC8qKiBAbGVuZHMgQ29sdW1uQ2hhcnQucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBDb2x1bW4gY2hhcnQuXG4gICAgICogQGNvbnN0cnVjdHMgQ29sdW1uQ2hhcnRcbiAgICAgKiBAZXh0ZW5kcyBDaGFydEJhc2VcbiAgICAgKiBAbWl4ZXMgYXhpc1R5cGVNaXhlclxuICAgICAqIEBtaXhlcyB2ZXJ0aWNhbFR5cGVNaXhlclxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gdXNlckRhdGEgY2hhcnQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBjaGFydCB0aGVtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gaW5pdGVkRGF0YSBpbml0aWFsaXplZCBkYXRhIGZyb20gY29tYm8gY2hhcnRcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbih1c2VyRGF0YSwgdGhlbWUsIG9wdGlvbnMsIGluaXRlZERhdGEpIHtcbiAgICAgICAgdmFyIGJhc2VEYXRhID0gaW5pdGVkRGF0YSB8fCB0aGlzLm1ha2VCYXNlRGF0YSh1c2VyRGF0YSwgdGhlbWUsIG9wdGlvbnMsIHtcbiAgICAgICAgICAgICAgICBpc1ZlcnRpY2FsOiB0cnVlLFxuICAgICAgICAgICAgICAgIGhhc0F4ZXM6IHRydWVcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgY29udmVydGVkRGF0YSA9IGJhc2VEYXRhLmNvbnZlcnRlZERhdGEsXG4gICAgICAgICAgICBib3VuZHMgPSBiYXNlRGF0YS5ib3VuZHMsXG4gICAgICAgICAgICBheGVzRGF0YSA9IHRoaXMuX21ha2VBeGVzRGF0YShjb252ZXJ0ZWREYXRhLCBib3VuZHMsIG9wdGlvbnMsIGluaXRlZERhdGEpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBjbGFzc05hbWVcbiAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2xhc3NOYW1lID0gJ3R1aS1jb2x1bW4tY2hhcnQnO1xuXG4gICAgICAgIENoYXJ0QmFzZS5jYWxsKHRoaXMsIHtcbiAgICAgICAgICAgIGJvdW5kczogYm91bmRzLFxuICAgICAgICAgICAgYXhlc0RhdGE6IGF4ZXNEYXRhLFxuICAgICAgICAgICAgdGhlbWU6IHRoZW1lLFxuICAgICAgICAgICAgb3B0aW9uczogb3B0aW9ucyxcbiAgICAgICAgICAgIGlzVmVydGljYWw6IHRydWUsXG4gICAgICAgICAgICBpbml0ZWREYXRhOiBpbml0ZWREYXRhXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuX2FkZENvbXBvbmVudHMoY29udmVydGVkRGF0YSwgYXhlc0RhdGEsIG9wdGlvbnMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgY29tcG9uZW50c1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb252ZXJ0ZWREYXRhIGNvbnZlcnRlZCBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGF4ZXNEYXRhIGF4ZXMgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hZGRDb21wb25lbnRzOiBmdW5jdGlvbihjb252ZXJ0ZWREYXRhLCBheGVzRGF0YSwgb3B0aW9ucykge1xuICAgICAgICB2YXIgcGxvdERhdGEsIHNlcmllc0RhdGE7XG5cbiAgICAgICAgcGxvdERhdGEgPSB0aGlzLm1ha2VQbG90RGF0YShjb252ZXJ0ZWREYXRhLnBsb3REYXRhLCBheGVzRGF0YSk7XG4gICAgICAgIHNlcmllc0RhdGEgPSB7XG4gICAgICAgICAgICBhbGxvd05lZ2F0aXZlVG9vbHRpcDogdHJ1ZSxcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICB2YWx1ZXM6IGNvbnZlcnRlZERhdGEudmFsdWVzLFxuICAgICAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlczogY29udmVydGVkRGF0YS5mb3JtYXR0ZWRWYWx1ZXMsXG4gICAgICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zOiBjb252ZXJ0ZWREYXRhLmZvcm1hdEZ1bmN0aW9ucyxcbiAgICAgICAgICAgICAgICBzY2FsZTogYXhlc0RhdGEueUF4aXMuc2NhbGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5hZGRBeGlzQ29tcG9uZW50cyh7XG4gICAgICAgICAgICBjb252ZXJ0ZWREYXRhOiBjb252ZXJ0ZWREYXRhLFxuICAgICAgICAgICAgYXhlczogYXhlc0RhdGEsXG4gICAgICAgICAgICBwbG90RGF0YTogcGxvdERhdGEsXG4gICAgICAgICAgICBjaGFydFR5cGU6IG9wdGlvbnMuY2hhcnRUeXBlLFxuICAgICAgICAgICAgU2VyaWVzOiBTZXJpZXMsXG4gICAgICAgICAgICBzZXJpZXNEYXRhOiBzZXJpZXNEYXRhXG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuXG5heGlzVHlwZU1peGVyLm1peGluKENvbHVtbkNoYXJ0KTtcbnZlcnRpY2FsVHlwZU1peGVyLm1peGluKENvbHVtbkNoYXJ0KTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb2x1bW5DaGFydDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBDb21ibyBjaGFydC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGNhbGN1bGF0b3IgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2NhbGN1bGF0b3InKSxcbiAgICBDaGFydEJhc2UgPSByZXF1aXJlKCcuL2NoYXJ0QmFzZScpLFxuICAgIGF4aXNEYXRhTWFrZXIgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2F4aXNEYXRhTWFrZXInKSxcbiAgICBkZWZhdWx0VGhlbWUgPSByZXF1aXJlKCcuLi90aGVtZXMvZGVmYXVsdFRoZW1lJyksXG4gICAgR3JvdXBUb29sdGlwID0gcmVxdWlyZSgnLi4vdG9vbHRpcHMvZ3JvdXBUb29sdGlwJyksXG4gICAgQ29sdW1uQ2hhcnQgPSByZXF1aXJlKCcuL2NvbHVtbkNoYXJ0JyksXG4gICAgTGluZUNoYXJ0ID0gcmVxdWlyZSgnLi9saW5lQ2hhcnQnKTtcblxudmFyIENvbWJvQ2hhcnQgPSB0dWkudXRpbC5kZWZpbmVDbGFzcyhDaGFydEJhc2UsIC8qKiBAbGVuZHMgQ29tYm9DaGFydC5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIENvbWJvIGNoYXJ0LlxuICAgICAqIEBjb25zdHJ1Y3RzIENvbWJvQ2hhcnRcbiAgICAgKiBAZXh0ZW5kcyBDaGFydEJhc2VcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheT59IHVzZXJEYXRhIGNoYXJ0IGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgY2hhcnQgdGhlbWVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24odXNlckRhdGEsIHRoZW1lLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciBzZXJpZXNDaGFydFR5cGVzID0gdHVpLnV0aWwua2V5cyh1c2VyRGF0YS5zZXJpZXMpLnNvcnQoKSxcbiAgICAgICAgICAgIG9wdGlvbkNoYXJ0VHlwZXMgPSB0aGlzLl9nZXRZQXhpc09wdGlvbkNoYXJ0VHlwZXMoc2VyaWVzQ2hhcnRUeXBlcywgb3B0aW9ucy55QXhpcyksXG4gICAgICAgICAgICBjaGFydFR5cGVzID0gb3B0aW9uQ2hhcnRUeXBlcy5sZW5ndGggPyBvcHRpb25DaGFydFR5cGVzIDogc2VyaWVzQ2hhcnRUeXBlcyxcbiAgICAgICAgICAgIGJhc2VEYXRhID0gdGhpcy5tYWtlQmFzZURhdGEodXNlckRhdGEsIHRoZW1lLCBvcHRpb25zLCB7XG4gICAgICAgICAgICAgICAgaXNWZXJ0aWNhbDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBoYXNBeGVzOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNlcmllc0NoYXJ0VHlwZXM6IHNlcmllc0NoYXJ0VHlwZXMsXG4gICAgICAgICAgICAgICAgb3B0aW9uQ2hhcnRUeXBlczogb3B0aW9uQ2hhcnRUeXBlc1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBjb252ZXJ0ZWREYXRhID0gYmFzZURhdGEuY29udmVydGVkRGF0YSxcbiAgICAgICAgICAgIGJvdW5kcyA9IGJhc2VEYXRhLmJvdW5kcyxcbiAgICAgICAgICAgIG9wdGlvbnNNYXAgPSB0aGlzLl9tYWtlT3B0aW9uc01hcChjaGFydFR5cGVzLCBvcHRpb25zKSxcbiAgICAgICAgICAgIHRoZW1lTWFwID0gdGhpcy5fbWFrZVRoZW1lTWFwKHNlcmllc0NoYXJ0VHlwZXMsIHRoZW1lLCBjb252ZXJ0ZWREYXRhLmxlZ2VuZExhYmVscyksXG4gICAgICAgICAgICB5QXhpc1BhcmFtcyA9IHtcbiAgICAgICAgICAgICAgICBjb252ZXJ0ZWREYXRhOiBjb252ZXJ0ZWREYXRhLFxuICAgICAgICAgICAgICAgIHNlcmllc0RpbWVuc2lvbjogYm91bmRzLnNlcmllcy5kaW1lbnNpb24sXG4gICAgICAgICAgICAgICAgY2hhcnRUeXBlczogY2hhcnRUeXBlcyxcbiAgICAgICAgICAgICAgICBpc09uZVlBeGlzOiAhb3B0aW9uQ2hhcnRUeXBlcy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJhc2VBeGVzRGF0YSA9IHt9O1xuXG4gICAgICAgIGJhc2VBeGVzRGF0YS55QXhpcyA9IHRoaXMuX21ha2VZQXhpc0RhdGEodHVpLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgIGluZGV4OiAwXG4gICAgICAgIH0sIHlBeGlzUGFyYW1zKSk7XG5cbiAgICAgICAgYmFzZUF4ZXNEYXRhLnhBeGlzID0gYXhpc0RhdGFNYWtlci5tYWtlTGFiZWxBeGlzRGF0YSh7XG4gICAgICAgICAgICBsYWJlbHM6IGNvbnZlcnRlZERhdGEubGFiZWxzXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuY2xhc3NOYW1lID0gJ3R1aS1jb21iby1jaGFydCc7XG5cbiAgICAgICAgQ2hhcnRCYXNlLmNhbGwodGhpcywge1xuICAgICAgICAgICAgYm91bmRzOiBib3VuZHMsXG4gICAgICAgICAgICBheGVzRGF0YTogYmFzZUF4ZXNEYXRhLFxuICAgICAgICAgICAgdGhlbWU6IHRoZW1lLFxuICAgICAgICAgICAgb3B0aW9uczogb3B0aW9ucyxcbiAgICAgICAgICAgIGlzVmVydGljYWw6IHRydWVcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5hZGRDb21wb25lbnQoJ3Rvb2x0aXAnLCBHcm91cFRvb2x0aXAsIHtcbiAgICAgICAgICAgIGxhYmVsczogY29udmVydGVkRGF0YS5sYWJlbHMsXG4gICAgICAgICAgICBqb2luRm9ybWF0dGVkVmFsdWVzOiBjb252ZXJ0ZWREYXRhLmpvaW5Gb3JtYXR0ZWRWYWx1ZXMsXG4gICAgICAgICAgICBqb2luTGVnZW5kTGFiZWxzOiBjb252ZXJ0ZWREYXRhLmpvaW5MZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICBjaGFydElkOiB0aGlzLmNoYXJ0SWRcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5faW5zdGFsbENoYXJ0cyh7XG4gICAgICAgICAgICB1c2VyRGF0YTogdXNlckRhdGEsXG4gICAgICAgICAgICBiYXNlRGF0YTogYmFzZURhdGEsXG4gICAgICAgICAgICBiYXNlQXhlc0RhdGE6IGJhc2VBeGVzRGF0YSxcbiAgICAgICAgICAgIGF4ZXNEYXRhOiB0aGlzLl9tYWtlQXhlc0RhdGEoYmFzZUF4ZXNEYXRhLCB5QXhpc1BhcmFtcywgY29udmVydGVkRGF0YS5mb3JtYXRGdW5jdGlvbnMpLFxuICAgICAgICAgICAgc2VyaWVzQ2hhcnRUeXBlczogc2VyaWVzQ2hhcnRUeXBlcyxcbiAgICAgICAgICAgIG9wdGlvbnNNYXA6IG9wdGlvbnNNYXAsXG4gICAgICAgICAgICB0aGVtZU1hcDogdGhlbWVNYXBcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB5IGF4aXMgb3B0aW9uIGNoYXJ0IHR5cGVzLlxuICAgICAqIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGNoYXJ0VHlwZXMgY2hhcnQgdHlwZXNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0geUF4aXNPcHRpb25zIHkgYXhpcyBvcHRpb25zXG4gICAgICogQHJldHVybnMge2FycmF5LjxzdHJpbmc+fSBjaGFydCB0eXBlc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFlBeGlzT3B0aW9uQ2hhcnRUeXBlczogZnVuY3Rpb24oY2hhcnRUeXBlcywgeUF4aXNPcHRpb25zKSB7XG4gICAgICAgIHZhciByZXN1bHRDaGFydFR5cGVzID0gY2hhcnRUeXBlcy5zbGljZSgpLFxuICAgICAgICAgICAgaXNSZXZlcnNlID0gZmFsc2UsXG4gICAgICAgICAgICBvcHRpb25DaGFydFR5cGVzO1xuXG4gICAgICAgIHlBeGlzT3B0aW9ucyA9IHlBeGlzT3B0aW9ucyA/IFtdLmNvbmNhdCh5QXhpc09wdGlvbnMpIDogW107XG5cbiAgICAgICAgaWYgKHlBeGlzT3B0aW9ucy5sZW5ndGggPT09IDEgJiYgIXlBeGlzT3B0aW9uc1swXS5jaGFydFR5cGUpIHtcbiAgICAgICAgICAgIHJlc3VsdENoYXJ0VHlwZXMgPSBbXTtcbiAgICAgICAgfSBlbHNlIGlmICh5QXhpc09wdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICBvcHRpb25DaGFydFR5cGVzID0gdHVpLnV0aWwubWFwKHlBeGlzT3B0aW9ucywgZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbi5jaGFydFR5cGU7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdHVpLnV0aWwuZm9yRWFjaEFycmF5KG9wdGlvbkNoYXJ0VHlwZXMsIGZ1bmN0aW9uKGNoYXJ0VHlwZSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICBpc1JldmVyc2UgPSBpc1JldmVyc2UgfHwgKGNoYXJ0VHlwZSAmJiByZXN1bHRDaGFydFR5cGVzW2luZGV4XSAhPT0gY2hhcnRUeXBlIHx8IGZhbHNlKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAoaXNSZXZlcnNlKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0Q2hhcnRUeXBlcy5yZXZlcnNlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0Q2hhcnRUeXBlcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSB5IGF4aXMgZGF0YS5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuaW5kZXggY2hhcnQgaW5kZXhcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuY29udmVydGVkRGF0YSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBwYXJhbXMuc2VyaWVzRGltZW5zaW9uIHNlcmllcyBkaW1lbnNpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGNoYXJ0VHlwZXMgY2hhcnQgdHlwZVxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBpc09uZVlBeGlzIHdoZXRoZXIgb25lIHNlcmllcyBvciBub3RcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBhZGRQYXJhbXMgYWRkIHBhcmFtc1xuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHkgYXhpcyBkYXRhXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVlBeGlzRGF0YTogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBjb252ZXJ0ZWREYXRhID0gcGFyYW1zLmNvbnZlcnRlZERhdGEsXG4gICAgICAgICAgICBpbmRleCA9IHBhcmFtcy5pbmRleCxcbiAgICAgICAgICAgIGNoYXJ0VHlwZSA9IHBhcmFtcy5jaGFydFR5cGVzW2luZGV4XSxcbiAgICAgICAgICAgIG9wdGlvbnMgPSBwYXJhbXMub3B0aW9ucyxcbiAgICAgICAgICAgIHlBeGlzVmFsdWVzLCB5QXhpc09wdGlvbnMsIHNlcmllc09wdGlvbjtcblxuICAgICAgICBpZiAocGFyYW1zLmlzT25lWUF4aXMpIHtcbiAgICAgICAgICAgIHlBeGlzVmFsdWVzID0gY29udmVydGVkRGF0YS5qb2luVmFsdWVzO1xuICAgICAgICAgICAgeUF4aXNPcHRpb25zID0gW29wdGlvbnMueUF4aXNdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgeUF4aXNWYWx1ZXMgPSBjb252ZXJ0ZWREYXRhLnZhbHVlc1tjaGFydFR5cGVdO1xuICAgICAgICAgICAgeUF4aXNPcHRpb25zID0gb3B0aW9ucy55QXhpcyB8fCBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNlcmllc09wdGlvbiA9IG9wdGlvbnMuc2VyaWVzICYmIG9wdGlvbnMuc2VyaWVzW2NoYXJ0VHlwZV0gfHwgb3B0aW9ucy5zZXJpZXM7XG5cbiAgICAgICAgcmV0dXJuIGF4aXNEYXRhTWFrZXIubWFrZVZhbHVlQXhpc0RhdGEodHVpLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgIHZhbHVlczogeUF4aXNWYWx1ZXMsXG4gICAgICAgICAgICBzdGFja2VkOiBzZXJpZXNPcHRpb24gJiYgc2VyaWVzT3B0aW9uLnN0YWNrZWQgfHwgJycsXG4gICAgICAgICAgICBvcHRpb25zOiB5QXhpc09wdGlvbnNbaW5kZXhdLFxuICAgICAgICAgICAgY2hhcnRUeXBlOiBjaGFydFR5cGUsXG4gICAgICAgICAgICBzZXJpZXNEaW1lbnNpb246IHBhcmFtcy5zZXJpZXNEaW1lbnNpb24sXG4gICAgICAgICAgICBmb3JtYXRGdW5jdGlvbnM6IGNvbnZlcnRlZERhdGEuZm9ybWF0RnVuY3Rpb25zLFxuICAgICAgICAgICAgaXNWZXJ0aWNhbDogdHJ1ZVxuICAgICAgICB9LCBwYXJhbXMuYWRkUGFyYW1zKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYXhlcyBkYXRhLlxuICAgICAqIEBwYXJhbSB7e3lBeGlzOiBvYmplY3QsIHhBeGlzOiBvYmplY3R9fSBiYXNlQXhlc0RhdGEgYmFzZSBheGVzIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0geUF4aXNQYXJhbXMgeSBheGlzIHBhcmFtc1xuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IGF4ZXMgZGF0YVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VBeGVzRGF0YTogZnVuY3Rpb24oYmFzZUF4ZXNEYXRhLCB5QXhpc1BhcmFtcywgZm9ybWF0RnVuY3Rpb25zKSB7XG4gICAgICAgIHZhciB5QXhpc0RhdGEgPSBiYXNlQXhlc0RhdGEueUF4aXMsXG4gICAgICAgICAgICBjaGFydFR5cGVzID0geUF4aXNQYXJhbXMuY2hhcnRUeXBlcyxcbiAgICAgICAgICAgIGF4ZXNEYXRhID0ge30sXG4gICAgICAgICAgICB5ckF4aXNEYXRhO1xuICAgICAgICBpZiAoIXlBeGlzUGFyYW1zLmlzT25lWUF4aXMpIHtcbiAgICAgICAgICAgIHlyQXhpc0RhdGEgPSB0aGlzLl9tYWtlWUF4aXNEYXRhKHR1aS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgaW5kZXg6IDEsXG4gICAgICAgICAgICAgICAgYWRkUGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgICAgIGlzUG9zaXRpb25SaWdodDogdHJ1ZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHlBeGlzUGFyYW1zKSk7XG4gICAgICAgICAgICBpZiAoeUF4aXNEYXRhLnRpY2tDb3VudCA8IHlyQXhpc0RhdGEudGlja0NvdW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5jcmVhc2VZQXhpc1RpY2tDb3VudCh5ckF4aXNEYXRhLnRpY2tDb3VudCAtIHlBeGlzRGF0YS50aWNrQ291bnQsIHlBeGlzRGF0YSwgZm9ybWF0RnVuY3Rpb25zKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoeUF4aXNEYXRhLnRpY2tDb3VudCA+IHlyQXhpc0RhdGEudGlja0NvdW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5jcmVhc2VZQXhpc1RpY2tDb3VudCh5QXhpc0RhdGEudGlja0NvdW50IC0geXJBeGlzRGF0YS50aWNrQ291bnQsIHlyQXhpc0RhdGEsIGZvcm1hdEZ1bmN0aW9ucyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBheGVzRGF0YVtjaGFydFR5cGVzWzBdXSA9IGJhc2VBeGVzRGF0YTtcbiAgICAgICAgYXhlc0RhdGFbY2hhcnRUeXBlc1sxXV0gPSB7XG4gICAgICAgICAgICB5QXhpczogeXJBeGlzRGF0YSB8fCB5QXhpc0RhdGFcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gYXhlc0RhdGE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2Ugb3JkZXIgaW5mbyBhYm91bmQgY2hhcnQgdHlwZS5cbiAgICAgKiBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBjaGFydFR5cGVzIGNoYXJ0IHR5cGVzXG4gICAgICogQHJldHVybnMge29iamVjdH0gY2hhcnQgb3JkZXIgaW5mb1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VDaGFydFR5cGVPcmRlckluZm86IGZ1bmN0aW9uKGNoYXJ0VHlwZXMpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgICAgICB0dWkudXRpbC5mb3JFYWNoQXJyYXkoY2hhcnRUeXBlcywgZnVuY3Rpb24oY2hhcnRUeXBlLCBpbmRleCkge1xuICAgICAgICAgICAgcmVzdWx0W2NoYXJ0VHlwZV0gPSBpbmRleDtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2Ugb3B0aW9ucyBtYXBcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY2hhcnRUeXBlcyBjaGFydCB0eXBlc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3JkZXJJbmZvIGNoYXJ0IG9yZGVyXG4gICAgICogQHJldHVybnMge29iamVjdH0gb3B0aW9ucyBtYXBcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlT3B0aW9uc01hcDogZnVuY3Rpb24oY2hhcnRUeXBlcywgb3B0aW9ucykge1xuICAgICAgICB2YXIgb3JkZXJJbmZvID0gdGhpcy5fbWFrZUNoYXJ0VHlwZU9yZGVySW5mbyhjaGFydFR5cGVzKSxcbiAgICAgICAgICAgIHJlc3VsdCA9IHt9O1xuICAgICAgICB0dWkudXRpbC5mb3JFYWNoQXJyYXkoY2hhcnRUeXBlcywgZnVuY3Rpb24oY2hhcnRUeXBlKSB7XG4gICAgICAgICAgICB2YXIgY2hhcnRPcHRpb25zID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvcHRpb25zKSksXG4gICAgICAgICAgICAgICAgaW5kZXggPSBvcmRlckluZm9bY2hhcnRUeXBlXTtcblxuICAgICAgICAgICAgaWYgKGNoYXJ0T3B0aW9ucy55QXhpcyAmJiBjaGFydE9wdGlvbnMueUF4aXNbaW5kZXhdKSB7XG4gICAgICAgICAgICAgICAgY2hhcnRPcHRpb25zLnlBeGlzID0gY2hhcnRPcHRpb25zLnlBeGlzW2luZGV4XTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGNoYXJ0T3B0aW9ucy5zZXJpZXMgJiYgY2hhcnRPcHRpb25zLnNlcmllc1tjaGFydFR5cGVdKSB7XG4gICAgICAgICAgICAgICAgY2hhcnRPcHRpb25zLnNlcmllcyA9IGNoYXJ0T3B0aW9ucy5zZXJpZXNbY2hhcnRUeXBlXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGNoYXJ0T3B0aW9ucy50b29sdGlwICYmIGNoYXJ0T3B0aW9ucy50b29sdGlwW2NoYXJ0VHlwZV0pIHtcbiAgICAgICAgICAgICAgICBjaGFydE9wdGlvbnMudG9vbHRpcCA9IGNoYXJ0T3B0aW9ucy50b29sdGlwW2NoYXJ0VHlwZV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjaGFydE9wdGlvbnMucGFyZW50Q2hhcnRUeXBlID0gY2hhcnRPcHRpb25zLmNoYXJ0VHlwZTtcbiAgICAgICAgICAgIGNoYXJ0T3B0aW9ucy5jaGFydFR5cGUgPSBjaGFydFR5cGU7XG4gICAgICAgICAgICByZXN1bHRbY2hhcnRUeXBlXSA9IGNoYXJ0T3B0aW9ucztcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgdGhlbWUgbWFwXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGNoYXJ0VHlwZXMgY2hhcnQgdHlwZXNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgY2hhcnQgdGhlbWVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gbGVnZW5kTGFiZWxzIGxlZ2VuZCBsYWJlbHNcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSB0aGVtZSBtYXBcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlVGhlbWVNYXA6IGZ1bmN0aW9uKGNoYXJ0VHlwZXMsIHRoZW1lLCBsZWdlbmRMYWJlbHMpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHt9LFxuICAgICAgICAgICAgY29sb3JDb3VudCA9IDA7XG4gICAgICAgIHR1aS51dGlsLmZvckVhY2hBcnJheShjaGFydFR5cGVzLCBmdW5jdGlvbihjaGFydFR5cGUpIHtcbiAgICAgICAgICAgIHZhciBjaGFydFRoZW1lID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGVtZSkpLFxuICAgICAgICAgICAgICAgIHJlbW92ZWRDb2xvcnM7XG5cbiAgICAgICAgICAgIGlmIChjaGFydFRoZW1lLnlBeGlzW2NoYXJ0VHlwZV0pIHtcbiAgICAgICAgICAgICAgICBjaGFydFRoZW1lLnlBeGlzID0gY2hhcnRUaGVtZS55QXhpc1tjaGFydFR5cGVdO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghY2hhcnRUaGVtZS55QXhpcy50aXRsZSkge1xuICAgICAgICAgICAgICAgIGNoYXJ0VGhlbWUueUF4aXMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGRlZmF1bHRUaGVtZS55QXhpcykpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoY2hhcnRUaGVtZS5zZXJpZXNbY2hhcnRUeXBlXSkge1xuICAgICAgICAgICAgICAgIGNoYXJ0VGhlbWUuc2VyaWVzID0gY2hhcnRUaGVtZS5zZXJpZXNbY2hhcnRUeXBlXTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWNoYXJ0VGhlbWUuc2VyaWVzLmNvbG9ycykge1xuICAgICAgICAgICAgICAgIGNoYXJ0VGhlbWUuc2VyaWVzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShkZWZhdWx0VGhlbWUuc2VyaWVzKSk7XG4gICAgICAgICAgICAgICAgY2hhcnRUaGVtZS5zZXJpZXMubGFiZWwuZm9udEZhbWlseSA9IGNoYXJ0VGhlbWUuY2hhcnQuZm9udEZhbWlseTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVtb3ZlZENvbG9ycyA9IGNoYXJ0VGhlbWUuc2VyaWVzLmNvbG9ycy5zcGxpY2UoMCwgY29sb3JDb3VudCk7XG4gICAgICAgICAgICAgICAgY2hhcnRUaGVtZS5zZXJpZXMuY29sb3JzID0gY2hhcnRUaGVtZS5zZXJpZXMuY29sb3JzLmNvbmNhdChyZW1vdmVkQ29sb3JzKTtcbiAgICAgICAgICAgICAgICBjb2xvckNvdW50ICs9IGxlZ2VuZExhYmVsc1tjaGFydFR5cGVdLmxlbmd0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdFtjaGFydFR5cGVdID0gY2hhcnRUaGVtZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEluY3JlYXNlIHkgYXhpcyB0aWNrIGNvdW50LlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmNyZWFzZVRpY2tDb3VudCBpbmNyZWFzZSB0aWNrIGNvdW50XG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRvRGF0YSB0byB0aWNrIGluZm9cbiAgICAgKiBAcGFyYW0ge2FycmF5LjxmdW5jdGlvbj59IGZvcm1hdEZ1bmN0aW9ucyBmb3JtYXQgZnVuY3Rpb25zXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaW5jcmVhc2VZQXhpc1RpY2tDb3VudDogZnVuY3Rpb24oaW5jcmVhc2VUaWNrQ291bnQsIHRvRGF0YSwgZm9ybWF0RnVuY3Rpb25zKSB7XG4gICAgICAgIHRvRGF0YS5zY2FsZS5tYXggKz0gdG9EYXRhLnN0ZXAgKiBpbmNyZWFzZVRpY2tDb3VudDtcbiAgICAgICAgdG9EYXRhLmxhYmVscyA9IGF4aXNEYXRhTWFrZXIuZm9ybWF0TGFiZWxzKGNhbGN1bGF0b3IubWFrZUxhYmVsc0Zyb21TY2FsZSh0b0RhdGEuc2NhbGUsIHRvRGF0YS5zdGVwKSwgZm9ybWF0RnVuY3Rpb25zKTtcbiAgICAgICAgdG9EYXRhLnRpY2tDb3VudCArPSBpbmNyZWFzZVRpY2tDb3VudDtcbiAgICAgICAgdG9EYXRhLnZhbGlkVGlja0NvdW50ICs9IGluY3JlYXNlVGlja0NvdW50O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnN0YWxsIGNoYXJ0cy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudXNlckRhdGEgdXNlciBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmJhc2VEYXRhIGNoYXJ0IGJhc2UgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBjaGFydCB0aGVtZVxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5vcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiAgICAgIEBwYXJhbSB7e3lBeGlzOiBvYmplY3QsIHhBeGlzOiBvYmplY3R9fSBwYXJhbXMuYmFzZUF4ZXNEYXRhIGJhc2UgYXhlcyBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmF4ZXNEYXRhIGF4ZXMgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48c3RyaW5nPn0gcGFyYW1zLnNlcmllc0NoYXJ0VHlwZXMgc2VyaWVzIGNoYXJ0IHR5cGVzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBwYXJhbXMuY2hhcnRUeXBlcyBjaGFydCB0eXBlc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2luc3RhbGxDaGFydHM6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgY2hhcnRDbGFzc2VzID0ge1xuICAgICAgICAgICAgICAgIGNvbHVtbjogQ29sdW1uQ2hhcnQsXG4gICAgICAgICAgICAgICAgbGluZTogTGluZUNoYXJ0XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYmFzZURhdGEgPSBwYXJhbXMuYmFzZURhdGEsXG4gICAgICAgICAgICBjb252ZXJ0ZWREYXRhID0gYmFzZURhdGEuY29udmVydGVkRGF0YSxcbiAgICAgICAgICAgIHBsb3REYXRhID0ge1xuICAgICAgICAgICAgICAgIHZUaWNrQ291bnQ6IHBhcmFtcy5iYXNlQXhlc0RhdGEueUF4aXMudmFsaWRUaWNrQ291bnQsXG4gICAgICAgICAgICAgICAgaFRpY2tDb3VudDogcGFyYW1zLmJhc2VBeGVzRGF0YS54QXhpcy52YWxpZFRpY2tDb3VudFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGpvaW5MZWdlbmRMYWJlbHMgPSBjb252ZXJ0ZWREYXRhLmpvaW5MZWdlbmRMYWJlbHM7XG5cbiAgICAgICAgdGhpcy5jaGFydHMgPSB0dWkudXRpbC5tYXAocGFyYW1zLnNlcmllc0NoYXJ0VHlwZXMsIGZ1bmN0aW9uKGNoYXJ0VHlwZSkge1xuICAgICAgICAgICAgdmFyIGxlZ2VuZExhYmVscyA9IGNvbnZlcnRlZERhdGEubGVnZW5kTGFiZWxzW2NoYXJ0VHlwZV0sXG4gICAgICAgICAgICAgICAgYXhlcyA9IHBhcmFtcy5heGVzRGF0YVtjaGFydFR5cGVdLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSBwYXJhbXMub3B0aW9uc01hcFtjaGFydFR5cGVdLFxuICAgICAgICAgICAgICAgIHRoZW1lID0gcGFyYW1zLnRoZW1lTWFwW2NoYXJ0VHlwZV0sXG4gICAgICAgICAgICAgICAgYm91bmRzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShiYXNlRGF0YS5ib3VuZHMpKSxcbiAgICAgICAgICAgICAgICBDaGFydCA9IGNoYXJ0Q2xhc3Nlc1tjaGFydFR5cGVdLFxuICAgICAgICAgICAgICAgIGluaXRlZERhdGEsIGNoYXJ0O1xuXG4gICAgICAgICAgICBpZiAoYXhlcyAmJiBheGVzLnlBeGlzLmlzUG9zaXRpb25SaWdodCkge1xuICAgICAgICAgICAgICAgIGJvdW5kcy55QXhpcyA9IGJvdW5kcy55ckF4aXM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGluaXRlZERhdGEgPSB7XG4gICAgICAgICAgICAgICAgY29udmVydGVkRGF0YToge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZXM6IGNvbnZlcnRlZERhdGEudmFsdWVzW2NoYXJ0VHlwZV0sXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsczogY29udmVydGVkRGF0YS5sYWJlbHMsXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdEZ1bmN0aW9uczogY29udmVydGVkRGF0YS5mb3JtYXRGdW5jdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlczogY29udmVydGVkRGF0YS5mb3JtYXR0ZWRWYWx1ZXNbY2hhcnRUeXBlXSxcbiAgICAgICAgICAgICAgICAgICAgbGVnZW5kTGFiZWxzOiBsZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICAgICAgICAgIGpvaW5MZWdlbmRMYWJlbHM6IGpvaW5MZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICAgICAgICAgIHBsb3REYXRhOiBwbG90RGF0YVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgYm91bmRzOiBib3VuZHMsXG4gICAgICAgICAgICAgICAgYXhlczogYXhlcyxcbiAgICAgICAgICAgICAgICBjaGFydElkOiB0aGlzLmNoYXJ0SWRcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNoYXJ0ID0gbmV3IENoYXJ0KHBhcmFtcy51c2VyRGF0YSwgdGhlbWUsIG9wdGlvbnMsIGluaXRlZERhdGEpO1xuICAgICAgICAgICAgcGxvdERhdGEgPSBudWxsO1xuICAgICAgICAgICAgam9pbkxlZ2VuZExhYmVscyA9IG51bGw7XG4gICAgICAgICAgICByZXR1cm4gY2hhcnQ7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgY29tYm8gY2hhcnQuXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSBjb21ibyBjaGFydCBlbGVtZW50XG4gICAgICovXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGVsID0gQ2hhcnRCYXNlLnByb3RvdHlwZS5yZW5kZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgdmFyIHBhcGVyO1xuICAgICAgICB0dWkudXRpbC5mb3JFYWNoQXJyYXkodGhpcy5jaGFydHMsIGZ1bmN0aW9uKGNoYXJ0LCBpbmRleCkge1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBjaGFydC5yZW5kZXIoZWwsIHBhcGVyKTtcbiAgICAgICAgICAgICAgICBpZiAoIXBhcGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhcGVyID0gY2hhcnQuZ2V0UGFwZXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2hhcnQuYW5pbWF0ZUNoYXJ0KCk7XG4gICAgICAgICAgICB9LCAxICogaW5kZXgpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGVsO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbWJvQ2hhcnQ7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgTGluZSBjaGFydFxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ2hhcnRCYXNlID0gcmVxdWlyZSgnLi9jaGFydEJhc2UnKSxcbiAgICBsaW5lVHlwZU1peGVyID0gcmVxdWlyZSgnLi9saW5lVHlwZU1peGVyJyksXG4gICAgYXhpc1R5cGVNaXhlciA9IHJlcXVpcmUoJy4vYXhpc1R5cGVNaXhlcicpLFxuICAgIHZlcnRpY2FsVHlwZU1peGVyID0gcmVxdWlyZSgnLi92ZXJ0aWNhbFR5cGVNaXhlcicpLFxuICAgIFNlcmllcyA9IHJlcXVpcmUoJy4uL3Nlcmllcy9saW5lQ2hhcnRTZXJpZXMnKTtcblxudmFyIExpbmVDaGFydCA9IHR1aS51dGlsLmRlZmluZUNsYXNzKENoYXJ0QmFzZSwgLyoqIEBsZW5kcyBMaW5lQ2hhcnQucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBjbGFzc05hbWVcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIGNsYXNzTmFtZTogJ3R1aS1saW5lLWNoYXJ0JyxcblxuICAgIC8qKlxuICAgICAqIFNlcmllcyBjbGFzc1xuICAgICAqIEB0eXBlIHtmdW5jdGlvbn1cbiAgICAgKi9cbiAgICBTZXJpZXM6IFNlcmllcyxcblxuICAgIC8qKlxuICAgICAqIExpbmUgY2hhcnQuXG4gICAgICogQGNvbnN0cnVjdHMgTGluZUNoYXJ0XG4gICAgICogQGV4dGVuZHMgQ2hhcnRCYXNlXG4gICAgICogQG1peGVzIGF4aXNUeXBlTWl4ZXJcbiAgICAgKiBAbWl4ZXMgdmVydGljYWxUeXBlTWl4ZXJcbiAgICAgKiBAbWl4ZXMgbGluZVR5cGVNaXhlclxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmxpbmVUeXBlSW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbn0pO1xuXG5heGlzVHlwZU1peGVyLm1peGluKExpbmVDaGFydCk7XG52ZXJ0aWNhbFR5cGVNaXhlci5taXhpbihMaW5lQ2hhcnQpO1xubGluZVR5cGVNaXhlci5taXhpbihMaW5lQ2hhcnQpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IExpbmVDaGFydDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBsaW5lVHlwZU1peGVyIGlzIG1peGVyIG9mIGxpbmUgdHlwZSBjaGFydChsaW5lLCBhcmVhKS5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIENoYXJ0QmFzZSA9IHJlcXVpcmUoJy4vY2hhcnRCYXNlJyksXG4gICAgTGluZVR5cGVFdmVudEhhbmRsZUxheWVyID0gcmVxdWlyZSgnLi4vZXZlbnRIYW5kbGVMYXllcnMvbGluZVR5cGVFdmVudEhhbmRsZUxheWVyJyk7XG5cbi8qKlxuICogbGluZVR5cGVNaXhlciBpcyBtaXhlciBvZiBsaW5lIHR5cGUgY2hhcnQobGluZSwgYXJlYSkuXG4gKiBAbWl4aW5cbiAqL1xudmFyIGxpbmVUeXBlTWl4ZXIgPSB7XG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSBsaW5lIHR5cGUgY2hhcnQuXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXk+fSB1c2VyRGF0YSBjaGFydCBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIGNoYXJ0IHRoZW1lXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBpbml0ZWREYXRhIGluaXRpYWxpemVkIGRhdGEgZnJvbSBjb21ibyBjaGFydFxuICAgICAqL1xuICAgIGxpbmVUeXBlSW5pdDogZnVuY3Rpb24odXNlckRhdGEsIHRoZW1lLCBvcHRpb25zLCBpbml0ZWREYXRhKSB7XG4gICAgICAgIHZhciBiYXNlRGF0YSA9IGluaXRlZERhdGEgfHwgdGhpcy5tYWtlQmFzZURhdGEodXNlckRhdGEsIHRoZW1lLCBvcHRpb25zLCB7XG4gICAgICAgICAgICAgICAgaXNWZXJ0aWNhbDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBoYXNBeGVzOiB0cnVlXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGNvbnZlcnRlZERhdGEgPSBiYXNlRGF0YS5jb252ZXJ0ZWREYXRhLFxuICAgICAgICAgICAgYm91bmRzID0gYmFzZURhdGEuYm91bmRzLFxuICAgICAgICAgICAgYXhlc0RhdGEgPSB0aGlzLl9tYWtlQXhlc0RhdGEoY29udmVydGVkRGF0YSwgYm91bmRzLCBvcHRpb25zLCBpbml0ZWREYXRhKTtcblxuICAgICAgICBDaGFydEJhc2UuY2FsbCh0aGlzLCB7XG4gICAgICAgICAgICBib3VuZHM6IGJvdW5kcyxcbiAgICAgICAgICAgIGF4ZXNEYXRhOiBheGVzRGF0YSxcbiAgICAgICAgICAgIHRoZW1lOiB0aGVtZSxcbiAgICAgICAgICAgIG9wdGlvbnM6IG9wdGlvbnMsXG4gICAgICAgICAgICBpc1ZlcnRpY2FsOiB0cnVlLFxuICAgICAgICAgICAgaW5pdGVkRGF0YTogaW5pdGVkRGF0YVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoIXRoaXMuaXNTdWJDaGFydCAmJiAhdGhpcy5pc0dyb3VwZWRUb29sdGlwKSB7XG4gICAgICAgICAgICB0aGlzLmFkZENvbXBvbmVudCgnZXZlbnRIYW5kbGVMYXllcicsIExpbmVUeXBlRXZlbnRIYW5kbGVMYXllciwge1xuICAgICAgICAgICAgICAgIHRpY2tDb3VudDogYXhlc0RhdGEueEF4aXMgPyBheGVzRGF0YS54QXhpcy50aWNrQ291bnQgOiAtMVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9hZGRDb21wb25lbnRzKGNvbnZlcnRlZERhdGEsIGF4ZXNEYXRhLCBvcHRpb25zKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIGNvbXBvbmVudHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udmVydGVkRGF0YSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBheGVzRGF0YSBheGVzIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYWRkQ29tcG9uZW50czogZnVuY3Rpb24oY29udmVydGVkRGF0YSwgYXhlc0RhdGEpIHtcbiAgICAgICAgdmFyIHBsb3REYXRhLCBzZXJpZXNEYXRhO1xuXG4gICAgICAgIHBsb3REYXRhID0gdGhpcy5tYWtlUGxvdERhdGEoY29udmVydGVkRGF0YS5wbG90RGF0YSwgYXhlc0RhdGEpO1xuICAgICAgICBzZXJpZXNEYXRhID0ge1xuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIHZhbHVlczogdHVpLnV0aWwucGl2b3QoY29udmVydGVkRGF0YS52YWx1ZXMpLFxuICAgICAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlczogdHVpLnV0aWwucGl2b3QoY29udmVydGVkRGF0YS5mb3JtYXR0ZWRWYWx1ZXMpLFxuICAgICAgICAgICAgICAgIHNjYWxlOiBheGVzRGF0YS55QXhpcy5zY2FsZSxcbiAgICAgICAgICAgICAgICB4VGlja0NvdW50OiBheGVzRGF0YS54QXhpcyAmJiBheGVzRGF0YS54QXhpcy50aWNrQ291bnQgfHwgLTFcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5hZGRBeGlzQ29tcG9uZW50cyh7XG4gICAgICAgICAgICBjb252ZXJ0ZWREYXRhOiBjb252ZXJ0ZWREYXRhLFxuICAgICAgICAgICAgYXhlczogYXhlc0RhdGEsXG4gICAgICAgICAgICBwbG90RGF0YTogcGxvdERhdGEsXG4gICAgICAgICAgICBTZXJpZXM6IHRoaXMuU2VyaWVzLFxuICAgICAgICAgICAgc2VyaWVzRGF0YTogc2VyaWVzRGF0YSxcbiAgICAgICAgICAgIGFsaWduZWQ6IGF4ZXNEYXRhLnhBeGlzICYmIGF4ZXNEYXRhLnhBeGlzLmFsaWduZWRcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlclxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gY2hhcnQgZWxlbWVudFxuICAgICAqL1xuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghdGhpcy5pc1N1YkNoYXJ0ICYmICF0aGlzLmlzR3JvdXBlZFRvb2x0aXApIHtcbiAgICAgICAgICAgIHRoaXMuX2F0dGFjaExpbmVUeXBlQ29vcmRpbmF0ZUV2ZW50KCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIENoYXJ0QmFzZS5wcm90b3R5cGUucmVuZGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIGF0dGFjaCBjb29yZGluYXRlIGV2ZW50IG9mIGxpbmUgdHlwZS5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hdHRhY2hMaW5lVHlwZUNvb3JkaW5hdGVFdmVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBldmVudEhhbmRsZUxheWVyID0gdGhpcy5jb21wb25lbnRNYXAuZXZlbnRIYW5kbGVMYXllcixcbiAgICAgICAgICAgIHNlcmllcyA9IHRoaXMuY29tcG9uZW50TWFwLnNlcmllcztcbiAgICAgICAgZXZlbnRIYW5kbGVMYXllci5vbignb3ZlclRpY2tTZWN0b3InLCBzZXJpZXMub25MaW5lVHlwZU92ZXJUaWNrU2VjdG9yLCBzZXJpZXMpO1xuICAgICAgICBldmVudEhhbmRsZUxheWVyLm9uKCdvdXRUaWNrU2VjdG9yJywgc2VyaWVzLm9uTGluZVR5cGVPdXRUaWNrU2VjdG9yLCBzZXJpZXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBNaXggaW4uXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gZnVuYyB0YXJnZXQgZnVuY3Rpb25cbiAgICAgKiBAaWdub3JlXG4gICAgICovXG4gICAgbWl4aW46IGZ1bmN0aW9uKGZ1bmMpIHtcbiAgICAgICAgdHVpLnV0aWwuZXh0ZW5kKGZ1bmMucHJvdG90eXBlLCB0aGlzKTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGxpbmVUeXBlTWl4ZXI7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgUGllIGNoYXJ0LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ2hhcnRCYXNlID0gcmVxdWlyZSgnLi9jaGFydEJhc2UnKSxcbiAgICBjaGFydENvbnN0ID0gcmVxdWlyZSgnLi4vY29uc3QnKSxcbiAgICBMZWdlbmQgPSByZXF1aXJlKCcuLi9sZWdlbmRzL2xlZ2VuZCcpLFxuICAgIFRvb2x0aXAgPSByZXF1aXJlKCcuLi90b29sdGlwcy90b29sdGlwJyksXG4gICAgU2VyaWVzID0gcmVxdWlyZSgnLi4vc2VyaWVzL3BpZUNoYXJ0U2VyaWVzJyk7XG5cbnZhciBQaWVDaGFydCA9IHR1aS51dGlsLmRlZmluZUNsYXNzKENoYXJ0QmFzZSwgLyoqIEBsZW5kcyBQaWVDaGFydC5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIENvbHVtbiBjaGFydC5cbiAgICAgKiBAY29uc3RydWN0cyBQaWVDaGFydFxuICAgICAqIEBleHRlbmRzIENoYXJ0QmFzZVxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gdXNlckRhdGEgY2hhcnQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSBjaGFydCB0aGVtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbih1c2VyRGF0YSwgdGhlbWUsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIGJhc2VEYXRhID0gdGhpcy5tYWtlQmFzZURhdGEodXNlckRhdGEsIHRoZW1lLCBvcHRpb25zKSxcbiAgICAgICAgICAgIGNvbnZlcnRlZERhdGEgPSBiYXNlRGF0YS5jb252ZXJ0ZWREYXRhLFxuICAgICAgICAgICAgYm91bmRzID0gYmFzZURhdGEuYm91bmRzO1xuXG4gICAgICAgIHRoaXMuY2xhc3NOYW1lID0gJ3R1aS1waWUtY2hhcnQnO1xuXG4gICAgICAgIG9wdGlvbnMudG9vbHRpcCA9IG9wdGlvbnMudG9vbHRpcCB8fCB7fTtcblxuICAgICAgICBpZiAoIW9wdGlvbnMudG9vbHRpcC5wb3NpdGlvbikge1xuICAgICAgICAgICAgb3B0aW9ucy50b29sdGlwLnBvc2l0aW9uID0gY2hhcnRDb25zdC5UT09MVElQX0RFRkFVTFRfUE9TSVRJT05fT1BUSU9OO1xuICAgICAgICB9XG5cbiAgICAgICAgQ2hhcnRCYXNlLmNhbGwodGhpcywge1xuICAgICAgICAgICAgYm91bmRzOiBib3VuZHMsXG4gICAgICAgICAgICB0aGVtZTogdGhlbWUsXG4gICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuX2FkZENvbXBvbmVudHMoY29udmVydGVkRGF0YSwgdGhlbWUuY2hhcnQuYmFja2dyb3VuZCwgYm91bmRzLCBvcHRpb25zKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIGNvbXBvbmVudHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udmVydGVkRGF0YSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjaGFydEJhY2tncm91bmQgY2hhcnQgYmFja2dyb3VuZFxuICAgICAqIEBwYXJhbSB7YXJyYXkuPG9iamVjdD59IGJvdW5kcyBib3VuZHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYWRkQ29tcG9uZW50czogZnVuY3Rpb24oY29udmVydGVkRGF0YSwgY2hhcnRCYWNrZ3JvdW5kLCBib3VuZHMsIG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKGNvbnZlcnRlZERhdGEuam9pbkxlZ2VuZExhYmVscyAmJiAoIW9wdGlvbnMuc2VyaWVzIHx8ICFvcHRpb25zLnNlcmllcy5sZWdlbmRUeXBlKSkge1xuICAgICAgICAgICAgdGhpcy5hZGRDb21wb25lbnQoJ2xlZ2VuZCcsIExlZ2VuZCwge1xuICAgICAgICAgICAgICAgIGpvaW5MZWdlbmRMYWJlbHM6IGNvbnZlcnRlZERhdGEuam9pbkxlZ2VuZExhYmVscyxcbiAgICAgICAgICAgICAgICBsZWdlbmRMYWJlbHM6IGNvbnZlcnRlZERhdGEubGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgICAgIGNoYXJ0VHlwZTogb3B0aW9ucy5jaGFydFR5cGVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5hZGRDb21wb25lbnQoJ3Rvb2x0aXAnLCBUb29sdGlwLCB7XG4gICAgICAgICAgICBjaGFydFR5cGU6IG9wdGlvbnMuY2hhcnRUeXBlLFxuICAgICAgICAgICAgdmFsdWVzOiBjb252ZXJ0ZWREYXRhLmZvcm1hdHRlZFZhbHVlcyxcbiAgICAgICAgICAgIGxhYmVsczogY29udmVydGVkRGF0YS5sYWJlbHMsXG4gICAgICAgICAgICBsZWdlbmRMYWJlbHM6IGNvbnZlcnRlZERhdGEubGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgY2hhcnRJZDogdGhpcy5jaGFydElkLFxuICAgICAgICAgICAgc2VyaWVzUG9zaXRpb246IGJvdW5kcy5zZXJpZXMucG9zaXRpb25cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5hZGRDb21wb25lbnQoJ3NlcmllcycsIFNlcmllcywge1xuICAgICAgICAgICAgbGliVHlwZTogb3B0aW9ucy5saWJUeXBlLFxuICAgICAgICAgICAgY2hhcnRUeXBlOiBvcHRpb25zLmNoYXJ0VHlwZSxcbiAgICAgICAgICAgIGNoYXJ0QmFja2dyb3VuZDogY2hhcnRCYWNrZ3JvdW5kLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIHZhbHVlczogY29udmVydGVkRGF0YS52YWx1ZXMsXG4gICAgICAgICAgICAgICAgZm9ybWF0dGVkVmFsdWVzOiBjb252ZXJ0ZWREYXRhLmZvcm1hdHRlZFZhbHVlcyxcbiAgICAgICAgICAgICAgICBsZWdlbmRMYWJlbHM6IGNvbnZlcnRlZERhdGEubGVnZW5kTGFiZWxzLFxuICAgICAgICAgICAgICAgIGNoYXJ0V2lkdGg6IGJvdW5kcy5jaGFydC5kaW1lbnNpb24ud2lkdGhcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUGllQ2hhcnQ7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgdmVydGljYWxUeXBlTWl4ZXIgaXMgbWl4ZXIgb2YgdmVydGljYWwgdHlwZSBjaGFydChjb2x1bW4sIGxpbmUsIGFyZWEpLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgYXhpc0RhdGFNYWtlciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvYXhpc0RhdGFNYWtlcicpLFxuICAgIHN0YXRlID0gcmVxdWlyZSgnLi4vaGVscGVycy9zdGF0ZScpO1xuXG4vKipcbiAqIHZlcnRpY2FsVHlwZU1peGVyIGlzIG1peGVyIG9mIHZlcnRpY2FsIHR5cGUgY2hhcnQoY29sdW1uLCBsaW5lLCBhcmVhKS5cbiAqIEBtaXhpblxuICovXG52YXIgdmVydGljYWxUeXBlTWl4ZXIgPSB7XG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBheGVzIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udmVydGVkRGF0YSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBib3VuZHMgY2hhcnQgYm91bmRzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBpbml0ZWREYXRhIGluaXRpYWxpemVkIGRhdGEgZnJvbSBjb21ibyBjaGFydFxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IGF4ZXMgZGF0YVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VBeGVzRGF0YTogZnVuY3Rpb24oY29udmVydGVkRGF0YSwgYm91bmRzLCBvcHRpb25zLCBpbml0ZWREYXRhKSB7XG4gICAgICAgIHZhciBheGVzRGF0YSA9IHt9O1xuICAgICAgICBpZiAoaW5pdGVkRGF0YSkge1xuICAgICAgICAgICAgYXhlc0RhdGEgPSBpbml0ZWREYXRhLmF4ZXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBheGVzRGF0YS55QXhpcyA9IGF4aXNEYXRhTWFrZXIubWFrZVZhbHVlQXhpc0RhdGEoe1xuICAgICAgICAgICAgICAgIHZhbHVlczogY29udmVydGVkRGF0YS52YWx1ZXMsXG4gICAgICAgICAgICAgICAgc2VyaWVzRGltZW5zaW9uOiBib3VuZHMuc2VyaWVzLmRpbWVuc2lvbixcbiAgICAgICAgICAgICAgICBzdGFja2VkOiBvcHRpb25zLnNlcmllcyAmJiBvcHRpb25zLnNlcmllcy5zdGFja2VkIHx8ICcnLFxuICAgICAgICAgICAgICAgIGNoYXJ0VHlwZTogb3B0aW9ucy5jaGFydFR5cGUsXG4gICAgICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zOiBjb252ZXJ0ZWREYXRhLmZvcm1hdEZ1bmN0aW9ucyxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zLnlBeGlzLFxuICAgICAgICAgICAgICAgIGlzVmVydGljYWw6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYXhlc0RhdGEueEF4aXMgPSBheGlzRGF0YU1ha2VyLm1ha2VMYWJlbEF4aXNEYXRhKHtcbiAgICAgICAgICAgICAgICBsYWJlbHM6IGNvbnZlcnRlZERhdGEubGFiZWxzLFxuICAgICAgICAgICAgICAgIGFsaWduZWQ6IHN0YXRlLmlzTGluZVR5cGVDaGFydChvcHRpb25zLmNoYXJ0VHlwZSksXG4gICAgICAgICAgICAgICAgb3B0aW9uczogb3B0aW9ucy54QXhpc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGF4ZXNEYXRhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBNaXggaW4uXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gZnVuYyB0YXJnZXQgZnVuY3Rpb25cbiAgICAgKiBAaWdub3JlXG4gICAgICovXG4gICAgbWl4aW46IGZ1bmN0aW9uKGZ1bmMpIHtcbiAgICAgICAgdHVpLnV0aWwuZXh0ZW5kKGZ1bmMucHJvdG90eXBlLCB0aGlzKTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHZlcnRpY2FsVHlwZU1peGVyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFBpY2sgbWluaW11bSB2YWx1ZSBmcm9tIHZhbHVlIGFycmF5LlxuICogQHBhcmFtIHthcnJheX0gYXJyIHZhbHVlIGFycmF5XG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjb25kaXRpb24gY29uZGl0aW9uIGZ1bmN0aW9uXG4gKiBAcGFyYW0ge29iamVjdH0gY29udGV4dCB0YXJnZXQgY29udGV4dFxuICogQHJldHVybnMgeyp9IG1pbmltdW0gdmFsdWVcbiAqL1xudmFyIG1pbiA9IGZ1bmN0aW9uKGFyciwgY29uZGl0aW9uLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdCwgbWluVmFsdWUsIHJlc3Q7XG4gICAgaWYgKCFjb25kaXRpb24pIHtcbiAgICAgICAgY29uZGl0aW9uID0gZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgIH07XG4gICAgfVxuICAgIHJlc3VsdCA9IGFyclswXTtcbiAgICBtaW5WYWx1ZSA9IGNvbmRpdGlvbi5jYWxsKGNvbnRleHQsIHJlc3VsdCk7XG4gICAgcmVzdCA9IGFyci5zbGljZSgxKTtcbiAgICB0dWkudXRpbC5mb3JFYWNoQXJyYXkocmVzdCwgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICB2YXIgY29tcGFyZVZhbHVlID0gY29uZGl0aW9uLmNhbGwoY29udGV4dCwgaXRlbSk7XG4gICAgICAgIGlmIChjb21wYXJlVmFsdWUgPCBtaW5WYWx1ZSkge1xuICAgICAgICAgICAgbWluVmFsdWUgPSBjb21wYXJlVmFsdWU7XG4gICAgICAgICAgICByZXN1bHQgPSBpdGVtO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogUGljayBtYXhpbXVtIHZhbHVlIGZyb20gdmFsdWUgYXJyYXkuXG4gKiBAcGFyYW0ge2FycmF5fSBhcnIgdmFsdWUgYXJyYXlcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNvbmRpdGlvbiBjb25kaXRpb24gZnVuY3Rpb25cbiAqIEBwYXJhbSB7b2JqZWN0fSBjb250ZXh0IHRhcmdldCBjb250ZXh0XG4gKiBAcmV0dXJucyB7Kn0gbWF4aW11bSB2YWx1ZVxuICovXG52YXIgbWF4ID0gZnVuY3Rpb24oYXJyLCBjb25kaXRpb24sIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0LCBtYXhWYWx1ZSwgcmVzdDtcbiAgICBpZiAoIWNvbmRpdGlvbikge1xuICAgICAgICBjb25kaXRpb24gPSBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgcmVzdWx0ID0gYXJyWzBdO1xuICAgIG1heFZhbHVlID0gY29uZGl0aW9uLmNhbGwoY29udGV4dCwgcmVzdWx0KTtcbiAgICByZXN0ID0gYXJyLnNsaWNlKDEpO1xuICAgIHR1aS51dGlsLmZvckVhY2hBcnJheShyZXN0LCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIHZhciBjb21wYXJlVmFsdWUgPSBjb25kaXRpb24uY2FsbChjb250ZXh0LCBpdGVtKTtcbiAgICAgICAgaWYgKGNvbXBhcmVWYWx1ZSA+IG1heFZhbHVlKSB7XG4gICAgICAgICAgICBtYXhWYWx1ZSA9IGNvbXBhcmVWYWx1ZTtcbiAgICAgICAgICAgIHJlc3VsdCA9IGl0ZW07XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBXaGV0aGVyIG9uZSBvZiB0aGVtIGlzIHRydWUgb3Igbm90LlxuICogQHBhcmFtIHthcnJheX0gYXJyIHRhcmdldCBhcnJheVxuICogQHBhcmFtIHtmdW5jdGlvbn0gY29uZGl0aW9uIGNvbmRpdGlvbiBmdW5jdGlvblxuICogQHJldHVybnMge2Jvb2xlYW59IHJlc3VsdCBib29sZWFuXG4gKi9cbnZhciBhbnkgPSBmdW5jdGlvbihhcnIsIGNvbmRpdGlvbikge1xuICAgIHZhciByZXN1bHQgPSBmYWxzZTtcbiAgICB0dWkudXRpbC5mb3JFYWNoQXJyYXkoYXJyLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIGlmIChjb25kaXRpb24oaXRlbSkpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBBbGwgb2YgdGhlbSBpcyB0cnVlIG9yIG5vdC5cbiAqIEBwYXJhbSB7YXJyYXl9IGFyciB0YXJnZXQgYXJyYXlcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNvbmRpdGlvbiBjb25kaXRpb24gZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtib29sZWFufSByZXN1bHQgYm9vbGVhblxuICovXG52YXIgYWxsID0gZnVuY3Rpb24oYXJyLCBjb25kaXRpb24pIHtcbiAgICB2YXIgcmVzdWx0ID0gdHJ1ZTtcbiAgICB0dWkudXRpbC5mb3JFYWNoQXJyYXkoYXJyLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIGlmICghY29uZGl0aW9uKGl0ZW0pKSB7XG4gICAgICAgICAgICByZXN1bHQgPSBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIEFycmF5IHBpdm90LlxuICogQG1lbWJlck9mIG1vZHVsZTpjYWxjdWxhdG9yXG4gKiBAcGFyYW0ge2FycmF5LjxhcnJheT59IGFycjJkIHRhcmdldCAyZCBhcnJheVxuICogQHJldHVybnMge2FycmF5LjxhcnJheT59IHBpdm90ZWQgMmQgYXJyYXlcbiAqL1xudmFyIHBpdm90ID0gZnVuY3Rpb24oYXJyMmQpIHtcbiAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgdHVpLnV0aWwuZm9yRWFjaEFycmF5KGFycjJkLCBmdW5jdGlvbihhcnIpIHtcbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaEFycmF5KGFyciwgZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgICBpZiAoIXJlc3VsdFtpbmRleF0pIHtcbiAgICAgICAgICAgICAgICByZXN1bHRbaW5kZXhdID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXN1bHRbaW5kZXhdLnB1c2godmFsdWUpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBHZXQgYWZ0ZXIgcG9pbnQgbGVuZ3RoLlxuICogQHBhcmFtIHtzdHJpbmcgfCBudW1iZXJ9IHZhbHVlIHRhcmdldCB2YWx1ZVxuICogQHJldHVybnMge251bWJlcn0gcmVzdWx0IGxlbmd0aFxuICovXG52YXIgbGVuZ3RoQWZ0ZXJQb2ludCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgdmFyIHZhbHVlQXJyID0gKHZhbHVlICsgJycpLnNwbGl0KCcuJyk7XG4gICAgcmV0dXJuIHZhbHVlQXJyLmxlbmd0aCA9PT0gMiA/IHZhbHVlQXJyWzFdLmxlbmd0aCA6IDA7XG59O1xuXG4vKipcbiAqIEZpbmQgbXVsdGlwbGUgbnVtLlxuICogQHBhcmFtIHsuLi5hcnJheX0gdGFyZ2V0IHZhbHVlc1xuICogQHJldHVybnMge251bWJlcn0gbXVsdGlwbGUgbnVtXG4gKi9cbnZhciBmaW5kTXVsdGlwbGVOdW0gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKSxcbiAgICAgICAgdW5kZXJQb2ludExlbnMgPSB0dWkudXRpbC5tYXAoYXJncywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiB0dWkudXRpbC5sZW5ndGhBZnRlclBvaW50KHZhbHVlKTtcbiAgICAgICAgfSksXG4gICAgICAgIHVuZGVyUG9pbnRMZW4gPSB0dWkudXRpbC5tYXgodW5kZXJQb2ludExlbnMpLFxuICAgICAgICBtdWx0aXBsZU51bSA9IE1hdGgucG93KDEwLCB1bmRlclBvaW50TGVuKTtcbiAgICByZXR1cm4gbXVsdGlwbGVOdW07XG59O1xuXG4vKipcbiAqIE1vZHVsbyBvcGVyYXRpb24gZm9yIGZsb2F0aW5nIHBvaW50IG9wZXJhdGlvbi5cbiAqIEBwYXJhbSB7bnVtYmVyfSB0YXJnZXQgdGFyZ2V0IHZhbHVlc1xuICogQHBhcmFtIHtudW1iZXJ9IG1vZE51bSBtb2QgbnVtXG4gKiBAcmV0dXJucyB7bnVtYmVyfSByZXN1bHQgbW9kXG4gKi9cbnZhciBtb2QgPSBmdW5jdGlvbih0YXJnZXQsIG1vZE51bSkge1xuICAgIHZhciBtdWx0aXBsZU51bSA9IHR1aS51dGlsLmZpbmRNdWx0aXBsZU51bShtb2ROdW0pO1xuICAgIHJldHVybiAoKHRhcmdldCAqIG11bHRpcGxlTnVtKSAlIChtb2ROdW0gKiBtdWx0aXBsZU51bSkpIC8gbXVsdGlwbGVOdW07XG59O1xuXG4vKipcbiAqIEFkZGl0aW9uIGZvciBmbG9hdGluZyBwb2ludCBvcGVyYXRpb24uXG4gKiBAcGFyYW0ge251bWJlcn0gYSB0YXJnZXQgYVxuICogQHBhcmFtIHtudW1iZXJ9IGIgdGFyZ2V0IGJcbiAqIEByZXR1cm5zIHtudW1iZXJ9IGFkZGl0aW9uIHJlc3VsdFxuICovXG52YXIgYWRkaXRpb24gPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgdmFyIG11bHRpcGxlTnVtID0gZmluZE11bHRpcGxlTnVtKGEsIGIpO1xuICAgIHJldHVybiAoKGEgKiBtdWx0aXBsZU51bSkgKyAoYiAqIG11bHRpcGxlTnVtKSkgLyBtdWx0aXBsZU51bTtcbn07XG5cbi8qKlxuICogU3VidHJhY3Rpb24gZm9yIGZsb2F0aW5nIHBvaW50IG9wZXJhdGlvbi5cbiAqIEBwYXJhbSB7bnVtYmVyfSBhIHRhcmdldCBhXG4gKiBAcGFyYW0ge251bWJlcn0gYiB0YXJnZXQgYlxuICogQHJldHVybnMge251bWJlcn0gc3VidHJhY3Rpb24gcmVzdWx0XG4gKi9cbnZhciBzdWJ0cmFjdGlvbiA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICB2YXIgbXVsdGlwbGVOdW0gPSBmaW5kTXVsdGlwbGVOdW0oYSwgYik7XG4gICAgcmV0dXJuICgoYSAqIG11bHRpcGxlTnVtKSAtIChiICogbXVsdGlwbGVOdW0pKSAvIG11bHRpcGxlTnVtO1xufTtcblxuLyoqXG4gKiBNdWx0aXBsaWNhdGlvbiBmb3IgZmxvYXRpbmcgcG9pbnQgb3BlcmF0aW9uLlxuICogQHBhcmFtIHtudW1iZXJ9IGEgdGFyZ2V0IGFcbiAqIEBwYXJhbSB7bnVtYmVyfSBiIHRhcmdldCBiXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBtdWx0aXBsaWNhdGlvbiByZXN1bHRcbiAqL1xudmFyIG11bHRpcGxpY2F0aW9uID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHZhciBtdWx0aXBsZU51bSA9IGZpbmRNdWx0aXBsZU51bShhLCBiKTtcbiAgICByZXR1cm4gKChhICogbXVsdGlwbGVOdW0pICogKGIgKiBtdWx0aXBsZU51bSkpIC8gKG11bHRpcGxlTnVtICogbXVsdGlwbGVOdW0pO1xufTtcblxuLyoqXG4gKiBEaXZpc2lvbiBmb3IgZmxvYXRpbmcgcG9pbnQgb3BlcmF0aW9uLlxuICogQHBhcmFtIHtudW1iZXJ9IGEgdGFyZ2V0IGFcbiAqIEBwYXJhbSB7bnVtYmVyfSBiIHRhcmdldCBiXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBkaXZpc2lvbiByZXN1bHRcbiAqL1xudmFyIGRpdmlzaW9uID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHZhciBtdWx0aXBsZU51bSA9IGZpbmRNdWx0aXBsZU51bShhLCBiKTtcbiAgICByZXR1cm4gKGEgKiBtdWx0aXBsZU51bSkgLyAoYiAqIG11bHRpcGxlTnVtKTtcbn07XG5cbi8qKlxuICogU3VtLlxuICogQHBhcmFtIHthcnJheS48bnVtYmVyPn0gdmFsdWVzIHRhcmdldCB2YWx1ZXNcbiAqIEByZXR1cm5zIHtudW1iZXJ9IHJlc3VsdCB2YWx1ZVxuICovXG52YXIgc3VtID0gZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgdmFyIGNvcHlBcnIgPSB2YWx1ZXMuc2xpY2UoKTtcbiAgICBjb3B5QXJyLnVuc2hpZnQoMCk7XG4gICAgcmV0dXJuIHR1aS51dGlsLnJlZHVjZShjb3B5QXJyLCBmdW5jdGlvbihiYXNlLCBhZGQpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoYmFzZSkgKyBwYXJzZUZsb2F0KGFkZCk7XG4gICAgfSk7XG59O1xuXG50dWkudXRpbC5taW4gPSBtaW47XG50dWkudXRpbC5tYXggPSBtYXg7XG50dWkudXRpbC5hbnkgPSBhbnk7XG50dWkudXRpbC5hbGwgPSBhbGw7XG50dWkudXRpbC5waXZvdCA9IHBpdm90O1xudHVpLnV0aWwubGVuZ3RoQWZ0ZXJQb2ludCA9IGxlbmd0aEFmdGVyUG9pbnQ7XG50dWkudXRpbC5tb2QgPSBtb2Q7XG50dWkudXRpbC5maW5kTXVsdGlwbGVOdW0gPSBmaW5kTXVsdGlwbGVOdW07XG50dWkudXRpbC5hZGRpdGlvbiA9IGFkZGl0aW9uO1xudHVpLnV0aWwuc3VidHJhY3Rpb24gPSBzdWJ0cmFjdGlvbjtcbnR1aS51dGlsLm11bHRpcGxpY2F0aW9uID0gbXVsdGlwbGljYXRpb247XG50dWkudXRpbC5kaXZpc2lvbiA9IGRpdmlzaW9uO1xudHVpLnV0aWwuc3VtID0gc3VtO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IGNoYXJ0IGNvbnN0XG4gKiBAcmVhZG9ubHlcbiAqIEBlbnVtIHtudW1iZXJ9XG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAvKiogY2hhcnQgaWQgcHJlZml4ICovXG4gICAgQ0hBUl9JRF9QUkVGSVg6ICd0dWktY2hhcnQnLFxuICAgIC8qKiB0b29sdGlwIGlkIHByZWZpeCovXG4gICAgVE9PTFRJUF9JRF9QUkVGSVg6ICd0dWktY2hhcnQtdG9vbHRpcCcsXG4gICAgLyoqIGNoYXJ0IHR5cGVzICovXG4gICAgQ0hBUlRfVFlQRV9CQVI6ICdiYXInLFxuICAgIENIQVJUX1RZUEVfQ09MVU1OOiAnY29sdW1uJyxcbiAgICBDSEFSVF9UWVBFX0xJTkU6ICdsaW5lJyxcbiAgICBDSEFSVF9UWVBFX0FSRUE6ICdhcmVhJyxcbiAgICBDSEFSVF9UWVBFX0NPTUJPOiAnY29tYm8nLFxuICAgIENIQVJUX1RZUEVfUElFOiAncGllJyxcbiAgICAvKiogY2hhcnQgcGFkZGluZyAqL1xuICAgIENIQVJUX1BBRERJTkc6IDEwLFxuICAgIC8qKiBjaGFydCBkZWZhdWx0IHdpZHRoICovXG4gICAgQ0hBUlRfREVGQVVMVF9XSURUSDogNTAwLFxuICAgIC8qKiBjaGFydCBkZWZhdWx0IGhkaWVoZ3QgKi9cbiAgICBDSEFSVF9ERUZBVUxUX0hFSUdIVDogNDAwLFxuICAgIC8qKiBoaWRkZW4gd2lkdGggKi9cbiAgICBISURERU5fV0lEVEg6IDEsXG4gICAgLyoqIHJlbmRlcmVkIHRleHQgcGFkZGluZyAqL1xuICAgIFRFWFRfUEFERElORzogMixcbiAgICAvKiogc2VyaWVzIGV4cGFuZCBzaXplICovXG4gICAgU0VSSUVTX0VYUEFORF9TSVpFOiAxMCxcbiAgICAvKiogc2VyaWVzIGxhYmVsIHBhZGRpbmcgKi9cbiAgICBTRVJJRVNfTEFCRUxfUEFERElORzogNSxcbiAgICAvKiogZGVmYXVsdCBmb250IHNpemUgb2YgdGl0bGUgKi9cbiAgICBERUZBVUxUX1RJVExFX0ZPTlRfU0laRTogMTQsXG4gICAgLyoqIGRlZmF1bHQgZm9udCBzaXplIG9mIGF4aXMgdGl0bGUgKi9cbiAgICBERUZBVUxUX0FYSVNfVElUTEVfRk9OVF9TSVpFOiAxMCxcbiAgICAvKiogZGVmYXVsdCBmb250IHNpemUgb2YgbGFiZWwgKi9cbiAgICBERUZBVUxUX0xBQkVMX0ZPTlRfU0laRTogMTIsXG4gICAgLyoqIGRlZmF1bHQgZm9udCBzaXplIG9mIHNlcmllcyBsYWJsZSAqL1xuICAgIERFRkFVTFRfU0VSSUVTX0xBQkVMX0ZPTlRfU0laRTogMTEsXG4gICAgLyoqIGRlZmF1bHQgZ3JhcGggcGx1Z2luICovXG4gICAgREVGQVVMVF9QTFVHSU46ICdyYXBoYWVsJyxcbiAgICAvKiogZGVmYXVsdCB0aWNrIGNvbG9yICovXG4gICAgREVGQVVMVF9USUNLX0NPTE9SOiAnYmxhY2snLFxuICAgIC8qKiBkZWZhdWx0IHRoZW1lIG5hbWUgKi9cbiAgICBERUZBVUxUX1RIRU1FX05BTUU6ICdkZWZhdWx0JyxcbiAgICAvKiogc3RhY2tlZCBvcHRpb24gdHlwZXMgKi9cbiAgICBTVEFDS0VEX05PUk1BTF9UWVBFOiAnbm9ybWFsJyxcbiAgICBTVEFDS0VEX1BFUkNFTlRfVFlQRTogJ3BlcmNlbnQnLFxuICAgIC8qKiBlbXB0eSBheGlzIGxhYmVsICovXG4gICAgRU1QVFlfQVhJU19MQUJFTDogJycsXG4gICAgLyoqIGFuZ2VsIDM2MCAqL1xuICAgIEFOR0xFXzg1OiA4NSxcbiAgICBBTkdMRV85MDogOTAsXG4gICAgQU5HTEVfMzYwOiAzNjAsXG4gICAgLyoqIHJhZGlhbiAqL1xuICAgIFJBRDogTWF0aC5QSSAvIDE4MCxcbiAgICAvKiogc2VyaWVzIGxlZ2VuZCB0eXBlcyAqL1xuICAgIFNFUklFU19MRUdFTkRfVFlQRV9PVVRFUjogJ291dGVyJyxcbiAgICAvKiogc2VyaWVzIG91dGVyIGxhYmVsIHBhZGRpbmcgKi9cbiAgICBTRVJJRVNfT1VURVJfTEFCRUxfUEFERElORzogMjAsXG4gICAgLyoqIGRlZmF1bHQgcmF0ZSBvZiBwaWUgZ3JhcGggKi9cbiAgICBQSUVfR1JBUEhfREVGQVVMVF9SQVRFOiAwLjgsXG4gICAgLyoqIHNtYWxsIHJhdGUgb2YgcGllIGdyYXBoICovXG4gICAgUElFX0dSQVBIX1NNQUxMX1JBVEU6IDAuNjUsXG4gICAgLyoqIHlBeGlzIHByb3BlcnRpZXMgKi9cbiAgICBZQVhJU19QUk9QUzogWyd0aWNrQ29sb3InLCAndGl0bGUnLCAnbGFiZWwnXSwgLy8geWF4aXMgdGhlbWXsnZgg7IaN7ISxIC0gY2hhcnQgdHlwZSBmaWx0ZXJpbmftlaAg65WMIOyCrOyaqeuQqFxuICAgIC8qKiBzZXJpZXMgcHJvcGVydGllcyAqL1xuICAgIFNFUklFU19QUk9QUzogWydsYWJlbCcsICdjb2xvcnMnLCAnYm9yZGVyQ29sb3InLCAnc2luZ2xlQ29sb3JzJ10sIC8vIHNlcmllcyB0aGVtZeydmCDsho3shLEgLSBjaGFydCB0eXBlIGZpbHRlcmluZ+2VoCDrlYwg7IKs7Jqp65CoXG4gICAgLyoqIHRpdGxlIGFyZWEgd2lkdGggcGFkZGluZyAqL1xuICAgIFRJVExFX0FSRUFfV0lEVEhfUEFERElORzogMjAsXG4gICAgLyoqIHRvcCBtYXJnaW4gb2YgeCBheGlzIGxhYmVsICovXG4gICAgWEFYSVNfTEFCRUxfVE9QX01BUkdJTjogMTAsXG4gICAgLyoqIHJpZ2h0IHBhZGRpbmcgb2YgdmVydGljYWwgbGFiZWwgKi9cbiAgICBWX0xBQkVMX1JJR0hUX1BBRERJTkc6IDEwLFxuICAgIC8qKiB0b29sdGlwIHByZWZpeCAqL1xuICAgIFRPT0xUSVBfUFJFRklYOiAndHVpLWNoYXJ0LXRvb2x0aXAnLFxuICAgIC8qKiBtaW5pbXVtIHBpeGVsIHR5cGUgc3RlcCBzaXplICovXG4gICAgTUlOX1BJWEVMX1RZUEVfU1RFUF9TSVpFOiA0MCxcbiAgICAvKiogbWF4aW11bSBwaXhlbCB0eXBlIHN0ZXAgc2l6ZSAqL1xuICAgIE1BWF9QSVhFTF9UWVBFX1NURVBfU0laRTogNjAsXG4gICAgLyogdGljayBpbmZvIG9mIHBlcmNlbnQgc3RhY2tlZCBvcHRpb24gKi9cbiAgICBQRVJDRU5UX1NUQUNLRURfVElDS19JTkZPOiB7XG4gICAgICAgIHNjYWxlOiB7XG4gICAgICAgICAgICBtaW46IDAsXG4gICAgICAgICAgICBtYXg6IDEwMFxuICAgICAgICB9LFxuICAgICAgICBzdGVwOiAyNSxcbiAgICAgICAgdGlja0NvdW50OiA1LFxuICAgICAgICBsYWJlbHM6IFswLCAyNSwgNTAsIDc1LCAxMDBdXG4gICAgfSxcbiAgICAvKiogdGl0bGUgYWRkIHBhZGRpbmcgKi9cbiAgICBUSVRMRV9QQURESU5HOiAyMCxcbiAgICAvKiogbGVnZW5kIGFyZWEgcGFkZGluZyAqL1xuICAgIExFR0VORF9BUkVBX1BBRERJTkc6IDEwLFxuICAgIC8qKiBsZWdlbmQgcmVjdCB3aWR0aCAqL1xuICAgIExFR0VORF9SRUNUX1dJRFRIOiAxMixcbiAgICAvKiogbGdlbmQgbGFiZWwgbGVmdCBwYWRkaW5nICovXG4gICAgTEVHRU5EX0xBQkVMX0xFRlRfUEFERElORzogNSxcbiAgICAvKiogQVhJUyBMQUJFTCBQQURESU5HICovXG4gICAgQVhJU19MQUJFTF9QQURESU5HOiA3LFxuICAgIC8qKiByb3RhdGlvbnMgZGVncmVlIGNhbmRpZGF0ZXMgKi9cbiAgICBERUdSRUVfQ0FORElEQVRFUzogWzI1LCA0NSwgNjUsIDg1XSxcbiAgICAvKiogeEF4aXMgbGFiZWwgY29tcGFyZSBtYXJnaW4gKi9cbiAgICBYQVhJU19MQUJFTF9DT01QQVJFX01BUkdJTjogMjAsXG4gICAgLyoqIHhBeGlzIGxhYmVsIGd1dHRlciAqL1xuICAgIFhBWElTX0xBQkVMX0dVVFRFUjogMixcbiAgICAvKiogc3RhbmQgbXVsdGlwbGUgbnVtcyBvZiBheGlzICovXG4gICAgQVhJU19TVEFOREFSRF9NVUxUSVBMRV9OVU1TOiBbMSwgMiwgNSwgMTBdLFxuICAgIC8qKiBsYWJlbCBwYWRkaW5nIHRvcCAqL1xuICAgIExBQkVMX1BBRERJTkdfVE9QOiAyLFxuICAgIC8qKiBsaW5lIG1hcmdpbiB0b3AgKi9cbiAgICBMSU5FX01BUkdJTl9UT1A6IDUsXG4gICAgLyoqIHRvb2x0aXAgZ2FwICovXG4gICAgVE9PTFRJUF9HQVA6IDUsXG4gICAgLyoqIHRvb2x0aXAgZGlyZWN0aW9uICovXG4gICAgVE9PTFRJUF9ESVJFQ1RJT05fRk9SV09SRDogJ2ZvcndvcmQnLFxuICAgIFRPT0xUSVBfRElSRUNUSU9OX0JBQ0tXT1JEOiAnYmFja3dvcmQnLFxuICAgIC8qKiB0b29sdGlwIGRlZmF1bHQgcG9zaXRpb24gb3B0aW9uICovXG4gICAgVE9PTFRJUF9ERUZBVUxUX1BPU0lUSU9OX09QVElPTjogJ2NlbnRlciB0b3AnLFxuICAgIFRPT0xUSVBfREVGQVVMVF9IT1JJWk9OVEFMX1BPU0lUSU9OX09QVElPTjogJ3JpZ2h0IG1pZGRsZScsXG4gICAgLyoqIGhpZGUgZGVsYXkgKi9cbiAgICBISURFX0RFTEFZOiAyMDBcbn07XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgRXZlbnRIYW5kbGVMYXllckJhc2UgaXMgYmFzZSBjbGFzcyBmb3IgZXZlbnQgaGFuZGxlIGxheWVycy5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGV2ZW50ID0gcmVxdWlyZSgnLi4vaGVscGVycy9ldmVudExpc3RlbmVyJyksXG4gICAgZG9tID0gcmVxdWlyZSgnLi4vaGVscGVycy9kb21IYW5kbGVyJyksXG4gICAgcmVuZGVyVXRpbCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvcmVuZGVyVXRpbCcpO1xuXG52YXIgRXZlbnRIYW5kbGVMYXllckJhc2UgPSB0dWkudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIEV2ZW50SGFuZGxlTGF5ZXJCYXNlLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogRXZlbnRIYW5kbGVMYXllckJhc2UgaXMgYmFzZSBjbGFzcyBmb3IgZXZlbnQgaGFuZGxlIGxheWVycy5cbiAgICAgKiBAY29uc3RydWN0cyBFdmVudEhhbmRsZUxheWVyQmFzZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHt7XG4gICAgICogICAgICAgICAgZGltZW5zaW9uOiB7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9LFxuICAgICAqICAgICAgICAgIHBvc2l0aW9uOiB7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn1cbiAgICAgKiAgICAgIH19IHBhcmFtcy5ib3VuZCBib3VuZFxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5jaGFydFR5cGUgY2hhcnQgdHlwZVxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaXNWZXJ0aWNhbCB3aGV0aGVyIHZlcnRpY2FsIG9yIG5vdFxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB0aGlzLmJvdW5kID0gcGFyYW1zLmJvdW5kO1xuICAgICAgICB0aGlzLmNoYXJ0VHlwZSA9IHBhcmFtcy5jaGFydFR5cGU7XG4gICAgICAgIHRoaXMuaXNWZXJ0aWNhbCA9IHBhcmFtcy5pc1ZlcnRpY2FsO1xuICAgICAgICB0aGlzLmNvb3JkaW5hdGVEYXRhID0gdGhpcy5tYWtlQ29vcmRpbmF0ZURhdGEocGFyYW1zLmJvdW5kLmRpbWVuc2lvbiwgcGFyYW1zLnRpY2tDb3VudCwgcGFyYW1zLmNoYXJ0VHlwZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgY29vcmRpbmF0ZSBkYXRhLlxuICAgICAqL1xuICAgIG1ha2VDb29yZGluYXRlRGF0YTogZnVuY3Rpb24oKSB7fSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlci5cbiAgICAgKiBAcmV0dXJuIHtIVE1MRWxlbWVudH0gY29vcmRpbmF0ZSBhcmVhXG4gICAgICovXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGVsQ29vcmRpbmF0ZUFyZWEgPSBkb20uY3JlYXRlKCdESVYnLCAndHVpLWNoYXJ0LXNlcmllcy1jb29yZGluYXRlLWFyZWEnKTtcbiAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJEaW1lbnNpb24oZWxDb29yZGluYXRlQXJlYSwgdGhpcy5ib3VuZC5kaW1lbnNpb24pO1xuICAgICAgICByZW5kZXJVdGlsLnJlbmRlclBvc2l0aW9uKGVsQ29vcmRpbmF0ZUFyZWEsIHRoaXMuYm91bmQucG9zaXRpb24pO1xuICAgICAgICB0aGlzLmF0dGFjaEV2ZW50KGVsQ29vcmRpbmF0ZUFyZWEpO1xuICAgICAgICByZXR1cm4gZWxDb29yZGluYXRlQXJlYTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmluZCBncm91cCBpbmRleC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gcG9pbnRWYWx1ZSBtb3VzZSBwb3NpdGlvbiBwb2ludCB2YWx1ZVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IGdyb3VwIGluZGV4XG4gICAgICovXG4gICAgZmluZEluZGV4OiBmdW5jdGlvbihwb2ludFZhbHVlKSB7XG4gICAgICAgIHZhciBmb3VuZEluZGV4ID0gLTE7XG4gICAgICAgIHR1aS51dGlsLmZvckVhY2hBcnJheSh0aGlzLmNvb3JkaW5hdGVEYXRhLCBmdW5jdGlvbihzY2FsZSwgaW5kZXgpIHtcbiAgICAgICAgICAgIGlmIChzY2FsZS5taW4gPCBwb2ludFZhbHVlICYmIHNjYWxlLm1heCA+PSBwb2ludFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgZm91bmRJbmRleCA9IGluZGV4O1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGZvdW5kSW5kZXg7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgY29vcmRpbmF0ZSBkYXRhIGFib3VudCBsaW5lIHR5cGUgY2hhcnQuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoIHdpZHRoXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHRpY2tDb3VudCB0aWNrIGNvdW50XG4gICAgICogQHJldHVybnMge2FycmF5fSBjb29yZGluYXRlIGRhdGFcbiAgICAgKi9cbiAgICBtYWtlTGluZVR5cGVDb29yZGluYXRlRGF0YTogZnVuY3Rpb24od2lkdGgsIHRpY2tDb3VudCkge1xuICAgICAgICB2YXIgdGlja0ludGVydmFsID0gd2lkdGggLyAodGlja0NvdW50IC0gMSksXG4gICAgICAgICAgICBoYWxmSW50ZXJ2YWwgPSB0aWNrSW50ZXJ2YWwgLyAyO1xuICAgICAgICByZXR1cm4gdHVpLnV0aWwubWFwKHR1aS51dGlsLnJhbmdlKDAsIHRpY2tDb3VudCksIGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG1pbjogaW5kZXggKiB0aWNrSW50ZXJ2YWwgLSBoYWxmSW50ZXJ2YWwsXG4gICAgICAgICAgICAgICAgbWF4OiBpbmRleCAqIHRpY2tJbnRlcnZhbCArIGhhbGZJbnRlcnZhbFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE9uIG1vdXNlIG1vdmVcbiAgICAgKiBAYWJzdHJhY3RcbiAgICAgKi9cbiAgICBvbk1vdXNlbW92ZTogZnVuY3Rpb24oKSB7fSxcblxuICAgIC8qKlxuICAgICAqIE9uIG1vdXNlIG91dFxuICAgICAqIEBhYnN0cmFjdFxuICAgICAqL1xuICAgIG9uTW91c2VvdXQ6IGZ1bmN0aW9uKCkge30sXG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggZXZlbnRcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqL1xuICAgIGF0dGFjaEV2ZW50OiBmdW5jdGlvbihlbCkge1xuICAgICAgICBldmVudC5iaW5kRXZlbnQoJ21vdXNlbW92ZScsIGVsLCB0dWkudXRpbC5iaW5kKHRoaXMub25Nb3VzZW1vdmUsIHRoaXMpKTtcbiAgICAgICAgZXZlbnQuYmluZEV2ZW50KCdtb3VzZW91dCcsIGVsLCB0dWkudXRpbC5iaW5kKHRoaXMub25Nb3VzZW91dCwgdGhpcykpO1xuICAgIH1cbn0pO1xuXG50dWkudXRpbC5DdXN0b21FdmVudHMubWl4aW4oRXZlbnRIYW5kbGVMYXllckJhc2UpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50SGFuZGxlTGF5ZXJCYXNlO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEdyb3VwZWRFdmVudEhhbmRsZUxheWVyIGlzIGV2ZW50IGhhbmRsZSBsYXllciBmb3IgZ3JvdXBlZCB0b29saXAgb3B0aW9uLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgRXZlbnRIYW5kbGVMYXllckJhc2UgPSByZXF1aXJlKCcuL2V2ZW50SGFuZGxlTGF5ZXJCYXNlJyksXG4gICAgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4uL2NvbnN0JyksXG4gICAgc3RhdGUgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3N0YXRlJyk7XG5cbnZhciBHcm91cGVkRXZlbnRIYW5kbGVMYXllciA9IHR1aS51dGlsLmRlZmluZUNsYXNzKEV2ZW50SGFuZGxlTGF5ZXJCYXNlLCAvKiogQGxlbmRzIEdyb3VwZWRFdmVudEhhbmRsZUxheWVyLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogR3JvdXBlZEV2ZW50SGFuZGxlTGF5ZXIgaXMgZXZlbnQgaGFuZGxlIGxheWVyIGZvciBncm91cGVkIHRvb2xpcCBvcHRpb24uXG4gICAgICogQGNvbnN0cnVjdHMgRXZlbnRIYW5kbGVMYXllckJhc2VcbiAgICAgKiBAZXh0ZW5kcyBFdmVudEhhbmRsZUxheWVyQmFzZVxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBFdmVudEhhbmRsZUxheWVyQmFzZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGNvb3JkaW5hdGUgZGF0YSBhYm91dCBub24gbGluZSB0eXBlIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzaXplIHdpZHRoIG9yIGhlaWdodFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB0aWNrQ291bnQgdGljayBjb3VudFxuICAgICAqIEByZXR1cm5zIHthcnJheX0gY29vcmRpbmF0ZSBkYXRhXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZU5vcm1hbENvb3JkaW5hdGVEYXRhOiBmdW5jdGlvbihzaXplLCB0aWNrQ291bnQpIHtcbiAgICAgICAgdmFyIGxlbiA9IHRpY2tDb3VudCAtIDEsXG4gICAgICAgICAgICB0aWNrSW50ZXJ2YWwgPSBzaXplIC8gbGVuLFxuICAgICAgICAgICAgcHJldiA9IDA7XG4gICAgICAgIHJldHVybiB0dWkudXRpbC5tYXAodHVpLnV0aWwucmFuZ2UoMCwgbGVuKSwgZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBtYXggPSB0dWkudXRpbC5taW4oW3NpemUsIChpbmRleCArIDEpICogdGlja0ludGVydmFsXSksXG4gICAgICAgICAgICAgICAgc2NhbGUgPSB7XG4gICAgICAgICAgICAgICAgICAgIG1pbjogcHJldixcbiAgICAgICAgICAgICAgICAgICAgbWF4OiBtYXhcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgcHJldiA9IG1heDtcbiAgICAgICAgICAgIHJldHVybiBzY2FsZTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgY29vcmRpbmF0ZSBkYXRhLlxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gZGltZW5zaW9uIGRpbWVuc2lvblxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB0aWNrQ291bnQgdGljayBjb3VudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjaGFydFR5cGUgY2hhcnQgdHlwZVxuICAgICAqIEByZXR1cm5zIHthcnJheS48e21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn0+fSB0aWNrIGdyb3Vwc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgbWFrZUNvb3JkaW5hdGVEYXRhOiBmdW5jdGlvbihkaW1lbnNpb24sIHRpY2tDb3VudCwgY2hhcnRUeXBlKSB7XG4gICAgICAgIHZhciBzaXplVHlwZSA9IHRoaXMuaXNWZXJ0aWNhbCA/ICd3aWR0aCcgOiAnaGVpZ2h0JyxcbiAgICAgICAgICAgIGNvb3JkaW5hdGVEYXRhO1xuICAgICAgICBpZiAoc3RhdGUuaXNMaW5lVHlwZUNoYXJ0KGNoYXJ0VHlwZSkpIHtcbiAgICAgICAgICAgIGNvb3JkaW5hdGVEYXRhID0gdGhpcy5tYWtlTGluZVR5cGVDb29yZGluYXRlRGF0YShkaW1lbnNpb25bc2l6ZVR5cGVdLCB0aWNrQ291bnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29vcmRpbmF0ZURhdGEgPSB0aGlzLl9tYWtlTm9ybWFsQ29vcmRpbmF0ZURhdGEoZGltZW5zaW9uW3NpemVUeXBlXSwgdGlja0NvdW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjb29yZGluYXRlRGF0YTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSByYW5nZSBvZiB0b29sdGlwIHBvc2l0aW9uLlxuICAgICAqIEBwYXJhbSB7e21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19IHNjYWxlIHNjYWxlXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNoYXJ0VHlwZSBjaGFydCB0eXBlXG4gICAgICogQHJldHVybnMge3tzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcn19IHJhbmdlIHR5cGUgdmFsdWVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlUmFuZ2U6IGZ1bmN0aW9uKHNjYWxlLCBjaGFydFR5cGUpIHtcbiAgICAgICAgdmFyIHJhbmdlLCBjZW50ZXI7XG4gICAgICAgIGlmIChzdGF0ZS5pc0xpbmVUeXBlQ2hhcnQoY2hhcnRUeXBlKSkge1xuICAgICAgICAgICAgY2VudGVyID0gc2NhbGUubWF4IC0gKHNjYWxlLm1heCAtIHNjYWxlLm1pbikgLyAyO1xuICAgICAgICAgICAgcmFuZ2UgPSB7XG4gICAgICAgICAgICAgICAgc3RhcnQ6IGNlbnRlcixcbiAgICAgICAgICAgICAgICBlbmQ6IGNlbnRlclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJhbmdlID0ge1xuICAgICAgICAgICAgICAgIHN0YXJ0OiBzY2FsZS5taW4sXG4gICAgICAgICAgICAgICAgZW5kOiBzY2FsZS5tYXhcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmFuZ2U7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBsYXllciBwb3NpdGlvbi5cbiAgICAgKiBAcGFyYW0ge01vdXNlRXZlbnR9IGUgbW91c2UgZXZlbnQgb2JqZWN0XG4gICAgICogQHBhcmFtIHt7dG9wOiBudW1iZXIsIHJpZ2h0OiBudW1iZXIsIGJvdHRvbTogbnVtYmVyLCBsZWZ0OiBudW1iZXJ9fSBib3VuZCBib3VuZFxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNWZXJ0aWNhbCB3aGV0aGVyIHZlcnRpY2FsIG9yIG5vdFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IGxheWVyIHBvc2l0aW9uIChsZWZ0IG9yIHRvcClcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRMYXllclBvc2l0aW9uVmFsdWU6IGZ1bmN0aW9uKGUsIGJvdW5kLCBpc1ZlcnRpY2FsKSB7XG4gICAgICAgIHZhciBsYXllclBvc2l0aW9uO1xuICAgICAgICBpZiAoaXNWZXJ0aWNhbCkge1xuICAgICAgICAgICAgbGF5ZXJQb3NpdGlvbiA9IGUuY2xpZW50WCAtIGJvdW5kLmxlZnQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsYXllclBvc2l0aW9uID0gZS5jbGllbnRZIC0gYm91bmQudG9wO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsYXllclBvc2l0aW9uO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdG9vbHRpcCBkaXJlY3Rpb24uXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IGluZGV4XG4gICAgICogQHJldHVybnMge3N0cmluZ30gZGlyZWN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0VG9vbHRpcERpcmVjdGlvbjogZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgdmFyIHN0YW5kYXJkTnVtYmVyID0gTWF0aC5jZWlsKHRoaXMuY29vcmRpbmF0ZURhdGEubGVuZ3RoIC8gMiksXG4gICAgICAgICAgICBudW1iZXIgPSBpbmRleCArIDE7XG4gICAgICAgIC8vIOykkeyVmeydhCDquLDspIDsnLzroZwg7KSR7JWZ7J2EIO2PrO2VqO2VmOyXrCDslZ7rtoDrtoTsl5Ag7JyE7LmY7ZWY64qUIGRhdGHripQgZm9yd29yZOulvCDrsJjtmZjtlZjqs6AsIOuSt+u2gOu2hOyXkCDsnITsuZjtlZjripQgZGF0YeuKlCBiYWNrd29yZOulvCDrsJjtmZjtlZzri6QuXG4gICAgICAgIHJldHVybiBzdGFuZGFyZE51bWJlciA+PSBudW1iZXIgPyBjaGFydENvbnN0LlRPT0xUSVBfRElSRUNUSU9OX0ZPUldPUkQgOiBjaGFydENvbnN0LlRPT0xUSVBfRElSRUNUSU9OX0JBQ0tXT1JEO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBPbiBtb3VzZW1vdmUuXG4gICAgICogQHBhcmFtIHtNb3VzZUV2ZW50fSBlIG1vdXNlIGV2ZW50IG9iamVjdFxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIG9uTW91c2Vtb3ZlOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciBlbFRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudCxcbiAgICAgICAgICAgIGJvdW5kID0gZWxUYXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICAgICAgICBsYXllclBvc2l0aW9uVmFsdWUgPSB0aGlzLl9nZXRMYXllclBvc2l0aW9uVmFsdWUoZSwgYm91bmQsIHRoaXMuaXNWZXJ0aWNhbCksXG4gICAgICAgICAgICBpbmRleCA9IHRoaXMuZmluZEluZGV4KGxheWVyUG9zaXRpb25WYWx1ZSksXG4gICAgICAgICAgICBwcmV2SW5kZXggPSB0aGlzLnByZXZJbmRleCxcbiAgICAgICAgICAgIHNpemVUeXBlID0gdGhpcy5pc1ZlcnRpY2FsID8gJ2hlaWdodCcgOiAnd2lkdGgnLFxuICAgICAgICAgICAgZGlyZWN0aW9uO1xuXG4gICAgICAgIGlmIChpbmRleCA9PT0gLTEgfHwgcHJldkluZGV4ID09PSBpbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5wcmV2SW5kZXggPSBpbmRleDtcblxuICAgICAgICBkaXJlY3Rpb24gPSB0aGlzLl9nZXRUb29sdGlwRGlyZWN0aW9uKGluZGV4KTtcblxuICAgICAgICB0aGlzLmZpcmUoJ3Nob3dHcm91cFRvb2x0aXAnLCB7XG4gICAgICAgICAgICBpbmRleDogaW5kZXgsXG4gICAgICAgICAgICByYW5nZTogdGhpcy5fbWFrZVJhbmdlKHRoaXMuY29vcmRpbmF0ZURhdGFbaW5kZXhdLCB0aGlzLmNoYXJ0VHlwZSksXG4gICAgICAgICAgICBzaXplOiB0aGlzLmJvdW5kLmRpbWVuc2lvbltzaXplVHlwZV0sXG4gICAgICAgICAgICBkaXJlY3Rpb246IGRpcmVjdGlvbixcbiAgICAgICAgICAgIGlzVmVydGljYWw6IHRoaXMuaXNWZXJ0aWNhbFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogT24gbW91c2VvdXQuXG4gICAgICogQHBhcmFtIHtNb3VzZUV2ZW50fSBlIG1vdXNlIGV2ZW50IG9iamVjdFxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIG9uTW91c2VvdXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmZpcmUoJ2hpZGVHcm91cFRvb2x0aXAnLCB0aGlzLnByZXZJbmRleCk7XG4gICAgICAgIGRlbGV0ZSB0aGlzLnByZXZJbmRleDtcbiAgICB9XG59KTtcblxudHVpLnV0aWwuQ3VzdG9tRXZlbnRzLm1peGluKEdyb3VwZWRFdmVudEhhbmRsZUxheWVyKTtcblxubW9kdWxlLmV4cG9ydHMgPSBHcm91cGVkRXZlbnRIYW5kbGVMYXllcjtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBMaW5lVHlwZUV2ZW50SGFuZGxlTGF5ZXIgaXMgZXZlbnQgaGFuZGxlIGxheWVyIGZvciBsaW5lIHR5cGUgY2hhcnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBFdmVudEhhbmRsZUxheWVyQmFzZSA9IHJlcXVpcmUoJy4vZXZlbnRIYW5kbGVMYXllckJhc2UnKTtcblxudmFyIExpbmVUeXBlRXZlbnRIYW5kbGVMYXllciA9IHR1aS51dGlsLmRlZmluZUNsYXNzKEV2ZW50SGFuZGxlTGF5ZXJCYXNlLCAvKiogQGxlbmRzIExpbmVUeXBlRXZlbnRIYW5kbGVMYXllci5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIExpbmVUeXBlRXZlbnRIYW5kbGVMYXllciBpcyBldmVudCBoYW5kbGUgbGF5ZXIgZm9yIGxpbmUgdHlwZSBjaGFydC5cbiAgICAgKiBAY29uc3RydWN0cyBMaW5lVHlwZUV2ZW50SGFuZGxlTGF5ZXJcbiAgICAgKiBAZXh0ZW5kcyBMaW5lVHlwZUV2ZW50SGFuZGxlTGF5ZXJcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgRXZlbnRIYW5kbGVMYXllckJhc2UuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBjb29yZGluYXRlIGRhdGEuXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBkaW1lbnNpb24gZGltZW5zaW9uXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHRpY2tDb3VudCB0aWNrIGNvdW50XG4gICAgICogQHJldHVybnMge2FycmF5Ljx7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfT59IHRpY2sgZ3JvdXBzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBtYWtlQ29vcmRpbmF0ZURhdGE6IGZ1bmN0aW9uKGRpbWVuc2lvbiwgdGlja0NvdW50KSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1ha2VMaW5lVHlwZUNvb3JkaW5hdGVEYXRhKGRpbWVuc2lvbi53aWR0aCwgdGlja0NvdW50KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogT24gbW91c2Vtb3ZlLlxuICAgICAqIEBwYXJhbSB7TW91c2VFdmVudH0gZSBtb3VzZSBldmVudCBvYmplY3RcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICBvbk1vdXNlbW92ZTogZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgZWxUYXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQsXG4gICAgICAgICAgICBib3VuZCA9IGVsVGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgICAgICAgbGF5ZXJYID0gZS5jbGllbnRYIC0gYm91bmQubGVmdCxcbiAgICAgICAgICAgIGxheWVyWSA9IGUuY2xpZW50WSAtIGJvdW5kLnRvcCxcbiAgICAgICAgICAgIGluZGV4ID0gdGhpcy5maW5kSW5kZXgobGF5ZXJYKTtcbiAgICAgICAgdGhpcy5maXJlKCdvdmVyVGlja1NlY3RvcicsIGluZGV4LCBsYXllclkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBPbiBtb3VzZW91dC5cbiAgICAgKiBAcGFyYW0ge01vdXNlRXZlbnR9IGUgbW91c2UgZXZlbnQgb2JqZWN0XG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgb25Nb3VzZW91dDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZmlyZSgnb3V0VGlja1NlY3RvcicpO1xuICAgIH1cbn0pO1xuXG50dWkudXRpbC5DdXN0b21FdmVudHMubWl4aW4oTGluZVR5cGVFdmVudEhhbmRsZUxheWVyKTtcblxubW9kdWxlLmV4cG9ydHMgPSBMaW5lVHlwZUV2ZW50SGFuZGxlTGF5ZXI7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgIENoYXJ0IGZhY3RvcnkgcGxheSByb2xlIHJlZ2lzdGVyIGNoYXJ0LlxuICogICAgICAgICAgICAgICAgQWxzbywgeW91IGNhbiBnZXQgY2hhcnQgZnJvbSB0aGlzIGZhY3RvcnkuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBjaGFydHMgPSB7fSxcbiAgICBmYWN0b3J5ID0ge1xuICAgICAgICAvKipcbiAgICAgICAgICogR2V0IGNoYXJ0IGluc3RhbmNlLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY2hhcnRUeXBlIGNoYXJ0IHR5cGVcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGRhdGEgY2hhcnQgZGF0YVxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgY2hhcnQgb3B0aW9uc1xuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjaGFydCBvcHRpb25zXG4gICAgICAgICAqIEByZXR1cm5zIHtvYmplY3R9IGNoYXJ0IGluc3RhbmNlO1xuICAgICAgICAgKi9cbiAgICAgICAgZ2V0OiBmdW5jdGlvbihjaGFydFR5cGUsIGRhdGEsIHRoZW1lLCBvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgQ2hhcnQgPSBjaGFydHNbY2hhcnRUeXBlXSxcbiAgICAgICAgICAgICAgICBjaGFydDtcblxuICAgICAgICAgICAgaWYgKCFDaGFydCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGV4aXN0ICcgKyBjaGFydFR5cGUgKyAnIGNoYXJ0LicpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjaGFydCA9IG5ldyBDaGFydChkYXRhLCB0aGVtZSwgb3B0aW9ucyk7XG5cbiAgICAgICAgICAgIHJldHVybiBjaGFydDtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVnaXN0ZXIgY2hhcnQuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjaGFydFR5cGUgY2hhciB0eXBlXG4gICAgICAgICAqIEBwYXJhbSB7Y2xhc3N9IENoYXJ0Q2xhc3MgY2hhcnQgY2xhc3NcbiAgICAgICAgICovXG4gICAgICAgIHJlZ2lzdGVyOiBmdW5jdGlvbihjaGFydFR5cGUsIENoYXJ0Q2xhc3MpIHtcbiAgICAgICAgICAgIGNoYXJ0c1tjaGFydFR5cGVdID0gQ2hhcnRDbGFzcztcbiAgICAgICAgfVxuICAgIH07XG5cbm1vZHVsZS5leHBvcnRzID0gZmFjdG9yeTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyAgUGx1Z2luIGZhY3RvcnkgcGxheSByb2xlIHJlZ2lzdGVyIHJlbmRlcmluZyBwbHVnaW4uXG4gKiAgICAgICAgICAgICAgICBBbHNvLCB5b3UgY2FuIGdldCBwbHVnaW4gZnJvbSB0aGlzIGZhY3RvcnkuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBwbHVnaW5zID0ge30sXG4gICAgZmFjdG9yeSA9IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdldCBncmFwaCByZW5kZXJlci5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGxpYlR5cGUgdHlwZSBvZiBncmFwaCBsaWJyYXJ5XG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjaGFydFR5cGUgY2hhcnQgdHlwZVxuICAgICAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSByZW5kZXJlciBpbnN0YW5jZVxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0OiBmdW5jdGlvbihsaWJUeXBlLCBjaGFydFR5cGUpIHtcbiAgICAgICAgICAgIHZhciBwbHVnaW4gPSBwbHVnaW5zW2xpYlR5cGVdLFxuICAgICAgICAgICAgICAgIFJlbmRlcmVyLCByZW5kZXJlcjtcblxuICAgICAgICAgICAgaWYgKCFwbHVnaW4pIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBleGlzdCAnICsgbGliVHlwZSArICcgcGx1Z2luLicpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBSZW5kZXJlciA9IHBsdWdpbltjaGFydFR5cGVdO1xuICAgICAgICAgICAgaWYgKCFSZW5kZXJlcikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGV4aXN0ICcgKyBjaGFydFR5cGUgKyAnIGNoYXJ0IHJlbmRlcmVyLicpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZW5kZXJlciA9IG5ldyBSZW5kZXJlcigpO1xuXG4gICAgICAgICAgICByZXR1cm4gcmVuZGVyZXI7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQbHVnaW4gcmVnaXN0ZXIuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBsaWJUeXBlIHR5cGUgb2YgZ3JhcGggbGlicmFyeVxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcGx1Z2luIHBsdWdpbiB0byBjb250cm9sIGxpYnJhcnlcbiAgICAgICAgICovXG4gICAgICAgIHJlZ2lzdGVyOiBmdW5jdGlvbihsaWJUeXBlLCBwbHVnaW4pIHtcbiAgICAgICAgICAgIHBsdWdpbnNbbGliVHlwZV0gPSBwbHVnaW47XG4gICAgICAgIH1cbiAgICB9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnk7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgIFRoZW1lIGZhY3RvcnkgcGxheSByb2xlIHJlZ2lzdGVyIHRoZW1lLlxuICogICAgICAgICAgICAgICAgQWxzbywgeW91IGNhbiBnZXQgdGhlbWUgZnJvbSB0aGlzIGZhY3RvcnkuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBjaGFydENvbnN0ID0gcmVxdWlyZSgnLi4vY29uc3QnKSxcbiAgICBkZWZhdWx0VGhlbWUgPSByZXF1aXJlKCcuLi90aGVtZXMvZGVmYXVsdFRoZW1lJyk7XG5cbnZhciB0aGVtZXMgPSB7fTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgLyoqXG4gICAgICogR2V0IHRoZW1lLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0aGVtZU5hbWUgdGhlbWUgbmFtZVxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHRoZW1lIG9iamVjdFxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24odGhlbWVOYW1lKSB7XG4gICAgICAgIHZhciB0aGVtZSA9IHRoZW1lc1t0aGVtZU5hbWVdO1xuXG4gICAgICAgIGlmICghdGhlbWUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGV4aXN0ICcgKyB0aGVtZU5hbWUgKyAnIHRoZW1lLicpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoZW1lO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUaGVtZSByZWdpc3Rlci5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGhlbWVOYW1lIHRoZW1lIG5hbWVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgdGhlbWVcbiAgICAgKi9cbiAgICByZWdpc3RlcjogZnVuY3Rpb24odGhlbWVOYW1lLCB0aGVtZSkge1xuICAgICAgICB2YXIgdGFyZ2V0SXRlbXM7XG4gICAgICAgIHRoZW1lID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGVtZSkpO1xuXG4gICAgICAgIGlmICh0aGVtZU5hbWUgIT09IGNoYXJ0Q29uc3QuREVGQVVMVF9USEVNRV9OQU1FKSB7XG4gICAgICAgICAgICB0aGVtZSA9IHRoaXMuX2luaXRUaGVtZSh0aGVtZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0YXJnZXRJdGVtcyA9IHRoaXMuX2dldEluaGVyaXRUYXJnZXRUaGVtZUl0ZW1zKHRoZW1lKTtcblxuICAgICAgICB0aGlzLl9pbmhlcml0VGhlbWVGb250KHRoZW1lLCB0YXJnZXRJdGVtcyk7XG4gICAgICAgIHRoaXMuX2NvcHlDb2xvckluZm8odGhlbWUpO1xuICAgICAgICB0aGVtZXNbdGhlbWVOYW1lXSA9IHRoZW1lO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbml0IHRoZW1lLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSB0aGVtZVxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHRoZW1lXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAaWdub3JlXG4gICAgICovXG4gICAgX2luaXRUaGVtZTogZnVuY3Rpb24odGhlbWUpIHtcbiAgICAgICAgdmFyIGNsb25lVGhlbWUgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGRlZmF1bHRUaGVtZSkpLFxuICAgICAgICAgICAgbmV3VGhlbWU7XG5cbiAgICAgICAgdGhpcy5fY29uY2F0RGVmYXVsdENvbG9ycyh0aGVtZSwgY2xvbmVUaGVtZS5zZXJpZXMuY29sb3JzKVxuICAgICAgICBuZXdUaGVtZSA9IHRoaXMuX292ZXJ3cml0ZVRoZW1lKHRoZW1lLCBjbG9uZVRoZW1lKTtcblxuICAgICAgICBuZXdUaGVtZSA9IHRoaXMuX2NvcHlQcm9wZXJ0eSh7XG4gICAgICAgICAgICBwcm9wTmFtZTogJ3lBeGlzJyxcbiAgICAgICAgICAgIGZyb21UaGVtZTogdGhlbWUsXG4gICAgICAgICAgICB0b1RoZW1lOiBuZXdUaGVtZSxcbiAgICAgICAgICAgIHJlamVjdGlvblByb3BzOiBjaGFydENvbnN0LllBWElTX1BST1BTXG4gICAgICAgIH0pO1xuXG4gICAgICAgIG5ld1RoZW1lID0gdGhpcy5fY29weVByb3BlcnR5KHtcbiAgICAgICAgICAgIHByb3BOYW1lOiAnc2VyaWVzJyxcbiAgICAgICAgICAgIGZyb21UaGVtZTogdGhlbWUsXG4gICAgICAgICAgICB0b1RoZW1lOiBuZXdUaGVtZSxcbiAgICAgICAgICAgIHJlamVjdGlvblByb3BzOiBjaGFydENvbnN0LlNFUklFU19QUk9QU1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gbmV3VGhlbWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZpbHRlciBjaGFydCB0eXBlcy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGFyZ2V0IHRhcmdldCBjaGFydHNcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSByZWplY3Rpb25Qcm9wcyByZWplY3QgcHJvcGVydHlcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBmaWx0ZXJlZCBjaGFydHMuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZmlsdGVyQ2hhcnRUeXBlczogZnVuY3Rpb24odGFyZ2V0LCByZWplY3Rpb25Qcm9wcykge1xuICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICBpZiAoIXRhcmdldCkge1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVzdWx0ID0gdHVpLnV0aWwuZmlsdGVyKHRhcmdldCwgZnVuY3Rpb24oaXRlbSwgbmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIHR1aS51dGlsLmluQXJyYXkobmFtZSwgcmVqZWN0aW9uUHJvcHMpID09PSAtMTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvbmNhdCBjb2xvcnMuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIHRoZW1lXG4gICAgICogQHBhcmFtIHthcnJheS48c3RyaW5nPn0gc2VyaWVzQ29sb3JzIHNlcmllcyBjb2xvcnNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jb25jYXRDb2xvcnM6IGZ1bmN0aW9uKHRoZW1lLCBzZXJpZXNDb2xvcnMpIHtcbiAgICAgICAgaWYgKHRoZW1lLmNvbG9ycykge1xuICAgICAgICAgICAgdGhlbWUuY29sb3JzID0gdGhlbWUuY29sb3JzLmNvbmNhdChzZXJpZXNDb2xvcnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoZW1lLnNpbmdsZUNvbG9ycykge1xuICAgICAgICAgICAgdGhlbWUuc2luZ2xlQ29sb3JzID0gdGhlbWUuc2luZ2xlQ29sb3JzLmNvbmNhdChzZXJpZXNDb2xvcnMpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvbmNhdCBkZWZhdWx0IGNvbG9ycy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhlbWUgdGhlbWVcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBzZXJpZXNDb2xvcnMgc2VyaWVzIGNvbG9yc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NvbmNhdERlZmF1bHRDb2xvcnM6IGZ1bmN0aW9uKHRoZW1lLCBzZXJpZXNDb2xvcnMpIHtcbiAgICAgICAgdmFyIGNoYXJ0VHlwZXM7XG5cbiAgICAgICAgaWYgKCF0aGVtZS5zZXJpZXMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNoYXJ0VHlwZXMgPSB0aGlzLl9maWx0ZXJDaGFydFR5cGVzKHRoZW1lLnNlcmllcywgY2hhcnRDb25zdC5TRVJJRVNfUFJPUFMpO1xuXG4gICAgICAgIGlmICghdHVpLnV0aWwua2V5cyhjaGFydFR5cGVzKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMuX2NvbmNhdENvbG9ycyh0aGVtZS5zZXJpZXMsIHNlcmllc0NvbG9ycyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0dWkudXRpbC5mb3JFYWNoKGNoYXJ0VHlwZXMsIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jb25jYXRDb2xvcnMoaXRlbSwgc2VyaWVzQ29sb3JzKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE92ZXJ3cml0ZSB0aGVtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBmcm9tIGZyb20gdGhlbWUgcHJvcGVydHlcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdG8gdG8gdGhlbWUgcHJvcGVydHlcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSByZXN1bHQgcHJvcGVydHlcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vdmVyd3JpdGVUaGVtZTogZnVuY3Rpb24oZnJvbSwgdG8pIHtcbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaCh0bywgZnVuY3Rpb24oaXRlbSwga2V5KSB7XG4gICAgICAgICAgICB2YXIgZnJvbUl0ZW0gPSBmcm9tW2tleV07XG4gICAgICAgICAgICBpZiAoIWZyb21JdGVtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodHVpLnV0aWwuaXNBcnJheShmcm9tSXRlbSkpIHtcbiAgICAgICAgICAgICAgICB0b1trZXldID0gZnJvbUl0ZW0uc2xpY2UoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHVpLnV0aWwuaXNPYmplY3QoZnJvbUl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fb3ZlcndyaXRlVGhlbWUoZnJvbUl0ZW0sIGl0ZW0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0b1trZXldID0gZnJvbUl0ZW07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIHJldHVybiB0bztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29weSBwcm9wZXJ0eS5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMucHJvcE5hbWUgcHJvcGVydHkgbmFtZVxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5mcm9tVGhlbWUgZnJvbSBwcm9wZXJ0eVxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50b1RoZW1lIHRwIHByb3BlcnR5XG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBwYXJhbXMucmVqZWN0aW9uUHJvcHMgcmVqZWN0IHByb3BlcnR5IG5hbWVcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBjb3BpZWQgcHJvcGVydHlcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jb3B5UHJvcGVydHk6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgY2hhcnRUeXBlcztcblxuICAgICAgICBpZiAoIXBhcmFtcy50b1RoZW1lW3BhcmFtcy5wcm9wTmFtZV0pIHtcbiAgICAgICAgICAgIHJldHVybiBwYXJhbXMudG9UaGVtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNoYXJ0VHlwZXMgPSB0aGlzLl9maWx0ZXJDaGFydFR5cGVzKHBhcmFtcy5mcm9tVGhlbWVbcGFyYW1zLnByb3BOYW1lXSwgcGFyYW1zLnJlamVjdGlvblByb3BzKTtcbiAgICAgICAgaWYgKHR1aS51dGlsLmtleXMoY2hhcnRUeXBlcykubGVuZ3RoKSB7XG4gICAgICAgICAgICB0dWkudXRpbC5mb3JFYWNoKGNoYXJ0VHlwZXMsIGZ1bmN0aW9uKGl0ZW0sIGtleSkge1xuICAgICAgICAgICAgICAgIHZhciBjbG9uZVRoZW1lID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShkZWZhdWx0VGhlbWVbcGFyYW1zLnByb3BOYW1lXSkpO1xuICAgICAgICAgICAgICAgIHBhcmFtcy5mcm9tVGhlbWVbcGFyYW1zLnByb3BOYW1lXVtrZXldID0gdGhpcy5fb3ZlcndyaXRlVGhlbWUoaXRlbSwgY2xvbmVUaGVtZSk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICAgICAgcGFyYW1zLnRvVGhlbWVbcGFyYW1zLnByb3BOYW1lXSA9IHBhcmFtcy5mcm9tVGhlbWVbcGFyYW1zLnByb3BOYW1lXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXJhbXMudG9UaGVtZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29weSBjb2xvciBpbmZvIHRvIGxlZ2VuZFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBzZXJpZXNUaGVtZSBzZXJpZXMgdGhlbWVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gbGVnZW5kVGhlbWUgbGVnZW5kIHRoZW1lXG4gICAgICogQHBhcmFtIHthcnJheS48c3RyaW5nPn0gY29sb3JzIGNvbG9yc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NvcHlDb2xvckluZm9Ub090aGVyOiBmdW5jdGlvbihzZXJpZXNUaGVtZSwgbGVnZW5kVGhlbWUsIGNvbG9ycykge1xuICAgICAgICBsZWdlbmRUaGVtZS5jb2xvcnMgPSBjb2xvcnMgfHwgc2VyaWVzVGhlbWUuY29sb3JzO1xuICAgICAgICBpZiAoc2VyaWVzVGhlbWUuc2luZ2xlQ29sb3JzKSB7XG4gICAgICAgICAgICBsZWdlbmRUaGVtZS5zaW5nbGVDb2xvcnMgPSBzZXJpZXNUaGVtZS5zaW5nbGVDb2xvcnM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNlcmllc1RoZW1lLmJvcmRlckNvbG9yKSB7XG4gICAgICAgICAgICBsZWdlbmRUaGVtZS5ib3JkZXJDb2xvciA9IHNlcmllc1RoZW1lLmJvcmRlckNvbG9yO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB0YXJnZXQgaXRlbXMgYWJvdXQgZm9udCBpbmhlcml0LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSB0aGVtZVxuICAgICAqIEByZXR1cm5zIHthcnJheS48b2JqZWN0Pn0gdGFyZ2V0IGl0ZW1zXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0SW5oZXJpdFRhcmdldFRoZW1lSXRlbXM6IGZ1bmN0aW9uKHRoZW1lKSB7XG4gICAgICAgIHZhciBpdGVtcyA9IFtcbiAgICAgICAgICAgICAgICB0aGVtZS50aXRsZSxcbiAgICAgICAgICAgICAgICB0aGVtZS54QXhpcy50aXRsZSxcbiAgICAgICAgICAgICAgICB0aGVtZS54QXhpcy5sYWJlbCxcbiAgICAgICAgICAgICAgICB0aGVtZS5sZWdlbmQubGFiZWxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB5QXhpc0NoYXJ0VHlwZVRoZW1zID0gdGhpcy5fZmlsdGVyQ2hhcnRUeXBlcyh0aGVtZS55QXhpcywgY2hhcnRDb25zdC5ZQVhJU19QUk9QUyksXG4gICAgICAgICAgICBzZXJpZXNDaGFydFR5cGVUaGVtZXMgPSB0aGlzLl9maWx0ZXJDaGFydFR5cGVzKHRoZW1lLnNlcmllcywgY2hhcnRDb25zdC5TRVJJRVNfUFJPUFMpO1xuXG4gICAgICAgIGlmICghdHVpLnV0aWwua2V5cyh5QXhpc0NoYXJ0VHlwZVRoZW1zKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGl0ZW1zLnB1c2godGhlbWUueUF4aXMudGl0bGUpO1xuICAgICAgICAgICAgaXRlbXMucHVzaCh0aGVtZS55QXhpcy5sYWJlbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0dWkudXRpbC5mb3JFYWNoKHlBeGlzQ2hhcnRUeXBlVGhlbXMsIGZ1bmN0aW9uKGNoYXRUeXBlVGhlbWUpIHtcbiAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKGNoYXRUeXBlVGhlbWUudGl0bGUpO1xuICAgICAgICAgICAgICAgIGl0ZW1zLnB1c2goY2hhdFR5cGVUaGVtZS5sYWJlbCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdHVpLnV0aWwua2V5cyhzZXJpZXNDaGFydFR5cGVUaGVtZXMpLmxlbmd0aCkge1xuICAgICAgICAgICAgaXRlbXMucHVzaCh0aGVtZS5zZXJpZXMubGFiZWwpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdHVpLnV0aWwuZm9yRWFjaChzZXJpZXNDaGFydFR5cGVUaGVtZXMsIGZ1bmN0aW9uKGNoYXRUeXBlVGhlbWUpIHtcbiAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKGNoYXRUeXBlVGhlbWUubGFiZWwpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGl0ZW1zO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbmhlcml0IHRoZW1lIGZvbnQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIHRoZW1lXG4gICAgICogQHBhcmFtIHthcnJheS48b2JqZWN0Pn0gdGFyZ2V0SXRlbXMgdGFyZ2V0IHRoZW1lIGl0ZW1zXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaW5oZXJpdFRoZW1lRm9udDogZnVuY3Rpb24odGhlbWUsIHRhcmdldEl0ZW1zKSB7XG4gICAgICAgIHZhciBiYXNlRm9udCA9IHRoZW1lLmNoYXJ0LmZvbnRGYW1pbHk7XG5cbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaEFycmF5KHRhcmdldEl0ZW1zLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICBpZiAoIWl0ZW0uZm9udEZhbWlseSkge1xuICAgICAgICAgICAgICAgIGl0ZW0uZm9udEZhbWlseSA9IGJhc2VGb250O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29weSBjb2xvciBpbmZvLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSB0aGVtZVxuICAgICAqIEBwcml2YXRlXG4gICAgICogQGlnbm9yZVxuICAgICAqL1xuICAgIF9jb3B5Q29sb3JJbmZvOiBmdW5jdGlvbih0aGVtZSkge1xuICAgICAgICB2YXIgc2VyaWVzQ2hhcnRUeXBlcyA9IHRoaXMuX2ZpbHRlckNoYXJ0VHlwZXModGhlbWUuc2VyaWVzLCBjaGFydENvbnN0LlNFUklFU19QUk9QUyk7XG4gICAgICAgIGlmICghdHVpLnV0aWwua2V5cyhzZXJpZXNDaGFydFR5cGVzKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMuX2NvcHlDb2xvckluZm9Ub090aGVyKHRoZW1lLnNlcmllcywgdGhlbWUubGVnZW5kKTtcbiAgICAgICAgICAgIHRoaXMuX2NvcHlDb2xvckluZm9Ub090aGVyKHRoZW1lLnNlcmllcywgdGhlbWUudG9vbHRpcCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0dWkudXRpbC5mb3JFYWNoKHNlcmllc0NoYXJ0VHlwZXMsIGZ1bmN0aW9uKGl0ZW0sIGNoYXJ0VHlwZSkge1xuICAgICAgICAgICAgICAgIHRoZW1lLmxlZ2VuZFtjaGFydFR5cGVdID0ge307XG4gICAgICAgICAgICAgICAgdGhlbWUudG9vbHRpcFtjaGFydFR5cGVdID0ge307XG4gICAgICAgICAgICAgICAgdGhpcy5fY29weUNvbG9ySW5mb1RvT3RoZXIoaXRlbSwgdGhlbWUubGVnZW5kW2NoYXJ0VHlwZV0sIGl0ZW0uY29sb3JzIHx8IHRoZW1lLmxlZ2VuZC5jb2xvcnMpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2NvcHlDb2xvckluZm9Ub090aGVyKGl0ZW0sIHRoZW1lLnRvb2x0aXBbY2hhcnRUeXBlXSwgaXRlbS5jb2xvcnMgfHwgdGhlbWUudG9vbHRpcC5jb2xvcnMpO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGVtZS5sZWdlbmQuY29sb3JzO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGVtZS50b29sdGlwLmNvbG9ycztcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9XG4gICAgfVxufTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBBeGlzIERhdGEgTWFrZXJcbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuLi9jb25zdCcpLFxuICAgIGNhbGN1bGF0b3IgPSByZXF1aXJlKCcuL2NhbGN1bGF0b3InKSxcbiAgICBzdGF0ZSA9IHJlcXVpcmUoJy4vc3RhdGUnKTtcblxudmFyIGFicyA9IE1hdGguYWJzLFxuICAgIGNvbmNhdCA9IEFycmF5LnByb3RvdHlwZS5jb25jYXQ7XG5cbi8qKlxuICogQXhpcyBkYXRhIG1ha2VyLlxuICogQG1vZHVsZSBheGlzRGF0YU1ha2VyXG4gKi9cbnZhciBheGlzRGF0YU1ha2VyID0ge1xuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgbGFiZWxzLlxuICAgICAqIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGxhYmVscyBsYWJlbHNcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbGFiZWxJbnRlcnZhbCBsYWJlbCBpbnRlcnZhbFxuICAgICAqIEByZXR1cm5zIHthcnJheS48c3RyaW5nPn0gbGFiZWxzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUxhYmVsczogZnVuY3Rpb24obGFiZWxzLCBsYWJlbEludGVydmFsKSB7XG4gICAgICAgIHZhciBsYXN0SW5kZXg7XG4gICAgICAgIGlmICghbGFiZWxJbnRlcnZhbCkge1xuICAgICAgICAgICAgcmV0dXJuIGxhYmVscztcbiAgICAgICAgfVxuXG4gICAgICAgIGxhc3RJbmRleCA9IGxhYmVscy5sZW5ndGggLSAxO1xuICAgICAgICByZXR1cm4gdHVpLnV0aWwubWFwKGxhYmVscywgZnVuY3Rpb24obGFiZWwsIGluZGV4KSB7XG4gICAgICAgICAgICBpZiAoaW5kZXggPiAwICYmIGluZGV4IDwgbGFzdEluZGV4ICYmIChpbmRleCAlIGxhYmVsSW50ZXJ2YWwpID4gMCkge1xuICAgICAgICAgICAgICAgIGxhYmVsID0gY2hhcnRDb25zdC5FTVBUWV9BWElTX0xBQkVMO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGxhYmVsO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBkYXRhIGFib3V0IGxhYmVsIGF4aXMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBsYWJlbHMgY2hhcnQgbGFiZWxzXG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IGlzVmVydGljYWwgd2hldGhlciB2ZXJ0aWNhbCBvciBub3RcbiAgICAgKiBAcmV0dXJucyB7e1xuICAgICAqICAgICAgbGFiZWxzOiBhcnJheS48c3RyaW5nPixcbiAgICAgKiAgICAgIHRpY2tDb3VudDogbnVtYmVyLFxuICAgICAqICAgICAgdmFsaWRUaWNrQ291bnQ6IG51bWJlcixcbiAgICAgKiAgICAgIGlzTGFiZWxBeGlzOiBib29sZWFuLFxuICAgICAqICAgICAgaXNWZXJ0aWNhbDogYm9vbGVhblxuICAgICAqIH19IGF4aXMgZGF0YVxuICAgICAqL1xuICAgIG1ha2VMYWJlbEF4aXNEYXRhOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIHRpY2tDb3VudCA9IHBhcmFtcy5sYWJlbHMubGVuZ3RoLFxuICAgICAgICAgICAgb3B0aW9ucyA9IHBhcmFtcy5vcHRpb25zIHx8IHt9O1xuICAgICAgICBpZiAoIXBhcmFtcy5hbGlnbmVkKSB7XG4gICAgICAgICAgICB0aWNrQ291bnQgKz0gMTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsYWJlbHM6IHRoaXMuX21ha2VMYWJlbHMocGFyYW1zLmxhYmVscywgb3B0aW9ucy5sYWJlbEludGVydmFsKSxcbiAgICAgICAgICAgIHRpY2tDb3VudDogdGlja0NvdW50LFxuICAgICAgICAgICAgdmFsaWRUaWNrQ291bnQ6IDAsXG4gICAgICAgICAgICBpc0xhYmVsQXhpczogdHJ1ZSxcbiAgICAgICAgICAgIGlzVmVydGljYWw6ICEhcGFyYW1zLmlzVmVydGljYWwsXG4gICAgICAgICAgICBhbGlnbmVkOiAhIXBhcmFtcy5hbGlnbmVkXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgZGF0YSBhYm91dCB2YWx1ZSBheGlzLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48YXJyYXkuPG51bWJlcj4+fSBwYXJhbXMudmFsdWVzIGNoYXJ0IHZhbHVlc1xuICAgICAqICAgICAgQHBhcmFtIHt7d2lkdGg6bnVtYmVyLCBoZWlnaHQ6bnVtYmVyfX0gcGFyYW1zLnNlcmllc0RpbWVuc2lvbiBzZXJpZXMgZGltZW5zaW9uXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxmdW5jdGlvbj59IHBhcmFtcy5mb3JtYXRGdW5jdGlvbnMgZm9ybWF0IGZ1bmN0aW9uc1xuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5zdGFja2VkIHN0YWNrZWQgb3B0aW9uXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLm9wdGlvbnMgYXhpcyBvcHRpb25zXG4gICAgICogQHJldHVybnMge3tcbiAgICAgKiAgICAgIGxhYmVsczogYXJyYXkuPHN0cmluZz4sXG4gICAgICogICAgICB0aWNrQ291bnQ6IG51bWJlcixcbiAgICAgKiAgICAgIHZhbGlkVGlja0NvdW50OiBudW1iZXIsXG4gICAgICogICAgICBpc0xhYmVsQXhpczogYm9vbGVhbixcbiAgICAgKiAgICAgIHNjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfSxcbiAgICAgKiAgICAgIGlzVmVydGljYWw6IGJvb2xlYW5cbiAgICAgKiB9fSBheGlzIGRhdGFcbiAgICAgKi9cbiAgICBtYWtlVmFsdWVBeGlzRGF0YTogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBvcHRpb25zID0gcGFyYW1zLm9wdGlvbnMgfHwge30sXG4gICAgICAgICAgICBpc1ZlcnRpY2FsID0gISFwYXJhbXMuaXNWZXJ0aWNhbCxcbiAgICAgICAgICAgIGlzUG9zaXRpb25SaWdodCA9ICEhcGFyYW1zLmlzUG9zaXRpb25SaWdodCxcbiAgICAgICAgICAgIGZvcm1hdEZ1bmN0aW9ucyA9IHBhcmFtcy5mb3JtYXRGdW5jdGlvbnMsXG4gICAgICAgICAgICB0aWNrSW5mbztcbiAgICAgICAgaWYgKHBhcmFtcy5zdGFja2VkID09PSAncGVyY2VudCcpIHtcbiAgICAgICAgICAgIHRpY2tJbmZvID0gY2hhcnRDb25zdC5QRVJDRU5UX1NUQUNLRURfVElDS19JTkZPO1xuICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zID0gW107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aWNrSW5mbyA9IHRoaXMuX2dldFRpY2tJbmZvKHtcbiAgICAgICAgICAgICAgICB2YWx1ZXM6IHRoaXMuX21ha2VCYXNlVmFsdWVzKHBhcmFtcy52YWx1ZXMsIHBhcmFtcy5zdGFja2VkKSxcbiAgICAgICAgICAgICAgICBzZXJpZXNEaW1lbnNpb246IHBhcmFtcy5zZXJpZXNEaW1lbnNpb24sXG4gICAgICAgICAgICAgICAgaXNWZXJ0aWNhbDogaXNWZXJ0aWNhbCxcbiAgICAgICAgICAgICAgICBpc1Bvc2l0aW9uUmlnaHQ6IGlzUG9zaXRpb25SaWdodCxcbiAgICAgICAgICAgICAgICBjaGFydFR5cGU6IHBhcmFtcy5jaGFydFR5cGVcbiAgICAgICAgICAgIH0sIG9wdGlvbnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxhYmVsczogdGhpcy5mb3JtYXRMYWJlbHModGlja0luZm8ubGFiZWxzLCBmb3JtYXRGdW5jdGlvbnMpLFxuICAgICAgICAgICAgdGlja0NvdW50OiB0aWNrSW5mby50aWNrQ291bnQsXG4gICAgICAgICAgICB2YWxpZFRpY2tDb3VudDogdGlja0luZm8udGlja0NvdW50LFxuICAgICAgICAgICAgc2NhbGU6IHRpY2tJbmZvLnNjYWxlLFxuICAgICAgICAgICAgc3RlcDogdGlja0luZm8uc3RlcCxcbiAgICAgICAgICAgIGlzVmVydGljYWw6IGlzVmVydGljYWwsXG4gICAgICAgICAgICBpc1Bvc2l0aW9uUmlnaHQ6IGlzUG9zaXRpb25SaWdodFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGJhc2UgdmFsdWVzLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7YXJyYXkuPG51bWJlcj59IGdyb3VwVmFsdWVzIGdyb3VwIHZhbHVlc1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzdGFja2VkIHN0YWNrZWQgb3B0aW9uLlxuICAgICAqIEByZXR1cm5zIHthcnJheS48bnVtYmVyPn0gYmFzZSB2YWx1ZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQmFzZVZhbHVlczogZnVuY3Rpb24oZ3JvdXBWYWx1ZXMsIHN0YWNrZWQpIHtcbiAgICAgICAgdmFyIGJhc2VWYWx1ZXMgPSBjb25jYXQuYXBwbHkoW10sIGdyb3VwVmFsdWVzKTsgLy8gZmxhdHRlbiBhcnJheVxuICAgICAgICBpZiAoc3RhY2tlZCA9PT0gY2hhcnRDb25zdC5TVEFDS0VEX05PUk1BTF9UWVBFKSB7XG4gICAgICAgICAgICBiYXNlVmFsdWVzID0gYmFzZVZhbHVlcy5jb25jYXQodHVpLnV0aWwubWFwKGdyb3VwVmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGx1c1ZhbHVlcyA9IHR1aS51dGlsLmZpbHRlcih2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSA+IDA7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHR1aS51dGlsLnN1bShwbHVzVmFsdWVzKTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYmFzZVZhbHVlcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGJhc2Ugc2l6ZSBmb3IgZ2V0IGNhbmRpZGF0ZSB0aWNrIGNvdW50cy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGRpbWVuc2lvbiBjaGF0IGRpbWVuc2lvblxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNWZXJ0aWNhbCB3aGV0aGVyIHZlcnRpY2FsIG9yIG5vdFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IGJhc2Ugc2l6ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldEJhc2VTaXplOiBmdW5jdGlvbihkaW1lbnNpb24sIGlzVmVydGljYWwpIHtcbiAgICAgICAgdmFyIGJhc2VTaXplO1xuICAgICAgICBpZiAoaXNWZXJ0aWNhbCkge1xuICAgICAgICAgICAgYmFzZVNpemUgPSBkaW1lbnNpb24uaGVpZ2h0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYmFzZVNpemUgPSBkaW1lbnNpb24ud2lkdGg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJhc2VTaXplO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgY2FuZGlkYXRlIHRpY2sgY291bnRzLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gY2hhcnREaW1lbnNpb24gY2hhdCBkaW1lbnNpb25cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzVmVydGljYWwgd2hldGhlciB2ZXJ0aWNhbCBvciBub3RcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPG51bWJlcj59IHRpY2sgY291bnRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0Q2FuZGlkYXRlVGlja0NvdW50czogZnVuY3Rpb24oY2hhcnREaW1lbnNpb24sIGlzVmVydGljYWwpIHtcbiAgICAgICAgdmFyIGJhc2VTaXplID0gdGhpcy5fZ2V0QmFzZVNpemUoY2hhcnREaW1lbnNpb24sIGlzVmVydGljYWwpLFxuICAgICAgICAgICAgc3RhcnQgPSBwYXJzZUludChiYXNlU2l6ZSAvIGNoYXJ0Q29uc3QuTUFYX1BJWEVMX1RZUEVfU1RFUF9TSVpFLCAxMCksXG4gICAgICAgICAgICBlbmQgPSBwYXJzZUludChiYXNlU2l6ZSAvIGNoYXJ0Q29uc3QuTUlOX1BJWEVMX1RZUEVfU1RFUF9TSVpFLCAxMCkgKyAxLFxuICAgICAgICAgICAgdGlja0NvdW50cyA9IHR1aS51dGlsLnJhbmdlKHN0YXJ0LCBlbmQpO1xuICAgICAgICByZXR1cm4gdGlja0NvdW50cztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNvbXBhcmluZyB2YWx1ZS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWluIG1pbmltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1heCBtYXhpbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7e3NjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfSwgc3RlcDogbnVtYmVyfX0gdGlja0luZm8gdGljayBpbmZvXG4gICAgICogQHJldHVybnMge251bWJlcn0gY29tcGFyaW5nIHZhbHVlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0Q29tcGFyaW5nVmFsdWU6IGZ1bmN0aW9uKG1pbiwgbWF4LCB0aWNrSW5mbykge1xuICAgICAgICB2YXIgZGlmZk1heCA9IGFicyh0aWNrSW5mby5zY2FsZS5tYXggLSBtYXgpLFxuICAgICAgICAgICAgZGlmZk1pbiA9IGFicyhtaW4gLSB0aWNrSW5mby5zY2FsZS5taW4pLFxuICAgICAgICAgICAgd2VpZ2h0ID0gTWF0aC5wb3coMTAsIHR1aS51dGlsLmxlbmd0aEFmdGVyUG9pbnQodGlja0luZm8uc3RlcCkpO1xuICAgICAgICByZXR1cm4gKGRpZmZNYXggKyBkaWZmTWluKSAqIHdlaWdodDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2VsZWN0IHRpY2sgaW5mby5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmF4aXNEYXRhTWFrZXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWluIG1pbmltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1heCBtYXhpbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7YXJyYXkuPG9iamVjdD59IGNhbmRpZGF0ZXMgdGljayBpbmZvIGNhbmRpZGF0ZXNcbiAgICAgKiBAcmV0dXJucyB7e3NjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfSwgdGlja0NvdW50OiBudW1iZXIsIHN0ZXA6IG51bWJlciwgbGFiZWxzOiBhcnJheS48bnVtYmVyPn19IHNlbGVjdGVkIHRpY2sgaW5mb1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NlbGVjdFRpY2tJbmZvOiBmdW5jdGlvbihtaW4sIG1heCwgY2FuZGlkYXRlcykge1xuICAgICAgICB2YXIgZ2V0Q29tcGFyaW5nVmFsdWUgPSB0dWkudXRpbC5iaW5kKHRoaXMuX2dldENvbXBhcmluZ1ZhbHVlLCB0aGlzLCBtaW4sIG1heCksXG4gICAgICAgICAgICB0aWNrSW5mbyA9IHR1aS51dGlsLm1pbihjYW5kaWRhdGVzLCBnZXRDb21wYXJpbmdWYWx1ZSk7XG4gICAgICAgIHJldHVybiB0aWNrSW5mbztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHRpY2sgY291bnQgYW5kIHNjYWxlLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy52YWx1ZXMgYmFzZSB2YWx1ZXNcbiAgICAgKiAgICAgIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gcGFyYW1zLnNlcmllc0RpbWVuc2lvbiBjaGF0IGRpbWVuc2lvblxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaXNWZXJ0aWNhbCB3aGV0aGVyIHZlcnRpY2FsIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5jaGFydFR5cGUgY2hhdCB0eXBlXG4gICAgICogQHBhcmFtIHt7bWluOiBudW1iZXIsIG1heDpudW1iZXJ9fSBvcHRpb25zIGF4aXMgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHt7dGlja0NvdW50OiBudW1iZXIsIHNjYWxlOiBvYmplY3R9fSB0aWNrIGluZm9cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRUaWNrSW5mbzogZnVuY3Rpb24ocGFyYW1zLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciBtaW4gPSB0dWkudXRpbC5taW4ocGFyYW1zLnZhbHVlcyksXG4gICAgICAgICAgICBtYXggPSB0dWkudXRpbC5tYXgocGFyYW1zLnZhbHVlcyksXG4gICAgICAgICAgICBpbnRUeXBlSW5mbywgdGlja0NvdW50cywgY2FuZGlkYXRlcywgdGlja0luZm87XG4gICAgICAgIC8vIDAxLiBtaW4sIG1heCwgb3B0aW9ucyDsoJXrs7Trpbwg7KCV7IiY7ZiV7Jy866GcIOuzgOqyvVxuICAgICAgICBpbnRUeXBlSW5mbyA9IHRoaXMuX21ha2VJbnRlZ2VyVHlwZUluZm8obWluLCBtYXgsIG9wdGlvbnMpO1xuXG4gICAgICAgIC8vIDAyLiB0aWNrIGNvdW50IO2bhOuztOq1sCDslrvquLBcbiAgICAgICAgdGlja0NvdW50cyA9IHBhcmFtcy50aWNrQ291bnQgPyBbcGFyYW1zLnRpY2tDb3VudF0gOiB0aGlzLl9nZXRDYW5kaWRhdGVUaWNrQ291bnRzKHBhcmFtcy5zZXJpZXNEaW1lbnNpb24sIHBhcmFtcy5pc1ZlcnRpY2FsKTtcblxuICAgICAgICAvLyAwMy4gdGljayBpbmZvIO2bhOuztOq1sCDqs4TsgrBcbiAgICAgICAgY2FuZGlkYXRlcyA9IHRoaXMuX2dldENhbmRpZGF0ZVRpY2tJbmZvcyh7XG4gICAgICAgICAgICBtaW46IGludFR5cGVJbmZvLm1pbixcbiAgICAgICAgICAgIG1heDogaW50VHlwZUluZm8ubWF4LFxuICAgICAgICAgICAgdGlja0NvdW50czogdGlja0NvdW50cyxcbiAgICAgICAgICAgIGNoYXJ0VHlwZTogcGFyYW1zLmNoYXJ0VHlwZVxuICAgICAgICB9LCBpbnRUeXBlSW5mby5vcHRpb25zKTtcblxuICAgICAgICAvLyAwNC4gdGljayBpbmZvIO2bhOuztOq1sCDspJEg7ZWY64KYIOyEoO2DnVxuICAgICAgICB0aWNrSW5mbyA9IHRoaXMuX3NlbGVjdFRpY2tJbmZvKGludFR5cGVJbmZvLm1pbiwgaW50VHlwZUluZm8ubWF4LCBjYW5kaWRhdGVzKTtcblxuICAgICAgICAvLyAwNS4g7KCV7IiY7ZiV7Jy866GcIOuzgOqyve2WiOuNmCB0aWNrIGluZm/rpbwg7JuQ656YIO2Yle2DnOuhnCDrs4Dqsr1cbiAgICAgICAgdGlja0luZm8gPSB0aGlzLl9yZXZlcnRPcmlnaW5hbFR5cGVUaWNrSW5mbyh0aWNrSW5mbywgaW50VHlwZUluZm8uZGl2aWRlTnVtKTtcbiAgICAgICAgcmV0dXJuIHRpY2tJbmZvO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGludGVnZXIgdHlwZSBpbmZvXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1pbiBtaW5pbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtYXggbWF4aW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiBAcGFyYW0ge3ttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fSBvcHRpb25zIGF4aXMgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHt7bWluOiBudW1iZXIsIG1heDogbnVtYmVyLCBvcHRpb25zOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfSwgZGl2aWRlTnVtOiBudW1iZXJ9fSBpbnRlZ2VyIHR5cGUgaW5mb1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VJbnRlZ2VyVHlwZUluZm86IGZ1bmN0aW9uKG1pbiwgbWF4LCBvcHRpb25zKSB7XG4gICAgICAgIHZhciBtdWx0aXBsZU51bSwgY2hhbmdlZE9wdGlvbnM7XG5cbiAgICAgICAgaWYgKGFicyhtaW4pID49IDEgfHwgYWJzKG1heCkgPj0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBtaW46IG1pbixcbiAgICAgICAgICAgICAgICBtYXg6IG1heCxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zLFxuICAgICAgICAgICAgICAgIGRpdmlkZU51bTogMVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIG11bHRpcGxlTnVtID0gdHVpLnV0aWwuZmluZE11bHRpcGxlTnVtKG1pbiwgbWF4KTtcbiAgICAgICAgY2hhbmdlZE9wdGlvbnMgPSB7fTtcblxuICAgICAgICBpZiAob3B0aW9ucy5taW4pIHtcbiAgICAgICAgICAgIGNoYW5nZWRPcHRpb25zLm1pbiA9IG9wdGlvbnMubWluICogbXVsdGlwbGVOdW07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob3B0aW9ucy5tYXgpIHtcbiAgICAgICAgICAgIGNoYW5nZWRPcHRpb25zLm1heCA9IG9wdGlvbnMubWF4ICogbXVsdGlwbGVOdW07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbWluOiBtaW4gKiBtdWx0aXBsZU51bSxcbiAgICAgICAgICAgIG1heDogbWF4ICogbXVsdGlwbGVOdW0sXG4gICAgICAgICAgICBvcHRpb25zOiBjaGFuZ2VkT3B0aW9ucyxcbiAgICAgICAgICAgIGRpdmlkZU51bTogbXVsdGlwbGVOdW1cbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV2ZXJ0IHRpY2sgaW5mbyB0byBvcmlnaW5hbCB0eXBlLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7e3N0ZXA6IG51bWJlciwgc2NhbGU6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9LCBsYWJlbHM6IGFycmF5LjxudW1iZXI+fX0gdGlja0luZm8gdGljayBpbmZvXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGRpdmlkZU51bSBkaXZpZGUgbnVtXG4gICAgICogQHJldHVybnMge3tzdGVwOiBudW1iZXIsIHNjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfSwgbGFiZWxzOiBhcnJheS48bnVtYmVyPn19IGRpdmlkZWQgdGljayBpbmZvXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmV2ZXJ0T3JpZ2luYWxUeXBlVGlja0luZm86IGZ1bmN0aW9uKHRpY2tJbmZvLCBkaXZpZGVOdW0pIHtcbiAgICAgICAgaWYgKGRpdmlkZU51bSA9PT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIHRpY2tJbmZvO1xuICAgICAgICB9XG5cbiAgICAgICAgdGlja0luZm8uc3RlcCA9IHR1aS51dGlsLmRpdmlzaW9uKHRpY2tJbmZvLnN0ZXAsIGRpdmlkZU51bSk7XG4gICAgICAgIHRpY2tJbmZvLnNjYWxlLm1pbiA9IHR1aS51dGlsLmRpdmlzaW9uKHRpY2tJbmZvLnNjYWxlLm1pbiwgZGl2aWRlTnVtKTtcbiAgICAgICAgdGlja0luZm8uc2NhbGUubWF4ID0gdHVpLnV0aWwuZGl2aXNpb24odGlja0luZm8uc2NhbGUubWF4LCBkaXZpZGVOdW0pO1xuICAgICAgICB0aWNrSW5mby5sYWJlbHMgPSB0dWkudXRpbC5tYXAodGlja0luZm8ubGFiZWxzLCBmdW5jdGlvbihsYWJlbCkge1xuICAgICAgICAgICAgcmV0dXJuIHR1aS51dGlsLmRpdmlzaW9uKGxhYmVsLCBkaXZpZGVOdW0pO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdGlja0luZm87XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE5vcm1hbGl6ZSBzdGVwLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdGVwIG9yaWdpbmFsIHN0ZXBcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBub3JtYWxpemVkIHN0ZXBcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9ub3JtYWxpemVTdGVwOiBmdW5jdGlvbihzdGVwKSB7XG4gICAgICAgIHJldHVybiBjYWxjdWxhdG9yLm5vcm1hbGl6ZUF4aXNOdW1iZXIoc3RlcCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1pbmltaXplIHRpY2sgc2NhbGUuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnVzZXJNaW4gdXNlciBtaW5cbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMudXNlck1heCB1c2VyIG1heFxuICAgICAqICAgICAgQHBhcmFtIHt7dGlja0NvdW50OiBudW1iZXIsIHNjYWxlOiBvYmplY3R9fSBwYXJhbXMudGlja0luZm8gdGljayBpbmZvXG4gICAgICogICAgICBAcGFyYW0ge3ttaW46IG51bWJlciwgbWF4Om51bWJlcn19IHBhcmFtcy5vcHRpb25zIGF4aXMgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHt7dGlja0NvdW50OiBudW1iZXIsIHNjYWxlOiBvYmplY3QsIGxhYmVsczogYXJyYXl9fSBjb3JyZWN0ZWQgdGljayBpbmZvXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWluaW1pemVUaWNrU2NhbGU6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgdGlja0luZm8gPSBwYXJhbXMudGlja0luZm8sXG4gICAgICAgICAgICB0aWNrcyA9IHR1aS51dGlsLnJhbmdlKDEsIHRpY2tJbmZvLnRpY2tDb3VudCksXG4gICAgICAgICAgICBvcHRpb25zID0gcGFyYW1zLm9wdGlvbnMsXG4gICAgICAgICAgICBzdGVwID0gdGlja0luZm8uc3RlcCxcbiAgICAgICAgICAgIHNjYWxlID0gdGlja0luZm8uc2NhbGUsXG4gICAgICAgICAgICB0aWNrTWF4ID0gc2NhbGUubWF4LFxuICAgICAgICAgICAgdGlja01pbiA9IHNjYWxlLm1pbixcbiAgICAgICAgICAgIGlzVW5kZWZpbmVkTWluID0gdHVpLnV0aWwuaXNVbmRlZmluZWQob3B0aW9ucy5taW4pLFxuICAgICAgICAgICAgaXNVbmRlZmluZWRNYXggPSB0dWkudXRpbC5pc1VuZGVmaW5lZChvcHRpb25zLm1heCksXG4gICAgICAgICAgICBsYWJlbHM7XG4gICAgICAgIHR1aS51dGlsLmZvckVhY2hBcnJheSh0aWNrcywgZnVuY3Rpb24odGlja0luZGV4KSB7XG4gICAgICAgICAgICB2YXIgY3VyU3RlcCA9IChzdGVwICogdGlja0luZGV4KSxcbiAgICAgICAgICAgICAgICBjdXJNaW4gPSB0aWNrTWluICsgY3VyU3RlcCxcbiAgICAgICAgICAgICAgICBjdXJNYXggPSB0aWNrTWF4IC0gY3VyU3RlcDtcblxuICAgICAgICAgICAgLy8g642U7J207IOBIOuzgOqyveydtCDtlYTsmpQg7JeG7J2EIOqyveyasFxuICAgICAgICAgICAgaWYgKHBhcmFtcy51c2VyTWluIDw9IGN1ck1pbiAmJiBwYXJhbXMudXNlck1heCA+PSBjdXJNYXgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIG1pbiDqsJLsl5Ag67OA6rK9IOyXrOycoOqwgCDsnojsnYQg6rK97JqwXG4gICAgICAgICAgICBpZiAoKGlzVW5kZWZpbmVkTWluICYmIHBhcmFtcy51c2VyTWluID4gY3VyTWluKSB8fFxuICAgICAgICAgICAgICAgICghaXNVbmRlZmluZWRNaW4gJiYgb3B0aW9ucy5taW4gPj0gY3VyTWluKSkge1xuICAgICAgICAgICAgICAgIHNjYWxlLm1pbiA9IGN1ck1pbjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gbWF4IOqwkuyXkCDrs4Dqsr0g7Jes7Jyg6rCAIOyeiOydhCDqsr3smrBcbiAgICAgICAgICAgIGlmICgoaXNVbmRlZmluZWRNaW4gJiYgcGFyYW1zLnVzZXJNYXggPCBjdXJNYXgpIHx8XG4gICAgICAgICAgICAgICAgKCFpc1VuZGVmaW5lZE1heCAmJiBvcHRpb25zLm1heCA8PSBjdXJNYXgpKSB7XG4gICAgICAgICAgICAgICAgc2NhbGUubWF4ID0gY3VyTWF4O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBsYWJlbHMgPSBjYWxjdWxhdG9yLm1ha2VMYWJlbHNGcm9tU2NhbGUoc2NhbGUsIHN0ZXApO1xuICAgICAgICB0aWNrSW5mby5sYWJlbHMgPSBsYWJlbHM7XG4gICAgICAgIHRpY2tJbmZvLnN0ZXAgPSBzdGVwO1xuICAgICAgICB0aWNrSW5mby50aWNrQ291bnQgPSBsYWJlbHMubGVuZ3RoO1xuICAgICAgICByZXR1cm4gdGlja0luZm87XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIGRpdmlkZSB0aWNrIHN0ZXAuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHt7c2NhbGU6IHttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9LCB0aWNrQ291bnQ6IG51bWJlciwgc3RlcDogbnVtYmVyLCBsYWJlbHM6IGFycmF5LjxudW1iZXI+fX0gdGlja0luZm8gdGljayBpbmZvXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG9yZ1RpY2tDb3VudCBvcmlnaW5hbCB0aWNrQ291bnRcbiAgICAgKiBAcmV0dXJucyB7e3NjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfSwgdGlja0NvdW50OiBudW1iZXIsIHN0ZXA6IG51bWJlciwgbGFiZWxzOiBhcnJheS48bnVtYmVyPn19IHRpY2sgaW5mb1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2RpdmlkZVRpY2tTdGVwOiBmdW5jdGlvbih0aWNrSW5mbywgb3JnVGlja0NvdW50KSB7XG4gICAgICAgIHZhciBzdGVwID0gdGlja0luZm8uc3RlcCxcbiAgICAgICAgICAgIHNjYWxlID0gdGlja0luZm8uc2NhbGUsXG4gICAgICAgICAgICB0aWNrQ291bnQgPSB0aWNrSW5mby50aWNrQ291bnQ7XG4gICAgICAgIC8vIHN0ZXAgMuydmCDrsLDsiJgg7J2066m07IScIOuzgOqyveuQnCB0aWNrQ291bnTsnZgg65GQ67Cw7IiYLTHsnbQgdGlja0NvdW5067O064ukIG9yZ1RpY2tDb3VudOyZgCDssKjsnbTqsIAg642c64KY6rGw64KYIOqwmeycvOuptCBzdGVw7J2EIOuwmOycvOuhnCDrs4Dqsr3tlZzri6QuXG4gICAgICAgIGlmICgoc3RlcCAlIDIgPT09IDApICYmXG4gICAgICAgICAgICBhYnMob3JnVGlja0NvdW50IC0gKCh0aWNrQ291bnQgKiAyKSAtIDEpKSA8PSBhYnMob3JnVGlja0NvdW50IC0gdGlja0NvdW50KSkge1xuICAgICAgICAgICAgc3RlcCA9IHN0ZXAgLyAyO1xuICAgICAgICAgICAgdGlja0luZm8ubGFiZWxzID0gY2FsY3VsYXRvci5tYWtlTGFiZWxzRnJvbVNjYWxlKHNjYWxlLCBzdGVwKTtcbiAgICAgICAgICAgIHRpY2tJbmZvLnRpY2tDb3VudCA9IHRpY2tJbmZvLmxhYmVscy5sZW5ndGg7XG4gICAgICAgICAgICB0aWNrSW5mby5zdGVwID0gc3RlcDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGlja0luZm87XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgdGljayBpbmZvXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnRpY2tDb3VudCB0aWNrIGNvdW50XG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLm1pbiBzY2FsZSBtaW5cbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubWF4IHNjYWxlIG1heFxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy51c2VyTWluIG1pbmltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnVzZXJNYXggbWF4aW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gcGFyYW1zLmlzTWludXMgd2hldGhlciBzY2FsZSBpcyBtaW51cyBvciBub3RcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMuY2hhcnRUeXBlIGNoYXJ0IHR5cGVcbiAgICAgKiAgICAgIEBwYXJhbSB7e21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19IHBhcmFtcy5vcHRpb25zIGF4aXMgb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHt7XG4gICAgICogICAgICBzY2FsZToge21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn0sXG4gICAgICogICAgICB0aWNrQ291bnQ6IG51bWJlcixcbiAgICAgKiAgICAgIHN0ZXA6IG51bWJlcixcbiAgICAgKiAgICAgIGxhYmVsczogYXJyYXkuPG51bWJlcj5cbiAgICAgKiB9fSB0aWNrIGluZm9cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlVGlja0luZm86IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgc2NhbGUgPSBwYXJhbXMuc2NhbGUsXG4gICAgICAgICAgICBzdGVwLCB0aWNrSW5mbztcblxuICAgICAgICAvLyAwMS4g6riw67O4IHNjYWxlIOygleuztOuhnCBzdGVwIOyWu+q4sFxuICAgICAgICBzdGVwID0gY2FsY3VsYXRvci5nZXRTY2FsZVN0ZXAoc2NhbGUsIHBhcmFtcy50aWNrQ291bnQpO1xuXG4gICAgICAgIC8vIDAyLiBzdGVwIOygleq3nO2ZlCDsi5ztgqTquLAgKGV4OiAwLjMgLS0+IDAuNSwgNyAtLT4gMTApXG4gICAgICAgIHN0ZXAgPSB0aGlzLl9ub3JtYWxpemVTdGVwKHN0ZXApO1xuXG4gICAgICAgIC8vIDAzLiBzY2FsZSDsoJXqt5ztmZQg7Iuc7YKk6riwXG4gICAgICAgIHNjYWxlID0gdGhpcy5fbm9ybWFsaXplU2NhbGUoc2NhbGUsIHN0ZXAsIHBhcmFtcy50aWNrQ291bnQpO1xuXG4gICAgICAgIC8vIDA0LiBsaW5l7LCo7Yq47J2YIOqyveyasCDsgqzsmqnsnpDsnZggbWlu6rCS7J20IHNjYWxl7J2YIG1pbuqwkuqzvCDqsJnsnYQg6rK97JqwLCBtaW7qsJLsnYQgMSBzdGVwIOqwkOyGjCDsi5ztgrRcbiAgICAgICAgc2NhbGUubWluID0gdGhpcy5fYWRkTWluUGFkZGluZyh7XG4gICAgICAgICAgICBtaW46IHNjYWxlLm1pbixcbiAgICAgICAgICAgIHN0ZXA6IHN0ZXAsXG4gICAgICAgICAgICB1c2VyTWluOiBwYXJhbXMudXNlck1pbixcbiAgICAgICAgICAgIG1pbk9wdGlvbjogcGFyYW1zLm9wdGlvbnMubWluLFxuICAgICAgICAgICAgY2hhcnRUeXBlOiBwYXJhbXMuY2hhcnRUeXBlXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIDA0LiDsgqzsmqnsnpDsnZggbWF46rCS7J20IHNjYWVsIG1heOyZgCDqsJnsnYQg6rK97JqwLCBtYXjqsJLsnYQgMSBzdGVwIOymneqwgCDsi5ztgrRcbiAgICAgICAgc2NhbGUubWF4ID0gdGhpcy5fYWRkTWF4UGFkZGluZyh7XG4gICAgICAgICAgICBtYXg6IHNjYWxlLm1heCxcbiAgICAgICAgICAgIHN0ZXA6IHN0ZXAsXG4gICAgICAgICAgICB1c2VyTWF4OiBwYXJhbXMudXNlck1heCxcbiAgICAgICAgICAgIG1heE9wdGlvbjogcGFyYW1zLm9wdGlvbnMubWF4LFxuICAgICAgICAgICAgY2hhcnRUeXBlOiBwYXJhbXMuY2hhcnRUeXBlXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIDA1LiBheGlzIHNjYWxl7J20IOyCrOyaqeyekCBtaW4sIG1heOyZgCDqsbDrpqzqsIAg66mAIOqyveyasCDsobDsoIhcbiAgICAgICAgdGlja0luZm8gPSB0aGlzLl9taW5pbWl6ZVRpY2tTY2FsZSh7XG4gICAgICAgICAgICB1c2VyTWluOiBwYXJhbXMudXNlck1pbixcbiAgICAgICAgICAgIHVzZXJNYXg6IHBhcmFtcy51c2VyTWF4LFxuICAgICAgICAgICAgdGlja0luZm86IHtzY2FsZTogc2NhbGUsIHN0ZXA6IHN0ZXAsIHRpY2tDb3VudDogcGFyYW1zLnRpY2tDb3VudH0sXG4gICAgICAgICAgICBvcHRpb25zOiBwYXJhbXMub3B0aW9uc1xuICAgICAgICB9KTtcblxuICAgICAgICB0aWNrSW5mbyA9IHRoaXMuX2RpdmlkZVRpY2tTdGVwKHRpY2tJbmZvLCBwYXJhbXMudGlja0NvdW50KTtcbiAgICAgICAgcmV0dXJuIHRpY2tJbmZvO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgc2NhbGUgbWluIHBhZGRpbmcuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcHJhbXMge251bWJlcn0gcGFyYW1zLm1pbiBzY2FsZSBtaW5cbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMudXNlck1pbiBtaW5pbXVtIHZhbHVlIG9mIHVzZXIgZGF0YVxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5taW5PcHRpb24gbWluIG9wdGlvblxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5zdGVwIHRpY2sgc3RlcFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IHNjYWxlIG1pblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2FkZE1pblBhZGRpbmc6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgbWluID0gcGFyYW1zLm1pbjtcblxuICAgICAgICBpZiAoKHBhcmFtcy5jaGFydFR5cGUgIT09IGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9MSU5FICYmIHBhcmFtcy51c2VyTWluID49IDApIHx8ICF0dWkudXRpbC5pc1VuZGVmaW5lZChwYXJhbXMubWluT3B0aW9uKSkge1xuICAgICAgICAgICAgcmV0dXJuIG1pbjtcbiAgICAgICAgfVxuICAgICAgICAvLyBub3JtYWxpemXrkJwgc2NhbGUgbWlu6rCS7J20IHVzZXIgbWlu6rCS6rO8IOqwmeydhCDqsr3smrAgc3RlcCDqsJDshoxcbiAgICAgICAgaWYgKHBhcmFtcy5taW4gPT09IHBhcmFtcy51c2VyTWluKSB7XG4gICAgICAgICAgICBtaW4gLT0gcGFyYW1zLnN0ZXA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1pbjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIHNjYWxlIG1heCBwYWRkaW5nLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHByYW1zIHtudW1iZXJ9IHBhcmFtcy5tYXggc2NhbGUgbWF4XG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnVzZXJNYXggbWF4aW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubWF4T3B0aW9uIG1heCBvcHRpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuc3RlcCB0aWNrIHN0ZXBcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBzY2FsZSBtYXhcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hZGRNYXhQYWRkaW5nOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIG1heCA9IHBhcmFtcy5tYXg7XG5cbiAgICAgICAgaWYgKChwYXJhbXMuY2hhcnRUeXBlICE9PSBjaGFydENvbnN0LkNIQVJUX1RZUEVfTElORSAmJiBwYXJhbXMudXNlck1heCA8PSAwKSB8fCAhdHVpLnV0aWwuaXNVbmRlZmluZWQocGFyYW1zLm1heE9wdGlvbikpIHtcbiAgICAgICAgICAgIHJldHVybiBtYXg7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBub3JtYWxpemXrkJwgc2NhbGUgbWF46rCS7J20IHVzZXIgbWF46rCS6rO8IOqwmeydhCDqsr3smrAgc3RlcCDspp3qsIBcbiAgICAgICAgaWYgKHR1aS51dGlsLmlzVW5kZWZpbmVkKHBhcmFtcy5tYXhPcHRpb24pICYmIChwYXJhbXMubWF4ID09PSBwYXJhbXMudXNlck1heCkpIHtcbiAgICAgICAgICAgIG1heCArPSBwYXJhbXMuc3RlcDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWF4O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBub3JtYWxpemUgbWluLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtaW4gb3JpZ2luYWwgbWluXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHN0ZXAgdGljayBzdGVwXG4gICAgICogQHJldHVybnMge251bWJlcn0gbm9ybWFsaXplZCBtaW5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9ub3JtYWxpemVNaW46IGZ1bmN0aW9uKG1pbiwgc3RlcCkge1xuICAgICAgICB2YXIgbW9kID0gdHVpLnV0aWwubW9kKG1pbiwgc3RlcCksXG4gICAgICAgICAgICBub3JtYWxpemVkO1xuXG4gICAgICAgIGlmIChtb2QgPT09IDApIHtcbiAgICAgICAgICAgIG5vcm1hbGl6ZWQgPSBtaW47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBub3JtYWxpemVkID0gdHVpLnV0aWwuc3VidHJhY3Rpb24obWluLCAobWluID49IDAgPyBtb2QgOiBzdGVwICsgbW9kKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5vcm1hbGl6ZWQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2Ugbm9ybWFsaXplZCBtYXguXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpheGlzRGF0YU1ha2VyXG4gICAgICogQHBhcmFtIHt7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX0gc2NhbGUgc2NhbGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3RlcCB0aWNrIHN0ZXBcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdGlja0NvdW50IHRpY2sgY291bnRcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBub3JtYWxpemVkIG1heFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VOb3JtYWxpemVkTWF4OiBmdW5jdGlvbihzY2FsZSwgc3RlcCwgdGlja0NvdW50KSB7XG4gICAgICAgIHZhciBtaW5NYXhEaWZmID0gdHVpLnV0aWwubXVsdGlwbGljYXRpb24oc3RlcCwgdGlja0NvdW50IC0gMSksXG4gICAgICAgICAgICBub3JtYWxpemVkTWF4ID0gdHVpLnV0aWwuYWRkaXRpb24oc2NhbGUubWluLCBtaW5NYXhEaWZmKSxcbiAgICAgICAgICAgIG1heERpZmYgPSBzY2FsZS5tYXggLSBub3JtYWxpemVkTWF4LFxuICAgICAgICAgICAgbW9kRGlmZiwgZGl2aWRlRGlmZjtcbiAgICAgICAgLy8gbm9ybWFsaXpl65CcIG1heOqwkuydtCDsm5DrnpjsnZggbWF46rCSIOuztOuLpCDsnpHsnYQg6rK97JqwIHN0ZXDsnYQg7Kad6rCA7Iuc7LycIO2BsCDqsJLsnLzroZwg66eM65Ok6riwXG4gICAgICAgIGlmIChtYXhEaWZmID4gMCkge1xuICAgICAgICAgICAgbW9kRGlmZiA9IG1heERpZmYgJSBzdGVwO1xuICAgICAgICAgICAgZGl2aWRlRGlmZiA9IE1hdGguZmxvb3IobWF4RGlmZiAvIHN0ZXApO1xuICAgICAgICAgICAgbm9ybWFsaXplZE1heCArPSBzdGVwICogKG1vZERpZmYgPiAwID8gZGl2aWRlRGlmZiArIDEgOiBkaXZpZGVEaWZmKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbm9ybWFsaXplZE1heDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbm9ybWFsaXplIHNjYWxlLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7e21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19IHNjYWxlIGJhc2Ugc2NhbGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3RlcCB0aWNrIHN0ZXBcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdGlja0NvdW50IHRpY2sgY291bnRcbiAgICAgKiBAcmV0dXJucyB7e21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19IG5vcm1hbGl6ZWQgc2NhbGVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9ub3JtYWxpemVTY2FsZTogZnVuY3Rpb24oc2NhbGUsIHN0ZXAsIHRpY2tDb3VudCkge1xuICAgICAgICBzY2FsZS5taW4gPSB0aGlzLl9ub3JtYWxpemVNaW4oc2NhbGUubWluLCBzdGVwKTtcbiAgICAgICAgc2NhbGUubWF4ID0gdGhpcy5fbWFrZU5vcm1hbGl6ZWRNYXgoc2NhbGUsIHN0ZXAsIHRpY2tDb3VudCk7XG4gICAgICAgIHJldHVybiBzY2FsZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNhbmRpZGF0ZXMgYWJvdXQgdGljayBpbmZvLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5taW4gbWluaW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubWF4IG1heGltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxudW1iZXI+fSBwYXJhbXMudGlja0NvdW50cyB0aWNrIGNvdW50c1xuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5jaGFydFR5cGUgY2hhcnQgdHlwZVxuICAgICAqIEBwYXJhbSB7e21pbjogbnVtYmVyLCBtYXg6bnVtYmVyfX0gb3B0aW9ucyBheGlzIG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7YXJyYXl9IGNhbmRpZGF0ZXMgYWJvdXQgdGljayBpbmZvXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0Q2FuZGlkYXRlVGlja0luZm9zOiBmdW5jdGlvbihwYXJhbXMsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIHVzZXJNaW4gPSBwYXJhbXMubWluLFxuICAgICAgICAgICAgdXNlck1heCA9IHBhcmFtcy5tYXgsXG4gICAgICAgICAgICBtaW4gPSBwYXJhbXMubWluLFxuICAgICAgICAgICAgbWF4ID0gcGFyYW1zLm1heCxcbiAgICAgICAgICAgIHNjYWxlLCBjYW5kaWRhdGVzO1xuXG4gICAgICAgIC8vIG1pbiwgbWF466eM7Jy866GcIOq4sOuzuCBzY2FsZSDslrvquLBcbiAgICAgICAgc2NhbGUgPSB0aGlzLl9tYWtlQmFzZVNjYWxlKG1pbiwgbWF4LCBvcHRpb25zKTtcblxuICAgICAgICBjYW5kaWRhdGVzID0gdHVpLnV0aWwubWFwKHBhcmFtcy50aWNrQ291bnRzLCBmdW5jdGlvbih0aWNrQ291bnQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9tYWtlVGlja0luZm8oe1xuICAgICAgICAgICAgICAgIHRpY2tDb3VudDogdGlja0NvdW50LFxuICAgICAgICAgICAgICAgIHNjYWxlOiB0dWkudXRpbC5leHRlbmQoe30sIHNjYWxlKSxcbiAgICAgICAgICAgICAgICB1c2VyTWluOiB1c2VyTWluLFxuICAgICAgICAgICAgICAgIHVzZXJNYXg6IHVzZXJNYXgsXG4gICAgICAgICAgICAgICAgY2hhcnRUeXBlOiBwYXJhbXMuY2hhcnRUeXBlLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IG9wdGlvbnNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIGNhbmRpZGF0ZXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYmFzZSBzY2FsZVxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtaW4gbWluaW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWF4IG1heGltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogQHBhcmFtIHt7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX0gb3B0aW9ucyBheGlzIG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7e21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19IGJhc2Ugc2NhbGVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQmFzZVNjYWxlOiBmdW5jdGlvbihtaW4sIG1heCwgb3B0aW9ucykge1xuICAgICAgICB2YXIgaXNNaW51cyA9IGZhbHNlLFxuICAgICAgICAgICAgdG1wTWluLCBzY2FsZTtcblxuICAgICAgICBpZiAobWluIDwgMCAmJiBtYXggPD0gMCkge1xuICAgICAgICAgICAgaXNNaW51cyA9IHRydWU7XG4gICAgICAgICAgICB0bXBNaW4gPSBtaW47XG4gICAgICAgICAgICBtaW4gPSAtbWF4O1xuICAgICAgICAgICAgbWF4ID0gLXRtcE1pbjtcbiAgICAgICAgfVxuXG4gICAgICAgIHNjYWxlID0gY2FsY3VsYXRvci5jYWxjdWxhdGVTY2FsZShtaW4sIG1heCk7XG5cbiAgICAgICAgaWYgKGlzTWludXMpIHtcbiAgICAgICAgICAgIHRtcE1pbiA9IHNjYWxlLm1pbjtcbiAgICAgICAgICAgIHNjYWxlLm1pbiA9IC1zY2FsZS5tYXg7XG4gICAgICAgICAgICBzY2FsZS5tYXggPSAtdG1wTWluO1xuICAgICAgICB9XG5cbiAgICAgICAgc2NhbGUubWluID0gb3B0aW9ucy5taW4gfHwgc2NhbGUubWluO1xuICAgICAgICBzY2FsZS5tYXggPSBvcHRpb25zLm1heCB8fCBzY2FsZS5tYXg7XG5cbiAgICAgICAgcmV0dXJuIHNjYWxlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGb3JtYXQgbGFiZWxzLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6YXhpc0RhdGFNYWtlclxuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IGxhYmVscyB0YXJnZXQgbGFiZWxzXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbltdfSBmb3JtYXRGdW5jdGlvbnMgZm9ybWF0IGZ1bmN0aW9uc1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmdbXX0gZm9ybWF0dGVkIGxhYmVsc1xuICAgICAqL1xuICAgIGZvcm1hdExhYmVsczogZnVuY3Rpb24obGFiZWxzLCBmb3JtYXRGdW5jdGlvbnMpIHtcbiAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgaWYgKCFmb3JtYXRGdW5jdGlvbnMgfHwgIWZvcm1hdEZ1bmN0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBsYWJlbHM7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0ID0gdHVpLnV0aWwubWFwKGxhYmVscywgZnVuY3Rpb24obGFiZWwpIHtcbiAgICAgICAgICAgIHZhciBmbnMgPSBjb25jYXQuYXBwbHkoW2xhYmVsXSwgZm9ybWF0RnVuY3Rpb25zKTtcbiAgICAgICAgICAgIHJldHVybiB0dWkudXRpbC5yZWR1Y2UoZm5zLCBmdW5jdGlvbihzdG9yZWQsIGZuKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZuKHN0b3JlZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBheGlzRGF0YU1ha2VyO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEJvdW5kcyBtYWtlci5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuLi9jb25zdCcpLFxuICAgIGNhbGN1bGF0b3IgPSByZXF1aXJlKCcuL2NhbGN1bGF0b3InKSxcbiAgICByZW5kZXJVdGlsID0gcmVxdWlyZSgnLi9yZW5kZXJVdGlsJyk7XG5cbnZhciBjb25jYXQgPSBBcnJheS5wcm90b3R5cGUuY29uY2F0O1xuXG4vKipcbiAqIEJvdW5kcyBtYWtlci5cbiAqIEBtb2R1bGUgYm91bmRzTWFrZXJcbiAqL1xudmFyIGJvdW5kc01ha2VyID0ge1xuICAgIC8qKlxuICAgICAqIEdldCBtYXggbGFiZWwgb2YgdmFsdWUgYXhpcy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmJvdW5kc01ha2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGNvbnZlcnRlZERhdGEgY29udmVydCBkYXRhXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNoYXJ0VHlwZSBjaGFydCB0eXBlXG4gICAgICogQHJldHVybnMge251bWJlcnxzdHJpbmd9IG1heCBsYWJlbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFZhbHVlQXhpc01heExhYmVsOiBmdW5jdGlvbihjb252ZXJ0ZWREYXRhLCBjaGFydFR5cGUpIHtcbiAgICAgICAgdmFyIHZhbHVlcyA9IGNoYXJ0VHlwZSAmJiBjb252ZXJ0ZWREYXRhLnZhbHVlc1tjaGFydFR5cGVdIHx8IGNvbnZlcnRlZERhdGEuam9pblZhbHVlcyxcbiAgICAgICAgICAgIGZvcm1hdEZ1bmN0aW9ucyA9IGNvbnZlcnRlZERhdGEuZm9ybWF0RnVuY3Rpb25zLFxuICAgICAgICAgICAgZmxhdHRlblZhbHVlcyA9IGNvbmNhdC5hcHBseShbXSwgdmFsdWVzKSxcbiAgICAgICAgICAgIG1pbiA9IHR1aS51dGlsLm1pbihmbGF0dGVuVmFsdWVzKSxcbiAgICAgICAgICAgIG1heCA9IHR1aS51dGlsLm1heChmbGF0dGVuVmFsdWVzKSxcbiAgICAgICAgICAgIHNjYWxlID0gY2FsY3VsYXRvci5jYWxjdWxhdGVTY2FsZShtaW4sIG1heCksXG4gICAgICAgICAgICBtaW5MYWJlbCA9IGNhbGN1bGF0b3Iubm9ybWFsaXplQXhpc051bWJlcihzY2FsZS5taW4pLFxuICAgICAgICAgICAgbWF4TGFiZWwgPSBjYWxjdWxhdG9yLm5vcm1hbGl6ZUF4aXNOdW1iZXIoc2NhbGUubWF4KSxcbiAgICAgICAgICAgIGZucyA9IGZvcm1hdEZ1bmN0aW9ucyAmJiBmb3JtYXRGdW5jdGlvbnMuc2xpY2UoKSB8fCBbXTtcbiAgICAgICAgbWF4TGFiZWwgPSAobWluTGFiZWwgKyAnJykubGVuZ3RoID4gKG1heExhYmVsICsgJycpLmxlbmd0aCA/IG1pbkxhYmVsIDogbWF4TGFiZWw7XG4gICAgICAgIGZucy51bnNoaWZ0KG1heExhYmVsKTtcbiAgICAgICAgbWF4TGFiZWwgPSB0dWkudXRpbC5yZWR1Y2UoZm5zLCBmdW5jdGlvbihzdG9yZWQsIGZuKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4oc3RvcmVkKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBtYXhMYWJlbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGhlaWdodCBvZiB4IGF4aXMgYXJlYS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmJvdW5kc01ha2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgeCBheGlzIG9wdGlvbnMsXG4gICAgICogQHBhcmFtIHthcnJheS48c3RyaW5nPn0gbGFiZWxzIGF4aXMgbGFiZWxzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIGF4aXMgdGhlbWVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBoZWlnaHRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRYQXhpc0hlaWdodDogZnVuY3Rpb24ob3B0aW9ucywgbGFiZWxzLCB0aGVtZSkge1xuICAgICAgICB2YXIgdGl0bGUgPSBvcHRpb25zICYmIG9wdGlvbnMudGl0bGUsXG4gICAgICAgICAgICB0aXRsZUFyZWFIZWlnaHQgPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxIZWlnaHQodGl0bGUsIHRoZW1lLnRpdGxlKSArIGNoYXJ0Q29uc3QuVElUTEVfUEFERElORyxcbiAgICAgICAgICAgIGhlaWdodCA9IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbHNNYXhIZWlnaHQobGFiZWxzLCB0aGVtZS5sYWJlbCkgKyB0aXRsZUFyZWFIZWlnaHQ7XG4gICAgICAgIHJldHVybiBoZWlnaHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB3aWR0aCBhYm91dCB5IGF4aXMuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgeSBheGlzIG9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBsYWJlbHMgbGFiZWxzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIHlBeGlzIHRoZW1lXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IG9wdGlvbnMgaW5kZXhcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSB5IGF4aXMgd2lkdGhcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRZQXhpc1dpZHRoOiBmdW5jdGlvbihvcHRpb25zLCBsYWJlbHMsIHRoZW1lLCBpbmRleCkge1xuICAgICAgICB2YXIgdGl0bGUgPSAnJyxcbiAgICAgICAgICAgIHRpdGxlQXJlYVdpZHRoLCB3aWR0aDtcblxuICAgICAgICBpZiAob3B0aW9ucykge1xuICAgICAgICAgICAgb3B0aW9ucyA9IFtdLmNvbmNhdChvcHRpb25zKTtcbiAgICAgICAgICAgIHRpdGxlID0gb3B0aW9uc1tpbmRleCB8fCAwXS50aXRsZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRpdGxlQXJlYVdpZHRoID0gcmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsSGVpZ2h0KHRpdGxlLCB0aGVtZS50aXRsZSkgKyBjaGFydENvbnN0LlRJVExFX1BBRERJTkc7XG4gICAgICAgIHdpZHRoID0gcmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsc01heFdpZHRoKGxhYmVscywgdGhlbWUubGFiZWwpICsgdGl0bGVBcmVhV2lkdGggKyBjaGFydENvbnN0LkFYSVNfTEFCRUxfUEFERElORztcblxuICAgICAgICByZXR1cm4gd2lkdGg7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB3aWR0aCBhYm91dCB5IHJpZ2h0IGF4aXMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpib3VuZHNNYWtlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48c3RyaW5nPn0gcGFyYW1zLmNoYXJ0VHlwZXMgeSBheGlzIGNoYXJ0IHR5cGVzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIHkgYXhpcyB0aGVtZVxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5vcHRpb25zIHkgYXhpcyBvcHRpb25zXG4gICAgICogQHJldHVybnMge251bWJlcn0geSByaWdodCBheGlzIHdpZHRoXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0WVJBeGlzV2lkdGg6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgY2hhcnRUeXBlcyA9IHBhcmFtcy5jaGFydFR5cGVzIHx8IFtdLFxuICAgICAgICAgICAgbGVuID0gY2hhcnRUeXBlcy5sZW5ndGgsXG4gICAgICAgICAgICB3aWR0aCA9IDAsXG4gICAgICAgICAgICBpbmRleCwgY2hhcnRUeXBlLCB0aGVtZSwgbGFiZWw7XG4gICAgICAgIGlmIChsZW4gPiAwKSB7XG4gICAgICAgICAgICBpbmRleCA9IGxlbiAtIDE7XG4gICAgICAgICAgICBjaGFydFR5cGUgPSBjaGFydFR5cGVzW2luZGV4XTtcbiAgICAgICAgICAgIHRoZW1lID0gcGFyYW1zLnRoZW1lW2NoYXJ0VHlwZV0gfHwgcGFyYW1zLnRoZW1lO1xuICAgICAgICAgICAgbGFiZWwgPSB0aGlzLl9nZXRWYWx1ZUF4aXNNYXhMYWJlbChwYXJhbXMuY29udmVydGVkRGF0YSwgY2hhcnRUeXBlKTtcbiAgICAgICAgICAgIHdpZHRoID0gdGhpcy5fZ2V0WUF4aXNXaWR0aChwYXJhbXMub3B0aW9ucywgW2xhYmVsXSwgdGhlbWUsIGluZGV4KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gd2lkdGg7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYXhlcyBkaW1lbnNpb24uXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpib3VuZHNNYWtlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5jb252ZXJ0ZWREYXRhIGNvbnZlcnRlZCBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIGNoYXJ0IHRoZW1lXG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5pc1ZlcnRpY2FsIHdoZXRoZXIgdmVydGljYWwgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqICAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuYXhlc0xhYmVsSW5mbyBheGVzIGxhYmVsIGluZm9cbiAgICAgKiBAcmV0dXJucyB7e1xuICAgICAqICAgICAgeUF4aXM6IHt3aWR0aDogbnVtYmVyfSxcbiAgICAgKiAgICAgIHlyQXhpczoge3dpZHRoOiBudW1iZXJ9LFxuICAgICAqICAgICAgeEF4aXM6IHtoZWlnaHQ6IG51bWJlcn1cbiAgICAgKiB9fSBheGVzIGRpbWVuc2lvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VBeGVzRGltZW5zaW9uOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIHlBeGlzV2lkdGggPSAwLFxuICAgICAgICAgICAgeEF4aXNIZWlnaHQgPSAwLFxuICAgICAgICAgICAgeXJBeGlzV2lkdGggPSAwLFxuICAgICAgICAgICAgYXhlc0xhYmVsSW5mbywgY2hhcnRUeXBlO1xuXG4gICAgICAgIC8vIGF4aXMg7JiB7Jet7J20IO2VhOyalCDsnojripQg6rK97Jqw7JeQ66eMIOyymOumrFxuICAgICAgICBpZiAocGFyYW1zLmhhc0F4ZXMpIHtcbiAgICAgICAgICAgIGF4ZXNMYWJlbEluZm8gPSBwYXJhbXMuYXhlc0xhYmVsSW5mbztcbiAgICAgICAgICAgIGNoYXJ0VHlwZSA9IHBhcmFtcy5vcHRpb25DaGFydFR5cGVzICYmIHBhcmFtcy5vcHRpb25DaGFydFR5cGVzWzBdIHx8ICcnO1xuICAgICAgICAgICAgeUF4aXNXaWR0aCA9IHRoaXMuX2dldFlBeGlzV2lkdGgocGFyYW1zLm9wdGlvbnMueUF4aXMsIGF4ZXNMYWJlbEluZm8ueUF4aXMsIHBhcmFtcy50aGVtZS55QXhpc1tjaGFydFR5cGVdIHx8IHBhcmFtcy50aGVtZS55QXhpcyk7XG4gICAgICAgICAgICB4QXhpc0hlaWdodCA9IHRoaXMuX2dldFhBeGlzSGVpZ2h0KHBhcmFtcy5vcHRpb25zLnhBeGlzLCBheGVzTGFiZWxJbmZvLnhBeGlzLCBwYXJhbXMudGhlbWUueEF4aXMpO1xuICAgICAgICAgICAgeXJBeGlzV2lkdGggPSB0aGlzLl9nZXRZUkF4aXNXaWR0aCh7XG4gICAgICAgICAgICAgICAgY29udmVydGVkRGF0YTogcGFyYW1zLmNvbnZlcnRlZERhdGEsXG4gICAgICAgICAgICAgICAgY2hhcnRUeXBlczogcGFyYW1zLm9wdGlvbkNoYXJ0VHlwZXMsXG4gICAgICAgICAgICAgICAgdGhlbWU6IHBhcmFtcy50aGVtZS55QXhpcyxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBwYXJhbXMub3B0aW9ucy55QXhpc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeUF4aXM6IHtcbiAgICAgICAgICAgICAgICB3aWR0aDogeUF4aXNXaWR0aFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHlyQXhpczoge1xuICAgICAgICAgICAgICAgIHdpZHRoOiB5ckF4aXNXaWR0aFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHhBeGlzOiB7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiB4QXhpc0hlaWdodFxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGxlZ2VuZCBkaW1lbnNpb24uXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpib3VuZHNNYWtlclxuICAgICAqIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGpvaW5MZWdlbmRMYWJlbHMgbGVnZW5kIGxhYmVsc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBsYWJlbFRoZW1lIGxhYmVsIHRoZW1lXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNoYXJ0VHlwZSBjaGFydCB0eXBlXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHNlcmllc09wdGlvbiBzZXJpZXMgb3B0aW9uXG4gICAgICogQHJldHVybnMge3t3aWR0aDogbnVtYmVyfX0gbGVnZW5kIGRpbWVuc2lvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VMZWdlbmREaW1lbnNpb246IGZ1bmN0aW9uKGpvaW5MZWdlbmRMYWJlbHMsIGxhYmVsVGhlbWUsIGNoYXJ0VHlwZSwgc2VyaWVzT3B0aW9uKSB7XG4gICAgICAgIHZhciBsZWdlbmRXaWR0aCA9IDAsXG4gICAgICAgICAgICBsZWdlbmRMYWJlbHMsIG1heExhYmVsV2lkdGg7XG5cbiAgICAgICAgc2VyaWVzT3B0aW9uID0gc2VyaWVzT3B0aW9uIHx8IHt9O1xuXG4gICAgICAgIGlmIChjaGFydFR5cGUgIT09IGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9QSUUgfHwgIXNlcmllc09wdGlvbi5sZWdlbmRUeXBlKSB7XG4gICAgICAgICAgICBsZWdlbmRMYWJlbHMgPSB0dWkudXRpbC5tYXAoam9pbkxlZ2VuZExhYmVscywgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpdGVtLmxhYmVsO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBtYXhMYWJlbFdpZHRoID0gcmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsc01heFdpZHRoKGxlZ2VuZExhYmVscywgbGFiZWxUaGVtZSk7XG4gICAgICAgICAgICBsZWdlbmRXaWR0aCA9IG1heExhYmVsV2lkdGggKyBjaGFydENvbnN0LkxFR0VORF9SRUNUX1dJRFRIICtcbiAgICAgICAgICAgICAgICBjaGFydENvbnN0LkxFR0VORF9MQUJFTF9MRUZUX1BBRERJTkcgKyAoY2hhcnRDb25zdC5MRUdFTkRfQVJFQV9QQURESU5HICogMik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgd2lkdGg6IGxlZ2VuZFdpZHRoXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2Ugc2VyaWVzIGRpbWVuc2lvbi5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmJvdW5kc01ha2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IHBhcmFtcy5jaGFydERpbWVuc2lvbiBjaGFydCBkaW1lbnNpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7e1xuICAgICAqICAgICAgICAgIHlBeGlzOiB7d2lkdGg6IG51bWJlciwgaGVpZ2h0Om51bWJlcn0sXG4gICAgICogICAgICAgICAgeEF4aXM6IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6bnVtYmVyfSxcbiAgICAgKiAgICAgICAgICB5ckF4aXM6IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6bnVtYmVyfVxuICAgICAqICAgICAgfX0gcGFyYW1zLmF4ZXNEaW1lbnNpb24gYXhlcyBkaW1lbnNpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubGVnZW5kV2lkdGggbGVnZW5kIHdpZHRoXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnRpdGxlSGVpZ2h0IHRpdGxlIGhlaWdodFxuICAgICAqIEByZXR1cm5zIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBzZXJpZXMgZGltZW5zaW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVNlcmllc0RpbWVuc2lvbjogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBheGVzRGltZW5zaW9uID0gcGFyYW1zLmF4ZXNEaW1lbnNpb24sXG4gICAgICAgICAgICByaWdodEFyZWFXaWR0aCA9IHBhcmFtcy5sZWdlbmRXaWR0aCArIGF4ZXNEaW1lbnNpb24ueXJBeGlzLndpZHRoLFxuICAgICAgICAgICAgd2lkdGggPSBwYXJhbXMuY2hhcnREaW1lbnNpb24ud2lkdGggLSAoY2hhcnRDb25zdC5DSEFSVF9QQURESU5HICogMikgLSBheGVzRGltZW5zaW9uLnlBeGlzLndpZHRoIC0gcmlnaHRBcmVhV2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQgPSBwYXJhbXMuY2hhcnREaW1lbnNpb24uaGVpZ2h0IC0gKGNoYXJ0Q29uc3QuQ0hBUlRfUEFERElORyAqIDIpIC0gcGFyYW1zLnRpdGxlSGVpZ2h0IC0gYXhlc0RpbWVuc2lvbi54QXhpcy5oZWlnaHQ7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogaGVpZ2h0XG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgY2hhcnQgZGltZW5zaW9uLlxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gY2hhcnRPcHRpb25zIGNoYXJ0IG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7e3dpZHRoOiAobnVtYmVyKSwgaGVpZ2h0OiAobnVtYmVyKX19IGNoYXJ0IGRpbWVuc2lvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VDaGFydERpbWVuc2lvbjogZnVuY3Rpb24oY2hhcnRPcHRpb25zKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB3aWR0aDogY2hhcnRPcHRpb25zLndpZHRoIHx8IGNoYXJ0Q29uc3QuQ0hBUlRfREVGQVVMVF9XSURUSCxcbiAgICAgICAgICAgIGhlaWdodDogY2hhcnRPcHRpb25zLmhlaWdodCB8fCBjaGFydENvbnN0LkNIQVJUX0RFRkFVTFRfSEVJR0hUXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgdGl0bGUgZGltZW5zaW9uXG4gICAgICogQHBhcmFtIHt7dGl0bGU6IHN0cmluZ319IG9wdGlvbiB0aXRsZSBvcHRpb25cbiAgICAgKiBAcGFyYW0ge3tmb250RmFtaWx5OiBzdHJpbmcsIGZvbnRTaXplOiBudW1iZXJ9fSB0aGVtZSB0aXRsZSB0aGVtZVxuICAgICAqIEByZXR1cm5zIHt7aGVpZ2h0OiBudW1iZXJ9fSB0aXRsZSBkaW1lbnNpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlVGl0bGVEaW1lbnNpb246IGZ1bmN0aW9uKG9wdGlvbiwgdGhlbWUpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGhlaWdodDogcmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsSGVpZ2h0KG9wdGlvbiwgdGhlbWUpICsgY2hhcnRDb25zdC5USVRMRV9QQURESU5HXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgcGxvdCBkaW1lbnRpb25cbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IHNlcmllc0RpbWVuc2lvbiBzZXJpZXMgZGltZW5zaW9uXG4gICAgICogQHJldHVybnMge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IHBsb3QgZGltZW5zaW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVBsb3REaW1lbnNpb246IGZ1bmN0aW9uKHNlcmllc0RpbWVuc2lvbikge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgd2lkdGg6IHNlcmllc0RpbWVuc2lvbi53aWR0aCArIGNoYXJ0Q29uc3QuSElEREVOX1dJRFRILFxuICAgICAgICAgICAgaGVpZ2h0OiBzZXJpZXNEaW1lbnNpb24uaGVpZ2h0ICsgY2hhcnRDb25zdC5ISURERU5fV0lEVEhcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNvbXBvbmVudHMgZGltZW5zaW9uXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpib3VuZHNNYWtlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5jb252ZXJ0ZWREYXRhIGNvbnZlcnRlZCBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIGNoYXJ0IHRoZW1lXG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5pc1ZlcnRpY2FsIHdoZXRoZXIgdmVydGljYWwgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5heGVzTGFiZWxJbmZvIGF4ZXMgbGFiZWwgaW5mb1xuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IGNvbXBvbmVudHMgZGltZW5zaW9uc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldENvbXBvbmVudHNEaW1lbnNpb25zOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGNoYXJ0T3B0aW9ucyA9IHBhcmFtcy5vcHRpb25zLmNoYXJ0IHx8IHt9LFxuICAgICAgICAgICAgY2hhcnREaW1lbnNpb24gPSB0aGlzLl9tYWtlQ2hhcnREaW1lbnNpb24oY2hhcnRPcHRpb25zKSxcbiAgICAgICAgICAgIHRpdGxlRGltZW5zaW9uID0gdGhpcy5fbWFrZVRpdGxlRGltZW5zaW9uKGNoYXJ0T3B0aW9ucy50aXRsZSwgcGFyYW1zLnRoZW1lLnRpdGxlKSxcbiAgICAgICAgICAgIGF4ZXNEaW1lbnNpb24gPSB0aGlzLl9tYWtlQXhlc0RpbWVuc2lvbihwYXJhbXMpLFxuICAgICAgICAgICAgbGVnZW5kRGltZW5zaW9uID0gdGhpcy5fbWFrZUxlZ2VuZERpbWVuc2lvbihwYXJhbXMuY29udmVydGVkRGF0YS5qb2luTGVnZW5kTGFiZWxzLCBwYXJhbXMudGhlbWUubGVnZW5kLmxhYmVsLCBwYXJhbXMuY2hhcnRUeXBlLCBwYXJhbXMub3B0aW9ucy5zZXJpZXMpLFxuICAgICAgICAgICAgc2VyaWVzRGltZW5zaW9uID0gdGhpcy5fbWFrZVNlcmllc0RpbWVuc2lvbih7XG4gICAgICAgICAgICAgICAgY2hhcnREaW1lbnNpb246IGNoYXJ0RGltZW5zaW9uLFxuICAgICAgICAgICAgICAgIGF4ZXNEaW1lbnNpb246IGF4ZXNEaW1lbnNpb24sXG4gICAgICAgICAgICAgICAgbGVnZW5kV2lkdGg6IGxlZ2VuZERpbWVuc2lvbi53aWR0aCxcbiAgICAgICAgICAgICAgICB0aXRsZUhlaWdodDogdGl0bGVEaW1lbnNpb24uaGVpZ2h0XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdHVpLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgIGNoYXJ0OiBjaGFydERpbWVuc2lvbixcbiAgICAgICAgICAgIHRpdGxlOiB0aXRsZURpbWVuc2lvbixcbiAgICAgICAgICAgIHNlcmllczogc2VyaWVzRGltZW5zaW9uLFxuICAgICAgICAgICAgcGxvdDogdGhpcy5fbWFrZVBsb3REaW1lbnNpb24oc2VyaWVzRGltZW5zaW9uKSxcbiAgICAgICAgICAgIGxlZ2VuZDogbGVnZW5kRGltZW5zaW9uXG4gICAgICAgIH0sIGF4ZXNEaW1lbnNpb24pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGJhc2ljIGJvdW5kLlxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gZGltZW5zaW9uIHNlcmllcyBkaW1lbnNpb24uXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHRvcCB0b3BcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbGVmdCBsZWZ0XG4gICAgICogQHJldHVybnMge3tkaW1lbnNpb246IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn0sIHBvc2l0aW9uOiB7dG9wOiBudW1iZXIsIGxlZnQ6IG51bWJlcn19fSBzZXJpZXMgYm91bmQuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUJhc2ljQm91bmQ6IGZ1bmN0aW9uKGRpbWVuc2lvbiwgdG9wLCBsZWZ0KSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkaW1lbnNpb246IGRpbWVuc2lvbixcbiAgICAgICAgICAgIHBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgdG9wOiB0b3AsXG4gICAgICAgICAgICAgICAgbGVmdDogbGVmdFxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHlBeGlzIGJvdW5kLlxuICAgICAqIEBwYXJhbSB7e3lBeGlzOiB7d2lkdGg6IG51bWJlcn0sIHBsb3Q6IHtoZWlnaHQ6IG51bWJlcn19fSBkaW1lbnNpb25zIGRpbWVuc2lvbnNcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdG9wIHRvcFxuICAgICAqIEByZXR1cm5zIHt7ZGltZW5zaW9uOiB7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiAobnVtYmVyKX0sIHBvc2l0aW9uOiB7dG9wOiBudW1iZXIsIGxlZnQ6IG51bWJlcn19fSB5QXhpcyBib3VuZFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VZQXhpc0JvdW5kOiBmdW5jdGlvbihkaW1lbnNpb25zLCB0b3ApIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRpbWVuc2lvbjoge1xuICAgICAgICAgICAgICAgIHdpZHRoOiBkaW1lbnNpb25zLnlBeGlzLndpZHRoLFxuICAgICAgICAgICAgICAgIGhlaWdodDogZGltZW5zaW9ucy5wbG90LmhlaWdodFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgdG9wOiB0b3AsXG4gICAgICAgICAgICAgICAgbGVmdDogdGhpcy5jaGFydExlZnRQYWRkaW5nXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgeEF4aXMgYm91bmQuXG4gICAgICogQHBhcmFtIHt7eEF4aXM6IHtoZWlnaHQ6IG51bWJlcn0sIHBsb3Q6IHt3aWR0aDogbnVtYmVyfX19IGRpbWVuc2lvbnMgZGltZW5zaW9uc1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB0b3AgdG9wXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGxlZnQgbGVmdFxuICAgICAqIEBwYXJhbSB7e2RlZ3JlZTogbnVtYmVyfX0gcm90YXRpb25JbmZvIHJvdGF0aW9uIGluZm9cbiAgICAgKiBAcmV0dXJucyB7e2RpbWVuc2lvbjoge3dpZHRoOiBudW1iZXIsIGhlaWdodDogKG51bWJlcil9LCBwb3NpdGlvbjoge3RvcDogbnVtYmVyLCBsZWZ0OiBudW1iZXJ9fX0geEF4aXMgYm91bmRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlWEF4aXNCb3VuZDogZnVuY3Rpb24oZGltZW5zaW9ucywgdG9wLCBsZWZ0LCByb3RhdGlvbkluZm8pIHtcbiAgICAgICAgdmFyIGJvdW5kID0ge1xuICAgICAgICAgICAgZGltZW5zaW9uOiB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IGRpbWVuc2lvbnMucGxvdC53aWR0aCxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IGRpbWVuc2lvbnMueEF4aXMuaGVpZ2h0XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICB0b3A6IHRvcCArIGRpbWVuc2lvbnMuc2VyaWVzLmhlaWdodCxcbiAgICAgICAgICAgICAgICBsZWZ0OiBsZWZ0IC0gY2hhcnRDb25zdC5ISURERU5fV0lEVEhcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBpZiAocm90YXRpb25JbmZvKSB7XG4gICAgICAgICAgICBib3VuZC5kZWdyZWUgPSByb3RhdGlvbkluZm8uZGVncmVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGJvdW5kO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHlyQXhpcyBib3VuZC5cbiAgICAgKiBAcGFyYW0ge3t5ckF4aXM6IHt3aWR0aDogbnVtYmVyfSwgcGxvdDoge2hlaWdodDogbnVtYmVyfSwgbGVnZW5kOiB7d2lkdGg6IG51bWJlcn19fSBkaW1lbnNpb25zIGRpbWVuc2lvbnNcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdG9wIHRvcFxuICAgICAqIEByZXR1cm5zIHt7ZGltZW5zaW9uOiB7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiAobnVtYmVyKX0sIHBvc2l0aW9uOiB7dG9wOiBudW1iZXIsIGxlZnQ6IG51bWJlcn19fSB5ckF4aXMgYm91bmRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlWVJBeGlzQm91bmQ6IGZ1bmN0aW9uKGRpbWVuc2lvbnMsIHRvcCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGltZW5zaW9uOiB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IGRpbWVuc2lvbnMueXJBeGlzLndpZHRoLFxuICAgICAgICAgICAgICAgIGhlaWdodDogZGltZW5zaW9ucy5wbG90LmhlaWdodFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgdG9wOiB0b3AsXG4gICAgICAgICAgICAgICAgcmlnaHQ6IGRpbWVuc2lvbnMubGVnZW5kLndpZHRoICsgY2hhcnRDb25zdC5ISURERU5fV0lEVEggKyBjaGFydENvbnN0LkNIQVJUX1BBRERJTkdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBheGVzIGJvdW5kcy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmJvdW5kc01ha2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5oYXNBeGVzIHdoZXRoZXIgaGFzIGF4ZWQgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBwYXJhbXMub3B0aW9uQ2hhcnRUeXBlcyB5IGF4aXMgY2hhcnQgdHlwZXNcbiAgICAgKiAgICAgIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gcGFyYW1zLmRpbWVuc2lvbiBjaGFydCBkaW1lbnNpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMudG9wIHRvcCBwb3NpdGlvblxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5yaWdodCByaWdodCBwb3NpdGlvblxuICAgICAqICAgICAgQHBhcmFtIHt7ZGVncmVlOiBudW1iZXJ9fSBwYXJhbXMucm90YXRpb25JbmZvIHJvdGF0aW9uIGluZm9cbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBheGVzIGJvdW5kc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VBeGVzQm91bmRzOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGJvdW5kcztcblxuICAgICAgICAvLyBwaWXssKjtirjsmYAg6rCZ7J20IGF4aXMg7JiB7Jet7J20IO2VhOyalCDsl4bripQg6rK97Jqw7JeQ64qUIOu5iCDqsJLsnYQg67CY7ZmYIO2VqFxuICAgICAgICBpZiAoIXBhcmFtcy5oYXNBeGVzKSB7XG4gICAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgIH1cblxuICAgICAgICBib3VuZHMgPSB7XG4gICAgICAgICAgICBwbG90OiB0aGlzLl9tYWtlQmFzaWNCb3VuZChwYXJhbXMuZGltZW5zaW9ucy5wbG90LCBwYXJhbXMudG9wLCBwYXJhbXMubGVmdCAtIGNoYXJ0Q29uc3QuSElEREVOX1dJRFRIKSxcbiAgICAgICAgICAgIHlBeGlzOiB0aGlzLl9tYWtlWUF4aXNCb3VuZChwYXJhbXMuZGltZW5zaW9ucywgcGFyYW1zLnRvcCksXG4gICAgICAgICAgICB4QXhpczogdGhpcy5fbWFrZVhBeGlzQm91bmQocGFyYW1zLmRpbWVuc2lvbnMsIHBhcmFtcy50b3AsIHBhcmFtcy5sZWZ0LCBwYXJhbXMucm90YXRpb25JbmZvKVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIOyasOy4oSB5IGF4aXMg7JiB7JetIGJvdW5kcyDsoJXrs7Qg7LaU6rCAXG4gICAgICAgIGlmIChwYXJhbXMub3B0aW9uQ2hhcnRUeXBlcyAmJiBwYXJhbXMub3B0aW9uQ2hhcnRUeXBlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGJvdW5kcy55ckF4aXMgPSB0aGlzLl9tYWtlWVJBeGlzQm91bmQocGFyYW1zLmRpbWVuc2lvbnMsIHBhcmFtcy50b3ApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGJvdW5kcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBjaGFydCBib3VuZC5cbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGRpbWVuc2lvbiBjaGFydCBkaW1lbnNpb24uXG4gICAgICogQHJldHVybnMge3tkaW1lbnNpb246IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19fSBjaGFydCBib3VuZFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VDaGFydEJvdW5kOiBmdW5jdGlvbihkaW1lbnNpb24pIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRpbWVuc2lvbjogZGltZW5zaW9uXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgbGVnZW5kIGJvdW5kLlxuICAgICAqIEBwYXJhbSB7e3RpdGxlOiB7aGVpZ2h0OiBudW1iZXJ9LCBzZXJpZXM6IHt3aWR0aDogbnVtYmVyfSwgeXJBeGlzOiB7d2lkdGg6IG51bWJlcn19fSBkaW1lbnNpb25zIGRpbWVuc2lvbnNcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geUF4aXNXaWR0aCB5QXhpcyB3aWR0aFxuICAgICAqIEByZXR1cm5zIHt7cG9zaXRpb246IHt0b3A6IG51bWJlciwgbGVmdDogbnVtYmVyfX19IGxlZ2VuZCBib3VuZFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VMZWdlbmRCb3VuZDogZnVuY3Rpb24oZGltZW5zaW9ucykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICB0b3A6IGRpbWVuc2lvbnMudGl0bGUuaGVpZ2h0LFxuICAgICAgICAgICAgICAgIGxlZnQ6IGRpbWVuc2lvbnMueUF4aXMud2lkdGggKyBkaW1lbnNpb25zLnNlcmllcy53aWR0aCArIGRpbWVuc2lvbnMueXJBeGlzLndpZHRoICsgdGhpcy5jaGFydExlZnRQYWRkaW5nXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYXhlcyBsYWJlbCBpbmZvLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaGFzQXhlcyB3aGV0aGVyIGhhcyBheGVzIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHthcnJheX0gcGFyYW1zLm9wdGlvbkNoYXJ0VHlwZXMgY2hhcnQgdHlwZXNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBjb252ZXJ0ZWREYXRhIGNvbnZlcnRlZCBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IGlzVmVydGljYWwgd2hldGhlciB2ZXJ0aWNhbCBvciBub3RcbiAgICAgKiBAcmV0dXJucyB7e3hBeGlzOiBhcnJheSwgeUF4aXM6IGFycmF5fX0gbGFiZWwgaW5mb1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VBeGVzTGFiZWxJbmZvOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGNoYXJ0VHlwZSwgbWF4VmFsdWVMYWJlbCwgeUxhYmVscywgeExhYmVscztcblxuICAgICAgICBpZiAoIXBhcmFtcy5oYXNBeGVzKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNoYXJ0VHlwZSA9IHBhcmFtcy5vcHRpb25DaGFydFR5cGVzICYmIHBhcmFtcy5vcHRpb25DaGFydFR5cGVzWzBdIHx8ICcnO1xuXG4gICAgICAgIC8vIHZhbHVlIOykkSDqsIDsnqUg7YGwIOqwkuydhCDstpTstpztlZjsl6wgdmFsdWUgbGFiZWzroZwg7KeA7KCVIChsYWJsZSDrhIjruYQg7LK07YGsIOyLnCDsgqzsmqkpXG4gICAgICAgIG1heFZhbHVlTGFiZWwgPSB0aGlzLl9nZXRWYWx1ZUF4aXNNYXhMYWJlbChwYXJhbXMuY29udmVydGVkRGF0YSwgY2hhcnRUeXBlKTtcblxuICAgICAgICAvLyDshLjroZzsmLXshZjsl5Ag65Sw65287IScIHjstpXqs7wgeey2leyXkCDsoIHsmqntlaAg66CI7J2067iUIOygleuztCDsp4DsoJVcbiAgICAgICAgaWYgKHBhcmFtcy5pc1ZlcnRpY2FsKSB7XG4gICAgICAgICAgICB5TGFiZWxzID0gW21heFZhbHVlTGFiZWxdO1xuICAgICAgICAgICAgeExhYmVscyA9IHBhcmFtcy5jb252ZXJ0ZWREYXRhLmxhYmVscztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHlMYWJlbHMgPSBwYXJhbXMuY29udmVydGVkRGF0YS5sYWJlbHM7XG4gICAgICAgICAgICB4TGFiZWxzID0gW21heFZhbHVlTGFiZWxdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHhBeGlzOiB4TGFiZWxzLFxuICAgICAgICAgICAgeUF4aXM6IHlMYWJlbHNcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmluZCByb3RhdGlvbiBkZWdyZWUuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGxpbWl0V2lkdGggbGltaXQgd2lkdGhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbGFiZWxXaWR0aCBsYWJlbCB3aWR0aFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBsYWJlbEhlaWdodCBsYWJlbCBoZWlnaHRcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggY2FuZGlkYXRlcyBpbmRleFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IHJvdGF0aW9uIGRlZ3JlZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2ZpbmRSb3RhdGlvbkRlZ3JlZTogZnVuY3Rpb24obGltaXRXaWR0aCwgbGFiZWxXaWR0aCwgbGFiZWxIZWlnaHQpIHtcbiAgICAgICAgdmFyIGZvdW5kRGVncmVlLFxuICAgICAgICAgICAgaGFsZldpZHRoID0gbGFiZWxXaWR0aCAvIDIsXG4gICAgICAgICAgICBoYWxmSGVpZ2h0ID0gbGFiZWxIZWlnaHQgLyAyO1xuXG4gICAgICAgIHR1aS51dGlsLmZvckVhY2hBcnJheShjaGFydENvbnN0LkRFR1JFRV9DQU5ESURBVEVTLCBmdW5jdGlvbihkZWdyZWUpIHtcbiAgICAgICAgICAgIHZhciBjb21wYXJlV2lkdGggPSAoY2FsY3VsYXRvci5jYWxjdWxhdGVBZGphY2VudChkZWdyZWUsIGhhbGZXaWR0aCkgKyBjYWxjdWxhdG9yLmNhbGN1bGF0ZUFkamFjZW50KGNoYXJ0Q29uc3QuQU5HTEVfOTAgLSBkZWdyZWUsIGhhbGZIZWlnaHQpKSAqIDI7XG4gICAgICAgICAgICBmb3VuZERlZ3JlZSA9IGRlZ3JlZTtcbiAgICAgICAgICAgIGlmIChjb21wYXJlV2lkdGggPD0gbGltaXRXaWR0aCArIGNoYXJ0Q29uc3QuWEFYSVNfTEFCRUxfQ09NUEFSRV9NQVJHSU4pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBmb3VuZERlZ3JlZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSByb3RhdGlvbiBpbmZvIGFib3V0IGhvcml6b250YWwgbGFiZWwuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHNlcmllc1dpZHRoIHNlcmllcyBhcmVhIHdpZHRoXG4gICAgICogQHBhcmFtIHthcnJheS48c3RyaW5nPn0gbGFiZWxzIGF4aXMgbGFiZWxzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIGF4aXMgbGFiZWwgdGhlbWVcbiAgICAgKiBAcmV0dXJucyB7P29iamVjdH0gcm90YXRpb24gaW5mb1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VIb3Jpem9udGFsTGFiZWxSb3RhdGlvbkluZm86IGZ1bmN0aW9uKHNlcmllc1dpZHRoLCBsYWJlbHMsIHRoZW1lKSB7XG4gICAgICAgIHZhciBtYXhMYWJlbFdpZHRoID0gcmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsc01heFdpZHRoKGxhYmVscywgdGhlbWUpLFxuICAgICAgICAgICAgbGltaXRXaWR0aCA9IHNlcmllc1dpZHRoIC8gbGFiZWxzLmxlbmd0aCAtIGNoYXJ0Q29uc3QuWEFYSVNfTEFCRUxfR1VUVEVSLFxuICAgICAgICAgICAgZGVncmVlLCBsYWJlbEhlaWdodDtcblxuICAgICAgICBpZiAobWF4TGFiZWxXaWR0aCA8PSBsaW1pdFdpZHRoKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxhYmVsSGVpZ2h0ID0gcmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsc01heEhlaWdodChsYWJlbHMsIHRoZW1lKTtcbiAgICAgICAgZGVncmVlID0gdGhpcy5fZmluZFJvdGF0aW9uRGVncmVlKGxpbWl0V2lkdGgsIG1heExhYmVsV2lkdGgsIGxhYmVsSGVpZ2h0KTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbWF4TGFiZWxXaWR0aDogbWF4TGFiZWxXaWR0aCxcbiAgICAgICAgICAgIGxhYmVsSGVpZ2h0OiBsYWJlbEhlaWdodCxcbiAgICAgICAgICAgIGRlZ3JlZTogZGVncmVlXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIGNhbGN1bGF0ZSBvdmVyZmxvdyBwb3NpdGlvbiBsZWZ0LlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5QXhpc1dpZHRoIHlBeGlzIHdpZHRoXG4gICAgICogQHBhcmFtIHt7ZGVncmVlOiBudW1iZXIsIGxhYmVsSGVpZ2h0OiBudW1iZXJ9fSByb3RhdGlvbkluZm8gcm90YXRpb24gaW5mb1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmaXJzdExhYmVsIGZpcnN0TGFiZWxcbiAgICAgKiBAcGFyYW0ge29iZWpjdH0gdGhlbWUgbGFiZWwgdGhlbWVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBvdmVyZmxvdyBwb3NpdGlvbiBsZWZ0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2FsY3VsYXRlT3ZlcmZsb3dMZWZ0OiBmdW5jdGlvbih5QXhpc1dpZHRoLCByb3RhdGlvbkluZm8sIGZpcnN0TGFiZWwsIHRoZW1lKSB7XG4gICAgICAgIHZhciBkZWdyZWUgPSByb3RhdGlvbkluZm8uZGVncmVlLFxuICAgICAgICAgICAgbGFiZWxIZWlnaHQgPSByb3RhdGlvbkluZm8ubGFiZWxIZWlnaHQsXG4gICAgICAgICAgICBmaXJzdExhYmVsV2lkdGggPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxXaWR0aChmaXJzdExhYmVsLCB0aGVtZSksXG4gICAgICAgICAgICBuZXdMYWJlbFdpZHRoID0gKGNhbGN1bGF0b3IuY2FsY3VsYXRlQWRqYWNlbnQoZGVncmVlLCBmaXJzdExhYmVsV2lkdGggLyAyKSArIGNhbGN1bGF0b3IuY2FsY3VsYXRlQWRqYWNlbnQoY2hhcnRDb25zdC5BTkdMRV85MCAtIGRlZ3JlZSwgbGFiZWxIZWlnaHQgLyAyKSkgKiAyLFxuICAgICAgICAgICAgZGlmZkxlZnQgPSBuZXdMYWJlbFdpZHRoIC0geUF4aXNXaWR0aDtcbiAgICAgICAgcmV0dXJuIGRpZmZMZWZ0O1xuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIFRvIGNhbGN1bGF0ZSBoZWlnaHQgb2YgeEF4aXMuXG4gICAgICogQHBhcmFtIHt7ZGVncmVlOiBudW1iZXIsIG1heExhYmVsV2lkdGg6IG51bWJlciwgbGFiZWxIZWlnaHQ6IG51bWJlcn19IHJvdGF0aW9uSW5mbyByb3RhdGlvbiBpbmZvXG4gICAgICogQHJldHVybnMge251bWJlcn0geEF4aXMgaGVpZ2h0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2FsY3VsYXRlWEF4aXNIZWlnaHQ6IGZ1bmN0aW9uKHJvdGF0aW9uSW5mbykge1xuICAgICAgICB2YXIgZGVncmVlID0gcm90YXRpb25JbmZvLmRlZ3JlZSxcbiAgICAgICAgICAgIG1heExhYmVsV2lkdGggPSByb3RhdGlvbkluZm8ubWF4TGFiZWxXaWR0aCxcbiAgICAgICAgICAgIGxhYmVsSGVpZ2h0ID0gcm90YXRpb25JbmZvLmxhYmVsSGVpZ2h0LFxuICAgICAgICAgICAgYXhpc0hlaWdodCA9IChjYWxjdWxhdG9yLmNhbGN1bGF0ZU9wcG9zaXRlKGRlZ3JlZSwgbWF4TGFiZWxXaWR0aCAvIDIpICsgY2FsY3VsYXRvci5jYWxjdWxhdGVPcHBvc2l0ZShjaGFydENvbnN0LkFOR0xFXzkwIC0gZGVncmVlLCBsYWJlbEhlaWdodCAvIDIpKSAqIDI7XG4gICAgICAgIHJldHVybiBheGlzSGVpZ2h0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBjYWxjdWxhdGUgaGVpZ2h0IGRpZmZlcmVuY2UgYmV0d2VlbiBvcmlnaW4gbGFiZWwgYW5kIHJvdGF0aW9uIGxhYmVsLlxuICAgICAqIEBwYXJhbSB7e2RlZ3JlZTogbnVtYmVyLCBtYXhMYWJlbFdpZHRoOiBudW1iZXIsIGxhYmVsSGVpZ2h0OiBudW1iZXJ9fSByb3RhdGlvbkluZm8gcm90YXRpb24gaW5mb1xuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IGhlaWdodCBkaWZmZXJlbmNlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2FsY3VsYXRlSGVpZ2h0RGlmZmVyZW5jZTogZnVuY3Rpb24ocm90YXRpb25JbmZvKSB7XG4gICAgICAgIHZhciB4QXhpc0hlaWdodCA9IHRoaXMuX2NhbGN1bGF0ZVhBeGlzSGVpZ2h0KHJvdGF0aW9uSW5mbyk7XG4gICAgICAgIHJldHVybiB4QXhpc0hlaWdodCAtIHJvdGF0aW9uSW5mby5sYWJlbEhlaWdodDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVXBkYXRlIGRlZ3JlZSBvZiByb3RhdGlvbkluZm8uXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHNlcmllc1dpZHRoIHNlcmllcyB3aWR0aFxuICAgICAqIEBwYXJhbSB7e2RlZ3JlZTogbnVtYmVyLCBtYXhMYWJlbFdpZHRoOiBudW1iZXIsIGxhYmVsSGVpZ2h0OiBudW1iZXJ9fSByb3RhdGlvbkluZm8gcm90YXRpb24gaW5mb1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBsYWJlbExlbmd0aCBsYWJlbExlbmd0aFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBvdmVyZmxvd0xlZnQgb3ZlcmZsb3cgbGVmdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3VwZGF0ZURlZ3JlZTogZnVuY3Rpb24oc2VyaWVzV2lkdGgsIHJvdGF0aW9uSW5mbywgbGFiZWxMZW5ndGgsIG92ZXJmbG93TGVmdCkge1xuICAgICAgICB2YXIgbGltaXRXaWR0aCwgbmV3RGVncmVlO1xuICAgICAgICBpZiAob3ZlcmZsb3dMZWZ0ID4gMCkge1xuICAgICAgICAgICAgbGltaXRXaWR0aCA9IHNlcmllc1dpZHRoIC8gbGFiZWxMZW5ndGggKyBjaGFydENvbnN0LlhBWElTX0xBQkVMX0dVVFRFUjtcbiAgICAgICAgICAgIG5ld0RlZ3JlZSA9IHRoaXMuX2ZpbmRSb3RhdGlvbkRlZ3JlZShsaW1pdFdpZHRoLCByb3RhdGlvbkluZm8ubWF4TGFiZWxXaWR0aCwgcm90YXRpb25JbmZvLmxhYmVsSGVpZ2h0KTtcbiAgICAgICAgICAgIHJvdGF0aW9uSW5mby5kZWdyZWUgPSBuZXdEZWdyZWU7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVXBkYXRlIHdpZHRoIG9mIGRpbWVudGlvcy5cbiAgICAgKiBAcGFyYW0ge3twbG90OiB7d2lkdGg6IG51bWJlcn0sIHNlcmllczoge3dpZHRoOiBudW1iZXJ9LCB4QXhpczoge3dpZHRoOiBudW1iZXJ9fX0gZGltZW5zaW9ucyBkaW1lbnNpb25zXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG92ZXJmbG93TGVmdCBvdmVyZmxvdyBsZWZ0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfdXBkYXRlRGltZW5zaW9uc1dpZHRoOiBmdW5jdGlvbihkaW1lbnNpb25zLCBvdmVyZmxvd0xlZnQpIHtcbiAgICAgICAgaWYgKG92ZXJmbG93TGVmdCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuY2hhcnRMZWZ0UGFkZGluZyArPSBvdmVyZmxvd0xlZnQ7XG4gICAgICAgICAgICBkaW1lbnNpb25zLnBsb3Qud2lkdGggLT0gb3ZlcmZsb3dMZWZ0O1xuICAgICAgICAgICAgZGltZW5zaW9ucy5zZXJpZXMud2lkdGggLT0gb3ZlcmZsb3dMZWZ0O1xuICAgICAgICAgICAgZGltZW5zaW9ucy54QXhpcy53aWR0aCAtPSBvdmVyZmxvd0xlZnQ7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVXBkYXRlIGhlaWdodCBvZiBkaW1lbnNpb25zLlxuICAgICAqIEBwYXJhbSB7e3Bsb3Q6IHtoZWlnaHQ6IG51bWJlcn0sIHNlcmllczoge2hlaWdodDogbnVtYmVyfSwgeEF4aXM6IHtoZWlnaHQ6IG51bWJlcn19fSBkaW1lbnNpb25zIGRpbWVuc2lvbnNcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZGlmZkhlaWdodCBkaWZmIGhlaWdodFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3VwZGF0ZURpbWVuc2lvbnNIZWlnaHQ6IGZ1bmN0aW9uKGRpbWVuc2lvbnMsIGRpZmZIZWlnaHQpIHtcbiAgICAgICAgZGltZW5zaW9ucy5wbG90LmhlaWdodCAtPSBkaWZmSGVpZ2h0O1xuICAgICAgICBkaW1lbnNpb25zLnNlcmllcy5oZWlnaHQgLT0gZGlmZkhlaWdodDtcbiAgICAgICAgZGltZW5zaW9ucy54QXhpcy5oZWlnaHQgKz0gZGlmZkhlaWdodDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVXBkYXRlIGRpbWVuc2lvbnMgYW5kIGRlZ3JlZS5cbiAgICAgKiBAcGFyYW0ge3twbG90OiB7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9LCBzZXJpZXM6IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn0sIHhBeGlzOiB7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fX0gZGltZW5zaW9ucyBkaW1lbnNpb25zXG4gICAgICogQHBhcmFtIHt7ZGVncmVlOiBudW1iZXIsIG1heExhYmVsV2lkdGg6IG51bWJlciwgbGFiZWxIZWlnaHQ6IG51bWJlcn19IHJvdGF0aW9uSW5mbyByb3RhdGlvbiBpbmZvXG4gICAgICogQHBhcmFtIHthcnJheX0gbGFiZWxzIGxhYmVsc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSB0aGVtZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3VwZGF0ZURpbWVuc2lvbnNBbmREZWdyZWU6IGZ1bmN0aW9uKGRpbWVuc2lvbnMsIHJvdGF0aW9uSW5mbywgbGFiZWxzLCB0aGVtZSkge1xuICAgICAgICB2YXIgb3ZlcmZsb3dMZWZ0LCBkaWZmSGVpZ2h0O1xuICAgICAgICBpZiAoIXJvdGF0aW9uSW5mbykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIG92ZXJmbG93TGVmdCA9IHRoaXMuX2NhbGN1bGF0ZU92ZXJmbG93TGVmdChkaW1lbnNpb25zLnlBeGlzLndpZHRoLCByb3RhdGlvbkluZm8sIGxhYmVsc1swXSwgdGhlbWUpO1xuICAgICAgICB0aGlzLl91cGRhdGVEaW1lbnNpb25zV2lkdGgoZGltZW5zaW9ucywgb3ZlcmZsb3dMZWZ0KTtcbiAgICAgICAgdGhpcy5fdXBkYXRlRGVncmVlKGRpbWVuc2lvbnMuc2VyaWVzLndpZHRoLCByb3RhdGlvbkluZm8sIGxhYmVscy5sZW5ndGgsIG92ZXJmbG93TGVmdCk7XG4gICAgICAgIGRpZmZIZWlnaHQgPSB0aGlzLl9jYWxjdWxhdGVIZWlnaHREaWZmZXJlbmNlKHJvdGF0aW9uSW5mbyk7XG4gICAgICAgIHRoaXMuX3VwZGF0ZURpbWVuc2lvbnNIZWlnaHQoZGltZW5zaW9ucywgZGlmZkhlaWdodCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYm91bmRzIGFib3V0IGNoYXJ0IGNvbXBvbmVudHMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpib3VuZHNNYWtlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5jb252ZXJ0ZWREYXRhIGNvbnZlcnRlZCBkYXRhXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIGNoYXJ0IHRoZW1lXG4gICAgICogICAgICBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5pc1ZlcnRpY2FsIHdoZXRoZXIgdmVydGljYWwgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgY2hhcnQgb3B0aW9uc1xuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuaGFzQXhlcyB3aGV0aGVyIGhhcyBheGVzIGFyZWEgb3Igbm90XG4gICAgICogICAgICBAcGFyYW0ge2FycmF5fSBwYXJhbXMub3B0aW9uQ2hhcnRUeXBlcyB5IGF4aXMgb3B0aW9uIGNoYXJ0IHR5cGVzXG4gICAgICogQHJldHVybnMge3tcbiAgICAgKiAgIHBsb3Q6IHtcbiAgICAgKiAgICAgZGltZW5zaW9uOiB7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9LFxuICAgICAqICAgICBwb3NpdGlvbjoge3RvcDogbnVtYmVyLCByaWdodDogbnVtYmVyfVxuICAgICAqICAgfSxcbiAgICAgKiAgIHlBeGlzOiB7XG4gICAgICogICAgIGRpbWVuc2lvbjoge3dpZHRoOiAobnVtYmVyKSwgaGVpZ2h0OiBudW1iZXJ9LFxuICAgICAqICAgICBwb3NpdGlvbjoge3RvcDogbnVtYmVyfVxuICAgICAqICAgfSxcbiAgICAgKiAgIHhBeGlzOiB7XG4gICAgICogICAgIGRpbWVuc2lvbjoge3dpZHRoOiBudW1iZXIsIGhlaWdodDogKG51bWJlcil9LFxuICAgICAqICAgICBwb3NpdGlvbjoge3JpZ2h0OiBudW1iZXJ9XG4gICAgICogICB9LFxuICAgICAqICAgc2VyaWVzOiB7XG4gICAgICogICAgIGRpbWVuc2lvbjoge3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfSxcbiAgICAgKiAgICAgcG9zaXRpb246IHt0b3A6IG51bWJlciwgcmlnaHQ6IG51bWJlcn1cbiAgICAgKiAgIH0sXG4gICAgICogICBsZWdlbmQ6IHtcbiAgICAgKiAgICAgcG9zaXRpb246IHt0b3A6IG51bWJlcn1cbiAgICAgKiAgIH0sXG4gICAgICogICB0b29sdGlwOiB7XG4gICAgICogICAgIGRpbWVuc2lvbjoge3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfSxcbiAgICAgKiAgICAgcG9zaXRpb246IHt0b3A6IG51bWJlciwgbGVmdDogbnVtYmVyfVxuICAgICAqICAgfVxuICAgICAqIH19IGJvdW5kc1xuICAgICAqL1xuICAgIG1ha2U6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgYXhlc0xhYmVsSW5mbyA9IHRoaXMuX21ha2VBeGVzTGFiZWxJbmZvKHBhcmFtcyksXG4gICAgICAgICAgICBkaW1lbnNpb25zID0gdGhpcy5fZ2V0Q29tcG9uZW50c0RpbWVuc2lvbnModHVpLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICBheGVzTGFiZWxJbmZvOiBheGVzTGFiZWxJbmZvXG4gICAgICAgICAgICB9LCBwYXJhbXMpKSxcbiAgICAgICAgICAgIHJvdGF0aW9uSW5mbywgdG9wLCBsZWZ0LCBzZXJpZXNCb3VuZCwgYXhlc0JvdW5kcywgYm91bmRzO1xuXG4gICAgICAgIHRoaXMuY2hhcnRMZWZ0UGFkZGluZyA9IGNoYXJ0Q29uc3QuQ0hBUlRfUEFERElORztcbiAgICAgICAgaWYgKHBhcmFtcy5oYXNBeGVzKSB7XG4gICAgICAgICAgICByb3RhdGlvbkluZm8gPSB0aGlzLl9tYWtlSG9yaXpvbnRhbExhYmVsUm90YXRpb25JbmZvKGRpbWVuc2lvbnMuc2VyaWVzLndpZHRoLCBheGVzTGFiZWxJbmZvLnhBeGlzLCBwYXJhbXMudGhlbWUubGFiZWwpO1xuICAgICAgICAgICAgdGhpcy5fdXBkYXRlRGltZW5zaW9uc0FuZERlZ3JlZShkaW1lbnNpb25zLCByb3RhdGlvbkluZm8sIGF4ZXNMYWJlbEluZm8ueEF4aXMsIHBhcmFtcy50aGVtZS5sYWJlbCk7XG4gICAgICAgIH1cblxuICAgICAgICB0b3AgPSBkaW1lbnNpb25zLnRpdGxlLmhlaWdodCArIGNoYXJ0Q29uc3QuQ0hBUlRfUEFERElORztcbiAgICAgICAgbGVmdCA9IGRpbWVuc2lvbnMueUF4aXMud2lkdGggKyB0aGlzLmNoYXJ0TGVmdFBhZGRpbmc7XG4gICAgICAgIHNlcmllc0JvdW5kID0gdGhpcy5fbWFrZUJhc2ljQm91bmQoZGltZW5zaW9ucy5zZXJpZXMsIHRvcCwgbGVmdCk7XG5cbiAgICAgICAgYXhlc0JvdW5kcyA9IHRoaXMuX21ha2VBeGVzQm91bmRzKHtcbiAgICAgICAgICAgIGhhc0F4ZXM6IHBhcmFtcy5oYXNBeGVzLFxuICAgICAgICAgICAgcm90YXRpb25JbmZvOiByb3RhdGlvbkluZm8sXG4gICAgICAgICAgICBvcHRpb25DaGFydFR5cGVzOiBwYXJhbXMub3B0aW9uQ2hhcnRUeXBlcyxcbiAgICAgICAgICAgIGRpbWVuc2lvbnM6IGRpbWVuc2lvbnMsXG4gICAgICAgICAgICB0b3A6IHRvcCxcbiAgICAgICAgICAgIGxlZnQ6IGxlZnRcbiAgICAgICAgfSk7XG4gICAgICAgIGJvdW5kcyA9IHR1aS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICBjaGFydDogdGhpcy5fbWFrZUNoYXJ0Qm91bmQoZGltZW5zaW9ucy5jaGFydCksXG4gICAgICAgICAgICBzZXJpZXM6IHNlcmllc0JvdW5kLFxuICAgICAgICAgICAgbGVnZW5kOiB0aGlzLl9tYWtlTGVnZW5kQm91bmQoZGltZW5zaW9ucyksXG4gICAgICAgICAgICB0b29sdGlwOiB0aGlzLl9tYWtlQmFzaWNCb3VuZChkaW1lbnNpb25zLnNlcmllcywgdG9wLCBsZWZ0IC0gY2hhcnRDb25zdC5TRVJJRVNfRVhQQU5EX1NJWkUpLFxuICAgICAgICAgICAgZXZlbnRIYW5kbGVMYXllcjogc2VyaWVzQm91bmRcbiAgICAgICAgfSwgYXhlc0JvdW5kcyk7XG4gICAgICAgIHJldHVybiBib3VuZHM7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBib3VuZHNNYWtlcjtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBjYWxjdWxhdG9yLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4uL2NvbnN0Jyk7XG5cbi8qKlxuICogQ2FsY3VsYXRvci5cbiAqIEBtb2R1bGUgY2FsY3VsYXRvclxuICovXG52YXIgY2FsY3VsYXRvciA9IHtcbiAgICAvKipcbiAgICAgKiBUbyBjYWxjdWxhdGUgc2NhbGUgZnJvbSBjaGFydCBtaW4sIG1heCBkYXRhLlxuICAgICAqICAtIGh0dHA6Ly9wZWx0aWVydGVjaC5jb20vaG93LWV4Y2VsLWNhbGN1bGF0ZXMtYXV0b21hdGljLWNoYXJ0LWF4aXMtbGltaXRzL1xuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Y2FsY3VsYXRvclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtaW4gbWluIG1pbmltdW0gdmFsdWUgb2YgdXNlciBkYXRhXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1heCBtYXggbWF4aW11bSB2YWx1ZSBvZiB1c2VyIGRhdGFcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdGlja0NvdW50IHRpY2sgY291bnRcbiAgICAgKiBAcmV0dXJucyB7e21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19IHNjYWxlIGF4aXMgc2NhbGVcbiAgICAgKi9cbiAgICBjYWxjdWxhdGVTY2FsZTogZnVuY3Rpb24obWluLCBtYXgpIHtcbiAgICAgICAgdmFyIHNhdmVNaW4gPSAwLFxuICAgICAgICAgICAgc2NhbGUgPSB7fSxcbiAgICAgICAgICAgIGlvZFZhbHVlOyAvLyBpbmNyZWFzZSBvciBkZWNyZWFzZSB2YWx1ZTtcblxuICAgICAgICBpZiAobWluIDwgMCkge1xuICAgICAgICAgICAgc2F2ZU1pbiA9IG1pbjtcbiAgICAgICAgICAgIG1heCAtPSBtaW47XG4gICAgICAgICAgICBtaW4gPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgaW9kVmFsdWUgPSAobWF4IC0gbWluKSAvIDIwO1xuICAgICAgICBzY2FsZS5tYXggPSBtYXggKyBpb2RWYWx1ZSArIHNhdmVNaW47XG5cbiAgICAgICAgaWYgKG1heCAvIDYgPiBtaW4pIHtcbiAgICAgICAgICAgIHNjYWxlLm1pbiA9IDAgKyBzYXZlTWluO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2NhbGUubWluID0gbWluIC0gaW9kVmFsdWUgKyBzYXZlTWluO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzY2FsZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbm9ybWFsaXplIG51bWJlci5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmNhbGN1bGF0b3JcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgdGFyZ2V0IHZhbHVlXG4gICAgICogQHJldHVybnMge251bWJlcn0gbm9ybWFsaXplZCBudW1iZXJcbiAgICAgKi9cbiAgICBub3JtYWxpemVBeGlzTnVtYmVyOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICB2YXIgc3RhbmRhcmQgPSAwLFxuICAgICAgICAgICAgZmxhZyA9IDEsXG4gICAgICAgICAgICBub3JtYWxpemVkLCBtb2Q7XG5cbiAgICAgICAgaWYgKHZhbHVlID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH0gZWxzZSBpZiAodmFsdWUgPCAwKSB7XG4gICAgICAgICAgICBmbGFnID0gLTE7XG4gICAgICAgIH1cblxuICAgICAgICB2YWx1ZSAqPSBmbGFnO1xuXG4gICAgICAgIHR1aS51dGlsLmZvckVhY2hBcnJheShjaGFydENvbnN0LkFYSVNfU1RBTkRBUkRfTVVMVElQTEVfTlVNUywgZnVuY3Rpb24obnVtKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgPCBudW0pIHtcbiAgICAgICAgICAgICAgICBpZiAobnVtID4gMSkge1xuICAgICAgICAgICAgICAgICAgICBzdGFuZGFyZCA9IG51bTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChudW0gPT09IDEwKSB7XG4gICAgICAgICAgICAgICAgc3RhbmRhcmQgPSAxMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHN0YW5kYXJkIDwgMSkge1xuICAgICAgICAgICAgbm9ybWFsaXplZCA9IHRoaXMubm9ybWFsaXplQXhpc051bWJlcih2YWx1ZSAqIDEwKSAqIDAuMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1vZCA9IHR1aS51dGlsLm1vZCh2YWx1ZSwgc3RhbmRhcmQpO1xuICAgICAgICAgICAgbm9ybWFsaXplZCA9IHR1aS51dGlsLmFkZGl0aW9uKHZhbHVlLCAobW9kID4gMCA/IHN0YW5kYXJkIC0gbW9kIDogMCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5vcm1hbGl6ZWQgKj0gZmxhZztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSB0aWNrIHBvc2l0aW9ucyBvZiBwaXhlbCB0eXBlLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Y2FsY3VsYXRvclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzaXplIGFyZWEgd2lkdGggb3IgaGVpZ2h0XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGNvdW50IHRpY2sgY291bnRcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPG51bWJlcj59IHBvc2l0aW9uc1xuICAgICAqL1xuICAgIG1ha2VUaWNrUGl4ZWxQb3NpdGlvbnM6IGZ1bmN0aW9uKHNpemUsIGNvdW50KSB7XG4gICAgICAgIHZhciBwb3NpdGlvbnMgPSBbXSxcbiAgICAgICAgICAgIHB4U2NhbGUsIHB4U3RlcDtcblxuICAgICAgICBpZiAoY291bnQgPiAwKSB7XG4gICAgICAgICAgICBweFNjYWxlID0ge21pbjogMCwgbWF4OiBzaXplIC0gMX07XG4gICAgICAgICAgICBweFN0ZXAgPSB0aGlzLmdldFNjYWxlU3RlcChweFNjYWxlLCBjb3VudCk7XG4gICAgICAgICAgICBwb3NpdGlvbnMgPSB0dWkudXRpbC5tYXAodHVpLnV0aWwucmFuZ2UoMCwgc2l6ZSwgcHhTdGVwKSwgZnVuY3Rpb24ocG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWF0aC5yb3VuZChwb3NpdGlvbik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHBvc2l0aW9uc1twb3NpdGlvbnMubGVuZ3RoIC0gMV0gPSBzaXplIC0gMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcG9zaXRpb25zO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGxhYmVscyBmcm9tIHNjYWxlLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Y2FsY3VsYXRvclxuICAgICAqIEBwYXJhbSB7e21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19IHNjYWxlIGF4aXMgc2NhbGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3RlcCBzdGVwIGJldHdlZW4gbWF4IGFuZCBtaW5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nW119IGxhYmVsc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgbWFrZUxhYmVsc0Zyb21TY2FsZTogZnVuY3Rpb24oc2NhbGUsIHN0ZXApIHtcbiAgICAgICAgdmFyIG11bHRpcGxlTnVtID0gdHVpLnV0aWwuZmluZE11bHRpcGxlTnVtKHN0ZXApLFxuICAgICAgICAgICAgbWluID0gc2NhbGUubWluICogbXVsdGlwbGVOdW0sXG4gICAgICAgICAgICBtYXggPSBzY2FsZS5tYXggKiBtdWx0aXBsZU51bSxcbiAgICAgICAgICAgIGxhYmVscyA9IHR1aS51dGlsLnJhbmdlKG1pbiwgbWF4ICsgMSwgc3RlcCAqIG11bHRpcGxlTnVtKTtcbiAgICAgICAgbGFiZWxzID0gdHVpLnV0aWwubWFwKGxhYmVscywgZnVuY3Rpb24obGFiZWwpIHtcbiAgICAgICAgICAgIHJldHVybiBsYWJlbCAvIG11bHRpcGxlTnVtO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGxhYmVscztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHNjYWxlIHN0ZXAuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpjYWxjdWxhdG9yXG4gICAgICogQHBhcmFtIHt7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX0gc2NhbGUgYXhpcyBzY2FsZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjb3VudCB2YWx1ZSBjb3VudFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IHNjYWxlIHN0ZXBcbiAgICAgKi9cbiAgICBnZXRTY2FsZVN0ZXA6IGZ1bmN0aW9uKHNjYWxlLCBjb3VudCkge1xuICAgICAgICByZXR1cm4gKHNjYWxlLm1heCAtIHNjYWxlLm1pbikgLyAoY291bnQgLSAxKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gY2FsY3VsYXRlIGFkamFjZW50LlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBkZWdyZWUgZGVncmVlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGh5cG90ZW51c2UgaHlwb3RlbnVzZVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IGFkamFjZW50XG4gICAgICpcbiAgICAgKiAgIEggOiBIeXBvdGVudXNlXG4gICAgICogICBBIDogQWRqYWNlbnRcbiAgICAgKiAgIE8gOiBPcHBvc2l0ZVxuICAgICAqICAgRCA6IERlZ3JlZVxuICAgICAqXG4gICAgICogICAgICAgIC98XG4gICAgICogICAgICAgLyB8XG4gICAgICogICAgSCAvICB8IE9cbiAgICAgKiAgICAgLyAgIHxcbiAgICAgKiAgICAvXFwgRCB8XG4gICAgICogICAgLS0tLS1cbiAgICAgKiAgICAgICBBXG4gICAgICovXG4gICAgY2FsY3VsYXRlQWRqYWNlbnQ6IGZ1bmN0aW9uKGRlZ3JlZSwgaHlwb3RlbnVzZSkge1xuICAgICAgICByZXR1cm4gTWF0aC5jb3MoZGVncmVlICogY2hhcnRDb25zdC5SQUQpICogaHlwb3RlbnVzZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gY2FsY3VsYXRlIG9wcG9zaXRlLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBkZWdyZWUgZGVncmVlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGh5cG90ZW51c2UgaHlwb3RlbnVzZVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IG9wcG9zaXRlXG4gICAgICovXG4gICAgY2FsY3VsYXRlT3Bwb3NpdGU6IGZ1bmN0aW9uKGRlZ3JlZSwgaHlwb3RlbnVzZSkge1xuICAgICAgICByZXR1cm4gTWF0aC5zaW4oZGVncmVlICogY2hhcnRDb25zdC5SQUQpICogaHlwb3RlbnVzZTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNhbGN1bGF0b3I7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgRGF0YSBjb252ZXJ0ZXIuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBjb25jYXQgPSBBcnJheS5wcm90b3R5cGUuY29uY2F0O1xuXG4vKipcbiAqIERhdGEgY29udmVydGVyLlxuICogQG1vZHVsZSBkYXRhQ29udmVydGVyXG4gKi9cbnZhciBkYXRhQ29udmVydGVyID0ge1xuICAgIC8qKlxuICAgICAqIENvbnZlcnQgdXNlciBkYXRhLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gdXNlckRhdGEgdXNlciBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGNoYXJ0T3B0aW9ucyBjaGFydCBvcHRpb25cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY2hhcnRUeXBlIGNoYXJ0IHR5cGVcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBzZXJpZXNDaGFydFR5cGVzIGNoYXJ0IHR5cGVzXG4gICAgICogQHJldHVybnMge3tcbiAgICAgKiAgICAgIGxhYmVsczogYXJyYXkuPHN0cmluZz4sXG4gICAgICogICAgICB2YWx1ZXM6IGFycmF5LjxudW1iZXI+LFxuICAgICAqICAgICAgbGVnZW5kTGFiZWxzOiBhcnJheS48c3RyaW5nPixcbiAgICAgKiAgICAgIGZvcm1hdEZ1bmN0aW9uczogYXJyYXkuPGZ1bmN0aW9uPixcbiAgICAgKiAgICAgIGZvcm1hdHRlZFZhbHVlczogYXJyYXkuPHN0cmluZz5cbiAgICAgKiB9fSBjb252ZXJ0ZWQgZGF0YVxuICAgICAqL1xuICAgIGNvbnZlcnQ6IGZ1bmN0aW9uKHVzZXJEYXRhLCBjaGFydE9wdGlvbnMsIGNoYXJ0VHlwZSwgc2VyaWVzQ2hhcnRUeXBlcykge1xuICAgICAgICB2YXIgbGFiZWxzID0gdXNlckRhdGEuY2F0ZWdvcmllcyxcbiAgICAgICAgICAgIHNlcmllc0RhdGEgPSB1c2VyRGF0YS5zZXJpZXMsXG4gICAgICAgICAgICB2YWx1ZXMgPSB0aGlzLl9waWNrVmFsdWVzKHNlcmllc0RhdGEpLFxuICAgICAgICAgICAgam9pblZhbHVlcyA9IHRoaXMuX2pvaW5WYWx1ZXModmFsdWVzLCBzZXJpZXNDaGFydFR5cGVzKSxcbiAgICAgICAgICAgIGxlZ2VuZExhYmVscyA9IHRoaXMuX3BpY2tMZWdlbmRMYWJlbHMoc2VyaWVzRGF0YSksXG4gICAgICAgICAgICBqb2luTGVnZW5kTGFiZWxzID0gdGhpcy5fam9pbkxlZ2VuZExhYmVscyhsZWdlbmRMYWJlbHMsIGNoYXJ0VHlwZSwgc2VyaWVzQ2hhcnRUeXBlcyksXG4gICAgICAgICAgICBmb3JtYXQgPSBjaGFydE9wdGlvbnMgJiYgY2hhcnRPcHRpb25zLmZvcm1hdCB8fCAnJyxcbiAgICAgICAgICAgIGZvcm1hdEZ1bmN0aW9ucyA9IHRoaXMuX2ZpbmRGb3JtYXRGdW5jdGlvbnMoZm9ybWF0KSxcbiAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlcyA9IGZvcm1hdCA/IHRoaXMuX2Zvcm1hdFZhbHVlcyh2YWx1ZXMsIGZvcm1hdEZ1bmN0aW9ucykgOiB2YWx1ZXMsXG4gICAgICAgICAgICBqb2luRm9ybWF0dGVkVmFsdWVzID0gdGhpcy5fam9pblZhbHVlcyhmb3JtYXR0ZWRWYWx1ZXMsIHNlcmllc0NoYXJ0VHlwZXMpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbGFiZWxzOiBsYWJlbHMsXG4gICAgICAgICAgICB2YWx1ZXM6IHZhbHVlcyxcbiAgICAgICAgICAgIGpvaW5WYWx1ZXM6IGpvaW5WYWx1ZXMsXG4gICAgICAgICAgICBsZWdlbmRMYWJlbHM6IGxlZ2VuZExhYmVscyxcbiAgICAgICAgICAgIGpvaW5MZWdlbmRMYWJlbHM6IGpvaW5MZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICBmb3JtYXRGdW5jdGlvbnM6IGZvcm1hdEZ1bmN0aW9ucyxcbiAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlczogZm9ybWF0dGVkVmFsdWVzLFxuICAgICAgICAgICAgam9pbkZvcm1hdHRlZFZhbHVlczogam9pbkZvcm1hdHRlZFZhbHVlc1xuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXBhcmF0ZSBsYWJlbC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheS48YXJyYXk+Pn0gdXNlckRhdGEgdXNlciBkYXRhXG4gICAgICogQHJldHVybnMge3tsYWJlbHM6IChhcnJheS48c3RyaW5nPiksIHNvdXJjZURhdGE6IGFycmF5LjxhcnJheS48YXJyYXk+Pn19IHJlc3VsdCBkYXRhXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2VwYXJhdGVMYWJlbDogZnVuY3Rpb24odXNlckRhdGEpIHtcbiAgICAgICAgdmFyIGxhYmVscyA9IHVzZXJEYXRhWzBdLnBvcCgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbGFiZWxzOiBsYWJlbHMsXG4gICAgICAgICAgICBzb3VyY2VEYXRhOiB1c2VyRGF0YVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBQaWNrIHZhbHVlLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7e25hbWU6IHN0cmluZywgZGF0YTogKGFycmF5LjxudW1iZXI+IHwgbnVtYmVyKX19IGl0ZW1zIGl0ZW1zXG4gICAgICogQHJldHVybnMge2FycmF5fSBwaWNrZWQgdmFsdWVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9waWNrVmFsdWU6IGZ1bmN0aW9uKGl0ZW1zKSB7XG4gICAgICAgIHJldHVybiB0dWkudXRpbC5tYXAoW10uY29uY2F0KGl0ZW1zLmRhdGEpLCBwYXJzZUZsb2F0KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUGljayB2YWx1ZXMgZnJvbSBheGlzIGRhdGEuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXk+fSBzZXJpZXNEYXRhIHNlcmllcyBkYXRhXG4gICAgICogQHJldHVybnMge3N0cmluZ1tdfSB2YWx1ZXNcbiAgICAgKi9cbiAgICBfcGlja1ZhbHVlczogZnVuY3Rpb24oc2VyaWVzRGF0YSkge1xuICAgICAgICB2YXIgdmFsdWVzLCByZXN1bHQ7XG4gICAgICAgIGlmICh0dWkudXRpbC5pc0FycmF5KHNlcmllc0RhdGEpKSB7XG4gICAgICAgICAgICB2YWx1ZXMgPSB0dWkudXRpbC5tYXAoc2VyaWVzRGF0YSwgdGhpcy5fcGlja1ZhbHVlLCB0aGlzKTtcbiAgICAgICAgICAgIHJlc3VsdCA9IHR1aS51dGlsLnBpdm90KHZhbHVlcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQgPSB7fTtcbiAgICAgICAgICAgIHR1aS51dGlsLmZvckVhY2goc2VyaWVzRGF0YSwgZnVuY3Rpb24oZ3JvdXBWYWx1ZXMsIHR5cGUpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZXMgPSB0dWkudXRpbC5tYXAoZ3JvdXBWYWx1ZXMsIHRoaXMuX3BpY2tWYWx1ZSwgdGhpcyk7XG4gICAgICAgICAgICAgICAgcmVzdWx0W3R5cGVdID0gdHVpLnV0aWwucGl2b3QodmFsdWVzKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEpvaW4gdmFsdWVzLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gZ3JvdXBWYWx1ZXMgdmFsdWVzXG4gICAgICogQHBhcmFtIHthcnJheS48c3RyaW5nPn0gc2VyaWVzQ2hhcnRUeXBlcyBjaGFydCB0eXBlc1xuICAgICAqIEByZXR1cm5zIHthcnJheS48bnVtYmVyPn0gam9pbiB2YWx1ZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9qb2luVmFsdWVzOiBmdW5jdGlvbihncm91cFZhbHVlcywgc2VyaWVzQ2hhcnRUeXBlcykge1xuICAgICAgICB2YXIgam9pblZhbHVlcztcblxuICAgICAgICBpZiAoIXNlcmllc0NoYXJ0VHlwZXMpIHtcbiAgICAgICAgICAgIHJldHVybiBncm91cFZhbHVlcztcbiAgICAgICAgfVxuXG4gICAgICAgIGpvaW5WYWx1ZXMgPSB0dWkudXRpbC5tYXAoZ3JvdXBWYWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlcztcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgam9pblZhbHVlcyA9IFtdO1xuICAgICAgICB0dWkudXRpbC5mb3JFYWNoQXJyYXkoc2VyaWVzQ2hhcnRUeXBlcywgZnVuY3Rpb24oX2NoYXJ0VHlwZSkge1xuICAgICAgICAgICAgdHVpLnV0aWwuZm9yRWFjaChncm91cFZhbHVlc1tfY2hhcnRUeXBlXSwgZnVuY3Rpb24odmFsdWVzLCBpbmRleCkge1xuICAgICAgICAgICAgICAgIGlmICgham9pblZhbHVlc1tpbmRleF0pIHtcbiAgICAgICAgICAgICAgICAgICAgam9pblZhbHVlc1tpbmRleF0gPSBbXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgam9pblZhbHVlc1tpbmRleF0gPSBqb2luVmFsdWVzW2luZGV4XS5jb25jYXQodmFsdWVzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gam9pblZhbHVlcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUGljayBsZWdlbmQgbGFiZWwuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGl0ZW0gaXRlbVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGxhYmVsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcGlja0xlZ2VuZExhYmVsOiBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIHJldHVybiBpdGVtLm5hbWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFBpY2sgbGVnZW5kIGxhYmVscyBmcm9tIGF4aXMgZGF0YS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheT59IHNlcmllc0RhdGEgc2VyaWVzIGRhdGFcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nW119IGxhYmVsc1xuICAgICAqL1xuICAgIF9waWNrTGVnZW5kTGFiZWxzOiBmdW5jdGlvbihzZXJpZXNEYXRhKSB7XG4gICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgIGlmICh0dWkudXRpbC5pc0FycmF5KHNlcmllc0RhdGEpKSB7XG4gICAgICAgICAgICByZXN1bHQgPSB0dWkudXRpbC5tYXAoc2VyaWVzRGF0YSwgdGhpcy5fcGlja0xlZ2VuZExhYmVsLCB0aGlzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHt9O1xuICAgICAgICAgICAgdHVpLnV0aWwuZm9yRWFjaChzZXJpZXNEYXRhLCBmdW5jdGlvbihncm91cFZhbHVlcywgdHlwZSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdFt0eXBlXSA9IHR1aS51dGlsLm1hcChncm91cFZhbHVlcywgdGhpcy5fcGlja0xlZ2VuZExhYmVsLCB0aGlzKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEpvaW4gbGVnZW5kIGxhYmVscy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge2FycmF5fSBsZWdlbmRMYWJlbHMgbGVnZW5kIGxhYmVsc1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjaGFydFR5cGUgY2hhcnQgdHlwZVxuICAgICAqIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IHNlcmllc0NoYXJ0VHlwZXMgY2hhcnQgdHlwZXNcbiAgICAgKiBAcmV0dXJucyB7YXJyYXl9IGxhYmVsc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2pvaW5MZWdlbmRMYWJlbHM6IGZ1bmN0aW9uKGxlZ2VuZExhYmVscywgY2hhcnRUeXBlLCBzZXJpZXNDaGFydFR5cGVzKSB7XG4gICAgICAgIHZhciBqb2luTGFiZWxzO1xuICAgICAgICBpZiAoIXNlcmllc0NoYXJ0VHlwZXMgfHwgIXNlcmllc0NoYXJ0VHlwZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBqb2luTGFiZWxzID0gdHVpLnV0aWwubWFwKGxlZ2VuZExhYmVscywgZnVuY3Rpb24obGFiZWwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBjaGFydFR5cGU6IGNoYXJ0VHlwZSxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGxhYmVsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgam9pbkxhYmVscyA9IFtdO1xuICAgICAgICAgICAgdHVpLnV0aWwuZm9yRWFjaEFycmF5KHNlcmllc0NoYXJ0VHlwZXMsIGZ1bmN0aW9uKF9jaGFydFR5cGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgbGFiZWxzID0gdHVpLnV0aWwubWFwKGxlZ2VuZExhYmVsc1tfY2hhcnRUeXBlXSwgZnVuY3Rpb24obGFiZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0VHlwZTogX2NoYXJ0VHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBsYWJlbFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGpvaW5MYWJlbHMgPSBqb2luTGFiZWxzLmNvbmNhdChsYWJlbHMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGpvaW5MYWJlbHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIGZvcm1hdCBncm91cCB2YWx1ZXMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXk+fSBncm91cFZhbHVlcyBncm91cCB2YWx1ZXNcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uW119IGZvcm1hdEZ1bmN0aW9ucyBmb3JtYXQgZnVuY3Rpb25zXG4gICAgICogQHJldHVybnMge3N0cmluZ1tdfSBmb3JtYXR0ZWQgdmFsdWVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZm9ybWF0R3JvdXBWYWx1ZXM6IGZ1bmN0aW9uKGdyb3VwVmFsdWVzLCBmb3JtYXRGdW5jdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIHR1aS51dGlsLm1hcChncm91cFZhbHVlcywgZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgICAgICByZXR1cm4gdHVpLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICB2YXIgZm5zID0gW3ZhbHVlXS5jb25jYXQoZm9ybWF0RnVuY3Rpb25zKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHVpLnV0aWwucmVkdWNlKGZucywgZnVuY3Rpb24oc3RvcmVkLCBmbikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZm4oc3RvcmVkKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gZm9ybWF0IGNvbnZlcnRlZCB2YWx1ZXMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkYXRhQ29udmVydGVyXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXk+fSBjaGFydFZhbHVlcyBjaGFydCB2YWx1ZXNcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uW119IGZvcm1hdEZ1bmN0aW9ucyBmb3JtYXQgZnVuY3Rpb25zXG4gICAgICogQHJldHVybnMge3N0cmluZ1tdfSBmb3JtYXR0ZWQgdmFsdWVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZm9ybWF0VmFsdWVzOiBmdW5jdGlvbihjaGFydFZhbHVlcywgZm9ybWF0RnVuY3Rpb25zKSB7XG4gICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgIGlmICh0dWkudXRpbC5pc0FycmF5KGNoYXJ0VmFsdWVzKSkge1xuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5fZm9ybWF0R3JvdXBWYWx1ZXMoY2hhcnRWYWx1ZXMsIGZvcm1hdEZ1bmN0aW9ucyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQgPSB7fTtcbiAgICAgICAgICAgIHR1aS51dGlsLmZvckVhY2goY2hhcnRWYWx1ZXMsIGZ1bmN0aW9uKGdyb3VwVmFsdWVzLCBjaGFydFR5cGUpIHtcbiAgICAgICAgICAgICAgICByZXN1bHRbY2hhcnRUeXBlXSA9IHRoaXMuX2Zvcm1hdEdyb3VwVmFsdWVzKGdyb3VwVmFsdWVzLCBmb3JtYXRGdW5jdGlvbnMpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUGljayBtYXggbGVuZ3RoIHVuZGVyIHBvaW50LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IHZhbHVlcyBjaGFydCB2YWx1ZXNcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBtYXggbGVuZ3RoIHVuZGVyIHBvaW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcGlja01heExlblVuZGVyUG9pbnQ6IGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICB2YXIgbWF4ID0gMDtcblxuICAgICAgICB0dWkudXRpbC5mb3JFYWNoQXJyYXkodmFsdWVzLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIGxlbiA9IHR1aS51dGlsLmxlbmd0aEFmdGVyUG9pbnQodmFsdWUpO1xuICAgICAgICAgICAgaWYgKGxlbiA+IG1heCkge1xuICAgICAgICAgICAgICAgIG1heCA9IGxlbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgcmV0dXJuIG1heDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB6ZXJvIGZpbGwgZm9ybWF0IG9yIG5vdC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZm9ybWF0IGZvcm1hdFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSByZXN1bHQgYm9vbGVhblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2lzWmVyb0ZpbGw6IGZ1bmN0aW9uKGZvcm1hdCkge1xuICAgICAgICByZXR1cm4gZm9ybWF0Lmxlbmd0aCA+IDIgJiYgZm9ybWF0LmNoYXJBdCgwKSA9PT0gJzAnO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIGRlY2ltYWwgZm9ybWF0IG9yIG5vdC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZm9ybWF0IGZvcm1hdFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSByZXN1bHQgYm9vbGVhblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2lzRGVjaW1hbDogZnVuY3Rpb24oZm9ybWF0KSB7XG4gICAgICAgIHZhciBpbmRleE9mID0gZm9ybWF0LmluZGV4T2YoJy4nKTtcbiAgICAgICAgcmV0dXJuIGluZGV4T2YgPiAtMSAmJiBpbmRleE9mIDwgZm9ybWF0Lmxlbmd0aCAtIDE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgY29tbWEgZm9ybWF0IG9yIG5vdC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZm9ybWF0IGZvcm1hdFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSByZXN1bHQgYm9vbGVhblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2lzQ29tbWE6IGZ1bmN0aW9uKGZvcm1hdCkge1xuICAgICAgICByZXR1cm4gZm9ybWF0LmluZGV4T2YoJywnKSA9PT0gZm9ybWF0LnNwbGl0KCcuJylbMF0ubGVuZ3RoIC0gNDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRm9ybWF0IHplcm8gZmlsbC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRhdGFDb252ZXJ0ZXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbGVuIGxlbmd0aCBvZiByZXN1bHRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWUgdGFyZ2V0IHZhbHVlXG4gICAgICogQHJldHVybnMge3N0cmluZ30gZm9ybWF0dGVkIHZhbHVlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZm9ybWF0WmVyb0ZpbGw6IGZ1bmN0aW9uKGxlbiwgdmFsdWUpIHtcbiAgICAgICAgdmFyIHplcm8gPSAnMCcsXG4gICAgICAgICAgICBpc01pbnVzID0gdmFsdWUgPCAwO1xuXG4gICAgICAgIHZhbHVlID0gTWF0aC5hYnModmFsdWUpICsgJyc7XG5cbiAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA+PSBsZW4pIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHdoaWxlICh2YWx1ZS5sZW5ndGggPCBsZW4pIHtcbiAgICAgICAgICAgIHZhbHVlID0gemVybyArIHZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChpc01pbnVzID8gJy0nIDogJycpICsgdmFsdWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZvcm1hdCBEZWNpbWFsLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBsZW4gbGVuZ3RoIG9mIHVuZGVyIGRlY2ltYWwgcG9pbnRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWUgdGFyZ2V0IHZhbHVlXG4gICAgICogQHJldHVybnMge3N0cmluZ30gZm9ybWF0dGVkIHZhbHVlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZm9ybWF0RGVjaW1hbDogZnVuY3Rpb24obGVuLCB2YWx1ZSkge1xuICAgICAgICB2YXIgcG93O1xuXG4gICAgICAgIGlmIChsZW4gPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLnJvdW5kKHZhbHVlLCAxMCk7XG4gICAgICAgIH1cblxuICAgICAgICBwb3cgPSBNYXRoLnBvdygxMCwgbGVuKTtcbiAgICAgICAgdmFsdWUgPSBNYXRoLnJvdW5kKHZhbHVlICogcG93KSAvIHBvdztcbiAgICAgICAgdmFsdWUgPSBwYXJzZUZsb2F0KHZhbHVlKS50b0ZpeGVkKGxlbik7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRm9ybWF0IENvbW1hLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSB0YXJnZXQgdmFsdWVcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBmb3JtYXR0ZWQgdmFsdWVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9mb3JtYXRDb21tYTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgdmFyIGNvbW1hID0gJywnLFxuICAgICAgICAgICAgdW5kZXJQb2ludFZhbHVlID0gJycsXG4gICAgICAgICAgICB2YWx1ZXMsIGxhc3RJbmRleDtcblxuICAgICAgICB2YWx1ZSArPSAnJztcblxuICAgICAgICBpZiAodmFsdWUuaW5kZXhPZignLicpID4gLTEpIHtcbiAgICAgICAgICAgIHZhbHVlcyA9IHZhbHVlLnNwbGl0KCcuJyk7XG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlc1swXTtcbiAgICAgICAgICAgIHVuZGVyUG9pbnRWYWx1ZSA9ICcuJyArIHZhbHVlc1sxXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh2YWx1ZS5sZW5ndGggPCA0KSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUgKyB1bmRlclBvaW50VmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICB2YWx1ZXMgPSAodmFsdWUpLnNwbGl0KCcnKS5yZXZlcnNlKCk7XG4gICAgICAgIGxhc3RJbmRleCA9IHZhbHVlcy5sZW5ndGggLSAxO1xuICAgICAgICB2YWx1ZXMgPSB0dWkudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbihjaGFyLCBpbmRleCkge1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IFtjaGFyXTtcbiAgICAgICAgICAgIGlmIChpbmRleCA8IGxhc3RJbmRleCAmJiAoaW5kZXggKyAxKSAlIDMgPT09IDApIHtcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChjb21tYSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gY29uY2F0LmFwcGx5KFtdLCB2YWx1ZXMpLnJldmVyc2UoKS5qb2luKCcnKSArIHVuZGVyUG9pbnRWYWx1ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmluZCBmb3JtYXQgZnVuY3Rpb25zLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZGF0YUNvbnZlcnRlclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmb3JtYXQgZm9ybWF0XG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gdmFsdWVzIGNoYXJ0IHZhbHVlc1xuICAgICAqIEByZXR1cm5zIHtmdW5jdGlvbltdfSBmdW5jdGlvbnNcbiAgICAgKi9cbiAgICBfZmluZEZvcm1hdEZ1bmN0aW9uczogZnVuY3Rpb24oZm9ybWF0KSB7XG4gICAgICAgIHZhciBmdW5jcyA9IFtdLFxuICAgICAgICAgICAgbGVuO1xuXG4gICAgICAgIGlmICghZm9ybWF0KSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5faXNEZWNpbWFsKGZvcm1hdCkpIHtcbiAgICAgICAgICAgIGxlbiA9IHRoaXMuX3BpY2tNYXhMZW5VbmRlclBvaW50KFtmb3JtYXRdKTtcbiAgICAgICAgICAgIGZ1bmNzID0gW3R1aS51dGlsLmJpbmQodGhpcy5fZm9ybWF0RGVjaW1hbCwgdGhpcywgbGVuKV07XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5faXNaZXJvRmlsbChmb3JtYXQpKSB7XG4gICAgICAgICAgICBsZW4gPSBmb3JtYXQubGVuZ3RoO1xuICAgICAgICAgICAgZnVuY3MgPSBbdHVpLnV0aWwuYmluZCh0aGlzLl9mb3JtYXRaZXJvRmlsbCwgdGhpcywgbGVuKV07XG4gICAgICAgICAgICByZXR1cm4gZnVuY3M7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5faXNDb21tYShmb3JtYXQpKSB7XG4gICAgICAgICAgICBmdW5jcy5wdXNoKHRoaXMuX2Zvcm1hdENvbW1hKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmdW5jcztcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRhdGFDb252ZXJ0ZXI7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgRE9NIEhhbmRsZXIuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogRE9NIEhhbmRsZXIuXG4gKiBAbW9kdWxlIGRvbUhhbmRsZXJcbiAqL1xudmFyIGRvbUhhbmRsZXIgPSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGVsZW1lbnQuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkb21IYW5kbGVyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRhZyBodG1sIHRhZ1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuZXdDbGFzcyBjbGFzcyBuYW1lXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSBjcmVhdGVkIGVsZW1lbnRcbiAgICAgKi9cbiAgICBjcmVhdGU6IGZ1bmN0aW9uKHRhZywgbmV3Q2xhc3MpIHtcbiAgICAgICAgdmFyIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcpO1xuXG4gICAgICAgIGlmIChuZXdDbGFzcykge1xuICAgICAgICAgICAgdGhpcy5hZGRDbGFzcyhlbCwgbmV3Q2xhc3MpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGVsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgY2xhc3MgbmFtZXMuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkb21IYW5kbGVyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyB7YXJyYXl9IG5hbWVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0Q2xhc3NOYW1lczogZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgdmFyIGNsYXNzTmFtZSA9IGVsLmNsYXNzTmFtZSB8fCAnJyxcbiAgICAgICAgICAgIGNsYXNzTmFtZXMgPSBjbGFzc05hbWUgPyBjbGFzc05hbWUuc3BsaXQoJyAnKSA6IFtdO1xuICAgICAgICByZXR1cm4gY2xhc3NOYW1lcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIGNzcyBjbGFzcyB0byB0YXJnZXQgZWxlbWVudC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRvbUhhbmRsZXJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuZXdDbGFzcyBhZGQgY2xhc3MgbmFtZVxuICAgICAqL1xuICAgIGFkZENsYXNzOiBmdW5jdGlvbihlbCwgbmV3Q2xhc3MpIHtcbiAgICAgICAgdmFyIGNsYXNzTmFtZXMgPSB0aGlzLl9nZXRDbGFzc05hbWVzKGVsKSxcbiAgICAgICAgICAgIGluZGV4ID0gdHVpLnV0aWwuaW5BcnJheShuZXdDbGFzcywgY2xhc3NOYW1lcyk7XG5cbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNsYXNzTmFtZXMucHVzaChuZXdDbGFzcyk7XG4gICAgICAgIGVsLmNsYXNzTmFtZSA9IGNsYXNzTmFtZXMuam9pbignICcpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgY3NzIGNsYXNzIGZyb20gdGFyZ2V0IGVsZW1lbnQuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkb21IYW5kbGVyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcm1DbGFzcyByZW1vdmUgY2xhc3MgbmFtZVxuICAgICAqL1xuICAgIHJlbW92ZUNsYXNzOiBmdW5jdGlvbihlbCwgcm1DbGFzcykge1xuICAgICAgICB2YXIgY2xhc3NOYW1lcyA9IHRoaXMuX2dldENsYXNzTmFtZXMoZWwpLFxuICAgICAgICAgICAgaW5kZXggPSB0dWkudXRpbC5pbkFycmF5KHJtQ2xhc3MsIGNsYXNzTmFtZXMpO1xuXG4gICAgICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNsYXNzTmFtZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgZWwuY2xhc3NOYW1lID0gY2xhc3NOYW1lcy5qb2luKCcgJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgY2xhc3MgZXhpc3Qgb3Igbm90LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZG9tSGFuZGxlclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZpbmRDbGFzcyB0YXJnZXQgY3NzIGNsYXNzXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IGhhcyBjbGFzc1xuICAgICAqL1xuICAgIGhhc0NsYXNzOiBmdW5jdGlvbihlbCwgZmluZENsYXNzKSB7XG4gICAgICAgIHZhciBjbGFzc05hbWVzID0gdGhpcy5fZ2V0Q2xhc3NOYW1lcyhlbCksXG4gICAgICAgICAgICBpbmRleCA9IHR1aS51dGlsLmluQXJyYXkoZmluZENsYXNzLCBjbGFzc05hbWVzKTtcbiAgICAgICAgcmV0dXJuIGluZGV4ID4gLTE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZpbmQgcGFyZW50IGJ5IGNsYXNzIG5hbWUuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpkb21IYW5kbGVyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY2xhc3NOYW1lIHRhcmdldCBjc3MgY2xhc3NcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbGFzdENsYXNzIGxhc3QgY3NzIGNsYXNzXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSByZXN1bHQgZWxlbWVudFxuICAgICAqL1xuICAgIGZpbmRQYXJlbnRCeUNsYXNzOiBmdW5jdGlvbihlbCwgY2xhc3NOYW1lLCBsYXN0Q2xhc3MpIHtcbiAgICAgICAgdmFyIHBhcmVudCA9IGVsLnBhcmVudE5vZGU7XG4gICAgICAgIGlmICghcGFyZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmhhc0NsYXNzKHBhcmVudCwgY2xhc3NOYW1lKSkge1xuICAgICAgICAgICAgcmV0dXJuIHBhcmVudDtcbiAgICAgICAgfSBlbHNlIGlmIChwYXJlbnQubm9kZU5hbWUgPT09ICdCT0RZJyB8fCB0aGlzLmhhc0NsYXNzKHBhcmVudCwgbGFzdENsYXNzKSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5maW5kUGFyZW50QnlDbGFzcyhwYXJlbnQsIGNsYXNzTmFtZSwgbGFzdENsYXNzKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBcHBlbmQgY2hpbGQgZWxlbWVudC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmRvbUhhbmRsZXJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY29udGFpbmVyIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjaGlsZHJlbiBjaGlsZCBlbGVtZW50XG4gICAgICovXG4gICAgYXBwZW5kOiBmdW5jdGlvbihjb250YWluZXIsIGNoaWxkcmVuKSB7XG4gICAgICAgIGlmICghY29udGFpbmVyIHx8ICFjaGlsZHJlbikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNoaWxkcmVuID0gdHVpLnV0aWwuaXNBcnJheShjaGlsZHJlbikgPyBjaGlsZHJlbiA6IFtjaGlsZHJlbl07XG5cbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaEFycmF5KGNoaWxkcmVuLCBmdW5jdGlvbihjaGlsZCkge1xuICAgICAgICAgICAgaWYgKCFjaGlsZCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChjaGlsZCk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZG9tSGFuZGxlcjtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBFdmVudCBsaXN0ZW5lci5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBFdmVudCBsaXN0ZW5lci5cbiAqIEBtb2R1bGUgZXZlbnRMaXN0ZW5lclxuICovXG52YXIgZXZlbnRMaXN0ZW5lciA9IHtcbiAgICAvKipcbiAgICAgKiBFdmVudCBsaXN0ZW5lciBmb3IgSUUuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpldmVudExpc3RlbmVyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZSBldmVudCBuYW1lXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayBjYWxsYmFjayBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2F0dGFjaEV2ZW50OiBmdW5jdGlvbiAoZXZlbnROYW1lLCBlbCwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PSBcIm9iamVjdFwiICYmIGNhbGxiYWNrLmhhbmRsZUV2ZW50KSB7XG4gICAgICAgICAgICBlbC5hdHRhY2hFdmVudChcIm9uXCIgKyBldmVudE5hbWUsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjay5oYW5kbGVFdmVudC5jYWxsKGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZWwuYXR0YWNoRXZlbnQoXCJvblwiICsgZXZlbnROYW1lLCBjYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXZlbnQgbGlzdGVuZXIgZm9yIG90aGVyIGJyb3dzZXJzLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZXZlbnRMaXN0ZW5lclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudE5hbWUgZXZlbnQgbmFtZVxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hZGRFdmVudExpc3RlbmVyOiBmdW5jdGlvbiAoZXZlbnROYW1lLCBlbCwgY2FsbGJhY2spIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBjYWxsYmFjayk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT0gXCJvYmplY3RcIiAmJiBjYWxsYmFjay5oYW5kbGVFdmVudCkge1xuICAgICAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suaGFuZGxlRXZlbnQuY2FsbChjYWxsYmFjaywgZXZlbnQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBCaW5kIGV2ZW50IGZ1bmN0aW9uLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6ZXZlbnRMaXN0ZW5lclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudE5hbWUgZXZlbnQgbmFtZVxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgKi9cbiAgICBiaW5kRXZlbnQ6IGZ1bmN0aW9uIChldmVudE5hbWUsIGVsLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgYmluZEV2ZW50O1xuICAgICAgICBpZiAoXCJhZGRFdmVudExpc3RlbmVyXCIgaW4gZWwpIHtcbiAgICAgICAgICAgIGJpbmRFdmVudCA9IHRoaXMuX2FkZEV2ZW50TGlzdGVuZXI7XG4gICAgICAgIH0gZWxzZSBpZiAoXCJhdHRhY2hFdmVudFwiIGluIGVsKSB7XG4gICAgICAgICAgICBiaW5kRXZlbnQgPSB0aGlzLl9hdHRhY2hFdmVudDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmJpbmRFdmVudCA9IGJpbmRFdmVudDtcbiAgICAgICAgYmluZEV2ZW50KGV2ZW50TmFtZSwgZWwsIGNhbGxiYWNrKTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV2ZW50TGlzdGVuZXI7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgVXRpbCBmb3IgcmVuZGVyaW5nLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZG9tID0gcmVxdWlyZSgnLi9kb21IYW5kbGVyJyksXG4gICAgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4vLi4vY29uc3QnKTtcblxudmFyIGJyb3dzZXIgPSB0dWkudXRpbC5icm93c2VyLFxuICAgIGlzSUU4ID0gYnJvd3Nlci5tc2llICYmIGJyb3dzZXIudmVyc2lvbiA9PT0gODtcblxuLyoqXG4gKiBVdGlsIGZvciByZW5kZXJpbmcuXG4gKiBAbW9kdWxlIHJlbmRlclV0aWxcbiAqL1xudmFyIHJlbmRlclV0aWwgPSB7XG4gICAgLyoqXG4gICAgICogQ29uY2F0IHN0cmluZy5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOnJlbmRlclV0aWxcbiAgICAgKiBAcGFyYW1zIHsuLi5zdHJpbmd9IHRhcmdldCBzdHJpbmdzXG4gICAgICogQHJldHVybnMge3N0cmluZ30gY29uY2F0IHN0cmluZ1xuICAgICAqL1xuICAgIGNvbmNhdFN0cjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBTdHJpbmcucHJvdG90eXBlLmNvbmNhdC5hcHBseSgnJywgYXJndW1lbnRzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBjc3NUZXh0IGZvciBmb250LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6cmVuZGVyVXRpbFxuICAgICAqIEBwYXJhbSB7e2ZvbnRTaXplOiBudW1iZXIsIGZvbnRGYW1pbHk6IHN0cmluZywgY29sb3I6IHN0cmluZ319IHRoZW1lIGZvbnQgdGhlbWVcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBjc3NUZXh0XG4gICAgICovXG4gICAgbWFrZUZvbnRDc3NUZXh0OiBmdW5jdGlvbih0aGVtZSkge1xuICAgICAgICB2YXIgY3NzVGV4dHMgPSBbXTtcblxuICAgICAgICBpZiAoIXRoZW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhlbWUuZm9udFNpemUpIHtcbiAgICAgICAgICAgIGNzc1RleHRzLnB1c2godGhpcy5jb25jYXRTdHIoJ2ZvbnQtc2l6ZTonLCB0aGVtZS5mb250U2l6ZSwgJ3B4JykpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoZW1lLmZvbnRGYW1pbHkpIHtcbiAgICAgICAgICAgIGNzc1RleHRzLnB1c2godGhpcy5jb25jYXRTdHIoJ2ZvbnQtZmFtaWx5OicsIHRoZW1lLmZvbnRGYW1pbHkpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGVtZS5jb2xvcikge1xuICAgICAgICAgICAgY3NzVGV4dHMucHVzaCh0aGlzLmNvbmNhdFN0cignY29sb3I6JywgdGhlbWUuY29sb3IpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjc3NUZXh0cy5qb2luKCc7Jyk7XG4gICAgfSxcblxuICAgIGNoZWNrRWw6IG51bGwsXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGVsZW1lbnQgZm9yIHNpemUgY2hlY2suXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpyZW5kZXJVdGlsXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY3JlYXRlU2l6ZUNoZWNrRWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZWxEaXYsIGVsU3BhbjtcbiAgICAgICAgaWYgKHRoaXMuY2hlY2tFbCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2tFbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGVsRGl2ID0gZG9tLmNyZWF0ZSgnRElWJywgJ3R1aS1jaGFydC1zaXplLWNoZWNrLWVsZW1lbnQnKTtcbiAgICAgICAgZWxTcGFuID0gZG9tLmNyZWF0ZSgnU1BBTicpO1xuXG4gICAgICAgIGVsRGl2LmFwcGVuZENoaWxkKGVsU3Bhbik7XG4gICAgICAgIHRoaXMuY2hlY2tFbCA9IGVsRGl2O1xuICAgICAgICByZXR1cm4gZWxEaXY7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCByZW5kZXJlZCBsYWJlbCBzaXplICh3aWR0aCBvciBoZWlnaHQpLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6cmVuZGVyVXRpbFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBsYWJlbCBsYWJlbFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGVtZSB0aGVtZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBvZmZzZXRUeXBlIG9mZnNldCB0eXBlIChvZmZzZXRXaWR0aCBvciBvZmZzZXRIZWlnaHQpXG4gICAgICogQHJldHVybnMge251bWJlcn0gc2l6ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFJlbmRlcmVkTGFiZWxTaXplOiBmdW5jdGlvbihsYWJlbCwgdGhlbWUsIG9mZnNldFR5cGUpIHtcbiAgICAgICAgdmFyIGVsRGl2LCBlbFNwYW4sIGxhYmVsU2l6ZTtcblxuICAgICAgICBpZiAodHVpLnV0aWwuaXNVbmRlZmluZWQobGFiZWwpIHx8IGxhYmVsID09PSAnJykge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cblxuICAgICAgICBlbERpdiA9IHRoaXMuX2NyZWF0ZVNpemVDaGVja0VsKCk7XG4gICAgICAgIGVsU3BhbiA9IGVsRGl2LmZpcnN0Q2hpbGQ7XG5cbiAgICAgICAgdGhlbWUgPSB0aGVtZSB8fCB7fTtcbiAgICAgICAgZWxTcGFuLmlubmVySFRNTCA9IGxhYmVsO1xuICAgICAgICBlbFNwYW4uc3R5bGUuZm9udFNpemUgPSAodGhlbWUuZm9udFNpemUgfHwgY2hhcnRDb25zdC5ERUZBVUxUX0xBQkVMX0ZPTlRfU0laRSkgKyAncHgnO1xuXG4gICAgICAgIGlmICh0aGVtZS5mb250RmFtaWx5KSB7XG4gICAgICAgICAgICBlbFNwYW4uc3R5bGUucGFkZGluZyA9IDA7XG4gICAgICAgICAgICBlbFNwYW4uc3R5bGUuZm9udEZhbWlseSA9IHRoZW1lLmZvbnRGYW1pbHk7XG4gICAgICAgIH1cblxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGVsRGl2KTtcbiAgICAgICAgbGFiZWxTaXplID0gZWxTcGFuW29mZnNldFR5cGVdO1xuICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGVsRGl2KTtcbiAgICAgICAgcmV0dXJuIGxhYmVsU2l6ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHJlbmRlcmVkIGxhYmVsIHdpZHRoLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6cmVuZGVyVXRpbFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBsYWJlbCBsYWJlbFxuICAgICAqIEBwYXJhbSB7e2ZvbnRTaXplOiBudW1iZXIsIGZvbnRGYW1pbHk6IHN0cmluZywgY29sb3I6IHN0cmluZ319IHRoZW1lIGxhYmVsIHRoZW1lXG4gICAgICogQHJldHVybnMge251bWJlcn0gd2lkdGhcbiAgICAgKi9cbiAgICBnZXRSZW5kZXJlZExhYmVsV2lkdGg6IGZ1bmN0aW9uKGxhYmVsLCB0aGVtZSkge1xuICAgICAgICB2YXIgbGFiZWxXaWR0aCA9IHRoaXMuX2dldFJlbmRlcmVkTGFiZWxTaXplKGxhYmVsLCB0aGVtZSwgJ29mZnNldFdpZHRoJyk7XG4gICAgICAgIHJldHVybiBsYWJlbFdpZHRoO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgcmVuZGVyZWQgbGFiZWwgaGVpZ2h0LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6cmVuZGVyVXRpbFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBsYWJlbCBsYWJlbFxuICAgICAqIEBwYXJhbSB7e2ZvbnRTaXplOiBudW1iZXIsIGZvbnRGYW1pbHk6IHN0cmluZywgY29sb3I6IHN0cmluZ319IHRoZW1lIGxhYmVsIHRoZW1lXG4gICAgICogQHJldHVybnMge251bWJlcn0gaGVpZ2h0XG4gICAgICovXG4gICAgZ2V0UmVuZGVyZWRMYWJlbEhlaWdodDogZnVuY3Rpb24obGFiZWwsIHRoZW1lKSB7XG4gICAgICAgIHZhciBsYWJlbEhlaWdodCA9IHRoaXMuX2dldFJlbmRlcmVkTGFiZWxTaXplKGxhYmVsLCB0aGVtZSwgJ29mZnNldEhlaWdodCcpO1xuICAgICAgICByZXR1cm4gbGFiZWxIZWlnaHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBSZW5kZXJlZCBMYWJlbHMgTWF4IFNpemUod2lkdGggb3IgaGVpZ2h0KS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmJvdW5kc01ha2VyXG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gbGFiZWxzIGxhYmVsc1xuICAgICAqIEBwYXJhbSB7e2ZvbnRTaXplOiBudW1iZXIsIGZvbnRGYW1pbHk6IHN0cmluZywgY29sb3I6IHN0cmluZ319IHRoZW1lIGxhYmVsIHRoZW1lXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gaXRlcmF0ZWUgaXRlcmF0ZWVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBtYXggc2l6ZSAod2lkdGggb3IgaGVpZ2h0KVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFJlbmRlcmVkTGFiZWxzTWF4U2l6ZTogZnVuY3Rpb24obGFiZWxzLCB0aGVtZSwgaXRlcmF0ZWUpIHtcbiAgICAgICAgdmFyIHNpemVzID0gdHVpLnV0aWwubWFwKGxhYmVscywgZnVuY3Rpb24obGFiZWwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaXRlcmF0ZWUobGFiZWwsIHRoZW1lKTtcbiAgICAgICAgICAgIH0sIHRoaXMpLFxuICAgICAgICAgICAgbWF4U2l6ZSA9IHR1aS51dGlsLm1heChzaXplcyk7XG4gICAgICAgIHJldHVybiBtYXhTaXplO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgcmVuZGVyZWQgbGFiZWxzIG1heCB3aWR0aC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmJvdW5kc01ha2VyXG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gbGFiZWxzIGxhYmVsc1xuICAgICAqIEBwYXJhbSB7e2ZvbnRTaXplOiBudW1iZXIsIGZvbnRGYW1pbHk6IHN0cmluZywgY29sb3I6IHN0cmluZ319IHRoZW1lIGxhYmVsIHRoZW1lXG4gICAgICogQHJldHVybnMge251bWJlcn0gbWF4IHdpZHRoXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBnZXRSZW5kZXJlZExhYmVsc01heFdpZHRoOiBmdW5jdGlvbihsYWJlbHMsIHRoZW1lKSB7XG4gICAgICAgIHZhciBpdGVyYXRlZSA9IHR1aS51dGlsLmJpbmQodGhpcy5nZXRSZW5kZXJlZExhYmVsV2lkdGgsIHRoaXMpLFxuICAgICAgICAgICAgbWF4V2lkdGggPSB0aGlzLl9nZXRSZW5kZXJlZExhYmVsc01heFNpemUobGFiZWxzLCB0aGVtZSwgaXRlcmF0ZWUpO1xuICAgICAgICByZXR1cm4gbWF4V2lkdGg7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCByZW5kZXJlZCBsYWJlbHMgbWF4IGhlaWdodC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOmJvdW5kc01ha2VyXG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gbGFiZWxzIGxhYmVsc1xuICAgICAqIEBwYXJhbSB7e2ZvbnRTaXplOiBudW1iZXIsIGZvbnRGYW1pbHk6IHN0cmluZywgY29sb3I6IHN0cmluZ319IHRoZW1lIGxhYmVsIHRoZW1lXG4gICAgICogQHJldHVybnMge251bWJlcn0gbWF4IGhlaWdodFxuICAgICAqL1xuICAgIGdldFJlbmRlcmVkTGFiZWxzTWF4SGVpZ2h0OiBmdW5jdGlvbihsYWJlbHMsIHRoZW1lKSB7XG4gICAgICAgIHZhciBpdGVyYXRlZSA9IHR1aS51dGlsLmJpbmQodGhpcy5nZXRSZW5kZXJlZExhYmVsSGVpZ2h0LCB0aGlzKSxcbiAgICAgICAgICAgIG1heEhlaWdodCA9IHRoaXMuX2dldFJlbmRlcmVkTGFiZWxzTWF4U2l6ZShsYWJlbHMsIHRoZW1lLCBpdGVyYXRlZSk7XG4gICAgICAgIHJldHVybiBtYXhIZWlnaHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBkaW1lbnNpb24uXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpyZW5kZXJVdGlsXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGRpbWVuc2lvbiBkaW1lbnNpb25cbiAgICAgKi9cbiAgICByZW5kZXJEaW1lbnNpb246IGZ1bmN0aW9uKGVsLCBkaW1lbnNpb24pIHtcbiAgICAgICAgZWwuc3R5bGUuY3NzVGV4dCA9IFtcbiAgICAgICAgICAgIHRoaXMuY29uY2F0U3RyKCd3aWR0aDonLCBkaW1lbnNpb24ud2lkdGgsICdweCcpLFxuICAgICAgICAgICAgdGhpcy5jb25jYXRTdHIoJ2hlaWdodDonLCBkaW1lbnNpb24uaGVpZ2h0LCAncHgnKVxuICAgICAgICBdLmpvaW4oJzsnKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIHBvc2l0aW9uKHRvcCwgcmlnaHQpLlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6cmVuZGVyVXRpbFxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICogQHBhcmFtIHt7dG9wOiBudW1iZXIsIGxlZnQ6IG51bWJlciwgcmlnaHQ6IG51bWJlcn19IHBvc2l0aW9uIHBvc2l0aW9uXG4gICAgICovXG4gICAgcmVuZGVyUG9zaXRpb246IGZ1bmN0aW9uKGVsLCBwb3NpdGlvbikge1xuICAgICAgICBpZiAodHVpLnV0aWwuaXNVbmRlZmluZWQocG9zaXRpb24pKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocG9zaXRpb24udG9wKSB7XG4gICAgICAgICAgICBlbC5zdHlsZS50b3AgPSBwb3NpdGlvbi50b3AgKyAncHgnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBvc2l0aW9uLmxlZnQpIHtcbiAgICAgICAgICAgIGVsLnN0eWxlLmxlZnQgPSBwb3NpdGlvbi5sZWZ0ICsgJ3B4JztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwb3NpdGlvbi5yaWdodCkge1xuICAgICAgICAgICAgZWwuc3R5bGUucmlnaHQgPSBwb3NpdGlvbi5yaWdodCArICdweCc7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGJhY2tncm91bmQuXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpyZW5kZXJVdGlsXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gYmFja2dyb3VuZCBiYWNrZ3JvdW5kIG9wdGlvblxuICAgICAqL1xuICAgIHJlbmRlckJhY2tncm91bmQ6IGZ1bmN0aW9uKGVsLCBiYWNrZ3JvdW5kKSB7XG4gICAgICAgIGlmICghYmFja2dyb3VuZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZWwuc3R5bGUuYmFja2dyb3VuZCA9IGJhY2tncm91bmQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBmb250IGZhbWlseS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOnJlbmRlclV0aWxcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCB0YXJnZXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmb250RmFtaWx5IGZvbnQgZmFtaWx5IG9wdGlvblxuICAgICAqL1xuICAgIHJlbmRlckZvbnRGYW1pbHk6IGZ1bmN0aW9uKGVsLCBmb250RmFtaWx5KSB7XG4gICAgICAgIGlmICghZm9udEZhbWlseSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZWwuc3R5bGUuZm9udEZhbWlseSA9IGZvbnRGYW1pbHk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciB0aXRsZS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOnJlbmRlclV0aWxcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGl0bGUgdGl0bGVcbiAgICAgKiBAcGFyYW0ge3tmb250U2l6ZTogbnVtYmVyLCBjb2xvcjogc3RyaW5nLCBiYWNrZ3JvdW5kOiBzdHJpbmd9fSB0aGVtZSB0aXRsZSB0aGVtZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjbGFzc05hbWUgY3NzIGNsYXNzIG5hbWVcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHRpdGxlIGVsZW1lbnRcbiAgICAgKi9cbiAgICByZW5kZXJUaXRsZTogZnVuY3Rpb24odGl0bGUsIHRoZW1lLCBjbGFzc05hbWUpIHtcbiAgICAgICAgdmFyIGVsVGl0bGUsIGNzc1RleHQ7XG5cbiAgICAgICAgaWYgKCF0aXRsZSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBlbFRpdGxlID0gZG9tLmNyZWF0ZSgnRElWJywgY2xhc3NOYW1lKTtcbiAgICAgICAgZWxUaXRsZS5pbm5lckhUTUwgPSB0aXRsZTtcblxuICAgICAgICBjc3NUZXh0ID0gcmVuZGVyVXRpbC5tYWtlRm9udENzc1RleHQodGhlbWUpO1xuXG4gICAgICAgIGlmICh0aGVtZS5iYWNrZ3JvdW5kKSB7XG4gICAgICAgICAgICBjc3NUZXh0ICs9ICc7JyArIHRoaXMuY29uY2F0U3RyKCdiYWNrZ3JvdW5kOicsIHRoZW1lLmJhY2tncm91bmQpO1xuICAgICAgICB9XG5cbiAgICAgICAgZWxUaXRsZS5zdHlsZS5jc3NUZXh0ID0gY3NzVGV4dDtcblxuICAgICAgICByZXR1cm4gZWxUaXRsZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciBJRTggb3Igbm90LlxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6cmVuZGVyVXRpbFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSByZXN1bHQgYm9vbGVhblxuICAgICAqL1xuICAgIGlzSUU4OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGlzSUU4O1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gcmVuZGVyVXRpbDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBjaGFydCBzdGF0ZS5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuLi9jb25zdCcpO1xuXG4vKipcbiAqIHN0YXRlLlxuICogQG1vZHVsZSBzdGF0ZVxuICovXG52YXIgc3RhdGUgPSB7XG4gICAgLyoqXG4gICAgICogV2hldGhlciBsaW5lIHR5cGUgY2hhcnQgb3Igbm90LlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjaGFydFR5cGUgY2hhcnQgdHlwZVxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSByZXN1bHQgYm9vbGVhblxuICAgICAqL1xuICAgIGlzTGluZVR5cGVDaGFydDogZnVuY3Rpb24oY2hhcnRUeXBlKSB7XG4gICAgICAgIHJldHVybiBjaGFydFR5cGUgPT09IGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9MSU5FIHx8IGNoYXJ0VHlwZSA9PT0gY2hhcnRDb25zdC5DSEFSVF9UWVBFX0FSRUE7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBzdGF0ZTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBUaGlzIGlzIHRlbXBsYXRlIG1ha2VyLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAvKipcbiAgICAgKiBUaGlzIGlzIHRlbXBsYXRlIG1ha2VyLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBodG1sIGh0bWxcbiAgICAgKiBAcmV0dXJucyB7ZnVuY3Rpb259IHRlbXBsYXRlIGZ1bmN0aW9uXG4gICAgICogQGVheG1wbGVcbiAgICAgKlxuICAgICAqICAgdmFyIHRlbXBsYXRlID0gdGVtcGxhdGVNYWtlci50ZW1wbGF0ZSgnPHNwYW4+e3sgbmFtZSB9fTwvc3Bhbj4nKSxcbiAgICAgKiAgICAgICByZXN1bHQgPSB0ZW1wbGF0ZSh7bmFtZTogJ0pvaG4nKTtcbiAgICAgKiAgIGNvbnNvbGUubG9nKHJlc3VsdCk7IC8vIDxzcGFuPkpvaG48L3NwYW4+XG4gICAgICpcbiAgICAgKi9cbiAgICB0ZW1wbGF0ZTogZnVuY3Rpb24gKGh0bWwpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gaHRtbDtcbiAgICAgICAgICAgIHR1aS51dGlsLmZvckVhY2goZGF0YSwgZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVnRXhwID0gbmV3IFJlZ0V4cCgne3tcXFxccyonICsga2V5ICsgJ1xcXFxzKn19JywgJ2cnKTtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShyZWdFeHAsIHZhbHVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfTtcbiAgICB9XG59O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3ICBMZWdlbmQgY29tcG9uZW50LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4uL2NvbnN0JyksXG4gICAgZG9tID0gcmVxdWlyZSgnLi4vaGVscGVycy9kb21IYW5kbGVyJyksXG4gICAgcmVuZGVyVXRpbCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvcmVuZGVyVXRpbCcpLFxuICAgIGRlZmF1bHRUaGVtZSA9IHJlcXVpcmUoJy4uL3RoZW1lcy9kZWZhdWx0VGhlbWUnKSxcbiAgICBsZWdlbmRUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vLi4vbGVnZW5kcy9sZWdlbmRUZW1wbGF0ZScpO1xuXG52YXIgTGVnZW5kID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBMZWdlbmQucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBMZWdlbmQgY29tcG9uZW50LlxuICAgICAqIEBjb25zdHJ1Y3RzIExlZ2VuZFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5sZWdlbmRMYWJlbHMgbGVnZW5kIGxhYmVsc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5ib3VuZCBheGlzIGJvdW5kXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIGF4aXMgdGhlbWVcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdHVpLnV0aWwuZXh0ZW5kKHRoaXMsIHBhcmFtcyk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBMZWdlbmQgdmlldyBjbGFzc05hbWVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2xhc3NOYW1lID0gJ3R1aS1jaGFydC1sZWdlbmQtYXJlYSc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBsZWdlbmQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGJvdW5kIHBsb3QgYm91bmRcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IGxlZ2VuZCBlbGVtZW50XG4gICAgICovXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGVsID0gZG9tLmNyZWF0ZSgnRElWJywgdGhpcy5jbGFzc05hbWUpO1xuICAgICAgICBlbC5pbm5lckhUTUwgPSB0aGlzLl9tYWtlTGVnZW5kSHRtbCgpO1xuICAgICAgICByZW5kZXJVdGlsLnJlbmRlclBvc2l0aW9uKGVsLCB0aGlzLmJvdW5kLnBvc2l0aW9uKTtcbiAgICAgICAgdGhpcy5fcmVuZGVyTGFiZWxUaGVtZShlbCwgdGhpcy50aGVtZS5sYWJlbCk7XG5cbiAgICAgICAgcmV0dXJuIGVsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlbWUgZm9yIGxlZ2VuZCBsYWJlbHNcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxvYmplY3Q+fSBsYWJlbHMgbGFiZWxzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIGxlZ2VuZCB0aGVtZVxuICAgICAqIEByZXR1cm5zIHthcnJheS48b2JqZWN0Pn0gbGFiZWxzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0VGhlbWVGb3JMYWJlbHM6IGZ1bmN0aW9uKGxhYmVscywgdGhlbWUpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHR1aS51dGlsLm1hcChsYWJlbHMsIGZ1bmN0aW9uKGl0ZW0sIGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgaXRlbVRoZW1lID0ge1xuICAgICAgICAgICAgICAgIGNvbG9yOiB0aGVtZS5jb2xvcnNbaW5kZXhdXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpZiAodGhlbWUuc2luZ2xlQ29sb3JzKSB7XG4gICAgICAgICAgICAgICAgaXRlbVRoZW1lLnNpbmdsZUNvbG9yID0gdGhlbWUuc2luZ2xlQ29sb3JzW2luZGV4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGVtZS5ib3JkZXJDb2xvcikge1xuICAgICAgICAgICAgICAgIGl0ZW1UaGVtZS5ib3JkZXJDb2xvciA9IHRoZW1lLmJvcmRlckNvbG9yO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaXRlbS50aGVtZSA9IGl0ZW1UaGVtZTtcbiAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGxlZ2VuZCBsYWJlbHMuXG4gICAgICogQHJldHVybnMge2FycmF5LjxvYmplY3Q+fSBsZWdlbmQgbGFiZWxzLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VMZWdlbmRMYWJlbHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY2hhcnRUeXBlID0gdGhpcy5jaGFydFR5cGUsXG4gICAgICAgICAgICBsZWdlbmRMYWJlbHMgPSB0aGlzLmxlZ2VuZExhYmVscyxcbiAgICAgICAgICAgIGpvaW5MZWdlbmRMYWJlbHMgPSB0aGlzLmpvaW5MZWdlbmRMYWJlbHMsXG4gICAgICAgICAgICBsYWJlbExlbiA9IGxlZ2VuZExhYmVscy5sZW5ndGgsXG4gICAgICAgICAgICB0aGVtZSA9IHRoaXMudGhlbWUsXG4gICAgICAgICAgICBjaGFydExlZ2VuZFRoZW1lID0gdHVpLnV0aWwuZmlsdGVyKHRoZW1lLCBmdW5jdGlvbihpdGVtLCBuYW1lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHR1aS51dGlsLmluQXJyYXkobmFtZSwgY2hhcnRDb25zdC5TRVJJRVNfUFJPUFMpID09PSAtMSAmJiBuYW1lICE9PSAnbGFiZWwnO1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBjaGFydFR5cGVzID0gdHVpLnV0aWwua2V5cyhjaGFydExlZ2VuZFRoZW1lKSxcbiAgICAgICAgICAgIGRlZmF1bHRMZWdlbmRUaGVtZSA9IHtcbiAgICAgICAgICAgICAgICBjb2xvcnM6IGRlZmF1bHRUaGVtZS5zZXJpZXMuY29sb3JzXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2hhcnRUaGVtZSwgcmVzdWx0O1xuXG4gICAgICAgIGlmICghY2hhcnRUeXBlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuX3NldFRoZW1lRm9yTGFiZWxzKGpvaW5MZWdlbmRMYWJlbHMsIHRoZW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNoYXJ0VGhlbWUgPSB0aGVtZVtjaGFydFR5cGVdIHx8IGRlZmF1bHRMZWdlbmRUaGVtZTtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuX3NldFRoZW1lRm9yTGFiZWxzKGpvaW5MZWdlbmRMYWJlbHMuc2xpY2UoMCwgbGFiZWxMZW4pLCBjaGFydFRoZW1lKTtcbiAgICAgICAgICAgIGNoYXJ0VGhlbWUgPSB0aGVtZVt0dWkudXRpbC5maWx0ZXIoY2hhcnRUeXBlcywgZnVuY3Rpb24ocHJvcE5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvcE5hbWUgIT09IGNoYXJ0VHlwZTtcbiAgICAgICAgICAgIH0pWzBdXSB8fCBkZWZhdWx0TGVnZW5kVGhlbWU7XG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KHRoaXMuX3NldFRoZW1lRm9yTGFiZWxzKGpvaW5MZWdlbmRMYWJlbHMuc2xpY2UobGFiZWxMZW4pLCBjaGFydFRoZW1lKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBsZWdlbmQgaHRtbC5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBsZWdlbmQgaHRtbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VMZWdlbmRIdG1sOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGxhYmVscyA9IHRoaXMuX21ha2VMZWdlbmRMYWJlbHMoKSxcbiAgICAgICAgICAgIHRlbXBsYXRlID0gbGVnZW5kVGVtcGxhdGUudHBsTGVnZW5kLFxuICAgICAgICAgICAgbGFiZWxIZWlnaHQgPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxIZWlnaHQobGFiZWxzWzBdLmxhYmVsLCBsYWJlbHNbMF0udGhlbWUpICsgKGNoYXJ0Q29uc3QuTEFCRUxfUEFERElOR19UT1AgKiAyKSxcbiAgICAgICAgICAgIGJhc2VNYXJnaW5Ub3AgPSBwYXJzZUludCgobGFiZWxIZWlnaHQgLSBjaGFydENvbnN0LkxFR0VORF9SRUNUX1dJRFRIKSAvIDIsIDEwKSAtIDEsXG4gICAgICAgICAgICBodG1sID0gdHVpLnV0aWwubWFwKGxhYmVscywgZnVuY3Rpb24obGFiZWwpIHtcbiAgICAgICAgICAgICAgICB2YXIgYm9yZGVyQ3NzVGV4dCA9IGxhYmVsLmJvcmRlckNvbG9yID8gcmVuZGVyVXRpbC5jb25jYXRTdHIoJztib3JkZXI6MXB4IHNvbGlkICcsIGxhYmVsLmJvcmRlckNvbG9yKSA6ICcnLFxuICAgICAgICAgICAgICAgICAgICByZWN0TWFyZ2luLCBtYXJnaW5Ub3AsIGRhdGE7XG4gICAgICAgICAgICAgICAgaWYgKGxhYmVsLmNoYXJ0VHlwZSA9PT0gJ2xpbmUnKSB7XG4gICAgICAgICAgICAgICAgICAgIG1hcmdpblRvcCA9IGJhc2VNYXJnaW5Ub3AgKyBjaGFydENvbnN0LkxJTkVfTUFSR0lOX1RPUDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBtYXJnaW5Ub3AgPSBiYXNlTWFyZ2luVG9wO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZWN0TWFyZ2luID0gcmVuZGVyVXRpbC5jb25jYXRTdHIoJzttYXJnaW4tdG9wOicsIG1hcmdpblRvcCwgJ3B4Jyk7XG5cbiAgICAgICAgICAgICAgICBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICBjc3NUZXh0OiByZW5kZXJVdGlsLmNvbmNhdFN0cignYmFja2dyb3VuZC1jb2xvcjonLCBsYWJlbC50aGVtZS5zaW5nbGVDb2xvciB8fCBsYWJlbC50aGVtZS5jb2xvciwgYm9yZGVyQ3NzVGV4dCwgcmVjdE1hcmdpbiksXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogbGFiZWxIZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0VHlwZTogbGFiZWwuY2hhcnRUeXBlIHx8ICdyZWN0JyxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGxhYmVsLmxhYmVsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGVtcGxhdGUoZGF0YSk7XG4gICAgICAgICAgICB9LCB0aGlzKS5qb2luKCcnKTtcbiAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBjc3Mgc3R5bGUgb2YgbGFiZWwgYXJlYS5cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCBsYWJlbCBhcmVhIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3tmb250U2l6ZTpudW1iZXIsIGZvbnRGYW1pbHk6IHN0cmluZywgY29sb3I6IHN0cmluZ319IHRoZW1lIGxhYmVsIHRoZW1lXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyTGFiZWxUaGVtZTogZnVuY3Rpb24oZWwsIHRoZW1lKSB7XG4gICAgICAgIHZhciBjc3NUZXh0ID0gcmVuZGVyVXRpbC5tYWtlRm9udENzc1RleHQodGhlbWUpO1xuICAgICAgICBlbC5zdHlsZS5jc3NUZXh0ICs9ICc7JyArIGNzc1RleHQ7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTGVnZW5kO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFRoaXMgaXMgdGVtcGxhdGVzIG9mIGxlZ2VuZCB2aWV3LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxudmFyIHRlbXBsYXRlTWFrZXIgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3RlbXBsYXRlTWFrZXInKTtcblxudmFyIHRhZ3MgPSB7XG4gICAgSFRNTF9MRUdFTkQ6ICc8ZGl2IGNsYXNzPVwidHVpLWNoYXJ0LWxlZ2VuZFwiPicgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cInR1aS1jaGFydC1sZWdlbmQtcmVjdCB7eyBjaGFydFR5cGUgfX1cIiBzdHlsZT1cInt7IGNzc1RleHQgfX1cIj48L2Rpdj4nICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJ0dWktY2hhcnQtbGVnZW5kLWxhYmVsXCIgc3R5bGU9XCJoZWlnaHQ6e3sgaGVpZ2h0IH19cHhcIj57eyBsYWJlbCB9fTwvZGl2PjwvZGl2Pidcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHRwbExlZ2VuZDogdGVtcGxhdGVNYWtlci50ZW1wbGF0ZSh0YWdzLkhUTUxfTEVHRU5EKVxufTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBQbG90IGNvbXBvbmVudC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGRvbSA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZG9tSGFuZGxlcicpLFxuICAgIGNhbGN1bGF0b3IgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2NhbGN1bGF0b3InKSxcbiAgICByZW5kZXJVdGlsID0gcmVxdWlyZSgnLi4vaGVscGVycy9yZW5kZXJVdGlsJyksXG4gICAgcGxvdFRlbXBsYXRlID0gcmVxdWlyZSgnLi9wbG90VGVtcGxhdGUnKTtcblxudmFyIFBsb3QgPSB0dWkudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIFBsb3QucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBQbG90IGNvbXBvbmVudC5cbiAgICAgKiBAY29uc3RydWN0cyBQbG90XG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnZUaWNrQ291bnQgdmVydGljYWwgdGljayBjb3VudFxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5oVGlja0NvdW50IGhvcml6b250YWwgdGljayBjb3VudFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5ib3VuZCBheGlzIGJvdW5kXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIGF4aXMgdGhlbWVcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdHVpLnV0aWwuZXh0ZW5kKHRoaXMsIHBhcmFtcyk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQbG90IHZpZXcgY2xhc3NOYW1lXG4gICAgICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNsYXNzTmFtZSA9ICd0dWktY2hhcnQtcGxvdC1hcmVhJztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIHBsb3QuXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIHRvcDogbnVtYmVyLCByaWdodDogbnVtYmVyfX0gYm91bmQgcGxvdCBhcmVhIGJvdW5kXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSBwbG90IGVsZW1lbnRcbiAgICAgKi9cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZWwgPSBkb20uY3JlYXRlKCdESVYnLCB0aGlzLmNsYXNzTmFtZSksXG4gICAgICAgICAgICBib3VuZCA9IHRoaXMuYm91bmQ7XG4gICAgICAgIHJlbmRlclV0aWwucmVuZGVyRGltZW5zaW9uKGVsLCBib3VuZC5kaW1lbnNpb24pO1xuICAgICAgICByZW5kZXJVdGlsLnJlbmRlclBvc2l0aW9uKGVsLCBib3VuZC5wb3NpdGlvbik7XG4gICAgICAgIHRoaXMuX3JlbmRlckxpbmVzKGVsLCBib3VuZC5kaW1lbnNpb24pO1xuXG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIHBsb3QgbGluZXMuXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gZGltZW5zaW9uIHBsb3QgYXJlYSBkaW1lbnNpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJMaW5lczogZnVuY3Rpb24oZWwsIGRpbWVuc2lvbikge1xuICAgICAgICB2YXIgaFBvc2l0aW9ucyA9IHRoaXMuX21ha2VIb3Jpem9udGFsUGl4ZWxQb3NpdGlvbnMoZGltZW5zaW9uLndpZHRoKSxcbiAgICAgICAgICAgIHZQb3NpdGlvbnMgPSB0aGlzLl9tYWtlVmVydGljYWxQaXhlbFBvc2l0aW9ucyhkaW1lbnNpb24uaGVpZ2h0KSxcbiAgICAgICAgICAgIHRoZW1lID0gdGhpcy50aGVtZSxcbiAgICAgICAgICAgIGxpbmVIdG1sID0gJyc7XG5cbiAgICAgICAgbGluZUh0bWwgKz0gdGhpcy5fbWFrZUxpbmVIdG1sKHtcbiAgICAgICAgICAgIHBvc2l0aW9uczogaFBvc2l0aW9ucyxcbiAgICAgICAgICAgIHNpemU6IGRpbWVuc2lvbi5oZWlnaHQsXG4gICAgICAgICAgICBjbGFzc05hbWU6ICd2ZXJ0aWNhbCcsXG4gICAgICAgICAgICBwb3NpdGlvblR5cGU6ICdsZWZ0JyxcbiAgICAgICAgICAgIHNpemVUeXBlOiAnaGVpZ2h0JyxcbiAgICAgICAgICAgIGxpbmVDb2xvcjogdGhlbWUubGluZUNvbG9yXG4gICAgICAgIH0pO1xuICAgICAgICBsaW5lSHRtbCArPSB0aGlzLl9tYWtlTGluZUh0bWwoe1xuICAgICAgICAgICAgcG9zaXRpb25zOiB2UG9zaXRpb25zLFxuICAgICAgICAgICAgc2l6ZTogZGltZW5zaW9uLndpZHRoLFxuICAgICAgICAgICAgY2xhc3NOYW1lOiAnaG9yaXpvbnRhbCcsXG4gICAgICAgICAgICBwb3NpdGlvblR5cGU6ICdib3R0b20nLFxuICAgICAgICAgICAgc2l6ZVR5cGU6ICd3aWR0aCcsXG4gICAgICAgICAgICBsaW5lQ29sb3I6IHRoZW1lLmxpbmVDb2xvclxuICAgICAgICB9KTtcblxuICAgICAgICBlbC5pbm5lckhUTUwgPSBsaW5lSHRtbDtcblxuICAgICAgICByZW5kZXJVdGlsLnJlbmRlckJhY2tncm91bmQoZWwsIHRoZW1lLmJhY2tncm91bmQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGh0bWwgb2YgcGxvdCBsaW5lLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48b2JqZWN0Pn0gcGFyYW1zLnBvc2l0aW9ucyBwb3NpdGlvbnNcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuc2l6ZSB3aWR0aCBvciBoZWlnaHRcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMuY2xhc3NOYW1lIGxpbmUgY2xhc3NOYW1lXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLnBvc2l0aW9uVHlwZSBwb3NpdGlvbiB0eXBlIChsZWZ0IG9yIGJvdHRvbSlcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMuc2l6ZVR5cGUgc2l6ZSB0eXBlIChzaXplIG9yIGhlaWdodClcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMubGluZUNvbG9yIGxpbmUgY29sb3JcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBodG1sXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUxpbmVIdG1sOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIHRlbXBsYXRlID0gcGxvdFRlbXBsYXRlLnRwbFBsb3RMaW5lLFxuICAgICAgICAgICAgbGluZUh0bWwgPSB0dWkudXRpbC5tYXAocGFyYW1zLnBvc2l0aW9ucywgZnVuY3Rpb24ocG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgY3NzVGV4dHMgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJVdGlsLmNvbmNhdFN0cihwYXJhbXMucG9zaXRpb25UeXBlLCAnOicsIHBvc2l0aW9uLCAncHgnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlclV0aWwuY29uY2F0U3RyKHBhcmFtcy5zaXplVHlwZSwgJzonLCBwYXJhbXMuc2l6ZSwgJ3B4JylcbiAgICAgICAgICAgICAgICAgICAgXSwgZGF0YTtcblxuICAgICAgICAgICAgICAgIGlmIChwYXJhbXMubGluZUNvbG9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGNzc1RleHRzLnB1c2gocmVuZGVyVXRpbC5jb25jYXRTdHIoJ2JhY2tncm91bmQtY29sb3I6JywgcGFyYW1zLmxpbmVDb2xvcikpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGRhdGEgPSB7Y2xhc3NOYW1lOiBwYXJhbXMuY2xhc3NOYW1lLCBjc3NUZXh0OiBjc3NUZXh0cy5qb2luKCc7Jyl9O1xuICAgICAgICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZShkYXRhKTtcbiAgICAgICAgICAgIH0sIHRoaXMpLmpvaW4oJycpO1xuICAgICAgICByZXR1cm4gbGluZUh0bWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgcGl4ZWwgdmFsdWUgb2YgdmVydGljYWwgcG9zaXRpb25zXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodCBwbG90IGhlaWdodFxuICAgICAqIEByZXR1cm5zIHthcnJheS48bnVtYmVyPn0gcG9zaXRpb25zXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVZlcnRpY2FsUGl4ZWxQb3NpdGlvbnM6IGZ1bmN0aW9uKGhlaWdodCkge1xuICAgICAgICB2YXIgcG9zaXRpb25zID0gY2FsY3VsYXRvci5tYWtlVGlja1BpeGVsUG9zaXRpb25zKGhlaWdodCwgdGhpcy52VGlja0NvdW50KTtcbiAgICAgICAgcG9zaXRpb25zLnNoaWZ0KCk7XG4gICAgICAgIHJldHVybiBwb3NpdGlvbnM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgcGl4ZWwgdmFsdWUgb2YgaG9yaXpvbnRhbCBwb3NpdGlvbnMuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoIHBsb3Qgd2lkdGhcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPG51bWJlcj59IHBvc2l0aW9uc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VIb3Jpem9udGFsUGl4ZWxQb3NpdGlvbnM6IGZ1bmN0aW9uKHdpZHRoKSB7XG4gICAgICAgIHZhciBwb3NpdGlvbnMgPSBjYWxjdWxhdG9yLm1ha2VUaWNrUGl4ZWxQb3NpdGlvbnMod2lkdGgsIHRoaXMuaFRpY2tDb3VudCk7XG4gICAgICAgIHBvc2l0aW9ucy5zaGlmdCgpO1xuICAgICAgICByZXR1cm4gcG9zaXRpb25zO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBsb3Q7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgVGhpcyBpcyB0ZW1wbGF0ZXMgb2YgcGxvdCB2aWV3IC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbnZhciB0ZW1wbGF0ZU1ha2VyID0gcmVxdWlyZSgnLi4vaGVscGVycy90ZW1wbGF0ZU1ha2VyJyk7XG5cbnZhciB0YWdzID0ge1xuICAgIEhUTUxfUExPVF9MSU5FOiAnPGRpdiBjbGFzcz1cInR1aS1jaGFydC1wbG90LWxpbmUge3sgY2xhc3NOYW1lIH19XCIgc3R5bGU9XCJ7eyBjc3NUZXh0IH19XCI+PC9kaXY+J1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgdHBsUGxvdExpbmU6IHRlbXBsYXRlTWFrZXIudGVtcGxhdGUodGFncy5IVE1MX1BMT1RfTElORSlcbn07XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgUmFwaGFlbCByZW5kZXIgcGx1Z2luLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQmFyQ2hhcnQgPSByZXF1aXJlKCcuL3JhcGhhZWxCYXJDaGFydCcpLFxuICAgIExpbmVDaGFydCA9IHJlcXVpcmUoJy4vcmFwaGFlbExpbmVDaGFydCcpLFxuICAgIEFyZWFDaGFydCA9IHJlcXVpcmUoJy4vcmFwaGFlbEFyZWFDaGFydCcpLFxuICAgIFBpZUNoYXJ0ID0gcmVxdWlyZSgnLi9yYXBoYWVsUGllQ2hhcnQnKTtcblxudmFyIHBsdWdpbk5hbWUgPSAncmFwaGFlbCcsXG4gICAgcGx1Z2luUmFwaGFlbDtcblxucGx1Z2luUmFwaGFlbCA9IHtcbiAgICBiYXI6IEJhckNoYXJ0LFxuICAgIGNvbHVtbjogQmFyQ2hhcnQsXG4gICAgbGluZTogTGluZUNoYXJ0LFxuICAgIGFyZWE6IEFyZWFDaGFydCxcbiAgICBwaWU6IFBpZUNoYXJ0XG59O1xuXG50dWkuY2hhcnQucmVnaXN0ZXJQbHVnaW4ocGx1Z2luTmFtZSwgcGx1Z2luUmFwaGFlbCk7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgUmFwaGFlbCBhcmVhIGNoYXJ0IHJlbmRlcmVyLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmFwaGFlbExpbmVCYXNlID0gcmVxdWlyZSgnLi9yYXBoYWVsTGluZVR5cGVCYXNlJyksXG4gICAgcmFwaGFlbFJlbmRlclV0aWwgPSByZXF1aXJlKCcuL3JhcGhhZWxSZW5kZXJVdGlsJyk7XG5cbnZhciBSYXBoYWVsID0gd2luZG93LlJhcGhhZWwsXG4gICAgQU5JTUFUSU9OX1RJTUUgPSA3MDA7XG5cbnZhciBjb25jYXQgPSBBcnJheS5wcm90b3R5cGUuY29uY2F0O1xuXG4vKipcbiAqIEBjbGFzc2Rlc2MgUmFwaGFlbEFyZWFDaGFydCBpcyBncmFwaCByZW5kZXJlciBmb3IgYXJlYSBjaGFydC5cbiAqIEBjbGFzcyBSYXBoYWVsQXJlYUNoYXJ0XG4gKiBAZXh0ZW5kcyBSYXBoYWVsTGluZVR5cGVCYXNlXG4gKi9cbnZhciBSYXBoYWVsQXJlYUNoYXJ0ID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoUmFwaGFlbExpbmVCYXNlLCAvKiogQGxlbmRzIFJhcGhhZWxBcmVhQ2hhcnQucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBSZW5kZXIgZnVuY3Rpb24gb2YgYXJlYSBjaGFydC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciBjb250YWluZXJcbiAgICAgKiBAcGFyYW0ge3tncm91cFBvc2l0aW9uczogYXJyYXkuPGFycmF5PiwgZGltZW5zaW9uOiBvYmplY3QsIHRoZW1lOiBvYmplY3QsIG9wdGlvbnM6IG9iamVjdH19IGRhdGEgcmVuZGVyIGRhdGFcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBpbkNhbGxiYWNrIGluIGNhbGxiYWNrXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gb3V0Q2FsbGJhY2sgb3V0IGNhbGxiYWNrXG4gICAgICogQHJldHVybiB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICovXG4gICAgcmVuZGVyOiBmdW5jdGlvbihwYXBlciwgY29udGFpbmVyLCBkYXRhLCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjaykge1xuICAgICAgICB2YXIgZGltZW5zaW9uID0gZGF0YS5kaW1lbnNpb24sXG4gICAgICAgICAgICBncm91cFBvc2l0aW9ucyA9IGRhdGEuZ3JvdXBQb3NpdGlvbnMsXG4gICAgICAgICAgICB0aGVtZSA9IGRhdGEudGhlbWUsXG4gICAgICAgICAgICBjb2xvcnMgPSB0aGVtZS5jb2xvcnMsXG4gICAgICAgICAgICBvcGFjaXR5ID0gZGF0YS5vcHRpb25zLmhhc0RvdCA/IDEgOiAwLFxuICAgICAgICAgICAgZ3JvdXBQYXRocyA9IHRoaXMuX2dldEFyZWFzUGF0aChncm91cFBvc2l0aW9ucywgZGF0YS56ZXJvVG9wKSxcbiAgICAgICAgICAgIGJvcmRlclN0eWxlID0gdGhpcy5tYWtlQm9yZGVyU3R5bGUodGhlbWUuYm9yZGVyQ29sb3IsIG9wYWNpdHkpLFxuICAgICAgICAgICAgb3V0RG90U3R5bGUgPSB0aGlzLm1ha2VPdXREb3RTdHlsZShvcGFjaXR5LCBib3JkZXJTdHlsZSksXG4gICAgICAgICAgICBncm91cEFyZWFzLCB0b29sdGlwTGluZSwgZ3JvdXBEb3RzO1xuXG4gICAgICAgIGlmICghcGFwZXIpIHtcbiAgICAgICAgICAgIHBhcGVyID0gUmFwaGFlbChjb250YWluZXIsIGRpbWVuc2lvbi53aWR0aCwgZGltZW5zaW9uLmhlaWdodCk7XG4gICAgICAgIH1cblxuICAgICAgICBncm91cEFyZWFzID0gdGhpcy5fcmVuZGVyQXJlYXMocGFwZXIsIGdyb3VwUGF0aHMsIGNvbG9ycyk7XG4gICAgICAgIHRvb2x0aXBMaW5lID0gdGhpcy5fcmVuZGVyVG9vbHRpcExpbmUocGFwZXIsIGRpbWVuc2lvbi5oZWlnaHQpO1xuICAgICAgICBncm91cERvdHMgPSB0aGlzLnJlbmRlckRvdHMocGFwZXIsIGdyb3VwUG9zaXRpb25zLCBjb2xvcnMsIGJvcmRlclN0eWxlKTtcblxuICAgICAgICB0aGlzLm91dERvdFN0eWxlID0gb3V0RG90U3R5bGU7XG4gICAgICAgIHRoaXMuZ3JvdXBQYXRocyA9IGdyb3VwUGF0aHM7XG4gICAgICAgIHRoaXMuZ3JvdXBBcmVhcyA9IGdyb3VwQXJlYXM7XG4gICAgICAgIHRoaXMudG9vbHRpcExpbmUgPSB0b29sdGlwTGluZTtcbiAgICAgICAgdGhpcy5ncm91cERvdHMgPSBncm91cERvdHM7XG4gICAgICAgIHRoaXMuZG90T3BhY2l0eSA9IG9wYWNpdHk7XG5cbiAgICAgICAgdGhpcy5hdHRhY2hFdmVudChncm91cERvdHMsIGdyb3VwUG9zaXRpb25zLCBvdXREb3RTdHlsZSwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spO1xuXG4gICAgICAgIHJldHVybiBwYXBlcjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGFyZWEgZ3JhcGguXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIHBhcGVyXG4gICAgICogQHBhcmFtIHt7c3RhcnQ6IHN0cmluZywgYWRkU3RhcnQ6IHN0cmluZ319IHBhdGggcGF0aFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb2xvciBjb2xvclxuICAgICAqIEByZXR1cm5zIHthcnJheS48b2JqZWN0Pn0gcmFwaGFlbCBvYmplY3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJBcmVhOiBmdW5jdGlvbihwYXBlciwgcGF0aCwgY29sb3IpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdLFxuICAgICAgICAgICAgYXJlYSA9IHBhcGVyLnBhdGgoW3BhdGguc3RhcnRdKSxcbiAgICAgICAgICAgIGZpbGxTdHlsZSA9IHtcbiAgICAgICAgICAgICAgICBmaWxsOiBjb2xvcixcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAwLjUsXG4gICAgICAgICAgICAgICAgc3Ryb2tlOiBjb2xvcixcbiAgICAgICAgICAgICAgICAnc3Ryb2tlLW9wYWNpdHknOiAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYWRkQXJlYTtcblxuICAgICAgICBhcmVhLmF0dHIoZmlsbFN0eWxlKTtcbiAgICAgICAgcmVzdWx0LnB1c2goYXJlYSk7XG5cbiAgICAgICAgaWYgKHBhdGguYWRkU3RhcnQpIHtcbiAgICAgICAgICAgIGFkZEFyZWEgPSBwYXBlci5wYXRoKFtwYXRoLmFkZFN0YXJ0XSk7XG4gICAgICAgICAgICBhZGRBcmVhLmF0dHIoZmlsbFN0eWxlKTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGFkZEFyZWEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBhcmVhIGdyYXBocy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgcGFwZXJcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxvYmplY3Q+fSBncm91cFBhdGhzIGdyb3VwIHBhdGhzXG4gICAgICogQHBhcmFtIHthcnJheS48c3RyaW5nPn0gY29sb3JzIGNvbG9yc1xuICAgICAqIEByZXR1cm5zIHthcnJheX0gcmFwaGFlbCBvYmplY3RzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyQXJlYXM6IGZ1bmN0aW9uKHBhcGVyLCBncm91cFBhdGhzLCBjb2xvcnMpIHtcbiAgICAgICAgdmFyIGdyb3VwQXJlYXMgPSB0dWkudXRpbC5tYXAoZ3JvdXBQYXRocywgZnVuY3Rpb24ocGF0aHMsIGdyb3VwSW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBjb2xvciA9IGNvbG9yc1tncm91cEluZGV4XSB8fCAndHJhbnNwYXJlbnQnO1xuICAgICAgICAgICAgcmV0dXJuIHR1aS51dGlsLm1hcChwYXRocywgZnVuY3Rpb24ocGF0aCkge1xuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIGFyZWE6IHRoaXMuX3JlbmRlckFyZWEocGFwZXIsIHBhdGguYXJlYSwgY29sb3IpLFxuICAgICAgICAgICAgICAgICAgICBsaW5lOiByYXBoYWVsUmVuZGVyVXRpbC5yZW5kZXJMaW5lKHBhcGVyLCBwYXRoLmxpbmUuc3RhcnQsIGNvbG9yKVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICByZXR1cm4gZ3JvdXBBcmVhcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciBtaW51cyBvciBub3QuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIHZhbHVlXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHJlc3VsdCBib29sZWFuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNNaW51czogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlIDwgMDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciBwbHVzIG9yIG5vdC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgdmFsdWVcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gcmVzdWx0IGJvb2xlYW5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc1BsdXM6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZSA+PSAwO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGhlaWdodC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdG9wIHRvcFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB6ZXJvVG9wIHplcm8gcG9zaXRpb24gdG9wXG4gICAgICogQHJldHVybnMge251bWJlcn0gaGVpZ2h0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUhlaWdodDogZnVuY3Rpb24odG9wLCB6ZXJvVG9wKSB7XG4gICAgICAgIHJldHVybiBNYXRoLmFicyh0b3AgLSB6ZXJvVG9wKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmluZCBtaWRkbGUgbGVmdFxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBmcm9tUG9zIGZyb20gcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gdG9Qb3MgdG8gcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gemVyb1RvcCB6ZXJvIHBvc2l0aW9uIHRvcFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IG1pZGRsZSBsZWZ0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZmluZE1pZGRsZUxlZnQ6IGZ1bmN0aW9uKGZyb21Qb3MsIHRvUG9zLCB6ZXJvVG9wKSB7XG4gICAgICAgIHZhciB0b3BzID0gW3plcm9Ub3AgLSBmcm9tUG9zLnRvcCwgemVyb1RvcCAtIHRvUG9zLnRvcF0sXG4gICAgICAgICAgICBtaWRkbGVMZWZ0LCB3aWR0aCwgZnJvbUhlaWdodCwgdG9IZWlnaHQ7XG5cbiAgICAgICAgaWYgKHR1aS51dGlsLmFsbCh0b3BzLCB0aGlzLl9pc01pbnVzKSB8fCB0dWkudXRpbC5hbGwodG9wcywgdGhpcy5faXNQbHVzKSkge1xuICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9XG5cbiAgICAgICAgZnJvbUhlaWdodCA9IHRoaXMuX21ha2VIZWlnaHQoZnJvbVBvcy50b3AsIHplcm9Ub3ApO1xuICAgICAgICB0b0hlaWdodCA9IHRoaXMuX21ha2VIZWlnaHQodG9Qb3MudG9wLCB6ZXJvVG9wKTtcbiAgICAgICAgd2lkdGggPSB0b1Bvcy5sZWZ0IC0gZnJvbVBvcy5sZWZ0O1xuXG4gICAgICAgIG1pZGRsZUxlZnQgPSBmcm9tUG9zLmxlZnQgKyAod2lkdGggKiAoZnJvbUhlaWdodCAvIChmcm9tSGVpZ2h0ICsgdG9IZWlnaHQpKSk7XG4gICAgICAgIHJldHVybiBtaWRkbGVMZWZ0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGFyZWEgcGF0aC5cbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gZnJvbVBvcyBmcm9tIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IHRvUG9zIHRvIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHplcm9Ub3AgemVybyBwb3NpdGlvbiB0b3BcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBhcmVhIHBhdGhcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQXJlYVBhdGg6IGZ1bmN0aW9uKGZyb21Qb3MsIHRvUG9zLCB6ZXJvVG9wKSB7XG4gICAgICAgIHZhciBmcm9tU3RhcnRQb2ludCA9IFsnTScsIGZyb21Qb3MubGVmdCwgJyAnLCB6ZXJvVG9wXSxcbiAgICAgICAgICAgIGZyb21FbmRQb2ludCA9IHplcm9Ub3AgPT09IGZyb21Qb3MudG9wID8gW10gOiBbJ0wnLCBmcm9tUG9zLmxlZnQsICcgJywgZnJvbVBvcy50b3BdLFxuICAgICAgICAgICAgdG9TdGFydFBvaW50ID0gWydMJywgdG9Qb3MubGVmdCwgJyAnLCB0b1Bvcy50b3BdLFxuICAgICAgICAgICAgdG9FbmRQb2ludCA9IHplcm9Ub3AgPT09IHRvUG9zLnRvcCA/IFtdIDogWydMJywgdG9Qb3MubGVmdCwgJyAnLCB6ZXJvVG9wXTtcbiAgICAgICAgcmV0dXJuIGNvbmNhdC5jYWxsKFtdLCBmcm9tU3RhcnRQb2ludCwgZnJvbUVuZFBvaW50LCB0b1N0YXJ0UG9pbnQsIHRvRW5kUG9pbnQpLmpvaW4oJycpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGFyZWEgcGF0aHMuXG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IGZyb21Qb3MgZnJvbSBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSB0b1BvcyB0byBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB6ZXJvVG9wIHplcm8gcG9zaXRpb24gdG9wXG4gICAgICogQHJldHVybnMge3tcbiAgICAgKiAgICAgIHN0YXJ0OiBzdHJpbmcsXG4gICAgICogICAgICBlbmQ6IHN0cmluZyxcbiAgICAgKiAgICAgIGFkZFN0YXJ0OiBzdHJpbmcsXG4gICAgICogICAgICBhZGRFbmQ6IHN0cmluZ1xuICAgICAqIH19IGFyZWEgcGF0aHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQXJlYVBhdGhzOiBmdW5jdGlvbihmcm9tUG9zLCB0b1BvcywgemVyb1RvcCkge1xuICAgICAgICB2YXIgbWlkZGxlTGVmdCA9IHRoaXMuX2ZpbmRNaWRkbGVMZWZ0KGZyb21Qb3MsIHRvUG9zLCB6ZXJvVG9wKSxcbiAgICAgICAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICBzdGFydDogdGhpcy5fbWFrZUFyZWFQYXRoKGZyb21Qb3MsIGZyb21Qb3MsIHplcm9Ub3ApXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbWlkZGxlUG9zO1xuXG4gICAgICAgIGlmICh0aGlzLl9pc1BsdXMobWlkZGxlTGVmdCkpIHtcbiAgICAgICAgICAgIG1pZGRsZVBvcyA9IHtsZWZ0OiBtaWRkbGVMZWZ0LCB0b3A6IHplcm9Ub3B9O1xuICAgICAgICAgICAgcmVzdWx0LmVuZCA9IHRoaXMuX21ha2VBcmVhUGF0aChmcm9tUG9zLCBtaWRkbGVQb3MsIHplcm9Ub3ApO1xuICAgICAgICAgICAgcmVzdWx0LmFkZFN0YXJ0ID0gdGhpcy5fbWFrZUFyZWFQYXRoKG1pZGRsZVBvcywgbWlkZGxlUG9zLCB6ZXJvVG9wKTtcbiAgICAgICAgICAgIHJlc3VsdC5hZGRFbmQgPSB0aGlzLl9tYWtlQXJlYVBhdGgobWlkZGxlUG9zLCB0b1BvcywgemVyb1RvcCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQuZW5kID0gdGhpcy5fbWFrZUFyZWFQYXRoKGZyb21Qb3MsIHRvUG9zLCB6ZXJvVG9wKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBhcmVhIHBhdGguXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXkuPG9iamVjdD4+fSBncm91cFBvc2l0aW9ucyBwb3NpdGlvbnNcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gemVyb1RvcCB6ZXJvIHRvcFxuICAgICAqIEByZXR1cm5zIHthcnJheS48YXJyYXkuPHN0cmluZz4+fSBwYXRoc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldEFyZWFzUGF0aDogZnVuY3Rpb24oZ3JvdXBQb3NpdGlvbnMsIHplcm9Ub3ApIHtcbiAgICAgICAgdmFyIGdyb3VwUGF0aHMgPSB0dWkudXRpbC5tYXAoZ3JvdXBQb3NpdGlvbnMsIGZ1bmN0aW9uKHBvc2l0aW9ucykge1xuICAgICAgICAgICAgdmFyIGZyb21Qb3MgPSBwb3NpdGlvbnNbMF0sXG4gICAgICAgICAgICAgICAgcmVzdCA9IHBvc2l0aW9ucy5zbGljZSgxKTtcbiAgICAgICAgICAgIHJldHVybiB0dWkudXRpbC5tYXAocmVzdCwgZnVuY3Rpb24ocG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgICAgICBhcmVhOiB0aGlzLl9tYWtlQXJlYVBhdGhzKGZyb21Qb3MsIHBvc2l0aW9uLCB6ZXJvVG9wKSxcbiAgICAgICAgICAgICAgICAgICAgbGluZTogdGhpcy5tYWtlTGluZVBhdGgoZnJvbVBvcywgcG9zaXRpb24pXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBmcm9tUG9zID0gcG9zaXRpb247XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIGdyb3VwUGF0aHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFuaW1hdGUgYXJlYSBjaGFydC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYXJlYSByYXBoYWVsIG9iamVjdFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBhcmVhUGF0aCBwYXRoXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHRpbWUgcGxheSB0aW1lXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHN0YXJ0VGltZSBzdGFydCB0aW1lXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYW5pbWF0ZUFyZWE6IGZ1bmN0aW9uKGFyZWEsIGFyZWFQYXRoLCB0aW1lLCBzdGFydFRpbWUpIHtcbiAgICAgICAgdmFyIGFyZWFBZGRFbmRQYXRoID0gYXJlYVBhdGguYWRkRW5kLFxuICAgICAgICAgICAgYXJlYUVuZFBhdGggPSBhcmVhUGF0aC5lbmQ7XG4gICAgICAgIGlmIChhcmVhQWRkRW5kUGF0aCkge1xuICAgICAgICAgICAgdGltZSA9IHRpbWUgLyAyO1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBhcmVhWzFdLmFuaW1hdGUoe3BhdGg6IGFyZWFBZGRFbmRQYXRoLCAnc3Ryb2tlLW9wYWNpdHknOiAwLjI1fSwgdGltZSk7XG4gICAgICAgICAgICB9LCBzdGFydFRpbWUgKyB0aW1lKTtcbiAgICAgICAgfVxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgYXJlYVswXS5hbmltYXRlKHtwYXRoOiBhcmVhRW5kUGF0aCwgJ3N0cm9rZS1vcGFjaXR5JzogMC4yNX0sIHRpbWUpO1xuICAgICAgICB9LCBzdGFydFRpbWUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBbmltYXRlLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIGNhbGxiYWNrXG4gICAgICovXG4gICAgYW5pbWF0ZTogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGdyb3VwQXJlYXMgPSB0aGlzLmdyb3VwQXJlYXMsXG4gICAgICAgICAgICBncm91cFBhdGhzID0gdGhpcy5ncm91cFBhdGhzLFxuICAgICAgICAgICAgb3BhY2l0eSA9IHRoaXMuZG90T3BhY2l0eSxcbiAgICAgICAgICAgIHRpbWUgPSBBTklNQVRJT05fVElNRSAvIGdyb3VwQXJlYXNbMF0ubGVuZ3RoLFxuICAgICAgICAgICAgc3RhcnRUaW1lO1xuICAgICAgICB0dWkudXRpbC5mb3JFYWNoQXJyYXkodGhpcy5ncm91cERvdHMsIGZ1bmN0aW9uKGRvdHMsIGdyb3VwSW5kZXgpIHtcbiAgICAgICAgICAgIHN0YXJ0VGltZSA9IDA7XG4gICAgICAgICAgICB0dWkudXRpbC5mb3JFYWNoQXJyYXkoZG90cywgZnVuY3Rpb24oZG90LCBpbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciBhcmVhLCBhcmVhUGF0aDtcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgYXJlYSA9IGdyb3VwQXJlYXNbZ3JvdXBJbmRleF1baW5kZXggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgYXJlYVBhdGggPSBncm91cFBhdGhzW2dyb3VwSW5kZXhdW2luZGV4IC0gMV07XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYW5pbWF0ZUxpbmUoYXJlYS5saW5lLCBhcmVhUGF0aC5saW5lLmVuZCwgdGltZSwgc3RhcnRUaW1lKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYW5pbWF0ZUFyZWEoYXJlYS5hcmVhLCBhcmVhUGF0aC5hcmVhLCB0aW1lLCBzdGFydFRpbWUpO1xuICAgICAgICAgICAgICAgICAgICBzdGFydFRpbWUgKz0gdGltZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAob3BhY2l0eSkge1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZG90LmF0dHIoeydmaWxsLW9wYWNpdHknOiBvcGFjaXR5fSk7XG4gICAgICAgICAgICAgICAgICAgIH0sIHN0YXJ0VGltZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgc2V0VGltZW91dChjYWxsYmFjaywgc3RhcnRUaW1lKTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhcGhhZWxBcmVhQ2hhcnQ7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgUmFwaGFlbCBiYXIgY2hhcnQgcmVuZGVyZXIuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG52YXIgcmFwaGFlbFJlbmRlclV0aWwgPSByZXF1aXJlKCcuL3JhcGhhZWxSZW5kZXJVdGlsJyk7XG5cbnZhciBSYXBoYWVsID0gd2luZG93LlJhcGhhZWw7XG5cbnZhciBBTklNQVRJT05fVElNRSA9IDcwMDtcblxuLyoqXG4gKiBAY2xhc3NkZXNjIFJhcGhhZWxCYXJDaGFydCBpcyBncmFwaCByZW5kZXJlciBmb3IgYmFyLCBjb2x1bW4gY2hhcnQuXG4gKiBAY2xhc3MgUmFwaGFlbEJhckNoYXJ0XG4gKi9cbnZhciBSYXBoYWVsQmFyQ2hhcnQgPSB0dWkudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIFJhcGhhZWxCYXJDaGFydC5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIFJlbmRlciBmdW5jdGlvbiBvZiBiYXIgY2hhcnRcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciBjb250YWluZXIgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7e3NpemU6IG9iamVjdCwgbW9kZWw6IG9iamVjdCwgb3B0aW9uczogb2JqZWN0LCB0b29sdGlwUG9zaXRpb246IHN0cmluZ319IGRhdGEgY2hhcnQgZGF0YVxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGluQ2FsbGJhY2sgbW91c2VvdmVyIGNhbGxiYWNrXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gb3V0Q2FsbGJhY2sgbW91c2VvdXQgY2FsbGJhY2tcbiAgICAgKiBAcmV0dXJuIHtvYmplY3R9IHBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKi9cbiAgICByZW5kZXI6IGZ1bmN0aW9uKHBhcGVyLCBjb250YWluZXIsIGRhdGEsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKSB7XG4gICAgICAgIHZhciBncm91cEJvdW5kcyA9IGRhdGEuZ3JvdXBCb3VuZHMsXG4gICAgICAgICAgICBkaW1lbnNpb24gPSBkYXRhLmRpbWVuc2lvbixcbiAgICAgICAgICAgIGJhc2VQYXJhbXM7XG5cbiAgICAgICAgaWYgKCFncm91cEJvdW5kcykge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXBhcGVyKSB7XG4gICAgICAgICAgICBwYXBlciA9IFJhcGhhZWwoY29udGFpbmVyLCBkaW1lbnNpb24ud2lkdGgsIGRpbWVuc2lvbi5oZWlnaHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgYmFzZVBhcmFtcyA9IHtcbiAgICAgICAgICAgIHBhcGVyOiBwYXBlcixcbiAgICAgICAgICAgIHRoZW1lOiBkYXRhLnRoZW1lLFxuICAgICAgICAgICAgZ3JvdXBCb3VuZHM6IGdyb3VwQm91bmRzLFxuICAgICAgICAgICAgZ3JvdXBWYWx1ZXM6IGRhdGEuZ3JvdXBWYWx1ZXMsXG4gICAgICAgICAgICBjaGFydFR5cGU6IGRhdGEuY2hhcnRUeXBlXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5fcmVuZGVyQmFycyh0dWkudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgaW5DYWxsYmFjazogaW5DYWxsYmFjayxcbiAgICAgICAgICAgIG91dENhbGxiYWNrOiBvdXRDYWxsYmFja1xuICAgICAgICB9LCBiYXNlUGFyYW1zKSk7XG5cbiAgICAgICAgdGhpcy5fcmVuZGVyQmFyQm9yZGVycyhiYXNlUGFyYW1zKTtcblxuICAgICAgICB0aGlzLmNoYXJ0VHlwZSA9IGRhdGEuY2hhcnRUeXBlO1xuXG4gICAgICAgIHJldHVybiBwYXBlcjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIHJlY3RcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMucGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5jb2xvciBzZXJpZXMgY29sb3JcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMuYm9yZGVyQ29sb3Igc2VyaWVzIGJvcmRlckNvbG9yXG4gICAgICogICAgICBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IHBhcmFtcy5ib3VuZCBib3VuZFxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IGJhciByZWN0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyQmFyOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGJvdW5kID0gcGFyYW1zLmJvdW5kLFxuICAgICAgICAgICAgcmVjdDtcbiAgICAgICAgaWYgKGJvdW5kLndpZHRoIDwgMCB8fCBib3VuZC5oZWlnaHQgPCAwKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlY3QgPSBwYXJhbXMucGFwZXIucmVjdChib3VuZC5sZWZ0LCBib3VuZC50b3AsIGJvdW5kLndpZHRoLCBib3VuZC5oZWlnaHQpO1xuICAgICAgICByZWN0LmF0dHIoe1xuICAgICAgICAgICAgZmlsbDogcGFyYW1zLmNvbG9yLFxuICAgICAgICAgICAgc3Ryb2tlOiAnbm9uZSdcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHJlY3Q7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJpbmQgaG92ZXIgZXZlbnQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHJlY3QgcmFwaGFlbCByZWN0XG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBib3VuZCBib3VuZFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpZCB0b29sdGlwIGlkXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gaW5DYWxsYmFjayBpbiBjYWxsYmFja1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG91dENhbGxiYWNrIG91dCBjYWxsYmFja1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2JpbmRIb3ZlckV2ZW50OiBmdW5jdGlvbihyZWN0LCBib3VuZCwgZ3JvdXBJbmRleCwgaW5kZXgsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKSB7XG4gICAgICAgIHJlY3QuaG92ZXIoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpbkNhbGxiYWNrKGJvdW5kLCBncm91cEluZGV4LCBpbmRleCk7XG4gICAgICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgb3V0Q2FsbGJhY2soKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBiYXJzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5wYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICogICAgICBAcGFyYW0ge3tjb2xvcnM6IHN0cmluZ1tdLCBzaW5nbGVDb2xvcnM6IHN0cmluZ1tdLCBib3JkZXJDb2xvcjogc3RyaW5nfX0gcGFyYW1zLnRoZW1lIGJhciBjaGFydCB0aGVtZVxuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48YXJyYXkuPHtsZWZ0OiBudW1iZXIsIHRvcDpudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfT4+fSBwYXJhbXMuZ3JvdXBCb3VuZHMgYm91bmRzXG4gICAgICogICAgICBAcGFyYW0ge2Z1bmN0aW9ufSBwYXJhbXMuaW5DYWxsYmFjayBpbiBjYWxsYmFja1xuICAgICAqICAgICAgQHBhcmFtIHtmdW5jdGlvbn0gcGFyYW1zLm91dENhbGxiYWNrIG91dCBjYWxsYmFja1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlckJhcnM6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgc2luZ2xlQ29sb3JzID0gKHBhcmFtcy5ncm91cEJvdW5kc1swXS5sZW5ndGggPT09IDEpICYmIHBhcmFtcy50aGVtZS5zaW5nbGVDb2xvcnMgfHwgW10sXG4gICAgICAgICAgICBjb2xvcnMgPSBwYXJhbXMudGhlbWUuY29sb3JzLFxuICAgICAgICAgICAgYmFycyA9IFtdO1xuICAgICAgICB0dWkudXRpbC5mb3JFYWNoQXJyYXkocGFyYW1zLmdyb3VwQm91bmRzLCBmdW5jdGlvbihib3VuZHMsIGdyb3VwSW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBzaW5nbGVDb2xvciA9IHNpbmdsZUNvbG9yc1tncm91cEluZGV4XTtcbiAgICAgICAgICAgIHR1aS51dGlsLmZvckVhY2hBcnJheShib3VuZHMsIGZ1bmN0aW9uKGJvdW5kLCBpbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciBjb2xvciwgaWQsIHJlY3QsIHZhbHVlO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFib3VuZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29sb3IgPSBzaW5nbGVDb2xvciB8fCBjb2xvcnNbaW5kZXhdO1xuICAgICAgICAgICAgICAgIGlkID0gZ3JvdXBJbmRleCArICctJyArIGluZGV4O1xuICAgICAgICAgICAgICAgIHZhbHVlID0gcGFyYW1zLmdyb3VwVmFsdWVzW2dyb3VwSW5kZXhdW2luZGV4XTtcbiAgICAgICAgICAgICAgICByZWN0ID0gdGhpcy5fcmVuZGVyQmFyKHtcbiAgICAgICAgICAgICAgICAgICAgcGFwZXI6IHBhcmFtcy5wYXBlcixcbiAgICAgICAgICAgICAgICAgICAgY2hhcnRUeXBlOiBwYXJhbXMuY2hhcnRUeXBlLFxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogY29sb3IsXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBwYXJhbXMudGhlbWUuYm9yZGVyQ29sb3IsXG4gICAgICAgICAgICAgICAgICAgIGJvdW5kOiBib3VuZC5zdGFydCxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBpZiAocmVjdCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9iaW5kSG92ZXJFdmVudChyZWN0LCBib3VuZC5lbmQsIGdyb3VwSW5kZXgsIGluZGV4LCBwYXJhbXMuaW5DYWxsYmFjaywgcGFyYW1zLm91dENhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBiYXJzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICByZWN0OiByZWN0LFxuICAgICAgICAgICAgICAgICAgICBib3VuZDogYm91bmQuZW5kLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICB0aGlzLmJhcnMgPSBiYXJzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHJlY3QgcG9pbnRzLlxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOm51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBib3VuZCByZWN0IGJvdW5kXG4gICAgICogQHJldHVybnMge3tcbiAgICAgKiAgICAgIGxlZnRUb3A6IHtsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfSxcbiAgICAgKiAgICAgIHJpZ2h0VG9wOiB7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn0sXG4gICAgICogICAgICByaWdodEJvdHRvbToge2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9LFxuICAgICAqICAgICAgbGVmdEJvdHRvbToge2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9XG4gICAgICogfX0gcmVjdCBwb2ludHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlUmVjdFBvaW50czogZnVuY3Rpb24oYm91bmQpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxlZnRUb3A6IHtcbiAgICAgICAgICAgICAgICBsZWZ0OiBNYXRoLmNlaWwoYm91bmQubGVmdCksXG4gICAgICAgICAgICAgICAgdG9wOiBNYXRoLmNlaWwoYm91bmQudG9wKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJpZ2h0VG9wOiB7XG4gICAgICAgICAgICAgICAgbGVmdDogTWF0aC5jZWlsKGJvdW5kLmxlZnQgKyBib3VuZC53aWR0aCksXG4gICAgICAgICAgICAgICAgdG9wOiBNYXRoLmNlaWwoYm91bmQudG9wKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJpZ2h0Qm90dG9tOiB7XG4gICAgICAgICAgICAgICAgbGVmdDogTWF0aC5jZWlsKGJvdW5kLmxlZnQgKyBib3VuZC53aWR0aCksXG4gICAgICAgICAgICAgICAgdG9wOiBNYXRoLmNlaWwoYm91bmQudG9wICsgYm91bmQuaGVpZ2h0KVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGxlZnRCb3R0b206IHtcbiAgICAgICAgICAgICAgICBsZWZ0OiBNYXRoLmNlaWwoYm91bmQubGVmdCksXG4gICAgICAgICAgICAgICAgdG9wOiBNYXRoLmNlaWwoYm91bmQudG9wICsgYm91bmQuaGVpZ2h0KVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHRvcCBsaW5lIHBhdGguXG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYnJlciwgdG9wOiBudW1iZXJ9fSBsZWZ0VG9wIGxlZnQgdG9wXG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYnJlciwgdG9wOiBudW1iZXJ9fSByaWdodFRvcCByaWdodCB0b3BcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY2hhcnRUeXBlIGNoYXJ0IHR5cGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgdmFsdWVcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSB0b3AgbGluZSBwYXRoXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVRvcExpbmVQYXRoOiBmdW5jdGlvbihsZWZ0VG9wLCByaWdodFRvcCwgY2hhcnRUeXBlLCB2YWx1ZSkge1xuICAgICAgICB2YXIgY2xvbmVMZWZ0VG9wID0gdHVpLnV0aWwuZXh0ZW5kKHt9LCBsZWZ0VG9wKTtcbiAgICAgICAgY2xvbmVMZWZ0VG9wLmxlZnQgLT0gY2hhcnRUeXBlID09PSAnY29sdW1uJyB8fCB2YWx1ZSA8IDAgPyAxIDogMDtcbiAgICAgICAgcmV0dXJuIHJhcGhhZWxSZW5kZXJVdGlsLm1ha2VMaW5lUGF0aChjbG9uZUxlZnRUb3AsIHJpZ2h0VG9wKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBib3JkZXIgbGluZXMgcGF0aHMuXG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6bnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGJvdW5kIHJlY3QgYm91bmRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY2hhcnRUeXBlIGNoYXJ0IHR5cGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgdmFsdWVcbiAgICAgKiBAcmV0dXJucyB7e3RvcDogc3RyaW5nLCByaWdodDogc3RyaW5nLCBib3R0b206IHN0cmluZywgbGVmdDogc3RyaW5nfX0gcGF0aHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQm9yZGVyTGluZXNQYXRoczogZnVuY3Rpb24oYm91bmQsIGNoYXJ0VHlwZSwgdmFsdWUpIHtcbiAgICAgICAgdmFyIHBvaW50cyA9IHRoaXMuX21ha2VSZWN0UG9pbnRzKGJvdW5kKSxcbiAgICAgICAgICAgIHBhdGhzID0ge307XG5cbiAgICAgICAgaWYgKGNoYXJ0VHlwZSA9PT0gJ2JhcicgfHwgdmFsdWUgPj0gMCkge1xuICAgICAgICAgICAgcGF0aHMudG9wID0gdGhpcy5fbWFrZVRvcExpbmVQYXRoKHBvaW50cy5sZWZ0VG9wLCBwb2ludHMucmlnaHRUb3AsIGNoYXJ0VHlwZSwgdmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNoYXJ0VHlwZSA9PT0gJ2NvbHVtbicgfHwgdmFsdWUgPj0gMCkge1xuICAgICAgICAgICAgcGF0aHMucmlnaHQgPSByYXBoYWVsUmVuZGVyVXRpbC5tYWtlTGluZVBhdGgocG9pbnRzLnJpZ2h0VG9wLCBwb2ludHMucmlnaHRCb3R0b20pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNoYXJ0VHlwZSA9PT0gJ2JhcicgfHwgdmFsdWUgPCAwKSB7XG4gICAgICAgICAgICBwYXRocy5ib3R0b20gPSByYXBoYWVsUmVuZGVyVXRpbC5tYWtlTGluZVBhdGgocG9pbnRzLmxlZnRCb3R0b20sIHBvaW50cy5yaWdodEJvdHRvbSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2hhcnRUeXBlID09PSAnY29sdW1uJyB8fCB2YWx1ZSA8IDApIHtcbiAgICAgICAgICAgIHBhdGhzLmxlZnQgPSByYXBoYWVsUmVuZGVyVXRpbC5tYWtlTGluZVBhdGgocG9pbnRzLmxlZnRUb3AsIHBvaW50cy5sZWZ0Qm90dG9tKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXRocztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGJvcmRlciBsaW5lcztcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMucGFwZXIgcGFwZXJcbiAgICAgKiAgICAgIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOm51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBwYXJhbXMuYm91bmQgYmFyIGJvdW5kXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLmJvcmRlckNvbG9yIGJvcmRlciBjb2xvclxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5jaGFydFR5cGUgY2hhcnQgdHlwZVxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy52YWx1ZSB2YWx1ZVxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHJhcGhhZWwgb2JqZWN0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyQm9yZGVyTGluZXM6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgYm9yZGVyTGluZVBhdGhzID0gdGhpcy5fbWFrZUJvcmRlckxpbmVzUGF0aHMocGFyYW1zLmJvdW5kLCBwYXJhbXMuY2hhcnRUeXBlLCBwYXJhbXMudmFsdWUpLFxuICAgICAgICAgICAgbGluZXMgPSB7fTtcbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaChib3JkZXJMaW5lUGF0aHMsIGZ1bmN0aW9uKHBhdGgsIG5hbWUpIHtcbiAgICAgICAgICAgIGxpbmVzW25hbWVdID0gcmFwaGFlbFJlbmRlclV0aWwucmVuZGVyTGluZShwYXJhbXMucGFwZXIsIHBhdGgsIHBhcmFtcy5ib3JkZXJDb2xvciwgMSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gbGluZXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBiYXIgYm9yZGVycy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMucGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqICAgICAgQHBhcmFtIHt7Y29sb3JzOiBzdHJpbmdbXSwgc2luZ2xlQ29sb3JzOiBzdHJpbmdbXSwgYm9yZGVyQ29sb3I6IHN0cmluZ319IHBhcmFtcy50aGVtZSBiYXIgY2hhcnQgdGhlbWVcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPGFycmF5Ljx7bGVmdDogbnVtYmVyLCB0b3A6bnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn0+Pn0gcGFyYW1zLmdyb3VwQm91bmRzIGJvdW5kc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlckJhckJvcmRlcnM6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgYm9yZGVyQ29sb3IgPSBwYXJhbXMudGhlbWUuYm9yZGVyQ29sb3IsXG4gICAgICAgICAgICBib3JkZXJzID0gW107XG5cbiAgICAgICAgdGhpcy5ib3JkZXJzID0gYm9yZGVycztcblxuICAgICAgICBpZiAoIWJvcmRlckNvbG9yKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0dWkudXRpbC5mb3JFYWNoQXJyYXkocGFyYW1zLmdyb3VwQm91bmRzLCBmdW5jdGlvbihib3VuZHMsIGdyb3VwSW5kZXgpIHtcbiAgICAgICAgICAgIHR1aS51dGlsLmZvckVhY2hBcnJheShib3VuZHMsIGZ1bmN0aW9uKGJvdW5kLCBpbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciB2YWx1ZSwgYm9yZGVyTGluZXM7XG5cbiAgICAgICAgICAgICAgICBpZiAoIWJvdW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHBhcmFtcy5ncm91cFZhbHVlc1tncm91cEluZGV4XVtpbmRleF07XG4gICAgICAgICAgICAgICAgYm9yZGVyTGluZXMgPSB0aGlzLl9yZW5kZXJCb3JkZXJMaW5lcyh7XG4gICAgICAgICAgICAgICAgICAgIHBhcGVyOiBwYXJhbXMucGFwZXIsXG4gICAgICAgICAgICAgICAgICAgIGJvdW5kOiBib3VuZC5zdGFydCxcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IGJvcmRlckNvbG9yLFxuICAgICAgICAgICAgICAgICAgICBjaGFydFR5cGU6IHBhcmFtcy5jaGFydFR5cGUsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJvcmRlcnMucHVzaChib3JkZXJMaW5lcyk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFuaW1hdGUgcmVjdC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcmVjdCByYXBoYWVsIG9iamVjdFxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOm51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBib3VuZCByZWN0IGJvdW5kXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYW5pbWF0ZVJlY3Q6IGZ1bmN0aW9uKHJlY3QsIGJvdW5kKSB7XG4gICAgICAgIHJlY3QuYW5pbWF0ZSh7XG4gICAgICAgICAgICB4OiBib3VuZC5sZWZ0LFxuICAgICAgICAgICAgeTogYm91bmQudG9wLFxuICAgICAgICAgICAgd2lkdGg6IGJvdW5kLndpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBib3VuZC5oZWlnaHRcbiAgICAgICAgfSwgQU5JTUFUSU9OX1RJTUUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBbmltYXRlIGJvcmRlcnMuXG4gICAgICogQHBhcmFtIHthcnJheS48b2JqZWN0Pn0gbGluZXMgcmFwaGFlbCBvYmplY3RzXG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6bnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGJvdW5kIHJlY3QgYm91bmRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY2hhcnRUeXBlIGNoYXJ0IHR5cGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgdmFsdWVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hbmltYXRlQm9yZGVyczogZnVuY3Rpb24obGluZXMsIGJvdW5kLCBjaGFydFR5cGUsIHZhbHVlKSB7XG4gICAgICAgIHZhciBwYXRocyA9IHRoaXMuX21ha2VCb3JkZXJMaW5lc1BhdGhzKGJvdW5kLCBjaGFydFR5cGUsIHZhbHVlKTtcbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaChsaW5lcywgZnVuY3Rpb24obGluZSwgbmFtZSkge1xuICAgICAgICAgICAgbGluZS5hbmltYXRlKHtwYXRoOiBwYXRoc1tuYW1lXX0sIEFOSU1BVElPTl9USU1FKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFuaW1hdGUuXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgY2FsbGJhY2tcbiAgICAgKi9cbiAgICBhbmltYXRlOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICB0dWkudXRpbC5mb3JFYWNoKHRoaXMuYmFycywgZnVuY3Rpb24oYmFyLCBpbmRleCkge1xuICAgICAgICAgICAgdmFyIGxpbmVzID0gdGhpcy5ib3JkZXJzW2luZGV4XTtcbiAgICAgICAgICAgIHRoaXMuX2FuaW1hdGVSZWN0KGJhci5yZWN0LCBiYXIuYm91bmQpO1xuICAgICAgICAgICAgaWYgKGxpbmVzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYW5pbWF0ZUJvcmRlcnMobGluZXMsIGJhci5ib3VuZCwgdGhpcy5jaGFydFR5cGUsIGJhci52YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgc2V0VGltZW91dChjYWxsYmFjaywgQU5JTUFUSU9OX1RJTUUpO1xuICAgICAgICB9XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmFwaGFlbEJhckNoYXJ0O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFJhcGhhZWwgbGluZSBjaGFydCByZW5kZXJlci5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJhcGhhZWxMaW5lQmFzZSA9IHJlcXVpcmUoJy4vcmFwaGFlbExpbmVUeXBlQmFzZScpLFxuICAgIHJhcGhhZWxSZW5kZXJVdGlsID0gcmVxdWlyZSgnLi9yYXBoYWVsUmVuZGVyVXRpbCcpO1xuXG52YXIgUmFwaGFlbCA9IHdpbmRvdy5SYXBoYWVsLFxuICAgIEFOSU1BVElPTl9USU1FID0gNzAwO1xuXG4vKipcbiAqIEBjbGFzc2Rlc2MgUmFwaGFlbExpbmVDaGFydHMgaXMgZ3JhcGggcmVuZGVyZXIgZm9yIGxpbmUgY2hhcnQuXG4gKiBAY2xhc3MgUmFwaGFlbExpbmVDaGFydFxuICogQGV4dGVuZHMgUmFwaGFlbExpbmVUeXBlQmFzZVxuICovXG52YXIgUmFwaGFlbExpbmVDaGFydCA9IHR1aS51dGlsLmRlZmluZUNsYXNzKFJhcGhhZWxMaW5lQmFzZSwgLyoqIEBsZW5kcyBSYXBoYWVsTGluZUNoYXJ0LnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogUmVuZGVyIGZ1bmN0aW9uIG9mIGxpbmUgY2hhcnQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY29udGFpbmVyXG4gICAgICogQHBhcmFtIHt7Z3JvdXBQb3NpdGlvbnM6IGFycmF5LjxhcnJheT4sIGRpbWVuc2lvbjogb2JqZWN0LCB0aGVtZTogb2JqZWN0LCBvcHRpb25zOiBvYmplY3R9fSBkYXRhIHJlbmRlciBkYXRhXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gaW5DYWxsYmFjayBpbiBjYWxsYmFja1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG91dENhbGxiYWNrIG91dCBjYWxsYmFja1xuICAgICAqIEByZXR1cm4ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqL1xuICAgIHJlbmRlcjogZnVuY3Rpb24ocGFwZXIsIGNvbnRhaW5lciwgZGF0YSwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGRpbWVuc2lvbiA9IGRhdGEuZGltZW5zaW9uLFxuICAgICAgICAgICAgZ3JvdXBQb3NpdGlvbnMgPSBkYXRhLmdyb3VwUG9zaXRpb25zLFxuICAgICAgICAgICAgdGhlbWUgPSBkYXRhLnRoZW1lLFxuICAgICAgICAgICAgY29sb3JzID0gdGhlbWUuY29sb3JzLFxuICAgICAgICAgICAgb3BhY2l0eSA9IGRhdGEub3B0aW9ucy5oYXNEb3QgPyAxIDogMCxcbiAgICAgICAgICAgIGdyb3VwUGF0aHMgPSB0aGlzLl9nZXRMaW5lc1BhdGgoZ3JvdXBQb3NpdGlvbnMpLFxuICAgICAgICAgICAgYm9yZGVyU3R5bGUgPSB0aGlzLm1ha2VCb3JkZXJTdHlsZSh0aGVtZS5ib3JkZXJDb2xvciwgb3BhY2l0eSksXG4gICAgICAgICAgICBvdXREb3RTdHlsZSA9IHRoaXMubWFrZU91dERvdFN0eWxlKG9wYWNpdHksIGJvcmRlclN0eWxlKSxcbiAgICAgICAgICAgIGdyb3VwTGluZXMsIHRvb2x0aXBMaW5lLCBncm91cERvdHM7XG5cbiAgICAgICAgaWYgKCFwYXBlcikge1xuICAgICAgICAgICAgcGFwZXIgPSBSYXBoYWVsKGNvbnRhaW5lciwgZGltZW5zaW9uLndpZHRoLCBkaW1lbnNpb24uaGVpZ2h0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGdyb3VwTGluZXMgPSB0aGlzLl9yZW5kZXJMaW5lcyhwYXBlciwgZ3JvdXBQYXRocywgY29sb3JzKTtcbiAgICAgICAgdG9vbHRpcExpbmUgPSB0aGlzLl9yZW5kZXJUb29sdGlwTGluZShwYXBlciwgZGltZW5zaW9uLmhlaWdodCk7XG4gICAgICAgIGdyb3VwRG90cyA9IHRoaXMucmVuZGVyRG90cyhwYXBlciwgZ3JvdXBQb3NpdGlvbnMsIGNvbG9ycywgYm9yZGVyU3R5bGUpO1xuXG4gICAgICAgIHRoaXMuYm9yZGVyU3R5bGUgPSBib3JkZXJTdHlsZTtcbiAgICAgICAgdGhpcy5vdXREb3RTdHlsZSA9IG91dERvdFN0eWxlO1xuICAgICAgICB0aGlzLmdyb3VwUGF0aHMgPSBncm91cFBhdGhzO1xuICAgICAgICB0aGlzLmdyb3VwTGluZXMgPSBncm91cExpbmVzO1xuICAgICAgICB0aGlzLnRvb2x0aXBMaW5lID0gdG9vbHRpcExpbmU7XG4gICAgICAgIHRoaXMuZ3JvdXBEb3RzID0gZ3JvdXBEb3RzO1xuICAgICAgICB0aGlzLmRvdE9wYWNpdHkgPSBvcGFjaXR5O1xuXG4gICAgICAgIHRoaXMuYXR0YWNoRXZlbnQoZ3JvdXBEb3RzLCBncm91cFBvc2l0aW9ucywgb3V0RG90U3R5bGUsIGluQ2FsbGJhY2ssIG91dENhbGxiYWNrKTtcblxuICAgICAgICByZXR1cm4gcGFwZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBsaW5lcyBwYXRoLlxuICAgICAqIEBwYXJhbSB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gZ3JvdXBQb3NpdGlvbnMgcG9zaXRpb25zXG4gICAgICogQHJldHVybnMge2FycmF5LjxhcnJheS48c3RyaW5nPj59IHBhdGhzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0TGluZXNQYXRoOiBmdW5jdGlvbihncm91cFBvc2l0aW9ucykge1xuICAgICAgICB2YXIgZ3JvdXBQYXRocyA9IHR1aS51dGlsLm1hcChncm91cFBvc2l0aW9ucywgZnVuY3Rpb24ocG9zaXRpb25zKSB7XG4gICAgICAgICAgICB2YXIgZnJvbVBvcyA9IHBvc2l0aW9uc1swXSxcbiAgICAgICAgICAgICAgICByZXN0ID0gcG9zaXRpb25zLnNsaWNlKDEpO1xuICAgICAgICAgICAgcmV0dXJuIHR1aS51dGlsLm1hcChyZXN0LCBmdW5jdGlvbihwb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSB0aGlzLm1ha2VMaW5lUGF0aChmcm9tUG9zLCBwb3NpdGlvbik7XG4gICAgICAgICAgICAgICAgZnJvbVBvcyA9IHBvc2l0aW9uO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIHJldHVybiBncm91cFBhdGhzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgbGluZXMuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheS48c3RyaW5nPj59IGdyb3VwUGF0aHMgcGF0aHNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBjb2xvcnMgbGluZSBjb2xvcnNcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3Ryb2tlV2lkdGggc3Ryb2tlIHdpZHRoXG4gICAgICogQHJldHVybnMge2FycmF5LjxhcnJheS48b2JqZWN0Pj59IGxpbmVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyTGluZXM6IGZ1bmN0aW9uKHBhcGVyLCBncm91cFBhdGhzLCBjb2xvcnMsIHN0cm9rZVdpZHRoKSB7XG4gICAgICAgIHZhciBncm91cExpbmVzID0gdHVpLnV0aWwubWFwKGdyb3VwUGF0aHMsIGZ1bmN0aW9uKHBhdGhzLCBncm91cEluZGV4KSB7XG4gICAgICAgICAgICB2YXIgY29sb3IgPSBjb2xvcnNbZ3JvdXBJbmRleF0gfHwgJ3RyYW5zcGFyZW50JztcbiAgICAgICAgICAgIHJldHVybiB0dWkudXRpbC5tYXAocGF0aHMsIGZ1bmN0aW9uKHBhdGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmFwaGFlbFJlbmRlclV0aWwucmVuZGVyTGluZShwYXBlciwgcGF0aC5zdGFydCwgY29sb3IsIHN0cm9rZVdpZHRoKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICByZXR1cm4gZ3JvdXBMaW5lcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQW5pbWF0ZS5cbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayBjYWxsYmFja1xuICAgICAqL1xuICAgIGFuaW1hdGU6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBncm91cExpbmVzID0gdGhpcy5ncm91cExpbmVzLFxuICAgICAgICAgICAgZ3JvdXBQYXRocyA9IHRoaXMuZ3JvdXBQYXRocyxcbiAgICAgICAgICAgIGJvcmRlclN0eWxlID0gdGhpcy5ib3JkZXJTdHlsZSxcbiAgICAgICAgICAgIG9wYWNpdHkgPSB0aGlzLmRvdE9wYWNpdHksXG4gICAgICAgICAgICB0aW1lID0gQU5JTUFUSU9OX1RJTUUgLyBncm91cExpbmVzWzBdLmxlbmd0aCxcbiAgICAgICAgICAgIHN0YXJ0VGltZTtcbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaEFycmF5KHRoaXMuZ3JvdXBEb3RzLCBmdW5jdGlvbihkb3RzLCBncm91cEluZGV4KSB7XG4gICAgICAgICAgICBzdGFydFRpbWUgPSAwO1xuICAgICAgICAgICAgdHVpLnV0aWwuZm9yRWFjaEFycmF5KGRvdHMsIGZ1bmN0aW9uKGRvdCwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgbGluZSwgcGF0aDtcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgbGluZSA9IGdyb3VwTGluZXNbZ3JvdXBJbmRleF1baW5kZXggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgcGF0aCA9IGdyb3VwUGF0aHNbZ3JvdXBJbmRleF1baW5kZXggLSAxXS5lbmQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYW5pbWF0ZUxpbmUobGluZSwgcGF0aCwgdGltZSwgc3RhcnRUaW1lKTtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRUaW1lICs9IHRpbWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKG9wYWNpdHkpIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvdC5hdHRyKHR1aS51dGlsLmV4dGVuZCh7J2ZpbGwtb3BhY2l0eSc6IG9wYWNpdHl9LCBib3JkZXJTdHlsZSkpO1xuICAgICAgICAgICAgICAgICAgICB9LCBzdGFydFRpbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoY2FsbGJhY2ssIHN0YXJ0VGltZSk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSYXBoYWVsTGluZUNoYXJ0O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFJhcGhhZWxMaW5lVHlwZUJhc2UgaXMgYmFzZSBjbGFzcyBmb3IgbGluZSB0eXBlIHJlbmRlcmVyLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgcmFwaGFlbFJlbmRlclV0aWwgPSByZXF1aXJlKCcuL3JhcGhhZWxSZW5kZXJVdGlsJyk7XG5cbnZhciBERUZBVUxUX0RPVF9XSURUSCA9IDMsXG4gICAgSE9WRVJfRE9UX1dJRFRIID0gNDtcblxuLyoqXG4gKiBAY2xhc3NkZXNjIFJhcGhhZWxMaW5lVHlwZUJhc2UgaXMgYmFzZSBmb3IgbGluZSB0eXBlIHJlbmRlcmVyLlxuICogQGNsYXNzIFJhcGhhZWxMaW5lVHlwZUJhc2VcbiAqL1xudmFyIFJhcGhhZWxMaW5lVHlwZUJhc2UgPSB0dWkudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIFJhcGhhZWxMaW5lVHlwZUJhc2UucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGxpbmUgcGF0aHMuXG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IGZyb21Qb3MgZnJvbSBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSB0b1BvcyB0byBwb3NpdGlvblxuICAgICAqIEByZXR1cm5zIHt7c3RhcnQ6IHN0cmluZywgZW5kOiBzdHJpbmd9fSBsaW5lIHBhdGhzLlxuICAgICAqL1xuICAgIG1ha2VMaW5lUGF0aDogZnVuY3Rpb24oZnJvbVBvcywgdG9Qb3MpIHtcbiAgICAgICAgdmFyIHN0YXJ0TGluZVBhdGggPSByYXBoYWVsUmVuZGVyVXRpbC5tYWtlTGluZVBhdGgoZnJvbVBvcywgZnJvbVBvcyksXG4gICAgICAgICAgICBlbmRMaW5lUGF0aCA9IHJhcGhhZWxSZW5kZXJVdGlsLm1ha2VMaW5lUGF0aChmcm9tUG9zLCB0b1Bvcyk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdGFydDogc3RhcnRMaW5lUGF0aCxcbiAgICAgICAgICAgIGVuZDogZW5kTGluZVBhdGhcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIHRvb2x0aXAgbGluZS5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgaGVpZ2h0XG4gICAgICogQHJldHVybnMge29iamVjdH0gcmFwaGFlbCBvYmplY3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJUb29sdGlwTGluZTogZnVuY3Rpb24ocGFwZXIsIGhlaWdodCkge1xuICAgICAgICB2YXIgbGluZVBhdGggPSByYXBoYWVsUmVuZGVyVXRpbC5tYWtlTGluZVBhdGgoe1xuICAgICAgICAgICAgICAgIGxlZnQ6IDEwLFxuICAgICAgICAgICAgICAgIHRvcDogaGVpZ2h0XG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgbGVmdDogMTAsXG4gICAgICAgICAgICAgICAgdG9wOiAwXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJhcGhhZWxSZW5kZXJVdGlsLnJlbmRlckxpbmUocGFwZXIsIGxpbmVQYXRoLCAndHJhbnNwYXJlbnQnLCAxKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBib3JkZXIgc3R5bGUuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGJvcmRlckNvbG9yIGJvcmRlciBjb2xvclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBvcGFjaXR5IG9wYWNpdHlcbiAgICAgKiBAcmV0dXJucyB7e3N0cm9rZTogc3RyaW5nLCBzdHJva2Utd2lkdGg6IG51bWJlciwgc3RyaWtlLW9wYWNpdHk6IG51bWJlcn19IGJvcmRlciBzdHlsZVxuICAgICAqL1xuICAgIG1ha2VCb3JkZXJTdHlsZTogZnVuY3Rpb24oYm9yZGVyQ29sb3IsIG9wYWNpdHkpIHtcbiAgICAgICAgdmFyIGJvcmRlclN0eWxlO1xuICAgICAgICBpZiAoYm9yZGVyQ29sb3IpIHtcbiAgICAgICAgICAgIGJvcmRlclN0eWxlID0ge1xuICAgICAgICAgICAgICAgIHN0cm9rZTogYm9yZGVyQ29sb3IsXG4gICAgICAgICAgICAgICAgJ3N0cm9rZS13aWR0aCc6IDEsXG4gICAgICAgICAgICAgICAgJ3N0cm9rZS1vcGFjaXR5Jzogb3BhY2l0eVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYm9yZGVyU3R5bGU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgZG90IHN0eWxlIGZvciBtb3VzZW91dCBldmVudC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gb3BhY2l0eSBvcGFjaXR5XG4gICAgICogQHBhcmFtIHtvYmplY3R9IGJvcmRlclN0eWxlIGJvcmRlciBzdHlsZVxuICAgICAqIEByZXR1cm5zIHt7ZmlsbC1vcGFjaXR5OiBudW1iZXIsIHN0cm9rZS1vcGFjaXR5OiBudW1iZXIsIHI6IG51bWJlcn19IHN0eWxlXG4gICAgICovXG4gICAgbWFrZU91dERvdFN0eWxlOiBmdW5jdGlvbihvcGFjaXR5LCBib3JkZXJTdHlsZSkge1xuICAgICAgICB2YXIgb3V0RG90U3R5bGUgPSB7XG4gICAgICAgICAgICAnZmlsbC1vcGFjaXR5Jzogb3BhY2l0eSxcbiAgICAgICAgICAgICdzdHJva2Utb3BhY2l0eSc6IDAsXG4gICAgICAgICAgICByOiBERUZBVUxUX0RPVF9XSURUSFxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChib3JkZXJTdHlsZSkge1xuICAgICAgICAgICAgdHVpLnV0aWwuZXh0ZW5kKG91dERvdFN0eWxlLCBib3JkZXJTdHlsZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gb3V0RG90U3R5bGU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBkb3QuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIHJhcGhhZWwgcGFwYWVyXG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IHBvc2l0aW9uIGRvdCBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb2xvciBkb3QgY29sb3JcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYm9yZGVyU3R5bGUgYm9yZGVyIHN0eWxlXG4gICAgICogQHJldHVybnMge29iamVjdH0gcmFwaGFlbCBkb3RcbiAgICAgKi9cbiAgICByZW5kZXJEb3Q6IGZ1bmN0aW9uKHBhcGVyLCBwb3NpdGlvbiwgY29sb3IpIHtcbiAgICAgICAgdmFyIGRvdCA9IHBhcGVyLmNpcmNsZShwb3NpdGlvbi5sZWZ0LCBwb3NpdGlvbi50b3AsIERFRkFVTFRfRE9UX1dJRFRIKSxcbiAgICAgICAgICAgIGRvdFN0eWxlID0ge1xuICAgICAgICAgICAgICAgIGZpbGw6IGNvbG9yLFxuICAgICAgICAgICAgICAgICdmaWxsLW9wYWNpdHknOiAwLFxuICAgICAgICAgICAgICAgICdzdHJva2Utb3BhY2l0eSc6IDBcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgZG90LmF0dHIoZG90U3R5bGUpO1xuXG4gICAgICAgIHJldHVybiBkb3Q7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBkb3RzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXkuPG9iamVjdD4+fSBncm91cFBvc2l0aW9ucyBwb3NpdGlvbnNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBjb2xvcnMgY29sb3JzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGJvcmRlclN0eWxlIGJvcmRlciBzdHlsZVxuICAgICAqIEByZXR1cm5zIHthcnJheS48b2JqZWN0Pn0gZG90c1xuICAgICAqL1xuICAgIHJlbmRlckRvdHM6IGZ1bmN0aW9uKHBhcGVyLCBncm91cFBvc2l0aW9ucywgY29sb3JzKSB7XG4gICAgICAgIHZhciBkb3RzID0gdHVpLnV0aWwubWFwKGdyb3VwUG9zaXRpb25zLCBmdW5jdGlvbihwb3NpdGlvbnMsIGdyb3VwSW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBjb2xvciA9IGNvbG9yc1tncm91cEluZGV4XTtcbiAgICAgICAgICAgIHJldHVybiB0dWkudXRpbC5tYXAocG9zaXRpb25zLCBmdW5jdGlvbihwb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIHZhciBkb3QgPSB0aGlzLnJlbmRlckRvdChwYXBlciwgcG9zaXRpb24sIGNvbG9yKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZG90O1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIHJldHVybiBkb3RzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgY2VudGVyIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IGZyb21Qb3MgZnJvbSBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSB0b1BvcyB0byBwb3NpdGlvblxuICAgICAqIEByZXR1cm5zIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IHBvc2l0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0Q2VudGVyOiBmdW5jdGlvbihmcm9tUG9zLCB0b1Bvcykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbGVmdDogKGZyb21Qb3MubGVmdCArIHRvUG9zLmxlZnQpIC8gMixcbiAgICAgICAgICAgIHRvcDogKGZyb21Qb3MudG9wICsgdG9Qb3MudG9wKSAvIDJcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQmluZCBob3ZlciBldmVudC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZG90IHJhcGhhZWwgb2JlamN0XG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IHBvc2l0aW9uIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGdyb3VwSW5kZXggZ3JvdXAgaW5kZXhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggaW5kZXhcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBpbkNhbGxiYWNrIGluIGNhbGxiYWNrXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gb3V0Q2FsbGJhY2sgb3V0IGNhbGxiYWNrXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYmluZEhvdmVyRXZlbnQ6IGZ1bmN0aW9uKGRvdCwgcG9zaXRpb24sIGdyb3VwSW5kZXgsIGluZGV4LCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjaykge1xuICAgICAgICBkb3QuaG92ZXIoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpbkNhbGxiYWNrKHBvc2l0aW9uLCBpbmRleCwgZ3JvdXBJbmRleCk7XG4gICAgICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgb3V0Q2FsbGJhY2soKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCBldmVudC5cbiAgICAgKiBAcGFyYW0ge2FycmF5LjxhcnJheS48b2JqZWN0Pj59IGdyb3VwRG90cyBkb3RzXG4gICAgICogQHBhcmFtIHthcnJheS48YXJyYXkuPG9iamVjdD4+fSBncm91cFBvc2l0aW9ucyBwb3NpdGlvbnNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3V0RG90U3R5bGUgZG90IHN0eWxlXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gaW5DYWxsYmFjayBpbiBjYWxsYmFja1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG91dENhbGxiYWNrIG91dCBjYWxsYmFja1xuICAgICAqL1xuICAgIGF0dGFjaEV2ZW50OiBmdW5jdGlvbihncm91cERvdHMsIGdyb3VwUG9zaXRpb25zLCBvdXREb3RTdHlsZSwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spIHtcbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaChncm91cERvdHMsIGZ1bmN0aW9uKGRvdHMsIGdyb3VwSW5kZXgpIHtcbiAgICAgICAgICAgIHR1aS51dGlsLmZvckVhY2goZG90cywgZnVuY3Rpb24oZG90LCBpbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciBwb3NpdGlvbiA9IGdyb3VwUG9zaXRpb25zW2dyb3VwSW5kZXhdW2luZGV4XTtcbiAgICAgICAgICAgICAgICB0aGlzLl9iaW5kSG92ZXJFdmVudChkb3QsIHBvc2l0aW9uLCBncm91cEluZGV4LCBpbmRleCwgaW5DYWxsYmFjaywgb3V0Q2FsbGJhY2spO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTaG93IGRvdC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZG90IHJhcGhhZWwgb2JqZWN0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2hvd0RvdDogZnVuY3Rpb24oZG90KSB7XG4gICAgICAgIGRvdC5hdHRyKHtcbiAgICAgICAgICAgICdmaWxsLW9wYWNpdHknOiAxLFxuICAgICAgICAgICAgJ3N0cm9rZS1vcGFjaXR5JzogMC4zLFxuICAgICAgICAgICAgJ3N0cm9rZS13aWR0aCc6IDIsXG4gICAgICAgICAgICByOiBIT1ZFUl9ET1RfV0lEVEhcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNob3cgYW5pbWF0aW9uLlxuICAgICAqIEBwYXJhbSB7e2dyb3VwSW5kZXg6IG51bWJlciwgaW5kZXg6bnVtYmVyfX0gZGF0YSBzaG93IGluZm9cbiAgICAgKi9cbiAgICBzaG93QW5pbWF0aW9uOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBpbmRleCA9IGRhdGEuZ3JvdXBJbmRleCwgLy8gTGluZSBjaGFydCBoYXMgcGl2b3QgdmFsdWVzLlxuICAgICAgICAgICAgZ3JvdXBJbmRleCA9IGRhdGEuaW5kZXgsXG4gICAgICAgICAgICBkb3QgPSB0aGlzLmdyb3VwRG90c1tncm91cEluZGV4XVtpbmRleF07XG4gICAgICAgIHRoaXMuX3Nob3dEb3QoZG90KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHBpdm90IGdyb3VwIGRvdHMuXG4gICAgICogQHJldHVybnMge2FycmF5LjxhcnJheT59IGRvdHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRQaXZvdEdyb3VwRG90czogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghdGhpcy5waXZvdEdyb3VwRG90cykge1xuICAgICAgICAgICAgdGhpcy5waXZvdEdyb3VwRG90cyA9IHR1aS51dGlsLnBpdm90KHRoaXMuZ3JvdXBEb3RzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLnBpdm90R3JvdXBEb3RzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTaG93IGdyb3VwIGRvdHMuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IGluZGV4XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2hvd0dyb3VwRG90czogZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgdmFyIGRvdHMgPSB0aGlzLl9nZXRQaXZvdEdyb3VwRG90cygpO1xuICAgICAgICB0dWkudXRpbC5mb3JFYWNoQXJyYXkoZG90c1tpbmRleF0sIHR1aS51dGlsLmJpbmQodGhpcy5fc2hvd0RvdCwgdGhpcykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTaG93IHRvb2x0aXAgbGluZS5cbiAgICAgKiBAcGFyYW0ge3tcbiAgICAgKiAgICAgIGRpbWVuc2lvbjoge3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfSxcbiAgICAgKiAgICAgIHBvc2l0aW9uOiB7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn1cbiAgICAgKiB9fSBib3VuZCBib3VuZFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3Nob3dUb29sdGlwTGluZTogZnVuY3Rpb24oYm91bmQpIHtcbiAgICAgICAgdmFyIGxpbmVQYXRoID0gcmFwaGFlbFJlbmRlclV0aWwubWFrZUxpbmVQYXRoKHtcbiAgICAgICAgICAgIGxlZnQ6IGJvdW5kLnBvc2l0aW9uLmxlZnQsXG4gICAgICAgICAgICB0b3A6IGJvdW5kLmRpbWVuc2lvbi5oZWlnaHRcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgbGVmdDogYm91bmQucG9zaXRpb24ubGVmdCxcbiAgICAgICAgICAgIHRvcDogYm91bmQucG9zaXRpb24udG9wXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnRvb2x0aXBMaW5lLmF0dHIoe1xuICAgICAgICAgICAgcGF0aDogbGluZVBhdGgsXG4gICAgICAgICAgICBzdHJva2U6ICcjOTk5JyxcbiAgICAgICAgICAgICdzdHJva2Utb3BhY2l0eSc6IDFcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNob3cgZ3JvdXAgYW5pbWF0aW9uLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBpbmRleFxuICAgICAqIEBwYXJhbSB7e1xuICAgICAqICAgICAgZGltZW5zaW9uOiB7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9LFxuICAgICAqICAgICAgcG9zaXRpb246IHtsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfVxuICAgICAqIH19IGJvdW5kIGJvdW5kXG4gICAgICovXG4gICAgc2hvd0dyb3VwQW5pbWF0aW9uOiBmdW5jdGlvbihpbmRleCwgYm91bmQpIHtcbiAgICAgICAgdGhpcy5fc2hvd0dyb3VwRG90cyhpbmRleCk7XG4gICAgICAgIHRoaXMuX3Nob3dUb29sdGlwTGluZShib3VuZCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhpZGUgZG90LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBkb3QgcmFwaGFlbCBvYmplY3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9oaWRlRG90OiBmdW5jdGlvbihkb3QpIHtcbiAgICAgICAgZG90LmF0dHIodGhpcy5vdXREb3RTdHlsZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhpZGUgYW5pbWF0aW9uLlxuICAgICAqIEBwYXJhbSB7e2dyb3VwSW5kZXg6IG51bWJlciwgaW5kZXg6bnVtYmVyfX0gZGF0YSBoaWRlIGluZm9cbiAgICAgKi9cbiAgICBoaWRlQW5pbWF0aW9uOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBpbmRleCA9IGRhdGEuZ3JvdXBJbmRleCwgLy8gTGluZSBjaGFydCBoYXMgcGl2b3QgdmFsdWVzLlxuICAgICAgICAgICAgZ3JvdXBJbmRleCA9IGRhdGEuaW5kZXgsXG4gICAgICAgICAgICBkb3QgPSB0aGlzLmdyb3VwRG90c1tncm91cEluZGV4XVtpbmRleF07XG4gICAgICAgIGlmIChkb3QpIHtcbiAgICAgICAgICAgIHRoaXMuX2hpZGVEb3QoZG90KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBIaWRlIGdyb3VwIGRvdHMuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IGluZGV4XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaGlkZUdyb3VwRG90czogZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgdmFyIGRvdHMgPSB0aGlzLl9nZXRQaXZvdEdyb3VwRG90cygpO1xuICAgICAgICB0dWkudXRpbC5mb3JFYWNoQXJyYXkoZG90c1tpbmRleF0sIHR1aS51dGlsLmJpbmQodGhpcy5faGlkZURvdCwgdGhpcykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBIaWRlIHRvb2x0aXAgbGluZS5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9oaWRlVG9vbHRpcExpbmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnRvb2x0aXBMaW5lLmF0dHIoe1xuICAgICAgICAgICAgJ3N0cm9rZS1vcGFjaXR5JzogMFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSGlkZSBncm91cCBhbmltYXRpb24uXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IGluZGV4XG4gICAgICovXG4gICAgaGlkZUdyb3VwQW5pbWF0aW9uOiBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICB0aGlzLl9oaWRlR3JvdXBEb3RzKGluZGV4KTtcbiAgICAgICAgdGhpcy5faGlkZVRvb2x0aXBMaW5lKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFuaW1hdGUgbGluZS5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gbGluZSByYXBoYWVsIG9iamVjdFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBsaW5lUGF0aCBsaW5lIHBhdGhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdGltZSBwbGF5IHRpbWVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3RhcnRUaW1lIHN0YXJ0IHRpbWVcbiAgICAgKi9cbiAgICBhbmltYXRlTGluZTogZnVuY3Rpb24obGluZSwgbGluZVBhdGgsIHRpbWUsIHN0YXJ0VGltZSkge1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbGluZS5hbmltYXRlKHtwYXRoOiBsaW5lUGF0aH0sIHRpbWUpO1xuICAgICAgICB9LCBzdGFydFRpbWUpO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhcGhhZWxMaW5lVHlwZUJhc2U7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgUmFwaGFlbFBpZUNoYXJ0cyBpcyBncmFwaCByZW5kZXJlciBmb3IgcGllIGNoYXJ0LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgcmFwaGFlbFJlbmRlclV0aWwgPSByZXF1aXJlKCcuL3JhcGhhZWxSZW5kZXJVdGlsJyk7XG5cbnZhciBSYXBoYWVsID0gd2luZG93LlJhcGhhZWwsXG4gICAgQU5HTEVfMTgwID0gMTgwLFxuICAgIFJBRCA9IE1hdGguUEkgLyBBTkdMRV8xODAsXG4gICAgQU5JTUFUSU9OX1RJTUUgPSA1MDAsXG4gICAgTE9BRElOR19BTklNQVRJT05fVElNRSA9IDcwMDtcblxuLyoqXG4gKiBAY2xhc3NkZXNjIFJhcGhhZWxQaWVDaGFydHMgaXMgZ3JhcGggcmVuZGVyZXIgZm9yIHBpZSBjaGFydC5cbiAqIEBjbGFzcyBSYXBoYWVsUGllQ2hhcnRcbiAqL1xudmFyIFJhcGhhZWxQaWVDaGFydCA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgUmFwaGFlbFBpZUNoYXJ0LnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogUmVuZGVyIGZ1bmN0aW9uIG9mIHBpZSBjaGFydC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciBjb250YWluZXJcbiAgICAgKiBAcGFyYW0ge3tzZWN0b3JzSW5mbzogYXJyYXkuPG9iamVjdD4sIGNpcmNsZUJvdW5kOiB7Y3g6IG51bWJlciwgY3k6IG51bWJlciwgcjogbnVtYmVyfSwgZGltZW5zaW9uOiBvYmplY3QsIHRoZW1lOiBvYmplY3QsIG9wdGlvbnM6IG9iamVjdH19IGRhdGEgcmVuZGVyIGRhdGFcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBpbkNhbGxiYWNrIGluIGNhbGxiYWNrXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gb3V0Q2FsbGJhY2sgb3V0IGNhbGxiYWNrXG4gICAgICogQHJldHVybiB7b2JqZWN0fSBwYXBlciByYXBoYWVsIHBhcGVyXG4gICAgICovXG4gICAgcmVuZGVyOiBmdW5jdGlvbihwYXBlciwgY29udGFpbmVyLCBkYXRhLCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjaykge1xuICAgICAgICB2YXIgZGltZW5zaW9uID0gZGF0YS5kaW1lbnNpb247XG5cbiAgICAgICAgaWYgKCFwYXBlcikge1xuICAgICAgICAgICAgcGFwZXIgPSBSYXBoYWVsKGNvbnRhaW5lciwgZGltZW5zaW9uLndpZHRoLCBkaW1lbnNpb24uaGVpZ2h0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghcGFwZXIuY3VzdG9tQXR0cmlidXRlcy5zZWN0b3IpIHtcbiAgICAgICAgICAgIHBhcGVyLmN1c3RvbUF0dHJpYnV0ZXMuc2VjdG9yID0gdHVpLnV0aWwuYmluZCh0aGlzLl9tYWtlU2VjdG9yUGF0aCwgdGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNpcmNsZUJvdW5kID0gZGF0YS5jaXJjbGVCb3VuZDtcbiAgICAgICAgdGhpcy5fcmVuZGVyUGllKHBhcGVyLCBkYXRhLCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjayk7XG5cbiAgICAgICAgcmV0dXJuIHBhcGVyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHNlY3RvciBwYXRoLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjeCBjZW50ZXIgeFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjeSBjZW50ZXIgeVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSByIHJhZGl1c1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdGFydEFuZ2xlIHN0YXJ0IGFuZ2xlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGVuZEFuZ2xlIGVuZCBhbmdlbFxuICAgICAqIEByZXR1cm5zIHt7cGF0aDogYXJyYXl9fSBzZWN0b3IgcGF0aFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VTZWN0b3JQYXRoOiBmdW5jdGlvbihjeCwgY3ksIHIsIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlKSB7XG4gICAgICAgIHZhciB4MSA9IGN4ICsgciAqIE1hdGguc2luKHN0YXJ0QW5nbGUgKiBSQUQpLCAvLyDsm5Ag7Zi47J2YIOyLnOyekSB4IOyijO2RnFxuICAgICAgICAgICAgeTEgPSBjeSAtIHIgKiBNYXRoLmNvcyhzdGFydEFuZ2xlICogUkFEKSwgLy8g7JuQIO2YuOydmCDsi5zsnpEgeSDsooztkZxcbiAgICAgICAgICAgIHgyID0gY3ggKyByICogTWF0aC5zaW4oZW5kQW5nbGUgKiBSQUQpLC8vIOybkCDtmLjsnZgg7KKF66OMIHgg7KKM7ZGcXG4gICAgICAgICAgICB5MiA9IGN5IC0gciAqIE1hdGguY29zKGVuZEFuZ2xlICogUkFEKSwgLy8g7JuQIO2YuOydmCDsooXro4wgeSDsooztkZxcbiAgICAgICAgICAgIGxhcmdlQXJjRmxhZyA9IGVuZEFuZ2xlIC0gc3RhcnRBbmdsZSA+IEFOR0xFXzE4MCA/IDEgOiAwLFxuICAgICAgICAgICAgcGF0aCA9IFtcIk1cIiwgY3gsIGN5LFxuICAgICAgICAgICAgICAgIFwiTFwiLCB4MSwgeTEsXG4gICAgICAgICAgICAgICAgXCJBXCIsIHIsIHIsIDAsIGxhcmdlQXJjRmxhZywgMSwgeDIsIHkyLFxuICAgICAgICAgICAgICAgIFwiWlwiXG4gICAgICAgICAgICBdO1xuICAgICAgICAvLyBwYXRo7JeQIOuMgO2VnCDsnpDshLjtlZwg7ISk66qF7J2AIOyVhOuemCDrp4Htgazrpbwg7LC46rOgXG4gICAgICAgIC8vIGh0dHA6Ly93d3cudzNzY2hvb2xzLmNvbS9zdmcvc3ZnX3BhdGguYXNwXG4gICAgICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL1NWRy9BdHRyaWJ1dGUvZFxuICAgICAgICByZXR1cm4ge3BhdGg6IHBhdGh9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgc2VjdG9yXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKiAgICAgIEBwYXJhbSB7e2N4OiBudW1iZXIsIGN5OiBudW1iZXIsIHI6bnVtYmVyfX0gcGFyYW1zLmNpcmNsZUJvdW5kIGNpcmNsZSBib3VuZHNcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuc3RhcnRBbmdsZSBzdGFydCBhbmdsZVxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5lbmRBbmdsZSBlbmQgYW5nbGVcbiAgICAgKiAgICAgIEBwYXJhbSB7e2ZpbGw6IHN0cmluZywgc3Ryb2tlOiBzdHJpbmcsIHN0cmlrZS13aWR0aDogc3RyaW5nfX0gcGFyYW1zLmF0dHJzIGF0dHJzXG4gICAgICogQHJldHVybnMge29iamVjdH0gcmFwaGFlbCBvYmplY3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJTZWN0b3I6IGZ1bmN0aW9uIChwYXJhbXMpIHtcbiAgICAgICAgdmFyIGNpcmNsZUJvdW5kID0gcGFyYW1zLmNpcmNsZUJvdW5kLFxuICAgICAgICAgICAgYW5nbGVzID0gcGFyYW1zLmFuZ2xlcztcbiAgICAgICAgcmV0dXJuIHBhcmFtcy5wYXBlci5wYXRoKCkuYXR0cih7XG4gICAgICAgICAgICBzZWN0b3I6IFtjaXJjbGVCb3VuZC5jeCwgY2lyY2xlQm91bmQuY3ksIGNpcmNsZUJvdW5kLnIsIGFuZ2xlcy5zdGFydEFuZ2xlLCBhbmdsZXMuZW5kQW5nbGVdXG4gICAgICAgIH0pLmF0dHIocGFyYW1zLmF0dHJzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIHBpZSBncmFwaC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgcmFwaGFlbCBwYXBlclxuICAgICAqIEBwYXJhbSB7e3NlY3RvcnNJbmZvOiBhcnJheS48b2JqZWN0PiwgY2lyY2xlQm91bmQ6IHtjeDogbnVtYmVyLCBjeTogbnVtYmVyLCByOiBudW1iZXJ9LCBkaW1lbnNpb246IG9iamVjdCwgdGhlbWU6IG9iamVjdCwgb3B0aW9uczogb2JqZWN0fX0gZGF0YSByZW5kZXIgZGF0YVxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGluQ2FsbGJhY2sgaW4gY2FsbGJhY2tcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvdXRDYWxsYmFjayBvdXQgY2FsbGJhY2tcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJQaWU6IGZ1bmN0aW9uKHBhcGVyLCBkYXRhLCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjaykge1xuICAgICAgICB2YXIgY2lyY2xlQm91bmQgPSBkYXRhLmNpcmNsZUJvdW5kLFxuICAgICAgICAgICAgY29sb3JzID0gZGF0YS50aGVtZS5jb2xvcnMsXG4gICAgICAgICAgICBjaGFydEJhY2tncm91bmQgPSBkYXRhLmNoYXJ0QmFja2dyb3VuZCxcbiAgICAgICAgICAgIHNlY3RvcnMgPSBbXTtcblxuICAgICAgICB0dWkudXRpbC5mb3JFYWNoQXJyYXkoZGF0YS5zZWN0b3JzSW5mbywgZnVuY3Rpb24oc2VjdG9ySW5mbywgaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBwZXJjZW50VmFsdWUgPSBzZWN0b3JJbmZvLnBlcmNlbnRWYWx1ZSxcbiAgICAgICAgICAgICAgICBjb2xvciA9IGNvbG9yc1tpbmRleF0sXG4gICAgICAgICAgICAgICAgc2VjdG9yID0gdGhpcy5fcmVuZGVyU2VjdG9yKHtcbiAgICAgICAgICAgICAgICAgICAgcGFwZXI6IHBhcGVyLFxuICAgICAgICAgICAgICAgICAgICBjaXJjbGVCb3VuZDogY2lyY2xlQm91bmQsXG4gICAgICAgICAgICAgICAgICAgIGFuZ2xlczogc2VjdG9ySW5mby5hbmdsZXMuc3RhcnQsXG4gICAgICAgICAgICAgICAgICAgIGF0dHJzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxsOiBjb2xvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cm9rZTogY2hhcnRCYWNrZ3JvdW5kLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3N0cm9rZS13aWR0aCc6IDFcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLl9iaW5kSG92ZXJFdmVudCh7XG4gICAgICAgICAgICAgICAgdGFyZ2V0OiBzZWN0b3IsXG4gICAgICAgICAgICAgICAgcG9zaXRpb246IHNlY3RvckluZm8ucG9wdXBQb3NpdGlvbixcbiAgICAgICAgICAgICAgICBpbmRleDogaW5kZXgsXG4gICAgICAgICAgICAgICAgaW5DYWxsYmFjazogaW5DYWxsYmFjayxcbiAgICAgICAgICAgICAgICBvdXRDYWxsYmFjazogb3V0Q2FsbGJhY2tcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBzZWN0b3JzLnB1c2goe1xuICAgICAgICAgICAgICAgIHNlY3Rvcjogc2VjdG9yLFxuICAgICAgICAgICAgICAgIGFuZ2xlczogc2VjdG9ySW5mby5hbmdsZXMuZW5kLFxuICAgICAgICAgICAgICAgIHBlcmNlbnRWYWx1ZTogcGVyY2VudFZhbHVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgdGhpcy5zZWN0b3JzID0gc2VjdG9ycztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGxlZ2VuZCBsaW5lcy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFwZXIgcGFwZXJcbiAgICAgKiBAcGFyYW0ge2FycmF5LjxvYmplY3Q+fSBvdXRlclBvc2l0aW9ucyBvdXRlciBwb3NpdGlvblxuICAgICAqL1xuICAgIHJlbmRlckxlZ2VuZExpbmVzOiBmdW5jdGlvbihwYXBlciwgb3V0ZXJQb3NpdGlvbnMpIHtcbiAgICAgICAgdmFyIHBhdGhzID0gdGhpcy5fbWFrZUxpbmVQYXRocyhvdXRlclBvc2l0aW9ucyksXG4gICAgICAgICAgICBsZWdlbmRMaW5lcyA9IHR1aS51dGlsLm1hcChwYXRocywgZnVuY3Rpb24ocGF0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiByYXBoYWVsUmVuZGVyVXRpbC5yZW5kZXJMaW5lKHBhcGVyLCBwYXRoLCAndHJhbnNwYXJlbnQnLCAxKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB0aGlzLmxlZ2VuZExpbmVzID0gbGVnZW5kTGluZXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgbGluZSBwYXRocy5cbiAgICAgKiBAcGFyYW0ge2FycmF5LjxvYmplY3Q+fSBvdXRlclBvc2l0aW9ucyBvdXRlciBwb3NpdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IGxpbmUgcGF0aHMuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUxpbmVQYXRoczogZnVuY3Rpb24ob3V0ZXJQb3NpdGlvbnMpIHtcbiAgICAgICAgdmFyIHBhdGhzID0gdHVpLnV0aWwubWFwKG91dGVyUG9zaXRpb25zLCBmdW5jdGlvbihwb3NpdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgcmFwaGFlbFJlbmRlclV0aWwubWFrZUxpbmVQYXRoKHBvc2l0aW9ucy5zdGFydCwgcG9zaXRpb25zLm1pZGRsZSksXG4gICAgICAgICAgICAgICAgcmFwaGFlbFJlbmRlclV0aWwubWFrZUxpbmVQYXRoKHBvc2l0aW9ucy5taWRkbGUsIHBvc2l0aW9ucy5lbmQpXG4gICAgICAgICAgICBdLmpvaW4oJycpO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIHBhdGhzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBCaW5kIGhvdmVyIGV2ZW50LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50YXJnZXQgcmFwaGFlbCBpdGVtXG4gICAgICogICAgICBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gcGFyYW1zLnBvc2l0aW9uIHBvc2l0aW9uXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLmlkIGlkXG4gICAgICogICAgICBAcGFyYW0ge2Z1bmN0aW9ufSBwYXJhbXMuaW5DYWxsYmFjayBpbiBjYWxsYmFja1xuICAgICAqICAgICAgQHBhcmFtIHtmdW5jdGlvbn0gcGFyYW1zLm91dENhbGxiYWNrIG91dCBjYWxsYmFja1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2JpbmRIb3ZlckV2ZW50OiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIHRocm90dGxlZCA9IHR1aS51dGlsLnRocm90dGxlKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIGlmICghZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhcmFtcy5pbkNhbGxiYWNrKHBhcmFtcy5wb3NpdGlvbiwgMCwgcGFyYW1zLmluZGV4LCB7XG4gICAgICAgICAgICAgICAgY2xpZW50WDogZS5jbGllbnRYLFxuICAgICAgICAgICAgICAgIGNsaWVudFk6IGUuY2xpZW50WVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIDEwMCk7XG4gICAgICAgIHBhcmFtcy50YXJnZXQubW91c2VvdmVyKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBwYXJhbXMuaW5DYWxsYmFjayhwYXJhbXMucG9zaXRpb24sIDAsIHBhcmFtcy5pbmRleCwge1xuICAgICAgICAgICAgICAgIGNsaWVudFg6IGUuY2xpZW50WCxcbiAgICAgICAgICAgICAgICBjbGllbnRZOiBlLmNsaWVudFlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KS5tb3VzZW1vdmUodGhyb3R0bGVkKS5tb3VzZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBwYXJhbXMub3V0Q2FsbGJhY2soKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIGV4cGFuZCBzZWxlY3RvciByYWRpdXMuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHNlY3RvciBwaWUgc2VjdG9yXG4gICAgICovXG4gICAgX2V4cGFuZFNlY3RvcjogZnVuY3Rpb24oc2VjdG9yKSB7XG4gICAgICAgIHZhciBjeCA9IHRoaXMuY2lyY2xlQm91bmQuY3gsXG4gICAgICAgICAgICBjeSA9IHRoaXMuY2lyY2xlQm91bmQuY3k7XG4gICAgICAgIHNlY3Rvci5hbmltYXRlKHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogXCJzMS4xIDEuMSBcIiArIGN4ICsgXCIgXCIgKyBjeVxuICAgICAgICB9LCBBTklNQVRJT05fVElNRSwgXCJlbGFzdGljXCIpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyByZXN0b3JlIHNlbGVjdG9yIHJhZGl1cy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gc2VjdG9yIHBpZSBzZWN0b3JcbiAgICAgKi9cbiAgICBfcmVzdG9yZVNlY3RvcjogZnVuY3Rpb24oc2VjdG9yKSB7XG4gICAgICAgIHNlY3Rvci5hbmltYXRlKHt0cmFuc2Zvcm06IFwiXCJ9LCBBTklNQVRJT05fVElNRSwgXCJlbGFzdGljXCIpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTaG93IGFuaW1hdGlvbi5cbiAgICAgKiBAcGFyYW0ge3tpbmRleDogbnVtYmVyfX0gZGF0YSBkYXRhXG4gICAgICovXG4gICAgc2hvd0FuaW1hdGlvbjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgc2VjdG9yID0gdGhpcy5zZWN0b3JzW2RhdGEuaW5kZXhdLnNlY3RvcjtcbiAgICAgICAgdGhpcy5fZXhwYW5kU2VjdG9yKHNlY3Rvcik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhpZGUgYW5pbWF0aW9uLlxuICAgICAqIEBwYXJhbSB7e2luZGV4OiBudW1iZXJ9fSBkYXRhIGRhdGFcbiAgICAgKi9cbiAgICBoaWRlQW5pbWF0aW9uOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBzZWN0b3IgPSB0aGlzLnNlY3RvcnNbZGF0YS5pbmRleF0uc2VjdG9yO1xuICAgICAgICB0aGlzLl9yZXN0b3JlU2VjdG9yKHNlY3Rvcik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFuaW1hdGUuXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgY2FsbGJhY2tcbiAgICAgKi9cbiAgICBhbmltYXRlOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICB2YXIgZGVsYXlUaW1lID0gMCxcbiAgICAgICAgICAgIGNpcmNsZUJvdW5kID0gdGhpcy5jaXJjbGVCb3VuZDtcbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaEFycmF5KHRoaXMuc2VjdG9ycywgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgdmFyIGFuZ2xlcyA9IGl0ZW0uYW5nbGVzLFxuICAgICAgICAgICAgICAgIGFuaW1hdGlvblRpbWUgPSBMT0FESU5HX0FOSU1BVElPTl9USU1FICogaXRlbS5wZXJjZW50VmFsdWUsXG4gICAgICAgICAgICAgICAgYW5pbSA9IFJhcGhhZWwuYW5pbWF0aW9uKHtcbiAgICAgICAgICAgICAgICAgICAgc2VjdG9yOiBbY2lyY2xlQm91bmQuY3gsIGNpcmNsZUJvdW5kLmN5LCBjaXJjbGVCb3VuZC5yLCBhbmdsZXMuc3RhcnRBbmdsZSwgYW5nbGVzLmVuZEFuZ2xlXVxuICAgICAgICAgICAgICAgIH0sIGFuaW1hdGlvblRpbWUpO1xuICAgICAgICAgICAgaXRlbS5zZWN0b3IuYW5pbWF0ZShhbmltLmRlbGF5KGRlbGF5VGltZSkpO1xuICAgICAgICAgICAgZGVsYXlUaW1lICs9IGFuaW1hdGlvblRpbWU7XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgc2V0VGltZW91dChjYWxsYmFjaywgZGVsYXlUaW1lKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBbmltYXRlIGxlZ2VuZCBsaW5lcy5cbiAgICAgKi9cbiAgICBhbmltYXRlTGVnZW5kTGluZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXRoaXMubGVnZW5kTGluZXMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0dWkudXRpbC5mb3JFYWNoQXJyYXkodGhpcy5sZWdlbmRMaW5lcywgZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgbGluZS5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICAnc3Ryb2tlJzogJ2JsYWNrJyxcbiAgICAgICAgICAgICAgICAnc3Ryb2tlLW9wYWNpdHknOiAxXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmFwaGFlbFBpZUNoYXJ0O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFV0aWwgZm9yIHJhcGhhZWwgcmVuZGVyaW5nLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFV0aWwgZm9yIHJhcGhhZWwgcmVuZGVyaW5nLlxuICogQG1vZHVsZSByYXBoYWVsUmVuZGVyVXRpbFxuICovXG52YXIgcmFwaGFlbFJlbmRlclV0aWwgPSB7XG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBsaW5lIHBhdGguXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpyYXBoYWVsUmVuZGVyVXRpbFxuICAgICAqIEBwYXJhbSB7e3RvcDogbnVtYmVyLCBsZWZ0OiBudW1iZXJ9fSBmcm9tUG9zIGZyb20gcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge3t0b3A6IG51bWJlciwgbGVmdDogbnVtYmVyfX0gdG9Qb3MgdG8gcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGggd2lkdGhcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBwYXRoXG4gICAgICovXG4gICAgbWFrZUxpbmVQYXRoOiBmdW5jdGlvbihmcm9tUG9zLCB0b1Bvcywgd2lkdGgpIHtcbiAgICAgICAgdmFyIGZyb21Qb2ludCA9IFtmcm9tUG9zLmxlZnQsIGZyb21Qb3MudG9wXSxcbiAgICAgICAgICAgIHRvUG9pbnQgPSBbdG9Qb3MubGVmdCwgdG9Qb3MudG9wXTtcblxuICAgICAgICB3aWR0aCA9IHdpZHRoIHx8IDE7XG5cbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaEFycmF5KGZyb21Qb2ludCwgZnVuY3Rpb24oZnJvbSwgaW5kZXgpIHtcbiAgICAgICAgICAgIGlmIChmcm9tID09PSB0b1BvaW50W2luZGV4XSkge1xuICAgICAgICAgICAgICAgIGZyb21Qb2ludFtpbmRleF0gPSB0b1BvaW50W2luZGV4XSA9IE1hdGgucm91bmQoZnJvbSkgLSAod2lkdGggJSAyIC8gMik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gJ00nICsgZnJvbVBvaW50LmpvaW4oJyAnKSArICdMJyArIHRvUG9pbnQuam9pbignICcpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgbGluZS5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOnJhcGhhZWxSZW5kZXJVdGlsXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIHJhcGhhZWwgcGFwZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0aCBsaW5lIHBhdGhcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29sb3IgbGluZSBjb2xvclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdHJva2VXaWR0aCBzdHJva2Ugd2lkdGhcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSByYXBoYWVsIGxpbmVcbiAgICAgKi9cbiAgICByZW5kZXJMaW5lOiBmdW5jdGlvbihwYXBlciwgcGF0aCwgY29sb3IsIHN0cm9rZVdpZHRoKSB7XG4gICAgICAgIHZhciBsaW5lID0gcGFwZXIucGF0aChbcGF0aF0pLFxuICAgICAgICAgICAgc3Ryb2tlU3R5bGUgPSB7XG4gICAgICAgICAgICAgICAgc3Ryb2tlOiBjb2xvcixcbiAgICAgICAgICAgICAgICAnc3Ryb2tlLXdpZHRoJzogc3Ryb2tlV2lkdGggfHwgMlxuICAgICAgICAgICAgfTtcblxuICAgICAgICBpZiAoY29sb3IgPT09ICd0cmFuc3BhcmVudCcpIHtcbiAgICAgICAgICAgIHN0cm9rZVN0eWxlLnN0cm9rZSA9ICcjZmZmJztcbiAgICAgICAgICAgIHN0cm9rZVN0eWxlWydzdHJva2Utb3BhY2l0eSddID0gMDtcbiAgICAgICAgfVxuICAgICAgICBsaW5lLmF0dHIoc3Ryb2tlU3R5bGUpO1xuXG4gICAgICAgIHJldHVybiBsaW5lO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gcmFwaGFlbFJlbmRlclV0aWw7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjaGFydENvbnN0ID0gcmVxdWlyZSgnLi9jb25zdCcpLFxuICAgIGNoYXJ0RmFjdG9yeSA9IHJlcXVpcmUoJy4vZmFjdG9yaWVzL2NoYXJ0RmFjdG9yeScpLFxuICAgIEJhckNoYXJ0ID0gcmVxdWlyZSgnLi9jaGFydHMvYmFyQ2hhcnQnKSxcbiAgICBDb2x1bW5DaGFydCA9IHJlcXVpcmUoJy4vY2hhcnRzL2NvbHVtbkNoYXJ0JyksXG4gICAgTGluZUNoYXJ0ID0gcmVxdWlyZSgnLi9jaGFydHMvbGluZUNoYXJ0JyksXG4gICAgQXJlYUNoYXJ0ID0gcmVxdWlyZSgnLi9jaGFydHMvYXJlYUNoYXJ0JyksXG4gICAgQ29tYm9DaGFydCA9IHJlcXVpcmUoJy4vY2hhcnRzL2NvbWJvQ2hhcnQnKSxcbiAgICBQaWVDaGFydCA9IHJlcXVpcmUoJy4vY2hhcnRzL3BpZUNoYXJ0Jyk7XG5cbmNoYXJ0RmFjdG9yeS5yZWdpc3RlcihjaGFydENvbnN0LkNIQVJUX1RZUEVfQkFSLCBCYXJDaGFydCk7XG5jaGFydEZhY3RvcnkucmVnaXN0ZXIoY2hhcnRDb25zdC5DSEFSVF9UWVBFX0NPTFVNTiwgQ29sdW1uQ2hhcnQpO1xuY2hhcnRGYWN0b3J5LnJlZ2lzdGVyKGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9MSU5FLCBMaW5lQ2hhcnQpO1xuY2hhcnRGYWN0b3J5LnJlZ2lzdGVyKGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9BUkVBLCBBcmVhQ2hhcnQpO1xuY2hhcnRGYWN0b3J5LnJlZ2lzdGVyKGNoYXJ0Q29uc3QuQ0hBUlRfVFlQRV9DT01CTywgQ29tYm9DaGFydCk7XG5jaGFydEZhY3RvcnkucmVnaXN0ZXIoY2hhcnRDb25zdC5DSEFSVF9UWVBFX1BJRSwgUGllQ2hhcnQpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4vY29uc3QnKSxcbiAgICB0aGVtZUZhY3RvcnkgPSByZXF1aXJlKCcuL2ZhY3Rvcmllcy90aGVtZUZhY3RvcnknKSxcbiAgICBkZWZhdWx0VGhlbWUgPSByZXF1aXJlKCcuL3RoZW1lcy9kZWZhdWx0VGhlbWUnKTtcblxudGhlbWVGYWN0b3J5LnJlZ2lzdGVyKGNoYXJ0Q29uc3QuREVGQVVMVF9USEVNRV9OQU1FLCBkZWZhdWx0VGhlbWUpO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEFyZWEgY2hhcnQgc2VyaWVzIGNvbXBvbmVudC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFNlcmllcyA9IHJlcXVpcmUoJy4vc2VyaWVzJyksXG4gICAgTGluZVR5cGVTZXJpZXNCYXNlID0gcmVxdWlyZSgnLi9saW5lVHlwZVNlcmllc0Jhc2UnKTtcblxudmFyIEFyZWFDaGFydFNlcmllcyA9IHR1aS51dGlsLmRlZmluZUNsYXNzKFNlcmllcywgLyoqIEBsZW5kcyBBcmVhQ2hhcnRTZXJpZXMucHJvdG90eXBlICovIHtcbiAgICAvKipcbiAgICAgKiBBcmVhIGNoYXJ0IHNlcmllcyBjb21wb25lbnQuXG4gICAgICogQGNvbnN0cnVjdHMgQXJlYUNoYXJ0U2VyaWVzXG4gICAgICogQGV4dGVuZHMgU2VyaWVzXG4gICAgICogQG1peGVzIExpbmVUeXBlU2VyaWVzQmFzZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5tb2RlbCBzZXJpZXMgbW9kZWxcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMub3B0aW9ucyBzZXJpZXMgb3B0aW9uc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy50aGVtZSBzZXJpZXMgdGhlbWVcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgU2VyaWVzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2Ugc2VyaWVzIGRhdGEuXG4gICAgICogQHJldHVybnMge29iamVjdH0gYWRkIGRhdGFcbiAgICAgKi9cbiAgICBtYWtlU2VyaWVzRGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBkaW1lbnNpb24gPSB0aGlzLmJvdW5kLmRpbWVuc2lvbixcbiAgICAgICAgICAgIHNjYWxlRGlzdGFuY2UgPSB0aGlzLmdldFNjYWxlRGlzdGFuY2VGcm9tWmVyb1BvaW50KGRpbWVuc2lvbi5oZWlnaHQsIHRoaXMuZGF0YS5zY2FsZSksXG4gICAgICAgICAgICB6ZXJvVG9wID0gc2NhbGVEaXN0YW5jZS50b01heDtcbiAgICAgICAgaWYgKHRoaXMuZGF0YS5zY2FsZS5taW4gPj0gMCAmJiAhemVyb1RvcCkge1xuICAgICAgICAgICAgemVyb1RvcCA9IGRpbWVuc2lvbi5oZWlnaHQ7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZ3JvdXBQb3NpdGlvbnM6IHRoaXMubWFrZVBvc2l0aW9ucyhkaW1lbnNpb24pLFxuICAgICAgICAgICAgemVyb1RvcDogemVyb1RvcFxuICAgICAgICB9O1xuICAgIH1cbn0pO1xuXG5MaW5lVHlwZVNlcmllc0Jhc2UubWl4aW4oQXJlYUNoYXJ0U2VyaWVzKTtcblxubW9kdWxlLmV4cG9ydHMgPSBBcmVhQ2hhcnRTZXJpZXM7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgQmFyIGNoYXJ0IHNlcmllcyBjb21wb25lbnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTZXJpZXMgPSByZXF1aXJlKCcuL3NlcmllcycpLFxuICAgIEJhclR5cGVTZXJpZXNCYXNlID0gcmVxdWlyZSgnLi9iYXJUeXBlU2VyaWVzQmFzZScpLFxuICAgIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuLi9jb25zdCcpLFxuICAgIHJlbmRlclV0aWwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3JlbmRlclV0aWwnKTtcblxudmFyIEJhckNoYXJ0U2VyaWVzID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoU2VyaWVzLCAvKiogQGxlbmRzIEJhckNoYXJ0U2VyaWVzLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogQmFyIGNoYXJ0IHNlcmllcyBjb21wb25lbnQuXG4gICAgICogQGNvbnN0cnVjdHMgQmFyQ2hhcnRTZXJpZXNcbiAgICAgKiBAZXh0ZW5kcyBTZXJpZXNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMubW9kZWwgc2VyaWVzIG1vZGVsXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgc2VyaWVzIG9wdGlvbnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgc2VyaWVzIHRoZW1lXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIFNlcmllcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYm91bmQgb2YgYmFyIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHt7dG9wOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gcGFyYW1zLmJhc2VCb3VuZCBiYXNlIGJvdW5kXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnN0YXJ0TGVmdCBzdGFydCBsZWZ0XG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmVuZExlZnQgZW5kIGxlZnRcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuZW5kV2lkdGggZW5kIHdpZHRoXG4gICAgICogQHJldHVybnMge3tcbiAgICAgKiAgICAgIHN0YXJ0OiB7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9LFxuICAgICAqICAgICAgZW5kOiB7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9XG4gICAgICogfX0gY29sdW1uIGNoYXJ0IGJvdW5kXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUJhckNoYXJ0Qm91bmQ6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3RhcnQ6IHR1aS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgbGVmdDogcGFyYW1zLnN0YXJ0TGVmdCxcbiAgICAgICAgICAgICAgICB3aWR0aDogMFxuICAgICAgICAgICAgfSwgcGFyYW1zLmJhc2VCb3VuZCksXG4gICAgICAgICAgICBlbmQ6IHR1aS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgbGVmdDogcGFyYW1zLmVuZExlZnQsXG4gICAgICAgICAgICAgICAgd2lkdGg6IHBhcmFtcy5lbmRXaWR0aFxuICAgICAgICAgICAgfSwgcGFyYW1zLmJhc2VCb3VuZClcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBub3JtYWwgYmFyIGNoYXJ0IGJvdW5kLlxuICAgICAqIEBwYXJhbSB7e1xuICAgICAqICAgICAgZGltZW5zaW9uOiB7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9LFxuICAgICAqICAgICAgZ3JvdXBWYWx1ZXM6IGFycmF5LjxhcnJheS48bnVtYmVyPj4sXG4gICAgICogICAgICBncm91cFNpemU6IG51bWJlciwgYmFyUGFkZGluZzogbnVtYmVyLCBiYXJTaXplOiBudW1iZXIsIHN0ZXA6IG51bWJlcixcbiAgICAgKiAgICAgIGRpc3RhbmNlVG9NaW46IG51bWJlciwgaXNNaW51czogYm9vbGVhblxuICAgICAqIH19IGJhc2VJbmZvIGJhc2UgaW5mb1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSB2YWx1ZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBwYWRkaW5nVG9wIHBhZGRpbmcgdG9wXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IGluZGV4XG4gICAgICogQHJldHVybnMge3tcbiAgICAgKiAgICAgIHN0YXJ0OiB7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9LFxuICAgICAqICAgICAgZW5kOiB7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9XG4gICAgICogfX0gY29sdW1uIGNoYXJ0IGJvdW5kXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZU5vcm1hbEJhckNoYXJ0Qm91bmQ6IGZ1bmN0aW9uKGJhc2VJbmZvLCB2YWx1ZSwgcGFkZGluZ1RvcCwgaW5kZXgpIHtcbiAgICAgICAgdmFyIHN0YXJ0TGVmdCwgZW5kV2lkdGgsIGJvdW5kLCBiYXNlQm91bmQ7XG5cbiAgICAgICAgc3RhcnRMZWZ0ID0gYmFzZUluZm8uZGlzdGFuY2VUb01pbiArIGNoYXJ0Q29uc3QuU0VSSUVTX0VYUEFORF9TSVpFO1xuICAgICAgICBlbmRXaWR0aCA9IE1hdGguYWJzKHZhbHVlICogYmFzZUluZm8uZGltZW5zaW9uLndpZHRoKTtcbiAgICAgICAgYmFzZUJvdW5kID0ge1xuICAgICAgICAgICAgdG9wOiBwYWRkaW5nVG9wICsgKChiYXNlSW5mby5zdGVwKSAqIGluZGV4KSxcbiAgICAgICAgICAgIGhlaWdodDogYmFzZUluZm8uYmFyU2l6ZVxuICAgICAgICB9O1xuICAgICAgICBib3VuZCA9IHRoaXMuX21ha2VCYXJDaGFydEJvdW5kKHtcbiAgICAgICAgICAgIGJhc2VCb3VuZDogYmFzZUJvdW5kLFxuICAgICAgICAgICAgc3RhcnRMZWZ0OiBzdGFydExlZnQsXG4gICAgICAgICAgICBlbmRMZWZ0OiBzdGFydExlZnQgKyAodmFsdWUgPCAwID8gLWVuZFdpZHRoIDogMCksXG4gICAgICAgICAgICBlbmRXaWR0aDogZW5kV2lkdGhcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGJvdW5kO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGJvdW5kcyBvZiBub3JtYWwgYmFyIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDpudW1iZXJ9fSBkaW1lbnNpb24gYmFyIGNoYXJ0IGRpbWVuc2lvblxuICAgICAqIEByZXR1cm5zIHthcnJheS48YXJyYXkuPG9iamVjdD4+fSBib3VuZHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlTm9ybWFsQmFyQ2hhcnRCb3VuZHM6IGZ1bmN0aW9uKGRpbWVuc2lvbikge1xuICAgICAgICB2YXIgYmFzZUluZm8gPSB0aGlzLm1ha2VCYXNlSW5mb0Zvck5vcm1hbENoYXJ0Qm91bmRzKGRpbWVuc2lvbiwgJ3dpZHRoJywgJ2hlaWdodCcpLFxuICAgICAgICAgICAgYm91bmRzO1xuXG4gICAgICAgIGJvdW5kcyA9IHR1aS51dGlsLm1hcChiYXNlSW5mby5ncm91cFZhbHVlcywgZnVuY3Rpb24odmFsdWVzLCBncm91cEluZGV4KSB7XG4gICAgICAgICAgICB2YXIgcGFkZGluZ1RvcCA9IChiYXNlSW5mby5ncm91cFNpemUgKiBncm91cEluZGV4KSArIChiYXNlSW5mby5iYXJTaXplIC8gMik7XG4gICAgICAgICAgICByZXR1cm4gdHVpLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24gKHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9tYWtlTm9ybWFsQmFyQ2hhcnRCb3VuZChiYXNlSW5mbywgdmFsdWUsIHBhZGRpbmdUb3AsIGluZGV4KTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICByZXR1cm4gYm91bmRzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGJvdW5kcyBvZiBzdGFja2VkIGJhciBjaGFydC5cbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6bnVtYmVyfX0gZGltZW5zaW9uIGJhciBjaGFydCBkaW1lbnNpb25cbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxvYmplY3Q+Pn0gYm91bmRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVN0YWNrZWRCYXJDaGFydEJvdW5kczogZnVuY3Rpb24oZGltZW5zaW9uKSB7XG4gICAgICAgIHZhciBncm91cFZhbHVlcywgZ3JvdXBIZWlnaHQsIGJhckhlaWdodCwgYm91bmRzO1xuICAgICAgICBncm91cFZhbHVlcyA9IHRoaXMucGVyY2VudFZhbHVlcztcbiAgICAgICAgZ3JvdXBIZWlnaHQgPSAoZGltZW5zaW9uLmhlaWdodCAvIGdyb3VwVmFsdWVzLmxlbmd0aCk7XG4gICAgICAgIGJhckhlaWdodCA9IGdyb3VwSGVpZ2h0IC8gMjtcbiAgICAgICAgYm91bmRzID0gdHVpLnV0aWwubWFwKGdyb3VwVmFsdWVzLCBmdW5jdGlvbiAodmFsdWVzLCBncm91cEluZGV4KSB7XG4gICAgICAgICAgICB2YXIgcGFkZGluZ1RvcCA9IChncm91cEhlaWdodCAqIGdyb3VwSW5kZXgpICsgKGJhckhlaWdodCAvIDIpLFxuICAgICAgICAgICAgICAgIGVuZExlZnQgPSBjaGFydENvbnN0LlNFUklFU19FWFBBTkRfU0laRTtcbiAgICAgICAgICAgIHJldHVybiB0dWkudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB2YXIgZW5kV2lkdGgsIGJhc2VCb3VuZCwgYm91bmQ7XG5cbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGVuZFdpZHRoID0gdmFsdWUgKiBkaW1lbnNpb24ud2lkdGg7XG4gICAgICAgICAgICAgICAgYmFzZUJvdW5kID0ge1xuICAgICAgICAgICAgICAgICAgICB0b3A6IHBhZGRpbmdUb3AsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogYmFySGVpZ2h0XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBib3VuZCA9IHRoaXMuX21ha2VCYXJDaGFydEJvdW5kKHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZUJvdW5kOiBiYXNlQm91bmQsXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0TGVmdDogY2hhcnRDb25zdC5TRVJJRVNfRVhQQU5EX1NJWkUsXG4gICAgICAgICAgICAgICAgICAgIGVuZExlZnQ6IGVuZExlZnQsXG4gICAgICAgICAgICAgICAgICAgIGVuZFdpZHRoOiBlbmRXaWR0aFxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgZW5kTGVmdCA9IGVuZExlZnQgKyBlbmRXaWR0aDtcbiAgICAgICAgICAgICAgICByZXR1cm4gYm91bmQ7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIHJldHVybiBib3VuZHM7XG4gICAgfSxcblxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBib3VuZHMgb2YgYmFyIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDpudW1iZXJ9fSBkaW1lbnNpb24gYmFyIGNoYXJ0IGRpbWVuc2lvblxuICAgICAqIEByZXR1cm5zIHthcnJheS48YXJyYXkuPG9iamVjdD4+fSBib3VuZHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQm91bmRzOiBmdW5jdGlvbihkaW1lbnNpb24pIHtcbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuc3RhY2tlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21ha2VOb3JtYWxCYXJDaGFydEJvdW5kcyhkaW1lbnNpb24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21ha2VTdGFja2VkQmFyQ2hhcnRCb3VuZHMoZGltZW5zaW9uKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHNlcmllcyByZW5kZXJpbmcgcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge29iZWplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnZhbHVlIHZhbHVlXG4gICAgICogICAgICBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyLCB3aWR0aDpudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gcGFyYW1zLmJvdW5kIGJvdW5kXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLmZvcm1hdHRlZFZhbHVlIGZvcm1hdHRlZCB2YWx1ZVxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5sYWJlbEhlaWdodCBsYWJlbCBoZWlnaHRcbiAgICAgKiBAcmV0dXJucyB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSByZW5kZXJpbmcgcG9zaXRpb25cbiAgICAgKi9cbiAgICBtYWtlU2VyaWVzUmVuZGVyaW5nUG9zaXRpb246IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgbGFiZWxXaWR0aCA9IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbFdpZHRoKHBhcmFtcy5mb3JtYXR0ZWRWYWx1ZSwgdGhpcy50aGVtZS5sYWJlbCksXG4gICAgICAgICAgICBib3VuZCA9IHBhcmFtcy5ib3VuZCxcbiAgICAgICAgICAgIGxlZnQgPSBib3VuZC5sZWZ0LFxuICAgICAgICAgICAgdG9wID0gYm91bmQudG9wICsgKGJvdW5kLmhlaWdodCAtIHBhcmFtcy5sYWJlbEhlaWdodCArIGNoYXJ0Q29uc3QuVEVYVF9QQURESU5HKSAvIDI7XG5cbiAgICAgICAgaWYgKHBhcmFtcy52YWx1ZSA+PSAwKSB7XG4gICAgICAgICAgICBsZWZ0ICs9IGJvdW5kLndpZHRoICsgY2hhcnRDb25zdC5TRVJJRVNfTEFCRUxfUEFERElORztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxlZnQgLT0gbGFiZWxXaWR0aCArIGNoYXJ0Q29uc3QuU0VSSUVTX0xBQkVMX1BBRERJTkc7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbGVmdDogbGVmdCxcbiAgICAgICAgICAgIHRvcDogdG9wXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2Ugc3VtIGxhYmVsIGh0bWwuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxudW1iZXI+fSBwYXJhbXMudmFsdWVzIHZhbHVlc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48ZnVuY3Rpb24+fSBwYXJhbXMuZm9ybWF0RnVuY3Rpb25zIGZvcm1hdHRpbmcgZnVuY3Rpb25zXG4gICAgICogICAgICBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gcGFyYW1zLmJvdW5kIGJvdW5kXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmxhYmVsSGVpZ2h0IGxhYmVsIGhlaWdodFxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IHN1bSBsYWJlbCBodG1sXG4gICAgICovXG4gICAgbWFrZVN1bUxhYmVsSHRtbDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBzdW0gPSB0aGlzLm1ha2VTdW1WYWx1ZXMocGFyYW1zLnZhbHVlcywgcGFyYW1zLmZvcm1hdEZ1bmN0aW9ucyksXG4gICAgICAgICAgICBib3VuZCA9IHBhcmFtcy5ib3VuZCxcbiAgICAgICAgICAgIGxhYmVsSGVpZ2h0ID0gcmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsSGVpZ2h0KHN1bSwgdGhpcy50aGVtZS5sYWJlbCksXG4gICAgICAgICAgICB0b3AgPSBib3VuZC50b3AgKyAoKGJvdW5kLmhlaWdodCAtIGxhYmVsSGVpZ2h0ICsgY2hhcnRDb25zdC5URVhUX1BBRERJTkcpIC8gMiksXG4gICAgICAgICAgICBsZWZ0ID0gYm91bmQubGVmdCArIGJvdW5kLndpZHRoICsgY2hhcnRDb25zdC5TRVJJRVNfTEFCRUxfUEFERElORztcblxuICAgICAgICByZXR1cm4gdGhpcy5tYWtlU2VyaWVzTGFiZWxIdG1sKHtcbiAgICAgICAgICAgIGxlZnQ6IGxlZnQsXG4gICAgICAgICAgICB0b3A6IHRvcFxuICAgICAgICB9LCBzdW0sIC0xLCAtMSk7XG4gICAgfVxufSk7XG5cbkJhclR5cGVTZXJpZXNCYXNlLm1peGluKEJhckNoYXJ0U2VyaWVzKTtcblxubW9kdWxlLmV4cG9ydHMgPSBCYXJDaGFydFNlcmllcztcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBDb2x1bW4gY2hhcnQgc2VyaWVzIGNvbXBvbmVudC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuLi9jb25zdCcpLFxuICAgIGRvbSA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZG9tSGFuZGxlcicpLFxuICAgIHJlbmRlclV0aWwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3JlbmRlclV0aWwnKTtcblxudmFyIEJhclR5cGVTZXJpZXNCYXNlID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBCYXJUeXBlU2VyaWVzQmFzZS5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIFRvIG1ha2Ugc2VyaWVzIGRhdGEuXG4gICAgICogQHJldHVybnMge29iamVjdH0gYWRkIGRhdGFcbiAgICAgKi9cbiAgICBtYWtlU2VyaWVzRGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBncm91cEJvdW5kcyA9IHRoaXMuX21ha2VCb3VuZHModGhpcy5ib3VuZC5kaW1lbnNpb24pO1xuXG4gICAgICAgIHRoaXMuZ3JvdXBCb3VuZHMgPSBncm91cEJvdW5kcztcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZ3JvdXBCb3VuZHM6IGdyb3VwQm91bmRzLFxuICAgICAgICAgICAgZ3JvdXBWYWx1ZXM6IHRoaXMucGVyY2VudFZhbHVlc1xuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGJhciBndXR0ZXIuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGdyb3VwU2l6ZSBiYXIgZ3JvdXAgc2l6ZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpdGVtQ291bnQgZ3JvdXAgaXRlbSBjb3VudFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IGJhciBndXR0ZXJcbiAgICAgKi9cbiAgICBtYWtlQmFyR3V0dGVyOiBmdW5jdGlvbihncm91cFNpemUsIGl0ZW1Db3VudCkge1xuICAgICAgICB2YXIgYmFzZVNpemUgPSBncm91cFNpemUgLyAoaXRlbUNvdW50ICsgMSkgLyAyLFxuICAgICAgICAgICAgZ3V0dGVyO1xuICAgICAgICBpZiAoYmFzZVNpemUgPD0gMikge1xuICAgICAgICAgICAgZ3V0dGVyID0gMDtcbiAgICAgICAgfSBlbHNlIGlmIChiYXNlU2l6ZSA8PSA2KSB7XG4gICAgICAgICAgICBndXR0ZXIgPSAyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZ3V0dGVyID0gNDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZ3V0dGVyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGJhciBzaXplLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBncm91cFNpemUgYmFyIGdyb3VwIHNpemVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYmFyUGFkZGluZyBiYXIgcGFkZGluZ1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpdGVtQ291bnQgZ3JvdXAgaXRlbSBjb3VudFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IGJhciBzaXplICh3aWR0aCBvciBoZWlnaHQpXG4gICAgICovXG4gICAgbWFrZUJhclNpemU6IGZ1bmN0aW9uKGdyb3VwU2l6ZSwgYmFyUGFkZGluZywgaXRlbUNvdW50KSB7XG4gICAgICAgIHJldHVybiAoZ3JvdXBTaXplIC0gKGJhclBhZGRpbmcgKiAoaXRlbUNvdW50IC0gMSkpKSAvIChpdGVtQ291bnQgKyAxKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBiYXNlIGluZm8gZm9yIG5vcm1hbCBjaGFydCBib3VuZHMuXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBkaW1lbnNpb24gc2VyaWVzIGRpbWVuc2lvblxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzaXplVHlwZSBzaXplIHR5cGUgKHdpZHRoIG9yIGhlaWdodClcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gYW5vdGhlclNpemVUeXBlIGFub3RoZXIgc2l6ZSB0eXBlICh3aWR0aCBvciBoZWlnaHQpXG4gICAgICogQHJldHVybnMge3tcbiAgICAgKiAgICAgIGRpbWVuc2lvbjoge3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfSxcbiAgICAgKiAgICAgIGdyb3VwVmFsdWVzOiBhcnJheS48YXJyYXkuPG51bWJlcj4+LFxuICAgICAqICAgICAgZ3JvdXBTaXplOiBudW1iZXIsIGJhclBhZGRpbmc6IG51bWJlciwgYmFyU2l6ZTogbnVtYmVyLCBzdGVwOiBudW1iZXIsXG4gICAgICogICAgICBkaXN0YW5jZVRvTWluOiBudW1iZXIsIGlzTWludXM6IGJvb2xlYW5cbiAgICAgKiB9fSBiYXNlIGluZm9cbiAgICAgKi9cbiAgICBtYWtlQmFzZUluZm9Gb3JOb3JtYWxDaGFydEJvdW5kczogZnVuY3Rpb24oZGltZW5zaW9uLCBzaXplVHlwZSwgYW5vdGhlclNpemVUeXBlKSB7XG4gICAgICAgIHZhciBncm91cFZhbHVlcyA9IHRoaXMucGVyY2VudFZhbHVlcyxcbiAgICAgICAgICAgIGdyb3VwU2l6ZSA9IGRpbWVuc2lvblthbm90aGVyU2l6ZVR5cGVdIC8gZ3JvdXBWYWx1ZXMubGVuZ3RoLFxuICAgICAgICAgICAgaXRlbUNvdW50ID0gZ3JvdXBWYWx1ZXNbMF0gJiYgZ3JvdXBWYWx1ZXNbMF0ubGVuZ3RoIHx8IDAsXG4gICAgICAgICAgICBiYXJQYWRkaW5nID0gdGhpcy5tYWtlQmFyR3V0dGVyKGdyb3VwU2l6ZSwgaXRlbUNvdW50KSxcbiAgICAgICAgICAgIGJhclNpemUgPSB0aGlzLm1ha2VCYXJTaXplKGdyb3VwU2l6ZSwgYmFyUGFkZGluZywgaXRlbUNvdW50KSxcbiAgICAgICAgICAgIHNjYWxlRGlzdGFuY2UgPSB0aGlzLmdldFNjYWxlRGlzdGFuY2VGcm9tWmVyb1BvaW50KGRpbWVuc2lvbltzaXplVHlwZV0sIHRoaXMuZGF0YS5zY2FsZSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkaW1lbnNpb246IGRpbWVuc2lvbixcbiAgICAgICAgICAgIGdyb3VwVmFsdWVzOiBncm91cFZhbHVlcyxcbiAgICAgICAgICAgIGdyb3VwU2l6ZTogZ3JvdXBTaXplLFxuICAgICAgICAgICAgYmFyUGFkZGluZzogYmFyUGFkZGluZyxcbiAgICAgICAgICAgIGJhclNpemU6IGJhclNpemUsXG4gICAgICAgICAgICBzdGVwOiBiYXJTaXplICsgYmFyUGFkZGluZyxcbiAgICAgICAgICAgIGRpc3RhbmNlVG9NaW46IHNjYWxlRGlzdGFuY2UudG9NaW4sXG4gICAgICAgICAgICBpc01pbnVzOiB0aGlzLmRhdGEuc2NhbGUubWluIDwgMCAmJiB0aGlzLmRhdGEuc2NhbGUubWF4IDw9IDBcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIG5vcm1hbCBzZXJpZXMgbGFiZWwuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge0hUTUxFbGVtZW50fSBwYXJhbXMuY29udGFpbmVyIGNvbnRhaW5lclxuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48YXJyYXk+fSBwYXJhbXMuZ3JvdXBCb3VuZHMgZ3JvdXAgYm91bmRzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IHBhcmFtcy5mb3JtYXR0ZWRWYWx1ZXMgZm9ybWF0dGVkIHZhbHVlc1xuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gc2VyaWVzIGxhYmVsIGFyZWFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJOb3JtYWxTZXJpZXNMYWJlbDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBncm91cEJvdW5kcyA9IHBhcmFtcy5ncm91cEJvdW5kcyxcbiAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlcyA9IHBhcmFtcy5mb3JtYXR0ZWRWYWx1ZXMsXG4gICAgICAgICAgICBsYWJlbEhlaWdodCA9IHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodChmb3JtYXR0ZWRWYWx1ZXNbMF1bMF0sIHRoaXMudGhlbWUubGFiZWwpLFxuICAgICAgICAgICAgZWxTZXJpZXNMYWJlbEFyZWEgPSBkb20uY3JlYXRlKCdkaXYnLCAndHVpLWNoYXJ0LXNlcmllcy1sYWJlbC1hcmVhJyksXG4gICAgICAgICAgICBodG1sO1xuICAgICAgICBodG1sID0gdHVpLnV0aWwubWFwKHBhcmFtcy52YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcywgZ3JvdXBJbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuIHR1aS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciBib3VuZCwgZm9ybWF0dGVkVmFsdWUsIHJlbmRlcmluZ1Bvc2l0aW9uO1xuICAgICAgICAgICAgICAgIGJvdW5kID0gZ3JvdXBCb3VuZHNbZ3JvdXBJbmRleF1baW5kZXhdLmVuZDtcbiAgICAgICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZSA9IGZvcm1hdHRlZFZhbHVlc1tncm91cEluZGV4XVtpbmRleF07XG4gICAgICAgICAgICAgICAgcmVuZGVyaW5nUG9zaXRpb24gPSB0aGlzLm1ha2VTZXJpZXNSZW5kZXJpbmdQb3NpdGlvbih7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgYm91bmQ6IGJvdW5kLFxuICAgICAgICAgICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZTogZm9ybWF0dGVkVmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsSGVpZ2h0OiBsYWJlbEhlaWdodFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1ha2VTZXJpZXNMYWJlbEh0bWwocmVuZGVyaW5nUG9zaXRpb24sIGZvcm1hdHRlZFZhbHVlLCBncm91cEluZGV4LCBpbmRleCk7XG4gICAgICAgICAgICB9LCB0aGlzKS5qb2luKCcnKTtcbiAgICAgICAgfSwgdGhpcykuam9pbignJyk7XG5cbiAgICAgICAgZWxTZXJpZXNMYWJlbEFyZWEuaW5uZXJIVE1MID0gaHRtbDtcbiAgICAgICAgcGFyYW1zLmNvbnRhaW5lci5hcHBlbmRDaGlsZChlbFNlcmllc0xhYmVsQXJlYSk7XG5cbiAgICAgICAgcmV0dXJuIGVsU2VyaWVzTGFiZWxBcmVhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHN1bSB2YWx1ZXMuXG4gICAgICogQHBhcmFtIHthcnJheS48bnVtYmVyPn0gdmFsdWVzIHZhbHVlc1xuICAgICAqIEBwYXJhbSB7YXJyYXkuPGZ1bmN0aW9uPn0gZm9ybWF0RnVuY3Rpb25zIGZvcm1hdCBmdW5jdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBzdW0gcmVzdWx0LlxuICAgICAqL1xuICAgIG1ha2VTdW1WYWx1ZXM6IGZ1bmN0aW9uKHZhbHVlcywgZm9ybWF0RnVuY3Rpb25zKSB7XG4gICAgICAgIHZhciBzdW0gPSB0dWkudXRpbC5zdW0odHVpLnV0aWwuZmlsdGVyKHZhbHVlcywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgPiAwO1xuICAgICAgICAgICAgfSkpLFxuICAgICAgICAgICAgZm5zID0gW3N1bV0uY29uY2F0KGZvcm1hdEZ1bmN0aW9ucyB8fCBbXSk7XG5cbiAgICAgICAgcmV0dXJuIHR1aS51dGlsLnJlZHVjZShmbnMsIGZ1bmN0aW9uKHN0b3JlZCwgZm4pIHtcbiAgICAgICAgICAgIHJldHVybiBmbihzdG9yZWQpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBzdGFja2VkIGxhYmVscyBodG1sLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5ncm91cEluZGV4IGdyb3VwIGluZGV4XG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxudW1iZXI+fSBwYXJhbXMudmFsdWVzIHZhbHVlcyxcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPGZ1bmN0aW9uPn0gcGFyYW1zLmZvcm1hdEZ1bmN0aW9ucyBmb3JtYXR0aW5nIGZ1bmN0aW9ucyxcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPG9iamVjdD59IHBhcmFtcy5ib3VuZHMgYm91bmRzLFxuICAgICAqICAgICAgQHBhcmFtIHthcnJheX0gcGFyYW1zLmZvcm1hdHRlZFZhbHVlcyBmb3JtYXR0ZWQgdmFsdWVzLFxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5sYWJlbEhlaWdodCBsYWJlbCBoZWlnaHRcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBsYWJlbHMgaHRtbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VTdGFja2VkTGFiZWxzSHRtbDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciB2YWx1ZXMgPSBwYXJhbXMudmFsdWVzLFxuICAgICAgICAgICAgYm91bmQsIGh0bWxzO1xuXG4gICAgICAgIGh0bWxzID0gdHVpLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgbGFiZWxXaWR0aCwgbGVmdCwgdG9wLCBsYWJlbEh0bWwsIGZvcm1hdHRlZFZhbHVlO1xuXG4gICAgICAgICAgICBpZiAodmFsdWUgPCAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBib3VuZCA9IHBhcmFtcy5ib3VuZHNbaW5kZXhdLmVuZDtcbiAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlID0gcGFyYW1zLmZvcm1hdHRlZFZhbHVlc1tpbmRleF07XG4gICAgICAgICAgICBsYWJlbFdpZHRoID0gcmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsV2lkdGgoZm9ybWF0dGVkVmFsdWUsIHRoaXMudGhlbWUubGFiZWwpO1xuICAgICAgICAgICAgbGVmdCA9IGJvdW5kLmxlZnQgKyAoKGJvdW5kLndpZHRoIC0gbGFiZWxXaWR0aCArIGNoYXJ0Q29uc3QuVEVYVF9QQURESU5HKSAvIDIpO1xuICAgICAgICAgICAgdG9wID0gYm91bmQudG9wICsgKChib3VuZC5oZWlnaHQgLSBwYXJhbXMubGFiZWxIZWlnaHQgKyBjaGFydENvbnN0LlRFWFRfUEFERElORykgLyAyKTtcbiAgICAgICAgICAgIGxhYmVsSHRtbCA9IHRoaXMubWFrZVNlcmllc0xhYmVsSHRtbCh7XG4gICAgICAgICAgICAgICAgbGVmdDogbGVmdCxcbiAgICAgICAgICAgICAgICB0b3A6IHRvcFxuICAgICAgICAgICAgfSwgZm9ybWF0dGVkVmFsdWUsIHBhcmFtcy5ncm91cEluZGV4LCBpbmRleCk7XG4gICAgICAgICAgICByZXR1cm4gbGFiZWxIdG1sO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnN0YWNrZWQgPT09ICdub3JtYWwnKSB7XG4gICAgICAgICAgICBodG1scy5wdXNoKHRoaXMubWFrZVN1bUxhYmVsSHRtbCh7XG4gICAgICAgICAgICAgICAgdmFsdWVzOiB2YWx1ZXMsXG4gICAgICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zOiBwYXJhbXMuZm9ybWF0RnVuY3Rpb25zLFxuICAgICAgICAgICAgICAgIGJvdW5kOiBib3VuZCxcbiAgICAgICAgICAgICAgICBsYWJlbEhlaWdodDogcGFyYW1zLmxhYmVsSGVpZ2h0XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGh0bWxzLmpvaW4oJycpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgc3RhY2tlZCBzZXJpZXMgbGFiZWwuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge0hUTUxFbGVtZW50fSBwYXJhbXMuY29udGFpbmVyIGNvbnRhaW5lclxuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48YXJyYXk+fSBwYXJhbXMuZ3JvdXBCb3VuZHMgZ3JvdXAgYm91bmRzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxhcnJheT59IHBhcmFtcy5mb3JtYXR0ZWRWYWx1ZXMgZm9ybWF0dGVkIHZhbHVlc1xuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gc2VyaWVzIGxhYmVsIGFyZWFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJTdGFja2VkU2VyaWVzTGFiZWw6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgZ3JvdXBCb3VuZHMgPSBwYXJhbXMuZ3JvdXBCb3VuZHMsXG4gICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZXMgPSBwYXJhbXMuZm9ybWF0dGVkVmFsdWVzLFxuICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zID0gcGFyYW1zLmZvcm1hdEZ1bmN0aW9ucyB8fCBbXSxcbiAgICAgICAgICAgIGVsU2VyaWVzTGFiZWxBcmVhID0gZG9tLmNyZWF0ZSgnZGl2JywgJ3R1aS1jaGFydC1zZXJpZXMtbGFiZWwtYXJlYScpLFxuICAgICAgICAgICAgbGFiZWxIZWlnaHQgPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxIZWlnaHQoZm9ybWF0dGVkVmFsdWVzWzBdWzBdLCB0aGlzLnRoZW1lLmxhYmVsKSxcbiAgICAgICAgICAgIGh0bWw7XG5cbiAgICAgICAgaHRtbCA9IHR1aS51dGlsLm1hcChwYXJhbXMudmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMsIGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgbGFiZWxzSHRtbCA9IHRoaXMuX21ha2VTdGFja2VkTGFiZWxzSHRtbCh7XG4gICAgICAgICAgICAgICAgZ3JvdXBJbmRleDogaW5kZXgsXG4gICAgICAgICAgICAgICAgdmFsdWVzOiB2YWx1ZXMsXG4gICAgICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zOiBmb3JtYXRGdW5jdGlvbnMsXG4gICAgICAgICAgICAgICAgYm91bmRzOiBncm91cEJvdW5kc1tpbmRleF0sXG4gICAgICAgICAgICAgICAgZm9ybWF0dGVkVmFsdWVzOiBmb3JtYXR0ZWRWYWx1ZXNbaW5kZXhdLFxuICAgICAgICAgICAgICAgIGxhYmVsSGVpZ2h0OiBsYWJlbEhlaWdodFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gbGFiZWxzSHRtbDtcbiAgICAgICAgfSwgdGhpcykuam9pbignJyk7XG5cbiAgICAgICAgZWxTZXJpZXNMYWJlbEFyZWEuaW5uZXJIVE1MID0gaHRtbDtcbiAgICAgICAgcGFyYW1zLmNvbnRhaW5lci5hcHBlbmRDaGlsZChlbFNlcmllc0xhYmVsQXJlYSk7XG5cbiAgICAgICAgcmV0dXJuIGVsU2VyaWVzTGFiZWxBcmVhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgc2VyaWVzIGxhYmVsLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtIVE1MRWxlbWVudH0gcGFyYW1zLmNvbnRhaW5lciBjb250YWluZXJcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gcGFyYW1zLmdyb3VwQm91bmRzIGdyb3VwIGJvdW5kc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48YXJyYXk+fSBwYXJhbXMuZm9ybWF0dGVkVmFsdWVzIGZvcm1hdHRlZCB2YWx1ZXNcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHNlcmllcyBsYWJlbCBhcmVhXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyU2VyaWVzTGFiZWw6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgZWxTZXJpZXNMYWJlbEFyZWE7XG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLnNob3dMYWJlbCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnN0YWNrZWQpIHtcbiAgICAgICAgICAgIGVsU2VyaWVzTGFiZWxBcmVhID0gdGhpcy5fcmVuZGVyU3RhY2tlZFNlcmllc0xhYmVsKHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbFNlcmllc0xhYmVsQXJlYSA9IHRoaXMuX3JlbmRlck5vcm1hbFNlcmllc0xhYmVsKHBhcmFtcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVsU2VyaWVzTGFiZWxBcmVhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgYm91bmQuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGdyb3VwSW5kZXggZ3JvdXAgaW5kZXhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggaW5kZXhcbiAgICAgKiBAcmV0dXJucyB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBib3VuZFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldEJvdW5kOiBmdW5jdGlvbihncm91cEluZGV4LCBpbmRleCkge1xuICAgICAgICBpZiAoZ3JvdXBJbmRleCA9PT0gLTEgfHwgaW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5ncm91cEJvdW5kc1tncm91cEluZGV4XVtpbmRleF0uZW5kO1xuICAgIH1cbn0pO1xuXG5CYXJUeXBlU2VyaWVzQmFzZS5taXhpbiA9IGZ1bmN0aW9uKGZ1bmMpIHtcbiAgICB0dWkudXRpbC5leHRlbmQoZnVuYy5wcm90b3R5cGUsIEJhclR5cGVTZXJpZXNCYXNlLnByb3RvdHlwZSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJhclR5cGVTZXJpZXNCYXNlO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IENvbHVtbiBjaGFydCBzZXJpZXMgY29tcG9uZW50LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU2VyaWVzID0gcmVxdWlyZSgnLi9zZXJpZXMnKSxcbiAgICBCYXJUeXBlU2VyaWVzQmFzZSA9IHJlcXVpcmUoJy4vYmFyVHlwZVNlcmllc0Jhc2UnKSxcbiAgICBjaGFydENvbnN0ID0gcmVxdWlyZSgnLi4vY29uc3QnKSxcbiAgICByZW5kZXJVdGlsID0gcmVxdWlyZSgnLi4vaGVscGVycy9yZW5kZXJVdGlsJyk7XG5cbnZhciBDb2x1bW5DaGFydFNlcmllcyA9IHR1aS51dGlsLmRlZmluZUNsYXNzKFNlcmllcywgLyoqIEBsZW5kcyBDb2x1bW5DaGFydFNlcmllcy5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIENvbHVtbiBjaGFydCBzZXJpZXMgY29tcG9uZW50LlxuICAgICAqIEBjb25zdHJ1Y3RzIENvbHVtbkNoYXJ0U2VyaWVzXG4gICAgICogQGV4dGVuZHMgU2VyaWVzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm1vZGVsIHNlcmllcyBtb2RlbFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5vcHRpb25zIHNlcmllcyBvcHRpb25zXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIHNlcmllcyB0aGVtZVxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBTZXJpZXMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBzdGFydCBlbmQgdG9wcy5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZW5kVG9wIGVuZCB0b3BcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZW5kSGVpZ2h0IGVuZCBoZWlnaHRcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgdmFsdWVcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzTWludXMgd2hldGhlciBtaW51cyBvciBub3RcbiAgICAgKiBAcmV0dXJucyB7e3N0YXJ0VG9wOiBudW1iZXIsIGVuZFRvcDogbnVtYmVyfX0gc3RhcnQgZW5kIHRvcHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlU3RhcnRFbmRUb3BzOiBmdW5jdGlvbihlbmRUb3AsIGVuZEhlaWdodCwgdmFsdWUpIHtcbiAgICAgICAgdmFyIHN0YXJ0VG9wO1xuICAgICAgICBpZiAodmFsdWUgPCAwKSB7XG4gICAgICAgICAgICBzdGFydFRvcCA9IGVuZFRvcDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0YXJ0VG9wID0gZW5kVG9wO1xuICAgICAgICAgICAgZW5kVG9wIC09IGVuZEhlaWdodDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdGFydFRvcDogc3RhcnRUb3AsXG4gICAgICAgICAgICBlbmRUb3A6IGVuZFRvcFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGJvdW5kIG9mIGNvbHVtbiBjaGFydC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgd2lkdGg6IG51bWJlcn19IHBhcmFtcy5iYXNlQm91bmQgYmFzZSBib3VuZFxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5zdGFydFRvcCBzdGFydCB0b3BcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuZW5kVG9wIGVuZCB0b3BcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuZW5kSGVpZ2h0IGVuZCBoZWlnaHRcbiAgICAgKiBAcmV0dXJucyB7e1xuICAgICAqICAgICAgc3RhcnQ6IHtsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn0sXG4gICAgICogICAgICBlbmQ6IHtsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn1cbiAgICAgKiB9fSBjb2x1bW4gY2hhcnQgYm91bmRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQ29sdW1uQ2hhcnRCb3VuZDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdGFydDogdHVpLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICB0b3A6IHBhcmFtcy5zdGFydFRvcCxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDBcbiAgICAgICAgICAgIH0sIHBhcmFtcy5iYXNlQm91bmQpLFxuICAgICAgICAgICAgZW5kOiB0dWkudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgICAgIHRvcDogcGFyYW1zLmVuZFRvcCxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IHBhcmFtcy5lbmRIZWlnaHRcbiAgICAgICAgICAgIH0sIHBhcmFtcy5iYXNlQm91bmQpXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2Ugbm9ybWFsIGNvbHVtbiBjaGFydCBib3VuZC5cbiAgICAgKiBAcGFyYW0ge3tcbiAgICAgKiAgICAgIGRpbWVuc2lvbjoge3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfSxcbiAgICAgKiAgICAgIGdyb3VwVmFsdWVzOiBhcnJheS48YXJyYXkuPG51bWJlcj4+LFxuICAgICAqICAgICAgZ3JvdXBTaXplOiBudW1iZXIsIGJhclBhZGRpbmc6IG51bWJlciwgYmFyU2l6ZTogbnVtYmVyLCBzdGVwOiBudW1iZXIsXG4gICAgICogICAgICBkaXN0YW5jZVRvTWluOiBudW1iZXIsIGlzTWludXM6IGJvb2xlYW5cbiAgICAgKiB9fSBiYXNlSW5mbyBiYXNlIGluZm9cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgdmFsdWVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gcGFkZGluZ0xlZnQgcGFkZGluZyBsZWZ0XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IGluZGV4XG4gICAgICogQHJldHVybnMge3tcbiAgICAgKiAgICAgIHN0YXJ0OiB7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9LFxuICAgICAqICAgICAgZW5kOiB7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9XG4gICAgICogfX0gY29sdW1uIGNoYXJ0IGJvdW5kXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZU5vcm1hbENvbHVtbkNoYXJ0Qm91bmQ6IGZ1bmN0aW9uKGJhc2VJbmZvLCB2YWx1ZSwgcGFkZGluZ0xlZnQsIGluZGV4KSB7XG4gICAgICAgIHZhciBlbmRIZWlnaHQsIGVuZFRvcCwgc3RhcnRFbmRUb3BzLCBib3VuZDtcblxuICAgICAgICBlbmRIZWlnaHQgPSBNYXRoLmFicyh2YWx1ZSAqIGJhc2VJbmZvLmRpbWVuc2lvbi5oZWlnaHQpO1xuICAgICAgICBlbmRUb3AgPSBiYXNlSW5mby5pc01pbnVzID8gMCA6IGJhc2VJbmZvLmRpbWVuc2lvbi5oZWlnaHQgLSBiYXNlSW5mby5kaXN0YW5jZVRvTWluO1xuICAgICAgICBzdGFydEVuZFRvcHMgPSB0aGlzLl9tYWtlU3RhcnRFbmRUb3BzKGVuZFRvcCwgZW5kSGVpZ2h0LCB2YWx1ZSk7XG4gICAgICAgIGJvdW5kID0gdGhpcy5fbWFrZUNvbHVtbkNoYXJ0Qm91bmQodHVpLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgIGJhc2VCb3VuZDoge1xuICAgICAgICAgICAgICAgIGxlZnQ6IHBhZGRpbmdMZWZ0ICsgKGJhc2VJbmZvLnN0ZXAgKiBpbmRleCkgKyBjaGFydENvbnN0LlNFUklFU19FWFBBTkRfU0laRSxcbiAgICAgICAgICAgICAgICB3aWR0aDogYmFzZUluZm8uYmFyU2l6ZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVuZEhlaWdodDogZW5kSGVpZ2h0XG4gICAgICAgIH0sIHN0YXJ0RW5kVG9wcykpO1xuICAgICAgICByZXR1cm4gYm91bmQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYm91bmRzIG9mIG5vcm1hbCBjb2x1bW4gY2hhcnQuXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0Om51bWJlcn19IGRpbWVuc2lvbiBjb2x1bW4gY2hhcnQgZGltZW5zaW9uXG4gICAgICogQHJldHVybnMge2FycmF5LjxhcnJheS48b2JqZWN0Pj59IGJvdW5kc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VOb3JtYWxDb2x1bW5DaGFydEJvdW5kczogZnVuY3Rpb24oZGltZW5zaW9uKSB7XG4gICAgICAgIHZhciBiYXNlSW5mbyA9IHRoaXMubWFrZUJhc2VJbmZvRm9yTm9ybWFsQ2hhcnRCb3VuZHMoZGltZW5zaW9uLCAnaGVpZ2h0JywgJ3dpZHRoJyksXG4gICAgICAgICAgICBib3VuZHM7XG5cbiAgICAgICAgYm91bmRzID0gdHVpLnV0aWwubWFwKGJhc2VJbmZvLmdyb3VwVmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMsIGdyb3VwSW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBwYWRkaW5nTGVmdCA9IChiYXNlSW5mby5ncm91cFNpemUgKiBncm91cEluZGV4KSArIChiYXNlSW5mby5iYXJTaXplIC8gMik7XG4gICAgICAgICAgICByZXR1cm4gdHVpLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24gKHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9tYWtlTm9ybWFsQ29sdW1uQ2hhcnRCb3VuZChiYXNlSW5mbywgdmFsdWUsIHBhZGRpbmdMZWZ0LCBpbmRleCk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgcmV0dXJuIGJvdW5kcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBib3VuZHMgb2Ygc3RhY2tlZCBjb2x1bW4gY2hhcnQuXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0Om51bWJlcn19IGRpbWVuc2lvbiBjb2x1bW4gY2hhcnQgZGltZW5zaW9uXG4gICAgICogQHJldHVybnMge2FycmF5LjxhcnJheS48b2JqZWN0Pj59IGJvdW5kc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VTdGFja2VkQ29sdW1uQ2hhcnRCb3VuZHM6IGZ1bmN0aW9uKGRpbWVuc2lvbikge1xuICAgICAgICB2YXIgZ3JvdXBWYWx1ZXMsIGdyb3VwV2lkdGgsIGJhcldpZHRoLCBib3VuZHM7XG5cbiAgICAgICAgZ3JvdXBWYWx1ZXMgPSB0aGlzLnBlcmNlbnRWYWx1ZXM7XG4gICAgICAgIGdyb3VwV2lkdGggPSAoZGltZW5zaW9uLndpZHRoIC8gZ3JvdXBWYWx1ZXMubGVuZ3RoKTtcbiAgICAgICAgYmFyV2lkdGggPSBncm91cFdpZHRoIC8gMjtcbiAgICAgICAgYm91bmRzID0gdHVpLnV0aWwubWFwKGdyb3VwVmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMsIGdyb3VwSW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBwYWRkaW5nTGVmdCA9IChncm91cFdpZHRoICogZ3JvdXBJbmRleCkgKyAoYmFyV2lkdGggLyAyKSArIGNoYXJ0Q29uc3QuU0VSSUVTX0VYUEFORF9TSVpFLFxuICAgICAgICAgICAgICAgIHRvcCA9IDA7XG4gICAgICAgICAgICByZXR1cm4gdHVpLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVuZEhlaWdodCwgYmFzZUJvdW5kLCBib3VuZDtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGVuZEhlaWdodCA9IHZhbHVlICogZGltZW5zaW9uLmhlaWdodDtcbiAgICAgICAgICAgICAgICBiYXNlQm91bmQgPSB7XG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IHBhZGRpbmdMZWZ0LFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogYmFyV2lkdGhcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGJvdW5kID0gdGhpcy5fbWFrZUNvbHVtbkNoYXJ0Qm91bmQoe1xuICAgICAgICAgICAgICAgICAgICBiYXNlQm91bmQ6IGJhc2VCb3VuZCxcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRUb3A6IGRpbWVuc2lvbi5oZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIGVuZFRvcDogZGltZW5zaW9uLmhlaWdodCAtIGVuZEhlaWdodCAtIHRvcCxcbiAgICAgICAgICAgICAgICAgICAgZW5kSGVpZ2h0OiBlbmRIZWlnaHRcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHRvcCArPSBlbmRIZWlnaHQ7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJvdW5kO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgICByZXR1cm4gYm91bmRzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGJvdW5kcyBvZiBjb2x1bW4gY2hhcnQuXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0Om51bWJlcn19IGRpbWVuc2lvbiBjb2x1bW4gY2hhcnQgZGltZW5zaW9uXG4gICAgICogQHJldHVybnMge2FycmF5LjxhcnJheS48b2JqZWN0Pj59IGJvdW5kc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VCb3VuZHM6IGZ1bmN0aW9uKGRpbWVuc2lvbikge1xuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5zdGFja2VkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbWFrZU5vcm1hbENvbHVtbkNoYXJ0Qm91bmRzKGRpbWVuc2lvbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbWFrZVN0YWNrZWRDb2x1bW5DaGFydEJvdW5kcyhkaW1lbnNpb24pO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2Ugc2VyaWVzIHJlbmRlcmluZyBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7b2JlamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMudmFsdWUgdmFsdWVcbiAgICAgKiAgICAgIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXIsIHdpZHRoOm51bWJlciwgd2lkdGg6bnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IHBhcmFtcy5ib3VuZCBib3VuZFxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5mb3JtYXR0ZWRWYWx1ZSBmb3JtYXR0ZWQgdmFsdWVcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMubGFiZWxIZWlnaHQgbGFiZWwgaGVpZ2h0XG4gICAgICogQHJldHVybnMge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gcmVuZGVyaW5nIHBvc2l0aW9uXG4gICAgICovXG4gICAgbWFrZVNlcmllc1JlbmRlcmluZ1Bvc2l0aW9uOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGxhYmVsV2lkdGggPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxXaWR0aChwYXJhbXMuZm9ybWF0dGVkVmFsdWUsIHRoaXMudGhlbWUubGFiZWwpLFxuICAgICAgICAgICAgYm91bmQgPSBwYXJhbXMuYm91bmQsXG4gICAgICAgICAgICB0b3AgPSBib3VuZC50b3AsXG4gICAgICAgICAgICBsZWZ0ID0gYm91bmQubGVmdCArIChib3VuZC53aWR0aCAtIGxhYmVsV2lkdGgpIC8gMjtcblxuICAgICAgICBpZiAocGFyYW1zLnZhbHVlID49IDApIHtcbiAgICAgICAgICAgIHRvcCAtPSBwYXJhbXMubGFiZWxIZWlnaHQgKyBjaGFydENvbnN0LlNFUklFU19MQUJFTF9QQURESU5HO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdG9wICs9IGJvdW5kLmhlaWdodCArIGNoYXJ0Q29uc3QuU0VSSUVTX0xBQkVMX1BBRERJTkc7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbGVmdDogbGVmdCxcbiAgICAgICAgICAgIHRvcDogdG9wXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2Ugc3VtIGxhYmVsIGh0bWwuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxudW1iZXI+fSBwYXJhbXMudmFsdWVzIHZhbHVlc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48ZnVuY3Rpb24+fSBwYXJhbXMuZm9ybWF0RnVuY3Rpb25zIGZvcm1hdHRpbmcgZnVuY3Rpb25zXG4gICAgICogICAgICBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gcGFyYW1zLmJvdW5kIGJvdW5kXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmxhYmVsSGVpZ2h0IGxhYmVsIGhlaWdodFxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IHN1bSBsYWJlbCBodG1sXG4gICAgICovXG4gICAgbWFrZVN1bUxhYmVsSHRtbDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBzdW0gPSB0aGlzLm1ha2VTdW1WYWx1ZXMocGFyYW1zLnZhbHVlcywgcGFyYW1zLmZvcm1hdEZ1bmN0aW9ucyksXG4gICAgICAgICAgICBib3VuZCA9IHBhcmFtcy5ib3VuZCxcbiAgICAgICAgICAgIGxhYmVsV2lkdGggPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxXaWR0aChzdW0sIHRoaXMudGhlbWUubGFiZWwpLFxuICAgICAgICAgICAgbGVmdCA9IGJvdW5kLmxlZnQgKyAoKGJvdW5kLndpZHRoIC0gbGFiZWxXaWR0aCArIGNoYXJ0Q29uc3QuVEVYVF9QQURESU5HKSAvIDIpLFxuICAgICAgICAgICAgdG9wID0gYm91bmQudG9wIC0gcGFyYW1zLmxhYmVsSGVpZ2h0IC0gY2hhcnRDb25zdC5TRVJJRVNfTEFCRUxfUEFERElORztcblxuICAgICAgICByZXR1cm4gdGhpcy5tYWtlU2VyaWVzTGFiZWxIdG1sKHtcbiAgICAgICAgICAgIGxlZnQ6IGxlZnQsXG4gICAgICAgICAgICB0b3A6IHRvcFxuICAgICAgICB9LCBzdW0sIC0xLCAtMSk7XG4gICAgfVxufSk7XG5cbkJhclR5cGVTZXJpZXNCYXNlLm1peGluKENvbHVtbkNoYXJ0U2VyaWVzKTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb2x1bW5DaGFydFNlcmllcztcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBMaW5lIGNoYXJ0IHNlcmllcyBjb21wb25lbnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTZXJpZXMgPSByZXF1aXJlKCcuL3NlcmllcycpLFxuICAgIExpbmVUeXBlU2VyaWVzQmFzZSA9IHJlcXVpcmUoJy4vbGluZVR5cGVTZXJpZXNCYXNlJyk7XG5cbnZhciBMaW5lQ2hhcnRTZXJpZXMgPSB0dWkudXRpbC5kZWZpbmVDbGFzcyhTZXJpZXMsIC8qKiBAbGVuZHMgTGluZUNoYXJ0U2VyaWVzLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogTGluZSBjaGFydCBzZXJpZXMgY29tcG9uZW50LlxuICAgICAqIEBjb25zdHJ1Y3RzIExpbmVDaGFydFNlcmllc1xuICAgICAqIEBleHRlbmRzIFNlcmllc1xuICAgICAqIEBtaXhlcyBMaW5lVHlwZVNlcmllc0Jhc2VcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMubW9kZWwgc2VyaWVzIG1vZGVsXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgc2VyaWVzIG9wdGlvbnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgc2VyaWVzIHRoZW1lXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIFNlcmllcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHNlcmllcyBkYXRhLlxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IGFkZCBkYXRhXG4gICAgICovXG4gICAgbWFrZVNlcmllc0RhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZ3JvdXBQb3NpdGlvbnM6IHRoaXMubWFrZVBvc2l0aW9ucyh0aGlzLmJvdW5kLmRpbWVuc2lvbilcbiAgICAgICAgfTtcbiAgICB9XG59KTtcblxuTGluZVR5cGVTZXJpZXNCYXNlLm1peGluKExpbmVDaGFydFNlcmllcyk7XG5cbm1vZHVsZS5leHBvcnRzID0gTGluZUNoYXJ0U2VyaWVzO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IExpbmVUeXBlU2VyaWVzQmFzZSBpcyBiYXNlIGNsYXNzIGZvciBsaW5lIHR5cGUgc2VyaWVzLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4uL2NvbnN0JyksXG4gICAgZG9tID0gcmVxdWlyZSgnLi4vaGVscGVycy9kb21IYW5kbGVyJyksXG4gICAgcmVuZGVyVXRpbCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvcmVuZGVyVXRpbCcpO1xuLyoqXG4gKiBAY2xhc3NkZXNjIExpbmVUeXBlU2VyaWVzQmFzZSBpcyBiYXNlIGNsYXNzIGZvciBsaW5lIHR5cGUgc2VyaWVzLlxuICogQGNsYXNzIExpbmVUeXBlU2VyaWVzQmFzZVxuICogQG1peGluXG4gKi9cbnZhciBMaW5lVHlwZVNlcmllc0Jhc2UgPSB0dWkudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIExpbmVUeXBlU2VyaWVzQmFzZS5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgcG9zaXRpb25zIG9mIGxpbmUgY2hhcnQuXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0Om51bmJlcn19IGRpbWVuc2lvbiBsaW5lIGNoYXJ0IGRpbWVuc2lvblxuICAgICAqIEByZXR1cm5zIHthcnJheS48YXJyYXkuPG9iamVjdD4+fSBwb3NpdGlvbnNcbiAgICAgKi9cbiAgICBtYWtlUG9zaXRpb25zOiBmdW5jdGlvbihkaW1lbnNpb24pIHtcbiAgICAgICAgdmFyIGdyb3VwVmFsdWVzID0gdGhpcy5wZXJjZW50VmFsdWVzLFxuICAgICAgICAgICAgd2lkdGggPSBkaW1lbnNpb24ud2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQgPSBkaW1lbnNpb24uaGVpZ2h0LFxuICAgICAgICAgICAgbGVuID0gZ3JvdXBWYWx1ZXNbMF0ubGVuZ3RoLFxuICAgICAgICAgICAgc3RlcCwgc3RhcnQsIHJlc3VsdDtcbiAgICAgICAgaWYgKHRoaXMuYWxpZ25lZCkge1xuICAgICAgICAgICAgc3RlcCA9IHdpZHRoIC8gKGxlbiAtIDEpO1xuICAgICAgICAgICAgc3RhcnQgPSAwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RlcCA9IHdpZHRoIC8gbGVuO1xuICAgICAgICAgICAgc3RhcnQgPSBzdGVwIC8gMjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlc3VsdCA9IHR1aS51dGlsLm1hcChncm91cFZhbHVlcywgZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgICAgICByZXR1cm4gdHVpLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogc3RhcnQgKyAoc3RlcCAqIGluZGV4KSArIGNoYXJ0Q29uc3QuU0VSSUVTX0VYUEFORF9TSVpFLFxuICAgICAgICAgICAgICAgICAgICB0b3A6IGhlaWdodCAtICh2YWx1ZSAqIGhlaWdodClcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmdyb3VwUG9zaXRpb25zID0gcmVzdWx0O1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgc2VyaWVzIGxhYmVsLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtIVE1MRWxlbWVudH0gcGFyYW1zLmNvbnRhaW5lciBjb250YWluZXJcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPGFycmF5Pn0gcGFyYW1zLmdyb3VwUG9zaXRpb25zIGdyb3VwIHBvc2l0aW9uc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48YXJyYXk+fSBwYXJhbXMuZm9ybWF0dGVkVmFsdWVzIGZvcm1hdHRlZCB2YWx1ZXNcbiAgICAgKiBAcmV0dXJuIHtIVE1MRWxlbWVudH0gc2VyaWVzIGFyZWEgZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlclNlcmllc0xhYmVsOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGdyb3VwUG9zaXRpb25zLCBsYWJlbEhlaWdodCwgZWxTZXJpZXNMYWJlbEFyZWEsIGh0bWw7XG5cbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuc2hvd0xhYmVsKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBncm91cFBvc2l0aW9ucyA9IHBhcmFtcy5ncm91cFBvc2l0aW9ucztcbiAgICAgICAgbGFiZWxIZWlnaHQgPSByZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxIZWlnaHQocGFyYW1zLmZvcm1hdHRlZFZhbHVlc1swXVswXSwgdGhpcy50aGVtZS5sYWJlbCk7XG4gICAgICAgIGVsU2VyaWVzTGFiZWxBcmVhID0gZG9tLmNyZWF0ZSgnZGl2JywgJ3R1aS1jaGFydC1zZXJpZXMtbGFiZWwtYXJlYScpO1xuXG4gICAgICAgIGh0bWwgPSB0dWkudXRpbC5tYXAocGFyYW1zLmZvcm1hdHRlZFZhbHVlcywgZnVuY3Rpb24odmFsdWVzLCBncm91cEluZGV4KSB7XG4gICAgICAgICAgICByZXR1cm4gdHVpLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdmFyIHBvc2l0aW9uID0gZ3JvdXBQb3NpdGlvbnNbZ3JvdXBJbmRleF1baW5kZXhdLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbFdpZHRoID0gcmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsV2lkdGgodmFsdWUsIHRoaXMudGhlbWUubGFiZWwpLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbEh0bWwgPSB0aGlzLm1ha2VTZXJpZXNMYWJlbEh0bWwoe1xuICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogcG9zaXRpb24ubGVmdCAtIChsYWJlbFdpZHRoIC8gMiksXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3A6IHBvc2l0aW9uLnRvcCAtIGxhYmVsSGVpZ2h0IC0gY2hhcnRDb25zdC5TRVJJRVNfTEFCRUxfUEFERElOR1xuICAgICAgICAgICAgICAgICAgICB9LCB2YWx1ZSwgaW5kZXgsIGdyb3VwSW5kZXgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBsYWJlbEh0bWw7XG4gICAgICAgICAgICB9LCB0aGlzKS5qb2luKCcnKTtcbiAgICAgICAgfSwgdGhpcykuam9pbignJyk7XG5cbiAgICAgICAgZWxTZXJpZXNMYWJlbEFyZWEuaW5uZXJIVE1MID0gaHRtbDtcbiAgICAgICAgcGFyYW1zLmNvbnRhaW5lci5hcHBlbmRDaGlsZChlbFNlcmllc0xhYmVsQXJlYSk7XG5cbiAgICAgICAgcmV0dXJuIGVsU2VyaWVzTGFiZWxBcmVhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgYm91bmQuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGdyb3VwSW5kZXggZ3JvdXAgaW5kZXhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggaW5kZXhcbiAgICAgKiBAcmV0dXJucyB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBib3VuZFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldEJvdW5kOiBmdW5jdGlvbihncm91cEluZGV4LCBpbmRleCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ncm91cFBvc2l0aW9uc1tpbmRleF1bZ3JvdXBJbmRleF07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZpbmQgaW5kZXguXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGdyb3VwSW5kZXggZ3JvdXAgaW5kZXhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbGF5ZXJZIG1vdXNlIHBvc2l0aW9uXG4gICAgICogQHJldHVybnMge251bWJlcn0gaW5kZXhcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9maW5kSW5kZXg6IGZ1bmN0aW9uKGdyb3VwSW5kZXgsIGxheWVyWSkge1xuICAgICAgICB2YXIgZm91bmRJbmRleCA9IC0xLFxuICAgICAgICAgICAgZGlmZiA9IDEwMDA7XG5cbiAgICAgICAgaWYgKCF0aGlzLnRpY2tJdGVtcykge1xuICAgICAgICAgICAgdGhpcy50aWNrSXRlbXMgPSB0dWkudXRpbC5waXZvdCh0aGlzLmdyb3VwUG9zaXRpb25zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHR1aS51dGlsLmZvckVhY2godGhpcy50aWNrSXRlbXNbZ3JvdXBJbmRleF0sIGZ1bmN0aW9uKHBvc2l0aW9uLCBpbmRleCkge1xuICAgICAgICAgICAgdmFyIGNvbXBhcmUgPSBNYXRoLmFicyhsYXllclkgLSBwb3NpdGlvbi50b3ApO1xuICAgICAgICAgICAgaWYgKGRpZmYgPiBjb21wYXJlKSB7XG4gICAgICAgICAgICAgICAgZGlmZiA9IGNvbXBhcmU7XG4gICAgICAgICAgICAgICAgZm91bmRJbmRleCA9IGluZGV4O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGZvdW5kSW5kZXg7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgY2hhbmdlZCBvciBub3QuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGdyb3VwSW5kZXggZ3JvdXAgaW5kZXhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggaW5kZXhcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gd2hldGhlciBjaGFuZ2VkIG9yIG5vdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2lzQ2hhbmdlZDogZnVuY3Rpb24oZ3JvdXBJbmRleCwgaW5kZXgpIHtcbiAgICAgICAgdmFyIHByZXZJbmRleGVzID0gdGhpcy5wcmV2SW5kZXhlcztcblxuICAgICAgICB0aGlzLnByZXZJbmRleGVzID0ge1xuICAgICAgICAgICAgZ3JvdXBJbmRleDogZ3JvdXBJbmRleCxcbiAgICAgICAgICAgIGluZGV4OiBpbmRleFxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiAhcHJldkluZGV4ZXMgfHwgKHByZXZJbmRleGVzLmdyb3VwSW5kZXggIT09IGdyb3VwSW5kZXgpIHx8IChwcmV2SW5kZXhlcy5pbmRleCAhPT0gaW5kZXgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBPbiBvdmVyIHRpY2sgc2VjdG9yLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBncm91cEluZGV4IGdyb3VwSW5kZXhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbGF5ZXJZIGxheWVyWVxuICAgICAqL1xuICAgIG9uTGluZVR5cGVPdmVyVGlja1NlY3RvcjogZnVuY3Rpb24oZ3JvdXBJbmRleCwgbGF5ZXJZKSB7XG4gICAgICAgIHZhciBpbmRleCwgcHJldkluZGV4ZXM7XG5cbiAgICAgICAgaW5kZXggPSB0aGlzLl9maW5kSW5kZXgoZ3JvdXBJbmRleCwgbGF5ZXJZKTtcbiAgICAgICAgcHJldkluZGV4ZXMgPSB0aGlzLnByZXZJbmRleGVzO1xuXG4gICAgICAgIGlmICghdGhpcy5faXNDaGFuZ2VkKGdyb3VwSW5kZXgsIGluZGV4KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByZXZJbmRleGVzKSB7XG4gICAgICAgICAgICB0aGlzLm91dENhbGxiYWNrKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmluQ2FsbGJhY2sodGhpcy5fZ2V0Qm91bmQoZ3JvdXBJbmRleCwgaW5kZXgpLCBncm91cEluZGV4LCBpbmRleCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE9uIG91dCB0aWNrIHNlY3Rvci5cbiAgICAgKi9cbiAgICBvbkxpbmVUeXBlT3V0VGlja1NlY3RvcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLnByZXZJbmRleGVzO1xuICAgICAgICB0aGlzLm91dENhbGxiYWNrKCk7XG4gICAgfVxufSk7XG5cbkxpbmVUeXBlU2VyaWVzQmFzZS5taXhpbiA9IGZ1bmN0aW9uKGZ1bmMpIHtcbiAgICB0dWkudXRpbC5leHRlbmQoZnVuYy5wcm90b3R5cGUsIExpbmVUeXBlU2VyaWVzQmFzZS5wcm90b3R5cGUpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBMaW5lVHlwZVNlcmllc0Jhc2U7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgUGllIGNoYXJ0IHNlcmllcyBjb21wb25lbnQuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTZXJpZXMgPSByZXF1aXJlKCcuL3NlcmllcycpLFxuICAgIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuLi9jb25zdCcpLFxuICAgIGRvbSA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZG9tSGFuZGxlcicpLFxuICAgIHJlbmRlclV0aWwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3JlbmRlclV0aWwnKTtcblxudmFyIFBpZUNoYXJ0U2VyaWVzID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoU2VyaWVzLCAvKiogQGxlbmRzIFBpZUNoYXJ0U2VyaWVzLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogTGluZSBjaGFydCBzZXJpZXMgY29tcG9uZW50LlxuICAgICAqIEBjb25zdHJ1Y3RzIFBpZUNoYXJ0U2VyaWVzXG4gICAgICogQGV4dGVuZHMgU2VyaWVzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm1vZGVsIHNlcmllcyBtb2RlbFxuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5vcHRpb25zIHNlcmllcyBvcHRpb25zXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIHNlcmllcyB0aGVtZVxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBTZXJpZXMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBwZXJjZW50IHZhbHVlLlxuICAgICAqIEBwYXJhbSB7e3ZhbHVlczogYXJyYXksIHNjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX19IGRhdGEgc2VyaWVzIGRhdGFcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxudW1iZXI+Pn0gcGVyY2VudCB2YWx1ZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlUGVyY2VudFZhbHVlczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gdHVpLnV0aWwubWFwKGRhdGEudmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgICAgIHZhciBzdW0gPSB0dWkudXRpbC5zdW0odmFsdWVzKTtcbiAgICAgICAgICAgIHJldHVybiB0dWkudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSAvIHN1bTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBzZWN0b3JzIGluZm9ybWF0aW9uLlxuICAgICAqIEBwYXJhbSB7YXJyYXkuPG51bWJlcj59IHBlcmNlbnRWYWx1ZXMgcGVyY2VudCB2YWx1ZXNcbiAgICAgKiBAcGFyYW0ge3tjeDogbnVtYmVyLCBjeTogbnVtYmVyLCByOiBudW1iZXJ9fSBjaXJjbGVCb3VuZCBjaXJjbGUgYm91bmRcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPG9iamVjdD59IHNlY3RvcnMgaW5mb3JtYXRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlU2VjdG9yc0luZm86IGZ1bmN0aW9uKHBlcmNlbnRWYWx1ZXMsIGNpcmNsZUJvdW5kKSB7XG4gICAgICAgIHZhciBjeCA9IGNpcmNsZUJvdW5kLmN4LFxuICAgICAgICAgICAgY3kgPSBjaXJjbGVCb3VuZC5jeSxcbiAgICAgICAgICAgIHIgPSBjaXJjbGVCb3VuZC5yLFxuICAgICAgICAgICAgYW5nbGUgPSAwLFxuICAgICAgICAgICAgZGVsdGEgPSAxMCxcbiAgICAgICAgICAgIHBhdGhzO1xuXG4gICAgICAgIHBhdGhzID0gdHVpLnV0aWwubWFwKHBlcmNlbnRWYWx1ZXMsIGZ1bmN0aW9uKHBlcmNlbnRWYWx1ZSkge1xuICAgICAgICAgICAgdmFyIGFkZEFuZ2xlID0gY2hhcnRDb25zdC5BTkdMRV8zNjAgKiBwZXJjZW50VmFsdWUsXG4gICAgICAgICAgICAgICAgZW5kQW5nbGUgPSBhbmdsZSArIGFkZEFuZ2xlLFxuICAgICAgICAgICAgICAgIHBvcHVwQW5nbGUgPSBhbmdsZSArIChhZGRBbmdsZSAvIDIpLFxuICAgICAgICAgICAgICAgIGFuZ2xlcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0QW5nbGU6IGFuZ2xlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kQW5nbGU6IGFuZ2xlXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGVuZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRBbmdsZTogYW5nbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmRBbmdsZTogZW5kQW5nbGVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcG9zaXRpb25EYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICBjeDogY3gsXG4gICAgICAgICAgICAgICAgICAgIGN5OiBjeSxcbiAgICAgICAgICAgICAgICAgICAgYW5nbGU6IHBvcHVwQW5nbGVcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgYW5nbGUgPSBlbmRBbmdsZTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcGVyY2VudFZhbHVlOiBwZXJjZW50VmFsdWUsXG4gICAgICAgICAgICAgICAgYW5nbGVzOiBhbmdsZXMsXG4gICAgICAgICAgICAgICAgcG9wdXBQb3NpdGlvbjogdGhpcy5fZ2V0QXJjUG9zaXRpb24odHVpLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICAgICAgcjogciArIGRlbHRhXG4gICAgICAgICAgICAgICAgfSwgcG9zaXRpb25EYXRhKSksXG4gICAgICAgICAgICAgICAgY2VudGVyUG9zaXRpb246IHRoaXMuX2dldEFyY1Bvc2l0aW9uKHR1aS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgICAgIHI6IChyIC8gMikgKyBkZWx0YVxuICAgICAgICAgICAgICAgIH0sIHBvc2l0aW9uRGF0YSkpLFxuICAgICAgICAgICAgICAgIG91dGVyUG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IHRoaXMuX2dldEFyY1Bvc2l0aW9uKHR1aS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgICAgICAgICByOiByXG4gICAgICAgICAgICAgICAgICAgIH0sIHBvc2l0aW9uRGF0YSkpLFxuICAgICAgICAgICAgICAgICAgICBtaWRkbGU6IHRoaXMuX2dldEFyY1Bvc2l0aW9uKHR1aS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgICAgICAgICByOiByICsgZGVsdGFcbiAgICAgICAgICAgICAgICAgICAgfSwgcG9zaXRpb25EYXRhKSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICByZXR1cm4gcGF0aHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2Ugc2VyaWVzIGRhdGEuXG4gICAgICogQHJldHVybnMge3tcbiAgICAgKiAgICAgIGZvcm1hdHRlZFZhbHVlczogYXJyYXksXG4gICAgICogICAgICBjaGFydEJhY2tncm91bmQ6IHN0cmluZyxcbiAgICAgKiAgICAgIGNpcmNsZUJvdW5kOiAoe2N4OiBudW1iZXIsIGN5OiBudW1iZXIsIHI6IG51bWJlcn0pLFxuICAgICAqICAgICAgc2VjdG9yc0luZm86IGFycmF5LjxvYmplY3Q+XG4gICAgICogfX0gYWRkIGRhdGEgZm9yIGdyYXBoIHJlbmRlcmluZ1xuICAgICAqL1xuICAgIG1ha2VTZXJpZXNEYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNpcmNsZUJvdW5kID0gdGhpcy5fbWFrZUNpcmNsZUJvdW5kKHRoaXMuYm91bmQuZGltZW5zaW9uLCB7XG4gICAgICAgICAgICAgICAgc2hvd0xhYmVsOiB0aGlzLm9wdGlvbnMuc2hvd0xhYmVsLFxuICAgICAgICAgICAgICAgIGxlZ2VuZFR5cGU6IHRoaXMub3B0aW9ucy5sZWdlbmRUeXBlXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIHNlY3RvcnNJbmZvID0gdGhpcy5fbWFrZVNlY3RvcnNJbmZvKHRoaXMucGVyY2VudFZhbHVlc1swXSwgY2lyY2xlQm91bmQpO1xuXG4gICAgICAgIHRoaXMucG9wdXBQb3NpdGlvbnMgPSB0dWkudXRpbC5wbHVjayhzZWN0b3JzSW5mbywgJ3BvcHVwUG9zaXRpb24nKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNoYXJ0QmFja2dyb3VuZDogdGhpcy5jaGFydEJhY2tncm91bmQsXG4gICAgICAgICAgICBjaXJjbGVCb3VuZDogY2lyY2xlQm91bmQsXG4gICAgICAgICAgICBzZWN0b3JzSW5mbzogc2VjdG9yc0luZm9cbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBjaXJjbGUgYm91bmRcbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6bnVtYmVyfX0gZGltZW5zaW9uIGNoYXJ0IGRpbWVuc2lvblxuICAgICAqIEBwYXJhbSB7e3Nob3dMYWJlbDogYm9vbGVhbiwgbGVnZW5kVHlwZTogc3RyaW5nfX0gb3B0aW9ucyBvcHRpb25zXG4gICAgICogQHJldHVybnMge3tjeDogbnVtYmVyLCBjeTogbnVtYmVyLCByOiBudW1iZXJ9fSBjaXJjbGUgYm91bmRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUNpcmNsZUJvdW5kOiBmdW5jdGlvbihkaW1lbnNpb24sIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIHdpZHRoID0gZGltZW5zaW9uLndpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0ID0gZGltZW5zaW9uLmhlaWdodCxcbiAgICAgICAgICAgIGlzU21hbGxQaWUgPSBvcHRpb25zLmxlZ2VuZFR5cGUgPT09IGNoYXJ0Q29uc3QuU0VSSUVTX0xFR0VORF9UWVBFX09VVEVSICYmIG9wdGlvbnMuc2hvd0xhYmVsLFxuICAgICAgICAgICAgcmFkaXVzUmF0ZSA9IGlzU21hbGxQaWUgPyBjaGFydENvbnN0LlBJRV9HUkFQSF9TTUFMTF9SQVRFIDogY2hhcnRDb25zdC5QSUVfR1JBUEhfREVGQVVMVF9SQVRFLFxuICAgICAgICAgICAgZGlhbWV0ZXIgPSB0dWkudXRpbC5tdWx0aXBsaWNhdGlvbih0dWkudXRpbC5taW4oW3dpZHRoLCBoZWlnaHRdKSwgcmFkaXVzUmF0ZSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjeDogdHVpLnV0aWwuZGl2aXNpb24od2lkdGgsIDIpLFxuICAgICAgICAgICAgY3k6IHR1aS51dGlsLmRpdmlzaW9uKGhlaWdodCwgMiksXG4gICAgICAgICAgICByOiB0dWkudXRpbC5kaXZpc2lvbihkaWFtZXRlciwgMilcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGFyYyBwb3NpdGlvbi5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuY3ggY2VudGVyIHhcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuY3kgY2VudGVyIHlcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuciByYWRpdXNcbiAgICAgKiAgICAgIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMuYW5nbGUgYW5nbGUoZGVncmVlKVxuICAgICAqIEByZXR1cm5zIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IGFyYyBwb3NpdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldEFyY1Bvc2l0aW9uOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxlZnQ6IHBhcmFtcy5jeCArIChwYXJhbXMuciAqIE1hdGguc2luKHBhcmFtcy5hbmdsZSAqIGNoYXJ0Q29uc3QuUkFEKSksXG4gICAgICAgICAgICB0b3A6IHBhcmFtcy5jeSAtIChwYXJhbXMuciAqIE1hdGguY29zKHBhcmFtcy5hbmdsZSAqIGNoYXJ0Q29uc3QuUkFEKSlcbiAgICAgICAgfTtcbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGFkZCBkYXRhIGZvciBzZXJpZXMgbGFiZWwuXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNvbnRhaW5lclxuICAgICAqIEByZXR1cm5zIHt7XG4gICAgICogICAgICBjb250YWluZXI6IEhUTUxFbGVtZW50LFxuICAgICAqICAgICAgbGVnZW5kTGFiZWxzOiBhcnJheS48c3RyaW5nPixcbiAgICAgKiAgICAgIG9wdGlvbnM6IHtsZWdlbmRUeXBlOiBzdHJpbmcsIHNob3dMYWJlbDogYm9vbGVhbn0sXG4gICAgICogICAgICBjaGFydFdpZHRoOiBudW1iZXIsXG4gICAgICogICAgICBmb3JtYXR0ZWRWYWx1ZXM6IGFycmF5XG4gICAgICogfX0gYWRkIGRhdGEgZm9yIG1ha2Ugc2VyaWVzIGxhYmVsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVNlcmllc0RhdGFGb3JTZXJpZXNMYWJlbDogZnVuY3Rpb24oY29udGFpbmVyKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjb250YWluZXI6IGNvbnRhaW5lcixcbiAgICAgICAgICAgIGxlZ2VuZExhYmVsczogdGhpcy5kYXRhLmxlZ2VuZExhYmVscyxcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICBsZWdlbmRUeXBlOiB0aGlzLm9wdGlvbnMubGVnZW5kVHlwZSxcbiAgICAgICAgICAgICAgICBzaG93TGFiZWw6IHRoaXMub3B0aW9ucy5zaG93TGFiZWxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjaGFydFdpZHRoOiB0aGlzLmRhdGEuY2hhcnRXaWR0aCxcbiAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlczogdGhpcy5kYXRhLmZvcm1hdHRlZFZhbHVlc1swXVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgc2VyaWVzIGxhYmVsLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5sZWdlbmQgbGVnZW5kXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLmxhYmVsIGxhYmVsXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLnNlcGFyYXRvciBzZXBhcmF0b3JcbiAgICAgKiAgICAgIEBwYXJhbSB7e2xlZ2VuZFR5cGU6IGJvb2xlYW4sIHNob3dMYWJlbDogYm9vbGVhbn19IHBhcmFtcy5vcHRpb25zIG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBzZXJpZXMgbGFiZWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRTZXJpZXNMYWJlbDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBzZXJpZXNMYWJlbCA9ICcnO1xuICAgICAgICBpZiAocGFyYW1zLm9wdGlvbnMubGVnZW5kVHlwZSkge1xuICAgICAgICAgICAgc2VyaWVzTGFiZWwgPSBwYXJhbXMubGVnZW5kO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhcmFtcy5vcHRpb25zLnNob3dMYWJlbCkge1xuICAgICAgICAgICAgc2VyaWVzTGFiZWwgKz0gKHNlcmllc0xhYmVsID8gcGFyYW1zLnNlcGFyYXRvciA6ICcnKSArIHBhcmFtcy5sYWJlbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzZXJpZXNMYWJlbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGNlbnRlciBsZWdlbmQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY29udGFpbmVyXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBsZWdlbmRzIGxlZ2VuZHNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPG9iamVjdD59IGNlbnRlclBvc2l0aW9ucyBjZW50ZXIgcG9zaXRpb25zXG4gICAgICogQHJldHVybiB7SFRNTEVsZW1lbnR9IHNlcmllcyBhcmVhIGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJMZWdlbmRMYWJlbDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBwb3NpdGlvbnMgPSBwYXJhbXMucG9zaXRpb25zLFxuICAgICAgICAgICAgZm9ybWF0dGVkVmFsdWVzID0gcGFyYW1zLmZvcm1hdHRlZFZhbHVlcyxcbiAgICAgICAgICAgIGVsU2VyaWVzTGFiZWxBcmVhID0gZG9tLmNyZWF0ZSgnZGl2JywgJ3R1aS1jaGFydC1zZXJpZXMtbGFiZWwtYXJlYScpLFxuICAgICAgICAgICAgaHRtbDtcblxuICAgICAgICBodG1sID0gdHVpLnV0aWwubWFwKHBhcmFtcy5sZWdlbmRMYWJlbHMsIGZ1bmN0aW9uKGxlZ2VuZCwgaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBsYWJlbCA9IHRoaXMuX2dldFNlcmllc0xhYmVsKHtcbiAgICAgICAgICAgICAgICAgICAgbGVnZW5kOiBsZWdlbmQsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiBmb3JtYXR0ZWRWYWx1ZXNbaW5kZXhdLFxuICAgICAgICAgICAgICAgICAgICBzZXBhcmF0b3I6IHBhcmFtcy5zZXBhcmF0b3IsXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IHBhcmFtcy5vcHRpb25zXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgcG9zaXRpb24gPSBwYXJhbXMubW92ZVRvUG9zaXRpb24ocG9zaXRpb25zW2luZGV4XSwgbGFiZWwpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubWFrZVNlcmllc0xhYmVsSHRtbChwb3NpdGlvbiwgbGFiZWwsIDAsIGluZGV4KTtcbiAgICAgICAgfSwgdGhpcykuam9pbignJyk7XG5cbiAgICAgICAgZWxTZXJpZXNMYWJlbEFyZWEuaW5uZXJIVE1MID0gaHRtbDtcbiAgICAgICAgcGFyYW1zLmNvbnRhaW5lci5hcHBlbmRDaGlsZChlbFNlcmllc0xhYmVsQXJlYSk7XG5cbiAgICAgICAgcmV0dXJuIGVsU2VyaWVzTGFiZWxBcmVhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBNb3ZlIHRvIGNlbnRlciBwb3NpdGlvbi5cbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gcG9zaXRpb24gcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbGFiZWwgbGFiZWxcbiAgICAgKiBAcmV0dXJucyB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBjZW50ZXIgcG9zaXRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tb3ZlVG9DZW50ZXJQb3NpdGlvbjogZnVuY3Rpb24ocG9zaXRpb24sIGxhYmVsKSB7XG4gICAgICAgIHZhciBsZWZ0ID0gcG9zaXRpb24ubGVmdCAtIChyZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxXaWR0aChsYWJlbCwgdGhpcy50aGVtZS5sYWJlbCkgLyAyKSxcbiAgICAgICAgICAgIHRvcCA9IHBvc2l0aW9uLnRvcCAtIChyZW5kZXJVdGlsLmdldFJlbmRlcmVkTGFiZWxIZWlnaHQobGFiZWwsIHRoaXMudGhlbWUubGFiZWwpIC8gMik7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsZWZ0OiBsZWZ0LFxuICAgICAgICAgICAgdG9wOiB0b3BcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGNlbnRlciBsZWdlbmQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgY29udGFpbmVyXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5LjxzdHJpbmc+fSBsZWdlbmRzIGxlZ2VuZHNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPG9iamVjdD59IGNlbnRlclBvc2l0aW9ucyBjZW50ZXIgcG9zaXRpb25zXG4gICAgICogQHJldHVybiB7SFRNTEVsZW1lbnR9IGFyZWEgZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlckNlbnRlckxlZ2VuZDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBlbEFyZWEgPSB0aGlzLl9yZW5kZXJMZWdlbmRMYWJlbCh0dWkudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgcG9zaXRpb25zOiB0dWkudXRpbC5wbHVjayhwYXJhbXMuc2VjdG9yc0luZm8sICdjZW50ZXJQb3NpdGlvbicpLFxuICAgICAgICAgICAgbW92ZVRvUG9zaXRpb246IHR1aS51dGlsLmJpbmQodGhpcy5fbW92ZVRvQ2VudGVyUG9zaXRpb24sIHRoaXMpLFxuICAgICAgICAgICAgc2VwYXJhdG9yOiAnPGJyPidcbiAgICAgICAgfSwgcGFyYW1zKSk7XG5cbiAgICAgICAgcmV0dXJuIGVsQXJlYTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIGVuZCBwb3NpdGlvbi5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gY2VudGVyTGVmdCBjZW50ZXIgbGVmdFxuICAgICAqIEBwYXJhbSB7YXJyYXkuPG9iamVjdD59IHBvc2l0aW9ucyBwb3NpdGlvbnNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hZGRFbmRQb3NpdGlvbjogZnVuY3Rpb24oY2VudGVyTGVmdCwgcG9zaXRpb25zKSB7XG4gICAgICAgIHR1aS51dGlsLmZvckVhY2gocG9zaXRpb25zLCBmdW5jdGlvbihwb3NpdGlvbikge1xuICAgICAgICAgICAgdmFyIGVuZCA9IHR1aS51dGlsLmV4dGVuZCh7fSwgcG9zaXRpb24ubWlkZGxlKTtcbiAgICAgICAgICAgIGlmIChlbmQubGVmdCA8IGNlbnRlckxlZnQpIHtcbiAgICAgICAgICAgICAgICBlbmQubGVmdCAtPSBjaGFydENvbnN0LlNFUklFU19PVVRFUl9MQUJFTF9QQURESU5HO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBlbmQubGVmdCArPSBjaGFydENvbnN0LlNFUklFU19PVVRFUl9MQUJFTF9QQURESU5HO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcG9zaXRpb24uZW5kID0gZW5kO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTW92ZSB0byBvdXRlciBwb3NpdGlvbi5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gY2VudGVyTGVmdCBjZW50ZXIgbGVmdFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwb3NpdGlvbiBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBsYWJlbCBsYWJlbFxuICAgICAqIEByZXR1cm5zIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IG91dGVyIHBvc2l0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbW92ZVRvT3V0ZXJQb3NpdGlvbjogZnVuY3Rpb24oY2VudGVyTGVmdCwgcG9zaXRpb24sIGxhYmVsKSB7XG4gICAgICAgIHZhciBwb3NpdGlvbkVuZCA9IHBvc2l0aW9uLmVuZCxcbiAgICAgICAgICAgIGxlZnQgPSBwb3NpdGlvbkVuZC5sZWZ0LFxuICAgICAgICAgICAgdG9wID0gcG9zaXRpb25FbmQudG9wIC0gKHJlbmRlclV0aWwuZ2V0UmVuZGVyZWRMYWJlbEhlaWdodChsYWJlbCwgdGhpcy50aGVtZS5sYWJlbCkgLyAyKTtcblxuICAgICAgICBpZiAobGVmdCA8IGNlbnRlckxlZnQpIHtcbiAgICAgICAgICAgIGxlZnQgLT0gcmVuZGVyVXRpbC5nZXRSZW5kZXJlZExhYmVsV2lkdGgobGFiZWwsIHRoaXMudGhlbWUubGFiZWwpICsgY2hhcnRDb25zdC5TRVJJRVNfTEFCRUxfUEFERElORztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxlZnQgKz0gY2hhcnRDb25zdC5TRVJJRVNfTEFCRUxfUEFERElORztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsZWZ0OiBsZWZ0LFxuICAgICAgICAgICAgdG9wOiB0b3BcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIG91dGVyIGxlZ2VuZC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciBjb250YWluZXJcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGxlZ2VuZHMgbGVnZW5kc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48b2JqZWN0Pn0gY2VudGVyUG9zaXRpb25zIGNlbnRlciBwb3NpdGlvbnNcbiAgICAgKiBAcmV0dXJuIHtIVE1MRWxlbWVudH0gYXJlYSBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyT3V0ZXJMZWdlbmQ6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgb3V0ZXJQb3NpdGlvbnMgPSB0dWkudXRpbC5wbHVjayhwYXJhbXMuc2VjdG9yc0luZm8sICdvdXRlclBvc2l0aW9uJyksXG4gICAgICAgICAgICBjZW50ZXJMZWZ0ID0gcGFyYW1zLmNoYXJ0V2lkdGggLyAyLFxuICAgICAgICAgICAgZWxBcmVhO1xuXG4gICAgICAgIHRoaXMuX2FkZEVuZFBvc2l0aW9uKGNlbnRlckxlZnQsIG91dGVyUG9zaXRpb25zKTtcbiAgICAgICAgZWxBcmVhID0gdGhpcy5fcmVuZGVyTGVnZW5kTGFiZWwodHVpLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgIHBvc2l0aW9uczogb3V0ZXJQb3NpdGlvbnMsXG4gICAgICAgICAgICBtb3ZlVG9Qb3NpdGlvbjogdHVpLnV0aWwuYmluZCh0aGlzLl9tb3ZlVG9PdXRlclBvc2l0aW9uLCB0aGlzLCBjZW50ZXJMZWZ0KSxcbiAgICAgICAgICAgIHNlcGFyYXRvcjogJzombmJzcDsnXG4gICAgICAgIH0sIHBhcmFtcykpO1xuXG4gICAgICAgIGlmICh0aGlzLnBhcGVyKSB7XG4gICAgICAgICAgICB0aGlzLmdyYXBoUmVuZGVyZXIucmVuZGVyTGVnZW5kTGluZXModGhpcy5wYXBlciwgb3V0ZXJQb3NpdGlvbnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGVsQXJlYTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIHNlcmllcyBsYWJlbC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IGFyZWEgZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlclNlcmllc0xhYmVsOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGVsQXJlYTtcbiAgICAgICAgaWYgKHBhcmFtcy5vcHRpb25zLmxlZ2VuZFR5cGUgPT09IGNoYXJ0Q29uc3QuU0VSSUVTX0xFR0VORF9UWVBFX09VVEVSKSB7XG4gICAgICAgICAgICBlbEFyZWEgPSB0aGlzLl9yZW5kZXJPdXRlckxlZ2VuZChwYXJhbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZWxBcmVhID0gdGhpcy5fcmVuZGVyQ2VudGVyTGVnZW5kKHBhcmFtcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVsQXJlYTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGJvdW5kLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBncm91cEluZGV4IGdyb3VwIGluZGV4XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IGluZGV4XG4gICAgICogQHJldHVybnMge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gYm91bmRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRCb3VuZDogZnVuY3Rpb24oZ3JvdXBJbmRleCwgaW5kZXgpIHtcbiAgICAgICAgaWYgKGdyb3VwSW5kZXggPT09IC0xIHx8IGluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMucG9wdXBQb3NpdGlvbnNbaW5kZXhdO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTaG93IHNlcmllcyBsYWJlbCBhcmVhLlxuICAgICAqL1xuICAgIHNob3dTZXJpZXNMYWJlbEFyZWE6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmdyYXBoUmVuZGVyZXIuYW5pbWF0ZUxlZ2VuZExpbmVzKCk7XG4gICAgICAgIFNlcmllcy5wcm90b3R5cGUuc2hvd1Nlcmllc0xhYmVsQXJlYS5jYWxsKHRoaXMpO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBpZUNoYXJ0U2VyaWVzO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFNlcmllcyBiYXNlIGNvbXBvbmVudC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHNlcmllc1RlbXBsYXRlID0gcmVxdWlyZSgnLi9zZXJpZXNUZW1wbGF0ZScpLFxuICAgIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuLi9jb25zdCcpLFxuICAgIHN0YXRlID0gcmVxdWlyZSgnLi4vaGVscGVycy9zdGF0ZScpLFxuICAgIGRvbSA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZG9tSGFuZGxlcicpLFxuICAgIHJlbmRlclV0aWwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3JlbmRlclV0aWwnKSxcbiAgICBldmVudCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZXZlbnRMaXN0ZW5lcicpLFxuICAgIHBsdWdpbkZhY3RvcnkgPSByZXF1aXJlKCcuLi9mYWN0b3JpZXMvcGx1Z2luRmFjdG9yeScpO1xuXG52YXIgU0VSSUVTX0xBQkVMX0NMQVNTX05BTUUgPSAndHVpLWNoYXJ0LXNlcmllcy1sYWJlbCc7XG5cbnZhciBTZXJpZXMgPSB0dWkudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIFNlcmllcy5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIFNlcmllcyBiYXNlIGNvbXBvbmVudC5cbiAgICAgKiBAY29uc3RydWN0cyBTZXJpZXNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMubW9kZWwgc2VyaWVzIG1vZGVsXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLm9wdGlvbnMgc2VyaWVzIG9wdGlvbnNcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgc2VyaWVzIHRoZW1lXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBsaWJUeXBlO1xuXG4gICAgICAgIHR1aS51dGlsLmV4dGVuZCh0aGlzLCBwYXJhbXMpO1xuICAgICAgICBsaWJUeXBlID0gcGFyYW1zLmxpYlR5cGUgfHwgY2hhcnRDb25zdC5ERUZBVUxUX1BMVUdJTjtcbiAgICAgICAgdGhpcy5wZXJjZW50VmFsdWVzID0gdGhpcy5fbWFrZVBlcmNlbnRWYWx1ZXMocGFyYW1zLmRhdGEsIHBhcmFtcy5vcHRpb25zLnN0YWNrZWQpO1xuICAgICAgICAvKipcbiAgICAgICAgICogR3JhcGggcmVuZGVyZXJcbiAgICAgICAgICogQHR5cGUge29iamVjdH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ3JhcGhSZW5kZXJlciA9IHBsdWdpbkZhY3RvcnkuZ2V0KGxpYlR5cGUsIHBhcmFtcy5jaGFydFR5cGUpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZXJpZXMgdmlldyBjbGFzc05hbWVcbiAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2xhc3NOYW1lID0gJ3R1aS1jaGFydC1zZXJpZXMtYXJlYSc7XG5cbiAgICAgICAgdGhpcy5zZXJpZXNEYXRhID0gdGhpcy5tYWtlU2VyaWVzRGF0YSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHNlcmllcyBkYXRhLlxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IGFkZCBkYXRhXG4gICAgICovXG4gICAgbWFrZVNlcmllc0RhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4ge307XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNob3cgdG9vbHRpcCAobW91c2VvdmVyIGNhbGxiYWNrKS5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gcGFyYW1zLmFsbG93TmVnYXRpdmVUb29sdGlwIHdoZXRoZXIgYWxsb3cgbmVnYXRpdmUgdG9vbHRpcCBvciBub3RcbiAgICAgKiBAcGFyYW0ge3t0b3A6bnVtYmVyLCBsZWZ0OiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gYm91bmQgZ3JhcGggYm91bmQgaW5mb3JtYXRpb25cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZ3JvdXBJbmRleCBncm91cCBpbmRleFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBpbmRleFxuICAgICAqL1xuICAgIHNob3dUb29sdGlwOiBmdW5jdGlvbihwYXJhbXMsIGJvdW5kLCBncm91cEluZGV4LCBpbmRleCwgZXZlbnRQb3NpdGlvbikge1xuICAgICAgICB0aGlzLmZpcmUoJ3Nob3dUb29sdGlwJywgdHVpLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgIGluZGV4ZXM6IHtcbiAgICAgICAgICAgICAgICBncm91cEluZGV4OiBncm91cEluZGV4LFxuICAgICAgICAgICAgICAgIGluZGV4OiBpbmRleFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJvdW5kOiBib3VuZCxcbiAgICAgICAgICAgIGV2ZW50UG9zaXRpb246IGV2ZW50UG9zaXRpb25cbiAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhpZGUgdG9vbHRpcCAobW91c2VvdXQgY2FsbGJhY2spLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpZCB0b29sdGlwIGlkXG4gICAgICovXG4gICAgaGlkZVRvb2x0aXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmZpcmUoJ2hpZGVUb29sdGlwJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIGV4cGFuZCBzZXJpZXMgZGltZW5zaW9uXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBkaW1lbnNpb24gc2VyaWVzIGRpbWVuc2lvblxuICAgICAqIEByZXR1cm5zIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBleHBlbmRlZCBkaW1lbnNpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9leHBhbmREaW1lbnNpb246IGZ1bmN0aW9uKGRpbWVuc2lvbikge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgd2lkdGg6IGRpbWVuc2lvbi53aWR0aCArIGNoYXJ0Q29uc3QuU0VSSUVTX0VYUEFORF9TSVpFICogMixcbiAgICAgICAgICAgIGhlaWdodDogZGltZW5zaW9uLmhlaWdodCArIGNoYXJ0Q29uc3QuU0VSSUVTX0VYUEFORF9TSVpFXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBzZXJpZXMuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcGVyIG9iamVjdCBmb3IgZ3JhcGggZHJhd2luZ1xuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gc2VyaWVzIGVsZW1lbnRcbiAgICAgKi9cbiAgICByZW5kZXI6IGZ1bmN0aW9uKHBhcGVyKSB7XG4gICAgICAgIHZhciBlbCA9IGRvbS5jcmVhdGUoJ0RJVicsIHRoaXMuY2xhc3NOYW1lKSxcbiAgICAgICAgICAgIGJvdW5kID0gdGhpcy5ib3VuZCxcbiAgICAgICAgICAgIGRpbWVuc2lvbiA9IHRoaXMuX2V4cGFuZERpbWVuc2lvbihib3VuZC5kaW1lbnNpb24pLFxuICAgICAgICAgICAgaW5DYWxsYmFjayA9IHR1aS51dGlsLmJpbmQodGhpcy5zaG93VG9vbHRpcCwgdGhpcywge1xuICAgICAgICAgICAgICAgIGFsbG93TmVnYXRpdmVUb29sdGlwOiAhIXRoaXMuYWxsb3dOZWdhdGl2ZVRvb2x0aXAsXG4gICAgICAgICAgICAgICAgY2hhcnRUeXBlOiB0aGlzLmNoYXJ0VHlwZVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBvdXRDYWxsYmFjayA9IHR1aS51dGlsLmJpbmQodGhpcy5oaWRlVG9vbHRpcCwgdGhpcyksXG4gICAgICAgICAgICBkYXRhID0ge1xuICAgICAgICAgICAgICAgIGRpbWVuc2lvbjogZGltZW5zaW9uLFxuICAgICAgICAgICAgICAgIGNoYXJ0VHlwZTogdGhpcy5jaGFydFR5cGUsXG4gICAgICAgICAgICAgICAgdGhlbWU6IHRoaXMudGhlbWUsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2VyaWVzRGF0YSA9IHRoaXMuc2VyaWVzRGF0YSxcbiAgICAgICAgICAgIGFkZERhdGFGb3JTZXJpZXNMYWJlbDtcblxuICAgICAgICBpZiAoIXBhcGVyKSB7XG4gICAgICAgICAgICByZW5kZXJVdGlsLnJlbmRlckRpbWVuc2lvbihlbCwgZGltZW5zaW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3JlbmRlclBvc2l0aW9uKGVsLCBib3VuZC5wb3NpdGlvbiwgdGhpcy5jaGFydFR5cGUpO1xuXG4gICAgICAgIGRhdGEgPSB0dWkudXRpbC5leHRlbmQoZGF0YSwgc2VyaWVzRGF0YSk7XG5cbiAgICAgICAgdGhpcy5wYXBlciA9IHRoaXMuZ3JhcGhSZW5kZXJlci5yZW5kZXIocGFwZXIsIGVsLCBkYXRhLCBpbkNhbGxiYWNrLCBvdXRDYWxsYmFjayk7XG5cbiAgICAgICAgaWYgKHRoaXMuX3JlbmRlclNlcmllc0xhYmVsKSB7XG4gICAgICAgICAgICBhZGREYXRhRm9yU2VyaWVzTGFiZWwgPSB0aGlzLl9tYWtlU2VyaWVzRGF0YUZvclNlcmllc0xhYmVsKGVsLCBkaW1lbnNpb24pO1xuICAgICAgICAgICAgdGhpcy5lbFNlcmllc0xhYmVsQXJlYSA9IHRoaXMuX3JlbmRlclNlcmllc0xhYmVsKHR1aS51dGlsLmV4dGVuZChhZGREYXRhRm9yU2VyaWVzTGFiZWwsIHNlcmllc0RhdGEpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5pc0dyb3VwZWRUb29sdGlwKSB7XG4gICAgICAgICAgICB0aGlzLmF0dGFjaEV2ZW50KGVsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHNlcmllcyBsYWJlbCBtb3VzZSBldmVudCDrj5nsnpEg7IucIOyCrOyaqVxuICAgICAgICB0aGlzLmluQ2FsbGJhY2sgPSBpbkNhbGxiYWNrO1xuICAgICAgICB0aGlzLm91dENhbGxiYWNrID0gb3V0Q2FsbGJhY2s7XG5cbiAgICAgICAgcmV0dXJuIGVsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGFkZCBkYXRhIGZvciBzZXJpZXMgbGFiZWwuXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIGNvbnRhaW5lclxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gZGltZW5zaW9uIGRpbWVuc2lvblxuICAgICAqIEByZXR1cm5zIHt7XG4gICAgICogICAgICBjb250YWluZXI6IEhUTUxFbGVtZW50LFxuICAgICAqICAgICAgdmFsdWVzOiBhcnJheS48YXJyYXk+LFxuICAgICAqICAgICAgZm9ybWF0dGVkVmFsdWVzOiBhcnJheS48YXJyYXk+LFxuICAgICAqICAgICAgZm9ybWF0RnVuY3Rpb25zOiBhcnJheS48ZnVuY3Rpb24+LFxuICAgICAqICAgICAgZGltZW5zaW9uOiB7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9XG4gICAgICogfX0gYWRkIGRhdGEgZm9yIHNlcmllcyBsYWJlbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VTZXJpZXNEYXRhRm9yU2VyaWVzTGFiZWw6IGZ1bmN0aW9uKGNvbnRhaW5lciwgZGltZW5zaW9uKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjb250YWluZXI6IGNvbnRhaW5lcixcbiAgICAgICAgICAgIHZhbHVlczogdGhpcy5kYXRhLnZhbHVlcyxcbiAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlczogdGhpcy5kYXRhLmZvcm1hdHRlZFZhbHVlcyxcbiAgICAgICAgICAgIGZvcm1hdEZ1bmN0aW9uczogdGhpcy5kYXRhLmZvcm1hdEZ1bmN0aW9ucyxcbiAgICAgICAgICAgIGRpbWVuc2lvbjogZGltZW5zaW9uXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBib3VuZHNcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCBzZXJpZXMgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7e3RvcDogbnVtYmVyLCBsZWZ0OiBudW1iZXJ9fSBwb3NpdGlvbiBzZXJpZXMgcG9zaXRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJQb3NpdGlvbjogZnVuY3Rpb24oZWwsIHBvc2l0aW9uKSB7XG4gICAgICAgIHZhciBoaWRkZW5XaWR0aCA9IHJlbmRlclV0aWwuaXNJRTgoKSA/IGNoYXJ0Q29uc3QuSElEREVOX1dJRFRIIDogMDtcbiAgICAgICAgcG9zaXRpb24udG9wID0gcG9zaXRpb24udG9wIC0gKGhpZGRlbldpZHRoICogMik7XG4gICAgICAgIHBvc2l0aW9uLmxlZnQgPSBwb3NpdGlvbi5sZWZ0IC0gY2hhcnRDb25zdC5TRVJJRVNfRVhQQU5EX1NJWkUgLSBoaWRkZW5XaWR0aDtcbiAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJQb3NpdGlvbihlbCwgcG9zaXRpb24pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgcGFwZXIuXG4gICAgICogQHJldHVybnMge29iamVjdH0gb2JqZWN0IGZvciBncmFwaCBkcmF3aW5nXG4gICAgICovXG4gICAgZ2V0UGFwZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXBlcjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBwZXJjZW50IHZhbHVlLlxuICAgICAqIEBwYXJhbSB7e3ZhbHVlczogYXJyYXksIHNjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX19IGRhdGEgc2VyaWVzIGRhdGFcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhY2tlZCBzdGFja2VkIG9wdGlvblxuICAgICAqIEByZXR1cm5zIHthcnJheS48YXJyYXkuPG51bWJlcj4+fSBwZXJjZW50IHZhbHVlc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VQZXJjZW50VmFsdWVzOiBmdW5jdGlvbihkYXRhLCBzdGFja2VkKSB7XG4gICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgIGlmIChzdGFja2VkID09PSBjaGFydENvbnN0LlNUQUNLRURfTk9STUFMX1RZUEUpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuX21ha2VOb3JtYWxTdGFja2VkUGVyY2VudFZhbHVlcyhkYXRhKTtcbiAgICAgICAgfSBlbHNlIGlmIChzdGFja2VkID09PSBjaGFydENvbnN0LlNUQUNLRURfUEVSQ0VOVF9UWVBFKSB7XG4gICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9tYWtlUGVyY2VudFN0YWNrZWRQZXJjZW50VmFsdWVzKGRhdGEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5fbWFrZU5vcm1hbFBlcmNlbnRWYWx1ZXMoZGF0YSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHBlcmNlbnQgdmFsdWVzIGFib3V0IG5vcm1hbCBzdGFja2VkIG9wdGlvbi5cbiAgICAgKiBAcGFyYW0ge3t2YWx1ZXM6IGFycmF5LCBzY2FsZToge21pbjogbnVtYmVyLCBtYXg6IG51bWJlcn19fSBkYXRhIHNlcmllcyBkYXRhXG4gICAgICogQHJldHVybnMge2FycmF5fSBwZXJjZW50IHZhbHVlcyBhYm91dCBub3JtYWwgc3RhY2tlZCBvcHRpb24uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZU5vcm1hbFN0YWNrZWRQZXJjZW50VmFsdWVzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBtaW4gPSBkYXRhLnNjYWxlLm1pbixcbiAgICAgICAgICAgIG1heCA9IGRhdGEuc2NhbGUubWF4LFxuICAgICAgICAgICAgZGlzdGFuY2UgPSBtYXggLSBtaW4sXG4gICAgICAgICAgICBwZXJjZW50VmFsdWVzID0gdHVpLnV0aWwubWFwKGRhdGEudmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGx1c1ZhbHVlcyA9IHR1aS51dGlsLmZpbHRlcih2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgPiAwO1xuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgc3VtID0gdHVpLnV0aWwuc3VtKHBsdXNWYWx1ZXMpLFxuICAgICAgICAgICAgICAgICAgICBncm91cFBlcmNlbnQgPSAoc3VtIC0gbWluKSAvIGRpc3RhbmNlO1xuICAgICAgICAgICAgICAgIHJldHVybiB0dWkudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgPT09IDAgPyAwIDogZ3JvdXBQZXJjZW50ICogKHZhbHVlIC8gc3VtKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcGVyY2VudFZhbHVlcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSBwZXJjZW50IHZhbHVlcyBhYm91dCBwZXJjZW50IHN0YWNrZWQgb3B0aW9uLlxuICAgICAqIEBwYXJhbSB7e3ZhbHVlczogYXJyYXksIHNjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX19IGRhdGEgc2VyaWVzIGRhdGFcbiAgICAgKiBAcmV0dXJucyB7YXJyYXl9IHBlcmNlbnQgdmFsdWVzIGFib3V0IHBlcmNlbnQgc3RhY2tlZCBvcHRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlUGVyY2VudFN0YWNrZWRQZXJjZW50VmFsdWVzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBwZXJjZW50VmFsdWVzID0gdHVpLnV0aWwubWFwKGRhdGEudmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgICAgIHZhciBwbHVzVmFsdWVzID0gdHVpLnV0aWwuZmlsdGVyKHZhbHVlcywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlID4gMDtcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBzdW0gPSB0dWkudXRpbC5zdW0ocGx1c1ZhbHVlcyk7XG4gICAgICAgICAgICByZXR1cm4gdHVpLnV0aWwubWFwKHZhbHVlcywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgPT09IDAgPyAwIDogdmFsdWUgLyBzdW07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBwZXJjZW50VmFsdWVzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIG5vcm1hbCBwZXJjZW50IHZhbHVlLlxuICAgICAqIEBwYXJhbSB7e3ZhbHVlczogYXJyYXksIHNjYWxlOiB7bWluOiBudW1iZXIsIG1heDogbnVtYmVyfX19IGRhdGEgc2VyaWVzIGRhdGFcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPGFycmF5LjxudW1iZXI+Pn0gcGVyY2VudCB2YWx1ZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlTm9ybWFsUGVyY2VudFZhbHVlczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgbWluID0gZGF0YS5zY2FsZS5taW4sXG4gICAgICAgICAgICBtYXggPSBkYXRhLnNjYWxlLm1heCxcbiAgICAgICAgICAgIGRpc3RhbmNlID0gbWF4IC0gbWluLFxuICAgICAgICAgICAgaXNMaW5lVHlwZUNoYXJ0ID0gc3RhdGUuaXNMaW5lVHlwZUNoYXJ0KHRoaXMuY2hhcnRUeXBlKSxcbiAgICAgICAgICAgIGZsYWcgPSAxLFxuICAgICAgICAgICAgc3ViVmFsdWUgPSAwLFxuICAgICAgICAgICAgcGVyY2VudFZhbHVlcztcblxuICAgICAgICBpZiAoIWlzTGluZVR5cGVDaGFydCAmJiBtaW4gPCAwICYmIG1heCA8PSAwKSB7XG4gICAgICAgICAgICBmbGFnID0gLTE7XG4gICAgICAgICAgICBzdWJWYWx1ZSA9IG1heDtcbiAgICAgICAgICAgIGRpc3RhbmNlID0gbWluIC0gbWF4O1xuICAgICAgICB9IGVsc2UgaWYgKGlzTGluZVR5cGVDaGFydCB8fCBtaW4gPj0gMCkge1xuICAgICAgICAgICAgc3ViVmFsdWUgPSBtaW47XG4gICAgICAgIH1cblxuICAgICAgICBwZXJjZW50VmFsdWVzID0gdHVpLnV0aWwubWFwKGRhdGEudmFsdWVzLCBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgICAgIHJldHVybiB0dWkudXRpbC5tYXAodmFsdWVzLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAodmFsdWUgLSBzdWJWYWx1ZSkgKiBmbGFnIC8gZGlzdGFuY2U7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBwZXJjZW50VmFsdWVzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgc2NhbGUgZGlzdGFuY2UgZnJvbSB6ZXJvIHBvaW50LlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzaXplIGNoYXJ0IHNpemUgKHdpZHRoIG9yIGhlaWdodClcbiAgICAgKiBAcGFyYW0ge3ttaW46IG51bWJlciwgbWF4OiBudW1iZXJ9fSBzY2FsZSBzY2FsZVxuICAgICAqIEByZXR1cm5zIHt7dG9NYXg6IG51bWJlciwgdG9NaW46IG51bWJlcn19IHBpeGVsIGRpc3RhbmNlXG4gICAgICovXG4gICAgZ2V0U2NhbGVEaXN0YW5jZUZyb21aZXJvUG9pbnQ6IGZ1bmN0aW9uKHNpemUsIHNjYWxlKSB7XG4gICAgICAgIHZhciBtaW4gPSBzY2FsZS5taW4sXG4gICAgICAgICAgICBtYXggPSBzY2FsZS5tYXgsXG4gICAgICAgICAgICBkaXN0YW5jZSA9IG1heCAtIG1pbixcbiAgICAgICAgICAgIHRvTWF4ID0gMCxcbiAgICAgICAgICAgIHRvTWluID0gMDtcblxuICAgICAgICBpZiAobWluIDwgMCAmJiBtYXggPiAwKSB7XG4gICAgICAgICAgICB0b01heCA9IChkaXN0YW5jZSArIG1pbikgLyBkaXN0YW5jZSAqIHNpemU7XG4gICAgICAgICAgICB0b01pbiA9IChkaXN0YW5jZSAtIG1heCkgLyBkaXN0YW5jZSAqIHNpemU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdG9NYXg6IHRvTWF4LFxuICAgICAgICAgICAgdG9NaW46IHRvTWluXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIHJlbmRlckNvb3JkaW5hdGVBcmVhOiBmdW5jdGlvbigpIHt9LFxuXG4gICAgLyoqXG4gICAgICogT24gbW91c2VvdmVyIGV2ZW50IGhhbmRsZXIgZm9yIHNlcmllcyBhcmVhXG4gICAgICogQHBhcmFtIHtNb3VzZUV2ZW50fSBlIG1vdXNlIGV2ZW50XG4gICAgICovXG4gICAgb25Nb3VzZW92ZXI6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIGVsVGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50LFxuICAgICAgICAgICAgZ3JvdXBJbmRleCwgaW5kZXg7XG5cbiAgICAgICAgaWYgKGVsVGFyZ2V0LmNsYXNzTmFtZSAhPT0gU0VSSUVTX0xBQkVMX0NMQVNTX05BTUUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGdyb3VwSW5kZXggPSBwYXJzZUludChlbFRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtZ3JvdXAtaW5kZXgnKSwgMTApO1xuICAgICAgICBpbmRleCA9IHBhcnNlSW50KGVsVGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1pbmRleCcpLCAxMCk7XG5cbiAgICAgICAgaWYgKGdyb3VwSW5kZXggPT09IC0xIHx8IGluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5pbkNhbGxiYWNrKHRoaXMuX2dldEJvdW5kKGdyb3VwSW5kZXgsIGluZGV4KSwgZ3JvdXBJbmRleCwgaW5kZXgpO1xuICAgIH0sXG5cbiAgICBvbk1vdXNlbW92ZTogZnVuY3Rpb24oKSB7fSxcbiAgICAvKipcbiAgICAgKiBPbiBtb3VzZW91dCBldmVudCBoYW5kbGVyIGZvciBzZXJpZXMgYXJlYVxuICAgICAqIEBwYXJhbSB7TW91c2VFdmVudH0gZSBtb3VzZSBldmVudFxuICAgICAqL1xuICAgIG9uTW91c2VvdXQ6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIGVsVGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50LFxuICAgICAgICAgICAgZ3JvdXBJbmRleCwgaW5kZXg7XG5cbiAgICAgICAgaWYgKGVsVGFyZ2V0LmNsYXNzTmFtZSAhPT0gU0VSSUVTX0xBQkVMX0NMQVNTX05BTUUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGdyb3VwSW5kZXggPSBwYXJzZUludChlbFRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtZ3JvdXAtaW5kZXgnKSwgMTApO1xuICAgICAgICBpbmRleCA9IHBhcnNlSW50KGVsVGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1pbmRleCcpLCAxMCk7XG5cbiAgICAgICAgaWYgKGdyb3VwSW5kZXggPT09IC0xIHx8IGluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5vdXRDYWxsYmFjayhncm91cEluZGV4LCBpbmRleCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCBldmVudFxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICovXG4gICAgYXR0YWNoRXZlbnQ6IGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgIGV2ZW50LmJpbmRFdmVudCgnbW91c2VvdmVyJywgZWwsIHR1aS51dGlsLmJpbmQodGhpcy5vbk1vdXNlb3ZlciwgdGhpcykpO1xuICAgICAgICBldmVudC5iaW5kRXZlbnQoJ21vdXNlbW92ZScsIGVsLCB0dWkudXRpbC5iaW5kKHRoaXMub25Nb3VzZW1vdmUsIHRoaXMpKTtcbiAgICAgICAgZXZlbnQuYmluZEV2ZW50KCdtb3VzZW91dCcsIGVsLCB0dWkudXRpbC5iaW5kKHRoaXMub25Nb3VzZW91dCwgdGhpcykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBjYWxsIHNob3dBbmltYXRpb24gZnVuY3Rpb24gb2YgZ3JhcGhSZW5kZXJlci5cbiAgICAgKiBAcGFyYW0ge3tncm91cEluZGV4OiBudW1iZXIsIGluZGV4OiBudW1iZXJ9fSBkYXRhIGRhdGFcbiAgICAgKi9cbiAgICBvblNob3dBbmltYXRpb246IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgaWYgKCF0aGlzLmdyYXBoUmVuZGVyZXIuc2hvd0FuaW1hdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ3JhcGhSZW5kZXJlci5zaG93QW5pbWF0aW9uLmNhbGwodGhpcy5ncmFwaFJlbmRlcmVyLCBkYXRhKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gY2FsbCBoaWRlQW5pbWF0aW9uIGZ1bmN0aW9uIG9mIGdyYXBoUmVuZGVyZXIuXG4gICAgICogQHBhcmFtIHt7Z3JvdXBJbmRleDogbnVtYmVyLCBpbmRleDogbnVtYmVyfX0gZGF0YSBkYXRhXG4gICAgICovXG4gICAgb25IaWRlQW5pbWF0aW9uOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIGlmICghdGhpcy5ncmFwaFJlbmRlcmVyLmhpZGVBbmltYXRpb24pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmdyYXBoUmVuZGVyZXIuaGlkZUFuaW1hdGlvbi5jYWxsKHRoaXMuZ3JhcGhSZW5kZXJlciwgZGF0YSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIGNhbGwgc2hvd0dyb3VwQW5pbWF0aW9uIGZ1bmN0aW9uIG9mIGdyYXBoUmVuZGVyZXIuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IGluZGV4XG4gICAgICogQHBhcmFtIHt7XG4gICAgICogICAgICBkaW1lbnNpb246IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn0sXG4gICAgICogICAgICBwb3NpdGlvbjoge2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9XG4gICAgICogfX0gYm91bmQgYm91bmRcbiAgICAgKi9cbiAgICBvblNob3dHcm91cEFuaW1hdGlvbjogZnVuY3Rpb24oaW5kZXgsIGJvdW5kKSB7XG4gICAgICAgIGlmICghdGhpcy5ncmFwaFJlbmRlcmVyLnNob3dHcm91cEFuaW1hdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ3JhcGhSZW5kZXJlci5zaG93R3JvdXBBbmltYXRpb24uY2FsbCh0aGlzLmdyYXBoUmVuZGVyZXIsIGluZGV4LCBib3VuZCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIGNhbGwgaGlkZUdyb3VwQW5pbWF0aW9uIGZ1bmN0aW9uIG9mIGdyYXBoUmVuZGVyZXIuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IGluZGV4XG4gICAgICovXG4gICAgb25IaWRlR3JvdXBBbmltYXRpb246IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAgIGlmICghdGhpcy5ncmFwaFJlbmRlcmVyLmhpZGVHcm91cEFuaW1hdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ3JhcGhSZW5kZXJlci5oaWRlR3JvdXBBbmltYXRpb24uY2FsbCh0aGlzLmdyYXBoUmVuZGVyZXIsIGluZGV4KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQW5pbWF0ZSBjb21wb25lbnQuXG4gICAgICovXG4gICAgYW5pbWF0ZUNvbXBvbmVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmdyYXBoUmVuZGVyZXIuYW5pbWF0ZSkge1xuICAgICAgICAgICAgdGhpcy5ncmFwaFJlbmRlcmVyLmFuaW1hdGUodHVpLnV0aWwuYmluZCh0aGlzLnNob3dTZXJpZXNMYWJlbEFyZWEsIHRoaXMpKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGh0bWwgYWJvdXQgc2VyaWVzIGxhYmVsXG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IHBvc2l0aW9uIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlIHZhbHVlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGdyb3VwSW5kZXggZ3JvdXAgaW5kZXhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggaW5kZXhcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBodG1sIHN0cmluZ1xuICAgICAqL1xuICAgIG1ha2VTZXJpZXNMYWJlbEh0bWw6IGZ1bmN0aW9uKHBvc2l0aW9uLCB2YWx1ZSwgZ3JvdXBJbmRleCwgaW5kZXgpIHtcbiAgICAgICAgdmFyIGNzc09iaiA9IHR1aS51dGlsLmV4dGVuZChwb3NpdGlvbiwgdGhpcy50aGVtZS5sYWJlbCk7XG4gICAgICAgIHJldHVybiBzZXJpZXNUZW1wbGF0ZS50cGxTZXJpZXNMYWJlbCh7XG4gICAgICAgICAgICBjc3NUZXh0OiBzZXJpZXNUZW1wbGF0ZS50cGxDc3NUZXh0KGNzc09iaiksXG4gICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICBncm91cEluZGV4OiBncm91cEluZGV4LFxuICAgICAgICAgICAgaW5kZXg6IGluZGV4XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTaG93IHNlcmllcyBsYWJlbCBhcmVhLlxuICAgICAqL1xuICAgIHNob3dTZXJpZXNMYWJlbEFyZWE6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoKCF0aGlzLm9wdGlvbnMuc2hvd0xhYmVsICYmICF0aGlzLm9wdGlvbnMubGVnZW5kVHlwZSkgfHwgIXRoaXMuZWxTZXJpZXNMYWJlbEFyZWEpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGRvbS5hZGRDbGFzcyh0aGlzLmVsU2VyaWVzTGFiZWxBcmVhLCAnc2hvdycpO1xuXG4gICAgICAgIChuZXcgdHVpLmNvbXBvbmVudC5FZmZlY3RzLkZhZGUoe1xuICAgICAgICAgICAgZWxlbWVudDogdGhpcy5lbFNlcmllc0xhYmVsQXJlYSxcbiAgICAgICAgICAgIGR1cmF0aW9uOiAzMDBcbiAgICAgICAgfSkpLmFjdGlvbih7XG4gICAgICAgICAgICBzdGFydDogMCxcbiAgICAgICAgICAgIGVuZDogMSxcbiAgICAgICAgICAgIGNvbXBsZXRlOiBmdW5jdGlvbigpIHt9XG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuXG50dWkudXRpbC5DdXN0b21FdmVudHMubWl4aW4oU2VyaWVzKTtcblxubW9kdWxlLmV4cG9ydHMgPSBTZXJpZXM7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgVGhpcyBpcyB0ZW1wbGF0ZXMgb2Ygc2VyaWVzLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxudmFyIHRlbXBsYXRlTWFrZXIgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3RlbXBsYXRlTWFrZXInKTtcblxudmFyIHRhZ3MgPSB7XG4gICAgSFRNTF9TRVJJRVNfTEFCRUw6ICc8ZGl2IGNsYXNzPVwidHVpLWNoYXJ0LXNlcmllcy1sYWJlbFwiIHN0eWxlPVwie3sgY3NzVGV4dCB9fVwiIGRhdGEtZ3JvdXAtaW5kZXg9XCJ7eyBncm91cEluZGV4IH19XCIgZGF0YS1pbmRleD1cInt7IGluZGV4IH19XCI+e3sgdmFsdWUgfX08L2Rpdj4nLFxuICAgIFRFWFRfQ1NTX1RFWFQ6ICdsZWZ0Ont7IGxlZnQgfX1weDt0b3A6e3sgdG9wIH19cHg7Zm9udC1mYW1pbHk6e3sgZm9udEZhbWlseSB9fTtmb250LXNpemU6e3sgZm9udFNpemUgfX1weCdcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHRwbFNlcmllc0xhYmVsOiB0ZW1wbGF0ZU1ha2VyLnRlbXBsYXRlKHRhZ3MuSFRNTF9TRVJJRVNfTEFCRUwpLFxuICAgIHRwbENzc1RleHQ6IHRlbXBsYXRlTWFrZXIudGVtcGxhdGUodGFncy5URVhUX0NTU19URVhUKVxufTtcbiIsInZhciBERUZBVUxUX0NPTE9SID0gJyMwMDAwMDAnLFxuICAgIERFRkFVTFRfQkFDS0dST1VORCA9ICcjZmZmZmZmJyxcbiAgICBFTVBUWSA9ICcnLFxuICAgIERFRkFVTFRfQVhJUyA9IHtcbiAgICAgICAgdGlja0NvbG9yOiBERUZBVUxUX0NPTE9SLFxuICAgICAgICB0aXRsZToge1xuICAgICAgICAgICAgZm9udFNpemU6IDEyLFxuICAgICAgICAgICAgZm9udEZhbWlseTogRU1QVFksXG4gICAgICAgICAgICBjb2xvcjogREVGQVVMVF9DT0xPUlxuICAgICAgICB9LFxuICAgICAgICBsYWJlbDoge1xuICAgICAgICAgICAgZm9udFNpemU6IDEyLFxuICAgICAgICAgICAgZm9udEZhbWlseTogRU1QVFksXG4gICAgICAgICAgICBjb2xvcjogREVGQVVMVF9DT0xPUlxuICAgICAgICB9XG4gICAgfTtcblxudmFyIGRlZmF1bHRUaGVtZSA9IHtcbiAgICBjaGFydDoge1xuICAgICAgICBiYWNrZ3JvdW5kOiBERUZBVUxUX0JBQ0tHUk9VTkQsXG4gICAgICAgIGZvbnRGYW1pbHk6ICdWZXJkYW5hJ1xuICAgIH0sXG4gICAgdGl0bGU6IHtcbiAgICAgICAgZm9udFNpemU6IDE4LFxuICAgICAgICBmb250RmFtaWx5OiBFTVBUWSxcbiAgICAgICAgY29sb3I6IERFRkFVTFRfQ09MT1JcbiAgICB9LFxuICAgIHlBeGlzOiBERUZBVUxUX0FYSVMsXG4gICAgeEF4aXM6IERFRkFVTFRfQVhJUyxcbiAgICBwbG90OiB7XG4gICAgICAgIGxpbmVDb2xvcjogJyNkZGRkZGQnLFxuICAgICAgICBiYWNrZ3JvdW5kOiAnI2ZmZmZmZidcbiAgICB9LFxuICAgIHNlcmllczoge1xuICAgICAgICBsYWJlbDoge1xuICAgICAgICAgICAgZm9udFNpemU6IDExLFxuICAgICAgICAgICAgZm9udEZhbWlseTogRU1QVFksXG4gICAgICAgICAgICBjb2xvcjogREVGQVVMVF9DT0xPUlxuICAgICAgICB9LFxuICAgICAgICBjb2xvcnM6IFsnI2FjNDE0MicsICcjZDI4NDQ1JywgJyNmNGJmNzUnLCAnIzkwYTk1OScsICcjNzViNWFhJywgJyM2YTlmYjUnLCAnI2FhNzU5ZicsICcjOGY1NTM2J10sXG4gICAgICAgIGJvcmRlckNvbG9yOiBFTVBUWVxuICAgIH0sXG4gICAgbGVnZW5kOiB7XG4gICAgICAgIGxhYmVsOiB7XG4gICAgICAgICAgICBmb250U2l6ZTogMTIsXG4gICAgICAgICAgICBmb250RmFtaWx5OiBFTVBUWSxcbiAgICAgICAgICAgIGNvbG9yOiBERUZBVUxUX0NPTE9SXG4gICAgICAgIH1cbiAgICB9LFxuICAgIHRvb2x0aXA6IHt9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmF1bHRUaGVtZTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBHcm91cCB0b29sdGlwIGNvbXBvbmVudC5cbiAqIEBhdXRob3IgTkhOIEVudC5cbiAqICAgICAgICAgRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFRvb2x0aXBCYXNlID0gcmVxdWlyZSgnLi90b29sdGlwQmFzZScpLFxuICAgIGNoYXJ0Q29uc3QgPSByZXF1aXJlKCcuLi9jb25zdCcpLFxuICAgIGRvbSA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZG9tSGFuZGxlcicpLFxuICAgIHJlbmRlclV0aWwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3JlbmRlclV0aWwnKSxcbiAgICBkZWZhdWx0VGhlbWUgPSByZXF1aXJlKCcuLi90aGVtZXMvZGVmYXVsdFRoZW1lJyksXG4gICAgdG9vbHRpcFRlbXBsYXRlID0gcmVxdWlyZSgnLi90b29sdGlwVGVtcGxhdGUnKTtcblxudmFyIEdyb3VwVG9vbHRpcCA9IHR1aS51dGlsLmRlZmluZUNsYXNzKFRvb2x0aXBCYXNlLCAvKiogQGxlbmRzIEdyb3VwVG9vbHRpcC5wcm90b3R5cGUgKi8ge1xuICAgIC8qKlxuICAgICAqIEdyb3VwIHRvb2x0aXAgY29tcG9uZW50LlxuICAgICAqIEBjb25zdHJ1Y3RzIEdyb3VwVG9vbHRpcFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48bnVtYmVyPn0gcGFyYW1zLnZhbHVlcyBjb252ZXJ0ZWQgdmFsdWVzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5fSBwYXJhbXMubGFiZWxzIGxhYmVsc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheX0gcGFyYW1zLmxlZ2VuZExhYmVscyBsZWdlbmQgbGFiZWxzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmJvdW5kIGF4aXMgYm91bmRcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgYXhpcyB0aGVtZVxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICBUb29sdGlwQmFzZS5jYWxsKHRoaXMsIHBhcmFtcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgdG9vbHRpcCBkYXRhLlxuICAgICAqIEByZXR1cm5zIHthcnJheS48b2JqZWN0Pn0gdG9vbHRpcCBkYXRhXG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgbWFrZVRvb2x0aXBEYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHR1aS51dGlsLm1hcCh0aGlzLmpvaW5Gb3JtYXR0ZWRWYWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcywgaW5kZXgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IHRoaXMubGFiZWxzW2luZGV4XSxcbiAgICAgICAgICAgICAgICB2YWx1ZXM6IHZhbHVlc1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgY29sb3JzLlxuICAgICAqIEBwYXJhbSB7YXJyYXkuPHN0cmluZz59IGxlZ2VuZExhYmVscyBsZWdlbmQgbGFiZWxzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoZW1lIHRvb2x0aXAgdGhlbWVcbiAgICAgKiBAcmV0dXJucyB7YXJyYXkuPHN0cmluZz59IGNvbG9yc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VDb2xvcnM6IGZ1bmN0aW9uKGxlZ2VuZExhYmVscywgdGhlbWUpIHtcbiAgICAgICAgdmFyIGNvbG9ySW5kZXggPSAwLFxuICAgICAgICAgICAgZGVmYXVsdENvbG9ycywgY29sb3JzLCBwcmV2Q2hhcnRUeXBlO1xuICAgICAgICBpZiAodGhlbWUuY29sb3JzKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhlbWUuY29sb3JzO1xuICAgICAgICB9XG5cbiAgICAgICAgZGVmYXVsdENvbG9ycyA9IGRlZmF1bHRUaGVtZS5zZXJpZXMuY29sb3JzLnNsaWNlKDAsIGxlZ2VuZExhYmVscy5sZW5ndGgpO1xuXG4gICAgICAgIHJldHVybiB0dWkudXRpbC5tYXAodHVpLnV0aWwucGx1Y2sobGVnZW5kTGFiZWxzLCAnY2hhcnRUeXBlJyksIGZ1bmN0aW9uKGNoYXJ0VHlwZSkge1xuICAgICAgICAgICAgdmFyIGNvbG9yO1xuICAgICAgICAgICAgaWYgKHByZXZDaGFydFR5cGUgIT09IGNoYXJ0VHlwZSkge1xuICAgICAgICAgICAgICAgIGNvbG9ycyA9IHRoZW1lW2NoYXJ0VHlwZV0gPyB0aGVtZVtjaGFydFR5cGVdLmNvbG9ycyA6IGRlZmF1bHRDb2xvcnM7XG4gICAgICAgICAgICAgICAgY29sb3JJbmRleCA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwcmV2Q2hhcnRUeXBlID0gY2hhcnRUeXBlO1xuICAgICAgICAgICAgY29sb3IgPSBjb2xvcnNbY29sb3JJbmRleF07XG4gICAgICAgICAgICBjb2xvckluZGV4ICs9IDE7XG4gICAgICAgICAgICByZXR1cm4gY29sb3I7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHRvb2x0aXAgaHRtbC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZ3JvdXBJbmRleCBncm91cCBpbmRleFxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IHRvb2x0aXAgaHRtbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VUb29sdGlwSHRtbDogZnVuY3Rpb24oZ3JvdXBJbmRleCkge1xuICAgICAgICB2YXIgaXRlbSA9IHRoaXMuZGF0YVtncm91cEluZGV4XSxcbiAgICAgICAgICAgIHRlbXBsYXRlID0gdG9vbHRpcFRlbXBsYXRlLnRwbEdyb3VwSXRlbSxcbiAgICAgICAgICAgIGNzc1RleHRUZW1wbGF0ZSA9IHRvb2x0aXBUZW1wbGF0ZS50cGxHcm91cENzc1RleHQsXG4gICAgICAgICAgICBjb2xvcnMgPSB0aGlzLl9tYWtlQ29sb3JzKHRoaXMuam9pbkxlZ2VuZExhYmVscywgdGhpcy50aGVtZSksXG4gICAgICAgICAgICBpdGVtc0h0bWw7XG5cbiAgICAgICAgaXRlbXNIdG1sID0gdHVpLnV0aWwubWFwKGl0ZW0udmFsdWVzLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBsZWdlbmRMYWJlbCA9IHRoaXMuam9pbkxlZ2VuZExhYmVsc1tpbmRleF07XG4gICAgICAgICAgICByZXR1cm4gdGVtcGxhdGUoe1xuICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgICAgICBsZWdlbmQ6IGxlZ2VuZExhYmVsLmxhYmVsLFxuICAgICAgICAgICAgICAgIGNoYXJ0VHlwZTogbGVnZW5kTGFiZWwuY2hhcnRUeXBlLFxuICAgICAgICAgICAgICAgIGNzc1RleHQ6IGNzc1RleHRUZW1wbGF0ZSh7Y29sb3I6IGNvbG9yc1tpbmRleF19KSxcbiAgICAgICAgICAgICAgICBzdWZmaXg6IHRoaXMuc3VmZml4XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgdGhpcykuam9pbignJyk7XG5cbiAgICAgICAgcmV0dXJuIHRvb2x0aXBUZW1wbGF0ZS50cGxHcm91cCh7XG4gICAgICAgICAgICBjYXRlZ29yeTogaXRlbS5jYXRlZ29yeSxcbiAgICAgICAgICAgIGl0ZW1zOiBpdGVtc0h0bWxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIGNhbGN1bGF0ZSB2ZXJ0aWNhbCBwb3NpdGlvbi5cbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGRpbWVuc2lvbiBkaW1lbnNpb25cbiAgICAgKiBAcGFyYW0ge3tpbmRleDogbnVtYmVyLCByYW5nZToge3N0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyfSxcbiAgICAgKiAgICAgICAgICBzaXplOiBudW1iZXIsIGRpcmVjdGlvbjogc3RyaW5nLCBpc1ZlcnRpY2FsOiBib29sZWFuXG4gICAgICogICAgICAgIH19IHBhcmFtcyBjb29yZGluYXRlIGV2ZW50IHBhcmFtZXRlcnNcbiAgICAgKiBAcmV0dXJucyB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBwb3NpdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NhbGN1bGF0ZVZlcnRpY2FsUG9zaXRpb246IGZ1bmN0aW9uKGRpbWVuc2lvbiwgcGFyYW1zKSB7XG4gICAgICAgIHZhciByYW5nZSA9IHBhcmFtcy5yYW5nZSxcbiAgICAgICAgICAgIGlzTGluZSA9IChyYW5nZS5zdGFydCA9PT0gcmFuZ2UuZW5kKSxcbiAgICAgICAgICAgIHBhZGRpbmcgPSBpc0xpbmUgPyA2IDogMCxcbiAgICAgICAgICAgIGxlZnQgPSBjaGFydENvbnN0LlNFUklFU19FWFBBTkRfU0laRTtcbiAgICAgICAgaWYgKHBhcmFtcy5kaXJlY3Rpb24gPT09IGNoYXJ0Q29uc3QuVE9PTFRJUF9ESVJFQ1RJT05fRk9SV09SRCkge1xuICAgICAgICAgICAgbGVmdCArPSByYW5nZS5zdGFydCArIHBhZGRpbmc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZWZ0ICs9IHJhbmdlLmVuZCAtIGRpbWVuc2lvbi53aWR0aCAtIHBhZGRpbmc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxlZnQ6IGxlZnQsXG4gICAgICAgICAgICB0b3A6IChwYXJhbXMuc2l6ZSAtIGRpbWVuc2lvbi5oZWlnaHQpIC8gMlxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBjYWxjdWxhdGUgaG9yaXpvbnRhbCBwb3NpdGlvbi5cbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGRpbWVuc2lvbiBkaW1lbnNpb25cbiAgICAgKiBAcGFyYW0ge3tpbmRleDogbnVtYmVyLCByYW5nZToge3N0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyfSxcbiAgICAgKiAgICAgICAgICBzaXplOiBudW1iZXIsIGRpcmVjdGlvbjogc3RyaW5nLCBpc1ZlcnRpY2FsOiBib29sZWFuXG4gICAgICogICAgICAgIH19IHBhcmFtcyBjb29yZGluYXRlIGV2ZW50IHBhcmFtZXRlcnNcbiAgICAgKiBAcmV0dXJucyB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBwb3NpdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NhbGN1bGF0ZUhvcml6b250YWxQb3NpdGlvbjogZnVuY3Rpb24oZGltZW5zaW9uLCBwYXJhbXMpIHtcbiAgICAgICAgdmFyIHJhbmdlID0gcGFyYW1zLnJhbmdlLFxuICAgICAgICAgICAgdG9wID0gMDtcbiAgICAgICAgaWYgKHBhcmFtcy5kaXJlY3Rpb24gPT09IGNoYXJ0Q29uc3QuVE9PTFRJUF9ESVJFQ1RJT05fRk9SV09SRCkge1xuICAgICAgICAgICAgdG9wICs9IHJhbmdlLnN0YXJ0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdG9wICs9IHJhbmdlLmVuZCAtIGRpbWVuc2lvbi5oZWlnaHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxlZnQ6IChwYXJhbXMuc2l6ZSAtIGRpbWVuc2lvbi53aWR0aCkgLyAyICsgY2hhcnRDb25zdC5TRVJJRVNfRVhQQU5EX1NJWkUsXG4gICAgICAgICAgICB0b3A6IHRvcFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBjYWxjdWxhdGUgcG9zaXRpb24uXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBkaW1lbnNpb24gZGltZW5zaW9uXG4gICAgICogQHBhcmFtIHt7aW5kZXg6IG51bWJlciwgcmFuZ2U6IHtzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcn0sXG4gICAgICogICAgICAgICAgc2l6ZTogbnVtYmVyLCBkaXJlY3Rpb246IHN0cmluZywgaXNWZXJ0aWNhbDogYm9vbGVhblxuICAgICAqICAgICAgICB9fSBwYXJhbXMgY29vcmRpbmF0ZSBldmVudCBwYXJhbWV0ZXJzXG4gICAgICogQHJldHVybnMge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gcG9zaXRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jYWxjdWxhdGVUb29sdGlwUG9zaXRpb246IGZ1bmN0aW9uKGRpbWVuc2lvbiwgcGFyYW1zKSB7XG4gICAgICAgIHZhciBwb3NpdGlvbjtcbiAgICAgICAgaWYgKHBhcmFtcy5pc1ZlcnRpY2FsKSB7XG4gICAgICAgICAgICBwb3NpdGlvbiA9IHRoaXMuX2NhbGN1bGF0ZVZlcnRpY2FsUG9zaXRpb24oZGltZW5zaW9uLCBwYXJhbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcG9zaXRpb24gPSB0aGlzLl9jYWxjdWxhdGVIb3Jpem9udGFsUG9zaXRpb24oZGltZW5zaW9uLCBwYXJhbXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwb3NpdGlvbjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIHRvb2x0aXAgZWxlbWVudC5cbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHRvb2x0aXAgZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NyZWF0ZVRvb2x0aXBTZWN0b3JFbGVtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGVsVG9vbHRpcEJsb2NrO1xuICAgICAgICBpZiAoIXRoaXMuZWxMYXlvdXQuY2hpbGROb2Rlcy5sZW5ndGggPCAyKSB7XG4gICAgICAgICAgICBlbFRvb2x0aXBCbG9jayA9IGRvbS5jcmVhdGUoJ0RJVicsICd0dWktY2hhcnQtZ3JvdXAtdG9vbHRpcC1zZWN0b3InKTtcbiAgICAgICAgICAgIGRvbS5hcHBlbmQodGhpcy5lbExheW91dCwgZWxUb29sdGlwQmxvY2spO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZWxUb29sdGlwQmxvY2sgPSB0aGlzLmVsTGF5b3V0Lmxhc3RDaGlsZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZWxUb29sdGlwQmxvY2s7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB0b29sdGlwIHNlY3RvciBlbGVtZW50LlxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gc2VjdG9yIGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRUb29sdGlwU2VjdG9yRWxlbWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghdGhpcy5lbFRvb2x0aXBCbG9jaykge1xuICAgICAgICAgICAgdGhpcy5lbFRvb2x0aXBCbG9jayA9IHRoaXMuX2NyZWF0ZVRvb2x0aXBTZWN0b3JFbGVtZW50KCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZWxUb29sdGlwQmxvY2s7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYm91bmQgYWJvdXQgdG9vbHRpcCBzZWN0b3Igb2YgdmVydGljYWwgdHlwZSBjaGFydC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0IGhlaWdodFxuICAgICAqIEBwYXJhbSB7e3N0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyfX0gcmFuZ2UgcmFuZ2VcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzTGluZSB3aGV0aGVyIGxpbmUgb3Igbm90XG4gICAgICogQHJldHVybnMge3tkaW1lbnNpb246IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn0sIHBvc2l0aW9uOiB7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19fSBib3VuZFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VWZXJ0aWNhbFRvb2x0aXBTZWN0b3JCb3VuZDogZnVuY3Rpb24oaGVpZ2h0LCByYW5nZSwgaXNMaW5lKSB7XG4gICAgICAgIHZhciB3aWR0aCwgbW92ZUxlZnQ7XG4gICAgICAgIGlmIChpc0xpbmUpIHtcbiAgICAgICAgICAgIHdpZHRoID0gMTtcbiAgICAgICAgICAgIGhlaWdodCArPSA2O1xuICAgICAgICAgICAgbW92ZUxlZnQgPSAwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgd2lkdGggPSByYW5nZS5lbmQgLSByYW5nZS5zdGFydCArIDE7XG4gICAgICAgICAgICBtb3ZlTGVmdCA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRpbWVuc2lvbjoge1xuICAgICAgICAgICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IGhlaWdodFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgbGVmdDogcmFuZ2Uuc3RhcnQgKyBjaGFydENvbnN0LlNFUklFU19FWFBBTkRfU0laRSAtIG1vdmVMZWZ0LFxuICAgICAgICAgICAgICAgIHRvcDogMFxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIGJvdW5kIGFib3V0IHRvb2x0aXAgc2VjdG9yIG9mIGhvcml6b250YWwgdHlwZSBjaGFydC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGggd2lkdGhcbiAgICAgKiBAcGFyYW0ge3tzdGFydDogbnVtYmVyLCBlbmQ6bnVtYmVyfX0gcmFuZ2UgcmFuZ2VcbiAgICAgKiBAcmV0dXJucyB7e2RpbWVuc2lvbjoge3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfSwgcG9zaXRpb246IHtsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX19IGJvdW5kXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUhvcml6b250YWxUb29sdGlwU2VjdG9yQm91bmQ6IGZ1bmN0aW9uKHdpZHRoLCByYW5nZSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGltZW5zaW9uOiB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgICAgICAgICAgIGhlaWdodDogcmFuZ2UuZW5kIC0gcmFuZ2Uuc3RhcnQgKyAxXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICBsZWZ0OiBjaGFydENvbnN0LlNFUklFU19FWFBBTkRfU0laRSxcbiAgICAgICAgICAgICAgICB0b3A6IHJhbmdlLnN0YXJ0XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgYm91bmQgYWJvdXQgdG9vbHRpcCBzZWN0b3IuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHNpemUgd2lkdGggb3IgaGVpZ2h0XG4gICAgICogQHBhcmFtIHt7c3RhcnQ6IG51bWJlciwgZW5kOm51bWJlcn19IHJhbmdlIHJhbmdlXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpc1ZlcnRpY2FsIHdoZXRoZXIgdmVydGljYWwgb3Igbm90XG4gICAgICogQHBhcmFtIHtib29sZWFufSBpc0xpbmUgd2hldGhlciBsaW5lIHR5cGUgb3Igbm90XG4gICAgICogQHJldHVybnMge3tkaW1lbnNpb246IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn0sIHBvc2l0aW9uOiB7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19fSBib3VuZFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VUb29sdGlwU2VjdG9yQm91bmQ6IGZ1bmN0aW9uKHNpemUsIHJhbmdlLCBpc1ZlcnRpY2FsLCBpc0xpbmUpIHtcbiAgICAgICAgdmFyIGJvdW5kO1xuICAgICAgICBpZiAoaXNWZXJ0aWNhbCkge1xuICAgICAgICAgICAgYm91bmQgPSB0aGlzLl9tYWtlVmVydGljYWxUb29sdGlwU2VjdG9yQm91bmQoc2l6ZSwgcmFuZ2UsIGlzTGluZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBib3VuZCA9IHRoaXMuX21ha2VIb3Jpem9udGFsVG9vbHRpcFNlY3RvckJvdW5kKHNpemUsIHJhbmdlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYm91bmQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNob3cgdG9vbHRpcCBzZWN0b3IuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHNpemUgd2lkdGggb3IgaGVpZ2h0XG4gICAgICogQHBhcmFtIHt7c3RhcnQ6IG51bWJlciwgZW5kOm51bWJlcn19IHJhbmdlIHJhbmdlXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpc1ZlcnRpY2FsIHdoZXRoZXIgdmVydGljYWwgb3Igbm90XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IGluZGV4XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2hvd1Rvb2x0aXBTZWN0b3I6IGZ1bmN0aW9uKHNpemUsIHJhbmdlLCBpc1ZlcnRpY2FsLCBpbmRleCkge1xuICAgICAgICB2YXIgZWxUb29sdGlwQmxvY2sgPSB0aGlzLl9nZXRUb29sdGlwU2VjdG9yRWxlbWVudCgpLFxuICAgICAgICAgICAgaXNMaW5lID0gKHJhbmdlLnN0YXJ0ID09PSByYW5nZS5lbmQpLFxuICAgICAgICAgICAgYm91bmQgPSB0aGlzLl9tYWtlVG9vbHRpcFNlY3RvckJvdW5kKHNpemUsIHJhbmdlLCBpc1ZlcnRpY2FsLCBpc0xpbmUpO1xuICAgICAgICBpZiAoaXNMaW5lKSB7XG4gICAgICAgICAgICB0aGlzLmZpcmUoJ3Nob3dHcm91cEFuaW1hdGlvbicsIGluZGV4LCBib3VuZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZW5kZXJVdGlsLnJlbmRlckRpbWVuc2lvbihlbFRvb2x0aXBCbG9jaywgYm91bmQuZGltZW5zaW9uKTtcbiAgICAgICAgICAgIHJlbmRlclV0aWwucmVuZGVyUG9zaXRpb24oZWxUb29sdGlwQmxvY2ssIGJvdW5kLnBvc2l0aW9uKTtcbiAgICAgICAgICAgIGRvbS5hZGRDbGFzcyhlbFRvb2x0aXBCbG9jaywgJ3Nob3cnKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBIaWRlIHRvb2x0aXAgc2VjdG9yLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBpbmRleFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2hpZGVUb29sdGlwU2VjdG9yOiBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICB2YXIgZWxUb29sdGlwQmxvY2sgPSB0aGlzLl9nZXRUb29sdGlwU2VjdG9yRWxlbWVudCgpO1xuICAgICAgICBkb20ucmVtb3ZlQ2xhc3MoZWxUb29sdGlwQmxvY2ssICdzaG93Jyk7XG4gICAgICAgIHRoaXMuZmlyZSgnaGlkZUdyb3VwQW5pbWF0aW9uJywgaW5kZXgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTaG93IHRvb2x0aXAuXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxUb29sdGlwIHRvb2x0aXAgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7e2luZGV4OiBudW1iZXIsIHJhbmdlOiB7c3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXJ9LFxuICAgICAqICAgICAgICAgIHNpemU6IG51bWJlciwgZGlyZWN0aW9uOiBzdHJpbmcsIGlzVmVydGljYWw6IGJvb2xlYW5cbiAgICAgKiAgICAgICAgfX0gcGFyYW1zIGNvb3JkaW5hdGUgZXZlbnQgcGFyYW1ldGVyc1xuICAgICAqIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSBwcmV2UG9zaXRpb24gcHJldiBwb3NpdGlvblxuICAgICAqL1xuICAgIHNob3dUb29sdGlwOiBmdW5jdGlvbihlbFRvb2x0aXAsIHBhcmFtcywgcHJldlBvc2l0aW9uKSB7XG4gICAgICAgIHZhciBkaW1lbnNpb24sIHBvc2l0aW9uO1xuXG4gICAgICAgIGlmICghdHVpLnV0aWwuaXNVbmRlZmluZWQodGhpcy5wcmV2SW5kZXgpKSB7XG4gICAgICAgICAgICB0aGlzLmZpcmUoJ2hpZGVHcm91cEFuaW1hdGlvbicsIHRoaXMucHJldkluZGV4KTtcbiAgICAgICAgfVxuICAgICAgICBlbFRvb2x0aXAuaW5uZXJIVE1MID0gdGhpcy5fbWFrZVRvb2x0aXBIdG1sKHBhcmFtcy5pbmRleCk7XG4gICAgICAgIGRvbS5hZGRDbGFzcyhlbFRvb2x0aXAsICdzaG93Jyk7XG5cbiAgICAgICAgdGhpcy5fc2hvd1Rvb2x0aXBTZWN0b3IocGFyYW1zLnNpemUsIHBhcmFtcy5yYW5nZSwgcGFyYW1zLmlzVmVydGljYWwsIHBhcmFtcy5pbmRleCk7XG4gICAgICAgIGRpbWVuc2lvbiA9IHRoaXMuZ2V0VG9vbHRpcERpbWVuc2lvbihlbFRvb2x0aXApO1xuXG4gICAgICAgIHBvc2l0aW9uID0gdGhpcy5fY2FsY3VsYXRlVG9vbHRpcFBvc2l0aW9uKGRpbWVuc2lvbiwgcGFyYW1zKTtcblxuICAgICAgICB0aGlzLm1vdmVUb1Bvc2l0aW9uKGVsVG9vbHRpcCwgcG9zaXRpb24sIHByZXZQb3NpdGlvbik7XG4gICAgICAgIHRoaXMucHJldkluZGV4ID0gcGFyYW1zLmluZGV4O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBIaWRlIHRvb2x0aXAuXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxUb29sdGlwIHRvb2x0aXAgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBpbmRleFxuICAgICAqL1xuICAgIGhpZGVUb29sdGlwOiBmdW5jdGlvbihlbFRvb2x0aXAsIGluZGV4KSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLnByZXZJbmRleDtcbiAgICAgICAgdGhpcy5faGlkZVRvb2x0aXBTZWN0b3IoaW5kZXgpO1xuICAgICAgICB0aGlzLmhpZGVBbmltYXRpb24oZWxUb29sdGlwKTtcbiAgICB9XG59KTtcblxudHVpLnV0aWwuQ3VzdG9tRXZlbnRzLm1peGluKEdyb3VwVG9vbHRpcCk7XG5cbm1vZHVsZS5leHBvcnRzID0gR3JvdXBUb29sdGlwO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFRvb2x0aXAgY29tcG9uZW50LlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgVG9vbHRpcEJhc2UgPSByZXF1aXJlKCcuL3Rvb2x0aXBCYXNlJyksXG4gICAgY2hhcnRDb25zdCA9IHJlcXVpcmUoJy4uL2NvbnN0JyksXG4gICAgZG9tID0gcmVxdWlyZSgnLi4vaGVscGVycy9kb21IYW5kbGVyJyksXG4gICAgZXZlbnQgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2V2ZW50TGlzdGVuZXInKSxcbiAgICB0ZW1wbGF0ZU1ha2VyID0gcmVxdWlyZSgnLi4vaGVscGVycy90ZW1wbGF0ZU1ha2VyJyksXG4gICAgdG9vbHRpcFRlbXBsYXRlID0gcmVxdWlyZSgnLi90b29sdGlwVGVtcGxhdGUnKTtcblxudmFyIFRvb2x0aXAgPSB0dWkudXRpbC5kZWZpbmVDbGFzcyhUb29sdGlwQmFzZSwgLyoqIEBsZW5kcyBUb29sdGlwLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogVG9vbHRpcCBjb21wb25lbnQuXG4gICAgICogQGNvbnN0cnVjdHMgVG9vbHRpcFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheS48bnVtYmVyPn0gcGFyYW1zLnZhbHVlcyBjb252ZXJ0ZWQgdmFsdWVzXG4gICAgICogICAgICBAcGFyYW0ge2FycmF5fSBwYXJhbXMubGFiZWxzIGxhYmVsc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheX0gcGFyYW1zLmxlZ2VuZExhYmVscyBsZWdlbmQgbGFiZWxzXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLmJvdW5kIGF4aXMgYm91bmRcbiAgICAgKiAgICAgIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMudGhlbWUgYXhpcyB0aGVtZVxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICBUb29sdGlwQmFzZS5jYWxsKHRoaXMsIHBhcmFtcyk7XG4gICAgICAgIHRoaXMudHBsVG9vbHRpcCA9IHRoaXMuX2dldFRvb2x0aXBUZW1wbGF0ZSh0aGlzLm9wdGlvbnMudGVtcGxhdGUpO1xuICAgICAgICB0aGlzLl9zZXREZWZhdWx0VG9vbHRpcFBvc2l0aW9uT3B0aW9uKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB0b29sdGlwIHRlbXBsYXRlLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25UZW1wbGF0ZSB0ZW1wbGF0ZSBvcHRpb25cbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSB0ZW1wbGF0ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFRvb2x0aXBUZW1wbGF0ZTogZnVuY3Rpb24ob3B0aW9uVGVtcGxhdGUpIHtcbiAgICAgICAgcmV0dXJuIG9wdGlvblRlbXBsYXRlID8gdGVtcGxhdGVNYWtlci50ZW1wbGF0ZShvcHRpb25UZW1wbGF0ZSkgOiB0b29sdGlwVGVtcGxhdGUudHBsRGVmYXVsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGRlZmF1bHQgcG9zaXRpb24gb3B0aW9uIG9mIHRvb2x0aXAuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0RGVmYXVsdFRvb2x0aXBQb3NpdGlvbk9wdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucG9zaXRpb24pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmlzVmVydGljYWwpIHtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5wb3NpdGlvbiA9IGNoYXJ0Q29uc3QuVE9PTFRJUF9ERUZBVUxUX1BPU0lUSU9OX09QVElPTjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5wb3NpdGlvbiA9IGNoYXJ0Q29uc3QuVE9PTFRJUF9ERUZBVUxUX0hPUklaT05UQUxfUE9TSVRJT05fT1BUSU9OO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciB0b29sdGlwLlxuICAgICAqIEBwYXJhbSB7e3Bvc2l0aW9uOiBvYmplY3R9fSBib3VuZCB0b29sdGlwIGJvdW5kXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSB0b29sdGlwIGVsZW1lbnRcbiAgICAgKi9cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZWwgPSBUb29sdGlwQmFzZS5wcm90b3R5cGUucmVuZGVyLmNhbGwodGhpcyk7XG4gICAgICAgIHRoaXMuYXR0YWNoRXZlbnQoZWwpO1xuICAgICAgICByZXR1cm4gZWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvIG1ha2UgdG9vbHRpcCBkYXRhLlxuICAgICAqIEByZXR1cm5zIHthcnJheS48b2JqZWN0Pn0gdG9vbHRpcCBkYXRhXG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgbWFrZVRvb2x0aXBEYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGxhYmVscyA9IHRoaXMubGFiZWxzLFxuICAgICAgICAgICAgZ3JvdXBWYWx1ZXMgPSB0aGlzLnZhbHVlcyxcbiAgICAgICAgICAgIGxlZ2VuZExhYmVscyA9IHRoaXMubGVnZW5kTGFiZWxzO1xuXG4gICAgICAgIHJldHVybiB0dWkudXRpbC5tYXAoZ3JvdXBWYWx1ZXMsIGZ1bmN0aW9uKHZhbHVlcywgZ3JvdXBJbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuIHR1aS51dGlsLm1hcCh2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBsYWJlbHMgPyBsYWJlbHNbZ3JvdXBJbmRleF0gOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgbGVnZW5kOiBsZWdlbmRMYWJlbHNbaW5kZXhdLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWVcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGaXJlIGN1c3RvbSBldmVudCBzaG93QW5pbWF0aW9uLlxuICAgICAqIEBwYXJhbSB7e2dyb3VwSW5kZXg6IG51bWJlciwgaW5kZXg6IG51bWJlcn19IGluZGV4ZXMgaW5kZXhlc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2ZpcmVTaG93QW5pbWF0aW9uOiBmdW5jdGlvbihpbmRleGVzKSB7XG4gICAgICAgIHRoaXMuZmlyZSgnc2hvd0FuaW1hdGlvbicsIGluZGV4ZXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGaXJlIGN1c3RvbSBldmVudCBoaWRlQW5pbWF0aW9uLlxuICAgICAqIEBwYXJhbSB7e2dyb3VwSW5kZXg6IG51bWJlciwgaW5kZXg6IG51bWJlcn19IGluZGV4ZXMgaW5kZXhlc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2ZpcmVIaWRlQW5pbWF0aW9uOiBmdW5jdGlvbihpbmRleGVzKSB7XG4gICAgICAgIHRoaXMuZmlyZSgnaGlkZUFuaW1hdGlvbicsIGluZGV4ZXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgZGF0YSBpbmRleGVzLlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsVG9vbHRpcCB0b29sdGlwIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3tncm91cEluZGV4OiBudW1iZXIsIGluZGV4Om51bWJlcn19IGluZGV4ZXMgaW5kZXhlc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldEluZGV4ZXNDdXN0b21BdHRyaWJ1dGU6IGZ1bmN0aW9uKGVsVG9vbHRpcCwgaW5kZXhlcykge1xuICAgICAgICBlbFRvb2x0aXAuc2V0QXR0cmlidXRlKCdkYXRhLWdyb3VwSW5kZXgnLCBpbmRleGVzLmdyb3VwSW5kZXgpO1xuICAgICAgICBlbFRvb2x0aXAuc2V0QXR0cmlidXRlKCdkYXRhLWluZGV4JywgaW5kZXhlcy5pbmRleCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBkYXRhIGluZGV4ZXNcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbFRvb2x0aXAgdG9vbHRpcCBlbGVtZW50XG4gICAgICogQHJldHVybnMge3tncm91cEluZGV4OiBudW1iZXIsIGluZGV4OiBudW1iZXJ9fSBpbmRleGVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0SW5kZXhlc0N1c3RvbUF0dHJpYnV0ZTogZnVuY3Rpb24oZWxUb29sdGlwKSB7XG4gICAgICAgIHZhciBncm91cEluZGV4ID0gZWxUb29sdGlwLmdldEF0dHJpYnV0ZSgnZGF0YS1ncm91cEluZGV4JyksXG4gICAgICAgICAgICBpbmRleCA9IGVsVG9vbHRpcC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaW5kZXgnKSxcbiAgICAgICAgICAgIGluZGV4ZXM7XG4gICAgICAgIGlmIChncm91cEluZGV4ICYmIGluZGV4KSB7XG4gICAgICAgICAgICBpbmRleGVzID0ge1xuICAgICAgICAgICAgICAgIGdyb3VwSW5kZXg6IHBhcnNlSW50KGdyb3VwSW5kZXgsIDEwKSxcbiAgICAgICAgICAgICAgICBpbmRleDogcGFyc2VJbnQoaW5kZXgsIDEwKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaW5kZXhlcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHNob3dlZCBjdXN0b20gYXR0cmlidXRlLlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsVG9vbHRpcCB0b29sdGlwIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IHN0YXR1cyB3aGV0aGVyIHNob3dlZCBvciBub3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRTaG93ZWRDdXN0b21BdHRyaWJ1dGU6IGZ1bmN0aW9uKGVsVG9vbHRpcCwgc3RhdHVzKSB7XG4gICAgICAgIGVsVG9vbHRpcC5zZXRBdHRyaWJ1dGUoJ2RhdGEtc2hvd2VkJywgc3RhdHVzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciBzaG93ZWQgdG9vbHRpcCBvciBub3QuXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxUb29sdGlwIHRvb2x0aXAgZWxlbWVudFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSB3aGV0aGVyIHNob3dlZCB0b29sdGlwIG9yIG5vdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2lzU2hvd2VkVG9vbHRpcDogZnVuY3Rpb24oZWxUb29sdGlwKSB7XG4gICAgICAgIHJldHVybiBlbFRvb2x0aXAuZ2V0QXR0cmlidXRlKCdkYXRhLXNob3dlZCcpID09PSAndHJ1ZSc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE9uIG1vdXNlb3ZlciBldmVudCBoYW5kbGVyIGZvciB0b29sdGlwIGFyZWFcbiAgICAgKiBAcGFyYW0ge01vdXNlRXZlbnR9IGUgbW91c2UgZXZlbnRcbiAgICAgKi9cbiAgICBvbk1vdXNlb3ZlcjogZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgZWxUYXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQsXG4gICAgICAgICAgICBpbmRleGVzO1xuXG4gICAgICAgIGlmICghZG9tLmhhc0NsYXNzKGVsVGFyZ2V0LCBjaGFydENvbnN0LlRPT0xUSVBfUFJFRklYKSkge1xuICAgICAgICAgICAgZWxUYXJnZXQgPSBkb20uZmluZFBhcmVudEJ5Q2xhc3MoZWxUYXJnZXQsIGNoYXJ0Q29uc3QuVE9PTFRJUF9QUkVGSVgpO1xuICAgICAgICB9XG5cblxuICAgICAgICBpZiAoZWxUYXJnZXQuaWQgIT09IHRoaXMuX2dldFRvb2x0aXBJZCgpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpbmRleGVzID0gdGhpcy5fZ2V0SW5kZXhlc0N1c3RvbUF0dHJpYnV0ZShlbFRhcmdldCk7XG5cbiAgICAgICAgdGhpcy5fc2V0U2hvd2VkQ3VzdG9tQXR0cmlidXRlKGVsVGFyZ2V0LCB0cnVlKTtcblxuICAgICAgICB0aGlzLl9maXJlU2hvd0FuaW1hdGlvbihpbmRleGVzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogT24gbW91c2VvdXQgZXZlbnQgaGFuZGxlciBmb3IgdG9vbHRpcCBhcmVhXG4gICAgICogQHBhcmFtIHtNb3VzZUV2ZW50fSBlIG1vdXNlIGV2ZW50XG4gICAgICovXG4gICAgb25Nb3VzZW91dDogZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgZWxUYXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQ7XG5cblxuICAgICAgICBpZiAoIWRvbS5oYXNDbGFzcyhlbFRhcmdldCwgY2hhcnRDb25zdC5UT09MVElQX1BSRUZJWCkpIHtcbiAgICAgICAgICAgIGVsVGFyZ2V0ID0gZG9tLmZpbmRQYXJlbnRCeUNsYXNzKGVsVGFyZ2V0LCBjaGFydENvbnN0LlRPT0xUSVBfUFJFRklYKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlbFRhcmdldC5pZCAhPT0gdGhpcy5fZ2V0VG9vbHRpcElkKCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuaGlkZVRvb2x0aXAoZWxUYXJnZXQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBjYWxjdWxhdGUgdG9vbHRpcCBwb3NpdGlvbiBhYm91bnQgcGllIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IHBhcmFtcy5ib3VuZCBib3VuZFxuICAgICAqICAgICAgQHBhcmFtIHt7Y2xpZW50WDogbnVtYmVyLCBjbGllbnRZOiBudW1iZXJ9fSBwYXJhbXMuZXZlbnRQb3NpdGlvbiBtb3VzZSBwb3NpdGlvblxuICAgICAqIEByZXR1cm5zIHt7dG9wOiBudW1iZXIsIGxlZnQ6IG51bWJlcn19IHBvc2l0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2FsY3VsYXRlVG9vbHRpcFBvc2l0aW9uQWJvdXRQaWVDaGFydDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHBhcmFtcy5ib3VuZC5sZWZ0ID0gcGFyYW1zLmV2ZW50UG9zaXRpb24uY2xpZW50WCAtIHRoaXMuc2VyaWVzUG9zaXRpb24ubGVmdDtcbiAgICAgICAgcGFyYW1zLmJvdW5kLnRvcCA9IHBhcmFtcy5ldmVudFBvc2l0aW9uLmNsaWVudFkgLSB0aGlzLnNlcmllc1Bvc2l0aW9uLnRvcDtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NhbGN1bGF0ZVRvb2x0aXBQb3NpdGlvbkFib3V0Tm90QmFyQ2hhcnQocGFyYW1zKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gY2FsY3VsYXRlIHRvb2x0aXAgcG9zaXRpb24gYWJvdXQgbm90IGJhciBjaGFydC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7e2JvdW5kOiBvYmplY3R9fSBwYXJhbXMuZGF0YSBncmFwaCBpbmZvcm1hdGlvblxuICAgICAqICAgICAgQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBwYXJhbXMuZGltZW5zaW9uIHRvb2x0aXAgZGltZW5zaW9uXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLnBvc2l0aW9uT3B0aW9uIHBvc2l0aW9uIG9wdGlvbiAoZXg6ICdsZWZ0IHRvcCcpXG4gICAgICogQHJldHVybnMge3t0b3A6IG51bWJlciwgbGVmdDogbnVtYmVyfX0gcG9zaXRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jYWxjdWxhdGVUb29sdGlwUG9zaXRpb25BYm91dE5vdEJhckNoYXJ0OiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGJvdW5kID0gcGFyYW1zLmJvdW5kLFxuICAgICAgICAgICAgYWRkUG9zaXRpb24gPSBwYXJhbXMuYWRkUG9zaXRpb24sXG4gICAgICAgICAgICBtaW51c1dpZHRoID0gcGFyYW1zLmRpbWVuc2lvbi53aWR0aCAtIChib3VuZC53aWR0aCB8fCAwKSxcbiAgICAgICAgICAgIGxpbmVHYXAgPSBib3VuZC53aWR0aCA/IDAgOiBjaGFydENvbnN0LlRPT0xUSVBfR0FQLFxuICAgICAgICAgICAgcG9zaXRpb25PcHRpb24gPSBwYXJhbXMucG9zaXRpb25PcHRpb24gfHwgJycsXG4gICAgICAgICAgICB0b29sdGlwSGVpZ2h0ID0gcGFyYW1zLmRpbWVuc2lvbi5oZWlnaHQsXG4gICAgICAgICAgICByZXN1bHQgPSB7fTtcbiAgICAgICAgcmVzdWx0LmxlZnQgPSBib3VuZC5sZWZ0ICsgYWRkUG9zaXRpb24ubGVmdDtcbiAgICAgICAgcmVzdWx0LnRvcCA9IGJvdW5kLnRvcCAtIHRvb2x0aXBIZWlnaHQgKyBhZGRQb3NpdGlvbi50b3A7XG5cbiAgICAgICAgaWYgKHBvc2l0aW9uT3B0aW9uLmluZGV4T2YoJ2xlZnQnKSA+IC0xKSB7XG4gICAgICAgICAgICByZXN1bHQubGVmdCAtPSBtaW51c1dpZHRoICsgbGluZUdhcDtcbiAgICAgICAgfSBlbHNlIGlmIChwb3NpdGlvbk9wdGlvbi5pbmRleE9mKCdjZW50ZXInKSA+IC0xKSB7XG4gICAgICAgICAgICByZXN1bHQubGVmdCAtPSBtaW51c1dpZHRoIC8gMjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdC5sZWZ0ICs9IGxpbmVHYXA7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocG9zaXRpb25PcHRpb24uaW5kZXhPZignYm90dG9tJykgPiAtMSkge1xuICAgICAgICAgICAgcmVzdWx0LnRvcCArPSB0b29sdGlwSGVpZ2h0ICsgbGluZUdhcDtcbiAgICAgICAgfSBlbHNlIGlmIChwb3NpdGlvbk9wdGlvbi5pbmRleE9mKCdtaWRkbGUnKSA+IC0xKSB7XG4gICAgICAgICAgICByZXN1bHQudG9wICs9IHRvb2x0aXBIZWlnaHQgLyAyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0LnRvcCAtPSBjaGFydENvbnN0LlRPT0xUSVBfR0FQO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gY2FsY3VsYXRlIHRvb2x0aXAgcG9zaXRpb24gYWJvdXQgYmFyIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVyc1xuICAgICAqICAgICAgQHBhcmFtIHt7Ym91bmQ6IG9iamVjdH19IHBhcmFtcy5kYXRhIGdyYXBoIGluZm9ybWF0aW9uXG4gICAgICogICAgICBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IHBhcmFtcy5kaW1lbnNpb24gdG9vbHRpcCBkaW1lbnNpb25cbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMucG9zaXRpb25PcHRpb24gcG9zaXRpb24gb3B0aW9uIChleDogJ2xlZnQgdG9wJylcbiAgICAgKiBAcmV0dXJucyB7e3RvcDogbnVtYmVyLCBsZWZ0OiBudW1iZXJ9fSBwb3NpdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NhbGN1bGF0ZVRvb2x0aXBQb3NpdGlvbkFib3V0QmFyQ2hhcnQ6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgYm91bmQgPSBwYXJhbXMuYm91bmQsXG4gICAgICAgICAgICBhZGRQb3NpdGlvbiA9IHBhcmFtcy5hZGRQb3NpdGlvbixcbiAgICAgICAgICAgIG1pbnVzSGVpZ2h0ID0gcGFyYW1zLmRpbWVuc2lvbi5oZWlnaHQgLSAoYm91bmQuaGVpZ2h0IHx8IDApLFxuICAgICAgICAgICAgcG9zaXRpb25PcHRpb24gPSBwYXJhbXMucG9zaXRpb25PcHRpb24gfHwgJycsXG4gICAgICAgICAgICB0b29sdGlwV2lkdGggPSBwYXJhbXMuZGltZW5zaW9uLndpZHRoLFxuICAgICAgICAgICAgcmVzdWx0ID0ge307XG5cbiAgICAgICAgcmVzdWx0LmxlZnQgPSBib3VuZC5sZWZ0ICsgYm91bmQud2lkdGggKyBhZGRQb3NpdGlvbi5sZWZ0O1xuICAgICAgICByZXN1bHQudG9wID0gYm91bmQudG9wICsgYWRkUG9zaXRpb24udG9wO1xuXG4gICAgICAgIC8vIFRPRE8gOiBwb3NpdGlvbk9wdGlvbnPsnYQg6rCd7LK066GcIOunjOuTpOyWtOyEnCDqsoDsgqztlZjrj4TroZ0g67OA6rK97ZWY6riwIGV4KSBwb3NpdGlvbk9wdGlvbi5sZWZ0ID0gdHJ1ZVxuICAgICAgICBpZiAocG9zaXRpb25PcHRpb24uaW5kZXhPZignbGVmdCcpID4gLTEpIHtcbiAgICAgICAgICAgIHJlc3VsdC5sZWZ0IC09IHRvb2x0aXBXaWR0aDtcbiAgICAgICAgfSBlbHNlIGlmIChwb3NpdGlvbk9wdGlvbi5pbmRleE9mKCdjZW50ZXInKSA+IC0xKSB7XG4gICAgICAgICAgICByZXN1bHQubGVmdCAtPSB0b29sdGlwV2lkdGggLyAyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0LmxlZnQgKz0gY2hhcnRDb25zdC5UT09MVElQX0dBUDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwb3NpdGlvbk9wdGlvbi5pbmRleE9mKCd0b3AnKSA+IC0xKSB7XG4gICAgICAgICAgICByZXN1bHQudG9wIC09IG1pbnVzSGVpZ2h0O1xuICAgICAgICB9IGVsc2UgaWYgKHBvc2l0aW9uT3B0aW9uLmluZGV4T2YoJ21pZGRsZScpID4gLTEpIHtcbiAgICAgICAgICAgIHJlc3VsdC50b3AgLT0gbWludXNIZWlnaHQgLyAyO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlIHRvb2x0aXAgcG9zaXRpb24uXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzXG4gICAgICogICAgICBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IHBhcmFtcy5ib3VuZCBncmFwaCBib3VuZFxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5jaGFydFR5cGUgY2hhcnQgdHlwZVxuICAgICAqICAgICAgQHBhcmFtIHtib29sZWFufSBwYXJhbXMuYWxsb3dOZWdhdGl2ZVRvb2x0aXAgd2hldGhlciBhbGxvdyBuZWdhdGl2ZSB0b29sdGlwIG9yIG5vdFxuICAgICAqICAgICAgQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBwYXJhbXMuZGltZW5zaW9uIHRvb2x0aXAgZGltZW5zaW9uXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLnBvc2l0aW9uT3B0aW9uIHBvc2l0aW9uIG9wdGlvbiAoZXg6ICdsZWZ0IHRvcCcpXG4gICAgICogQHJldHVybnMge3t0b3A6IG51bWJlciwgbGVmdDogbnVtYmVyfX0gcG9zaXRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jYWxjdWxhdGVUb29sdGlwUG9zaXRpb246IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICB2YXIgcmVzdWx0ID0ge30sXG4gICAgICAgICAgICBzaXplVHlwZSwgcG9zaXRpb25UeXBlLCBhZGRQYWRkaW5nO1xuXG4gICAgICAgIGlmIChwYXJhbXMuZXZlbnRQb3NpdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NhbGN1bGF0ZVRvb2x0aXBQb3NpdGlvbkFib3V0UGllQ2hhcnQocGFyYW1zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYXJhbXMuY2hhcnRUeXBlID09PSBjaGFydENvbnN0LkNIQVJUX1RZUEVfQkFSKSB7XG4gICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9jYWxjdWxhdGVUb29sdGlwUG9zaXRpb25BYm91dEJhckNoYXJ0KHBhcmFtcyk7XG4gICAgICAgICAgICBzaXplVHlwZSA9ICd3aWR0aCc7XG4gICAgICAgICAgICBwb3NpdGlvblR5cGUgPSAnbGVmdCc7XG4gICAgICAgICAgICBhZGRQYWRkaW5nID0gMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuX2NhbGN1bGF0ZVRvb2x0aXBQb3NpdGlvbkFib3V0Tm90QmFyQ2hhcnQocGFyYW1zKTtcbiAgICAgICAgICAgIHNpemVUeXBlID0gJ2hlaWdodCc7XG4gICAgICAgICAgICBwb3NpdGlvblR5cGUgPSAndG9wJztcbiAgICAgICAgICAgIGFkZFBhZGRpbmcgPSAtMTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYXJhbXMuYWxsb3dOZWdhdGl2ZVRvb2x0aXApIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuX21vdmVUb1N5bW1ldHJ5KHJlc3VsdCwge1xuICAgICAgICAgICAgICAgIGJvdW5kOiBwYXJhbXMuYm91bmQsXG4gICAgICAgICAgICAgICAgaW5kZXhlczogcGFyYW1zLmluZGV4ZXMsXG4gICAgICAgICAgICAgICAgZGltZW5zaW9uOiBwYXJhbXMuZGltZW5zaW9uLFxuICAgICAgICAgICAgICAgIHNpemVUeXBlOiBzaXplVHlwZSxcbiAgICAgICAgICAgICAgICBwb3NpdGlvblR5cGU6IHBvc2l0aW9uVHlwZSxcbiAgICAgICAgICAgICAgICBhZGRQYWRkaW5nOiBhZGRQYWRkaW5nXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdmFsdWUgYnkgaW5kZXhlcy5cbiAgICAgKiBAcGFyYW0ge3tncm91cEluZGV4OiBudW1iZXIsIGluZGV4OiBudW1iZXJ9fSBpbmRleGVzIGluZGV4ZXNcbiAgICAgKiBAcmV0dXJucyB7KHN0cmluZyB8IG51bWJlcil9IHZhbHVlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0VmFsdWVCeUluZGV4ZXM6IGZ1bmN0aW9uKGluZGV4ZXMpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudmFsdWVzW2luZGV4ZXMuZ3JvdXBJbmRleF1baW5kZXhlcy5pbmRleF07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1vdmUgdG8gc3ltbWV0cnkuXG4gICAgICogQHBhcmFtIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IHBvc2l0aW9uIHRvb2x0aXAgcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gcGFyYW1zLmJvdW5kIGdyYXBoIGJvdW5kXG4gICAgICogICAgICBAcGFyYW0ge3N0cmluZ30gcGFyYW1zLmlkIHRvb2x0aXAgaWRcbiAgICAgKiAgICAgIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gcGFyYW1zLmRpbWVuc2lvbiB0b29sdGlwIGRpbWVuc2lvblxuICAgICAqICAgICAgQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5zaXplVHlwZSBzaXplIHR5cGUgKHdpZHRoIG9yIGhlaWdodClcbiAgICAgKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMucG9zaXRpb25UeXBlIHBvc2l0aW9uIHR5cGUgKGxlZnQgb3IgdG9wKVxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5hZGRQYWRkaW5nIGFkZCBwYWRkaW5nXG4gICAgICogQHJldHVybnMge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gbW92ZWQgcG9zaXRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tb3ZlVG9TeW1tZXRyeTogZnVuY3Rpb24ocG9zaXRpb24sIHBhcmFtcykge1xuICAgICAgICB2YXIgYm91bmQgPSBwYXJhbXMuYm91bmQsXG4gICAgICAgICAgICBzaXplVHlwZSA9IHBhcmFtcy5zaXplVHlwZSxcbiAgICAgICAgICAgIHBvc2l0aW9uVHlwZSA9IHBhcmFtcy5wb3NpdGlvblR5cGUsXG4gICAgICAgICAgICB2YWx1ZSA9IHRoaXMuX2dldFZhbHVlQnlJbmRleGVzKHBhcmFtcy5pbmRleGVzKSxcbiAgICAgICAgICAgIGNlbnRlcjtcblxuICAgICAgICBpZiAodmFsdWUgPCAwKSB7XG4gICAgICAgICAgICBjZW50ZXIgPSBib3VuZFtwb3NpdGlvblR5cGVdICsgKGJvdW5kW3NpemVUeXBlXSAvIDIpICsgKHBhcmFtcy5hZGRQYWRkaW5nIHx8IDApO1xuICAgICAgICAgICAgcG9zaXRpb25bcG9zaXRpb25UeXBlXSA9IHBvc2l0aW9uW3Bvc2l0aW9uVHlwZV0gLSAocG9zaXRpb25bcG9zaXRpb25UeXBlXSAtIGNlbnRlcikgKiAyIC0gcGFyYW1zLmRpbWVuc2lvbltzaXplVHlwZV07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcG9zaXRpb247XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB0b29sdGlwIGlkLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IHRvb2x0aXAgaWRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRUb29sdGlwSWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXRoaXMudG9vbHRpcElkKSB7XG4gICAgICAgICAgICB0aGlzLnRvb2x0aXBJZCA9IGNoYXJ0Q29uc3QuVE9PTFRJUF9JRF9QUkVGSVggKyAnLScgKyAobmV3IERhdGUoKSkuZ2V0VGltZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnRvb2x0aXBJZDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG8gbWFrZSB0b29sdGlwIGh0bWwuXG4gICAgICogQHBhcmFtIHt7Z3JvdXBJbmRleDogbnVtYmVyLCBpbmRleDogbnVtYmVyfX0gaW5kZXhlcyBpbmRleGVzXG4gICAgICogQHJldHVybnMge3N0cmluZ30gdG9vbHRpcCBodG1sXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVRvb2x0aXBIdG1sOiBmdW5jdGlvbihpbmRleGVzKSB7XG4gICAgICAgIHZhciBkYXRhID0gdGhpcy5kYXRhW2luZGV4ZXMuZ3JvdXBJbmRleF1baW5kZXhlcy5pbmRleF07XG4gICAgICAgIGRhdGEuc3VmZml4ID0gdGhpcy5zdWZmaXg7XG4gICAgICAgIHJldHVybiB0aGlzLnRwbFRvb2x0aXAoZGF0YSk7XG4gICAgfSxcblxuICAgIF9pc0NoYW5nZWRJbmRleGVzOiBmdW5jdGlvbihwcmV2SW5kZXhlcywgaW5kZXhlcykge1xuICAgICAgICByZXR1cm4gISFwcmV2SW5kZXhlcyAmJiAocHJldkluZGV4ZXMuZ3JvdXBJbmRleCAhPT0gaW5kZXhlcy5ncm91cEluZGV4IHx8IHByZXZJbmRleGVzLmluZGV4ICE9PSBpbmRleGVzLmluZGV4KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2hvdyB0b29sdGlwLlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsVG9vbHRpcCB0b29sdGlwIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3tpbmRleGVzOiB7Z3JvdXBJbmRleDogbnVtYmVyLCBpbmRleDogbnVtYmVyfSwgYm91bmQ6IG9iamVjdH19IHBhcmFtcyB0b29sdGlwIGRhdGFcbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gcHJldlBvc2l0aW9uIHByZXYgcG9zaXRpb25cbiAgICAgKi9cbiAgICBzaG93VG9vbHRpcDogZnVuY3Rpb24oZWxUb29sdGlwLCBwYXJhbXMsIHByZXZQb3NpdGlvbikge1xuICAgICAgICB2YXIgaW5kZXhlcyA9IHBhcmFtcy5pbmRleGVzLFxuICAgICAgICAgICAgY3VySW5kZXhlcyA9IHRoaXMuX2dldEluZGV4ZXNDdXN0b21BdHRyaWJ1dGUoZWxUb29sdGlwKSxcbiAgICAgICAgICAgIHBvc2l0aW9uO1xuXG4gICAgICAgIGlmIChlbFRvb2x0aXAuaWQgPT09IHRoaXMuX2dldFRvb2x0aXBJZCgpICYmIHRoaXMuX2lzQ2hhbmdlZEluZGV4ZXMoY3VySW5kZXhlcywgaW5kZXhlcykpIHtcbiAgICAgICAgICAgIHRoaXMuX2ZpcmVIaWRlQW5pbWF0aW9uKGN1ckluZGV4ZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgZWxUb29sdGlwLmlkID0gdGhpcy5fZ2V0VG9vbHRpcElkKCk7XG4gICAgICAgIGVsVG9vbHRpcC5pbm5lckhUTUwgPSB0aGlzLl9tYWtlVG9vbHRpcEh0bWwoaW5kZXhlcyk7XG5cbiAgICAgICAgdGhpcy5fc2V0SW5kZXhlc0N1c3RvbUF0dHJpYnV0ZShlbFRvb2x0aXAsIGluZGV4ZXMpO1xuICAgICAgICB0aGlzLl9zZXRTaG93ZWRDdXN0b21BdHRyaWJ1dGUoZWxUb29sdGlwLCB0cnVlKTtcblxuICAgICAgICBkb20uYWRkQ2xhc3MoZWxUb29sdGlwLCAnc2hvdycpO1xuXG4gICAgICAgIHBvc2l0aW9uID0gdGhpcy5fY2FsY3VsYXRlVG9vbHRpcFBvc2l0aW9uKHR1aS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICBkaW1lbnNpb246IHRoaXMuZ2V0VG9vbHRpcERpbWVuc2lvbihlbFRvb2x0aXApLFxuICAgICAgICAgICAgYWRkUG9zaXRpb246IHR1aS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgbGVmdDogMCxcbiAgICAgICAgICAgICAgICB0b3A6IDBcbiAgICAgICAgICAgIH0sIHRoaXMub3B0aW9ucy5hZGRQb3NpdGlvbiksXG4gICAgICAgICAgICBwb3NpdGlvbk9wdGlvbjogdGhpcy5vcHRpb25zLnBvc2l0aW9uIHx8ICcnLFxuICAgICAgICAgICAgZXZlbnRQb3NpdGlvbjogcGFyYW1zLmV2ZW50UG9zaXRpb25cbiAgICAgICAgfSwgcGFyYW1zKSk7XG5cbiAgICAgICAgdGhpcy5tb3ZlVG9Qb3NpdGlvbihlbFRvb2x0aXAsIHBvc2l0aW9uLCBwcmV2UG9zaXRpb24pO1xuICAgICAgICB0aGlzLl9maXJlU2hvd0FuaW1hdGlvbihpbmRleGVzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSGlkZSB0b29sdGlwLlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsVG9vbHRpcCB0b29sdGlwIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayBjYWxsYmFja1xuICAgICAqL1xuICAgIGhpZGVUb29sdGlwOiBmdW5jdGlvbihlbFRvb2x0aXApIHtcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgaW5kZXhlcyA9IHRoaXMuX2dldEluZGV4ZXNDdXN0b21BdHRyaWJ1dGUoZWxUb29sdGlwKTtcbiAgICAgICAgdGhpcy5fc2V0U2hvd2VkQ3VzdG9tQXR0cmlidXRlKGVsVG9vbHRpcCwgZmFsc2UpO1xuICAgICAgICB0aGlzLl9maXJlSGlkZUFuaW1hdGlvbihpbmRleGVzKTtcblxuICAgICAgICBpZiAodGhpcy5faXNDaGFuZ2VkSW5kZXhlcyh0aGlzLnByZXZJbmRleGVzLCBpbmRleGVzKSkge1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMucHJldkluZGV4ZXM7XG4gICAgICAgIH1cblxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHRoYXQuX2lzU2hvd2VkVG9vbHRpcChlbFRvb2x0aXApKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhhdC5oaWRlQW5pbWF0aW9uKGVsVG9vbHRpcCk7XG5cbiAgICAgICAgICAgIHRoYXQgPSBudWxsO1xuICAgICAgICAgICAgaW5kZXhlcyA9IG51bGw7XG4gICAgICAgIH0sIGNoYXJ0Q29uc3QuSElERV9ERUxBWSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCBldmVudFxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRhcmdldCBlbGVtZW50XG4gICAgICovXG4gICAgYXR0YWNoRXZlbnQ6IGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgIGV2ZW50LmJpbmRFdmVudCgnbW91c2VvdmVyJywgZWwsIHR1aS51dGlsLmJpbmQodGhpcy5vbk1vdXNlb3ZlciwgdGhpcykpO1xuICAgICAgICBldmVudC5iaW5kRXZlbnQoJ21vdXNlb3V0JywgZWwsIHR1aS51dGlsLmJpbmQodGhpcy5vbk1vdXNlb3V0LCB0aGlzKSk7XG4gICAgfVxufSk7XG5cbnR1aS51dGlsLkN1c3RvbUV2ZW50cy5taXhpbihUb29sdGlwKTtcblxubW9kdWxlLmV4cG9ydHMgPSBUb29sdGlwO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFRvb2x0aXBCYXNlIGlzIGJhc2UgY2xhc3Mgb2YgdG9vbHRpcCBjb21wb25lbnRzLlxuICogQGF1dGhvciBOSE4gRW50LlxuICogICAgICAgICBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZG9tID0gcmVxdWlyZSgnLi4vaGVscGVycy9kb21IYW5kbGVyJyksXG4gICAgcmVuZGVyVXRpbCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvcmVuZGVyVXRpbCcpO1xuXG52YXIgVG9vbHRpcEJhc2UgPSB0dWkudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIFRvb2x0aXBCYXNlLnByb3RvdHlwZSAqLyB7XG4gICAgLyoqXG4gICAgICogVG9vbHRpcEJhc2UgaXMgYmFzZSBjbGFzcyBvZiB0b29sdGlwIGNvbXBvbmVudHMuXG4gICAgICogQGNvbnN0cnVjdHMgVG9vbHRpcEJhc2VcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXkuPG51bWJlcj59IHBhcmFtcy52YWx1ZXMgY29udmVydGVkIHZhbHVlc1xuICAgICAqICAgICAgQHBhcmFtIHthcnJheX0gcGFyYW1zLmxhYmVscyBsYWJlbHNcbiAgICAgKiAgICAgIEBwYXJhbSB7YXJyYXl9IHBhcmFtcy5sZWdlbmRMYWJlbHMgbGVnZW5kIGxhYmVsc1xuICAgICAqICAgICAgQHBhcmFtIHtvYmplY3R9IHBhcmFtcy5ib3VuZCBheGlzIGJvdW5kXG4gICAgICogICAgICBAcGFyYW0ge29iamVjdH0gcGFyYW1zLnRoZW1lIGF4aXMgdGhlbWVcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdHVpLnV0aWwuZXh0ZW5kKHRoaXMsIHBhcmFtcyk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBjbGFzc05hbWVcbiAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2xhc3NOYW1lID0gJ3R1aS1jaGFydC10b29sdGlwLWFyZWEnO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUb29sdGlwQmFzZSBjb250YWluZXIuXG4gICAgICAgICAqIEB0eXBlIHtIVE1MRWxlbWVudH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZWxMYXlvdXQgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUb29sdGlwQmFzZSBiYXNlIGRhdGEuXG4gICAgICAgICAqIEB0eXBlIHthcnJheS48YXJyYXkuPG9iamVjdD4+fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5kYXRhID0gdGhpcy5tYWtlVG9vbHRpcERhdGEoKTtcblxuICAgICAgICB0aGlzLnN1ZmZpeCA9IHRoaXMub3B0aW9ucy5zdWZmaXggPyAnJm5ic3A7JyArIHRoaXMub3B0aW9ucy5zdWZmaXggOiAnJztcbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICAgKiBUbyBtYWtlIHRvb2x0aXAgZGF0YS5cbiAgICAgKiBAYWJzdHJhY3RcbiAgICAgKi9cbiAgICBtYWtlVG9vbHRpcERhdGE6IGZ1bmN0aW9uKCkge30sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdG9vbHRpcCBsYXlvdXQgZWxlbWVudC5cbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IGxheW91dCBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0VG9vbHRpcExheW91dEVsZW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZWxMYXlvdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmNoYXJ0SWQpO1xuICAgICAgICBpZiAoIWVsTGF5b3V0KSB7XG4gICAgICAgICAgICBlbExheW91dCA9IGRvbS5jcmVhdGUoJ0RJVicsIHRoaXMuY2xhc3NOYW1lKTtcbiAgICAgICAgICAgIGVsTGF5b3V0LmlkID0gdGhpcy5jaGFydElkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbExheW91dDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIHRvb2x0aXAuXG4gICAgICogQHBhcmFtIHt7cG9zaXRpb246IG9iamVjdH19IGJvdW5kIHRvb2x0aXAgYm91bmRcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHRvb2x0aXAgZWxlbWVudFxuICAgICAqL1xuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBlbCA9IHRoaXMuX2dldFRvb2x0aXBMYXlvdXRFbGVtZW50KCksXG4gICAgICAgICAgICBib3VuZCA9IHRoaXMuYm91bmQ7XG5cbiAgICAgICAgcmVuZGVyVXRpbC5yZW5kZXJQb3NpdGlvbihlbCwgYm91bmQucG9zaXRpb24pO1xuXG4gICAgICAgIHRoaXMuZWxMYXlvdXQgPSBlbDtcblxuICAgICAgICByZXR1cm4gZWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSB0b29sdGlwIGVsZW1lbnQuXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSB0b29sdGlwIGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jcmVhdGVUb29sdGlwRWxlbWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBlbFRvb2x0aXA7XG4gICAgICAgIGlmICghdGhpcy5lbExheW91dC5maXJzdENoaWxkKSB7XG4gICAgICAgICAgICBlbFRvb2x0aXAgPSBkb20uY3JlYXRlKCdESVYnLCAndHVpLWNoYXJ0LXRvb2x0aXAnKTtcbiAgICAgICAgICAgIGRvbS5hcHBlbmQodGhpcy5lbExheW91dCwgZWxUb29sdGlwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsVG9vbHRpcCA9IHRoaXMuZWxMYXlvdXQuZmlyc3RDaGlsZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZWxUb29sdGlwO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdG9vbHRpcCBlbGVtZW50LlxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gdG9vbHRpcCBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0VG9vbHRpcEVsZW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXRoaXMuZWxUb29sdGlwKSB7XG4gICAgICAgICAgICB0aGlzLmVsVG9vbHRpcCA9IHRoaXMuX2NyZWF0ZVRvb2x0aXBFbGVtZW50KCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZWxUb29sdGlwO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvblNob3cgaXMgY2FsbGJhY2sgb2YgY3VzdG9tIGV2ZW50IHNob3dUb29sdGlwIGZvciBTZXJpZXNWaWV3LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgY29vcmRpbmF0ZSBldmVudCBwYXJhbWV0ZXJzXG4gICAgICovXG4gICAgb25TaG93OiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgdmFyIGVsVG9vbHRpcCA9IHRoaXMuX2dldFRvb2x0aXBFbGVtZW50KCksXG4gICAgICAgICAgICBwcmV2UG9zaXRpb247XG4gICAgICAgIGlmIChlbFRvb2x0aXAub2Zmc2V0V2lkdGgpIHtcbiAgICAgICAgICAgIHByZXZQb3NpdGlvbiA9IHtcbiAgICAgICAgICAgICAgICBsZWZ0OiBlbFRvb2x0aXAub2Zmc2V0TGVmdCxcbiAgICAgICAgICAgICAgICB0b3A6IGVsVG9vbHRpcC5vZmZzZXRUb3BcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNob3dUb29sdGlwKGVsVG9vbHRpcCwgcGFyYW1zLCBwcmV2UG9zaXRpb24pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdG9vbHRpcCBkaW1lbnNpb25cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbFRvb2x0aXAgdG9vbHRpcCBlbGVtZW50XG4gICAgICogQHJldHVybnMge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IHJlbmRlcmVkIHRvb2x0aXAgZGltZW5zaW9uXG4gICAgICovXG4gICAgZ2V0VG9vbHRpcERpbWVuc2lvbjogZnVuY3Rpb24oZWxUb29sdGlwKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB3aWR0aDogZWxUb29sdGlwLm9mZnNldFdpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBlbFRvb2x0aXAub2Zmc2V0SGVpZ2h0XG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbmNlbCBoaWRlIHRvb2x0aXAuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2FuY2VsSGlkZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghdGhpcy5hY3RpdmVIaWRlcikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5hY3RpdmVIaWRlci50aW1lcklkKTtcbiAgICAgICAgdGhpcy5hY3RpdmVIaWRlci5zZXRPcGFjaXR5KDEpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYW5jZWwgc2xpZGUgdG9vbHRpcC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jYW5jZWxTbGlkZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghdGhpcy5hY3RpdmVTbGlkZXJzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0dWkudXRpbC5mb3JFYWNoKHRoaXMuYWN0aXZlU2xpZGVycywgZnVuY3Rpb24oc2xpZGVyKSB7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKHNsaWRlci50aW1lcklkKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5fY29tcGxldGVTbGlkZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBNb3ZlIHRvIFBvc2l0aW9uLlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsVG9vbHRpcCB0b29sdGlwIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gcG9zaXRpb24gcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gcHJldlBvc2l0aW9uIHByZXYgcG9zaXRpb25cbiAgICAgKi9cbiAgICBtb3ZlVG9Qb3NpdGlvbjogZnVuY3Rpb24oZWxUb29sdGlwLCBwb3NpdGlvbiwgcHJldlBvc2l0aW9uKSB7XG4gICAgICAgIGlmIChwcmV2UG9zaXRpb24pIHtcbiAgICAgICAgICAgIHRoaXMuX2NhbmNlbEhpZGUoKTtcbiAgICAgICAgICAgIHRoaXMuX2NhbmNlbFNsaWRlKCk7XG4gICAgICAgICAgICB0aGlzLl9zbGlkZVRvb2x0aXAoZWxUb29sdGlwLCBwcmV2UG9zaXRpb24sIHBvc2l0aW9uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlbmRlclV0aWwucmVuZGVyUG9zaXRpb24oZWxUb29sdGlwLCBwb3NpdGlvbik7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHNsaWRlci5cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBzbGlkZSB0eXBlIChob3Jpem9udGFsIG9yIHZlcnRpY2FsKVxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IGVmZmVjdCBvYmplY3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRTbGlkZXI6IGZ1bmN0aW9uKGVsZW1lbnQsIHR5cGUpIHtcbiAgICAgICAgaWYgKCF0aGlzLnNsaWRlcikge1xuICAgICAgICAgICAgdGhpcy5zbGlkZXIgPSB7fTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5zbGlkZXJbdHlwZV0pIHtcbiAgICAgICAgICAgIHRoaXMuc2xpZGVyW3R5cGVdID0gbmV3IHR1aS5jb21wb25lbnQuRWZmZWN0cy5TbGlkZSh7XG4gICAgICAgICAgICAgICAgZmxvdzogdHlwZSxcbiAgICAgICAgICAgICAgICBlbGVtZW50OiBlbGVtZW50LFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uOiAxMDBcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnNsaWRlclt0eXBlXTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29tcGxldGUgc2xpZGUgdG9vbHRpcC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jb21wbGV0ZVNsaWRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgZGVsZXRlIHRoaXMuYWN0aXZlU2xpZGVycztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2xpZGUgdG9vbHRpcFxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsVG9vbHRpcCB0b29sdGlwIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gcHJldlBvc2l0aW9uIHByZXYgcG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gcG9zaXRpb24gcG9zaXRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zbGlkZVRvb2x0aXA6IGZ1bmN0aW9uKGVsVG9vbHRpcCwgcHJldlBvc2l0aW9uLCBwb3NpdGlvbikge1xuICAgICAgICB2YXIgdlNsaWRlciA9IHRoaXMuX2dldFNsaWRlcihlbFRvb2x0aXAsICd2ZXJ0aWNhbCcpLFxuICAgICAgICAgICAgaFNsaWRlciA9IHRoaXMuX2dldFNsaWRlcihlbFRvb2x0aXAsICdob3Jpem9udGFsJyksXG4gICAgICAgICAgICBtb3ZlVG9wID0gcHJldlBvc2l0aW9uLnRvcCAtIHBvc2l0aW9uLnRvcCxcbiAgICAgICAgICAgIG1vdmVMZWZ0ID0gcHJldlBvc2l0aW9uLmxlZnQgLSBwb3NpdGlvbi5sZWZ0LFxuICAgICAgICAgICAgdkRpcmVjdGlvbiA9IG1vdmVUb3AgPiAwID8gJ2ZvcndvcmQnIDogJ2JhY2t3b3JkJyxcbiAgICAgICAgICAgIGhEaXJlY3Rpb24gPSBtb3ZlVG9wID4gMCA/ICdmb3J3b3JkJyA6ICdiYWNrd29yZCcsXG4gICAgICAgICAgICBhY3RpdmVTbGlkZXJzID0gW10sXG4gICAgICAgICAgICBjb21wbGF0ZSA9IHR1aS51dGlsLmJpbmQodGhpcy5fY29tcGxldGVTbGlkZSwgdGhpcyk7XG5cbiAgICAgICAgaWYgKG1vdmVUb3ApIHtcbiAgICAgICAgICAgIHZTbGlkZXIuc2V0RGlzdGFuY2UobW92ZVRvcCk7XG4gICAgICAgICAgICB2U2xpZGVyLmFjdGlvbih7XG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uOiB2RGlyZWN0aW9uLFxuICAgICAgICAgICAgICAgIHN0YXJ0OiBwcmV2UG9zaXRpb24udG9wLFxuICAgICAgICAgICAgICAgIGNvbXBsZXRlOiBjb21wbGF0ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBhY3RpdmVTbGlkZXJzLnB1c2godlNsaWRlcik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobW92ZUxlZnQpIHtcbiAgICAgICAgICAgIGhTbGlkZXIuc2V0RGlzdGFuY2UobW92ZUxlZnQpO1xuICAgICAgICAgICAgaFNsaWRlci5hY3Rpb24oe1xuICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogaERpcmVjdGlvbixcbiAgICAgICAgICAgICAgICBzdGFydDogcHJldlBvc2l0aW9uLmxlZnQsXG4gICAgICAgICAgICAgICAgY29tcGxldGU6IGNvbXBsYXRlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGFjdGl2ZVNsaWRlcnMucHVzaCh2U2xpZGVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChhY3RpdmVTbGlkZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5hY3RpdmVTbGlkZXJzID0gYWN0aXZlU2xpZGVycztcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvbkhpZGUgaXMgY2FsbGJhY2sgb2YgY3VzdG9tIGV2ZW50IGhpZGVUb29sdGlwIGZvciBTZXJpZXNWaWV3XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IGluZGV4XG4gICAgICovXG4gICAgb25IaWRlOiBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICB2YXIgZWxUb29sdGlwID0gdGhpcy5fZ2V0VG9vbHRpcEVsZW1lbnQoKTtcbiAgICAgICAgdGhpcy5oaWRlVG9vbHRpcChlbFRvb2x0aXAsIGluZGV4KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGhpZGVyLlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgZWxlbWVudFxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IGVmZmVjdCBvYmplY3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRIaWRlcjogZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICBpZiAoIXRoaXMuaGlkZXIpIHtcbiAgICAgICAgICAgIHRoaXMuaGlkZXIgPSBuZXcgdHVpLmNvbXBvbmVudC5FZmZlY3RzLkZhZGUoe1xuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IGVsZW1lbnQsXG4gICAgICAgICAgICAgICAgZHVyYXRpb246IDEwMFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5oaWRlcjtcbiAgICB9LFxuXG4gICAgaGlkZUFuaW1hdGlvbjogZnVuY3Rpb24oZWxUb29sdGlwKSB7XG4gICAgICAgIHRoaXMuYWN0aXZlSGlkZXIgPSB0aGlzLl9nZXRIaWRlcihlbFRvb2x0aXApO1xuICAgICAgICB0aGlzLmFjdGl2ZUhpZGVyLmFjdGlvbih7XG4gICAgICAgICAgICBzdGFydDogMSxcbiAgICAgICAgICAgIGVuZDogMCxcbiAgICAgICAgICAgIGNvbXBsZXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBkb20ucmVtb3ZlQ2xhc3MoZWxUb29sdGlwLCAnc2hvdycpO1xuICAgICAgICAgICAgICAgIGVsVG9vbHRpcC5zdHlsZS5jc3NUZXh0ID0gJyc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuXG50dWkudXRpbC5DdXN0b21FdmVudHMubWl4aW4oVG9vbHRpcEJhc2UpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRvb2x0aXBCYXNlO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFRoaXMgaXMgdGVtcGxhdGVzIG9mIHRvb2x0aXAuXG4gKiBAYXV0aG9yIE5ITiBFbnQuXG4gKiAgICAgICAgIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG52YXIgdGVtcGxhdGVNYWtlciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvdGVtcGxhdGVNYWtlcicpO1xuXG52YXIgdGFncyA9IHtcbiAgICBIVE1MX0RFRkFVTFRfVEVNUExBVEU6ICc8ZGl2IGNsYXNzPVwidHVpLWNoYXJ0LWRlZmF1bHQtdG9vbHRpcFwiPicgK1xuICAgICAgICAnPGRpdj57eyBjYXRlZ29yeSB9fTwvZGl2PicgK1xuICAgICAgICAnPGRpdj4nICtcbiAgICAgICAgICAgICc8c3Bhbj57eyBsZWdlbmQgfX08L3NwYW4+OicgK1xuICAgICAgICAgICAgJyZuYnNwOzxzcGFuPnt7IHZhbHVlIH19PC9zcGFuPicgK1xuICAgICAgICAgICAgJzxzcGFuPnt7IHN1ZmZpeCB9fTwvc3Bhbj4nICtcbiAgICAgICAgJzwvZGl2PicgK1xuICAgICc8L2Rpdj4nLFxuICAgIEhUTUxfR1JPVVA6ICc8ZGl2IGNsYXNzPVwidHVpLWNoYXJ0LWRlZmF1bHQtdG9vbHRpcCB0dWktY2hhcnQtZ3JvdXAtdG9vbHRpcFwiPicgK1xuICAgICAgICAnPGRpdj57eyBjYXRlZ29yeSB9fTwvZGl2PicgK1xuICAgICAgICAne3sgaXRlbXMgfX0nICtcbiAgICAnPC9kaXY+JyxcbiAgICBIVE1MX0dST1VQX0lURU06ICc8ZGl2PicgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cInR1aS1jaGFydC1sZWdlbmQtcmVjdCB7eyBjaGFydFR5cGUgfX1cIiBzdHlsZT1cInt7IGNzc1RleHQgfX1cIj48L2Rpdj4mbmJzcDs8c3Bhbj57eyBsZWdlbmQgfX08L3NwYW4+OicgK1xuICAgICAgICAnJm5ic3A7PHNwYW4+e3sgdmFsdWUgfX08L3NwYW4+JyArXG4gICAgICAgICc8c3Bhbj57eyBzdWZmaXggfX08L3NwYW4+JyArXG4gICAgJzwvZGl2PicsXG4gICAgR1JPVVBfQ1NTX1RFWFQ6ICdiYWNrZ3JvdW5kLWNvbG9yOnt7IGNvbG9yIH19J1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgdHBsRGVmYXVsdDogdGVtcGxhdGVNYWtlci50ZW1wbGF0ZSh0YWdzLkhUTUxfREVGQVVMVF9URU1QTEFURSksXG4gICAgdHBsR3JvdXA6IHRlbXBsYXRlTWFrZXIudGVtcGxhdGUodGFncy5IVE1MX0dST1VQKSxcbiAgICB0cGxHcm91cEl0ZW06IHRlbXBsYXRlTWFrZXIudGVtcGxhdGUodGFncy5IVE1MX0dST1VQX0lURU0pLFxuICAgIHRwbEdyb3VwQ3NzVGV4dDogdGVtcGxhdGVNYWtlci50ZW1wbGF0ZSh0YWdzLkdST1VQX0NTU19URVhUKVxufTtcbiJdfQ==
