/**
 * @fileoverview AxisView
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var View = require('./view.js'),
    axisTemplate = require('./axisTemplate.js');

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

        View.prototype.init.call(this);
    },

    /**
     * axis renderer
     * @param {{width: number, height: number}} size axis area size
     * @returns {element} axis area base element
     */
    render: function(size) {
        var elTickArea,
            width = this.model.isVertical ? size.height : size.width;

        elTickArea = this._renderTickArea(width);
        this.el.appendChild(elTickArea);
        this.addClass(this.el, this.model.isVertical ? 'vertical' : 'horizontal');
        this.renderSize(size);
        return this.el;
    },

    /**
     * tick area rendering
     * @param {number} width width or height
     * @returns {element} tick area element
     * @private
     */
    _renderTickArea: function(width) {
        var positions = this.model.makePixelPositions(width, this.model.tickCount),
            elTickArea = this.createElement('DIV', 'tick-area'),
            posType = this.model.isVertical ? 'bottom' : 'left',
            ticksHtml = ne.util.map(positions, function(position) {
                var value = [posType, ': ', position, 'px'].join('');
                return axisTemplate.TPL_AXIS_TICK({position: value});
            }).join('');
        
        elTickArea.innerHTML = ticksHtml;
        return elTickArea;
    }
});

module.exports = AxisView;