/**
 * @fileoverview AreaTypeCustomEvent is event handle layer for line type chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var CustomEventBase = require('./customEventBase'),
    AreaTypeDataModel = require('./areaTypeDataModel'),
    chartConst = require('../const');

var AreaTypeCustomEvent = tui.util.defineClass(CustomEventBase, /** @lends AreaTypeCustomEvent.prototype */ {
    /**
     * AreaTypeCustomEvent is custom event for line type chart.
     * @param {object} params parameters
     * @constructs AreaTypeCustomEvent
     * @extends CustomEventBase
     */
    init: function(params) {
        CustomEventBase.call(this, params);
    },

    /**
     * Initialize data of custom event
     * @param {array.<object>} seriesInfos series infos
     */
    initCustomEventData: function(seriesInfos) {
        var seriesInfo = seriesInfos[0];
        this.dataModel = new AreaTypeDataModel(seriesInfo);
        CustomEventBase.prototype.initCustomEventData.call(this, seriesInfos);
    },

    /**
     * On mousemove.
     * @param {MouseEvent} e mouse event object
     * @override
     */
    onMousemove: function(e) {
        var elTarget = e.target || e.srcElement,
            bound = elTarget.getBoundingClientRect(),
            layerX = e.clientX - chartConst.SERIES_EXPAND_SIZE - bound.left,
            layerY = e.clientY - bound.top,
            groupIndex = this.tickBaseDataModel.findIndex(layerX),
            foundData = this.dataModel.findData(groupIndex, layerY);

        if (!this._isChanged(this.prevFoundData, foundData)) {
            return;
        }

        if (foundData) {
            this.fire('showTooltip', foundData);
            this.prevFoundData = foundData;
        } else if (this.prevFoundData) {
            this.fire('hideTooltip', this.prevFoundData);
            delete this.prevFoundData;
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

tui.util.CustomEvents.mixin(AreaTypeCustomEvent);

module.exports = AreaTypeCustomEvent;
