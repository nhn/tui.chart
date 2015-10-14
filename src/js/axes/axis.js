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

var DEGREE_CANDIDATES = [25, 24, 65, 85];

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
            labels = data.labels,
            elTickArea = dom.create('DIV', 'ne-chart-tick-area'),
            posType = data.isVertical ? 'bottom' : 'left',
            borderColorType = data.isVertical ? (data.isPositionRight ? 'borderLeftColor' : 'borderRightColor') : 'borderTopColor',
            template = axisTemplate.TPL_AXIS_TICK,
            ticksHtml = ne.util.map(positions, function(position, index) {
                var cssText;
                if (labels[index] === chartConst.EMPTY_AXIS_LABEL) {
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

    _makeVerticalLabelCssText: function(axisWidth, titleAreaWidth) {
        return ';width:' + (axisWidth - titleAreaWidth + chartConst.V_LABEL_RIGHT_PADDING) + 'px';
    },

    /**
     * Render label area.
     * @param {number} size label area size
     * @param {number} axisWidth axis area width
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
            elLabelArea = dom.create('DIV', 'ne-chart-label-area'),
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

    _makeRotationMoveCssText: function(degree, width, left) {
        var moveLeft = (Math.cos(degree * chartConst.RAD) * width / 2),
            top = (Math.sin(degree * chartConst.RAD) * width / 2) + 10;

        return renderUtil.concatStr('left:', left - moveLeft, 'px', ';top:', top, 'px');
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
                    label = params.labels[index],
                    addClass = '',
                    rotationCssText, html;

                if (params.degree) {
                    addClass = ' rotation' + params.degree;
                    rotationCssText = this._makeRotationMoveCssText(params.degree, params.labelSize, position);
                    labelCssTexts.push(rotationCssText);
                } else {
                    labelCssTexts.push(renderUtil.concatStr(params.posType, ':', position, 'px'));
                }
                html = template({
                    addClass: addClass,
                    cssText: labelCssTexts.join(';'),
                    label: label
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
