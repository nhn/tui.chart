/**
 * @fileoverview  AxisView render axis ticks and labels.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var dom = require('./domHandler.js'),
    View = require('./view.js'),
    chartConst = require('../const.js'),
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
     */
    init: function(model) {
        /**
         * Axis model
         * @type {Object}
         */
        this.model = model;

        /**
         * Axis view className
         */
        this.className =  'axis-area';

        View.call(this);
    },

    /**
     * Axis renderer
     * @param {{width: number, height: number, top: number, right: number}} dimension axis area dimension
     * @returns {element} axis area base element
     */
    render: function(bound) {
        var model = this.model,
            isVertical = model.isVertical,
            dimension = bound.dimension,
            size = isVertical ? dimension.height : dimension.width,
            elTitleArea = this._renderTitleArea(model.title, model.titleOptions, isVertical, size),
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
     * @param {number} fontSize font size
     * @param {boolean} isVertical is vertical?
     * @param {number} size (width or height)
     * @returns {element}
     * @private
     */
    _renderTitleArea: function(title, options, isVertical, size) {
        var elTitleArea = this.renderTitle(title, options, 'title-area'),
            cssTexts = [];

        if (!elTitleArea) {
            return;
        }

        if (isVertical) {
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
     * @returns {element} tick area element
     * @private
     */
    _renderTickArea: function(size) {
        var model = this.model,
            tickCount = model.tickCount,
            tickColor = model.tickColor,
            positions = model.makePixelPositions(size, tickCount),
            elTickArea = dom.createElement('DIV', 'tick-area'),
            isVertical = model.isVertical,
            posType = isVertical ? 'bottom' : 'left',
            ticksHtml = ne.util.map(positions, function(position) {
                var cssText = [
                    this.concatStr('background-color:', tickColor),
                    this.concatStr(posType, ': ', position, 'px')
                ].join(';');
                return axisTemplate.TPL_AXIS_TICK({cssText: cssText});
            }, this).join('');

        elTickArea.innerHTML = ticksHtml;

        this._renderTickBorderColor(elTickArea, tickColor, isVertical);

        return elTickArea;
    },

    /**
     * Render tick border color.
     * @param {element} elTickArea tick area element
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
     * @params {number} axisWidth axis area width
     * @returns {element}
     * @private
     */
    _renderLabelArea: function(size, axisWidth) {
        var model = this.model,
            positions = model.makePixelPositions(size, model.tickCount),
            labelWidth = positions[1] - positions[0],
            labels = model.labels,
            isVertical = model.isVertical,
            isLabelAxis = model.isLabelAxis(),
            labelOptions = model.labelOptions,
            posType = isVertical ? (model.isLabelAxis() ? 'top' : 'bottom') : 'left',
            cssTexts = this._makeLabelCssTexts(isVertical, isLabelAxis, labelWidth),
            elLabelArea = dom.createElement('DIV', 'label-area'),
            labelsHtml, titleAreaWidth, areaCssText;

        positions.length = labels.length;
        labelsHtml = this._makeLabelsHtml(positions, labels, posType, cssTexts);
        elLabelArea.innerHTML = labelsHtml;
        areaCssText = this.makeFontCssText(labelOptions);

        if (isVertical) {
            titleAreaWidth = this._getRenderedTitleHeight() + TITLE_AREA_WIDTH_PADDING;
            areaCssText += ';width:' + (axisWidth - titleAreaWidth + V_LABEL_RIGHT_PADDING) + 'px';
        }

        elLabelArea.style.cssText = areaCssText;
        this._changeLabelAreaPosition(elLabelArea, isVertical, isLabelAxis, labelOptions, labelWidth);

        return elLabelArea;
    },

    /**
     * Get title area height;
     * @returns {number}
     * @private
     */
    _getRenderedTitleHeight: function() {
        var title = this.model.title,
            options = this.model.titleOptions,
            result = title ? this.getRenderedLabelHeight(title, options) : 0;
        return result;
    },

    /**
     * Makes label css array
     * @param {boolean} isVertical Is vertical?
     * @param {boolean} isLabelAxis Is label axis?
     * @param {number} labelWidth label width or height
     * @returns {array}
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
     * @returns {string}
     * @private
     */
    _makeLabelsHtml: function(positions, labels, posType, cssTexts) {
        var labelsHtml = ne.util.map(positions,  function(position, index) {
                var labelCssTexts = cssTexts.slice(),
                    html;

                labelCssTexts.push(this.concatStr(posType, ':', position, 'px'));

                html = axisTemplate.TPL_AXIS_LABEL({
                    cssText: labelCssTexts.join(';'),
                    label: labels[index]
                });
                return html;
            }, this).join('');

        return labelsHtml;
    },

    /**
     * Change label area position
     * @param {element} elLabelArea label area element
     * @param {boolean} isVertical is vertical
     * @param {boolean} isLabelAxis is label axis
     * @param {{fontSize: number, fontFamily: string, color: string}} options label options
     * @param {number} labelWidth label width or height
     * @private
     */
    _changeLabelAreaPosition: function(elLabelArea, isVertical, isLabelAxis, options, labelWidth) {
        var labelHeight;

        if (isLabelAxis) {
            return;
        }

        if (isVertical) {
            labelHeight = this.getRenderedLabelHeight('ABC', options);
            elLabelArea.style.top = this.concatStr(parseInt(labelHeight / 2, 10), 'px');
        } else {
            elLabelArea.style.left = this.concatStr('-', parseInt(labelWidth / 2, 10), 'px');
        }
    },

    /**
     * Get Vertical Axis Area Width
     * @returns {number}
     */
    getVAxisAreaWidth: function() {
        var titleAreaWidth = this._getRenderedTitleHeight() + TITLE_AREA_WIDTH_PADDING,
            width = this.getRenderedLabelsMaxWidth(this.model.labels, this.model.labelOptions) + titleAreaWidth;
        return width;
    },

    /**
     * Get Horizontal Axis Area Height
     * @returns {number}
     */
    getHAxisAreaHeight: function() {
        var titleAreaHeight = this._getRenderedTitleHeight() + TITLE_AREA_HEIGHT_PADDING,
            height = this.getRenderedLabelsMaxHeight(this.model.labels, this.model.labelOptions) + titleAreaHeight;
        return height;
    }
});

module.exports = AxisView;