/**
 * @fileoverview GroupTypeCustomEvent is event handle layer for grouped tooltip option.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var CustomEventBase = require('./customEventBase'),
    chartConst = require('../const');

var GroupTypeCustomEvent = tui.util.defineClass(CustomEventBase, /** @lends GroupTypeCustomEvent.prototype */ {
    /**
     * GroupTypeCustomEvent is event handle layer for grouped tooltip option.
     * @constructs GroupTypeCustomEvent
     * @extends CustomEventBase
     */
    init: function() {
        CustomEventBase.apply(this, arguments);
    },

    /**
     * Whether out position or not.
     * @param {number} layerX layerX
     * @param {number} layerY layerY
     * @returns {boolean} result boolean
     * @private
     */
    _isOutPosition: function(layerX, layerY) {
        var dimension = this.dimension;
        return layerX < 0 || layerX > dimension.width || layerY < 0 || layerY > dimension.height;
    },

    /**
     * On mousemove.
     * @param {MouseEvent} e mouse event object
     * @private
     * @override
     */
    _onMousemove: function(e) {
        var elTarget = e.target || e.srcElement,
            bound = elTarget.getBoundingClientRect(),
            layerX = e.clientX - chartConst.SERIES_EXPAND_SIZE - bound.left,
            layerY = e.clientY - chartConst.SERIES_EXPAND_SIZE - bound.top,
            index = -1;

        if (!this._isOutPosition(layerX, layerY)) {
            index = this.tickBaseDataModel.findIndex(this.isVertical ? layerX : layerY);
        }

        if (index === -1) {
            this._onMouseout();
        } else if (this.prevIndex !== index) {
            this.prevIndex = index;
            this.fire('showGroupTooltip', {
                index: index,
                range: this.tickBaseDataModel.makeRange(index, this.chartType),
                size: this.dimension[this.isVertical ? 'height' : 'width'],
                isVertical: this.isVertical
            });
        }
    },

    /**
     * On mouseout.
     * @param {MouseEvent} e mouse event object
     * @override
     */
    _onMouseout: function() {
        if (!tui.util.isUndefined(this.prevIndex)) {
            this.fire('hideGroupTooltip', this.prevIndex);
            delete this.prevIndex;
        }
    }
});

module.exports = GroupTypeCustomEvent;
