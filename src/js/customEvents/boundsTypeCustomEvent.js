/**
 * @fileoverview BoundsTypeCustomEvent is event handle layer for bounds.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    CustomEventBase = require('./customEventBase');

var BoundsTypeCustomEvent = tui.util.defineClass(CustomEventBase, /** @lends BoundsTypeCustomEvent.prototype */ {
    /**
     * BoundsTypeCustomEvent is event handle layer for line type chart.
     * @constructs BoundsTypeCustomEvent
     * @extends CustomEventBase
     */
    init: function() {
        CustomEventBase.apply(this, arguments);

        /**
         * previous found data
         * @type {null | object}
         */
        this.prevFoundData = null;
    },

    /**
     * On mousemove.
     * @param {MouseEvent} e - mouse event
     * @private
     * @override
     */
    _onMousemove: function(e) {
        var target = e.target || e.srcElement;
        var clientX = e.clientX - chartConst.SERIES_EXPAND_SIZE;
        var clientY = e.clientY - chartConst.SERIES_EXPAND_SIZE;
        var foundData = this._findDataFromBoundsCoordinateModel(target, clientX, clientY);

        if (!this._isChangedSelectData(this.prevFoundData, foundData)) {
            return;
        }

        if (this.prevFoundData) {
            this.fire('hideTooltip', this.prevFoundData);
        }

        if (foundData) {
            this.fire('showTooltip', foundData);
        }

        this.prevFoundData = foundData;
    },

    /**
     * On mouseout.
     * @override
     */
    _onMouseout: function() {
        if (this.prevFoundData) {
            this.fire('hideTooltip', this.prevFoundData);
            this.prevFoundData = null;
        }
    }
});

module.exports = BoundsTypeCustomEvent;
