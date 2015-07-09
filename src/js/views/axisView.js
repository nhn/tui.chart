/**
 * @fileoverview AxisView
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var View = require('./view.js'),
    axisTemplate = require('./axisTemplate.js')

var AxisView = ne.util.defineClass(View, {
    className: 'axis-area',
    /**
     * constructor
     * @param {object} model axis model instance
     */
    init: function(model) {
        this.model = model;
        View.prototype.init.call(this);
    },

    /**
     * axis renderer
     * @param {number} width axis area width
     * @param {number} height axis area height
     * @returns {element} axis area base element
     */
    render: function(width, height) {
        var elTickArea,
            size = this.model.isVertical ? height : width;

        elTickArea = this._renderTickArea(size);
        this.el.appendChild(elTickArea);
        this.addClass(this.el, this.model.isVertical ? 'vertical' : 'horizontal');
        this._renderSize(width, height);
        return this.el;
    },

    /**
     * size rendering
     * @param {number} width axis area width
     * @param {number} height axis area height
     * @private
     */
    _renderSize: function(width, height) {
        this.el.style.cssText = [
            ['width:', width, 'px'].join(''),
            ['height:', height, 'px'].join(''),
        ].join(';');
    },

    /**
     * tick area rendering
     * @param {number} size width or height
     * @returns {element} tick area element
     * @private
     */
    _renderTickArea: function(size) {
        var positions = this.model.makeTickPixelPositions(size),
            elTickArea = this.createElement('DIV', 'tick-area'),
            posType = this.model.isVertical ? 'top' : 'left',
            ticksHtml = ne.util.map(positions, function(position) {
                var value = [posType, ': ', position, 'px'].join('');
                return axisTemplate.TPL_AXIS_TICK({position: value});
            }).join('');

        elTickArea.innerHTML = ticksHtml;

        return elTickArea;
    }
});

module.exports = AxisView;