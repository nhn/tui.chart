/**
 * @fileoverview  AxisView render axis ticks and labels.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var dom = require('./domHandler.js'),
    View = require('./view.js'),
    axisTemplate = require('./axisTemplate.js');

var TITLE_AREA_WIDTH_PADDING = 20,
    TITLE_AREA_HEIGHT_PADDING = 20,
    V_LABEL_RIGHT_PADDING = 10;

/**
 * @classdesc AxisView render axis ticks and labels.
 * @class
 * @augments View
 */
var AxisView = ne.util.defineClass(View, {
    /**
     * Constructor
     * @param {object} model axis model
     * @param {object} theme axis theme
     */
    init: function(model, theme) {
        /**
         * Axis model
         * @type {Object}
         */
        this.model = model;

        this.theme = theme;

        /**
         * Axis view className
         */
        this.className = 'ne-chart-axis-area';

        View.call(this);
    },

    /**
     * Axis renderer
     * @param {{width: number, height: number, top: number, right: number}} bound axis area dimension
     * @returns {HTMLElement} axis area base element
     */
    render: function(bound) {
        var model = this.model,
            theme = this.theme,
            isVertical = model.isVertical,
            dimension = bound.dimension,
            size = isVertical ? dimension.height : dimension.width,
            elTitleArea = this._renderTitleArea(model.title, theme.title, isVertical, size),
            elTickArea = this._renderTickArea(size),
            elLabelArea = this._renderLabelArea(size, dimension.width);

        this.renderDimension(dimension);
        this.renderPosition(bound.position);
        dom.addClass(this.el, this.model.isVertical ? 'vertical' : 'horizontal');
        this.append(elTitleArea);
        this.append(elTickArea);
        this.append(elLabelArea);

        return this.el;
    },

    /**
     * Title area renderer
     * @param {string} title axis title
     * @param {obejct} theme title theme
     * @param {boolean} isVertical is vertical?
     * @param {number} size (width or height)
     * @returns {HTMLElement} title element
     * @private
     */
    _renderTitleArea: function(title, theme, isVertical, size) {
        var elTitleArea = this.renderTitle(title, theme, 'ne-chart-title-area'),
            cssTexts = [];

        if (elTitleArea && isVertical) {
            cssTexts = [
                this.concatStr('width:', size, 'px'),
                this.concatStr('left:', 0, 'px')
            ];
            if (!this.isIE8()) {
                cssTexts.push(this.concatStr('top:', size, 'px'));
            }
            elTitleArea.style.cssText += ';' + cssTexts.join(';');
        }
        return elTitleArea;
    },

    /**
     * Tick area renderer
     * @param {number} size size or height
     * @returns {HTMLElement} tick area element
     * @private
     */
    _renderTickArea: function(size) {
        var model = this.model,
            tickCount = model.tickCount,
            tickColor = this.theme.tickColor,
            positions = model.makePixelPositions(size, tickCount),
            elTickArea = dom.createElement('DIV', 'ne-chart-tick-area'),
            isVertical = model.isVertical,
            posType = isVertical ? 'bottom' : 'left',
            template = axisTemplate.TPL_AXIS_TICK,
            ticksHtml = ne.util.map(positions, function(position) {
                var cssText = [
                    this.concatStr('background-color:', tickColor),
                    this.concatStr(posType, ': ', position, 'px')
                ].join(';');
                return template({cssText: cssText});
            }, this).join('');

        elTickArea.innerHTML = ticksHtml;

        this._renderTickBorderColor(elTickArea, tickColor, isVertical);

        return elTickArea;
    },

    /**
     * Render tick border color.
     * @param {HTMLElement} elTickArea tick area element
     * @param {string} tickColor tick color
     * @param {boolean} isVertical Is vertical?
     * @private
     */
    _renderTickBorderColor: function(elTickArea, tickColor, isVertical) {
        if (isVertical) {
            elTickArea.style.borderRightColor = tickColor;
        } else {
            elTickArea.style.borderTopColor = tickColor;
        }
    },

    /**
     * Label area renderer
     * @param {number} size label area size
     * @param {number} axisWidth axis area width
     * @returns {HTMLElement} label area element
     * @private
     */
    _renderLabelArea: function(size, axisWidth) {
        var model = this.model,
            theme = this.theme,
            positions = model.makePixelPositions(size, model.tickCount),
            labelWidth = positions[1] - positions[0],
            labels = model.labels,
            isVertical = model.isVertical,
            isLabelAxis = model.isLabelAxis(),
            posType = isVertical ? (model.isLabelAxis() ? 'top' : 'bottom') : 'left',
            cssTexts = this._makeLabelCssTexts(isVertical, isLabelAxis, labelWidth),
            elLabelArea = dom.createElement('DIV', 'ne-chart-label-area'),
            labelsHtml, titleAreaWidth, areaCssText;

        positions.length = labels.length;
        labelsHtml = this._makeLabelsHtml(positions, labels, posType, cssTexts);
        elLabelArea.innerHTML = labelsHtml;
        areaCssText = this.makeFontCssText(theme.label);

        if (isVertical) {
            titleAreaWidth = this._getRenderedTitleHeight() + TITLE_AREA_WIDTH_PADDING;
            areaCssText += ';width:' + (axisWidth - titleAreaWidth + V_LABEL_RIGHT_PADDING) + 'px';
        }

        elLabelArea.style.cssText = areaCssText;
        this._changeLabelAreaPosition(elLabelArea, isVertical, isLabelAxis, theme.label, labelWidth);

        return elLabelArea;
    },

    /**
     * Get title area height;
     * @returns {number} height
     * @private
     */
    _getRenderedTitleHeight: function() {
        var title = this.model.title,
            theme = this.theme.title,
            result = title ? this.getRenderedLabelHeight(title, theme) : 0;
        return result;
    },

    /**
     * Makes label css array
     * @param {boolean} isVertical Is vertical?
     * @param {boolean} isLabelAxis Is label axis?
     * @param {number} labelWidth label width or height
     * @returns {array} cssTexts
     * @private
     */
    _makeLabelCssTexts: function(isVertical, isLabelAxis, labelWidth) {
        var cssTexts = [];

        if (isVertical && isLabelAxis) {
            cssTexts.push(this.concatStr('height:', labelWidth, 'px'));
            cssTexts.push(this.concatStr('line-height:', labelWidth, 'px'));
        } else if (!isVertical) {
            cssTexts.push(this.concatStr('width:', labelWidth, 'px'));
        }

        return cssTexts;
    },

    /**
     * Makes label html
     * @param {array} positions label position array
     * @param {array} labels label array
     * @param {string} posType position type (left or bottom)
     * @param {array} cssTexts css array
     * @returns {string} html
     * @private
     */
    _makeLabelsHtml: function(positions, labels, posType, cssTexts) {
        var template = axisTemplate.TPL_AXIS_LABEL,
            labelsHtml = ne.util.map(positions, function(position, index) {
                var labelCssTexts = cssTexts.slice(),
                    html;

                labelCssTexts.push(this.concatStr(posType, ':', position, 'px'));
                html = template({
                    cssText: labelCssTexts.join(';'),
                    label: labels[index]
                });
                return html;
            }, this).join('');

        return labelsHtml;
    },

    /**
     * Change label area position
     * @param {HTMLElement} elLabelArea label area element
     * @param {boolean} isVertical is vertical
     * @param {boolean} isLabelAxis is label axis
     * @param {{fontSize: number, fontFamily: string, color: string}} theme label theme
     * @param {number} labelWidth label width or height
     * @private
     */
    _changeLabelAreaPosition: function(elLabelArea, isVertical, isLabelAxis, theme, labelWidth) {
        var labelHeight;

        if (isLabelAxis) {
            return;
        }

        if (isVertical) {
            labelHeight = this.getRenderedLabelHeight('ABC', theme);
            elLabelArea.style.top = this.concatStr(parseInt(labelHeight / 2, 10), 'px');
        } else {
            elLabelArea.style.left = this.concatStr('-', parseInt(labelWidth / 2, 10), 'px');
        }
    },

    /**
     * Get Vertical Axis Area Width
     * @returns {number} width
     */
    getVAxisAreaWidth: function() {
        var titleAreaWidth = this._getRenderedTitleHeight() + TITLE_AREA_WIDTH_PADDING,
            width = this.getRenderedLabelsMaxWidth(this.model.labels, this.theme.label) + titleAreaWidth;
        return width;
    },

    /**
     * Get Horizontal Axis Area Height
     * @returns {number} height
     */
    getHAxisAreaHeight: function() {
        var titleAreaHeight = this._getRenderedTitleHeight() + TITLE_AREA_HEIGHT_PADDING,
            height = this.getRenderedLabelsMaxHeight(this.model.labels, this.theme.label) + titleAreaHeight;
        return height;
    }
});

module.exports = AxisView;