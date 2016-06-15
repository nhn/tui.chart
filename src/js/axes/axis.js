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
     *          labels: Array.<string>,
     *          tickCount: number,
     *          isLabelAxis: boolean,
     *          isVertical: boolean
     *      }} params.data axis data
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

        if (!this._isValidAxis()) {
            return;
        }

        if (this.componentType === 'xAxis') {
            dimension.height = this._makeXAxisHeight();
            this.boundsMaker.registerBaseDimension(this.componentName, dimension);
        } else if (this.isLabel) {
            dimension.width = this._makeYAxisWidth(this.dataProcessor.getCategories(), this.options);
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
        dom.addClass(axisContainer, this.data.isVertical ? 'vertical' : 'horizontal');
        dom.addClass(axisContainer, this.options.isCenter ? 'center' : '');
        dom.addClass(axisContainer, this.options.divided ? 'division' : '');
        dom.addClass(axisContainer, this.data.isPositionRight ? 'right' : '');
    },


    /**
     * Render child containers like title area, lable area and tick area.
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
            isVerticalLineType = this.data.isVertical && this.data.aligned,
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
        var isVertical = !!data.isVertical;
        var width = dimension.width;
        var size = isVertical ? dimension.height : width;
        var additionalSize = 0;
        var childContainers;

        if (data.positionRatio) {
            additionalSize = size * data.positionRatio;
        }

        if (data.sizeRatio) {
            size *= data.sizeRatio;
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
            this._renderDividedAxis(axisContainer, dimension.width);
            dimension.width += this.boundsMaker.getDimension('yAxis').width;
        } else {
            this._renderNotDividedAxis(axisContainer, dimension);
            dimension.width += this.options.isCenter ? 2 : 0;
        }

        renderUtil.renderDimension(axisContainer, dimension);
        renderUtil.renderPosition(axisContainer, this.boundsMaker.getPosition(this.componentName));
    },

    /**
     * Render axis component.
     * @param {{isVertical: boolean, isPositionRight: boolean, aligned: aligned}} data rendering data
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
     * Make cssText from position map for css.
     * @param {object.<string, number>} positionMap - position map for css
     * @returns {string}
     * @private
     */
    _makeCssTextFromPositionMap: function(positionMap) {
        return tui.util.map(positionMap, function(value, name) {
            return renderUtil.concatStr(name, ':', value, 'px');
        }).join(';');
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

        if (titleContainer && this.data.isVertical) {
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
        var data = this.data;
        var tickLineExtend = isNotDividedXAxis ? chartConst.OVERLAPPING_WIDTH : 0;
        var linePositionValue = -tickLineExtend;
        var lineSize, html;

        if (data.lineWidth) {
            lineSize = data.lineWidth;
        } else {
            lineSize = areaSize + tickLineExtend;
            linePositionValue += additionalSize;
        }

        html = axisTemplate.tplTickLine({
            positionType: posType,
            positionValue: linePositionValue,
            sizeType: data.isVertical ? 'height' : 'width',
            size: lineSize
        });

        return html;
    },

    /**
     * Make tick html.
     * @param {number} size - area size
     * @param {number} tickCount - tick count
     * @param {string} posType - position type
     * @param {boolean} isSingleXAxis - whether single x axis or not
     * @param {number} additionalSize - additional size
     * @returns {string}
     * @private
     */
    _makeTickHtml: function(size, tickCount, posType, isSingleXAxis, additionalSize) {
        var tickColor = this.theme.tickColor;
        var positions = calculator.makeTickPixelPositions(size, tickCount);
        var template = axisTemplate.tplAxisTick;
        var html = tui.util.map(positions, function(position, index) {
            var tickHtml, cssTexts;

            position -= (index === 0 && isSingleXAxis) ? 1 : 0;
            cssTexts = [
                renderUtil.concatStr('background-color:', tickColor),
                renderUtil.concatStr(posType, ': ', additionalSize + position, 'px')
            ].join(';');
            tickHtml = template({cssText: cssTexts});

            return tickHtml;
        }).join('');

        return html;
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
        var data = this.data;
        var tickContainer = dom.create('DIV', 'tui-chart-tick-area');
        var posType = data.isVertical ? 'bottom' : 'left';
        var isNotDividedXAxis = !this.data.isVertical && !this.options.divided;
        var lineHtml, ticksHtml;

        additionalSize = additionalSize || 0;

        lineHtml = this._makeTickLineHtml(size, posType, isNotDividedXAxis, additionalSize);
        ticksHtml = this._makeTickHtml(size, tickCount, posType, isNotDividedXAxis, additionalSize);

        tickContainer.innerHTML = lineHtml + ticksHtml;

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

        if (this.data.isVertical) {
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
        var labelContainer = dom.create('DIV', 'tui-chart-label-area'),
            tickPixelPositions = calculator.makeTickPixelPositions(size, tickCount),
            labelSize = tickPixelPositions[1] - tickPixelPositions[0],
            labelsHtml;

        additionalSize = additionalSize || 0;
        labelsHtml = this._makeLabelsHtml(tickPixelPositions, categories, labelSize, additionalSize);
        labelContainer.innerHTML = labelsHtml;

        this._applyLabelAreaStyle(labelContainer, axisWidth);
        this._changeLabelAreaPosition(labelContainer, labelSize);

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
        var isVertical = this.data.isVertical,
            cssTexts = [];

        if (isVertical && this.data.isLabelAxis) {
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
        var moveLeft = params.moveLeft,
            degree = this.boundsMaker.xAxisDegree;

        if (degree === chartConst.ANGLE_85) {
            moveLeft += calculator.calculateAdjacent(chartConst.ANGLE_90 - degree, params.labelHeight / 2);
        }

        return {
            top: params.top,
            left: params.left - moveLeft
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
        var labelWidth = renderUtil.getRenderedLabelWidth(params.label, params.theme),
            degree = this.boundsMaker.xAxisDegree,
            smallAreaWidth = calculator.calculateAdjacent(chartConst.ANGLE_90 - degree, params.labelHeight / 2),
            newLabelWidth = (calculator.calculateAdjacent(degree, labelWidth / 2) + smallAreaWidth) * 2,
            changedWidth = renderUtil.isIE7() ? 0 : (labelWidth - newLabelWidth),
            moveLeft = (params.labelWidth / 2) - (smallAreaWidth * 2);

        if (degree === chartConst.ANGLE_85) {
            moveLeft += smallAreaWidth;
        }

        return {
            top: chartConst.XAXIS_LABEL_TOP_MARGIN,
            left: params.left + changedWidth - moveLeft
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

        return renderUtil.concatStr('left:', position.left, 'px', ';top:', position.top, 'px');
    },

    /**
     * Make html of rotation labels.
     * @param {Array.<object>} positions label position array
     * @param {string[]} categories categories
     * @param {number} labelSize label size
     * @param {number} additionalSize additional size
     * @returns {string} labels html
     * @private
     */
    _makeRotationLabelsHtml: function(positions, categories, labelSize, additionalSize) {
        var self = this,
            degree = this.boundsMaker.xAxisDegree,
            template = axisTemplate.tplAxisLabel,
            labelHeight = renderUtil.getRenderedLabelHeight(categories[0], this.theme.label),
            labelCssText = this._makeLabelCssText(labelSize),
            additionalClass = ' tui-chart-xaxis-rotation tui-chart-xaxis-rotation' + degree,
            halfWidth = labelSize / 2,
            moveLeft = calculator.calculateAdjacent(degree, halfWidth),
            top = calculator.calculateOpposite(degree, halfWidth) +
                chartConst.XAXIS_LABEL_TOP_MARGIN,
            spanCssText = (renderUtil.isIE7() && degree) ? chartConst.IE7_ROTATION_FILTER_STYLE_MAP[degree] : '',
            labelsHtml;

        additionalSize = additionalSize || 0;
        labelsHtml = tui.util.map(positions, function(position, index) {
            var label = categories[index],
                rotationCssText = self._makeCssTextForRotationMoving({
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

        additionalSize = additionalSize || 0;

        if (this.data.isVertical) {
            posType = this.data.isLabelAxis ? 'top' : 'bottom';
        } else {
            posType = 'left';
        }

        labelsHtml = tui.util.map(positions, function(position, index) {
            var addCssText = renderUtil.concatStr(posType, ':', (position + additionalSize), 'px');
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
     * @param {Array.<object>} positions label position array
     * @param {string[]} categories categories
     * @param {number} labelSize label size
     * @param {number} additionalSize additional size
     * @returns {string} labels html
     * @private
     */
    _makeLabelsHtml: function(positions, categories, labelSize, additionalSize) {
        var isRotationlessXAxis = !this.data.isVertical && this.data.isLabelAxis && this.options.rotateLabel === false,
            hasRotatedXAxisLabel = this.componentName === 'xAxis' && this.boundsMaker.xAxisDegree,
            labelsHtml;

        if (isRotationlessXAxis) {
            categories = this.dataProcessor.getMultilineCategories();
        }

        positions.length = categories.length;

        if (hasRotatedXAxisLabel) {
            labelsHtml = this._makeRotationLabelsHtml(positions, categories, labelSize, additionalSize);
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

        if (this.data.isLabelAxis && !this.data.aligned) {
            return;
        }

        if (this.data.isVertical) {
            labelHeight = renderUtil.getRenderedLabelHeight('ABC', this.theme.label);
            labelContainer.style.top = renderUtil.concatStr(parseInt(labelHeight / 2, 10), 'px');
        } else {
            labelContainer.style.left = renderUtil.concatStr('-', parseInt(labelSize / 2, 10), 'px');
        }
    }
});

module.exports = Axis;
