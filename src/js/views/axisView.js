/**
 * @fileoverview  AxisView render axis ticks and labels.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var View = require('./view.js'),
    axisTemplate = require('./axisTemplate.js');

/**
 * @classdesc AxisView render axis ticks and labels.
 * @class
 * @augments View
 */
var AxisView = ne.util.defineClass(View, {
    /**
     * constructor
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
     * axis renderer
     * @param {{width: number, height: number}} size axis area size
     * @returns {element} axis area base element
     */
    render: function(size) {
        var width = this.model.isVertical ? size.height : size.width,
            width = this.model.isVertical ? size.height : size.width,
            elTickArea = this._renderTickArea(width),
            elLabelArea = this._renderLabelArea(width);

        this.renderSize(size);
        this.addClass(this.el, this.model.isVertical ? 'vertical' : 'horizontal');

        this.el.appendChild(elTickArea);
        this.el.appendChild(elLabelArea);

        return this.el;
    },

    /**
     * tick area renderer
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
     * label area renderer
     * @param {number} width
     * @returns {element} label area element
     * @private
     */
    _renderLabelArea: function(width) {
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
        this._changeLabelAreaPosition(elLabelArea, isVertical, isLabelAxis, labelFontSize, labelWidth);

        return elLabelArea;
    },

    /**
     * makes label css array
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
     * makes label html
     * @param {array} positions label position array
     * @param {array} labels label array
     * @param {string} posType position type (left or bottom)
     * @param {array} cssTexts css array
     * @returns {string}
     * @private
     */
    _makeLabelsHtml: function(positions, labels, posType, cssTexts) {
        var labelsHtml = ne.util.map(positions,  function(position, index) {
                var labelCssTexts = cssTexts.slice();
                labelCssTexts.push([posType, ':', position, 'px'].join(''))
                return axisTemplate.TPL_AXIS_LABEL({cssText: labelCssTexts.join(';'), label: labels[index]});
            }, this).join('');

        return labelsHtml;
    },

    /**
     * change label area position
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
            elLabelArea.style.top = (labelFontSize + 3) / 2 + 'px';
        } else if (!isLabelAxis) {
            elLabelArea.style.left = - (labelWidth / 2) + 'px';
        }
    }
});

module.exports = AxisView;