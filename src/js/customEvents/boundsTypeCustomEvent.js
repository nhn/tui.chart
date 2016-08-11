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
        this.styleCursor(false);
    },

    /**
     * Style css cursor.
     * @param {boolean} hasChild - whether has child or not
     */
    styleCursor: function(hasChild) {
        var container = this.customEventContainer;
        if (hasChild) {
            container.style.cursor = 'pointer';
        } else {
            container.style.cursor = 'default';
        }
    },

    /**
     * On mousemove.
     * @param {MouseEvent} e - mouse event
     * @private
     * @override
     */
    _onMousemove: function(e) {
        var foundData = this._findDataFromBoundsCoordinateModel(this.customEventContainer, e.clientX, e.clientY);
        var seriesItem;

        if (!this._isChangedSelectData(this.prevFoundData, foundData)) {
            return;
        }

        if (this.prevFoundData) {
            this._hideTooltip();
        }

        this.prevFoundData = foundData;

        if (!foundData) {
            return;
        }

        if (predicate.isTreemapChart(this.chartType)) {
            seriesItem = this._getSeriesItemByIndexes(foundData.indexes);
            this.styleCursor(seriesItem.hasChild);
        }

        this.fire('showTooltip', foundData);
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
     * Get seriesItem by indexes
     * @param {{groupIndex: number, index: number}} indexes - indexes
     * @returns {SeriesItem}
     * @private
     */
    _getSeriesItemByIndexes: function(indexes) {
        var seriesDataModel = this.dataProcessor.getSeriesDataModel(chartConst.CHART_TYPE_TREEMAP);

        return seriesDataModel.getSeriesItem(indexes.groupIndex, indexes.index, true);
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

        CustomEventBase.prototype._onClick.call(this, e);

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
            seriesItem = this._getSeriesItemByIndexes(foundData.indexes);

            if (!seriesItem.hasChild) {
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
        var bound = this._getContainerBound();
        var clientX = e.clientX;
        var clientY = e.clientY;

        if ((bound.left <= clientX) && (bound.top <= clientY) &&
            (bound.right >= clientX) && (bound.bottom >= clientY)) {
            return;
        }

        if (this.prevFoundData) {
            this._hideTooltip();
        }

        CustomEventBase.prototype._onMouseout.call(this);
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
