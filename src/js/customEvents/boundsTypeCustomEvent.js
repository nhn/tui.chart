/**
 * @fileoverview BoundsTypeCustomEvent is event handle layer for bounds.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var CustomEventBase = require('./customEventBase');
var chartConst = require('../const');
var predicate = require('../helpers/predicate');
var dom = require('../helpers/domHandler');

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

        /**
         * history array for treemap chart.
         * @type {number}
         */
        this.zoomHistory = [-1];

        /**
         * button for zoom history back
         * @type {null | HTMLElement}
         */
        this.historyBackBtn = null;
    },

    /**
     * Hide tooltip.
     * @private
     */
    _hideTooltip: function() {
        this.fire('hideTooltip', this.prevFoundData);
        this.prevFoundData = null;
    },

    /**
     * On mousemove.
     * @param {MouseEvent} e - mouse event
     * @private
     * @override
     */
    _onMousemove: function(e) {
        var foundData = this._findDataFromBoundsCoordinateModel(this.customEventContainer, e.clientX, e.clientY);

        if (!this._isChangedSelectData(this.prevFoundData, foundData)) {
            return;
        }

        if (this.prevFoundData) {
            this._hideTooltip();
        }

        if (foundData) {
            this.fire('showTooltip', foundData);
        }

        this.prevFoundData = foundData;
    },

    /**
     * Zoom history back.
     * @private
     */
    _zoomHistoryBack: function() {
        var index = this.zoomHistory[this.zoomHistory.length - 2];

        this.zoomHistory.pop();
        this.fire('zoom', index);

        if (this.zoomHistory.length === 1) {
            this.customEventContainer.removeChild(this.historyBackBtn);
            this.historyBackBtn = null;
        }
    },

    /**
     * On mousemove.
     * @param {MouseEvent} e - mouse event
     * @private
     * @override
     */
    _onClick: function(e) {
        var target = e.target || e.srcElement;
        var foundData, seriesItem;

        if (!predicate.isTreemapChart(this.chartType)) {
            return;
        }

        if (dom.hasClass(target, chartConst.CLASS_NAME_RESET_ZOOM_BTN)) {
            this._hideTooltip();
            this._zoomHistoryBack();
            return;
        }

        foundData = this._findDataFromBoundsCoordinateModel(target, e.clientX, e.clientY);

        if (foundData) {
            seriesItem = this.dataProcessor.getSeriesDataModel('treemap').getSeriesItem(foundData.indexes.groupIndex, foundData.indexes.index, true);

            if (seriesItem.isLeaf) {
                return;
            }

            this._hideTooltip();
            this.fire('zoom', foundData.indexes.index);
        }
    },

    /**
     * On mouseout.
     * @override
     */
    _onMouseout: function(e) {
        var bound = this.customEventContainer.getBoundingClientRect();
        if ((bound.left <= e.clientX) && (bound.top <= e.clientY)) {
            return;
        }
        if (this.prevFoundData) {
            this._hideTooltip();
        }
    },

    /**
     * On after zoom.
     * @param {number} index - index of target seriesItem
     */
    onAfterZoom: function(index) {
        if (!this.historyBackBtn) {
            this.historyBackBtn = dom.create('DIV', chartConst.CLASS_NAME_RESET_ZOOM_BTN);
            this.historyBackBtn.innerHTML = '< Back';
            dom.append(this.customEventContainer, this.historyBackBtn);
        }

        if (this.zoomHistory[this.zoomHistory.length - 1] !== index) {
            this.zoomHistory.push(index);
        }
    }
});

module.exports = BoundsTypeCustomEvent;
