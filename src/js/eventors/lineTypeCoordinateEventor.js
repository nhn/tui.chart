/**
 * @fileoverview LineTypeCoordinateEventor is coordinate event controller for line type chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var CoordinateEventorBase = require('./coordinateEventorBase');

var LineTypeCoordinateEventor = ne.util.defineClass(CoordinateEventorBase, /** @lends LineTypeCoordinateEventor.prototype */ {
    /**
     * LineTypeCoordinateEventor is coordinate event controller for line type chart.
     * @constructs LineTypeCoordinateEventor
     * @extends LineTypeCoordinateEventor
     */
    init: function() {
        CoordinateEventorBase.apply(this, arguments);
    },

    /**
     * To make coordinate data.
     * @param {{width: number, height: number}} dimension dimension
     * @param {number} tickCount tick count
     * @returns {array.<{min: number, max: number}>} tick groups
     * @private
     */
    makeCoordinateData: function(dimension, tickCount) {
        return this.makeLineTypeCoordinateData(dimension.width, tickCount);
    },

    /**
     * On mousemove.
     * @param {MouseEvent} e mouse event obejct
     */
    onMousemove: function(e) {
        var elTarget = e.target || e.srcElement,
            bound = elTarget.getBoundingClientRect(),
            layerX = e.clientX - bound.left,
            layerY = e.clientY - bound.top,
            index = this.findIndex(layerX);
        this.fire('overTickSector', index, layerY);
    },

    /**
     * On mouseout.
     * @param {MouseEvent} e mouse event object
     */
    onMouseout: function() {
        this.fire('outTickSector');
    }
});

ne.util.CustomEvents.mixin(LineTypeCoordinateEventor);

module.exports = LineTypeCoordinateEventor;
