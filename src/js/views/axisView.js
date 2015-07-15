/**
 * @fileoverview  AxisView render axis ticks and labels.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var View = require('./view.js'),
    neConst = require('../const.js'),
    axisTemplate = require('./axisTemplate.js');

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
     * @param {{width: number, height: number}} size axis area size
     * @returns {element} axis area base element
     */
    render: function(size, titleAreaWidth) {
        var model = this.model,
            isVertical = model.isVertical,
            width = isVertical ? size.height : size.width,
            elTitleArea = this._renderTitleArea(model.title, model.titleFontSize, isVertical, width),
            elTickArea = this._renderTickArea(width),
            elLabelArea = this._renderLabelArea(width, size.width, titleAreaWidth);


        this.renderSize(size);

        this.addClass(this.el, this.model.isVertical ? 'vertical' : 'horizontal');

        this.el.appendChild(elTitleArea);
        this.el.appendChild(elTickArea);
        this.el.appendChild(elLabelArea);

        return this.el;
    },

    /**
     * Title Area renderer
     * @param {string} title axis title
     * @returns {element}
     * @private
     */
    _renderTitleArea: function(title, fontSize, isVertical, width) {
        var elTitleArea, titleWidth;

        if (!title) {
            return;
        }

        fontSize = fontSize || neConst.DEFAULT_TITLE_FONT_SIZE;

        elTitleArea = this.createElement('DIV', 'title-area');
        elTitleArea.innerHTML = title;
        elTitleArea.style.fontSize = fontSize + 'px';

        if (isVertical) {
            titleWidth = this.calculateRenderedLabelWidth(title, fontSize);
            console.log(titleWidth);
            elTitleArea.style.top = ((width - titleWidth) / 2) + 'px';
        }

        return elTitleArea;
    },

    /**
     * Tick area renderer
     * @param {number} width width or height
     * @returns {element} tick area element
     * @private
     */
    _renderTickArea: function(width) {
        var tickCount = this.model.tickCount,
            positions = this.model.makePixelPositions(width, tickCount),
            elTickArea = this.createElement('DIV', 'tick-area'),
            posType = this.model.isVertical ? 'bottom' : 'left',
            ticksHtml = ne.util.map(positions, function(position) {
                var cssPosition = [posType, ': ', position, 'px'].join('');
                return axisTemplate.TPL_AXIS_TICK({position: cssPosition});
            }).join('');

        elTickArea.innerHTML = ticksHtml;
        return elTickArea;
    },

    /**
     * Label area renderer
     * @param {number} width
     * @returns {element} label area element
     * @private
     */
    _renderLabelArea: function(width, axisWidth, titleAreaWidth) {
        var positions = this.model.makePixelPositions(width, this.model.tickCount),
            labelWidth = positions[1] - positions[0],
            labels = this.model.labels,
            isVertical = this.model.isVertical,
            isLabelAxis = this.model.isLabelAxis(),
            labelFontSize = this.model.labelFontSize,
            posType = isVertical ? 'bottom' : 'left',
            cssTexts = this._makeLabelCssTexts(isVertical, isLabelAxis, labelFontSize, labelWidth),
            elLabelArea = this.createElement('DIV', 'label-area'),
            labelsHtml;

        positions.length = labels.length;
        labelsHtml = this._makeLabelsHtml(positions, labels, posType, cssTexts);
        elLabelArea.innerHTML = labelsHtml;

        if (isVertical) {
            elLabelArea.style.width = (axisWidth - titleAreaWidth) + 'px';
        }
        this._changeLabelAreaPosition(elLabelArea, isVertical, isLabelAxis, labelFontSize, labelWidth);

        return elLabelArea;
    },

    /**
     * Makes label css array
     * @param {boolean} isVertical is vertical
     * @param {boolean} isLabelAxis is label axis
     * @param {number} labelFontSize label font size
     * @param {number} labelWidth label width or height
     * @returns {array}
     * @private
     */
    _makeLabelCssTexts: function(isVertical, isLabelAxis, labelFontSize, labelWidth) {
        var cssTexts = [['font-size:', labelFontSize, 'px'].join('')];

        if (isVertical && isLabelAxis) {
            cssTexts.push(['height:', labelWidth, 'px'].join(''));
            cssTexts.push(['line-height:', labelWidth, 'px'].join(''));
        } else if (!isVertical) {
            cssTexts.push(['width:', labelWidth, 'px'].join(''));
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

                labelCssTexts.push([posType, ':', position, 'px'].join(''));

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
     * @param {number} labelFontSize label font size
     * @param {number} labelWidth label width or height
     * @private
     */
    _changeLabelAreaPosition: function(elLabelArea, isVertical, isLabelAxis, labelFontSize, labelWidth) {
        if (isLabelAxis) {
            return;
        }

        if (isVertical) {
            elLabelArea.style.top = [parseInt((labelFontSize + 3) / 2, 10), 'px'].join('');
        } else if (!isLabelAxis) {
            elLabelArea.style.left = ['-', parseInt(labelWidth / 2, 10), 'px'].join('');
        }
    }
});

module.exports = AxisView;