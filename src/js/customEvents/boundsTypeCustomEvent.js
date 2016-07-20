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
        this.history = [-1];

        /**
         * button for history back
         * @type {null | HTMLElement}
         */
        this.historyBackBtn = null;
    },

    /**
     * On mousemove.
     * @param {MouseEvent} e - mouse event
     * @private
     * @override
     */
    _onMousemove: function(e) {
        var target = e.target || e.srcElement;
        var foundData = this._findDataFromBoundsCoordinateModel(target, e.clientX, e.clientY);

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
     * History back.
     * @private
     */
    _historyBack: function() {
        var index = this.history[this.history.length - 2];

        this.history.pop();
        this.fire('zoom', index);

        if (this.history.length === 1) {
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
        var foundData;

        if (!predicate.isTreemapChart(this.chartType)) {
            return;
        }

        if (dom.hasClass(target, chartConst.CLASS_NAME_RESET_ZOOM_BTN)) {
            this._historyBack();
            this.fire('hideTooltip', this.prevFoundData);
            return;
        }

        foundData = this._findDataFromBoundsCoordinateModel(target, e.clientX, e.clientY);

        if (foundData) {
            this.fire('zoom', foundData.indexes.index);
        }
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
    },

    /**
     * On after zoom.
     * @param {number} index - index of target seriesItem
     */
    onAfterZoom: function(index) {
        this.fire('hideTooltip', this.prevFoundData);

        if (!this.historyBackBtn) {
            this.historyBackBtn = dom.create('DIV', chartConst.CLASS_NAME_RESET_ZOOM_BTN);
            this.historyBackBtn.innerHTML = '< Back';
            dom.append(this.customEventContainer, this.historyBackBtn);
        }

        if (this.history[this.history.length - 1] !== index) {
            this.history.push(index);
        }
    }
});

module.exports = BoundsTypeCustomEvent;
