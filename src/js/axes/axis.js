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
     * Render axis area.
     * @param {HTMLElement} axisContainer axis area element
     * @param {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound axis bound
     * @param {object} data rendering data
     * @private
     */
    _renderAxisArea: function(axisContainer, bound, data) {
        var theme = this.theme,
            isVertical = !!data.isVertical,
            isPositionRight = !!data.isPositionRight,
            options = this.options,
            dimension = bound.dimension,
            size = isVertical ? dimension.height : dimension.width,
            elTitleArea = this._renderTitleArea({
                title: options.title,
                theme: theme.title,
                isVertical: isVertical,
                isPositionRight: isPositionRight,
                size: size
            }),
            elLabelArea = this._renderLabelArea(data, size, dimension.width, bound.degree),
            elTickArea;

        this.data = data;
        this.bound = bound;

        if (!isVertical || !data.aligned) {
            elTickArea = this._renderTickArea(size);
        }

        renderUtil.renderDimension(axisContainer, dimension);
        renderUtil.renderPosition(axisContainer, bound.position);
        dom.addClass(axisContainer, isVertical ? 'vertical' : 'horizontal');
        dom.addClass(axisContainer, isPositionRight ? 'right' : '');
        dom.append(axisContainer, [elTitleArea, elTickArea, elLabelArea]);
    },

    /**
     * Render axis component.
     * @param {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound axis bound
     * @param {object} data rendering data
     * @returns {HTMLElement} axis area base element
     */
    render: function(bound, data) {
        var el = dom.create('DIV', this.className);

        this._renderAxisArea(el, bound, data);
        this.axisContainer = el;
        return el;
    },

    /**
     * Rerender axis component.
     * @param {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound axis bound
     * @param {object} data rendering data
     */
    rerender: function(bound, data) {
        this.axisContainer.innerHTML = '';
        if (bound.dimension.width > 0) {
            if (data.options) {
                this.options = data.options;
            }
            this._renderAxisArea(this.axisContainer, bound, data);
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
            if (renderUtil.isIE7()) {
                cssTexts.push(renderUtil.concatStr('right:', '0px'));
            } else {
                cssTexts.push(renderUtil.concatStr('right:', -size, 'px'));
            }
            cssTexts.push('top:0px');
        } else {
            cssTexts.push('left:0px');
            if (!renderUtil.isOldBrowser()) {
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
                if (data.aligned && data.labels[index] === chartConst.EMPTY_AXIS_LABEL) {
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
     * Render label area.
     * @param {object} data rendering data
     * @param {number} size label area size
     * @param {number} axisWidth axis area width
     * @param {number} degree rotation degree
     * @returns {HTMLElement} label area element
     * @private
     */
    _renderLabelArea: function(data, size, axisWidth, degree) {
        var tickPixelPositions = calculator.makeTickPixelPositions(size, data.tickCount),
            labelSize = tickPixelPositions[1] - tickPixelPositions[0],
            posType = 'left',
            cssTexts = this._makeLabelCssTexts({
                isVertical: data.isVertical,
                isLabelAxis: data.isLabelAxis,
                labelSize: labelSize
            }),
            elLabelArea = dom.create('DIV', 'tui-chart-label-area'),
            areaCssText = renderUtil.makeFontCssText(this.theme.label),
            categories = data.labels,
            labelsHtml, titleAreaWidth;

        if (data.isVertical) {
            posType = data.isLabelAxis ? 'top' : 'bottom';
            titleAreaWidth = this._getRenderedTitleHeight() + chartConst.TITLE_AREA_WIDTH_PADDING;
            areaCssText += this._makeVerticalLabelCssText(axisWidth, titleAreaWidth);
        } else if (data.isLabelAxis && this.options.rotation === false) {
            categories = this.dataProcessor.getMultilineCategories();
        }

        tickPixelPositions.length = categories.length;
        labelsHtml = this._makeLabelsHtml({
            positions: tickPixelPositions,
            labels: categories,
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
     * Make cssTexts of label.
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
     * Calculate rotation moving position.
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
     * Calculate rotation moving position for ie8.
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
     * Make cssText for rotation moving.
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

        if (renderUtil.isOldBrowser()) {
            position = this._calculateRotationMovingPositionForIE8(params);
        } else {
            position = this._calculateRotationMovingPosition(params);
        }

        return renderUtil.concatStr('left:', position.left, 'px', ';top:', position.top, 'px');
    },

    /**
     * Make html of rotation labels.
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
            addClass = ' rotation rotation' + params.degree,
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
     * Make html of normal labels.
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
     * Make html of labels.
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
