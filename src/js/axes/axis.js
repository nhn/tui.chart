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
        var title = this.options.title,
            titleAreaHeight = renderUtil.getRenderedLabelHeight(title, this.theme.title) + chartConst.TITLE_PADDING,
            height = renderUtil.getRenderedLabelHeight(chartConst.MAX_HEIGHT_WORLD, this.theme.label) + titleAreaHeight;
        return height;
    },

    /**
     * Make width of y axis area.
     * @param {Array.<string | number>} labels labels
     * @returns {number} width
     * @private
     */
    _makeYAxisWidth: function(labels) {
        var title = this.options.title || '',
            titleAreaWidth = 0,
            width = 0;

        if (this.options.isCenter) {
            width += chartConst.AXIS_LABEL_PADDING;
        } else {
            titleAreaWidth = renderUtil.getRenderedLabelHeight(title, this.theme.title) + chartConst.TITLE_PADDING;
        }

        width += renderUtil.getRenderedLabelsMaxWidth(labels, this.theme.label) + titleAreaWidth +
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
            isValid = this.dataProcessor.isValidAllGroup();
        }

        return isValid;
    },

    /**
     * Register legend dimension to boundsMaker.
     */
    registerDimension: function() {
        var dimension = {};

        if (this._isValidAxis()) {
            if (this.componentType === 'xAxis') {
                dimension.height = this._makeXAxisHeight();
                this.boundsMaker.registerBaseDimension(this.componentName, dimension);
            } else if (this.isLabel) {
                dimension.width = this._makeYAxisWidth(this.dataProcessor.getCategories());
                this.boundsMaker.registerBaseDimension(this.componentName, dimension);
            }
        }
    },

    /**
     * Register legend additional dimension to boundsMaker.
     */
    registerAdditionalDimension: function() {
        var dimension,
            axesData = this.boundsMaker.axesData;

        if (this._isValidAxis()) {
            if (this.componentType === 'yAxis' && !this.isLabel) {
                dimension = {
                    width: this._makeYAxisWidth(axesData.yAxis.labels)
                };
                this.boundsMaker.registerBaseDimension(this.componentName, dimension);
            }
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
     * @param {number} additionalWidth aditional width
     * @returns {Array.<HTMLElement>} child containers
     * @private
     */
    _renderChildContainers: function(size, width, tickCount, categories, additionalWidth) {
        var titleContainer = this._renderTitleArea(size),
            labelContainer = this._renderLabelArea(size, width, tickCount, categories, additionalWidth),
            childContainers = [titleContainer, labelContainer],
            isLineType = this.data.isVertical && this.data.aligned,
            tickContainer, oppositeSideTickContainer;

        if (!isLineType) {
            tickContainer = this._renderTickArea(size, tickCount, categories, additionalWidth);
            oppositeSideTickContainer = this._renderOppositeSideTickArea(tickContainer.innerHTML);
            childContainers = childContainers.concat([tickContainer, oppositeSideTickContainer]);
        }

        return childContainers;
    },

    /**
     Render division xAxis area if yAxis rendered in the center.
     * @param {HTMLElement} axisContainer axis container element
     * @param {number} width axis area width
     * @private
     */
    _renderDivisionAxisArea: function(axisContainer, width) {
        var leftWidth = Math.round(width / 2),
            rightWidth = width - leftWidth,
            tickCount = this.data.tickCount,
            halfTickCount = parseInt(tickCount / 2, 10) + 1,
            categories = this.data.labels,
            leftCates = categories.slice(0, halfTickCount),
            rightCates = categories.slice(halfTickCount - 1, tickCount),
            additionWidth = leftWidth + this.boundsMaker.getDimension('yAxis').width,
            leftContainers, rightContainers, rightTitleContainer;

        leftContainers = this._renderChildContainers(leftWidth, leftWidth, halfTickCount, leftCates);
        rightContainers = this._renderChildContainers(rightWidth, rightWidth, halfTickCount, rightCates, additionWidth);

        rightTitleContainer = rightContainers[0];
        dom.addClass(rightTitleContainer, 'right');
        dom.append(axisContainer, leftContainers.concat(rightContainers));
    },

    /**
     * Render single axis area if yAxis did not rendered in the center.
     * @param {HTMLElement} axisContainer axis container element
     * @param {{width: number, height: number}} dimension axis area dimension
     * @private
     */
    _renderSingleAxisArea: function(axisContainer, dimension) {
        var isVertical = !!this.data.isVertical,
            size = isVertical ? dimension.height : dimension.width,
            childContainers = this._renderChildContainers(size, dimension.width, this.data.tickCount, this.data.labels);

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
            this._renderDivisionAxisArea(axisContainer, dimension.width);
            dimension.width += this.boundsMaker.getDimension('yAxis').width;
        } else {
            this._renderSingleAxisArea(axisContainer, dimension);
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
        var el = dom.create('DIV', this.className);

        this.data = data;
        this._renderAxisArea(el);
        this.axisContainer = el;
        return el;
    },

    /**
     * Rerender axis component.
     * @param {object} data rendering data
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
     * @param {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound axis bound
     * @param {object} data rendering data
     */
    resize: function(bound, data) {
        this.rerender(bound, data);
    },

    /**
     * Render css style of title area
     * @param {HTMLElement} titleContainer title element
     * @param {number} size width or height
     * @private
     */
    _renderTitleAreaStyle: function(titleContainer, size) {
        var isPositionRight = this.data.isPositionRight,
            cssTexts = [
                renderUtil.concatStr('width:', size, 'px')
            ],
            titleWidth, yAxisWidth, xAxisHeight;

        if (isPositionRight) {
            if (renderUtil.isIE7()) {
                cssTexts.push(renderUtil.concatStr('right:', '0px'));
            } else {
                cssTexts.push(renderUtil.concatStr('right:', -size, 'px'));
            }
            cssTexts.push('top:0px');
        } else if (this.options.isCenter) {
            titleWidth = renderUtil.getRenderedLabelWidth(this.options.title, this.theme.title);
            yAxisWidth = this.boundsMaker.getDimension('yAxis').width;
            xAxisHeight = this.boundsMaker.getDimension('xAxis').height;

            cssTexts = [
                'left:' + ((yAxisWidth - titleWidth) / 2) + 'px',
                'bottom: -' + xAxisHeight + 'px'
            ];
        } else {
            cssTexts.push('left:0px');
            if (!renderUtil.isOldBrowser()) {
                cssTexts.push(renderUtil.concatStr('top:', size, 'px'));
            }
        }

        titleContainer.style.cssText += ';' + cssTexts.join(';');
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

        return titleContainer;
    },

    /**
     * Render tick area.
     * @param {number} size size or height
     * @param {number} tickCount tick count
     * @param {Array.<string>} categories categories
     * @param {?number} additionalSize additional size (width or height)
     * @returns {HTMLElement} tick area element
     * @private
     */
    _renderTickArea: function(size, tickCount, categories, additionalSize) {
        var data = this.data,
            isSingleXAxis = !data.isVertical && !this.options.divided,
            tickColor = this.theme.tickColor,
            positions = calculator.makeTickPixelPositions(size, tickCount),
            elTickArea = dom.create('DIV', 'tui-chart-tick-area'),
            posType = data.isVertical ? 'bottom' : 'left',
            template = axisTemplate.tplAxisTick,
            lineHtml = '',
            tickLineExtend, ticksHtml;

        additionalSize = additionalSize || 0;

        if (!data.isVertical) {
            tickLineExtend = isSingleXAxis ? 1 : 0;
            lineHtml = axisTemplate.tplTickLine({
                lineLeft: additionalSize - tickLineExtend,
                lineWidth: size + tickLineExtend
            });
        }

        ticksHtml = tui.util.map(positions, function(position, index) {
            var tickHtml, cssTexts;

            if (data.aligned && (categories[index] === chartConst.EMPTY_AXIS_LABEL)) {
                tickHtml = '';
            } else {
                position -= (index === 0 && isSingleXAxis) ? 1 : 0;
                cssTexts = [
                    renderUtil.concatStr('background-color:', tickColor),
                    renderUtil.concatStr(posType, ': ', additionalSize + position, 'px')
                ].join(';');
                tickHtml = template({cssText: cssTexts});
            }

            return tickHtml;
        }).join('');

        elTickArea.innerHTML = lineHtml + ticksHtml;

        return elTickArea;
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
     * Calculate rotation moving position for ie8.
     * @param {object} params parameters
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
            degree = this.boundsMaker.xAxisDegree,
            smallAreaWidth = calculator.calculateAdjacent(chartConst.ANGLE_90 - degree, params.labelHeight / 2),
            newLabelWidth = (calculator.calculateAdjacent(degree, labelWidth / 2) + smallAreaWidth) * 2,
            collectLeft = labelWidth - newLabelWidth,
            moveLeft = (params.labelWidth / 2) - (smallAreaWidth * 2);

        if (degree === chartConst.ANGLE_85) {
            moveLeft += smallAreaWidth;
        }

        return {
            top: chartConst.XAXIS_LABEL_TOP_MARGIN,
            left: params.left + collectLeft - moveLeft
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
            position = this._calculateRotationMovingPositionForIE8(params);
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
            template = axisTemplate.tplAxisLabel,
            labelHeight = renderUtil.getRenderedLabelHeight(categories[0], this.theme.label),
            labelCssText = this._makeLabelCssText(labelSize),
            additionalClass = ' tui-chart-xaxis-rotation tui-chart-xaxis-rotation' + this.boundsMaker.xAxisDegree,
            halfWidth = labelSize / 2,
            moveLeft = calculator.calculateAdjacent(this.boundsMaker.xAxisDegree, halfWidth),
            top = calculator.calculateOpposite(this.boundsMaker.xAxisDegree, halfWidth) +
                chartConst.XAXIS_LABEL_TOP_MARGIN,
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
                label: categories[index]
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
        var isRotationlessXAxis = !this.data.isVertical && this.data.isLabelAxis && this.options.rotation === false,
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
