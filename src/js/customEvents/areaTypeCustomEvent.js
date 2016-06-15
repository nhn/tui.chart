/**
 * @fileoverview AreaTypeCustomEvent is event handle layer for line type chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var CustomEventBase = require('./customEventBase');
var zoomMixer = require('./zoomMixer');
var AreaTypeDataModel = require('./areaTypeDataModel');

var AreaTypeCustomEvent = tui.util.defineClass(CustomEventBase, /** @lends AreaTypeCustomEvent.prototype */ {
    /**
     * AreaTypeCustomEvent is custom event for line type chart.
     * @param {object} params parameters
     * @constructs AreaTypeCustomEvent
     * @extends CustomEventBase
     */
    init: function(params) {
        CustomEventBase.call(this, params);

        /**
         * previous found data
         * @type {null | object}
         */
        this.prevFoundData = null;

        this._initForZoom(params.zoomable);
    },

    /**
     * Initialize data of custom event
     * @param {Array.<object>} seriesInfos series infos
     * @override
     */
    initCustomEventData: function(seriesInfos) {
        var seriesInfo = seriesInfos[0];

        this.dataModel = new AreaTypeDataModel(seriesInfo);
        CustomEventBase.prototype.initCustomEventData.call(this, seriesInfos);

        this._showTooltipAfterZoom();
    },

    /**
     * Find data by client position.
     * @param {number} clientX - clientX
     * @param {number} clientY - clientY
     * @returns {object}
     * @private
     */
    _findData: function(clientX, clientY) {
        var layerPosition = this._calculateLayerPosition(clientX, clientY);
        var groupIndex = this.tickBaseCoordinateModel.findIndex(layerPosition.x);

        return this.dataModel.findData(groupIndex, layerPosition.y);
    },

    /**
     * Get first model data.
     * @param {number} index - index
     * @returns {object}
     * @private
     */
    _getFirstData: function(index) {
        return this.dataModel.getFirstData(index);
    },

    /**
     * Get last model data.
     * @param {number} index - index
     * @returns {object}
     * @private
     */
    _getLastData: function(index) {
        return this.dataModel.getLastData(index);
    },

    /**
     * Show tooltip.
     * @param {object} foundData - model data
     * @private
     */
    _showTooltip: function(foundData) {
        this.fire('showTooltip', foundData);
    },

    /**
     * Hide tooltip.
     * @private
     */
    _hideTooltip: function() {
        this.fire('hideTooltip', this.prevFoundData);
    },

    /**
     * On mousemove.
     * @param {MouseEvent} e - mouse event
     * @private
     * @override
     */
    _onMousemove: function(e) {
        var foundData;

        if (this._isAfterDragMouseup() || !this._isChangedSelectData(this.prevFoundData, foundData)) {
            return;
        }

        foundData = this._findData(e.clientX, e.clientY);

        if (foundData) {
            this._showTooltip(foundData);
        } else if (this.prevFoundData) {
            this._hideTooltip();
        }

        this.prevFoundData = foundData;
    },

    /**
     * On mouseout.
     * @private
     * @override
     */
    _onMouseout: function() {
        if (this.prevFoundData) {
            this._hideTooltip();
            this.prevFoundData = null;
        }
    }
});

zoomMixer.mixin(AreaTypeCustomEvent);

module.exports = AreaTypeCustomEvent;
