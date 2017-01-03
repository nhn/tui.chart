/**
 * @fileoverview  Axis component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var dom = require('../../helpers/domHandler');
var chartConst = require('../../const');
var predicate = require('../../helpers/predicate');
var calculator = require('../../helpers/calculator');
var renderUtil = require('../../helpers/renderUtil');
var axisTemplate = require('./axisTemplate');

var Axis = tui.util.defineClass(/** @lends Axis.prototype */ {
    /**
     * Axis component.
     * @constructs Axis
     * @private
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
         * Data processor
         * @type {DataProcessor}
         */
        this.dataProcessor = params.dataProcessor;

        /**
         * Options
         * @type {object}
         */
        this.options = params.options || {};

        /**
         * Theme
         * @type {object}
         */
        this.theme = params.theme[params.seriesType] || params.theme;

        /**
         * Whether label type or not.
         * @type {boolean}
         */
        this.isLabel = null;

        /**
         * Whether vertical type or not.
         */
        this.isVertical = params.isVertical;

        /**
         * cached axis data
         * @type {object}
         */
        this.data = {};

        /**
         * layout bounds information for this components
         * @type {null|{dimension:{width:number, height:number}, position:{left:number, top:number}}}
         */
        this.layout = null;

        /**
         * dimension map for layout of chart
         * @type {null|object}
         */
        this.dimensionMap = null;

        /**
         * axis data map
         * @type {null|object}
         */
        this.axisDataMap = null;
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
        var axisData = this.data;
        var tickCount = axisData.tickCount;
        var halfTickCount = parseInt(tickCount / 2, 10) + 1;
        var categories = axisData.labels;
        var lCategories = categories.slice(0, halfTickCount);
        var rCategories = categories.slice(halfTickCount - 1, tickCount);
        var additionalWidth = lWidth + this.dimensionMap.yAxis.width;
        var lContainers = this._renderChildContainers(lWidth, lWidth, halfTickCount, lCategories, 0);
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
        var axisData = this.data;
        var isVertical = this.isVertical;
        var width = dimension.width;
        var size = isVertical ? dimension.height : width;
        var additionalSize = 0;
        var childContainers;

        if (axisData.positionRatio) {
            additionalSize = size * axisData.positionRatio;
        }

        childContainers = this._renderChildContainers(size, width, axisData.tickCount, axisData.labels, additionalSize);

        dom.append(axisContainer, childContainers);
    },

    /**
     * Render axis area.
     * @param {HTMLElement} axisContainer axis area element
     * @param {{isVertical: boolean, isPositionRight: boolean, aligned: aligned}} data rendering data
     * @private
     */
    _renderAxisArea: function(axisContainer) {
        var dimension = this.layout.dimension;
        var axisData = this.data;

        this.isLabel = axisData.isLabelAxis;

        this._addCssClasses(axisContainer);

        if (this.options.divided) {
            this.containerWidth = dimension.width + this.dimensionMap.yAxis.width;
            this._renderDividedAxis(axisContainer, dimension.width);
            dimension.width = this.containerWidth;
        } else {
            this._renderNotDividedAxis(axisContainer, dimension);
            dimension.width += this.options.isCenter ? 2 : 0;
        }

        renderUtil.renderDimension(axisContainer, dimension);
        renderUtil.renderPosition(axisContainer, this.layout.position);
    },

    /**
     * Set data for rendering.
     * @param {{
     *      options: ?object,
     *      layout: {
     *          dimension: {width: number, height: number},
     *          position: {left: number, top: number}
     *      },
     *      dimensionMap: object,
     *      axisDataMap: object
     * }} data - bounds and scale data
     * @private
     */
    _setDataForRendering: function(data) {
        this.layout = data.layout;
        this.dimensionMap = data.dimensionMap;
        this.data = data.axisDataMap[this.componentName];
        this.options = this.data.options;
    },

    /**
     * @param {object} data - bounds and scale data
     * @returns {HTMLElement} axis area base element
     */
    render: function(data) {
        var container = dom.create('DIV', this.className);

        this._setDataForRendering(data);
        this._renderAxisArea(container);
        this.axisContainer = container;

        return container;
    },

    /**
     * Rerender axis component.
     * @param {object} data - bounds and scale data
     */
    rerender: function(data) {
        this.axisContainer.innerHTML = '';

        if (this._isValidAxis()) {
            this._setDataForRendering(data);
            this._renderAxisArea(this.axisContainer);
        }
    },

    /**
     * Resize axis component.
     * @param {object} data - bounds and scale data
     */
    resize: function(data) {
        this.rerender(data);
    },

    /**
     * Zoom.
     * @param {object} data - bounds and scale data
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

        renderUtil.startAnimation(chartConst.ADDING_DATA_ANIMATION_DURATION, function(ratio) {
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
        if (this.isVertical || this.dataProcessor.isCoordinateType()) {
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
        var titleOptions = this.options.title;
        var offset = titleOptions.offset || {};
        var titleWidth = renderUtil.getRenderedLabelWidth(titleOptions.text, this.theme.title);
        var yAxisWidth = this.dimensionMap.yAxis.width;
        var left = (yAxisWidth - titleWidth) / 2;
        var bottom = -this.dimensionMap.xAxis.height;

        bottom -= offset.y || 0;
        left += offset.x || 0;

        return {
            left: left,
            bottom: bottom
        };
    },

    /**
     * Make right position for right y axis.
     * @param {number} size - width or height
     * @returns {number}
     * @private
     */
    _makeRightPosition: function(size) {
        var offset = this.options.title.offset || {};
        var rightPosition;

        if (renderUtil.isIE7() || this.options.rotateTitle === false) {
            rightPosition = 0;
        } else {
            rightPosition = -size;
        }

        rightPosition -= offset.x || 0;

        return rightPosition;
    },

    /**
     * Make top position.
     * @param {number} size - width or height
     * @returns {?number}
     * @private
     */
    _makeTopPosition: function(size) {
        var offset = this.options.title.offset;
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

        if (offset) {
            topPosition = topPosition || 0;
            topPosition += offset.y || 0;
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
        var offset = this.options.title.offset || {};
        var topPosition;

        if (this.data.isPositionRight) {
            positionMap.right = this._makeRightPosition(size);
        } else {
            positionMap.left = offset.x || 0;
        }

        topPosition = this._makeTopPosition(size);

        if (!tui.util.isNull(topPosition)) {
            positionMap.top = topPosition;
        }

        return positionMap;
    },

    /**
     * Render css style of title area for vertical type.
     * @param {HTMLElement} titleContainer title element
     * @param {number} size width or height
     * @private
     */
    _renderTitleAreaStyleForVertical: function(titleContainer, size) {
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
     * Render title position for horizontal type.
     * @param {HTMLElement} titleContainer title element
     * @param {{left: number, top: number, right: number, bottom: number}} offset - title position option
     * @private
     */
    _renderTitlePositionForHorizontal: function(titleContainer, offset) {
        renderUtil.renderPosition(titleContainer, {
            left: offset.x,
            bottom: -offset.y
        });
    },

    /**
     * Render css style of title area
     * @param {HTMLElement} titleContainer title element
     * @param {number} size width or height
     * @private
     */
    _renderTitleAreaStyle: function(titleContainer, size) {
        var offset = this.options.title.offset;

        if (this.isVertical) {
            this._renderTitleAreaStyleForVertical(titleContainer, size);
        } else if (offset) {
            this._renderTitlePositionForHorizontal(titleContainer, offset);
        }
    },

    /**
     * Title area renderer
     * @param {?number} size (width or height)
     * @returns {HTMLElement} title element
     * @private
     */
    _renderTitleArea: function(size) {
        var title = this.options.title || {};
        var titleContainer = renderUtil.renderTitle(title.text, this.theme.title, 'tui-chart-title-area');

        if (titleContainer) {
            this._renderTitleAreaStyle(titleContainer, size);
        }

        if (this.options.rotateTitle !== false) {
            dom.addClass(titleContainer, 'rotation');
        }

        return titleContainer;
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
        var axisData = this.data;
        var sizeRatio = axisData.sizeRatio || 1;
        var posType = this.isVertical ? 'bottom' : 'left';
        var positions = calculator.makeTickPixelPositions((size * sizeRatio), tickCount);
        var containerWidth = this.containerWidth || size;
        var template, html;

        positions.length = axisData.tickCount;
        additionalSize = calculator.makePercentageValue(additionalSize, containerWidth);
        positions = this._makePercentagePositions(positions, size);

        template = axisTemplate.tplAxisTick;
        html = tui.util.map(positions, function(position, index) {
            var tickHtml, cssTexts;

            position -= (index === 0 && isNotDividedXAxis) ? calculator.makePercentageValue(1, containerWidth) : 0;
            position += additionalSize;

            cssTexts = [
                renderUtil.concatStr('background-color:', tickColor),
                renderUtil.concatStr(posType, ': ', position, '%')
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
        var axisData = this.data;
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

        lineSize = areaSize + tickLineExtend;

        if (!axisData.sizeRatio) {
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
            additionalSize -= ((labelSize * options.labelInterval / 2) - (labelSize / 2));
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
        var title = this.options.title;
        var theme = this.theme.title;
        var result = title ? renderUtil.getRenderedLabelHeight(title.text, theme) : 0;

        return result;
    },

    /**
     * Make cssText of label.
     * @param {number} labelSize label size (width or height)
     * @returns {string} cssText
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
        var degree = this.data.degree;
        var containerWidth = this.containerWidth || params.size;

        if (this.data.degree === chartConst.ANGLE_85) {
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
        var degree = this.data.degree;
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
        var degree = this.data.degree;
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
        var hasRotatedXAxisLabel = this.componentName === 'xAxis' && this.data.degree;
        var labelsHtml;

        if (isRotationlessXAxis) {
            categories = this.data.multilineLabels;
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
