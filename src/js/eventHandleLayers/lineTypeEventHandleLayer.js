/**
 * @fileoverview LineTypeEventHandleLayer is event handle layer for line type chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var EventHandleLayerBase = require('./eventHandleLayerBase');

var LineTypeEventHandleLayer = tui.util.defineClass(EventHandleLayerBase, /** @lends LineTypeEventHandleLayer.prototype */ {
    /**
     * LineTypeEventHandleLayer is event handle layer for line type chart.
     * @constructs LineTypeEventHandleLayer
     * @extends LineTypeEventHandleLayer
     */
    init: function() {
        EventHandleLayerBase.apply(this, arguments);
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
     * @param {MouseEvent} e mouse event object
     * @override
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
     * @override
     */
    onMouseout: function() {
        this.fire('outTickSector');
    }
});

tui.util.CustomEvents.mixin(LineTypeEventHandleLayer);

module.exports = LineTypeEventHandleLayer;
