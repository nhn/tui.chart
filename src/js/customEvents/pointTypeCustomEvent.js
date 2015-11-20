/**
 * @fileoverview PointTypeCustomEven is event handle layer for line type chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    CustomEventBase = require('./customEventBase');

var PointTypeCustomEven = tui.util.defineClass(CustomEventBase, /** @lends PointTypeCustomEven.prototype */ {
    /**
     * PointTypeCustomEven is event handle layer for line type chart.
     * @constructs PointTypeCustomEven
     * @extends CustomEventBase
     */
    init: function() {
        CustomEventBase.apply(this, arguments);
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
            groupIndex = this.tickBaseDataModel.findIndex(this.isVertical ? layerX : layerY),
            foundData = this.pointTypeDataModel.findData(groupIndex, layerX + chartConst.SERIES_EXPAND_SIZE, layerY);

        if (!this._isChanged(this.prevFoundData, foundData)) {
            return;
        }

        if (this.prevFoundData) {
            this.fire('hideTooltip', this.prevFoundData);
            delete this.prevFoundData;
        }

        if (foundData) {
            this.fire('showTooltip', foundData);
            this.prevFoundData = foundData;
        }
    },

    /**
     * On mouseout.
     * @param {MouseEvent} e mouse event object
     * @override
     */
    onMouseout: function() {
        if (this.prevFoundData) {
            this.fire('hideTooltip', this.prevFoundData);
            delete this.prevFoundData;
        }
    }
});

tui.util.CustomEvents.mixin(PointTypeCustomEven);

module.exports = PointTypeCustomEven;
