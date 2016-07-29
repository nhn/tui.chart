/**
 * @fileoverview tui.chart
 * @author NHN Ent. FE Development Lab <dl_javascript@nhnent.com>
 * @version 2.2.0
 * @license MIT
 * @link https://github.com/nhnent/tui.chart
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * @fileoverview  Axis component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var dom = require('../helpers/domHandler');
var chartConst = require('../const');
var predicate = require('../helpers/predicate');
var calculator = require('../helpers/calculator');
var renderUtil = require('../helpers/renderUtil');
var axisTemplate = require('./axisTemplate');

var Axis = tui.util.defineClass(/** @lends Axis.prototype */ {
    /**
     * Axis component.
     * @constructs Axis
     * @param {object} params parameters
     *      @param {object} params.bound axis bound
     *      @param {object} params.theme axis theme
     *      @param {object} params.options axis options
     */
    init: function(params) {
        /**
         * Axis view className
         * @type {string}
         */
        this.className = 'tui-chart-axis-area';

        /**
         * Chart type
         * @type {string}
         */
        this.chartType = params.chartType;

        /**
         * Data processor
         * @type {DataProcessor}
         */
        this.dataProcessor = params.dataProcessor;

        /**
         * Bounds maker
         * @type {BoundsMaker}
         */
        this.boundsMaker = params.boundsMaker;

        /**
         * Options
         * @type {object}
         */
        this.options = params.options || {};

        /**
         * Theme
         * @type {object}
         */
        this.theme = params.theme || {};

        /**
         * Whether label type or not.
         * @type {boolean}
         */
        this.isLabel = params.isLabel;

        /**
         * Whether vertical type or not.
         */
        this.isVertical = params.isVertical;

        /**
         * Data for rendering
         * @type {object}
         */
        this.data = {};
    },

    /**
     * Make height of x axis area.
     * @returns {number} height
     * @private
     */
    _makeXAxisHeight: function() {
        var title = this.options.title;
        var titleHeight = renderUtil.getRenderedLabelHeight(title, this.theme.title);
        var titleAreaHeight = titleHeight ? (titleHeight + chartConst.TITLE_PADDING) : 0;
        var labelHeight = renderUtil.getRenderedLabelHeight(chartConst.MAX_HEIGHT_WORLD, this.theme.label);

        return titleAreaHeight + labelHeight + chartConst.CHART_PADDING;
    },

    /**
     * Make width of y axis area.
     * @param {Array.<string | number>} labels labels
     * @param {{title: ?string, isCenter: ?boolean, rotateTitle: ?boolean}} options - options
     * @returns {number}
     * @private
     */
    _makeYAxisWidth: function(labels, options) {
        var title = options.title || '';
        var theme = this.theme;
        var titleAreaWidth = 0;
        var width = 0;

        if (options.isCenter) {
            width += chartConst.AXIS_LABEL_PADDING;
        } else if (options.rotateTitle === false) {
            titleAreaWidth = renderUtil.getRenderedLabelWidth(title, theme.title) + chartConst.TITLE_PADDING;
        } else {
            titleAreaWidth = renderUtil.getRenderedLabelHeight(title, theme.title) + chartConst.TITLE_PADDING;
        }

        width += renderUtil.getRenderedLabelsMaxWidth(labels, theme.label) + titleAreaWidth +
            chartConst.AXIS_LABEL_PADDING;

        return width;
    },

    /**
     * Whether valid axis or not.
     * @returns {boolean} whether valid axis or not.
     * @private
     */
    _isValidAxis: function() {
        var isValid = true;

        if (this.componentName === 'rightYAxis') {
            isValid = this.dataProcessor.isValidAllSeriesDataModel();
        }

        return isValid;
    },

    /**
     * Register legend dimension to boundsMaker.
     */
    registerDimension: function() {
        var dimension = {};
        var categories;

        if (!this._isValidAxis()) {
            return;
        }

        if (this.componentType === 'xAxis') {
            dimension.height = this._makeXAxisHeight();
            this.boundsMaker.registerBaseDimension(this.componentName, dimension);
        } else if (this.isLabel) {
            categories = this.dataProcessor.getCategories(this.isVertical);
            dimension.width = this._makeYAxisWidth(categories, this.options);
            this.boundsMaker.registerBaseDimension(this.componentName, dimension);
        }
    },

    /**
     * Register legend additional dimension to boundsMaker.
     */
    registerAdditionalDimension: function() {
        var axesData = this.boundsMaker.axesData;
        var dimension, options;

        if (!this._isValidAxis()) {
            return;
        }

        if ((this.componentType === 'yAxis') && !this.isLabel) {
            if (this.componentName === 'rightYAxis') {
                options = this.options;
            } else {
                options = axesData.yAxis.options;
            }

            dimension = {
                width: this._makeYAxisWidth(axesData.yAxis.labels, options)
            };

            this.boundsMaker.registerBaseDimension(this.componentName, dimension);
        }
    },

    /**
     * Render opposite side tick area.
     * @param {string} tickHtml tick html
     * @returns {?HTMLElement} right tick area element
     * @private
     */
    _renderOppositeSideTickArea: function(tickHtml) {
        var tickContainer;

        if (this.options.isCenter) {
            tickContainer = dom.create('DIV', 'tui-chart-tick-area opposite-side');
            tickContainer.innerHTML = tickHtml;
        }

        return tickContainer;
    },

    /**
     * Add css classes.
     * @param {HTMLElement} axisContainer axis container
     * @private
     */
    _addCssClasses: function(axisContainer) {
        dom.addClass(axisContainer, this.isVertical ? 'vertical' : 'horizontal');
        dom.addClass(axisContainer, this.options.isCenter ? 'center' : '');
        dom.addClass(axisContainer, this.options.divided ? 'division' : '');
        dom.addClass(axisContainer, this.data.isPositionRight ? 'right' : '');
    },


    /**
     * Render child containers like title area, label area and tick area.
     * @param {number} size xAxis width or yAxis height
     * @param {number} width axis width
     * @param {number} tickCount tick count
     * @param {Array.<number|string>} categories categories
     * @param {number} additionalWidth additional width
     * @returns {Array.<HTMLElement>} child containers
     * @private
     */
    _renderChildContainers: function(size, width, tickCount, categories, additionalWidth) {
        var titleContainer = this._renderTitleArea(size),
            labelContainer = this._renderLabelArea(size, width, tickCount, categories, additionalWidth),
            childContainers = [titleContainer, labelContainer],
            isVerticalLineType = this.isVertical && this.data.aligned,
            tickContainer, oppositeSideTickContainer;

        if (!isVerticalLineType) {
            tickContainer = this._renderTickArea(size, tickCount, additionalWidth);
            oppositeSideTickContainer = this._renderOppositeSideTickArea(tickContainer.innerHTML);
            childContainers = childContainers.concat([tickContainer, oppositeSideTickContainer]);
        }

        return childContainers;
    },

    /**
     * Render divided xAxis if yAxis rendered in the center.
     * @param {HTMLElement} axisContainer axis container element
     * @param {number} width axis area width
     * @private
     */
    _renderDividedAxis: function(axisContainer, width) {
        var lWidth = Math.round(width / 2);
        var rWidth = width - lWidth;
        var tickCount = this.data.tickCount;
        var halfTickCount = parseInt(tickCount / 2, 10) + 1;
        var categories = this.data.labels;
        var lCategories = categories.slice(0, halfTickCount);
        var rCategories = categories.slice(halfTickCount - 1, tickCount);
        var additionalWidth = lWidth + this.boundsMaker.getDimension('yAxis').width;
        var lContainers = this._renderChildContainers(lWidth, lWidth, halfTickCount, lCategories);
        var rContainers = this._renderChildContainers(rWidth, rWidth, halfTickCount, rCategories, additionalWidth);
        var rTitleContainer = rContainers[0];

        dom.addClass(rTitleContainer, 'right');
        dom.append(axisContainer, lContainers.concat(rContainers));
    },

    /**
     * Render single axis if not divided.
     * @param {HTMLElement} axisContainer axis container element
     * @param {{width: number, height: number}} dimension axis area dimension
     * @private
     */
    _renderNotDividedAxis: function(axisContainer, dimension) {
        var data = this.data;
        var isVertical = this.isVertical;
        var width = dimension.width;
        var size = isVertical ? dimension.height : width;
        var additionalSize = 0;
        var childContainers;

        if (data.positionRatio) {
            additionalSize = size * data.positionRatio;
        }

        childContainers = this._renderChildContainers(size, width, data.tickCount, data.labels, additionalSize);

        dom.append(axisContainer, childContainers);
    },

    /**
     * Render axis area.
     * @param {HTMLElement} axisContainer axis area element
     * @param {{isVertical: boolean, isPositionRight: boolean, aligned: aligned}} data rendering data
     * @private
     */
    _renderAxisArea: function(axisContainer) {
        var dimension = tui.util.extend({}, this.boundsMaker.getDimension(this.componentName));

        this._addCssClasses(axisContainer);

        if (this.options.divided) {
            this.containerWidth = dimension.width + this.boundsMaker.getDimension('yAxis').width;
            this._renderDividedAxis(axisContainer, dimension.width);
            dimension.width = this.containerWidth;
        } else {
            this._renderNotDividedAxis(axisContainer, dimension);
            dimension.width += this.options.isCenter ? 2 : 0;
        }

        renderUtil.renderDimension(axisContainer, dimension);
        renderUtil.renderPosition(axisContainer, this.boundsMaker.getPosition(this.componentName));
    },

    /**
     * Render axis component.
     * @param {{isPositionRight: boolean, aligned: aligned}} data rendering data
     * @returns {HTMLElement} axis area base element
     */
    render: function(data) {
        var container = dom.create('DIV', this.className);

        this.data = data;
        this._renderAxisArea(container);
        this.axisContainer = container;

        return container;
    },

    /**
     * Rerender axis component.
     * @param {object} data - data for rendering
     */
    rerender: function(data) {
        this.axisContainer.innerHTML = '';

        if (this._isValidAxis()) {
            if (data.options) {
                this.options = data.options;
            }
            this.data = data;
            this._renderAxisArea(this.axisContainer);
        }
    },

    /**
     * Resize axis component.
     * @param {object} data - data for rendering
     */
    resize: function(data) {
        this.rerender(data);
    },

    /**
     * Zoom.
     * @param {object} data - data for rendering
     */
    zoom: function(data) {
        this.rerender(data);
    },

    /**
     * Move axis to left.
     * @param {number} tickSize - tick size for moving
     * @private
     */
    _moveToLeft: function(tickSize) {
        var ticksElement = this.ticksElement;
        var firstTickElement = ticksElement.firstChild;
        var labelContainer = this.labelContainer;
        var firstLabelElement = labelContainer.firstChild;
        var ticksBeforeLeft = parseInt(ticksElement.style.left, 10) || 0;
        var labelBeforeLeft = parseInt(labelContainer.style.left, 10) || 0;
        var startIndex = this.data.startIndex || 0;

        renderUtil.startAnimation(300, function(ratio) {
            var left = tickSize * ratio;
            var opacity = 1 - ratio;

            ticksElement.style.left = (ticksBeforeLeft - left) + 'px';
            labelContainer.style.left = (labelBeforeLeft - left) + 'px';

            if (startIndex === 0) {
                renderUtil.setOpacity([firstTickElement, firstLabelElement], opacity);
            }
        });
    },

    /**
     * Resize by tick size.
     * @param {number} tickSize - tick size for resizing
     * @private
     */
    _resizeByTickSize: function(tickSize) {
        var ticksElement = this.ticksElement;
        var labelContainer = this.labelContainer;
        var beforeWidth = parseInt(ticksElement.style.width, 10) || ticksElement.offsetWidth;

        renderUtil.startAnimation(300, function(ratio) {
            var width = beforeWidth - (tickSize * ratio);

            ticksElement.style.width = width + 'px';
            labelContainer.style.width = width + 'px';
        });
    },

    /**
     * Animate for adding data.
     * @param {{tickSize: number}} data - data for animate
     */
    animateForAddingData: function(data) {
        if (this.isVertical) {
            return;
        }

        if (data.shifting) {
            this._moveToLeft(data.tickSize);
        } else {
            this._resizeByTickSize(data.tickSize);
        }
    },

    /**
     * Make cssText from position map for css.
     * @param {object.<string, number>} positionMap - position map for css
     * @returns {string}
     * @private
     */
    _makeCssTextFromPositionMap: function(positionMap) {
        tui.util.forEach(positionMap, function(value, name) {
            positionMap[name] = value + 'px';
        });

        return renderUtil.makeCssTextFromMap(positionMap);
    },

    /**
     * Make position map for center align option of y axis.
     * @returns {{left: number, bottom: number}}
     * @private
     */
    _makePositionMapForCenterAlign: function() {
        var titleWidth = renderUtil.getRenderedLabelWidth(this.options.title, this.theme.title);
        var yAxisWidth = this.boundsMaker.getDimension('yAxis').width;
        var xAxisHeight = this.boundsMaker.getDimension('xAxis').height;

        return {
            left: (yAxisWidth - titleWidth) / 2,
            bottom: -xAxisHeight
        };
    },

    /**
     * Make right position for right y axis.
     * @param {number} size - width or height
     * @returns {number}
     * @private
     */
    _makeRightPosition: function(size) {
        var rightPosition;

        if (renderUtil.isIE7() || this.options.rotateTitle === false) {
            rightPosition = 0;
        } else {
            rightPosition = -size;
        }

        return rightPosition;
    },

    /**
     * Make top position.
     * @param {number} size - width or height
     * @returns {?number}
     * @private
     */
    _makeTopPosition: function(size) {
        var topPosition = null;
        var titleHeight;

        if (this.options.rotateTitle === false) {
            titleHeight = renderUtil.getRenderedLabelHeight(this.options.title, this.theme.title);
            topPosition = (size - titleHeight) / 2;
        } else if (this.data.isPositionRight) {
            topPosition = 0;
        } else if (!renderUtil.isOldBrowser()) {
            topPosition = size;
        }

        return topPosition;
    },

    /**
     * Make positionMap for not center align.
     * @param {number} size - width or height
     * @returns {object.<string, number>}
     * @private
     */
    _makePositionMapForNotCenterAlign: function(size) {
        var positionMap = {};
        var topPosition;

        if (this.data.isPositionRight) {
            positionMap.right = this._makeRightPosition(size);
        } else {
            positionMap.left = 0;
        }

        topPosition = this._makeTopPosition(size);

        if (!tui.util.isNull(topPosition)) {
            positionMap.top = topPosition;
        }

        return positionMap;
    },

    /**
     * Render css style of title area
     * @param {HTMLElement} titleContainer title element
     * @param {number} size width or height
     * @private
     */
    _renderTitleAreaStyle: function(titleContainer, size) {
        var cssPositionMap;
        var cssText;

        if (this.options.isCenter) {
            cssPositionMap = this._makePositionMapForCenterAlign();
        } else {
            cssPositionMap = this._makePositionMapForNotCenterAlign(size);
        }

        if (this.options.rotateTitle !== false) {
            cssPositionMap.width = size;
        }

        cssText = this._makeCssTextFromPositionMap(cssPositionMap);
        titleContainer.style.cssText += ';' + cssText;
    },

    /**
     * Title area renderer
     * @param {?number} size (width or height)
     * @returns {HTMLElement} title element
     * @private
     */
    _renderTitleArea: function(size) {
        var titleContainer = renderUtil.renderTitle(this.options.title, this.theme.title, 'tui-chart-title-area');

        if (titleContainer && this.isVertical) {
            this._renderTitleAreaStyle(titleContainer, size);
        }

        if (this.options.rotateTitle !== false) {
            dom.addClass(titleContainer, 'rotation');
        }

        return titleContainer;
    },

    /**
     * Make tick line html.
     * @param {number} areaSize - area size (width or height)
     * @param {string} posType - position type
     * @param {boolean} isNotDividedXAxis - whether not divided xAxis or not
     * @param {number} additionalSize - additional size
     * @returns {string}
     * @private
     */
    _makeTickLineHtml: function(areaSize, posType, isNotDividedXAxis, additionalSize) {
        var tickLineExtend = isNotDividedXAxis ? chartConst.OVERLAPPING_WIDTH : 0;
        var linePositionValue = -tickLineExtend;
        var lineSize, html;

        if (this.data.lineWidth) {
            lineSize = this.data.lineWidth;
        } else {
            lineSize = areaSize + tickLineExtend;
            linePositionValue += additionalSize;
        }

        html = axisTemplate.tplTickLine({
            positionType: posType,
            positionValue: linePositionValue,
            sizeType: this.isVertical ? 'height' : 'width',
            size: lineSize
        });

        return html;
    },

    /**
     * Make percentage position.
     * @param {Array.<number>} positions - positions
     * @param {number} areaSize - area size
     * @returns {Array.<number>}
     * @private
     */
    _makePercentagePositions: function(positions, areaSize) {
        areaSize = this.containerWidth || areaSize;

        return tui.util.map(positions, function(position) {
            return calculator.makePercentageValue(position, areaSize);
        });
    },

    /**
     * Make tick html.
     * @param {number} size - area size
     * @param {number} tickCount - tick count
     * @param {boolean} isNotDividedXAxis - whether not divided xAxis or not
     * @param {number} additionalSize - additional size
     * @returns {string}
     * @private
     */
    _makeTickHtml: function(size, tickCount, isNotDividedXAxis, additionalSize) {
        var tickColor = this.theme.tickColor;
        var sizeRatio = this.data.sizeRatio || 1;
        var posType = this.isVertical ? 'bottom' : 'left';
        var positions = calculator.makeTickPixelPositions((size * sizeRatio), tickCount);
        var containerWidth = this.containerWidth || size;
        var template, html;

        positions.length = this.data.labels.length;

        additionalSize = calculator.makePercentageValue(additionalSize, containerWidth);
        positions = this._makePercentagePositions(positions, size);

        template = axisTemplate.tplAxisTick;
        html = tui.util.map(positions, function(position, index) {
            var tickHtml, cssTexts;

            position -= (index === 0 && isNotDividedXAxis) ? calculator.makePercentageValue(1, containerWidth) : 0;

            cssTexts = [
                renderUtil.concatStr('background-color:', tickColor),
                renderUtil.concatStr(posType, ': ', additionalSize + position, '%')
            ].join(';');
            tickHtml = template({cssText: cssTexts});

            return tickHtml;
        }).join('');

        return html;
    },

    /**
     * Render tick line.
     * @param {number} areaSize - width or height
     * @param {boolean} isNotDividedXAxis - whether is not divided x axis or not.
     * @param {number} additionalSize - additional size
     * @returns {HTMLElement}
     * @private
     */
    _renderTickLine: function(areaSize, isNotDividedXAxis, additionalSize) {
        var tickLineElement = dom.create('DIV', 'tui-chart-tick-line');
        var tickLineExtend = isNotDividedXAxis ? chartConst.OVERLAPPING_WIDTH : 0;
        var positionValue = -tickLineExtend;
        var cssMap = {};
        var sizeType, posType, lineSize;

        if (this.isVertical) {
            sizeType = 'height';
            posType = 'bottom';
        } else {
            sizeType = 'width';
            posType = 'left';
        }

        if (this.data.lineWidth) {
            lineSize = this.data.lineWidth;
        } else {
            lineSize = areaSize + tickLineExtend;
            positionValue += additionalSize;
        }

        cssMap[posType] = positionValue;
        cssMap[sizeType] = lineSize;

        tickLineElement.style.cssText = this._makeCssTextFromPositionMap(cssMap);

        return tickLineElement;
    },

    /**
     * Render ticks.
     * @param {number} areaSize - width or height
     * @param {number} tickCount - tick count
     * @param {boolean} isNotDividedXAxis - whether is not divided x axis or not.
     * @param {number} additionalSize - additional size
     * @returns {HTMLElement}
     * @private
     */
    _renderTicks: function(areaSize, tickCount, isNotDividedXAxis, additionalSize) {
        var ticksElement = dom.create('DIV', 'tui-chart-ticks');
        var ticksHtml = this._makeTickHtml(areaSize, tickCount, isNotDividedXAxis, additionalSize);

        ticksElement.innerHTML = ticksHtml;

        return ticksElement;
    },

    /**
     * Render tick area.
     * @param {number} size - width or height
     * @param {number} tickCount - tick count
     * @param {?number} additionalSize - additional size (width or height)
     * @returns {HTMLElement}
     * @private
     */
    _renderTickArea: function(size, tickCount, additionalSize) {
        var tickContainer = dom.create('DIV', 'tui-chart-tick-area');
        var isNotDividedXAxis = !this.isVertical && !this.options.divided;
        var tickLineElement, ticksElement;

        additionalSize = additionalSize || 0;
        tickLineElement = this._renderTickLine(size, isNotDividedXAxis, additionalSize);
        ticksElement = this._renderTicks(size, tickCount, isNotDividedXAxis, additionalSize);
        dom.append(tickContainer, tickLineElement);
        dom.append(tickContainer, ticksElement);

        this.ticksElement = ticksElement;

        return tickContainer;
    },

    /**
     * Make cssText of vertical label.
     * @param {number} axisWidth axis width
     * @param {number} titleAreaWidth title area width
     * @returns {string} cssText
     * @private
     */
    _makeVerticalLabelCssText: function(axisWidth, titleAreaWidth) {
        return ';width:' + (axisWidth - titleAreaWidth + chartConst.V_LABEL_RIGHT_PADDING) + 'px';
    },

    /**
     * Apply css style of label area.
     * @param {HTMLElement} labelContainer label container
     * @param {number} axisWidth axis width
     * @private
     */
    _applyLabelAreaStyle: function(labelContainer, axisWidth) {
        var cssText = renderUtil.makeFontCssText(this.theme.label),
            titleAreaWidth;

        if (this.isVertical) {
            titleAreaWidth = this._getRenderedTitleHeight() + chartConst.TITLE_AREA_WIDTH_PADDING;
            cssText += this._makeVerticalLabelCssText(axisWidth, titleAreaWidth);
        }

        labelContainer.style.cssText = cssText;
    },

    /**
     * Render label area.
     * @param {number} size label area size
     * @param {number} axisWidth axis area width
     * @param {number} tickCount tick count
     * @param {Array.<string>} categories categories
     * @param {?number} additionalSize additional size (width or height)
     * @returns {HTMLElement} label area element
     * @private
     */
    _renderLabelArea: function(size, axisWidth, tickCount, categories, additionalSize) {
        var labelContainer = dom.create('DIV', 'tui-chart-label-area');
        var sizeRatio = this.data.sizeRatio || 1;
        var tickPixelPositions = calculator.makeTickPixelPositions((size * sizeRatio), tickCount);
        var labelSize = tickPixelPositions[1] - tickPixelPositions[0];
        var options = this.options;
        var containerWidth = this.containerWidth || size;
        var labelsHtml;

        if (predicate.isValidLabelInterval(options.labelInterval, options.tickInterval)) {
            labelSize *= options.labelInterval;
        }

        additionalSize = additionalSize ? calculator.makePercentageValue(additionalSize, containerWidth) : 0;
        labelsHtml = this._makeLabelsHtml(size, tickPixelPositions, categories, labelSize, additionalSize);
        labelContainer.innerHTML = labelsHtml;

        this._applyLabelAreaStyle(labelContainer, axisWidth);
        this._changeLabelAreaPosition(labelContainer, labelSize);

        this.labelContainer = labelContainer;

        return labelContainer;
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
     * Make cssText of label.
     * @param {number} labelSize label size (width or height)
     * @returns {string[]} cssTexts
     * @private
     */
    _makeLabelCssText: function(labelSize) {
        var isVertical = this.isVertical;
        var cssTexts = [];

        if (isVertical && this.isLabel) {
            cssTexts.push(renderUtil.concatStr('height:', labelSize, 'px'));
            cssTexts.push(renderUtil.concatStr('line-height:', labelSize, 'px'));
        } else if (!isVertical) {
            cssTexts.push(renderUtil.concatStr('width:', labelSize, 'px'));
        }

        return cssTexts.length ? cssTexts.join(';') + ';' : '';
    },

    /**
     * Calculate rotation moving position.
     * @param {object} params parameters
     *      @param {number} params.labelHeight label height
     *      @param {number} params.left normal left
     *      @param {number} params.moveLeft move left
     *      @param {number} params.top top
     * @returns {{top:number, left: number}} position
     * @private
     */
    _calculateRotationMovingPosition: function(params) {
        var moveLeft = params.moveLeft;
        var degree = this.boundsMaker.xAxisDegree;
        var containerWidth = this.containerWidth || params.size;

        if (degree === chartConst.ANGLE_85) {
            moveLeft += calculator.calculateAdjacent(chartConst.ANGLE_90 - degree, params.labelHeight / 2);
        }

        return {
            top: params.top,
            left: params.left - calculator.makePercentageValue(moveLeft, containerWidth)
        };
    },

    /**
     * Calculate rotation moving position for old browser(IE7, IE8).
     * @param {object} params parameters
     *      @param {number} params.labelWidth label width
     *      @param {number} params.labelHeight label height
     *      @param {number} params.left normal left
     *      @param {(string | number)} params.label label
     *      @param {object} theme label theme
     * @returns {{top:number, left: number}} position
     * @private
     */
    _calculateRotationMovingPositionForOldBrowser: function(params) {
        var labelWidth = renderUtil.getRenderedLabelWidth(params.label, params.theme);
        var degree = this.boundsMaker.xAxisDegree;
        var smallAreaWidth = calculator.calculateAdjacent(chartConst.ANGLE_90 - degree, params.labelHeight / 2);
        var newLabelWidth = (calculator.calculateAdjacent(degree, labelWidth / 2) + smallAreaWidth) * 2;
        var changedWidth = renderUtil.isIE7() ? 0 : (labelWidth - newLabelWidth);
        var moveLeft = (params.labelWidth / 2) - (smallAreaWidth * 2);
        var containerWidth = this.containerWidth || params.size;

        if (degree === chartConst.ANGLE_85) {
            moveLeft += smallAreaWidth;
        }

        return {
            top: chartConst.XAXIS_LABEL_TOP_MARGIN,
            left: params.left + calculator.makePercentageValue(changedWidth - moveLeft, containerWidth)
        };
    },

    /**
     * Make cssText for rotation moving.
     * @param {object} params parameters
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

        if (renderUtil.isOldBrowser()) {
            position = this._calculateRotationMovingPositionForOldBrowser(params);
        } else {
            position = this._calculateRotationMovingPosition(params);
        }

        return renderUtil.concatStr('left:', position.left, '%', ';top:', position.top, 'px');
    },

    /**
     * Make html of rotation labels.
     * @param {number} areaSize - area size.
     * @param {Array.<object>} positions label position array
     * @param {string[]} categories categories
     * @param {number} labelSize label size
     * @param {number} additionalSize additional size
     * @returns {string} labels html
     * @private
     */
    _makeRotationLabelsHtml: function(areaSize, positions, categories, labelSize, additionalSize) {
        var self = this;
        var degree = this.boundsMaker.xAxisDegree;
        var template = axisTemplate.tplAxisLabel;
        var labelHeight = renderUtil.getRenderedLabelHeight(categories[0], this.theme.label);
        var labelCssText = this._makeLabelCssText(labelSize);
        var additionalClass = ' tui-chart-xaxis-rotation tui-chart-xaxis-rotation' + degree;
        var halfWidth = labelSize / 2;
        var moveLeft = calculator.calculateAdjacent(degree, halfWidth);
        var top = calculator.calculateOpposite(degree, halfWidth) + chartConst.XAXIS_LABEL_TOP_MARGIN;
        var spanCssText = (renderUtil.isIE7() && degree) ? chartConst.IE7_ROTATION_FILTER_STYLE_MAP[degree] : '';
        var labelsHtml;

        additionalSize = additionalSize || 0;
        labelsHtml = tui.util.map(positions, function(position, index) {
            var label = categories[index],
                rotationCssText = self._makeCssTextForRotationMoving({
                    size: areaSize,
                    labelHeight: labelHeight,
                    labelWidth: labelSize,
                    top: top,
                    left: position + additionalSize,
                    moveLeft: moveLeft,
                    label: label,
                    theme: self.theme.label
                });

            return template({
                additionalClass: additionalClass,
                cssText: labelCssText + rotationCssText,
                spanCssText: spanCssText,
                label: label
            });
        }).join('');

        return labelsHtml;
    },

    /**
     * Make html of normal labels.
     * @param {Array.<object>} positions label position array
     * @param {string[]} categories categories
     * @param {number} labelSize label size
     * @param {number} additionalSize additional size
     * @returns {string} labels html
     * @private
     */
    _makeNormalLabelsHtml: function(positions, categories, labelSize, additionalSize) {
        var template = axisTemplate.tplAxisLabel,
            labelCssText = this._makeLabelCssText(labelSize),
            posType, labelsHtml;

        if (this.isVertical) {
            posType = this.isLabel ? 'top' : 'bottom';
        } else {
            posType = 'left';
        }

        labelsHtml = tui.util.map(positions, function(position, index) {
            var addCssText = renderUtil.concatStr(posType, ':', (position + additionalSize), '%');

            return template({
                additionalClass: '',
                cssText: labelCssText + addCssText,
                label: categories[index],
                spanCssText: ''
            });
        }).join('');

        return labelsHtml;
    },

    /**
     * Make labels html.
     * @param {number} areaSize - area size
     * @param {Array.<object>} positions - positions for labels
     * @param {Array.<string>} categories - categories
     * @param {number} labelSize label size
     * @param {number} additionalSize additional size
     * @returns {string} labels html
     * @private
     */
    _makeLabelsHtml: function(areaSize, positions, categories, labelSize, additionalSize) {
        var isRotationlessXAxis = !this.isVertical && this.isLabel && this.options.rotateLabel === false;
        var hasRotatedXAxisLabel = this.componentName === 'xAxis' && this.boundsMaker.xAxisDegree;
        var labelsHtml;

        if (isRotationlessXAxis) {
            categories = this.dataProcessor.getMultilineCategories();
        }

        if (categories.length) {
            positions.length = categories.length;
        }

        positions = this._makePercentagePositions(positions, areaSize);

        if (hasRotatedXAxisLabel) {
            labelsHtml = this._makeRotationLabelsHtml(areaSize, positions, categories, labelSize, additionalSize);
        } else {
            labelsHtml = this._makeNormalLabelsHtml(positions, categories, labelSize, additionalSize);
        }

        return labelsHtml;
    },

    /**
     * Change position of label area.
     * @param {HTMLElement} labelContainer label area element
     * @param {number} labelSize label size (width or height)
     * @private
     */
    _changeLabelAreaPosition: function(labelContainer, labelSize) {
        var labelHeight;

        if (this.isLabel && !this.data.aligned) {
            return;
        }

        if (this.isVertical) {
            labelHeight = renderUtil.getRenderedLabelHeight('ABC', this.theme.label);
            labelContainer.style.top = renderUtil.concatStr(parseInt(labelHeight / 2, 10), 'px');
        } else {
            labelContainer.style.left = renderUtil.concatStr('-', parseInt(labelSize / 2, 10), 'px');
        }
    }
});

module.exports = Axis;

},{"../const":31,"../helpers/calculator":57,"../helpers/domHandler":59,"../helpers/predicate":61,"../helpers/renderUtil":63,"./axisTemplate":2}],2:[function(require,module,exports){
/**
 * @fileoverview This is templates or axis view.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var templateMaker = require('../helpers/templateMaker');

var htmls = {
    HTML_AXIS_TICK_LINE: '<div class="tui-chart-tick-line"' +
        ' style="{{ positionType }}:{{ positionValue }}px;{{ sizeType }}:{{ size }}px"></div>',
    HTML_AXIS_TICK: '<div class="tui-chart-tick" style="{{ cssText }}"></div>',
    HTML_AXIS_LABEL: '<div class="tui-chart-label{{ additionalClass }}" style="{{ cssText }}">' +
        '<span{{ spanCssText }}>{{ label }}</span></div>'
};

module.exports = {
    tplTickLine: templateMaker.template(htmls.HTML_AXIS_TICK_LINE),
    tplAxisTick: templateMaker.template(htmls.HTML_AXIS_TICK),
    tplAxisLabel: templateMaker.template(htmls.HTML_AXIS_LABEL)
};

},{"../helpers/templateMaker":64}],3:[function(require,module,exports){
/**
 * @fileoverview chart.js is entry point of Toast UI Chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('./const');
var chartFactory = require('./factories/chartFactory');
var pluginFactory = require('./factories/pluginFactory');
var themeFactory = require('./factories/themeFactory');
var mapFactory = require('./factories/mapFactory');

var _createChart;

require('./polyfill');
require('./code-snippet-util');
require('./registerCharts');
require('./registerThemes');

/**
 * Raw series datum.
 * @typedef {{name: ?string, data: Array.<number>, stack: ?string}} rawSeriesDatum
 */

/**
 * Raw series data.
 * @typedef {Array.<rawSeriesDatum>} rawSeriesData
 */

/**
 * Raw data.
 * @typedef {{
 *      categories: ?Array.<string>,
 *      series: (rawSeriesData|{line: ?rawSeriesData, column: ?rawSeriesData})
 * }} rawData
 */

/**
 * NHN Entertainment Toast UI Chart.
 * @namespace tui.chart
 */
tui.util.defineNamespace('tui.chart');

/**
 * Create chart.
 * @param {HTMLElement} container container
 * @param {rawData} rawData - raw data
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
 *     title: string,
 *     min: number
 *   },
 *   tooltip: {
 *     suffix: string,
 *     template: function
 *   },
 *   theme: string
 * }} options - chart options
 * @returns {object} chart instance.
 * @private
 * @ignore
 */
_createChart = function(container, rawData, options) {
    var themeName, theme, chart;

    rawData = JSON.parse(JSON.stringify(rawData));
    options = options ? tui.util.deepCopy(options) : {};
    themeName = options.theme || chartConst.DEFAULT_THEME_NAME;
    theme = themeFactory.get(themeName);

    chart = chartFactory.get(options.chartType, rawData, theme, options);
    container.appendChild(chart.render());
    chart.animateChart();

    return chart;
};

/**
 * Bar chart creator.
 * @memberOf tui.chart
 * @param {HTMLElement} container - chart container
 * @param {rawData} rawData - raw data
 *      @param {Array.<string>} rawData.categories - categories
 *      @param {Array.<Array>} rawData.series - series data
 * @param {object} options - chart options
 *      @param {object} options.chart - base options for chart
 *          @param {number} options.chart.width - chart width
 *          @param {number} options.chart.height - chart height
 *          @param {string} options.chart.title - chart title
 *          @param {string | function} options.chart.format - formatter for value
 *      @param {object} options.yAxis - options for y axis component
 *          @param {string} options.yAxis.title - title for y axis
 *          @param {string} options.yAxis.align - align option for center y axis
 *          @param {boolean} options.yAxis.rotateTitle - whether rotate title or not (default: true)
 *      @param {object} options.xAxis - options for x axis component
 *          @param {string} options.xAxis.title - title for x axis
 *          @param {number} options.xAxis.min - minimum value for x axis
 *          @param {number} options.xAxis.max - maximum value for x axis
 *      @param {object} options.series - options for series component
 *          @param {string} options.series.stackType - type of stack
 *          @param {boolean} options.series.showLabel - whether show label or not
 *          @param {number} options.series.barWidth - bar width
 *          @param {boolean} options.series.allowSelect - whether allow select or not
 *          @param {boolean} options.series.diverging - whether diverging or not
 *      @param {object} options.tooltip - options for tooltip component
 *          @param {string} options.tooltip.suffix - suffix for tooltip
 *          @param {function} [options.tooltip.template] - template for tooltip
 *          @param {string} options.tooltip.align - align option for tooltip
 *          @param {object} options.tooltip.position - relative position
 *              @param {number} options.tooltip.position.left - position left
 *              @param {number} options.tooltip.position.top - position top
 *          @param {boolean} options.tooltip.grouped - whether group tooltip or not
 *      @param {object} options.legend - options for legend component
 *          @param {string} options.legend.align - align option for legend (top|bottom|left)
 *          @param {boolean} options.legend.showCheckbox - whether show checkbox or not (default: true)
 *          @param {boolean} options.legend.visible - whether visible or not (default: true)
 *      @param {object} options.plot - options for plot component
 *          @param {boolean} options.plot.showLine - whether show line or not (default: true)
 *      @param {string} options.theme - theme name
 *      @param {string} options.libType - type of graph library
 * @returns {object} bar chart
 * @api
 * @example
 * var container = document.getElementById('container-id'),
 *     rawData = {
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
 * tui.chart.barChart(container, rawData, options);
 */
tui.chart.barChart = function(container, rawData, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_BAR;
    return _createChart(container, rawData, options);
};

/**
 * Column chart creator.
 * @memberOf tui.chart
 * @param {HTMLElement} container - chart container
 * @param {rawData} rawData - raw data
 *      @param {Array.<string>} rawData.categories - categories
 *      @param {Array.<Array>} rawData.series - series data
 * @param {object} options - chart options
 *      @param {object} options.chart - base options for chart
 *          @param {number} options.chart.width - chart width
 *          @param {number} options.chart.height - chart height
 *          @param {string} options.chart.title - chart title
 *          @param {string | function} options.chart.format - formatter for value
 *      @param {object} options.yAxis - options for y axis component
 *          @param {string} options.yAxis.title - title for y axis
 *          @param {number} options.yAxis.min - minimum value for y axis
 *          @param {number} options.yAxis.max - maximum value for y axis
 *          @param {boolean} options.yAxis.rotateTitle - whether rotate title or not (default: true)
 *      @param {object} options.xAxis - options for x axis component
 *          @param {string} options.xAxis.title - title for x axis
 *          @param {number} options.xAxis.labelInterval - label interval for x axis
 *          @param {boolean} options.xAxis.rotateLabel - whether rotate label or not (default: true)
 *      @param {object} options.series - options for series component
 *          @param {string} options.series.stackType - type of stack
 *          @param {boolean} options.series.showLabel - whether show label or not
 *          @param {number} options.series.barWidth - bar width
 *          @param {boolean} options.series.allowSelect - whether allow select or not
 *          @param {boolean} options.series.diverging - whether diverging or not
 *      @param {object} options.tooltip - options for tooltip component
 *          @param {string} options.tooltip.suffix - suffix for tooltip
 *          @param {function} [options.tooltip.template] - template for tooltip
 *          @param {string} options.tooltip.align - align option for tooltip
 *          @param {object} options.tooltip.position - relative position
 *              @param {number} options.tooltip.position.left - position left
 *              @param {number} options.tooltip.position.top - position top
 *          @param {boolean} options.tooltip.grouped - whether group tooltip or not
 *      @param {object} options.legend - options for legend component
 *          @param {string} options.legend.align - align option for legend (top|bottom|left)
 *          @param {boolean} options.legend.showCheckbox - whether show checkbox or not (default: true)
 *          @param {boolean} options.legend.visible - whether visible or not (default: true)
 *      @param {object} options.plot - options for plot component
 *          @param {boolean} options.plot.showLine - whether show line or not (default: true)
 *      @param {string} options.theme - theme name
 *      @param {string} options.libType - type of graph library
 * @returns {object} column chart
 * @api
 * @example
 * var container = document.getElementById('container-id'),
 *     rawData = {
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
 * tui.chart.columnChart(container, rawData, options);
 */
tui.chart.columnChart = function(container, rawData, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_COLUMN;
    return _createChart(container, rawData, options);
};

/**
 * Line chart creator.
 * @memberOf tui.chart
 * @param {HTMLElement} container - chart container
 * @param {rawData} rawData - raw data
 *      @param {Array.<string>} rawData.categories - categories
 *      @param {Array.<Array>} rawData.series - series data
 * @param {object} options - chart options
 *      @param {object} options.chart - base options for chart
 *          @param {number} options.chart.width - chart width
 *          @param {number} options.chart.height - chart height
 *          @param {string} options.chart.title - chart title
 *          @param {string | function} options.chart.format - formatter for value
 *      @param {object} options.yAxis - options for y axis component
 *          @param {string} options.yAxis.title - title for y axis
 *          @param {number} options.yAxis.min - minimum value for y axis
 *          @param {number} options.yAxis.max - maximum value for y axis
 *          @param {boolean} options.yAxis.rotateTitle - whether rotate title or not (default: true)
 *      @param {object} options.xAxis - options for x axis component
 *          @param {string} options.xAxis.title - title for x axis
 *          @param {number} options.xAxis.labelInterval - label interval for x axis
 *          @param {string} options.xAxis.tickInterval - tick interval for x axis
 *          @param {boolean} options.xAxis.rotateLabel - whether rotate label or not (default: true)
 *      @param {object} options.series - options for series component
 *          @param {boolean} options.series.showDot - whether show dot or not
 *          @param {boolean} options.series.showLabel - whether show label or not
 *          @param {boolean} options.series.allowSelect - whether allow select or not
 *          @param {boolean} options.series.spline - whether spline or not
 *          @param {boolean} options.series.zoomable - whether zoomable or not
 *          @param {boolean} options.series.shifting - whether shifting or not
 *      @param {object} options.tooltip - options for tooltip component
 *          @param {string} options.tooltip.suffix - suffix for tooltip
 *          @param {function} [options.tooltip.template] - template for tooltip
 *          @param {string} options.tooltip.align - align option for tooltip
 *          @param {object} options.tooltip.position - relative position
 *              @param {number} options.tooltip.position.left - position left
 *              @param {number} options.tooltip.position.top - position top
 *          @param {boolean} options.tooltip.grouped - whether group tooltip or not
 *      @param {object} options.legend - options for legend component
 *          @param {string} options.legend.align - align option for legend (top|bottom|left)
 *          @param {boolean} options.legend.showCheckbox - whether show checkbox or not (default: true)
 *          @param {boolean} options.legend.visible - whether visible or not (default: true)
 *      @param {object} options.plot - options for plot component
 *          @param {boolean} options.plot.showLine - whether show line or not (default: true)
 *      @param {string} options.theme - theme name
 *      @param {string} options.libType - type of graph library
 * @returns {object} bar chart
 * @api
 * @example
 * var container = document.getElementById('container-id'),
 *     rawData = {
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
 *         showDot: true
 *       }
 *     };
 * tui.chart.lineChart(container, rawData, options);
 */
tui.chart.lineChart = function(container, rawData, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_LINE;
    return _createChart(container, rawData, options);
};

/**
 * Area chart creator.
 * @memberOf tui.chart
 * @param {HTMLElement} container - chart container
 * @param {rawData} rawData - raw data
 *      @param {Array.<string>} rawData.categories - categories
 *      @param {Array.<Array>} rawData.series - series data
 * @param {object} options - chart options
 *      @param {object} options.chart - base options for chart
 *          @param {number} options.chart.width - chart width
 *          @param {number} options.chart.height - chart height
 *          @param {string} options.chart.title - chart title
 *          @param {string | function} options.chart.format - formatter for value
 *      @param {object} options.yAxis - options for y axis component
 *          @param {string} options.yAxis.title - title for y axis
 *          @param {number} options.yAxis.min - minimum value for y axis
 *          @param {number} options.yAxis.max - maximum value for y axis
 *          @param {boolean} options.yAxis.rotateTitle - whether rotate title or not (default: true)
 *      @param {object} options.xAxis - options for x axis component
 *          @param {string} options.xAxis.title - title for x axis
 *          @param {number} options.xAxis.labelInterval - label interval for x axis
 *          @param {boolean} options.xAxis.rotateLabel - whether rotate label or not (default: true)
 *          @param {string} options.xAxis.tickInterval - tick interval for x axis
 *      @param {object} options.series - options for series component
 *          @param {boolean} options.series.showDot - whether show dot or not
 *          @param {boolean} options.series.showLabel - whether show label or not
 *          @param {boolean} options.series.allowSelect - whether allow select or not
 *          @param {boolean} options.series.spline - whether spline or not
 *          @param {boolean} options.series.zoomable - whether zoomable or not
 *          @param {boolean} options.series.shifting - whether shifting or not
 *      @param {object} options.tooltip - options for tooltip component
 *          @param {string} options.tooltip.suffix - suffix for tooltip
 *          @param {function} [options.tooltip.template] - template for tooltip
 *          @param {string} options.tooltip.align - align option for tooltip
 *          @param {object} options.tooltip.position - relative position
 *              @param {number} options.tooltip.position.left - position left
 *              @param {number} options.tooltip.position.top - position top
 *          @param {boolean} options.tooltip.grouped - whether group tooltip or not
 *      @param {object} options.legend - options for legend component
 *          @param {string} options.legend.align - align option for legend (top|bottom|left)
 *          @param {boolean} options.legend.showCheckbox - whether show checkbox or not (default: true)
 *          @param {boolean} options.legend.visible - whether visible or not (default: true)
 *      @param {object} options.plot - options for plot component
 *          @param {boolean} options.plot.showLine - whether show line or not (default: true)
 *      @param {string} options.theme - theme name
 *      @param {string} options.libType - type of graph library
 * @returns {object} bar chart
 * @api
 * @example
 * var container = document.getElementById('container-id'),
 *     rawData = {
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
 * tui.chart.areaChart(container, rawData, options);
 */
tui.chart.areaChart = function(container, rawData, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_AREA;
    return _createChart(container, rawData, options);
};

/**
 * Bubble chart creator.
 * @memberOf tui.chart
 * @param {HTMLElement} container - chart container
 * @param {rawData} rawData - raw data
 *      @param {Array.<string>} rawData.categories - categories
 *      @param {Array.<Array>} rawData.series - series data
 * @param {object} options - chart options
 *      @param {object} options.chart - base options for chart
 *          @param {number} options.chart.width - chart width
 *          @param {number} options.chart.height - chart height
 *          @param {string} options.chart.title - chart title
 *          @param {string | function} options.chart.format - formatter for value
 *      @param {object} options.yAxis - options for y axis component
 *          @param {string} options.yAxis.title - title for y axis
 *          @param {number} options.yAxis.min - minimum value for y axis
 *          @param {number} options.yAxis.max - maximum value for y axis
 *          @param {boolean} options.yAxis.rotateTitle - whether rotate title or not (default: true)
 *      @param {object} options.xAxis - options for x axis component
 *          @param {string} options.xAxis.title - title for x axis
 *          @param {number} options.xAxis.labelInterval - label interval for x axis
 *          @param {boolean} options.xAxis.rotateLabel - whether rotate label or not (default: true)
 *          @param {number} options.xAxis.min - minimum value for y axis
 *          @param {number} options.xAxis.max - maximum value for y axis
 *      @param {object} options.series - options for series component
 *          @param {boolean} options.series.showLabel - whether show label or not
 *          @param {boolean} options.series.allowSelect - whether allow select or not
 *      @param {object} options.tooltip - options for tooltip component
 *          @param {string} options.tooltip.suffix - suffix for tooltip
 *          @param {function} [options.tooltip.template] - template for tooltip
 *          @param {string} options.tooltip.align - align option for tooltip
 *          @param {object} options.tooltip.position - relative position
 *              @param {number} options.tooltip.position.left - position left
 *              @param {number} options.tooltip.position.top - position top
 *      @param {object} options.legend - options for legend component
 *          @param {string} options.legend.align - align option for legend (top|bottom|left)
 *          @param {boolean} options.legend.showCheckbox - whether show checkbox or not (default: true)
 *          @param {boolean} options.legend.visible - whether visible or not (default: true)
 *      @param {object} options.circleLegend - options for circleLegend
 *          @param {boolean} options.circleLegend.visible - whether visible or not (default: true)
 *      @param {object} options.plot - options for plot component
 *          @param {boolean} options.plot.showLine - whether show line or not (default: true)
 *      @param {string} options.theme - theme name
 *      @param {string} options.libType - type of graph library
 * @returns {object} bubble chart
 * @api
 * @example
 * var container = document.getElementById('container-id'),
 *     rawData = {
 *       series: [
 *         {
 *           name: 'Legend1',
 *           data: [{
 *              x: 10,
 *              y: 20,
 *              r: 15,
 *              label: 'Lable1'
 *           }, {
 *              x: 20,
 *              y: 40,
 *              r: 10,
 *              label: 'Lable2'
 *           }]
 *         },
 *         {
 *           name: 'Legend2',
 *           data: [{
 *              x: 40,
 *              y: 10,
 *              r: 5,
 *              label: 'Lable3'
 *           }, {
 *              x: 30,
 *              y: 40,
 *              r: 8,
 *              label: 'Lable4'
 *           }]
 *         }
 *       ]
 *     },
 *     options = {
 *       chart: {
 *         title: 'Bubble Chart'
 *       },
 *       yAxis: {
 *         title: 'Y Axis'
 *       },
 *       xAxis: {
 *         title: 'X Axis'
 *       }
 *     };
 * tui.chart.bubbleChart(container, rawData, options);
 */
tui.chart.bubbleChart = function(container, rawData, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_BUBBLE;
    return _createChart(container, rawData, options);
};

/**
 * Scatter chart creator.
 * @memberOf tui.chart
 * @param {HTMLElement} container - chart container
 * @param {rawData} rawData - raw data
 *      @param {Array.<string>} rawData.categories - categories
 *      @param {Array.<Array>} rawData.series - series data
 * @param {object} options - chart options
 *      @param {object} options.chart - base options for chart
 *          @param {number} options.chart.width - chart width
 *          @param {number} options.chart.height - chart height
 *          @param {string} options.chart.title - chart title
 *          @param {string | function} options.chart.format - formatter for value
 *      @param {object} options.yAxis - options for y axis component
 *          @param {string} options.yAxis.title - title for y axis
 *          @param {number} options.yAxis.min - minimum value for y axis
 *          @param {number} options.yAxis.max - maximum value for y axis
 *          @param {boolean} options.yAxis.rotateTitle - whether rotate title or not (default: true)
 *      @param {object} options.xAxis - options for x axis component
 *          @param {string} options.xAxis.title - title for x axis
 *          @param {number} options.xAxis.min - minimum value for y axis
 *          @param {number} options.xAxis.max - maximum value for y axis
 *      @param {object} options.series - options for series component
 *          @param {boolean} options.series.showLabel - whether show label or not
 *          @param {boolean} options.series.allowSelect - whether allow select or not
 *      @param {object} options.tooltip - options for tooltip component
 *          @param {string} options.tooltip.suffix - suffix for tooltip
 *          @param {function} [options.tooltip.template] - template for tooltip
 *          @param {string} options.tooltip.align - align option for tooltip
 *          @param {object} options.tooltip.position - relative position
 *              @param {number} options.tooltip.position.left - position left
 *              @param {number} options.tooltip.position.top - position top
 *      @param {object} options.legend - options for legend component
 *          @param {string} options.legend.align - align option for legend (top|bottom|left)
 *          @param {boolean} options.legend.showCheckbox - whether show checkbox or not (default: true)
 *          @param {boolean} options.legend.visible - whether visible or not (default: true)
 *      @param {object} options.plot - options for plot component
 *          @param {boolean} options.plot.showLine - whether show line or not (default: true)
 *      @param {string} options.theme - theme name
 *      @param {string} options.libType - type of graph library
 * @returns {object} scatter chart
 * @api
 * @example
 * var container = document.getElementById('container-id'),
 *     rawData = {
 *       series: [
 *         {
 *           name: 'Legend1',
 *           data: [{
 *              x: 10,
 *              y: 20
 *           }, {
 *              x: 20,
 *              y: 40
 *           }]
 *         },
 *         {
 *           name: 'Legend2',
 *           data: [{
 *              x: 40,
 *              y: 10
 *           }, {
 *              x: 30,
 *              y: 40
 *           }]
 *         }
 *       ]
 *     },
 *     options = {
 *       chart: {
 *         title: 'Scatter Chart'
 *       },
 *       yAxis: {
 *         title: 'Y Axis'
 *       },
 *       xAxis: {
 *         title: 'X Axis'
 *       }
 *     };
 * tui.chart.scatterChart(container, rawData, options);
 */
tui.chart.scatterChart = function(container, rawData, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_SCATTER;
    return _createChart(container, rawData, options);
};

/**
 * Heatmap chart creator.
 * @memberOf tui.chart
 * @param {HTMLElement} container - chart container
 * @param {rawData} rawData - raw data
 *      @param {{x: Array.<string | number>, y: Array.<string | number>}} rawData.categories - categories
 *      @param {Array.<Array.<number>>} rawData.series - series data
 * @param {object} options - chart options
 *      @param {object} options.chart - base options for chart
 *          @param {number} options.chart.width - chart width
 *          @param {number} options.chart.height - chart height
 *          @param {string} options.chart.title - chart title
 *          @param {string | function} options.chart.format - formatter for value
 *      @param {object} options.yAxis - options for y axis component
 *          @param {string} options.yAxis.title - title for y axis
 *          @param {boolean} options.yAxis.rotateTitle - whether rotate title or not (default: true)
 *      @param {object} options.xAxis - options for x axis component
 *          @param {string} options.xAxis.title - title for x axis
 *      @param {object} options.series - options for series component
 *          @param {boolean} options.series.showLabel - whether show label or not
 *      @param {object} options.tooltip - options for tooltip component
 *          @param {string} options.tooltip.suffix - suffix for tooltip
 *          @param {function} [options.tooltip.template] - template for tooltip
 *          @param {string} options.tooltip.align - align option for tooltip
 *          @param {object} options.tooltip.position - relative position
 *              @param {number} options.tooltip.position.left - position left
 *              @param {number} options.tooltip.position.top - position top
 *      @param {object} options.legend - options for legend component
 *          @param {string} options.legend.align - align option for legend (top|bottom|left)
 *          @param {boolean} options.legend.visible - whether visible or not (default: true)
 *      @param {string} options.theme - theme name
 *      @param {string} options.libType - type of graph library
 * @returns {object} scatter chart
 * @api
 * @example
 * var container = document.getElementById('container-id'),
 *     rawData = {
 *       categories: {
 *           x: [10, 20, 30, 40, 50],
 *           y: [1, 2, 3, 4, 5, 6]
 *       },
 *       series: [
 *           [10, 20, 30, 40, 50],
 *           [1, 4, 6, 7, 8],
 *           [20, 4, 5, 70, 8],
 *           [100, 40, 30, 80, 30],
 *           [20, 10, 60, 90, 20],
 *           [50, 40, 30, 20, 10]
 *       ]
 *     },
 *     options = {
 *       chart: {
 *         title: 'Heatmap Chart'
 *       },
 *       yAxis: {
 *         title: 'Y Axis'
 *       },
 *       xAxis: {
 *         title: 'X Axis'
 *       }
 *     };
 * tui.chart.heatmapChart(container, rawData, options);
 */
tui.chart.heatmapChart = function(container, rawData, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_HEATMAP;
    return _createChart(container, rawData, options);
};

/**
 * Treemap chart creator.
 * @memberOf tui.chart
 * @param {HTMLElement} container - chart container
 * @param {rawData} rawData - raw data
 *      @param {Array.<Array.<object>>} rawData.series - series data
 * @param {object} options - chart options
 *      @param {object} options.chart - base options for chart
 *          @param {number} options.chart.width - chart width
 *          @param {number} options.chart.height - chart height
 *          @param {string} options.chart.title - chart title
 *          @param {string | function} options.chart.format - formatter for value
 *      @param {object} options.series - options for series component
 *          @param {boolean} options.series.showLabel - whether show label or not
 *          @param {boolean} options.series.useColorValue - whether use colorValue or not
 *          @param {boolean} options.series.zoomable - whether zoomable or not
 *          @param {boolean} options.series.useLeafLabel - whether use leaf label or not
 *      @param {object} options.tooltip - options for tooltip component
 *          @param {string} options.tooltip.suffix - suffix for tooltip
 *          @param {function} [options.tooltip.template] - template for tooltip
 *          @param {object} options.tooltip.position - relative position
 *              @param {number} options.tooltip.position.left - position left
 *              @param {number} options.tooltip.position.top - position top
 *      @param {object} options.legend - options for legend component
 *          @param {string} options.legend.align - align option for legend (top|bottom|left)
 *          @param {boolean} options.legend.visible - whether visible or not (default: true)
 *      @param {string} options.theme - theme name
 *      @param {string} options.libType - type of graph library
 * @returns {object} scatter chart
 * @api
 * @example
 * var container = document.getElementById('container-id'),
 *     rawData = {
 *       series: [
 *          {
 *              label: 'label1',
 *              value: 6
 *          },
 *          {
 *              label: 'label2',
 *              value: 6
 *          },
 *          {
 *              label: 'label3',
 *              value: 4
 *          },
 *          {
 *              label: 'label4',
 *              value: 3
 *          },
 *          {
 *              label: 'label5',
 *              value: 2
 *          },
 *          {
 *              label: 'label6',
 *              value: 2
 *          },
 *          {
 *              label: 'label7',
 *              value: 1
 *          }
 *     ],
 *     options = {
 *       chart: {
 *         title: 'Treemap Chart'
 *       }
 *     };
 * tui.chart.treemapChart(container, rawData, options);
 */
tui.chart.treemapChart = function(container, rawData, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_TREEMAP;
    return _createChart(container, rawData, options);
};

/**
 * Combo chart creator.
 * @memberOf tui.chart
 * @param {HTMLElement} container - chart container
 * @param {rawData} rawData - raw data
 *      @param {Array.<string>} rawData.categories - categories
 *      @param {Array.<Array>} rawData.series - series data
 * @param {object} options - chart options
 *      @param {object} options.chart - base options for chart
 *          @param {number} options.chart.width - chart width
 *          @param {number} options.chart.height - chart height
 *          @param {string} options.chart.title - chart title
 *          @param {string | function} options.chart.format - formatter for value
 *      @param {object|Array} options.yAxis - options for y axis component
 *          @param {string} options.yAxis.title - title for y axis
 *          @param {number} options.yAxis.min - minimum value for y axis
 *          @param {number} options.yAxis.max - maximum value for y axis
 *          @param {boolean} options.yAxis.rotateTitle - whether rotate title or not (default: true)
 *      @param {object} options.xAxis - options for x axis component
 *          @param {string} options.xAxis.title - title for x axis
 *          @param {number} options.xAxis.labelInterval - label interval for x axis
 *          @param {boolean} options.xAxis.rotateLabel - whether rotate label or not (default: true)
 *      @param {object} options.series - options for series component
 *          @param {?object} options.series.column - options for column series component
 *              @param {string} options.series.column.stackType - type of stack
 *              @param {boolean} options.series.column.showLabel - whether show label or not
 *              @param {number} options.series.column.barWidth - bar width
 *              @param {boolean} options.series.column.allowSelect - whether allow select or not
 *          @param {?object} options.series.line - options for line series component
 *              @param {boolean} options.series.line.showDot - whether show dot or not
 *              @param {boolean} options.series.line.showLabel - whether show label or not
 *              @param {boolean} options.series.line.allowSelect - whether allow select or not
 *              @param {boolean} options.series.line.spline - whether spline or not
 *          @param {?object} options.series.area - options for line series component
 *              @param {boolean} options.series.area.showDot - whether show dot or not
 *              @param {boolean} options.series.area.showLabel - whether show label or not
 *              @param {boolean} options.series.area.allowSelect - whether allow select or not
 *              @param {boolean} options.series.area.spline - whether spline or not
 *          @param {?object} options.series.pie - options for pie series component
 *              @param {boolean} options.series.pie.showLabel - whether show label or not
 *              @param {number} options.series.pie.radiusRatio - ratio of radius for pie graph
 *              @param {boolean} options.series.pie.allowSelect - whether allow select or not
 *              @param {boolean} options.series.pie.startAngle - start angle
 *              @param {boolean} options.series.pie.endAngle - end angle
 *          @param {boolean} options.series.showDot - whether show dot or not
 *          @param {boolean} options.series.showLabel - whether show label or not
 *          @param {boolean} options.series.allowSelect - whether allow select or not
 *          @param {boolean} options.series.spline - whether spline or not
 *          @param {boolean} options.series.zoomable - whether zoomable or not
 *          @param {boolean} options.series.shifting - whether shifting or not
 *      @param {object} options.tooltip - options for tooltip component
 *          @param {object} options.tooltip.column - options for column tooltip
 *              @param {string} options.tooltip.column.suffix - suffix for tooltip
 *              @param {function} [options.tooltip.column.template] template of tooltip
 *              @param {string} options.tooltip.column.align - align option for tooltip
 *              @param {object} options.tooltip.column.position - relative position
 *                  @param {number} options.tooltip.column.position.left - position left
 *                  @param {number} options.tooltip.column.position.top - position top
 *          @param {boolean} options.tooltip.grouped - whether group tooltip or not
 *      @param {object} options.legend - options for legend component
 *          @param {string} options.legend.align - align option for legend (top|bottom|left)
 *          @param {boolean} options.legend.showCheckbox - whether show checkbox or not (default: true)
 *          @param {boolean} options.legend.visible - whether visible or not (default: true)
 *      @param {object} options.plot - options for plot component
 *          @param {boolean} options.plot.showLine - whether show line or not (default: true)
 *      @param {string} options.theme - theme name
 *      @param {string} options.libType - type of graph library
 * @returns {object} bar chart
 * @api
 * @example
 * var container = document.getElementById('container-id'),
 *     rawData = {
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
 *         showDot: true
 *       }
 *     };
 * tui.chart.comboChart(container, rawData, options);
 */
tui.chart.comboChart = function(container, rawData, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_COMBO;
    return _createChart(container, rawData, options);
};

/**
 * Pie chart creator.
 * @memberOf tui.chart
 * @param {HTMLElement} container - chart container
 * @param {rawData} rawData - raw data
 *      @param {Array.<Array>} rawData.series - series data
 * @param {object} options - chart options
 *      @param {object} options.chart - base options for chart
 *          @param {number} options.chart.width - chart width
 *          @param {number} options.chart.height - chart height
 *          @param {string} options.chart.title - chart title
 *          @param {string | function} options.chart.format - formatter for value
 *      @param {object} options.series - options for series component
 *          @param {boolean} options.series.showLabel - whether show label or not
 *          @param {number} options.series.radiusRatio - ratio of radius for pie graph
 *          @param {boolean} options.series.allowSelect - whether allow select or not
 *          @param {boolean} options.series.startAngle - start angle
 *          @param {boolean} options.series.endAngle - end angle
 *      @param {object} options.tooltip - options for tooltip component
 *          @param {string} options.tooltip.suffix - suffix for tooltip
 *          @param {function} [options.tooltip.template] - template for tooltip
 *          @param {string} options.tooltip.align - align option for tooltip
 *          @param {object} options.tooltip.position - relative position
 *              @param {number} options.tooltip.position.left - position left
 *              @param {number} options.tooltip.position.top - position top
 *      @param {object} options.legend - options for legend component
 *          @param {string} options.legend.align - align option for legend (top|bottom|left|center|outer)
 *          @param {boolean} options.legend.showCheckbox - whether show checkbox or not (default: true)
 *          @param {boolean} options.legend.visible - whether visible or not (default: true)
 *      @param {string} options.theme - theme name
 *      @param {string} options.libType - type of graph library
 * @returns {object} bar chart
 * @api
 * @example
 * var container = document.getElementById('container-id'),
 *     rawData = {
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
 * tui.chart.pieChart(container, rawData, options);
 */
tui.chart.pieChart = function(container, rawData, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_PIE;
    return _createChart(container, rawData, options);
};

/**
 * Map chart creator.
 * @memberOf tui.chart
 * @param {HTMLElement} container - chart container
 * @param {rawData} rawData chart data
 *      @param {Array.<Array>} rawData.series - series data
 * @param {object} options - chart options
 *      @param {object} options.chart - base options for chart
 *          @param {number} options.chart.width - chart width
 *          @param {number} options.chart.height - chart height
 *          @param {string} options.chart.title - chart title
 *          @param {string | function} options.chart.format - formatter for value
 *      @param {object} options.series - options for series component
 *          @param {boolean} options.series.showLabel - whether show label or not
 *      @param {object} options.tooltip - options for tooltip component
 *          @param {string} options.tooltip.suffix - suffix for tooltip
 *          @param {function} [options.tooltip.template] - template for tooltip
 *          @param {string} options.tooltip.align - align option for tooltip
 *          @param {object} options.tooltip.position - relative position
 *              @param {number} options.tooltip.position.left - position left
 *              @param {number} options.tooltip.position.top - position top
 *      @param {object} options.legend - options for legend component
 *          @param {string} options.legend.align - align option for legend (top|bottom|left|center|outer)
 *      @param {string} options.theme - theme name
 *      @param {string} options.map map type
 *      @param {string} options.libType - type of graph library
 * @returns {object} bar chart
 * @api
 * @example
 * var container = document.getElementById('container-id'),
 *     rawData = {
 *       series: [
 *         {
 *           code: 'KR',
 *           data: 100,
 *           labelCoordinate: {
 *             x: 0.6,
 *             y: 0.7
 *           }
 *         },
 *         {
 *           code: 'JP',
 *           data: 50
 *         }
 *       ]
 *     },
 *     options = {
 *       chart: {
 *         title: 'Map Chart'
 *       },
 *       map: 'world'
 *     };
 * tui.chart.mapChart(container, rawData, options);
 */
tui.chart.mapChart = function(container, rawData, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_MAP;
    options.map = mapFactory.get(options.map);

    return _createChart(container, rawData, options);
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
 *          @param {string} theme.yAxis.tickColor color of vertical axis tick
 *      @param {object} theme.xAxis theme of horizontal axis
 *          @param {object} theme.xAxis.title theme of horizontal axis title
 *              @param {number} theme.xAxis.title.fontSize font size of horizontal axis title
 *              @param {string} theme.xAxis.title.fontFamily font family of horizontal axis title
 *              @param {string} theme.xAxis.title.color font color of horizontal axis title
 *          @param {object} theme.xAxis.label theme of horizontal axis label
 *              @param {number} theme.xAxis.label.fontSize font size of horizontal axis label
 *              @param {string} theme.xAxis.label.fontFamily font family of horizontal axis label
 *              @param {string} theme.xAxis.label.color font color of horizontal axis label
 *          @param {string} theme.xAxis.tickColor color of horizontal axis tick
 *      @param {object} theme.plot plot theme
 *          @param {string} theme.plot.lineColor plot line color
 *          @param {string} theme.plot.background plot background
 *      @param {object} theme.series series theme
 *          @param {Array.<string>} theme.series.colors series colors
 *          @param {string} theme.series.borderColor series border color
 *          @param {string} theme.series.selectionColor series selection color
 *          @param {string} theme.series.startColor start color for map chart
 *          @param {string} theme.series.endColor end color for map chart
 *          @param {string} theme.series.overColor end color for map chart
 *      @param {object} theme.legend legend theme
 *          @param {object} theme.legend.label theme of legend label
 *              @param {number} theme.legend.label.fontSize font size of legend label
 *              @param {string} theme.legend.label.fontFamily font family of legend label
 *              @param {string} theme.legend.label.color font color of legend label
 * @api
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
 *       borderColor: '#8e6535',
 *       selectionColor: '#cccccc',
 *       startColor: '#efefef',
 *       endColor: 'blue',
 *       overColor: 'yellow'
 *     },
 *     legend: {
 *       label: {
 *         color: '#6f491d'
 *       }
 *     }
 *   };
 * tui.chart.registerTheme('newTheme', theme);
 */
tui.chart.registerTheme = function(themeName, theme) {
    themeFactory.register(themeName, theme);
};

/**
 * Register map.
 * @param {string} mapName map name
 * @param {Array.<{code: string, name: string, path: string}>} data map data
 * @api
 * @example
 * var data = [
 *   {
 *     code: 'KR',
 *     name: 'South Korea',
 *     path: 'M835.13,346.53L837.55,350.71...',
 *     labelCoordinate: {
 *       x: 0.6,
 *       y: 0.7
 *     }
 *   },
 *   //...
 * ];
 * tui.chart.registerMap('newMap', data);
 */
tui.chart.registerMap = function(mapName, data) {
    mapFactory.register(mapName, data);
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

},{"./code-snippet-util":30,"./const":31,"./factories/chartFactory":50,"./factories/mapFactory":51,"./factories/pluginFactory":52,"./factories/themeFactory":53,"./polyfill":86,"./registerCharts":87,"./registerThemes":88}],4:[function(require,module,exports){
'use strict';

var chartConst = require('../const');

/**
 * addingDynamicData is mixer for adding dynamic data.
 * @mixin
 */
var addingDynamicDataMixer = {
    /**
     * Initialize for adding data.
     * @private
     */
    _initForAddingData: function() {
        /**
         * whether lookupping or not
         * @type {boolean}
         */
        this.lookupping = false;

        /**
         * whether paused or not
         * @type {boolean}
         */
        this.paused = false;

        /**
         * rendering delay timer id
         * @type {null}
         */
        this.rerenderingDelayTimerId = null;

        /**
         * added data count
         * @type {number}
         */
        this.addedDataCount = 0;

        /**
         * checked legends.
         * @type {null | Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}}
         */
        this.checkedLegends = null;
    },

    /**
     * Animate for adding data.
     * @private
     */
    _animateForAddingData: function() {
        var self = this;
        var boundsMaker = this.boundsMaker;
        var shiftingOption = !!tui.util.pick(this.options.series, 'shifting');
        var beforeAxesData = boundsMaker.getAxesData();
        var beforeSizeRatio = beforeAxesData.xAxis.sizeRatio || 1;

        this.addedDataCount += 1;
        this.axisScaleMakerMap = null;
        boundsMaker.initBoundsData();

        this._render(function() {
            var xAxisWidth = boundsMaker.getDimension('xAxis').width * beforeSizeRatio;
            var tickSize = (xAxisWidth / (self.dataProcessor.getCategoryCount(false) - 1));

            self._renderComponents({
                tickSize: tickSize + chartConst.OVERLAPPING_WIDTH,
                shifting: shiftingOption
            }, 'animateForAddingData');
        }, beforeAxesData);

        if (shiftingOption) {
            this.dataProcessor.shiftData();
        }
    },

    /**
     * Rerender for adding data.
     * @private
     */
    _rerenderForAddingData: function() {
        var self = this;

        if (tui.util.pick(this.options.series, 'shifting')) {
            this.boundsMaker.initBoundsData();
        }

        this.axisScaleMakerMap = null;

        this._render(function(renderingData) {
            renderingData.animatable = false;
            self._renderComponents(renderingData, 'rerender');
        });
    },

    /**
     * Check for added data.
     * @private
     */
    _checkForAddedData: function() {
        var self = this;
        var added = this.dataProcessor.addDataFromDynamicData();

        if (!added) {
            this.lookupping = false;

            return;
        }

        if (this.paused) {
            return;
        }

        this._animateForAddingData();
        this.rerenderingDelayTimerId = setTimeout(function() {
            self.rerenderingDelayTimerId = null;
            self._rerenderForAddingData();
            self._checkForAddedData();
        }, 400);
    },

    /**
     * Pause animation for adding data.
     * @private
     */
    _pauseAnimationForAddingData: function() {
        this.paused = true;
        this._initForAutoTickInterval();

        if (this.rerenderingDelayTimerId) {
            clearTimeout(this.rerenderingDelayTimerId);
            this.rerenderingDelayTimerId = null;

            if (tui.util.pick(this.options.series, 'shifting')) {
                this.dataProcessor.shiftData();
            }
        }
    },

    /**
     * Restart animation for adding data.
     * @private
     */
    _restartAnimationForAddingData: function() {
        this.paused = false;
        this.lookupping = false;
        this._startLookup();
    },

    /**
     * Start lookup.
     * @private
     */
    _startLookup: function() {
        if (this.lookupping) {
            return;
        }

        this.lookupping = true;

        this._checkForAddedData();
    },

    /**
     * Add data.
     * @param {string} category - category
     * @param {Array} values - values
     */
    addData: function(category, values) {
        this.dataProcessor.addDynamicData(category, values);
        this._startLookup();
    },


    /**
     * Change checked legend.
     * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
     * @param {?object} rawData rawData
     * @param {?object} boundsParams addition params for calculating bounds
     * @override
     */
    _changeCheckedLegends: function(checkedLegends, rawData, boundsParams) {
        var self = this;
        var pastPaused = this.paused;

        if (!pastPaused) {
            this._pauseAnimationForAddingData();
        }

        this.checkedLegends = checkedLegends;
        this._rerender(checkedLegends, rawData, boundsParams);


        if (!pastPaused) {
            setTimeout(function() {
                self._restartAnimationForAddingData();
            }, chartConst.RERENDER_TIME);
        }
    }
};

module.exports = addingDynamicDataMixer;

},{"../const":31}],5:[function(require,module,exports){
/**
 * @fileoverview Area chart
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var lineTypeMixer = require('./lineTypeMixer');
var autoTickMixer = require('./autoTickMixer');
var zoomMixer = require('./zoomMixer');
var axisTypeMixer = require('./axisTypeMixer');
var addingDynamicDataMixer = require('./addingDynamicDataMixer');
var rawDataHandler = require('../helpers/rawDataHandler');
var Series = require('../series/areaChartSeries');

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
     * @param {Array.<Array>} rawData raw data
     * @param {object} theme chart theme
     * @param {object} options chart options
     * @mixes axisTypeMixer
     * @mixes lineTypeMixer
     */
    init: function(rawData, theme, options) {
        rawDataHandler.removeSeriesStack(rawData.series);
        this._lineTypeInit(rawData, theme, options);
        this._initForAutoTickInterval();
        this._initForAddingData();
    },

    /**
     * On change checked legend.
     * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
     * @param {?object} rawData rawData
     * @param {?object} boundsParams addition params for calculating bounds
     * @override
     */
    onChangeCheckedLegends: function(checkedLegends, rawData, boundsParams) {
        this._changeCheckedLegends(checkedLegends, rawData, boundsParams);
    }
});

tui.util.extend(AreaChart.prototype,
    axisTypeMixer, lineTypeMixer, autoTickMixer, zoomMixer, addingDynamicDataMixer);

module.exports = AreaChart;

},{"../helpers/rawDataHandler":62,"../series/areaChartSeries":89,"./addingDynamicDataMixer":4,"./autoTickMixer":6,"./axisTypeMixer":7,"./chartBase":11,"./lineTypeMixer":20,"./zoomMixer":29}],6:[function(require,module,exports){
/**
 * @fileoverview autoTickMixer is mixer for making auto tick.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var axisDataMaker = require('../helpers/axisDataMaker');

/**
 * autoTickMixer is mixer for making auto tick.
 * @mixin
 */
var autoTickMixer = {
    /**
     * Initialize for auto tick interval option.
     * @private
     */
    _initForAutoTickInterval: function() {
        /**
         * previous updated xAxisData
         * @type {null | object}
         */
        this.prevUpdatedData = null;

        /**
         * first updated tick count
         */
        this.firstTickCount = null;
    },

    /**
     * Update axesData.
     * @private
     * @override
     */
    _updateAxesData: function() {
        var boundsMaker = this.boundsMaker;
        var axesData = boundsMaker.getAxesData();
        var xAxisData = axesData.xAxis;
        var seriesWidth = boundsMaker.getDimension('series').width;
        var shiftingOption = tui.util.pick(this.options.series, 'shifting');
        var prevUpdatedData = this.prevUpdatedData;

        if (shiftingOption || !prevUpdatedData) {
            axisDataMaker.updateLabelAxisDataForAutoTickInterval(xAxisData, seriesWidth, this.addedDataCount);
        } else {
            axisDataMaker.updateLabelAxisDataForStackingDynamicData(xAxisData, prevUpdatedData, this.firstTickCount);
        }

        this.prevUpdatedData = xAxisData;

        if (!this.firstTickCount) {
            this.firstTickCount = xAxisData.tickCount;
        }

        boundsMaker.registerAxesData(axesData);
    }
};

module.exports = autoTickMixer;

},{"../helpers/axisDataMaker":54}],7:[function(require,module,exports){
/**
 * @fileoverview axisTypeMixer is mixer for help to axis types charts like bar, column, line, area,
 *                  bubble, column&line combo.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var axisDataMaker = require('../helpers/axisDataMaker');
var renderUtil = require('../helpers/renderUtil');
var predicate = require('../helpers/predicate');
var Axis = require('../axes/axis');
var Plot = require('../plots/plot');
var Legend = require('../legends/legend');
var GroupTypeCustomEvent = require('../customEvents/groupTypeCustomEvent');
var BoundsTypeCustomEvent = require('../customEvents/boundsTypeCustomEvent');
var Tooltip = require('../tooltips/tooltip');
var GroupTooltip = require('../tooltips/groupTooltip');

/**
 * Axis limit value.
 * @typedef {{min: number, max: number}} axisLimit
 */

/**
 * axisTypeMixer is mixer for help to axis types charts like bar, column, line, area, bubble, column&line combo.
 * @mixin
 */
var axisTypeMixer = {
    /**
     * Add axis components.
     * @param {Array.<object>} axes axes option
     * @param {boolean} aligned whether aligned or not
     * @private
     */
    _addAxisComponents: function(axes, aligned) {
        var self = this;
        tui.util.forEach(axes, function(axis) {
            var axisParams = {
                aligned: aligned,
                isLabel: !!axis.isLabel,
                isVertical: !!axis.isVertical,
                chartType: axis.chartType
            };

            if (axis.name === 'rightYAxis') {
                axisParams.componentType = 'yAxis';
                axisParams.index = 1;
            }

            self.componentManager.register(axis.name, Axis, axisParams);
        });
    },

    /**
     * Add series components
     * @param {Array<object>} serieses serieses
     * @param {object} options options
     * @param {boolean} aligned whether aligned or not
     * @private
     */
    _addSeriesComponents: function(serieses, options) {
        var self = this,
            seriesBaseParams = {
                libType: options.libType,
                chartType: options.chartType,
                userEvent: this.userEvent,
                componentType: 'series',
                chartBackground: this.theme.chart.background
            };

        tui.util.forEach(serieses, function(series) {
            var seriesParams = tui.util.extend(seriesBaseParams, series.data);
            self.componentManager.register(series.name, series.SeriesClass, seriesParams);
        });
    },

    /**
     * Add tooltip component.
     * @private
     */
    _addTooltipComponent: function() {
        var TooltipClass = this.hasGroupTooltip ? GroupTooltip : Tooltip;
        this.componentManager.register('tooltip', TooltipClass, this._makeTooltipData());
    },

    /**
     * Add legend component.
     * @param {null | object} LegendClass - Legend type class
     * @param {Array.<string>} seriesNames - series names
     * @param {string} chartType chartType
     * @private
     */
    _addLegendComponent: function(LegendClass, seriesNames, chartType) {
        this.componentManager.register('legend', LegendClass || Legend, {
            seriesNames: seriesNames,
            chartType: chartType,
            userEvent: this.userEvent
        });
    },

    /**
     * Add components for axis type chart.
     * @param {object} params parameters
     *      @param {object} params.axes axes data
     *      @param {object} params.plotData plot data
     *      @param {function} params.serieses serieses
     * @private
     */
    _addComponentsForAxisType: function(params) {
        var options = this.options;
        var aligned = !!params.aligned;
        var LegendClass;

        if (params.plot) {
            this.componentManager.register('plot', Plot);
        }

        this._addAxisComponents(params.axis, aligned);

        if (options.legend.visible) {
            LegendClass = tui.util.isObject(params.legend) ? params.legend.LegendClass : null;
            this._addLegendComponent(LegendClass, params.seriesNames, params.chartType);
        }

        this._addSeriesComponents(params.series, options);
        this._addTooltipComponent();
        this._addCustomEventComponent();
    },

    /**
     * Get limit map.
     * @param {{yAxis: object, xAxis: object}} axesData axes data
     * @param {Array.<string>} chartTypes chart types
     * @returns {{column: ?axisLimit, line: ?axisLimit}} limit map
     * @private
     */
    _getLimitMap: function(axesData, chartTypes) {
        var limitMap = {},
            yAxisLimit = axesData.yAxis ? axesData.yAxis.limit : axesData.rightYAxis.limit;

        limitMap[chartTypes[0]] = this.isVertical ? yAxisLimit : axesData.xAxis.limit;

        if (chartTypes.length > 1) {
            limitMap[chartTypes[1]] = axesData.rightYAxis ? axesData.rightYAxis.limit : yAxisLimit;
        }

        return limitMap;
    },

    /**
     * Get map for AxisScaleMaker of axes(xAxis, yAxis).
     * @returns {Object.<string, AxisScaleMaker>}
     * @private
     */
    _getAxisScaleMakerMap: function() {
        if (!this.axisScaleMakerMap) {
            this.axisScaleMakerMap = this._makeAxisScaleMakerMap();
        }

        return this.axisScaleMakerMap;
    },

    /**
     * Make axis data for rendering area of axis like yAxis, xAxis, rightYAxis.
     * @param {AxisScaleMaker} axisScaleMaker - AxisScaleMaker
     * @param {object} options - options for axis
     * @param {boolean} [isVertical] - whether vertical or not
     * @param {boolean} [isPositionRight] - whether right position or not
     * @returns {object}
     * @private
     */
    _makeAxisData: function(axisScaleMaker, options, isVertical, isPositionRight) {
        var aligned = predicate.isLineTypeChart(this.chartType, this.chartTypes);
        var axisData;

        if (axisScaleMaker) {
            axisData = axisDataMaker.makeValueAxisData({
                axisScaleMaker: axisScaleMaker,
                options: options,
                isVertical: !!isVertical,
                isPositionRight: !!isPositionRight,
                aligned: !!aligned
            });
        } else {
            axisData = axisDataMaker.makeLabelAxisData({
                labels: this.dataProcessor.getCategories(isVertical),
                options: options,
                isVertical: !!isVertical,
                isPositionRight: !!isPositionRight,
                aligned: !!aligned,
                addedDataCount: tui.util.pick(this.options.series, 'shifting') ? this.addedDataCount : 0
            });
        }

        return axisData;
    },

    /**
     * Make axes data, used in a axis component like yAxis, xAxis, rightYAxis.
     * @returns {object} axes data
     * @private
     * @override
     */
    _makeAxesData: function() {
        var axisScaleMakerMap = this._getAxisScaleMakerMap();
        var options = this.options;
        var yAxisOptions = tui.util.isArray(options.yAxis) ? options.yAxis : [options.yAxis];
        var axesData = {
            xAxis: this._makeAxisData(axisScaleMakerMap.xAxis, options.xAxis),
            yAxis: this._makeAxisData(axisScaleMakerMap.yAxis, yAxisOptions[0], true)
        };

        if (this.hasRightYAxis) {
            axesData.rightYAxis = this._makeAxisData(null, yAxisOptions[1], true, true);
        }

        return axesData;
    },

    /**
     * Make series data for rendering.
     * @param {{yAxis: object, xAxis: object}} axesData axes data
     * @param {Array.<string>} chartTypes chart types
     * @param {boolean} isVertical whether vertical or not
     * @returns {object} series data
     * @private
     */
    _makeSeriesDataForRendering: function(axesData, chartTypes) {
        var limitMap = this._getLimitMap(axesData, chartTypes);
        var aligned = axesData.xAxis.aligned;
        var seriesData = {};

        tui.util.forEachArray(chartTypes, function(chartType) {
            seriesData[chartType + 'Series'] = {
                limit: limitMap[chartType],
                aligned: aligned,
                hasAxes: true
            };
        });

        return seriesData;
    },

    /**
     * Add data ratios.
     * @private
     * @override
     */
    _addDataRatios: function() {
        var self = this;
        var axesData = this.boundsMaker.getAxesData();
        var chartTypes = this.chartTypes || [this.chartType];
        var limitMap = this._getLimitMap(axesData, chartTypes);
        var stackType = tui.util.pick(this.options.series, 'stackType');

        tui.util.forEachArray(chartTypes, function(chartType) {
            self.dataProcessor.addDataRatios(limitMap[chartType], stackType, chartType);
        });
    },

    /**
     * Make rendering data for axis type chart.
     * @returns {object} data for rendering
     * @private
     * @override
     */
    _makeRenderingData: function() {
        var axesData = this.boundsMaker.getAxesData();
        var optionChartTypes = this.chartTypes || [this.chartType];
        var seriesData = this._makeSeriesDataForRendering(axesData, optionChartTypes, this.isVertical);
        var yAxis = axesData.yAxis ? axesData.yAxis : axesData.rightYAxis;
        var xAxis = axesData.xAxis;

        return tui.util.extend({
            plot: {
                vTickCount: yAxis.validTickCount,
                hTickCount: axesData.xAxis.validTickCount
            },
            customEvent: {
                tickCount: this.isVertical ? (xAxis.eventTickCount || xAxis.tickCount) : yAxis.tickCount
            }
        }, seriesData, axesData);
    },

    /**
     * Add grouped event handler layer.
     * @private
     * @override
     */
    _addCustomEventComponentForGroupTooltip: function() {
        this.componentManager.register('customEvent', GroupTypeCustomEvent, {
            chartType: this.chartType,
            isVertical: this.isVertical,
            chartTypes: this.chartTypes,
            zoomable: tui.util.pick(this.options.series, 'zoomable')
        });
    },

    /**
     * Add custom event component for normal tooltip.
     * @private
     */
    _addCustomEventComponentForNormalTooltip: function() {
        this.componentManager.register('customEvent', BoundsTypeCustomEvent, {
            chartType: this.chartType,
            isVertical: this.isVertical
        });
    },

    /**
     * Add custom event component.
     * @private
     */
    _addCustomEventComponent: function() {
        if (this.hasGroupTooltip) {
            this._addCustomEventComponentForGroupTooltip();
        } else {
            this._addCustomEventComponentForNormalTooltip();
        }
    },

    /**
     * Attach coordinate event.
     * @param {CustomEvent} customEvent custom event component
     * @param {Tooltip} tooltip tooltip component
     * @param {Array.<Series>} serieses series components
     * @private
     */
    _attachCustomEventForGroupTooltip: function(customEvent, tooltip, serieses) {
        customEvent.on('showGroupTooltip', tooltip.onShow, tooltip);
        customEvent.on('hideGroupTooltip', tooltip.onHide, tooltip);

        tui.util.forEach(serieses, function(series) {
            if (series.onShowGroupTooltipLine) {
                tooltip.on('showGroupTooltipLine', series.onShowGroupTooltipLine, series);
                tooltip.on('hideGroupTooltipLine', series.onHideGroupTooltipLine, series);
            }
            tooltip.on('showGroupAnimation', series.onShowGroupAnimation, series);
            tooltip.on('hideGroupAnimation', series.onHideGroupAnimation, series);
        });
    },

    /**
     * Attach custom event for normal tooltip.
     * @param {CustomEvent} customEvent custom event component
     * @param {Tooltip} tooltip tooltip component
     * @param {Array.<Series>} serieses series components
     * @private
     */
    _attachCustomEventForNormalTooltip: function(customEvent, tooltip, serieses) {
        customEvent.on('showTooltip', tooltip.onShow, tooltip);
        customEvent.on('hideTooltip', tooltip.onHide, tooltip);

        tui.util.forEach(serieses, function(series) {
            var showAnimationEventName, hideAnimationEventName;

            if (series.onShowAnimation) {
                showAnimationEventName = renderUtil.makeCustomEventName('show', series.chartType, 'animation');
                hideAnimationEventName = renderUtil.makeCustomEventName('hide', series.chartType, 'animation');
                tooltip.on(showAnimationEventName, series.onShowAnimation, series);
                tooltip.on(hideAnimationEventName, series.onHideAnimation, series);
            }
        });
    },

    /**
     * Attach custom event for series selection.
     * @param {CustomEvent} customEvent custom event component
     * @param {Array.<Series>} serieses series components
     * @private
     */
    _attachCustomEventForSeriesSelection: function(customEvent, serieses) {
        tui.util.forEach(serieses, function(series) {
            var selectSeriesEventName = renderUtil.makeCustomEventName('select', series.chartType, 'series'),
                unselectSeriesEventName = renderUtil.makeCustomEventName('unselect', series.chartType, 'series');

            customEvent.on(selectSeriesEventName, series.onSelectSeries, series);
            customEvent.on(unselectSeriesEventName, series.onUnselectSeries, series);
        });
    },

    /**
     * Attach custom event.
     * @private
     * @override
     */
    _attachCustomEvent: function() {
        var serieses = this.componentManager.where({componentType: 'series'}),
            customEvent = this.componentManager.get('customEvent'),
            tooltip = this.componentManager.get('tooltip');

        ChartBase.prototype._attachCustomEvent.call(this, serieses);

        if (this.hasGroupTooltip) {
            this._attachCustomEventForGroupTooltip(customEvent, tooltip, serieses);
        } else {
            this._attachCustomEventForNormalTooltip(customEvent, tooltip, serieses);
        }

        this._attachCustomEventForSeriesSelection(customEvent, serieses);
    }
};

module.exports = axisTypeMixer;

},{"../axes/axis":1,"../customEvents/boundsTypeCustomEvent":35,"../customEvents/groupTypeCustomEvent":37,"../helpers/axisDataMaker":54,"../helpers/predicate":61,"../helpers/renderUtil":63,"../legends/legend":67,"../plots/plot":72,"../tooltips/groupTooltip":108,"../tooltips/tooltip":112,"./chartBase":11}],8:[function(require,module,exports){
/**
 * @fileoverview Bar chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var chartConst = require('../const');
var axisTypeMixer = require('./axisTypeMixer');
var barTypeMixer = require('./barTypeMixer');
var predicate = require('../helpers/predicate');
var Series = require('../series/barChartSeries');

var BarChart = tui.util.defineClass(ChartBase, /** @lends BarChart.prototype */ {
    /**
     * Bar chart.
     * @constructs BarChart
     * @extends ChartBase
     * @mixes axisTypeMixer
     * @param {Array.<Array>} rawData raw data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(rawData, theme, options) {
        /**
         * className
         * @type {string}
         */
        this.className = 'tui-bar-chart';

        /**
         * Whether has right y axis or not.
         * @type {boolean}
         */
        this.hasRightYAxis = false;

        options.yAxis = options.yAxis || {};
        options.xAxis = options.xAxis || {};
        options.plot = options.plot || {};
        options.series = options.series || {};

        if (predicate.isValidStackOption(options.series.stackType)) {
            rawData.series = this._sortRawSeriesData(rawData.series);
        }

        if (options.series.diverging) {
            rawData.series = this._makeRawSeriesDataForDiverging(rawData.series, options.series.stackType);
            this._updateDivergingOption(options);
        }

        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options,
            hasAxes: true
        });

        this._addComponents(options.chartType);
    },

    /**
     * Update options for diverging option.
     * @param {object} options options
     * @private
     */
    _updateDivergingOption: function(options) {
        var isCenter;

        options.series.stackType = options.series.stackType || chartConst.NORMAL_STACK_TYPE;
        this.hasRightYAxis = tui.util.isArray(options.yAxis) && options.yAxis.length > 1;

        isCenter = predicate.isYAxisAlignCenter(this.hasRightYAxis, options.yAxis.align);

        options.yAxis.isCenter = isCenter;
        options.xAxis.divided = isCenter;
        options.series.divided = isCenter;
        options.plot.divided = isCenter;
    },

    /**
     * Make map for AxisScaleMaker of axes(xAxis, yAxis).
     * @returns {Object.<string, AxisScaleMaker>}
     * @private
     */
    _makeAxisScaleMakerMap: function() {
        return {
            xAxis: this._createAxisScaleMaker(this.options.xAxis, 'xAxis')
        };
    },

    /**
     * Add components
     * @param {string} chartType chart type
     * @private
     */
    _addComponents: function(chartType) {
        var axes = [
            {
                name: 'yAxis',
                isLabel: true,
                isVertical: true
            },
            {
                name: 'xAxis'
            }
        ];

        if (this.hasRightYAxis) {
            axes.push({
                name: 'rightYAxis',
                isLabel: true,
                isVertical: true
            });
        }
        this._addComponentsForAxisType({
            chartType: chartType,
            axis: axes,
            series: [
                {
                    name: 'barSeries',
                    SeriesClass: Series
                }
            ],
            plot: true
        });
    },

    /**
     * On change selected legend.
     * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
     */
    onChangeCheckedLegends: function(checkedLegends) {
        var boundParams;

        if (this.hasRightYAxis) {
            boundParams = {
                optionChartTypes: ['bar', 'bar']
            };
        }

        ChartBase.prototype.onChangeCheckedLegends.call(this, checkedLegends, null, boundParams);
    }
});

tui.util.extend(BarChart.prototype, axisTypeMixer, barTypeMixer);

module.exports = BarChart;

},{"../const":31,"../helpers/predicate":61,"../series/barChartSeries":90,"./axisTypeMixer":7,"./barTypeMixer":9,"./chartBase":11}],9:[function(require,module,exports){
/**
 * @fileoverview barTypeMixer is mixer of bar type chart(bar, column).
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    rawDataHandler = require('../helpers/rawDataHandler'),
    predicate = require('../helpers/predicate');

/**
 * barTypeMixer is mixer of bar type chart(bar, column).
 * @mixin
 */
var barTypeMixer = {
    /**
     * Make minus values.
     * @param {Array.<number>} data number data
     * @returns {Array} minus values
     * @private
     */
    _makeMinusValues: function(data) {
        return tui.util.map(data, function(value) {
            return value < 0 ? 0 : -value;
        });
    },

    /**
     * Make plus values.
     * @param {Array.<number>} data number data
     * @returns {Array} plus values
     * @private
     */
    _makePlusValues: function(data) {
        return tui.util.map(data, function(value) {
            return value < 0 ? 0 : value;
        });
    },

    /**
     * Make normal diverging raw series data.
     * @param {{data: Array.<number>}} rawSeriesData raw series data
     * @returns {{data: Array.<number>}} changed raw series data
     * @private
     */
    _makeNormalDivergingRawSeriesData: function(rawSeriesData) {
        rawSeriesData.length = Math.min(rawSeriesData.length, 2);

        rawSeriesData[0].data = this._makeMinusValues(rawSeriesData[0].data);

        if (rawSeriesData[1]) {
            rawSeriesData[1].data = this._makePlusValues(rawSeriesData[1].data);
        }

        return rawSeriesData;
    },

    /**
     * Make raw series data for stacked diverging option.
     * @param {{data: Array.<number>, stack: string}} rawSeriesData raw series data
     * @returns {{data: Array.<number>}} changed raw series data
     * @private
     */
    _makeRawSeriesDataForStackedDiverging: function(rawSeriesData) {
        var self = this,
            stacks = rawDataHandler.pickStacks(rawSeriesData, true),
            result = [],
            leftStack = stacks[0],
            rightStack = stacks[1];

        rawSeriesData = rawDataHandler.sortSeriesData(rawSeriesData, stacks);

        tui.util.forEachArray(rawSeriesData, function(seriesDatum) {
            var stack = seriesDatum.stack || chartConst.DEFAULT_STACK;
            if (stack === leftStack) {
                seriesDatum.data = self._makeMinusValues(seriesDatum.data);
                result.push(seriesDatum);
            } else if (stack === rightStack) {
                seriesDatum.data = self._makePlusValues(seriesDatum.data);
                result.push(seriesDatum);
            }
        });

        return result;
    },

    /**
     * Make raw series data for diverging.
     * @param {{data: Array.<number>, stack: string}} rawSeriesData raw series data
     * @param {?string} stackTypeOption stackType option
     * @returns {{data: Array.<number>}} changed raw series data
     * @private
     */
    _makeRawSeriesDataForDiverging: function(rawSeriesData, stackTypeOption) {
        if (predicate.isValidStackOption(stackTypeOption)) {
            rawSeriesData = this._makeRawSeriesDataForStackedDiverging(rawSeriesData);
        } else {
            rawSeriesData = this._makeNormalDivergingRawSeriesData(rawSeriesData);
        }

        return rawSeriesData;
    },

    /**
     * Sort raw series data from stacks.
     * @param {Array.<{data: Array.<number>, stack: string}>} rawSeriesData raw series data
     * @returns {Array.<{data: Array.<number>, stack: string}>}
     * @private
     */
    _sortRawSeriesData: function(rawSeriesData) {
        var stacks = rawDataHandler.pickStacks(rawSeriesData);

        return rawDataHandler.sortSeriesData(rawSeriesData, stacks);
    }
};

module.exports = barTypeMixer;

},{"../const":31,"../helpers/predicate":61,"../helpers/rawDataHandler":62}],10:[function(require,module,exports){
/**
 * @fileoverview Bubble chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var chartConst = require('../const');
var Series = require('../series/bubbleChartSeries');
var CircleLegend = require('../legends/circleLegend');
var axisTypeMixer = require('./axisTypeMixer');
var predicate = require('../helpers/predicate');
var SimpleCustomEvent = require('../customEvents/simpleCustomEvent');

var BubbleChart = tui.util.defineClass(ChartBase, /** @lends BubbleChart.prototype */ {
    /**
     * className
     * @type {string}
     */
    className: 'tui-bubble-chart',
    /**
     * Bubble chart.
     * @constructs BubbleChart
     * @extends ChartBase
     * @mixes axisTypeMixer
     * @param {Array.<Array>} rawData raw data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(rawData, theme, options) {
        options.tooltip = options.tooltip || {};

        this.axisScaleMakerMap = null;

        if (!options.tooltip.align) {
            options.tooltip.align = chartConst.TOOLTIP_DEFAULT_ALIGN_OPTION;
        }

        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options,
            hasAxes: true
        });

        this._addComponents(options.chartType);
    },

    /**
     * Set default options.
     * @param {object} options - options for bubble chart
     * @private
     * @override
     */
    _setDefaultOptions: function(options) {
        ChartBase.prototype._setDefaultOptions.call(this, options);
        this.options.circleLegend = this.options.circleLegend || {};

        if (tui.util.isUndefined(this.options.circleLegend.visible)) {
            this.options.circleLegend.visible = true;
        }
    },

    /**
     * Make map for AxisScaleMaker of axes(xAxis, yAxis).
     * @returns {Object.<string, AxisScaleMaker>}
     * @private
     */
    _makeAxisScaleMakerMap: function() {
        var hasCategories = this.dataProcessor.hasCategories();
        var seriesDataModel = this.dataProcessor.getSeriesDataModel(this.chartType);
        var isXCountGreaterThanYCount = seriesDataModel.isXCountGreaterThanYCount();
        var options = this.options;
        var scaleMakerMap = {};

        if (hasCategories) {
            if (isXCountGreaterThanYCount) {
                scaleMakerMap.xAxis = this._createAxisScaleMaker(options.xAxis, 'xAxis', 'x');
            } else {
                scaleMakerMap.yAxis = this._createAxisScaleMaker(options.yAxis, 'yAxis', 'y', null, {
                    isVertical: true
                });
            }
        } else {
            scaleMakerMap.xAxis = this._createAxisScaleMaker(options.xAxis, 'xAxis', 'x');
            scaleMakerMap.yAxis = this._createAxisScaleMaker(options.yAxis, 'yAxis', 'y', null, {
                isVertical: true
            });
        }

        return scaleMakerMap;
    },

    /**
     * Add components
     * @param {string} chartType chart type
     * @private
     */
    _addComponents: function(chartType) {
        this._addComponentsForAxisType({
            chartType: chartType,
            axis: [
                {
                    name: 'yAxis',
                    isVertical: true
                },
                {
                    name: 'xAxis'
                }
            ],
            series: [
                {
                    name: 'bubbleSeries',
                    SeriesClass: Series
                }
            ],
            plot: true
        });

        if (this.options.circleLegend.visible) {
            this.componentManager.register('circleLegend', CircleLegend, {
                chartType: chartType,
                baseFontFamily: this.theme.chart.fontFamily
            });
        }
    },

    /**
     * Update width of legend and series of boundsMaker.
     * @param {number} seriesWidth - width of series area
     * @param {number} legendWidth - width of legend area
     * @private
     */
    _updateLegendAndSeriesWidth: function(seriesWidth, legendWidth) {
        var circleLegendWidth = this.boundsMaker.getDimension('circleLegend').width;

        if (predicate.hasVerticalLegendWidth(this.options.legend)) {
            this.boundsMaker.registerBaseDimension('legend', {
                width: circleLegendWidth
            });
        }

        this.boundsMaker.registerBaseDimension('series', {
            width: seriesWidth - (circleLegendWidth - legendWidth)
        });
    },

    /**
     * Update width of legend area by width of circle legend area.
     * @private
     */
    _updateLegendWidthByCircleLegendWidth: function() {
        var boundsMaker = this.boundsMaker;
        var axesData = boundsMaker.getAxesData();
        var circleLegendWidth = boundsMaker.getDimension('circleLegend').width;
        var legendWidth = boundsMaker.getDimension('calculationLegend').width;
        var isXAxisLabel, seriesWidth;

        if (legendWidth >= circleLegendWidth) {
            return;
        }

        isXAxisLabel = axesData.xAxis.isLabel;
        seriesWidth = boundsMaker.getDimension('series').width;

        this._updateLegendAndSeriesWidth(seriesWidth, legendWidth);

        if (!isXAxisLabel) {
            this.axisScaleMakerMap = null;
            this._registerAxesData();
        }
    },

    /**
     * Update dimensions.
     * @private
     * @override
     */
    _updateDimensions: function() {
        if (!this.options.circleLegend.visible) {
            return;
        }

        this.componentManager.get('circleLegend').registerCircleLegendDimension();
        this._updateLegendWidthByCircleLegendWidth();
    }
});

tui.util.extend(BubbleChart.prototype, axisTypeMixer);

/**
 * Add data ratios.
 * @private
 * @override
 */
BubbleChart.prototype._addDataRatios = function() {
    var scaleMakerMap = this._getAxisScaleMakerMap();
    var limitMap = {};

    if (scaleMakerMap.xAxis) {
        limitMap.x = scaleMakerMap.xAxis.getLimit();
    }

    if (scaleMakerMap.yAxis) {
        limitMap.y = scaleMakerMap.yAxis.getLimit();
    }

    this.dataProcessor.addDataRatiosForCoordinateType(this.chartType, limitMap, true);
};

/**
 * Add custom event component for normal tooltip.
 * @private
 */
BubbleChart.prototype._attachCustomEvent = function() {
    var componentManager = this.componentManager;
    var customEvent = componentManager.get('customEvent');
    var bubbleSeries = componentManager.get('bubbleSeries');
    var tooltip = componentManager.get('tooltip');

    axisTypeMixer._attachCustomEvent.call(this);

    customEvent.on({
        clickBubbleSeries: bubbleSeries.onClickSeries,
        moveBubbleSeries: bubbleSeries.onMoveSeries
    }, bubbleSeries);

    bubbleSeries.on({
        showTooltip: tooltip.onShow,
        hideTooltip: tooltip.onHide,
        showTooltipContainer: tooltip.onShowTooltipContainer,
        hideTooltipContainer: tooltip.onHideTooltipContainer
    }, tooltip);
};

/**
 * Add custom event component.
 * @private
 */
BubbleChart.prototype._addCustomEventComponent = function() {
    this.componentManager.register('customEvent', SimpleCustomEvent, {
        chartType: this.chartType
    });
};

module.exports = BubbleChart;

},{"../const":31,"../customEvents/simpleCustomEvent":39,"../helpers/predicate":61,"../legends/circleLegend":66,"../series/bubbleChartSeries":92,"./axisTypeMixer":7,"./chartBase":11}],11:[function(require,module,exports){
/**
 * @fileoverview ChartBase
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ComponentManager = require('./componentManager');
var DefaultDataProcessor = require('../dataModels/dataProcessor');
var BoundsMaker = require('../helpers/boundsMaker');
var AxisScaleMaker = require('../helpers/axisScaleMaker');
var dom = require('../helpers/domHandler');
var predicate = require('../helpers/predicate');
var renderUtil = require('../helpers/renderUtil');
var UserEventListener = require('../helpers/userEventListener');

var ChartBase = tui.util.defineClass(/** @lends ChartBase.prototype */ {
    /**
     * Chart base.
     * @constructs ChartBase
     * @param {object} params parameters
     *      @param {object} params.rawData raw data
     *      @param {object} params.theme chart theme
     *      @param {object} params.options chart options
     *      @param {boolean} params.hasAxes whether has axes or not
     *      @param {boolean} params.isVertical whether vertical or not
     *      @param {DataProcessor} params.DataProcessor DataProcessor
     */
    init: function(params) {
        /**
         * theme
         * @type {object}
         */
        this.theme = params.theme;

        /**
         * options
         * @type {object}
         */
        this.options = null;
        this._setDefaultOptions(params.options);

        /**
         * chart type
         * @type {string}
         */
        this.chartType = this.options.chartType;

        /**
         * whether chart has axes or not
         * @type {boolean}
         */
        this.hasAxes = params.hasAxes;

        /**
         * whether vertical or not
         * @type {boolean}
         */
        this.isVertical = !!params.isVertical;

        /**
         * whether chart has group tooltip or not
         * @type {boolean}
         */
        this.hasGroupTooltip = !!tui.util.pick(this.options, 'tooltip', 'grouped');

        /**
         * data processor
         * @type {DataProcessor}
         */
        this.dataProcessor = this._createDataProcessor(params);

        /**
         * bounds maker
         * @type {BoundsMaker}
         */
        this.boundsMaker = new BoundsMaker({
            options: this.options,
            theme: this.theme,
            dataProcessor: this.dataProcessor,
            hasAxes: this.hasAxes,
            isVertical: this.isVertical,
            chartType: this.chartType,
            chartTypes: params.seriesNames
        });

        /**
         * component manager
         * @type {ComponentManager}
         */
        this.componentManager = new ComponentManager({
            dataProcessor: this.dataProcessor,
            options: this.options,
            theme: this.theme,
            boundsMaker: this.boundsMaker,
            hasAxes: this.hasAxes
        });

        /**
         * user event listener
         * @type {object}
         */
        this.userEvent = new UserEventListener();
    },

    /**
     * Set default options.
     * @param {object} options - options for chart
     * @private
     */
    _setDefaultOptions: function(options) {
        options.legend = options.legend || {};

        if (tui.util.isUndefined(options.legend.visible)) {
            options.legend.visible = true;
        }

        this.options = options;
    },

    /**
     * Create dataProcessor for processing raw data.
     * @param {object} params parameters
     *      @param {object} params.rawData - raw data
     *      @param {DataProcessor} params.DataProcessor - DataProcessor class
     *      @param {{chart: object, chartType: string}} params.options - chart options
     *      @param {Array} params.seriesNames series - chart types for rendering series
     * @returns {object} data processor
     * @private
     */
    _createDataProcessor: function(params) {
        var DataProcessor, dataProcessor;

        DataProcessor = params.DataProcessor || DefaultDataProcessor;
        dataProcessor = new DataProcessor(params.rawData, this.chartType, params.options, params.seriesNames);

        return dataProcessor;
    },

    /**
     * Pick limit from options.
     * @param {{min: number, max: number, title: string}} options - axis options
     * @returns {{min: ?number, max: ?number}}
     * @private
     */
    _pickLimitFromOptions: function(options) {
        options = options || {};

        return {
            min: options.min,
            max: options.max
        };
    },

    /**
     * Create AxisScaleMaker.
     * AxisScaleMaker calculates the limit and step into values of processed data and returns it.
     * @param {{title: string, min: number, max: number}} axisOptions - options for axis
     * @param {string} areaType - type of area like series, xAxis, yAxis, circleLegend, legend
     * @param {string} valueType - type of value like value, x, y, r
     * @param {string} chartType - type of chart
     * @param {?object} additionalParams additional parameters
     * @returns {AxisScaleMaker}
     * @private
     */
    _createAxisScaleMaker: function(axisOptions, areaType, valueType, chartType, additionalParams) {
        var limit = this._pickLimitFromOptions(axisOptions);
        var seriesOptions = this.options.series || {};

        chartType = chartType || this.chartType;
        seriesOptions = seriesOptions[chartType] || seriesOptions;

        return new AxisScaleMaker(tui.util.extend({
            dataProcessor: this.dataProcessor,
            boundsMaker: this.boundsMaker,
            options: {
                stackType: seriesOptions.stackType,
                diverging: seriesOptions.diverging,
                limit: limit
            },
            isVertical: this.isVertical,
            areaType: areaType,
            valueType: valueType,
            chartType: chartType
        }, additionalParams));
    },

    /**
     * Make data for tooltip component.
     * @returns {object} tooltip data
     * @private
     */
    _makeTooltipData: function() {
        return {
            isVertical: this.isVertical,
            userEvent: this.userEvent,
            chartType: this.chartType
        };
    },

    /**
     * Make rendering data for axis type chart.
     * @returns {object} rendering data.
     * @private
     */
    _makeRenderingData: function() {
        return {};
    },

    /**
     * Attach custom event.
     * @param {Array.<object>} serieses serieses
     * @private
     */
    _attachCustomEvent: function(serieses) {
        var legend = this.componentManager.get('legend');
        var customEvent = this.componentManager.get('customEvent');

        serieses = serieses || this.componentManager.where({componentType: 'series'});

        if (tui.util.pick(this.options.series, 'zoomable')) {
            customEvent.on('zoom', this.onZoom, this);
            customEvent.on('resetZoom', this.onResetZoom, this);
        }

        if (legend) {
            legend.on('changeCheckedLegends', this.onChangeCheckedLegends, this);
            tui.util.forEach(serieses, function(series) {
                var selectLegendEventName = renderUtil.makeCustomEventName('select', series.chartType, 'legend');
                legend.on(selectLegendEventName, series.onSelectLegend, series);
            });
        }
    },

    /**
     * Make axes data, used in a axis component like yAxis, xAxis, rightYAxis.
     * @abstract
     * @private
     */
    _makeAxesData: function() {},

    /**
     * Update dimensions.
     * @abstract
     * @private
     */
    _updateDimensions: function() {},

    /**
     * Add data ratios.
     * @private
     * @abstract
     */
    _addDataRatios: function() {},

    /**
     * Execute component function.
     * @param {string} funcName function name
     * @private
     */
    _executeComponentFunc: function(funcName) {
        this.componentManager.each(function(component) {
            if (component[funcName]) {
                component[funcName]();
            }
        });
    },

    /**
     * Register axes data, used in a axis component like yAxis, xAxis.
     * @private
     */
    _registerAxesData: function() {
        var axesData = this._makeAxesData();
        this.boundsMaker.registerAxesData(axesData);
    },

    /**
     * Update axesData.
     * @private
     * @abstract
     */
    _updateAxesData: function() {},

    /**
     * Render.
     * @param {function} onRender render callback function
     * @private
     */
    _render: function(onRender) {
        var labelAxisOptions = (this.isVertical ? this.options.xAxis : this.options.yAxis) || {};
        var renderingData;

        this._executeComponentFunc('registerDimension');
        this._registerAxesData();
        this._executeComponentFunc('registerAdditionalDimension');
        this.boundsMaker.registerSeriesDimension();

        if (this.hasAxes && predicate.isAutoTickInterval(labelAxisOptions.tickInterval)) {
            this._updateAxesData();
        }

        this._updateDimensions();

        this.boundsMaker.registerBoundsData();
        this._addDataRatios();

        renderingData = this._makeRenderingData();

        onRender(renderingData);

        this._sendSeriesData();
    },

    /**
     * Render chart.
     * @returns {HTMLElement} chart element
     */
    render: function() {
        var el = dom.create('DIV', this.className),
            self = this;

        dom.addClass(el, 'tui-chart');
        this._renderTitle(el);
        renderUtil.renderDimension(el, this.boundsMaker.getDimension('chart'));
        renderUtil.renderBackground(el, this.theme.chart.background);
        renderUtil.renderFontFamily(el, this.theme.chart.fontFamily);

        this._render(function(renderingData) {
            self._renderComponents(renderingData, 'render', el);
        });

        this._attachCustomEvent();
        this.chartContainer = el;

        return el;
    },

    /**
     * Filter raw data belong to checked legend.
     * @param {object} rawData raw data
     * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
     * @returns {object} rawData
     * @private
     */
    _filterCheckedRawData: function(rawData, checkedLegends) {
        var cloneData = JSON.parse(JSON.stringify(rawData));

        if (tui.util.isArray(cloneData.series)) {
            cloneData.series = tui.util.filter(cloneData.series, function(series, index) {
                return checkedLegends[index];
            });
        } else {
            tui.util.forEach(cloneData.series, function(serieses, chartType) {
                if (!checkedLegends[chartType]) {
                    cloneData.series[chartType] = [];
                } else if (checkedLegends[chartType].length) {
                    cloneData.series[chartType] = tui.util.filter(serieses, function(series, index) {
                        return checkedLegends[chartType][index];
                    });
                }
            });
        }

        return cloneData;
    },

    /**
     * Make rerendering data.
     * @param {object} renderingData rendering data
     * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
     * @returns {object} rendering data
     * @private
     */
    _makeRerenderingData: function(renderingData, checkedLegends) {
        var tooltipData = this._makeTooltipData();
        var serieses = this.componentManager.where({componentType: 'series'});

        renderingData.tooltip = tui.util.extend({
            checkedLegends: checkedLegends
        }, tooltipData, renderingData.tooltip);

        tui.util.forEach(serieses, function(series) {
            renderingData[series.componentName] = tui.util.extend({
                checkedLegends: checkedLegends[series.seriesName] || checkedLegends
            }, renderingData[series.componentName]);
        });

        return renderingData;
    },

    /**
     * Rerender.
     * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
     * @param {?object} rawData rawData
     * @private
     */
    _rerender: function(checkedLegends, rawData) {
        var self = this;
        var dataProcessor = this.dataProcessor;

        if (!rawData) {
            rawData = this._filterCheckedRawData(dataProcessor.getZoomedRawData(), checkedLegends);
        }

        this.axisScaleMakerMap = null;
        this.dataProcessor.initData(rawData);
        this.boundsMaker.initBoundsData();
        this._render(function(renderingData) {
            renderingData = self._makeRerenderingData(renderingData, checkedLegends);
            self._renderComponents(renderingData, 'rerender');
        });
    },

    /**
     * On change checked legend.
     * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
     * @param {?object} rawData rawData
     * @param {?object} boundsParams addition params for calculating bounds
     */
    onChangeCheckedLegends: function(checkedLegends, rawData, boundsParams) {
        this._rerender(checkedLegends, rawData, boundsParams);
    },

    /**
     * On zoom.
     * @abstract
     */
    onZoom: function() {},

    /**
     * On reset zoom.
     * @abstract
     */
    onResetZoom: function() {},

    /**
     * Render title.
     * @param {HTMLElement} container - container
     * @private
     */
    _renderTitle: function(container) {
        var chartOptions = this.options.chart || {};
        var titleElement = renderUtil.renderTitle(chartOptions.title, this.theme.title, 'tui-chart-title');

        dom.append(container, titleElement);
    },

    /**
     * Render components.
     * @param {object} renderingData data for rendering
     * @param {string} funcName function name for execution
     * @param {HTMLElement} container container element
     * @private
     */
    _renderComponents: function(renderingData, funcName, container) {
        var paper;
        var elements = this.componentManager.map(function(component) {
            var element = null;
            var data, result;

            if (component[funcName]) {
                data = renderingData[component.componentName] || renderingData || {};
                data.paper = paper;
                result = component[funcName](data);

                if (result && result.container) {
                    element = result.container;
                    paper = result.paper;
                } else {
                    element = result;
                }
            }

            return element;
        });

        if (container) {
            dom.append(container, elements);
        }
    },

    /**
     * Send series data to custom event component.
     * @param {string} chartType - type of chart
     * @private
     */
    _sendSeriesData: function(chartType) {
        var self = this,
            customEvent = this.componentManager.get('customEvent'),
            seriesInfos, chartTypes;

        if (!customEvent) {
            return;
        }

        chartTypes = this.chartTypes || [chartType || this.chartType];
        seriesInfos = tui.util.map(chartTypes, function(seriesName) {
            var _chartType = self.dataProcessor.findChartType(seriesName);
            var componentName = (seriesName || _chartType) + 'Series';
            var component = self.componentManager.get(componentName) || self.componentManager.get('series');

            return {
                chartType: _chartType,
                data: component.getSeriesData()
            };
        });

        customEvent.initCustomEventData(seriesInfos);
    },

    /**
     * Make event name for animation.
     * @param {string} chartType chart type
     * @param {string} prefix prefix
     * @returns {string} event name
     * @private
     */
    _makeAnimationEventName: function(chartType, prefix) {
        return prefix + chartType.substring(0, 1).toUpperCase() + chartType.substring(1) + 'Animation';
    },

    /**
     * Animate chart.
     */
    animateChart: function() {
        this.componentManager.each(function(component) {
            if (component.animateComponent) {
                component.animateComponent();
            }
        });
    },

    /**
     * Register of user event.
     * @param {string} eventName event name
     * @param {function} func event callback
     */
    on: function(eventName, func) {
        this.userEvent.register(eventName, func);
    },

    /**
     * Update dimension of chart.
     * @param {{width: number, height: number}} dimension dimension
     * @returns {boolean} whether updated or not
     * @private
     */
    _updateChartDimension: function(dimension) {
        var updated = false;
        var chartOptions = this.options.chart;

        if (dimension.width && chartOptions.width !== dimension.width) {
            chartOptions.width = dimension.width;
            updated = true;
        }

        if (dimension.height && chartOptions.height !== dimension.height) {
            chartOptions.height = dimension.height;
            updated = true;
        }

        return updated;
    },

    /**
     * Public API for resizable.
     * @param {object} dimension dimension
     *      @param {number} dimension.width width
     *      @param {number} dimension.height height
     * @api
     */
    resize: function(dimension) {
        var self = this;
        var updated;

        if (!dimension) {
            return;
        }

        updated = this._updateChartDimension(dimension);

        if (!updated) {
            return;
        }

        this.boundsMaker.initBoundsData(this.options.chart);
        renderUtil.renderDimension(this.chartContainer, this.boundsMaker.getDimension('chart'));

        this._render(function(renderingData) {
            self._renderComponents(renderingData, 'resize');
        });
    },

    /**
     * Set tooltip align option.
     * @param {string} align align (left|center|right, top|middle|bottom)
     * @api
     */
    setTooltipAlign: function(align) {
        this.componentManager.get('tooltip').setAlign(align);
    },

    /**
     * Set position option.
     * @param {object} position moving position
     *      @param {number} position.left left
     *      @param {number} position.top top
     * @api
     */
    setTooltipPosition: function(position) {
        this.componentManager.get('tooltip').setPosition(position);
    },

    /**
     * Reset tooltip align option.
     * @api
     */
    resetTooltipAlign: function() {
        this.componentManager.get('tooltip').resetAlign();
    },

    /**
     * Reset tooltip position.
     * @api
     */
    resetTooltipPosition: function() {
        this.componentManager.get('tooltip').resetPosition();
    },

    /**
     * Show series label.
     * @api
     */
    showSeriesLabel: function() {
        var serieses = this.componentManager.where({componentType: 'series'});

        tui.util.forEachArray(serieses, function(series) {
            series.showLabel();
        });
    },

    /**
     * Hide series label.
     * @api
     */
    hideSeriesLabel: function() {
        var serieses = this.componentManager.where({componentType: 'series'});

        tui.util.forEachArray(serieses, function(series) {
            series.hideLabel();
        });
    },

    /**
     * Add data.
     * @abstract
     */
    addData: function() {}
});

module.exports = ChartBase;

},{"../dataModels/dataProcessor":42,"../helpers/axisScaleMaker":55,"../helpers/boundsMaker":56,"../helpers/domHandler":59,"../helpers/predicate":61,"../helpers/renderUtil":63,"../helpers/userEventListener":65,"./componentManager":16}],12:[function(require,module,exports){
/**
 * @fileoverview ColorSpectrum create a color spectrum and provide color value.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var colorutil = require('../helpers/colorutil');

var ColorSpectrum = tui.util.defineClass(/** @lends ColorSpectrum.prototype */ {
    /**
     * ColorSpectrum create a color spectrum and provide color value.
     * @constructs ColorSpectrum
     * @param {string} startColor hex color
     * @param {string} endColor hex color
     */
    init: function(startColor, endColor) {
        var endRGB;

        this.start = colorutil.colorNameToHex(startColor);
        this.startRGB = colorutil.hexToRGB(this.start);
        this.end = colorutil.colorNameToHex(endColor);

        endRGB = colorutil.hexToRGB(this.end);
        this.distances = this._makeDistances(this.startRGB, endRGB);
        this.colorMap = {};
    },

    /**
     * Make distances start RGB to end RGB.
     * @param {Array.<number>} startRGB start RGB
     * @param {Array.<number>} endRGB end RGB
     * @returns {Array.<number>} distances
     * @private
     */
    _makeDistances: function(startRGB, endRGB) {
        return tui.util.map(startRGB, function(value, index) {
            return endRGB[index] - value;
        });
    },

    /**
     * Get hex color.
     * @param {number} ratio ratio
     * @returns {string} hex color
     */
    getColor: function(ratio) {
        var hexColor = this.colorMap[ratio];
        var distances, rgbColor;

        if (!hexColor) {
            distances = this.distances;
            rgbColor = tui.util.map(this.startRGB, function(start, index) {
                return start + parseInt(distances[index] * ratio, 10);
            });
            hexColor = colorutil.rgbToHEX.apply(null, rgbColor);
        }

        return hexColor || null;
    }
});

module.exports = ColorSpectrum;

},{"../helpers/colorutil":58}],13:[function(require,module,exports){
/**
 * @fileoverview Column chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var chartConst = require('../const');
var axisTypeMixer = require('./axisTypeMixer');
var barTypeMixer = require('./barTypeMixer');
var predicate = require('../helpers/predicate');
var Series = require('../series/columnChartSeries');

var ColumnChart = tui.util.defineClass(ChartBase, /** @lends ColumnChart.prototype */ {
    /**
     * Column chart.
     * @constructs ColumnChart
     * @extends ChartBase
     * @mixes axisTypeMixer
     * @mixes verticalTypeMixer
     * @param {Array.<Array>} rawData raw data
     * @param {object} theme chart theme
     * @param {object} options chart options
     * @param {object} initedData initialized data from combo chart
     */
    init: function(rawData, theme, options) {
        /**
         * className
         * @type {string}
         */
        this.className = 'tui-column-chart';

        options.series = options.series || {};
        options.yAxis = options.yAxis || {};

        if (predicate.isValidStackOption(options.series.stackType)) {
            rawData.series = this._sortRawSeriesData(rawData.series);
        }

        if (options.series.diverging) {
            rawData.series = this._makeRawSeriesDataForDiverging(rawData.series, options.series.stackType);
            options.series.stackType = options.series.stackType || chartConst.NORMAL_STACK_TYPE;
        }

        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options,
            hasAxes: true,
            isVertical: true
        });

        this._addComponents(options.chartType);
    },

    /**
     * Make map for AxisScaleMaker of axes(xAxis, yAxis).
     * @returns {Object.<string, AxisScaleMaker>}
     * @private
     */
    _makeAxisScaleMakerMap: function() {
        return {
            yAxis: this._createAxisScaleMaker(this.options.yAxis, 'yAxis')
        };
    },

    /**
     * Add components
     * @param {string} chartType chart type
     * @private
     */
    _addComponents: function(chartType) {
        this._addComponentsForAxisType({
            chartType: chartType,
            axis: [
                {
                    name: 'yAxis',
                    isVertical: true
                },
                {
                    name: 'xAxis',
                    isLabel: true
                }
            ],
            series: [
                {
                    name: 'columnSeries',
                    SeriesClass: Series,
                    data: {
                        allowNegativeTooltip: true
                    }
                }
            ],
            plot: true
        });
    }
});

tui.util.extend(ColumnChart.prototype, axisTypeMixer, barTypeMixer);

module.exports = ColumnChart;

},{"../const":31,"../helpers/predicate":61,"../series/columnChartSeries":93,"./axisTypeMixer":7,"./barTypeMixer":9,"./chartBase":11}],14:[function(require,module,exports){
/**
 * @fileoverview Column and Line Combo chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var axisTypeMixer = require('./axisTypeMixer');
var comboTypeMixer = require('./comboTypeMixer');
var verticalTypeComboMixer = require('./verticalTypeComboMixer');

var ColumnLineComboChart = tui.util.defineClass(ChartBase, /** @lends ColumnLineComboChart.prototype */ {
    /**
     * Column and Line Combo chart.
     * @constructs ColumnLineComboChart
     * @extends ChartBase
     * @param {Array.<Array>} rawData raw data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(rawData, theme, options) {
        this._initForVerticalTypeCombo(rawData, theme, options);
    },

    /**
     * On change selected legend.
     * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
     */
    onChangeCheckedLegends: function(checkedLegends) {
        var originalRawData = this.dataProcessor.getOriginalRawData();
        var rawData = this._filterCheckedRawData(originalRawData, checkedLegends);
        var chartTypesMap = this._makeChartTypesMap(rawData.series, this.options.yAxis);

        tui.util.extend(this, chartTypesMap);

        ChartBase.prototype.onChangeCheckedLegends.call(this, checkedLegends, rawData, chartTypesMap);
    }
});

tui.util.extend(ColumnLineComboChart.prototype, axisTypeMixer, comboTypeMixer, verticalTypeComboMixer);

module.exports = ColumnLineComboChart;

},{"./axisTypeMixer":7,"./chartBase":11,"./comboTypeMixer":15,"./verticalTypeComboMixer":28}],15:[function(require,module,exports){
/**
 * @fileoverview comboTypeMixer is mixer of combo type chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var defaultTheme = require('../themes/defaultTheme');

/**
 * comboTypeMixer is mixer of combo type chart.
 * @mixin
 */
var comboTypeMixer = {
    /**
     * Get base series options.
     * @param {object.<string, object>} seriesOptions - series options
     * @param {Array.<string>} chartTypes - chart types
     * @returns {object}
     * @private
     */
    _getBaseSeriesOptions: function(seriesOptions, chartTypes) {
        var baseSeriesOptions = tui.util.extend({}, seriesOptions);

        tui.util.forEachArray(chartTypes, function(chartType) {
            delete baseSeriesOptions[chartType];
        });

        return baseSeriesOptions;
    },

    /**
     * Make options map
     * @param {Array.<string>} chartTypes - chart types
     * @returns {object}
     * @private
     */
    _makeOptionsMap: function(chartTypes) {
        var seriesOptions = this.options.series;
        var baseSeriesOptions = this._getBaseSeriesOptions(seriesOptions, chartTypes);
        var optionsMap = {};

        tui.util.forEachArray(chartTypes, function(chartType) {
            optionsMap[chartType] = tui.util.extend({}, baseSeriesOptions, seriesOptions[chartType]);
        });

        return optionsMap;
    },

    /**
     * Make theme map
     * @param {object} seriesNames - series names
     * @returns {object} theme map
     * @private
     */
    _makeThemeMap: function(seriesNames) {
        var dataProcessor = this.dataProcessor;
        var theme = this.theme;
        var themeMap = {};
        var colorCount = 0;

        tui.util.forEachArray(seriesNames, function(chartType) {
            var chartTheme = JSON.parse(JSON.stringify(theme));
            var removedColors;

            if (chartTheme.series[chartType]) {
                themeMap[chartType] = chartTheme.series[chartType];
            } else if (!chartTheme.series.colors) {
                themeMap[chartType] = JSON.parse(JSON.stringify(defaultTheme.series));
                themeMap[chartType].label.fontFamily = chartTheme.chart.fontFamily;
            } else {
                removedColors = chartTheme.series.colors.splice(0, colorCount);
                chartTheme.series.colors = chartTheme.series.colors.concat(removedColors);
                themeMap[chartType] = chartTheme.series;
                colorCount += dataProcessor.getLegendLabels(chartType).length;
            }
        });

        return themeMap;
    }
};

module.exports = comboTypeMixer;

},{"../themes/defaultTheme":107}],16:[function(require,module,exports){
/**
 * @fileoverview ComponentManager manages components of chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ComponentManager = tui.util.defineClass(/** @lends ComponentManager.prototype */ {
    /**
     * ComponentManager manages components of chart.
     * @param {object} params parameters
     *      @param {object} params.theme theme
     *      @param {object} params.options options
     *      @param {DataProcessor} params.dataProcessor data processor
     *      @param {BoundsMaker} params.boundsMaker bounds maker
     * @constructs ComponentManager
     */
    init: function(params) {
        /**
         * Components
         * @type {Array.<object>}
         */
        this.components = [];

        /**
         * Component map.
         * @type {object}
         */
        this.componentMap = {};

        /**
         * theme
         * @type {object}
         */
        this.theme = params.theme || {};

        /**
         * options
         * @type {object}
         */
        this.options = params.options || {};

        /**
         * data processor
         * @type {DataProcessor}
         */
        this.dataProcessor = params.dataProcessor;

        /**
         * bounds maker
         * @type {BoundsMaker}
         */
        this.boundsMaker = params.boundsMaker;

        /**
         * whether chart has axes or not
         * @type {boolean}
         */
        this.hasAxes = params.hasAxes;
    },

    /**
     * Make component options.
     * @param {object} options options
     * @param {string} componentType component type
     * @param {number} index component index
     * @returns {object} options
     * @private
     */
    _makeComponentOptions: function(options, componentType, index) {
        options = options || this.options[componentType];
        options = tui.util.isArray(options) ? options[index] : options || {};

        return options;
    },

    /**
     * Register component.
     * The component refers to a component of the chart.
     * The component types are axis, legend, plot, series and customEvent.
     * Chart Component Description : https://i-msdn.sec.s-msft.com/dynimg/IC267997.gif
     * @param {string} name component name
     * @param {function} Component component constructor
     * @param {object} params component parameters
     */
    register: function(name, Component, params) {
        var index,
            component, componentType;

        params = params || {};

        componentType = params.componentType || name;
        index = params.index || 0;

        params.theme = params.theme || this.theme[componentType];
        params.options = this._makeComponentOptions(params.options, componentType, index);

        params.dataProcessor = this.dataProcessor;
        params.boundsMaker = this.boundsMaker;
        params.hasAxes = this.hasAxes;

        component = new Component(params);
        component.componentName = name;
        component.componentType = componentType;

        this.components.push(component);
        this.componentMap[name] = component;
    },

    /**
     * Iterate each components.
     * @param {function} iteratee iteratee
     */
    each: function(iteratee) {
        tui.util.forEachArray(this.components, iteratee);
    },

    /**
     * Return the results of applying the iteratee to each components.
     *  @param {function} iteratee iteratee
     * @returns {Array.<object>} components
     */
    map: function(iteratee) {
        return tui.util.map(this.components, iteratee);
    },

    /**
     * Find components to conditionMap.
     * @param {object} conditionMap condition map
     * @returns {Array.<object>} filtered components
     */
    where: function(conditionMap) {
        return tui.util.filter(this.components, function(component) {
            var contained = true;

            tui.util.forEach(conditionMap, function(value, key) {
                if (component[key] !== value) {
                    contained = false;
                }

                return contained;
            });

            return contained;
        });
    },

    /**
     * Get component.
     * @param {string} name component name
     * @returns {object} component instance
     */
    get: function(name) {
        return this.componentMap[name];
    }
});

module.exports = ComponentManager;

},{}],17:[function(require,module,exports){
/**
 * @fileoverview Heatmap chart is a graphical representation of data where the individual values contained
 *                      in a matrix are represented as colors.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var ColorSpectrum = require('./colorSpectrum');
var Series = require('../series/heatmapChartSeries');
var chartConst = require('../const');
var axisTypeMixer = require('./axisTypeMixer');
var axisDataMaker = require('../helpers/axisDataMaker');
var Legend = require('../legends/spectrumLegend');

var HeatmapChart = tui.util.defineClass(ChartBase, /** @lends HeatmapChart.prototype */ {
    /**
     *
     * className
     * @type {string}
     */
    className: 'tui-heatmap-chart',
    /**
     * Heatmap chart is a graphical representation of data where the individual values contained
     *      in a matrix are represented as colors.
     * @constructs HeatmapChart
     * @extends ChartBase
     * @mixes axisTypeMixer
     * @param {Array.<Array>} rawData raw data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(rawData, theme, options) {
        options.tooltip = options.tooltip || {};

        if (!options.tooltip.align) {
            options.tooltip.align = chartConst.TOOLTIP_DEFAULT_ALIGN_OPTION;
        }

        options.tooltip.grouped = false;

        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options,
            hasAxes: true,
            isVertical: true
        });

        this._addComponents(options.chartType);
    },

    /**
     * Make map for AxisScaleMaker of axes(xAxis, yAxis).
     * @returns {object}
     * @private
     */
    _makeAxisScaleMakerMap: function() {
        return {
            legend: this._createAxisScaleMaker({}, 'legend', null, this.chartType, {
                valueCount: chartConst.SPECTRUM_LEGEND_TICK_COUNT
            })
        };
    },

    /**
     * Add components.
     * @param {string} chartType chart type
     * @private
     */
    _addComponents: function() {
        this._addComponentsForAxisType({
            axis: [
                {
                    name: 'yAxis',
                    isLabel: true,
                    isVertical: true
                },
                {
                    name: 'xAxis',
                    isLabel: true
                }
            ],
            legend: {
                LegendClass: Legend
            },
            series: [
                {
                    name: 'heatmapSeries',
                    SeriesClass: Series
                }
            ],
            tooltip: true,
            customEvent: true
        });
    }
});

tui.util.extend(HeatmapChart.prototype, axisTypeMixer);

/**
 * Add data ratios for rendering graph.
 * @private
 * @override
 */
HeatmapChart.prototype._addDataRatios = function() {
    var limit = this._getAxisScaleMakerMap().legend.getLimit();

    this.dataProcessor.addDataRatios(limit, null, this.chartType);
};

/**
 * Make rendering data for delivery to each component.
 * @returns {object}
 * @private
 * @override
 */
HeatmapChart.prototype._makeRenderingData = function() {
    var data = axisTypeMixer._makeRenderingData.call(this);
    var seriesTheme = this.theme.series;
    var colorSpectrum = new ColorSpectrum(seriesTheme.startColor, seriesTheme.endColor);

    data.legend = {
        colorSpectrum: colorSpectrum,
        axesData: axisDataMaker.makeValueAxisData({
            axisScaleMaker: this._getAxisScaleMakerMap().legend,
            isVertical: true
        })
    };
    data.heatmapSeries.colorSpectrum = colorSpectrum;

    return data;
};

/**
 * Attach custom event between components.
 * @private
 * @override
 */
HeatmapChart.prototype._attachCustomEvent = function() {
    var customEvent = this.componentManager.get('customEvent');
    var heatmapSeries = this.componentManager.get('heatmapSeries');
    var legend = this.componentManager.get('legend');

    axisTypeMixer._attachCustomEvent.call(this);

    customEvent.on('showTooltip', heatmapSeries.onShowTooltip, heatmapSeries);
    customEvent.on('hideTooltip', legend.onHideWedge, legend);

    heatmapSeries.on('showWedge', legend.onShowWedge, legend);
};

module.exports = HeatmapChart;

},{"../const":31,"../helpers/axisDataMaker":54,"../legends/spectrumLegend":71,"../series/heatmapChartSeries":95,"./axisTypeMixer":7,"./chartBase":11,"./colorSpectrum":12}],18:[function(require,module,exports){
/**
 * @fileoverview Line and Area Combo chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var axisTypeMixer = require('./axisTypeMixer');
var autoTickMixer = require('./autoTickMixer');
var zoomMixer = require('./zoomMixer');
var addingDynamicDataMixer = require('./addingDynamicDataMixer');
var comboTypeMixer = require('./comboTypeMixer');
var verticalTypeComboMixer = require('./verticalTypeComboMixer');

var LineAreaComboChart = tui.util.defineClass(ChartBase, /** @lends LineAreaComboChart.prototype */ {
    /**
     * className
     * @type {string}
     */
    className: 'tui-combo-chart',
    /**
     * Line and Area Combo chart.
     * @constructs LineAreaComboChart
     * @extends ChartBase
     * @param {Array.<Array>} rawData - raw data
     * @param {object} theme - chart theme
     * @param {object} options - chart options
     */
    init: function(rawData, theme, options) {
        this._initForVerticalTypeCombo(rawData, theme, options);
        this._initForAutoTickInterval();
        this._initForAddingData();
    },

    /**
     * On change selected legend.
     * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
     */
    onChangeCheckedLegends: function(checkedLegends) {
        var zoomedRawData = this.dataProcessor.getZoomedRawData();
        var rawData = this._filterCheckedRawData(zoomedRawData, checkedLegends);
        var chartTypesMap = this._makeChartTypesMap(rawData.series, this.options.yAxis);

        tui.util.extend(this, chartTypesMap);

        this._changeCheckedLegends(checkedLegends, rawData, chartTypesMap);
    }
});

tui.util.extend(LineAreaComboChart.prototype,
    axisTypeMixer, autoTickMixer, zoomMixer, addingDynamicDataMixer, comboTypeMixer, verticalTypeComboMixer);

module.exports = LineAreaComboChart;

},{"./addingDynamicDataMixer":4,"./autoTickMixer":6,"./axisTypeMixer":7,"./chartBase":11,"./comboTypeMixer":15,"./verticalTypeComboMixer":28,"./zoomMixer":29}],19:[function(require,module,exports){
/**
 * @fileoverview Line chart
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var lineTypeMixer = require('./lineTypeMixer');
var autoTickMixer = require('./autoTickMixer');
var zoomMixer = require('./zoomMixer');
var axisTypeMixer = require('./axisTypeMixer');
var addingDynamicDataMixer = require('./addingDynamicDataMixer');
var Series = require('../series/lineChartSeries');

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
     * @mixes lineTypeMixer
     */
    init: function() {
        this._lineTypeInit.apply(this, arguments);
        this._initForAutoTickInterval();
        this._initForAddingData();
    },

    /**
     * On change checked legend.
     * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
     * @param {?object} rawData rawData
     * @param {?object} boundsParams addition params for calculating bounds
     * @override
     */
    onChangeCheckedLegends: function(checkedLegends, rawData, boundsParams) {
        this._changeCheckedLegends(checkedLegends, rawData, boundsParams);
    }
});

tui.util.extend(LineChart.prototype,
    axisTypeMixer, lineTypeMixer, autoTickMixer, zoomMixer, addingDynamicDataMixer);

module.exports = LineChart;

},{"../series/lineChartSeries":96,"./addingDynamicDataMixer":4,"./autoTickMixer":6,"./axisTypeMixer":7,"./chartBase":11,"./lineTypeMixer":20,"./zoomMixer":29}],20:[function(require,module,exports){
/**
 * @fileoverview lineTypeMixer is mixer of line type chart(line, area).
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var AreaTypeCustomEvent = require('../customEvents/areaTypeCustomEvent');

/**
 * lineTypeMixer is mixer of line type chart(line, area).
 * @mixin
 */
var lineTypeMixer = {
    /**
     * Initialize line type chart.
     * @param {Array.<Array>} rawData raw data
     * @param {object} theme chart theme
     * @param {object} options chart options
     * @private
     */
    _lineTypeInit: function(rawData, theme, options) {
        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options,
            hasAxes: true,
            isVertical: true
        });

        this._addComponents(options.chartType);
    },

    /**
     * Make map for AxisScaleMaker of axes(xAxis, yAxis).
     * @returns {Object.<string, AxisScaleMaker>}
     * @private
     */
    _makeAxisScaleMakerMap: function() {
        return {
            yAxis: this._createAxisScaleMaker(this.options.yAxis, 'yAxis')
        };
    },

    /**
     * Add custom event component for normal tooltip.
     * @private
     */
    _addCustomEventComponentForNormalTooltip: function() {
        this.componentManager.register('customEvent', AreaTypeCustomEvent, {
            chartType: this.chartType,
            isVertical: this.isVertical,
            zoomable: tui.util.pick(this.options.series, 'zoomable')
        });
    },

    /**
     * Add components
     * @param {string} chartType chart type
     * @private
     */
    _addComponents: function(chartType) {
        this._addComponentsForAxisType({
            chartType: chartType,
            axis: [
                {
                    name: 'yAxis',
                    isVertical: true
                },
                {
                    name: 'xAxis',
                    isLabel: true
                }
            ],
            series: [
                {
                    name: this.options.chartType + 'Series',
                    SeriesClass: this.Series
                }
            ],
            plot: true
        });
    }
};

module.exports = lineTypeMixer;

},{"../customEvents/areaTypeCustomEvent":32,"./chartBase":11}],21:[function(require,module,exports){
/**
 * @fileoverview Map chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var chartConst = require('../const');
var MapChartMapModel = require('./mapChartMapModel');
var ColorSpectrum = require('./colorSpectrum');
var MapChartDataProcessor = require('../dataModels/mapChartDataProcessor');
var axisDataMaker = require('../helpers/axisDataMaker');
var Series = require('../series/mapChartSeries');
var Zoom = require('../series/zoom');
var Legend = require('../legends/spectrumLegend');
var MapChartTooltip = require('../tooltips/mapChartTooltip');
var mapChartCustomEvent = require('../customEvents/mapChartCustomEvent');

var MapChart = tui.util.defineClass(ChartBase, /** @lends MapChart.prototype */ {
    /**
     * Map chart.
     * @constructs MapChart
     * @extends ChartBase
     * @param {Array.<Array>} rawData raw data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(rawData, theme, options) {
        /**
         * class name
         * @type {string}
         */
        this.className = 'tui-map-chart';

        options.tooltip = options.tooltip || {};
        options.legend = options.legend || {};

        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options,
            DataProcessor: MapChartDataProcessor
        });

        this._addComponents(options);
    },

    /**
     * Add components
     * @param {object} options chart options
     * @private
     */
    _addComponents: function(options) {
        options.legend = options.legend || {};

        this.componentManager.register('legend', Legend);

        this.componentManager.register('tooltip', MapChartTooltip, this._makeTooltipData());

        this.componentManager.register('mapSeries', Series, {
            libType: options.libType,
            chartType: options.chartType,
            componentType: 'series',
            userEvent: this.userEvent
        });

        this.componentManager.register('zoom', Zoom);

        this.componentManager.register('customEvent', mapChartCustomEvent, {
            chartType: this.chartType
        });
    },

    /**
     * Make axes data
     * @returns {object} axes data
     * @private
     */
    _makeAxesData: function() {
        var axisScaleMaker = this._createAxisScaleMaker({}, 'legend', null, this.chartType, {
            valueCount: chartConst.SPECTRUM_LEGEND_TICK_COUNT
        });

        return axisDataMaker.makeValueAxisData({
            axisScaleMaker: axisScaleMaker,
            isVertical: true
        });
    },

    /**
     * Add data ratios.
     * @private
     * @override
     */
    _addDataRatios: function() {
        var axesData = this.boundsMaker.getAxesData();

        this.dataProcessor.addDataRatios(axesData.limit);
    },

    /**
     * Make rendering data for map chart.
     * @returns {object} data for rendering
     * @private
     * @override
     */
    _makeRenderingData: function() {
        var axesData = this.boundsMaker.getAxesData();
        var seriesTheme = this.theme.series;
        var colorSpectrum = new ColorSpectrum(seriesTheme.startColor, seriesTheme.endColor);
        var mapModel = new MapChartMapModel(this.dataProcessor, this.options.map);

        return {
            legend: {
                colorSpectrum: colorSpectrum,
                axesData: axesData
            },
            mapSeries: {
                mapModel: mapModel,
                colorSpectrum: colorSpectrum
            },
            tooltip: {
                mapModel: mapModel
            }
        };
    },

    /**
     * Attach custom evnet.
     * @private
     * @override
     */
    _attachCustomEvent: function() {
        var customEvent = this.componentManager.get('customEvent'),
            mapSeries = this.componentManager.get('mapSeries'),
            legend = this.componentManager.get('legend'),
            tooltip = this.componentManager.get('tooltip'),
            zoom = this.componentManager.get('zoom');

        customEvent.on({
            clickMapSeries: mapSeries.onClickSeries,
            moveMapSeries: mapSeries.onMoveSeries,
            dragStartMapSeries: mapSeries.onDragStartSeries,
            dragMapSeries: mapSeries.onDragSeries,
            dragEndMapSeries: mapSeries.onDragEndSeries,
            wheel: tui.util.bind(zoom.onWheel, zoom)
        }, mapSeries);

        mapSeries.on({
            showWedge: legend.onShowWedge,
            hideWedge: legend.onHideWedge
        }, legend);

        mapSeries.on({
            showTooltip: tooltip.onShow,
            hideTooltip: tooltip.onHide,
            showTooltipContainer: tooltip.onShowTooltipContainer,
            hideTooltipContainer: tooltip.onHideTooltipContainer
        }, tooltip);

        zoom.on('zoom', mapSeries.onZoom, mapSeries, mapSeries);
    }
});

module.exports = MapChart;

},{"../const":31,"../customEvents/mapChartCustomEvent":38,"../dataModels/mapChartDataProcessor":43,"../helpers/axisDataMaker":54,"../legends/spectrumLegend":71,"../series/mapChartSeries":98,"../series/zoom":106,"../tooltips/mapChartTooltip":110,"./chartBase":11,"./colorSpectrum":12,"./mapChartMapModel":22}],22:[function(require,module,exports){
/**
 * @fileoverview MapChartMapModel is map model of map chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const');

var MapChartMapModel = tui.util.defineClass(/** @lends MapChartMapModel.prototype */ {
    /**
     * MapChartMapModel is map model of map chart.
     * @constructs MapChartMapModel
     * @param {MapChartDataProcessor} dataProcessor Map chart data processor
     * @param {Array.<{name: string, path: string, labelCoordinate: ?{x: number, y:number}}>} rawMapData raw map data
     */
    init: function(dataProcessor, rawMapData) {
        /**
         * Command function map.
         * @type {{
         *      M: MapChartMapModel._makeCoordinate, m: MapChartMapModel._makeCoordinateFromRelativeCoordinate,
         *      L: MapChartMapModel._makeCoordinate, l: MapChartMapModel._makeCoordinateFromRelativeCoordinate,
         *      H: MapChartMapModel._makeXCoordinate, h: MapChartMapModel._makeXCoordinateFroRelativeCoordinate,
         *      V: MapChartMapModel._makeYCoordinate, v: MapChartMapModel._makeYCoordinateFromRelativeCoordinate
         * }}
         */
        this.commandFuncMap = {
            M: tui.util.bind(this._makeCoordinate, this),
            m: tui.util.bind(this._makeCoordinateFromRelativeCoordinate, this),
            L: tui.util.bind(this._makeCoordinate, this),
            l: tui.util.bind(this._makeCoordinateFromRelativeCoordinate, this),
            H: tui.util.bind(this._makeXCoordinate, this),
            h: tui.util.bind(this._makeXCoordinateFroRelativeCoordinate, this),
            V: tui.util.bind(this._makeYCoordinate, this),
            v: tui.util.bind(this._makeYCoordinateFromRelativeCoordinate, this)
        };

        /**
         * Ignore command map.
         * @type {{Z: boolean, z: boolean}}
         */
        this.ignoreCommandMap = {
            Z: true,
            z: true
        };

        /**
         * Map data.
         * @type {Array}
         */
        this.mapData = [];

        /**
         * Map dimension
         * @type {{width: number, height: number}}
         */
        this.mapDimension = null;

        /**
         * Map chart data processor.
         * @type {MapChartDataProcessor}
         */
        this.dataProcessor = dataProcessor;

        this._createMapData(rawMapData);
    },

    /**
     * Split coordinate string.
     * @param {string} coordinateStr coordinate string
     * @returns {{x: number, y: number}} coordinate map
     * @private
     */
    _splitCoordinate: function(coordinateStr) {
        var coordinates = coordinateStr.split(','),
            result = {
                x: parseFloat(coordinates[0])
            };

        if (coordinates[1]) {
            result.y = parseFloat(coordinates[1]);
        }

        return result;
    },

    /**
     * Make coordinate
     * @param {string} coordinateStr coordinate
     * @returns {{x: number, y: number}} coordinate
     * @private
     */
    _makeCoordinate: function(coordinateStr) {
        return this._splitCoordinate(coordinateStr);
    },

    /**
     * Make coordinate from relative coordinate.
     * @param {string} coordinateStr coordinate
     * @param {{x: number, y: number}} prevCoordinate previous coordinate
     * @returns {{x: number, y: number}} coordinate
     * @private
     */
    _makeCoordinateFromRelativeCoordinate: function(coordinateStr, prevCoordinate) {
        var coordinate = this._splitCoordinate(coordinateStr);

        return {
            x: coordinate.x + prevCoordinate.x,
            y: coordinate.y + prevCoordinate.y
        };
    },

    /**
     * Make x coordinate.
     * @param {string} coordinateStr coordinate
     * @returns {{x: number}} x coordinate
     * @private
     */
    _makeXCoordinate: function(coordinateStr) {
        var coordinate = this._splitCoordinate(coordinateStr);

        return {
            x: coordinate.x
        };
    },

    /**
     * Make x coordinate from relative coordinate.
     * @param {string} coordinateStr coordinate
     * @param {{x: number, y: number}} prevCoordinate previous coordinate
     * @returns {{x: number}} x coordinate
     * @private
     */
    _makeXCoordinateFroRelativeCoordinate: function(coordinateStr, prevCoordinate) {
        var coordinate = this._splitCoordinate(coordinateStr);

        return {
            x: coordinate.x + prevCoordinate.x
        };
    },

    /**
     * Make y coordinate.
     * @param {string} coordinateStr coordinate
     * @returns {{y: number}} y coordinate
     * @private
     */
    _makeYCoordinate: function(coordinateStr) {
        var coordinate = this._splitCoordinate(coordinateStr);

        return {
            y: coordinate.x
        };
    },

    /**
     * Make y coordinate from relative coordinate.
     * @param {string} coordinateStr coordinate
     * @param {{x: number, y: number}} prevCoordinate previous coordinate
     * @returns {{y: number}} y coordinate
     * @private
     */
    _makeYCoordinateFromRelativeCoordinate: function(coordinateStr, prevCoordinate) {
        var coordinate = this._splitCoordinate(coordinateStr);

        return {
            y: coordinate.x + prevCoordinate.y
        };
    },

    /**
     * Split path.
     * @param {string} path path
     * @returns {Array.<{type: string, coordinate: string}>} splitted path data
     * @private
     */
    _splitPath: function(path) {
        var i = 0,
            len = path.length,
            pathData = [],
            coordinate = '',
            chr, commandType;

        for (; i < len; i += 1) {
            chr = path.charAt(i);
            if (this.commandFuncMap[chr]) {
                if (commandType && coordinate) {
                    pathData.push({
                        type: commandType,
                        coordinate: coordinate
                    });
                }
                commandType = chr;
                coordinate = '';
            } else if (!this.ignoreCommandMap[chr]) {
                coordinate += chr;
            }
        }

        if (commandType && coordinate) {
            pathData.push({
                type: commandType,
                coordinate: coordinate
            });
        }

        return pathData;
    },

    /**
     * Make coordinates from path.
     * @param {string} path path
     * @returns {Array.<{x: number, y: number}>} coordinates
     * @private
     */
    _makeCoordinatesFromPath: function(path) {
        var self = this,
            pathData = this._splitPath(path),
            prevCoordinate = {
                x: 0,
                y: 0
            };

        return tui.util.map(pathData, function(datum) {
            var commandFunc = self.commandFuncMap[datum.type],
                coordinate = commandFunc(datum.coordinate, prevCoordinate);

            tui.util.extend(prevCoordinate, coordinate);

            return coordinate;
        });
    },

    /**
     * Find bound from coordinates.
     * @param {Array.<{left: number, top: number}>} coordinates coordinates
     * @returns {{dimension: {width: number, height: number}, position: {top: number, left: number}}} bound
     * @private
     */
    _findBoundFromCoordinates: function(coordinates) {
        var xs = tui.util.filter(tui.util.pluck(coordinates, 'x'), function(x) {
                return !tui.util.isUndefined(x);
            }),
            ys = tui.util.filter(tui.util.pluck(coordinates, 'y'), function(y) {
                return !tui.util.isUndefined(y);
            }),
            maxLeft = tui.util.max(xs),
            minLeft = tui.util.min(xs),
            maxTop = tui.util.max(ys),
            minTop = tui.util.min(ys);

        return {
            dimension: {
                width: maxLeft - minLeft,
                height: maxTop - minTop
            },
            position: {
                left: minLeft,
                top: minTop
            }
        };
    },

    /**
     * Make label position.
     * @param {{dimension: {width: number, height: number}, position: {top: number, left: number}}} bound bound
     * @param {?{left: number, top: number}} positionRatio position ratio
     * @returns {{left: number, top: number}} label position
     * @private
     */
    _makeLabelPosition: function(bound, positionRatio) {
        positionRatio = positionRatio || chartConst.MAP_CHART_LABEL_DEFAULT_POSITION_RATIO;

        return {
            left: bound.position.left + (bound.dimension.width * positionRatio.x),
            top: bound.position.top + (bound.dimension.height * positionRatio.y)
        };
    },

    /**
     * Create map data.
     * @param {Array.<{name: string, path: string, labelCoordinate: ?{x: number, y:number}}>} rawMapData raw map data
     * @private
     */
    _createMapData: function(rawMapData) {
        var self = this;

        this.mapData = tui.util.map(rawMapData, function(datum) {
            var coordinate = self._makeCoordinatesFromPath(datum.path),
                bound = self._findBoundFromCoordinates(coordinate),
                userData = self.dataProcessor.getValueMapDatum(datum.code),
                name, labelCoordinate, label, ratio, resultData;

            if (userData) {
                label = userData.label;
                ratio = userData.ratio;
                name = userData.name || datum.name;
                labelCoordinate = userData.labelCoordinate || datum.labelCoordinate;
            }

            resultData = {
                code: datum.code,
                name: name,
                path: datum.path,
                bound: bound,
                labelPosition: self._makeLabelPosition(bound, labelCoordinate)
            };

            if (label) {
                resultData.label = label;
            }

            if (ratio) {
                resultData.ratio = ratio;
            }

            return resultData;
        });
    },

    getMapData: function() {
        return this.mapData;
    },

    getDatum: function(index) {
        return this.mapData[index];
    },

    /**
     * Get label data.
     * @param {number} ratio ratio
     * @returns {Array.<{name: string, bound: {dimension: {width: number, height: number},
     *          position: {top: number, left: number}}, labelPosition: {width: number, height: number}}>} map data
     */
    getLabelData: function(ratio) {
        var self = this,
            labelData = tui.util.filter(this.mapData, function(datum) {
                return self.dataProcessor.getValueMapDatum(datum.code);
            });

        return tui.util.map(labelData, function(datum) {
            return {
                name: datum.name,
                labelPosition: {
                    left: datum.labelPosition.left * ratio,
                    top: datum.labelPosition.top * ratio
                }
            };
        });
    },

    /**
     * Make map dimension
     * @returns {{width: number, height: number}} map dimension
     * @private
     */
    _makeMapDimension: function() {
        var mapData = this.mapData,
            lefts = tui.util.map(mapData, function(datum) {
                return datum.bound.position.left;
            }),
            rights = tui.util.map(mapData, function(datum) {
                return datum.bound.position.left + datum.bound.dimension.width;
            }),
            tops = tui.util.map(mapData, function(datum) {
                return datum.bound.position.top;
            }),
            bottoms = tui.util.map(mapData, function(datum) {
                return datum.bound.position.top + datum.bound.dimension.height;
            });

        return {
            width: tui.util.max(rights) - tui.util.min(lefts),
            height: tui.util.max(bottoms) - tui.util.min(tops)
        };
    },

    /**
     * Get map dimension.
     * @returns {{width: number, height: number}} map dimension
     */
    getMapDimension: function() {
        if (!this.mapDimension) {
            this.mapDimension = this._makeMapDimension();
        }

        return this.mapDimension;
    }
});

module.exports = MapChartMapModel;

},{"../const":31}],23:[function(require,module,exports){
/**
 * @fileoverview Pie chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var pieTypeMixer = require('./pieTypeMixer');
var chartConst = require('../const');

var PieChart = tui.util.defineClass(ChartBase, /** @lends PieChart.prototype */ {
    /**
     * className
     * @type {string}
     */
    className: 'tui-pie-chart',

    /**
     * Pie chart.
     * @constructs PieChart
     * @extends ChartBase
     * @param {Array.<Array>} rawData raw data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(rawData, theme, options) {
        options.tooltip = options.tooltip || {};

        if (!options.tooltip.align) {
            options.tooltip.align = chartConst.TOOLTIP_DEFAULT_ALIGN_OPTION;
        }

        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options
        });

        this._addComponents();
    },

    /**
     * Add components
     * @private
     */
    _addComponents: function() {
        this._addLegendComponent();
        this._addTooltipComponent();
        this._addSeriesComponents([{
            name: 'pieSeries',
            additionalParams: {
                chartType: this.chartType
            }
        }]);
        this._addCustomEventComponent();
    },

    /**
     * Add data ratios.
     * @private
     * @override
     */
    _addDataRatios: function() {
        this.dataProcessor.addDataRatiosOfPieChart(this.chartType);
    },

    /**
     * Send series data.
     * @private
     * @override
     */
    _sendSeriesData: function() {
        ChartBase.prototype._sendSeriesData.call(this, chartConst.CHART_TYPE_PIE);
    },

    /**
     * Attach custom event.
     * @private
     * @override
     */
    _attachCustomEvent: function() {
        var pieSeries = this.componentManager.get('pieSeries');

        this._attachCustomEventForPieTypeChart([pieSeries]);
        ChartBase.prototype._attachCustomEvent.call(this);
    }
});

tui.util.extend(PieChart.prototype, pieTypeMixer);

module.exports = PieChart;

},{"../const":31,"./chartBase":11,"./pieTypeMixer":25}],24:[function(require,module,exports){
/**
 * @fileoverview Pie and Donut Combo chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var pieTypeMixer = require('./pieTypeMixer');
var comboTypeMixer = require('./comboTypeMixer');
var predicate = require('../helpers/predicate');

var PieDonutComboChart = tui.util.defineClass(ChartBase, /** @lends PieDonutComboChart.prototype */ {
    /**
     * className
     * @type {string}
     */
    className: 'tui-combo-chart',

    /**
     * Pie and Donut Combo chart.
     * @constructs PieDonutComboChart
     * @extends ChartBase
     * @param {Array.<Array>} rawData raw data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(rawData, theme, options) {
        /**
         * chart types.
         * @type {Array.<string>}
         */
        this.chartTypes = tui.util.keys(rawData.series).sort();

        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options,
            isVertical: true,
            seriesNames: this.chartTypes
        });

        this._addComponents();
    },

    /**
     * Make data for adding series component.
     * @returns {Array.<object>}
     * @private
     */
    _makeDataForAddingSeriesComponent: function() {
        var seriesNames = this.chartTypes;
        var optionsMap = this._makeOptionsMap(this.chartTypes);
        var themeMap = this._makeThemeMap(seriesNames);
        var dataProcessor = this.dataProcessor;
        var isShowOuterLabel = tui.util.any(optionsMap, predicate.isShowOuterLabel);
        var seriesData = tui.util.map(seriesNames, function(seriesName) {
            var chartType = dataProcessor.findChartType(seriesName);
            var additionalParams = {
                chartType: chartType,
                seriesName: seriesName,
                options: optionsMap[seriesName],
                isShowOuterLabel: isShowOuterLabel,
                isCombo: true,
                theme: themeMap[seriesName]
            };

            return {
                name: seriesName + 'Series',
                additionalParams: additionalParams
            };
        });

        return seriesData;
    },

    /**
     * Add components
     * @private
     */
    _addComponents: function() {
        this._addLegendComponent(this.chartTypes);
        this._addTooltipComponent();
        this._addSeriesComponents(this._makeDataForAddingSeriesComponent());
        this._addCustomEventComponent();
    },

    /**
     * Add data ratios.
     * @private
     * @override
     */
    _addDataRatios: function() {
        var self = this;
        var chartTypes = this.chartTypes || [this.chartType];

        tui.util.forEachArray(chartTypes, function(chartType) {
            self.dataProcessor.addDataRatiosOfPieChart(chartType);
        });
    },

    /**
     * Add custom event.
     * @private
     * @override
     */
    _attachCustomEvent: function() {
        var componentManager = this.componentManager;
        var serieses;

        ChartBase.prototype._attachCustomEvent.call(this);

        serieses = tui.util.map(this.chartTypes, function(seriesName) {
            return componentManager.get(seriesName + 'Series');
        });
        this._attachCustomEventForPieTypeChart(serieses);
    },

    /**
     * On change selected legend.
     * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
     * @override
     */
    onChangeCheckedLegends: function(checkedLegends) {
        var originalRawData = this.dataProcessor.getOriginalRawData();
        var rawData = this._filterCheckedRawData(originalRawData, checkedLegends);

        ChartBase.prototype.onChangeCheckedLegends.call(this, checkedLegends, rawData, {
            seriesNames: this.chartTypes
        });
    }
});

tui.util.extend(PieDonutComboChart.prototype, pieTypeMixer, comboTypeMixer);

module.exports = PieDonutComboChart;

},{"../helpers/predicate":61,"./chartBase":11,"./comboTypeMixer":15,"./pieTypeMixer":25}],25:[function(require,module,exports){
/**
 * @fileoverview pieTypeMixer is mixer of pie type chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var renderUtil = require('../helpers/renderUtil');
var Legend = require('../legends/legend');
var Tooltip = require('../tooltips/tooltip');
var PieChartSeries = require('../series/pieChartSeries');
var SimpleCustomEvent = require('../customEvents/simpleCustomEvent');

/**
 * pieTypeMixer is mixer of pie type chart.
 * @mixin
 */
var pieTypeMixer = {
    /**
     * Add legend component.
     * @param {Array.<string>} [chartTypes] - chart types
     * @private
     */
    _addLegendComponent: function(chartTypes) {
        var legendOption = this.options.legend || {};

        if (legendOption.visible) {
            this.componentManager.register('legend', Legend, {
                seriesNames: chartTypes,
                chartType: this.chartType,
                userEvent: this.userEvent
            });
        }
    },

    /**
     * Add tooltip component.
     * @private
     */
    _addTooltipComponent: function() {
        this.componentManager.register('tooltip', Tooltip, this._makeTooltipData());
    },

    /**
     * Add series components.
     * @param {Array.<{name: string, additionalParams: ?object}>} seriesData - data for adding series component
     * @private
     */
    _addSeriesComponents: function(seriesData) {
        var componentManager = this.componentManager;
        var seriesBaseParams = {
            libType: this.options.libType,
            componentType: 'series',
            chartBackground: this.theme.chart.background,
            userEvent: this.userEvent
        };

        tui.util.forEach(seriesData, function(seriesDatum) {
            var seriesParams = tui.util.extend(seriesBaseParams, seriesDatum.additionalParams);

            componentManager.register(seriesDatum.name, PieChartSeries, seriesParams);
        });
    },

    /**
     * Add custom event component.
     * @private
     * @override
     */
    _addCustomEventComponent: function() {
        this.componentManager.register('customEvent', SimpleCustomEvent, {
            chartType: this.chartType
        });
    },

    /**
     * Add custom event.
     * @param {Array.<object>} seriesComponents - series components
     * @private
     */
    _attachCustomEventForPieTypeChart: function(seriesComponents) {
        var clickEventName = renderUtil.makeCustomEventName('click', this.chartType, 'series');
        var moveEventName = renderUtil.makeCustomEventName('move', this.chartType, 'series');
        var customEvent = this.componentManager.get('customEvent');
        var tooltip = this.componentManager.get('tooltip');
        var eventMap = {};

        tui.util.forEachArray(seriesComponents, function(series) {
            eventMap[clickEventName] = series.onClickSeries;
            eventMap[moveEventName] = series.onMoveSeries;
            customEvent.on(eventMap, series);

            series.on({
                showTooltip: tooltip.onShow,
                hideTooltip: tooltip.onHide,
                showTooltipContainer: tooltip.onShowTooltipContainer,
                hideTooltipContainer: tooltip.onHideTooltipContainer
            }, tooltip);
        });
    }
};

module.exports = pieTypeMixer;

},{"../customEvents/simpleCustomEvent":39,"../helpers/renderUtil":63,"../legends/legend":67,"../series/pieChartSeries":99,"../tooltips/tooltip":112}],26:[function(require,module,exports){
/**
 * @fileoverview Scatter chart is a type of plot or mathematical diagram using Cartesian coordinates
 *                  to display values for typically two variables for a set of data.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var chartConst = require('../const');
var Series = require('../series/scatterChartSeries');
var axisTypeMixer = require('./axisTypeMixer');
var SimpleCustomEvent = require('../customEvents/simpleCustomEvent');

var ScatterChart = tui.util.defineClass(ChartBase, /** @lends ScatterChart.prototype */ {
    /**
     * className
     * @type {string}
     */
    className: 'tui-scatter-chart',
    /**
     * Scatter chart is a type of plot or mathematical diagram using Cartesian coordinates
     *  to display values for typically two variables for a set of data.
     * @constructs ScatterChart
     * @extends ChartBase
     * @mixes axisTypeMixer
     * @param {Array.<Array>} rawData raw data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(rawData, theme, options) {
        options.tooltip = options.tooltip || {};

        this.axisScaleMakerMap = null;

        if (!options.tooltip.align) {
            options.tooltip.align = chartConst.TOOLTIP_DEFAULT_ALIGN_OPTION;
        }

        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options,
            hasAxes: true
        });

        this._addComponents(options.chartType);
    },

    /**
     * Make map for AxisScaleMaker of axes(xAxis, yAxis).
     * @returns {Object.<string, AxisScaleMaker>}
     * @private
     */
    _makeAxisScaleMakerMap: function() {
        var options = this.options;

        return {
            xAxis: this._createAxisScaleMaker(options.xAxis, 'xAxis', 'x'),
            yAxis: this._createAxisScaleMaker(options.yAxis, 'yAxis', 'y')
        };
    },

    /**
     * Add components
     * @param {string} chartType chart type
     * @private
     */
    _addComponents: function(chartType) {
        this._addComponentsForAxisType({
            chartType: chartType,
            axis: [
                {
                    name: 'yAxis',
                    isVertical: true
                },
                {
                    name: 'xAxis'
                }
            ],
            series: [
                {
                    name: 'scatterSeries',
                    SeriesClass: Series
                }
            ],
            plot: true
        });
    }
});

tui.util.extend(ScatterChart.prototype, axisTypeMixer);

/**
 * Add data ratios.
 * @private
 * @override
 */
ScatterChart.prototype._addDataRatios = function() {
    var scaleMakerMap = this._getAxisScaleMakerMap();

    this.dataProcessor.addDataRatiosForCoordinateType(this.chartType, {
        x: scaleMakerMap.xAxis.getLimit(),
        y: scaleMakerMap.yAxis.getLimit()
    }, false);
};

/**
 * Add custom event component for normal tooltip.
 * @private
 */
ScatterChart.prototype._attachCustomEvent = function() {
    var componentManager = this.componentManager;
    var customEvent = componentManager.get('customEvent');
    var scatterSeries = componentManager.get('scatterSeries');
    var tooltip = componentManager.get('tooltip');

    axisTypeMixer._attachCustomEvent.call(this);

    customEvent.on({
        clickScatterSeries: scatterSeries.onClickSeries,
        moveScatterSeries: scatterSeries.onMoveSeries
    }, scatterSeries);

    scatterSeries.on({
        showTooltip: tooltip.onShow,
        hideTooltip: tooltip.onHide,
        showTooltipContainer: tooltip.onShowTooltipContainer,
        hideTooltipContainer: tooltip.onHideTooltipContainer
    }, tooltip);
};

/**
 * Add custom event component.
 * @private
 */
ScatterChart.prototype._addCustomEventComponent = function() {
    this.componentManager.register('customEvent', SimpleCustomEvent, {
        chartType: this.chartType
    });
};

module.exports = ScatterChart;

},{"../const":31,"../customEvents/simpleCustomEvent":39,"../series/scatterChartSeries":101,"./axisTypeMixer":7,"./chartBase":11}],27:[function(require,module,exports){
/**
 * @fileoverview Treemap chart is graphical representation of hierarchical data by using rectangles.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var ColorSpectrum = require('./colorSpectrum');
var Series = require('../series/treemapChartSeries');
var Tooltip = require('../tooltips/tooltip');
var Legend = require('../legends/spectrumLegend');
var axisDataMaker = require('../helpers/axisDataMaker');
var BoundsTypeCustomEvent = require('../customEvents/boundsTypeCustomEvent');
var chartConst = require('../const');

var TreemapChart = tui.util.defineClass(ChartBase, /** @lends TreemapChart.prototype */ {
    /**
     * className
     * @type {string}
     */
    className: 'tui-treemap-chart',
    /**
     * Treemap chart is graphical representation of hierarchical data by using rectangles.
     * @constructs TreemapChart
     * @extends ChartBase
     * @param {Array.<Array>} rawData raw data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(rawData, theme, options) {
        options.series = options.series || {};
        options.tooltip = options.tooltip || {};
        options.tooltip.grouped = false;

        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options,
            hasAxes: false,
            isVertical: true
        });

        /**
         * scale information like limit, step for rendering legend
         * @type {{limit: {min: number, max: number}, step: number}}
         */
        this.lengedScale = null;

        this._addComponents(options.chartType);
    },

    /**
     * Add components.
     * @private
     */
    _addComponents: function() {
        var useColorValue = tui.util.pick(this.options, 'series', 'useColorValue');

        this.componentManager.register('series', Series, {
            chartBackground: this.theme.chart.background,
            chartType: this.chartType,
            userEvent: this.userEvent
        });

        this.componentManager.register('tooltip', Tooltip, tui.util.extend({
            labelTheme: tui.util.pick(this.theme, 'series', 'label')
        }, this._makeTooltipData()));

        if (useColorValue) {
            this.componentManager.register('legend', Legend, {
                chartType: this.chartType,
                userEvent: this.userEvent
            });
        }

        this.componentManager.register('customEvent', BoundsTypeCustomEvent, {
            chartType: this.chartType,
            isVertical: this.isVertical
        });
    },

    /**
     * Get legend scale
     * @returns {Object.<string, AxisScaleMaker>}
     * @private
     */
    _getLegendScale: function() {
        if (!this.lengedScale) {
            this.lengedScale = this._createAxisScaleMaker({}, 'legend', null, this.chartType, {
                valueCount: chartConst.SPECTRUM_LEGEND_TICK_COUNT
            });
        }

        return this.lengedScale;
    },

    /**
     * Add data ratios to dataProcessor for rendering graph.
     * @private
     * @override
     */
    _addDataRatios: function() {
        var limit = this._getLegendScale().getLimit();

        this.dataProcessor.addDataRatiosForTreemapChart(limit, this.chartType);
    },

    /**
     * Make rendering data for delivery to each component.
     * @returns {object}
     * @private
     * @override
     */
    _makeRenderingData: function() {
        var data = {};
        var seriesTheme = this.theme.series;
        var useColorValue = tui.util.pick(this.options, 'series', 'useColorValue');
        var colorSpectrum = useColorValue ? (new ColorSpectrum(seriesTheme.startColor, seriesTheme.endColor)) : null;

        data.legend = {
            colorSpectrum: colorSpectrum,
            axesData: axisDataMaker.makeValueAxisData({
                axisScaleMaker: this._getLegendScale(),
                isVertical: true
            })
        };
        data.series = {
            colorSpectrum: colorSpectrum
        };

        return data;
    },

    /**
     * Attach custom event.
     * @private
     * @override
     */
    _attachCustomEvent: function() {
        var series = this.componentManager.get('series');
        var customEvent = this.componentManager.get('customEvent');
        var tooltip = this.componentManager.get('tooltip');
        var legend = this.componentManager.get('legend');

        ChartBase.prototype._attachCustomEvent.call(this);

        customEvent.on('showTooltip', tooltip.onShow, tooltip);
        customEvent.on('hideTooltip', tooltip.onHide, tooltip);

        tooltip.on('showTreemapAnimation', series.onShowAnimation, series);
        tooltip.on('hideTreemapAnimation', series.onHideAnimation, series);

        series.on('afterZoom', customEvent.onAfterZoom, customEvent);

        if (legend) {
            customEvent.on('showTooltip', series.onShowTooltip, series);
            customEvent.on('hideTooltip', legend.onHideWedge, legend);

            series.on('showWedge', legend.onShowWedge, legend);
        }
    },

    /**
     * On zoom.
     * @param {number} index - index of target seriesItem
     */
    onZoom: function(index) {
        this._renderComponents({
            'series': {
                index: index
            }
        }, 'zoom');
        this._sendSeriesData();
    }
});

module.exports = TreemapChart;

},{"../const":31,"../customEvents/boundsTypeCustomEvent":35,"../helpers/axisDataMaker":54,"../legends/spectrumLegend":71,"../series/treemapChartSeries":105,"../tooltips/tooltip":112,"./chartBase":11,"./colorSpectrum":12}],28:[function(require,module,exports){
/**
 * @fileoverview Column and Line Combo chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var calculator = require('../helpers/calculator');
var renderUtil = require('../helpers/renderUtil');
var ChartBase = require('./chartBase');
var ColumnChartSeries = require('../series/columnChartSeries');
var LineChartSeries = require('../series/lineChartSeries');
var AreaChartSeries = require('../series/areaChartSeries');

var verticalTypeComboMixer = {
    /**
     * Column and Line Combo chart.
     * @constructs verticalTypeComboMixer
     * @extends ChartBase
     * @param {Array.<Array>} rawData raw data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    _initForVerticalTypeCombo: function(rawData, theme, options) {
        var chartTypesMap;

        chartTypesMap = this._makeChartTypesMap(rawData.series, options.yAxis, options.chartType);

        tui.util.extend(this, chartTypesMap);

        options.tooltip = options.tooltip || {};
        options.tooltip.grouped = true;

        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options,
            hasAxes: true,
            isVertical: true,
            seriesNames: chartTypesMap.seriesNames
        });

        /**
         * yAxis options map
         * @type {object}
         */
        this.yAxisOptionsMap = this._makeYAxisOptionsMap(chartTypesMap.chartTypes, options.yAxis);
        this._addComponents(chartTypesMap);
    },

    /**
     * Make yAxis options map.
     * @param {Array.<string>} chartTypes chart types
     * @param {?object} yAxisOptions yAxis options
     * @returns {{column: ?object, line: ?object}} options map
     * @private
     */
    _makeYAxisOptionsMap: function(chartTypes, yAxisOptions) {
        var optionsMap = {};
        yAxisOptions = yAxisOptions || {};
        tui.util.forEachArray(chartTypes, function(chartType, index) {
            optionsMap[chartType] = yAxisOptions[index] || yAxisOptions;
        });

        return optionsMap;
    },

    /**
     * Make chart types map.
     * @param {object} rawSeriesData raw series data
     * @param {object} yAxisOption option for y axis
     * @returns {object} chart types map
     * @private
     */
    _makeChartTypesMap: function(rawSeriesData, yAxisOption) {
        var seriesNames = tui.util.keys(rawSeriesData).sort();
        var optionChartTypes = this._getYAxisOptionChartTypes(seriesNames, yAxisOption);
        var chartTypes = optionChartTypes.length ? optionChartTypes : seriesNames;
        var validChartTypes = tui.util.filter(optionChartTypes, function(_chartType) {
            return rawSeriesData[_chartType].length;
        });
        var chartTypesMap;

        if (validChartTypes.length === 1) {
            chartTypesMap = {
                chartTypes: validChartTypes,
                seriesNames: validChartTypes,
                optionChartTypes: !optionChartTypes.length ? optionChartTypes : validChartTypes
            };
        } else {
            chartTypesMap = {
                chartTypes: chartTypes,
                seriesNames: seriesNames,
                optionChartTypes: optionChartTypes
            };
        }

        return chartTypesMap;
    },

    /**
     * Make data for adding series component.
     * @param {Array.<string>} seriesNames - series names
     * @returns {Array.<object>}
     * @private
     */
    _makeDataForAddingSeriesComponent: function(seriesNames) {
        var seriesClasses = {
            column: ColumnChartSeries,
            line: LineChartSeries,
            area: AreaChartSeries
        };
        var optionsMap = this._makeOptionsMap(seriesNames);
        var themeMap = this._makeThemeMap(seriesNames);
        var dataProcessor = this.dataProcessor;
        var serieses = tui.util.map(seriesNames, function(seriesName) {
            var chartType = dataProcessor.findChartType(seriesName);
            var data = {
                allowNegativeTooltip: true,
                chartType: chartType,
                seriesName: seriesName,
                options: optionsMap[seriesName],
                theme: themeMap[seriesName]
            };

            return {
                name: seriesName + 'Series',
                SeriesClass: seriesClasses[chartType],
                data: data
            };
        });

        return serieses;
    },

    /**
     * Add components
     * @param {object} chartTypesMap chart types map
     * @private
     */
    _addComponents: function(chartTypesMap) {
        var axes = [
            {
                name: 'yAxis',
                chartType: chartTypesMap.chartTypes[0],
                isVertical: true
            },
            {
                name: 'xAxis',
                isLabel: true
            }
        ];
        var serieses = this._makeDataForAddingSeriesComponent(chartTypesMap.seriesNames);

        if (chartTypesMap.optionChartTypes.length) {
            axes.push({
                name: 'rightYAxis',
                chartType: chartTypesMap.chartTypes[1],
                isVertical: true
            });
        }

        this._addComponentsForAxisType({
            chartType: this.options.chartType,
            seriesNames: chartTypesMap.seriesNames,
            axis: axes,
            series: serieses,
            plot: true
        });
    },

    /**
     * Get y axis option chart types.
     * @param {Array.<string>} chartTypes chart types
     * @param {object} yAxisOptions y axis options
     * @returns {Array.<string>} chart types
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
     * Create AxisScaleMake for y axis.
     * @param {number} index - index of this.chartTypes
     * @param {boolean} isSingleYAxis - whether single y axis or not.
     * @returns {AxisScaleMaker}
     * @private
     */
    _createYAxisScaleMaker: function(index, isSingleYAxis) {
        var chartType = this.chartTypes[index];
        var yAxisOption = this.yAxisOptionsMap[chartType];
        var additionalParams = {
            isSingleYAxis: !!isSingleYAxis
        };

        return this._createAxisScaleMaker(yAxisOption, 'yAxis', null, chartType, additionalParams);
    },

    /**
     * Make map for AxisScaleMaker of axes(xAxis, yAxis).
     * @returns {Object.<string, AxisScaleMaker>}
     * @private
     */
    _makeAxisScaleMakerMap: function() {
        var isSingleYAxis = this.optionChartTypes.length < 2;
        var axisScaleMakerMap = {
            yAxis: this._createYAxisScaleMaker(0, isSingleYAxis)
        };

        if (!isSingleYAxis) {
            axisScaleMakerMap.rightYAxis = this._createYAxisScaleMaker(1);
        }

        return axisScaleMakerMap;
    },

    /**
     * Increase yAxis tick count.
     * @param {number} increaseTickCount increase tick count
     * @param {object} yAxisData yAxis data
     * @private
     */
    _increaseYAxisTickCount: function(increaseTickCount, yAxisData) {
        var formatFunctions = this.dataProcessor.getFormatFunctions();
        var labels;

        yAxisData.limit.max += yAxisData.step * increaseTickCount;
        labels = calculator.makeLabelsFromLimit(yAxisData.limit, yAxisData.step);
        yAxisData.labels = renderUtil.formatValues(labels, formatFunctions, this.chartType, 'yAxis');
        yAxisData.tickCount += increaseTickCount;
        yAxisData.validTickCount += increaseTickCount;
    },

    /**
     * Update tick count to make the same tick count of y Axes(yAxis, rightYAxis).
     * @param {{yAxis: object, rightYAxis: object}} axesData - axesData
     * @private
     */
    _updateYAxisTickCount: function(axesData) {
        var yAxisData = axesData.yAxis;
        var rightYAxisData = axesData.rightYAxis;
        var tickCountDiff = rightYAxisData.tickCount - yAxisData.tickCount;

        if (tickCountDiff > 0) {
            this._increaseYAxisTickCount(tickCountDiff, yAxisData);
        } else if (tickCountDiff < 0) {
            this._increaseYAxisTickCount(-tickCountDiff, rightYAxisData);
        }
    },

    /**
     * Make axes data, used in a axis component like yAxis, xAxis, rightYAxis.
     * @returns {object} axes data
     * @private
     * @override
     */
    _makeAxesData: function() {
        var axisScaleMakerMap = this._getAxisScaleMakerMap();
        var yAxisOptionsMap = this.yAxisOptionsMap;
        var yAxisOptions = yAxisOptionsMap[this.chartTypes[0]];
        var axesData = {
            xAxis: this._makeAxisData(null, this.options.xAxis),
            yAxis: this._makeAxisData(axisScaleMakerMap.yAxis, yAxisOptions, true)
        };

        if (axisScaleMakerMap.rightYAxis) {
            yAxisOptions = yAxisOptionsMap[this.chartTypes[1]];
            axesData.rightYAxis = this._makeAxisData(axisScaleMakerMap.rightYAxis, yAxisOptions, true, true);
            axesData.rightYAxis.aligned = axesData.xAxis.aligned;

            this._updateYAxisTickCount(axesData);
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


module.exports = verticalTypeComboMixer;

},{"../helpers/calculator":57,"../helpers/renderUtil":63,"../series/areaChartSeries":89,"../series/columnChartSeries":93,"../series/lineChartSeries":96,"./chartBase":11}],29:[function(require,module,exports){
/**
 * @fileoverview zoomMixer is mixer of line type chart(line, area).
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

/**
 * zoomMixer is mixer of line type chart(line, area).
 * @mixin
 */
var zoomMixer = {
    /**
     * Render for zoom.
     * @param {boolean} isResetZoom - whether reset zoom or not
     * @private
     */
    _renderForZoom: function(isResetZoom) {
        var self = this;

        this.boundsMaker.initBoundsData();
        this._render(function(renderingData) {
            renderingData.customEvent.isResetZoom = isResetZoom;
            self._renderComponents(renderingData, 'zoom');
        });
    },

    /**
     * On zoom.
     * @param {Array.<number>} indexRange - index range for zoom
     * @override
     */
    onZoom: function(indexRange) {
        this._pauseAnimationForAddingData();
        this.dataProcessor.updateRawDataForZoom(indexRange);
        this.axisScaleMakerMap = null;
        this._renderForZoom(false);
    },

    /**
     * On reset zoom.
     * @override
     */
    onResetZoom: function() {
        var rawData = this.dataProcessor.getOriginalRawData();

        if (this.checkedLegends) {
            rawData = this._filterCheckedRawData(rawData, this.checkedLegends);
        }

        this.axisScaleMakerMap = null;
        this.prevUpdatedData = null;
        this.firstTickCount = null;

        this.dataProcessor.initData(rawData);
        this.dataProcessor.initZoomedRawData();
        this.dataProcessor.addDataFromRemainDynamicData(tui.util.pick(this.options.series, 'shifting'));
        this._renderForZoom(true);
        this._restartAnimationForAddingData();
    }
};

module.exports = zoomMixer;

},{}],30:[function(require,module,exports){
'use strict';

/**
 * Pick minimum value from value array.
 * @param {Array} arr value array
 * @param {?function} condition condition function
 * @param {?object} context target context
 * @returns {*} minimum value
 */
var min = function(arr, condition, context) {
    var result, minValue, rest;

    if (!condition) {
        result =  Math.min.apply(null, arr);
    } else {
        result = arr[0];
        minValue = condition.call(context, result, 0);
        rest = arr.slice(1);
        tui.util.forEachArray(rest, function(item, index) {
            var compareValue = condition.call(context, item, index + 1);
            if (compareValue < minValue) {
                minValue = compareValue;
                result = item;
            }
        });
    }

    return result;
};

/**
 * Pick maximum value from value array.
 * @param {Array} arr value array
 * @param {?function} condition condition function
 * @param {?object} context target context
 * @returns {*} maximum value
 */
var max = function(arr, condition, context) {
    var result, maxValue, rest;

    if (!condition) {
        result = Math.max.apply(null, arr);
    } else {
        result = arr[0];
        maxValue = condition.call(context, result, 0);
        rest = arr.slice(1);
        tui.util.forEachArray(rest, function(item, index) {
            var compareValue = condition.call(context, item, index + 1);
            if (compareValue > maxValue) {
                maxValue = compareValue;
                result = item;
            }
        });
    }

    return result;
};

/**
 * Whether one of them is true or not.
 * @param {Array} collection target collection
 * @param {function} condition condition function
 * @param {?object} context target context
 * @returns {boolean} result boolean
 */
var any = function(collection, condition, context) {
    var result = false;
    tui.util.forEach(collection, function(item, key) {
        if (condition.call(context, item, key, collection)) {
            result = true;
            return false;
        }
    });
    return result;
};

/**
 * All of them is true or not.
 * @param {Array} collection target collection
 * @param {function} condition condition function
 * @param {[object]} context target context
 * @returns {boolean} result boolean
 */
var all = function(collection, condition, context) {
    var result = !!(collection || []).length;
    tui.util.forEach(collection, function(item, key) {
        if (!condition.call(context, item, key, collection)) {
            result = false;
            return false;
        }
    });
    return result;
};

/**
 * Make unique values.
 * @param {Array} arr target array
 * @param {?boolean} sorted whether sorted or not.
 * @param {?function} iteratee iteratee function
 * @param {?object} context target context
 * @returns {Array} unique values
 */
var unique = function(arr, sorted, iteratee, context) {
    var result = [],
        prevValue;

    if (!tui.util.isBoolean(sorted)) {
        context = iteratee;
        iteratee = sorted;
        sorted = false;
    }

    iteratee = iteratee || function(value) {
        return value;
    };

    if (sorted) {
        tui.util.forEachArray(arr, function (value, index) {
            value = iteratee.call(context, value, index, arr);
            if (!index || prevValue !== value) {
                result.push(value);
            }
            prevValue = value;
        });
    } else {
        tui.util.forEachArray(arr, function(value, index) {
            value = iteratee.call(context, value, index, arr);
            if (tui.util.inArray(value, result) === -1) {
                result.push(value);
            }
        });
    }

    return result;
};

/**
 * Array pivot.
 * @memberOf module:calculator
 * @param {Array.<Array>} arr2d target 2d array
 * @returns {Array.<Array>} pivoted 2d array
 */
var pivot = function(arr2d) {
    var result = [];
    var len = tui.util.max(tui.util.map(arr2d, function(arr) {
        return arr.length;
    }));
    var index;

    tui.util.forEachArray(arr2d, function(arr) {
        for(index = 0; index < len; index += 1) {
            if (!result[index]) {
                result[index] = [];
            }
            result[index].push(arr[index]);
        }
    });
    return result;
};

/**
 * Get length after decimal point.
 * @param {string | number} value target value
 * @returns {number} result length
 */
var getDecimalLength = function(value) {
    var valueArr = String(value).split('.');
    return valueArr.length === 2 ? valueArr[1].length : 0;
};

/**
 * Find multiple num.
 * @param {...Array} target values
 * @returns {number} multiple num
 */
var findMultipleNum = function() {
    var args = [].slice.call(arguments),
        underPointLens = tui.util.map(args, function(value) {
            return tui.util.getDecimalLength(value);
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
 * @param {Array.<number>} values target values
 * @returns {number} result value
 */
var sum = function(values) {
    var copyArr = values.slice();
    copyArr.unshift(0);
    return tui.util.reduce(copyArr, function(base, add) {
        return tui.util.addition(parseFloat(base), parseFloat(add));
    });
};

/**
 * Proper case.
 * @param {string} value - string value
 * @returns {string}
 */
var properCase = function(value) {
    return value.substring(0, 1).toUpperCase() + value.substring(1);
};

/**
 * Deep copy.
 * @param {object|Array|*} origin - original data
 * @returns {*}
 */
var deepCopy = function(origin) {
    var clone;

    if (tui.util.isArray(origin)) {
        clone = [];
        tui.util.forEachArray(origin, function (value, index) {
            clone[index] = deepCopy(value);
        });
    } else if (tui.util.isFunction(origin)) {
        clone = origin;
    } else if (tui.util.isObject(origin)) {
        clone = {};
        tui.util.forEach(origin, function(value, key) {
            clone[key] = deepCopy(value);
        });
    } else {
        clone = origin;
    }

    return clone;
};

tui.util.min = min;
tui.util.max = max;
tui.util.any = any;
tui.util.all = all;
tui.util.unique = unique;
tui.util.pivot = pivot;
tui.util.getDecimalLength = getDecimalLength;
tui.util.mod = mod;
tui.util.findMultipleNum = findMultipleNum;
tui.util.addition = addition;
tui.util.subtraction = subtraction;
tui.util.multiplication = multiplication;
tui.util.division = division;
tui.util.sum = sum;
tui.util.properCase = properCase;
tui.util.deepCopy = deepCopy;

},{}],31:[function(require,module,exports){
/**
 * @fileoverview Chart const
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

/*eslint no-magic-numbers: 0*/

/**
 * Chart const
 * @readonly
 * @enum {number}
 */
var chartConst = {
    /** tui class names
     * @type {string}
     */
    CLASS_NAME_LEGEND_LABEL: 'tui-chart-legend-label',
    /** @type {string} */
    CLASS_NAME_LEGEND_CHECKBOX: 'tui-chart-legend-checkbox',
    /** @type {string} */
    CLASS_NAME_SERIES_LABEL: 'tui-chart-series-label',
    /** @type {string} */
    CLASS_NAME_SERIES_LEGEND: 'tui-chart-series-legend',
    /** @type {string} */
    CLASS_NAME_RESET_ZOOM_BTN: 'tui-chart-reset-zoom-btn',
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
    CHART_TYPE_COLUMN_LINE_COMBO: 'columnLineCombo',
    /** @type {string} */
    CHART_TYPE_LINE_AREA_COMBO: 'lineAreaCombo',
    /** @type {string} */
    CHART_TYPE_PIE_DONUT_COMBO: 'pieDonutCombo',
    /** @type {string} */
    CHART_TYPE_PIE: 'pie',
    /** @type {string} */
    CHART_TYPE_BUBBLE: 'bubble',
    /** @type {string} */
    CHART_TYPE_SCATTER: 'scatter',
    /** @type {string} */
    CHART_TYPE_HEATMAP: 'heatmap',
    /** @type {string} */
    CHART_TYPE_TREEMAP: 'treemap',
    /** @type {string} */
    CHART_TYPE_MAP: 'map',
    /** chart padding */
    CHART_PADDING: 10,
    /** chart default width */
    CHART_DEFAULT_WIDTH: 500,
    /** chart default height */
    CHART_DEFAULT_HEIGHT: 400,
    /** overlapping width of xAxis and yAxis */
    OVERLAPPING_WIDTH: 1,
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
    MAX_HEIGHT_WORLD: 'A',
    /** stack type
     * @type {string}
     */
    NORMAL_STACK_TYPE: 'normal',
    /** @type {string} */
    PERCENT_STACK_TYPE: 'percent',
    /** default stack
     * @type {string}
     */
    DEFAULT_STACK: '___DEFAULT___STACK___',
    /** dummy key
     * @type {string}
     */
    DUMMY_KEY: '___DUMMY___KEY___',
    /** root id of treemap
     * @type {string}
     */
    TREEMAP_ROOT_ID: '___TUI_TREEMAP_ROOT___',
    /** id prefix of treemap
     * @type {string}
     */
    TREEMAP_ID_PREFIX: '___TUI_TREEMAP_ID___',
    /** prefix for caching seriesItems
     * @type {string}
     */
    TREEMAP_DEPTH_KEY_PREFIX: '___TUI_TREEMAP_DEPTH___',
    /** @type {string} */
    TREEMAP_PARENT_KEY_PREFIX: '___TUI_TREEMAP_PARENT___',
    /** @type {string} */
    TREEMAP_LEAF_KEY_PREFIX: '___TUI_TREEMAP_LEAF___',
    /** @type {string} */
    TREEMAP_LIMIT_DEPTH_KEY_PREFIX: '___TUI_TREEMAP_LIMIT_DEPTH___',
    /** default border color for treemap chart
     * @type {string}
     */
    TREEMAP_DEFAULT_BORDER: '#ccc',
    /** empty axis label */
    EMPTY_AXIS_LABEL: '',
    /** angel */
    ANGLE_85: 85,
    ANGLE_90: 90,
    ANGLE_360: 360,
    /** radian */
    RAD: Math.PI / 180,
    RERENDER_TIME: 700,
    /** series label align outer
     * @type {string}
     */
    LABEL_ALIGN_OUTER: 'outer',
    /** @type {string} */
    LEGEND_ALIGN_TOP: 'top',
    /** @type {string} */
    LEGEND_ALIGN_BOTTOM: 'bottom',
    /** @type {string} */
    LEGEND_ALIGN_LEFT: 'left',
    /** series outer label padding */
    SERIES_OUTER_LABEL_PADDING: 20,
    /** default ratio for pie graph */
    PIE_GRAPH_DEFAULT_RATIO: 0.8,
    /** small ratio for pie graph */
    PIE_GRAPH_SMALL_RATIO: 0.65,
    /** tick count for spectrum legend */
    SPECTRUM_LEGEND_TICK_COUNT: 4,
    /** default position ratio of map chart label
     * @type {object}
     */
    MAP_CHART_LABEL_DEFAULT_POSITION_RATIO: {
        x: 0.5,
        y: 0.5
    },
    /** dot radius */
    DOT_RADIUS: 4,
    /** radius for circle of scatter chart*/
    SCATTER_RADIUS: 5,
    /** yAxis properties
     * @type {Array.<string>}
     */
    YAXIS_PROPS: ['tickColor', 'title', 'label'], // yaxis theme의 속성 - chart type filtering할 때 사용됨
    /** series properties
     * @type {Array.<string>}
     */
    SERIES_PROPS: ['label', 'colors', 'borderColor', 'singleColors',
        'selectionColor', 'startColor', 'endColor', 'overColor'], // series theme의 속성 - chart type filtering할 때 사용됨
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
    /** tooltip z-index **/
    TOOLTIP_ZINDEX: 500,
    /** tooltip animation time */
    TOOLTIP_ANIMATION_TIME: 100,
    /** tooltip animation time for pie chart */
    TOOLTIP_PIE_ANIMATION_TIME: 50,
    /** minimum pixel type step size */
    MIN_PIXEL_TYPE_STEP_SIZE: 45,
    /** maximum pixel type step size */
    MAX_PIXEL_TYPE_STEP_SIZE: 65,
    /** axis scale for percent stack option
     * @type {object}
     */
    PERCENT_STACKED_AXIS_SCALE: {
        limit: {
            min: 0,
            max: 100
        },
        step: 25,
        labels: [0, 25, 50, 75, 100]
    },
    /** axis scale for minus percent stack option
     * @type {object}
     */
    MINUS_PERCENT_STACKED_AXIS_SCALE: {
        limit: {
            min: -100,
            max: 0
        },
        step: 25,
        labels: [0, -25, -50, -75, -100]
    },
    /** axis scale of dual percent stack option
     * @type {object}
     */
    DUAL_PERCENT_STACKED_AXIS_SCALE: {
        limit: {
            min: -100,
            max: 100
        },
        step: 25,
        labels: [-100, -75, -50, -25, 0, 25, 50, 75, 100]
    },
    /** axis scale of diverging percent stack option
     * @type {object}
     */
    DIVERGING_PERCENT_STACKED_AXIS_SCALE: {
        limit: {
            min: -100,
            max: 100
        },
        step: 25,
        labels: [100, 75, 50, 25, 0, 25, 50, 75, 100]
    },
    /** title add padding */
    TITLE_PADDING: 10,
    /** legend area padding */
    LEGEND_AREA_PADDING: 10,
    /** legend checkbox width */
    LEGEND_CHECKBOX_WIDTH: 20,
    /** legend rect width */
    LEGEND_RECT_WIDTH: 12,
    /** lgend label left padding */
    LEGEND_LABEL_LEFT_PADDING: 5,
    MIN_LEGEND_WIDTH: 100,
    /** map legend height */
    MAP_LEGEND_SIZE: 200,
    /** map legend graph size */
    MAP_LEGEND_GRAPH_SIZE: 25,
    /** map legend label padding */
    MAP_LEGEND_LABEL_PADDING: 5,
    CIRCLE_LEGEND_LABEL_FONT_SIZE: 9,
    CIRCLE_LEGEND_PADDING: 10,
    HALF_RATIO: 0.5,
    /** AXIS LABEL PADDING */
    AXIS_LABEL_PADDING: 7,
    /** rotations degree candidates */
    DEGREE_CANDIDATES: [25, 45, 65, 85],
    /**
     * auto tick interval
     * @type {string}
     */
    TICK_INTERVAL_AUTO: 'auto',
    /** yAxis align option
     * @type {string}
     */
    YAXIS_ALIGN_CENTER: 'center',
    /** xAxis label compare margin */
    XAXIS_LABEL_COMPARE_MARGIN: 20,
    /** xAxis label gutter */
    XAXIS_LABEL_GUTTER: 2,
    /**
     * Standard multiple nums of axis
     * @type {Array}
     */
    AXIS_STANDARD_MULTIPLE_NUMS: [1, 2, 5, 10, 20, 50, 100],
    /**
     * Last standard multiple num of axis
     */
    AXIS_LAST_STANDARD_MULTIPLE_NUM: 100,
    /** label padding top */
    LABEL_PADDING_TOP: 2,
    /** line margin top */
    LINE_MARGIN_TOP: 5,
    /** tooltip gap */
    TOOLTIP_GAP: 5,
    /** tooltip direction
     * @type {string}
     */
    TOOLTIP_DIRECTION_FORWARD: 'forword',
    /** @type {string} */
    TOOLTIP_DIRECTION_CENTER: 'center',
    /** @type {string} */
    TOOLTIP_DIRECTION_BACKWARD: 'backword',
    /** tooltip align options
     * @type {string}
     */
    TOOLTIP_DEFAULT_ALIGN_OPTION: 'center top',
    /** @type {string} */
    TOOLTIP_DEFAULT_HORIZONTAL_ALIGN_OPTION: 'right middle',
    /** @type {string} */
    TOOLTIP_DEFAULT_GROUP_ALIGN_OPTION: 'right middle',
    /** @type {string} */
    TOOLTIP_DEFAULT_GROUP_HORIZONTAL_ALIGN_OPTION: 'center bottom',
    /** hide delay */
    HIDE_DELAY: 200,
    OLD_BROWSER_OPACITY_100: 100,
    SERIES_LABEL_OPACITY: 0.3,
    WHEEL_TICK: 120,
    MAX_ZOOM_MAGN: 32,
    FF_WHEELDELTA_ADJUSTING_VALUE: -40,
    IE7_ROTATION_FILTER_STYLE_MAP: {
        25: ' style="filter: progid:DXImageTransform.Microsoft.Matrix(SizingMethod=\'auto expand\',' +
                ' M11=0.9063077870366499, M12=0.42261826174069944, M21=-0.42261826174069944, M22=0.9063077870366499)"',
        45: ' style="filter: progid:DXImageTransform.Microsoft.Matrix(SizingMethod=\'auto expand\',' +
                ' M11=0.7071067811865476, M12=0.7071067811865475, M21=-0.7071067811865475, M22=0.7071067811865476)"',
        65: ' style="filter: progid:DXImageTransform.Microsoft.Matrix(SizingMethod=\'auto expand\',' +
                ' M11=0.42261826174069944, M12=0.9063077870366499, M21=-0.9063077870366499, M22=0.42261826174069944)"',
        85: ' style="filter: progid:DXImageTransform.Microsoft.Matrix(SizingMethod=\'auto expand\',' +
                ' M11=0.08715574274765814, M12=0.9961946980917455, M21=-0.9961946980917455, M22=0.08715574274765814)"'
    }
};
module.exports = chartConst;

},{}],32:[function(require,module,exports){
/**
 * @fileoverview AreaTypeCustomEvent is event handle layer for line type chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var CustomEventBase = require('./customEventBase');
var zoomMixer = require('./zoomMixer');
var AreaTypeDataModel = require('./areaTypeDataModel');

var AreaTypeCustomEvent = tui.util.defineClass(CustomEventBase, /** @lends AreaTypeCustomEvent.prototype */ {
    /**
     * AreaTypeCustomEvent is custom event for line type chart.
     * @param {object} params parameters
     * @constructs AreaTypeCustomEvent
     * @extends CustomEventBase
     */
    init: function(params) {
        CustomEventBase.call(this, params);

        /**
         * previous found data
         * @type {null | object}
         */
        this.prevFoundData = null;

        this._initForZoom(params.zoomable);
    },

    /**
     * Initialize data of custom event
     * @param {Array.<object>} seriesInfos series infos
     * @override
     */
    initCustomEventData: function(seriesInfos) {
        var seriesInfo = seriesInfos[0];

        this.dataModel = new AreaTypeDataModel(seriesInfo);
        CustomEventBase.prototype.initCustomEventData.call(this, seriesInfos);

        this._showTooltipAfterZoom();
    },

    /**
     * Find data by client position.
     * @param {number} clientX - clientX
     * @param {number} clientY - clientY
     * @returns {object}
     * @private
     */
    _findData: function(clientX, clientY) {
        var layerPosition = this._calculateLayerPosition(clientX, clientY);
        var groupIndex = this.tickBaseCoordinateModel.findIndex(layerPosition.x);

        return this.dataModel.findData(groupIndex, layerPosition.y);
    },

    /**
     * Get first model data.
     * @param {number} index - index
     * @returns {object}
     * @private
     */
    _getFirstData: function(index) {
        return this.dataModel.getFirstData(index);
    },

    /**
     * Get last model data.
     * @param {number} index - index
     * @returns {object}
     * @private
     */
    _getLastData: function(index) {
        return this.dataModel.getLastData(index);
    },

    /**
     * Show tooltip.
     * @param {object} foundData - model data
     * @private
     */
    _showTooltip: function(foundData) {
        this.fire('showTooltip', foundData);
    },

    /**
     * Hide tooltip.
     * @private
     */
    _hideTooltip: function() {
        this.fire('hideTooltip', this.prevFoundData);
    },

    /**
     * On mousemove.
     * @param {MouseEvent} e - mouse event
     * @private
     * @override
     */
    _onMousemove: function(e) {
        var foundData;

        CustomEventBase.prototype._onMousemove.call(this, e);

        foundData = this._findData(e.clientX, e.clientY);

        if (this._isAfterDragMouseup() || !this._isChangedSelectData(this.prevFoundData, foundData)) {
            return;
        }

        if (foundData) {
            this._showTooltip(foundData);
        } else if (this.prevFoundData) {
            this._hideTooltip();
        }

        this.prevFoundData = foundData;
    },

    /**
     * On mouseout.
     * @private
     * @override
     */
    _onMouseout: function() {
        if (this.prevFoundData) {
            this._hideTooltip();
        }

        CustomEventBase.prototype._onMouseout.call(this);
    }
});

zoomMixer.mixin(AreaTypeCustomEvent);

module.exports = AreaTypeCustomEvent;

},{"./areaTypeDataModel":33,"./customEventBase":36,"./zoomMixer":41}],33:[function(require,module,exports){
/**
 * @fileoverview AreaTypeDataModel is data model for custom event of area type.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var AreaTypeDataModel = tui.util.defineClass(/** @lends AreaTypeDataModel.prototype */ {
    /**
     * AreaTypeDataModel is data mode for custom event of area type.
     * @constructs AreaTypeDataModel
     * @param {object} seriesInfo series info
     */
    init: function(seriesInfo) {
        this.data = this._makeData(seriesInfo.data.groupPositions, seriesInfo.chartType);
    },

    /**
     * Make area type data for custom event.
     * @param {Array.<Array.<object>>} groupPositions - group positions
     * @param {string} chartType - chart type
     * @returns {Array}
     * @private
     */
    _makeData: function(groupPositions, chartType) {
        groupPositions = tui.util.pivot(groupPositions);

        return tui.util.map(groupPositions, function(positions, groupIndex) {
            return tui.util.map(positions, function(position, index) {
                return {
                    chartType: chartType,
                    indexes: {
                        groupIndex: groupIndex,
                        index: index
                    },
                    bound: position
                };
            });
        });
    },

    /**
     * Find Data.
     * @param {number} groupIndex - group index
     * @param {number} layerY - mouse position
     * @returns {object}
     */
    findData: function(groupIndex, layerY) {
        var result = null,
            min = 10000;
        tui.util.forEach(this.data[groupIndex], function(data) {
            var diff = Math.abs(layerY - data.bound.top);
            if (min > diff) {
                min = diff;
                result = data;
            }
        });

        return result;
    },

    /**
     * Get first data.
     * @param {number} index - index
     * @returns {object}
     */
    getFirstData: function(index) {
        return this.data[0][index];
    },

    /**
     * Get last data.
     * @param {number} index - index
     * @returns {object}
     */
    getLastData: function(index) {
        var lastGroupIndex = this.data.length - 1;

        return this.data[lastGroupIndex][index];
    }
});

module.exports = AreaTypeDataModel;

},{}],34:[function(require,module,exports){
/**
 * @fileoverview BoundsBaseCoordinateModel is data mode for custom event of point type.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

/**
 * position
 * @typedef {{left: number, top: number}} position
 */

/**
 * bound
 * @typedef {{
 *      dimension: {width: number, height: number},
 *      position: position
 *}} bound
 */

/**
 * group bound
 *  @typedef {Array.<Array.<bound>>} groupBound
 */

/**
 * group position
 *  @typedef {Array.<Array.<position>>} groupPosition
 */

/**
 * series info
 * @typedef {{
 *      chartType: {string},
 *      data: {
 *          groupBounds: ?groupBound,
 *          groupValues: ?Array.<Array.<number>>,
 *          groupPositions: ?groupPosition
 *      }
 *}} seriesInfo
 */

var chartConst = require('../const'),
    predicate = require('../helpers/predicate');

var BoundsBaseCoordinateModel = tui.util.defineClass(/** @lends BoundsBaseCoordinateModel.prototype */ {
    /**
     * BoundsBaseCoordinateModel is data mode for custom event of point type.
     * @constructs BoundsBaseCoordinateModel
     * @param {Array.<seriesInfo>} seriesInfos series infos
     */
    init: function(seriesInfos) {
        this.data = this._makeData(seriesInfos);
    },

    /**
     * Make coordinate data about bar type graph
     * @param {groupBound} groupBounds group bounds
     * @param {string} chartType chart type
     * @returns {Array} coordinate data
     * @private
     */
    _makeRectTypeCoordinateData: function(groupBounds, chartType) {
        var allowNegativeTooltip = !predicate.isBoxTypeChart(chartType);

        return tui.util.map(groupBounds, function(bounds, groupIndex) {
            return tui.util.map(bounds, function(_bound, index) {
                var bound;
                if (!_bound) {
                    return null;
                }

                bound = _bound.end;

                return {
                    sendData: {
                        chartType: chartType,
                        indexes: {
                            groupIndex: groupIndex,
                            index: index
                        },
                        allowNegativeTooltip: allowNegativeTooltip,
                        bound: bound
                    },
                    bound: {
                        left: bound.left,
                        top: bound.top,
                        right: bound.left + bound.width,
                        bottom: bound.top + bound.height
                    }
                };
            });
        });
    },

    /**
     * Make coordinate data about dot type graph
     * @param {groupPositions} groupPositions group positions
     * @param {string} chartType chart type
     * @returns {Array.<Array.<object>>} coordinate data
     * @private
     */
    _makeDotTypeCoordinateData: function(groupPositions, chartType) {
        if (!groupPositions) {
            return [];
        }

        return tui.util.map(tui.util.pivot(groupPositions), function(positions, groupIndex) {
            return tui.util.map(positions, function(position, index) {
                return {
                    sendData: {
                        chartType: chartType,
                        indexes: {
                            groupIndex: groupIndex,
                            index: index
                        },
                        bound: position
                    },
                    bound: {
                        left: position.left - chartConst.DOT_RADIUS,
                        top: position.top - chartConst.DOT_RADIUS,
                        right: position.left + chartConst.DOT_RADIUS,
                        bottom: position.top + chartConst.DOT_RADIUS
                    }
                };
            });
        });
    },

    /**
     * Join data.
     * @param {Array.<Array.<Array.<object>>>} groupData group data
     * @returns {Array.<Array.<object>>} joined data
     * @private
     */
    _joinData: function(groupData) {
        var results = [];
        tui.util.forEachArray(groupData, function(coordData) {
            tui.util.forEachArray(coordData, function(data, index) {
                if (!results[index]) {
                    results[index] = [];
                }
                results[index] = results[index].concat(data);
            });
        });

        return results;
    },

    /**
     * Make coordinate data.
     * @param {Array.<seriesInfo>} seriesInfos series infos
     * @returns {Array.<Array.<object>>} coordinate data
     * @private
     */
    _makeData: function(seriesInfos) {
        var self = this,
            coordinateData;

        seriesInfos.reverse();
        coordinateData = tui.util.map(seriesInfos, function(info) {
            var result;
            if (predicate.isLineTypeChart(info.chartType)) {
                result = self._makeDotTypeCoordinateData(info.data.groupPositions, info.chartType);
            } else {
                result = self._makeRectTypeCoordinateData(info.data.groupBounds, info.chartType);
            }

            return result;
        });

        return this._joinData(coordinateData);
    },

    /**
     * Find candidates.
     * @param {{bound: {left: number, top: number, right: number, bottom: number}}} data data
     * @param {number} layerX layerX
     * @param {number} layerY layerY
     * @returns {Array.<{sendData: object}>} candidates
     * @private
     */
    _findCandidates: function(data, layerX, layerY) {
        return tui.util.filter(data, function(datum) {
            var bound = datum && datum.bound,
                included = false,
                includedX, includedY;

            if (bound) {
                includedX = bound.left <= layerX && bound.right >= layerX;
                includedY = bound.top <= layerY && bound.bottom >= layerY;
                included = includedX && includedY;
            }

            return included;
        });
    },

    /**
     * Find tooltip data.
     * @param {number} groupIndex group index
     * @param {number} layerX mouse position x
     * @param {number} layerY mouse position y
     * @returns {object} tooltip data
     */
    findData: function(groupIndex, layerX, layerY) {
        var min = 10000,
            result = null,
            candidates;

        if (groupIndex > -1) {
            // layerX, layerY를 포함하는 data 추출
            candidates = this._findCandidates(this.data[groupIndex], layerX, layerY);

            // 추출된 data 중 top이 layerY와 가장 가까운 data 찾아내기
            tui.util.forEachArray(candidates, function(data) {
                var diff = Math.abs(layerY - data.sendData.bound.top);
                if (min > diff) {
                    min = diff;
                    result = data.sendData;
                }
            });
        }

        return result;
    }
});

module.exports = BoundsBaseCoordinateModel;

},{"../const":31,"../helpers/predicate":61}],35:[function(require,module,exports){
/**
 * @fileoverview BoundsTypeCustomEvent is event handle layer for bounds.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var CustomEventBase = require('./customEventBase');
var chartConst = require('../const');
var predicate = require('../helpers/predicate');
var dom = require('../helpers/domHandler');

var BoundsTypeCustomEvent = tui.util.defineClass(CustomEventBase, /** @lends BoundsTypeCustomEvent.prototype */ {
    /**
     * BoundsTypeCustomEvent is event handle layer for line type chart.
     * @constructs BoundsTypeCustomEvent
     * @extends CustomEventBase
     */
    init: function() {
        CustomEventBase.apply(this, arguments);

        /**
         * previous found data
         * @type {null | object}
         */
        this.prevFoundData = null;

        /**
         * history array for treemap chart.
         * @type {number}
         */
        this.zoomHistory = [-1];

        /**
         * button for zoom history back
         * @type {null | HTMLElement}
         */
        this.historyBackBtn = null;
    },

    /**
     * Hide tooltip.
     * @private
     */
    _hideTooltip: function() {
        this.fire('hideTooltip', this.prevFoundData);
        this.prevFoundData = null;
        this.styleCursor(false);
    },

    /**
     * Style css cursor.
     * @param {boolean} hasChild - whether has child or not
     */
    styleCursor: function(hasChild) {
        var container = this.customEventContainer;
        if (hasChild) {
            container.style.cursor = 'pointer';
        } else {
            container.style.cursor = 'default';
        }
    },

    /**
     * On mousemove.
     * @param {MouseEvent} e - mouse event
     * @private
     * @override
     */
    _onMousemove: function(e) {
        var foundData = this._findDataFromBoundsCoordinateModel(this.customEventContainer, e.clientX, e.clientY);
        var seriesItem;

        if (!this._isChangedSelectData(this.prevFoundData, foundData)) {
            return;
        }

        if (this.prevFoundData) {
            this._hideTooltip();
        }

        this.prevFoundData = foundData;

        if (!foundData) {
            return;
        }

        if (predicate.isTreemapChart(this.chartType)) {
            seriesItem = this._getSeriesItemByIndexes(foundData.indexes);
            this.styleCursor(seriesItem.hasChild);
        }

        this.fire('showTooltip', foundData);
    },

    /**
     * Zoom history back.
     * @private
     */
    _zoomHistoryBack: function() {
        var index = this.zoomHistory[this.zoomHistory.length - 2];

        this.zoomHistory.pop();
        this.fire('zoom', index);

        if (this.zoomHistory.length === 1) {
            this.customEventContainer.removeChild(this.historyBackBtn);
            this.historyBackBtn = null;
        }
    },

    /**
     * Get seriesItem by indexes
     * @param {{groupIndex: number, index: number}} indexes - indexes
     * @returns {SeriesItem}
     * @private
     */
    _getSeriesItemByIndexes: function(indexes) {
        var seriesDataModel = this.dataProcessor.getSeriesDataModel(chartConst.CHART_TYPE_TREEMAP);

        return seriesDataModel.getSeriesItem(indexes.groupIndex, indexes.index, true);
    },

    /**
     * On mousemove.
     * @param {MouseEvent} e - mouse event
     * @private
     * @override
     */
    _onClick: function(e) {
        var target = e.target || e.srcElement;
        var foundData, seriesItem;

        if (!predicate.isTreemapChart(this.chartType)) {
            return;
        }

        if (dom.hasClass(target, chartConst.CLASS_NAME_RESET_ZOOM_BTN)) {
            this._hideTooltip();
            this._zoomHistoryBack();

            return;
        }

        foundData = this._findDataFromBoundsCoordinateModel(target, e.clientX, e.clientY);

        if (foundData) {
            seriesItem = this._getSeriesItemByIndexes(foundData.indexes);

            if (!seriesItem.hasChild) {
                return;
            }

            this._hideTooltip();
            this.fire('zoom', foundData.indexes.index);
        }
    },

    /**
     * On mouseout.
     * @override
     */
    _onMouseout: function(e) {
        var bound = this._getContainerBound();
        var clientX = e.clientX;
        var clientY = e.clientY;

        if ((bound.left <= clientX) && (bound.top <= clientY) &&
            (bound.right >= clientX) && (bound.bottom >= clientY)) {
            return;
        }

        if (this.prevFoundData) {
            this._hideTooltip();
        }

        CustomEventBase.prototype._onMouseout.call(this);
    },

    /**
     * On after zoom.
     * @param {number} index - index of target seriesItem
     */
    onAfterZoom: function(index) {
        if (!this.historyBackBtn) {
            this.historyBackBtn = dom.create('DIV', chartConst.CLASS_NAME_RESET_ZOOM_BTN);
            this.historyBackBtn.innerHTML = '< Back';
            dom.append(this.customEventContainer, this.historyBackBtn);
        }

        if (this.zoomHistory[this.zoomHistory.length - 1] !== index) {
            this.zoomHistory.push(index);
        }
    }
});

module.exports = BoundsTypeCustomEvent;

},{"../const":31,"../helpers/domHandler":59,"../helpers/predicate":61,"./customEventBase":36}],36:[function(require,module,exports){
/**
 * @fileoverview CustomEventBase is base class for event handle layers.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var TickBaseCoordinateModel = require('./tickBaseCoordinateModel');
var BoundsBaseCoordinateModel = require('./boundsBaseCoordinateModel');
var chartConst = require('../const');
var eventListener = require('../helpers/eventListener');
var predicate = require('../helpers/predicate');
var dom = require('../helpers/domHandler');
var renderUtil = require('../helpers/renderUtil');

var CustomEventBase = tui.util.defineClass(/** @lends CustomEventBase.prototype */ {
    /**
     * CustomEventBase is base class for custom event components.
     * @constructs CustomEventBase
     * @param {object} params parameters
     *      @param {{
     *          dimension: {width: number, height: number},
     *          position: {left: number, top: number}
     *      }} params.bound bound
     *      @param {string} params.chartType chart type
     *      @param {boolean} params.isVertical whether vertical or not
     */
    init: function(params) {
        var isLineTypeChart;

        /**
         * type of chart
         * @type {string}
         */
        this.chartType = params.chartType;

        /**
         * chartTypes is available in combo chart
         * @type {Array.<string>}
         */
        this.chartTypes = params.chartTypes;

        /**
         * whether vertical or not
         * @type {boolean}
         */
        this.isVertical = params.isVertical;

        /**
         * data processor
         * @type {DataProcessor}
         */
        this.dataProcessor = params.dataProcessor;

        /**
         * bounds maker
         * @type {BoundsMaker}
         */
        this.boundsMaker = params.boundsMaker;

        /**
         * selected series item.
         * @type {null | object}
         */
        this.selectedData = null;

        /**
         * previous client position of mouse event (clientX, clientY)
         * @type {null | object}
         */
        this.prevClientPosition = null;

        /**
         * previous found data
         * @type {null | object}
         */
        this.prevFoundData = null;


        isLineTypeChart = predicate.isLineTypeChart(this.chartType, this.chartTypes);

        /**
         * expand size
         * @type {number}
         */
        this.expandSize = isLineTypeChart ? chartConst.SERIES_EXPAND_SIZE : 0;

        /**
         * container bound
         * @type {null | {left: number, top: number, right: number, bottom: number}}
         */
        this.containerBound = null;
    },

    /**
     * Get bound for rendering.
     * @returns {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }}
     * @private
     */
    _getRenderingBound: function() {
        var renderingBound;

        if (predicate.isLineTypeChart(this.chartType, this.chartTypes)) {
            renderingBound = renderUtil.expandBound(this.boundsMaker.getBound('customEvent'));
        } else {
            renderingBound = this.boundsMaker.getBound('customEvent');
        }

        return renderingBound;
    },

    /**
     * Render event handle layer area.
     * @param {HTMLElement} customEventContainer - container element for custom event
     * @param {object} data - data for rendering
     * @private
     */
    _renderCustomEventArea: function(customEventContainer, data) {
        var dimension = this.boundsMaker.getDimension('customEvent');
        var renderingBound, tbcm;

        this.dimension = dimension;
        tbcm = new TickBaseCoordinateModel(dimension, data.tickCount, this.chartType, this.isVertical, this.chartTypes);
        this.tickBaseCoordinateModel = tbcm;
        renderingBound = this._getRenderingBound();
        renderUtil.renderDimension(customEventContainer, renderingBound.dimension);
        renderUtil.renderPosition(customEventContainer, renderingBound.position);
    },

    /**
     * Render for customEvent component.
     * @param {object} data - data for rendering
     * @returns {HTMLElement} container for custom event
     */
    render: function(data) {
        var container = dom.create('DIV', 'tui-chart-series-custom-event-area');

        this._renderCustomEventArea(container, data);
        this.attachEvent(container);
        this.customEventContainer = container;

        return container;
    },

    /**
     * Get container bound.
     * @returns {ClientRect}
     * @private
     */
    _getContainerBound: function() {
        if (!this.containerBound) {
            this.containerBound = this.customEventContainer.getBoundingClientRect();
        }

        return this.containerBound;
    },

    /**
     * Create BoundsBaseCoordinateModel from seriesBounds for custom event.
     * @param {Array.<object>} seriesBounds - series bounds
     */
    initCustomEventData: function(seriesBounds) {
        this.boundsBaseCoordinateModel = new BoundsBaseCoordinateModel(seriesBounds);
    },

    /**
     * Rerender for customEvent component.
     * @param {{tickCount: number}} data - data for rerendering
     */
    rerender: function(data) {
        this._renderCustomEventArea(this.customEventContainer, data);
    },

    /**
     * Resize for customEvent component.
     * @param {{tickCount: number}} data - data for resizing
     */
    resize: function(data) {
        this.containerBound = null;
        this.rerender(data);
    },

    /**
     * Whether changed select data or not.
     * @param {object} prev - previous data
     * @param {object} cur - current data
     * @returns {boolean}
     * @private
     */
    _isChangedSelectData: function(prev, cur) {
        return !prev || !cur || prev.chartType !== cur.chartType ||
            prev.indexes.groupIndex !== cur.indexes.groupIndex || prev.indexes.index !== cur.indexes.index;
    },

    /**
     * Find coordinate data from boundsCoordinateModel.
     * @param {HTMLElement} target - target element
     * @param {number} clientX mouse - position x
     * @param {number} clientY mouse - position y
     * @returns {object}
     * @private
     */
    _findDataFromBoundsCoordinateModel: function(target, clientX, clientY) {
        var bound = target.getBoundingClientRect();
        var layerX = clientX - bound.left;
        var layerY = clientY - bound.top;
        var groupIndex;

        if (predicate.isTreemapChart(this.chartType)) {
            groupIndex = 0;
        } else {
            groupIndex = this.tickBaseCoordinateModel.findIndex(this.isVertical ? layerX : layerY);
            layerX += chartConst.SERIES_EXPAND_SIZE;
            layerY += chartConst.SERIES_EXPAND_SIZE;
        }

        return this.boundsBaseCoordinateModel.findData(groupIndex, layerX, layerY);
    },

    /**
     * Unselect selected data.
     * @private
     */
    _unselectSelectedData: function() {
        var eventName = renderUtil.makeCustomEventName('unselect', this.selectedData.chartType, 'series');
        this.fire(eventName, this.selectedData);
        this.selectedData = null;
    },

    /**
     * Find data.
     * @private
     * @abstract
     */
    _findData: function() {},

    /**
     * Show tooltip
     * @private
     * @abstract
     */
    _showTooltip: function() {},

    /**
     * Animate for adding data.
     */
    animateForAddingData: function() {
        var foundData, isMoving;

        if (!this.prevClientPosition) {
            return;
        }

        foundData = this._findData(this.prevClientPosition.x, this.prevClientPosition.y);

        if (foundData) {
            isMoving = this.prevFoundData && (this.prevFoundData.indexes.groupIndex === foundData.indexes.groupIndex);
            this._showTooltip(foundData, isMoving);
        }

        this.prevFoundData = foundData;
    },

    /**
     * On mouse event.
     * @param {string} eventType - custom event type
     * @param {MouseEvent} e - mouse event
     * @private
     */
    _onMouseEvent: function(eventType, e) {
        var eventName = renderUtil.makeCustomEventName(eventType, this.chartType, 'series');

        dom.addClass(this.customEventContainer, 'hide');
        this.fire(eventName, {
            left: e.clientX,
            top: e.clientY
        });
        dom.removeClass(this.customEventContainer, 'hide');
    },

    /**
     * On click
     * @param {MouseEvent} e - mouse event
     * @private
     */
    _onClick: function(e) {
        var target = e.target || e.srcElement;
        var clientX = e.clientX - this.expandSize;
        var foundData = this._findDataFromBoundsCoordinateModel(target, clientX, e.clientY);

        if (!this._isChangedSelectData(this.selectedData, foundData)) {
            this._unselectSelectedData();
        } else if (foundData) {
            if (this.selectedData) {
                this._unselectSelectedData();
            }
            this.fire(renderUtil.makeCustomEventName('select', foundData.chartType, 'series'), foundData);
            this.selectedData = foundData;
        }
    },

    /**
     * On mouse down
     * @private
     * @abstract
     */
    _onMousedown: function() {},

    /**
     * On mouse up
     * @private
     * @abstract
     */
    _onMouseup: function() {},

    /**
     * On mouse move
     * @param {MouseEvent} e - mouse event
     * @private
     */
    _onMousemove: function(e) {
        this.prevClientPosition = {
            x: e.clientX,
            y: e.clientY
        };
    },

    /**
     * On mouse out
     * @private
     */
    _onMouseout: function() {
        this.prevClientPosition = null;
        this.prevFoundData = null;
    },

    /**
     * Attach event
     * @param {HTMLElement} target - target element
     */
    attachEvent: function(target) {
        eventListener.on(target, {
            click: this._onClick,
            mousedown: this._onMousedown,
            mouseup: this._onMouseup,
            mousemove: this._onMousemove,
            mouseout: this._onMouseout
        }, this);
    }
});

tui.util.CustomEvents.mixin(CustomEventBase);

module.exports = CustomEventBase;

},{"../const":31,"../helpers/domHandler":59,"../helpers/eventListener":60,"../helpers/predicate":61,"../helpers/renderUtil":63,"./boundsBaseCoordinateModel":34,"./tickBaseCoordinateModel":40}],37:[function(require,module,exports){
/**
 * @fileoverview GroupTypeCustomEvent is event handle layer for grouped tooltip option.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var CustomEventBase = require('./customEventBase');
var zoomMixer = require('./zoomMixer');
var chartConst = require('../const');

var GroupTypeCustomEvent = tui.util.defineClass(CustomEventBase, /** @lends GroupTypeCustomEvent.prototype */ {
    /**
     * GroupTypeCustomEvent is event handle layer for grouped tooltip option.
     * @param {object} params parameters
     * @constructs GroupTypeCustomEvent
     * @extends CustomEventBase
     */
    init: function(params) {
        CustomEventBase.call(this, params);

        /**
         * previous index of group data
         * @type {null}
         */
        this.prevIndex = null;

        /**
         * type of size
         * @type {string}
         */
        this.sizeType = this.isVertical ? 'height' : 'width';

        this._initForZoom(params.zoomable);
    },

    /**
     * Initialize data of custom event
     * @param {Array.<object>} seriesInfos series infos
     * @override
     */
    initCustomEventData: function(seriesInfos) {
        CustomEventBase.prototype.initCustomEventData.call(this, seriesInfos);

        this._showTooltipAfterZoom();
    },

    /**
     * Find data by client position.
     * @param {number} clientX - clientX
     * @param {number} clientY - clientY
     * @returns {object}
     * @private
     */
    _findData: function(clientX, clientY) {
        var layerPosition = this._calculateLayerPosition(clientX, clientY, true);
        var pointValue;

        if (this.isVertical) {
            pointValue = layerPosition.x - this.expandSize;
        } else {
            pointValue = layerPosition.y - chartConst.SERIES_EXPAND_SIZE;
        }

        return {
            indexes: {
                groupIndex: this.tickBaseCoordinateModel.findIndex(pointValue)
            }
        };
    },

    /**
     * Get first data.
     * @returns {{indexes: {groupIndex: number}}} - data
     * @private
     */
    _getFirstData: function() {
        return {
            indexes: {
                groupIndex: 0
            }
        };
    },

    /**
     * Get last data
     * @returns {{indexes: {groupIndex: number}}} - data
     * @private
     */
    _getLastData: function() {
        return {
            indexes: {
                groupIndex: this.tickBaseCoordinateModel.getLastIndex()
            }
        };
    },

    /**
     * Whether out position or not.
     * @param {number} layerX layerX
     * @param {number} layerY layerY
     * @returns {boolean} result boolean
     * @private
     */
    _isOutPosition: function(layerX, layerY) {
        var dimension = this.dimension;

        return layerX < 0 || layerX > dimension.width || layerY < 0 || layerY > dimension.height;
    },

    /**
     * Show tooltip.
     * @param {{indexes: {groupIndex: number}}} foundData - data
     * @param {boolean} [isMoving] - whether moving or not
     * @private
     */
    _showTooltip: function(foundData, isMoving) {
        var index = foundData.indexes.groupIndex;

        this.prevIndex = index;
        this.fire('showGroupTooltip', {
            index: index,
            range: this.tickBaseCoordinateModel.makeRange(index),
            size: this.dimension[this.sizeType],
            isVertical: this.isVertical,
            isMoving: isMoving
        });
    },

    /**
     * Hide tooltip
     * @private
     */
    _hideTooltip: function() {
        this.fire('hideGroupTooltip', this.prevIndex);
        this.prevIndex = null;
    },

    /**
     * On mousemove.
     * @param {MouseEvent} e mouse event object
     * @private
     * @override
     */
    _onMousemove: function(e) {
        var foundData, index;

        CustomEventBase.prototype._onMousemove.call(this, e);

        if (this._isAfterDragMouseup()) {
            return;
        }

        foundData = this._findData(e.clientX, e.clientY);
        index = foundData.indexes.groupIndex;

        if (index === -1) {
            this._onMouseout(e);
        } else if (this.prevIndex !== index) {
            this._showTooltip(foundData);
        }
    },

    /**
     * On mouseout.
     * @override
     */
    _onMouseout: function(e) {
        var layerPosition;

        layerPosition = this._calculateLayerPosition(e.clientX, e.clientY, false);

        if (this._isOutPosition(layerPosition.x, layerPosition.y) && !tui.util.isNull(this.prevIndex)) {
            this._hideTooltip();
        }

        CustomEventBase.prototype._onMouseout.call(this);
    }
});

zoomMixer.mixin(GroupTypeCustomEvent);

module.exports = GroupTypeCustomEvent;

},{"../const":31,"./customEventBase":36,"./zoomMixer":41}],38:[function(require,module,exports){
/**
 * @fileoverview MapChartCustomEvent is event handle layer for map chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var CustomEventBase = require('./customEventBase'),
    chartConst = require('../const'),
    eventListener = require('../helpers/eventListener'),
    dom = require('../helpers/domHandler'),
    renderUtil = require('../helpers/renderUtil');

var MapChartCustomEvent = tui.util.defineClass(CustomEventBase, /** @lends MapChartCustomEvent.prototype */ {
    /**
     * MapChartCustomEvent is event handle layer for map chart.
     * @param {object} params parameters
     *      @param {BoundsMaker} params.boundsMaker boundsMaker instance
     * @constructs MapChartCustomEvent
     * @extends CustomEventBase
     */
    init: function(params) {
        this.boundsMaker = params.boundsMaker;
        this.chartType = params.chartType;
        this.isDown = false;
    },
    /**
     * Render event handle layer area
     * @param {HTMLElement} customEventContainer custom event container element
     * @private
     */
    _renderCustomEventArea: function(customEventContainer) {
        var bound = this.boundsMaker.getBound('customEvent');
        renderUtil.renderDimension(customEventContainer, bound.dimension);
        renderUtil.renderPosition(customEventContainer, bound.position);
    },

    /**
     * Initialize data of custom event
     * @override
     */
    initCustomEventData: function() {},

    /**
     * On click.
     * @private
     * @override
     */
    _onClick: function() {},

    /**
     * On mouse down
     * @param {mouseevent} e mouse event
     * @private
     * @override
     */
    _onMousedown: function(e) {
        this.isDown = true;
        this.fire('dragStartMapSeries', {
            left: e.clientX,
            top: e.clientY
        });
    },

    /**
     * Drag end.
     * @private
     */
    _dragEnd: function() {
        this.isDrag = false;
        dom.removeClass(this.customEventContainer, 'drag');
        this.fire('dragEndMapSeries');
    },

    /**
     * On mouse up
     * @param {mouseevent} e mouse event
     * @private
     * @override
     */
    _onMouseup: function(e) {
        this.isDown = false;
        if (this.isDrag) {
            this._dragEnd();
        } else if (!this.isMove) {
            this._onMouseEvent('click', e);
        }
        this.isMove = false;
    },

    /**
     * On mouse move.
     * @param {mouseevent} e mouse event
     * @private
     * @override
     */
    _onMousemove: function(e) {
        if (this.isDown) {
            if (!this.isDrag) {
                dom.addClass(this.customEventContainer, 'drag');
            }
            this.isDrag = true;
            this.fire('dragMapSeries', {
                left: e.clientX,
                top: e.clientY
            });
        } else {
            this.isMove = true;
            this._onMouseEvent('move', e);
        }
    },

    /**
     * On mouse out
     * @private
     * @override
     */
    _onMouseout: function(e) {
        if (this.isDrag) {
            this._dragEnd();
        } else {
            this._onMouseEvent('move', e);
        }
        this.isDown = false;
    },

    /**
     * On mouse wheel.
     * @param {mouseevent} e mouse event
     * @returns {?boolean}
     * @private
     */
    _onMousewheel: function(e) {
        var wheelDelta = e.wheelDelta || e.detail * chartConst.FF_WHEELDELTA_ADJUSTING_VALUE;

        this.fire('wheel', wheelDelta, {
            left: e.clientX,
            top: e.clientY
        });

        if (e.preventDefault) {
            e.preventDefault();
        }

        return false;
    },

    /**
     * Attach event
     * @param {HTMLElement} target target element
     * @override
     */
    attachEvent: function(target) {
        CustomEventBase.prototype.attachEvent.call(this, target);

        if (tui.util.browser.firefox) {
            eventListener.on(target, 'DOMMouseScroll', this._onMousewheel, this);
        } else {
            eventListener.on(target, 'mousewheel', this._onMousewheel, this);
        }
    }
});

tui.util.CustomEvents.mixin(MapChartCustomEvent);

module.exports = MapChartCustomEvent;

},{"../const":31,"../helpers/domHandler":59,"../helpers/eventListener":60,"../helpers/renderUtil":63,"./customEventBase":36}],39:[function(require,module,exports){
/**
 * @fileoverview SimpleCustomEvent is event handle layer for simply sending clientX, clientY.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var CustomEventBase = require('./customEventBase');
var renderUtil = require('../helpers/renderUtil');

var SimpleCustomEvent = tui.util.defineClass(CustomEventBase, /** @lends SimpleCustomEvent.prototype */ {
    /**
     * SimpleCustomEvent is event handle layer for simply sending clientX, clientY.
     * @constructs SimpleCustomEvent
     * @param {object} params parameters
     *      @param {BoundsMaker} params.boundsMaker - bounds maker instance
     *      @param {string} params.chartType - chart type
     * @extends CustomEventBase
     */
    init: function(params) {
        this.boundsMaker = params.boundsMaker;
        this.chartType = params.chartType;
    },

    /**
     * Render event handle layer area
     * @param {HTMLElement} customEventContainer - container element for custom event
     * @private
     */
    _renderCustomEventArea: function(customEventContainer) {
        var bound = this.boundsMaker.getBound('customEvent');
        renderUtil.renderDimension(customEventContainer, bound.dimension);
        renderUtil.renderPosition(customEventContainer, bound.position);
    },

    /**
     * Initialize data of custom event
     * @override
     */
    initCustomEventData: function() {},

    /**
     * On click.
     * @param {MouseEvent} e - mouse event
     * @private
     * @override
     */
    _onClick: function(e) {
        this._onMouseEvent('click', e);
    },

    /**
     * On mouse move.
     * @param {MouseEvent} e - mouse event
     * @private
     * @override
     */
    _onMousemove: function(e) {
        this._onMouseEvent('move', e);
    },

    /**
     * On mouse out.
     * @param {MouseEvent} e - mouse event
     * @private
     * @override
     */
    _onMouseout: function(e) {
        this._onMouseEvent('move', e);
    }
});

tui.util.CustomEvents.mixin(SimpleCustomEvent);

module.exports = SimpleCustomEvent;

},{"../helpers/renderUtil":63,"./customEventBase":36}],40:[function(require,module,exports){
/**
 * @fileoverview TickBaseDataModel is tick base data model.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var predicate = require('../helpers/predicate');

var TickBaseDataModel = tui.util.defineClass(/** @lends TickBaseDataModel.prototype */ {
    /**
     * TickBaseDataModel is tick base data model.
     * @param {{width: number, height: number}} dimension dimension
     * @param {number} tickCount tick count
     * @param {string} chartType chart type
     * @param {boolean} isVertical whether vertical or not
     * @param {Array.<string>} [chartTypes] - chart types of combo chart
     * @constructs TickBaseDataModel
     */
    init: function(dimension, tickCount, chartType, isVertical, chartTypes) {
        /**
         * whether line type or not
         * @type {boolean}
         */
        this.isLineType = predicate.isLineTypeChart(chartType, chartTypes);

        this.data = this._makeData(dimension, tickCount, isVertical);
    },

    /**
     * Make tick base data about line type chart.
     * @param {number} width width
     * @param {number} tickCount tick count
     * @returns {Array} tick base data
     * @private
     */
    _makeLineTypeData: function(width, tickCount) {
        var tickInterval = (width + 1) / (tickCount - 1),
            halfInterval = tickInterval / 2,
            ranges = tui.util.map(tui.util.range(0, tickCount), function(index) {
                return {
                    min: index * tickInterval - halfInterval,
                    max: index * tickInterval + halfInterval
                };
            });
        ranges[tickCount - 1].max -= 1;

        return ranges;
    },

    /**
     * Make tick base data about non line type chart.
     * @param {number} size width or height
     * @param {number} tickCount tick count
     * @returns {Array} tick base data
     * @private
     */
    _makeNormalData: function(size, tickCount) {
        var len = tickCount - 1;
        var tickInterval = size / len;
        var prev = 0;

        return tui.util.map(tui.util.range(0, len), function(index) {
            var max = tui.util.min([size, (index + 1) * tickInterval]);
            var limit = {
                min: prev,
                max: max
            };
            prev = max;

            return limit;
        });
    },

    /**
     * Make tick base data for custom event.
     * @param {{width: number, height: number}} dimension dimension
     * @param {number} tickCount tick count
     * @param {boolean} isVertical whether vertical or not
     * @returns {Array.<object>} tick base data
     * @private
     */
    _makeData: function(dimension, tickCount, isVertical) {
        var sizeType = isVertical ? 'width' : 'height';
        var data;

        if (this.isLineType) {
            data = this._makeLineTypeData(dimension[sizeType], tickCount);
        } else {
            data = this._makeNormalData(dimension[sizeType], tickCount);
        }

        return data;
    },

    /**
     * Find index.
     * @param {number} pointValue mouse position point value
     * @returns {number} group index
     */
    findIndex: function(pointValue) {
        var foundIndex = -1;

        tui.util.forEachArray(this.data, function(limit, index) {
            if (limit.min < pointValue && limit.max >= pointValue) {
                foundIndex = index;

                return false;
            }

            return true;
        });

        return foundIndex;
    },

    /**
     * Get last index.
     * @returns {number}
     */
    getLastIndex: function() {
        return this.data.length - 1;
    },

    /**
     * Make range of tooltip position.
     * @param {number} index index
     * @param {string} chartType chart type
     * @returns {{start: number, end: number}} range type value
     * @private
     */
    makeRange: function(index) {
        var limit = this.data[index],
            range, center;
        if (this.isLineType) {
            center = parseInt(limit.max - (limit.max - limit.min) / 2, 10);
            range = {
                start: center,
                end: center
            };
        } else {
            range = {
                start: limit.min,
                end: limit.max
            };
        }

        return range;
    }
});

module.exports = TickBaseDataModel;

},{"../helpers/predicate":61}],41:[function(require,module,exports){
/**
 * @fileoverview  Mixer for zoom event of area type custom event.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var CustomEventBase = require('./customEventBase');
var chartConst = require('../const');
var dom = require('../helpers/domHandler');
var renderUtil = require('../helpers/renderUtil');
var eventListener = require('../helpers/eventListener');

/**
 * Mixer for zoom event of area type custom event.
 * @mixin
 */
var zoomMixer = {
    /**
     * Initialize for zoom.
     * @param {boolean} zoomable - whether zoomable or not
     * @private
     */
    _initForZoom: function(zoomable) {
        /**
         * whether zoomable or not
         * @type {boolean}
         */
        this.zoomable = zoomable;

        /**
         * drag start index.
         * @type {null | object}
         */
        this.dragStartIndexes = null;

        /**
         * start client position(clientX, clientY) of mouse event.
         * @type {null | {x: number, y: number}}
         */
        this.startClientPosition = null;

        /**
         * start layerX position
         * @type {null | number}
         */
        this.startLayerX = null;

        /**
         * drag selection element
         * @type {null | HTMLElement}
         */
        this.dragSelectionElement = null;

        /**
         * container bound
         * @type {null | {left: number, right: number, top: number}}
         */
        this.containerBound = null;

        /**
         * whether show tooltip after zoom or not.
         * @type {boolean}
         */
        this.isShowTooltipAfterZoom = false;

        /**
         * whether after mouseup or not.
         * @type {boolean}
         */
        this.afterMouseup = false;

        /**
         * previouse distance of range
         * @type {null | number}
         */
        this.prevDistanceOfRange = null;

        /**
         * whether reverse move or not.
         * @type {null | number}
         */
        this.reverseMove = null;

        /**
         * reset zoom button element.
         * @type {null | HTMLElement}
         */
        this.resetZoomBtn = null;
    },

    /**
     * Show tooltip after zoom.
     * @private
     */
    _showTooltipAfterZoom: function() {
        var isShowTooltipAfterZoom = this.isShowTooltipAfterZoom;
        var lastDataBeforeZoom;

        this.isShowTooltipAfterZoom = false;

        if (!isShowTooltipAfterZoom || !this.dragStartIndexes) {
            return;
        }

        if (this.reverseMove) {
            lastDataBeforeZoom = this._getFirstData(this.dragStartIndexes.index);
        } else {
            lastDataBeforeZoom = this._getLastData(this.dragEndIndexes.index);
        }

        this._showTooltip(lastDataBeforeZoom);
    },

    /**
     * Update dimension for drag selection element.
     * @param {HTMLElement} selectionElement - drag selection element
     * @private
     */
    _updateDimensionForDragSelection: function(selectionElement) {
        renderUtil.renderDimension(selectionElement, {
            height: this.boundsMaker.getDimension('customEvent').height
        });
    },

    /**
     * Render drag selection.
     * @returns {HTMLElement}
     * @private
     */
    _renderDragSelection: function() {
        var selectionElement = dom.create('DIV', 'tui-chart-drag-selection');

        this._updateDimensionForDragSelection(selectionElement);

        return selectionElement;
    },

    /**
     * Render.
     * @param {object} data - data for rendering
     * @returns {HTMLElement}
     * @override
     */
    render: function(data) {
        var container = CustomEventBase.prototype.render.call(this, data);
        var selectionElement = this._renderDragSelection();

        dom.append(container, selectionElement);
        this.dragSelectionElement = selectionElement;

        return container;
    },

    /**
     * Calculate layer position by client position.
     * @param {number} clientX - clientX
     * @param {number} [clientY] - clientY
     * @param {boolean} [checkLimit] - whether check limit or not
     * @returns {{x: number, y: ?number}}
     * @private
     */
    _calculateLayerPosition: function(clientX, clientY, checkLimit) {
        var bound = this._getContainerBound();
        var layerPosition = {};
        var expandSize = this.expandSize;
        var maxLeft, minLeft;

        checkLimit = tui.util.isUndefined(checkLimit) ? true : checkLimit;

        if (checkLimit) {
            maxLeft = bound.right - expandSize;
            minLeft = bound.left + expandSize;
            clientX = Math.min(Math.max(clientX, minLeft), maxLeft);
        }

        layerPosition.x = clientX - bound.left;

        if (!tui.util.isUndefined(clientY)) {
            layerPosition.y = clientY - bound.top;
        }

        return layerPosition;
    },

    /**
     * Resize.
     * @param {{tickCount: number}} data - data for resizing
     * @override
     */
    resize: function(data) {
        this.containerBound = null;
        CustomEventBase.prototype.resize.call(this, data);
        this._updateDimensionForDragSelection(this.dragSelectionElement);
    },

    /**
     * On click
     * @private
     * @override
     */
    _onClick: function() {},

    /**
     * Whether after drag mouseup or not.
     * @returns {boolean}
     * @private
     */
    _isAfterDragMouseup: function() {
        var afterMouseup = this.afterMouseup;

        if (afterMouseup) {
            this.afterMouseup = false;
        }

        return afterMouseup;
    },

    /**
     * Bind drag event for zoom.
     * @param {HTMLElement} target - target element
     * @private
     */
    _bindDragEvent: function(target) {
        if (target.setCapture) {
            target.setCapture();
        }

        eventListener.on(document, 'mousemove', this._onDrag, this);
        eventListener.off(this.customEventContainer, 'mouseup', this._onMouseup, this);
        eventListener.on(document, 'mouseup', this._onMouseupAfterDrag, this);
    },

    /**
     * Unbind drag event for zoom.
     * @private
     */
    _unbindDragEvent: function() {
        if (this.downTarget && this.downTarget.releaseCapture) {
            this.downTarget.releaseCapture();
        }

        eventListener.off(document, 'mousemove', this._onDrag, this);
        eventListener.off(document, 'mouseup', this._onMouseupAfterDrag, this);
        eventListener.on(this.customEventContainer, 'mouseup', this._onMouseup, this);
    },

    /**
     * On mouse down.
     * @param {MouseEvent} e - mouse event
     * @private
     * @override
     */
    _onMousedown: function(e) {
        var target;

        if (!this.zoomable) {
            return;
        }

        target = e.target || e.srcElement;

        this.startClientPosition = {
            x: e.clientX,
            y: e.clientY
        };
        this.startLayerX = this._calculateLayerPosition(e.clientX).x;
        this.downTarget = target;

        this._bindDragEvent(target);
    },

    /**
     * Show drag selection.
     * @param {number} clientX - clientX
     * @private
     */
    _showDragSelection: function(clientX) {
        var layerX = this._calculateLayerPosition(clientX).x;
        var left = Math.min(layerX, this.startLayerX);
        var width = Math.abs(layerX - this.startLayerX);
        var element = this.dragSelectionElement;

        element.style.left = left + chartConst.SERIES_EXPAND_SIZE + 'px';
        element.style.width = width + 'px';

        dom.addClass(element, 'show');
    },

    /**
     * Hide drag selection.
     * @private
     */
    _hideDragSelection: function() {
        dom.removeClass(this.dragSelectionElement, 'show');
    },

    /**
     * On mouse drag.
     * @param {MouseEvent} e - mouse event
     * @private
     */
    _onDrag: function(e) {
        var clientPos = this.startClientPosition;

        if (tui.util.isNull(this.dragStartIndexes)) {
            this.dragStartIndexes = this._findData(clientPos.x, clientPos.y).indexes;
        } else {
            this._showDragSelection(e.clientX);
        }
    },

    /**
     * Adjust index range for ensure three indexes.
     * @param {number} startIndex - start index
     * @param {number} endIndex - end index
     * @returns {Array.<number>}
     * @private
     */
    _adjustIndexRange: function(startIndex, endIndex) {
        var indexRange = [startIndex, endIndex].sort(function(a, b) {
            return a - b;
        });
        var distanceOfRange = indexRange[1] - indexRange[0];

        if (distanceOfRange === 0) {
            if (indexRange[0] === 0) {
                indexRange[1] += 2;
            } else {
                indexRange[0] -= 1;
                indexRange[1] += 1;
            }
        } else if (distanceOfRange === 1) {
            if (indexRange[0] === 0) {
                indexRange[1] += 1;
            } else {
                indexRange[0] -= 1;
            }
        }

        return indexRange;
    },

    /**
     * Fire zoom custom event.
     * @param {number} startIndex - start index
     * @param {number} endIndex - end index
     * @private
     */
    _fireZoom: function(startIndex, endIndex) {
        var reverseMove = startIndex > endIndex;
        var indexRange = this._adjustIndexRange(startIndex, endIndex);
        var distanceOfRange = indexRange[1] - indexRange[0];

        if (this.prevDistanceOfRange === distanceOfRange) {
            return;
        }

        this.prevDistanceOfRange = distanceOfRange;
        this.reverseMove = reverseMove;
        this.fire('zoom', indexRange);
    },

    /**
     * Set flag about whether show tooltip after zoom or not.
     * @param {number} clientX - clientX of mouse event
     * @param {number} clientY - clientY of mouse event
     * @private
     */
    _setIsShowTooltipAfterZoomFlag: function(clientX, clientY) {
        var layerX = this._calculateLayerPosition(clientX, clientY, false).x;
        var limitLayerX = this._calculateLayerPosition(clientX, clientY).x;

        this.isShowTooltipAfterZoom = (layerX === limitLayerX);
    },

    /**
     * On mouseup after drag event.
     * @param {MouseEvent} e - mouse event
     * @private
     */
    _onMouseupAfterDrag: function(e) {
        var target;

        this._unbindDragEvent();

        if (tui.util.isNull(this.dragStartIndexes)) {
            target = e.target || e.srcElement;
            if (dom.hasClass(target, chartConst.CLASS_NAME_RESET_ZOOM_BTN)) {
                this._hideTooltip();
                this.prevDistanceOfRange = null;
                this.fire('resetZoom');
            } else {
                CustomEventBase.prototype._onClick.call(this, e);
            }
        } else {
            this.dragEndIndexes = this._findData(e.clientX, e.clientY).indexes;
            this._setIsShowTooltipAfterZoomFlag(e.clientX, e.clientY);
            this._hideDragSelection();
            this._fireZoom(this.dragStartIndexes.groupIndex, this.dragEndIndexes.groupIndex);
        }

        this.startClientPosition = null;
        this.dragStartIndexes = null;
        this.startLayerX = null;
        this.afterMouseup = true;
    },

    /**
     * Render reset zoom button element.
     * @returns {HTMLElement}
     * @private
     */
    _renderResetZoomBtn: function() {
        var resetBtn = dom.create('DIV', chartConst.CLASS_NAME_RESET_ZOOM_BTN);
        resetBtn.innerHTML = 'Reset Zoom';

        return resetBtn;
    },

    /**
     * Zoom.
     * @param {object} data - data for rendering
     */
    zoom: function(data) {
        this.prevFoundData = null;
        this.rerender(data);
        this._updateDimensionForDragSelection(this.dragSelectionElement);

        if (!this.resetZoomBtn) {
            this.resetZoomBtn = this._renderResetZoomBtn();
            dom.append(this.customEventContainer, this.resetZoomBtn);
        } else if (data.isResetZoom) {
            this.customEventContainer.removeChild(this.resetZoomBtn);
            this.resetZoomBtn = null;
        }
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

module.exports = zoomMixer;

},{"../const":31,"../helpers/domHandler":59,"../helpers/eventListener":60,"../helpers/renderUtil":63,"./customEventBase":36}],42:[function(require,module,exports){
/**
 * @fileoverview DataProcessor process rawData.
 * rawData.categories --> categories
 * rawData.series --> SeriesDataModel, legendLabels, legendData
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const');
var SeriesDataModel = require('../dataModels/seriesDataModel');
var SeriesDataModelForTreemap = require('../dataModels/seriesDataModelForTreemap');
var SeriesGroup = require('./seriesGroup');
var rawDataHandler = require('../helpers/rawDataHandler');
var predicate = require('../helpers/predicate');
var renderUtil = require('../helpers/renderUtil');

var concat = Array.prototype.concat;

/**
 * Raw series datum.
 * @typedef {{name: ?string, data: Array.<number>, stack: ?string}} rawSeriesDatum
 */

/**
 * Raw series data.
 * @typedef {Array.<rawSeriesDatum>} rawSeriesData
 */

/**
 * Raw data by user.
 * @typedef {{
 *      categories: ?Array.<string>,
 *      series: (rawSeriesData|{line: ?rawSeriesData, column: ?rawSeriesData})
 * }} rawData
 */

/**
 * SeriesDataModel is base model for drawing graph of chart series area,
 *      and create from rawSeriesData by user,
 * SeriesDataModel.groups has SeriesGroups.
 */

/**
 * SeriesGroup is a element of SeriesDataModel.groups.
 * SeriesGroup.items has SeriesItem.
 */

var DataProcessor = tui.util.defineClass(/** @lends DataProcessor.prototype */{
    /**
     * Data processor.
     * @constructs DataProcessor
     * @param {rawData} rawData raw data
     * @param {string} chartType chart type
     * @param {object} options options
     * @param {Array.<string>} seriesNames chart types
     */
    init: function(rawData, chartType, options, seriesNames) {
        var seriesOption = options.series || {};

        /**
         * original raw data.
         * @type {{categories: ?Array.<string>, series: Array.<object>}}
         */
        this.originalRawData = JSON.parse(JSON.stringify(rawData));

        /**
         * chart type
         * @type {string}
         */
        this.chartType = chartType;

        /**
         * chart options
         * @type {Object}
         */
        this.options = options;

        /**
         * seriesNames is sorted chart types for rendering series area of combo chart.
         * @type {Array.<string>}
         */
        this.seriesNames = seriesNames;

        /**
         * diverging option
         * @type {boolean}
         */
        this.divergingOption = predicate.isBarTypeChart(options.chartType) && seriesOption.diverging;

        /**
         * legend data for rendering legend of group tooltip
         * @type {Array.<{chartType: string, label: string}>}
         */
        this.originalLegendData = null;

        /**
         * dynamic data array for adding data.
         * @type {Array.<{category: string | number, values: Array.<number>}>}
         */
        this.dynamicData = [];

        this.initData(rawData);
        this.initZoomedRawData();
    },

    /**
     * Get original raw data.
     * @returns {rawData} raw data
     */
    getOriginalRawData: function() {
        return JSON.parse(JSON.stringify(this.originalRawData));
    },

    /**
     * Get zoomed raw data.
     * @returns {*|null}
     */
    getZoomedRawData: function() {
        var zoomedRawData = this.zoomedRawData;
        if (zoomedRawData) {
            zoomedRawData = JSON.parse(JSON.stringify(zoomedRawData));
        } else {
            zoomedRawData = this.getOriginalRawData();
        }

        return zoomedRawData;
    },

    /**
     * Filter seriesData by index range.
     * @param {Array.<{data: Array}>} seriesData - series data
     * @param {number} startIndex - start index
     * @param {number} endIndex - end index
     * @returns {Array.<Array.<object>>}
     * @private
     */
    _filterSeriesDataByIndexRange: function(seriesData, startIndex, endIndex) {
        tui.util.forEachArray(seriesData, function(seriesDatum) {
            seriesDatum.data = seriesDatum.data.slice(startIndex, endIndex + 1);
        });

        return seriesData;
    },

    /**
     * Filter raw data by index range.
     * @param {{series: Array.<object>, categories: Array.<string>}} rawData - raw data
     * @param {Array.<number>} indexRange - index range for zoom
     * @returns {*}
     * @private
     */
    _filterRawDataByIndexRange: function(rawData, indexRange) {
        var self = this;
        var startIndex = indexRange[0];
        var endIndex = indexRange[1];

        if (tui.util.isArray(rawData.series)) {
            rawData.series = this._filterSeriesDataByIndexRange(rawData.series, startIndex, endIndex);
        } else {
            tui.util.forEach(rawData.series, function(seriesDataSet, seriesName) {
                rawData.series[seriesName] = self._filterSeriesDataByIndexRange(seriesDataSet, startIndex, endIndex);
            });
        }

        rawData.categories = rawData.categories.slice(startIndex, endIndex + 1);

        return rawData;
    },

    /**
     * Update raw data for zoom
     * @param {Array.<number>} indexRange - index range for zoom
     */
    updateRawDataForZoom: function(indexRange) {
        var rawData = this.getRawData();
        var zoomedRawData = this.getZoomedRawData();

        this.zoomedRawData = this._filterRawDataByIndexRange(zoomedRawData, indexRange);
        rawData = this._filterRawDataByIndexRange(rawData, indexRange);
        this.initData(rawData);
    },

    /**
     * Init zoomed raw data.
     */
    initZoomedRawData: function() {
        this.zoomedRawData = null;
    },

    /**
     * Initialize data.
     * @param {rawData} rawData raw data
     */
    initData: function(rawData) {
        /**
         * raw data
         * @type {rawData}
         */
        this.rawData = rawData;

        /**
         * categories
         * @type {Array.<string>}
         */
        this.categoriesMap = null;

        /**
         * stacks
         * @type {Array.<number>}
         */
        this.stacks = null;

        /**
         * seriesDataModel map
         * @type {object.<string, SeriesDataModel>}
         */
        this.seriesDataModelMap = {};

        /**
         * SeriesGroups
         * @type {Array.<SeriesGroup>}
         */
        this.seriesGroups = null;

        /**
         * map of values of SeriesItems
         * @type {Object.<string, Array.<number>>}
         */
        this.valuesMap = {};

        /**
         * legend labels for rendering legend area
         * @type {{column: Array.<string>, line: Array.<string> | Array.<string>}}
         */
        this.legendLabels = null;

        /**
         * legend data for rendering legend
         * @type {Array.<{chartType: string, label: string}>}
         */
        this.legendData = null;

        /**
         * functions for formatting
         * @type {Array.<function>}
         */
        this.formatFunctions = null;

        /**
         * multiline categories
         * @type {Array.<string>}
         */
        this.multilineCategories = null;
    },

    /**
     * Get raw data.
     * @returns {rawData}
     */
    getRawData: function() {
        return this.rawData;
    },

    /**
     * Find chart type from series name.
     * @param {string} seriesName - series name
     * @returns {*}
     */
    findChartType: function(seriesName) {
        return rawDataHandler.findChartType(this.rawData.seriesAlias, seriesName);
    },

    /**
     * Escape categories
     * @param {Array.<string, number>} categories - cetegories
     * @returns {*|Array.<Object>|Array}
     * @private
     */
    _escapeCategories: function(categories) {
        return tui.util.map(categories, function(category) {
            return tui.util.encodeHTMLEntity(String(category));
        });
    },

    /**
     * Process categories
     * @param {string} type - category type (x or y)
     * @returns {null | Array.<string>} processed categories
     * @private
     */
    _processCategories: function(type) {
        var rawCategories = this.rawData.categories;
        var categoriesMap = {};

        if (tui.util.isArray(rawCategories)) {
            categoriesMap[type] = this._escapeCategories(rawCategories);
        } else if (rawCategories) {
            if (rawCategories.x) {
                categoriesMap.x = this._escapeCategories(rawCategories.x);
            }

            if (rawCategories.y) {
                categoriesMap.y = this._escapeCategories(rawCategories.y).reverse();
            }
        }

        return categoriesMap;
    },

    /**
     * Get Categories
     * @param {boolean} isVertical - whether vertical or not
     * @returns {Array.<string>}}
     */
    getCategories: function(isVertical) {
        var type = isVertical ? 'y' : 'x';
        var foundCategories = [];

        if (!this.categoriesMap) {
            this.categoriesMap = this._processCategories(type);
        }

        if (tui.util.isExisty(isVertical)) {
            foundCategories = this.categoriesMap[type] || [];
        } else {
            tui.util.forEach(this.categoriesMap, function(categories) {
                foundCategories = categories;

                return false;
            });
        }

        return foundCategories;
    },

    /**
     * Get category count.
     * @param {boolean} isVertical - whether vertical or not
     * @returns {*}
     */
    getCategoryCount: function(isVertical) {
        var categories = this.getCategories(isVertical);

        return categories ? categories.length : 0;
    },

    /**
     * Whether has categories or not.
     * @param {boolean} isVertical - whether vertical or not
     * @returns {boolean}
     */
    hasCategories: function(isVertical) {
        return !!this.getCategoryCount(isVertical);
    },

    /**
     * Get category.
     * @param {number} index index
     * @param {boolean} isVertical - whether vertical or not
     * @returns {string} category
     */
    getCategory: function(index, isVertical) {
        return this.getCategories(isVertical)[index];
    },

    /**
     * Get category for tooltip.
     * @param {number} firstIndex - index
     * @param {number} oppositeIndex - opposite index
     * @param {boolean} isVerticalChart - whether vertical chart or not
     * @returns {string}
     */
    getTooltipCategory: function(firstIndex, oppositeIndex, isVerticalChart) {
        var isHorizontal = !isVerticalChart;
        var category = this.getCategory(firstIndex, isHorizontal);
        var categoryCount = this.getCategoryCount(!isHorizontal);

        if (categoryCount) {
            category += ', ' + this.getCategory(categoryCount - oppositeIndex - 1, isVerticalChart);
        }

        return category;
    },

    /**
     * Get stacks.
     * @returns {Array.<string>}
     */
    getStacks: function() {
        if (!this.stacks) {
            this.stacks = rawDataHandler.pickStacks(this.rawData.series);
        }

        return this.stacks;
    },

    /**
     * Get stack count.
     * @returns {Number}
     */
    getStackCount: function() {
        return this.getStacks().length;
    },

    /**
     * Find stack index.
     * @param {string} stack stack
     * @returns {number}
     */
    findStackIndex: function(stack) {
        return tui.util.inArray(stack, this.getStacks());
    },

    /**
     * Get SeriesDataModel.
     * @param {string} seriesName - series name
     * @returns {SeriesDataModel}
     */
    getSeriesDataModel: function(seriesName) {
        var rawSeriesData, chartType, SeriesDataModelClass;

        if (!this.seriesDataModelMap[seriesName]) {
            chartType = this.findChartType(seriesName);
            rawSeriesData = this.rawData.series[seriesName] || this.rawData.series;

            if (predicate.isTreemapChart(this.chartType)) {
                SeriesDataModelClass = SeriesDataModelForTreemap;
            } else {
                SeriesDataModelClass = SeriesDataModel;
            }

            this.seriesDataModelMap[seriesName] = new SeriesDataModelClass(rawSeriesData, chartType,
                this.options, this.getFormatFunctions());
        }

        return this.seriesDataModelMap[seriesName];
    },

    /**
     * Get group count.
     * @param {string} chartType chart type
     * @returns {number}
     */
    getGroupCount: function(chartType) {
        return this.getSeriesDataModel(chartType).getGroupCount();
    },

    /**
     * Push category.
     * @param {string} category - category
     * @private
     */
    _pushCategory: function(category) {
        this.rawData.categories.push(category);
        this.originalRawData.categories.push(category);
    },

    /**
     * Shift category.
     * @private
     */
    _shiftCategory: function() {
        this.rawData.categories.shift();
        this.originalRawData.categories.shift();
    },

    /**
     * Find raw series datum by name.
     * @param {string} name - legend name
     * @param {string} [seriesName] - series name
     * @returns {object}
     * @private
     */
    _findRawSeriesDatumByName: function(name, seriesName) {
        var foundSeriesDatum = null;
        var seriesData = seriesName ? this.rawData.series[seriesName] : this.rawData.series;

        tui.util.forEachArray(seriesData, function(seriesDatum) {
            var isEqual = seriesDatum.name === name;

            if (isEqual) {
                foundSeriesDatum = seriesDatum;
            }

            return !isEqual;
        });

        return foundSeriesDatum;
    },

    /**
     * Push values to series of originalRawData and series of rawData.
     * @param {Array.<{name: string, data: Array}>} seriesData - series data
     * @param {Array} values - values
     * @param {string} [seriesName] - series name
     * @private
     */
    _pushValues: function(seriesData, values, seriesName) {
        var self = this;

        tui.util.forEachArray(seriesData, function(seriesDatum, index) {
            var value = values[index];
            var rawSeriesDatum = self._findRawSeriesDatumByName(seriesDatum.name, seriesName);

            seriesDatum.data.push(value);
            if (rawSeriesDatum) {
                rawSeriesDatum.data.push(value);
            }
        });
    },

    /**
     * Push series data.
     * @param {Array.<number>} values - values
     * @private
     */
    _pushSeriesData: function(values) {
        var self = this;

        if (tui.util.isArray(this.originalRawData.series)) {
            this._pushValues(this.originalRawData.series, values);
        } else {
            tui.util.forEach(this.originalRawData.series, function(seriesData, seriesName) {
                self._pushValues(seriesData, values[seriesName], seriesName);
            });
        }
    },

    /**
     * Shift values.
     * @param {Array.<{name: string, data: Array}>} seriesData - series data
     * @param {string} seriesName - series name
     * @private
     */
    _shiftValues: function(seriesData, seriesName) {
        var self = this;

        tui.util.forEachArray(seriesData, function(seriesDatum) {
            var rawSeriesDatum = self._findRawSeriesDatumByName(seriesDatum.name, seriesName);

            seriesDatum.data.shift();
            if (rawSeriesDatum) {
                rawSeriesDatum.data.shift();
            }
        });
    },

    /**
     * Shift series data.
     * @private
     */
    _shiftSeriesData: function() {
        var self = this;

        if (tui.util.isArray(this.originalRawData.series)) {
            this._shiftValues(this.originalRawData.series);
        } else {
            tui.util.forEach(this.originalRawData.series, function(seriesData, seriesName) {
                self._shiftValues(seriesData, seriesName);
            });
        }
    },

    /**
     * Add dynamic data.
     * @param {string} category - category
     * @param {Array.<number>} values - values
     */
    addDynamicData: function(category, values) {
        this.dynamicData.push({
            category: category,
            values: values
        });
    },

    /**
     * Add data from dynapmic data.
     * @returns {boolean}
     */
    addDataFromDynamicData: function() {
        var datum = this.dynamicData.shift();

        if (!datum) {
            return false;
        }

        this._pushCategory(datum.category);
        this._pushSeriesData(datum.values);

        this.initData(this.rawData);

        return true;
    },

    /**
     * Shift data.
     */
    shiftData: function() {
        this._shiftCategory();
        this._shiftSeriesData();

        this.initData(this.rawData);
    },

    /**
     * Add data from remain dynamic data.
     * @param {boolean} shiftingOption - whether has shifting option or not.
     */
    addDataFromRemainDynamicData: function(shiftingOption) {
        var self = this;
        var dynamicData = this.dynamicData;

        this.dynamicData = [];

        tui.util.forEach(dynamicData, function(datum) {
            self._pushCategory(datum.category);
            self._pushSeriesData(datum.values);
            if (shiftingOption) {
                self._shiftCategory();
                self._shiftSeriesData();
            }
        });

        this.initData(this.rawData);
    },

    /**
     * Traverse all SeriesDataModel by seriesNames, and executes iteratee function.
     * @param {function} iteratee iteratee function
     * @private
     */
    _eachByAllSeriesDataModel: function(iteratee) {
        var self = this,
            seriesNames = this.seriesNames || [this.chartType];

        tui.util.forEachArray(seriesNames, function(chartType) {
            return iteratee(self.getSeriesDataModel(chartType), chartType);
        });
    },

    /**
     * Whether valid all SeriesDataModel or not.
     * @returns {boolean}
     */
    isValidAllSeriesDataModel: function() {
        var isValid = true;

        this._eachByAllSeriesDataModel(function(seriesDataModel) {
            isValid = !!seriesDataModel.getGroupCount();

            return isValid;
        });

        return isValid;
    },

    /**
     * Make SeriesGroups.
     * @returns {Array.<SeriesGroup>}
     * @private
     */
    _makeSeriesGroups: function() {
        var joinedGroups = [],
            seriesGroups;

        this._eachByAllSeriesDataModel(function(seriesDataModel) {
            seriesDataModel.each(function(seriesGroup, index) {
                if (!joinedGroups[index]) {
                    joinedGroups[index] = [];
                }
                joinedGroups[index] = joinedGroups[index].concat(seriesGroup.items);
            });
        });

        seriesGroups = tui.util.map(joinedGroups, function(items) {
            return new SeriesGroup(items);
        });

        return seriesGroups;
    },

    /**
     * Get SeriesGroups.
     * @returns {Array.<SeriesGroup>}
     */
    getSeriesGroups: function() {
        if (!this.seriesGroups) {
            this.seriesGroups = this._makeSeriesGroups();
        }

        return this.seriesGroups;
    },

    /**
     * Get value.
     * @param {number} groupIndex group index
     * @param {number} index index
     * @param {?string} chartType chart type
     * @returns {number} value
     */
    getValue: function(groupIndex, index, chartType) {
        return this.getSeriesDataModel(chartType).getValue(groupIndex, index);
    },

    /**
     * Create values that picked value from SeriesItems of specific SeriesDataModel.
     * @param {?string} chartType - type of chart
     * @param {?string} valueType - type of value like value, x, y, r.
     * @returns {Array.<number>}
     * @private
     */
    _createValues: function(chartType, valueType) {
        var values;

        if (chartType === chartConst.DUMMY_KEY) {
            values = [];
            this._eachByAllSeriesDataModel(function(seriesDataModel) {
                values = values.concat(seriesDataModel.getValues(valueType));
            });
        } else {
            values = this.getSeriesDataModel(chartType).getValues(valueType);
        }

        return values;
    },

    /**
     * Get values from valuesMap.
     * @param {?string} chartType - type of chart
     * @param {?string} valueType - type of value like value, x, y, r.
     * @returns {Array.<number>}
     */
    getValues: function(chartType, valueType) {
        var mapKey;

        chartType = chartType || chartConst.DUMMY_KEY;

        mapKey = chartType + valueType;

        if (!this.valuesMap[mapKey]) {
            this.valuesMap[mapKey] = this._createValues(chartType, valueType);
        }

        return this.valuesMap[mapKey];
    },

    /**
     * Get max value.
     * @param {?string} chartType - type of chart
     * @param {?string} valueType - type of value like value, x, y, r
     * @returns {number}
     */
    getMaxValue: function(chartType, valueType) {
        return tui.util.max(this.getValues(chartType, valueType));
    },

    /**
     * Get formatted max value.
     * @param {?string} chartType - type of chart
     * @param {?string} areaType - type of area like circleLegend
     * @param {?string} valueType - type of value like value, x, y, r
     * @returns {string | number}
     */
    getFormattedMaxValue: function(chartType, areaType, valueType) {
        var maxValue = this.getMaxValue(chartType, valueType);
        var formatFunctions = this.getFormatFunctions();

        return renderUtil.formatValue(maxValue, formatFunctions, chartType, areaType, valueType);
    },

    /**
     * Traverse SeriesGroup of all SeriesDataModel, and executes iteratee function.
     * @param {function} iteratee iteratee function
     * @param {boolean} [isPivot] - whether pivot or not
     */
    eachBySeriesGroup: function(iteratee, isPivot) {
        this._eachByAllSeriesDataModel(function(seriesDataModel, chartType) {
            seriesDataModel.each(function(seriesGroup, groupIndex) {
                iteratee(seriesGroup, groupIndex, chartType);
            }, isPivot);
        });
    },

    /**
     * Pick legend label.
     * @param {object} item item
     * @returns {string} label
     * @private
     */
    _pickLegendLabel: function(item) {
        return item.name ? tui.util.encodeHTMLEntity(item.name) : null;
    },

    /**
     * Pick legend labels from raw data.
     * @returns {string[]} labels
     */
    _pickLegendLabels: function() {
        var self = this;
        var seriesData = this.rawData.series;
        var legendLabels;

        if (tui.util.isArray(seriesData)) {
            legendLabels = tui.util.map(seriesData, this._pickLegendLabel);
        } else {
            legendLabels = {};
            tui.util.forEach(seriesData, function(seriesDatum, type) {
                legendLabels[type] = tui.util.map(seriesDatum, self._pickLegendLabel);
            });
        }

        legendLabels = tui.util.filter(legendLabels, function(label) {
            return tui.util.isExisty(label);
        });

        return legendLabels;
    },

    /**
     * Get legend labels.
     * @param {?string} chartType chart type
     * @returns {Array.<string> | {column: ?Array.<string>, line: ?Array.<string>}} legend labels
     */
    getLegendLabels: function(chartType) {
        if (!this.legendLabels) {
            this.legendLabels = this._pickLegendLabels();
        }

        return this.legendLabels[chartType] || this.legendLabels;
    },

    /**
     * Make legend data.
     * @returns {Array} labels
     * @private
     */
    _makeLegendData: function() {
        var legendLabels = this.getLegendLabels(),
            seriesNames = this.seriesNames || [this.chartType],
            legendLabelsMap, legendData;

        if (tui.util.isArray(legendLabels)) {
            legendLabelsMap = [this.chartType];
            legendLabelsMap[this.chartType] = legendLabels;
        } else {
            seriesNames = this.seriesNames;
            legendLabelsMap = legendLabels;
        }

        legendData = tui.util.map(seriesNames, function(chartType) {
            return tui.util.map(legendLabelsMap[chartType], function(label) {
                return {
                    chartType: chartType,
                    label: label
                };
            });
        });

        return concat.apply([], legendData);
    },

    /**
     * Get legend data.
     * @returns {Array.<{chartType: string, label: string}>} legend data
     */
    getLegendData: function() {
        if (!this.legendData) {
            this.legendData = this._makeLegendData();
        }

        if (!this.originalLegendData) {
            this.originalLegendData = this.legendData;
        }

        return this.legendData;
    },

    /**
     * get original legend data.
     * @returns {Array.<{chartType: string, label: string}>}
     */
    getOriginalLegendData: function() {
        return this.originalLegendData;
    },

    /**
     * Get legend item.
     * @param {number} index index
     * @returns {{chartType: string, label: string}} legend data
     */
    getLegendItem: function(index) {
        return this.getLegendData()[index];
    },

    /**
     * Get format functions.
     * @returns {Array.<function>} functions
     */
    getFormatFunctions: function() {
        if (!this.formatFunctions) {
            this.formatFunctions = this._findFormatFunctions();
        }

        return this.formatFunctions;
    },

    /**
     * Get first label of SeriesItem.
     * @param {?string} chartType chartType
     * @returns {string} formatted value
     */
    getFirstItemLabel: function(chartType) {
        return this.getSeriesDataModel(chartType).getFirstItemLabel();
    },

    /**
     * Pick max length under point.
     * @param {string[]} values chart values
     * @returns {number} max length under point
     * @private
     */
    _pickMaxLenUnderPoint: function(values) {
        var max = 0;

        tui.util.forEachArray(values, function(value) {
            var len = tui.util.getDecimalLength(value);
            if (len > max) {
                max = len;
            }
        });

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
        return format.indexOf(',') > -1;
    },

    /**
     * Format to zero fill.
     * @param {number} len length of result
     * @param {string} value target value
     * @returns {string} formatted value
     * @private
     */
    _formatToZeroFill: function(len, value) {
        var isMinus = value < 0;

        value = renderUtil.formatToZeroFill(Math.abs(value), len);

        return (isMinus ? '-' : '') + value;
    },

    /**
     * Format to Decimal.
     * @param {number} len length of under decimal point
     * @param {string} value target value
     * @returns {string} formatted value
     * @private
     */
    _formatToDecimal: function(len, value) {
        return renderUtil.formatToDecimal(value, len);
    },

    /**
     * Find simple type format functions.
     * @param {string} format - simple format
     * @returns {Array.<function>}
     */
    _findSimpleTypeFormatFunctions: function(format) {
        var funcs = [];
        var len;

        if (this._isDecimal(format)) {
            len = this._pickMaxLenUnderPoint([format]);
            funcs = [tui.util.bind(this._formatToDecimal, this, len)];
        } else if (this._isZeroFill(format)) {
            len = format.length;
            funcs = [tui.util.bind(this._formatToZeroFill, this, len)];

            return funcs;
        }

        if (this._isComma(format)) {
            funcs.push(renderUtil.formatToComma);
        }

        return funcs;
    },

    /**
     * Find format functions.
     * @returns {function[]} functions
     */
    _findFormatFunctions: function() {
        var format = tui.util.pick(this.options, 'chart', 'format');
        var funcs = [];

        if (tui.util.isFunction(format)) {
            funcs = [format];
        } else if (tui.util.isString(format)) {
            funcs = this._findSimpleTypeFormatFunctions(format);
        }

        return funcs;
    },

    /**
     * Make multiline category.
     * @param {string} category category
     * @param {number} limitWidth limit width
     * @param {object} theme label theme
     * @returns {string} multiline category
     * @private
     */
    _makeMultilineCategory: function(category, limitWidth, theme) {
        var words = String(category).split(/\s+/),
            lineWords = words[0],
            lines = [];

        tui.util.forEachArray(words.slice(1), function(word) {
            var width = renderUtil.getRenderedLabelWidth(lineWords + ' ' + word, theme);

            if (width > limitWidth) {
                lines.push(lineWords);
                lineWords = word;
            } else {
                lineWords += ' ' + word;
            }
        });

        if (lineWords) {
            lines.push(lineWords);
        }

        return lines.join('<br>');
    },

    /**
     * Get multiline categories.
     * @param {number} limitWidth limit width
     * @param {object} theme label theme
     * @param {Array.<(number | string)>} xAxisLabels labels of xAxis
     * @returns {Array} multiline categories
     */
    getMultilineCategories: function(limitWidth, theme, xAxisLabels) {
        var self = this;

        if (!this.multilineCategories) {
            this.multilineCategories = tui.util.map(xAxisLabels, function(category) {
                return self._makeMultilineCategory(category, limitWidth, theme);
            });
        }

        return this.multilineCategories;
    },

    /**
     * Add data ratios of pie chart.
     * @param {string} chartType - type of chart.
     */
    addDataRatiosOfPieChart: function(chartType) {
        this.getSeriesDataModel(chartType).addDataRatiosOfPieChart();
    },

    /**
     * Add data ratios for chart of coordinate type.
     * @param {string} chartType - type of chart.
     * @param {{x: {min: number, max: number}, y: {min: number, max: number}}} limitMap - limit map
     * @param {boolean} [hasRadius] - whether has radius or not
     */
    addDataRatiosForCoordinateType: function(chartType, limitMap, hasRadius) {
        this.getSeriesDataModel(chartType).addDataRatiosForCoordinateType(limitMap, hasRadius);
    },

    /**
     * Add start value to all series item.
     * @param {{min: number, max: number}} limit - limit
     * @param {string} chartType - chart type
     * @private
     */
    _addStartValueToAllSeriesItem: function(limit, chartType) {
        var start = 0;

        if (limit.min >= 0) {
            start = limit.min;
        } else if (limit.max <= 0) {
            start = limit.max;
        }

        this.getSeriesDataModel(chartType).addStartValueToAllSeriesItem(start);
    },

    /**
     * Register percent values.
     * @param {{min: number, max: number}} limit axis limit
     * @param {string} stackType stackType option
     * @param {string} chartType chart type
     * @private
     */
    addDataRatios: function(limit, stackType, chartType) {
        var seriesDataModel = this.getSeriesDataModel(chartType);

        this._addStartValueToAllSeriesItem(limit, chartType);
        seriesDataModel.addDataRatios(limit, stackType);
    },

    /**
     * Add data ratios for treemap chart.
     * @param {{min: number, max: number}} limit - limit
     * @param {string} chartType - chart type
     */
    addDataRatiosForTreemapChart: function(limit, chartType) {
        this.getSeriesDataModel(chartType).addDataRatios(limit);
    }
});

module.exports = DataProcessor;

},{"../const":31,"../dataModels/seriesDataModel":44,"../dataModels/seriesDataModelForTreemap":45,"../helpers/predicate":61,"../helpers/rawDataHandler":62,"../helpers/renderUtil":63,"./seriesGroup":46}],43:[function(require,module,exports){
/**
 * @fileoverview Data processor for map chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var DataProcessor = require('./dataProcessor');
var renderUtil = require('../helpers/renderUtil');

/**
 * Raw series data.
 * @typedef {Array.<{code: string, name: ?string, data: number}>} rawSeriesData
 */

/**
 * Value map.
 * @typedef {{value: number, label: string, name: ?string}} valueMap
 */

var MapChartDataProcessor = tui.util.defineClass(DataProcessor, /** @lends MapChartDataProcessor.prototype */{
    /**
     * Data processor for map chart.
     * @constructs MapChartDataProcessor
     * @extends DataProcessor
     */
    init: function() {
        DataProcessor.apply(this, arguments);
    },

    /**
     * Update raw data.
     * @param {{series: rawSeriesData}} rawData raw data
     */
    initData: function(rawData) {
        this.rawData = rawData;

        /**
         * value map
         * @type {valueMap}
         */
        this.valueMap = null;
    },

    /**
     * Make value map.
     * @returns {valueMap} value map
     * @private
     */
    _makeValueMap: function() {
        var rawSeriesData = this.rawData.series;
        var valueMap = {};
        var formatFunctions = this._findFormatFunctions();

        tui.util.forEachArray(rawSeriesData, function(datum) {
            var result = {
                value: datum.data,
                label: renderUtil.formatValue(datum.data, formatFunctions, 'map', 'series')
            };

            if (datum.name) {
                result.name = datum.name;
            }

            if (datum.labelCoordinate) {
                result.labelCoordinate = datum.labelCoordinate;
            }

            valueMap[datum.code] = result;
        });

        return valueMap;
    },

    /**
     * Get value map.
     * @returns {number} value
     */
    getValueMap: function() {
        if (!this.valueMap) {
            this.valueMap = this._makeValueMap();
        }

        return this.valueMap;
    },

    /**
     * Get values.
     * @returns {Array.<number>} picked values.
     */
    getValues: function() {
        return tui.util.pluck(this.getValueMap(), 'value');
    },

    /**
     * Get valueMap datum.
     * @param {string} code map code
     * @returns {{code: string, name: string, label: number,
     *              labelCoordinate: {x: number, y: number}}} valueMap datum
     */
    getValueMapDatum: function(code) {
        return this.getValueMap()[code];
    },

    /**
     * Add data ratios of map chart.
     * @param {{min: number, max: number}} limit axis limit
     */
    addDataRatios: function(limit) {
        var min = limit.min,
            max = limit.max - min;
        tui.util.forEach(this.getValueMap(), function(map) {
            map.ratio = (map.value - min) / max;
        });
    }
});

module.exports = MapChartDataProcessor;

},{"../helpers/renderUtil":63,"./dataProcessor":42}],44:[function(require,module,exports){
/**
 * @fileoverview SeriesDataModel is base model for drawing graph of chart series area,
 *                  and create from rawSeriesData by user,
 * SeriesDataModel.groups has SeriesGroups.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

/**
 * Raw series datum.
 * @typedef {{name: ?string, data: Array.<number>, stack: ?string}} rawSeriesDatum
 */

/**
 * Raw series data.
 * @typedef {Array.<rawSeriesDatum>} rawSeriesData
 */

/**
 * Groups.
 * @typedef {Array.<SeriesGroup>} groups
 */

/**
 * SeriesGroup is a element of SeriesDataModel.groups.
 * SeriesGroup.items has SeriesItem.
 */

/**
 * SeriesItem is a element of SeriesGroup.items.
 * SeriesItem has processed terminal data like value, ratio, etc.
 */

var SeriesGroup = require('./seriesGroup');
var SeriesItem = require('./seriesItem');
var SeriesItemForCoordinateType = require('./seriesItemForCoordinateType');
var predicate = require('../helpers/predicate');
var calculator = require('../helpers/calculator');

var concat = Array.prototype.concat;

var SeriesDataModel = tui.util.defineClass(/** @lends SeriesDataModel.prototype */{
    /**
     * SeriesDataModel is base model for drawing graph of chart series area,
     *      and create from rawSeriesData by user.
     * SeriesDataModel.groups has SeriesGroups.
     * @constructs SeriesDataModel
     * @param {rawSeriesData} rawSeriesData raw series data
     * @param {string} chartType chart type
     * @param {object} options options
     * @param {Array.<function>} formatFunctions format functions
     */
    init: function(rawSeriesData, chartType, options, formatFunctions) {
        /**
         * chart type
         * @type {string}
         */
        this.chartType = chartType;

        /**
         * chart options
         * @type {Object}
         */
        this.options = options || {};

        /**
         * functions for formatting
         * @type {Array.<function>}
         */
        this.formatFunctions = formatFunctions;

        /**
         * rawData.series
         * @type {rawSeriesData}
         */
        this.rawSeriesData = rawSeriesData || [];

        /**
         * baseGroups is base data for making SeriesGroups.
         * SeriesGroups is made by pivoted baseGroups, lf line type chart.
         * @type {Array.Array<SeriesItem>}
         */
        this.baseGroups = null;

        /**
         * groups has SeriesGroups.
         * @type {Array.<SeriesGroup>}
         */
        this.groups = null;

        /**
         * map of values by value type like value, x, y, r.
         * @type {object.<string, Array.<number>>}
         */
        this.valuesMap = {};

        this._removeRangeValue();
    },

    /**
     * Remove range value of item, if has stackType option.
     * @private
     */
    _removeRangeValue: function() {
        var seriesOption = tui.util.pick(this.options, 'series') || {};

        if (predicate.isAllowRangeData(this.chartType) &&
            !predicate.isValidStackOption(seriesOption.stackType) && !seriesOption.spline) {
            return;
        }

        tui.util.forEachArray(this.rawSeriesData, function(rawItem) {
            if (!tui.util.isArray(rawItem.data)) {
                return;
            }
            tui.util.forEachArray(rawItem.data, function(value, index) {
                rawItem.data[index] = concat.apply(value)[0];
            });
        });
    },

    /**
     * Create base groups.
     * Base groups is two-dimensional array by seriesItems.
     * @returns {Array.<Array.<(SeriesItem | SeriesItemForCoordinateType)>>}
     * @private
     */
    _createBaseGroups: function() {
        var self = this;
        var SeriesItemClass;

        if (predicate.isCoordinateTypeChart(this.chartType)) {
            SeriesItemClass = SeriesItemForCoordinateType;
        } else {
            SeriesItemClass = SeriesItem;
        }

        return tui.util.map(this.rawSeriesData, function(rawDatum) {
            var values;

            if (tui.util.isArray(rawDatum)) {
                values = rawDatum;
            } else {
                values = concat.apply(rawDatum.data);
            }

            return tui.util.map(values, function(value) {
                return new SeriesItemClass(value, rawDatum.stack, self.formatFunctions, self.chartType);
            });
        });
    },

    /**
     * Get base groups.
     * @returns {Array.Array.<SeriesItem>}
     * @private
     */
    _getBaseGroups: function() {
        if (!this.baseGroups) {
            this.baseGroups = this._createBaseGroups();
        }

        return this.baseGroups;
    },

    /**
     * Create SeriesGroups from rawData.series.
     * @param {boolean} isPivot - whether pivot or not.
     * @returns {Array.<SeriesGroup>}
     * @private
     */
    _createSeriesGroupsFromRawData: function(isPivot) {
        var baseGroups = this._getBaseGroups();

        if (isPivot) {
            baseGroups = tui.util.pivot(baseGroups);
        }

        return tui.util.map(baseGroups, function(items) {
            return new SeriesGroup(items);
        });
    },

    /**
     * Get SeriesGroups.
     * @returns {(Array.<SeriesGroup>|object)}
     * @private
     */
    _getSeriesGroups: function() {
        if (!this.groups) {
            this.groups = this._createSeriesGroupsFromRawData(true);
        }

        return this.groups;
    },

    /**
     * Get group count.
     * @returns {Number}
     */
    getGroupCount: function() {
        return this._getSeriesGroups().length;
    },

    /**
     * Get pivot groups.
     * @returns {(Array.<SeriesGroup>|object)}
     */
    _getPivotGroups: function() {
        if (!this.pivotGroups) {
            this.pivotGroups = this._createSeriesGroupsFromRawData();
        }

        return this.pivotGroups;
    },

    /**
     * Get SeriesGroup.
     * @param {number} index - index
     * @param {boolean} [isPivot] - whether pivot or not
     * @returns {SeriesGroup}
     */
    getSeriesGroup: function(index, isPivot) {
        return isPivot ? this._getPivotGroups()[index] : this._getSeriesGroups()[index];
    },

    /**
     * Get first SeriesGroup.
     * @param {boolean} [isPivot] - whether pivot or not
     * @returns {SeriesGroup}
     */
    getFirstSeriesGroup: function(isPivot) {
        return this.getSeriesGroup(0, isPivot);
    },

    /**
     * Get first label of SeriesItem.
     * @returns {string} formatted value
     */
    getFirstItemLabel: function() {
        return this.getFirstSeriesGroup().getFirstSeriesItem().label;
    },

    /**
     * Get series item.
     * @param {number} groupIndex - index of series groups
     * @param {number} index - index of series items
     * @param {boolean} [isPivot] - whether pivot or not
     * @returns {SeriesItem}
     */
    getSeriesItem: function(groupIndex, index, isPivot) {
        return this.getSeriesGroup(groupIndex, isPivot).getSeriesItem(index);
    },

    /**
     * Get first series item.
     * @returns {SeriesItem}
     */
    getFirstSeriesItem: function() {
        return this.getSeriesItem(0, 0);
    },

    /**
     * Get value.
     * @param {number} groupIndex - index of series groups
     * @param {number} index - index of series items
     * @returns {number} value
     */
    getValue: function(groupIndex, index) {
        return this.getSeriesItem(groupIndex, index).value;
    },

    /**
     * Get minimum value.
     * @param {string} valueType - value type like value, x, y, r.
     * @returns {number}
     */
    getMinValue: function(valueType) {
        return tui.util.min(this.getValues(valueType));
    },

    /**
     * Get maximum value.
     * @param {string} valueType - value type like value, x, y, r.
     * @returns {number}
     */
    getMaxValue: function(valueType) {
        return tui.util.max(this.getValues(valueType));
    },

    /**
     * Traverse seriesGroups, and returns to found SeriesItem by result of execution seriesGroup.find with condition.
     * @param {function} condition - condition function
     * @returns {SeriesItem}
     * @private
     */
    _findSeriesItem: function(condition) {
        var foundItem;

        this.each(function(seriesGroup) {
            foundItem = seriesGroup.find(condition);

            return !foundItem;
        });

        return foundItem;
    },

    /**
     * Find SeriesItem by value.
     * @param {string} valueType - value type like value, x, y, r.
     * @param {number} value - comparing value
     * @param {function} condition - condition function
     * @returns {SeriesItem}
     * @private
     */
    _findSeriesItemByValue: function(valueType, value, condition) {
        condition = condition || function() {
            return;
        };

        return this._findSeriesItem(function(seriesItem) {
            return seriesItem && (seriesItem[valueType] === value) && condition(seriesItem);
        });
    },

    /**
     * Find minimum SeriesItem.
     * @param {string} valueType - value type like value, x, y, r.
     * @param {function} condition - condition function
     * @returns {SeriesItem}
     */
    findMinSeriesItem: function(valueType, condition) {
        var minValue = this.getMinValue(valueType);

        return this._findSeriesItemByValue(valueType, minValue, condition);
    },

    /**
     * Find maximum SeriesItem.
     * @param {string} valueType - value type like value, x, y, r.
     * @param {function} condition - condition function
     * @returns {*|SeriesItem}
     */
    findMaxSeriesItem: function(valueType, condition) {
        var maxValue = this.getMaxValue(valueType);

        return this._findSeriesItemByValue(valueType, maxValue, condition);
    },

    /**
     * Create values that picked value from SeriesItems of SeriesGroups.
     * @param {?string} valueType - type of value
     * @returns {Array.<number>}
     * @private
     */
    _createValues: function(valueType) {
        var values = this.map(function(seriesGroup) {
            return seriesGroup.getValues(valueType);
        });

        values = concat.apply([], values);

        return tui.util.filter(values, function(value) {
            return !isNaN(value);
        });
    },

    /**
     * Get values form valuesMap.
     * @param {?string} valueType - type of value
     * @returns {Array.<number>}
     */
    getValues: function(valueType) {
        valueType = valueType || 'value';

        if (!this.valuesMap[valueType]) {
            this.valuesMap[valueType] = this._createValues(valueType);
        }

        return this.valuesMap[valueType];
    },

    /**
     * Whether count of x values greater than count of y values.
     * @returns {boolean}
     */
    isXCountGreaterThanYCount: function() {
        return this.getValues('x').length > this.getValues('y').length;
    },

    /**
     * Add ratios, when has normal stackType option.
     * @param {{min: number, max: number}} limit - axis limit
     * @private
     */
    _addRatiosWhenNormalStacked: function(limit) {
        var distance = Math.abs(limit.max - limit.min);

        this.each(function(seriesGroup) {
            seriesGroup.addRatios(distance);
        });
    },

    /**
     * Calculate base ratio for calculating ratio of item.
     * @returns {number}
     * @private
     */
    _calculateBaseRatio: function() {
        var values = this.getValues(),
            plusSum = calculator.sumPlusValues(values),
            minusSum = Math.abs(calculator.sumMinusValues(values)),
            ratio = (plusSum > 0 && minusSum > 0) ? 0.5 : 1;

        return ratio;
    },

    /**
     * Add ratios, when has percent stackType option.
     * @private
     */
    _addRatiosWhenPercentStacked: function() {
        var baseRatio = this._calculateBaseRatio();

        this.each(function(seriesGroup) {
            seriesGroup.addRatiosWhenPercentStacked(baseRatio);
        });
    },

    /**
     * Add ratios, when has diverging stackType option.
     * @private
     */
    _addRatiosWhenDivergingStacked: function() {
        this.each(function(seriesGroup) {
            var values = seriesGroup.pluck('value'),
                plusSum = calculator.sumPlusValues(values),
                minusSum = Math.abs(calculator.sumMinusValues(values));

            seriesGroup.addRatiosWhenDivergingStacked(plusSum, minusSum);
        });
    },

    /**
     * Make subtraction value for making ratio of no option chart.
     * @param {{min: number, max: number}} limit - limit
     * @returns {number}
     * @private
     */
    _makeSubtractionValue: function(limit) {
        var allowMinusPointRender = predicate.allowMinusPointRender(this.chartType),
            subValue = 0;

        if (!allowMinusPointRender && predicate.isMinusLimit(limit)) {
            subValue = limit.max;
        } else if (allowMinusPointRender || limit.min >= 0) {
            subValue = limit.min;
        }

        return subValue;
    },

    /**
     * Add ratios, when has not option.
     * @param {{min: number, max: number}} limit - axis limit
     * @private
     */
    _addRatios: function(limit) {
        var distance = Math.abs(limit.max - limit.min),
            subValue = this._makeSubtractionValue(limit);

        this.each(function(seriesGroup) {
            seriesGroup.addRatios(distance, subValue);
        });
    },

    /**
     * Add data ratios.
     * @param {{min: number, max: number}} limit - axis limit
     * @param {string} stackType - stackType option
     * @private
     */
    addDataRatios: function(limit, stackType) {
        var isAllowedStackOption = predicate.isAllowedStackOption(this.chartType);

        if (isAllowedStackOption && predicate.isNormalStack(stackType)) {
            this._addRatiosWhenNormalStacked(limit);
        } else if (isAllowedStackOption && predicate.isPercentStack(stackType)) {
            if (this.divergingOption) {
                this._addRatiosWhenDivergingStacked();
            } else {
                this._addRatiosWhenPercentStacked();
            }
        } else {
            this._addRatios(limit);
        }
    },

    /**
     * Add data ratios of pie chart.
     */
    addDataRatiosOfPieChart: function() {
        this.each(function(seriesGroup) {
            var sum = tui.util.sum(seriesGroup.pluck('value'));

            seriesGroup.addRatios(sum);
        });
    },

    /**
     * Add ratios of data for chart of coordinate type.
     * @param {{x: {min: number, max: number}, y: {min: number, max: number}}} limitMap - limit map
     * @param {boolean} [hasRadius] - whether has radius or not
     */
    addDataRatiosForCoordinateType: function(limitMap, hasRadius) {
        var xLimit = limitMap.x;
        var yLimit = limitMap.y;
        var maxRadius = hasRadius ? tui.util.max(this.getValues('r')) : 0;
        var xDistance, xSubValue, yDistance, ySubValue;

        if (xLimit) {
            xDistance = Math.abs(xLimit.max - xLimit.min);
            xSubValue = this._makeSubtractionValue(xLimit);
        }

        if (yLimit) {
            yDistance = Math.abs(yLimit.max - yLimit.min);
            ySubValue = this._makeSubtractionValue(yLimit);
        }

        this.each(function(seriesGroup) {
            seriesGroup.each(function(item) {
                if (!item) {
                    return;
                }
                item.addRatio('x', xDistance, xSubValue);
                item.addRatio('y', yDistance, ySubValue);
                item.addRatio('r', maxRadius, 0);
            });
        });
    },

    /**
     * Add start to all series item.
     * @param {number} start - start value
     */
    addStartValueToAllSeriesItem: function(start) {
        this.each(function(seriesGroup) {
            seriesGroup.addStartValueToAllSeriesItem(start);
        });
    },

    /**
     * Whether has range data or not.
     * @returns {boolean}
     */
    hasRangeData: function() {
        var hasRangeData = false;

        this.each(function(seriesGroup) {
            hasRangeData = seriesGroup.hasRangeData();

            return !hasRangeData;
        });

        return hasRangeData;
    },

    /**
     * Traverse groups, and executes iteratee function.
     * @param {function} iteratee - iteratee function
     * @param {boolean} isPivot - whether pivot or not
     */
    each: function(iteratee, isPivot) {
        var groups = isPivot ? this._getPivotGroups() : this._getSeriesGroups();

        tui.util.forEachArray(groups, function(seriesGroup, index) {
            return iteratee(seriesGroup, index);
        });
    },

    /**
     * Traverse groups, and returns to result of execution about iteratee function.
     * @param {function} iteratee - iteratee function
     * @param {boolean} isPivot - whether pivot or not
     * @returns {Array}
     */
    map: function(iteratee, isPivot) {
        var results = [];

        this.each(function(seriesGroup, index) {
            results.push(iteratee(seriesGroup, index));
        }, isPivot);

        return results;
    }
});

module.exports = SeriesDataModel;

},{"../helpers/calculator":57,"../helpers/predicate":61,"./seriesGroup":46,"./seriesItem":47,"./seriesItemForCoordinateType":48}],45:[function(require,module,exports){
/**
 * @fileoverview SeriesDataModelForTreemap is base model for drawing graph of treemap chart series area.
 * SeriesDataModel.groups has SeriesGroups.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var SeriesDataModel = require('./seriesDataModel');
var SeriesItem = require('./seriesItemForTreemap');
var chartConst = require('../const');

var aps = Array.prototype.slice;

var SeriesDataModelForTreemap = tui.util.defineClass(SeriesDataModel, {
    /**
     * SeriesDataModelForTreemap is base model for drawing graph of treemap chart series area.
     * @constructs SeriesDataModelForTreemap
     */
    init: function() {
        SeriesDataModel.apply(this, arguments);

        /**
         * cached found seriesItems map
         * @type {object.<string, Array.<SeriesItem>>}
         */
        this.foundSeriesItemsMap = {};

        /**
         * cached seriesItem map
         * @type {object<string, SeriesItem>}
         */
        this.seriesItemMap = {};
    },

    /**
     * Flatten hierarchical data.
     * @param {Array.<object>} rawSeriesData - raw series data
     * @param {string | number} parent - parent id
     * @returns {Array.<object>}
     * @private
     */
    _flattenHierarchicalData: function(rawSeriesData, parent) {
        var self = this;
        var flatData = [];
        var idPrefix;

        if (parent) {
            idPrefix = parent + '_';
        } else {
            idPrefix = chartConst.TREEMAP_ID_PREFIX;
            parent = chartConst.TREEMAP_ROOT_ID;
        }

        tui.util.forEachArray(rawSeriesData, function(datum, index) {
            var id = idPrefix + index;
            var children = datum.children;

            flatData.push(datum);

            if (!datum.id) {
                datum.id = id;
            }

            if (!datum.parent) {
                datum.parent = parent;
            }

            if (children) {
                flatData = flatData.concat(self._flattenHierarchicalData(children, id));
                delete datum.children;
            }
        });

        return flatData;
    },

    /**
     * Partition raw series data by parent id
     * @param {Array.<object>} rawSeriesData - raw series data
     * @param {string | number} parent - parent id
     * @returns {Array.<Array>}
     * @private
     */
    _partitionRawSeriesDataByParent: function(rawSeriesData, parent) {
        var filtered = [];
        var rejected = [];

        tui.util.forEachArray(rawSeriesData, function(datum) {
            if (datum.parent === parent) {
                filtered.push(datum);
            } else {
                rejected.push(datum);
            }
        });

        return [filtered, rejected];
    },

    /**
     * Set tree properties like depth, group in raw series data.
     * @param {Array.<object>} rawSeriesData - raw series data
     * @param {number} depth - tree depth
     * @param {number} parent - parent id
     * @param {number} group - tree group
     * @returns {Array.<object>}
     * @private
     */
    _setTreeProperties: function(rawSeriesData, depth, parent, group) {
        var self = this;
        var parted = this._partitionRawSeriesDataByParent(rawSeriesData, parent);
        var filtered = parted[0];
        var rejected = parted[1];
        var childDepth = depth + 1;

        tui.util.forEachArray(filtered, function(datum, index) {
            var descendants, children;

            datum.depth = depth;
            datum.group = tui.util.isUndefined(group) ? index : group;

            descendants = self._setTreeProperties(rejected, childDepth, datum.id, datum.group);
            children = tui.util.filter(descendants, function(descendant) {
                return descendant.depth === childDepth;
            });

            if (children.length) {
                datum.value = tui.util.sum(tui.util.pluck(children, 'value'));
                datum.hasChild = true;
            } else {
                datum.hasChild = false;
            }

            filtered = filtered.concat(descendants);
        });

        return filtered;
    },

    /**
     * Create base groups.
     * @returns {Array.<Array.<SeriesItem>>}
     * @private
     * @override
     */
    _createBaseGroups: function() {
        var chartType = this.chartType;
        var rawSeriesData = this.rawSeriesData;
        var seriesItemMap = this.seriesItemMap;
        var formatFunctions = this.formatFunctions;

        rawSeriesData = this._flattenHierarchicalData(rawSeriesData);
        rawSeriesData = this._setTreeProperties(rawSeriesData, 1, chartConst.TREEMAP_ROOT_ID);

        return [tui.util.map(rawSeriesData, function(rawDatum) {
            var seriesItem = new SeriesItem(rawDatum, formatFunctions, chartType);

            seriesItemMap[seriesItem.id] = seriesItem;

            return seriesItem;
        })];
    },

    /**
     * Find SeriesItems.
     * @param {string} key - key
     * @param {function} condition - condition function
     * @returns {Array.<SeriesItem>}
     * @private
     */
    _findSeriesItems: function(key, condition) {
        if (!this.foundSeriesItemsMap[key]) {
            this.foundSeriesItemsMap[key] = this.getFirstSeriesGroup(true).filter(condition);
        }

        return this.foundSeriesItemsMap[key];
    },

    /**
     * Make cache key for caching found SeriesItems.
     * @param {string} prefix - prefix
     * @returns {string}
     * @private
     */
    _makeCacheKey: function(prefix) {
        var key = prefix;

        if (arguments.length > 1) {
            key += aps.call(arguments, 1).join('_');
        }

        return key;
    },

    /**
     * Whether valid group or not.
     * If comparingGroup is undefined or group and comparingGroup are equal, this group is valid.
     * @param {number} group - group
     * @param {number} [comparingGroup] - comparing group
     * @returns {boolean}
     * @private
     */
    _isValidGroup: function(group, comparingGroup) {
        return !tui.util.isExisty(comparingGroup) || (group === comparingGroup);
    },

    /**
     * Find SeriesItems by depth.
     * @param {number} depth - tree depth
     * @param {number} [group] - tree group
     * @returns {Array.<SeriesItem>}
     */
    findSeriesItemsByDepth: function(depth, group) {
        var self = this;
        var key = this._makeCacheKey(chartConst.TREEMAP_DEPTH_KEY_PREFIX, depth, group);

        return this._findSeriesItems(key, function(seriesItem) {
            return (seriesItem.depth === depth) && self._isValidGroup(seriesItem.group, group);
        });
    },

    /**
     * Find SeriesItems by parent id.
     * @param {string | number} parent - parent id
     * @returns {Array.<SeriesItem>}
     */
    findSeriesItemsByParent: function(parent) {
        var key = this._makeCacheKey(chartConst.TREEMAP_PARENT_KEY_PREFIX, parent);

        return this._findSeriesItems(key, function(seriesItem) {
            return seriesItem.parent === parent;
        });
    },

    /**
     * Find leaf SeriesItems.
     * @param {number} [group] - tree group
     * @returns {Array.<SeriesItem>}
     */
    findLeafSeriesItems: function(group) {
        var self = this;
        var key = this._makeCacheKey(chartConst.TREEMAP_LEAF_KEY_PREFIX, group);

        return this._findSeriesItems(key, function(seriesItem) {
            return !seriesItem.hasChild && self._isValidGroup(seriesItem.group, group);
        });
    },

    /**
     * Find parent by depth.
     * @param {string} id - id
     * @param {number} depth - depth
     * @returns {SeriesItem|null}
     */
    findParentByDepth: function(id, depth) {
        var seriesItem = this.seriesItemMap[id] || null;

        if (seriesItem && seriesItem.depth !== depth) {
            seriesItem = this.findParentByDepth(seriesItem.parent, depth);
        }

        return seriesItem;
    },

    /**
     * Initialize foundSeriesItemsMap.
     */
    initSeriesItemsMap: function() {
        this.foundSeriesItemsMap = null;
    }
});

module.exports = SeriesDataModelForTreemap;

},{"../const":31,"./seriesDataModel":44,"./seriesItemForTreemap":49}],46:[function(require,module,exports){
/**
 * @fileoverview SeriesGroup is a element of SeriesDataModel.groups.
 * SeriesGroup.items has SeriesItem.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

/**
 * SeriesItem is a element of SeriesGroup.items.
 * SeriesItem has processed terminal data like value, ratio, etc.
 */

var SeriesGroup = tui.util.defineClass(/** @lends SeriesGroup.prototype */{
    /**
     * SeriesGroup is a element of SeriesDataModel.groups.
     * SeriesGroup.items has SeriesItem.
     * @constructs SeriesGroup
     * @param {Array.<SeriesItem>} seriesItems - series items
     */
    init: function(seriesItems) {
        /**
         * items has SeriesItem
         * @type {Array.<SeriesItem>}
         */
        this.items = seriesItems;

        /**
         * map of values by value type like value, x, y, r.
         * @type {Array.<number>}
         */
        this.valuesMap = {};

        this.valuesMapPerStack = null;
    },

    /**
     * Get series item count.
     * @returns {number}
     */
    getSeriesItemCount: function() {
        return this.items.length;
    },

    /**
     * Get series item.
     * @param {number} index - index of items
     * @returns {SeriesItem}
     */
    getSeriesItem: function(index) {
        return this.items[index];
    },

    /**
     * Get first SeriesItem.
     * @returns {SeriesItem}
     */
    getFirstSeriesItem: function() {
        return this.getSeriesItem(0);
    },

    /**
     * Create values that picked value from SeriesItems.
     * @param {?string} valueType - type of value
     * @returns {Array.<number>}
     * @private
     */
    _createValues: function(valueType) {
        var values = [];

        this.each(function(item) {
            if (!item) {
                return;
            }

            if (tui.util.isExisty(item[valueType])) {
                values.push(item[valueType]);
            }
            if (tui.util.isExisty(item.start)) {
                values.push(item.start);
            }
        });

        return values;
    },

    /**
     * Get values from valuesMap.
     * @param {?string} valueType - type of value
     * @returns {Array}
     */
    getValues: function(valueType) {
        valueType = valueType || 'value';

        if (!this.valuesMap[valueType]) {
            this.valuesMap[valueType] = this._createValues(valueType);
        }

        return this.valuesMap[valueType];
    },

    /**
     * Make values map per stack.
     * @returns {object}
     * @private
     */
    _makeValuesMapPerStack: function() {
        var valuesMap = {};

        this.each(function(item) {
            if (!valuesMap[item.stack]) {
                valuesMap[item.stack] = [];
            }
            valuesMap[item.stack].push(item.value);
        });

        return valuesMap;
    },

    /**
     * Get values map per stack.
     * @returns {*|Object}
     */
    getValuesMapPerStack: function() {
        if (!this.valuesMapPerStack) {
            this.valuesMapPerStack = this._makeValuesMapPerStack();
        }

        return this.valuesMapPerStack;
    },

    /**
     * Make sum map per stack.
     * @returns {object} sum map
     * @private
     */
    _makeSumMapPerStack: function() {
        var valuesMap = this.getValuesMapPerStack(),
            sumMap = {};

        tui.util.forEach(valuesMap, function(values, key) {
            sumMap[key] = tui.util.sum(tui.util.map(values, function(value) {
                return Math.abs(value);
            }));
        });

        return sumMap;
    },

    /**
     * Add start value to all series item.
     * @param {number} start start value
     */
    addStartValueToAllSeriesItem: function(start) {
        this.each(function(item) {
            item.addStart(start);
        });
    },

    /**
     * Add ratios when percent stackType.
     * @param {number} baseRatio - base ratio
     */
    addRatiosWhenPercentStacked: function(baseRatio) {
        var sumMap = this._makeSumMapPerStack();

        this.each(function(item) {
            var dividingNumber = sumMap[item.stack];

            item.addRatio(dividingNumber, 0, baseRatio);
        });
    },

    /**
     * Add ratios when diverging stacked.
     * @param {number} plusSum - sum of plus number
     * @param {number} minusSum - sum of minus number
     */
    addRatiosWhenDivergingStacked: function(plusSum, minusSum) {
        this.each(function(item) {
            var dividingNumber = (item.value >= 0) ? plusSum : minusSum;

            item.addRatio(dividingNumber, 0, 0.5);
        });
    },

    /**
     * Add ratios.
     * @param {number} divNumber dividing number
     * @param {number} subValue subtraction value
     */
    addRatios: function(divNumber, subValue) {
        this.each(function(item) {
            item.addRatio(divNumber, subValue);
        });
    },

    /**
     * Whether has range data or not.
     * @returns {boolean}
     */
    hasRangeData: function() {
        var hasRangeData = false;

        this.each(function(seriesItem) {
            hasRangeData = seriesItem.isRange;

            return !hasRangeData;
        });

        return hasRangeData;
    },

    /**
     * Traverse items, and executes iteratee function.
     * @param {function} iteratee - iteratee function
     */
    each: function(iteratee) {
        tui.util.forEachArray(this.items, iteratee);
    },

    /**
     * Traverse items, and returns to results of execution about iteratee function.
     * @param {function} iteratee - iteratee function
     * @returns {Array}
     */
    map: function(iteratee) {
        return tui.util.map(this.items, iteratee);
    },

    /**
     * Traverse items, and returns to picked result at item.
     * @param {string} key key for pick
     * @returns {Array}
     */
    pluck: function(key) {
        return tui.util.pluck(this.items, key);
    },

    /**
     * Traverse items, and returns to found SeriesItem by condition function.
     * @param {function} condition - condition function
     * @returns {SeriesItem|null}
     */
    find: function(condition) {
        var foundItem;

        this.each(function(seriesItem) {
            if (condition(seriesItem)) {
                foundItem = seriesItem;
            }

            return !foundItem;
        });

        return foundItem || null;
    },

    /**
     * Traverse items, and returns to filter SeriesItems by condition function.
     * @param {function} condition - condition function
     * @returns {Array}
     */
    filter: function(condition) {
        return tui.util.filter(this.items, condition);
    }
});

module.exports = SeriesGroup;

},{}],47:[function(require,module,exports){
/**
 * @fileoverview SeriesItem is a element of SeriesGroup.items.
 * SeriesItem has processed terminal data like value, ratio, etc.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const');
var renderUtil = require('../helpers/renderUtil');
var calculator = require('../helpers/calculator');

var SeriesItem = tui.util.defineClass(/** @lends SeriesItem.prototype */{
    /**
     * SeriesItem is a element of SeriesGroup.items.
     * SeriesItem has processed terminal data like value, ratio, etc.
     * @constructs SeriesItem
     * @param {number} value - value
     * @param {?string} stack - stack
     * @param {?Array.<function>} formatFunctions - format functions
     * @param {string} chartType - type of chart
     */
    init: function(value, stack, formatFunctions, chartType) {
        /**
         * type of chart
         * @type {string}
         */
        this.chartType = chartType;

        /**
         * for group stack option.
         * @type {string}
         */
        this.stack = stack || chartConst.DEFAULT_STACK;

        /**
         * format functions
         * @type {Array.<function>}
         */
        this.formatFunctions = formatFunctions;

        /**
         * whether range item or not
         * @type {boolean}
         */
        this.isRange = false;

        /**
         * value of item
         * @type {number}
         */
        this.value = null;

        /**
         * label
         * @type {string}
         */
        this.label = null;

        /**
         * ratio of value about distance of limit
         * @type {number}
         */
        this.ratio = null;

        /**
         * end value of item.
         * @type {number}
         */
        this.end = null;

        /**
         * end label
         * @type {number}
         */
        this.endLabel = null;

        /**
         * ratio of end value
         * @type {number}
         */
        this.endRatio = null;

        /**
         * start value of item.
         * @type {number}
         */
        this.start = null;

        /**
         * start label
         * @type {number}
         */
        this.startLabel = null;

        /**
         * ratio of start value
         * @type {number}
         */
        this.startRatio = null;

        /**
         * distance of start ratio and end ratio
         * @type {null}
         */
        this.ratioDistance = null;

        this._initValues(value);
    },

    /**
     * Initialize values of item.
     * @param {number} value - value
     * @private
     */
    _initValues: function(value) {
        var values = this._createValues(value);
        var areaType = 'makingSeriesLabel';
        var hasStart = values.length > 1;

        this.value = this.end = values[0];
        this.label = renderUtil.formatValue(this.value, this.formatFunctions, this.chartType, areaType);
        this.endLabel = this.label;

        if (hasStart) {
            this.addStart(values[1], true);
            this._updateFormattedValueforRange();
            this.isRange = true;
        }
    },

    /**
     * Crete sorted values.
     * @param {Array.<number>|number} value value
     * @returns {Array.<number>}
     * @private
     */
    _createValues: function(value) {
        var values = tui.util.map([].concat(value), parseFloat);

        values = values.sort(function(a, b) {
            if (a < 0 && b < 0) {
                return a - b;
            }

            return b - a;
        });

        return values;
    },

    /**
     * Add start.
     * @param {number} value - value
     * @private
     */
    addStart: function(value) {
        if (!tui.util.isNull(this.start)) {
            return;
        }

        this.start = value;
        this.startLabel = renderUtil.formatValue(value, this.formatFunctions, this.chartType, 'series');
    },

    /**
     * Update formatted value for range.
     * @private
     */
    _updateFormattedValueforRange: function() {
        this.label = this.startLabel + ' ~ ' + this.endLabel;
    },

    /**
     * Add ratio.
     * @param {number} divNumber - number for division
     * @param {?number} subNumber - number for subtraction
     * @param {?number} baseRatio - base ratio
     */
    addRatio: function(divNumber, subNumber, baseRatio) {
        divNumber = divNumber || 1;
        baseRatio = baseRatio || 1;
        subNumber = subNumber || 0;

        this.ratio = this.endRatio = calculator.calculateRatio(this.value, divNumber, subNumber, baseRatio);

        if (!tui.util.isNull(this.start)) {
            this.startRatio = calculator.calculateRatio(this.start, divNumber, subNumber, baseRatio);
            this.ratioDistance = Math.abs(this.endRatio - this.startRatio);
        }
    },

    /**
     * Pick value map.
     * @returns {{value: number, start: ?number, end: ?number}}
     */
    pickValueMap: function() {
        return {
            value: this.value,
            start: this.start,
            end: this.end
        };
    }
});

module.exports = SeriesItem;

},{"../const":31,"../helpers/calculator":57,"../helpers/renderUtil":63}],48:[function(require,module,exports){
/**
 * @fileoverview SeriesItemForCoordinateType is a element of SeriesGroup.items.
 * SeriesItemForCoordinateType has processed terminal data like x, y, r, xRatio, yRatio, rRatio.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var SeriesItemForCoordinateType = tui.util.defineClass(/** @lends SeriesItemForCoordinateType.prototype */{
    /**
     * SeriesItemForCoordinateType is a element of SeriesGroup.items.
     * SeriesItemForCoordinateType has processed terminal data like x, y, r, xRatio, yRatio, rRatio.
     * @constructs SeriesItemForCoordinateType
     * @param {object} rawSeriesDatum - value
     */
    init: function(rawSeriesDatum) {
        this._initData(rawSeriesDatum);
    },

    /**
     * Initialize data of item.
     * @param {{x: ?number, y: ?number, r: ?number, label: ?string}} rawSeriesDatum - rawSeriesDatum for bubble chart
     * @private
     */
    _initData: function(rawSeriesDatum) {
        this.x = rawSeriesDatum.x;
        this.y = rawSeriesDatum.y;
        this.r = rawSeriesDatum.r;
        this.label = rawSeriesDatum.label || '';

        this.ratioMap = {};
    },

    /**
     * Add ratio.
     * @param {string} valueType - type of value like x, y, r
     * @param {?number} divNumber - number for division
     * @param {?number} subNumber - number for subtraction
     */
    addRatio: function(valueType, divNumber, subNumber) {
        if (!tui.util.isExisty(this.ratioMap[valueType]) && divNumber) {
            this.ratioMap[valueType] = (this[valueType] - subNumber) / divNumber;
        }
    },

    /**
     * Pick value map.
     * @returns {{x: (number | null), y: (number | null), r: (number | null)}}
     */
    pickValueMap: function() {
        return {
            x: this.ratioMap.x ? this.x : null,
            y: this.ratioMap.y ? this.y : null,
            r: this.ratioMap.r ? this.r : null
        };
    }
});

module.exports = SeriesItemForCoordinateType;

},{}],49:[function(require,module,exports){
/**
 * @fileoverview SeriesItem for treemap.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var calculator = require('../helpers/calculator');
var renderUtil = require('../helpers/renderUtil');

var SeriesItemForTreemap = tui.util.defineClass(/** @lends SeriesItemForTreemap.prototype */{
    /**
     * SeriesItem for treemap.
     * @constructs SeriesItemForTreemap
     * @param {object} rawSeriesDatum - value
     * @param {?Array.<function>} formatFunctions - format functions
     * @param {string} chartType - type of chart
     */
    init: function(rawSeriesDatum, formatFunctions, chartType) {
        /**
         * type of chart
         * @type {string}
         */
        this.chartType = chartType;

        /**
         * format functions
         * @type {Array.<function>}
         */
        this.formatFunctions = formatFunctions;
        this.id = rawSeriesDatum.id;
        this.parent = rawSeriesDatum.parent;
        this.value = rawSeriesDatum.value;
        this.colorValue = rawSeriesDatum.colorValue;
        this.depth = rawSeriesDatum.depth;
        this.label = rawSeriesDatum.label || '';
        this.group = rawSeriesDatum.group;
        this.hasChild = !!rawSeriesDatum.hasChild;
    },

    /**
     * Add ratio.
     * @param {number} divNumber - number for division
     * @param {?number} subNumber - number for subtraction
     */
    addRatio: function(divNumber, subNumber) {
        divNumber = divNumber || 1;
        subNumber = subNumber || 0;

        this.ratio = calculator.calculateRatio(this.colorValue, divNumber, subNumber, 1) || -1;
    },

    /**
     * Pick value map.
     * @returns {{value: number, label: string}}
     */
    pickValueMap: function() {
        var areaType = 'makingTooltipLabel';
        var formattedValue = renderUtil.formatValue(this.value, this.formatFunctions, this.chartType, areaType);
        var label = (this.label ? this.label + ': ' : '') + formattedValue;

        return {
            value: this.value,
            label: label
        };
    }
});

module.exports = SeriesItemForTreemap;

},{"../helpers/calculator":57,"../helpers/renderUtil":63}],50:[function(require,module,exports){
/**
 * @fileoverview  Chart factory play role register chart.
 *                Also, you can get chart from this factory.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';
var chartConst = require('../const');
var rawDataHandler = require('../helpers/rawDataHandler');
var predicate = require('../helpers/predicate');

var charts = {};
var factory = {
    /**
     * Find key for getting chart.
     * @param {string} chartType - type of chart
     * @param {{seriesAlias: ?object, series: object.<string, Array>}} rawData - raw data
     * @returns {string}
     * @private
     */
    _findKey: function(chartType, rawData) {
        var key = null;
        var chartTypeMap;

        if (predicate.isComboChart(chartType)) {
            chartTypeMap = rawDataHandler.getChartTypeMap(rawData);

            if (chartTypeMap[chartConst.CHART_TYPE_COLUMN] && chartTypeMap[chartConst.CHART_TYPE_LINE]) {
                key = chartConst.CHART_TYPE_COLUMN_LINE_COMBO;
            } else if (chartTypeMap[chartConst.CHART_TYPE_AREA] && chartTypeMap[chartConst.CHART_TYPE_LINE]) {
                key = chartConst.CHART_TYPE_LINE_AREA_COMBO;
            } else if (chartTypeMap[chartConst.CHART_TYPE_PIE]) {
                key = chartConst.CHART_TYPE_PIE_DONUT_COMBO;
            }
        } else {
            key = chartType;
        }

        return key;
    },

    /**
     * Get chart instance.
     * @param {string} chartType chart type
     * @param {object} rawData chart data
     * @param {object} theme chart options
     * @param {object} options chart options
     * @returns {object} chart instance;
     */
    get: function(chartType, rawData, theme, options) {
        var key = this._findKey(chartType, rawData);
        var Chart = charts[key];
        var chart;

        if (!Chart) {
            throw new Error('Not exist ' + chartType + ' chart.');
        }

        chart = new Chart(rawData, theme, options);

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

},{"../const":31,"../helpers/predicate":61,"../helpers/rawDataHandler":62}],51:[function(require,module,exports){
/**
 * @fileoverview  Map factory.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var maps = {};

module.exports = {
    /**
     * Get map data.
     * @param {string} mapName map name
     * @returns {Array} map data
     */
    get: function(mapName) {
        var data = maps[mapName];

        if (!data) {
            throw new Error('Not exist ' + mapName + ' map.');
        }

        return data;
    },

    /**
     * Register Map.
     * @param {string} mapName map name
     * @param {Array} data map data
     */
    register: function(mapName, data) {
        maps[mapName] = data;
    }
};

},{}],52:[function(require,module,exports){
/**
 * @fileoverview  Plugin factory play role register rendering plugin.
 *                Also, you can get plugin from this factory.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
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

},{}],53:[function(require,module,exports){
/**
 * @fileoverview  Theme factory play role register theme.
 *                Also, you can get theme from this factory.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
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

        this._concatDefaultColors(theme, cloneTheme.series.colors);
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
     * @param {Array.<string>} rejectionProps reject property
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
     * @param {Array.<string>} seriesColors series colors
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
     * @param {Array.<string>} seriesColors series colors
     * @private
     */
    _concatDefaultColors: function(theme, seriesColors) {
        var self = this,
            chartTypes;

        if (!theme.series) {
            return;
        }

        chartTypes = this._filterChartTypes(theme.series, chartConst.SERIES_PROPS);

        if (!tui.util.keys(chartTypes).length) {
            this._concatColors(theme.series, seriesColors);
        } else {
            tui.util.forEach(chartTypes, function(item) {
                self._concatColors(item, seriesColors);
            });
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
        var self = this;

        tui.util.forEach(to, function(item, key) {
            var fromItem = from[key];
            if (!fromItem) {
                return;
            }

            if (tui.util.isArray(fromItem)) {
                to[key] = fromItem.slice();
            } else if (tui.util.isObject(fromItem)) {
                self._overwriteTheme(fromItem, item);
            } else {
                to[key] = fromItem;
            }
        });

        return to;
    },

    /**
     * Copy property.
     * @param {object} params parameters
     *      @param {string} params.propName property name
     *      @param {object} params.fromTheme from property
     *      @param {object} params.toTheme tp property
     *      @param {Array.<string>} params.rejectionProps reject property name
     * @returns {object} copied property
     * @private
     */
    _copyProperty: function(params) {
        var self = this,
            chartTypes;

        if (!params.toTheme[params.propName]) {
            return params.toTheme;
        }

        chartTypes = this._filterChartTypes(params.fromTheme[params.propName], params.rejectionProps);
        if (tui.util.keys(chartTypes).length) {
            tui.util.forEach(chartTypes, function(item, key) {
                var cloneTheme = JSON.parse(JSON.stringify(defaultTheme[params.propName]));
                params.fromTheme[params.propName][key] = self._overwriteTheme(item, cloneTheme);
            });

            params.toTheme[params.propName] = params.fromTheme[params.propName];
        }

        return params.toTheme;
    },

    /**
     * Copy color info to legend
     * @param {object} seriesTheme series theme
     * @param {object} legendTheme legend theme
     * @param {Array.<string>} colors colors
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
        if (seriesTheme.selectionColor) {
            legendTheme.selectionColor = seriesTheme.selectionColor;
        }
    },

    /**
     * Get target items about font inherit.
     * @param {object} theme theme
     * @returns {Array.<object>} target items
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
     * @param {Array.<object>} targetItems target theme items
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
        var self = this,
            seriesNames = this._filterChartTypes(theme.series, chartConst.SERIES_PROPS);

        if (!tui.util.keys(seriesNames).length) {
            this._copyColorInfoToOther(theme.series, theme.legend);
            this._copyColorInfoToOther(theme.series, theme.tooltip);
        } else {
            tui.util.forEach(seriesNames, function(item, chartType) {
                theme.legend[chartType] = {};
                theme.tooltip[chartType] = {};
                self._copyColorInfoToOther(item, theme.legend[chartType], item.colors || theme.legend.colors);
                self._copyColorInfoToOther(item, theme.tooltip[chartType], item.colors || theme.tooltip.colors);
                delete theme.legend.colors;
                delete theme.tooltip.colors;
            });
        }
    }
};

},{"../const":31,"../themes/defaultTheme":107}],54:[function(require,module,exports){
/**
 * @fileoverview Axis Data Maker
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const');
var predicate = require('../helpers/predicate');

/**
 * Axis data maker.
 * @module axisDataMaker
 */
var axisDataMaker = {
    /**
     * Makes labels by labelInterval option.
     * @param {Array.<string>} labels - labels
     * @param {number} labelInterval - label interval option
     * @param {number} [addedDataCount] - added data count
     * @returns {Array.<string>} labels
     * @private
     */
    _makeLabelsByIntervalOption: function(labels, labelInterval, addedDataCount) {
        addedDataCount = addedDataCount || 0;
        labels = tui.util.map(labels, function(label, index) {
            if (((index + addedDataCount) % labelInterval) !== 0) {
                label = chartConst.EMPTY_AXIS_LABEL;
            }

            return label;
        });

        return labels;
    },

    /**
     * Make data about label axis.
     * @memberOf module:axisDataMaker
     * @param {object} params parameters
     *      @param {Array.<string>} params.labels - chart labels
     *      @param {boolean} params.isVertical - whether vertical or not
     *      @param {boolean} params.aligned - whether align or not
     *      @param {?boolean} params.addedDataCount - added data count
     * @returns {{
     *      labels: Array.<string>,
     *      tickCount: number,
     *      validTickCount: number,
     *      isLabelAxis: boolean,
     *      isVertical: boolean
     * }} axis data
     */
    makeLabelAxisData: function(params) {
        var tickCount = params.labels.length;
        var options = params.options || {};
        var labels = params.labels;

        if (predicate.isValidLabelInterval(options.labelInterval, options.tickInterval)
                && params.labels.length > options.labelInterval) {
            labels = this._makeLabelsByIntervalOption(params.labels, options.labelInterval, params.addedDataCount);
        }

        if (!params.aligned) {
            tickCount += 1;
        }

        return {
            labels: labels,
            tickCount: tickCount,
            validTickCount: 0,
            isLabelAxis: true,
            options: options,
            isVertical: !!params.isVertical,
            isPositionRight: !!params.isPositionRight,
            aligned: !!params.aligned
        };
    },

    /**
     * Make data about value axis.
     * @memberOf module:axisDataMaker
     * @param {object} params parameters
     *      @param {AxisScaleMaker} params.axisScaleMaker chart values
     *      @param {boolean} params.isVertical whether vertical or not
     * @returns {{
     *      labels: Array.<string>,
     *      tickCount: number,
     *      validTickCount: number,
     *      isLabelAxis: boolean,
     *      limit: {min: number, max: number},
     *      isVertical: boolean
     * }} axis data
     */
    makeValueAxisData: function(params) {
        var axisScaleMaker = params.axisScaleMaker,
            rangeValues = axisScaleMaker.getFormattedScaleValues(),
            tickCount = rangeValues.length;

        return {
            labels: rangeValues,
            tickCount: tickCount,
            validTickCount: tickCount,
            limit: axisScaleMaker.getLimit(),
            step: axisScaleMaker.getStep(),
            options: params.options,
            isVertical: !!params.isVertical,
            isPositionRight: !!params.isPositionRight,
            aligned: !!params.aligned
        };
    },

    /**
     * Make adjusting tick interval information.
     * @param {number} beforeBlockCount - before block count
     * @param {number} seriesWidth - width of series area
     * @param {number} blockSize - block size
     * @returns {null | {blockCount: number, beforeRemainBlockCount: number, interval: number}}
     * @private
     */
    _makeAdjustingIntervalInfo: function(beforeBlockCount, seriesWidth, blockSize) {
        var newBlockCount = parseInt(seriesWidth / blockSize, 10);
        // interval : 하나의 새로운 block(tick과 tick 사이의 공간) 영역에 포함되는 이전 block 수
        var interval = parseInt(beforeBlockCount / newBlockCount, 10);
        var intervalInfo = null;
        var remainCount;

        if (interval > 1) {
            // remainCount : 이전 block들 중 새로운 block으로 채우고 남은 이전 block 수
            // | | | | | | | | | | | |  - 이전 block
            // |     |     |     |      - 새로 계산된 block
            //                   |*|*|  - 남은 이전 block 수
            remainCount = beforeBlockCount - (interval * newBlockCount);

            if (remainCount >= interval) {
                newBlockCount += parseInt(remainCount / interval, 0);
                remainCount = remainCount % interval;
            }

            intervalInfo = {
                blockCount: newBlockCount,
                beforeRemainBlockCount: remainCount,
                interval: interval
            };
        }

        return intervalInfo;
    },

    /**
     * Make candidate for adjusting tick interval.
     * @param {number} beforeBlockCount - before block count
     * @param {number} seriesWidth - width of series area
     * @returns {Array.<{newBlockCount: number, remainBlockCount: number, interval: number}>}
     * @private
     */
    _makeCandidatesForAdjustingInterval: function(beforeBlockCount, seriesWidth) {
        var self = this;
        var blockSizeRange = tui.util.range(90, 121, 5); // [90, 95, 100, 105, 110, 115, 120]
        var candidates = tui.util.map(blockSizeRange, function(blockSize) {
            return self._makeAdjustingIntervalInfo(beforeBlockCount, seriesWidth, blockSize);
        });

        return tui.util.filter(candidates, function(info) {
            return !!info;
        });
    },

    /**
     * Calculate adjusting interval information for auto tick interval option.
     * @param {number} curBlockCount - current block count
     * @param {number} seriesWidth - series width
     * @returns {{newBlockCount: number, remainBlockCount: number, interval: number}}
     * @private
     */
    _calculateAdjustingIntervalInfo: function(curBlockCount, seriesWidth) {
        var candidates = this._makeCandidatesForAdjustingInterval(curBlockCount, seriesWidth);
        var intervalInfo = null;

        if (candidates.length) {
            intervalInfo = tui.util.min(candidates, function(candidate) {
                return candidate.blockCount;
            });
        }

        return intervalInfo;
    },

    /**
     * Make filtered labels by interval.
     * @param {Array.<string>} labels - labels
     * @param {number} startIndex - start index
     * @param {numbrer} interval - interval
     * @returns {Array.<string>}
     * @private
     */
    _makeFilteredLabelsByInterval: function(labels, startIndex, interval) {
        return tui.util.filter(labels.slice(startIndex), function(label, index) {
            return index % interval === 0;
        });
    },

    /**
     * Update label type axisData for auto tick interval option.
     * @param {object} axisData - axisData
     * @param {number} seriesWidth - series width
     * @param {number} [addedDataCount] - added data count
     */
    updateLabelAxisDataForAutoTickInterval: function(axisData, seriesWidth, addedDataCount) {
        var beforeBlockCount = axisData.tickCount - 1;
        var intervalInfo = this._calculateAdjustingIntervalInfo(beforeBlockCount, seriesWidth);
        var adjustingBlockCount, interval, beforeRemainBlockCount, startIndex;

        if (!intervalInfo) {
            return;
        }

        adjustingBlockCount = intervalInfo.blockCount;
        interval = intervalInfo.interval;
        beforeRemainBlockCount = intervalInfo.beforeRemainBlockCount;
        axisData.eventTickCount = axisData.tickCount;

        // startIndex는 남은 block수의 반 만큼에서 현재 이동된 tick 수를 뺀 만큼으로 설정함
        // |     |     |     |*|*|*|    - * 영역이 남은 이전 block 수
        // |*|*|O    |     |     |*|    - 현재 이동된 tick이 없을 경우 (O 지점이 startIndex = 2)
        // |*|O    |     |     |*|*|    - tick이 하나 이동 됐을 경우 : O 지점이 startIndex = 1)
        startIndex = Math.round(beforeRemainBlockCount / 2) - (addedDataCount % interval);

        // startIndex가 0보다 작을 경우 interval만큼 증가시킴
        if (startIndex < 0) {
            startIndex += interval;
        }

        axisData.labels = this._makeFilteredLabelsByInterval(axisData.labels, startIndex, interval);

        tui.util.extend(axisData, {
            startIndex: startIndex,
            tickCount: adjustingBlockCount + 1,
            positionRatio: (startIndex / beforeBlockCount),
            sizeRatio: 1 - (beforeRemainBlockCount / beforeBlockCount),
            lineWidth: seriesWidth + chartConst.OVERLAPPING_WIDTH,
            interval: interval
        });
    },

    /**
     * Update label type axisData for stacking dynamic data.
     * @param {object} axisData - axis data
     * @param {object} prevUpdatedData - previous updated axisData
     * @param {number} firstTickCount - calculated first tick count
     */
    updateLabelAxisDataForStackingDynamicData: function(axisData, prevUpdatedData, firstTickCount) {
        var interval = prevUpdatedData.interval;
        var startIndex = prevUpdatedData.startIndex;
        var beforeBlockCount = axisData.tickCount - 1;
        var newBlockCount = beforeBlockCount / interval;
        var firstBlockCount = firstTickCount ? firstTickCount - 1 : 0;
        var beforeRemainBlockCount;

        // 새로 계산된 block의 수가 최초로 계산된 block 수의 두배수 보다 많아지면 interval 숫자를 두배로 늘림
        if (firstBlockCount && ((firstBlockCount * 2) <= newBlockCount)) {
            interval *= 2;
        }

        axisData.labels = this._makeFilteredLabelsByInterval(axisData.labels, startIndex, interval);
        newBlockCount = axisData.labels.length - 1;
        beforeRemainBlockCount = beforeBlockCount - (interval * newBlockCount);

        tui.util.extend(axisData, {
            startIndex: startIndex,
            eventTickCount: axisData.tickCount,
            tickCount: axisData.labels.length,
            positionRatio: startIndex / beforeBlockCount,
            sizeRatio: 1 - (beforeRemainBlockCount / beforeBlockCount),
            lineWidth: prevUpdatedData.lineWidth,
            interval: interval
        });
    }
};

module.exports = axisDataMaker;

},{"../const":31,"../helpers/predicate":61}],55:[function(require,module,exports){
/**
 * @fileoverview AxisScaleMaker calculates the limit and step into values of processed data and returns it.
 * @auth NHN Ent.
 *       FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const');
var predicate = require('./predicate');
var calculator = require('./calculator');
var renderUtil = require('./renderUtil');

var abs = Math.abs;

var AxisScaleMaker = tui.util.defineClass(/** @lends AxisScaleMaker.prototype */{
    /**
     * AxisScaleMaker calculates the limit and step into values of processed data and returns it.
     * @param {object} params parameters
     * @constructs AxisScaleMaker
     */
    init: function(params) {
        /**
         * Data processor
         * @type {DataProcessor}
         */
        this.dataProcessor = params.dataProcessor;

        /**
         * Bounds maker
         * @type {BoundsMaker}
         */
        this.boundsMaker = params.boundsMaker;

        /**
         * Options
         * @type {object}
         */
        this.options = params.options || {};

        /**
         * Chart type
         * @type {string}
         */
        this.chartType = params.chartType;

        /**
         * type of value like value, x, y, r
         * @type {string}
         */
        this.valueType = params.valueType;

        /**
         * type of area like yAxis, xAxis
         * @type {string}
         */
        this.areaType = params.areaType;

        /**
         * Whether vertical type or not.
         * @type {boolean}
         */
        this.isVertical = !!params.isVertical;

        /**
         * Whether single yAxis or not.
         * @type {boolean}
         */
        this.isSingleYAxis = !!params.isSingleYAxis;
        /**
         * Count of scale values.
         * @type {number}
         */
        this.valueCounts = params.valueCount ? [params.valueCount] : null;

        /**
         * Axis scale
         * @type {{limit: {min: number, max: number}, step: number}}
         */
        this.scale = null;

        /**
         * Formatted scale values.
         * @type {Array.<string | number>}
         */
        this.formattedValues = null;
    },

    /**
     * Get scale.
     * @returns {{limit: {min: number, max: number}, step: number}}
     * @private
     */
    _getScale: function() {
        if (!this.scale) {
            this.scale = this._makeScale();
        }

        return this.scale;
    },

    /**
     * Get limit.
     * @returns {{min: number, max: number}}
     */
    getLimit: function() {
        return this._getScale().limit;
    },

    /**
     * Get step.
     * @returns {number}
     */
    getStep: function() {
        return this._getScale().step;
    },

    /**
     * Whether percent stack chart or not.
     * @returns {boolean}
     * @private
     */
    _isPercentStackChart: function() {
        var isAllowedStackOption = predicate.isAllowedStackOption(this.chartType),
            isPercentStack = predicate.isPercentStack(this.options.stackType);

        return isAllowedStackOption && isPercentStack;
    },

    /**
     * Whether normal stack chart or not.
     * @returns {boolean}
     * @private
     */
    _isNormalStackChart: function() {
        var isAllowedStackOption = predicate.isAllowedStackOption(this.chartType),
            isNormalStack = predicate.isNormalStack(this.options.stackType);

        return isAllowedStackOption && isNormalStack;
    },

    /**
     * Whether diverging chart or not.
     * @returns {boolean|*}
     * @private
     */
    _isDivergingChart: function() {
        return this.options.diverging && predicate.isBarTypeChart(this.chartType);
    },

    /**
     * Get functions for formatting value.
     * @returns {Array.<function>}
     * @private
     */
    _getFormatFunctions: function() {
        var formatFunctions;

        if (this._isPercentStackChart()) {
            formatFunctions = [function(value) {
                return value + '%';
            }];
        } else {
            formatFunctions = this.dataProcessor.getFormatFunctions();
        }

        return formatFunctions;
    },

    /**
     * Get scale values.
     * @returns {Array.<number>}
     * @private
     */
    _getScaleValues: function() {
        var scale = this._getScale(),
            values = calculator.makeLabelsFromLimit(scale.limit, scale.step);

        return this._isDivergingChart() ? tui.util.map(values, abs) : values;
    },

    /**
     * Get formatted scale values.
     * @returns {Array.<string|number>|*}
     */
    getFormattedScaleValues: function() {
        var chartType = this.chartType;
        var areaType = this.areaType;
        var valueType = this.valueType;
        var values, formatFunctions;

        if (!this.formattedValues) {
            values = this._getScaleValues();
            formatFunctions = this._getFormatFunctions();
            this.formattedValues = renderUtil.formatValues(values, formatFunctions, chartType, areaType, valueType);
        }

        return this.formattedValues;
    },

    /**
     * Make base values of normal stackType chart.
     * @returns {Array.<number>}
     * @private
     */
    _makeBaseValuesForNormalStackedChart: function() {
        var seriesDataModel = this.dataProcessor.getSeriesDataModel(this.chartType),
            baseValues = [];

        seriesDataModel.each(function(seriesGroup) {
            var valuesMap = seriesGroup._makeValuesMapPerStack();

            tui.util.forEach(valuesMap, function(values) {
                var plusSum = calculator.sumPlusValues(values),
                    minusSum = calculator.sumMinusValues(values);
                baseValues = baseValues.concat([plusSum, minusSum]);
            });
        });

        return baseValues;
    },

    /**
     * Make base values for making axis scale.
     * @returns {Array.<number>} base values
     * @private
     */
    _makeBaseValues: function() {
        var baseValues;

        if (predicate.isTreemapChart(this.chartType)) {
            baseValues = this.dataProcessor.getValues(this.chartType, 'colorValue');
        } else if (predicate.isMapChart(this.chartType) || this.isSingleYAxis) {
            baseValues = this.dataProcessor.getValues();
        } else if (this._isNormalStackChart()) {
            baseValues = this._makeBaseValuesForNormalStackedChart();
        } else {
            baseValues = this.dataProcessor.getValues(this.chartType, this.valueType);
        }

        return baseValues;
    },

    /**
     * Get base size for calculation candidate value counts.
     * @returns {number} base size
     * @private
     */
    _getBaseSize: function() {
        var baseSize;

        if (this.isVertical) {
            baseSize = this.boundsMaker.makeSeriesHeight();
        } else {
            baseSize = this.boundsMaker.makeSeriesWidth();
        }

        return baseSize;
    },

    /**
     * Get candidate counts of value.
     * @memberOf module:axisDataMaker
     * @returns {Array.<number>} value counts
     * @private
     */
    _getCandidateCountsOfValue: function() {
        var minStart = 3,
            valueCounts, baseSize, start, end;

        baseSize = this._getBaseSize();
        start = Math.max(minStart, parseInt(baseSize / chartConst.MAX_PIXEL_TYPE_STEP_SIZE, 10));
        end = Math.max(start, parseInt(baseSize / chartConst.MIN_PIXEL_TYPE_STEP_SIZE, 10)) + 1;
        valueCounts = tui.util.range(start, end);

        return valueCounts;
    },

    /**
     * Make limit for diverging option.
     * @param {{min: number, max: number}} limit limit
     * @returns {{min: number, max: number}} changed limit
     * @private
     */
    _makeLimitForDivergingOption: function(limit) {
        var newMax = Math.max(abs(limit.min), abs(limit.max));

        return {
            min: -newMax,
            max: newMax
        };
    },

    /**
     * Make integer type scale.
     * @memberOf module:axisDataMaker
     * @param {{min: number, max: number}} limit limit
     * @returns {{
     *      limit: {min: number, max: number},
     *      options: {min: number, max: number},
     *      divideNum: number
     * }} integer type info
     * @private
     */
    _makeIntegerTypeScale: function(limit) {
        var options = this.options.limit || {},
            min = limit.min,
            max = limit.max,
            multipleNum, changedOptions;

        if (abs(min) >= 1 || abs(max) >= 1) {
            return {
                limit: limit,
                options: options,
                divideNum: 1
            };
        }

        multipleNum = tui.util.findMultipleNum(min, max);
        changedOptions = {};

        if (!tui.util.isUndefined(options.min)) {
            changedOptions.min = options.min * multipleNum;
        }

        if (!tui.util.isUndefined(options.max)) {
            changedOptions.max = options.max * multipleNum;
        }

        return {
            limit: {
                min: min * multipleNum,
                max: max * multipleNum
            },
            options: changedOptions,
            divideNum: multipleNum
        };
    },

    /**
     * Make limit if equal min and max.
     * @param {{min: number, max: number}} limit limit
     * @returns {{min: number, max: number}} changed limit
     * @private
     */
    _makeLimitIfEqualMinMax: function(limit) {
        var min = limit.min,
            max = limit.max;

        if (min > 0) {
            min = 0;
        } else if (min < 0) {
            max = 0;
        }

        return {
            min: min,
            max: max
        };
    },

    /**
     * Make base limit
     * @memberOf module:axisDataMaker
     * @param {{min: number, max: number}} dataLimit user limit
     * @param {{min: number, max: number}} options axis options
     * @returns {{min: number, max: number}} base limit
     * @private
     */
    _makeBaseLimit: function(dataLimit, options) {
        var isMinusLimit = predicate.isMinusLimit(dataLimit),
            min = dataLimit.min,
            max = dataLimit.max,
            baseLimit, tmpMin;

        if (min === max) {
            baseLimit = this._makeLimitIfEqualMinMax(dataLimit);
        } else {
            if (isMinusLimit) {
                tmpMin = min;
                min = -max;
                max = -tmpMin;
            }

            baseLimit = calculator.calculateLimit(min, max);

            if (isMinusLimit) {
                tmpMin = baseLimit.min;
                baseLimit.min = -baseLimit.max;
                baseLimit.max = -tmpMin;
            }

            baseLimit.min = tui.util.isUndefined(options.min) ? baseLimit.min : options.min;
            baseLimit.max = tui.util.isUndefined(options.max) ? baseLimit.max : options.max;
        }

        return baseLimit;
    },

    /**
     * Normalize min.
     * @memberOf module:axisDataMaker
     * @param {number} min original min
     * @param {number} step scale step
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
     * Make normalized max.
     * @memberOf module:axisDataMaker
     * @param {{min: number, max: number}} limit limit
     * @param {number} step scale step
     * @param {number} valueCount value count
     * @returns {number} normalized max
     * @private
     */
    _makeNormalizedMax: function(limit, step, valueCount) {
        var minMaxDiff = tui.util.multiplication(step, valueCount - 1),
            normalizedMax = tui.util.addition(limit.min, minMaxDiff),
            maxDiff = limit.max - normalizedMax,
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
     * Normalize limit.
     * @param {{min: number, max: number}} limit base limit
     * @param {number} step scale step
     * @param {number} valueCount value count
     * @returns {{min: number, max: number}} normalized limit
     * @private
     */
    _normalizeLimit: function(limit, step, valueCount) {
        limit.min = this._normalizeMin(limit.min, step);
        limit.max = this._makeNormalizedMax(limit, step, valueCount);

        return limit;
    },

    /**
     * Decrease minimum value by step value,
     *  when chart type is line or dataMin is minus, options is undefined, minimum values(min, dataMin) are same.
     * @param {number} min base min
     * @param {number} dataMin minimum value of user data
     * @param {number} step scale step
     * @param {?number} optionMin min option
     * @returns {number} changed min
     * @private
     */
    _decreaseMinByStep: function(min, dataMin, step, optionMin) {
        var isLineChart = predicate.isLineChart(this.chartType),
            isMinusDataMin = dataMin < 0,
            isUndefinedMinOption = tui.util.isUndefined(optionMin),
            isSame = (min === dataMin);

        if ((isLineChart || isMinusDataMin) && isUndefinedMinOption && isSame) {
            min -= step;
        }

        return min;
    },

    /**
     * Increase maximum value by step value,
     *  when chart type is line or dataMin is plus, options is undefined, maximum values(max, dataMax) are same.
     * @param {number} max base max
     * @param {number} dataMax maximum value of user data
     * @param {number} step scale step
     * @param {?number} optionMax max option
     * @returns {number} changed max
     * @private
     */
    _increaseMaxByStep: function(max, dataMax, step, optionMax) {
        var isLineChart = predicate.isLineChart(this.chartType),
            isPlusDataMax = dataMax > 0,
            isUndefinedMaxOption = tui.util.isUndefined(optionMax),
            isSame = (max === dataMax);

        if ((isLineChart || isPlusDataMax) && isUndefinedMaxOption && isSame) {
            max += step;
        }

        return max;
    },

    /**
     * Divide scale step.
     * @param {{min: number, max: number}} limit limit
     * @param {number} step step
     * @param {number} candidateValueCount candidate valueCount
     * @returns {number} scale step
     * @private
     */
    _divideScaleStep: function(limit, step, candidateValueCount) {
        var isEvenStep = ((step % 2) === 0),
            valueCount = calculator.makeLabelsFromLimit(limit, step).length,
            twiceValueCount = (valueCount * 2) - 1,
            diffOrg = abs(candidateValueCount - valueCount),
            diffTwice = abs(candidateValueCount - twiceValueCount);

        // step을 반으로 나누었을 때의 valueCount가 후보로 계산된 candidateValueCount와 인접하면 step을 반으로 나누어 반환합니다.
        if (isEvenStep && diffTwice <= diffOrg) {
            step = step / 2;
        }

        return step;
    },

    /**
     * Minimize scale limit.
     * @param {{min: number, max: number}} limit base limit
     * @param {{min: number, max: number}} dataLimit limit of user data
     * @param {number} step scale step
     * @param {number} valueCount value count
     * @param {{min: number, max:number}} options limit options of axis
     * @returns {{min: number, max: number}} minimized limit
     * @private
     */
    _minimizeScaleLimit: function(limit, dataLimit, step, valueCount, options) {
        var min = limit.max,
            max = limit.min,
            comparisonMin = tui.util.isUndefined(options.min) ? dataLimit.min - 1 : options.min,
            comparisonMax = tui.util.isUndefined(options.max) ? dataLimit.max + 1 : options.max;

        tui.util.forEachArray(tui.util.range(1, valueCount), function(valueIndex) {
            var changingStep = (step * valueIndex),
                changedMin = max + changingStep,
                changedMax = min - changingStep;

            // limit이 dataLimit 범위를 넘어갈 것으로 예상되는 경우에 변경을 중단함
            if (dataLimit.min <= changedMin && dataLimit.max >= changedMax) {
                return false;
            }

            if (comparisonMin >= changedMin) {
                limit.min = changedMin;
            }

            if (comparisonMax <= changedMax) {
                limit.max = changedMax;
            }

            return true;
        });

        return limit;
    },

    /**
     * Adjust limit for bubble chart.
     * @param {{min: number, max: number}} limit - limit
     * @param {number} step - step;
     * @private
     */
    _adjustLimitForBubbleChart: function(limit, step) {
        var valueType = this.valueType;
        var seriesDataModel = this.dataProcessor.getSeriesDataModel(this.chartType);
        var maxRadiusValue = seriesDataModel.getMaxValue('r');
        var isBiggerRatioThanHalfRatio = function(seriesItem) {
            return (seriesItem.r / maxRadiusValue) > chartConst.HALF_RATIO;
        };
        var foundMinItem = seriesDataModel.findMinSeriesItem(valueType, isBiggerRatioThanHalfRatio);
        var foundMaxItem = seriesDataModel.findMaxSeriesItem(valueType, isBiggerRatioThanHalfRatio);

        if (foundMinItem) {
            limit.min -= step;
        }

        if (foundMaxItem) {
            limit.max += step;
        }
    },

    /**
     * Make candidate axis scale.
     * @param {{min: number, max: number}} baseLimit base limit
     * @param {{min: number, max: number}} dataLimit limit of user data
     * @param {number} valueCount value count
     * @param {{min: number, max:number}} options limit options of axis
     * @returns {{
     *      limit: {min: number, max: number},
     *      step: number
     * }} scale
     * @private
     */
    _makeCandidateScale: function(baseLimit, dataLimit, valueCount, options) {
        var limit = tui.util.extend({}, baseLimit),
            step;

        // 01. 기본 limit 정보로 step 얻기
        step = calculator.calculateStepFromLimit(limit, valueCount);

        // 02. step 정규화 시키기 (ex: 0.3 --> 0.5, 7 --> 10)
        step = calculator.normalizeAxisNumber(step);

        // 03. limit 정규화 시키기
        limit = this._normalizeLimit(limit, step, valueCount);

        // 04. line차트의 경우 사용자의 min값이 limit의 min값과 같을 경우, min값을 1 step 감소 시킴
        limit.min = this._decreaseMinByStep(limit.min, dataLimit.min, step, options.min);

        // 04. 사용자의 max값이 scale max와 같을 경우, max값을 1 step 증가 시킴
        limit.max = this._increaseMaxByStep(limit.max, dataLimit.max, step, options.max);

        // 05. axis limit이 사용자 min, max와 거리가 멀 경우 조절
        limit = this._minimizeScaleLimit(limit, dataLimit, step, valueCount, options);

        // 06. 조건에 따라 step값을 반으로 나눔
        step = this._divideScaleStep(limit, step, valueCount);

        if (predicate.isBubbleChart(this.chartType)) {
            this._adjustLimitForBubbleChart(limit, step);
        }

        return {
            limit: limit,
            step: step,
            valueCount: abs(limit.max - limit.min) / step
        };
    },

    /**
     * Make candidates about axis scale.
     * @param {{
     *      limit: {min: number, max: number},
     *      options: {min: number, max: number},
     *      divideNum: number
     * }} integerTypeScale - integer type axis scale
     * @param {Array.<number>} valueCounts - candidate counts of value
     * @returns {Array.<{limit:{min: number, max: number}, stpe: number}>} - candidates scale
     * @private
     */
    _makeCandidateScales: function(integerTypeScale, valueCounts) {
        var self = this,
            dataLimit = integerTypeScale.limit,
            options = integerTypeScale.options,
            baseLimit = this._makeBaseLimit(dataLimit, options);

        return tui.util.map(valueCounts, function(valueCount) {
            return self._makeCandidateScale(baseLimit, dataLimit, valueCount, options);
        });
    },

    /**
     * Get comparing value for selecting axis scale.
     * @param {{min: number, max: number}} baseLimit - limit
     * @param {Array.<number>} valueCounts - candidate counts of value
     * @param {{limit: {min: number, max: number}, step: number}} candidateScale - scale
     * @param {number} index - index
     * @returns {number} comparing value
     * @private
     */
    _getComparingValue: function(baseLimit, valueCounts, candidateScale, index) {
        var diffMax = abs(candidateScale.limit.max - baseLimit.max);
        var diffMin = abs(baseLimit.min - candidateScale.limit.min);
        // 예상 label count와 차이가 많을 수록 후보 제외 가능성이 높음
        var diffCount = Math.max(abs(valueCounts[index] - candidateScale.valueCount), 1);
        // 소수점 이하 길이가 길 수록 후보에서 제외될 가능성이 높음
        var weight = Math.pow(10, tui.util.getDecimalLength(candidateScale.step));

        return (diffMax + diffMin) * diffCount * weight;
    },

    /**
     * Select axis scale.
     * @param {{min: number, max: number}} baseLimit limit
     * @param {Array.<{limit: {min: number, max: number}, step: number}>} candidates scale candidates
     * @param {Array.<number>} valueCounts - label counts
     * @returns {{limit: {min: number, max: number}, step: number}} selected scale
     * @private
     */
    _selectAxisScale: function(baseLimit, candidates, valueCounts) {
        var getComparingValue = tui.util.bind(this._getComparingValue, this, baseLimit, valueCounts);
        var axisScale = tui.util.min(candidates, getComparingValue);

        return axisScale;
    },

    /**
     * Restore number state of scale.
     * @memberOf module:axisDataMaker
     * @param {{limit: {min: number, max: number}, step: number}} scale scale
     * @param {number} divideNum divide num
     * @returns {{limit: {min: number, max: number}, step: number}} restored scale
     * @private
     */
    _restoreNumberState: function(scale, divideNum) {
        if (divideNum === 1) {
            return scale;
        }

        scale.step = tui.util.division(scale.step, divideNum);
        scale.limit.min = tui.util.division(scale.limit.min, divideNum);
        scale.limit.max = tui.util.division(scale.limit.max, divideNum);

        return scale;
    },

    /**
     * Calculate scale.
     * @returns {{limit: {min: number, max: number}, step: number}}
     * @private
     */
    _calculateScale: function() {
        var baseValues = this._makeBaseValues();
        var dataLimit = {
            min: tui.util.min(baseValues),
            max: tui.util.max(baseValues)
        };
        var integerTypeScale, valueCounts, candidates, scale;

        if (dataLimit.min === 0 && dataLimit.max === 0) {
            dataLimit.max = 5;
        }

        if (this._isDivergingChart()) {
            dataLimit = this._makeLimitForDivergingOption(dataLimit);
        }

        // 01. limit, options 정보를 정수형으로 변경
        integerTypeScale = this._makeIntegerTypeScale(dataLimit);

        // 02. value count 후보군 얻기
        valueCounts = this.valueCounts || this._getCandidateCountsOfValue();

        // 03. axis scale 후보군 얻기
        candidates = this._makeCandidateScales(integerTypeScale, valueCounts);

        // 04. axis scale 후보군 중 하나 선택
        scale = this._selectAxisScale(integerTypeScale.limit, candidates, valueCounts);

        // 05. 정수형으로 변경했던 scale를 원래 형태로 변경
        scale = this._restoreNumberState(scale, integerTypeScale.divideNum);

        return scale;
    },

    /**
     * Get values for sum.
     * @returns {Array.<number>}
     * @private
     */
    _getValuesForSum: function() {
        var values;

        if (this.isSingleYAxis) {
            values = this.dataProcessor.getValues();
        } else {
            values = this.dataProcessor.getValues(this.chartType);
        }

        return values;
    },

    /**
     * Calculate minus sum about group values.
     * @returns {number}
     * @private
     */
    _calculateMinusSum: function() {
        var values = this._getValuesForSum();

        return calculator.sumMinusValues(values);
    },

    /**
     * Calculate plus sum about group values.
     * @returns {number}
     * @private
     */
    _calculatePlusSum: function() {
        var values = this._getValuesForSum();

        return calculator.sumPlusValues(values);
    },

    /**
     * Get percent stackType scale.
     * @returns {{limit: {min:number, max:number}, step: number}}
     * @private
     */
    _getPercentStackedScale: function() {
        var scale;

        if (this._calculateMinusSum() === 0) {
            scale = chartConst.PERCENT_STACKED_AXIS_SCALE;
        } else if (this._calculatePlusSum() === 0) {
            scale = chartConst.MINUS_PERCENT_STACKED_AXIS_SCALE;
        } else if (this._isDivergingChart()) {
            scale = chartConst.DIVERGING_PERCENT_STACKED_AXIS_SCALE;
        } else {
            scale = chartConst.DUAL_PERCENT_STACKED_AXIS_SCALE;
        }

        return scale;
    },

    /**
     * Make scale.
     * @returns {{limit: {min:number, max:number}, step: number}}
     * @private
     */
    _makeScale: function() {
        var scale;

        if (this._isPercentStackChart()) {
            scale = this._getPercentStackedScale();
        } else {
            scale = this._calculateScale();
        }

        return scale;
    }
});

module.exports = AxisScaleMaker;

},{"../const":31,"./calculator":57,"./predicate":61,"./renderUtil":63}],56:[function(require,module,exports){
/**
 * @fileoverview Bounds maker.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const');
var calculator = require('./calculator');
var predicate = require('./predicate');
var renderUtil = require('./renderUtil');

/**
 * Dimension.
 * @typedef {{width: number, height:number}} dimension
 */

/**
 * Position.
 * @typedef {{left: number, top:number}} position
 */

/**
 * Bound.
 * @typedef {{dimension: dimension, position:position}} bound
 */

var BoundsMaker = tui.util.defineClass(/** @lends BoundsMaker.prototype */{
    /**
     * Bounds maker.
     * @constructs BoundsMaker
     * @param {object} params parameters
     */
    init: function(params) {
        /**
         * options
         * @type {object}
         */
        this.options = params.options || {};
        this.options.legend = this.options.legend || {};
        this.options.yAxis = this.options.yAxis || {};

        /**
         * theme
         * @type {object}
         */
        this.theme = params.theme || {};

        /**
         * whether chart has axes or not
         * @type {boolean}
         */
        this.hasAxes = params.hasAxes;

        /**
         * chart type
         * @type {string}
         */
        this.chartType = params.chartType;

        /**
         * chart types for combo.
         */
        this.chartTypes = params.chartTypes || [];

        /**
         * data processor
         * @type {DataProcessor}
         */
        this.dataProcessor = params.dataProcessor;

        this.initBoundsData();
    },

    /**
     * Initialize bounds data.
     * @param {object} chartOption chart option
     */
    initBoundsData: function(chartOption) {
        this.dimensions = {
            legend: {
                width: 0
            },
            yAxis: {
                width: 0
            },
            rightYAxis: {
                width: 0
            },
            xAxis: {
                height: 0
            },
            circleLegend: {
                width: 0
            },
            calculationLegend: {
                width: 0
            }
        };

        this.positions = {};

        this.axesData = {};

        this.xAxisDegree = 0;

        /**
         * chart left padding
         * @type {number}
         */
        this.chartLeftPadding = chartConst.CHART_PADDING;

        if (chartOption) {
            this.options.chart = chartOption;
        }

        this._registerChartDimension();
        this._registerTitleDimension();
    },

    /**
     * Register dimension.
     * @param {string} name component name
     * @param {dimension} dimension component dimension
     * @private
     */
    _registerDimension: function(name, dimension) {
        this.dimensions[name] = tui.util.extend(this.dimensions[name] || {}, dimension);
    },

    /**
     * Register base dimension.
     * @param {string} name component name
     * @param {dimension} dimension component dimension
     */
    registerBaseDimension: function(name, dimension) {
        this._registerDimension(name, dimension);
    },

    /**
     * Register axes data.
     * @param {object} axesData axes data
     */
    registerAxesData: function(axesData) {
        this.axesData = axesData;
    },

    /**
     * Axes data.
     * @returns {{xAxis: object, yAxis: object, rightYAxis: object}}
     */
    getAxesData: function() {
        return this.axesData;
    },

    /**
     * Calculate step of pixel unit.
     * @param {{tickCount: number, isLabel: boolean}} axisData - data for rendering axis
     * @param {number} size - width or height of serise area
     * @returns {number}
     * @private
     */
    _calculatePixelStep: function(axisData, size) {
        var tickCount = axisData.tickCount;
        var pixelStep;

        if (axisData.isLabel) {
            pixelStep = size / tickCount / 2;
        } else {
            pixelStep = size / (tickCount - 1);
        }

        return parseInt(pixelStep, 10);
    },

    /**
     * Get minimum step of pixel unit for axis.
     * @returns {number}
     */
    getMinimumPixelStepForAxis: function() {
        var dimension = this.getDimension('series');
        var yPixelStep = this._calculatePixelStep(this.axesData.yAxis, dimension.height);
        var xPixelStep = this._calculatePixelStep(this.axesData.xAxis, dimension.width);

        return Math.min(yPixelStep, xPixelStep);
    },

    /**
     * Get max radius for bubble chart.
     * @returns {number}
     */
    getMaxRadiusForBubbleChart: function() {
        var maxRadius = this.getMinimumPixelStepForAxis();
        var legendWidth = this.getDimension('calculationLegend').width || chartConst.MIN_LEGEND_WIDTH;
        var circleLegendWidth = this.getDimension('circleLegend').width || legendWidth;

        return Math.min((circleLegendWidth - chartConst.CIRCLE_LEGEND_PADDING) / 2, maxRadius);
    },

    /**
     * Get bound.
     * @param {string} name component name
     * @returns {bound} component bound
     */
    getBound: function(name) {
        return {
            dimension: this.dimensions[name] || {},
            position: this.positions[name] || {}
        };
    },

    /**
     * Set bound.
     * @param {string} name component name
     * @param {bound} bound component bound
     * @private
     */
    _setBound: function(name, bound) {
        this.dimensions[name] = bound.dimension;
        this.positions[name] = bound.position;
    },

    /**
     * Get dimension.
     * @param {string} name component name
     * @returns {dimension} component dimension
     */
    getDimension: function(name) {
        return this.dimensions[name];
    },

    /**
     * Get position.
     * @param {string} name component name
     * @returns {position} component position
     */
    getPosition: function(name) {
        return this.positions[name];
    },

    /**
     * Register chart dimension
     * @private
     */
    _registerChartDimension: function() {
        var chartOptions = this.options.chart || {},
            dimension = {
                width: chartOptions.width || chartConst.CHART_DEFAULT_WIDTH,
                height: chartOptions.height || chartConst.CHART_DEFAULT_HEIGHT
            };

        this._registerDimension('chart', dimension);
    },

    /**
     * Register title dimension
     * @private
     */
    _registerTitleDimension: function() {
        var chartOptions = this.options.chart || {},
            titleHeight = renderUtil.getRenderedLabelHeight(chartOptions.title, this.theme.title),
            dimension = {
                height: titleHeight + chartConst.TITLE_PADDING
            };

        this._registerDimension('title', dimension);
    },

    /**
     * Calculate limit width of x axis.
     * @param {number} labelCount - label count
     * @returns {number} limit width
     * @private
     */
    _calculateXAxisLabelLimitWidth: function(labelCount) {
        var seriesWidth = this.getDimension('series').width;
        var isAlign = predicate.isLineTypeChart(this.chartType);
        var xAxisOptions = this.options.xAxis || {};

        labelCount = labelCount || this.axesData.xAxis.labels.length;

        if (predicate.isValidLabelInterval(xAxisOptions.labelInterval, xAxisOptions.tickInterval)) {
            seriesWidth *= xAxisOptions.labelInterval;
        }

        return seriesWidth / (isAlign ? labelCount - 1 : labelCount);
    },

    /**
     * Find rotation degree.
     * @param {number} limitWidth limit width
     * @param {number} labelWidth label width
     * @param {number} labelHeight label height
     * @returns {number} rotation degree
     * @private
     */
    _findRotationDegree: function(limitWidth, labelWidth, labelHeight) {
        var foundDegree,
            halfWidth = labelWidth / 2,
            halfHeight = labelHeight / 2;

        tui.util.forEachArray(chartConst.DEGREE_CANDIDATES, function(degree) {
            var compareWidth = (calculator.calculateAdjacent(degree, halfWidth) +
                calculator.calculateAdjacent(chartConst.ANGLE_90 - degree, halfHeight)) * 2;

            foundDegree = degree;
            if (compareWidth <= limitWidth + chartConst.XAXIS_LABEL_COMPARE_MARGIN) {
                return false;
            }

            return true;
        });

        return foundDegree;
    },

    /**
     * Make rotation info about horizontal label.
     * @param {number} limitWidth limit width
     * @param {Array.<string>} labels axis labels
     * @param {object} theme axis label theme
     * @returns {?object} rotation info
     * @private
     */
    _makeHorizontalLabelRotationInfo: function(limitWidth) {
        var labels = this.axesData.xAxis.labels,
            theme = this.theme.xAxis.label,
            maxLabelWidth = renderUtil.getRenderedLabelsMaxWidth(labels, theme),
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
     * Calculate overflow position left.
     * @param {{degree: number, labelHeight: number}} rotationInfo rotation info
     * @param {string} firstLabel firstLabel
     * @returns {number} overflow position left
     * @private
     */
    _calculateOverflowLeft: function(rotationInfo, firstLabel) {
        var degree = rotationInfo.degree;
        var labelHeight = rotationInfo.labelHeight;
        var firstLabelWidth = renderUtil.getRenderedLabelWidth(firstLabel, this.theme.xAxis.label);
        var newLabelWidth = (calculator.calculateAdjacent(degree, firstLabelWidth / 2)
                + calculator.calculateAdjacent(chartConst.ANGLE_90 - degree, labelHeight / 2)) * 2;
        var yAxisWidth = this.options.yAxis.isCenter ? 0 : this.getDimension('yAxis').width;
        var diffLeft = newLabelWidth - yAxisWidth;

        return diffLeft;
    },

    /**
     * Update width of dimensions.
     * @param {number} overflowLeft overflow left
     * @private
     */
    _updateDimensionsWidth: function(overflowLeft) {
        if (overflowLeft > 0) {
            this.chartLeftPadding += overflowLeft;
            this.dimensions.plot.width -= overflowLeft;
            this.dimensions.series.width -= overflowLeft;
            this.dimensions.customEvent.width -= overflowLeft;
            this.dimensions.xAxis.width -= overflowLeft;
            this.positions.series.left += overflowLeft;
        }
    },

    /**
     * Update degree of rotationInfo.
     * @param {{degree: number, maxLabelWidth: number, labelHeight: number}} rotationInfo - rotation info
     * @param {number} labelCount - label count
     * @param {number} overflowLeft - overflow left
     * @private
     */
    _updateDegree: function(rotationInfo, labelCount, overflowLeft) {
        var limitWidth, newDegree;
        if (overflowLeft > 0) {
            limitWidth = this._calculateXAxisLabelLimitWidth(labelCount) + chartConst.XAXIS_LABEL_GUTTER;
            newDegree = this._findRotationDegree(limitWidth, rotationInfo.maxLabelWidth, rotationInfo.labelHeight);
            rotationInfo.degree = newDegree;
        }
    },

    /**
     * Calculate rotated height of xAxis.
     * @param {{degree: number, maxLabelWidth: number, labelHeight: number}} rotationInfo rotation info
     * @returns {number} xAxis height
     * @private
     */
    _calculateXAxisRotatedHeight: function(rotationInfo) {
        var degree = rotationInfo.degree;
        var maxLabelWidth = rotationInfo.maxLabelWidth;
        var labelHeight = rotationInfo.labelHeight;
        var axisHeight = (calculator.calculateOpposite(degree, maxLabelWidth / 2) +
                calculator.calculateOpposite(chartConst.ANGLE_90 - degree, labelHeight / 2)) * 2;

        return axisHeight;
    },

    /**
     * Calculate height difference between origin category and rotation category.
     * @param {{degree: number, maxLabelWidth: number, labelHeight: number}} rotationInfo rotation info
     * @returns {number} height difference
     * @private
     */
    _calculateDiffWithRotatedHeight: function(rotationInfo) {
        var rotatedHeight = this._calculateXAxisRotatedHeight(rotationInfo);

        return rotatedHeight - rotationInfo.labelHeight;
    },

    /**
     * Calculate height difference between origin category and multiline category.
     * @param {Array.<string>} labels labels
     * @param {number} limitWidth limit width
     * @returns {number} calculated height
     * @private
     */
    _calculateDiffWithMultilineHeight: function(labels, limitWidth) {
        var theme = this.theme.xAxis.label,
            multilineLabels = this.dataProcessor.getMultilineCategories(limitWidth, theme, this.axesData.xAxis.labels),
            normalHeight = renderUtil.getRenderedLabelsMaxHeight(labels, theme),
            multilineHeight = renderUtil.getRenderedLabelsMaxHeight(multilineLabels, tui.util.extend({
                cssText: 'line-height:1.2;width:' + limitWidth + 'px'
            }, theme));

        return multilineHeight - normalHeight;
    },

    /**
     * Update height of dimensions.
     * @param {number} diffHeight diff height
     * @private
     */
    _updateDimensionsHeight: function(diffHeight) {
        this.dimensions.plot.height -= diffHeight;
        this.dimensions.series.height -= diffHeight;
        this.dimensions.customEvent.height -= diffHeight;
        this.dimensions.tooltip.height -= diffHeight;
        this.dimensions.yAxis.height -= diffHeight;
        this.dimensions.rightYAxis.height -= diffHeight;
        this.dimensions.xAxis.height += diffHeight;
    },

    /**
     * Update dimensions and degree.
     * @private
     */
    _updateDimensionsAndDegree: function() {
        var xAxisOptions = this.options.xAxis || {};
        var limitWidth = this._calculateXAxisLabelLimitWidth();
        var labels = tui.util.filter(this.axesData.xAxis.labels, function(label) {
            return !!label;
        });
        var rotationInfo, overflowLeft, diffHeight;

        if (xAxisOptions.rotateLabel !== false) {
            rotationInfo = this._makeHorizontalLabelRotationInfo(limitWidth);
        }

        if (rotationInfo) {
            overflowLeft = this._calculateOverflowLeft(rotationInfo, labels[0]);
            this.xAxisDegree = rotationInfo.degree;
            this._updateDimensionsWidth(overflowLeft);
            this._updateDegree(rotationInfo, labels.length, overflowLeft);
            diffHeight = this._calculateDiffWithRotatedHeight(rotationInfo);
        } else {
            diffHeight = this._calculateDiffWithMultilineHeight(labels, limitWidth);
        }

        this._updateDimensionsHeight(diffHeight);
    },

    /**
     * Make plot dimention
     * @returns {{width: number, height: number}} plot dimension
     * @private
     */
    _makePlotDimension: function() {
        var seriesDimension = this.getDimension('series');

        return {
            width: seriesDimension.width,
            height: seriesDimension.height + chartConst.OVERLAPPING_WIDTH
        };
    },

    /**
     * Register axis components dimension.
     * @private
     */
    _registerAxisComponentsDimension: function() {
        var plotDimension = this._makePlotDimension();

        this._registerDimension('plot', plotDimension);

        this._registerDimension('xAxis', {
            width: plotDimension.width
        });

        this._registerDimension('yAxis', {
            height: plotDimension.height
        });

        this._registerDimension('rightYAxis', {
            height: plotDimension.height
        });
    },

    /**
     * Make series width.
     * @returns {number} series width
     */
    makeSeriesWidth: function() {
        var chartWidth = this.getDimension('chart').width;
        var yAxisWidth = this.getDimension('yAxis').width;
        var legendDimension = this.getDimension('calculationLegend');
        var legendWidth, rightAreaWidth;

        if (predicate.hasVerticalLegendWidth(this.options.legend)) {
            legendWidth = legendDimension ? legendDimension.width : 0;
        } else {
            legendWidth = 0;
        }

        rightAreaWidth = legendWidth + this.getDimension('rightYAxis').width;

        return chartWidth - (chartConst.CHART_PADDING * 2) - yAxisWidth - rightAreaWidth;
    },

    /**
     * Make series height
     * @returns {number} series height
     */
    makeSeriesHeight: function() {
        var chartHeight = this.getDimension('chart').height;
        var titleHeight = this.getDimension('title').height;
        var legendOption = this.options.legend;
        var legendHeight, bottomAreaWidth;

        if (predicate.isHorizontalLegend(legendOption.align) && legendOption.visible) {
            legendHeight = this.getDimension('legend').height;
        } else {
            legendHeight = 0;
        }

        bottomAreaWidth = legendHeight + this.dimensions.xAxis.height;

        return chartHeight - (chartConst.CHART_PADDING * 2) - titleHeight - bottomAreaWidth;
    },

    /**
     * Make series dimension.
     * @returns {{width: number, height: number}} series dimension
     * @private
     */
    _makeSeriesDimension: function() {
        return {
            width: this.makeSeriesWidth(),
            height: this.makeSeriesHeight()
        };
    },

    /**
     * Register center componets dimension.
     * @private
     */
    _registerCenterComponentsDimension: function() {
        var seriesDimension = this.getDimension('series');

        this._registerDimension('tooltip', seriesDimension);
        this._registerDimension('customEvent', seriesDimension);
    },

    /**
     * Register axes type component positions.
     * @param {number} leftLegendWidth legend width
     * @private
     */
    _registerAxisComponentsPosition: function(leftLegendWidth) {
        var seriesPosition = this.getPosition('series'),
            seriesDimension = this.getDimension('series'),
            yAxisWidth = this.getDimension('yAxis').width,
            leftAreaWidth = yAxisWidth + seriesDimension.width + leftLegendWidth;

        this.positions.plot = {
            top: seriesPosition.top,
            left: seriesPosition.left
        };

        this.positions.yAxis = {
            top: seriesPosition.top,
            left: this.chartLeftPadding + leftLegendWidth
        };

        this.positions.xAxis = {
            top: seriesPosition.top + seriesDimension.height,
            left: seriesPosition.left
        };

        this.positions.rightYAxis = {
            top: seriesPosition.top,
            left: this.chartLeftPadding + leftAreaWidth - chartConst.OVERLAPPING_WIDTH
        };
    },

    /**
     * Make legend bound.
     * @returns {{dimension: {width: number, height: number}, position: {top: number, left: number}}} legend bound
     * @private
     */
    _makeLegendPosition: function() {
        var dimensions = this.dimensions,
            seriesDimension = this.getDimension('series'),
            legendOption = this.options.legend,
            top = dimensions.title.height,
            yAxisAreaWidth, left;

        if (predicate.isLegendAlignBottom(legendOption.align)) {
            top += seriesDimension.height + this.getDimension('xAxis').height + chartConst.LEGEND_AREA_PADDING;
        }

        if (predicate.isHorizontalLegend(legendOption.align)) {
            left = ((this.getDimension('chart').width - this.getDimension('legend').width) / 2)
                - chartConst.LEGEND_AREA_PADDING;
        } else if (predicate.isLegendAlignLeft(legendOption.align)) {
            left = 0;
        } else {
            yAxisAreaWidth = this.getDimension('yAxis').width + this.getDimension('rightYAxis').width;
            left = seriesDimension.width + yAxisAreaWidth + this.chartLeftPadding;
        }

        return {
            top: top,
            left: left
        };
    },

    /**
     * Make CircleLegend position.
     * @returns {{top: number, left: number}}
     * @private
     */
    _makeCircleLegendPosition: function() {
        var seriesPosition = this.getPosition('series');
        var seriesDimension = this.getDimension('series');
        var circleDimension = this.getDimension('circleLegend');
        var legendOption = this.options.legend;
        var left, legendWidth;

        if (predicate.isLegendAlignLeft(legendOption.align)) {
            left = 0;
        } else {
            left = seriesPosition.left + seriesDimension.width;
        }

        if (predicate.hasVerticalLegendWidth(this.options.legend)) {
            legendWidth = this.getDimension('legend').width + chartConst.CHART_PADDING;
            left += (legendWidth - circleDimension.width) / 2;
        }

        return {
            top: seriesPosition.top + seriesDimension.height - circleDimension.height,
            left: left
        };
    },

    /**
     * Whether need expansion series or not.
     * @returns {boolean}
     * @private
     */
    _isNeedExpansionSeries: function() {
        var chartType = this.chartType;

        return !predicate.isMousePositionChart(chartType) && !predicate.isTreemapChart(chartType)
            && !predicate.isPieDonutComboChart(chartType, this.chartTypes);
    },

    /**
     * Register essential components positions.
     * Essential components is all components except components for axis.
     * @private
     */
    _registerEssentialComponentsPositions: function() {
        var seriesPosition = this.getPosition('series');
        var tooltipPosition;

        this.positions.customEvent = tui.util.extend({}, seriesPosition);
        this.positions.legend = this._makeLegendPosition();

        if (this.getDimension('circleLegend').width) {
            this.positions.circleLegend = this._makeCircleLegendPosition();
        }

        if (this._isNeedExpansionSeries()) {
            tooltipPosition = {
                top: seriesPosition.top - chartConst.SERIES_EXPAND_SIZE,
                left: seriesPosition.left - chartConst.SERIES_EXPAND_SIZE
            };
        } else {
            tooltipPosition = seriesPosition;
        }

        this.positions.tooltip = tooltipPosition;
    },

    /**
     * Register positions.
     * @private
     */
    _registerPositions: function() {
        var alignOption = this.options.legend.align;
        var isVisibleLegend = this.options.legend.visible;
        var legendDimension = this.getDimension('legend');
        var topLegendHeight = (predicate.isLegendAlignTop(alignOption) && isVisibleLegend) ? legendDimension.height : 0;
        var leftLegendWidth = (predicate.isLegendAlignLeft(alignOption) && isVisibleLegend) ? legendDimension.width : 0;
        var seriesPosition = {
            top: this.getDimension('title').height + chartConst.CHART_PADDING + topLegendHeight,
            left: this.chartLeftPadding + leftLegendWidth + this.getDimension('yAxis').width
        };

        this.positions.series = seriesPosition;

        if (this.hasAxes) {
            this._updateDimensionsAndDegree();
            this._registerAxisComponentsPosition(leftLegendWidth);
        }

        this._registerEssentialComponentsPositions();
    },

    /**
     * Register bound of extended series for rendering.
     * @private
     */
    _registerExtendedSeriesBound: function() {
        var seriesBound = this.getBound('series');
        if (this._isNeedExpansionSeries()) {
            seriesBound = renderUtil.expandBound(seriesBound);
        }

        this._setBound('extendedSeries', seriesBound);
    },

    /**
     * Update bounds(positions, dimensions) of components for center option of yAxis.
     * @private
     */
    _updateBoundsForYAxisCenterOption: function() {
        var yAxisWidth = this.getDimension('yAxis').width,
            yAxisExtensibleLeft = Math.floor((this.getDimension('series').width / 2)) + chartConst.OVERLAPPING_WIDTH,
            xAxisDecreasingLeft = yAxisWidth - chartConst.OVERLAPPING_WIDTH,
            additionalLeft = renderUtil.isOldBrowser() ? 1 : 0;

        this.dimensions.extendedSeries.width += yAxisWidth;
        this.dimensions.xAxis.width += chartConst.OVERLAPPING_WIDTH;
        this.dimensions.plot.width += yAxisWidth + chartConst.OVERLAPPING_WIDTH;
        this.dimensions.customEvent.width += yAxisWidth;
        this.dimensions.tooltip.width += yAxisWidth;

        this.positions.series.left -= (yAxisWidth - additionalLeft);
        this.positions.extendedSeries.left -= (xAxisDecreasingLeft - additionalLeft);
        this.positions.plot.left -= xAxisDecreasingLeft;
        this.positions.yAxis.left += yAxisExtensibleLeft;
        this.positions.xAxis.left -= xAxisDecreasingLeft;
        this.positions.customEvent.left -= xAxisDecreasingLeft;
        this.positions.tooltip.left -= xAxisDecreasingLeft;
    },

    /**
     * Register series dimension.
     */
    registerSeriesDimension: function() {
        var seriesDimension = this._makeSeriesDimension();

        this._registerDimension('series', seriesDimension);
    },

    /**
     * Register bounds data.
     */
    registerBoundsData: function() {
        this._registerCenterComponentsDimension();

        if (this.hasAxes) {
            this._registerAxisComponentsDimension();
        }

        this._registerPositions();
        this._registerExtendedSeriesBound();

        if (this.options.yAxis.isCenter) {
            this._updateBoundsForYAxisCenterOption();
        }
    }
});

module.exports = BoundsMaker;

},{"../const":31,"./calculator":57,"./predicate":61,"./renderUtil":63}],57:[function(require,module,exports){
/**
 * @fileoverview calculator.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

/*eslint no-magic-numbers: [1, {ignore: [-1, 0, 1, 2, 10, 20, 6, 0.1]}]*/

var chartConst = require('../const');

/**
 * Calculator.
 * @module calculator
 */
var calculator = {
    /**
     * Calculate limit from chart min, max data.
     *  - http://peltiertech.com/how-excel-calculates-automatic-chart-axis-limits/
     * @memberOf module:calculator
     * @param {number} min min minimum value of user data
     * @param {number} max max maximum value of user data
     * @param {number} tickCount tick count
     * @returns {{min: number, max: number}} limit axis limit
     */
    calculateLimit: function(min, max) {
        var saveMin = 0,
            limit = {},
            iodValue; // increase or decrease value;

        if (min < 0) {
            saveMin = min;
            max -= min;
            min = 0;
        }

        iodValue = (max - min) / 20;
        limit.max = max + iodValue + saveMin;

        if (max / 6 > min) {
            limit.min = 0 + saveMin;
        } else {
            limit.min = min - iodValue + saveMin;
        }

        return limit;
    },

    /**
     * Normalize number.
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
            } else if (num === chartConst.AXIS_LAST_STANDARD_MULTIPLE_NUM) {
                standard = num;
            }

            return true;
        });

        if (standard < 1) {
            normalized = this.normalizeAxisNumber(value * 10) * 0.1;
        } else {
            mod = tui.util.mod(value, standard);
            normalized = tui.util.addition(value, (mod > 0 ? standard - mod : 0));
        }

        normalized *= flag;

        return normalized;
    },

    /**
     * Make tick positions of pixel type.
     * @memberOf module:calculator
     * @param {number} size area width or height
     * @param {number} count tick count
     * @param {?number} additionalPosition additional position
     * @returns {Array.<number>} positions
     */
    makeTickPixelPositions: function(size, count, additionalPosition) {
        var positions = [],
            pxLimit, pxStep;

        additionalPosition = additionalPosition || 0;

        if (count > 0) {
            pxLimit = {min: 0, max: size - 1};
            pxStep = this.calculateStepFromLimit(pxLimit, count);
            positions = tui.util.map(tui.util.range(0, size, pxStep), function(position) {
                return Math.round(position + additionalPosition);
            });
            positions[positions.length - 1] = Math.round(size - 1 + additionalPosition);
        }

        return positions;
    },

    /**
     * Make labels from limit.
     * @memberOf module:calculator
     * @param {{min: number, max: number}} limit axis limit
     * @param {number} step step between max and min
     * @returns {string[]} labels
     * @private
     */
    makeLabelsFromLimit: function(limit, step) {
        var multipleNum = tui.util.findMultipleNum(step);
        var min = Math.round(limit.min * multipleNum);
        var max = Math.round(limit.max * multipleNum);
        var labels = tui.util.range(min, max + 1, step * multipleNum);

        return tui.util.map(labels, function(label) {
            return label / multipleNum;
        });
    },

    /**
     * Calculate step from limit.
     * @memberOf module:calculator
     * @param {{min: number, max: number}} limit axis limit
     * @param {number} count value count
     * @returns {number} step
     */
    calculateStepFromLimit: function(limit, count) {
        return (limit.max - limit.min) / (count - 1);
    },

    /**
     * Calculate adjacent.
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
     * Calculate opposite.
     * @param {number} degree degree
     * @param {number} hypotenuse hypotenuse
     * @returns {number} opposite
     */
    calculateOpposite: function(degree, hypotenuse) {
        return Math.sin(degree * chartConst.RAD) * hypotenuse;
    },

    /**
     * Sum plus values.
     * @param {Array.<number>} values values
     * @returns {number} sum
     */
    sumPlusValues: function(values) {
        var plusValues = tui.util.filter(values, function(value) {
            return value > 0;
        });

        return tui.util.sum(plusValues);
    },

    /**
     * Sum minus values.
     * @param {Array.<number>} values values
     * @returns {number} sum
     */
    sumMinusValues: function(values) {
        var minusValues = tui.util.filter(values, function(value) {
            return value < 0;
        });

        return tui.util.sum(minusValues);
    },

    /**
     * Make percentage value.
     * @param {number} value - value
     * @param {number} totalValue - total value
     * @returns {number}
     */
    makePercentageValue: function(value, totalValue) {
        return value / totalValue * 100;
    },

    /**
     * Calculate ratio for making bound.
     * @param {number} value - value
     * @param {number} divNumber - number for division
     * @param {number} subNumber - number for subtraction
     * @param {number} baseRatio - base ratio
     * @returns {number}
     */
    calculateRatio: function(value, divNumber, subNumber, baseRatio) {
        return ((value - subNumber) / divNumber) * baseRatio;
    }
};

module.exports = calculator;

},{"../const":31}],58:[function(require,module,exports){
/**
 * @fileoverview Utility methods to manipulate colors
 * @author NHN Ent. FE Development Lab <dl_javascript@nhnent.com>
 */
'use strict';

/*eslint no-magic-numbers: [1, {ignore: [-1, 0, 1, 2, 4, 16]}]*/

var hexRX = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i;

/**
 * Color map.
 * http://stackoverflow.com/questions/1573053/javascript-function-to-convert-color-names-to-hex-codes
 * http://www.w3schools.com/HTML/html_colornames.asp
 * @type {object}
 */
var colorMap = {
    'aliceblue': '#f0f8ff',
    'antiquewhite': '#faebd7',
    'aqua': '#00ffff',
    'aquamarine': '#7fffd4',
    'azure': '#f0ffff',
    'beige': '#f5f5dc',
    'bisque': '#ffe4c4',
    'black': '#000000',
    'blanchedalmond': '#ffebcd',
    'blue': '#0000ff',
    'blueviolet': '#8a2be2',
    'brown': '#a52a2a',
    'burlywood': '#deb887',
    'cadetblue': '#5f9ea0',
    'chartreuse': '#7fff00',
    'chocolate': '#d2691e',
    'coral': '#ff7f50',
    'cornflowerblue': '#6495ed',
    'cornsilk': '#fff8dc',
    'crimson': '#dc143c',
    'cyan': '#00ffff',
    'darkblue': '#00008b',
    'darkcyan': '#008b8b',
    'darkgoldenrod': '#b8860b',
    'darkgray': '#a9a9a9',
    'darkgreen': '#006400',
    'darkkhaki': '#bdb76b',
    'darkmagenta': '#8b008b',
    'darkolivegreen': '#556b2f',
    'darkorange': '#ff8c00',
    'darkorchid': '#9932cc',
    'darkred': '#8b0000',
    'darksalmon': '#e9967a',
    'darkseagreen': '#8fbc8f',
    'darkslateblue': '#483d8b',
    'darkslategray': '#2f4f4f',
    'darkturquoise': '#00ced1',
    'darkviolet': '#9400d3',
    'deeppink': '#ff1493',
    'deepskyblue': '#00bfff',
    'dimgray': '#696969',
    'dodgerblue': '#1e90ff',
    'firebrick': '#b22222',
    'floralwhite': '#fffaf0',
    'forestgreen': '#228b22',
    'fuchsia': '#ff00ff',
    'gainsboro': '#dcdcdc',
    'ghostwhite': '#f8f8ff',
    'gold': '#ffd700',
    'goldenrod': '#daa520',
    'gray': '#808080',
    'green': '#008000',
    'greenyellow': '#adff2f',
    'honeydew': '#f0fff0',
    'hotpink': '#ff69b4',
    'indianred ': '#cd5c5c',
    'indigo': '#4b0082',
    'ivory': '#fffff0',
    'khaki': '#f0e68c',
    'lavender': '#e6e6fa',
    'lavenderblush': '#fff0f5',
    'lawngreen': '#7cfc00',
    'lemonchiffon': '#fffacd',
    'lightblue': '#add8e6',
    'lightcoral': '#f08080',
    'lightcyan': '#e0ffff',
    'lightgoldenrodyellow': '#fafad2',
    'lightgrey': '#d3d3d3',
    'lightgreen': '#90ee90',
    'lightpink': '#ffb6c1',
    'lightsalmon': '#ffa07a',
    'lightseagreen': '#20b2aa',
    'lightskyblue': '#87cefa',
    'lightslategray': '#778899',
    'lightsteelblue': '#b0c4de',
    'lightyellow': '#ffffe0',
    'lime': '#00ff00',
    'limegreen': '#32cd32',
    'linen': '#faf0e6',
    'magenta': '#ff00ff',
    'maroon': '#800000',
    'mediumaquamarine': '#66cdaa',
    'mediumblue': '#0000cd',
    'mediumorchid': '#ba55d3',
    'mediumpurple': '#9370d8',
    'mediumseagreen': '#3cb371',
    'mediumslateblue': '#7b68ee',
    'mediumspringgreen': '#00fa9a',
    'mediumturquoise': '#48d1cc',
    'mediumvioletred': '#c71585',
    'midnightblue': '#191970',
    'mintcream': '#f5fffa',
    'mistyrose': '#ffe4e1',
    'moccasin': '#ffe4b5',
    'navajowhite': '#ffdead',
    'navy': '#000080',
    'oldlace': '#fdf5e6',
    'olive': '#808000',
    'olivedrab': '#6b8e23',
    'orange': '#ffa500',
    'orangered': '#ff4500',
    'orchid': '#da70d6',
    'palegoldenrod': '#eee8aa',
    'palegreen': '#98fb98',
    'paleturquoise': '#afeeee',
    'palevioletred': '#d87093',
    'papayawhip': '#ffefd5',
    'peachpuff': '#ffdab9',
    'peru': '#cd853f',
    'pink': '#ffc0cb',
    'plum': '#dda0dd',
    'powderblue': '#b0e0e6',
    'purple': '#800080',
    'red': '#ff0000',
    'rosybrown': '#bc8f8f',
    'royalblue': '#4169e1',
    'saddlebrown': '#8b4513',
    'salmon': '#fa8072',
    'sandybrown': '#f4a460',
    'seagreen': '#2e8b57',
    'seashell': '#fff5ee',
    'sienna': '#a0522d',
    'silver': '#c0c0c0',
    'skyblue': '#87ceeb',
    'slateblue': '#6a5acd',
    'slategray': '#708090',
    'snow': '#fffafa',
    'springgreen': '#00ff7f',
    'steelblue': '#4682b4',
    'tan': '#d2b48c',
    'teal': '#008080',
    'thistle': '#d8bfd8',
    'tomato': '#ff6347',
    'turquoise': '#40e0d0',
    'violet': '#ee82ee',
    'wheat': '#f5deb3',
    'white': '#ffffff',
    'whitesmoke': '#f5f5f5',
    'yellow': '#ffff00',
    'yellowgreen': '#9acd32'
};

var colorutil = {
    /**
     * pad left zero characters.
     * @param {number} number number value to pad zero.
     * @param {number} length pad length to want.
     * @returns {string} padded string.
     */
    leadingZero: function(number, length) {
        var zero = '',
            i = 0;

        if (String(number).length > length) {
            return String(number);
        }

        for (; i < (length - 1); i += 1) {
            zero += '0';
        }

        return (zero + number).slice(length * -1);
    },

    /**
     * Check validate of hex string value is RGB
     * @param {string} str - rgb hex string
     * @returns {boolean} return true when supplied str is valid RGB hex string
     */
    isValidRGB: function(str) {
        return hexRX.test(str);
    },

    // @license RGB <-> HSV conversion utilities based off of http://www.cs.rit.edu/~ncs/color/t_convert.html

    /**
     * Convert color hex string to rgb number array
     * @param {string} hexStr - hex string
     * @returns {number[]} rgb numbers
     */
    hexToRGB: function(hexStr) {
        var r, g, b;

        if (!colorutil.isValidRGB(hexStr)) {
            return false;
        }

        hexStr = hexStr.substring(1);

        r = parseInt(hexStr.substr(0, 2), 16);
        g = parseInt(hexStr.substr(2, 2), 16);
        b = parseInt(hexStr.substr(4, 2), 16);

        return [r, g, b];
    },

    /**
     * Convert rgb number to hex string
     * @param {number} r - red
     * @param {number} g - green
     * @param {number} b - blue
     * @returns {string|boolean} return false when supplied rgb number is not valid. otherwise, converted hex string
     */
    rgbToHEX: function(r, g, b) {
        var hexStr = '#' +
            colorutil.leadingZero(r.toString(16), 2) +
            colorutil.leadingZero(g.toString(16), 2) +
            colorutil.leadingZero(b.toString(16), 2);

        if (colorutil.isValidRGB(hexStr)) {
            return hexStr;
        }

        return false;
    },

    /**
     * Color name to hex.
     * @param {string} colorName color name
     * @returns {string} hex
     */
    colorNameToHex: function(colorName) {
        return colorMap[colorName.toLowerCase()] || colorName;
    }
};

tui.util.defineNamespace('tui.chart');
tui.chart.colorutil = colorutil;

module.exports = colorutil;

},{}],59:[function(require,module,exports){
/**
 * @fileoverview DOM Handler.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var aps = Array.prototype.slice;

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
     * @returns {Array} names
     * @private
     */
    _getClassNames: function(el) {
        var className, classNames;

        if (el.classList) {
            classNames = aps.call(el.classList);
        } else {
            className = el.className || '';
            classNames = className && tui.util.isString(className) ? className.split(' ') : [];
        }

        return classNames;
    },

    /**
     * Add css class to target element.
     * @memberOf module:domHandler
     * @param {HTMLElement} el target element
     * @param {string} newClass add class name
     */
    addClass: function(el, newClass) {
        var classNames, index;

        if (!el || !newClass) {
            return;
        }

        classNames = this._getClassNames(el);
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
        var classNames = this._getClassNames(el);
        var index = tui.util.inArray(findClass, classNames);

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
        var parent = el.parentNode,
            result;

        if (!parent) {
            result = null;
        } else if (this.hasClass(parent, className)) {
            result = parent;
        } else if (parent.nodeName === 'BODY' || this.hasClass(parent, lastClass)) {
            result = null;
        } else {
            result = this.findParentByClass(parent, className, lastClass);
        }

        return result;
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
        });
    }
};

module.exports = domHandler;

},{}],60:[function(require,module,exports){
/**
 * @fileoverview Event listener.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var bindHandlerMap = {};

/**
 * Event listener.
 * @module eventListener
 */
var eventListener = {
    /**
     * Add event listener for IE.
     * @memberOf module:eventListener
     * @param {HTMLElement} target target element
     * @param {string} type event type
     * @param {function} handler callback function
     * @param {?object} context context for callback
     * @private
     */
    _attachEvent: function(target, type, handler, context) {
        var bindHandler;

        if (context) {
            bindHandler = tui.util.bind(handler, context);
        } else {
            bindHandler = handler;
        }

        bindHandlerMap[type + handler] = bindHandler;
        target.attachEvent('on' + type, bindHandler);
    },

    /**
     * Add event listener for other browsers.
     * @memberOf module:eventListener
     * @param {HTMLElement} target - target element
     * @param {string} type - event type
     * @param {function} handler - handler
     * @param {object} [context] - context for handler
     * @private
     */
    _addEventListener: function(target, type, handler, context) {
        var bindHandler;

        if (context) {
            bindHandler = tui.util.bind(handler, context);
        } else {
            bindHandler = handler;
        }

        bindHandlerMap[type + handler] = bindHandler;
        target.addEventListener(type, bindHandler);
    },

    /**
     * Bind DOM event.
     * @memberOf module:eventListener
     * @memberOf module:eventListener
     * @param {HTMLElement} target target element
     * @param {string} type event type
     * @param {function} handler handler function
     * @param {object} [context] - context for handler
     * @private
     */
    _bindEvent: function(target, type, handler, context) {
        var bindEvent;

        if ('addEventListener' in target) {
            bindEvent = this._addEventListener;
        } else if ('attachEvent' in target) {
            bindEvent = this._attachEvent;
        }
        eventListener._bindEvent = bindEvent;

        bindEvent(target, type, handler, context);
    },

    /**
     * Bind DOM events.
     * @memberOf module:eventListener
     * @param {HTMLElement} target - target element
     * @param {string | object} types - type or map of type and handler
     * @param {function | object} [handler] - handler or context
     * @param {object} [context] - context
     */
    on: function(target, types, handler, context) {
        var handlerMap = {};
        if (tui.util.isString(types)) {
            handlerMap[types] = handler;
        } else {
            handlerMap = types;
            context = handler;
        }

        tui.util.forEach(handlerMap, function(_handler, type) {
            eventListener._bindEvent(target, type, _handler, context);
        });
    },

    /**
     * Remove event listener for IE.
     * @memberOf module:eventListener
     * @param {HTMLElement} target - target element
     * @param {string} type - event type
     * @param {function} handler - handler
     * @private
     */
    _detachEvent: function(target, type, handler) {
        if (bindHandlerMap[type + handler]) {
            target.detachEvent('on' + type, bindHandlerMap[type + handler]);
            delete bindHandlerMap[type + handler];
        }
    },

    /**
     * Add event listener for other browsers.
     * @memberOf module:eventListener
     * @param {HTMLElement} target - target element
     * @param {string} type - event type
     * @param {function} handler - handler
     * @private
     */
    _removeEventListener: function(target, type, handler) {
        target.removeEventListener(type, bindHandlerMap[type + handler]);
        delete bindHandlerMap[type + handler];
    },


    /**
     * Unbind DOM event.
     * @memberOf module:eventListener
     * @param {HTMLElement} target - target element
     * @param {string} type - event type
     * @param {function} handler - handler
     * @private
     */
    _unbindEvent: function(target, type, handler) {
        var unbindEvent;
        if ('removeEventListener' in target) {
            unbindEvent = eventListener._removeEventListener;
        } else if ('detachEvent' in target) {
            unbindEvent = eventListener._detachEvent;
        }
        eventListener._unbindEvent = unbindEvent;

        unbindEvent(target, type, handler);
    },

    /**
     * Unbind DOM events.
     * @memberOf module:eventListener
     * @param {HTMLElement} target - target element
     * @param {string | object} types - type or map of type and handler
     * @param {function} [handler] - handler
     */
    off: function(target, types, handler) {
        var handlerMap = {};
        if (tui.util.isString(types)) {
            handlerMap[types] = handler;
        } else {
            handlerMap = types;
        }

        tui.util.forEach(handlerMap, function(_handler, type) {
            eventListener._unbindEvent(target, type, _handler);
        });
    }
};

module.exports = eventListener;

},{}],61:[function(require,module,exports){
/**
 * @fileoverview Predicate.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const');

/**
 * predicate.
 * @module predicate
 */
var predicate = {
    /**
     * Whether bar chart or not.
     * @memberOf module:predicate
     * @param {string} chartType - type of chart
     * @returns {boolean}
     */
    isBarChart: function(chartType) {
        return chartType === chartConst.CHART_TYPE_BAR;
    },

    /**
     * Whether column chart or not.
     * @memberOf module:predicate
     * @param {string} chartType - type of chart
     * @returns {boolean}
     */
    isColumnChart: function(chartType) {
        return chartType === chartConst.CHART_TYPE_COLUMN;
    },

    /**
     * Whether bar type chart or not.
     * @memberOf module:predicate
     * @param {string} chartType - type of chart
     * @returns {boolean}
     */
    isBarTypeChart: function(chartType) {
        return predicate.isBarChart(chartType) || predicate.isColumnChart(chartType);
    },

    /**
     * Whether combo chart or not.
     * @memberOf module:predicate
     * @param {string} chartType - type of chart
     * @returns {boolean}
     */
    isComboChart: function(chartType) {
        return chartType === chartConst.CHART_TYPE_COMBO;
    },

    /**
     * Whether pie and donut combo chart or not.
     * @memberOf module:predicate
     * @param {string} chartType - type of chart
     * @param {Array.<string>} subChartTypes - types of chart
     * @returns {boolean}
     */
    isPieDonutComboChart: function(chartType, subChartTypes) {
        var isAllPieType = tui.util.all(subChartTypes, function(subChartType) {
            return predicate.isPieTypeChart(subChartType);
        });

        return predicate.isComboChart(chartType) && isAllPieType;
    },

    /**
     * Whether line chart or not.
     * @memberOf module:predicate
     * @param {string} chartType - type of chart
     * @returns {boolean}
     */
    isLineChart: function(chartType) {
        return chartType === chartConst.CHART_TYPE_LINE;
    },

    /**
     * Whether area chart or not.
     * @memberOf module:predicate
     * @param {string} chartType - type of chart
     * @returns {boolean}
     */
    isAreaChart: function(chartType) {
        return chartType === chartConst.CHART_TYPE_AREA;
    },

    /**
     * Whether line and area combo chart or not.
     * @memberOf module:predicate
     * @param {string} chartType - type of chart
     * @param {Array.<string>} subChartTypes - types of chart
     * @returns {boolean}
     */
    isLineAreaComboChart: function(chartType, subChartTypes) {
        var isAllLineType = tui.util.all(subChartTypes || [], function(subChartType) {
            return predicate.isLineChart(subChartType) || predicate.isAreaChart(subChartType);
        });

        return predicate.isComboChart(chartType) && isAllLineType;
    },

    /**
     * Whether line type chart or not.
     * @memberOf module:predicate
     * @param {string} chartType - type of chart
     * @param {Array.<string>} [subChartTypes] - types of chart
     * @returns {boolean}
     */
    isLineTypeChart: function(chartType, subChartTypes) {
        return predicate.isLineChart(chartType) || predicate.isAreaChart(chartType)
            || predicate.isLineAreaComboChart(chartType, subChartTypes);
    },

    /**
     * Whether bubble chart or not.
     * @memberOf module:predicate
     * @param {string} chartType - type of chart
     * @returns {boolean}
     */
    isBubbleChart: function(chartType) {
        return chartType === chartConst.CHART_TYPE_BUBBLE;
    },

    /**
     * Whether scatter chart or not.
     * @memberOf module:predicate
     * @param {string} chartType - chart type
     * @returns {boolean}
     */
    isScatterChart: function(chartType) {
        return chartType === chartConst.CHART_TYPE_SCATTER;
    },

    /**
     * Whether heatmap chart or not.
     * @memberOf module:predicate
     * @param {string} chartType - chart type
     * @returns {boolean}
     */
    isHeatmapChart: function(chartType) {
        return chartType === chartConst.CHART_TYPE_HEATMAP;
    },

    /**
     * Whether treemap chart or not.
     * @memberOf module:predicate
     * @param {string} chartType - chart type
     * @returns {boolean}
     */
    isTreemapChart: function(chartType) {
        return chartType === chartConst.CHART_TYPE_TREEMAP;
    },

    /**
     * Whether box type chart or not.
     * @memberOf module:predicate
     * @param {string} chartType - chart type
     * @returns {boolean}
     */
    isBoxTypeChart: function(chartType) {
        return predicate.isHeatmapChart(chartType) || predicate.isTreemapChart(chartType);
    },

    /**
     * Whether pie chart or not.
     * @memberOf module:predicate
     * @param {string} chartType - chart type
     * @returns {boolean}
     */
    isPieChart: function(chartType) {
        return chartType === chartConst.CHART_TYPE_PIE;
    },

    /**
     * Whether donut chart or not.
     * @memberOf module:predicate
     * @param {string} chartType -chart type
     * @returns {boolean}
     */
    isDonutChart: function(chartType) {
        return chartType === chartConst.CHART_TYPE_DONUT;
    },

    /**
     * Whether pie type chart or not.
     * @memberOf module:predicate
     * @param {string} chartType - chart type
     * @returns {boolean}
     */
    isPieTypeChart: function(chartType) {
        return predicate.isPieChart(chartType) || predicate.isDonutChart(chartType);
    },

    /**
     * Whether map chart or not.
     * @memberOf module:predicate
     * @param {string} chartType - type of chart
     * @returns {boolean}
     */
    isMapChart: function(chartType) {
        return chartType === chartConst.CHART_TYPE_MAP;
    },

    /**
     * Whether coordinate type chart or not.
     * @memberOf module:predicate
     * @param {string} chartType - chart type
     * @returns {boolean}
     */
    isCoordinateTypeChart: function(chartType) {
        return predicate.isBubbleChart(chartType) || predicate.isScatterChart(chartType);
    },

    /**
     * Whether allow rendering for minus point in area of series.
     * @memberOf module:predicate
     * @param {string} chartType - chart type
     * @returns {boolean}
     */
    allowMinusPointRender: function(chartType) {
        return predicate.isLineTypeChart(chartType) || predicate.isCoordinateTypeChart(chartType) ||
            predicate.isBoxTypeChart(chartType);
    },

    /**
     * Whether mouse position chart or not.
     * @memberOf module:predicate
     * @param {string} chartType - type of chart
     * @returns {boolean}
     */
    isMousePositionChart: function(chartType) {
        return predicate.isPieTypeChart(chartType) || predicate.isMapChart(chartType)
            || predicate.isCoordinateTypeChart(chartType);
    },

    /**
     * Whether align of label is outer or not.
     * @memberOf module:predicate
     * @param {string} align - align of legend
     * @returns {boolean}
     */
    isLabelAlignOuter: function(align) {
        return align === chartConst.LABEL_ALIGN_OUTER;
    },

    /**
     * Whether show label or not.
     * @param {{showLabel: ?boolean, showLegend: ?boolean}} options - options
     * @returns {boolean}
     */
    isShowLabel: function(options) {
        return options.showLabel || options.showLegend;
    },

    /**
     * Whether show outer label or not.
     * @param {{showLabel: ?boolean, showLegend: ?boolean, labelAlign: string}} options - options
     * @returns {*|boolean}
     */
    isShowOuterLabel: function(options) {
        return predicate.isShowLabel(options) && predicate.isLabelAlignOuter(options.labelAlign);
    },

    /**
     * Whether align of legend is left or not.
     * @memberOf module:predicate
     * @param {string} align - align of legend
     * @returns {boolean}
     */
    isLegendAlignLeft: function(align) {
        return align === chartConst.LEGEND_ALIGN_LEFT;
    },

    /**
     * Whether align of legend is top or not.
     * @memberOf module:predicate
     * @param {string} align - align of legend
     * @returns {boolean}
     */
    isLegendAlignTop: function(align) {
        return align === chartConst.LEGEND_ALIGN_TOP;
    },

    /**
     * Whether align of legend is bottom or not.
     * @memberOf module:predicate
     * @param {string} align - align of legend
     * @returns {boolean}
     */
    isLegendAlignBottom: function(align) {
        return align === chartConst.LEGEND_ALIGN_BOTTOM;
    },

    /**
     * Whether horizontal legend align or not.
     * @memberOf module:predicate
     * @param {string} align - align of legend
     * @returns {boolean}
     */
    isHorizontalLegend: function(align) {
        return predicate.isLegendAlignTop(align) || predicate.isLegendAlignBottom(align);
    },

    /**
     * Whether has width for vertical type legend or not.
     * @param {{align: string, visible: boolean}} legendOption - option for legend component
     * @returns {boolean}
     */
    hasVerticalLegendWidth: function(legendOption) {
        legendOption = legendOption || {};

        return !predicate.isHorizontalLegend(legendOption.align) && legendOption.visible;
    },

    /**
     * Whether allowed stackType option or not.
     * @memberOf module:predicate
     * @param {string} chartType - type of chart
     * @returns {boolean}
     */
    isAllowedStackOption: function(chartType) {
        return predicate.isBarChart(chartType) || predicate.isColumnChart(chartType)
            || predicate.isAreaChart(chartType);
    },

    /**
     * Whether normal stack type or not.
     * @memberOf module:predicate
     * @param {boolean} stackType - stackType option
     * @returns {boolean}
     */
    isNormalStack: function(stackType) {
        return stackType === chartConst.NORMAL_STACK_TYPE;
    },

    /**
     * Whether percent stack type or not.
     * @memberOf module:predicate
     * @param {boolean} stackType - stackType option
     * @returns {boolean}
     */
    isPercentStack: function(stackType) {
        return stackType === chartConst.PERCENT_STACK_TYPE;
    },

    /**
     * Whether valid stackType option or not.
     * @memberOf module:predicate
     * @param {boolean} stackType - stackType option
     * @returns {boolean}
     */
    isValidStackOption: function(stackType) {
        return stackType && (predicate.isNormalStack(stackType) || predicate.isPercentStack(stackType));
    },

    /**
     * Whether allow range data or not.
     * @memberOf module:predicate
     * @param {string} chartType - chart type
     * @returns {boolean}
     */
    isAllowRangeData: function(chartType) {
        return predicate.isBarTypeChart(chartType) || predicate.isAreaChart(chartType);
    },

    /**
     * Whether align of yAxis is center or not.
     * @memberOf module:predicate
     * @param {boolean} hasRightYAxis - whether has right yAxis.
     * @param {string} alignOption - align option of yAxis.
     * @returns {boolean} whether - align center or not.
     */
    isYAxisAlignCenter: function(hasRightYAxis, alignOption) {
        return !hasRightYAxis && (alignOption === chartConst.YAXIS_ALIGN_CENTER);
    },

    /**
     * Whether minus limit or not.
     * @memberOf module:predicate
     * @param {{min: number, max: number}} limit - limit
     * @returns {boolean}
     */
    isMinusLimit: function(limit) {
        return limit.min <= 0 && limit.max <= 0;
    },

    /**
     * Whether auto tick interval or not.
     * @param {string} [tickInterval] - tick interval option
     * @returns {boolean}
     */
    isAutoTickInterval: function(tickInterval) {
        return tickInterval === chartConst.TICK_INTERVAL_AUTO;
    },

    /**
     * Whether valid label interval or not.
     * @param {number} [labelInterval] - label interval option
     * @param {string} [tickInterval] - tick interval option
     * @returns {*|boolean}
     */
    isValidLabelInterval: function(labelInterval, tickInterval) {
        return labelInterval && labelInterval > 1 && !tickInterval;
    }
};

module.exports = predicate;

},{"../const":31}],62:[function(require,module,exports){
/**
 * @fileoverview Raw data handler.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const');

/**
 * Raw data Handler.
 * @module rawDataHandler
 */
var rawDataHandler = {
    /**
     * Pick stacks.
     * @param {Array.<{stack: string}>} seriesData - raw series data
     * @param {boolean} [divergingOption] - diverging option
     * @returns {Array.<string>} stacks
     */
    pickStacks: function(seriesData, divergingOption) {
        var stacks, uniqStacks, filteredStack;

        stacks = tui.util.map(seriesData, function(seriesDatum) {
            return seriesDatum.stack;
        });

        uniqStacks = tui.util.unique(stacks);

        if (divergingOption) {
            uniqStacks = uniqStacks.slice(0, 2);
        }

        filteredStack = tui.util.filter(uniqStacks, function(stack) {
            return !!stack;
        });

        if (filteredStack.length < uniqStacks.length) {
            filteredStack.push(chartConst.DEFAULT_STACK);
        }

        return filteredStack;
    },

    /**
     * Sort series data from stacks.
     * @param {Array.<{stack: ?string}>} seriesData series data
     * @param {Array.<string>} stacks stacks
     * @returns {Array}
     */
    sortSeriesData: function(seriesData, stacks) {
        var newSeriesData = [];

        tui.util.forEachArray(stacks, function(stack) {
            var filtered = tui.util.filter(seriesData, function(datum) {
                return (datum.stack || chartConst.DEFAULT_STACK) === stack;
            });
            newSeriesData = newSeriesData.concat(filtered);
        });

        return newSeriesData;
    },

    /**
     * Remove stack of series data.
     * @param {Array.<{stack: ?string}>} seriesData series data
     */
    removeSeriesStack: function(seriesData) {
        tui.util.forEachArray(seriesData, function(datum) {
            delete datum.stack;
        });
    },

    /**
     * Find char type from chart name.
     * @param {object.<string, string>} seriesAlias - alias map
     * @param {string} seriesName - series name
     * @returns {*}
     */
    findChartType: function(seriesAlias, seriesName) {
        var chartType;

        if (seriesAlias) {
            chartType = seriesAlias[seriesName];
        }

        return chartType || seriesName;
    },

    /**
     * Get chart type map.
     * @param {{series: (Array | object)}} rawData - raw data
     * @returns {object.<string, string>}
     */
    getChartTypeMap: function(rawData) {
        var self = this;
        var chartTypeMap = {};

        if (tui.util.isObject(rawData.series)) {
            tui.util.forEach(rawData.series, function(data, seriesName) {
                chartTypeMap[self.findChartType(rawData.seriesAlias, seriesName)] = true;
            });
        }

        return chartTypeMap;
    }
};

module.exports = rawDataHandler;

},{"../const":31}],63:[function(require,module,exports){
/**
 * @fileoverview Util for rendering.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

/*eslint no-magic-numbers: [1, {ignore: [-1, 0, 1, 2, 7, 8]}]*/

var dom = require('./domHandler'),
    chartConst = require('./../const');

var concat = Array.prototype.concat;

var browser = tui.util.browser,
    isIE7 = browser.msie && browser.version === 7,
    isOldBrowser = browser.msie && browser.version <= 8;

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
     * Make cssText for font.
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
        var div, span;
        if (!this.checkEl) {
            div = dom.create('DIV', 'tui-chart-size-check-element');
            span = dom.create('SPAN');
            div.appendChild(span);
            this.checkEl = div;
        } else {
            this.checkEl.style.cssText = '';
        }

        return this.checkEl;
    },

    /**
     * Make caching key.
     * @param {string} label labek
     * @param {{fontSize: number, fontFamily: string}} theme theme
     * @param {string} offsetType offset type (offsetWidth or offsetHeight)
     * @returns {string} key
     * @private
     */
    _makeCachingKey: function(label, theme, offsetType) {
        var keys = [label, offsetType];

        tui.util.forEach(theme, function(key, value) {
            keys.push(key + value);
        });

        return keys.join('-');
    },

    /**
     * Size cache.
     * @type {object}
     */
    sizeCache: {},

    /**
     * Add css style.
     * @param {HTMLElement} div div element
     * @param {{fontSize: number, fontFamily: string, cssText: string}} theme theme
     * @private
     */
    _addCssStyle: function(div, theme) {
        div.style.fontSize = (theme.fontSize || chartConst.DEFAULT_LABEL_FONT_SIZE) + 'px';

        if (theme.fontFamily) {
            div.style.fontFamily = theme.fontFamily;
        }

        if (theme.cssText) {
            div.style.cssText += theme.cssText;
        }
    },

    /**
     * Get rendered label size (width or height).
     * @memberOf module:renderUtil
     * @param {string | number} label label
     * @param {object} theme theme
     * @param {string} offsetType offset type (offsetWidth or offsetHeight)
     * @returns {number} size
     * @private
     */
    _getRenderedLabelSize: function(label, theme, offsetType) {
        var key, div, span, labelSize;

        theme = theme || {};

        label = tui.util.isExisty(label) ? String(label) : '';

        if (!label) {
            return 0;
        }

        key = this._makeCachingKey(label, theme, offsetType);
        labelSize = this.sizeCache[key];

        if (!labelSize) {
            div = this._createSizeCheckEl();
            span = div.firstChild;

            span.innerHTML = label;

            this._addCssStyle(div, theme);

            document.body.appendChild(div);
            labelSize = span[offsetType];
            document.body.removeChild(div);

            this.sizeCache[key] = labelSize;
        }

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
        var maxSize = 0,
            sizes;

        if (labels && labels.length) {
            sizes = tui.util.map(labels, function(label) {
                return iteratee(label, theme);
            });
            maxSize = tui.util.max(sizes);
        }

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
        var iteratee = tui.util.bind(this.getRenderedLabelWidth, this);
        var maxWidth = this._getRenderedLabelsMaxSize(labels, theme, iteratee);

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
        var iteratee = tui.util.bind(this.getRenderedLabelHeight, this);
        var maxHeight = this._getRenderedLabelsMaxSize(labels, theme, iteratee);

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

        if (!tui.util.isUndefined(position.top)) {
            el.style.top = position.top + 'px';
        }

        if (!tui.util.isUndefined(position.left)) {
            el.style.left = position.left + 'px';
        }

        if (!tui.util.isUndefined(position.right)) {
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
     * Expand dimension.
     * @param {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} bound series bound
     * @returns {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} expended bound
     */
    expandBound: function(bound) {
        var dimension = bound.dimension;
        var position = bound.position;

        return {
            dimension: {
                width: dimension.width + chartConst.SERIES_EXPAND_SIZE * 2,
                height: dimension.height + chartConst.SERIES_EXPAND_SIZE * 2
            },
            position: {
                left: position.left - chartConst.SERIES_EXPAND_SIZE,
                top: position.top - chartConst.SERIES_EXPAND_SIZE
            }
        };
    },

    /**
     * Make custom event name.
     * @param {string} prefix prefix
     * @param {string} value value
     * @param {string} suffix suffix
     * @returns {string} custom event name
     */
    makeCustomEventName: function(prefix, value, suffix) {
        return prefix + tui.util.properCase(value) + tui.util.properCase(suffix);
    },

    /**
     * Format value.
     * @param {number} value value
     * @param {Array.<function>} formatFunctions - functions for format
     * @param {string} chartType - type of chart
     * @param {string} areaType - type of area like yAxis, xAxis, series, circleLegend
     * @param {string} [valueType] - type of value
     * @returns {string} formatted value
     */
    formatValue: function(value, formatFunctions, chartType, areaType, valueType) {
        var fns = [String(value)].concat(formatFunctions || []);

        valueType = valueType || 'value';

        return tui.util.reduce(fns, function(stored, fn) {
            return fn(stored, chartType, areaType, valueType);
        });
    },

    /**
     * Format values.
     * @param {Array.<number>} values values
     * @param {Array.<function>} formatFunctions functions for format
     * @param {string} chartType - type of chart
     * @param {string} areaType - type of area like yAxis, xAxis, series, circleLegend
     * @param {string} valueType - type of value
     * @returns {Array.<string>}
     */
    formatValues: function(values, formatFunctions, chartType, areaType, valueType) {
        var formatedValues;

        if (!formatFunctions || !formatFunctions.length) {
            return values;
        }
        formatedValues = tui.util.map(values, function(label) {
            return renderUtil.formatValue(label, formatFunctions, chartType, areaType, valueType);
        });

        return formatedValues;
    },

    /**
     * Cancel animation
     * @param {{id: number}} animation animaion object
     */
    cancelAnimation: function(animation) {
        if (animation && animation.id) {
            cancelAnimationFrame(animation.id);
            delete animation.id;
        }
    },

    /**
     * Start animation.
     * @param {number} animationTime - animation time
     * @param {function} onAnimation - animation callback function
     * @param {function} onCompleted - completed callback function
     * @returns {{id: number}} requestAnimationFrame id
     */
    startAnimation: function(animationTime, onAnimation, onCompleted) {
        var animation = {},
            startTime;

        /**
         * Animate.
         */
        function animate() {
            var diffTime = (new Date()).getTime() - startTime,
                ratio = Math.min((diffTime / animationTime), 1);

            onAnimation(ratio);

            if (ratio === 1) {
                delete animation.id;
                if (onCompleted) {
                    onCompleted();
                }
            } else {
                animation.id = requestAnimationFrame(animate);
            }
        }

        startTime = (new Date()).getTime();
        animation.id = requestAnimationFrame(animate);

        return animation;
    },

    /**
     * Whether IE7 or not.
     * @returns {boolean} result boolean
     */
    isIE7: function() {
        return isIE7;
    },

    /**
     * Whether oldBrowser or not.
     * @memberOf module:renderUtil
     * @returns {boolean} result boolean
     */
    isOldBrowser: function() {
        return isOldBrowser;
    },

    /**
     * Format to zero fill.
     * @param {string} value target value
     * @param {number} len length of result
     * @returns {string} formatted value
     * @private
     */
    formatToZeroFill: function(value, len) {
        var zero = '0';

        value = String(value);

        if (value.length >= len) {
            return value;
        }

        while (value.length < len) {
            value = zero + value;
        }

        return value;
    },

    /**
     * Format to Decimal.
     * @param {string} value target value
     * @param {number} len length of under decimal point
     * @returns {string} formatted value
     */
    formatToDecimal: function(value, len) {
        var pow;

        if (len === 0) {
            return Math.round(value);
        }

        pow = Math.pow(10, len);
        value = Math.round(value * pow) / pow;
        value = parseFloat(value).toFixed(len);

        return value;
    },

    /**
     * Format to Comma.
     * @param {string} value target value
     * @returns {string} formatted value
     * @private
     */
    formatToComma: function(value) {
        var comma = ',',
            underPointValue = '',
            betweenLen = 3,
            orgValue = value,
            sign, values, lastIndex, formattedValue;

        value = String(value);
        sign = value.indexOf('-') > -1 ? '-' : '';

        if (value.indexOf('.') > -1) {
            values = value.split('.');
            value = String(Math.abs(values[0]));
            underPointValue = '.' + values[1];
        } else {
            value = String(Math.abs(value));
        }

        if (value.length <= betweenLen) {
            formattedValue = orgValue;
        } else {
            values = (value).split('').reverse();
            lastIndex = values.length - 1;
            values = tui.util.map(values, function(char, index) {
                var result = [char];
                if (index < lastIndex && (index + 1) % betweenLen === 0) {
                    result.push(comma);
                }

                return result;
            });
            formattedValue = sign + concat.apply([], values).reverse().join('') + underPointValue;
        }

        return formattedValue;
    },

    /**
     * Make cssText from map.
     * @param {object} cssMap - css map
     * @returns {string}
     */
    makeCssTextFromMap: function(cssMap) {
        return tui.util.map(cssMap, function(value, name) {
            return renderUtil.concatStr(name, ':', value);
        }).join(';');
    }
};

/**
 * Set css opacity.
 * @param {HTMLElement | Array.<HTMLElement>} elements - elements
 * @param {function} iteratee - iteratee
 */
function setOpacity(elements, iteratee) {
    elements = tui.util.isArray(elements) ? elements : [elements];
    tui.util.forEachArray(elements, iteratee);
}

/**
 * Make filter opacity css string.
 * @param {number} opacity - opacity
 * @returns {string}
 */
function makeCssFilterOpacityString(opacity) {
    return 'alpha(opacity=' + (opacity * chartConst.OLD_BROWSER_OPACITY_100) + ')';
}

if (isOldBrowser) {
    /**
     * Make opacity css text for old browser(IE7, IE8).
     * @param {number} opacity - opacity
     * @returns {string}
     */
    renderUtil.makeOpacityCssText = function(opacity) {
        return ';filter:' + makeCssFilterOpacityString(opacity);
    };

    /**
     * Set css opacity for old browser(IE7, IE8).
     * @param {HTMLElement | Array.<HTMLElement>} elements - elements
     * @param {number} opacity - opacity
     */
    renderUtil.setOpacity = function(elements, opacity) {
        var filter = makeCssFilterOpacityString(opacity);
        setOpacity(elements, function(element) {
            element.style.filter = filter;
        });
    };
} else {
    /**
     * Make opacity css text for browser supporting opacity property of CSS3.
     * @param {number} opacity - opacity
     * @returns {string}
     */
    renderUtil.makeOpacityCssText = function(opacity) {
        return ';opacity:' + opacity;
    };

    /**
     * Set css opacity for browser supporting opacity property of CSS3.
     * @param {HTMLElement | Array.<HTMLElement>} elements - elements
     * @param {number} opacity - opacity
     */
    renderUtil.setOpacity = function(elements, opacity) {
        setOpacity(elements, function(element) {
            element.style.opacity = opacity;
        });
    };
}

tui.util.defineNamespace('tui.chart');
tui.chart.renderUtil = renderUtil;

module.exports = renderUtil;

},{"./../const":31,"./domHandler":59}],64:[function(require,module,exports){
/**
 * @fileoverview This is template maker.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
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
    template: function(html) {
        return function(data) {
            var result = html;
            tui.util.forEach(data, function(value, key) {
                var regExp = new RegExp('{{\\s*' + key + '\\s*}}', 'g');
                result = result.replace(regExp, String(value).replace('$0', '<span>$</span>0'));
            });

            return result;
        };
    }
};

},{}],65:[function(require,module,exports){
/**
 * @fileoverview UserEventListener is listener of user event.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var UserEventListener = tui.util.defineClass(/** @lends UserEventListener.prototype */ {
    /**
     * Register user event.
     * @param {string} eventName event name
     * @param {function} func event callback
     */
    register: function(eventName, func) {
        this.on(eventName, func);
    }
});

tui.util.CustomEvents.mixin(UserEventListener);

module.exports = UserEventListener;

},{}],66:[function(require,module,exports){
/**
 * @fileoverview  Circle legend component render a legend in the form of overlapping circles
 *                  by representative radius values.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const');
var dom = require('../helpers/domHandler');
var renderUtil = require('../helpers/renderUtil');
var pluginFactory = require('../factories/pluginFactory');
var legendTemplate = require('./../legends/legendTemplate');

var CircleLegend = tui.util.defineClass(/** @lends CircleLegend.prototype */ {
    /**
     * css className of circle legend
     * @type {string}
     */
    className: 'tui-chart-circle-legend-area',
    /**
     * ratios for rendering circle
     * @type {Array.<number>}
     */
    circleRatios: [1, 0.5, 0.25],
    /**
     * Circle legend component render a legend in the form of overlapping circles by representative radius values.
     * @constructs CircleLegend
     * @param {object} params parameters
     *      @param {?string} params.libType - library type for graph rendering
     *      @param {string} params.chartType - chart type
     *      @param {DataProcessor} params.dataProcessor - DataProcessor
     *      @param {BoundsMaker} params.boundsMaker - BoundsMaker
     *      @param {string} params.baseFontFamily - base fontFamily of chart
     */
    init: function(params) {
        var libType = params.libType || chartConst.DEFAULT_PLUGIN;

        /**
         * chart type
         * @type {string}
         */
        this.chartType = params.chartType;

        /**
         * data processor
         * @type {DataProcessor}
         */
        this.dataProcessor = params.dataProcessor;

        /**
         * bounds maker
         * @type {BoundsMaker}
         */
        this.boundsMaker = params.boundsMaker;

        /**
         * theme for label of circle legend area
         * @type {{fontSize: number, fontFamily: *}}
         */
        this.labelTheme = {
            fontSize: chartConst.CIRCLE_LEGEND_LABEL_FONT_SIZE,
            fontFamily: params.baseFontFamily
        };

        /**
         * Graph renderer
         * @type {object}
         */
        this.graphRenderer = pluginFactory.get(libType, 'circleLegend');
    },

    /**
     * Format label
     * @param {number} label - label
     * @param {number} decimalLength - decimal length
     * @returns {string}
     * @private
     */
    _formatLabel: function(label, decimalLength) {
        var formatFunctions = this.dataProcessor.getFormatFunctions();

        if (decimalLength === 0) {
            label = String(parseInt(label, 10));
        } else {
            label = String(label);
            label = renderUtil.formatToDecimal(label, decimalLength);
        }

        return renderUtil.formatValue(label, formatFunctions, this.chartType, 'circleLegend', 'r');
    },

    /**
     * Make label html.
     * @returns {string}
     * @private
     */
    _makeLabelHtml: function() {
        var self = this;
        var boundsMaker = this.boundsMaker;
        var dimension = boundsMaker.getDimension('circleLegend');
        var halfWidth = dimension.width / 2;
        var maxRadius = boundsMaker.getMaxRadiusForBubbleChart();
        var maxValueRadius = this.dataProcessor.getMaxValue(this.chartType, 'r');
        var decimalLength = tui.util.getDecimalLength(maxValueRadius);
        var labelHeight = renderUtil.getRenderedLabelHeight(maxValueRadius, this.labelTheme);

        return tui.util.map(this.circleRatios, function(ratio) {
            var diameter = maxRadius * ratio * 2;
            var label = self._formatLabel(maxValueRadius * ratio, decimalLength);
            var labelWidth = renderUtil.getRenderedLabelWidth(label, self.labelTheme);

            return legendTemplate.tplCircleLegendLabel({
                left: halfWidth - (labelWidth / 2),
                top: dimension.height - diameter - labelHeight,
                label: label
            });
        }).join('');
    },

    /**
     * Render label area.
     * @private
     */
    _renderLabelArea: function() {
        var labelContainer = dom.create('DIV', 'tui-chart-circle-legend-label-area');

        labelContainer.innerHTML = this._makeLabelHtml();
        this.container.appendChild(labelContainer);
    },

    /**
     * Render for circle legend area.
     * @private
     */
    _render: function() {
        var circleContainer = dom.create('DIV', 'tui-chart-circle-area');
        var boundsMaker = this.boundsMaker;
        var bound = boundsMaker.getBound('circleLegend');
        var maxRadius = boundsMaker.getMaxRadiusForBubbleChart();

        this.container.appendChild(circleContainer);

        this.graphRenderer.render(circleContainer, bound.dimension, maxRadius, this.circleRatios);

        this._renderLabelArea();
        renderUtil.renderPosition(this.container, bound.position);
    },

    /**
     * Render.
     * @returns {HTMLElement}
     */
    render: function() {
        var container = dom.create('DIV', this.className);

        this.container = container;
        this._render();

        return container;
    },

    /**
     * Rerender.
     */
    rerender: function() {
        this.container.innerHTML = '';
        this._render();
    },

    /**
     * Resize.
     */
    resize: function() {
        this.rerender();
    },

    /**
     * Get max width of label for CircleLegend.
     * @returns {number}
     * @private
     */
    _getCircleLegendLabelMaxWidth: function() {
        var maxLabel = this.dataProcessor.getFormattedMaxValue(this.chartType, 'circleLegend', 'r');
        var maxLabelWidth = renderUtil.getRenderedLabelWidth(maxLabel, {
            fontSize: this.labelTheme.fontSize,
            fontFamily: this.labelTheme.fontFamily
        });

        return maxLabelWidth;
    },

    /**
     * Get circle legend width.
     * @returns {number}
     * @private
     */
    _getCircleLegendWidth: function() {
        var maxRadius = this.boundsMaker.getMinimumPixelStepForAxis();
        var maxLabelWidth = this._getCircleLegendLabelMaxWidth();

        return Math.max((maxRadius * 2), maxLabelWidth) + chartConst.CIRCLE_LEGEND_PADDING;
    },

    /**
     * Register dimension of circle legend.
     * @private
     */
    registerCircleLegendDimension: function() {
        var circleLegendWidth = this._getCircleLegendWidth();
        var legendWidth = this.boundsMaker.getDimension('calculationLegend').width || chartConst.MIN_LEGEND_WIDTH;

        circleLegendWidth = Math.min(circleLegendWidth, legendWidth);

        this.boundsMaker.registerBaseDimension('circleLegend', {
            width: circleLegendWidth,
            height: circleLegendWidth
        });
    }
});

module.exports = CircleLegend;

},{"../const":31,"../factories/pluginFactory":52,"../helpers/domHandler":59,"../helpers/renderUtil":63,"./../legends/legendTemplate":70}],67:[function(require,module,exports){
/**
 * @fileoverview  Legend component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var LegendModel = require('./legendModel'),
    LegendDimensionModel = require('./legendDimensionModel'),
    chartConst = require('../const'),
    dom = require('../helpers/domHandler'),
    predicate = require('../helpers/predicate'),
    eventListener = require('../helpers/eventListener'),
    renderUtil = require('../helpers/renderUtil'),
    legendTemplate = require('./../legends/legendTemplate');

var Legend = tui.util.defineClass(/** @lends Legend.prototype */ {
    /**
     * Legend component.
     * @constructs Legend
     * @param {object} params parameters
     *      @param {object} params.theme axis theme
     *      @param {?Array.<string>} params.chartTypes chart types
     *      @param {string} params.chart type
     */
    init: function(params) {
        var legendData;

        /**
         * legend theme
         * @type {Object}
         */
        this.theme = params.theme;

        /**
         * options
         * @type {Object}
         */
        this.options = params.options || {};

        /**
         * chart type
         * @type {string}
         */
        this.chartType = params.chartType;

        /**
         * series names
         * @type {?Array.<string>}
         */
        this.seriesNames = params.seriesNames || [this.chartType];

        /**
         * user event object
         */
        this.userEvent = params.userEvent;

        /**
         * Legend view className
         */
        this.className = 'tui-chart-legend-area';

        /**
         * checked indexes
         * @type {Array}
         */
        this.checkedIndexes = [];

        /**
         * bounds maker
         * @type {BoundsMaker}
         */
        this.boundsMaker = params.boundsMaker;

        this.dataProcessor = params.dataProcessor;

        legendData = params.dataProcessor.getLegendData();
        /**
         * legend model
         */
        this.legendModel = new LegendModel({
            theme: this.theme,
            labels: params.dataProcessor.getLegendLabels(),
            legendData: legendData,
            seriesNames: this.seriesNames,
            chartType: this.chartType
        });

        this.dimensionModel = new LegendDimensionModel({
            legendLabels: tui.util.pluck(legendData, 'label'),
            chartType: this.chartType,
            options: this.options,
            theme: this.theme
        });
    },

    /**
     * Register legend dimension.
     */
    registerDimension: function() {
        var chartWidth = this.boundsMaker.getDimension('chart').width;
        var legendDimension = this.dimensionModel.makeDimension(chartWidth);

        this.boundsMaker.registerBaseDimension('legend', legendDimension);

        if (predicate.hasVerticalLegendWidth(this.options)) {
            this.boundsMaker.registerBaseDimension('calculationLegend', {
                width: legendDimension.width
            });
        }
    },

    /**
     * Render legend area.
     * @param {HTMLElement} legendContainer legend container
     * @private
     */
    _renderLegendArea: function(legendContainer) {
        legendContainer.innerHTML = this._makeLegendHtml(this.legendModel.getData());
        renderUtil.renderPosition(legendContainer, this.boundsMaker.getPosition('legend'));
        legendContainer.style.cssText += ';' + renderUtil.makeFontCssText(this.theme.label);
    },

    /**
     * Render legend component.
     * @returns {HTMLElement} legend element
     */
    render: function() {
        var container = dom.create('DIV', this.className);

        this.legendContainer = container;

        if (predicate.isHorizontalLegend(this.options.align)) {
            dom.addClass(container, 'horizontal');
        }

        this._renderLegendArea(container);
        this._attachEvent(container);

        return container;
    },

    /**
     * Rerender.
     */
    rerender: function() {
        this._renderLegendArea(this.legendContainer);
    },

    /**
     * Resize legend component.
     */
    resize: function() {
        this.rerender();
    },

    /**
     * Make cssText of legend rect.
     * @param {{
     *      chartType: string,
     *      theme: {color: string, borderColor: ?string, singleColor: ?string}
     * }} legendDatum legend datum
     * @param {number} baseMarginTop base margin-top
     * @returns {string} cssText of legend rect
     * @private
     */
    _makeLegendRectCssText: function(legendDatum, baseMarginTop) {
        var theme = legendDatum.theme,
            borderCssText = theme.borderColor ? renderUtil.concatStr(';border:1px solid ', theme.borderColor) : '',
            rectMargin, marginTop;
        if (legendDatum.chartType === 'line') {
            marginTop = baseMarginTop + chartConst.LINE_MARGIN_TOP;
        } else {
            marginTop = baseMarginTop;
        }

        rectMargin = renderUtil.concatStr(';margin-top:', marginTop, 'px');

        return renderUtil.concatStr('background-color:', theme.singleColor || theme.color, borderCssText, rectMargin);
    },


    /**
     * Make labels width.
     * @param {Array.<{chartType: ?string, label: string}>} legendData legend data
     * @returns {Array.<number>} labels width
     * @private
     */
    _makeLabelsWidth: function(legendData) {
        var self = this;

        return tui.util.map(legendData, function(item) {
            var labelWidth = renderUtil.getRenderedLabelWidth(item.label, self.theme.label);

            return labelWidth + chartConst.LEGEND_AREA_PADDING;
        });
    },

    /**
     * Make legend html.
     * @param {Array.<{chartType: ?string, label: string}>} legendData legend data
     * @returns {string} legend html
     * @private
     */
    _makeLegendHtml: function(legendData) {
        var self = this;
        var template = legendTemplate.tplLegend;
        var checkBoxTemplate = legendTemplate.tplCheckbox;
        var labelsWidth = this._makeLabelsWidth(legendData);
        var labelHeight = renderUtil.getRenderedLabelHeight(legendData[0].label, legendData[0].theme);
        var isHorizontalLegend = predicate.isHorizontalLegend(this.options.align);
        var height = labelHeight + (chartConst.LABEL_PADDING_TOP * 2);
        var baseMarginTop = parseInt((height - chartConst.LEGEND_RECT_WIDTH) / 2, 10) - 1;
        var html = tui.util.map(legendData, function(legendDatum, index) {
            var rectCssText = self._makeLegendRectCssText(legendDatum, baseMarginTop);
            var checkbox = self.options.showCheckbox === false ? '' : checkBoxTemplate({
                index: index,
                checked: self.legendModel.isCheckedIndex(index) ? ' checked' : ''
            });
            var data = {
                rectCssText: rectCssText,
                height: height,
                labelHeight: labelHeight,
                unselected: self.legendModel.isUnselectedIndex(index) ? ' unselected' : '',
                labelWidth: isHorizontalLegend ? ';width:' + labelsWidth[index] + 'px' : '',
                iconType: legendDatum.chartType || 'rect',
                label: legendDatum.label,
                checkbox: checkbox,
                index: index
            };

            return template(data);
        }).join('');

        return html;
    },

    /**
     * Find legend element.
     * @param {HTMLElement} elTarget target element
     * @returns {HTMLElement} legend element
     * @private
     */
    _findLegendLabelElement: function(elTarget) {
        var legendContainer;

        if (dom.hasClass(elTarget, chartConst.CLASS_NAME_LEGEND_LABEL)) {
            legendContainer = elTarget;
        } else {
            legendContainer = dom.findParentByClass(elTarget, chartConst.CLASS_NAME_LEGEND_LABEL);
        }

        return legendContainer;
    },

    /**
     * Fire legend checkbox event.
     * @private
     */
    _fireLegendCheckboxEvent: function() {
        this.fire('changeCheckedLegends', this.legendModel.getCheckedIndexes());
    },

    /**
     * Fire legend event.
     * @param {{chartType: string, index: number}} data data
     * @private
     */
    _fireLegendSelectionEvent: function(data) {
        var self = this;
        var seriesNames = this.seriesNames;
        var index = this.legendModel.getSelectedIndex();
        var legendIndex = !tui.util.isNull(index) ? data.seriesIndex : index;

        tui.util.forEachArray(seriesNames, function(seriesName) {
            var chartType = self.dataProcessor.findChartType(seriesName);
            self.fire(renderUtil.makeCustomEventName('select', chartType, 'legend'), data.chartType, legendIndex);
        });
    },

    /**
     * Fire user event.
     * @param {{label: string, chartType: string, index: number}} data data
     * @private
     */
    _fireUserEvent: function(data) {
        this.userEvent.fire('selectLegend', {
            legend: data.label,
            chartType: data.chartType,
            index: data.index
        });
    },

    /**
     * Select legend.
     * @param {number} index index
     * @private
     */
    _selectLegend: function(index) {
        var data = this.legendModel.getDatum(index);

        this.legendModel.toggleSelectedIndex(index);

        if (!tui.util.isNull(this.legendModel.getSelectedIndex()) && !this.legendModel.isCheckedSelectedIndex()) {
            this.legendModel.checkSelectedIndex();
            this._fireLegendCheckboxEvent();
        }

        this._renderLegendArea(this.legendContainer);

        this._fireLegendSelectionEvent(data);
        this._fireUserEvent(data);
    },

    /**
     * Get checked indexes.
     * @returns {Array} checked indexes
     * @private
     */
    _getCheckedIndexes: function() {
        var checkedIndexes = [];

        tui.util.forEachArray(this.legendContainer.getElementsByTagName('input'), function(checkbox, index) {
            if (checkbox.checked) {
                checkedIndexes.push(index);
            }
        });

        return checkedIndexes;
    },

    /**
     * Check legend.
     * @private
     */
    _checkLegend: function() {
        var checkedIndexes = this._getCheckedIndexes();
        var checkedCount = checkedIndexes.length;
        var isPieTypeCharts = tui.util.all(this.seriesNames, predicate.isPieTypeChart);
        var data;

        if ((isPieTypeCharts && checkedCount === 1) || checkedCount === 0) {
            this._renderLegendArea(this.legendContainer);
        } else {
            this.legendModel.updateCheckedData(checkedIndexes);

            data = this.legendModel.getSelectedDatum();

            if (!this.legendModel.isCheckedSelectedIndex()) {
                this.legendModel.updateSelectedIndex(null);
            }

            this._renderLegendArea(this.legendContainer);

            this._fireLegendCheckboxEvent();

            if (data) {
                this._fireLegendSelectionEvent(data, true);
            }
        }
    },

    /**
     * On click event handler.
     * @param {MouseEvent} e mouse event
     * @private
     */
    _onClick: function(e) {
        var elTarget = e.target || e.srcElement,
            legendContainer, index;

        if (dom.hasClass(elTarget, chartConst.CLASS_NAME_LEGEND_CHECKBOX)) {
            this._checkLegend();

            return;
        }

        legendContainer = this._findLegendLabelElement(elTarget);

        if (!legendContainer) {
            return;
        }

        index = parseInt(legendContainer.getAttribute('data-index'), 10);
        this._selectLegend(index);
    },

    /**
     * Attach browser event.
     * @param {HTMLElement} target target element
     * @private
     */
    _attachEvent: function(target) {
        eventListener.on(target, 'click', this._onClick, this);
    }
});

tui.util.CustomEvents.mixin(Legend);

module.exports = Legend;

},{"../const":31,"../helpers/domHandler":59,"../helpers/eventListener":60,"../helpers/predicate":61,"../helpers/renderUtil":63,"./../legends/legendTemplate":70,"./legendDimensionModel":68,"./legendModel":69}],68:[function(require,module,exports){
/**
 * @fileoverview LegendDimensionModel is model for calculating dimension of legend.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const');
var predicate = require('../helpers/predicate');
var renderUtil = require('../helpers/renderUtil');

var LegendDimensionModel = tui.util.defineClass(/** @lends LegendDimensionModel.prototype */ {
    /**
     * LegendDimensionModel is model for calculating dimension of legend.
     * @constructs LegendDimensionModel
     * @param {object} params parameters
     *      @param {string} params.chartType - type of chart
     *      @param {object} params.options - legend options
     *      @param {object} params.theme - legend theme
     *      @param {Array.<string | number>} params.legendLabels - legend labels
     */
    init: function(params) {
        this.chartType = params.chartType;

        this.options = params.options;

        this.theme = params.theme;

        this.legendLabels = params.legendLabels;

        this.legendCheckboxWidth = this.options.showCheckbox === false ? 0 : chartConst.LEGEND_CHECKBOX_WIDTH;
    },

    /**
     * Make legend width.
     * @param {number} labelWidth label width
     * @returns {number}
     * @private
     */
    _makeLegendWidth: function(labelWidth) {
        return labelWidth + this.legendCheckboxWidth + chartConst.LEGEND_RECT_WIDTH +
            chartConst.LEGEND_LABEL_LEFT_PADDING + chartConst.LEGEND_AREA_PADDING;
    },

    /**
     * Calculate sum of legends width.
     * @param {Array.<string>} labels legend labels
     * @param {{fontSize: number, fontFamily: number}} labelTheme legend label theme
     * @returns {number}
     * @private
     */
    _calculateLegendsWidthSum: function(labels, labelTheme) {
        var self = this;

        return tui.util.sum(tui.util.map(labels, function(label) {
            return self._makeLegendWidth(renderUtil.getRenderedLabelWidth(label, labelTheme));
        }));
    },

    /**
     * Divide legend labels.
     * @param {Array.<string>} labels legend labels
     * @param {number} count division count
     * @returns {Array.<Array.<string>>}
     * @private
     */
    _divideLegendLabels: function(labels, count) {
        var limitCount = Math.round(labels.length / count),
            results = [],
            temp = [];

        tui.util.forEachArray(labels, function(label) {
            if (temp.length < limitCount) {
                temp.push(label);
            } else {
                results.push(temp);
                temp = [label];
            }
        });

        if (temp.length) {
            results.push(temp);
        }

        return results;
    },

    /**
     * Get max line width.
     * @param {Array.<string>} dividedLabels - divided labels
     * @param {{fontFamily: ?string, fontSize: ?string}} labelTheme - label theme
     * @returns {number}
     * @private
     */
    _getMaxLineWidth: function(dividedLabels, labelTheme) {
        var self = this;
        var lineWidths = tui.util.map(dividedLabels, function(_labels) {
            return self._calculateLegendsWidthSum(_labels, labelTheme);
        });

        return tui.util.max(lineWidths);
    },

    /**
     * Make division labels and max line width.
     * @param {Array.<string>} labels legend labels
     * @param {number} chartWidth chart width
     * @param {{fontSize: number, fontFamily: number}} labelTheme legend label theme
     * @returns {{dividedLabels: Array.<Array.<string>>, maxLineWidth: number}}
     * @private
     */
    _makeDividedLabelsAndMaxLineWidth: function(labels, chartWidth, labelTheme) {
        var divideCount = 1,
            maxLineWidth = 0,
            prevMaxWidth = 0,
            dividedLabels, prevLabels;

        do {
            dividedLabels = this._divideLegendLabels(labels, divideCount);
            maxLineWidth = this._getMaxLineWidth(dividedLabels, labelTheme);

            if (prevMaxWidth === maxLineWidth) {
                dividedLabels = prevLabels;
                break;
            }

            prevMaxWidth = maxLineWidth;
            prevLabels = dividedLabels;
            divideCount += 1;
        } while (maxLineWidth >= chartWidth);

        return {
            dividedLabels: dividedLabels,
            maxLineWidth: maxLineWidth
        };
    },

    /**
     * Calculate height of horizontal legend.
     * @param {Array.<Array.<string>>} dividedLabels divided labels
     * @param {{fontSize: number, fontFamily: number}} labelTheme legend label theme
     * @returns {number}
     * @private
     */
    _calculateHorizontalLegendHeight: function(dividedLabels, labelTheme) {
        return tui.util.sum(tui.util.map(dividedLabels, function(labels) {
            return renderUtil.getRenderedLabelsMaxHeight(labels, labelTheme);
        }));
    },

    /**
     * Make dimension of horizontal legend.
     * @param {number} chartWidth chart width
     * @returns {{width: number, height: (number)}}
     * @private
     */
    _makeHorizontalDimension: function(chartWidth) {
        var labelTheme = this.theme.label,
            labelsAndMaxWidth = this._makeDividedLabelsAndMaxLineWidth(this.legendLabels, chartWidth, labelTheme),
            horizontalLegendHeight = this._calculateHorizontalLegendHeight(labelsAndMaxWidth.dividedLabels, labelTheme),
            legendHeight = horizontalLegendHeight + (chartConst.LEGEND_AREA_PADDING * 2);

        return {
            width: Math.max(labelsAndMaxWidth.maxLineWidth, chartConst.MIN_LEGEND_WIDTH),
            height: legendHeight
        };
    },

    /**
     * Make dimension of vertical legend.
     * @returns {{width: (number)}}
     * @private
     */
    _makeVerticalDimension: function() {
        var maxLabelWidth = renderUtil.getRenderedLabelsMaxWidth(this.legendLabels, this.theme.label);
        var legendWidth = this._makeLegendWidth(maxLabelWidth);

        return {
            width: legendWidth,
            height: 0
        };
    },

    /**
     * Make legend dimension.
     * @param {number} chartWidth chart width
     * @returns {{width: number, height: number}}
     */
    makeDimension: function(chartWidth) {
        var dimension = {};

        if (!this.options.visible) {
            dimension.width = 0;
        } else if (predicate.isHorizontalLegend(this.options.align)) {
            dimension = this._makeHorizontalDimension(chartWidth);
        } else {
            dimension = this._makeVerticalDimension();
        }

        return dimension;
    }
});

module.exports = LegendDimensionModel;

},{"../const":31,"../helpers/predicate":61,"../helpers/renderUtil":63}],69:[function(require,module,exports){
/**
 * @fileoverview LegendModel is legend model.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var defaultTheme = require('../themes/defaultTheme');

var concat = Array.prototype.concat;

var LegendModel = tui.util.defineClass(/** @lends LegendModel.prototype */ {
    /**
     * LegendModel is legend model.
     * @constructs LegendModel
     * @param {object} params parameters
     *      @param {number} params.labels legend labels
     *      @param {object} params.bound axis bound
     *      @param {object} params.theme axis theme
     */
    init: function(params) {
        /**
         * legend theme
         * @type {Object}
         */
        this.theme = params.theme;

        /**
         * legend labels
         * @type {Array.<string> | {column: ?Array.<string>, line: ?Array.<string>}}
         */
        this.labels = params.labels;

        /**
         * label infos
         * @type {Array.<{chartType: string, label: string, index: number}>}
         */
        this.legendData = params.legendData;

        /**
         * chart types
         * @type {?Array.<string>}
         */
        this.seriesNames = params.seriesNames || [];

        /**
         * chart type
         * @type {string}
         */
        this.chartType = params.chartType;

        /**
         * Legend data
         * @type {?Array}
         */
        this.data = null;

        /**
         * Selected legend index.
         * @type {?number}
         */
        this.selectedIndex = null;

        /**
         * sending data to series
         * @type {object}
         */
        this.checkedIndexesMap = {};

        /**
         * checked indexes
         * @type {Array}
         */
        this.checkedWholeIndexes = [];

        this._initCheckedIndexes();
        this._setData();
    },

    /**
     * Initialize checked data.
     * @private
     */
    _initCheckedIndexes: function() {
        var checkedWholeIndexes = [];
        tui.util.forEachArray(this.legendData, function(legendDatum, index) {
            checkedWholeIndexes[index] = true;
        });
        this.checkedWholeIndexes = checkedWholeIndexes;
    },

    /**
     * Make label info that applied theme.
     * @param {Array.<object>} legendData legend data
     * @param {{colors: Array.<number>, singleColor: ?string, bordercolor: ?string}} theme legend theme
     * @param {Array.<boolean>} checkedIndexes checked indexes
     * @returns {Array.<object>} labels
     * @private
     */
    _makeLabelInfoAppliedTheme: function(legendData, theme, checkedIndexes) {
        var seriesIndex = 0;

        return tui.util.map(legendData, function(datum, index) {
            var itemTheme = {
                color: theme.colors[index]
            };

            if (theme.singleColors && theme.singleColors.length) {
                itemTheme.singleColor = theme.singleColors[index];
            }

            if (theme.borderColor) {
                itemTheme.borderColor = theme.borderColor;
            }

            datum.theme = itemTheme;
            datum.index = index;

            if (!checkedIndexes || !tui.util.isUndefined(checkedIndexes[index])) {
                datum.seriesIndex = seriesIndex;
                seriesIndex += 1;
            } else {
                datum.seriesIndex = -1;
            }

            return datum;
        });
    },

    /**
     * Set legend data.
     * @private
     */
    _setData: function() {
        var self = this;
        var legendData = this.legendData;
        var data, defaultLegendTheme, startIndex, startThemeIndex;

        if (!this.seriesNames || this.seriesNames.length < 2) {
            data = this._makeLabelInfoAppliedTheme(legendData, this.theme, this.checkedIndexesMap[this.chartType]);
        } else {
            startIndex = 0;
            startThemeIndex = 0;
            defaultLegendTheme = {
                colors: defaultTheme.series.colors
            };
            data = concat.apply([], tui.util.map(this.seriesNames, function(seriesName) {
                var chartTheme = self.theme[seriesName];
                var labelLen = self.labels[seriesName].length;
                var endIndex = startIndex + labelLen;
                var slicedLegendData, checkedIndexes, themeEndIndex, datum;

                if (!chartTheme) {
                    themeEndIndex = startThemeIndex + labelLen;
                    chartTheme = JSON.parse(JSON.stringify(defaultLegendTheme));
                    chartTheme.colors = chartTheme.colors.slice(startThemeIndex, themeEndIndex);
                    startThemeIndex = themeEndIndex;
                }

                slicedLegendData = legendData.slice(startIndex, endIndex);
                checkedIndexes = self.checkedIndexesMap[seriesName];
                datum = self._makeLabelInfoAppliedTheme(slicedLegendData, chartTheme, checkedIndexes);
                startIndex = endIndex;

                return datum;
            }));
        }

        this.data = data;
    },

    /**
     * Get legend data.
     * @returns {Array.<{chartType: string, label: string, theme: object}>} legend data
     */
    getData: function() {
        return this.data;
    },

    /**
     * Get legend datum by index.
     * @param {number} index legend index
     * @returns {{chartType: string, label: string, theme: object}} legend datum
     */
    getDatum: function(index) {
        return this.data[index];
    },

    /**
     * Get selected datum.
     * @returns {{chartType: string, label: string, theme: Object}} legend datum
     */
    getSelectedDatum: function() {
        return this.getDatum(this.selectedIndex);
    },

    /**
     * Update selected index.
     * @param {?number} value value
     */
    updateSelectedIndex: function(value) {
        this.selectedIndex = value;
    },

    /**
     * Toggle selected index.
     * @param {number} index legend index
     */
    toggleSelectedIndex: function(index) {
        var selectedIndex;

        if (this.selectedIndex === index) {
            selectedIndex = null;
        } else {
            selectedIndex = index;
        }

        this.updateSelectedIndex(selectedIndex);
    },

    /**
     * Get selected index.
     * @returns {number} selected index
     */
    getSelectedIndex: function() {
        return this.selectedIndex;
    },

    /**
     * Whether unselected index or not.
     * @param {number} index legend index
     * @returns {boolean} true if selected
     */
    isUnselectedIndex: function(index) {
        return !tui.util.isNull(this.selectedIndex) && (this.selectedIndex !== index);
    },

    /**
     * Whether checked selected index or not.
     * @returns {boolean} true if checked
     */
    isCheckedSelectedIndex: function() {
        return this.isCheckedIndex(this.selectedIndex);
    },

    /**
     * Update checked index.
     * @param {number} index legend index
     * @private
     */
    _updateCheckedIndex: function(index) {
        this.checkedWholeIndexes[index] = true;
    },

    /**
     * Whether checked index.
     * @param {number} index legend index
     * @returns {boolean} true if checked
     */
    isCheckedIndex: function(index) {
        return !!this.checkedWholeIndexes[index];
    },


    /**
     * Add sending datum.
     * @param {number} index legend index
     */
    _addSendingDatum: function(index) {
        var legendDatum = this.getDatum(index);
        if (!this.checkedIndexesMap[legendDatum.chartType]) {
            this.checkedIndexesMap[legendDatum.chartType] = [];
        }
        this.checkedIndexesMap[legendDatum.chartType][legendDatum.index] = true;
    },

    /**
     * Check selected index;
     */
    checkSelectedIndex: function() {
        this._updateCheckedIndex(this.selectedIndex);
        this._addSendingDatum(this.selectedIndex);
        this._setData();
    },

    /**
     * Get checked indexes.
     * @returns {{column: ?Array.<boolean>, line: ?Array.<boolean>} | Array.<boolean>} sending data
     */
    getCheckedIndexes: function() {
        return this.checkedIndexesMap[this.chartType] || this.checkedIndexesMap;
    },

    /**
     * Reset checked data.
     * @private
     */
    _resetCheckedData: function() {
        this.checkedWholeIndexes = [];
        this.checkedIndexesMap = {};
    },

    /**
     * Update checked data.
     * @param {Array.<number>} indexes indxes
     */
    updateCheckedData: function(indexes) {
        var self = this;

        this._resetCheckedData();
        tui.util.forEachArray(indexes, function(index) {
            self._updateCheckedIndex(index);
            self._addSendingDatum(index);
        });
        this._setData();
    }
});

module.exports = LegendModel;

},{"../themes/defaultTheme":107}],70:[function(require,module,exports){
/**
 * @fileoverview This is templates of legend view.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var templateMaker = require('../helpers/templateMaker');

var htmls = {
    HTML_CHECKBOX: '<div class="tui-chart-legend-checkbox-area"><input class="tui-chart-legend-checkbox"' +
        ' type="checkbox" value="{{ index }}"{{ checked }} /></div>',
    HTML_LEGEND: '<div class="tui-chart-legend{{ unselected }}" style="height:{{ height }}px">' +
        '{{ checkbox }}<div class="tui-chart-legend-rect {{ iconType }}" style="{{ rectCssText }}"></div>' +
        '<div class="tui-chart-legend-label" style="height:{{ labelHeight }}px{{ labelWidth }}"' +
            ' data-index="{{ index }}">{{ label }}</div></div>',
    HTML_TICK: '<div class="tui-chart-map-legend-tick" style="{{ position }}"></div>' +
        '<div class="tui-chart-map-legend-tick-label" style="{{ labelPosition }}">{{ label }}</div>',
    HTML_CIRCLE_LEGEND_LABEL: '<div class="tui-chart-circle-legend-label"' +
            ' style="left: {{ left }}px;top: {{ top }}px">{{ label }}</div>'
};

module.exports = {
    tplCheckbox: templateMaker.template(htmls.HTML_CHECKBOX),
    tplLegend: templateMaker.template(htmls.HTML_LEGEND),
    tplTick: templateMaker.template(htmls.HTML_TICK),
    tplCircleLegendLabel: templateMaker.template(htmls.HTML_CIRCLE_LEGEND_LABEL)
};

},{"../helpers/templateMaker":64}],71:[function(require,module,exports){
/**
 * @fileoverview  Spectrum Legend component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const');
var predicate = require('../helpers/predicate');
var dom = require('../helpers/domHandler');
var renderUtil = require('../helpers/renderUtil');
var pluginFactory = require('../factories/pluginFactory');
var legendTemplate = require('./../legends/legendTemplate');

var SpectrumLegend = tui.util.defineClass(/** @lends SpectrumLegend.prototype */ {
    /**
     * Spectrum Legend component.
     * @constructs SpectrumLegend
     * @param {object} params parameters
     *      @param {object} params.theme axis theme
     *      @param {?Array.<string>} params.options legend options
     *      @param {MapChartDataProcessor} params.dataProcessor data processor
     *      @param {BoundsMaker} params.boundsMaker bounds maker
     */
    init: function(params) {
        var libType = params.libType || chartConst.DEFAULT_PLUGIN;

        /**
         * class name.
         * @type {string}
         */
        this.className = 'tui-chart-legend-area';

        this.chartType = params.chartType;

        /**
         * legend theme
         * @type {Object}
         */
        this.theme = params.theme;

        /**
         * options
         * @type {object}
         */
        this.options = params.options || {};

        /**
         * data processor
         * @type {DataProcessor}
         */
        this.dataProcessor = params.dataProcessor;

        /**
         * bounds maker
         * @type {BoundsMaker}
         */
        this.boundsMaker = params.boundsMaker;

        /**
         * Graph renderer
         * @type {object}
         */
        this.graphRenderer = pluginFactory.get(libType, 'mapLegend');

        /**
         * Whether horizontal legend or not.
         * @type {boolean}
         */
        this.isHorizontal = predicate.isHorizontalLegend(this.options.align);
    },

    /**
     * Make vertical legend dimension.
     * @returns {{width: number, height: number}} dimension
     * @private
     */
    _makeVerticalDimension: function() {
        var maxValue = tui.util.max(this.dataProcessor.getValues());
        var formatFunctions = this.dataProcessor.getFormatFunctions();
        var valueStr = renderUtil.formatValue(maxValue, formatFunctions, this.chartType, 'legend');
        var labelWidth = renderUtil.getRenderedLabelWidth(valueStr, this.theme.label);
        var padding = chartConst.LEGEND_AREA_PADDING + chartConst.MAP_LEGEND_LABEL_PADDING;

        return {
            width: chartConst.MAP_LEGEND_GRAPH_SIZE + labelWidth + padding,
            height: chartConst.MAP_LEGEND_SIZE
        };
    },

    /**
     * Make horizontal legend dimension
     * @returns {{width: number, height: number}} dimension
     * @private
     */
    _makeHorizontalDimension: function() {
        var maxValue = tui.util.max(this.dataProcessor.getValues()),
            labelHeight = renderUtil.getRenderedLabelHeight(maxValue, this.theme.label),
            padding = chartConst.LEGEND_AREA_PADDING + chartConst.MAP_LEGEND_LABEL_PADDING;

        return {
            width: chartConst.MAP_LEGEND_SIZE,
            height: chartConst.MAP_LEGEND_GRAPH_SIZE + labelHeight + padding
        };
    },

    /**
     * Register dimension.
     */
    registerDimension: function() {
        var dimension;

        if (this.isHorizontal) {
            dimension = this._makeHorizontalDimension();
        } else {
            dimension = this._makeVerticalDimension();
        }

        this.boundsMaker.registerBaseDimension('legend', dimension);
        this.boundsMaker.registerBaseDimension('calculationLegend', dimension);
    },

    /**
     * Make base data to make tick html.
     * @returns {{startPositionValue: number, step: number, positionType: string, labelSize: ?number}} base data
     * @private
     */
    _makeBaseDataToMakeTickHtml: function() {
        var dimension = this.boundsMaker.getDimension('legend'),
            stepCount = this.axesData.tickCount - 1,
            baseData = {},
            firstLabel;

        if (this.isHorizontal) {
            baseData.startPositionValue = 5;
            baseData.step = dimension.width / stepCount;
            baseData.positionType = 'left:';
        } else {
            baseData.startPositionValue = 0;
            baseData.step = dimension.height / stepCount;
            baseData.positionType = 'top:';
            firstLabel = this.axesData.labels[0];
            baseData.labelSize = parseInt(renderUtil.getRenderedLabelHeight(firstLabel, this.theme.label) / 2, 10) - 1;
        }

        return baseData;
    },
    /**
     * Make tick html.
     * @returns {string} tick html.
     * @private
     */
    _makeTickHtml: function() {
        var self = this,
            baseData = this._makeBaseDataToMakeTickHtml(),
            positionValue = baseData.startPositionValue,
            htmls;

        htmls = tui.util.map(this.axesData.labels, function(label) {
            var labelSize, html;

            if (self.isHorizontal) {
                labelSize = parseInt(renderUtil.getRenderedLabelWidth(label, self.theme.label) / 2, 10);
            } else {
                labelSize = baseData.labelSize;
            }

            html = legendTemplate.tplTick({
                position: baseData.positionType + positionValue + 'px',
                labelPosition: baseData.positionType + (positionValue - labelSize) + 'px',
                label: label
            });

            positionValue += baseData.step;

            return html;
        });

        return htmls.join('');
    },

    /**
     * Render tick area.
     * @returns {HTMLElement} tick countainer
     * @private
     */
    _renderTickArea: function() {
        var tickContainer = dom.create('div', 'tui-chart-legend-tick-area');

        tickContainer.innerHTML = this._makeTickHtml();

        if (this.isHorizontal) {
            dom.addClass(tickContainer, 'horizontal');
        }

        return tickContainer;
    },

    /**
     * Make graph dimension of vertical legend
     * @returns {{width: number, height: number}} dimension
     * @private
     */
    _makeVerticalGraphDimension: function() {
        return {
            width: chartConst.MAP_LEGEND_GRAPH_SIZE,
            height: this.boundsMaker.getDimension('legend').height
        };
    },

    /**
     * Make graph dimension of horizontal legend
     * @returns {{width: number, height: number}} dimension
     * @private
     */
    _makeHorizontalGraphDimension: function() {
        return {
            width: this.boundsMaker.getDimension('legend').width + 10,
            height: chartConst.MAP_LEGEND_GRAPH_SIZE
        };
    },

    /**
     * Render graph.
     * @param {HTMLElement} container container element
     * @private
     */
    _renderGraph: function(container) {
        var dimension;

        if (this.isHorizontal) {
            dimension = this._makeHorizontalGraphDimension();
        } else {
            dimension = this._makeVerticalGraphDimension();
        }

        this.graphRenderer.render(container, dimension, this.colorSpectrum, this.isHorizontal);
    },

    /**
     * Render legend area.
     * @param {HTMLElement} container legend container
     * @private
     */
    _renderLegendArea: function(container) {
        var tickContainer;

        container.innerHTML = '';
        renderUtil.renderPosition(container, this.boundsMaker.getPosition('legend'));
        this._renderGraph(container);
        tickContainer = this._renderTickArea();
        container.appendChild(tickContainer);
        container.style.cssText += ';' + renderUtil.makeFontCssText(this.theme.label);
    },

    /**
     * Render legend component.
     * @param {{colorSpectrum: ColorSpectrum, axesData: object}} data rendering data
     * @returns {HTMLElement} legend element
     */
    render: function(data) {
        var container = dom.create('DIV', this.className);

        this.legendContainer = container;
        this.colorSpectrum = data.colorSpectrum;
        this.axesData = data.axesData;
        this._renderLegendArea(container);

        return container;
    },

    /**
     * Resize legend component.
     */
    resize: function() {
        this._renderLegendArea(this.legendContainer);
    },

    /**
     * On show wedge.
     * @param {number} ratio ratio
     */
    onShowWedge: function(ratio) {
        this.graphRenderer.showWedge(chartConst.MAP_LEGEND_SIZE * ratio);
    },

    /**
     * On hide wedge.
     */
    onHideWedge: function() {
        this.graphRenderer.hideWedge();
    }
});

tui.util.CustomEvents.mixin(SpectrumLegend);

module.exports = SpectrumLegend;

},{"../const":31,"../factories/pluginFactory":52,"../helpers/domHandler":59,"../helpers/predicate":61,"../helpers/renderUtil":63,"./../legends/legendTemplate":70}],72:[function(require,module,exports){
/**
 * @fileoverview Plot component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
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
     *      @param {object} params.theme axis theme
     */
    init: function(params) {
        /**
         * Plot view className
         * @type {string}
         */
        this.className = 'tui-chart-plot-area';

        /**
         * Bounds maker
         * @type {BoundsMaker}
         */
        this.boundsMaker = params.boundsMaker;

        /**
         * Options
         * @type {object}
         */
        this.options = params.options || {};
        this.options.showLine = tui.util.isUndefined(this.options.showLine) ? true : this.options.showLine;

        /**
         * Theme
         * @type {object}
         */
        this.theme = params.theme || {};

        /**
         * Plot data.
         * @type {object}
         */
        this.data = {};
    },

    /**
     * Render plot area.
     * @param {HTMLElement} plotContainer plot area element
     * @param {object} data rendering data
     * @private
     */
    _renderPlotArea: function(plotContainer, data) {
        var dimension = this.boundsMaker.getDimension('plot');
        this.data = data;

        renderUtil.renderDimension(plotContainer, dimension);
        renderUtil.renderPosition(plotContainer, this.boundsMaker.getPosition('plot'));

        if (this.options.showLine) {
            this._renderLines(plotContainer, dimension);
        }
    },

    /**
     * Render plot component.
     * @param {object} data rendering data
     * @returns {HTMLElement} plot element
     */
    render: function(data) {
        var container = dom.create('DIV', this.className);
        this._renderPlotArea(container, data);
        this.plotContainer = container;

        return container;
    },

    /**
     * Rerender.
     * @param {object} data rendering
     */
    rerender: function(data) {
        this.plotContainer.innerHTML = '';
        this._renderPlotArea(this.plotContainer, data);
    },

    /**
     * Resize plot component.
     * @param {object} data rendering data
     */
    resize: function(data) {
        this.rerender(data);
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
     * Make html of plot line.
     * @param {object} params parameters
     *      @param {Array.<object>} params.positions positions
     *      @param {number} params.size width or height
     *      @param {string} params.className line className
     *      @param {string} params.positionType position type (left or bottom)
     *      @param {string} params.sizeType size type (size or height)
     *      @param {string} params.lineColor line color
     * @returns {string} html
     * @private
     */
    _makeLineHtml: function(params) {
        var template = plotTemplate.tplPlotLine;
        var lineHtml = tui.util.map(params.positions, function(position) {
            var cssTexts = [
                    renderUtil.concatStr(params.positionType, ':', position, 'px'),
                    renderUtil.concatStr(params.sizeType, ':', params.size, 'px')
                ], data;

            if (params.lineColor) {
                cssTexts.push(renderUtil.concatStr('background-color:', params.lineColor));
            }

            data = {className: params.className, cssText: cssTexts.join(';')};

            return template(data);
        }).join('');

        return lineHtml;
    },

    /**
     * Make pixel value of vertical positions
     * @param {number} height plot height
     * @returns {Array.<number>} positions
     * @private
     */
    _makeVerticalPixelPositions: function(height) {
        var positions = calculator.makeTickPixelPositions(height, this.data.vTickCount);

        positions.shift();

        return positions;
    },

    /**
     * Make divided positions of plot.
     * @param {number} width plot width
     * @returns {Array.<number>}
     * @private
     */
    _makeDividedPlotPositions: function(width) {
        var tickCount = parseInt(this.data.hTickCount / 2, 10) + 1,
            yAxisWidth = this.boundsMaker.getDimension('yAxis').width,
            leftWidth, rightWidth, leftPositions, rightPositions;

        width -= yAxisWidth;
        leftWidth = Math.round((width) / 2);
        rightWidth = width - leftWidth;

        leftPositions = calculator.makeTickPixelPositions(leftWidth, tickCount);
        rightPositions = calculator.makeTickPixelPositions(rightWidth, tickCount, leftWidth + yAxisWidth);

        leftPositions.pop();
        rightPositions.shift();

        return leftPositions.concat(rightPositions);
    },

    /**
     * Make pixel value of horizontal positions.
     * @param {number} width plot width
     * @returns {Array.<number>} positions
     * @private
     */
    _makeHorizontalPixelPositions: function(width) {
        var positions;

        if (this.options.divided) {
            positions = this._makeDividedPlotPositions(width);
        } else {
            positions = calculator.makeTickPixelPositions(width, this.data.hTickCount);
            positions.shift();
        }

        return positions;
    }
});

module.exports = Plot;

},{"../helpers/calculator":57,"../helpers/domHandler":59,"../helpers/renderUtil":63,"./plotTemplate":73}],73:[function(require,module,exports){
/**
 * @fileoverview This is templates of plot view .
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var templateMaker = require('../helpers/templateMaker');

var tags = {
    HTML_PLOT_LINE: '<div class="tui-chart-plot-line {{ className }}" style="{{ cssText }}"></div>'
};

module.exports = {
    tplPlotLine: templateMaker.template(tags.HTML_PLOT_LINE)
};

},{"../helpers/templateMaker":64}],74:[function(require,module,exports){
/**
 * @fileoverview Raphael render plugin.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var BarChart = require('./raphaelBarChart');
var LineChart = require('./raphaelLineChart');
var AreaChart = require('./raphaelAreaChart');
var PieChart = require('./raphaelPieChart');
var CoordinateTypeChart = require('./raphaelCoordinateTypeChart');
var BoxTypeChart = require('./raphaelBoxTypeChart');
var MapChart = require('./raphaelMapChart');
var MapLegend = require('./raphaelMapLegend');
var CircleLegend = require('./raphaelCircleLegend');

var pluginName = 'raphael';
var pluginRaphael = {
    bar: BarChart,
    column: BarChart,
    line: LineChart,
    area: AreaChart,
    pie: PieChart,
    bubble: CoordinateTypeChart,
    scatter: CoordinateTypeChart,
    heatmap: BoxTypeChart,
    treemap: BoxTypeChart,
    map: MapChart,
    mapLegend: MapLegend,
    circleLegend: CircleLegend
};

tui.chart.registerPlugin(pluginName, pluginRaphael);

},{"./raphaelAreaChart":75,"./raphaelBarChart":76,"./raphaelBoxTypeChart":77,"./raphaelCircleLegend":78,"./raphaelCoordinateTypeChart":79,"./raphaelLineChart":80,"./raphaelMapChart":82,"./raphaelMapLegend":83,"./raphaelPieChart":84}],75:[function(require,module,exports){
/**
 * @fileoverview Raphael area chart renderer.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var RaphaelLineBase = require('./raphaelLineTypeBase');
var raphaelRenderUtil = require('./raphaelRenderUtil');

var EMPHASIS_OPACITY = 1;
var DE_EMPHASIS_OPACITY = 0.3;
var LEFT_BAR_WIDTH = 10;

var raphael = window.Raphael;
var concat = Array.prototype.concat;

var RaphaelAreaChart = tui.util.defineClass(RaphaelLineBase, /** @lends RaphaelAreaChart.prototype */ {
    /**
     * RaphaelAreaChart is graph renderer for area chart.
     * @constructs RaphaelAreaChart
     * @extends RaphaelLineTypeBase
     */
    init: function() {
        /**
         * selected legend index
         * @type {?number}
         */
        this.selectedLegendIndex = null;

        /**
         * type of chart
         * @type {string}
         */
        this.chartType = 'area';
    },

    /**
     * Render function of area chart.
     * @param {HTMLElement} container container
     * @param {{groupPositions: Array.<Array>, dimension: object, theme: object, options: object}} data render data
     * @param {object} paper - raphael paper
     * @returns {object}
     */
    render: function(container, data, paper) {
        var dimension = data.dimension;
        var groupPositions = data.groupPositions;
        var theme = data.theme;
        var colors = theme.colors;
        var opacity = data.options.showDot ? 1 : 0;
        var borderStyle = this.makeBorderStyle(theme.borderColor, opacity);
        var outDotStyle = this.makeOutDotStyle(opacity, borderStyle);

        paper = paper || raphael(container, 1, dimension.height);

        this.paper = paper;
        this.isSpline = data.options.spline;
        this.dimension = dimension;
        this.zeroTop = data.zeroTop;
        this.hasRangeData = data.hasRangeData;

        this.groupPaths = this._getAreaChartPath(groupPositions);
        this.groupAreas = this._renderAreas(paper, this.groupPaths, colors);
        this.leftBar = this._renderLeftBar(dimension.height, data.chartBackground);
        this.tooltipLine = this._renderTooltipLine(paper, dimension.height);
        this.groupDots = this._renderDots(paper, groupPositions, colors, opacity);

        if (data.options.allowSelect) {
            this.selectionDot = this._makeSelectionDot(paper);
            this.selectionColor = theme.selectionColor;

            if (this.hasRangeData) {
                this.selectionStartDot = this._makeSelectionDot(paper);
            }
        }

        this.outDotStyle = outDotStyle;
        this.groupPositions = groupPositions;
        this.dotOpacity = opacity;

        this.pivotGroupDots = null;

        return paper;
    },

    /**
     * Get path for area chart.
     * @param {Array.<Array.<{left: number, top: number, startTop: number}>>} groupPositions - positions
     * @param {boolean} [hasExtraPath] - whether has extra path or not
     * @returns {*}
     * @private
     */
    _getAreaChartPath: function(groupPositions, hasExtraPath) {
        var path;

        if (this.isSpline) {
            path = this._makeSplineAreaChartPath(groupPositions, hasExtraPath);
        } else {
            path = this._makeAreaChartPath(groupPositions, hasExtraPath);
        }

        return path;
    },

    /**
     * Render area graphs.
     * @param {object} paper paper
     * @param {Array.<object>} groupPaths group paths
     * @param {Array.<string>} colors colors
     * @returns {Array} raphael objects
     * @private
     */
    _renderAreas: function(paper, groupPaths, colors) {
        var groupAreas;

        colors = colors.slice(0, groupPaths.length);
        colors.reverse();
        groupPaths.reverse();

        groupAreas = tui.util.map(groupPaths, function(path, groupIndex) {
            var areaColor = colors[groupIndex] || 'transparent',
                lineColor = areaColor,
                polygons = {
                    area: raphaelRenderUtil.renderArea(paper, path.area.join(' '), {
                        fill: areaColor,
                        opacity: 0.5,
                        stroke: areaColor
                    }),
                    line: raphaelRenderUtil.renderLine(paper, path.line.join(' '), lineColor, 1)
                };

            if (path.startLine) {
                polygons.startLine = raphaelRenderUtil.renderLine(paper, path.startLine.join(' '), lineColor, 1);
            }

            return polygons;
        });

        return groupAreas.reverse();
    },

    /**
     * Make height.
     * @param {number} top top
     * @param {number} startTop start top
     * @returns {number} height
     * @private
     */
    _makeHeight: function(top, startTop) {
        return Math.abs(top - startTop);
    },

    /**
     * Make areas path.
     * @param {Array.<{left: number, top: number, startTop: number}>} positions positions
     * @param {boolean} [hasExtraPath] - whether has extra path or not
     * @returns {Array.<string | number>} path
     * @private
     */
    _makeAreasPath: function(positions, hasExtraPath) {
        var len = positions.length * 2;
        var path = [];
        var targetIndex;

        tui.util.forEachArray(positions, function(position, index) {
            path[index] = ['L', position.left, position.top];
            path[len - index - 1] = ['L', position.left, position.startTop];
        });

        if (hasExtraPath !== false) {
            targetIndex = positions.length - 1;
            path.splice(targetIndex + 1, 0, path[targetIndex], path[targetIndex + 1]);
        }

        path = concat.apply([], path);
        path[0] = 'M';

        return path;
    },

    /**
     * Make path for area chart.
     * @param {Array.<Array.<{left: number, top: number, startTop: number}>>} groupPositions positions
     * @param {boolean} [hasExtraPath] - whether has extra path or not
     * @returns {Array.<{area: Array.<string | number>, line: Array.<string | number>}>} path
     * @private
     */
    _makeAreaChartPath: function(groupPositions, hasExtraPath) {
        var self = this;

        return tui.util.map(groupPositions, function(positions) {
            var paths;

            paths = {
                area: self._makeAreasPath(positions, hasExtraPath),
                line: self._makeLinesPath(positions)
            };

            if (self.hasRangeData) {
                paths.startLine = self._makeLinesPath(positions, 'startTop');
            }

            return paths;
        });
    },

    /**
     * Make spline area bottom path.
     * @param {Array.<{left: number, top: number}>} positions positions
     * @returns {Array.<string | number>} spline area path
     * @private
     */
    _makeSplineAreaBottomPath: function(positions) {
        var self = this;

        return tui.util.map(positions, function(position) {
            return ['L', position.left, self.zeroTop];
        }).reverse();
    },

    /**
     * Make spline path for area chart.
     * @param {Array.<Array.<{left: number, top: number, startTop: number}>>} groupPositions positions
     * @param {boolean} [hasExtraPath] - whether has extra path or not
     * @returns {Array.<{area: Array.<string | number>, line: Array.<string | number>}>} path
     * @private
     */
    _makeSplineAreaChartPath: function(groupPositions, hasExtraPath) {
        var self = this;

        return tui.util.map(groupPositions, function(positions) {
            var linesPath = self._makeSplineLinesPath(positions);
            var areaPath = JSON.parse(JSON.stringify(linesPath));
            var areasBottomPath = self._makeSplineAreaBottomPath(positions);
            var lastPosition;

            if (hasExtraPath !== false) {
                lastPosition = positions[positions.length - 1];
                areaPath.push(['L', lastPosition.left, lastPosition.top]);
                areasBottomPath.unshift(['L', lastPosition.left, self.zeroTop]);
            }

            return {
                area: areaPath.concat(areasBottomPath),
                line: linesPath
            };
        });
    },

    /**
     * Resize graph of area chart.
     * @param {object} params parameters
     *      @param {{width: number, height:number}} params.dimension dimension
     *      @param {Array.<Array.<{left:number, top:number}>>} params.groupPositions group positions
     */
    resize: function(params) {
        var self = this,
            dimension = params.dimension,
            groupPositions = params.groupPositions;

        this.zeroTop = params.zeroTop;
        this.groupPositions = groupPositions;
        this.groupPaths = this._getAreaChartPath(groupPositions);
        this.paper.setSize(dimension.width, dimension.height);
        this.tooltipLine.attr({top: dimension.height});

        tui.util.forEachArray(this.groupPaths, function(path, groupIndex) {
            var area = self.groupAreas[groupIndex];
            area.area.attr({path: path.area.join(' ')});
            area.line.attr({path: path.line.join(' ')});

            if (area.startLine) {
                area.startLine.attr({path: path.startLine.join(' ')});
            }

            tui.util.forEachArray(self.groupDots[groupIndex], function(item, index) {
                var position = groupPositions[groupIndex][index];
                var startPositon;

                self._moveDot(item.endDot.dot, position);
                if (item.startDot) {
                    startPositon = tui.util.extend({}, position);
                    startPositon.top = startPositon.startTop;
                    self._moveDot(item.startDot.dot, startPositon);
                }
            });
        });
    },

    /**
     * Select legend.
     * @param {?number} legendIndex legend index
     */
    selectLegend: function(legendIndex) {
        var self = this,
            noneSelected = tui.util.isNull(legendIndex);

        this.selectedLegendIndex = legendIndex;

        tui.util.forEachArray(this.groupAreas, function(area, groupIndex) {
            var opacity = (noneSelected || legendIndex === groupIndex) ? EMPHASIS_OPACITY : DE_EMPHASIS_OPACITY;

            area.area.attr({'fill-opacity': opacity});
            area.line.attr({'stroke-opacity': opacity});

            if (area.startLine) {
                area.startLine.attr({'stroke-opacity': opacity});
            }

            tui.util.forEachArray(self.groupDots[groupIndex], function(item) {
                if (self.dotOpacity) {
                    item.endDot.dot.attr({'fill-opacity': opacity});
                    if (item.startDot) {
                        item.startDot.dot.attr({'fill-opacity': opacity});
                    }
                }
            });
        });
    },

    /**
     * Animate for adding data.
     * @param {object} data - data for graph rendering
     * @param {number} tickSize - tick size
     * @param {Array.<Array.<object>>} groupPositions - group positions
     * @param {boolean} [shiftingOption] - shifting option
     * @param {number} zeroTop - position top value for zero point
     */
    animateForAddingData: function(data, tickSize, groupPositions, shiftingOption, zeroTop) {
        var self = this;
        var additionalIndex = 0;
        var groupPaths;

        if (!groupPositions.length) {
            return;
        }

        this.zeroTop = zeroTop;

        groupPaths = this._getAreaChartPath(groupPositions, false);

        if (shiftingOption) {
            this.leftBar.animate({
                width: tickSize + LEFT_BAR_WIDTH
            }, 300);
            additionalIndex = 1;
        }

        tui.util.forEachArray(this.groupAreas, function(area, groupIndex) {
            var dots = self.groupDots[groupIndex];
            var groupPosition = groupPositions[groupIndex];
            var pathMap = groupPaths[groupIndex];

            if (shiftingOption) {
                self._removeFirstDot(dots);
            }

            tui.util.forEachArray(dots, function(item, index) {
                var position = groupPosition[index + additionalIndex];

                self._animateByPosition(item.endDot.dot, position);

                if (item.startDot) {
                    self._animateByPosition(item.startDot.dot, {
                        left: position.left,
                        top: position.startTop
                    });
                }
            });

            self._animateByPath(area.area, pathMap.area);
            self._animateByPath(area.line, pathMap.line);

            if (area.startLine) {
                self._animateByPath(area.startLine, pathMap.startLine);
            }
        });
    }
});

module.exports = RaphaelAreaChart;

},{"./raphaelLineTypeBase":81,"./raphaelRenderUtil":85}],76:[function(require,module,exports){
/**
 * @fileoverview Raphael bar chart renderer.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';
var raphaelRenderUtil = require('./raphaelRenderUtil');

var raphael = window.Raphael;

var ANIMATION_DURATION = 700;
var EMPHASIS_OPACITY = 1;
var DE_EMPHASIS_OPACITY = 0.3;
var DEFAULT_LUMINANC = 0.2;

/**
 * @classdesc RaphaelBarChart is graph renderer for bar, column chart.
 * @class RaphaelBarChart
 */
var RaphaelBarChart = tui.util.defineClass(/** @lends RaphaelBarChart.prototype */ {
    /**
     * Render function of bar chart
     * @param {HTMLElement} container container element
     * @param {{size: object, model: object, options: object, tooltipPosition: string}} data chart data
     * @returns {object} paper raphael paper
     */
    render: function(container, data) {
        var groupBounds = data.groupBounds,
            dimension = data.dimension,
            paper;

        if (!groupBounds) {
            return null;
        }

        this.paper = paper = raphael(container, dimension.width, dimension.height);

        this.theme = data.theme;
        this.seriesDataModel = data.seriesDataModel;
        this.chartType = data.chartType;

        this.groupBars = this._renderBars(groupBounds);
        this.groupBorders = this._renderBarBorders(groupBounds);

        this.overlay = this._renderOverlay();
        this.theme = data.theme;
        this.groupBounds = groupBounds;

        return paper;
    },

    /**
     * Render overlay.
     * @returns {object} raphael object
     * @private
     */
    _renderOverlay: function() {
        var bound = {
            width: 1,
            height: 1,
            left: 0,
            top: 0
        };
        var attributes = {
            'fill-opacity': 0
        };

        return this._renderBar(bound, '#fff', attributes);
    },

    /**
     * Render rect
     * @param {{left: number, top: number, width: number, height: number}} bound bound
     * @param {string} color series color
     * @param {object} [attributes] - attributes
     * @returns {object} bar rect
     * @private
     */
    _renderBar: function(bound, color, attributes) {
        var rect;

        if (bound.width < 0 || bound.height < 0) {
            return null;
        }

        rect = raphaelRenderUtil.renderRect(this.paper, bound, tui.util.extend({
            fill: color,
            stroke: 'none'
        }, attributes));

        return rect;
    },

    /**
     * Render bars.
     * @param {Array.<Array.<{left: number, top:number, width: number, height: number}>>} groupBounds bounds
     * @returns {Array.<Array.<object>>} bars
     * @private
     */
    _renderBars: function(groupBounds) {
        var self = this,
            singleColors = [],
            colors = this.theme.colors,
            groupBars;

        if ((groupBounds[0].length === 1) && this.theme.singleColors) {
            singleColors = this.theme.singleColors;
        }

        groupBars = tui.util.map(groupBounds, function(bounds, groupIndex) {
            var singleColor = singleColors[groupIndex];

            return tui.util.map(bounds, function(bound, index) {
                var color, rect, item;

                if (!bound) {
                    return null;
                }

                item = self.seriesDataModel.getSeriesItem(groupIndex, index);

                color = singleColor || colors[index];
                rect = self._renderBar(bound.start, color);

                return {
                    rect: rect,
                    color: color,
                    bound: bound.end,
                    item: item,
                    groupIndex: groupIndex,
                    index: index,
                    isRange: item.isRange
                };
            });
        });

        return groupBars;
    },

    /**
     * Make rect points.
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
     * Make top line path.
     * @param {object} points points
     *      @param {{left: number, top: number}} points.leftTop left top
     *      @param {{left: number, top: number}} points.rightTop right top
     * @param {string} chartType chart type
     * @param {Item} item item
     * @returns {string} top line path
     * @private
     */
    _makeTopLinePath: function(points, chartType, item) {
        var linePath = null,
            value = item.value,
            cloneLeftTop;

        if (chartType === 'bar' || value >= 0 || item.isRange) {
            cloneLeftTop = tui.util.extend({}, points.leftTop);
            cloneLeftTop.left -= chartType === 'column' || value < 0 ? 1 : 0;
            linePath = raphaelRenderUtil.makeLinePath(cloneLeftTop, points.rightTop).join(' ');
        }

        return linePath;
    },

    /**
     * Make right line path.
     * @param {object} points points
     *      @param {{left: number, top: number}} points.rightTop right top
     *      @param {{left: number, top: number}} points.rightBottom right bottom
     * @param {string} chartType chart type
     * @param {Item} item item
     * @returns {string} top line path
     * @private
     */
    _makeRightLinePath: function(points, chartType, item) {
        var linePath = null;

        if (chartType === 'column' || item.value >= 0 || item.isRange) {
            linePath = raphaelRenderUtil.makeLinePath(points.rightTop, points.rightBottom).join(' ');
        }

        return linePath;
    },

    /**
     * Make bottom line path.
     * @param {object} points points
     *      @param {{left: number, top: number}} points.lefBottom left bottom
     *      @param {{left: number, top: number}} points.rightBottom right bottom
     * @param {string} chartType chart type
     * @param {Item} item item
     * @returns {string} top line path
     * @private
     */
    _makeBottomLinePath: function(points, chartType, item) {
        var linePath = null;

        if (chartType === 'bar' || item.value < 0 || item.isRange) {
            linePath = raphaelRenderUtil.makeLinePath(points.leftBottom, points.rightBottom).join(' ');
        }

        return linePath;
    },

    /**
     * Make left line path.
     * @param {object} points points
     *      @param {{left: number, top: number}} points.lefTop left top
     *      @param {{left: number, top: number}} points.leftBottom left bottom
     * @param {string} chartType chart type
     * @param {Item} item item
     * @returns {string} top line path
     * @private
     */
    _makeLeftLinePath: function(points, chartType, item) {
        var linePath = null;

        if (chartType === 'column' || item.value < 0 || item.isRange) {
            linePath = raphaelRenderUtil.makeLinePath(points.leftTop, points.leftBottom).join(' ');
        }

        return linePath;
    },

    /**
     * Make border lines paths.
     * @param {{left: number, top:number, width: number, height: number}} bound rect bound
     * @param {string} chartType chart type
     * @param {Item} item item
     * @returns {{top: string, right: string, bottom: string, left: string}} paths
     * @private
     */
    _makeBorderLinesPaths: function(bound, chartType, item) {
        var points = this._makeRectPoints(bound),
            paths = {
                top: this._makeTopLinePath(points, chartType, item),
                right: this._makeRightLinePath(points, chartType, item),
                bottom: this._makeBottomLinePath(points, chartType, item),
                left: this._makeLeftLinePath(points, chartType, item)
            };

        return tui.util.filter(paths, function(path) {
            return path;
        });
    },

    /**
     * Render border lines;
     * @param {{left: number, top:number, width: number, height: number}} bound bar bound
     * @param {string} borderColor border color
     * @param {string} chartType chart type
     * @param {Item} item item
     * @returns {object} raphael object
     * @private
     */
    _renderBorderLines: function(bound, borderColor, chartType, item) {
        var self = this,
            borderLinePaths = this._makeBorderLinesPaths(bound, chartType, item),
            lines = {};

        tui.util.forEach(borderLinePaths, function(path, name) {
            lines[name] = raphaelRenderUtil.renderLine(self.paper, path, borderColor, 1);
        });

        return lines;
    },

    /**
     * Render bar borders.
     * @param {Array.<Array.<{left: number, top:number, width: number, height: number}>>} groupBounds bounds
     * @returns {Array.<Array.<object>>} borders
     * @private
     */
    _renderBarBorders: function(groupBounds) {
        var self = this,
            borderColor = this.theme.borderColor,
            groupBorders;

        if (!borderColor) {
            return null;
        }

        groupBorders = tui.util.map(groupBounds, function(bounds, groupIndex) {
            return tui.util.map(bounds, function(bound, index) {
                var seriesItem;

                if (!bound) {
                    return null;
                }

                seriesItem = self.seriesDataModel.getSeriesItem(groupIndex, index);

                return self._renderBorderLines(bound.start, borderColor, self.chartType, seriesItem);
            });
        });

        return groupBorders;
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
        }, ANIMATION_DURATION);
    },

    /**
     * Animate borders.
     * @param {Array.<object>} lines raphael objects
     * @param {{left: number, top:number, width: number, height: number}} bound rect bound
     * @param {string} chartType chart type
     * @param {Item} item item
     * @private
     */
    _animateBorders: function(lines, bound, chartType, item) {
        var paths = this._makeBorderLinesPaths(bound, chartType, item);

        tui.util.forEach(lines, function(line, name) {
            line.animate({path: paths[name]}, ANIMATION_DURATION);
        });
    },

    /**
     * Animate.
     * @param {function} onFinish finish callback function
     */
    animate: function(onFinish) {
        var self = this,
            groupBorders = this.groupBorders || [];

        if (this.callbackTimeout) {
            clearTimeout(this.callbackTimeout);
            delete this.callbackTimeout;
        }
        raphaelRenderUtil.forEach2dArray(this.groupBars, function(bar, groupIndex, index) {
            var lines = groupBorders[groupIndex] && groupBorders[groupIndex][index];
            if (!bar) {
                return;
            }
            self._animateRect(bar.rect, bar.bound);
            if (lines) {
                self._animateBorders(lines, bar.bound, self.chartType, bar.item);
            }
        });

        if (onFinish) {
            this.callbackTimeout = setTimeout(function() {
                onFinish();
                delete self.callbackTimeout;
            }, ANIMATION_DURATION);
        }
    },

    /**
     * Show animation.
     * @param {{groupIndex: number, index:number}} data show info
     */
    showAnimation: function(data) {
        var bar = this.groupBars[data.groupIndex][data.index],
            bound = bar.bound;
        this.overlay.attr({
            width: bound.width,
            height: bound.height,
            x: bound.left,
            y: bound.top,
            'fill-opacity': 0.3
        });
    },

    /**
     * Hide animation.
     */
    hideAnimation: function() {
        this.overlay.attr({
            width: 1,
            height: 1,
            x: 0,
            y: 0,
            'fill-opacity': 0
        });
    },

    /**
     * Update rect bound
     * @param {object} rect raphael object
     * @param {{left: number, top: number, width: number, height: number}} bound bound
     * @private
     */
    _updateRectBound: function(rect, bound) {
        rect.attr({
            x: bound.left,
            y: bound.top,
            width: bound.width,
            height: bound.height
        });
    },

    /**
     * Resize graph of bar type chart.
     * @param {object} params parameters
     *      @param {{width: number, height:number}} params.dimension dimension
     *      @param {Array.<Array.<{
     *                  left:number, top:number, width: number, height: number
     *              }>>} params.groupBounds group bounds
     */
    resize: function(params) {
        var self = this,
            groupBorders = this.groupBorders || [],
            dimension = params.dimension,
            groupBounds = params.groupBounds;

        this.groupBounds = groupBounds;
        this.paper.setSize(dimension.width, dimension.height);

        raphaelRenderUtil.forEach2dArray(this.groupBars, function(bar, groupIndex, index) {
            var lines, bound;

            if (!bar) {
                return;
            }

            lines = groupBorders[groupIndex] && groupBorders[groupIndex][index];
            bound = groupBounds[groupIndex][index].end;
            bar.bound = bound;
            raphaelRenderUtil.updateRectBound(bar.rect, bound);

            if (lines) {
                self._updateBordersPath(lines, bound, self.chartType, bar.item);
            }
        });
    },

    /**
     * Change borders color.
     * @param {Array.<object>} lines raphael objects
     * @param {borderColor} borderColor border color
     * @private
     */
    _changeBordersColor: function(lines, borderColor) {
        tui.util.forEach(lines, function(line) {
            line.attr({stroke: borderColor});
        });
    },

    /**
     * Change bar color.
     * @param {{groupIndex: number, index: number}} indexes indexes
     * @param {string} color fill color
     * @param {?string} borderColor stroke color
     * @private
     */
    _changeBarColor: function(indexes, color, borderColor) {
        var bar = this.groupBars[indexes.groupIndex][indexes.index],
            lines;

        bar.rect.attr({
            fill: color
        });

        if (borderColor) {
            lines = this.groupBorders[indexes.groupIndex][indexes.index];
            this._changeBordersColor(lines, borderColor);
        }
    },

    /**
     * Select series.
     * @param {{groupIndex: number, index: number}} indexes indexes
     */
    selectSeries: function(indexes) {
        var bar = this.groupBars[indexes.groupIndex][indexes.index],
            objColor = raphael.color(bar.color),
            selectionColorTheme = this.theme.selectionColor,
            color = selectionColorTheme || raphaelRenderUtil.makeChangedLuminanceColor(objColor.hex, DEFAULT_LUMINANC),
            borderColor = this.theme.borderColor,
            objBorderColor;

        if (borderColor) {
            objBorderColor = raphael.color(borderColor);
            borderColor = raphaelRenderUtil.makeChangedLuminanceColor(objBorderColor.hex, DEFAULT_LUMINANC);
        }

        this._changeBarColor(indexes, color, borderColor);
    },

    /**
     * Unselect series.
     * @param {{groupIndex: number, index: number}} indexes indexes
     */
    unselectSeries: function(indexes) {
        var bar = this.groupBars[indexes.groupIndex][indexes.index],
            borderColor = this.theme.borderColor;
        this._changeBarColor(indexes, bar.color, borderColor);
    },

    /**
     * Select legend.
     * @param {?number} legendIndex legend index
     */
    selectLegend: function(legendIndex) {
        var groupBorders = this.groupBorders || [],
            noneSelected = tui.util.isNull(legendIndex);

        raphaelRenderUtil.forEach2dArray(this.groupBars, function(bar, groupIndex, index) {
            var lines, opacity;

            if (!bar) {
                return;
            }

            lines = groupBorders[groupIndex] && groupBorders[groupIndex][index];
            opacity = (noneSelected || legendIndex === index) ? EMPHASIS_OPACITY : DE_EMPHASIS_OPACITY;

            bar.rect.attr({'fill-opacity': opacity});
            if (lines) {
                tui.util.forEach(lines, function(line) {
                    line.attr({'stroke-opacity': opacity});
                });
            }
        });
    }
});

module.exports = RaphaelBarChart;

},{"./raphaelRenderUtil":85}],77:[function(require,module,exports){
/**
 * @fileoverview RaphaelBoxTypeChart is graph renderer for box type chart(heatmap chart, treemap chart).
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';
var raphaelRenderUtil = require('./raphaelRenderUtil');

var raphael = window.Raphael;

var ANIMATION_DURATION = 100;
var MIN_BORDER_WIDTH = 1;
var MAX_BORDER_WIDTH = 3;

/**
 * @classdesc RaphaelBoxTypeChart is graph renderer for box type chart(heatmap chart, treemap chart).
 * @class RaphaelBarChart
 */
var RaphaelBoxTypeChart = tui.util.defineClass(/** @lends RaphaelBoxTypeChart.prototype */ {
    /**
     * Render function of bar chart
     * @param {HTMLElement} container container element
     * @param {{
     *      dimension: {width: number, height: number},
     *      colorSpectrum: object,
     *      seriesDataModel: SeriesDataModel,
     *      groupBounds: (Array.<Array.<object>>|object.<string, object>),
     *      theme: object
     * }} seriesData - data for graph rendering
     * @returns {object}
     */
    render: function(container, seriesData) {
        var dimension = seriesData.dimension;

        this.paper = raphael(container, dimension.width, dimension.height);
        /**
         * theme
         * @type {*|{}}
         */
        this.theme = seriesData.theme || {};

        /**
         * color spectrum
         * @type {Object}
         */
        this.colorSpectrum = seriesData.colorSpectrum;

        /**
         *
         */
        this.chartBackground = seriesData.chartBackground;

        /**
         * zoomable option
         */
        this.zoomable = seriesData.zoomable;

        /**
         * border color for rendering box
         * @type {string}
         */
        this.borderColor = this.theme.borderColor || 'none';

        /**
         * group bounds
         * @type {Array.<Array.<object>>|object.<string, object>}
         */
        this.groupBounds = seriesData.groupBounds;

        /**
         * bound map
         * @type {object.<string, {left: number, top: number, width: number, height: number}>}
         */
        this.boundMap = seriesData.boundMap;

        this._bindGetBoundFunction();
        this._bindGetColorFunction();

        /**
         * boxes set
         * @type {Array.<Array.<{rect: Object, color: string}>>}
         */
        this.boxesSet = this._renderBoxes(seriesData.seriesDataModel, seriesData.startDepth, !!seriesData.isPivot);

        return this.paper;
    },

    /**
     * Bind _getBound private function.
     * @private
     */
    _bindGetBoundFunction: function() {
        if (this.boundMap) {
            this._getBound = this._getBoundFromBoundMap;
        } else {
            this._getBound = this._getBoundFromGroupBounds;
        }
    },

    /**
     * Bind _bindGetColorFunction private function.
     * @private
     */
    _bindGetColorFunction: function() {
        if (this.colorSpectrum) {
            this._getColor = this._getColorFromSpectrum;
        } else if (this.zoomable) {
            this._getColor = this._getColorFromColorsWhenZoomable;
        } else {
            this._getColor = this._getColorFromColors;
        }
    },

    /**
     * Get bound from groupBounds by indexes(groupIndex, index) of seriesItem.
     * @param {SeriesItem} seriesItem - seriesItem
     * @returns {{width: number, height: number, left: number, top: number}}
     * @private
     */
    _getBoundFromGroupBounds: function(seriesItem) {
        return this.groupBounds[seriesItem.groupIndex][seriesItem.index].end;
    },

    /**
     * Get bound from boundMap by id of seriesItem.
     * @param {SeriesItem} seriesItem - seriesItem
     * @returns {{width: number, height: number, left: number, top: number}}
     * @private
     */
    _getBoundFromBoundMap: function(seriesItem) {
        return this.boundMap[seriesItem.id];
    },

    /**
     * Get color from colorSpectrum by ratio of seriesItem.
     * @param {SeriesItem} seriesItem - seriesItem
     * @returns {string}
     * @private
     */
    _getColorFromSpectrum: function(seriesItem) {
        var color;

        if (!seriesItem.hasChild) {
            color = this.colorSpectrum.getColor(seriesItem.ratio) || this.chartBackground;
        } else {
            color = 'none';
        }

        return color;
    },

    /**
     * Get color from colors theme by group property of seriesItem.
     * @param {SeriesItem} seriesItem - seriesItem
     * @returns {string}
     * @private
     */
    _getColorFromColors: function(seriesItem) {
        return seriesItem.hasChild ? 'none' : this.theme.colors[seriesItem.group];
    },

    /**
     * Get color from colors theme, when zoomable option.
     * @param {SeriesItem} seriesItem - seriesItem
     * @param {number} startDepth - start depth
     * @returns {string}
     * @private
     */
    _getColorFromColorsWhenZoomable: function(seriesItem, startDepth) {
        return (seriesItem.depth === startDepth) ? this.theme.colors[seriesItem.group] : 'none';
    },

    /**
     * Render rect.
     * @param {{width: number, height: number, left: number, top: number}} bound - bound
     * @param {string} color - color
     * @param {number} strokeWidth - stroke width
     * @returns {object}
     * @private
     */
    _renderRect: function(bound, color, strokeWidth) {
        return raphaelRenderUtil.renderRect(this.paper, bound, {
            fill: color,
            stroke: this.borderColor,
            'stroke-width': strokeWidth
        });
    },

    /**
     * Render boxes.
     * @param {SeriesDataModel} seriesDataModel - seriesDataModel
     * @param {number} startDepth - start depth
     * @param {boolean} isPivot - whether pivot or not
     * @returns {Array.<Array.<{rect: object, color: string}>>}
     * @private
     */
    _renderBoxes: function(seriesDataModel, startDepth, isPivot) {
        var self = this;
        var rectToBack;

        if (this.colorSpectrum || !this.zoomable) {
            rectToBack = function(rect) {
                rect.toBack();
            };
        } else {
            rectToBack = function() {};
        }

        return seriesDataModel.map(function(seriesGroup, groupIndex) {
            return seriesGroup.map(function(seriesItem, index) {
                var result = null;
                var strokeWidth = MIN_BORDER_WIDTH;
                var bound, color;

                if (tui.util.isExisty(seriesItem.depth)) {
                    strokeWidth = Math.max(MIN_BORDER_WIDTH, MAX_BORDER_WIDTH - (seriesItem.depth - startDepth));
                }

                seriesItem.groupIndex = groupIndex;
                seriesItem.index = index;
                bound = self._getBound(seriesItem);

                if (bound) {
                    color = self._getColor(seriesItem, startDepth);
                    result = {
                        rect: self._renderRect(bound, color, strokeWidth),
                        seriesItem: seriesItem,
                        color: color
                    };
                    rectToBack(result.rect);
                }

                return result;
            });
        }, isPivot);
    },

    /**
     * Animate changing color of box.
     * @param {object} rect - raphael object
     * @param {string} [color] - fill color
     * @param {number} [opacity] - fill opacity
     * @private
     */
    _animateChangingColor: function(rect, color, opacity) {
        var properties = {
            'fill-opacity': tui.util.isExisty(opacity) ? opacity : 1
        };

        if (color) {
            properties.fill = color;
        }

        rect.animate(properties, ANIMATION_DURATION);
    },

    /**
     * Show animation.
     * @param {{groupIndex: number, index:number}} indexes - index info
     * @param {boolean} [useSpectrum] - whether use spectrum legend or not
     * @param {number} [opacity] - fill opacity
     */
    showAnimation: function(indexes, useSpectrum, opacity) {
        var box = this.boxesSet[indexes.groupIndex][indexes.index];
        var color;

        if (!box) {
            return;
        }

        useSpectrum = tui.util.isUndefined(useSpectrum) ? true : useSpectrum;
        color = useSpectrum ? this.theme.overColor : box.color;

        if (box.seriesItem.hasChild) {
            if (useSpectrum) {
                box.rect.attr({'fill-opacity': 0});
            }
            box.rect.toFront();
        }

        this._animateChangingColor(box.rect, color, opacity);
    },

    /**
     * Hide animation.
     * @param {{groupIndex: number, index:number}} indexes - index info
     * @param {boolean} [useColorValue] - whether use colorValue or not
     */
    hideAnimation: function(indexes, useColorValue) {
        var colorSpectrum = this.colorSpectrum;
        var box = this.boxesSet[indexes.groupIndex][indexes.index];
        var opacity = 1;
        var color;

        if (!box) {
            return;
        }

        if (box.seriesItem.hasChild) {
            color = null;
            if (useColorValue) {
                opacity = 0;
            }
        } else {
            color = box.color;
        }

        this._animateChangingColor(box.rect, color, opacity);

        setTimeout(function() {
            if (!colorSpectrum && box.seriesItem.hasChild) {
                box.rect.toBack();
            }
        }, ANIMATION_DURATION);
    },

    /**
     * Resize.
     * @param {{
     *      dimension: {width: number, height: number},
     *      groupBounds: (Array.<Array.<object>>|object.<string, object>)
     * }} seriesData - data for graph rendering
     */
    resize: function(seriesData) {
        var self = this;
        var dimension = seriesData.dimension;

        this.boundMap = seriesData.boundMap;
        this.groupBounds = seriesData.groupBounds;
        this.paper.setSize(dimension.width, dimension.height);

        raphaelRenderUtil.forEach2dArray(this.boxesSet, function(box, groupIndex, index) {
            var bound;

            if (!box) {
                return;
            }

            bound = self._getBound(box.seriesItem, groupIndex, index);

            if (bound) {
                raphaelRenderUtil.updateRectBound(box.rect, bound);
            }
        });
    }
});

module.exports = RaphaelBoxTypeChart;

},{"./raphaelRenderUtil":85}],78:[function(require,module,exports){
/**
 * @fileoverview RaphaelCircleLegend is graph renderer for circleLegend.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var raphaelRenderUtil = require('./raphaelRenderUtil');

var raphael = window.Raphael;

/**
 * @classdesc RaphaelCircleLegend is graph renderer for circleLegend.
 * @class RaphaelCircleLegend
 */
var RaphaelCircleLegend = tui.util.defineClass(/** @lends RaphaelCircleLegend.prototype */ {
    /**
     * Render function of map chart legend.
     * @param {HTMLElement} container container
     * @param {{width: number, height: number}} dimension - dimension of circle legend area
     * @param {number} maxRadius - pixel type maximum radius
     * @param {Array.<number>} radiusRatios - radius ratios
     * @returns {object} paper raphael paper
     */
    render: function(container, dimension, maxRadius, radiusRatios) {
        var paper = raphael(container, dimension.width, dimension.height);

        this.paper = paper;

        this._renderCircles(dimension, maxRadius, radiusRatios);

        return paper;
    },

    /**
     * Render circles.
     * @param {{width: number, height: number}} dimension - dimension of circle legend area
     * @param {number} maxRadius - pixel type maximum radius
     * @param {Array.<number>} radiusRatios - radius ratios
     * @private
     */
    _renderCircles: function(dimension, maxRadius, radiusRatios) {
        var paper = this.paper;
        var left = dimension.width / 2;

        tui.util.forEachArray(radiusRatios, function(ratio) {
            var radius = maxRadius * ratio;
            var top = (dimension.height - radius) - 1;

            raphaelRenderUtil.renderCircle(paper, {
                left: left,
                top: top
            }, radius, {
                fill: 'none',
                opacity: 1,
                stroke: '#888',
                'stroke-width': 1
            });
        });
    }
});

module.exports = RaphaelCircleLegend;

},{"./raphaelRenderUtil":85}],79:[function(require,module,exports){
/**
 * @fileoverview Raphael bubble chart renderer.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';
var raphaelRenderUtil = require('./raphaelRenderUtil');

var raphael = window.Raphael;

var ANIMATION_DURATION = 700;
var CIRCLE_OPACITY = 0.5;
var STROKE_OPACITY = 0.3;
var EMPHASIS_OPACITY = 0.5;
var DE_EMPHASIS_OPACITY = 0.3;
var DEFAULT_LUMINANC = 0.2;
var OVERLAY_BORDER_WIDTH = 2;

/**
 * bound for circle
 * @typedef {{left: number, top: number, radius: number}} bound
 */

/**
 * Information for rendered circle
 * @typedef {{circle: object, color: string, bound: bound}} circleInfo
 */

/**
 * @classdesc RaphaelBubbleChart is graph renderer for bubble chart.
 * @class RaphaelBubbleChart
 */
var RaphaelBubbleChart = tui.util.defineClass(/** @lends RaphaelBubbleChart.prototype */ {
    /**
     * Render function of bubble chart
     * @param {HTMLElement} container - container element
     * @param {{
     *      dimension: {width: number, height: number},
     *      seriesDataModel: SeriesDataModel,
     *      groupBounds: Array.<Array.<bound>>,
     *      theme: object
     * }} data - data for rendering
     * @param {{showTooltip: function, hideTooltip: function}} callbacks - callbacks for toggle of tooltip.
     * @returns {object}
     */
    render: function(container, data, callbacks) {
        var dimension = data.dimension,
            paper;

        this.paper = paper = raphael(container, dimension.width, dimension.height);

        /**
         * container element
         * @type {HTMLElement}
         */
        this.container = container;

        /**
         * theme
         * @type {object}
         */
        this.theme = data.theme;

        /**
         * seriesDataModel
         * @type {SeriesDataModel}
         */
        this.seriesDataModel = data.seriesDataModel;

        /**
         * group bounds
         * @type {Array.<Array.<bound>>}
         */
        this.groupBounds = data.groupBounds;

        /**
         * callbacks for toggle of tooltip.
         * @type {{showTooltip: Function, hideTooltip: Function}}
         */
        this.callbacks = callbacks;

        /**
         * overlay is circle object of raphael, that using for mouseover.
         * @type {object}
         */
        this.overlay = this._renderOverlay();

        /**
         * two-dimensional array by circleInfo
         * @type {Array.<Array.<circleInfo>>}
         */
        this.groupCircleInfos = this._renderCircles();

        /**
         * previous selected circle
         * @type {?object}
         */
        this.prevCircle = null;

        /**
         * previous over circle
         * @type {?object}
         */
        this.prevOverCircle = null;

        /**
         * animation timeout id
         * @type {?number}
         */
        this.animationTimeoutId = null;

        return paper;
    },

    /**
     * Render overlay.
     * @returns {object}
     * @private
     */
    _renderOverlay: function() {
        var position = {
            left: 0,
            top: 0
        };
        var attribute = {
            fill: 'none',
            stroke: '#fff',
            'stroke-opacity': STROKE_OPACITY,
            'stroke-width': 2
        };
        var circle = raphaelRenderUtil.renderCircle(this.paper, position, 0, attribute);

        return circle;
    },

    /**
     * Render circles.
     * @returns {Array.<Array.<circleInfo>>}
     * @private
     */
    _renderCircles: function() {
        var self = this;
        var colors = this.theme.colors;
        var singleColors = [];

        if ((this.groupBounds[0].length === 1) && this.theme.singleColors) {
            singleColors = this.theme.singleColors;
        }

        return tui.util.map(this.groupBounds, function(bounds, groupIndex) {
            var singleColor = singleColors[groupIndex];

            return tui.util.map(bounds, function(bound, index) {
                var circleInfo = null;
                var color, circle;

                if (bound) {
                    color = singleColor || colors[index];
                    circle = raphaelRenderUtil.renderCircle(self.paper, bound, 0, {
                        fill: color,
                        opacity: 0,
                        stroke: 'none'
                    });

                    circle.data('groupIndex', groupIndex);
                    circle.data('index', index);

                    circleInfo = {
                        circle: circle,
                        color: color,
                        bound: bound
                    };
                }

                return circleInfo;
            });
        });
    },

    /**
     * Animate circle
     * @param {object} circle - raphael object
     * @param {number} radius - radius of circle
     * @private
     */
    _animateCircle: function(circle, radius) {
        circle.animate({
            r: radius,
            opacity: CIRCLE_OPACITY
        }, ANIMATION_DURATION);
    },

    /**
     * Animate.
     * @param {function} onFinish - finish callback function
     */
    animate: function(onFinish) {
        var self = this;

        if (this.animationTimeoutId) {
            clearTimeout(this.animationTimeoutId);
            this.animationTimeoutId = null;
        }

        raphaelRenderUtil.forEach2dArray(this.groupCircleInfos, function(circleInfo) {
            if (!circleInfo) {
                return;
            }
            self._animateCircle(circleInfo.circle, circleInfo.bound.radius);
        });

        if (onFinish) {
            this.animationTimeoutId = setTimeout(function() {
                onFinish();
                this.animationTimeoutId = null;
            }, ANIMATION_DURATION);
        }
    },

    /**
     * Update circle bound
     * @param {object} circle - raphael object
     * @param {{left: number, top: number}} bound - bound
     * @private
     */
    _updatePosition: function(circle, bound) {
        circle.attr({
            cx: bound.left,
            cy: bound.top,
            r: bound.radius
        });
    },

    /**
     * Resize graph of bubble type chart.
     * @param {object} params parameters
     *      @param {{width: number, height:number}} params.dimension - dimension
     *      @param {Array.<Array.<bound>>} params.groupBounds - group bounds
     */
    resize: function(params) {
        var self = this;
        var dimension = params.dimension;
        var groupBounds = params.groupBounds;

        this.groupBounds = groupBounds;
        this.paper.setSize(dimension.width, dimension.height);

        raphaelRenderUtil.forEach2dArray(this.groupCircleInfos, function(circleInfo, groupIndex, index) {
            var bound = groupBounds[groupIndex][index];

            circleInfo.bound = bound;
            self._updatePosition(circleInfo.circle, bound);
        });
    },

    /**
     * Click series.
     * @param {{left: number, top: number}} position mouse position
     */
    clickSeries: function(position) {
        var circle = this.paper.getElementByPoint(position.left, position.top);
        var prevCircle = this.prevCircle;

        if (circle && prevCircle) {
            this._unselectSeries(prevCircle.data('groupIndex'), prevCircle.data('index'));
        }

        if (prevCircle === circle) {
            this.prevCircle = null;
        } else if (circle) {
            this._selectSeries(circle.data('groupIndex'), circle.data('index'));
            this.prevCircle = circle;
        }
    },

    /**
     * Get series container bound.
     * @returns {{left: number, top: number, width: number, height: number}}
     * @private
     */
    _getContainerBound: function() {
        if (!this.containerBound) {
            this.containerBound = this.container.getBoundingClientRect();
        }

        return this.containerBound;
    },

    /**
     * Whether changed or not.
     * @param {{left: number, top: number}} prevPosition - previous position
     * @param {{left: number, top: number}} position - position
     * @returns {boolean} result boolean
     * @private
     */
    _isChangedPosition: function(prevPosition, position) {
        return !prevPosition || prevPosition.left !== position.left || prevPosition.top !== position.top;
    },

    /**
     * Show overlay when mouse over a circle.
     * @param {number} groupIndex - index of circles group
     * @param {number} index - index of circles
     * @private
     */
    _showOverlay: function(groupIndex, index) {
        var circleInfo = this.groupCircleInfos[groupIndex][index];
        var bound = circleInfo.bound;

        this.overlay.attr({
            cx: bound.left,
            cy: bound.top,
            r: bound.radius + OVERLAY_BORDER_WIDTH,
            stroke: circleInfo.color,
            opacity: 1
        });
    },

    /**
     * Hide overlay.
     * @private
     */
    _hideOverlay: function() {
        this.overlay.attr({
            cx: 0,
            cy: 0,
            r: 0,
            opacity: 0
        });
    },

    /**
     * Find circle.
     * @param {{left: number, top: number}} position - position
     * @returns {?object}
     * @private
     */
    _findCircle: function(position) {
        var circles = [];
        var paper = this.paper;
        var foundCircle, circle;

        while (tui.util.isUndefined(foundCircle)) {
            circle = paper.getElementByPoint(position.left, position.top);

            if (circle) {
                if (circle.attrs.opacity > DE_EMPHASIS_OPACITY) {
                    foundCircle = circle;
                } else {
                    circles.push(circle);
                    circle.hide();
                }
            } else {
                foundCircle = null;
            }
        }

        if (!foundCircle) {
            foundCircle = circles[0];
        }

        tui.util.forEachArray(circles, function(_circle) {
            _circle.show();
        });

        return foundCircle;
    },

    /**
     * Move mouse on series.
     * @param {{left: number, top: number}} position - mouse position
     */
    moveMouseOnSeries: function(position) {
        var circle = this._findCircle(position);
        var containerBound, isChanged, groupIndex, index, args;

        if (circle && tui.util.isExisty(circle.data('groupIndex'))) {
            containerBound = this._getContainerBound();
            isChanged = (this.prevOverCircle !== circle);
            groupIndex = circle.data('groupIndex');
            index = circle.data('index');
            args = [{}, groupIndex, index, {
                left: position.left - containerBound.left,
                top: position.top - containerBound.top
            }];

            if (isChanged) {
                this._showOverlay(groupIndex, index);
            }

            if (this._isChangedPosition(this.prevPosition, position)) {
                this.callbacks.showTooltip.apply(null, args);
                this.prevOverCircle = circle;
            }
        } else if (this.prevOverCircle) {
            this._hideOverlay();
            this.callbacks.hideTooltip();
            this.prevOverCircle = null;
        }
        this.prevPosition = position;
    },

    /**
     * Select series.
     * @param {number} groupIndex - index of group
     * @param {number} index - index
     */
    _selectSeries: function(groupIndex, index) {
        var circleInfo = this.groupCircleInfos[groupIndex][index];
        var objColor = raphael.color(circleInfo.color);
        var themeColor = this.theme.selectionColor;
        var color = themeColor || raphaelRenderUtil.makeChangedLuminanceColor(objColor.hex, DEFAULT_LUMINANC);

        circleInfo.circle.attr({
            fill: color
        });
    },

    /**
     * Unselect series.
     * @param {number} groupIndex - index of group
     * @param {number} index - index
     */
    _unselectSeries: function(groupIndex, index) {
        var circleInfo = this.groupCircleInfos[groupIndex][index];

        circleInfo.circle.attr({
            fill: circleInfo.color
        });
    },

    /**
     * Select legend.
     * @param {?number} legendIndex - index of legend
     */
    selectLegend: function(legendIndex) {
        var noneSelected = tui.util.isNull(legendIndex);

        raphaelRenderUtil.forEach2dArray(this.groupCircleInfos, function(circleInfo, groupIndex, index) {
            var opacity;

            if (!circleInfo) {
                return;
            }

            opacity = (noneSelected || legendIndex === index) ? EMPHASIS_OPACITY : DE_EMPHASIS_OPACITY;

            circleInfo.circle.attr({opacity: opacity});
        });
    }
});

module.exports = RaphaelBubbleChart;

},{"./raphaelRenderUtil":85}],80:[function(require,module,exports){
/**
 * @fileoverview Raphael line chart renderer.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var RaphaelLineBase = require('./raphaelLineTypeBase'),
    raphaelRenderUtil = require('./raphaelRenderUtil');

var EMPHASIS_OPACITY = 1;
var DE_EMPHASIS_OPACITY = 0.3;
var LEFT_BAR_WIDTH = 10;

var raphael = window.Raphael;

var RaphaelLineChart = tui.util.defineClass(RaphaelLineBase, /** @lends RaphaelLineChart.prototype */ {
    /**
     * RaphaelLineCharts is graph renderer for line chart.
     * @constructs RaphaelLineChart
     * @extends RaphaelLineTypeBase
     */
    init: function() {
        /**
         * selected legend index
         * @type {?number}
         */
        this.selectedLegendIndex = null;

        /**
         * type of chart
         * @type {string}
         */
        this.chartType = 'line';
    },

    /**
     * Render function of line chart.
     * @param {HTMLElement} container container
     * @param {{groupPositions: Array.<Array>, dimension: object, theme: object, options: object}} data render data
     * @param {object} [paper] - raphael paper
     * @returns {object} paper raphael paper
     */
    render: function(container, data, paper) {
        var dimension = data.dimension;
        var groupPositions = data.groupPositions;
        var theme = data.theme;
        var colors = theme.colors;
        var opacity = data.options.showDot ? 1 : 0;
        var isSpline = data.options.spline;
        var groupPaths = isSpline ? this._getSplineLinesPath(groupPositions) : this._getLinesPath(groupPositions);
        var borderStyle = this.makeBorderStyle(theme.borderColor, opacity);
        var outDotStyle = this.makeOutDotStyle(opacity, borderStyle);

        paper = paper || raphael(container, 1, dimension.height);

        this.paper = paper;
        this.isSpline = isSpline;
        this.dimension = dimension;

        this.groupLines = this._renderLines(paper, groupPaths, colors);
        this.leftBar = this._renderLeftBar(dimension.height, data.chartBackground);
        this.tooltipLine = this._renderTooltipLine(paper, dimension.height);
        this.groupDots = this._renderDots(paper, groupPositions, colors, opacity);

        if (data.options.allowSelect) {
            this.selectionDot = this._makeSelectionDot(paper);
            this.selectionColor = theme.selectionColor;
        }

        this.colors = colors;
        this.borderStyle = borderStyle;
        this.outDotStyle = outDotStyle;
        this.groupPositions = groupPositions;
        this.groupPaths = groupPaths;
        this.dotOpacity = opacity;
        delete this.pivotGroupDots;

        return paper;
    },

    /**
     * Get lines path.
     * @param {Array.<Array.<{left: number, top: number, startTop: number}>>} groupPositions positions
     * @returns {Array.<Array.<string>>} path
     * @private
     */
    _getLinesPath: function(groupPositions) {
        var self = this;

        return tui.util.map(groupPositions, function(positions) {
            return self._makeLinesPath(positions);
        });
    },

    /**
     * Get spline lines path.
     * @param {Array.<Array.<{left: number, top: number, startTop: number}>>} groupPositions positions
     * @returns {Array} path
     * @private
     */
    _getSplineLinesPath: function(groupPositions) {
        return tui.util.map(groupPositions, this._makeSplineLinesPath, this);
    },

    /**
     * Render lines.
     * @param {object} paper raphael paper
     * @param {Array.<Array.<string>>} groupPaths paths
     * @param {string[]} colors line colors
     * @param {?number} strokeWidth stroke width
     * @returns {Array.<Array.<object>>} lines
     * @private
     */
    _renderLines: function(paper, groupPaths, colors, strokeWidth) {
        return tui.util.map(groupPaths, function(path, groupIndex) {
            var color = colors[groupIndex] || 'transparent';
            return raphaelRenderUtil.renderLine(paper, path.join(' '), color, strokeWidth);
        });
    },

    /**
     * Resize graph of line chart.
     * @param {object} params parameters
     *      @param {{width: number, height:number}} params.dimension dimension
     *      @param {Array.<Array.<{left:number, top:number}>>} params.groupPositions group positions
     */
    resize: function(params) {
        var self = this,
            dimension = params.dimension,
            groupPositions = params.groupPositions;

        this.groupPositions = groupPositions;
        this.groupPaths = this.isSpline ? this._getSplineLinesPath(groupPositions) : this._getLinesPath(groupPositions);
        this.paper.setSize(dimension.width, dimension.height);
        this.tooltipLine.attr({top: dimension.height});

        tui.util.forEachArray(this.groupPaths, function(path, groupIndex) {
            self.groupLines[groupIndex].attr({path: path.join(' ')});

            tui.util.forEachArray(self.groupDots[groupIndex], function(item, index) {
                self._moveDot(item.endDot.dot, groupPositions[groupIndex][index]);
            });
        });
    },

    /**
     * Select legend.
     * @param {?number} legendIndex legend index
     */
    selectLegend: function(legendIndex) {
        var self = this,
            noneSelected = tui.util.isNull(legendIndex);

        this.selectedLegendIndex = legendIndex;

        tui.util.forEachArray(this.groupLines, function(line, groupIndex) {
            var opacity = (noneSelected || legendIndex === groupIndex) ? EMPHASIS_OPACITY : DE_EMPHASIS_OPACITY;

            line.attr({'stroke-opacity': opacity});

            tui.util.forEachArray(self.groupDots[groupIndex], function(item) {
                item.opacity = opacity;

                if (self.dotOpacity) {
                    item.endDot.dot.attr({'fill-opacity': opacity});
                }
            });
        });
    },

    /**
     * Animate for adding data.
     * @param {object} data - data for graph rendering
     * @param {number} tickSize - tick size
     * @param {Array.<Array.<object>>} groupPositions - group positions
     * @param {boolean} [shiftingOption] - shifting option
     */
    animateForAddingData: function(data, tickSize, groupPositions, shiftingOption) {
        var self = this;
        var isSpline = data.options.spline;
        var groupPaths = isSpline ? this._getSplineLinesPath(groupPositions) : this._getLinesPath(groupPositions);
        var additionalIndex = 0;

        if (!groupPositions.length) {
            return;
        }

        if (shiftingOption) {
            this.leftBar.animate({
                width: tickSize + LEFT_BAR_WIDTH
            }, 300);
            additionalIndex = 1;
        }

        tui.util.forEachArray(this.groupLines, function(line, groupIndex) {
            var dots = self.groupDots[groupIndex];
            var groupPosition = groupPositions[groupIndex];

            if (shiftingOption) {
                self._removeFirstDot(dots);
            }

            tui.util.forEachArray(dots, function(item, index) {
                var position = groupPosition[index + additionalIndex];
                self._animateByPosition(item.endDot.dot, position);
            });

            self._animateByPath(line, groupPaths[groupIndex]);
        });
    }
});

module.exports = RaphaelLineChart;

},{"./raphaelLineTypeBase":81,"./raphaelRenderUtil":85}],81:[function(require,module,exports){
/**
 * @fileoverview RaphaelLineTypeBase is base class for line type renderer.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var raphaelRenderUtil = require('./raphaelRenderUtil');

var ANIMATION_DURATION = 700;
var DEFAULT_DOT_RADIUS = 3;
var HOVER_DOT_RADIUS = 4;
var SELECTION_DOT_RADIUS = 7;
var DE_EMPHASIS_OPACITY = 0.3;
var MOVING_ANIMATION_DURATION = 300;
var LEFT_BAR_WIDTH = 10;

var concat = Array.prototype.concat;

/**
 * @classdesc RaphaelLineTypeBase is base for line type renderer.
 * @class RaphaelLineTypeBase
 */
var RaphaelLineTypeBase = tui.util.defineClass(/** @lends RaphaelLineTypeBase.prototype */ {
    /**
     * Render left bar for hiding overflow graph.
     * @param {number} height - area height
     * @param {string} chartBackground - background style of chart
     * @private
     * @returns {object}
     */
    _renderLeftBar: function(height, chartBackground) {
        var bound = {
            left: 0,
            top: 0,
            width: LEFT_BAR_WIDTH,
            height: height
        };

        return raphaelRenderUtil.renderRect(this.paper, bound, {
            fill: chartBackground,
            stroke: 'none'
        });
    },

    /**
     * Make lines path.
     * @param {Array.<{left: number, top: number, startTop: number}>} positions positions
     * @param {?string} posTopType position top type
     * @returns {Array.<string | number>} paths
     * @private
     */
    _makeLinesPath: function(positions, posTopType) {
        var path;

        posTopType = posTopType || 'top';
        path = tui.util.map(positions, function(position) {
            return ['L', position.left, position[posTopType]];
        });

        path = concat.apply([], path);
        path[0] = 'M';

        return path;
    },

    /**
     * Get anchor. (http://raphaeljs.com/analytics.js)
     * @param {{left: number, top: number}} fromPos from position
     * @param {{left: number, top: number}} pos position
     * @param {{left: number, top: number}} nextPos next position
     * @returns {{x1: number, y1: number, x2: number, y2: number}} anchor
     * @private
     */
    _getAnchor: function(fromPos, pos, nextPos) {
        var l1 = (pos.left - fromPos.left) / 2,
            l2 = (nextPos.left - pos.left) / 2,
            a = Math.atan((pos.left - fromPos.left) / Math.abs(pos.top - fromPos.top)),
            b = Math.atan((nextPos.left - pos.left) / Math.abs(pos.top - nextPos.top)),
            alpha, dx1, dy1, dx2, dy2;

        a = fromPos.top < pos.top ? Math.PI - a : a;
        b = nextPos.top < pos.top ? Math.PI - b : b;
        alpha = Math.PI / 2 - ((a + b) % (Math.PI * 2)) / 2;
        dx1 = l1 * Math.sin(alpha + a);
        dy1 = l1 * Math.cos(alpha + a);
        dx2 = l2 * Math.sin(alpha + b);
        dy2 = l2 * Math.cos(alpha + b);

        return {
            x1: pos.left - dx1,
            y1: pos.top + dy1,
            x2: pos.left + dx2,
            y2: pos.top + dy2
        };
    },

    /**
     * Make spline lines path.
     * @param {Array.<{left: number, top: number, startTop: number}>} positions positions
     * @returns {Array.<string | number>} paths
     * @private
     */
    _makeSplineLinesPath: function(positions) {
        var self = this;
        var firstPos = positions[0];
        var positionsLen = positions.length;
        var fromPos = firstPos;
        var lastPos = positions[positionsLen - 1];
        var middlePositions = positions.slice(1).slice(0, positionsLen - 2);
        var path = tui.util.map(middlePositions, function(position, index) {
            var nextPos = positions[index + 2];
            var anchor = self._getAnchor(fromPos, position, nextPos);

            fromPos = position;

            return [anchor.x1, anchor.y1, position.left, position.top, anchor.x2, anchor.y2];
        });

        path.push([lastPos.left, lastPos.top, lastPos.left, lastPos.top]);
        path.unshift(['M', firstPos.left, firstPos.top, 'C', firstPos.left, firstPos.top]);

        return path;
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
     * Make border style.
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
     * Make dot style for mouseout event.
     * @param {number} opacity opacity
     * @param {object} borderStyle border style
     * @returns {{fill-opacity: number, stroke-opacity: number, r: number}} style
     */
    makeOutDotStyle: function(opacity, borderStyle) {
        var outDotStyle = {
            'fill-opacity': opacity,
            'stroke-opacity': 0,
            r: DEFAULT_DOT_RADIUS
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
     * @param {number} opacity opacity
     * @returns {object} raphael dot
     */
    renderDot: function(paper, position, color, opacity) {
        var dot = paper.circle(position.left, position.top, DEFAULT_DOT_RADIUS),
            dotStyle = {
                fill: color,
                'fill-opacity': opacity,
                'stroke-opacity': 0
            };

        dot.attr(dotStyle);

        return {
            dot: dot,
            color: color
        };
    },

    /**
     * Move dots to front.
     * @param {Array.<{startDot: {dot: object}, endDot: {dot: object}}>} dots - dots
     * @private
     */
    _moveDotsToFront: function(dots) {
        raphaelRenderUtil.forEach2dArray(dots, function(dotInfo) {
            dotInfo.endDot.dot.toFront();
            if (dotInfo.startDot) {
                dotInfo.startDot.dot.toFront();
            }
        });
    },

    /**
     * Render dots.
     * @param {object} paper raphael paper
     * @param {Array.<Array.<object>>} groupPositions positions
     * @param {string[]} colors colors
     * @param {number} opacity opacity
     * @returns {Array.<object>} dots
     * @private
     */
    _renderDots: function(paper, groupPositions, colors, opacity) {
        var self = this;
        var dots;

        // 기존에 캐싱된 dot을 다른 도형에 의해 가려지지 않게 하기 위해 제일 앞으로 이동시킴
        if (paper.dots) {
            this._moveDotsToFront(paper.dots);
        }

        dots = tui.util.map(groupPositions, function(positions, groupIndex) {
            var color = colors[groupIndex];

            return tui.util.map(positions, function(position) {
                var dotMap = {
                    endDot: self.renderDot(paper, position, color, opacity)
                };
                var startPosition;

                if (self.hasRangeData) {
                    startPosition = tui.util.extend({}, position);
                    startPosition.top = startPosition.startTop;
                    dotMap.startDot = self.renderDot(paper, startPosition, color, opacity);
                }

                return dotMap;
            });
        });

        if (!paper.dots) {
            paper.dots = [];
        }

        // 다른 그래프 렌더링 시 앞으로 이동시키기 위해 paper에 캐싱함
        paper.dots = paper.dots.concat(dots);

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
     * Show dot.
     * @param {object} dot raphael object
     * @private
     */
    _showDot: function(dot) {
        dot.attr({
            'fill-opacity': 1,
            'stroke-opacity': 0.3,
            'stroke-width': 2,
            r: HOVER_DOT_RADIUS
        });
    },

    /**
     * Update line stroke width.
     * @param {object} line raphael object
     * @param {number} strokeWidth stroke width
     * @private
     */
    _updateLineStrokeWidth: function(line, strokeWidth) {
        line.attr({
            'stroke-width': strokeWidth
        });
    },

    /**
     * Show animation.
     * @param {{groupIndex: number, index:number}} data show info
     */
    showAnimation: function(data) {
        var index = data.groupIndex; // Line chart has pivot values.
        var groupIndex = data.index;
        var line = this.groupLines ? this.groupLines[groupIndex] : this.groupAreas[groupIndex];
        var item = this.groupDots[groupIndex][index];
        var strokeWidth, startLine;

        if (!item) {
            return;
        }

        if (this.chartType === 'area') {
            strokeWidth = 2;
            startLine = line.startLine;
            line = line.line;
        } else {
            strokeWidth = 3;
        }

        this._updateLineStrokeWidth(line, strokeWidth);

        if (startLine) {
            this._updateLineStrokeWidth(startLine, strokeWidth);
        }

        this._showDot(item.endDot.dot);

        if (item.startDot) {
            this._showDot(item.startDot.dot);
        }
    },

    /**
     * Get pivot group dots.
     * @returns {Array.<Array>} dots
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
        var self = this;
        var groupDots = this._getPivotGroupDots();

        if (!groupDots[index]) {
            return;
        }

        tui.util.forEachArray(groupDots[index], function(item) {
            self._showDot(item.endDot.dot);

            if (item.startDot) {
                self._showDot(item.startDot.dot);
            }
        });
    },

    /**
     * Show line for group tooltip.
     * @param {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} bound bound
     */
    showGroupTooltipLine: function(bound) {
        var linePath = raphaelRenderUtil.makeLinePath({
            left: bound.position.left,
            top: bound.position.top + bound.dimension.height
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
     */
    showGroupAnimation: function(index) {
        this._showGroupDots(index);
    },

    /**
     * Hide dot.
     * @param {object} dot raphael object
     * @param {?number} opacity opacity
     * @private
     */
    _hideDot: function(dot, opacity) {
        var outDotStyle = this.outDotStyle;

        if (!tui.util.isUndefined(opacity)) {
            outDotStyle = tui.util.extend({}, this.outDotStyle, {
                'fill-opacity': opacity
            });
        }

        dot.attr(outDotStyle);
    },

    /**
     * Hide animation.
     * @param {{groupIndex: number, index:number}} data hide info
     */
    hideAnimation: function(data) {
        var index = data.groupIndex; // Line chart has pivot values.
        var groupIndex = data.index;
        var opacity = this.dotOpacity;
        var groupDot = this.groupDots[groupIndex];
        var line, item, strokeWidth, startLine;

        if (!groupDot || !groupDot[index]) {
            return;
        }

        line = this.groupLines ? this.groupLines[groupIndex] : this.groupAreas[groupIndex];
        item = groupDot[index];

        if (this.chartType === 'area') {
            strokeWidth = 1;
            startLine = line.startLine;
            line = line.line;
        } else {
            strokeWidth = 2;
        }

        if (opacity && !tui.util.isNull(this.selectedLegendIndex) && this.selectedLegendIndex !== groupIndex) {
            opacity = DE_EMPHASIS_OPACITY;
        }

        if (line) {
            this._updateLineStrokeWidth(line, strokeWidth);
        }

        if (startLine) {
            this._updateLineStrokeWidth(startLine, strokeWidth);
        }

        if (item) {
            this._hideDot(item.endDot.dot, opacity);

            if (item.startDot) {
                this._hideDot(item.startDot.dot, opacity);
            }
        }
    },

    /**
     * Hide group dots.
     * @param {number} index index
     * @private
     */
    _hideGroupDots: function(index) {
        var self = this;
        var groupDots = this._getPivotGroupDots();
        var hasSelectedIndex = !tui.util.isNull(this.selectedLegendIndex);
        var baseOpacity = this.dotOpacity;

        if (!groupDots[index]) {
            return;
        }

        tui.util.forEachArray(groupDots[index], function(item, groupIndex) {
            var opacity = baseOpacity;

            if (opacity && hasSelectedIndex && self.selectedLegendIndex !== groupIndex) {
                opacity = DE_EMPHASIS_OPACITY;
            }

            self._hideDot(item.endDot.dot, opacity);

            if (item.startDot) {
                self._hideDot(item.startDot.dot, opacity);
            }
        });
    },

    /**
     * Hide line for group tooltip.
     */
    hideGroupTooltipLine: function() {
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
    },

    _moveDot: function(dot, position) {
        var dotAttrs = {
            cx: position.left,
            cy: position.top
        };

        if (this.dotOpacity) {
            dotAttrs = tui.util.extend({'fill-opacity': this.dotOpacity}, dotAttrs, this.borderStyle);
        }

        dot.attr(dotAttrs);
    },

    /**
     * Show graph for zoom.
     */
    showGraph: function() {
        this.paper.setSize(this.dimension.width, this.dimension.height);
    },

    /**
     * Animate.
     * @param {function} onFinish callback
     */
    animate: function(onFinish) {
        var self = this,
            seriesWidth = this.dimension.width,
            seriesHeight = this.dimension.height;

        tui.chart.renderUtil.cancelAnimation(this.animation);

        this.animation = tui.chart.renderUtil.startAnimation(ANIMATION_DURATION, function(ratio) {
            var width = Math.min(seriesWidth * ratio, seriesWidth);

            self.paper.setSize(width, seriesHeight);

            if (ratio === 1) {
                onFinish();
            }
        });
    },

    /**
     * Make selection dot.
     * @param {object} paper raphael paper
     * @returns {object} selection dot
     * @private
     */
    _makeSelectionDot: function(paper) {
        var selectionDot = paper.circle(0, 0, SELECTION_DOT_RADIUS);

        selectionDot.attr({
            'fill': '#ffffff',
            'fill-opacity': 0,
            'stroke-opacity': 0,
            'stroke-width': 2
        });

        return selectionDot;
    },

    /**
     * Select series.
     * @param {{groupIndex: number, index: number}} indexes indexes
     */
    selectSeries: function(indexes) {
        var item = this.groupDots[indexes.index][indexes.groupIndex],
            position = this.groupPositions[indexes.index][indexes.groupIndex];

        this.selectedItem = item;
        this.selectionDot.attr({
            cx: position.left,
            cy: position.top,
            'fill-opacity': 0.5,
            'stroke-opacity': 1,
            stroke: this.selectionColor || item.dot.color
        });

        if (this.selectionStartDot) {
            this.selectionStartDot.attr({
                cx: position.left,
                cy: position.startTop,
                'fill-opacity': 0.5,
                'stroke-opacity': 1,
                stroke: this.selectionColor || item.startDot.color
            });
        }
    },

    /**
     * Unselect series.
     * @param {{groupIndex: number, index: number}} indexes indexes
     */
    unselectSeries: function(indexes) {
        var item = this.groupDots[indexes.index][indexes.groupIndex];

        if (this.selectedItem === item) {
            this.selectionDot.attr({
                'fill-opacity': 0,
                'stroke-opacity': 0
            });
        }

        if (this.selectionStartDot) {
            this.selectionStartDot.attr({
                'fill-opacity': 0,
                'stroke-opacity': 0
            });
        }
    },

    /**
     * Set width or height of paper.
     * @param {number} width - width
     * @param {number} height - height
     */
    setSize: function(width, height) {
        width = width || this.dimension.width;
        height = height || this.dimension.height;
        this.paper.setSize(width, height);
    },

    /**
     * Animate by position.
     * @param {object} raphaelObj - raphael object
     * @param {{left: number, top: number}} position - position
     * @private
     */
    _animateByPosition: function(raphaelObj, position) {
        raphaelObj.animate({
            cx: position.left,
            cy: position.top
        }, MOVING_ANIMATION_DURATION);
    },

    /**
     * Animate by path.
     * @param {object} raphaelObj - raphael object
     * @param {Array.<string | number>} paths - paths
     * @private
     */
    _animateByPath: function(raphaelObj, paths) {
        raphaelObj.animate({
            path: paths.join(' ')
        }, MOVING_ANIMATION_DURATION);
    },

    /**
     * Remove first dot.
     * @param {Array.<object>} dots - dots
     * @private
     */
    _removeFirstDot: function(dots) {
        var firstDot = dots.shift();

        firstDot.endDot.dot.remove();

        if (firstDot.startDot) {
            firstDot.startDot.dot.remove();
        }
    },

    /**
     * Clear paper.
     */
    clear: function() {
        delete this.paper.dots;
        this.paper.clear();
    }
});

module.exports = RaphaelLineTypeBase;

},{"./raphaelRenderUtil":85}],82:[function(require,module,exports){
/**
 * @fileoverview RaphaelPieCharts is graph renderer for map chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var raphaelRenderUtil = require('./raphaelRenderUtil');

var raphael = window.Raphael;

var STROKE_COLOR = 'gray';
var ANIMATION_DURATION = 100;

/**
 * @classdesc RaphaelMapCharts is graph renderer for map chart.
 * @class RaphaelMapChart
 */
var RaphaelMapChart = tui.util.defineClass(/** @lends RaphaelMapChart.prototype */ {
    /**
     * Render function of map chart.
     * @param {HTMLElement} container container
     * @param {object} data data
     *      @param {{width: number, height: number}} data.dimension series dimension
     *      @param {Array.<{code: string, path: string}>} data.map mapData
     *      @param {ColorSpectrum} data.colorSpectrum color model
     * @returns {object} paper raphael paper
     */
    render: function(container, data) {
        var dimension = data.dimension,
            mapDimension = data.mapModel.getMapDimension(),
            paper;

        this.paper = paper = raphael(container, dimension.width, dimension.height);
        this.sectors = this._renderMap(data);
        this.overColor = data.theme.overColor;

        paper.setViewBox(0, 0, mapDimension.width, mapDimension.height, false);

        return paper;
    },

    /**
     * Render map graph.
     * @param {object} data data
     *      @param {{width: number, height: number}} data.dimension series dimension
     *      @param {Array.<{code: string, path: string}>} data.map mapData
     *      @param {ColorSpectrum} data.colorSpectrum color model
     * @returns {Array.<{sector: object, color: string, data: object}>} rendered map information
     * @private
     */
    _renderMap: function(data) {
        var paper = this.paper,
            colorSpectrum = data.colorSpectrum;

        return tui.util.map(data.mapModel.getMapData(), function(datum, index) {
            var ratio = datum.ratio || 0,
                color = colorSpectrum.getColor(ratio),
                sector = raphaelRenderUtil.renderArea(paper, datum.path, {
                    fill: color,
                    opacity: 1,
                    stroke: STROKE_COLOR,
                    'stroke-opacity': 1
                });

            sector.data('index', index);

            return {
                sector: sector,
                color: color,
                ratio: datum.ratio
            };
        });
    },

    /**
     * Find sector index.
     * @param {{left: number, top: number}} position position
     * @returns {?number} found index
     */
    findSectorIndex: function(position) {
        var sector = this.paper.getElementByPoint(position.left, position.top),
            foundIndex = sector && sector.data('index'),
            data = !tui.util.isUndefined(foundIndex) && this.sectors[foundIndex];

        return data && !tui.util.isUndefined(data.ratio) ? foundIndex : null;
    },

    /**
     * Change color.
     * @param {number} index index
     */
    changeColor: function(index) {
        var sector = this.sectors[index];

        sector.sector.animate({
            fill: this.overColor
        }, ANIMATION_DURATION);
    },

    /**
     * Restore color.
     * @param {number} index index
     */
    restoreColor: function(index) {
        var sector = this.sectors[index];

        sector.sector.animate({
            fill: sector.color
        }, ANIMATION_DURATION);
    },

    /**
     * Set size
     * @param {{width: number, height: number}} dimension dimension
     */
    setSize: function(dimension) {
        this.paper.setSize(dimension.width, dimension.height);
    }
});

module.exports = RaphaelMapChart;

},{"./raphaelRenderUtil":85}],83:[function(require,module,exports){
/**
 * @fileoverview RaphaelMapLegend is graph renderer for map chart legend.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

/*eslint no-magic-numbers: 0*/

var raphaelRenderUtil = require('./raphaelRenderUtil');

var raphael = window.Raphael;

var PADDING = 10;

/**
 * @classdesc RaphaelMapLegend is graph renderer for map chart legend.
 * @class RaphaelMapLegend
 */
var RaphaelMapLegend = tui.util.defineClass(/** @lends RaphaelMapLegend.prototype */ {
    /**
     * Render function of map chart legend.
     * @param {HTMLElement} container container
     * @param {{width: number, height: number}} dimension legend dimension
     * @param {ColorSpectrum} colorSpectrum map chart color model
     * @param {boolean} isHorizontal whether horizontal legend or not
     * @returns {object} paper raphael paper
     */
    render: function(container, dimension, colorSpectrum, isHorizontal) {
        var paper = raphael(container, dimension.width, dimension.height);

        this._renderGradientBar(paper, dimension, colorSpectrum, isHorizontal);
        this.wedge = this._renderWedge(paper);

        return paper;
    },

    /**
     * Render gradient bar.
     * @param {object} paper raphael object
     * @param {{width: number, height: number}} dimension legend dimension
     * @param {ColorSpectrum} colorSpectrum map chart color model
     * @param {boolean} isHorizontal whether horizontal legend or not
     * @private
     */
    _renderGradientBar: function(paper, dimension, colorSpectrum, isHorizontal) {
        var rectHeight = dimension.height;
        var left = 0;
        var degree, bound;

        if (isHorizontal) {
            rectHeight -= PADDING;
            left = PADDING / 2;
            degree = 360;
            this._makeWedghPath = this._makeHorizontalWedgePath;
        } else {
            degree = 270;
            this._makeWedghPath = this._makeVerticalWedgePath;
        }

        bound = {
            left: left,
            top: 0,
            width: dimension.width - PADDING,
            height: rectHeight
        };

        raphaelRenderUtil.renderRect(paper, bound, {
            fill: degree + '-' + colorSpectrum.start + '-' + colorSpectrum.end,
            stroke: 'none'
        });
    },

    /**
     * Render wedge.
     * @param {object} paper raphael object
     * @returns {object} raphael object
     * @private
     */
    _renderWedge: function(paper) {
        var wedge = paper.path(this.verticalBasePath).attr({
            'fill': 'gray',
            stroke: 'none',
            opacity: 0
        });

        return wedge;
    },

    /**
     * Vertical base path
     * @type {Array}
     */
    verticalBasePath: ['M', 16, 6, 'L', 24, 3, 'L', 24, 9],

    /**
     * Make vertical wedge path.
     * @param {number} top top
     * @returns {Array} path
     * @private
     */
    _makeVerticalWedgePath: function(top) {
        var path = this.verticalBasePath;

        path[2] = top;
        path[5] = top - 3;
        path[8] = top + 3;

        return path;
    },

    /**
     * Horizontal base path
     * @type {Array}
     */
    horizontalBasePath: ['M', 5, 16, 'L', 8, 24, 'L', 2, 24],

    /**
     * Make horizontal wedge path.
     * @param {number} left left
     * @returns {Array} path
     * @private
     */
    _makeHorizontalWedgePath: function(left) {
        var path = this.horizontalBasePath;

        left += PADDING / 2;

        path[1] = left;
        path[4] = left + 3;
        path[7] = left - 3;

        return path;
    },

    /**
     * Show wedge.
     * @param {number} positionValue top
     */
    showWedge: function(positionValue) {
        var path = this._makeWedghPath(positionValue);

        this.wedge.attr({
            path: path,
            opacity: 1
        });
    },

    /**
     * Hide wedge
     */
    hideWedge: function() {
        this.wedge.attr({
            opacity: 0
        });
    }
});

module.exports = RaphaelMapLegend;

},{"./raphaelRenderUtil":85}],84:[function(require,module,exports){
/**
 * @fileoverview RaphaelPieCharts is graph renderer for pie chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var raphaelRenderUtil = require('./raphaelRenderUtil');

var raphael = window.Raphael;

var DEGREE_180 = 180;
var DEGREE_360 = 360;
var MIN_DEGREE = 0.01;
var RAD = Math.PI / DEGREE_180;
var LOADING_ANIMATION_DURATION = 700;
var EMPHASIS_OPACITY = 1;
var DE_EMPHASIS_OPACITY = 0.3;
var DEFAULT_LUMINANC = 0.2;
var OVERLAY_ID = 'overlay';

/**
 * @classdesc RaphaelPieCharts is graph renderer for pie chart.
 * @class RaphaelPieChart
 */
var RaphaelPieChart = tui.util.defineClass(/** @lends RaphaelPieChart.prototype */ {
    /**
     * Render function of pie chart.
     * @param {HTMLElement} container container
     * @param {{
     *      sectorData: Array.<object>,
     *      circleBound: {cx: number, cy: number, r: number},
     *      dimension: object, theme: object, options: object
     * }} data render data
     * @param {object} callbacks callbacks
     *      @param {function} callbacks.showTooltip show tooltip function
     *      @param {function} callbacks.hideTooltip hide tooltip function
     * @returns {object} paper raphael paper
     */
    render: function(container, data, callbacks) {
        var dimension = data.dimension;
        var paper;

        /**
         * raphael object
         * @type {object}
         */
        if (data.paper) {
            this.paper = paper = data.paper;
        } else {
            this.paper = paper = raphael(container, dimension.width, dimension.height);
        }

        /**
         * series container
         * @type {HTMLElement}
         */
        this.container = container;

        /**
         * ratio for hole
         * @type {number}
         */
        this.holeRatio = data.options.radiusRange[0];

        /**
         * base background
         * @type {string}
         */
        this.chartBackground = data.chartBackground;

        /**
         * type of chart
         * @type {string}
         */
        this.chartType = data.chartType;

        /**
         * functions for tooltip control
         * @type {{showTooltip: Function, hideTooltip: Function}}
         */
        this.callbacks = callbacks;

        /**
         * color for selection
         * @type {string}
         */
        this.selectionColor = data.theme.selectionColor;

        /**
         * bound for circle
         * @type {{cx: number, cy: number, r: number}}
         */
        this.circleBound = data.circleBound;

        /**
         * sector attr's name for draw graph
         * @type {string}
         */
        this.sectorName = 'sector_' + this.chartType;

        this._setSectorAttr();

        this.sectorInfos = this._renderPie(data.sectorData, data.theme.colors);
        this.overlay = this._renderOverlay();

        /**
         * bound of container
         * @type {{left: number, top: number}}
         */
        this.containerBound = null;

        /**
         * selected previous sector
         * @type {object}
         */
        this.prevSelectedSector = null;

        /**
         * previous mouse position
         * @type {{left: number, top: number}}
         */
        this.prevPosition = null;

        /**
         * previous hover sector
         * @type {object}
         */
        this.prevHoverSector = null;

        return paper;
    },

    /**
     * Clear paper.
     */
    clear: function() {
        this.legendLines = null;
        this.paper.clear();
    },

    /**
     * Make sector path.
     * @param {number} cx center x
     * @param {number} cy center y
     * @param {number} r radius
     * @param {number} startAngle start angle
     * @param {number} endAngle end angel
     * @returns {{path: Array}} sector path
     * @private
     */
    _makeSectorPath: function(cx, cy, r, startAngle, endAngle) {
        var startRadian = startAngle * RAD;
        var endRadian = endAngle * RAD;
        var x1 = cx + r * Math.sin(startRadian); // 원 호의 시작 x 좌표
        var y1 = cy - r * Math.cos(startRadian); // 원 호의 시작 y 좌표
        var x2 = cx + r * Math.sin(endRadian); // 원 호의 종료 x 좌표
        var y2 = cy - r * Math.cos(endRadian); // 원 호의 종료 y 좌표
        var largeArcFlag = endAngle - startAngle > DEGREE_180 ? 1 : 0;
        var path = ['M', cx, cy,
            'L', x1, y1,
            'A', r, r, 0, largeArcFlag, 1, x2, y2,
            'Z'
        ];

        // path에 대한 자세한 설명은 아래 링크를 참고
        // http://www.w3schools.com/svg/svg_path.asp
        // https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d
        return {path: path};
    },

    /**
     * Make sector path for donut chart.
     * @param {number} cx - center x
     * @param {number} cy - center y
     * @param {number} r - radius
     * @param {number} startAngle - start angle
     * @param {number} endAngle - end angel
     * @param {number} [holeRadius] - hole radius
     * @returns {{path: Array}} sector path
     * @private
     */
    _makeDonutSectorPath: function(cx, cy, r, startAngle, endAngle, holeRadius) {
        /*eslint max-params: [2, 6]*/
        var startRadian = startAngle * RAD;
        var endRadian = endAngle * RAD;
        var r2 = holeRadius || (r * this.holeRatio); // 구멍 반지름
        var x1 = cx + r * Math.sin(startRadian);
        var y1 = cy - r * Math.cos(startRadian);
        var x2 = cx + r2 * Math.sin(startRadian);
        var y2 = cy - r2 * Math.cos(startRadian);
        var x3 = cx + r * Math.sin(endRadian);
        var y3 = cy - r * Math.cos(endRadian);
        var x4 = cx + r2 * Math.sin(endRadian);
        var y4 = cy - r2 * Math.cos(endRadian);
        var largeArcFlag = endAngle - startAngle > DEGREE_180 ? 1 : 0;
        var path = [
            'M', x1, y1,
            'A', r, r, 0, largeArcFlag, 1, x3, y3,
            'L', x4, y4,
            'A', r2, r2, 0, largeArcFlag, 0, x2, y2,
            'Z'
        ];

        return {path: path};
    },

    /**
     * Set sector attribute for raphael paper.
     * @private
     */
    _setSectorAttr: function() {
        var makeSectorPath;

        if (this.paper.customAttributes[this.sectorName]) {
            return;
        }

        if (this.holeRatio) {
            makeSectorPath = this._makeDonutSectorPath;
        } else {
            makeSectorPath = this._makeSectorPath;
        }

        this.paper.customAttributes[this.sectorName] = tui.util.bind(makeSectorPath, this);
    },

    /**
     * Render overlay.
     * @returns {object} raphael object
     * @private
     */
    _renderOverlay: function() {
        var params = {
            paper: this.paper,
            circleBound: {
                cx: 0,
                cy: 0,
                r: 0
            },
            angles: {
                startAngle: 0,
                endAngle: 0
            },
            attrs: {
                fill: 'none',
                opacity: 0,
                stroke: this.chartBackground,
                'stroke-width': 1
            }
        };
        var inner = this._renderSector(params);

        inner.data('id', OVERLAY_ID);
        inner.data('chartType', this.chartType);

        return {
            inner: inner,
            outer: this._renderSector(params)
        };
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
    _renderSector: function(params) {
        var circleBound = params.circleBound;
        var angles = params.angles;
        var attrs = params.attrs;

        attrs[this.sectorName] = [circleBound.cx, circleBound.cy, circleBound.r, angles.startAngle, angles.endAngle];

        return params.paper.path().attr(attrs);
    },

    /**
     * Render pie graph.
     * @param {Array.<object>} sectorData - sectorData
     * @param {Array.<string>} colors - sector colors
     * @returns {Array.<object>}
     * @private
     */
    _renderPie: function(sectorData, colors) {
        var self = this;
        var circleBound = this.circleBound;
        var chartBackground = this.chartBackground;
        var sectorInfos = [];

        tui.util.forEachArray(sectorData, function(sectorDatum, index) {
            var ratio = sectorDatum.ratio;
            var color = colors[index];
            var sector = self._renderSector({
                paper: self.paper,
                circleBound: circleBound,
                angles: sectorDatum.angles.start,
                attrs: {
                    fill: chartBackground,
                    stroke: chartBackground,
                    'stroke-width': 1
                }
            });
            sector.data('index', index);
            sector.data('chartType', self.chartType);

            sectorInfos.push({
                sector: sector,
                color: color,
                angles: sectorDatum.angles.end,
                ratio: ratio
            });
        });

        return sectorInfos;
    },

    /**
     * Render legend lines.
     * @param {Array.<object>} outerPositions outer position
     */
    renderLegendLines: function(outerPositions) {
        var paper = this.paper,
            paths;

        if (!this.legendLines) {
            paths = this._makeLinePaths(outerPositions);
            this.legendLines = tui.util.map(paths, function(path) {
                return raphaelRenderUtil.renderLine(paper, path, 'transparent', 1);
            });
        }
    },

    /**
     * Make line paths.
     * @param {Array.<object>} outerPositions outer positions
     * @returns {Array} line paths.
     * @private
     */
    _makeLinePaths: function(outerPositions) {
        var paths = tui.util.map(outerPositions, function(positions) {
            return [
                raphaelRenderUtil.makeLinePath(positions.start, positions.middle),
                raphaelRenderUtil.makeLinePath(positions.middle, positions.end),
                'Z'
            ].join('');
        });

        return paths;
    },

    /**
     * Show overlay.
     * @param {number} index - index
     * @private
     */
    _showOverlay: function(index) {
        var overlay = this.overlay;
        var sectorInfo = this.sectorInfos[index];
        var sa = sectorInfo.angles.startAngle;
        var ea = sectorInfo.angles.endAngle;
        var cb = this.circleBound;
        var innerAttrs;

        innerAttrs = {
            fill: '#fff',
            opacity: 0.3
        };
        innerAttrs[this.sectorName] = [cb.cx, cb.cy, cb.r, sa, ea, cb.r * this.holeRatio];
        overlay.inner.attr(innerAttrs);
        overlay.inner.data('index', index);
        overlay.outer.attr({
            path: this._makeDonutSectorPath(cb.cx, cb.cy, cb.r + 10, sa, ea, cb.r).path,
            fill: sectorInfo.color,
            opacity: 0.3
        });
    },

    /**
     * Hide overlay.
     * @private
     */
    _hideOverlay: function() {
        var overlay = this.overlay;
        var attrs = {
            fill: 'none',
            opacity: 0
        };

        overlay.inner.attr(attrs);
        overlay.outer.attr(attrs);
    },

    /**
     * Animate.
     * @param {function} callback callback
     */
    animate: function(callback) {
        var delayTime = 0;
        var sectorName = this.sectorName;
        var circleBound = this.circleBound;
        var sectorArgs = [circleBound.cx, circleBound.cy, circleBound.r];

        tui.util.forEachArray(this.sectorInfos, function(sectorInfo) {
            var angles = sectorInfo.angles;
            var attrMap = {
                fill: sectorInfo.color
            };
            var animationTime = LOADING_ANIMATION_DURATION * sectorInfo.ratio;
            var anim;

            if ((angles.startAngle === 0) && (angles.endAngle === DEGREE_360)) {
                angles.endAngle = DEGREE_360 - MIN_DEGREE;
            }

            attrMap[sectorName] = sectorArgs.concat([angles.startAngle, angles.endAngle]);
            anim = raphael.animation(attrMap, animationTime);
            sectorInfo.sector.animate(anim.delay(delayTime));
            delayTime += animationTime;
        });

        if (callback) {
            setTimeout(callback, delayTime);
        }
    },

    /**
     * Animate legend lines.
     * @param {?number} legendIndex legend index
     */
    animateLegendLines: function(legendIndex) {
        var isNull;

        if (!this.legendLines) {
            return;
        }

        isNull = tui.util.isNull(legendIndex);

        tui.util.forEachArray(this.legendLines, function(line, index) {
            var opacity = (isNull || legendIndex === index) ? EMPHASIS_OPACITY : DE_EMPHASIS_OPACITY;

            line.animate({
                'stroke': 'black',
                'stroke-opacity': opacity
            });
        });
    },

    /**
     * Resize graph of pie chart.
     * @param {object} params parameters
     *      @param {{width: number, height:number}} params.dimension dimension
     *      @param {{cx:number, cy:number, r: number}} params.circleBound circle bound
     */
    resize: function(params) {
        var dimension = params.dimension;
        var circleBound = params.circleBound;
        var sectorName = this.sectorName;

        this.circleBound = circleBound;
        this.paper.setSize(dimension.width, dimension.height);
        this.containerBound = null;

        tui.util.forEachArray(this.sectorInfos, function(sectorInfo) {
            var angles = sectorInfo.angles;
            var attrs = {};
            attrs[sectorName] = [circleBound.cx, circleBound.cy, circleBound.r, angles.startAngle, angles.endAngle];
            sectorInfo.sector.attr(attrs);
        });
    },

    /**
     * Move legend lines.
     * @param {Array.<object>} outerPositions outer positions
     */
    moveLegendLines: function(outerPositions) {
        var paths;

        if (!this.legendLines) {
            return;
        }

        paths = this._makeLinePaths(outerPositions);
        tui.util.forEachArray(this.legendLines, function(line, index) {
            line.attr({path: paths[index]});

            return line;
        });
    },

    /**
     * Whether valid sector or not.
     * @param {object} sector - raphael object
     * @returns {boolean}
     * @private
     */
    _isValidSector: function(sector) {
        return sector && sector.data('chartType') === this.chartType;
    },

    /**
     * Whether detected label element or not.
     * @param {{left: number, top: number}} position - mouse position
     * @returns {boolean}
     * @private
     */
    _isDetectedLabel: function(position) {
        var labelElement = document.elementFromPoint(position.left, position.top);

        return tui.util.isString(labelElement.className);
    },

    /**
     * Click series.
     * @param {{left: number, top: number}} position mouse position
     */
    clickSeries: function(position) {
        var sector = this.paper.getElementByPoint(position.left, position.top);
        var prevSector = this.prevSelectedSector;
        var sectorIndex;

        if ((sector || this._isDetectedLabel(position)) && this.prevSelectedSector) {
            this._unselectSeries(this.prevSelectedSector.data('index'));
            this.prevSelectedSector = null;
        }

        if (!this._isValidSector(sector)) {
            return;
        }

        sectorIndex = sector.data('index');
        sector = this.sectorInfos[sectorIndex].sector;

        if (sector !== prevSector) {
            this._selectSeries(sectorIndex);
            this.prevSelectedSector = sector;
        }
    },


    /**
     * Get series container bound.
     * @returns {{left: number, top: number}} container bound
     * @private
     */
    _getContainerBound: function() {
        if (!this.containerBound) {
            this.containerBound = this.container.getBoundingClientRect();
        }

        return this.containerBound;
    },

    /**
     * Whether changed or not.
     * @param {{left: number, top: number}} prevPosition previous position
     * @param {{left: number, top: number}} position position
     * @returns {boolean} result boolean
     * @private
     */
    _isChangedPosition: function(prevPosition, position) {
        return !prevPosition || prevPosition.left !== position.left || prevPosition.top !== position.top;
    },

    /**
     * Show tooltip.
     * @param {object} sector - raphael object
     * @param {{left: number, top: number}} position - mouse position
     * @private
     */
    _showTooltip: function(sector, position) {
        var containerBound = this._getContainerBound();
        var args = [{}, 0, sector.data('index'), {
            left: position.left - containerBound.left,
            top: position.top - containerBound.top
        }];
        this.callbacks.showTooltip.apply(null, args);
    },

    /**
     * Move mouse on series.
     * @param {{left: number, top: number}} position mouse position
     */
    moveMouseOnSeries: function(position) {
        var sector = this.paper.getElementByPoint(position.left, position.top);

        if (this._isValidSector(sector)) {
            if (this.prevHoverSector !== sector) {
                this._showOverlay(sector.data('index'));
                this.prevHoverSector = sector;
            }

            if (this._isChangedPosition(this.prevPosition, position)) {
                this._showTooltip(sector, position);
            }
        } else if (this.prevHoverSector) {
            this._hideOverlay();
            this.callbacks.hideTooltip();
            this.prevHoverSector = null;
        }

        this.prevPosition = position;
    },

    /**
     * Select series.
     * @param {number} index index
     * @private
     */
    _selectSeries: function(index) {
        var sectorInfo = this.sectorInfos[index];
        var objColor, color;

        if (!sectorInfo) {
            return;
        }

        objColor = raphael.color(sectorInfo.color);
        color = this.selectionColor || raphaelRenderUtil.makeChangedLuminanceColor(objColor.hex, DEFAULT_LUMINANC);

        sectorInfo.sector.attr({
            fill: color
        });
    },

    /**
     * Unelect series.
     * @param {number} index index
     * @private
     */
    _unselectSeries: function(index) {
        var sectorInfo = this.sectorInfos[index];

        if (!sectorInfo) {
            return;
        }

        sectorInfo.sector.attr({
            fill: sectorInfo.color
        });
    },

    /**
     * Select legend.
     * @param {?number} legendIndex legend index
     */
    selectLegend: function(legendIndex) {
        var isNull = tui.util.isNull(legendIndex);
        var legendLines = this.legendLines;

        tui.util.forEachArray(this.sectorInfos, function(sectorInfo, index) {
            var opacity = (isNull || legendIndex === index) ? EMPHASIS_OPACITY : DE_EMPHASIS_OPACITY;

            sectorInfo.sector.attr({
                'fill-opacity': opacity
            });

            if (legendLines) {
                legendLines[index].attr({
                    'stroke-opacity': opacity
                });
            }
        });
    }
});

module.exports = RaphaelPieChart;

},{"./raphaelRenderUtil":85}],85:[function(require,module,exports){
/**
 * @fileoverview Util for raphael rendering.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

/**
 * Util for raphael rendering.
 * @module raphaelRenderUtil
 */
var raphaelRenderUtil = {
    /**
     * Make line path.
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

        return ['M'].concat(fromPoint).concat('L').concat(toPoint);
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
    },

    /**
     * Render area graph.
     * @param {object} paper raphael paper
     * @param {string} path path
     * @param {object} fillStyle fill style
     *      @param {string} fillStyle.fill fill color
     *      @param {?number} fillStyle.opacity fill opacity
     *      @param {string} fillStyle.stroke stroke color
     *      @param {?number} fillStyle.stroke-opacity stroke opacity
     * @returns {Array.<object>} raphael object
     */
    renderArea: function(paper, path, fillStyle) {
        var area = paper.path(path);

        fillStyle = tui.util.extend({
            'stroke-opacity': 0
        }, fillStyle);
        area.attr(fillStyle);

        return area;
    },

    /**
     * Render circle.
     * @param {object} paper - raphael object
     * @param {{left: number, top: number}} position - position
     * @param {number} radius - radius
     * @param {object} attributes - attributes
     * @returns {object}
     * @private
     */
    renderCircle: function(paper, position, radius, attributes) {
        var circle = paper.circle(position.left, position.top, radius);

        if (attributes) {
            circle.attr(attributes);
        }

        return circle;
    },

    /**
     * Render rect.
     * @param {object} paper - raphael object
     * @param {{left: number, top: number, width: number, height, number}} bound - bound
     * @param {object} attributes - attributes
     * @returns {*}
     */
    renderRect: function(paper, bound, attributes) {
        var rect = paper.rect(bound.left, bound.top, bound.width, bound.height);

        if (attributes) {
            rect.attr(attributes);
        }

        return rect;
    },

    /**
     * Update rect bound
     * @param {object} rect raphael object
     * @param {{left: number, top: number, width: number, height: number}} bound bound
     */
    updateRectBound: function(rect, bound) {
        rect.attr({
            x: bound.left,
            y: bound.top,
            width: bound.width,
            height: bound.height
        });
    },

    /**
     * Render items of line type chart.
     * @param {Array.<Array.<object>>} groupItems group items
     * @param {function} funcRenderItem function
     */
    forEach2dArray: function(groupItems, funcRenderItem) {
        tui.util.forEachArray(groupItems, function(items, groupIndex) {
            tui.util.forEachArray(items, function(item, index) {
                funcRenderItem(item, groupIndex, index);
            });
        });
    },

    /**
     * Make changed luminance color.
     * @param {string} hex hax color
     * @param {number} lum luminance
     * @returns {string} changed color
     */
    makeChangedLuminanceColor: function(hex, lum) {
        /*eslint no-magic-numbers: 0*/
        var changedHex;

        hex = hex.replace('#', '');
        lum = lum || 0;

        changedHex = tui.util.map(tui.util.range(3), function(index) {
            var hd = parseInt(hex.substr(index * 2, 2), 16);
            var newHd = hd + (hd * lum);

            newHd = Math.round(Math.min(Math.max(0, newHd), 255)).toString(16);

            return tui.chart.renderUtil.formatToZeroFill(newHd, 2);
        }).join('');

        return '#' + changedHex;
    }
};

module.exports = raphaelRenderUtil;

},{}],86:[function(require,module,exports){
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON
// Any copyright is dedicated to the Public Domain. http://creativecommons.org/publicdomain/zero/1.0/
if (!window.JSON) {
    window.JSON = {
        parse: function(sJSON) { return eval('(' + sJSON + ')'); },
        stringify: (function () {
            var toString = Object.prototype.toString;
            var isArray = Array.isArray || function (a) { return toString.call(a) === '[object Array]'; };
            var escMap = {'"': '\\"', '\\': '\\\\', '\b': '\\b', '\f': '\\f', '\n': '\\n', '\r': '\\r', '\t': '\\t'};
            var escFunc = function (m) { return escMap[m] || '\\u' + (m.charCodeAt(0) + 0x10000).toString(16).substr(1); };
            var escRE = /[\\"\u0000-\u001F\u2028\u2029]/g;
            return function stringify(value) {
                if (value == null) {
                    return 'null';
                } else if (typeof value === 'number') {
                    return isFinite(value) ? value.toString() : 'null';
                } else if (typeof value === 'boolean') {
                    return value.toString();
                } else if (typeof value === 'object') {
                    if (typeof value.toJSON === 'function') {
                        return stringify(value.toJSON());
                    } else if (isArray(value)) {
                        var res = '[';
                        for (var i = 0; i < value.length; i++)
                            res += (i ? ', ' : '') + stringify(value[i]);
                        return res + ']';
                    } else if (toString.call(value) === '[object Object]') {
                        var tmp = [];
                        for (var k in value) {
                            if (value.hasOwnProperty(k))
                                tmp.push(stringify(k) + ': ' + stringify(value[k]));
                        }
                        return '{' + tmp.join(', ') + '}';
                    }
                }
                return '"' + value.toString().replace(escRE, escFunc) + '"';
            };
        })()
    };
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
// Any copyright is dedicated to the Public Domain. http://creativecommons.org/publicdomain/zero/1.0/
if (typeof Object.create != 'function') {
    Object.create = (function(undefined) {
        var Temp = function() {};
        return function (prototype, propertiesObject) {
            if(prototype !== Object(prototype) && prototype !== null) {
                throw TypeError('Argument must be an object, or null');
            }
            Temp.prototype = prototype || {};
            if (propertiesObject !== undefined) {
                Object.defineProperties(Temp.prototype, propertiesObject);
            }
            var result = new Temp();
            Temp.prototype = null;
            // to imitate the case of Object.create(null)
            if(prototype === null) {
                result.__proto__ = null;
            }
            return result;
        };
    })();
}

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
// MIT license

(function () {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
            || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function (callback) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () {
                    callback(currTime + timeToCall);
                },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
    }
}());

},{}],87:[function(require,module,exports){
'use strict';

var chartConst = require('./const');
var chartFactory = require('./factories/chartFactory');
var BarChart = require('./charts/barChart');
var ColumnChart = require('./charts/columnChart');
var LineChart = require('./charts/lineChart');
var AreaChart = require('./charts/areaChart');
var ColumnLineComboChart = require('./charts/columnLineComboChart');
var LineAreaComboChart = require('./charts/lineAreaComboChart');
var PieDonutComboChart = require('./charts/pieDonutComboChart');
var PieChart = require('./charts/pieChart');
var BubbleChart = require('./charts/bubbleChart');
var ScatterChart = require('./charts/scatterChart');
var HeatmapChart = require('./charts/heatmapChart');
var TreemapChart = require('./charts/treemapChart');
var MapChart = require('./charts/mapChart');

chartFactory.register(chartConst.CHART_TYPE_BAR, BarChart);
chartFactory.register(chartConst.CHART_TYPE_COLUMN, ColumnChart);
chartFactory.register(chartConst.CHART_TYPE_LINE, LineChart);
chartFactory.register(chartConst.CHART_TYPE_AREA, AreaChart);
chartFactory.register(chartConst.CHART_TYPE_COLUMN_LINE_COMBO, ColumnLineComboChart);
chartFactory.register(chartConst.CHART_TYPE_LINE_AREA_COMBO, LineAreaComboChart);
chartFactory.register(chartConst.CHART_TYPE_PIE_DONUT_COMBO, PieDonutComboChart);
chartFactory.register(chartConst.CHART_TYPE_PIE, PieChart);
chartFactory.register(chartConst.CHART_TYPE_BUBBLE, BubbleChart);
chartFactory.register(chartConst.CHART_TYPE_SCATTER, ScatterChart);
chartFactory.register(chartConst.CHART_TYPE_HEATMAP, HeatmapChart);
chartFactory.register(chartConst.CHART_TYPE_TREEMAP, TreemapChart);
chartFactory.register(chartConst.CHART_TYPE_MAP, MapChart);

},{"./charts/areaChart":5,"./charts/barChart":8,"./charts/bubbleChart":10,"./charts/columnChart":13,"./charts/columnLineComboChart":14,"./charts/heatmapChart":17,"./charts/lineAreaComboChart":18,"./charts/lineChart":19,"./charts/mapChart":21,"./charts/pieChart":23,"./charts/pieDonutComboChart":24,"./charts/scatterChart":26,"./charts/treemapChart":27,"./const":31,"./factories/chartFactory":50}],88:[function(require,module,exports){
'use strict';

var chartConst = require('./const'),
    themeFactory = require('./factories/themeFactory'),
    defaultTheme = require('./themes/defaultTheme');

themeFactory.register(chartConst.DEFAULT_THEME_NAME, defaultTheme);

},{"./const":31,"./factories/themeFactory":53,"./themes/defaultTheme":107}],89:[function(require,module,exports){
/**
 * @fileoverview Area chart series component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series');
var LineTypeSeriesBase = require('./lineTypeSeriesBase');
var chartConst = require('../const');
var predicate = require('../helpers/predicate');

var AreaChartSeries = tui.util.defineClass(Series, /** @lends AreaChartSeries.prototype */ {
    /**
     * Area chart series component.
     * @constructs AreaChartSeries
     * @extends Series
     * @mixes LineTypeSeriesBase
     */
    init: function() {
        Series.apply(this, arguments);

        /**
         * object for requestAnimationFrame
         * @type {null | {id: number}}
         */
        this.movingAnimation = null;
    },

    /**
     * Make position top of zero point.
     * @returns {number} position top
     * @private
     */
    _makePositionTopOfZeroPoint: function() {
        var dimension = this.boundsMaker.getDimension('series');
        var limit = this.boundsMaker.getAxesData().yAxis.limit;
        var top = this._getLimitDistanceFromZeroPoint(dimension.height, limit).toMax;

        if (limit.min >= 0 && !top) {
            top = dimension.height;
        }

        return top + chartConst.SERIES_EXPAND_SIZE;
    },

    /**
     * Make stackType positions.
     * @param {Array.<Array.<{left: number, top: number}>>} groupPositions group positions
     * @returns {Array.<Array.<{left: number, top: number, startTop: number}>>} stackType positions
     * @private
     */
    _makeStackedPositions: function(groupPositions) {
        var height = this.boundsMaker.getDimension('series').height + chartConst.SERIES_EXPAND_SIZE,
            firstStartTop = this._makePositionTopOfZeroPoint(),
            prevPositionTops = [];

        return tui.util.map(groupPositions, function(positions) {
            return tui.util.map(positions, function(position, index) {
                var prevTop = prevPositionTops[index] || firstStartTop;
                var stackedHeight = height - position.top;
                var top = prevTop - stackedHeight;

                position.startTop = prevTop;
                position.top = top;

                prevPositionTops[index] = top;

                return position;
            });
        });
    },

    /**
     * Make positions.
     * @param {number} seriesWidth - width of series area
     * @returns {Array.<Array.<{left: number, top: number, startTop: number}>>} stackType positions
     * @private
     */
    _makePositions: function(seriesWidth) {
        var groupPositions = this._makeBasicPositions(seriesWidth);

        if (predicate.isValidStackOption(this.options.stackType)) {
            groupPositions = this._makeStackedPositions(groupPositions);
        }

        return groupPositions;
    },

    /**
     * Make series data.
     * @returns {object} series data
     * @private
     * @override
     */
    _makeSeriesData: function() {
        var dimension = this.boundsMaker.getDimension('series'),
            zeroTop = this._getLimitDistanceFromZeroPoint(dimension.height, this.data.limit).toMax;

        return {
            chartBackground: this.chartBackground,
            groupPositions: this._makePositions(),
            hasRangeData: this._getSeriesDataModel().hasRangeData(),
            zeroTop: zeroTop + chartConst.SERIES_EXPAND_SIZE
        };
    },

    /**
     * Rerender.
     * @param {object} data - data for rerendering
     * @override
     */
    rerender: function(data) {
        var paper;

        this._cancelMovingAnimation();

        paper = Series.prototype.rerender.call(this, data);

        return paper;
    }
});

LineTypeSeriesBase.mixin(AreaChartSeries);

module.exports = AreaChartSeries;

},{"../const":31,"../helpers/predicate":61,"./lineTypeSeriesBase":97,"./series":102}],90:[function(require,module,exports){
/**
 * @fileoverview Bar chart series component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series');
var BarTypeSeriesBase = require('./barTypeSeriesBase');
var chartConst = require('../const');
var predicate = require('../helpers/predicate');
var renderUtil = require('../helpers/renderUtil');
var calculator = require('../helpers/calculator');

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
     * Make bound of bar chart.
     * @param {number} width width
     * @param {number} height height
     * @param {number} top top position value
     * @param {number} startLeft start left position value
     * @param {number} endLeft end left position value
     * @returns {{
     *      start: {left: number, top: number, width: number, height: number},
     *      end: {left: number, top: number, width: number, height: number}
     * }} column chart bound
     * @private
     */
    _makeBound: function(width, height, top, startLeft, endLeft) {
        return {
            start: {
                top: top,
                left: startLeft,
                width: 0,
                height: height
            },
            end: {
                top: top,
                left: endLeft,
                width: width,
                height: height
            }
        };
    },

    /**
     * Calculate additional left for divided option.
     * @param {number} value value
     * @returns {number}
     * @private
     */
    _calculateAdditionalLeft: function(value) {
        var additionalLeft = 0;

        if (this.options.divided && value > 0) {
            additionalLeft = this.boundsMaker.getDimension('yAxis').width + chartConst.OVERLAPPING_WIDTH;
        }

        return additionalLeft;
    },

    /**
     * Make bar chart bound.
     * @param {{
     *      baseSize: number,
     *      basePosition: number,
     *      step: number,
     *      additionalPosition: ?number,
     *      barSize: number
     * }} baseData base data for making bound
     * @param {{
     *      baseTop: number,
     *      top: number,
     *      plusLeft: number,
     *      minusLeft: number,
     *      prevStack: ?string
     * }} iterationData iteration data
     * @param {?boolean} isStackType whether stackType option or not.
     * @param {SeriesItem} seriesItem series item
     * @param {number} index index
     * @returns {{
     *      start: {left: number, top: number, width: number, height: number},
     *      end: {left: number, top: number, width: number, height: number}
     * }}
     * @private
     */
    _makeBarChartBound: function(baseData, iterationData, isStackType, seriesItem, index) {
        var barWidth = baseData.baseBarSize * seriesItem.ratioDistance,
            additionalLeft = this._calculateAdditionalLeft(seriesItem.value),
            barStartLeft = baseData.baseBarSize * seriesItem.startRatio,
            startLeft = baseData.basePosition + barStartLeft + additionalLeft + chartConst.SERIES_EXPAND_SIZE,
            changedStack = (seriesItem.stack !== iterationData.prevStack),
            stepCount, endLeft, bound;

        if (!isStackType || (!this.options.diverging && changedStack)) {
            stepCount = isStackType ? this.dataProcessor.findStackIndex(seriesItem.stack) : index;
            iterationData.top = (baseData.step * stepCount) + iterationData.baseTop + baseData.additionalPosition;
            iterationData.plusLeft = 0;
            iterationData.minusLeft = 0;
        }

        if (seriesItem.value >= 0) {
            endLeft = startLeft + iterationData.plusLeft;
            iterationData.plusLeft += barWidth;
        } else {
            iterationData.minusLeft -= barWidth;
            endLeft = startLeft + iterationData.minusLeft;
        }

        iterationData.prevStack = seriesItem.stack;

        bound = this._makeBound(barWidth, baseData.barSize, iterationData.top, startLeft, endLeft);

        return bound;
    },

    /**
     * Make bounds of bar chart.
     * @returns {Array.<Array.<object>>} bounds
     * @private
     */
    _makeBounds: function() {
        var self = this,
            seriesDataModel = this._getSeriesDataModel(),
            isStacked = predicate.isValidStackOption(this.options.stackType),
            dimension = this.boundsMaker.getDimension('series'),
            baseData = this._makeBaseDataForMakingBound(dimension.height, dimension.width);

        return seriesDataModel.map(function(seriesGroup, groupIndex) {
            var baseTop = (groupIndex * baseData.groupSize) + baseData.firstAdditionalPosition
                        + chartConst.SERIES_EXPAND_SIZE,
                iterationData = {
                    baseTop: baseTop,
                    top: baseTop,
                    plusLeft: 0,
                    minusLeft: 0,
                    prevStack: null
                },
                iteratee = tui.util.bind(self._makeBarChartBound, self, baseData, iterationData, isStacked);

            return seriesGroup.map(iteratee);
        });
    },

    /**
     * Calculate top position of sum label.
     * @param {{left: number, top: number}} bound bound
     * @param {number} labelHeight label height
     * @returns {number} top position value
     * @private
     */
    _calculateTopPositionOfSumLabel: function(bound, labelHeight) {
        return bound.top + ((bound.height - labelHeight + chartConst.TEXT_PADDING) / 2);
    },

    /**
     * Make html of plus sum label.
     * @param {Array.<number>} values values
     * @param {{left: number, top: number}} bound bound
     * @param {number} labelHeight label height
     * @returns {string} plus sum label html
     * @private
     */
    _makePlusSumLabelHtml: function(values, bound, labelHeight) {
        var html = '';
        var sum, formatFunctions, formattedSum;

        if (bound) {
            sum = calculator.sumPlusValues(values);
            formatFunctions = this.dataProcessor.getFormatFunctions();
            formattedSum = renderUtil.formatValue(sum, formatFunctions, this.chartType, 'series');
            html = this._makeSeriesLabelHtml({
                left: bound.left + bound.width + chartConst.SERIES_LABEL_PADDING,
                top: this._calculateTopPositionOfSumLabel(bound, labelHeight)
            }, formattedSum, -1);
        }

        return html;
    },

    /**
     * Make minus sum label html.
     * @param {Array.<number>} values values
     * @param {{left: number, top: number}} bound bound
     * @param {number} labelHeight label height
     * @returns {string} plus minus label html
     * @private
     */
    _makeMinusSumLabelHtml: function(values, bound, labelHeight) {
        var html = '';
        var sum, formatFunctions, formattedSum, labelWidth;

        if (bound) {
            sum = calculator.sumMinusValues(values);

            if (this.options.diverging) {
                sum = Math.abs(sum);
            }

            formatFunctions = this.dataProcessor.getFormatFunctions();
            formattedSum = renderUtil.formatValue(sum, formatFunctions, this.chartType, 'series');
            labelWidth = renderUtil.getRenderedLabelWidth(formattedSum, this.theme.label);
            html = this._makeSeriesLabelHtml({
                left: bound.left - labelWidth - chartConst.SERIES_LABEL_PADDING,
                top: this._calculateTopPositionOfSumLabel(bound, labelHeight)
            }, formattedSum, -1);
        }

        return html;
    }
});

BarTypeSeriesBase.mixin(BarChartSeries);

module.exports = BarChartSeries;

},{"../const":31,"../helpers/calculator":57,"../helpers/predicate":61,"../helpers/renderUtil":63,"./barTypeSeriesBase":91,"./series":102}],91:[function(require,module,exports){
/**
 * @fileoverview BarTypeSeriesBase is base class for bar type series.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const');
var labelHelper = require('./renderingLabelHelper');
var predicate = require('../helpers/predicate');
var renderUtil = require('../helpers/renderUtil');

var BarTypeSeriesBase = tui.util.defineClass(/** @lends BarTypeSeriesBase.prototype */ {
    /**
     * Make series data.
     * @returns {object} add data
     * @private
     * @override
     */
    _makeSeriesData: function() {
        this.groupBounds = this._makeBounds(this.boundsMaker.getDimension('series'));

        return {
            groupBounds: this.groupBounds,
            seriesDataModel: this._getSeriesDataModel()
        };
    },

    /**
     * Make bar gutter.
     * @param {number} groupSize bar group size
     * @param {number} itemCount group item count
     * @returns {number} bar gutter
     * @private
     */
    _makeBarGutter: function(groupSize, itemCount) {
        var baseSize = groupSize / (itemCount + 1) / 2;
        var standardSize = 6;
        var gutter;

        if (baseSize <= 2) {
            gutter = 0;
        } else if (baseSize <= standardSize) {
            gutter = 2;
        } else {
            gutter = 4;
        }

        return gutter;
    },

    /**
     * Make bar size.
     * @param {number} groupSize bar group size
     * @param {number} barGutter bar padding
     * @param {number} itemCount group item count
     * @returns {number} bar size (width or height)
     * @private
     */
    _makeBarSize: function(groupSize, barGutter, itemCount) {
        return (groupSize - (barGutter * (itemCount - 1))) / (itemCount + 1);
    },

    /**
     * Make option size.
     * @param {number} barSize bar size
     * @param {?number} optionBarWidth barWidth option
     * @returns {number} option size
     * @private
     */
    _makeOptionSize: function(barSize, optionBarWidth) {
        var optionsSize = 0;

        if (optionBarWidth) {
            optionsSize = Math.min(barSize, optionBarWidth);
        }

        return optionsSize;
    },

    /**
     * Calculate difference between optionSize and barSize.
     * @param {number} barSize bar size
     * @param {number} optionSize option size
     * @param {number} itemCount item count
     * @returns {number} addition padding
     * @private
     */
    _calculateAdditionalPosition: function(barSize, optionSize, itemCount) {
        var additionalPosition = 0;

        if (optionSize && optionSize < barSize) {
            additionalPosition = (barSize / 2) + ((barSize - optionSize) * itemCount / 2);
        }

        return additionalPosition;
    },

    /**
     * Make base data for making bound.
     * @param {number} baseGroupSize base group size
     * @param {number} baseBarSize base bar size
     * @returns {{
     *      baseBarSize: number,
     *      groupSize: number,
     *      barSize: number,
     *      step: number,
     *      firstAdditionalPosition: number,
     *      additionalPosition: number,
     *      basePosition: number
     * }}
     * @private
     */
    _makeBaseDataForMakingBound: function(baseGroupSize, baseBarSize) {
        var isStackType = predicate.isValidStackOption(this.options.stackType);
        var seriesDataModel = this._getSeriesDataModel();
        var groupSize = baseGroupSize / seriesDataModel.getGroupCount();
        var firstAdditionalPosition = 0;
        var itemCount, barGutter, barSize, optionSize, additionalPosition, basePosition;

        if (!isStackType) {
            itemCount = seriesDataModel.getFirstSeriesGroup().getSeriesItemCount();
        } else {
            itemCount = this.options.diverging ? 1 : this.dataProcessor.getStackCount();
        }

        barGutter = this._makeBarGutter(groupSize, itemCount);
        barSize = this._makeBarSize(groupSize, barGutter, itemCount);
        optionSize = this._makeOptionSize(barSize, this.options.barWidth);
        additionalPosition = this._calculateAdditionalPosition(barSize, optionSize, itemCount);
        barSize = optionSize || barSize;
        basePosition = this._getLimitDistanceFromZeroPoint(baseBarSize, this.data.limit).toMin;

        if (predicate.isColumnChart(this.chartType)) {
            basePosition = baseBarSize - basePosition;
        }

        if (!this.options.barWidth || barSize < this.options.barWidth) {
            firstAdditionalPosition = (barSize / 2) + additionalPosition;
        }

        return {
            baseBarSize: baseBarSize,
            groupSize: groupSize,
            barSize: barSize,
            step: barGutter + barSize,
            firstAdditionalPosition: firstAdditionalPosition,
            additionalPosition: additionalPosition,
            basePosition: basePosition
        };
    },

    /**
     * Render normal series label.
     * @param {HTMLElement} labelContainer series label area element
     * @private
     */
    _renderNormalSeriesLabel: function(labelContainer) {
        var sdm = this._getSeriesDataModel();
        var boundsSet = this.seriesData.groupBounds;
        var labelTheme = this.theme.label;
        var selectedIndex = this.selectedLegendIndex;
        var positionsSet, html;

        if (predicate.isBarChart(this.chartType)) {
            positionsSet = labelHelper.boundsToLabelPositionsForBarChart(sdm, boundsSet, labelTheme);
        } else {
            positionsSet = labelHelper.boundsToLabelPositionsForColumnChart(sdm, boundsSet, labelTheme);
        }

        html = labelHelper.makeLabelsHtmlForBoundType(sdm, positionsSet, labelTheme, selectedIndex);

        labelContainer.innerHTML = html;
    },

    /**
     * Make sum values.
     * @param {Array.<number>} values values
     * @returns {number} sum result.
     */
    _makeSumValues: function(values) {
        var sum = tui.util.sum(values);

        return renderUtil.formatValue(sum, this.dataProcessor.getFormatFunctions(), this.chartType, 'seires');
    },

    /**
     * Make stackType label position.
     * @param {{width: number, height: number, left: number, top: number}} bound element bound
     * @param {string} label label
     * @param {number} labelHeight label height
     * @returns {{left: number, top: number}} position
     * @private
     */
    _makeStackedLabelPosition: function(bound, label, labelHeight) {
        var labelWidth = renderUtil.getRenderedLabelWidth(label, this.theme.label),
            left = bound.left + ((bound.width - labelWidth + chartConst.TEXT_PADDING) / 2),
            top = bound.top + ((bound.height - labelHeight + chartConst.TEXT_PADDING) / 2);

        return {
            left: left,
            top: top
        };
    },

    /**
     * Make stackType labels html.
     * @param {object} params parameters
     *      @param {number} params.groupIndex group index
     *      @param {Array.<object>} params.bounds bounds,
     *      @param {number} params.labelHeight label height
     * @returns {string} labels html
     * @private
     */
    _makeStackedLabelsHtml: function(params) {
        var self = this,
            seriesGroup = params.seriesGroup,
            labelHeight = params.labelHeight,
            htmls, plusBound, minusBound, values;

        htmls = seriesGroup.map(function(seriesItem, index) {
            var bound = params.bounds[index],
                labelHtml = '',
                boundEnd, position;

            if (bound && seriesItem) {
                boundEnd = bound.end;
                position = self._makeStackedLabelPosition(boundEnd, seriesItem.label, params.labelHeight);
                labelHtml = self._makeSeriesLabelHtml(position, seriesItem.label, index);
            }

            if (seriesItem.value > 0) {
                plusBound = boundEnd;
            } else if (seriesItem.value < 0) {
                minusBound = boundEnd;
            }

            return labelHtml;
        });

        if (this.options.stackType === 'normal') {
            values = seriesGroup.pluck('value');
            htmls.push(this._makePlusSumLabelHtml(values, plusBound, labelHeight));
            htmls.push(this._makeMinusSumLabelHtml(values, minusBound, labelHeight));
        }

        return htmls.join('');
    },

    /**
     * Render stackType series label.
     * @param {HTMLElement} elSeriesLabelArea series label area element
     * @private
     */
    _renderStackedSeriesLabel: function(elSeriesLabelArea) {
        var self = this;
        var groupBounds = this.seriesData.groupBounds;
        var seriesDataModel = this._getSeriesDataModel();
        var labelHeight = renderUtil.getRenderedLabelHeight(chartConst.MAX_HEIGHT_WORLD, this.theme.label);
        var html = seriesDataModel.map(function(seriesGroup, index) {
            var labelsHtml = self._makeStackedLabelsHtml({
                groupIndex: index,
                seriesGroup: seriesGroup,
                bounds: groupBounds[index],
                labelHeight: labelHeight
            });

            return labelsHtml;
        }).join('');

        elSeriesLabelArea.innerHTML = html;
    },

    /**
     * Render series label.
     * @param {HTMLElement} elSeriesLabelArea series label area element
     * @private
     */
    _renderSeriesLabel: function(elSeriesLabelArea) {
        if (this.options.stackType) {
            this._renderStackedSeriesLabel(elSeriesLabelArea);
        } else {
            this._renderNormalSeriesLabel(elSeriesLabelArea);
        }
    }
});

BarTypeSeriesBase.mixin = function(func) {
    tui.util.extend(func.prototype, BarTypeSeriesBase.prototype);
};

module.exports = BarTypeSeriesBase;

},{"../const":31,"../helpers/predicate":61,"../helpers/renderUtil":63,"./renderingLabelHelper":100}],92:[function(require,module,exports){
/**
 * @fileoverview Bubble chart series component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series');
var CoordinateTypeSeriesBase = require('./coordinateTypeSeriesBase');

var BubbleChartSeries = tui.util.defineClass(Series, /** @lends BubbleChartSeries.prototype */ {
    /**
     * Bubble chart series component.
     * @constructs BubbleChartSeries
     * @extends Series
     */
    init: function() {
        Series.apply(this, arguments);
    },

    /**
     * Calculate step value for label axis.
     * @returns {number}
     * @private
     */
    _calculateStep: function() {
        var step = 0;
        var dimension, seriesDataModel, size, len;

        if (this.dataProcessor.hasCategories(false)) {
            dimension = this.boundsMaker.getDimension('series');
            seriesDataModel = this._getSeriesDataModel();
            len = this.dataProcessor.getCategoryCount(false);

            if (seriesDataModel.isXCountGreaterThanYCount()) {
                size = dimension.height;
            } else {
                size = dimension.width;
            }

            step = size / len;
        }

        return step;
    },

    /**
     * Make bound for bubble chart.
     * @param {{x: number, y: number, r: number}} ratioMap - ratio map
     * @param {number} positionByStep - position value by step
     * @param {number} maxRadius - max radius
     * @returns {{left: number, top: number, radius: number}}
     * @private
     */
    _makeBound: function(ratioMap, positionByStep, maxRadius) {
        var dimension = this.boundsMaker.getDimension('series');
        var left = tui.util.isExisty(ratioMap.x) ? (ratioMap.x * dimension.width) : positionByStep;
        var top = tui.util.isExisty(ratioMap.y) ? (ratioMap.y * dimension.height) : positionByStep;

        return {
            left: left,
            top: dimension.height - top,
            radius: Math.max(maxRadius * ratioMap.r, 2)
        };
    },

    /**
     * Make bounds for bubble chart.
     * @returns {Array.<Array.<{left: number, top: number, radius: number}>>} positions
     * @private
     */
    _makeBounds: function() {
        var self = this;
        var seriesDataModel = this._getSeriesDataModel();
        var maxRadius = this.boundsMaker.getMaxRadiusForBubbleChart();
        var step = this._calculateStep();
        var start = step ? step / 2 : 0;

        return seriesDataModel.map(function(seriesGroup, index) {
            var positionByStep = start + (step * index);

            return seriesGroup.map(function(seriesItem) {
                var hasRationMap = (seriesItem && seriesItem.ratioMap);

                return hasRationMap ? self._makeBound(seriesItem.ratioMap, positionByStep, maxRadius) : null;
            });
        });
    }
});

CoordinateTypeSeriesBase.mixin(BubbleChartSeries);
tui.util.CustomEvents.mixin(BubbleChartSeries);

module.exports = BubbleChartSeries;

},{"./coordinateTypeSeriesBase":94,"./series":102}],93:[function(require,module,exports){
/**
 * @fileoverview Column chart series component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series');
var BarTypeSeriesBase = require('./barTypeSeriesBase');
var chartConst = require('../const');
var predicate = require('../helpers/predicate');
var renderUtil = require('../helpers/renderUtil');
var calculator = require('../helpers/calculator');

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
     * Make bound of column chart.
     * @param {number} width width
     * @param {number} height height
     * @param {number} left top position value
     * @param {number} startTop start top position value
     * @param {number} endTop end top position value
     * @returns {{
     *      start: {left: number, top: number, width: number, height: number},
     *      end: {left: number, top: number, width: number, height: number}
     * }} column chart bound
     * @private
     */
    _makeBound: function(width, height, left, startTop, endTop) {
        return {
            start: {
                top: startTop,
                left: left,
                width: width,
                height: 0
            },
            end: {
                top: endTop,
                left: left,
                width: width,
                height: height
            }
        };
    },

    /**
     * Make column chart bound.
     * @param {{
     *      baseSize: number,
     *      basePosition: number,
     *      step: number,
     *      additionalPosition: ?number,
     *      barSize: number
     * }} baseData base data for making bound
     * @param {{
     *      baseLeft: number,
     *      left: number,
     *      plusTop: number,
     *      minusTop: number,
     *      prevStack: ?string
     * }} iterationData iteration data
     * @param {?boolean} isStackType whether stackType option or not.
     * @param {SeriesItem} seriesItem series item
     * @param {number} index index
     * @returns {{
     *      start: {left: number, top: number, width: number, height: number},
     *      end: {left: number, top: number, width: number, height: number}
     * }}
     * @private
     */
    _makeColumnChartBound: function(baseData, iterationData, isStackType, seriesItem, index) {
        var barHeight = Math.abs(baseData.baseBarSize * seriesItem.ratioDistance),
            barStartTop = baseData.baseBarSize * seriesItem.startRatio,
            startTop = baseData.basePosition - barStartTop + chartConst.SERIES_EXPAND_SIZE,
            changedStack = (seriesItem.stack !== iterationData.prevStack),
            stepCount, endTop, bound;

        if (!isStackType || (!this.options.diverging && changedStack)) {
            stepCount = isStackType ? this.dataProcessor.findStackIndex(seriesItem.stack) : index;
            iterationData.left = (baseData.step * stepCount) + iterationData.baseLeft + baseData.additionalPosition;
            iterationData.plusTop = 0;
            iterationData.minusTop = 0;
        }

        if (seriesItem.value >= 0) {
            iterationData.plusTop -= barHeight;
            endTop = startTop + iterationData.plusTop;
        } else {
            endTop = startTop + iterationData.minusTop;
            iterationData.minusTop += barHeight;
        }

        iterationData.prevStack = seriesItem.stack;
        bound = this._makeBound(baseData.barSize, barHeight, iterationData.left, startTop, endTop);

        return bound;
    },

    /**
     * Make bounds of column chart.
     * @returns {Array.<Array.<object>>} bounds
     * @private
     */
    _makeBounds: function() {
        var self = this;
        var seriesDataModel = this._getSeriesDataModel();
        var isStackType = predicate.isValidStackOption(this.options.stackType);
        var dimension = this.boundsMaker.getDimension('series');
        var baseData = this._makeBaseDataForMakingBound(dimension.width, dimension.height);

        return seriesDataModel.map(function(seriesGroup, groupIndex) {
            var baseLeft = (groupIndex * baseData.groupSize) + baseData.firstAdditionalPosition
                        + chartConst.SERIES_EXPAND_SIZE,
                iterationData = {
                    baseLeft: baseLeft,
                    left: baseLeft,
                    plusTop: 0,
                    minusTop: 0,
                    prevStack: null
                },
                iteratee = tui.util.bind(self._makeColumnChartBound, self, baseData, iterationData, isStackType);

            return seriesGroup.map(iteratee);
        });
    },

    /**
     * Calculate left position of sum label.
     * @param {{left: number, top: number}} bound bound
     * @param {string} formattedSum formatted sum.
     * @returns {number} left position value
     * @private
     */
    _calculateLeftPositionOfSumLabel: function(bound, formattedSum) {
        var labelWidth = renderUtil.getRenderedLabelWidth(formattedSum, this.theme.label);

        return bound.left + ((bound.width - labelWidth + chartConst.TEXT_PADDING) / 2);
    },

    /**
     * Make plus sum label html.
     * @param {Array.<number>} values values
     * @param {{left: number, top: number}} bound bound
     * @param {number} labelHeight label height
     * @returns {string} plus sum label html
     * @private
     */
    _makePlusSumLabelHtml: function(values, bound, labelHeight) {
        var html = '';
        var sum, formatFunctions, formattedSum;

        if (bound) {
            sum = calculator.sumPlusValues(values);
            formatFunctions = this.dataProcessor.getFormatFunctions();
            formattedSum = renderUtil.formatValue(sum, formatFunctions, this.chartType, 'series');
            html = this._makeSeriesLabelHtml({
                left: this._calculateLeftPositionOfSumLabel(bound, formattedSum),
                top: bound.top - labelHeight - chartConst.SERIES_LABEL_PADDING
            }, formattedSum, -1);
        }

        return html;
    },

    /**
     * Make minus sum label html.
     * @param {Array.<number>} values values
     * @param {{left: number, top: number}} bound bound
     * @returns {string} plus minus label html
     * @private
     */
    _makeMinusSumLabelHtml: function(values, bound) {
        var html = '';
        var sum, formatFunctions, formattedSum;

        if (bound) {
            sum = calculator.sumMinusValues(values);

            if (this.options.diverging) {
                sum = Math.abs(sum);
            }

            formatFunctions = this.dataProcessor.getFormatFunctions();
            formattedSum = renderUtil.formatValue(sum, formatFunctions, this.chartType, 'series');
            html = this._makeSeriesLabelHtml({
                left: this._calculateLeftPositionOfSumLabel(bound, formattedSum),
                top: bound.top + bound.height + chartConst.SERIES_LABEL_PADDING
            }, formattedSum, -1);
        }

        return html;
    }
});

BarTypeSeriesBase.mixin(ColumnChartSeries);

module.exports = ColumnChartSeries;

},{"../const":31,"../helpers/calculator":57,"../helpers/predicate":61,"../helpers/renderUtil":63,"./barTypeSeriesBase":91,"./series":102}],94:[function(require,module,exports){
/**
 * @fileoverview CoordinateTypeSeriesBase is base class for coordinate type series.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */


'use strict';

var renderUtil = require('../helpers/renderUtil');

var CoordinateTypeSeriesBase = tui.util.defineClass(/** @lends CoordinateTypeSeriesBase.prototype */ {
    /**
     * Make series data.
     * @returns {{
     *      groupBounds: Array.<Array.<{left: number, top: number, radius: number}>>,
     *      seriesDataModel: SeriesDataModel
     * }} series data
     * @private
     * @override
     */
    _makeSeriesData: function() {
        var bounds = this._makeBounds();

        return {
            groupBounds: bounds,
            seriesDataModel: this._getSeriesDataModel()
        };
    },

    /**
     * showTooltip is mouseover event callback on series graph.
     * @param {object} params parameters
     *      @param {boolean} params.allowNegativeTooltip whether allow negative tooltip or not
     * @param {{top:number, left: number, width: number, height: number}} bound graph bound information
     * @param {number} groupIndex group index
     * @param {number} index index
     * @param {{left: number, top: number}} mousePosition mouse position
     */
    showTooltip: function(params, bound, groupIndex, index, mousePosition) {
        this.fire('showTooltip', tui.util.extend({
            indexes: {
                groupIndex: groupIndex,
                index: index
            },
            mousePosition: mousePosition
        }, params));
    },

    /**
     * hideTooltip is mouseout event callback on series graph.
     */
    hideTooltip: function() {
        this.fire('hideTooltip');
    },

    /**
     * Render raphael graph.
     * @param {{width: number, height: number}} dimension dimension
     * @param {object} seriesData series data
     * @private
     * @override
     */
    _renderGraph: function(dimension, seriesData) {
        var showTooltip = tui.util.bind(this.showTooltip, this, {
            chartType: this.chartType
        });
        var callbacks = {
            showTooltip: showTooltip,
            hideTooltip: tui.util.bind(this.hideTooltip, this)
        };
        var params = this._makeParamsForGraphRendering(dimension, seriesData);

        this.graphRenderer.render(this.seriesContainer, params, callbacks);
    },

    /**
     * Make html for label of series area.
     * @param {{left: number, top: number}} basePosition - position
     * @param {string} label - label of SeriesItem
     * @param {number} index - index
     * @returns {string}
     * @private
     */
    _makeSeriesLabelsHtml: function(basePosition, label, index) {
        var labelHeight = renderUtil.getRenderedLabelHeight(label, this.theme.label);
        var labelWidth = renderUtil.getRenderedLabelWidth(label, this.theme.label);
        var position = {
            left: basePosition.left - (labelWidth / 2),
            top: basePosition.top - (labelHeight / 2)
        };

        return this._makeSeriesLabelHtml(position, label, index);
    },

    /**
     * Render series label.
     * @param {HTMLElement} labelContainer - container for label area
     * @private
     */
    _renderSeriesLabel: function(labelContainer) {
        var self = this;
        var seriesDataModel = this._getSeriesDataModel();
        var html = seriesDataModel.map(function(seriesGroup, groupIndex) {
            return seriesGroup.map(function(seriesItem, index) {
                var bound = self.seriesData.groupBounds[groupIndex][index];

                return seriesItem ? self._makeSeriesLabelsHtml(bound, seriesItem.label, index) : '';
            }).join('');
        }).join('');

        labelContainer.innerHTML = html;
    },

    /**
     * On click series.
     * @param {{left: number, top: number}} position mouse position
     */
    onClickSeries: function(position) {
        if (this.options.allowSelect) {
            this._executeGraphRenderer(position, 'clickSeries');
        }
    },

    /**
     * On move series.
     * @param {{left: number, top: number}} position mouse position
     */
    onMoveSeries: function(position) {
        this._executeGraphRenderer(position, 'moveMouseOnSeries');
    }
});

CoordinateTypeSeriesBase.mixin = function(func) {
    tui.util.extend(func.prototype, CoordinateTypeSeriesBase.prototype);
};

tui.util.CustomEvents.mixin(CoordinateTypeSeriesBase);

module.exports = CoordinateTypeSeriesBase;

},{"../helpers/renderUtil":63}],95:[function(require,module,exports){
/**
 * @fileoverview Series component for rendering graph of heatmap chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series');
var labelHelper = require('./renderingLabelHelper');
var chartConst = require('../const');

var HeatmapChartSeries = tui.util.defineClass(Series, /** @lends HeatmapChartSeries.prototype */ {
    /**
     * Series component for rendering graph of heatmap chart.
     * @constructs HeatmapChartSeries
     * @extends Series
     */
    init: function() {
        Series.apply(this, arguments);
    },

    /**
     * Make series data.
     * @returns {{
     *      groupBounds: Array.<Array.<{left: number, top: number, radius: number}>>,
     *      seriesDataModel: SeriesDataModel
     * }} series data
     * @private
     * @override
     */
    _makeSeriesData: function() {
        var boundsSet = this._makeBounds();

        return {
            colorSpectrum: this.data.colorSpectrum,
            groupBounds: boundsSet,
            seriesDataModel: this._getSeriesDataModel()
        };
    },

    /**
     * Make bound for graph rendering.
     * @param {number} blockWidth - block width
     * @param {number} blockHeight - block height
     * @param {number} x - x index
     * @param {number} y - y index
     * @returns {{end: {left: number, top: number, width: number, height: number}}}
     * @private
     */
    _makeBound: function(blockWidth, blockHeight, x, y) {
        var height = this.boundsMaker.getDimension('series').height;
        var left = (blockWidth * x) + chartConst.SERIES_EXPAND_SIZE;
        var top = height - (blockHeight * (y + 1)) + chartConst.SERIES_EXPAND_SIZE;

        return {
            end: {
                left: left,
                top: top,
                width: blockWidth,
                height: blockHeight
            }
        };
    },

    /**
     * Make bounds for graph rendering.
     * @returns {Array.<Array.<{left: number, top: number, radius: number}>>} positions
     * @private
     */
    _makeBounds: function() {
        var self = this;
        var seriesDataModel = this._getSeriesDataModel();
        var dimension = this.boundsMaker.getDimension('series');
        var blockWidth = dimension.width / this.dataProcessor.getCategoryCount(false);
        var blockHeight = dimension.height / this.dataProcessor.getCategoryCount(true);

        return seriesDataModel.map(function(seriesGroup, x) {
            return seriesGroup.map(function(seriesItem, y) {
                return self._makeBound(blockWidth, blockHeight, x, y);
            });
        });
    },

    /**
     * On show tooltip for calling showWedge.
     * @param {{indexes: {groupIndex: number, index: number}}} params - parameters
     */
    onShowTooltip: function(params) {
        var seriesDataModel = this._getSeriesDataModel();
        var indexes = params.indexes;
        var ratio = seriesDataModel.getSeriesItem(indexes.groupIndex, indexes.index).ratio;

        this.fire('showWedge', ratio);
    },

    /**
     * Render series label.
     * @param {HTMLElement} labelContainer - series label container
     * @private
     */
    _renderSeriesLabel: function(labelContainer) {
        var sdm = this._getSeriesDataModel();
        var boundsSet = this.seriesData.groupBounds;
        var labelTheme = this.theme.label;
        var selectedIndex = this.selectedLegendIndex;
        var positionsSet = labelHelper.boundsToLabelPositions(sdm, boundsSet, labelTheme);
        var html = labelHelper.makeLabelsHtmlForBoundType(sdm, positionsSet, labelTheme, selectedIndex);

        labelContainer.innerHTML = html;
    },

    /**
     * Make exportation data for series type userEvent.
     * @param {object} seriesData - series data
     * @returns {{x: number, y: number}}
     * @private
     */
    _makeExportationSeriesData: function(seriesData) {
        return {
            x: seriesData.indexes.groupIndex,
            y: seriesData.indexes.index
        };
    }
});

tui.util.CustomEvents.mixin(HeatmapChartSeries);

module.exports = HeatmapChartSeries;

},{"../const":31,"./renderingLabelHelper":100,"./series":102}],96:[function(require,module,exports){
/**
 * @fileoverview Line chart series component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
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

        /**
         * object for requestAnimationFrame
         * @type {null | {id: number}}
         */
        this.movingAnimation = null;
    },

    /**
     * Make positions.
     * @param {number} [seriesWidth] - series width
     * @returns {Array.<Array.<{left: number, top: number}>>} positions
     * @private
     */
    _makePositions: function(seriesWidth) {
        return this._makeBasicPositions(seriesWidth);
    },

    /**
     * Make series data.
     * @returns {object} series data
     * @private
     * @override
     */
    _makeSeriesData: function() {
        return {
            chartBackground: this.chartBackground,
            groupPositions: this._makePositions()
        };
    },

    /**
     * Rerender.
     * @param {object} data - data for rerendering
     * @override
     */
    rerender: function(data) {
        var paper;

        this._cancelMovingAnimation();

        paper = Series.prototype.rerender.call(this, data);

        return paper;
    }
});

LineTypeSeriesBase.mixin(LineChartSeries);

module.exports = LineChartSeries;

},{"./lineTypeSeriesBase":97,"./series":102}],97:[function(require,module,exports){
/**
 * @fileoverview LineTypeSeriesBase is base class for line type series.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var seriesTemplate = require('./seriesTemplate');
var chartConst = require('../const');
var predicate = require('../helpers/predicate');
var renderUtil = require('../helpers/renderUtil');

var concat = Array.prototype.concat;

/**
 * @classdesc LineTypeSeriesBase is base class for line type series.
 * @class LineTypeSeriesBase
 * @mixin
 */
var LineTypeSeriesBase = tui.util.defineClass(/** @lends LineTypeSeriesBase.prototype */ {
    /**
     * Make basic positions for rendering line graph.
     * @param {number} [seriesWidth] - width of series area
     * @returns {Array.<Array.<object>>}
     * @private
     */
    _makeBasicPositions: function(seriesWidth) {
        var dimension = this.boundsMaker.getDimension('series'),
            seriesDataModel = this._getSeriesDataModel(),
            width = seriesWidth || dimension.width || 0,
            height = dimension.height,
            len = seriesDataModel.getGroupCount(),
            start = chartConst.SERIES_EXPAND_SIZE,
            step;

        if (this.data.aligned) {
            step = width / (len - 1);
        } else {
            step = width / len;
            start += (step / 2);
        }

        return seriesDataModel.map(function(seriesGroup) {
            return seriesGroup.map(function(seriesItem, index) {
                var position = {
                    left: start + (step * index),
                    top: height - (seriesItem.ratio * height) + chartConst.SERIES_EXPAND_SIZE
                };

                if (tui.util.isExisty(seriesItem.startRatio)) {
                    position.startTop = height - (seriesItem.startRatio * height) + chartConst.SERIES_EXPAND_SIZE;
                }

                return position;
            });
        }, true);
    },

    /**
     * Calculate label position top.
     * @param {{top: number, startTop: number}} basePosition - base position
     * @param {number} value - value of seriesItem
     * @param {number} labelHeight - label height
     * @param {boolean} isStart - whether start value of seriesItem or not
     * @returns {number} position top
     * @private
     */
    _calculateLabelPositionTop: function(basePosition, value, labelHeight, isStart) {
        var baseTop = basePosition.top,
            top;

        if (predicate.isValidStackOption(this.options.stackType)) {
            top = (basePosition.startTop + baseTop - labelHeight) / 2 + 1;
        } else if ((value >= 0 && !isStart) || (value < 0 && isStart)) {
            top = baseTop - labelHeight - chartConst.SERIES_LABEL_PADDING;
        } else {
            top = baseTop + chartConst.SERIES_LABEL_PADDING;
        }

        return top;
    },

    /**
     * Make label position for rendering label of series area.
     * @param {{left: number, top: number, startTop: ?number}} basePosition - base position for calculating
     * @param {number} labelHeight - label height
     * @param {(string | number)} label - label of seriesItem
     * @param {number} value - value of seriesItem
     * @param {boolean} isStart - whether start label position or not
     * @returns {{left: number, top: number}}
     * @private
     */
    _makeLabelPosition: function(basePosition, labelHeight, label, value, isStart) {
        var labelWidth = renderUtil.getRenderedLabelWidth(label, this.theme.label);
        var dimension = this.boundsMaker.getDimension('extendedSeries');

        return {
            left: (basePosition.left - (labelWidth / 2)) / dimension.width * 100,
            top: this._calculateLabelPositionTop(basePosition, value, labelHeight, isStart) / dimension.height * 100
        };
    },

    /**
     * Make html for series label for line type chart.
     * @param {number} groupIndex - index of seriesDataModel.groups
     * @param {number} index - index of seriesGroup.items
     * @param {SeriesItem} seriesItem - series item
     * @param {number} labelHeight - label height
     * @param {boolean} isStart - whether start label position or not
     * @returns {string}
     * @private
     */
    _makeSeriesLabelHtmlForLineType: function(groupIndex, index, seriesItem, labelHeight, isStart) {
        var basePosition = tui.util.extend({}, this.seriesData.groupPositions[groupIndex][index]),
            label, position;

        if (isStart) {
            label = seriesItem.startLabel;
            basePosition.top = basePosition.startTop;
        } else {
            label = seriesItem.endLabel;
        }

        position = this._makeLabelPosition(basePosition, labelHeight, label, seriesItem.value, isStart);

        return this._makeSeriesLabelHtml(position, label, groupIndex, seriesTemplate.tplCssTextForLineType, isStart);
    },

    /**
     * Render series label.
     * @param {HTMLElement} elSeriesLabelArea series label area element
     * @private
     */
    _renderSeriesLabel: function(elSeriesLabelArea) {
        var self = this,
            seriesDataModel = this._getSeriesDataModel(),
            firstLabel = seriesDataModel.getFirstItemLabel(),
            labelHeight = renderUtil.getRenderedLabelHeight(firstLabel, this.theme.label),
            htmls;

        htmls = seriesDataModel.map(function(seriesGroup, groupIndex) {
            return seriesGroup.map(function(seriesItem, index) {
                var labelHtml = self._makeSeriesLabelHtmlForLineType(groupIndex, index, seriesItem, labelHeight);

                if (seriesItem.isRange) {
                    labelHtml += self._makeSeriesLabelHtmlForLineType(groupIndex, index, seriesItem, labelHeight, true);
                }

                return labelHtml;
            }).join('');
        }, true);

        elSeriesLabelArea.innerHTML = htmls.join('');
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
     * To call showGroupTooltipLine function of graphRenderer.
     * @param {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} bound bound
     */
    onShowGroupTooltipLine: function(bound) {
        if (!this.graphRenderer.showGroupTooltipLine) {
            return;
        }
        this.graphRenderer.showGroupTooltipLine(bound);
    },

    /**
     * To call hideGroupTooltipLine function of graphRenderer.
     */
    onHideGroupTooltipLine: function() {
        if (!this.graphRenderer.hideGroupTooltipLine) {
            return;
        }
        this.graphRenderer.hideGroupTooltipLine();
    },

    /**
     * Zoom by mouse drag.
     * @param {object} data - data
     * @returns {{container: HTMLElement, paper: object}}
     */
    zoom: function(data) {
        var paper;

        this._cancelMovingAnimation();
        this._clearContainer(data.paper);
        paper = this._renderSeriesArea(this.seriesContainer, data, tui.util.bind(this._renderGraph, this));
        this._showGraphWithoutAnimation();

        if (!tui.util.isNull(this.selectedLegendIndex)) {
            this.graphRenderer.selectLegend(this.selectedLegendIndex);
        }

        return {
            container: this.seriesContainer,
            paper: paper
        };
    },

    /**
     * Whether changed limit(min, max) or not.
     * @returns {boolean}
     * @private
     */
    _isChangedLimit: function() {
        var beforeLimit = this.data.limit;
        var afterLimit = this.boundsMaker.getAxesData().yAxis.limit;

        return beforeLimit.min !== afterLimit.min || beforeLimit.max !== afterLimit.max;
    },

    /**
     * Animate for motion of series area.
     * @param {function} callback - callback function
     * @private
     */
    _animate: function(callback) {
        var self = this;
        var changedLimit = this._isChangedLimit();

        this.movingAnimation = renderUtil.startAnimation(300, function(ratio) {
            if (changedLimit && self.seriesLabelContainer) {
                self.seriesLabelContainer.innerHTML = '';
            }
            callback(ratio);
        }, function() {
            self.movingAnimation = null;
        });
    },

    /**
     * Pick first label elements.
     * @returns {Array.<HTMLElement>}
     * @private
     */
    _pickFirstLabelElements: function() {
        var itemCount = this.dataProcessor.getCategoryCount() - 1;
        var seriesLabelContainer = this.seriesLabelContainer;
        var labelElements = seriesLabelContainer.childNodes;
        var filteredElements = [];
        var firstLabelElements;

        tui.util.forEachArray(labelElements, function(element) {
            if (!element.getAttribute('data-range')) {
                filteredElements.push(element);
            }
        });
        filteredElements = tui.util.filter(filteredElements, function(element, index) {
            return ((parseInt(index, 10) + 1) % itemCount) === 1;
        });
        firstLabelElements = tui.util.map(filteredElements, function(element) {
            var nextElement = element.nextSibling;
            var elements = [element];

            if (nextElement && nextElement.getAttribute('data-range')) {
                elements.push(nextElement);
            }

            return elements;
        });

        return concat.apply([], firstLabelElements);
    },

    /**
     * Hide first labels.
     * @private
     */
    _hideFirstLabels: function() {
        var seriesLabelContainer = this.seriesLabelContainer;
        var firsLabelElements;

        if (!seriesLabelContainer) {
            return;
        }

        firsLabelElements = this._pickFirstLabelElements();
        tui.util.forEachArray(firsLabelElements, function(element) {
            seriesLabelContainer.removeChild(element);
        });
    },

    /**
     * Animate for moving of graph container.
     * @param {number} interval - interval for moving
     * @private
     */
    _animateForMoving: function(interval) {
        var graphRenderer = this.graphRenderer;
        var childrenForMoving = this.seriesContainer.childNodes;
        var areaWidth = this.boundsMaker.getDimension('extendedSeries').width;
        var beforeLeft = 0;

        this._hideFirstLabels();

        if (childrenForMoving.length) {
            beforeLeft = parseInt(childrenForMoving[0].style.left, 10) || 0;
        }

        this._animate(function(ratio) {
            var left = interval * ratio;

            tui.util.forEachArray(childrenForMoving, function(child) {
                child.style.left = (beforeLeft - left) + 'px';
            });

            graphRenderer.setSize(areaWidth + left);
        });
    },

    /**
     * Animate for resizing of label container.
     * @param {number} interval - interval for stacking
     * @private
     */
    _animateForResizing: function(interval) {
        var seriesLabelContainer = this.seriesLabelContainer;
        var areaWidth;

        if (!seriesLabelContainer) {
            return;
        }

        areaWidth = this.boundsMaker.getDimension('extendedSeries').width;

        this._animate(function(ratio) {
            var left = interval * ratio;

            seriesLabelContainer.style.width = (areaWidth - left) + 'px';
        });
    },

    /**
     * Make top of zero point for adding data.
     * @returns {number}
     * @private
     * @override
     */
    _makeZeroTopForAddingData: function() {
        var seriesHeight = this.boundsMaker.getDimension('series').height;
        var limit = this.boundsMaker.getAxesData().yAxis.limit;

        return this._getLimitDistanceFromZeroPoint(seriesHeight, limit).toMax + chartConst.SERIES_EXPAND_SIZE;
    },

    /**
     * Animate for adding data.
     * @param {{tickSize: number}} params - parameters for adding data.
     */
    animateForAddingData: function(params) {
        var seriesData = this._makeSeriesData();
        var dimension = this.boundsMaker.getDimension('extendedSeries');
        var seriesWidth = this.boundsMaker.getDimension('series').width;
        var paramsForRendering = this._makeParamsForGraphRendering(dimension, seriesData);
        var tickSize = params.tickSize;
        var shiftingOption = this.options.shifting;
        var groupPositions, zeroTop;

        if (shiftingOption) {
            seriesWidth += tickSize;
        }

        groupPositions = this._makePositions(seriesWidth);
        zeroTop = this._makeZeroTopForAddingData();

        this.graphRenderer.animateForAddingData(paramsForRendering, tickSize, groupPositions, shiftingOption, zeroTop);

        if (shiftingOption) {
            this._animateForMoving(tickSize);
        } else {
            this._animateForResizing(tickSize);
        }
    },

    /**
     * Cancel moving animation.
     * @private
     */
    _cancelMovingAnimation: function() {
        if (this.movingAnimation) {
            cancelAnimationFrame(this.movingAnimation.id);
            this.movingAnimation = null;
        }
    }
});

LineTypeSeriesBase.mixin = function(func) {
    tui.util.extend(func.prototype, LineTypeSeriesBase.prototype);
};

module.exports = LineTypeSeriesBase;

},{"../const":31,"../helpers/predicate":61,"../helpers/renderUtil":63,"./seriesTemplate":103}],98:[function(require,module,exports){
/**
 * @fileoverview Map chart series component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series');
var dom = require('../helpers/domHandler');
var predicate = require('../helpers/predicate');
var renderUtil = require('../helpers/renderUtil');

var MapChartSeries = tui.util.defineClass(Series, /** @lends MapChartSeries.prototype */ {
    /**
     * Map chart series component.
     * @constructs MapChartSeries
     * @extends Series
     * @param {object} params parameters
     *      @param {object} params.options series options
     *      @param {object} params.theme series theme
     *      @param {MapChartDataProcessor} params.dataProcessor data processor for map chart
     */
    init: function(params) {
        /**
         * Base position.
         * @type {{left: number, top: number}}
         */
        this.basePosition = {
            left: 0,
            top: 0
        };

        /**
         * Zoom magnification.
         * @type {number}
         */
        this.zoomMagn = 1;

        /**
         * Map ratio.
         * @type {number}
         */
        this.mapRatio = 1;

        /**
         * Graph dimension.
         * @type {{}}
         */
        this.graphDimension = {};

        /**
         * Limit position.
         * @type {{}}
         */
        this.limitPosition = {};

        /**
         * Map model.
         * @type {MapChartMapModel}
         */
        this.mapModel = null;

        /**
         * Previous mouse position.
         * @type {?{left: number, top: number}}
         */
        this.prevPosition = null;


        /**
         * Previous moved index.
         * @type {?number}
         */
        this.prevMovedIndex = null;

        /**
         * Whether drag or not.
         * @type {boolean}
         */
        this.isDrag = false;

        /**
         * Start position.
         * @type {?{left: number, top: number}}
         */
        this.startPosition = null;

        Series.call(this, params);
    },

    /**
     * Set map ratio.
     * @private
     */
    _setMapRatio: function() {
        var seriesDimension = this.boundsMaker.getDimension('series'),
            mapDimension = this.mapModel.getMapDimension(),
            widthRatio = seriesDimension.width / mapDimension.width,
            heightRatio = seriesDimension.height / mapDimension.height;

        this.mapRatio = Math.min(widthRatio, heightRatio);
    },

    /**
     * Set graph dimension.
     * @private
     */
    _setGraphDimension: function() {
        var seriesDimension = this.boundsMaker.getDimension('series');

        this.graphDimension = {
            width: seriesDimension.width * this.zoomMagn,
            height: seriesDimension.height * this.zoomMagn
        };
    },

    /**
     * Render series component.
     * @param {object} data data for rendering
     * @returns {HTMLElement} series element
     */
    render: function(data) {
        var container;

        this.mapModel = data.mapModel;
        this._setMapRatio();

        container = Series.prototype.render.call(this, data);

        return container;
    },

    /**
     * Set limit position to move map.
     * @private
     */
    _setLimitPositionToMoveMap: function() {
        var seriesDimension = this.boundsMaker.getDimension('series'),
            graphDimension = this.graphDimension;

        this.limitPosition = {
            left: seriesDimension.width - graphDimension.width,
            top: seriesDimension.height - graphDimension.height
        };
    },

    /**
     * Render raphael graph.
     * @param {{width: number, height: number}} dimension dimension
     * @private
     * @override
     */
    _renderGraph: function() {
        if (!this.graphContainer) {
            this.graphContainer = dom.create('DIV', 'tui-chart-series-graph-area');
            this.seriesContainer.appendChild(this.graphContainer);
        }

        this._setGraphDimension();
        renderUtil.renderDimension(this.graphContainer, this.graphDimension);

        this._setLimitPositionToMoveMap();

        this.graphRenderer.render(this.graphContainer, {
            colorSpectrum: this.data.colorSpectrum,
            mapModel: this.mapModel,
            dimension: this.graphDimension,
            theme: this.theme
        });
    },

    /**
     * Render series label.
     * @param {HTMLElement} seriesLabelContainer series label area element
     * @private
     */
    _renderSeriesLabel: function(seriesLabelContainer) {
        var self = this,
            htmls = tui.util.map(this.mapModel.getLabelData(this.zoomMagn * this.mapRatio), function(datum, index) {
                var label = datum.name || datum.code,
                    left = datum.labelPosition.left - (renderUtil.getRenderedLabelWidth(label, self.theme.label) / 2),
                    top = datum.labelPosition.top - (renderUtil.getRenderedLabelHeight(label, self.theme.label) / 2);

                return self._makeSeriesLabelHtml({
                    left: left,
                    top: top
                }, datum.name, index);
            });
        seriesLabelContainer.innerHTML = htmls.join('');
    },

    /**
     * Render series area.
     * @param {HTMLElement} seriesContainer series area element
     * @param {object} data data for rendering
     * @param {function} funcRenderGraph function for graph rendering
     * @private
     */
    _renderSeriesArea: function(seriesContainer, data, funcRenderGraph) {
        Series.prototype._renderSeriesArea.call(this, seriesContainer, data, funcRenderGraph);

        if (predicate.isShowLabel(this.options) && !this.seriesLabelContainer) {
            this.graphContainer.appendChild(this.seriesLabelContainer);
        }
    },

    /**
     * Adjust map position.
     * @param {{left: number, top: number}} targetPosition target position
     * @returns {{left: number, top: number}} adjusted position
     * @private
     */
    _adjustMapPosition: function(targetPosition) {
        return {
            left: Math.max(Math.min(targetPosition.left, 0), this.limitPosition.left),
            top: Math.max(Math.min(targetPosition.top, 0), this.limitPosition.top)
        };
    },

    /**
     * Update base position for zoom.
     * @param {{width: number, height: number}} prevDimension previous dimension
     * @param {{left: number, top: number}} prevLimitPosition previous limit position
     * @param {number} changedRatio changed ratio
     * @private
     */
    _updateBasePositionForZoom: function(prevDimension, prevLimitPosition, changedRatio) {
        var prevBasePosition = this.basePosition,
            prevLeft = prevBasePosition.left - (prevLimitPosition.left / 2),
            prevTop = prevBasePosition.top - (prevLimitPosition.top / 2),
            newBasePosition = {
                left: (prevLeft * changedRatio) + (this.limitPosition.left / 2),
                top: (prevTop * changedRatio) + (this.limitPosition.top / 2)
            };

        this.basePosition = this._adjustMapPosition(newBasePosition);
    },

    /**
     * Zoom.
     * @param {number} changedRatio changed ratio
     * @private
     */
    _zoom: function(changedRatio) {
        var prevDimension = this.graphDimension,
            prevLimitPosition = this.limitPosition;

        this._setGraphDimension();
        renderUtil.renderDimension(this.graphContainer, this.graphDimension);
        this.graphRenderer.setSize(this.graphDimension);

        this._setLimitPositionToMoveMap();
        this._updateBasePositionForZoom(prevDimension, prevLimitPosition, changedRatio);
        renderUtil.renderPosition(this.graphContainer, this.basePosition);

        if (this.seriesLabelContainer) {
            this._renderSeriesLabel(this.seriesLabelContainer);
        }
    },

    /**
     * Update positions to resize.
     * @param {number} prevMapRatio previous ratio
     * @private
     */
    _updatePositionsToResize: function(prevMapRatio) {
        var changedRatio = this.mapRatio / prevMapRatio;

        this.basePosition.left *= changedRatio;
        this.basePosition.top *= changedRatio;

        this.limitPosition.left *= changedRatio;
        this.limitPosition.top *= changedRatio;
    },

    /**
     * Resize graph.
     * @private
     */
    _resizeGraph: function() {
        var prevRatio = this.mapRatio;

        this._setMapRatio();

        this._setGraphDimension();
        renderUtil.renderDimension(this.graphContainer, this.graphDimension);
        this.graphRenderer.setSize(this.graphDimension);

        this._updatePositionsForResizing(prevRatio);
        renderUtil.renderPosition(this.graphContainer, this.basePosition);

        if (this.seriesLabelContainer) {
            this._renderSeriesLabel(this.seriesLabelContainer);
        }
    },

    /**
     * On click series.
     */
    onClickSeries: function() {},

    /**
     * Whether changed or not.
     * @param {?{left: number, top: number}} prevPosition previous position
     * @param {{left: number, top: number}} position position
     * @returns {boolean} result boolean
     * @private
     */
    _isChangedPosition: function(prevPosition, position) {
        return !prevPosition || prevPosition.left !== position.left || prevPosition.top !== position.top;
    },

    /**
     * Show wedge.
     * @param {number} index map data index
     * @private
     */
    _showWedge: function(index) {
        var datum = this.mapModel.getDatum(index);

        if (!tui.util.isUndefined(datum.ratio)) {
            this.fire('showWedge', datum.ratio);
        }
    },

    /**
     * Show tooltip
     * @param {number} index map data index
     * @param {{left: number, top: number}} mousePosition mouse position
     * @private
     */
    _showTooltip: function(index, mousePosition) {
        this.fire('showTooltip', {
            chartType: this.chartType,
            indexes: {
                index: index
            },
            mousePosition: mousePosition
        });
    },

    /**
     * Get series container bound.
     * @returns {{left: number, top: number}} container bound
     * @private
     */
    _getContainerBound: function() {
        if (!this.containerBound) {
            this.containerBound = this.seriesContainer.getBoundingClientRect();
        }

        return this.containerBound;
    },

    /**
     * On move series.
     * @param {{left: number, top: number}} position position
     */
    onMoveSeries: function(position) {
        var foundIndex = this._executeGraphRenderer(position, 'findSectorIndex'),
            containerBound;

        if (!tui.util.isNull(foundIndex)) {
            if (this.prevMovedIndex !== foundIndex) {
                if (!tui.util.isNull(this.prevMovedIndex)) {
                    this.graphRenderer.restoreColor(this.prevMovedIndex);
                    this.fire('hideWedge');
                    this.fire('hideTooltip');
                }

                this.graphRenderer.changeColor(foundIndex);
            }

            if (this._isChangedPosition(this.prevPosition, position)) {
                containerBound = this._getContainerBound();
                this._showTooltip(foundIndex, {
                    left: position.left - containerBound.left,
                    top: position.top - containerBound.top
                });
                this.prevMovedIndex = foundIndex;
            }

            this._showWedge(foundIndex);
        } else if (!tui.util.isNull(this.prevMovedIndex)) {
            this.graphRenderer.restoreColor(this.prevMovedIndex);
            this.fire('hideWedge');
            this.fire('hideTooltip');
            this.prevMovedIndex = null;
        }
        this.prevPosition = position;
    },

    /**
     * On drag start series.
     * @param {{left: number, top: number}} position position
     */
    onDragStartSeries: function(position) {
        this.startPosition = {
            left: position.left,
            top: position.top
        };
    },

    /**
     * Move position.
     * @param {{left: number, top: number}} startPosition start position
     * @param {{left: number, top: number}} endPosition end position
     * @private
     */
    _movePosition: function(startPosition, endPosition) {
        var movementPosition = this._adjustMapPosition({
            left: this.basePosition.left + (endPosition.left - startPosition.left),
            top: this.basePosition.top + (endPosition.top - startPosition.top)
        });

        renderUtil.renderPosition(this.graphContainer, movementPosition);

        this.basePosition = movementPosition;
    },

    /**
     * On drag series.
     * @param {{left: number, top: number}} position position
     */
    onDragSeries: function(position) {
        this._movePosition(this.startPosition, position);

        this.startPosition = position;

        if (!this.isDrag) {
            this.isDrag = true;
            this.fire('hideTooltip');
        }
    },

    /**
     * On drag end series.
     */
    onDragEndSeries: function() {
        this.isDrag = false;
    },

    /**
     * Move position for zoom.
     * @param {{left: number, top: number}} position mouse position
     * @param {number} changedRatio changed ratio
     * @private
     */
    _movePositionForZoom: function(position, changedRatio) {
        var seriesDimension = this.boundsMaker.getDimension('series'),
            containerBound = this._getContainerBound(),
            startPosition = {
                left: (seriesDimension.width / 2) + containerBound.left,
                top: (seriesDimension.height / 2) + containerBound.top
            },
            movementPosition = {
                left: position.left - startPosition.left,
                top: position.top - startPosition.top
            },
            endPosition;

        changedRatio = changedRatio > 1 ? -(changedRatio / 2) : changedRatio;

        endPosition = {
            left: startPosition.left + (movementPosition.left * changedRatio),
            top: startPosition.top + (movementPosition.top * changedRatio)
        };

        this._movePosition(startPosition, endPosition);
    },

    /**
     * On zoom.
     * @param {number} newMagn new zoom magnification
     * @param {?{left: number, top: number}} position mouse position
     */
    onZoom: function(newMagn, position) {
        var changedRatio = newMagn / this.zoomMagn;

        this.zoomMagn = newMagn;

        this._zoom(changedRatio);

        if (position) {
            this._movePositionForZoom(position, changedRatio);
        }

        this.userEvent.fire('zoom', newMagn);
    }
});

tui.util.CustomEvents.mixin(MapChartSeries);

module.exports = MapChartSeries;

},{"../helpers/domHandler":59,"../helpers/predicate":61,"../helpers/renderUtil":63,"./series":102}],99:[function(require,module,exports){
/**
 * @fileoverview Pie chart series component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series');
var chartConst = require('../const');
var predicate = require('../helpers/predicate');
var renderUtil = require('../helpers/renderUtil');

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
    init: function(params) {
        Series.call(this, params);

        this.isCombo = !!params.isCombo;

        this.isShowOuterLabel = !!params.isShowOuterLabel || predicate.isShowOuterLabel(this.options);

        /**
         * range for quadrant.
         * @type {?number}
         */
        this.quadrantRange = null;

        this._setDefaultOptions();
    },

    /**
     * Make valid angle.
     * @param {number} angle - angle
     * @param {number} defaultAngle - default angle
     * @returns {number}
     * @private
     */
    _makeValidAngle: function(angle, defaultAngle) {
        if (tui.util.isUndefined(angle)) {
            angle = defaultAngle;
        } else if (angle < 0) {
            angle = chartConst.ANGLE_360 - (Math.abs(angle) % chartConst.ANGLE_360);
        } else if (angle > 0) {
            angle = angle % chartConst.ANGLE_360;
        }

        return angle;
    },

    /**
     * Transform radius range.
     * @param {Array.<number>} radiusRange - radius range
     * @returns {Array}
     * @private
     */
    _transformRadiusRange: function(radiusRange) {
        radiusRange = radiusRange || ['0%', '100%'];

        return tui.util.map(radiusRange, function(percent) {
            var ratio = parseInt(percent, 10) * 0.01;

            return Math.max(Math.min(ratio, 1), 0);
        });
    },

    /**
     * Set default options for series of pie type chart.
     * @private
     */
    _setDefaultOptions: function() {
        var options = this.options;

        options.startAngle = this._makeValidAngle(options.startAngle, 0);
        options.endAngle = this._makeValidAngle(options.endAngle, options.startAngle);
        options.radiusRange = this._transformRadiusRange(options.radiusRange);

        if (options.radiusRange.length === 1) {
            options.radiusRange.unshift(0);
        }
    },

    /**
     * Calculate angle for rendering.
     * @returns {number}
     * @private
     */
    _calculateAngleForRendering: function() {
        var startAngle = this.options.startAngle;
        var endAngle = this.options.endAngle;
        var renderingAngle;

        if (startAngle < endAngle) {
            renderingAngle = endAngle - startAngle;
        } else if (startAngle > endAngle) {
            renderingAngle = chartConst.ANGLE_360 - (startAngle - endAngle);
        } else {
            renderingAngle = chartConst.ANGLE_360;
        }

        return renderingAngle;
    },

    /**
     * Make sectors information.
     * @param {{cx: number, cy: number, r: number}} circleBound circle bound
     * @returns {Array.<object>} sectors information
     * @private
     */
    _makeSectorData: function(circleBound) {
        var self = this;
        var seriesGroup = this._getSeriesDataModel().getFirstSeriesGroup();
        var cx = circleBound.cx;
        var cy = circleBound.cy;
        var r = circleBound.r;
        var angle = this.options.startAngle;
        var angleForRendering = this._calculateAngleForRendering();
        var delta = 10;
        var holeRatio = this.options.radiusRange[0];
        var centerR = r * 0.5;
        var paths;

        if (holeRatio) {
            centerR += centerR * holeRatio;
        }

        paths = seriesGroup.map(function(seriesItem) {
            var currentAngle = angleForRendering * seriesItem.ratio;
            var endAngle = angle + currentAngle;
            var popupAngle = angle + (currentAngle / 2);
            var angles = {
                start: {
                    startAngle: angle,
                    endAngle: angle
                },
                end: {
                    startAngle: angle,
                    endAngle: endAngle
                }
            };
            var positionData = {
                cx: cx,
                cy: cy,
                angle: popupAngle
            };

            angle = endAngle;

            return {
                ratio: seriesItem.ratio,
                angles: angles,
                centerPosition: self._getArcPosition(tui.util.extend({
                    r: centerR
                }, positionData)),
                outerPosition: {
                    start: self._getArcPosition(tui.util.extend({
                        r: r
                    }, positionData)),
                    middle: self._getArcPosition(tui.util.extend({
                        r: r + delta
                    }, positionData))
                }
            };
        });

        return paths;
    },

    /**
     * Make series data.
     * @returns {{
     *      chartBackground: string,
     *      circleBound: ({cx: number, cy: number, r: number}),
     *      sectorData: Array.<object>
     * }} add data for graph rendering
     * @private
     * @override
     */
    _makeSeriesData: function() {
        var circleBound = this._makeCircleBound(),
            sectorData = this._makeSectorData(circleBound);

        return {
            chartBackground: this.chartBackground,
            circleBound: circleBound,
            sectorData: sectorData
        };
    },

    /**
     * Get quadrant from angle.
     * @param {number} angle - angle
     * @param {boolean} isEnd whether end quadrant
     * @returns {number}
     * @private
     */
    _getQuadrantFromAngle: function(angle, isEnd) {
        var quadrant = parseInt(angle / chartConst.ANGLE_90, 10) + 1;

        if (isEnd && (angle % chartConst.ANGLE_90 === 0)) {
            quadrant += (quadrant === 1) ? 3 : -1;
        }

        return quadrant;
    },

    /**
     * Get range for quadrant.
     * @returns {{start: number, end: number}}
     * @private
     */
    _getRangeForQuadrant: function() {
        if (!this.quadrantRange) {
            this.quadrantRange = {
                start: this._getQuadrantFromAngle(this.options.startAngle),
                end: this._getQuadrantFromAngle(this.options.endAngle, true)
            };
        }

        return this.quadrantRange;
    },

    /**
     * Whether in range for quadrant.
     * @param {number} start - start quadrant
     * @param {number} end - end quadrant
     * @returns {boolean}
     * @private
     */
    _isInQuadrantRange: function(start, end) {
        var quadrantRange = this._getRangeForQuadrant();

        return quadrantRange.start === start && quadrantRange.end === end;
    },

    /**
     * Calculate base size.
     * @returns {number}
     * @private
     */
    _calculateBaseSize: function() {
        var dimension = this.boundsMaker.getDimension('series');
        var width = dimension.width;
        var height = dimension.height;
        var quadrantRange;

        if (!this.isCombo) {
            quadrantRange = this._getRangeForQuadrant();
            if (this._isInQuadrantRange(2, 3) || this._isInQuadrantRange(4, 1)) {
                height *= 2;
            } else if (this._isInQuadrantRange(1, 2) || this._isInQuadrantRange(3, 4)) {
                width *= 2;
            } else if (quadrantRange.start === quadrantRange.end) {
                width *= 2;
                height *= 2;
            }
        }

        return Math.min(width, height);
    },

    /**
     * Calculate radius.
     * @returns {number}
     * @private
     */
    _calculateRadius: function() {
        var radiusRatio = this.isShowOuterLabel ? chartConst.PIE_GRAPH_SMALL_RATIO : chartConst.PIE_GRAPH_DEFAULT_RATIO;
        var baseSize = this._calculateBaseSize();

        return baseSize * radiusRatio * this.options.radiusRange[1] / 2;
    },

    /**
     * Calculate center x, y.
     * @param {number} radius - radius
     * @returns {{cx: number, cy: number}}
     * @private
     */
    _calculateCenterXY: function(radius) {
        var dimension = this.boundsMaker.getDimension('series');
        var halfRadius = radius / 2;
        var cx = dimension.width / 2;
        var cy = dimension.height / 2;

        if (!this.isCombo) {
            if (this._isInQuadrantRange(1, 1)) {
                cx -= halfRadius;
                cy += halfRadius;
            } else if (this._isInQuadrantRange(1, 2)) {
                cx -= halfRadius;
            } else if (this._isInQuadrantRange(2, 2)) {
                cx -= halfRadius;
                cy -= halfRadius;
            } else if (this._isInQuadrantRange(2, 3)) {
                cy -= halfRadius;
            } else if (this._isInQuadrantRange(3, 3)) {
                cx += halfRadius;
                cy -= halfRadius;
            } else if (this._isInQuadrantRange(3, 4)) {
                cx += halfRadius;
            } else if (this._isInQuadrantRange(4, 1)) {
                cy += halfRadius;
            } else if (this._isInQuadrantRange(4, 4)) {
                cx += halfRadius;
                cy += halfRadius;
            }
        }

        return {
            cx: cx,
            cy: cy
        };
    },

    /**
     * Make circle bound
     * @returns {{cx: number, cy: number, r: number}} circle bounds
     * @private
     */
    _makeCircleBound: function() {
        var radius = this._calculateRadius();
        var centerXY = this._calculateCenterXY(radius);

        return tui.util.extend({
            r: radius
        }, centerXY);
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
     * Render raphael graph.
     * @param {{width: number, height: number}} dimension dimension
     * @param {object} seriesData series data
     * @private
     * @override
     */
    _renderGraph: function(dimension, seriesData, paper) {
        var showTootltip = tui.util.bind(this.showTooltip, this, {
            allowNegativeTooltip: !!this.allowNegativeTooltip,
            seriesName: this.seriesName,
            chartType: this.chartType
        });
        var callbacks = {
            showTooltip: showTootltip,
            hideTooltip: tui.util.bind(this.hideTooltip, this)
        };
        var params = this._makeParamsForGraphRendering(dimension, seriesData);

        params.paper = paper;

        return this.graphRenderer.render(this.seriesContainer, params, callbacks);
    },

    /**
     * Resize.
     * @override
     */
    resize: function() {
        Series.prototype.resize.apply(this, arguments);
        this._moveLegendLines();
    },

    /**
     * showTooltip is mouseover event callback on series graph.
     * @param {object} params parameters
     *      @param {boolean} params.allowNegativeTooltip whether allow negative tooltip or not
     * @param {{top:number, left: number, width: number, height: number}} bound graph bound information
     * @param {number} groupIndex group index
     * @param {number} index index
     * @param {{left: number, top: number}} mousePosition mouse position
     */
    showTooltip: function(params, bound, groupIndex, index, mousePosition) {
        this.fire('showTooltip', tui.util.extend({
            indexes: {
                groupIndex: groupIndex,
                index: index
            },
            mousePosition: mousePosition
        }, params));
    },

    /**
     * hideTooltip is mouseout event callback on series graph.
     */
    hideTooltip: function() {
        this.fire('hideTooltip');
    },

    /**
     * Make series data by selection.
     * @param {number} index index
     * @returns {{indexes: {index: number, groupIndex: number}}} series data
     * @private
     */
    _makeSeriesDataBySelection: function(index) {
        return {
            indexes: {
                index: index,
                groupIndex: index
            }
        };
    },

    /**
     * Get series label.
     * @param {object} params parameters
     *      @param {string} params.legend legend
     *      @param {string} params.label label
     *      @param {string} params.separator separator
     * @returns {string} series label
     * @private
     */
    _getSeriesLabel: function(params) {
        var seriesLabel = '';

        if (this.options.showLegend) {
            seriesLabel = '<span class="tui-chart-series-legend">' + params.legend + '</span>';
        }

        if (this.options.showLabel) {
            seriesLabel += (seriesLabel ? params.separator : '') + params.label;
        }

        return seriesLabel;
    },

    /**
     * Render center legend.
     * @param {object} params parameters
     *      @param {Array.<object>} params.positions positions
     *      @param {string} params.separator separator
     *      @param {object} params.options options
     *      @param {function} params.funcMoveToPosition function
     * @param {HTMLElement} seriesLabelContainer series label area element
     * @private
     */
    _renderLegendLabel: function(params, seriesLabelContainer) {
        var self = this;
        var dataProcessor = this.dataProcessor;
        var seriesDataModel = this._getSeriesDataModel();
        var positions = params.positions;
        var htmls = tui.util.map(dataProcessor.getLegendLabels(this.seriesName), function(legend, index) {
            var html = '',
                label, position;

            if (positions[index]) {
                label = self._getSeriesLabel({
                    legend: legend,
                    label: seriesDataModel.getSeriesItem(0, index).label,
                    separator: params.separator
                });
                position = params.funcMoveToPosition(positions[index], label);
                html = self._makeSeriesLabelHtml(position, label, index);
            }

            return html;
        });

        seriesLabelContainer.innerHTML = htmls.join('');
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
     * Pick poistions from sector data.
     * @param {string} positionType position type
     * @returns {Array} positions
     * @private
     */
    _pickPositionsFromSectorData: function(positionType) {
        return tui.util.map(this.seriesData.sectorData, function(datum) {
            return datum.ratio ? datum[positionType] : null;
        });
    },

    /**
     * Render center legend.
     * @param {HTMLElement} seriesLabelContainer series label area element
     * @private
     */
    _renderCenterLegend: function(seriesLabelContainer) {
        this._renderLegendLabel({
            positions: this._pickPositionsFromSectorData('centerPosition'),
            funcMoveToPosition: tui.util.bind(this._moveToCenterPosition, this),
            separator: '<br>'
        }, seriesLabelContainer);
    },

    /**
     * Add end position.
     * @param {number} centerLeft center left
     * @param {Array.<object>} positions positions
     * @private
     */
    _addEndPosition: function(centerLeft, positions) {
        tui.util.forEachArray(positions, function(position) {
            var end;

            if (!position) {
                return;
            }

            end = tui.util.extend({}, position.middle);
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
     * @param {HTMLElement} seriesLabelContainer series label area element
     * @private
     */
    _renderOuterLegend: function(seriesLabelContainer) {
        var centerLeft = this.getSeriesData().circleBound.cx;
        var outerPositions = this._pickPositionsFromSectorData('outerPosition');
        var filteredPositions = tui.util.filter(outerPositions, function(position) {
            return position;
        });

        this._addEndPosition(centerLeft, filteredPositions);
        this._renderLegendLabel({
            positions: outerPositions,
            funcMoveToPosition: tui.util.bind(this._moveToOuterPosition, this, centerLeft),
            separator: ':&nbsp;'
        }, seriesLabelContainer);

        this.graphRenderer.renderLegendLines(filteredPositions);
    },

    /**
     * Render series label.
     * @param {HTMLElement} seriesLabelContainer series label area element
     * @private
     */
    _renderSeriesLabel: function(seriesLabelContainer) {
        if (predicate.isLabelAlignOuter(this.options.labelAlign)) {
            this._renderOuterLegend(seriesLabelContainer);
        } else {
            this._renderCenterLegend(seriesLabelContainer);
        }
    },

    /**
     * Animate series label area.
     * @override
     */
    animateSeriesLabelArea: function() {
        this.graphRenderer.animateLegendLines(this.selectedLegendIndex);
        Series.prototype.animateSeriesLabelArea.call(this);
    },

    /**
     * Move legend lines.
     * @private
     * @override
     */
    _moveLegendLines: function() {
        var centerLeft = this.boundsMaker.getDimension('chart').width / 2,
            outerPositions = this._pickPositionsFromSectorData('outerPosition'),
            filteredPositions = tui.util.filter(outerPositions, function(position) {
                return position;
            });

        this._addEndPosition(centerLeft, filteredPositions);
        this.graphRenderer.moveLegendLines(filteredPositions);
    },

    /**
     * On click series.
     * @param {{left: number, top: number}} position mouse position
     */
    onClickSeries: function(position) {
        if (this.options.allowSelect) {
            this._executeGraphRenderer(position, 'clickSeries');
        }
    },

    /**
     * On move series.
     * @param {{left: number, top: number}} position mouse position
     */
    onMoveSeries: function(position) {
        this._executeGraphRenderer(position, 'moveMouseOnSeries');
    }
});

tui.util.CustomEvents.mixin(PieChartSeries);

module.exports = PieChartSeries;

},{"../const":31,"../helpers/predicate":61,"../helpers/renderUtil":63,"./series":102}],100:[function(require,module,exports){
/**
 * @fileoverview  renderingLabelHelper is helper for rendering of series label.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const');
var renderUtil = require('../helpers/renderUtil');
var seriesTemplate = require('./seriesTemplate');

/**
 * renderingLabelHelper is helper for rendering of series label.
 */
var renderingLabelHelper = {
    /**
     * Calculate left position for center align of series label.
     * @param {{left: number, top: number, width:number, height: number}} bound - bound
     * @param {number} labelWidth - label width
     * @returns {number}
     * @private
     */
    _calculateLeftPositionForCenterAlign: function(bound, labelWidth) {
        return bound.left + ((bound.width - labelWidth) / 2);
    },

    /**
     * Calculate top position for middle align of series label.
     * @param {{left: number, top: number, width:number, height: number}} bound - bound
     * @param {number} labelHeight - label height
     * @returns {number}
     * @private
     */
    _calculateTopPositionForMiddleAlign: function(bound, labelHeight) {
        return bound.top + ((bound.height - labelHeight + chartConst.TEXT_PADDING) / 2);
    },

    /**
     * Make position for type of bound for rendering label.
     * @param {{left: number, top: number, width:number, height: number}} bound - bound
     * @param {number} labelHeight - label height
     * @param {string} label - label
     * @param {object} theme - theme for series label
     * @returns {{left: number, top: number}}
     * @private
     */
    _makePositionForBoundType: function(bound, labelHeight, label, theme) {
        var labelWidth = renderUtil.getRenderedLabelWidth(label, theme);

        return {
            left: this._calculateLeftPositionForCenterAlign(bound, labelWidth),
            top: this._calculateTopPositionForMiddleAlign(bound, labelHeight)
        };
    },

    /**
     * Make position map for rendering label.
     * @param {SeriesItem} seriesItem - series item
     * @param {{left: number, top: number, width: number, height: number}} bound - bound
     * @param {number} labelHeight - label height
     * @param {object} theme - theme for series label
     * @param {function} makePosition - function for making position of label
     * @returns {{end: *}}
     * @private
     */
    _makePositionMap: function(seriesItem, bound, labelHeight, theme, makePosition) {
        var value = seriesItem.value;
        var isOppositeSide = value >= 0;
        var positionMap = {
            end: makePosition(bound, labelHeight, seriesItem.endLabel || seriesItem.label, theme, isOppositeSide)
        };

        if (seriesItem.isRange) {
            isOppositeSide = value < 0;
            positionMap.start = makePosition(bound, labelHeight, seriesItem.startLabel, theme, isOppositeSide);
        }

        return positionMap;
    },

    /**
     * Bounds to label positions.
     * @param {SeriesDataModel} seriesDataModel - series data model
     * @param {Array.<Array.<{left: number, top: number, width: number, height: number}>>} boundsSet - bounds set
     * @param {object} theme - theme for series label
     * @param {function} [makePosition] - function for making position of label
     * @param {boolean} [isPivot] - whether pivot or not
     * @returns {Array.<Object>}
     */
    boundsToLabelPositions: function(seriesDataModel, boundsSet, theme, makePosition, isPivot) {
        var self = this;
        var labelHeight = renderUtil.getRenderedLabelHeight(chartConst.MAX_HEIGHT_WORLD, theme);

        makePosition = makePosition || tui.util.bind(this._makePositionForBoundType, this);
        isPivot = !!isPivot;

        return seriesDataModel.map(function(seriesGroup, groupIndex) {
            var bounds = boundsSet[groupIndex];

            return seriesGroup.map(function(seriesItem, index) {
                var bound = bounds[index].end;

                return self._makePositionMap(seriesItem, bound, labelHeight, theme, makePosition);
            });
        }, isPivot);
    },

    /**
     * Make label position for bar chart.
     * @param {{left: number, top: number, width:number, height: number}} bound - bound
     * @param {number} labelHeight - label height
     * @param {string} label - label
     * @param {object} theme - theme for series label
     * @param {boolean} isOppositeSide - whether opossite side or not
     * @returns {{left: number, top: number}}
     * @private
     */
    _makePositionForBarChart: function(bound, labelHeight, label, theme, isOppositeSide) {
        var labelWidth = renderUtil.getRenderedLabelWidth(label, theme);
        var left = bound.left;

        if (isOppositeSide) {
            left += bound.width + chartConst.SERIES_LABEL_PADDING;
        } else {
            left -= labelWidth + chartConst.SERIES_LABEL_PADDING;
        }

        return {
            left: left,
            top: this._calculateTopPositionForMiddleAlign(bound, labelHeight)
        };
    },

    /**
     * Bounds to label positions for bar chart.
     * @param {SeriesDataModel} seriesDataModel - series data model
     * @param {Array.<Array.<{left: number, top: number, width: number, height: number}>>} boundsSet - bounds set
     * @param {object} theme - theme for series label
     * @returns {*|Array.<Object>|Array}
     */
    boundsToLabelPositionsForBarChart: function(seriesDataModel, boundsSet, theme) {
        var makePositionFunction = tui.util.bind(this._makePositionForBarChart, this);

        return this.boundsToLabelPositions(seriesDataModel, boundsSet, theme, makePositionFunction);
    },

    /**
     * Make label position for column chart.
     * @param {{left: number, top: number, width:number, height: number}} bound - bound
     * @param {number} labelHeight - label height
     * @param {string} label - label
     * @param {object} theme - theme for series label
     * @param {boolean} isOppositeSide - whether opossite side or not
     * @returns {{left: number, top: number}}
     * @private
     */
    _makePositionForColumnChart: function(bound, labelHeight, label, theme, isOppositeSide) {
        var labelWidth = renderUtil.getRenderedLabelWidth(label, theme);
        var top = bound.top;

        if (isOppositeSide) {
            top -= labelHeight + chartConst.SERIES_LABEL_PADDING;
        } else {
            top += bound.height + chartConst.SERIES_LABEL_PADDING;
        }

        return {
            left: this._calculateLeftPositionForCenterAlign(bound, labelWidth),
            top: top
        };
    },

    /**
     * Bounds to label positions for column chart.
     * @param {SeriesDataModel} seriesDataModel - series data model
     * @param {Array.<Array.<{left: number, top: number, width: number, height: number}>>} boundsSet - bounds set
     * @param {object} theme - theme for series label
     * @returns {*|Array.<Object>|Array}
     */
    boundsToLabelPositionsForColumnChart: function(seriesDataModel, boundsSet, theme) {
        var makePositionFunction = tui.util.bind(this._makePositionForColumnChart, this);

        return this.boundsToLabelPositions(seriesDataModel, boundsSet, theme, makePositionFunction);
    },

    /**
     * Make css text for series label.
     * @param {{left: number, top: number}} position - position for rendering label
     * @param {object} theme - theme for series label
     * @param {number} index - index of legends
     * @param {number} selectedIndex - selected index of legends
     * @param {object} [tplCssText] - cssText template object
     * @returns {*}
     * @private
     */
    _makeLabelCssText: function(position, theme, index, selectedIndex, tplCssText) {
        var cssObj = tui.util.extend(position, theme);

        tplCssText = tplCssText || seriesTemplate.tplCssText;

        if (tui.util.isExisty(selectedIndex) && (selectedIndex !== index)) {
            cssObj.opacity = renderUtil.makeOpacityCssText(chartConst.SERIES_LABEL_OPACITY);
        } else {
            cssObj.opacity = '';
        }

        return tplCssText(cssObj);
    },

    /**
     * Make html for series label.
     * @param {{left: number, top: number}} position - position for rendering label
     * @param {string} label - label of SeriesItem
     * @param {object} theme - theme for series label
     * @param {number} index - index of legends
     * @param {number} selectedIndex - selected index of legends
     * @param {object} [tplCssText] - cssText template object
     * @param {boolean} [isStart] - whether start label or not
     * @returns {string}
     */
    makeSeriesLabelHtml: function(position, label, theme, index, selectedIndex, tplCssText, isStart) {
        /*eslint max-params: [2, 7]*/
        var cssText = this._makeLabelCssText(position, theme, index, selectedIndex, tplCssText);
        var rangeLabelAttribute = '';

        if (isStart) {
            rangeLabelAttribute = ' data-range="true"';
        }

        return seriesTemplate.tplSeriesLabel({
            label: label,
            cssText: cssText,
            rangeLabelAttribute: rangeLabelAttribute
        });
    },

    /**
     * Make labels html for bound type chart.
     * @param {SeriesDataModel} seriesDataModel - series data model
     * @param {Array.<Array.<{left: number, top: number}>>} positionsSet - positions set
     * @param {object} theme - theme for series label
     * @param {number} selectedIndex - selected index of legends
     * @param {boolean} [isPivot] - whether pivot or not
     * @returns {*}
     */
    makeLabelsHtmlForBoundType: function(seriesDataModel, positionsSet, theme, selectedIndex, isPivot) {
        var makeSeriesLabelHtml = tui.util.bind(this.makeSeriesLabelHtml, this);
        var labelsHtml = seriesDataModel.map(function(seriesGroup, groupIndex) {
            return seriesGroup.map(function(seriesItem, index) {
                var positionMap = positionsSet[groupIndex][index];
                var html = makeSeriesLabelHtml(positionMap.end, seriesItem.endLabel, theme, index, selectedIndex);

                if (positionMap.start) {
                    html += makeSeriesLabelHtml(positionMap.start, seriesItem.startLabel, theme, index, selectedIndex);
                }

                return html;
            }).join('');
        }, !!isPivot).join('');

        return labelsHtml;
    },

    /**
     * Make labels html for treemap chart.
     * @param {Array.<SeriesItem>} seriesItems - seriesItems
     * @param {object.<string, {left: number, top: number, width: number, height: number}>} boundMap - bound map
     * @param {object} theme - theme for series label
     * @param {function} shouldDimmed - returns whether should dimmed or not
     * @returns {string}
     */
    makeLabelsHtmlForTreemap: function(seriesItems, boundMap, theme, shouldDimmed) {
        var self = this;
        var labelHeight = renderUtil.getRenderedLabelHeight(chartConst.MAX_HEIGHT_WORLD, theme);
        var makePosition = tui.util.bind(this._makePositionForBoundType, this);

        var labelsHtml = tui.util.map(seriesItems, function(seriesItem, index) {
            var bound = boundMap[seriesItem.id];
            var html = '';
            var position, compareIndex;

            if (bound) {
                position = self._makePositionMap(seriesItem, bound, labelHeight, theme, makePosition).end;
                compareIndex = shouldDimmed(seriesItem) ? -1 : null;

                html = self.makeSeriesLabelHtml(position, seriesItem.label, theme, index, compareIndex);
            }

            return html;
        }).join('');

        return labelsHtml;
    }
};

module.exports = renderingLabelHelper;

},{"../const":31,"../helpers/renderUtil":63,"./seriesTemplate":103}],101:[function(require,module,exports){
/**
 * @fileoverview Scatter chart series component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series');
var CoordinateTypeSeriesBase = require('./coordinateTypeSeriesBase');
var chartConst = require('../const');

var ScatterChartSeries = tui.util.defineClass(Series, /** @lends ScatterChartSeries.prototype */ {
    /**
     * Scatter chart series component.
     * @constructs ScatterChartSeries
     * @extends Series
     */
    init: function() {
        Series.apply(this, arguments);
    },

    /**
     * Make bound for scatter chart.
     * @param {{x: number, y: number, r: number}} ratioMap - ratio map
     * @returns {{left: number, top: number, raius: number}}
     * @private
     */
    _makeBound: function(ratioMap) {
        var dimension = this.boundsMaker.getDimension('series');

        return {
            left: ratioMap.x * dimension.width,
            top: dimension.height - (ratioMap.y * dimension.height),
            radius: chartConst.SCATTER_RADIUS
        };
    },

    /**
     * Make bounds for scatter chart.
     * @returns {Array.<Array.<{left: number, top: number, radius: number}>>} positions
     * @private
     */
    _makeBounds: function() {
        var self = this;
        var seriesDataModel = this._getSeriesDataModel();

        return seriesDataModel.map(function(seriesGroup) {
            return seriesGroup.map(function(seriesItem) {
                var hasRatioMap = (seriesItem && seriesItem.ratioMap);

                return hasRatioMap ? self._makeBound(seriesItem.ratioMap) : null;
            });
        });
    }
});

CoordinateTypeSeriesBase.mixin(ScatterChartSeries);
tui.util.CustomEvents.mixin(ScatterChartSeries);

module.exports = ScatterChartSeries;

},{"../const":31,"./coordinateTypeSeriesBase":94,"./series":102}],102:[function(require,module,exports){
/**
 * @fileoverview Series base component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var labelHelper = require('./renderingLabelHelper');
var chartConst = require('../const');
var dom = require('../helpers/domHandler');
var predicate = require('../helpers/predicate');
var renderUtil = require('../helpers/renderUtil');
var pluginFactory = require('../factories/pluginFactory');

var Series = tui.util.defineClass(/** @lends Series.prototype */ {
    /**
     * Series base component.
     * @constructs Series
     * @param {object} params parameters
     *      @param {object} params.options series options
     *      @param {object} params.theme series theme
     */
    init: function(params) {
        var libType = params.libType || chartConst.DEFAULT_PLUGIN;

        /**
         * Chart type
         * @type {string}
         */
        this.chartType = params.chartType;

        /**
         * Series name
         * @tpye {string}
         */
        this.seriesName = params.seriesName || params.chartType;

        /**
         * Component type
         * @type {string}
         */
        this.componentType = params.componentType;

        /**
         * Data processor
         * @type {DataProcessor}
         */
        this.dataProcessor = params.dataProcessor;

        /**
         * Bounds maker
         * @type {BoundsMaker}
         */
        this.boundsMaker = params.boundsMaker;

        /**
         * User event listener
         * @type {UserEventListener}
         */
        this.userEvent = params.userEvent;

        /**
         * chart background.
         * @type {string}
         */
        this.chartBackground = params.chartBackground;

        /**
         * Options
         * @type {object}
         */
        this.options = params.options || {};

        /**
         * Theme
         * @type {object}
         */
        this.orgTheme = this.theme = params.theme;

        /**
         * whether chart has axes or not
         * @type {boolean}
         */
        this.hasAxes = !!params.hasAxes;

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

        /**
         * series container
         * @type {HTMLElement}
         */
        this.seriesContainer = null;

        /**
         * series label container
         * @type {HTMLElement}
         */
        this.seriesLabelContainer = null;

        /**
         * series data
         * @type {Array.<object>}
         */
        this.seriesData = [];

        /**
         * Selected legend index
         * @type {?number}
         */
        this.selectedLegendIndex = null;

        /**
         * effector for show layer
         * @type {object}
         */
        this.labelShowEffector = null;
    },

    /**
     * Get seriesDataModel.
     * @returns {SeriesDataModel}
     * @private
     */
    _getSeriesDataModel: function() {
        return this.dataProcessor.getSeriesDataModel(this.seriesName);
    },

    /**
     * Make series data.
     * @private
     * @abstract
     */
    _makeSeriesData: function() {},

    /**
     * Get seriesData
     * @returns {object} series data
     */
    getSeriesData: function() {
        return this.seriesData;
    },

    /**
     * Render series label.
     * @private
     * @abstract
     */
    _renderSeriesLabel: function() {},

    /**
     * Render series label area
     * @param {?HTMLElement} seriesLabelContainer series label area element
     * @returns {HTMLElement} series label area element
     * @private
     */
    _renderSeriesLabelArea: function(seriesLabelContainer) {
        var extendedDimension;

        if (!seriesLabelContainer) {
            seriesLabelContainer = dom.create('div', 'tui-chart-series-label-area');
            if (!predicate.isMousePositionChart(this.chartType)) {
                extendedDimension = this.boundsMaker.getDimension('extendedSeries');
                renderUtil.renderDimension(seriesLabelContainer, extendedDimension);
            }
        }

        this._renderSeriesLabel(seriesLabelContainer);

        return seriesLabelContainer;
    },

    /**
     * Render series area.
     * @param {HTMLElement} seriesContainer series area element
     * @param {object} data data for rendering
     * @param {function} funcRenderGraph function for graph rendering
     * @returns {object}
     * @private
     */
    _renderSeriesArea: function(seriesContainer, data, funcRenderGraph) {
        var extendedBound = this.boundsMaker.getBound('extendedSeries');
        var seriesData, seriesLabelContainer, paper;

        this.data = data;

        this.seriesData = seriesData = this._makeSeriesData();

        if (!data.paper) {
            renderUtil.renderDimension(seriesContainer, extendedBound.dimension);
        }

        this._renderPosition(seriesContainer, extendedBound.position);

        if (funcRenderGraph) {
            paper = funcRenderGraph(extendedBound.dimension, seriesData, data.paper);
        }

        if (predicate.isShowLabel(this.options)) {
            seriesLabelContainer = this._renderSeriesLabelArea(this.seriesLabelContainer);
            this.seriesLabelContainer = seriesLabelContainer;
            dom.append(seriesContainer, seriesLabelContainer);
        }

        return paper;
    },

    /**
     * Make parameters for graph rendering.
     * @param {{width: number, height: number}} dimension dimension
     * @param {object} seriesData series data
     * @returns {object} parameters for graph rendering
     * @private
     */
    _makeParamsForGraphRendering: function(dimension, seriesData) {
        return tui.util.extend({
            dimension: dimension,
            chartType: this.seriesName,
            theme: this.theme,
            options: this.options
        }, seriesData);
    },

    /**
     * Render raphael graph.
     * @param {{width: number, height: number}} dimension - dimension
     * @param {object} seriesData - series data
     * @param {object} [paper] - raphael paper
     * @returns {object}
     * @private
     */
    _renderGraph: function(dimension, seriesData, paper) {
        var params = this._makeParamsForGraphRendering(dimension, seriesData);

        paper = this.graphRenderer.render(this.seriesContainer, params, paper);

        return paper;
    },

    /**
     * Render series component.
     * @param {object} data data for rendering
     * @returns {HTMLElement} series element
     */
    render: function(data) {
        var container = dom.create('DIV', this.className);
        var paper;

        this.seriesContainer = container;
        paper = this._renderSeriesArea(container, data, tui.util.bind(this._renderGraph, this));

        return {
            container: container,
            paper: paper
        };
    },

    /**
     * Update theme.
     * @param {object} theme legend theme
     * @param {?Array.<?boolean>} checkedLegends checked legends
     * @returns {object} updated theme
     * @private
     */
    _updateTheme: function(theme, checkedLegends) {
        var cloneTheme;

        if (!checkedLegends.length) {
            return theme;
        }

        cloneTheme = JSON.parse(JSON.stringify(theme));
        cloneTheme.colors = tui.util.filter(cloneTheme.colors, function(color, index) {
            return checkedLegends[index];
        });

        return cloneTheme;
    },

    /**
     * Clear container.
     * @param {object} paper - raphael object
     * @private
     */
    _clearContainer: function(paper) {
        if (this.graphRenderer.clear && !paper) {
            this.graphRenderer.clear();
        }

        this.seriesContainer.innerHTML = '';
        this.seriesLabelContainer = null;
        this.seriesData = [];
    },

    /**
     * Rerender.
     * @param {object} data data for rendering
     * @returns {{container: HTMLElement, paper: object}}
     */
    rerender: function(data) {
        var paper;

        this._clearContainer();

        if (this.dataProcessor.getGroupCount(this.seriesName)) {
            if (data.checkedLegends) {
                this.theme = this._updateTheme(this.orgTheme, data.checkedLegends);
            }

            paper = this._renderSeriesArea(this.seriesContainer, data, tui.util.bind(this._renderGraph, this));

            if (this.labelShowEffector) {
                clearInterval(this.labelShowEffector.timerId);
            }

            if (data.checkedLegends) {
                this.animateComponent(true);
            } else {
                this._showGraphWithoutAnimation();
            }

            if (!tui.util.isNull(this.selectedLegendIndex)) {
                this.graphRenderer.selectLegend(this.selectedLegendIndex);
            }
        }

        return {
            container: this.seriesContainer,
            paper: paper
        };
    },

    /**
     * Whether use label or not.
     * @returns {boolean}
     * @private
     */
    _useLabel: function() {
        return this.seriesLabelContainer && (this.options.showLabel || this.options.showLegend);
    },

    /**
     * Show series label without animation.
     * @private
     */
    _showSeriesLabelWithoutAnimation: function() {
        dom.addClass(this.seriesLabelContainer, 'show opacity');
    },

    /**
     * Show graph without animation.
     * @private
     */
    _showGraphWithoutAnimation: function() {
        this.graphRenderer.showGraph();

        if (this._useLabel()) {
            this._showSeriesLabelWithoutAnimation();
        }
    },

    /**
     * Resize raphael graph.
     * @param {{width: number, height: number}} dimension dimension
     * @param {object} seriesData series data
     * @private
     */
    _resizeGraph: function(dimension, seriesData) {
        this.graphRenderer.resize(tui.util.extend({
            dimension: dimension
        }, seriesData));
    },

    /**
     * Resize series component.
     * }} bound series bound
     * @param {object} data data for rendering
     */
    resize: function(data) {
        this._renderSeriesArea(this.seriesContainer, data, tui.util.bind(this._resizeGraph, this));
    },

    /**
     * Render bounds
     * @param {HTMLElement} el series element
     * @param {{top: number, left: number}} position series position
     * @private
     */
    _renderPosition: function(el, position) {
        var hiddenWidth = renderUtil.isOldBrowser() ? 1 : 0;

        renderUtil.renderPosition(el, {
            top: position.top - (hiddenWidth),
            left: position.left - (hiddenWidth * 2)
        });
    },

    /**
     * Get limit distance from zero point.
     * @param {number} size chart size (width or height)
     * @param {{min: number, max: number}} limit limit
     * @returns {{toMax: number, toMin: number}} pixel distance
     * @private
     */
    _getLimitDistanceFromZeroPoint: function(size, limit) {
        var min = limit.min,
            max = limit.max,
            distance = max - min,
            toMax = 0,
            toMin = 0;

        if (min <= 0 && max >= 0) {
            toMax = (distance + min) / distance * size;
            toMin = (distance - max) / distance * size;
        } else if (min > 0) {
            toMax = size;
        }

        return {
            toMax: toMax,
            toMin: toMin
        };
    },

    /**
     * Find label element.
     * @param {HTMLElement} elTarget target element
     * @returns {HTMLElement} label element
     * @private
     */
    _findLabelElement: function(elTarget) {
        var elLabel = null;

        if (dom.hasClass(elTarget, chartConst.CLASS_NAME_SERIES_LABEL)) {
            elLabel = elTarget;
        } else {
            elLabel = dom.findParentByClass(elTarget, chartConst.CLASS_NAME_SERIES_LABEL);
        }

        return elLabel;
    },

    /**
     * To call showAnimation function of graphRenderer.
     * @param {{groupIndex: number, index: number}} data data
     */
    onShowAnimation: function(data) {
        if (!this.graphRenderer.showAnimation) {
            return;
        }
        this.graphRenderer.showAnimation(data);
    },

    /**
     * To call hideAnimation function of graphRenderer.
     * @param {{groupIndex: number, index: number}} data data
     */
    onHideAnimation: function(data) {
        if (!this.graphRenderer.hideAnimation || !data) {
            return;
        }
        this.graphRenderer.hideAnimation(data);
    },

    /**
     * To call showGroupAnimation function of graphRenderer.
     * @param {number} index index
     */
    onShowGroupAnimation: function(index) {
        if (!this.graphRenderer.showGroupAnimation) {
            return;
        }
        this.graphRenderer.showGroupAnimation(index);
    },

    /**
     * To call hideGroupAnimation function of graphRenderer.
     * @param {number} index index
     */
    onHideGroupAnimation: function(index) {
        if (!this.graphRenderer.hideGroupAnimation) {
            return;
        }
        this.graphRenderer.hideGroupAnimation(index);
    },

    /**
     * Animate component.
     * @param {boolean} [isRerendering] - whether rerendering or not
     */
    animateComponent: function(isRerendering) {
        if (this.graphRenderer.animate) {
            this.graphRenderer.animate(tui.util.bind(this.animateSeriesLabelArea, this, isRerendering));
        } else {
            this.animateSeriesLabelArea(isRerendering);
        }
    },

    /**
     * Make html about series label.
     * @param {{left: number, top: number}} position - position for rendering
     * @param {string} label - label of SeriesItem
     * @param {number} index - index of legend
     * @param {object} [tplCssText] - cssText template object
     * @param {boolean} [isStart] - whether start label or not
     * @returns {string}
     * @private
     */
    _makeSeriesLabelHtml: function(position, label, index, tplCssText, isStart) {
        var labelTheme = this.theme.label;
        var selectedIndex = this.selectedLegendIndex;

        return labelHelper.makeSeriesLabelHtml(position, label, labelTheme, index, selectedIndex, tplCssText, isStart);
    },

    /**
     * Fire load event.
     * @param {boolean} [isRerendering] - whether rerendering or not
     * @private
     */
    _fireLoadEvent: function(isRerendering) {
        if (!isRerendering) {
            this.userEvent.fire('load');
        }
    },

    /**
     * Animate series label area.
     * @param {boolean} [isRerendering] - whether rerendering or not
     */
    animateSeriesLabelArea: function(isRerendering) {
        var self = this;

        if (!this._useLabel()) {
            this._fireLoadEvent(isRerendering);

            return;
        }

        if (renderUtil.isIE7()) {
            this._showSeriesLabelWithoutAnimation();
            this._fireLoadEvent(isRerendering);
        } else {
            dom.addClass(this.seriesLabelContainer, 'show');
            this.labelShowEffector = new tui.component.Effects.Fade({
                element: this.seriesLabelContainer,
                duration: 300
            });
            this.labelShowEffector.action({
                start: 0,
                end: 1,
                complete: function() {
                    if (self.labelShowEffector) {
                        clearInterval(self.labelShowEffector.timerId);
                    }
                    self.labelShowEffector = null;
                    dom.addClass(self.seriesLabelContainer, 'opacity');
                    self._fireLoadEvent(isRerendering);
                }
            });
        }
    },

    /**
     * Make exportation data for series type userEvent.
     * @param {object} seriesData series data
     * @returns {{chartType: string, legend: string, legendIndex: number, index: number}} export data
     * @private
     */
    _makeExportationSeriesData: function(seriesData) {
        var legendIndex = seriesData.indexes.index;
        var legendData = this.dataProcessor.getLegendItem(legendIndex);

        return {
            chartType: legendData.chartType,
            legend: legendData.label,
            legendIndex: legendIndex,
            index: seriesData.indexes.groupIndex
        };
    },

    /**
     * Execute graph renderer.
     * @param {{left: number, top: number}} position mouse position
     * @param {string} funcName function name
     * @returns {*} result.
     * @private
     */
    _executeGraphRenderer: function(position, funcName) {
        var isShowLabel = false;
        var result;

        this.fire('hideTooltipContainer');

        if (this.seriesLabelContainer && dom.hasClass(this.seriesLabelContainer, 'show')) {
            dom.removeClass(this.seriesLabelContainer, 'show');
            isShowLabel = true;
        }

        result = this.graphRenderer[funcName](position);

        if (isShowLabel) {
            dom.addClass(this.seriesLabelContainer, 'show');
        }

        this.fire('showTooltipContainer');

        return result;
    },

    /**
     * To call selectSeries callback of userEvent.
     * @param {object} seriesData series data
     */
    onSelectSeries: function(seriesData) {
        this.userEvent.fire('selectSeries', this._makeExportationSeriesData(seriesData));
        if (this.options.allowSelect && this.graphRenderer.selectSeries) {
            this.graphRenderer.selectSeries(seriesData.indexes);
        }
    },

    /**
     * To call unselectSeries callback of userEvent.
     * @param {object} seriesData series data.
     */
    onUnselectSeries: function(seriesData) {
        this.userEvent.fire('unselectSeries', this._makeExportationSeriesData(seriesData));
        if (this.options.allowSelect && this.graphRenderer.unselectSeries) {
            this.graphRenderer.unselectSeries(seriesData.indexes);
        }
    },

    /**
     *On select legend.
     * @param {string} seriesName - series name
     * @param {?number} legendIndex - legend index
     */
    onSelectLegend: function(seriesName, legendIndex) {
        if ((this.seriesName !== seriesName) && !tui.util.isNull(legendIndex)) {
            legendIndex = -1;
        }

        this.selectedLegendIndex = legendIndex;

        if (this._getSeriesDataModel().getGroupCount()) {
            this._renderSeriesArea(this.seriesContainer, this.data);
            this.graphRenderer.selectLegend(legendIndex);
        }
    },

    /**
     * Show label.
     */
    showLabel: function() {
        this.options.showLabel = true;
        this._showSeriesLabelWithoutAnimation();
    },

    /**
     * Hide label.
     */
    hideLabel: function() {
        this.options.showLabel = false;
        dom.removeClass(this.seriesLabelContainer, 'show');
        dom.removeClass(this.seriesLabelContainer, 'opacity');
    }
});

module.exports = Series;

},{"../const":31,"../factories/pluginFactory":52,"../helpers/domHandler":59,"../helpers/predicate":61,"../helpers/renderUtil":63,"./renderingLabelHelper":100}],103:[function(require,module,exports){
/**
 * @fileoverview This is templates of series.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var templateMaker = require('../helpers/templateMaker');

var htmls = {
    HTML_SERIES_LABEL: '<div class="tui-chart-series-label" style="{{ cssText }}"{{ rangeLabelAttribute }}>' +
        '{{ label }}</div>',
    TEXT_CSS_TEXT: 'left:{{ left }}px;top:{{ top }}px;font-family:{{ fontFamily }};' +
        'font-size:{{ fontSize }}px{{opacity}}',
    TEXT_CSS_TEXT_FOR_LINE_TYPE: 'left:{{ left }}%;top:{{ top }}%;font-family:{{ fontFamily }};' +
    'font-size:{{ fontSize }}px{{opacity}}',
    HTML_ZOOM_BUTTONS: '<a class="tui-chart-zoom-btn" href="#" data-magn="2">' +
            '<div class="horizontal-line"></div><div class="vertical-line"></div></a>' +
        '<a class="tui-chart-zoom-btn" href="#" data-magn="0.5"><div class="horizontal-line"></div></a>',
    HTML_SERIES_BLOCK: '<div class="tui-chart-series-block" style="{{ cssText }}">{{ label }}</div>'
};

module.exports = {
    tplSeriesLabel: templateMaker.template(htmls.HTML_SERIES_LABEL),
    tplCssText: templateMaker.template(htmls.TEXT_CSS_TEXT),
    tplCssTextForLineType: templateMaker.template(htmls.TEXT_CSS_TEXT_FOR_LINE_TYPE),
    ZOOM_BUTTONS: htmls.HTML_ZOOM_BUTTONS,
    tplSeriesBlock: templateMaker.template(htmls.HTML_SERIES_BLOCK)
};

},{"../helpers/templateMaker":64}],104:[function(require,module,exports){
/**
 * @fileoverview squarifier create squarified bounds for rendering graph of treemap chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var squarifier = {
    /**
     * bound map
     * @type {object.<string, {width: number, height: number, left: number, top: number}>}
     */
    boundMap: {},

    /**
     * Make base bound for calculating bounds.
     * @param {{width: number, height: number}} dimension - dimension
     * @returns {{width: number, height: number, left: number, top: number}}
     * @private
     */
    _makeBaseBound: function(dimension) {
        return tui.util.extend({
            left: 0,
            top: 0
        }, dimension);
    },

    /**
     * Calculate scale for calculating weight.
     * @param {Array.<number>} values - values
     * @param {number} width - width of series area
     * @param {number} height - height of series area
     * @returns {number}
     * @private
     */
    _calculateScale: function(values, width, height) {
        return (width * height) / tui.util.sum(values);
    },

    /**
     * Make base data for creating squarified bounds.
     * @param {Array.<SeriesItem>} seriesItems - SeriesItems
     * @param {number} width - width of series area
     * @param {number} height - height of series area
     * @returns {Array.<{itme: SeriesItem, weight: number}>}
     * @private
     */
    _makeBaseData: function(seriesItems, width, height) {
        var scale = this._calculateScale(tui.util.pluck(seriesItems, 'value'), width, height);
        var data = tui.util.map(seriesItems, function(seriesItem) {
            return {
                id: seriesItem.id,
                weight: seriesItem.value * scale
            };
        }).sort(function(a, b) {
            return b.weight - a.weight;
        });

        return data;
    },

    /**
     * Calculate worst aspect ratio.
     * Referred function worst() in https://www.win.tue.nl/~vanwijk/stm.pdf
     * @param {number} sum - sum for weights
     * @param {number} min - minimum weight
     * @param {number} max - maximum weight
     * @param {number} baseSize - base size (width or height)
     * @returns {number}
     * @private
     */
    _worst: function(sum, min, max, baseSize) {
        var sumSquare = sum * sum;
        var sizeSquare = baseSize * baseSize;

        return Math.max((sizeSquare * max) / sumSquare, sumSquare / (sizeSquare * min));
    },

    /**
     * Whether changed stack direction or not.
     * @param {number} sum - sum for weights
     * @param {Array.<number>} weights - weights
     * @param {number} baseSize - base size
     * @param {number} newWeight - new weight
     * @returns {boolean}
     * @private
     */
    _changedStackDirection: function(sum, weights, baseSize, newWeight) {
        var min = tui.util.min(weights);
        var max = tui.util.max(weights);
        var beforeWorst = this._worst(sum, min, max, baseSize);
        var newWorst = this._worst(sum + newWeight, Math.min(min, newWeight), Math.max(max, newWeight), baseSize);

        return newWorst >= beforeWorst;
    },

    /**
     * Whether type of vertical stack or not.
     * @param {{width: number, height: number}} baseBound - base bound
     * @returns {boolean}
     * @private
     */
    _isVerticalStack: function(baseBound) {
        return baseBound.height < baseBound.width;
    },

    /**
     * Select base size from baseBound.
     * @param {{width: number, height: number}} baseBound - base bound
     * @returns {number}
     * @private
     */
    _selectBaseSize: function(baseBound) {
        return this._isVerticalStack(baseBound) ? baseBound.height : baseBound.width;
    },

    /**
     * Calculate fixed size.
     * @param {number} baseSize - base size
     * @param {number} sum - sum for weights
     * @param {Array.<{weight: number}>} row - row
     * @returns {number}
     * @private
     */
    _calculateFixedSize: function(baseSize, sum, row) {
        var weights;

        if (!sum) {
            weights = tui.util.pluck(row, 'weight');
            sum = tui.util.sum(weights);
        }

        return sum / baseSize;
    },

    /**
     * Add bounds.
     * @param {number} startPosition - start position
     * @param {Array.<{weight: number}>} row - row
     * @param {number} fixedSize - fixed size
     * @param {function} callback - callback function
     * @private
     */
    _addBounds: function(startPosition, row, fixedSize, callback) {
        tui.util.reduce([startPosition].concat(row), function(storedPosition, rowDatum) {
            var dynamicSize = rowDatum.weight / fixedSize;

            callback(dynamicSize, storedPosition, rowDatum.id);

            return storedPosition + dynamicSize;
        });
    },

    /**
     * Add bound.
     * @param {number} left - left position
     * @param {number} top - top position
     * @param {number} width - width
     * @param {number} height - height
     * @param {string | number} id - id of seriesItem
     * @private
     */
    _addBound: function(left, top, width, height, id) {
        this.boundMap[id] = {
            left: left,
            top: top,
            width: width,
            height: height
        };
    },

    /**
     * Add bounds for type of vertical stack.
     * @param {Array.<{weight: number}>} row - row
     * @param {{left: number, top: number, width: number, height: number}} baseBound - base bound
     * @param {number} baseSize - base size
     * @param {number} sum - sum for weights of row
     * @private
     */
    _addBoundsForVerticalStack: function(row, baseBound, baseSize, sum) {
        var self = this;
        var fixedWidth = this._calculateFixedSize(baseSize, sum, row);

        this._addBounds(baseBound.top, row, fixedWidth, function(dynamicHeight, storedTop, id) {
            self._addBound(baseBound.left, storedTop, fixedWidth, dynamicHeight, id);
        });

        baseBound.left += fixedWidth;
        baseBound.width -= fixedWidth;
    },

    /**
     * Add bounds for type of horizontal stack.
     * @param {Array.<{weight: number}>} row - row
     * @param {{left: number, top: number, width: number, height: number}} baseBound - base bound
     * @param {number} baseSize - base size
     * @param {number} sum - sum for weights of row
     * @private
     */
    _addBoundsForHorizontalStack: function(row, baseBound, baseSize, sum) {
        var self = this;
        var fixedHeight = this._calculateFixedSize(baseSize, sum, row);

        this._addBounds(baseBound.left, row, fixedHeight, function(dynamicWidth, storedLeft, id) {
            self._addBound(storedLeft, baseBound.top, dynamicWidth, fixedHeight, id);
        });

        baseBound.top += fixedHeight;
        baseBound.height -= fixedHeight;
    },

    /**
     * Get adding bounds function.
     * @param {{width: number, height: number}} baseBound - base bound
     * @returns {*}
     * @private
     */
    _getAddingBoundsFunction: function(baseBound) {
        var addBound;

        if (this._isVerticalStack(baseBound)) {
            addBound = tui.util.bind(this._addBoundsForVerticalStack, this);
        } else {
            addBound = tui.util.bind(this._addBoundsForHorizontalStack, this);
        }

        return addBound;
    },

    /**
     * Create squarified bound map for graph rendering.
     * @param {{width: number, height: number}} dimension - dimension
     * @param {Array.<SeriesItem>} seriesItems - seriesItems
     * @returns {object.<string, {width: number, height: number, left: number, top: number}>}
     */
    squarify: function(dimension, seriesItems) {
        var self = this;
        var baseBound = this._makeBaseBound(dimension);
        var baseData = this._makeBaseData(seriesItems, baseBound.width, baseBound.height);
        var row = [];
        var baseSize, addBounds;

        this.boundMap = {};

        tui.util.forEachArray(baseData, function(datum) {
            var weights = tui.util.pluck(row, 'weight');
            var sum = tui.util.sum(weights);

            if (row.length && self._changedStackDirection(sum, weights, baseSize, datum.weight)) {
                addBounds(row, baseBound, baseSize, sum);
                row = [];
            }

            if (!row.length) {
                baseSize = self._selectBaseSize(baseBound);
                addBounds = self._getAddingBoundsFunction(baseBound);
            }

            row.push(datum);
        });

        if (row.length) {
            addBounds(row, baseBound, baseSize);
        }

        return this.boundMap;
    }
};

module.exports = squarifier;

},{}],105:[function(require,module,exports){
/**
 * @fileoverview Series component for rendering graph of treemap chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series');
var squarifier = require('./squarifier');
var labelHelper = require('./renderingLabelHelper');
var chartConst = require('../const');
var predicate = require('../helpers/predicate');

var TreemapChartSeries = tui.util.defineClass(Series, /** @lends TreemapChartSeries.prototype */ {
    /**
     * Series component for rendering graph of treemap chart.
     * @constructs TreemapChartSeries
     * @extends Series
     */
    init: function() {
        Series.apply(this, arguments);

        this.theme.borderColor = this.theme.borderColor || chartConst.TREEMAP_DEFAULT_BORDER;

        /**
         * root id
         * @type {string}
         */
        this.rootId = chartConst.TREEMAP_ROOT_ID;

        /**
         * start depth of seriesItem for rendering graph
         * @type {number}
         */
        this.startDepth = 1;

        /**
         * selected group
         * @type {null | number}
         */
        this.selectedGroup = null;

        /**
         * bound map
         * @type {null|object.<string, object>}
         */
        this.boundMap = null;

        this._initOptions();
    },

    /**
     * Initialize options.
     * @private
     */
    _initOptions: function() {
        this.options.useColorValue = !!this.options.useColorValue;

        if (tui.util.isUndefined(this.options.zoomable)) {
            this.options.zoomable = !this.options.useColorValue;
        }

        if (tui.util.isUndefined(this.options.useLeafLabel)) {
            this.options.useLeafLabel = !this.options.zoomable;
        }
    },

    /**
     * Make series data.
     * @returns {{
     *      groupBounds: object.<string, {left: number, top: number, width: number, height: number}>,
     *      seriesDataModel: SeriesDataModel
     * }}
     * @private
     * @override
     */
    _makeSeriesData: function() {
        var boundMap = this._getBoundMap();

        return {
            boundMap: boundMap,
            groupBounds: this._makeBounds(boundMap),
            seriesDataModel: this._getSeriesDataModel(),
            startDepth: this.startDepth,
            isPivot: true,
            colorSpectrum: this.options.useColorValue ? this.data.colorSpectrum : null,
            chartBackground: this.chartBackground,
            zoomable: this.options.zoomable
        };
    },

    /**
     * Make bound map by dimension.
     * @param {string | number} parent - parent id
     * @param {object.<string, {left: number, top: number, width: number, height: number}>} boundMap - bound map
     * @param {{width: number, height: number}} dimension - dimension
     * @returns {object.<string, {left: number, top: number, width: number, height: number}>}
     * @private
     */
    _makeBoundMap: function(parent, boundMap, dimension) {
        var self = this;
        var seriesDataModel = this._getSeriesDataModel();
        var seriesItems;

        dimension = dimension || this.boundsMaker.getDimension('series');
        seriesItems = seriesDataModel.findSeriesItemsByParent(parent);
        boundMap = tui.util.extend(boundMap || {}, squarifier.squarify(dimension, seriesItems));

        tui.util.forEachArray(seriesItems, function(seriesItem) {
            boundMap = self._makeBoundMap(seriesItem.id, boundMap, boundMap[seriesItem.id]);
        });

        return boundMap;
    },

    /**
     * Make bounds for rendering graph.
     * @param {object.<string, {left: number, top: number, width: number, height: number}>} boundMap - bound map
     * @returns {Array.<Array.<{left: number, top: number, width: number, height: number}>>}
     * @private
     */
    _makeBounds: function(boundMap) {
        var startDepth = this.startDepth;
        var seriesDataModel = this._getSeriesDataModel();
        var isValid;

        if (this.options.zoomable) {
            isValid = function(seriesItem) {
                return seriesItem.depth === startDepth;
            };
        } else {
            isValid = function(seriesItem) {
                return !seriesItem.hasChild;
            };
        }

        return seriesDataModel.map(function(seriesGroup) {
            return seriesGroup.map(function(seriesItem) {
                var bound = boundMap[seriesItem.id];
                var result = null;

                if (bound && isValid(seriesItem)) {
                    result = {
                        end: bound
                    };
                }

                return result;
            }, true);
        }, true);
    },

    /**
     * Get bound map for rendering graph.
     * @returns {object.<string, {left: number, top: number, width: number, height: number}>}
     * @private
     */
    _getBoundMap: function() {
        if (!this.boundMap) {
            this.boundMap = this._makeBoundMap(this.rootId);
        }

        return this.boundMap;
    },

    /**
     * Whether should dimmed or not.
     * @param {SeriesDataModel} seriesDataModel - SeriesDataModel for treemap
     * @param {SeriesItem} hoverSeriesItem - hover SeriesItem
     * @param {SeriesItem} seriesItem - target SeriesItem
     * @returns {boolean}
     * @private
     */
    _shouldDimmed: function(seriesDataModel, hoverSeriesItem, seriesItem) {
        var shouldTransparent = false;
        var parent;

        if (hoverSeriesItem && seriesItem.id !== hoverSeriesItem.id && seriesItem.group === hoverSeriesItem.group) {
            parent = seriesDataModel.findParentByDepth(seriesItem.id, hoverSeriesItem.depth + 1);

            if (parent && parent.parent === hoverSeriesItem.id) {
                shouldTransparent = true;
            }
        }

        return shouldTransparent;
    },

    /**
     * Render series label.
     * @param {HTMLElement} labelContainer - series label container
     * @param {SeriesItem} hoverSeriesItem - hover SeriesItem
     * @private
     */
    _renderSeriesLabel: function(labelContainer, hoverSeriesItem) {
        var seriesDataModel = this._getSeriesDataModel();
        var boundMap = this._getBoundMap();
        var seriesItems, shouldDimmed, html;

        if (this.options.useLeafLabel) {
            seriesItems = seriesDataModel.findLeafSeriesItems(this.selectedGroup);
        } else {
            seriesItems = seriesDataModel.findSeriesItemsByDepth(this.startDepth, this.selectedGroup);
        }

        shouldDimmed = tui.util.bind(this._shouldDimmed, this, seriesDataModel, hoverSeriesItem);
        html = labelHelper.makeLabelsHtmlForTreemap(seriesItems, boundMap, this.theme.label, shouldDimmed);

        labelContainer.innerHTML = html;
    },

    /**
     * Resize.
     * @override
     */
    resize: function() {
        this.boundMap = null;
        Series.prototype.resize.apply(this, arguments);
    },

    /**
     * Zoom.
     * @param {string | number} rootId - root id
     * @param {number} startDepth - start depth
     * @param {number} group - group
     * @private
     */
    _zoom: function(rootId, startDepth, group) {
        this._clearContainer();
        this.boundMap = null;
        this.rootId = rootId;
        this.startDepth = startDepth;
        this.selectedGroup = group;
        this._renderSeriesArea(this.seriesContainer, this.data, tui.util.bind(this._renderGraph, this));

        if (predicate.isShowLabel(this.options)) {
            this._showSeriesLabelWithoutAnimation();
        }
    },

    /**
     * Zoom
     * @param {{index: number}} data - data for zoom
     */
    zoom: function(data) {
        var detectedIndex = data.index;
        var seriesDataModel, seriesItem;

        if (detectedIndex === -1) {
            this._zoom(chartConst.TREEMAP_ROOT_ID, 1, null);

            return;
        }

        seriesDataModel = this._getSeriesDataModel();
        seriesItem = seriesDataModel.getSeriesItem(0, detectedIndex, true);

        if (!seriesItem || !seriesItem.hasChild) {
            return;
        }

        this._zoom(seriesItem.id, seriesItem.depth + 1, seriesItem.group);
        this.fire('afterZoom', detectedIndex);
    },

    /**
     * To call showAnimation function of graphRenderer.
     * @param {{groupIndex: number, index: number}} indexes - indexes
     */
    onShowAnimation: function(indexes) {
        var seriesItem;

        if (!predicate.isShowLabel(this.options)) {
            return;
        }

        seriesItem = this._getSeriesDataModel().getSeriesItem(indexes.groupIndex, indexes.index, true);

        this._renderSeriesLabel(this.seriesLabelContainer, seriesItem);
        this.graphRenderer.showAnimation(indexes, this.options.useColorValue, 0.6);
    },

    /**
     * To call hideAnimation function of graphRenderer.
     * @param {{groupIndex: number, index: number}} indexes - indexes
     */
    onHideAnimation: function(indexes) {
        if (!predicate.isShowLabel(this.options) || !indexes) {
            return;
        }

        this._renderSeriesLabel(this.seriesLabelContainer);
        this.graphRenderer.hideAnimation(indexes, this.options.useColorValue);
    },

    /**
     * On show tooltip for calling showWedge.
     * @param {{indexes: {groupIndex: number, index: number}}} params - parameters
     */
    onShowTooltip: function(params) {
        var seriesDataModel = this._getSeriesDataModel();
        var indexes = params.indexes;
        var ratio = seriesDataModel.getSeriesItem(indexes.groupIndex, indexes.index, true).ratio;

        if (ratio > -1) {
            this.fire('showWedge', ratio);
        }
    }
});

tui.util.CustomEvents.mixin(TreemapChartSeries);

module.exports = TreemapChartSeries;

},{"../const":31,"../helpers/predicate":61,"./renderingLabelHelper":100,"./series":102,"./squarifier":104}],106:[function(require,module,exports){
/**
 * @fileoverview Zoom component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var seriesTemplate = require('./seriesTemplate'),
    chartConst = require('../const'),
    dom = require('../helpers/domHandler'),
    renderUtil = require('../helpers/renderUtil'),
    eventListener = require('../helpers/eventListener');

var Zoom = tui.util.defineClass(/** @lends Zoom.prototype */{
    /**
     * Zoom component.
     * @param {object} params parameters
     *      @param {BoundsMaker} params.boundsMaker bounds maker
     * @constructs Zoom
     */
    init: function(params) {
        this.className = 'tui-chart-zoom-area';

        /**
         * Bounds maker
         * @type {BoundsMaker}
         */
        this.boundsMaker = params.boundsMaker;

        /**
         * Magnification.
         * @type {number}
         */
        this.magn = 1;

        /**
         * Stacked wheelDelta.
         * @type {number}
         */
        this.stackedWheelDelta = 0;
    },

    /**
     * Render.
     * @returns {HTMLElement} zoom container
     */
    render: function() {
        var container = dom.create('DIV', this.className);

        container.innerHTML += seriesTemplate.ZOOM_BUTTONS;
        renderUtil.renderPosition(container, this.boundsMaker.getPosition('series'));
        this._attachEvent(container);

        return container;
    },

    /**
     * Find button element.
     * @param {HTMLElement} target target element.
     * @returns {?HTMLElement} button element
     * @private
     */
    _findBtnElement: function(target) {
        var btnClassName = 'tui-chart-zoom-btn',
            btnElement = target;

        if (!dom.hasClass(target, btnClassName)) {
            btnElement = dom.findParentByClass(target, btnClassName);
        }

        return btnElement;
    },

    /**
     * Zoom
     * @param {number} magn magnification
     * @param {?{left: number, top: number}} position mouse position
     * @private
     */
    _zoom: function(magn, position) {
        var changedMagn = Math.min(Math.max(1, this.magn * magn), chartConst.MAX_ZOOM_MAGN);

        if (changedMagn !== this.magn) {
            this.magn = changedMagn;
            this.fire('zoom', this.magn, position);
        }
    },

    /**
     * On click.
     * @param {MouseEvent} e mouse event
     * @returns {?boolean} prevent default for ie
     * @private
     */
    _onClick: function(e) {
        var target = e.target || e.srcElement,
            btnElement = this._findBtnElement(target),
            magn;

        if (btnElement) {
            magn = parseFloat(btnElement.getAttribute('data-magn'));
            this._zoom(magn);
        }

        if (e.preventDefault) {
            e.preventDefault();
        }

        return false;
    },

    /**
     * Attach event.
     * @param {HTMLElement} target target element
     * @private
     */
    _attachEvent: function(target) {
        eventListener.on(target, 'click', this._onClick, this);
    },

    /**
     * Calculate magnification from wheelDelta.
     * @param {number} wheelDelta wheelDelta
     * @returns {number} magnification
     * @private
     */
    _calculateMagn: function(wheelDelta) {
        var tick = parseInt(wheelDelta / chartConst.WHEEL_TICK, 10),
            magn;

        if (tick > 0) {
            magn = Math.pow(2, tick);
        } else {
            magn = Math.pow(0.5, Math.abs(tick));
        }

        return magn;
    },

    /**
     * On wheel.
     * @param {number} wheelDelta wheelDelta
     * @param {{left: number, top: number}} position mouse position
     */
    onWheel: function(wheelDelta, position) {
        var magn;

        if (Math.abs(wheelDelta) < chartConst.WHEEL_TICK) {
            this.stackedWheelDelta += wheelDelta;
        } else {
            this.stackedWheelDelta = wheelDelta;
        }

        if (Math.abs(this.stackedWheelDelta) < chartConst.WHEEL_TICK) {
            return;
        }

        magn = this._calculateMagn(this.stackedWheelDelta);

        this._zoom(magn, position);

        this.stackedWheelDelta = this.stackedWheelDelta % chartConst.WHEEL_TICK;
    }
});

tui.util.CustomEvents.mixin(Zoom);

module.exports = Zoom;

},{"../const":31,"../helpers/domHandler":59,"../helpers/eventListener":60,"../helpers/renderUtil":63,"./seriesTemplate":103}],107:[function(require,module,exports){
'use strict';

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
        singleColors: [],
        borderColor: EMPTY,
        selectionColor: EMPTY,
        startColor: '#F4F4F4',
        endColor: '#345391',
        overColor: '#F0C952'
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

},{}],108:[function(require,module,exports){
/**
 * @fileoverview Group tooltip component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var TooltipBase = require('./tooltipBase'),
    GroupTooltipPositionModel = require('./groupTooltipPositionModel'),
    chartConst = require('../const'),
    dom = require('../helpers/domHandler'),
    renderUtil = require('../helpers/renderUtil'),
    defaultTheme = require('../themes/defaultTheme'),
    tooltipTemplate = require('./tooltipTemplate');

/**
 * @classdesc GroupTooltip component.
 * @class GroupTooltip
 */
var GroupTooltip = tui.util.defineClass(TooltipBase, /** @lends GroupTooltip.prototype */ {
    /**
     * Group tooltip component.
     * @constructs GroupTooltip
     * @override
     */
    init: function() {
        this.prevIndex = null;
        TooltipBase.apply(this, arguments);
    },

    /**
     * Make tooltip html.
     * @param {string} category category
     * @param {Array.<{value: string, legend: string, chartType: string, suffix: ?string}>} items items data
     * @returns {string} tooltip html
     * @private
     */
    _makeTooltipHtml: function(category, items) {
        var template = tooltipTemplate.tplGroupItem,
            cssTextTemplate = tooltipTemplate.tplGroupCssText,
            colors = this._makeColors(this.theme),
            itemsHtml = tui.util.map(items, function(item, index) {
                return template(tui.util.extend({
                    cssText: cssTextTemplate({color: colors[index]})
                }, item));
            }).join('');

        return tooltipTemplate.tplGroup({
            category: category,
            items: itemsHtml
        });
    },

    /**
     * Set default align option of tooltip.
     * @private
     * @override
     */
    _setDefaultTooltipPositionOption: function() {
        if (this.options.align) {
            return;
        }

        if (this.isVertical) {
            this.options.align = chartConst.TOOLTIP_DEFAULT_GROUP_ALIGN_OPTION;
        } else {
            this.options.align = chartConst.TOOLTIP_DEFAULT_GROUP_HORIZONTAL_ALIGN_OPTION;
        }
    },

    /**
     * Render tooltip component.
     * @returns {HTMLElement} tooltip element
     * @override
     */
    render: function() {
        var el = TooltipBase.prototype.render.call(this),
            chartDimension = this.boundsMaker.getDimension('chart'),
            bound = this.boundsMaker.getBound('tooltip');

        this.positionModel = new GroupTooltipPositionModel(chartDimension, bound, this.isVertical, this.options);

        return el;
    },

    /**
     * Rerender.
     * @param {{checkedLegends: Array.<boolean>}} data rendering data
     * @override
     */
    rerender: function(data) {
        TooltipBase.prototype.rerender.call(this, data);
        this.prevIndex = null;

        if (data.checkedLegends) {
            this.theme = this._updateLegendTheme(data.checkedLegends);
        }
    },

    /**
     * Zoom.
     */
    zoom: function() {
        this.prevIndex = null;
        TooltipBase.prototype.zoom.call(this);
    },

    /**
     * Update legend theme.
     * @param {object | Array.<boolean>}checkedLegends checked legends
     * @returns {{colors: Array.<string>}} legend theme
     * @private
     */
    _updateLegendTheme: function(checkedLegends) {
        var colors = [];

        tui.util.forEachArray(this.dataProcessor.getOriginalLegendData(), function(item) {
            var _checkedLegends = checkedLegends[item.chartType] || checkedLegends;
            if (_checkedLegends[item.index]) {
                colors.push(item.theme.color);
            }
        });

        return {
            colors: colors
        };
    },

    /**
     * Make tooltip data.
     * @returns {Array.<object>} tooltip data
     * @override
     */
    _makeTooltipData: function() {
        var self = this;

        return tui.util.map(this.dataProcessor.getSeriesGroups(), function(seriesGroup, index) {
            return {
                category: self.dataProcessor.getCategory(index),
                values: seriesGroup.pluck('label')
            };
        });
    },

    /**
     * Make colors.
     * @param {object} theme tooltip theme
     * @returns {Array.<string>} colors
     * @private
     */
    _makeColors: function(theme) {
        var colorIndex = 0,
            legendLabels = this.dataProcessor.getLegendData(),
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
     * Make rendering data about legend item.
     * @param {Array.<string>} values values
     * @returns {Array.<{value: string, legend: string, chartType: string, suffix: ?string}>} legend item data.
     * @private
     */
    _makeItemRenderingData: function(values) {
        var dataProcessor = this.dataProcessor,
            suffix = this.suffix;

        return tui.util.map(values, function(value, index) {
            var legendLabel = dataProcessor.getLegendItem(index);

            return {
                value: value,
                legend: legendLabel.label,
                chartType: legendLabel.chartType,
                suffix: suffix
            };
        });
    },

    /**
     * Make tooltip.
     * @param {number} groupIndex group index
     * @returns {string} tooltip html
     * @private
     */
    _makeGroupTooltipHtml: function(groupIndex) {
        var data = this.data[groupIndex],
            items = this._makeItemRenderingData(data.values);

        return this.templateFunc(data.category, items);
    },

    /**
     * Get tooltip sector element.
     * @returns {HTMLElement} sector element
     * @private
     */
    _getTooltipSectorElement: function() {
        var groupTooltipSector;

        if (!this.groupTooltipSector) {
            this.groupTooltipSector = groupTooltipSector = dom.create('DIV', 'tui-chart-group-tooltip-sector');
            dom.append(this.tooltipContainer, groupTooltipSector);
        }

        return this.groupTooltipSector;
    },

    /**
     * Make bound about tooltip sector of vertical type chart.
     * @param {number} height height
     * @param {{start: number, end: number}} range range
     * @param {boolean} isLine whether line or not
     * @returns {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound
     * @private
     */
    _makeVerticalTooltipSectorBound: function(height, range, isLine) {
        var width;

        if (isLine) {
            width = 1;
            height += 6;
        } else {
            width = range.end - range.start;
        }

        return {
            dimension: {
                width: width,
                height: height
            },
            position: {
                left: range.start + chartConst.SERIES_EXPAND_SIZE,
                top: chartConst.SERIES_EXPAND_SIZE
            }
        };
    },

    /**
     * Make bound about tooltip sector of horizontal type chart.
     * @param {number} width width
     * @param {{start: number, end:number}} range range
     * @returns {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound
     * @private
     */
    _makeHorizontalTooltipSectorBound: function(width, range) {
        return {
            dimension: {
                width: width,
                height: range.end - range.start
            },
            position: {
                left: chartConst.SERIES_EXPAND_SIZE,
                top: range.start + chartConst.SERIES_EXPAND_SIZE
            }
        };
    },

    /**
     * Make bound about tooltip sector.
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
     * @param {boolean} [isMoving] whether moving or not
     * @private
     */
    _showTooltipSector: function(size, range, isVertical, index, isMoving) {
        var groupTooltipSector = this._getTooltipSectorElement(),
            isLine = (range.start === range.end),
            bound = this._makeTooltipSectorBound(size, range, isVertical, isLine);

        if (isLine) {
            this.fire('showGroupTooltipLine', bound);
        } else {
            renderUtil.renderDimension(groupTooltipSector, bound.dimension);
            renderUtil.renderPosition(groupTooltipSector, bound.position);
            dom.addClass(groupTooltipSector, 'show');
        }

        if (isMoving) {
            index -= 1;
        }

        this.fire('showGroupAnimation', index);
    },

    /**
     * Hide tooltip sector.
     * @param {number} index index
     * @private
     */
    _hideTooltipSector: function(index) {
        var groupTooltipSector = this._getTooltipSectorElement();

        dom.removeClass(groupTooltipSector, 'show');
        this.fire('hideGroupAnimation', index);
        this.fire('hideGroupTooltipLine');
    },

    /**
     * Show tooltip.
     * @param {HTMLElement} elTooltip tooltip element
     * @param {{index: number, range: {start: number, end: number},
     *          size: number, direction: string, isVertical: boolean
     *        }} params coordinate event parameters
     * @param {{left: number, top: number}} prevPosition prev position
     * @private
     */
    _showTooltip: function(elTooltip, params, prevPosition) {
        var dimension, position;

        if (!tui.util.isNull(this.prevIndex)) {
            this.fire('hideGroupAnimation', this.prevIndex);
        }

        elTooltip.innerHTML = this._makeGroupTooltipHtml(params.index);

        this._fireBeforeShowTooltip(params.index, params.range);

        dom.addClass(elTooltip, 'show');

        this._showTooltipSector(params.size, params.range, params.isVertical, params.index, params.isMoving);

        dimension = this.getTooltipDimension(elTooltip);
        position = this.positionModel.calculatePosition(dimension, params.range);

        this._moveToPosition(elTooltip, position, prevPosition);

        this._fireAfterShowTooltip(params.index, params.range, {
            element: elTooltip,
            position: position
        });

        this.prevIndex = params.index;
    },

    /**
     * To call beforeShowTooltip callback of userEvent.
     * @param {number} index index
     * @param {{start: number, end: number}} range range
     * @private
     */
    _fireBeforeShowTooltip: function(index, range) {
        this.userEvent.fire('beforeShowTooltip', {
            index: index,
            range: range
        });
    },

    /**
     * To call afterShowTooltip callback of userEvent.
     * @param {number} index index
     * @param {{start: number, end: number}} range range
     * @param {object} additionParams addition parameters
     * @private
     */
    _fireAfterShowTooltip: function(index, range, additionParams) {
        this.userEvent.fire('afterShowTooltip', tui.util.extend({
            index: index,
            range: range
        }, additionParams));
    },

    /**
     * Hide tooltip.
     * @param {HTMLElement} elTooltip tooltip element
     * @param {number} index index
     * @private
     */
    _hideTooltip: function(elTooltip, index) {
        this.prevIndex = null;
        this._hideTooltipSector(index);
        dom.removeClass(elTooltip, 'show');
        elTooltip.style.cssText = '';
    }
});

module.exports = GroupTooltip;

},{"../const":31,"../helpers/domHandler":59,"../helpers/renderUtil":63,"../themes/defaultTheme":107,"./groupTooltipPositionModel":109,"./tooltipBase":113,"./tooltipTemplate":114}],109:[function(require,module,exports){
/**
 * @fileoverview GroupTooltipPositionModel is position model for group tooltip..
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const');

var GroupTooltipPositionModel = tui.util.defineClass(/** @lends GroupTooltipPositionModel.prototype */ {
    /**
     * GroupTooltipPositionModel is position model for group tooltip.
     * @constructs GroupTooltipPositionModel
     * @param {{width: number, height: number}} chartDimension chart dimension
     * @param {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} areaBound tooltip area bound
     * @param {boolean} isVertical whether vertical or not
     * @param {{align: ?string, position: {left: number, top: number}}} options tooltip options
     */
    init: function(chartDimension, areaBound, isVertical, options) {
        /**
         * chart dimension
         * @type {{width: number, height: number}}
         */
        this.chartDimension = chartDimension;

        /**
         * tooltip area bound
         * @type {{dimension: {width: number, height: number}, position: {left: number, top: number}}}
         */
        this.areaBound = areaBound;

        /**
         * Whether vertical or not
         * @type {boolean}
         */
        this.isVertical = isVertical;

        /**
         * tooltip options
         * @type {{align: ?string, position: {left: number, top: number}}}
         */
        this.options = options;

        /**
         * For caching
         * @type {object}
         */
        this.positions = {};

        this._setData(chartDimension, areaBound, isVertical, options);
    },

    /**
     * Get horizontal direction.
     * @param {?string} alignOption align option
     * @returns {string} direction
     * @private
     */
    _getHorizontalDirection: function(alignOption) {
        var direction;

        alignOption = alignOption || '';
        if (alignOption.indexOf('left') > -1) {
            direction = chartConst.TOOLTIP_DIRECTION_BACKWARD;
        } else if (alignOption.indexOf('center') > -1) {
            direction = chartConst.TOOLTIP_DIRECTION_CENTER;
        } else {
            direction = chartConst.TOOLTIP_DIRECTION_FORWARD;
        }

        return direction;
    },

    /**
     * Make vertical data.
     * @param {{width: number, height: number}} chartDimension chart dimension
     * @param {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} areaBound tooltip area bound
     * @param {?string} alignOption align option
     * @returns {{
     *      positionType: string, sizeType: string, direction: (string),
     *      areaPosition: number, areaSize: number, chartSize: number,
     *      basePosition: (number)
     * }} vertical data
     * @private
     */
    _makeVerticalData: function(chartDimension, areaBound, alignOption) {
        var hDirection = this._getHorizontalDirection(alignOption);

        return {
            positionType: 'left',
            sizeType: 'width',
            direction: hDirection,
            areaPosition: areaBound.position.left,
            areaSize: areaBound.dimension.width,
            chartSize: chartDimension.width,
            basePosition: chartConst.SERIES_EXPAND_SIZE
        };
    },

    /**
     * Get vertical direction.
     * @param {?string} alignOption align option
     * @returns {string} direction
     * @private
     */
    _getVerticalDirection: function(alignOption) {
        var direction;

        alignOption = alignOption || '';

        if (alignOption.indexOf('top') > -1) {
            direction = chartConst.TOOLTIP_DIRECTION_BACKWARD;
        } else if (alignOption.indexOf('bottom') > -1) {
            direction = chartConst.TOOLTIP_DIRECTION_FORWARD;
        } else {
            direction = chartConst.TOOLTIP_DIRECTION_CENTER;
        }

        return direction;
    },

    /**
     * Make horizontal data.
     * @param {{width: number, height: number}} chartDimension chart dimension
     * @param {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} areaBound tooltip area bound
     * @param {?string} alignOption align option
     * @returns {{
     *      positionType: string, sizeType: string, direction: (string),
     *      areaPosition: number, areaSize: number, chartSize: number,
     *      basePosition: (number)
     * }} horizontal data
     * @private
     */
    _makeHorizontalData: function(chartDimension, areaBound, alignOption) {
        var vDirection = this._getVerticalDirection(alignOption);

        return {
            positionType: 'top',
            sizeType: 'height',
            direction: vDirection,
            areaPosition: areaBound.position.top,
            areaSize: areaBound.dimension.height,
            chartSize: chartDimension.height,
            basePosition: chartConst.SERIES_EXPAND_SIZE
        };
    },

    /**
     * Set data.
     * @param {{width: number, height: number}} chartDimension chart dimension
     * @param {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} areaBound tooltip area bound
     * @param {boolean} isVertical whether vertical or not
     * @param {{align: ?string, position: {left: number, top: number}}} options tooltip options
     * @private
     */
    _setData: function(chartDimension, areaBound, isVertical, options) {
        var verticalData = this._makeVerticalData(chartDimension, areaBound, options.align),
            horizontalData = this._makeHorizontalData(chartDimension, areaBound, options.align);

        if (isVertical) {
            this.mainData = verticalData;
            this.subData = horizontalData;
        } else {
            this.mainData = horizontalData;
            this.subData = verticalData;
        }

        this.positionOption = tui.util.extend({
            left: 0,
            top: 0
        }, options.position);

        this.positions = {};
    },

    /**
     * Calculate main position value.
     * @param {number} tooltipSize tooltip size (width or height)
     * @param {{start: number, end: number}} range range
     * @param {object} data data
     *      @param {string} data.direction direction
     *      @param {number} data.basePosition basePosition
     * @returns {number} position value
     * @private
     */
    _calculateMainPositionValue: function(tooltipSize, range, data) {
        var isLine = (range.start === range.end),
            lineTypePadding = 9,
            otherTypePadding = 5,
            padding = isLine ? lineTypePadding : otherTypePadding,
            value = data.basePosition;

        if (data.direction === chartConst.TOOLTIP_DIRECTION_FORWARD) {
            value += range.end + padding;
        } else if (data.direction === chartConst.TOOLTIP_DIRECTION_BACKWARD) {
            value += range.start - tooltipSize - padding;
        } else if (isLine) {
            value += range.start - tooltipSize / 2;
        } else {
            value += range.start + ((range.end - range.start - tooltipSize) / 2);
        }

        return value;
    },

    /**
     * Calculate sub position value.
     * @param {number} tooltipSize tooltip size (width or height)
     * @param {object} data data
     *      @param {number} data.areaSize tooltip area size (width or height)
     *      @param {string} data.direction direction
     *      @param {number} data.basePosition basePosition
     * @returns {number} position value
     * @private
     */
    _calculateSubPositionValue: function(tooltipSize, data) {
        var middle = data.areaSize / 2,
            value;

        if (data.direction === chartConst.TOOLTIP_DIRECTION_FORWARD) {
            value = middle + data.basePosition;
        } else if (data.direction === chartConst.TOOLTIP_DIRECTION_BACKWARD) {
            value = middle - tooltipSize + data.basePosition;
        } else {
            value = middle - (tooltipSize / 2) + data.basePosition;
        }

        return value;
    },

    /**
     * Make position value diff.
     * @param {number} value positoin value
     * @param {number} tooltipSize tooltip size (width or height)
     * @param {object} data data
     *      @param {number} data.chartSize chart size (width or height)
     *      @param {number} data.areaPosition tooltip area position (left or top)
     * @returns {number} diff
     * @private
     */
    _makePositionValueDiff: function(value, tooltipSize, data) {
        return value + data.areaPosition + tooltipSize - data.chartSize;
    },

    /**
     * Adjust backward position value.
     * @param {number} value position value
     * @param {{start: number, end: number}} range range
     * @param {number} tooltipSize tooltip size (width or height)
     * @param {object} data data
     *      @param {number} data.chartSize chart size (width or height)
     *      @param {number} data.areaPosition tooltip area position (left or top)
     *      @param {number} data.basePosition basePosition
     * @returns {number} position value
     * @private
     */
    _adjustBackwardPositionValue: function(value, range, tooltipSize, data) {
        var changedValue;

        if (value < -data.areaPosition) {
            changedValue = this._calculateMainPositionValue(tooltipSize, range, {
                direction: chartConst.TOOLTIP_DIRECTION_FORWARD,
                basePosition: data.basePosition
            });
            if (this._makePositionValueDiff(changedValue, tooltipSize, data) > 0) {
                value = -data.areaPosition;
            } else {
                value = changedValue;
            }
        }

        return value;
    },

    /**
     * Adjust forward position value.
     * @param {number} value position value
     * @param {{start: number, end: number}} range range
     * @param {number} tooltipSize tooltip size (width or height)
     * @param {object} data data
     *      @param {number} data.chartSize chart size (width or height)
     *      @param {number} data.areaPosition tooltip area position (left or top)
     *      @param {number} data.basePosition basePosition
     * @returns {number} position value
     * @private
     */
    _adjustForwardPositionValue: function(value, range, tooltipSize, data) {
        var diff = this._makePositionValueDiff(value, tooltipSize, data),
            changedValue;

        if (diff > 0) {
            changedValue = this._calculateMainPositionValue(tooltipSize, range, {
                direction: chartConst.TOOLTIP_DIRECTION_BACKWARD,
                basePosition: data.basePosition
            });
            if (changedValue < -data.areaPosition) {
                value -= diff;
            } else {
                value = changedValue;
            }
        }

        return value;
    },

    /**
     * Adjust main position value
     * @param {number} value position value
     * @param {{start: number, end: number}} range range
     * @param {number} tooltipSize tooltip size (width or height)
     * @param {object} data data
     *      @param {number} data.chartSize chart size (width or height)
     *      @param {number} data.areaPosition tooltip area position (left or top)
     * @returns {number} position value
     * @private
     */
    _adjustMainPositionValue: function(value, range, tooltipSize, data) {
        if (data.direction === chartConst.TOOLTIP_DIRECTION_BACKWARD) {
            value = this._adjustBackwardPositionValue(value, range, tooltipSize, data);
        } else if (data.direction === chartConst.TOOLTIP_DIRECTION_FORWARD) {
            value = this._adjustForwardPositionValue(value, range, tooltipSize, data);
        } else {
            value = Math.max(value, -data.areaPosition);
            value = Math.min(value, data.chartSize - data.areaPosition - tooltipSize);
        }

        return value;
    },

    /**
     * Adjust sub position value.
     * @param {number} value position value
     * @param {number} tooltipSize tooltip size (width or height)
     * @param {object} data data
     *      @param {number} data.chartSize chart size (width or height)
     *      @param {number} data.areaPosition tooltip area position (left or top)
     *      @param {number} data.basePosition basePosition
     * @returns {number} position value
     * @private
     */
    _adjustSubPositionValue: function(value, tooltipSize, data) {
        if (data.direction === chartConst.TOOLTIP_DIRECTION_FORWARD) {
            value = Math.min(value, data.chartSize - data.areaPosition - tooltipSize);
        } else {
            value = Math.max(value, -data.areaPosition);
        }

        return value;
    },

    /**
     * Make caching key.
     * @param {{start: number, end: number}} range range
     * @returns {string} key
     * @private
     */
    _makeCachingKey: function(range) {
        return range.start + '-' + range.end;
    },

    /**
     * Add position option.
     * @param {number} position position
     * @param {string} positionType position type (left or top)
     * @returns {number} position
     * @private
     */
    _addPositionOptionValue: function(position, positionType) {
        return position + this.positionOption[positionType];
    },

    /**
     * Make main position value.
     * @param {{width: number, height: number}} tooltipDimension tooltip dimension
     * @param {{start: number, end: number}} range tooltip sector range
     * @param {{
     *      positionType: string, sizeType: string, direction: (string),
     *      areaPosition: number, areaSize: number, chartSize: number,
     *      basePosition: (number)
     * }} main main data
     * @returns {number} position value
     * @private
     */
    _makeMainPositionValue: function(tooltipDimension, range, main) {
        var value;

        value = this._calculateMainPositionValue(tooltipDimension[main.sizeType], range, main);
        value = this._addPositionOptionValue(value, main.positionType);
        value = this._adjustMainPositionValue(value, range, tooltipDimension[main.sizeType], main);

        return value;
    },

    /**
     * Make sub position value.
     * @param {{width: number, height: number}} tooltipDimension tooltip dimension
     * @param {{
     *      positionType: string, sizeType: string, direction: (string),
     *      areaPosition: number, areaSize: number, chartSize: number,
     *      basePosition: (number)
     * }} sub sub data
     * @returns {number} position value
     * @private
     */
    _makeSubPositionValue: function(tooltipDimension, sub) {
        var value;

        value = this._calculateSubPositionValue(tooltipDimension[sub.sizeType], sub);
        value = this._addPositionOptionValue(value, sub.positionType);
        value = this._adjustSubPositionValue(value, tooltipDimension[sub.sizeType], sub);

        return value;
    },

    /**
     * Calculate group tooltip position.
     * @param {{width: number, height: number}} tooltipDimension tooltip dimension
     * @param {{start: number, end: number}} range tooltip sector range
     * @returns {{left: number, top: number}} group tooltip position
     */
    calculatePosition: function(tooltipDimension, range) {
        var key = this._makeCachingKey(range),
            main = this.mainData,
            sub = this.subData,
            position = this.positions[key];

        if (!position) {
            position = {};
            position[main.positionType] = this._makeMainPositionValue(tooltipDimension, range, main);
            position[sub.positionType] = this._makeSubPositionValue(tooltipDimension, sub);
            this.positions[key] = position;
        }

        return position;
    },

    /**
     * Update tooltip options for position calculation.
     * @param {{align: ?string, position: {left: number, top: number}}} options tooltip options
     */
    updateOptions: function(options) {
        this.options = options;
        this._setData(this.chartDimension, this.areaBound, this.isVertical, options);
    },

    /**
     * Update tooltip bound for position calculation.
     * @param {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} bound tooltip area bound
     */
    updateBound: function(bound) {
        this.areaBound = bound;
        this._setData(this.chartDimension, bound, this.isVertical, this.options);
    }
});

module.exports = GroupTooltipPositionModel;

},{"../const":31}],110:[function(require,module,exports){
/**
 * @fileoverview Tooltip component for map chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    TooltipBase = require('./tooltipBase'),
    singleTooltipMixer = require('./singleTooltipMixer'),
    tooltipTemplate = require('./tooltipTemplate');

/**
 * @classdesc MapChartTooltip component.
 * @class MapChartTooltip
 */
var MapChartTooltip = tui.util.defineClass(TooltipBase, /** @lends MapChartTooltip.prototype */ {
    /**
     * Map chart tooltip component.
     * @constructs MapChartTooltip
     * @override
     */
    init: function() {
        /**
         * Map model
         * @type {MapChartMapModel}
         */
        this.mapModel = null;

        TooltipBase.apply(this, arguments);
    },

    /**
     * Make tooltip html.
     * @param {{name: string, value: number}} datum tooltip datum
     * @returns {string} tooltip html
     * @private
     */
    _makeTooltipHtml: function(datum) {
        return tooltipTemplate.tplMapChartDefault(datum);
    },

    /**
     * Make single tooltip html.
     * @param {string} chartType chart type
     * @param {{groupIndex: number, index: number}} indexes indexes
     * @returns {string} tooltip html
     * @private
     */
    _makeSingleTooltipHtml: function(chartType, indexes) {
        var datum = this.mapModel.getDatum(indexes.index),
            suffix = this.options.suffix ? ' ' + this.options.suffix : '';

        return this.templateFunc({
            name: datum.name || datum.code,
            value: datum.label,
            suffix: suffix
        });
    },

    /**
     * Make parameters for show tooltip user event.
     * @param {{groupIndex: number, index: number}} indexes indexes
     * @param {object} additionParams addition parameters
     * @returns {{chartType: string, legend: string, legendIndex: number, index: number}} parameters for show tooltip
     * @private
     */
    _makeShowTooltipParams: function(indexes, additionParams) {
        var datum = this.mapModel.getDatum(indexes.index),
            params;

        params = tui.util.extend({
            chartType: this.chartType,
            code: datum.code,
            name: datum.name,
            value: datum.label,
            index: indexes.index
        }, additionParams);

        return params;
    },


    /**
     * Set default align option of tooltip.
     * @private
     * @override
     */
    _setDefaultTooltipPositionOption: function() {
        if (!this.options.align) {
            this.options.align = chartConst.TOOLTIP_DEFAULT_ALIGN_OPTION;
        }
    },

    /**
     * Render.
     * @param {{mapModel: MapChartMapModel}} data data for rendering
     * @returns {HTMLElement} tooltip element
     */
    render: function(data) {
        this.mapModel = data.mapModel;

        return TooltipBase.prototype.render.call(this);
    }
});

singleTooltipMixer.mixin(MapChartTooltip);
module.exports = MapChartTooltip;

},{"../const":31,"./singleTooltipMixer":111,"./tooltipBase":113,"./tooltipTemplate":114}],111:[function(require,module,exports){
/**
 * @fileoverview singleTooltipMixer is single tooltip mixer of map chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    predicate = require('../helpers/predicate'),
    dom = require('../helpers/domHandler'),
    renderUtil = require('../helpers/renderUtil');

/**
 * singleTooltipMixer is single tooltip mixer of map chart.
 * @mixin
 */
var singleTooltipMixer = {

    /**
     * Fire custom event showAnimation.
     * @param {{groupIndex: number, index: number}} indexes indexes
     * @param {string} chartType chart type
     * @private
     */
    _fireShowAnimation: function(indexes, chartType) {
        var eventName = renderUtil.makeCustomEventName('show', chartType, 'animation');

        this.fire(eventName, indexes);
    },

    /**
     * Fire custom event hideAnimation.
     * @param {{groupIndex: number, index: number}} indexes indexes
     * @param {string} chartType chart type
     * @private
     */
    _fireHideAnimation: function(indexes, chartType) {
        var eventName = renderUtil.makeCustomEventName('hide', chartType, 'animation');

        this.fire(eventName, indexes);
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
        var groupIndex = elTooltip.getAttribute('data-groupIndex');
        var index = elTooltip.getAttribute('data-index');
        var indexes = null;

        if (!tui.util.isNull(groupIndex) && !tui.util.isNull(index)) {
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
        var isShowed = elTooltip.getAttribute('data-showed');

        return isShowed === 'true' || isShowed === true; // ie7에서는 boolean형태의 true를 반환함
    },

    /**
     * Make left position of not bar chart.
     * @param {number} baseLeft base left
     * @param {string} alignOption align option
     * @param {number} minusWidth minus width
     * @param {number} lineGap line gap
     * @returns {number} left position value
     * @private
     */
    _makeLeftPositionOfNotBarChart: function(baseLeft, alignOption, minusWidth, lineGap) {
        var left = baseLeft;

        if (alignOption.indexOf('left') > -1) {
            left -= minusWidth + lineGap;
        } else if (alignOption.indexOf('center') > -1) {
            left -= minusWidth / 2;
        } else {
            left += lineGap;
        }

        return left;
    },

    /**
     * Make top position of not bar chart.
     * @param {number} baseTop base top
     * @param {string} alignOption align option
     * @param {number} tooltipHeight tooltip height
     * @param {number} lineGap line gap
     * @returns {number} top position value
     * @private
     */
    _makeTopPositionOfNotBarChart: function(baseTop, alignOption, tooltipHeight, lineGap) {
        var top = baseTop;

        if (alignOption.indexOf('bottom') > -1) {
            top += tooltipHeight + lineGap;
        } else if (alignOption.indexOf('middle') > -1) {
            top += tooltipHeight / 2;
        } else {
            top -= chartConst.TOOLTIP_GAP;
        }

        return top;
    },

    /**
     * Make tooltip position for not bar chart.
     * @param {object} params parameters
     *      @param {{bound: object}} params.data graph information
     *      @param {{width: number, height: number}} params.dimension tooltip dimension
     *      @param {string} params.alignOption position option (ex: 'left top')
     * @returns {{top: number, left: number}} position
     * @private
     */
    _makeTooltipPositionForNotBarChart: function(params) {
        var bound = params.bound,
            positionOption = params.positionOption,
            minusWidth = params.dimension.width - (bound.width || 0),
            lineGap = bound.width ? 0 : chartConst.TOOLTIP_GAP,
            alignOption = params.alignOption || '',
            tooltipHeight = params.dimension.height,
            baseLeft = bound.left + positionOption.left,
            baseTop = bound.top - tooltipHeight + positionOption.top;

        return {
            left: this._makeLeftPositionOfNotBarChart(baseLeft, alignOption, minusWidth, lineGap),
            top: this._makeTopPositionOfNotBarChart(baseTop, alignOption, tooltipHeight, lineGap)
        };
    },

    /**
     * Make tooltip position to event position.
     * @param {object} params parameters
     *      @param {{left: number, top: number}} params.bound bound
     *      @param {{left: number, top: number}} params.mousePosition mouse position
     * @returns {{top: number, left: number}} position
     * @private
     */
    _makeTooltipPositionToMousePosition: function(params) {
        params.bound = params.bound || {};
        tui.util.extend(params.bound, params.mousePosition);

        return this._makeTooltipPositionForNotBarChart(params);
    },

    /**
     * Make left position for bar chart.
     * @param {number} baseLeft base left
     * @param {string} alignOption align option
     * @param {number} tooltipWidth tooltip width
     * @returns {number} left position value
     * @private
     */
    _makeLeftPositionForBarChart: function(baseLeft, alignOption, tooltipWidth) {
        var left = baseLeft;

        if (alignOption.indexOf('left') > -1) {
            left -= tooltipWidth;
        } else if (alignOption.indexOf('center') > -1) {
            left -= tooltipWidth / 2;
        } else {
            left += chartConst.TOOLTIP_GAP;
        }

        return left;
    },

    /**
     * Make top position for bar chart.
     * @param {number} baseTop base top
     * @param {string} alignOption align option
     * @param {number} minusHeight minus width
     * @returns {number} top position value
     * @private
     */
    _makeTopPositionForBarChart: function(baseTop, alignOption, minusHeight) {
        var top = baseTop;

        if (alignOption.indexOf('top') > -1) {
            top -= minusHeight;
        } else if (alignOption.indexOf('middle') > -1) {
            top -= minusHeight / 2;
        }

        return top;
    },

    /**
     * Make tooltip position for bar chart.
     * @param {object} params parameters
     *      @param {{bound: object}} params.data graph information
     *      @param {{width: number, height: number}} params.dimension tooltip dimension
     *      @param {string} params.alignOption position option (ex: 'left top')
     * @returns {{top: number, left: number}} position
     * @private
     */
    _makeTooltipPositionForBarChart: function(params) {
        var bound = params.bound,
            positionOption = params.positionOption,
            minusHeight = params.dimension.height - (bound.height || 0),
            alignOption = params.alignOption || '',
            tooltipWidth = params.dimension.width,
            baseLeft = bound.left + bound.width + positionOption.left,
            baseTop = bound.top + positionOption.top;

        return {
            left: this._makeLeftPositionForBarChart(baseLeft, alignOption, tooltipWidth),
            top: this._makeTopPositionForBarChart(baseTop, alignOption, minusHeight)
        };
    },

    /**
     * Make tooltip position for treemap chart.
     * @param {object} params parameters
     *      @param {{bound: object}} params.data - graph information
     *      @param {{width: number, height: number}} params.dimension - tooltip dimension
     * @returns {{left: number, top: number}}
     * @private
     */
    _makeTooltipPositionForTreemapChart: function(params) {
        var bound = params.bound;
        var positionOption = params.positionOption;
        var labelHeight = renderUtil.getRenderedLabelHeight(chartConst.MAX_HEIGHT_WORLD, this.labelTheme);

        return {
            left: bound.left + ((bound.width - params.dimension.width) / 2) + positionOption.left,
            top: bound.top + ((bound.height - labelHeight) / 2) - params.dimension.height + positionOption.top
        };
    },

    /**
     * Adjust position.
     * @param {{width: number, height: number}} tooltipDimension tooltip dimension
     * @param {{left: number, top: number}} position position
     * @returns {{left: number, top: number}} adjusted position
     * @private
     */
    _adjustPosition: function(tooltipDimension, position) {
        var chartDimension = this.boundsMaker.getDimension('chart'),
            areaPosition = this.boundsMaker.getPosition('tooltip');

        position.left = Math.max(position.left, -areaPosition.left);
        position.left = Math.min(position.left, chartDimension.width - areaPosition.left - tooltipDimension.width);
        position.top = Math.max(position.top, -areaPosition.top);
        position.top = Math.min(position.top, chartDimension.height - areaPosition.top - tooltipDimension.height);

        return position;
    },

    /**
     * Make tooltip position.
     * @param {object} params parameters
     *      @param {{left: number, top: number, width: number, height: number}} params.bound graph bound
     *      @param {string} params.chartType chart type
     *      @param {boolean} params.allowNegativeTooltip whether allow negative tooltip or not
     *      @param {{width: number, height: number}} params.dimension tooltip dimension
     *      @param {string} params.alignOption position option (ex: 'left top')
     * @returns {{top: number, left: number}} position
     * @private
     */
    _makeTooltipPosition: function(params) {
        var position = {},
            sizeType, positionType, addPadding;

        if (params.mousePosition) {
            position = this._makeTooltipPositionToMousePosition(params);
        } else {
            if (predicate.isBarChart(params.chartType)) {
                position = this._makeTooltipPositionForBarChart(params);
                sizeType = 'width';
                positionType = 'left';
                addPadding = 1;
            } else if (predicate.isTreemapChart(params.chartType)) {
                position = this._makeTooltipPositionForTreemapChart(params);
            } else {
                position = this._makeTooltipPositionForNotBarChart(params);
                sizeType = 'height';
                positionType = 'top';
                addPadding = -1;
            }

            if (params.allowNegativeTooltip) {
                position = this._moveToSymmetry(position, {
                    bound: params.bound,
                    indexes: params.indexes,
                    dimension: params.dimension,
                    chartType: params.chartType,
                    sizeType: sizeType,
                    positionType: positionType,
                    addPadding: addPadding
                });
            }

            position = this._adjustPosition(params.dimension, position);
        }

        return position;
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
        var bound = params.bound;
        var sizeType = params.sizeType;
        var positionType = params.positionType;
        var seriesName = params.seriesName || params.chartType;
        var value = this.dataProcessor.getValue(params.indexes.groupIndex, params.indexes.index, seriesName);
        var tooltipSizeHalf, barPosition, barSizeHalf, movedPositionValue;

        if (value < 0) {
            tooltipSizeHalf = params.dimension[sizeType] / 2;
            barPosition = bound[positionType];
            barSizeHalf = bound[sizeType] / 2;
            movedPositionValue = (barPosition + barSizeHalf - tooltipSizeHalf) * 2 - position[positionType];
            position[positionType] = movedPositionValue;
        }

        return position;
    },

    /**
     * Whether changed indexes or not.
     * @param {{groupIndex: number, index: number}} prevIndexes prev indexes
     * @param {{groupIndex: number, index: number}} indexes indexes
     * @returns {boolean} whether changed or not
     * @private
     */
    _isChangedIndexes: function(prevIndexes, indexes) {
        return !!prevIndexes && (prevIndexes.groupIndex !== indexes.groupIndex || prevIndexes.index !== indexes.index);
    },

    /**
     * Show tooltip.
     * @param {HTMLElement} elTooltip tooltip element
     * @param {{indexes: {groupIndex: number, index: number}, bound: object}} params tooltip data
     * @param {{left: number, top: number}} prevPosition prev position
     * @private
     */
    _showTooltip: function(elTooltip, params, prevPosition) {
        var indexes = params.indexes,
            prevIndexes = this._getIndexesCustomAttribute(elTooltip),
            prevChartType, position;

        if (this._isChangedIndexes(prevIndexes, indexes)) {
            prevChartType = elTooltip.getAttribute('data-chart-type');
            this._fireHideAnimation(prevIndexes, prevChartType);
        }

        elTooltip.innerHTML = this._makeSingleTooltipHtml(params.seriesName || params.chartType, indexes);

        elTooltip.setAttribute('data-chart-type', params.chartType);
        this._setIndexesCustomAttribute(elTooltip, indexes);
        this._setShowedCustomAttribute(elTooltip, true);

        this._fireBeforeShowTooltip(indexes);

        dom.addClass(elTooltip, 'show');

        position = this._makeTooltipPosition(tui.util.extend({
            dimension: this.getTooltipDimension(elTooltip),
            positionOption: tui.util.extend({
                left: 0,
                top: 0
            }, this.options.position),
            alignOption: this.options.align || ''
        }, params));

        this._moveToPosition(elTooltip, position, prevPosition);
        this._fireShowAnimation(indexes, params.chartType);
        this._fireAfterShowTooltip(indexes, {
            element: elTooltip,
            position: position
        });
    },

    /**
     * To call beforeShowTooltip callback of userEvent.
     * @param {{groupIndex: number, index: number}} indexes indexes
     * @private
     */
    _fireBeforeShowTooltip: function(indexes) {
        var params = this._makeShowTooltipParams(indexes);

        this.userEvent.fire('beforeShowTooltip', params);
    },

    /**
     * To call afterShowTooltip callback of userEvent.
     * @param {{groupIndex: number, index: number}} indexes indexes
     * @param {object} additionParams addition parameters
     * @private
     */
    _fireAfterShowTooltip: function(indexes, additionParams) {
        var params = this._makeShowTooltipParams(indexes, additionParams);

        this.userEvent.fire('afterShowTooltip', params);
    },

    /**
     * Execute hiding tooltip.
     * @param {HTMLElement} tooltipElement tooltip element
     * @private
     */
    _executeHidingTooltip: function(tooltipElement) {
        dom.removeClass(tooltipElement, 'show');
        tooltipElement.removeAttribute('data-groupIndex');
        tooltipElement.removeAttribute('data-index');
        tooltipElement.style.cssText = '';
    },

    /**
     * Hide tooltip.
     * @param {HTMLElement} tooltipElement tooltip element
     * @private
     */
    _hideTooltip: function(tooltipElement) {
        var self = this;
        var indexes = this._getIndexesCustomAttribute(tooltipElement);
        var chartType = tooltipElement.getAttribute('data-chart-type');

        if (predicate.isMousePositionChart(chartType)) {
            this._executeHidingTooltip(tooltipElement);
        } else if (chartType) {
            this._setShowedCustomAttribute(tooltipElement, false);
            this._fireHideAnimation(indexes, chartType);

            if (this._isChangedIndexes(this.prevIndexes, indexes)) {
                delete this.prevIndexes;
            }

            setTimeout(function() {
                if (self._isShowedTooltip(tooltipElement)) {
                    return;
                }

                self._executeHidingTooltip(tooltipElement);
            }, chartConst.HIDE_DELAY);
        }
    },

    /**
     * On show tooltip container.
     */
    onShowTooltipContainer: function() {
        this.tooltipContainer.style.zIndex = chartConst.TOOLTIP_ZINDEX;
    },

    /**
     * On hide tooltip container.
     */
    onHideTooltipContainer: function() {
        this.tooltipContainer.style.zIndex = 0;
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

module.exports = singleTooltipMixer;

},{"../const":31,"../helpers/domHandler":59,"../helpers/predicate":61,"../helpers/renderUtil":63}],112:[function(require,module,exports){
/**
 * @fileoverview Tooltip component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var TooltipBase = require('./tooltipBase');
var singleTooltipMixer = require('./singleTooltipMixer');
var chartConst = require('../const');
var predicate = require('../helpers/predicate');
var renderUtil = require('../helpers/renderUtil');
var tooltipTemplate = require('./tooltipTemplate');

/**
 * @classdesc Tooltip component.
 * @class Tooltip
 */
var Tooltip = tui.util.defineClass(TooltipBase, /** @lends Tooltip.prototype */ {
    /**
     * Tooltip component.
     * @constructs Tooltip
     * @override
     */
    init: function() {
        TooltipBase.apply(this, arguments);
    },

    /**
     * Make tooltip html.
     * @param {string} category category
     * @param {{value: string, legend: string, chartType: string, suffix: ?string}} item item data
     * @returns {string} tooltip html
     * @private
     */
    _makeTooltipHtml: function(category, item) {
        var template;

        if (predicate.isCoordinateTypeChart(this.chartType)) {
            template = tooltipTemplate.tplCoordinatetypeChart;
        } else {
            template = tooltipTemplate.tplDefault;
        }

        return template(tui.util.extend({
            categoryVisible: category ? 'show' : 'hide',
            category: category
        }, item));
    },

    /**
     * Make html for value types like x, y, r
     * @param {{x: ?number, y: ?number, r: ?number}} data - data
     * @param {Array.<string>} valueTypes - types of value
     * @returns {string}
     * @private
     */
    _makeHtmlForValueTypes: function(data, valueTypes) {
        return tui.util.map(valueTypes, function(type) {
            return (data[type]) ? '<div>' + type + ': ' + data[type] + '</div>' : '';
        }).join('');
    },

    /**
     * Make single tooltip html.
     * @param {string} chartType chart type
     * @param {{groupIndex: number, index: number}} indexes indexes
     * @returns {string} tooltip html
     * @private
     */
    _makeSingleTooltipHtml: function(chartType, indexes) {
        var data = tui.util.pick(this.data, chartType, indexes.groupIndex, indexes.index);

        data = tui.util.extend({
            suffix: this.suffix
        }, data);
        data.valueTypes = this._makeHtmlForValueTypes(data, ['x', 'y', 'r']);

        return this.templateFunc(data.category, data);
    },

    /**
     * Set default align option of tooltip.
     * @private
     * @override
     */
    _setDefaultTooltipPositionOption: function() {
        if (this.options.align) {
            return;
        }

        if (this.isVertical) {
            this.options.align = chartConst.TOOLTIP_DEFAULT_ALIGN_OPTION;
        } else {
            this.options.align = chartConst.TOOLTIP_DEFAULT_HORIZONTAL_ALIGN_OPTION;
        }
    },

    /**
     * Make parameters for show tooltip user event.
     * @param {{groupIndex: number, index: number}} indexes indexes
     * @param {object} additionParams addition parameters
     * @returns {{chartType: string, legend: string, legendIndex: number, index: number}} parameters for show tooltip
     * @private
     */
    _makeShowTooltipParams: function(indexes, additionParams) {
        var legendIndex = indexes.index;
        var legendData = this.dataProcessor.getLegendItem(legendIndex);
        var params;

        if (!legendData) {
            return null;
        }

        params = tui.util.extend({
            chartType: legendData.chartType,
            legend: legendData.label,
            legendIndex: legendIndex,
            index: indexes.groupIndex
        }, additionParams);

        return params;
    },

    /**
     * Format value of valueMap
     * @param {object} valueMap - map of value like value, x, y, r
     * @returns {{}}
     * @private
     */
    _formatValueMap: function(valueMap) {
        var formatFunctions = this.dataProcessor.getFormatFunctions();
        var chartType = this.chartType;
        var formattedMap = {};

        tui.util.forEach(valueMap, function(value, valueType) {
            formattedMap[valueType] = renderUtil.formatValue(value, formatFunctions, chartType, 'tooltip', valueType);
        });

        return formattedMap;
    },

    /**
     * Make tooltip datum.
     * @param {Array.<string>} legendLabels - legend labels
     * @param {string} category - category
     * @param {string} chartType - chart type
     * @param {SeriesItem} seriesItem - SeriesItem
     * @param {number} index - index
     * @returns {Object}
     * @private
     */
    _makeTooltipDatum: function(legendLabels, category, chartType, seriesItem, index) {
        var legend = legendLabels[chartType][index] || '';

        var labelPrefix = (legend && seriesItem.label) ? ':&nbsp;' : '';
        var label = seriesItem.tooltipLabel || (seriesItem.label ? labelPrefix + seriesItem.label : '');
        var valueMap = this._formatValueMap(seriesItem.pickValueMap());

        return tui.util.extend({
            category: category || '',
            legend: legend,
            label: label
        }, valueMap);
    },

    /**
     * Make tooltip data.
     * @returns {Array.<object>} tooltip data
     * @override
     */
    _makeTooltipData: function() {
        var self = this;
        var orgLegendLabels = this.dataProcessor.getLegendLabels();
        var isPivot = predicate.isTreemapChart(this.chartType);
        var legendLabels = {};
        var tooltipData = {};

        if (tui.util.isArray(orgLegendLabels)) {
            legendLabels[this.chartType] = orgLegendLabels;
        } else {
            legendLabels = orgLegendLabels;
        }

        this.dataProcessor.eachBySeriesGroup(function(seriesGroup, groupIndex, chartType) {
            var data;

            chartType = chartType || self.chartType;

            data = seriesGroup.map(function(seriesItem, index) {
                var category = self.dataProcessor.getTooltipCategory(groupIndex, index, self.isVertical);

                return seriesItem ? self._makeTooltipDatum(legendLabels, category, chartType, seriesItem, index) : null;
            });

            if (!tooltipData[chartType]) {
                tooltipData[chartType] = [];
            }

            tooltipData[chartType].push(data);
        }, isPivot);

        return tooltipData;
    }
});

singleTooltipMixer.mixin(Tooltip);
module.exports = Tooltip;

},{"../const":31,"../helpers/predicate":61,"../helpers/renderUtil":63,"./singleTooltipMixer":111,"./tooltipBase":113,"./tooltipTemplate":114}],113:[function(require,module,exports){
/**
 * @fileoverview TooltipBase is base class of tooltip components.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    dom = require('../helpers/domHandler'),
    predicate = require('../helpers/predicate'),
    renderUtil = require('../helpers/renderUtil');

var TooltipBase = tui.util.defineClass(/** @lends TooltipBase.prototype */ {
    /**
     * TooltipBase is base class of tooltip components.
     * @constructs TooltipBase
     * @param {object} params parameters
     *      @param {Array.<number>} params.values converted values
     *      @param {BoundsMaker} params.boundsMaker bounds maker
     *      @param {object} params.theme axis theme
     */
    init: function(params) {
        var isPieChart = predicate.isPieChart(params.chartType);

        /**
         * Chart type
         * @type {string}
         */
        this.chartType = params.chartType;

        /**
         * Data processor
         * @type {DataProcessor}
         */
        this.dataProcessor = params.dataProcessor;

        /**
         * Bounds maker
         * @type {BoundsMaker}
         */
        this.boundsMaker = params.boundsMaker;

        /**
         * Options
         * @type {object}
         */
        this.options = params.options;

        /**
         * Theme
         * @type {object}
         */
        this.theme = params.theme;

        /**
         * whether vertical or not
         * @type {boolean}
         */
        this.isVertical = params.isVertical;

        /**
         * User event listener
         * @type {UserEventListener}
         */
        this.userEvent = params.userEvent;

        /**
         * label theme
         * @type {object}
         */
        this.labelTheme = params.labelTheme;

        /**
         * className
         * @type {string}
         */
        this.className = 'tui-chart-tooltip-area';

        /**
         * Tooltip container.
         * @type {HTMLElement}
         */
        this.tooltipContainer = null;

        /**
         * Tooltip suffix.
         * @type {string}
         */
        this.suffix = this.options.suffix ? '&nbsp;' + this.options.suffix : '';

        /**
         * Tooltip template function.
         * @type {function}
         */
        this.templateFunc = this.options.template || tui.util.bind(this._makeTooltipHtml, this);

        /**
         * Tooltip animation time.
         * @type {number}
         */
        this.animationTime = isPieChart ? chartConst.TOOLTIP_PIE_ANIMATION_TIME : chartConst.TOOLTIP_ANIMATION_TIME;

        /**
         * TooltipBase base data.
         * @type {Array.<Array.<object>>}
         */
        this.data = [];

        this._setDefaultTooltipPositionOption();
        this._saveOriginalPositionOptions();
    },

    /**
     * Make tooltip html.
     * @private
     * @abstract
     */
    _makeTooltipHtml: function() {},

    /**
     * Set default align option of tooltip.
     * @private
     * @abstract
     */
    _setDefaultTooltipPositionOption: function() {},

    /**
     * Save position options.
     * @private
     */
    _saveOriginalPositionOptions: function() {
        this.orgPositionOptions = {
            align: this.options.align,
            position: this.options.position
        };
    },

    /**
     * Make tooltip data.
     * @private
     * @abstract
     */
    _makeTooltipData: function() {},

    /**
     * Render tooltip component.
     * @returns {HTMLElement} tooltip element
     */
    render: function() {
        var el = dom.create('DIV', this.className);

        this.data = this._makeTooltipData();

        renderUtil.renderPosition(el, this.boundsMaker.getPosition('tooltip'));

        this.tooltipContainer = el;

        return el;
    },

    /**
     * Rerender.
     */
    rerender: function() {
        this.data = this._makeTooltipData();
        this.resize();
    },

    /**
     * Resize tooltip component.
     * @override
     */
    resize: function() {
        renderUtil.renderPosition(this.tooltipContainer, this.boundsMaker.getPosition('tooltip'));
        if (this.positionModel) {
            this.positionModel.updateBound(this.boundsMaker.getBound('tooltip'));
        }
    },

    /**
     * Zoom.
     */
    zoom: function() {
        this.data = this._makeTooltipData();
    },

    /**
     * Get tooltip element.
     * @returns {HTMLElement} tooltip element
     * @private
     */
    _getTooltipElement: function() {
        var tooltipElement;

        if (!this.tooltipElement) {
            this.tooltipElement = tooltipElement = dom.create('DIV', 'tui-chart-tooltip');
            dom.append(this.tooltipContainer, tooltipElement);
        }

        return this.tooltipElement;
    },

    /**
     * onShow is callback of custom event showTooltip for SeriesView.
     * @param {object} params coordinate event parameters
     */
    onShow: function(params) {
        var tooltipElement = this._getTooltipElement(),
            prevPosition;

        if (!predicate.isMousePositionChart(params.chartType) && tooltipElement.offsetWidth) {
            prevPosition = {
                left: tooltipElement.offsetLeft,
                top: tooltipElement.offsetTop
            };
        }

        this._showTooltip(tooltipElement, params, prevPosition);
    },

    /**
     * Get tooltip dimension
     * @param {HTMLElement} tooltipElement tooltip element
     * @returns {{width: number, height: number}} rendered tooltip dimension
     */
    getTooltipDimension: function(tooltipElement) {
        return {
            width: tooltipElement.offsetWidth,
            height: tooltipElement.offsetHeight
        };
    },

    /**
     * Move to Position.
     * @param {HTMLElement} tooltipElement tooltip element
     * @param {{left: number, top: number}} position position
     * @param {{left: number, top: number}} prevPosition prev position
     * @private
     */
    _moveToPosition: function(tooltipElement, position, prevPosition) {
        if (prevPosition) {
            this._slideTooltip(tooltipElement, prevPosition, position);
        } else {
            renderUtil.renderPosition(tooltipElement, position);
        }
    },

    /**
     * Slide tooltip
     * @param {HTMLElement} tooltipElement tooltip element
     * @param {{left: number, top: number}} prevPosition prev position
     * @param {{left: number, top: number}} position position
     * @private
     */
    _slideTooltip: function(tooltipElement, prevPosition, position) {
        var moveTop = position.top - prevPosition.top,
            moveLeft = position.left - prevPosition.left;

        renderUtil.cancelAnimation(this.slidingAnimation);

        this.slidingAnimation = renderUtil.startAnimation(this.animationTime, function(ratio) {
            var left = moveLeft * ratio,
                top = moveTop * ratio;
            tooltipElement.style.left = (prevPosition.left + left) + 'px';
            tooltipElement.style.top = (prevPosition.top + top) + 'px';
        });
    },

    /**
     * onHide is callback of custom event hideTooltip for SeriesView
     * @param {number} index index
     */
    onHide: function(index) {
        var tooltipElement = this._getTooltipElement();

        this._hideTooltip(tooltipElement, index);
    },

    /**
     * Set tooltip align option.
     * @param {string} align align
     */
    setAlign: function(align) {
        this.options.align = align;
        if (this.positionModel) {
            this.positionModel.updateOptions(this.options);
        }
    },

    /**
     * Set position option.
     * @param {{left: number, top: number}} position moving position
     */
    setPosition: function(position) {
        this.options.position = tui.util.extend({}, this.options.position, position);
        if (this.positionModel) {
            this.positionModel.updateOptions(this.options);
        }
    },

    /**
     * Reset tooltip align option.
     */
    resetAlign: function() {
        var align = this.orgPositionOptions.align;

        this.options.align = align;
        if (this.positionModel) {
            this.positionModel.updateOptions(this.options);
        }
    },

    /**
     * Reset tooltip position.
     */
    resetPosition: function() {
        var position = this.orgPositionOptions.position;

        this.options.position = position;
        if (this.positionModel) {
            this.positionModel.updateOptions(this.options);
        }
    }
});

tui.util.CustomEvents.mixin(TooltipBase);

module.exports = TooltipBase;

},{"../const":31,"../helpers/domHandler":59,"../helpers/predicate":61,"../helpers/renderUtil":63}],114:[function(require,module,exports){
/**
 * @fileoverview This is templates of tooltip.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var templateMaker = require('../helpers/templateMaker');

var htmls = {
    HTML_DEFAULT_TEMPLATE: '<div class="tui-chart-default-tooltip">' +
        '<div class="{{ categoryVisible }}">{{ category }}</div>' +
        '<div>' +
            '<span>{{ legend }}</span>' +
            '<span>{{ label }}</span>' +
            '<span>{{ suffix }}</span>' +
        '</div>' +
    '</div>',
    HTML_COORDINATE_TYPE_CHART_TEMPLATE: '<div class="tui-chart-default-tooltip">' +
        '<div>{{ category }}</div>' +
        '<div>' +
            '<span>{{ legend }}</span>' +
            '<span>{{ label }}</span>' +
        '</div>{{ valueTypes }}' +
    '</div>',
    HTML_GROUP: '<div class="tui-chart-default-tooltip tui-chart-group-tooltip">' +
        '<div>{{ category }}</div>' +
        '{{ items }}' +
    '</div>',
    HTML_GROUP_ITEM: '<div>' +
        '<div class="tui-chart-legend-rect {{ chartType }}" style="{{ cssText }}"></div>' +
        '&nbsp;<span>{{ legend }}</span>:&nbsp;<span>{{ value }}</span>' +
        '<span>{{ suffix }}</span>' +
    '</div>',
    GROUP_CSS_TEXT: 'background-color:{{ color }}',
    HTML_MAP_CHART_DEFAULT_TEMPLATE: '<div class="tui-chart-default-tooltip">' +
        '<div>{{ name }}: {{ value }}{{ suffix }}</div>' +
    '</div>'
};

module.exports = {
    tplDefault: templateMaker.template(htmls.HTML_DEFAULT_TEMPLATE),
    tplCoordinatetypeChart: templateMaker.template(htmls.HTML_COORDINATE_TYPE_CHART_TEMPLATE),
    tplGroup: templateMaker.template(htmls.HTML_GROUP),
    tplGroupItem: templateMaker.template(htmls.HTML_GROUP_ITEM),
    tplGroupCssText: templateMaker.template(htmls.GROUP_CSS_TEXT),
    tplMapChartDefault: templateMaker.template(htmls.HTML_MAP_CHART_DEFAULT_TEMPLATE)
};

},{"../helpers/templateMaker":64}]},{},[3,74]);
